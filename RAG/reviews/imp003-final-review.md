# IMP003 final review — accepted and merged

Review Lead: notan. Reviewed: 2026-10-10 (UTC). Verdict: **accepted**.

- Submitted head: `90c900057062f3df702124068131097cc6d2fbee` (imp/003, one
  atomic commit rebased onto `bc436b0`; drift from the ruled base chain was
  correspondence/RAG-only, verified).
- Merge commit on main recorded in this commit's parent; closure in this
  commit. Carrier event `c38c0a5cb13cfe7f` exact-event ACKed; payload SHA256
  `4298edc3…` byte-identical across immutable, live and durable copies.
- Review chain: independent r1 at `d54d055` (no P1/P2; one P3 — the
  private-state mtime wording was an inference, not a measurement) →
  evidence-only amendment in the reviewer's wording, guard declined to keep
  the delta pure → independent r2 CLEAR at `90c9000`, runtime byte-identical
  (`cad391b2`), range-diff confirmed ticket prose only.
- In-sitting rulings honored (verified at this review): R1 placeholder
  overlay with IME first-pre-edit hide + latch + blur reset; R2 precedence
  table and 4.5/3.0 floors with marker re-checked on the winning background;
  R3 pure mapping core (retained-only consumption) with fail-closed probe
  and NavigationLog isolation; R4 composite tuples including the corrected
  hardcoded (#7c86ff, 89/255, input background); honest timing bounds with
  "bridge latency" appearing only as the unmeasurable thing it is.

## What this review verified independently in canonical

- Topology: exactly one implementation commit; 16 files, +5397/−254;
  frozen boundaries (model, mpd, decoder, IMP002's palette-session and
  palette-file sources, pinned fixtures) zero-diff.
- Full gate at the merged head: typecheck PASS; **155 pass / 0 fail / 1048
  expect calls across 17 files**; build; macOS packaging PASS.
- Validators 27/0/0 whole-tree and 1/0/0 changed; **INDEX regenerated
  byte-identical**.
- Stability record: the reviewer-observed intermittent timeout in
  palette-file.test.ts:283 (one occurrence, 154/1/1044, rerun clean, no
  source change, cause unresolved) did NOT reproduce at this review's gate
  (0 of 1 attempts). Standing rule: recurrence opens its own small ticket
  against the IMP002 watcher seam; the observation stays in the ledger.

## Honesty carried forward

The native automation overall report remains FAILED (late getTree timeout)
and no complete native-script pass is claimed anywhere; pinned OS IME/blur
evidence stands separately. The CUA incident record states exactly what was
observed (post-launch mtime; no before baseline; content equality and
attribution unproved) and the no-restoration ruling stands. Four pinned
GPUIX 0.7 limitations are recorded (placeholder hardcode, simulate_click
double_lease_panic, hardcoded selection wash, no native timestamp) as
material for one consolidated upstream report, owner's call.
PROTOTYPE.md:265-266 corrected by this review per the IMP003 evidence.
Terminal gradient limitation remains explicitly open. Genuine-producer
conformance remains with IMP019; host visual acceptance remains the owner's.

## Post-merge

Ticket AI-IMP-003 completed by this review (reserved fields). Ledger
updated; lease closed. Ref cleanup (imp/003 in clone and canonical,
review/imp003) executed as RL-only per fence, coordinated below.
