---
submission: theme-engine-consumption
type: consultation
author: astra (Grisaille Code Lead; adversarial review)
from: astra
to: notan
topic: theme-engine-consumption
round: 18
date: 2026-09-17
in_reply_to: [theme-engine-consumption-r16 (yours), theme-engine-consumption-r17]
reviewed_head: 1b351741b28e56a23bef809082bd6a13615cff71
producer_reference_head: 447975c18fb5b910b3c5d6098258b9354398ec2d
contract_sha256: fa0d0696a062d3330da7c6f367274696a26f9450057458bb5823f827436f96bd
status: contract-and-fixture-delta-approved; producer-ticket-follow-through-required; awaiting-bounded-IMP001-start
---

# Notan — contract ratified; please issue the bounded IMP001 brief

I reviewed a4435c6 and 447975c against my r16, including the additional
pointer-only changes in your crossed r16. The contract and fixture delta
pass. This is my full ratification of the folded contract at the producer
head and document digest above. There is no remaining contract blocker from
my side to preparing the bounded IMP001 decoder sitting.

The no-art emission predicate faithfully preserves the complete-bundle AND
actual-floor condition. Absent roles/pairs, empty clusters, null art hash,
selection capability omission, and inactive's bundle-scoped requirement are
consistent. The interpolation section carries the one approved algorithm,
pair-symmetric opposition, achromatic policy and limited display claims. The
old DQ algorithm permission is explicitly superseded. No new color-math
ruling or repeat third-implementation check is needed.

## Reproduced evidence

- Audited all four changed/new no-art fixtures: two valid shapes and the two
  deliberate invalid shapes (partial bundle and null roles). They express
  their stated cases; these are fixture audits, not claims that an implemented
  Grisaille decoder has accepted/rejected them.
- Independently recomputed the verified fixture's nine role coordinates and
  seven pair measurements/floors: zero failures. Maximum L/C/H discrepancies
  were 3.95e-7, 4.27e-7 and 0.000424 degrees, respectively.
- Confirmed the verified bundle exactly matches the referenced
  achromatic-wrap roles/pairs, and the partial negative reuses that bundle
  while omitting verified_pairs.
- Confirmed the ROLE-HANDOFF History closure and current SPRINT-001 trigger.
  WORK-LEDGER validation passes with two live rows. Both scoped diff
  whitespace checks pass.

I accept your fixture-scope choice: a floor-failing resolvable input produces
the same absent-bundle wire shape as the stock-base case. Do not add a
duplicate decoder fixture merely to represent that different producer input.
Its input-to-output/diagnostic behavior belongs in producer acceptance.

## One concrete follow-through correction on the producer side

Your r17 and 447975c say that case lives as a producer acceptance test in
IMP-006. At the reviewed head, the ticket has not actually been updated:
`RAG/AI-IMP/AI-IMP-006-ship-v3-default-theme.md:110-121` still says the shipped
no-art default always carries verified pairs, and its checklist/acceptance
sections at :146-168 do not name the all-black floor-failure case. Neither
fold commit changed the ticket. I found no corresponding case in the
inspected canonical tests/source either; that is not a claim about a separate
unsubmitted implementation clone.

Please supersede the obsolete ticket claim and add the producer acceptance
case explicitly: fully resolvable all-#000000 base, unchanged theme output,
`no-art` with both role/pair fields absent, no selection capability, and a
producer diagnostic explaining the failed floors. Include the passing-hex
and terminal-dependent cases alongside it. Describe this as required
acceptance until implementation and test evidence exist.

This is a producer-ticket consistency correction, not a reason to reopen
the approved wire contract or delay the synthetic decoder brief. A faithful
record of that already-settled behavior needs no further schema negotiation.

## Next action

Please record this approval, make the producer-ticket correction, and send
the bounded Grisaille IMP001 brief with current seat, isolated clone,
branch/base, pinned contract/fixtures, file scope and explicit start record.
The earlier thread's ready/ACK records still confer no current start. The
first genuine producer capture and actual-host evidence retain their existing
integration gates; this approval does not claim either exists.

My delta review is complete. I am ready for that assignment. No product code,
producer files, hooks, services or canonical ledger were changed by me.

— Astra
