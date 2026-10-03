import { expect, test } from 'bun:test';
import { EventEmitter } from 'node:events';
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, watch, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  FilePaletteSource, paletteSourceFromEnvironment,
  type PaletteFileDependencies, type PaletteSourceEvent,
} from '../src/palette-file';

class FakeWatcher extends EventEmitter {
  closes = 0;
  unrefs = 0;
  constructor(readonly changed: () => void) { super(); }
  close() { this.closes++; this.emit('close'); }
  unref() { this.unrefs++; }
}

function fakeFile() {
  let identity: string | Error = 'device:1';
  let watchError: Error | undefined;
  let atWatch: (() => void) | undefined;
  const watches: FakeWatcher[] = [];
  const paths: string[] = [];
  const reads: string[] = [];
  const timers: { callback: () => void; delay: number; cancelled: boolean; unrefs: number; unref(): void }[] = [];
  const dependencies: PaletteFileDependencies = {
    read: async path => { reads.push(path); return 'complete file bytes'; },
    directoryIdentity: path => { paths.push(path); if (identity instanceof Error) throw identity; return identity; },
    watchDirectory: (path, changed) => {
      paths.push(path);
      if (watchError) throw watchError;
      const watcher = new FakeWatcher(changed);
      watches.push(watcher);
      atWatch?.();
      return watcher;
    },
    setTimeout: (callback, delay) => {
      const timer = { callback, delay, cancelled: false, unrefs: 0, unref() { this.unrefs++; } };
      timers.push(timer);
      return timer;
    },
    clearTimeout: timer => { (timer as typeof timers[number]).cancelled = true; },
  };
  const source = new FilePaletteSource('/fixture/palette/palette.json', dependencies);
  const events: PaletteSourceEvent[] = [];
  return {
    source, dependencies, events, watches, paths, reads, timers,
    setIdentity(value: string | Error) { identity = value; },
    setWatchError(value: Error | undefined) { watchError = value; },
    atWatch(value: () => void) { atWatch = value; },
    start() { return source.watch(event => events.push(event)); },
    fire() { const timer = timers.at(-1)!; expect(timer.cancelled).toBe(false); timer.callback(); },
  };
}

test('palette discovery uses producer XDG/home paths without touching the filesystem', () => {
  const home = '/does-not-exist/palette-fixture-home';
  expect(paletteSourceFromEnvironment(false, {}, home).source?.path).toBe(`${home}/.config/rmpc-auto-theme/palette/palette.json`);
  expect(paletteSourceFromEnvironment(false, { XDG_CONFIG_HOME: '/custom/config' }, home).source?.path).toBe('/custom/config/rmpc-auto-theme/palette/palette.json');
  expect(paletteSourceFromEnvironment(false, { XDG_CONFIG_HOME: '' }, home).source?.path).toBe(`${home}/.config/rmpc-auto-theme/palette/palette.json`);
  expect(paletteSourceFromEnvironment(false, { XDG_CONFIG_HOME: 'relative/config' }, home)).toEqual({
    diagnostic: 'Palette source disabled: XDG_CONFIG_HOME (or the home directory fallback) must be absolute, with no NUL.',
  });
  expect(existsSync(home)).toBe(false);
});

test('explicit palette binding expands home and rejects invalid nonempty overrides without fallback', () => {
  expect(paletteSourceFromEnvironment(false, { MUSIC_UI_PALETTE_PATH: '~/chosen.json' }, '/fixture/home').source?.path).toBe('/fixture/home/chosen.json');
  expect(paletteSourceFromEnvironment(false, { MUSIC_UI_PALETTE_PATH: '/other/../chosen.json', MPD_HOST: 'elsewhere' }).source?.path).toBe('/chosen.json');
  for (const value of ['relative.json', '~someone/palette.json', ' ', '/bad\0path']) {
    const result = paletteSourceFromEnvironment(false, { MUSIC_UI_PALETTE_PATH: value }, '/fixture/home');
    expect(result.source).toBeUndefined();
    expect(result.diagnostic).toContain('MUSIC_UI_PALETTE_PATH must be an absolute path');
  }
  expect(paletteSourceFromEnvironment(false, { MUSIC_UI_PALETTE_PATH: '' }, '/fixture/home').source).toBeDefined();
  expect(() => new FilePaletteSource('relative.json')).toThrow('must be absolute');
});

