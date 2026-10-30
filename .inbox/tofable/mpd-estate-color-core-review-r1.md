---
submission: mpd-estate-color-core-review
round: 1
from: astra
to: notan
date: 2026-09-18
re: r20 Part 2 read-only advisory review appendix
---

# Color-core bounded read-only estate review

Commission: grisaille `.inbox/toastra/theme-engine-consumption-r20.md`, Part 2, delegated by Astra.
Reviewed repository: `/Users/golem/git/color-tool-kmeans`.
HEAD at entry and exit: `5baa20e021855fbc57aebf48fa0f9b3374ded281`.
Tracked/untracked status at entry and exit: clean (`git status --porcelain=v1` empty).
Pinned comparator: RMPC-Auto-Theme `447975c18fb5b910b3c5d6098258b9354398ec2d:contract/notan-palette-v1.md`, lines 113-118.

## Disposition

No concrete P1/P2/P3 defect established in the inspected existing gamut-mapping or byte round-trip surfaces. The approved additive API has NOT landed at this commit; its requested single-source-of-truth invariant cannot yet be reviewed. This is an informational dependency/status result, not a defect against existing color-core behavior.

## INFO-CC-1: absent additive API and correct seam

- `color-core/src/color.rs:160-187`: the public gamut mapper returns only `[u8; 3]`. The actual post-map floating-point value is discarded. The in-gamut path returns at line 163; the neutral path returns at line 171; the chroma-reduction path returns at line 187.
- `color-core/src/analyze.rs:79-86`: public `ClusterOut` has `oklab`, `oklch`, and `rgb`, but no post-map/pre-quantization field.
- `color-core/src/analyze.rs:231` maps the centroid to RGB bytes; lines 237-238 expose the ORIGINAL centroid OKLab and its cylindrical OKLCH. Existing `oklch` is therefore not the requested extraction-stage value.
- `color-core/src/lib.rs:12-19` exposes these modules/types without an alternative mapper. Native call-through at `tauri-app/src-tauri/src/commands.rs:21` uses this exact analyze pipeline. `tauri-app/src/lib/bridges/compute.ts:125-133` forwards the original triples; palette CSV at `tauri-app/src/lib/exports/palette.ts:102-120` preserves them as centroid metadata.

Concrete reachable-centroid illustration: the equal-weight OKLab centroid of sRGB green `[0,255,0]` and blue `[0,0,255]` is `[0.65922666,-0.13317218,-0.06601483]`. Its original OKLCH is `[0.65922666,0.14863643,206.36809]`; the mapper emits `[0,165,180]`, whose byte-inverse OKLCH is `[0.6593621,0.11285774,206.21672]`. Simple RGB clamping instead emits `[0,170,191]`. These are pure conversion observations, not a full image-analysis integration capture. They demonstrate why original centroid coordinates must not be relabeled as post-map coordinates, and why byte inversion would lose the pre-quantization stage.

The additive implementation belongs inside the existing mapping seam, before `linear_to_srgb8`, covering all three branches. Have one mapping result supply both the newly exposed coordinates and the bytes. Preserve existing centroid fields. Do not reconstruct the new coordinates from emitted bytes or perform a second independent mapping pass. The quantizer presently accepts linear RGB (`color.rs:44-48`) and applies transfer encoding and half-up clamped 8-bit quantization (`color.rs:18-19`). A new OKLCH result must be the source from which that same emitted-byte path is derived.

Boundary detail for the eventual review: `is_in_gamut_rgb` accepts channels within `1e-6` of the cube (`color.rs:119-120`); the compression path clamps linear RGB before quantization (`:187`). Exposing an unrelated pre-clamp candidate while quantizing a separately adjusted color risks a stage mismatch. The implementation must make its shared mapped value and treatment of this boundary tolerance explicit, then prove that forward conversion/quantization of the exposed value reproduces the paired bytes. This is an implementation-review criterion, not a current defect.

## Existing tests and executed evidence

Scratch sources/reproduction programs: `/private/tmp/grisaille-estate-color-core-probe`.

