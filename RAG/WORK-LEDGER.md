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

2026-10-09 (recorded for a future ticket, outside IMP003): Astra observed
Grisaille's artwork adapter tries readpicture BEFORE albumart — the reverse
of the RMPC producer's resolution (publisher.rs:918-920) and of
cover-service/1's ruled binding law. For both-sources tracks, displayed art
can differ from the art whose hash rides the palette artifact. Correct fix
is adopting cover-service resolve() when it lands (Grisaille stops fetching
art itself); interim alignment is a small ticket to cut post-compact
(IMP020 candidate). Astra's cover-service point-3 changes went directly to
Plumb (letter in interchange/to-plumb/, digest 76e3aebb).

2026-10-09 SITTING OPEN — AI-IMP-003 (host theme mapping and ramp).
Start record .relay/inbox/imp003-theme-start.md (durable copy identical,
SHA256 aa0c0a3d verified both); carrier event ee9ff145ece4621b ACKed
exactly. Branch imp/003 clean at exact assigned base 1f83303; first
command 2026-10-09T22:47:04.499980+00:00. Lease: Code Lead
(astra_grisaille, w3:pB) within BRIEF-IMP003 + r2 dispositions (IME case
checked early, per her start note). Review path: independent exact-head
second review (standing reviewer), then RL boundary review, INDEX
byte-check, merge.

2026-10-09 (in-sitting ruling): IMP003 IME seam (r1 digest ffc59e0d
verified) ruled — the R1 acceptance condition means FIRST delivered
pre-edit event (flushSync + exact echo), measured bridge latency recorded
on actual host with real IME, hide latched through composition, platform
limit stated honestly; native-frame atomicity explicitly NOT required and
would be a separate upstream admission. Sitting continues; no scope change.

2026-10-09 (clarification, in-sitting): the IME ruling's "real IME
session" is satisfied by macOS dead-key marked text on the existing U.S.
keyboard (it exercises the same marked-text path: pre-edit via onChange,
marked_range, hide+latch). Installing a language input source is NOT
required; any host input-source change would need owner approval and is
not to be done as incidental setup. If dead keys do not produce marked
text in the GPUIX input, report rather than install.

2026-10-09 (in-sitting, probe infra): GPUIX 0.7 automation simulate_click
reproducibly aborts (double_lease_panic) after repeated captures. Code Lead
works around via child stderr/exit recording, existing keyboard action, and
an OS-delivered click for actual click-through evidence — no dependency
patch, no scope change. Recorded as a pinned-dependency finding; candidate
for the same upstream GPUIX report as the placeholder hardcode. Guard: the
OS-delivered click targets only the probe-launched app.

2026-10-09 (in-sitting ruling): native-evidence boundary set (r1 digest
7c27e3c2 verified) — conservative same-clock upper bounds + functional
pre-edit sequence ACCEPTED in place of unmeasurable isolated bridge
latency; metric named honestly everywhere. R4 family-2 tuple corrected to
(#7c86ff, 89/255, input background), hardcoded upstream — PROTOTYPE.md
correction owed by RL at merge. Pinned-dependency findings now four
(placeholder hardcode, simulate_click panic, selection wash, no native
timestamp) — one consolidated upstream report candidate, owner's call.
Self-audit repairs (fill==track; drag-preview state pair) proceed in
ratified rules; reviewer re-checks those seams at candidate.

2026-10-09: IMP003 candidate received (packet digest 74b20187 verified;
head d54d055, one atomic commit on canonical 0f82a22, clone clean,
+5397/-254 across 16 files). Exact-head gate green per packet
(155/0/1048 + validators). Honest disclosures: native automation script
remains failed (late getTree timeout, no complete-pass claim), two
self-audit repairs flagged for review, one CUA rebinding incident
disclosed. SECOND-REVIEW-IMP003 assignment cut for the standing reviewer.
Submission held for independent rounds.

2026-10-09 (in-review precision correction, Code Lead self-reported): the
candidate packet's CUA-incident wording "snapshot mtime updated" was an
INFERENCE — only a post-launch mtime (23:36:21.727100Z) was observed; no
contemporaneous before hash/copy/stat exists, so a pre/post difference is
not established. Recorded argv/PID observation and a stale September
handoff copy path supplied to the standing reviewer (no private bodies);
reviewer is distinguishing observed metadata from source-derived write
effects. Head d54d055 untouched; no relaunches; live private-state file
not accessed during clarification.

2026-10-09: IMP003 second review r1 returned (digest 0723b18d verified):
no P1/P2, gate reproduced byte-identical, both flagged seams validated;
ONE P3 — the private-state mtime wording is an inference, not a measured
change. RL disposition (.inbox/toastra/imp003-review-disposition-r1.md):
evidence-only amendment required in the reviewer's wording (post-launch
mtime observed; no before baseline; content equality and attribution
unproved); NO restoration/rollback ruled — the stale September copy is not
a baseline and a "repair" would be worse than the disclosed unknown;
optional probe-launch guard may ride the amendment. Delta re-review, then
carrier submission, then RL boundary review and merge.

2026-10-10: IMP003 evidence amendment delivered — new head 90c9000 (old
d54d055), rebased onto bc436b0 (correspondence/RAG-only drift), range-diff
confirms ticket incident prose only, gate reproduced, binary byte-identical.
Optional probe-launch guard DECLINED by Code Lead to keep the delta
evidence-only — correct; recorded as a future probe-infra item (rides the
IMP020-era housekeeping, not this sitting). Delta review with the standing
reviewer; carrier hold maintained.

2026-10-10: IMP003 independent r2 CLEAR at 90c9000 (digest 3b604074
verified); rounds closed, R1 repaired, runtime byte-identical, no guard.
STABILITY OBSERVATION retained per reviewer: one intermittent timeout in
palette-file.test.ts:283 (atomic replacement event, 2500ms) on first gate
attempt (154/1/1044), full rerun 155/0/1048 with zero source/dependency
change; cause unresolved, not claimed infra-only. RL boundary gate will
note frequency; recurs -> its own small ticket against the IMP002 watcher
seam. Carrier submission may proceed.

2026-10-10 SITTING CLOSED — AI-IMP-003 ACCEPTED AND MERGED. Submitted head
90c9000 (r2 CLEAR); carrier event c38c0a5c exact-ACKed, payload identical
across all three copies. RL boundary gate reproduced in canonical
(155/0/1048, build, package, validators 27/0/0 + 1/0/0); INDEX regenerated
byte-identical; frozen boundaries zero-diff; watcher intermittent did not
reproduce (0/1, rule stands). PROTOTYPE.md:265-266 corrected per evidence.
Final review RAG/reviews/imp003-final-review.md; ticket completed. Lease
released. Open next: accepted-verdict publish + pair archive; IMP019
(owner capture); IMP020 candidates (readpicture-order, probe guard);
RMPC design-queue filing of R4 composite families (RL-owed).
