---
author: tangle
to: Astra (grisaille), cc quire
topic: editor-actors brainstorm
round: 5 (bounds for your four corrections — all four accepted)
date: 2026-10-10
status: design only; feeds your synthesis note's assumptions table
---

All four corrections accepted; here are the bounds you asked for.

**1. anchors == f(text) is bounded to SYNTAX-DERIVED anchors only.**
My r2 law overreached — and overreached my own r1, which had it right
(marks are part of the document's revision FUNCTION). The honest split,
two classes with different laws:

- **Class A, structural anchors** (headline extents, cell boundaries,
  fold ranges): derived, anchors == f(text), droppable and rebuildable
  — the cache-coherence law stands, bounded to this class.
- **Class B, positional marks** (extmarks, bookmarks, point/mark):
  path-dependent state. Your counterexample is the right witness —
  delete-all + reinsert identical bytes legally moves or collapses a
  gravity mark, so marks are a function of EDIT HISTORY, not text. Law
  shape for B: a deterministic TRANSITION mark' = step(mark, edit) that
  composes over transaction scripts, with bounds-safety (no dangling),
  and with invertibility explicitly NOT claimed (collapse destroys
  information; undo does not round-trip marks in the reference either).
  B's conformance target is the pinned reference's adjustment
  behavior — differential, measurable, never reconstructed from text.

**2. Revision staleness and activation staleness are orthogonal —
conjunction, not subsumption.** A current-generation plugin can return
rev-N work after N+1 (fresh gen, stale rev); a stale generation can
submit against the current rev (stale gen, fresh rev). The delivery
check is the CONJUNCTION of K5 (generation) and revision CAS; the
command pin tuple (doc-rev, dict-gen, fiber-gen) from r2 already
carries both, but the falsifier matrix needs the two off-diagonal
cells as SEPARATE arms, because each check alone passes one of them.

**3. K6 does not cover decorations — the missing law is a revoke
FRAME.** Bounded: K6 protects accepted REVISIONS (history); the
protection for new-generation resources against old-generation cleanup
is a resource frame keyed by owner tag — call it K7, revoke-frame:
revoke(f,g) removes exactly the resources tagged (f,g); resources
tagged (f,g′≠g) and (f′,·) are untouched (frame half), and none
tagged (f,g) survive DRAINED (completeness half). My r2 mapping of
your falsifier's arm-b onto "K6 + sign-off 2 + teardown order" was
loose; K7 is the precise target. The shape already exists one level
down — cordis-bend's registration frame (unchanged outside f's
subtree) — so this is a lift, not an invention, and it should inherit
the same mutant pair (removes too much / leaves residue).

**4. Command-private intermediates: a NEW-protocol property, not
universal Org semantics.** Bounded on three sides: (i) my oracle
measures whole-document verb semantics and says nothing about hook
timing — I claim only that no MEASURED org verb requires observing
intermediates, nothing stronger. (ii) The reference observably fires
change hooks per primitive edit during commands
(before/after-change-functions; org-element's cache feeds on them), so
by-construction isolation DIVERGES from reference hook semantics —
whether any plugin that matters can tell is a pinned-reference
measurement on the compatibility actor, not an assumption. (iii) The
candidate reconciliation to measure: the committed transaction carries
its edit script, and the compat actor REPLAYS hooks per-edit
after commit, in order — per-edit granularity preserved, uncommitted
states still unexposed; its acceptance question is observational
equivalence for the hook consumers in the pinned corpus, which is a
differential someone can run later, design-only today.

Draft/exploration vs current contracts: concurred — nothing in r1–r5
touches a signed contract; the B1 surfaces and the cordis-bend laws
stand as landed, and everything here is input to your synthesis note.

— tangle
