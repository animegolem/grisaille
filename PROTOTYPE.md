# Music UI prototype

A separate frontend experiment using GPUIX 0.7.0, OpenTUI 0.5.10, React and Bun 1.4.2.
MPD owns audio decoding, playback and output. nowplayd remains the independent
macOS media integration. Neither existing repository was changed.

## Run

The compiled app does not need Bun installed. From this directory:

```sh
./dist/music-ui --demo
./dist/music-ui
./dist/music-ui --tui
./dist/music-ui --tui --demo
```

`--demo` uses the eight-record sample from the earlier design sketches, with
simulated playback and queue changes. The default connects to MPD and sends
real playback and queue commands when you use its controls.

`dist/Music Prototype.app` opens in the default MPD mode. To open its sample mode:

```sh
open 'dist/Music Prototype.app' --args --demo
```

To suppress the app's initial focus request when launching its executable:

```sh
GPUIX_BACKGROUND=1 './dist/Music Prototype.app/Contents/MacOS/music-ui' --demo
```

macOS controls desktop placement. GUI automation can still activate the window.

The prototype uses the installed `mpc` executable for artwork and MPD event
subscriptions. Library metadata uses bounded MPD search pages. It uses MPD's
stable song IDs for playback, seeking, removal and queue moves.
`MPD_HOST` and `MPD_PORT` select the server; mpc's
`password@host` convention is supported. Nothing changes the MPD configuration.

The same executable opens the native GUI by default or a terminal view with
`--tui`. Terminal mode requires an interactive terminal. `--help` lists modes.
The renderers share the MPD adapter, music session, serialized actions, library
identity/search, location resolution, history and navigation journal.

Terminal mode includes the queue, album/artist lists, record tracks, global
prompt, local find, `o`/`i` history, playback, seeking, removal and keyboard queue
moves. `F1` opens Now playing; `F2` opens Library; Tab switches album/artist lists.
On a library or artist page, `s` opens the sort dropdown; arrows choose and Enter
applies it.
`q` or Ctrl+C exits and restores the terminal. The remaining main keys match the
GUI. Command-number shortcuts remain GUI-specific because terminal applications
commonly reserve them. Terminal mode is keyboard-only in this proof.

Artist browsing uses connected Artists → Albums → Tracks columns. At 100 columns
and 19 rows it shows all three; at 70–99 columns it shows two, keeping the active
column visible. Smaller windows show the active list. The track column includes
one context cover at 100 columns and 24 rows. Selection and navigation behave the
same at each size.

Context covers use OpenTUI's negotiated Kitty graphics, Sixel or coloured
block fallback. `--no-images` forces the coloured block fallback. The queue detail pane
hides below 78 columns or 19 rows, keeping the list and prompt usable; the minimum
layout is 40 by 12. Images unmount while the global prompt is open. OpenTUI owns
image placement, deletion and terminal restoration. An owner-provided Ghostty
screenshot confirms a square cover contained within the detail pane in the demo
artist view. It shows the earlier `music`/`DEMO` header, so the latest header,
status line and sort menu still need a check after relaunch. Computer Use refused
Ghostty access during this sitting; the screenshot supplied the visual evidence.

## Interaction

- `Cmd+1` opens Now playing; `Cmd+2` opens Library. Bare numbers do not change pages.
  The eventual page order is Now playing, Lyrics, Library, Visualizer. Those
  later pages and their Command-number assignments have not been added yet.
- Library has Albums and Artists views. Both the album shelf and artist lists
  scroll continuously. The shelf retains spatial keyboard movement and mounts
  only album rows near the viewport; there are no page controls. The sort dropdown
  offers Artist A–Z, Album title A–Z, and year in either direction. Artist lists
  offer A–Z/Z–A. An artist's albums default to oldest first and have their own sort
  setting. Missing years sort last. Sorting retains the selected album/artist by
  identity, including its viewport anchor. Sort choices and browsing positions
  are restored when the app reopens.
