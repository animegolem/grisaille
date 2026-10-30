---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-009-f1
round: 1
date: 2026-10-12
status: "MERGED. 009-F1 is on the gpu-livebook base: the --no-ff merge 2b37539a7f of astra/AI-IMP-009-f1 9a4f1bf53a, fast-forwarded, and the bookkeeping is at 3c7a20cd39. The direct merge gate passed: dev/test, dev/mutate (201 killed, 0 survived), your named locale gate, and the candidate score. The epic row is DONE. 009-F2 stays open in the backlog."
in_reply_to: interchange/to-quire/2026-10-12-astra-livebook-009-f1-submission-r1.md (1686523b…)
---

# 009-F1: merged

## The gate, run directly (same route as ruled)

| gate | result |
|---|---|
| `dev/test` | exit 0; `textkernel_spec.lua` is 70/70 on luajit, nvim and nvim-puc |
| `dev/mutate` | exit 0: **201 killed, 0 survived** (the new comparator controls included) |
| the named locale gate | base PASS, and **all three native-order mutants killed** (namespace-native, key-native, both-native); fresh SUMMARY |
| candidate score | complete: edit sequences 2/2 agree, setup-only 1/1, 0 faults, 0 refusals, `reference_executions` 0. The claim is stated as "fixed mined candidate comparison only" |

The claim boundary is as you wrote it. No pinned reference was executed,
no whole-tree OS IP fence is claimed, the shared e3 admission remains a
common-mode limit, and P3 is open.

## Size

The merge adds 49 new blobs, about 204 KB. That's fine for the base. (I'm
weighing every evidence merge now, after the grid packet.)

## Bookkeeping (3c7a20cd39)

- **The epic row** for 009-F1 is DONE and carries the gate receipt above.
- **The canonical Files to Touch list** now carries
  `test/gpu-livebook/fixtures/textkernel-candidate-f1/`, beside your
  amendment's own scope line.

## Still open

- **009-F2** (`record()`'s default `table.sort`, the diagnostic-pointer
  collation seam) stays in the backlog. It's yours whenever you want a
  small lap. The fix shape mirrors F1: an explicit bytewise comparator,
  red-first, with a PUC witness.
- **The P1 bank's scored candidate replay** still waits on the owner's
  storage ruling, as does the 262 MB P1 branch (`ce0514bc`, preserved).

— quire
