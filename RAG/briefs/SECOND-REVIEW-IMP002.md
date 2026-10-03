# ASSIGNMENT — IMP002 independent exact-head second review

Cut 2026-10-03 by notan (RL). Reviewer: ASSIGNED (owner-designated,
same day) to the VampireOTP Astra seat — a DIFFERENT INSTANCE from the
implementing astra_grisaille per the owner's instance ruling of
2026-10-03, and the seat that independently flagged the R1 fence
conflict on this very submission. Not the implementation author, not
the RL. Charter: `RAG/roles/SECOND-REVIEW.md` — read it first;
read-only throughout; advisory to final authority.

- Reviewed head: `899722ea35a4332a54d1314dcb761c0e07240201`
  (branch `imp/002`, clone `.workspaces/code-lead/primary`; one
  atomic implementation commit; verify, do not assume).
- Immediate parent: `35770dc` (RAG/correspondence-only advance over
  the assigned ancestor, allowed by brief). Assigned source/spec/brief
  ancestor: `d0e0de4ee3cfccb104baccbfe8d6a2b107c45248` — the SPEC rev
  0.3 / amended-ticket / corrected-brief state the implementation must
  satisfy.
- Submission context: Code Lead candidate letter
  `.inbox/tofable/imp002-palette-candidate-r1.md` (SHA256 f9a01fc1…),
  11-file declaration and raw gate evidence. Governing documents:
  ticket AI-IMP-002 as amended 2026-10-03, BRIEF-IMP002, dispositions
  `.inbox/toastra/imp002-preparation-r2.md` as corrected by r3/r4, and
  the preparation report's required-evidence matrix
  (`RAG/reviews/imp002-preparation-2026-10-02.md`).
- Reproduce the gate at the exact head (typecheck, bun test, build,
  package; expect 132/0/769 or report the true counts) and both
  ticket validators. Report exact counts and anything not run.

Specific attention, beyond the charter's standard sweep:

1. **Fence: ticket/INDEX edits by the Code Lead.** The diff touches
   `RAG/AI-IMP/AI-IMP-002…md` and `RAG/INDEX.md`. IMP001's accepted
   review recorded zero Code Lead ticket/index/ledger edits as a fence
   observation. Characterize exactly what changed in those files
   (checklist state vs. substance) and flag any scope language that
   moved. The RL will rule; your job is the precise delta.
2. **Association-language discipline.** No code, comment, test name,
   doc line or diagnostic may claim occurrence/current-art freshness;
   v1 URI association only (SPEC §4.2/§4.6/§8.2 rev 0.3). The A→B→A
   limit must be honored, not papered over.
3. **Retention table conformance** (ratified table, report §3):
   failures never adopt/relabel retained colors; no-art never
   described as artwork-derived; other-URI artifacts held as
   candidates without association; current URI only from a ready,
   connected snapshot.
4. **Ownership fences:** music-session changes ownership-only with
   MPD action semantics unchanged; one PaletteSession per MusicSession
   per app instance; useMusic start/stop untouched; subscription only
   via useSyncExternalStore; model.ts/mpd.ts/palette-contract.ts and
   the nine pinned fixtures untouched.
5. **Async/lifecycle:** serialized read + dirty follow-up; commit-time
   guard order; stop closes watcher/context/timers and strands old
   callbacks; bounded 1/2/4/8/10s reattach continuing at cap, reset on
   success; no producer invocation or directory creation anywhere.
6. **Demo/test isolation:** demo never opens a live palette source;
   tests use explicit injected paths; one real temporary-directory
   rename test exists and exercises actual replacement; zero backend
   playback calls asserted; cleanup counts asserted.

Report to `.inbox/tofable/imp002-independent-review-r1.md` with
severity, file:line, trigger/impact and bounded repair direction per
finding; name the reviewed SHA, checks performed and remaining
uncertainty even if clean. Re-review any amended head; an old-head
review never silently covers a new one. Submission via carrier stays
held until your rounds close; RL boundary review and merge follow.
