---
node_id: AI-IMP-012
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: backlog
depends_on: ["AI-IMP-011"]
parent_epic: [[AI-EPIC-004-browser-and-identity]]
confidence_score: 0.78
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-012-library-submode-navigation

## Library submode navigation

Library remembers a mode but its Albums/Browser destinations are not directly addressable with the proposed temporary navigation targets.

Normative scope: SPEC.md §6 and §11. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No renumbering accepted main destination keys or replaying commands through history. Exact shortcut assignment needs the design ruling.

### Design/Approach

Ratify exact shortcuts in DQ-005. Expose Albums and Browser as direct destinations while Cmd+3/F3 restores the last Library mode; show subordinate labels while relevant and keep their explicit shortcuts available from other pages.

### Files to Touch

src/navigation.ts; src/app.tsx; src/terminal/app.tsx; navigation-state/history tests.

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

GIVEN a saved Browser location, WHEN returning through Library or a direct Albums shortcut, THEN the requested mode restores its own valid place and the labels collapse without disabling direct navigation.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
