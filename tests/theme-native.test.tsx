import { expect, test } from 'bun:test';
import { useState } from 'react';
import { createTestRoot, hasNativeTestRenderer } from '@gpuix/react/testing';
import { readFileSync } from 'node:fs';
import { DemoBackend } from '../src/demo';
import { MusicSession, useMusic } from '../src/music-session';
import { PaletteSession } from '../src/palette-session';
import type { PaletteSource, PaletteSourceEvent } from '../src/palette-file';
import { ThemedInput, surface } from '../src/native-theme';
import { ThemeProvider, ThemePairProvider, useTheme, useThemePair } from '../src/use-theme';
import { pairForState } from '../src/theme';

const nativeTest = hasNativeTestRenderer ? test : test.skip;
const fixture = JSON.parse(readFileSync(new URL('./fixtures/palette/ok.json', import.meta.url), 'utf8'));
const ramp = JSON.parse(readFileSync(new URL('./fixtures/palette/host-ramp.json', import.meta.url), 'utf8'));
class Source implements PaletteSource {
  readonly path = '/synthetic/native-theme/palette.json';
  value = JSON.stringify({ ...fixture, track: { ...fixture.track, file: 'sample/loveless/0' } });
  listener?: (event: PaletteSourceEvent) => void;
  reads = 0; watches = 0;
  async read() { this.reads++; return this.value; }
  watch(listener: (event: PaletteSourceEvent) => void) { this.watches++; this.listener = listener; return () => { this.listener = undefined; }; }
  publish(value: unknown) { this.value = JSON.stringify(value); this.listener?.({ kind: 'change' }); }
}
class QuietDemo extends DemoBackend { async artwork() { return undefined; } }
function PairText() {
  const pair = useThemePair();
  return <text testId="state-text" style={{ color: pair.colors.muted }}>Secondary label</text>;
}
function Harness({ session }: { session: MusicSession }) {
  useMusic(session);
  const theme = useTheme(), [value, setValue] = useState('');
  const pair = pairForState(theme, { selected: true, active: true });
  return <div testId="canvas" style={{ width: 440, height: 180, ...surface(theme, 'canvas'), display: 'flex', flexDirection: 'column', gap: 12 }}>
    <ThemedInput testId="input" autoFocus value={value} placeholder="Find a record" onChange={event => setValue(event.value ?? '')}
      style={{ width: 400, height: 30, fontSize: 16, fontFamily: 'Menlo' }} />
    <ThemePairProvider pair={pair}><div testId="state" style={{ height: 30, background: pair.background }}><PairText /></div></ThemePairProvider>
  </div>;
}
async function setup() {
  const source = new Source(), session = new MusicSession(new QuietDemo(), 1000, new PaletteSession({ source }));
  const view = createTestRoot({ width: 440, height: 180 });
  view.render(<ThemeProvider session={session}><Harness session={session} /></ThemeProvider>);
  const wait = async (predicate: () => boolean) => {
    const deadline = Date.now() + 2000;
    while (true) {
      view.renderer.flush(); view.renderer.dispatchNativeEvents();
      if (predicate()) return;
      if (Date.now() > deadline) throw new Error('native theme condition timed out');
      await Bun.sleep(5);
    }
  };
  await wait(() => session.palette.getState().bundleAssociation === 'current-uri');
  return { ...view, source, session, wait, cleanup() { view.unmount(); session.stop(); } };
}

nativeTest('native binding publishes complete colors and placeholder on the same retained input', async () => {
  const view = await setup();
  try {
    const input = view.renderer.findByTestId('input')!;
    expect(input.customProps?.placeholder).toBe('');
    expect(view.renderer.findByTestId('input-placeholder')?.style.color).toBe(fixture.roles.text.hex);
    expect(view.renderer.findByTestId('state')?.style.background).toBe(fixture.roles.selection.hex);
    expect(view.renderer.findByTestId('state-text')?.style.color).toBe(fixture.roles.highlight_text.hex);
    const replacement = ramp.cases.find((item: any) => item.expectedBackground === '#ffffff').artifact;
    view.source.publish(replacement);
    await view.wait(() => view.renderer.findByTestId('canvas')?.style.background === '#ffffff');
    const after = view.renderer.findByTestId('input')!;
    expect(after.id).toBe(input.id);
    expect((after.customProps?.theme as any).caret).toBe('#000000');
    expect(view.renderer.findByTestId('input-placeholder')?.style.color).toBe('#000000');
    expect(view.source.watches).toBe(1);
  } finally { view.cleanup(); }
});

nativeTest('native input keeps query and typing focus through publication, and hiding survives an empty echo', async () => {
  const view = await setup();
  try {
    const input = view.renderer.findByTestId('input')!;
    view.renderer.nativeSimulateKeystrokes(input.id, 'h i');
    await view.wait(() => view.renderer.findByTestId('input')?.customProps?.value === 'hi');
    expect(view.renderer.findByTestId('input-placeholder')).toBeUndefined();
    const before = await view.session.backend.snapshot();
    view.source.publish(ramp.cases.find((item: any) => item.expectedBackground === '#ffffff').artifact);
    await view.wait(() => view.renderer.findByTestId('canvas')?.style.background === '#ffffff');
    view.renderer.simulateKeystrokes('x');
    await view.wait(() => view.renderer.findByTestId('input')?.customProps?.value === 'hix');
    expect(view.renderer.findByTestId('input')?.id).toBe(input.id);
    expect(await view.session.backend.snapshot()).toEqual(before);
    view.renderer.simulateKeystrokes('cmd-a backspace');
    await view.wait(() => view.renderer.findByTestId('input')?.customProps?.value === '');
    expect(view.renderer.findByTestId('input-placeholder')).toBeUndefined();
    // The offscreen renderer cannot activate its window and did not deliver
    // focus/blur callbacks here. Blur reset is checked in the production probe.
    expect(view.renderer.findByTestId('input')?.id).toBe(input.id);
  } finally { view.cleanup(); }
});
