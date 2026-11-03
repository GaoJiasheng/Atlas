# Energy conversion · 3D rebuild · 2026-11-02

Build: `pnpm tsx scripts/geo/energy-conversion/build-parts.ts`. The generator replaces reviewed assemblies in `data/parts.json`; existing text and the rest of the scene remain the authoring source. Shared pure generator: `scripts/geo/kits/bicycle.ts`. No engine changes, dependencies, external meshes or runtime requests.

| Parts | Rebuilt form |
|---|---|
| `bicycle-frame` | Diamond frame with joined top/down/seat/head tubes, paired stays, tapered raked fork and crown, dropout bosses, headset, bottom bracket, saddle/post/rails, swept handlebar and grips. Saddle and grips support the inverted bicycle. Added headlamp bracket and fixed dynamo stay clamp. |
| `front-wheel`, `rear-wheel` | Smooth tyre sections, shaped rims and flanged hubs; 28 dished, crossed spokes per wheel, instanced in four patterns. Existing rear-wheel driver rotates every spoke about the axle; front wheel remains stationary. Rear sprocket has 17 teeth. |
| `crank-pedals` | Pierced 46-tooth chainwheel, opposed cranks, pedal spindles and pedals, with an explicit bottom-bracket pivot. Added twin chain bands on common sprocket tangents, with spaced links on both taut runs. Chain belongs to the static frame so it does not orbit with the cranks. |
| `bicycle-dynamo`, `dynamo-magnet`, `dynamo-coil` | Hollow bottle case, rounded shoulder, narrow neck, small ribbed roller and shaft; two-pole rotor and copper winding. Mounted on the rear stay with the roller contacting the tyre sidewall. Roller turns with the rotor; released pose opens a gap while the clamp stays fixed. |
| `dynamo-wires`, `headlamp` | Paired wires follow the frame to the supported lamp; smoother lamp housing/lens. Flow endpoints follow the rebuilt drive and wiring. |
| `kettle`, `kettle-water` | Hollow jug wall, rounded handle loop, open pouring channel, separate lid/hinge, joined base and seam; smoother water surface. |
| `speaker`, `speaker-cone` | Hollow wooden cabinet and pierced baffle, rounded rubber surround, grille frame, recessed cone and domed dust cap. Removed the flat face that concealed the cone recess. |
| `fan-blades` | Modest blade twist/sweep and underside hub cap, retaining five blades, 1.32 m diameter and the existing pitch. |

All part IDs, labels, summaries/details, chapter/beat references, energy shares, numbers, simulation constants and control bindings are unchanged. Only the dynamo detail beat's camera and cut plane follow the revised assembly. No teaching text needed correction. The checked-in baseline already contained a small bottle profile; this pass fixes its drive axis, sidewall contact, mounting and visibility. The 0.37 crank ratio is preserved; 17/46 teeth round to that ratio. Existing deliberately slowed magnet animation remains disclosed in the text.

Counts are generated geometry triangles, counting every instance once, before clipping/culling; exclude ground, flows and shadow passes:

| Metric | Before | After |
|---|---:|---:|
| Topic parts / selectable | 53 / 48 | 53 / 48 |
| Bicycle assembly parts | 9 | 9 |
| Topic triangles | 315,024 | 300,316 |
| Bicycle triangles | 96,668 | 64,040 |
| Topic material/instance pieces | 69 | 86 |

`measure.ts` reproduces these counts. Acceptance pass: thin sweeps use fewer radial segments (frame 16, chain and wires 8, spokes 6), which took the bicycle from 147,216 to 64,040 triangles with no visible faceting; the in-browser pedal-power overview draws 55 calls and 106k triangles at 60 fps. The result stays below the 1.5 M triangle ceiling and at the 0.3 M preferred target. Repeated spokes are genuinely instanced; small rebuilt assemblies do not cast shadows. Piece counts are geometry-pass estimates, not measured renderer draw calls.

