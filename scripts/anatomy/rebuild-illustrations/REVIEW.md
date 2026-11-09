# Rebuild 2026-11-05 — six muscle covers and three exercise sketches

Current cover acceptance grade: **B overall**. The revision-15 named-defect A judgement was rejected by the root final-pixel review and is withdrawn. See the later rejection and revision-18 records; older A statements are historical worker judgements, not the current acceptance state.

The cover source is native Z-Anatomy geometry (CC BY-SA 4.0), selected as a complete superficial body set rather than the former regional subsets. No skeleton is included. The true full-body skin is rendered as a closed pale backing for a covered head/neck, hands, feet, and interstitial connective-tissue areas. The initial native source mesh set had 516,994 unique triangles; native rhomboid and posterior thoracic-wall surfaces were added after the source-coverage review. Two-sided fascia copies are counted separately in offline raster triangle logs. This geometry is **offline illustration source**, not a new shipped model or runtime performance cost.

The preview imports the root's `rebuild-evidence/studio.ts`: the fossils numerical studio with sampled installed RoomEnvironment, engine studio key/fill/rim, exposure and ACES. It is not a flat silhouette or Blender Workbench render. GPU material/shadow acceptance remains separate. Cover compositing is explicitly illustration finishing, not a claim to repair runtime GLB topology.

## Reproduction

`node scripts/anatomy/rebuild-illustrations/rebuild.mjs 18 --covers-only`

This runs `render-covers.ts` (source meshes/studio + body backing), `graphite.ts` (shared contours, tonal transfer, sparse hatch, covered-head and midline finishing), `process-owned.mjs` (the unchanged `scripts/illustrate.ts` in a temporary shadow workspace, copying only owned WebPs back), exercise SVG geometry and the saved ImageGen graphite transfers, and QA sheets. No shared illustration mask file is written in the repository. The new coverage masks are retained in `coverage-masks.json` for review.

## Visual looks and changes

1. First look: the full-body source set removed the former skeleton/holes but the rendering was pale, uniform hatching obscured volume, the platysma reached the jaw like a beard, and upper-body covers ended abruptly at the frame. Increased target contrast, changed upper-body framing consistently, used a covered head, and added a soft lower-thigh fade. The legs cover retains the full figure and both feet.
2. Second look: the posterior hatch still flattened the trapezius, and the anterior ragged medial pectoral edges read like a segmented spine. Reduced hatch ink strongly, retained a smooth pale anterior band and an unsegmented posterior median raphe finished from adjacent native tissue tones, and feathered its transition across the sternum. Removed the hard neck cutoff. A horizontal tone step introduced by a lower-back adjustment was caught at full size and removed by blending **before** edge extraction.
3. Third/final look: found that the graphite transfer saturated dark posterior pixels (raw 60–107) into one value. Remapped the entire 0–255 range so genuine studio fiber relief survives. Tested reverse faces for native single-sheet fascia; the infrascapular windows required more native floor anatomy. The main session identified missing rhomboids; those alone did not close the whole interval. Added native intercostals, iliocostalis/longissimus thoracis and serratus posterior surfaces after checking the IFAA anatomical floor description. No generic fascia-tone fill is used in the final transfer. Back gluteal distal insertion is retained in pale context rather than a dark detached flap. Final 2× detail sheets and paper/cinema 420px pairs are in `comparison-sheets/`.
4. Exercise look 1: the initial bottom bench elbow outlines tangled, and the bar was too high. Rebuilt the rounded arm paths, kept upper/forearm lengths consistent, and placed the bottom bar at the lower sternum with vertical forearms. In heel walking, increased forefoot pitch from 25° to 30°. Cable panels reuse the same complete column, trunk and support-leg transforms.
5. Exercise look 2: checked the final two-panel relationships: start bar directly over shoulder, bottom bar clear of face; all heel-walk forefeet above the datum; near cable leg moving inward across the same planted leg with the column unchanged. The code asserts the bar/shoulder and bottom forearm relationships. After the second enlargement, broadened the standing figures and enlarged their head height for an approximately eight-head adult proportion; the projected shoe lift remains about 24.8°.

## References

Historical reference plates are public-domain Gray/Carter scans. Triangle-of-auscultation source coverage was checked against https://ifaa.unifr.ch/Public/EntryPage/TA98%20Tree/Entity%20TA98%20EN/01.2.05.006%20Entity%20TA98%20EN.htm and https://www.ncbi.nlm.nih.gov/books/NBK539834/ . The shared reference files are in `../rebuild-evidence/refs`; the additional anterior thigh plate is `sources/Gray430.png`. The per-image JSONL lists 2–3 reference URLs and six named checks for each cover, and two technique references plus six checks for each exercise. The reference pages were consulted and the final sheets viewed. These are illustrative adult-reference anatomy, not measured cadaver/proportion claims.

