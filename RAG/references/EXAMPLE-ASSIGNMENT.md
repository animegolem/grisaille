> Illustrative artifact. The structure and rules are taken from a
> real production brief; names, paths, tickets, and rulings have
> been genericized to a fictional desktop board app ("gridnote":
> ticket root `TICKETS/`, channel `.relay/`, branch prefix
> `wave/`). The shape is the skill.

# Assignment: the undo-integrity wave — AI-IMP-118 · 124 · 131

Review Lead → Code Lead, {{YYYY-MM-DD}}. One sitting, three
tickets, one domain: every deliberate verb reaches the undo
coordinator and the ledger never lies. This is the RELEASE-GATE
range (G-4 R1). Manage your own subagents as you see fit; the
protocol in `.relay/PROTOCOL.md` governs (isolated clone, branch
`wave/imp-118-124-131`, inbox submission, atomic commit per
ticket, destructive-op fence: you never delete
worktrees/branches/refs — the Review Lead owns cleanup).

## Round 1 is a PRE-IMPLEMENTATION REVIEW — no code

All three tickets predate the lifecycle rulings (118/124 cut two
days before them, 131 the day before). Verify every ticket claim
against CURRENT source, report corrections with citations, and
propose the repair scope. The Review Lead answers with rulings in
the outbox; you code against the verdict where ticket text
differs. Known staleness to check explicitly: line numbers
throughout; whether 127/EPIC-014 moved any board/archive seams the
tickets cite.

## The tickets (in build order)

1. **TICKETS/AI-IMP/AI-IMP-118-undo-group-identity.md** — CA-006:
   `runAsUndoGroup`'s single module-global `pendingGroup` means
   temporally overlapping groups merge. Done = explicit group
   tokens; commits join only their token's group; nested
   same-token joins, temporal overlap never merges. Build FIRST —
   124 stacks on correct group identity.
2. **TICKETS/AI-IMP/AI-IMP-124-board-undo-coordination.md** — the
   board action bar + archive view issue raw envelopes
   (BoardActionBar, ArchiveView); bulk verbs never reach the
   coordinator; CA-005 stale redo. Done = every bulk verb is ONE
   undo group per gesture (archive n / label n / restore n),
   `RestoreRecord` joins structural undo (inverse re-archives),
   empty-archive stays honestly outside.
3. **TICKETS/AI-IMP/AI-IMP-131-create-and-label-redo.md** — the
   convicted CreateCardAndLabel redo defect (inverse:null → replay
   collides with the archived title-reserving row). You convicted
   this one yourself in a prior sitting; the ticket carries the
   RestoreAndLabelCard-shaped fix direction.

## Normative supplement (post-dates the tickets — binding)

The lifecycle bundle rulings are ratified and BIND this range
where ticket text is older:

- **§9.4 (G-4 R1 scope)**: "every commit path reaches the
  coordinator" governs USER GESTURES ONLY. The AI-IMP-129
  label-sync system writes (direct persistence envelopes in typed
  utility ops) are deliberately outside the ledger and MUST NOT
  be routed through the coordinator or disturbed. Do not "fix"
  them.
- **§9.5 (G-4 R2)**: one gesture = one entry, bulk included;
  partial failure splits the receipt (toast counts), never the
  group; the shipped summary-toast copy is ratified verbatim — do
  not reword.
- **§9.6**: restore is undoable, purge is not — empty-archive
  never joins undo; its impact-as-fact confirm is ratified as-is.
- **§9.7**: the inverse of a bulk verb RE-SELECTS what it brings
  back (undo restores the selection too). If the selection seam
  makes this expensive, say so in round 1 rather than building it
  degraded.
- **§9.8 (G-4 R5)**: any new user commit after undo clears redo,
  unconditionally.

## Fences

- Renderer/undo domain only: `apps/desktop/src/renderer/undo/`,
  the board/archive/card surfaces the tickets cite, and their
  tests. NO schema work — there is no migration number assigned
  to this range; if you believe you need one, STOP and say so in
  a submission (0007/0008 are taken; do not touch migrations).
- Do not touch: `TICKETS/` beyond the three assigned tickets
  (never INDEX.md / HUMAN-TESTING.md / DESIGN-QUEUE.md),
  `.github/`, `packages/persistence/src/migrations/`,
  `apps/desktop/src/main/` (the updater ticket is being
  lead-built there in parallel — collision risk), the freshly
  pinned outline e2e spec.
- Validation: `set -o pipefail` on every chain; the full gate at
  the tip (build + units + lint + e2e — read counts, not exit
  codes; report the failed line if any exists); build all
  workspace packages before any e2e run.

## Report contents (each round)

Per PROTOCOL.md, plus: counts for every suite you ran (packages /
desktop units / e2e), the undo-policy matrix diff if you touch
UNDO_POLICY (118/124 will — UnassignLabelFromCard stays exempt,
that reclassification belongs to a FUTURE ticket, not this range),
and candid friction notes — they feed the wave retro.
