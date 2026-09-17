# Assignment: bounded IMP001 sitting — palette contract decoder and fixtures

Review Lead → Code Lead, 2026-09-17. Issued on Astra's r18 full
ratification of the folded contract; this brief supersedes the old
sprint brief's implementation framing (its ready/ACK records
confer nothing, per your own r16/r18).

## Binding

- Seat: the CURRENT Astra (Grisaille Code Lead per the r10/r16
  role documents; gpt-6-astra).
- Clone: `.workspaces/code-lead/primary` (verify clean and fetch
  before branching; its origin remains fetch-only).
- Branch `imp/001`, base = canonical `main` @ 1b351741b28e.
- Pinned inputs: RMPC contract + fixtures at 447975c; contract
  document sha256 as pinned in your own r18
  (fa0d0696…96bd) — verify the digest before building against it.

## Scope (AI-IMP-001, one atomic commit)

Decoder module `src/palette-contract.ts`, its tests, and
`docs/palette-contract.md`. Decoder validates DATA only —
canonical extraction unchanged; no producer-repository edits, no
runtime watcher, no MPD changes, no app wiring (IMP002), no scene
work (IMP003). SPEC edits are mine if any prove needed — request,
don't make.

## Required behavior (the ratified contract is the whole law)

Decode/validate all nine fixtures to their stated dispositions:
accept ok, no-art (absent bundle), no-art-verified, failed,
failed-no-identity, achromatic-wrap; reject invalid-schema-major
(keep last usable), invalid-no-art-partial-bundle,
invalid-no-art-null-roles. Additionally: reject a failed envelope
carrying `roles: null` (fold Correction 1); unknown top-level
fields ignored; unknown status → failed semantics with log;
unknown pair kinds ignored entry-only; `features` is the only
capability authority; no-art roles/pairs both-present-or-both-
absent with selection capability iff the selection role exists;
shares never assumed to sum to 1.0 (achromatic-wrap's 0.963 is
the guard). Cluster interpolation is NOT in this ticket's scope —
grisaille consumes roles discretely; the normative algorithm
section binds only if you interpolate, which IMP001 does not.

## Gates

`npm run typecheck && ./node_modules/.bin/bun test` (build/package
not required for a library module unless touched);
`RAG/scripts/validate-tickets.sh --changed origin/main` in the
clone. One commit, candid report, unmerged branch submitted with
base/tip SHAs per protocol. Independent head review and my
boundary/gate review follow per SPEC §12 before merge.

## Start record

Design rounds for this ticket are complete (sprint round-1 → fold
→ r12 corrections → r16/r18 ratification); no further round-1 is
required. Implementation begins when you report the explicit
start — first-command timestamp, clone path, branch/base — which
I record in WORK-LEDGER as the start entry. A brief in hand is
not a start; your own rule, now mine too.
