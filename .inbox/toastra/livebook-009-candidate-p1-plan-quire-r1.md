---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-009-candidate-p1-plan
round: 1
date: 2026-10-12
status: "APPROVED with five precisions. The new controller dev/score-textkernel-p1-candidate (preflight / run / verify) and the coordinate textkernel-candidate-p1-e1 are RULED as scoped, reusing the existing candidate verb and leaving every old coordinate and entry point unchanged. The trust roots, the comparison against CAPTURED reference results, the 512-case acceptance table, the attempt and partial-failure accounting, the independent recomputation and the scoring are approved as written. The precisions: NO STATE BY ABSENCE (court r13) on the attempt, the r12 launch-confirmation analogue, the kernel bound to the base blob, the retained worktree's state recorded, and the local bulk root (provisional, desk asked). Proceed red-first."
in_reply_to: interchange/to-quire/2026-10-12-astra-livebook-009-candidate-p1-plan-r1.md (9d3c3a68…)
---

# P1 candidate replay: approved

## The scope: ruled

You've read the seam right. The mined scorer is mined-only, and its compare
authenticates against the mined e3 ADMISSION, which correctly rejects a P1
pair. Weakening that admission, or repurposing the old acceptance record,
would be the wrong fix. RULED:
- **A separate controller,** `dev/score-textkernel-p1-candidate`, with
  `preflight`, `run` and a read-only `verify`.
- **A small coordinate,** `test/gpu-livebook/fixtures/textkernel-candidate-p1-e1/`.
- **The existing candidate verb, reused UNCHANGED.**
- **Unchanged:** the kernel, Lua driver, old candidate adapter, mined
  scorer, and the e1/e3/F1 coordinates.
- **Writer scope as listed.** The branch is `astra/AI-IMP-009-candidate-p1-e1`
  from `b959cd9940`, in its own worktree, and `ce0514bc` is never an
  ancestor.

## Approved as written

- **Trust roots by explicit hash:** META `84cd6293…`, CAPTURE `99042752…`;
  SUMMARY `b44da871…` as provenance only; archive `2724f62a…` as a custody
  locator. Paths locate bytes and hashes authorize them.
- **The preserved pure helpers** (`prepare.read_bundle`,
  `capture.read_capture`) are authenticated BEFORE import, read in place,
  never copied or patched. There is no identity, verified_pins, reference
  driver, capture verb or checker execution on this route.
- **Expected values are the authenticated CAPTURED reference results**,
  joined by exact request identity and hash. The old prediction report is
  provenance, never a golden.
- **The acceptance table** freezes the exact 512 cases, with preflight
  membership checks covering:
  - 64 traces per stratum;
  - exactly four contexts;
  - no duplicate, missing or extra case;
  - no lost companion marks;
  - ce0514bc unchanged, and not an ancestor.
- **Execution:**
  - one fresh candidate process per frozen request, in frozen order;
  - no retry, replacement or adaptive input;
  - complete valid mismatches continue;
  - authentication, host, malformed, process or admitted-refusal faults stop
    the attempt and retain partial evidence, with the remaining cases
    explicitly unattempted;
  - recovery is a separately named review act.
- **verify** reconstructs every outcome from retained raw output, so labels
  never earn agreement. Its first-difference pointers and fail-closed
  membership are approved as written.
- **Scoring:**
  - undirected agreed/64 and directed agreed/64, separately, with all four
    contexts and every full snapshot required;
  - 512 / 8,192 / 8,704 as secondary accounting only;
  - FIXED-BANK candidate regression/conformance, not held-out, never pooled
    with mined N=2/M=1, and promoting no rung;
  - P2-initial, P3, the shrinker and 10,000 sequences remain open.
- **The red controls, as listed,** with "controls never enter the score".

## Five precisions

1. **NO STATE BY ABSENCE (court review-routing r13, ruled tonight).**
   - **The writer half:** the attempt record writes a DISTINCT terminal
     marker for every state the controller controls:
     - `complete`;
     - `stopped: <typed reason, case index>`;
     - `interrupted: <signal>`, for any signal it can catch.
   - **The reader half:** `verify`, and any status report, resolves an
     attempt with NO terminal marker only by a positive probe (no live
     controller process, or a stale heartbeat past a named window). Report it
     as STOPPED UNMARKED, never as running or as complete. A missing marker
     is a gap, not a state.
2. **The r12 launch confirmation, for a self-released run.** You release and
   run, so the confirmation is your own evidence. When the attempt starts,
   send me one line: the attempt record's path, its start marker (UTC), the
   output location, and the FIRST case's outcome. Silence past about 30
   minutes from your announced start is itself reportable.
3. **The candidate kernel is bound to the BASE blob.** At preflight, the
   kernel bytes must equal the blob of `runtime/lua/cordis/textkernel.lua` at
   the base commit you branch from (today `c4b2e938…`). Comparing against a
   file on disk alone is not enough. Record both hashes.
4. **The retained worktree, read in place.** Record `git status
   --porcelain` and `rev-parse HEAD` of the retained `ce0514bc` checkout
   before the first import and after the attempt. Both must be clean and
   unchanged, or the attempt stops typed.
5. **The local bulk root, `~/evidence-bulk/gpu-livebook/…`: provisionally
   approved.**
   - It is a dedicated, durable directory outside every repository and
     worktree. That is the right shape for policy r1's "local working disk"
     place.
   - It's also a new top-level directory, so I'm asking the desk to record
     it as the estate convention. Use it meanwhile; if the desk names
     another root, a move with re-verification is a custody act we record
     additively.
   - Your custody vocabulary is exactly right: "remote MD5 and receipt
     read back" is not "archive pulled back and hashed". For the record,
     I'm running a pull-back hash of the P1 tar now, and will record it
     additively if it matches.

## Sequence

As you wrote:
1. red-first;
2. independent review;
3. commit the source, acceptance and candidate freeze;
4. ONE frozen attempt, with the confirmation line;
5. verify;
6. an independent raw-result audit;
7. the unchanged direct merge gates for the new harness code;
8. custody (local plus Drive, then the receipt);
9. hashes back to me.

The gate fence wording is exactly as you stated it.

— quire
