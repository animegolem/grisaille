import { describe, expect, test } from 'bun:test';
import { createServer } from 'node:net';
import { albumsOf, artistsOf, moveQueue, searchLibrary } from '../src/model';
import { DemoBackend } from '../src/demo';
import { parseLibrary, parseQueue, quote, request } from '../src/mpd';

describe('music identity and search', () => {
  test('an album and a track with the same name both appear', async () => {
    const library = await new DemoBackend().library();
    const matches = searchLibrary('Love Ire & Song', albumsOf(library), library);
    expect(matches.some(r => r.kind === 'album' && r.album.title === 'Love Ire & Song')).toBe(true);
    expect(matches.some(r => r.kind === 'track' && r.track.title === 'Love Ire & Song')).toBe(true);
  });
  test('an artist result opens a discography without duplicating albums per track', async () => {
    const library = await new DemoBackend().library();
    const albums = albumsOf(library);
    const artist = artistsOf(albums).find(a => a.name === 'My Bloody Valentine')!;
    expect(artist.albums.map(a => a.title)).toEqual(["Isn't Anything", 'Loveless', 'm b v']);
    expect(artist.albums.flatMap(a => a.tracks).length).toBe(library.filter(t => t.artist === artist.name).length);
    const matches = searchLibrary(artist.name, albums, library);
    expect(matches[0]?.kind).toBe('artist');
    expect(matches.some(r => r.kind === 'album')).toBe(true);
  });
  test('moving a duplicate queue occurrence preserves the other occurrence', () => {
    const queue = [{ queueId: 1, uri: 'same.mp3' }, { queueId: 2, uri: 'other.mp3' }, { queueId: 3, uri: 'same.mp3' }];
    const moved = moveQueue(queue, 3, 1);
    expect(moved.map(t => t.queueId)).toEqual([3, 1, 2]);
    expect(queue.map(t => t.queueId)).toEqual([1, 2, 3]);
  });
  test('a stale destination does not silently remove a song', () => {
    const queue = [{ queueId: 1 }, { queueId: 2 }];
    expect(moveQueue(queue, 1, 999)).toBe(queue);
  });
  test('reordering leaves the playing occurrence unchanged', async () => {
    const backend = new DemoBackend();
    const before = await backend.snapshot();
    await backend.move(before.currentId!, null);
    const after = await backend.snapshot();
    expect(after.currentId).toBe(before.currentId);
    expect(after.queue.at(-1)?.queueId).toBe(before.currentId);
    expect(after.state).toBe(before.state);
  });
});

describe('MPD boundaries', () => {
  test('quoting preserves path content and rejects command injection', () => {
    expect(quote('Artist/"title"\\track.mp3')).toBe('"Artist/\\"title\\"\\\\track.mp3"');
    expect(() => quote('track.mp3\nclear')).toThrow();
    expect(() => quote('track\0.mp3')).toThrow();
  });
  test('queue IDs distinguish duplicate paths and metadata can contain colons', () => {
    const queue = parseQueue('file: same.mp3\nTitle: Act II: Return\nId: 8\nPos: 0\nTime: 120\nfile: same.mp3\nTitle: Act II: Return\nId: 19\nPos: 1\nduration: 120.3\n');
    expect(queue.map(t => t.queueId)).toEqual([8, 19]);
    expect(queue[0]?.title).toBe('Act II: Return');
    expect(queue[1]?.duration).toBe(120.3);
  });
  test('library parsing preserves Unicode and duration without shell evaluation', () => {
    const fields = ['a/$(touch nope).mp3', 'Björk', 'Début', 'Human Behaviour', '4:12', '1993', '1/11'];
    const tracks = parseLibrary(fields.join('\u001f') + '\n');
    expect(tracks[0]?.uri).toBe(fields[0]);
    expect(tracks[0]?.duration).toBe(252);
    expect(tracks[0]?.number).toBe(1);
  });
  test('text transport handles fragmented greeting, Unicode and terminator', async () => {
    const oldHost = process.env.MPD_HOST, oldPort = process.env.MPD_PORT, oldPassword = process.env.MPD_PASSWORD;
    const server = createServer(socket => {
      socket.write('OK M');
      setTimeout(() => socket.write('PD 0.24.0\n'), 2);
      socket.once('data', input => {
        expect(input.toString()).toBe('status\n');
        const response = Buffer.from('state: pause\nname: Björk\nOK\n');
        socket.write(response.subarray(0, 25));
        setTimeout(() => socket.write(response.subarray(25, response.length - 1)), 2);
        setTimeout(() => socket.write('\n'), 4);
      });
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test listener');
    process.env.MPD_HOST = '127.0.0.1'; process.env.MPD_PORT = String(address.port); delete process.env.MPD_PASSWORD;
    try { expect(await request('status')).toBe('state: pause\nname: Björk\n'); }
    finally {
      if (oldHost === undefined) delete process.env.MPD_HOST; else process.env.MPD_HOST = oldHost;
      if (oldPort === undefined) delete process.env.MPD_PORT; else process.env.MPD_PORT = oldPort;
      if (oldPassword === undefined) delete process.env.MPD_PASSWORD; else process.env.MPD_PASSWORD = oldPassword;
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });
});
