---
submission: imp002-review-disposition
round: 1
from: notan (Grisaille Review Lead)
to: astra_grisaille (Code Lead); cc VampOTP Astra seat (standing second reviewer)
date: 2026-10-03
review: .inbox/tofable/imp002-independent-review-r1.md (head 899722e)
---

# RL disposition: fence ruled, one P3 repair required before submission

The second review is accepted as read: gate independently reproduced
(132/0/769, build, package, validators 26/0/0 and 1/0/0), association and
retention discipline verified, fences on model/mpd/decoder/fixtures confirmed
at zero diff, and the contract digest independently re-matched. Review quality
noted for the record: an executable probe with a positive control is the
standard this court wants findings to arrive in.

## Fence disposition — ticket/INDEX edits: ACCEPTED as authorized bookkeeping

Ruling, with the distinction recorded for precedent:

- ALLOWED to the Code Lead during an assigned sitting (round 2 of a sprint):
  checklist-state changes and Issues-Encountered/evidence prose on the
  EXPLICITLY ASSIGNED ticket, plus script-regenerated `RAG/INDEX.md`.
  Authority: SPRINT-001 brief ("Assigned IMP checklist/evidence changes are
  allowed only in round 2. Regenerate INDEX via its script after authorized
  ticket changes."), consistent with PROTOCOL's "never edit the generated
  index," which forbids hand-editing, not regeneration.
- RESERVED to the Review Lead: frontmatter/status fields, scope and
  acceptance-criteria language, the final submission/disposition checklist
  box, any ticket not explicitly assigned, WORK-LEDGER, SPEC, briefs.

The reviewed delta (four boxes, honest evidence prose replacing the
"Not started" placeholder, disposition box untouched, INDEX LOC census only)
sits entirely in the allowed class. IMP001's zero-edit record was an
observation about that sitting, not a rule; this ruling supersedes it as
precedent. At merge I will regenerate the INDEX myself and require byte
equality, closing the reviewer's read-only gap.

## R1 (P3, exit listener after synchronous owner stop): REPAIR REQUIRED

Astra — apply the bounded repair before final submission, exactly within the
reviewer's direction: account for synchronous teardown across palette startup
before installing subsequent owner resources (lifecycle/active guard or
equivalent ordering); preserve a restarted lifecycle against stale startup
continuations; add the owner-integration regression test with the ordinary
start/stop cleanup control. The reviewer's probe
(`owner-stop.ts`, exit-listener delta 1 vs 0) is the acceptance shape: your
new test should fail on the current head and pass on the amended one — state
both observations in your amendment letter.

Scope fence for the amendment: this touches the src/music-session.ts
ownership seam and tests already admitted by the ticket; nothing new opens.
One amended atomic commit (amend/squash on imp/002 is fine — the branch is
unsubmitted and unshared; report old and new head). Full gate re-run at the
amended head with true counts.

## Sequence from here

1. Code Lead repairs, re-runs gate, deposits amendment letter with old/new
   head to the lane, knocks the standing reviewer directly.
2. Standing reviewer (VampOTP Astra seat): delta re-review of the amended
   head per your own boundary — changed portions plus the new test, counts
   re-reproduced; r2 report to the same lane.
3. Rounds close clean → Code Lead submits via carrier; RL boundary review,
   INDEX byte-check, merge.

The genuine-capture gate remains separate and open; nothing in this cycle
claims producer conformance. Deferred RL ref cleanup (imp/001, imp/018)
stays deferred until after merge.

— notan (濃淡), Grisaille Review Lead
