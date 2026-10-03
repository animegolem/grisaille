---
submission: imp002-independent-review
round: 1
from: Astra (VampireOTP seat, independent of astra_grisaille)
to: notan (Grisaille Review Lead)
date: 2026-10-03
reviewed_sha: 899722ea35a4332a54d1314dcb761c0e07240201
base: 35770dc0f5a9358025d3c349bb03f973be401ea6
status: review-complete-one-low-severity-finding
---

# IMP002 independent exact-head review, round 1

Owner-designated reviewer from the VampireOTP seat; not the implementation
author and not the Review Lead. Advisory to Grisaille final authority. No
product changes, ref changes, ledger edits or implementation start by this seat.

**Result:** no P1/P2 findings; one reproduced P3 lifecycle-cleanup defect below.
The ticket/INDEX difference is characterized separately for the requested RL
scope ruling, not silently treated as either an unauthorized scope expansion
or a precedent that forbids all checklist updates. No merge clearance is claimed.

## R1 — P3: synchronous owner stop during palette startup leaves an exit listener

Location: `src/music-session.ts:57-59` (with stop at lines 61-71).

Trigger: a palette subscriber reacts to the active snapshot by calling the
owning MusicSession.stop(). PaletteSession.start() publishes synchronously
(`src/palette-session.ts:65,117`), so the owner's stop completes before
MusicSession.start() resumes at line 58. Startup then registers its process
exit listener although the owner is already inactive. Calling stop again
returns at line 62 and cannot remove that listener.

Impact: the global process event emitter retains a stopped MusicSession and
its associated state until process exit or a later lifecycle clears it. This
violates complete lifecycle cleanup under the same synchronous-subscriber
teardown pattern already tested for PaletteSession alone. It does NOT leave
a live palette watcher or MPD subscription in the reproduced case, does not
send playback commands, and is not evidence of a current visible UI failure.

Independent executable probe:
`/private/tmp/grisaille-imp002-review.wHcYd5/owner-stop.ts`
Run with the reviewed clone's `./node_modules/.bin/bun`.
It imports the unmodified reviewed modules, uses only an injected source and
fake backend, and removes only its own process listeners afterward.

- Ordinary start/stop positive control, three cycles: exit-listener delta 0,
  subscriptions/closes 3/3, watchers/closes 3/3, palette inactive.
- Subscriber-induced owner stop, three cycles: exit-listener delta **1**,
  subscriptions/closes 3/3, watchers/closes 0/0, palette inactive.
- Final invariant assertion fails with `1 !== 0`; process exits 1.
  This is separate from the fully passing author suite, not included in its counts.

Bounded repair: account for synchronous teardown across palette startup before
installing subsequent owner resources (a lifecycle/active guard or equivalent
ordering). Add an owner-integration regression test, including ordinary cleanup
as a control. Preserve a restarted lifecycle rather than allowing old startup
continuations to act on it. RL may disposition this low-severity finding; my
recommendation is to repair the small ownership seam before final submission.

## Requested ticket/INDEX fence characterization

Compared immediate parent 35770dc to reviewed head:

- `RAG/AI-IMP/AI-IMP-002-transactional-palette-subscription.md:46-49`:
  four existing checklist boxes changed from unchecked to checked. Final
  submission/review/disposition box at line 50 remains unchecked.
- Lines 59-74 replace “Not started. No implementation or acceptance is
  claimed.” with implementation/evidence/limitations text: snapshot guard,
  unchanged MPD action semantics, gate counts, test coverage, resolved test
  typing error, and deferred host/capture proof. No acceptance claim added.
- Frontmatter, planned status, dependencies, confidence, normative scope,
  Out of Scope, Design/Approach, Files to Touch, and acceptance criteria are
  unchanged. No scope language moved. No ledger change in the implementation.
- `RAG/INDEX.md:87`: ONLY `src/app.tsx (803 LOC)` to `(805 LOC)`.
  No ticket status or queue contents changed. This matches the actual +2
  line delta; I did not rerun the generator because this review is read-only.

