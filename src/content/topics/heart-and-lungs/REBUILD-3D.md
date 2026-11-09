# Heart and lungs — 3D rebuild record

## Rebuild 2026-11-05

Implemented 2026-11-09 in the isolated `atlas-q-heart-digestive` worktree.
Scope: the three flagged bench heroes, the independently moving gill cover,
and a whole-model sweep. The accepted Z-Anatomy organs were retained.
`FIXES.md` and an earlier `REBUILD-3D.md` did not exist for this topic.
The applicable original review is `docs/68-3d-realism/review-living.md`,
particularly its heart-and-lungs inventory and per-part notes.

### Changes and self-grades

Grades use docs/68's **A = credible/retain**, B = detail polish needed,
C = recognisable but crude, D = placeholder. These are author self-grades,
not claims of GPU-browser acceptance.

| Hero / part | Rebuild and characteristic structure | Final self-grade | Triangles before → after | Estimated surface draw calls before → after |
|---|---|---|---:|---:|
| `fish-body` | Smooth section loft with compressed flank, distinct breast, tapered peduncle, continuous cranial surface and carved orbital/jaw folds. One convex ocular surface with iris/pupil pigment, paired nares and a genuine flattened terminal gape. The maxillary cleft ends beneath the orbit; flatter flank sections reduce the former bulbous cranium. Unequal spinous-dorsal margins, relief rays on cambered thin fins, both paired fin sets and a forked caudal fin. **Still below the requested photo-adjacent head standard; residuals below.** | **B** | 3,276 → 33,760 | 5 → 1 |
| `gills` | Four curved branchial arches, eight hemibranch rows, **936** narrow curved primary filaments with correlated variation and close spacing forming dense respiratory curtains; short inward rakers. Filaments are gross display sampling; microscopic lamellae are not fully resolved or assigned an invented count. | **A** for gross scientific illustration | 2,448 → 33,420 | 2 → 1 |
| `gill-cover` | Thin operculum fitted to the unclipped flank contour, shallow converging bone struts, same front-edge hinge, oscillation and open-cover pose. **Its bone relief and outline still read as an inset shield beside the perch head photos.** | **B** | 28 → 4,656 | 1 → 1 |
| `plant-specimen` | Thirteen blades retained, cotyledons below true leaves, cuneate bases and pointed tips, distinct midrib cups, variable roll/droop, petioles and joined curved secondary veins. Unequal height/length/orientation; granular soil. Exposed water/food teaching routes retained. | **A** for gross scientific illustration | 3,068 → 26,048 | 4 → 1 |

**Items not completed to A:** after seven further look/change rounds, the
fish head and operculum still remain **B** under the requested photo-adjacent
bar. The final head has a continuous convex eye, a genuine flattened oral
opening, shorter maxillary cleft and a fitted, narrower cover. However, the
orbital/maxillary/preopercular bone relationships are still simplified, and
the cover retains an overly smooth inset-shield appearance. Fine scale
sculptures were tried and removed because their coarse relief introduced a
new faceting/repetition defect. The documented reference photographs show
cranial relief this reconstruction has not reproduced; code gates and gross
recognisability do not resolve that visual shortfall. This is incomplete
geometry work, not an assertion that the constraints make an A head impossible.
The scans/source investigation below records the remaining alternative.

The fish remains a **generalised bony fish**, as its EN/ZH detail already says;
perch photographs guide external structure without claiming a species replica.
Gills retain the four-arch teaching count. Primary filament numbers are display
sampling, not a biological claim. The only prose correction is the existing
gill detail: **“one row” → “two rows” per arch**, in both English and Chinese,
to match the paired rows required by the realism review. Part ids, part count,
chapters, beats, labels, teaching quantities, flows, poses and animation
parameters are preserved.

Whole-model sweep: accepted airway, paired lungs, bronchi, diaphragm, ribcage,
heart, great/lung/body vessels, oesophagus, stomach, small/large intestine,
liver, leg-muscle pair, skeleton and skin context remain **A, unchanged**.
The air jar, abstract percentage balls/rack, real framed table and pot remain
**A for their display role, unchanged**, including their original tessellation.
The tank gained five separate thin glass panes, an open top, internal waterline
and fine silicone seams (**A**); it no longer represents the tank as a solid
closed glass box. The plant's exposed tubes and the abstract percentage balls
are intentional teaching representations already disclosed in the topic.

### References inspected before and during sculpture

Reference photos are development evidence, never runtime textures. Local files
are in `scripts/geo/heart-and-lungs/refs/` (gitignored). Attribution is also in
`data/SOURCES.md`.