test('demo never discovers any live source or reports live-source configuration errors', () => {
  for (const env of [{}, { MUSIC_UI_PALETTE_PATH: '/explicit/palette.json' }, { MUSIC_UI_PALETTE_PATH: 'invalid', MPD_HOST: 'other' }]) {
    expect(paletteSourceFromEnvironment(true, env, '/fixture/home')).toEqual({});
  }
});

test('default MPD identity mirrors password@host and numeric port parsing without leaking credentials', () => {
  for (const env of [{}, { MPD_HOST: '', MPD_PORT: '' }, { MPD_HOST: '127.0.0.1', MPD_PORT: '6600' },
    { MPD_HOST: 'secret@127.0.0.1', MPD_PORT: '06600' }, { MPD_HOST: '@127.0.0.1', MPD_PASSWORD: 'secret' }]) {
    expect(paletteSourceFromEnvironment(false, env, '/fixture/home').source).toBeDefined();
  }
  for (const env of [{ MPD_HOST: 'localhost' }, { MPD_HOST: '/fixture/mpd.sock' }, { MPD_HOST: '::1' },
    { MPD_PORT: '6601' }, { MPD_PORT: 'invalid' }, { MPD_HOST: 'secret@other' }, { MPD_HOST: 'secret@more@127.0.0.1' }]) {
    const result = paletteSourceFromEnvironment(false, env, '/fixture/home');
    expect(result).toEqual({ diagnostic: 'Palette source disabled: non-default MPD target has no bound palette source; set MUSIC_UI_PALETTE_PATH to opt in.' });
    expect(result.diagnostic).not.toContain('secret');
    expect(paletteSourceFromEnvironment(false, { ...env, MUSIC_UI_PALETTE_PATH: '/bound/palette.json' }).source?.path).toBe('/bound/palette.json');
  }
});

test('watch attaches to the parent before ready and leaves reading to its owner', async () => {
  const fake = fakeFile();
  const stop = fake.start();
  expect(fake.events).toEqual([{ kind: 'ready' }]);
  expect(fake.paths.every(path => path === '/fixture/palette')).toBe(true);
  expect(fake.reads).toHaveLength(0);
  expect(fake.watches[0]!.unrefs).toBe(1);
  expect(await fake.source.read()).toBe('complete file bytes');
  expect(fake.reads).toEqual(['/fixture/palette/palette.json']);
  stop(); stop();
  expect(fake.watches[0]!.closes).toBe(1);
  expect(fake.timers).toHaveLength(0);
});

test('missing parent retries 1/2/4/8/10 seconds, continues at cap, and cancels on stop', () => {
  const fake = fakeFile();
  fake.setIdentity(new Error('ENOENT fixture parent'));
  const stop = fake.start();
  for (let i = 0; i < 6; i++) fake.fire();
  expect(fake.timers.map(timer => timer.delay)).toEqual([1000, 2000, 4000, 8000, 10000, 10000, 10000]);
  expect(fake.timers.every(timer => timer.unrefs === 1)).toBe(true);
  expect(fake.events.every(event => event.kind === 'error')).toBe(true);
  expect(fake.watches).toHaveLength(0);
  const oldTimer = fake.timers.at(-1)!;
  stop();
  expect(oldTimer.cancelled).toBe(true);
  oldTimer.callback();
  expect(fake.timers).toHaveLength(7);
});

test('watch failure and unexpected close reattach; success resets the backoff', () => {
  const fake = fakeFile();
  fake.setWatchError(new Error('EMFILE fixture'));
  const stop = fake.start();
  fake.fire(); fake.fire();
  expect(fake.timers.map(timer => timer.delay)).toEqual([1000, 2000, 4000]);
  fake.setWatchError(undefined);
  fake.fire();
  expect(fake.events.at(-1)).toEqual({ kind: 'ready' });
  fake.watches[0]!.emit('error', new Error('EIO fixture'));
  fake.watches[0]!.emit('error', new Error('duplicate obsolete error'));
  expect(fake.watches[0]!.closes).toBe(1);
  expect(fake.timers.map(timer => timer.delay)).toEqual([1000, 2000, 4000, 1000]);
  fake.fire();
  fake.watches[1]!.emit('close');
  expect(fake.timers.at(-1)!.delay).toBe(1000);
  expect(fake.events.at(-1)).toEqual({ kind: 'error', message: 'Palette watcher closed; waiting to reattach.' });
  stop();
  expect(fake.timers.at(-1)!.cancelled).toBe(true);
});

