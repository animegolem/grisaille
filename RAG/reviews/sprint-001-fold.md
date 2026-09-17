---
submission: epic-001-theme-consumption
type: fold
round: 1
folds: RAG/reviews/sprint-001-round-1.md
reviewed_commit: 3608afe39482bb7f5849ad5ab4cc4309cc186c87
author: notan (Fable — planning, per 2026-09-10 role swap)
date: 2026-09-10
status: delivered-awaiting-ratification
---

# Sprint 001 round-1 numbered fold

Round-1 predates the r5–r7 contract negotiation; most blocking
findings resolved there. This fold maps each finding to its
resolution or its landing ticket, with citations. Contract =
`~/git/RMPC-Auto-Theme/contract/notan-palette-v1.md` + five
fixtures (also GitHub `v2`, commit 4548893). Owner ratifications
below were given verbally 2026-09-10 (envelope discrimination,
hash-verified genuine captures, r3 supersession patch, per-event
identity + sequence mechanism).

## Governance note (read first)

Role swap proposed by Astra via owner, owner-approved 2026-09-10:
epics and IMP planning → notan; adversarial review and
implementation → Astra. Effective on Astra's written ack of r8.
Standing guardrails: contract amendments only via lettered
negotiation, never folded in silently; Astra's review retains
blocking power over any plan; work closes on reproduced counts.
`RAG/roles/*` rev follows ratification. Original letters remain
intact per r6; supersession is recorded here, never by edit.

## Dispositions

**F1 (envelope cannot represent failure) — RESOLVED by contract.**
Discriminated `ok | no-art | failed`; failed carries `roles: null`
and never-invented identity (`track.file: null` when unobtainable
— fixture `failed-no-identity.json` exists for exactly this);
retention is consumer-owned with explicit stale-fallback
provenance. No spec residual; IMP001 decodes per contract.

**F2 (illustrative sample, unshipped publisher) — RESOLVED
direction; capture gated.** Provenance owned in r5, acked in r6.
The genuine capture remains IMP-006-gated with binding criteria:
exact producer revision, artwork file + SHA-256, config, exact
command, unedited output. Until it exists, the synthetic fixtures
are the only conformance artifacts, labeled synthetic. The r3
sample is formally superseded (F3).

**F3 (numbers don't recompute) — CONFIRMED and EXTENDED.**
Independent recomputation 2026-09-10 (Ottosson matrices,
implementation independent of Astra's): both r3 recomputations
reproduce exactly — background #140200 → [0.128885, 0.041866,
38.356], accent #00ca80 → [0.739167, 0.172093, 158.272]. Full
sweep goes further: ALL seven role arrays and ALL five cluster
arrays in r3 exceed display rounding, while the five contrast
figures reproduce to six decimals from the hexes and the
peer-separation 60.0° matches recomputed hues (60.031°), not
published ones (59.4°). Conclusion: r3's hexes/contrasts/hue-sep
are one consistent final-byte family; its oklch arrays carry no
provenance. The entire r3 sample is superseded by the contract
fixtures, which compute oklch from hex at generation — the
structural fix. Representation law stands: extraction stage named
(post-gamut-map, pre-quantization); the two OKLCH representations
never conflated.

**F4 (schema pinning, wire names) — RESOLVED by contract.** Wire
canonical is underscore keys (contract :68 — `highlight_text`,
`header_accent`); producer-internal hyphens (roles.rs) are mapped
by the publisher, and IMP-006 acceptance must assert that mapping.
Schema id `notan-palette/1` + separate semver `schema_version`;
unknown-handling split by kind (fields / schema major / status /
pair kinds); achromatic H=0.0 at C<1e-4; clusters share-descending
with ties by ascending id, ids unique per artifact (:88); gradient
absent from v1. Reject unsupported semantics; nothing inferred
from prose.

**F5 (no shared playback token) — RESOLVED, by a different
mechanism than round-1 proposed,** refined by Astra's own r6 §2
(no shared UUIDs): every accepted event publishes with fresh
`track.file` + monotonic `sequence` (:17, :28); identity binds to
admission and superseded attempts never replace newer ones (:25);
same-art/different-file hole closed in r7 (analysis coalesces, the
envelope never does); startup/idle mismatch covered by one-shot
`--publish-current`. Owner ratified 2026-09-10. Consumer remainder
lands in IMP002 as accepted guidance: single PaletteSession owner,
subscribe-before-initial-read, lifecycle epoch + read revision,
commit-time token recheck, dedup by accepted content/revision.

**F6 (art correlation second seam) — RESOLVED per r6 §2
adoption.** Authoritative request association suffices; shared
expected-art hashing is NOT required; `art_sha256` remains
available for optional consumer cross-check. IMP002 does not
become an artwork/navigation rewrite.

**F7 (retention policy) — ACCEPTED into IMP002 acceptance
criteria:** enumerate track change / stop / disconnect / failure /
watcher error / bounded retry; configured artifact path + default;
absent-parent recovery; consumer never creates producer
directories or services; palette diagnostic field separate from
playback connection errors.

**F8 (stale const captures) — ACCEPTED into IMP003:** one complete
mapped snapshot published through reactive host/helper access; no
mutation-without-rerender paths.

**F9 (paired state tokens) — ACCEPTED into IMP003:** complete
verified pairs or complete neutral fallback bundles including
text — never neutral fill plus arbitrary album text; ticket must
carry a playing+selected / lyric-active precedence table. Producer
note: `selection` ships as a derived role (RMPC AI-IMP-005, merged
pending one owner glance); `present_from` semantics per contract.

**F10 (alpha/overlays) — ACCEPTED into IMP003:** composites are
consumer-owned; r3's standing offer holds — name the (overlay,
alpha, backdrop) triples wanted for producer-side verification.
TUI first-gradient-stop note recorded; caret/placeholder repaint
without remount in acceptance.

**Waves and gates — ACCEPTED as proposed:** IMP001 → IMP002 →
IMP003; one implementer owns each shared seam; the two hosts do
not split before the snapshot/mapping API settles; exactly one
commit per ticket; subagent topology is the implementer's choice.

## Next actors

r8 (`.inbox/toastra/theme-engine-consumption-r8.md`) carries this
fold to Astra. On their written ratification of contract and role
swap, the bounded implementation start proceeds per their r6
closing. No implementation, producer change, or service activation
is authorized by this fold alone.

## Correction 1 (2026-09-17, per theme-engine r12 finding R4)

The F1 disposition above misstates the failed-envelope wire shape:
it says failed carries `roles: null`. The frozen contract
(contract/notan-palette-v1.md:56-58) and both failed fixtures are
authoritative: in `failed` status, `roles`/`verified_pairs`/
`clusters` are ABSENT — not null. Only `track.file` may be null,
and only for the identity-unobtainable case; nullable identity
never makes role fields nullable. IMP001's valid/invalid decode
cases must enforce the absent shape and REJECT a failed envelope
carrying `roles: null`. The original text stands above uncorrected
as the historical record; this correction supersedes it. Root
cause: the disposition was written from r3-era draft memory
instead of the frozen contract text — the exact conflation class
the contract's own laws exist to prevent.
