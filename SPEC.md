# SPEC-001: Grisaille constitution

| STATUS | REVISION | LAST UPDATED |
|---|---|---|
| Adopted direction; implementation staged | 0.1 | 2026-09-08 |

> Grisaille is an artwork-led, keyboard-driven MPD music interface with native
> and terminal presentations, reusable content components, and themes that
> compose those components around the music being played.

This is the single normative product specification. `PROTOTYPE.md` describes
operation and dated implementation evidence. Design studies and correspondence
are evidence and proposals; they acquire authority through amendments here.
The tentative product/repository name is Grisaille (owner, rev 0.1).

## Amendment covenant

Every accepted amendment increments the revision and date. Section numbers are
stable addresses: append rather than renumber; preserve reversals in place with
both revision markers. On every amendment, reconcile §5 invariants, §13 current
slice, §14 acceptance, §15 open questions and §16 decision summary. The Review
Lead owns this document; the owner remains final design authority. A ticket or
consultation does not silently amend it. An assignment may explain a later
ratified revision; it cannot contradict the current constitution.

## Contents

1. Present baseline · 2. Motivation · 3. Goals and fences · 4. Domain model ·
5. Invariants · 6. Navigation and interaction · 7. Lyrics · 8. Palette boundary ·
9. Composition and reflow · 10. Visualizer boundary · 11. Continuity and naming ·
12. Delivery governance · 13. Current slice · 14. Acceptance · 15. Open questions ·
16. Decision summary · 17. Evidence and amendment record.

## 1. Present baseline

At adoption, application source is the prototype delivered before `af11212`.
It uses Bun 1.4.2, React 19.2.4, GPUIX 0.7.0 and OpenTUI 0.5.10. The shared
`MusicSession` and MPD backend support queue/playback commands, album and artist
browsing, tracks, search, navigation history, persisted locations and reconnects.
Both hosts have a local lyric reader. Theme colors are statically addressed.

Reusable page composition, live theme loading, named breakpoints, Three.js
scenes and live audio analysis are NOT implemented at this baseline. Native
and terminal entry points share logic, but currently choose page-specific
views. In particular, lyric activity currently depends on the Lyrics route.

The GUI supports two-stop gradients. The terminal currently takes their first
stop. This is an implementation limit, not a claim that terminals cannot show
gradients. Prior test counts and native/terminal observations in PROTOTYPE.md
are dated evidence; fresh submissions must reproduce their own counts.

## 2. Motivation

The project prioritizes aesthetic care, clear spatial hierarchy, artwork as
navigation context, and continuity through an actual listening session. Feature
count is not the success metric. The interface should support quiet reading,
immersive visualization, and dense keyboard browsing without losing the user's
place or requiring a separately authored application for each host.

## 3. Goals and fences

### 3.1 Goals

- Native GUI and genuine terminal entry points over one application model.
- Stable keyboard navigation, searchable content and recoverable browsing state.
- Album-derived color supplied by a reusable external analysis engine.
- Themes freely compose the app's available components and responsive layouts.
- Author a visualizer once for both hosts, with honest capability differences.
- Reviewable changes, atomic ticket commits and owner-facing acceptance.

### 3.2 Fences

MPD owns decoding/playback/output; nowplayd owns its independent macOS media
integration. Grisaille does not absorb those responsibilities. No automatic
MPD configuration edits, metadata-triggered code execution, online lyric
harvesting, streaming service, plugin marketplace, arbitrary new interactive
component system, or signed/notarized release is admitted by this revision.
A local theme module is code selected by the owner; track metadata and palette
artifacts remain data. Repository/bootstrap work does not authorize those
future product implementations.

## 4. Domain model

### 4.1 Track and queue occurrence

A track file identifies library content; an MPD song ID identifies a queued
occurrence within the current server lifetime. Duplicate occurrences stay
individually addressable. Reconnection cannot assume old IDs remain valid.

### 4.2 Artwork and palette

Artwork identity uses a content hash. Analysis can be cached per artwork while
a publication also identifies the requesting playback generation. Semantic UI
roles and expressive extraction clusters are separate parts of one artifact.

### 4.3 Content components and pages

Components are reusable artwork, lyrics, metadata, queue/list/browser content,
transport and other app-provided interactive surfaces. Pages are navigable
compositions/defaults, not exclusive owners of components. A Lyrics component
may appear on Now playing or alongside a queue (owner ruling, rev 0.1).

