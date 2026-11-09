# Circuits — 3D rebuild evidence

## Rebuild 2026-11-05

Executed 2026-11-09 against the requested 2026-11-05 brief. `REVIEW.md`, `FIXES.md` and an earlier `REBUILD-3D.md` did not exist for this topic. The B findings are in `docs/68-3d-realism/review-machines.md`: motor can, buzzer disc and uncertain gap-wire terminations. The modelling runbook and technical-plate / fact-discipline references were read first.

### What changed

Every named B finding was rebuilt. Existing A-quality torch, cell holder, bulbs, switches and circuit topology were retained. The whole-topic sweep additionally found and corrected a 24-segment straw, visibly polygonal wooden-stick ends and a perfectly regular round-section rubber band. The fan moved only to keep the shaft physically engaged after correcting motor proportions. All 36 data entries, 35 selectable IDs, group membership, chapter / beat references, three blades, two test clips, three holder cells, two torch cells, labels, teaching numbers, simulation bindings, flows, poses and animation IDs remain intact.

The existing engine supports these real forms: smooth curved panels, hollow lathes, swept sheet sections and bevelled extrusions with real holes. No unsupported primitive or substitute GLB is needed. GLB before / after: **0 / 0 bytes**; no runtime external request, texture, decal or scan was added.

### References (2–4 per rebuilt hero)

