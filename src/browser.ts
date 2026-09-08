import type { BrowserColumn, BrowserPosition, BrowserTrail, Place, Route } from './history';
import { identifyPlace, resolvePlace, routeItems, type Catalogue } from './locations';

export function browserColumn(route: Route): BrowserColumn | undefined {
  if (route.page === 'library' && route.mode === 'artists') return 'artists';
  if (route.page === 'artist') return 'albums';
  if (route.page === 'record') return 'tracks';
}
const position = ({ selection, selected, viewport }: BrowserPosition): BrowserPosition => ({ selection, selected, viewport });

/** Routes own focus. A bounded trail retains the other two columns' positions. */
export function browserColumns(point: Place, catalogue: Catalogue) {
  const current = resolvePlace(point, catalogue);
  const active = browserColumn(current.route);
  if (!active) return;
  const trail = point.browser || {};
  const name = current.route.page === 'artist' ? current.route.name : current.route.page === 'record' ? current.route.artist : undefined;
  const artists = resolvePlace({ route: { page: 'library', mode: 'artists' }, ...(trail.artists || { selection: 0 }),
    ...(active === 'artists' ? position(current) : { selected: `artist:${name}` }) }, catalogue);
  const person = catalogue.artists[artists.selection];
  const albums = resolvePlace({ route: { page: 'artist', name: person?.name || '' },
    ...(trail.albums && trail.albums.artist === person?.name ? position(trail.albums) : { selection: 0 }),
    ...(active === 'albums' ? position(current) : active === 'tracks' && current.route.page === 'record' ? { selected: `album:${current.route.key}` } : {}) }, catalogue);
  const album = person?.albums[albums.selection];
  const tracks = resolvePlace({ route: { page: 'record', key: album?.key || '', artist: person?.name },
    ...(trail.tracks && trail.tracks.album === album?.key ? position(trail.tracks) : { selection: 0 }),
    ...(active === 'tracks' ? position(current) : {}) }, catalogue);
  return { active, person, album, track: album?.tracks[tracks.selection], artists, albums, tracks };
}
export function browserTrail(columns: NonNullable<ReturnType<typeof browserColumns>>): BrowserTrail {
  return { artists: position(columns.artists),
    albums: columns.person ? { ...position(columns.albums), artist: columns.person.name } : undefined,
    tracks: columns.album ? { ...position(columns.tracks), album: columns.album.key } : undefined };
}
export function rememberBrowser(point: Place, catalogue: Catalogue): Place {
  const columns = browserColumns(point, catalogue);
  return columns ? { ...point, browser: browserTrail(columns) } : point;
}
/** Focusing a column is a visit; previewing within it only checkpoints selection. */
export function browserTarget(point: Place, column: BrowserColumn, catalogue: Catalogue, index?: number): Place | undefined {
  const columns = browserColumns(point, catalogue);
  if (!columns || column === 'albums' && !columns.person || column === 'tracks' && !columns.album) return;
  let target: Place = { ...columns[column], browser: browserTrail(columns) };
  if (index !== undefined) target = identifyPlace({ ...target, selection: index, selected: undefined }, routeItems(target.route, catalogue));
  return rememberBrowser(target, catalogue);
}
