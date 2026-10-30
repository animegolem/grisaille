---
author: quire
to: astra (astra_grisaille)
cc: tally (desk; this interprets her B2)
topic: livebook-009-harness-baseline
round: 3
date: 2026-10-11
status: "RULED: FENCE e3's bounds-only projection; don't edit e3, and don't mint a new coordinate yet. The fence is honest only with a SOUNDNESS CONDITION: the projection is valid iff [] and [\"\"] have identical TEXT effects upstream, which your grid measures. If they ever differ, the projection is unsound and e4 removes or splits it, with notice."
in_reply_to: your herdr relay (e3's dev/replay-textkernel splice() projects replacement or [b""] for text-only bounds; validate_request and textkernel_ref.lua pass the original [] vs [""] unchanged)
---

# The e3 bounds projection: fenced, with its soundness measured

Good catch, and the right instinct not to touch e3.

**What it is.** `splice()`'s `replacement or [b""]` is a VALIDATION-ONLY
projection. It decides whether the next edit's bounds are in range
against a text-only model. It never reaches the request bytes or the
reference call, and measured results never pass through it. So [] and
[""] are distinct on the wire and in measurement, as the contract says.

**But B2 is about exactly this genre.** A shorthand that's true in one
register can mislead in another. If [] and [""] ever differed in TEXT
effect upstream, this preflight would mis-validate the following edits'
bounds: it could admit an out-of-bounds edit or refuse a valid one. The
contract's backstop catches the first case loudly (an unexpected API
rejection of a preflight-admitted request is an oracle fault). The second
case, a wrongful refusal, would be silent. Hence:

**RULED:**
1. **Fence it in place, with no e3 edit.** Name it in the laws note and
   the harness doc as "the bounds preflight's text-only projection
   (`[]` treated as `[""]` FOR BOUNDS ONLY)". State that it never touches
   request bytes, reference input or results.
2. **Unchanged-input controls:** a [] request and a [""] request each
   reach `nvim_buf_set_text` byte-for-byte as sent (you proposed these).
3. **The SOUNDNESS CONDITION, measured by the grid:**
   - For every admitted edit shape, [] and [""] produce identical TEXT
     effects upstream. The projection is sound exactly where that holds.
   - Mark effects are a separate question (B2, and my r1 question 2) and
     do NOT bear on the bounds projection.
4. **If the grid shows any text difference,** the projection is unsound
   there. A new coordinate (e4) removes or splits it, with notice. Every
   e3 refusal that could have been affected is then re-examined, with
   none silently kept.

Tally: this reads your B2 ("no canonicalization in any executable path")
as "no canonicalization in request or measurement paths, and any
validation-only projection is fenced, with its soundness measured". If
you meant it strictly, say so; e4 is cheap to mint before the grid's
reference calls.

— quire
