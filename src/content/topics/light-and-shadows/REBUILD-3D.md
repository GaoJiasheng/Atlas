# Light and Shadows — 3D rebuild

## Rebuild 2026-11-05

Implemented 2026-11-09 in the isolated light/materials worktree. Read CLAUDE.md, docs/08, docs/68 and review-machines, both modelling/data runbooks and master-spec/rounds/perf-lessons/fact-discipline. This topic had no existing REVIEW.md, FIXES.md or REBUILD-3D.md. Reviewed living-things, eyes-and-ears, cells and fossil mesh/preview pipelines. No engine, framing, browser, package or git mutations.

### Scope and topology

- `courtyard`: replaced the bare grey disc with an original baked mesh: clipped 500 mm square paving, 8 mm mortar gaps, actual 2 mm edge arrises, a recessed concrete bed and a smooth circular outer edge. It retains an exactly level 11 m shadow receiver at y=.05. A single meshopt node and one draw call.
- `pole`: continuous 96-segment wooden shaft with an eased end; cast weighted foot, hollow socket, radial pinch screw, handwheel and three seated hex fasteners. Shaft diameter remains 5 cm and its top remains 1 m above the receiving paving, not 1 m above the socket.
- `north-arrow`: north arrow plus inlaid meridian and curved two-course perimeter with capstones and entry. Perimeter is intentionally owned by this existing assembly rather than the ground receiver: the ACTUAL ShadowCast component uses the receiver's highest vertex to choose the shadow plane. Bundling the parapet with `courtyard` would silently shorten every shadow. No new selectable IDs or counts.
- Retained all 35 IDs, all groups, chapter/beat references, presets, source heights, Sun radii, all sim controls/bindings/overlays and teaching outputs. The whole-model optical-bench sweep retained the already credible torch, track, screens, tin rolled rims, cards, dark box and instruments. Functional cards/screens are genuinely flat objects; the Sun and paths are explicitly explanatory diagram geometry, not planet reconstructions.
- Minimal EN/ZH inspector corrections: concrete patch → paved court with low perimeter; pole top measured from paving and socket identified; north arrow described as an inlay. No numeric teaching claim changed.

### References (2–4 per hero)

R1 Basile Morin, Singapore paving/court context, CC BY-SA 4.0: https://commons.wikimedia.org/wiki/File:Sundial_Garden_in_Singapore_Botanic_Gardens.jpg

R2 Graham Horn, circular ground installation and gnomon socket, CC BY-SA 2.0: https://commons.wikimedia.org/wiki/File:Sundial_at_Epwell_village_green_-_geograph.org.uk_-_449049.jpg

R3 Joachim Bäcker, meridian/gnomon plan, CC BY-SA 3.0: https://commons.wikimedia.org/wiki/File:Nordfinden.jpg

R4 Aubry Gérard, published shadow-tip plan drawing, CC BY-SA 4.0: https://commons.wikimedia.org/wiki/File:Gnomon_projection_plane.png

R5 IFG, real 1 m wooden rod on a school courtyard; rights retained, internal reference only: https://ifg.edu.br/ultimas-noticias-campus-goiania/12276-estudantes-revivem-experimento-de-eratostenes-no-patio-do-campus-goiania

Hero sets: courtyard R1/R2/R3; pole R2/R4/R5; north-marker/perimeter R1/R2/R3. SOURCES.md records authors, licences, exact use and asset provenance. No reference is embedded in runtime content.

### Offline visual acceptance and actual looks

Command: `pnpm tsx scripts/geo/light-and-shadows/build-parts.ts`; `pnpm tsx scripts/geo/light-and-shadows/preview.ts final`. New shared `scripts/geo/kits/rebuild-studio.ts` uses actual engine `partPieces`/material resolution, the fossils CPU RoomEnvironment/GGX/ACES implementation, exposure and all three lights + hemisphere from `Lighting.tsx`. A source assertion compares that actual renderer component to the CPU rig. The final GLB is decoded/dequantized for preview (not substituted by its cylinder proxy). Source-surface roughness .88, linear vertex colour and environment intensity are respected. A preview of the analytic shadow uses the actual sim `sun-at` vector and engine `projectShadow`, projected from the actual pole vertices.

These are numerical CPU acceptance images, not GPU screenshots. PMREM convolution is sampled; GPU normal/roughness texture variation, transparent sorting, contact shadows and analytic-shadow edge feathering are not pixel identical. No browser was launched.

