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

## Polish 2026-11-03 — round 3 after browser acceptance

### 1. Structure labels: cytoplasm fixed; generic GLB anchors still blocked

Both cytoplasm labels now point into actual gel regions clear of the nuclei.
The animal gel is partitioned into two fitted coplanar regions, with the left
region as the main primitive. The plant gel uses a narrow right-hand region
as its main primitive, away from its vacuole and organelles. The other regions,
true nuclear recesses, basal beds and organelle relief move/explode/select
with the same existing cytoplasm IDs. No invisible label proxy was added.
The vacuole bounds centre already lies inside the vacuole and remains valid.

**Resolved (2026-11-03):** the engine now reads an opt-in glb node
`extras.labelPoint` (node-local) into a rigid part's leader end. The
`animal-membrane` (right rim), `plant-cell-wall` (upper left front band) and
`plant-membrane` (lower left crest) nodes carry one, on the outer sides of
the side-by-side pair; a geometry test checks
each lies on its boundary, away from the bounds centre, and is the first
surface seen from the front. The original round-three record follows.

**Was not completed:** `animal-membrane`, `plant-membrane`, `plant-cell-wall`
leaders still used the GLB bounds centre. The requested Sun–Earth–Moon fields
are not a generic part contract in this checkout:

- `bodyTransform.labelPoint` is inside `orbit-rotation-schema.ts` and is
  evaluated by the orbit body-frame solver / `OrbitDriver`. It moves and
  scales an Earth/Moon/Sun attachment; using it here would require an unrelated
  orbit simulation and conflict with independent cell explode behaviour.
- `labelAnchors: strokes` only applies to orbit-guide overlays, not GLB parts.
- The strict part schema has no `labelPoint` / `labelAnchors` field.
- `GltfSource.shapeOf` reads `extras.closed` and the geometry bounds, but no
  label point. `SceneRoot` derives `glbAnchors` with `boxAnchor` and explicitly
  uses that bounds-centre offset for `PartNode.anchorPoint`.

The missing engine support is a **static, optional per-part label point**, in
scene/rest coordinates or a clearly defined mesh-local frame, carried through
GLB loading and into `PartHandle.point` independently of its bounds, while
following the same pose/explode transforms. Reading an equivalent GLB
`extras.labelPoint` would also work. No engine file was edited and no
unsupported schema field was silently written into this topic.

### 2. Mitochondria and relief

The cytoplasm selections now have three merged material slots: pale gel,
muted orange outer membrane/cristae (`hot`) and a contrasting matrix
(`en-heat`). The five animal and three plant mitochondria retain their counts,
varied proportions and directions. Each has seven curved lamellar crests,
with varied spacing, lengths, widths and bends, rather than pale tubular
marks. Explicitly sampled rounded ends stay smooth in the close-up. Narrow
root bevels were reduced after CPU inspection caught bridged pockets. The
smallest plant mitochondrion moved clear of a chloroplast, and all vertical
profile offsets scale together so its floor joins its rim.

The single-material GLB loader cannot preserve several materials within one
logical part; multipart cytoplasm is the topic-only workaround. The gel is an
exposed section, joined without visible coplanar seams. Its former 0.25 mm
surface ripple is omitted. Decorative surface beads are reduced from 26 to
four (not a stated biological count) to fit the existing 32-extra limit and
avoid adding sub-pixel baked geometry. All **teaching** counts, 29 part IDs,
one nucleus per cell, six chloroplasts, nine onion cells, six tissue cells,
three objectives, eight chapters and forty beat references remain intact.
No teaching prose or EN/ZH label needed changing; the existing text already
identifies colours, thicknesses and detail counts as illustration choices.

Reference: existing **S4, OpenStax Biology 2e §4.3 / Figure 4.14**, reread and
micrograph inspected on 2026-11-03. Its double membrane and cristae inform the
relief; the warm colours are explanatory, not microscopy colour. Existing
S17/S18 and S20 still govern the overall topology and authored scale. No
external image, mesh or runtime request was introduced.

### 3. Comparison and systems plate

The onion patch is translated down by 0.10 m and forward by 0.03 m. The tissue
patch is translated right by 0.02 m, up by 0.10 m and forward by 0.03 m. The
intestine and body context move right into separate columns. Their existing
independent illustrative scales are retained. Systems beats use an explicit
whole-plate camera; the leaf beat has a dedicated leaf camera. Compare beat 5
uses assembled mode. Each labelled context object is visible and its leader
has an unobstructed path; a closest-hit CPU raycast regression covers those
requested labels. The membrane/wall endpoint limitation above remains visible
in the annotated previews and is not claimed as fixed.

### 4. Loading investigation and budget

