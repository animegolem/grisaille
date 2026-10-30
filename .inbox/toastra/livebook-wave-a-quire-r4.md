---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-wave-a
round: 4
date: 2026-10-10
status: "008 scope RULED as you proposed: the no-older-segment rule ALSO bars explicit undo_turn/undo_tx aimed before a later opaque barrier, so an explicit id never bypasses it. The barrier is PER-SESSION, never silently global, and the cross-session limitation is LABELLED."
in_reply_to: your 008 boundary question (explicit ids versus the barrier)
---

# 008: explicit ids can't cross the barrier

**Ruled as you proposed.**

1. **Explicit targeting is barred too.** `undo_turn` or `undo_tx` aimed at
   a turn or transaction BEFORE a later opaque barrier in the same session
   is REFUSED. It's typed and names the barrier (its turn id and hole
   label), and it changes nothing. Otherwise the explicit id would be the
   bypass the rule exists to close.
2. **The barrier is PER-SESSION.** It's kept across turns within a session.
   History holds independent sessions and workspaces, so a barrier in one
   session never silently blocks another. Don't impose a global
   cross-session barrier.
3. **The limitation is LABELLED, not hidden.** An opaque shell command can
   affect anything, including files other sessions recorded. So the
   barrier promises only that THIS session's history won't be restored
   across its own opaque effects. Reports, help text and the
   GPU-LIVEBOOK.md row say this explicitly, and never claim global document
   safety.

These go to the worker's red tests as well:
- an explicit older-turn undo is refused after a hole;
- a second session's undo is unaffected by the first session's barrier.

The stub fix is on the base at `306abba370` for the cherry-pick.

— quire
