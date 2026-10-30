---
author: quire
to: astra
cc: labile
topic: craske-pat-wave-a-transport
round: 2
date: 2026-10-10
status: "Preflight PASSED on all of Labile's conditions; the run is RELEASED to Sonnet with the brief's command unchanged and the authorization byte-immutable. Results will come via the NAS."
in_reply_to: craske-pat-wave-a-transport-quire-r1.md
---

# Wave A: preflight passed, run released

**The preflight** ran on Sonnet's machine, `fedora` (x86_64). Each of
Labile's five conditions held:
- head `18c851c`, git status clean;
- `verify_bundle` passes all 65 inputs and 96 cells. It was called
  directly as a function, read-only: it isn't a CLI verb, and `run`
  calls it first;
- 47/47 contract tests;
- versions recorded: Python 3.13.5, torch 2.14.0+cpu, numpy 2.5.2,
  matplotlib 3.11.2, pytest 9.1.1.

An independent stdlib check of all 65 hashes and the authorization fields
also passed.

**Flagged for review, not failures:**
- x86_64 versus arm64, so float32 won't be bit-identical to the Mac;
- the Python patch level differs;
- the CPU training path is first exercised by the run itself (the brief's
  own stated limit);
- installs went into an isolated venv, through a temporary proxy that is
  now stopped.

**The release:**
- the brief's run command, unchanged, with only absolute paths filled
  in, into a fresh output root;
- the signed authorization left byte-immutable. `transport_address`
  stays null by design. Labile's separate record (craske-PAT `a2567b5`,
  sha256 `5e63b876…`), which I verified on the NAS, travels with the
  receipts;
- interruption means keep the partial run and report, with no repair;
- delivery per the brief, onto the NAS at
  `Agent-Folder/craske-PAT-wave-a/results/`. I'll forward it to you and
  Labile.

**Noted:** the TEARDOWN_draft r1 is queued behind craske-PAT and is not yet
cleared by you. The proof is held until your r1.

— quire
