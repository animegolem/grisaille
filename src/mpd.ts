import { createConnection } from 'node:net';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { type MusicBackend, type Track, type QueueTrack, type Snapshot } from './model';

const run = promisify(execFile);
const mpc = existsSync('/opt/homebrew/bin/mpc') ? '/opt/homebrew/bin/mpc' : 'mpc';
const separator = '\u001f';
const format = ['file', 'artist', 'album', 'title', 'time', 'date', 'track'].map(k => `%${k}%`).join(separator);

export function quote(value: string): string {
  if (/[\r\n\0]/.test(value)) throw new Error('MPD arguments cannot contain line breaks or NUL.');
  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

export function parseFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const at = line.indexOf(': ');
    if (at >= 0) fields[line.slice(0, at).toLowerCase()] = line.slice(at + 2);
  }
  return fields;
}

function trackFrom(fields: Record<string, string>): Track {
  return {
    uri: fields.file || '', title: fields.title || fields.file?.split('/').at(-1) || 'Untitled',
    artist: fields.artist || 'Unknown artist', album: fields.album || 'Unknown album',
    year: fields.date?.slice(0, 4) || '', number: parseInt(fields.track || '0') || 0,
    duration: Number(fields.duration || fields.time || 0),
  };
}

export function parseQueue(text: string): QueueTrack[] {
  return text.split(/(?=^file: )/m).filter(s => s.startsWith('file: ')).map(block => {
    const fields = parseFields(block);
    const queueId = Number(fields.id);
    if (!Number.isInteger(queueId) || queueId < 0) throw new Error('MPD returned a queue entry without a stable ID.');
    return { ...trackFrom(fields), queueId };
  });
}

export function parseLibrary(text: string): Track[] {
  return text.split('\n').filter(Boolean).map(line => {
    const [uri, artist, album, title, time, year, number] = line.split(separator);
    if (number === undefined) throw new Error('Unexpected library response from mpc.');
    return {
      uri: uri!, artist: artist || 'Unknown artist', album: album || 'Unknown album',
      title: title || uri!.split('/').at(-1) || 'Untitled', year: year?.slice(0, 4) || '',
      number: parseInt(number) || 0, duration: (time || '0').split(':').reduce((n, s) => n * 60 + Number(s), 0),
    };
  });
}

/** Short text-only requests. mpc owns the library and binary artwork transfers. */
export async function request(command: string): Promise<string> {
  if (/[\r\n\0]/.test(command)) throw new Error('Invalid MPD command.');
  let host = process.env.MPD_HOST || '127.0.0.1';
  let password = process.env.MPD_PASSWORD || '';
  const at = host.indexOf('@');
  if (at >= 0) { password ||= host.slice(0, at); host = host.slice(at + 1); }
  return new Promise((resolve, reject) => {
    const socket = host.startsWith('/') ? createConnection(host) : createConnection({ host, port: Number(process.env.MPD_PORT || 6600) });
    let phase: 'greeting' | 'auth' | 'command' = 'greeting';
    let pending = Buffer.alloc(0);
    let done = false;
    const finish = (error?: Error, value = '') => {
      if (done) return;
      done = true; socket.destroy();
      if (error) reject(error); else resolve(value);
    };
    socket.setTimeout(5000, () => finish(new Error('MPD did not respond within five seconds.')));
    socket.on('error', err => finish(new Error(`Cannot reach MPD: ${err.message}`)));
    socket.on('end', () => finish(new Error('MPD closed the connection.')));
    socket.on('data', data => {
      pending = Buffer.concat([pending, typeof data === 'string' ? Buffer.from(data) : data]);
      if (pending.length > 32 * 1024 * 1024) return finish(new Error('MPD response exceeded the prototype limit.'));
      if (phase === 'greeting') {
        const end = pending.indexOf(10);
        if (end < 0) return;
        if (!pending.subarray(0, end).toString().startsWith('OK MPD ')) return finish(new Error('Server is not MPD.'));
        pending = pending.subarray(end + 1);
        phase = password ? 'auth' : 'command';
        try { socket.write((password ? `password ${quote(password)}` : command) + '\n'); }
        catch (err) { finish(err instanceof Error ? err : new Error(String(err))); }
        return;
      }
      const text = pending.toString('utf8');
      const ack = text.match(/(?:^|\n)(ACK .*?)\n/);
      if (ack) return finish(new Error(phase === 'auth' ? 'MPD authentication failed.' : ack[1]));
      if (!(text === 'OK\n' || text.endsWith('\nOK\n'))) return;
      if (phase === 'auth') { pending = Buffer.alloc(0); phase = 'command'; socket.write(command + '\n'); }
      else finish(undefined, text.slice(0, -3));
    });
  });
}

