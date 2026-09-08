/** @jsxImportSource @opentui/react */
import { expect, test } from 'bun:test';
import { createRoot, flushSync } from '@opentui/react';
import { createTestRenderer } from '@opentui/core/testing';
import { DemoBackend } from '../src/demo';
import { MusicSession } from '../src/music-session';
import { TerminalApp, plain, reveal } from '../src/terminal/app';
import type { NavigationEvent } from '../src/history';
import { NavigationStateStore } from '../src/navigation-state';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseLyrics, type Lyrics } from '../src/lyrics';
import type { Track } from '../src/model';

class NoArtDemo extends DemoBackend { async artwork() { return undefined; } }
class LyricsDemo extends NoArtDemo {
  async lyrics(): Promise<Lyrics | undefined> { return parseLyrics('[00:00]Opening line\n[01:00]Middle refrain\n[01:30]Next verse\n[02:00]Ending line', 'test.lrc'); }
}
async function setup(width = 100, height = 28, options: { state?: NavigationStateStore; backend?: NoArtDemo; ready?: (frame: string) => boolean; retryMs?: number } = {}) {
  const view = await createTestRenderer({ width, height, kittyKeyboard: true });
  const backend = options.backend || new NoArtDemo();
  const session = new MusicSession(backend, options.retryMs);
  const events: NavigationEvent[] = [];
  const root = createRoot(view.renderer);
  flushSync(() => root.render(<TerminalApp session={session} navigationState={options.state} record={event => events.push(event)} />));
  await view.waitForFrame(options.ready || (frame => frame.includes('Only Shallow') && frame.includes('1/7')));
  return { ...view, backend, session, events, cleanup() { options.state?.detach(); root.unmount(); session.stop(); view.renderer.destroy(); } };
}

test('terminal rapid prompt text retains its prefix; track navigation and o/i never replay playback', async () => {
  const view = await setup();
  try {
    const before = await view.backend.snapshot();
    await view.mockInput.typeText('jj:love ire', 0);
    await view.waitForFrame(frame => frame.includes(': love ire') && frame.includes('album') && frame.includes('track'));
    view.mockInput.pressArrow('down');
    view.mockInput.pressEnter();
    await view.waitForFrame(frame => frame.includes('Love Ire & Song / Frank Turner') && frame.includes('6/14'));
    await view.mockInput.typeText('o', 0);
    await view.waitForFrame(frame => frame.includes('Now playing   3/7'));
    await view.mockInput.typeText('i', 0);
    await view.waitForFrame(frame => frame.includes('Love Ire & Song / Frank Turner') && frame.includes('6/14'));
    expect(await view.backend.snapshot()).toEqual(before);
    expect(view.events.filter(e => e.action !== 'position').map(e => e.action)).toEqual(['visit', 'back', 'forward']);
  } finally { view.cleanup(); }
});

test('terminal input owns o/i/space and bracketed paste; Escape restores the list', async () => {
  const view = await setup();
  try {
    await view.mockInput.typeText(':', 0);
    await view.mockInput.pasteBracketedText('love ire');
    await view.waitForFrame(frame => frame.includes(': love ire'));
    await view.mockInput.typeText(' o i', 0);
    await view.waitForFrame(frame => frame.includes(': love ire o i'));
    expect(view.events).toHaveLength(0);
    expect((await view.backend.snapshot()).state).toBe('pause');
    view.mockInput.pressEscape();
    await view.waitForFrame(frame => frame.includes('Now playing   1/7'));
  } finally { view.cleanup(); }
});

