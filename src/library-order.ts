import type { Album, Artist } from './model';

export type AlbumOrder = 'artist' | 'title' | 'oldest' | 'newest';
export type ArtistOrder = 'az' | 'za';
export type LibraryOrder = { albums: AlbumOrder; artistAlbums: AlbumOrder; artists: ArtistOrder };
export const defaultOrder: LibraryOrder = { albums: 'artist', artistAlbums: 'oldest', artists: 'az' };
export const albumOrders = [
  { value: 'artist', label: 'Artist A–Z' },
  { value: 'title', label: 'Album title A–Z' },
  { value: 'oldest', label: 'Year · oldest first' },
  { value: 'newest', label: 'Year · newest first' },
] as const;
export const artistOrders = [{ value: 'az', label: 'Artist A–Z' }, { value: 'za', label: 'Artist Z–A' }] as const;
const compare = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

export function orderAlbums(albums: Album[], order: AlbumOrder): Album[] {
  return [...albums].sort((a, b) => {
    const artist = compare(a.artist, b.artist), title = compare(a.title, b.title);
    if (order === 'artist') return artist || title || compare(a.year, b.year) || compare(a.key, b.key);
    if (order === 'title') return title || artist || compare(a.year, b.year) || compare(a.key, b.key);
    // Untagged dates stay at the end in either direction.
    const missing = Number(!a.year) - Number(!b.year);
    return missing || compare(a.year, b.year) * (order === 'newest' ? -1 : 1) || artist || title || compare(a.key, b.key);
  });
}
export function orderArtists(artists: Artist[], order: LibraryOrder): Artist[] {
  return [...artists].sort((a, b) => compare(a.name, b.name) * (order.artists === 'za' ? -1 : 1))
    .map(artist => ({ ...artist, albums: orderAlbums(artist.albums, order.artistAlbums) }));
}
