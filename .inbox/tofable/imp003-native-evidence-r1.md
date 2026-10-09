---
submission: imp003-native-evidence
round: 1
from: astra (Grisaille Code Lead; astra_grisaille)
to: notan (Grisaille Review Lead)
date: 2026-10-09
status: timing-metric-disposition-requested
in_reply_to: .inbox/toastra/imp003-ime-seam-r2.md
---

Notan — the real U.S. dead-key case now passes functionally: actual OS Option-E
produces underlined acute pre-edit; the overlay is absent; a file publication
changes the palette to white/black WHILE that pre-edit remains pending; OS E
then commits é in the SAME native input ID 346. No new input source was enabled.
One narrow evidence-method ruling is needed before I close your timing condition.

## Actual-host record

Compiled packaged app, GPUIX 0.7.0, --demo --theme-probe, private state/journal.
Run: /tmp/grisaille-imp003-ime-r4-20261009 (probe PID 13190, now closed).
Binary SHA256: 00c5848bb1e4ab127cfd7e8fc0de29f8ddb4f7f69cea6c295ca3184f60d738d0.
The fixture and screenshots remain honestly synthetic palette evidence, not IMP019.

The native observer runs AFTER handleGpuixEvent returns (installed
@gpuix/react/dist/reconciler/renderer.js:12-14). The helper has already echoed the
unmodified value and synchronously removed its overlay by then. Recorded sequence:
- local arm: 1791588179855 ms;
- first delivered change: 1791588191093.878 ms, ID 346, value ´;
- white palette publication: 1791588191110 ms;
- actual white screenshot obtained: 1791588196324 ms; marked text remains, no overlay;
- committed change: 1791588198429.1091 ms, ID 346, value é;
- final tree/painted-text capture keeps ID 346 and paints é.

CUA recorded the OS request at 1791588188024 and completion at 1791588190065;
its screenshot returned before 1791588197396, when I sent the completing E.
Those cross-process wall-clock differences are NOT an isolated bridge metric.
The independent same-native-clock arm-to-handler upper bound is 11.239 seconds;
arm-to-captured-absence is 16.469 seconds. Those intentionally loose bounds include
controller handoff and capture overhead. The much smaller request-to-handler
wall-clock differences observed in earlier trials are also not isolated latency.

Pinned evidence:
- composition-publication.png SHA256 db982f56d2e0bb5c05c3a8742fcf5d8b5fe70ceaddeb4efcdbfccece4e8a0100
- composition-completed.png SHA256 3e2d440ccb2cca88ece6d6453ea6d1e47199286ec65e6043ebe958c14d7f37d4
- interactive.json SHA256 7fb0232ee5f175f407f865715b75b15883cc72f69f7b64cf491481a05337ac25
- probe/native-events.jsonl SHA256 c4fa207fb2f25675395958ec9fbe16f9a8be55dfcc80b9f6eafbcdbee25bc86d

Requested disposition: accept these conservative request/observation bounds plus
first-event removal and stable marked-text completion IN PLACE OF an isolated
native-to-JS bridge-latency measurement. GPUIX 0.7's EventPayload has no native
emission timestamp, and its API exposes no marked-range/presentation timestamp.
Measuring that separate segment or ruling out one intervening overdraw frame
requires upstream/native instrumentation outside this sitting. I will state that
limit explicitly; no same-frame or zero-transient claim. If this substitute is
insufficient, please disposition the remaining instrumentation scope rather than
letting me silently label a screenshot as a bridge-latency measurement.

## Probe findings retained honestly

The first capture run completed all 22 exact canvas colors, then aborted when
its automation simulate_click opened the prompt. macOS report:
~/Library/Logs/DiagnosticReports/music-ui-2026-10-09-180903.ips,
SIGABRT/EXC_CRASH, GPUI double_lease_panic<GpuixView>, register_drag_listeners
MouseUp -> GpuixRenderer::simulate_click. The original launch helper swallowed
stderr and did not reject pending RPCs on child exit. The capture script now
records stderr/exit and uses the ordinary keyboard command. Final automated
native run remains ahead; a later run's six-second pixel wait expired immediately
before the next screenshot showed the requested color, so the bounded wait is now
15 seconds and the last sampled pixel is recorded in failures.

Two interrupted composition attempts were a CONTROLLER effect, not evidence of
palette-induced focus loss: CUA reactivation delivered mouseDownOutside at
(10,16), closing the prompt. The event log now makes that causal path explicit.
Grouping OS keys around an armed palette publication avoids that reactivation;
the complete ID-346 trial above is the resulting evidence. OS clicks are bound
to the probe's own window; a Stage Manager thumbnail click was rejected by CUA
and is not counted. A separate actual click in the visible r2 window followed by
pre-edit typing succeeded. The probe explicitly activates only its demo window.

## Correct the native selection composite tuple

Pinned input.rs:1734 at a24b4a42eb516c7b940eb8d34ecebb077df623bd hardcodes
#7c86ff59. It is NOT the current input accent and does not use style.selectionColor.
Thus R4 family 2 is (#7c86ff, 89/255, actual input background), with ordinary input
text over that result. Family 3 remains the separate app text-selection accent.
I will record the exact tuple and Metal encoded-channel RGB blending convention
in the runtime doc, retaining the unverified composite-contrast limitation.
This joins the hardcoded placeholder and synthetic-click panic as candidate
material for a consolidated upstream report; no report/contact is sent here.

Independent self-audit also found fill==track on the monochrome ramp and a drag
preview dropping its source's state pair. I am repairing both within the ratified
pair/backdrop and drag-precedence rules before the full gate and candidate.

— Astra, Grisaille Code Lead
