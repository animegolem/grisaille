# Codex runtime setup

Use this reference only when one of the two lead seats runs in Codex. “Codex”
is the product/runtime name used here; GPT is the underlying model family. The
hooks and `codex exec resume` interface are Codex-specific, so naming these
resources GPT would obscure the actual dependency.

## Contents

1. Runtime shape
2. Event-driven relay wake
3. Git-backed turn memory
4. Optional Computer History delta
5. Installation sequence
6. Adoption drills and limits

## 1. Runtime shape

Codex needs two independent mechanisms:

- **Relay wake:** a filesystem event tells launchd to run one bounded helper,
  which syncs the carrier and resumes a specific Codex task with a fixed prompt.
- **Turn memory:** Codex lifecycle hooks snapshot exact user/assistant fields,
  then a detached one-shot worker writes the exchange to a dedicated Git repo.
- **Activity delta (optional):** a `UserPromptSubmit` hook projects a small,
  per-task delta from the owner's already-allowlisted Computer History stream.

Neither mechanism owns project truth. The carrier ledger owns delivery state;
the recipient's digest ACK owns application completion. The constitution,
tickets, decisions, work ledger, and session handoff own durable project state.
Turn memory is conversational recall and an index into exact exchanges.

## 2. Event-driven relay wake

The default Codex ear is `scripts/codex-relay-wake.py` instantiated through
`templates/CODEX-RELAY-WAKE.plist`. It is intentionally not the long-running
Phase-C polling detector:

```text
channel write
  -> macOS filesystem event (launchd WatchPaths)
  -> one-shot quiet fingerprint
  -> durable pending marker
  -> bounded carrier sync + status
  -> codex-app-server-bell.mjs: thread/resume + turn/start "scan the channel"
     (over the managed `codex app-server` WebSocket; `codex exec resume` is the older fallback)
  -> resumed Codex scans, reads, archives, and digest-ACKs
  -> bounded carrier sync + status
  -> retire intent only when carrier reports zero unACKed events
```

The helper fingerprints sorted `(relative path, SHA-256)` rows. It never
concatenates message bodies and never places them on the Codex command line. A
second matching sample prevents a mid-write wake. The pending marker is written
before delivery. Carrier and Codex subprocesses have separate hard timeouts; a
timeout terminates and then kills the helper-owned child process group. A
nonzero exit, timeout, or successful Codex exit without the application ACK
leaves the intent in place. Exponential retry state is durable, and launchd's
`KeepAlive.SuccessfulExit=false` supplies new one-shot invocations without a
resident poll loop. `RunAtLoad` recovers pending work after login.

`health.json` records the last detector sample, carrier pending count, delivery
attempt timing/outcome, consecutive failures, and next retry. It is the health
surface; a PID or launchd exit zero is not proof of health. The helper state
contains hashes and timings only—never message bodies or authority. Set
`CARRIER_STATE_DIR` explicitly through `--carrier-state-dir`; otherwise a direct
carrier invocation can inspect a different ledger namespace than the project
wrapper.

The shipped `carrier-receiver.py` remains the heavier app-server Phase-C option
when an installation needs target claims and history-first app-server recovery.
For a single stable task ID on macOS, the CLI ear is simpler and is the default.

The fixed prompt must point the resumed task at an installed scan ritual. A
typical task instruction is:

```text
On “scan the channel”, run carrier sync and status, sweep every Markdown file
in the inbound directory, reconcile the work ledger, read/archive every new
version, and digest-ACK only after reading. A quiet wake means only “no new or
unread carrier event after the scan,” never “nothing pending.”
```

## 3. Git-backed turn memory

Codex command hooks are synchronous; the `async` field is parsed but not
supported. Therefore the Stop hook must not call a model or Git commit inline.
The shipped `scripts/codex-memory.py` uses four commands:

- `capture`: `UserPromptSubmit`; atomically stages stable `prompt`, session, and
  turn fields.
- `stop`: pairs the staged prompt with stable `last_assistant_message`, skips
  notification/relay-only prompts, queues an exact record, and detaches `drain`.
- `drain`: serializes the memory repo, asks a configured small Codex model for
  one commit subject, writes exact JSON, and commits once per exchange.
- `inject`: `SessionStart`; returns the latest handoff plus a bounded recent
  `git log` tail as `additionalContext`.

The transcript path is deliberately not parsed because Codex documents its
format as unstable. Exact exchange files use stable hook fields instead.

Set `MEMLOG_MODEL` to the installation's inexpensive, fast Codex model. Model
names evolve, so the portable template uses `{{SMALL_CODEX_MODEL}}` rather than
freezing a global default. `MEMLOG_SUMMARIZER_CMD` may instead name any trusted
stdin-to-one-line command. If neither is configured or the model fails, the
worker uses a deterministic prompt excerpt; the exact exchange is still saved.
The summarizer runs with `CODEX_MEMORY_GUARD=1`, and the Codex path is ephemeral,
read-only, and rule-free to minimize recursive or project-mutating behavior.

Full recall remains ordinary Git:

```bash
git -C "$MEMLOG_DIR" log --oneline --all
git -C "$MEMLOG_DIR" show <commit>
```

Do not enable Codex native generated memories at the same time during initial
adoption. Establish one understandable memory substrate, drill it, and compare
later if native memory offers a clear additional benefit.

## 4. Optional Computer History delta

`scripts/computer_history_projector.py` produces a runtime-neutral activity
pulse, and `scripts/computer-history-delta.py` adapts it to Codex
`UserPromptSubmit`. Together they give a returning task a bounded hint about
what changed while it was idle. It is orientation, not memory or project truth:

