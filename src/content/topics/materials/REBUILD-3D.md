# Materials — Rebuild 2026-11-05

Implementation and offline visual review performed 2026-11-09 in the assigned worktree. The requested section date is retained.

The two B-grade defects in docs/68's machines review are rebuilt: the block-style cantilever clamp and the misleading wood grain on white kitchen cupboards. All 67 selectable part IDs, three context IDs, groups, chapter/beat references, seven-material counts and simulation values are preserved. The engine, framing, existing shared kits, packages and other topics were not edited.

## Geometry and material changes

- `bend-clamp`: a sampled, smoothly bevelled cast C-frame with a genuine open throat, thin web and raised continuous margins. A machined fixed jaw contacts the strip top. A 2 mm-pitch helical thread surrounds a continuous spindle; a profiled swivel pad seats against the ledge underside and a sliding tommy bar has retained end stops. The former wooden cube is replaced by a raised ledge, two open triangular braces, mounting foot and fasteners. The strip remains 15 cm above the main bench, with 5 cm held and 25 cm free, preserving the existing mechanical model and fallen pieces. It grips an actual edge of this raised test bench, rather than an imaginary top-only clamp.
- `wall-cabinet` and `counter`: opaque, smooth enamel-family laminate surfaces replace the `wood` family, including the base-cupboard body and doors. Physical light colour is the fixed technical-plate `drawing-paper` token; the procedural wood map can no longer appear on these faces. Laminate edge radii are narrower than the earlier rounded timber boards. A two-post stainless pull is attached to the wall door.
- `cabinet-hinges`: two cups now follow the real 100°-open door plane, rather than sitting at its pivot. Short solid arms connect cup and carcass mounting plate; ears and fastener heads have real relief. Counts stay at two hinges.
- Text changes are limited to EN + ZH part names/details describing the G-clamp/raised ledge and laminated wood-based cabinet boards. The cabinet remains a wood-based structural example. No teaching numbers or chapter captions changed.

All new colour choices use the existing technical-plate material families or tokens. The final cast frame uses the `powder` family's graphite colour in both themes: the third look caught that `ink-2` would turn the physical clamp cream on the dark plate, so that inappropriate text-colour tint was removed.

## Real references inspected

Three photographs for the clamp/ledge hero and three for the cabinetry hero were downloaded into `scripts/geo/materials/refs/` and visually inspected before modelling. None is loaded by the site. These are independent generic reconstruction studies, not digital replicas of the pictured household installations.

| Ref | URL | Author / licence | Matching feature |
|---|---|---|---|
| R1 | https://commons.wikimedia.org/wiki/File:G-clamp.jpg | DineshAdv; public domain | Broad cast back, open C throat, screw/pad and handle |
| R2 | https://commons.wikimedia.org/wiki/File:G-clamps.JPG | DineshAdv; CC BY-SA 3.0 | Recessed web, raised margins, thread and jaw close-up |
| R3 | https://commons.wikimedia.org/wiki/File:Clamp_bench.jpg | Stefan Powell; CC BY 2.0 | Correct load path around a bench edge |
| R4 | https://commons.wikimedia.org/wiki/File:White_kitchen_with_cabinet_doors_and_drawers_opened_or_removed_so_that_real-life_stuff_can_be_seen_in_cabinets.jpg | Kotivalo; CC BY-SA 3.0 | Smooth white cabinet surfaces and attachment of shelves/doors |
| R5 | https://commons.wikimedia.org/wiki/File:Kitchen_upper_cupboards.jpg | Kotivalo; CC BY-SA 3.0 | Laminate edges, cup hinges, two-post handle |
| R6 | https://commons.wikimedia.org/wiki/File:Kitchen_renovation_9a_laminate_on_top_of_kitchen_cabinet_base_unit_not_yet_attached.JPG | Tomwsulcer; CC0 1.0 | White base-cupboard finish and edge treatment |

The third-party photograph panels in the comparison sheets retain these licences and attributions; R2/R4/R5 cropped panels are CC BY-SA 3.0. Original procedural geometry has no third-party mesh dependency.

## Offline evidence and visual iteration

Run `pnpm tsx scripts/geo/materials/preview-studio.ts final` from the repository root. `preview-studio.ts` uses the new rebuild-studio helper, the engine's **actual** `partPieces` geometry and `resolveMaterialLook`, and fossils-and-skeletons' `studio-cpu.ts`: three directional lights, hemisphere, sampled installed RoomEnvironment, GGX, installed exposure and ACES matrices. It creates front, three-quarter, profile and characteristic-detail side-by-side sheets for each rebuilt hero. Both plate themes and whole bench/kitchen sweeps are also rendered. No browser or WebGL context is launched.

The CPU previews are lighting-matched numerical evidence, not GPU pixel identity. Finish normal maps, GPU contact shadowing and transparency sorting remain outside this renderer. The laminate regression test checks the actual material resolver, so removing wood grain is verified from the renderer's material input, not a token-file proxy.

