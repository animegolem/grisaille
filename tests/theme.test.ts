import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { decodePaletteArtifact, type PaletteArtifact } from '../src/palette-contract';
import { contrast, defaultTheme, mapPaletteToTheme, pairForState, type ThemeSnapshot } from '../src/theme';
import { demoPaletteProbeConfiguration } from '../src/demo-palette-probe';

function fixture(name = 'ok') { return JSON.parse(readFileSync(new URL(`./fixtures/palette/${name}.json`, import.meta.url), 'utf8')); }
function decoded(value = fixture()) {
  const result = decodePaletteArtifact(JSON.stringify(value), () => {});
  if (!result.ok) throw new Error(result.error);
  return result.artifact;
}
const snapshot = (retained: PaletteArtifact | null, association: ThemeSnapshot['bundleAssociation'] = 'current-uri'): ThemeSnapshot => ({ retained, bundleAssociation: association });

test('pure mapping uses complete verified pairs and the winning foreground for playing-selected states', () => {
  const artifact = decoded(), theme = mapPaletteToTheme(snapshot(artifact));
  if (artifact.status !== 'ok') throw new Error('fixture');
  expect(theme.pairs.normal.background).toBe(artifact.roles.background.hex);
  expect(theme.pairs.normal.colors.text).toBe(artifact.roles.text.hex);
  expect(theme.pairs.active.background).toBe(artifact.roles.active.hex);
  expect(theme.pairs.selected.background).toBe(artifact.roles.selection!.hex);
  expect(theme.pairs.selected.colors.text).toBe(artifact.roles.highlight_text.hex);
  for (const state of [{ active: true, selected: true }, { active: false, selected: true }]) {
    const pair = pairForState(theme, state);
    expect(pair).toBe(theme.pairs.selected);
    expect(pair.marker).toBe(pair.colors.text);
    expect(contrast(pair.marker, pair.background)).toBeGreaterThanOrEqual(3);
    for (const name of ['text', 'muted', 'accent', 'warning', 'link', 'linkMuted', 'linkHover'] as const) expect(pair.colors[name]).toBe(pair.colors.text);
  }
  expect(pairForState(theme, { active: true })).toBe(theme.pairs.active);
  expect(pairForState(theme, { context: true })).toBe(theme.pairs.context);
  expect(theme.pairs.hover).toBe(theme.pairs.normal);
});

test('missing or unadvertised selection uses a complete neutral bundle, never album text on neutral fill', () => {
  for (const omitRole of [false, true]) {
    const raw = fixture(); raw.features = [];
    raw.verified_pairs = raw.verified_pairs.filter((pair: any) => pair.bg !== 'selection' && pair.kind !== 'delta_l');
    if (omitRole) delete raw.roles.selection;
    const theme = mapPaletteToTheme(snapshot(decoded(raw)));
    expect(theme.pairs.selected).toEqual(defaultTheme.pairs.selected);
    expect(theme.pairs.selected.proof.source).toBe('neutral');
    expect(theme.pairs.selected.colors.text).not.toBe(raw.roles.highlight_text.hex);
    expect(theme.pairs.normal.proof.source).toBe('producer');
  }
});

test('an optional selection role with a verified pair still requires its advertised capability', () => {
  const raw = fixture(); raw.features = [];
  expect(raw.verified_pairs.some((pair: any) => pair.bg === 'selection')).toBe(true);
  expect(mapPaletteToTheme(snapshot(decoded(raw))).pairs.selected).toEqual(defaultTheme.pairs.selected);
});

test('probe injection fails closed and isolates every navigation IO edge', () => {
  const env = { MUSIC_UI_THEME_PROBE_DIR: '/tmp/grisaille-theme-test/isolated', MUSIC_UI_PALETTE_PATH: '/private/live/palette.json' };
  for (const args of [[], ['--demo']]) expect(demoPaletteProbeConfiguration(args, env)).toBeUndefined();
  expect(() => demoPaletteProbeConfiguration(['--theme-probe'], env)).toThrow('requires --demo');
  for (const directory of [undefined, '', 'relative', '/tmp/invalid\0path']) {
    expect(() => demoPaletteProbeConfiguration(['--demo', '--theme-probe'], { MUSIC_UI_THEME_PROBE_DIR: directory })).toThrow('explicit absolute path');
  }
  const config = demoPaletteProbeConfiguration(['--demo', '--theme-probe'], env)!;
  expect(config.paletteSource.source?.path).toBe('/tmp/grisaille-theme-test/isolated/palette.json');
  expect(config.navigationStateDirectory).toBe('/tmp/grisaille-theme-test/isolated/state');
  expect(config.navigationLogDirectory).toBe('/tmp/grisaille-theme-test/isolated/navigation');
  expect(env.MUSIC_UI_PALETTE_PATH).toBe('/private/live/palette.json');
});

