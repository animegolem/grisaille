---
node_id: AI-IMP-013
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: planned
depends_on: []
parent_epic: [[AI-EPIC-004-browser-and-identity]]
confidence_score: 0.86
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-013-grisaille-product-identity

## Grisaille product identity

The repo is Grisaille but the package, bundle, executable help and private state paths retain prototype identifiers.

Normative scope: SPEC.md §6 and §11. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No destructive state rename/deletion, identifier reuse without migration, signing/notarization or remote creation.

### Design/Approach

Inventory all product identifiers and owner state paths, confirm tentative naming policy, then update public identity coherently. Preserve existing snapshots and append-only journals through an explicit migration or compatibility lookup; package/relaunch from the new path.

### Files to Touch

package.json/package-lock.json; src/main.ts; src/app.tsx title; scripts/package-mac.py; navigation-state/log identity seam if ratified; operational docs.

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

GIVEN existing Music Prototype state, WHEN Grisaille starts under its adopted product identifiers, THEN prior valid browsing/history restores without playback replay and the old evidence remains recoverable.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
