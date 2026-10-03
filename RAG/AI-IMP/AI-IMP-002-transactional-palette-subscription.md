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

Proposed src/palette-session.ts (immutable state, retention, read scheduling, lifecycle guards), src/palette-file.ts (read-only path/watcher adapter, bounded reattachment; no producer invocation), src/use-palette.ts (subscription only, via useSyncExternalStore); src/music-session.ts for the ruled lifecycle ownership only (PaletteSession ownership, lifecycle, playback-context publication; existing MPD action semantics unchanged); ownership-only wiring at the two host construction seams (src/app.tsx, src/terminal/main.tsx — one PaletteSession per MusicSession per app instance; useMusic keeps start/stop and the palette hook never calls it); tests/palette-session.test.ts (including lifecycle integration coverage) and tests/palette-file.test.ts; a consumer runtime document at docs/palette-runtime.md. No changes expected to src/model.ts or src/mpd.ts; src/palette-contract.ts and the nine pinned fixtures stay frozen absent a separately evidenced ruling.

Paths are proposed boundaries to verify in round 1, not permission to expand
into neighboring responsibilities. Report new seams before editing them.

### Implementation Checklist

<CRITICAL_RULE>
Before marking an item complete on the checklist MUST **stop** and **think**. Have you validated all aspects are **implemented** and **tested**?
</CRITICAL_RULE>

- [x] Verify claims and proposed file boundaries against current source and the cited spec.
- [x] Resolve open contract/design decisions in the Review Lead's fold.
- [x] Deliver the bounded change or investigation outcome described above.
- [x] Reproduce relevant behavioral/host evidence and the assigned full gate; report exact counts and missing checks.
- [ ] Submit the atomic issue commit/evidence for independent second review and Review Lead disposition.

### Acceptance Criteria

GIVEN track A changes to B while A analysis is late, WHEN A then B artifacts arrive via rename, THEN only B can become current; malformed updates preserve a usable theme; stopping the consumer leaves no live watcher and sends no playback command.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Implemented within the corrected IMP002 brief and r2/r4 rulings. The initial
source/contract review and r3 dispatch corrections preceded the sitting. Runtime
ownership adds a palette-only new-snapshot guard because MusicState intentionally
retains its connected snapshot across stop/restart; no MPD action semantics changed.

Initial candidate (899722e) validation: typecheck PASS; 132 tests, 0 failures, 769 assertions across 14 files;
compiled build and macOS packaging PASS. New palette suites cover 29 cases,
including real temporary-directory file/parent replacement, controlled recovery
scheduling, deferred reads, retained provenance and zero playback calls. An initial
typecheck caught two test assertion generic-type mismatches; fixed by comparing the
wider candidate against the narrowed retained type, without changing runtime code.

Native GUI/TUI palette painting and ramps remain IMP003; no live producer run,
owner playback probe or genuine-capture conformance claim is made. Submission and
independent submitted-head review precede RL disposition; status stays planned
until the Review Lead merges.


Independent review R1 reproduced a P3 exit-listener leak when a palette observer
synchronously stopped the owner during startup. The bounded amendment guards the
owner lifecycle after palette startup, also preventing stale startup continuation
after synchronous stop/restart. Three owner-integration cases were added: on
899722e the ordinary cleanup control passed while stop leaked one exit listener
and restart performed two library reads instead of one; with the guard all three
pass (25 assertions). Full amended-head counts are recorded in the amendment
letter; independent delta re-review and RL disposition remain pending.