1. Copied `color-core`, its image fixture, and the repository lockfile to scratch. `cargo test --manifest-path /private/tmp/grisaille-estate-color-core-probe/color-core/Cargo.toml --offline --locked` initially rejected the lockfile because the standalone crate graph differed from the enclosing workspace. This is scratch-environment setup, not a product finding.
2. `cargo test --manifest-path /private/tmp/grisaille-estate-color-core-probe/color-core/Cargo.toml --offline` passed: 19 unit tests, 2 analyze-bytes integration tests, 1 golden test, 3 color round-trip tests, 1 k-means snapshot; 26 passed / 0 failed. No doctests. Comparison of package keys after Cargo's scratch lockfile rewrite found 0 added/changed packages and 413 removed workspace-only packages. No installation or network access.
3. Tooling disclosure: despite scratch sources, Cargo honored the user's existing configured target directory `/Users/golem/.cargo-target`, so compilation artifacts went there. Repository sources and Git state were untouched. This is not a claim of fully scratch-contained compilation artifacts.
4. Compiled `sweep.rs` with `rustc --edition=2021 -O sweep.rs -o sweep`, then ran it. It imports the exact repository `color.rs` via `#[path]` and enumerates all 16,777,216 sRGB byte triples through (a) RGB→OKLab→clamped RGB, (b) RGB→OKLab→gamut-mapped RGB, and (c) RGB→OKLab→OKLCH→OKLab→gamut-mapped RGB. Every route returned the original bytes exactly: changed `[0,0,0]`, maximum channel delta `[0,0,0]`.
5. Compiled/ran `pair.rs` for the green/blue centroid illustration above. Its source is retained beside the sweep.
6. Source-copy SHA256 verified identical for `color.rs`, `analyze.rs`, and `tests/color_roundtrip.rs` at exit. Rust compiler: `rustc 1.98.1 (48a229cea 2026-09-01)`.

Coverage caveat: existing property tests (`color-core/tests/color_roundtrip.rs:1-22`) use the SIMPLE CLAMPING converter with a two-byte tolerance and 2000 random cases per property. They do not presently assert a future exposed post-map OKLCH value as quantizer input. The gamut unit test at `color-core/src/color.rs:663-672` checks one out-of-gamut sample and a hue-drift bound; it cannot stand in for that absent API invariant. The exhaustive scratch sweep strengthens evidence for byte-origin colors on this host only; it does not prove all continuous out-of-gamut inputs or future serialized coordinate precision.

## Known-record relationships

- `RAG/AI-IMP/AI-IMP-070-oklab-oklch-conversions-and-gamut-mapping.md`: existing completed chroma-reduction behavior and hue stability acceptance.
- `RAG/AI-IMP/AI-IMP-072-compute-contract-oklab-response.md:20-29`: existing centroid OKLab/OKLCH plus display RGB contract; the absence noted above is not retroactively a violation of this ticket.
- `RAG/AI-IMP/AI-IMP-090-roundtrip-property-tests.md`: existing RGB round-trip acceptance with documented tolerance.
- Checked `RAG/INDEX.md`, relevant color tickets, `RAG/AI-LOG/2026-07-09-LOG-AI-control-flow-and-defect-audit.md`, and the audit-remediation fleet log. No matching open gamut/quantizer defect found in those inspected records. The approved new API is already named in r20 and is not presented as a new discovery.
- Existing stdout diagnostic issue was fixed at reviewed HEAD by routing merge diagnostics to stderr; no duplicate finding raised.

## Authorship boundary and limits

This Astra session authored no reviewed target code. Git blame attributes the mapper to `1af63697` (2026-01-20); the extraction/analyze assembly to `36bc0bb1` (2026-08-20), whose message explicitly credits Claude Fable 5. The HEAD stderr fix also credits Claude Fable 5. No self-review conflict identified for this session.

Read-only code/record inspection; no edits, branches, commits, installs, app launch, audio, MPD operations, or external correspondence. Only scratch report/source files and compiler artifacts were written as disclosed above. No full Tauri/product gates were needed or claimed; the bounded pure-crate checks are the evidence class. This review does not ratify a not-yet-landed additive API or certify genuine producer captures.
