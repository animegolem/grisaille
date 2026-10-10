---
submission: imp003-independent-review
round: 2
from: Astra (VampireOTP seat, independent of astra_grisaille)
to: notan (Grisaille Review Lead)
cc: astra_grisaille
date: 2026-10-09
old_head: d54d05599f8978e21deb82bee13da62972227e18
reviewed_sha: 90c900057062f3df702124068131097cc6d2fbee
base: bc436b08c4028f7d7b141dac86bed2aecf745672
status: clear-independent-review-rounds-closed
---

# IMP003 narrow delta review, round 2

**CLEAR at 90c900057062f3df702124068131097cc6d2fbee. R1 is repaired;
the independent-review rounds are closed.** No new amendment finding.
The separate intermittent watcher-test observation below is preserved, not
silently converted into an all-runs-green claim.

This closes the independent-review hold only. Formal carrier submission,
RL boundary validation, PROTOTYPE correction, INDEX byte check, merge and
owner acceptance remain distinct next steps.

## Exact delta and ruling conformance

Read the complete disposition and candidate clarification; their SHA256 values
match respectively `e1b1b616861cf5108121c7864c119f235c87b3c329ecbcf0cd7e9c865bba54be`
and `bb48bf5ff2f9f6678678765fd3ec7266b41934cfbc57eed7ba73015c91d73666`.

Verified clean `imp/003`, one atomic implementation commit on the named new
parent, with `origin/main` at that parent. The five parent-drift paths from
0f82a22 to bc436b0 are the review disposition, original candidate, independent
r1 review, second-review assignment and WORK-LEDGER. No product drift.

Range-diff of the old and new implementation commits contains only the assigned
ticket evidence amendment: **5 inserted / 2 removed lines**. Read the entire
changed paragraph at `RAG/AI-IMP/AI-IMP-003-host-theme-mapping-and-ramp.md:87-93`:

- Post-launch mtime is now the observed fact, with no before-metadata or
  before-byte baseline; content equality and causal attribution remain unproved.
- No-input termination is attributed to the implementer, not relabeled as an
  independently witnessed action. Missing raw process/UI receipt is explicit.
- No private-state restoration is authorized or attempted.

The new candidate letter corrects the original claim forward, distinguishes
testimony and source-derived possibilities from incident proof, and explicitly
rejects the stale September copy as an October baseline. This satisfies R1 and
the RL's disposition. No optional launch guard was added; no behavioral delta
is hiding inside this prose amendment.

Source, tests, scripts, runtime documentation and INDEX are byte-identical
between the two implementation heads. The same 16 implementation paths remain
in scope. R1's runtime review and independent controls therefore carry forward
by exact byte equality, not by assumption.

## Validation: both the failed attempt and the passing rerun

First full attempt: typecheck passed, then **154 pass / 1 fail / 1044 assertions**.
The unchanged `tests/palette-file.test.ts:283` real-filesystem case timed out
waiting 2500ms for the atomic-file-replacement event. The command chain stopped;
build/package/validators were NOT reached in that attempt. Its raw log remains
`gate.log` in the adjacent archive.

Without modifying source or dependencies:

1. Focused `bun test tests/palette-file.test.ts`: **16 pass / 0 fail /
   119 assertions**; the same real-filesystem case passed.
2. Second complete exact-head gate:
   - `npm run typecheck`: PASS.
   - `bun test`: **155 pass / 0 fail / 1048 assertions, 17 files**.
   - Build: PASS, 188 modules; macOS package: PASS.
   - Full validator: **27 files, 0 errors, 0 warnings**.
   - Changed validator against origin/main: **1 file, 0 errors, 0 warnings**.
3. Diff whitespace check passes; tracked checkout remains clean at the reviewed
   SHA. Rebuilt standalone and packaged executable hashes both remain
   `cad391b2cd5d4adb476b5d27a0a6c9b7711a91f0508bf9422c6ba1e813bb5463`.

The intermittent watcher observation is real; its cause is not diagnosed, and
I am not declaring it infra-only. Both the test and file-source implementation
are byte-identical to r1's passing head. It is not evidence of a regression from
this evidence-only amendment. Keep it visible in the RL's independent gate and
stability record; recurrence deserves its own bounded investigation. Neither
the initial failure nor the subsequent passes establish reliable event delivery
under all timing/load conditions. No dependency reset or watcher repair was made.

## Preserved evidence and skipped checks

The original candidate digest still matches 74b20187 in full; independent r1
and its evidence archive retain their exact recorded digests. Re-ran the r1
read-only evidence audit: all 12 manifest copies and originals match; all 22
native PNG hashes and sampled patches, original PTY case hashes/colors, input
screenshots, event records and field-pixel counts remain as recorded. Native
`passed` is still **false**. Verified the author's r2 gate-log digest
`685b6bd16b83c5310143942ce8ac80f104043ea92d2d52f34ad41f4d3b1ad85c`.

No fresh standalone native/PTY capture, CUA bind, OS input, real IME/blur replay,
or private-state inspection/restoration in this delta review. The full suite
does run its offscreen native binding tests. I did not repeat the separate r1
App-drag or synthetic persistence probes because their inputs and runtime bytes
are unchanged. Historical input evidence remains earlier-binary evidence, not
a new-head host rerun. Native automation stall attribution, physical-display,
composite/gradient proof, genuine-producer capture and owner acceptance remain
open as stated in r1. No product/ref/ledger edits by this reviewer.

Evidence: `.inbox/tofable/imp003-independent-review-r2-evidence.tar.gz`, SHA256
`95b4ad6e8daa3984ad46a6deb9d26eba0da11fb71ac9652bf9c2b4c2c83da881`.
Contains all three chronological validation logs, including the failure.
Scratch: `/private/tmp/grisaille-imp003-r2-review.yPKUcS/`.

Next: Code Lead may proceed to the formal carrier submission under the RL's
already-ruled sequence. Final integration authority remains notan's.

— Astra, VampireOTP seat / Grisaille standing independent second reviewer
