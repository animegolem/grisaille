# Visualizer and live composition — exploration

Recorded 2026-09-08 as exploration. The owner subsequently accepted the component,
composition and named-breakpoint boundary. `../SPEC.md` rev 0.1 is now authoritative;
this note preserves the original discussion and research. Rendering remains unproved.

## The visual idea worth keeping

The original proposal from September 6:

> I’d try something like moving ink and translucent glass: broad shapes responding to bass, fine filaments reacting to percussion, with the cover palette determining the whole atmosphere.

The owner's September 8 clarification makes the primary composition explicit:
the visualization fills the frame, with stroked/outlined lyrics and artwork
floating above it. A song hook can choose a quieter, docked arrangement, or a
completely different exuberant visualization when the track has no lyrics.
The corner spectrum in the owner's RMPC screenshot illustrates the current
setup, not the intended visual style or the limit of the new composition.

The scene should use the album's color distribution, including colors that
would be unsuitable for UI text. Legibility belongs to the lyric treatment
and its immediate backdrop. Motion can be expansive without making every
surface pulse on every beat.

## One authored scene, two presentation adapters

Prefer a shared Three.js scene module, audio analysis, clock, and parameter
model. Three.js is useful for sharing shaders, geometry and animation even
when a scene looks two dimensional. Avoid requiring a second drawing program
for every visualizer. The native and terminal hosts still need their own
presentation adapters, resolution choices, and interaction overlays.

Evidence checked September 8:

- OpenTUI has a [ThreeRenderable](https://github.com/anomalyco/opentui/blob/main/packages/three/src/ThreeRenderable.ts)
  and a [Bun WebGPU renderer](https://github.com/anomalyco/opentui/blob/main/packages/three/src/WGPURenderer.ts).
  Its [canvas adapter](https://github.com/anomalyco/opentui/blob/main/packages/three/src/canvas.ts)
  reads GPU results back and converts them for terminal buffers.
- Our installed GPUIX 0.7.0 has no supported raw-pixel presentation API exposed
  in its native declarations. [Upstream PR 45](https://github.com/remorses/gpuix/pull/45)
  is an open, parked prototype: an untextured Three.js cube with CPU-copy
  presentation. Its documented omissions include texture upload, MSAA and
  zero-copy presentation. It does not yet establish the proposed scene works.
- Native outlined lyrics and terminal image/text layering also need proof.
  Character-cell text cannot promise the same outline as pixel text. A shared
  raster lyric treatment or a simpler terminal treatment may be appropriate;
  retain the app's lyric navigation and seeking semantics in either case.

A useful later proof would show one small scene behind artwork and readable
lyrics in both hosts, then resize, switch tracks/scenes, and check frame cost
and cleanup. This note does not authorize that experiment or dependency work.

## A hook that chooses the composition

Use ordinary JavaScript/TypeScript initially; the app already runs Bun. A
local module exports a function from song context to a composition recipe.
It may select a different visualizer module as well as that module's parameters.
These names are illustrative, not an API that currently exists:

```ts
export function compose(ctx) {
  return ctx.lyrics.status === 'available'
    ? {
        visualizer: { module: './ink-and-glass.ts', intensity: 0.35 },
        layers: [
          { surface: 'visualizer', placement: 'fill' },
          { surface: 'artwork', placement: 'top-left', floating: true },
          { surface: 'lyrics', placement: 'center', treatment: 'outlined' },
        ],
      }
    : {
        visualizer: { module: './wild-field.ts', intensity: 1 },
        layers: [
          { surface: 'visualizer', placement: 'fill' },
          { surface: 'artwork', placement: 'bottom-right', floating: true },
        ],
      };
}
```

The real recipe should expose ordered layers, anchors, sizing constraints,
docked/overlay placement, visibility, text treatment, and named surface paint
overrides. The app owns reusable surfaces, focus, commands and hit testing.
Once those primitives exist, theme authors can rearrange and restyle them or
add a scene without editing the app. Entirely new interactive component types
would still require host work. This is a meaningful initial implementation,
not a small change to the existing color table.

Context should include track identity, art identity, palette/analysis,
lyrics status, viewport, and renderer capabilities. Distinguish lyrics
`loading`, `available`, `absent`, and `error`; the sketch above abbreviates this.
Re-evaluate on song change, lyric resolution, palette arrival, resize, or an
explicit theme edit. Use one generation identity so late results for track A
cannot change track B. A reload must actually load the changed module rather
than return a cached import. Validate and prepare a complete update before
swapping it in; retain a usable previous composition on failure and dispose
replaced scenes. No per-frame script reload or palette extraction is needed.

## Palette engine boundary

Fable's letters suggest a versioned, atomically replaced JSON artifact. Prefer
watching its parent directory and rereading the artifact; an MPD song event
alone can precede the completed palette. Keep album analysis reusable across
tracks while including request/track identity in each publication.

Request final display-sRGB role colors, explicit base/derived role names,
producer version, art hash, provenance, and named measured contrast pairs.
Alongside these, carry ungated extraction clusters with share, sRGB and OKLCH
values. OKLCH is a different representation with defined numeric ranges, not
another sRGB-encoded tuple. Initial scenes can derive summary statistics from
the clusters; named engine statistics can follow when a scene needs them.

Do not equate raw cluster colors with readable text colors. A gradient's
endpoints alone do not establish contrast over its interpolated/composited
surface, and a moving background makes the final lyric treatment a consumer
responsibility. A predictable outline/backplate or local scrim needs visual
verification over the actual scene. A terminal can render gradients through
cells or images, although fidelity and compositing differ.

Color conversion must be explicit at each adapter boundary. Three.js uses
linear-sRGB internally; hex/CSS setters perform conversion with color
management enabled. Offscreen output, postprocessing, alpha representation,
and the terminal adapter must be checked together. In particular, the inspected
OpenTUI renderer sets LinearSRGBColorSpace output; do not assume browser-canvas
defaults. See [Three.js color management](https://threejs.org/manual/en/color-management.html).

Audio is a separate input from album analysis. Fable reports `/tmp/mpd.fifo`
as 44100:16:2 PCM. Its presence was checked, but no samples were consumed.
A FIFO is not a broadcast stream: concurrent readers can divide the bytes.
Agree a single-reader fanout or independent MPD output before sharing it with
an existing visualizer. Palette work does not require changing that feed.

Correspondence: `.inbox/toastra/theme-engine-consumption-r1.md`, the r2
addendum, and `.inbox/tofable/theme-engine-consumption-r2.md`.