- Artists opens a connected three-column browser in the GUI. Artist selection
  previews that artist's albums; album selection previews its tracks. Small covers
  accompany album rows, and the track column's cover and details follow selection.
  The active column has a brighter selection and heading; subdued selections keep
  its artist and album visible. `j`/`k` moves within a column, `h`/`l` changes column,
  and Enter opens the next column or plays a track. Right on a track has no playback
  action. Clicking a row selects and focuses its column without starting playback.
  Sorting and `/` find apply to the active column; `s` also opens sorting in the GUI.
  The Albums grid retains spatial navigation.
- Stepping to a parent retains the album or artist you came from. Stepping into
  the child again retains its selected track and viewport. All three positions
  travel with `o`/`i` history and saved state. The trail holds the current artist,
  album and track path; changing a parent resets a child that belongs to another
  parent. It does not keep an independent saved position for every album visited.
- The top bar contains navigation and the prompt. MPD connected / down / connecting
  is shown in the status line; the sample mode is labelled there as simulated.
  Connection state follows snapshot reads, independently of artwork failures.
- Artist links open that artist's albums; album links open its track list. They are separate focus targets.
  The header keeps a temporary path: Library → artist → album. Opening an album
  from any entry point retains its artist tab; clicking that tab steps back to
  the artist. Returning to Now playing or Library clears both context tabs and
  their active path. It does not erase history or evict the library/artwork cache.
- `o` goes back through visited screens; `i` goes forward. For example, opening
  an album from Now playing and pressing `o` returns directly to the queue,
  with the previous selection and scroll position. `h` still opens the parent
  artist. Moving the selection updates the current history entry; opening a
  screen adds an entry. A new destination after going back replaces the forward
  branch. History never replays playback or queue commands.
- `:` opens a global prompt containing artists, albums, tracks and actions.
- `/` finds within the current list; Enter retains the selection and Escape cancels.
- Arrows and `hjkl` navigate. On a cover grid they move spatially; in lists,
  `j`/`k` move vertically, `l` opens and `h` returns to the parent. Escape also
  returns to the parent. Enter plays a track or opens an album/artist.
  In an input, letters remain text; Up/Down choose matches.
- Clicking a queue, album-track or artist-list row selects it without scrolling
  the viewport. Keyboard navigation and search still reveal the selected item;
  history restores its saved viewport. Keyboard selection moves through the fully
  visible rows before scrolling just enough to reveal a row beyond an edge. This
  uses the native virtual list's viewport height for columns, queue and album rows.
  Pointer queue drops also avoid an extra
  automatic jump to the moved row.
- Space toggles playback. Album and artist text navigate into the library.
- The Albums column offers Play album and Queue album. Both append the album in
  disc/track order; Play album starts its first new queue occurrence. The existing
  queue is retained. The Tracks column's Play track and Queue track act on its
  selected track, including when another column currently has keyboard focus.
- Click the progress bar to seek, or use `[` / `]` for ten seconds backward/forward.
  Seeking addresses the current song ID and rejects an already changed/stopped song.
- In the queue, Backspace/Delete or Remove removes the selected occurrence from
  the queue. It does not delete the music file or another copy of the same track.
- In the queue, `m` grabs the selection; arrows and `hjkl` move it, Enter drops
  and Escape cancels. Left/Up/`h`/`k` move earlier; Right/Down/`l`/`j` move later.
- The small handle starts a pointer drag. Reordering preserves the current song ID.
  Pointer preview position follows unsnapped motion without easing; only the
  insertion target snaps. Keyboard moves retain the short held-row transition.

## Library metadata

The adapter reads up to 1,000 songs per MPD search request, retaining album artist,
disc number, MusicBrainz release ID and repeated artist tags. The local fuzzy
index currently holds the full library, with a prototype cap of 512,000 tracks.
MPD database events reload metadata; `: Reload library` also refreshes it.

Albums use a MusicBrainz release ID when supplied, otherwise their containing
folder and album title, falling back to artist/title for paths without a folder.
Conventional CD/Disc/Disk number subfolders share their containing album. This
keeps ordinary compilations together and distinguishes same-title editions in
different folders. Tracks sort by disc, track number, then natural path order.
Artist pages include albums on which the artist appears as a contributor.

