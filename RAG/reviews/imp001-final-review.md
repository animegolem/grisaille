# IMP001 final review — accepted and merged

Review Lead: notan. Reviewed: 2026-09-18 (UTC). Verdict: **accepted**.

- Submitted head: `0b69abec100c6bacafeaa26639ba61828808f64c` (imp/001, one
  atomic commit on assigned base `1b351741b28e56a23bef809082bd6a13615cff71`).
- Merge commit on main: `b313338`.
- Submission: `.relay/carrier/imp001-decoder-inbox-r1-67d954340b1c8559.md`,
  carrier event `67d954340b1c8559` exact-event ACKed.
- Independent second review (SPEC §12, separate from authorship and from this
  review): `.inbox/tofable/imp001-decoder-independent-review-r1.md` — reviewed
  both the initial head `c1d5e0b` and the full amendment diff to the final
  head; one P2 finding (share-sum roundoff) raised, fixed, and re-reviewed;
  one finding withdrawn against the pinned fixtures; no actionable findings
  remain.

## What this review verified independently

- Topology: exactly one commit past the pinned base; pure addition (1633
  insertions, 0 deletions); exactly the 12 declared files; canonical main's
  drift past the base (1b35174→6f93eaf) is RAG/correspondence only, ruled
  non-blocking at start.
- Fences: no runtime wiring — nothing in `src/` outside
  `src/palette-contract.ts` references the module; no watcher/MPD/scene/
  producer/SPEC edits; no ticket/index/ledger edits by the Code Lead.
- Pinned inputs: contract SHA256 `fa0d0696…96bd` reproduced from RMPC
  `447975c`; all nine fixtures byte-compared against the pinned producer
  commit — all match.
- Counts reproduced at the exact head AND on merged main: `npm run typecheck`
  PASS; `bun test` 99 pass / 0 fail / 413 assertions / 12 files;
  `validate-tickets.sh --changed origin/main` nothing to validate.
- Load-bearing spot-check: the share-sum repair bounds roundoff to
  `Number.EPSILON * clusters.length` above the contracted 1.001 — a float
  correction, not a limit expansion; boundary regression tests present.

## Contract rulings (the three preserved questions)

These rule interpretation for grisaille as consumer. The ratified contract
notan-palette/1 (digest-pinned) is not edited here; wording clarifications
are queued as producer-side addendum candidates for the RMPC court, which
Astra ratifies per the contract's own process.

1. **Failed-envelope `features` (R2).** On `status: "failed"` envelopes,
   `features` advertises the producer's capability set for the attempt and
   carries no emission guarantee; the selection-iff-role rule binds emitted
   bundles (and the no-art family per the brief). The pinned fixtures are
   normative — the decoder's acceptance of both failed fixtures unchanged is
   correct. Prose clarification queued; no fixture mutation authorized.
2. **Selection-free bundles.** `verified_pairs` is the complete guarantee
   set: an empty list means no pair guarantees, and consumers MUST NOT infer
   floors or named pairs that are not listed. The decoder validating every
   declared known pair and inventing nothing is correct. Whether the producer
   should guarantee a minimum set for selection-free bundles is a contract-
   revision question, deferred to the RMPC court; until ruled there, treat
   selection-free bundles as best-effort with only their declared guarantees.
3. **Inactive/frame alias equality.** Alias roles are copies of their source
   role's emitted values by construction; exact numeric equality is the
   intended check. Per-role tolerance governs derivation targets, not alias
   copies — a 0.000001 coordinate divergence on an alias indicates a producer
   defect worth rejecting, not a tolerance case. Decoder correct as
   implemented. Addendum candidate: state "alias roles carry byte-identical
   hex and OKLCH values" explicitly.

## Limits carried forward

- Fixtures remain synthetic; the first genuine publisher capture is a
  separate conformance gate (brief addendum 2d criteria + saturated cover).
- No build/package or actual-host claim was required or made.
- Full-suite counts were reproduced by this review; the independent reviewer
  reproduced the focused palette suite and typecheck — recorded as its stated
  evidence boundary, not a gap.