The original asset has **zero embedded GLB materials**, six mesh pieces and
86,100 triangles. Production Three.js GLTFLoader + MeshoptDecoder parses it
in milliseconds in Node; decoding alone is not evidence for a 3.2 s browser
regression. `SceneRoot` synchronously builds **all** procedural parts, including
hidden microscope/context pieces, before its GLB source can mount. The
post-rebuild procedural baseline is 151,354 triangles / 454,062 baked vertices,
versus the old-main whole-topic 76,120 triangles. `mergeBaked` expands and
transforms these vertices. Shader program caching means material instances
are not equivalent to unique shader compilations.

Round-three changes remove redundant near-collinear onion contour samples
with a 15 µm model-space tolerance, replace fixed 48×32 sphere primitives with
explicit smooth lathe profiles chosen by visual size, reduce small retaining
ring segments, and retain the microscope's arm curvature with fewer stations.
Static repeated detail still merges per material; no repeated child mesh tree
or imported asset was added.

| Decoded triangles (all groups visible) | Before round 3 | After round 3 |
| --- | ---: | ---: |
| Animal cell | 59,808 | 37,046 |
| Plant cell | 72,180 | 44,814 |
| Microscope | 57,012 | 49,908 |
| Tissue/context | 48,454 | 34,622 |
| **Total** | **237,454** | **166,390** |
| Cell pair | 131,988 | 81,860 |

Production `/models/cells.glb`: **819,844 → 36,480 bytes** (95.6% smaller), six
nodes → four, same Meshopt/16-bit position contract. The source `parts.json`
grows from 557,334 to 757,482 bytes because cytoplasm relief is now data.
Combined source JSON + GLB footprint falls **1,377,178 → 793,962 bytes**; these
are disk bytes, not measured HTTP transfer sizes. Material/draw pieces increase
**73 → 77** to make mitochondrial tones distinct; this is not presented as a
draw-call reduction. Final procedural geometry is 157,174 triangles / 471,522
baked vertices, so its CPU generation cost must be measured rather than
inferred from the lower overall triangle count.

**Still requires browser acceptance:** an actual same-load stage-ready A/B
against the reported 8.9 s / 5.7 s. No browser, desktop or GPU was driven and
no new browser-ready number or FPS is claimed. `scripts/geo/cells/profile.ts`
is a reproducible offline primitive-generation / production-decoder proxy;
its samples are stored in `/private/tmp/atlas-cells-round3/profile-final.json`.

### Offline visual verification and gates

Actual generated geometry, normals and transforms were CPU-rasterized with
smooth lighting and a depth buffer, inspected and iterated. The final set is
`/private/tmp/atlas-cells-round3/after/`: `animal-front`, `animal-oblique`,
`animal-nucleus`, `animal-mitochondria`, `plant-front`, `plant-oblique`,
`plant-mitochondria`, `pair`, `onion-patch`, `scope-whole`, `scope-eyepiece`,
`scope-stage`, `beat-04-5` and all five `beat-07-*` views. PNGs end in
`-labels.png` and `-cinema-labels.png`. Before images and original packets
are in the sibling `before/` directory. The S4 micrograph is retained only as
`/private/tmp/atlas-cells-round3/mitochondrion-reference.webp` for comparison.
These verify geometry and anchor coordinates, not the browser HUD solver.

Final alternating offline profile (four fresh Node processes per version):
median procedural generation **361.21 → 292.16 ms**, production GLB parsing
**12.03 → 5.08 ms**, decoder ready **2.95 → 2.71 ms**. These are CPU proxies
on this host under session load, not browser stage-ready timings. The earlier
trial had noisy generation medians of 254.45 / 261.14 ms; the raw samples are
retained in `profile.json` and `profile-final.json` rather than asserting a
precise browser speed-up from them.

Final gates after the last geometry change all exited **0**:

- `pnpm check`: 1,096 files, **0 errors / 0 warnings**, four existing hints;
  the subsequent `tsc --noEmit` also passed.
- `pnpm validate`: **94 topics, 0 errors / 0 warnings**.
- `pnpm run test --maxWorkers=2`: the full `pnpm test` suite, **252 files /
  6,348 tests passed**. Two workers avoid the known concurrent-load timeouts.
- `pnpm build`: **191 pages**, static data and PWA completed. Built GLB bytes
  match the source asset.
- `git diff --check`: clean. No git writes, browser/desktop actions, dependency
  changes, shared-kit changes or edits outside the cells ownership scope.

Final logs: `/private/tmp/atlas-cells-round3/{check,validate,test,build}-final.log`.
The three remaining GLB label endpoints and real browser-ready A/B are the
explicit outstanding items; they are not hidden by the successful static gates.

### Claude acceptance 2026-11-03 (round 3)

- GPU browser shots, same angle as `2a98d7b`: cytoplasm leaders now land in the gel; mitochondria read orange with cristae; microscope, cells and onion detail unchanged. Membrane / cell-wall leaders still end at the bounds centre (on or next to the nucleus / vacuole) until the engine reads a GLB label point.
- Fixed in acceptance: `onion-patch` joins `views.hudFrame.parts` so compare beat 5 no longer slides it under the reading panel; systems beats 1/3/4/5 use a closer whole-plate camera (`[0.08,0.235,0.92]` → `[0.08,0.105,0]`); the leaf beat hides the onion patch so its own camera is not pulled back.
- Stage ready (`__atlas.ready`, GPU, 4 interleaved loads each): main 999 ms, `2a98d7b` 1039 ms, round 3 1078 ms (medians). No regression is visible at this measure.

