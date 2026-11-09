# Forces — rebuild evidence

## Rebuild 2026-11-05

Executed 2026-11-09. The topic had no REVIEW.md, FIXES.md or earlier REBUILD-3D.md. Applicable review: docs/68-3d-realism/review-machines.md, forces row. This work covers the car, fork, brake and soles, followed by an apparatus sweep. Grades below are offline geometry self-assessments against docs/68, pending the separate GPU browser acceptance. No browser or desktop was opened.

### Toy car / wheels — self-grade A

Replaced `toy-car`'s constant-width cartoon extrusion with an original lofted 9 cm plastic hatchback: crowned bonnet and roof, tapered body, outward-formed wheel arches with open wheel wells, inner shell and thickness returns, sloping inset panes, solid A/B/C pillars, physical shut gap and side moulding, handle relief, formed valances, bumpers, rear lamps, raised grille bars, convex headlamps with moulded lens flutes, wipers and two through axles. `car-wheels` retains four 22 mm rubber tyres, now with rounded shoulders, recessed perforated hubs and axle heads. Wheels sit within the body envelope instead of protruding like an off-road toy.

This is a generic three-door teaching toy, not a licensed miniature of the photographed car. The source toy's surfboard rack, badges and wear are not characteristics of the lesson object and were not copied. The deliberately large 22 mm toy wheels are retained because the lesson explicitly specifies them; they are not presented as a scale replica of a road vehicle. The car remains plastic, and no EN/ZH teaching text changed.

**Reference photos, all inspected:**

