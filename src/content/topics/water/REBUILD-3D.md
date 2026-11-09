# Water scenery — 3D rebuild evidence

## Rebuild 2026-11-05

Scope: scenery only. Existing part IDs, 42-part inventory, chapter/beat references, teaching numbers, flows, animations and camera presets are preserved. The original 27 forest crowns, 12 city buildings, 12 HDB storeys, two roof tanks, nine crest gates and seven pump outfalls are retained as counts. No engine, widget, camera, framing or shared-kit edits. No browser, desktop, Chromium, git writes or runtime network. Reference gathering and comparison-sheet assembly were delegated according to the atlas-space-topic build-order skill; geometry and acceptance review remained in this worktree.

The topic previously had no REVIEW.md, FIXES.md or REBUILD-3D.md. The source review is docs/68-3d-realism/review-body-earth-space.md (water, grade C).

### Method and lighting evidence

Original build-time meshes: `scripts/geo/water/scenery.ts`; deterministic bake: `pnpm tsx scripts/geo/water/build.ts`; delivered model: `public/models/water.glb`. All surfaces are original code, MIT under repository LICENSE. No third-party mesh or photograph texture is embedded. Colours derive from Technical Plate tokens, with linear-space shading variation.

Offline renderer: `scripts/geo/water/preview.ts` decodes the **actual compressed shipped GLB**, applies node transforms, vertex colours and the source-material `atlasSurface` contract that GltfSource.tsx uses. It reuses the fossils studio CPU renderer: same three direct-light directions/colours/intensities, hemisphere, sampled installed RoomEnvironment, exposure 1.05 paper / 1.0 cinema and Three ACES matrices, followed by sRGB conversion. The preview verifies direct-light directions/colours/intensities, hemisphere, environment and exposure values against Lighting.tsx. It is a numerical lighting match, not GPU pixel identity; cubeUV filtering and shadow sampling remain GPU acceptance work. New scenery does not cast self shadows, matching its authored castShadow=false.

Preview commands: `pnpm tsx scripts/geo/water/preview.ts delivery`; `pnpm tsx scripts/geo/water/compare.ts delivery`. Baseline uses `preview.ts baseline --baseline`. The final sheets contain front, three-quarter, profile and characteristic detail, with a separate four-view urban-tree sheet and plumbing / gate-pose close-ups. Source photos and exact authors/licences are in `scripts/geo/water/reference-manifest.json`. Photos remain in gitignored refs; comparisons are development evidence only. **The sheets explicitly label closest available angles; they are not calibrated photo registrations.** Generic cloud/tree specimens have no unique matching pose. Building photos are architectural references, not a claim that the schematic reproduces a surveyed named block.

### Two visual reviews and corrections

1. Look 1: inspected `round1-review.jpg`, all seven per-family four-view sheets, and enlarged cloud / forest / HDB details against the real references. Found granular clouds, pale sparse crowns, several roots above the terrain, narrow point towers resembling slabs, an unglazed grass-roof ring, and over-tall barrage piers. Changed: reduced cloud surface noise; darkened and enlarged foliage; raycast-seated roots; added stepped point-block wings; added curved glazing, solar array and canopy; changed HDB gallery comparison camera to the photographed side. Reduced bevel and tube over-tessellation. Round 1 was an internal over-budget candidate, never the final asset.

2. Look 2: inspected `round2-review.jpg`, all seven four-view sheets and enlarged corridor / gate / roof views. The forest still read as open parkland, the exposed terrain read as separate domes, and barrage structure stood too far above the gate leaves. Changed: restored all 27 forest positions; raised and varied tree heights so crowns overlap; replaced hill primitives with continuous warped terrain; lowered piers and maintenance deck onto the real gate hinge/foundation; strengthened distinct cloud lobes; removed subpixel city mullions and simplified hidden subdivisions. Re-encoded normals/positions without changing the authored silhouette.

Final look: see final four-view sheets and whole-scene paper/cinema studies in `scripts/geo/water/comparisons/`. Final observed corrections: grounded roots; all leaf petioles placed on their supporting curved twigs; point-block glazing recessed behind wing piers/spandrels; seven real recessed annex vent bays; small pitched service-pavilion roofs above the barrage piers. Both whole-scene paper/cinema previews were inspected. No bald texture patches are possible because the new scenery uses vertex tones and geometry, without texture seams. Dark-plate foliage remains olive rather than luminous lime. Clouds have a flat lower boundary and unequal lobes; the rain bank remains a low stratiform schematic rather than a towering cumulonimbus. Gate foundation depth is below the reservoir water surface and visible only in isolated engineering studies.

### Per-part self-review (docs/68: A credible; B needs detail; C crude)

Grades evaluate a schematic technical-plate diorama at its declared scale. They are self-review, not GPU acceptance.

