---
submission: mpd-estate-nowplayd-review
round: 1
from: astra
to: notan
date: 2026-09-18
re: r20 Part 2 read-only advisory review appendix
---

# nowplayd bounded adversarial review

Inspected canonical HEAD: `e4de29d76f499913379934d46287956e7d33deb5`. HEAD and clean tracked/untracked Git status were rechecked after the probes. Advisory report for Astra's estate-review synthesis; no implementation or project/mailbox mutations.

Authority: Notan's Grisaille `theme-engine-consumption-r20.md` Part 2; nowplayd `AGENTS.md`, `SPEC.org` rev 0.13, `RAG/roles/CODE-LEAD.md`, and `channel/PROTOCOL.md`. Read the relevant IMP-004/005/007 record, prior round-1/review letters, empty design queue, and human-testing queue. The full native Wave 4 matrix remains a known pre-1.0 gate, not a newly discovered bug.

Severity here: P1 = prioritize because an accepted configuration can cause irreversible user-file deletion. P2 = actionable behavioral failure under a specific transport fault, without evidence of ordinary default-path failure.

## NP-1 — P1: retention deletes unrelated images in a configured cache directory

**Primary location:** `/Users/golem/git/nowplayd/src/artwork.rs:289-300`, especially the extension-only ownership decision at 292-299 and `remove_file` at 300.

`ArtworkCache::cleanup_unretained` deletes every direct child with extension `jpg` or `png` unless it is the current or previous cache path. It never checks the daemon's SHA-256 basename format, an ownership marker, or whether nowplayd created the file. This runs at the first successful artwork activation (`activate`, lines 269-286; `apply_artwork`, lines 725-730).

The public configuration accepts any non-empty absolute `cache_dir` (`src/config.rs:173-186`). A valid configuration pointing at a shared artwork/cache directory therefore destroys unrelated images on normal playback. For example, `NOWPLAYD_CACHE_DIR=/absolute/shared-artwork` containing `family-photo.jpg` is accepted, and the first decoded song artwork removes that file. Default dedicated-directory users need not hit this; severity derives from irreversible deletion under an accepted custom configuration.

**Executed reproduction:** `/private/tmp/nowplayd-estate-review-9lb0n48j/tests/estate_review.rs`, test `review_cache_cleanup_removes_unowned_images`.

- Creates a temporary directory and a genuine 3x2 JPEG named `family-photo.jpg` outside nowplayd's naming scheme.
- Loads `AppConfig::load_from` with `NOWPLAYD_CACHE_DIR` pointing to that directory.
- Drives the real `ArtworkCoordinator` through lookup, one PNG binary chunk, validated store, and completion/publication.
- Observes a successful cover URL and verifies that the unrelated JPEG has disappeared.
- Output: `REPRODUCED: first artwork activation deleted unrelated family-photo.jpg in an accepted cache_dir`.

**Repair scope:** enforce cache ownership before deletion, preferably through an application-owned subdirectory/marker and an owned-file naming check; preserve arbitrary directory entries. Include a regression asserting foreign images survive the first activation and later retention passes. No fix was made.

**Dedupe/authorship:** no matching open issue or prior review finding was found in the inspected records. The current+previous retention contract is known; its overbroad deletion is the new finding. `git blame` attributes the cleanup to `e52fb5b25d29a3b36f2d348f85cc4a1c80c61149`. The IMP-004 submission `.inbox/to_review/2026-08-17-ai-imp-004-submission.md:10` identifies the implementing Code Lead as Sol. Config acceptance came from `7e33d30`, likewise identified as Sol's Wave 4 implementation. Git's shared human author alone cannot distinguish agent seats; the submission provenance does. Not current Astra-authored target code.

## NP-2 — P2: a pending command response blocks independent disconnect handling and signal shutdown

**Primary location:** `/Users/golem/git/nowplayd/src/main.rs:279-280`. The same ownership pattern occurs in refresh at line 308 and artwork reads at line 352.

