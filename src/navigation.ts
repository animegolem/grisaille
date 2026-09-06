import type { EventPayload } from '@gpuix/react';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type NavigationKey = Pick<EventPayload, 'key' | 'keyChar' | 'modifiers'>;

export function directionOf(event: NavigationKey): Direction | undefined {
  if (event.modifiers?.cmd || event.modifiers?.ctrl || event.modifiers?.alt) return;
  const key = event.keyChar || event.key;
  if (event.key === 'up' || key === 'k') return 'up';
  if (event.key === 'down' || key === 'j') return 'down';
  if (event.key === 'left' || key === 'h') return 'left';
  if (event.key === 'right' || key === 'l') return 'right';
}

export function pageShortcut(event: NavigationKey): 'queue' | 'library' | undefined {
  if (!event.modifiers?.cmd || event.modifiers.ctrl || event.modifiers.alt || event.modifiers.shift) return;
  if (event.key === '1') return 'queue';
  if (event.key === '2') return 'library';
}

/** Horizontal movement stays on its row; a short last row retains a valid item. */
export function gridSelection(index: number, direction: Direction, columns: number, count: number): number {
  if (!count) return 0;
  if (direction === 'left') return index % columns ? index - 1 : index;
  if (direction === 'right') return index % columns < columns - 1 ? Math.min(count - 1, index + 1) : index;
  if (direction === 'up') return Math.max(0, index - columns);
  return Math.min(count - 1, index + columns);
}

/** The preview follows every pointer pixel; only the insertion target snaps. */
export function pointerDrag(source: number, dy: number, rowHeight: number, count: number) {
  return { offset: dy, target: Math.max(0, Math.min(count - 1, source + Math.round(dy / rowHeight))) };
}
