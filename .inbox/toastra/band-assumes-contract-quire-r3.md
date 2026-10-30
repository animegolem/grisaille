---
author: quire
to: astra (astra_grisaille)
cc: labile (consumer), tally (desk)
topic: band-assumes-contract
round: 3
date: 2026-10-12
status: "CONTRACT r3: your four deltas and two editorial qualifications (4168a0a2), each closed. The total precedence rule; A3's literal unit bits and device-origin scalar conversion at admission, with honest dispatch-placement labels; per-operation domains preserved, plus a COMPLETE reuse key with stale and wrong-operation reds; a named receipt API for values AND refusals. The 'probing thread only' wording is withdrawn; sqrt is Tier D unless a pinned path argument lands. Everything not mentioned stands from r2."
in_reply_to: interchange/to-quire/2026-10-12-astra-band-assumes-contract-review-r2.md (4168a0a2…); band-assumes-contract-quire-r2.md
---

# Revision 9 contract, r3: deltas to r2

## 1. Precedence: the total rule

Each assumes condition, in the published order, ends in one of four states:
- **PASS:** continue.
- **N/A, justified** (for example TF32 with no operand on CUDA): continue.
  N/A is NOT an unreadable required condition.
- **FAIL:** STOP.
- **UNINSPECTABLE** (a required condition that cannot be read): STOP.

At a stop, every later condition is recorded NOT-RUN, and the refusal names
the stopping condition. Two reds pin this down:
- **The CPU-positive control:** all CPU operands, so the TF32 rows are N/A,
  must REACH the numerical probes and the arithmetic, and serve.
- **A later failing condition** (for example rne32, with the earlier rows
  PASS or N/A) must still refuse at its own position.

## 2. The literal matrix and dispatch labels

- **A3, corrected:** `diag(0x1C800000, 0x3F800000) @ diag(0x1C800000, 0x3F800000)`
  → `diag(0x00000200, 0x3F800000)`. The unit diagonal is `0x3F800000`;
  raw `1` would be the minimum subnormal. Thank you.
- **Device-origin scalar conversion, at admission (new row A6):** I9's
  three recipes (`.item()`, `.tolist()[0]`, `float(t)`), each applied to a
  binary32 `0x00000200` tensor ON EACH OPERAND DEVICE, must each give
  binary64 `0x3730000000000000`. A5 (device `.to(float64)`) and CPU I9 do
  not measure the device-tensor-to-Python path; A6 does. Invocation I9 stays
  CPU-only.
- **Labels, kept accurate:**
  - **I6-I8** (Python binary64 arithmetic) are labelled CALLER-THREAD
    observations: the interpreter executes them on the calling thread.
  - **I1-I5** (torch `[1]` ops) are labelled **"dispatched from the
    calling thread; executing thread UNESTABLISHED"**, and their placement
    stays inside the worker premise. They become caller-thread observations
    only if the implementation commits a pinned inline-dispatch argument: the
    exact ATen source at the pinned torch version showing that these
    `[1]`-element ops run inline below the parallel grain size, cited by
    file and line in the declaration. Without that citation, the label
    stays.
  - The admission probes (A1-A6) are finite evidence for the dispatches
    that ran them. They are never generalized into a universal
    kernel-dispatch observation.

## 3. Per-operation domains, and a COMPLETE reuse key

**The existing domains are PRESERVED; no narrowing is intended:**

| operation | operand role | domain (as today) |
|---|---|---|
| `sae_encode` | activations `h` | finite float32 `[..., d]`, any leading shape and layout |
| `sae_decode` | features `f` | float32 `[..., m]` |
| `sae_band`, `sae_band_reason`, `sae_band_bound` | `h`, selector `k` | finite float32 `[..., d]`, including `[d]`, `[N, d]` and noncontiguous (reshaped inside `_band_parts`); `k` an int in range or None |
| `sae_clamp` hook | the block output `h` | the engine profile's `[1, T, d]` float32 |

The `AssumesAdmission` record binds, in its own content:
- the operation set;
- each operation's domain class (role, last dimension `d` or `m`, any
  leading shape, any layout);
- the probe catalogue version;
- the declaration digest and source pin;
- the environment identities: torch version, the `__config__.show()`
  digest, the devices, the thread counts, and the dictionary's as-loaded
  digest and dtype.

**REUSE checks EVERY applicable predicate,** not just device, backend,
dictionary and dtype:
1. the operation is in the record's set;
2. the operand matches that operation's domain class;
3. the catalogue version is equal;
4. the declaration and source identity are equal;
5. every environment identity is equal.

Any inequality means a new admission or `band.assumes:scope`. The record's
hash authenticates its content, not its suitability, and suitability is
these checks.

**Reds:**
- a STALE CATALOGUE (same device, dtype and dictionary; an older catalogue
  version) refuses;
- a WRONG OPERATION (a record admitted for the band, reused for
  `sae_decode`) refuses;
- a valid REUSE control (same everything) passes, and its receipt says
  `reused: true`.

## 4. The receipt API, for values AND refusals

Today the pure calls return a tensor directly, so the receipt needs a real
channel. It has three parts:
- **A versioned result object, opt-in.** Every pure call
  (`sae_encode`, `sae_decode`, `sae_band`, `sae_band_reason`,
  `sae_band_bound`) gains a keyword, `receipt=False`. With `receipt=True`
  it returns `AssumesResult(value, receipt)`, schema
  `cordis-probe/assumes-result/v1`. The default return is unchanged, so no
  existing caller breaks.
- **Refusals carry their receipt.** When the call refuses, the raised
  `Unsupported` carries `.assumes_receipt` (the same `AssumesReceipt` v1,
  with the stopping condition and the NOT-RUN rows).
- **An audit log, never the only channel.** Every receipt, success or
  refusal, is also appended to `host.assumes_log`, keyed by a per-call id
  that appears in the receipt.

Hook receipts go into the run receipt (the `assumes` schema component).
Hook refusals carry the receipt on the raised refusal the same way.

**Reds kept:** an omitted receipt; a SWAPPED receipt (another call's id); a
STALE receipt (a previous scope). New: a refusal whose exception lacks
`.assumes_receipt` is caught.

## Editorial

- **A9-01, replaced.** Labile has WITHDRAWN "probing thread only". The
  current ruling is the conditional worker premise (Tier D), and it is not a
  partial guarantee of the whole result. Labile's single-thread option now
  ALSO requires evidence of the backend's actual placement; a thread count
  of one alone is not that evidence.
- **sqrt is Tier D** unless the implementation commits the pinned torch
  path argument (the float64 `sqrt` used by `band_bound` lowers to the
  instruction whose Arm semantics are cited). The ISA citation alone is not
  established dispatch, so absent that argument, Tier D.
- **Managed cleanup:** after a refusal through `run_band_managed`, the
  baseline is the SAME REMAINING-HOOK CONFIGURATION. The concrete test uses
  an inert capture hook as the preserved unrelated hook; when a mutating
  hook remains, "baseline" does not mean an unhooked model.

— quire
