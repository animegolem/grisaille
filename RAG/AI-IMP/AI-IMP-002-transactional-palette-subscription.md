---
node_id: AI-IMP-002
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: planned
depends_on: ["AI-IMP-001"]
parent_epic: [[AI-EPIC-001-theme-consumption]]
confidence_score: 0.78
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-002-transactional-palette-subscription

## Transactional palette subscription

The app has no live palette subscriber; relying only on MPD song events could read before the producer publishes or accept an old generation.

Normative scope: SPEC.md §8, §5.3–5.6 and §14.3. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No theme script loader, producer orchestration, polling daemon, palette sampling, MPD output configuration or independent navigation rewrite.

### Design/Approach

Add an app-owned subscription watching the artifact parent directory. Correlate playback generation/art identity, handle atomic rename/deletion/partial invalid writes, retain last-good/default state, and dispose watchers. Coalesce duplicate events without losing a replacement. Report errors without changing playback.

### Files to Touch

Proposed src/palette-session.ts and src/use-palette.ts; shared session integration only where verified necessary; tests/palette-session.test.ts.

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

GIVEN track A changes to B while A analysis is late, WHEN A then B artifacts arrive via rename, THEN only B can become current; malformed updates preserve a usable theme; stopping the consumer leaves no live watcher and sends no playback command.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
