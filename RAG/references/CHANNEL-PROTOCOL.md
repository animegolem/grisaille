> Illustrative artifact: a FILLED-IN channel protocol for the same
> fictional instance as the other references (gridnote, channel
> `.relay/`, prefix `wave/`). `templates/PROTOCOL-TEMPLATE.md` is
> the portable skeleton and the canonical home of the
> destructive-op fence; this shows one instance's choices. The
> original this was tumbled from carried two dated correction
> headers — protocol text drifts, and dated corrections in place
> are how an instance stays honest about it.

# .relay/ channel protocol — Code Lead ⇄ Review Lead

> The two clocks: the Code Lead's 15-min poll is the only timer in
> the system; the Review Lead's side is edge-triggered files (a
> hash-watch injects inbox changes into the next active turn), not
> a daemon.

Local, gitignored hand-off channel. Three surfaces:

| Path | Writer | Reader | Purpose |
|---|---|---|---|
| `triage-report.md` | Code Lead | Review Lead (hash-watch) | Ambient CI/PR triage findings |
| `inbox/<id>.md` | Code Lead | Review Lead (hash-watch) | Work submissions for review |
| `outbox/<id>.md` | Review Lead | Code Lead (poll) | Verdicts: accept / amend / decline |

## Work submissions (Code Lead → inbox)

When doing implementation work: work in your isolated clone,
commit on a branch named `wave/<id>`, do NOT push, and submit by
writing `inbox/<id>.md`:

```markdown
---
submission: <kebab-case-id>
branch: wave/<id>
commit: <sha of the branch tip to review>
round: 1
---

What was done and why; validation commands run and their results;
files touched. Candid friction notes welcome.
```

Rules: `<id>` is stable across rounds (same file, same branch).
Bump `round` on each resubmission. Keep the body under ~4000
chars. Do not touch `TICKETS/` beyond a ticket you were explicitly
assigned; never edit `TICKETS/INDEX.md` or the human-testing
queue.

## Verdicts (Review Lead → outbox)

The Review Lead reviews the branch diff (fetching from the clone
path) and answers with `outbox/<id>.md`, archived then overwritten
wholesale each round:

```markdown
---
submission: <same id>
verdict: accepted | amend | declined
branch: wave/<id>
commit: <sha reviewed>
round: <matches the inbox round it answers>
reviewed: <YYYY-MM-DD>
---

## Notes
Rationale. If accepted: the merge commit on main. If declined: why,
and whether a different approach would be welcome.

## Amendments
(Only when verdict is `amend`.) Numbered, actionable instructions.
Fix them on the SAME branch, update `commit` and bump `round` in the
inbox file, and resubmit by rewriting it — the hash change notifies
the Review Lead.
```

Semantics on the Code Lead's side:

- **accepted** — the Review Lead has merged to main. Do NOT clean
  up: the destructive-op fence applies even now — the Review Lead
  owns worktree/branch removal. Archive the id's inbox and outbox
  files (`archive/<id>-inbox-r<N>.md`,
  `archive/<id>-outbox-r<N>.md`) and stop tracking it.
- **amend** — apply the numbered amendments, resubmit (same id,
  round+1). Do not start unrelated work in the same submission.
- **declined** — stop work on that branch; do not resubmit the
  same approach. Notes say whether to try differently.
- **No outbox file yet** — review pending; keep polling, do
  nothing.

Match rounds: only act on an outbox file whose `round` equals your
latest inbox `round`; an older round means the Review Lead hasn't
seen your resubmission yet.

## Peer consultation lane (dated adoption — the fictional
## instance took it verbatim from PROTOCOL-TEMPLATE.md)

Same carrier, second lane: `type: consultation` frontmatter,
stable topic id, numbered rounds, no branch/commit. Advisory only
— a conclusion binds when the responsible authority records it in
the constitution/protocol/ticket, never by consensus in the lane.
Close `settled` or `parked` with an honest summary; archive
superseded rounds under the standard names; STOP fences govern
even in silence. gridnote's instance note: its first consultation
(a review-loop design) produced a better grammar than either lead
drafted alone, and rule 4 is what kept that win from becoming an
unratified law.

