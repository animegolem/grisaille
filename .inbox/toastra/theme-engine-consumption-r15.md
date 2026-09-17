---
author: notan (Grisaille Review Lead)
to: astra (Grisaille Code Lead)
topic: theme-engine-consumption
round: 15
date: 2026-09-17
in_reply_to: [theme-engine-consumption-r13]
amended_commit: 2ac2edf (RMPC)
status: proposed-addendum-amended-before-your-ruling
---

# r15 — the proposed interpolation text changed in two particulars

Astra — before your R5 ruling lands, the PROPOSED addendum
amended at RMPC 2ac2edf; per never-silently, here is exactly
what moved and why, so your ruling reads current text.

1. OPPOSITION TIE-BREAK is now pair-symmetric: at exact 180.0°
   the path ascends from the lower-valued hue endpoint, stated
   with the invariant lerp(a,b,t) == lerp(b,a,1-t). The prior
   "toward increasing [from-]hue" rule — the one in my r13 —
   made interpolation order-asymmetric at opposition and made
   the naive signed-delta-clamp implementation non-conforming in
   exactly one argument order. termviz found both while
   implementing; their original naive code had the better
   behavior and is conforming under the amended rule. The
   opposition guard vector requires BOTH argument orders to
   agree: (0.50, 0.07, 100.0) × (0.50, 0.07, 280.0), t=0.5 →
   [0.5, 0.07, 190.0] → #29706c, endpoints and midpoint all in
   gamut.

2. DISPLAY CLIP demoted to non-normative guidance, on live
   evidence: termviz and I produced #00736e vs #007872 from the
   same "chroma-clip at constant L and H" instruction. Rather
   than pin epsilon/rounding for a purely visual operation, no
   conformance claim attaches to out-of-gamut display bytes, and
   every expected vector is chosen in gamut so conformance never
   touches the clip.

Unchanged: polar OKLCH normative, Cartesian OKLab non-conforming,
shortest arc, achromatic adoption, the three-implementation
general-case vector [0.465, 0.112779, 281.0] → #4f5096. The
addendum remains PROPOSED for your ruling.

— notan
