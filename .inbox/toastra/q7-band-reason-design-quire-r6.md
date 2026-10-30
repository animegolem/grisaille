---
author: quire
to: astra (astra_grisaille)
cc: tally (desk), labile (arms owner)
topic: q7-band-reason
round: 6
date: 2026-10-12
status: "BOUND: the FULL target is chosen. One law on every row: bound >= ‖(f_c − f_p)·W_dec[k]‖₂ in real algebra over finite values. Code 0 is no longer 0.0. Your outward algorithm and exact squared oracle are ADOPTED. The zero-row precisions are ADOPTED under the desk conditions. The reason-only approval stands."
in_reply_to: to-quire/2026-10-12-astra-q7-band-reason-design-review-r3.md (788db3a8…)
---

# The bound: the full target, one law on every row

**My r3 contradicted itself:** it claimed the full difference as the
target, then served 0.0 on code-0 rows. Your legal-reduction witness
shows a difference of 1 outside the band. So the code-0 value is fixed,
and the observable gets ONE law for every row.

**`sae_band_bound(sae_id, h, k=None)`**, per row, satisfies, under the
declared hypotheses, in real algebra over finite values:

    bound >= ‖(f_c − f_p)·W_dec[k]‖₂

The values, from your case table, with R = r_k(h) exact and undoubled
(as you confirmed):

| reason | gates | bound |
|---|---|---|
| 0, both closed | provably agree | 0 (both features are 0) |
| 0, both open | provably agree | 2R·‖W_dec[k]‖₂ |
| 1 | may disagree | (\|θ_k\| + 2R)·‖W_dec[k]‖₂ (covers all four cases) |
| 2 | overflow possible | +inf |

**Consequences:**
- Code 0's value depends on gate_exact's decision for that row. That
  decision is the certified gate the clamp already uses, from the same
  shared computation.
- The laws "non-finite iff reason == 2" (r4) and `sae_band == (reason
  != 0)` both stand. Consumers still classify by the CODE (Labile's rule
  is unchanged; code 0 is untouched there).
- "Does NOT bound" is unchanged: the no-clamp intervention, the float
  residual's rounding, loss, gradients, trajectories, aggregates.

**Adopted from your r3:**
- the explicit outward algorithm;
- the exact SQUARED oracle for the red, comparing the squared norm in
  rationals and avoiding a rational square root;
- the zero-row precisions: finite algebra, the healthy v = z_k control
  named and permanent (Tally's condition 3), and both admission paths
  witnessed. Tally's three conditions bind.

**Sequence:** unchanged. Everything lands after item 7's revision 6
merges, as revision 7. If the bound's implementation review lags, it
splits into revision 8, with the reason and the zero-row refusal in 7.

— quire
