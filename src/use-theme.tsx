import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';
import type { MusicSession } from './music-session';
import { defaultTheme, mapPaletteToTheme, type ThemePair } from './theme';
import { usePalette } from './use-palette';

const ThemeContext = createContext(defaultTheme);
const PairContext = createContext<ThemePair | undefined>(undefined);

/** Subscription only. MusicSession/useMusic retains sole lifecycle ownership. */
export function ThemeProvider({ session, children }: { session: MusicSession; children: ReactNode }) {
  const snapshot = usePalette(session);
  const theme = useMemo(() => mapPaletteToTheme(snapshot), [snapshot.retained, snapshot.bundleAssociation]);
  return createElement(ThemeContext.Provider, { value: theme }, createElement(PairContext.Provider, { value: theme.pairs.normal }, children));
}
export function ThemePairProvider({ pair, children }: { pair: ThemePair; children: ReactNode }) {
  return createElement(PairContext.Provider, { value: pair }, children);
}
export function useTheme() { return useContext(ThemeContext); }
export function useThemePair() {
  const theme = useTheme();
  return useContext(PairContext) ?? theme.pairs.normal;
}
