import { statSync, watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, normalize } from 'node:path';

export type PaletteSourceEvent = { kind: 'change' } | { kind: 'ready' } | { kind: 'error'; message: string };

export interface PaletteSource {
  readonly path: string;
  read(): Promise<string>;
  watch(listener: (event: PaletteSourceEvent) => void): () => void;
}

export type PaletteSourceConfiguration = { source?: PaletteSource; diagnostic?: string };

export interface PaletteDirectoryWatcher {
  on(event: 'error', listener: (error: Error) => void): unknown;
  on(event: 'close', listener: () => void): unknown;
  close(): void;
  unref?(): void;
}

export interface PaletteRetryTimer { unref?(): void }

/** Read-only filesystem and clock boundaries, injectable without a live source. */
export interface PaletteFileDependencies {
  read(path: string): Promise<string>;
  directoryIdentity(path: string): string;
  watchDirectory(path: string, changed: () => void): PaletteDirectoryWatcher;
  setTimeout(callback: () => void, delay: number): PaletteRetryTimer;
  clearTimeout(timer: PaletteRetryTimer): void;
}

const defaults: PaletteFileDependencies = {
  read: path => readFile(path, 'utf8'),
  directoryIdentity: path => {
    const stat = statSync(path, { bigint: true });
    if (!stat.isDirectory()) throw new Error('Palette parent is not a directory.');
    return `${stat.dev}:${stat.ino}`;
  },
  watchDirectory: (path, changed) => watch(path, changed),
  setTimeout: (callback, delay) => setTimeout(callback, delay),
  clearTimeout: timer => clearTimeout(timer as ReturnType<typeof setTimeout>),
};

const retryDelays = [1000, 2000, 4000, 8000, 10000] as const;
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

/** Each subscription owns its watcher and one cancellable recovery timer. */
export class FilePaletteSource implements PaletteSource {
  readonly path: string;
  private readonly io: PaletteFileDependencies;

  constructor(path: string, dependencies: Partial<PaletteFileDependencies> = {}) {
    if (!isAbsolute(path) || path.includes('\0')) throw new Error('Palette source path must be absolute and contain no NUL.');
    this.path = normalize(path);
    this.io = { ...defaults, ...dependencies };
  }

  read(): Promise<string> { return this.io.read(this.path); }

  watch(listener: (event: PaletteSourceEvent) => void): () => void {
    const parent = dirname(this.path);
    type Attachment = { identity: string; watcher?: PaletteDirectoryWatcher };
    let active = true;
    let attached: Attachment | undefined;
    let retry: { timer?: PaletteRetryTimer } | undefined;
    let backoff = 0;

    const close = (attachment: Attachment) => {
      // Detach the identity first: close can itself emit an event synchronously.
      const watcher = attachment.watcher;
      attachment.watcher = undefined;
      watcher?.close();
    };
    const stop = () => {
      if (!active) return;
      active = false;
      const old = attached;
      attached = undefined;
      if (old) close(old);
      const pending = retry;
      retry = undefined;
      if (pending?.timer) this.io.clearTimeout(pending.timer);
    };
    const emit = (event: PaletteSourceEvent) => {
      try { listener(event); }
      catch (error) {
        // A synchronous initial notification can throw before the caller receives
        // stop. Release resources, but keep the consumer exception distinguishable.
        stop();
        throw error;
      }
    };
    const schedule = () => {
      if (!active || retry) return;
      const pending: { timer?: PaletteRetryTimer } = {};
      retry = pending;
      const delay = retryDelays[backoff]!;
      backoff = Math.min(backoff + 1, retryDelays.length - 1);
      pending.timer = this.io.setTimeout(() => {
        if (!active || retry !== pending) return;
        retry = undefined;
        attach();
      }, delay);
      pending.timer.unref?.();
    };
    const failed = (attachment: Attachment, message: string) => {
      if (!active || attached !== attachment) return;
      attached = undefined;
      close(attachment);
      schedule();
      emit({ kind: 'error', message });
    };
    const checkIdentity = (attachment: Attachment): string | undefined => {
      try {
        if (this.io.directoryIdentity(parent) !== attachment.identity) return 'Palette directory was replaced; waiting to reattach.';
      } catch (error) {
        return `Palette directory is unavailable: ${errorMessage(error)}`;
      }
      return undefined;
    };
    const attach = () => {
      if (!active) return;
      const attachment: Attachment = { identity: '' };
      attached = attachment;
      try {
        attachment.identity = this.io.directoryIdentity(parent);
        attachment.watcher = this.io.watchDirectory(parent, () => {
          if (!active || attached !== attachment) return;
          const error = checkIdentity(attachment);
          if (error) { failed(attachment, error); return; }
          // Filenames are only hints (including null, duplicates and .tmp noise).
          // The session coalesces reads and checks the complete artifact.
          emit({ kind: 'change' });
        });
        // A synchronous watch callback may already have invalidated this attach.
        if (!active || attached !== attachment) { close(attachment); return; }
        attachment.watcher.on('error', error => failed(attachment, `Palette watcher failed: ${errorMessage(error)}`));
        attachment.watcher.on('close', () => failed(attachment, 'Palette watcher closed; waiting to reattach.'));
        attachment.watcher.unref?.();
        const error = checkIdentity(attachment);
        if (error) { failed(attachment, error); return; }
      } catch (error) {
        if (!active) throw error;
        failed(attachment, `Cannot watch palette directory: ${errorMessage(error)}`);
        return;
      }
      if (!active || attached !== attachment) return;
      backoff = 0;
      // Listener errors must not be mistaken for filesystem failures.
      emit({ kind: 'ready' });
    };

    attach();
    return stop;
  }
}

/** Discovery makes no filesystem calls. An explicit path is an operator binding. */
export function paletteSourceFromEnvironment(
  demo: boolean, env: Record<string, string | undefined> = process.env, home = homedir(),
): PaletteSourceConfiguration {
  if (demo) return {};
  const override = env.MUSIC_UI_PALETTE_PATH;
  if (override) {
    const path = override.startsWith('~/') ? join(home, override.slice(2)) : override;
    if (!isAbsolute(path) || path.includes('\0')) {
      return { diagnostic: 'Palette source disabled: MUSIC_UI_PALETTE_PATH must be an absolute path (or start with ~/), with no NUL.' };
    }
    return { source: new FilePaletteSource(path) };
  }
  // Match mpd.ts: split at the first @, default empty host/port, parse numeric port.
  // Credentials are not endpoint identity and are never included in diagnostics.
  let host = env.MPD_HOST || '127.0.0.1';
  const at = host.indexOf('@');
  if (at >= 0) host = host.slice(at + 1);
  if (host !== '127.0.0.1' || Number(env.MPD_PORT || 6600) !== 6600) {
    return { diagnostic: 'Palette source disabled: non-default MPD target has no bound palette source; set MUSIC_UI_PALETTE_PATH to opt in.' };
  }
  const config = env.XDG_CONFIG_HOME || join(home, '.config');
  if (!isAbsolute(config) || config.includes('\0')) {
    return { diagnostic: 'Palette source disabled: XDG_CONFIG_HOME (or the home directory fallback) must be absolute, with no NUL.' };
  }
  return { source: new FilePaletteSource(join(config, 'rmpc-auto-theme', 'palette', 'palette.json')) };
}
