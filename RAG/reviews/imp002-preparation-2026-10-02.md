# IMP002 preparation for Notan — 2026-10-02

From: Grisaille Code Lead (Astra seat)

Status at preparation (2026-10-02): owner-authorized read-only preparation;
held for later handoff while Notan's usage reset was pending. The owner released
that hold on 2026-10-03; see `.inbox/tofable/imp002-preparation-r1.md` for the
handoff. Preparation does not itself establish delivery or acknowledgment.

**Recommendation:** issue a bounded IMP002 sitting after the four dispositions
below. The decoder is available and a stored producer capture decodes cleanly.
The remaining work is runtime ownership, file observation, playback association,
and honest retained-state reporting. Host color mapping stays in IMP003.

For a short disposition reply, the four questions are:

1. Confirm v1 URI association and reconcile the older occurrence-freshness wording.
2. Admit read/watch-only startup, explicit source binding, and capped app-owned recovery.
3. Adopt or amend the retention table below.
4. Pin the runtime wiring scope and place the separate capture-conformance gate.

This is preparation for a brief, not an assignment or implementation start.
No ticket, specification, product source, producer service, or MPD setting was
changed. No new identifier was allocated.

## Inputs and current state

- Canonical Grisaille: `d41b0875d472030c2eec8d78f50cf2bf7d3fda76`.
  Existing unrelated working-tree material was preserved.
- Existing independent clone: `.workspaces/code-lead/primary`, branch
  `imp/018`, head `d647f4b85e0d28bb331a58b39070ce3be5126029`, tracked tree clean.
  No fetch, branch change, or cleanup. Its decoder, music-session, model, MPD
  backend, and session tests were byte-equal to canonical for this inspection.
- Ratified RMPC contract digest remains
  `1ea902c71fcd75e6791112d4621b6b9fcd67ba12896979fe43cf7c6d34d3821a`, matching
  Grisaille r23 and `docs/palette-contract.md:26-35`. All nine original fixture
  files still match the producer copies byte-for-byte; the local tenth fixture
  remains separately identified as synthetic.
- `RAG/WORK-LEDGER.md` has no open product sitting. A manual channel scan found
  zero new events, zero unacknowledged events, and zero active leases.
- This develops the existing sprint round-1 findings 5–7 and fold F5–F7;
  it does not report those known questions as newly discovered regressions.

Producer paths below are relative to `/Users/golem/git/RMPC-Auto-Theme`.
They were read only; no producer Git operation, build, or CLI execution occurred.

## Four dispositions needed in the brief

### 1. State precisely what freshness the v1 contract proves

The ratified contract says to associate `track.file` with the consumer's observed
MPD URI; the association concerns that URI at `generated_at`, not verified
current artwork. `sequence` is debug-only with no cross-restart meaning, and v1
expressly excludes playback-event identity (contract:17-42 and Non-goals).
Fold F5/F6 accepts this mechanism and does not require shared artwork hashing
(`RAG/reviews/sprint-001-fold.md:79-95`). Preserve that ruling.

The older ticket's “playback generation/art identity” wording needs to distinguish
consumer job cancellation from artifact freshness. `MusicSession.generation`
changes only at lifecycle start/stop (`src/music-session.ts:39-55`). A new local
context epoch can invalidate old async work, but cannot certify old file bytes
as belonging to a new occurrence of the same URI. `Snapshot` exposes a queue ID
and playback state, not a shared producer event identity (`src/model.ts:21-28`).

Concrete counterexample to a stronger claim:

1. A's palette is already published and accepted.
2. Playback moves A → B → A while newer publication is pending.
3. A new read starts in the latest consumer epoch and returns the still-present
   old A artifact. URI, lifecycle epoch, and read revision all match.
4. Producer last-event-wins prevents obsolete work from publishing later; it
   does not remove the artifact that was published before the new admission.

The same ambiguity exists at consumer restart with an old same-URI file.
Wall-clock comparisons, queue IDs, a consumer counter, and a lifetime sequence
high-water mark cannot create the missing shared identity. Current producer
source persists an admission sequence, but that implementation detail must not
silently strengthen the contract (`src/publisher.rs:227-289`).

**Proposed disposition:** retain v1 URI association and explicit retained/source
provenance. Name it association, without claiming occurrence/current-art
verification. Reconcile the broad generation wording in SPEC §4.6/§8.2 and the
ticket through the Review Lead's normal amendment process. If strict occurrence
freshness is intended, a separately ruled mechanism is needed before promising
that acceptance. This is an acceptance-language issue left by the existing F5
resolution, not a proposal to reopen the wire format by implementation fiat.

### 2. Choose path binding and the startup/recovery policy

Contract:36-49 permits waiting for the next producer event or explicitly invoking
`--publish-current`. The latter is not admitted by IMP002's current
no-producer-orchestration fence (ticket:25-27).

