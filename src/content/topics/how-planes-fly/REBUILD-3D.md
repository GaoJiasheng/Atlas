# how-planes-fly · 3D rebuild evidence

## Rebuild 2026-11-05

Executed 2026-11-09 in the requested worktree; section date follows the batch brief.

Rebuilt every aircraft item identified by review-machines.md, including the detailed notes beyond the two headline items. The generic airliner remains the authored nominal 40 m / 36 m design study at 1:10, not an A330 replica. CF6 imagery establishes engineering relationships; all original teaching stage/blade counts remain drawing choices.

### References inspected

Nose/cockpit: front + nose + profile (3). Wing, tail, pylon and tips: front + airframe + drawing (3). Engine: engine + engine-section + engine-photo + engine-detail (4). The drawing is an illustrative 3-view, not measured CAD.

- **front** — [Airbus A330 Front View.jpg](https://commons.wikimedia.org/wiki/File:Airbus_A330_Front_View.jpg); AlexanderCraker; [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0).
- **nose** — [G-VGEM Airbus A330 Virgin Atlantic Nose (9319525067).jpg](https://commons.wikimedia.org/wiki/File:G-VGEM_Airbus_A330_Virgin_Atlantic_Nose_(9319525067).jpg); Aeroprints.com; [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0).
- **profile** — [PK-GPA Airbus A330 Garuda Indonesia Nose (7590247646).jpg](https://commons.wikimedia.org/wiki/File:PK-GPA_Airbus_A330_Garuda_Indonesia_Nose_(7590247646).jpg); Aeroprints.com; [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0).
- **airframe** — [Aeroflot Airbus A330 Kustov.jpg](https://commons.wikimedia.org/wiki/File:Aeroflot_Airbus_A330_Kustov.jpg); Sergey Kustov; [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0).
- **drawing** — [Airbus A330-300 v1.0.png](https://commons.wikimedia.org/wiki/File:Airbus_A330-300_v1.0.png); Julien.scavini; [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0).
- **engine-photo** — [National Air and Space Museum - Washington DC - General Electric CF6.jpg](https://commons.wikimedia.org/wiki/File:National_Air_and_Space_Museum_-_Washington_DC_-_General_Electric_CF6.jpg); Donatingpictures; [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0).
- **engine-detail** — [National Air and Space Museum - Washington DC - General Electric CF6 - Compressor and Combustor Cut Out.jpg](https://commons.wikimedia.org/wiki/File:National_Air_and_Space_Museum_-_Washington_DC_-_General_Electric_CF6_-_Compressor_and_Combustor_Cut_Out.jpg); Donatingpictures; [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0).
- **engine** — [CF6-6 engine cutaway.jpg](https://commons.wikimedia.org/wiki/File:CF6-6_engine_cutaway.jpg); This image is a work of an unknown Federal Aviation Administration employee.; [Public domain](https://commons.wikimedia.org/wiki/File:CF6-6_engine_cutaway.jpg).
- **engine-section** — [Overall layout of General Electric CF6.svg](https://commons.wikimedia.org/wiki/File:Overall_layout_of_General_Electric_CF6.svg); Olivier Cleynen; [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0).

Reference images are development-only in `scripts/geo/how-planes-fly/refs/`; none ships in public/. Comparison sheets contain resized/cropped references and occasionally horizontal flips as marked. Reference portions retain the stated CC BY / CC BY-SA licence and attribution; the sheet composition is offered under the most restrictive reference licence in that sheet. Geometry is original code under the repository licence.

### Studio evidence and iteration log

Used a copy of the fossils-and-skeletons CPU PBR/RoomEnvironment renderer, reading the **shipping meshopt-decoded GLB** plus production `partPieces`, actual theme tokens and `resolveMaterialLook`. Key/fill/rim directions and intensities, hemisphere, room environment, exposure (paper 1.05; cinema 1.0), linear-to-sRGB conversion and Three's ACES fit follow the installed renderer. Rig checks inspect Lighting.tsx, not a proxy token file. Paper and cinema render sets are included. The sampled CPU environment filtering and omitted micro-normal maps on retained primitives are numerical approximations; browser shadows, HUD framing, X-ray sorting and GPU pixels remain for main-session GPU acceptance.

1. **Look 1 — round1/comparisons:** the nose panes sat too high and were too separated in profile; wing/tail normals revealed reversed winding; the separate belly surface read as a loose appendage. Corrected winding, integrated the belly in the continuous fuselage, reduced the cuff, and moved the glazing forward/down.
2. **Look 2 — round2/comparisons:** an unwrapped-nose join made a dotted seam, the front glazing still read as roof windows, and the tail tips were open. Replaced the separate nose/body patches by one continuous skin, laid six apertures across the forward shoulder, capped all lofts, and retained all hinge coordinates.
3. **Look 3 — round3/comparisons and final:** frontal inspection exposed a pylon protruding above the wing. Replaced the sweep by a closed pylon airfoil in the correct Y stations; added a blended wingtip transition, blade tip/root caps, shaped OGVs and attached injectors. The final photos include a real museum fan/combustor and an orthographic aircraft drawing. Final source materials explicitly opt into atlasSurface, removing family normal maps from UV-free lofts; CPU and GPU now use the same source roughness/metalness. Analytic pole normals and a square-root ogive remove the last tiny conical tip. A fourth, closely matched nose crop showed oversized pane height; reduced it by about a quarter and lowered the brow. Closed pocket backs and reveal walls preserve stencil-section volume behind the inset glazing. The final control-surface lofts also remove a section-thickness step at the original hinges. The final mechanism audit replaced the OGV fan primitive with six blade-only lofts: its automatically generated hub would otherwise plug the core. An independent axial ray through the shipping GLB verifies that the core passage is unobstructed. Replaced the detached slat sweep with a closed leading-edge cuff in a matching wing cutout; retained the original deployment translation. Kept 36 windows per side but distributed them across the full cylindrical cabin instead of ending the row near mid-body.

Final comparison directory: `/Users/gavin/work/atlas-q-planes-aircon/scripts/geo/how-planes-fly/evidence/final/comparisons`.

Aircraft/engine sets include front, three-quarter, profile, nose/wing-root/tail/blade close-ups. Inverter sets include front, three-quarter, edge profile, capacitor detail and installed assembly. View orientation is matched where photographs/drawings allow; a generic teaching model and different cameras are not asserted to be photogrammetric registration. The board edge profile is cross-checked against component photographs rather than a dimensioned manufacturer drawing.

### Part-by-part self-grade against docs/68

A means convincing geometry for the authored design-study role: real silhouette/section, attachment and movement, counts preserved; it is a self-grade from offline evidence and **not** GPU acceptance. No B/C item is intentionally left unfinished. Manufacturer-identical PCB routing, aircraft livery/landing gear and real CF6 stage counts are outside the existing generic teaching design and have not been invented.

| Part | Self-grade | Change / sweep result | References | Triangles before → after | Draws estimate before → after |
|---|---|---|---|---:|---:|
| `fuselage-shell` | A | Blunt elliptical ogive; continuous smooth skin, integrated belly canoe, 72 rounded cabin panes distributed along the full cabin. | front, nose, profile | 9,312 → 33,280 | 2 → 1 |
| `cockpit-glazing` | A | Six recessed panes with real raised frames and a nose-only selection anchor; opaque glossy glazing. | front, nose, profile | 436 → 3,072 | 1 → 1 |
| `wing-left` | A | Capped tapered airfoil loft, root cuff, three attached flap-track canoe fairings and integrated belly junction; original 6° dihedral and control hinges retained. | front, airframe, drawing | 1,568 → 8,560 | 1 → 1 |
| `wing-right` | A | Mirrored manufactured wing loft; same root, three flap-track fairings and dihedral correction. | front, airframe, drawing | 1,568 → 8,560 | 1 → 1 |
| `wing-tip-left` | A | Curved transition into a tapered tip device, with closed tips. | front, airframe, drawing | 60 → 4,224 | 1 → 1 |
| `wing-tip-right` | A | Curved transition into a tapered tip device, with closed tips. | front, airframe, drawing | 60 → 4,224 | 1 → 1 |
| `wing-box-skin` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 480 → 480 | 1 → 1 |
| `front-spar` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,764 → 1,764 | 1 → 1 |
| `rear-spar` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,764 → 1,764 | 1 → 1 |
| `wing-ribs` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,356 → 1,356 | 1 → 1 |
| `aileron-left` | A | Airfoil trailing section matches the new wing thickness at the original 78% hinge; original roll pose retained. | airframe, drawing | 60 → 2,208 | 1 → 1 |
| `aileron-right` | A | Airfoil trailing section matches the new wing thickness at the original 78% hinge; original roll pose retained. | airframe, drawing | 60 → 2,208 | 1 → 1 |
| `spoiler-left` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 60 → 60 | 1 → 1 |
| `flap-left` | A | Matching closed airfoil section removes a thickness step at the original high-lift hinge. | airframe, drawing | 92 → 2,208 | 1 → 1 |
| `flap-right` | A | Matching closed airfoil section removes a thickness step at the original high-lift hinge. | airframe, drawing | 92 → 2,208 | 1 → 1 |
| `slat-left` | A | Seated closed leading-edge airfoil cuff in a matching wing cutout; original deployment translation retained. Removes the original detached sweep. | front, airframe, drawing | 6,400 → 2,176 | 1 → 1 |
| `slat-right` | A | Seated closed leading-edge airfoil cuff in a matching wing cutout; original deployment translation retained. Removes the original detached sweep. | front, airframe, drawing | 6,400 → 2,176 | 1 → 1 |
| `tailplane-left` | A | Closed loft with rounded leading edge, fine trailing edge and decreasing section thickness. | airframe, drawing | 60 → 2,176 | 1 → 1 |
| `tailplane-right` | A | Closed loft with rounded leading edge, fine trailing edge and decreasing section thickness. | airframe, drawing | 60 → 2,176 | 1 → 1 |
| `elevator-left` | A | Matching tapered elevator; original pitch hinge and pose retained. | airframe, drawing | 60 → 2,208 | 1 → 1 |
| `elevator-right` | A | Matching tapered elevator; original pitch hinge and pose retained. | airframe, drawing | 60 → 2,208 | 1 → 1 |
| `fin` | A | Closed aerodynamic section; root-to-tip thickness taper, same rudder hinge. | airframe, drawing | 60 → 2,176 | 1 → 1 |
| `rudder` | A | Matching tapered aerodynamic section; original yaw pose pivot. | airframe, drawing | 60 → 2,208 | 1 → 1 |
| `nacelle-left` | A | Smooth annular lip and separate core-cowl form; closed airfoil pylon seated between cowl and wing, replacing a slab. | front, airframe, drawing | 1,548 → 5,888 | 2 → 1 |
| `nacelle-right` | A | Smooth annular lip and separate core-cowl form; closed airfoil pylon seated between cowl and wing, replacing a slab. | front, airframe, drawing | 1,548 → 5,888 | 2 → 1 |
| `fan-left` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 7,936 → 7,936 | 1 → 1 |
| `fan-right` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 7,936 → 7,936 | 1 → 1 |
| `engine-shell` | A | Six blade-only, closed airfoil OGVs replace rectangular stays; no fan hub blocks the core. Original casing and intake retained. | engine, engine-photo, engine-detail | 5,192 → 5,408 | 1 → 1 |
| `fan-disc` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 9,984 → 9,984 | 1 → 1 |
| `bypass-duct` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 4,352 → 4,352 | 1 → 1 |
| `compressor-bank` | A | 24 curved, twisted, capped airfoils per row; original row positions/counts and progressively changing gas-path height. Compressor and turbine camber/stagger differ. | engine, engine-section, engine-detail | 1,440 → 41,472 | 1 → 1 |
| `compressor-rotor` | A | 24 curved, twisted, capped airfoils per row; original row positions/counts and progressively changing gas-path height. Compressor and turbine camber/stagger differ. | engine, engine-section, engine-detail | 1,440 → 41,472 | 1 → 1 |
| `combustor-ring` | A | Original two open annular liners retained; twelve attached fuel-injector elbows added upstream. | engine, engine-section, engine-detail | 2,048 → 13,280 | 1 → 1 |
| `turbine-bank` | A | 24 curved, twisted, capped airfoils per row; original row positions/counts and progressively changing gas-path height. Compressor and turbine camber/stagger differ. | engine, engine-section, engine-detail | 1,152 → 31,104 | 1 → 1 |
| `hp-turbine-rotor` | A | 24 curved, twisted, capped airfoils per row; original row positions/counts and progressively changing gas-path height. Compressor and turbine camber/stagger differ. | engine, engine-section, engine-detail | 576 → 10,368 | 1 → 1 |
| `lp-turbine-rotor` | A | 24 curved, twisted, capped airfoils per row; original row positions/counts and progressively changing gas-path height. Compressor and turbine camber/stagger differ. | engine, engine-section, engine-detail | 864 → 20,736 | 1 → 1 |
| `lp-shaft` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 704 → 704 | 1 → 1 |
| `hp-shaft` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 2,944 → 2,944 | 1 → 1 |
| `core-nozzle` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 1,408 → 1,408 | 2 → 2 |
| `bypass-nozzle` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 768 → 768 | 1 → 1 |
| `foil-sample` | A | Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role. | Existing topic SOURCES.md; whole-model studio view | 508 → 508 | 1 → 1 |
| `chord-marker` | A | Retained: mathematical marker, not a physical specimen or machine part. | Existing topic SOURCES.md; whole-model studio view | 17,280 → 17,280 | 1 → 1 |
| `inflow-reference` | A | Retained: mathematical marker, not a physical specimen or machine part. | Existing topic SOURCES.md; whole-model studio view | 11,232 → 11,232 | 1 → 1 |
| `angle-marker` | A | Retained: mathematical marker, not a physical specimen or machine part. | Existing topic SOURCES.md; whole-model studio view | 2,976 → 2,976 | 1 → 1 |
| `display-plinth` | A | Retained: context wall or display plinth; an intentionally planar architectural/display surface. | Existing topic SOURCES.md; whole-model studio view | 972 → 972 | 2 → 2 |

### Performance and teaching contract

All authored parts (a conservative total even though aircraft stations are never displayed together): **116,700 → 338,296 triangles**, **50 → 47 estimated geometry draw calls**. These exclude engine shadow/stencil passes, floor and flow; no GPU FPS is claimed. GLB: **0 → 1,041,704 bytes** (meshopt; under 1.5 MB).

Original part IDs and counts, groups, teaching numbers, chapter/beat references, pose pivots, flow coordinates, animations, exploded directions and connections retained. Aircraft cockpit detail was minimally corrected in **EN + ZH**: it now says six inset panes and frames instead of an unframed band. One existing combustion test now selects the two liner walls explicitly, because twelve injectors are additional geometry; the independent gas-passage checks are retained.

### Reproduce

```sh
python3 scripts/geo/how-planes-fly/fetch-refs.py
pnpm tsx scripts/geo/how-planes-fly/build-parts.ts
pnpm tsx scripts/geo/how-planes-fly/preview-studio.ts how-planes-fly final
pnpm tsx scripts/geo/how-planes-fly/compare.ts how-planes-fly final
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

Exact commands, sanitized logs, source hashes, counts and production-asset checks are in `scripts/geo/how-planes-fly/evidence/gates/results.json` and adjacent logs. `git diff --check` passed. No GPU acceptance, browser e2e/shoot or FPS result is claimed; the user explicitly reserved browser acceptance for the main session. All final grades above remain offline self-grades pending that review.

## GPU acceptance 2026-11-09 (Claude)

- Accepted on the GPU (paper + cinema, all 38 beats, 4K close-ups of nose, engine core and hero). Nose, glazing, lofts and blade rows read correctly; explode, cutaway and stencil sections still work.
- Fixed: regenerating `parts.json` from `build-parts.ts` + `text.ts` had reverted the shipped readability/editorial text of 44 parts (54 label/summary/detail fields), because `text.ts` predates those passes. The shipped text from main is restored; only the cockpit-glazing detail carries the new "six panes in frames" wording, rewritten on top of main's sentence. `text.ts` is still stale: do not regenerate part text from it without porting the shipped strings first.
- Evidence PNGs (renders and comparison sheets with reference crops) are kept locally, not in git (`evidence/.gitignore`).
- GPU perf (M5 Max, 1520×1023): 116k triangles / 25 calls on the airliner, 184k / 17 on the engine section; 60 fps settled.

## Residual windscreen pass reverted 2026-11-09

The residual pass moved the panes up and aft. On the GPU they read as thin slits at 86-95% of the local section height, further from the A330 than the accepted layout, so the nose and glazing stay as on main. Measured from the PK-GPA near-profile photograph, the A330 pane band sits 62-79% up the local section and 0.24-0.65 fuselage diameters aft of the tip. A trial at those corners left the middle side pane pale and creased the brow. The cause was not diagnosed, so the layout needs its own rebuild pass.

## Windscreen and nose rebuild 2026-11-10

- Nose outline re-measured from the side and top views of the A330-300 three-view (`drawing`, Julien.scavini, CC BY-SA 3.0), scaled to the 0.4 m model diameter: radius, centre drop and plan/side width ratio at 18 stations, then least-squares fitted in u = sqrt(distance from tip) so the skin is smooth to the second derivative (no reflection creases), round at the tip and flush with the barrel at x = -1.25. The section is slightly taller than wide near the nose, as in the drawing. The skin is now one closed grid with analytic normals; the glazing no longer cuts holes in it.
- Six panes, three each side: front panes authored in the front view, sliding and aft panes in the side view, from the `drawing`, `profile` (PK-GPA) and `nose` (G-VGEM) references; straight edges with small radiused corners, projected on the skin. Band 0.24-0.63 fuselage diameters aft of the tip, 74-89 % up the local section in the drawing (the two photographs bracket it: 60-75 % from above, 84-96 % from below). Each pane is shaded as one flat sheet, tipped down so it mirrors the dark lower hemisphere; this fixes the pale side pane of the reverted pass.
- Frames: light raised seal around each pane. Wipers: one parked along the sill of each front pane, arm from a pivot boss below the glass, as in the profile photograph.
- Shipping GLB 1,041,704 → 1,035,964 bytes; airliner 117,850 triangles, 25 calls (was 115,968 / 25).
- angle-and-stall-5: the right engine now hangs from its pylon under an X-ray right wing panel instead of floating.

### Windscreen round 2 (2026-11-10)

- Panes enlarged and the band lengthened: sill 0.046 and head line 0.088 above the cabin axis (three-view 0.038-0.078; head-on reference 0.054-0.093), from 0.24 to 0.72 fuselage diameters aft of the tip (was 0.63). Posts between panes are 5 mm at model scale, so the frames read as thin mullions.
- Front panes keep a level top edge that follows the crown. The sliding window's front edge runs parallel to the windscreen's rear edge across a thin post; the aft window is a near-rectangle with one cut top-rear corner. Seal frames and wipers kept.
- Nose tip: radius fit pinned to the first measured station (tip radius 24 mm, was about 3 mm); centre drop and width ratio interpolate in x, so the cap has no nub; the forward normal is applied only at the tip point.
- GLB 1,040,440 bytes; airliner 119,066 triangles, 25 calls.
