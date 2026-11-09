import pathlib,json
root=pathlib.Path('src/content/topics/plant');ev=pathlib.Path('scripts/geo/plant/evidence');audit=json.loads((ev/'final-audit.json').read_text());base=json.loads(pathlib.Path('scripts/geo/plant/baseline-parts.json').read_text());now=json.loads((root/'data/parts.json').read_text())
refs=json.loads(pathlib.Path('scripts/geo/plant/refs/manifest.json').read_text())
credit={
'coconut-open':('Ivar Leidus','CC BY-SA 4.0'),'coconut-husk':('Fotokannan','CC BY-SA 3.0'), 'coconut-eyes':('tree-species','CC BY 2.0'),'coconut-halves':('Clockery','CC BY 3.0'),
'angsana-habit':('Forest & Kim Starr','CC BY 3.0 US'),'angsana-pod':('Mokkie','CC BY-SA 3.0'),'bur-museum':('Roger Culos / Muséum de Toulouse','CC BY-SA 3.0'),'bur-detail':('Gilles Ayotte / Bibliothèque de l’Université Laval','CC BY-SA 4.0'),
'bean-pods':('Rasbak','CC BY-SA 3.0'),'bean-open':('Schlaghecken Josef','CC BY-SA 4.0'),'chilli-plate':('Franz Eugen Köhler','Public domain'),'chilli-habit':('Forest & Kim Starr','CC BY 3.0 US'),'chilli-leaf':('Pascal Kings','CC BY-SA 3.0'),'chilli-long':('Vyacheslav Argenberg','CC BY 4.0'),'chilli-red':('Scientific apostle','CC BY-SA 4.0'),
'bee-side':('Andreas Trepte','CC BY-SA 2.5'),'bee-front':('Zeynel Cebeci','CC BY-SA 4.0'),
'leaf-histology':('Berkshire Community College Bioscience','CC0'),'leaf-histology-2':('Berkshire Community College Bioscience','CC0'),'stem-histology':('Berkshire Community College Bioscience','CC0'),'mung':('Chrizz','CC BY-SA 3.0'),'mung-roots':('Judgefloro','CC0'),'root-hair-drawing':('Encyclopaedia Britannica 1911, after Green','Public domain'),'root-hair-photo':('Vschlothauer','CC0'),'chilli-flower':('Shizhao','CC BY-SA 2.5'),'chilli-flower-side':('Chaitanya B D','Public domain')}
# Record only successful reference downloads; no speculative/missing File titles.
reference_groups={
'Coconut':['coconut-open','coconut-halves','coconut-eyes','coconut-husk'],
'Angsana':['angsana-habit','angsana-pod'],'Hooked bur':['bur-museum','bur-detail'],'Splitting pod':['bean-pods','bean-open'],
'Chilli plant / leaves':['chilli-plate','chilli-leaf','chilli-long'],'Red and green chilli':['chilli-plate','chilli-long','chilli-red'],
'Bee':['bee-side','bee-front'],'Leaf tissue':['leaf-histology','leaf-histology-2'],'Root tip':['root-hair-drawing','root-hair-photo'],
'Flowers and ovules':['chilli-plate','chilli-flower','chilli-flower-side'],'Germination':['mung','mung-roots'],'Stem section':['stem-histology','chilli-plate']}
changes={
'coconut':'Lofted, three-lobed ovoid husk; open annular fibrous cut, separate dark shell, thick white endosperm and a genuinely hollow cavity. Reverse half exposes three sculpted pore depressions. Hundreds of tapered coir strands are geometry.',
'winged-fruit':'Warped thin wing with an irregular margin, integrated seed-bearing boss, uneven primary veins and branching secondary veins; pedicel joins the rim. No flat disc with a separate ball.',
'hooked-fruit':'Tapered cocklebur-like involucre, 138 individually varied recurved hooks, short surface hairs and paired terminal beaks. Roots of hooks intersect only their natural base attachment.',
'splitting-pod':'Thin curved valves with rolled margins, five retained seed bodies per authored half, surface ribs and hilum relief. Explicit second GLB node retains the mirrored chapter pose. Both physical skin faces retained.',
'leaves-lower':'All 17 leaf origins and transforms retained; thin curved blades, cupped margins, a midrib crease and branching raised veins. Variation differs by blade.',
'leaves-upper':'All 16 leaf origins and transforms retained; curved blades and veins match the lower leaves while retaining the younger-leaf colour.',
'fruit-red':'Both fruit pedicel endpoints retained; smoothly bent, lobed, mildly wrinkled skin with five-lobed calyx caps.',
'fruit-green':'Both green fruits rebuilt with the same curved botanical surface and individual bend direction; original stem attachments retained.',
'bee':'Sculpted abdomen with overlapping segment rims, thorax setae, head capsule, raised compound eyes, two elbowed antennae, six articulated legs, pollen baskets and four veined, cambered wings. No eye decals.',
'leaf-section':'Removed the fin stack and punched slab. Rounded palisade profiles, lobed spongy cells and interconnected air spaces, undulating epidermis and pavement-cell boundary relief. The lower epidermis has a real pore, clear of the two original animated guard cells.',
'flower-bud':'Smoothed both axial and radial profiles of the three buds and their cups; original positions and stalk endpoints retained.',
'flower':'Curved each of the fifteen existing petal surfaces, preserving three five-petalled flowers and their individual orientations.',
'sepals':'Smoothed flower cup and stalk surfaces without relocating their attachment points.',
'pistil':'Smoothed the ovary and stigma profiles; retained the style and original three-part arrangement.',
'root-tip':'Removed cap faceting and smoothed all fifteen root hairs, retaining their individual paths and attachment points.',
'ovules':'Smoothed the eight authored ovule profiles; their original positions, oval forms and teaching count remain.',
'pollen-grains':'Smoothed the nine grains and added restrained geometric surface relief; no unsupported aperture-count labels added.',
'bean-seed':'Smoothed the cut seed coat and embryo profiles without changing the displayed seed/cotyledon arrangement.',
'bean-sprouting':'Replaced perfect spherical seed surfaces with indented seed forms, retained emerging root, added a raised hilar rim.',
'bean-seedling':'Smoothed cotyledons and stem, cupped the two true leaves and retained the root branches and animation pivot.',
'chilli-seedling':'Folded the four original leaf/cotyledon surfaces while retaining stem and leaf attachments.',
'fruit-red-section':'Smoothed hollow fruit-wall and seed profiles; retained all thirteen authored flat seeds and their positions.'}
text='''# Plant — 3D rebuild record

## Rebuild 2026-11-05

Implemented 2026-11-09 for Gavin’s 2026-11-05 batch. Scope: every plant item named in `docs/68-3d-realism/review-living.md`, plus a whole-model audit. There were no pre-existing plant REVIEW.md, FIXES.md or REBUILD-3D.md files. The original parts data is preserved in `scripts/geo/plant/baseline-parts.json`.

This is an **offline self-review**, not Claude’s GPU browser acceptance. No browser or desktop was opened. No engine, framing, shared kit, package, lockfile or other topic was edited. The established root system, stem architecture and teaching layout were retained.

### Sources and reference observations

References were downloaded to `scripts/geo/plant/refs/` and inspected. They are development references, never runtime textures. Comparison sheets crop and resize them; credit and licence remain with their authors. The original generated mesh is repository MIT-licensed, with provenance in the GLB asset and data/SOURCES.md.

'''
for hero,keys in reference_groups.items():
 text+=f'**{hero}**\n\n'
 for key in keys:
  v=refs[key];author,lic=credit[key];text+=f'- [{key}: {v["title"]}]({v["url"]}) — {author}; {lic}.\n'
 text+='\n'
