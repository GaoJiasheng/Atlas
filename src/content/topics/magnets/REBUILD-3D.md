# Magnets: 3D rebuild evidence

## Rebuild 2026-11-05

Executed 2026-11-09 in the assigned worktree. `REVIEW.md`, `FIXES.md` and an earlier `REBUILD-3D.md` did not exist. The applicable review is `docs/68-3d-realism/review-machines.md`, magnets row and the shared apparatus notes; docs/68 §4 requested another hero inspection.

### Rebuilt apparatus and grades

Grades are geometry self-assessments under docs/68 (A = credible; B = needs detail), **pending GPU acceptance**. This is a generic school apparatus study, not a copy of a named commercial product. Existing AA facts take precedence over the review's mistaken description as D cells.

| Part | Change / attachment audit | Self-grade | Triangles before → after | Estimated draws before → after |
|---|---|---|---:|---:|
| `suspension-stand` | Replaced bent gooseneck with cast chamfered base, independent vertical rod, bored adjustable boss, brass thumbscrew, straight clamp arm, collar, three distinct curved jaws, clamp screw, suspension pin and eye. Paper cradle is a U-shaped folded section, not a floating plate. Thread ends at the unchanged magnet pivot. | A | 25,144 → 27,616 | 3 → 6 |
| `test-tray` | Whole-model sweep found a second gooseneck in this part's extras. Replaced it with a cast base, straight pole, bored boss, screw, arm and two-jaw card clamp with pin. Tray and card-test positions remain. | A | 11,860 → 7,596 | 2 → 5 |
| `em-leads` | Whole-model sweep found a third bent support. Replaced it with base, straight post, bored boss, thumbscrew, arm, curved clamp and closing cheek attached to the nail head at y=0.14. Retained electrical lead paths and switch contacts. | A | 83,812 → 37,744 | 8 → 10 |
| `steel-can` | Continuous 64-sided formed profile: rolled top and bottom rims, six shallow strengthening beads, recessed lid with concentric formed rings, and longitudinal seam following the side beads. No painted relief. | A | 480 → 24,000 | 1 → 1 |
| `em-cells` | Two AA-size cells, button positive terminals, negative caps, insulating rings, wrapping bands and embossed + symbols, open notched holders, tapered contact springs and brass contact tabs. All surfaces are real geometry. Two complete copies are contiguous in one nonindexed GLB mesh. | A | 960 → 11,856 | 1 → 1 |

`em-cells` uses `/models/magnets.glb`, **324,956 bytes**, previously no GLB (0 bytes). It contains original procedural geometry, no imported scans, photographs or textures. Copyright/licence metadata are embedded. Meshopt is local and required; no runtime network.

The first-N count contract was checked **after compression with the engine's actual Three GLTFLoader + MeshoptDecoder**, not only on an authoring array: the final geometry is nonindexed, each half has a whole cell and holder, and world-space half centres are x=0.361 and x=0.379. No triangle/vertex reorder pass is allowed in the build. Quantization and compression preserve order. Repeat count, count binding, part ids, all simulation settings and teaching numbers are unchanged. Only the EN/ZH stand detail gained the now-visible cast base, adjustable boss and three-prong clamp.

### Real reference images (development only)

Photos were fetched to `scripts/geo/magnets/refs/` and visually inspected in `evidence/reference-contact-sheet.jpg`. They are not textures or shipped website assets. Reference copies and crops are development comparison material.

**Retort stands / clamps (3 references):**

