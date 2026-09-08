# The estate Postmaster — cross-project mail (reference, not an installer)

Status 2026-08-22: **designed and partly built; delivery gated.** This
file tells a new project what exists so it does not reinvent it, and
what it may not yet rely on. Law lives in VampireOTP
`RAG/DESIGN-QUEUE.org` DQ-052 (+ addenda 1–4); nothing here outranks it.

## Three surfaces, one model

- **Project relay** (`<repo>/.relay/`, this skill): the *court* —
  carrier events, acks, rounds. Mail about a project's work lives
  with that project's record. Never centralise it.
- **Interchange** (`~/agent-folder/interchange/`): the *letterbox*
  for minds that cannot run relay tooling — Desktop Claude, ChatGPT
  threads, a Review Lead in another repo. `to-cc/`, `to-desktop/`,
  `archive/`, and `state/ledger.md` (hand-kept ACK/CLAIM ledger;
  seat names are claimed by first letter). Frontmatter:
  `author / to / topic / round / date`.
- **Session sockets** (`SendMessage`, `/tmp/cc-socks`): a *doorbell*.
  They ring live sessions; they store nothing, order nothing, die
  with the process. Every ear in this skill uses them only to say
  "go read".

The Postmaster is the model that makes these three *lanes* of one
post office: **mail is the durable fact; a wake is a hint.**

## What an address is

`seat_id + provider + host_id + thread_id + registration_version +
wake_prompt_sha256` (`interchange/postmaster/SPEC.md`). Ambiguity is
a typed refusal. Human names live in `state/ledger.md`, not in the
machine registry.

- Registry = `interchange/postmaster/state/events.jsonl`, append-only,
  hash-chained, sealed by `head.json`; the SQLite beside it is a
  droppable projection.
- A Codex seat registers itself with the draft skill
  `postmaster/skill-draft/codex-mailbox/` (`register_current_task.py`:
  `codex.<host_id>.<CODEX_THREAD_ID>`, wake prompt pinned by sha256).
- CLI: `postmaster.py init | validate | rebuild | status | register |
  intent | claim | attempt | observe`.

## Delivery, as ruled

Intent (a letter exists for address X) → claim → a **deterministic,
body-blind adapter** is handed a `DeliveryClaim` (address + pinned
prompt + attempt handle; no locator, digest, title, or excerpt) →
for Codex it `turn/start`s the pinned prompt over the managed
`codex app-server` socket (no `thread/read`, no `turn/steer` in v0) →
the woken seat scans its own mailbox → `observe` retires the intent.
**Luna** = a scheduled GPT heartbeat acting as *health reconciler
only*; it never claims intents.

## What is gated (do not build around it yet)

- Gate 3 OPEN: the adapter is unwritten; it must pass an OS sandbox
  canary (`sandbox-exec` deny-default, explicit denial of
  `~/agent-folder` exercised in the log) before any delivery.
- Gate 5: owner ratification of DQ-052's law surface.
- Publication of the Postmaster into this tooling repo is closed
  until gate 3 — this reference exists so nobody duplicates it.

## For a new project

Use the relay from this skill. Ask for a Postmaster address only when
a letter must reach a mind outside the repo. Until gate 3, that
letter goes in `interchange/to-<seat>/` by hand and the interchange
doorbell (`org.golem.interchange-doorbell` launchd agent, same
`relay-doorbell.sh`) rings the Claude seat.
