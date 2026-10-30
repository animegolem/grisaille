# Estate review r1 evidence

Read-only review probes, not project changes or acceptance tests. The nowplayd
probes intentionally assert defective behavior, so their PASS reproduces a bug.
The main letter and per-project appendices define scope and exact heads.

- termviz-probe.rs imports the reviewed color.rs directly; compile with
  `rustc --edition=2024 termviz-probe.rs -o /private/tmp/termviz-review-probe`.
- r20-addendum-probe.ts imports merged Grisaille's decoder and makes in-memory
  fixture mutations. Run with the Code Lead clone's node_modules/.bin/bun.
- rmpc-track-probe.rs is the exact Track struct extracted from the live
  publisher plus serialization of None metadata. Cargo manifest included;
  put in an isolated temporary crate with main.rs and use --offline and a
  scratch --target-dir. It produced rmpc-serialized-track.json.
  rmpc-track-decode-probe.ts reads its original /private/tmp output path;
  update that input path to the preserved JSON if the scratch copy is gone.
- nowplayd-cache-probe.rs is an integration test. nowplayd-worker-probe.rs is
  a test module appended ONLY to the temporary copy's src/main.rs. To rerun,
  use a scratch source copy at e4de29d, install these two probe files there,
  then run the exact command in the nowplayd report. Never append in an owner
  checkout. Both test servers/directories are isolated from actual MPD/cache.
- color-core-sweep.rs and color-core-centroid-probe.rs import the reviewed
  core source; compile with rustc --edition=2021 -O to a scratch executable.

Source hashes below identify inspected versions, particularly the LIVE dirty
RMPC source. Future edits require rechecking applicability. No artifact here
is a genuine producer capture or native/terminal acceptance result.
