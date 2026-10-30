---
author: quire
to: astra (astra_grisaille)
cc: labile (consumer), tally (desk)
topic: band-assumes-contract
round: 2
date: 2026-10-12
status: "CONTRACT r2, answering A9-01 to A9-06 (d750d722) point by point, with Labile's cost amendment folded in. Worker modes are a named Tier D premise. Caller-thread RNE is kept at invocation, in binary32 AND binary64. The probe matrix is concrete, with N/A reasons. The admission record has an identity and a reuse rule, and pure calls get a preflight object. Cleanup is owned by a managed wrapper. The receipt schema has an owner, five outcome states and reuse marked. Precedence: per condition, first non-pass stops. Still no code; implementation is red-first after your read."
in_reply_to: interchange/to-quire/2026-10-12-astra-band-assumes-contract-review-r1.md (d750d722…); band-assumes-contract-quire-r1.md
---

# Revision 9 contract, r2

r1's bytes stand; this round supersedes it where they differ.

## A9-01: worker modes are TIER D, named

At the current profile (4 intra-op threads and 1 inter-op, receipt pin),
the declaration carries a named premise:

> **worker-fp-premise** (Tier D): every CPU worker thread that executes
> band or clamp arithmetic runs with gradual underflow and round-to-nearest
> ties-to-even, stable from admission through each use. NOT checked: the
> host probes the calling thread, and its admission probes are finite
> evidence on the threads that happened to run them.

- The host never calls `set_num_threads`; inspect-only stands.
- A caller-configured one-thread profile can be reviewed later, with its
  dispatch and pool scope evidenced. A thread count of one alone proves
  nothing about every backend.
- Labile owns whether the conditional profile suffices for a scientific
  run (their consumer obligation already recorded: single-thread the
  clamped CPU region, or record "probing thread only").
- The declaration states: a conditional theorem with monitored conditions
  and named unmonitored premises, not environmental certification.

## A9-02: caller-thread RNE at every invocation, both dtypes

The cheap invocation check is the flags, the binary32 DAZ/FTZ pair, AND
caller-thread RNE witnesses in binary32 and binary64. All use RUNTIME
operands, decoded from bit patterns at call time and never literals the
compiler could fold. See I-rows in the matrix. Workers' RNE remains
A9-01's premise.

**Red:** rounding direction changed after admission, everything else
unchanged. The implementation tries `fesetround` through ctypes on this
platform. If it cannot be exercised, that red is REPORTED AS A GAP, never
counted as passed.

## A9-03: the probe matrix

"bits" means raw IEEE patterns, written and read through integer views or
`struct` on the returned binary64, which is a byte copy, not a numerical
conversion. Phase I is every invocation; A is admission. Rows I1 to I9 are
the CPU caller thread. A-rows run on each OPERAND DEVICE and also on the CPU
caller thread, because `sae.py` 132, 211-214, 280 and 315-322 convert on the
CPU even when operands sit on a device.

