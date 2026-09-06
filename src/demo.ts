import records from './sample-library.json';
import { albumKey, moveQueue, type Album, type MusicBackend, type Track, type QueueTrack, type Snapshot } from './model';

export class DemoBackend implements MusicBackend {
  readonly demo = true;
  private tracks: Track[] = records.flatMap(a => a.tracks.map((t, i) => ({
    uri: `sample/${a.id}/${i}`, title: t.title, artist: a.artist, album: a.title,
    year: String(a.year), number: t.number, duration: t.duration, art: a.art,
  })));
  private queue: QueueTrack[];
  private currentId: number | undefined = 1;
  private playState: Snapshot['state'] = 'pause';
  private elapsed = 83;
  private startedAt = Date.now();
  private serial = 100;
  private listeners = new Set<() => void>();

  constructor() {
    const entries = [['loveless', 0], ['loveless', 1], ['loveless', 7], ['loveless', 4], ['loveire', 5], ['pity', 0], ['revenge', 2]] as const;
    this.queue = entries.map(([id, index], i) => ({
      ...this.tracks.find(t => t.uri === `sample/${id}/${index}`)!, queueId: i + 1,
    })).filter(t => t.uri);
  }
  async library() { return this.tracks; }
  async snapshot(): Promise<Snapshot> { this.updateClock(); return { queue: [...this.queue], currentId: this.currentId, state: this.playState, elapsed: this.elapsed, volume: 75 }; }
  async artwork(t: Track) { return t.art || this.tracks.find(x => albumKey(x) === albumKey(t))?.art; }
  private changed() { for (const listener of this.listeners) listener(); }
  private updateClock() {
    const now = Date.now();
    if (this.playState === 'play') this.elapsed += (now - this.startedAt) / 1000;
    this.startedAt = now;
    const duration = this.queue.find(t => t.queueId === this.currentId)?.duration || 0;
    if (this.elapsed >= duration && this.playState === 'play') {
      const index = this.queue.findIndex(t => t.queueId === this.currentId);
      const next = this.queue[index + 1];
      this.elapsed = 0; this.currentId = next?.queueId;
      if (!next) this.playState = 'stop';
    }
  }
  async toggle() {
    this.updateClock();
    if (this.playState === 'play') this.playState = 'pause';
    else { this.currentId ??= this.queue[0]?.queueId; if (this.currentId !== undefined) this.playState = 'play'; }
    this.changed();
  }
  private skip(delta: number) {
    const i = this.queue.findIndex(t => t.queueId === this.currentId);
    this.currentId = this.queue[(i + delta + this.queue.length) % this.queue.length]?.queueId;
    this.elapsed = 0; this.startedAt = Date.now(); this.changed();
  }
  async next() { this.skip(1); }
  async previous() { this.skip(-1); }
  async play(id: number) {
    if (!this.queue.some(t => t.queueId === id)) throw new Error('The queue changed. Select the track again.');
    this.currentId = id; this.elapsed = 0; this.startedAt = Date.now(); this.playState = 'play'; this.changed();
  }
  private async append(tracks: Track[], play: boolean) {
    const entries = tracks.map(track => ({ ...track, queueId: ++this.serial }));
    this.queue = [...this.queue, ...entries];
    if (play && entries.length) await this.play(entries[0]!.queueId); else this.changed();
    return entries.map(t => t.queueId);
  }
  async enqueue(track: Track, play = false) { await this.append([track], play); }
  async enqueueAlbum(album: Album, play = false) { return this.append(album.tracks, play); }
  async seek(id: number, seconds: number) {
    if (!Number.isFinite(seconds)) throw new Error('Invalid seek position.');
    const track = this.queue.find(t => t.queueId === id);
    if (!track || this.currentId !== id) throw new Error('The playing track changed. Seek again.');
    this.elapsed = Math.max(0, Math.min(track.duration, seconds)); this.startedAt = Date.now(); this.changed();
  }
  async remove(id: number) {
    const index = this.queue.findIndex(t => t.queueId === id);
    if (index < 0) throw new Error('The queue changed. Select the track again.');
    this.queue = this.queue.filter(t => t.queueId !== id);
    if (this.currentId === id) {
      this.currentId = this.queue[index]?.queueId; this.elapsed = 0; this.startedAt = Date.now();
      if (this.currentId === undefined) this.playState = 'stop';
    }
    this.changed();
  }
  async move(id: number, beforeId: number | null) { this.queue = moveQueue(this.queue, id, beforeId); this.changed(); }
  subscribe(changed: () => void) {
    this.listeners.add(changed);
    const timer = setInterval(() => { if (this.playState === 'play') changed(); }, 1000);
    return () => { clearInterval(timer); this.listeners.delete(changed); };
  }
}
