---
submission: imp018-provenance-independent-review
round: 1
from: independent-second-reviewer
to: notan
commit: d647f4b85e0d28bb331a58b39070ce3be5126029
---

# AI-IMP-018 independent exact-head second review

Reviewer: independent Codex second reviewer, not implementation author Astra and not final Review Lead Notan.

- Reviewed head: `d647f4b85e0d28bb331a58b39070ce3be5126029`
- Reviewed base: `b313338281396f9a82e3cf2d1daa6bec728ba599`
- Branch and clone: `imp/018`, `/Users/golem/git/grisaille/.workspaces/code-lead/primary`
- Contract document: RMPC-Auto-Theme `contract/notan-palette-v1.md`, independently verified SHA256 `1ea902c71fcd75e6791112d4621b6b9fcd67ba12896979fe43cf7c6d34d3821a`
- Pinned original fixtures: producer commit `447975c18fb5b910b3c5d6098258b9354398ec2d`

## Result

No findings. The exact submitted diff implements the authorized tier-presence amendment without changing the other decoder behaviors. This review is independent of implementation authorship and remains advisory to Notan's final review and merge authority.

## Review and scope

Read the canonical IMP018 brief and ticket, SECOND-REVIEW role instructions, SPEC section 12, current work ledger, and pinned contract including addendum A4. Inspected the complete base-to-head diff and confirmed the clean working tree and exact submitted HEAD.

The diff touches exactly the three authorized files:

- `src/palette-contract.ts`: the only product-code change is at line 126. A tier property is copied and string-validated only when the input owns it. Omission therefore remains genuine property absence in the decoded role. The adjacent required origin read and the alias branch remain unchanged. The shared role parser applies the same rule to emitted ok and no-art bundles.
- `tests/fixtures/palette/no-art-stock-base-tierless.json`: one additive fixture, clearly labeled synthetic and not a genuine producer capture. Independently compared its parsed content against the pinned no-art-verified fixture: only fixture_note, non-alias origins changed to stock-base, and omitted non-alias tiers differ. Colors, numeric claims, role structure, and envelope data are preserved.
- `tests/palette-contract.test.ts`: covers tierless acceptance and own-property omission, preservation of a present open-vocabulary string tier alongside tierless roles, required origin on each non-alias role, and rejection of null/boolean/number/array/object tiers on each non-alias role. Alias origin/tier omission is checked in the accepted fixture.

All nine original fixtures were independently compared byte-for-byte with the pinned producer commit and are unchanged. No metadata-null, capability-authority/A1, alias-exactness/A3, watcher, application wiring, interpolation, retention, MPD, or service behavior changes occur in the diff. The explicitly preserved assigned base was used; no rebase was requested or performed.

## Independently reproduced validation

- `npm run typecheck`: passed.
- `./node_modules/.bin/bun test`: 103 passed, 0 failed, 525 assertions across 12 files.
- Contract document SHA256: matched the assigned digest.
- Nine pinned fixture comparisons: all byte-identical.
- Additive fixture comparison: only the intended provenance changes and explanatory note.
- `git diff --check b313338281396f9a82e3cf2d1daa6bec728ba599 d647f4b85e0d28bb331a58b39070ce3be5126029`: passed.
- Working tree remained clean after validation.

## Evidence limits

Build, package, and changed-ticket validation are owned by the submitting lead's concurrent gate run; this reviewer did not reproduce or claim those results. No live application, MPD, or service exercise was performed. The new fixture is synthetic; genuine publisher capture conformance and owner acceptance remain separate gates. This review covers only the named exact head and the authorized IMP018 change.

No source, RAG files, or Git refs were changed by this reviewer. This report is the only authored review artifact and is written under `/private/tmp` for the lead's authorized publication route.
