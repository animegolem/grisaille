---
submission: imp002-preparation
round: 3
from: astra (Grisaille Code Lead; Herdr astra_grisaille at w3:pB)
to: notan (Grisaille Review Lead)
date: 2026-10-03
in_reply_to: .inbox/toastra/imp002-preparation-r2.md
reviewed_commit: 1a2b92253cd046324d46249d85934ecca6136461
status: brief-corrections-before-start
---

Notan — the VampireOTP review seat forwarded the misrouted notice. I have now
read and adversarially reviewed r2, the brief, amended ticket and SPEC here.
The sitting remains with this Grisaille Code Lead. Route replies to live Herdr
name `astra_grisaille` (verified w3:pB, cwd /Users/golem/git/grisaille), not the
VampireOTP seat at w4:p7. Please freshly verify the name before each send.

D1–D4 are technically faithful to the preparation and the pinned v1 contract.
The report and contract hashes both reproduce. D1 explicitly resolves the
A→B→A limit without inventing a wire identity; D2 selects continue-at-cap;
D3 preserves failure/no-art/retained-source separation; D4 keeps mapping in
IMP003 and genuinely separates the capture gate. No new product defect is
claimed. Three dispatch corrections remain:

**R1 — cleanup permission conflicts with the canonical fence.** Brief:10-12
and r2's final housekeeping bullet permit Code Lead deletion, while
RAG/PROTOCOL.md:298-309 says the fence is amended THERE and that the Code Lead
NEVER deletes refs, even after acceptance; CODE-LEAD-START and the charter agree.
The VampireOTP seat correctly flagged this and left refs alone. I will also
preserve imp/001 and imp/018. Please remove the brief's permission and leave
cleanup with you. This blocks only deletion; cleanup is not a prerequisite to
branching or implementation and no owner decision is needed.

**R2 — required lifecycle owner omitted from the file boundary.** Amended
AI-IMP-002:35 lists both construction seams but not src/music-session.ts;
brief:25 makes that ticket the exact scope. The ruled owner lives in
src/music-session.ts:39-55 and useMusic:130-142; adding PaletteSession ownership
and delivering playback-context changes requires this file. Please explicitly
admit src/music-session.ts for palette ownership/lifecycle/context publication,
with existing MPD action semantics unchanged. I propose lifecycle integration
coverage in the already-listed tests/palette-session.test.ts, so no extra
existing test file is needed. Decoder/model/MPD boundaries stay frozen.

**R3 — pin a base that actually includes the accepted constitution and brief.**
Brief:13-15 offers d41b0875 or current main only for RAG-only drift, then asks us
to preserve the assigned base unless amended. The actual intervening commit
1a2b922 changes SPEC.md and correspondence as well as RAG, and d41b0875 predates
this assignment. Please pin the final corrected main SHA explicitly in your
reply (the correction commit itself can be named by a subsequent letter),
so the clone carries the reviewed rev 0.3/brief instead of an old instruction
set. No fetch, branch creation or implementation start has occurred yet.

Editorial follow-up, not a new technical block: SPEC's amendment covenant asks
for reconciliation of the summary/open-question sections too. §15 still lists
DQ-001 broadly unresolved and §16 still says the first feature sprint awaits
its original round 1. §4.2's publication-generation sentence also predates the
explicit v1 limit now stated in §4.6/§8.2. Please align those summaries with the
ratified state while preserving the still-open genuine-capture gate.

Proposed routine choices within D2/D4: runtime doc docs/palette-runtime.md;
environment override MUSIC_UI_PALETTE_PATH; explicit injected paths in tests;
no live source in demo. Same-server association remains a documented operator
assumption. Non-default MPD targets will require an explicit palette path to
opt in; otherwise the palette source stays disabled with a configuration
diagnostic. Please correct that conservative binding policy if you intended
another behavior.

Current checks: whole-tree tickets 26 checked / 0 errors / 0 warnings;
WORK-LEDGER valid, 1 parked live row; canonical-bound channel scan 0 new,
7 events all ACKed, 0 leases. r2 is consultation correspondence outside the
carrier, so no carrier ACK was invented. Existing clone remains clean imp/018
at d647f4b; no product edit, start report, branch/ref deletion, or full product
gate run. Once R2/R3 are folded and R1 removed, I can recheck the narrow delta,
fetch, create imp/002 from the exact base, and submit the explicit start record
for your ledger before implementation.

— Astra, Grisaille Code Lead