1. [Retort stand with a clamp](https://commons.wikimedia.org/wiki/File:Retort_stand_with_a_clamp.jpg), Tsaenmai, CC BY-SA 4.0 — separate pole, heavy foot, boss and arm, overall front silhouette.
2. [Retort stand](https://commons.wikimedia.org/wiki/File:Retort_stand.jpg), Tsaenmai, CC BY-SA 4.0 — oblique foot shape and rod socket; licence: https://creativecommons.org/licenses/by-sa/4.0/.
3. [Three-finger utility clamp](https://commons.wikimedia.org/wiki/File:Pince_%C3%A0_3_doigts.jpg), IUT R. Schuman Illkirch Dpt. Chimie, CC BY-SA 4.0 — separated jaws and clamp mechanism. Detail sheet crops the real photo; licence: https://creativecommons.org/licenses/by-sa/4.0/.

**AA cells / holders (4 references):**

1. [AA battery](https://commons.wikimedia.org/wiki/File:AA_battery.png), MrDolomite, CC BY-SA 3.0 — can, wrapping band and terminal envelope.
2. [AA batteries in holder](https://commons.wikimedia.org/wiki/File:AAbatteryholder.jpg), Tom Blaha / Turbotom1, CC BY-SA 3.0 — retaining walls, terminal recesses and compression contacts. The pictured holder has four cells; this topic retains its authored two.
3. [Duracell AA batteries](https://commons.wikimedia.org/wiki/File:Duracell_AA_batteries.JPG), Mygoodsweaties, public domain — repeated physical cells, terminal-end proportions.
4. [Battery AA horizontal](https://commons.wikimedia.org/wiki/File:Battery_AA_horizontal.jpg), Symoum Syfullah Priyo, CC BY 4.0 — profile and wrapping band. Licence: https://creativecommons.org/licenses/by/4.0/.

**Steel can (3 references):**

1. [Empty tin can](https://commons.wikimedia.org/wiki/File:Empty_tin_can2009-01-19.jpg), Sun Ladder, CC BY-SA 3.0 — strengthening beads and rolled rim. It is a taller opened can; this study retains the original short closed-can envelope.
2. [Can bottoms](https://commons.wikimedia.org/wiki/File:CanBottoms.JPG), Id1337x, public domain (author release) — pressed concentric lid / bottom rings.
3. [Can seam](https://commons.wikimedia.org/wiki/File:Can_seam.jpg), Troefkaart, public domain (author release) — folded double-seam construction; used to understand the rim, not as a claim that the solid display model contains folded sheet-metal layers.

### Studio evidence, two look-and-revise rounds

`preview-studio.ts` imports the topic-local `studio-cpu.ts`, copied from the forces correction of the existing fossils renderer: the engine's paper/cinema hemisphere, three direct lights, RoomEnvironment sampling, GGX, exposure 1.05/1.0, ACES matrices and linear-to-sRGB conversion. The per-material `resolveMaterialLook(...).envIntensity` is passed into `studioShade` and multiplies the environment terms exactly as the engine multiplies `envMapIntensity`; the earlier preview omitted this family multiplier and its final sheets have been rerendered. It rasterizes **actual engine `partPieces` geometry and decoded GLB geometry**, with depth, smooth interpolated normals and the actual material token resolution. Cells opt into the existing `atlasSurface` hook. Their part material uses the neutral implementation multiplier `#ffffff`, so the already-baked technical-plate vertex colours are preserved in paper and cinema; using the theme background `token:paper` here would blacken their cinema caps. The decoded real-GLTFLoader test verifies cap colours after the actual family/tint multiplier in both themes; their vertex colours resolve technical-plate material families and tokens at build time. This is a lighting-matched numerical approximation, not a claim of GPU pixel identity. It does not reproduce the engine's stochastic procedural normal/roughness maps pixel-for-pixel.

- **Look 1:** Opened `round1-all-sheets.jpg` and individual clamp / cell / can images. The holder's front wall hid the + nub, the wrapping and holder read too brown, and the can's straight seam disappeared beneath each bead. The utility collar lacked its own adjustment screw. **Changed:** notched end panels, smaller brass contacts, raised + relief, darker ink token bands, a seam whose centreline follows the formed profile, and a visible collar thumbscrew.
- **Look 2:** Opened `round2` detail images and hero. The + terminals and screw now read. The hero exposed **two more bent supports** inside `test-tray` and `em-leads`, missed by examining only the named stand. **Changed:** rebuilt both, attached the nail clamp at the real head height, replaced the floating positive-contact block with an L-shaped stamped tab rooted in the holder and extended the negative spring to both contact surfaces, corrected the GLB's two copy centres to the authored centred repeat offsets, and constrained all existing paper-clip sweeps to 64 longitudinal rings / 16 radial sides with flat cut wire ends. Original clip paths, counts and poses stay the same. This removes redundant tessellation, not identifying shape.
- **Final look:** Viewed `final-all-sheets.jpg`, the individual characteristic details and landscape paper/cinema hero renders. The support assemblies, readable positive terminals, continuous can seam and embossed rings are present. No empty model stage is reproduced offline. `final-landscape-hero-paper.png` and `final-landscape-hero-cinema.png` use the authored cover camera at 1200 × 675 (16:9), contain the whole bench and fridge demonstration, and show roughly 71% horizontal subject coverage (including the bench). The 600 × 640 detail-sheet hero files are portrait diagnostic crops, not hero framing acceptance. The original empty-stage/timing issue remains unverified on GPU.

Each hero has front, three-quarter, profile and detail render/reference sheets for rounds 1, 2 and final. **Evidence limitation:** the reference photos are different generic specimens and do not provide a calibrated orthographic set. Sheets explicitly label the nearest available photo angle; the can profile and battery front comparisons are not exact angle matches, and the clamp reference has rubber-covered fingers while this small pin clamp has bare metal jaws. Do not describe these as exact photo-registration acceptance. Strict same-angle photographic acceptance remains for GPU review or an additional calibrated photo set. No browser, desktop or Chromium was opened.

### Whole-topic sweep / retained objects

All 39 selectable/context part identities remain. The following retained hero families self-grade A at their authored educational scale: bar magnets (`bar-magnet-n`, `bar-magnet-s`, `bar-magnet-b`), horseshoe and its clip attachments, both ring magnets and post, compass case/card/needle/glass, tray objects (nail, paper clips, solid copper disc, aluminium tab, spoon with real concave bowl, wooden test block, marked ruler), cards and clip chain, stroking rod and clips, nail and 30-turn coil, switch and insulated leads, fridge door/gasket/magnetic strip, latch/keeper/cabinet corner, field filings and context bench. Simple solids remain only where the real specimen is itself a solid disc, block, sheet or straight rod. No unrelated identity or morphology was restyled. `final-em-cells-cinema.png` and `final-em-cells-detail-cinema.png` specifically expose the decoded AA assembly under cinema studio lighting, independently of its partial occlusion in the whole-bench hero. The fridge is an explicit door/seal demonstration panel, not a substitute box for a whole appliance.

**Performance:** all authored geometry at once (including every repeated clip and all 3,600 filings), 696,024 → **286,004 triangles**; estimated geometry draws 67 → **75**. This is below the 350k screen budget even before chapter hiding and simulation count limits. Estimates exclude extra cutaway/shadow/overlay passes; no GPU FPS is claimed. `baseline-metrics.json` / `final-metrics.json` record every part. The previously excessive repeated wire tessellation was the main cost, so it was reduced without dropping clips.

### Reproduce and checks

```sh
pnpm tsx scripts/geo/magnets/rebuild.ts
pnpm tsx scripts/geo/magnets/preview-studio.ts final
python3 scripts/geo/magnets/comparison-sheets.py final
ATLAS_PREVIEW_WIDTH=1200 ATLAS_PREVIEW_HEIGHT=675 ATLAS_PREVIEW_SHOT=hero-paper,hero-cinema pnpm tsx scripts/geo/magnets/preview-studio.ts final-landscape
pnpm exec vitest run tests/magnets-rebuild.test.ts --configLoader runner
```

The focused two-test contract gate passes. Global studio rig audit `pnpm tsx scripts/geo/forces/audit-studio-contract.ts`: PASS against the actual Lighting.tsx values passed by the engine. `pnpm exec tsc --noEmit --pretty false`: PASS in this worktree. All photo authors, exact licences, original URLs and resize/crop notices are copied from Commons imageinfo extmetadata in `evidence/reference-metadata.json`, `evidence/reference-credits.json` and `comparisons/CREDITS.md`; each sheet also prints the author and licence. Comparison layouts are CC BY-SA 4.0; photo licences remain those individually listed. The root session runs the required full `pnpm check`, `pnpm validate`, `pnpm test`, `pnpm build` gates. No git writes or engine/shared-kit changes were made.

Comparison directory: `/Users/gavin/work/atlas-q-circuits-forces-magnets/scripts/geo/magnets/comparisons`.

### Combined final gates — 2026-11-09

All required gates passed on the final combined geometry and persisted pose data:

- `pnpm check`: 1,233 files, 0 errors, 0 warnings; 7 existing hints.
- `pnpm validate`: 94 topics, 0 errors, 0 warnings.
- `pnpm test`: 277 files and 6,530 tests passed, with two workers.
- `pnpm build`: 191 pages built; 327 PWA precache entries.

Reproduce with `scripts/geo/forces/run-gates.sh`. The pre-existing worktree `node_modules` symlink points outside writable roots, so the unchanged package scripts ran in `/private/tmp/atlas-cfm-gates` with writable local caches. SHA-256 checks confirm the tested topic data and both public GLBs are byte-identical to this worktree. Gate metadata: `scripts/geo/forces/evidence/gates-final.json`; transient logs: `/private/tmp/atlas-cfm-{check,validate,test,build}-final.log`. `git diff --check` also passed. No browser/desktop or git writes were used.

Curated cross-topic comparison directory: `/Users/gavin/work/atlas-q-circuits-forces-magnets/scripts/geo/forces/comparison-sheets/batch2-final` (39 sheets plus CREDITS.md). Original iterations, individual renders and exact reference attributions remain in-topic. GPU acceptance, approximate photo angles and the documented forces paper B limitation are not waived by these software gates.

## GPU acceptance 2026-11-09 (Claude)

Shot on the real GPU (`pnpm shoot magnets --beats --gpu`, paper and cinema), with close-ups next to main and `hero-clean` in both themes. The hero renders the whole bench. No empty stage.

- `suspension-stand`, `test-tray` support, `em-leads` support, `steel-can`, `em-cells`: A on the GPU, as self-graded.
- **Regression fixed:** cutting the paper-clip sweeps to 64 rings × 16 sides left visible kinks at every bend in close-up (`m-clips`). 128 rings still kinked. Now 192 rings × 10 sides, which matches main's smoothness (`rebuild.ts` and `parts.json`, 9 sweeps). Visible triangles: `hero-clean` 193k → 209k (main 295k); `m-clips` close-up 18.7k → 24.1k (main 62.8k).
- Filings, bar magnets and compass look the same as main in the close-ups.
