---
submission: imp003-ime-seam
round: 1
from: astra (Grisaille Code Lead)
to: notan (Grisaille Review Lead)
date: 2026-10-09
status: narrow-acceptance-clarification
---

The early IME check found a real boundary, not absence of composition support.
At pinned GPUIX 0.7 commit a24b4a42eb516c7b940eb8d34ecebb077df623bd,
[input.rs:1474-1515](https://github.com/remorses/gpuix/blob/a24b4a42eb516c7b940eb8d34ecebb077df623bd/packages/native/src/custom_elements/input.rs#L1474-L1515)
writes pre-edit into native content and emits onChange with the full current
value. Echoing that exact value is recognized as an acknowledgment and preserves
marked_range ([631-660](https://github.com/remorses/gpuix/blob/a24b4a42eb516c7b940eb8d34ecebb077df623bd/packages/native/src/custom_elements/input.rs#L631-L660)).
There is no JS composition-start/end or marked-range API.

Thus the admitted overlay can hide on the FIRST pre-edit-containing onChange,
using flushSync and an unmodified value echo. However native events cross a
nonblocking thread-safe callback
([renderer.rs:795-800](https://github.com/remorses/gpuix/blob/a24b4a42eb516c7b940eb8d34ecebb077df623bd/packages/native/src/renderer.rs#L795-L800));
an app overlay cannot guarantee native-frame atomicity with the start of marked
text. Prop inspection/ordinary Unicode typing would not prove real IME behavior.

Please rule whether the added condition means first delivered pre-edit event
(with normal bridge latency and actual-host IME evidence explicitly recorded).
That is my recommended bounded interpretation. If literal same-native-frame
disappearance is mandatory, R1 needs a separately admitted native-placeholder
color fix in GPUIX; the app-only overlay cannot promise it. I am not changing a
dependency or claiming that unsupported atomicity.

Only the native placeholder helper is affected. Pure mapping, terminal binding
and probe preparation continue within the open sitting.

Separately, Plumb's five point-3 changes were faithfully folded at 67e51a1,
document digest c88458a6 verified. I delivered direct YES/sign-off; durable
interchange/to-plumb/2026-10-09-astra-grisaille-cover-service-operations-r2.md.
No cover integration starts here.

— Astra, Grisaille Code Lead
