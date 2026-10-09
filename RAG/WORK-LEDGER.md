# Grisaille execution ledger

An offered brief is not an implementation start. Review Lead owns dispositions;
executor reports supply evidence. Started work requires a real task, independent
clone, branch/base and first-command timestamp before a lease can be renewed.

## Live

| work | assignee | state | since | progress_at | next_actor | evidence / trigger |
|---|---|---|---|---|---|---|
| DELIVERY-ACTIVATION | review-lead | parked | 2026-09-08 | | review-lead | AI-IMP-015; bind owner-designated implementation task after bootstrap review; activation is separate |

## History

AI-IMP-018 sitting CLOSED 2026-09-18: started 2026-09-18T04:42:18Z
(task 01a0b1ef-a541-7901-a9c8-166db919d068); submitted r1 at tip
d647f4b on preserved base b313338 (carrier event 57bd8548292667dc,
exact-event ACKed, letter SHA256 verified); independent exact-head
review NO FINDINGS; RL gates reproduced at head and on merged main
(typecheck, 103/0/525, validator); verdict ACCEPTED; MERGED to main;
ticket completed; docs editorial applied in the RL fold. Clone branch
cleanup owed by RL under the destructive-op fence.

SPRINT-001 IMP001 sitting CLOSED 2026-09-18: started 2026-09-18T00:02:21Z
(start record .inbox/tofable/imp001-decoder-start-r1.md, RL-verified);
submitted r1 at tip 0b69abe on pinned base 1b35174 (carrier event
67d954340b1c8559, exact-event ACKed); independent second review of both
heads clean (.inbox/tofable/imp001-decoder-independent-review-r1.md);
RL final review at RAG/reviews/imp001-final-review.md (gates reproduced:
typecheck PASS, 99/0/413; three contract questions ruled); verdict
ACCEPTED (.relay archive imp001-decoder-{inbox,outbox}-r1.md); MERGED to
main at b313338; AI-IMP-001 ticket completed. Clone branch cleanup owed
by RL under the destructive-op fence; genuine-capture conformance is a
separate future gate.

