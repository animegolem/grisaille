# BRIEF — AI-IMP-002 transactional palette subscription (bounded sitting)

Assigned: astra (Code Lead). Cut 2026-10-03 by notan (RL) from the
owner-authorized preparation handoff (`.inbox/tofable/imp002-preparation-r1.md`;
report `RAG/reviews/imp002-preparation-2026-10-02.md`, SHA256
`d18b4ecf82247bcc52413b39718eae8e2f55fb0ec8f3d0011ee513b24c718f6d`).
Dispositions D1–D4 in `.inbox/toastra/imp002-preparation-r2.md` are normative
for this sitting.

- Clone: `.workspaces/code-lead/primary` (verify clean, fetch first;
  origin remains fetch-only). Merged branches imp/001 and imp/018 may
  be deleted as fence cleanup before branching.
- Branch `imp/002`, base = canonical `main` @ d41b0875 (the AI-LOG-002
  close) or current main if RAG-only drift — report observed head,
  preserve assigned base unless amended.
- Pinned inputs: ratified contract digest
  `1ea902c71fcd75e6791112d4621b6b9fcd67ba12896979fe43cf7c6d34d3821a`
  (verify before building); fixture head 447975c, nine pinned fixtures
  byte-immutable, tenth additive synthetic fixture per A4. The stored
  capture `fixtures/chromatic-palette-capture.json` (SHA256
  `4cbdfbcede60f99b215affc81c88c93f97e3158c34721bf7b4a61174aa2efe7b`)
  is admissible as a test vector ONLY with its provenance label:
  genuine publisher-path capture of synthetic artwork from a loopback
  MPD fixture — not live owner playback.
- Scope: exactly the AI-IMP-002 ticket as amended 2026-10-03.
  Association is v1 URI association (SPEC §8.2 rev 0.3) — no
  occurrence/current-art freshness claim anywhere in code, tests, docs
  or submission. Retention per the ratified table (report §3).
  Startup/recovery per D2: read/watch only, injected path + documented
  env override + producer XDG default, bounded 1/2/4/8/10s reattach
  continuing at the cap, reset on success, cancelled at stop; never
  create producer directories; demo never opens a live source.
  Evidence: the report's required-observation matrix, deterministic
  fake scheduling plus one real temporary-directory rename test, zero
  backend playback calls asserted, cleanup counts asserted.
- One atomic commit. Start is explicit on your start report
  (first-command timestamp) recorded in the WORK-LEDGER; submission via
  the .relay channel per protocol; SPEC §12 independent exact-head
  review REQUIRED; RL boundary review and merge follow.
- The genuine-capture conformance gate (AI-LOG-002 open item) is a
  SEPARATE brief, run in parallel, and does not gate this sitting's
  start or merge. This sitting claims fixture-level conformance only;
  producer-conformance language waits for that gate. Host color
  mapping remains IMP003.
