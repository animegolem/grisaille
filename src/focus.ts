type FocusStep = 'next' | 'previous' | 'activate';

/** Native focus changes arrive later than their requesting key events. */
export class FocusSteps {
  private steps: FocusStep[] = [];
  private waiting = false;

  constructor(private move: (direction: 'next' | 'previous') => void, private activate: () => void) {}

  get pending() { return this.waiting || this.steps.length > 0; }

  enqueue(step: FocusStep) {
    this.steps.push(step);
    this.drain();
  }

  didFocus() {
    this.waiting = false;
    this.drain();
  }

  cancel() {
    this.steps = [];
    this.waiting = false;
  }

  private drain() {
    while (!this.waiting && this.steps.length) {
      const step = this.steps.shift()!;
      if (step === 'activate') this.activate();
      else {
        this.waiting = true;
        this.move(step);
      }
    }
  }
}
