---
submission: epic-001-theme-consumption
type: round-1
round: 1
branch: codex/epic-001-theme-consumption
commit: 3608afe39482bb7f5849ad5ab4cc4309cc186c87
status: awaiting-fold
---

# Sprint 001 adversarial review

Base/head: 3608afe39482bb7f5849ad5ab4cc4309cc186c87, verified clean tracked tree in /Users/golem/git/grisaille/.workspaces/code-lead/primary. Task 01a08093-8623-7222-8a98-7bf72785abd4. Round 1 only; no implementation, ticket, dependency or producer changes; no commits/pushes. Scratch: ignored review/round-1/check-draft.py. Start receipt is separate. Ready event af36a13cd4ec849b was read, digest-verified and ACKed.

Recommendation: fold required before implementation. Findings below elaborate known DQ-001 and the tickets' stated uncertainties; they are not newly discovered product regressions. Blocking means the proposed implementation cannot yet satisfy the ticket as written.

## IMP001 — contract and fixtures

1. BLOCKING: r3 cannot correlate a failed request independently of retained success. .inbox/toastra/theme-engine-consumption-r3.md:106–109 retains old identity with null roles, conflicting with SPEC §8.2. Ratify a discriminated success/no-art/failure envelope with current request identity, separately identified retained success, and displayed-fallback provenance. A failed B must never be represented as successful A newly accepted for B. Define no-art hash/cluster/role semantics too.

2. BLOCKING: identity is presently illustrative, and the publication mechanism is not shipped by the inspected producer. r3:50–60 contains an unexplained UUID, timestamp and visibly abbreviated hash. Current producer src/main.rs:120–130 emits RON, and src/lib.rs:16–21,49–66 does not return extraction clusters in Generation. hook/on_song_change.sh:17–20 has its own local token; :31 skips same-art work entirely. A JSON publisher must republish current request identity even when cached artwork avoids analysis. Request Fable's exact implementation revision, genuine artwork fixture/hash, config/command and captured output; do not label this sample a conformance fixture.

3. Numeric evidence: all five r3:78–82 contrasts reproduce to the shown 3 decimals from final hex: 14.167059, 9.398742, 6.287246, 5.833776, 3.705742. However r3:67 background #140200 recomputes to OKLCH [0.128885,0.041866,38.356], versus [0.137,0.021,45.2]; accent :69 recomputes [0.739167,0.172093,158.272], versus [0.741,0.155,158.9]. These exceed display rounding. This is independent conversion checking, not reproduction of the engine run. Cluster shares total 1.0 and descend, but neither this nor the letter proves their extraction provenance. Need exact representation meaning/tolerances: final-byte OKLCH versus pre-quantized extraction must be explicit.

4. Current producer source has moved beyond r3's pending-selection claim: external src/roles.rs:5–27 includes Selection; src/solver.rs:599–609 verifies highlight/selection and delta-L. This does not establish installed binary/publication readiness. Ratify actual revision and preserve backward absent/null-derived-role cases intentionally. Producer role names use hyphens (roles.rs:62–65), draft uses underscores. Define canonical wire names, exact supported schema versions (schema separate from producer revision), extra-field policy, finite numeric/range rules, share-sum tolerance, unique cluster IDs/order ties, alias consistency and required verified pairs. Reject unsupported semantics rather than infer capabilities from prose such as 'producer >= imp-005'. Limit first schema to null gradient unless a non-null grammar is ratified.

Proposed IMP001 seams remain palette-contract.ts, focused tests/fixtures and docs/palette-contract.md. Decoder validates data only; preserve canonical extraction unchanged. Synthetic parser fixtures must be labeled synthetic, separate from genuine producer captures. No copied example becomes 'real' by repairing its hash.

## IMP002 — subscription and identity

5. BLOCKING: the app and producer lack a shared observable playback token. src/music-session.ts:19,41,48 generation is lifecycle-only. src/model.ts:21–27 has currentId but no server epoch, request token or art hash. src/mpd.ts:224–231 erases player/playlist/mixer distinctions. A consumer counter cannot be compared to r3's independent UUID. URI equality fails A→B→A; song ID alone fails same-occurrence replay and server ID reuse. Adding fields is insufficient without specifying who originates them and how both sides observe them. Please carry this consultation to Fable and ratify the mechanism, or explicitly narrow acceptance to a fixture-driven consumer with live correlation still blocked.

6. Art correlation has a second missing seam: backend.artwork returns a string, is cached by URI (src/mpd.ts:149–166), and both hosts load it independently. Comparing an artifact hash to itself is no verification. Decide whether an authoritative request association suffices or shared expected-art hashing is required. src/model.ts/music-session.ts and possibly mpd.ts are additional candidate surfaces requiring the fold; do not quietly turn this into an artwork/navigation rewrite.

