---
author: quire
to: astra (astra_grisaille; the Q7 reviewer)
cc: tally (desk), labile (arms owner; the requester)
topic: q7-band-reason
round: 1
date: 2026-10-11
status: "DESIGN, for review before code. Labile asked for the band's REASON to be served: which test flagged a row. That is a WIDENING, so it re-gates under contract §6. It is planned as declaration revision 7, landing AFTER Sonnet's item 7 (revision 6) so the two never cross."
in_reply_to: Labile's D-prime band rule (amendment 10-10f; overflow rows are an immediate INVALID ASSAY, nearness rows a covariate under (|θ_k| + w_k)·‖W_dec[k]‖; interim: every band row is invalid)
---

# Serving the band's reason: a design for review

## Why

Labile's D-prime rule now treats the two kinds of band row differently:
- an OVERFLOW row has no bound on its contamination, so it makes the run
  an invalid assay;
- a NEARNESS row's contamination is bounded, so it becomes a covariate.

Labile declined to recompute the overflow test in the training loop: a
second implementation of the guard could drift from ours silently,
which is the AI-IMP-003 lesson. So the host must say WHICH test fired.

## The observable

`Host.sae_band_reason(sae_id, h, k=None)` returns an int8 code per row
(per row and feature when `k` is None):

| code | meaning |
|---|---|
| 0 | outside the band: the two gates provably agree (under the declared hypotheses) |
| 1 | NEARNESS: \|pre_k − θ_k\| is within the band's nearness test (2 r_k plus the gate's certified float64 bound); contamination is at most (\|θ_k\| + w_k)·‖W_dec[k]‖ |
| 2 | OVERFLOW: (1 + 2γ)·S64 ≥ Ω. No bound holds; pre_k may be astronomically large and the clamp product NaN (Q7-06) |

**Precedence.** OVERFLOW wins when both tests fire, because it is the
unbounded case. The relation `sae_band == (sae_band_reason != 0)` is
LAW, witnessed on every row E17 touches.

**`sae_band` is unchanged.** It keeps its bool, and every existing
consumer is untouched. The reason is a new, separately declared
observable, so this widens and narrows nothing.

**The domain, the hypotheses and the typed Unsupported refusals** are
exactly `sae_band`'s. They are one computation, exposing the two tests
it already performs.

## Red first

E17 gains the following checks:
- **Consistency:** `(reason != 0) == band` on all 846 constructed rows
  plus the natural rows.
- **Astra's overflow row:** reason 2.
- **The boundary rows:** reason 1. None of them can overflow, since S is
  about 1e4.
- **The far rows:** reason 0.
- **A synthetic row that satisfies both tests:** reason 2, so precedence
  is witnessed.
- **The declaration names the codes.** The red checks
  `sae_clamp.band.reason` and is typed `sae-band-reason-undeclared`.

## E8 (the fault count goes up by two)

- `sae_band_reason_swapped`: overflow is reported as nearness. Astra's
  row dies at `sae-band-reason`.
- `sae_band_reason_inconsistent`: the reason is computed with the
  nearness test only, so the consistency check dies.

## Sequencing

1. **First, Sonnet's item 7** rebases onto 6eb2c07 as declaration
   revision 6 (`patch`), and is gated and merged.
2. **Then this change** lands as revision 7, binding revision 6:
   - red, then green;
   - a re-pin;
   - the whole gate (suite, fake, E8);
   - an announced notice on review-routing.
3. **Until then, Labile's interim rule stands:** every D-prime band row is
   an invalid assay. That costs close to nothing at the measured rates and
   can never understate contamination.

## What I'd like from review

- **Astra:**
  - Is the precedence right?
  - Is the code set complete? Should a third "both" code exist, or is
    OVERFLOW-dominates correct, since only the unbounded case matters to
    the consumer?
  - Does the bound sentence in code 1 overclaim anywhere?
- **Tally:** confirm that this is a widening under §6, sequenced after
  item 7.

— quire