## Polish 2026-11-03 — group B leftover verification

Verified against the current production data on 2026-11-05 before changing
anything. Both requested content fixes are already present in this checkout:

1. **40× visibility.** Beats **01.4, 05.3 and 06.3** use objective 40,
   its indexed `scope-high` pose, the `scope-stage-close` camera and a
   `scope-objective-forty` leader. The long blue-ring barrel, nose and positive
   coverslip clearance are visible below the nosepiece, rather than behind it.
   Closest-hit rays from each actual authored camera hit that objective at its
   leader endpoint. Inspected CPU depth-buffered close-ups in paper and cinema,
   plus whole/front/stage/eyepiece/knob views; no additional rotation, geometry
   or camera change is necessary.
2. **Highlighted parts and labels.** Audited all **40 beats**: each of their
   **36 non-null selected parts** has its own requested leader and an entry in
   the chapter index; every requested leader target is also indexed. Existing
   tests cover revealing every indexed part in a visible beat. The content
   regression now explicitly checks selected-part leaders, index access and
   visibility, so future edits cannot quietly omit a highlighted object.
   The preview exporter now includes all forty authored cameras and uses the
   production GLB's node-local `extras.labelPoint` transformed before
   dequantisation, matching the live loader instead of drawing obsolete
   bounds-centre endpoints. The projection test uses those same real anchors.

References: the existing S6/S7/S21 microscope handling/parts references and
S20 authored optical layout, plus the current generated parts, indexed poses,
chapter captions and the production GLB. No external asset or runtime request
was added. All 29 IDs, objective counts, lens powers, teaching numbers,
EN/ZH text, eight chapters and forty beats are unchanged.

Decoded triangles before → after: **166,390 → 166,390** across every group;
animal **37,046**, plant **44,814**, microscope **49,908**, tissue/context
**34,622**, all unchanged. The highest authored beat is **116,482** triangles.
No model or material was rebuilt in this verification pass.

Offline previews: `/private/tmp/atlas-cells-group-b/verified/` contains
`beat-00-1-labels.png` through `beat-07-5-labels.png`, eight chapter contact
sheets, six microscope angles/close-ups and paper/cinema close-ups of the
three named 40× beats. All chapter contact sheets and the named-lens close-ups
were actually inspected. The old anchor exporter baseline is in `../before/`.
These are CPU geometry/anchor checks; the browser's final HUD solver remains
for Claude acceptance under the explicit no-browser task boundary.

Topic checks: **27/27 tests across four cells test files passed** with
`pnpm exec vitest run --configLoader runner` (the runner avoids Vite's bundled
config temp directory outside this writable worktree). Root session owns the
full-project gates. No requested cells fix remains open.

### Combined group B gates · run 2026-11-05

- `pnpm check`: PASS, 0 errors / 0 warnings, 5 existing unused-code hints.
- `pnpm validate`: PASS, 94 topics, 0 errors / 0 warnings.
- `pnpm build`: PASS, 191 pages and PWA generation; the full built-topic JavaScript budget test passes.
- **`pnpm test`: NOT GREEN** — 275 suites / 6,527 tests pass; one untouched `tests/space-scene/living-things-toad-skin.test.ts` geometry test exceeds its existing 5,000 ms limit. Repeated with default workers, two workers, and alone: the same timeout is the only failure. The isolated test passes both assertions/tests with a diagnostic 30,000 ms command-line limit (13.08 s test time); no foreign source, assertion or stored timeout was changed. That diagnostic is not presented as a passing standard gate. The permitted four-topic implementation and regression suites pass. Fixing the unrelated test's timing contract is outside this task's ownership.

Logs: `/tmp/atlas-group-b-{check-final,validate,build,test-isolated,test-workers2,toad-isolated,toad-diagnostic}.log`. All inspected CPU previews are linked from `/tmp/atlas-group-b/index.md`. No browser, desktop, e2e or GPU pass was run. No git write or package/lockfile edit was performed. An ephemeral local dependency-cache wrapper allowed the gates to run without writing through the pre-existing read-only `node_modules` symlink; the original symlink was restored afterwards.

### Claude acceptance · 2026-11-05 (browser, GPU)

40× objective visible and labelled in 01.4, 05.3 and 06.3 (paper and cinema). `pnpm shoot cells --beats` found one remaining unlabelled highlight: the chapter-00 view selects and labels `leaf-context`, but the HUD framing left the leaf under the left column, so its label was dropped. `leaf-context` is now in `views.hudFrame.parts` (generator and parts.json), and the rerun lists no unlabelled highlight in any chapter or beat.