References: viewed Al2's bicycle diagram (CC BY 3.0), Tympanus's mounted dynamo (CC0), and Stahlkocher's bottle dynamo (CC BY-SA 3.0). URLs, licences and appliance reference checks are in [data/SOURCES.md](data/SOURCES.md).

QA: geometry tests cover spoke instances/pivots, chain tangency/link spacing/ratio, tyre contact/released clearance, connected hinge feedthrough, finite meshes and deterministic regeneration. `pnpm check` passes (zero errors, four existing hints); `pnpm validate` passes (94 topics, zero errors/warnings); `pnpm test` passes (239 files, 6,136 tests); `pnpm build` passes (191 pages).

`pnpm shoot energy-conversion --beats --locale en --theme paper` is blocked by macOS sandbox denial of Chromium's bootstrap Mach port; Blender also failed at startup. Inspected CPU projections of actual engine meshes: `scripts/geo/energy-conversion/refs/rebuild-before/`, `rebuild-r2/` (dynamo, speaker), `rebuild-r3/` (kettle, fan), and `rebuild-r4/` (final bicycle, chain and comparison). They verify form, not browser materials/HUD or GPU performance. Acceptance (Claude, 2026-11-03): `pnpm shoot energy-conversion --beats --locale en --theme paper --gpu` passes all 37 beats and beat links with a clean console; the dynamo close-up shows the roller on the sidewall and the released beat swings it clear; cinema checked on pedal power. Chain travel uses the existing kinetic flow; wrap sideplates remain continuous at this scale.

## Polish 2026-11-03

The bicycle was inspected in upright left/right/front/rear/top/bottom orthographic views, three-quarter views and its actual inverted teaching pose. All three requested items are implemented in `scripts/geo/kits/bicycle.ts`; regenerated with `pnpm tsx scripts/geo/energy-conversion/build-parts.ts`. No engine, camera, HUD, dependency or other-topic changes. Topic part IDs/count, EN/ZH teaching text, chapter/beat references, simulation values, wheel circumference, 28 spokes and 46/17 drive teeth remain unchanged. No teaching-text correction was needed.

- **Saddle:** replaced the sheet-like flattened sweep with a 13-station padded loft: rounded narrow nose, widening waist, broad haunches, dished longitudinal centreline, substantial rear padding and rolled perimeter. A separately inset dark moulded pan meets the upholstery. Bent 7 mm rails enter a shaped, bevelled clamp with two bored rail channels, a visible split between jaws and a seatpost head/fastener. Rear padding is over 45 mm thick; the nose exceeds 10 mm. These are model geometry, not new teaching specifications. Saddle loft uses 48 radial segments; hidden/small sections use fewer. The padded shell itself increases from 1,664 to 7,296 triangles.
- **Steering:** corrected the forward reach of the quill stem and its alignment with the fork steerer. Added bearing cups, upper race/locknut shoulder and a recessed expander-bolt head. The bar has a straight central clamp section, shaped riser bends and swept grip tangents; the split bar clamp has a real bore. Closed textured grips, two shaped brake levers and separate smoothly routed brake housings work in the inverted view. Re-routed the existing lamp leads along the changed head/top tubes, keeping the dynamo hinge feedthrough and lamp connected.
- **Fork, dropouts and brakes:** raised the lower head assembly/crown out of the tyre envelope; added a rounded forged crown with shoulders and tyre arch, oval-section tapered/raked blades, downward-opening front dropout slots and rearward-opening rear slots. Rear stays terminate on the dropout plates. Front and rear rim calipers have rounded arms with hexagonal pivot sockets, side cable entry and opposed shoes aligned tangentially to the metal rim. The rear mount meets the seat stays. The lamp bracket remains attached to the lower steering assembly. A generated-vertex clearance audit leaves at least 13.7 mm to a conservative circular tyre envelope using a 21 mm cross-section radius.
- **Other coarse bicycle detail:** replaced solid pedal blocks with bevelled, pierced platforms and inset amber reflectors. Repeated spokes remain instanced. The fixed hinge eye is now a small, axis-aligned turned bearing on the dynamo assembly; its axis stays fixed through the existing release rotation. Small rail, stay, wire, hinge and bar sections were tessellated by visual size to retain the full-topic triangle ceiling.

