import type { LinearGradientBackground, StyleDesc } from '@gpuix/react';

/** App-owned fills accept solid colours or GPUIX's two-stop gradients. */
export type Paint = string | LinearGradientBackground;

// Separate addresses are intentional, even when their initial values match.
// Transparent panels reveal the canvas, allowing one continuous app-wide gradient.
const surfaces = {
  canvas: '#242a30',
  header: '#282f36',
  main: 'transparent',
  queue: 'transparent',
  queueRow: 'transparent',
  queueRowHover: 'transparent',
  queueRowSelected: '#3c515f',
  queueHeld: '#282f36',
  library: 'transparent',
  albumCard: 'transparent',
  albumCardHover: 'transparent',
  albumCardSelected: '#3c515f',
  artistList: 'transparent',
  artistRow: 'transparent',
  artistRowHover: 'transparent',
  artistRowSelected: '#3c515f',
  record: 'transparent',
  recordRow: 'transparent',
  recordRowHover: 'transparent',
  recordRowSelected: '#3c515f',
  detail: 'transparent',
  coverPlaceholder: '#1c2329',
  transport: '#282f36',
  progressTrack: '#43515d',
  progressFill: '#b4d3e5',
  status: 'transparent',
  control: 'transparent',
  controlHover: '#3c515f',
  controlActive: '#3c515f',
  tab: 'transparent',
  tabHover: '#3c515f',
  tabActive: '#3c515f',
  localFind: '#1c2329',
  localFindInput: 'transparent',
  promptScrim: '#00000070',
  prompt: '#1c2329',
  promptInput: 'transparent',
  promptResults: 'transparent',
  promptResult: 'transparent',
  promptResultHover: 'transparent',
  promptResultSelected: '#3c515f',
  sortMenu: '#1c2329',
  sortItem: 'transparent',
  sortItemSelected: '#3c515f',
} satisfies Record<string, Paint>;

const colors = {
  text: '#dce0e3', muted: '#a0adb6', accent: '#b4d3e5',
  link: '#dce0e3', linkMuted: '#a0adb6', linkHover: '#b4d3e5',
  control: '#dce0e3', controlActive: '#b4d3e5',
  warning: '#e4bda8', placeholder: '#a0adb6', caret: '#b4d3e5',
  textSelection: '#b4d3e559',
};
const borders = {
  header: '#43515d', queueRow: '#43515d', recordRow: '#43515d',
  artistRow: '#43515d', detail: '#43515d', transport: '#43515d',
  prompt: '#43515d', promptDivider: '#43515d', sortMenu: '#43515d',
  queueInsertion: '#b4d3e5', queueHeld: '#b4d3e5',
  focus: '#b4d3e5', control: 'transparent',
};

export type SurfaceName = keyof typeof surfaces;
export type MusicTheme = {
  surfaces: Record<SurfaceName, Paint>;
  colors: typeof colors;
  borders: typeof borders;
  opacity: { heldSource: number };
};

/** One palette boundary; no sampler, persistence or runtime theme UI yet. */
export const theme: MusicTheme = { surfaces, colors, borders, opacity: { heldSource: 0.45 } };

export function surface(name: SurfaceName): Pick<StyleDesc, 'background'> {
  const paint = theme.surfaces[name];
  // An unpainted GPUIX wrapper also lets pointer hits reach its parent.
  return { background: paint === 'transparent' ? undefined : paint };
}

/** Native inputs paint their own caret and placeholder, so address those too. */
export function inputTheme() {
  return {
    appearance: 'dark' as const, bg: 'transparent', text: theme.colors.text,
    textMuted: theme.colors.placeholder, textFaint: theme.colors.placeholder,
    textDim: theme.colors.placeholder, accent: theme.colors.accent,
    caret: theme.colors.caret,
  };
}
