import { Children, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type SetStateAction } from 'react';
import { flushSync, motion, render, useGpuixRequired, useWindowSize, type EventPayload, type PublicInstance, type StyleDesc } from '@gpuix/react';
import type { GpuixRenderer } from '@gpuix/native';
import { DemoBackend } from './demo';
import { MpdBackend } from './mpd';
import { FocusSteps } from './focus';
import { albumsOf, artistsOf, albumKey, duration, fuzzyScore, searchLibrary, type Album, type Artist, type MusicBackend, type QueueTrack, type Result, type Track } from './model';
import { directionOf, gridSelection, pageShortcut, pointerDrag } from './navigation';
import { inputTheme, surface, theme } from './theme';
import { NavigationHistory, type Place, type Route, type Viewport } from './history';
import { NavigationLog } from './navigation-log';
import { MusicSession, useMusic } from './music-session';
import { albumPlace, placeKey, resolvePlace as resolveLocation } from './locations';
import { albumOrders, artistOrders, defaultOrder, orderAlbums, orderArtists, type LibraryOrder } from './library-order';

const C = theme.colors;
const FONT = 'Menlo';
const ROW = 68;
type QueueDrag = { id: number; target: number; startY?: number; dy: number };
let dispatchKey: (event: EventPayload) => void = () => {};
let focusedButton: { token: object; activate: () => void } | undefined;
let didFocusControl: () => void = () => {};
const demo = process.argv.includes('--demo');
const backend: MusicBackend = demo ? new DemoBackend() : new MpdBackend();
const navigationLog = new NavigationLog(demo ? 'demo' : 'mpd');
const session = new MusicSession(backend);
// GPUIX exits on window close; signals must also release the owned MPD helper.
process.once('SIGTERM', () => process.exit(0));
process.once('SIGINT', () => process.exit(0));

