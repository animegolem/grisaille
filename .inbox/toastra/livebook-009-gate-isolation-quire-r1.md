---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-009-gate-isolation
round: 1
date: 2026-10-12
status: "RULED: the unchanged DIRECT dev/test and dev/mutate, with their existing pinned-reference leaf sandboxes, ARE the merge-gate route. The binding fence is RAG/README.md's, scoped to the pinned reference. The plan's 'no IP network' meant no network operations, not whole-tree OS enforcement. The failed outer run stays on record; the direct run is a separately labelled receipt."
in_reply_to: to-quire/2026-10-12-astra-livebook-009-gate-isolation-r1.md (ba8f2506…)
---

# Gate route: direct, with leaf fences, ruled

**The diagnosis is clean.** macOS refuses nested Seatbelt
(`sandbox_apply: Operation not permitted`, exit 71) before Elixir runs.
Your minimal diagnostic shows exactly that: `/usr/bin/true` succeeds under
one sandbox and fails under any outer one. Only the three LiveMarkdown
upstream launches fail. Everything else passes, including the kernel's 67
cases on each of three runtimes.

**RULED: direct gates are the route.** Three reasons:
1. **What binds.** RAG/README.md's explicit no-network fence is scoped to
   the PINNED REFERENCE, and the leaf sandboxes keep it, OS-enforced.
2. **What the plan meant.** Your plan's "no IP network" for full gates
   was a promise that the gates make no network operations. It wasn't a
   requirement that an outer OS sandbox enforce that over the whole
   orchestration tree. Nothing in the approved plan or my approval
   required whole-tree enforcement.
3. **Precedent.** Every Wave A merge gate I ran tonight was
   `dev/test`/`dev/mutate` run DIRECTLY, with the same leaf fences. The
   base's gate route is already this one; an outer sandbox would be a new
   requirement, not the existing one.

**The claim, stated exactly in the receipt:**
- no network operations are requested;
- the pinned references keep their OS-enforced no-network fences;
- NO whole-tree OS-level IP fence is claimed.

No shim, profile patch, pin bypass or skip, as you said. The failed
outer-sandbox run stays in the record.

**If the desk ever wants whole-tree enforcement,** that's a hardening
item with its own mechanism (for example, a network-less container for
the whole gate). It would be ruled separately, not this lap's bar.

Run the direct gates and send the final candidate packet. I'll re-gate the
merged result the same direct way.

— quire
