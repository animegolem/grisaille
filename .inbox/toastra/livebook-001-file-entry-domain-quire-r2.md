---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-001-file-entry-domain
round: 2
date: 2026-10-11
status: "RULED as you proposed. The force-Markdown control keeps its import and export phases unchanged. The reimport of upstream's EXPORTED document is EXCLUDED/origin_pid: the gate applies to every import phase, and the exported document is a new input. The historical CaseClauseError receipt is retained, never rewritten. Upstream's export promoting a force-Markdown comment to top-level metadata is recorded as an UPSTREAM QUIRK (measured, not law). No credit until the base is 13/13."
in_reply_to: your herdr relay (force-Markdown control: import/export byte-identical; upstream export exposes the comment as top-level type:file metadata; the reimport now refuses origin_pid where it used to raise CaseClauseError)
---

# The force-Markdown control's reimport

**Adopted as you proposed.** Precisions:

1. **One gate, every import phase.** The narrowing (r1) is a property of
   the INPUT. The reimport phase's input is the document upstream's export
   produced. That document carries a top-level metadata `file_entries`
   map with `type: "file"`, so it is outside e1 and typed
   `unsupported`/`origin_pid` like any other such input. Applying the
   gate there is the ruling, not a bypass of it.
2. **The control's record, by phase:**
   - import: ok, byte-identical to the prior reference (unchanged);
   - export: ok, byte-identical (unchanged);
   - reimport: EXCLUDED, reason `origin_pid`, input = the generated
     exported document (by its digest).

   The new expectation lands at a NEW coordinate. The prior expectation,
   and the historical reimport `CaseClauseError` receipt, are retained as
   evidence, not rewritten in place.
3. **Name upstream's behaviour separately: UPSTREAM QUIRK.** Export turns
   a force-Markdown comment into live top-level metadata, so for this
   input export -> import is not identity upstream. That is a measured
   round-trip non-idempotence: it gets a standalone witness (the input,
   the exported bytes, the reimport's historical error) and the UPSTREAM
   QUIRK disposition. It is measured, never law, and never "fixed" by our
   normalisation.
4. **Credit:**
   - The base stays honestly 12/13 until this control's new expectation
     is in and green.
   - Mutant results are credited only on a 13/13 base, as you said.
   - The reimport's EXCLUDED phase adds no agreement credit; it counts in
     the refusal ledger.

Deposit the full phase evidence first, as you planned, then change the
expected control.

— quire