References actually downloaded and viewed: Al2’s bicycle diagram (CC BY 3.0 / GFDL), Troy Sankey’s saddle/seatpost photograph (CC BY-SA 4.0), and Aezram’s sidepull-caliper photograph (CC BY-SA 2.5). Links, use and licences are in [data/SOURCES.md](data/SOURCES.md). The photos guide form and mechanism; the generic design does not copy a branded product. All published geometry is generated locally; no external mesh, photo texture or runtime network dependency.

Generated triangle counts (every instance counted once, before culling/clipping; excludes ground, flows and shadow passes):

| Assembly | Before | After |
|---|---:|---:|
| Frame, saddle, steering, fork, brakes, static chain | 24,160 | 41,396 |
| Crank/pedal assembly | 3,648 | 5,600 |
| Dynamo casing and hinge bearing | 5,848 | 6,104 |
| Complete bicycle, nine parts | 64,040 | 83,484 |
| Complete topic, 53 parts / 48 selectable | 300,316 | 319,760 |
| Topic material/instance pieces | 86 | 89 |

`measure.ts` reproduces counts; the total is below 320,000 even with every topic part present. Piece counts are geometry-pass estimates, not browser draw-call measurements. The new regression checks cover saddle padding/dish and the complete-topic budget; existing checks retain wheel instancing/pivots, chain tangency/ratio, dynamo engaged/released contact, deterministic regeneration, unchanged content and finite meshes.

Offline previews: `scripts/geo/energy-conversion/refs/polish-before/` (baseline), `polish-r1/`, `polish-r2/`, `polish-final3/` (iterations) and `polish-final/` (final). Reproduce final views with `pnpm tsx scripts/geo/energy-conversion/export-preview.ts src/content/topics/energy-conversion/data/parts.json /tmp/energy-polish-final.json` then `python3 scripts/geo/energy-conversion/render-preview.py /tmp/energy-polish-final.json scripts/geo/energy-conversion/refs/polish-final`. The CPU rasterizer consumes actual engine-generated triangles/normals with depth buffering and smooth lighting. Inspected the six-direction sheet, saddle top/side/underside, steering, fork side/front, axle ends, pedals and inverted assembly; rounded the crown/caliper shoulders and corrected cable routing and pad orientation during those inspections. `polish-final/saddle-reference-comparison.png` records the photo beside the first and final saddle passes.

Browser acceptance (Claude, 2026-11-03): in live WebGL close-ups the rails ran under the shell and met the pan at a shallow angle, reading as two tusks at the rear and a floating hoop under the nose, and the nose ended in a split sliver where the pad and pan tips diverged. The rails now rise steeply into rear pan sockets and close inside the nose padding; the nose station is blunter (8 mm) and the pan starts further back and narrower at the nose. Triangle counts are unchanged.

Nothing in the requested geometry scope is deferred. Browser material/HUD/GPU acceptance and live input verification are intentionally left to the following Claude acceptance: the task forbids launching or driving a browser/desktop. Offline images establish geometry, not measured GPU FPS. Existing explode vectors, cut plane, animation pivots, flow bindings and the dynamo-off pose are preserved.

Final gates: `pnpm check` passes (1,088 files, zero errors/warnings, four existing hints); `pnpm validate` passes (94 topics, zero errors/warnings); `pnpm build` passes (191 pages). The final full test run, sequenced after the completed build, passes all 250 files / 6,341 tests with `pnpm run test --maxWorkers=4 --testTimeout=30000`. Worker/deadline flags accommodate the shared host; no assertions, repository test configuration or test selection were changed. Final generated data was checked byte-for-byte against a fresh in-memory rebuild, and `git diff --check` passes. Logs: `/tmp/energy-polish-check-delivery.log`, `/tmp/energy-polish-validate.log`, `/tmp/energy-polish-test-delivery.log`, `/tmp/energy-polish-build-final.log`.
