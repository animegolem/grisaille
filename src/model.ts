import type { Lyrics } from './lyrics';

export type Track = {
  uri: string;
  title: string;
  artist: string;
  artists?: string[];
  albumArtist?: string;
  album: string;
  releaseId?: string;
  year: string;
  number: number;
  disc?: number;
  duration: number;
  art?: string;
};

export type QueueTrack = Track & { queueId: number };
export type Album = { key: string; title: string; artist: string; year: string; tracks: Track[]; art?: string };
export type Artist = { name: string; albums: Album[] };
export type Snapshot = {
  queue: QueueTrack[];
  currentId?: number;
  state: 'play' | 'pause' | 'stop';
  elapsed: number;
  volume: number;
  error?: string;
};
export type Result =
  | { kind: 'artist'; key: string; artist: Artist; score: number }
  | { kind: 'album'; key: string; album: Album; score: number }
  | { kind: 'track'; key: string; track: Track; score: number }
  | { kind: 'action'; key: string; title: string; score: number };

export function albumKey(t: Pick<Track, 'album' | 'artist'> & Partial<Track>): string {
  if (t.releaseId) return JSON.stringify(['release', t.releaseId]);
  const folder = t.uri?.split('/').slice(0, -1) || [];
  // A conventional disc subfolder belongs to its containing album.
  if (/^(?:cd|disc|disk)[ ._-]*\d+(?:\b|$)/i.test(folder.at(-1) || '')) folder.pop();
  if (folder.length) return JSON.stringify(['folder', folder.join('/'), t.album]);
  return JSON.stringify(['tags', t.albumArtist || t.artist, t.album]);
}

export function albumsOf(tracks: Track[]): Album[] {
  const albums = new Map<string, Album>();
  for (const t of tracks) {
    const key = albumKey(t);
    let a = albums.get(key);
    if (!a) {
      a = { key, title: t.album, artist: t.albumArtist || t.artist, year: t.year, tracks: [], art: t.art };
      albums.set(key, a);
    }
    a.tracks.push(t);
  }
  for (const album of albums.values()) {
    album.tracks.sort((a, b) => (a.disc || 1) - (b.disc || 1) || a.number - b.number || a.uri.localeCompare(b.uri, undefined, { numeric: true }));
    const albumArtist = album.tracks.find(t => t.albumArtist)?.albumArtist;
    album.artist = albumArtist || (new Set(album.tracks.map(t => t.artist)).size === 1 ? album.tracks[0]!.artist : 'Various artists');
    album.art ||= album.tracks.find(t => t.art)?.art;
  }
  return [...albums.values()].sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title) || a.key.localeCompare(b.key));
}

export function duration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export function artistsOf(albums: Album[]): Artist[] {
  const artists = new Map<string, Artist>();
  for (const album of albums) {
    const names = new Set([album.artist, ...album.tracks.flatMap(t => t.artists?.length ? t.artists : [t.artist])]);
    for (const name of names) {
      const artist = artists.get(name) || { name, albums: [] };
      artist.albums.push(album);
      artists.set(name, artist);
    }
  }
  for (const artist of artists.values()) artist.albums.sort((a, b) => a.year.localeCompare(b.year) || a.title.localeCompare(b.title));
  return [...artists.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function fuzzyScore(query: string, text: string): number {
  const q = query.toLocaleLowerCase().trim();
  const t = text.toLocaleLowerCase();
  if (!q) return 0;
  if (q === t) return 1000;
  if (t.startsWith(q)) return 800 - (t.length - q.length) / 100;
  if (t.includes(q)) return 600 - t.indexOf(q);
  let at = 0, first = -1, last = 0;
  for (const char of q) {
    const found = t.indexOf(char, at);
    if (found < 0) return -1;
    if (first < 0) first = found;
    last = found;
    at = found + 1;
  }
  return 300 - first - (last - first - q.length);
}

export function searchLibrary(query: string, albums: Album[], tracks: Track[], artists = artistsOf(albums)): Result[] {
  const found: Result[] = [];
  for (const artist of artists) {
    const score = fuzzyScore(query, artist.name);
    if (score >= 0) found.push({ kind: 'artist', key: `artist:${artist.name}`, artist, score });
  }
  for (const album of albums) {
    const score = Math.max(fuzzyScore(query, album.title), fuzzyScore(query, `${album.artist} ${album.title}`) - 30);
    if (score >= 0) found.push({ kind: 'album', key: `album:${album.key}`, album, score });
  }
  for (const track of tracks) {
    const score = Math.max(fuzzyScore(query, track.title), fuzzyScore(query, `${track.artist} ${track.title} ${track.album}`) - 30);
    if (score >= 0) found.push({ kind: 'track', key: `track:${track.uri}`, track, score });
  }
  for (const title of ['Play / pause', 'Next track', 'Previous track', 'Open queue', 'Open lyrics', 'Open library', 'Reload library']) {
    const score = fuzzyScore(query, title);
    if (score >= 0) found.push({ kind: 'action', key: title, title, score });
  }
  return found.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key)).slice(0, 9);
}

export function moveQueue<T extends { queueId: number }>(queue: T[], id: number, beforeId: number | null): T[] {
  const item = queue.find(t => t.queueId === id);
  if (!item || id === beforeId || (beforeId !== null && !queue.some(t => t.queueId === beforeId))) return queue;
  const next = queue.filter(t => t.queueId !== id);
  const destination = beforeId === null ? next.length : next.findIndex(t => t.queueId === beforeId);
  next.splice(destination, 0, item);
  return next;
}

export interface MusicBackend {
  readonly demo: boolean;
  library(): Promise<Track[]>;
  snapshot(): Promise<Snapshot>;
  artwork(track: Track): Promise<string | undefined>;
  lyrics(track: Track): Promise<Lyrics | undefined>;
  toggle(): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  play(id: number): Promise<void>;
  enqueue(track: Track, play?: boolean): Promise<void>;
  enqueueAlbum(album: Album, play?: boolean): Promise<number[]>;
  seek(id: number, seconds: number): Promise<void>;
  remove(id: number): Promise<void>;
  move(id: number, beforeId: number | null): Promise<void>;
  subscribe(changed: (event?: 'database') => void): () => void;
}
