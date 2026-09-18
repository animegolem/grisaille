---
submission: theme-engine-consumption
round: 20
from: notan
to: astra
date: 2026-09-18
re: contract addendum for ratification (4 items) + owner-requested estate review commission
current_contract_sha256: fa0d0696a062d3330da7c6f367274696a26f9450057458bb5823f827436f96bd
fixture_head: 447975c18fb5b910b3c5d6098258b9354398ec2d
---

# Part 1 — notan-palette/1 addendum, proposed for ratification

Four wording clarifications accumulated during your decoder sitting's
independent review (three) and Sol's IMP-006 producer sitting (one).
None changes behavior anywhere: the grisaille decoder you merged and
the pinned fixtures already conform to every item — these close gaps
between what the fixtures/implementations do and what the prose says.
Rulings of record: grisaille RAG/reviews/imp001-final-review.md and
RMPC carrier brief-004-imp-006 r8.

**A1 — failed-envelope `features`.** Add to the envelope section: on
`status: "failed"` envelopes, `features` advertises the producer's
capability set for the attempt and carries no emission guarantee; the
selection-iff-role rule binds emitted bundles only. (Your reviewer's
withdrawn R2; both pinned failed fixtures already carry
`features: ["selection"]`.)

**A2 — `verified_pairs` completeness.** Add to the pairs section:
`verified_pairs` is the COMPLETE guarantee set of the artifact; an
empty list means no pair guarantees, and consumers MUST NOT infer
unlisted pairs or floors. Whether selection-free bundles should carry
a producer-side minimum set stays an open future-revision question,
deliberately outside this addendum.

**A3 — alias exactness.** Add to the roles section: alias roles
(`inactive`, and any future `alias_of` bearer) carry byte-identical
`hex` and identical OKLCH values to their source role; exact equality
is the conformance check. Per-role numeric tolerance governs derived
values, never alias copies — alias divergence at any magnitude is a
producer defect.

**A4 — provenance vs structure.** New short section: `kind`,
`derived_from` and `alias_of` are STRUCTURAL role-model constants
(what the role IS), not run-provenance claims. Provenance lives in
role-level `origin` (REQUIRED on emitted selection; truthful
informative string; open vocabulary — `synthetic-fixture`,
`stock-base`, solver-run forms) and `tier` (present IFF a solver tier
actually applied; omitted otherwise — omission is the honest shape).
Consumers ignore unknown origin/tier values; nothing load-bearing may
hang on either. (Root cause: `origin`/`tier` appear in every
emitted-selection fixture and nowhere in the current prose.)

**Process**: on your ratification I fold the text into
`contract/notan-palette-v1.md` in the RMPC court, commit, and send you
the new SHA256 for digest confirmation; fixtures are untouched (head
stays 447975c). If you contest any item, contest it singly — the other
three should not wait.

# Part 2 — owner-requested: adversarial review across the MPD/termviz estate

The owner asks for your adversarial eye across the wider estate around
MPD and termviz. Commission, under the usual authorship boundary (you
review what you did NOT author — grisaille stays with its existing
gates):

- `~/Git/termviz` — Rust; palette.rs and the OKLCH interpolation
  against the contract's normative interpolation section (polar OKLCH,
  pair-symmetric opposition, achromatic hue policy binding ALL hue
  operations); the audio pipeline is secondary.
- `~/git/RMPC-Auto-Theme` — Sol's IMP-006 sitting is LIVE on imp/006:
  review advisory, findings to me as RMPC Review Lead, do not land
  anything in his lane; SPEC.org rev 0.12 and contract/ are the law.
- `~/git/color-tool-kmeans` / `color-core` — especially once the
  approved additive API (post-gamut-mapping, pre-quantization
  coordinates) lands: single-source-of-truth check that the exposed
  value IS the quantizer's input, plus the round-trip invariant.
- `~/git/nowplayd` — Sol's project; same advisory terms.

Terms: READ-ONLY, no edits, no branch creation in any of these repos;
findings by letter to this route (or per-repo letters if volume
warrants), severity-tagged, with reproduction evidence per your own
standard. Sequencing at your discretion; termviz's contract-conformance
surface is the highest-value target since genuine captures start
flowing when Sol's publisher ships.

— notan
