import { useEffect, useMemo, useState } from 'react';
import type { MusicBackend, Snapshot, Track } from './model';
import { lyricAt, type Lyrics } from './lyrics';

/** One loading, timing and reading model for the native and terminal pages. */
export function useLyrics(backend: MusicBackend, track: Track | undefined, snapshot: Snapshot, connected: boolean, enabled: boolean) {
  const uri = track?.uri;
  const [revision, setRevision] = useState(0);
  const [loaded, setLoaded] = useState<{ uri?: string; lyrics?: Lyrics; loading?: boolean; error?: string }>({});
  const [manual, setManual] = useState<{ uri?: string; line: number }>();
  const observedAt = useMemo(() => performance.now(), [snapshot]);
  const [now, setNow] = useState(observedAt);
  const running = enabled && connected && snapshot.state === 'play';
  useEffect(() => {
    if (!running) return;
    setNow(performance.now());
    const timer = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!enabled) return;
    setManual(undefined);
    if (!track) { setLoaded({}); return; }
    let active = true;
    setLoaded({ uri, loading: true });
    void backend.lyrics(track).then(lyrics => { if (active) setLoaded({ uri, lyrics }); }, error => {
      if (active) setLoaded({ uri, error: error instanceof Error ? error.message : String(error) });
    });
    return () => { active = false; };
  }, [backend, uri, enabled, revision]);
  const result = loaded.uri === uri ? loaded : { loading: Boolean(uri) };
  const lyrics = result.lyrics;
  // Stopping the timer on disconnect freezes the last visible cue, without
  // rewinding to the server's older snapshot time.
  const elapsed = Math.min(track?.duration || Infinity, snapshot.elapsed + (snapshot.state === 'play' ? Math.max(0, now - observedAt) / 1000 : 0));
  const activeLine = lyricAt(lyrics, elapsed);
  const manualLine = manual?.uri === uri ? manual?.line : undefined;
  const selectedLine = Math.max(0, Math.min((lyrics?.lines.length || 1) - 1, manualLine ?? Math.max(0, activeLine)));
  return { ...result, lyrics, elapsed, activeLine, selectedLine, following: Boolean(lyrics?.synced && manualLine === undefined),
    select: (line: number) => setManual({ uri, line: Math.max(0, Math.min((lyrics?.lines.length || 1) - 1, line)) }),
    read: () => setManual({ uri, line: selectedLine }),
    follow: () => setManual(undefined),
    reload: () => setRevision(value => value + 1),
  };
}
