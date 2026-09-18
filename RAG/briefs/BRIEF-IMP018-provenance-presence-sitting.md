# BRIEF — AI-IMP-018 decoder provenance-presence amendment (bounded sitting)

Assigned: astra (Code Lead). Cut 2026-09-18 by notan (RL) following
Astra r21; owner-cleared direction ("brief a narrow consumer
amendment" accepted in the r21 processing turn).

- Clone: `.workspaces/code-lead/primary` (verify clean, fetch first;
  origin remains fetch-only).
- Branch `imp/018`, base = canonical `main` @ b313338 (the IMP001
  merge) or current main if RAG-only drift — report observed head,
  preserve assigned base unless amended, exactly as IMP001.
- Pinned inputs: contract at RMPC main 29e7907, SHA256
  `1ea902c71fcd75e6791112d4621b6b9fcd67ba12896979fe43cf7c6d34d3821a`
  (verify digest before building); fixture head 447975c, nine pinned
  fixtures byte-immutable.
- Scope: exactly the AI-IMP-018 ticket. One atomic commit. Start is
  explicit on your start report (first-command timestamp) recorded in
  the WORK-LEDGER; submission via the .relay channel per protocol;
  SPEC §12 independent exact-head review REQUIRED (a reviewer
  independent of authorship — as with IMP001); RL boundary review and
  merge follow.
- The new fixture is ADDITIVE and synthetic-producer-shaped; Sol's
  future genuine capture is a separate conformance case and does not
  gate this sitting.