| Hero | Real reference, URL and licence | What was checked |
|---|---|---|
| Fish / cover | [George Chernilevsky, Perca fluviatilis 2008 G1](https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_2008_G1.jpg), public domain author release | Profile proportions, head, eye, lips, cover and narrow peduncle |
| Fish / cover | [H. Zell, Perca fluviatilis – Wilhelma 01](https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_-_Wilhelma_01.jpg), CC BY-SA 3.0 | Compressed body volume, paired fin roots and dorsal/anal attachment |
| Gills | [Krishna satya 333, Fish gills](https://commons.wikimedia.org/wiki/File:Fish_gills.jpg), CC BY-SA 4.0 | Curved arches, dense flattened respiratory filaments |
| Gills | [Shao / Anaxibia, Fish gill structure](https://commons.wikimedia.org/wiki/File:Fish_gill_structure.jpg), CC BY 3.0 | Two hemibranch rows, filament taper and transverse lamellar organisation |
| Plant | [Scientific apostle, Chilli plant sprouting](https://commons.wikimedia.org/wiki/File:Chilli_plant_sprouting.jpg), CC BY-SA 4.0 | Cotyledons and a continuous curving stem |
| Plant | [daSupremo, Seedling 13](https://commons.wikimedia.org/wiki/File:Seedling_13.jpg), CC BY-SA 4.0; verified via Commons imageinfo metadata | Young plant habit and unequal acuminate leaf blades. Categorised as Capsicum; not a confirmed species identification |
| Plant | [Forest & Kim Starr, Starr 080607-7267 Capsicum annuum](https://commons.wikimedia.org/wiki/File:Starr_080607-7267_Capsicum_annuum.jpg), CC BY 3.0 | Confirmed Capsicum leaf outline, petiole, midrib and secondary veins |
| Fish / cover | [Dellex, Barsch3](https://commons.wikimedia.org/wiki/File:Barsch3.jpg), CC BY-SA 4.0 | Real near-frontal perch: paired eye rims, forehead, mouth and jaw volume |
| Gills | [Uwe Gille, Gills (esox)](https://commons.wikimedia.org/wiki/File:Gills_%28esox%29.jpg), CC BY-SA 2.5 | Opened ventral/anterior branchial cavity; nested arches remain attached |
| Gills | [Arria Belli / Irønie, Branchies](https://commons.wikimedia.org/wiki/File:Branchies.png), CC BY-SA 3.0 | Oblique opened gill chamber with four densely layered respiratory curtains |
| Plant | [AgroFidanishtjaHavolli, AgroFidanishtja Havolli pepper seedling](https://commons.wikimedia.org/wiki/File:AgroFidanishtja_Havolli_pepper_seedling.jpg), CC BY-SA 4.0 | Genuine nursery Capsicum annuum from near stem height: cupping, droop, petiole attachment and unequal blade orientations |

Two additional downloaded Salicyna germination photos (Capsicum annuum
2020-05-21 8900/8903) were inspected and rejected as mature-leaf comparisons:
they depict the seed/radicle rather than the young plant's true-leaf stage.

### Offline studio evidence and actual look → change cycles

`preview-studio.ts` decodes **the actual model URL bound by parts.json**,
including meshopt quantisation, world transforms, smooth normals and vertex
pigments. It imports `fossils-and-skeletons/studio-cpu.ts`: numerical GGX,
hemisphere/direct studio lighting, sampled installed `RoomEnvironment`,
engine exposure and ACES. It asserts key/fill/rim intensity/colour, exposure
and environment intensity against `Lighting.tsx`; pigments resolve from
`src/theme/tokens.css`. `fish-open.png` applies the actual pose's pivot.
It also checks hemisphere colours/intensity and all three light directions, and rejects a snapshot that differs from the current runtime parts.json. No browser, Chromium, desktop or WebGL was launched.

1. **Round 1 LOOK:** the first decoded fish sheet showed a cover too small
   for the chamber, a rectangular dark patch, a blunt cut-off peduncle,
   prominent eye globes and cone-like snout. Gill detail read as bright rods;
   the plant's leaves were mostly edge-on and in conspicuously paired tiers.
   **CHANGED:** expanded/fitted the cover and inset chamber, reduced globe
   projection, rebuilt the flank/peduncle section profile, flattened and
   curved the filaments, reduced their linear reflectance, and rolled/drooped
   individual leaves with unequal sizes/heights. Reduced invisible excess
   tessellation without reducing primary silhouette sampling.
2. **Round 2 LOOK:** local smoothstep interpolation left subtle body-section
   bumps; the convex cover projected like an attached disc. Gill ends were
   overcrowded and the rows still read as sparse rods. Leaf bases appeared
   cut across and lower true leaves sat below cotyledons.
   **CHANGED:** shared-slope Hermite section interpolation, a shallower fitted
   operculum with bony relief, dense thin respiratory blades instead of rods,
   varied filament sampling/reach, correctly ordered the true-leaf cluster
   above cotyledons, slimmed the stem and replaced the soil puck with a
   continuous granular surface.
3. **Round 3 LOOK:** the fish and plant silhouettes were coherent, but fin
   ray relief disappeared into the cambered membranes; leaf bases still
   showed broad attachment cuts. The gill close camera clipped its ends.
   **CHANGED:** put each raised ray on the exact curved membrane surface,
   tapered each leaf to its petiole at the blade base, and widened the gill
   detail camera. The open-cover preview now takes its pivot from the actual
   runtime pose rather than an approximate manual coordinate.
4. **Round 4 LOOK:** inspected all three final four-view side-by-side sheets,
   plus paper/cinema renders. The previously exposed rectangular chamber,
   section bumps, cut peduncle, rod stacks and tiered flat leaves are removed.
   Fine subpixel ray/vein relief aliases in the un-antialiased CPU raster;
   it is continuous mesh relief and still requires the subsequent GPU check.

The initial round-4 A labels were rejected by the parent after looking at the
comparison sheets. They are superseded by the candid grades above.

5. **Round 4 parent LOOK / round 5 correction:** sparse pointed gills still
   resembled a fence, fins had rounded margins and subpixel rays, and the
   head/plant were overly stylised. Replaced the filaments with 936 narrow
   strips, increased coherent curtain coverage, varied reaches/spacing, used
   a darker wine token, fitted the cover to the actual flank and sculpted
   unequal individual dorsal spines/scallops. Deepened leaf cups, varied
   droop/roll and joined five-point curved veins to the midrib.
6. **Round 5 LOOK / round 6 correction:** the frontal head showed an unclosed
   annulus around the gape. Added a real curved snout surface around the
   mouth opening; increased filament coverage without increasing count.
   Added 2× CPU supersampling before downsampling, avoiding alias dots in
   fine relief while still making no GPU pixel-identity claim.
7. **Round 6 LOOK / round 7 correction:** stacked eye globes and an obvious
   head-cap boundary remained. Replaced the ocular stack with one continuous
   convex corneal surface carrying iris/pupil pigment and joined cap normals.
8. **Round 7 LOOK / round 8 correction:** the cap still looked like a dark pad,
   with applied wire-like brow/jaw contours. Matched pigmentation across the
   seam, kept the gape near the retained water-route centreline, removed
   those tubes and carved orbital/jaw folds into the continuous head.
   **Round 8 parent/author LOOK:** gills and plant pass the gross illustration
   bar; fish head remains B for the exact residuals recorded above.

Final sheets (absolute path):
`/Users/gavin/work/atlas-q-heart-digestive/scripts/geo/heart-and-lungs/rebuild/round15/`

- `fish-comparison.jpg` — profile, three-quarter, front audit, head close-up.
- `gills-comparison.jpg` — lateral, oblique, end audit, filament close-up.
- `plant-comparison.jpg` — front, three-quarter, side audit, leaf close-up.
- Also `fish-open.png`, `fish-cinema.png`, `plant-cinema.png` and
  `preview-rig.json`. Earlier rounds remain for review.

**Evidence limits, explicitly not hidden:** the final sheets now include a
real near-front perch, an opened ventral gill cavity and real side-view nursery
Capsicum, replacing the former side-photo placeholders. However, these are
not a registered same-specimen source set. Fish front is near-axial; gill end
and oblique photos retain the surrounding cavity while the model isolates one
side's arches; the plant differs in age and genotype. The sheet labels state
these scope/pose differences. Thus the strict fully registered same-angle
photo requirement remains **partially satisfied**, not fabricated as complete.
These are 2× supersampled lighting-matched CPU PBR previews, not GPU pixel-
identity, FPS or FXAA/shadow acceptance claims. No reference photo was warped
to invent a missing angle. GPU browser acceptance remains outstanding.

### Performance, preservation and reproducibility

| Metric | Before | After |
|---|---:|---:|
| Four rebuilt hero parts, triangles | 8,820 | 97,884 |
| Four rebuilt hero parts, estimated surface draws | 12 | 4 |
| All authored layers on, including schema-expanded bilateral organs | 247,344 triangles | 335,928 triangles |
| Original accepted anatomy GLB | 1,952,300 bytes | 1,952,300 bytes, unchanged |
| Independently compressed new bench payload | 0 | 521,464 bytes |
| Runtime combined GLB container | 1,952,300 bytes | 2,473,592 bytes |

Triangle totals come from decoded mesh index counts and the same `partPieces`
primitive builder used by the renderer; instance matrices and schema-expanded
bilateral parts are included once. Shadow passes, flow particles and pixel
rate are not misreported as surface draws. Chapter layer filtering lowers the
all-layer total. The 350k geometry budget is regression-tested against the
actual bound asset and renderer geometry, not just a saved count token.

The **combined container exceeds 1.5 MB**: the accepted anatomy alone already
exceeded that limit, and the engine has one model URL for all mesh parts. The protected original BIN alone is **1,868,196 bytes**, already over the cap before any JSON or added sculpture. This
work leaves that original asset intact and appends the 521 kB bench packet to
a new container. It does not claim the combined container meets 1.5 MB.
No engine/schema/framing change or engine patch was made.

The append writer preserves every inherited mesh, accessor, node,
buffer-view and material index and copies the entire original BIN payload
verbatim. Regression tests compare the actual shipped prefix and metadata.
The stable pre-rebuild parts fixture also prevents evolving shared specimen
kit defaults from changing the accepted gas balls/jar/pot/table or flow
rounding. The five-decimal bench-coordinate contract is explicit locally.

Commands:

```sh
pnpm tsx scripts/geo/heart-and-lungs/build-parts.ts
pnpm tsx scripts/geo/heart-and-lungs/preview-studio.ts 15
python3 scripts/geo/heart-and-lungs/compare-sheets.py 15
pnpm tsx scripts/geo/heart-and-lungs/measure-rebuild.ts
pnpm vitest run tests/space-scene/heart-and-lungs-rebuild.test.ts tests/space-scene/heart-and-lungs-topic.test.ts tests/anatomy/heart-lungs-routes.test.ts
```

The targeted checks passed on the final asset (38 tests across both topics and the heart route/topic suites, including both rebuild regressions).

### Additional strict look/change cycles — 2026-11-09

9. **Round 8 LOOK → round 9:** rechecked the real profile/near-front perch
   photographs. Reduced body depth and forehead height, widened the convex
   ocular area, carved a maxillary/dentary transition into the cranium and
   reshaped the operculum. LOOK still found a pipe-like mouth, projecting eyes
   and a dark crescent where the chamber exceeded the cover.
10. **Round 9 LOOK → round 10:** the chamber recess now derives from the
    actual sampled opercular boundary, tapering before every edge. Corrected
    lip-loop parameterisation (the old upper/lower loops actually divided
    left/right), flattened the gape, reduced corneal projection and increased
    roughness in the actual bound GLB material. LOOK exposed a separate
    snout-cap boundary and coarse trial scale tiles.
11. **Round 10 LOOK → round 11:** integrated the mouth boundary directly into
    the continuous head loft, removed the separate cap, compressed the
    chamber/cover consistently and removed the first coarse scale trial.
12. **Round 11 LOOK → round 12:** redistributed the same body sample budget
    toward the cranium, strengthened the real jaw cleft, and tested smoother
    physical scale tiles. Four-view close inspection rejected the scales as
    repetitive/faceted, the long cleft as a smile, and the cover as too round.
13. **Round 12 LOOK → round 13:** removed all trial scale tiles; shortened and
    angled the maxillary cleft; reduced dentary relief; used flatter compressed
    flank sections; blended the ocular rim into the skin while retaining a
    convex cap; narrowed/angled the opercular envelope and refitted all four
    branchial arches. Filaments retain their exact count and paired rows;
    their tiny blade subdivision was reduced from four to three longitudinal
    samples (smooth normals preserved) to budget detail by visual size.
    LOOK at the final profile, shallow three-quarter, near-front and matched
    profile head-close sheet confirms improvement, but the strict independent
    review still grades the cranial/cover form B for the specific residuals
    above. Gills and plant retain A for scientific illustration.

14. **Round 13 LOOK → round 14:** made the cover's upper/posterior border
    follow the reference's angular bone margin and opercular point, with a
    matching chamber mask. Refitted the same four arches to the shallower
    envelope. A decoded-mesh ray audit found all four retained incoming water
    centre lines hit the former narrow lips, so opened the actual integrated
    gape without editing any flow path, count, speed, size or spread. LOOK at
    both front and profile-close confirms genuine open mouth/throat geometry;
    this gaping phase differs from the mostly closed-mouth reference photos.
15. **Round 14 physical audit → round 15:** straight centre-line rays passed,
    but the **actual renderer-baked** `gill-water` paths plus their **0.0015 m**
    runtime spread still clipped the narrowing inner roof/floor on paths 1/4.
    Removed the throat constriction. The production GLTFLoader + Meshopt,
    world-transform and `bakeFlowPath` audit now sweeps a ball of that actual
    radius along every incoming baked segment and checks exact triangle
    distance. All four paths and their entire possible jitter volumes clear;
    this is regression-tested without changing tolerance or teaching data.
    The 0.0006 m gas-marker spread was explicitly rejected as the wrong value.
    Final LOOK is still B for head/cover anatomy; physical correctness does
    not silently promote the visual grade.

Round-15 fish views are decoded from the final shipping asset. Gill views
remain round-14 evidence for identical geometry/materials, and plant views
remain round-13 evidence for identical geometry/materials; the final directory
copies these with that provenance. `evidence-reuse.json` proves identical decoded attributes, world transforms and surface materials against the current bound GLB; `verify-evidence-reuse.ts` regenerates that proof. The sheets are regenerated with the final
row labels; unchanged images are not presented as a fresh GPU capture.

Final estimated all-layer surface draws: **50 → 43**; hero-only draws
**12 → 4**. The head-close camera now matches the profile reference, the
front camera is lowered to the real near-frontal underwater photograph, and
the oblique camera matches the shallow three-quarter reference more closely.
The source photos are not warped or generated. Same-specimen registration
and microscopic lamellar anatomy remain outside the evidence supplied.

### CC0 replacement investigation — 2026-11-09

A real downloadable source was investigated rather than treating a generic
silhouette as A. None of the inspected candidates is shipped:

- [NTNU FishSim](https://dataverse.no/dataset.xhtml?persistentId=doi:10.18710/OY9QWA),
  DOI `10.18710/OY9QWA`, CC0: selectively downloaded metric USDZ specimens
  haddock `HW2603MR0048` (22,528 triangles) and pollock `PW2603MR0069` (38,926).
  Inspected the extracted world-space surfaces without photograph textures.
  Their dead-fish fins are collapsed/merged; eyes are very shallow, the haddock
  tail is damaged, and the pollock jaw is distorted. They would need a further
  anatomical rebuild and opercular segmentation, so substituting them would
  not satisfy the user's A requirement.
- [Khronos/Microsoft BarramundiFish](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/BarramundiFish),
  CC0 model / CC-BY metadata: downloaded the official asset and licence and
  inspected it with and without base colour in the engine-studio CPU evaluator.
  It has only 3,864 triangles; the eye/opercular boundary disappear with the
  textures removed. It repeats precisely the flat-eye/decal failure that this
  batch forbids. Evidence: `refs/barramundi-audit/{head,head-basecolor}.png`.
- [Holmen's CC0 perch](https://blendswap.com/blend/8888) requires account sign-in
  to download. Scientific FFishAsia photogrammetry also directs downloads
  through authenticated Sketchfab. No authentication was bypassed, and no
  unverified or AI-generated fish was substituted.

The FishSim neutral geometry PNGs are source-audit evidence, explicitly **not**
engine-studio acceptance renders. Their rejected assets are development-only
files under the ignored `refs/` directory. The final shipping mesh continues
using the authored procedural sculpture; its head/cover B grades remain open.

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

## Rebuild 2026-11-05 — round 2 (executed 2026-11-09)

This section supersedes the round-one fish/head/cover assessment above. Scope
is only `fish-body` (including head and far-side cover) and `gill-cover`.
Teeth, stomach wall, villi, gills, plant and accepted GLB organs are retained.
No engine, shared kit, camera/framing, package manifest or lockfile was edited.

### Reference choice and factual preservation

The previous text named no species, and the existing sources used perch.
The reconstruction therefore uses freshwater **European perch** rather than
silently mixing a goldfish/tilapia head with the retained two-dorsal fin plan.
Only the opening species sentence changed, in EN and ZH: “A teaching model
based on a freshwater European perch, not to scale.” / “以淡水欧洲河鲈为参考的教学模型，不按比例。”
Part ids/counts, names, summaries, chapters, beats, labels, teaching quantities,
water/gas routes, spread, oscillation, explosion and opening pose are retained.
The new material tint resolves through `token:bone`; pigments are derived from
bone, neutral, seedling, ink-2, cut and hot tokens, evaluated under the studio rig.

Four real photo references were inspected for the body, head and operculum:

| Reference | Licence | Use |
|---|---|---|
| [George Chernilevsky, Perca fluviatilis 2008 G1](https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_2008_G1.jpg) | Public domain author release | Lateral proportions, actual cranial borders, lips, scales and tail |
| [H. Zell, Perca fluviatilis – Wilhelma 01](https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_-_Wilhelma_01.jpg) | CC BY-SA 3.0 | Shallow three-quarter body, fins and attachment points |
| [Dellex, Barsch3](https://commons.wikimedia.org/wiki/File:Barsch3.jpg) | CC BY-SA 4.0 | Near-front paired eyes, forehead, cheek and jaw |
| [Pmau, Perca fluviatilis img 33632](https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_img_33632.jpg) | CC BY-SA 4.0 | Supplementary head/bone relief and dorsal rays |

### What changed and self-grades

Grades are author assessments under docs/68, **not GPU acceptance**.

| Part / region | Rebuild | Self-grade | Round-one → current triangles | Surface draws |
|---|---|---|---:|---:|
| `fish-body` / trunk and fins | Photo-landmark loft with the trunk correctly raised above the fixed mouth route; tapered and closed peduncle, shallower fork, real paired attachments, cambered membranes, unequal rays and distal bifurcations on soft rays. Scales are shallow crescent displacement of the continuous skin with differential normals, rather than a decal or detached caps. Lateral canal follows the actual flank and does not float at the peduncle. | **B** | 33,760 → 45,504 (whole body, including head/far cover) | 1 → 1 |
| `fish-body` / head | Distinct orbital transition, convex iris-bearing ocular surface, separate optical dome and tiny mesh catchlight; integrated maxillary/infraorbital/preopercular relief, two unequal narial recesses per side, rolled upper/lower lips, open buccal lining and pharyngeal wall with a lateral route toward the branchial chamber. Cranial displacement now vanishes at the meridian, closing the former split seam. | **B** | Included above | Included above |
| `gill-cover` | Continuous thin opercular flap fitted to the head; hooked preopercular border and triangular opercle relief traced from the real head photo, soft gular margin, fine cheek scales, posterior point and subopercular edge. Near cover opens on the original pivot; fixed far cover is incorporated into the body. | **B** | 4,656 → 5,560 | 1 → 1 |
| Accepted `gills`, `plant-specimen`, anatomy and digestive close-ups | Unchanged. Regression checks compare inherited compressed bytes, node transforms, accessor/material metadata and runtime part bindings. | **A retained** | Unchanged | Unchanged |

**The requested fish A target is not achieved.** Every requested feature has
geometry, but the final side-by-side inspection does not justify promoting
these three entries to A:

- **Trunk/scales B:** the crescent field still reads as soft broad dimples under
  the studio specular band, rather than the crisp, fine, overlapping scale
  boundaries in the photograph. Earlier separate caps were worse (tiny teeth),
  but replacing them with this field has not completed the scale sculpture.
- **Head B:** the maxillary, infraorbital and cheek transitions remain too
  smooth/simplified next to the real head. The iris margin remains more
  regular than the photograph and the open-gape lower-jaw mass needs further
  anatomical refinement. Genuine globe/lens/lip geometry alone does not pass
  the requested photo-adjacent head bar.
- **Operculum B:** its hooked border and triangular bone relief are now
  modelled, but the plate still reads as an overly soft sculpted flap; the real
  preopercular/opercular overlaps are sharper and more differentiated.

These are unfinished modelling defects, **not a claim that A is impossible
within the constraints**. Passing the tests or meeting the packet budget does
not resolve them. This is an incomplete A rebuild, not an accepted delivery.
The relief is not intended to resolve microscopic ctenii or histology. The
technical-plate palette does not attempt the photograph's underwater spectral
iridescence. The photo set is not a registered same-specimen photogrammetry
capture: front is near-axial, and the model's open breathing gape differs from
the mostly closed-mouth photos. These limitations are disclosed rather than
presenting a generated or warped photograph as a missing view.

### Inspected look → change rounds

1. **R16 LOOK → R17:** compared profile, shallow three-quarter, near-front and
   head-close rows. The iris was too bright, the eye too small, the forehead
   too high and the cover still read as a separate shield. Lowered the forehead,
   enlarged/repositioned the eye, softened radial iris variation, thickened the
   lips and fitted the cover surface to its host cheek.
2. **R17/R18 LOOK → R19:** the cover's closed perimeter still looked inset.
   Extended it toward the upper/lower head margins, reduced the rim thickness,
   continued the body pigment field onto it and narrowed the artificial crease.
3. **R19–R22 LOOK → R23/R24:** traced lateral landmarks again: the trunk was
   too low relative to the mouth, creating a heavy breast. Rebuilt section
   centres, refined the eye against those landmarks, made the tail fork
   shallower, corrected fin roots, branched soft rays and modelled the far cover.
   Replaced crude finite-vertex skin normals with differential surface normals.
4. **R24/R25 LOOK → R26/R27:** the front view exposed an incomplete buccal
   lining and the cover's overly simple bone relationship. Added the complete
   inward lining and pharyngeal wall with the lateral outlet, separated the
   triangular opercle from its soft margin, and added fine cheek relief.
   Increased the back-wall extent so the view does not look through to paper.
5. **R27 LOOK → R28:** diagnosed a real dorsal split: a signed lateral cranial
   displacement did not vanish on the meridian. Replaced that offset with a
   surface-direction fade. Twelve rays across the **decoded runtime** crown
   now hit the continuous top surface. Also corrected the preview's false
   backface test: it now culls by projected winding, as WebGL does, rather
   than by an interpolated shading normal.
6. **R28/R29 LOOK → R30:** tile scales looked like repeated tiny teeth and
   stronger bone relief looked crumpled. Removed every trunk scale cap and
   integrated crescent scale relief into the continuous dermis, following the
   toad-skin technique. Reduced cranial relief heights and followed the real
   hooked preopercular/triangular opercular borders.
7. **R30/R31 macro LOOK → R32/R33:** the macro view exposed under-sampled
   normal relief. Redistributed the same budget to a denser meridional trunk
   patch, aligned the scale field to its sampling, stitched the transition ring
   exactly to the cranial polygon and reserved fewer segments for tiny fin rays.
   No fin/ray or teaching part was removed. The macro view shows integrated relief rather than separate tile edges,
   but the final look still rejects its soft scale definition as B.
8. **R33 macro LOOK → R34:** the old lateral-line sweep floated near the tail
   and was too pale. Fitted its y/z to the actual flank and reduced its radius
   and contrast. Closed the caudal root/peduncle join and replaced the misplaced
   single naris with paired unequal inset openings on each side. Re-rendered
   all final views from the actual bound, meshopt-decoded container.

Final inspected evidence directory:
`/Users/gavin/work/atlas-q-heart-digestive/scripts/geo/heart-and-lungs/rebuild/round34/`

`fish-comparison.jpg` has profile, shallow three-quarter, near-front, head-close
and scale-macro render | real-photo rows. `fish-open.png` shows the unchanged
45° opening pose from a posterior oblique view that exposes the accepted gills.
`fish-cinema.png` checks the dark plate rig. `preview-rig.json` records the rig;
`mouth-clearance.json` and `crown-seam.json` record physical runtime audits.
Earlier rejected looks remain under their numbered round directories.

### Engine fidelity, preservation and performance

`preview-studio.ts` reads the **currently bound** parts.json/model URL, rejects
stale snapshots, decodes meshopt data and applies world/normal transforms,
vertex pigments and source roughness. It reuses the fossils studio CPU GGX,
RoomEnvironment integration, actual exposure and ACES; rig values/directions
are asserted against `Lighting.tsx`. FrontSide uses actual winding. The opening
rotation/pivot are read from the pose, rather than an independent angle token.
This is a supersampled numerical offline PBR preview, not a GPU/FPS claim.
No Chromium, browser, desktop, e2e/shoot or git-write action was used.

| Metric | Round one | Round two |
|---|---:|---:|
| Body/head plus moving cover | 38,416 triangles | 51,064 triangles |
| Fish surface draws | 2 | 2 |
| All authored layers, including schema-expanded bilateral anatomy | 335,928 triangles | 348,576 triangles |
| All-layer estimated surface draws | 43 | 43 |
| Independently compressed new fish packet | No separate packet | **288,524 bytes** (≤ 600 KB) |
| Combined runtime GLB | 2,473,592 bytes | **2,761,788 bytes** |
| Protected original anatomy GLB | 1,952,300 bytes | 1,952,300 bytes, unchanged |
| Accepted round-one packet | 521,464 bytes | 521,464 bytes retained |

The combined GLB retains the existing oversize anatomy exception. The writer
retains the entire accepted binary prefix verbatim, retires only the old fish
node names and appends the new packet. Old unused fish bytes remain in that
prefix for conservative preservation; they are not extra rendered draws.
Tests compare the appended packet bytes to the actual shipped suffix, so the
600 KB gate cannot pass merely by reading an unrelated small token/asset file.

Reproduce:

```sh
pnpm tsx scripts/geo/heart-and-lungs/build-parts.ts
pnpm tsx scripts/geo/heart-and-lungs/preview-studio.ts 34 fish
python3 scripts/geo/heart-and-lungs/compare-sheets.py 34 fish
pnpm tsx scripts/geo/heart-and-lungs/check-mouth.ts
pnpm tsx scripts/geo/heart-and-lungs/check-seam.ts
pnpm tsx scripts/geo/heart-and-lungs/measure-rebuild.ts
```

The mouth audit uses the renderer's baked water paths and actual **0.0015 m**
particle spread. The crown audit uses GLTFLoader + Meshopt, checks 12 actual
rays and asserts that the loader selected the same triangle count as the
currently bound replacement. Both pass without changing routes or tolerances.
Final gate results are recorded below after the clean release runs complete.
They do not promote these B grades.

### Final round-two gates — 2026-11-09

All final processes exited **0** on the round-34 renderer-bound asset:

- `pnpm check`: 1,229 files, zero errors/warnings; five existing hints.
- `pnpm validate`: 94 topics, zero errors/warnings.
- `pnpm test -- --maxWorkers 2 --testTimeout 30000`: **278 files / 6,544 tests**
  passed; no skipped tests. No assertion or geometric tolerance was relaxed.
- `pnpm build`: **191 static pages**, completed with exit 0.
- `git diff --check`: passed (read-only git use).

The worktree's pre-existing `node_modules` symlink targets a read-only shared
installation. Final gates ran in `/private/tmp/atlas-heart-round2-gates` with
an exact source copy, the same installed dependency symlinks, the worktree's
actual public assets, and private writable `.astro`/Vite caches. No package or
lockfile changed. Earlier incomplete copies/cache-write failures are not
reported as passing gates. The final test includes the built JS budget check.

Final logs are copied into `rebuild/round34/`: `gate-check.log`,
`gate-validate.log`, `gate-test.log`, `gate-build.log`. `release-files.json`
records SHA-256 and byte sizes for the actual runtime asset, protected original,
fish packet, parts binding and generating scripts. The accepted surface proof
is `accepted-surface-preservation.json`.

**Visual status remains B for body/head/operculum. These green gates do not
fulfil the requested A target.** The concrete unfinished geometry is listed
above. GPU acceptance is also outstanding, as required by the no-browser rule.

## Rebuild 2026-11-05 — round 3 (executed 2026-11-09)

**Status: incomplete A target.** The requested construction and containment
corrections are implemented, but the final photo-adjacent head and scale
inspection still does not justify an overall A. No GPU acceptance is claimed.
This section supersedes the earlier round-two measurements and evidence paths.

### Reference set actually inspected

| Photograph | Credit / licence | Constraints |
|---|---|---|
| [Perca fluviatilis img 33558](https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_img_33558.jpg) | Pmau; CC BY-SA 4.0 | Requested snout/maxilla trace, eye position, nape and cheek; head-close sheet crop |
| [Perca fluviatilis 2008 G1](https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_2008_G1.jpg) | George Chernilevsky; public domain | Lateral silhouette, scale pattern, fin arrangement and spine lengths |
| [Perca fluviatilis – Wilhelma 01](https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_-_Wilhelma_01.jpg) | H. Zell; CC BY-SA 3.0 | Shallow three-quarter volume; paired fin roots; explicitly mirrored on sheet |
| [Barsch3](https://commons.wikimedia.org/wiki/File:Barsch3.jpg) | Dellex; CC BY-SA 4.0 | Near-front eye/forehead/jaw cross-section |

These are different real specimens, not registered multiview photogrammetry.
The model has an open breathing gape; the head references mostly have closed
mouths. Angle and pose differences remain visible and are not disguised with
warped or generated reference images. The photos are development references,
never runtime textures. All new geometry is original Atlas procedural work.

### Per-part changes and grades against docs/68

| Part / region | Change | Self-grade | Round-two → round-three triangles / draws |
|---|---|---|---|
| `fish-body`: snout, forehead, jaw and eyes | Narrower oval anterior section; pointed snout and concave nape transition; terminal mouth extends back beneath the orbital region; rolled lip meshes and inward buccal lining; narrowed frontal forehead; narial meshes seated on their actual host surface. Convex eye/lens geometry retained. | **B** | Whole body **45,504 → 45,933**, **1 → 1** |
| `fish-body`: all eight fins | Caudal, spinous dorsal, soft dorsal, anal and paired pectoral/pelvic membranes rebuilt as 45 μm thin cambered shells stretched between tapered raised rays, with uneven ray positions and branching soft rays. Spinous dorsal has stiff unbranched spines and a rear dark blotch. Pelvic roots now lie directly below pectoral roots. | **A construction / B overall photo match** | Included in body |
| `fish-body`: trunk scales | Replaced soft continuous dimples with individually overlapping, staggered curved lamellae, physical free crescent edges, fine token-relative pigment variation and actual relief normals. Lateral-line sweep fitted to the revised cross-section. | **B** | Included in body |
| `fish-body`: branchial chamber and ventral head | Lowered and broadened the ventral branchial region while keeping the snout narrower. Replaced the grid-cut recess with a spline-contour bowl and smooth rim shared with the cover outline. Eliminated the open-pose zigzag and the first iteration's protruding tissue skirt. | **A containment / rim construction** | Included in body |
| `gill-cover` | Reshaped lower and posterior margins to enclose the fixed filaments; fitted lower cheek width, retained original pivot/45° pose/oscillation. Opposite cover remains part of `fish-body`. | **B** | **5,560 → 5,560**, **1 → 1** |
| `gills`, `plant-specimen`, original anatomy | Mesh/accessor/material metadata, world transforms and compressed BIN prefix retained exactly. No gill vertex or source byte edited. | **A retained** | Gills **33,420 → 33,420**, plant **26,048 → 26,048**; **1 draw each** |
| `villi-block` correction | Routed the white basal lymphatic branch inside the tissue, removing the stray front-face stub. Original lacteal and capillary connections remain. | **A retained** | **14,499 → 14,499**, **1 → 1** |

**Concrete work still below A:** the anterior jaw, forehead and maxillary/
preopercular transitions still read as a simplified smooth mask beside the
requested Pmau head photograph, especially from the near-front camera. The
operculum's bony overlaps remain too soft and regular. The new scale borders
are crisp relief, but their repeated shingle shape is too uniform compared
with the fine ctenoid pattern; fin membranes are structurally corrected, but
their outlines and ray/membrane rhythm remain more regular than the photos.
These are unfinished modelling defects, not an assertion that A is impossible
within the constraints. Green local geometry checks do not promote them to A.

### Inspected looks and actual changes

1. **R34 baseline → R35/R36:** reviewed profile, three-quarter, near-front,
   head close and scale macro. Narrowed anterior width, enlarged the mouth
   commissure, lowered the throat, replaced slab-like fins with thin webs,
   moved pelvics below pectorals and added overlap-scale relief. The first
   pass exceeded the triangle budget; reduced tiny ray radial segments and
   allocated silhouette/scale samples by visible size.
2. **R36 LOOK → R37–R40:** exact beat-3 camera exposed the jagged rim, a deep
   swollen throat and large rectangular scale tiles. Replaced the sampled
   recess with a contour-aligned bowl, broadened only the ventral chamber,
   reduced throat depth, refined scale pitch and crescent edges, and expanded
   the posterior cover margin. Exhaustive containment improved from 694
   outside vertices to 18, then **zero**.
3. **R40/R41 LOOK → R42–R47:** removed the bowl's protruding skirt, stopped
   scale tiles at the chamber instead of spanning its opening, seated nares
   on the actual skin, strengthened the rear dorsal blotch, softened the nape
   interpolation and rounded the anterior cross-section. Changed lip width,
   commissure depth and chin height after inspecting the near-front photo.
4. **R47 corrected-light LOOK → R48/R49:** final regressions exposed upper-lip
   interference with two actual water paths after the jaw was lowered. Raised
   its clearance while retaining a large terminal opening; both particle
   capsules now pass. Fixed the singular bowl-centre normal. Final profile,
   three-quarter, near-front, head and scale sheets were inspected again.
   The remaining mask-like head, soft opercular overlaps and regular scales
   are the explicit B findings above, not hidden behind the passing audits.
5. **R48 count audit → R49:** checked [Museums Victoria / Fishes of Australia](https://fishesofaustralia.net.au/home/species/3690). Corrected each pelvic fin to I,5 (one spine and five soft rays), the second dorsal to I,13 and the anal to II,10, with its first two rays unbranched. Fourteen stiff first-dorsal spines and 13 pectoral rays are within the published ranges. These are physical morphology corrections, not new teaching labels or numbers. Rechecked the decoded mouth/closed chamber after meshopt and re-rendered all final views.

The initial inherited heart CPU renderer omitted the tissue family's
`envMapIntensity = 0.6`. This was corrected before the final material review:
`preview-studio.ts` now resolves each real part's material through the actual
engine `resolveMaterialLook` and multiplies the sampled RoomEnvironment by
that value. Baseline and final sheets were re-rendered with the same corrected
calculation. R35–R46 previews are geometry diagnostics, not final colour proof.

### Runtime evidence and reproducibility

Final comparisons: **`/tmp/atlas-heart-round3/round49/`**.
`fish-comparison.jpg` contains render | real-photo rows for profile, shallow
three-quarter, near-front, requested head-detail and scale-macro views.
`fish-beat3.png` and `fish-beat3-closed.png` use chapter 6 beat 3's **actual
camera read from its MDX state**, with the runtime opening pose/pivot.
`fish-cinema.png` checks the cinema rig. `preview-rig.json` records source-asset
SHA-256, material environment multipliers and actual engine light/exposure
values. The preview rejects stale parts snapshots and decodes the bound GLB.
It reuses the fossil numerical GGX/RoomEnvironment/ACES implementation and
checks the active studio rig. PMREM filtering, shadows and FXAA are numerical
approximations: these images do not replace GPU acceptance.

- `gill-containment.json`: **19,590 decoded gill vertices**, **0 outside**;
  minimum closed-skin clearance **0.3513 mm**. Every vertex is tested against
  both outer skin intersections on actual decoded triangles, not a bounding
  box or an independent sculpt proxy. The topic test asserts zero outside.
- `mouth-clearance.json`: all four shader-baked water paths, with the actual
  **0.0015 m** particle spread; zero centreline or swept-capsule collisions.
- `crown-seam.json`: actual GLTFLoader/Meshopt crown rays retain coverage.
- `/tmp/atlas-heart-round3/accepted-surface-preservation.json`: decoded gill/
  plant geometry, world transforms, colour and source-material signatures.

All old tracked generated payloads and images under `rebuild/` were removed;
its `.gitignore` now excludes new evidence. Old evidence remains locally at
`/tmp/atlas-heart-round3/legacy-evidence/`. Frozen build inputs are now the
single `accepted-sculpt.glb`, `accepted-parts.json` and `baseline-parts.json`
outside the evidence directory. The one current fish packet is
`scripts/geo/heart-and-lungs/fish-packet.glb`; tests compare its compressed BIN
with the renderer-bound suffix. No git write, browser, desktop or Chromium
operation was performed.

The chapter's stale EN/ZH sentence saying the fish represents no particular
kind was minimally corrected to identify the external European-perch reference
and describe its four arches as a teaching reconstruction. All ids, counts,
labels, chapter/beat references, flows, animations and poses are retained.

### Performance and asset accounting

| Metric | Round two | Round three |
|---|---:|---:|
| Body + moving cover | 51,064 triangles | **51,493 triangles** |
| Fish surface draws (estimate, excluding shadows) | 2 | **2** |
| All authored layers, including bilateral schema expansion | 348,576 triangles | **349,005 triangles** |
| All-layer surface draws (estimate) | 43 | **43** |
| Independent meshopt fish GLB | 288,524 bytes | **402,452 bytes** |
| Runtime heart/bench composite GLB | 2,761,788 bytes | **2,875,712 bytes** |
| Original protected anatomy GLB | 1,952,300 bytes | **1,952,300 bytes**, unchanged |
| Accepted round-one source packet | 521,464 bytes | **521,464 bytes**, unchanged |
| Digestive runtime composite | 2,625,012 bytes | **2,624,948 bytes** |
| Total public digestive GLBs | 4,718,632 bytes | **2,624,948 bytes** |

The new fish packet meets both 600 KB and 1.5 MB budgets. The composite retains
the pre-existing oversize anatomy exception: its original anatomy alone is
1.95 MB. Accepted old fish bytes remain unused in the immutable prefix to
preserve the accepted gill/plant compressed bytes. They add no rendered draws.
The digestive duplicate is removed; its canonical original URL now genuinely
serves every live part. See the digestive round-three report for source-prefix
verification without a second 2.09 MB file.

Reproduce (evidence is written to `/tmp`, never into the source tree):

```sh
pnpm tsx scripts/geo/heart-and-lungs/build-parts.ts
pnpm tsx scripts/geo/heart-and-lungs/check-closed.ts
pnpm tsx scripts/geo/heart-and-lungs/check-mouth.ts
pnpm tsx scripts/geo/heart-and-lungs/check-seam.ts
pnpm tsx scripts/geo/heart-and-lungs/preview-studio.ts 49 fish
python3 scripts/geo/heart-and-lungs/compare-sheets.py 49 fish
pnpm tsx scripts/geo/heart-and-lungs/measure-rebuild.ts
```

### Gates

Final gate results follow below. **The A modelling target remains incomplete
regardless of gate results.** `solar-system-polish.test.ts` was restored exactly
to its pre-batch contents as requested. Its old assertion that these topics
have no `atlasSurface` materials conflicts with their actual appended rebuilt
surfaces, so that assertion is expected to fail for both topics. No unrelated
test was edited to accommodate this batch, and no assertion was skipped or
relaxed. The topic's own tests verify both the preserved anatomy material path
and the real opt-in sculpture surface path separately.

### Final round-three verification — 2026-11-09

The final R49 source and assets were checked in
`/private/tmp/atlas-heart-round3/gates/`, an exact source copy with private
writable Astro/Vite caches and symlinks to the same installed dependencies.
The worktree's existing `node_modules` symlink targets the read-only shared
installation; its cache-write startup failures are not counted as gate passes.
No package, lockfile, engine, widget, camera or framing code changed.

- `pnpm check`: exit **0**, 1,232 files, **zero errors/warnings**, five existing hints.
- `pnpm validate`: exit **0**, **94 topics**, zero errors/warnings.
- `pnpm build`: exit **0**, **191 static pages**. Runtime GLB inputs were compared
  byte-for-byte with the worktree assets.
- `pnpm test -- --maxWorkers 2 --testTimeout 30000`: exit **1**; **277 files passed,
  one failed; 6,543 tests passed, two failed, zero skipped**. Both failures are
  the restored solar test's legacy “no surface opt-in” assertion for
  heart-and-lungs/digestive-system. All **17 topic rebuild tests** pass,
  including exhaustive gill containment, real mouth particle-spread clearance,
  preservation of accepted compressed bytes, runtime bindings and budgets.
  The full suite ran **after** build; all three JavaScript budget tests ran.
- `git diff --check`: passed. Read-only comparison confirms the solar test is
  byte-identical to `fb707956^` (its pre-batch contents).

`round49/release-files.json` records deployed asset/source-packet sizes and
SHA-256 values. The final preview's source-asset SHA-256 equals the shipped
runtime asset. Gate logs are retained alongside the final comparison sheet.
**The requested A fish and all-green gate outcome are not achieved.** The
specific geometry defects and the incompatible restored test are documented
above; no B surface or failed gate is presented as accepted.

## Rebuild 2026-11-05 — round 4 (executed 2026-11-09)

**Status: the all-A acceptance target is still incomplete.** The head, jaws,
eye, operculum, rounded chamber, pigmentation and scale relief were rebuilt.
The fish's fin opacity remains **B**, because the unchanged runtime cannot
adopt the supplied per-vertex membrane transparency. No GPU acceptance is
claimed. The following grades supersede earlier A labels for this fish.

### References and licensed-model search, before sculpting

Four genuine reference photographs were inspected, including the supplied GPU
comparison sheets `q-hd3-head-vs-perch.png`, `q-hd3-fish-vs-perch.png` and
`q-hd3-paper-beat3.png` from the main worktree:

| Reference | Credit / licence | Use |
|---|---|---|
| https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_img_33558.jpg | Pmau, CC BY-SA 4.0 | Requested head, nape, throat, maxillary endpoint, opercular spine, olive-gold pigmentation / bars |
| https://commons.wikimedia.org/wiki/File:Barsch3.jpg | Dellex, CC BY-SA 4.0 | Near-front cranial width, eye insertion, rounded jaw section |
| https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_-_Wilhelma_01.jpg | H. Zell, CC BY-SA 3.0 | Shallow three-quarter volume, paired-fin attachment and membrane/ray arrangement |
| https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_2008_G1.jpg | George Chernilevsky, public domain | Lateral silhouette, separate dorsals, peduncle, scale rows and fin positions |

The Smithsonian 3D search did not return a Perca model. The Sketchfab search
found [doublesob's European perch](https://sketchfab.com/3d-models/european-perch-ca1bef303691418f9788a5b1ca1870d5)
(a 2.6k-triangle low-poly model; no verified CC0 release) and
[NikoNappu's perch](https://sketchfab.com/3d-models/ahven-abborre-perch-42de48ccdcde46c0b6170015e76c8c3a)
(CC BY-NC-SA). University percid scans such as the
[MTSU tangerine darter](https://sketchfab.com/3d-models/tangerine-darter-percina-aurantiaca-5c6a124dcffe4e69a9fd2ed5605371d2)
are CC BY rather than the requested CC0/public-domain licence, and differ in
head/body form. ffish.asia's CC0 Coreoperca / sea-perch candidates have different
head and dorsal-fin silhouettes. No unsuitable scan or unverified licence was
vendored. Search queries and the source pages were checked before the new
sculpt. Original Atlas geometry is retained as original authored work.

The anatomy cross-check is the Museums Victoria / OzFishNet account:
https://fishesofaustralia.net.au/home/species/3690 . It describes the large
terminal mouth ending under the eye, concave dorsal cranial profile, rounded
snout, opercular flat spine, ctenoid scales, two dorsals, posterior dorsal blotch
and red-orange pelvic/anal fins. Its photographic licence is separate; that
page's photograph is not copied into the runtime or comparison sheets.

### What actually changed

`perch-trace.ts` now drives BOTH the longitudinal loft and the new cranial SDF.
Its upper/lower pixel curves are traced from img_33558; the sloping axial
baseline removes the photograph's pitch. This replaces the prior head's
circular section / domed forehead. The nape rises as a long wedge to a hump
behind the head. The maxillary edge is relief in the same continuous skin.
There is no separate lip sheet or floating maxilla plate. The independently
rounded lower jaw has real flesh around the carved buccal passage. A dark,
curved far buccal lining closes the view through the open near-side gape.
The far cheek and near opening differ slightly, rather than a mirrored hole
through both sides. Eye colour regions share a convex surface inset in the
orbital section; the black pupil has a thin bronze-gold iris and dark rim.

The photo shows a closed mouth. The model's open teaching inlet adds anterior
upper/lower jaw allowances and a rounded branchiostegal allowance around the
immutable gill basket. These are disclosed reconstructions, not measurements
of that photographed specimen. There is no top photograph in img_33558:
**top widths are reconstructed from Barsch3**, with gill clearance checked
against every decoded vertex. The source image is never stretched or used as
a texture. The traced side curve is executable mesh input, not an unused
landmark file standing in for the renderer-bound geometry.

The operculum is now a 0.18 mm curved shell with an irregular posterior arc
and a broad, flat spine. Its preopercular relief and smaller cheek scales are
part of the moving cover. The old exposed hinge rod is absent. The contour
used by the cover also defines a rounded branchial pocket, with smoothly
varying depth and no square walls. Source pivot / opening rotation remain.

Six broad dark trunk bars start **behind** the operculum, with a darker olive
back, olive-gold flank, paler belly and muted bony cheek. Colours are mixtures
of the actual `seedling`, `cut`, `bone`, `neutral`, `ink` and `hot` tokens in
linear light, divided by the runtime bone multiplier. Fin webs have continuous
camber and inter-ray sag; the raised rays taper, have unequal stations and
branch near soft tips. The first dorsal uses stiff pointed supports and a
visible dark posterior blotch. Pelvic and anal webs are orange-red. The
existing selected ray counts XIV / I,13 / II,10 / 13 / I,5 are retained.

Ctenoid lamellae now continue from the trunk over the nape/back, with smaller
relief on the cover and smooth bony anterior skin. Every repeated lamella and
ray is batched into the bound mesh. The original body contains no surviving
primitive fish, and no photographic decals are shipped.

### Looks, rejected forms and changes after each look

1. **R401 render | photo:** pigmentation and bars improved, but the front
   still had a thin beak-like edge, the eye lay too near the corner, and the
   gape looked through to paper. **Changed in R403–404:** moved/reduced the
   orbital assembly relative to the new longer head, fitted its socket to the
   actual head surface, thickened lower-jaw volume and fitted a dark lining;
   increased scale density, reduced coarse scale lift, and widened the
   contour patch to remove jagged branchial joins. The first separate fin
   primitive was rejected when the actual loader check proved it was dropped.
2. **R403 four-view sheet / R404 close:** the separate thick jaw patch made
   a false rolled ring, and its lining protruded from the front. **Changed in
   R405–408:** discarded that head construction. Extracted one continuous
   signed-distance head with a carved oral passage and analytic normals;
   simplified only the cranial mesh with normal/colour constraints. The eye
   is no longer simplified with the rest of the fish (that had made a star
   pupil). Maximum measured cranial simplification error is about 0.026 mm.
3. **R408–412 profile / requested-photo reread:** the snout was too sealed in
   the profile, the supplied pixel landmarks needed a true curve fit, the
   forehead hump began too early, and the lower patch projected as a skirt.
   **Changed:** made the pixel trace executable section input, moved the hump
   aft, removed the skirt by fitting the pocket to the real body boundary,
   rounded the anterior cap, and checked the open-jaw allowances against the
   unchanged water-particle spread. An unadjusted trace exposed 154 gill
   vertices: a disclosed curved branchiostegal allowance restored containment.
4. **R414–416 head look:** the near-side mouth aperture was too closed; simply
   widening it made a see-through white gap again. **Changed in R417:** kept
   the far buccal mucosa as a curved wall behind the near-side gape. Moved the
   first pigment bar behind the cover, softened the cheek pigment, and kept
   the dark oral cavity separate from skin pigmentation. These R417 views were rejected in the final reread below.


5. **Final R417 side-by-side rejection → R418–420:** the mouth still read as a
   square open box beside img_33558. Keeping the old inlet coordinates forced
   an oversized aperture. **Changed:** reduced the anterior upper/lower jaw
   allowances and sculpted a much smaller, fleshy terminal opening. Refitted
   the three upstream water controls vertically toward its centre, fitted the
   internal buccal control, and added one guide to delay the outward turn until
   the opercular chamber. Four paths, 120 particles, speed, colour, spread,
   gill delivery points and all downstream routes are unchanged. The full
   baked route audit was expanded from the 23 mm inlet window to **all 63
   segments on each of the four routes**. It caught a real blind front wall
   of the old pocket: the anterior pocket floor now curves into the buccal
   passage continuously. Final whole-route centreline and swept-capsule
   collisions are zero at the unchanged 1.5 mm spread. The refit changes
   reconstructed control coordinates, not a teaching fact or mechanism.

### Actual renderer binding and remaining fin limitation

The engine `GltfSource.findMesh` takes the first mesh under a named node. A
multi-primitive GLB becomes a Group in GLTFLoader, so a separate transparent
web primitive **does not render**. This was caught in this round, removed and
covered by a production-loader regression for every bound mesh part.
The shipping fish and cover each have one mesh / one primitive / one draw.

The mesh reserves RGBA alpha 0.76 on the webs and 1 on flesh, scales, eyes and
rays, with `atlasAlphaHash: true` on the fish source material. The actual
unchanged runtime surface hook does not adopt alpha hashing, so those webs
currently render opaque. The CPU preview calls the actual `gltfSurface.style`
hook and records the effective `rendererAlphaHash: false`; it does not pretend
that source metadata enables it. **Fin material grade B / overall fish B.**

`fin-alpha-hash.patch` proposes the minimal engine opt-in using Three's existing
alpha-hash coverage, preserving opaque depth writes and the single-mesh
binding. It passes `patch --dry-run -p1`, and is **not applied**. The main
session must decide that engine change and inspect its coverage on the GPU;
it is not included in any A claim here. The offline renderer deliberately
rejects a future enabled hash until its coverage preview is updated. No shared
engine, kit, widget, camera, framing or CSS file was edited.

### Grades and geometry / payload accounting

| Part | Before triangles | After triangles | Draws before / after | Self-grade |
|---|---:|---:|---:|---|
| `fish-body` (head/jaws/socket, trunk scales, all fins) | 45,933 | 47,261 | 1 / 1 | **B overall**: cranial / trunk form **A** self-grade; opaque fin webs below the requested bar |
| `gill-cover` | 5,560 | 4,586 | 1 / 1 | **A**: curved thin bone, rounded pocket, no exposed hinge rod |
| `gills` | 33,420 | 33,420 | 1 / 1 | **A retained**, original geometry / compressed streams unchanged |
| `plant-specimen` | 26,048 | 26,048 | 1 / 1 | **A retained**, original geometry / compressed streams unchanged |
| Digestive `villi-block` correction | 14,499 | 14,499 | 1 / 1 | **A**: both basal crescents buried; see its round-four report |

Fish + cover: **51,493 → 51,847 triangles**, **2 → 2** surface draws.
Conservative all-authored topic: **349,005 → 349,359 triangles**, **43 → 43**
surface draws, below 350k even before chapter filtering. This excludes
shadow-pass multiplication, the floor and flow overlays; it is not a GPU FPS
measurement. The original protected organ GLB remains **1,952,300 bytes**.
Fish packet: **402,452 → 447,352 bytes** (under both 600 KB and 1.5 MB).
Runtime composite: **2,875,712 → 2,760,368 bytes**. The inherited anatomy alone
already exceeds the 1.5 MB whole-container cap; re-encoding those accepted
organs remains outside this round's ownership. Added bench packet data is
below 1.5 MB. Measurements and SHA-256 are in `/tmp/atlas-heart-round4/metrics.json`.

`compact-accepted.ts` drops every superseded fish / cover node, mesh, accessor,
material and attribute stream from the appended accepted packet:
**521,464 → 361,228 bytes**. All **357,493 retained compressed bytes** are
copied verbatim, including POSITION, NORMAL, COLOR_0 and original indices.
The original anatomy prefix remains byte-identical. Tests independently decode
and compare original attributes, index order, layouts, transforms and materials.

**Necessary shared-stream remainder (item 10):** meshopt's 108,010-byte shared
index stream includes 230,496 decoded bytes of unreferenced old index slots.
Those are sequential decoder input: the stream's edge/vertex FIFOs, deltas and
code/data sections span all four old meshes. Cutting a compressed range would
corrupt the retained gills/plant; recompressing would violate the requirement
that the original gill compressed bytes stay unchanged. These slots have no
accessor, attributes, node or mesh that can render the retired fish. All old
fish attribute data is removed. This variant is also 4,968 bytes smaller than
losslessly re-encoding just the retained index ranges.

Digestive runtime: **2,624,948 → 2,625,036 bytes**; added sculpt packet
**531,744 → 531,832 bytes**. Tooth, stomach, field and anatomy are unchanged.
The two dark basal blood branches were moved inside the tissue while retaining
their vascular connections. Its front-face regression fails the old asset at
24 samples and passes all 1,215 samples on the new one.

### Reproduction and evidence

No evidence image, generated copy GLB or parts snapshot was added under
`scripts/geo/heart-and-lungs/rebuild/`. All evidence lives outside the repo.

```sh
pnpm tsx scripts/geo/heart-and-lungs/build-fish.ts 420
pnpm tsx scripts/geo/heart-and-lungs/check-closed.ts
pnpm tsx scripts/geo/heart-and-lungs/check-mouth.ts
pnpm tsx scripts/geo/heart-and-lungs/check-seam.ts
pnpm tsx scripts/geo/heart-and-lungs/preview-studio.ts 420 fish
python3 scripts/geo/heart-and-lungs/compare-round4.py 420
pnpm tsx scripts/geo/heart-and-lungs/measure-round4.ts
```

The final four-view fish renders include the accepted internal gills, including
the closed front study (the earlier front-only study omitted them and could
show paper through the otherwise connected buccal/branchial passage).
The preview decodes the shipping compressed asset, applies its world/pose
transforms and actual runtime material hook, resolves the tissue environment
intensity, and reuses the fossils studio GGX / sampled RoomEnvironment / ACES
renderer. All active rig intensities, directions, hemisphere colours and
exposure are checked against Lighting.tsx. Beat 6-2 / 6-3 views use actual MDX
camera values at **16:9**, including the unchanged open-cover pivot. Other
four-view comparisons use matched shallow profile/front/three-quarter study
views. Photo pose, age and azimuth differences are labelled: the supplied
head has its mouth and cover closed, and its tail is outside the photograph.
CPU PMREM filtering, shadows and FXAA remain approximations; no browser,
Chromium, desktop, e2e or shoot was launched.

Final comparison directory: **`/private/tmp/atlas-heart-round4/comparisons/`**.
Digestive comparisons: `/private/tmp/atlas-heart-round4/digestive/comparisons/`.
Before/iteration assets and sheets remain in `/tmp/atlas-heart-round4/before`
and `round401` … `round420`; none is committed. `preview-rig.json` binds the
final preview to the shipping GLB SHA-256. `gill-containment.json` reports
**19,590 vertices / 0 outside / 1.934 mm minimum clearance**; all four full incoming/buccal/branchial/outgoing
baked water routes pass at the actual **1.5 mm** particle spread. Crown rays
retain complete coverage. All part ids, counts, labels, chapters/beats, bilingual
teaching text, flow parameters, downstream gill routes, poses, animations,
pivots and explode settings remain. Only the reconstructed upstream water
controls are refitted, with one extra curve guide per route as disclosed above.

Final visual look (2026-11-09): inspected the regenerated R420 front, shallow
three-quarter, profile, head close-up and scale sheets, both actual chapter-six
beat cameras, and the cinema render. These are the final decoded asset with
internal gills included, not an earlier geometry snapshot. The front study is
an open mouth against a closed-mouth photo; that pose difference remains
explicitly labelled. The digestive beat-5-4 before/after sheet was also
inspected: neither basal crescent remains. The opaque membrane limitation is
visible in these sheets and is not hidden by the A cranial/trunk self-grade.

**Green gates will not promote the unresolved B fin material to A.**

### Final integrated gates — 2026-11-09, R420

All four required commands exit **0** on the final production geometry:

- `pnpm check`: 1,235 files; 0 errors, 0 warnings, 5 existing hints.
- `pnpm validate`: 94 topics; 0 errors, 0 warnings.
- `pnpm test -- --maxWorkers 2 --testTimeout 30000`: **278 files / 6,545 tests passed**; no skips or runner errors. The 12 heart rebuild and 7 digestive rebuild tests are included.
- `pnpm build`: **191 pages**, successful production build. The post-build first-screen JS-budget integration test also passes **3/3**.

The commands ran in `/private/tmp/atlas-heart-round4/gates`, a synchronized
workspace with the same installed dependencies and private writable caches.
The worktree's pre-existing `node_modules` symlink points outside the writable
workspace, so no dependency/cache write was attempted there. Package manifest,
lockfile, Astro/Vitest/TypeScript configs are byte-identical. Hash verification
confirms source = gate copy = built output for both runtime GLBs; the final
heart bench SHA-256 is
`2e626cab6f5c9d77b3a527fc68048ea7f101c8883a0a53f86e79a9155c5d285d`.
Logs, status and hashes: `/private/tmp/atlas-heart-round4/gate-control/`.
The final preview-only TypeScript edits are checked again after this build;
they do not alter either runtime asset. `git diff --check` and the unapplied
engine patch dry-run pass. No browser acceptance or git write was performed.

## GPU acceptance 2026-11-16 (round 4)

Checked with `pnpm shoot heart-and-lungs --beats --gpu` and `pnpm shoot digestive-system --beats --gpu`, paper and cinema, against main and next to `Perca_fluviatilis_img_33558.jpg`. Accepted under the round-4 rule (clearly better than main at beat size, no glaring defect). Compare sheets: `/Users/gavin/work/atlas/.claude/compare/r4-hd-*.png`.

- **Fish:** reads as a perch at chapter 6 beats 2 and 3: olive-gold body, six strong dark bars, darker back, spiny first dorsal with its dark rear blotch, orange-red pelvic and anal fins, long wedge head, rounded gill pocket. Main showed a primitive grey fish.
- **Fin alpha hash removed.** With the `atlasAlphaHash` opt-in in `GltfSource`, Three's alpha hash rendered every fin web as white static (no temporal accumulation in this renderer): a glaring defect at beat 2 (see `r4-hd-fins-alphahash-vs-opaque.png`). The engine line was reverted, so `GltfSource.tsx` is identical to main and no other topic can change. The fish GLB still carries `atlasAlphaHash: true` in its material extras; the runtime ignores it, so the webs render opaque.
- **Digestive villi block:** the front face below the cut villus is clean at beat 5-4.

Residual minor issues (not blocking):
- Fin webs are opaque; a smooth translucency route (e.g. alpha-to-coverage with MSAA, tested on iPad) would let them read as membranes.
- The open gill cover still reads somewhat thick at its rim in beat 3; it should be thinner bone.
- The eye is still slightly large, and its pale iris ring reads a little cartoonish next to the photo.
- The snout tip is slightly pointed, and the maxilla line is faint at beat-3 distance.