text+='''The angsana reference includes both green attached fruits and dry specimens: the model depicts a dry fruit, so its brown technical-plate colour is deliberate. The hooked specimen follows the cocklebur references; the separately cited Bidens paragraph remains a different classroom example. The splitting specimen remains a generic two-valved dry legume, not an anatomically false two-valved Impatiens capsule. No species or valve-count claim was added to the lesson.

### Look → change → look journal

**Look 1 — round1 comparisons.** Inspected all nine primary sheets, including front/dorsal, three-quarter, profile and detail rows. Coconut: husk/cut face and reverse shell were too smooth and pale; added more coir bundles, longitudinal surface relief and darker token-derived values. Angsana: the seed boss disappeared, veins were too evenly dominant; integrated a clearer boss, branching secondary veins and quieter relief. Bur: too much smooth body between thick hooks; increased hook density, tapered their bases, added short hairs and paired beaks. Pod: inspected both closed and open pose; retained thin walls and improved surface ribs. Bee: long pale setae looked like bristles; shortened/darkened them and increased their density. Leaves: ACES made the foliage too yellow; changed to darker botanical token values. Chillies: salmon colour was too light; lowered the red and green albedos under the same rig, retained curves/calyces.

**Look 2 — round2 comparisons.** Inspected the updated nine primary objects against the reference crops again. Coconut: deepened the visual cavity with restrained concavity shading; retained actual bowl geometry and distinct shell/flesh thicknesses. Angsana: removed a hard circular colour boundary and reduced vein thickness; added irregularity to the boss boundary. Bur: removed a pole-star artifact in the parametric surface, darkened the involucre relative to its hooks. Pod: corrected the preview to consume the parsed `poses['pod-split'].parts` entries, with the exact XYZ rotation, offsets and mirrored pivot used by the engine; the previous preview put the -14° rotation on the wrong axis. Bee/plant: corrected comparison-camera up vectors and added true front/profile views instead of treating an upright plant like a tray specimen. Reference crop corrections: the initial angsana crop contained a leaf, and a chilli habit photo showed broad-fruited cultivars; replaced those comparisons with actual winged fruits and long-fruited chillies.

**Whole-model look — sweep.** Found visible low segmentation in buds, root cap, ovules, pollen and cut seeds; smoothed these profiles at build time. Curved the existing petal and seedling-leaf surfaces. Replaced the leaf-section fin/punched-slab construction with cellular forms. After viewing this, added pavement-cell boundary relief and restored a real lower-skin aperture beneath the guard cells. The final section retains the original 16 column profiles, two guard cells and their opening/closing motion. References show the intended layer order and irregular air spaces; a straight cut boundary is an anatomical specimen cut, not an unmodelled natural leaf edge.

**Final look.** Inspected the decoded compressed GLB in paper and cinema, plus the whole plant, root cap/hairs, stem section, leaf tissue, germination stages and fruit section. The comparisons use unretouched reference crops; photographs have their own illumination and specimen variability. Camera matching is visual, not a calibrated photogrammetric solve. CPU RoomEnvironment filtering and missing GPU contact shadows remain preview limitations, not claims of pixel identity.

### Per-part grades and measured geometry

A = credible scientific model at the intended teaching scale; B = recognisable but needs form refinement; C = crude. Grades below are self-grades under docs/68, subject to GPU acceptance. The count columns include every triangle in the expanded part, not just its first surface. Each GLB part is one geometry draw call; both pod valves remain separate.

| Part | Self-grade | What changed / retention reason | Triangles before → after | Calls before → after |
|---|---|---|---:|---:|
'''
for p in base['parts']:
 id=p['id'];b=audit['before']['parts'][id];a=audit['after']['parts'][id]
 reason=changes.get(id)
 if not reason:
  reasons={'taproot':'Retained: tapered root with real branching junctions.','lateral-roots':'Retained: branching root paths and unequal branch lengths.','fine-roots':'Retained: varied fine-root paths; tessellation appropriate to their projected size.','main-stem':'Retained: tapered stem, forks and node positions.','branches':'Retained: three successive forks with eight tips, no radial tree fan.','petioles':'Retained: authored leaf-stalk endpoints; new blade origins use these exact positions.','stem-water-tubes':'Retained: eight schematic transport paths, with original flow binding.','stem-food-tubes':'Retained: eight independent schematic paths, original sugar-flow binding.','stamens':'Retained: five filaments/anthers in the front flower; original ring representation in other flowers.','leaf-vein-section':'Retained: two transport regions and genuine tube openings; enlarged anatomical section.','stoma':'Retained: two curved guard cells and the original live opening/closing pivot; pore clearance restored in adjacent skin.','stem-section':'Retained: dicot cortical/pith section and seven schematic bundle pairs.','flower-section':'Retained: longitudinal cut, three petals/two stamens in each half, original book-opening pivot.','pot':'Retained: hollow, rimmed, tapered terracotta vessel with 48 radial segments; a real rotational form.','soil':'Retained: sectional soil volume in the existing pot, with original X-ray behaviour.','lamp':'Retained: metal stand, curved neck and hollow shaped shade, a functional classroom lamp.','dark-box':'Retained: cardboard box is correctly planar, open on the documented inspection side, with its pot/etiolated seedling.','dry-pot':'Retained: small potted specimen with individual drooping leaf/stalk orientations; not replaced with a radial plant.'}
  reason=reasons[id]
 text+=f'| `{id}` | A | {reason} | {b["triangles"]:,} → {a["triangles"]:,} | {b["calls"]} → {a["calls"]} |\n'
