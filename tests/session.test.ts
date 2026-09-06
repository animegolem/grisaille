import { expect, test } from 'bun:test';
import { DemoBackend } from '../src/demo';
import { MusicSession } from '../src/music-session';
import { albumPlace, resolvePlace } from '../src/locations';
import { albumsOf, artistsOf } from '../src/model';

test('shared session serializes actions, refreshes partial failures, and releases its event helper', async () => {
  const backend = new DemoBackend();
  let stopped = 0;
  const subscribe = backend.subscribe.bind(backend);
  backend.subscribe = callback => { const off = subscribe(callback); return () => { stopped++; off(); }; };
  const session = new MusicSession(backend); session.start();
  try {
    await session.refresh();
    const order: string[] = [];
    const first = session.act(async () => { order.push('start'); await Bun.sleep(10); await backend.remove(2); order.push('end'); throw new Error('Partially applied'); });
    const second = session.act(async () => { order.push('next'); expect(session.getState().snapshot.queue.some(t => t.queueId === 2)).toBe(false); });
    await Promise.all([first, second]);
    expect(order).toEqual(['start', 'end', 'next']);
    await session.act(async () => { throw new Error('Disconnected'); });
    expect(session.getState().actionProblem).toBe('Disconnected');
    session.stop(); session.stop();
    let afterStop = false;
    await session.act(async () => { afterStop = true; });
    expect(afterStop).toBe(false);
    expect(stopped).toBe(1);
  } finally { session.stop(); }
});

test('shared location resolution survives changed queue IDs and missing library destinations', async () => {
  const backend = new DemoBackend();
  const tracks = await backend.library(); const albums = albumsOf(tracks); const artists = artistsOf(albums);
  const queue = (await backend.snapshot()).queue;
  const point = { route: { page: 'queue' as const }, selection: 5, selected: 'queue:5', viewport: { kind: 'list' as const, index: 3, offset: 0, anchor: 'queue:3' } };
  const restored = resolvePlace(point, { albums, artists, queue: queue.filter(t => t.queueId !== 2) });
  expect(restored.selection).toBe(3);
  expect(restored.viewport).toMatchObject({ index: 1, anchor: 'queue:3' });
  const missing = resolvePlace({ route: { page: 'record', key: 'removed' }, selection: 0 }, { albums, artists, queue });
  expect(missing.route).toEqual({ page: 'library', mode: 'covers' });
  const record = albums.find(a => a.title === 'Loveless')!;
  const parent = artists.find(a => a.name === record.artist)!;
  expect(albumPlace(record, record.tracks[7], parent)).toMatchObject({ selection: 7, route: { artist: parent.name } });
});

test('MPD connection state changes on failed snapshot reads and clears on recovery', async () => {
  const backend = new DemoBackend();
  const snapshot = backend.snapshot.bind(backend);
  const session = new MusicSession(backend); session.start();
  try {
    await session.refresh();
    expect(session.getState().connection).toBe('connected');
    backend.snapshot = async () => { throw new Error('Connection refused'); };
    await session.refresh();
    expect(session.getState().connection).toBe('down');
    backend.snapshot = snapshot;
    await session.refresh();
    expect(session.getState().connection).toBe('connected');
    expect(session.getState().problem).toBe('');
  } finally { session.stop(); }
});

async function until(check: () => boolean) {
  const deadline = Date.now() + 1500;
  while (!check()) { if (Date.now() > deadline) throw new Error('Recovery did not complete'); await Bun.sleep(5); }
}
test('an unavailable server recovers without another event and reloads changes missed while disconnected', async () => {
  const backend = new DemoBackend();
  const library = backend.library.bind(backend), snapshot = backend.snapshot.bind(backend);
  let online = false, libraryReads = 0, trimmed = false;
  backend.subscribe = () => () => {}; // No server event will rescue a missed reconnect.
  backend.library = async () => { libraryReads++; if (!online) throw new Error('Offline'); return (await library()).filter((_, i) => !trimmed || i > 0); };
  backend.snapshot = async () => { if (!online) throw new Error('Offline'); return snapshot(); };
  const session = new MusicSession(backend, 10); session.start();
  try {
    await session.refresh(); await session.reloadLibrary();
    expect(session.getState()).toMatchObject({ connection: 'down', libraryReady: false, snapshotReady: false });
    online = true;
    await until(() => session.getState().connection === 'connected' && session.getState().libraryReady);
    const before = session.getState();
    online = false; await session.refresh();
    expect(session.getState().library).toBe(before.library);
    expect(session.getState().snapshot).toBe(before.snapshot);
    const priorReads = libraryReads;
    trimmed = true; online = true;
    await until(() => session.getState().connection === 'connected' && session.getState().library.length === before.library.length - 1);
    expect(libraryReads).toBeGreaterThan(priorReads);
    expect(session.getState()).toMatchObject({ problem: '', libraryProblem: '' });
  } finally { session.stop(); }
});

test('library reads retry independently and stopping cancels pending recovery', async () => {
  const backend = new DemoBackend(), read = backend.library.bind(backend);
  backend.subscribe = () => () => {};
  let available = false, reads = 0;
  backend.library = async () => { reads++; if (!available) throw new Error('Library unavailable'); return read(); };
  const session = new MusicSession(backend, 10); session.start();
  try {
    await session.refresh(); await session.reloadLibrary();
    expect(session.getState().connection).toBe('connected');
    expect(session.getState().libraryProblem).toBe('Library unavailable');
    available = true;
    await until(() => session.getState().libraryReady);
    expect(session.getState().libraryProblem).toBe('');
    available = false; await session.reloadLibrary(); session.stop();
    const stoppedAt = reads;
    await Bun.sleep(60);
    expect(reads).toBe(stoppedAt);
  } finally { session.stop(); }
});