### 4.4 Theme and composition recipe

A theme supplies paint/text/state choices, component placement and constraints,
responsive rules, and a visualizer module with parameters. The app interprets
the recipe and owns component behavior, focus and command dispatch.

### 4.5 Scene and host adapter

A scene owns visual geometry/materials/motion over shared audio/time inputs.
An adapter presents its output on a host and declares resolution, color,
compositing and feature capabilities. Scene authoring and presentation are
separate responsibilities.

### 4.6 Generation

A generation associates a track change and its asynchronous artwork, lyrics,
palette and composition results. Old results must never become the current
track's presentation. Artifact schema version, recipe version and producer
revision are distinct identities.

## 5. Core invariants

1. Browsing, local find, theme edits and layout reflow never issue playback
   commands implicitly. Commands remain explicit and serialized.
2. Reflow preserves component identity, keyboard focus, selection, lyric reading
   position and scene state when their semantic content survives. A theme may
   explicitly choose another scene; a resize alone does not require a restart.
3. Late data from another track cannot overwrite current track presentation.
4. Theme publication/reload is transactional: validate and prepare before swap;
   retain a usable fallback on error; release replaced resources.
5. Original artwork, local lyrics and owner navigation evidence are preserved.
6. UI role guarantees apply only to named verified pairs and stated backdrops.
   They do not certify arbitrary gradients or animated compositions.
7. A shared scene is the intended authoring boundary. Host limitations must be
   explicit, visually checked and given usable fallback behavior.
8. A merge, passing tests, delivery, and owner visual/listening acceptance are
   distinct facts. Missing evidence remains visible.
9. The implementation lead cannot merge to the integration branch or ratify
   design. The Review Lead cannot treat an advisory review as owner acceptance.

## 6. Navigation and interaction

### 6.1 Destinations

Default destinations are Now playing, Lyrics, Library and future Visualizer.
GUI destination keys are Cmd+1–4; terminal equivalents are F1–4. Only implemented
routes are currently shown. Library contains Albums and Browser modes; direct
mode shortcuts and temporary subordinate navigation labels remain ticketed work.
The last Library mode and its place should be restorable.

### 6.2 Search and history

`/` finds within the focused buffer, retaining surrounding context; `n`/`N`
step matches. `:` opens the global prompt. Cancelling restores the prior
selection/context. `o`/`i` traverse location history without replaying commands.
Themes can style/position these surfaces; prompt focus and dismissal remain
application behavior.

### 6.3 Selection and browsing

Keyboard movement reveals a row only when it reaches the viewport edge.
Playing, cursor-selected, ancestor/context, hover and drag states have distinct
semantic addresses. Pointer selection does not start playback. Dense browse
views preserve individual track identity and continuous scrolling.

The accepted next browser direction places the focused level centrally, with
ancestry on the left and a child/detail preview on the right. This attention
shift is future work; current fixed Artists/Albums/Tracks columns are baseline.

## 7. Lyrics

### 7.1 Content and interaction

Existing local timed/plain lyrics support manual reading, local search, reload,
playback following and explicit seek from a timed cue. Reading or finding does
not seek. Existing key semantics and cue identity survive component extraction.

### 7.2 Availability and placement

Model loading, available, absent and error independently. Availability can
change after a track event and must re-evaluate composition with generation
checks. A theme can show lyrics on any page where current-track context exists.
Showing the same component in different arrangements retains its semantic state;
simultaneous duplicate interactive instances require an explicit focus policy.

### 7.3 Visual direction

Primary listening composition: a full-frame custom visualization, outlined
lyrics above it, and floating artwork. A theme may choose a quiet docked variant
or an entirely different exuberant scene when lyrics are absent (rev 0.1).
Legibility is judged over the final moving backdrop; native outlines, backplates
and terminal alternatives need actual host evidence.

## 8. Palette producer boundary

### 8.1 Ownership

The external color engine owns artwork analysis and semantic roles. Grisaille
owns composition, component mapping and final-surface legibility. The artifact
must be useful without Grisaille's layout language. Fable's r3 proposal is a
DRAFT contract, not a shipped conformance fixture or ratified v1 schema.

### 8.2 Consumer requirements

