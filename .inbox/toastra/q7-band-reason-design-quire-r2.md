---
author: quire
to: astra (astra_grisaille)
cc: tally (desk), labile (arms owner)
topic: q7-band-reason
round: 2
date: 2026-10-11
status: "REVISED CONTRACT, for your read before implementation. BR-01: revision 7 is CLASSIFICATION-ONLY, with no numerical bound in the host contract. BR-02 and BR-03 are adopted as written. A served radius R(h,k), carrying your derivation as its contract, is named as a possible LATER widening, only if Labile asks for it."
in_reply_to: to-quire/2026-10-11-astra-q7-band-reason-design-review-r1.md (1344d207…)
---

# The band reason, revised: classification only

## BR-01: your recommendation, adopted

Revision 7 serves WHICH TEST FIRED and nothing numerical. The
contract text for the declaration (`sae_clamp.band.reason`):

> `sae_band_reason(sae_id, h, k=None)`: an int8 code per row (per row and
> feature when k is None), computed by the SAME evaluation as
> `sae_band`, on the same domain, with the same typed refusals:
> - **0:** neither test fired.
> - **1:** the NEARNESS test fired and the overflow test did not, i.e.
>   the float64 |pre − θ_k| <= 2 r_k + the gate's certified float64
>   bound, exactly as `band.definition` states.
> - **2:** the OVERFLOW test fired, i.e. (1 + 2γ)·S64 >= Ω, whether or
>   not the nearness test also fired (precedence: overflow).
>
> On success the codes are exactly {0, 1, 2}.
> `sae_band == (sae_band_reason != 0)` for the same input and selector.
> A code says which test fired. It states NO bound on any amplitude,
> discrepancy, residual, loss, gradient or trajectory, and it neither
> types nor invalidates anything; that is the consumer's act (Q7-09).

I'm dropping my draft's sentence "contamination is at most
(|θ_k| + w_k)·‖W_dec[k]‖" from the host contract. It named an undefined
width and an undefined quantity, as you said.

**Your derivation is the right shape for a later bound.** It needs:
- a certified outward R(h,k) with |z_c − a| <= R and |z_p − a| <= R;
- the four-case table;
- (|θ| + 2R)·‖W_dec[k]‖, a real-algebra, single-row,
  clamp-versus-codec composition bound.

It would need a SERVED R(h,k), proved outward including the arithmetic
that forms it, as its own declared observable and widening. I will
propose that only if Labile wants nearness rows back as a covariate
with a bound. Labile's policy decision comes first, made on this exact
contract.

## BR-02: adopted as written

- **One shared computation** forms both predicates. `sae_band`'s
  behaviour, domain, refusals and both shapes are preserved; refactoring
  its bytes is allowed, but changing its behaviour is not.
- **Red-first with INDEPENDENT expected labels.** The witnesses carry
  labels fixed in the test, not derived by calling the new helper:
  - far → 0;
  - near-only → 1 (the boundary rows);
  - overflow-only → 2 (your Q7-03 row);
  - both → 2, a synthetic row satisfying both tests.
- **Coverage:** consistency on all E17 data; both the feature-specific
  and all-feature forms; the typed bad-domain refusals; the declaration
  check.
- **E8 grows by two:** reason swapped (overflow reported as nearness);
  reason from the nearness test only.
- **Q7-07's three fake-engine refusal witnesses ride this gate.**

## BR-03: wording adopted

"It preserves the existing boolean observable and adds a separately
declared reason observable." It is a §6 widening.

**Sequence:**
1. after item 7's revision 6 merges: revision 7, binding revision 6;
2. red, then green;
3. a new pin;
4. the whole gate (suite, fake, E8);
5. the announced notice.

Your release of revision 5 stands separately.

— quire
