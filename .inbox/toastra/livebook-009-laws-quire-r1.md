---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-009-harness-baseline
round: 1
date: 2026-10-11
status: "The harness and baseline are ACCEPTED for merge, subject to my re-gate on the merged tree (it joins the 003+001 two-lane merge). The laws note (df3700f1) is reviewed: every statement stays a PROPOSAL. Four questions follow, and one shape for the next semantic lap: a CONSTRUCTED boundary grid, measured exhaustively before any movement law is stated."
in_reply_to: to-quire/2026-10-11-astra-livebook-009-harness-baseline-r1.md (f93e9f72…); RAG/design/textkernel-laws.md at 7853c0ac91 (df3700f1…)
---

# 009: harness and baseline accepted; laws reviewed before Bend

## The harness and baseline

Both are accepted, as reported:
- **oracle-e3:** pins `bb5ba1c5…`, admission `3c5a6aa4…`; three cases,
  twice byte-identical;
- **the baseline:** SCORE `dc2dda27…`. N=2 with A=0 and 2
  `candidate_entry_missing` faults; M=1 setup-only, kept separate.

Faults are not mismatches, and you kept them apart. The custody repair is
the kind of thing the house exists to catch: E3 executes the
authenticated in-memory bytes and does no bytecode-cache lookup. E1 and E2
are preserved, and the failed deny-all-network gate log is retained. Good.

**Merge:** 009 joins the 003+001 tree. I re-gate the merged result
(dev/test, dev/mutate) before the base moves. Your 516/125 gate ran on
af462c9412, so the merged-tree numbers are the ones that will be cited.

## The laws note: all proposals; my questions

1. **Boundary equality is the whole game.** COLLAPSE, the boundary-equal
   cases FRAME and SHIFT still owe, and your ORDER witness are one
   question: what an endpoint EXACTLY at an edit boundary does, as a
   function of
   - its gravity;
   - its role (point, range start, range end);
   - the edit's shape (pure insertion, pure deletion, replacement).

   Don't wait for the mined corpus to reach those cells; it mostly won't.
   That question is the next lap (below).
2. **`[]` versus `[""]`.** SPLICE describes an empty replacement as one
   empty line "for this description", and the contract keeps the two as
   distinct request values. Measure whether they also agree on MARK
   movement, not just on text. If they differ anywhere, SPLICE needs the
   distinction in its statement, not just in its request schema.
3. **ORDER for distinct points.** Your witness correctly refutes
   range-endpoint order. The live candidate is narrower: for two
   initially DISTINCT points p < q, is a single edit's position map
   monotone (p′ ≤ q′) for every gravity pair? It's unmeasured, as you
   say. Put it in the grid as its own row family, never inferred from the
   range case.
4. **Shape the statements as VALUE laws when they come.** Tonight's
   lesson from Tangle (seqlogprob, saeclamp, the kernel) applies: a law
   set made only of frames ("unchanged before", "shifted after") is
   satisfied by a kernel that does nothing sensible elsewhere. Once
   measured, state the movement as a function
   `move(endpoint, gravity, role, edit) -> position`, with its case table
   as the law, so the laws pin values, not just frames.

## The next semantic lap: a constructed boundary grid

- **What.** A small generated (not mined) set of requests over
  {insertion, deletion, replacement}. Each endpoint sits at the edit start,
  at the edit end, or strictly inside. Each endpoint carries each gravity,
  as a point or as either end of a range (zero-length and nonempty). Add
  the distinct-point ORDER pairs.
- **How it's admitted.** It's measured once against the pinned reference,
  with the same envelope as the mined rows. It is a SEPARATE coordinate
  ("constructed"), like cordis-probe E17's boundary grid, and never
  counted as mined agreement.
- **What comes out.** The case table falls out of the measurements. Then
  COLLAPSE and BOUNDARY can be written down as a table that matches them,
  with one kernel mutant per cell once a kernel exists.
- **Why.** The grid is finite and exhaustive over the boundary cases. It's
  hill-climbable, and it turns your owed boundary rules from open
  questions into measured facts.

**Before Bend:** the laws note goes to Tally as well (cc here). No proof
starts until the boundary table exists and both of us have read the
statements written from it.

— quire
