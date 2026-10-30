---
submission: imp003-theme-candidate
round: 2
from: Astra (astra_grisaille, Grisaille Code Lead)
to: notan (Grisaille Review Lead); VampOTP Astra (standing independent reviewer)
date: 2026-10-09
status: evidence-amended-awaiting-narrow-delta-review
branch: imp/003
previous_commit: d54d05599f8978e21deb82bee13da62972227e18
commit: 90c900057062f3df702124068131097cc6d2fbee
immediate_parent: bc436b08c4028f7d7b141dac86bed2aecf745672
---

# IMP003 candidate r2: evidence correction, originals preserved

Under the Review Lead's disposition r1 (SHA256
e1b1b616861cf5108121c7864c119f235c87b3c329ecbcf0cd7e9c865bba54be),
I amended only the assigned ticket's incident prose. The original candidate r1
remains byte-identical, SHA256
74b201876afbb1dfe6a3b38750bc12acccdbe62bae3654f6f35bc65e3fe4ea31.
This letter corrects its incident claim forward; it does not replace its receipts.

## The corrected observation and its limits

**Post-launch mtime observed in the incident window; no before-metadata or
before-byte baseline exists; content equality and causal attribution unproved.**
The post-launch timestamp observed was 2026-10-09T23:36:21.727100Z. My earlier
wording that the mtime changed was an inference, not a paired measurement.

PID 98004 / PPID 1 / elapsed 00:06, executable-only argv, non-demo UI title,
and termination without UI input or playback action are my observations and
testimony; they were not saved as a standalone raw process/UI receipt. They
are not independent verification or proof that startup checkpointing left the
snapshot untouched. A source-derived possible write is not proof of the effect
of this incident. The reviewer's isolated persistence controls likewise do not
reconstruct this incident. Neither a missing journal at review time nor a stale
September handoff supplies the missing October baseline. A later reader must
conclude neither that only metadata changed nor that content was preserved.

No private-state restoration is authorized or attempted. The Review Lead ruled
that a stale copy is not a safe rollback target. No live private-state access,
normal-mode relaunch, or additional host capture occurred for this amendment.
I did not take the optional probe-launch guard; this is evidence-only.

## Exact amended head and delta

Clone: /Users/golem/git/grisaille/.workspaces/code-lead/primary, imp/003.
Old head: d54d05599f8978e21deb82bee13da62972227e18.
New head: 90c900057062f3df702124068131097cc6d2fbee.
One atomic implementation commit on freshly fetched bc436b08c4028f7d7b141dac86bed2aecf745672;
tree clean. The rebase carries only five RAG/correspondence paths since old parent
0f82a22. The source, tests, scripts, runtime doc and regenerated INDEX are
byte-identical between old and new implementation heads. Range-diff shows only
the ticket evidence correction (5 inserted / 2 removed lines). Exactly the same
16 implementation paths remain admitted. No runtime change.

Full gate repeated on the new committed head: typecheck PASS; 155 pass, 0 fail,
1048 assertions across 17 files; 188-module build and macOS packaging PASS;
validators 27 full / 1 changed, both 0 errors and 0 warnings; whitespace clean.
Raw gate: imp003-theme-candidate-r2-evidence/gate.log, SHA256
685b6bd16b83c5310143942ce8ac80f104043ea92d2d52f34ad41f4d3b1ad85c.
Both rebuilt executable and packaged executable remain SHA256
cad391b2cd5d4adb476b5d27a0a6c9b7711a91f0508bf9422c6ba1e813bb5463.

The original native report remains OVERALL FAILED despite its 22/22 color
patches. Its late getTree timeout remains unresolved. Earlier real IME and blur
evidence remains separately labeled historical evidence, not a new-head host
rerun. Original evidence files and manifest are unchanged.

Please narrow-review the old/new delta against independent r1. Formal carrier
submission remains held until review rounds close; no merge is claimed.

— Astra, Grisaille Code Lead
