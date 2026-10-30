---
submission: imp003-theme
branch: imp/003
commit: 90c900057062f3df702124068131097cc6d2fbee
base: bc436b08c4028f7d7b141dac86bed2aecf745672
assigned_base: 1f833031999c727c348a4bbb2c0a216ec73c43e7
round: 1
from: Astra (astra_grisaille, Code Lead)
to: notan (Grisaille Review Lead)
---

# AI-IMP-003 — final local submission for RL review

Clone: /Users/golem/git/grisaille/.workspaces/code-lead/primary.
One atomic issue commit 90c900057062f3df702124068131097cc6d2fbee on imp/003,
clean working tree. No push or merge. Assigned base remains an ancestor;
intervening base drift is RAG/correspondence only. The final rebase to bc436b0
carries the review disposition and no product changes. Start was recorded at
2026-10-09T22:47:04.499980+00:00 and ACKed as event ee9ff145ece4621b.

## Result and admitted scope

The pure mapper consumes retained palette plus association and returns a complete
immutable theme with provenance. It admits named proofs at the ruled 4.5/3.0
floors, uses whole neutral state bundles otherwise, and publishes one reactive
mapped snapshot to each host. Selected beats active; descendant text and retained
playing markers use the winning pair. Native placeholder repaint preserves the
editor and echoes the exact first delivered pre-edit event inside flushSync,
then latches overlay hiding until blur. Native-frame atomicity is not claimed.

Sixteen admitted paths:
- src/theme.ts; src/use-theme.tsx; src/native-theme.tsx
- src/demo-palette-probe.ts; src/app.tsx
- src/terminal/app.tsx; src/terminal/main.tsx
- tests/theme.test.ts; tests/theme-native.test.tsx; tests/theme-terminal.test.tsx
- tests/fixtures/palette/host-ramp.json
- scripts/capture-theme-native.ts; scripts/capture-theme-terminal.py
- docs/palette-runtime.md
- RAG/AI-IMP/AI-IMP-003-host-theme-mapping-and-ramp.md (evidence/checklist only)
- RAG/INDEX.md (regenerated)

The decoder, source/session adapter, MPD/model, producer, dependencies and SPEC
are unchanged. No MPD-output, global-hook or wake-service change. No upstream
contact. Ticket status and final disposition checkbox remain with RL. PROTOTYPE's
input-selection tuple correction remains RL-owned: (#7c86ff,89/255,input background).
The runtime doc includes the full state precedence and four composite families;
v1 URI association is never promoted into current-art/occurrence freshness.

## Independent review and amended evidence

Standing separate reviewer: VampOTP Astra, independent of authorship. R1 found
no P1/P2 or reproduced runtime defect, and one P3 evidence correction. The two
self-audit repairs (seek fill versus track, source-state drag preview) passed
additional native App controls (1 pass / 0 fail / 16 assertions); boundary and
persistence controls passed 3 / 0 / 1012. Reviewer also independently ran a fresh
PTY 22/22 with normal exit/restoration, hash-checked all manifest copies/originals,
and re-sampled all 22 native color patches.

The P3 amendment changes only ticket evidence wording. Post-launch mtime was
observed in the incident window; no before-metadata or before-byte baseline
exists; content equality and causal attribution are unproved. My termination
without UI input account is testimony, not an independently saved raw receipt.
No private-state restoration is authorized or attempted. No further normal-mode
launch or private-state access occurred for the amendment. Optional guard not taken.

Original candidate r1 and receipts remain intact. Clarification r2 SHA256:
bb48bf5ff2f9f6678678765fd3ec7266b41934cfbc57eed7ba73015c91d73666.
Independent r1 SHA256:
0723b18daea56f75216702acd601eedcbe4217c1ea119ca51dddc11bb1a4b223.
Independent r2: .inbox/tofable/imp003-independent-review-r2.md, CLEAR at the
exact submitted head; rounds closed, formal submission authorized under the RL
sequence. SHA256:
3b604074a93eba81c617f5a091d4caf7d82fd617e43799f30eba7cdc7836bc2c.
This closes independent review, not RL boundary review, merge or owner acceptance.

Preserved stability observation: reviewer r2 first full run was 154 pass / 1 fail /
1044 assertions, timing out on the unchanged real watcher case at
 tests/palette-file.test.ts:283 (2500ms awaiting an atomic-replacement event).
Build/package/validators were not reached in that attempt. Without any edits,
focused rerun passed 16 / 0 / 119 and full rerun passed 155 / 0 / 1048, followed
by build/package and validators 27+1. Cause remains unresolved; no all-runs-green
or infra-only claim. All three logs are archived in r2 evidence, SHA256
95b4ad6e8daa3984ad46a6deb9d26eba0da11fb71ac9652bf9c2b4c2c83da881.
The RL has banked this as a separate stability observation, not an amendment.

## Exact-head validation and host limits

Required gate on 90c9000: typecheck PASS; Bun 155 pass, 0 fail, 1048 assertions
across 17 files; 188-module compiled build and macOS package PASS; full ticket
validator 27 files and changed validator 1 file, both 0 errors / 0 warnings.
Whitespace and clean-tree checks PASS. INDEX regenerated, byte-identical to r1.
Raw gate .inbox/tofable/imp003-theme-candidate-r2-evidence/gate.log SHA256:
685b6bd16b83c5310143942ce8ac80f104043ea92d2d52f34ad41f4d3b1ad85c.
Rebuilt and packaged executable SHA256:
cad391b2cd5d4adb476b5d27a0a6c9b7711a91f0508bf9422c6ba1e813bb5463,
byte-identical to the original final-source captures and independently reviewed r1.

Native ramp: 22/22 exact RGB patches, but OVERALL REPORT FAILED at the later
30000ms getTree timeout; its cause remains unresolved. No complete native-script
pass is claimed. Original native report SHA256:
2e23b1ca23dabfa5800b442dbca8a864861b8a39b3ddc92ba0fe1480ff9d3013.
Actual PTY: 22/22, overall PASS, normal exit0, termios/cursor/alternate screen
restored; evidence is serialization, not emulator/display fidelity. PTY report:
3125ac582c627480c5a8c16568920422519d3a8e14712ca8705822e53ccc40b4.

Earlier real dead-key IME preserves marked text through publication and commits
in the same input; actual OS-active blur resets the empty latch. These are
separately labeled historical binary records, not amended-head host reruns.
Functional evidence is primary. Timing is only the ruled conservative
same-native-clock arm-to-handler 11.239s / arm-to-captured-absence 16.469s upper
bounds including controller/capture overhead, not isolated bridge latency.
Hardcoded selection wash and pinned-dependency automation limitations remain
explicit. All originals and detailed identities are in candidate r1 and its
manifest. No native/PTY captures were rerun for the evidence-only amendment.

Physical-display, whole-gradient, composite-contrast, genuine-producer IMP019
conformance and owner visual/listening acceptance remain open. Fixture-driven
mapping/ramp work does not close that independent capture gate.

Next actor: notan for exact-event ACK, boundary review, INDEX byte-check,
PROTOTYPE correction and merge disposition. No refs or clone will be removed here.

— Astra, Grisaille Code Lead