7. Define retention policy across track change, stop, disconnect and failure: last-good A may be an explicitly stale visual fallback while B waits, but must not be marked B's current palette. Specify configured artifact path/default, absent-parent and watcher-error recovery, bounded app-owned retry or explicit manual restart. Do not create producer directories or services. Errors need a palette diagnostic field separate from playback connection errors.

Proposed implementation: one PaletteSession owner, immutable getState/subscribe, injected read/watch boundary, thin useSyncExternalStore hook. useMusic already owns lifecycle (music-session.ts:130–133); do not call it from every palette consumer. Subscribe before initial read; serialize reads/preparation with dirty follow-up, lifecycle epoch and read revision; recheck expected token at commit. Reconsider the latest candidate when playback context catches up. Dedup by accepted content/revision, not only request UUID or mtime. Stop cancels retry/watch/context subscription and invalidates pending work; stale cleanup must not clear restarted work. Existing refresh promise guards (:60–81) provide a useful pattern, not correlation proof.

Required tests: A→B late A, A→B→A, duplicate URI/different IDs, same-ID replay, reconnect ID reuse; artifact-before-context; replacement during read/prepare; duplicate notifications; invalid/deleted/recreated artifact; missing parent/watch error; no-art and failed-B retained-A provenance; stop/restart with deferred old completion; whole-snapshot notification and zero playback commands. Fake scheduling plus real temporary-directory atomic replacement tests.

## IMP003 — mapping and host evidence

8. BLOCKING mapping detail: static const C captures exist in both hosts (:20); theme.ts:87–102 reads a singleton. A replacement can leave captured text stale while fills change, and mutation alone does not rerender. Publish one complete mapped snapshot through reactive host/helper access.

9. Ratify paired foreground/background state tokens and overlap precedence. GUI queue selection (app.tsx:562–574) and TUI selection (terminal/app.tsx:379–380) retain ordinary text/muted colors, whereas r3 verifies highlight_text on active. Inactive/frame's 3.0 floor is not a readable-small-text guarantee. Proposed ordinary/muted text -> text, decorative borders -> frame, background-backed surfaces -> background, accent-on-background -> accent. Selection/context need complete verified pairs or complete neutral fallback bundles, including text; never neutral fill plus arbitrary album text. Specify playing+selected/lyric-active precedence. Producer's role name does not itself choose our interaction mapping.

10. Alpha/overlays need separate treatment: theme.ts:50,67 and app.tsx:562 include scrim, text-selection alpha and held opacity. Opaque pair guarantees do not certify these composites. Preserve transparent wrappers' pointer-hit behavior (theme.ts:91–92). Include native input caret/placeholder repaint without remount/query loss (app.tsx:768,785). TUI explicitly takes first gradient stop (terminal/app.tsx:21–24).

No Three/GPUIX bridge change is needed for a solid-role/cell ramp. Propose opaque grayscale/primaries/near-black ramp, separate alpha-on-known-backdrop and two-stop samples. Check backend color values/emission and actual native/Ghostty output with encoding/capture limitations recorded. Cell proof does not close shared-scene/image-path fidelity. Current clone has no node_modules; actual backend conversion/alpha implementation and host output remain unverified.

## Waves, gates and friction

Round 1 used two read-only Astra subagents (lifecycle, host mapping); Code Lead cross-checked core findings. Proposed implementation order: IMP001 contract/fixtures first; IMP002 async subscriber next; IMP003 paired mapping and both host integrations last. Keep one implementer owning each shared seam; do not split two hosts before snapshot/mapping API settles. I can retain contract/integration review, delegate a bounded subscriber to Sol and mapping to Terra; Luna can audit fixture coverage after contract freeze. Exactly one commit per ticket; no new IDs. Model choices are proposals, not started work.

Actual commands: numbered source/document reads and rg; git status/rev-parse; canonical channel scan and exact-event ACK; python3 review/round-1/check-draft.py (results above); RAG/scripts/validate-tickets.sh => 24 checked, 0 errors, 0 warnings; --changed origin/main => nothing to validate. No product tests/typecheck/build/package or host probes run, and historical 63/257/11 baseline is not my reproduction. No dependency installs during read-only round. Explicit existing workdir resolved initial startup failures. Publication remote/idle wake remain separately pending.

Next actor: Review Lead for numbered fold, Fable consultation and explicit start only once contract/correlation/state-pair scope is settled. I remain within round-1 scope pending that response.
