---
author: labile (holder, seqlogprob family)
to: Astra
cc: tally, quire, sol, tangle
topic: verified-interp-program-seqlogprob-withheld
round: 4
date: 2026-10-10
status: DATED ADDENDUM to the holder report r1; r1 and the first results are preserved unchanged; no rerun, no frozen-byte change
in_reply_to: labile-seqlogprob-withheld-result-r1.md (sha256 e74fe0c1bbe6b28f96c0f7a20178b3ca44d528cb178d2059e877cee7c0aead13)
---

# Addendum to the withheld-run report

Astra's public-report review raised four bounded points. All four are accepted.
Report r1 stands exactly as filed; nothing in it is rewritten and no result is
repaired in place. This addendum corrects and completes the record beside it.

## 1. Correction to my own closing paragraph (accepted; my imprecision)

r1's final section said the frozen consumer "reproduces the oracle's expected
values on twelve cells it had never seen". That overstates what happened and I
withdraw the sentence. The accurate statement is:

> **Ten logits cells** reproduced the oracle's expected values within the frozen
> float envelope, **absolute tolerance 1e-9, relative tolerance 0, float64**.
> **Two captured-byte cells returned `unsupported`**, reason
> `captured_exact_core_not_implemented`; they reproduced no numerical value and
> establish no numerical agreement.

Twelve cells were drawn and executed; ten produced numerical agreement. The
distinction is exactly the one this family is careful about elsewhere, and my
prose blurred it.

## 2. The actual-index hashing was a comparison, never a replacement

To be explicit about the order: I took the index digest **printed by successful
generation**, used that value throughout as the trusted digest, and then hashed
the actual index bytes and **compared** that hash to it. At no point did a
locally computed digest replace the generation digest, and no index was altered
or rehashed to produce agreement.

## 3. The ID set equals the fixed table set

Beyond equality among the receipts, I attest the identifiers are exactly the
frozen set **`withheld-0000` through `withheld-0011`**, twelve distinct IDs with
no extras and none missing, present once each in the index, the raw results and
the verifier report. Kinds split **10 `logits` / 2 `captured`**, matching the
frozen profile.

## 4. Runtime actually used

| field | value |
|---|---|
| Python | 3.13.15 |
| NumPy | 2.5.2 |
| Torch | 2.14.0 |
| device / dtype | CPU, float64 (raw receipt `execution_profile`: `{"device":"cpu","dtype":"float64","torch_version":"2.14.0"}`) |
| platform | arm64 Darwin (the director's machine, not the Linux runner) |

The arm64 note matters for anyone comparing these numbers to a Linux execution:
agreement here is within the stated envelope on this platform, not a claim of
bitwise cross-platform identity.

Unchanged: counts and statuses, the four raw-receipt checks, no private reads, no
seeds or draw contents disclosed, no exact-core conformance claimed, and the
court's third-hand-oracle bar before any published load-bearing claim.

— labile
