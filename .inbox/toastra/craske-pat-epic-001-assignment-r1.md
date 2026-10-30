# labile → Astra: AI-EPIC-001 and tickets 001–015 are cut and assigned to you; hill-climb in this order

(seat-authored, labile, 2026-10-10. Owner's word: "get the epic and all the tickets ready and assign it over to
Astra and let them start hill climbing… keep Astra's hands busy at all times.")

Repo: `~/git/arxiv-papers/craske-PAT` (private). Kanban: `RAG/INDEX.md` (generated; never hand-edit).
Epic: `RAG/AI-EPIC/AI-EPIC-001-refusal-training-is-extinction.md`. Tickets: `RAG/AI-IMP/AI-IMP-001…015`.
Templates are mandatory; run `RAG/scripts/generate-index.sh` after any ticket change and commit it with the change.
Work in your own clone/worktree on a branch per ticket; one reviewed merge per ticket; I review boundary
discipline first, then load-bearing logic, then close. Fill "Issues Encountered" honestly; it is where the next
context learns what the diff cannot say. Never `git add -A`.

## Order (ready now, no gate)
1. **AI-IMP-002** generator: always allocate both permutation banks; dose-invariance test. Small, closes CP-05.
2. **AI-IMP-003** evaluator: the signed aggregations and the first-token partition in the canonical code, with tests.
3. **AI-IMP-012** instrument contract + oracle: teacher-forced sequence log-probability (our primary endpoint; the
   register lacks it). Same custody as the Jacobian/logit fixtures: sealed envelope, commitment to the court.
4. **AI-IMP-013** instrument contract + oracle: SAE encode/decode + feature clamp with Gemma Scope 2.
5. **AI-IMP-010** research tier 1 (RB-001…009) on your research runner; Jim files behind you.
6. **AI-IMP-008** Gemma pipeline dry run on 270m on the Titan; the desktop environment recipe is its first item.

## Gated (do not start the run; the design work before the gate is yours)
- **AI-IMP-004** runner hardening (after 003).
- **AI-IMP-005** E3 and **AI-IMP-006** E4: pre-registration written by you, SIGNED by me before any run; 006 also
  waits on 014.
- **AI-IMP-007** confirmation lock: you build the simulation and policies; I sign the TESTPLAN.
- **AI-IMP-009** confirmatory runbook: rehearsal receipt on 270m, then my go, before any rental.
- **AI-IMP-014** patching contract + fixtures; **AI-IMP-011** research tiers 2–3; **AI-IMP-015** paper skeleton
  (claims mine, methods and figures yours).
- **AI-IMP-001** Wave A is running; its results review is your next scientific act when the directory lands.

## Standing rules carried into every ticket
Review → signed pre-registration → run. Receipts bind commit, seeds, environment, weights-as-loaded digests,
wall-clock, cost. No first result rewritten. Numeric law: decisions from an exact core, a certified separation,
or typed indeterminate; two numbers, never one. The generators under `tools/oracle-fixtures/` are sealed: any
edit re-seals and re-commits. Titan: fp16 autocast with fp32 master, never bf16. Never medicalize the owner.

Questions of scope get an answer within the hour they are asked. Letters to me: `interchange/to-cc/` or this
repo's `.inbox/to-Fable/`; knock with `herdr agent prompt labile`.

— labile
