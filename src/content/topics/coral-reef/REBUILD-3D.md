# Coral reef · 3D rebuild record

## Polish 2026-11-03

The assigned quadrat, coral anatomy/colonies, food-web stage arrows, small-screen framing check and two illustration encodings are complete. Geometry is original Atlas code; no external mesh or runtime network asset was introduced. References and licence details are in [data/SOURCES.md](data/SOURCES.md) and [the geometry reference record](../../../../scripts/geo/coral-reef/REFERENCES.md).

### Changes and references

1. **Monitoring quadrat.** Replaced the Catmull-Rom oval with a nominal **1 m × 1 m** square PVC centreline, 25 mm tube outside diameter, four short-radius elbows and eight socket collars. Four strings in each direction divide it into a 5 × 5 grid. The outside dimension is 1.025 m; the side is explicitly a design example, not measured survey equipment. The larger frame now sits beside, rather than overlapping, the nursery. Evidence/conservation camera targets and distance were adjusted to contain both. NOAA's monitoring booklet supports square, commonly one-metre quadrats; the precise model specification remains S50 DESIGN.
2. **Polyp.** Retained twelve simple tentacles and twenty-four schematic septa. Tentacles now taper strongly, vary in lean, reach and curl, and have subtle surface swellings. A scalloped soft wall and oral disc lead to a raised cone and a genuine slit-shaped recessed mouth. The aperture conforms to the lips; there is one opening, with no uncovered side gaps. A thin fluted theca surrounds alternating longer/shorter serrated septa that follow the bowl floor and are visible at the rim and in cutaway. Septa have both faces and closed edges, and the floor is closed. The enlarged partner markers were moved into the reshaped tissue wall; tests raycast every marker vertex against its actual inner and outer mesh. NOAA Coral Basics and CDHC skeletal anatomy supplied the topology/morphology reference.
3. **Colonies and branching fragments.** Replaced smooth boulder and web-coral domes with irregular, fully tessellated massive forms: recessed, varied calices, raised walls and radial septal relief. The separate living-tissue layer follows the same relief instead of covering it with a smooth dome. Fine ribs conform to the curved surface and terminate at the colony base. The foliose colony now has gently cupped, scalloped plates and growth ridges. All three nursery fragments have asymmetric, smoothly fused forks, tapered branches, radial corallites and open axial tip cups. Their support is an open welded rack with hollow members and individual ties; its crossbars align directly beneath all three tied fragments. The parrotfish geometry was preserved.
4. **1024 × 768 framing.** The existing HUD-room solver already folds legends → card → metadata → left column and retains an open reader. The topic regression reproduces a **532 × 588 px** free model band (52.0% width, 76.6% height). Persisted manual choices intentionally override automatic defaults. A numerical comparison of the full `hudFrame.parts` set against just the six web specimens produces the same fitted web camera: the separated study platforms are outside the authored frustum. Thus the food-web cameras/framing list were retained; no engine, CSS or HUD code was edited. This is solver/data verification, not a browser screenshot claim.
5. **Stage food arrows.** Added four contextual shaft/head annotations in `feeding-flows`, visible in chapters 04/05 while paused as well as running. Each is bound to the same `active-e-*` output as its food-web edge, including indirect support loss after phytoplankton removal. Cone tips are tested against source-to-consumer endpoints. Existing particle flows remain available for the running beat. The four annotations are context-only: **26 selectable parts, their IDs, six food-web nodes, four relationships, eight chapters and 39 beats remain unchanged**. Total entries change from 28 to 32 solely because four diagram annotations join the two existing context objects.
6. **Illustrations.** Re-encoded directly from approved PNG originals with unchanged 1200 × 900 framing and byte-identical decoded alpha. Polyp: **126,140 → 122,860 bytes** (q54); zones: **127,842 → 122,466 bytes** (q51). Both meet the 122,880-byte figure budget. Original/previous/final full images and 2× detail crops were inspected; pencil contours, stippling and hatching show no visible loss. The processor and provenance record reproduce the result without cascading a lossy WebP.

### Text and behaviour

Minimal EN/ZH part-detail edits describe the slit mouth, pitted massive form, three branching nursery fragments, and nominal one-metre square. Biological sample counts and teaching numbers are retained; no species or surveyed instrument is claimed. The existing shell flags, zero-distance exploded behaviour, clip flags, twelve-tentacle oscillation target/pivot, simulation controls, rows, outputs and food/evidence semantics remain. Four new bindings affect only diagram-arrow visibility. Chapter layers suppress these annotations outside the two food-web chapters.

