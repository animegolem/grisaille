/** @jsxImportSource @opentui/react */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { flushSync, useKeyboard, useTerminalDimensions } from '@opentui/react';
import type { ImageRenderProtocol, KeyEvent } from '@opentui/core';
import { MusicSession, useMusic } from '../music-session';
import { NavigationHistory, type BrowserColumn, type NavigationEvent, type Place, type Route } from '../history';
import { browserColumns, browserTarget, browserTrail } from '../browser';
import { albumPlace, identifyPlace, placeKey, resolvePlace, routeItems, routeTitle } from '../locations';
import { albumKey, albumsOf, artistsOf, duration, fuzzyScore, searchLibrary, type Album, type Result, type Track } from '../model';
import { directionOf } from '../navigation';
import { pairForState, type MusicTheme, type TextTone, type ThemePair } from '../theme';
import { ThemeProvider, ThemePairProvider, useTheme, useThemePair } from '../use-theme';
import { albumOrders, artistOrders, defaultOrder, orderAlbums, orderArtists, type LibraryOrder } from '../library-order';
import type { NavigationState, NavigationStateStore } from '../navigation-state';
import { lyricRows } from '../lyrics';
import { useLyrics } from '../use-lyrics';

const noStateSubscription = () => () => {};
const noStateError = () => undefined;

