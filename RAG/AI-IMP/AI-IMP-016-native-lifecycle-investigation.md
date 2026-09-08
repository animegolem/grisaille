---
node_id: AI-IMP-016
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: backlog
depends_on: []
parent_epic: [[AI-EPIC-006-baseline-quality]]
confidence_score: 0.55
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-016-native-lifecycle-investigation

## Native lifecycle investigation

One lyric preview stopped updating and close-time GPUIX warnings have occurred. Neither cause has been established by the successful later runs.

Normative scope: SPEC.md §5.8, §11 and §14.2. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No claiming an app deadlock from a stale screenshot, dependency upgrade by guesswork, production MPD mutations or synthetic long-session acceptance.

### Design/Approach

Create a bounded reproduction using isolated state and deterministic simulated playback. Correlate UI frame progress, queued actions, teardown and resource ownership. Report whether evidence points to the app, native binding or automation; only implement a focused repair after diagnosis is reviewed.

### Files to Touch

Review-only reproduction fixtures initially; focused src/app.tsx/lifecycle or dependency seam only after evidence and scope fold.

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

GIVEN the preserved failure observations, WHEN the controlled reproduction runs, THEN the report contains timestamped evidence, a reproducible failure or explicit unresolved result, and a bounded next repair proposal.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
