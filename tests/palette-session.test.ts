import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PaletteSession, type PaletteContext, type PaletteSnapshot } from '../src/palette-session';
import type { PaletteSource, PaletteSourceEvent } from '../src/palette-file';
import { MusicSession } from '../src/music-session';
import type { MusicBackend, Snapshot } from '../src/model';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/palette/${name}.json`, import.meta.url), 'utf8'));
const A = 'library/A.flac', B = 'library/B.flac';
function artifact(name = 'ok', uri: string | null = A, sequence = 1) {
  const value = fixture(name); value.track.file = uri; value.sequence = sequence;
  return JSON.stringify(value);
}
const context = (uri: string | null = A, state: PaletteContext['state'] = 'playing', queueId = 1): PaletteContext => ({ state, uri, queueId: uri ? queueId : null });
const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
class Source implements PaletteSource {
  readonly path = '/fixture/palette.json';
  raw = artifact(); error?: Error; manual = false;
  reads = 0; watches = 0; closes = 0; outstanding = 0; maxOutstanding = 0;
  pending: ReturnType<typeof deferred<string>>[] = [];
  callbacks: ((event: PaletteSourceEvent) => void)[] = [];
  order: string[] = [];
  read = async () => {
    this.order.push('read'); this.reads++; this.outstanding++;
    this.maxOutstanding = Math.max(this.maxOutstanding, this.outstanding);
    try {
      if (this.manual) { const job = deferred<string>(); this.pending.push(job); return await job.promise; }
      if (this.error) throw this.error;
      return this.raw;
    } finally { this.outstanding--; }
  };
  watch = (callback: (event: PaletteSourceEvent) => void) => {
    this.order.push('watch'); this.watches++; this.callbacks.push(callback);
    return () => { this.closes++; };
  };
  emit(event: PaletteSourceEvent = { kind: 'change' }) { this.callbacks.at(-1)?.(event); }
  async publish(raw: string) { this.raw = raw; this.error = undefined; this.emit(); await settle(); }
}
function start(source = new Source(), playback = context()) {
  const palette = new PaletteSession({ source });
  palette.setContext(playback); palette.start();
  return { source, palette };
}

test('publishes a deeply immutable whole bundle and deduplicates identical artifact content', async () => {
  const { source, palette } = start();
  try {
    await settle(); const first = palette.getState();
    expect(source.order.slice(0, 2)).toEqual(['watch', 'read']);
    expect(first).toMatchObject({ attemptAssociation: 'current-uri', bundleAssociation: 'current-uri' });
    expect(first.candidate).toBe(first.retained); expect(first.latestAttempt).toBe(first.candidate);
    expect(first.retained!.roles.text.hex).toBe(fixture('ok').roles.text.hex);
    expect(first.retained!.verified_pairs).toEqual(fixture('ok').verified_pairs);
    expect(Object.isFrozen(first)).toBe(true); expect(Object.isFrozen(first.retained!.roles.text.oklch)).toBe(true);
    expect(Object.isFrozen(first.retained!.track)).toBe(true);
    let updates = 0; const off = palette.subscribe(() => { updates++; });
    await source.publish(source.raw); await source.publish(source.raw);
    expect(palette.getState()).toBe(first); expect(updates).toBe(0); off();
  } finally { palette.stop(); }
  expect(source.closes).toBe(1);
});

test('late A never associates with B; same-art B and a reset producer sequence are accepted', async () => {
  const { source, palette } = start();
  try {
    await settle(); const original = palette.getState().retained;
    palette.setContext(context(B)); await settle();
    expect(palette.getState()).toMatchObject({ attemptAssociation: 'other-uri', bundleAssociation: 'retained' });
    expect(palette.getState().retained).toBe(original);
    await source.publish(artifact('ok', A, 900));
    expect(palette.getState().retained).toBe(original);
    await source.publish(artifact('ok', B, 0));
    expect(palette.getState()).toMatchObject({ attemptAssociation: 'current-uri', bundleAssociation: 'current-uri' });
    expect(palette.getState().retained!.track.file).toBe(B);
    expect(palette.getState().retained!.track.art_sha256).toBe(original!.track.art_sha256);
    expect(palette.getState().retained!.sequence).toBe(0);
  } finally { palette.stop(); }
});

test('candidate before playback and A→B→A re-evaluate identical bytes with only v1 URI association', async () => {
  const { source, palette } = start(new Source(), context(null, 'waiting'));
  try {
    await settle(); const candidate = palette.getState().candidate;
    expect(candidate).not.toBeNull(); expect(palette.getState().retained).toBeNull();
    palette.setContext(context()); await settle();
    expect(candidate).toBe(palette.getState().retained);
    palette.setContext(context(B)); await settle();
    expect(palette.getState().bundleAssociation).toBe('retained');
    palette.setContext(context(A, 'playing', 99)); await settle();
    expect(palette.getState().candidate).toBe(candidate);
    expect(palette.getState().bundleAssociation).toBe('current-uri');
    palette.setContext(context(A, 'paused', 99)); await settle();
    expect(palette.getState().bundleAssociation).toBe('current-uri');
    expect(source.watches).toBe(1); // Queue IDs are not fabricated producer event identities.
  } finally { palette.stop(); }
});

test('context changes and duplicate invalidations reject deferred work and serialize one dirty follow-up', async () => {
  const source = new Source(); source.manual = true;
  const { palette } = start(source); const seen: PaletteSnapshot[] = [];
  palette.subscribe(() => { seen.push(palette.getState()); });
  try {
    palette.setContext(context(B)); source.emit(); source.emit();
    expect(source.reads).toBe(1);
    source.pending[0]!.resolve(artifact('ok', A)); await settle();
    expect(source.reads).toBe(2); expect(palette.getState().latestAttempt).toBeNull();
    source.pending[1]!.resolve(artifact('ok', B)); await settle();
    expect(palette.getState().retained!.track.file).toBe(B); expect(source.maxOutstanding).toBe(1);
    expect(seen.every(state => !state.retained || state.retained.track.file === B)).toBe(true);
    source.emit(); source.emit(); source.pending[2]!.reject(new Error('obsolete error')); await settle();
    expect(palette.getState().diagnostics.read).toBe('');
    source.pending[3]!.resolve(artifact('ok', B, 2)); await settle();
    expect(palette.getState().retained!.sequence).toBe(2);
  } finally { palette.stop(); }
});

test('read, malformed and unsupported schema failures retain provenance and clear the candidate', async () => {
  const { source, palette } = start();
  try {
    await settle(); const accepted = palette.getState().retained;
    for (const raw of ['{', artifact('invalid-schema-major'), artifact('invalid-no-art-partial-bundle')]) {
      await source.publish(raw);
      expect(palette.getState().retained).toBe(accepted);
      expect(palette.getState().latestAttempt).toBe(accepted);
      expect(palette.getState().candidate).toBeNull();
      expect(palette.getState().bundleAssociation).toBe('retained');
      expect(palette.getState().diagnostics.read.length).toBeGreaterThan(0);
    }
    source.error = new Error('ENOENT fixture'); source.emit(); await settle();
    expect(palette.getState().diagnostics.read).toBe('ENOENT fixture');
    expect(palette.getState().retained).toBe(accepted);
    await source.publish(artifact());
    expect(palette.getState().diagnostics.read).toBe('');
    expect(palette.getState().bundleAssociation).toBe('current-uri');
  } finally { palette.stop(); }
});

test('failed and no-art attempts preserve their own identity without relabeling retained colors', async () => {
  const { source, palette } = start();
  try {
    await settle(); const accepted = palette.getState().retained;
    for (const raw of [artifact('failed'), artifact('no-art')]) {
      await source.publish(raw);
      expect(palette.getState().attemptAssociation).toBe('current-uri');
      expect(palette.getState().retained).toBe(accepted);
      expect(palette.getState().bundleAssociation).toBe('retained');
    }
    await source.publish(artifact('failed-no-identity', null));
    expect(palette.getState().attemptAssociation).toBe('unknown');
    expect(palette.getState().latestAttempt!.track.file).toBeNull();
    expect(palette.getState().retained).toBe(accepted);
    const future = JSON.parse(artifact()); future.status = 'future-status';
    await source.publish(JSON.stringify(future));
    expect(palette.getState().latestAttempt).toMatchObject({ status: 'failed', original_status: 'future-status' });
    expect(palette.getState().latestAttempt!.roles).toBeUndefined();
    expect(palette.getState().diagnostics.warnings).toHaveLength(1);
    expect(palette.getState().retained).toBe(accepted);
    await source.publish(artifact('no-art-verified'));
    expect(palette.getState().retained).toMatchObject({ status: 'no-art', track: { art_sha256: null } });
    expect(palette.getState().bundleAssociation).toBe('current-uri');
    expect(palette.getState().diagnostics.warnings).toHaveLength(0);
  } finally { palette.stop(); }
});

test('failure or no-art without an accepted bundle uses default, never adopts another URI bundle', async () => {
  const { source, palette } = start();
  // Supersede initial read before it can publish.
  source.emit(); source.raw = artifact('failed');
  try {
    await settle(); expect(palette.getState().retained).toBeNull();
    await source.publish(artifact('no-art'));
    expect(palette.getState().bundleAssociation).toBe('default');
    await source.publish(artifact('no-art-verified', B));
    expect(palette.getState().retained).toBeNull();
    palette.setContext(context(B)); await settle();
    expect(palette.getState().retained!.status).toBe('no-art');
  } finally { palette.stop(); }
});

test('watch diagnostics are separate, ready triggers a read, and healthy sources are not polled', async () => {
  const { source, palette } = start();
  try {
    await settle(); const accepted = palette.getState().retained;
    source.emit({ kind: 'error', message: 'parent replaced' });
    expect(palette.getState().monitoring).toBe('recovering');
    expect(palette.getState().diagnostics.watch).toBe('parent replaced');
    expect(palette.getState().diagnostics.read).toBe('');
    source.error = new Error('missing file'); source.emit({ kind: 'ready' }); await settle();
    expect(palette.getState().diagnostics).toMatchObject({ watch: '', read: 'missing file' });
    expect(palette.getState().retained).toBe(accepted);
    const reads = source.reads; await settle(); expect(source.reads).toBe(reads);
    await source.publish(artifact()); expect(palette.getState().diagnostics.read).toBe('');
  } finally { palette.stop(); }
});

test('stop/restart invalidates old callbacks and read cleanup cannot clobber the new task', async () => {
  const source = new Source(); source.manual = true;
  const { palette } = start(source);
  const oldCallback = source.callbacks[0]!;
  palette.stop(); palette.stop(); expect(source.closes).toBe(1);
  palette.setContext(context(B)); palette.start(); expect(source.reads).toBe(2);
  const before = palette.getState(); oldCallback({ kind: 'error', message: 'stale watcher' });
  oldCallback({ kind: 'change' }); expect(palette.getState()).toBe(before);
  source.pending[0]!.resolve(artifact('ok', A)); await settle();
  expect(palette.getState().latestAttempt).toBeNull();
  source.emit(); expect(source.reads).toBe(2);
  source.pending[1]!.resolve(artifact('ok', A)); await settle();
  expect(source.reads).toBe(3); expect(palette.getState().latestAttempt).toBeNull();
  source.pending[2]!.resolve(artifact('ok', B)); await settle();
  expect(palette.getState().retained!.track.file).toBe(B);
  palette.stop(); const stopped = palette.getState();
  source.emit(); await settle(); expect(palette.getState()).toBe(stopped);
  expect(source.closes).toBe(2); expect(stopped.bundleAssociation).toBe('retained');
  expect(stopped.attemptAssociation).toBe('unavailable');
});

function backendFixture() {
  const track = { uri: A, title: 'A', artist: 'Fixture', album: 'Fixture', year: '', number: 1, duration: 100, queueId: 1 };
  let snapshot: Snapshot = { queue: [track], currentId: 1, state: 'play', elapsed: 0, volume: 50 };
  let subscriptions = 0, closes = 0, playbackCalls = 0;
  const mutate = async () => { playbackCalls++; };
  const backend: MusicBackend = {
    demo: false, library: async () => [track], snapshot: async () => snapshot,
    artwork: async () => undefined, lyrics: async () => undefined,
    toggle: mutate, next: mutate, previous: mutate, play: mutate, enqueue: mutate,
    enqueueAlbum: async () => { playbackCalls++; return []; }, seek: mutate, remove: mutate, move: mutate,
    subscribe: () => { subscriptions++; return () => { closes++; }; },
  };
  return { backend, setSnapshot: (value: Snapshot) => { snapshot = value; }, snapshot: () => snapshot,
    counts: () => ({ subscriptions, closes, playbackCalls }) };
}

test('MusicSession owns one lifecycle for multiple subscribers, and derives association only from ready connected playback', async () => {
  const source = new Source(), palette = new PaletteSession({ source }), fixture = backendFixture();
  const session = new MusicSession(fixture.backend, 60_000, palette);
  const off1 = palette.subscribe(() => {}), off2 = palette.subscribe(() => {});
  expect(source.watches).toBe(0); session.start(); session.start();
  try {
    await session.refresh(); await settle();
    expect(palette.getState().bundleAssociation).toBe('current-uri');
    fixture.setSnapshot({ ...fixture.snapshot(), state: 'pause' }); await session.refresh(); await settle();
    expect(palette.getState().context.state).toBe('paused'); expect(palette.getState().bundleAssociation).toBe('current-uri');
    const reads = source.reads;
    fixture.setSnapshot({ ...fixture.snapshot(), elapsed: 42, volume: 75 }); await session.refresh(); await settle();
    expect(source.reads).toBe(reads);
    const get = fixture.backend.snapshot;
    fixture.backend.snapshot = async () => { throw new Error('offline'); }; await session.refresh(); await settle();
    expect(session.getState().snapshotReady).toBe(true); expect(session.getState().snapshot.currentId).toBe(1);
    expect(palette.getState().context.state).toBe('disconnected'); expect(palette.getState().bundleAssociation).toBe('retained');
    fixture.backend.snapshot = get; fixture.setSnapshot({ ...fixture.snapshot(), state: 'stop' }); await session.refresh(); await settle();
    expect(palette.getState().context.state).toBe('stopped'); expect(palette.getState().attemptAssociation).toBe('unavailable');
    fixture.setSnapshot({ ...fixture.snapshot(), state: 'play', currentId: 404 }); await session.refresh(); await settle();
    expect(palette.getState().context.state).toBe('unresolved');
    expect(palette.getState().context.uri).toBeNull();
    source.error = new Error('palette missing'); source.emit(); await settle();
    expect(session.getState().connection).toBe('connected'); expect(session.getState().problem).toBe('');
    expect(palette.getState().diagnostics.read).toBe('palette missing');
    off1(); off2(); expect(source.closes).toBe(0);
  } finally { off1(); off2(); session.stop(); }
  expect(source.watches).toBe(1); expect(source.closes).toBe(1);
  expect(fixture.counts()).toEqual({ subscriptions: 1, closes: 1, playbackCalls: 0 });
});

test('MusicSession restart cannot associate against its preserved connected snapshot before a new result', async () => {
  const source = new Source(), palette = new PaletteSession({ source }), fixture = backendFixture();
  const session = new MusicSession(fixture.backend, 60_000, palette); session.start();
  try {
    await session.refresh(); await settle(); session.stop();
    const pending = deferred<Snapshot>(); fixture.backend.snapshot = () => pending.promise;
    session.start(); await settle();
    expect(session.getState().connection).toBe('connected');
    expect(palette.getState().context.state).toBe('waiting');
    expect(palette.getState().bundleAssociation).toBe('retained');
    pending.resolve(fixture.snapshot()); await settle();
    expect(palette.getState().bundleAssociation).toBe('current-uri');
  } finally { session.stop(); }
  expect(fixture.counts()).toEqual({ subscriptions: 2, closes: 2, playbackCalls: 0 });
});

test('unconfigured PaletteSession is inert and reports configuration separately', async () => {
  const palette = new PaletteSession({ diagnostic: 'binding required' }); palette.start();
  palette.setContext(context()); await settle();
  expect(palette.getState()).toMatchObject({ monitoring: 'disabled', sourcePath: null, bundleAssociation: 'default' });
  expect(palette.getState().diagnostics).toMatchObject({ configuration: 'binding required', read: '', watch: '' });
  palette.stop();
});

test('synchronous subscriber teardown during start or attachment leaves no watcher or read', () => {
  const source = new Source(), palette = new PaletteSession({ source });
  const off = palette.subscribe(() => { if (palette.getState().active) palette.stop(); });
  palette.start(); expect(source.watches).toBe(0); expect(source.reads).toBe(0); off();
  source.watch = listener => {
    source.watches++; listener({ kind: 'error', message: 'initial watch error' });
    return () => { source.closes++; };
  };
  palette.subscribe(() => { if (palette.getState().monitoring === 'recovering') palette.stop(); });
  palette.start();
  expect(source.watches).toBe(1); expect(source.closes).toBe(1); expect(source.reads).toBe(0);
});

test('ordinary MusicSession start/stop removes its exit listener and all owned subscriptions', async () => {
  const source = new Source(), palette = new PaletteSession({ source }), fixture = backendFixture();
  const session = new MusicSession(fixture.backend, 60_000, palette);
  const baseline = process.listenerCount('exit');
  try {
    for (let i = 0; i < 3; i++) { session.start(); session.stop(); }
    await settle();
    expect(process.listenerCount('exit') - baseline).toBe(0);
    expect(fixture.counts()).toEqual({ subscriptions: 3, closes: 3, playbackCalls: 0 });
    expect(source.watches).toBe(3); expect(source.closes).toBe(3);
    expect(palette.getState().active).toBe(false);
  } finally {
    session.stop();
    // Keep the process isolated even when running this test against a broken owner.
    while (process.listeners('exit').includes(session.stop)) process.off('exit', session.stop);
  }
});

test('synchronous palette observer stopping MusicSession leaves no exit listener or subsequent owner work', async () => {
  const source = new Source(), palette = new PaletteSession({ source }), fixture = backendFixture();
  let libraryReads = 0, snapshotReads = 0;
  fixture.backend.library = async () => { libraryReads++; return []; };
  fixture.backend.snapshot = async () => { snapshotReads++; return fixture.snapshot(); };
  const session = new MusicSession(fixture.backend, 60_000, palette);
  const baseline = process.listenerCount('exit');
  const off = palette.subscribe(() => { if (palette.getState().active) session.stop(); });
  try {
    for (let i = 0; i < 3; i++) { session.start(); session.stop(); }
    await settle();
    expect(process.listenerCount('exit') - baseline).toBe(0);
    expect(fixture.counts()).toEqual({ subscriptions: 3, closes: 3, playbackCalls: 0 });
    expect(source.watches).toBe(0); expect(source.closes).toBe(0); expect(source.reads).toBe(0);
    expect(libraryReads).toBe(0); expect(snapshotReads).toBe(0);
    expect(palette.getState().active).toBe(false);
  } finally {
    off(); session.stop();
    while (process.listeners('exit').includes(session.stop)) process.off('exit', session.stop);
  }
});

test('synchronous palette observer restarting MusicSession leaves only the new startup resources', async () => {
  const source = new Source(), palette = new PaletteSession({ source }), fixture = backendFixture();
  let libraryReads = 0, snapshotReads = 0, restarted = false;
  fixture.backend.library = async () => { libraryReads++; return []; };
  fixture.backend.snapshot = async () => { snapshotReads++; return fixture.snapshot(); };
  const session = new MusicSession(fixture.backend, 60_000, palette);
  const baseline = process.listenerCount('exit');
  const off = palette.subscribe(() => {
    if (palette.getState().active && !restarted) {
      restarted = true; session.stop(); session.start();
    }
  });
  try {
    session.start(); await settle();
    expect(restarted).toBe(true);
    expect(process.listenerCount('exit') - baseline).toBe(1);
    expect(fixture.counts()).toEqual({ subscriptions: 2, closes: 1, playbackCalls: 0 });
    expect(source.watches).toBe(1); expect(source.closes).toBe(0);
    expect(libraryReads).toBe(1); expect(snapshotReads).toBe(1);
    expect(palette.getState()).toMatchObject({ active: true, bundleAssociation: 'current-uri' });
    session.stop(); await settle();
    expect(process.listenerCount('exit') - baseline).toBe(0);
    expect(fixture.counts()).toEqual({ subscriptions: 2, closes: 2, playbackCalls: 0 });
    expect(source.closes).toBe(1); expect(palette.getState().active).toBe(false);
  } finally {
    off(); session.stop();
    while (process.listeners('exit').includes(session.stop)) process.off('exit', session.stop);
  }
});
