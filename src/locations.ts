import type { Place, Route } from './history';
import { albumKey, type Album, type Artist, type QueueTrack, type Track } from './model';

export type Catalogue = { albums: Album[]; artists: Artist[]; queue: QueueTrack[] };

export function placeKey(route: Route, track?: Track): string | undefined {
  if (!track) return;
  if (route.page === 'queue') return `queue:${(track as QueueTrack).queueId}`;
  if (route.page === 'library' && route.mode === 'artists') return `artist:${track.artist}`;
  if (route.page === 'artist' || route.page === 'library') return `album:${albumKey(track)}`;
  return `track:${track.uri}`;
}
export function routeItems(route: Route, catalogue: Catalogue): Track[] {
  const { albums, artists, queue } = catalogue;
  if (route.page === 'queue') return queue;
  if (route.page === 'record') return albums.find(a => a.key === route.key)?.tracks || [];
  if (route.page === 'artist') return artists.find(a => a.name === route.name)?.albums.map(a => a.tracks[0]!) || [];
  if (route.mode === 'artists') return artists.map(a => ({ ...a.albums[0]!.tracks[0]!, artist: a.name }));
  return albums.map(a => a.tracks[0]!);
}
/** Resolve stable selection and viewport anchors against today's library/queue. */
export function resolvePlace(point: Place, catalogue: Catalogue): Place {
  const { albums, artists } = catalogue;
  const requested = point.route;
  let route = requested;
  const album = requested.page === 'record' ? albums.find(a => a.key === requested.key) : undefined;
  const person = requested.page === 'artist' ? artists.find(a => a.name === requested.name) : undefined;
  if ((route.page === 'record' && !album) || (route.page === 'artist' && !person)) route = { page: 'library', mode: 'covers' };
  if (route.page === 'record' && album) {
    const parent = route.artist;
    if (!artists.some(a => a.name === parent && a.albums.some(a => a.key === album.key))) route = { ...route, artist: album.artist };
  }
  const items = routeItems(route, catalogue);
  const found = point.selected ? items.findIndex(t => placeKey(route, t) === point.selected) : -1;
  const selection = Math.max(0, Math.min(items.length - 1, found >= 0 ? found : point.selection));
  let viewport = point.viewport;
  if (viewport?.kind === 'list') {
    const anchorKey = viewport.anchor;
    const anchor = anchorKey ? items.findIndex(t => placeKey(route, t) === anchorKey) : -1;
    viewport = { ...viewport, index: Math.max(0, Math.min(items.length - 1, anchor >= 0 ? anchor : viewport.index)) };
  }
  return { route, selection, selected: placeKey(route, items[selection]), viewport };
}
export function albumPlace(album: Album, track?: Track, parent?: Artist): Place {
  return {
    route: { page: 'record', key: album.key, artist: parent?.albums.some(a => a.key === album.key) ? parent.name : album.artist },
    selection: track ? Math.max(0, album.tracks.findIndex(t => t.uri === track.uri)) : 0,
  };
}
export function routeTitle(route: Route, albums: Album[]): string {
  return route.page === 'queue' ? 'Now playing' : route.page === 'library' ? 'Library' : route.page === 'artist' ? route.name : albums.find(a => a.key === route.key)?.title || 'Album';
}
