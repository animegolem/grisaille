---
node_id: AI-IMP-007
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: backlog
depends_on: ["AI-IMP-006"]
parent_epic: [[AI-EPIC-002-responsive-composition]]
confidence_score: 0.65
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-007-local-theme-hook-and-live-reload

## Local theme hook and live reload

The owner cannot edit a composition module and have the app adopt a coherent new layout/theme during a session.

Normative scope: SPEC.md §4.3–4.6, §7 and §9. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No remote module fetching, metadata-derived imports, sandbox/marketplace, uncontrolled per-frame reload or automatic source rewrites.

### Design/Approach

Load an explicitly configured local JS/TS module whose hook consumes track, lyric status, palette, viewport and capabilities. Validate and stage its complete result before swapping. Re-evaluate relevant context changes and defeat import caching on edits; bound failures and dispose replaced resources.

### Files to Touch

Proposed src/composition/theme-loader.ts; host/session hookup; error presentation; loader/lifecycle tests.

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

GIVEN a working local theme, WHEN an edit is valid, invalid, or superseded by a track change, THEN only a complete current recipe is committed and the app remains usable with an explicit recoverable error on failure.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
