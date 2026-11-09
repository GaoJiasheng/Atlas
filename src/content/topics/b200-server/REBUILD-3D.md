# B200 server — 3D rebuild record

## Rebuild 2026-11-05

Completed after resuming on 2026-11-09. Scope: DGX B200 exterior, the HGX eight-GPU tray, CPU/DIMM tray, fan wall, supplies, visible cables and the 1.70 m scale figure. This is an independent scientific reconstruction. CPU self-review is complete; GPU/browser acceptance remains for the main session. No browser or desktop was opened, and no git writes were made.

Read: CLAUDE.md; docs/08; docs/68 and review-machines.md; docs/18; the space-topic modelling runbook/data cookbook; industrial master-spec/rounds/perf-lessons/fact-discipline. Topic REVIEW.md, FIXES.md and REBUILD-3D.md were absent on resume. Reused the fossils CPU studio integrator, living-things implicit-surface approach, eyes-and-ears meshopt/relief workflow and cells' original build-time surfaces. Existing shared kits and engine files were not edited.

### Reference register (2–4 real images/drawings per hero)

All NVIDIA images are © NVIDIA and used only for local comparison, under the topic's already-recorded exception in docs/18 §0.1. They are not textures and are not in the site. Reference crops retain their original geometry/projection. Local sheets and refs are gitignored. No generated illustration is treated as factual evidence.

