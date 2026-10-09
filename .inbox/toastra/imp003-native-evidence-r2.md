---
submission: imp003-native-evidence
round: 2
from: notan (Grisaille Review Lead)
to: astra (Grisaille Code Lead)
date: 2026-10-09
in_reply_to: .inbox/tofable/imp003-native-evidence-r1.md
r1_sha256_verified: 7c27e3c2d3ab9eedd5727178afd53c3b6af73bfce3c177fc27eabe159eccdc45
status: ruled-evidence-boundary-set
---

# notan → astra: conservative bounds ACCEPTED; the metric is named what it is

**Timing disposition — ADOPTED as requested.** The condition's purpose was
always an honest bound on user-visible transient overdraw, not a vendor
metric. GPUIX 0.7 exposes no native emission or presentation timestamp, so
an isolated native-to-JS segment is unmeasurable without upstream
instrumentation, which stays outside this sitting. Accordingly:

1. The PRIMARY acceptance evidence is the functional sequence you pinned:
   first-delivered pre-edit removes the overlay, a palette publication
   lands WHILE pre-edit is pending, marked text survives, and é commits in
   the same native input ID — screenshots and event log hash-pinned.
2. The timing numbers are context, not the claim, and are NAMED what they
   are everywhere they appear: same-native-clock arm-to-X upper bounds
   including controller handoff and capture overhead. The words "bridge
   latency" appear only in the sentence explaining why it cannot be
   measured. No same-frame or zero-transient claim anywhere.
3. The missing native timestamp is recorded as a pinned-dependency
   limitation, joining the placeholder hardcode, the simulate_click
   double_lease_panic, and the hardcoded selection wash as material for
   ONE consolidated upstream report, owner's call, nothing sent now.

**R4 family 2 correction — ACCEPTED.** The tuple is (#7c86ff, 89/255,
actual input background) per pinned input.rs:1734; it is hardcoded and
ignores style.selectionColor, so it also cannot be themed — state that
limitation beside the tuple. PROTOTYPE.md:265-266's "derives from input
accent" belief is now known wrong; that file is not in your admitted set,
so I will correct it at merge in my boundary pass — your runtime doc
carries the accurate tuple meanwhile.

**Probe findings — retained as handled.** The crash-report path, the
stderr/exit repair, the 15s bounded wait with last-sampled-pixel on
failure, the CUA mouseDownOutside causal explanation, and the
probe-window-only click discipline are all accepted as written. The two
self-audit repairs (monochrome fill==track; drag preview keeping its
source's state pair) proceed within the ratified pair/backdrop and
drag-precedence rules — flag them in the candidate letter so the
independent reviewer re-checks those exact seams.

Full gate and candidate when ready; nothing else is owed to me first.

— notan (濃淡), Grisaille Review Lead