1. **Look 1**, inspected `round1/threequarter-paper-comparison`, `detail-paper-comparison`, and `front-cinema-comparison`: paving was nearly white under ACES, the wall was a single continuous band, and fasteners were buried flush with the foot. Changed receiver tint to the technical-plate neutral, split the perimeter into two physically separated courses, raised bolt heads to seat visibly, and removed theme-reversing ink tints from physical dark powder coatings.
2. **Look 2**, inspected `round2/threequarter-paper-comparison` and `detail-paper-comparison`: joints and socket now read in relief, but a courtyard about shadows without its analytic shadow was incomplete evidence. Added projection of the actual shaft/foot using the unchanged Sun-model value (8 am, 20 October); no runtime mechanism changed. Matched the mesh surface's actual roughness, rather than the proxy's inherited value.
3. **Look 3**, inspected `round3/threequarter-paper-comparison` and `detail-cinema-comparison`: overlapping projected triangles produced stippling in the CPU shadow preview; upward/downward normals and repeated alpha blends were the cause. Set receiver-normal shading and one alpha contribution per covered pixel, while retaining the original projected triangles. Added full-pole comparison to the actual photographed IFG wooden rod. Final sheets were inspected again.
4. **Final fitting look**: replaced the plain thumb-disc rim with an actual six-lobed grip extrusion; seated the wooden shaft on the blind socket floor (rather than inside its solid base), and extended the perimeter foundation to ground so it cannot float outside the paving edge. Added an actual-geometry contact-height regression and regenerated final sheets. EN and ZH inspector text were regenerated together.

Evidence directory: `/Users/gavin/work/atlas-q-light-materials/scripts/geo/light-and-shadows/evidence/`. Front, three-quarter, profile, plan, full-pole front/profile/three-quarter and foot detail in paper and cinema, with model | real reference sheets. Source photographs establish material/structure and approximate comparable views. **Exact four-angle photographic registration is not claimed**: S1 is an original generic 11 m Singapore teaching court, not a photographed real installation, and the sources do not supply a four-view set of that same object. The source's clock lines, garden ponds and latitude are not copied to fabricate a match. This is a remaining evidence limitation for GPU acceptance.

### Per-part self-grades (docs/68: A credible, B polish, C crude)

A is the author assessment pending GPU acceptance; it is not a claim of pixel identity. Natural-looking geometry is not relevant to these manufactured fixtures.

| Part | Grade | Triangles before → after | Estimated mesh calls before → after | Assessment |
|---|---|---:|---:|---|
| `torch` | A | 2,604 → 2,604 | 4 → 4 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `torch-stand` | A | 2,040 → 2,040 | 3 → 3 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `track` | A | 3,768 → 3,768 | 3 → 3 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `object-holder` | A | 1,560 → 1,560 | 4 → 4 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `card-circle` | A | 576 → 576 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `card-square` | A | 12 → 12 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `card-triangle` | A | 8 → 8 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `card-circle-big` | A | 576 → 576 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `tin` | A | 1,792 → 1,792 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `cone` | A | 384 → 384 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `ball` | A | 3,840 → 3,840 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `clear-glass` | A | 588 → 588 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `frosted-glass` | A | 588 → 588 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `tracing-paper` | A | 2 → 2 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `cardboard-sheet` | A | 588 → 588 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `screen-board` | A | 588 → 588 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `screen-stand` | A | 3,720 → 3,720 | 2 → 2 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `light-sensor` | A | 10,500 → 10,500 | 2 → 2 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `datalogger` | A | 2,352 → 2,352 | 3 → 3 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `hole-card-1` | A | 1,760 → 1,760 | 4 → 4 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `hole-card-2` | A | 392 → 392 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `hole-card-3` | A | 1,760 → 1,760 | 4 → 4 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `box` | A | 3,820 → 3,820 | 2 → 2 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `box-torch` | A | 1,644 → 1,644 | 3 → 3 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `box-ball` | A | 3,840 → 3,840 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `box-mirror` | A | 972 → 972 | 3 → 3 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `box-inside` | A | 12 → 12 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `pole` | A | 864 → 4,808 | 2 → 3 | A: true 1 m / 5 cm shaft with attached weighted socket, screw and bolts. R2/R4/R5. |
| `north-arrow` | A | 312 → 6,480 | 1 → 3 | A: north meridian plus assembled curved perimeter and entry; separate from receiver. R1/R2/R3. |
| `sun` | A | 2,560 → 2,560 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `sun-path-oct` | A | 16,384 → 16,384 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `sun-path-jun` | A | 16,384 → 16,384 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `sun-path-mar` | A | 16,384 → 16,384 | 1 → 1 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |
| `courtyard` | A | 576 → 21,280 | 1 → 1 | A: real recessed tile joints and arrises; level true-size receiving plane. R1/R2/R3. |
| `bench-table` | A | 4,116 → 4,116 | 2 → 2 | A retained: credible reviewed teaching fixture or explicitly labelled diagram; geometry and function unchanged. |

