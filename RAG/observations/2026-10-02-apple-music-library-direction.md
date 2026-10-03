# Apple Music library direction — 2026-10-02

Recorded by the Grisaille Code Lead at the owner's request, from the owner
conversation. This is design intake for a future slice. It allocates no ticket,
changes no normative specification, and starts no implementation sitting.

## Owner direction

Grisaille should present one combined local and saved Apple Music library.
When a matching local copy exists, prefer it for playback and avoid displaying
the same item twice. Apple Music supplies items without a local match.

Keep the Apple Music surface focused:

- A distinct search bucket for Apple Music albums.
- An **Add to Library** action that saves an album to the owner's actual Apple
  Music library and subsequently includes it in the combined collection.
- No requirement for editorial feeds, recommendations, or a What's New view.
- Lossless playback is not a requirement for this integration.

The owner suggested Jev, already explored on the VampireOTP side, or a tiny
local classifier to handle most fuzzy matching, followed by manual checking.

## Proposed matching approach

The following is the working proposal from the discussion, pending a reviewed
contract and evaluation against the owner's collection:

1. Generate plausible candidate pairs with inexpensive metadata comparisons:
   artist, album, track listing, duration, and available recording/release IDs.
2. Ask Jev to classify candidates as an equivalent copy, a different edition or
   recording, unrelated, or insufficient information.
3. Review uncertain cases and sample confident matches. Establish what the
   owner considers interchangeable before choosing automatic-match thresholds.
4. Persist source identities, evidence, classifier/version provenance, labels,
   and human corrections. Reuse decisions while their inputs remain valid.

The decision is whether the local copy is an acceptable substitute. Remasters,
deluxe editions, live recordings, and incomplete local albums require particular
care. A false match can hide an edition the owner wanted; a missed match leaves
a visible duplicate that can be resolved later. Uncertainty must remain visible.

Deduplicate presentation while retaining both source records. Reviewed labels
could later support a small local classifier. Run matching during import or
synchronization and save its results, so browsing and playback do not wait on
model inference. Jev is a candidate here; no Grisaille calibration or integration
has been completed.

## Work still to scope

Separate library/search/matching work from playback coordination. The existing
Grisaille model uses an MPD backend; the future integration needs a reviewed way
to coordinate MPD and Apple's supported playback path through one queue and set
of controls. Catalog access alone does not establish that playback architecture.

Before a delivery brief, resolve:

- The supported Apple playback route for the native and terminal hosts, account
  authorization, and queue/transport ownership across source transitions.
- Album-versus-track equivalence, partial local albums, unavailable catalog
  entries, and behavior when a previously preferred source disappears.
- Match review and correction UX, thresholds based on measured errors, and
  invalidation when metadata or classifier policy changes.
- Library synchronization, including pending additions and reconciliation.

The library direction is retained alongside the earlier
[library-fluency observations](2026-09-09-library-fluency.md). Its scheduling
relative to palette consumption, responsive composition, and library fluency
remains for planning; it is not part of the current palette tickets.

## References carried forward from the discussion

These are starting points for the future feasibility pass, not a fresh API or
terms audit performed for this note:

- [MusicKit overview](https://developer.apple.com/musickit/)
- [Add a resource to a library](https://developer.apple.com/documentation/applemusicapi/add-a-resource-to-a-library)
- [Catalog songs by ISRC](https://developer.apple.com/documentation/applemusicapi/get-multiple-catalog-songs-by-isrc)
- [Jev alignment project](https://github.com/sutro-sh/jev-align)
- Estate context: `VampireOTP/RAG/design/NOTE-jev-align-active-learning.md`
  and `VampireOTP/.relay/inbox/jev-commitment-probe-r1-astra.md`.
- Grisaille seams to inspect when scoped: `src/model.ts`, `src/mpd.ts`, and
  `src/music-session.ts`.
