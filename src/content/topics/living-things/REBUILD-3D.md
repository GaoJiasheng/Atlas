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

## Polish 2026-11-03 — round 3: UVs, python/toad skin and fruit-bat coat

Installed from the topic generator. Both accepted renderer changes at `4a4af23`
remain untouched: vertex-coloured slots emit no self-light, and PartNode's material
cache depends on per-slot colour flags. No shared kit or engine file changed.

### Completed items

- **UV bake, all 28 sculptures:** preserve authored UVs in `modelGeometry`, author
  along-surface charts for custom lofts/tubes and botanical ribbons, carry charts
  through merged skin and two-sided faces, and export `TEXCOORD_0`. Missing custom
  topology receives separate dominant-plane charts; implicit limbs retain smooth
  normals. Native sweeps keep their arc-length/circumference charts. UV charts are
  recovered after position simplification and shifted by whole texture periods;
  the finish samplers' integral repeats keep the same texture phase. Bare bat
  membranes/eyes and bare python/toad eye details use nearly constant charts so
  coat/scales/grit do not cover them. The GLB still uses each specimen's existing
  single runtime material slot; the toad now selects the existing dry `abrasive`
  finish, with geometric warts carrying its larger relief.
- **Reticulated python (`Malayopython reticulatus`):** replace floating zigzag
  strips with pigmented, irregular dark reticulation around warm grey saddles,
  gold borders and pale lateral ocelli on the actual body surface. Colour-aware
  simplification retains pigment boundaries. A separate ventral chart gives the
  broad transverse belly scutes, with shallow geometric seams. Rebuilt tapered
  skull, joined neck, attached amber eyes/slit pupils, jaw crease and labial pits.
  The ventral tract fades before the raised nape, avoiding a pale scute band
  crossing the back of the head in the final top-view check.
  References: NParks' species identification; Mary-Ruth Low's Singapore specimen
  photographs in Biodiversity of Singapore; the development-only Getty close-up
  linked in SOURCES for skin/head comparison. Counts of generated surface details
  are reconstruction parameters, not new teaching facts.
- **Asian toad (`Duttaphrynus melanostictus`):** numerous irregular embedded skin
  tubercles with varied size/height and dark tips replace ten sparse oversized
  wart balls. Added paired elongated, curved parotoid glands; refined attached
  cranial crests and smoother eye rims. Dry fine finish covers head, trunk and
  limbs. Four front/five hind digits and folded limb joints are retained.
  References: NParks' Colleen Goh/Holly Siow photographs and species description;
  USGS species profile (black-tipped warts and prominent parotoids).
- **Lesser dog-faced fruit bat (`Cynopterus brachyotis`):** longer tapered canine
  muzzle and lower jaw/lip line, larger dark eyes, rounded cupped pale-rimmed ears,
  no nose leaf. Even short fur fins are sampled by actual surface area on the
  head, neck, trunk and upper limbs, with an ochre/reddish collar blended into
  brown coat. Existing pile finish supplies fine relief between fins. Preserved
  the membrane over four elongated fingers per wing, elbow/wrist joints, thumb
  claw, digit-II claw and five hind digits. References: NParks/Mendis Tan photo,
  NParks' collar description and the prior AntanO/flight references in SOURCES.

### Budget and preservation

| Asset / part | Before | After |
| --- | ---: | ---: |
| Python triangles | 6,384 | 30,016 |
| Asian toad triangles | 21,283 | 22,893 |
| Fruit bat triangles | 22,034 | 13,080 |
| All scene triangles, including native props/magnified cells | 295,887 | 227,351 |
| GLB triangles | 248,323 | 179,787 |
| GLB bytes | 1,410,936 | 1,489,796 |

The conservative all-parts count is below 300k without relying on chapter
visibility. Still 28 baked specimens, 51 part IDs in the same order and 57 geometry
pieces; sorting, chapter/beat references, presets, explode definitions, labels,
teaching numbers and EN/ZH prose are unchanged. Smooth-normal simplification uses
close-view error limits; priority skin/coat borders are protected. The UV streams
use the standard meshopt EXPONENTIAL filter, positions use a compact compensated
quantization grid, and no new runtime decoder or network resource is needed.
Final decoded bounds drive the existing sorting envelopes; post-quantization node
translations seat every specimen exactly on the 15 mm cell floor.

### Verification and preview reproduction

CPU previews inspect the actual installed, compressed/decoded geometry with
FrontSide culling, smooth normals and a z-buffer. `export-finish-maps.ts` calls the
runtime procedural texture generator through a minimal offline canvas adapter;
`render-preview.py --finishes` samples those exact albedo/normal/roughness maps.
The offline light is an approximation, not a browser/PBR or GPU performance claim.

