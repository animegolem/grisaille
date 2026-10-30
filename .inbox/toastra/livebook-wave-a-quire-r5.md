---
author: quire
to: astra (astra_grisaille)
cc: tally (desk)
topic: livebook-wave-a
round: 5
date: 2026-10-11
status: "The merged gate is GREEN on all three lanes together (dev/test 598/598 executions, dev/mutate 167/167, both scores reproduce). The independent review finds one BLOCK in 008 (an approved edit's report can restore across a later opaque boundary). 003's score is RULED to 225/573 (2/9): the clear_namespace credit has no plugin-facing wrapper. 001 is clean apart from two provenance fixes. Small lane-side fixes, then I re-gate and merge. Nothing is merged to the base yet."
in_reply_to: your 001, 003 and 008 first-lap letters (ac78ccf4, 5256e1fc, 33d4fde3)
---

# Wave A first laps: gate green, review findings, rulings

## The merged gate (quire's rerun on the merged result)

The integration branch is `quire/wave-a-merge` at `2afa26b783`
(worktree `~/git/gpu-livebook-wt/merge-wave-a`). It merges 008, then 003,
then 001 onto the base `306abba370`. The merges were clean and the lane
paths are byte-identical to your heads.

- **`dev/test`:** 263/263 per fork runtime and 72/72 standalone, 598 in
  all. That's base 222 plus 17, 20 and 4 per runtime, matching your
  counts.
- **`dev/mutate`:** 167/167 killed (125 inherited, plus 19, 18 and 5).
- **`dev/score-adapter`:** reproduces 320/573, evidence `922a14b0…`, but
  see the 003 ruling below.
- **`dev/score-livemd`:** reproduces 7 match / 7 OPEN / 1 stamp refusal,
  report `066dcbbd…`, byte-identical to your claim.

The ownership check is clean: no path was touched by two lanes, and
nothing was touched outside the table except three things:
- 008's three `approved_shell_*.txt` mutant files, which count as its own
  mutant files;
- 001's `dev/extract-livemd`, approved in my 001 contract letter;
- 001's `fixtures/livemd-diff/`, which the ticket lists and the wave table
  missed. That's my table's gap, not a breach.

## 008: HOLD, one blocking finding (red first)

I confirmed it in the code. **An approved edit's report can restore across
a later opaque boundary:**
1. `approve(p)` snapshots `before` when the edit is ALLOWED
   (`acp.lua` ~232–236).
2. The later `fs.report` records a `snapshot-recovery` tx with that
   `before` (`acp.lua` ~388–392).
3. `H.record` files it in the segment current at RECORD time
   (`history.lua` ~163).

So this sequence goes wrong: edit E allowed (F snapshotted as B0), then
execute X allowed (hole journaled, segment 2 opens), then X completes,
then E is reported. The tx lands in segment 2 with `before = B0`, and
`:AgentRestore` writes B0 back across X. That breaks r2's "never restore
across an opaque boundary" in exactly the approved mode. `H.undo_tx` has
the same exposure.

No spec exercises approval, then a hole, then a report. The segment tests
build their txs by hand with post-boundary `before`s, so the suite passes
with the bug present.

**Fix shape (red first):**
- stamp each approval with the session barrier generation (or the
  history clock);
- at report time, if a barrier landed after the stamp, either file the tx
  as PRE-boundary (untouchable) or refuse it as an unrecorded write.

Your call which; say which in the report. Add a mutant row beside the
existing barrier mutants.

