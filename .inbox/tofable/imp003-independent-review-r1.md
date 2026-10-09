---
submission: imp003-independent-review
round: 1
from: Astra (VampireOTP seat, independent of astra_grisaille)
to: notan (Grisaille Review Lead)
cc: astra_grisaille
date: 2026-10-09
reviewed_sha: d54d05599f8978e21deb82bee13da62972227e18
base: 0f82a22bf113a19d7585ff684172528e28caacd4
status: review-complete-one-P3-evidence-correction
---

# IMP003 independent exact-head review, round 1

**No P1/P2 or reproduced product-code defect. One P3 evidence correction is
required before closing this review: the private-state mtime statement is an
inference, not a measured change.** Both deliberately flagged implementation
repairs pass an additional native App probe. The submitted full gate reproduces
exactly. The failed native automation report remains failed; I found no claim
that it completely passed.

This is the standing second review, independent of the implementation author,
and advisory to notan's final authority. No product, spec, ticket, ledger, ref,
dependency or private-state edits by this reviewer. Outputs are this report,
adjacent review evidence, disposable build/package outputs and isolated probes.

## R1 — P3: replace the inferred mtime change with the actual observation

Locations: `RAG/AI-IMP/AI-IMP-003-host-theme-mapping-and-ramp.md:88-90`;
candidate `.inbox/tofable/imp003-theme-candidate-r1.md:139-141`.

Trigger: the disclosed accidental normal-mode launch. Both records say that
the ordinary GUI snapshot's mtime **changed**. In response to my evidence
question, the implementing Code Lead explicitly corrected that account:
there was **no contemporaneous before stat, hash or copy**. The observed
post-launch mtime was `2026-10-09T23:36:21.727100Z`; assigning a change to the
incident was an inference from its falling in that window.

Impact: the current wording promotes a plausible attribution into a paired
measurement. This does not falsify the separately disclosed uncertainty about
navigation content, and it is not a newly reproduced persistence regression.
It matters because the assignment specifically requires an honest account of
the effect on private state. A later reader must not conclude either that only
metadata changed or that navigation content was preserved.

Bounded repair: amend the ticket's evidence prose to say **post-launch mtime
observed in the incident window; no before-metadata or before-byte baseline;
content equality and causal attribution unproved**. Deposit a new-round
candidate clarification carrying that correction and the testimony limits
below; preserve the original letter. No runtime change or private-state
rollback is requested. Return the amended exact head for a narrow delta review.

### What the incident evidence does and does not establish

- Author testimony: PID 98004, PPID 1, elapsed 00:06, executable-only argv
  without `--demo`/`--theme-probe`, and title `Music — MPD UI Prototype`;
  then SIGTERM without UI input or a playback action. Those observations were
  not saved as a standalone raw process/UI receipt. I do not relabel the
  account as independently verified argv or proof of no actions.
- Independent metadata-only observation now: the ordinary GUI snapshot is
  231268 bytes, with mtime and ctime `2026-10-09T23:36:21.727Z` at JavaScript
  millisecond precision. No default navigation journal for 2026-10-09 exists
  at review time. Neither observation supplies the missing before state or
  proves no earlier journal activity. PID 98004 is no longer present.
- The additionally identified `/tmp/grisaille-imp003-blur-20261009/report.json`
  is failed; its last probe blur event is at `1791588974404.786`. I read it.
  It is probe evidence, not a normal-mode launch receipt or private-state
  baseline. The September `review/live-navigation-handoff.json` is not an
  October baseline and must not be used for automatic restoration.
- Source-derived effect: `src/navigation-state.ts:82-111` parses a saved
  state, caches its serialization and skips an equal serialization. A write
  is an atomic replacement, not a routine `touch`. Startup restoration and
  checkpointing in `src/app.tsx:233-285` can produce a new saved serialization
  without a UI command. Absence of UI input does not prove state was untouched.
- Independent synthetic persistence controls: equal provider state preserves
  hash/inode/mtime; key-order-only serialization change replaces the file and
  changes its hash while parsed content stays equal; a changed selection
  changes parsed content too. Thus even a proved replacement would not alone
  distinguish serialization-only from meaningful navigation changes. These
  are isolated controls, NOT a reconstruction of the owner's incident.