test('lyrics follows playback, reads and finds without seeking, and returns through navigation history', async () => {
  const view = await setup(100, 28, { backend: new LyricsDemo() });
  try {
    await view.mockInput.typeText('jj', 0);
    const before = await view.backend.snapshot();
    view.mockInput.pressKey('F2');
    await view.waitForFrame(frame => frame.includes('Following playback') && frame.includes('› Middle refrain'));
    await view.mockInput.typeText('j', 0);
    await view.waitForFrame(frame => frame.includes('Reading · paused') && frame.includes('› Next verse'));
    expect(await view.backend.snapshot()).toEqual(before);
    view.mockInput.pressEnter();
    await view.waitFor(() => view.session.getState().snapshot.elapsed === 90);
    expect(view.session.getState().snapshot.state).toBe('pause');
    expect(view.session.getState().snapshot.currentId).toBe(before.currentId);
    await view.mockInput.typeText('f/ending', 0);
    await view.waitForFrame(frame => frame.includes('› Ending line'));
    expect(view.session.getState().snapshot.elapsed).toBe(90);
    view.mockInput.pressEscape();
    await view.waitForFrame(frame => frame.includes('Following playback') && frame.includes('› Next verse'));
    await view.mockInput.typeText('o', 0);
    await view.waitForFrame(frame => frame.includes('Now playing   3/7'));
    await view.mockInput.typeText('i', 0);
    await view.waitForFrame(frame => frame.includes('Following playback') && frame.includes('› Next verse'));
    view.resize(44, 12);
    await view.waitForFrame(frame => frame.includes('F2 Lyrics') && frame.includes('Next verse'));
    view.mockInput.pressKey('F3');
    await view.waitForFrame(frame => frame.includes('Library / Albums'));
    expect(view.session.getState().snapshot.queue).toEqual(before.queue);
  } finally { view.cleanup(); }
});

test('a delayed lyric result cannot replace the current song and reload errors stay in the reader', async () => {
  class PendingLyrics extends NoArtDemo {
    pending: { uri: string; resolve: (lyrics?: Lyrics) => void; reject: (error: Error) => void }[] = [];
    async lyrics(track: Track): Promise<Lyrics | undefined> { return new Promise((resolve, reject) => this.pending.push({ uri: track.uri, resolve, reject })); }
  }
  const backend = new PendingLyrics();
  const view = await setup(100, 28, { backend });
  try {
    view.mockInput.pressKey('F2');
    await view.waitFor(() => backend.pending.length === 1);
    await backend.next();
    await view.waitFor(() => backend.pending.length === 2);
    backend.pending[0]!.resolve(parseLyrics('[00:00]Old song words'));
    await view.waitForFrame(frame => frame.includes('Loomer') && frame.includes('Reading local lyrics'));
    expect(view.captureCharFrame()).not.toContain('Old song words');
    backend.pending[1]!.resolve(parseLyrics('Current untimed verse\nSecond line'));
    await view.waitForFrame(frame => frame.includes('Untimed lyrics') && frame.includes('Current untimed verse'));
    view.mockInput.pressEnter();
    expect(view.session.getState().snapshot.state).toBe('pause');
    await view.mockInput.typeText('r', 0);
    await view.waitFor(() => backend.pending.length === 3);
    backend.pending[2]!.reject(new Error('The lyric file is unavailable.'));
    await view.waitForFrame(frame => frame.includes('The lyric file is unavailable.'));
    expect(view.session.getState().actionProblem).toBe('');
  } finally { view.cleanup(); }
});

test('a one-row lyric viewport can read every wrapped row and still seek its original cue', async () => {
  class WrappedLyrics extends NoArtDemo {
    async lyrics(): Promise<Lyrics | undefined> { return parseLyrics('[00:00]Opening words fill the beginning of this deliberately long cue until its hidden continuation becomes readable\n[01:30]Next cue'); }
  }
  const view = await setup(44, 12, { backend: new WrappedLyrics() });
  try {
    view.mockInput.pressKey('F2');
    await view.waitForFrame(frame => frame.includes('› Opening words'));
    await view.mockInput.typeText('j', 0);
    await view.waitForFrame(frame => frame.includes('› this deliberately long cue'));
    await view.mockInput.typeText('j', 0);
    await view.waitForFrame(frame => frame.includes('› hidden continuation becomes readable'));
    expect(view.session.getState().snapshot.elapsed).toBe(83);
    view.mockInput.pressEnter();
    await view.waitFor(() => view.session.getState().snapshot.elapsed === 0);
    await view.mockInput.typeText('/next', 0);
    await view.waitForFrame(frame => frame.includes('› Next cue'));
    view.mockInput.pressEscape();
    await view.waitForFrame(frame => frame.includes('› hidden continuation becomes readable'));
    expect(view.session.getState().snapshot.state).toBe('pause');
  } finally { view.cleanup(); }
});

