# Palette runtime and host themes

Grisaille consumes the pinned `notan-palette/1` artifact, retains a usable palette,
and maps it into complete native and terminal themes. Palette changes update
mounted views and input colors through one shared subscription boundary. There
is no interpolation, animation or color regrading. See
[the wire contract](palette-contract.md) for fixture provenance and numeric
validation, and [Evidence runs](#evidence-runs) for validation status.

## Ownership and configuration

Each GUI or TUI process constructs one `PaletteSession` owned by its
`MusicSession`. The existing `useMusic` hook starts and stops the owner.
`usePalette(session)` only subscribes through `useSyncExternalStore`; mounting
more subscribers creates no additional watcher or MPD connection. Directly
constructed music sessions default to a disabled palette source, so tests must
inject fixture sources explicitly.

`ThemeProvider` uses that subscription and memoizes the mapped theme by retained
bundle and association. State-specific providers supply a complete foreground
and background pair to their descendants. They do not own the palette lifecycle.

The host constructor resolves configuration without reading the filesystem:

1. Demo mode disables live discovery, even with an explicit palette override.
   The separate [fixture probe](#run-isolated-host-probes) requires an explicit
   opt-in and injects its own source.
2. A nonempty `MUSIC_UI_PALETTE_PATH` selects an absolute artifact path. A leading
   `~/` expands against the home directory. Invalid nonempty overrides disable
   the source with a configuration diagnostic rather than falling back.
3. Without an override, the default is
   `$XDG_CONFIG_HOME/rmpc-auto-theme/palette/palette.json`, or
   `~/.config/rmpc-auto-theme/palette/palette.json` when XDG is empty/unset.
   Relative XDG paths are rejected.
4. The implicit source is allowed only for the default MPD endpoint,
   `127.0.0.1:6600`. Host/password splitting and numeric port parsing match the
   backend. Other host spellings (including `localhost`), sockets and ports
   require an explicit palette path. Otherwise the source is disabled with:
   `Palette source disabled: non-default MPD target has no bound palette source; set MUSIC_UI_PALETTE_PATH to opt in.`

The explicit path is the operator's assertion that producer and consumer use the
same MPD instance. The artifact carries no server identity, and the consumer
cannot verify this binding. Credentials are never included in binding diagnostics.
No producer CLI, directory creation, configuration write or playback operation
is part of discovery or observation.

## Snapshots and URI association

`PaletteSession.getState()` returns one deeply immutable snapshot containing:

- `latestAttempt`: the last successfully decoded producer attempt, including
  failed and no-art attempts. It survives later read/decode failures.
- `candidate`: the latest readable valid artifact, including a different-URI
  artifact waiting for playback context. Read/decode failures and lifecycle
  stop/restart clear it.
- `retained`: the last complete usable bundle accepted for an observed URI,
  together with its unchanged original producer/track envelope. Null means the
  host should use its default palette; no fallback colors are invented here.
- Playback `context`, candidate `attemptAssociation`, retained
  `bundleAssociation`, source path, lifecycle/monitoring state, and separate
  configuration, read/decode, watcher and decoder-warning diagnostics.

Producer failure information is the failed attempt's `error` (and, for a future
unknown status, `original_status`). It does not overwrite playback errors or
attach the failed attempt's identity to retained colors. `attemptAssociation`
refers to `candidate`; `latestAttempt` remains an explicit history field when
there is no currently valid candidate.

The owner resolves URI only from a newly observed connected snapshot's current
queue item. A stopped player, unresolved ID, connecting state or disconnect has
no active URI association. A paused player with a known URI remains associated.
The owner's previous `MusicState` snapshot can remain available for navigation
while disconnected or restarting; that retained snapshot cannot establish a new
palette association before a new successful backend snapshot.

Association compares `candidate.track.file` to that URI. An accepted bundle's
`bundleAssociation` is `current-uri` only when it is also the matching current
candidate; otherwise it is `retained` (or `default` if none has been accepted).
The consumer does not use sequence high-water marks, wall clocks, artwork hash
comparisons or queue IDs as invented producer event identities.

**v1 proves URI association at the artifact's `generated_at`, not occurrence or
current-art freshness.** If A's published bytes remain on disk through A → B → A
or consumer restart, those bytes may associate with A again. A queue-ID change
cannot remove that wire-format ambiguity. A new process's lower producer
sequence is valid. A same-art envelope for another URI is still a distinct
candidate and only associates when that URI is observed.

## Retention table

| Event | Bundle/provenance | Association/diagnostic |
|---|---|---|
| Matching `ok` | Accept the whole decoded bundle | URI-associated, without a stronger freshness claim |
| Matching `no-art` with verified bundle | Accept its complete bundle | Preserve no-art status and null artwork hash |
| Matching `no-art` without bundle | Retain last usable, otherwise default | Current candidate is no-art; retained identity stays unchanged |
| Matching `failed` or unknown-status projection | Retain last usable/default | Failed attempt and warnings remain separate; never adopt its payload |
| Failure with null identity | Retain last usable/default | Unknown association, not an invented current-track failure |
| Valid artifact for another URI | Keep the candidate separate | Reconsider it when playback context changes |
| Invalid/missing/unreadable artifact | Retain last usable/default | Clear candidate; preserve latest decoded attempt as history; report read/decode problem |
| Track change, stop, disconnect, unresolved current ID | Retain last usable/default | Clear active association unless a valid waiting candidate matches the newly observed URI |
| Pause with known current URI | Keep association | No palette reset |
| Consumer stop/restart | Retain last usable/default, clear candidate and active association | Invalidate old work, reattach and re-read; await new playback context |

## File observation and cancellation

MusicSession attaches its backend observation before palette startup. The palette
source watches the artifact's parent directory before the initial read. File
notifications are invalidations: duplicate events, temporary siblings and absent
filenames all trigger coalesced reads of the configured artifact. The replaceable
artifact inode is never watched directly. Directory device/inode checks before
and after attachment and on every notification detect replaced parents.

Each active lifecycle serializes reads with one dirty follow-up. A newer file
notification or relevant playback-context change invalidates the pending read's
commit. Lifecycle and revision guards are checked before publication. Identical
raw content reuses the decoded immutable artifact, but URI association is still
reconsidered when playback context changes. Volume and elapsed-time updates do
not trigger reads.

Missing/deleted/replaced parents and watcher error/close events detach the old
watcher and schedule one cancellable retry at 1, 2, 4, 8, then 10 seconds. Retries
continue at the 10-second cap while the app is active; successful attachment
resets the backoff and triggers a read even without a player event. A missing or
invalid file with a healthy watcher retains state and waits for the next
invalidation. There is no healthy-file polling, daemon or producer invocation.
Filesystem notification delivery remains a platform dependency; a healthy
watcher alone does not prove a publisher exists or will publish.

Stop cancels the adapter's timer, closes its watcher, clears association and
invalidates pending reads. An old callback or promise cleanup cannot alter or
clear a restarted lifecycle's task. The source and palette session have no
playback mutation capability.

## Map a complete theme

[`mapPaletteToTheme`](../src/theme.ts) is a pure function: an accepted snapshot
goes in and one deeply immutable theme comes out. Its input is `retained` plus
`bundleAssociation`; it does not select a wrong-URI `candidate` or a failed
`latestAttempt`. It has no React or host dependency, filesystem access, clock or
lifecycle. Provenance preserves the retained bundle's URI, artwork hash, sequence,
producer revision and association, including when an individual state needs a
neutral fallback.

The decoder establishes the truth of declared numeric checks. The mapper then
requires the **named foreground/background pair and its declared floor**:

| Use | Required pair | Minimum declared contrast floor |
|---|---|---|
| Ordinary text | `text` / `background` | 4.5 |
| Playing or active text | `highlight_text` / `active` | 4.5 |
| Selected text | `highlight_text` / `selection`, plus the `selection` feature and role | 4.5 |
| Muted or placeholder text | `frame` / `background` | 4.5 |
| Accent, caret and warning text | `accent` / `background` | 4.5 |
| Ordinary border | `frame` / `background` | 3.0 |
| Ordinary non-text marker | `active` / `background` | 3.0 |

If a secondary ordinary color lacks the required proof, it uses the admitted
ordinary text foreground. A frame pair declared only at 3.0 is insufficient for
small muted text, even if its measured contrast happens to be higher. Active and
selected states use their winning pair's foreground for all text tones, links,
durations and markers. Their 4.5 text proof also covers the 3.0 marker floor on
that state's background.

A missing primary pair replaces the **whole affected state** with a neutral
bundle, including descendant text. It never combines a neutral fill with album
text. Neutral text, markers and borders are checked locally using IEC sRGB
relative luminance at the final hex bytes; they are not producer-verified colors.
Role presence alone is not proof, and `inactive` or `frame` never stands in for
selection.

### State precedence

Both hosts apply the same rules:

| State | Complete pair | Additional cue |
|---|---|---|
| Ordinary row, panel or input | Ordinary | None |
| Playing queue row, not selected | Active | Playing marker |
| Selected row, not playing | Selected | Selection/focus cue |
| Playing and selected | Selected wins | Playing marker in the selected pair's foreground |
| Active lyric, not manually selected | Active | Active-line marker or border |
| Manually selected lyric, not active | Selected | Reading selection |
| Active and manually selected lyric | Selected wins | Active-line marker or border in the selected pair's foreground |
| Ancestor or context row | Ordinary | Separate context marker or border |
| Hover | Keep the existing pair | Pointer or outline cue; never override selection or active state |
| Held source, insertion and floating held row | Preserve the source or destination's applicable pair | Drag cue; native source opacity is separate |

The native floating drag row preserves its source's selected/playing pair and
playing marker at full opacity. The ghosted source retains the same pair at
opacity 0.45. The native progress track uses the ordinary background, with an
ordinary border outline; its fill uses the admitted ordinary accent. This keeps
the fill's proof tied to its actual backdrop, including monochrome palettes.

The following bytes describe the existing synthetic
[`ok.json`](../tests/fixtures/palette/ok.json) fixture and neutral defaults:

| State | Fixture text / background | Neutral text / background |
|---|---|---|
| Ordinary | `#f8d700` / `#140200` | `#dce0e3` / `#242a30` |
| Active | `#00160a` / `#a58f00` | `#dce0e3` / `#282f36` |
| Selected | `#00160a` / `#dfa039` | `#dce0e3` / `#3c515f` |

For this fixture, ordinary accent/caret/warning is `#00ca80`; muted and placeholder
text fall back to `#f8d700` because the frame pair declares only 3.0. The border
remains `#7a6900` and the ordinary marker is `#a58f00`. Neutral ordinary muted text
and borders use `#a0adb6`, accent/caret uses `#b4d3e5`, and warning uses `#e4bda8`.
Neutral highlighted states use `#dce0e3` for every text tone.

## Native inputs and composition

GPUIX 0.7 hardcodes its native placeholder color. `ThemedInput` therefore keeps
the native placeholder empty and draws a themed, pointer-transparent text
overlay while the controlled value is empty. The native editor retains its
identity, caret, selection and platform composition behavior. A palette update
must repaint the placeholder and caret without losing the input ID, query or
typing focus.

The first delivered change synchronously hides the overlay and echoes the exact
value. Hiding stays latched until blur, including after an empty change; clearing
a focused input can therefore leave its placeholder hidden until blur. This
conservative behavior prevents the overlay from returning between pre-edit
transitions when the host exposes no composition-end event.

The real composition check uses the existing U.S. input source: OS Option-E
starts underlined acute pre-edit, a palette publication lands while it remains
pending, and OS E commits `é` in the same native input. The primary evidence is
that functional sequence, with screenshots and the event log tied to the tested
binary. Plain Unicode insertion or tree props alone do not demonstrate it.

Timing is supplementary: report only **same-native-clock arm-to-handler and
arm-to-captured-absence upper bounds**, including controller handoff and capture
overhead. Isolated bridge latency cannot be measured because GPUIX 0.7 exposes
neither native event-emission nor presentation timestamps. There is no same-frame
or zero-transient guarantee. A screenshot establishes the observed frame, not
every preceding frame.

Focus/blur callbacks need OS window activation and a completed GPUI draw.
Synthetic typing can work in an inactive window without those callbacks. The
background automation run therefore checks query retention and the empty-value
latch; reset after blur is checked separately in an OS-activated interactive
probe. See the pinned [focus-event dispatch](https://github.com/remorses/zed/blob/8b94defe56992b3ca4ffd4853ace741d8168111a/crates/gpui/src/window.rs#L2951-L2990).
A screenshot rasterizes the existing rendered scene; it does not itself guarantee
that a new focus transition has been drawn.

GPUIX 0.7's automation `simulate_click` can abort in its MouseUp path with
`double_lease_panic<GpuixView>`. The automated capture opens the prompt with the
ordinary keyboard command. Actual click-through and composition use OS input
targeted only at the probe window. The script records child stderr and rejects
pending automation calls if the process exits; it does not treat a crash as a
successful capture. Automation calls have a 30-second timeout; pixel adoption
waits are bounded by 45 seconds plus an in-flight call. These are capture limits,
not a product response-time guarantee. Earlier runs retained stale pixels or
timed out; their failed reports are preserved in the evidence record.

## Host encoding and composites

Mapped role colors are opaque `#RRGGBB` sRGB bytes. The native adapter passes CSS
hex strings and theme props to GPUIX; the terminal adapter passes hex colors to
OpenTUI. OpenTUI parses channels as 8-bit RGB, and the PTY probe checks emitted
truecolor ANSI background values. The mapper currently emits no gradients.
The portable paint type permits them, but the terminal adapter still uses only
the first stop. No whole-gradient contrast or fidelity is established.

On the pinned macOS Metal path, solid quads carry straight RGBA. RGB blends as
`source * alpha + backdrop * (1 - alpha)` in the supplied encoded channel values,
into `BGRA8Unorm`, subject to quantization. This is not linear-light sRGB blending.
The alpha attachment uses additive `One`/`One` factors, so do not generalize the
opaque-backdrop RGB formula into a claim about transparent output alpha. See the
[pinned quad shader](https://github.com/remorses/zed/blob/8b94defe56992b3ca4ffd4853ace741d8168111a/crates/gpui_apple/src/shaders.metal#L100-L119),
[target format](https://github.com/remorses/zed/blob/8b94defe56992b3ca4ffd4853ace741d8168111a/crates/gpui_apple/src/metal_renderer.rs#L286-L293),
and [blend factors](https://github.com/remorses/zed/blob/8b94defe56992b3ca4ffd4853ace741d8168111a/crates/gpui_apple/src/metal_renderer.rs#L1288-L1296).
That Zed commit is the submodule pinned by GPUIX 0.7 commit
`a24b4a42eb516c7b940eb8d34ecebb077df623bd`.

The four composite families below are separate from opaque-pair guarantees.
Each tuple is `(overlay, alpha, backdrop)`; `foreground / fill` names a whole
source-row pair, not one precomposited swatch.

| Family | Synthetic `ok.json` tuple | Neutral tuple |
|---|---|---|
| Native prompt scrim | `(#000000, 112/255, #140200)` | `(#000000, 112/255, #242a30)` |
| Native input selection | `(#7c86ff, 89/255, #140200)`; input text `#f8d700` over the result | `(#7c86ff, 89/255, #242a30)`; input text `#dce0e3` over the result |
| App text-selection wash, where selection is enabled | `(#00ca80, 89/255, #140200)` ordinary; `(#00ca80, 89/255, #a58f00)` active; `(#00ca80, 89/255, #dfa039)` selected | `(#b4d3e5, 89/255, #242a30)` ordinary; `(#b4d3e5, 89/255, #282f36)` active; `(#b4d3e5, 89/255, #3c515f)` selected |
| Ghosted native held source | `(#f8d700 / #140200, 0.45, #140200)` ordinary; `(#00160a / #a58f00, 0.45, #140200)` active; `(#00160a / #dfa039, 0.45, #140200)` selected | `(#dce0e3 / #242a30, 0.45, #242a30)` ordinary; `(#dce0e3 / #282f36, 0.45, #242a30)` active; `(#dce0e3 / #3c515f, 0.45, #242a30)` selected |

The prompt panel itself is opaque. The held-source opacity includes its
descendants and artwork; the opaque floating row supplies the readable drag
content. These tuples do not assert contrast for every composited pixel or
artwork backdrop, and producer verification of these families remains separate.

Native input selection is **hardcoded and cannot be themed through the current
API**: the pinned editor uses `#7c86ff59`, ignoring `style.selectionColor`.
It does not derive the wash from the input accent. See
[input.rs:1734](https://github.com/remorses/gpuix/blob/a24b4a42eb516c7b940eb8d34ecebb077df623bd/packages/native/src/custom_elements/input.rs#L1730-L1742)
and the [RGBA byte conversion](https://github.com/remorses/zed/blob/8b94defe56992b3ca4ffd4853ace741d8168111a/crates/gpui/src/color.rs#L19-L23).
The app text-selection wash instead inherits the root's ordinary accent, even
over another state background. Terminal input selection uses the opaque selected
pair through `selectionFg` and `selectionBg`; it does not reproduce either native
alpha wash. Composite contrast and cross-host visual equivalence remain unverified.

## Run isolated host probes

Use the repository's installed Bun, Python 3, and Pillow for native PNG sampling.
Build and package before capturing; the native script launches the packaged
executable, while the terminal script launches `dist/music-ui` in a real PTY:

```sh
./node_modules/.bin/bun run build
python3 scripts/package-mac.py
./node_modules/.bin/bun scripts/capture-theme-native.ts
python3 scripts/capture-theme-terminal.py
```

Both scripts create and preserve a new private temporary directory and print its
report path. They use the labeled synthetic
[`host-ramp.json`](../tests/fixtures/palette/host-ramp.json), atomically publish
complete artifacts for `sample/loveless/0`, and record binary/fixture hashes.
Native captures include PNG samples and input identity/typing checks. Terminal
captures retain raw ANSI, expected RGB observations, process exit and terminal
restoration. The terminal environment is `TERM=xterm-256color` and
`COLORTERM=truecolor`; this proves serialization, not emulator pixels.

The only probe opt-in is `--demo --theme-probe` with an absolute
`MUSIC_UI_THEME_PROBE_DIR`. Missing or relative paths and a probe without `--demo`
are refused. The probe injects `<directory>/palette.json`; it never discovers a
live source. Saved browsing state and navigation journals use that directory's
`state/` and `navigation/` subdirectories. Ordinary `MUSIC_UI_STATE_DIR` alone
does not isolate the navigation journal. Native `native-events.jsonl` records
probe input values, so use synthetic queries. File notifications and read hashes
are recorded separately in `diagnostics/source.jsonl`, below the watched directory.
Normal runs leave both diagnostics disabled.

For a real composition check, supply a new absolute output path:

```sh
./node_modules/.bin/bun scripts/capture-theme-native.ts /absolute/path/to/new-evidence --interactive
```

Verify that the printed probe PID is still running before binding a UI tool:
some app-binding tools launch a normal app when the probe has already exited.
The script prints the probe PID and accepts `capture NAME`, `white`, `dark`,
`blur`, `arm-white` and `quit`. With the empty prompt focused, `arm-white` waits
for real acute pre-edit and publishes the white palette. Send OS Option-E only
to that probe window, retain the pending pre-edit for the capture, then send OS E
and capture completion. Preserve the input ID, screenshots and event log together.
Do not change system input-source configuration to run this check.

## Evidence boundary

Pure mapping tests, host-binding tests, native pixel captures and PTY output are
separate evidence. PNG sampling records pixel mode, dimensions and profile keys;
it compares decoded bytes without a color-profile transform. A capture without
an embedded profile does not establish a calibrated colorimetric result. Neither
native PNGs nor PTY bytes prove physical-display fidelity or owner visual
acceptance. Opaque endpoints do not prove alpha composites or whole gradients.

Genuine producer-capture conformance remains the separate AI-IMP-019 gate.
Synthetic fixtures, including real renderer output from them, do not close it.

### Evidence runs

The IMP003 candidate letter pins the implementation revision and repeated
submitted-head gates. Before that commit, the complete product gate passed:
`npm run typecheck`, `bun test` (155 pass, 0 fail, 1048 assertions, 17 files),
`bun run build` (188 modules), and `python3 scripts/package-mac.py`.

The final-source host captures used binary SHA256
`cad391b2cd5d4adb476b5d27a0a6c9b7711a91f0508bf9422c6ba1e813bb5463`
and synthetic ramp SHA256
`a4703b0f6d62100d963e9e053b16c05dbd9c19285cad9d3288306c4204d5b0c3`.
All following paths are preserved local evidence from 2026-10-09.

| Capture | Observed result | Report SHA256 |
|---|---|---|
| `/tmp/grisaille-imp003-native-candidate-20261009/report.json` | 22/22 canvas patches match exact expected RGB; later input `getTree` timed out after 30 seconds, so the overall script report is **failed** | `2e23b1ca23dabfa5800b442dbca8a864861b8a39b3ddc92ba0fe1480ff9d3013` |
| `/tmp/grisaille-imp003-terminal-complete-20261009/report.json` | 22/22 truecolor values; normal exit 0; termios, alternate screen and cursor restored; private state and journal present; overall report passed | `3125ac582c627480c5a8c16568920422519d3a8e14712ca8705822e53ccc40b4` |

Native PNGs are 2240×1640 RGBA, with no embedded profile keys. A fixed 4×4 patch
at physical pixel (10,200) matched every ramp case. The PTY's 195133-byte
`session.ansi` has SHA256
`b2a1b06e6b6de51eb31c4178d900e19ae6c106c4d2d3c5f3c71ae3321edac6e5`.

The native input screenshots in that candidate run show the placeholder changing
from `#f8d700` to `#000000`: its input rectangle contains respectively 3033 and
2677 exact foreground pixels. The input event log records `theme`, followed by
the palette read and then `themex` on native input 231. The later query timeout
prevents claiming that this automated run completed the empty-latch check.
An earlier all-22 run at `/tmp/grisaille-imp003-native-traced-20261009` reached
that check, then failed its inactive-window blur assertion. Failed runs remain
failed; their successful observations are identified separately.

The OS-activated blur trial is
`/tmp/grisaille-imp003-blur-r2-20261009`, using binary SHA256
`a1c7200b68d8c26cce2b1e3b1b6dbf7f98716e2e7753e7440a55de850a342429`.
Its empty input 346 has no overlay; the delivered blur restores the overlay on
the same input. `empty.png` SHA256 is
`e74e490692ba45ba0292b7b6ae2d952dd7f69ba183d038137be74083f3807e4f`,
`blurred.png` is
`a450a09142a3def2506dde1c4efd3951442c0761cd400167b0e3a0fa9f26fba5`,
and `probe/native-events.jsonl` is
`bb8655a5520d0a9ee2333224546143d330c1a8a17de3dc19df7cc32c8796ae07`.

The real dead-key trial is `/tmp/grisaille-imp003-ime-r4-20261009`, using binary
SHA256 `00c5848bb1e4ab127cfd7e8fc0de29f8ddb4f7f69cea6c295ca3184f60d738d0`.
Input 346 emitted acute pre-edit, retained it through the white-palette
publication, and committed `é`. The two screenshots and event log have SHA256:

- `composition-publication.png`:
  `db982f56d2e0bb5c05c3a8742fcf5d8b5fe70ceaddeb4efcdbfccece4e8a0100`.
- `composition-completed.png`:
  `3e2d440ccb2cca88ece6d6453ea6d1e47199286ec65e6043ebe958c14d7f37d4`.
- `probe/native-events.jsonl`:
  `c4fa207fb2f25675395958ec9fbe16f9a8be55dfcc80b9f6eafbcdbee25bc86d`.

The completed screenshot's 4×52 caret rectangle at (537,509) is entirely
`#000000`, matching the newly published input theme. Pixel sample details are
`/tmp/grisaille-imp003-field-pixels-20261009.json`, SHA256
`f627001cb375eb5ba0929c71ebea5019ff5164b9c17225196da21811ce0e0b35`.
The same-native-clock arm-to-handler and arm-to-captured-absence upper bounds
were 11.239 and 16.469 seconds, including controller handoff and capture overhead;
the functional composition sequence is the primary evidence. The IME and blur
trials used earlier binaries, before later unrelated seek/drag or probe changes;
the input helper was unchanged. They are not represented as final-binary reruns.

Intermittent native capture stalls remain a limitation. One failed run's source
trace confirms a notification and read of the new artifact before an automation
timeout; a sampled stalled process was inside the pinned AppKit event pump.
Those observations do not isolate a general cause or prove an application
regression. No dependency change, latency guarantee or upstream issue filing is
claimed. A later script-only diagnostic change preserves the last completed
input phase even when a subsequent call fails; it does not rewrite these reports.
