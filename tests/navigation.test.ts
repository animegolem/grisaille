import { expect, test } from 'bun:test';
import { directionOf, gridSelection, pageShortcut, pointerDrag } from '../src/navigation';

test('Vim and arrow keys agree without stealing modified shortcuts', () => {
  for (const [vim, arrow] of [['h', 'left'], ['j', 'down'], ['k', 'up'], ['l', 'right']]) {
    expect(directionOf({ key: vim })).toBe(directionOf({ key: arrow }));
  }
  const modifiers = { cmd: true, ctrl: false, alt: false, shift: false };
  expect(directionOf({ key: 'h', modifiers })).toBeUndefined();
  expect(pageShortcut({ key: '2' })).toBeUndefined();
  expect(pageShortcut({ key: '2', modifiers })).toBe('library');
  expect(pageShortcut({ key: '1', modifiers })).toBe('queue');
  expect(pageShortcut({ key: '3', modifiers })).toBeUndefined();
});

test('cover navigation preserves row boundaries and handles a short final row', () => {
  expect(gridSelection(4, 'right', 5, 8)).toBe(4);
  expect(gridSelection(5, 'left', 5, 8)).toBe(5);
  expect(gridSelection(4, 'down', 5, 8)).toBe(7);
  expect(gridSelection(7, 'up', 5, 8)).toBe(2);
});

test('pointer motion stays continuous while insertion changes at row midpoints', () => {
  expect(pointerDrag(2, 12, 68, 7)).toEqual({ offset: 12, target: 2 });
  expect(pointerDrag(2, 35, 68, 7)).toEqual({ offset: 35, target: 3 });
  expect(pointerDrag(2, -35, 68, 7)).toEqual({ offset: -35, target: 1 });
  expect(pointerDrag(2, 700, 68, 7)).toEqual({ offset: 700, target: 6 });
});
