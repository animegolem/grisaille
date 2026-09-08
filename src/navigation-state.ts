import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { BrowserPosition, BrowserTrail, HistoryState, Place, QueueIdentity, Route, Viewport } from './history';
import { albumOrders, artistOrders, type LibraryOrder } from './library-order';

export type NavigationState = { version: 1; history: HistoryState; order: LibraryOrder; libraryView: 'covers' | 'artists' };
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid saved position');
  return value as Record<string, unknown>;
};
function text(value: unknown): string {
  if (typeof value !== 'string' || value.length > 16_384) throw new Error('Invalid saved location');
  return value;
}
function number(value: unknown, integer = true): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 2_000_000_000 || (integer && !Number.isInteger(value))) throw new Error('Invalid saved position');
  return value;
}
function queue(value: unknown): QueueIdentity | undefined {
  if (value === undefined) return;
  const data = object(value); return { uri: text(data.uri), occurrence: number(data.occurrence) };
}
function position(value: unknown): BrowserPosition {
  const data = object(value);
  let viewport: Viewport | undefined;
  if (data.viewport !== undefined) {
    const view = object(data.viewport);
    if (view.kind !== 'list') throw new Error('Unknown saved viewport');
    viewport = { kind: 'list', index: number(view.index), offset: number(view.offset, false), anchor: view.anchor === undefined ? undefined : text(view.anchor), queue: queue(view.queue) };
  }
  return { selection: number(data.selection), selected: data.selected === undefined ? undefined : text(data.selected), viewport };
}
function place(value: unknown): Place {
  const data = object(value), page = object(data.route);
  let route: Route;
  if (page.page === 'queue') route = { page: 'queue' };
  else if (page.page === 'lyrics') route = { page: 'lyrics' };
  else if (page.page === 'library' && (page.mode === 'covers' || page.mode === 'artists')) route = { page: 'library', mode: page.mode };
  else if (page.page === 'artist') route = { page: 'artist', name: text(page.name) };
  else if (page.page === 'record') route = { page: 'record', key: text(page.key), artist: page.artist === undefined ? undefined : text(page.artist) };
  else throw new Error('Unknown saved page');
  let browser: BrowserTrail | undefined;
  if (data.browser !== undefined) {
    const trail = object(data.browser);
    browser = {
      artists: trail.artists === undefined ? undefined : position(trail.artists),
      albums: trail.albums === undefined ? undefined : { ...position(trail.albums), artist: text(object(trail.albums).artist) },
      tracks: trail.tracks === undefined ? undefined : { ...position(trail.tracks), album: text(object(trail.tracks).album) },
    };
  }
  return { route, ...position(data), queue: queue(data.queue), browser };
}
export function parseNavigationState(value: unknown): NavigationState {
  const data = object(value), history = object(data.history), order = object(data.order);
  if (data.version !== 1 || !Array.isArray(history.entries) || history.entries.length < 1 || history.entries.length > 200) throw new Error('Unsupported saved navigation');
  const cursor = number(history.cursor);
  if (cursor >= history.entries.length || !albumOrders.some(o => o.value === order.albums) || !albumOrders.some(o => o.value === order.artistAlbums) || !artistOrders.some(o => o.value === order.artists) || (data.libraryView !== 'covers' && data.libraryView !== 'artists')) throw new Error('Invalid saved navigation');
  return { version: 1, history: { entries: history.entries.map(place), cursor }, order: { albums: order.albums, artistAlbums: order.artistAlbums, artists: order.artists } as LibraryOrder, libraryView: data.libraryView };
}
export function navigationStatePath(mode: 'demo' | 'mpd', renderer: 'gui' | 'tui', directory = process.env.MUSIC_UI_STATE_DIR || join(homedir(), 'Library', 'Application Support', 'Music Prototype', 'state')) {
  const host = (process.env.MPD_HOST || '127.0.0.1').replace(/^[^@]*@/, '');
  const endpoint = mode === 'demo' ? 'sample' : host.startsWith('/') ? host : `${host}:${process.env.MPD_PORT || '6600'}`;
  const key = createHash('sha256').update(endpoint).digest('hex').slice(0, 16);
  return join(directory, `${mode}-${renderer}-${key}.json`);
}

/** A replaceable browsing snapshot, separate from the append-only navigation journal. */
export class NavigationStateStore {
  error?: string;
  private timer?: ReturnType<typeof setTimeout>;
  private provider?: () => NavigationState | undefined;
  private last = '';
  private listeners = new Set<() => void>();
  constructor(readonly path: string) {}
  getError = () => this.error;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private report(error?: string) { if (error !== this.error) { this.error = error; for (const listener of this.listeners) listener(); } }
  read(): NavigationState | undefined {
    if (!existsSync(this.path)) return;
    try {
      if (statSync(this.path).size > 2 * 1024 * 1024) throw new Error('Saved navigation is too large');
      const saved = parseNavigationState(JSON.parse(readFileSync(this.path, 'utf8')));
      this.last = JSON.stringify(saved); return saved;
    } catch { this.report('Saved position could not be read; starting with Now playing.'); }
  }
  attach(provider: () => NavigationState | undefined) {
    this.provider = provider;
    process.once('exit', this.flush);
    return this.detach;
  }
  detach = () => { this.flush(); this.provider = undefined; process.off('exit', this.flush); };
  schedule = () => {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.flush, 180); this.timer.unref?.();
  };
  flush = () => {
    clearTimeout(this.timer); this.timer = undefined;
    let temporary: string | undefined;
    try {
      const state = this.provider?.();
      if (!state) return;
      const json = JSON.stringify(state);
      if (json === this.last) return;
      const directory = join(this.path, '..');
      mkdirSync(directory, { recursive: true, mode: 0o700 });
      temporary = `${this.path}.${process.pid}.${randomUUID()}.tmp`;
      writeFileSync(temporary, json + '\n', { mode: 0o600, flag: 'wx' });
      renameSync(temporary, this.path); temporary = undefined;
      this.last = json; this.report();
    } catch { this.report('Could not save your browsing position.'); }
    finally { if (temporary) { try { rmSync(temporary, { force: true }); } catch { /* An interrupted write must not prevent exit. */ } } }
  };
}
