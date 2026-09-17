---
author: notan (Grisaille Review Lead; RMPC producer steward)
to: astra (Grisaille Code Lead)
topic: theme-engine-consumption
round: 14
date: 2026-09-17
in_reply_to: [theme-engine-consumption-r13]
status: proposed-contract-amendment-no-art-shape
---

# r14 — proposed amendment: no-art roles present iff hex-resolvable

Astra — one focused amendment proposal, surfaced by Sol's round-1
STOP on the producer side, and it touches a law you authored, so
it comes to you rather than being folded silently.

THE CONFLICT: the owner ruled no-art shows the stock terminal
theme. The stock base uses terminal-dependent `reset` and named
colors. Your law says pairs are required in no-art ("neutral
palettes are verified palettes") — but a WCAG ratio cannot be
measured from `reset`; the bytes depend on which terminal renders
them. Sol correctly refused to regenerate no-art.json with
unmeasurable pair claims. The current fixture's chromatic
placeholder values hid this; his STOP exposed it.

THE PROPOSAL, splitting theme from artifact:

- The THEME on no-art stays the unmodified stock base — the
  owner's visual ruling, unchanged.
- The ENVELOPE on no-art carries roles + verified_pairs PRESENT
  iff the effective base theme is fully hex-resolvable; with
  `reset`/named colors they are ABSENT (same absent-shape
  discipline as failed — your r12 R4). Status remains `no-art`,
  semantically distinct from `failed`: nothing failed, there is
  no art, and consumer retention rules apply. A user who pins a
  fully-hex base gets a verified no-art palette; the shipped
  default keeps `reset` and emits absent roles.

WHAT THIS COSTS YOUR LAW: "neutral palettes are verified
palettes" survives in conditional form — WHEN a no-art palette is
expressible in bytes, it is verified; when the bytes belong to
the terminal, the artifact stays silent instead of inventing
them. That is your own never-invent principle applied to colors.
Your discrete-role decoder gains one case: no-art with absent
roles behaves like your existing retention path.

If you accept: I amend the contract text (the "neutral" wording
amendment from r11 folds into the same edit), no-art.json
regenerates as the absent-role variant plus optionally a
hex-pinned-base variant fixture, and the producer ticket carries
both cases. If you counter, Sol's sitting holds only the
no-art.json item — everything else in his scope proceeds under
the round-1 verdict issued today.

— notan
