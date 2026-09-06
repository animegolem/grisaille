/** @jsxImportSource @opentui/react */
import { expect, test } from 'bun:test';
import { createRoot, flushSync } from '@opentui/react';
import { createTestRenderer } from '@opentui/core/testing';
import { DemoBackend } from '../src/demo';
import { MusicSession } from '../src/music-session';
import { TerminalApp, plain, reveal } from '../src/terminal/app';
import type { NavigationEvent } from '../src/history';

class NoArtDemo extends DemoBackend { async artwork() { return undefined; } }
async function setup(width = 100, height = 28) {
  const view = await createTestRenderer({ width, height, kittyKeyboard: true });
  const backend = new NoArtDemo();
  const session = new MusicSession(backend);
  const events: NavigationEvent[] = [];
  const root = createRoot(view.renderer);
  flushSync(() => root.render(<TerminalApp session={session} record={event => events.push(event)} />));
  await view.waitForFrame(frame => frame.includes('Only Shallow') && frame.includes('1/7'));
  return { ...view, backend, session, events, cleanup() { root.unmount(); session.stop(); view.renderer.destroy(); } };
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
    view.mockInput.pressKey('F2');
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
