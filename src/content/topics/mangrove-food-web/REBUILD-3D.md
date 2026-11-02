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