Prefer a versioned JSON file published by atomic replacement; watch its parent
directory, including rename. Track/generation correlation must reject obsolete
updates. A failure must identify the failed request separately from any retained
successful palette; an old identity plus null roles is insufficient by itself.

Carry producer revision, artwork hash, base/derived role distinction, final
sRGB role colors, provenance and named verified contrast pairs. Expressive
clusters carry share and explicit sRGB/OKLCH representations, with defined
ranges and within-artifact ordering. Do not silently invent a missing derived
selection role or confuse inactive with selection.

### 8.3 Color and presentation proof

The full output path must define encoding, alpha representation and conversion.
A known color-ramp fixture must pass through native and terminal paths before
claiming fidelity. Endpoint contrast is not whole-gradient verification.
Host-specific chroma changes are optional presentation choices, not mutations
of canonical extraction. Consumer errors keep a usable last-good/default theme.

## 9. Composition and responsive reflow

### 9.1 Component vocabulary

Expose existing content components with anchors, min/max sizes, flexible
proportions, wrapping, visibility and layer order. Themes can move lyrics onto
Now playing and compose available components freely. New visualizer modules
are supported by the scene contract; new application components with new
behavior/commands/data require application work (owner ruling, rev 0.1).

### 9.2 Responsive profiles

Provide `compact`, `regular` and `wide` defaults. Themes can use those names or
define their own thresholds/rules. Context includes viewport width and height,
host capabilities, content availability and palette. Native measurements are
logical pixels; terminal measurements are cells. Profiles must account for
height and component minimums as well as width. Numeric default thresholds are
an open calibration decision; the names and customization boundary are settled.

### 9.3 Re-evaluation and lifecycle

A local JS/TS composition hook returns a validated data recipe. Re-evaluate on
track change, lyrics resolution, palette arrival, viewport change and explicit
module edits. Ordinary flex/min/max/wrapping handles continuous adjustment;
profile transitions handle structural changes. No per-frame module reload or
album extraction is needed. Invalid imports/recipes retain a usable view and
surface a recoverable error. Changed module content must defeat import caching.

## 10. Shared visualizer boundary

### 10.1 Intended architecture

Prefer one authored Three.js scene, shared audio analysis and timing, with host
presentation adapters. Two dimensional visuals may use Three.js. The initial
art direction is moving ink/translucent glass: bass moves broad forms,
percussion moves fine filaments, artwork colors set the atmosphere.

### 10.2 Feasibility gate

GPUIX 0.7.0 lacks an exposed supported pixel surface. Upstream PR 45 is a parked
partial WebGPU prototype with CPU-copy presentation. A local frame bridge and
a later macOS shared-texture path are alternatives to investigate, not adopted
implementations. Do not import that entire PR on the strength of a cube demo.
A proof must render one textured/transparent scene behind readable lyrics and
artwork in both hosts, including resize, replacement and resource cleanup.

### 10.3 Audio input

`/tmp/mpd.fifo` belongs to the existing terminal visualizer. Fable reports no
fanout. A future Grisaille audio feed should be a separate MPD output/FIFO,
coordinated explicitly; concurrent readers of the existing FIFO cannot each
receive the full stream. No audio/configuration change is authorized by this
bootstrap. Audio format, synchronization and analysis timing remain ticketed.

## 11. Continuity and naming

The canonical repository is `~/git/grisaille`. The existing application still
uses Music Prototype bundle/executable/state identifiers. A separate identity
migration ticket owns their change and preservation of existing snapshots and
journals; repository renaming does not migrate or discard user state.

Keep private atomic snapshots, endpoint-separated state, bounded reconnects,
and no automatic command replay. Preserve navigation across sorting and normal
exit. Existing MPD command races/partial command-list success must remain
honestly reported. Local development/visual checks use isolated state and
simulated playback where possible.

## 12. Delivery governance

This canonical Astra seat is Review Lead: constitution, design, ticket scopes,
assignments, final review, integration merges and releases. A separate Astra is
Code Lead per assigned epic, in an independent clone. It may break approved
issues into subagent waves, review their work, and consolidate one atomic commit
per issue in dependency order. It returns one integrated, UNMERGED epic PR.

