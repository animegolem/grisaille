---
node_id: AI-IMP-015
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: planned
depends_on: []
parent_epic: [[AI-EPIC-005-delivery-seats]]
confidence_score: 0.8
assignee: review-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-015-implementation-seat-and-delivery

## Implementation seat and delivery

The implementation task must receive an independent clone and exact read-only brief; runtime templates alone do not prove delivery to either seat.

Normative scope: SPEC.md §12–14 and RAG/PROTOCOL.md. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No duplicate app-server daemon, global hook replacement, Computer History scope change, implicit model configuration or claim of live unattended delivery from fixture tests alone.

### Design/Approach

Bind the owner-designated implementation task, prepare an independent clone and round-1 branch/base, and verify receipt plus first source check. Use the carrier/manual route initially. If unattended wake is requested, inspect the existing machine daemon, configure only real recipient bindings and run the fault/live ACK drills before activation claims.

### Files to Touch

RAG/WORK-LEDGER.md; .relay local state; .workspaces/code-lead/primary; RAG/BOOTSTRAP.md; optional explicit runtime configuration outside source after authorization.

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

GIVEN an owner-designated task and committed brief, WHEN the clone/branch/base and assignment arrive, THEN the task acknowledges scope and source evidence and the ledger has one next actor. Any idle-wake route remains separately gated until its real digest ACK is observed.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