- Final three-angle specimen sheets and case overview: `/tmp/atlas-living-round3/final/`.
- Priority finish close-ups: `/tmp/atlas-living-round3/finish/{bat-head,bat-coat,toad-head,python-belly}-angles.png`.
- UV checks: `/tmp/atlas-living-round3/checker/*-angles.png` (looked at body, head and limb charts).
- Geometry-only comparisons: `/tmp/atlas-living-round3/{before,geometry}/`.
- Exact finish fields and repeat metadata: `/tmp/atlas-living-round3/maps/`.

Reproduce: `pnpm tsx scripts/geo/living-things/build-parts.ts`, then
`export-finish-maps.ts`, `preview-baked.ts`, and
`python3 scripts/geo/living-things/render-preview.py --finishes --out /tmp/atlas-living-round3/final`.
`--checker` substitutes a chart checker; `--before` on the exporter uses the
optional preserved `/tmp/living-round3-before.{glb,json}` development baseline.

The loaded-asset regression checks now require finite, nonconstant UVs on every
specimen and nondegenerate sampled UV triangles; another check preserves exact
source UVs through translation and two-sided duplication. Budget, local bundled
runtime decoding, anatomy/counts, cell floors/envelopes and the legacy bird API
remain covered. Final gate results are recorded below.

Not done: browser/GPU rendering or interactive screenshot acceptance, as explicitly
prohibited by this task. No browser or desktop was opened. All requested model
and UV work is installed for the following browser acceptance.

Final round-3 gates (rerun after the nape correction):

- `pnpm check`: green, 0 errors / 0 warnings (4 existing hints).
- `pnpm validate`: green, 94 topics / 0 errors / 0 warnings.
- `pnpm test`: green, 252 files / 6,350 tests; includes the actual bundled
  GLTFLoader/meshopt decoding, UV, byte/triangle, anatomy and floor/envelope checks.
- `pnpm build`: green, 191 pages. Installed and built GLBs are byte-identical:
  SHA-256 `6769208ab07896faf9ee93a8f10a8092263301db1f1a7e3c1082c51d4cbfee78`.
- `count-staged.ts`: green, 227,351 triangles / 57 pieces, all parts before visibility.
- `validate-staged.ts --baseline /tmp/living-round3-before.json`: green; 51
  identical IDs/order, sorting/presets unchanged, every decoded mesh fits its
  floor/envelope/cell.
- `git diff --check`: green. No git writes, package/lockfile changes, browser or
  desktop use. The pre-existing untracked `mesh-support.patch` was left alone.

Final close-view iteration removed a pale ventral patch from the raised python
nape; its broad belly scutes remain below the body. The final installed GLB is
**1,489,796 bytes** with the unchanged final triangle totals in the table above.

### Browser acceptance 2026-11-03 (Claude)

Same-angle GPU close-ups of python, toad and bat (paper + cinema) against `4a4af23`.
Two small corrections, rebuilt with `build-parts.ts` (still 179,787 GLB triangles):

- Toad parotoid glands: blunter kidney ends, sunk 0.9 mm into the skin and darker,
  so they read as raised glands behind the eye rather than a pale ear-like flap.
- Fruit bat coat: `#6f614b` → `#6b5442`; the olive head no longer clashes with the
  warm collar and body.

Final GLB: **1,489,956 bytes**.


## Fix 2026-11-04

Both browser-acceptance leftovers are installed in the live generated asset.
The existing **Polish 2026-11-03** record above remains the baseline; this is the
requested follow-up, preserving the accepted round-3 coat colours and runtime
finish samplers.

