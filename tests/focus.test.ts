import { expect, test } from 'bun:test';
import { FocusSteps } from '../src/focus';

test('Tab then Enter waits for the destination control to gain native focus', () => {
  let focused = 'queue';
  const activated: string[] = [];
  const moves: string[] = [];
  const steps = new FocusSteps(direction => moves.push(direction), () => activated.push(focused));
  steps.enqueue('next');
  steps.enqueue('activate');
  expect(activated).toEqual([]);
  focused = 'albums';
  steps.didFocus();
  expect(moves).toEqual(['next']);
  expect(activated).toEqual(['albums']);
});

test('multiple rapid Tabs finish in order before Enter activates the last target', () => {
  let focused = 'queue';
  const activated: string[] = [];
  const moves: string[] = [];
  const steps = new FocusSteps(direction => moves.push(direction), () => activated.push(focused));
  steps.enqueue('next');
  steps.enqueue('next');
  steps.enqueue('activate');
  expect(moves).toEqual(['next']);
  focused = 'albums';
  steps.didFocus();
  expect(moves).toEqual(['next', 'next']);
  expect(activated).toEqual([]);
  focused = 'prompt';
  steps.didFocus();
  expect(activated).toEqual(['prompt']);
});

test('cancelled navigation cannot later activate a control', () => {
  let activations = 0;
  const steps = new FocusSteps(() => {}, () => activations++);
  steps.enqueue('previous');
  steps.enqueue('activate');
  steps.cancel();
  steps.didFocus();
  expect(activations).toBe(0);
  expect(steps.pending).toBe(false);
});
