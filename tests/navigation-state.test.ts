import { expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { NavigationHistory, type NavigationEvent } from '../src/history';
import { NavigationStateStore, navigationStatePath, parseNavigationState, type NavigationState } from '../src/navigation-state';
import { defaultOrder } from '../src/library-order';
import { identifyPlace, resolvePlace } from '../src/locations';
import { DemoBackend } from '../src/demo';

function state(): NavigationState {
  const history = new NavigationHistory({ route: { page: 'queue' }, selection: 4 });
  history.visit({ route: { page: 'record', key: 'record', artist: 'artist' }, selection: 8, selected: 'track:nine.flac', viewport: { kind: 'list', index: 6, offset: 23.5 } });
  history.visit({ route: { page: 'artist', name: 'artist' }, selection: 2 });
  history.step('back');
  return { version: 1, history: history.snapshot(), order: { albums: 'title', artistAlbums: 'newest', artists: 'za' }, libraryView: 'artists' };
}
test('exit flush restores the selected item, viewport, sorts and both history directions without new visits', () => {
  const directory = mkdtempSync(join(tmpdir(), 'music-resume-'));
  try {
    const path = navigationStatePath('demo', 'tui', directory), expected = state();
    const store = new NavigationStateStore(path);
    const detach = store.attach(() => expected);
    store.schedule(); detach();
    const loaded = new NavigationStateStore(path).read();
    expect(loaded).toEqual(expected);
    expect(statSync(path).mode & 0o777).toBe(0o600);
    expect(readdirSync(directory)).toEqual([path.split('/').at(-1)!]);
    const events: NavigationEvent[] = [];
    const restored = new NavigationHistory({ route: { page: 'queue' }, selection: 0 }, e => events.push(e));
    restored.restore(loaded!.history);
    expect(restored.current.viewport).toMatchObject({ index: 6, offset: 23.5 });
    expect(restored.canBack && restored.canForward).toBe(true);
    expect(events).toHaveLength(0);
    expect(restored.step('forward')?.route.page).toBe('artist');
    restored.step('back');
    expect(restored.step('back')?.selection).toBe(4);
  } finally { rmSync(directory, { recursive: true }); }
});

test('startup with unavailable data leaves the last saved state intact', () => {
  const directory = mkdtempSync(join(tmpdir(), 'music-resume-'));
  try {
    const path = navigationStatePath('mpd', 'gui', directory), original = JSON.stringify(state());
    writeFileSync(path, original);
    const store = new NavigationStateStore(path);
    expect(store.read()?.history.cursor).toBe(1);
    const detach = store.attach(() => undefined); store.schedule(); detach();
    expect(readFileSync(path, 'utf8')).toBe(original);
    expect(navigationStatePath('mpd', 'tui', directory)).not.toBe(path);
    expect(navigationStatePath('demo', 'gui', directory)).not.toBe(path);
  } finally { rmSync(directory, { recursive: true }); }
});

test('invalid, truncated and future state files fall back without crashing or accepting bad positions', () => {
  const directory = mkdtempSync(join(tmpdir(), 'music-resume-'));
  try {
    const path = join(directory, 'state.json');
    for (const value of ['{', JSON.stringify({ ...state(), version: 2 }), JSON.stringify({ ...state(), history: { entries: [], cursor: 0 } })]) {
      writeFileSync(path, value);
      const store = new NavigationStateStore(path);
      expect(store.read()).toBeUndefined(); expect(store.error).toContain('could not be read');
      expect(readFileSync(path, 'utf8')).toBe(value);
    }
    const invalid = state(); invalid.history.entries[0]!.selection = -1;
    expect(() => parseNavigationState(invalid)).toThrow();
    expect(() => parseNavigationState({ ...state(), order: { ...defaultOrder, albums: 'missing' } })).toThrow();
  } finally { rmSync(directory, { recursive: true }); }
});

test('restored queue selection survives recycled IDs and keeps the matching duplicate occurrence', async () => {
  const original = (await new DemoBackend().snapshot()).queue;
  const duplicate = { ...original[0]!, queueId: 44 };
  const items = [...original, duplicate];
  const point = identifyPlace({ route: { page: 'queue' }, selection: 7, viewport: { kind: 'list', index: 0, offset: 7 } }, items);
  const changed = [original[1]!, ...items.filter(t => t.queueId !== original[1]!.queueId)].map((t, i) => ({ ...t, queueId: 44 + i }));
  const restored = resolvePlace(point, { albums: [], artists: [], queue: changed });
  expect(changed[restored.selection]?.uri).toBe(duplicate.uri);
  expect(restored.selection).toBe(7);
  expect(restored.viewport).toMatchObject({ index: 1, offset: 7 });
});