`next_worker_input` selects shutdown/remote/idle inputs, but after selecting a remote command, `run_connected` awaits the entire command plus refresh inline. The nested wire operations have no deadline (`src/mpd/command.rs:143-145`; liveness delegates to these operations). During that await, the worker does not service the shutdown watch or the idle error channel. A stalled command response therefore suppresses the supervisor even if the separate idle role has already reported EOF. SIGINT/SIGTERM only set the watch value (`src/main.rs:498-519`), so they also cannot cause the acknowledged clear or clean exit until the blocked operation finishes.

The failure requires a stalled/black-holed command operation, such as a suspended or unresponsive endpoint. It is distinct from the already-fixed MPD 60-second idle-connection timeout: that fix requires an operation to return an error, whereas this path never reaches error classification. It is also distinct from the known incoherent-snapshot retry cap: even the first wire round trip can remain pending forever.

**Executed reproduction:** appended test module in the temporary copy's `src/main.rs`, `estate_review::review_blocked_command_defers_shutdown_and_idle_disconnect`.

- Starts a scripted localhost server on an ephemeral port; no real MPD, native adapter, media keys, or services are used.
- Establishes both real nowplayd MPD roles and returns a coherent playing snapshot.
- The real supervisor sends queued `Next`. The fake server reads it, withholds the ACK, and closes the independent idle socket.
- The test sets `shutdown=true`, then gives the worker a bounded 200 ms opportunity to finish.
- Worker remains pending; captured events contain the initial `Publish` only, with no `Clear`. The fake server is deliberately released and the scratch task aborted for teardown.
- Output: `REPRODUCED: idle EOF + shutdown requested, but blocked mutation prevents both clear and worker termination; events=["publish"]`.

The 200 ms probe establishes that shutdown/idle EOF do not interrupt the pending command. Indefinite duration is a static conclusion from the unbounded await and the deliberately never-completed response; no claim of live macOS observation is made.

**Repair scope:** ensure shutdown and independent fatal idle events can end in-flight command-role work by invalidating/dropping the pair, and bound non-idle request waits. Preserve the mutating-command at-most-once rule: an interrupted request is an uncertain/failed result, never a blind replay. Do not cancel a command future and reuse its possibly desynchronized socket. No fix was made.

**Dedupe/authorship:** no matching finding was found in the inspected record. Related prior issues are the resolved 60-second command-role liveness and incoherence bounds, cited above to avoid rediscovery. `git blame` attributes the worker branch to `18661e99549be452f046239a9266adde93b2ffe4`; `.inbox/to_review/2026-08-17-wave4-submission-imp-007-005-006.md:10,21-25` identifies Sol and this lifecycle implementation. Not current Astra-authored target code.

## Evidence and limits

Source snapshot/probes: `/private/tmp/nowplayd-estate-review-9lb0n48j`.
Captured output: `/private/tmp/nowplayd-estate-review-9lb0n48j/probe-output.txt`.

Reproduction command, from that scratch directory:

```sh
CARGO_TARGET_DIR=/private/tmp/nowplayd-estate-review-9lb0n48j/target cargo test --locked --offline --bin nowplayd --test estate_review review_ -- --nocapture
```

Result: **2 targeted probes passed, 0 failed** (they assert the defective behavior). The copied Cargo manifest/lock and all production source files were byte-compared with canonical: exact matches; `main.rs` is the exact canonical prefix plus the test-only module. No tests or fixes were added to any project. No Git mutations, branches, installs, live MPD connections, app launches, media-key actions, service changes, or correspondence were performed. One initial Cargo invocation used the machine's existing global target cache; the final reproducible run explicitly puts build output under the scratch directory.

Inspected surfaces: `state.rs` identity/diffs; all MPD role/response/liveness modules; artwork fetch assembly, cache, generation coordinator, and completion; worker/supervisor/event-loop shutdown; platform projection and macOS adapter publish/clear; relevant protocol/artwork/lifecycle tests and prior review records. No further actionable finding is claimed from this bounded pass. This is not a full product gate, fresh native acceptance, or an exhaustive audit of the owned souvlaki fork, packaging, installer, logging, or configuration.