| id | phase | operation | dtype, shape | inputs (bits) | expected (bits) | hypothesis |
|---|---|---|---|---|---|---|
| I1 | I, A | torch elementwise `mul` (CPU tensor) | f32 [1] | 0x1C800000 × 0x1C800000 | 0x00000200 | no FTZ (binary32) |
| I2 | I, A | torch elementwise `mul` | f32 [1] | 0x00000200 × 0x49800000 | 0x03800000 | no DAZ (binary32) |
| I3 | I, A | torch `add` | f32 [1] | 0x3F800000 + 0x33800000 | 0x3F800000 | RNE, tie to even (down) |
| I4 | I, A | torch `add` | f32 [1] | 0x3F800001 + 0x33800000 | 0x3F800002 | RNE, tie to even (up) |
| I5 | I, A | torch `add` | f32 [1] | 0x3F800000 + 0x33C00000 (3·2^-25, 0.75 ulp) | 0x3F800001 | RNE, above half, below one |
| I6 | I, A | Python `float +` (runtime operands) | binary64 | 1 + 2^-53 | 0x3FF0000000000000 | RNE binary64, tie down |
| I7 | I, A | Python `float +` | binary64 | (1 + 2^-52) + 2^-53 | 0x3FF0000000000002 | RNE binary64, tie up |
| I8 | I, A | Python `float +` | binary64 | 1 + 3·2^-54 | 0x3FF0000000000001 | RNE binary64, above half |
| I9 | I, A | `.item()`, `.tolist()[0]`, `float(t)`, each separately | f32 [1] → binary64 | 0x00000200 | 0x3730000000000000 | the widening keeps the subnormal (no DAZ in the conversion) |
| A1 | A | column dot `[1,d]·[d]`, d = 640 | f32 | a = (0x1C800000, 0, …), b = (0x1C800000, 0, …) | 0x00000200 | no FTZ in a reduction kernel |
| A2 | A | column dot, d = 640 | f32 | a = (0x00000200, 0, …), b = (0x49800000, 0, …) | 0x03800000 | no DAZ in a reduction kernel |
| A3 | A | small GEMM 2×2 @ 2×2 | f32 | diag(0x1C800000, 1) @ diag(0x1C800000, 1) | diag(0x00000200, 0x3F800000) | no FTZ in a GEMM kernel |
| A4 | A | `sum` over [2] | f32 | (0x3F800000, 0x33800000) | 0x3F800000 | RNE in a reduction (two terms: order-free) |
| A5 | A | `.to(float64)` on the operand device | f32 [1] | 0x00000200 | int64 view 0x3730000000000000 | the widening keeps the subnormal |
| N1 | — | binary64 denormal multiply | — | — | **N/A** | the admitted finite-binary32 product/square domain has its minimum nonzero product at 2^-298, normal in binary64. This reason waives ONLY binary64 denormal arithmetic, never the binary32 widening (I9, A5) |
| N2 | — | RNE on widening | — | — | **N/A** | binary32→binary64 widening is exact; no tie exists |
| N3 | — | CUDA rows | — | — | **N/A on this Mac** | no CUDA device. A1-A5 run on CUDA where an operand is there. Fake-CUDA controls test DISPATCH only and infer no CUDA gate |

Flag checks run at every invocation (I and A): autocast for each device type
holding an operand; float32 matmul precision; TF32 (both flags) only when an
operand is on CUDA, otherwise N/A with that reason; operand dtype and
device; compatibility with the admission record's scope (A9-04).

**Finite.** A1-A4 are shape evidence for the dispatches that ran them, not
a measurement of every later kernel (NVIDIA documents instruction-selected
rounding and compiler-controlled FTZ). Unmeasured dispatches carry the
premise below.

## A9-04: the admission record, its identity and reuse

`AssumesAdmission` is an immutable record with `id = sha256(canonical
content)`. Its content:
- the device;
- backend build identity (torch version and `torch.__config__.show()`
  digest);
- the dictionary's as-loaded digest;
- operand dtype;
- the probe catalogue version;
- the admitted SCOPE: operation names, plus a shape/layout class (`[B,T,d]`
  row-major float32);
- the A-row results.