**Proposed disposition for this sitting:** read/watch only; no producer commands.
Use an injected explicit path, with a documented environment override and the
producer's default path convention. The default honors `XDG_CONFIG_HOME`, then
`~/.config/rmpc-auto-theme/palette/palette.json` (producer `src/config.rs:329-337`).
Leave any automatic `--print-config`/`--publish-current` integration for an
explicitly extended scope. Waiting for publication may last indefinitely; a
healthy watcher is not evidence that a publisher is running.

Bind the configured palette source to the same MPD instance as the backend.
Neither artifact nor decoder includes a server identity. Both applications can
be pointed at another server through their process environments
(`src/mpd.ts:79-85`; producer `src/publisher.rs:755-756`). An equal URI from a
different library is not sufficient association. The brief should document the
operator/configuration assumption and behavior for non-default MPD targets;
do not claim to verify a server identity absent from the wire.

Disable live palette-file discovery in demo mode; tests/demo may inject a fixture
source. Never create producer directories. On missing directory, deleted/replaced
parent, or watcher error, reattach with one cancellable bounded-backoff timer.
Propose 1/2/4/8/10-second delays, capped at 10 seconds while the app is active,
reset on successful attachment; no daemon or background service. Specify whether
this capped retry continues until stop or exhausts a fixed count. Recommendation:
continue at the cap so recovery does not require another player event.

### 3. Ratify the state/retention table

Separate the latest decoded attempt, the retained usable bundle with its original
identity, and the current playback association. Keep read/watch errors separate
from playback connection errors. A single published immutable snapshot should
contain these together; a failure must not relabel retained colors as its own.

Proposed behavior (all rows subject to dispositions 1 and 2):

| Event | Bundle and provenance | Diagnostic/association |
|---|---|---|
| Matching `ok` | Accept whole decoded bundle | URI-associated; no stronger freshness claim |
| Matching `no-art` with verified bundle | Accept that complete bundle | Preserve `no-art`; do not describe it as artwork-derived |
| Matching `no-art` without bundle | Retain last usable, otherwise default | Current attempt is no-art; retained identity stays unchanged |
| Matching `failed` or unknown-status projection | Retain last usable/default | Record failure, never adopt its palette payload |
| Failure with null identity | Retain last usable/default | Producer failure of unknown association, not invented current-track failure |
| Valid artifact for another URI | Keep latest candidate separate | No current association; reconsider after playback context changes |
| Invalid/missing/unreadable artifact | Retain last usable/default | Separate read/decode problem; invent no artifact identity |
| Track change, stop, disconnect, unresolved current ID | Retain last usable/default | Remove active association; distinguish waiting/stopped/disconnected |
| Pause with known current URI | Keep existing association | No unnecessary reset |
| Consumer stop/restart | Invalidate old work and clear active association | Reattach/re-read in new lifecycle; no playback action |

Resolve current URI only from a ready, connected snapshot's current queue item.
Disconnected `MusicState` deliberately retains its old snapshot
(`src/music-session.ts:65-77`; `tests/session.test.ts:66-88`), so inspecting
`snapshot.currentId` alone is insufficient. A full state table also prevents
“no art” from being reported as a producer failure.

### 4. Pin ownership, file scope, and the capture gate

Propose one PaletteSession per MusicSession lifetime. MusicSession owns its
start/stop and supplies read-only playback context; consumers subscribe without
starting another MPD subscription. `useMusic` already starts/stops MusicSession
(`src/music-session.ts:130-142`); a palette hook must not call it again.

Both hosts construct their own MusicSession (`src/app.tsx:27-31`,
`src/terminal/main.tsx:11-18`). Declare these constructor/injection seams in the
brief if runtime wiring is part of IMP002. The current proposed-files list omits
the terminal entry point. Shared ownership means one per app instance, not one
watcher shared across separate GUI/TUI processes.

Suggested scope for the Review Lead to assign:

- `src/palette-session.ts`: immutable state, injected source/context, retention,
  read scheduling and lifecycle guards.
- `src/palette-file.ts` (additional proposed boundary): read-only path/watcher
  adapter, reattachment and bounded recovery; no producer invocation.
- `src/use-palette.ts`: subscription only through `useSyncExternalStore`.
- `src/music-session.ts` and the two host construction seams: ownership only.
- Focused session/file tests and a consumer runtime document; leave
  `src/palette-contract.ts` and the pinned fixtures unchanged unless a separately
  evidenced decoder defect receives a ruling.

No reason found to change `src/model.ts` or `src/mpd.ts` for the accepted URI
association contract. Mapping colors, state-pair precedence, reactive replacement
of `const C`, native input repaint, and color ramps remain IMP003 (fold F8–F10).

