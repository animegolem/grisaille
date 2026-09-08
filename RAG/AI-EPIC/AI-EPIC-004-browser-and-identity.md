---
node_id: AI-EPIC-004
tags:
  - EPIC
  - AI
  - grisaille
date_created: 2026-09-08
date_completed:
kanban_status: planned
ai_imp_spawned: ["AI-IMP-011", "AI-IMP-012", "AI-IMP-013"]
---

# AI-EPIC-004-browser-and-identity

## Problem Statement/Feature Scope

The browser keeps columns fixed while focus changes, Library submodes are not directly addressable, and product identifiers still use prototype names.

## Proposed Solution(s)

Carry focus through ancestry/current/preview views, provide direct Library modes and migrate product identity without losing state.

Normative scope: SPEC.md §6 and §11. Epic assignment starts with an adversarial read-only
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

- [ ] [[AI-IMP-011-focus-centered-browser]]
- [ ] [[AI-IMP-012-library-submode-navigation]]
- [ ] [[AI-IMP-013-grisaille-product-identity]]
