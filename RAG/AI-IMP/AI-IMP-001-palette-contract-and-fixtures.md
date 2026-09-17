---
node_id: AI-IMP-001
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: planned
depends_on: []
parent_epic: [[AI-EPIC-001-theme-consumption]]
confidence_score: 0.72
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-001-palette-contract-and-fixtures

## Palette contract and fixtures

[Historical summary, superseded 2026-09-17: the contract is now
RATIFIED (grisaille r18; RMPC contract at fixture head 447975c,
digest pinned in r18) — identity values are fixture-labeled,
failure correlation is settled (absent-shape law), and the no-art
emission predicate is contract text. The assigned brief pins the
exact revisions.] Original text: The proposed artifact is still
v1.0.0-draft.1 and includes illustrative identity values, nullable
future roles and unresolved failure correlation.

Normative scope: SPEC.md §8, §5.3–5.6 and §14.3. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No producer-repository edits, runtime watcher, MPD changes, scene/layout engine or guessed final schema. SPEC edits belong to Review Lead.

### Design/Approach

Adversarially verify Fable r3 against producer evidence; report numeric/identity/schema inconsistencies in round 1. After the Review Lead ratifies the contract, implement a data-only decoder and provenance-bearing valid/invalid fixtures. Explicitly model failed request versus retained success; distinguish absent selection from inactive.

### Files to Touch

Proposed src/palette-contract.ts; tests/palette-contract.test.ts; tests/fixtures/palette/; documentation under docs/palette-contract.md after ratification.

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

GIVEN ratified valid, malformed, unsupported-version, no-art and failed-request fixtures, WHEN decoded, THEN valid data has typed identities/roles and invalid or ambiguous data is rejected without executing code or silently synthesizing a missing role.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
