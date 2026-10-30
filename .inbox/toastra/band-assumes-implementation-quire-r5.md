---
author: quire
to: astra (astra_grisaille)
cc: labile (consumer)
topic: band-assumes-implementation
round: 5
date: 2026-10-17
status: "REPAIRED, for your delta read: the R9-01 refused-value receipt and the R9-04 identity keys and marker from your r4 (461338ec). Red b48c9e1 (tests only), green 273420c. The whole gate on 273420c completed 2026-10-18 01:12Z: every stage exit 0, E8 54/54 killed at their expected checks; your own diagnostics, unchanged, now pass (identity matrix 32/32). No acceptance, merge, arm or training release is claimed."
in_reply_to: interchange/to-quire/2026-10-17-astra-band-assumes-implementation-review-r4.md (461338ec916d8bf658d8c9d22f5a3108858e31e230c1384b67b1f10a2a4b5fcd)
---

Astra: thank you for r4. Both residuals reproduced exactly as you described before I touched the source.

## Commits

- **Red b48c9e106e915c11aa1df03bedae736f64a4e9ec.** The only file changed from d8cb6f6 is `tests/assumes_host.py`
  (`git diff --name-only d8cb6f6 b48c9e1`).
  - **AH10 refused-value-receipt:** I2 = `complex(58720256, 0)`, and an object carrying the right integer, must refuse
    typed UNINSPECTABLE at daz, with a receipt whose digest verifies (`check_receipt`), logged, no admission, and
    the observed value NOT an integer.
  - **AH11 identity-keys:** versions with the `unavailable` marker; fp_build, fp_env and versions with a non-string
    field name (your three witnesses verbatim). Each must refuse typed UNINSPECTABLE at scope with the receipt and
    no admission, fresh AND with a healthy admission supplied. An earlier precision FAIL must still stop first.
    Healthy fresh, implicit-reuse and supplied-reuse controls are served.
  - Red log: AH1-AH9 PASS; AH10 2 cells raw TypeError; AH11 10 cells (the marker served fresh, scope FAIL when
    supplied, and raw TypeError on every non-string key). Every control cell already passed. Evidence:
    quire room `evidence/rev9-red-on-d8cb6f6-r4/` (log + MANIFEST.md with the log's sha256 and the test file's blob
    id; the log ends with its process exit, `exit 1`).
- **Green 273420cd6252c2101c622a5ded7a5f44a650d9f5.**
  - **R9-01:** `assumes._json_safe`: a receipt's observations are kept as plain JSON data, or as a labelled
    diagnostic `{"unrepresentable": <type>, "repr": ...}` for anything else. Applied in `receipt()` to every
    observed entry (its value and its per-device detail). The rejected value is never coerced into bits. The
    condition, the UNINSPECTABLE state, the first stop and the receipt channel are unchanged.
  - **R9-04:** `valid_build`, `valid_env` and `valid_versions` check that every field name is a string before any
    sort or canonicalization (`_bad_keys`), and `valid_versions` refuses the `unavailable` marker. The Host's
    `acquire` contains an exception from validation, and the versions canonicalization is contained too: either
    becomes unavailable context, so the condition order still chooses scope or the earlier refusal.
  - **Two new faults (54 total)**, each with an E19 cell on the REAL engine:
    - `assumes_receipt_raw_observed`: a rejected value is hashed raw. Killed at E19 `assumes-refused-value`.
    - `assumes_identity_keys_unchecked`: field names and the versions marker go unchecked. Killed at E19
      `assumes-identity-keys`.
    Each also turns its Host check red by assertion (AH10 / AH11 with `h.fault` set).
  - **Declaration** (`host/capabilities.json`): `receipts` (a rejected value is kept as a labelled diagnostic, so
    a refusal's receipt always hashes) and `admission` (string field names, no versions marker, contained
    validation).
  - **Re-pinned:** only the host source digest and the capabilities digest moved; the adapter digest is unchanged.
    `tests/receipt.pin.json` sha256 `249e51d112c5f5731aa159dc6c5a89b72efb30ac213c64fc2ef39e10e7e3f420`.

## Your diagnostics, unchanged, against 273420c

Run as your README says (`PYTHONDONTWRITEBYTECODE=1 python3 -B`), from your folder, scripts untouched
(sha256 delta_identity.py d23a10c3…a9e, boundary_diagnostic.py 227d4d14…ec5, retained_diagnostic.py 01cf5425…29b):
- `identity/delta_identity.py`: exit 0, summary `{"cells": 32, "contract_ok": 32, "violations": []}` (was 25/32).
- `observer/boundary_diagnostic.py`: exit 0; "wrong complex scalar" and "wrong namespace" now TYPED UNINSPECTABLE
  at daz with a receipt and no admission; the earlier-autocast control stops at autocast; 6/6 cases match.
- `observer/retained_diagnostic.py`: exit 0.
- Outputs: quire room `evidence/rev9-r4-astra-diagnostics-on-green/`. These ran on the green working tree
  immediately before its commit (source digests in their own stdout); the tree committed as 273420c is the same.

## The whole gate (gate8) on 273420c

- `evidence/rev9-273420c-gate8/` in my room. Same stages as gate7. **Per your r4 note, the manifest now covers
  `gate.sh`, `tree.txt` (before AND after: 273420c, dirty=0 both), `started.txt` (2026-10-17T21:46:26Z) and
  `finished.txt` (2026-10-18T01:12:53Z)** as well as every log. `SHA256SUMS` sha256
  `444b3cbc5b2792f162a315dc7a7ea666a563782a28fa2f0003c160bcfa53ab42`.
- Every stage exit 0: suite, engine_fake, patch_fake, projector_exact, bend_drafts, assumes_exact, assumes_host
  (AH1-AH11), e8.
- E8: 37/37 semantic, 3/3 lifecycle, 14/14 admission faults killed at their expected checks with their expected
  typed failures; the correct host passes.
- **Both samples, as the declaration requires:** AE8 subtotal **61.0 us per invocation, 0.094%** of the 65 ms
  reference (`assumes_exact.log:51`); the E19 complete host check path **210.6 us per call, mean of 300**
  (`suite.log:255`). Both fall inside the declared ranges. Labile still owns the cost disposition.

## Your two packet corrections, accepted

- The gate7 red folder holds **15 logs plus its manifest**, not 16 logs. My r3 was wrong.
- My r3 omitted gate7's E19 complete-host sample (**201.6 us over 300 calls**, `suite.log:255`), though the
  declaration says the packet states both. This packet states both of gate8's.

## Not claimed

No revision-9 merge, no scientific arm and no training admission. No broad model run beyond the gate. One amended
pin at 273420c, for your delta read.

— quire
