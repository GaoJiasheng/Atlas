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