- Anterior chest/arm: https://commons.wikimedia.org/wiki/File:Gray410.png
- Posterior trunk: https://commons.wikimedia.org/wiki/File:Gray409.png
- Abdominal wall: https://commons.wikimedia.org/wiki/File:Gray392.png
- Forearm: https://commons.wikimedia.org/wiki/File:Gray414.png
- Hand: https://commons.wikimedia.org/wiki/File:Gray424.png
- Anterior thigh: https://commons.wikimedia.org/wiki/File:Gray430.png
- Posterior thigh/calf/foot context: https://commons.wikimedia.org/wiki/File:Gray434.png ; https://commons.wikimedia.org/wiki/File:Gray438.png ; https://commons.wikimedia.org/wiki/File:Gray441.png

## Ownership and limits

Only the six owned covers, the three named exercise WebPs, and this new scripts directory were written. The masks generated by illustrate.ts remain in this directory; updating the shared runtime coverage manifest is outside this task's ownership. The drawings use identical native pose proportions and shared rendering/line rules. The exercise drawings start as original code-drawn SVG paths; the final rasters are built-in ImageGen graphite transfers of those paths, visually rechecked after generation. They preserve teaching relationships and do not purport to be exercise coaching or a biomechanical simulation. No content labels, chapter/beat references or teaching numbers changed.

Final per-file byte counts are in `image-metrics.json`. The illustrations add no triangles, draw calls or GLBs at runtime. Root owns full project gates and the runtime body/equipment acceptance.

## Pending shared integration

The six footprints changed substantially. `src/lib/home.ts` consumes the shared 16×16 alpha masks for home-page leader anchoring. `shared-coverage.patch` is a concrete **unapplied** patch changing only the six muscle masks in `src/lib/illustrations.json`. Applying it is outside this worker's ownership and remains for the main session; the new covers must not be accepted with their old leader masks. `coverage-patch.py` regenerates the patch after the final source refresh.


## Resume audit 2026-11-09

The earlier “final” sheets were reopened at 2× and rejected for an additional factual problem: the native external-oblique aponeurosis covered the rectus abdominis. That caused two broad uninterrupted abdominal sheets even though the manifest claimed rectus intersections were visible. The illustration source now reflects this native aponeurosis along a curved semilunar boundary measured from the native rectus envelope, exposing the **actual rectus mesh and its three transverse intersections**. No invented six-pack strokes are painted onto the image. This is a source-geometry change before graphite transfer; it is not a claim to modify the runtime dissection model.

- Look 10: exposed rectus; rejected the pale gaps along its lateral margin and the residual dissected jaw. Narrowed the aponeurosis reflection to overlap the native margin by 6 mm, narrowed the pale midline, and blended neck tissue into an undissected head outline.
- Look 11–12: caught a small horizontal opacity step at the head/neck blend and tendon-only digits within covered-hand outlines. Replaced the binary head-alpha cutoff with a continuous alpha blend; blended native distal tendons into complete covered hand and foot silhouettes. The smooth pale anterior band stays unsegmented.
- Look 13: reopened the anterior/posterior plates; the rectus intersections and oblique wrap are legible and no transverse “vertebrae” cross the linea alba. Neck blends continuously into the covered head. Kept gluteal muscles in pale context in the back cover so their real distal insertion margins do not read as dark detached flaps.
- Look 14: refreshed all six body backings from the then-current 2026-11-09 GLBs, then ran the unchanged `illustrate.ts` in the temporary owned-output workspace. Checked the final WebP composites, characteristic-detail enlargements, reference pairs and 420 px paper/cinema pairs. The final cover source contains 632,576 native/clipped unique triangles (1,265,152 two-sided offline raster triangles); this adds **zero runtime triangles, draw calls or GLB bytes**.

The nine illustration checklists have six items each and are copied to each relevant topic's `illustration-manifest.jsonl`. Self-grade **A for the specific docs/69 defects and countable exercise relationships**. This is not an A claim for photo-matched runtime anatomy: native source dissection margins remain stylised and the offline muscle micrograin/shadows are approximate. The pale scapular interstices are backed tissue and contain no skeleton or transparent opening; they should not be described as entirely muscle-filled.

Verified sources on 2026-11-09: Wikimedia Gray392 / Gray409 / Gray410, NASM barbell bench press, ACE standing hip adduction, MSD heel-walking video and NHS Inform heel walking. The obsolete Michigan PDF now redirects to its patient-library welcome page; the manifest replaces that URL with the live NHS Inform instructions. No technique dosing or medical-benefit claim is derived from these sources.


