# Living things — 3D rebuild record

## Polish 2026-11-03

Status: **integrated in the live dataset**. The user authorized the generic renderer patch and flat `public/models/living-things.glb` installation in this continuation. Vertex colours are enabled only for a geometry's material slot when that slot has a `color` attribute; a mesh part's primitive rest envelope stays hidden while its local GLB loads. The final byte/triangle budgets and integration checks are recorded below. No browser or desktop was opened.

All shapes are original build-time code. Reference photos were downloaded and actually viewed; none is used as a texture or distributed. Full links, authors, licences and modelling purpose are in `data/SOURCES.md` under this date. Existing species sources support the other plants/animals. The reconstructions retain miniature teaching proportions and are not specimen measurements.

### Items and visual corrections

- **`javan-myna`**: Continuous breast/nape/head cross sections; arched two-part bill, iris/nostrils, cubic-surface-fitted folded vanes (9 exposed + reduced tenth primary, 6 secondaries + 3 tertials), 12 graduated rectrices, crest, scutellate tarsi, 3 forward toes + opposing hallux and curved claws on each foot. The previous living-things generator already contained halluces; the review described an older build. Reference: JJ Harrison / Herbertkikoy photographs; NParks (SOURCES polish table).
- **`penguin`**: A gentoo-shaped continuous sculpt with independent lateral and fore/aft cross sections; surface-following white tracts/crown stripe with softly blended boundaries, paired mandibles and gape, stiff cambered flippers, graduated tail, three web-support toes plus reduced hind digit, scales and claws. No lathe body or cone bill. Reference: Ethmostigmus / Christopher Michel gentoo photographs.
- **`fruit-bat`**: Dog-like continuous cranial/muzzle loft, cupped pale-edged ears, fitted eyes/nostrils, narrowed abdomen and broader shoulders, short directional fur. Elbow/radius/wrist and four slender skin-covered finger chains support cambered interdigital, arm and flank membranes; hooked thumb and digit-II claws, five hind digits and free short tail. Reference: AntanO close-ups; Nick Baker NParks flight photograph; NParks species page.
- **`birds-nest-fern`**: Broad, curved, cupped strap fronds with quieter wavy edges, dark midribs, two sorus-bearing undersides and an uneven bark host. Frond length/width/arch and azimuth vary. Reference: Forest & Kim Starr / Marcin Konsek photographs; existing NParks sources.
- **`staghorn-fern`**: Species-correct erect crown shields and pendulous, repeatedly bifurcating linear fronds. Continuous rounded Y crotches replace disconnected angular strips; smooth independent front/back shell normals remove origami shading; irregular bark margins/fissures. Reference: Bernard DUPONT photograph; NParks Platycerium coronarium (S51).
- **`ixora`**: Creased leaves, attached pedicels and dense clusters of four individually cupped petals per flower replace coloured domes and star sheets. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`chilli-seedling`**: Curved cotyledons/true leaves with midrib crease, fine veins and varied attitude. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`rhu-sapling`**: Irregular branch hierarchy, fine jointed drooping branchlets and three woody scaly fruit clusters replace uniform spokes. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`moss`**: Five irregular anchored cushions carry dense, varied tiny leafy rosettes and fine anchoring threads rather than smooth green ellipsoids. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`mushroom`**: Sculpted uneven cap, fibrous bent stipe and fine annulus; 26 tapered primary lamellae plus shorter intercalated lamellulae replace 26 boxes. Upper-cap winding corrected after FrontSide QA. Reference: Accuruss Agaricus underside; Spencer Wimmer gill photograph.
- **`bracket-fungus`**: Irregular bark and broken end grain; four connected, curved shelves with concentric growth zones and fine edges. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`mouldy-bread`**: Crumb pores and crust, irregular colony margins, fine hyphae and small spore-bearing heads replace fuzzy ellipsoids. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`yeast`**: Individual seated dry granules with size/orientation variation and small grains between the original 16 large grains. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`bacteria-dish`**: 13 smooth low colonies with varied radii and slight ellipticity; retains procedural glass lid/walls and transparent material so colonies remain visible. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`grasshopper`**: Smooth visible body sections; segmented joint details, two rows of hind-tibial spines and finer appendage detail. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`beetle`**: Smoothed body, longitudinal elytral detail and joint/appendage refinements. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`spider`**: Eight small eyes in two rows, exposed pedicel, chelicerae/fangs, enlarged knee joints and short varied setae. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`plantain-squirrel`**: Cream/black flank stripes, russet belly and eye rings; short body fur, bushy directional tail hairs, connected ankle/shanks and individual 4/5 digits with claws. Reference: NParks Callosciurus notatus.
- **`pangolin`**: Staggered imbricate keratin scales with raised keels and varied dimensions, long curved digging claws and jaw seam. Reference: NParks Manis javanica.
- **`dolphin`**: Cambered curved dorsal/pectoral/fluke surfaces replace extruded sheets; preserves original hump, blowhole and horizontal fluke. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`snakehead`**: Cambered fins with fine rays, operculum and mouth detail; smoothed body sections. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`guppy`**: Curved large caudal membrane with rays, operculum and mouth detail. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`mudskipper`**: Cambered fin membranes, fleshy supports and mouth/operculum detail. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`shark`**: Curved fin surfaces retain unequal tail lobes and five gill slits per side. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`tree-frog`**: Four surface-fitted stripes; four fingers and five hind toes with terminal pads and partial webbing; broad gold irises/horizontal pupils, lids, tympana and jaw/nostrils. Folded hind legs use implicit blended surfaces to avoid sweep self-intersections; hidden faces wholly inside torso are omitted. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`asian-toad`**: Four fingers/five toes without disc pads, varied warts, parotoids/ridges, gold irises/horizontal pupils and jaw details. Folded hind legs use smooth implicit joints with buried internal faces removed. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`house-gecko`**: Five digits on each foot, expanded distal pads, divided underside lamellae and claws; fitted gold irises/vertical pupils and lids, subtle skin mottling and smooth fore/hind limbs. Reference: EcologyAsia underside photograph / HKU Hemidactylus description.
- **`python`**: Continuous surface-projected reticulated dorsal pattern and jaw seam; smooth coiled body. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`hawksbill-turtle`**: Contiguous 5 vertebral/4 paired costal/22 marginal scute partition over a closed scalloped carapace, four prefrontal scales, tapered hooked mandible and curved flippers. Reference: NOAA hawksbill reference; existing species sources.
- **`yeast-cells`**: Adaptive smooth cell sampling; original positions, buds, magnification and teaching scale retained. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.
- **`bacteria-cells`**: Adaptive rounded microbe sampling; original positions, rod/coccus counts and teaching scale retained. Reference: existing NParks/species descriptions in data/SOURCES.md and the reference photograph review.