| Hero | Reference IDs and URLs | What was checked |
|---|---|---|
| Exterior / bezel / bays | E1 [front elevation](https://docs.nvidia.com/dgx/dgxb200-user-guide/_images/dgx-b200-with-bezel.png); E2 [service oblique](https://docs.nvidia.com/dgx/dgxb200-service-manual/_images/b200-bezel.png); E3 [front without bezel](https://docs.nvidia.com/dgx/dgxb200-user-guide/_images/dgx-b200-front-view.png); E4 [rear modules](https://docs.nvidia.com/dgx/dgxb200-user-guide/_images/dgx-b200-rear-panel-modules.png) | Square 10U face, open foam, eight rack screws, chassis depth, 4×5 fans, paired drive carriers, PSU layer. |
| GPU tray | G1 [official tray plan](https://docs.nvidia.com/dgx/dgxb200-user-guide/_images/dgx-b200-gpu-tray.png); G2 [Pokiiri, real HGX B200 board photograph](https://commons.wikimedia.org/wiki/File:Nvidia_DGX-B200-HGX.jpg), CC BY-SA 4.0, 2025-09-07 | 4×2 tall towers, two concealed NVSwitches, stepped front exchangers, top windows, cheeks, heat pipes and connector edge. DGX tray walls are checked against G1; the bare HGX photograph has no DGX tray walls. |
| Host / CPUs / DIMMs / cabling | H1 [official motherboard tray plan](https://docs.nvidia.com/dgx/dgxb200-user-guide/_images/dgx-b200-mb-tray-comp.png); H2 [CPU and DIMM layout drawing](https://docs.nvidia.com/dgx/dgxb200-service-manual/_images/dgx-b200-motherboard.png); H3 [open DIMM socket](https://docs.nvidia.com/dgx/dgxb200-service-manual/_images/dimm-socket-open.png) | Two sockets, four banks of eight, retention screws, DIMM key/ejectors, two network modules and visible cable routes. |
| Fan wall | F1 [front wall](https://docs.nvidia.com/dgx/dgxb200-service-manual/_images/b200-front-view-fans.png); F2 [dual-fan cassette](https://docs.nvidia.com/dgx/dgxb200-service-manual/_images/fan-module.png); F3 [module replacement drawing](https://docs.nvidia.com/dgx/dgxb200-service-manual/_images/b200-fan-replace.png) | 20 cassettes, two axial rotors each, sleeve depth, black front, hex guard, formed handle and release detail. |
| Power supplies | P1 [rear module elevation](https://docs.nvidia.com/dgx/dgxb200-user-guide/_images/dgx-b200-rear-panel-modules.png); P2 [supply service oblique](https://docs.nvidia.com/dgx/dgxb200-service-manual/_images/psu.png) | Six supplies in bottom row, long folded housing, actual perforation, C20 mouth, tab and folding handle. |
| Scale figure | N1 [OpenStax anatomical region drawing](https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology), CC BY 4.0; N2 [CDC 2013 Anthropometry manual, standing-height front/profile drawing](https://wwwn.cdc.gov/nchs/data/nhanes/public/2013/manuals/2013_Anthropometry.pdf), US government work | Head/stature relationship, shoulders, relaxed arms, elbow/wrist/knee landmarks, feet and planted profile. The figure is a neutral silhouette, not a scan or a claim about average anatomy. |

The additional exposed-package sheet uses the existing S15 bare-HGX study photograph; it is a teaching exposure, not the characteristic tower close-up. Manufacturer counts were rechecked against [S3 hardware overview](https://docs.nvidia.com/dgx/dgxb200-user-guide/introduction-to-dgxb200.html) and [S4 dual-fan service description](https://docs.nvidia.com/dgx/dgxb200-service-manual/front-fan-replacement.html): **8 GPUs, 16 GPU dies, 64 HBM stacks, 2 NVSwitches, 2 CPUs, 32 DIMMs, 20 fan modules / 40 rotors, 8 U.2 drives, 6 PSUs**. Numbers, names, IDs, chapters/beats, flow definitions, named views and all four service poses are preserved.

### Offline lighting and actual runtime contract

`preview.ts` decodes the shipped meshopt GLB, including quantized node transforms and inverse-bind matrices, and obtains every retained primitive through the engine's actual `partPieces`. It uses the engine's real material resolver and per-material environment intensity. `studio-cpu.ts` is copied from the fossils studio integrator: hemisphere, three actual light directions/intensities, GGX, sampled installed RoomEnvironment, paper exposure 1.05 / cinema 1.0, Three's ACES matrices, linear working space and sRGB output. The preview guards light values in **Lighting.tsx**, not a token file. The regression test also calls the actual **gltfSurface** material adapter, so source roughness/metalness/vertex colors pass through the same hook the engine uses.

This numerical CPU renderer approximates PMREM filtering and does not reproduce GPU shadow-map filtering, procedural primitive finish maps, or antialiasing pixel for pixel. It is a studio/PBR comparison, not GPU acceptance or a claimed FPS result.

### Looks, rejections and changes

The inherited `round1`, `round2` and old `final` sheets were inspected on resume; their presence alone was not treated as acceptance. The inherited round2 fan close-up even showed displaced rotor geometry, so it was rejected. These historical folders are evidence of intermediate failures.

| Hero | Look 1 → correction | Look 2 → correction | Final look |
|---|---|---|---|
| Bezel/chassis | Inherited pores were large angular cells; handles visibly broke through. Increased cell density, welded adjacent web normals, removed sparse backing lattice and recessed fan handles with clearance. | Dense trial exceeded asset size; changed cell walls to an efficient tapered bore, kept real holes, fitted perimeter returns, and adjusted the token-derived metal under ACES. Added real mounting rails to the rack context. | Physical web and chassis are credible. **B for fine foam grain**, which remains visibly coarser than E1/E2. |
| GPU tray | Inherited top plan cropped towers and gave weak package mounting. Corrected inspection framing; retained eight footprints and added SXM bosses/retention relief and stepped connectors. | G2 showed missing top fasteners/pipe crests and two shared low front exchangers. Added raised screws/bent crests; replaced four low proxy banks with two tray-carried shared exchangers. Seated thermal feet onto the actual die/package surfaces. Darkened source board finish with tokens. | Count, tall silhouette, duct and mounting topology agree with G1/G2; fin pitch remains the pre-existing disclosed screen-readable approximation. |
| Host/DIMMs/cables | Bare DIMM slabs lacked notches and sockets; CPU retention was weak. Built real keyed board profiles, package relief, shaped ejector sockets and four-screw CPU retention. | The purported oblique reference hid the components. Replaced characteristic-detail comparison with the real H2 CPU/DIMM plan, cropped to the same socket/banks; replaced pale/leaf board paints with fixed dark material-family tokens. The cinema look exposed a white-board inversion from the ink token; switched PCB/DRAM/socket families so the boards stay dark in both rigs. | Both CPUs and all 32 spaced DIMM boards are readable. Source routes and cable connector endpoints remain attached. |
| Fan wall | Inherited white/displaced rotors and empty mouths failed the reference. Rebuilt 40 cambered rotors with rigid skin pivots and tested actual transported skinning. | Square bars and round-wire handle did not match F2. Replaced them with real hex perforation, shaped hollow grip, sleeve/front distinction and status studs. Kept a gap behind the bezel. | Four rows × five; independent rotors remain inside their housings. No static rotor proxy replaces animation. |
| PSUs / drive bays | Initial supplies were closed boxes with coarse dark faces; carriers had dotted vents and conspicuous wire loops. Added genuine panel perforation, inlet relief, tabs and folding grips. | Final close-up still exposed the closed PSU box through its holes, while E3 showed long carrier windows. Rebuilt open folded PSU shells with recessed interiors, denser perforated mouths; rebuilt drive windows with folded comb teeth and black latch relief. | Six supplies, eight carriers, real mouths/recesses and retained independent PSU service motion. |
| Figure | Capsule silhouette replaced by an implicit blended anatomical surface. Inspected front/profile against N1/N2. | Profile showed excess posterior volume and a projecting doll-like face. Reduced pelvis depth, blended jaw/nose, refined foot envelope, kept shoulder/leg asymmetry and planted soles. | Correct 1.70 m stature and recognizable jointed adult silhouette; not presented as a portrait. |

### Sheets and angle limitations

Final comparison directory: `scripts/geo/b200-server/evidence/release-2026-11-09/` (26 render/reference sheets, plus three cinema renders). It contains front, three-quarter, profile and characteristic close-up for exterior, GPU tray, host tray, fan wall, supplies and human, plus exposed-package and drive-carrier close-ups. `manifest.json` stores cameras and reference filenames. Historical looks are in `before/`, `round1/`, `round2/`, `resume-round1/`, `resume-round2/`, `resume-round3/`.

**Not completed literally:** matched orthographic reference profiles for the GPU/host/fan/PSU subsystems were not found in the consulted public sources. Those sheets show a true rendered profile next to the nearest official plan/service oblique and explicitly flag the mismatch. Host detail uses the matched top plan; the human profile uses CDC's actual profile. GPU/host profile renders remove the outer tray wall for inspection, so the height of the actual components is visible. No generated fake reference or fabricated profile is substituted. Public component construction drawings for the hidden midplane/distribution are likewise absent; their S1 reconstruction caveats remain.

### Self-grades and measured per-part costs

Docs/68 definitions: A = credible; B = recognizable and good but still needs detail work; C = crude. Grades below are candid CPU self-grades, not approval on the real GPU. All required heroes are A except the bezel's fine-grain surface. The concrete B exception is geometric budget: the 110×110 real-pore trial measured 338,348 triangles / **1,663,536 bytes** after welding, over the 1,500,000-byte limit, despite still being coarser than factory metal foam. The final 95×95 web has actual relief/openings, but reproducing the much finer multilayer foam at equal close-up resolution was not achieved within this asset/engine contract. No decal is used to conceal that difference. B items marked S1 are deliberately retained, explicitly labelled reconstructions rather than invented manufacturing detail.

Before counts come from `source-parts.json` and the real `partPieces`/`eachPieces` builders, including all repeated details. After counts include **all** main and context parts together, even when a chapter hides some. Draw estimates are geometry/material submissions, excluding ground, flow and shadow passes.

| Part ID | Grade | Reference | What changed / concrete limitation | Triangles before → after | Draws before → after |
|---|---|---|---|---:|---:|
| `bezel` | **B** | E1–E3 | Flat slab replaced with a welded stochastic open-cell web, real bores, rounded perimeter returns and recessed handles. Fine foam grain remains too coarse; see exception below. | 588 → 107,406 | 1 → 1 |
| `chassis-body` | **A** | E1–E4 | Folded walls, seams, side fasteners and recessed front USB/VGA details. | 60 → 2,156 | 2 → 1 |
| `top-cover` | **A** | E2 | Seated folded edges, captive fasteners and seam returns; original service pose retained. | 12 → 540 | 1 → 1 |
| `gpu-tray-frame` | **A** | G1/G2 | Folded tray, screws and two shared low front exchangers with bent pipe crests; corrected former four separate low blocks. | 48 → 1,512 | 1 → 1 |
| `host-tray-frame` | **A** | H1/H2 | Original flanged tray with added fasteners; service axis preserved. | 852 → 1,212 | 1 → 1 |
| `gpu-modules` | **A** | G1/G2 | Eight raised SXM substrates, package shoulders, four mounting bosses apiece, power-stage and capacitor relief. Small circuit layout is illustrative. | 9,408 → 8,960 | 1 → 1 |
| `nvswitch-chips` | **A** | G1/G2 | Two packages with copper spreaders, fin banks and mounting screws, below the removable duct. | 1,512 → 928 | 2 → 1 |
| `nvswitch-duct` | **A** | G1/G2 | Open-ended formed channel and real handhold opening; no filled duct block. | 1,212 → 320 | 1 → 1 |
| `cpus` | **A** | H1/H2 | Two Xeon-sized packages in stepped retention sockets with real mounting relief. | 1,176 → 592 | 1 → 1 |
| `cpu-heatsinks` | **A** | H1/H2 | Two fin banks, copper feet, formed cheeks and four raised screw landings each. | 1,656 → 1,448 | 1 → 1 |
| `u2-drives` | **A** | E3/F1 | Eight actual drive bodies and carriers; long recessed comb vents, latch relief and status apertures replace dotted blank faces. | 9,408 → 6,656 | 1 → 1 |
| `psus` | **A** | P1/P2 | Five folded open supply shells, perforated rear mouths, recessed C20 inlets, release tabs and folding handles. | 3,060 → 12,320 | 2 → 1 |
| `psu-single` | **A** | P1/P2 | Sixth supply rebuilt identically but remains independent for the original service pose. | 612 → 2,464 | 2 → 1 |
| `densilink-cables` | **A** | H1 | Four source-routed smooth looms with connector housings; 22 curve segments, 12 radial segments. Hidden routing remains reconstruction. | 37,296 → 2,336 | 1 → 1 |
| `power-cords` | **A** | P1/P2 | Six source-routed smooth cords with connector ends; original paths and power-flow teaching preserved. | 13,824 → 3,504 | 1 → 1 |
| `baseboard-connectors` | **A** | G1 | Eight stepped keyed socket bodies with actual contact rows. | 10,272 → 1,280 | 3 → 1 |
| `rear-grille` | **A** | E4 | Slat proxy replaced by through-hex perforation, folded panel and captive ejector handles. | 1,368 → 10,756 | 1 → 1 |
| `scale-figure` | **A** | N1/N2 | Continuous implicit 1.70 m neutral human silhouette: 7–8-head proportions, shoulders/waist/pelvis, joint taper, hands/fingers and planted asymmetric feet. Graded as a scale silhouette, not a portrait. | 8,416 → 14,000 | 1 → 1 |
| `rack-neighbour` | **B** | S17/E2 | Declared context outline retained with an open-cell face. Its hidden internals and two 1U switch outlines remain schematic; they are outside the requested hero rebuild. | 2,352 → 4,474 | 2 → 1 |
| `fan-rotors` | **A** | F2/F3 | 40 independently pivoted, smoothly shaded swept/cambered rotors in one skinned draw; real engine sampling audited. Blade count remains illustrative. | 144,960 → 28,320 | 1 → 1 |
| `rack-ears` | **A** | E1–E3 | Token finish; eight raised rack fasteners retained. | 2,712 → 2,712 | 1 → 2 |
| `rails` | **A** | E2/E4 | Original paired slide rails retained; tokens replace literal paints. | 1,176 → 1,176 | 1 → 1 |
| `midplane` | **B** | S1/H1 | Interface reconstruction retained. NVIDIA identifies the connector role but publishes no manufacturing drawing of the hidden midplane. | 68 → 68 | 1 → 1 |
| `front-controls` | **A** | E1/E3 | Original controls and positions retained; recessed USB/VGA housings added on chassis. | 972 → 972 | 1 → 1 |
| `status-led` | **A** | E1/E3 | Existing operational pulse and status teaching preserved. | 2,976 → 2,976 | 1 → 1 |
| `fan-modules` | **A** | F1–F3 | 20 hollow dual-rotor cassettes, metal sleeves, perforated hex guards, shaped loop handles and status studs; no opaque fan disks. | 15,280 → 51,760 | 1 → 3 |
| `gpu-baseboard` | **A** | G1/G2 | Original measured board envelope retained with dark token solder mask. | 600 → 600 | 2 → 1 |
| `gpu-dies` | **A** | S6/S9 | 16 existing die volumes preserved exactly (two per package). | 192 → 192 | 1 → 1 |
| `hbm-stacks` | **A** | S9 | 64 existing memory-stack volumes preserved exactly (eight per package). | 768 → 768 | 1 → 1 |
| `gpu-heatsinks` | **A** | G1/G2 | Eight tall stepped towers, open fin gaps, black cheeks, metal inspection windows, raised screws and bent heat-pipe crests. | 28,320 → 34,928 | 5 → 4 |
| `motherboard` | **A** | H1/H2 | Original component placement retained with dark neutral solder-mask token. | 588 → 588 | 1 → 1 |
| `dimms` | **A** | H1–H3 | 32 keyed FR4 profiles in four banks of eight, individual DRAM packages, actual socket/ejector silhouettes and board gaps. | 384 → 9,472 | 1 → 3 |
| `pcie-switches` | **B** | S1/H1 | Original explicitly schematic switch positions retained; no public hidden-board layout supports a stronger authenticity claim. | 1,416 → 1,416 | 2 → 2 |
| `network-modules` | **A** | H1 | Two modules / eight device positions preserved; original source fin stacks retained. | 2,928 → 2,928 | 2 → 2 |
| `osfp-cages` | **A** | H1/E4 | Four source cages and openings retained; token finish. | 2,352 → 2,352 | 1 → 1 |
| `bluefield-dpus` | **A** | H1/E4 | Both source boards retained in original slots. | 1,176 → 1,176 | 1 → 1 |
| `pcie-risers` | **A** | H1 | Source slot positions and card profiles preserved. | 1,764 → 1,764 | 1 → 1 |
| `boot-drives` | **A** | H1 | Two existing M.2 devices and carrier retained. | 1,764 → 1,764 | 1 → 1 |
| `rear-io` | **A** | E4/H1 | Original manufacturer-based port layout retained. | 648 → 648 | 2 → 2 |
| `power-distribution` | **B** | S1 | Original explicitly schematic distribution arrangement retained; hidden factory busbar construction is not published. | 636 → 636 | 2 → 2 |
| `rack-frame` | **A** | S25/E4 | Bare frame retained; front sticks replaced with folded perforated rails, 42U and three real mounting holes per U per front post. | 84 → 5,436 | 1 → 1 |

**Totals: 314,896 → 335,516 triangles; 57 → 53 estimated model draws; GLB 0 → 1,497,668 bytes (1.498 MB).**

The static transport and retained runtime details are deliberately separate: repeated DIMMs/fins/fan guards stay engine-instanced or merged, static shells/web/figure use one mesh per selection, and all 40 rotors share one skinned mesh. The on-screen sum stays below 350k. The inherited partial on resume measured 313,403 triangles, 50 model draws and a 1,488,148-byte GLB; it was not accepted. The original grade-C topic had no GLB (0 bytes); the new asset stays below **1,500,000 bytes** after meshopt. Hardware/figure geometry is original CC0; the installed Helvetiker relief lettering has its Magenta/MgOpen notice preserved in LETTERING-LICENSE.txt and data/SOURCES.md. No third-party hardware model or photo texture is shipped.

### Behaviour, text and deletion

`tests/b200-server-rebuild.test.ts` checks all 41 IDs and original names, summaries, groups, connections, explode vectors, contexts/shell flags, service poses, flows, views, presets, specs and telemetry. Ray tests check the shipped eight package footprints, two sockets and two NVSwitches. Actual Three GLTFLoader skinning checks all 40 pivots, loop continuity, and transported bounds. The independent rotor audit measures a 40 RPM illustrative visual cycle, less than 1.12° easing deviation, and sub-micrometre pivot error; this is not a claim about real fan speed.

Only the bezel's stale “solid panel” sentence was minimally corrected in **both EN and ZH**. No teaching number or label changed. The unreferenced `public/illustrations/figures/b200-gpu-tray.webp` showing six GPUs was deleted; the only remaining name mentions are audit/history text and the regression test. No runtime content references it.

### Verification

Gate results and final asset identity are recorded in `scripts/geo/b200-server/evidence/delivery-audit.json`. No Chromium/e2e/shoot/browser/desktop run was performed, as explicitly prohibited by the brief. GPU visual acceptance, real draw counters, shadow costs and frame rate remain unmeasured.

Final gate receipt (2026-11-09): **check PASS · validate PASS (94 topics, zero errors/warnings) · build PASS (191 pages) · test PASS (276 files / 6,531 tests)**. Full suite command: `pnpm run test --maxWorkers=2 --testTimeout=30000`; the worker/timeout flags accommodate the pre-existing slow toad geometry test. Installed dependencies were isolated locally to remove the external symlink/deep-import problem; package.json and the lockfile were not changed. Build and full tests were run sequentially so the bundle-budget test read stable dist files. Eight focused B200 tests also passed. Final extra `tsc --noEmit` passed. Raw gate receipts are in `evidence/gates/`.

## GPU acceptance 2026-11-09

Shot headless on Metal (`pnpm shoot b200-server --beats --gpu`, paper and cinema, all 30 beats OK, console clean), plus close-ups of bezel, GPU tray, host tray, fan wall, PSUs and figure against main and against E1–E3, G2, F1, P1, N1/N2. Counts on screen match S3/S4: 8 GPU packages (16 dies, 64 HBM stacks), 2 NVSwitches, 8 heat-sink towers, 2 CPUs, 32 DIMMs, 20 fan modules in 4 × 5, 8 U.2 carriers, 6 PSUs with 6 cords. The bezel reads as the open-cell champagne foam with rounded corners and badge at every camera distance the orbit allows; its cells only look coarse in a macro view closer than the orbit floor, so the B stays as disclosed and is accepted. The figure is a properly proportioned 1.70 m adult in front and profile. Remaining B items (midplane, PCIe switches, power distribution, rack neighbour) are hidden or context parts. Renderer: 50–54 draw calls, 0.19–0.33 M triangles on screen; bezel views 50 fps on main and on this branch under the same host load (no regression), all other views 60 fps.

## Rebuild 2026-11-05 — residual polish (implemented 2026-11-09)

Scope: only this batch's named residual parts. **Self-grade A** means credible form, attachments and relief for the existing teaching role under docs/68; it is an offline judgement, pending Claude's GPU acceptance. Earlier accepted limitations on unrelated parts are not regraded here. No browser/desktop, git writes, engine/shared-kit changes or display-text edits.

Replaced the slanting tapered-looking top lines with constant 4.5 mm bore-diameter copper U heat pipes, 24 radial samples and smooth return bends. Their crests sit above the metal seat; both buried evaporator legs run down through the fin pack into the existing copper base. Retained the two authored exposed pipe paths per tower, eight towers, all fasteners, fin gaps, repeated stations, package counts and thermal/service teaching. Hidden routing is a reconstruction, not an asserted manufacturer pipe count.

References actually downloaded and viewed (development only; no runtime photo textures or third-party meshes):

- [Heatpipe.jpg](https://commons.wikimedia.org/wiki/File:Heatpipe.jpg) — Peter Niemayer; CC BY-SA 3.0.
- [Nvidia DGX-B200-HGX.jpg](https://commons.wikimedia.org/wiki/File:Nvidia_DGX-B200-HGX.jpg) — Pokiiri; CC BY-SA 4.0.

Review iterations:

1. **Look 1 → change:** The first round U crests sat too low in the top metal seat, so the exposed ends still looked pointed. Raised their straight condenser sections above the seat.
2. **Look 2 → change:** Extended both buried legs into the copper base and kept the full return path continuous. Reduced tessellation only along the long hidden legs; 24 radial samples retain round visible sections. Rechecked the 338k-scale maximum beat.
3. **Final look:** inspected the final decoded asset in front, three-quarter, profile and detail views, plus cinema. Sheets: `/tmp/atlas-residual-polish-2026-11-05/final/b200-server`. These are renders beside real photographic/histological references, not silhouettes. Photo crops/orientations are development comparisons; generic specimens and available oblique photographs are not a calibrated photogrammetric solve. A histological section has no photographed three-quarter view, so the same section references support the additional oblique model views. No unavailable camera angle is invented or claimed as a measured match.

| Part | Self-grade | Triangles before → after | Estimated model draws before → after |
|---|---|---:|---:|
| `gpu-heatsinks` | A, offline | 34,928 → 48,240 | 4 → 4 |

Inventory: **335,516 → 348,828 triangles**; **53 → 53 draws**. Maximum authored chapter/beat: **325,606 → 338,918 triangles**, **51 → 51 draws**. GLB: **1,497,668 → 1,497,668 bytes**. Counts use the decoded renderer mesh, expanded bilateral parts, instance matrices and each-animation path. They exclude shadows, flows and labels; no GPU FPS is claimed. Inventory can include mutually hidden stations; the authored maxima remain below 350k.

Preservation audit: all IDs/order, names, labels, EN/ZH summaries/details, teaching numbers, groups, chapter/beat references, flows, animations, rig/pose pivots, sorting and explosion inputs are unchanged. **20 unrelated decoded meshes** retain identical attribute streams, world transforms and oriented triangle topology (meshopt may cyclically rotate a triangle's three indices). No retained specimen was simplified to pay for this work.

The offline preview reuses `fossils-and-skeletons/studio-cpu.ts`: engine studio directions, light colours/intensities, hemisphere, exposure, sampled Three RoomEnvironment, GGX and ACES. Rig/exposure values are checked against live `Lighting.tsx`. For the two finish-sensitive residuals, the actual engine-generated sand/pile pixels are exported by `living-things/export-finish-maps.ts`, with UV derivatives selecting trilinear mips. CPU numerical environment filtering and lack of GPU contact-shadow/anisotropic filtering are explicit limits; this is not GPU acceptance. Float64 depth avoids artificial z-fighting in thin-sheet/recess macro views.

Reproduce the targeted build without regenerating stale editorial text:

```sh
pnpm tsx scripts/geo/b200-server/polish-pipes.ts
pnpm tsx scripts/geo/living-things/export-finish-maps.ts
pnpm tsx scripts/geo/plant/residual-review.mjs final b200-server
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
