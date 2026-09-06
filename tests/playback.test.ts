import { expect, test } from 'bun:test';
import { createServer } from 'node:net';
import { albumsOf, artistsOf, type Track } from '../src/model';
import { DemoBackend } from '../src/demo';
import { artworkDataUri, MpdBackend, requestMany } from '../src/mpd';

const track: Track = { uri: 'Compilation/CD 1/02.flac', title: 'Song', artist: 'First artist', albumArtist: 'Various artists', album: 'Collection', year: '2000', number: 2, disc: 1, duration: 120 };

test('artwork rejects mpc status output so folder covers can be tried', () => {
  expect(artworkDataUri(Buffer.from('Artist - Song\n[playing] #2/12 0:33/2:13\n'))).toBeUndefined();
  expect(artworkDataUri(Buffer.alloc(0))).toBeUndefined();
  expect(artworkDataUri(Buffer.from('ffd8ffe0', 'hex'))).toStartWith('data:image/jpeg;');
  expect(artworkDataUri(Buffer.from('89504e470d0a1a0a', 'hex'))).toStartWith('data:image/png;');
});

test('compilations group across conventional disc folders and sort disc before track', () => {
  const secondDisc = { ...track, uri: 'Compilation/CD 2/01.flac', artist: 'Second artist', disc: 2, number: 1 };
  const first = { ...track, uri: 'Compilation/CD 1/01.flac', number: 1 };
  const albums = albumsOf([secondDisc, track, first]);
  expect(albums).toHaveLength(1);
  expect(albums[0]!.tracks.map(t => t.uri)).toEqual([first.uri, track.uri, secondDisc.uri]);
  expect(albums[0]!.artist).toBe('Various artists');
  expect(artistsOf(albums).map(a => a.name)).toEqual(['First artist', 'Second artist', 'Various artists']);
});

test('different folders separate same-title editions; a release ID unifies tagged discs', () => {
  const anotherEdition = { ...track, uri: 'Reissue/02.flac' };
  expect(albumsOf([track, anotherEdition])).toHaveLength(2);
  expect(albumsOf([{ ...track, releaseId: 'release' }, { ...anotherEdition, releaseId: 'release' }])).toHaveLength(1);
  const compilation = albumsOf([track, { ...track, artist: 'Other', uri: 'Compilation/CD 1/03.flac' }].map(t => ({ ...t, albumArtist: undefined })));
  expect(compilation[0]!.artist).toBe('Various artists');
});

test('playing an album appends every track in order and preserves the previous queue', async () => {
  const backend = new DemoBackend();
  const album = albumsOf(await backend.library()).find(a => a.title === 'Loveless')!;
  const before = await backend.snapshot();
  await backend.enqueueAlbum(album, true);
  const after = await backend.snapshot();
  expect(after.queue.slice(0, before.queue.length)).toEqual(before.queue);
  expect(after.queue.slice(before.queue.length).map(t => t.uri)).toEqual(album.tracks.map(t => t.uri));
  expect(after.currentId).toBe(after.queue[before.queue.length]!.queueId);
  expect(after.state).toBe('play');
});

test('queueing preserves paused playback; removal targets one occurrence and seeking rejects a stale song', async () => {
  const backend = new DemoBackend();
  const before = await backend.snapshot();
  const current = before.queue.find(t => t.queueId === before.currentId)!;
  await backend.enqueue(current);
  let after = await backend.snapshot();
  const duplicate = after.queue.at(-1)!;
  expect(after.currentId).toBe(before.currentId);
  expect(after.state).toBe('pause');
  await backend.remove(duplicate.queueId);
  await backend.seek(current.queueId, 50.5);
  after = await backend.snapshot();
  expect(after.queue).toEqual(before.queue);
  expect(after.elapsed).toBe(50.5);
  expect(after.state).toBe('pause');
  await expect(backend.seek(duplicate.queueId, 0)).rejects.toThrow('changed');
  await expect(backend.remove(duplicate.queueId)).rejects.toThrow('changed');
});

