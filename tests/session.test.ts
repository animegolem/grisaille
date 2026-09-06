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
