import { useEffect, useState, useSyncExternalStore } from 'react';
import type { MusicBackend, Snapshot, Track } from './model';

export type MusicState = {
  library: Track[]; snapshot: Snapshot; loading: boolean; connection: 'connecting' | 'connected' | 'down';
  notice: string; problem: string; actionProblem: string;
};
const messageOf = (error: unknown) => error instanceof Error ? error.message : String(error);

/** One connection/action lifecycle for both renderers. Playback remains in MPD. */
export class MusicSession {
  private state: MusicState = {
    library: [], snapshot: { queue: [], state: 'stop', elapsed: 0, volume: 0 },
    loading: true, connection: 'connecting', notice: 'Connecting…', problem: '', actionProblem: '',
  };
  private listeners = new Set<() => void>();
  private active = false;
  private generation = 0;
  private unsubscribe?: () => void;
  private refreshTask?: Promise<void>;
  private libraryTask?: Promise<void>;
  private refreshAgain = false;
  private libraryAgain = false;
  private actions = Promise.resolve();
  constructor(readonly backend: MusicBackend) {}
  getState = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private update(patch: Partial<MusicState>) {
    if (!this.active) return;
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
  setNotice = (notice: string) => this.update({ notice });
  start = () => {
    if (this.active) return;
    this.active = true; this.generation++;
    this.unsubscribe = this.backend.subscribe(event => { void this.refresh(); if (event === 'database') void this.reloadLibrary(); });
    process.once('exit', this.stop);
    void this.reloadLibrary(); void this.refresh();
  };
  stop = () => {
    if (!this.active) return;
    this.active = false; this.generation++;
    this.unsubscribe?.(); this.unsubscribe = undefined;
    this.refreshAgain = this.libraryAgain = false;
    this.refreshTask = this.libraryTask = undefined;
    process.off('exit', this.stop);
  };
  refresh = (): Promise<void> => {
    if (!this.active) return Promise.resolve();
    if (this.refreshTask) { this.refreshAgain = true; return this.refreshTask; }
    const generation = this.generation;
    const task = (async () => {
      do {
        this.refreshAgain = false;
        try {
          const snapshot = await this.backend.snapshot();
          if (generation === this.generation) this.update({ snapshot, problem: snapshot.error || '', connection: snapshot.error ? 'down' : 'connected' });
        } catch (error) { if (generation === this.generation) this.update({ problem: messageOf(error), connection: 'down' }); }
      } while (this.active && generation === this.generation && this.refreshAgain);
    })().finally(() => { if (this.refreshTask === task) this.refreshTask = undefined; });
    this.refreshTask = task; return task;
  };
  reloadLibrary = (): Promise<void> => {
    if (!this.active) return Promise.resolve();
    if (this.libraryTask) { this.libraryAgain = true; return this.libraryTask; }
    const generation = this.generation;
    this.update({ loading: true });
    const task = (async () => {
      do {
        this.libraryAgain = false;
        try {
          const library = await this.backend.library();
          if (generation === this.generation) this.update({ library, notice: this.backend.demo ? 'Sample library · playback is simulated' : 'Library ready' });
        } catch (error) { if (generation === this.generation) this.update({ actionProblem: messageOf(error) }); }
      } while (this.active && generation === this.generation && this.libraryAgain);
      if (generation === this.generation) this.update({ loading: false });
    })().finally(() => { if (this.libraryTask === task) this.libraryTask = undefined; });
    this.libraryTask = task; return task;
  };
  act = (action: () => Promise<unknown>, notice?: string) => {
    const generation = this.generation;
    this.actions = this.actions.then(async () => {
      if (!this.active || generation !== this.generation) return;
      this.update({ actionProblem: '' });
      try { await action(); if (generation === this.generation && notice) this.setNotice(notice); }
      catch (error) { if (generation === this.generation) this.update({ actionProblem: messageOf(error) }); }
      // A failed MPD command list can still have appended some tracks.
      await this.refresh();
    });
    return this.actions;
  };
}

export function useMusic(session: MusicSession) {
  const state = useSyncExternalStore(session.subscribe, session.getState);
  const [playClock, setPlayClock] = useState(0);
  useEffect(() => { session.start(); return session.stop; }, [session]);
  useEffect(() => {
    setPlayClock(0);
    if (state.snapshot.state !== 'play' || session.backend.demo) return;
    const start = Date.now();
    const timer = setInterval(() => setPlayClock((Date.now() - start) / 1000), 1000);
    return () => clearInterval(timer);
  }, [state.snapshot, session]);
  return { ...state, playClock, act: session.act, reloadLibrary: session.reloadLibrary, setNotice: session.setNotice };
}
