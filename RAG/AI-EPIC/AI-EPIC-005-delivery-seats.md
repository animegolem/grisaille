---
node_id: AI-EPIC-005
tags:
  - EPIC
  - AI
  - grisaille
date_created: 2026-09-08
date_completed:
kanban_status: planned
ai_imp_spawned: ["AI-IMP-014", "AI-IMP-015"]
---

# AI-EPIC-005-delivery-seats

## Problem Statement/Feature Scope

The local workflow needs a verified remote and bound implementation seat before a real PR lifecycle and unattended delivery can be claimed.

## Proposed Solution(s)

Record the owner-created remote and establish a tested, explicit task/channel binding with independent clones and review evidence.

Normative scope: SPEC.md §12–14 and RAG/PROTOCOL.md. Epic assignment starts with an adversarial read-only
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

- [ ] [[AI-IMP-014-owner-remote]]
- [ ] [[AI-IMP-015-implementation-seat-and-delivery]]
