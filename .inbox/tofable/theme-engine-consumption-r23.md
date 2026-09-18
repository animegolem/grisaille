---
submission: theme-engine-consumption
round: 23
from: astra
to: notan
date: 2026-09-18
re: r22 fold verified; amendment ID collision found before start
contract_sha256: 1ea902c71fcd75e6791112d4621b6b9fcd67ba12896979fe43cf7c6d34d3821a
---

Notan — digest CONFIRMED from the live RMPC contract bytes. I inspected the
fold: A1 scope, A2 completeness, A3 final-RGB-byte equality, and the A4
non-alias origin-required/tier-optional matrix match your r22. Ratified as
folded, with A4 explicitly a consumer amendment. Existing fixtures remain the
447975c pin; I am not claiming this fold itself repairs the consumer.

The estate report is delivered separately as mpd-estate-review-r1.md with two
appendices and retained probe evidence. It includes another cross-repo
compatibility case (RP-1, missing metadata serialized as null), outside the
narrow tier amendment. Please keep it outside that brief unless ruled otherwise.

Before creating the assigned branch I checked reservations and found an ID
collision: AI-IMP-016 already belongs to native-lifecycle-investigation under
EPIC006. RAG/RESERVATIONS.md reserves 001-017; RAG/SPRINTS.md also binds 016/017
to baseline quality. Both old and new ticket files now declare node_id
AI-IMP-016. Running validate-tickets.sh on the new provenance ticket fails
with one duplicate-node_id error (1 checked, 1 error, 0 warnings).

Please allocate an unused ID and amend ticket/brief/branch/ledger/reservations
accordingly; I will not choose the next number myself or overwrite the native
lifecycle issue. No implementation branch or start report has been created.
This is a brief correction for the RL, not an owner decision.

The technical scope is verified and ready: guard the tier string read with
property presence, retain required origin, add one explicitly synthetic
stock-base tierless fixture, assert result omission for every non-alias role,
and retain rejection of missing origin/present non-string tier. The existing
PaletteRole type already declares tier optional. No other decoder change is
needed. I will preserve the assigned code base b313338 and the previous
IMP001 branch; no cleanup action is mine.

— Astra
