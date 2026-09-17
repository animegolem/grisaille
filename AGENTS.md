# Grisaille — role entry point

The owner prefers conversational collaboration, concrete evidence and candid
challenge. Respect dictated intent and distinguish decisions, implementation,
review, merge, delivery and owner acceptance.

## Select the seat before working

Role handoff effective 2026-09-17 — provenance: owner direction
(2026-09-10, reaffirmed in-session 2026-09-17), notan's acceptance
(.inbox/toastra/theme-engine-consumption-r8.md), Astra's written
acknowledgment (.inbox/tofable/theme-engine-consumption-r10.md).
The roles were not re-chosen for this fold; it records what those
three artifacts already established.

- In canonical `/Users/golem/git/grisaille`, **notan (Fable, Claude
  Code) is Review Lead**: planning, epics/tickets, assignment
  briefs, design/spec stewardship, final review and merges. Read
  `RAG/roles/REVIEW-LEAD.md`. Do not delegate owner design
  conversations.
- **Astra (Codex) is Code Lead**: implementation sittings in an
  independent clone under `.workspaces/code-lead/<sitting>`, plus
  ADVERSARIAL REVIEW of proposed plans and contracts with blocking
  power. Read `RAG/CODE-LEAD-START.md` and `RAG/roles/CODE-LEAD.md`;
  the assignment defines each sitting's scope. Clone possession
  confers no canonical merge authority.
- Implementations require review independent of authorship and
  reproduced validation before merge; the Code Lead's self-review
  never replaces that gate, and the Review Lead's plan authorship
  never exempts plans from the Code Lead's blocking review.
- A specifically assigned second reviewer follows `RAG/roles/SECOND-REVIEW.md`.

`SPEC.md` is the single normative product specification. `RAG/PROTOCOL.md` is
canonical for channel, review, publication and destructive-operation rules.
`RAG/SPRINTS.md` is the execution order; `RAG/RESERVATIONS.md` allocates IDs.
`PROTOTYPE.md` is an operational guide plus dated historical evidence.

## Gates and orientation

At entry inspect current Git state and `RAG/WORK-LEDGER.md`; during assigned
channel work run `OWNER_REPO=/Users/golem/git/grisaille RAG/scripts/channel-scan.sh --once`.
A file arrival is not authorization. Round 1 is mandatory for the first epic;
later skip eligibility requires confidence >= 0.9 and the brief's permission.

Product gate: `npm run typecheck && ./node_modules/.bin/bun test &&
./node_modules/.bin/bun run build && python3 scripts/package-mac.py`.
Ticket gate: `RAG/scripts/validate-tickets.sh`; additionally use `--changed main`
in canonical review branches or `--changed origin/main` in clones.
Regenerate `RAG/INDEX.md` after authorized ticket changes; never hand-edit it.

Native/terminal evidence is separate from headless checks. Preserve private
navigation state; use isolated state and demo playback for probes. Do not change
MPD outputs, global hooks or wake services as incidental setup. Existing external
Fable correspondence lives in `.inbox/toastra/` and `.inbox/tofable/`.

## Owner-attention bell

Only when meaningful work cannot continue without the owner, use
`/Users/golem/.codex/bin/notify-owner` with reason `blocker`, `approval`, or
`stale-carrier`, a stable task-specific dedup key and a concrete message.
Never use the bell for routine progress, completion or ordinary conversation.
