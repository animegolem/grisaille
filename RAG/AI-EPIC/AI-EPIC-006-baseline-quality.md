---
node_id: AI-EPIC-006
tags:
  - EPIC
  - AI
  - grisaille
date_created: 2026-09-08
date_completed:
kanban_status: planned
ai_imp_spawned: ["AI-IMP-016", "AI-IMP-017"]
---

# AI-EPIC-006-baseline-quality

## Problem Statement/Feature Scope

The prototype carries an unresolved preview freeze/close warning and an unverified accessibility surface. These cannot disappear merely because feature work advances.

## Proposed Solution(s)

Reproduce and diagnose lifecycle behavior and establish an actual-host accessibility baseline with bounded repair tickets as needed.

Normative scope: SPEC.md §5.8, §11 and §14.2. Epic assignment starts with an adversarial read-only
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

- [ ] [[AI-IMP-016-native-lifecycle-investigation]]
- [ ] [[AI-IMP-017-accessibility-baseline]]