These are practical grouping rules, not release disambiguation: partially tagged
release IDs or unconventional disc folders can still split an album. Copies with
the same release ID group together. Multiple album-artist tags currently use the
first value for the album heading.

Artwork tries embedded pictures, then folder artwork. CLI status text is suppressed
and image signatures are checked before handing bytes to the renderer. Missing
covers remain placeholders and can be retried on a later visit. The event helper
is stopped when the native app exits, including a normal development SIGTERM.

## Local navigation journal

Navigation appends to `~/Library/Application Support/Music Prototype/navigation/`
in daily JSONL files. Each entry has a timestamp, session ID, sequence, backend
mode, renderer (`gui` or `tui`), action, source and destination. Locations include the selected item and,
on page transitions, the viewport. Typed queries and playback commands are not
recorded. The directory is created with mode 0700 and new files with mode 0600.

The back/forward stack holds up to 200 places. The journal persists across
launches, including discarded forward branches; it remains an audit trail.
Journal write failures appear in the status bar without blocking navigation.

## Saved browsing state and recovery

A separate JSON snapshot in `~/Library/Application Support/Music Prototype/state/`
restores the last page, selected item, scroll anchor and pixel offset, all three
sort choices, the last Library view, and both directions of `o`/`i` history.
Browser entries also retain the other columns' selections and viewport anchors.
Existing snapshots without those fields remain readable. A different window size
can clamp the restored scroll offset to the available content height.
The GUI and terminal keep separate snapshots, as do demo mode and each configured
MPD endpoint. Endpoint names are hashed; passwords are not stored. Set
`MUSIC_UI_STATE_DIR` to use a separate state directory for a development check.

Snapshots use an atomic replacement with private file permissions. Changes are
coalesced for 180 ms, with a synchronous flush on normal exit. A forced kill can
lose the most recent unflushed movement. Prompts and typed queries are not saved.
Restoration resolves identities against the current library and queue and waits
for their first successful reads before applying a saved location. An offline
launch does not replace the previous snapshot with an empty queue. A missing
album falls back to Library; a removed item uses the nearest surviving position.
Queue locations also keep the file URI and duplicate occurrence, because queue
IDs may be reused after an MPD restart. Invalid state files produce a status
message and start at Now playing. Playback commands are never replayed.

Failed status and library reads retry independently, backing off from one second
to a ten-second maximum. Loaded library and queue data remain available while
MPD is down, and the elapsed-time estimate stops advancing. A successful reconnect
refreshes the library as well as playback state, including changes whose database
events were missed during the outage. Connection and library-read errors clear
on successful recovery. Failed user commands remain reported until the next
action; they are not retried automatically. Exit stops owned subscriptions and
pending retries.

## Colour addresses

`src/theme.ts` is the sole definition of app-owned colour values. The current
palette is unchanged. It is a typed palette boundary, not a theme settings system.

- `theme.surfaces` separately addresses canvas, header, queue, library, artist
  list, album cards, record list, detail pane, cover placeholders, playback bar,
  progress track/fill, status, local find, prompt, scrim, inputs and controls.
  Hover, selected, active and held-row fills have their own addresses.
- Every surface accepts a solid CSS colour or a GPUIX `linear-gradient` object
  with an angle, two colour stops, and optional `srgb`/`oklab` colour space.
  Transparent panels reveal the canvas, so a canvas gradient can span the app.
  Opaque header/transport fills can be made transparent through their tokens too.
- `theme.colors` addresses foregrounds, link states, placeholders, caret, text
  selection and errors. `theme.borders` addresses dividers, focus and insertion
  outlines. `theme.opacity.heldSource` controls the original row while grabbed.
- Layout-only wrappers inherit their containing surface. Artwork pixels and
  macOS-owned traffic lights/window shadows are outside this app palette.
- Native input colours are explicitly supplied through `inputTheme()`; GPUIX
  derives some native text-selection appearance from the input accent.

For example, a future palette producer can supply this as `surfaces.canvas`:

