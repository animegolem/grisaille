import { isAbsolute, join, normalize } from 'node:path';
import { appendFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { FilePaletteSource, type PaletteSourceConfiguration, type PaletteSourceEvent } from './palette-file';

/** Probe-only trace lives below the watched directory, avoiding self-invalidation. */
class ProbePaletteSource extends FilePaletteSource {
  constructor(private readonly directory: string) { super(join(directory, 'palette.json')); }
  private trace(event: Record<string, unknown>) {
    const diagnostic = join(this.directory, 'diagnostics');
    mkdirSync(diagnostic, { recursive: true, mode: 0o700 });
    appendFileSync(join(diagnostic, 'source.jsonl'), JSON.stringify({ observedAtMs: Date.now(), ...event }) + '\n', { mode: 0o600 });
  }
  override watch(listener: (event: PaletteSourceEvent) => void) {
    this.trace({ operation: 'watch' });
    return super.watch(event => { this.trace({ operation: 'notification', event }); listener(event); });
  }
  override async read() {
    this.trace({ operation: 'read-start' });
    try {
      const raw = await super.read();
      this.trace({ operation: 'read-complete', sha256: createHash('sha256').update(raw).digest('hex') });
      return raw;
    } catch (error) {
      this.trace({ operation: 'read-error', message: String(error) });
      throw error;
    }
  }
}

export type DemoPaletteProbeConfiguration = Readonly<{
  directory: string;
  paletteSource: PaletteSourceConfiguration;
  navigationStateDirectory: string;
  navigationLogDirectory: string;
}>;

/** Explicit fixture injection only; no discovery, filesystem reads or environment writes. */
export function demoPaletteProbeConfiguration(
  args: readonly string[] = process.argv,
  env: Record<string, string | undefined> = process.env,
): DemoPaletteProbeConfiguration | undefined {
  if (!args.includes('--theme-probe')) return;
  if (!args.includes('--demo')) throw new Error('Theme probe refused: --theme-probe requires --demo.');
  const directory = env.MUSIC_UI_THEME_PROBE_DIR;
  if (!directory || !isAbsolute(directory) || directory.includes('\0')) {
    throw new Error('Theme probe refused: MUSIC_UI_THEME_PROBE_DIR must be an explicit absolute path with no NUL.');
  }
  const root = normalize(directory);
  return Object.freeze({
    directory: root,
    paletteSource: Object.freeze({ source: new ProbePaletteSource(root) }),
    navigationStateDirectory: join(root, 'state'),
    navigationLogDirectory: join(root, 'navigation'),
  });
}

/** Actual-host diagnostic only, after the renderer dispatches a native event. */
export function nativeProbeObserver(config: DemoPaletteProbeConfiguration | undefined) {
  if (!config) return;
  mkdirSync(config.directory, { recursive: true, mode: 0o700 });
  const path = join(config.directory, 'native-events.jsonl');
  return (event: { eventType: string; elementId: number; value?: string; key?: string; keyChar?: string; x?: number; y?: number }) => {
    if (!['change', 'focus', 'blur', 'submit', 'mouseDown', 'mouseDownOutside', 'click', 'keyDown', 'keyUp'].includes(event.eventType)) return;
    const observedAtMs = performance.timeOrigin + performance.now();
    appendFileSync(path, JSON.stringify({ observedAtMs, eventType: event.eventType, elementId: event.elementId,
      ...(event.value === undefined ? {} : { value: event.value }), key: event.key, keyChar: event.keyChar, x: event.x, y: event.y }) + '\n', { mode: 0o600 });
  };
}
