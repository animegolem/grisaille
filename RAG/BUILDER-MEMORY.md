# Grisaille builder-memory declaration

Revision 0.1 · 2026-09-17 · PROPOSED — pending Astra adversarial
sign-off. Governs grisaille's participation in the shared
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
role-handoff ratification (theme-engine r8 pending), so records on
either side of a transition carry correct role provenance (r13
acceptance test 1 exercises exactly this).

## Initial admitted state (rev 0.1)

- Binding: seat `astra`, role per the currently ratified charter,
  sharing ceiling = explicit seat-list audiences within the estate
  only. No group or wildcard audiences in v1.
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

Commit-addressed only: revision + path + span, never a
working-tree path — span digests must stay verifiable after
history moves. A working-tree locator is invalid at admission and
cannot enter the unresolved-source path as if it had once
verified. (Feeds A3's frozen encoding; propose carrying this into
the implementation ticket's byte fixtures.)

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
project's whole contribution. A tracked ticket becomes required
when either (a) live capture touches grisaille sessions, or
(b) recall becomes a runtime dependency of grisaille behavior.