test('lyric timing advances between MPD snapshots and freezes across a disconnected interval', async () => {
  class FastLyrics extends NoArtDemo {
    fail = false;
    async snapshot() { if (this.fail) throw new Error('Offline'); return super.snapshot(); }
    async lyrics(): Promise<Lyrics | undefined> { return parseLyrics('[00:00]Opening cue\n[00:00.20]Second cue\n[00:00.80]Later cue'); }
  }
  const backend = new FastLyrics();
  const view = await setup(100, 28, { backend });
  try {
    await backend.seek(1, 0);
    await backend.toggle();
    view.mockInput.pressKey('F2');
    await view.waitForFrame(frame => frame.includes('› Opening cue'));
    await new Promise(resolve => setTimeout(resolve, 250));
    await view.waitForFrame(frame => frame.includes('› Second cue'));
    backend.fail = true;
    await view.session.refresh();
    await view.waitForFrame(frame => frame.includes('disconnected') && frame.includes('› Second cue'));
    await new Promise(resolve => setTimeout(resolve, 850));
    expect(view.captureCharFrame()).toContain('› Second cue');
    backend.fail = false;
    await backend.seek(1, 1);
    await view.waitFor(() => view.session.getState().connection === 'connected');
    await view.waitForFrame(frame => frame.includes('› Later cue'));
    await backend.toggle();
    await view.waitForFrame(frame => frame.includes('paused') && frame.includes('› Later cue'));
  } finally { view.cleanup(); }
});

