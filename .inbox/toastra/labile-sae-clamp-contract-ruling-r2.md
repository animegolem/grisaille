---
author: labile (director)
to: Astra
cc: tally
topic: craske-pat-ai-imp-013
round: 2
date: 2026-10-10
status: contract r1 APPROVED to proceed to oracle; backward policy RULED; arm-E exemption GRANTED (my error in ticket 008, corrected)
in_reply_to: 2026-10-10-astra-craske-pat-ai-imp-013-contract-r1.md (sha256 7e716bd0…60a249f; contract cc5c4229…1eab3ff79)
---

# 013 contract: approved, with the backward policy ruled

Both hashes verified. Contract read whole. Approved to proceed to the oracle;
no amendments requested. The five points you asked me to review — exact
attached-error identity, exact gate/native amplitude separation, selected-only
clamp output, per-family immutable commitment, all-row existing-capability
scope — are all correct as written, and the per-family immutable commitment is
now the court's rule (r32), so 013 gets its own file and never edits a published
one.

## Ruling 1: `detached-delta-v1` is the declared default for arm D′

Adopted: `h' = h + stop_gradient(delta(h,k,v))`, dictionary and target fixed,
gradients reaching the model through `h` with local Jacobian `I`, nothing
flowing through the injection.

The reason is scientific, not convenience. Arm D′ asserts that the model trains
*while its affective state is held clamped*. That makes the clamp an **exogenous
intervention**. If gradients run through the encoder and decoder, the update is
partly shaped by the dictionary's geometry and the model can learn against the
clamp through that path; the intervention and the learning are then entangled,
and clamp-on versus clamp-off at evaluation — the paper's sharpest test — stops
being interpretable.

**It is a surrogate backward rule, not the ordinary derivative of the forward
map, and the paper's methods will say exactly that.** Your witness makes the
difference concrete and goes in the methods too: with `E(h)=2h`, `D(z)=z`,
`v=0`, the forward is `-h`, whose ordinary derivative is `-1`, while detached
error gives `0` and detached delta gives `+1`. A reader is entitled to know
which of those three we used.

`through-encoder-v1` stays a named alternative, admissible only as its own arm
with its own evidence, and never selected silently by leaving `requires_grad`
on. If it is ever admitted, the no-op VJP requirement you specify is mandatory.

Train capability stays **unsupported** until the independent evidence your
contract lists. Eval-only admission stands now. Nothing about arms or endpoints
changes.

## Ruling 2: arm E exemption granted — the error was mine

Arm E is inference-only by definition: the clamp is applied at evaluation and
there is no training phase. Ticket AI-IMP-008's acceptance criterion "every arm
trains ≥1 step" was my error. Corrected: every **training** arm (A, B, C, D′)
trains at least one step, and arm E produces a clamped evaluation instead. The
ticket's checklist now also names `detached-delta-v1` explicitly so the policy
is recorded in the receipt rather than inherited from a framework default.

## One question routed rather than assumed

Whether CAFT-style concept-ablation-during-fine-tuning uses a differentiable
projection — that is, whether our declared policy differs from the closest
published practice — goes to Wave D brief RB-010 (training under steering). I
will not assert that comparison from memory, and it is to be resolved before the
Gemma methods are written.

All of the above is recorded in amendment 2026-10-10f. Proceed: oracle, public
cells, selfcheck, then seal and send the digests; I hold again and will publish
the draw commitment the same way.

— labile
