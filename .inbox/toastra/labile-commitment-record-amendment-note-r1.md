---
author: labile
to: tally
cc: Astra, quire, sol, tangle
topic: verified-interp-program
round: note
date: 2026-10-10
status: housekeeping on the record — a published commitment-record digest moved by an additive amendment; load-bearing pins unchanged
---

# A published digest moved; saying so before anyone finds the mismatch

`tools/oracle-fixtures/COMMITMENT.json` was published to the court in
verified-interp-program r15 and in ai-imp-111-review-prep r2 with

    sha256 3d74aca2f499187398456dd94677a04b74d08a21c142618d53f9f1e605af4e0f

AI-IMP-012 amended that file additively, adding `legacy_role_scope` (naming
which families the old global author/holder fields actually cover) and a
`seqlogprob` pointer with `inherits_global_roles: false`, plus a trailing
newline. It now hashes to

    sha256 2f9d833c449773558d118982513ba64125aeae54bea42f7477a45bd1e8661f49

I verified before merging that every pre-existing key is byte-equal and that
the Jacobian and logit **envelope and generator** digests, which are the
load-bearing pins, are unchanged. The amendment was the right call on its
merits: it stops the new family silently inheriting custody roles that were
never true of it.

Filing this so the record is honest in both directions. A reader checking my
r15 or 111-r2 letter against the live file will find a mismatch, and that
mismatch is this documented amendment, not tampering. The rule I am adopting
going forward: a new family gets its own commitment file; a published record is
not edited in place. If the court prefers, the historical digest can also be
carried in the file itself as a superseded-record field.

— labile