text+='''
The mirrored pod valve is also A and independently counted in the totals. Original part IDs, order, groups, connects, chapter/beat references, flows, poses, animations, units and teaching numbers were preserved. Leaf and fruit counts and their origins are unchanged. Minimal EN/ZH text corrections identify the partly dehusked coconut half, the cocklebur-like reference specimen, veins on the curved leaves and relief on pollen instead of “smooth balls”. No lesson numbers or labels were changed.

### Lighting and material verification

`preview.mjs` decodes the **shipped meshopt GLB**, dequantizes it and applies node world matrices. It reuses `fossils-and-skeletons/studio-cpu.ts`: three direct lights, hemisphere, sampled real Three RoomEnvironment, GGX/multiscattering, exposure and ACES matrices. Rig assertions compare direct-light values and environment/exposure with live `Lighting.tsx`. Token values come from live tokens.css. There are no photographic texture maps or UV seams. The white part tint is a neutral multiplier for token-derived vertex albedo, not a white material replacing the object’s colour. Source-material `atlasSurface` is the existing renderer opt-in; no engine patch is needed.

The CPU preview does not claim browser/GPU pixel identity, GPU shadow validation, FPS, mobile smoothness or screenshot acceptance. Claude must perform the required GPU close-ups, interaction checks, and cutaway/explode acceptance. This session was explicitly prohibited from launching Chromium or controlling a browser.

### Performance and reproduction

'''
b=audit['before'];a=audit['after'];text+=f'- Entire expanded topic, even with every context/inset visible simultaneously: **{b["triangles"]:,} → {a["triangles"]:,} triangles**.\n- Geometry calls (estimate, excludes shadows/flows/labels): **{b["calls"]} → {a["calls"]}**.\n- GLB: **none / 0 bytes → {a["bytes"]:,} bytes** (`public/models/plant.glb`, meshopt). This replaces runtime-generated surfaces; it is not added on top of them.\n- All runtime resources remain local. Bound: ≤350,000 triangles and ≤1,500,000 GLB bytes. The decoded-file budget test includes the actual second valve, whose optimizer count differs from the first.\n\n'
text+='''```sh
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
'''
(root/'REBUILD-3D.md').write_text(text)
