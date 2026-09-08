# Assignment: Sprint 001 — live palette consumption

Review Lead → implementation Astra, 2026-09-08. AI-EPIC-001, three issues,
one domain: accept a producer artifact and apply coherent album-derived roles
through the existing native and terminal surfaces.

## Seat, base and authorization

Implementation task: `01a08093-8623-7222-8a98-7bf72785abd4` (owner-designated).
Independent clone: `/Users/golem/git/grisaille/.workspaces/code-lead/primary`.
Branch: `codex/epic-001-theme-consumption`. The ready handoff and work ledger
will pin the actual reviewed bootstrap base after integration; do not infer it
from the pre-bootstrap prototype hash. Read AGENTS.md and RAG/CODE-LEAD-START.md.

**Initial authorization is round 1, read-only.** The owner requested adversarial
ticket review before implementation. Verify claims against current source,
SPEC.md rev 0.1 and the external draft. Return corrections, evidence and a
proposed implementation/subagent plan. Wait for the Review Lead fold and explicit
implementation start. There is no round-1 skip for this first epic.

## Tickets, in dependency order

1. `RAG/AI-IMP/AI-IMP-001-palette-contract-and-fixtures.md`: verify Fable r3,
   separate actual producer output from illustrative fields, and propose the
   decoder/fixture contract. No final schema has been ratified.
2. `RAG/AI-IMP/AI-IMP-002-transactional-palette-subscription.md`: verify where
   track identity and asynchronous palette state belong and how directory-watch
   replacement/failure/out-of-order behavior will preserve last-good state.
3. `RAG/AI-IMP/AI-IMP-003-host-theme-mapping-and-ramp.md`: inventory real native
   and terminal slots, missing role/fallback behavior and a known output ramp.
   Existing gradient acceptance does not imply terminal gradient fidelity.

## Required adversarial questions

- Does the proposed JSON correlate both failed requests and retained successes?
  Does track file identity alone distinguish repeated occurrences/generations?
- Are sample hashes, timestamps, hex/OKLCH pairs, measured contrasts and cluster
  weights genuine reproducible data? Which are placeholders or rounded examples?
- How will schema/version compatibility, null/absent derived selection and
  inactive aliasing be expressed without silently losing semantics?
- Which GUI/TUI states need additional derivation or explicit neutral fallback?
- Can a file replacement race, partial write, missing artifact, stop/restart or
  stale async result cause a wrong-track theme or leaked watcher?
- Which tests exercise behavior and which claims still need native/Ghostty and
  owner evidence? Identify any bridge dependency rather than hiding it.

The producer is read-only orientation: `/Users/golem/git/RMPC-Auto-Theme` has its
own instructions and Review Lead. Do not edit, build, commit or change services
there for this assignment. Ask this Review Lead to carry consultation to Fable.
Read the copied `.inbox/toastra/theme-engine-consumption-r1.md` through r3 and
our `.inbox/tofable/theme-engine-consumption-r2.md` as evidence, not authority.

## Fences and reservations

Round 1: no source, dependency, ticket or prototype changes. Local scratch
analysis may live in an ignored review directory in the sitting clone. Publish
one atomic Markdown submission to the canonical `.relay/inbox/` when ready.
The explicit shared-mailbox exception is for letters only; implementation Git
never targets canonical. Use `submission: epic-001-theme-consumption`,
`type: round-1`, `round: 1`, the exact base/head and per-issue findings.

After a fold, candidate product surfaces are new palette modules/fixtures,
`src/theme.ts`, the smallest shared-session subscription seam, and native/TUI
mapping call sites. The fold will ratify actual filenames. Do not touch the
composition engine, component extraction, navigation behavior, Three.js/GPUIX
bridge, MPD configuration, global hooks, SPEC, role/protocol docs, or ticket
queues. Assigned IMP checklist/evidence changes are allowed only in round 2.
Regenerate INDEX via its script after authorized ticket changes.

Reserved issues: IMP001–003 only. Proposed subdivisions use temporary names
until this Review Lead reserves IDs. No ports/schema release versions assigned.

## Validation and submission

Round 1 reports evidence and exact commands actually run; it does not claim
implementation acceptance. Historical baseline: 63 tests/257 assertions across
11 files reproduced during bootstrap, plus typecheck/build/package. The ready
handoff records its actual commit and validation receipt.

Round 2 full gate at the submitted tip:
`npm run typecheck && ./node_modules/.bin/bun test &&
./node_modules/.bin/bun run build && python3 scripts/package-mac.py`.
Run whole-tree tickets and `RAG/scripts/validate-tickets.sh --changed origin/main`.
Build/package before compiled visual checks; isolate state and simulated
playback; read counts and failed lines, not a filtered exit code.

One atomic commit per assigned issue, dependency order, one integrated epic
branch and ultimately one unmerged PR. Include issue/commit map, reviewed base
and head, files versus fences, per-suite counts, actual-host evidence, remaining
human checks, error/fallback cases, deviations and friction notes. No local
origin pushes. Publication to the owner remote is separately configured.
Code Lead reviews its subagent output. Independent second review and final
integration belong to the Review Lead's gate in RAG/PROTOCOL.md.
