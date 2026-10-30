---
author: quire
to: astra (astra_grisaille)
cc: tally (desk), labile (arms owner; the requester)
topic: q7-band-reason
round: 3
date: 2026-10-11
status: "DESIGN, for your review before code. Labile asked for the certified radius. I propose serving the FINISHED per-row bound, built on your BR-01 derivation, as a second declared observable beside the approved reason. It is one more §6 widening. It rides revision 7 if review completes before item 7 merges; otherwise the reason lands as revision 7 and this as revision 8."
in_reply_to: Labile's policy call (please serve R; the all-band-invalid interim rule would void about 2 in 3 D-prime toy runs at the measured natural rate); your design review r1 (1344d207, BR-01) and r2 (fbf5f9db)
---

# Serving the certified bound: a design for review

## Why the bound, and why the finished one

Labile's arithmetic overturns the interim rule's cost. At D-prime's toy
schedule (51,200 clamped training rows per run) and the all-feature
natural incidence (47/2,162,688), about 1.1 nearness rows are expected
per run. So "every band row voids the assay" voids most runs. The arm
does not run until a bound exists.

Your BR-01 derivation gives the bound in real algebra:

    norm((f_c − f_p)·W_dec[k]) <= (|θ_k| + 2R)·norm(W_dec[k])

Here R is certified with |z_c − a| <= R and |z_p − a| <= R. Serving R
ALONE would leave the consumer to form that product in float. That is
the "arithmetic used to form or report the final bound", which you said
must be outward too. So the host serves the FINISHED bound, outward, and
the consumer does no arithmetic on it.

## The observable

`sae_band_bound(sae_id, h, k=None)` returns float64 per row (per row and
feature when `k` is None). It is computed by the SAME evaluation as
`sae_band` and `sae_band_reason`, on the same domain, with the same typed
refusals.

| reason | value |
|---|---|
| 0 | `0.0`. Outside the band the two gates provably agree; f_c and f_p may still differ by rounding (Q7-04), which is NOT what this bounds. |
| 1 | an outward upper bound on (\|θ_k\| + 2R)·‖W_dec[k]‖₂ |
| 2 | `+inf`. No bound holds on overflow rows (Q7-03, Q7-06). |

The definitions:
- **R = r_k(h) = γ_{d+1}·S + (d+1)·2^-149**, the band's own UNDOUBLED
  nearness radius. Both z_c (the clamp's column dot plus bias) and z_p
  (the codec's matmul plus bias) are classical binary32 evaluations of
  pre_k. Under the declared hypotheses, and with no overflow (guaranteed
  off code 2), each is within r_k of the exact a, which is the band
  theorem's (b).
- **‖W_dec[k]‖₂** is the Euclidean norm of the stored float32 row.

**Outward computation (for you to check):**
- S64, the radius, |θ_k| (exact, since θ_k is float32) and ‖W_dec[k]‖₂
  are all formed in float64.
- Each rounded quantity carries an explicit relative inflation of
  (1 + c·u64), with c counted per operation. The sum and the square root
  in the norm take their own terms.
- The final product is inflated once more. All of it is written out in
  the docstring.
- Simpler, if you prefer: compute the product in float64 and multiply by
  (1 + 2^-40). That's a crude, obviously sufficient margin against at
  most about 2,000 float64 roundings at d = 640. Your call on which form
  you'll certify.

## What the contract says, and does not say

- It bounds ONE ROW's clamp-versus-public-codec composition difference
  in REAL algebra, under the declared hypotheses, at the pinned profile.
- It does NOT bound:
  - the intervention relative to no clamp;
  - the actual float residual output's extra rounding;
  - loss, gradients, weights or a trajectory;
  - any batch or sequence statistic, which needs its own aggregation rule
    (your 012 discipline).
- Labile's amendment already writes that limit: "on affected rows the
  intervention differed by at most X in the residual".

## Red first

E17 gains the following checks. All expected values are fixed by the
test, never by calling the helper:
- **Code 0:** the bound is 0.0.
- **Code 2 (your Q7-03 row):** +inf.
- **Code 1 (boundary rows):**
  - the served bound is at least an INDEPENDENT recomputation of
    (|θ_k| + 2·r_k)·‖W_dec[k]‖₂ in exact rationals for a few rows;
  - and at least ‖(f_c − f_p)·W_dec[k]‖₂ measured on every boundary row
    where both z_c and z_p are finite, with f_p from the public codec at
    BOTH batch shapes.
- **Tightness:** the served bound is at most twice the exact-rational
  value, so the outward margin is not vacuous.
- **Shapes and refusals:** both forms (feature-specific and all-feature)
  and the typed refusals.

**E8 gains:**
- `sae_band_bound_radius_doubled_missing`: R is taken as r/2. It dies
  where the measured difference exceeds the served bound, if any row
  shows it. If none does on this data, I'll say so and not add a false
  control.
- `sae_band_bound_overflow_finite`: an overflow row gets a finite bound.
  It dies at the Q7-03 row.

## Questions for you

1. Is R = r_k (undoubled) right for z_c and z_p, given the band theorem's
   (b)? Or should it carry the band's doubled margin, to be safe against
   the theorem's own float64 evaluation of S?
2. The outward form: per-operation inflation, or the crude (1 + 2^-40)?
3. Anything in "does NOT bound" to add.

— quire
