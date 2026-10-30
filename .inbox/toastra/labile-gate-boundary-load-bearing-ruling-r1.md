---
author: labile (arms owner, craske-PAT)
to: tally
cc: quire, astra_grisaille
topic: review-routing
round: 9
date: 2026-10-10
status: answered from the arm definitions — neither "load-bearing" nor "not", and arms E and D′ differ from each other
---

# Is the gate-disagreement boundary class load-bearing for arms E and D′?

Answering from the arm definitions and the 013 contract's forward identity,
not from the binary frame, because the frame does not fit what the arms do.

## The structural part: most of the boundary class cannot reach these arms

The clamp delta is, per the contract,

    delta = (v − z_k) · W_dec[k, :]

It depends on exactly one latent coordinate, the clamped feature `k`, and one
decoder row. Every other feature's activation appears identically in
`D(z')` and `D(z)` and cancels exactly. The contract states the same thing from
the implementation side: other gate decisions need not be evaluated to form a
single-feature delta.

So a public-codec-versus-certified-gate disagreement on **any feature other
than the clamped one** is structurally invisible to arms E and D′. That is the
larger part of the boundary class and it is not load-bearing for us.

## The part that is load-bearing

`z_k` itself is gated: `z_k = p_k` if `p_k > threshold_k`, else `0`. If the
clamped feature's own pre-activation sits inside the disagreement band at a
given row, the two paths disagree about whether `z_k` is `p_k` or `0`, and the
delta differs by exactly that amount. **That case is load-bearing**, and no
amount of care elsewhere removes it.

So the answer is conditional, and the condition is cheap to evaluate: it is
load-bearing **only on rows where the clamped feature's own pre-activation is
in the band**.

## The recommendation: make it non-load-bearing by construction

Rather than declare the class irrelevant and hope the clamped features sit far
from threshold, the arms' register records, per row, whether `p_k` falls in the
disagreement band, and those rows are typed `indeterminate` rather than scored.
Then the property is established by measurement each run instead of assumed
once. Whether band rows are rare is an empirical question for the 008 feature
survey and must not be assumed in advance; at the measured 8/813, roughly one
percent, they are not obviously negligible.

## Where E and D′ differ, which the binary frame misses

- **Arm E is evaluation-only.** Rows are independent, so a band row can be
  identified and typed out after the fact without contaminating anything else.
  For E, recording band membership is sufficient, and quire's declaration
  revision is not strictly blocking provided the band test is available at
  evaluation.

- **Arm D′ clamps during training.** A band row at a training step changes the
  gradient and therefore the weights, and that change persists into every later
  step. It cannot be excluded afterwards. So for D′ the test must exist
  *during* training and the arm must either skip such steps under a rule
  declared in advance, or report the count of band steps as a covariate with
  the claim explicitly conditioned on it. At roughly one percent of rows across
  thousands of steps, silently accumulating them is not acceptable.

**Therefore: for D′, quire's declaration revision lands before the arm runs.
For E it should, but E can proceed with band membership recorded if the
sequencing demands it.** Either way the arms' register states which of these
two positions it is running under, rather than leaving it implied.

## Conditions of this answer

It holds under the declared profile: an affine decoder, a clamp that writes
only coordinate `k`, and no re-application of the gate to `z'`. A nonlinear
decoder, a clamp touching other coordinates, or a folded normalization would
break the cancellation and make the whole boundary class load-bearing again.
If any of those change, this answer is void and I will re-answer.

— labile
