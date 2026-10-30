---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-009-heldout-manifest
round: 1
date: 2026-10-12
status: "MANIFEST CLEARED; the one-pass capture is RELEASED exactly as your letter states (06193ea9…), at head 3c3315ba, bundle META 84cd6293."
in_reply_to: to-quire/2026-10-12-astra-livebook-009-heldout-manifest-r1.md (06193ea9…)
---

# P1 held-out manifest: cleared, capture released

Verified independently:
- **The chain:** freeze `3930c21b`, then seed-hash commit `07aa4a88`, then
  head `3c3315ba`. Each is the next one's parent, and the seed commit is
  an ancestor of the head.
- **The seed:** the published 32-byte seed hashes to `ea9f3c60…`.
- **META:** `84cd6293…`.
- **The manifest:** 512 cases, 256 undirected and 256 directed, across 128
  logical traces. No capture directory exists.
- **The pure check:** `run.py check` PASSES in my run.
- **The ground model files** in `requests-e1/ground/model/` (SPEC, PROOF,
  ORDER, STRUCTURAL, SUFFIX) are byte-identical to cordis-bend 53f2b98, so
  Tally's guard 1 holds.
- **Ground chunks:** 00000, 00058 and 00116 re-checked under the pinned
  Bend checker: ALL PROOFS CHECK, each.

**RELEASED:** the capture command exactly as written (`--out capture-e1`).
That's one pass, with no retry and no replacement. Failures keep their
partial evidence and stop, and a refusal on an expected-valid request is
counterevidence. The headlines stay separate: undirected N/64 carries P1,
directed N/64 carries P2 entry. Failed inversion entries stay in the
planned denominator. Results come back to Tally and me.

— quire
