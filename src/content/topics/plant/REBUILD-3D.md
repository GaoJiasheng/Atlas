# Plant — 3D rebuild record

## Rebuild 2026-11-05

Implemented 2026-11-09 for Gavin’s 2026-11-05 batch. Scope: every plant item named in `docs/68-3d-realism/review-living.md`, plus a whole-model audit. There were no pre-existing plant REVIEW.md, FIXES.md or REBUILD-3D.md files. The original parts data is preserved in `scripts/geo/plant/baseline-parts.json`.

This is an **offline self-review**, not Claude’s GPU browser acceptance. No browser or desktop was opened. No engine, framing, shared kit, package, lockfile or other topic was edited. The established root system, stem architecture and teaching layout were retained.

### Sources and reference observations

References were downloaded to `scripts/geo/plant/refs/` and inspected. They are development references, never runtime textures. Comparison sheets crop and resize them; credit and licence remain with their authors. The original generated mesh is repository MIT-licensed, with provenance in the GLB asset and data/SOURCES.md.

**Coconut**

- [coconut-open: Coconuts - single and cracked open.jpg](https://commons.wikimedia.org/wiki/File:Coconuts_-_single_and_cracked_open.jpg) — Ivar Leidus; CC BY-SA 4.0.
- [coconut-halves: Coconut_halves.JPG](https://commons.wikimedia.org/wiki/File:Coconut_halves.JPG) — Clockery; CC BY 3.0.
- [coconut-eyes: Coconut face (2201055109).jpg](https://commons.wikimedia.org/wiki/File:Coconut_face_%282201055109%29.jpg) — tree-species; CC BY 2.0.
- [coconut-husk: Coconut husk covering(പോള).jpg](https://commons.wikimedia.org/wiki/File:Coconut_husk_covering%28%E0%B4%AA%E0%B5%8B%E0%B4%B3%29.jpg) — Fotokannan; CC BY-SA 3.0.

**Angsana**

- [angsana-habit: Starr-090714-2696-Pterocarpus indicus-fruit and leaves-Napili-Maui (24943275086).jpg](https://commons.wikimedia.org/wiki/File:Starr-090714-2696-Pterocarpus_indicus-fruit_and_leaves-Napili-Maui_%2824943275086%29.jpg) — Forest & Kim Starr; CC BY 3.0 US.
- [angsana-pod: Angsana tree fruit.jpg](https://commons.wikimedia.org/wiki/File:Angsana_tree_fruit.jpg) — Mokkie; CC BY-SA 3.0.

**Hooked bur**

- [bur-museum: Xanthium strumarium MHNT.BOT.2004.0.213.jpg](https://commons.wikimedia.org/wiki/File:Xanthium_strumarium_MHNT.BOT.2004.0.213.jpg) — Roger Culos / Muséum de Toulouse; CC BY-SA 3.0.
- [bur-detail: Xanthium strumarium 15-p.bot-xant.chine-10.jpg](https://commons.wikimedia.org/wiki/File:Xanthium_strumarium_15-p.bot-xant.chine-10.jpg) — Gilles Ayotte / Bibliothèque de l’Université Laval; CC BY-SA 4.0.

**Splitting pod**

- [bean-pods: Phaseolus vulgaris white bean seedpods, witte boon rijpe peulen.jpg](https://commons.wikimedia.org/wiki/File:Phaseolus_vulgaris_white_bean_seedpods%2C_witte_boon_rijpe_peulen.jpg) — Rasbak; CC BY-SA 3.0.
- [bean-open: Bohnen Hülse offen mit Samen-Josef Schlaghecken.jpg](https://commons.wikimedia.org/wiki/File:Bohnen_H%C3%BClse_offen_mit_Samen-Josef_Schlaghecken.jpg) — Schlaghecken Josef; CC BY-SA 4.0.

**Chilli plant / leaves**

- [chilli-plate: Capsicum annuum - Köhler–s Medizinal-Pflanzen-027.jpg](https://commons.wikimedia.org/wiki/File:Capsicum_annuum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-027.jpg) — Franz Eugen Köhler; Public domain.
- [chilli-leaf: Chilli pepper plant 2.jpg](https://commons.wikimedia.org/wiki/File:Chilli_pepper_plant_2.jpg) — Pascal Kings; CC BY-SA 3.0.
- [chilli-long: Shan Hills, Myanmar, Red chili pepper plant.jpg](https://commons.wikimedia.org/wiki/File:Shan_Hills%2C_Myanmar%2C_Red_chili_pepper_plant.jpg) — Vyacheslav Argenberg; CC BY 4.0.

**Red and green chilli**

- [chilli-plate: Capsicum annuum - Köhler–s Medizinal-Pflanzen-027.jpg](https://commons.wikimedia.org/wiki/File:Capsicum_annuum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-027.jpg) — Franz Eugen Köhler; Public domain.
- [chilli-long: Shan Hills, Myanmar, Red chili pepper plant.jpg](https://commons.wikimedia.org/wiki/File:Shan_Hills%2C_Myanmar%2C_Red_chili_pepper_plant.jpg) — Vyacheslav Argenberg; CC BY 4.0.
- [chilli-red: Red chilli bloomed.jpg](https://commons.wikimedia.org/wiki/File:Red_chilli_bloomed.jpg) — Scientific apostle; CC BY-SA 4.0.

**Bee**

- [bee-side: Apis mellifera Western honey bee.jpg](https://commons.wikimedia.org/wiki/File:Apis_mellifera_Western_honey_bee.jpg) — Andreas Trepte; CC BY-SA 2.5.
- [bee-front: Apis mellifera - Honeybee 03.jpg](https://commons.wikimedia.org/wiki/File:Apis_mellifera_-_Honeybee_03.jpg) — Zeynel Cebeci; CC BY-SA 4.0.

**Leaf tissue**

- [leaf-histology: Angiosperm Morphology The Mesophytic Dicotyledonous Leaf of Ligustrum (36845190976).jpg](https://commons.wikimedia.org/wiki/File:Angiosperm_Morphology_The_Mesophytic_Dicotyledonous_Leaf_of_Ligustrum_%2836845190976%29.jpg) — Berkshire Community College Bioscience; CC0.
- [leaf-histology-2: Mesophyte leaf (34321748034).jpg](https://commons.wikimedia.org/wiki/File:Mesophyte_leaf_%2834321748034%29.jpg) — Berkshire Community College Bioscience; CC0.

**Root tip**

- [root-hair-drawing: EB1911 Root - Root-hair in contact with particles of soil.jpg](https://commons.wikimedia.org/wiki/File:EB1911_Root_-_Root-hair_in_contact_with_particles_of_soil.jpg) — Encyclopaedia Britannica 1911, after Green; Public domain.
- [root-hair-photo: Hanfsämling mit Wurzelhaaren am Stamm - Hemp seedling with root hairs on the stem.jpg](https://commons.wikimedia.org/wiki/File:Hanfs%C3%A4mling_mit_Wurzelhaaren_am_Stamm_-_Hemp_seedling_with_root_hairs_on_the_stem.jpg) — Vschlothauer; CC0.

**Flowers and ovules**

- [chilli-plate: Capsicum annuum - Köhler–s Medizinal-Pflanzen-027.jpg](https://commons.wikimedia.org/wiki/File:Capsicum_annuum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-027.jpg) — Franz Eugen Köhler; Public domain.
- [chilli-flower: Capsicum annuum flower.JPG](https://commons.wikimedia.org/wiki/File:Capsicum_annuum_flower.JPG) — Shizhao; CC BY-SA 2.5.
- [chilli-flower-side: Capsicum Annum Flower Closeup.JPG](https://commons.wikimedia.org/wiki/File:Capsicum_Annum_Flower_Closeup.JPG) — Chaitanya B D; Public domain.

**Germination**

- [mung: Mungböna1.jpg](https://commons.wikimedia.org/wiki/File:Mungb%C3%B6na1.jpg) — Chrizz; CC BY-SA 3.0.
- [mung-roots: 1876Germination of Adzuki bean 09.jpg](https://commons.wikimedia.org/wiki/File:1876Germination_of_Adzuki_bean_09.jpg) — Judgefloro; CC0.

**Stem section**

- [stem-histology: Herbaceous Dicot Stem Young Helianthus (34731656652).jpg](https://commons.wikimedia.org/wiki/File:Herbaceous_Dicot_Stem_Young_Helianthus_%2834731656652%29.jpg) — Berkshire Community College Bioscience; CC0.
- [chilli-plate: Capsicum annuum - Köhler–s Medizinal-Pflanzen-027.jpg](https://commons.wikimedia.org/wiki/File:Capsicum_annuum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-027.jpg) — Franz Eugen Köhler; Public domain.

The angsana reference includes both green attached fruits and dry specimens: the model depicts a dry fruit, so its brown technical-plate colour is deliberate. The hooked specimen follows the cocklebur references; the separately cited Bidens paragraph remains a different classroom example. The splitting specimen remains a generic two-valved dry legume, not an anatomically false two-valved Impatiens capsule. No species or valve-count claim was added to the lesson.

### Look → change → look journal

**Look 1 — round1 comparisons.** Inspected all nine primary sheets, including front/dorsal, three-quarter, profile and detail rows. Coconut: husk/cut face and reverse shell were too smooth and pale; added more coir bundles, longitudinal surface relief and darker token-derived values. Angsana: the seed boss disappeared, veins were too evenly dominant; integrated a clearer boss, branching secondary veins and quieter relief. Bur: too much smooth body between thick hooks; increased hook density, tapered their bases, added short hairs and paired beaks. Pod: inspected both closed and open pose; retained thin walls and improved surface ribs. Bee: long pale setae looked like bristles; shortened/darkened them and increased their density. Leaves: ACES made the foliage too yellow; changed to darker botanical token values. Chillies: salmon colour was too light; lowered the red and green albedos under the same rig, retained curves/calyces.

**Look 2 — round2 comparisons.** Inspected the updated nine primary objects against the reference crops again. Coconut: deepened the visual cavity with restrained concavity shading; retained actual bowl geometry and distinct shell/flesh thicknesses. Angsana: removed a hard circular colour boundary and reduced vein thickness; added irregularity to the boss boundary. Bur: removed a pole-star artifact in the parametric surface, darkened the involucre relative to its hooks. Pod: corrected the preview to consume the parsed `poses['pod-split'].parts` entries, with the exact XYZ rotation, offsets and mirrored pivot used by the engine; the previous preview put the -14° rotation on the wrong axis. Bee/plant: corrected comparison-camera up vectors and added true front/profile views instead of treating an upright plant like a tray specimen. Reference crop corrections: the initial angsana crop contained a leaf, and a chilli habit photo showed broad-fruited cultivars; replaced those comparisons with actual winged fruits and long-fruited chillies.

**Whole-model look — sweep.** Found visible low segmentation in buds, root cap, ovules, pollen and cut seeds; smoothed these profiles at build time. Curved the existing petal and seedling-leaf surfaces. Replaced the leaf-section fin/punched-slab construction with cellular forms. After viewing this, added pavement-cell boundary relief and restored a real lower-skin aperture beneath the guard cells. The final section retains the original 16 column profiles, two guard cells and their opening/closing motion. References show the intended layer order and irregular air spaces; a straight cut boundary is an anatomical specimen cut, not an unmodelled natural leaf edge.

**Final look.** Inspected the decoded compressed GLB in paper and cinema, plus the whole plant, root cap/hairs, stem section, leaf tissue, germination stages and fruit section. The comparisons use unretouched reference crops; photographs have their own illumination and specimen variability. Camera matching is visual, not a calibrated photogrammetric solve. CPU RoomEnvironment filtering and missing GPU contact shadows remain preview limitations, not claims of pixel identity.

### Per-part grades and measured geometry

A = credible scientific model at the intended teaching scale; B = recognisable but needs form refinement; C = crude. Grades below are self-grades under docs/68, subject to GPU acceptance. The count columns include every triangle in the expanded part, not just its first surface. Each GLB part is one geometry draw call; both pod valves remain separate.

| Part | Self-grade | What changed / retention reason | Triangles before → after | Calls before → after |
|---|---|---|---:|---:|
| `taproot` | A | Retained: tapered root with real branching junctions. | 1,428 → 1,428 | 1 → 1 |
| `lateral-roots` | A | Retained: branching root paths and unequal branch lengths. | 14,112 → 14,112 | 1 → 1 |
| `fine-roots` | A | Retained: varied fine-root paths; tessellation appropriate to their projected size. | 46,440 → 46,440 | 1 → 1 |
| `main-stem` | A | Retained: tapered stem, forks and node positions. | 1,664 → 1,664 | 1 → 1 |
| `branches` | A | Retained: three successive forks with eight tips, no radial tree fan. | 7,816 → 7,816 | 1 → 1 |
| `petioles` | A | Retained: authored leaf-stalk endpoints; new blade origins use these exact positions. | 4,152 → 4,152 | 1 → 1 |
| `stem-water-tubes` | A | Retained: eight schematic transport paths, with original flow binding. | 3,936 → 3,936 | 1 → 1 |
| `stem-food-tubes` | A | Retained: eight independent schematic paths, original sugar-flow binding. | 3,936 → 3,936 | 1 → 1 |
| `leaves-lower` | A | All 17 leaf origins and transforms retained; thin curved blades, cupped margins, a midrib crease and branching raised veins. Variation differs by blade. | 44,136 → 11,872 | 4 → 1 |
| `leaves-upper` | A | All 16 leaf origins and transforms retained; curved blades and veins match the lower leaves while retaining the younger-leaf colour. | 1,856 → 11,181 | 1 → 1 |
| `flower-bud` | A | Smoothed both axial and radial profiles of the three buds and their cups; original positions and stalk endpoints retained. | 1,152 → 3,004 | 2 → 1 |
| `flower` | A | Curved each of the fifteen existing petal surfaces, preserving three five-petalled flowers and their individual orientations. | 960 → 960 | 1 → 1 |
| `sepals` | A | Smoothed flower cup and stalk surfaces without relocating their attachment points. | 888 → 792 | 1 → 1 |
| `stamens` | A | Retained: five filaments/anthers in the front flower; original ring representation in other flowers. | 6,560 → 6,560 | 2 → 2 |
| `pistil` | A | Smoothed the ovary and stigma profiles; retained the style and original three-part arrangement. | 408 → 2,276 | 1 → 1 |
| `fruit-green` | A | Both green fruits rebuilt with the same curved botanical surface and individual bend direction; original stem attachments retained. | 1,264 → 4,836 | 2 → 1 |
| `fruit-red` | A | Both fruit pedicel endpoints retained; smoothly bent, lobed, mildly wrinkled skin with five-lobed calyx caps. | 1,264 → 4,837 | 2 → 1 |
| `bee` | A | Sculpted abdomen with overlapping segment rims, thorax setae, head capsule, raised compound eyes, two elbowed antennae, six articulated legs, pollen baskets and four veined, cambered wings. No eye decals. | 1,848 → 20,088 | 3 → 1 |
| `leaf-section` | A | Removed the fin stack and punched slab. Rounded palisade profiles, lobed spongy cells and interconnected air spaces, undulating epidermis and pavement-cell boundary relief. The lower epidermis has a real pore, clear of the two original animated guard cells. | 708 → 23,520 | 3 → 1 |
| `leaf-vein-section` | A | Retained: two transport regions and genuine tube openings; enlarged anatomical section. | 492 → 492 | 2 → 2 |
| `stoma` | A | Retained: two curved guard cells and the original live opening/closing pivot; pore clearance restored in adjacent skin. | 1,296 → 1,296 | 1 → 1 |
| `stem-section` | A | Retained: dicot cortical/pith section and seven schematic bundle pairs. | 3,280 → 3,280 | 4 → 4 |
| `root-tip` | A | Removed cap faceting and smoothed all fifteen root hairs, retaining their individual paths and attachment points. | 5,772 → 3,464 | 3 → 1 |
| `flower-section` | A | Retained: longitudinal cut, three petals/two stamens in each half, original book-opening pivot. | 3,228 → 3,228 | 4 → 4 |
| `ovules` | A | Smoothed the eight authored ovule profiles; their original positions, oval forms and teaching count remain. | 960 → 10,936 | 1 → 1 |
| `pollen-grains` | A | Smoothed the nine grains and added restrained geometric surface relief; no unsupported aperture-count labels added. | 1,512 → 20,736 | 1 → 1 |
| `bean-seed` | A | Smoothed the cut seed coat and embryo profiles without changing the displayed seed/cotyledon arrangement. | 900 → 2,484 | 4 → 1 |
| `bean-sprouting` | A | Replaced perfect spherical seed surfaces with indented seed forms, retained emerging root, added a raised hilar rim. | 6,400 → 2,976 | 3 → 1 |
| `bean-seedling` | A | Smoothed cotyledons and stem, cupped the two true leaves and retained the root branches and animation pivot. | 7,412 → 2,124 | 4 → 1 |
| `chilli-seedling` | A | Folded the four original leaf/cotyledon surfaces while retaining stem and leaf attachments. | 912 → 718 | 2 → 1 |
| `winged-fruit` | A | Warped thin wing with an irregular margin, integrated seed-bearing boss, uneven primary veins and branching secondary veins; pedicel joins the rim. No flat disc with a separate ball. | 684 → 9,592 | 3 → 1 |
| `coconut` | A | Lofted, three-lobed ovoid husk; open annular fibrous cut, separate dark shell, thick white endosperm and a genuinely hollow cavity. Reverse half exposes three sculpted pore depressions. Hundreds of tapered coir strands are geometry. | 1,488 → 17,619 | 3 → 1 |
| `hooked-fruit` | A | Tapered cocklebur-like involucre, 138 individually varied recurved hooks, short surface hairs and paired terminal beaks. Roots of hooks intersect only their natural base attachment. | 6,420 → 14,908 | 2 → 1 |
| `splitting-pod` | A | Thin curved valves with rolled margins, five retained seed bodies per authored half, surface ribs and hilum relief. Explicit second GLB node retains the mirrored chapter pose. Both physical skin faces retained. | 1,896 → 18,537 | 2 → 1 |
| `fruit-red-section` | A | Smoothed hollow fruit-wall and seed profiles; retained all thirteen authored flat seeds and their positions. | 4,044 → 7,957 | 4 → 1 |
| `pot` | A | Retained: hollow, rimmed, tapered terracotta vessel with 48 radial segments; a real rotational form. | 864 → 864 | 1 → 1 |
| `soil` | A | Retained: sectional soil volume in the existing pot, with original X-ray behaviour. | 400 → 400 | 1 → 1 |
| `lamp` | A | Retained: metal stand, curved neck and hollow shaped shade, a functional classroom lamp. | 1,664 → 1,664 | 2 → 2 |
| `dark-box` | A | Retained: cardboard box is correctly planar, open on the documented inspection side, with its pot/etiolated seedling. | 3,640 → 3,640 | 5 → 5 |
| `dry-pot` | A | Retained: small potted specimen with individual drooping leaf/stalk orientations; not replaced with a radial plant. | 2,496 → 2,496 | 4 → 4 |

The mirrored pod valve is also A and independently counted in the totals. Original part IDs, order, groups, connects, chapter/beat references, flows, poses, animations, units and teaching numbers were preserved. Leaf and fruit counts and their origins are unchanged. Minimal EN/ZH text corrections identify the partly dehusked coconut half, the cocklebur-like reference specimen, veins on the curved leaves and three lengthwise furrows on pollen instead of “smooth balls”. No lesson numbers or labels were changed.

### Lighting and material verification

`preview.mjs` decodes the **shipped meshopt GLB**, dequantizes it and applies node world matrices. It reuses `fossils-and-skeletons/studio-cpu.ts`: three direct lights, hemisphere, sampled real Three RoomEnvironment, GGX/multiscattering, exposure and ACES matrices. Rig assertions compare direct-light values and environment/exposure with live `Lighting.tsx`. Token values come from live tokens.css. There are no photographic texture maps or UV seams. The white part tint is a neutral multiplier for token-derived vertex albedo, not a white material replacing the object’s colour. Source-material `atlasSurface` is the existing renderer opt-in; no engine patch is needed.

The CPU preview does not claim browser/GPU pixel identity, GPU shadow validation, FPS, mobile smoothness or screenshot acceptance. Claude must perform the required GPU close-ups, interaction checks, and cutaway/explode acceptance. This session was explicitly prohibited from launching Chromium or controlling a browser.

### Performance and reproduction

- Entire expanded topic, even with every context/inset visible simultaneously: **206,372 → 335,632 triangles**.
- Geometry calls (estimate, excludes shadows/flows/labels): **93 → 62**.
- GLB: **none / 0 bytes → 1,385,248 bytes** (`public/models/plant.glb`, meshopt). This replaces runtime-generated surfaces; it is not added on top of them.
- All runtime resources remain local. Bound: ≤350,000 triangles and ≤1,500,000 GLB bytes. The decoded-file budget test includes the actual second valve, whose optimizer count differs from the first.

```sh
pnpm tsx scripts/geo/plant/build.mjs
pnpm tsx scripts/geo/plant/audit.mjs
pnpm tsx scripts/geo/plant/preview.mjs final
pnpm tsx scripts/geo/plant/sheets.mjs final
pnpm tsx scripts/geo/plant/preview.mjs before baseline
```

Comparison directory: `/Users/gavin/work/atlas-q-plant/scripts/geo/plant/evidence/final/comparisons/`. Earlier looks: `evidence/round1/comparisons/`, `evidence/round2/comparisons/`; whole-model audit: `evidence/sweep/`.

### Gates and remaining work

Gate results are appended after the final runs. `node_modules` is a symlink into the main checkout, and sandbox rules deny its Vite cache writes; the four gates therefore run on a byte-for-byte source copy in `/private/tmp/atlas-plant-validation`, with local writable caches and the same installed dependency packages. Default unconstrained test workers caused timing/memory failures in unrelated existing tests; the final full suite uses two workers and a 30-second per-test limit, without skipping tests or changing assertions.

Remaining: Claude GPU acceptance, as required by the brief. No authoring item is intentionally left below A; the self-grades do not substitute for that external review.

Final gate record (2026-11-09):

- `pnpm check`: PASS, 1,216 files, zero errors/warnings (15 pre-existing hints), in the isolated source copy. TypeScript also passes separately.
- `pnpm validate`: PASS, 94 topics, zero errors/warnings.
- `pnpm build`: PASS, 191 pages. The built `dist/models/plant.glb` SHA-256 equals the worktree GLB: `d151ba084055b7f48fb5a9ed6699029fa72efb89f8fc44cf6384b848b814971c`.
- Plant-specific tests: PASS, 3/3, including decoded geometry budgets, mirrored-pose bindings, unchanged teaching inputs, finite vertex attributes and material opt-in.
- Full `pnpm test`: NOT GREEN in the unpatched worktree. `scripts/geo/flower-and-seed/reuse.ts` assumes the plant JSON always supplies primitives. Its geometry-reuse tests fail for parts converted to GLB. This is a real build-time compatibility dependency, not a rendering exception or a test to suppress.

Prepared fix: `scripts/geo/plant/flower-and-seed-reuse.patch` changes only the helper’s source-file path to the immutable `scripts/geo/plant/baseline-parts.json`, retaining the exact original primitive shapes, colours, scale logic and picks for that separate topic. The helper is outside the user-authorized file ownership. Explicit permission to apply that one line was requested; until granted, the helper remains untouched and the full test gate remains unresolved. No engine change is needed. GPU browser acceptance also remains with Claude under the explicit no-browser instruction.

Final full-suite result with the current plant tests: **276 test files passed, 1 failed; 6,521 tests passed, 10 failed**. All ten failures are the primitive-only `flower-and-seed-reuse.test.ts` dependency described above. The plant tests pass within this full run, and no timing failures remain in this run. This confirms the one-line compatibility patch is the remaining code gate, rather than a reason to relax any assertion.

## GPU acceptance 2026-11-09 (Claude)

Shot on the GPU (`pnpm shoot plant --beats --gpu`, paper and cinema; 37/37 beats, beat links and console clean) plus free-camera close-ups of every rebuilt part against main. Fixes made at acceptance, all in this topic's build scripts, regenerated with `build.mjs`:

- `sweep.mjs` `palette()`: `tissue` parts keep their authored tint, which is the albedo the engine itself draws for `tissue` + tint. Snapping to the nearest token had shifted the root tip from cream to yellow, the cut chilli from red to salmon and the pollen to mustard.
- Pollen: the swirl relief rendered as faceted pinwheels on the GPU. Replaced with three meridional furrows that stop short of the poles on a slightly prolate grain, matching the tricolporate Capsicum grain; EN and ZH text updated to match. The ZH replacement in `build.mjs` never matched the live text, so the ZH note still said "smooth balls". That is fixed too.
- Splitting pod: the two end seeds poked through the closed valves. All five seeds now sit between 27 % and 73 % of the valve length, where the valve is wide enough to hold them.
- Coconut: the cut husk face was olive (`en-potential` × 0.58). It now uses a light fibrous brown (`fossil` lifted 1.3×), lighter than the outer husk as on a fresh cut.

The GLB is now 1,466,288 bytes and the whole topic is 339,695 triangles, both inside the budget.

The flower-and-seed reuse helper (`scripts/geo/flower-and-seed/reuse.ts`) now reads `baseline-parts.json`. That file is byte-identical to main's plant parts.json, and the flower-and-seed generator gives identical output from either source. Gates: check, validate and build green. Unit tests: 6,528 passed; the three failures (sauropod, toad skin, math-scene painter's order) were timeouts under host load and pass when rerun alone. Open but minor: the palisade cells' lower ends taper to a point where real cells are rounded.