Comparison directory: `/Users/gavin/work/atlas-q-light-materials/scripts/geo/materials/evidence/`.

| Look | What was actually visible in the sheets | Changes made after looking |
|---|---|---|
| Round 1 | C silhouette, real thread and bench-edge grip were legible. The end-on tommy bar hid its characteristic length. The cabinet looked laminated but the hinge detail camera saw a blank door face. The former hinge discs lay at the pivot rather than on the opened door. | Rotated the sliding handle into the clamp's visible plane. Rebuilt two cups on the actual open-door normal, added connecting arms/ears/screws, and moved the close-up inside the door. |
| Round 2 | Grip contact and arms read correctly. The earlier three-quarter camera looked mostly at the door exterior. Rounded board edges were too soft compared with laminate reference R5, and the door lacked the photographed raised pull. | Used the opposite three-quarter view; narrowed cabinet bevels; added an attached two-post stainless pull. Downloaded and inspected R3/R5 and cropped those real references to comparable detail scale. Pulled the end-on camera back with a longer lens so the free strip no longer dominated the profile. |
| Round 3 | All eight hero comparisons were inspected. The paper clamp, laminated edges and hinge attachments read correctly; the cinema sheet exposed an `ink-2` tint changing graphite paint to pale cream. | Removed that text-colour tint from the cast frame/supports, keeping the studio `powder` family's physical graphite. Re-rendered final paper/cinema sheets and the whole-model sweep. |
| Independent close-up review | The coordinating reviewer spotted a visible gap between hinge mounting plate and cup arm. Coordinate endpoints touched, but the direct arm passed through the solid side board and disappeared behind it. | Replaced both arms with three connected links routed inward along the plate, forward clear of the carcass edge, then across to the cup. Added engine-tessellated vertex clearance tests and a plate/link/cup contact graph at both heights. Regenerated final comparisons; front clamp isolation and reference-angle camera matching were also improved. |

The final front clamp panel isolates the actual authored hardware from the sample and ledge, matching the unmounted orientation of R1 without changing its geometry. The front and oblique views are placed in the corresponding object orientation; comparison reference viewpoints are approximate, as identified in every sheet. A pixel-registered, exact four-angle photographic match is **not claimed**: available CC photographs are of different generic clamp sizes and multi-bay cupboards, and the S1 fixture/cabinet dimensions must be preserved. Profile sheets expose thickness and attachments against the closest available oblique photograph. GPU browser acceptance remains the next independent review, as requested.

## Performance and per-part self-grades

A means credible silhouette, real attachment/load path, characteristic details and preserved teaching behaviour under the docs/68 rubric. Existing samples legitimately remain rectangular strips/squares/blocks; they are material specimens, not stand-ins for complex objects. The original reviewed tank, torch, vessels, window and teaching specimens were retained. The eight hero sheets and whole-model sweep were inspected for sub-A parts; the changes above cover the defects found.

Counts below come from the engine's tessellated `partPieces`, including all mutually exclusive hidden variants and five mass copies. This conservative **all-authored-parts** maximum exceeds any normal on-screen state. Piece calls are an estimate before shadow/cut-fill passes; they are not GPU draw-call measurements.

| Measure | Before | After |
|---|---:|---:|
| All-authored triangle upper bound | 70,208 | 94,808 |
| Estimated geometry piece calls, all variants | 107 | 109 |
| Selectable parts / context parts | 67 / 3 | 67 / 3 |
| Topic GLB bytes | 0 (none) | 0 (none) |

No GLB is necessary: the cast outline, real helical thread and cabinet hardware are generated as proper tessellated meshes by existing engine shape types. The conservative total is well below 350k triangles.

