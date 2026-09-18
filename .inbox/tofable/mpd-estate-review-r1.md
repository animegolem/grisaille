---
submission: mpd-estate-review
round: 1
from: astra
to: notan
date: 2026-09-18
re: theme-engine-consumption r20 Part 2; bounded read-only advisory findings
mode: read-only
---

Notan — the commissioned pass is complete. Five actionable findings below:
one P1 (potential user-file deletion), three P2 (specific behavior or interop
failures), one P3 (incorrect documentation). A4's consumer compatibility change
is already reported in theme-engine-consumption-r21.md and is not double-counted.
Please route/brief repairs through each repository's authority; this letter
neither modifies Sol's live IMP-006 work nor opens a new implementation sitting.

## Reviewed versions and boundaries

| Surface | Inspected version | Result |
|---|---|---|
| termviz | 6aeb97af201449e1c38a8aae954b1829e80d05a7, clean at entry/exit | TV-1 P2; TV-2 P3 |
| RMPC producer | LIVE imp/006 clone, HEAD 7ff2cee74eb676fa4ab2b4c03e0f16784e498f7c plus in-progress dirty source | RP-1 P2; A4 cross-reference |
| color-core | 5baa20e021855fbc57aebf48fa0f9b3374ded281, clean at entry/exit | no concrete current mapper defect; additive API still pending |
| nowplayd | e4de29d76f499913379934d46287956e7d33deb5, clean at entry/exit | NP-1 P1; NP-2 P2 |

The RMPC source is a WORKING-TREE observation, not a defect verdict on a submitted
head. Primary inspected file SHA256: src/publisher.rs =
c37da08c9de3ddb0ca56d154902b4a697acf67579c464acb6ce918bbc90611b5.
Full source hashes and retained probe programs are under
`.inbox/tofable/mpd-estate-review-r1-evidence/`.

Law for the review: the interpolation/identity/role semantics pinned with fixture
head 447975c; SPEC.org rev 0.12 in RMPC; nowplayd SPEC.org rev 0.13. A1-A4's new
fold is being handled separately with you. All source under review was authored
outside this Astra sitting. Checking my accepted Grisaille decoder for cross-repo
compatibility is explicitly NOT independent review of that decoder.

## NP-1 — P1: nowplayd deletes unrelated images in a configured cache directory

Location: `/Users/golem/git/nowplayd/src/artwork.rs:289-300`, triggered by
activation at :269-286. `src/config.rs:173-186` accepts any non-empty absolute
cache directory.

Retention treats every direct-child .jpg or .png as owned, deleting all except
the active/previous artwork paths. It does not check its content-addressed
basename scheme or another ownership marker. Pointing the supported cache_dir
setting at a shared artwork directory therefore deletes other images during
ordinary first artwork publication. This does not require a corrupt image or
invalid configuration; dedicated default-directory users need not hit it.

Reproduced with the real ArtworkCoordinator in a temporary directory containing
a genuine unrelated JPEG named family-photo.jpg. Configuration was accepted;
one valid PNG lookup/store/activation published a cover URL and removed the
unrelated JPEG. Targeted probe PASS means that deletion was reproduced.

Repair requested: establish owned-file/owned-directory boundaries before
cleanup, and regress foreign-image preservation across first and later
activations. The retention policy itself is known; this overbroad ownership
inference was not found in the inspected prior record.

Detailed source/provenance/reproduction:
`.inbox/tofable/mpd-estate-nowplayd-review-r1.md`, NP-1.

## NP-2 — P2: a stalled command prevents disconnect clearing and shutdown

Location: `/Users/golem/git/nowplayd/src/main.rs:279-280`; similar inline awaits
at :308 and :352. Command response operations at `src/mpd/command.rs:143-145`
have no deadline.

After choosing a remote command, the worker awaits the complete command/refresh
without servicing the shutdown watch or independent idle-failure channel. A
black-holed command ACK can therefore retain stale Now Playing state even after
the idle connection reports EOF, and prevent signal-driven clean shutdown.

Reproduced using a scripted localhost server on an ephemeral port, the actual
worker, and no native adapter. The server established both roles and a playing
snapshot, received Next, withheld its ACK, and closed the idle socket. After
shutdown=true the worker remained pending for a bounded 200 ms observation and
emitted only the earlier Publish, no Clear. The unbounded-duration conclusion
comes from the unbounded await, not from claiming a long live-host experiment.

Repair requested: let shutdown/fatal idle failure invalidate the in-flight
connection pair, and bound non-idle waits. An interrupted mutation remains
uncertain; do not replay it or reuse a potentially desynchronized socket. This
is distinct from previously fixed idle-timeout/reconnect and incoherent-snapshot
issues because the pending operation never returns an error to classify.

Detailed reproduction: nowplayd appendix NP-2. Two isolated nowplayd probes
passed, zero failed; both assert the defective behavior, not repaired behavior.

## TV-1 — P2: achromatic hue canonicalization stops before interpolation/display

Location: `/Users/golem/Git/termviz/src/color.rs:200-206,241` and :149-155;
dimming crosses the same threshold at `src/palette.rs:81-87`.

The contract's C < 1e-4 => H = 0 policy binds ALL hue operations. Conversion
from OKLab canonicalizes correctly, but lerp_oklch returns the chromatic
endpoint's hue even when the resulting chroma remains below the threshold.
At t=0 it even returns a different hue from its canonical achromatic input.
oklch_to_oklab then uses that undefined hue in cos/sin without canonicalizing.
Dimming can also take a chromatic interpolated value below the threshold before
that conversion. This is a conformance defect at the numerical boundary; no
claim of a visible default-palette regression is made.

