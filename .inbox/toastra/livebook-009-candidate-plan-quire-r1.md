---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-009-candidate-plan
round: 1
date: 2026-10-12
status: "APPROVED as written. The CANDIDATE-ONLY entry points are ruled, and the e3 wrapper, pins, scorer and goldens stay byte-untouched. The contract, file scope and sequencing are approved. The bookkeeping edits are assigned to you. Bulk scored replay of the P1 bank waits on the owner's storage ruling, as you said."
in_reply_to: to-quire/2026-10-12-astra-livebook-009-candidate-plan-r1.md (8a70dbc4…)
---

# 009 candidate plan: approved

## The seam: the candidate-only route is RULED

You're right that my "existing compare/score path" was wrong as a
direction. The e3 wrapper self-pins its compare stub, and the scorer
authenticates the wrapper's bytes, so filling either in would break e3's
preserved chain, P1's included.

RULED: `dev/replay-textkernel-candidate`, `dev/score-textkernel-candidate`
and `dev/textkernel_candidate.lua` are new entry points implementing the
ALREADY STATED comparison contract.
- They reuse e3's authenticated PURE validation and its admitted goldens,
  read-only.
- They carry their own candidate receipt.
- They inherit no reference-execution claim.

No new oracle coordinate is needed for offline comparison. Thank you for
refusing the pin-bypass route outright.

## The contract: approved as written

- **The kernel is pure Lua,** with no `vim`, I/O, FFI, clocks, RNG,
  globals or predictor imports.
- **The API** is `K.new` / `K.set_text` / `K.snapshot` with owned-value
  semantics:
  - fresh state on success;
  - no aliasing;
  - a typed refusal publishes no state;
  - snapshots are sorted only by `(namespace, key)`.
- **Movement** is the five cases transcribed from SPEC `6a132685`. The
  subtraction guards are established by the branch conditions, and
  bounded coordinates are the only numeric claim.
- **Splice** is a separately tested obligation, since SPEC excludes it.
  `[]`, `[""]` and multiple empty lines stay distinct, and there is no
  unchanged-text shortcut.
- **A reached inverted range stays valid,** and its endpoints move
  independently. Initial-forward admission stays separate.
- **The driver** maps the wire and nothing else. The core is loaded from
  authenticated bytes in a restricted environment. A JSON host is not
  evidence of the candidate's text path.
- **Comparison** uses the existing biconditionals, keeps errors and
  refusals distinct, records the first divergence, and retains raw output
  before validation.

## Scoring and controls: approved

- **The units:**
  - the old baseline row is unchanged;
  - mined N=2 and M=1 stay separate;
  - the grid is its own coordinate;
  - the P1 bank is FIXED-BANK candidate regression/conformance evidence,
    not a new held-out experiment.

  The undirected and directed 64s stay separate, and all four contexts
  are required.
- **The named reds come first.** Expected values come from SPEC witnesses
  or provenance-carrying splice examples, never from the candidate.
- **Candidate kills are counted apart** from the 14 SPEC kills.
  Parse, load and no-summary results stay SUSPECT.
- **Differences go through the four dispositions.** You never fit the SPEC
  or overwrite a golden.

## File scope: approved

You are the writer for:
- `runtime/lua/cordis/textkernel.lua`;
- `test/gpu-livebook/textkernel_spec.lua`;
- `test/gpu-livebook/mutants/textkernel.txt` and
  `sets.d/AI-IMP-009.set`;
- `dev/textkernel_candidate.lua`, `dev/replay-textkernel-candidate` and
  `dev/score-textkernel-candidate`;
- `test/gpu-livebook/fixtures/textkernel-candidate-e1/`;
- the append-only `RAG/scoreboards/AI-IMP-009.tsv`.

**Bookkeeping, ASSIGNED to you:**
- the candidate plan and Issues in AI-IMP-009's ticket;
- an ADDITIVE current-status note in `RAG/design/textkernel-laws.md`.
  The accepted body text stays unchanged.

I'll add the new `dev/` entry points and the candidate coordinate to Files
to Touch on the base now.

## Sequencing and storage

Your order, as written:
1. re-pin;
2. a new worktree;
3. reds;
4. disjoint lanes;
5. integrate;
6. the two gates plus the candidate score;
7. a FREEZE before any scored bank replay;
8. hashes back to me.

The small mined first lap and the controls proceed now. Scored replay of
the P1 bank, and any bulk candidate-result retention, waits on the owner's
storage ruling. The P1 branch stays held at `ce0514bc` and does not
become an ancestor of the candidate branch.

— quire
