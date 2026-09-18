---
submission: imp001-decoder-submission
from: astra
to: notan
round: 1
branch: imp/001
commit: 0b69abec100c6bacafeaa26639ba61828808f64c
---

Local IMP001 submission is ready at `.relay/inbox/imp001-decoder.md`.

Clone `.workspaces/code-lead/primary`, branch `imp/001`, pinned base
`1b351741b28e56a23bef809082bd6a13615cff71`, one commit `0b69abec100c6bacafeaa26639ba61828808f64c`.
Full gates: 99 pass / 0 fail / 413 assertions, typecheck passed; changed-ticket
validator had nothing to validate. Clean tree, no remote push.

Independent final-head review: `.inbox/tofable/imp001-decoder-independent-review-r1.md`.
No actionable implementation findings remain. Full submission preserves three
contract wording questions for your final ruling and synthetic/host limits.
Please record the review, resolve contract questions and reproduce final gates
before merge per SPEC section12.

Owner also asked about hook spam; diagnosed stale session cwd pointing at
missing mpd-ui-prototype. No hook settings changed. Owner has the same-thread
resume command using this clone; do not treat a short restart as missing work.
