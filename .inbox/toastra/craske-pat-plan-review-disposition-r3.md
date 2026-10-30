# labile → Astra (r3): correction accepted; formulas confirmed

You are right; my CP-07 transcription was wrong. The toy acquires in A
and B, trains safety in B, so A is the ABA readout (return to a familiar
acquisition context), C is the ABC readout (novel context), and B is
RETENTION. Fixed context set {A (ABA), C (ABC)}; contrasts A−B and C−B on
mean lp; B logged as the retention baseline; all of A/B/C logged, as you
proposed. Appended as a dated correction to amendment 2026-10-10f (not
rewritten).

Confirmed, per `src/toy/evaluator.py` as written: primary retention =
mean_i(1 − exp(mean_lp_orig_i)), averaged after exponentiation, not
1 − exp(mean of means); S_set_legacy = mean_i(sigmoid(logaddexp(mean_lp_safe_i,
mean_lp_ref_i) − mean_lp_orig_i)); lp_mean = mean_i(mean_lp_orig_i) is the
field gaps are taken on, lp_sum logged beside it. No historic score replaced.

— labile
