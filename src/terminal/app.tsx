/** @jsxImportSource @opentui/react */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { flushSync, useKeyboard, useTerminalDimensions } from '@opentui/react';
import type { ImageRenderProtocol, KeyEvent } from '@opentui/core';
import { MusicSession, useMusic } from '../music-session';
import { NavigationHistory, type NavigationEvent, type Place, type Route } from '../history';
import { albumPlace, identifyPlace, placeKey, resolvePlace, routeItems, routeTitle } from '../locations';
import { albumKey, albumsOf, artistsOf, duration, fuzzyScore, searchLibrary, type Album, type Result, type Track } from '../model';
import { directionOf } from '../navigation';
import { theme } from '../theme';
import { albumOrders, artistOrders, defaultOrder, orderAlbums, orderArtists, type LibraryOrder } from '../library-order';
import type { NavigationState, NavigationStateStore } from '../navigation-state';

const noStateSubscription = () => () => {};
const noStateError = () => undefined;

const C = theme.colors;
// A terminal cell has one background; a future GUI gradient uses its first stop here.
const fill = (name: keyof typeof theme.surfaces): string => {
  const paint = theme.surfaces[name];
  return typeof paint === 'string' ? paint : paint.stops[0]!.color;
};
/** Metadata is text, never terminal control sequences or extra display rows. */
export const plain = (text: string) => text.replace(/[\x00-\x1f\x7f-\x9f]/g, ' ');
export function reveal(index: number, top: number, count: number, capacity: number) {
  const next = index < top ? index : index >= top + capacity ? index - capacity + 1 : top;
  return Math.max(0, Math.min(Math.max(0, count - capacity), next));
}
function Line({ text, color = C.text }: { text: string; color?: string }) {
  return <text content={plain(text)} fg={color} height={1} flexShrink={0} wrapMode="none" truncate />;
}
function Cover({ session, track, width, height, protocol }: { session: MusicSession; track?: Track; width: number; height: number; protocol: ImageRenderProtocol }) {
  const [source, setSource] = useState<string>();
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setSource(undefined); setError(false);
    if (track) void session.backend.artwork(track).then(value => { if (active) setSource(value); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [session, track?.uri]);
  return <box width={width} height={height} justifyContent="center" alignItems="center" backgroundColor={fill('coverPlaceholder')}>
    {source && !error ? <image source={source} width={width} height={height} fit="fit" protocol={protocol} onError={() => setError(true)} /> : <Line text={error ? 'Artwork unavailable' : 'No cover'} color={C.muted} />}
  </box>;
}
export function TerminalApp({ session, record = () => {}, quit = () => {}, protocol = 'auto', logError, navigationState }: {
  session: MusicSession; record?: (event: NavigationEvent) => void; quit?: () => void;
  protocol?: ImageRenderProtocol; logError?: () => string | undefined; navigationState?: NavigationStateStore;
}) {
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
  const [held, setHeld] = useState<{ id: number; target: number }>();
  const route = place.route;
  const orderContext = route.page === 'library' && route.mode === 'artists' ? 'artists' : route.page === 'artist' ? 'artistAlbums' : 'albums';
  const sortOptions = orderContext === 'artists' ? artistOrders : albumOrders;
  const sortLabel = sortOptions.find(option => option.value === order[orderContext])?.label || '';
  const items = useMemo(() => routeItems(route, catalogue), [route, catalogue]);
  const selected = items[place.selection];
  const current = snapshot.queue.find(t => t.queueId === snapshot.currentId);
  const shown = route.page === 'queue' ? current || selected : selected;
  const album = route.page === 'record' ? albums.find(a => a.key === route.key) : undefined;
  const parent = route.page === 'artist' ? artists.find(a => a.name === route.name) : route.page === 'record' ? artists.find(a => a.name === route.artist) : undefined;
  const tight = height < 16;
  const compactPrompt = height < 20;
  const capacity = Math.max(1, Math.floor((height - (tight ? 8 : 10) - (prompt === 'local' ? tight ? 1 : 2 : 0)) / 2));
  const top = place.viewport?.kind === 'list' ? place.viewport.index : 0;
  const showDetail = width >= 78 && height >= 19 && prompt !== 'global';
  const detailWidth = Math.min(36, Math.floor(width * .35));
  const results = useMemo(() => prompt === 'global' ? searchLibrary(query, albums, library, artists) : [], [prompt, query, albums, library, artists]);
  const matches = useMemo(() => prompt === 'local' ? items.map((t, i) => fuzzyScore(query, `${t.title} ${t.artist} ${t.album}`) >= 0 ? i : -1).filter(i => i >= 0) : [], [prompt, query, items]);
  const elapsed = Math.min(current?.duration || 0, snapshot.elapsed + playClock);

  function position(point: Place, keepViewport = false): Place {
    const next = resolvePlace(point, catalogue);
    const list = routeItems(next.route, catalogue);
    let index = next.viewport?.kind === 'list' ? next.viewport.index : 0;
    if (!keepViewport) index = reveal(next.selection, index, list.length, capacity);
    else index = Math.max(0, Math.min(Math.max(0, list.length - capacity), index));
    return identifyPlace({ ...next, viewport: { kind: 'list', index, offset: 0, anchor: placeKey(next.route, list[index]) } }, list);
  }
  function select(index: number) {
    const next = position({ ...place, selection: Math.max(0, Math.min(items.length - 1, index)), selected: undefined, queue: undefined });
    history.checkpoint(next); setPlace(next);
  }
  function visit(point: Place) {
    restoring.current = false;
    if (point.route.page === 'library') setLibraryView(point.route.mode);
    const next = position(point);
    history.visit(next, place); setPlace(next); setPrompt(undefined); setHeld(undefined); setSortOpen(false);
    setNotice(routeTitle(next.route, albums));
  }
  function openAlbum(target: Album, track?: Track) { visit(albumPlace(target, track, parent)); }
  function openTrack(track: Track) { const target = albums.find(a => a.key === albumKey(track)); if (target) openAlbum(target, track); }
  function travel(direction: 'back' | 'forward') {
    const target = history.step(direction, place);
    if (!target) { setNotice(direction === 'back' ? 'At the beginning of navigation history' : 'At the end of navigation history'); return; }
    const next = position(target, true);
    history.checkpoint(next, false); setPlace(next); setHeld(undefined);
    setNotice(`${direction === 'back' ? 'Back' : 'Forward'} · ${routeTitle(next.route, albums)}`);
  }
  function openSelected() {
    if (!selected) return;
    if (route.page === 'library' && route.mode === 'artists') visit({ route: { page: 'artist', name: selected.artist }, selection: 0 });
    else openTrack(selected);
  }
  function parentPage() {
    const next: Route = route.page === 'record' ? { page: 'artist', name: parent?.name || album?.artist || '' } : route.page === 'artist' ? { page: 'library', mode: 'artists' } : { page: 'queue' };
    if (route.page !== 'queue') visit({ route: next, selection: 0 });
  }
  function activateResult(result?: Result) {
    if (!result) return;
    setPrompt(undefined);
    if (result.kind === 'artist') visit({ route: { page: 'artist', name: result.artist.name }, selection: 0 });
    else if (result.kind === 'album') openAlbum(result.album);
    else if (result.kind === 'track') openTrack(result.track);
    else {
      if (result.title === 'Open queue') visit({ route: { page: 'queue' }, selection: 0 });
      if (result.title === 'Open library') visit({ route: { page: 'library', mode: libraryView }, selection: 0 });
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
      if (key.name === 'escape') { key.preventDefault(); if (prompt === 'local') { setPlace(priorPlace); history.checkpoint(priorPlace); } setPrompt(undefined); }
      if (key.name === 'up' || key.name === 'down') {
        key.preventDefault(); const delta = key.name === 'down' ? 1 : -1;
        if (prompt === 'global') setResultIndex(i => Math.max(0, Math.min(results.length - 1, i + delta)));
        else if (matches.length) select(matches[(matches.indexOf(place.selection) + delta + matches.length) % matches.length]!);
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
    if (char === ':' || char === '/') { setPriorPlace(place); setQuery(''); setResultIndex(0); setPrompt(char === ':' ? 'global' : 'local'); }
    else if (char === 'o') travel('back');
    else if (char === 'i') travel('forward');
    else if (char === 'q') quit();
    else if (char === 's' && (route.page === 'library' || route.page === 'artist')) { setSortIndex(Math.max(0, sortOptions.findIndex(option => option.value === order[orderContext]))); setSortOpen(true); }
    else if (key.name === 'f1') visit({ route: { page: 'queue' }, selection: 0 });
    else if (key.name === 'f2') visit({ route: { page: 'library', mode: libraryView }, selection: 0 });
    else if (direction === 'up' || direction === 'down') select(place.selection + (direction === 'down' ? 1 : -1));
    else if (direction === 'left' || key.name === 'escape') parentPage();
    else if (direction === 'right') openSelected();
    else if (key.name === 'pagedown' || key.name === 'pageup') select(place.selection + (key.name === 'pagedown' ? capacity : -capacity));
    else if (key.name === 'home' || key.name === 'end') select(key.name === 'home' ? 0 : items.length - 1);
    else if (key.name === 'return') {
      if (route.page === 'library' || route.page === 'artist') openSelected();
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
    if (restoring.current && (!libraryReady || !snapshotReady)) return;
    const next = position(place);
    restoring.current = false;
    if (JSON.stringify(next) !== JSON.stringify(place)) { setPlace(next); history.checkpoint(next, false); }
    setHeld(undefined);
  }, [catalogue, width, height, libraryReady, snapshotReady]);
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
    <input id="music-prompt" focused value={query} flexGrow={1} backgroundColor={fill('prompt')} textColor={C.text} focusedBackgroundColor={fill('prompt')} focusedTextColor={C.text} placeholderColor={C.muted} cursorColor={C.caret} placeholder={prompt === 'global' ? 'Find an artist, album, track or action' : 'Find in this list'} onInput={value => flushSync(() => { setQuery(value); setResultIndex(0); })} onSubmit={() => flushSync(() => { if (prompt === 'global') activateResult(results[resultIndex]); else setPrompt(undefined); })} />
  </box>;
  if (width < 40 || height < 12) return <box padding={1}><Line text="Music · enlarge to at least 40 × 12" /><Line text="q quit · Ctrl+C quit" color={C.muted} /></box>;
  return <box width="100%" height="100%" flexDirection="column" backgroundColor={fill('canvas')}>
    <box height={3} paddingLeft={2} paddingRight={2} paddingTop={1} flexDirection="row" gap={3} backgroundColor={fill('header')}>
      <text fg={route.page === 'queue' ? C.text : C.muted}>F1 Now playing</text><text fg={route.page === 'library' ? C.text : C.muted}>F2 Library</text>
    </box>
    <box flexGrow={1} minHeight={0} paddingLeft={2} paddingRight={2} paddingTop={tight ? 0 : 1} flexDirection="column">
      {prompt === 'global' ? <box flexDirection="column" height="100%" gap={compactPrompt ? 0 : 1} backgroundColor={fill('prompt')} padding={compactPrompt ? 0 : 1}>
        {input}
        {!compactPrompt && <Line text="Artists · albums · tracks · actions" color={C.muted} />}
        <box flexGrow={1} minHeight={0} flexDirection="column">
          {results.slice(resultTop, resultTop + resultCount).map((result, i) => {
            const title = result.kind === 'artist' ? result.artist.name : result.kind === 'album' ? result.album.title : result.kind === 'track' ? result.track.title : result.title;
            const subtitle = result.kind === 'artist' ? `${result.artist.albums.length} albums` : result.kind === 'album' ? `${result.album.artist} · ${result.album.year}` : result.kind === 'track' ? `${result.track.artist} · ${result.track.album}` : 'Run action';
            return <box key={result.key} height={2} flexShrink={0} backgroundColor={i + resultTop === resultIndex ? fill('promptResultSelected') : fill('prompt')}>
              <Line text={`${i + resultTop === resultIndex ? '›' : ' '} ${result.kind.padEnd(6)} ${title}`} /><Line text={`         ${subtitle}`} color={C.muted} />
            </box>;
          })}
          {!results.length && <Line text={loading ? 'Reading the library…' : 'No matches'} color={C.muted} />}
        </box>
        {!compactPrompt && <Line text="↑↓ choose · Enter open / run · Esc return" color={C.muted} />}
      </box> : <>
        <Line text={`${heading}   ${items.length ? place.selection + 1 : 0}/${items.length}${route.page === 'library' || route.page === 'artist' ? `   s ${sortLabel} ▾` : ''}`} color={C.accent} />
        {prompt === 'local' && <box height={tight ? 1 : 2} paddingTop={tight ? 0 : 1}>{input}</box>}
        <box flexDirection="row" gap={3} flexGrow={1} minHeight={0} paddingTop={tight ? 0 : 1}>
          <box flexDirection="column" flexGrow={1} minWidth={0}>
            {items.slice(top, top + capacity).map((track, i) => {
              const index = top + i;
              const isSelected = index === place.selection;
              const playing = route.page === 'queue' && snapshot.queue[index]?.queueId === snapshot.currentId;
              const title = route.page === 'library' && route.mode === 'artists' ? track.artist : route.page === 'artist' || route.page === 'library' ? track.album : track.title;
              const subtitle = route.page === 'library' && route.mode === 'artists' ? `${artists.find(a => a.name === track.artist)?.albums.length || 0} albums` : `${track.artist} · ${route.page === 'library' || route.page === 'artist' ? track.year : track.album}`;
              const marker = held?.target === index ? '↕' : isSelected ? '›' : playing ? '▶' : ' ';
              return <box key={placeKey(route, track)} height={2} flexShrink={0} backgroundColor={isSelected ? fill('queueRowSelected') : fill('canvas')}>
                <Line text={`${marker} ${String(index + 1).padStart(2)} ${playing ? '▶ ' : ''}${title}`} /><Line text={`     ${subtitle}`} color={C.muted} />
              </box>;
            })}
            {!items.length && <Line text={loading ? 'Reading the library…' : 'Nothing here. Find an album with :'} color={C.muted} />}
          </box>
          {showDetail && <box width={detailWidth} flexShrink={0} flexDirection="column" gap={1}>
            <Cover session={session} track={shown} width={detailWidth} height={Math.max(4, Math.min(Math.floor(detailWidth / 2), height - 17))} protocol={protocol} />
            <box><Line text={shown?.title || 'Nothing playing'} /><Line text={shown?.artist || ''} color={C.muted} /><Line text={shown?.album || ''} color={C.muted} /></box>
          </box>}
        </box>
      </>}
    </box>
    <box height={4} flexShrink={0} paddingLeft={2} paddingRight={2} paddingTop={1} backgroundColor={fill('transport')}>
      <Line text={`${snapshot.state === 'play' ? '▶' : snapshot.state === 'pause' ? 'Ⅱ' : '■'} ${current?.title || 'Nothing playing'}   ${duration(elapsed)} / ${duration(current?.duration || 0)}   ${snapshot.volume}%`} />
      <Line text={held ? 'Moving · arrows / hjkl position · Enter drop · Esc cancel' : 'hjkl / arrows · Enter play/open · Space pause · : prompt · o/i history · q quit'} color={C.muted} />
      <Line text={`${status} · ${error || notice}`} color={error ? C.warning : C.muted} />
    </box>
    {sortOpen && <box position="absolute" top={5} right={2} width={Math.min(29, width - 4)} height={sortOptions.length + 2} padding={1} backgroundColor={fill('sortMenu')}>
      {sortOptions.map((option, index) => <text key={option.value} height={1} fg={index === sortIndex ? C.accent : C.text} bg={index === sortIndex ? fill('sortItemSelected') : fill('sortMenu')}>{`${index === sortIndex ? '›' : ' '} ${option.label}`}</text>)}
    </box>}
  </box>;
}
