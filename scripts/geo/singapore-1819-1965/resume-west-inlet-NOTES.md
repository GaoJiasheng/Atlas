# Fix 2026-11-09 — western inlet source comparison, not delivered geography

**Status: comparison only. No root integration, published data, reviewed source JSON or historical fact was changed.** There is no independently qualified G15/G35 coast crossing north of this inlet in these outputs. Do not replace the complete dated G15 inlet with this limited source selection, and never turn its water-only caps into shorelines.

Source: G35, ANU original October 1958 GSGS map `raw/resume-source-anu1958.jpg`. Native coordinates use the source crop origin `[400,3400]` in the original scan. Source/licence and registration status remain the main task's responsibility; this audit makes no new RMS or positional-accuracy claim.

Qualified deliverables:

- `resume-west-inlet-water.json`: Tengeh main-channel comparison, **1 connected part, 290 vertices, 10,015 native selected pixels**. Status is `SOURCE_CORE_REVIEWED_COMPARISON_ONLY`.
- `resume-west-inlet-bank-arcs.json`: **2 open source-bank arcs, 282 vertices**. All image/comparison-frame and upstream water-selector caps are omitted. Do not connect the arcs with a new coast segment.
- Reproduction: `resume-west-inlet-water.py`; raw source-component experiment: `resume-west-inlet-classify.py`.

The qualified comparison frame is native `[275,195,506,470]`. Its x275/y195 edges cross actual mouth water and are internal selectors. The upper-water selection ends approximately `[498,429]`–`[500,438]` across a resolvable channel section. Those are not assertions that the river ends there. No polygon width is invented for the eastern continuation. The lower paired S-loop is source-visible through approximately native y465.

The independent native blue/black/red-near-blue classifier established the broad channel. At the long red grid that coincides with a riverbank, a coarse column interpolation was rejected: it would have manufactured the bank shape. Fresh native 10px readings and a narrow source-blue path instead establish both banks. Guides refine at most 4px to visible blue ink. Printed *Tengeh* letters attached to the east bank are replaced by its visible blue source line, rather than copied as coastline. The longest remaining source-print gap is 5 native pixels near a printed grid/label; endpoints, path counts and source distances are recorded in JSON. Tiny disconnected Blutang water intersecting the comparison frame was excluded by source/channel scope, not minimum-area pruning.

**Rejected, not delivered:** the whole-sea/Blutang barrier draft copied coastal lettering into false bays and islands. Its context overlay is explicitly named `work/resume-west-inlet-sea-draft-NOT-QUALIFIED.png`. Its geometry is not retained in the qualified core JSON. The narrow eastern continuation has several visible white-water patches separated by opaque blue printing; continuity of two distinct banks could not be qualified, so those pieces and any inferred connector are excluded.

Actual offline visual checks:

- `work/resume-west-inlet-water-overlay.png` — qualified core water over native source.
- `work/resume-west-inlet-banks-overlay.png` — source banks only, with all selector caps omitted.
- `work/resume-west-inlet-core10.png` and `...tengeh-word10.png` — native grid evidence for S-loop and label bank.
- `work/resume-west-inlet-east10.png` and `...narrow-trial.png` — evidence for the unqualified eastern continuation.

Integration recommendation: retain the root's dated G15 inlet, splice it only at a real source-bank intersection, and restore historical western source land before modern reservoir/canal cuts. The new G35 core is an independent comparison and future replacement input. A future complete G35 adoption must establish the remaining source banks and a safe northern crossing; a rectangle, arbitrary new shore connector or exposed water cap is not a substitute.
