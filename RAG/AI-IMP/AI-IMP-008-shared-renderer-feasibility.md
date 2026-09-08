---
node_id: AI-IMP-008
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: deferred
depends_on: []
parent_epic: [[AI-EPIC-003-shared-visualizer]]
confidence_score: 0.5
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-008-shared-renderer-feasibility

## Shared renderer feasibility

GPUIX PR 45 proves a limited cube and uses a blocking CPU-copy presentation path. The intended textured/transparent scene has no validated native bridge.

Normative scope: SPEC.md §10, §7.3 and §14.3. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No upstream posting/push, whole-PR import, GPUIX upgrade, new runtime install or MPD changes before the explicit experiment brief. A cube alone does not close this issue.

### Design/Approach

Round 1 compares an external Bun/WebGPU renderer plus bounded frame presentation with the parked PR and a macOS shared-surface path. Return exact dependency/API/license and maintenance scope. Only after DQ-003 ruling, run an isolated minimal scene experiment and record the smallest viable bridge plus measured costs.

### Files to Touch

Initially source/dependency evidence only; any prototype bridge lives in an explicitly assigned independent renderer checkout and review fixture. Production dependency files require a later approved fence.

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

GIVEN a bounded approved experiment, WHEN the same textured/transparent scene renders in both hosts and is resized/replaced, THEN evidence identifies supported features, frame cost, cleanup and the exact remaining adoption work; an infeasible result is a valid documented finding, not false success.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
