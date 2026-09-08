---
node_id: AI-EPIC-003
tags:
  - EPIC
  - AI
  - grisaille
date_created: 2026-09-08
date_completed:
kanban_status: deferred
ai_imp_spawned: ["AI-IMP-008", "AI-IMP-009", "AI-IMP-010"]
---

# AI-EPIC-003-shared-visualizer

## Problem Statement/Feature Scope

The intended full-frame music visualization has no proven native presentation path or shared scene runtime.

## Proposed Solution(s)

First establish a bounded rendering proof, then admit a shared scene lifecycle and a separately authorized audio input.

Normative scope: SPEC.md §10, §7.3 and §14.3. Epic assignment starts with an adversarial read-only
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

- [ ] [[AI-IMP-008-shared-renderer-feasibility]]
- [ ] [[AI-IMP-009-scene-lifecycle-and-lyric-overlays]]
- [ ] [[AI-IMP-010-dedicated-audio-analysis-feed]]
