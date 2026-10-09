import { Children, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject, type SetStateAction } from 'react';
import { flushSync, motion, render, useGpuixRequired, useWindowSize, type EventPayload, type PublicInstance, type StyleDesc } from '@gpuix/react';
import type { GpuixRenderer } from '@gpuix/native';
import { DemoBackend } from './demo';
import { PaletteSession } from './palette-session';
import { paletteSourceFromEnvironment } from './palette-file';
import { MpdBackend } from './mpd';
import { FocusSteps } from './focus';
import { albumsOf, artistsOf, albumKey, duration, fuzzyScore, searchLibrary, type Album, type Artist, type MusicBackend, type QueueTrack, type Result, type Track } from './model';
import { directionOf, gridSelection, listReveal, pageShortcut, pointerDrag } from './navigation';
import { pairForState, type TextTone, type ThemePair } from './theme';
import { surface, ThemedInput } from './native-theme';
import { ThemeProvider, ThemePairProvider, useTheme, useThemePair } from './use-theme';
import { demoPaletteProbeConfiguration, nativeProbeObserver } from './demo-palette-probe';
import { NavigationHistory, type BrowserColumn, type BrowserTrail, type Place, type Route, type Viewport } from './history';
import { browserColumns, browserTarget, browserTrail, rememberBrowser } from './browser';
import { NavigationLog } from './navigation-log';
import { MusicSession, useMusic } from './music-session';
import { albumPlace, identifyPlace, placeKey, resolvePlace as resolveLocation } from './locations';
import { albumOrders, artistOrders, defaultOrder, orderAlbums, orderArtists, type LibraryOrder } from './library-order';
import { NavigationStateStore, navigationStatePath, type NavigationState } from './navigation-state';
import { lyricRows } from './lyrics';
import { useLyrics } from './use-lyrics';

const FONT = 'Menlo';
const ROW = 68;
type QueueDrag = { id: number; target: number; startY?: number; dy: number };
let dispatchKey: (event: EventPayload) => void = () => {};
let focusedButton: { token: object; activate: () => void } | undefined;
let didFocusControl: () => void = () => {};
const demo = process.argv.includes('--demo');
const probe = demoPaletteProbeConfiguration();
const backend: MusicBackend = demo ? new DemoBackend() : new MpdBackend();
const navigationLog = new NavigationLog(demo ? 'demo' : 'mpd', probe?.navigationLogDirectory);
const session = new MusicSession(backend, 1000, new PaletteSession(probe?.paletteSource ?? paletteSourceFromEnvironment(demo)));
const navigationState = new NavigationStateStore(navigationStatePath(demo ? 'demo' : 'mpd', 'gui', probe?.navigationStateDirectory));
// GPUIX exits on window close; signals must also release the owned MPD helper.
process.once('SIGTERM', () => process.exit(0));
process.once('SIGINT', () => process.exit(0));

function Text({ children, size = 13, tone = 'text', style = {}, onClick }: { children: ReactNode; size?: number; tone?: TextTone; style?: StyleDesc; onClick?: () => void }) {
  const pair = useThemePair();
  // GPUIX lays out separate primitive children as separate native text nodes.
  return <text onClick={onClick} style={{ fontFamily: FONT, fontSize: size, color: pair.colors[tone], whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0, ...style }}>{Children.toArray(children).join('')}</text>;
}
function useControlFocus(onClick: () => void) {
  const [focused, setFocused] = useState(false);
  const token = useRef({}).current;
  const action = useRef(onClick);
  useLayoutEffect(() => { action.current = onClick; });
  useEffect(() => () => { if (focusedButton?.token === token) focusedButton = undefined; }, [token]);
  function focus() { setFocused(true); focusedButton = { token, activate: () => action.current() }; didFocusControl(); }
  function blur() { setFocused(false); if (focusedButton?.token === token) focusedButton = undefined; }
  return { focused, onFocus: focus, onBlur: blur };
}
function Button({ children, onClick, active = false, id, style = {}, tab = false, pair: explicitPair }: { children: ReactNode; onClick: () => void; active?: boolean; id?: string; style?: StyleDesc; tab?: boolean; pair?: ThemePair }) {
  const theme = useTheme(), surrounding = useThemePair();
  const pair = explicitPair ?? (active ? theme.pairs.active : surrounding);
  const { focused, ...focusProps } = useControlFocus(onClick);
  return <ThemePairProvider pair={pair}><div testId={id} tabIndex={0} onClick={onClick} {...focusProps} style={{ paddingTop: 7, paddingBottom: 7, paddingLeft: 11, paddingRight: 11, borderWidth: 1, borderColor: focused ? pair.marker : 'transparent', borderRadius: 3, cursor: 'pointer', userSelect: 'none', ...style, background: pair.background, hover: { borderColor: pair.border } }}><Text>{children}</Text></div></ThemePairProvider>;
}
function Link({ children, onClick, muted = false, size = 13, style = {} }: { children: string; onClick: () => void; muted?: boolean; size?: number; style?: StyleDesc }) {
  const pair = useThemePair(), C = pair.colors;
  const { focused, ...focusProps } = useControlFocus(onClick);
  return <text tabIndex={0} onClick={onClick} {...focusProps} style={{ fontFamily: FONT, fontSize: size, color: focused ? C.linkHover : muted ? C.linkMuted : C.link, borderBottomWidth: 1, borderColor: focused ? pair.marker : 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0, hover: { borderColor: pair.border }, userSelect: 'none', ...style }}>{children}</text>;
}

