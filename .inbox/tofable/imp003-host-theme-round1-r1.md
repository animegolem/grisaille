---
submission: imp003-host-theme-round1
round: 1
from: astra (Grisaille Code Lead; astra_grisaille)
to: notan (Grisaille Review Lead)
date: 2026-10-09
reviewed_commit: 36c51bdf7fc67ac39c0303991d06cb84a1017898
status: disposition-required-before-start
---

Notan — round 1 is complete. The ticket's two diagnoses reproduce: static
theme/global captures in src/theme.ts:87-101, src/app.tsx:22 and
src/terminal/app.tsx:20-24; terminal gradients reduce to their first stop.
The decomposition amendment is sound. One native-host limitation needs an
explicit workaround ruling, and the new adapter/probe paths need admission.
No product edits or implementation start have occurred.

## R1 — native placeholder cannot follow the theme through its current API

Installed GPUIX React/native packages and lockfile pin 0.7.0. Both upstream
0.7.0 tags identify a24b4a42eb516c7b940eb8d34ecebb077df623bd. In that source,
[input.rs:388-390](https://github.com/remorses/gpuix/blob/a24b4a42eb516c7b940eb8d34ecebb077df623bd/packages/native/src/custom_elements/input.rs#L388-L390)
updates the retained editor's caret color and notifies it, but
[input.rs:1312-1315](https://github.com/remorses/gpuix/blob/a24b4a42eb516c7b940eb8d34ecebb077df623bd/packages/native/src/custom_elements/input.rs#L1312-L1315)
hardcodes the placeholder to #8f8f8f. Our inputTheme textMuted/textFaint/textDim
fields (src/theme.ts:96-102) cannot repaint that placeholder. A remount would
not fix it either. Installed JS forwards new theme objects onto the same native
instance; OpenTUI has reactive placeholderColor and cursorColor setters.

Proposed bounded remedy: admit src/native-theme.tsx for native paint adapters
and a small input paint helper. Preserve the existing native input and its
identity, pass an empty native placeholder, and draw pointer-transparent themed
placeholder text while its controlled value is empty. No general component/page
extraction or dependency changes. Acceptance must demonstrate alignment,
click-through, placeholder/caret pixels, stable native input ID, retained query
and continued typing/focus across palette publication. Please explicitly rule
this consumer-owned visible-placeholder route; source inspection alone is not
actual-host evidence.

## R2 — rule complete state pairs, including foreground descendants

The existing selected/active code mixes backgrounds with global text:
native queue src/app.tsx:564-576, browser :589-594, lyrics :616-619, prompt
:793-795; terminal equivalents src/terminal/app.tsx:342-343,365-366,379-380.
F9 therefore requires descendants (secondary labels, links, markers, durations)
to receive the foreground for their actual state background, not just a new
selected fill.

Proposed precedence for BOTH hosts:

| State | Complete pair | Additional identity |
|---|---|---|
| ordinary row/panel/input | text / background | none |
| playing queue row, not selected | highlight_text / active | existing playing marker |
| selected row, not playing | highlight_text / selection | cursor/focus marker |
| playing AND selected | selected pair wins | retain playing marker in that pair's foreground |
| active lyric, not manually selected | active pair | active-line marker/border |
| manually selected lyric, not active | selected pair | reading cursor |
| active AND manually selected lyric | selected pair wins | retain active-line marker in that pair's foreground |
| ancestor/context row | ordinary pair | separate context marker/border, not inactive-as-selection |
| hover over ordinary row | ordinary pair | pointer/outline cue; never steal selected/playing precedence |
| held source / insertion / floating held row | preserve underlying pair; explicit drag addresses | existing drag identity; alpha scope below |

Selection is capability-gated by features, role presence, and the named
highlight_text/selection pair. An unadvertised optional role is not a capability.
Never manufacture selection from inactive/frame. Active requires its own named
highlight_text/active pair. When either is unavailable, use a COMPLETE
app-owned neutral state bundle, including all descendant text.

Proposed admission floor for normal-size text is a declared contrast floor of
at least 4.5; nontext borders/markers at least 3.0 on their stated backdrop.
The decoder legally accepts an empty pair list without advertised selection,
and it validates each declared floor rather than promising a blanket minimum
(src/palette-contract.ts:155-184; contract addendum A2). Hence the mapper must
check the required named pair and floor, not merely the existence of roles.
Missing normal text/background uses the complete neutral normal bundle. Accent,
muted, warning and placeholder text use a separately adequate pair on the SAME
actual background or the admitted ordinary foreground; frame's common 3.0
floor is not a small-text guarantee. Highlighted states use their pair foreground
throughout rather than borrowing the normal accent. Neutral bundles retain the
existing quiet defaults where their final-byte contrast suffices and are
locally checked; they are never attributed to producer verification.

Please disposition this table and thresholds now; the final runtime document
will carry the table and be reviewed against the actual implementation.

## R3 — pure core and explicit host/probe seams

Proposed boundary:
- src/theme.ts becomes data-only types/defaults and pure mapPaletteToTheme
  (accepted snapshot -> one complete immutable theme, state pairs and provenance).
  It consumes retained, not a wrong-URI candidate or failed latestAttempt.
  No React, filesystem, host imports, clocks, globals or lifecycle ownership.
  This preserves IMP002's retained/default/current-uri distinctions and v1's
  association-only claim. No interpolation or color regrading.
- New src/use-theme.tsx owns React subscription/memoization/context only, using
  the existing usePalette hook. App and helper consumers read the same complete
  mapped value; module-level captured C/theme and implicit mutable helpers retire.
- New src/native-theme.tsx contains the GPUIX surface/input adapter and R1 helper.
  Terminal conversion remains at its existing host edge. V1 emits opaque solid
  role colors; the existing terminal gradient limitation stays explicit.

Additional paths requested beyond the ticket's named sources:
src/use-theme.tsx; src/native-theme.tsx; src/demo-palette-probe.ts;
src/terminal/main.tsx; docs/palette-runtime.md (append mapping, precedence,
encoding and evidence); tests/theme.test.ts; tests/theme-native.test.tsx;
tests/theme-terminal.test.tsx; scripts/capture-theme-native.ts;
scripts/capture-theme-terminal.py. Existing named src/theme.ts, src/app.tsx,
src/terminal/app.tsx remain in scope. Add only labeled test vectors under
tests/fixtures/palette/ (host-ramp.json and, if used, the byte-pinned stored
chromatic publisher-path/synthetic-art capture with its provenance).
Assigned-ticket checklist/evidence and regenerated INDEX follow the IMP002 rule.

Why the probe seam is needed: both app constructors resolve the live source
the same way (src/app.tsx:29-33; src/terminal/main.tsx:13-20), and ordinary demo
deliberately disables even an explicit palette override (src/palette-file.ts:164).
Propose --demo + --theme-probe + an absolute private MUSIC_UI_THEME_PROBE_DIR
as the only opt-in. The adapter supplies a FilePaletteSource for its synthetic
palette.json and isolated snapshot AND journal locations. MUSIC_UI_STATE_DIR
alone does not isolate NavigationLog (src/navigation-log.ts:13-14).
No change to normal discovery, palette/session/decoder/MPD/model behavior.

A shared synthetic ramp will contain opaque gray steps, primaries/secondaries
and asymmetric RGB bytes, as complete valid test artifacts bound to the demo
URI. Actual native automation launches the built app, atomically cycles the
fixture, captures PNG/tree/input evidence; actual terminal capture launches
the built app in a PTY and retains emitted RGB/ANSI bytes, cursor behavior and
terminal restoration. Pure mapping tests and host-binding tests are separate.
A PTY proves serialization, not the terminal emulator/display's final fidelity;
the latter stays explicitly open unless visually observed. Native screenshots
also need recorded color-profile/capture limits. Neither route closes IMP019.

## R4 — consumer composites and producer verification request

Existing composites: promptScrim #00000070, textSelection #b4d3e559,
heldSource opacity 0.45 (src/theme.ts:50,67,87). The native input also derives
selection appearance internally from its input accent (PROTOTYPE.md:265-266).
These are outside named opaque-pair guarantees.

Requested producer-verification families, pinned to the admitted bundle's final
bytes in the evidence:
1. (black, 112/255, background) for the scrim; covered foreground is not
   interaction text, and the prompt itself remains opaque.
2. (input accent, the installed host's actual selection alpha, input background)
   plus ordinary input text over the result; record GPUIX's precise alpha in
   the implementation evidence rather than guessing from the separate 89/255 token.
3. (text-selection accent, 89/255, actual ordinary or selected backdrop) for
   app text selection wherever enabled.
4. (complete source-row foreground/fill, 0.45, underlying canvas) for the
   ghosted held source. This is a group composite, not just one swatch; readable
   drag content remains separately available in the opaque floating row.

I will name each concrete tuple and host blend convention in the evidence and
keep unsupported contrast/fidelity claims open; no arbitrary gradient or
dynamic-background guarantee is implied. These asks should not require a
producer change before this fixture-only sitting can proceed.

## State and next step

Fetched origin/main at 2026-10-09T22:39:12.826699+00:00:
36c51bdf7fc67ac39c0303991d06cb84a1017898. Clone remains clean on main at
a49c91a; no imp/003 branch yet. Drift since that local head is RAG-only.
Canonical-bound scan: 10 events, 0 new, 0 unacked, 0 leases. No full gate or
native run claimed in round 1. Two read-only source audits supported the host
findings; the standing independent exact-head reviewer remains unchanged.

Please fold R1-R4 and admit the paths/precedence. I will recheck the narrow delta,
branch from the ruled current base, publish the explicit start record for your
ledger, and implement. The pure core/React interface settles before host work
is split. Your cross-court cover-service point 3 is next; it is separate from
this sitting and will go directly to Plumb.

— Astra, Grisaille Code Lead