- **Lesser dog-faced fruit bat (`fruit-bat`)**: rebuilt the cranial/muzzle loft
  with a broad rounded crown and cheeks, a much shorter nasal bridge, high
  forward-facing almond corneas fitted to the actual cranial surface, closed
  curved lips and a separate bilobed upper-lip continuation with a median
  cleft. The broad sculpted rhinarium includes recessed paired nares and
  flared margins. Pinnae now have continuous oval conchal cups and rounded
  pale rims. Repeated decoded-photo comparisons corrected the first pass's
  too-lateral eyes, excessive nose width, eye-footprint misses, steep eye
  slant and weak upper-lip split; lip seams were seated on the actual surface.
  References actually viewed: [AntanO frontal face](https://commons.wikimedia.org/wiki/File:Cynopterus_brachyotis_(Lesser_short-nosed_fruit_bat).jpg)
  (CC BY-SA 4.0), [AntanO three-quarter close-up](https://commons.wikimedia.org/wiki/File:Close-up_of_Cynopterus_brachyotis_(Lesser_short-nosed_fruit_bat).JPG)
  (CC BY-SA 3.0), and [Philippine Government flight photo](https://commons.wikimedia.org/wiki/File:Cynopterus_brachyotis,_Philippines_2.jpg)
  (Commons: PD-PhilippinesGov). Photo metadata/licences and modelling purposes
  are also in `data/SOURCES.md`. Photos remain development-only references;
  no photo or downloaded mesh is included in the site.
- **Asian toad (`asian-toad`)**: removed the detached wart caps, legacy crest
  sweeps and separate gland shells. Warts, cranial crests and curved paired
  parotoids are now displacement of the underlying dermis. Compact cubic
  supports go to zero height and zero slope at their bases; normals derive
  from that same deformed skin. There is therefore no separate surface edge
  to hover or cast a seam. Existing limb skin receives integrated small
  relief too. Brown/black skin colours and physical 12 mm finish charts stay.
  Species basis remains NParks Common Asian Toad (S6); no new teaching claim.
  Authored geometry fell from 71,545 to 65,193 triangles, allocating detail
  to continuous skin instead of overlapping caps.

### Loaded counts and preservation

Counts include the installed meshopt-decoded meshes, all native geometry and
instances, every part before visibility (including microscopy and all pads).

| Geometry | Before this fix | Installed after |
| --- | ---: | ---: |
| Fruit bat | 13,080 | 16,088 |
| Asian toad | 22,893 | 20,861 |
| Whole topic | 227,351 | 228,327 |
| Geometry pieces / draw batches | 57 | 57 |
| GLB bytes | 1,489,956 | 1,448,636 |

`audit-face-fix.ts /tmp/living-fix-before.glb` confirms only those two decoded
meshes changed: the other 26 meshes have byte-identical positions, normals,
colours, UVs, indices and world transforms. Every topic-data field except the
bat/toad derived envelopes is identical to the baseline. All 51 IDs/order,
chapter/beat references, labels, teaching counts, sorting, presets, explode
behaviour and material assignments remain. **No EN/ZH text changes were needed.**
No engine, shared kit, runtime finish, package or lockfile edits were made.

### Offline visual verification

Actually inspected the decoded final full bat, frontal/three-quarter/profile
face, toad head and near-horizontal toad sheets, using FrontSide culling,
smooth normals, a depth buffer and the round-3 runtime finish maps. The final
preview candidate is byte-identical to the installed GLB. Earlier iteration
sheets and photo comparisons are retained beside the final directory.

- `/tmp/atlas-living-fix-2026-11-04/final/bat-face-angles.png`
- `/tmp/atlas-living-fix-2026-11-04/final/bat-reference-front.png`
- `/tmp/atlas-living-fix-2026-11-04/final/bat-reference-three-quarter.png`
- `/tmp/atlas-living-fix-2026-11-04/final/fruit-bat-angles.png`
- `/tmp/atlas-living-fix-2026-11-04/final/toad-head-angles.png`
- `/tmp/atlas-living-fix-2026-11-04/final/toad-grazing-angles.png`

Face views are frontal (elevation 28°), three-quarter (azimuth 40°, elevation
25°) and profile (90°, 12°). The three-quarter reference is roll-aligned −15°;
photo pose/cropping differ, so these are visual comparisons, not a metric scan
registration. Grazing toad views use elevations 3°, 3° and 6°. The jagged lower
edge in the isolated head crop is the inspection crop, not an open skin seam.

Reproduce with `build-parts.ts`, `preview-baked.ts fruit-bat asian-toad`, then
`python3 scripts/geo/living-things/render-preview.py --finishes --out /tmp/atlas-living-fix-2026-11-04/final`
and `compare-bat-reference.py` (reference directory option `--refs`).
`export-finish-maps.ts` supplies the unchanged round-3 map samples if needed.
New regressions verify the torso/head have closed continuous skin topology,
unit normals, and zero-height/zero-slope wart bases.

Not done: browser/PBR/GPU and interactive screenshot acceptance, because this
task forbids opening or driving a browser/desktop. No browser or desktop was
opened; no GPU FPS claim is made. Both requested geometry fixes are complete
for the subsequent browser acceptance.

### Final gates

- `pnpm check`: green, 0 errors / 0 warnings (4 existing hints).
- `pnpm validate`: green, 94 topics / 0 errors / 0 warnings.
- `pnpm test`: green, **271 files / 6,502 tests**. Includes continuous toad
  topology/support checks and the existing runtime GLTFLoader/meshopt, UV,
  triangle/byte and sorting-envelope regressions.
- `pnpm build`: green, **191 pages**. Built GLB is byte-identical to the installed
  source; SHA-256 `17ef4f366eeab41386b5557587b06378561cf54c78e6d031706a5c18709736ce`.
- `count-staged.ts`: green, 228,327 triangles / 57 pieces before visibility.
- `validate-staged.ts --baseline /tmp/living-fix-before.json`: green, all floors,
  envelopes and case cells fit; IDs/order, sorting and presets unchanged.
- `audit-face-fix.ts /tmp/living-fix-before.glb`: green, exact preservation of
  all 26 other decoded meshes and every non-envelope topic-data field.
- `git diff --check`: green. No git writes, browser/desktop use, package or
  lockfile changes.

The worktree initially linked all dependencies to a read-only sibling checkout.
Local ignored cache directories and a byte-for-byte local copy of the existing
Drei dependency resolved Vite cache permissions and one unrelated solar-system
suite's deep-import resolution. No dependency versions or tracked configuration
changed. Final gate logs are in `/tmp/atlas-living-fix-2026-11-04/`.