test('reopening a saved Lyrics page follows current playback without replaying a seek', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'music-lyric-state-'));
  const path = join(directory, 'state.json');
  try {
    const first = await setup(100, 28, { backend: new LyricsDemo(), state: new NavigationStateStore(path) });
    try {
      first.mockInput.pressKey('F2');
      await first.waitForFrame(frame => frame.includes('› Middle refrain'));
      await first.mockInput.typeText('jj', 0);
      first.mockInput.pressEnter();
      await first.waitFor(() => first.session.getState().snapshot.elapsed === 120);
    } finally { first.cleanup(); }
    const backend = new LyricsDemo();
    const reopened = await setup(100, 28, { backend, state: new NavigationStateStore(path), ready: frame => frame.includes('Following playback') && frame.includes('› Middle refrain') });
    try {
      expect(reopened.session.getState().snapshot.elapsed).toBe(83);
      expect(reopened.session.getState().snapshot.state).toBe('pause');
    } finally { reopened.cleanup(); }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('terminal navigation reveals only the viewport edge and restores it across resize and history', async () => {
  const view = await setup(65, 16);
  try {
    await view.mockInput.typeText('jjjjjjl', 0);
    await view.waitForFrame(frame => frame.includes('24 Hour Revenge') && frame.includes('3/17'));
    await view.mockInput.typeText('o', 0);
    await view.waitForFrame(frame => frame.includes('Now playing   7/7') && frame.includes('Boxcar'));
    expect(view.captureCharFrame()).not.toContain('Only Shallow\n');
    view.resize(44, 12);
    await view.waitForFrame(frame => frame.includes('7/7') && frame.includes('Boxcar'));
    view.resize(100, 28);
    await view.waitForFrame(frame => frame.includes('Now playing   7/7') && frame.includes('Only Shallow'));
  } finally { view.cleanup(); }
});

test('terminal queue controls address the selected occurrence and cancel a held move', async () => {
  const view = await setup();
  try {
    const before = await view.backend.snapshot();
    await view.mockInput.typeText('mjj', 0);
    view.mockInput.pressEscape();
    expect((await view.backend.snapshot()).queue).toEqual(before.queue);
    await view.mockInput.typeText('mj', 0);
    view.mockInput.pressEnter();
    await view.waitFor(() => view.session.getState().snapshot.queue[1]?.queueId === 1);
    expect(view.session.getState().snapshot.currentId).toBe(before.currentId);
    view.mockInput.pressEnter();
    await view.waitFor(() => view.session.getState().snapshot.state === 'play');
    view.mockInput.pressKey(' ');
    await view.waitFor(() => view.session.getState().snapshot.state === 'pause');
    view.mockInput.pressKey('DELETE');
    await view.waitFor(() => view.session.getState().snapshot.queue.length === 6);
    expect(view.session.getState().snapshot.queue.some(t => t.queueId === 1)).toBe(false);
  } finally { view.cleanup(); }
});

test('terminal viewport and metadata keep control characters out of display content', () => {
  expect(reveal(3, 1, 12, 5)).toBe(1);
  expect(reveal(6, 1, 12, 5)).toBe(2);
  expect(plain('title\n\x1b]52;c;secret\x07')).toBe('title  ]52;c;secret ');
});

test('terminal sort dropdown reorders the shelf while retaining its selected album', async () => {
  const view = await setup();
  try {
    view.mockInput.pressKey('F3');
    await view.waitForFrame(frame => frame.includes('Library / Albums') && frame.includes('1/8'));
    await view.mockInput.typeText('s', 0);
    await view.waitForFrame(frame => frame.includes('Year · newest first'));
    view.mockInput.pressArrow('down');
    view.mockInput.pressEnter();
    await view.waitForFrame(frame => frame.includes('Library / Albums') && frame.includes('5/8') && frame.includes('Album title A–Z'));
    expect(view.events.filter(e => e.action === 'visit')).toHaveLength(1);
    expect(view.captureCharFrame()).toContain('Love Ire & Song');
  } finally { view.cleanup(); }
});

test('a short terminal keeps the prompt input and selected result visible', async () => {
  const view = await setup(44, 12);
  try {
    await view.mockInput.typeText(':love ire', 0);
    await view.waitForFrame(frame => frame.includes(': love ire') && frame.includes('album') && frame.includes('track'));
    view.mockInput.pressArrow('down'); view.mockInput.pressEnter();
    await view.waitForFrame(frame => frame.includes('6/14') && frame.includes('Love Ire & Song'));
  } finally { view.cleanup(); }
});

test('reopening the terminal restores scroll, sorts and the forward branch without changing MPD playback', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'music-terminal-resume-'));
  const path = join(directory, 'state.json');
  try {
    const first = await setup(65, 16, { state: new NavigationStateStore(path) });
    const before = await first.backend.snapshot();
    try {
      first.mockInput.pressKey('F3');
      await first.mockInput.typeText('s', 0); first.mockInput.pressArrow('down'); first.mockInput.pressEnter();
      await first.mockInput.typeText(':loveless', 0); first.mockInput.pressEnter();
      await first.waitForFrame(frame => frame.includes('Loveless') && frame.includes('1/11'));
      await first.mockInput.typeText('jjjjjjjjh', 0);
      await first.waitForFrame(frame => frame.includes('My Bloody Valentine') && frame.includes('2/3'));
      await first.mockInput.typeText('s', 0); first.mockInput.pressArrow('down'); first.mockInput.pressEnter();
      await first.waitForFrame(frame => frame.includes('Year · newest first'));
      await first.mockInput.typeText('o', 0);
      await first.waitForFrame(frame => frame.includes('Loveless') && frame.includes('9/11'));
    } finally { first.cleanup(); }
    const persisted = new NavigationStateStore(path).read()!;
    expect(persisted.order).toMatchObject({ albums: 'title', artistAlbums: 'newest' });
    expect(persisted.history.cursor).toBeLessThan(persisted.history.entries.length - 1);
    const reopened = await setup(65, 16, { state: new NavigationStateStore(path), ready: frame => frame.includes('Loveless') && frame.includes('9/11') });
    try {
      expect(reopened.events).toHaveLength(0);
      expect(await reopened.backend.snapshot()).toEqual(before);
      expect(reopened.captureCharFrame()).toContain('Blown a Wish');
      await reopened.mockInput.typeText('i', 0);
      await reopened.waitForFrame(frame => frame.includes('My Bloody Valentine') && frame.includes('Year · newest first') && frame.includes('2/3'));
      await reopened.mockInput.typeText('o', 0);
      await reopened.waitForFrame(frame => frame.includes('Loveless') && frame.includes('9/11'));
      expect(await reopened.backend.snapshot()).toEqual(before);
    } finally { reopened.cleanup(); }
    expect(new NavigationStateStore(path).read()?.history).toEqual(persisted.history);
  } finally { rmSync(directory, { recursive: true }); }
});