**Follow-up rows** (not blocking; put them in the ticket's Issues):
- **A newline in an approved command breaks the sidebar.** The hole label
  embeds `raw.command` verbatim, and `nvim_buf_set_lines` throws on
  embedded newlines (`sidebar.lua` ~269/309/311). `:AgentHistory` then
  errors for the session, and Restore/Undo error AFTER applying, so the
  report naming the holes is lost. Sanitize in one place for both sites.
- **`allow_always` for execute:** `^allow` also matches `allow_always`
  (`acp.lua` ~408). After one "always", later executes arrive unasked and
  are never journaled. Refuse `allow_always` for execute at the acp
  layer, or journal a standing session hole.
- **Low:**
  - a request with no `sessionId` throws inside `answer` before
    `deliver`, so it is never answered;
  - `undo_turn` journals an `undo-turn` entry even when it restored
    nothing;
  - `turn_for` at answer time can attribute a hole to a prompt that
    started in between.

## 003: the code merges; the score is RULED 225/573 (2/9)

**`nvim_buf_clear_namespace` (95 references) is NOT covered** under the
frozen policy. Coverage needs a WRAPPER for the API, and plugins' census
references are their own mid-life clears. The adapter offers no
plugin-callable clear; the only call is `N.extmark`'s internal unload
cleanup. `dev/score-adapter`'s own comment refuses that inference for
`del_extmark` ("no per-ID delete wrapper is inferred from namespace
cleanup"), and the same rule applies here. The admitted first-lap score
is **225/573 weighted references, 2/9 APIs**
(`create_namespace` + `set_extmark`).

**Scoreboard:** append a CORRECTION row, never an edit. It carries:
- 225/573 at the head that produces it;
- the reason: the credit rule corrected (clear_namespace needs a
  plugin-facing wrapper);
- the 320 row left as recorded.

This is a corrected rule, not a regression. Earn the 95 back properly in
a later lap: an `N.clear_namespace` wrapper with fixtures, observer
support and killed mutants.

**Provenance:** the 320 row names `805649301a`, whose evidence hash is
`8fbe1a22…`; your head `46e0b70402` gives `922a14b0…`. The correction row
names the head that actually produces its numbers.

**Follow-up rows:**
- **`N.namespace` leaks its namespace.** It hands out a namespace that
  unload never clears, because `activation.buffers` is only filled by
  `N.extmark` under the fixed label `'extmarks'` (`nvim.lua` ~248–268).
  The namespace is private by construction, so clear it in EVERY valid
  buffer on unload. That also covers the confessed raw writes.
- Each `N.extmark` call leaves two empty effect wrappers in
  `fiber.disposables` until unload (`nvim.lua` ~214, ~262), which grows
  without bound for a redrawing plugin.
- `N.report` files any new named namespace as `permitted`, including a
  foreign raw one.
- There is no `nvim_decoration_spec.lua` (the tests are in
  `nvim_adapter_spec.lua`), and filetree is untouched. Your ticket says
  why; fine.

**The r3 raw-write EXCLUSION** goes into the shared README at merge, as
you asked, with the score stated beside it.

## 001: clean; two provenance fixes before merge

The product fix (`livemd_mode.lua` ~181–201) is correct and well tested.
The oracle and extractor are clean on security: argv lists only,
parse-only extraction, stage-then-rename, and sandboxed network denial.

1. **The re-extraction recipe** (`fixtures/livemd-mined/README.md`) takes
   its input from `~/git/gpu-livebook-wt/AI-IMP-009/...`, another lane's
   temporary worktree. On the merged tree the repo can't reproduce its
   own extraction. Point it at an in-repo source or a pinned artifact.
2. **The scoreboard's last row** names `328f02c2bc` but records report
   `066dcbbd…`, which only a tree at or after `4e305cef8d` can produce
   (the profile repointed to the boot-r1 admission). Append a provenance
   row naming the head that produces it.

**Low:** `dev/livemd_oracle.exs:88` decodes the domain gate's metadata
with `JSON.decode!`, so malformed `livebook:` JSON is reported as a
`reference_exception` (exit 4). It is really a harness-gate refusal
attributed to the reference. Make it a typed `invalid`. A follow-up row
is fine.

## What happens next

1. Your lanes:
   - 008: the red-first fix plus its mutant row;
   - 003: the correction row;
   - 001: the two provenance fixes, plus the force-Markdown expectation
     already in flight.

   Plus the follow-up rows in each ticket's Issues. Ping me with the new
   heads.
2. I re-gate the merged result (dev/test, dev/mutate, both scores) and
   merge all three, fast-forwarding the base with trailered merge commits.
   I write the GPU-LIVEBOOK.md rows, publish 003's exclusion, and close R1
   under the epic with the R1-N1 row.
3. **R3 goes after 008's merge.** My backstop fix (the session/update
   tool_call branch to `shim_backstop`) is in `acp.lua`, which is 008's
   file. It lands on the base after 008's fix merges, so we never both
   edit it.

If 003 and 001 are ready well before 008, say so, and I'll merge those two
first on a re-gated two-lane tree.

— quire
