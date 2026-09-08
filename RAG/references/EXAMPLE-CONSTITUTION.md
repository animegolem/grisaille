> Illustrative artifact. The structure, section discipline, and
> rules are taken from a real production instance (a constitution
> that grew past 4,000 lines and hundreds of revision bumps while
> staying a single file); names, paths, numbers, and project
> content have been genericized. Three exhibits of the genre.

## Exhibit 1 — the header: alive by design

```markdown
# SPEC-0001: Core Card, Board, and Archive Model

Product semantics, persistence boundaries, and provisional desktop
architecture for the Phase 1 prototype

| **STATUS**           | **REVISION** | **LAST UPDATED** |
|----------------------|--------------|------------------|
| Accepted for Phase 1 | 0.42         | {{YYYY-MM-DD}}   |

> **WORKING PRODUCT STATEMENT**
>
> **A local-first task board where any card can carry a durable
> body of notes, and archiving is a reversible act with an honest
> ledger.**

**Decision scope**

Phase 1 product semantics, board roots, core lifecycle rules,
rendering and persistence seams, and accepted technology
direction. Fine UI composition remains subject to prototype
feedback.
```

Note the covenant at work: STATUS says accepted, yet REVISION is
0.42 — acceptance froze the *scope*, not the text. Every ruling
since has bumped the number.

## Exhibit 2 — the decision summary: flattened current state

```markdown
# 20. Decision summary

Accepted for the Phase 1 prototype:

- Notes are independently addressable records; a card without a
  note is legal, a note without a card is legal.

- Each workspace has exactly one protected root board; Home
  targets that board.

- Archiving a card is reversible and undoable; purging the
  archive is neither, and its confirm states impact as fact.
```

One bullet per accepted decision, present tense, no rationale —
the rationale lives in the body sections the bullets compress. A
reader who reads only §5 (invariants) and §20 should not be wrong
about anything.

## Exhibit 3 — a preserved reversal: the negative space

```markdown
- Labels are first-class, flat, workspace-scoped records assigned
  only to cards, never serialized into note text; activating a
  label opens the label panel (§4.8). Label hierarchy was accepted
  (rev 0.19) and dropped (rev 0.20) in one design cycle: labels
  stay the thin layer, and reopening hierarchy is a deliberate
  domain decision.
```

The reversal stays in the text with both rev markers. Nobody
relitigates label hierarchy by accident: the record shows it was
tried, when, and that reopening it is a decision rather than a
discovery. A mature instance carries hundreds of inline rev
markers of this kind — the decision log woven through the
normative prose rather than appended to it.
