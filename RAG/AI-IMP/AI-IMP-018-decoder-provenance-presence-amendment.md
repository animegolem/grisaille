---
node_id: AI-IMP-018
tags:
  - IMP-LIST
  - Implementation
  - grisaille
kanban_status: completed
depends_on: []
parent_epic: [[AI-EPIC-001-theme-consumption]]
confidence_score: 0.9
assignee: code-lead
date_created: 2026-09-18
date_completed: 2026-09-18
---

# AI-IMP-018-decoder-provenance-presence-amendment

## Narrow consumer amendment: tier optionality + origin presence matrix

The merged AI-IMP-001 decoder (main b313338) requires `origin` AND
`tier` as strings on every non-alias role (src/palette-contract.ts:125-126).
Contract addendum A4 (ratified 2026-09-18, RMPC 29e7907, SHA256
1ea902c7…d3821a) rules: `origin` REQUIRED on non-alias roles; `tier`
OPTIONAL, present iff a solver tier applied — a producer MUST omit it
otherwise, so a conforming stock-base bundle is tierless and today's
decoder rejects it (reproduced by Astra r21, verified by RL in source).

### Out of Scope

Any other decoder behavior. No universal features-iff change (Astra r21
A1 note: unadvertised selection in `ok` stays accepted). No watcher,
wiring, producer or fixture MUTATION — pinned nine stay byte-immutable.

### Design/Approach

`tier` becomes optional on non-alias roles: absent → omitted from the
decoded result; present → must be a string (unchanged). `origin` stays
required on non-alias roles. Alias role (`inactive`) continues to carry
neither. One new ADDITIVE regression fixture, producer-shaped tierless
no-art-verified bundle with `origin: "stock-base"` on every non-alias
role (synthetic now, two-impl spirit; Sol's genuine publisher capture
may join later as a separate conformance case, not this ticket).

### Files to Touch

src/palette-contract.ts (tier read only); tests/palette-contract.test.ts
(regression: tierless bundle accepted, absent origin still rejected,
present non-string tier still rejected); tests/fixtures/palette/
(one new file, additive).

### Implementation Checklist

<CRITICAL_RULE>
Before marking an item complete on the checklist MUST **stop** and **think**. Have you validated all aspects are **implemented** and **tested**?
</CRITICAL_RULE>

- [x] Make tier optional per A4; origin requirement unchanged; alias handling unchanged.
- [x] Add the tierless producer-shaped regression fixture (additive; pinned nine untouched).
- [x] Add regressions: tierless accepted; absent origin rejected; non-string present tier rejected.
- [x] Reproduce full gates (typecheck, bun test, changed-ticket validator); report exact counts.
- [x] Submit atomic commit for independent second review and RL disposition.

### Acceptance Criteria

GIVEN a bundle conforming to addendum A4 (origins present, tiers
omitted where no solver ran), WHEN decoded, THEN it is accepted with
tier absent in the result; AND the nine pinned fixtures decode exactly
as before; AND absent origin or a present non-string tier is still
rejected.

### Issues Encountered

CLOSED 2026-09-18: merged to main at the imp/018 merge (tip d647f4b,
one guarded read at src/palette-contract.ts:126). Independent exact-head
review: no findings; reviewer byte-verified the nine pinned fixtures and
the additive fixture's provenance-only delta. RL reproduced gates at the
exact head and on merged main: typecheck PASS, bun test 103/0/525,
changed-ticket validator nothing to validate. Docs editorial (A4/new-
fixture provenance in docs/palette-contract.md) applied in the RL fold
as Astra requested — it was outside the three-file brief and correctly
not touched by the sitting.