Close-up iteration corrected raised/floating myna wing vanes, overlarge bills/irises, detached squirrel feet, buried/disconnected frog/python markings, inward toe/cap normals, origami frond normals, sharp Y junctions, floating florets, opaque glass, shell seams and folded-knee self-intersections. Coincident cap-pole and periodic-seam normals are averaged before shelling to remove radial lighting creases. Final previews use outward FrontSide culling, smooth vertex normals, max(dot(N,L),0) lighting and a z-buffer. Final compressed/decoded geometry was re-exported for inspection; these are CPU geometry checks, not PBR/browser/GPU or interaction acceptance.

### Facts, API and behaviour

- 51 part IDs/order (47 selectable + 4 context), group assignments, sorting feature table, counts, chapter/beat references, cameras, explode directions/distances and scale/magnification are retained. Decoded-model validation compares sorting data/presets to the original and checks every decoded mesh against its sorting envelope and case bounds.
- `buildBird()` and `BirdOptions` are unchanged. Its default JSON SHA-256 remains `8e2960eed6432881aff0fe7c34fde26b6c852d5a527eb2b95b91e106c5642d2d`; existing fossils realism tests pass. New `buildBirdSculpture()` is opt-in and supplies this topic's two birds.
- Three minimal EN/ZH detail corrections: staghorn fronds now hang beneath crown shields; bat text describes membrane over jointed fingers rather than line-drawn bones; penguin text identifies the gentoo visual reconstruction. Names and classification labels are unchanged.
- Baked static details use one vertex-coloured mesh per specimen, retaining seeded variation without per-detail draws. The culture dish keeps its existing glass materials. Each baked specimen uses a suitable existing finish (feathers, fabric, scales, enamel or tissue). Per-feature roughness/gloss is not encoded in the current single-material mesh path.
- Cutaway/explode/selection/sorting remain at the original whole-specimen part granularity. No engine animations, chapter state, framing or UI files were changed. Runtime interaction/PBR acceptance awaits the subsequent browser acceptance required by the brief; no browser/desktop was opened.