## Carrier (instance adoption)

gridnote runs the shipped `carrier.py` in shadow: the Review
Lead's watcher syncs every pass, both leads ack-file as part of
their processing rituals, and `carrier status` is the first
command either lead (or the owner) runs when the channel feels
quiet. Adopted only after the four-test drill — whose T4 found a
real age-loss bug on first run, fixed before cutover. One
permanent fixture remains pending forever as the
superseded-write monument.

## Notice harness (instance choices)

Whole-inbox path-tuple fingerprint + quiet second sample on the
Review Lead's hook; the Code Lead waits in-task for expected
verdicts and keeps a supervised external watch for idle wakes.
No delivery receiver in this instance. If one is adopted it follows
PROTOCOL-TEMPLATE.md's carrier-event floor: detector never invokes a
model; tokenized per-topic claims; exact confirm immediately before
injection; bounded delivery; history-first recovery; worker never
writes application ACK; semantic heartbeat/status; full fault matrix
before any install or incumbent-ear change.

## Before reporting test failures: BUILD FIRST

`dist/` is gitignored and workspace packages resolve through it —
a fresh or stale checkout ALWAYS fails the unit runner with
missing-export errors that look like real regressions. Build all
workspace packages before any test run; only report failures that
survive a clean build. (In the source instance, two review rounds
in a row reported this stale-dist artifact as a P0/P1 — both
disproved. The rule earned its place.)

## Triage report

`triage-report.md`: overwrite wholesale ONLY when there is
something new (fresh CI failure, actionable review feedback,
PR/issue action taken). Identical content = same hash = no
notice — never add per-run timestamps or "nothing to report"
churn. Under ~6000 chars; link to runs/PRs instead of inlining
logs. This whole directory is gitignored; never commit anything in
`.relay/`.

<!-- 2026-08-08 addition: git clean -x/-fdx banned in the canonical
root (gitignored .workspaces/ would be erased); workspace cleanup is
Review Lead-only, one resolved descendant at a time. -->
## Destructive-op fence (dated ruling — see PROTOCOL-TEMPLATE.md
## for the canonical text)

- The Code Lead NEVER deletes worktrees, branches, tags, or refs —
  not even its own, not even after an accepted verdict. The REVIEW
  LEAD owns all cleanup (worktree remove, branch deletion, `ci/*`
  teardown).
- No git command targets anything outside the sitting's own clone
  directory. No `-D`, `--force` deletion forms, `update-ref`,
  `reflog expire`, or `gc` anywhere, ever.
- Rationale: the fence was written when sittings shared the
  canonical repo's `.git` via worktrees, where a destructive op
  could reach shared history. Isolated clones have since replaced
  worktrees at a sitting boundary; the fence applies regardless —
  it costs nothing and covers the next regression.

## Sitting economics (dated owner ruling on a provider-window quirk)

The provider window observed here did NOT kill an ACTIVE task — an
unbroken task rolled onto the longer quota and kept running — but
a STOPPED agent never resumed. Generalize or delete as your
provider dictates. Therefore, in this instance:

- Briefs assign EXTENDED BATCHES (ticket ranges / whole epics),
  not single tickets — the sitting should never run dry of
  authorized work while healthy.
- The Code Lead never ends its turn to wait: while a verdict is
  pending, hold an ACTIVE loop (poll `.relay/outbox`; use the wait
  for read-only prep on the NEXT ticket in range — census, test
  fixtures, nothing that presumes the ruling).
- The Review Lead treats verdict latency as the top-priority
  interrupt: a submission answered fast keeps the sitting alive;
  one answered slow may kill it for the week.
- Plan reviews so the batch is fully VERDICT-COVERED before the
  window's natural end — front-load the round-1 review, one big
  submission round, no optional mid-sitting round-trips.
