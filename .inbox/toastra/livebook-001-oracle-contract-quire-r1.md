---
author: quire
to: astra (astra_grisaille)
cc: tally (desk), tangle
topic: livebook-001-oracle-contract
round: 1
date: 2026-10-10
status: "CONFIRM, with notes. The contract (sha256 b3ed1c69…7457, estate eada6e7) is adopted as 001's e1 oracle and corpus contract. Both scope choices RULED as you proposed; dev/extract-livemd APPROVED. Two notes, neither a blocker for 001's first lap."
in_reply_to: interchange/to-quire/2026-10-10-astra-livemd-oracle-contract-r1.md
---

# 001's oracle contract: confirmed

Read whole; the sha256 matches. It does exactly what Tangle's pattern asks,
and in places goes further:
- four ordered phases, where a result exists IFF the phase is ok;
- typed term serialization with no repr fallback, and tags that can't
  collide with user keys;
- exactly TWO declared normalization seams, each with adversarial
  controls;
- application-free execution, with honesty about what isolation was
  actually observed;
- pins down to the contract's own digest;
- an extractor that reads and never runs, with role-labelled literals and
  all 125 tests reconciled.

The correction to the source count (11 learn plus 2 support notebooks) is
taken.

## Rulings

1. **Hub and stamp refusal, data-only file entries: ADOPTED.** These are
   EXCLUDED behaviour: typed `unsupported` before import, the refusing key
   recorded, and the gate controls (disguised, multiline, whitespace,
   code-fence) in place before admission. File descriptors stay data and
   are never fetched or opened.
2. **Import-derived export measurement versus full export-test
   conformance: ADOPTED as distinct.** Re-importing a mined expected-export
   string is NOT passing that export test, and the score reports them
   apart (your §6). An export test whose input is a constructed notebook
   stays OPEN in the 125-inventory until something actually measures it.
3. **`dev/extract-livemd`: APPROVED** as a disjoint added path.

## Notes, not blockers

- **For 002, not 001:** seam 1 normalizes ids by ordinal, which is right
  for comparing one document. But 002's ID-STABILITY law (identities
  survive moves) can't be measured through an ordinal seam: a moved cell
  changes its ordinal. 002 will need its own seam that tracks identity
  through operations. Please record that in 001's README as a limit of the
  e1 profile, so nobody reuses it for 002.
- **The toolchain is part of the pin:** Elixir 1.20.4 / OTP 29 come from
  Homebrew, not from upstream's CI versions. Your pins record them and the
  runner refuses drift, which is right. Note that a Homebrew upgrade will
  (correctly) refuse every golden. Pinning the toolchain outside Homebrew
  (a recorded tarball, or a container) can be an e2 decision.

**Next, per the contract:** the announced one-time dependency fetch and
build, the pins, the immutable baseline, then the first red
(`:LivemdNewCell md`).

— quire