test('empty guarantee lists and inadequate declared floors are not promoted into host guarantees', () => {
  for (const mode of ['empty', 'low-floor']) {
    const raw = fixture(); raw.features = [];
    raw.verified_pairs = mode === 'empty' ? [] : raw.verified_pairs.map((pair: any) => pair.kind === 'contrast' ? { ...pair, floor: 1 } : pair);
    const theme = mapPaletteToTheme(snapshot(decoded(raw)));
    expect(theme.pairs.normal).toEqual(defaultTheme.pairs.normal);
    expect(theme.pairs.active).toEqual(defaultTheme.pairs.active);
    expect(theme.pairs.selected).toEqual(defaultTheme.pairs.selected);
  }
});

test('small muted text does not use frame/background whose only declared floor is 3', () => {
  const raw = fixture();
  const theme = mapPaletteToTheme(snapshot(decoded(raw)));
  expect(theme.pairs.normal.colors.muted).toBe(raw.roles.text.hex);
  expect(theme.pairs.normal.colors.placeholder).toBe(raw.roles.text.hex);
  expect(theme.pairs.normal.border).toBe(raw.roles.frame.hex);
});

test('the monochrome ramp keeps seek fill distinct from its actual track backdrop', () => {
  const ramp = fixture('host-ramp');
  const raw = ramp.cases.find((item: any) => item.name === 'gray-00').artifact;
  expect(raw.roles.frame.hex).toBe(raw.roles.accent.hex);
  const theme = mapPaletteToTheme(snapshot(decoded(raw)));
  expect(contrast(theme.surfaces.progressFill as string, theme.surfaces.progressTrack as string)).toBeGreaterThanOrEqual(3);
  expect(contrast(theme.pairs.normal.border, theme.surfaces.progressTrack as string)).toBeGreaterThanOrEqual(3);
});

test('an adequate pair for a different backdrop cannot justify text on the normal background', () => {
  const raw = fixture(); raw.features = [];
  raw.verified_pairs = raw.verified_pairs.filter((pair: any) => !(pair.kind === 'contrast' && pair.fg === 'accent' && pair.bg === 'background'));
  const theme = mapPaletteToTheme(snapshot(decoded(raw)));
  expect(theme.colors.accent).toBe(raw.roles.text.hex);
  expect(theme.colors.caret).toBe(raw.roles.text.hex);
});

test('mapping preserves retained provenance and ignores a failed latest attempt or wrong-URI candidate', () => {
  const retained = decoded();
  const input = { ...snapshot(retained, 'retained'), latestAttempt: decoded(fixture('failed')), candidate: decoded(fixture('no-art')) };
  const theme = mapPaletteToTheme(input);
  expect(theme.provenance.association).toBe('retained');
  expect(theme.provenance.uri).toBe(retained.track.file);
  expect(theme.provenance.artwork).toBe(retained.track.art_sha256);
  expect(theme.provenance.sequence).toBe(retained.sequence);
  expect(theme).toEqual(mapPaletteToTheme(snapshot(retained, 'retained')));
});

test('no-art verified bundle stays no-art; absent or failed bundles use defaults', () => {
  const noArt = mapPaletteToTheme(snapshot(decoded(fixture('no-art-verified'))));
  expect(noArt.provenance.status).toBe('no-art');
  expect(noArt.provenance.artwork).toBeNull();
  expect(noArt.pairs.normal.proof.source).toBe('producer');
  for (const artifact of [null, decoded(fixture('no-art')), decoded(fixture('failed'))]) {
    expect(mapPaletteToTheme(snapshot(artifact))).toEqual(defaultTheme);
  }
});

test('all neutral text and markers satisfy their actual final-byte backdrops', () => {
  for (const pair of Object.values(defaultTheme.pairs)) {
    for (const name of ['text', 'muted', 'accent', 'warning', 'link', 'linkMuted', 'linkHover', 'placeholder', 'caret'] as const) {
      expect(contrast(pair.colors[name], pair.background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(pair.marker, pair.background)).toBeGreaterThanOrEqual(3);
    expect(contrast(pair.border, pair.background)).toBeGreaterThanOrEqual(3);
  }
});

test('mapping is deterministic, deeply immutable and does not freeze or alter its input', () => {
  const retained = decoded(), input = snapshot(retained), before = JSON.stringify(input);
  const a = mapPaletteToTheme(input), b = mapPaletteToTheme(input);
  expect(a).toEqual(b);
  expect(JSON.stringify(input)).toBe(before);
  expect(Object.isFrozen(retained)).toBe(false);
  for (const value of [a, a.surfaces, a.colors, a.borders, a.opacity, a.provenance, a.pairs, a.pairs.selected, a.pairs.selected.colors, a.pairs.selected.proof]) expect(Object.isFrozen(value)).toBe(true);
  expect(Object.keys(a.surfaces)).toEqual(Object.keys(defaultTheme.surfaces));
  expect(Object.values(a.surfaces).every(value => typeof value === 'string')).toBe(true);
});
