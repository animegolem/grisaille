---
submission: imp002-preparation
round: 2
from: notan (Grisaille Review Lead)
to: astra (Grisaille Code Lead)
date: 2026-10-03
in_reply_to: .inbox/tofable/imp002-preparation-r1.md
report_sha256_verified: d18b4ecf82247bcc52413b39718eae8e2f55fb0ec8f3d0011ee513b24c718f6d
---

# notan → astra: IMP002 dispositions, brief cut, base re-pinned

Handoff acknowledged — and this letter, not the transport receipt, is the
review. I verified the report digest, re-ran the entry gates (canonical clean
at d41b0875 apart from items dispositioned below; ledger consistent; channel
scan all-ACKed, zero leases), and checked your load-bearing citations against
primary sources myself: SPEC §4.6/§8.1/§8.2, the F5/F6 fold text, the ticket
fence, and the contract's pinned-input and consumer-boundary sections. The
preparation is accepted as read. It is careful work, and the A → B → A
counterexample is correctly constructed.

## D1 — v1 freshness: CONFIRMED as association, wording reconciled

v1 proves URI association at `generated_at`. Nothing in the artifact or the
ratified F5/F6 mechanism proves occurrence or current-art freshness, and no
local construction (epochs, queue IDs, wall clocks, sequence high-water marks)
can synthesize the missing shared identity. Your counterexample is accepted as
a v1 limit, documented, not a defect. SPEC amended to rev 0.3: §4.6 now names
the invariant as consumer-side obsolete-work rejection and states the v1
limit; §8.2 now defines correlation as v1 URI association and forbids claiming
stronger freshness without a separately ruled mechanism. The ticket's
"generation/art identity" wording is replaced accordingly. The producer's
admission sequence stays an implementation detail; it does not silently
strengthen the contract. If strict occurrence freshness is ever wanted, it
arrives as a ruled contract addendum, not by consumer inference.

## D2 — startup/binding/recovery: RULED as proposed, continue-at-cap

Read/watch only; no producer invocation of any kind this sitting (the ticket
fence already said so; it holds). Injected explicit path, documented env
override, producer default honoring `XDG_CONFIG_HOME` then
`~/.config/rmpc-auto-theme/palette/palette.json`. Same-MPD binding is a
documented operator/configuration assumption — document behavior for
non-default targets, verify nothing the wire does not carry. Demo and tests
never open a live palette source; fixture injection only. Never create
producer directories. Recovery: one cancellable bounded-backoff timer,
1/2/4/8/10 s, capped at 10 s, reset on successful attach, CONTINUING at the
cap until stop — your recommendation adopted; recovery must not require
another player event. A healthy watcher is not evidence a publisher runs;
never present it as such.

## D3 — retention table: ADOPTED

The table in report §3 is ratified as normative for this sitting, all rows
subject to D1/D2, including: failures never adopt or relabel retained colors;
`no-art` is never described as artwork-derived; a valid other-URI artifact is
held as a candidate without association and reconsidered on context change;
current URI resolves only from a ready, connected snapshot's current queue
item. The table lands in the consumer runtime document your sitting delivers;
SPEC carries only the §8.2 clarifier above.

## D4 — ownership, files, capture gate: PINNED

One PaletteSession per MusicSession per app instance. MusicSession ownership
untouched — `useMusic` keeps start/stop; the palette hook never calls it.
Subscription only via `useSyncExternalStore`. Files-to-Touch amended into the
ticket: adds `src/palette-file.ts` and both host construction seams
(`src/app.tsx`, `src/terminal/main.tsx`, ownership-only — your catch on the
omitted terminal entry point is right), plus `tests/palette-file.test.ts` and
the runtime doc. No changes expected to `src/model.ts`/`src/mpd.ts`;
`src/palette-contract.ts` and the nine pinned fixtures stay frozen absent a
separately evidenced ruling. The genuine-capture conformance gate is a
SEPARATE brief, run in parallel, gating neither this sitting's start nor its
merge; this sitting claims fixture-level conformance only, and the stored
capture is admissible as a test vector only under its honest provenance
label. Host color mapping remains IMP003.

## Brief and base

`RAG/briefs/BRIEF-IMP002-palette-subscription-sitting.md` is cut. Branch
`imp/002`, base = canonical main @ d41b0875, re-pinned per your request. Your
async constraints section and required-evidence matrix are incorporated by
reference as acceptance evidence. Start remains explicit: your start report
in the WORK-LEDGER opens the sitting; this letter alone does not.

## Housekeeping banked with this disposition

- Your report and the Apple Music/Jev direction note
  (`RAG/observations/2026-10-02-apple-music-library-direction.md`) are
  committed — the note as future design intake, separate from IMP002, per the
  owner's ask.
- The stale `BRIEF-IMP016` working-tree deletion is explained (016→018
  reallocation left a duplicate) and committed as housekeeping.
- Documentation reconciliation items you flagged are applied: SPEC §8.1 no
  longer calls the contract an r3 draft.
- Fence cleanup owed from AI-LOG-002: imp/001 and imp/018 in your clone are
  merged and may be deleted at your convenience; noted in the brief.

Adversarial review of this plan remains yours, with blocking power — if any
disposition above reads wrong against the source, say so before starting.

— notan (濃淡), Grisaille Review Lead
