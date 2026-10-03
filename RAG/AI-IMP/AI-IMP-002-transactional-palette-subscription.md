---
node_id: AI-IMP-002
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: planned
depends_on: ["AI-IMP-001"]
parent_epic: [[AI-EPIC-001-theme-consumption]]
confidence_score: 0.78
assignee: code-lead
date_created: 2026-09-08
date_completed:
---

# AI-IMP-002-transactional-palette-subscription

## Transactional palette subscription

The app has no live palette subscriber; relying only on MPD song events could read before the producer publishes or accept an old generation.

Normative scope: SPEC.md §8, §5.3–5.6 and §14.3. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No theme script loader, producer orchestration, polling daemon, palette sampling, MPD output configuration or independent navigation rewrite.

### Design/Approach

Add an app-owned subscription watching the artifact parent directory. Associate artifacts to playback by v1 URI association (SPEC §8.2 rev 0.3; no occurrence/current-art verification claim), handle atomic rename/deletion/partial invalid writes, retain last-good/default state per the ratified retention table (imp002-preparation-2026-10-02 §3), and dispose watchers. Coalesce duplicate events without losing a replacement; identical bytes still need re-evaluation when playback context changes. Report errors without changing playback. Read/watch only: injected explicit source path with documented env override and the producer's XDG default; bounded 1/2/4/8/10s capped reattachment continuing at the cap; never create producer directories; demo never opens a live palette source.

### Files to Touch

Proposed src/palette-session.ts (immutable state, retention, read scheduling, lifecycle guards), src/palette-file.ts (read-only path/watcher adapter, bounded reattachment; no producer invocation), src/use-palette.ts (subscription only, via useSyncExternalStore); ownership-only wiring at the two host construction seams (src/app.tsx, src/terminal/main.tsx — one PaletteSession per MusicSession per app instance; useMusic keeps start/stop and the palette hook never calls it); tests/palette-session.test.ts and tests/palette-file.test.ts; a consumer runtime document. No changes expected to src/model.ts or src/mpd.ts; src/palette-contract.ts and the nine pinned fixtures stay frozen absent a separately evidenced ruling.

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

GIVEN track A changes to B while A analysis is late, WHEN A then B artifacts arrive via rename, THEN only B can become current; malformed updates preserve a usable theme; stopping the consumer leaves no live watcher and sends no playback command.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Not started. No implementation or acceptance is claimed.
