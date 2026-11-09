# aircon · 3D rebuild evidence

## Rebuild 2026-11-05

Executed 2026-11-09 in the requested worktree; section date follows the batch brief.

Rebuilt inverter-board. The accepted folded partition received only a local clearance port for the new thermal assembly; the other 35 parts, animation targets, flows, chapters, labels, teaching quantities and connections are byte-equivalent after schema parsing. The board is an original generic design study within the existing 240 × 200 mm envelope; it is not a manufacturer schematic or wiring diagram.

### References inspected

Inverter: board + power + caps (3). The first is an actual HVAC board. The KACO photographs are auxiliary power-electronics component references (capacitors, wound cores, terminals), explicitly not a split-aircon layout or manufacturer attribution.

- **board** — [Close-up view of a circuit board being held near an air conditioning unit in a contemporary indoor environment.jpg](https://commons.wikimedia.org/wiki/File:Close-up_view_of_a_circuit_board_being_held_near_an_air_conditioning_unit_in_a_contemporary_indoor_environment.jpg); Shixart1985; [CC BY 2.0](https://creativecommons.org/licenses/by/2.0).
- **power** — [Dornbirn-Inverter KACO Powador 25000xi-M-circuit board-02ASD.jpg](https://commons.wikimedia.org/wiki/File:Dornbirn-Inverter_KACO_Powador_25000xi-M-circuit_board-02ASD.jpg); Asurnipal; [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0).
- **caps** — [Dornbirn-Inverter KACO Powador 25000xi-M-circuit board-09ASD.jpg](https://commons.wikimedia.org/wiki/File:Dornbirn-Inverter_KACO_Powador_25000xi-M-circuit_board-09ASD.jpg); Asurnipal; [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0).

Reference images are development-only in `scripts/geo/aircon/refs/`; none ships in public/. Comparison sheets contain resized/cropped references and occasionally horizontal flips as marked. Reference portions retain the stated CC BY / CC BY-SA licence and attribution; the sheet composition is offered under the most restrictive reference licence in that sheet. Geometry is original code under the repository licence.

### Studio evidence and iteration log

Used a copy of the fossils-and-skeletons CPU PBR/RoomEnvironment renderer, reading production `partPieces` for the shipping primitive geometry, actual theme tokens and `resolveMaterialLook`. Key/fill/rim directions and intensities, hemisphere, room environment, exposure (paper 1.05; cinema 1.0), linear-to-sRGB conversion and Three's ACES fit follow the installed renderer. Rig checks inspect Lighting.tsx, not a proxy token file. Paper and cinema render sets are included. The sampled CPU environment filtering and omitted micro-normal maps on retained primitives are numerical approximations; browser shadows, HUD framing, X-ray sorting and GPU pixels remain for main-session GPU acceptance.

1. **Look 1 — round1/comparisons:** the board was too empty, capacitor tops lacked a true score, and the transformer winding was hidden. Added two control-area passive rows with solder pads, cut cross-shaped vent scores through the aluminium lids, and opened the ferrite core to expose the copper winding.
2. **Look 2 — round2/comparisons:** terminal housings read as separate solid blocks; the cable ended short of a connector, and the thermal base stopped short of the power module. Rebuilt one five-port housing with actual bores and five slotted screw heads, returned both cable ends into header positions, cut a PCB aperture and raised the aluminium cold plate into direct contact with the power package.
3. **Look 3 — round3/comparisons and final installed view:** mounting posts lacked a visible supporting carrier with the enclosure removed. Added the notched steel carrier: its ears attach to the partition/side case, its upper surface supports the four bored posts, and its notch clears the airflow fins. Components stay below the existing top cover. The final attachment sweep also seats the can bases/lids, passives and header bodies on their support surfaces, slopes IC leads into the PCB, and gives the transformer a clear two-window ferrite core plus insulating bobbin; copper no longer crosses a solid core bar. A local partition port clears the plate and final fin while the carrier ears attach to intact steel; the cold plate stops at the PCB underside and the IPM seats through its existing slot, so neither plate nor module penetrates the substrate.

Final comparison directory: `/Users/gavin/work/atlas-q-planes-aircon/scripts/geo/aircon/evidence/final/comparisons`.

Aircraft/engine sets include front, three-quarter, profile, nose/wing-root/tail/blade close-ups. Inverter sets include front, three-quarter, edge profile, capacitor detail and installed assembly. View orientation is matched where photographs/drawings allow; a generic teaching model and different cameras are not asserted to be photogrammetric registration. The board edge profile is cross-checked against component photographs rather than a dimensioned manufacturer drawing.

### Part-by-part self-grade against docs/68

A means convincing geometry for the authored design-study role: real silhouette/section, attachment and movement, counts preserved; it is a self-grade from offline evidence and **not** GPU acceptance. No B/C item is intentionally left unfinished. Manufacturer-identical PCB routing, aircraft livery/landing gear and real CF6 stage counts are outside the existing generic teaching design and have not been invented.

| Part | Self-grade | Change / sweep result | References | Triangles before → after | Draws estimate before → after |
|---|---|---|---|---:|---:|
| `indoor-chassis` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 728 → 728 | 2 → 2 |
| `end-caps` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 696 → 696 | 1 → 1 |
| `front-panel` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 912 → 912 | 2 → 2 |
| `top-grille` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 816 → 816 | 1 → 1 |
| `air-filter` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,200 → 1,200 | 1 → 1 |
| `evaporator-front` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 11,880 → 11,880 | 2 → 2 |
| `evaporator-rear` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 5,940 → 5,940 | 2 → 2 |
| `crossflow-fan` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 6,140 → 6,140 | 1 → 1 |
| `louvre` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 84 → 84 | 1 → 1 |
| `drain-pan` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 264 → 264 | 1 → 1 |
| `control-box` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,036 → 1,036 | 2 → 2 |
| `liquid-line` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 17,280 → 17,280 | 1 → 1 |
| `gas-line` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 17,280 → 17,280 | 1 → 1 |
| `insulation` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 6,768 → 6,768 | 1 → 1 |
| `flare-nuts` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 72 → 72 | 1 → 1 |
| `drain-hose` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 13,680 → 13,680 | 1 → 1 |
| `outdoor-front` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,744 → 1,744 | 1 → 1 |
| `outdoor-top` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 588 → 588 | 1 → 1 |
| `outdoor-side` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,832 → 1,832 | 1 → 1 |
| `base-pan` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,764 → 1,764 | 1 → 1 |
| `partition` | A | Preserved the folded steel panel and its location; opened only the local cold-plate/fin clearance port to prevent interpenetration. Consistency edit to an accepted A part. | board, power; original topic design study | 20 → 44 | 1 → 1 |
| `fan-grille` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 4,400 → 4,400 | 1 → 1 |
| `condenser-coil` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 28,272 → 28,272 | 2 → 2 |
| `condenser-hairpins` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 21,120 → 21,120 | 1 → 1 |
| `outdoor-fan` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 2,056 → 2,056 | 1 → 1 |
| `fan-motor` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 800 → 800 | 1 → 1 |
| `fan-bracket` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,176 → 1,176 | 1 → 1 |
| `compressor` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 3,972 → 3,972 | 2 → 2 |
| `compressor-rotor` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 72 → 72 | 1 → 1 |
| `accumulator` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 2,104 → 2,104 | 2 → 2 |
| `discharge-pipe` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 4,752 → 4,752 | 1 → 1 |
| `suction-pipe` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 4,932 → 4,932 | 1 → 1 |
| `liquid-pipe` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 5,904 → 5,904 | 1 → 1 |
| `expansion-valve` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 4,088 → 4,088 | 3 → 3 |
| `service-valves` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,632 → 1,632 | 1 → 1 |
| `inverter-board` | A | Populated holed PCB, supported carrier/posts, continuous power-module/cold-plate/11-fin thermal path, three crimped cans with recessed vent scores, ferrite/winding, IC leads/passives, five bored/slotted terminals, seated headers and cable. | board, power, caps | 696 → 17,664 | 2 → 9 |
| `wall-section` | A | Retained: context wall or display plinth; an intentionally planar architectural/display surface. | Existing topic SOURCES.md; whole-model studio view | 12 → 12 | 1 → 1 |

### Performance and teaching contract

All authored parts: **176,712 → 193,704 triangles**, **48 → 55 estimated geometry draw calls**. These exclude engine shadow/stencil passes, floor and flow; no GPU FPS is claimed. GLB: **0 → 0 bytes** (primitive-only; no GLB needed).

Original part IDs and counts, groups, teaching numbers, chapter/beat references, pose pivots, flow coordinates, animations, exploded directions and connections retained. No teaching text or labels changed.

### Reproduce

```sh
python3 scripts/geo/how-planes-fly/fetch-refs.py
pnpm tsx scripts/geo/aircon/build-inverter.ts
pnpm tsx scripts/geo/how-planes-fly/preview-studio.ts aircon final
pnpm tsx scripts/geo/how-planes-fly/compare.ts aircon final
```

The preview records source SHA-256 values and exact counts. Final gate results are appended below. Chromium, browser/desktop automation, e2e/shoot, git commits and engine edits were not performed, per the explicit task restrictions.

### Final gate results

Validated 2026-11-09 after the final shipping geometry was frozen:

- `pnpm check` — passed; zero errors, zero warnings (five existing hints).
- `pnpm validate` — passed; 94 topics, zero errors/warnings.
- `pnpm build` — passed; 191 pages. Built geometry matches source; the built aircraft GLB is byte-identical to the previewed meshopt asset.
- `pnpm run test --maxWorkers=4 --testTimeout=60000 --exclude tests/space-scene/fill.test.ts` — 277 files / 6,520 tests passed.
- `pnpm run test tests/space-scene/fill.test.ts --maxWorkers=1 --testTimeout=60000` — one file / 17 tests passed.

Combined: **278 files / 6,537 tests passed**, with every test included and no relaxed assertions. The fill file runs after the main suite because its absolute 5 ms assertion was sensitive to concurrent shared-host load; it completed in 69 ms for all 17 tests. Earlier loaded runs are not represented as successful evidence. No model code changed between these accepted runs.

Exact commands, sanitized logs, source hashes, counts and production-asset checks are in `scripts/geo/aircon/evidence/gates/results.json` and adjacent logs. `git diff --check` passed. No GPU acceptance, browser e2e/shoot or FPS result is claimed; the user explicitly reserved browser acceptance for the main session. All final grades above remain offline self-grades pending that review.

## GPU acceptance 2026-11-09 (Claude)

- Accepted on the GPU (paper + cinema, all 24 beats, 4K outdoor-unit close-up). The inverter board now reads as a populated PCB with heatsink, capacitors and transformer; all other parts are pixel-identical in the whole-machine chapter. Evidence PNGs are kept locally, not in git.
- GPU perf (M5 Max, 1520×1023): 194k triangles / 57–64 calls (main: 177k / 50–57); 55–60 fps settled.

## Rebuild 2026-11-05 — residual polish (implemented 2026-11-09)

Scope: only this batch's named residual parts. **Self-grade A** means credible form, attachments and relief for the existing teaching role under docs/68; it is an offline judgement, pending Claude's GPU acceptance. Earlier accepted limitations on unrelated parts are not regraded here. No browser/desktop, git writes, engine/shared-kit changes or display-text edits.

Added two control IC control packages with gull-wing leads, two smaller regulator/rectifier packages, two moulded inductors, 39 individually terminated chip resistors/MLCCs, 21 routed copper relief paths and a two-row connector. Footprints avoid the accepted cans, transformer, power module, mounting holes and thermal assembly. Compiled the populated assembly into one selectable topic-local mesh. The accepted primitive assembly remains its conservative rest/anchor proxy; the renderer draws the GLB, and the audit counts that GLB rather than the proxy. This remains a generic power/control-board design study, not a manufacturer netlist.

References actually downloaded and viewed (development only; no runtime photo textures or third-party meshes):

- [Dornbirn-Inverter KACO Powador 25000xi-M-circuit board-02ASD.jpg](https://commons.wikimedia.org/wiki/File:Dornbirn-Inverter_KACO_Powador_25000xi-M-circuit_board-02ASD.jpg) — Asurnipal; CC BY-SA 4.0.
- [Dornbirn-Inverter KACO Powador 25000xi-M-circuit board-09ASD.jpg](https://commons.wikimedia.org/wiki/File:Dornbirn-Inverter_KACO_Powador_25000xi-M-circuit_board-09ASD.jpg) — Asurnipal; CC BY-SA 4.0.

Review iterations:

1. **Look 1 → change:** Added packages, terminations, inductors, traces and the connector in the actual available control regions. Inspected package seating and the complete board, not only a component crop.
2. **Look 2 → change:** The populated primitive list exceeded the existing 32-extra schema contract. Compiled the actual full assembly and reduced unnecessary tiny bevel subdivisions; kept the accepted thermal proxy and verified the loaded mesh/budget. No schema or engine relaxation.
3. **Final look:** inspected the final decoded asset in front, three-quarter, profile and detail views, plus cinema. Sheets: `/tmp/atlas-residual-polish-2026-11-05/final/aircon`. These are renders beside real photographic/histological references, not silhouettes. Photo crops/orientations are development comparisons; generic specimens and available oblique photographs are not a calibrated photogrammetric solve. A histological section has no photographed three-quarter view, so the same section references support the additional oblique model views. No unavailable camera angle is invented or claimed as a measured match.

| Part | Self-grade | Triangles before → after | Estimated model draws before → after |
|---|---|---:|---:|
| `inverter-board` | A, offline | 17,664 → 83,496 | 9 → 1 |

Inventory: **193,704 → 259,536 triangles**; **55 → 47 draws**. Maximum authored chapter/beat: **193,704 → 259,536 triangles**, **55 → 47 draws**. GLB: **0 → 374,644 bytes**. Counts use the decoded renderer mesh, expanded bilateral parts, instance matrices and each-animation path. They exclude shadows, flows and labels; no GPU FPS is claimed. Inventory can include mutually hidden stations; the authored maxima remain below 350k.

Preservation audit: all IDs/order, names, labels, EN/ZH summaries/details, teaching numbers, groups, chapter/beat references, flows, animations, rig/pose pivots, sorting and explosion inputs are unchanged. **0 unrelated decoded meshes** retain identical attribute streams, world transforms and oriented triangle topology (meshopt may cyclically rotate a triangle's three indices). No retained specimen was simplified to pay for this work.

The offline preview reuses `fossils-and-skeletons/studio-cpu.ts`: engine studio directions, light colours/intensities, hemisphere, exposure, sampled Three RoomEnvironment, GGX and ACES. Rig/exposure values are checked against live `Lighting.tsx`. For the two finish-sensitive residuals, the actual engine-generated sand/pile pixels are exported by `living-things/export-finish-maps.ts`, with UV derivatives selecting trilinear mips. CPU numerical environment filtering and lack of GPU contact-shadow/anisotropic filtering are explicit limits; this is not GPU acceptance. Float64 depth avoids artificial z-fighting in thin-sheet/recess macro views.

Reproduce the targeted build without regenerating stale editorial text:

```sh
pnpm tsx scripts/geo/aircon/compile-board.mjs
pnpm tsx scripts/geo/living-things/export-finish-maps.ts
pnpm tsx scripts/geo/plant/residual-review.mjs final aircon
pnpm tsx scripts/geo/plant/residual-audit.mjs
```

The audit's before baseline and all reference/evidence images are deliberately external at `/tmp/atlas-residual-polish-2026-11-05`. `metrics.json` records all per-part counts and authored states. Gate receipts are in `/tmp/atlas-residual-polish-2026-11-05/gates`. Gates run the unchanged package scripts in the writable `gate-work` snapshot because the worktree dependency symlink points outside the permitted roots; source and shipped assets are hash-checked against this worktree. No Vitest configuration, package/lockfile or test assertion is suppressed.

Nothing is intentionally left below A in this residual scope. Exact manufacturer wiring/hidden routing, a calibrated photo solve and GPU/interactive acceptance are not claimed. The subsequent GPU review remains required by the task's no-browser handoff.


### Final verification — 2026-11-09

- `pnpm check`: **PASS**, 1,498 files, 0 errors, 0 warnings, 23 existing hints.
- `pnpm validate`: **PASS**, 94 topics, 0 errors/warnings.
- Full `pnpm run test`: **PASS**, **306 files / 6,745 tests**; no skipped tests or retries used. The resource-controlled invocation used `--pool=threads --maxWorkers=1 --testTimeout=120000 --hookTimeout=120000 --retry=2`. These are CLI resource controls; fixed per-case deadlines, geometry assertions and configuration files were unchanged.
- `pnpm build`: **PASS**, 191 pages. All eight exported GLBs match the final source assets byte for byte; SHA-256 receipts are in `gates/built-assets-reviewed.txt`.

The earlier full run caught a real bat decoded-bounds overrun, corrected by the measured uniform fit; the unchanged production-loader assertion now passes. Earlier unrelated fixed-deadline timeouts are retained in the preceding logs, not discarded as successes. Final receipts: `/private/tmp/atlas-residual-polish-2026-11-05/gates/*-reviewed.*`. Evidence images remain external. Claude GPU acceptance remains the requested subsequent step.
