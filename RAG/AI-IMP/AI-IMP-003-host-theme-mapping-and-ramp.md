---
node_id: AI-IMP-003
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: planned
depends_on: ["AI-IMP-001", "AI-IMP-002"]
parent_epic: [[AI-EPIC-001-theme-consumption]]
confidence_score: 0.75
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-003-host-theme-mapping-and-ramp

## Host theme mapping and ramp

Native theme tokens are static and terminal colors currently reduce gradients to the first stop. Semantic roles and actual output encoding need a deliberate shared mapping.

Normative scope: SPEC.md §8, §5.3–5.6 and §14.3. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No component/page extraction, visualizer, producer algorithm changes or arbitrary color regrading. Browser movement/selection semantics remain governed by SPEC §6.

### Design/Approach

Ratify mapping for normal/muted/playing/selection/context states, with explicit fallback for absent derived selection. Bind both hosts to the accepted palette snapshot, including input colors. Add a known color ramp and actual-host conformance record; do not claim dynamic-background or full-gradient contrast.

### Files to Touch

src/theme.ts; src/app.tsx theme subscription seams; src/terminal/app.tsx color mapping; focused host tests; review fixture under tests/fixtures/palette/.

Paths are proposed boundaries to verify in round 1, not permission to expand
into neighboring responsibilities. Report new seams before editing them.

### Implementation Checklist

<CRITICAL_RULE>
Before marking an item complete on the checklist MUST **stop** and **think**. Have you validated all aspects are **implemented** and **tested**?
</CRITICAL_RULE>

- [ ] Verify claims and proposed file boundaries against current source and the cited spec.
- [ ] Resolve open contract/design decisions in the Review Lead's fold.
- [ ] Deliver the bounded change or investigation outcome described above.
- [ ] Reproduce relevant behavioral/host evidence and the assigned full gate; report exact counts and missing checks.
- [ ] Submit the atomic issue commit/evidence for independent second review and Review Lead disposition.

### Acceptance Criteria

GIVEN a verified palette for the active track, WHEN it is committed, THEN existing native and terminal views update coherently with readable specified pairs and distinct interaction states; the known ramp passes the recorded output-path check or an explicit fidelity limitation remains open.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
