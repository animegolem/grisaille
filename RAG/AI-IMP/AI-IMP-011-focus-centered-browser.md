---
node_id: AI-IMP-011
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: backlog
depends_on: ["AI-IMP-006"]
parent_epic: [[AI-EPIC-004-browser-and-identity]]
confidence_score: 0.68
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-011-focus-centered-browser

## Focus centered browser

Artists, Albums and Tracks remain pinned while focus mostly changes highlighting; the current level does not gain the central attention the owner requested.

Normative scope: SPEC.md §6 and §11. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No library regrouping, playback on pointer selection, history reset, virtualization removal or unrelated sort changes.

### Design/Approach

Make the current level central with ancestry left and child/detail preview right. Preserve selected identities, per-location viewport anchors and h/l/o/i behavior through shifts and compact fallback. Ground transitions in current component/navigation seams.

### Files to Touch

src/browser.ts; native/TUI browser presentation; src/navigation.ts as needed; browser and terminal tests.

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

GIVEN an album and retained child track, WHEN focus enters Tracks then returns to Albums, THEN each level becomes central with its correct neighbors and original selection/viewport preserved.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