1. [Matchbox Volkswagen Golf Mk1](https://commons.wikimedia.org/wiki/File:Matchbox_Volkswagen_Golf_(Mk1)_(15212960839).jpg), Riley / NZ Car Freak, CC BY 2.0 — toy body, glazing, arches, hub recesses; three-quarter comparison.
2. [VW Golf I front 20090416](https://commons.wikimedia.org/wiki/File:VW_Golf_I_front_20090416.jpg), Rudolf Stricker, Attribution licence (Commons author permits all uses with credit) — panel crown, inset windows and tyre/body relationship.
3. [Volkswagen Golf I in profile almost](https://commons.wikimedia.org/wiki/File:Volkswagen_Golf_I_in_profile_almost.jpg), Charles01, CC BY-SA 3.0 — profile, heel/body relationship, roof and greenhouse silhouette. This road car has five doors; the teaching toy has three.
4. [VW Golf Mk1 Front Grill](https://commons.wikimedia.org/wiki/File:VW_Golf_Mk1_Front_Grill.jpeg), Nick Carson, public domain — front and close-up of actual recessed grille, headlamp lens and bumper depth.

References reside in `scripts/geo/forces/refs/`, not in runtime assets. Comparison sheets resize the photographs without painting out details. Photo copyright/licence remains with the named creators; sheets containing Charles01's photograph are CC BY-SA 3.0, and sheets containing Riley's photograph require CC BY 2.0 attribution. Original model geometry is CC0-1.0; no reference photograph is a texture.

### Look / change / look record

- **First look, round1:** looked at the actual compressed GLB under the engine studio/ACES CPU preview alongside the toy photo. Reversed side-pane normals made the cabin appear open; Catmull-Rom frame rails looked like an inflated roll cage, and blank hub discs resembled wheel covers. **Changed:** corrected pane winding, replaced the tubular frames with rounded solid rectangular pillars, lowered the roof, and pierced the hubs with real eight-hole openings.
- **Second look, round2:** looked at front, profile and three-quarter sheets. The transverse tyre spacing placed the wheels too far outside the body; the bonnet edge did not meet the front valance, and there was a roof/windscreen edge gap. **Changed:** moved the two axles' wheel centres inward (diameter and longitudinal wheelbase unchanged), joined windshield and roof edges, lowered the bonnet shoulders at the ends and joined the crowned bonnet to a shaped front cap.
- **Further close-up, final:** looked at the grille detail and paper/cinema renders. Added inner body skins and real edge returns, a convex moulded headlamp lens with relief flutes, and the final cap joining the bonnet to the valance. The remaining dark bonnet line is a physical panel seam. Final sheets are `evidence/round5/comparisons/`; initial two looked-at versions remain in round1/round2. Intermediate diagnostic rounds3/4 were removed to avoid duplicating deliverables.

The front, three-quarter, profile and characteristic-detail sheets use a matching side/direction and similar elevation to the available photos. **Evidence limit:** the sources are generic specimens rather than a calibrated four-view photograph set. The profile photo is mildly oblique; the front photo is a closer, lower view of a full-size road car. They support topology, relief and silhouette checks, not a claim of exact pixel registration or exact-brand reproduction. Strict photographic registration remains incomplete without additional matching specimen photographs.

### Offline lighting / behavior checks

`preview-car.ts` decodes the actual meshopt GLB, applies the node world transforms, engine primitive builder and material resolver, source `atlasSurface` roughness/metalness/vertex colours, then the existing fossils `studio-cpu.ts` GGX, sampled RoomEnvironment, hemisphere and three direct lights. Paper/cinema exposure and ACES are preserved. `audit-studio-contract.ts` compares those rig values directly against what the installed engine's Lighting.tsx passes, including directions, intensities, hemisphere and exposure; it passes. This is a numerical lighting approximation, not a GPU pixel-identity claim; environment filtering differs and GPU shadows/HUD are not certified here.

`audit-model.ts` reads the final compressed GLB and checks each mesh is reachable in its default scene, positions/normals are finite, all original part IDs and original simulation/pose/chapter-facing state are preserved (the cable alone gains matching squeeze poses), and each wheel material has exactly four matching motion pivots. The wheels remain engine primitives because the existing `each` animation requires primitive copies. Body, wheel animation, push/roll/magnet controls and explode directions remain bound to the original part IDs. No engine change is needed.

### Apparatus sweep, references and evidence


This is an original procedural reconstruction of school apparatus, not a claim to reproduce a named commercial model. Existing part ids, chapter/beat references, force parameters, object masses, dimensions and animation bindings remain. The paper part retains a hidden radius-.025m sphere proxy at its original launch centre because `sim.force.fall` requires primitive launch/rest bounds; `GltfSource` replaces its visible shape with the folded paper mesh. The primitive is physics metadata and does not render after the GLB loads. Its neutral white tint is mandatory: SceneRoot takes material slots from a primitive when one is present, so omitting it would multiply the enamel vertex tint twice and invalidate the preview. `apply-hardware.ts` only swaps the eight named part geometry/material entries; parent applies it after merging `hardwareDocument()` with the car into `/models/forces.glb`.

## References inspected

Development photos are downloaded by `fetch-hardware-refs.py` into ignored `refs/hardware/`. They are not shipped as textures. The GLB contains only original geometry and technical-plate/preset colour attributes.

- Rim brake / paired axle support: [Sidepull caliper brakes, Aezram, CC BY-SA 2.5](https://commons.wikimedia.org/wiki/File:Sidepull_caliper_brakes.jpg), [Shimano 600 single-pivot brake, Friedjof, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Shimano_600_tricolor_Brakes_BR-6400.jpg). Two independent photos establish fork crown mounting, asymmetrical overlapping forged arms, shared pivot, side cable stop, anchor, return spring and opposed pads. The displayed wheel stand is an original bench fixture; it is not an entire bicycle fork reconstruction.
- Retort / drop stand and clamp hardware: [Retort stand with a clamp, Tsaenmai, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Retort_stand_with_a_clamp.jpg), [Laboratory support stand](https://commons.wikimedia.org/wiki/File:Laboratory_support_stand.jpg). Heavy cast plate, rod socket, screw-operated split bosses, cross arms and fingers are actual relief. The original teaching release apparatus uses two linked release jaws, not the glassware clamp depicted in the photographs.
- Shoe soles: [MephistoSchuhsohle](https://commons.wikimedia.org/wiki/File:MephistoSchuhsohle.JPG), [Semelle de chaussure pointure 47](https://commons.wikimedia.org/wiki/File:Semelle_de_chaussure_pointure_47.jpg), [Nike shoe dissected front, Yottanesia, CC0](https://commons.wikimedia.org/wiki/File:Nike_Running_Shoe_Dissected_Front.jpg), [Nike shoe dissected rear, Yottanesia, CC0](https://commons.wikimedia.org/wiki/File:Nike_Running_Shoe_Dissected_Rear.jpg). Used for heel breast, waist, sprung toe, continuous section thickness, tread blocks and channels. No brand marks reproduced. The modeled samples retain the existing smooth-plastic versus rubber comparison.
- Crumpled A4 sheet: [Paperball, Army1987](https://commons.wikimedia.org/wiki/File:Paperball.png), [Paperball 2, Nikhilesh Haval](https://commons.wikimedia.org/wiki/File:Paperball_2.jpeg). Unequal fold panels, deep pockets, finite-radius creases and layered sheet lips rather than a smooth spherical material. Crumples have no intrinsic front/profile; the same two independently crumpled real samples support the three generated view directions.

## Offline evidence and two-look iterations

`hardware-preview.ts` decodes the actual compressed delivered GLB. It uses a topic-local copy `hardware-studio-cpu.ts` of the reused fossils `studio-cpu.ts` rig (only adding the actual family envMapIntensity multiplier), hemisphere, three directional lights, exposure 1.05/1.0, RoomEnvironment sample convolution, linear working space, GGX and Three ACES matrices. Hardware source materials opt into the actual engine `atlasSurface` path: source roughness/metalness are passed through, base vertex colours multiply a neutral white factor, and family roughness/normal maps are removed. Preview reads those actual decoded material factors rather than assuming a shader finish. Paper roughness is explicitly .90, not glossy enamel. Paper/cinema views are both saved. This is numerical offline PBR and not GPU pixel-identity or GPU acceptance.

- Look 1 (`iteration1`): front/three-quarter/profile/detail + photo sheets inspected. Caliper reach was too long, crown sat too high, collar looked like a block, sole outlines were angular, arch triangulation showed, paper had regular flat triangles. Changes: shorten reach and matching crown; add barrel/thread/wire anchor/return spring; pad groove relief; actual split bored clamp collars; offset perpendicular rod bores; smooth sole perimeter and structured interior loft; replace crumpled lathe.
- Look 2 (`iteration2` → `iteration4`): paper smoothing made the sample read like clay; sole arch remained diagonally triangulated. Changes: replace sole extrusion with a 64 × 12 structured longitudinal/transverse loft, independently modeled heel breast and sprung toe, unequal lugs and open channels. Replace smooth paper noise with irregular flat folded panels joined by narrow rounded crease bands; increase unequal fold density and add thin folded pockets/lips. Remove broad specular highlight by using matte paper finish.
- Look 3 (`iteration5` → `iteration6`): deepened and nested paper valleys, replaced uniform directional distribution with seeded irregular panel sizes, added seven unequal tucked edge pockets, and reduced redundant sole samples while retaining smooth normals. Final close-up caught and removed two unnecessary floating welt curves from the smooth plastic sample. Corrected pad carriers so the unchanged light/firm squeeze poses reach the rim instead of closing on empty air.

Comparison root: `/Users/gavin/work/atlas-q-circuits-forces-magnets/scripts/geo/forces/comparison-sheets/hardware/`.

The sheet labels identify model view direction. Sole underside and side/section photos are paired by orientation; stand frontal and detail photos are paired with corresponding model views. Orthographic profile views and views with a reused different-angle photo are **supplementary geometry checks, not registered same-angle photo acceptance**. The available open photographs do not supply full orthogonal coverage of the original custom teaching rigs. Parent/GPU acceptance must judge these reconstruction views; the report does not pretend that a reused photograph proves an unseen angle.

## Part changes and self-grades

| Part | Geometry changes | Grade |
|---|---|---|
| `wheel-stand` | Opposed axle cheeks/dropouts and axle nuts; separate feet; twin curved fork blades and crown around the tyre; real crown brake mounting bolt; handle grip rings; stationary bored clamp band, curved bracket and shaped lever housing/pivot, while the parent authors the independently moving curved lever. Existing A wheel untouched. | A, original fixture reconstruction |
| `brake-caliper` | Two overlapping forged arms, shared pivot/nut, asymmetric side-pull extensions, barrel adjuster with thread relief, cable anchor and return spring, metal pad carriers and rubber pads with relief grooves. | A geometry; mechanism inherited squeeze approximation noted below |
| `brake-cable` | Continuous bowed housing meeting lever stop and caliper stop; metal ferrules. | A geometry; cable poses keep both ends attached |
| `shoe-soles` | Asymmetric foot shape, structured smooth arch/waist, heel breast and step, sprung toe; independent rubber lugs and perimeter shoulder blocks with open channels. | A geometry |
| `retort-stand` | Rod socket, rubber feet, true bored split boss collar with independent thumbscrews; offset crossarm bore, bent hooks reconnect to original spring and balance positions. | A geometry |
| `drop-stand` | Heavy seated socket/base and retained three original height marks. | A geometry |
| `release-clamps` | True bored boss and crossarm, two opposed rubber-lined finger jaws with pivot/push release detail; rod paths offset to avoid physical rod interpenetration. | A, custom teaching apparatus reconstruction |
| `paper-crumpled` | Irregular folded paper surface, unequal planar panels and crease bands, deep pockets, thin layered tucked edge lips; existing mass, area and drop bindings retained. | B: broad triangular fold patches still read as procedural origami in a close-up; a continuous paper fold simulation or a licensed scan is needed for A. This is explicitly unfinished. |

## Mechanism limitations

The existing brake simulation scales the complete caliper in Z about the rim centre; it is a teaching approximation rather than two separately articulated arms. A numerical audit reads the decoded GLB POSITION/COLOR_0 values and the actual runtime pose data (`hardware-pad-audit.json`): rest inner pad face is 11.9984 mm from wheel centre. Existing light scale .8 yields 9.60 mm versus the rim half-width 9.50 mm (0.10 mm clearance); firm .785 yields 9.42 mm (0.08 mm modeled compression). The teaching brake deceleration numbers and controls are unchanged. The final mechanism look exposed a 7 mm separation at the cable stop during squeezing. `polish-cable.ts` adds cable entries to the existing light/firm poses and squeeze target list: the lever-end ferrule stays fixed while the caliper-end ferrule follows the moving stop. This uses a 0.72% / 0.78% affine length change, not a physically simulated Bowden bend. `audit-model.ts` uses the engine's `lerpTransform` and actual decoded ferrule vertices through all six transitions among rest/light/firm; the worst sampled endpoint gap is below 0.03 mm. The final firm-pose four-view sheet was inspected; the housing meets its barrel adjuster. Whole-caliper scaling remains the inherited mechanism approximation rather than two articulated arms.

## Final look and concrete incomplete item

Look 4: the source delivered after iteration 7 has 220 irregular fold vertices, 436 unequal broad panels, seven thin tucked pockets and finite crease bands. I inspected `iteration7/paper-comparison.png` next to both photographs. It still reads as folded triangular origami in a close-up, so its self-grade is **B**. A final continuous-sheet spherical-wrap experiment (`iteration8`) read as soft clay and was rejected; it is not in the delivered GLB or build code. A physical self-colliding paper-sheet simulation or a licensed scan is needed to reproduce the nested wrinkles and sheet topology faithfully. The original nine-segment lathe is gone, but this supplementary prop is not claimed A. The remaining seven hardware parts are A geometry reconstructions; GPU acceptance remains external.

## Counts

Before/after hardware: **34,572 → 109,380 triangles**, estimated part/material mesh draws **15 → 8**; hardware asset **0 → 560,620 bytes**. Only the merged topic GLB is publicly shipped; the intermediate is `scripts/geo/forces/evidence/forces-hardware.glb`. Per part:

| Part | Before triangles | After triangles | Before/after draws |
|---|---:|---:|---:|
| retort-stand | 1,560 | 11,864 | 2 / 1 |
| drop-stand | 11,148 | 4,620 | 2 / 1 |
| release-clamps | 2,136 | 15,224 | 2 / 1 |
| paper-crumpled | 144 | 10,672 | 1 / 1 |
| wheel-stand | 3,516 | 23,352 | 3 / 1 |
| brake-caliper | 6,908 | 17,048 | 2 / 1 |
| brake-cable | 8,800 | 1,920 | 1 / 1 |
| shoe-soles | 360 | 24,680 | 2 / 1 |


Exact before/after part triangles and estimated mesh draw calls are generated into `hardware-metrics.json`. Before is built from the saved original `hardware-before.json` using the engine `partPieces`, after from the actual build geometry. Static detail is merged by named selectable part, eight mesh draws. Parent reports aggregate topic counts and final merged GLB size. There was no hardware GLB before (0 bytes).

### Moving lever and final integration

The whole-model sweep also replaced the straight `brake-lever` bar with a curved, bevelled forged blade and concentric pivot pin. Its stationary housing and handlebar collar moved into the existing `wheel-stand` assembly, so the original 12°/22° poses rotate the blade independently. Self-grade **A** for blade/housing form; the caliper still has the inherited whole-part squeeze approximation described above. No part ids were added. The car silhouette was reduced only longitudinally to retain the nominal 9 cm envelope; wheel arch and axle centres were compensated, preserving the original 56 mm wheelbase. The rear magnet shifted 0.5 mm to remain seated against the shortened bumper. Its colour, count and force binding are unchanged.

The parent actual-decoded contact audit includes the raised rubber groove lands as well as the carrier face: the closest land is 11.348 mm from wheel centre at rest, 9.078 mm under light pressure and 8.908 mm under firm pressure, versus the rim's 9.5 mm half-width. Thus light and firm controls both bring rubber relief into contact (about 0.42 / 0.59 mm geometric rubber compression). The bulk face-only measurement in the hardware audit is 11.998 mm; the two figures measure different real surfaces.

**All 46 original entries, including context and every hidden study, are preserved.** Before/after full-topic geometry: **198,764 → 345,156 triangles**; estimated part/material mesh calls **75 → 71**; public GLB **0 → 794,848 bytes**. The source hardware GLB is build evidence only and does not ship. The meshopt final topic GLB remains below 1.5 MB. Counts exclude extra shadow/cutaway/overlay passes and are not GPU FPS.

### Per-part final audit

The A rows for unchanged parts mean retained educational-scale geometry, not a new product-photo reconstruction. Real steel balls, rectangular test samples and flat paper keep their actual simple forms. `paper-crumpled` is the concrete unfinished B item.

| Part | Self-grade | Triangles before → after | Estimated calls before → after |
|---|---|---:|---:|
| `ramp-board` | A | 1,764 → 1,764 | 2 → 2 |
| `ramp-block` | A | 588 → 588 | 1 → 1 |
| `release-gate` | A | 2,352 → 2,352 | 1 → 1 |
| `runway` | A | 2,352 → 2,352 | 2 → 2 |
| `glass-mat` | A | 2,940 → 2,940 | 2 → 2 |
| `carpet-mat` | A | 588 → 588 | 1 → 1 |
| `metre-rule` | A | 2,196 → 2,196 | 2 → 2 |
| `toy-car` | A | 744 → 53,828 | 1 → 1 |
| `car-wheels` | A | 768 → 18,432 | 1 → 3 |
| `friction-board` | A | 1,764 → 1,764 | 2 → 2 |
| `glass-lane` | A | 2,940 → 2,940 | 2 → 2 |
| `sandpaper-lane` | A | 588 → 588 | 1 → 1 |
| `wooden-block` | A | 4,236 → 4,236 | 2 → 2 |
| `brass-weights` | A | 1,280 → 1,280 | 1 → 1 |
| `pull-balance` | A | 5,364 → 5,364 | 4 → 4 |
| `pull-balance-spring` | A | 8,448 → 8,448 | 1 → 1 |
| `pull-balance-pointer` | A | 4,236 → 4,236 | 2 → 2 |
| `pull-string` | A | 3,520 → 3,520 | 1 → 1 |
| `retort-stand` | A | 1,560 → 11,864 | 2 → 1 |
| `test-spring` | A | 22,080 → 22,080 | 1 → 1 |
| `mass-hanger` | A | 4,428 → 4,428 | 1 → 1 |
| `slotted-masses` | A | 952 → 952 | 1 → 1 |
| `spring-ruler` | A | 1,044 → 1,044 | 2 → 2 |
| `weigh-balance` | A | 5,556 → 5,556 | 4 → 4 |
| `weigh-balance-spring` | A | 8,448 → 8,448 | 1 → 1 |
| `weigh-balance-pointer` | A | 4,236 → 4,236 | 2 → 2 |
| `weigh-cradle` | A | 36,480 → 36,480 | 1 → 1 |
| `drop-stand` | A | 11,148 → 4,620 | 2 → 1 |
| `release-clamps` | A | 2,136 → 15,224 | 2 → 1 |
| `sand-tray` | A | 1,176 → 1,176 | 2 → 2 |
| `steel-ball-small` | A | 2,976 → 2,976 | 1 → 1 |
| `steel-ball-large` | A | 2,976 → 2,976 | 1 → 1 |
| `paper-flat` | A | 588 → 588 | 1 → 1 |
| `paper-crumpled` | B (unfinished) | 144 → 10,672 | 1 → 1 |
| `wheel` | A | 13,368 → 13,368 | 3 → 3 |
| `wheel-stand` | A | 3,516 → 23,352 | 3 → 1 |
| `brake-caliper` | A | 6,908 → 17,048 | 2 → 1 |
| `brake-lever` | A | 1,176 → 2,012 | 1 → 2 |
| `brake-cable` | A | 8,800 → 1,920 | 1 → 1 |
| `shoe-soles` | A | 360 → 24,680 | 2 → 1 |
| `sponge` | A | 588 → 588 | 1 → 1 |
| `sponge-weight` | A | 640 → 640 | 1 → 1 |
| `bar-magnet` | A | 1,176 → 1,176 | 2 → 2 |
| `car-magnet` | A | 1,176 → 1,176 | 2 → 2 |
| `push-rod` | A | 3,168 → 3,168 | 2 → 2 |
| `bench` | A | 5,292 → 5,292 | 1 → 1 |

### Reproduce

```sh
pnpm tsx scripts/geo/forces/hardware-build.ts 7
pnpm tsx scripts/geo/forces/polish-lever.ts
pnpm tsx scripts/geo/forces/polish-cable.ts
pnpm tsx scripts/geo/forces/apply-hardware.ts
node scripts/geo/forces/build-car.mjs 5
pnpm tsx scripts/geo/forces/profile.ts
pnpm tsx scripts/geo/forces/audit-model.ts
pnpm tsx scripts/geo/forces/audit-studio-contract.ts
pnpm tsx scripts/geo/forces/preview-car.ts round5
pnpm tsx scripts/geo/forces/hardware-preview.ts final
```

Car comparison directory: `/Users/gavin/work/atlas-q-circuits-forces-magnets/scripts/geo/forces/evidence/round5/comparisons`. Hardware comparison directory: `/Users/gavin/work/atlas-q-circuits-forces-magnets/scripts/geo/forces/comparison-sheets/hardware/final`.

Final cable-motion diagnostic: `HARDWARE_POSE=brake-firm HARDWARE_STUDY=wheel-brake pnpm tsx scripts/geo/forces/hardware-preview.ts firm public/models/forces.glb scripts/geo/forces/comparison-sheets/hardware/firm`. Four views inspected after the final pose correction. The generic photos are approximate-angle comparisons, as disclosed above.

### Combined final gates — 2026-11-09

All required gates passed on the final combined geometry and persisted pose data:

- `pnpm check`: 1,233 files, 0 errors, 0 warnings; 7 existing hints.
- `pnpm validate`: 94 topics, 0 errors, 0 warnings.
- `pnpm test`: 277 files and 6,530 tests passed, with two workers.
- `pnpm build`: 191 pages built; 327 PWA precache entries.

Reproduce with `scripts/geo/forces/run-gates.sh`. The pre-existing worktree `node_modules` symlink points outside writable roots, so the unchanged package scripts ran in `/private/tmp/atlas-cfm-gates` with writable local caches. SHA-256 checks confirm the tested topic data and both public GLBs are byte-identical to this worktree. Gate metadata: `scripts/geo/forces/evidence/gates-final.json`; transient logs: `/private/tmp/atlas-cfm-{check,validate,test,build}-final.log`. `git diff --check` also passed. No browser/desktop or git writes were used.

Curated cross-topic comparison directory: `/Users/gavin/work/atlas-q-circuits-forces-magnets/scripts/geo/forces/comparison-sheets/batch2-final` (39 sheets plus CREDITS.md). Original iterations, individual renders and exact reference attributions remain in-topic. GPU acceptance, approximate photo angles and the documented forces paper B limitation are not waived by these software gates.

## GPU acceptance 2026-11-09 (Claude)

Shot on the real GPU (`pnpm shoot forces --beats --gpu`, paper and cinema) with close-ups next to main.

- `toy-car`: A. One fix: the side moulding was a single tube from bumper to bumper and crossed both wheel openings, floating in front of the tyres. `build-car.mjs` now runs it between the arch lips only (x ±0.0205 m). GLB 794,848 → 794,568 bytes; car triangles unchanged.
- `brake-caliper`, `brake-lever`, `brake-cable`, fork, `wheel-stand`, `drop-stand`, `release-clamps`, `retort-stand`, `shoe-soles`: A on the GPU, as self-graded.
- `paper-crumpled`: **stays B, accepted as is.** It is a 5 cm secondary prop, about 20 px across at its chapter camera, and it lies in the sand tray. Up close it reads as a crumpled sheet, with sharp creases and unequal panels; real crumpled paper is faceted too. What keeps it short of A is a regular "origami" look in a close-up. Fixing that needs a cloth/self-collision crumple sim or a CC0 scan, which is too much for a prop this size. It is listed as a follow-up and does not block shipping.
- The 267 comparison sheets and iteration renders (PNG/JPG under `scripts/geo/{circuits,forces,magnets}`, about 100 MB) are untracked in the acceptance commit and ignored from now on. They stay on disk. They are still in the Codex commit, so squash when merging to keep them out of main history.