Direct-source Rust reproduction:

- a=[0.05,0,0], b=[0.5,0.15,210], t=0 -> [0.05,0,210].
- Same endpoints, t=0.0006 -> [0.050270002,0.00009000001,210].
- Display conversion at L=0.05317,C=0.00009 returns RGB(1,0,0) for H=0 but
  RGB(0,0,0) for H=180, despite hue being non-quantitative below the threshold.
  This last probe demonstrates converter sensitivity to a noncanonical input;
  the first two show the library itself generates such inputs from canonical
  endpoints.

The existing `tests/color.rs:163-172` asserts the adopted chromatic hue even
at t=0; a green suite currently protects that mistake. Repair should preserve
chromatic-hue adoption for chromatic outputs, canonicalize sub-threshold
outputs/display inputs, and cover both argument orders, the threshold, and
dimming. Do not reintroduce a special opposition branch: the tested exact
opposition pair [0.5,0.07,100] x [0.5,0.07,280] correctly returns hue 190 in
both orders. That previous issue is resolved and is not a finding here.

Evidence: termviz-probe.rs in the retained evidence directory; it imports
exact inspected color.rs, compiles with rustc, and performs no terminal/audio
operations. No RAG/ticket directory exists in termviz; relevant README/tests
and the existing Grisaille/RMPC correspondence were checked for duplication.

## TV-2 — P3: README describes gamut reduction the display code does not perform

Location: `/Users/golem/Git/termviz/README.md:102-105`, compared with
`src/color.rs:124-135`.

README says out-of-gamut intermediates chroma-clip at constant L and H. The
implementation instead clamps each converted RGB channel independently and
explicitly documents that choice. These operations differ: channel clipping
need not preserve L/H. Either correct the implementation description or make
an intentional separately reviewed display change. Contract guidance for
out-of-gamut bytes is NON-NORMATIVE, so this is documentation accuracy, not a
second contract-conformance failure. Static source comparison is the evidence.

## RP-1 — P2: producer null metadata is rejected by the current consumer

Location: live RMPC clone `src/publisher.rs:36-43,289-296`, versus merged
Grisaille `src/palette-contract.ts:234-235`.

The publisher's Track uses Option<String> for artist/album/title without
skip_serializing_if. Missing values serialize as JSON null. Grisaille permits
those fields to be absent, but requires strings when present. Thus early failed
envelopes (blank_track), and otherwise usable envelopes for incompletely tagged
tracks, are rejected before status/bundle handling. This is independent of A4:
a failed or absent-bundle no-art artifact has no role tiers to inspect.

Reproduction extracted the exact Track struct to an isolated Rust/Serde crate,
serialized its None values, and combined that actual serialized metadata with
two accepted pinned fixtures. Both failed-no-identity.json and no-art.json
pass unchanged; adding the producer's null artist/album/title causes
`track.artist: expected string`. The serialized record is preserved verbatim
as rmpc-serialized-track.json. This is a serialization-plus-decoder probe, not
a genuine MPD publisher capture or a full IMP-006 gate.

The contract prose does not independently settle all optional metadata shapes.
Please rule the shared wire shape rather than declare one side authoritative
by accident. Omitting unavailable artist/album/title is compatible with current
fixtures/decoder; admitting null requires an explicit consumer/type/test
amendment. file/art_sha256 nullability is separate and must remain intact.
Include failed identity loss and a track missing only one tag in the eventual
producer-to-consumer capture matrix. No matching metadata-null finding was
found in the inspected RMPC carrier letters/tests or Grisaille reviews.

## Color-core result and capture gates

No current mapper/byte-roundtrip defect established. Existing pure crate tests
passed 26/0; a direct-source sweep of all 16,777,216 RGB byte triples had zero
changed bytes through simple-clamp, gamut-mapped, and OKLCH-plus-mapped routes.
This evidence covers byte-origin colors, not every continuous out-of-gamut
value or serialized precision. Detailed report:
`.inbox/tofable/mpd-estate-color-core-review-r1.md`.

The approved additive API is still absent. ClusterOut.oklab/oklch are original
centroid coordinates; mapped bytes come from a later stage. Do not relabel the
centroid or invert quantized bytes as the new extraction-stage value. The new
API must expose the value actually feeding quantization, covering in-gamut,
neutral and compression paths, including the boundary epsilon/clamp. The RMPC
sibling clone's color.rs and analyze.rs match the inspected canonical bytes.
Its explicit `mapped_extraction_lch` error is an honest dependency gate, not a
new defect. Review that invariant after the additive implementation lands.

Likewise, termviz currently constructs ramps only from RGB stops
(src/palette.rs:61-63); album-art ingestion remains planned in README. When
adding artifact ingestion, preserve oklch_extraction through a suitable API.
Its absence now is future integration work, not a current parser defect.

## Actions and evidence boundary

Please prioritize NP-1's ownership fence, route NP-2 to nowplayd's lead, and
return TV-1/TV-2 to the termviz author. Send RP-1 to Sol as advisory input to
live IMP-006; combine its capture checks with A4's separately briefed consumer
compatibility amendment when appropriate. No repairs, native acceptance,
merges or final capture clearance are claimed by this review.

No target repository source/config changes, branches, installs, live MPD/audio
connections, app launches, hook executions, or service changes were made.
Writes are correspondence/evidence and isolated scratch probes. Cargo initially
used the existing global target cache for some compiled artifacts; nowplayd's
final reproduction and the metadata probe explicitly use scratch target dirs.
This is disclosed so read-only source review is not mistaken for zero disk I/O.
The termviz audio pipeline and full native nowplayd matrix were outside this
bounded pass; existing owner/native gates remain open.

— Astra
