import records from './sample-library.json';
import { albumKey, moveQueue, type MusicBackend, type Track, type QueueTrack, type Snapshot } from './model';

export class DemoBackend implements MusicBackend {
  readonly demo = true;
  private tracks: Track[] = records.flatMap(a => a.tracks.map((t, i) => ({
    uri: `sample/${a.id}/${i}`, title: t.title, artist: a.artist, album: a.title,
    year: String(a.year), number: t.number, duration: t.duration, art: a.art,
  })));
  private queue: QueueTrack[];
  private currentId = 1;
  private playState: Snapshot['state'] = 'pause';
  private serial = 100;
  private listeners = new Set<() => void>();

  constructor() {
    const entries = [['loveless', 0], ['loveless', 1], ['loveless', 7], ['loveless', 4], ['loveire', 5], ['pity', 0], ['revenge', 2]] as const;
    this.queue = entries.map(([id, index], i) => ({
      ...this.tracks.find(t => t.uri === `sample/${id}/${index}`)!, queueId: i + 1,
    })).filter(t => t.uri);
  }
  async library() { return this.tracks; }
  async snapshot(): Promise<Snapshot> { return { queue: [...this.queue], currentId: this.currentId, state: this.playState, elapsed: 83, volume: 75 }; }
  async artwork(t: Track) { return t.art || this.tracks.find(x => albumKey(x) === albumKey(t))?.art; }
  private changed() { for (const listener of this.listeners) listener(); }
  async toggle() { this.playState = this.playState === 'play' ? 'pause' : 'play'; this.changed(); }
  async next() { const i = this.queue.findIndex(t => t.queueId === this.currentId); this.currentId = this.queue[(i + 1) % this.queue.length]?.queueId ?? 1; this.changed(); }
  async previous() { const i = this.queue.findIndex(t => t.queueId === this.currentId); this.currentId = this.queue[(i - 1 + this.queue.length) % this.queue.length]?.queueId ?? 1; this.changed(); }
  async play(id: number) { this.currentId = id; this.playState = 'play'; this.changed(); }
  async enqueue(track: Track, play = false) { const entry = { ...track, queueId: ++this.serial }; this.queue = [...this.queue, entry]; if (play) { this.currentId = entry.queueId; this.playState = 'play'; } this.changed(); }
  async move(id: number, beforeId: number | null) { this.queue = moveQueue(this.queue, id, beforeId); this.changed(); }
  subscribe(changed: () => void) { this.listeners.add(changed); return () => { this.listeners.delete(changed); }; }
}