### Triangle counts

Counts use decoded GLB indices for loaded sculptures and the renderer's `partPieces()` for native parts, with instances included. This is conservative: **all parts before visibility**, including both microscopy groups and every sorting pad.

| Part | Before | Integrated after |
| --- | ---: | ---: |
| `toy-car` | 1,944 | 1,944 |
| `pebble` | 288 | 1,152 |
| `plastic-flower` | 3,200 | 3,584 |
| `ixora` | 8,424 | 8,146 |
| `chilli-seedling` | 1,988 | 3,560 |
| `rhu-sapling` | 8,854 | 6,808 |
| `birds-nest-fern` | 15,768 | 11,854 |
| `staghorn-fern` | 1,236 | 11,114 |
| `moss` | 1,728 | 11,962 |
| `mushroom` | 16,392 | 5,780 |
| `bracket-fungus` | 864 | 4,510 |
| `mouldy-bread` | 2,572 | 4,356 |
| `yeast` | 2,832 | 6,568 |
| `bacteria-dish` | 2,664 | 6,592 |
| `grasshopper` | 11,448 | 9,736 |
| `beetle` | 6,960 | 6,436 |
| `spider` | 4,776 | 8,306 |
| `javan-myna` | 5,748 | 15,688 |
| `penguin` | 1,936 | 8,992 |
| `plantain-squirrel` | 3,936 | 9,092 |
| `fruit-bat` | 11,048 | 22,034 |
| `dolphin` | 2,312 | 4,018 |
| `pangolin` | 3,376 | 8,756 |
| `snakehead` | 1,848 | 6,076 |
| `guppy` | 2,008 | 4,378 |
| `mudskipper` | 2,828 | 5,034 |
| `shark` | 7,300 | 5,040 |
| `tree-frog` | 7,120 | 17,194 |
| `asian-toad` | 5,184 | 21,283 |
| `house-gecko` | 5,110 | 10,036 |
| `python` | 4,656 | 6,384 |
| `hawksbill-turtle` | 4,256 | 5,182 |
| `yeast-cells` | 4,224 | 10,016 |
| `bacteria-cells` | 4,080 | 9,440 |
| `microscope` | 3,412 | 3,412 |
| **Whole topic** | **183,744** | **295,887** |

Before: 96 material/line calls. Integrated: 57 geometry pieces/draw batches before visibility. No FPS claim: no browser or GPU measurement was performed. The final GLB is **1,410,936 bytes** (1.411 MB / 1.346 MiB), down from the prepared 2,292,804-byte candidate. Weld + border-locked simplification targets ratio 0.50 with error bounded to 0.0004 of each mesh radius, followed by 15-bit positions, filtered 8-bit normals and 8-bit colours using required meshopt compression. The simplified vertices are reseated on their original cell floors before quantization. This retains all anatomical features and original sampled borders. The new bird cross sections use 40–48 circumferential samples, other small bodies use adaptive 16–32 sampling, limbs 16–24, and fine wires/veins/hairs generally 4–10. Hidden limb triangles fully inside the closed torso are omitted. All-parts counting is below the 300,000-triangle ceiling, before hiding microscopy groups or inactive sorting pads.

### Verification and previews

Final gate results are recorded in the continuation section below. Decoded checks confirm 51 identical part IDs/order, unchanged sorting/presets, and every loaded mesh inside its case/floor/simulation envelope. Native parts use the renderer's conservative bounds when fitting; this prevents the rotated pebble's theoretical box exceeding its cell even when the sampled surface fits.

Final decoded close-ups: `/tmp/atlas-living-polish/{javan-myna,penguin,fruit-bat,myna-feet,penguin-feet,bat-head,birds-nest-fern,staghorn-fern,mushroom,mushroom-gills,tree-frog,house-gecko}-angles.png` (three angles each). Every baked specimen also has a three-angle sheet in that directory, plus `case-overview-angles.png`. Additional authored surface previews: `/tmp/atlas-living-botanical/*-angles.png` and `/tmp/atlas-living-animal-details/*-angles.png`. Reference contact sheet: `/tmp/living-refs/contact-sheet.jpg`. Final previews inspect installed, compressed/decoded geometry with outward FrontSide culling, smooth vertex normals and a z-buffer; they are CPU geometry checks, not PBR/browser/GPU or interaction acceptance.

