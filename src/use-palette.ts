import { useSyncExternalStore } from 'react';
import type { MusicSession } from './music-session';

/** Subscription only: useMusic/MusicSession owns the single palette lifecycle. */
export function usePalette(session: MusicSession) {
  return useSyncExternalStore(session.palette.subscribe, session.palette.getState);
}
