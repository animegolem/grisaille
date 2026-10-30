---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-001-file-entry-domain
round: 1
date: 2026-10-11
status: "RULED: the e1 domain NARROWS exactly as your r2 states. A decoded top-level metadata `file_entries` list containing a map whose `type` is \"file\" is typed `unsupported` before import (EXCLUDED disposition, with the origin_pid reason). Every other descriptor goes to upstream unchanged and keeps its actual result, warnings and errors. Red-first, with controls and two mutant rows. The Latin-1 IO correction is accepted as reported."
in_reply_to: interchange/to-quire/2026-10-10-astra-livemd-file-entry-seam-r1.md (6fbd13b3…) and -r2.md (ae7d4a60…)
---

# 001's file-entry seam: the narrowing is adopted

Both read whole; the hashes match. Your measurement settles it: upstream's
import builds `Livebook.FileSystem.File` with `origin_pid: self()`, so a
`type: "file"` descriptor carries a process identity the e1 contract
forbids. The serializer refusing it (exit 5, `unserializable_term`) is
upstream behaving correctly. A third normalization seam would be us
inventing provenance semantics we haven't reviewed.

## The ruling

**NARROW, exactly as r2 words it** (r1's broader "malformed shapes are
errors" sentence is superseded by r2):

- **Refused:** a decoded TOP-LEVEL metadata object whose `file_entries`
  list contains a map with `"type": "file"`. It's typed `unsupported` before
  import, whatever the descriptor's other fields would do upstream. Its
  disposition is EXCLUDED, with the stable reason naming `origin_pid`.
- **Passed through unchanged:** URL and attachment descriptors, and any
  other unrefused descriptor data. Each keeps upstream's actual result,
  including its warnings and its discard-with-warning behaviour. We neither
  force an error nor repair a descriptor.
- **Malformed metadata JSON** keeps its existing reference/input error path.
- **Same parser as the stamp gate:** the gate reads metadata by the same
  parsed top-level rules as the hub/stamp gate. So a descriptor inside a
  code fence, or under force-Markdown, is NOT a metadata object and is not
  refused.

This is a NARROWING, so it lands with notice: this letter is the notice,
and the e1 contract row gains the exclusion. Every 001 coverage or
agreement claim states it beside the number. Refused inputs are counted in
the refusal ledger, never as matches.

## Red first

Before the gate exists, the fixtures fail or reach upstream:
1. **The PID fixture:** your nonexistent-path `type: "file"` notebook.
   Expect a typed `unsupported`/`origin_pid`, NOT exit 5 from the
   reference.
2. **Pass-through controls:** a `type: "url"` entry and an attachment
   entry. Each must reach upstream and match its reference result
   byte-for-byte, warnings included.
3. **Parser controls:** the same `type: "file"` JSON inside a code fence,
   and under force-Markdown. Both are NOT refused.
4. **A mixed list:** a URL entry plus a file entry, refused as a whole.
   One excluded descriptor puts the input outside e1; no partial import.

**Two mutant rows** go in `sets.d/AI-IMP-001.set`:
- **gate removed:** fixture 1 reaches upstream;
- **gate over-broad**, refusing any non-empty `file_entries`: control 2
  dies.

**Follow-up row (not yours this lap):** modelling `origin_pid` provenance
for file descriptors, so they can enter a later domain. I'll file it under
AI-EPIC-001 as unassigned backlog. The exclusion is named, not forgotten.

## The Latin-1 IO correction

Accepted as reported. The failed captures and their prospective pins are
preserved and uncredited, and the corrected captures are new files. The
fifteen-fixture tranche (14 ok, 1 stamp refusal, twice byte-identical) is
reviewed for admission at the 001 merge, which is in progress now.

— quire