export class MpdBackend implements MusicBackend {
  readonly demo = false;
  private artworkCache = new Map<string, Promise<string | undefined>>();
  private artJobs: (() => void)[] = [];
  private artActive = 0;
  private async cli(args: string[]) {
    const { stdout } = await run(mpc, args, { timeout: 20000, maxBuffer: 64 * 1024 * 1024 });
    return stdout;
  }
  async library() { return parseLibrary(await this.cli(['--format', format, 'listall'])); }
  async snapshot(): Promise<Snapshot> {
    // Retry once if another MPD client changes queue order while we read it.
    for (let attempt = 0; attempt < 2; attempt++) {
      const first = parseFields(await request('status'));
      const queue = parseQueue(await request('playlistinfo'));
      const last = parseFields(await request('status'));
      if (first.playlist !== last.playlist) continue;
      return { queue, currentId: last.songid === undefined ? undefined : Number(last.songid),
        state: last.state === 'play' ? 'play' : last.state === 'pause' ? 'pause' : 'stop',
        elapsed: Number(last.elapsed || 0), volume: Number(last.volume || 0), error: last.error };
    }
    throw new Error('The MPD queue changed during refresh. Try again.');
  }
  async artwork(track: Track): Promise<string | undefined> {
    if (track.art) return track.art;
    let job = this.artworkCache.get(track.uri);
    if (!job) {
      job = new Promise(resolve => {
        this.artJobs.push(() => {
          this.artActive++;
          void this.loadArtwork(track.uri).then(resolve).finally(() => { this.artActive--; this.drainArtwork(); });
        });
        this.drainArtwork();
      });
      this.artworkCache.set(track.uri, job);
    }
    return job;
  }
  private drainArtwork() { while (this.artActive < 3 && this.artJobs.length) this.artJobs.shift()!(); }
  private async loadArtwork(uri: string): Promise<string | undefined> {
    for (const command of ['readpicture', 'albumart']) {
      try {
        const { stdout } = await run(mpc, [command, '--', uri], { encoding: 'buffer', timeout: 6000, maxBuffer: 16 * 1024 * 1024 });
        if (stdout.length) return `data:image/${stdout[0] === 0x89 ? 'png' : 'jpeg'};base64,${stdout.toString('base64')}`;
      } catch { /* Missing artwork is normal; keep the placeholder. */ }
    }
    return undefined;
  }
  async toggle() { const status = parseFields(await request('status')); await request(status.state === 'play' ? 'pause 1' : status.state === 'pause' ? 'pause 0' : 'play'); }
  async next() { await request('next'); }
  async previous() { await request('previous'); }
  async play(id: number) { this.assertId(id); await request(`playid ${id}`); }
  async enqueue(track: Track, play = false) { const added = parseFields(await request(`addid ${quote(track.uri)}`)); if (play) await this.play(Number(added.id)); }
  async move(id: number, beforeId: number | null) {
    this.assertId(id);
    const queue = parseQueue(await request('playlistinfo'));
    const source = queue.findIndex(t => t.queueId === id);
    const target = beforeId === null ? queue.length : queue.findIndex(t => t.queueId === beforeId);
    if (source < 0 || target < 0) throw new Error('The queue changed. Select the track again.');
    if (source === target) return;
    await request(`moveid ${id} ${target > source ? target - 1 : target}`);
  }
  private assertId(id: number) { if (!Number.isInteger(id) || id < 0) throw new Error('Invalid queue ID.'); }
  subscribe(changed: () => void): () => void {
    let closed = false;
    let child: ReturnType<typeof spawn>;
    let restart: ReturnType<typeof setTimeout> | undefined;
    const listen = () => {
      if (closed) return;
      child = spawn(mpc, ['idleloop', 'player', 'playlist', 'mixer', 'database'], { stdio: ['ignore', 'pipe', 'pipe'] });
      child.stdout?.on('data', changed);
      child.stderr?.resume();
      child.on('error', changed);
      child.on('close', () => { if (!closed) { changed(); restart = setTimeout(listen, 3000); } });
    };
    listen();
    return () => { closed = true; clearTimeout(restart); child?.kill(); };
  }
}