| Hero | Photographs / drawings inspected | Use / licence |
|---|---|---|
| Motor | [Mabuchi FA-130RA drawing](https://www.pololu.com/file/0J11/fa_130ra.pdf); [Pololu motor photograph](https://www.pololu.com/product/77); [Commons Mabuchi collection](https://commons.wikimedia.org/wiki/File:マブチモーター.JPG) | 25 mm can / bell envelope, 20.1 × 15.1 mm flattened section, 2 mm shaft and 9.4 mm exposure; bush, punched tabs and crimps. Manufacturer references are development-only; collection by 星空マニア, CC BY-SA 3.0. Can vent arrangements vary among FA-130 versions; the rebuild follows the manufacturer's vented form. |
| Buzzer | [Commons 01](https://commons.wikimedia.org/wiki/File:Electromagnetic_buzzer_01.jpg); [03](https://commons.wikimedia.org/wiki/File:Electromagnetic_buzzer_03.jpg); [06](https://commons.wikimedia.org/wiki/File:Electromagnetic_buzzer_06.jpg); [Same Sky CMI-1210 drawing](https://www.sameskydevices.com/product/resource/cmi-1210-5-95t.pdf) | Jdx, CC BY-SA 3.0; round moulded body, sound hole, rim and two pins. Manufacturer drawing is development-only and supplies a matching generic housing / port view. The geometry is a generic magnetic buzzer, not a claim that a photographed 12 V model works at 3 V. S18's 3 V teaching values are unchanged; soldered display leads are reconstructed. |
| Clip pair | [Clamped to wire](https://commons.wikimedia.org/wiki/File:Alligator_Clip_clamped_to_wire.jpg); [Pivot close-up](https://commons.wikimedia.org/wiki/File:Alligator_Clip_pivot.jpg); [Crocodile Clip](https://commons.wikimedia.org/wiki/File:Crocodile_Clip.jpg) | Lambtron, CC BY-SA 4.0. Stamped channel, tooth profile, hinge pin, compression spring, thumb pad and wire crimp. The third reference has a cantilever hinge; it supports the jaw / crimp comparison only. |

Local originals / PDF rasterizations are under `scripts/geo/circuits/refs/` (ignored development references). No reference photo is used as a material. New material choices use the engine's canonical steel, brass, enamel, powder and rubber families, with technical-plate tokens for restrained insulation and sample tints.

### Lighting and comparison evidence

`preview.ts` renders the exact parsed `parts.json` through the engine's actual `partPieces()` and `resolveMaterialLook()` functions. `studio-cpu.ts` reuses the fossils renderer's linear-working-space GGX, sampled real `RoomEnvironment`, hemisphere, key / fill / rim and ACES matrices. The preview asserts the current `Lighting.tsx` values actually used by the renderer, including each direct-light colour / intensity and exposure, instead of checking a separate token proxy. Per-family environment intensity is applied.

Paper: key 2.6 / fill 0.55 / rim 0.9 / hemisphere 0.75 / environment 0.7 / exposure 1.05. Cinema: 2.4 / 0.28 / 1.15 / 0.35 / 0.8 / 1.0. Direction vectors are copied from the engine's studio rig.

Evidence directory: **`/Users/gavin/work/atlas-q-circuits-forces-magnets/scripts/geo/circuits/comparisons`**. For each hero it contains `final-*-four-views.png`, plus separate front, three-quarter, profile and identifying-detail sheets. It also contains the three looked-at three-quarter iteration sheets per hero, paper / cinema whole-board images, cinema motor / buzzer and a rear motor detail. Clip macros isolate the left member of the pair and the nearby segment of its actual wire geometry so unrelated board wires cannot hide the joint.

Photo camera intrinsics are unavailable. Angles are manually approximated; orthographic motor front / profile use the manufacturer drawing, and buzzer sound-face uses a related generic housing drawing. The clip end-on reference is oblique, explicitly labelled on its sheet. These are honest comparison sheets, not calibrated pixel-registration proofs. CPU PMREM integration is finite; mean procedural roughness replaces GPU map sampling, and GPU shadow / normal-map filtering is not reproduced. This is studio/ACES-matched offline evidence, **not GPU browser acceptance**. No browser or desktop was launched.

### Two look → change rounds (plus final inspection)

1. **Round 1 looked:** `round1-{motor,buzzer,clips}-three-quarter.png`. Motor still looked tan, had the wrong front slots and an overlong end bell. Buzzer's token colour would turn white in cinema, and its plus sign was too prominent. Clip cheeks made an angular box around the hinge. **Changes:** canonical steel / black material families; FA-130 drawing proportions, true front bore, rear vents and shortened bell; punched opposed tabs; fan lowered onto the corrected shaft; inward folded and toothed channel cheeks, real hinge bores, thumb pad and slimmer clip profile. Buzzer reduced from the old 30 mm puck to a 12 mm housing with a deep port and real pins / solder joints.
2. **Round 2 looked:** `round2-{motor,buzzer,clips}-three-quarter.png`. One motor vent still showed a pale opposite wall; terminals did not seat convincingly, and the clip spring read as a loose sideways loop. Clip beds remained too straight and uniform. **Changes:** dark internal motor magnet backing; terminals seated into the end bell; compression spring axis corrected to Y with both ends touching the handles; tapered curved sheet-section clip beds and smooth sampled hinge cheeks; subtler same-material buzzer polarity relief. Additional close-up inspection increased the formed motor perimeter to 76 samples per circular arc, exposed the rear end-bell bearing through a real bore, and darkened the recessed buzzer diaphragm so the sound port remains a cavity in an axial view. The final axial sheet exposed a sliver caused by the front cap's broad bevel approaching the small vent. A nested shoulder / inner face was also inspected and rejected because its bevel overlap produced another sliver. The final cap is one stamped steel extrusion with a narrow 0.12 mm edge bevel, a true centre bore and a true small vent at a 5.1 mm radial offset. This keeps the geometry valid; its edge radius is narrower than the deep-drawn cap in the Pololu photograph, so it is a generic educational motor can rather than an exact manufacturer replica. The corrected profile comparison also exposed a bearing boss larger than the drawing: it was corrected to Ø6.15 mm, and the front shaft exposure / fan engagement corrected to 9.4 mm / y = 0.0340 m before rerendering the motor matrix.
3. **Final inspection:** front / profile / three-quarter / detail, both themes and whole-board view. The right clip and unrelated wires are omitted only from development close-up crops. The complete board view includes both clips and all original wiring. No model component, ID or circuit mechanism is omitted from runtime.

### Per-part self-grade and geometry counts

A means credible against docs/68's shape criterion and the reference family, subject to the GPU limitation above. Retained rows were checked in the whole-model sweep; their geometry is unchanged. Counts include every tessellated triangle before culling. Calls are material-slot estimates for a normal opaque pass, excluding shadow / cutaway / UI / flow extra passes.

| Part ID | Self-grade | Before → after triangles | Before → after calls | Assessment |
|---|---:|---:|---:|---|
| `torch-body` | A | 2,304 → 2,304 | 3 → 3 | Retained formed tube / stepped head / lens bezel and shell behaviour. |
| `torch-cells` | A | 1,536 → 1,536 | 2 → 2 | Retained two correctly sized AA cells, positive nubs and wrap bands. |
| `torch-spring` | A | 2,112 → 2,112 | 1 → 1 | Retained conical helical tail spring contacting the rear cell. |
| `torch-strip` | A | 36 → 36 | 1 → 1 | Retained functional bent brass strip; its flat stock is intentional. |
| `torch-switch` | A | 612 → 612 | 2 → 2 | Retained bevelled slider, contacts and switching state. |
| `torch-bulb` | A | 10,688 → 10,688 | 3 → 3 | Retained glass globe, threaded base, filament and supports. |
| `torch-reflector` | A | 960 → 960 | 1 → 1 | Retained hollow parabolic reflector / lens geometry. |
| `cell-holder` | A | 4,128 → 4,128 | 3 → 3 | Retained moulded cradle, springs and terminal contacts. |
| `cell-1` | A | 960 → 960 | 2 → 2 | Retained AA nub, crimped end profile and wrap band. |
| `cell-2` | A | 960 → 960 | 2 → 2 | Retained AA nub, crimped end profile and wrap band. |
| `cell-3` | A | 960 → 960 | 2 → 2 | Retained AA nub, crimped end profile and wrap band. |
| `cell-cutaway` | A | 1,776 → 1,776 | 6 → 6 | Retained cited cutaway shell, separated layers and terminal. |
| `base-board` | A | 7,020 → 7,020 | 3 → 3 | Retained bevelled teaching board, lamp bases and brass terminal fittings. |
| `main-switch` | A | 396 → 396 | 2 → 2 | Retained brass knife blade, hinge and contact fork. |
| `switch-x` | A | 396 → 396 | 2 → 2 | Retained brass knife blade, hinge and contact fork. |
| `switch-y` | A | 396 → 396 | 2 → 2 | Retained brass knife blade, hinge and contact fork. |
| `switch-z` | A | 396 → 396 | 2 → 2 | Retained brass knife blade, hinge and contact fork. |
| `leads` | A | 79,744 → 79,744 | 2 → 2 | Preserved wiring topology / paths; rebuilt clip crimps and boots now physically surround the existing gap-wire endpoints. No new open circuit is introduced. |
| `gap-clips` | A | 912 → 34,512 | 2 → 3 | Rebuilt pair: tapered rounded stamped channel beds, inward folded serrated cheeks, circular hinge bores and headed pins, compression spring in contact with both handles, dished thumb pads, hollow insulation boots and wire crimps. |
| `wire-cutaway` | A | 12,320 → 12,320 | 2 → 2 | Retained nested copper core / insulation cross-section. |
| `bulb-a` | A | 2,640 → 2,640 | 2 → 2 | Retained miniature globe, socket and threaded base. |
| `filament-a` | A | 9,472 → 9,472 | 1 → 1 | Retained helical filament and two real support-wire paths. |
| `bulb-b` | A | 2,640 → 2,640 | 2 → 2 | Retained miniature globe, socket and threaded base. |
| `filament-b` | A | 9,472 → 9,472 | 1 → 1 | Retained helical filament and two real support-wire paths. |
| `buzzer` | A | 5,424 → 7,128 | 3 → 4 | Rebuilt: 12 × 10 mm generic magnetic-buzzer housing; deep sound port, recessed dark diaphragm, moulding rim, two soldered pins and flexible leads; black finish remains black in both themes. |
| `motor` | A | 952 → 24,484 | 2 → 4 | Rebuilt: flattened 20.1 × 15.1 mm can; 25 mm body, rear vent apertures with dark internal backing, narrow-bevel stamped front cap, swaged bearing / bronze bush, bevelled 2 mm shaft, punched solder tabs, end-bell bore and two retaining tangs. |
| `motor-fan` | A | 2,056 → 2,056 | 1 → 1 | Preserved three shaped / pitched plastic blades; shaft engagement corrected by lowering the existing fan centre 5.0 mm. Animation axis and count unchanged. |
| `bulb-cutaway` | A | 12,960 → 12,960 | 4 → 4 | Retained opened glass envelope / filament / screw base. |
| `paper-clip` | A | 16,768 → 16,768 | 1 → 1 | Retained continuous bent steel-wire paper clip. |
| `copper-wire` | A | 4,416 → 4,416 | 1 → 1 | Retained bent bare copper test wire. |
| `foil-strip` | A | 588 → 588 | 1 → 1 | Retained thin bevelled aluminium test strip; flat sheet is the actual sample form. |
| `pencil-lead` | A | 192 → 192 | 1 → 1 | Retained 48-sided graphite rod; a straight small cylindrical lead is the actual sample form. |
| `plastic-straw` | A | 192 → 512 | 1 → 1 | Sweep correction: 24 → 64 angular divisions; hollow rim and dimensions preserved. |
| `wooden-stick` | A | 156 → 796 | 1 → 1 | Sweep correction: coarse end polygons → 52-sample rounded stick outline, retaining the existing bevel and dimensions. |
| `rubber-band` | A | 3,456 → 3,840 | 1 → 1 | Sweep correction: regular round-section torus → closed, flattened, uneven loop with varying section; one band remains one object. |
| `bench` | A | 2,964 → 2,964 | 2 → 2 | Retained supporting bench, feet and material tray; context only. |

**Entire topic including all hidden cutaways, tray and bench:** 202,960 → **263,140 triangles**; 70 → **74 estimated calls**; 0 → **0 GLB bytes**. This conservative all-on geometry remains below 350,000 triangles. The normal chapter views hide studies and unused loads, so their actual simultaneous count is lower. No GPU FPS is claimed.

### Facts, attachment and mechanism checks

- Motor's front shaft top is y = 0.0344 m, inside the moved fan hub around y = 0.0340 m. The blade count, animation target and Y axis are preserved.
- The existing gap-wire endpoints are (−0.117, 0.016, 0.115) and (−0.023, 0.016, 0.115) m. The rebuilt rear crimp / boot bores surround these exact endpoints. The open **30 mm teaching gap** remains between jaw tips at x = −0.085 and −0.055 m; no copper bridge is silently added.
- The two clip spring ends contact the lower / upper handle surfaces; hinge pins pass through real cheek bores. Explosion transforms remain attached to the original `gap-clips` part.
- The buzzer remains one pulse target with two leads; its current model, frequency and threshold are unchanged. New EN / ZH wording only identifies the magnetic housing, sound opening, generic physical scale and soldered leads. The motor and clip first descriptions were minimally updated to describe the visible can / end bell / apertures / punched tabs and serrated spring clips.
- `partsFile.parse()` validates the exact persisted input during each rebuild. No engine, widget, shared kit, framing, package or git write was made.

### Reproduction and gates

```sh
pnpm tsx scripts/geo/circuits/rebuild.ts
pnpm tsx scripts/geo/circuits/preview.ts final
pnpm tsx scripts/geo/circuits/compare-matrix.ts final
CIRCUITS_SHOTS=none pnpm tsx scripts/geo/circuits/preview.ts metrics-final
```

The parent session runs `pnpm check`, `pnpm validate`, `pnpm test` and `pnpm build` over the final combined worktree and reports their exact status. GPU browser acceptance remains assigned to Claude per the brief. All functional structures self-grade A against docs/68’s credible-shape criterion. The can-cap fillet is a deliberate remaining approximation: its 0.12 mm edge is narrower than the deep-drawn manufacturer shoulder because the broad primitive bevel produced invalid vent-adjacent geometry. Exact manufacturer fillet matching and calibrated photo registration are not claimed. GPU acceptance and numerical CPU/GPU rendering differences remain as described above.

### Combined final gates — 2026-11-09

All required gates passed on the final combined geometry and persisted pose data:

- `pnpm check`: 1,233 files, 0 errors, 0 warnings; 7 existing hints.
- `pnpm validate`: 94 topics, 0 errors, 0 warnings.
- `pnpm test`: 277 files and 6,530 tests passed, with two workers.
- `pnpm build`: 191 pages built; 327 PWA precache entries.

Reproduce with `scripts/geo/forces/run-gates.sh`. The pre-existing worktree `node_modules` symlink points outside writable roots, so the unchanged package scripts ran in `/private/tmp/atlas-cfm-gates` with writable local caches. SHA-256 checks confirm the tested topic data and both public GLBs are byte-identical to this worktree. Gate metadata: `scripts/geo/forces/evidence/gates-final.json`; transient logs: `/private/tmp/atlas-cfm-{check,validate,test,build}-final.log`. `git diff --check` also passed. No browser/desktop or git writes were used.

Curated cross-topic comparison directory: `/Users/gavin/work/atlas-q-circuits-forces-magnets/scripts/geo/forces/comparison-sheets/batch2-final` (39 sheets plus CREDITS.md). Original iterations, individual renders and exact reference attributions remain in-topic. GPU acceptance, approximate photo angles and the documented forces paper B limitation are not waived by these software gates.

## GPU acceptance 2026-11-09 (Claude)

Close-ups on the GPU next to main: `motor` (flattened can, end bell, vents, bearing, tabs), `buzzer` (12 mm magnetic buzzer with a sound hole) and `gap-clips` (serrated crocodile clips with crimps) are A. No changes needed.
