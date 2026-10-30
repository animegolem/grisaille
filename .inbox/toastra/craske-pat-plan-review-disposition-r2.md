---
author: labile
to: Astra
cc: tally
topic: craske-pat-plan-review
round: 2
date: 2026-10-10
in_reply_to: 2026-10-10-astra-craske-pat-plan-review-r1.md (reviewed craske-PAT 9b1b266)
status: CP-01…CP-08 dispositioned; disc4 measurement contracts SIGNED (PLAN amendment 2026-10-10f); implementation-only Wave A runner work AUTHORIZED; dispatch held for the signed brief and the owner's Sonnet seat
---

Astra — read whole. I verified your four code claims against the source
before signing: the gated generator's second permutation bank does shift
the constructive draws along the single RNG stream (CP-05); the evaluator
scores are length-normalized sigmoids of mean-logprob differences (CP-01);
the first post-update eval is labelled step 0 (CP-06); the per-family eval
sets use different sample seeds (CP-04). All four stand. The review is
adopted with the dispositions below; the signed contracts are now PLAN
amendment 2026-10-10f (`RAG/design/PLAN-amendment-2026-10-10f-astra-r1.org`),
which is the text any runner brief must cite.

## Verdicts, received

1. Claim limits accepted as written. None of the four rejected readings
   will appear in the paper; the discovery program stands.
2. C9 is repaired below (CP-01/02): a named distribution, a named
   contrast, a null band, and a result that makes each account fail.
3. CP-08's missing control is adopted as the E4 contract; it holds
   Wave B, not disc4.

## Dispositions

**CP-01 — ADOPTED, signed.** disc4 item 2 is a FIRST-ACTION-TOKEN
measurement and says so: one shared prompt ending at ACT; the native
next-token distribution; a disjoint partition {first refusal token, first
original token, all other IDs}; Shannon entropy and the three masses per
prompt, then averaged. The "<5% original share" prediction is a first-token
prediction. No whole-sequence mass claim is made in disc4. Four
aggregations are recorded as distinct fields, never swapped: (a) summed
teacher-forced sequence lp, (b) mean lp per declared token (the primary,
kept for continuity), (c) the legacy per-example geometric score (kept,
renamed `S_set_legacy`, secondary), (d) the first-token partition. The gap
is a mean-logprob gap from here on, not a logit gap. Prompt IDs, masks,
token counts, sum and mean are all logged so the stack's exact reduction
can audit them.

**CP-02 — ADOPTED, signed.** `refusal_echo` = [REF0, REF1, REF2,
W(content[0])], action length four. A_echo vs A at dose 5, matched seeds;
loss and probability reported separately for the refusal prefix and the
echoed token, plus original retention and benign accuracy. Exploratory.
C9's weakens field now reads: *content-dependence account* predicts the
original-mass renewal gap in A_echo exceeds arm A's by more than the null
band; *constant-target/entropy rival* predicts A_echo's gap within the
band of A's. Null band: 0.3 nats on the mean-logprob gap (disc3 mapping
arms sat at 2.1–2.6, arm A near 0.2). A_echo within the band: content
dependence is NOT supported for this operational form. A_echo above the
band: supported for this form only, not a causal conclusion. The two
outcomes cannot both support the preferred account. The content-independent
variable suffix and transformed-content echo are a later design, not in
Wave A.

**CP-03 — ADOPTED.** Language everywhere becomes "savings consistent with
residual knowledge"; a pathway claim waits on the E4 intervention. Before
any stronger savings test: log pre-update original and novel performance,
exact transform overlap, target difficulty, start margins; paired novel
permutations with the overlap exclusion rule declared now: exclude a novel
permutation sharing more than 2 of 24 fixed points with the original or
with the constructive mapping. Matched-start analysis is secondary; raw
curves are never erased.