IMP001 final review explicitly observed zero ticket/index/ledger edits; IMP002
does differ in those two files. Relevant prior authority is not solely that
observation: `RAG/briefs/SPRINT-001-theme-consumption.md:67-68` permits assigned
checklist/evidence changes in round 2 and instructs generated INDEX refresh;
the Code Lead charter likewise instructs regeneration, while
`RAG/PROTOCOL.md:173-175` says never edit the generated index. The present delta
is consistent with checklist/evidence bookkeeping plus generated line census,
not product-scope enlargement. The assignment explicitly reserves disposition
to the RL; please record whether this bookkeeping is accepted under that
distinction or should be kept on the RL side. I have not rewritten either file.

## Exact-head checks and six-area coverage

Verified clean `imp/002` at the full reviewed SHA before/after checks. Exactly
one implementation commit over 35770dc; assigned ancestor d0e0de4 is preserved.
Only r4 correspondence, start report and WORK-LEDGER intervene between that
ancestor and immediate parent. Eleven changed files match the candidate list.

Reproduced in the independent Code Lead clone at the frozen head:

- `npm run typecheck`: PASS.
- `./node_modules/.bin/bun test`: **132 pass, 0 fail, 769 expect calls,
  14 files**. Bun 1.4.2, macOS arm64.
- `./node_modules/.bin/bun run build`: PASS, 184 modules.
- `python3 scripts/package-mac.py`: PASS, clone-local app bundle.
- `RAG/scripts/validate-tickets.sh`: **26 files, 0 errors, 0 warnings**.
- `RAG/scripts/validate-tickets.sh --changed origin/main`: **1 file,
  0 errors, 0 warnings**; origin/main = 35770dc, not a silently advanced base.
- `git diff --check HEAD^ HEAD`: PASS. Tracked worktree remains clean.

Read SPEC rev 0.3, assignment, candidate, r2/r4 dispositions, corrected brief,
ticket, preparation report, relevant IMP001/fold precedent, all changed runtime
and test files, runtime documentation, and ownership/backend context.

Association/retention: code, new test names and runtime prose honor URI-only
association and explicitly retain the A→B→A limitation. No inferred occurrence
identity, sequence high-water fence or current-art verification found. Whole
decoded bundles are deeply frozen; failures cannot adopt roles; verified no-art
keeps no-art/null-art identity; candidate and retained provenance remain separate.
Connected/newly observed playback context gates association, including restart.

Ownership: useMusic start/stop and MPD action bodies unchanged; both host
constructor seams own one palette session; usePalette only subscribes through
useSyncExternalStore. model.ts, mpd.ts, decoder and all fixtures have zero diff
from the assigned ancestor. All nine original fixture files also byte-compare
equal to current producer copies; producer contract SHA256 independently matches
1ea902c71fcd75e6791112d4621b6b9fcd67ba12896979fe43cf7c6d34d3821a.

Async/isolation: inspected serialized reads, dirty follow-up, revision/lifecycle
checks, old-task identity cleanup, source callbacks and 1/2/4/8/10s continuing
reattach with reset/cancellation. No production mkdir or producer invocation.
Real temporary-directory file rename and parent replacement tests passed;
deterministic retry and stale-callback tests passed. Demo discovery disables
the source; tests inject sources/paths. Zero playback calls and cleanup counts
are asserted in integration tests. The additional owner teardown gap is R1.

## Remaining uncertainty and boundaries

No native app launch, owner playback, producer regeneration, long-duration
watcher soak, visual ramp, terminal palette paint or listening acceptance was
performed. Build/package is not native visual proof. Filesystem event delivery
remains platform-dependent; this run proves the bounded real-temp cases only.
Same-MPD binding is the ruled configuration assumption, not wire evidence.
Fixture conformance does not close the separate genuine-capture gate. The
frozen assignment and source are the scope; amended heads need delta review
and renewed relevant evidence before this review can cover them.

— Astra, VampireOTP seat acting as Grisaille independent second reviewer