```ts
{ type: 'linear-gradient', angle: 135,
  stops: [{ color: '#242a30', position: 0 }, { color: '#3c515f', position: 1 }],
  colorSpace: 'oklab' }
```

No artwork sampler, runtime switching, persistence or gradient animation has
been added. Those remain later design work. New painted UI should use these
tokens instead of introducing component-local colour literals.

## Local repository

Git is initialized in this prototype directory on `codex/prototype`. The app's
name and remote are pending the owner's choice. Source, lockfile, tests and
packaging script are tracked; `node_modules`, build output and local logs are
ignored. No remote is configured.

## Build

Bun is installed locally as a development dependency; the system shell was unchanged.

```sh
npm install
npm run typecheck
./node_modules/.bin/bun test
./node_modules/.bin/bun run build
python3 scripts/package-mac.py
```

## Keyboard scrolling correction on 7 September 2026

- The native bounds lookup returns no measurement for virtual lists. Its old
  fallback treated a column as one row tall and anchored every new keyboard
  selection at the top. Columns, queue and album grid now use the viewport height
  returned by `getListScrollTop` and share the same edge-reveal calculation.
- TypeScript checking and all 54 tests pass (218 assertions). The regression
  cases use the measured native row geometry, including partial rows and movement
  back up through an already scrolled viewport.
- An isolated native demo confirmed that six 52-pixel tracks fit in a 332.5-pixel
  viewport without scrolling. Selecting the seventh moved it only 31.5 pixels;
  moving up within the viewport did not scroll. The queue retained its viewport
  through visible selections, and the second album row required only a 16.5-pixel
  reveal. These checks used native input and recorded the actual scroll anchors.

## Browser verification on 7 September 2026

- TypeScript checking and all 52 tests pass (201 assertions); the standalone binary
  and macOS app bundle build successfully.
- The native demo was checked at the initial size and the 720×620 minimum. Album
  covers, column headings, context and playback controls remained usable. Moving
  from a later Loveless track to Albums and back retained the track and scroll;
  clicking another visible track preserved the viewport. Closing and reopening
  retained the artist, album, child track and active column. Enter played the
  retained track in the simulated backend, and previewing another album left that
  simulated playback running.
- Shared navigation checks cover parent/child restoration, changed parents,
  contributor context on compilations, sorting, missing albums and validation of
  saved column positions. Terminal renderer checks cover three, two and one-column
  layouts, history, search and resizing with the selected track still visible.
  These terminal checks do not constitute a new Ghostty visual check.
- The compiled terminal app also ran twice from `/tmp` in a 110×30 PTY. Search,
  eight track moves, both parent columns and returning to Tracks were sent in one
  input burst. Both runs exited successfully, restored the terminal, displayed all
  three columns, and retained identical saved state with Loveless track nine selected.
- Native live checks used the 18,404-track library and 1,118 artists. Jumping to
  NOFX and sending fifteen immediate navigation keys reached its sixteenth album.
  Artists and Albums remained populated, including after reopening at the end of
  the discography. Wheel scrolling in Artists and clicking Pat the Bunny retained
  the viewport while updating the album covers and track preview. These live
  checks used browsing controls only.
- A first live pass exposed a blank parent column on a distant jump, followed by
  missing rows when native scrolling clamped a jump near the end of a list.
  Browser lists now mount the possible destination viewport before scrolling,
  and wheel updates read the current native anchor. Search submission also commits
  before subsequent navigation keys arrive.

## Earlier verification on 6 September 2026

- At that stage, TypeScript checking, standalone build and 47 tests passed (178 assertions).
  The terminal tests render at 100×28, 65×16 and 44×12 and cover rapid input,
  bracketed paste, search destinations, history without replaying commands,
  queue controls, sorting, viewport restoration, action serialization and cleanup.
  A short-terminal check keeps both the prompt input and chosen result visible.
- New restart checks cover a fresh terminal renderer, an unavailable server at
  launch, retained forward history, private/atomic state files, corrupted state,
  recycled queue IDs and independent recovery without a new server event.
  Rapid typing followed immediately by Enter now commits the latest input before
  opening a search result. Terminal shutdown explicitly flushes saved navigation
  before renderer teardown.
