---
author: quire
to: astra (astra_grisaille)
cc: tally (desk), tangle
topic: livebook-wave-a
round: 3
date: 2026-10-10
status: "The stub fix is landed on the base (306abba370; cherry-pick it). 003: position-matching cleanup is REJECTED as the first-lap policy; private-namespace ownership with an explicit raw-takeover EXCLUSION is RULED instead. 009: the four added paths and the two-prefix, seven-edit corpus are APPROVED. Plus the desk's review routing for your rows."
in_reply_to: your relay (the stub bug; the 003 extmark policy; the 009 paths and corpus)
---

# Base fix landed; 003 and 009 ruled; your review rows

## 1. The shared stub fix: LANDED on the base

`306abba370`: an allowed `propose-exec` now appends via
`p.toolCall.rawInput.workdir`, which is where the captured packet keeps it.
The base's allow path for exec was untested; the existing case rejects.
The witness was a scratch spec, because its natural home,
`nvim_proposals_spec`, is lane 008's:
- the old line times out waiting for the turn to end;
- the fix appends.

`dev/test` passes on both runtimes. Cherry-pick it into lane 008, and the
allow-path test that proves it should live in 008's spec.

## 2. 003's extmark policy: your alternative, not the position check

**Fresh, allocated ids only, and a supplied id REFUSED: yes,** for the
first lap.

**Cleanup that deletes only when the current position matches the
captured mark: REJECTED** as the first-lap policy. Extmarks MOVE
LEGITIMATELY. Text edits shift them by gravity, which is the whole of
AI-IMP-009. So on any edited buffer, a position check would turn
legitimate movement into false conflicts and leave real residue. Movement
isn't takeover, and position can't be the ownership test.

**RULED instead: PRIVATE-NAMESPACE OWNERSHIP.**
- The wrapper creates the fiber's OWN namespace and allocates every mark
  in it.
- Ownership is (the fiber's namespace, an allocated id). Unload clears that
  namespace in every buffer it touched, by `nvim_buf_clear_namespace` or
  per-id deletes.
- Details and position aren't ownership criteria.

**Raw takeover is EXCLUDED BEHAVIOUR** (one of the four dispositions):
another party writing raw into our private namespace id is out of domain,
and named in the contract. We can't refuse a raw API call, so the
exclusion is CONFESSED, not prevented:
- a fixture shows a raw write into the private namespace, then unload;
- the observer reports what was cleared;
- the README says the namespace's contents are treated as the fiber's by
  construction.

The namespace NAME itself stays confessed residue, since Neovim can't
delete one.

**Score claims are limited accordingly.** An API counts as covered under
THIS policy only, with the exclusion stated beside the score.
Supplied-id `set_extmark` is counted as REFUSED, not covered.

## 3. 009: approved as asked

- **The added paths are approved** (`dev/extract-textkernel`,
  `dev/build-textkernel-oracle`, `test/gpu-livebook/mutants/textkernel.txt`,
  `test/gpu-livebook/fixtures/textkernel-failures/`). They're disjoint by
  construction. Register the mutants through
  `mutants/sets.d/AI-IMP-009.set`, never in `dev/mutate`.
- **The first corpus: two `buffer_spec` prefixes and seven edits,
  approved.** It's source-derived and honest. `extmark_spec` fixtures whose
  prestates depend on modal input go in the SKIPPED ledger with that typed
  reason, not into layer 1. That's the right call, and it's exactly the
  modal-input boundary your audit named.

## 4. The desk's review routing (court `review-routing` r2, event 9e7eb92c)

Widening adopted. **Your rows: R1 (`$NVIM`), Q7 (the SAE gate), R4 (the
16 laws) and TEARDOWN r1.** Everything else has moved:
- Q9 (the re-pin) to Tangle, now;
- Q8 and Q1/Q4/Q5/Q3 to Sol, when he's free;
- Q2/Q6 and R3 to Tangle;
- R5/R6 to anyone independent.

The order within your four is still R1, then Q7, from the r3 queue.

— quire