### Build and verification

Run from the repository root:

```sh
python3 scripts/geo/coral-reef/build-model.py
pnpm tsx scripts/geo/coral-reef/inspect-geometry.ts polish-final
```

The Python sculpt uses NumPy/scikit-image at build time; the final stage consumes only the local GLB and ordinary topic data. `finish-mesh.ts` welds/merges repeated static detail and applies meshoptimizer error-bounded simplification, keeping submillimetre surface error on these models. Tiny tissue/sediment markers use size-appropriate 8–12-sided lathe surfaces rather than 2,976-triangle spheres. Repeated corallite detail is baked per material/part, with no per-cup runtime object or draw call. Straight rack members use hollow 20-sided sweeps with four length segments.

The GLB follows the current schema's required flat path `public/models/coral-reef.glb` (topic-owned filename); its licence is embedded in `asset.copyright`. No shared schema/path rule or other topic asset was changed.

### Remaining acceptance

No assigned content item is deferred. Browser/GPU material, HUD screenshot, keyboard and presentation acceptance remain for the following Claude browser review, as explicitly required by the task's no-browser constraint. CPU previews do not establish GPU FPS, real draw calls or measured DOM layout. No browser or desktop was launched/driven, and no git writes were performed.

### Geometry counts and offline inspection

Counts include every indexed triangle and repeated primitive instance. The total includes **all** separated study platforms, even when offscreen: **299,124 → 348,182 triangles**, 39 → 42 material/geometry pieces. The largest authored study plus its arrows is **107,948 → 111,772 triangles**. Thus even the aggregate stays below 350,000; the maximum normal on-stage study is much lower. The final local GLB contains 207,066 triangles; procedural geometry contributes 141,116. These are CPU geometry counts, not GPU FPS or shadow-pass draw measurements.

| Part | Before | After |
|---|---:|---:|
| `monitoring-quadrat` | 3,168 | 19,840 |
| `polyp-tissue` | 2,000 | 3,372 |
| `polyp-mouth` | 576 | 490 |
| `polyp-tentacles` | 10,368 | 28,800 |
| `polyp-skeleton` | 2,160 | 5,402 |
| `polyp-symbionts` | 89,280 | 5,760 |
| `colony-boulder` | 7,760 | 45,016 |
| `colony-tissue` | 560 | 44,878 |
| `colony-sheet` | 4,952 | 17,150 |
| `web-coral` | 3,760 | 44,952 |
| `nursery-frame` | 1,392 | 5,744 |
| `nursery-fragments` | 2,640 | 45,806 |
| `water-haze` | 95,232 | 4,096 |
| Four context food arrows | 0 | 1,600 |

Final group totals: reef 109,000; polyp 47,388; web specimens 110,172; evidence 80,022; arrows 1,600. All six named preset projections have no neighbouring-stage intrusion. Part bounds, positions and normals are finite. Optimized close-ups were actually inspected and iterated: the first septal model had incorrect side winding and overshot the cup; this was repaired. Fine colony septal teeth initially used tangent planes and extended beyond the equator; they now conform to the displaced surface and end at the base. A circular oral aperture initially left crescents beside the slit lips; the final aperture is conforming.

Previews (offline CPU depth buffer with smooth interpolated normals):

- `/private/tmp/coral-reef-model-qa/polish-final-*.png` — complete preset set, skeleton top/angle, nursery, branching, shelf and quadrat top/angle.
- `/private/tmp/coral-reef-model-qa/polish-mouth-polyp-{top,side,cutaway}.png` — final single-mouth correction.
- `/private/tmp/coral-reef-model-qa/polish-markers-polyp-top.png` — final tissue-marker surface normals (same dimensions and counts).
- `/private/tmp/coral-reef-model-qa/polish-surface-final-{boulder,reef,web}.png` — final attached calice relief and continuous colony base.
- `/private/tmp/coral-reef-model-qa/polish-nursery-{nursery,branching}.png` — final crossbar/support alignment.
- `/tmp/atlas-coral-art/{polyp,zones}-comparison-{full,closeup}.png` — original/previous/final illustration comparisons.