A second reviewer independent of implementation reviews the submitted commit
before final merge. The Review Lead checks boundaries and load-bearing logic,
reproduces relevant gates, resolves findings and merges to `main`. Fable can
provide intermittent outside consultation; its scope and reviewed revision are
recorded. Detailed execution and destructive-operation rules live solely in
`RAG/PROTOCOL.md`; role charters point there.

## 13. Current slice

Adoption now: rename the local repository, capture this constitution, install
current bootstrap tooling and role-specific instructions, establish tickets,
review gates and local durable mail. Remote creation belongs to the owner.
No feature epic begins merely because this document exists.

First assignable sprint: AI-EPIC-001, theme artifact consumption, beginning with
read-only round 1 against the external draft and actual app surfaces. Later
sprints expose composable/responsive components, prove the shared visualizer,
and improve browser attention/identity/known quality gaps. Assignments and
capacity live in `RAG/SPRINTS.md`; reserved IDs live in `RAG/RESERVATIONS.md`.
A task-specific assignment plus Review Lead fold/implementation authorization
is required before code work.

## 14. Acceptance criteria

### 14.1 Adoption

Spec and tickets distinguish delivered behavior, accepted direction, open
questions and dependencies. Every planned issue cites stable sections and has
scope fences and Given/When/Then criteria. Roles and merge authority are
unambiguous in canonical and implementation clones. Tooling provenance and
local deviations are recorded. Second review has a durable outcome.

### 14.2 Product submissions

Reproduce typecheck, tests, standalone build and macOS packaging at the proposed
commit. Add focused behavioral checks where new asynchronous/state logic risks
regression. Native/terminal rendering needs relevant actual-host observations;
synthetic tests cannot close owner listening, feel or accessibility items.
Report exact counts, failed checks, reviewed SHA and remaining limitations.

### 14.3 Theme/composition and scene acceptance

No stale-track updates, partial palette/layout swaps, input-focus loss or
playback side effects. Demonstrate default and alternate layouts across named
profiles with and without lyrics. Demonstrate shared-scene rendering and ramp
conformance before claiming two-host fidelity. Owner review of actual visuals
is required before declaring the aesthetic work accepted.

## 15. Open questions

- DQ-001: final palette schema, failed-request identity, numeric representation
  consistency, missing selection behavior and fixture provenance with Fable.
- DQ-002: measured default breakpoint thresholds and short-height policy.
- DQ-003: GPUIX bridge strategy, supported Three.js subset and performance budget.
- DQ-004: simultaneous component instances, outline implementation and terminal
  image/text layering/focus semantics.
- DQ-005: exact Library mode shortcuts and focus-centered browser transitions.
- DQ-006: final product name, executable/bundle identity and state migration.
- DQ-007: remote URL, implementation seat identity and any managed wake activation.

## 16. Decision summary

- Grisaille is the tentative repository/product name (rev 0.1).
- MPD playback and nowplayd media responsibilities stay external (rev 0.1).
- Native and terminal hosts share application state and intended scene authoring.
- Palette engine supplies analysis/roles; consumer supplies composition.
- Pages are defaults/destinations; existing components can be composed across them.
- Named compact/regular/wide profiles and theme-defined rules are required.
- Full-frame visualization, floating artwork and outlined lyrics is the primary
  listening direction; understated and no-lyrics variants are theme choices.
- This seat owns design and final merges; epic implementers integrate their
  subagents and submit unmerged PRs; a separate second review is required.
- Current authorization is workflow/spec/ticket adoption. First feature sprint
  is prepared for read-only round 1; implementation and runtime activation are
  separate recorded starts. No reversal has occurred in rev 0.1.

## 17. Evidence and amendment record

2026-09-08, rev 0.1: owner accepted the component/composition and responsive
boundary and requested the move beyond greenfield into this review-led workflow.
Source audit identified existing lyric/browser functionality and static theme
limits. Historical visual note: `docs/visualizer-and-composition.md`.
External palette correspondence: `.inbox/toastra/theme-engine-consumption-r1.md`
through r3 and `.inbox/tofable/theme-engine-consumption-r2.md`.
Upstream evidence: [GPUIX PR 45](https://github.com/remorses/gpuix/pull/45),
[OpenTUI Three renderer](https://github.com/anomalyco/opentui/blob/main/packages/three/src/WGPURenderer.ts).
Bootstrap source/provenance: `RAG/bootstrap-source.json` and `RAG/BOOTSTRAP.md`.
