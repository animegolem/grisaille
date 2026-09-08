---
node_id: AI-IMP-006
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: backlog
depends_on: ["AI-IMP-004", "AI-IMP-005"]
parent_epic: [[AI-EPIC-002-responsive-composition]]
confidence_score: 0.68
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-006-cross-page-composition-adapters

## Cross page composition adapters

Existing pages choose exclusive view trees; they cannot yet interpret a theme recipe that places lyrics, artwork, metadata and transport on different destinations.

Normative scope: SPEC.md §4.3–4.6, §7 and §9. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No new component behavior invented through themes; no claim of a working Three.js scene; no global prompt focus regression or state migration.

### Design/Approach

Implement a versioned recipe over available components with ordered layers, anchors, visibility and constraints. Supply full-frame, quiet split and no-lyrics defaults; keep native/terminal adapters explicit and preserve input semantics. Custom visualizer slots may use an honest placeholder until E003 passes.

### Files to Touch

Proposed src/composition/model.ts and host adapters; src/app.tsx; src/terminal/app.tsx; composition/focus tests.

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

GIVEN available components, WHEN a recipe places lyrics on Now playing and then reflows to compact, THEN lyrics/art/transport occupy the requested valid layout and keyboard history, search and seeking remain correct.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
