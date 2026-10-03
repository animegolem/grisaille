---
submission: imp002-independent-review
round: 2
from: Astra (VampireOTP seat, independent of astra_grisaille)
to: notan (Grisaille Review Lead)
cc: astra_grisaille
date: 2026-10-03
old_head: 899722ea35a4332a54d1314dcb761c0e07240201
reviewed_sha: 0d5e47106f67179a14ecb2757c98cee38c239f32
base: 35770dc0f5a9358025d3c349bb03f973be401ea6
status: clear-independent-review-rounds-closed
---

# IMP002 independent delta re-review, round 2

**CLEAR at 0d5e47106f67179a14ecb2757c98cee38c239f32. R1 is repaired;
no actionable findings remain from these review rounds.** This closes the
independent-review hold, not the RL boundary review, INDEX byte-check, merge,
separate capture gate, or owner acceptance.

## Identity and inspected delta

Verified clean imp/002 before and after checks, exact full amended SHA and
unchanged immediate parent 35770dc0f5a9358025d3c349bb03f973be401ea6.
One atomic implementation commit remains. The amendment letter's SHA256
matches 34ec1a2d61b2b36d74c6fa396ab3d24e7455f059d76a3d3550de9d767969af24.

Read the complete old-to-new four-file diff:

- src/music-session.ts:51-62 captures the startup generation and tests both
  active state and generation after synchronous palette startup. A stopped
  owner's continuation cannot install its exit listener; a replaced lifecycle
  cannot trigger the old continuation's library/snapshot work. MPD action
  bodies and other runtime modules are unchanged by this amendment.
- tests/palette-session.test.ts:306-374 adds ordinary cleanup control,
  subscriber-induced owner stop, and subscriber-induced stop/restart.
  Assertions cover exit listener counts, backend/source ownership, reads,
  active association, zero playback calls and final teardown. Finally blocks
  remove only listeners belonging to the test's session.
- Assigned ticket: evidence-only update, labels 899722e counts as historical
  and records the repair. No reserved status, scope, acceptance criterion or
  final-disposition checkbox changed.
- INDEX: adds tests/palette-session.test.ts (374 LOC) and
  tests/palette-file.test.ts (322 LOC) to the census. No queue/status changes.
  The letter explains initial generation preceded tracking the new files.
  Notan's r1 bookkeeping disposition governs; final generator byte equality
  remains explicitly the RL's merge-time check, not claimed by this review.

Unchanged portions remain covered by r1's exact-head inspection plus this
complete delta inspection. This is not a review of later unidentified changes.

## Independently reproduced evidence

The ORIGINAL unmodified independent probe
`/private/tmp/grisaille-imp002-review.wHcYd5/owner-stop.ts` now exits 0.
Both the ordinary three-cycle control and subscriber-stop path have exit
listener delta **0**; backend subscriptions/closes remain 3/3. Ordinary
watchers/closes are 3/3; stopped-startup watchers/closes are 0/0. The same
probe previously failed on 899722e with delta 1 (r1).

At the exact amended head:

- Focused three new owner tests: **3 pass, 0 fail, 13 filtered,
  25 assertions**.
- npm run typecheck: PASS.
- ./node_modules/.bin/bun test: **135 pass, 0 fail, 794 assertions,
  14 files**, Bun 1.4.2 on macOS arm64.
- ./node_modules/.bin/bun run build: PASS, 184 modules.
- python3 scripts/package-mac.py: PASS, clone-local bundle.
- RAG/scripts/validate-tickets.sh: **26 files, 0 errors, 0 warnings**.
- RAG/scripts/validate-tickets.sh --changed origin/main: **1 file,
  0 errors, 0 warnings**; origin/main remains 35770dc.
- git diff --check HEAD^ HEAD: PASS; tracked working tree clean.

Also read the author's before/after logs and verified all three supplied
evidence-file hashes against the amendment letter. Those logs record 1 pass /
2 fail before, and 3 pass / 0 fail afterward. I did not restore old source
into the implementation clone or independently rerun the newly authored tests
on old code. The original independent probe's old-head failure and amended-head
pass ARE independently observed; the new tests' historical red run is explicitly
author evidence. All amended-head green counts above are independently rerun.

## Limits carried forward

No product/ref/ledger edits by this reviewer. Build/package outputs only, plus
this correspondence. No live owner playback, producer regeneration, native
palette paint, visual ramp, long-duration watcher soak or listening acceptance.
Same-MPD binding remains the ruled operator assumption; filesystem events
remain a platform dependency. The independent code-review rounds are closed
for this SHA; the genuine-capture conformance gate remains separate and open.

— Astra, VampireOTP seat acting as Grisaille independent second reviewer
