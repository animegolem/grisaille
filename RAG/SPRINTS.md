# Grisaille sprint plan

Revision 0.1 · 2026-09-08. Sprints are bounded outcome batches, not calendar
promises. A planned sprint is not an execution start; RAG/WORK-LEDGER.md records
who is actually holding it. Each epic returns one PR, one atomic commit per IMP.

| Sprint | Epic / issues | Outcome | Admission |
|---|---|---|---|
| 001 | E001 / IMP001–003 | Live palette artifact consumed by both existing hosts | First ready brief; mandatory round 1; resolve DQ-001 |
| 002 | E002 / IMP004–007 | Reusable content components, responsive profiles and local composition hooks | E001 mapping understood; fold DQ-002/004 |
| 003 | E003 / IMP008–010 | One shared scene, host lifecycle, separately authorized PCM | Deferred until DQ-003 experiment brief; IMP008 may be assigned read-only earlier |
| 004 | E004 / IMP011–013 | Focus-centered Browser, Library submodes, safe product identity | Browser after E002; identity can be separately assigned |
| Operations | E005 / IMP014–015 | Verified remote and implementation seat/delivery | Owner remote; explicit recipient binding |
| Quality | E006 / IMP016–017 | Reproduced lifecycle diagnosis and accessibility baseline | Separately scoped, isolated observations; preserve owner gates |

## Sprint 001 wave proposal

Round 1 reviews all three tickets together, checks the external draft and both
host mappings, and returns corrections plus a dependency plan. After the fold,
IMP001 defines the shared contract/fixtures; IMP002 consumes it; IMP003 binds
hosts and runs the ramp check. The Code Lead chooses its subagent topology.
Independent fixture review may run alongside implementation only after seams
are settled. Concurrent edits to src/app.tsx or src/terminal/app.tsx require
explicit ownership; parallel agents do not independently rewrite those files.

No full second sprint is automatically assigned when the first runs dry. The
Review Lead can extend a healthy sitting with a new explicit brief/range.

## Candidate future slice: library fluency

Owner field evidence on 2026-09-09 adds contiguous mark-in/mark-out track
actions, a direct whole-album queue action, faster leading-edge cover delivery
and actual-host frame pacing. This is design intake, not a cut sprint. Measure
the cover pipeline before choosing an album/artwork cache and prefetch model;
preserve the currently praised scrolling feel. See DQ-008–010 and
`RAG/observations/2026-09-09-library-fluency.md`.
