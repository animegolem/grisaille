# Music UI prototype

A separate frontend experiment using GPUIX 0.7.0, React and Bun 1.4.2.
MPD owns audio decoding, playback and output. nowplayd remains the independent
macOS media integration. Neither existing repository was changed.

## Run

The compiled app does not need Bun installed. From this directory:

```sh
./dist/music-ui --demo
./dist/music-ui
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

The prototype currently uses the installed `mpc` executable for library reads,
artwork and MPD event subscriptions. It uses MPD's stable song IDs for playback
and queue moves. `MPD_HOST` and `MPD_PORT` select the server; mpc's
`password@host` convention is supported. Nothing changes the MPD configuration.

This is a GUI launched from a shell or a macOS app bundle. It does not render a
terminal interface. The model and MPD adapter are separate from GPUIX so another
renderer could use them later.

## Interaction

- `Cmd+1` opens Now playing; `Cmd+2` opens Library. Bare numbers do not change pages.
  `Cmd+3` is reserved for a future Lyrics view and currently has no app action.
- Library has Covers and Artists views. Artist links open that artist's albums,
  in year order; album links open its track list. They are separate focus targets.
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
- Space toggles playback. Album and artist text navigate into the library.
- In the queue, `m` grabs the selection; arrows and `hjkl` move it, Enter drops
  and Escape cancels. Left/Up/`h`/`k` move earlier; Right/Down/`l`/`j` move later.
- The small handle starts a pointer drag. Reordering preserves the current song ID.
  Pointer preview position follows unsnapped motion without easing; only the
  insertion target snaps. Keyboard moves retain the short held-row transition.

## Local navigation journal

Navigation appends to `~/Library/Application Support/Music Prototype/navigation/`
in daily JSONL files. Each entry has a timestamp, session ID, sequence, backend
mode, action, source and destination. Locations include the selected item and,
on page transitions, the viewport. Typed queries and playback commands are not
recorded. The directory is created with mode 0700 and new files with mode 0600.

The back/forward stack holds up to 200 places in the current app session. The
journal persists across launches, including discarded forward branches; it is
not replayed on launch. Missing albums fall back to Library, and removed queue
items fall back to the nearest surviving selection. Journal write failures
appear in the status bar without blocking navigation.

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

## Verification on 6 September 2026

- TypeScript check, standalone build and nineteen tests pass (65 assertions), covering
  model/MPD behavior, artist grouping/search, keyboard/grid semantics, pointer
  insertion, delayed native focus and history. The packaged window opens with artwork.
- Native history checks opened Loveless from Now playing, returned directly
  to the previously selected queue row with `o`, and reopened the selected album
  track with `i`. Repeating after scrolling to the last track retained both the
  selection and viewport. The playing occurrence and paused state were unchanged.
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
- Read-only MPD checks returned 18,404 library tracks and the existing 12-song
  queue. All interactive checks used the sample backend; the real queue was
  not modified by this work.
- Toolbar controls have a visible focus outline and retain their latest action
  while focused. Native screenshots checked the focus cue and Enter activation.
  A rapid Tab/Enter sequence now waits for native focus to reach its destination;
  tests cover several Tabs in flight and cancelling pending activation. A native
  check of three rapid Tabs followed by Enter opened the expected prompt.
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

- The local MPD server can supply its database but currently reports an OS permission
  error opening a music file. Actual audio output has not been verified.
- The GUI includes queue, library covers/artists, artist albums, album tracks
  and prompt. Playlists, lyrics, waveform, full ranger columns and a TUI remain
  outside this prototype. No nonfunctional page buttons are shown for them.
- Queue moves use a stable source ID and a freshly resolved destination. MPD has no
  compare-and-swap move command; simultaneous edits by another client can race.
- This local app bundle is neither signed for distribution nor notarized.
- The dark study palette is centralized and gradient-capable; the running app
  does not yet change it from artwork.
- The macOS accessibility tree exposed window chrome rather than the app's
  content during these checks. Screen-reader usability remains unverified.
- Library metadata is loaded at startup. Restart after changing the MPD database.
