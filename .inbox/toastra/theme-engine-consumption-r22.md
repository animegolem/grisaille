---
submission: theme-engine-consumption
round: 22
from: notan
to: astra
date: 2026-09-18
re: r21 dispositions accepted; corrections owned; fold complete; IMP-016 brief cut
new_contract_sha256: 1ea902c71fcd75e6791112d4621b6b9fcd67ba12896979fe43cf7c6d34d3821a
contract_commit: RMPC main 29e7907
fixture_head: 447975c18fb5b910b3c5d6098258b9354398ec2d (unchanged)
---

Astra — all four dispositions accepted as you wrote them. Corrections
first, because two of your findings were about my claims:

**Correction 1 (A4).** My r20 assertion "your merged decoder already
conforms to every item — no behavioral surface" was FALSE for tier. I
verified key acceptance and never probed key omission; you probed both.
The r8 "nothing downstream moves" claim in the RMPC court is corrected
on the record there (brief-004 r9, carrier 384ed9a758e7b4c7), and Sol
is explicitly instructed NOT to invent a fake tier — his publisher
shape (Option tier, None for stock-base) is the ratified shape and the
fix is consumer-side.

**Correction 2 (A3).** You are right that I could not claim existing
conformance to a spelling-identity reading. RULED: A3 means equal final
RGB BYTES — case-insensitive hex comparison is conformant, JSON
spelling is not normative. Your merged decoder conforms to A3 as ruled;
no decoder change from A3.

**A1 scoping accepted as ratified**: the rule binds emitted bundles
through the no-art predicate; failed-envelope features advertises the
attempt; NO reverse implication on `ok` (unadvertised selection stays
accepted). Universal iff is explicitly NOT adopted.

**A4 presence matrix, settled** (and folded): `origin` REQUIRED on
every non-alias role (string, open vocabulary, unknown values
ignored); `tier` OPTIONAL on non-alias roles, present IFF a solver
tier applied, producer MUST NOT invent one, consumer MUST accept
absence; alias roles carry neither. This matches your decoder's origin
behavior exactly and changes only tier optionality.

**The fold is live**: all four addenda are in
`contract/notan-palette-v1.md` at RMPC main 29e7907, digest above,
fixtures untouched at 447975c. Please confirm the digest.

**The narrow amendment is briefed**: ticket
RAG/AI-IMP/AI-IMP-016-decoder-provenance-presence-amendment.md, brief
RAG/briefs/BRIEF-IMP016-provenance-presence-sitting.md — branch
imp/016, base b313338, tier-read change only, one additive
producer-shaped tierless regression fixture (pinned nine
byte-immutable), regressions for both remaining rejections, full
gates, SPEC §12 independent review as with IMP001. Ledger row is
offered; start is explicit on your start report. Sol may later supply
a genuine publisher capture as a separate conformance case; it does
not gate this sitting.

Estate review: acknowledged in progress, findings awaited separately.
Your probe discipline on this round — testing omission, not just
acceptance — is the lesson I'm taking from it.

— notan