| Part | Before triangles | After triangles | Self-grade | Changes |
|---|---:|---:|---|---|
| `cumulus` | 26,784 | 14,350 | A | Continuous smooth-normal condensation body: unequal blended turrets, smaller cauliflower lobes and an approximately horizontal base. Vertex tones provide volume under the actual ACES studio rig; no component spheres survive the bake. |
| `rain-cloud` | 44,640 | 22,730 | A | Broad stratiform / stratocumulus rain bank with a coherent low base, unequal upper lobes and darker underside. Existing rain particles remain the rain shaft; the cloud-drift, storm and dry-spell transforms remain available. |
| `forest-hill` | 81,852 | 88,604 | B | 27 individually seeded tropical trees, with flared roots seated by raycast onto a continuous undulating terrain mesh, bent tapered trunks, connected branch orders, and irregular overlapping leaf sprays. Original shoreline footprint retained. Crown height and branching differ per tree. Channels follow the actual baked runoff samples so the original particles stay above the terrain. |
| `city-blocks` | 7,056 | 60,730 | B | 12 buildings retained: mixed slab blocks and point blocks, with open ground floors, recessed glazing, common galleries on slabs, stepped corner wings and a central core on point blocks. Four unequal urban trees use the spreading branching habit of the rain-tree references, with generic broadleaf sprays. |
| `hdb-block` | 900 | 15,300 | A | Twelve storeys including open ground-level void deck, actual pilotis, continuous recessed common galleries, a lift/stair core, window openings with reveals, sills and 3D mullions. A real rectangular kitchen opening subtracts floors and walls around the unchanged tap, sink and sewer connection; both end walls have recessed windows. |
| `roof-tank` | 10,968 | 2,025 | A | Two separately capped roof tanks with projecting support bases, panel joints, access lids, preserved riser / downfeed endpoints. Seated supports on the roof; original supply and downfeed endpoints join actual tank bodies through curved connectors. Reduced invisible engine-default sweep subdivisions after baking. |
| `barrage` | 6,600 | 4,512 | A | Low, long foundation with ten short-nosed piers, thin maintenance crossing, continuous rails and supported posts. Gates are supported at the foundation surface, not hovering between tall columns. |
| `crest-gates` | 108 | 2,016 | A | Exactly nine broad, low steel leaves: 6:1 span-to-height, real bottom hinge barrels, stiffening ribs and top edges. Corrected the old centered-repeat offset. All nine leaves tip seaward around their aligned bottom hinge using the existing 70-degree gates-open pose. |
| `pump-house` | 2,520 | 8,643 | A | Compressed but recognisable low curved grass roof around an open courtyard, curved glazing, structural mullions, roof ramp, solar array and mast-supported canopy, plus exactly seven connected outfalls with open annular mouths and inner walls. Not a surveyed replica; footprint is adapted to the existing schematic slice. |
| `drains` (tessellation only) | 49,124 | 5,360 | A | Original U sections, paths, radius, material, endpoints and flow preserved; remove redundant longitudinal rings from straight runs. |

### References, inspected before and during modelling

Each hero uses 2–4 photographs. Cloud photos cover both cloud parts; tree photos cover forest and urban trees; the HDB set covers slab/point blocks and roof context; the barrage set covers dam/gates/building. No image is used as a runtime decal.

