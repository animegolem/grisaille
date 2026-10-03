# Palette subscription runtime

IMP002 consumes the pinned `notan-palette/1` artifact through the decoder in
`src/palette-contract.ts`. It supplies data and diagnostics to subscribers.
Host color mapping and animation belong to IMP003; this runtime does not change
the GUI or TUI theme. See [the wire contract](palette-contract.md) for fixture
provenance and numeric validation.

## Ownership and configuration

Each GUI or TUI process constructs one `PaletteSession` owned by its
`MusicSession`. The existing `useMusic` hook starts and stops the owner.
`usePalette(session)` only subscribes through `useSyncExternalStore`; mounting
more subscribers creates no additional watcher or MPD connection. Directly
constructed music sessions default to a disabled palette source, so tests must
inject fixture sources explicitly.

The host constructor resolves configuration without reading the filesystem:

1. Demo mode always disables live discovery, even with an explicit override.
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

## Evidence boundary

The sitting exercises synthetic contract fixtures, deferred reads and callbacks,
controlled clocks, and real temporary-directory file and parent replacement.
MusicSession integration checks assert zero playback calls and one owned
subscription with multiple listeners. GUI/TUI constructor wiring is shared and
built, but live painting, color ramps and owner visual acceptance belong to
IMP003. Genuine producer-capture conformance remains the separate AI-LOG-002 gate;
fixture-level tests do not close it.