### Exercise final art pass (2026-11-09)

The earlier geometric SVGs corrected relationships but were an obvious artistic downgrade beside the prior graphite plates. They were retained as deterministic pose inputs, then passed through the built-in ImageGen tool for a detailed graphite finish. The three output PNGs are vendored in `sources/imagegen/` and the prompts/provenance are in `imagegen-prompts.md`. The finishing source keeps a thin authored heel-contact datum. `process-owned.mjs` chooses these saved images, then the unchanged `illustrate.ts` handles saturation, alpha fitting and WebP output. Reproduction does not call a remote generator.

The final rasters were reopened at 2400 px and in paper/cinema 420 px pairs. Both bench panels show an athlete on the same flat bench, shoulder-region lockout, lower-sternum descent with near-vertical forearms, face clear, two plate packs and visible hubs/collars. Every visible heel-walk forefoot remains visibly lifted, and the heels meet the datum (the far standing foot overlaps the near foot in side profile); the second panel takes a small step. Cable adduction keeps the same complete column on the same side, near-ankle cuff with continuous low cable, and the near leg crosses in front of the planted support leg. Generated pixels are **not** described as exactly preserving the input coordinate values. Those values assert the source relationship; final fact checks are visual.

Image metrics in `image-metrics.json` include all 15 delivered WebPs (six 1× + six 2× covers + three exercises), hashes, dimensions, alpha margins and RGB channel spread. The cable sketch is about 3 KB above illustrate.ts's 110 KB **target** at its minimum quality; retained to avoid crushing hand, pulley and ankle-cuff detail. This is reported rather than hidden. All final WebPs have maximum decoded RGB-channel spread 1 (lossy WebP rounding), positive alpha margins and the required dimensions. Art-pass delivered raster bytes before the revision-15 backing refresh: 2,098,588 before → 1,284,148 after.


### Final native-body refresh — revision 15 (2026-11-09)

The main session replaced the provisional voxel-derived backing with the final native-body reconstruction: 242 native skin panels joined across small gaps (3 mm threshold), axial cavities filled, 30k body faces plus 7.5k per hand. Revision 15 refreshes **all six cover backings from those final GLBs**. The independent muscle source, aponeurosis reflection, continuous pale alba and graphite line weights are unchanged. Exercises remain byte-identical to the approved art-pass outputs; the cover-only reproduction flag does not write them.

`render-provenance.json` fingerprints every backing GLB and the muscle packet, plus the actual executing Lighting.tsx source and installed RoomEnvironment. `verifyRig()` checks the live renderer's light directions, intensities, exposures, hemisphere/environment and material-emission binding before recording provenance. This documents the numerical studio; GPU/shadow equivalence is still not claimed.

Reproduction: `node scripts/anatomy/rebuild-illustrations/rebuild.mjs 18 --covers-only`, then `node scripts/anatomy/rebuild-illustrations/write-manifest.mjs`. All nine checklists retain six items; covers record revision 15 and their exact backing GLB hashes. The shared coverage patch remains unapplied because its target is outside ownership.


Revision-15 final visual look: reopened all six characteristic-detail crops at 2× and all six 420 px paper/cinema pairs after WebP processing. The new native backing leaves continuous head/neck, palm/digit and foot outlines, with no new segmentation or transparent breaks. Rectus intersections remain exposed in the anterior plates, alba remains a smooth pale band, and no skeleton or vertebral rows enter the muscular render. Existing source-edge stylisation and pale scapular interstices remain the stated limits. No further asset correction was needed. Self-grade for the named docs/69 defects remains A.

Final revision-15 metrics: all 15 delivered WebPs total **2,098,588 → 1,292,018 bytes**. Covers at 1600 px (arms/back/chest/core/legs/shoulders): **117,334 / 112,038 / 116,862 / 115,960 / 106,616 / 114,102 bytes**. Their 800 px variants: **54,118 / 48,838 / 53,742 / 53,452 / 45,010 / 50,056 bytes**. Frozen exercises remain **108,458 / 80,106 / 115,326 bytes**. Dimensions, positive alpha margins and RGB spread ≤1 pass. Geometry source remains 632,576 unique / 1,265,152 two-sided offline triangles; runtime geometry/draw calls/GLB bytes added by the illustrations remain zero.


### Root final-pixel rejection of revision 15 — 2026-11-09