function Text({ children, size = 13, color = C.text, style = {}, onClick }: { children: ReactNode; size?: number; color?: string; style?: StyleDesc; onClick?: () => void }) {
  // GPUIX lays out separate primitive children as separate native text nodes.
  return <text onClick={onClick} style={{ fontFamily: FONT, fontSize: size, color, whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0, ...style }}>{Children.toArray(children).join('')}</text>;
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
function Button({ children, onClick, active = false, id, style = {}, tab = false }: { children: ReactNode; onClick: () => void; active?: boolean; id?: string; style?: StyleDesc; tab?: boolean }) {
  const { focused, ...focusProps } = useControlFocus(onClick);
  return <div testId={id} tabIndex={0} onClick={onClick} {...focusProps} style={{ paddingTop: 7, paddingBottom: 7, paddingLeft: 11, paddingRight: 11, borderWidth: 1, borderColor: focused ? theme.borders.focus : theme.borders.control, borderRadius: 3, cursor: 'pointer', ...surface(tab ? active ? 'tabActive' : 'tab' : active ? 'controlActive' : 'control'), hover: surface(tab ? 'tabHover' : 'controlHover'), userSelect: 'none', ...style }}><Text color={active ? C.controlActive : C.control}>{children}</Text></div>;
}
function Link({ children, onClick, muted = false, size = 13, style = {} }: { children: string; onClick: () => void; muted?: boolean; size?: number; style?: StyleDesc }) {
  const { focused, ...focusProps } = useControlFocus(onClick);
  return <text tabIndex={0} onClick={onClick} {...focusProps} style={{ fontFamily: FONT, fontSize: size, color: focused ? C.linkHover : muted ? C.linkMuted : C.link, borderBottomWidth: 1, borderColor: focused ? theme.borders.focus : theme.borders.control, cursor: 'pointer', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0, hover: { color: C.linkHover }, userSelect: 'none', ...style }}>{children}</text>;
}

function Cover({ track, size, onClick }: { track?: Track; size: number; onClick?: () => void }) {
  const [source, setSource] = useState(track?.art);
  useEffect(() => {
    let cancelled = false;
    setSource(track?.art);
    if (track) void backend.artwork(track).then(art => { if (!cancelled) setSource(art); });
    return () => { cancelled = true; };
  }, [track?.uri]);
  return <div onClick={onClick} style={{ width: size, height: size, flexShrink: 0, ...surface('coverPlaceholder'), pointerEvents: onClick ? 'auto' : 'none', cursor: onClick ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {source ? <img src={source} objectFit="contain" style={{ width: size, height: size }} /> : <Text size={Math.min(40, size / 2)} color={C.placeholder}>♪</Text>}
  </div>;
}

function App() {
  const renderer = useGpuixRequired();
  const focusSteps = useMemo(() => new FocusSteps(
    direction => direction === 'next' ? renderer.focusNext?.() : renderer.focusPrevious?.(),
    () => focusedButton?.activate(),
  ), [renderer]);
  useLayoutEffect(() => {
    didFocusControl = () => focusSteps.didFocus();
    return () => { didFocusControl = () => {}; focusSteps.cancel(); };
  }, [focusSteps]);
  const { width, height } = useWindowSize();
  const { library, snapshot, loading, connection, notice, problem, actionProblem, playClock, act, reloadLibrary, setNotice } = useMusic(session);
  const [view, setView] = useState<'queue' | 'library' | 'artist' | 'record'>('queue');
  const [order, setOrder] = useState<LibraryOrder>(defaultOrder);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortIndex, setSortIndex] = useState(0);
  const pendingSort = useRef<Place | undefined>(undefined);
  const [gridWindow, setGridWindow] = useState({ key: '', start: 0, end: 6 });
  const [artistWindow, setArtistWindow] = useState({ start: 0, end: 10 });
  const [libraryView, setLibraryView] = useState<'covers' | 'artists'>('covers');
  const [artist, setArtist] = useState<Artist>();
  const [record, setRecord] = useState<Album>();
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
  const history = useMemo(() => new NavigationHistory({ route: { page: 'queue' }, selection: 0 }, event => navigationLog.append(event)), []);
  const pendingViewport = useRef<Viewport | undefined>(undefined);
  const queueRef = useRef<PublicInstance>(null);
  const listRef = useRef<PublicInstance>(null);
  const artistListRef = useRef<PublicInstance>(null);
  const albumGridRef = useRef<PublicInstance>(null);
  const promptListRef = useRef<PublicInstance>(null);
  const progressRef = useRef<PublicInstance>(null);
  const priorSelection = useRef(0);
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
  const isGrid = view === 'artist' || (view === 'library' && libraryView === 'covers');
  const isArtists = view === 'library' && libraryView === 'artists';
  const current = snapshot.queue.find(t => t.queueId === snapshot.currentId);
  const artistBuffer = useMemo(() => artists.map(a => ({ ...a.albums[0]!.tracks[0]!, artist: a.name })), [artists]);
  const buffer = view === 'queue' ? snapshot.queue : view === 'record' ? record?.tracks || [] : isArtists ? artistBuffer : shelf.map(a => a.tracks[0]!);
  const matches = useMemo(() => buffer.map((t, i) => fuzzyScore(query, `${t.title} ${t.artist} ${t.album}`) >= 0 ? i : -1).filter(i => i >= 0), [buffer, query]);
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
  const error = actionProblem || problem;

  useLayoutEffect(() => {
    if (pendingSort.current) {
      const point = resolvePlace(pendingSort.current); pendingSort.current = undefined;
      applyPlace(point); return;
    }
    if (view === 'record' && record) {
      const updated = albums.find(a => a.key === record.key);
      if (updated) {
        const uri = record.tracks[selection]?.uri;
        setRecord(updated); setSelection(Math.max(0, updated.tracks.findIndex(t => t.uri === uri)));
        setArtist(artists.find(a => a.name === artist?.name) || artists.find(a => a.name === updated.artist));
      } else openPage('library');
    } else if (view === 'artist' && artist) {
      const updated = artists.find(a => a.name === artist.name);
      if (updated) {
        const key = artist.albums[selection]?.key;
        setArtist(updated); setSelection(Math.max(0, updated.albums.findIndex(a => a.key === key)));
      } else openPage('library', 'artists');
    }
  }, [albums, artists]);
  useEffect(() => { setSelection(i => Math.min(i, Math.max(0, buffer.length - 1))); }, [buffer.length]);
  useEffect(() => {
    if (prompt === 'local' && query.trim() && matches.length) setSelection(matches[0]!);
  }, [query, prompt]);
  useEffect(() => {
    const scroll = selectionScroll.current;
    selectionScroll.current = 'reveal';
    if (activeDrag.current?.startY !== undefined) return;
    const ref = isGrid ? albumGridRef : view === 'queue' ? queueRef : isArtists ? artistListRef : listRef;
    const saved = pendingViewport.current;
    pendingViewport.current = undefined;
    if (saved?.kind === 'list' && ref.current) { renderer.scrollToItem?.(ref.current.id, isGrid ? Math.floor(saved.index / columns) : saved.index, saved.offset); return; }
    if (saved?.kind === 'grid' && albumGridRef.current && isGrid) { renderer.scrollToItem?.(albumGridRef.current.id, Math.max(0, Math.floor(-saved.y / gridRowHeight))); return; }
    // A click chooses an already visible item; only navigation should reveal it.
    if (scroll === 'preserve' || !ref.current) return;
    const target = isGrid ? Math.floor(selection / columns) : selection;
    const rowHeight = isGrid ? gridRowHeight : isArtists ? 88 : ROW;
    const top = renderer.getListScrollTop?.(ref.current.id);
    const measurable = renderer as typeof renderer & Partial<Pick<GpuixRenderer, 'getElementBounds'>>;
    const bounds = measurable.getElementBounds?.(ref.current.id);
    if (top && bounds?.[3]) {
      const start = top[0] * rowHeight + top[1];
      const end = start + bounds[3];
      if (target * rowHeight >= start && (target + 1) * rowHeight <= end) return;
      const destination = target * rowHeight < start ? target * rowHeight : Math.max(0, (target + 1) * rowHeight - bounds[3]);
      renderer.scrollToItem?.(ref.current.id, Math.floor(destination / rowHeight), destination % rowHeight);
    } else renderer.scrollToItem?.(ref.current.id, target);
  }, [selection, view, libraryView, artist?.name, record?.key, columns, gridRowHeight, height, order]);
  useEffect(() => {
    history.checkpoint({ ...history.current, route: currentRoute(), selection, selected: placeKey(currentRoute(), buffer[selection]) });
  }, [selection, view, libraryView, artist?.name, record?.key, buffer.length]);
  useEffect(() => { updateDrag(undefined); }, [width, height, view, snapshot.queue]);
  useEffect(() => {
    if (prompt === 'global' && promptListRef.current) renderer.scrollToItem?.(promptListRef.current.id, resultIndex);
  }, [prompt, resultIndex, results.length, height]);

  function currentRoute(): Route {
    if (view === 'record' && record) return { page: 'record', key: record.key, artist: artist?.name };
    if (view === 'artist' && artist) return { page: 'artist', name: artist.name };
    return view === 'library' ? { page: 'library', mode: libraryView } : { page: 'queue' };
  }
  function capturePlace(): Place {
    const route = currentRoute();
    const point: Place = { route, selection, selected: placeKey(route, buffer[selection]) };
    if (pendingViewport.current) point.viewport = pendingViewport.current;
    else {
      const ref = isGrid ? albumGridRef : view === 'queue' ? queueRef : isArtists ? artistListRef : listRef;
      const top = ref.current && renderer.getListScrollTop?.(ref.current.id);
      if (top) {
        const index = (top[0] || 0) * (isGrid ? columns : 1);
        point.viewport = { kind: 'list', index, offset: top[1] || 0, anchor: placeKey(route, buffer[index]) };
      }
    }
    return point;
  }
  function resolvePlace(point: Place): Place { return resolveLocation(point, { albums, artists, queue: snapshot.queue }); }
  function applyPlace(point: Place) {
    clearFocus(); updateDrag(undefined); setPrompt(null); setSortOpen(false);
    const route = point.route;
    const album = route.page === 'record' ? albums.find(a => a.key === route.key) : undefined;
    const person = route.page === 'artist' ? artists.find(a => a.name === route.name) : album ? artists.find(a => a.name === (route.page === 'record' && route.artist || album.artist)) : undefined;
    setRecord(album); setArtist(person); setView(route.page);
    if (route.page === 'library') setLibraryView(route.mode);
    pendingViewport.current = point.viewport;
    setSelection(point.selection);
  }
  function visit(route: Route, index = 0, source = capturePlace()) {
    const next = resolvePlace({ route, selection: index });
    history.visit(next, source);
    applyPlace(next);
  }
  function travel(direction: 'back' | 'forward') {
    const point = history.step(direction, capturePlace());
    if (!point) { setNotice(direction === 'back' ? 'At the beginning of navigation history' : 'At the end of navigation history'); return; }
    const next = resolvePlace(point);
    applyPlace(next);
    const route = next.route;
    setNotice(`${direction === 'back' ? 'Back' : 'Forward'} · ${route.page === 'queue' ? 'Now playing' : route.page === 'library' ? 'Library' : route.page === 'artist' ? route.name : albums.find(a => a.key === route.key)?.title || 'Album'}`);
  }
  function openAlbum(album: Album, track?: Track, source?: Place) {
    const place = albumPlace(album, track, artist);
    visit(place.route, place.selection, source);
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
    visit({ page: 'artist', name }, 0, source); setNotice(name);
  }
  function sourceAt(index: number): Place {
    const point = capturePlace();
    return { ...point, selection: index, selected: placeKey(point.route, buffer[index]) };
  }
  function openPage(page: 'queue' | 'library', mode = libraryView) {
    visit(page === 'queue' ? { page } : { page, mode });
  }
  function goBack() {
    if (view === 'record' && record) openArtist(artist?.name || record.artist);
    else if (view === 'artist') openPage('library', 'artists');
    else if (view === 'library') openPage('queue');
  }
  // GPUIX 0.7.0 supplies ranges for programmatic jumps. Its wheel path needs
  // the wrapper's scroll event plus the already updated logical scroll anchor.
  function syncVisibleRows(event?: EventPayload) {
    const ref = isGrid ? albumGridRef : artistListRef;
    const top = ref.current && renderer.getListScrollTop?.(ref.current.id);
    const count = isGrid ? gridRows : artists.length;
    const rowHeight = isGrid ? gridRowHeight : 88;
    const first = event?.startIndex ?? top?.[0] ?? 0;
    const capacity = Math.ceil(((top?.[2] || height - 240) + (top?.[1] || 0)) / rowHeight) + 2;
    const start = Math.max(0, Math.min(Math.max(0, count - 1), first - 1));
    const end = Math.min(count, Math.max(event?.endIndex || 0, first + capacity) + 1);
    if (isGrid) setGridWindow(previous => previous.key === gridKey && previous.start === start && previous.end === end ? previous : { key: gridKey, start, end });
    else setArtistWindow(previous => previous.start === start && previous.end === end ? previous : { start, end });
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
    priorSelection.current = selection; setQuery(''); setResultIndex(0); setPrompt(kind); updateDrag(undefined);
  }
  function closePrompt(cancel: boolean) {
    if (prompt === 'local' && cancel) setSelection(priorSelection.current);
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
      if (result.title === 'Open library') openPage('library');
      if (result.title === 'Reload library') void act(reloadLibrary, 'Library refreshed');
    }
  }
  function moveSelection(delta: number) {
    clearFocus();
    setSelection(i => Math.max(0, Math.min(buffer.length - 1, i + delta)));
  }
  function openSelection() {
    if (isGrid && shelf[selection]) openAlbum(shelf[selection]!);
    else if (isArtists && artists[selection]) openArtist(artists[selection]!.name);
    else if (selected) openTrack(selected);
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
            const at = matches.indexOf(selection);
            setSelection(matches[(at + delta + matches.length) % matches.length]!);
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
      else if (direction) {
        if (isGrid) { clearFocus(); setSelection(gridSelection(selection, direction, columns, buffer.length)); }
        else if (direction === 'up' || direction === 'down') moveSelection(direction === 'down' ? 1 : -1);
        else if (direction === 'left') goBack();
        else openSelection();
      }
      else if (event.key === 'enter') { if (focusSteps.pending) focusSteps.enqueue('activate'); else if (focusedButton) focusedButton.activate(); else if (isGrid || isArtists) openSelection(); else playSelected(); }
      else if (event.key === 'space') void act(() => backend.toggle());
      else if (key === '[' || key === ']') seekTo(elapsed + (key === '[' ? -10 : 10));
      else if ((event.key === 'backspace' || event.key === 'delete') && view === 'queue') removeSelected();
      else if (event.key === 'escape') goBack();
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
    return <div key={track.queueId} testId={`queue-${track.queueId}`} onClick={() => selectFromPointer(index)} style={{ width: '100%', height: ROW, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 8, paddingRight: 10, borderBottomWidth: destination ? 2 : 1, borderColor: destination ? theme.borders.queueInsertion : theme.borders.queueRow, ...surface(selection === index ? 'queueRowSelected' : 'queueRow'), hover: selection === index ? undefined : surface('queueRowHover'), opacity: held ? theme.opacity.heldSource : 1, userSelect: 'none' }}>
      <div testId={`handle-${track.queueId}`} onMouseDown={e => { if (e.button === 0) flushSync(() => { selectFromPointer(index); updateDrag({ id: track.queueId, target: index, startY: e.y ?? 0, dy: 0 }); }); }} style={{ width: 18, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}><Text color={C.muted}>⠿</Text></div>
      <Text size={11} color={snapshot.currentId === track.queueId ? C.accent : C.muted} style={{ width: 18 }}>{snapshot.currentId === track.queueId ? '▸' : String(track.number).padStart(2, '0')}</Text>
      <Cover track={track} size={44} onClick={() => openTrack(track)} />
      <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Text onClick={() => selectFromPointer(index)} style={{ cursor: 'pointer' }}>{track.title}</Text>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 5, minWidth: 0 }}>
          <Link muted size={11} onClick={() => openArtist(track.artist)} style={{ flexShrink: 1 }}>{track.artist}</Link>
          <Text size={11} color={C.muted}>·</Text>
          <Link muted size={11} onClick={() => openTrack(track)} style={{ flexShrink: 1 }}>{track.album}</Link>
        </div>
      </div>
      <Text color={C.muted} size={12}>{duration(track.duration)}</Text>
    </div>;
  }

  const scrollAnchor = queueRef.current ? renderer.getListScrollTop?.(queueRef.current.id) : undefined;
  const sourceIndex = drag ? snapshot.queue.findIndex(t => t.queueId === drag.id) : 0;
  const previewIndex = drag?.startY !== undefined ? sourceIndex : drag?.target || 0;
  const dragTop = 40 + (previewIndex - (scrollAnchor?.[0] || 0)) * ROW - (scrollAnchor?.[1] || 0) + (drag?.startY !== undefined ? drag.dy : 0);
  const previewTop = Math.max(40, Math.min(height - 240, dragTop));
  const heldTrack = snapshot.queue.find(t => t.queueId === drag?.id);
  const heldStyle: StyleDesc = { position: 'absolute', left: 0, right: 0, height: ROW, padding: 12, ...surface('queueHeld'), borderWidth: 1, borderColor: theme.borders.queueHeld, pointerEvents: 'none', display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center' };
  const heldContent = <><Cover track={heldTrack} size={42} /><Text style={{ flexGrow: 1 }}>{heldTrack?.title}</Text><Text color={C.accent}>→ {(drag?.target || 0) + 1}</Text></>;

  return <div testId="music-root" style={{ width: '100%', height: '100%', ...surface('canvas'), selectionColor: C.textSelection, display: 'flex', flexDirection: 'column', position: 'relative' }}>
    <div style={{ height: 56, flexShrink: 0, paddingLeft: process.platform === 'darwin' ? 94 : 22, paddingRight: 18, ...surface('header'), borderBottomWidth: 1, borderColor: theme.borders.header, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, userSelect: 'none' }}>
      <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'row', gap: 6 }}>
        <Button tab active={view === 'queue'} onClick={() => openPage('queue')} id="view-queue">Now playing</Button>
        <Button tab active={view === 'library'} onClick={() => openPage('library')} id="view-library">Library</Button>
        {(view === 'artist' || view === 'record') && artist && <Button tab active={view === 'artist'} id="view-artist" style={{ minWidth: 0, maxWidth: narrow ? 110 : 220 }} onClick={() => openArtist(artist.name)}>{artist.name}</Button>}
        {view === 'record' && record && <Button tab active id="view-record" style={{ minWidth: 0, maxWidth: narrow ? 110 : 220 }} onClick={() => openAlbum(record)}>{record.title}</Button>}
      </div>
      <Button id="open-prompt" onClick={() => openPrompt('global')}>Prompt :</Button>
    </div>

    <div style={{ flexGrow: 1, minHeight: 0, padding: 22, ...surface('main'), display: 'flex', flexDirection: 'row', gap: 26 }}>
      {isGrid || isArtists ? <div onScroll={() => syncVisibleRows()} style={{ width: '100%', minHeight: 0, ...surface('library'), display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {view === 'artist' ? <><Button onClick={() => openPage('library', 'artists')}>‹ Artists</Button><Text size={17} style={{ flexGrow: 1 }}>{artist?.name}</Text><Text color={C.muted}>{shelf.length} albums</Text></> : <>
            <Button active={libraryView === 'covers'} onClick={() => openPage('library', 'covers')}>Albums</Button>
            <Button active={libraryView === 'artists'} onClick={() => openPage('library', 'artists')}>Artists</Button>
            <div style={{ flexGrow: 1 }} /><Text color={C.muted}>{isArtists ? `${artists.length} artists` : `${albums.length} albums`}</Text>
          </>}
          <Button id="library-sort" onClick={openSort}>{sortLabel} ▾</Button>
        </div>
        {isArtists ? <virtual-list ref={artistListRef} itemCount={artists.length} windowStart={artistWindow.start} onVisibleRange={event => syncVisibleRows(event)} estimatedItemHeight={88} style={{ width: '100%', flexGrow: 1, minHeight: 0, ...surface('artistList') }}>
          {artists.slice(artistWindow.start, artistWindow.end).map((a, localIndex) => { const index = artistWindow.start + localIndex; return <div key={a.name} onClick={() => selectFromPointer(index)} style={{ width: '100%', height: 88, padding: 12, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, ...surface(selection === index ? 'artistRowSelected' : 'artistRow'), hover: selection === index ? undefined : surface('artistRowHover'), borderBottomWidth: 1, borderColor: theme.borders.artistRow }}>
            <Cover track={a.albums[0]?.tracks[0]} size={60} onClick={() => openArtist(a.name, sourceAt(index))} />
            <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Link size={16} onClick={() => openArtist(a.name, sourceAt(index))}>{a.name}</Link>
              <Text size={11} color={C.muted}>{a.albums.length} {a.albums.length === 1 ? 'album' : 'albums'} · {a.albums.reduce((n, album) => n + album.tracks.length, 0)} tracks</Text>
            </div>
            <Button onClick={() => openArtist(a.name, sourceAt(index))}>›</Button>
          </div>; })}
        </virtual-list> : <virtual-list ref={albumGridRef} itemCount={gridRows} windowStart={gridRange.start} estimatedItemHeight={gridRowHeight} onVisibleRange={event => syncVisibleRows(event)} style={{ width: '100%', flexGrow: 1, minHeight: 0 }}>
          {Array.from({ length: Math.max(0, Math.min(gridRows, gridRange.end) - gridRange.start) }, (_, localRow) => {
            const row = gridRange.start + localRow;
            return <div key={`${gridKey}:${row}`} style={{ width: '100%', height: gridRowHeight, paddingBottom: 20, display: 'flex', flexDirection: 'row', gap: 20 }}>
              {shelf.slice(row * columns, (row + 1) * columns).map((a, column) => {
                const index = row * columns + column;
                return <div key={a.key} onClick={() => openAlbum(a, undefined, sourceAt(index))} style={{ width: albumTileSize, height: albumTileSize + 58, display: 'flex', flexDirection: 'column', gap: 9, cursor: 'pointer', ...surface(selection === index ? 'albumCardSelected' : 'albumCard'), hover: selection === index ? undefined : surface('albumCardHover') }}>
                  <Cover track={a.tracks[0]} size={albumTileSize} />
                  <Text style={{ height: 22, flexShrink: 0 }}>{a.title}</Text>
                  <div style={{ height: 18, flexShrink: 0, display: 'flex', flexDirection: 'row', gap: 6 }}><Link muted size={11} onClick={() => openArtist(a.artist)}>{a.artist}</Link><Text size={11} color={C.muted}>{a.year}</Text></div>
                </div>;
              })}
            </div>;
          })}
        </virtual-list>}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text size={11} color={C.muted}>{isArtists ? 'j/k select · l open · h back' : 'hjkl / arrows select · enter open'} · / find · o/i history</Text>
        </div>
      </div> : <>
        <div style={{ flexGrow: 1, minWidth: 0, minHeight: 0, ...surface(view === 'queue' ? 'queue' : 'record'), display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          <div style={{ height: view === 'record' ? 36 : 24, flexShrink: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {view === 'record' && <Link muted onClick={goBack}>‹</Link>}
            <Text size={17} style={{ flexGrow: 1 }}>{view === 'queue' ? 'Queue' : record?.title}</Text>
            {(view === 'queue' || !narrow) && <Text size={11} color={C.muted}>{buffer.length} tracks</Text>}
            {view === 'record' && record ? <>
              <Button id="play-album" onClick={() => void act(() => backend.enqueueAlbum(record, true), `Playing ${record.title}`)}>Play album</Button>
              <Button id="queue-album" onClick={() => void act(() => backend.enqueueAlbum(record), `Queued ${record.title}`)}>Queue album</Button>
            </> : snapshot.queue.length > 0 && <Button id="remove-track" onClick={removeSelected}>Remove</Button>}
          </div>
          {view === 'queue' ? <virtual-list ref={queueRef} estimatedItemHeight={ROW} style={{ width: '100%', flexGrow: 1, minHeight: 0 }}>{snapshot.queue.map(queueRow)}</virtual-list> : <virtual-list ref={listRef} estimatedItemHeight={ROW} style={{ width: '100%', flexGrow: 1, minHeight: 0 }}>{record?.tracks.map((t, i) => <div key={t.uri} onClick={() => selectFromPointer(i)} style={{ width: '100%', height: ROW, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, ...surface(selection === i ? 'recordRowSelected' : 'recordRow'), hover: selection === i ? undefined : surface('recordRowHover'), borderBottomWidth: 1, borderColor: theme.borders.recordRow, cursor: 'pointer' }}><Text size={12} color={C.muted} style={{ width: 22 }}>{String(t.number).padStart(2, '0')}</Text><Cover track={t} size={40} /><Text style={{ flexGrow: 1 }}>{t.title}</Text><Text color={C.muted}>{duration(t.duration)}</Text></div>)}</virtual-list>}
          {loading && <Text color={C.muted}>Reading the library…</Text>}
          {!loading && buffer.length === 0 && <Text color={C.muted}>Queue is empty. Find an album with :</Text>}
          <div style={{ display: 'flex', flexDirection: 'row' }}><Text size={11} color={C.muted} style={{ flexGrow: 1 }}>{drag ? 'hjkl / arrows move · enter drop · esc cancel' : view === 'queue' ? 'enter play · m move · ⌫ remove · o/i history' : 'enter play · h artist · / find · o/i history'}</Text><Text size={11} color={C.muted}>{duration(buffer.reduce((n, t) => n + t.duration, 0))} total</Text></div>
          {drag && (drag.startY !== undefined ? <div style={{ ...heldStyle, top: previewTop }}>{heldContent}</div> : <motion.div initial={false} animate={{ top: previewTop }} transition={{ duration: 0.10, ease: 'easeOut' }} style={heldStyle}>{heldContent}</motion.div>)}
        </div>
        <div style={{ width: artSize + 24, minWidth: 0, ...surface('detail'), borderLeftWidth: 1, borderColor: theme.borders.detail, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Text size={11} color={C.muted}>{view === 'queue' && current ? 'NOW PLAYING' : 'SELECTION'}</Text>
          <Cover track={shown} size={artSize} onClick={() => shown && openTrack(shown)} />
          {shown ? <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link size={18} onClick={() => openTrack(shown)}>{shown.title}</Link>
              <Link onClick={() => openArtist(shown.artist)}>{shown.artist}</Link>
              <Link muted onClick={() => openTrack(shown)}>{shown.album}</Link>
            </div>
            {!narrow && artSize >= 280 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}><Text size={11} color={C.muted}>{shown.year}</Text><Text size={11} color={C.muted}>Track {shown.number}</Text></div>}
          </div> : <Text color={C.muted}>Nothing playing</Text>}
          {view === 'record' && shown && <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Button onClick={playSelected}>Play track</Button><Button onClick={() => void act(() => backend.enqueue(shown), `Queued ${shown.title}`)}>Queue track</Button></div>}
        </div>
      </>}
    </div>

    <div style={{ padding: 15, borderTopWidth: 1, borderColor: theme.borders.transport, ...surface('transport'), display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'center' }}>
      <Cover track={current} size={38} />
      <div style={{ width: narrow ? 140 : 220, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}><Text size={12}>{current?.title || 'Stopped'}</Text>{current ? <Link muted size={11} onClick={() => openArtist(current.artist)}>{current.artist}</Link> : <Text size={11} color={C.muted}>MPD</Text>}</div>
      <Button id="previous" onClick={() => void act(() => backend.previous())}>|‹</Button>
      <Button id="toggle" active onClick={() => void act(() => backend.toggle())}>{snapshot.state === 'play' ? 'Pause' : 'Play'}</Button>
      <Button id="next" onClick={() => void act(() => backend.next())}>›|</Button>
      <Text size={11} color={C.muted}>{duration(elapsed)}</Text>
      <div ref={progressRef} testId="seek" onClick={seekAt} style={{ flexGrow: 1, minWidth: 30, height: 24, display: 'flex', justifyContent: 'center', flexDirection: 'column', cursor: current && snapshot.state !== 'stop' ? 'pointer' : 'default' }}>
        <div style={{ width: '100%', height: 4, ...surface('progressTrack'), pointerEvents: 'none' }}><div style={{ width: `${Math.min(100, elapsed / (current?.duration || 1) * 100)}%`, height: 4, ...surface('progressFill'), pointerEvents: 'none' }} /></div>
      </div>
      <Text size={11} color={C.muted}>{duration(current?.duration || 0)}</Text>
    </div>
    {prompt === 'local' && <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, ...surface('localFind') }}><Text color={C.accent} style={{ width: 14, flexShrink: 0 }}>/</Text><input autoFocus value={query} placeholder={`Find in ${isArtists ? 'artists' : isGrid ? 'albums' : view}`} theme={inputTheme()} onFocus={() => { promptReady.current = true; }} onChange={e => { promptReady.current = true; setQuery(e.value || ''); }} onSubmit={() => closePrompt(false)} style={{ flexGrow: 1, flexBasis: 0, minWidth: 0, height: 28, ...surface('localFindInput'), selectionColor: C.textSelection, color: C.text, fontSize: 14, fontFamily: FONT }} /><Text color={C.muted} style={{ flexShrink: 0 }}>{matches.length} matches</Text><Button onClick={() => closePrompt(true)}>esc</Button></div>}
    <div style={{ height: 32, paddingLeft: 18, paddingRight: 18, ...surface('status'), display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text size={11} color={error || navigationLog.error ? C.warning : C.muted} style={{ flexGrow: 1 }}>{navigationLog.error ? `Navigation log: ${navigationLog.error}` : error ? `${demo ? 'Demo' : 'MPD'}: ${error}` : notice}</Text><Text size={11} color={C.muted}>{demo ? 'Demo · simulated' : connection === 'connected' ? 'MPD connected' : connection === 'down' ? 'MPD down' : 'MPD connecting'} · {library.length.toLocaleString()} songs</Text></div>

    {drag && drag.startY !== undefined && <div
      onMouseMove={event => flushSync(() => { if (event.pressedButton === 0) positionDrag(event); else updateDrag(undefined); })}
      onMouseUp={event => { if (event.button === 0) flushSync(() => { positionDrag(event); drop(); }); }}
      onMouseLeave={() => updateDrag(undefined)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto', cursor: 'grabbing', userSelect: 'none' }}
    />}

    {sortOpen && <div onClick={() => { setSortOpen(false); clearFocus(); }} style={{ position: 'absolute', top: 56, bottom: 0, left: 0, right: 0, pointerEvents: 'auto' }}>
      <div style={{ position: 'absolute', top: 72, right: 22, width: 260, padding: 6, display: 'flex', flexDirection: 'column', ...surface('sortMenu'), borderWidth: 1, borderColor: theme.borders.sortMenu, borderRadius: 3 }}>
        {sortOptions.map((option, index) => <Button key={option.value} onClick={() => chooseSort(option.value)} active={index === sortIndex} style={{ ...surface(index === sortIndex ? 'sortItemSelected' : 'sortItem') }}>{option.label}{order[orderContext] === option.value ? ' ✓' : ''}</Button>)}
      </div>
    </div>}
    {prompt === 'global' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, ...surface('promptScrim'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div testId="prompt" onMouseDownOutside={() => closePrompt(true)} style={{ width: Math.min(680, width - 80), ...surface('prompt'), borderWidth: 1, borderColor: theme.borders.prompt, borderRadius: 6, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text color={C.accent}>:</Text><input testId="prompt-input" autoFocus value={query} placeholder="Find an album, track, artist or action" theme={inputTheme()} onFocus={() => { promptReady.current = true; }} onChange={e => { promptReady.current = true; setQuery(e.value || ''); setResultIndex(0); }} onSubmit={() => activateResult(results[resultIndex])} style={{ height: 36, flexGrow: 1, ...surface('promptInput'), selectionColor: C.textSelection, color: C.text, fontSize: 16, fontFamily: FONT }} /><Button onClick={() => closePrompt(true)}>esc</Button></div>
        <div style={{ height: 1, background: theme.borders.promptDivider }} />
        {results.length > 0 && <virtual-list ref={promptListRef} estimatedItemHeight={69} style={{ width: '100%', height: Math.min(height - 180, results.length * 69 + 13), flexShrink: 0, ...surface('promptResults') }}>{results.map((result, i) => {
          const t = result.kind === 'track' ? result.track : result.kind === 'album' ? result.album.tracks[0] : result.kind === 'artist' ? result.artist.albums[0]?.tracks[0] : undefined;
          const title = result.kind === 'track' ? result.track.title : result.kind === 'album' ? result.album.title : result.kind === 'artist' ? result.artist.name : result.title;
          const detail = result.kind === 'track' ? `${result.track.artist} · ${result.track.album}` : result.kind === 'album' ? `${result.album.artist} · ${result.album.year} · ${result.album.tracks.length} tracks` : result.kind === 'artist' ? `${result.artist.albums.length} albums in your library` : 'Action';
          return <div key={result.key} style={{ width: '100%', height: i === resultIndex ? 82 : 69, paddingBottom: 12 }}><div testId={`result-${i}`} onClick={() => activateResult(result)} style={{ width: '100%', height: i === resultIndex ? 70 : 57, padding: 8, borderRadius: 3, ...surface(i === resultIndex ? 'promptResultSelected' : 'promptResult'), hover: i === resultIndex ? undefined : surface('promptResultHover'), display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            {t ? <Cover track={t} size={i === resultIndex ? 50 : 38} /> : <Text color={C.muted} style={{ width: 38 }}>⌘</Text>}
            <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><Text>{title}</Text><Text size={11} color={C.muted}>{detail}</Text></div><Text size={11} color={C.accent}>{result.kind}</Text>
          </div></div>;
        })}</virtual-list>}
        {results.length === 0 && <Text color={C.muted}>No matches</Text>}
        <Text size={11} color={C.muted}>↑↓ choose · enter open · esc return</Text>
      </div>
    </div>}
  </div>;
}

render(<App />, { title: 'Music — MPD UI Prototype', appName: 'Music Prototype', width: 1120, height: 820, minWidth: 720, minHeight: 620, titlebarTransparent: true, trafficLightX: 16, trafficLightY: 20, focus: process.env.GPUIX_BACKGROUND !== '1', onKeyDown: event => flushSync(() => dispatchKey(event)) });
