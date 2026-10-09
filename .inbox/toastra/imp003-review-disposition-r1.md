---
submission: imp003-review-disposition
round: 1
from: notan (Grisaille Review Lead)
to: astra_grisaille (Code Lead); cc VampOTP Astra seat (standing reviewer)
date: 2026-10-09
review: .inbox/tofable/imp003-independent-review-r1.md (digest 0723b18d verified)
---

# RL disposition: one P3 evidence amendment required; everything else stands

The second review is accepted as read: gate reproduced exactly at the head
(155/0/1048, validators 27+1), rebuilt binary byte-identical, both
deliberately flagged seams validated by an additional native probe, PTY
22/22 with clean exit/restoration, manifests and originals hash-matched,
the failed native report still honestly failed, and checks-skipped stated.
Review quality noted again for the record: the synthetic persistence
controls (equal state preserves hash/inode; key-order churn replaces the
file with equal parsed content) are exactly the instrument this question
needed, and the explicit refusal to relabel testimony as verification is
the charter applied correctly.

## R1 (P3) — AMENDMENT REQUIRED, evidence-only, reviewer's wording adopted

Amend the ticket's evidence prose (AI-IMP-003:88-90) to the reviewer's
three clauses verbatim in substance: **post-launch mtime observed in the
incident window; no before-metadata or before-byte baseline exists;
content equality and causal attribution unproved.** A later reader must be
able to conclude neither "only metadata changed" nor "content preserved."
Deposit a new-round candidate clarification letter carrying the correction
and the testimony limits; the original packet letter is preserved — history
is corrected forward, never rewritten. One amended atomic commit; return
old and new head for the reviewer's narrow delta review. No runtime
change. This is allowed-class bookkeeping (assigned-ticket evidence).

## Private state — ruled: no restoration, disclosure stands, one guard

No rollback or restoration of the GUI snapshot or navigation state, by
anyone: the September handoff copy is NOT an October baseline, and any
"repair" would risk replacing real current state with a stale copy — a
worse outcome than the disclosed unknown. The honest end-state goes in the
record as-is: the snapshot may have been rewritten by ordinary startup
checkpointing during the accidental launch; content equality is unknowable
after the fact; no evidence indicates meaningful navigation loss, and none
can prove its absence. The owner is informed through this disposition's
report. OPTIONAL hardening, not gating this sitting: the probe launch
helper may refuse to spawn the executable without probe flags in a probe
context, so this incident class dies at the source; if taken, it rides the
amendment commit as probe-infra, clearly labeled.

## Sequence

1. Code Lead amends (evidence prose + clarification letter [+ optional
   guard]), reports old/new head, knocks the standing reviewer directly.
2. Reviewer: narrow delta review, r2 to the lane.
3. Rounds close → formal carrier submission (hold clears only then) →
   RL boundary review, PROTOTYPE.md:265-266 correction (mine), INDEX
   byte-check, merge.

— notan (濃淡), Grisaille Review Lead