- A native demo window closed and reopened with Loveless track nine selected at
  the same list anchor and 15.5-pixel offset. Forward history returned to the
  artist page with its newest-first sort. A separate wheel-only movement saved
  and restored the album grid's 30.5-pixel offset while leaving its selection
  unchanged.
- Two launches of the compiled terminal app from `/tmp` retained identical saved
  state, including Loveless track nine and its viewport. Both exited with status
  zero and restored the terminal screen and cursor. The first run sent search,
  Enter and eight navigation keys in one input burst; submission now commits
  before subsequent navigation keys are handled.
- The actual MPD adapter was checked through an isolated localhost proxy. Closing
  that connection retained the loaded library and queue; reopening it restored
  connected status and reloaded all 18,404 tracks without another server event.
  Recovery took 390 ms with the check's shortened retry delay. The proxy observed
  only search, status, playlistinfo and idle commands; the MPD service was not
  restarted. The normal application uses the backoff described above.
- The compiled terminal app ran from `/tmp` against live MPD in a PTY with emulated
  Kitty capability replies. The capture contained image transfers, three placements
  and three deletions across opening/closing the prompt. Exit restored the alternate
  screen and cursor. The queue, current song ID, paused state and volume matched
  their pre-check values. This validates protocol output, not a Ghostty screenshot.
- The owner's subsequent Ghostty screenshot showed My Bloody Valentine's artist
  view with `Isn't Anything` selected, its square cover inside the right pane,
  readable metadata and no visible image overlap. This verifies cover appearance
  in an actual terminal window. The earlier `music`/`DEMO` header was still present;
  the image does not verify the later header, status-line or sort-menu changes.
- Native continuous browsing checks scrolled through the live 1,508-album shelf
  and 1,118-artist list. NOFX's sixteenth album was reached by scrolling directly
  past the former fifteen-album page boundary. Sorting by album title, artists
  Z–A and newest year retained the selected item. MPD connected appeared in the
  footer, and the playing occurrence remained paused during these checks.
- The pinned GPUIX wheel path did not emit visible-range changes. The surrounding
  scroll event now reads the updated logical list anchor and mounts nearby rows;
  programmatic jumps still use visible-range events. A native scroll regression
  exposed the blank-window failure before this correction.

- Earlier GUI verification had twenty-eight tests (101 assertions), covering
  model/MPD behavior, artist grouping/search, keyboard/grid semantics, pointer
  insertion, delayed native focus, history, album ordering, queue operations,
  bounded metadata reads and artwork validation. The packaged window opens with artwork.
- Native history checks opened Loveless from Now playing, returned directly
  to the previously selected queue row with `o`, and reopened the selected album
  track with `i`. Repeating after scrolling to the last track retained both the
  selection and viewport. The playing occurrence and paused state were unchanged.
- The pointer-selection correction was checked in the native live queue: clicking
  a lower track title or row background kept the visible rows at the same positions,
  including in an already scrolled viewport. Clicking the same selected row again
  then using `j` still revealed the next keyboard selection.
- Native screenshots checked the queue, cover/metadata pane, album shelf,
  record track list and global prompt. Fixed fragmented metadata text and
  queue rows that failed to fill their available width.
- Keyboard checks covered album/track search with overlapping names, opening
  the matching track in its record, local find without filtering rows, Escape
  restoring the prior selection, and queue movement preserving the current song.
- Quick key sequences now commit their interaction state synchronously. Pointer
  dragging uses a temporary window-wide input surface because painted GPUIX
  descendants can intercept mouse events before their parent receives them.
- Automated drag input did not complete reliably. The owner tried physical
  dragging in the native sample app and reported no obvious issues; it works.
  That is an owner interaction check, not an automated drag test pass.
- Live MPD checks returned 18,404 tracks, grouped into 1,508 albums and 1,118
  artist pages with the current identity rules. One local read took 244 ms,
  grouping took 17 ms and a mixed album/track search took 19 ms. These are bounded
  observations, not a performance guarantee.
