import { expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stringWidth } from 'bun';
import { LocalLyrics, lyricAt, lyricRows, lyricsRoots, parseLyrics } from '../src/lyrics';

test('LRC timestamps, repeated cues, offsets and blank gaps survive parsing', () => {
  const lyrics = parseLyrics('\uFEFF[ar:Test Artist]\r\n[00:03.400][00:01.20]<00:01.20>One line\r\n[00:02.00]\r\n[00:01.200]Translation\r\n[offset:+200]', 'timing.lrc')!;
  expect(lyrics).toEqual({ source: 'timing.lrc', synced: true, lines: [
    { time: 1, text: 'One line\nTranslation' }, { time: 1.8, text: '' }, { time: 3.2, text: 'One line' },
  ] });
  expect(lyricAt(lyrics, .999)).toBe(-1);
  expect(lyricAt(lyrics, 1)).toBe(0);
  expect(lyricAt(lyrics, 2)).toBe(1);
  expect(lyricAt(lyrics, 3.2)).toBe(2);
  expect(lyricAt(lyrics, 1.5)).toBe(0);
  expect(parseLyrics('[offset:-500]\n[00:01]Later')!.lines[0]!.time).toBe(1.5);
  expect(parseLyrics('[offset:2000]\n[00:01.123456]Earlier')!.lines[0]!.time).toBe(0);
});

test('untimed text preserves sections and wraps Unicode without splitting graphemes', () => {
  const lyrics = parseLyrics('[ar:Test]\n\n[Chorus]\nWide 界界 words\n\nCafe\u0301\tending\u001b\n')!;
  expect(lyrics.synced).toBe(false);
  expect(lyrics.lines.map(line => line.text)).toEqual(['[Chorus]', 'Wide 界界 words', '', 'Cafe\u0301 ending']);
  expect(lyricAt(lyrics, 100)).toBe(-1);
  const rows = lyricRows(lyrics, 7);
  expect(rows.every(row => stringWidth(row.text) <= 7)).toBe(true);
  expect(rows.filter(row => row.line === 1).map(row => row.text)).toEqual(['Wide', '界界', 'words']);
  expect(rows.filter(row => row.line === 3).map(row => row.text)).toEqual(['Cafe\u0301', 'ending']);
  expect(parseLyrics('[ar:Test]\n[ti:Empty]\n')).toBeUndefined();
});

test('local sidecars reload without modifying source files and remain inside configured roots', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'music-lyrics-'));
  try {
    const root = join(directory, 'music'), album = join(root, 'Été', 'Album');
    mkdirSync(album, { recursive: true });
    const path = join(album, '01 - Song.lrc');
    const original = '[00:00.00]First version\n';
    writeFileSync(path, original);
    writeFileSync(join(directory, 'outside.lrc'), '[00:00]Outside');
    const reader = new LocalLyrics([root]);
    const track = { uri: 'Été/Album/01 - Song.flac' };
    expect((await reader.load(track))?.lines[0]?.text).toBe('First version');
    expect(readFileSync(path, 'utf8')).toBe(original);
    writeFileSync(path, '[00:01.50]Updated version\n');
    expect((await reader.load(track))?.lines[0]?.time).toBe(1.5);
    expect(await reader.load({ uri: '../outside.flac' })).toBeUndefined();
    expect(await reader.load({ uri: 'https://example.test/stream' })).toBeUndefined();
    expect(await reader.load({ uri: 'missing.flac' })).toBeUndefined();
    writeFileSync(path, 'x'.repeat(1024 * 1024 + 1));
    await expect(reader.load(track)).rejects.toThrow('larger than 1 MB');
    writeFileSync(join(album, '02 - Plain.txt'), 'A plain verse\nAnother line');
    expect((await reader.load({ uri: 'Été/Album/02 - Plain.flac' }))?.synced).toBe(false);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('lyric roots respect an explicit override and read existing RON folder settings', async () => {
  const home = mkdtempSync(join(tmpdir(), 'music-lyrics-config-'));
  try {
    const config = join(home, '.config');
    mkdirSync(join(config, 'rmpc'), { recursive: true });
    writeFileSync(join(config, 'rmpc', 'config.ron'), '(\n lyrics_dir: Some("~/Lyrics"),\n)');
    expect((await lyricsRoots({ XDG_CONFIG_HOME: config }, home))[0]).toBe(join(home, 'Lyrics'));
    expect(await lyricsRoots({ MUSIC_UI_LYRICS_DIR: '~/Custom lyrics' }, home)).toEqual([join(home, 'Custom lyrics')]);
  } finally { rmSync(home, { recursive: true, force: true }); }
});
