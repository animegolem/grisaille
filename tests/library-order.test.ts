import { expect, test } from 'bun:test';
import { orderAlbums } from '../src/library-order';
import { resolvePlace } from '../src/locations';
import { albumKey, albumsOf, artistsOf, type Track } from '../src/model';

const track = (artist: string, title: string, year: string): Track => ({ uri: `${artist}/${title}/one`, title: 'One', album: title, artist, year, number: 1, duration: 60 });
test('library sorts retain editions, use natural titles, and put missing years last in either direction', () => {
  const tracks = [track('Zebra', 'Record 2', '2001'), track('Alpha', 'Record 10', '1999'), track('Bravo', 'Record 2', '')];
  const base = albumsOf(tracks);
  expect(orderAlbums(base, 'artist').map(a => a.artist)).toEqual(['Alpha', 'Bravo', 'Zebra']);
  const titles = orderAlbums(base, 'title');
  expect(titles.map(a => a.title)).toEqual(['Record 2', 'Record 2', 'Record 10']);
  expect(orderAlbums(base, 'oldest').map(a => a.year)).toEqual(['1999', '2001', '']);
  expect(orderAlbums(base, 'newest').map(a => a.year)).toEqual(['2001', '1999', '']);
  const selected = resolvePlace({ route: { page: 'library', mode: 'covers' }, selection: 0, selected: `album:${albumKey(tracks[1]!)}` }, { albums: titles, artists: artistsOf(base), queue: [] });
  expect(selected.selection).toBe(2);
  expect(titles[selected.selection]?.artist).toBe('Alpha');
  expect(base.map(a => a.artist)).toEqual(['Alpha', 'Bravo', 'Zebra']);
});