async function withMpd(respond: (command: string) => string, check: () => Promise<void>) {
  const saved = { host: process.env.MPD_HOST, port: process.env.MPD_PORT, password: process.env.MPD_PASSWORD };
  const server = createServer(socket => {
    socket.write('OK MPD 0.24.0\n');
    let pending = '';
    socket.on('data', data => {
      pending += data.toString();
      const terminator = pending.startsWith('command_list_ok_begin\n') ? 'command_list_end\n' : '\n';
      const at = pending.indexOf(terminator);
      if (at < 0) return;
      const command = pending.slice(0, at + terminator.length); pending = pending.slice(at + terminator.length);
      socket.write(respond(command));
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test listener');
  process.env.MPD_HOST = '127.0.0.1'; process.env.MPD_PORT = String(address.port); delete process.env.MPD_PASSWORD;
  try { await check(); }
  finally {
    if (saved.host === undefined) delete process.env.MPD_HOST; else process.env.MPD_HOST = saved.host;
    if (saved.port === undefined) delete process.env.MPD_PORT; else process.env.MPD_PORT = saved.port;
    if (saved.password === undefined) delete process.env.MPD_PASSWORD; else process.env.MPD_PASSWORD = saved.password;
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

test('MPD album play uses one ordered command list and the returned first song ID', async () => {
  const commands: string[] = [];
  await withMpd(command => {
    commands.push(command);
    return command.startsWith('command_list_ok_begin') ? 'Id: 31\nlist_OK\nId: 32\nlist_OK\nOK\n' : 'OK\n';
  }, async () => {
    const album = albumsOf([track, { ...track, uri: 'Compilation/CD 1/01.flac', number: 1 }])[0]!;
    const backend = new MpdBackend();
    await backend.enqueueAlbum(album, true);
    await backend.remove(32);
    expect(commands).toEqual([
      'command_list_ok_begin\naddid "Compilation/CD 1/01.flac"\naddid "Compilation/CD 1/02.flac"\ncommand_list_end\n',
      'playid 31\n', 'deleteid 32\n',
    ]);
  });
});

test('partial MPD album failure is reported without retrying or starting playback', async () => {
  const commands: string[] = [];
  await withMpd(command => { commands.push(command); return 'Id: 31\nlist_OK\nACK [50@1] {addid} No such song\n'; }, async () => {
    const album = albumsOf([track, { ...track, uri: 'Compilation/CD 1/missing.flac' }])[0]!;
    await expect(new MpdBackend().enqueueAlbum(album, true)).rejects.toThrow('some tracks may already be queued');
    expect(commands).toHaveLength(1);
  });
  await expect(requestMany(['addid "ok"\nclear'])).rejects.toThrow('Invalid MPD command');
});

test('MPD seek preserves fractional seconds and refuses a changed current ID', async () => {
  const commands: string[] = [];
  await withMpd(command => {
    commands.push(command);
    return command === 'status\n' ? 'songid: 42\nstate: pause\nduration: 120\nOK\n' : 'OK\n';
  }, async () => {
    const backend = new MpdBackend();
    await backend.seek(42, 50.5);
    await expect(backend.seek(43, 50)).rejects.toThrow('changed');
    expect(commands).toEqual(['status\n', 'seekid 42 50.5\n', 'status\n']);
  });
});

test('MPD library reads continue past the first bounded metadata page', async () => {
  const commands: string[] = [];
  await withMpd(command => {
    commands.push(command);
    const start = command.includes('window 0:1000') ? 0 : 1000;
    return Array.from({ length: start === 0 ? 1000 : 2 }, (_, i) => `file: album/${start + i}.flac\nTitle: Song ${start + i}\nAlbumArtist: Album artist\nDisc: 2\n`).join('') + 'OK\n';
  }, async () => {
    const tracks = await new MpdBackend().library();
    expect(tracks).toHaveLength(1002);
    expect(tracks.at(-1)?.uri).toBe('album/1001.flac');
    expect(tracks.at(-1)?.albumArtist).toBe('Album artist');
    expect(commands).toEqual(['search "(base \'\')" window 0:1000\n', 'search "(base \'\')" window 1000:2000\n']);
  });
});