Final numerical evidence, merged camera checks, per-part counts, bounds and asset hash are retained in `authoring/geometry-review.json`.

### Final gates

- `pnpm check` — green, 0 errors (4 existing hints); a subsequent `pnpm exec tsc --noEmit` also passed after correcting the test GLB reader for interleaved vertex attributes.
- `pnpm validate` — green, 94 topics, 0 errors / 0 warnings; repeated by the final build.
- `pnpm run test --maxWorkers=1 --testTimeout=60000 --hookTimeout=60000` — green, **250 files / 6,343 tests**. The single worker avoids the sandbox contention that caused unrelated timing assertions to fail during concurrent earlier runs; no benchmark assertion was changed or skipped. After the final crossbar alignment, all **409 coral-reef tests** were rerun and passed.
- `pnpm build` — green, 191 pages; final built GLB hash matches the source asset, and the built topic JSON contains the aligned nursery crossbars.
- `git diff --check` — clean. No git write, browser, desktop or package-manifest action was performed.

### Claude acceptance 2026-11-03

- Browser beat shots (EN paper, 39 beats) compared with main. Stage food arrows confirmed on screen in chapters 04/05, in presentation and in the paused chapter view; they drop out correctly when phytoplankton is removed. 1024 × 768 chapter-04 view with reader open: the web fills the free band, all four arrows visible.
- Fixed: the twelve tentacle tips folded back into hooks (shepherd's-crook silhouette in every polyp beat). Each tentacle is now seven evenly spaced points on one smooth arc that rises from the oral disc and leans outward to a blunt tip (tip radius 0.0040); the tip keeps the previous outer reach/height so the polyp part bounds stay put. Triangle counts unchanged.
- Note for the engine: a first arc version whose tips sat 0.03 lower flipped the `views.hudFrame` presentation fit for chapters 01/03/06 into a wide pull-back showing the reef shelf (reproducible); restoring the tip bounds restored the close framing. The fit is sensitive to small subject-box changes.
- Illustration re-encodes checked at 2× crops: no visible loss. `figures/coral-reef-polyp.webp` is still used in chapter 01 (docs/69 grade D, not redone here).

## Polish 2026-11-03 — round 2

### Completed items and references

1. **Hard-coral polyp and the mouth beat.** Replaced the long spike silhouettes with twelve short, inflated, smoothly tapered fingers in two staggered sixfold cycles. Tips round off continuously without hooks. The continuous skin carries irregularly spaced and sized nematocyst-battery swellings, rather than separate bead objects. A softly raised oral disc surrounds a recessed, rounded oval throat; the ends are elliptical, not pointed like a cat's eye. The disc is the attachment sheet of the opaque tentacle crown, while the separate column remains translucent. Twenty-four alternating septa now project above a scalloped, fluted theca, with exterior costae and irregular growth bands. The mouth beat has its own elevated camera and retains both mouth and tentacle labels. A regression raycast confirms the mouth is the first opaque hit from the HUD-fitted desktop and tablet cameras. NOAA Coral Basics, Polyps up close and CDHC skeletal anatomy were re-read, and the two local NOAA photographs re-inspected.
2. **Reef shelf and markers.** Replaced all three plain extruded zone blocks with portions of one continuous eroded limestone isosurface: relief, fused skeletal rubble, dissolution pockets, irregular front/back/bottom edges and an actual through shelter cavity. Adjacent zones share their seam coordinates. Sand deposits occupy sheltered hollows and carry subtle ripples. The flat yellow chip was `colony-encrusting`: it is now an attached, irregular living crust with recessed calices, raised walls and small septal stars, plus smaller nearby crusts. The selectable shelter lip follows the tunnel entrance. The separate `light-marker` also becomes a bevelled index arrow, preserving its vertical index binding rather than resembling a ball and stick or a field sensor. NOAA skeletal references and the existing NUS hard-coral gallery (S21) informed morphology; the terrain remains S50 DESIGN, without geographic claims.
3. **Foliose colony.** Built overlapping rising whorls with asymmetric scalloped margins, growth ridges and a lobed, curved attachment that ends within the upper plate. Each sheet has thickness, an underside, and sealed inner, outer and angular boundaries with outward winding. A shipped-mesh edge audit finds no open edges. Top, oblique and underside CPU views were inspected; the old transparent rim gaps are closed.
4. **Beat framing.** Chapter 02 now separately frames the flat, crest, slope and light comparison; chapter 03 separately frames the feeding crown, mouth, colony-form comparison, shelter and larva. Per-beat visibility removes unrelated local specimens where necessary. All named target stages remain available, as verified by the existing reachability test. The mouth and other polyp views use front/top-plane directions. Offline reproduction showed that a sideways camera direction can put a distant study platform across the eye plane, forcing the existing fitter to pull far back; these authored directions remove that instability. The named polyp preset and chapter 06 base camera were updated for the changed bounds. Every chapter base and every beat was re-fitted with the shared HUD functions in desktop, landscape-tablet and presentation fixtures. No engine, framing, widget or CSS file was changed.

### Facts, text and behaviour

The **26 selectable parts / 32 total entries, twelve tentacles, twenty-four schematic septa, eight chapters, 39 beats, six food-web nodes and four relationships** are preserved. Minimal EN/ZH edits describe short rounded tentacles and enlarged surface batteries, rounded oval lips, the encrusting crust and sand pockets. Chapter 01's twelve-tentacle note now says short/rounded rather than smooth. Species, measurements, chapter identities and teaching numbers are unchanged. The original simulation controls, rows, outputs, bindings, shell/clip flags, three-degree crown sway, cutaway, zero-distance explode and evidence-state visibility remain. The oral disc follows the crown sway; the separate mouth stays at the centre.

### Geometry budget and reproduction

The aggregate includes every separated study, every context object and every repeated primitive, including offscreen geometry: **348,182 → 348,310 triangles**, with **42 geometry/material pieces → 42**. It remains below 350,000 even before offscreen culling. Largest complete study: **111,772 → 136,434 triangles** (the new reef shelf); the food-web study including arrows is 104,344. The final GLB contains 242,450 triangles and procedural parts contribute 105,860.

Savings come from size-appropriate colony surface sampling, replacing dense tentacle sweeps with continuous sculpted surfaces, a lighter index pointer, 24-sided tiny quadrat collars, and separately error-bounded limestone simplification. The colony calices and biological sample counts remain; no repeated detail creates a per-bump or per-calice runtime object. Terrain seam borders are locked. These are architecture counts, not measured GPU FPS, shadow-pass triangles or live draw calls.

| Changed part | Before | Round 2 |
|---|---:|---:|
| `reef-flat` | 160 | 9,399 |
| `reef-crest` | 28 | 6,563 |
| `reef-slope` | 32 | 8,036 |
| `colony-boulder` | 45,016 | 37,580 |
| `colony-sheet` | 17,150 | 23,606 |
| `colony-encrusting` | 124 | 8,558 |
| `polyp-tissue` | 3,372 | 2,852 |
| `polyp-mouth` | 490 | 680 |
| `polyp-tentacles` | 28,800 | 12,136 |
| `polyp-skeleton` | 5,402 | 7,018 |
| `web-coral` | 44,952 | 37,524 |
| `light-marker` | 3,840 | 108 |
| `monitoring-quadrat` | 19,840 | 19,072 |
| `colony-tissue` | 44,878 | 37,498 |
| `refuge-cavity` | 1,024 | 516 |
| `substrate-context` | 588 | 4,678 |

Final group totals: reef-habitat 136,434, polyp-closeup 32,010, web-specimens 102,744, evidence-tools 75,522, feeding-flows 1,600.

```sh
python3 scripts/geo/coral-reef/build-model.py
pnpm tsx scripts/geo/coral-reef/inspect-geometry.ts round2-final
pnpm tsx scripts/geo/coral-reef/summarize-qa.ts round2-final
```

The build also runs `author-views.ts`; all chapter cameras/visibility are reproducible. Compact counts, bounds, all fitted cameras, subject projections and the asset SHA-256 are retained in `authoring/geometry-review-round2.json`.

### Offline visual review and remaining acceptance

Previews are in `/private/tmp/coral-reef-model-qa/round2-final-*.png`: six presets; polyp top/side/cutaway and skeleton close-ups; the shelf; sheet top/oblique/underside; and all **47 states × 3 layout fixtures**. Chapter contact sheets use `round2-final-contact-ch00-hud.png` through `ch07-hud.png`, with matching `tablet` and `present` sheets. They render the actual finished GLB and engine primitive geometry with a CPU depth buffer and smooth interpolated normals, preserving each fixture's aspect ratio. Individual details and chapter sheets were actually opened and inspected. The first mouth view pulled back too far, an early foliose version exposed its attachment stump, and a differently coloured triangle-subset cave rim showed a sawtooth border; those were corrected and re-rendered.

No assigned item is deferred. Live browser/GPU materials, measured DOM label layout and interaction acceptance remain for the following Claude acceptance pass under the explicit no-browser instruction. No browser/desktop was opened or driven; no git or package-manifest write was performed.

### Round 2 gates

- `pnpm check` — green, 0 errors / 0 warnings; four existing unrelated hints.
- `pnpm validate` — green, 94 topics, 0 errors / 0 warnings; also rerun by the final build.
- `pnpm run test --maxWorkers=1 --testTimeout=60000 --hookTimeout=60000 --reporter=dot` — green, **250 files / 6,345 tests**. The final topic geometry was separately rerun: **411 tests passed**, including closed foliose edges, rounded twelve-finger proportions, contained algal markers, mouth visibility and minimum subject size after desktop/tablet HUD fitting, the aggregate 350k cap, food/evidence semantics and all named preset target stages.
- `pnpm build` — green, 191 pages. Built/source GLB hashes match; the current asset hash is retained in the round-2 geometry audit.
- `git diff --check` — clean. No browser, desktop, git-write, package-manifest or shared-engine action.

### Claude acceptance 2026-11-03 (round 2)

- GPU browser shots, en/paper all 39 beats plus a cinema chapter view. Polyp: twelve short rounded fingers in two cycles with small battery swellings, raised oral disc with a recessed oval mouth (labelled in ch01 beat 2 and ch03 beat 2), fluted corallite with radiating septa visible in the cut and the dead-skeleton beat. Foliose whorls are closed. The encrusting crust has recessed calices and the light marker is an arrow.
- Framing: every polyp, zone, colony, shelter, larva and light beat is framed on its subject in presentation mode at normal load. A run at load average 60–130 showed stage-wide pull-backs in ch01/02/03/06. They were not reproducible at load 5–9 with the same build, so they come from the HUD measurement timing, not from the authored cameras.
- Open: in the ch01 and ch06 chapter (HUD) views the `polyp-tissue` label has no placard. Its bounds-centre anchor sits inside the opaque cup, under the oral disc. The limestone shelf's horizontal ridges are very regular, which reads as banding. The zone blocks show flat cut side walls when they are isolated.

### Round 3 (2026-11-03): the three open items

- `polyp-tissue` label: the glb node now carries `extras.labelPoint` (new generic engine support), the middle of a vertical mesh edge on the outer column above the cup rim, between two front tentacles. The placard shows in the ch01 and ch06 chapter views; a test checks the point lies above the rim and is the first tissue surface on the line of sight from both chapter cameras, with no cup, tentacle or mouth in the way.
- Shelf relief: the periodic `sin` terms that made horizontal bands on the front, back and end faces are replaced by deterministic smooth value noise (fBm), and the fine pitting is isotropic. The top surface (`reef_height`) is unchanged, so colonies, crust and sand stay seated.
- Isolated zones: each zone is closed by marching cubes of the shared rock field limited by an irregular fracture surface, so an isolated zone shows a broken rock face, not a flat wall or an open seam. Neighbours overlap by one cell each, which hides the rounded crease where a fracture face meets the outer rock when assembled. Zone bounds move by at most 0.03 m; terrain simplification is ratio 0.17 / error 0.0018, keeping the topic below its baseline triangle total (still under 350k).

## Polish 2026-11-03 — group A leftover verification

Verified against incoming code rather than replacing completed work:

- **Presentation arrows already fixed:** four physical food-direction parts live in the `feeding-flows` layer, independently of the hidden food-web card. Existing bindings keep their direction and presence consistent with the active paths while motion is paused. The current EN/ZH arrow captions are accurate. CPU presentation/tablet views were inspected with the partner-to-coral arrow present.
- **1024×768 already fixed:** existing `views.hudFrame` names all selectable subjects and the shared HUD solver folds the card before preserving the stage band. The existing topic regression verifies this resolution. A trial layer reduction was rejected by the named-view regression and fully reverted: every named study remains available from every chapter/beat. No engine, camera source or widget change.
- **§9 illustration overages already fixed:** polyp **122,860 B**, reef zones **122,466 B**, both below **122,880 B / 120 KiB**; no recompression or asset edit needed.
- **Counts unchanged:** **348,208 → 348,208** total triangles (all independent studies, before offscreen culling); 26 selectable parts / 32 total entries, 12 tentacles, 24 schematic septa, six web nodes and four relationships retained. This is a CPU inventory, not GPU draw-pass/FPS measurement.
- **References/QA:** existing NOAA and topic source records; actual geometry, arrow bindings and authored bilingual captions. Inspected `/tmp/atlas-group-a/after/coral-tablet/` and `after/coral-present/`. Explicit CPU HUD fixtures are not live DOM measurements. No requested open code fix remains; the subsequent Claude pass performs browser acceptance as instructed.

## Fix 2026-11-09

- **Presentation arrows:** verified the incoming rebuild already supplies four stage arrows in `feeding-flows`, including while particles are paused. All four follow the food-web bindings, so the existing EN/ZH arrow captions remain correct in presentation mode. No caption edit was required.
- **1024×768:** verified the incoming topic's complete subject list and existing HUD-room folding regression. Inspected the tablet fixture and presentation at 1024×768, including cinema. The web specimens and their arrows remain within the free band; no engine, camera rig, widget or stylesheet was changed.
- **§9 figure overages:** already fixed. Polyp **122,860 B**, zones **122,466 B**, both below 122,880 B; no further image generation/recompression.
- **Asset budget:** encoded the previously uncompressed stage GLB with meshopt, 16-bit positions and the existing high-level normal filter: **5,581,076 → 1,403,368 B**. No triangle was removed. The node-local tissue leader point is explicitly remapped through world space when quantisation changes its node transform. Updated CPU inspection and tests decode the actual distributed packet before anatomical/raycast assertions. `finish-mesh.ts` now applies this codec after generation.
- **Counts/facts:** **348,208 → 348,208** complete/maximum conservative authored triangles; **32 → 32 entries, 26 selectable**; six web nodes, four relationships, twelve tentacles and 24 schematic septa unchanged. Part IDs, poses, simulation tables and bilingual labels remain unchanged.
- **References:** existing NOAA/CDHC/source records and incoming rebuild; no new biological claim or third-party asset. Quantisation/compression is a delivery parameter.
- **Visual review:** actually inspected `/tmp/atlas-group-a/fix-2026-11-09/coral-tablet/`, `coral-present/`, `coral-cinema/`; decoded polyp inspection under `/private/tmp/coral-reef-model-qa/fix-2026-11-09-*`. Studio/ACES CPU previews reproduce the engine's lighting inputs; PMREM specular, finish textures, shadows, actual DOM layout and GPU timing are not simulated. No browser or desktop action.
- **Not done:** no assigned content/code item deferred; live GPU/browser acceptance belongs to the following Claude review.

### Final gates · 2026-11-09

- `pnpm check`: green, 0 errors / 0 warnings (five existing unrelated hints); frozen-source `pnpm exec tsc --noEmit` also exits 0.
- `pnpm validate`: green, 94 topics, 0 errors / 0 warnings.
- `pnpm run test --config /tmp/atlas-group-a/vitest-worktree.config.mts --maxWorkers=2 --testTimeout=60000 --hookTimeout=60000`: green, **275 files / 6,527 assertions**. The temporary config preserves the project's test include pattern and node environment; it only allows Vite to read the shared dependency path `/Users/gavin/work/atlas/node_modules`. The plain-config run passed 6,499 assertions but could not load the unrelated solar-system suite because that shared path was outside Vite's default read allowlist. No suite or assertion was skipped/changed to bypass that environment failure, and no project/global config was edited.
- `pnpm build`: green, **191 static pages**. All four active source GLBs are byte-identical to their built copies and below 1,500,000 B. `git diff --check` clean.
- Final identity audit against HEAD: same ordered part IDs/context flags, selectable counts, simulation tables and poses in all four topics. No shared engine/widget/framing/style, other topic, package/lockfile, review-queue, git-write, browser or desktop action.

Logs: `/tmp/atlas-group-a/{check-2026-11-09,validate-2026-11-09,test-worktree-2026-11-09,build-2026-11-09}.log`. Final studio/ACES previews: `/tmp/atlas-group-a/fix-2026-11-09/`. These CPU fixtures are the requested offline evidence; live browser/GPU acceptance remains for the following review.
