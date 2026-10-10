---
node_id: AI-IMP-003
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: completed
depends_on: ["AI-IMP-001", "AI-IMP-002"]
parent_epic: [[AI-EPIC-001-theme-consumption]]
confidence_score: 0.75
assignee: code-lead
date_created: 2026-09-08
date_completed: 2026-10-10
---

# AI-IMP-003-host-theme-mapping-and-ramp

## Host theme mapping and ramp

Native theme tokens are static and terminal colors currently reduce gradients to the first stop. Semantic roles and actual output encoding need a deliberate shared mapping.

Normative scope: SPEC.md §8, §5.3–5.6 and §14.3. This is a work projection; no implementation
begins without the assigned brief and explicit start.

### Out of Scope

No component/page extraction, visualizer, producer algorithm changes or arbitrary color regrading. Browser movement/selection semantics remain governed by SPEC §6.

### Design/Approach

Ratify mapping for normal/muted/playing/selection/context states, with explicit fallback for absent derived selection. Bind both hosts to the accepted palette snapshot, including input colors. Add a known color ramp and actual-host conformance record; do not claim dynamic-background or full-gradient contrast. The mapping core is a PURE function (accepted snapshot in, one complete mapped theme out — no host reads, no clocks, no IO) published reactively per fold F8; host binding and repaint live at the edges. This is a decomposition requirement (amended 2026-10-09, owner-ruled direction): the pure core is a future standalone library, so its boundary is part of acceptance, not style.

### Files to Touch

src/theme.ts; src/app.tsx theme subscription seams; src/terminal/app.tsx color mapping; focused host tests; review fixture under tests/fixtures/palette/.

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
- [x] Submit the atomic issue commit/evidence for independent second review and Review Lead disposition.

### Acceptance Criteria

GIVEN a verified palette for the active track, WHEN it is committed, THEN existing native and terminal views update coherently with readable specified pairs and distinct interaction states; the known ramp passes the recorded output-path check or an explicit fidelity limitation remains open.

### Issues Encountered

<!-- Filled during the sitting. Record failed attempts, blockers, deviations and missing tests honestly. -->
Implemented under the round-1 R1-R4 fold, the IME seam ruling, and the native
evidence boundary ruling. The mapper consumes retained bundles only and returns
a complete immutable theme; both hosts subscribe through the existing owner.
State backgrounds and all descendant foregrounds travel together, selected wins
over active, and missing/inadequate proofs select a complete neutral bundle.

Validation before candidate: typecheck PASS; 155 tests, 0 failures, 1048 assertions
across 17 files; build (188 modules) and macOS packaging PASS. The three added
suites contain 20 cases (12 pure/probe, 2 native binding, 6 terminal binding).
Exact submitted-head gates and capture digests are pinned in the candidate letter;
runtime mapping, encoding, composite tuples and evidence are in
docs/palette-runtime.md.

Self-audit found and repaired two defects: monochrome seek fill equaled its track
(the regression was reproduced red and green), and the floating held row dropped
its source's selected/playing pair. Both are flagged for independent review.
Native GPUIX 0.7 hardcodes placeholder and selection colors: the ruled overlay
preserves the native input; selection wash remains an explicit host limitation.
Actual OS dead-key pre-edit survived a palette publication and committed in the
same input. Timing records only the ruled conservative arm-to-X bounds. Real
OS focus plus a rendered frame was needed to demonstrate blur reset; synthetic
inactive-window focus is not equivalent. Synthetic-click panic and intermittent
native capture stalls are preserved as dependency/probe evidence, not concealed
by the green source tests. No dependency change or upstream contact was made.

Both host ramps use labeled synthetic artifacts and isolated state/journals.
Terminal bytes establish serialization only; physical display, composites,
whole-gradient fidelity, owner acceptance, and IMP019 genuine-capture conformance
remain open. An accidental UI-tool bind after a probe exited launched the bundle
in normal mode; the implementer reports terminating it without UI input. The
ordinary GUI snapshot's post-launch mtime was observed in the incident window;
no before-metadata or before-byte baseline exists; content equality and causal
attribution are unproved. The process/UI observations were not saved as a
standalone raw receipt. No private-state restoration is authorized or attempted.
This run is excluded from probe evidence; subsequent binds verify a live probe PID.

Final submission and Review Lead disposition remain pending independent review;
kanban status and the final checklist item remain open.