```text
allowlisted Computer History JSONL
  -> stable app/window metadata only
  -> consecutive events coalesced into activity episodes
  -> current return-to-Codex tail removed
  -> newest six episodes fitted to a character budget
  -> UserPromptSubmit.additionalContext
```

The helper never reads accessibility text, typed text, URLs, or mouse targets.
Even app and window labels are wrapped as **untrusted observation** because a
page or application can choose its own title. The projection grants no
authority and must never be interpreted as a user instruction or permission.
It does not change the Computer History allowlist or observation settings.

State is keyed by Codex `session_id`, so two tasks do not consume one another's
deltas; the adapter maps that identifier onto the projector's neutral
`consumer_id`. Each successful helper invocation writes an inspectable atomic manifest
containing the examined cursor, bounded episodes, and context digest. The
cursor means "examined by a successful hook helper," while the digest identifies
any context it offered; neither proves that a downstream model retained the
context. Missing roots, malformed JSONL records, absent session
IDs, corrupt cursor state, and failed state publication all return without
blocking the user's prompt. Corrupt cursor state is preserved for inspection
rather than silently reset. Episode start/end fields mean first/last observation
inside that delta, not proof that an application activity began at the cursor.
The private state directory grows one small manifest per Codex session and has
no automatic garbage collector; retirement is an operator housekeeping choice.

The template discovers the current macOS Computer History root. Set
`COMPUTER_HISTORY_ROOT` when discovery is inappropriate or pass `--event-root`
for fixtures. The default first observation looks back thirty minutes; later
calls advance from the per-session cursor. `--max-episodes` and `--max-bytes`
bound prompt cost independently of raw event volume (`--max-chars` remains a
legacy alias, but enforcement is over serialized UTF-8 bytes).

The neutral CLI accepts `pulse <state-dir>` and a JSON object containing
`consumer_id`; it returns a projection envelope with `projection_type`, source,
trust, context, and manifest fields but no runtime hook shape. This is the
cross-runtime seam. The Codex adapter accepts the native `session_id` payload
and emits `UserPromptSubmit.additionalContext`. A summary-rich activity horizon
at startup/clear is a complementary grain, not a reason to import generated
summary prose into every prompt pulse.

The `context` string is deliberately self-labeling. An adapter MUST transmit it
whole or not at all: it must never select fields à la carte or re-render episode
data in a way that could shed the embedded untrusted-observation envelope.

## 5. Installation sequence

1. Copy the skill's scripts/templates into the ticket tree as usual.
2. Choose a dedicated memory directory outside the project, a handoff directory
   inside the ticket tree, and—if enabling activity deltas—a private state
   directory outside the project for per-session cursor manifests.
3. Copy `templates/CODEX-HOOKS.json`, replace every placeholder, and **merge its
   event groups** into the active user or project `hooks.json`. Never overwrite
   unrelated hooks. Review/trust the resulting hook definitions through Codex's
   hook UI.
4. Run `codex-memory.py capture`, `stop`, `drain`, and `inject` with fixture
   payloads before relying on them. Confirm one exact exchange and one commit.
   If enabling activity deltas, run `computer-history-delta.py inject` twice
   against fixture JSONL and confirm the first call emits a bounded untrusted
   block while the second is silent.
5. Copy and instantiate `templates/CODEX-RELAY-WAKE.plist`. The task ID is an
   operational binding: update and reload the plist when responsibility moves.
   Fill `CODEX_COMMAND` with the absolute authenticated Codex CLI path and give
   launchd explicit `HOME` and `PATH` values; it does not inherit the invoking
   terminal's shell environment.
6. Before loading the agent, run the helper with `--probe`. This performs the
   real carrier sync/status and filesystem sample without waking Codex. If its
   carrier pending count is zero, copy the reported fingerprint into an explicit
   `--prime --expect-fingerprint <sha256>` invocation. Prime refuses a changed
   fingerprint or pending carrier work; there is no implicit baseline.
7. Load the LaunchAgent only with explicit operator authorization. This skill
   ships configuration but never installs or starts a live service itself. Keep
   the manual ear until one ordinary message is read and digest-ACKed through
   the installed route.

## 6. Adoption drills and limits

Run the isolated helper tests first:

```bash
python3 TICKETS/scripts/test-codex-runtime.py
```

Then prove these in the target repository:

- one normal Fable -> Codex -> Fable round trip;
- a same-path overwrite creates a new fingerprint and a new wake;
- a partial write does not wake until the quiet sample settles;
- forced carrier failure retains pending state and retries;
- hung carrier and Codex children are terminated at their configured bounds;
- forced `codex exec resume` failure retains pending state and retries;
- Codex exit zero without an application ACK remains pending;
- an ACK arriving during delivery retires the intent exactly once;
- content changed during delivery creates a fresh pending fingerprint;
- login/reload with a pending marker recovers;
- unchanged content does not redeliver;
- the resumed task reads before digest-ACK;
- the relay helper itself never writes an application ACK;
- a deliberate Codex clear/resume injects handoff + log tail, while old exact
  content remains retrievable through Git.
- two Codex session IDs receive independent Computer History deltas;
- repeated activity injection is silent until a new meaningful episode exists;
- the current return-to-Codex tail and all accessibility/input payloads are
  absent from injected context;
- missing, malformed, or unwritable activity sources/state fail open without
  consuming the owner's prompt.

The LaunchAgent is bound to one Codex task ID. It is not a generic dispatcher.
The wake mechanism grants no implementation authority: tickets, briefs, ADRs,
the protocol, and the work ledger remain authoritative.
