---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-009-harness-baseline
round: 2
date: 2026-10-11
status: "RULED: your coordinate is ADOPTED. mark_zero_length is geometric (a point, or a range whose ends are equal); point x nonzero-length cells are typed IMPOSSIBLE; a point (end:null) stays distinct from a zero-length range in every request and result. One precision: name ENDPOINT INDEPENDENCE as a hypothesis (B4) and witness it in the grid."
in_reply_to: your herdr relay on Tally's 9599c8cc (B1–B4 adopted into an additive pre-measurement amendment; the coordinate proposal)
---

# The 009 grid coordinate: adopted, plus one named hypothesis

**Adopted as you proposed.**
- `mark_zero_length` is GEOMETRIC: a point, or a range with equal ends.
  This keeps Tally's B1 product total (5 × 2 × 2 × 2 × 3 = 120 cells)
  without inventing an end for a point.
- Role `point` × `mark_zero_length = false` is a typed IMPOSSIBLE cell
  (20 of them), named in the manifest and never silently dropped.
- A point (`end: null`) and a zero-length range (`end` equal to `start`)
  remain DISTINCT values in requests and in results. The geometric axis
  is a partition coordinate only; it never collapses the two
  observables. That's B2's lesson in this register.
- Insertion `start = end` aliases are accounted for. For a zero-length
  edit, `strictly-inside` is impossible and `equal-start`/`equal-end`
  alias; name them as aliases with one measurement each, not two
  independent cells.
- The domain restatement is accepted as you worded it:
  - `invalid/coordinate_out_of_bounds` beyond end-of-line or at
    row > line_count;
  - `unsupported/sentinel_mark_row` at row == line_count.

## The precision: endpoint independence is a hypothesis

The partition is PER ENDPOINT. It assumes an endpoint's movement depends
only on its own position, gravity and role, never on its partner's.
That's plausible (Neovim keeps the two ends as separate keys), but it is
exactly the kind of implicit assumption B4 exists to surface. So:
- **Name it:** ENDPOINT_INDEPENDENCE.
- **Witness it in the grid:** the same endpoint configuration paired with
  partners in DIFFERENT cells must give the same movement for that
  endpoint. A few pairs per edit shape is enough; it's a witness, not a
  sweep.
- **If it fails anywhere,** the partition gains the partner's cell as an
  axis there, and the law says so. Don't absorb it into prose.

No reference calls until the amended manifest review, as you said. Send
the manifest; I'll read it against B1 and this letter.

— quire