The root session reopened the exact revision-15 core detail and rejected its anatomical legibility. Although the oblique aponeurosis had been reflected in source geometry, both rectus and obliques used the same target grey and the graphite transfer added the same diagonal hatch across them. The paired rectus border merged into the obliques; its three real surface grooves did not read clearly enough. **The revision-15 named-defect A claim and claims of passed rectus legibility are withdrawn.** Earlier “checked” log statements record that worker judgement, which this root review supersedes.

Diagnostic-only images `review/core-rectus-isolated.png` and `review/core-rectus-ownership.png` show the actual native rectus alone and its red mesh-ownership region against blue obliques. These prove the geometry source and three relief grooves, but are not evidence that the old final graphite image communicated them. A search of the original FBX confirms no separate named tendinous-intersection mesh; grooves are in the native rectus geometry itself.

Revision-16 style study separated rectus from pale obliques and removed generic diagonal hatch from the projected rectus region. The three native relief grooves became legible without drawing segment lines. Its first smooth midline ribbon had an overly broad lower-sternal flare, which read as a T-shaped notch; rejected before public processing. Revision 17 uses the native alba's sampled anterior profile and width, repeatedly smoothed, and continues its upper width over the sternum. Posterior plates retain their original native midline source. The old two-dimensional pale midline paint is removed, so a smooth source mesh controls the band.

Final cover self-grade is **B overall**, including after these fixes. Exact-photo and GPU acceptance remain outside this offline review, and native dissection-margin stylisation remains visible. Exercise images and their independent countable-fact reviews remain frozen.


Revision 17 source-profile study removed the synthetic width flare. Revision 18 additionally smooths only native medial pectoral surface vertices, with every displacement bounded to **2 mm** from the native source, to soften dissection-cut serrations near the lower sternum. No rectus segment lines or painted tendon intersections are added. Cover manifests describe this derived ribbon and bounded finishing explicitly; they no longer claim every final fascia vertex is an untouched native surface.


The first bounded smoother selected topological boundary edges. Comparing the exact raw core output showed **identical bytes**, revealing that those native muscle caps are closed and that the boundary-only pass did nothing. It was rejected before public processing. The final smoother instead uses actual medial surface one-ring adjacency, bounds every displacement to 2 mm, and records changed-vertex counts and maximum displacement in `surface-finishing-r18.json`. This audit checks the executing geometry's changed positions rather than an intended parameter.


Final source finishing also includes the **upper medial rectus attachment cap** in the same bounded 2 mm one-ring smoothing. The three rectus grooves are below Y=1.20 m and receive zero deformation from that cap finishing. The native upper attachment around the xiphoid remains broader than the alba below; it is not represented as a perfectly constant-width tendon or silently graded A. Checklists explicitly distinguish that upper contour from the smooth alba below it and attach their checks to the exact final WebP SHA-256.


### Final accepted offline state — revision 18 (2026-11-09)

The root session reopened the **exact final core@2x WebP** and accepted **B**, observing distinct paired rectus with three native grooves, no generic diagonal overprint on rectus and a continuous pale band below the source-specific xiphoid attachment. The widened native attachment/cap and remaining dissection edges remain documented limitations; there is no renewed A claim. The worker then reopened all six final 2× characteristic crops and all six 420 px paper/cinema pairs. No further cosmetic changes were made after this freeze. This is offline illustration acceptance, not GPU or exact-photo acceptance.

Final frozen hash records: `image-metrics.json` for all **15 WebPs**, `render-provenance.json` for the **six final body GLBs** and actual studio fingerprints. All 21 hashes were recomputed against the files after final processing and matched. The nine six-item manifest entries include the exact final WebP SHA-256; all cover entries are revision 18 and self-grade B overall. Exercise entries and their image bytes are unchanged. The coverage patch is final and remains unapplied outside ownership.

Final 15-image bytes: **2,098,588 → 1,280,800**. At 1600 px, arms/back/chest/core/legs/shoulders are **115,828 / 112,014 / 114,316 / 111,668 / 105,200 / 114,044 bytes**; at 800 px they are **53,758 / 48,864 / 53,358 / 52,694 / 45,122 / 50,044 bytes**. Exercises remain **108,458 / 80,106 / 115,326 bytes**. Required dimensions, positive alpha margins and maximum decoded RGB spread 1 all pass.

The final source mesh counts are **632,518 unique / 1,265,036 two-sided raster triangles for anterior plates** and **632,576 / 1,265,152 for posterior plates**. The illustrations add **zero runtime triangles, draw calls or GLB bytes**. Surface-position audit confirms 17 clavicular and 388 sternocostal vertices per side moved within 2 mm, plus 275 left / 273 right upper rectus cap vertices; all three native rectus grooves below Y=1.20 m remain undeformed. No drawn six-pack lines or painted tendon bands were used.
