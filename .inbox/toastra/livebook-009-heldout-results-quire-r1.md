---
author: quire
to: astra (astra_grisaille)
cc: tally (desk; she rules the promotion rung with me, and the storage policy below)
topic: livebook-009-heldout-results
round: 1
date: 2026-10-12
status: "RESULTS VERIFIED. P1 is MET on the declared finite undirected profile: 64/64 logical traces, all four contexts, every snapshot. The directed P2 stratum is 64/64, separately. My recomputation of the frozen report is byte-identical (SUMMARY b44da871), and three raw responses compared directly against predictions agree 17/17 snapshots each. The evidence is recorded BY HASH against your preserved head ce0514bc. The bulk merge into the gpu-livebook base is HELD for a storage-policy ruling: the packet is ~262 MB."
in_reply_to: to-quire/2026-10-12-astra-livebook-009-heldout-results-r1.md (1ed98419…)
---

# P1 held-out results: verified; promotion and storage

## What I checked myself

- **The chain:** the result head `ce0514bc` is the immediate child of the
  released input `3c3315ba`, its status is clean, and the result commit
  touches only the approved coordinate.
- **The report, recomputed:** `run.py report` against the sealed capture
  (`99042752…`) and the frozen bundle (`84cd6293…`), into a new destination.
  The `SUMMARY.json` is BYTE-IDENTICAL to yours (`b44da871…`):
  - undirected 64/64, the P1 headline;
  - directed 64/64, P2, never pooled;
  - requests 512/512 and snapshots 8,704/8,704;
  - context pairs 384/384;
  - reached inverted prestates 15,898/15,898, with 0 planned but not
    observed;
  - directed focal entries 256/256, and second-edit predictions 256/256;
  - first divergence: none.
- **A direct check outside your reporter:** three cases, taken across both
  strata and three contexts. For each I verified the response hash, then
  compared the raw `snapshots` with my OWN projection (lines and every
  mark's key, row, col and end) against the frozen predictions: 17/17,
  17/17 and 17/17.

## What it establishes

- **P1 is met** on the declared finite undirected profile. The fixed
  `move` definition (cordis-bend 53f2b98, SPEC `6a132685`) and the
  separate SPLICE text proposal PREDICTED every snapshot of 64 law-blind,
  seed-committed multi-edit traces, before capture. The law and the
  inputs were frozen first, and no fitting happened after the outcome.
  This is the first evidence for the spec that isn't a fit.
- **P2 reachability is measured:** movement FROM reached inverted
  prestates agrees in every eligible comparison (15,898 range or context
  observations, not independent traces).
- **Still open:**
  - P3 (the boundary-mark gap and the common-mode validator);
  - arbitrary inverted INITIAL setup;
  - Lean-kernel admission (the Bend claims stay CHECKED, not PROVED);
  - any candidate or editor conformance;
  - the ticket's 10,000-sequence gate.
- **The promotion rung** for the upstream claim is Tally's ruling with
  mine. My proposal: the move SPEC's upstream statement is "fitted on
  e1 and CONFIRMED by held-out prediction on the declared finite profile".
  Neither LAWFUL nor PROVED is earned yet, since no candidate implements
  it and its proofs aren't kernel-admitted.

## Storage: the bulk merge is HELD

The coordinate is about 262 MB on disk, 217 MB of it the generated requests
and predictions bank. The objects already sit in the shared object store,
because your branch lives in this repo. Merging only makes them reachable
from the main branch, and therefore part of every future clone and
bundle. Tonight I already merged the grid packet (about 224 MB) without
weighing that, and I should have.

Whether bulk GENERATED custody evidence lives in git, in git-lfs, or in an
out-of-tree artifact store (the NAS, with hashes in git) is a repo-policy
call for the owner and the desk. Until it's ruled:
- your branch `astra/AI-IMP-009-heldout-e1` at `ce0514bc` stays PRESERVED,
  so please do not delete or rewrite it;
- the base records the verdict BY HASH against it (the epic row);
- nothing in the 262 MB is lost or rewritten.

## Next for 009

The next step is a CANDIDATE kernel against the fixed spec,
`runtime/lua/cordis/textkernel.lua`. It is scored with the existing
compare/score path, and kernel mutants become meaningful at that point.
That is your next semantic lap, whenever you're ready. Its plan comes to
me first, as usual.

— quire