### Counts, budgets and validation

Conservative all-variant source geometry: **107,866 → 138,682 triangles; 62 → 65 estimated mesh calls**. This over-counts screen/receiver options and all three date paths which are mutually exclusive. Court assembly alone: **1,752 → 32,568 triangles, 4 → 7 calls**. Before there was no topic GLB (0 bytes); after the original paving GLB is **259,776 bytes / 21,280 triangles / 1 draw**. It is far below 1.5 MB; the whole topic remains far below 350k even with all mutually exclusive choices counted. No runtime external assets or requests.

Real geometry checks decode the final GLB, measure its receiving face exactly as the renderer does, verify the one-metre actual shaft top, check the unchanged sim/IDs, and project actual tessellated geometry with the runtime Sun inputs. Existing 67 topic tests retain every teaching output.

Final gate results follow. GPU/browser acceptance and exact four-view photographic registration remain unperformed for the reasons above; no model component is knowingly below A on the docs/68 scope.

### Completed repository verification (2026-11-09)

- `pnpm validate`: 94 topics, zero errors and warnings.
- `pnpm build --config scripts/geo/light-and-shadows/qa-astro.config.mjs`: passed; 191 pages plus service worker. The topic-local config imports the unchanged project config and redirects only its writable cache.
- `pnpm exec tsc --noEmit --incremental --tsBuildInfoFile /private/tmp/atlas-light-materials.tsbuildinfo`: passed.
- `pnpm exec astro check --config scripts/geo/light-and-shadows/qa-astro.config.mjs`: passed; 1,216 files, zero errors/warnings (five pre-existing hints). Together with the TypeScript command above this is the full `pnpm check` gate with a writable cache override.
- `pnpm run test --configLoader runner --maxWorkers=2 --testTimeout=120000 --retry=1`: **passed, 278/278 files and 6,540/6,540 tests**, in 134.85 s. No unhandled errors. All numeric performance assertions and explicit per-test timeouts are unchanged.

The first standard check encountered an EPERM at the shared dependency cache, outside this worktree. The default Vitest config bundler has the same restriction, so the full-suite command uses `--configLoader runner`. Resource-heavy existing geometry tests exceeded their default five-second timeout under concurrent build/typecheck load; the clean full rerun uses two workers, a 120-second test timeout and one retry, with every explicit numeric performance assertion unchanged. No tests are removed or skipped by this rebuild. Browser/shoot/e2e checks were not run because this task expressly forbids Chromium/browser use; GPU acceptance belongs to the follow-on Claude review.

The intermediate full run had 6,538 passing tests and two existing WW2-map tests exceeding their explicit 30-second timeout during concurrent build/type checking, plus worker update timeouts. Both files were rerun alone without changing assertions: **59/59 passed in 8.19 s** (the formerly timed-out cases took 2.0 s and 2.7 s). The final full run above completed with no concurrent build/type checker.

**Final gate status: CHECK / VALIDATE / TEST / BUILD all green**, using the documented writable-cache and runner flags. `git diff --check` is clean. Final source and GLB budgets were remeasured after the last model edit; evidence sheets were refreshed with the completed shared studio renderer. No engine, package, framing, browser or git mutation was required.

## GPU acceptance 2026-11-09 (Claude)

Judged in headless Chromium on the Apple M5 Max GPU (`pnpm shoot light-and-shadows --perf --gpu`), paper and cinema. Draw calls at most 39 (ch08 courtyard 12), triangles at most 56.7k.

- Parapet: the nine bays and capstones were 34.7° on a 35° pitch, leaving 3 cm through-gaps that read as white slits (paper) and black slits (cinema). They are now 35°, closed.
- Pole: the `token:neutral` tint turned the wooden pole grey; removed, so it reads as the wooden pole the text describes.
