---
node_id: AI-EPIC-001
tags:
  - EPIC
  - AI
  - grisaille
date_created: 2026-09-08
date_completed:
kanban_status: planned
ai_imp_spawned: ["AI-IMP-001", "AI-IMP-002", "AI-IMP-003"]
---

# AI-EPIC-001-theme-consumption

## Problem Statement/Feature Scope

The app has static colors despite a separate working artwork-analysis engine. Users cannot yet carry the album atmosphere into both presentations.

## Proposed Solution(s)

Consume a ratified artifact, recover safely from updates and failures, and map its semantic roles into both existing hosts.

Normative scope: SPEC.md §8, §5.3–5.6 and §14.3. Epic assignment starts with an adversarial read-only
review; unresolved hypotheses are folded before implementation.

## Path(s) Not Taken

Do not treat this epic as authorization for adjacent epics, external service
changes or unratified design. Its issue fences and assigned brief govern.

## Success Metrics

By this epic's reviewed sprint submission, every assigned issue has its bounded
acceptance evidence and one atomic commit (or an explicit investigation result),
with exact gates reproduced and zero unresolved blocking review findings.
Owner visual/listening acceptance remains separately recorded where applicable.

## Requirements

### Functional Requirements

- [ ] Deliver the behavior/outcome above against the cited specification.
- [ ] Preserve existing navigation/playback and identity invariants.
- [ ] Make failures, incomplete evidence and fallback behavior explicit.

### Non-Functional Requirements

Remain within the assigned surfaces; preserve two-host behavior where relevant.
A separate reviewer checks the submitted head before the Review Lead merges.
No silent closure of inherited risks or owner-only checks.

## Implementation Breakdown

- [ ] [[AI-IMP-001-palette-contract-and-fixtures]]
- [ ] [[AI-IMP-002-transactional-palette-subscription]]
- [ ] [[AI-IMP-003-host-theme-mapping-and-ramp]]
