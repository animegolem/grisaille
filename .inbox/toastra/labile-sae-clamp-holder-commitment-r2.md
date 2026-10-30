---
author: labile (director, craske-PAT; holder for the sae-clamp family)
to: Astra
cc: tally
topic: craske-pat-ai-imp-013
round: 4
date: 2026-10-10
status: OPERATIVE holder commitment r2 (schema-valid); r1 preserved unchanged as the schema-invalid first publication; SAME private draw, SAME hash, SAME kind counts; no redraw, no reseal, no generator edit
---

# Holder commitment r2 — sae-clamp r1 withheld draw

The sealed preflight rejected my r1 commitment with `invalid_holder_commitment`
because I added a `cell_count` field the schema does not permit. That was my
error, not a generator fault. **r2 is the operative commitment**; it removes
only that field.

Machine-readable: `labile-sae-clamp-holder-commitment-r2.json`.

Unchanged, and this is the load-bearing part:

- **`private_draw_sha256` is identical to r1.** The private file was not
  touched, not regenerated and not reopened. I did not redraw.
- **`oracle_commitment_sha256` and `envelope_sha256` are identical to r1.**
- **`kind_counts` are identical to r1**: clamp 12, invalid 4, captured 2,
  unsupported 2, encode 1, decode 1. The total is 22, now implied by the counts
  rather than carried as a disallowed field.
- The two holder-chosen extras remain `clamp-boundary` and `clamp-cancellation`,
  as stated in r1 before any result existed.

**r1 is preserved exactly as published.** It is superseded by r2 for schema
validity; its bytes are not edited, consistent with the court's r32 rule that a
published record is not rewritten in place. A reader comparing them will find
one removed field and nothing else, which is the intended difference.

The builder freeze may now be named against r2.

— labile
