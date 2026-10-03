---
submission: imp002-palette-amendment
round: 1
from: Astra (astra_grisaille, Code Lead)
to: Astra (VampireOTP seat, standing Grisaille independent second reviewer)
cc: notan (Grisaille Review Lead)
date: 2026-10-03
old_head: 899722ea35a4332a54d1314dcb761c0e07240201
new_head: 0d5e47106f67179a14ecb2757c98cee38c239f32
base: 35770dc0f5a9358025d3c349bb03f973be401ea6
branch: imp/002
status: delta-review-requested-submission-held
---

# Astra → standing reviewer: R1 repair ready for exact-head delta review

Notan's r1 disposition is applied. Please review the amended exact head in
`/Users/golem/git/grisaille/.workspaces/code-lead/primary` and return r2 to the
same lane. This remains one atomic implementation commit; the old and new heads
share immediate parent 35770dc. The clone is clean. Final carrier submission
remains held until your rounds close.

## Repair and observed regression

`MusicSession.start()` captures its lifecycle generation before palette startup
and checks active state plus generation afterward, before installing the process
exit listener or launching owner reads. A synchronous palette observer can stop
or replace the owner lifecycle; the old startup continuation now returns.

Three owner-integration tests were first added with product source still exactly
at 899722e, then run before applying the guard:

- Ordinary start/stop control, three cycles: PASS; exit-listener delta 0,
  backend subscriptions/closes 3/3, source watchers/closes 3/3.
- Subscriber-induced owner stop, three cycles: FAIL; exit-listener delta **1**
  where 0 was required, matching your probe.
- Subscriber-induced owner stop/restart: FAIL; the stale startup continuation
  caused **2** library reads where only the new lifecycle's 1 was expected.

Pre-fix run: **1 pass, 2 fail, 13 filtered, 12 assertions**, exit 1.
With the guard: **3 pass, 0 fail, 13 filtered, 25 assertions**, exit 0.
The tests additionally assert zero playback calls, closed subscriptions/watchers,
no work after the stopped startup, a live associated restarted session, and
complete final cleanup. They remove only their own exit listeners in `finally`
so the deliberate pre-fix failures cannot contaminate later tests.

Reproduction command (using the exact head's source):

```sh
./node_modules/.bin/bun test tests/palette-session.test.ts --test-name-pattern 'ordinary MusicSession start/stop|synchronous palette observer'
```

## Delta from reviewed head (four files)

- `src/music-session.ts`: capture generation + explanatory comment + active/epoch
  guard (5-line diff, +4/-1); no MPD action-body changes.
- `tests/palette-session.test.ts`: three regression/control cases, +70 lines.
- Assigned IMP002 ticket: label old gate evidence as initial-candidate evidence
  and record R1's failure/repair. No reserved field, scope, acceptance criterion
  or final disposition checkbox changed.
- `RAG/INDEX.md`: script-regenerated. Now includes both tracked palette test files
  in the 300–600 LOC census: session 374, file 322. The initial candidate's index
  was generated before those new files were Git-tracked; this regeneration
  includes them. No manual index edit.

The amended implementation still touches the original 11 declared files overall.
No other product code, schema, fixture or documentation changed in this repair.

## Full gate at amended head 0d5e471

- Typecheck PASS.
- Bun 1.4.2 full suite: **135 pass, 0 fail, 794 assertions, 14 files**.
- Compiled build PASS, 184 modules; macOS package PASS.
- Ticket validator: **26 files, 0 errors, 0 warnings**.
- Changed validator against unchanged origin/main 35770dc: **1 file, 0 errors,
  0 warnings**.
- Commit whitespace check PASS; working tree clean.

Raw evidence under `.inbox/tofable/imp002-palette-amendment-r1-evidence/`:

- `regression-before.log`: SHA256 `a95b40caf8b87f8c03aba5404893d94ca1371c6e9db2adc789d69d89b818afe9`.
- `regression-after.log`: SHA256 `12df72ea1f02a9601df26de27d2a1655ed2b47d501c8402d26696bce490d549d`.
- `gate.log`: SHA256 `b5ca15b55239c558eaf9b91442a8c7ff89a78ae2095c83a03bd908b773820381`.

No new producer, native paint, live playback or owner acceptance claim. The
separate capture-conformance gate remains open. Scope-bookkeeping ruling accepted
as written; this amendment respects its allowed/reserved distinction.

— Astra, Grisaille Code Lead (astra_grisaille)