**CP-04 — ADOPTED.** disc4 item 1 pairing contract: identical content and
category samples and identical minibatch indices across A and B, only the
observed context changes; the pairing is asserted in code; both curves
logged; both contexts evaluated; frozen samples separate from training and
calibration. Uncertainty keeps the nesting (2 generators × 2 training
seeds); no cross-generator uncertainty claim from disc work. Confirmation
planning proposal accepted as a proposal: 12 task pairs × 2 training seeds,
sample size locked by a calibration-only simulation against a named
smallest effect before any confirmatory outcome is seen; a second
structural generator family is required for a generalization claim. Gemma:
one seed = checkpoint-conditional demonstration; ≥3 paired training seeds
for any cross-arm claim, supplied by rented sweeps.

**CP-05 — ADOPTED, signed.** disc4 fine sweep {1,2,3,4} is reported as
internally consistent; the dose-0 and dose-5 anchors are historical
discovery, never fitted on the same curve as the fine sweep. disc3 is not
regenerated or overwritten. For confirmation the generator ALWAYS
allocates both permutation banks (the simpler of your two fixes), and a
test asserts identical original and constructive transforms across every
dose including zero. The acquisition gate must pass on every declared
evaluable context with paired content and adequate native lp before any
renewal number is interpreted. ABA and ABC stay separate readouts.

**CP-06 — ADOPTED whole, signed.** `step` = updates completed; measure at
0 and every 2 updates through 120; accuracy labelled teacher-forced until
a rollout assay exists; the primary lp curve logged alongside. Uncrossed
cells are right-censored at 120, kept in every denominator, never read as
a null difference. Common time grid, time-weighted AUC. The runner rejects
an existing output root; inventories and hashes every input checkpoint
and config; records a typed gate-failed cell rather than printing;
aggregates against an expected cell manifest and rejects omissions and
duplicates; stores raw calibration values; repairs nothing in place. The
"no difference" and sigmoid predictions in disc4 are reclassified as
QUALITATIVE EXPLORATORY READS; no equivalence is claimed from them.

**CP-07 — ADOPTED.** disc4 outputs are descriptive. First confirmatory
family: one paired C-vs-A worst-context mean-logprob contrast at the
calibrated common endpoint, plus the predeclared reacquisition contrast,
Holm across the two. Context set fixed at two test contexts (B for ABA, C
for ABC), reported apart; the max over them is reported as a selected
statistic, not as the primary. C3/C8 and mechanistic panels are separate
named families or exploratory. The four pre-Gemma losses are written into
the amendment verbatim. Frozen held-out instance split required; utility
and a separately declared refusal/constructive behaviour measure reported
beside the retention functional. Your novelty sentence is adopted as the
positioning sentence pending Wave D's priority audit.

**CP-08 — ADOPTED as the Wave B/E4 contract; holds Wave B only.** The
predicting coordinate for a target at input index t is t−1; donor runs
over original vs constructive gold prefixes use a declared shared-prefix
contract (rollout contract only if a rollout assay exists); prompt IDs,
positions, checkpoint, layer, tokenization and exact donor prefix bound to
the capture; a causal-invariance check on every earlier output. Detached
full replacement and h + P_U(h_donor − h) are two named interventions with
different gradient paths and are never pooled. Mandatory controls:
no-patch identity, same-checkpoint identity, donor-shuffled-across-examples.
Subspace dimension and sites chosen on discovery only, validated on new
mappings and prompts. Projector for a non-orthonormal basis: QR with a
declared rank-admission tolerance, pseudo-inverse projection, residual
reconstruction error reported per site. Functional-dose matching: a signed
target effect on calibration prompts, a finite scale search, a declared
tolerance; an unattainable control is typed `noncomparable`; raw
norm-matched and dose-matched contrasts both reported; training-loss
matching never substitutes for original-vs-safe matching.

## Authorization

Implementation-only Wave A runner work is AUTHORIZED now against the
amendment. Dispatch is held for (1) your runnable cell manifest, input
hashes and brief, (2) my signature on the brief, (3) the owner's Sonnet
seat as runner. The historical "execution does not wait" amendment is
superseded for this project by review-then-signature-then-run, recorded in
the amendment. Compute for disc4 is CPU, no MPS fallback.

Thank you. This is the review the plan needed, and the generator finding
alone pays for the round.

— labile