Reproduce the installed assets with `pnpm tsx scripts/geo/living-things/build-parts.ts`, then `count-staged.ts`, `validate-staged.ts`, `preview-baked.ts` and `python3 scripts/geo/living-things/render-preview.py`. The three checking/export scripts default to the live assets; `--staging` checks the optional `/tmp/atlas-living-polish/` candidate instead. To compare to the original, preserve its parts as `/tmp/living-before.json` and pass `--baseline /tmp/living-before.json` to the validator. `preview.ts` inspects raw authored surfaces.

## Polish 2026-11-03 — authorized integration

- Applied the prepared patch to `PartNode.tsx` and `shapes.ts`, with a small exported material factory so unit tests exercise the same per-slot code used by the component. The material cache updates when geometry changes; ordinary slots keep vertex colours disabled. The source patch file records the final applied diff.
- Installed the original procedural 28-specimen GLB and regenerated live `data/parts.json`; transparent culture-dish glass stays on the native path. The source record and GLB embed Atlas attribution and the repository's MIT code licence. No third-party mesh, scan, texture or external buffer is included.
- Reduced the prepared **339,529 → 295,887 triangles** and **2,292,804 → 1,410,936 bytes** without changing part IDs, anatomy/counts, chapters/beats, presets, sorting data, magnification or explode definitions. The shipped pre-polish baseline was **183,744 triangles**. Per-part before/after counts are in the table above. There are no further EN/ZH text changes in this continuation beyond the three preparation corrections listed above.
- Added runtime-loader tests with the bundled Three meshopt decoder: all 28 named meshes load with normals/colours, no external resources, correct floors/envelopes, ≤ 1.5 MB and ≤ 300k triangles including native pieces. Added per-slot colour/loading-envelope unit tests and an audit proving every other shipped topic has neither coloured GLB attributes nor mesh/primitive hybrids, so both changed renderer paths leave those topics unchanged. The legacy `buildBird()` hash remains unchanged.
- Inspected decoded multi-angle/close-up previews after budget changes and compared the priority bird/bat/frond/gill forms with the prepared versions. Corrected the simplified floor seating and native pebble envelope rather than weakening fit assertions.

Gate results (installed dataset and renderer):

- `pnpm check`: green, 0 errors / 0 warnings (5 existing hints).
- `pnpm validate`: green, 94 topics / 0 errors / 0 warnings.
- `pnpm test`: green, 252 files / 6,348 tests. An earlier concurrent run hit an unrelated catalogue-search p95 timing threshold; the unchanged test passed in the final full rerun after the build/extra suite completed.
- `pnpm exec vitest run tests/space-scene`: green, 113 files / 2,886 tests, including every other SpaceScene topic, renderer colour/envelope tests and local-decoder/budget checks.
- `pnpm build`: green, 191 pages. `dist/models/living-things.glb` is byte-identical to the installed source asset (SHA-256 `ecd06745e76897aef82706985fdef978bfdaf6e37c9c29a4a9f092e1a5b224c2`).
- `count-staged.ts`: green, 295,887 triangles / 57 pieces, all parts before visibility.
- `validate-staged.ts --baseline /tmp/living-before.json`: green, 51 identical part IDs/order, sorting/presets identical, all decoded mesh floors/envelopes/cells fit.
- `git diff --check`: green. No git writes, package changes, browser or desktop use.

Not done: browser/PBR and interactive screenshot acceptance, because this task explicitly prohibits launching Chromium or driving the browser/desktop. No GPU FPS or browser visual acceptance is claimed. All authorized integration work is installed for the subsequent Claude browser acceptance.

## Browser acceptance 2026-11-03 (Claude)

- First browser render showed every vertex-coloured specimen with a `tissue` finish washed out (pale ixora, moss, ferns, toad, spider): the family's 0.14 self-light was emitted in the slot's white look colour. `stylePartMaterial` now gives a vertex-coloured slot no self-light; ordinary slots are unchanged (unit test in `tests/space-scene/mesh-colors.test.ts`).
- `PartNode` builds its slot materials keyed on the per-slot colour flags instead of the shape object, so a new shape object (fill geometry, scene rebuild) no longer recreates materials for any topic.
- aircon, heart-and-lungs and steam-engine: first three chapters pixel-identical to the base commit (same camera, HUD off).
- `scripts/geo/living-things/mesh-support.patch` is a stale working note and is not committed.
