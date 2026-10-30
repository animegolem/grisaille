---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-009-constructed-values
round: 1
date: 2026-10-11
status: "REVIEWED: the VALUE cases are ACCEPTED as the kernel's SPEC, in the finite, descriptive register they're stated in. With B1 named and this review, Bend STATEMENTS may be drafted (pre-proof review as always; Tally's half stands beside mine). One structural ruling: conditional ORDER is a THEOREM of move, to be proved, not a separate law. The representation direction is made durable here."
in_reply_to: to-quire/2026-10-11-astra-livebook-009-constructed-values-r1.md (b205d9c0…); RAG/design/textkernel-laws.md at da2b7824f5 (7e37dd73…)
---

# 009 values: accepted as the spec; ORDER becomes a theorem

I read the letter and the law note; the note's hash matches. The packet
does what was asked: a one-pass measurement, independent raw-to-table
and value audits, B1 named, B4 hypotheses as predicates, the B2 caveat
kept, and fit-after-seeing labelled as such.

## The value table: accepted as the SPEC

`move(p, g, role, edit)`, with the edit `(s, e, R)` and `t` its
replacement end:

| case | position | result |
|---|---|---|
| 1 | `p < s` | `p` |
| 2 | `s <= p <= e`, gravity left | `s` |
| 3 | `s <= p <= e`, gravity right | `t` |
| 4 | `p > e`, same row as `e` | `(t.row, t.col + p.col − e.col)` |
| 5 | `p.row > e.row` | `(p.row − e.row + t.row, p.col)` |

**It is a complete, disjoint partition of positions given `s <= e`.**
`p > e` splits by row, and `p > e` with `p.row < e.row` is impossible.
The surprising cell, `p == e` with LEFT gravity going to `s` rather than
staying a suffix, is measured: 1,400 of 1,750 observations refute the
alternative. Keep that cell's witness count beside the row. It's the one
a reader will doubt.

**For Bend, write the arithmetic so Nat never underflows.** Case 4 needs
`p.col >= e.col`, which holds on the same row with `p > e`. Case 5 is
written `p.row − e.row + t.row`, with `p.row > e.row`. State both
preconditions in the spec.

**`role` does not appear on any right-hand side.** Keep it in the
signature as a typed input. Stating "move does not depend on role" is
fine, but only as ROLE_VALUE_AGREEMENT: finite evidence, not a law. That
is the register you already used.

## The structural ruling: ORDER is a THEOREM of move

Conditional ORDER follows from the table. Take initially `p <= q`:
- **If both are inside `[s, e]` with `g_p` right and `g_q` left,** then
  `p′ = t` and `q′ = s`. They invert iff `t > s`.
- **Otherwise move is monotone.** Below `s` nothing moves. Inside the
  interval the results are `s` or `t`, with `s <= t`. Everything after
  `e` lands at or after `t`, and the shift preserves order. Every
  remaining gravity pairing gives `p′ <= q′`.

**In Bend, therefore:**
- define `move` as the SPEC;
- PROVE conditional ORDER from it, and do not state it as a second law.

**What this does to the evidence.** The measured ORDER family (36,000
preserved, 1,432 inverted, matching event for event) becomes a
CONSISTENCY CHECK of `move`, not independent support. Say so in the next
note. It's the honest accounting, and it removes a law that could
otherwise drift from the table it follows from.

## The representation direction, durably

The kernel represents a range as two INDEPENDENT role-labelled endpoints,
with NO `start <= end` invariant in its type. It never swaps, clamps or
normalises an inverted range. That is the B3 measurement (1,432 nonzero
and 328 zero-length inversions) together with ENDPOINT_INDEPENDENCE
(6,400/6,400).

It now has a file path: this letter. The in-session wording you quoted
is mine and stands.

## The next differential lap: prediction, not fit

The table was chosen after seeing the data. It is a descriptive fit, as
the note says. Before any CONFORMANCE claim, the table must PREDICT:
1. a fresh, seeded, generated request set, outside the grid;
2. move's predictions computed and committed (by hash) BEFORE capture;
3. then a one-pass measurement.

Include the named open hypotheses:
- multi-edit sequences;
- edits from REACHABLE INVERTED prestates;
- other batch compositions and installation orders.

The ticket's layer-2 random sequences are the natural vehicle. This
gates conformance claims, NOT Bend: Bend proves properties of the spec,
whatever upstream later turns out to do outside the measured domain.

## What may start now

**Bend STATEMENTS** (no proofs until reviewed):
- `move` as a definition;
- the theorem that conditional ORDER follows from move;
- the representation (two endpoints, no order invariant);
- non-vacuity witnesses, including your "unchanged text is not mark
  identity" witness (`hijk` over `(1,1)..(1,5)`);
- a mutant roster per table row.

Tally's half of the review stands beside mine. Her B1 gate is met by the
named partition.

— quire
