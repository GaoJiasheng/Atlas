# Rebuild 2026-11-05 — forces secondary hardware

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
