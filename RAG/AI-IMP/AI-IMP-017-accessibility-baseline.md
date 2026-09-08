---
node_id: AI-IMP-017
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: backlog
depends_on: []
parent_epic: [[AI-EPIC-006-baseline-quality]]
confidence_score: 0.6
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-017-accessibility-baseline

## Accessibility baseline

Native accessibility observations exposed window chrome rather than meaningful app content; screen-reader usability is not established.

Normative scope: SPEC.md §5.8, §11 and §14.2. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No automated claim of screen-reader support, blanket accessibility rewrite or closing owner-only checks from source inspection.

### Design/Approach

Inspect actual host accessibility and keyboard focus for core navigation, queue, lyrics and prompt. Record reachable roles/names/actions and gaps; propose component/binding fixes as numbered follow-up scope. Coordinate owner assistive-technology acceptance.

### Files to Touch

RAG/HUMAN-TESTING.md via Review Lead; review/accessibility evidence; later focused component/native binding fixes require a folded brief.

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

GIVEN the packaged native app, WHEN core flows are inspected through actual accessibility tools and keyboard use, THEN the baseline names observed capabilities and missing semantics with concrete reproduction and follow-up scope.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