function Cover({ track, size, onClick }: { track?: Track; size: number; onClick?: () => void }) {
  const theme = useTheme();
  const [source, setSource] = useState(track?.art);
  useEffect(() => {
    let cancelled = false;
    setSource(track?.art);
    if (track) void backend.artwork(track).then(art => { if (!cancelled) setSource(art); });
    return () => { cancelled = true; };
  }, [track?.uri]);
  return <ThemePairProvider pair={theme.pairs.normal}><div onClick={onClick} style={{ width: size, height: size, flexShrink: 0, ...surface(theme, 'coverPlaceholder'), pointerEvents: onClick ? 'auto' : 'none', cursor: onClick ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {source ? <img src={source} objectFit="contain" style={{ width: size, height: size }} /> : <Text size={Math.min(40, size / 2)} tone={'muted'}>♪</Text>}
  </div></ThemePairProvider>;
}

function BrowserList({ listRef, point, count, rowHeight, revision, preserve, width, height, onScroll, onWheel, align = 'edge', row }: {
  listRef: RefObject<PublicInstance | null>; point: Place; count: number; rowHeight: number;
  revision: number; preserve: boolean; width: number; height: number; onScroll: () => void; row: (index: number) => ReactNode;
  onWheel?: () => void; align?: 'edge' | 'middle';
}) {
  const renderer = useGpuixRequired();
  function rangeAt(index: number) {
    const capacity = Math.ceil(height / rowHeight) + 3;
    // A jump near the end is clamped upward by the native viewport. Mount that
    // whole possible viewport even before its first visible-range event.
    return { start: Math.max(0, Math.min(index, count - capacity) - 1), end: Math.min(count, index + capacity) };
  }
  const [range, setRange] = useState(() => rangeAt(point.viewport?.kind === 'list' ? point.viewport.index : point.selection));
  const restored = useRef(-1);
  function sync(event?: EventPayload) {
    const top = listRef.current && renderer.getListScrollTop?.(listRef.current.id);
    const first = top?.[0] ?? event?.startIndex ?? 0;
    const capacity = Math.ceil(((top?.[2] || height - 300) + (top?.[1] || 0)) / rowHeight) + 2;
    const start = Math.max(0, first - 1), end = Math.min(count, Math.max(event?.endIndex || 0, first + capacity) + 1);
    setRange(previous => previous.start === start && previous.end === end ? previous : { start, end });
    onScroll();
  }
  useEffect(() => {
    const ref = listRef.current;
    if (!ref) return;
    function jump(index: number, offset = 0) {
      // Mount the destination before asking native scrolling to reveal it. The
      // first visible-range event can precede a newly mounted list's jump.
      setRange(rangeAt(Math.max(0, index + Math.floor(offset / rowHeight))));
      renderer.scrollToItem?.(ref!.id, index, offset);
    }
    if (restored.current !== revision) {
      restored.current = revision;
      if (point.viewport?.kind === 'list') { jump(point.viewport.index, point.viewport.offset); return; }
    } else if (preserve) return;
    const top = renderer.getListScrollTop?.(ref.id);
    if (align === 'middle' && top?.[2]) { jump(point.selection, -Math.max(0, (top[2] - rowHeight) / 2)); return; }
    const destination = listReveal(point.selection, rowHeight, top);
    if (destination) jump(destination.index, destination.offset);
  }, [point.selection, revision, width, height, count, align]);
  return <div onScroll={() => { onWheel?.(); sync(); }} style={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
    <virtual-list ref={listRef} itemCount={count} windowStart={range.start} estimatedItemHeight={rowHeight} onVisibleRange={sync} style={{ width: '100%', flexGrow: 1, minHeight: 0 }}>
      {Array.from({ length: Math.max(0, Math.min(count, range.end) - range.start) }, (_, index) => row(range.start + index))}
    </virtual-list>
    {!count && <Text size={12} tone={'muted'}>Nothing here</Text>}
  </div>;
}

function App() {
  const theme = useTheme();
  const C = theme.colors;
  const renderer = useGpuixRequired();
  // An opted-in demo probe needs AppKit activation for targeted OS input.
  useEffect(() => { if (probe && process.env.GPUIX_BACKGROUND !== '1') renderer.activateWindow?.(); }, [renderer]);
  const focusSteps = useMemo(() => new FocusSteps(
    direction => direction === 'next' ? renderer.focusNext?.() : renderer.focusPrevious?.(),
    () => focusedButton?.activate(),
  ), [renderer]);
  useLayoutEffect(() => {
    didFocusControl = () => focusSteps.didFocus();
    return () => { didFocusControl = () => {}; focusSteps.cancel(); };
  }, [focusSteps]);
  const { width, height } = useWindowSize();
  const { library, snapshot, loading, libraryReady, snapshotReady, libraryProblem, connection, notice, problem, actionProblem, playClock, act, reloadLibrary, setNotice } = useMusic(session);
  const saved = useMemo(() => navigationState.read(), []);
  const stateError = useSyncExternalStore(navigationState.subscribe, navigationState.getError);
  const restoring = useRef(Boolean(saved));
  const saveReady = useRef(false);
  const stateProvider = useRef<() => NavigationState | undefined>(() => undefined);
  const [locationRevision, setLocationRevision] = useState(0);
  const locationEpoch = useRef(0);
  const [view, setView] = useState<'queue' | 'lyrics' | 'library' | 'artist' | 'record'>('queue');
  const [order, setOrder] = useState<LibraryOrder>(saved?.order || defaultOrder);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortIndex, setSortIndex] = useState(0);
  const pendingSort = useRef<Place | undefined>(undefined);
  const [gridWindow, setGridWindow] = useState({ key: '', start: 0, end: 6 });
  const [libraryView, setLibraryView] = useState<'covers' | 'artists'>(saved?.libraryView || 'covers');
  const [artist, setArtist] = useState<Artist>();
  const [record, setRecord] = useState<Album>();
  const [browser, setBrowser] = useState<BrowserTrail>();
  const [selection, updateSelection] = useState(0);
  const selectionScroll = useRef<'reveal' | 'preserve'>('reveal');
  function setSelection(next: SetStateAction<number>, scroll: 'reveal' | 'preserve' = 'reveal') {
    selectionScroll.current = scroll;
    updateSelection(next);
  }
  function selectFromPointer(index: number) { clearFocus(); setSelection(index, 'preserve'); }
  const [prompt, setPrompt] = useState<'global' | 'local' | null>(null);
  const [query, setQuery] = useState('');
  const [resultIndex, setResultIndex] = useState(0);
  const [drag, setDrag] = useState<QueueDrag>();
  const history = useMemo(() => {
    const value = new NavigationHistory({ route: { page: 'queue' }, selection: 0 }, event => navigationLog.append(event));
    if (saved) value.restore(saved.history);
    return value;
  }, []);
  const pendingViewport = useRef<Viewport | undefined>(undefined);
  const queueRef = useRef<PublicInstance>(null);
  const albumGridRef = useRef<PublicInstance>(null);
  const browserArtistRef = useRef<PublicInstance>(null);
  const browserAlbumRef = useRef<PublicInstance>(null);
  const browserTrackRef = useRef<PublicInstance>(null);
  const browserRefs = { artists: browserArtistRef, albums: browserAlbumRef, tracks: browserTrackRef };
  const promptListRef = useRef<PublicInstance>(null);
  const progressRef = useRef<PublicInstance>(null);
  const priorSelection = useRef(0);
  const priorLyricsFollow = useRef(false);
  const lyricRef = useRef<PublicInstance>(null);
  const lyricPointer = useRef(false);
  const promptReady = useRef(false);
  const activeDrag = useRef(drag);
  function updateDrag(next: QueueDrag | undefined) {
    activeDrag.current = next;
    setDrag(next);
  }
  const baseAlbums = useMemo(() => albumsOf(library), [library]);
  const albums = useMemo(() => orderAlbums(baseAlbums, order.albums), [baseAlbums, order.albums]);
  const artists = useMemo(() => orderArtists(artistsOf(baseAlbums), order), [baseAlbums, order]);
  const shelf = view === 'artist' ? artist?.albums || [] : albums;
  const isGrid = view === 'library' && libraryView === 'covers';
  const isArtists = view === 'library' && libraryView === 'artists';
  const current = snapshot.queue.find(t => t.queueId === snapshot.currentId);
  const lyrics = useLyrics(backend, current, snapshot, connection === 'connected', view === 'lyrics');
  const lyricWidth = Math.min(850, width - 44);
  const lyricLines = useMemo(() => lyricRows(lyrics.lyrics, Math.floor((lyricWidth - 40) / 11)), [lyrics.lyrics, lyricWidth]);
  const lyricSelection = Math.max(0, lyricLines.findIndex(row => row.line === lyrics.selectedLine));
  const artistBuffer = useMemo(() => artists.map(a => ({ ...a.albums[0]!.tracks[0]!, artist: a.name })), [artists]);
  const buffer = view === 'lyrics' ? [] : view === 'queue' ? snapshot.queue : view === 'record' ? record?.tracks || [] : isArtists ? artistBuffer : shelf.map(a => a.tracks[0]!);
  const catalogue = { albums, artists, queue: snapshot.queue };
  const browse = browserColumns({ route: currentRoute(), selection, viewport: pendingViewport.current, browser }, catalogue);
  const matches = useMemo(() => (view === 'lyrics' ? lyrics.lyrics?.lines.map(line => line.text) || [] : buffer.map(t => `${t.title} ${t.artist} ${t.album}`)).map((text, i) => fuzzyScore(query, text) >= 0 ? i : -1).filter(i => i >= 0), [view, lyrics.lyrics, buffer, query]);
  const results = useMemo(() => searchLibrary(query, albums, library, artists), [query, albums, library, artists]);
  const selected = buffer[selection] || current;
  const shown = view === 'queue' ? current || selected : selected;
  const narrow = width < 850;
  const artHeightBudget = height - 360 - (view === 'record' ? 50 : 0) - (prompt === 'local' ? 56 : 0);
  const artSize = Math.max(120, Math.min(350, Math.floor(width * (narrow ? 0.32 : 0.36) - 55), artHeightBudget));
  const columns = Math.max(3, Math.floor((width - 48) / 190));
  const albumTileSize = Math.floor((width - 44 - (columns - 1) * 20) / columns);
  const gridRowHeight = albumTileSize + 78;
  const gridRows = Math.ceil(shelf.length / columns);
  const gridKey = `${view}:${artist?.name || ''}:${columns}:${view === 'artist' ? order.artistAlbums : order.albums}`;
  const gridRange = gridWindow.key === gridKey ? gridWindow : { start: 0, end: 6 };
  const orderContext = isArtists ? 'artists' : view === 'artist' ? 'artistAlbums' : 'albums';
  const sortOptions = isArtists ? artistOrders : albumOrders;
  const sortLabel = sortOptions.find(option => option.value === order[orderContext])?.label || '';
  const elapsed = Math.min(current?.duration || 0, snapshot.elapsed + playClock);
  const error = actionProblem || problem || libraryProblem;

  useLayoutEffect(() => {
    if (restoring.current) {
      if (!libraryReady || !snapshotReady) return;
      restoring.current = false;
      const point = resolvePlace(history.current);
      history.checkpoint(point, false); applyPlace(point); return;
    }
    if (pendingSort.current) {
      const point = resolvePlace(pendingSort.current); pendingSort.current = undefined;
      applyPlace(point); return;
    }
    if (saveReady.current && (view === 'queue' ? snapshotReady : libraryReady)) {
      const point = resolvePlace(history.current);
      history.checkpoint(point, false); applyPlace(point, false);
    }
  }, [albums, artists, snapshot.queue, libraryReady, snapshotReady]);
  useEffect(() => { if (!restoring.current && locationRevision === locationEpoch.current) setSelection(i => Math.min(i, Math.max(0, buffer.length - 1))); }, [buffer.length]);
  useEffect(() => {
    if (restoring.current) return;
    if (prompt === 'local' && query.trim() && matches.length) {
      if (view === 'lyrics') selectLyric(matches[0]!); else setSelection(matches[0]!);
    }
  }, [query, prompt]);
  useEffect(() => {
    if (restoring.current || locationRevision !== locationEpoch.current) return;
    const scroll = selectionScroll.current;
    selectionScroll.current = 'reveal';
    if (browse || view === 'lyrics') { pendingViewport.current = undefined; return; }
    if (activeDrag.current?.startY !== undefined) return;
    const ref = isGrid ? albumGridRef : queueRef;
    const saved = pendingViewport.current;
    pendingViewport.current = undefined;
    if (saved?.kind === 'list' && ref.current) { renderer.scrollToItem?.(ref.current.id, isGrid ? Math.floor(saved.index / columns) : saved.index, saved.offset); return; }
    if (saved?.kind === 'grid' && albumGridRef.current && isGrid) { renderer.scrollToItem?.(albumGridRef.current.id, Math.max(0, Math.floor(-saved.y / gridRowHeight))); return; }
    // A click chooses an already visible item; only navigation should reveal it.
    if (scroll === 'preserve' || !ref.current) return;
    const target = isGrid ? Math.floor(selection / columns) : selection;
    const rowHeight = isGrid ? gridRowHeight : ROW;
    const top = renderer.getListScrollTop?.(ref.current.id);
    const destination = listReveal(target, rowHeight, top);
    if (destination) renderer.scrollToItem?.(ref.current.id, destination.index, destination.offset);
  }, [selection, view, libraryView, artist?.name, record?.key, columns, gridRowHeight, height, order, locationRevision]);
  useEffect(() => {
    if (restoring.current || locationRevision !== locationEpoch.current) return;
    saveReady.current = libraryReady && snapshotReady;
    const point = capturePlace();
    history.checkpoint(point);
    setBrowser(point.browser);
    navigationState.schedule();
  }, [selection, view, libraryView, artist?.name, record?.key, buffer.length, libraryReady, snapshotReady, order, locationRevision]);
  useLayoutEffect(() => {
    stateProvider.current = () => saveReady.current && !restoring.current ? { version: 1, history: history.snapshot(), order, libraryView } : undefined;
  });
  useEffect(() => navigationState.attach(() => stateProvider.current()), []);
  useEffect(() => { updateDrag(undefined); }, [width, height, view, snapshot.queue]);
  useEffect(() => {
    if (prompt === 'global' && promptListRef.current) renderer.scrollToItem?.(promptListRef.current.id, resultIndex);
  }, [prompt, resultIndex, results.length, height]);

  function currentRoute(): Route {
    if (view === 'lyrics') return { page: 'lyrics' };
    if (view === 'record' && record) return { page: 'record', key: record.key, artist: artist?.name };
    if (view === 'artist' && artist) return { page: 'artist', name: artist.name };
    return view === 'library' ? { page: 'library', mode: libraryView } : { page: 'queue' };
  }
  function capturePlace(): Place {
    const route = currentRoute();
    if (route.page === 'lyrics') return { route, selection: 0, browser };
    const point: Place = { route, selection, selected: placeKey(route, buffer[selection]), browser };
    if (browse) {
      const columns = browserColumns(point, catalogue)!;
      for (const name of ['artists', 'albums', 'tracks'] as const) {
        const ref = browserRefs[name].current;
        const top = ref && renderer.getListScrollTop?.(ref.id);
        if (top) columns[name].viewport = { kind: 'list', index: top[0], offset: top[1] };
      }
      point.viewport = pendingViewport.current || columns[browse.active].viewport;
      point.browser = browserTrail(columns);
      return rememberBrowser(identifyPlace(point, buffer), catalogue);
    }
    if (pendingViewport.current) point.viewport = pendingViewport.current;
    else {
      const ref = isGrid ? albumGridRef : queueRef;
      const top = ref.current && renderer.getListScrollTop?.(ref.current.id);
      if (top) {
        const index = (top[0] || 0) * (isGrid ? columns : 1);
        point.viewport = { kind: 'list', index, offset: top[1] || 0, anchor: placeKey(route, buffer[index]) };
      }
    }
    return identifyPlace(point, buffer);
  }
  function resolvePlace(point: Place): Place { return rememberBrowser(resolveLocation(point, catalogue), catalogue); }
  function applyPlace(point: Place, resetTransient = true) {
    if (resetTransient) { clearFocus(); updateDrag(undefined); setPrompt(null); setSortOpen(false); }
    const route = point.route;
    const album = route.page === 'record' ? albums.find(a => a.key === route.key) : undefined;
    const person = route.page === 'artist' ? artists.find(a => a.name === route.name) : album ? artists.find(a => a.name === (route.page === 'record' && route.artist || album.artist)) : undefined;
    setRecord(album); setArtist(person); setView(route.page);
    setBrowser(point.browser);
    if (route.page === 'library') setLibraryView(route.mode);
    pendingViewport.current = point.viewport;
    setSelection(point.selection);
    setLocationRevision(++locationEpoch.current);
  }
  function visit(route: Route, index = 0, source = capturePlace(), target?: Place) {
    restoring.current = false;
    const next = resolvePlace(target || { route, selection: index, browser: source.browser });
    history.visit(next, source);
    applyPlace(next);
  }
  function travel(direction: 'back' | 'forward') {
    const point = history.step(direction, capturePlace());
    if (!point) { setNotice(direction === 'back' ? 'At the beginning of navigation history' : 'At the end of navigation history'); return; }
    const next = resolvePlace(point);
    applyPlace(next);
    const route = next.route;
    setNotice(`${direction === 'back' ? 'Back' : 'Forward'} · ${route.page === 'queue' ? 'Now playing' : route.page === 'lyrics' ? 'Lyrics' : route.page === 'library' ? 'Library' : route.page === 'artist' ? route.name : albums.find(a => a.key === route.key)?.title || 'Album'}`);
  }
  function openAlbum(album: Album, track?: Track, source?: Place) {
    const origin = source || capturePlace();
    const place = browse?.album?.key === album.key ? browserTarget(origin, 'tracks', catalogue, track ? album.tracks.findIndex(t => t.uri === track.uri) : undefined)! : albumPlace(album, track, browse?.person || artist);
    visit(place.route, place.selection, origin, { ...place, browser: place.browser || origin.browser });
    setNotice(`${album.artist} · ${album.title}`);
  }
  function openTrack(track: Track) {
    const a = albums.find(a => a.key === albumKey(track));
    if (a) openAlbum(a, track);
  }
  function clearFocus() { focusSteps.cancel(); focusedButton = undefined; renderer.blur?.(); }
  function openArtist(name: string, source?: Place) {
    const found = artists.find(a => a.name === name);
    if (!found) return;
    const origin = source || capturePlace();
    const target = browse?.person?.name === name ? browserTarget(origin, 'albums', catalogue) : undefined;
    visit({ page: 'artist', name }, target?.selection || 0, origin, target); setNotice(name);
  }
  function sourceAt(index: number): Place {
    const point = capturePlace();
    return identifyPlace({ ...point, selection: index }, buffer);
  }
  function openPage(page: 'queue' | 'lyrics' | 'library', mode = libraryView) {
    const source = capturePlace();
    const target = page === 'library' && mode === 'artists' && browse ? browserTarget(source, 'artists', catalogue) : undefined;
    visit(page === 'library' ? { page, mode } : { page }, target?.selection || 0, source, target);
  }
  function goBack() {
    if (view === 'record' && record) openArtist(artist?.name || record.artist);
    else if (view === 'artist') openPage('library', 'artists');
    else if (view === 'library' || view === 'lyrics') openPage('queue');
  }
  function rememberPosition() {
    if (!saveReady.current || restoring.current || locationRevision !== locationEpoch.current) return;
    history.checkpoint(capturePlace(), false); navigationState.schedule();
  }
  // GPUIX 0.7.0 supplies ranges for programmatic jumps. Its wheel path needs
  // the wrapper's scroll event plus the already updated logical scroll anchor.
  function syncVisibleRows(event?: EventPayload) {
    const ref = albumGridRef;
    const top = ref.current && renderer.getListScrollTop?.(ref.current.id);
    const count = gridRows;
    const rowHeight = gridRowHeight;
    const first = event?.startIndex ?? top?.[0] ?? 0;
    const capacity = Math.ceil(((top?.[2] || height - 240) + (top?.[1] || 0)) / rowHeight) + 2;
    const start = Math.max(0, Math.min(Math.max(0, count - 1), first - 1));
    const end = Math.min(count, Math.max(event?.endIndex || 0, first + capacity) + 1);
    setGridWindow(previous => previous.key === gridKey && previous.start === start && previous.end === end ? previous : { key: gridKey, start, end });
    rememberPosition();
  }
  function openSort() {
    clearFocus();
    setSortIndex(Math.max(0, sortOptions.findIndex(option => option.value === order[orderContext])));
    setSortOpen(true);
  }
  function chooseSort(value: string) {
    pendingSort.current = capturePlace();
    setOrder(previous => ({ ...previous, [orderContext]: value }));
    setSortOpen(false); clearFocus();
  }
  function openPrompt(kind: 'global' | 'local') {
    focusSteps.cancel();
    focusedButton = undefined;
    promptReady.current = false;
    priorSelection.current = view === 'lyrics' ? lyrics.selectedLine : selection;
    priorLyricsFollow.current = lyrics.following;
    setQuery(''); setResultIndex(0); setPrompt(kind); updateDrag(undefined);
  }
  function closePrompt(cancel: boolean) {
    if (prompt === 'local' && cancel) {
      if (view === 'lyrics') { if (priorLyricsFollow.current) lyrics.follow(); else selectLyric(priorSelection.current); }
      else setSelection(priorSelection.current);
    }
    setPrompt(null);
    setNotice('hjkl / arrows navigate · / find here · : prompt');
  }
  function activateResult(result?: Result) {
    if (!result) return;
    if (result.kind === 'artist') openArtist(result.artist.name);
    else if (result.kind === 'album') openAlbum(result.album);
    else if (result.kind === 'track') openTrack(result.track);
    else {
      setPrompt(null);
      if (result.title === 'Play / pause') void act(() => backend.toggle());
      if (result.title === 'Next track') void act(() => backend.next());
      if (result.title === 'Previous track') void act(() => backend.previous());
      if (result.title === 'Open queue') openPage('queue');
      if (result.title === 'Open lyrics') openPage('lyrics');
      if (result.title === 'Open library') openPage('library');
      if (result.title === 'Reload library') void act(reloadLibrary, 'Library refreshed');
    }
  }
  function moveSelection(delta: number) {
    clearFocus();
    setSelection(i => Math.max(0, Math.min(buffer.length - 1, i + delta)));
  }
  function selectLyric(index: number, preserve = false) { clearFocus(); lyricPointer.current = preserve; lyrics.select(index); }
  function seekLyric() {
    const time = lyrics.lyrics?.lines[lyrics.selectedLine]?.time;
    if (time !== undefined && current && snapshot.state !== 'stop') void act(() => backend.seek(current.queueId, time));
  }
  function openSelection() {
    if (view === 'lyrics') return;
    if (browse) {
      const target = browse.active === 'artists' ? 'albums' : browse.active === 'albums' ? 'tracks' : undefined;
      if (target) focusColumn(target);
      return;
    }
    if (isGrid && shelf[selection]) openAlbum(shelf[selection]!);
    else if (isArtists && artists[selection]) openArtist(artists[selection]!.name);
    else if (selected) openTrack(selected);
  }
  function focusColumn(column: BrowserColumn, index?: number) {
    if (browse?.active === column && index !== undefined) { selectFromPointer(index); return; }
    const source = capturePlace();
    const target = browserTarget(source, column, catalogue, index);
    if (target) visit(target.route, target.selection, source, target);
  }
  function playSelected() {
    if (!selected) return;
    if (view === 'queue') void act(() => backend.play(snapshot.queue[selection]!.queueId));
    else void act(() => backend.enqueue(selected, true), `Playing ${selected.title}`);
  }
  function removeSelected() {
    const track = snapshot.queue[selection];
    if (track) { clearFocus(); void act(() => backend.remove(track.queueId), `Removed ${track.title} from the queue`); }
  }
  function seekTo(seconds: number) {
    if (!current || snapshot.state === 'stop' || !current.duration) return;
    const target = Math.max(0, Math.min(current.duration, seconds));
    void act(() => backend.seek(current.queueId, target), `Seek · ${duration(target)}`);
  }
  function seekAt(event: EventPayload) {
    // The pinned native renderer exposes measurements; React's narrower type omits them.
    const measurable = renderer as typeof renderer & Partial<Pick<GpuixRenderer, 'getElementBounds'>>;
    const bounds = progressRef.current && measurable.getElementBounds?.(progressRef.current.id);
    if (bounds && bounds[2] > 0 && event.x !== undefined) seekTo((event.x - bounds[0]) / bounds[2] * (current?.duration || 0));
  }
  function drop() {
    const d = activeDrag.current;
    if (!d) return;
    const source = snapshot.queue.findIndex(t => t.queueId === d.id);
    const before = d.target > source ? snapshot.queue[d.target + 1]?.queueId ?? null : snapshot.queue[d.target]?.queueId ?? null;
    updateDrag(undefined);
    if (d.target !== source) void act(() => backend.move(d.id, before), 'Queue order updated');
    setSelection(d.target, d.startY === undefined ? 'reveal' : 'preserve');
  }
  useLayoutEffect(() => {
    dispatchKey = event => {
      const key = event.keyChar || event.key || '';
      if (sortOpen) {
        if (event.key === 'escape') { setSortOpen(false); clearFocus(); }
        else if (event.key === 'down' || key === 'j') setSortIndex(i => (i + 1) % sortOptions.length);
        else if (event.key === 'up' || key === 'k') setSortIndex(i => (i - 1 + sortOptions.length) % sortOptions.length);
        else if (event.key === 'enter' && sortOptions[sortIndex]) chooseSort(sortOptions[sortIndex]!.value);
        return;
      }
      const page = pageShortcut(event);
      if (page) { openPage(page); return; }
      if (event.modifiers?.cmd || event.modifiers?.ctrl || event.modifiers?.alt) return;
      const direction = directionOf(event);
      if (prompt) {
        // The native input takes a frame to focus. Keep letters typed in that gap.
        if (!promptReady.current) {
          if (event.key === 'backspace') setQuery(value => Array.from(value).slice(0, -1).join(''));
          else if (event.key === 'space' || Array.from(key).length === 1) setQuery(value => value + (event.key === 'space' ? ' ' : key));
        }
        if (event.key === 'escape') closePrompt(true);
        if (event.key === 'down' || event.key === 'up') {
          const delta = event.key === 'down' ? 1 : -1;
          if (prompt === 'global') setResultIndex(i => Math.max(0, Math.min(results.length - 1, i + delta)));
          else if (matches.length) {
            const at = matches.indexOf(view === 'lyrics' ? lyrics.selectedLine : selection);
            const next = matches[(at + delta + matches.length) % matches.length]!;
            if (view === 'lyrics') selectLyric(next); else setSelection(next);
          }
        }
        return;
      }
      if (activeDrag.current) {
        if (event.key === 'escape') updateDrag(undefined);
        if (event.key === 'enter' || event.key === 'space') drop();
        if (direction) {
          const d = activeDrag.current;
          if (d) updateDrag({ ...d, startY: undefined, target: Math.max(0, Math.min(snapshot.queue.length - 1, d.target + (direction === 'down' || direction === 'right' ? 1 : -1))) });
        }
        return;
      }
      if (key === ':') openPrompt('global');
      else if (key === '/') openPrompt('local');
      else if (key === 'o' || key === 'O') travel('back');
      else if (key === 'i' || key === 'I') travel('forward');
      else if (key === 'f' && view === 'lyrics') lyrics.follow();
      else if (key === 'r' && view === 'lyrics') lyrics.reload();
      else if (direction) {
        if (isGrid) { clearFocus(); setSelection(gridSelection(selection, direction, columns, buffer.length)); }
        else if (view === 'lyrics' && (direction === 'up' || direction === 'down')) selectLyric(lyrics.selectedLine + (direction === 'down' ? 1 : -1));
        else if (direction === 'up' || direction === 'down') moveSelection(direction === 'down' ? 1 : -1);
        else if (direction === 'left') goBack();
        else openSelection();
      }
      else if (event.key === 'enter') { if (focusSteps.pending) focusSteps.enqueue('activate'); else if (focusedButton) focusedButton.activate(); else if (view === 'lyrics') seekLyric(); else if (isGrid || isArtists || view === 'artist') openSelection(); else playSelected(); }
      else if (event.key === 'space') void act(() => backend.toggle());
      else if (key === '[' || key === ']') seekTo(elapsed + (key === '[' ? -10 : 10));
      else if ((event.key === 'backspace' || event.key === 'delete') && view === 'queue') removeSelected();
      else if (event.key === 'escape') goBack();
      else if (key === 's' && (view === 'library' || view === 'artist')) openSort();
      else if (key === 'm' && view === 'queue' && selected) { clearFocus(); updateDrag({ id: snapshot.queue[selection]!.queueId, target: selection, dy: 0 }); }
      else if (event.key === 'tab') focusSteps.enqueue(event.modifiers?.shift ? 'previous' : 'next');
    };
    return () => { dispatchKey = () => {}; };
  });

  function positionDrag(event: EventPayload) {
    const d = activeDrag.current;
    if (!d || d.startY === undefined) return;
    const source = snapshot.queue.findIndex(t => t.queueId === d.id);
    const dy = (event.y ?? d.startY) - d.startY;
    const { target, offset } = pointerDrag(source, dy, ROW, snapshot.queue.length);
    // GPUI can replay the stationary pointer after a frame; avoid repaint loops.
    if (target !== d.target || offset !== d.dy) updateDrag({ ...d, dy: offset, target });
  }

  function queueRow(track: QueueTrack, index: number) {
    const held = drag?.id === track.queueId;
    const destination = !!drag && drag.target === index && !held;
    const pair = pairForState(theme, { selected: selection === index, active: snapshot.currentId === track.queueId });
    return <ThemePairProvider key={track.queueId} pair={pair}><div testId={`queue-${track.queueId}`} onClick={() => selectFromPointer(index)} style={{ width: '100%', height: ROW, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 8, paddingRight: 10, borderBottomWidth: destination ? 2 : 1, borderColor: destination ? pair.marker : pair.border, background: pair.background, hover: { borderColor: pair.marker }, opacity: held ? theme.opacity.heldSource : 1, userSelect: 'none' }}>
      <div testId={`handle-${track.queueId}`} onMouseDown={e => { if (e.button === 0) flushSync(() => { selectFromPointer(index); updateDrag({ id: track.queueId, target: index, startY: e.y ?? 0, dy: 0 }); }); }} style={{ width: 18, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}><Text tone={'muted'}>⠿</Text></div>
      <Text size={11} tone={snapshot.currentId === track.queueId ? 'accent' : 'muted'} style={{ width: 18 }}>{snapshot.currentId === track.queueId ? '▸' : String(track.number).padStart(2, '0')}</Text>
      <Cover track={track} size={44} onClick={() => openTrack(track)} />
      <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Text onClick={() => selectFromPointer(index)} style={{ cursor: 'pointer' }}>{track.title}</Text>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 5, minWidth: 0 }}>
          <Link muted size={11} onClick={() => openArtist(track.artist)} style={{ flexShrink: 1 }}>{track.artist}</Link>
          <Text size={11} tone={'muted'}>·</Text>
          <Link muted size={11} onClick={() => openTrack(track)} style={{ flexShrink: 1 }}>{track.album}</Link>
        </div>
      </div>
      <Text tone={'muted'} size={12}>{duration(track.duration)}</Text>
    </div></ThemePairProvider>;
  }

  const scrollAnchor = queueRef.current ? renderer.getListScrollTop?.(queueRef.current.id) : undefined;
  const sourceIndex = drag ? snapshot.queue.findIndex(t => t.queueId === drag.id) : 0;
  const previewIndex = drag?.startY !== undefined ? sourceIndex : drag?.target || 0;
  const dragTop = 40 + (previewIndex - (scrollAnchor?.[0] || 0)) * ROW - (scrollAnchor?.[1] || 0) + (drag?.startY !== undefined ? drag.dy : 0);
  const previewTop = Math.max(40, Math.min(height - 240, dragTop));
  const heldTrack = snapshot.queue.find(t => t.queueId === drag?.id);
  const heldPair = pairForState(theme, { selected: selection === sourceIndex, active: heldTrack?.queueId === snapshot.currentId });
  const heldStyle: StyleDesc = { position: 'absolute', left: 0, right: 0, height: ROW, padding: 12, background: heldPair.background, borderWidth: 1, borderColor: heldPair.marker, pointerEvents: 'none', display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center' };
  const heldContent = <ThemePairProvider pair={heldPair}><Cover track={heldTrack} size={42} />{heldTrack?.queueId === snapshot.currentId && <Text tone={'accent'}>▸</Text>}<Text style={{ flexGrow: 1 }}>{heldTrack?.title}</Text><Text tone={'accent'}>→ {(drag?.target || 0) + 1}</Text></ThemePairProvider>;
  const browserListProps = { revision: locationRevision, preserve: selectionScroll.current === 'preserve', width, height, onScroll: rememberPosition };
  function browserRowStyle(column: BrowserColumn, index: number, rowHeight: number): StyleDesc {
    const chosen = browse?.[column].selection === index;
    const pair = browserRowPair(column, index);
    return { width: '100%', height: rowHeight, flexShrink: 0, padding: 9, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10,
      background: pair.background, hover: { borderColor: pair.border }, borderLeftWidth: 2,
      borderColor: chosen ? pair.marker : 'transparent', cursor: 'pointer' };
  }
  function browserRowPair(column: BrowserColumn, index: number) {
    const chosen = browse?.[column].selection === index;
    return pairForState(theme, { selected: chosen && browse?.active === column, context: chosen && browse?.active !== column });
  }
  function columnHeading(column: BrowserColumn, title: string, count: number) {
    return <div onClick={() => focusColumn(column)} style={{ height: 32, flexShrink: 0, borderBottomWidth: 1, borderColor: browse?.active === column ? theme.borders.browserActive : theme.borders.browserColumn, display: 'flex', flexDirection: 'row', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
      <Text size={11} tone={browse?.active === column ? 'accent' : 'muted'} style={{ flexGrow: 1 }}>{title}</Text><Text size={11} tone={'muted'}>{count}</Text>
    </div>;
  }
  const lyricsView = view === 'lyrics' && <div style={{ width: '100%', minHeight: 0, ...surface(theme, 'lyrics'), display: 'flex', flexDirection: 'column', gap: 18 }}>
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'row', gap: 18, alignItems: 'center' }}>
      <Cover track={current} size={narrow ? 72 : 96} onClick={current ? () => openTrack(current) : undefined} />
      <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Text size={18}>{current?.title || 'Nothing playing'}</Text>
        {current && <><Link onClick={() => openArtist(current.artist)}>{current.artist}</Link><Link muted onClick={() => openTrack(current)}>{current.album}</Link></>}
      </div>
      {lyrics.lyrics?.synced && <Button active={lyrics.following} onClick={() => lyrics.follow()}>{lyrics.following ? 'Following' : 'Follow playback'}</Button>}
      <Button onClick={() => lyrics.reload()}>Reload</Button>
    </div>
    {lyrics.loading ? <Text tone={'muted'}>Reading local lyrics…</Text> : lyrics.error ? <Text tone={'warning'}>{lyrics.error}</Text> : lyrics.lyrics ? <>
      <div style={{ flexGrow: 1, minHeight: 0, width: lyricWidth, alignSelf: 'center', display: 'flex', flexDirection: 'column' }}>
        <BrowserList key={current?.uri} listRef={lyricRef} point={{ route: { page: 'lyrics' }, selection: lyricSelection }} count={lyricLines.length} rowHeight={42}
          revision={locationRevision} preserve={!lyrics.following && lyricPointer.current} align={lyrics.following ? 'middle' : 'edge'} width={width} height={height - (prompt === 'local' ? 56 : 0)}
          onScroll={() => {}} onWheel={() => { lyricPointer.current = true; lyrics.read(); }} row={index => {
            const row = lyricLines[index]!, active = row.line === lyrics.activeLine, chosen = row.line === lyrics.selectedLine;
            const pair = pairForState(theme, { selected: chosen && !lyrics.following, active });
            return <ThemePairProvider key={index} pair={pair}><div onClick={() => selectLyric(row.line, true)} style={{ height: 42, width: '100%', paddingLeft: 18, paddingRight: 18, display: 'flex', alignItems: 'center',
              background: pair.background, borderLeftWidth: 2, borderColor: active ? pair.marker : 'transparent', cursor: 'pointer' }}>
              <Text size={18} style={{ flexGrow: 1 }}>{row.text || '· · ·'}</Text>
            </div></ThemePairProvider>;
          }} />
      </div>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'row', gap: 12 }}>
        <Text size={11} tone={'muted'} style={{ flexGrow: 1 }}>{lyrics.lyrics.synced ? `${lyrics.following ? 'Following playback' : 'Reading'} · ${snapshot.state === 'pause' ? 'paused' : connection === 'down' ? 'disconnected' : 'synced lyrics'}` : 'Untimed lyrics'}</Text>
        <Text size={11} tone={'muted'}>{lyrics.lyrics.synced ? 'j/k read · enter seek · f follow · / find · r reload' : 'j/k read · / find · r reload'}</Text>
      </div>
    </> : <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <Text size={17}>{current ? 'No local lyrics found' : 'Choose a track to see its lyrics'}</Text>
      {current && <Text tone={'muted'}>Reload after adding or updating this track’s lyric file.</Text>}
    </div>}
  </div>;
  const browserView = browse && <div style={{ width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Button onClick={() => openPage('library', 'covers')}>Albums</Button>
      <Button active onClick={() => openPage('library', 'artists')}>Artists</Button>
      <div style={{ flexGrow: 1 }} />
      <Text size={11} tone={'muted'}>{browse.active === 'artists' ? 'Choose an artist' : browse.active === 'albums' ? 'Choose an album' : 'Choose a track'}</Text>
      {view !== 'record' && <Button id="library-sort" onClick={openSort}>{sortLabel} ▾</Button>}
    </div>
    <div style={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'row', gap: narrow ? 12 : 18 }}>
      <div style={{ width: Math.max(145, Math.floor(width * .20)), flexShrink: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {columnHeading('artists', 'ARTISTS', artists.length)}
        <BrowserList {...browserListProps} listRef={browserArtistRef} point={browse.artists} count={artists.length} rowHeight={52} row={index => {
          const person = artists[index]!;
          return <ThemePairProvider key={person.name} pair={browserRowPair('artists', index)}><div onClick={() => focusColumn('artists', index)} style={browserRowStyle('artists', index, 52)}>
            <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}><Text size={12}>{person.name}</Text><Text size={10} tone={'muted'}>{person.albums.length} {person.albums.length === 1 ? 'album' : 'albums'}</Text></div>
          </div></ThemePairProvider>;
        }} />
      </div>
      <div style={{ width: Math.floor(width * .25), flexShrink: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {columnHeading('albums', 'ALBUMS', browse.person?.albums.length || 0)}
        <BrowserList key={browse.person?.name || 'empty-albums'} {...browserListProps} listRef={browserAlbumRef} point={browse.albums} count={browse.person?.albums.length || 0} rowHeight={64} row={index => {
          const album = browse.person!.albums[index]!;
          return <ThemePairProvider key={album.key} pair={browserRowPair('albums', index)}><div onClick={() => focusColumn('albums', index)} style={browserRowStyle('albums', index, 64)}>
            <Cover track={album.tracks[0]} size={42} />
            <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><Text size={12}>{album.title}</Text><Text size={10} tone={'muted'}>{[album.year, `${album.tracks.length} tracks`].filter(Boolean).join(' · ')}</Text></div>
          </div></ThemePairProvider>;
        }} />
        {browse.album && <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <Button id="play-album" onClick={() => void act(() => backend.enqueueAlbum(browse.album!, true), `Playing ${browse.album!.title}`)}>Play album</Button>
          <Button id="queue-album" onClick={() => void act(() => backend.enqueueAlbum(browse.album!), `Queued ${browse.album!.title}`)}>Queue album</Button>
        </div>}
      </div>
      <div style={{ flexGrow: 1, flexBasis: 0, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {columnHeading('tracks', 'TRACKS', browse.album?.tracks.length || 0)}
        {browse.album && <div style={{ height: 96, flexShrink: 0, display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Cover track={browse.track} size={narrow ? 76 : 96} />
          <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Text size={14}>{browse.active === 'tracks' ? browse.track?.title : browse.album.title}</Text>
            <Text size={11} tone={'muted'}>{browse.track?.artist || browse.person?.name}</Text>
            {browse.active === 'tracks' && <Text size={11} tone={'muted'}>{browse.album.title}</Text>}
            <Text size={10} tone={'muted'}>{browse.active === 'tracks' ? `Track ${browse.track?.number || browse.tracks.selection + 1} · ${duration(browse.track?.duration || 0)}` : `${browse.album.year} · ${duration(browse.album.tracks.reduce((total, track) => total + track.duration, 0))}`}</Text>
          </div>
        </div>}
        <BrowserList key={browse.album?.key || 'empty-tracks'} {...browserListProps} listRef={browserTrackRef} point={browse.tracks} count={browse.album?.tracks.length || 0} rowHeight={52} row={index => {
          const track = browse.album!.tracks[index]!;
          return <ThemePairProvider key={track.uri} pair={browserRowPair('tracks', index)}><div onClick={() => focusColumn('tracks', index)} style={browserRowStyle('tracks', index, 52)}>
            <Text size={11} tone={'muted'} style={{ width: 28, flexShrink: 0 }}>{track.disc && track.disc > 1 ? `${track.disc}.${track.number}` : String(track.number).padStart(2, '0')}</Text>
            <Text size={12} style={{ flexGrow: 1, flexBasis: 0 }}>{track.title}</Text><Text size={11} tone={'muted'} style={{ width: 42, flexShrink: 0, textAlign: 'right' }}>{duration(track.duration)}</Text>
          </div></ThemePairProvider>;
        }} />
        {browse.track && <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <Button onClick={() => void act(() => backend.enqueue(browse.track!, true), `Playing ${browse.track!.title}`)}>Play track</Button>
          <Button onClick={() => void act(() => backend.enqueue(browse.track!), `Queued ${browse.track!.title}`)}>Queue track</Button>
        </div>}
      </div>
    </div>
    <Text size={11} tone={'muted'}>j/k select · h/l columns · enter {browse.active === 'tracks' ? 'play' : 'open'} · / find in column · o/i history</Text>
  </div>;

  return <div testId="music-root" style={{ width: '100%', height: '100%', ...surface(theme, 'canvas'), selectionColor: C.textSelection, display: 'flex', flexDirection: 'column', position: 'relative' }}>
    <div style={{ height: 56, flexShrink: 0, paddingLeft: process.platform === 'darwin' ? 94 : 22, paddingRight: 18, ...surface(theme, 'header'), borderBottomWidth: 1, borderColor: theme.borders.header, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, userSelect: 'none' }}>
      <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'row', gap: 6 }}>
        <Button tab active={view === 'queue'} onClick={() => openPage('queue')} id="view-queue">Now playing</Button>
        <Button tab active={view === 'lyrics'} onClick={() => openPage('lyrics')} id="view-lyrics">Lyrics</Button>
        <Button tab active={view === 'library'} onClick={() => openPage('library')} id="view-library">Library</Button>
        {(view === 'artist' || view === 'record') && artist && <Button tab active={view === 'artist'} id="view-artist" style={{ minWidth: 0, maxWidth: narrow ? 110 : 220 }} onClick={() => openArtist(artist.name)}>{artist.name}</Button>}
        {view === 'record' && record && <Button tab active id="view-record" style={{ minWidth: 0, maxWidth: narrow ? 110 : 220 }} onClick={() => openAlbum(record)}>{record.title}</Button>}
      </div>
      <Button id="open-prompt" onClick={() => openPrompt('global')}>Prompt :</Button>
    </div>

    <div onScroll={rememberPosition} style={{ flexGrow: 1, minHeight: 0, padding: 22, ...surface(theme, 'main'), display: 'flex', flexDirection: 'row', gap: 26 }}>
      {lyricsView || browserView || (isGrid ? <div onScroll={() => syncVisibleRows()} style={{ width: '100%', minHeight: 0, ...surface(theme, 'library'), display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Button active onClick={() => openPage('library', 'covers')}>Albums</Button>
          <Button onClick={() => openPage('library', 'artists')}>Artists</Button>
          <div style={{ flexGrow: 1 }} /><Text tone={'muted'}>{albums.length} albums</Text>
          <Button id="library-sort" onClick={openSort}>{sortLabel} ▾</Button>
        </div>
        <virtual-list ref={albumGridRef} itemCount={gridRows} windowStart={gridRange.start} estimatedItemHeight={gridRowHeight} onVisibleRange={event => syncVisibleRows(event)} style={{ width: '100%', flexGrow: 1, minHeight: 0 }}>
          {Array.from({ length: Math.max(0, Math.min(gridRows, gridRange.end) - gridRange.start) }, (_, localRow) => {
            const row = gridRange.start + localRow;
            return <div key={`${gridKey}:${row}`} style={{ width: '100%', height: gridRowHeight, paddingBottom: 20, display: 'flex', flexDirection: 'row', gap: 20 }}>
              {shelf.slice(row * columns, (row + 1) * columns).map((a, column) => {
                const index = row * columns + column;
                const pair = pairForState(theme, { selected: selection === index });
                return <ThemePairProvider key={a.key} pair={pair}><div onClick={() => openAlbum(a, undefined, sourceAt(index))} style={{ width: albumTileSize, height: albumTileSize + 58, display: 'flex', flexDirection: 'column', gap: 9, cursor: 'pointer', background: pair.background, borderBottomWidth: 1, borderColor: 'transparent', hover: { borderColor: pair.marker } }}>
                  <Cover track={a.tracks[0]} size={albumTileSize} />
                  <Text style={{ height: 22, flexShrink: 0 }}>{a.title}</Text>
                  <div style={{ height: 18, flexShrink: 0, display: 'flex', flexDirection: 'row', gap: 6 }}><Link muted size={11} onClick={() => openArtist(a.artist)}>{a.artist}</Link><Text size={11} tone={'muted'}>{a.year}</Text></div>
                </div></ThemePairProvider>;
              })}
            </div>;
          })}
        </virtual-list>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text size={11} tone={'muted'}>hjkl / arrows select · enter open · / find · o/i history</Text>
        </div>
      </div> : <>
        <div style={{ flexGrow: 1, minWidth: 0, minHeight: 0, ...surface(theme, 'queue'), display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          <div style={{ height: 24, flexShrink: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text size={17} style={{ flexGrow: 1 }}>Queue</Text>
            <Text size={11} tone={'muted'}>{buffer.length} tracks</Text>
            {snapshot.queue.length > 0 && <Button id="remove-track" onClick={removeSelected}>Remove</Button>}
          </div>
          <virtual-list ref={queueRef} estimatedItemHeight={ROW} style={{ width: '100%', flexGrow: 1, minHeight: 0 }}>{snapshot.queue.map(queueRow)}</virtual-list>
          {loading && <Text tone={'muted'}>Reading the library…</Text>}
          {!loading && buffer.length === 0 && <Text tone={'muted'}>Queue is empty. Find an album with :</Text>}
          <div style={{ display: 'flex', flexDirection: 'row' }}><Text size={11} tone={'muted'} style={{ flexGrow: 1 }}>{drag ? 'hjkl / arrows move · enter drop · esc cancel' : 'enter play · m move · ⌫ remove · o/i history'}</Text><Text size={11} tone={'muted'}>{duration(buffer.reduce((n, t) => n + t.duration, 0))} total</Text></div>
          {drag && (drag.startY !== undefined ? <div style={{ ...heldStyle, top: previewTop }}>{heldContent}</div> : <motion.div initial={false} animate={{ top: previewTop }} transition={{ duration: 0.10, ease: 'easeOut' }} style={heldStyle}>{heldContent}</motion.div>)}
        </div>
        <div style={{ width: artSize + 24, minWidth: 0, ...surface(theme, 'detail'), borderLeftWidth: 1, borderColor: theme.borders.detail, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Text size={11} tone={'muted'}>{view === 'queue' && current ? 'NOW PLAYING' : 'SELECTION'}</Text>
          <Cover track={shown} size={artSize} onClick={() => shown && openTrack(shown)} />
          {shown ? <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link size={18} onClick={() => openTrack(shown)}>{shown.title}</Link>
              <Link onClick={() => openArtist(shown.artist)}>{shown.artist}</Link>
              <Link muted onClick={() => openTrack(shown)}>{shown.album}</Link>
            </div>
            {!narrow && artSize >= 280 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}><Text size={11} tone={'muted'}>{shown.year}</Text><Text size={11} tone={'muted'}>Track {shown.number}</Text></div>}
          </div> : <Text tone={'muted'}>Nothing playing</Text>}

        </div>
      </>)}
    </div>

    <div style={{ padding: 15, borderTopWidth: 1, borderColor: theme.borders.transport, ...surface(theme, 'transport'), display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'center' }}>
      <Cover track={current} size={38} />
      <div style={{ width: narrow ? 140 : 220, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}><Text size={12}>{current?.title || 'Stopped'}</Text>{current ? <Link muted size={11} onClick={() => openArtist(current.artist)}>{current.artist}</Link> : <Text size={11} tone={'muted'}>MPD</Text>}</div>
      <Button id="previous" onClick={() => void act(() => backend.previous())}>|‹</Button>
      <Button id="toggle" active onClick={() => void act(() => backend.toggle())}>{snapshot.state === 'play' ? 'Pause' : 'Play'}</Button>
      <Button id="next" onClick={() => void act(() => backend.next())}>›|</Button>
      <Text size={11} tone={'muted'}>{duration(elapsed)}</Text>
      <div ref={progressRef} testId="seek" onClick={seekAt} style={{ flexGrow: 1, minWidth: 30, height: 24, display: 'flex', justifyContent: 'center', flexDirection: 'column', cursor: current && snapshot.state !== 'stop' ? 'pointer' : 'default' }}>
        <div style={{ width: '100%', height: 4, ...surface(theme, 'progressTrack'), borderWidth: 1, borderColor: theme.pairs.normal.border, pointerEvents: 'none' }}><div style={{ width: `${Math.min(100, elapsed / (current?.duration || 1) * 100)}%`, height: '100%', ...surface(theme, 'progressFill'), pointerEvents: 'none' }} /></div>
      </div>
      <Text size={11} tone={'muted'}>{duration(current?.duration || 0)}</Text>
    </div>
    {prompt === 'local' && <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, ...surface(theme, 'localFind') }}><Text tone={'accent'} style={{ width: 14, flexShrink: 0 }}>/</Text><ThemedInput testId="local-find-input" autoFocus value={query} placeholder={`Find in ${browse?.active || (isGrid ? 'albums' : view)}`} onFocus={() => { promptReady.current = true; }} onChange={e => { promptReady.current = true; setQuery(e.value || ''); }} onSubmit={() => flushSync(() => closePrompt(false))} style={{ flexGrow: 1, flexBasis: 0, minWidth: 0, height: 28, ...surface(theme, 'localFindInput'), selectionColor: C.textSelection, color: C.text, fontSize: 14, fontFamily: FONT }} /><Text tone={'muted'} style={{ flexShrink: 0 }}>{matches.length} matches</Text><Button onClick={() => closePrompt(true)}>esc</Button></div>}
    <div style={{ height: 32, paddingLeft: 18, paddingRight: 18, ...surface(theme, 'status'), display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text size={11} tone={error || stateError || navigationLog.error ? 'warning' : 'muted'} style={{ flexGrow: 1 }}>{stateError || (navigationLog.error ? `Navigation log: ${navigationLog.error}` : error ? `${demo ? 'Demo' : 'MPD'}: ${error}` : restoring.current ? 'Restoring your place…' : notice)}</Text><Text size={11} tone={'muted'}>{demo ? 'Demo · simulated' : connection === 'connected' ? 'MPD connected' : connection === 'down' ? 'MPD down' : 'MPD connecting'} · {library.length.toLocaleString()} songs</Text></div>

    {drag && drag.startY !== undefined && <div
      onMouseMove={event => flushSync(() => { if (event.pressedButton === 0) positionDrag(event); else updateDrag(undefined); })}
      onMouseUp={event => { if (event.button === 0) flushSync(() => { positionDrag(event); drop(); }); }}
      onMouseLeave={() => updateDrag(undefined)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto', cursor: 'grabbing', userSelect: 'none' }}
    />}

    {sortOpen && <div onClick={() => { setSortOpen(false); clearFocus(); }} style={{ position: 'absolute', top: 56, bottom: 0, left: 0, right: 0, pointerEvents: 'auto' }}>
      <div style={{ position: 'absolute', top: 72, right: 22, width: 260, padding: 6, display: 'flex', flexDirection: 'column', ...surface(theme, 'sortMenu'), borderWidth: 1, borderColor: theme.borders.sortMenu, borderRadius: 3 }}>
        {sortOptions.map((option, index) => <Button key={option.value} onClick={() => chooseSort(option.value)} pair={index === sortIndex ? theme.pairs.selected : theme.pairs.normal}>{option.label}{order[orderContext] === option.value ? ' ✓' : ''}</Button>)}
      </div>
    </div>}
    {prompt === 'global' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, ...surface(theme, 'promptScrim'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div testId="prompt" onMouseDownOutside={() => closePrompt(true)} style={{ width: Math.min(680, width - 80), ...surface(theme, 'prompt'), borderWidth: 1, borderColor: theme.borders.prompt, borderRadius: 6, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text tone={'accent'}>:</Text><ThemedInput testId="prompt-input" autoFocus value={query} placeholder="Find an album, track, artist or action" onFocus={() => { promptReady.current = true; }} onChange={e => { promptReady.current = true; setQuery(e.value || ''); setResultIndex(0); }} onSubmit={() => flushSync(() => activateResult(results[resultIndex]))} style={{ height: 36, flexGrow: 1, ...surface(theme, 'promptInput'), selectionColor: C.textSelection, color: C.text, fontSize: 16, fontFamily: FONT }} /><Button onClick={() => closePrompt(true)}>esc</Button></div>
        <div style={{ height: 1, background: theme.borders.promptDivider }} />
        {results.length > 0 && <virtual-list ref={promptListRef} estimatedItemHeight={69} style={{ width: '100%', height: Math.min(height - 180, results.length * 69 + 13), flexShrink: 0, ...surface(theme, 'promptResults') }}>{results.map((result, i) => {
          const t = result.kind === 'track' ? result.track : result.kind === 'album' ? result.album.tracks[0] : result.kind === 'artist' ? result.artist.albums[0]?.tracks[0] : undefined;
          const title = result.kind === 'track' ? result.track.title : result.kind === 'album' ? result.album.title : result.kind === 'artist' ? result.artist.name : result.title;
          const detail = result.kind === 'track' ? `${result.track.artist} · ${result.track.album}` : result.kind === 'album' ? `${result.album.artist} · ${result.album.year} · ${result.album.tracks.length} tracks` : result.kind === 'artist' ? `${result.artist.albums.length} albums in your library` : 'Action';
          const pair = pairForState(theme, { selected: i === resultIndex });
          return <ThemePairProvider key={result.key} pair={pair}><div style={{ width: '100%', height: i === resultIndex ? 82 : 69, paddingBottom: 12 }}><div testId={`result-${i}`} onClick={() => activateResult(result)} style={{ width: '100%', height: i === resultIndex ? 70 : 57, padding: 8, borderRadius: 3, background: pair.background, borderWidth: 1, borderColor: 'transparent', hover: { borderColor: pair.marker }, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            {t ? <Cover track={t} size={i === resultIndex ? 50 : 38} /> : <Text tone={'muted'} style={{ width: 38 }}>⌘</Text>}
            <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><Text>{title}</Text><Text size={11} tone={'muted'}>{detail}</Text></div><Text size={11} tone={'accent'}>{result.kind}</Text>
          </div></div></ThemePairProvider>;
        })}</virtual-list>}
        {results.length === 0 && <Text tone={'muted'}>No matches</Text>}
        <Text size={11} tone={'muted'}>↑↓ choose · enter open · esc return</Text>
      </div>
    </div>}
  </div>;
}

render(<ThemeProvider session={session}><App /></ThemeProvider>, { title: demo ? 'Music — Demo' : 'Music — MPD UI Prototype', appName: 'Music Prototype', width: 1120, height: 820, minWidth: 720, minHeight: 620, titlebarTransparent: true, trafficLightX: 16, trafficLightY: 20, focus: process.env.GPUIX_BACKGROUND !== '1', onKeyDown: event => flushSync(() => dispatchKey(event)), onEvent: nativeProbeObserver(probe) });
