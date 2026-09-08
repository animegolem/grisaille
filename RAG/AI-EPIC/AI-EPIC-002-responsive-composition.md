---
node_id: AI-EPIC-002
tags:
  - EPIC
  - AI
  - grisaille
date_created: 2026-09-08
date_completed:
kanban_status: planned
ai_imp_spawned: ["AI-IMP-004", "AI-IMP-005", "AI-IMP-006", "AI-IMP-007"]
---

# AI-EPIC-002-responsive-composition

## Problem Statement/Feature Scope

Page-specific views prevent themes from placing lyrics on Now playing or changing arrangements with content and window size.

## Proposed Solution(s)

Expose reusable app components, named responsive profiles and validated local composition recipes that preserve interaction state.

Normative scope: SPEC.md §4.3–4.6, §7 and §9. Epic assignment starts with an adversarial read-only
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

- [ ] [[AI-IMP-004-component-identity-and-lyrics-extraction]]
- [ ] [[AI-IMP-005-responsive-profile-contract]]
- [ ] [[AI-IMP-006-cross-page-composition-adapters]]
- [ ] [[AI-IMP-007-local-theme-hook-and-live-reload]]