test('an offline launch preserves saved navigation until the library returns, then restores it automatically', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'music-terminal-offline-'));
  const path = join(directory, 'state.json');
  try {
    const first = await setup(65, 16, { state: new NavigationStateStore(path) });
    await first.mockInput.typeText(':loveless', 0); first.mockInput.pressEnter();
    await first.waitForFrame(frame => frame.includes('Loveless') && frame.includes('1/11'));
    await first.mockInput.typeText('jjjjjjjj', 0);
    await first.waitForFrame(frame => frame.includes('9/11'));
    first.cleanup();
    const original = readFileSync(path, 'utf8');
    const backend = new NoArtDemo(), snapshot = backend.snapshot.bind(backend), library = backend.library.bind(backend);
    let online = false;
    backend.subscribe = () => () => {};
    backend.snapshot = async () => { if (!online) throw new Error('Offline'); return snapshot(); };
    backend.library = async () => { if (!online) throw new Error('Offline'); return library(); };
    const store = new NavigationStateStore(path);
    const view = await setup(65, 16, { state: store, backend, retryMs: 10, ready: frame => frame.includes('Offline') });
    try {
      store.flush(); expect(readFileSync(path, 'utf8')).toBe(original);
      online = true;
      await view.waitFor(() => view.session.getState().libraryReady && view.session.getState().snapshotReady);
      await view.waitForFrame(frame => frame.includes('Loveless') && frame.includes('9/11') && !frame.includes('Offline'));
      expect(view.events).toHaveLength(0);
    } finally { view.cleanup(); }
  } finally { rmSync(directory, { recursive: true }); }
});

test('terminal columns preview without playback, retain child selection, and adapt to narrow windows', async () => {
  const view = await setup(110, 30);
  try {
    const before = await view.backend.snapshot();
    await view.mockInput.typeText(':loveless', 0); view.mockInput.pressEnter();
    await view.waitForFrame(frame => frame.includes('ARTISTS 6') && frame.includes('ALBUMS 3') && frame.includes('› TRACKS 11'));
    await view.mockInput.typeText('jjjjjjjjhh', 0);
    await view.waitForFrame(frame => frame.includes('Library / Artists') && frame.includes('6/6') && frame.includes('Blown a Wish'));
    await view.mockInput.typeText('ll', 0);
    await view.waitForFrame(frame => frame.includes('Loveless') && frame.includes('9/11') && frame.includes('› TRACKS 11'));
    expect(await view.backend.snapshot()).toEqual(before);
    view.resize(80, 24);
    await view.waitForFrame(frame => frame.includes('ALBUMS 3') && frame.includes('› TRACKS 11') && !frame.includes('ARTISTS 6'));
    view.resize(44, 12);
    await view.waitForFrame(frame => frame.includes('9/11') && frame.includes('Blown a Wish'));
    view.resize(110, 30);
    await view.waitForFrame(frame => frame.includes('ARTISTS 6') && frame.includes('Blown a Wish'));
    await view.mockInput.typeText('hhk', 0);
    await view.waitForFrame(frame => frame.includes('Library / Artists') && frame.includes('5/6') && frame.includes('ALBUMS 1') && !frame.includes('Loveless'));
    const visits = view.events.filter(event => event.action === 'visit').length;
    view.mockInput.pressKey('F3');
    await view.waitForFrame(frame => frame.includes('Library / Artists') && frame.includes('5/6'));
    expect(view.events.filter(event => event.action === 'visit')).toHaveLength(visits);
    expect(await view.backend.snapshot()).toEqual(before);
  } finally { view.cleanup(); }
});
