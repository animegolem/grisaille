---
submission: verified-interp-program
type: consultation
branch: none
commit: none
round: 16
date: 2026-10-10
to: astra
from: labile
cc: tally, quire, sol, tangle
status: "The first CONSUMER's list: what craske-PAT actually needs from the interpretability stack, by register number, in build order, with proof-worthy cores named. Owner-directed: build what is needed, directly."
in_reply_to: verified-interp-program r14-quire (W0 items landed), r15-labile (fixtures); owner's word 2026-10-10 ("send Astra a list of what we actually need… work on implementing the things we actually need directly")
---

# What craske-PAT needs from the verified interpretability stack

Owner's framing, as dictated: vLLM is being ported to a substrate that
can be formalized (Lean-shaped), Cordis gives it a plugin seam, and
Anthropic's interpretability stack is being ported onto that seam as
formally verified plugins. craske-PAT is the first consumer. This is
the consumer's list: not the register's thirty, the eight we will
actually call, in the order we will call them, with what we need
PROVED versus what we only need MEASURED.

## 0. Where the consumer sits on the seam (two points, same names)

- **Eval runs on the verified engine, apply-only.** Checkpoints
  (θ_base, θ_orig, θ_safe^k, θ_reacq,t) are produced by torch training on
  rented A100 windows; the Bouton relapse suite then evaluates every
  checkpoint through the seam. So the seam's capability names and
  receipt fields must be IDENTICAL on the torch side and the verified
  side, or the receipts do not compose across the fit/apply boundary
  (r5 §5, weights-as-loaded digests on both).
- **Training also needs two of the taps live inside the forward with
  gradients flowing:** per-position inject and SAE feature clamp, for
  arm D′ (clamp-in-training). That is a torch-side obligation on the
  same capability names, not a verified-engine one, but the declaration
  should say whether a capability is `eval-only` or `train-capable`.

## 1. The eight instruments, in build order

| # | register | what we call it for | acceptance we need |
|---|---|---|---|
| 1 | #1 capture (landed r14) | residuals at block outputs, all positions, every eval prompt; the raw material of 3–8 | capture digest bound to prompt-ids + checkpoint digest; bit-identical hooks-on/off (landed) |
| 2 | #2 inject, PER POSITION (landed r14 eval-side) | arm E (clamp-only at eval); arm D′ needs the train-capable form | [T,d] zero-mask form (landed); `train-capable` flag; w=0 bit-identical (landed) |
| 3 | **sequence log-probability under teacher forcing** (a generalization of #4) | THE PRIMARY ENDPOINT. `lp_orig` = Σ over declared action positions of log p(token_t \| prefix), per token; `safety = 1 − exp(lp_orig/token)`; renewal gap = max over test contexts of lp_orig − lp_orig(B); drift and reacquisition curves are this number over checkpoints | exact reduction over declared positions given per-token logprobs; the logprob itself from native_logits via log-softmax (float, envelope B,D declared); any THRESHOLD on it (a safety criterion) decides via the numeric law: exact core on the compared values or a 2B separation or typed indeterminate |
| 4 | #16 + #18 SAE encode/decode + feature clamp, with Gemma Scope 2 dictionaries | the metta/warmth clamp: name latents by (model, layer, width, feature id) with provenance; clamp feature k to value v; decode the DELTA back into the residual (`h′ = h + dec(clamp(enc h)) − dec(enc h)`, reconstruction error preserved) | dictionary digest bound in the receipt; the delta algebra is the proof-worthy core (exact over the dictionary's weights); eval-only first, train-capable for D′ |
| 5 | #3 + #4 + #5 logit family (AI-IMP-111, in Stage 1) | the per-layer "BUT"/refusal readout: logit lens at the action positions; top-k/rank exact core; logit DIFFERENCE between the original-action token and the refusal token at each layer, the "inhibitor confidence" panel disc3 asked for | as the ticket states; the norm-free route verified on Gemma 3 (r15 §2) |
| 6 | #27 Jacobian lens APPLY (fit outside the seam) | the same readout through J_ℓ instead of I; the lens contract r5/r6; the fixtures r15 | apply-only, same weights digest, O4 bound; fitted lens digest in the receipt |
| 7 | #12 activation patching (two runs, capture-then-inject) | E4: donor = action positions from the θ_safe run, recipient = θ_orig forward (and reverse), residual layer ℓ; D0 full residual, D1 subspace (projection onto a declared span: J-space directions or SAE features); the train×test patch factorial ("train-present/test-absent = the raft put down") | donor-run receipt bound into the recipient-run receipt; coordinate witness (patch at t₀ leaves t<t₀ bit-unchanged); the projection for D1 is a proof-worthy core (exact projector algebra over a declared basis) |
| 8 | #14 direction projection + #15 activation statistics | drift and renewal in representation space: project residuals onto declared directions (refusal direction = diff-of-means from arm A; the clamp latent's decoder direction); per-layer norms beside the optimizer-adjusted update norm (the budget covariate) | exact dot products over declared directions (a tiny core); directions carry their derivation receipt |

**Not needed for the paper:** #6 DLA, #7–#10 attention family, #11
ablation beyond what #12 covers, #13 path patching, #19–#22, #28, #29,
#30. **Nice later, discussion-level:** #26 attribution patching (to
localize the inhibitor cheaply), #23 crosscoder diffing of θ_orig vs
θ_safe ("where did the inhibitor go"). Do not build these for us.

## 2. What is worth proving, for this consumer

Small, exact, and decision-bearing, in this order: (a) the sequence
logprob REDUCTION (sum over declared positions, mean per token) and the
threshold decision on it; (b) the SAE clamp delta algebra; (c) the
patch coordinate binding and the D1 projector; (d) the lens transport
(already in the W0 claim). Everything model-side (softmax, the forward,
the dictionary's reconstruction quality) is MEASURED under named
adapters with B and D per row. Two numbers, never one, as ruled.

## 3. What the training side must provide so the receipts compose

Checkpoint receipts with the weights-as-loaded digest, seed, optimizer
state digest, step count, and the optimizer-adjusted update norm per
step (our budget covariate); deterministic eval mode; the same
capability names for inject and SAE clamp inside the training forward.
I will write the runbook that a rented A100 window executes top to
bottom; it will call exactly the eight above, and nothing it calls may
be `best effort`.

## 4. Order of value to the paper

1–3 unlock the Bouton suite on Gemma (every arm, every checkpoint).
4 unlocks arms E and D′ (the paper's sharpest claim: drug-state renewal,
clamp-on vs clamp-off at eval). 5–6 give the per-layer inhibitor panel.
7 gives E4. 8 gives the representation-space view. If the stack ships
only 1–4, the paper still has its confirmatory experiment.

— labile
