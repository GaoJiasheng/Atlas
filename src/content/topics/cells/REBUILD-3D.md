# Cells — 3D rebuild

## Polish 2026-11-03

This pass retains all 29 selectable IDs (animal 3, plant 6, microscope 15,
context 5), six named cameras, all eight chapters / forty beats, microscope
powers, objective indexing, physical slide offsets and independently enlarged
cell scales. The exposed fronts are permanent illustration choices: assembled
cells show their contents without asking the reader to enable X-ray or cutaway.

### Items changed

1. **Animal cell.** Replaced the fifteen laminated elliptical slices with an
   original smooth, asymmetric epithelial boundary and an opaque gel relief.
   The rolled edge and shallow volume retain a flattened silhouette. A genuine
   nucleus recess, one nucleus / nucleolus, irregular chromatin details,
   five varied mitochondria with folded inner membranes, curved membrane sacs
   and sparse granules replace the almost invisible disc. Analytical normals
   remove the large triangle shading seams found in the first CPU render.
2. **Plant cell.** Replaced box / ring assemblies with a smooth rounded prism,
   separately thickened wall and membrane, peripheral cytoplasm, a softly
   shouldered indented central vacuole and recessed lateral nucleus. Six varied
   chloroplast bodies retain the design count; their illustrative grana have
   tiered membrane profiles. Peripheral mitochondria are distinct from them.
   Cytoplasm beds beneath both nuclei close the spurious white gaps discovered
   in frontal previews while leaving the nuclear volumes unfilled.
3. **Microscope.** Profiled all optical barrels and retaining collars, recessed
   lens glass, objective red / yellow / blue identification bands, three barrel
   lengths, revolving nosepiece and connecting bearing. The base has a sculpted
   footprint, the arm a smooth variable section, the stage a real light opening
   and two arched spring clips with slotted screws. Coaxial focus wheels have
   40 / 30 flutes, separate hubs and rims. The lamp and iris/condenser are
   connected to the optical path. Existing objective pivot, axes, indexed poses
   and positive coverslip clearance remain intact.
4. **Named lens beats.** Primary optical primitives are visible surface sectors,
   so their leader anchors lie on actual front surfaces. Eyepiece arithmetic
   uses a whole-instrument camera; named 40× beats select and label the active
   long blue-ring objective. The low-power setup beat no longer requests an
   unnecessary occluded 40× label. CPU frustum and closest-hit raycasts cover
   every eyepiece / 40× highlighted or named beat; they are green.
5. **Onion and tissue.** The live field uses nine elongated, staggered,
   irregularly bounded templates with varied nuclei, shared walls and pale
   contents. Target `onion-nucleus` stays at [200, 0, 0] µm; finite features
   rise from 75 to 1,755, below the 2,048 ceiling. Topic states / beats apply
   illumination 1 instead of .5. The shared schema mandates control default
   .5, so that fixture field stays unchanged; every authored field entry is
   bright. The 3D onion patch also has nine irregular cells with nuclei, and
   the tissue context becomes six fitted epithelial reliefs instead of balls.
6. **Cell pair.** The background entry now reveals both cell models beside the
   leaf, explicitly at independent scales. The pair camera centres on the two
   cells and the HUD frame no longer follows the leaf. Atlas presets preserve
   the active chapter's hide/layer state; this data-only pass does not change
   that engine-wide preset contract.

### References and factual limits

- Existing S4, OpenStax Biology 2e §4.3, reread 2026-11-03: nucleus / nucleolus,
  organelles, mitochondrial folds, chloroplast membranes and cell topology.
- Existing S17 / S18, Mariana Ruiz (LadyofHats), public-domain plant / animal
  cell diagrams; structural references only. No figure or mesh imported.
- Existing original Atlas preparation drawings
  `/Users/gavin/work/atlas/art/planned/cells/{cells,cells-microscope}.png`,
  inspected locally. The cell models are explanatory illustrations, not
  microscopy photographs or measured organelle proportions.
- S6 / S7 / S21 and Nikon E100 official part photograph:
  https://www.microscope.healthcare.nikon.com/guides/e100/en/page/name.html
  (reference photo inspected; no production asset imported).
- S23 / S24 onion epidermis references, reread; no chloroplasts added to bulb
  epidermis. Pattern variation is authored teaching geometry, not sampled data.

Cell-part detail and onion / tissue / stage descriptions were minimally
updated in **both English and Chinese** to match the new visible structures;
teaching numbers, part names, IDs and chapter/beat references are retained.
No third-party asset is embedded. The original locally generated GLB carries
Atlas CC BY-NC-SA 4.0 provenance in `asset.copyright`.

### Geometry budget and verification

