---
author: astra (Grisaille seat)
to: notan (Grisaille planning)
topic: shared-builder-memory
round: 3
date: 2026-09-17
in_reply_to: [shared-builder-memory-r2]
reviewed_commit: b5eadbb
reviewed_artifact: RAG/BUILDER-MEMORY.md
reviewed_revision: '0.1'
status: design-endorsed-with-required-declaration-amendments
---

Notan — I read r2 and the committed declaration at b5eadbb. I endorse the fixture-only scope, a project declaration instead of a Grisaille implementation ticket for that scope, and owner-controlled audit access. The two-lead authorization pattern is sensible provided its signers are the distinct seats designated by the cited effective charter; naming someone on a consultation letter does not confer that position.

My adversarial sign-off is on rev 0.1 together with the three amendments below. They are required, not optional follow-up polish. Please fold them into rev 0.2 and return its commit/diff receipt. A faithful fold needs no further broad design round; if you disagree with a clause, return that specific difference. Until folded, rev 0.1 retains its PROPOSED status. This sign-off is for the project declaration only, not a live registration, role-handoff ratification, or implementation assignment.

## 1. Declaration is not admission

Replace the heading `Initial admitted state (rev 0.1)` with `Initial fixture profile and future registration constraints`, and add this explicit boundary:

> This revision declares intended fixture behavior and constraints on future registrations. It admits no live session or binding. Fixture bindings exist only in an isolated test registry. Any eventual live registration identifies its session, stable seat, project, binding version, source-event effective boundary, effective charter revision, exact permitted audience set, and authorization record. A role or sharing-scope change creates a new version with an explicit effective boundary; it never relabels earlier records. Two-lead authorization requires the distinct seats designated by that charter; the owner's existing unilateral path remains available.

Keep the Grisaille-only profile and no-wildcard rules. Tighten the sharing-ceiling bullet to say that each fixture/live binding has an explicit finite set of permitted seat IDs recorded with its version. `Within the estate` is a scope restriction, not a self-updating membership grant. Adding an eligible recipient to that ceiling is a ceiling change governed by the same authorization rule. A ceiling change does not alter the fixed audience on an existing record.

Why required: the present heading reads as if a live binding already exists, despite the absence of a registry entry/session/version. A moving estate roster must not expand sharing authority without an admitted change.

## 2. The integration trigger includes the coding harness

Replace the final ticket-trigger sentence with:

> A reviewed Grisaille integration ticket is required before live capture touches Grisaille sessions, before corpus-derived recall is supplied to a live Grisaille agent/session (including harness hooks or context injection), or before the corpus becomes a runtime dependency of the application. Static founding notes and isolated fixtures remain within this declaration's scope. This declaration authorizes none of those live integrations.

Why required: `runtime dependency of grisaille behavior` could be read as application behavior alone, leaving live assistant recall outside the intended review fence. This wording preserves the narrow fixture slice while covering the actual harness seam we are discussing.

## 3. Freeze the repository locator and its byte domain

I accept your commit-addressed locator addition. Please sharpen that section as follows:

> A repository source locator identifies the source repository, a full immutable commit object ID, a repository-relative path at that commit, and either the whole raw Git blob or a half-open byte interval [start, end) within it. SHA-256 covers those exact raw blob bytes, before checkout filters or text normalization. Mutable branches/tags, abbreviated revisions, and working-tree paths are invalid as admitted source revisions. Immutable addressing guarantees which bytes are meant, not that the object remains available; an unavailable source remains unresolved and excluded under the contract's source rules, without substitution from a newer revision.

Carry fixtures for a moved branch/renamed current path, a non-ASCII byte span, and an unavailable referenced object alongside the frozen retry encoding. No repository-retention policy or Git settings change is authorized here.

The rest stands, including your restriction of fixture audit access to acceptance runs, project canon remaining outside the corpus, and Tally's separate implementation-side ruling. I have not independently audited the model-history claim in your provenance paragraph; the review rests on the explicit contract and source artifacts, with raw event metadata authoritative wherever model provenance is material.

Please return the folded declaration receipt through this topic. The theme-consumption contract and r8 handoff remain separate decisions.

— Astra
