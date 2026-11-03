# Mangrove 3D rebuild · 2026-11-02

Original procedural geometry, using existing primitive kinds and plate materials.
No engine, framing, chapter or teaching-fact changes. `build-topic.ts` regenerates
`data/parts.json`; stale generator text was synced to the already-authored JSON so
regeneration preserves every existing label, description and simulation value.

| Parts | Rebuilt form |
|---|---|
| `api-tree`, `bakau-tree` | Tapered trunks, two recursive branching levels, curved twigs and 336 small, curved, opposite elliptic leaves per tree. |
| `api-lateral`, `api-pencil` | Connected shallow cable-root spokes and **72 slender breathing roots**, replacing the misleading six thick cones. |
| `bakau-prop` | Twelve arching trunk roots, six attached forks, tapered mud contacts and small lenticel marks. |
| `heron` | Contoured torso, slender kinked S-neck, dagger bill, layered folded remiges and graduated tail; two jointed, scaled legs with three forward toes and one hallux each. |
| `fiddler-crabs`, `tree-crabs` | Front-wide domed carapaces, eight walking legs with four distinct segments, eye stalks, separate cheliped arms and smooth open pincers. Fiddler male retains its enlarged claw; climbing feet retain trunk contact at both tide offsets. No crab species was substituted. |
| `giant-mudskipper`, `small-fish` | Eight-station body lofts, broad heads, paired eyes and fins, tail membranes and mouth creases. Mudskipper has raised eyes, fleshy pectoral elbows and two separate ray-lined dorsal fins. |
| `fallen-leaves`, `fungi-inset` | Curved leaf blades and 15 thin branching hyphae instead of four thick sticks. |
| `mud-bank`, `burrow-mouth`, `algae-patch`, `bacteria-inset`, `gill-inset` | Rounded bank rim/shoreline and smooth organic surfaces; microbes and gill cavity remain the explicitly schematic insets. |
| `tidal-water`, `boardwalk-edge`, `specimen-base` | Existing form and behaviour retained. |

Reusable kit: `scripts/geo/kits/tree.ts`. Pure generators expose height, spread,
branch curvature, sector count and root dimensions for later water/flower-and-seed/plant
reuse. Existing radial repeats instance canopy/root sectors; the engine bakes static
copies together by material when below its merge threshold. No new primitive kind.
Thin sweeps use 8–10 radial segments, leaves 6, claws 18 and hero bodies 24; eyes and ovals 28.