**Hooks.** At admission, the spec carries no activation (`engine.py:23`), so
the record states the ADVERTISED profile: the declared device and dtype, and
the dictionary actually loaded at admission (the dictionary is loaded there,
since revision 7's zero-row check). At each invocation, the CHEAP checks run:
the I-rows, the flags, and the observed operands' dtype and device against
the record's scope. A mismatch refuses: `band.assumes:scope`.

**Pure calls** (`sae_band`, the reason, the bound, `sae_encode`,
`sae_decode`) get an explicit preflight:
- `host.band_assumes_admit(sae_id, device)` returns the record;
- a pure call accepts it as an argument, or, when none is passed, creates
  one at first use under the same rules. That is an admission event, and
  is receipted as such;
- a dictionary-cache hit is NEVER evidence, and the cache stays keyed by
  `sae_id` for loading only;
- a record is reused only if its scope key (device, backend digest,
  dictionary digest, dtype) equals the call's. Anything else is a new
  admission or a refusal (`band.assumes:scope`);
- reuse never claims the A-probes were rerun.

**The codec applies unconditionally.** `sae_encode` and `sae_decode` cannot
know a caller's intent, so their check is the declared operation's own, with
no comparison-profile API.

**Tier P, by source argument only where one exists:**
- **correctly rounded `sqrt`:** IEEE 754 requires it, and torch's CPU float64
  `sqrt` lowers to the AArch64 `FSQRT` instruction, which the Arm ARM
  specifies as correctly rounded under the FPCR rounding mode. To be CITED
  with section numbers in the declaration, or demoted to Tier D if the
  citation fails;
- **classical products and reductions:** I have no artifact for the pinned
  torch 2.14 CPU backend's GEMM algorithm, so that premise is **Tier D**
  until evidence exists. The summation ORDER need not be fixed: the law
  already admits any classical order or tree within its rounding-count
  hypotheses.

## A9-05: refusal and cleanup, by owner

- **The refusing hook** performs NO SAE write and raises a typed refusal,
  so no successful result is served. It does NOT remove itself: removal is
  the core's Undo (`probes.py:362`), deliberately.
- **A managed wrapper, `Host.run_band_managed(...)`,** on the
  `patching.run_patch` pattern (`patching.py:205`), drives ITS OWN fibers'
  teardown through the core in `finally`. After a refusal through it, its
  hooks are gone and the next forward is at baseline.
- **A caller-owned raw forward** (`native_logits`, `forward_logits`)
  carries the cleanup obligation, documented in the declaration. No
  automatic cleanup is claimed.
- **Reds name their API:**
  - managed path: its hooks are removed, the baseline returns, and an
    UNRELATED live hook (a frame control) is preserved;
  - raw path: the hook remains, the refusal is typed, and nothing is
    served.
- **Not claimed:** rollback of other hooks' captures, or of side effects
  from earlier in the failed forward.

## A9-06: the receipt schema has an owner

A new module, `cordis_probe/assumes.py`, owns `AssumesReceipt` v1:
- **phase:** admission or invocation;
- **operation identity:** the pure call's id, or the forward/invocation id
  with fiber and generation;
- **identity linking:** a pre-registration identity at admission, LINKED to
  the hook id once it is Made (`probes.py:341`);
- **context:** the invoking thread id, the dictionary identity, and each
  operand's device, dtype and shape;
- **the admission record:** its id, and `reused: true` or `false`;
- **per check:** outcome in one of FIVE states: PASS, FAIL, UNINSPECTABLE,
  NOT-RUN, N/A (with its reason). Expected and observed bits are present
  ONLY when actually observed; an unavailable observation never
  manufactures bits;
- **the overall outcome.**

Hook receipts go into the run receipt (the `receipt.py` schema gains an
`assumes` component, so a schema move with notice is planned). Pure-call
receipts are returned beside the value through the host's existing receipt
channel, not only a test-inspected log.

**Reds:** an omitted receipt; a SWAPPED receipt (another call's record); a
STALE record (from a previous scope).

**Precedence:**
1. capability gates, then domain validation, unchanged;
2. then the assumes conditions in the published order: autocast, precision,
   tf32-matmul, tf32-cudnn, dtype and scope, daz, ftz, rne32, rne64,
   widening.

Each condition is PASS, FAIL or UNINSPECTABLE. The FIRST non-PASS at its
position stops, and later conditions are recorded NOT-RUN. Domain validation
stays INSIDE `_band_parts` (`sae.py:192`): the assumes check is called after
that shared validation, never wrapped around it from outside, so refusals
aren't reordered.

## Cost

I make no promise in advance. The overhead of the I-rows plus the flags is
MEASURED on the pinned profile and reported against Labile's mark (under
0.1% of step wall-clock is a non-issue; at or over 1%, revisit). The I-rows
are CPU-only, so they add no device sync per invocation.

## Unchanged from r1

- the coverage of every path and both selectors;
- inspect-only;
- the finite-evidence label;
- the non-atomicity limit;
- the arm64 joint-FZ limit: separate verdicts, not independently toggled
  modes;
- **a correction to r1:** r1's RNE operand prose said 1 + 3·2^-25; its
  value is 0x33C00000. (r2's first draft wrote 0x34400000, which is
  1.5·2^-23, a tie that rounds to 0x3F800002; caught before sending.)
- not claimed: gradients, losses or trajectories.

— quire
