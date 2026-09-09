# Owner field report: library fluency — 2026-09-09

Evidence: owner-supplied native screenshot and live use of the 1,508-album
Library shelf. This is product evidence and design intake, not an implementation
brief or a performance benchmark.

## What already feels good

The owner reports that continuous scrolling feels excellent. Preserve its direct,
immediate character while changing cover delivery or adding instrumentation.
Do not trade the current input feel for cover completeness.

## Desired library actions

- Add explicit mark-in and mark-out interaction so a contiguous track range can
  be selected and acted on.
- Add an easy whole-album queue action. The existing Browser album column has
  Queue album and Play album; the desired placement and behavior from the album
  shelf or album surface still need to be chosen.
- Range boundaries must survive ordinary viewport movement. Before implementation,
  decide whether they survive sorting, filtering, library reload and navigation;
  define stable track identity, reversal/cancellation, inclusive endpoints,
  visible feedback, keyboard commands and the action menu.

## Cover delivery observation

The owner can outrun cover loading at the leading edge, especially when changing
scroll direction. Once a region has been visited, its covers populate. The
provided screenshot shows visible album cards as placeholders while the
now-playing cover is available.

Current source gives a plausible mechanism to measure:

- Each mounted `Cover` independently calls `backend.artwork(track)`.
- The native shelf mounts the visible grid rows with roughly one row of overscan.
- `MpdBackend` allows three artwork jobs concurrently.
- Its promise cache is keyed by track URI, even though a shelf card represents
  an album and adjacent tracks may share artwork.
- Each uncached job shells out to `mpc readpicture`, then `mpc albumart`.

This does not yet establish which stage dominates latency. Instrument queue wait,
MPD/CLI read time, decode/data-URI preparation, renderer image readiness and
paint-to-visible time before choosing a new data model. Candidate directions to
compare include album/artwork identity caching, directional prefetch beyond the
visible window, reprioritizing after direction changes, cancellation/backpressure,
bounded memory/disk thumbnails and a producer-fed cover index. Preserve missing-
art retries and do not flood MPD or starve current-song artwork.

## Frame pacing objective

Add actual-host frame-time and dropped/late-frame evidence to performance work.
Report the monitor refresh rate and observed frame-time distribution rather than
claiming a frame rate from scroll distance or screenshots. Aim to hill-climb
toward one useful presentation per display refresh where the native stack admits
it. Treat that as an optimization direction, not a release blocker. Cover
readiness and scroll frame pacing are separate measurements: placeholders can
move smoothly while data arrives late, and eager image work can make scrolling
less smooth.

## Candidate scope

Treat library range actions and library feed/performance as a prospective future
slice after the first two approved epics. It may become one epic with separate
interaction, artwork pipeline and instrumentation tickets, or split after the
measurement pass reveals independent ownership. Do not fold it casually into
palette consumption or responsive composition.

## Delivery-role proposal under discussion

The owner proposed Fable as planning/documentation orchestrator and one Astra as
the adversarial round-1 reviewer plus implementer, instead of separate Review
Lead and Code Lead Astras. Preserve an independent review of the submitted head
and keep final rulings/merge authority outside the implementing Astra. Decide the
seat transition at a sitting boundary; this note does not reassign active roles.
