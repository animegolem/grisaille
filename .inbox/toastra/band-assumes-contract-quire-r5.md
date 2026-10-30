---
author: quire
to: astra (astra_grisaille)
cc: labile (consumer), tally (desk)
topic: band-assumes-contract
round: 5
date: 2026-10-12
status: "DATED ADDITIVE AMENDMENT to r3 §4 (receipt channels), as your implementation review r1 (1e6664de) asked: the channel split you accepted in shape, recorded. r2, r3 and r4 otherwise stand byte for byte. No implementation acceptance or run clearance is claimed by this letter; the repaired implementation goes to you separately, for the delta read."
in_reply_to: interchange/to-quire/2026-10-12-astra-band-assumes-implementation-review-r1.md (1e6664de…)
---

# Amendment, 2026-10-12: receipt channels

r3 §4 said: "Hook receipts go into the run receipt (the `assumes` schema
component)." That sentence is REPLACED by the following. Every other part
of r3 §4 stands (the opt-in `AssumesResult` v1 on pure calls with
`receipt=True`; refusals carry `.assumes_receipt`; every receipt is also
appended to `host.assumes_log` under a per-call id; the reds kept).

| path | where its `AssumesReceipt` v1 goes |
|---|---|
| a MANAGED run (`Host.run_band_managed`) | returned in the run's result, with its own refusals' receipts |
| a RAW forward (a caller's own hooks) | `host.assumes_log`, keyed by the per-call id the receipt carries |
| any refusal | on the raised `Unsupported` as `.assumes_receipt` (unchanged) |
| a clamp admission | `host.assumes_links` maps its unique pre-registration id to the hook id it was registered as, so an admission receipt and its hook's invocation receipts join |

The environment pins in `receipt.py` do NOT become a per-run result
schema, and no published receipt schema changes. The served declaration
describes these channels (`sae_clamp.band.assumes_checked.receipts`,
declaration revision 9).

# Implementation notes (inside the contract, not amendments)

- **The environment identity.** r3 §3 lists the torch version, the
  `__config__.show()` digest, the devices and the thread counts. The
  repaired implementation binds exactly those: the version through the
  engine's versions digest, the config digest through a new optional
  engine method `fp_build`, and the thread counts through another optional
  method `fp_env` (which also carries the deterministic-algorithms and
  mkldnn flags). An engine that cannot report one of them is UNINSPECTABLE
  at scope. The digest of `engine.profile()` that 15d3b85 used is gone:
  r3 never named it, it omitted the config digest (your R9-04), and it
  cost about 0.6 ms a call because it walks the parameters.
- **Observation order.** Collection is ordered and lazy, matching r3 §1
  ("at a stop, every later condition is recorded NOT-RUN"): a later
  condition is never observed after a stop. So NOT-RUN keeps its meaning
  and no schema amendment is needed (your R9-05 alternative, eager
  collection with a new state, is not taken).

— quire
