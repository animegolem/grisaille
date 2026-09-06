import { expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NavigationHistory, type Place, type NavigationEvent } from '../src/history';
import { NavigationLog } from '../src/navigation-log';

const queue: Place = { route: { page: 'queue' }, selection: 4, selected: 'queue:42', viewport: { kind: 'list', index: 2, offset: 13, anchor: 'queue:20' } };
const album: Place = { route: { page: 'record', key: 'Loveless' }, selection: 0, selected: 'track:one' };
const artist: Place = { route: { page: 'artist', name: 'My Bloody Valentine' }, selection: 0 };

test('back returns to the actual source view and forward restores the visited track', () => {
  const history = new NavigationHistory(queue);
  history.visit(album);
  const moved = { ...album, selection: 7, selected: 'track:eight' };
  history.checkpoint(moved);
  expect(history.step('back')).toEqual(queue);
  expect(history.step('forward')).toEqual(moved);
  expect(history.step('forward')).toBeUndefined();
});

test('selection movement updates one visit; hierarchy actions remain retraceable', () => {
  const events: NavigationEvent[] = [];
  const history = new NavigationHistory(queue, e => events.push(e));
  history.visit(album);
  history.checkpoint({ ...album, selection: 2 });
  history.checkpoint({ ...album, selection: 3 });
  history.visit(artist);
  expect(history.step('back')?.route).toEqual(album.route);
  expect(history.step('back')).toEqual(queue);
  expect(history.step('back')).toBeUndefined();
  expect(events.filter(e => e.action === 'position')).toHaveLength(2);
});

test('a new destination branches forward history without deleting the audit trail', () => {
  const events: NavigationEvent[] = [];
  const history = new NavigationHistory(queue, e => events.push(e));
  history.visit(album);
  history.step('back');
  history.visit(artist);
  expect(history.canForward).toBe(false);
  expect(events.some(e => e.action === 'visit' && e.to.route.page === 'record')).toBe(true);
  expect(history.visit(artist)).toBe(false);
  const copy = history.current; copy.selection = 99;
  expect(history.current.selection).toBe(0);
});

test('the local journal appends ordered events across separate sessions', () => {
  const directory = mkdtempSync(join(tmpdir(), 'music-navigation-'));
  try {
    const first = new NavigationLog('demo', directory);
    new NavigationHistory(queue, e => first.append(e)).visit(album);
    const second = new NavigationLog('demo', directory);
    new NavigationHistory(queue, e => second.append(e)).visit(artist);
    const path = join(directory, readdirSync(directory)[0]!);
    const lines = readFileSync(path, 'utf8').trim().split('\n').map(line => JSON.parse(line));
    expect(lines).toHaveLength(2);
    expect(lines[0].session).not.toBe(lines[1].session);
    expect(lines.map(e => e.action)).toEqual(['visit', 'visit']);
    expect(statSync(path).mode & 0o777).toBe(0o600);
    expect(first.error).toBeUndefined();
  } finally { rmSync(directory, { recursive: true }); }
});
