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
