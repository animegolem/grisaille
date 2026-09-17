# Grisaille builder-memory declaration

Revision 0.2 · 2026-09-17 · SIGNED OFF — Astra's adversarial
sign-off (shared-builder-memory r3, on rev 0.1 commit b5eadbb)
required the three amendments folded into this revision; a faithful
fold completes the sign-off per that letter. Governs grisaille's participation in the shared
builder-memory corpus (advisory seam per
`sol-seat-memory-preference` r13 + Astra's required amendments
r14; fixture-based v1). Tally's ruling on the VampireOTP
implementation seam is separate and not constrained here.

## Namespace and source

Write namespace `grisaille`; canonical project source
`/Users/golem/git/grisaille`. A working directory is corroborating
evidence only — never identity authority (r13 law, adopted).

## Admission authority — who may admit a binding or ceiling

**Two-key rule.** Registering a grisaille binding, or changing any
binding's role or sharing ceiling, requires a proposal by one
project lead and sign-off by the other, recorded here by revision.
The owner may always act alone. **No seat may raise its own
sharing ceiling** — a ceiling raise is signed by the *other* lead
or the owner, never the beneficiary. Role names cite the charter
revision effective at binding time; binding versions bump on any
role-handoff ratification (the theme-engine r10 handoff of
2026-09-17 is the first such boundary), so records on
either side of a transition carry correct role provenance (r13
acceptance test 1 exercises exactly this).

## Initial fixture profile and future registration constraints

This revision declares intended fixture behavior and constraints
on future registrations. It admits no live session or binding.
Fixture bindings exist only in an isolated test registry. Any
eventual live registration identifies its session, stable seat,
project, binding version, source-event effective boundary,
effective charter revision, exact permitted audience set, and
authorization record. A role or sharing-scope change creates a new
version with an explicit effective boundary; it never relabels
earlier records. Two-lead authorization requires the distinct
seats designated by that charter; the owner's existing unilateral
path remains available.

- Fixture profile: seat `astra`, role per the currently ratified
  charter. Each fixture or future live binding carries an explicit
  FINITE set of permitted seat IDs recorded with its version — the
  sharing ceiling. "Within the estate" is a scope restriction, not
  a self-updating membership grant: adding an eligible recipient
  to a ceiling is a ceiling change governed by the same
  authorization rule, and a ceiling change never alters the fixed
  audience on an existing record. No group or wildcard audiences
  in v1.
- No other grisaille bindings. Unknown or conflicting sessions
  reject per the r13 decision table; nothing acquires the
  namespace by cwd.
- Profile: `astra` owns the astra profile; initial subscription is
  grisaille only. Profile edits per amendment A1 (admitted owner
  or explicitly authorized operator; a write grant confers no
  profile ownership).
- Audit surface (A2): restricted denial diagnostics for
  grisaille-namespace records are an operator surface authorized
  by the owner; the fixture harness's audit access is scoped to
  acceptance runs and confers nothing outside them.

## Source locators into this repository

A repository source locator identifies the source repository, a
full immutable commit object ID, a repository-relative path at
that commit, and either the whole raw Git blob or a half-open byte
interval [start, end) within it. SHA-256 covers those exact raw
blob bytes, before checkout filters or text normalization. Mutable
branches/tags, abbreviated revisions, and working-tree paths are
invalid as admitted source revisions. Immutable addressing
guarantees which bytes are meant, not that the object remains
available; an unavailable source remains unresolved and excluded
under the contract's source rules, without substitution from a
newer revision.

Implementation-ticket fixture requirements (carried with A3's
frozen retry encoding): a moved branch / renamed current path, a
non-ASCII byte span, and an unavailable referenced object. No
repository-retention policy or Git settings change is authorized
here.

## Boundaries (restated as binding here)

- No import of private or mixed logs; the first corpus holds only
  deliberately shared records or explicitly shareable references.
- A locator grants no authority to import or dereference source.
- Corpus records are working evidence. Grisaille canon lives only
  in SPEC/tickets; nothing recalled from the corpus is citable as
  ratified law.
- No grisaille hook or capture changes without a reviewed
  grisaille ticket. None exists; this declaration authorizes none.

## Disposition on integration work

The fixture-based initial seam requires **no grisaille
implementation ticket** — this reviewed declaration is the
project's whole contribution. A reviewed Grisaille integration
ticket is required before live capture touches Grisaille sessions,
before corpus-derived recall is supplied to a live Grisaille
agent/session (including harness hooks or context injection), or
before the corpus becomes a runtime dependency of the application.
Static founding notes and isolated fixtures remain within this
declaration's scope. This declaration authorizes none of those
live integrations.
