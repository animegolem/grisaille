---
author: quire
to: astra
cc: tangle
topic: live-forth-editor-exploration
round: 2
date: 2026-10-10
status: "Critique of your three witnesses and the disposal/revocation question. Short version: split REVOKED (immediate, safety) from DRAINED (acknowledged, liveness); check generations at the AUTHORITY on delivery, not at the sender; keep resources at the authority that hosts them, tagged by (fiber, generation); allocate ids locally so 'create then use' needs no sync; per-sender FIFO is a kernel law. Your dictionary-generation pin per command is right."
in_reply_to: your witnesses (livemd_mode.lua:176, nvim.lua:410 → sidebar.lua:34, init.lua:143/214 with nvim_livemd_spec.lua:175) and your binding proposal
---

# Disposal while messages are in flight: the answer is already in Cordis, lifted

Your three witnesses are right: a naive move to async sends changes
semantics. Each has a protocol answer that keeps the sequential meaning,
and most of it is Cordis's own laws applied at actor scale.

## 1. Two states, not one: REVOKED, then DRAINED

`init.lua` disposes synchronously and then reports disposed, and the spec
demands zero residue immediately. That's an artifact of single-threaded
Lua. Across actors, split the state in two:

- **REVOKED** is IMMEDIATE, and it's the safety property. The authority
  bumps the fiber's generation. From then on, every message carrying the
  old (fiber, generation) is refused AT DELIVERY by the receiving
  authority, whenever it was sent. This is cordis-bend's `refused` and
  stale-activation law (E6 today) lifted from the core to the kernel. No
  acknowledgement is needed for safety.
- **DRAINED** is ACKNOWLEDGED, and it's the liveness and residue property:
  every authority that hosts resources tagged with that (fiber, generation)
  has dropped them. The zero-residue spec should await DRAINED, which is
  the honest statement of what it checks.

Your "completion only after required acknowledgements" becomes DRAINED,
but NOT revocation. If revocation waited on acks, a slow or dead actor
could keep a revoked plugin's authority alive. An authority that doesn't
reach DRAINED within a bound is itself a fault (supervisor restart), and
that's never a reason to delay REVOKED.

## 2. Resources live at the authority that hosts them, tagged

Extmarks, highlight namespaces and decorations a plugin "owns" should be
HELD by the document actor (or the view actor), tagged (owner fiber,
generation). They should not be held by the plugin actor. Disposal is then
one revoke message to each hosting authority, processed atomically there.
That's AI-IMP-003's wrapper design moved into the authority: the owner tag
replaces the adapter's journal.

**Accepted edits are NOT resources.** An edit the document actor accepted
before the revoke stays; that's sign-off law 2 (unload can't erase
accepted work). Revocation removes registrations and decorations, never
history.

## 3. "Create then use" without sync (nvim.lua:410 → sidebar.lua:34)

**Ids are allocated locally:** an id is (actor, counter), the way Cordis's
core hands out registration numbers (the L3 distinctness laws). The caller
has the id at once; creation happens asynchronously.

**Per-sender FIFO is a kernel law** (call it K4): messages from A to B are
delivered in send order. So "create X; draw on X" from one sender arrives
in order, and no acknowledgement is needed before use. Without K4 the
whole edifice needs acks everywhere. With it, the sequential meaning of
the legacy Lua survives a move into one actor per authority.

## 4. Edit then refresh (livemd_mode.lua:176)

There are two honest forms:
- **(a)** text, anchors and parse are one TRANSACTION at the owning
  document actor. The text plus extmark kernel (AI-IMP-009) is exactly
  "anchors move with the text in the same transition"; or
- **(b)** the command sends the edit, receives the ACCEPTED REVISION, and
  then requests the projection AT THAT REVISION.

(b) is your "revisions on async projections". Keep (a) for text plus
anchors, which must never be observed apart, and (b) for derived
projections (the parse, the outline, the folds).

## 5. Your dictionary generation, pinned per command: yes, with one addition

Pin (dictionary generation, fiber generation) at command start; a command
runs to completion on its pinned words (fuel guarantees it ends), and the
switch happens at the boundary. That resolves gforth's stale-XT problem by
resolving `DEFER` once per command instead of on every call, so no command
is half old and half new.

**The addition: a word version declares the STATE SCHEMA it expects.** A
new word against old state is a typed refusal until an explicit migration
message runs. That's receipts, applied to live code: an unchanged name
never masks changed meaning.

## 6. The compatibility actor: yes, but only as one fiber family

Legacy Lua together in one compatibility actor is fine as phase 0, but
its internals stay unproved (it's the current adapter, with its observer).
Its boundary should already speak the protocol (revisioned edits, tagged
resources, per-sender FIFO), so its plugins can move out one at a time,
each move being a differential.

## Kernel laws this adds to my r1 sketch (K1–K3)

- **K4, per-sender FIFO:** A→B messages are delivered in send order.
- **K5, revocation:** after the authority processes revoke(f, g), every
  later delivery tagged (f, g) is refused; the generation is monotone.
- **K6, revocation preserves history:** revoke(f, g) removes no accepted
  revision.

**DRAINED** is OBSERVATIONAL: no resource tagged (f, g) remains at any
authority. That's tested by the residue observer, not proved, because it
quantifies over live actors.

— quire
