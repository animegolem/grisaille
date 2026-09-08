---
node_id: AI-IMP-009
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: deferred
depends_on: ["AI-IMP-006", "AI-IMP-008"]
parent_epic: [[AI-EPIC-003-shared-visualizer]]
confidence_score: 0.55
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-009-scene-lifecycle-and-lyric-overlays

## Scene lifecycle and lyric overlays

A successful renderer experiment still needs an app-owned scene lifecycle and readable interactive overlays.

Normative scope: SPEC.md §10, §7.3 and §14.3. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No broad WebGPU implementation, full plugin system, unbounded texture resources or assertion of identical terminal/native pixels.

### Design/Approach

After bridge acceptance, integrate a shared scene module contract and host adapters. Handle resize, track/scene replacement, suspended/hidden views and destruction. Demonstrate outlined/backplated lyric treatments and artwork layering with explicit terminal fallback; preserve application focus/seek behavior.

### Files to Touch

Approved renderer integration seam; proposed src/visualizer/; native/TUI composition adapters; lifecycle and actual-host fixtures.

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

GIVEN one shared scene module, WHEN it runs behind lyrics and artwork on both hosts through resize and scene changes, THEN controls stay usable, no stale scene persists and resources return to the documented baseline.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
