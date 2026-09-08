---
node_id: AI-IMP-005
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: backlog
depends_on: ["AI-IMP-004"]
parent_epic: [[AI-EPIC-002-responsive-composition]]
confidence_score: 0.7
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-005-responsive-profile-contract

## Responsive profile contract

Breakpoints are currently hardcoded per host and cannot be chosen by a theme. Width-only decisions could also hide controls in short windows.

Normative scope: SPEC.md §4.3–4.6, §7 and §9. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No blanket CSS compatibility promise, new scene engine, animated resizing requirement or silent adoption of unreviewed breakpoint numbers.

### Design/Approach

Expose compact/regular/wide names, dimensions, native units and capability context. Propose measured numeric defaults in round 1 for Review Lead ruling; support theme-defined thresholds, min/max sizes, flex proportions and wrapping. Specify stable behavior at boundaries and short heights.

### Files to Touch

Proposed src/composition/profiles.ts; host viewport inputs in src/app.tsx and src/terminal/app.tsx; profile and resize tests.

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

GIVEN named defaults and a theme override, WHEN widths/heights cross each threshold in either host, THEN the intended profile/constraints are selected and required controls remain reachable with selection and focus preserved.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