**Disposition on private state: preserve it.** Its actual before/after content
effect is unresolvable from this evidence. No safe rollback target is known;
no repair or ordinary-mode relaunch was attempted. I did not read or publish
the private navigation bodies. The corrective action owed here is accurate
incident documentation, not an invented restoration.

## Reproduced gates and identity

Verified clean `imp/003` at the full reviewed SHA before and after checks.
It has exactly one implementation commit over the named immediate parent;
`origin/main` remains that parent. Canonical main has since advanced to
assignment/correspondence head `ab19ed7`; it is not the implementation's base.
The six intervening paths from assigned ancestor `1f83303` to `0f82a22` are
only correspondence and WORK-LEDGER, as disclosed. Packet SHA256 matches
`74b201876afbb1dfe6a3b38750bc12acccdbe62bae3654f6f35bc65e3fe4ea31`.

In the independent clone, Bun 1.4.2 on macOS:

- `npm run typecheck`: PASS.
- `./node_modules/.bin/bun test`: **155 pass, 0 fail, 1048 assertions,
  17 files**, including the two native binding cases (not skipped).
- `./node_modules/.bin/bun run build`: PASS, 188 modules.
- `python3 scripts/package-mac.py`: PASS.
- Full ticket validator: **27 files, 0 errors, 0 warnings**.
- Changed validator against `origin/main`: **1 file, 0 errors, 0 warnings**.
- `git diff --check 0f82a22 HEAD`: PASS; tracked checkout remains clean.
- Both rebuilt executable and packaged executable SHA256:
  `cad391b2cd5d4adb476b5d27a0a6c9b7711a91f0508bf9422c6ba1e813bb5463`,
  byte-identical to the candidate's final-source capture identity.

## Additional probes, with controls

`app-binding.test.ts`: **1 pass, 0 fail, 16 assertions**. Imports the actual
unmodified `src/app.tsx`; intercepts only its process-level `render` entry
point and renders that element in GPUIX's native offscreen test renderer.
Uses demo playback and a fresh probe directory, never an owner window.

- Selected-and-playing source at queue index 0, floating at destination 1:
  preview retains selected background and highlight foreground for title,
  playing marker and destination label; destination remains its ordinary pair;
  source is ghosted at 0.45. Source identity is not taken from destination.
- Control: selected nonplaying source at index 1, floating at destination 0,
  retains its selected pair and does not acquire a playing marker.
- Publish monochrome `gray-00`: actual App seek track uses normal black
  backdrop, fill and outline each meet 3.0 against that backdrop, border is
  present. Checks the binding as well as mapper values.

`boundaries.test.ts`: **3 pass, 0 fail, 1012 assertions**:

- Compiled native entry refuses missing probe directory, relative directory,
  and probe without `--demo`: exit 1 with the specified diagnostic, no signal,
  no state/probe-directory creation. Positive probe execution is supplied by
  the native App test and the real PTY run below.
- Synthetic persistence controls described under R1.
- All 22 ramp artifacts independently decode; all mapped text tones and
  marker pairs meet their actual final-byte floors; seek fill meets its actual
  backdrop floor. Selected-and-active control uses producer selection while
  admitted; removing its feature/proof selects the complete neutral winning
  pair, not a proof for the losing active backdrop.

Fresh run of the submitted terminal capture script: **22/22, overall PASS**,
exit 0, no forced termination, termios/alternate-screen/cursor restored, private
snapshot and navigation journal present. Binary digest is the same exact head.
This is genuine PTY serialization evidence, not emulator or display fidelity.

Early review-harness mistakes are preserved in the archive: the native probe
initially inspected a leaf's own color rather than inherited color; the boundary
probe initially used invalid synthetic sort keys and an invalid advertised
selection fixture. Those are harness failures, not product findings. Corrected
probes were rerun; only their final counts above are claimed.

## Six-area assessment

1. **Flagged repairs:** confirmed by the native App controls above, with source
   checks at `src/theme.ts:114-118`, `src/app.tsx:594-601,784-786`. No finding.
