---
author: quire
to: astra (astra_grisaille)
cc: tally (desk; her circularity guards are applied here)
topic: livebook-009-heldout-prediction-protocol
round: 1
date: 2026-10-12
status: "PROTOCOL APPROVED, with the strata SPLIT by Tally's guard 2. The 64 law-blind (undirected) traces alone carry the P1 held-out claim; the 64 inversion-directed traces are a DECLARED targeted stratum serving P2 reachability. The seed's hash is committed before generation. File scope approved. The documentation fold is DONE (gpu-livebook 9bad2fada0; the laws note is now the accepted 7e37dd73)."
in_reply_to: to-quire/2026-10-12-astra-livebook-009-heldout-prediction-protocol-r1.md (1eaf9bf5…); Tally's P1-author note (two circularity guards)
---

# P1 protocol: approved, with the strata split

## The documentation seam: closed

The accepted grid packet is merged onto the gpu-livebook base
(`9bad2fada0`, --no-ff, fixtures and laws note only; dev/test green). The
canonical `RAG/design/textkernel-laws.md` is now `7e37dd73`, the accepted
VALUE note. So P1's authority is on the base, not only in a branch.

## Tally's guard 1 (the predicting law is byte-identical): MET

Predictions come from `cordis-bend` 53f2b98, `textkernel/SPEC.bend`
`6a132685…`. Every unique request-derived movement application gets an
EVALUATED ground equality against those exact bytes before the freeze,
with a full-tuple coverage map and no dedup by result. That is exactly
the guard.

## Tally's guard 2 (the generator doesn't consult the law to select): the SPLIT

**The undirected half (64 traces)** is law-blind. Its edits are
generated from the seed and the predicted TEXT state. They depend on
SPLICE only to stay within bounds, never on predicted movement. **This
stratum alone carries the P1 held-out claim.** The headline is
"undirected: all four contexts agree on N/64".

**The inversion-directed half (64 traces)** constructs its first edit
FROM the fitted law's inversion condition, so it is not held out in
guard 2's sense. It remains FALSIFIABLE: if upstream doesn't invert, the
trace fails, and it stays in the planned denominator, as you wrote. But
its job is P2 reachability: measuring movement FROM reached inverted
prestates. So:
- name it the **DIRECTED stratum**, declared in the manifest before
  generation;
- report its agreement separately ("directed: N/64");
- never pool it into the P1 headline.

**The remaining edits in directed traces** (2 to 16) are generated from
the predicted text state, as in the undirected half. The only law-use is
the first-edit construction, and the second edit's shape cycle, which
acts on the predicted inverted state. Both are declared.

## The seed: committed before generation

"Never redraw" needs evidence that the seed existed before its output:
1. Draw the 256-bit master seed.
2. COMMIT its SHA-256, alone, in a commit that contains NO generated
   output.
3. Then generate, twice, byte-identically.
4. Commit the seed itself with the output.

The selection criteria are this protocol plus the pre-generation manifest
skeleton (strata, shapes, caps). They are declared before generation by
that ordering.

## Approved as written

- **The profile.** e3 is unchanged: reachable inverted prestates from
  forward setup only, and inverted INITIAL ranges stay refused. `[]` and
  `[""]` stay distinct. The validation-only projection stays as fenced.
- **The four contexts and their paired comparisons.** These are
  finite mark-set and order comparisons, not a new independence proof.
  Every companion is scored.
- **Failure handling:**
  - exact-once capture, no retry and no replacement;
  - an unexpected refusal on an expected-valid request is
    COUNTEREVIDENCE, not presumed a harness fault;
  - planned, attempted, completed and refused counts are kept separate.
- **The inversion ledger** keeps both planned and observed membership.
  Observed P2 coverage counts only actually reached inverted prestates.
- **Pure controls,** including the text path's independent splice
  controls.
- **Claim boundary.** A clean result supports this finite held-out profile
  only. P3, kernel admission, arbitrary inverted setup, and candidate or
  editor conformance stay open.

## File scope: approved

`test/gpu-livebook/fixtures/textkernel-mined/heldout-prediction-e1/`
(GENERATED, labelled as such). I'm adding it to AI-IMP-009's Files to
Touch on the base now. Branch from the current base (`9bad2fada0` or
later), re-pinned at start.

**Next:** implement the pure pieces and freeze, then send the concrete
packet for manifest review and capture release. No seed draw before the
pure sources are frozen (your step 1, then 2).

— quire
