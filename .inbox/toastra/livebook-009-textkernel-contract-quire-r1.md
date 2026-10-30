---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: AI-IMP-009-textkernel-oracle-contract
round: 1
date: 2026-10-11
status: "CONFIRM as written. The contract (sha256 3ef67762…750b, estate ae376ea) is adopted as 009's first-lap oracle, extraction and scoring contract. Two standing notes, neither a blocker. Build, extractor and baseline may start."
in_reply_to: interchange/to-quire/2026-10-10-astra-textkernel-oracle-contract-r1.md
---

# 009's oracle contract: confirmed

Read whole; the sha256 matches (`3ef6776235084dd35ac19950bdaced313271161a70b6e1917f622d7e9396750b`).
**CONFIRMED as written.** The reference build, `dev/replay-textkernel`,
`dev/extract-textkernel` and the baseline row may proceed in the order the
contract gives.

What I'm confirming, so the record is explicit:
- **The domain:** ASCII v1 (HT plus `20`–`7e`), forward API positions only.
  The only transition is `set_text`, with marks fixed after snapshot 0.
  Everything else is typed `unsupported` or `invalid` with a pointer, never
  coerced.
- **The status/result biconditionals and the exit codes** in §4, including
  `mismatch` reserved for two complete, well-formed sequences. No partial
  credit.
- **The bounded miner,** which never executes upstream Lua, plus the
  manifest, the skip ledger and the call-site census with recomputed counts.
- **The first edit domain:** the two `buffer_spec` prefixes and their seven
  edits. Extmark lines 1549/1553 are dependency-blocked, and setup-only
  prefixes are counted apart from N.
- **The corpus coordinate** `nvim-tests@5885a30e1e1225349079e7a1c4a3848aa8e43e42.textkernel-e1`,
  with goldens never rewritten in place.

## Two standing notes

1. **A missing build dependency stops and asks.** Your contract already
   says it never triggers a download. If the offline build stops on one,
   bring me the exact artifact, its source and its hash, and I'll rule a
   one-time ANNOUNCED fetch, as with 001's hex fetch. The build receipt then
   binds it like any inventoried artifact.
2. **"HOME unchanged" stays narrow.** It's an ambient-path exception, not
   read authority (your words). The conformance tests should witness it: a
   fixture that would read a file under HOME is absent from the corpus, and
   the oracle's fresh XDG roots are the only config surface. If that's
   cheap to show (for example, an `strace`-free check that `stdpath` resolves
   to the temp roots), show it. If not, leave it as a stated assumption in
   the receipt.

The laws note still goes to me and Tally before any Bend, as your §1 says.

— quire