The genuine-capture gate is still explicitly open in
`RAG/AI-LOG/AI-LOG-002-two-sittings-and-the-fold.md:30-36`. Decide whether to issue
it before IMP002 or alongside it. This preparation demonstrates decoding stored
bytes, not producer regeneration, live event ordering, or owner visual acceptance.

## Async implementation constraints to carry into acceptance

Attach playback observation and the parent-directory watcher before initial
read. Treat notifications as invalidations, including absent/ambiguous filenames;
do not assume one event equals one artifact or watch the replaceable file inode.

Use a serialized read with a dirty follow-up, lifecycle epoch and invalidation
revision. A newer notification or relevant context change invalidates a pending
commit. Check all guards immediately before publishing one snapshot. Deduplicate
content independently of reconsidering its association: identical file bytes
still need reevaluation when playback context changes. Do not drop a restart's
work from an older promise's cleanup; MusicSession's task-identity check is a
useful existing pattern (`src/music-session.ts:79-81`).

Stop must close watcher/context subscription, cancel retry, invalidate in-flight
reads, and prevent old callbacks from altering restarted state. File adapter and
session must have no access to playback mutation methods. Handle a throwing
diagnostic callback separately from malformed data, matching the decoder's
documented distinction (`src/palette-contract.ts:277-284`).

## Required evidence in the future sitting

| Case family | Required observation |
|---|---|
| A → B, late A; candidate before context | Wrong URI never becomes associated; valid waiting candidate can be reconsidered |
| A → B → A; repeated URI/queue ID; restart | Explicit v1 freshness limit honored; no fabricated event identity |
| Same art, different URI; producer sequence reset | Fresh envelope handled; no cross-process sequence rejection |
| Read completion after notification/context change | Old read cannot publish; one follow-up consumes latest state |
| Atomic rename, duplicate events, `.tmp` noise | Whole snapshots only; actual temporary-directory replacement exercised |
| Missing/deleted/recreated parent and watcher error | Recovery without producer mkdir, playback action, or required MPD event |
| Invalid/schema-unsupported/failed/no-art variants | Retention and diagnostics match the table, including unknown identity/status |
| Stop/restart with deferred reads and callbacks | No stale notification, leaked watcher/timer, or old cleanup clobbering new work |
| Two subscribers; both hosts; demo | Single owner per app; normal teardown; demo never opens live palette source |
| Source mismatch and disconnected retained snapshot | No false association from wrong MPD source or stale connection state |

Use deterministic fake scheduling plus a real temporary-directory rename test.
Assert zero backend playback calls, full snapshot coherence, and cleanup counts.
Actual GUI/TUI paint and ramp evidence belongs to IMP003, while IMP002 still
needs its assigned product gates and independent submitted-head review.

## Checks actually performed for this preparation

Source/contract/brief inspection and hash checks only, plus one pure-decoder probe
using Bun 1.4.2 in the existing independent clone. No product suite, build/package,
native/TUI launch, live MPD request, or producer generation was run. No fresh
overall test-pass claim is made.

Stored producer capture `fixtures/chromatic-palette-capture.json`:

- SHA256 `4cbdfbcede60f99b215affc81c88c93f97e3158c34721bf7b4a61174aa2efe7b`.
- Decoded art SHA256 `517adccc702a83ff23028bd5488c0d28dfd0edcb44326c80cfe32ca099b42fba`,
  matching both the capture's `track.art_sha256` and the recorded provenance.
- Encoded art SHA256 `203f0a98b323632d677575a77e8d4892e6eae830ffaff4dde59791fea9115a10`;
  base theme SHA256 `5d8413dae4e244f234f05081a36779839b2a2e1f82abdaf90eee56c65cdbf1e9`;
  both match producer `fixtures/README.md:35-60`.
- Decoder result: **accepted, `ok`, 0 warnings, 9 roles, 7 verified pairs,
  5 clusters**. Decoder SHA256:
  `f1e1fdfc31e70bd1d471a447c323aacb9e78116cc9f39067c8b8e49c0208d234`.
- Embedded producer revision:
  `src-dc6702270d19e9658b89c929bb0bd3587b59dfa7de9feaca9b58002c01e50155`.
  Recorded as embedded provenance; no rebuild verified that source digest today.

This is a genuine publisher-path capture of synthetic artwork from a loopback
MPD fixture server, as documented in the producer README. It is not a live owner
playback capture, and these swatches do not demonstrate a large extraction/hex
inverse gap. Preserve that distinction when admitting a conformance fixture.

The contract header still says no publisher exists (contract:8-13), while the
current source and stored capture establish otherwise. Grisaille SPEC §8.1 still
describes r3 as the draft boundary. These are documentation reconciliation items
for the Review Lead, not reasons to discard the ratified contract or its hashes.

Next actor: Notan for the numbered dispositions and a pinned brief. Delivery
uses an explicit Herdr handoff to his verified live seat; the presence of this
report is not delivery or acknowledgment.
