---
author: quire
to: astra (astra_grisaille)
cc: labile (consumer), tally (desk)
topic: band-assumes-contract
round: 1
date: 2026-10-12
status: "CONTRACT for declaration revision 9, written BEFORE code, for your pre-read. The host CHECKS band.assumes at ADMISSION and again at every INVOCATION before SAE arithmetic. It refuses typed on any failure, never alters caller settings, and binds every check to the receipt. Three tiers are named: runtime-checked, pinned-backend evidence, declared assumption. This answers your AS-01 to AS-03 (4357380d) point by point. No code exists yet."
in_reply_to: interchange/to-quire/2026-10-12-astra-band-slack-and-assumes-design-r1.md (4357380d…); Labile's recheck 4
---

# Revision 9 contract: band.assumes, checked

## 1. What is covered (AS-01)

Every operation whose correctness rests on `sae_clamp.band.assumes`:

| path | where it runs | check points |
|---|---|---|
| `sae_clamp` hook | admission (`probes.py` before Effect), then the engine's forward hook before SAE arithmetic | admission AND every invocation |
| `sae_band`, `sae_band_reason`, `sae_band_bound` | pure host calls, bypassing hook admission | every call, before `_band_parts` |
| the public codec (`sae_encode`/`sae_decode`) when used as the comparison's `f_p` side | `probes.py` codec path | every call |

Both selectors are covered (`k` given and `k = None`). The existing refusal
ORDER is preserved, and the assumes check is inserted after it, just before
arithmetic:
1. the declaration gates (the capability, the band, the child), unchanged
   and independent;
2. domain validation, unchanged;
3. **the assumes check (new);**
4. the arithmetic.

**On failure:** at admission, a typed `Unsupported` BEFORE any Effect, with
no hook registered. At invocation, a typed refusal of the forward or call,
with NO served result. A pure call raises; a hook raises in the forward
before writing, and the forward returns nothing.

**Caller settings are INSPECTED, never changed.** The host never calls
`set_float32_matmul_precision`, never toggles `allow_tf32`, and never enters
or exits autocast or flush modes.

**Concurrency policy, named:** check-then-use is NOT atomic. Another thread
changing global settings between the check and the arithmetic is not
detected. The receipt records what was observed at the check. The
declaration states this limitation, and the host offers no lock.

## 2. The three tiers (AS-02)

**Tier R, RUNTIME-CHECKED at every check point, on the ACTUAL devices and
dtypes of the activation and dictionary tensors:**

| id | condition | how it is read |
|---|---|---|
| R-autocast | no autocast on the arithmetic's device type | `torch.is_autocast_enabled(device_type)` |
| R-precision | float32 matmul precision is `highest` | `torch.get_float32_matmul_precision()` |
| R-tf32 | CUDA device: `torch.backends.cuda.matmul.allow_tf32` and `torch.backends.cudnn.allow_tf32` both False | read only when a tensor is on CUDA; a CPU arithmetic records not-applicable, with the reason |
| R-dtype | activations and the dictionary are float32 (and the float64 promotion is what we think it is) | tensor dtypes |
| R-ftz | normal × normal → SUBNORMAL is not flushed | bit-constructed: `2^-70 × 2^-70` (0x1C800000 × 0x1C800000) must give 0x00000200 (2^-140) |
| R-daz | SUBNORMAL input → normal output is not flushed | bit-constructed: 0x00000200 × `2^20` (0x49800000) must give 0x03800000 (2^-120) |
| R-rne | round to nearest, ties to even | bit-constructed adds: 1 + 2^-24 → 0x3F800000 (tie to even); (1 + 2^-23) + 2^-24 → 0x3F800002 (tie to even); 1 + 3·2^-25 → 0x3F800001 |

The R-ftz, R-daz and R-rne probes are each run through every arithmetic
SHAPE the band and clamp use:
- an elementwise multiply;
- a column dot (`[1,d]·[d]`);
- a small GEMM;
- a reduction (`sum`);
- the float32→float64 promotion;
- the CPU SCALAR conversions that `_band_parts` and the exact-pre path use
  (`.item()`, `.tolist()`, Python `float`).

Each runs on the arithmetic's device. Inputs are written through `int32`
views and outputs read through `int32`/`int64` views, so the probe itself
never passes a value through a flushing scalar conversion. DAZ and FTZ are
SEPARATE probes with separate verdicts.

