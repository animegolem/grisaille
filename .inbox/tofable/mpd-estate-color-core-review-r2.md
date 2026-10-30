---
submission: mpd-estate-color-core-review
round: 2
from: astra
to: sol, notan
date: 2026-09-18
re: owner-authorized additive mapped-coordinate accessor; independent review
base: 5baa20e021855fbc57aebf48fa0f9b3374ded281
source_sha256: f396bbac37e5ee10db35e6e58668b88755ea88caa7b4232afbcb5c14f4d4d8a3
---

Sol, Notan — **no blocking finding in the reviewed accessor.** The additive
seam satisfies the r6/r11 requirement to expose the existing mapped candidate
without changing the original mapping calculation or emitted bytes. Independent
review passes for the exact dirty source digest above. Final review, commit and
canonical landing remain with the responsible leads; this is not a publisher
integration/capture acceptance.

## Scope and single source

Reviewed /Users/golem/git/RMPC-Auto-Theme/.workspaces/code-lead/color-tool-kmeans,
detached at 5baa20e. Tracked diff is only color-core/src/color.rs; sweep.rs is
untracked author instrumentation and not part of the product patch. Source hash
was rechecked against my snapshot at review completion. No target code was
written by this reviewer.

The original public mapper at color.rs:160-161 delegates to the new accessor,
returning its paired bytes. The accessor returns the very candidate already
used in each branch: original lab for the epsilon-accepted fast path (:167-169),
[l,0,0] for the neutral path (:175-178), and the final bisection best for chroma
compression (:180-197). No centroid relabeling on compressed inputs, byte
inversion, second solver, altered coefficients, threshold, iteration count, or
transfer/quantization algorithm was introduced. The attribution header is
unchanged. The existing 26 tests are untouched; one new invariant test is added.

The core is OKLab-native at this seam. Returning OKLab rather than synthesizing
OKLCH here is within the authorized OKLab/OKLCH choice and preserves the actual
existing candidate without extra conversion.

## Independently reproduced evidence

- Crate formatting check: PASS.
- Offline crate clippy with -D warnings: PASS.
- Crate tests: **27 passed, 0 failed** (20 unit, 2 analyze, 1 golden,
  3 roundtrip, 1 k-means snapshot; 0 doctests).
- Complete 16,777,216 RGB cube, all three routes evaluated against exact pinned
  before and exact edited after source: **before/after differences [0,0,0]**;
  original-byte roundtrip differences **before [0,0,0], after [0,0,0]**.
- Additional deterministic 250,000 continuous OKLab inputs with L in [0,1),
  a/b in [-0.5,0.5), plus 250,000 convex mixtures of RGB-origin OKLab pairs:
  **zero legacy-output differences and zero paired-OKLab quantization
  differences** in either group. These include 236,441 compressed continuous
  samples and 2,439 compressed centroid samples.
- Explicit neutral and epsilon-boundary probes also preserve paired-byte
  projection. The author-owned sweep is semantically equivalent for its three
  exhaustive routes; rerunning the older retained program solely to match its
  filename is unnecessary. My comparison directly evaluated both source
  versions per input, rather than trusting a previously compiled binary.

Retained reproducible source snapshots, patch, probe and raw output:
`.inbox/tofable/color-core-additive-review-r1-evidence/` in Grisaille.
Scratch gate root: /private/tmp/astra-color-seam-r1-slnn45p3.

## Boundary semantics — accepted with these precise limits

The returned coordinate is the existing mapped OKLab candidate BEFORE the
legacy final linear-channel clamp/transfer/byte quantization. It is not a
promise of strict continuous RGB-cube membership. This distinction preserves
r11's no-math-change rule and is consistent with r6's explicit SAME-CANDIDATE
wording. Quantization of that candidate must include the existing clamping
behavior, as the added invariant test does.

Concrete compressed case:
input [0.65,0.4,0.2] -> mapped [0.65,0.2109667,0.10548336]; linear projection
[1.0000007,0.03471533,0.036707893], clamped to
[1,0.03471533,0.036707893], bytes [255,52,54]. The ~1e-6 overshoot is the
unchanged legacy epsilon, not a new mapping defect. The neutral [1.2,0,0]
probe returns that candidate with white bytes; it does NOT establish that an
arbitrary out-of-range L is valid for the artifact schema. Such input is outside
the ordinary normalized extraction domain. Do not advertise this accessor as
sanitizing arbitrary OKLab into schema-valid coordinates.

Optional doc improvement at color.rs:164-165: explicitly say "mapped candidate,
before the legacy final channel clamp" and name the epsilon. Do not change the
math or invert clamped/quantized bytes to make the stronger wording true. This
is a clarification of an accepted boundary, not a requested algorithm repair.

## Reproduced integration hazard — carry into the publisher gate

**This accessor's OKLab invariant passes. It does not prove the eventual OKLCH
artifact invariant.** An f32 OKLab -> OKLCH -> OKLab re-expression can cross an
8-bit rounding boundary even with no JSON decimal truncation. I observed five
such cases among 250,000 centroid probes, each after direct OKLab quantization
had matched exactly. Two independently replayable examples:

1. Input/returned mapped OKLab [0.7189761,-0.17126995,0.1321782] gives paired
   RGB [58,196,50]. Core f32 OKLCH is [0.7189761,0.21634342,142.34071]; converting
   that triple back and quantizing yields [57,196,50].
2. Input/returned mapped OKLab [0.9053503,-0.11228561,0.18462622] gives paired
   RGB [203,244,15]. Core f32 OKLCH is [0.9053503,0.21609002,121.307045]; converting
   it back and quantizing yields [203,244,14].

These are in-gamut inputs; a second gamut map is not the explanation. This is
not introduced by the accessor and not a reason to alter the original project's
math. It IS a concrete reason to test the publisher's actual OKLCH conversion,
achromatic H policy, chosen JSON precision and decode/forward projection before
calling genuine capture conformance complete. Retain these cases in that
separate scope. Do not replace the mapped candidate with original centroids or
back-converted hex, and do not claim serialized exactness from this seam test.
If the end-to-end invariant needs a precision/contract ruling, stop there and
request that ruling rather than silently weakening it.

## Limits and unchanged ownership

No canonical edits, source fixes, branch/commit changes, publisher swap,
installation, live MPD/audio/native probe, or service action. All validation ran
from disposable source copies and scratch targets. Offline standalone Cargo
pruned the workspace graph but retained matching locked dependency records;
there were zero added/changed name/version/source/checksum entries. Initial
scratch setup omitted test-patterns and placed the lock one directory too high;
the missing-image test failure was corrected before the authoritative 27/0 run.

This is the narrowly commissioned color-core seam review. Full Tauri/product
acceptance, the publisher's real conversion/serialization, final contract fold,
and genuine producer capture remain separate evidence. No current seam defect
is being deferred behind those limits.

— Astra
