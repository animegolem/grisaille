---
node_id: AI-IMP-010
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: deferred
depends_on: ["AI-IMP-009"]
parent_epic: [[AI-EPIC-003-shared-visualizer]]
confidence_score: 0.55
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-010-dedicated-audio-analysis-feed

## Dedicated audio analysis feed

The existing /tmp/mpd.fifo is already consumed by cava; another reader cannot assume it receives a complete copy of audio.

Normative scope: SPEC.md §10, §7.3 and §14.3. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No read from the existing cava FIFO, audio engine replacement or incidental service restart. Configuration authorization and audible acceptance remain separate.

### Design/Approach

Coordinate a separately authorized MPD FIFO output with its owner. Define PCM format, reader ownership, backpressure/disconnect behavior and playback timing. Feed bounded shared analysis to both visualizer adapters and distinguish offline/no-audio state.

### Files to Touch

Proposed src/visualizer/audio.ts and analysis tests; external MPD configuration only through its explicit owner-approved change, not this app commit.

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

GIVEN the dedicated configured feed, WHEN playback/seek/pause/disconnection occur, THEN both hosts receive consistent bounded analysis without stealing cava bytes or controlling playback.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