test('parent deletion/replacement detaches obsolete inode, then reattaches without a player event', () => {
  const fake = fakeFile();
  const stop = fake.start();
  fake.setIdentity(new Error('ENOENT deleted parent'));
  fake.watches[0]!.changed();
  expect(fake.watches[0]!.closes).toBe(1);
  expect(fake.timers).toHaveLength(1);
  fake.setIdentity('device:2'); fake.fire();
  expect(fake.events.at(-1)).toEqual({ kind: 'ready' });
  fake.setIdentity('device:3'); fake.watches[1]!.changed();
  expect(fake.events.at(-1)).toEqual({ kind: 'error', message: 'Palette directory was replaced; waiting to reattach.' });
  fake.fire();
  const count = fake.events.length;
  fake.watches[0]!.changed(); fake.watches[1]!.changed();
  expect(fake.events).toHaveLength(count);
  stop();
  expect(fake.watches.map(watcher => watcher.closes)).toEqual([1, 1, 1]);
});

test('replacement during attachment cannot announce ready for the obsolete directory', () => {
  const fake = fakeFile();
  fake.atWatch(() => fake.setIdentity('device:2'));
  const stop = fake.start();
  expect(fake.events).toEqual([{ kind: 'error', message: 'Palette directory was replaced; waiting to reattach.' }]);
  expect(fake.watches[0]!.closes).toBe(1);
  fake.fire();
  expect(fake.events.at(-1)).toEqual({ kind: 'ready' });
  stop();
});

test('synchronous watch invalidation closes the handle returned after that invalidation', () => {
  const fake = fakeFile();
  fake.atWatch(() => { fake.setIdentity(new Error('removed while attaching')); fake.watches.at(-1)!.changed(); });
  const stop = fake.start();
  expect(fake.events.map(event => event.kind)).toEqual(['error']);
  expect(fake.watches[0]!.closes).toBe(1);
  expect(fake.timers).toHaveLength(1);
  stop();
});

test('all change notifications invalidate, and cleanup inside an event cancels subsequent work', () => {
  const fake = fakeFile();
  let stop = () => {};
  stop = fake.source.watch(event => {
    fake.events.push(event);
    if (fake.events.length === 4) stop();
  });
  const watcher = fake.watches[0]!;
  // No filename filter: absent names, duplicates and temporary-sibling noise all enter this same callback.
  watcher.changed(); watcher.changed(); watcher.changed(); watcher.changed();
  expect(fake.events.map(event => event.kind)).toEqual(['ready', 'change', 'change', 'change']);
  expect(watcher.closes).toBe(1);
  expect(fake.timers).toHaveLength(0);
});

test('old callbacks and cancelled timers cannot change a restarted subscription', () => {
  const fake = fakeFile();
  const stopOld = fake.start();
  fake.watches[0]!.emit('error', new Error('old error'));
  const oldTimer = fake.timers[0]!;
  stopOld();
  const stopNew = fake.start();
  const count = fake.events.length;
  const paths = fake.paths.length;
  oldTimer.callback();
  fake.watches[0]!.changed(); fake.watches[0]!.emit('close'); fake.watches[0]!.emit('error', new Error('late error'));
  stopOld();
  expect(fake.events).toHaveLength(count);
  expect(fake.paths).toHaveLength(paths);
  expect(fake.watches[1]!.closes).toBe(0);
  fake.watches[1]!.changed();
  expect(fake.events.at(-1)).toEqual({ kind: 'change' });
  stopNew();
  expect(fake.watches.map(watcher => watcher.closes)).toEqual([1, 1]);
});

