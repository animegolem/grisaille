---
node_id: AI-IMP-019
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: planned
depends_on: ["AI-IMP-002"]
parent_epic: [[AI-EPIC-001-theme-consumption]]
confidence_score: 0.85
assignee: code-lead
date_created: 2026-10-03
date_completed:
---

# AI-IMP-019-genuine-capture-conformance-gate

## Genuine-capture conformance gate (consumer side)

The ratified contract says the first producer capture becomes the conformance
golden; addendum 2d distributes it to the consumer courts, and the capture
selection criterion requires a SATURATED cover because extraction-vs-hex
divergence is largest near the gamut boundary (DQ-7 addendum 3 normative).
The stored chromatic capture is genuine publisher-path but synthetic artwork
over loopback MPD and does not exercise that divergence; the gate is open
until a live capture is admitted here.

Normative scope: SPEC.md §8 rev 0.3; contract conformance-golden clause and
addendum 2d; AI-LOG-002 open item. No implementation begins without the
assigned brief, the capture artifact in hand, and explicit start.

### Out of Scope

No producer code or invocation changes in the app runtime (IMP002 fences
stand); no modification of the nine pinned fixtures or the decoder; no visual
acceptance or host color mapping (IMP003); capture PRODUCTION is RMPC-court
work and is a precondition, not this ticket's deliverable.

### Design/Approach

Admit the first genuine LIVE capture as an ADDITIVE conformance fixture:
verify the capture's recorded provenance (producer revision, art_sha256,
encoded-art and base-theme hashes, DQ-7 addendum 3 ratification status named
at capture time, live-playback provenance distinguishing it from the
chromatic synthetic); decode at the merged decoder; record accepted status,
role/pair/cluster counts and warnings verbatim; report numeric
extraction-vs-hex divergence evidence demonstrating the saturated-cover
criterion was actually exercised; add the conformance test and a provenance
note to the runtime/fixture docs.

### Files to Touch

Proposed: new fixture file under tests/fixtures/ (additive, provenance-
labeled), tests/palette-contract-conformance.test.ts (or extension of the
existing contract test file), fixture README/provenance notes,
docs/palette-runtime.md note. No src/ changes expected; report any seam
before touching it.

### Implementation Checklist

<CRITICAL_RULE>
Before marking an item complete on the checklist MUST **stop** and **think**. Have you validated all aspects are **implemented** and **tested**?
</CRITICAL_RULE>

- [ ] Verify the capture artifact's hashes and provenance record against the producer's published values.
- [ ] Decode at the exact merged decoder; record status/counts/warnings verbatim.
- [ ] Demonstrate numerically that the capture exercises gamut-boundary divergence (saturated cover).
- [ ] Admit the fixture additively with honest provenance labels; pinned nine untouched.
- [ ] Full gate + validators at the exact head; submit for independent second review and RL disposition.

### Acceptance Criteria

GIVEN the first genuine live-playback capture with its recorded provenance,
WHEN decoded at the exact merged decoder in a conformance test, THEN the
artifact is accepted with its counts matching the provenance record, the
saturated-cover divergence is demonstrated numerically, the fixture is
admitted additively with provenance distinguishing it from all synthetic
fixtures, and the nine pinned fixtures remain byte-immutable.

### Issues Encountered

Not started. No implementation or acceptance is claimed.
