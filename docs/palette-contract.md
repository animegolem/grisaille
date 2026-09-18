# Palette artifact decoder

`src/palette-contract.ts` exports `decodePaletteArtifact(json, log?)`. It parses
untrusted JSON and returns either `{ ok: true, artifact, warnings }` or
`{ ok: false, error }`. Rejection includes the offending data path. The optional
warning callback defaults to `console.warn`; an unknown status emits one warning.
The decoder reads no files, starts no watcher, changes no application state and
executes no artifact content.

## Pinned input and fixture provenance

Implementation follows RMPC-Auto-Theme commit
`447975c18fb5b910b3c5d6098258b9354398ec2d`, `contract/notan-palette-v1.md`.
The exact contract document's SHA256 is
`fa0d0696a062d3330da7c6f367274696a26f9450057458bb5823f827436f96bd`.
The nine JSON files in `tests/fixtures/palette/` are byte-for-byte copies from
that commit's `contract/fixtures/`. They are **synthetic conformance data**, not
producer captures; fixture notes and placeholder producer revisions are retained.
The first actual publisher capture remains a separate producer conformance gate.

Accepted fixtures: `ok`, `no-art`, `no-art-verified`, `failed`,
`failed-no-identity`, `achromatic-wrap`. Rejected fixtures:
`invalid-schema-major`, `invalid-no-art-partial-bundle`,
`invalid-no-art-null-roles`.

## Consumer boundary

`artifact.status` discriminates three states. `ok` contains a palette and artwork
identity. `no-art` has a null artwork hash and empty clusters; its verified role
bundle is either wholly present or wholly absent. `failed` describes the failed
request, including a nullable track URI when identity could not be obtained. It
never carries palette fields. An unknown status is projected to `failed`, logged,
and preserved in `original_status`; its potential future palette fields are
excluded. Invalid data and unsupported schema versions return an error instead.

The caller owns retention. Keep the last usable palette separately from the
latest attempt; never relabel retained colors with a failed/no-art request's
identity. This module neither remembers nor supplies retained colors. Association
with the current track, stale-generation rejection, directory watching, restart
reconciliation and refresh requests belong to later runtime work. `sequence` is
validated as a nonnegative safe integer but establishes no cross-restart ordering.

Read capabilities from `features`, never producer revision, version or role
presence. Unknown feature strings survive without acquiring semantics. Selection
advertised on an emitted bundle requires an actual derived selection role. In
no-art, selection presence and capability must agree. A selection-free bundle is
not expanded or synthesized from `inactive`; inactive always aliases frame.
Unknown top-level fields are dropped. Unknown pair kinds are skipped individually;
they cannot replace required known guarantees when selection is advertised.

## Numeric validation and its limits

Role hex is final 8-bit sRGB. The decoder recalculates OKLCH with the contract's
reference matrices, checks L/C within 0.002 and chromatic hue within 0.5 degrees
using circular distance. Achromatic hue must be zero; no hue comparison is made
between achromatic values. Inactive and frame must carry equal color data.

Recognized pair measurements are recomputed from final bytes and checked at the
contract's three-decimal contrast or six-decimal delta-L precision. Final values
must meet their declared floors before rounding. The decoder checks the six
contrast entries and selection/active delta-L entry whenever `features` advertises
selection. Floors are artifact declarations, not an inferred blanket guarantee
for other compositions; no stronger product-wide contrast promise is introduced.

Clusters retain extraction-stage OKLCH and display hex separately. Extraction
coordinates are range-checked but are not compared with quantized hex. Shares
must be positive, no more than one each, and sum to at most 1.001. They remain
unnormalized (the achromatic/wrap fixture totals 0.963). IDs are unique and the
array is ordered by descending share, then ascending ID for ties. Nothing here
interpolates or gives intermediate colors an endpoint guarantee.

This sitting adds data validation only. It does not apply palettes to native or
terminal surfaces and claims no actual-host visual evidence.