test('cleanup during an error notification cancels the recovery it just scheduled', () => {
  const fake = fakeFile();
  let stop = () => {};
  stop = fake.source.watch(event => { if (event.kind === 'error') stop(); });
  fake.watches[0]!.emit('error', new Error('fixture error'));
  expect(fake.watches[0]!.closes).toBe(1);
  expect(fake.timers[0]!.cancelled).toBe(true);
  fake.timers[0]!.callback();
  expect(fake.watches).toHaveLength(1);
});

test('throwing initial consumers release resources and preserve the consumer exception', () => {
  const marker = new Error('consumer exception');
  const healthy = fakeFile();
  expect(() => healthy.source.watch(() => { throw marker; })).toThrow(marker);
  expect(healthy.watches[0]!.closes).toBe(1);
  expect(healthy.timers).toHaveLength(0);
  const missing = fakeFile();
  missing.setIdentity(new Error('ENOENT fixture'));
  expect(() => missing.source.watch(() => { throw marker; })).toThrow(marker);
  expect(missing.timers[0]!.cancelled).toBe(true);
  missing.timers[0]!.callback();
  expect(missing.timers).toHaveLength(1);
});

async function until(condition: () => boolean, message: string) {
  const deadline = Date.now() + 2500;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error(`Timed out: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

test('real parent watch observes sibling write + atomic rename, reattaches after parent replacement, then cleans up', async () => {
  const root = mkdtempSync(join(tmpdir(), 'grisaille-palette-file-'));
  const parent = join(root, 'palette');
  mkdirSync(parent);
  const path = join(parent, 'palette.json');
  writeFileSync(path, 'first');
  const events: PaletteSourceEvent[] = [];
  let opens = 0, closes = 0;
  const source = new FilePaletteSource(path, {
    watchDirectory: (directory, changed) => {
      opens++;
      const watcher = watch(directory, changed);
      watcher.once('close', () => closes++);
      return watcher;
    },
    setTimeout: callback => setTimeout(callback, 10),
  });
  const stop = source.watch(event => events.push(event));
  try {
    expect(events).toEqual([{ kind: 'ready' }]);
    expect(await source.read()).toBe('first');
    writeFileSync(join(parent, 'palette.json.tmp'), 'second complete artifact');
    renameSync(join(parent, 'palette.json.tmp'), path);
    await until(() => events.some(event => event.kind === 'change'), 'atomic file replacement event');
    expect(await source.read()).toBe('second complete artifact');
    renameSync(parent, join(root, 'obsolete'));
    mkdirSync(parent);
    writeFileSync(path, 'third complete artifact');
    await until(() => events.filter(event => event.kind === 'ready').length >= 2, 'parent inode replacement recovery');
    expect(await source.read()).toBe('third complete artifact');
    const count = events.length;
    writeFileSync(path, 'fourth');
    await until(() => events.length > count, 'new parent watcher');
    expect(await source.read()).toBe('fourth');
    stop();
    await until(() => closes === opens, 'all filesystem watchers closed');
    const stoppedCount = events.length;
    writeFileSync(path, 'after stop');
    writeFileSync(join(root, 'obsolete', 'palette.json'), 'obsolete inode');
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(events).toHaveLength(stoppedCount);
  } finally { stop(); rmSync(root, { recursive: true, force: true }); }
});

test('real missing parent stays absent until externally created and missing files reject normally', async () => {
  const root = mkdtempSync(join(tmpdir(), 'grisaille-palette-missing-'));
  const parent = join(root, 'missing');
  const path = join(parent, 'palette.json');
  const events: PaletteSourceEvent[] = [];
  const source = new FilePaletteSource(path, { setTimeout: callback => setTimeout(callback, 10) });
  const stop = source.watch(event => events.push(event));
  try {
    await expect(source.read()).rejects.toThrow();
    await until(() => events.length >= 2, 'missing parent retry');
    expect(existsSync(parent)).toBe(false);
    mkdirSync(parent);
    await until(() => events.some(event => event.kind === 'ready'), 'externally created parent recovery');
    await expect(source.read()).rejects.toThrow();
    writeFileSync(path, 'created externally');
    await until(() => events.some(event => event.kind === 'change'), 'newly published artifact');
    expect(await source.read()).toBe('created externally');
  } finally { stop(); rmSync(root, { recursive: true, force: true }); }
});