Baseline CPU count of every instantiated part: **76,120 triangles**:
animal 14,104; plant 22,136; microscope 8,604; tissue/context 31,276.
Final CPU count: **237,454 triangles**, with every group visible at once
(under the 350,000 ceiling). Animal 14,104 → **59,808**; plant 22,136 →
**72,180**; microscope 8,604 → **57,012**; tissue/context 31,276 → **48,454**.
The cell-pair view is **131,988** triangles. Repeated optical detail merges by
material; cytoplasm/organelles are indexed into one mesh each. Tiny chromatin granules use 16 radial segments rather than the 48-segment
hero sphere, saving 41,472 triangles without a visible close-up change. The
complete topic uses 73 material slots (architecture count, not measured draw calls).
These are actual decoded geometry counts, including instancing, not GPU FPS.

Offline tools are topic-owned: `scripts/geo/cells/preview.ts` exports actual
engine primitives and decoded GLB nodes; `render-preview.py` rasterizes with
smooth normals and a depth buffer on paper / cinema. These previews verify
forms, poses and anchor positions, not the browser's final HUD label solver.
No browser or desktop was opened. Browser acceptance remains with Claude.

### Integration completed — Polish 2026-11-03 continuation

Gavin authorized exactly `public/models/cells.glb`. The topic generator now
writes that schema-compatible URL, using the existing local Meshopt pipeline
with 16-bit positions and filtered normals. There is no mesh simplification
or imported asset. The production file is **819,840 bytes** (about 801 KiB),
well below the enforced **1,500,000-byte** limit; the obsolete nested 4.7 MB
staging asset has been removed. Original procedural authorship and licence
are recorded in `data/SOURCES.md` and the GLB copyright field.

Decoded production geometry remains **237,454 triangles**, exactly the
pre-compression total; the pre-polish baseline remains **76,120**. The
preview exporter now validates the real production URL, decodes Meshopt and
applies quantised node transforms. Geometry tests do the same; content tests
also decode the file with the same Three.js GLTFLoader/MeshoptDecoder as the
runtime, measure scene-space label anchors, enforce the size/compression
contract and project objective labels in their indexed poses.

The final gate pass found two label/index omissions from the earlier polish.
The 10× objective label is restored to the low-power setup beat; the 40×
objective label is attached to the high-power fine-focus beat, where it is
active and passes the closest-hit visibility test. The try-it chapter index
now includes its already-labelled 40× objective. No caption, teaching number,
part ID or chapter/beat count changed in this continuation.

Final offline previews are in `/private/tmp/atlas-cells-previews/`:
`animal-{front,oblique,nucleus,organelles}.png`,
`plant-{front,oblique,chloroplasts}.png`, `pair.png`, `pair-cinema.png`,
`onion-patch.png`, `scope-{whole,front,stage,high,eyepiece,knobs}.png`,
and six actual named-lens beat cameras with `-labels.png` overlays (including
`beat-01-4-labels.png`). Cell views were regenerated from the compressed
production asset; the named-lens views were regenerated after the label fix.
The live field previews remain
`/private/tmp/atlas-cells-polish/onion-{4,10,40}x.png`.
The continuation inspected smooth cell/organellar close-ups, plant oblique
views, microscope stage detail, both pair themes and the final high-power
label overlays.
These CPU previews verify geometry and anchors, not the final browser HUD.
No browser or desktop was opened; browser acceptance remains with Claude.

Final gates all exited **0** on the integrated production data:

- `pnpm check`: 1,095 Astro files; **0 errors, 0 warnings**, four existing
  hints; the subsequent `tsc --noEmit` phase also passed.
- `pnpm validate`: **94 topics, 0 errors, 0 warnings** (rerun after the
  label/index fixes).
- `pnpm run test --maxWorkers=2` (the `pnpm test` script, limited to two
  workers to avoid the handoff's parallel-load timeouts): **252 files,
  6,346 tests passed**, no skips or failures.
- `pnpm build`: **191 pages**, completed static generation and PWA assets.
  `dist/topics/cells/data.json` references `/models/cells.glb`; the built
  GLB is byte-identical to the generated source.
- `git diff --check`: clean. No git writes, dependency/lockfile changes,
  shared-kit edits or browser/desktop actions.

Logs: `/private/tmp/atlas-cells-{check,validate,test,build}-integrated.log`.
There are no remaining integration items. Runtime/browser visual acceptance
is intentionally left to Claude under this task's offline-only boundary.

### Browser acceptance fix — 2026-11-03 (Claude)

The first browser shoot showed the six open-front relief nodes marked
`extras.closed: true`, so the half cutaway capped them with one hatched face
that hid every chloroplast, both nuclei and the vacuole (plant-cell beats 2–5,
compare-cells beat 1). The nodes are now `closed: false`, and the cell beats
(and the compare-cells chapter state) that requested X-ray + half cutaway use
the assembled view: the exposed fronts already show the contents, and the cut
plane would otherwise remove the front-placed organelles. The animal-cell
cytoplasm caption no longer mentions a cutaway (EN + ZH).
