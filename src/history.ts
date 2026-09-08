export type Route =
  | { page: 'queue' }
  | { page: 'library'; mode: 'covers' | 'artists' }
  | { page: 'artist'; name: string }
  | { page: 'record'; key: string; artist?: string };

export type QueueIdentity = { uri: string; occurrence: number };
export type Viewport =
  | { kind: 'list'; index: number; offset: number; anchor?: string; queue?: QueueIdentity }
  | { kind: 'grid'; x: number; y: number; columns: number };

export type BrowserColumn = 'artists' | 'albums' | 'tracks';
export type BrowserPosition = { selection: number; selected?: string; viewport?: Viewport };
export type BrowserTrail = {
  artists?: BrowserPosition;
  albums?: BrowserPosition & { artist: string };
  tracks?: BrowserPosition & { album: string };
};
export type Place = BrowserPosition & { route: Route; queue?: QueueIdentity; browser?: BrowserTrail };
export type HistoryState = { entries: Place[]; cursor: number };
export type NavigationEvent = {
  action: 'visit' | 'back' | 'forward' | 'position';
  from: Place;
  to: Place;
  cursor: number;
  length: number;
};

export function sameRoute(a: Route, b: Route): boolean { return JSON.stringify(a) === JSON.stringify(b); }

/** The jump list stores views and positions, never playback or queue commands. */
export class NavigationHistory {
  private entries: Place[];
  private cursor = 0;
  constructor(initial: Place, private record: (event: NavigationEvent) => void = () => {}, private limit = 200) {
    this.entries = [structuredClone(initial)];
  }
  get current() { return structuredClone(this.entries[this.cursor]!); }
  get canBack() { return this.cursor > 0; }
  get canForward() { return this.cursor < this.entries.length - 1; }
  snapshot(): HistoryState { return structuredClone({ entries: this.entries, cursor: this.cursor }); }
  restore(state: HistoryState) {
    if (!state.entries.length || !Number.isInteger(state.cursor) || state.cursor < 0 || state.cursor >= state.entries.length) return;
    const start = Math.max(0, state.cursor - this.limit + 1);
    this.entries = structuredClone(state.entries.slice(start, start + this.limit));
    this.cursor = state.cursor - start;
  }

  checkpoint(place: Place, log = true) {
    const from = this.current;
    this.entries[this.cursor] = structuredClone(place);
    if (log && (from.selection !== place.selection || from.selected !== place.selected)) this.emit('position', from);
  }
  visit(place: Place, from = this.current): boolean {
    this.checkpoint(from, false);
    if (sameRoute(from.route, place.route) && from.selected === place.selected && from.selection === place.selection) return false;
    this.entries = this.entries.slice(0, this.cursor + 1);
    this.entries.push(structuredClone(place));
    if (this.entries.length > this.limit) this.entries.shift();
    this.cursor = this.entries.length - 1;
    this.emit('visit', from);
    return true;
  }
  step(direction: 'back' | 'forward', from = this.current): Place | undefined {
    this.checkpoint(from, false);
    if (direction === 'back' ? !this.canBack : !this.canForward) return;
    this.cursor += direction === 'back' ? -1 : 1;
    this.emit(direction, from);
    return this.current;
  }
  private emit(action: NavigationEvent['action'], from: Place) {
    this.record({ action, from: structuredClone(from), to: this.current, cursor: this.cursor, length: this.entries.length });
  }
}
