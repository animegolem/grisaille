import { appendFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { NavigationEvent } from './history';

/** Append-only, local navigation journal. No typed queries, audio or credentials. */
export class NavigationLog {
  readonly session = randomUUID();
  readonly directory: string;
  error?: string;
  private sequence = 0;
  constructor(private mode: 'demo' | 'mpd', directory?: string) {
    this.directory = directory || join(homedir(), 'Library', 'Application Support', 'Music Prototype', 'navigation');
  }
  append(event: NavigationEvent) {
    if (this.error) return;
    try {
      mkdirSync(this.directory, { recursive: true, mode: 0o700 });
      const at = new Date().toISOString();
      const path = join(this.directory, `${at.slice(0, 10)}.jsonl`);
      // Small, synchronous appends keep the final event when the native window exits.
      appendFileSync(path, JSON.stringify({ version: 1, session: this.session, sequence: ++this.sequence, at, mode: this.mode, ...event }) + '\n', { mode: 0o600 });
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      console.warn('Navigation journal unavailable:', this.error);
    }
  }
}