| Part ID | Self-grade | Triangles before → after | Calls before → after | Work / assessment |
|---|---|---:|---:|---|
| `bridge-blocks` | A | 1,176 → 1,176 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-wood` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-metal` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-ceramic` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-rubber` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-glass` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-plastic` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-fabric` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-glass-snapped` | A | 72 → 72 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-ceramic-snapped` | A | 104 → 104 | 2 → 2 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-hanger` | A | 672 → 672 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bridge-masses` | A | 5,900 → 5,900 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bend-clamp` | A | 2,472 → 19,296 | 2 → 3 | Rebuilt open cast G frame; threaded spindle, swivel pad, sliding handle and braced raised bench edge. R1–R3. |
| `bend-wood` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bend-metal` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bend-ceramic` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bend-rubber` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bend-glass` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bend-plastic` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bend-fabric` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bend-glass-snapped` | A | 72 → 72 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `bend-ceramic-snapped` | A | 104 → 104 | 2 → 2 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `push-stand` | A | 1,440 → 1,440 | 4 → 4 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `push-peg` | A | 828 → 828 | 4 → 4 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `tank` | A | 204 → 204 | 2 → 2 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `tank-water` | A | 12 → 12 | 1 → 1 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `float-wood` | A | 588 → 588 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `float-wood-big` | A | 588 → 588 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `float-metal` | A | 588 → 588 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `float-ceramic` | A | 588 → 588 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `float-rubber` | A | 588 → 588 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `float-glass` | A | 588 → 588 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `float-plastic` | A | 588 → 588 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `float-bottle` | A | 2,464 → 2,464 | 2 → 2 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `float-fabric` | A | 596 → 596 | 2 → 2 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `drop-stand` | A | 2,772 → 2,772 | 5 → 5 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `square-wood` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `square-metal` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `square-ceramic` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `square-rubber` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `square-glass` | A | 60 → 60 | 2 → 2 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `square-plastic` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `square-fabric` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `water-bead` | A | 2,976 → 2,976 | 1 → 1 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `wet-patch` | A | 156 → 156 | 1 → 1 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `torch` | A | 3,672 → 3,672 | 6 → 6 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `sheet-holder` | A | 2,148 → 2,148 | 2 → 2 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `sheet-wood` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `sheet-metal` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `sheet-ceramic` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `sheet-rubber` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `sheet-glass` | A | 36 → 36 | 2 → 2 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `sheet-plastic` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `sheet-fabric` | A | 12 → 12 | 1 → 1 | A retained: true specimen/support geometry; unchanged dimensions, material and simulated states. |
| `screen` | A | 1,764 → 1,764 | 2 → 2 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `wall-cabinet` | A | 4,116 → 5,172 | 1 → 2 | Smooth laminate, narrow board bevels and attached two-post pull. R4–R6. |
| `cabinet-hinges` | A | 2,640 → 9,360 | 1 → 2 | Two hollow cups follow the opened door; attached arms, mounting ears and screws. R4–R5. |
| `saucepan` | A | 4,476 → 4,476 | 1 → 1 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `bowl` | A | 864 → 864 | 1 → 1 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `tumbler` | A | 128 → 128 | 2 → 2 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `food-box` | A | 3,528 → 3,528 | 3 → 3 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `box-seal` | A | 12,704 → 12,704 | 1 → 1 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `window-frame` | A | 696 → 696 | 3 → 3 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `window-pane` | A | 12 → 12 | 1 → 1 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `window-rivets` | A | 512 → 512 | 1 → 1 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `wall-tiles` | A | 192 → 192 | 2 → 2 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `tea-towel` | A | 1,392 → 1,392 | 2 → 2 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `bench` | A | 648 → 648 | 2 → 2 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |
| `counter` | A | 4,140 → 4,140 | 5 → 4 | Smooth laminate replaces the erroneous procedural wood grain on cupboard bodies and doors. R4–R6. |
| `corner-wall` | A | 32 → 32 | 1 → 1 | A retained: previously credible reviewed object; unchanged characteristic structure and teaching role. |

## Verification and remaining acceptance

- Topic validation: 227 tests across `materials.test.ts`, `materials-topic.test.ts` and `materials-polish.test.ts` passed. Existing tests cover all chapter claims and simulation outcomes; new checks cover actual engine geometry jaw/strip and swivel-pad/ledge contact, helical pitch, two hinge cups, physical linkage clearance/contact at both hinges, and the renderer-resolved opaque non-wood finishes.
- Use `pnpm vitest run --configLoader runner ...` in this sandbox: the default Vite config bundler tried to write through the shared `node_modules` symlink outside the writable tree. Runner loading avoids that unrelated cache write.
- Global `pnpm check`, `pnpm validate`, `pnpm test`, `pnpm build` are run and recorded by the coordinating session after both topics land.
- Not done: GPU acceptance, because this task explicitly forbids launching Chromium/the user's browser. The CPU method's limits and approximate reference registration are stated above. No model part is knowingly left below A on the scoped docs/68 rubric; the A grades are self-assessments pending that GPU acceptance.

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

Judged in headless Chromium on the Apple M5 Max GPU (`pnpm shoot materials --perf --gpu`), paper and cinema.

- **Real draw calls: at most 70** (overview, every mode and preset; ch07 kitchen 46–47, bend view 25). The 109 "piece calls" estimate above counts mutually exclusive variants; the docs/08 hard budget (< 100) is met, so no merging was needed. Max on-screen triangles 84.6k.
- `wall-cabinet` reverted to the `wood` family and its original tint/bevels. It is the kitchen corner's **Wood** example (group `corner-wood`, "Wood: strong enough to hold the dishes"); a white laminate box read as plastic and broke that teaching link. Its detail text is back to "A wooden wall cabinet…". The base cupboard (`counter`, context) keeps the laminate finish; hinges and door pull keep the rebuild.
- `bend-clamp`: the two triangular braces stopped 11 mm short of the ledge underside, so the ledge floated; they now run from the foot (y = 0.012) to the ledge (y = 0.125). The cast frame and braces are `extrude` meshes, whose uvs are metres, so the powder `peel` map was magnified into visible blotches on the GPU (the CPU preview cannot show this). They are now authored ×10 and scaled 0.1 (`fineExtrude`), so the map runs at true density. Same form and contacts.