Counts (whole assembled model, CPU geometry; excludes hairline segments and engine
passes): **39,860 → 200,072 triangles** (first pass was 1,155,096; segment counts lowered on acceptance); **20 → 20 parts** (18 selectable + 2 context).
Base material slots **31 → 34**; geometry draw pieces **31 → 37**. New model also has
656 hairline segments. These are architecture counts, not measured GPU calls/FPS.
Budget: ≤350k triangles (about muscles-core's 277k); geometry pieces <100. Audit checks all 70 relevant desktop/
phone anchors in the frustum; conservative overlaps include intentional attachments.

References visually inspected: Avicennia leaves (Abu Hamas), Rhizophora roots
(Hans Hillewaert), heron (Jacob Spinks), fiddler crab (Bernard Dupont), mudskipper
(Bernhard Luth), plus Smithsonian root descriptions. URLs/licences and scope are
recorded in `data/SOURCES.md`. Reference images stay ignored and are not assets.

Validation: `pnpm check` PASS (0 errors/warnings), `pnpm validate` PASS (94 topics),
`pnpm test` PASS (239 files / 6,137 tests), `pnpm build` PASS (191 pages). Focused
geometry checks cover root attachment, appendage counts, finite vertices and budgets.
The final JSON was also compared with the pre-rebuild file: every non-geometry
field is identical, including labels, descriptions, views, flows and simulation data.
Headless Chromium cannot launch in this sandbox (MachPortRendezvous permission denied),
so `pnpm shoot mangrove-food-web --beats --locale en --theme paper` and
`pnpm e2e --max-failures=1` stop before browser tests. Real WebGL materials,
shadows, interaction and GPU performance remain
for an unrestricted runner. Two geometry refinement passes were inspected using local
CPU previews: `shots/mangrove-food-web/cpu-preview/{hero,roots,heron,crabs,climbing,mudskipper}.png`.
These are normal-lit geometry previews, not WebGL screenshots. Reproduce with
`pnpm tsx scripts/geo/mangrove-food-web/render-preview.ts`.

Later: real-WebGL beat/interaction review and GPU measurement; less regular crown/root
sector placement would require a broader engine instance-placement contract. The current
habitat and generic animal specimens remain a schematic museum teaching display.

## Polish 2026-11-03

This pass supersedes the earlier note that asymmetric crowns/root placement
required an engine change. Original meshes allow arbitrary placements while
retaining all 20 existing part IDs (18 selectable + two context), labels,
EN/ZH text, food-web tables, simulation bindings and root explode directions.
No teaching numbers, labels or part text changed. No shared renderer or camera
code was edited. Regenerate with `pnpm tsx scripts/geo/mangrove-food-web/build-topic.ts`.

| Item | Change and inspected reference | CPU triangles before → after |
|---|---|---:|
| Api-api and Bakau crowns | Six unequal first-order limbs per tree, 61 woody lofts with individually varied curved forks; 336 opposite leaves distributed over terminal twigs, open crown windows and uneven crown heights. Each leaf is a closed elliptic surface with cupping, a curved midline and a drooping tip. Sixteen blade variants share build-time geometry, transformed and baked into one static buffer per tree. Abu Hamas's Avicennia leaf photo and Hillewaert's Rhizophora photo. | 85,176 → 116,016 |
| Cable, pencil and prop roots | Twelve wandering shallow cables; 72 attached, irregularly spaced pencils with varied heights, widths and lean. Twelve unequal arches originate at varied trunk heights and actual low-branch stations; six forks attach before their mud contacts. No radial `repeat` remains. Hillewaert root photo and existing Smithsonian root morphology reference. | 21,984 → 24,912 |
| Fiddler and climbing chelae | Separate merus, carpus, broad propodus, fixed lower finger and movable upper dactyl. The male's major cheliped crosses the front, has palm tubercles, cutting-edge teeth and a hinge; the feeding chela stays small. Smaller climbing chelae also have separate opposing fingers. Eight walking legs and two stalked eyes per crab retained; walking limbs use 16 radial sections and the carapaces 48 for close-up silhouettes. Dupont's male fiddler photo. | 28,416 → 40,304 |
| Mudskipper and small fish | Shoulder embedded in the body, muscular elbow/wrist lobe and broad distal ray fan. Twelve pectoral rays per side, smoothly outlined separate dorsal fins, raised top-set eye lobes and pupils; a rounded ray-lined caudal fan replaces the angular tail plate. Fin perimeters and ray-bearing inner membranes are separately tessellated to avoid the engine's full-contour 256× subdivision cost. Luth's mudskipper photo. | 27,800 → 25,560 |
| Burrow anchor | Main primitive now sits on the front rim above mud; shaft stays beneath it. The two high-water beats that label the submerged mouth use the existing X-ray view to avoid mud/water occlusion. No caption, label, teaching value or simulation change. | 1,728 → 3,168 |

Whole model: **200,072 → 237,248 triangles**, including normally hidden insets;
**37 → 37 geometry pieces**, **34 → 31 base material slots**. Hairlines are
counted separately (2,942 segments). The remaining budget savings come from
flat caps at already tapered ends/hidden joins instead of extra round-cap rings;
heron proportions, toes and feathers remain unchanged. The generated GLB is
locally hosted, and has original-geometry copyright metadata.
These are CPU architecture counts, not GPU calls, frame rate or shadow passes.

CPU previews were actually inspected and iterated: less leaf curl, evenly
allocated leaf pairs across all terminal twigs, smooth dorsal contours,
broader fin fans, embedded shoulder roots and tapered palm/snout closures.
`shots/mangrove-food-web/cpu-preview/` contains `hero`, `roots`, `api`,
`apiBack`, `bakau`, `bakauBack`, `rootScatter`, `crabs`, `crabFront`,
`mudskipper`, `fishSide`, `fishFront`, `fishFin`, `climbing` and `heron` PNGs.
Reproduce with `pnpm tsx scripts/geo/mangrove-food-web/render-preview.ts`.
The renderer reads the same mesh buffers exported to GLB and the engine's
primitive tessellator, with interpolated normals, a depth buffer and fin-ray
hairlines. It does not simulate WebGL materials/shadows or the HTML label layout.

Acceptance fix (Claude, 2026-11-03): the first polish output put each whole
tree (bark and leaves) into one glb node with one olive finish, so trunks and
limbs rendered green, a regression from main's pale bark. Each tree is now two
glb nodes: the selectable `api-tree` / `bakau-tree` part draws the foliage crown
(`tissue` · seedling) and new context parts `api-trunk` / `bakau-trunk` draw the
trunk and limbs (`wood` · neutral, cast shadows). Selectable ids and count (18)
are unchanged; context parts 2 → 4. Removing the mangrove food-web node hides
the Bakau trunk with its crown. Leaves are about 30 % longer (api .047 → .061,
bakau .056 → .072) for fuller crowns at the same triangle count. The burrow's
added front rim (a dark tube lying on the mud) became a low mud-coloured lip
following the mouth's front arc. Whole model 237,120 triangles (CPU audit);
in the browser 37 draw calls / 226k triangles on screen (main: 34 / 186k).
The GLB is now meshopt-compressed with quantised positions/normals (3.9 MB →
1.05 MB); uncompressed, the stage missed the 20 s ready window in e2e under load.

Validation on the final frozen output: `pnpm check` PASS (1,090 files,
zero errors/warnings; four existing hints); `pnpm validate` PASS (94 topics,
zero errors/warnings); `pnpm test -- --maxWorkers=1` PASS (**250 files / 6,343
tests**); `pnpm build` PASS (**191 pages**). The initial concurrent full run
only failed the unrelated five-millisecond liquid-geometry timing check; the
final serial full run passed it without changing that code, test or threshold.
Focused checks cover irregular placement, root attachment/counts, articulated
chelae, twelve pectoral rays, the burrow's rim anchor/high-water views, finite
geometry and the 250k budget. A separate check reads the shipped GLB and confirms
its seven named node meshes match the CPU audit's triangles.

All original non-geometry fields in `parts.json` were compared against the
pre-polish file and match exactly. The built route's authored geometry fields
and the copied GLB match the final source output (allowing schema-added defaults).
`git diff --check` PASS. No git writes, dependency changes, browser/desktop
control, deployment or runtime network assets.