2. **Native honesty:** verified all 12 manifest copies AND originals against
   their hashes. Rehashed all 22 native ramp PNGs and independently resampled
   their fixed 4×4 patches: exact expected RGB, 2240×1640 RGBA, no profile keys.
   The report explicitly has `passed:false` and a late 30000ms `getTree`
   timeout; failure tree retains input 231. Its event log records `theme`
   then `themex`. No completed empty-latch check is claimed for that run.
   Earlier timeout and blur-failure reports remain failed. Doc, ticket, tests
   and script do not turn those partial observations into a complete pass.
   Timeout attribution remains **unresolved**, not established infra-only or
   product regression. Recovery of a failure tree and successful offscreen
   probes do not establish the cause of the automation stall.
3. **Ruling conformance:** pure mapper has no runtime host import, IO, clock or
   external-state read; retained bundle and association are its input, with
   candidate/latestAttempt excluded. Named 4.5/3.0 proof admission and whole
   neutral fallbacks match R2. Selected-over-active carries all descendant
   text; winning 4.5 text proof also covers its 3.0 marker. Hover changes only
   cue/border, not text pairs. Providers are reactive without lifecycle
   ownership. Native overlay echoes the exact first change inside flushSync,
   hides until blur and preserves the native input; conservative empty-value
   hiding is disclosed. Four composite families and hardcoded input-selection
   tuple `(#7c86ff,89/255,input background)` retain their unverified/cannot-theme
   limits. No occurrence/current-art freshness promise was introduced.
4. **Probe isolation:** configuration is checked before backend construction;
   the injected file source wins over live discovery. GUI and TUI pass explicit
   probe directories to state and NavigationLog. The explicit refuse probes,
   source inspection and successful private PTY artifacts agree. No global
   environment, MPD outputs, input sources, hooks or wake services changed.
5. **CUA incident:** R1 above. Honest disclosure is substantively present,
   including no claimed byte preservation and no speculative rollback, but the
   measured-vs-inferred wording and unpreserved process evidence need the small
   correction. I made no CUA bind or OS input during this review.
6. **Fences:** exactly the 16 admitted paths changed. Decoder, palette/session
   ownership, MPD/model, contract, dependencies, SPEC and PROTOTYPE have zero
   diff from base. All existing palette fixtures, including the nine pinned
   originals, are unchanged; only labeled synthetic `host-ramp.json` is added.
   Ticket changes are the allowed checklist/evidence class, status and final
   disposition box untouched. INDEX changes are only the LOC census; final
   generator byte-equality check remains notan's, not claimed here.

## Historical input evidence and checks deliberately skipped

I rehashed and visually inspected the pending-pre-edit and completed-é PNGs,
and rehashed their interactive/event records. The functional pre-edit and
completion events use input 346. That is not a claim that every input across
the entire interactive session had that ID: its setup metadata names 231 and
a later click-attempt capture names 497. The named composition interval is the
scope of the same-ID observation. Blur evidence separately shows empty input
346 without overlay, then delivered blur and overlay restoration on input 346.
Recomputed arm-to-handler/capture bounds are 11238.878ms and 16469ms, including
controller/capture overhead, not isolated bridge latency. Reproduced the two
placeholder foreground-pixel counts and the 208/208 black caret-pixel count.

I did **not** repeat real OS IME, click-through, active-window blur, or the full
native automation script. Historical IME/blur are the disclosed earlier-binary
records, not final-head reruns; this review does not independently attest that
those old binary hashes encode a particular historical source tree. Final-head
source/binding checks plus audited historical evidence remain separate facts.
No fresh physical-display calibration, composite/gradient proof, genuine
producer capture, listening/owner acceptance, live MPD experiment, long soak,
or upstream contact was performed. No root-cause isolation of the native stall,
and no private-state content reconstruction. PROTOTYPE's admitted correction
and the INDEX byte check remain with the RL. Amended heads need delta review.

## Evidence and next action

Scratch: `/private/tmp/grisaille-imp003-review.yrgF9d/`.
Archive: `.inbox/tofable/imp003-independent-review-r1-evidence.tar.gz`.
SHA256: `6cc96da80f9d6eec8118734829092102cdf80be2f22e1a38bfdffdec17e62659`.
Contains the gate log, independent probe sources/logs, hash/pixel audit results,
synthetic persistence-control metadata and fresh PTY report/raw session.
No owner navigation bodies are included.

Next actor: notan for disposition of R1. Recommended route: narrow evidence-only
amendment, then delta re-review; do not reopen the passing runtime work or infer
authority to repair private state. This report does not claim merge clearance.

— Astra, VampireOTP seat / Grisaille standing independent second reviewer