// A terminal cell has one background; a future GUI gradient uses its first stop here.
const fill = (theme: MusicTheme, name: keyof MusicTheme['surfaces']): string => {
  const paint = theme.surfaces[name];
  return typeof paint === 'string' ? paint : paint.stops[0]!.color;
};
/** Metadata is text, never terminal control sequences or extra display rows. */
export const plain = (text: string) => text.replace(/[\x00-\x1f\x7f-\x9f]/g, ' ');
export function reveal(index: number, top: number, count: number, capacity: number) {
  const next = index < top ? index : index >= top + capacity ? index - capacity + 1 : top;
  return Math.max(0, Math.min(Math.max(0, count - capacity), next));
}
function Line({ text, tone = 'text', marker, suffix }: { text: string; tone?: TextTone; marker?: string; suffix?: string }) {
  const pair = useThemePair();
  return <text fg={pair.colors[tone]} height={1} flexShrink={0} wrapMode="none" truncate>
    {marker && <span fg={pair.marker}>{plain(marker)}</span>}{plain(text)}{suffix && <span fg={pair.marker}>{plain(suffix)}</span>}
  </text>;
}
/** Every descendant, including secondary text, inherits the winning state's complete pair. */
function Row({ pair, height, children }: { pair: ThemePair; height: number; children: ReactNode }) {
  return <ThemePairProvider pair={pair}><box height={height} flexShrink={0} backgroundColor={pair.background}>{children}</box></ThemePairProvider>;
}
function Tab({ active, label }: { active: boolean; label: string }) {
  const theme = useTheme(), pair = pairForState(theme, { active });
  return <text fg={active ? pair.colors.text : pair.colors.muted} bg={pair.background}>{label}</text>;
}
function Cover({ session, track, width, height, protocol }: { session: MusicSession; track?: Track; width: number; height: number; protocol: ImageRenderProtocol }) {
  const theme = useTheme();
  const [source, setSource] = useState<string>();
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setSource(undefined); setError(false);
    if (track) void session.backend.artwork(track).then(value => { if (active) setSource(value); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [session, track?.uri]);
  return <ThemePairProvider pair={theme.pairs.normal}><box width={width} height={height} justifyContent="center" alignItems="center" backgroundColor={fill(theme, 'coverPlaceholder')}>
    {source && !error ? <image source={source} width={width} height={height} fit="fit" protocol={protocol} onError={() => setError(true)} /> : <Line text={error ? 'Artwork unavailable' : 'No cover'} tone="muted" />}
  </box></ThemePairProvider>;
}
type TerminalAppProps = {
  session: MusicSession; record?: (event: NavigationEvent) => void; quit?: () => void;
  protocol?: ImageRenderProtocol; logError?: () => string | undefined; navigationState?: NavigationStateStore;
};
export function TerminalApp(props: TerminalAppProps) {
  return <ThemeProvider session={props.session}><TerminalAppContent {...props} /></ThemeProvider>;
}
function TerminalAppContent({ session, record = () => {}, quit = () => {}, protocol = 'auto', logError, navigationState }: TerminalAppProps) {
  const theme = useTheme(), C = theme.colors;
  const { library, snapshot, loading, libraryReady, snapshotReady, libraryProblem, connection, notice, problem, actionProblem, playClock, act, reloadLibrary, setNotice } = useMusic(session);
  const saved = useMemo(() => navigationState?.read(), [navigationState]);
  const restoring = useRef(Boolean(saved));
  const stateError = useSyncExternalStore(navigationState?.subscribe || noStateSubscription, navigationState?.getError || noStateError);
  const stateProvider = useRef<() => NavigationState | undefined>(() => undefined);
  const backend = session.backend;
  const { width, height } = useTerminalDimensions();
  const [order, setOrder] = useState<LibraryOrder>(saved?.order || defaultOrder);
  const [libraryView, setLibraryView] = useState<'covers' | 'artists'>(saved?.libraryView || 'covers');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortIndex, setSortIndex] = useState(0);
  const baseAlbums = useMemo(() => albumsOf(library), [library]);
  const albums = useMemo(() => orderAlbums(baseAlbums, order.albums), [baseAlbums, order.albums]);
  const artists = useMemo(() => orderArtists(artistsOf(baseAlbums), order), [baseAlbums, order]);
  const catalogue = useMemo(() => ({ albums, artists, queue: snapshot.queue }), [albums, artists, snapshot.queue]);
  const history = useMemo(() => {
    const value = new NavigationHistory({ route: { page: 'queue' }, selection: 0 }, record);
    if (saved) value.restore(saved.history);
    return value;
  }, []);
  const [place, setPlace] = useState<Place>(history.current);
  const [prompt, setPrompt] = useState<'global' | 'local'>();
  const [query, setQuery] = useState('');
  const [resultIndex, setResultIndex] = useState(0);
  const [priorPlace, setPriorPlace] = useState(place);
  const priorLyrics = useRef({ line: 0, row: 0, following: false });
  const [lyricTop, setLyricTop] = useState(0);
  const [held, setHeld] = useState<{ id: number; target: number }>();
  const route = place.route;
  const orderContext = route.page === 'library' && route.mode === 'artists' ? 'artists' : route.page === 'artist' ? 'artistAlbums' : 'albums';
  const sortOptions = orderContext === 'artists' ? artistOrders : albumOrders;
  const sortLabel = sortOptions.find(option => option.value === order[orderContext])?.label || '';
  const items = useMemo(() => routeItems(route, catalogue), [route, catalogue]);
  const selected = items[place.selection];
  const current = snapshot.queue.find(t => t.queueId === snapshot.currentId);
  const lyrics = useLyrics(backend, current, snapshot, connection === 'connected', route.page === 'lyrics');
  const lyricLines = useMemo(() => lyricRows(lyrics.lyrics, width - 6), [lyrics.lyrics, width]);
  const lyricCursor = useRef<{ rows: typeof lyricLines; row: number } | undefined>(undefined);
  const lyricSelection = !lyrics.following && lyricCursor.current?.rows === lyricLines && lyricLines[lyricCursor.current.row]?.line === lyrics.selectedLine
    ? lyricCursor.current.row : Math.max(0, lyricLines.findIndex(row => row.line === lyrics.selectedLine));
  const shown = route.page === 'queue' ? current || selected : selected;
  const album = route.page === 'record' ? albums.find(a => a.key === route.key) : undefined;
  const parent = route.page === 'artist' ? artists.find(a => a.name === route.name) : route.page === 'record' ? artists.find(a => a.name === route.artist) : undefined;
  const browse = browserColumns(place, catalogue);
  const visibleColumns: BrowserColumn[] = !browse ? [] : width >= 100 && height >= 19 ? ['artists', 'albums', 'tracks'] : width >= 70 && height >= 19 ? browse.active === 'artists' ? ['artists', 'albums'] : ['albums', 'tracks'] : [browse.active];
  const browserArt = width >= 100 && height >= 24;
  const tight = height < 16;
  const lyricCapacity = Math.max(1, height - (tight ? 11 : 12) - (prompt === 'local' && !tight ? 2 : 0));
  const compactPrompt = height < 20;
  const capacityFor = (column?: BrowserColumn) => Math.max(1, Math.floor((height - (tight ? 8 : 10) - (prompt === 'local' ? tight ? 1 : 2 : 0) - (column && width >= 70 && height >= 19 ? 1 : 0) - (column === 'tracks' && browserArt ? 5 : 0)) / 2));
  const capacity = capacityFor(browse?.active);
  const top = place.viewport?.kind === 'list' ? place.viewport.index : 0;
  const showDetail = width >= 78 && height >= 19 && prompt !== 'global';
  const detailWidth = Math.min(36, Math.floor(width * .35));
  const results = useMemo(() => prompt === 'global' ? searchLibrary(query, albums, library, artists) : [], [prompt, query, albums, library, artists]);
  const matches = useMemo(() => prompt === 'local' ? (route.page === 'lyrics' ? lyrics.lyrics?.lines.map(line => line.text) || [] : items.map(t => `${t.title} ${t.artist} ${t.album}`)).map((text, i) => fuzzyScore(query, text) >= 0 ? i : -1).filter(i => i >= 0) : [], [prompt, query, items, route.page, lyrics.lyrics]);
  const elapsed = Math.min(current?.duration || 0, snapshot.elapsed + playClock);

  function position(point: Place, keepViewport = false): Place {
    const next = resolvePlace(point, catalogue);
    if (next.route.page === 'lyrics') return next;
    const columns = browserColumns(next, catalogue);
    if (columns) {
      for (const name of ['artists', 'albums', 'tracks'] as const) {
        const entry = columns[name], list = routeItems(entry.route, catalogue), size = capacityFor(name);
        let index = entry.viewport?.kind === 'list' ? entry.viewport.index : 0;
        index = keepViewport ? Math.max(0, Math.min(Math.max(0, list.length - size), index)) : reveal(entry.selection, index, list.length, size);
        columns[name] = identifyPlace({ ...entry, viewport: { kind: 'list', index, offset: 0 } }, list);
      }
      return { ...next, viewport: columns[columns.active].viewport, browser: browserTrail(columns) };
    }
    const list = routeItems(next.route, catalogue);
    let index = next.viewport?.kind === 'list' ? next.viewport.index : 0;
    if (!keepViewport) index = reveal(next.selection, index, list.length, capacity);
    else index = Math.max(0, Math.min(Math.max(0, list.length - capacity), index));
    return identifyPlace({ ...next, viewport: { kind: 'list', index, offset: 0, anchor: placeKey(next.route, list[index]) } }, list);
  }
  function select(index: number) {
    if (route.page === 'lyrics') { lyricCursor.current = undefined; lyrics.select(index); return; }
    const next = position({ ...place, selection: Math.max(0, Math.min(items.length - 1, index)), selected: undefined, queue: undefined });
    history.checkpoint(next); setPlace(next);
  }
  function selectLyricRow(index: number) {
    const row = Math.max(0, Math.min(lyricLines.length - 1, index));
    lyricCursor.current = { rows: lyricLines, row };
    lyrics.select(lyricLines[row]?.line || 0);
  }
  function visit(point: Place) {
    restoring.current = false;
    if (point.route.page === 'library') setLibraryView(point.route.mode);
    const next = position({ ...point, browser: point.browser || place.browser });
    history.visit(next, place); setPlace(next); setPrompt(undefined); setHeld(undefined); setSortOpen(false);
    setNotice(routeTitle(next.route, albums));
  }
  function openAlbum(target: Album, track?: Track) {
    const point = browse?.album?.key === target.key ? browserTarget(place, 'tracks', catalogue, track ? target.tracks.findIndex(t => t.uri === track.uri) : undefined) : undefined;
    visit(point || albumPlace(target, track, browse?.person || parent));
  }
  function openTrack(track: Track) { const target = albums.find(a => a.key === albumKey(track)); if (target) openAlbum(target, track); }
  function travel(direction: 'back' | 'forward') {
    const target = history.step(direction, place);
    if (!target) { setNotice(direction === 'back' ? 'At the beginning of navigation history' : 'At the end of navigation history'); return; }
    const next = position(target, true);
    history.checkpoint(next, false); setPlace(next); setHeld(undefined);
    setNotice(`${direction === 'back' ? 'Back' : 'Forward'} · ${routeTitle(next.route, albums)}`);
  }
  function openSelected() {
    if (browse) {
      const column = browse.active === 'artists' ? 'albums' : browse.active === 'albums' ? 'tracks' : undefined;
      const point = column && browserTarget(place, column, catalogue);
      if (point) visit(point);
      return;
    }
    if (!selected) return;
    if (route.page === 'library' && route.mode === 'artists') visit({ route: { page: 'artist', name: selected.artist }, selection: 0 });
    else openTrack(selected);
  }
  function parentPage() {
    if (browse && browse.active !== 'artists') {
      const target = browserTarget(place, browse.active === 'tracks' ? 'albums' : 'artists', catalogue);
      if (target) visit(target);
      return;
    }
    const next: Route = route.page === 'record' ? { page: 'artist', name: parent?.name || album?.artist || '' } : route.page === 'artist' ? { page: 'library', mode: 'artists' } : { page: 'queue' };
    if (route.page !== 'queue') visit({ route: next, selection: 0 });
  }
  function openPage(page: 'queue' | 'lyrics' | 'library') {
    const target = page === 'library' && libraryView === 'artists' && browse ? browserTarget(place, 'artists', catalogue) : undefined;
    visit(target || { route: page === 'library' ? { page, mode: libraryView } : { page }, selection: 0 });
  }
  function activateResult(result?: Result) {
    if (!result) return;
    setPrompt(undefined);
    if (result.kind === 'artist') visit({ route: { page: 'artist', name: result.artist.name }, selection: 0 });
    else if (result.kind === 'album') openAlbum(result.album);
    else if (result.kind === 'track') openTrack(result.track);
    else {
      if (result.title === 'Open queue') openPage('queue');
      if (result.title === 'Open lyrics') openPage('lyrics');
      if (result.title === 'Open library') openPage('library');
      if (result.title === 'Reload library') void act(reloadLibrary, 'Library refreshed');
      if (result.title === 'Play / pause') void act(() => backend.toggle());
      if (result.title === 'Next track') void act(() => backend.next());
      if (result.title === 'Previous track') void act(() => backend.previous());
    }
  }
  function keypress(key: KeyEvent) {
    if (key.ctrl && key.name === 'c') { key.preventDefault(); quit(); return; }
    if (sortOpen) {
      key.preventDefault();
      if (key.name === 'escape') setSortOpen(false);
      else if (key.name === 'down' || key.sequence === 'j') setSortIndex(i => (i + 1) % sortOptions.length);
      else if (key.name === 'up' || key.sequence === 'k') setSortIndex(i => (i - 1 + sortOptions.length) % sortOptions.length);
      else if (key.name === 'return' && sortOptions[sortIndex]) {
        const value = sortOptions[sortIndex]!.value;
        setOrder(previous => ({ ...previous, [orderContext]: value })); setSortOpen(false);
      }
      return;
    }
    if (prompt) {
      if (key.name === 'escape') {
        key.preventDefault();
        if (prompt === 'local') {
          if (route.page === 'lyrics') {
            const prior = priorLyrics.current;
            if (prior.following) lyrics.follow();
            else if (lyricLines[prior.row]?.line === prior.line) selectLyricRow(prior.row);
            else select(prior.line);
          }
          else { setPlace(priorPlace); history.checkpoint(priorPlace); }
        }
        setPrompt(undefined);
      }
      if (key.name === 'up' || key.name === 'down') {
        key.preventDefault(); const delta = key.name === 'down' ? 1 : -1;
        if (prompt === 'global') setResultIndex(i => Math.max(0, Math.min(results.length - 1, i + delta)));
        else if (matches.length) select(matches[(matches.indexOf(route.page === 'lyrics' ? lyrics.selectedLine : place.selection) + delta + matches.length) % matches.length]!);
      }
      return; // The focused input owns text, cursor movement, and submit.
    }
    if (key.ctrl || key.meta || key.super || key.option) return;
    const char = key.sequence;
    const direction = directionOf({ key: key.name, keyChar: char, modifiers: { shift: key.shift, ctrl: false, alt: false, cmd: false } });
    key.preventDefault();
    if (held) {
      if (key.name === 'escape') setHeld(undefined);
      else if (direction) setHeld({ ...held, target: Math.max(0, Math.min(items.length - 1, held.target + (direction === 'down' || direction === 'right' ? 1 : -1))) });
      else if (key.name === 'return' || key.name === 'space') {
        const source = snapshot.queue.findIndex(t => t.queueId === held.id);
        const before = held.target > source ? snapshot.queue[held.target + 1]?.queueId ?? null : snapshot.queue[held.target]?.queueId ?? null;
        if (held.target !== source) void act(() => backend.move(held.id, before), 'Queue order updated');
        setHeld(undefined);
      }
      return;
    }
    if (char === ':' || char === '/') { setPriorPlace(place); priorLyrics.current = { line: lyrics.selectedLine, row: lyricSelection, following: lyrics.following }; setQuery(''); setResultIndex(0); setPrompt(char === ':' ? 'global' : 'local'); }
    else if (char === 'o') travel('back');
    else if (char === 'i') travel('forward');
    else if (char === 'q') quit();
    else if (char === 'f' && route.page === 'lyrics') lyrics.follow();
    else if (char === 'r' && route.page === 'lyrics') lyrics.reload();
    else if (char === 's' && (route.page === 'library' || route.page === 'artist')) { setSortIndex(Math.max(0, sortOptions.findIndex(option => option.value === order[orderContext]))); setSortOpen(true); }
    else if (key.name === 'f1') openPage('queue');
    else if (key.name === 'f2') openPage('lyrics');
    else if (key.name === 'f3') openPage('library');
    else if (direction === 'up' || direction === 'down') {
      const delta = direction === 'down' ? 1 : -1;
      if (route.page === 'lyrics') selectLyricRow(lyricSelection + delta); else select(place.selection + delta);
    }
    else if (direction === 'left' || key.name === 'escape') parentPage();
    else if (direction === 'right') openSelected();
    else if (key.name === 'pagedown' || key.name === 'pageup') {
      const delta = key.name === 'pagedown' ? 1 : -1;
      if (route.page === 'lyrics') selectLyricRow(lyricSelection + delta * lyricCapacity); else select(place.selection + delta * capacity);
    }
    else if (key.name === 'home' || key.name === 'end') {
      if (route.page === 'lyrics') selectLyricRow(key.name === 'home' ? 0 : lyricLines.length - 1); else select(key.name === 'home' ? 0 : items.length - 1);
    }
    else if (key.name === 'return') {
      if (route.page === 'lyrics') {
        const time = lyrics.lyrics?.lines[lyrics.selectedLine]?.time;
        if (time !== undefined && current && snapshot.state !== 'stop') void act(() => backend.seek(current.queueId, time));
      }
      else if (route.page === 'library' || route.page === 'artist') openSelected();
      else if (route.page === 'queue' && snapshot.queue[place.selection]) void act(() => backend.play(snapshot.queue[place.selection]!.queueId));
      else if (selected) void act(() => backend.enqueue(selected, true), `Playing ${selected.title}`);
    }
    else if (key.name === 'space') void act(() => backend.toggle());
    else if (char === '[' || char === ']') { if (current && snapshot.state !== 'stop') void act(() => backend.seek(current.queueId, Math.max(0, Math.min(current.duration, elapsed + (char === '[' ? -10 : 10))))); }
    else if ((key.name === 'backspace' || key.name === 'delete') && route.page === 'queue') {
      const track = snapshot.queue[place.selection]; if (track) void act(() => backend.remove(track.queueId), `Removed ${track.title} from the queue`);
    }
    else if (char === 'm' && route.page === 'queue' && snapshot.queue[place.selection]) setHeld({ id: snapshot.queue[place.selection]!.queueId, target: place.selection });
    else if (key.name === 'tab' && route.page === 'library') visit({ route: { page: 'library', mode: route.mode === 'covers' ? 'artists' : 'covers' }, selection: 0 });
  }
  // Commit each key before the next terminal byte; fast ':' + text must keep its prefix.
  useKeyboard(key => flushSync(() => keypress(key)));
  useLayoutEffect(() => {
    if (route.page !== 'lyrics') return;
    setLyricTop(top => lyrics.following ? Math.max(0, Math.min(Math.max(0, lyricLines.length - lyricCapacity), lyricSelection - Math.floor(lyricCapacity / 2))) : reveal(lyricSelection, top, lyricLines.length, lyricCapacity));
  }, [route.page, lyricSelection, lyricLines, lyricCapacity, lyrics.following]);
  useLayoutEffect(() => {
    if (restoring.current && (!libraryReady || !snapshotReady)) return;
    const next = position(place);
    restoring.current = false;
    if (JSON.stringify(next) !== JSON.stringify(place)) { setPlace(next); history.checkpoint(next, false); }
    setHeld(undefined);
  }, [catalogue, width, height, libraryReady, snapshotReady, prompt === 'local']);
  useLayoutEffect(() => {
    stateProvider.current = () => libraryReady && snapshotReady && !restoring.current ? { version: 1, history: history.snapshot(), order, libraryView } : undefined;
  });
  useEffect(() => navigationState?.attach(() => stateProvider.current()), [navigationState]);
  useEffect(() => { navigationState?.schedule(); }, [place, order, libraryView, libraryReady, snapshotReady, navigationState]);
  useEffect(() => { if (prompt === 'local' && query.trim() && matches.length) select(matches[0]!); }, [query]);

  const error = stateError || logError?.() || actionProblem || problem || libraryProblem;
  const status = backend.demo ? 'Demo · simulated' : connection === 'connected' ? 'MPD connected' : connection === 'down' ? 'MPD down' : 'MPD connecting';
  const heading = routeTitle(route, albums) + (route.page === 'library' ? route.mode === 'artists' ? ' / Artists' : ' / Albums' : route.page === 'record' ? ` / ${parent?.name || album?.artist || ''}` : '');
  const resultCount = Math.max(1, Math.floor((height - (compactPrompt ? tight ? 8 : 9 : 16)) / 2));
  const resultTop = Math.max(0, resultIndex - resultCount + 1);
  const input = <box height={1} flexDirection="row" gap={1}>
    <text fg={C.accent}>{prompt === 'global' ? ':' : '/'}</text>
    <input id="music-prompt" focused value={query} flexGrow={1} backgroundColor={fill(theme, 'prompt')} textColor={C.text} focusedBackgroundColor={fill(theme, 'prompt')} focusedTextColor={C.text} placeholderColor={C.placeholder} cursorColor={C.caret} selectionBg={theme.pairs.selected.background} selectionFg={theme.pairs.selected.colors.text} placeholder={prompt === 'global' ? 'Find an artist, album, track or action' : 'Find in this list'} onInput={value => flushSync(() => { setQuery(value); setResultIndex(0); })} onSubmit={() => flushSync(() => { if (prompt === 'global') activateResult(results[resultIndex]); else setPrompt(undefined); })} />
  </box>;
  if (width < 40 || height < 12) return <box width="100%" height="100%" padding={1} backgroundColor={fill(theme, 'canvas')}><Line text="Music · enlarge to at least 40 × 12" /><Line text="q quit · Ctrl+C quit" tone="muted" /></box>;
  return <box width="100%" height="100%" flexDirection="column" backgroundColor={fill(theme, 'canvas')}>
    <box height={3} paddingLeft={2} paddingRight={2} paddingTop={1} flexDirection="row" gap={3} backgroundColor={fill(theme, 'header')}>
      <Tab active={route.page === 'queue'} label={width < 60 ? 'F1 Play' : 'F1 Now playing'} /><Tab active={route.page === 'lyrics'} label="F2 Lyrics" /><Tab active={route.page === 'library'} label="F3 Library" />
    </box>
    <box flexGrow={1} minHeight={0} paddingLeft={2} paddingRight={2} paddingTop={tight ? 0 : 1} flexDirection="column">
      {prompt === 'global' ? <box flexDirection="column" height="100%" gap={compactPrompt ? 0 : 1} backgroundColor={fill(theme, 'prompt')} padding={compactPrompt ? 0 : 1}>
        {input}
        {!compactPrompt && <Line text="Artists · albums · tracks · actions" tone="muted" />}
        <box flexGrow={1} minHeight={0} flexDirection="column">
          {results.slice(resultTop, resultTop + resultCount).map((result, i) => {
            const title = result.kind === 'artist' ? result.artist.name : result.kind === 'album' ? result.album.title : result.kind === 'track' ? result.track.title : result.title;
            const subtitle = result.kind === 'artist' ? `${result.artist.albums.length} albums` : result.kind === 'album' ? `${result.album.artist} · ${result.album.year}` : result.kind === 'track' ? `${result.track.artist} · ${result.track.album}` : 'Run action';
            return <Row key={result.key} height={2} pair={pairForState(theme, { selected: i + resultTop === resultIndex })}>
              <Line marker={`${i + resultTop === resultIndex ? '›' : ' '} `} text={`${result.kind.padEnd(6)} ${title}`} /><Line text={`         ${subtitle}`} tone="muted" />
            </Row>;
          })}
          {!results.length && <Line text={loading ? 'Reading the library…' : 'No matches'} tone="muted" />}
        </box>
        {!compactPrompt && <Line text="↑↓ choose · Enter open / run · Esc return" tone="muted" />}
      </box> : route.page === 'lyrics' ? <box flexGrow={1} minHeight={0} flexDirection="column">
        <Line text={current?.title || 'Nothing playing'} tone="accent" />
        <Line text={current ? `${current.artist} · ${current.album}` : 'Choose a track to see its lyrics'} tone="muted" />
        <Line text={lyrics.loading ? 'Reading local lyrics…' : lyrics.error || (!lyrics.lyrics ? 'No local lyrics found · r reload' : lyrics.lyrics.synced ? `${lyrics.following ? 'Following playback' : 'Reading'} · ${snapshot.state === 'pause' ? 'paused' : connection === 'down' ? 'disconnected' : 'synced lyrics'}` : 'Untimed lyrics')} tone={lyrics.error ? 'warning' : 'muted'} />
        {prompt === 'local' && <box height={tight ? 1 : 2} paddingTop={tight ? 0 : 1}>{input}</box>}
        <box flexGrow={1} minHeight={0} flexDirection="column">
          {lyricLines.slice(lyricTop, lyricTop + lyricCapacity).map((row, index) => {
            const selected = row.line === lyrics.selectedLine && !lyrics.following, active = row.line === lyrics.activeLine;
            const marker = `${row.line === lyrics.selectedLine ? '›' : active ? '•' : ' '} `;
            return <Row key={lyricTop + index} height={1} pair={pairForState(theme, { selected, active })}>
              <Line marker={marker} text={row.text || '· · ·'} suffix={selected && active ? ' •' : undefined} />
            </Row>;
          })}
        </box>
        {!(tight && prompt === 'local') && <Line text={lyrics.lyrics?.synced ? 'j/k read · Enter seek · f follow · / find · r reload' : 'j/k read · / find · r reload'} tone="muted" />}
      </box> : <>
        <Line text={`${heading}   ${items.length ? place.selection + 1 : 0}/${items.length}${route.page === 'library' || route.page === 'artist' ? `   s ${sortLabel} ▾` : ''}`} tone="accent" />
        {prompt === 'local' && <box height={tight ? 1 : 2} paddingTop={tight ? 0 : 1}>{input}</box>}
        <box flexDirection="row" gap={browse ? 2 : 3} flexGrow={1} minHeight={0} paddingTop={tight ? 0 : 1}>
          {browse ? visibleColumns.map(column => {
            const point = browse[column], columnItems = column === 'artists' ? routeItems(point.route, catalogue) : column === 'albums' ? browse.person?.albums.map(a => a.tracks[0]!) || [] : browse.album?.tracks || [];
            const columnTop = point.viewport?.kind === 'list' ? point.viewport.index : 0;
            const active = browse.active === column;
            return <box key={column} flexDirection="column" flexGrow={column === 'tracks' ? 1.4 : 1} flexBasis={0} minWidth={0}>
              {visibleColumns.length > 1 && <Line text={`${active ? '›' : ' '} ${column.toUpperCase()} ${columnItems.length}`} tone={active ? 'accent' : 'muted'} />}
              {column === 'tracks' && browserArt && <box height={5} flexShrink={0} flexDirection="row" gap={1}>
                <Cover session={session} track={browse.track} width={8} height={4} protocol={protocol} />
                <box flexDirection="column" flexGrow={1} minWidth={0}><Line text={active ? browse.track?.title || '' : browse.album?.title || ''} /><Line text={browse.track?.artist || ''} tone="muted" /><Line text={active ? browse.album?.title || '' : browse.album?.year || ''} tone="muted" /></box>
              </box>}
              {columnItems.slice(columnTop, columnTop + capacityFor(column)).map((track, offset) => {
                const index = columnTop + offset, chosen = point.selection === index;
                const title = column === 'artists' ? track.artist : column === 'albums' ? track.album : track.title;
                const subtitle = column === 'artists' ? `${artists[index]?.albums.length || 0} albums` : column === 'albums' ? `${track.year} · ${browse.person?.albums[index]?.tracks.length || 0} tracks` : `${track.disc && track.disc > 1 ? `${track.disc}.` : ''}${String(track.number).padStart(2, '0')} · ${duration(track.duration)}`;
                return <Row key={placeKey(point.route, track)} height={2} pair={pairForState(theme, { selected: chosen && active, context: chosen && !active })}>
                  <Line marker={`${chosen ? active ? '›' : '·' : ' '} `} text={title} /><Line text={`  ${subtitle}`} tone="muted" />
                </Row>;
              })}
              {!columnItems.length && <Line text={loading ? 'Reading…' : 'Nothing here'} tone="muted" />}
            </box>;
          }) : <><box flexDirection="column" flexGrow={1} minWidth={0}>
            {items.slice(top, top + capacity).map((track, i) => {
              const index = top + i;
              const isSelected = index === place.selection;
              const playing = route.page === 'queue' && snapshot.queue[index]?.queueId === snapshot.currentId;
              const title = route.page === 'library' && route.mode === 'artists' ? track.artist : route.page === 'artist' || route.page === 'library' ? track.album : track.title;
              const subtitle = route.page === 'library' && route.mode === 'artists' ? `${artists.find(a => a.name === track.artist)?.albums.length || 0} albums` : `${track.artist} · ${route.page === 'library' || route.page === 'artist' ? track.year : track.album}`;
              const marker = held?.target === index ? '↕' : isSelected ? '›' : playing ? '▶' : ' ';
              return <Row key={placeKey(route, track)} height={2} pair={pairForState(theme, { selected: isSelected, active: playing })}>
                <Line marker={`${marker} `} text={`${String(index + 1).padStart(2)} ${playing ? '▶ ' : ''}${title}`} /><Line text={`     ${subtitle}`} tone="muted" />
              </Row>;
            })}
            {!items.length && <Line text={loading ? 'Reading the library…' : 'Nothing here. Find an album with :'} tone="muted" />}
          </box>
          {showDetail && <box width={detailWidth} flexShrink={0} flexDirection="column" gap={1}>
            <Cover session={session} track={shown} width={detailWidth} height={Math.max(4, Math.min(Math.floor(detailWidth / 2), height - 17))} protocol={protocol} />
            <box><Line text={shown?.title || 'Nothing playing'} /><Line text={shown?.artist || ''} tone="muted" /><Line text={shown?.album || ''} tone="muted" /></box>
          </box>}</>}
        </box>
      </>}
    </box>
    <box height={4} flexShrink={0} paddingLeft={2} paddingRight={2} paddingTop={1} backgroundColor={fill(theme, 'transport')}>
      <Line text={`${snapshot.state === 'play' ? '▶' : snapshot.state === 'pause' ? 'Ⅱ' : '■'} ${current?.title || 'Nothing playing'}   ${duration(elapsed)} / ${duration(current?.duration || 0)}   ${snapshot.volume}%`} />
      <Line text={held ? 'Moving · arrows / hjkl position · Enter drop · Esc cancel' : route.page === 'lyrics' ? 'Space pause · [/] seek · : prompt · o/i history · q quit' : 'hjkl / arrows · Enter play/open · Space pause · : prompt · o/i history · q quit'} tone="muted" />
      <Line text={`${status} · ${error || notice}`} tone={error ? 'warning' : 'muted'} />
    </box>
    {sortOpen && <box position="absolute" top={5} right={2} width={Math.min(29, width - 4)} height={sortOptions.length + 2} padding={1} backgroundColor={fill(theme, 'sortMenu')}>
      {sortOptions.map((option, index) => <Row key={option.value} height={1} pair={pairForState(theme, { selected: index === sortIndex })}><Line marker={`${index === sortIndex ? '›' : ' '} `} text={option.label} /></Row>)}
    </box>}
  </box>;
}
