# Digestive system · 3D rebuild evidence

## Rebuild 2026-11-05

Batch date requested by Gavin; executed 2026-11-09. Scope: all four procedural close-ups named by docs/68 and its biology review. The 28 original anatomy nodes remain unchanged, including mouth teeth, J-shaped stomach, intestinal coils, accessory organs and contextual body systems (retained grade **A**). This reconstruction uses original local sculpting code; no imported mesh, photograph texture or runtime network request.

### Scientific references inspected

The reproducible source index is `scripts/geo/digestive-system/reference-manifest.json`; `fetch-refs.ts` restores its downloads/crops. The source images and recorded crops are development-only files in `scripts/geo/digestive-system/refs/` (ignored). Complete authors, licence links, pixel crop boxes and view limitations are in `refs/manifest.json`. Four references were selected per hero; these are genuine published drawings, specimen photographs or micrographs, never generated reference images.

| Hero | Reference | Licence / what it constrains |
|---|---|---|
| molar | [2409_Tooth.jpg](https://commons.wikimedia.org/wiki/File:2409_Tooth.jpg) | CC BY 3.0; front longitudinal section |
| molar | [Lower_wisdom_tooth.jpg](https://commons.wikimedia.org/wiki/File:Lower_wisdom_tooth.jpg) | CC BY-SA 3.0; near frontal, mildly elevated three-quarter photograph |
| molar | [Gray1002.png](https://commons.wikimedia.org/wiki/File:Gray1002.png) | Public domain (PD-old-100-expired / PD-scan); side/profile tooth plates |
| molar | [Sobo_1906_335.png](https://commons.wikimedia.org/wiki/File:Sobo_1906_335.png) | Public domain (PD-old-80-expired / PD-scan); Proximal side elevation (mesial/distal); roots overlap |
| stomach-wall | [2415_Histology_of_StomachN.jpg](https://commons.wikimedia.org/wiki/File:2415_Histology_of_StomachN.jpg) | CC BY 3.0; three-quarter block section |
| stomach-wall | [Illu_stomach_layers.jpg](https://commons.wikimedia.org/wiki/File:Illu_stomach_layers.jpg) | Public domain (US Federal Government); three-quarter block section |
| stomach-wall | [Gray1050.png](https://commons.wikimedia.org/wiki/File:Gray1050.png) | Public domain (PD-old-100-expired / PD-scan); front opened stomach |
| stomach-wall | [Histology_of_normal_fundic_mucosa.png](https://commons.wikimedia.org/wiki/File:Histology_of_normal_fundic_mucosa.png) | CC BY 3.0; Frontal histological longitudinal section, H&E 10x with 40x inset |
| villi | [2418_Histology_Small_IntestinesN.jpg](https://commons.wikimedia.org/wiki/File:2418_Histology_Small_IntestinesN.jpg) | CC BY 3.0 per Commons file (micrograph credit retained); front longitudinal section plus histological profile |
| villi | [Gray1061.png](https://commons.wikimedia.org/wiki/File:Gray1061.png) | Public domain (PD-old-100-expired / PD-scan); near frontal cutaway forest, slight three-quarter |
| villi | [Gray1060.png](https://commons.wikimedia.org/wiki/File:Gray1060.png) | Public domain (PD-old-100-expired / PD-scan); transverse cross section of human villus |
| villi | [wellcome-intestinal-villi-B0006133.jpg](https://wellcomecollection.org/works/b5tfxwc4) | CC BY 4.0; Oblique exterior profile / tip, horizontal long axis |

### Modelling and rendering

`sculpt.ts` generates a molar from continuous SDF crown/root/pulp fields, mesh-extracted with smooth normals; one contiguous hard-tooth solid follows five unequal occlusal cusp fields. The geometric section is explicitly capped and partitioned at a shared analytic enamel/dentine/pulp interface; there are no separately rounded shell boundaries to leave gaps. Two curved roots, pulp horns and canals, cervical gingiva and fitted alveolar sockets replace the single-root rotational diagram. The bone section includes real recessed trabecular spaces. The tooth remains ×6, the stomach specimen ×10 and the villi ×100.

The stomach specimen has curved, fitted layers, broad unequal branching rugae, physical recessed pits, blind gland recesses in the mucosal cut face, and three distinct directions of muscular relief. The submucosal core rises with the rugae, rather than forming a flat shelf beneath them. Pit-floor colour variation follows actual recess geometry. Layer thickness and microscopic gland/pit relief are deliberately enlarged for teaching, as the existing part text already discloses.

The villus specimen has an exposed vascular reticulum and central round, blind-ended lacteal attached to the basal lining. A continuous apical blood loop joins the two vascular trunks; blood vessels do not end blindly. A four-column vascular mesh shares exact branch junctions around the curved lamina propria and central lacteal. The pale cut epithelial rim follows the exact skin vertices around the rounded cap. Its field has 56 individually shaped profiles (wider fingers at approximately the referenced density within the ×100 patch), with rounded tip caps, fusiform widths, variable flattening, twist, bend and height. An inhibited irregular scatter replaces the earlier staggered rows; a minimum basal separation prevents overlapping bases. The varied field is baked into one indexed mesh/draw, rather than 56 scene objects. It retains the same selectable `villi-block` and `villi-field` ids.

`rebuild.ts` runs error-bounded Meshopt simplification, weld/dedup and 16-bit position / 12-bit normal / 10-bit colour quantization. Each hero is one mesh/material draw. The material explicitly opts into the engine's existing `atlasSurface` hook; vertex colours are linear ratios of actual technical-plate tokens to the bone token, never CSS values mistaken for rendered colours. Source surface roughness replaces the family maps through the actual runtime hook. Labels are raycast onto the real surface before their points are transformed into quantized node coordinates.

`append-glb.ts` retains the entire original anatomy BIN prefix and every original accessor, buffer view, mesh, node and material entry. It appends only the new packet; it never re-encodes the A-grade organs. The original `digestive-system.glb` is untouched. Production now loads `digestive-system-rebuilt.glb` through the existing single-model contract.

The offline `preview.ts` reuses fossils-and-skeletons/studio-cpu.ts: GGX, sampled actual RoomEnvironment, hemisphere, three direct lights, exposure, ACES and sRGB. It asserts the values used against the actual engine Lighting.tsx, installed R3F ACES default and GLTF material styling. It decodes the shipping compressed asset, applies actual world transforms/COLOR_0, family environment intensity and the vertex-colour emissive behavior. The optional loader check independently uses the production THREE GLTFLoader plus its inline Meshopt decoder. CPU environment filtering approximates GPU PMREM; GPU shadows, procedural micro-normal maps and interactive behavior are not browser-verified here. No browser or desktop was launched.

### Two look → change cycles

All four views per hero (front, three-quarter, profile and characteristic detail) were rendered and visually inspected beside genuine references. Full angle contact sheets retain the inspection record.

1. **Round 1 look** (`round1-all-angles.png`): the crown had a false horizontal enamel shelf; the pulp/cut edges shaded as broad triangles; stomach folds were too periodic and glands/fibres too uniform; villus tip sampling made pointed spikes. **Changes:** restrict enamel to the crown shell, improve cervical taper, give cut surfaces explicit section normals, add fitted alveolar relief, replace the repeated fold wave with unequal curved/branching ridges, enlarge recessed pits, vary muscle relief, use adaptive hemispherical tip rings, attach the front villus to the basal patch and add an irregular connected capillary reticulum.
2. **Round 2 look** (`round2-all-angles.png`): the shelf was gone and the villus caps rounded, but tooth boundary triangles still carried side-wall normals; the alveolar microcavities were under-resolved; the villus field still read as straight tubes. A real-geometry label test also found the stomach anchor 4.55 mm off the specimen. **Changes:** separate near-section normals across the marching-cell tolerance, enlarge and soften the trabecular recesses, taper and twist each villus cross-section with unequal bend/flattening, raycast every label to an actual visible triangle, and reduce redundant patch/field tessellation while preserving the characteristic details.
3. **Round 3 close look:** the enamel interface still had dark geometric gaps despite better section normals. **Changed:** replaced independent enamel/dentine MC shells with one contiguous hard-tooth volume, clipped and capped once, with conforming shared interface triangles (`tooth-finish.ts`); supplied analytic outer normals and removed a gingival island from the root furcation. The stomach and field were simplified within submillimetre model-space error while retaining their characteristic details.
4. **Round 4 close look:** the tooth interface was continuous, but the villus's approximate four-point pale rim gave its top a false spear shape and its apical blood trunks did not join. **Changed:** derived both pale rims directly from the curved skin edge vertices, added the apical capillary connection, made the lacteal termination rounded, and widened the background villi while reducing their visible sampling from 117 to 56 to agree with the referenced density and ×100 dimensions. Corrected the EN/ZH spacing disclaimer rather than retain “real villi stand closer”.
5. **Earlier final snapshot LOOK (superseded by the additional refinement below):** `/tmp/atlas-digestive-rebuild/final/final-*` repeats front, three-quarter, profile and detail in paper and cinema from the actual final compressed asset. The smooth crown and continuous enamel interface, two unequal roots, recessed rounded gastric folds/pits, variable broad villi, rounded epithelial cap and connected vascular net were inspected. No visible polygon faceting or shell gap remains at these study resolutions. Tiny CPU edge steps are raster aliasing; GPU acceptance remains separate.

The comparison sheets disclose angle limits instead of claiming false photographic registration: the tooth front section and proximal profile are comparable views; its specimen photograph has a different azimuth and is a third molar. The stomach references include a genuine mucosal section and oblique scientific blocks, not an exact X-axis photograph. The villus SEM is oblique and has a horizontal long axis; its species is unspecified. Microscopic stain / false SEM colours do not define the technical-plate tissue colour. Exact same-camera photographs for all microscopic/specimen views were not available.

### Geometry and payload accounting

All-authored sums are a conservative upper bound; normal chapter visibility is lower. Draw estimates exclude shadows, overlays and floor rendering.

| Part | Before triangles | After triangles | Before / after estimated draws | Final self-grade |
|---|---:|---:|---:|---|
| `tooth-section` | 2,516 | 49,000 | 5 / 1 | **A** · credible scientific teaching sculpture |
| `stomach-wall` | 43,148 | 23,000 | 7 / 1 | **A** · credible scientific teaching sculpture |
| `villi-block` | 1,714 | 14,499 | 4 / 1 | **A** · credible scientific teaching sculpture |
| `villi-field` | 45,696 | 22,400 | 1 / 1 | **A** · credible scientific teaching sculpture |

All authored parts: **326,860 → 342,685 triangles**; **45 → 32 estimated draws**. New sculpture packet: **531,808 bytes** (≤1,500,000). Original organ container: **2,093,620 bytes**; combined shipping container: **2,625,012 bytes**. Original anatomy BIN SHA-256: `f54d9e696c53ebd9268ad99b0735bbd88defc3ae85ccff1ae5d706627124d674`; the retained shipping prefix has the same hash.

**Concrete budget limitation:** the inherited A-grade organ container was already 2,093,620 bytes. Its protected BIN chunk alone is **2,006,568 bytes**, a measured hard lower bound exceeding 1.5 MB even with all JSON and new sculpture data removed. The schema accepts one model URL, so the combined file exceeds 1.5 MB even though the added sculptures are well below the cap. Reducing that inherited payload would require re-encoding the protected organs or a shared-engine multi-asset change; neither is within this task's authorized ownership. No shared engine or kit was changed.

### Preserved teaching behavior and minimal text change

All part ids/order, layers, group magnifications, connects, explode distances/directions, poses, animations, flows, cameras, chapters, beats, labels and teaching quantities are retained. Two minimal EN/ZH corrections: the villus-field disclaimer now says its positions and shapes are reconstructed rather than falsely asserting the real lining is denser; in the tooth detail, “the diagram shows one” / “图里只画了一个” becomes a lower molar with two unequal roots and one canal into each. The 32 permanent / 20 baby / 28 displayed tooth counts are untouched. The source anatomy teeth are untouched.

### Verification and evidence locations

- Renderer and source-labelled sheets: newest tooth/villus decoded views in `/tmp/atlas-digestive-rebuild/refine2` and gastric views in `/tmp/atlas-digestive-rebuild/refine3`; earlier final snapshot in `/tmp/atlas-digestive-rebuild/final`; `/tmp/atlas-digestive-rebuild/round1`, `round2`, `round3` and `/tmp/atlas-digestive-rebuild/comparisons`.
- Baseline asset, original part data and measured counts: `/tmp/atlas-digestive-rebuild/before`.
- Packet sizes and original-byte proof: `scripts/geo/digestive-system/rebuild-metrics.json`.
- Focused regression checks: `tests/space-scene/digestive-system-rebuild.test.ts` (production loader and actual material hook, finite geometry/normals, true label surface/visibility, byte-preserved organs, unchanged teaching behavior, triangle and added-byte budgets).
- Global gate results are recorded below. The legacy cross-topic material regression was updated only for these two topics: it verifies the inherited anatomy material prefix is unchanged, while their new topic tests verify the explicitly opted-in sculpture materials. Other topics retain the original no-opt-in guard.

### Earlier integrated gates — superseded by final results below

- `pnpm check`: passed, zero errors and zero warnings (five existing hints).
- `pnpm validate`: passed, 94 topics, zero errors and zero warnings.
- `pnpm test`: passed, 278 files; 6,539 tests passed, one skipped.
- `pnpm build`: passed, 191 pages generated.
- `git diff --check`: passed.

Logs are `/tmp/atlas-digestive-rebuild/{check,validate,test,build}-release.log`.
The joint comparison directory is `/private/tmp/atlas-heart-digestive-comparisons`;
its digestive-system entry links to the source-labelled sheets above.
Browser/e2e/shoot were intentionally not run under the explicit no-browser
instruction. These offline self-grades remain subject to GPU visual acceptance.

### Additional close-up acceptance sweep — 2026-11-09

An independent visual reread of the earlier `final-*` sheets rejected two residual forms despite their earlier A labels: the stomach roof still resembled a corrugated sheet with a flat submucosal shelf, and the exposed villus had sparse ladder-like vascular branches. The original A-grade organ meshes and finished molar sculpture were left unchanged.

1. **Look → refinement 1:** widened and varied the rounded gastric folds, gave their submucosal core matching relief, deepened the recessed pits, and replaced the ladder with a connected four-column vascular mesh whose nodes follow the same bent villus outline. Inspected `refine1-stomach-three-quarter-paper-comparison.png`, its profile/front renders, and `refine1-villi-detail-paper-comparison.png` beside their genuine source images. The vascular spaces now form an actual peripheral network. Remaining defects: front gastric glands were still raised noodle-like strips, the background villi retained visible rows, and the changed gastric folds hid the old leader point.
2. **Look → refinement 2:** replaced those raised gland strips with physical blind recesses in the mucosal cut face; changed the field to a deterministic inhibited scatter with unequal height/bend/flattening; raycast the stomach leader onto an exposed front wall. Comparison generation now trims only empty model background before aspect-preserving fit, so the two subjects occupy comparable panel scale. The references remain unwarped and retain all recorded angle limitations.

The production loader, actual runtime `atlasSurface` hook, normalized vertex colours, real triangle anchors/visibility, finite geometry, 350k bound and original-byte preservation all passed the six focused tests after refinement 2 (`pnpm exec vitest run --configLoader runner --cache=false tests/space-scene/digestive-system-rebuild.test.ts`). This test caught and drove correction of the hidden stomach leader instead of relaxing its check. The earlier gate results above predate these refinements; the final integration results below supersede them.

3. **Refinement 2 close look → surface-normal correction:** the newly recessed glands exposed a rendering defect: the generic patch finalization flattened their per-vertex normals into tiny shiny triangles. Supplied analytic normals across the actual recessed face, then rerendered the gastric views as `refine3-*` from the shipping asset. This also lets Meshopt reach the 23,000-triangle target with less error and reduces the final sculpture packet to 531,808 bytes. Tooth and villus geometry/materials are identical between refinements 2 and 3; their full `refine2-*` sheets remain the corresponding evidence. No shape, token, test tolerance or engine lighting was changed to hide the problem.

**Latest final visual reread:** inspected the source-labelled `refine2-*` tooth/villus and `refine3-*` gastric sheets in both themes, including the gastric recess/rounded-fold close-up and villus vascular detail. The complete front / three-quarter / profile / detail contact sheet is `/private/tmp/atlas-digestive-rebuild/comparisons/refine2-with-refine3-all-angles.png` (regenerate with `pnpm tsx scripts/geo/digestive-system/montage.ts refine2 refine3`). Final grades remain **A** for `tooth-section`, `stomach-wall`, `villi-block` and `villi-field` against docs/68's convincing scientific-model criterion; accepted organ meshes remain **A / unchanged**. These are teaching sculptures with disclosed scale/thickness reconstruction, not a claim of matching every epithelial cell in the SEM. Final focused checks were rerun after the normal correction: **6/6 passed**. GPU pixel appearance and interaction acceptance remain for the explicitly separate GPU review.

### Final integrated gates — 2026-11-09

- `pnpm check`: passed; 1,226 files, zero errors/warnings, five existing hints.
- `pnpm validate`: passed; 94 topics, zero errors/warnings.
- `pnpm test -- --maxWorkers 2 --testTimeout 30000`: passed with exit 0;
  **278 files / 6,541 tests**, no skipped tests or unhandled errors.
- `pnpm build`: passed with exit 0; 191 pages.
- Final focused production-asset checks: **4 files / 38 tests** passed.
- `git diff --check`: passed.

Authoritative logs: `/tmp/atlas-heart-digestive-check-verified.log`,
`/tmp/atlas-heart-digestive-validate-release.log`,
`/tmp/atlas-heart-digestive-test-verified.log`,
`/tmp/atlas-heart-digestive-build-release.log`, and
`/tmp/atlas-heart-digestive-focused-release.log`.
Earlier full runs under concurrent rendering/build load hit unrelated timing
checks or a Vitest worker-reporting timeout, including one run where all tests
passed but Vitest still returned nonzero. These were not accepted as green.
The final isolated run above exited cleanly; no assertion, test tolerance,
package manifest, lockfile or shared engine was changed to obtain that result.
The longer per-test timeout and two-worker limit are recorded explicitly.

A temporary dependency facade redirected only tool caches into `/private/tmp`
while retaining the same installed package symlinks; the original workspace
`node_modules` symlink was restored afterward. A temporary rejected-source
preview script was moved out of the project before the final type check.
No browser/Chromium/desktop automation, e2e/shoot or git writes were performed.
These gates do not replace the subsequent GPU acceptance or promote any
remaining B grade.

Comparison directory: `/private/tmp/atlas-heart-digestive-comparisons/`.
Heart sheets resolve to the final round-15 directory; digestive sheets include
`refine2-with-refine3-all-angles.png` and the source-labelled per-view sheets.

## Rebuild 2026-11-05 — round 3 corrections (executed 2026-11-09)

The stray white curve on the front of `villi-block` was the basal lymphatic
branch crossing the cut face, not a new anatomical part. Its basal path now
stays within the tissue (z = .030/.035 instead of .045/.057); it remains
connected to the central blind-ended lacteal. No villus, capillary, part id,
teaching number, label, chapter, pose or bilingual description changed.
Self-grade **A retained**, including removal of the unintended exposed stub.
The earlier four villus references above remain the morphology sources.

Inspected actual runtime studio/ACES front and detail views before and after:
`/tmp/atlas-heart-round3/villi-before/` and
`/tmp/atlas-heart-round3/villi-after/`. The front view confirms the white
curve has disappeared while the epithelial cut rim and apical blood arcade
remain. The change does not alter tooth or stomach geometry.

All live digestive parts now load `/models/digestive-system.glb`.
`digestive-system-rebuilt.glb` was removed. The canonical asset contains both
original anatomy and close-ups, instead of shipping the original 2.09 MB a
second time merely for a test/build source. `anatomy-source.json` stores the
original anatomy metadata and BIN SHA-256; `anatomy-source.ts` verifies and
reconstructs that immutable input from the canonical runtime prefix. Rebuilds
therefore never append to old sculptures or duplicate the anatomy file.
The production-loader regression checks that prefix against the independent
manifest and continues to verify every original JSON entry and copyright.

`villi-block`: **14,499 → 14,499 triangles**, **1 → 1 draw**.
Runtime composite: **2,625,012 → 2,624,948 bytes**. Total shipped digestive GLBs:
**4,718,632 → 2,624,948 bytes**. New sculpt packet:
**531,808 → 531,744 bytes**, within 1.5 MB. Original anatomy BIN remains
2,006,568 bytes with SHA-256
`f54d9e696c53ebd9268ad99b0735bbd88defc3ae85ccff1ae5d706627124d674`.
Gate status and the restored solar-test incompatibility are recorded in the
heart-and-lungs round-three report, which owns this correction batch.

## Rebuild 2026-11-05 — round 4 basal-face correction (executed 2026-11-09)

Scope is acceptance item 9 only: the two dark crescents on the front face of
`villi-block` at chapter 5, beat 4. They were real protruding parts of the
arteriolar/venular basal approaches: their middle control points lay at
z = .055 while below the block roof. Both approaches now pass inside the basal
tissue (z = .030/.035), then emerge into the exposed villus and join the same
capillary nodes. The blood network, epithelial rim, blind-ended lacteal,
villus field, labels, ids, counts, teaching numbers and EN/ZH text remain.

References remain the genuine morphology sources already documented above:
[OpenStax villus section](https://commons.wikimedia.org/wiki/File:2418_Histology_Small_IntestinesN.jpg),
[Gray's vascular villi](https://commons.wikimedia.org/wiki/File:Gray1061.png),
[Gray's villus section](https://commons.wikimedia.org/wiki/File:Gray1060.png),
and the [Wellcome SEM](https://wellcomecollection.org/works/b5tfxwc4).
This correction does not invent additional anatomy or change the tissue tokens.

1. **First look → geometry correction:** the decoded canonical-asset front
   studio/ACES renders reproduced both crescents, including in the paper theme.
   Moving the two basal approaches into the tissue removed them. Inspected the
   new front, three-quarter, profile and detail renders beside the genuine
   references in both themes. The clean face is restored; the above-roof
   capillary connections and the epithelial/lacteal structures remain visible.
2. **Second look → acceptance verification:** inspected the actual beat 5-4
   before/after sheets in paper and cinema. Added optional `villi-beat5-4`
   preview support that reads the camera from the chapter frontmatter itself,
   rather than maintaining a copied acceptance camera. Added a regression that
   raycasts the first visible triangle of the decoded production mesh over
   1,215 basal-front-face points and interpolates its actual COLOR_0. The old
   asset has 24 vascular-colour failures (maximum colour distance .21516); the
   corrected asset has zero (maximum floating-point residual 1.36e-16).
   No second anatomy change was necessary after that look.

Self-grade for the corrected `villi-block`: **A** against docs/68's convincing
scientific teaching-model criterion, retaining the existing reconstructed
microscopic-scale disclosure. This is a clean-face correction, not a new claim
that its schematic capillary sampling matches every capillary in a micrograph.
The surrounding field and other digestive heroes were not resculpted. Production
decoded attribute/index buffers and world transforms for `tooth-section`,
`stomach-wall` and `villi-field` have identical SHA-256 hashes before/after;
all original anatomy BIN bytes and JSON entries also remain unchanged.

`villi-block`: **14,499 → 14,499 triangles**, **1 → 1 estimated draw**.
All authored digestive parts: **342,685 → 342,685 triangles**, **32 → 32 draws**.
Sculpt packet: **531,744 → 531,832 bytes** (under 1.5 MB).
Canonical runtime GLB: **2,624,948 → 2,625,036 bytes**; the inherited protected
anatomy BIN alone is still 2,006,568 bytes, so the composite budget limitation
documented above remains. No duplicate GLB is shipped.

Focused production-loader/material/teaching/geometry tests: **7/7 passed**
(`pnpm exec vitest run --configLoader runner --cache=false tests/space-scene/digestive-system-rebuild.test.ts`).
The root session owns the final global gates. No browser, desktop, Chromium,
git writes, shared engine changes or out-of-topic test edits were used.

Evidence directory: `/private/tmp/atlas-heart-round4/digestive/comparisons/`.
It contains eight source-labelled four-angle comparison sheets and four
round-3/round-4 front/beat-5-4 pairs. `before/` and `after/` hold the decoded
studio renders; `surface-regression.json`, `unchanged-heroes.json` and
`focused.log` sit in their parent evidence directory. These are development
artifacts outside the repository. CPU PMREM filtering remains approximate;
GPU acceptance follows separately, as requested.

Final round-four integrated gates (2026-11-09): **all exit 0** — `pnpm check`
(1,235 files; zero errors/warnings, five existing hints), `pnpm validate`
(94 topics; zero errors/warnings), `pnpm test -- --maxWorkers 2 --testTimeout 30000`
(278 files / **6,545 passed**), and `pnpm build` (**191 pages**). Post-build
first-screen JS-budget tests also pass **3/3**. These include the seven focused
digestive rebuild tests and the new decoded front-face regression. The final
runtime SHA-256 is
`a8dc9439ffed70b178135e1141e8cbe9b54c4fdcdc24d6e86a3653a026a344b8`,
identical in source, synchronized gate workspace and built output. Required
commands used `/private/tmp/atlas-heart-round4/gates` with identical packages,
lockfile/configuration and private writable caches; the source's existing
external `node_modules` symlink was left unchanged. Logs and verification are
in `/private/tmp/atlas-heart-round4/gate-control/`. The heart topic report
records the full environment details and its separate unresolved fin-material
limitation. No GPU acceptance is claimed.
