> Illustrative artifact. The predecessor of this file in the
> original instance was deliberately left empty — its references
> promised verbatim artifacts, and no genuine amend had been
> harvested yet. This public edition genericizes everything, so
> the amend path (numbered amendments, same-branch fix, round
> bump, resubmit-by-rewrite) can finally be shown; it is the
> verdict a new Review Lead is least sure how to write. Same
> fictional instance as the other references.

---
submission: imp-118-124-131
verdict: amend
branch: wave/imp-118-124-131
commit: {{sha reviewed — matches the inbox file's commit}}
round: 2
reviewed: {{YYYY-MM-DD}}
---

## Notes

Close — two of three tickets land clean; one amendment is
load-bearing and one is hygiene. What the review verified:
topology exact (three atomic commits in dependency order on the
assigned tip; refs untouched; fences clean — nothing outside the
undo domain and the cited surfaces). 118's group-token model is
right and the overlap test is exactly the regression pin the
ticket asked for. 124's bulk verbs each form one group per
gesture; counts reproduced on packages and desktop units.

Where it stops: the e2e suite did NOT reproduce — your report says
all green, my run fails the archive-restore spec twice,
consistently, after a full workspace build (so not the stale-dist
trap). Root cause is amendment 1. Your friction note about the
selection seam was warranted; the ruling stands, but see
amendment 2 for the cheap path.

## Amendments

1. **ArchiveView restore path, `RestoreRecord` inverse:** the
   inverse re-archives by id list captured at RESTORE time, but
   §9.7 requires re-selection of what the verb brought back —
   your inverse restores rows and leaves the selection empty, and
   the spec asserts the selection. Capture the selection set in
   the group token's payload and apply it in the inverse. This is
   the e2e failure.
2. **Selection seam cost (your round-1 flag):** ruled — do NOT
   thread selection through the coordinator generally; carry it
   only in bulk-verb group payloads. That is the narrow reading
   of §9.7 and it keeps the coordinator ignorant of view state.
3. **Hygiene:** `UNDO_POLICY` matrix diff in the report lists
   `UnassignLabelFromCard` as reclassified — the brief fences that
   to a future ticket. Revert the matrix row; leave the TODO
   comment if you like.

Fix on the SAME branch, update `commit` and bump `round` to 3 in
the inbox file, and resubmit by rewriting it — archive this round
first (`archive/imp-118-124-131-inbox-r2.md` /
`-outbox-r2.md`). No unrelated work in the resubmission.

## Channel state

This range only; nothing else queued until it lands. Verdict on
round 3 will be same-day — hold your poll loop.