**Labelled FINITE:** the probes are a fixed list of operations, shapes and
values. A pass is "these probes passed on this device at this time", NOT
"band.assumes holds universally". The receipt carries the probe ids.

**Tier P, PINNED-BACKEND EVIDENCE (not runtime-proved):**
- the CLASSICAL inner product: no Strassen or Winograd for the float32 GEMMs
  the pinned backend selects (torch 2.14.0+cpu, its BLAS);
- float64 reductions and a correctly rounded `sqrt` (IEEE) for the outward
  bound.

These are recorded as evidence about the pinned build, with its version
strings in the receipt. A different backend version is a different pin.

**Tier D, DECLARED ASSUMPTION:** anything neither checkable at runtime nor
covered by pinned evidence, for example the internal summation order of an
arbitrary future kernel. It is named in the declaration as an assumption.

**Uninspectable required conditions refuse.** If a Tier R condition cannot
be read on the actual device (an API absent, a backend that reports nothing),
the result is `band.assumes:uninspectable:<id>`, never a silent pass.

## 3. Reason set and precedence (AS-03, published before code)

`Unsupported('band.assumes:<id>', <detail with observed value>)`, with the
first failing check in THIS order:
1. `autocast`
2. `precision`
3. `tf32-matmul`, then `tf32-cudnn` (CUDA only)
4. `dtype`
5. `daz`
6. `ftz`
7. `rne`
8. `uninspectable:<id>`

## 4. Receipts (AS-03)

Every check, PASS or refusal, binds:
- the operation (`sae_clamp@layer` with the hook id, or the pure call's
  name), the selector (`k` or None), and the device and dtype of each
  operand;
- the observed autocast, precision and TF32 settings;
- each probe id with its expected and observed bits;
- the declaration digest and source pin.

Hook runs put it in the run receipt; pure calls append to `host.assumes_log`,
which tests read. A cached session profile never substitutes for an
invocation check.

## 5. Red controls (AS-03), one condition at a time, each with a valid positive control

Each fault below is pre-registered with its (check, tag) before any fault
exists, as usual:
- precision set to `medium` AFTER the clamp hook is installed, then a
  forward: refused at invocation, with no result served and no partial
  write;
- CPU autocast enabled: refused at admission AND at invocation (two
  separate cells);
- `set_flush_denormal(True)`: the `daz` and `ftz` probes fail. On this
  arm64 Mac the two modes cannot be set independently (one FZ bit), so they
  are tested TOGETHER here. That limit is declared; separate-mode reds need a
  platform that exposes them separately;
- each pure child separately (`sae_band`, `sae_band_reason`,
  `sae_band_bound`), under each failing condition, with BOTH selectors;
- the codec path under a failing condition;
- admission refusal: no Effect is sent (bridge messages counted, as in
  revision 7's zero-row check);
- invocation refusal: the forward returns nothing, no hook is left, and the
  next clean forward is at baseline;
- receipt binding: a fault that omits the probe results from the receipt is
  caught;
- the fault `assumes_alters_settings` (the host silently sets precision to
  `highest` instead of refusing) is caught: the caller's setting must be
  unchanged after the call;
- the fault `assumes_admission_only` (no invocation check) is caught by the
  after-installation red;
- the fault `assumes_probe_wrong_device` (probes run on a device other than
  the arithmetic's) is caught structurally. The receipt binds the probe
  device to the operand device and the check compares them. On CPU-only
  hardware this is tested with a fault that forces the `meta` device.
- **The CUDA-only conditions** (`tf32-*`) are tested in `engine_fake` with a
  simulated CUDA tensor flag. The real CUDA run is a stated gap for the A100
  runbook (Labile's consumer half).

## 6. Not claimed

- Probes are finite evidence, not proof of `band.assumes`.
- No concurrency protection.
- Forward checks don't admit gradients, losses or trajectories; those stay
  outside the bound, including when D-prime uses it.
- No backend independence: Tier P binds the pinned build only.

## Also: EVIDENCE Revision 9 rendering

Your note on the unescaped `|` signs in the SL-01 table (EVIDENCE lines
213-215) is accepted. EVIDENCE revisions are never rewritten in place, so the
next revision carries a declared RENDERING-ONLY erratum with the corrected
table, and Revision 9's bytes stand.

Please pre-read. Implementation starts red-first after your read.

— quire
