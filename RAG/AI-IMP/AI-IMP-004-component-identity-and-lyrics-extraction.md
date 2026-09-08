---
node_id: AI-IMP-004
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: backlog
depends_on: ["AI-IMP-003"]
parent_epic: [[AI-EPIC-002-responsive-composition]]
confidence_score: 0.72
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-004-component-identity-and-lyrics-extraction

## Component identity and lyrics extraction

Lyrics state activation and rendering are tied to the Lyrics route. Reusing the component elsewhere risks duplicate fetches, focus conflicts or lost reading state.

Normative scope: SPEC.md §4.3–4.6, §7 and §9. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No arbitrary third-party interactive components, script loader, new lyric providers or changed seek/follow semantics.

### Design/Approach

Extract app-provided surface contracts and current-track lyric lifecycle from route selection. Define stable component identity and a default single interactive lyric instance. Propose any simultaneous-instance policy through DQ-004 before implementing it.

### Files to Touch

src/app.tsx; src/terminal/app.tsx; src/use-lyrics.ts; proposed src/components/ and shared component contracts; focused lyric/session tests.

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

GIVEN a current timed lyric on Now playing, WHEN the composition changes to the Lyrics destination and back, THEN cue, manual-reading/follow state and explicit-seek semantics survive without duplicate playback commands or stale-track content.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
