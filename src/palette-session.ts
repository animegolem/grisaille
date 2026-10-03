import { decodePaletteArtifact, type PaletteArtifact, type PaletteRoles, type VerifiedPair } from './palette-contract';
import type { PaletteSource, PaletteSourceConfiguration } from './palette-file';

type Immutable<T> = T extends object ? { readonly [K in keyof T]: Immutable<T[K]> } : T;
export type PaletteAttempt = Immutable<PaletteArtifact>;
export type UsablePalette = PaletteAttempt & { readonly roles: Immutable<PaletteRoles>; readonly verified_pairs: readonly Immutable<VerifiedPair>[] };
export type PaletteContext = Readonly<{
  state: 'waiting' | 'disconnected' | 'stopped' | 'unresolved' | 'playing' | 'paused';
  uri: string | null;
  queueId: number | null;
}>;
export type PaletteSnapshot = Readonly<{
  active: boolean;
  sourcePath: string | null;
  monitoring: 'inactive' | 'disabled' | 'watching' | 'recovering';
  context: PaletteContext;
  /** Last decoded producer attempt; preserved across unreadable/invalid files. */
  latestAttempt: PaletteAttempt | null;
  /** Latest readable, valid artifact, including a candidate for another URI. */
  candidate: PaletteAttempt | null;
  /** Last usable bundle accepted for an observed URI, with its original envelope. */
  retained: UsablePalette | null;
  attemptAssociation: 'unavailable' | 'unknown' | 'other-uri' | 'current-uri';
  bundleAssociation: 'default' | 'retained' | 'current-uri';
  diagnostics: Readonly<{ configuration: string; read: string; watch: string; warnings: readonly string[] }>;
}>;
const waiting: PaletteContext = Object.freeze({ state: 'waiting', uri: null, queueId: null });
const messageOf = (error: unknown) => error instanceof Error ? error.message : String(error);
function freeze<T>(value: T): Immutable<T> {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value as Immutable<T>;
}
function usable(artifact: PaletteAttempt): artifact is UsablePalette {
  return artifact.status !== 'failed' && artifact.roles !== undefined;
}

/** Read-only consumer: URI association is not playback-occurrence/current-art proof. */
export class PaletteSession {
  private state: PaletteSnapshot;
  private listeners = new Set<() => void>();
  private source?: PaletteSource;
  private generation = 0;
  private revision = 0;
  private unwatch?: () => void;
  private task?: { generation: number; dirty: boolean };
  private decoded?: { raw: string; artifact: PaletteAttempt | null; error: string; warnings: readonly string[] };

  constructor(configuration: PaletteSourceConfiguration = {}) {
    this.source = configuration.source;
    this.state = freeze({ active: false, sourcePath: this.source?.path ?? null, monitoring: 'inactive',
      context: waiting, latestAttempt: null, candidate: null, retained: null,
      attemptAssociation: 'unavailable', bundleAssociation: 'default',
      diagnostics: { configuration: configuration.diagnostic ?? '', read: '', watch: '', warnings: [] } });
  }
  getState = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };

  start = () => {
    if (this.state.active) return;
    const generation = ++this.generation;
    const current = () => this.state.active && generation === this.generation;
    this.publish({ active: true, candidate: null, monitoring: this.source ? 'watching' : 'disabled' });
    if (!this.source || !current()) return;
    // Watch the parent before reading; attachment recovery also invalidates the file.
    try {
      const unwatch = this.source.watch(event => {
        if (!current()) return;
        if (event.kind === 'error') {
          this.revision++;
          this.publish({ monitoring: 'recovering' }, { watch: event.message });
        } else {
          if (event.kind === 'ready') this.publish({ monitoring: 'watching' }, { watch: '' });
          if (current()) this.invalidate();
        }
      });
      if (current()) this.unwatch = unwatch; else unwatch();
    } catch (error) {
      if (current()) this.publish({ monitoring: 'recovering' }, { watch: messageOf(error) });
    }
    if (current()) this.invalidate();
  };
  stop = () => {
    if (!this.state.active) return;
    this.generation++; this.revision++;
    const unwatch = this.unwatch;
    this.unwatch = undefined; this.task = undefined;
    this.publish({ active: false, monitoring: 'inactive', candidate: null, context: waiting });
    unwatch?.();
  };
  setContext = (context: PaletteContext) => {
    const previous = this.state.context;
    if (previous.state === context.state && previous.uri === context.uri && previous.queueId === context.queueId) return;
    this.revision++;
    this.publish({ context: freeze({ ...context }) });
    if (this.state.active) this.invalidate();
  };

  private publish(patch: Partial<PaletteSnapshot>, problems: Partial<PaletteSnapshot['diagnostics']> = {}) {
    const previous = this.state;
    const diagnostics = { ...previous.diagnostics, ...problems };
    const next = { ...previous, ...patch, diagnostics };
    const uri = next.active && (next.context.state === 'playing' || next.context.state === 'paused') ? next.context.uri : null;
    const candidate = next.candidate;
    next.attemptAssociation = !uri || !candidate ? 'unavailable'
      : candidate.track.file === null ? 'unknown' : candidate.track.file === uri ? 'current-uri' : 'other-uri';
    if (next.attemptAssociation === 'current-uri' && candidate && usable(candidate)) next.retained = candidate;
    next.bundleAssociation = !next.retained ? 'default'
      : next.attemptAssociation === 'current-uri' && next.retained === candidate ? 'current-uri' : 'retained';
    const sameDiagnostics = diagnostics.configuration === previous.diagnostics.configuration && diagnostics.read === previous.diagnostics.read
      && diagnostics.watch === previous.diagnostics.watch && diagnostics.warnings === previous.diagnostics.warnings;
    if (sameDiagnostics) next.diagnostics = previous.diagnostics;
    if ((Object.keys(next) as (keyof PaletteSnapshot)[]).every(key => next[key] === previous[key])) return;
    this.state = freeze(next);
    for (const listener of this.listeners) listener();
  }
  private invalidate() {
    if (!this.state.active || !this.source) return;
    this.revision++;
    if (this.task) { this.task.dirty = true; return; }
    const task = { generation: this.generation, dirty: true };
    this.task = task;
    void this.read(task);
  }
  private async read(task: { generation: number; dirty: boolean }) {
    const current = () => this.state.active && task.generation === this.generation;
    try {
      while (current() && task.dirty) {
        task.dirty = false;
        const revision = this.revision;
        let raw: string;
        try { raw = await this.source!.read(); }
        catch (error) {
          if (current() && revision === this.revision) this.publish({ candidate: null }, { read: messageOf(error) });
          continue;
        }
        if (!current() || revision !== this.revision) continue;
        if (!this.decoded || this.decoded.raw !== raw) {
          // Collect warnings in the snapshot. No external logger runs inside validation.
          const result = decodePaletteArtifact(raw, () => {});
          this.decoded = result.ok
            ? { raw, artifact: freeze(result.artifact), error: '', warnings: freeze(result.warnings) }
            : { raw, artifact: null, error: result.error, warnings: freeze([]) };
        }
        const { artifact, error, warnings } = this.decoded;
        this.publish({ candidate: artifact, ...(artifact ? { latestAttempt: artifact } : {}) }, { read: error, warnings });
      }
    } finally {
      // An old lifecycle's completion must never clear a restarted session's task.
      if (this.task === task) this.task = undefined;
    }
  }
}
