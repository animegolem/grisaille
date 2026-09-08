import { readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { stringWidth } from 'bun';
import type { Track } from './model';

export type LyricLine = { time?: number; text: string };
export type Lyrics = { lines: LyricLine[]; synced: boolean; source: string };
const MAX_BYTES = 1024 * 1024;
const timestamp = /^(\d+):(\d{1,2})(?:[.:](\d{1,9}))?$/;
const clean = (text: string) => text.replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g, '').replace(/\t/g, ' ');

/** Positive LRC offsets bring a line forward, matching RMPC's convention. */
export function parseLyrics(input: string, source = ''): Lyrics | undefined {
  const lines = input.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (lines.length > 10_000) throw new Error('The lyrics file has too many lines.');
  const timed: LyricLine[] = [], plain: string[] = [];
  let offset = 0;
  for (const line of lines) {
    let rest = line.trim(), tagged = false;
    const times: number[] = [];
    while (rest.startsWith('[')) {
      const tag = /^\[([^\]]*)\]/.exec(rest);
      if (!tag) break;
      const clock = timestamp.exec(tag[1]!);
      if (clock && Number(clock[2]) < 60) {
        const millis = (Number(clock[1]) * 60 + Number(clock[2])) * 1000 + Number((clock[3] || '').slice(0, 3).padEnd(3, '0'));
        if (Number.isSafeInteger(millis)) times.push(millis);
      } else if (/^[a-z][a-z0-9_-]*:/i.test(tag[1]!)) {
        const shift = /^offset:\s*([+-]?\d+)\s*$/i.exec(tag[1]!);
        if (shift && Number.isSafeInteger(Number(shift[1]))) offset = Number(shift[1]);
      } else break;
      tagged = true; rest = rest.slice(tag[0].length).trimStart();
    }
    // Enhanced LRC word timestamps retain their words in this line-based reader.
    const text = clean(rest.replace(/<\d+:\d{1,2}(?:[.:]\d{1,9})?>/g, '')).trim();
    if (times.length) for (const time of times) timed.push({ time, text });
    else if (!tagged || text) plain.push(text);
  }
  if (timed.length) {
    for (const line of timed) line.time = Math.max(0, line.time! - offset) / 1000;
    timed.sort((a, b) => a.time! - b.time!);
    const grouped: LyricLine[] = [];
    for (const line of timed) {
      const last = grouped.at(-1);
      if (last && last.time === line.time) last.text = [last.text, line.text].filter(Boolean).join('\n');
      else grouped.push({ ...line });
    }
    return { lines: grouped, synced: true, source };
  }
  while (plain.length && !plain[0]) plain.shift();
  while (plain.length && !plain.at(-1)) plain.pop();
  return plain.length ? { lines: plain.map(text => ({ text })), synced: false, source } : undefined;
}

/** The last cue at or before playback; an empty timed cue still ends a verse. */
export function lyricAt(lyrics: Lyrics | undefined, seconds: number): number {
  if (!lyrics?.synced || !Number.isFinite(seconds)) return -1;
  let low = 0, high = lyrics.lines.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (lyrics.lines[middle]!.time! <= seconds) low = middle + 1;
    else high = middle;
  }
  return low - 1;
}

/** Wrap once into fixed-height rows while keeping each row's original cue. */
export function lyricRows(lyrics: Lyrics | undefined, columns: number) {
  const rows: { line: number; text: string }[] = [];
  const width = Math.max(1, Math.floor(columns));
  const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  for (const [line, cue] of (lyrics?.lines || []).entries()) {
    for (const paragraph of cue.text.split('\n')) {
      let row = '';
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (row && stringWidth(`${row} ${word}`) <= width) { row += ` ${word}`; continue; }
        if (row) { rows.push({ line, text: row }); row = ''; }
        for (const { segment } of segments.segment(word)) {
          if (row && stringWidth(row + segment) > width) { rows.push({ line, text: row }); row = ''; }
          row += segment;
        }
      }
      rows.push({ line, text: row });
    }
  }
  return rows;
}

const expand = (path: string, home: string) => path === '~' ? home : path.startsWith('~/') ? join(home, path.slice(2)) : path;
async function setting(path: string, field: string, ron: boolean): Promise<string | undefined> {
  try {
    const text = await readFile(path, 'utf8');
    const value = new RegExp(`^\\s*${field}${ron ? ':\\s*(?:Some\\(\\s*)?' : '\\s+'}("(?:[^"\\\\]|\\\\.)*")`, 'm').exec(text)?.[1];
    return value ? JSON.parse(value) as string : undefined;
  } catch { return; }
}

/** Adopt the existing local lyric/music roots; an explicit override stands alone. */
export async function lyricsRoots(env: NodeJS.ProcessEnv = process.env, home = homedir()): Promise<string[]> {
  if (env.MUSIC_UI_LYRICS_DIR) return [resolve(expand(env.MUSIC_UI_LYRICS_DIR, home))];
  const config = env.XDG_CONFIG_HOME || join(home, '.config');
  const found = await Promise.all([
    setting(join(config, 'rmpc', 'config.ron'), 'lyrics_dir', true),
    setting(join(config, 'mpd', 'mpd.conf'), 'music_directory', false),
    setting('/opt/homebrew/etc/mpd.conf', 'music_directory', false),
    setting('/etc/mpd.conf', 'music_directory', false),
  ]);
  return [...new Set(found.filter((path): path is string => Boolean(path)).map(path => resolve(expand(path, home))))];
}

export class LocalLyrics {
  private roots?: Promise<string[]>;
  constructor(private configuredRoots?: string[]) {}
  async load(track: Pick<Track, 'uri'>): Promise<Lyrics | undefined> {
    const roots = this.configuredRoots || await (this.roots ||= lyricsRoots());
    // MPD streams do not identify local sidecars. Relative paths stay inside a root.
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(track.uri) || track.uri.includes('\0')) return;
    for (const root of roots) {
      const audio = resolve(root, track.uri), child = relative(resolve(root), audio);
      if (child === '..' || child.startsWith(`..${sep}`) || isAbsolute(child)) continue;
      const extension = extname(audio), stem = extension ? audio.slice(0, -extension.length) : audio;
      for (const suffix of ['.lrc', '.LRC', '.txt']) {
        const path = stem + suffix;
        try {
          const info = await stat(path);
          if (!info.isFile()) continue;
          if (info.size > MAX_BYTES) throw new Error('The lyrics file is larger than 1 MB.');
          const data = await readFile(path);
          if (data.length > MAX_BYTES) throw new Error('The lyrics file is larger than 1 MB.');
          const lyrics = parseLyrics(data.toString('utf8'), path);
          if (lyrics) return lyrics;
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code;
          if (code !== 'ENOENT' && code !== 'ENOTDIR') throw error;
        }
      }
    }
  }
}
