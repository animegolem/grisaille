import { expect, test } from 'bun:test';
import { directionOf, gridSelection, listReveal, pageShortcut, pointerDrag } from '../src/navigation';

test('Vim and arrow keys agree without stealing modified shortcuts', () => {
  for (const [vim, arrow] of [['h', 'left'], ['j', 'down'], ['k', 'up'], ['l', 'right']]) {
    expect(directionOf({ key: vim })).toBe(directionOf({ key: arrow }));
  }
  const modifiers = { cmd: true, ctrl: false, alt: false, shift: false };
  expect(directionOf({ key: 'h', modifiers })).toBeUndefined();
  expect(pageShortcut({ key: '2' })).toBeUndefined();
  expect(pageShortcut({ key: '2', modifiers })).toBe('lyrics');
  expect(pageShortcut({ key: '1', modifiers })).toBe('queue');
  expect(pageShortcut({ key: '3', modifiers })).toBe('library');
  expect(pageShortcut({ key: '4', modifiers })).toBeUndefined();
});

test('cover navigation preserves row boundaries and handles a short final row', () => {
  expect(gridSelection(4, 'right', 5, 8)).toBe(4);
  expect(gridSelection(5, 'left', 5, 8)).toBe(5);
  expect(gridSelection(4, 'down', 5, 8)).toBe(7);
  expect(gridSelection(7, 'up', 5, 8)).toBe(2);
});

test('keyboard selection crosses visible rows before scrolling at either edge', () => {
  // Actual native track geometry from the regression: six whole rows fit.
  for (let index = 0; index < 6; index++) expect(listReveal(index, 52, [0, 0, 332.5])).toBeUndefined();
  expect(listReveal(6, 52, [0, 0, 332.5])).toEqual({ index: 0, offset: 31.5 });
  expect(listReveal(7, 52, [0, 31.5, 332.5])).toEqual({ index: 1, offset: 31.5 });
  expect(listReveal(2, 52, [1, 31.5, 332.5])).toBeUndefined();
  expect(listReveal(1, 52, [1, 31.5, 332.5])).toEqual({ index: 1, offset: 0 });
  expect(listReveal(0, 52, [1, 0, 332.5])).toEqual({ index: 0, offset: 0 });
});

test('queue and album rows use their actual heights without guessing an unmeasured viewport', () => {
  expect(listReveal(1, 68, [0, 0, 360])).toBeUndefined();
  expect(listReveal(5, 68, [0, 0, 360])).toEqual({ index: 0, offset: 48 });
  expect(listReveal(1, 280, [0, 0, 600])).toBeUndefined();
  expect(listReveal(2, 280, [0, 0, 600])).toEqual({ index: 0, offset: 240 });
  expect(listReveal(1, 52, null)).toBeUndefined();
  expect(listReveal(1, 52, [0, 0, 0])).toBeUndefined();
});

test('pointer motion stays continuous while insertion changes at row midpoints', () => {
  expect(pointerDrag(2, 12, 68, 7)).toEqual({ offset: 12, target: 2 });
  expect(pointerDrag(2, 35, 68, 7)).toEqual({ offset: 35, target: 3 });
  expect(pointerDrag(2, -35, 68, 7)).toEqual({ offset: -35, target: 1 });
  expect(pointerDrag(2, 700, 68, 7)).toEqual({ offset: 700, target: 6 });
});
