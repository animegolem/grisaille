import type { PaletteArtifact, RoleName, VerifiedPair } from './palette-contract';

type Immutable<T> = T extends object ? { readonly [K in keyof T]: Immutable<T[K]> } : T;
/** Portable input: the session owns admission/retention, the mapper only consumes it. */
export type ThemeSnapshot = Readonly<{
  retained: Immutable<PaletteArtifact> | null;
  bundleAssociation: 'default' | 'retained' | 'current-uri';
}>;
/** Data only; native and terminal adapters own conversion to their paint formats. */
export type Paint = string | {
  type: 'linear-gradient'; angle: number;
  stops: [{ color: string; position: number }, { color: string; position: number }];
  colorSpace?: 'srgb' | 'oklab';
};
export type ThemeColors = Readonly<{
  text: string; muted: string; accent: string; link: string; linkMuted: string;
  linkHover: string; control: string; controlActive: string; warning: string;
  placeholder: string; caret: string; textSelection: string;
}>;
export type TextTone = 'text' | 'muted' | 'accent' | 'warning';
export type ThemePair = Readonly<{
  background: string;
  colors: ThemeColors;
  /** This foreground meets the marker floor against THIS pair's background. */
  marker: string;
  border: string;
  proof: Readonly<{ source: 'producer' | 'neutral'; fg: string; bg: string; floor: number }>;
}>;
export type PairName = 'normal' | 'active' | 'selected' | 'context' | 'hover' | 'held';

const surfaceNames = [
  'canvas', 'header', 'main', 'queue', 'queueRow', 'queueRowHover', 'queueRowSelected', 'queueRowPlaying', 'queueHeld',
  'library', 'albumCard', 'albumCardHover', 'albumCardSelected', 'artistList', 'artistRow', 'artistRowHover', 'artistRowSelected',
  'record', 'recordRow', 'recordRowHover', 'recordRowSelected', 'lyrics', 'lyricRow', 'lyricRowSelected', 'lyricRowActive',
  'browserRow', 'browserRowHover', 'browserRowContext', 'browserRowSelected', 'detail', 'coverPlaceholder', 'transport',
  'progressTrack', 'progressFill', 'status', 'control', 'controlHover', 'controlActive', 'tab', 'tabHover', 'tabActive',
  'localFind', 'localFindInput', 'promptScrim', 'prompt', 'promptInput', 'promptResults', 'promptResult', 'promptResultHover',
  'promptResultSelected', 'sortMenu', 'sortItem', 'sortItemSelected',
] as const;
export type SurfaceName = typeof surfaceNames[number];
const borderNames = ['header', 'queueRow', 'recordRow', 'artistRow', 'detail', 'transport', 'browserColumn', 'browserActive',
  'prompt', 'promptDivider', 'sortMenu', 'queueInsertion', 'queueHeld', 'focus', 'control'] as const;
export type MusicTheme = Readonly<{
  surfaces: Readonly<Record<SurfaceName, Paint>>;
  colors: ThemeColors;
  borders: Readonly<Record<typeof borderNames[number], string>>;
  opacity: Readonly<{ heldSource: number }>;
  pairs: Readonly<Record<PairName, ThemePair>>;
  provenance: Readonly<{
    association: ThemeSnapshot['bundleAssociation'];
    status: 'default' | 'ok' | 'no-art';
    uri: string | null; artwork: string | null; sequence: number | null; producerRevision: string | null;
  }>;
}>;