ROLE-HANDOFF documents CLOSED 2026-09-17: initial fold 1abab9f;
r12 R1/R2 corrections at ff995fd (SPEC rev 0.2, gate restored);
Astra receipt in theme-engine r16 ("verified and closed... that
consistency review is no longer owed"). Roles: notan RL, Astra CL
+ adversarial review; separate independent head-review required.

BUILDER-MEM declaration CLOSED 2026-09-17: rev 0.2 folded at ea776f6 +
f191ae0; Astra faithful-fold receipt at
.inbox/tofable/shared-builder-memory-r5.md; SIGNED OFF, fixture-only scope,
no live registration or implementation authorized. (Ledger correction per
r12 R3: the r11 claim of a ledger update was false — that edit silently
no-op'd against rows Astra had already rewritten; this entry is the real
update, diff-verified before claiming.)

Bootstrap cleared independent review and integrated to main at 3608afe; see
RAG/reviews/bootstrap-clearance.md and AI-LOG-001. Independent Code Lead clone
created and verified. Ready letter published 2026-09-08T11:02:30.308450+00:00. No product
implementation or unattended wake is active. Read-only review started with
verified receipt at 2026-09-08T11:03:31Z. Ready and start events are both ACKed.

AI-IMP-014 completed 2026-09-08: owner supplied the verified GitHub remote,
main published at 75f0cc2, and Code Lead publication routing configured.
Independent configuration review cleared; see RAG/REMOTE.md and the review
record. Remote creation is no longer an owner blocker.

2026-09-17: Astra acknowledged Notan's r8 role handoff in
`.inbox/tofable/theme-engine-consumption-r10.md`: Notan owns planning, final
review and merge; Astra owns implementation and adversarial plan/contract
review. Role-document synchronization is offered to Notan. The r7-r9 contract
and interpolation decisions remain with Astra; no implementation start was
issued. The builder-memory next action was corrected to Notan's rev 0.2 fold
following Astra's already-deposited r3 amendments.

2026-10-03: IMP002 preparation handoff reviewed and dispositioned (r2 in
.inbox/toastra/imp002-preparation-r2.md; report digest d18b4ecf verified).
D1 association-not-freshness confirmed, SPEC rev 0.3 (§4.6/§8.1/§8.2); D2
read/watch-only + continue-at-cap recovery ruled; D3 retention table adopted;
D4 ownership/files pinned, capture gate sequenced as separate parallel brief.
Ticket AI-IMP-002 amended; BRIEF-IMP002 cut, branch imp/002, base d41b0875.
Apple Music/Jev direction note banked as future intake. No sitting started;
start remains explicit on the Code Lead's start report.

2026-10-03 (later): Code Lead adversarial review r3 (digest 47969ab4
verified) found three dispatch faults in the r2/brief package; all accepted
and corrected at d0e0de4: ref-cleanup permission withdrawn (PROTOCOL fence,
RL-only), src/music-session.ts admitted ownership-only, base re-pinned to
d0e0de4 via r4. SPEC rev 0.3 editorial alignment applied (4.2/15/16/17).
Routine choices ratified: docs/palette-runtime.md, MUSIC_UI_PALETTE_PATH,
conservative non-default-MPD binding. Awaiting Code Lead delta recheck and
explicit start record. Routing corrected: Grisaille Code Lead is
astra_grisaille at w3:pB, not the VampireOTP seat.

2026-10-03 SITTING OPEN — AI-IMP-002 (transactional palette subscription).
Start record .relay/inbox/imp002-palette-start.md (durable copy
.inbox/tofable/imp002-palette-start-r1.md, SHA256 fa33255c verified);
carrier event e2bb7ece123b3bf4 ACKed exactly after r4 delta recheck CLEAR.
First command 2026-10-03T13:31:35.521014+00:00; observed origin/main
df69c73; branch imp/002 created clean at assigned base d0e0de4; previous
refs preserved per fence. Lease: Code Lead (astra_grisaille, w3:pB) holds
the imp/002 sitting within the corrected bounded scope (BRIEF-IMP002 +
dispositions r2 as corrected by r3/r4). No product result claimed yet.
Review path on submission: independent exact-head review, then RL boundary
review and merge.

2026-10-03: Owner designation (verbal, carried by RL): the VampireOTP Astra
seat is Grisaille's STANDING independent second reviewer — a distinct
instance from the implementing astra_grisaille per the owner's same-day
instance ruling. IMP002 second review assigned there
(RAG/briefs/SECOND-REVIEW-IMP002.md, head 899722e); submission held until
rounds close.

2026-10-03: IMP002 second review r1 returned (VampOTP Astra seat, standing
reviewer): gate reproduced at 899722e, no P1/P2, one P3 (exit listener
survives synchronous owner stop during palette startup, probe included).
RL disposition .inbox/toastra/imp002-review-disposition-r1.md: fence ruled —
assigned-ticket checklist/evidence + regenerated INDEX are authorized round-2
bookkeeping (SPRINT-001 brief authority; supersedes IMP001 zero-edit
observation as precedent); P3 repair REQUIRED before submission; amended head
needs delta re-review; RL will byte-check INDEX at merge. Submission remains
held.

2026-10-03 SITTING CLOSED — AI-IMP-002 ACCEPTED AND MERGED (0836359).
Submitted head 0d5e471 (r2 CLEAR); carrier event 6f330bba7fbc1eb6 exact-event
ACKed, payload byte-identical across all three copies. RL boundary review
reproduced the full gate in canonical (135/0/794, build, package, validators
26/0/0 and 1/0/0); INDEX regenerated byte-identical; frozen boundaries
zero-diff. Final review RAG/reviews/imp002-final-review.md; ticket completed.
Lease released. Open next: genuine-capture gate brief; IMP003 (host color
mapping); RL ref cleanup coordinated with Code Lead.

2026-10-03: Accepted verdict published to channel (outbox event
332af75e72df91da) for Code Lead exact-event ACK and pair archive. RL ref
cleanup EXECUTED per destructive-op fence, coordinated (clone parked on
main at a49c91a by Code Lead first): deleted imp/001, imp/018, imp/002 in
the Code Lead clone and imp/002 + review/imp002 in canonical. All were
merged ancestors of main; nothing force-deleted. AI-LOG-002's owed fence
cleanup is now closed.

2026-10-09: Owner ruled sequencing — IMP003 proceeds ahead of the IMP019
capture gate (gate stays open, pends the owner's live capture). Ticket
AI-IMP-003 amended (pure mapping core as decomposition requirement);
BRIEF-IMP003 cut and assigned to Code Lead; standing reviewer unchanged.
Owner also ruled the decomposition direction: carve pure cores along
ruled contracts (cover service cross-court, color kernels as Bend pilot,
palette decoder, session state machines); RL coordinates with Astra and
Sol; RFC in the commons. No sitting started; start remains explicit.

2026-10-09 (later): IMP003 round 1 received (digest 3bcac80d verified) and
dispositioned in r2: R1 placeholder overlay ADMITTED (+IME-composition
acceptance case); R2 precedence table and 4.5/3.0 floors ADOPTED (+marker
re-checked on winning background; hover cue-only); R3 pure-core boundary,
all requested paths, and fail-closed probe seam ADMITTED (NavigationLog
isolation is acceptance evidence); R4 composite families ADOPTED — RL owes
their filing to the RMPC design queue; nothing gates the sitting. Start
AUTHORIZED on the Code Lead's start record. Base pins to this commit.
