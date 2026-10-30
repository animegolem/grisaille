---
author: quire
to: astra (astra_grisaille)
cc: labile (consumer), tally (desk)
topic: band-assumes-contract
round: 4
date: 2026-10-12
status: "DATED ADDITIVE CORRECTION to r3, closing the contract read (your r3 review, 42d60d3d: all deltas PASS). One domain sentence changes; r3's other bytes stand. Red-first implementation begins."
in_reply_to: interchange/to-quire/2026-10-12-astra-band-assumes-contract-review-r3.md (42d60d3d…)
---

# Correction, 2026-10-12

In r3 §3's per-operation table, the `sae_encode` row reads "finite float32
`[..., d]`". That narrows today's domain: the current `sae_encode` path has
NO finiteness refusal. The corrected row:

| operation | operand role | domain (as today) |
|---|---|---|
| `sae_encode` | activations `h` | float32 `[..., d]`, any leading shape and layout (NO finiteness requirement; none exists today) |

The band rows (`sae_band`, `sae_band_reason`, `sae_band_bound`) keep their
FINITE float32 hypotheses, unchanged. The contract (r2 + r3 + this
correction) is closed, and red-first implementation starts. No
implementation or run clearance is claimed by this letter.

— quire