**clouds**
- [Cumulus humilis - 39.jpg](https://commons.wikimedia.org/wiki/File:Cumulus_humilis_-_39.jpg) — William Crochot (Medium69), CC BY-SA 4.0. Low cumulus humilis beneath altostratus; coherent grey flat underside and broken unequal lobes.
- [Cumulus clouds panorama.jpg](https://commons.wikimedia.org/wiki/File:Cumulus_clouds_panorama.jpg) — Fir0002, GFDL 1.2. Daylight cumulus field; broad irregular banks with unequal towers and aligned bases.
- [Cumulonimbus cloud.jpg](https://commons.wikimedia.org/wiki/File:Cumulonimbus_cloud.jpg) — Bidgee, CC BY 3.0. Towering cumulonimbus calvus with sharply resolved cauliflower turrets above a darker common base.

**trees**
- [Rain Tree Faber Estate, Singapore.jpg](https://commons.wikimedia.org/wiki/File:Rain_Tree_Faber_Estate%2C_Singapore.jpg) — Red Eyes Black Dragon 92, CC BY-SA 4.0. Mature Singapore rain tree; buttressed lower trunk forks into several heavy unequal limbs with fine airy canopy.
- [Another Rain Tree Faber Estate, Singapore.jpg](https://commons.wikimedia.org/wiki/File:Another_Rain_Tree_Faber_Estate%2C_Singapore.jpg) — Red Eyes Black Dragon 92, CC BY-SA 4.0. Singapore rain tree close-up from below; coarse limbs curve laterally and branch irregularly into a broad umbrella crown.
- [Forest path, Bukit Timah Nature Reserve, Singapore 02.jpg](https://commons.wikimedia.org/wiki/File:Forest_path%2C_Bukit_Timah_Nature_Reserve%2C_Singapore_02.jpg) — Fry72 (Karel Frydrýšek), CC BY-SA 4.0. Bukit Timah rainforest path with tall irregular trunks, layered small foliage and climbing vegetation.

**hdb**
- [7-storey slab blocks.jpg](https://commons.wikimedia.org/wiki/File:7-storey_slab_blocks.jpg) — Littlemisshy at English Wikipedia, GFDL / CC BY-SA 4.0. Seven-storey Singapore HDB slab block; deep access corridors, repeated parapets, open stair at end and narrow ground-floor columns.
- [ViewOfHDB home (Faber Point,Henderson Waves,Singapore).jpg](https://commons.wikimedia.org/wiki/File:ViewOfHDB_home_%28Faber_Point%2CHenderson_Waves%2CSingapore%29.jpg) — Weikaiwoo, CC BY-SA 4.0. Singapore HDB estate seen from Faber Point; multiple slab and taller tower blocks embedded among trees.
- [HDB Void Deck at 497 Tampines St 45, Singapore 1.jpg](https://commons.wikimedia.org/wiki/File:HDB_Void_Deck_at_497_Tampines_St_45%2C_Singapore_1.jpg) — Yuqiao, CC BY 4.0. HDB void deck at 497 Tampines Street 45; open structural bays, substantial rectangular columns, beams and seating.
- [Marine Parade Housing Estate, Typical point block, Dec 05.JPG](https://commons.wikimedia.org/wiki/File:Marine_Parade_Housing_Estate%2C_Typical_point_block%2C_Dec_05.JPG) — User:Sengkang, Copyrighted free use. Typical Marine Parade HDB point block; tall narrow mass, stepped wings/recessed core, window bands wrapping corners.

**barrage**
- [Main Bldg.jpg](https://commons.wikimedia.org/wiki/File:Main_Bldg.jpg) — yuumin, CC BY-SA 3.0 / GFDL. Marina Barrage low long waterfront building with horizontal dark glazing and roof plant.
- [Marina Barrage Dam 11Jul2026 01.jpg](https://commons.wikimedia.org/wiki/File:Marina_Barrage_Dam_11Jul2026_01.jpg) — RFNirmala, CC BY 4.0. Marina Barrage gate bridge: low continuous steel crest-gate panels separated by short light-coloured piers.
- [Marina Barrage Closeup 300522.jpg](https://commons.wikimedia.org/wiki/File:Marina_Barrage_Closeup_300522.jpg) — Bob Tan, CC BY-SA 4.0. Marina Barrage from above; oval/C-shaped green roof around courtyard, curved glass facade, thin low barrage with white piers.
- [Marina Barrage Open Field 300522.jpg](https://commons.wikimedia.org/wiki/File:Marina_Barrage_Open_Field_300522.jpg) — Bob Tan, CC BY-SA 4.0. Marina Barrage lawn roof, oval courtyard, curving access ramp, rear solar panels and white sail canopy.

### Performance and behaviour

| Metric | Before | After |
|---|---:|---:|
| Full topic, all parts on screen | 354,548 triangles | 348,266 triangles |
| Draw calls, estimated base geometry pass | 66 | 60 |
| Topic GLB | none (0 bytes; primitive geometry) | 1,460,284 bytes (1.460 MB) |

The four U-shaped drains retain their paths, radii, sections and materials; only longitudinal tessellation changes (49,124 → 5,360 triangles), freeing budget for branching and foliage.

Counts use actual engine partPieces for unchanged primitives and actual final mesh indices for replaced parts. Draw calls exclude flow draws, shadow/cutaway passes and HUD; no fabricated GPU FPS. Existing primitive baseline was already slightly over 350k triangles. Final topic stays below 350k. Compressed mesh normals are smooth on organic forms.

`tests/water-rebuild.test.ts` (three tests) verifies source counts/IDs, preserved flows/animations/views/teaching metadata, storm/dry-spell states, actual meshopt GLB decoding, normal and colour attributes, node-to-part binding, byte/triangle budgets, nine gate positions and a seaward lowering transform around the bottom hinge.

### Text changes

Only obsolete shape-description sentences were updated in both EN and ZH: forest round crowns, city plain blocks, HDB floor grid, shortened square gates, and box-shaped pump house. Existing factual values and citations remain. The note already declares a schematic slice, not to scale.

### Items deliberately not rebuilt / limitations

- Reservoir water, shoreline water surfaces, intake and NEWater/clarifier/RO equipment retained. The source review accepts these for this diorama (treatment equipment B); they are outside the requested scenery defects. Existing flows, treatment teaching counts and membrane animations remain intact. Reservoir boundary geometry is unchanged.
- Generic forest is a layered tropical catchment study, not species-by-species botanical reconstruction; urban trees follow rain-tree branching. Marina building footprint is compressed to fit the existing land parcel. These are declared schematic layout choices.
- Exact same-angle calibrated photo registration and GPU acceptance are not completed. Available reference angles are disclosed on every comparison sheet. Browser/desktop/Chromium use was explicitly prohibited; Claude GPU acceptance must check the actual scene, especially tree density, gate pose, dark-plate materials and cloud lobe shading.

### Gates

- `pnpm check`: PASS, zero errors / zero warnings (five existing hints outside water).
- `pnpm validate`: PASS, 94 topics, zero errors / warnings.
- Water decoded-asset, preserved-behaviour and production-material tests: PASS (3 tests).
- Full `pnpm test -- --testTimeout=60000`: 276 files / 6,526 tests PASS before the final attachment corrections; final rerun recorded below. The increased timeout accommodates existing CPU sculpture tests; tests are not skipped.
- `pnpm build`: first full production build PASS; final asset rebuild is recorded below.
- Browser/e2e/shoot/GPU checks deliberately not run: the user forbids Chromium and browser/desktop control. Claude GPU browser acceptance remains required.

The worktree originally shared node_modules via a symlink to the main checkout. Generated Vite/Astro caches were isolated under `/private/tmp/atlas-water-node-modules` to avoid writes to the main checkout. The same installed drei package was copied into that temporary dependency view (no source edits/version change) to resolve Vitest's shared-symlink subpath import; its dependency links still point at the installed package context.


### Resume verification — 2026-11-09

The previous round-3 self-review was too generous about the catchment. It still read as sparse parkland. This session inspected the actual sheets and compressed model again before continuing.

- **Resume look 1, round 3 vs real references:** exposed, repeated Y trunks and sparse angular leaf sprays did not reproduce a tropical canopy. Rebuilt connected branch orders with unequal fork heights, more overlapping terminal shoots, larger and denser unequal leaf sprays, smooth leaf normals, and blade-like buttresses instead of a radial rod fan. Tree and building counts remain unchanged.
- **Resume look 2, round 4/5 vs references:** canopy density improved, but the first candidate was over budget. Removed redundant subdivisions on the unchanged straight drains, used a smaller tonal palette and 11-bit positions, and retained curved silhouette normals. Recessed HDB end windows replace blank side walls; widened the profile evidence camera to retain the entire block. Darkened cloud undersides under the real ACES rig rather than judging flat colour.
- **Attachment audit, final build (round 12):** independent read-only audit identified a floor crossing the kitchen cutaway, runoff below the new terrain, disconnected roof plumbing / floating tank supports, and closed outfall collars. Subtracted the kitchen opening from every intersecting architectural box; carved to the renderer's own `bakeFlowPath` samples; connected both original roof pipe endpoints and seated pedestals; replaced outfall caps with annular inner-wall meshes overlapping open tubes. The all-part inventory, all flows and animation data remain intact.
- The preview now applies the parsed production pose representation (`poses[name].parts`) and the engine's affine transform helper. `gates-open-*` therefore shows the actual lowered leaves, rather than merely labelling a closed-gate image. Final assets and hash are in `comparisons/final-asset.json`.
- The regression suite exercises **the shipped bytes through Three GLTFLoader and `gltfSurface.style/fade`**, including vertex colours, physical metal/roughness, removal of family normal/roughness maps, both themes and opacity transitions. Rays through the actual HDB mesh verify that floors do not cross the kitchen opening. Full screen triangles are counted from decoded GLB indices plus unchanged engine primitives.

The current per-part grades and metrics above supersede the provisional round-3 values. The asset is an original procedural, schematic Singapore water-loop diorama. It is not a measured replica of a named estate or a species-level botanical collection. Photo angle differences remain explicitly labelled on the sheets; exact photographic registration and GPU acceptance remain outstanding. No browser or desktop was opened.

Final close-up pass also removed coincident facade polygons: floor edges stop inside the facade, and lower spandrels / window piers / upper spandrels partition each storey without coplanar overlap. This removes the horizontal strip interference seen in the earlier CPU close-ups. Individual buttress tips follow the actual terrain instead of a horizontal root plane. Tank pedestals embed into the roof to survive position quantization; urban roof-service enclosures sit on their slabs.

Independent audit measurements (see `comparisons/AUDIT-2026-11-09.md`): all original west/east runoff samples and the full ±0.007 spread clear the terrain by at least 0.0263 model units; all 25 kitchen rays are clear; all seven outfall bore rays enter the curved pipes. Final meshes remain within both budgets.

The last city close-up exposed a second coplanarity issue after 11-bit position quantization: point-block piers and band ends could collapse onto the same coordinate. Moving the piers inward creates a robust physical reveal; the reviewed `point-check-city-detail.png` has clean edges. `comparisons/evidence-provenance.json` hashes decoded mesh attributes, indices, material extras and node transforms: all eight other nodes are identical to the fully rendered predecessor, while city/urban-tree/whole-scene delivery views are regenerated from the final asset. Pedestal overlap measured on decoded geometry is 0.000838 model units. No engine changes were needed.

Roof detail look 1 showed that the former tank joint bars sat mostly inside the body and still read as plain casings. Final look 2 uses outward moulded sectional panel relief, exposed grid seams and corner frames, while both tank bodies, lids, support bases and pipe connections keep their existing locations. The added relief costs 339 triangles after simplification; the complete topic remains below 350k and the GLB below 1.5 MB. The predecessor's eight other mesh nodes are bit-identical after decoding; the affected HDB/roof/whole-scene views are refreshed from the final file. Both evidence-provenance JSON stages are retained.

### Final grade qualification

The final eight-family comparison review keeps **forest-hill and city-blocks at B overall**: crown silhouettes and connected branching are credible, and HDB architecture is A, but the enlarged foliage views still expose coarse individual leaf outlines. This is not a species-level rain-tree or rainforest reconstruction. The concrete remaining limit is the combination of 27 forest trees + four urban trees, the retained treatment/pipe geometry, ≤350k on-screen triangles and ≤1.5 MB for the complete GLB. Fine leaflet/understorey reconstruction is not completed; the remaining 1,734 triangles and 39,716 bytes cannot represent it across all 31 trees at the requested photographic close-up fidelity. Those parts are explicitly not claimed to meet the full A close-up bar. All other rebuilt parts are self-graded A as the schematic diorama represented in their references. GPU acceptance is still pending.

The final urban-tree sheets isolate actual indexed components from the decoded city mesh, so adjacent buildings no longer obscure the specimen. No geometry is regenerated for these studies. The final sheets were all opened and visually inspected, including front / three-quarter / profile / detail for each family and both whole-scene themes.

### Final gate record — 2026-11-09

- `pnpm check`: PASS, 1,212 files, zero errors / warnings; five pre-existing hints outside water.
- `pnpm validate`: PASS, 94 topics, zero errors / warnings.
- `pnpm test -- --testTimeout=60000`: PASS, all 276 files and 6,526 tests, including three water regressions; no tests skipped.
- `pnpm build`: PASS, 191 static pages. The production GLB is byte-identical to the reviewed source GLB.
- Eight delivery four-view comparison sheets, extra roof / kitchen / outfall / gate-pose studies and paper/cinema whole-scene previews were opened and inspected. `comparisons/verification.json` records the asset hash and gate log locations. Use `delivery-*`, not archived candidates.
- Only permitted topic/scripts/tests/public model paths changed. No engine, shared-kit, package, lockfile, queue, browser, desktop or git write was made.

## Rebuild 2026-11-05 — water round 2 (execution 2026-11-09)

This section supersedes the two B grades for `forest-hill` and `city-blocks` above. The accepted clouds, twelve-storey teaching HDB, its two roof tanks, barrage, nine gates and pump house are retained. The GLB combiner copies their compressed streams, accessors and transforms without re-quantization. Regression checks compare decoded attribute/index/matrix fingerprints for all seven accepted meshes against a fixed baseline extracted from the committed round-1 GLB, SHA-256 `fc9a1c983407d246e5d946c10d480f2f2c08d18066c0122ce0c7a3c19633ba46`. `audit-round1-preservation.ts` independently verifies the committed bytes and final asset; regenerated metrics cannot redefine this baseline.

### Construction and production contract

- `vegetation.ts`: four reusable asymmetric forms — two tall tropical emergent habits, spreading **Samanea saman**, and drooping **Pterocarpus indicus**. The original 27 forest positions remain; four urban trees are seated on land at the estate perimeter, clear of both the drain notch and building envelopes. The tree count stays 31. Each instance varies rotation, nonuniform scale and token-derived tone. Smooth tapered primary limbs, connected secondary/terminal branches, curved buttress roots, crown gaps and small leaf sprays replace the large coarse leaves.
- The leaf clusters are curved, double-sided cards with an original **512 × 512 embedded lossless WebP atlas**. Rain-tree pinnae are bipinnate; angsana sprays are pinnate; emergents use simple broadleaf terminal shoots. The texture contains cutout blades, veins and rachises, with padding between species and an opaque white quadrant for wood, terrain and architecture. The three botanical albedos were generated with the built-in image tool, then packed/petiole-anchored and tinted only with Technical Plate tokens. The failed fourth generated swatch was replaced with opaque white. The authored palette PNG is converted with exact lossless WebP; byte-for-byte decoded RGBA equality is a build gate, including transparent RGB. No reference-photo pixels or third-party meshes are embedded. Original source: `scripts/geo/water/leaf-clusters-generated-v1.png`; exact prompt, mode and processing: `scripts/geo/water/leaf-atlas-generation.json`.
- The four forms are instantiated **at build time**, then merged into one forest mesh and one city mesh. The production loader takes one mesh per named teaching part and discards glTF instancing matrices, so runtime `EXT_mesh_gpu_instancing` would silently lose trees. This implementation meets the requested budgets with two geometry draws for these two teaching parts, without an engine edit. Instance identities remain in extras and `_TREE_ID`, permitting evidence views extracted from the actual shipped geometry.
- `estate.ts`: all twelve buildings remain — eight nine-storey slabs and four fifteen-storey point blocks. Slabs have through-open void decks, pilotis, recessed windows/reveals/sills, common galleries, gallery supports, external stair landings/flights, service risers, four-sided parapets and two panelled roof tanks each. Point blocks have four corner dwellings around a recessed circulation core, continuous corner piers, wrapping recessed window bands, open ground floors and supported roof services. `occlusion.ts` removes buried faces while retaining exposed openings and edges.
- All 42 teaching part IDs, labels, chapter/beat references, flows, poses, mechanism endpoints and counts are retained. No bilingual teaching prose needed changing in this round; the round-1 sentences already describe branching crowns and mixed slab/point blocks correctly.

### References — inspected and used in comparison sheets

**Rainforest / emergents (two real Singapore photographs):**

1. [Rainforest at Singapore Botanic Gardens](https://commons.wikimedia.org/wiki/File:Rainforest_at_Singapore_Botanic_Gardens.jpg), Daniel Case, CC BY-SA 4.0 (also GFDL 1.2+): layered broadleaf canopy, long irregular stems, small terminal foliage and crown gaps.
2. [Forest path, Bukit Timah Nature Reserve, Singapore 02](https://commons.wikimedia.org/wiki/File:Forest_path%2C_Bukit_Timah_Nature_Reserve%2C_Singapore_02.jpg), Fry72 / Karel Frydrýšek, CC BY-SA 4.0: lower canopy, connected lateral shoots and rainforest interior.

**Rain trees (two real Singapore photographs):**

1. [Rain Tree Faber Estate, Singapore](https://commons.wikimedia.org/wiki/File:Rain_Tree_Faber_Estate%2C_Singapore.jpg), Red Eyes Black Dragon 92, CC BY-SA 4.0: broad umbrella habit, unequal forks and taper.
2. [Another Rain Tree Faber Estate, Singapore](https://commons.wikimedia.org/wiki/File:Another_Rain_Tree_Faber_Estate%2C_Singapore.jpg), same author/licence: curved limbs and fine, gapped foliage viewed from below.

**Angsana (two real Singapore photographs):**

1. [Angsana tree](https://commons.wikimedia.org/wiki/File:Angsana_tree.jpg), Mokkie, CC BY-SA 3.0: dense irregular roadside crown with drooping outer shoots.
2. [Angsana tree 2](https://commons.wikimedia.org/wiki/File:Angsana_tree_2.jpg), Mokkie, CC BY-SA 3.0: branch/trunk architecture and hanging foliage.

Botanical habits were cross-checked with [NParks Samanea saman](https://www.nparks.gov.sg/florafaunaweb/flora/3/1/3106) and [NParks Pterocarpus indicus](https://www.nparks.gov.sg/florafaunaweb/flora/3/0/3093). These are habit reconstructions, not a claim to inventory the species of the schematic catchment.

**City / HDB (four real Singapore photographs):**

1. [7-storey slab blocks](https://commons.wikimedia.org/wiki/File:7-storey_slab_blocks.jpg), Littlemisshy, GFDL / CC BY-SA 4.0: gallery depth, parapets, openings and stair rhythm.
2. [ViewOfHDB home, Faber Point](https://commons.wikimedia.org/wiki/File:ViewOfHDB_home_%28Faber_Point%2CHenderson_Waves%2CSingapore%29.jpg), Weikaiwoo, CC BY-SA 4.0: relative slab/tower proportions and estate massing.
3. [HDB Void Deck at 497 Tampines St 45](https://commons.wikimedia.org/wiki/File:HDB_Void_Deck_at_497_Tampines_St_45%2C_Singapore_1.jpg), Yuqiao, CC BY 4.0: genuinely open structural bays and substantial columns.
4. [Marine Parade typical point block](https://commons.wikimedia.org/wiki/File:Marine_Parade_Housing_Estate%2C_Typical_point_block%2C_Dec_05.JPG), Sengkang, Copyrighted free use: continuous corner piers, re-entrant core and wrapping window bands.

### Lighting and visual iterations

The offline preview decodes the **shipped meshopt GLB**, including UVs, embedded lossless WebP, vertex colours, source metalness/roughness, double-sidedness and alpha cutoff. The actual `GltfSource` consumer passes source `DoubleSide` to `shape.twoSided`, which `PartNode` passes to `setPartClipping`; the cards therefore retain both faces in production. It reuses `fossils-and-skeletons/studio-cpu.ts`, checking the production Lighting.tsx consumers, actual studio lights, hemisphere, installed RoomEnvironment, exposure, Three ACES matrices and sRGB output. The texture is decoded into a linear mip chain and trilinearly sampled from each triangle's projected UV footprint, so distant cutout loss is visible. CPU mip LOD/PMREM filtering remain numerical approximations; these images do not claim GPU pixel identity.

1. **Look 1 — `r2-look1-review-pairs.jpg`:** photographed rainforest had much finer foliage and denser layering; first cards looked sparse/speckled. Added more terminal cluster coverage and tone variation; removed redundant woody subdivision instead of accepting coarse foliage for budget. Added the city slab end windows, gallery supports, stairs, complete parapets and panelled tanks.
2. **Look 2 — `r2-look2-review-pairs.jpg`:** canopy improved but the point blocks still read as combs with projecting horizontal teeth. Rebuilt them as four corner dwellings around the recessed core, with continuous vertical piers and recessed wrapping glazing. Removed fully buried architectural faces, keeping every visible structural detail.
3. **Look 3 — `r2-look3-review-pairs.jpg` and the first actual-mip front view:** oversized broad leaves read as strips. Replaced them with many smaller leaves on attached terminal shoots inside each cluster; reduced card length, padded/clipped atlas tiles and connected each rachis at the card's branch anchor. Rebuilt buttresses with smooth curved surfaces and removed overlapping duplicate emergent leaders. The production material test caught an implicit metallic=1 default; explicit metallic=0 corrected the new foliage/architecture under the real ACES rig.

The first unconstrained candidates were over budget and were not accepted as delivery. Final geometry limits are enforced before writing the public GLB. The 512-pixel atlas retains tens of texels per small blade while avoiding the cost of oversized bitmap detail.

### Required engine follow-up — supplied patch, not applied

`atlasSurface` already carries the texture and alpha flag correctly. Its **fade adapter** does not scale alphaTest with opacity: a 0.25 cutoff with material opacity 0.12 discards every fragment, including an opaque leaf. This would make the entire forest/city part vanish in ghost/X-ray transitions. `scripts/geo/water/alpha-mask-fade.patch` adds `target.alphaTest = source.alphaTest * target.opacity` immediately after the production fade call. This uses the actual resulting opacity, including `source.opacity`, retaining the original alpha silhouette throughout a fade. The patch passes `git apply --check`. No engine file was edited; applying it belongs to the main session under the explicit ownership rule. The regression test records the current production limitation and verifies the patch's alpha arithmetic, rather than calling an opacity-only assertion a successful ghost render.

Browser, desktop, Chromium, e2e, shoot and GPU acceptance remain unrun because they were explicitly prohibited. Exact measured-camera registration is not claimed for different natural specimens or this schematic estate. The sheets disclose reference angle differences.

4. **Look 4 — `r2-look4-review-pairs.jpg`, then the archived `round15-*-comparison.jpg`:** the procedural atlas still looked like cut paper at botanical close-up. Replaced its three botanical tiles with original generated grayscale branch-cluster albedos, preserving alpha, petiole anchoring and token tinting. The atlas is embedded, with no runtime requests. Increased branch-order coverage rather than substituting opaque crown blobs. Exact lossless conversion caught and rejected a converter that altered transparent RGB, which would change filtered edges.
5. **Look 5 — `look24-*` and `look31-*-three-quarter.png`:** fine leaves alone did not fix clumped, angular crowns. Redistributed terminal shoots around secondary branches; used three separately oriented sprays along each terminal instead of overlaid repeated clusters. Retained all authored leaf-card triangles outside solid-mesh simplification. Decoded index counts showed the preceding candidate had not actually lost entire cards: sparse coverage came from placement, not card deletion. Added 32 irregular multistem understorey plants, with a conservative clearance envelope around the renderer's baked runoff paths. Moved four urban trees onto safe land outside all twelve building envelopes. Smoothed large limb curves to ten longitudinal samples and used 12-bit positions; omitted buried start caps instead of coarsening exposed foliage.
6. **Look 6 — full specimen studies:** the emergent was too pointed and the angsana too thin from below. Varied the emergent's upper crown around a broader height band, enlarged the hanging angsana sprays and adjusted its primary branch heights. The rain tree retains a broad umbrella, an unequal low fork and connected lateral branching. Different seed, yaw, nonuniform scale and tone/hue variation distinguish the 31 instances. A trial static bone palette increased the file size and was discarded; the delivered GLB remains ordinary rigid meshes.
7. **Look 7 — ACES branch detail:** coarse per-channel RGB rounding turned some roots red. Removed that quantization entirely. Discrete variation amounts now preserve the token's channel ratios before the normal 8-bit colour encoding. A regression on actual decoded bark colours catches the red-root defect. The final source colour was inspected again under the studio rig. Ground-level forest cameras now better match the reference elevations; elevated paper/cinema whole-scene views remain separate layout checks.

8. **Look 8 — `look38-angsana-comparison.jpg` then `look40-angsana-*`:** the complete photo sheet still exposed a crown that was too flat. Redistributed the angsana branch endpoints through a deeper vertical range, reduced the over-wide lateral reach and oriented overlapping leaf sprays upwards as well as downwards. The inspected replacement has a fuller irregular crown, hanging lower foliage and genuine gaps; no opaque envelope or extra tree was added. Trimmed redundant diagnostic metadata instead of sacrificing leaf coverage.

### Final part self-grades and counts

Grades use docs/68's **A = credible, retain** criterion, assessed against the cited real objects, including silhouette, connected supports/branching, counts and characteristic relief. These are self-grades from inspected offline evidence; the prohibited GPU acceptance is not represented as completed.

| Teaching part / component | Self-grade | Final change / evidence | Triangles before → after |
|---|---|---|---:|
| `forest-hill` — 27 trees, two emergent variants, rain-tree and angsana habits; 32 understorey shrubs | **A** | Fine alpha-tested branch clusters, irregular gapped crowns, unequal connected branch orders, curved boles and seated buttresses. Four forest views plus isolated emergent/angsana/rain-tree studies and branch/interior detail. | 88,604 → **54,036** |
| `city-blocks` — eight nine-storey slabs, four fifteen-storey point blocks, four urban trees | **A** | Open void decks, columns, recessed window rhythm, supported corridors/stairs, full parapets, panelled slab-roof tanks and tower services; four-view estate sheet plus four architectural close-ups. Urban trees have independent four-view studies and clear the complete building envelopes. | 60,730 → **57,933** |
| Accepted cumulus / rain cloud / teaching HDB / two teaching tanks / barrage / nine gate leaves / pump house | **A retained** | All seven mesh streams, decoded attributes, indices and transforms preserved; fingerprints checked. Original `delivery-*` comparison evidence remains applicable. | **69,576 → 69,576** |
| Remaining topic primitives and mechanisms | Retained, outside this round | All 42 part IDs, original EN/ZH prose, labels, chapters/beats, teaching numbers, flows, poses and mechanism data retained exactly. | **129,356 → 129,356** |

Complete topic: **348,266 → 310,901 triangles** on screen when every part is present. Estimated geometry draws **60 → 60**; forest and city each occupy one geometry draw. GLB **1,460,284 → 1,499,672 bytes** (strict decimal 1.5 MB limit). Embedded atlas **87,866 bytes**, 512 × 512, exact lossless RGBA WebP. No engine (including production camera/framing), existing shared kit, package or lockfile changes. The build rejects either budget overrun before writing the public asset. Reproduction: `pnpm tsx scripts/geo/water/build-round2.ts 40` (requires the installed `cwebp` lossless encoder); `preview.ts` then `compare.ts` generate the evidence from the shipped bytes.

### Final evidence and remaining follow-up

Current comparison directory: `/Users/gavin/work/atlas-b2-r-water/scripts/geo/water/comparisons/round2`. Use `final-{forest,city,urban-tree,emergent,angsana}-comparison.jpg`, `final-architecture-details.jpg`, and `final-whole-{paper,cinema}.png`. The source-asset hash, every final preview hash and decoded bounds are recorded beside the images. Historical candidates are explicitly separated in the parent directory. The final four-view sheets and characteristic close-ups were opened for inspection; the final evidence verification record lists their hashes.

No requested scenery component remains at B. Two external acceptance items remain concrete and explicit: (1) apply the supplied alpha-fade patch in the owning main session, because engine edits were forbidden here; (2) perform Claude's GPU acceptance, because browser/desktop/Chromium use was forbidden. CPU light transport/mip approximations and different natural specimens prevent a claim of pixel-identical GPU output or measured photographic camera registration.

### Round-2 final gate record — 2026-11-09

- `pnpm check`: **PASS**, 1,219 files, zero errors/warnings; five existing hints outside water.
- `pnpm validate`: **PASS**, 94 topics, zero errors/warnings.
- `pnpm test -- --maxWorkers=2 --fileParallelism=false --testTimeout=60000`: **PASS**, all **276 files / 6,527 tests**, zero skips, against the completed build. A prior concurrent run skipped the dist-dependent JS-budget check while the build was replacing its graph; the complete rerun exercised it. No tests were disabled or skipped by this change. The final four water tests also passed after adding the immutable round-1 baseline and forward-compatible alpha-patch assertions.
- `pnpm build`: **PASS**, 191 pages. The built GLB, source GLB and every final preview share the verified asset SHA-256 **`35a44bd76d10b4735e41246574e0957783f38238ae795ec653d72dfba3b87c2c`**.
- `git diff --check` and `git apply --check scripts/geo/water/alpha-mask-fade.patch`: **PASS**, read-only checks. No git writes, browser/desktop access or engine edits.
- Durable gate logs, all 28 preview hashes, six inspected photo-sheet hashes, both whole-scene hashes, source-script hashes, committed round-1 fingerprints and remaining engine/GPU work: `scripts/geo/water/comparisons/round2/verification.json` and `round2/gates/`.

## GPU acceptance — 2026-11-09 (Claude)

Shot with `pnpm shoot water --beats --gpu` (paper and cinema) and close-ups of the forest, city, barrage and clouds against main. Clouds, slab and point blocks, roof tanks, barrage, forest and city all read as the real things; no lollipops or cotton balls. The supplied alpha-fade patch was applied by the main session (the patch file is no longer needed), and the regression test now checks the applied behaviour.

Fixes made in acceptance:
- `GltfSource.tsx`: alpha-tested cutouts use alpha-to-coverage while opaque (the canvas has MSAA), which removes the stair-stepped card edges; a blended fade turns it off, so ghosted foliage keeps its opacity. Materials without alphaTest are unchanged (fossils-and-skeletons shots are pixel-identical to main).
- `probes.tsx`: label occlusion rays pass through texels that an alpha-tested material discards, so leaf cards no longer hide labels like solid quads. Only materials with alphaTest and a map are affected.
- `label-points.ts` (called by `build-round2.ts`): the roof-tank glb node carries `extras.labelPoint` on the first tank top. The mesh includes its downpipe, so its bounds centre sat inside the HDB block and the roof-tank label never showed. Geometry streams are unchanged; GLB 1,499,716 bytes.

Open: at the hero camera of beat 1·3 the Johor pipeline's midpoint is behind the western forest edge, so its label is hidden (correctly occluded, listed by `--beats`). A beat camera from further west or a cleared pipeline corridor would show it.
- Tests: `water-rebuild.test.ts` checks the applied fade (scaled cutoff, alpha-to-coverage only while opaque) instead of the removed patch file. `solar-system-polish.test.ts` had a synthetic alphaTest material that asserted the old unscaled cutoff; it now asserts the new contract. The real solar-system glb has no alpha-tested material.


## Rebuild 2026-11-05 — leftover pipeline visibility (audit 2026-11-09)

Scope: only the cameras of beats **1·3** and **7·1**. The accepted forest, every tree, the pipeline/label ID and the entire GLB are unchanged. No clearing, extra pipe, misleading corridor or display-text edit was needed.

### Real context photographs, inspected

1. [Causeway pipeline.jpg](https://commons.wikimedia.org/wiki/File:Causeway_pipeline.jpg), **Mohamed Shaaz**, CC BY-SA 2.0: large water mains seated beside the Causeway. Original-file downloads failed; the Commons-hosted 960-pixel thumbnail succeeded. Its historical caption's supply percentage is not adopted as a teaching fact.
2. [Johor-Singapore Causeway.JPG](https://commons.wikimedia.org/wiki/File:Johor-Singapore_Causeway.JPG), **Terence Ong**, CC BY 2.5 (also CC BY-SA 3.0/GFDL): Causeway roadside context. This camera correction retains the existing schematic route and does not turn that diorama into a surveyed Causeway replica.

### Looked-at iterations and corrections

1. **Before:** inspected the original studio overview and actual ray hits. All five production-pattern rays from `[6.55,4.8,11.3]` hit `forest-hill`; the midpoint label was correctly hidden. Moved the two beat cameras to the western side, testing the decoded GLB/leaf alpha rather than changing label-occlusion rules.
2. **Look 1:** the west-side overview revealed the pipeline and kept clear rays to all requested highlights, but the imported-water explanation remained too distant. Gave **1·3** a dedicated close-up (`[-3.35,2.02,-2.06]` → `[1.0,0.12,-0.65]`, 34 degrees). **7·1** retains the all-four-taps west overview (`[-10,5,-4]` → `[0.45,0.2,0]`, 30 degrees). Other beats still use their original cameras/presets.
3. **Look 2 / final:** inspected both beats in paper/cinema. The pipeline midpoint and two additional sample rays are clear in each camera; every requested highlight has a clear ray. The regression reads the actual chapter beat state, uses the same five sample positions and 2 cm endpoint tolerance as LabelProbe, samples the actual embedded foliage alpha, and repeats the midpoint test through production `fitCameraToAspect` at 16:9, 4:3 and 390:844. No camera/framing/label-engine file is changed.

### Part self-grade and counts

| Part / feature | Self-grade | Triangles before → after | Estimated draws | Change |
|---|---|---:|---:|---|
| `johor-main` visibility in beats 1·3 / 7·1 | **A** (visibility repair) | 8,388 → 8,388 | 2 → 2 | Dedicated west-side beat cameras reveal the midpoint and keep the existing label eligible. |
| Forest and all other accepted scenery/mechanisms | **A retained** | Unchanged | Unchanged | No geometry, text, flows, poses or labels changed. |

Whole topic: **310,901 → 310,901 triangles**, **60 → 60 estimated draws**, GLB **1,499,716 → 1,499,716 bytes**, identical SHA-256 `99d601e360075a45914c09b6da8b8a005dd6f36cbfebdf2a9efa6d3cd95a1b38`.

Primary sheets: `/tmp/atlas-leftover-polish/sheets/water-{look1,look2,final}.jpg`. Both final paper/cinema camera renders are in `/tmp/atlas-leftover-polish/water/`. Reproduce with `ATLAS_PREVIEW_SHOT=pipeline-01-3-paper,pipeline-07-1-paper,pipeline-01-3-cinema,pipeline-07-1-cinema ATLAS_PREVIEW_OUT=/tmp/atlas-leftover-polish/water pnpm tsx scripts/geo/water/preview.ts final`. These CPU images show the scene; the actual production label eligibility is verified by `pipeline-visibility.ts` and the topic test, not by a fabricated browser HUD.


### Verification and evidence boundary

`pnpm check` PASS (0 errors/warnings; 23 existing hints), `pnpm validate` PASS (94 topics, 0 errors/warnings), `pnpm run test --configLoader=runner --maxWorkers=2 --testTimeout=30000` PASS (**305 files / 6,743 tests, zero skips**), `pnpm build` PASS (**191 pages**). The read-only shared `node_modules` link prevents Astro/Vite's default cache writes. Check/build use `NODE_OPTIONS=--import=./scripts/geo/saturn-v/local-astro-cache.mjs`; that hook changes only Astro's cache path in memory. Vitest uses its existing config through the `runner` config loader. No config file, package, lockfile, engine, existing shared kit, browser/desktop or git index was modified. `git diff --check` passed.

All EN/ZH display-text pairs, teaching numbers, IDs, counts of teaching objects, chapters and beat captions are unchanged. New surfaces are original procedural geometry; the retained NASA source licence is unchanged. Counts below are decoded geometry and estimated colour/material draws, not measured GPU frames or shadow-pass counts.

Evidence root: `/tmp/atlas-leftover-polish/sheets` (absolute host path; no evidence images are tracked). Reused the fossils studio CPU renderer: actual engine studio key/fill/rim directions, intensities, hemisphere, sampled installed RoomEnvironment, exposure, linear shading, Three ACES and sRGB. Saturn and water explicitly compare against `Lighting.tsx` and its consumers; heat uses that same verified renderer. Preview source materials and actual shipped GLBs are decoded, rather than substituting a token-only proxy. CPU environment filtering, mip handling and transparent sorting remain approximations, not GPU pixel identity.

**Not done / concrete limits:** Chromium/browser/desktop/GPU acceptance is intentionally unrun under the task prohibition. Exact camera registration for every requested photographic front/profile angle is also **not complete**: the accessible flight photographs are roof/front-quarter and rear-quarter views. The four-view sheets explicitly label the nearest available reference views; neither the generic teaching gas cylinder nor Singapore's schematic diorama is claimed as a surveyed replica. The NASA/Grumman manual recovered from the Apollo Journals mirror supplied independent structure/shielding cross-checks, but its configuration figure is itself a quarter view. This is an explicit evidence exception, not a claim that all requested same-angle photographs were obtained. The changed-feature A grades below mean docs/68's “credible, retain” self-assessment; they do not certify exact flight-specific fastening patterns or GPU acceptance.