/** IEC sRGB final-byte contrast, used only for the app-owned neutral defaults. */
export function contrast(a: string, b: string): number {
  const luminance = (hex: string) => [1, 3, 5].map(i => {
    const n = parseInt(hex.slice(i, i + 2), 16) / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i]!, 0);
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function colors(text: string, muted: string, accent: string, warning = accent): ThemeColors {
  return Object.freeze({ text, muted, accent, link: text, linkMuted: muted, linkHover: accent,
    control: text, controlActive: text, warning, placeholder: muted, caret: accent, textSelection: accent + '59' });
}
function neutral(background: string, highlighted = false): ThemePair {
  const text = '#dce0e3';
  const admitted = (color: string, floor: number) => contrast(color, background) >= floor ? color : text;
  return Object.freeze({ background,
    colors: colors(text, highlighted ? text : admitted('#a0adb6', 4.5), highlighted ? text : admitted('#b4d3e5', 4.5),
      highlighted ? text : admitted('#e4bda8', 4.5)),
    marker: text, border: admitted('#a0adb6', 3),
    proof: Object.freeze({ source: 'neutral', fg: text, bg: background, floor: contrast(text, background) }) });
}

/**
 * Pure snapshot -> complete theme. No host state, IO, time, mutation or interpolation.
 * The decoder established numeric truth; only named, adequately declared pairs are used.
 * Candidate/latestAttempt are deliberately outside this function's input contract.
 */
export function mapPaletteToTheme(snapshot: ThemeSnapshot): MusicTheme {
  const retained = snapshot.retained;
  const bundle = retained && retained.status !== 'failed' && retained.roles ? retained : null;
  const roles = bundle?.roles;
  const pair = (fg: RoleName, bg: RoleName, floor: number) => bundle?.verified_pairs?.find(
    (p): p is Immutable<VerifiedPair & { kind: 'contrast' }> => p.kind === 'contrast' && p.fg === fg && p.bg === bg && p.floor >= floor,
  );
  const normalProof = pair('text', 'background', 4.5);
  let normal = neutral('#242a30');
  if (roles && normalProof) {
    const text = roles.text.hex;
    const choose = (name: RoleName, floor: number) => pair(name, 'background', floor) ? roles[name]!.hex : text;
    normal = Object.freeze({ background: roles.background.hex,
      colors: colors(text, choose('frame', 4.5), choose('accent', 4.5)),
      marker: choose('active', 3), border: choose('frame', 3),
      proof: Object.freeze({ source: 'producer', fg: 'text', bg: 'background', floor: normalProof.floor }) });
  }
  const highlighted = (name: 'active' | 'selection', fallback: string) => {
    const proof = pair('highlight_text', name, 4.5);
    if (!roles?.[name] || !proof || (name === 'selection' && !bundle?.features.includes('selection'))) return neutral(fallback, true);
    const text = roles.highlight_text.hex;
    return Object.freeze({ background: roles[name]!.hex, colors: colors(text, text, text), marker: text, border: text,
      proof: Object.freeze({ source: 'producer' as const, fg: 'highlight_text', bg: name, floor: proof.floor }) });
  };
  const active = highlighted('active', '#282f36'), selected = highlighted('selection', '#3c515f');
  const pairs = Object.freeze({ normal, active, selected, context: normal, hover: normal, held: normal });
  const surfaces = Object.fromEntries(surfaceNames.map(name => [name, normal.background])) as Record<SurfaceName, Paint>;
  for (const name of ['main', 'queue', 'library', 'artistList', 'record', 'lyrics', 'detail', 'status', 'promptInput', 'localFindInput',
    'promptResults', 'control', 'tab'] as const) surfaces[name] = 'transparent';
  for (const name of ['queueRowSelected', 'albumCardSelected', 'artistRowSelected', 'recordRowSelected', 'lyricRowSelected',
    'browserRowSelected', 'promptResultSelected', 'sortItemSelected'] as const) surfaces[name] = selected.background;
  for (const name of ['queueRowPlaying', 'lyricRowActive', 'controlActive', 'tabActive'] as const) surfaces[name] = active.background;
  // The fill's guarantee is against the normal background, never frame/accent.
  // The native edge outlines this backdrop to keep the unfilled extent visible.
  surfaces.progressTrack = normal.background;
  surfaces.progressFill = normal.colors.accent;
  surfaces.promptScrim = '#00000070';
  const borders = Object.fromEntries(borderNames.map(name => [name, normal.border])) as Record<typeof borderNames[number], string>;
  for (const name of ['browserActive', 'queueInsertion', 'queueHeld', 'focus'] as const) borders[name] = normal.colors.accent;
  borders.control = 'transparent';
  return Object.freeze({ surfaces: Object.freeze(surfaces), colors: normal.colors, borders: Object.freeze(borders),
    opacity: Object.freeze({ heldSource: 0.45 }), pairs,
    provenance: Object.freeze({ association: bundle ? snapshot.bundleAssociation : 'default', status: bundle?.status ?? 'default',
      uri: bundle?.track.file ?? null, artwork: bundle?.track.art_sha256 ?? null, sequence: bundle?.sequence ?? null,
      producerRevision: bundle?.producer.revision ?? null }) });
}

/** Selection wins; active identity is a marker using the winning pair's foreground. */
export function pairForState(theme: MusicTheme, state: { selected?: boolean; active?: boolean; context?: boolean }): ThemePair {
  return state.selected ? theme.pairs.selected : state.active ? theme.pairs.active : state.context ? theme.pairs.context : theme.pairs.normal;
}

export const defaultTheme = mapPaletteToTheme({ retained: null, bundleAssociation: 'default' });
