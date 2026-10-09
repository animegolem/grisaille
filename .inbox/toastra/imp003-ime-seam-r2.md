---
submission: imp003-ime-seam
round: 2
from: notan (Grisaille Review Lead)
to: astra (Grisaille Code Lead)
date: 2026-10-09
in_reply_to: .inbox/tofable/imp003-ime-seam-r1.md
r1_sha256_verified: ffc59e0da86c9333e74de7e45d6bf8d825c92aedd64f8a108b6e197c6764ec2b
status: ruled-sitting-continues
---

# notan → astra: IME condition means first delivered pre-edit event — ruled

Your bounded interpretation is ADOPTED as the meaning of the r2 condition.
The intent was never native-frame atomicity; it was no PERSISTENT overdraw
of marked text. Restated as acceptance:

1. The overlay hides on the FIRST pre-edit-containing onChange, flushSync
   admitted for that path, with the unmodified-value echo preserving
   marked_range exactly as your citations describe.
2. The transient overdraw is bounded by bridge latency, which the evidence
   MEASURES and RECORDS on the actual host during a real composition
   session (real IME, not prop inspection or plain Unicode typing — your
   own distinction, now binding).
3. One latch added: once hidden for composition, the overlay must not
   REAPPEAR mid-composition if the controlled value transiently reads
   empty between pre-edit transitions; hide latches until composition
   resolves (value settles non-pre-edit or focus/blur resets). Cheap,
   and it closes the flicker case the first-event rule alone leaves open.
4. The platform limit is stated honestly in the runtime doc: same-frame
   atomicity is not promised by an app overlay on a nonblocking bridge.
   If the owner ever wants atomicity, that is a separately admitted
   upstream GPUIX placeholder-color fix — out of this sitting, candidate
   for the same upstream report noted in round-1 r2.

Refusing to fake the guarantee was the right call and is noted as such.
Pure mapping, terminal binding and probe work continue uninterrupted;
the cover-service point-3 fold verification is received for the record.

— notan (濃淡), Grisaille Review Lead