- A live album append returned 12 new song IDs in order. Removing only those
  returned IDs restored the exact prior queue; current song, stopped state and
  volume were unchanged by that probe.
- Native demo checks covered album queueing while paused, Play album, removal
  of one selected occurrence, click seeking, ten-second keyboard seeking and
  narrow layouts. Native live checks covered the library shelf, album/track
  search with overlapping names, opening the album, and real queue artwork.
- MPD initially failed to read its Google Drive music folder. System Settings
  already showed its Google Drive permission enabled. Restarting the existing
  launchd service restored file access without changing permissions or config;
  the existing queue survived. Playback then advanced normally and loaded cover
  art. Audible output still awaits the owner's listening confirmation.
- Toolbar controls have a visible focus outline and retain their latest action
  while focused. Native screenshots checked the focus cue and Enter activation.
  A rapid Tab/Enter sequence now waits for native focus to reach its destination;
  tests cover several Tabs in flight and cancelling pending activation. A native
  check of three rapid Tabs followed by Enter opened the expected prompt.
- A native rapid `:` followed immediately by `love ire` retained the full query
  after buffering letters during the input's initial focus frame. Before that
  fix, this sequence could drop the beginning of the query.
- Native resizing checked narrow, short, and short/wide layouts. The prompt's
  input and footer remain visible while its results scroll; keyboard selection
  follows into the viewport. The album shelf also scrolls to its selected row.
- Cover size now reserves space for the metadata and record controls. Short
  windows retain the track, artist and album names; secondary metadata hides
  when the artwork pane is tight. Artwork clicks were checked on the album shelf.
- The feedback pass was checked in the native demo window: integrated titlebar,
  Library Covers/Artists, the separate queue artist link opening My Bloody
  Valentine's three albums, opening Loveless with mixed Vim/arrow navigation,
  returning from its track list to the artist and then Artists, an artist prompt
  result, Command-number navigation, and keyboard grab/drop with the current
  playing song retained. Pointer lag was reduced in code; its new physical feel
  has not received a separate owner acceptance check.
- The follow-up native check confirmed the restored temporary album tab,
  its removal on `Cmd+2`, and `Cmd+1` followed by `m`, `j`, Enter moving a queue
  track while retaining the current song.
- The path refinement was checked by opening Loveless directly from its queue
  album link, retaining the My Bloody Valentine tab, using that tab to return
  to the artist's albums, and clearing the path with `Cmd+2`. Both tabs fit a
  narrower native window; long names shorten while the prompt stays available.
  The sample-library label now responds only to width, so changing pages does
  not shift the permanent navigation buttons.
- A source audit found no UI colour literals outside `src/theme.ts`. The solid
  palette was checked natively; a replacement gradient palette was not applied.

## Current limits

- MPD supplies playback; the UI does not decode audio. Server playback and elapsed
  time were verified after the service restart; owner listening remains distinct.
- The GUI includes queue, library albums/artists, artist albums, album tracks
  and prompt. Playlists, lyrics, waveform, full ranger columns remain
  outside this prototype. No nonfunctional page buttons are shown for them.
- Queue moves use a stable source ID and a freshly resolved destination. MPD has no
  compare-and-swap move command; simultaneous edits by another client can race.
- MPD command lists stop at the first error and do not roll back earlier additions.
  The UI refreshes the queue and reports possible partial additions, without an
  automatic retry. Seeking checks the current ID first, but another client can
  still change playback between that check and the seek command.
- This local app bundle is neither signed for distribution nor notarized.
- The dark study palette is centralized and gradient-capable; the running app
  does not yet change it from artwork.
- The macOS accessibility tree exposed window chrome rather than the app's
  content during these checks. Screen-reader usability remains unverified.
- Two live GUI close checks logged a GPUIX `window not found` error from a pending
  render after the window had closed. Both exited with status zero and retained
  their saved navigation; the separate demo close/reopen checks were quiet.
  The close-time framework warning remains unresolved.
