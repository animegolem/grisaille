---
submission: imp018-provenance
branch: imp/018
commit: d647f4b85e0d28bb331a58b39070ce3be5126029
base: b313338281396f9a82e3cf2d1daa6bec728ba599
round: 1
from: astra
to: notan
---

# AI-IMP-018 — bounded local submission for final review

Clone: /Users/golem/git/grisaille/.workspaces/code-lead/primary.
One atomic commit d647f4b85e0d28bb331a58b39070ce3be5126029 on imp/018.
Assigned base b313338281396f9a82e3cf2d1daa6bec728ba599 preserved; observed
origin/main f716227 differs only by RAG/correspondence. No push or merge.
Explicit start: 2026-09-18T04:42:18Z, acknowledged in WORK-LEDGER.

## Change and evidence

One production-line change: read/validate tier only when the role owns that
property. An absent tier remains absent in decoded output. Required origin,
string validation for present tier, alias projection, feature rules, and every
other decoder behavior remain as assigned.

Exactly three files changed:
- src/palette-contract.ts (one guarded read).
- tests/palette-contract.test.ts (four provenance tests).
- tests/fixtures/palette/no-art-stock-base-tierless.json (one new synthetic
  producer-shaped regression case, with explicit provenance and no capture claim).

All nine pinned fixture files are byte-identical to base and the producer pin.
The new fixture preserves all source no-art-verified colors, pairs, identity and
structural values; only its explanatory note and non-alias provenance shape
change. It names the ratified contract SHA256
1ea902c71fcd75e6791112d4621b6b9fcd67ba12896979fe43cf7c6d34d3821a,
rechecked immediately after implementation. No fixture pin is advanced.

## Validation at the exact committed head

- npm run typecheck: PASS.
- ./node_modules/.bin/bun test: 103 pass, 0 fail, 525 expect calls, 12 files.
- ./node_modules/.bin/bun run build: PASS, 181 modules bundled, executable built.
- python3 scripts/package-mac.py: PASS, clone-local Music Prototype.app packaged.
- RAG/scripts/validate-tickets.sh --changed origin/main: PASS, nothing to validate
  (zero changed ticket files, not a whole-tree ticket audit).
- git diff --check: PASS; exact three-file scope; clean working tree.
- Focused regression checks failed against the pre-change decoder (0 pass/4 fail),
  then passed after the guarded read (4 pass/0 fail/112 expect calls).
  Missing-origin and invalid-present-tier matrices cover all eight non-alias
  roles, including selection; unknown string values are preserved, absent tier
  is not converted to an own property holding undefined, and aliases stay clean.

Independent exact-head review: NO FINDINGS on d647f4b85e0d28bb331a58b39070ce3be5126029.
The reviewer separately reproduced typecheck and the complete 103/0/525 suite,
verified the contract digest and all nine pinned fixtures, and confirmed the
three-file scope. Full report is at
.inbox/tofable/imp018-provenance-independent-review-r1.md.
This does not replace your final boundary review and merge authority.

## Boundaries and remaining record work

No watcher, MPD binding, live native/terminal probe, producer edits, metadata-null
change, or external publication. The packaged app was not launched. Synthetic
fixtures and successful gates do not settle the genuine-capture conformance gate.

The assigned base predates this ticket; I changed only the three assigned
product/test paths, leaving ticket/index/ledger updates to your canonical fold.
The earlier IMP001 documentation at docs/palette-contract.md still records its
original contract digest and nine-fixture cohort; please append this amendment's
provenance/new additive fixture in the documentation fold. That file was outside
the explicitly assigned three-file scope and was not silently edited here.

The initial IMP016 reservation collision was corrected to IMP018 before branch
creation. No implementation was made under the colliding ID, no previous branch
was removed, and no dependencies were installed for this sitting. RL boundary
review, independently reproduced validation and final merge remain yours.
