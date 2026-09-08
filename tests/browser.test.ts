import { expect, test } from 'bun:test';
import { browserColumns, browserTarget, rememberBrowser } from '../src/browser';
import { DemoBackend } from '../src/demo';
import { albumsOf, artistsOf } from '../src/model';
import { albumPlace, identifyPlace, resolvePlace } from '../src/locations';
import { defaultOrder, orderAlbums, orderArtists } from '../src/library-order';
import { parseNavigationState } from '../src/navigation-state';

async function setup() {
  const albums = albumsOf(await new DemoBackend().library());
  const catalogue = { albums, artists: artistsOf(albums), queue: [] };
  const album = albums.find(a => a.title === 'Loveless')!;
  const point = rememberBrowser(identifyPlace({ ...albumPlace(album, album.tracks[8]), viewport: { kind: 'list', index: 4, offset: 13.5 } }, album.tracks), catalogue);
  return { catalogue, album, point };
}

test('stepping out through both parents and back in retains the selected album, track and scroll', async () => {
  const { catalogue, point } = await setup();
  const albums = browserTarget(point, 'albums', catalogue)!;
  expect(albums.selection).toBe(1);
  expect(browserColumns(albums, catalogue)?.album?.title).toBe('Loveless');
  const artists = browserTarget(albums, 'artists', catalogue)!;
  expect(artists.selection).toBe(5);
  const returned = browserTarget(browserTarget(artists, 'albums', catalogue)!, 'tracks', catalogue)!;
  expect(returned.selected).toBe('track:sample/loveless/8');
  expect(returned.viewport).toMatchObject({ index: 4, offset: 13.5 });
  expect(browserColumns(returned, catalogue)?.track?.title).toBe('Blown a Wish');
});

test('previewing a different artist resets mismatched child selections', async () => {
  const { catalogue, point } = await setup();
  const changed = browserTarget(point, 'artists', catalogue, 0)!;
  const columns = browserColumns(changed, catalogue)!;
  expect(columns.person?.name).toBe('Frank Turner');
  expect(columns.album?.title).toBe('Love Ire & Song');
  expect(columns.tracks.selection).toBe(0);
  expect(columns.track?.uri).not.toContain('loveless');
  expect(columns.tracks.viewport).toBeUndefined();
});

test('all columns resolve identities through a sort and a saved-state round trip', async () => {
  const { catalogue, point } = await setup();
  const reversed = { ...defaultOrder, artists: 'za' as const, artistAlbums: 'newest' as const };
  const loaded = parseNavigationState(JSON.parse(JSON.stringify({ version: 1, history: { entries: [point], cursor: 0 }, order: reversed, libraryView: 'artists' })));
  const changed = { ...catalogue, albums: orderAlbums(catalogue.albums, 'newest'), artists: orderArtists(catalogue.artists, reversed) };
  const columns = browserColumns(loaded.history.entries[0]!, changed)!;
  expect(columns.artists.selection).toBe(0);
  expect(columns.album?.title).toBe('Loveless');
  expect(columns.track?.title).toBe('Blown a Wish');
  expect(columns.tracks.viewport).toMatchObject({ index: 4, offset: 13.5 });
  const invalid = structuredClone(loaded);
  invalid.history.entries[0]!.browser!.tracks!.viewport = { kind: 'list', index: -1, offset: 0 };
  expect(() => parseNavigationState(invalid)).toThrow();
});

test('a contributor stays the parent of a compilation and missing albums resolve safely', async () => {
  const { album } = await setup();
  const tracks = album.tracks.map(t => ({ ...t, albumArtist: 'Various artists', artist: 'Guest', artists: ['Guest'] }));
  const albums = albumsOf(tracks), artists = artistsOf(albums), catalogue = { albums, artists, queue: [] };
  const point = albumPlace(albums[0]!, tracks[8], artists.find(a => a.name === 'Guest'));
  const parent = browserTarget(point, 'albums', catalogue)!;
  expect(parent.route).toEqual({ page: 'artist', name: 'Guest' });
  expect(browserTarget(parent, 'tracks', catalogue)?.route).toMatchObject({ artist: 'Guest' });
  expect(browserColumns(resolvePlace(point, { albums: [], artists: [], queue: [] }), catalogue)).toBeUndefined();
  expect(browserColumns({ route: { page: 'library', mode: 'artists' }, selection: 0 }, { albums: [], artists: [], queue: [] })?.album).toBeUndefined();
});
