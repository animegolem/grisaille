/** @jsxImportSource @opentui/react */
import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createRoot, flushSync } from '@opentui/react';
import { RGBA, type CapturedFrame, type InputRenderable } from '@opentui/core';
import { createTestRenderer } from '@opentui/core/testing';
import { DemoBackend } from '../src/demo';
import { MusicSession } from '../src/music-session';
import { PaletteSession } from '../src/palette-session';
import type { PaletteSource, PaletteSourceEvent } from '../src/palette-file';
import { defaultTheme, mapPaletteToTheme, type TextTone, type ThemePair } from '../src/theme';
import { TerminalApp } from '../src/terminal/app';
import { parseLyrics } from '../src/lyrics';
import type { NavigationEvent } from '../src/history';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/palette/${name}.json`, import.meta.url), 'utf8'));
const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
class Source implements PaletteSource {
  readonly path = '/synthetic-test/palette.json';
  raw = ''; error?: Error;
  listener?: (event: PaletteSourceEvent) => void;
  read = async () => { if (this.error) throw this.error; return this.raw; };
  watch = (listener: (event: PaletteSourceEvent) => void) => { this.listener = listener; return () => { this.listener = undefined; }; };
  async publish(value: unknown) { this.raw = JSON.stringify(value); this.error = undefined; this.listener?.({ kind: 'change' }); await settle(); }
}
class NoArtDemo extends DemoBackend {
  async artwork() { return undefined; }
  async lyrics() { return parseLyrics('[00:00]Opening line\n[01:00]Middle refrain\n[01:30]Next verse'); }
}
async function setup() {
  const view = await createTestRenderer({ width: 110, height: 30, kittyKeyboard: true });
  const counts: Record<string, number> = {};
  const backend = new Proxy(new NoArtDemo(), { get(target, key, receiver) {
    const value = Reflect.get(target, key, receiver);
    return typeof value === 'function' ? (...args: unknown[]) => {
      counts[String(key)] = (counts[String(key)] || 0) + 1;
      return value.apply(target, args);
    } : value;
  } });
  const initial = await backend.snapshot(), uri = initial.queue.find(track => track.queueId === initial.currentId)!.uri;
  const source = new Source(), palette = new PaletteSession({ source }), session = new MusicSession(backend, 60_000, palette);
  const events: NavigationEvent[] = [], root = createRoot(view.renderer);
  flushSync(() => root.render(<TerminalApp session={session} record={event => events.push(event)} />));
  await view.waitForFrame(frame => frame.includes('Only Shallow') && frame.includes('1/7'));
  const publish = async (name = 'ok', otherUri?: string) => {
    const value = fixture(name); value.track.file = otherUri || uri;
    await source.publish(value); await view.flush();
    return value;
  };
  return { ...view, source, palette, session, counts, events, publish,
    theme: () => mapPaletteToTheme(palette.getState()),
    input: () => view.renderer.root.findDescendantById('music-prompt') as InputRenderable,
    cleanup() { root.unmount(); session.stop(); view.renderer.destroy(); },
  };
}
type View = Awaited<ReturnType<typeof setup>>;
/** Checks the renderer's actual serialized cell colors; this is not a terminal-display claim. */
function paint(frame: CapturedFrame, needle: string, pair: ThemePair, tone: TextTone = 'text', lineNeedle = needle) {
  const line = frame.lines.find(line => line.spans.map(span => span.text).join('').includes(lineNeedle));
  expect(line, `visible text: ${needle}`).toBeDefined();
  const start = line!.spans.map(span => span.text).join('').indexOf(needle), end = start + needle.length;
  let offset = 0;
  for (const span of line!.spans) {
    const last = offset + span.text.length;
    if (last > start && offset < end) {
      expect(span.fg.toInts(), `${needle} foreground`).toEqual(RGBA.fromHex(pair.colors[tone]).toInts());
      expect(span.bg.toInts(), `${needle} background`).toEqual(RGBA.fromHex(pair.background).toInts());
    }
    offset = last;
  }
}
const colors = (view: View) => view.captureSpans().lines.map(line => line.spans.map(span => ({ text: span.text, fg: span.fg.toInts(), bg: span.bg.toInts() })));

test('terminal publication repaints selected-playing rows, secondary text and active tabs without backend work', async () => {
  const view = await setup();
  try {
    paint(view.captureSpans(), ' 1 ▶ Only Shallow', defaultTheme.pairs.selected);
    const before = { ...view.counts }, events = view.events.slice();
    await view.publish();
    const theme = view.theme(), frame = view.captureSpans();
    paint(frame, ' 1 ▶ Only Shallow', theme.pairs.selected);
    paint(frame, 'My Bloody Valentine · Loveless', theme.pairs.selected, 'muted');
    paint(frame, 'F1 Now playing', theme.pairs.active);
    paint(frame, 'No cover', theme.pairs.normal, 'muted');
    expect(view.counts).toEqual(before); expect(view.events).toEqual(events);
    await view.mockInput.typeText('j', 0);
    await view.waitForFrame(frame => frame.includes('Now playing   2/7'));
    paint(view.captureSpans(), ' 1 ▶ Only Shallow', theme.pairs.active);
    paint(view.captureSpans(), ' 2 Loomer', theme.pairs.selected);
  } finally { view.cleanup(); }
});

test('missing selection proof renders the entire selected row in its neutral fallback pair', async () => {
  const view = await setup();
  try {
    const value = await view.publish(); value.features = [];
    value.verified_pairs = value.verified_pairs.filter((pair: { kind: string; bg?: string }) => pair.bg !== 'selection' && pair.kind !== 'delta_l');
    await view.source.publish(value); await view.flush();
    expect(view.theme().pairs.normal.proof.source).toBe('producer');
    expect(view.theme().pairs.selected.proof.source).toBe('neutral');
    paint(view.captureSpans(), ' 1 ▶ Only Shallow', defaultTheme.pairs.selected);
    paint(view.captureSpans(), 'My Bloody Valentine · Loveless', defaultTheme.pairs.selected, 'muted');
  } finally { view.cleanup(); }
});

test('wrong-URI artifacts, failed attempts and read errors retain the rendered bundle', async () => {
  const view = await setup();
  try {
    await view.publish(); const retained = colors(view), before = { ...view.counts };
    await view.publish('no-art-verified', 'other/track.flac');
    expect(view.palette.getState().attemptAssociation).toBe('other-uri'); expect(colors(view)).toEqual(retained);
    await view.publish('failed');
    expect(view.palette.getState().latestAttempt!.status).toBe('failed'); expect(colors(view)).toEqual(retained);
    view.source.error = new Error('test source unavailable'); view.source.listener?.({ kind: 'change' });
    await settle(); await view.flush();
    expect(view.palette.getState().diagnostics.read).toBe('test source unavailable'); expect(colors(view)).toEqual(retained);
    expect(view.counts).toEqual(before);
  } finally { view.cleanup(); }
});

test('terminal prompt repaints placeholder and caret while retaining the exact focused input, query and cursor', async () => {
  const view = await setup();
  try {
    await view.mockInput.typeText(':', 0);
    await view.waitForFrame(frame => frame.includes('Find an artist, album, track or action'));
    const input = view.input(); expect(input.focused).toBe(true);
    paint(view.captureSpans(), 'Find an artist, album, track or action', defaultTheme.pairs.normal, 'muted');
    await view.publish();
    expect(view.input()).toBe(input); expect(input.focused).toBe(true);
    paint(view.captureSpans(), 'Find an artist, album, track or action', view.theme().pairs.normal, 'muted');
    expect(input.cursorColor.toInts()).toEqual(RGBA.fromHex(view.theme().colors.caret).toInts());
    await view.mockInput.typeText('love', 0); view.mockInput.pressArrow('left'); await view.flush();
    const cursor = input.cursorOffset, before = { ...view.counts };
    await view.publish('no-art-verified');
    expect(view.input()).toBe(input); expect(input.value).toBe('love'); expect(input.focused).toBe(true); expect(input.cursorOffset).toBe(cursor);
    expect(input.cursorColor.toInts()).toEqual(RGBA.fromHex(view.theme().colors.caret).toInts());
    expect(input.placeholderColor.toInts()).toEqual(RGBA.fromHex(view.theme().colors.placeholder).toInts());
    paint(view.captureSpans(), 'love', view.theme().pairs.normal);
    expect(view.counts).toEqual(before);
    await view.mockInput.typeText('X', 0); await view.waitForFrame(frame => frame.includes(': lovXe'));
    expect(view.input()).toBe(input);
  } finally { view.cleanup(); }
});

test('prompt results, browser rows and sort items use complete selected pairs', async () => {
  const view = await setup();
  try {
    await view.publish(); const theme = view.theme();
    await view.mockInput.typeText(':loveless', 0);
    await view.waitForFrame(frame => frame.includes('album  Loveless'));
    paint(view.captureSpans(), 'album  Loveless', theme.pairs.selected);
    paint(view.captureSpans(), 'My Bloody Valentine · 1991', theme.pairs.selected, 'muted');
    view.mockInput.pressEnter(); await view.waitForFrame(frame => frame.includes('› TRACKS 11'));
    paint(view.captureSpans(), '› Only Shallow', theme.pairs.selected);
    paint(view.captureSpans(), '01 · 4:18', theme.pairs.selected, 'muted');
    paint(view.captureSpans(), 'Loveless', theme.pairs.context, 'text', '· Loveless');
    view.mockInput.pressKey('F3'); await view.waitForFrame(frame => frame.includes('Library / Albums'));
    await view.mockInput.typeText('s', 0); await view.waitForFrame(frame => frame.includes('Year · newest first'));
    paint(view.captureSpans(), '› Artist A–Z', theme.pairs.selected);
  } finally { view.cleanup(); }
});

test('active lyrics use the active pair; selected-active lyrics keep the marker in the winning pair', async () => {
  const view = await setup();
  try {
    await view.publish(); const theme = view.theme();
    view.mockInput.pressKey('F2'); await view.waitForFrame(frame => frame.includes('› Middle refrain'));
    paint(view.captureSpans(), '› Middle refrain', theme.pairs.active);
    await view.mockInput.typeText('jk', 0); await view.waitForFrame(frame => frame.includes('› Middle refrain •'));
    paint(view.captureSpans(), '› Middle refrain •', theme.pairs.selected);
    await view.publish('no-art-verified');
    paint(view.captureSpans(), '› Middle refrain •', view.theme().pairs.selected);
  } finally { view.cleanup(); }
});
