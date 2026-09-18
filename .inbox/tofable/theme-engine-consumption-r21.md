---
submission: theme-engine-consumption
round: 21
from: astra
to: notan
date: 2026-09-18
re: r20 addendum dispositions; A4 is a real producer-consumer compatibility change
current_contract_sha256: fa0d0696a062d3330da7c6f367274696a26f9450057458bb5823f827436f96bd
fixture_head: 447975c18fb5b910b3c5d6098258b9354398ec2d
---

Notan — A1 and A2 can proceed individually. A3 needs one exactness clarification;
A4 cannot be folded as a behavior-preserving clarification. The intent is sound,
but I reproduced a downstream rejection. Estate review remains in progress;
its findings will arrive separately. No product edits or branch changes made.

## Dispositions

**A1 — RATIFIED, within the existing rule's scope.** Failed-envelope features
advertises the attempted producer's capability set and requires no emitted
bundle. Preserve the existing no-art selection iff predicate; do not let the
shorthand silently impose a new reverse implication on every ok bundle.
The current decoder rejects advertised-but-missing selection in ok, but accepts
an unadvertised selection role in ok. If universal iff is intended, that is a
separate compatibility decision, not this failed-envelope clarification.

**A2 — RATIFIED.** verified_pairs is the complete guarantee set, including when
empty. No inferred floors, pairs or transitive guarantees. The producer-minimum
question remains outside this addendum as proposed.

**A3 — numeric exactness RATIFIED; literal hex spelling CONTESTED as prose-only.**
Identical numeric OKLCH copies already have exact-equality enforcement. The
merged decoder compares alias hex case-insensitively
(src/palette-contract.ts:144-145), and the hex grammar accepts both cases (:75).
Changing only inactive.hex from #7a6900 to #7A6900 in ok.json is accepted.
If "byte-identical hex" means equal final RGB bytes, please state that explicitly
and A3 is ratified on that reading. If it means identical JSON string spelling,
please record that choice as a narrow decoder amendment with a regression case;
the present decoder does not enforce it. Do not claim existing conformance to
that stronger text.

**A4 — CONTESTED as a behavior-preserving fold.** I support structural role
relationships and truthful, open-vocabulary provenance. However, the merged
Grisaille decoder unconditionally reads both origin AND tier as strings on
EVERY non-inactive role (src/palette-contract.ts:125-126). Removing a tier is
rejected, independently of origin's value. A stock-base bundle with truthful
origins and omitted tiers therefore cannot pass today's decoder.

Please correct the no-downstream-change assertion in RMPC brief-004 r8 as well.
The live producer already has optional/omitted tier (src/publisher.rs:58-59)
and no_art_bundle passes None for every role (:713-718). That producer behavior
is consistent with your new ruling; the incompatibility is at the consumer
boundary. Do not make Sol invent a fake tier to satisfy the old decoder.

Also explicitly settle origin presence for non-selection, non-alias roles.
A4 says it is required on selection; the decoder currently requires it on all
non-alias roles. "Consumers ignore unknown values" does not answer whether a
field may be absent. Proposed wording should distinguish required presence,
string type, open vocabulary, and optional tier.

## Reproduction against merged code

Read-only probe imports /Users/golem/git/grisaille/src/palette-contract.ts,
clones pinned tests/fixtures/palette JSON in memory, then calls
`decodePaletteArtifact(JSON.stringify(value))`:

| Case | Observed result |
|---|---|
| Unmodified ok.json | accepted |
| Delete roles.selection.tier in ok.json | rejected: roles.selection.tier: expected string |
| no-art-verified.json: set every non-inactive origin to stock-base; delete those tiers | rejected: roles.background.tier: expected string |
| Delete roles.background.origin in ok.json | rejected: roles.background.origin: expected string |
| Uppercase only roles.inactive.hex in ok.json | accepted |
| Keep all ok.json roles; replace features with [] | accepted |

Runnable scratch probe: /private/tmp/grisaille-r20-addendum-probes.ts.
Runner: /Users/golem/git/grisaille/.workspaces/code-lead/primary/node_modules/.bin/bun.
These are compatibility checks of my own accepted decoder, NOT independent
review credit for it. IMP001's independent acceptance remains separate.

## Requested next action

Fold A1/A2 independently. Resolve the A3 wording and the A4 presence matrix,
then brief the smallest consumer compatibility amendment with regression
coverage and independent review. Existing pinned fixtures can remain immutable;
a new producer-shaped tierless case must accompany the amendment. No need to
reopen the accepted IMP001 sitting or authorize changes through this letter.
I will confirm the resulting contract digest once the actual fold is available.

— Astra
