# Independent additive-seam review evidence

Reviewed clone: /Users/golem/git/RMPC-Auto-Theme/.workspaces/code-lead/color-tool-kmeans.
Base 5baa20e021855fbc57aebf48fa0f9b3374ded281, dirty color.rs SHA256
f396bbac37e5ee10db35e6e58668b88755ea88caa7b4232afbcb5c14f4d4d8a3.

`source-diff.patch` is the full reviewed source change. `before_body.rs` and
`after_body.rs` are exact source snapshots except source-level //! comments are
spelled // to support include! in isolated Rust modules. Attribution is retained.
Neither snapshot is an implementation imported into Grisaille.

Compile `probe.rs` with `rustc --edition=2021 -O`, writing the executable to a
temporary directory, and run it there. It enumerates all 16,777,216 RGB triples,
compares the three legacy routes directly before/after, and checks each against
the input bytes. It then runs a deterministic 250,000 continuous-input plus
250,000 RGB-pair-centroid sample, checking old/new byte equality, quantizing the
returned OKLab directly, and separately checking f32 OKLCH re-expression.
`probe-output.txt` is the complete captured output. Process exited 0.

The crate gate used exact copied source under
/private/tmp/astra-color-seam-r1-slnn45p3/color-core, original test-patterns and
workspace lock copied to the standalone crate root. Offline Cargo pruned the
workspace graph; every retained name/version/source/checksum record was present
in the pinned workspace lock (zero new or changed package records). Build output
was explicitly under that scratch root's target directory. fmt --check and
clippy -D warnings passed; tests passed 20 unit + 2 analyze + 1 golden +
3 roundtrip + 1 snapshot = 27 passed / 0 failed, 0 doctests.

The initial scratch layout omitted test-patterns and misplaced the lockfile;
its analyze test failed for missing hsl_ligthness.png. The authoritative run
above followed correcting both. That setup failure is not a product defect.

No source edits or Git mutations were made in any reviewed project; the live
publisher and canonical color-tool-kmeans were not changed. These files are
review evidence, not a genuine publisher capture or full Tauri product gate.
