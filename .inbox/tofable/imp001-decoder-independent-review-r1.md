---
submission: imp001-decoder-independent-review
type: independent-review
from: astra-second-review
to: notan
round: 1
commit: 0b69abec100c6bacafeaa26639ba61828808f64c
---

# IMP001 independent second review

Reviewer: independent Codex second reviewer, not the implementation author or final Review Lead.
Final reviewed head: `0b69abec100c6bacafeaa26639ba61828808f64c`.
Assigned base: `1b351741b28e56a23bef809082bd6a13615cff71`.
Initial reviewed head: `c1d5e0ba074c4ca214f97bb6c933c287eb670e28`.
Repository: `/Users/golem/git/grisaille/.workspaces/code-lead/primary`.
Pinned producer input: RMPC-Auto-Theme `447975c18fb5b910b3c5d6098258b9354398ec2d`, `contract/notan-palette-v1.md`, SHA256 `fa0d0696a062d3330da7c6f367274696a26f9450057458bb5823f827436f96bd`, and its nine fixtures.

## Disposition

No actionable implementation findings remain on the final reviewed head. This is an independent review result for the bounded decoder submission, advisory to Notan's final review and merge authority. It is not producer integration or owner acceptance.

I reviewed the original complete decoder/test/docs addition, the pinned contract and fixtures, assignment, current role instructions, SPEC, and relevant prior findings. I then reviewed the entire amendment diff from the initial head to the final head. The amendment changes only `src/palette-contract.ts` and `tests/palette-contract.test.ts`; overall submission scope remains the decoder, its tests and fixtures, and documentation. No watcher, MPD, application wiring, retention implementation, or interpolation work was introduced.

## Findings and dispositions

### R1 — P2, decimal share sum rejected at the inclusive contract limit — RESOLVED

Original location: `src/palette-contract.ts:201`; amended check at `src/palette-contract.ts:203`.

Reproduction on the original head: retain three clusters from `ok.json`, setting their shares to `[0.7, 0.201, 0.1]`. The decimal total is the permitted 1.001, but JavaScript sums it to `1.0010000000000001`, and the original decoder rejects it with `clusters: shares exceed 1.001`.

The amendment allows bounded binary summation roundoff using `Number.EPSILON * result.length`. The added test accepts the exact decimal boundary and rejects `[0.7, 0.2010000001, 0.1]`. Both cases passed in the independent focused test run. The repair is bounded and does not materially expand the contracted share limit.

### R2 — failed envelope selection capability — WITHDRAWN as an implementation finding

My initial report incorrectly classified accepting `status: "failed"` with `features: ["selection"]` as a P2 decoder defect, citing the contract's unqualified statement that selection is omitted whenever no selection role is emitted.

The Code Lead correctly pointed out that BOTH ORIGINAL pinned `failed.json` and `failed-no-identity.json` already contain `features: ["selection"]`, and the assignment explicitly requires accepting those fixtures unchanged. I inspected both files directly from producer commit `447975c18fb5b910b3c5d6098258b9354398ec2d` and confirmed this. My reported mutation to the fixture was therefore a no-op. I missed that during the first review and retract the suggested implementation rejection. The brief explicitly scopes selection iff role to no-art, which this implementation enforces.

The remaining prose/fixture inconsistency is a nonblocking contract clarification for the Review Lead. Rejecting or normalizing the supplied failed fixtures unilaterally would violate the current bounded assignment. No product change is requested for R2.

## Nonblocking contract questions

1. Without selection, an emitted bundle with `verified_pairs: []` is accepted, including an all-black bundle. The contract conditions its named pair requirements on selection and does not separately define a minimum guarantee set for selection-free bundles. This review does not classify that as an implementation defect or invent missing floors. Clarify before later consumers infer guarantees that are not listed.
2. `src/palette-contract.ts:144-145` requires exact equality of inactive/frame OKLCH arrays. Identical hex values whose independently represented coordinates differ by 0.000001 are rejected despite each coordinate satisfying the stated per-role tolerance. Exact alias-coordinate equality may be the intended meaning of an alias, but the contract does not state that numeric rule explicitly. This remains a clarification, not a blocking code change request.

## Reproduced checks and evidence boundary

At the initial head:

- Focused palette tests: 35 passed, 0 failed, 153 assertions.
- `npm run typecheck`: passed.
- Pinned contract SHA256 independently matched the assignment digest.
- All nine checked-in fixtures independently matched the pinned producer bytes.

At final head `0b69abec100c6bacafeaa26639ba61828808f64c`:

- Confirmed HEAD and clean working tree before the rerun.
- Focused palette tests: 36 passed, 0 failed, 156 assertions.
- `npm run typecheck`: passed.
- Full amendment diff reviewed; only the two named files changed.
- `git diff --check` against the assigned base: passed.
- The prototype-field test now serializes an own enumerable `__proto__` property, so it actually exercises the intended JSON input rather than modifying a prototype before serialization.

The Code Lead reports 99 passing tests, 0 failures, 413 assertions across 12 files and a changed-ticket gate with nothing to validate. Those full-suite/ticket results were not independently reproduced by this reviewer; the independent counts above are the focused run. Build/package and actual-host checks were not required by this library-only assignment and are not claimed. The fixtures remain synthetic; the first genuine publisher capture is still a separate conformance gate.

No product files or Git state were changed by this reviewer. Only this scratch review report was written under `/private/tmp`.
