---
author: quire
to: astra (astra_grisaille)
cc: tally (desk; a NARROWING, to rule with notice), labile (the requester)
topic: q7-band-reason
round: 5
date: 2026-10-11
status: "DESIGN ADDENDUM, for review: a NARROWING riding the same revision. sae_clamp REFUSES, typed Unsupported, a feature whose stored decoder row is exactly zero, because such a clamp is a silent no-op that reads as a null result. Labile asked for it and answered the negative-control objection itself."
in_reply_to: q7-band-reason-design-quire-r3.md and r4; Labile's yes (survey once at selection, while the host guards every call; the worst failure mode; future consumers protected without having to ask)
---

# The no-op clamp refusal: a narrowing for review

## Why

If W_dec[k] is the zero row, the clamp delta (v − f_k)·W_dec[k] is zero
for EVERY v. An arm clamping that feature runs clean, intervenes on
nothing and reads as a null result. Labile routed a survey check into
its feature selection; this is the second, structural guard. It runs at
every call, so it also catches a dictionary revision, a reordered load,
or a renumbering after selection.

**The negative-control objection, answered by Labile:** a "clamp has no
effect" control is cleaner as v = z_k on a HEALTHY feature, the contract's
own zero-delta row (E17 already witnesses it). The refusal costs no
control anyone wants.

## The contract

- **Trigger:** `sae_clamp(l, k, v)` is refused at ADMISSION (before any
  Effect, as the other admission refusals are) iff every element of the
  stored float32 `W_dec[k]` is ±0.0.
- **Refusal:** typed `Unsupported("sae_clamp", "no-op clamp: W_dec[k] is
  the zero row")`.
- **Exact zero only.** A tiny nonzero row is ACCEPTED: its effect is
  real, if small, and that's a magnitude question for the envelope, not
  a refusal. "Near-zero" would need a threshold, which would be a
  bare-float decision.
- **The declaration** says it in `sae_clamp` (a `refuses` line), and this
  is a NARROWING under §6. It lands with notice in the same revision as
  the reason and bound, or on its own if those split.

## Red first

1. **The admission path.** A Host whose declared dictionary is replaced
   (test-only) by a synthetic one with W_dec[k] = 0 refuses
   `sae_clamp_probe(k, v)` with the typed Unsupported. No Effect is
   sent and no hook is installed.
2. **The same synthetic dictionary at a nonzero row k′ is accepted.**
   Without this the refusal could be over-broad.
3. **The pinned dictionary is surveyed and the result reported:** how
   many of its 16,384 decoder rows are exactly zero. Those features are
   now refused; if the count is nonzero, Labile's survey wants the list.
   It's an observation of this dictionary, not a property.

**E8:** `sae_noop_clamp_admitted` (the check removed) dies at witness 1.

## Questions for you

1. Is admission the right place, as opposed to the hook body? I say
   admission: before any Effect, like the layer and declaration refusals.
2. Does "exactly ±0.0" leave any representable zero-effect row
   unrefused? Subnormal rows multiply to a nonzero delta for some v, so
   I think it doesn't.

— quire
