# Inside the Earth · 3D rebuild · 2026-11-02

Regenerated with `pnpm tsx scripts/geo/inside-the-earth/build-parts.ts`. No new kit or primitive kind was needed. All 91 IDs, names, labels, scientific measurements, chapter/beat references, 27 poses, six controls, seven outputs, four bindings and flow rates are preserved.

## Changes by part

| Parts | Rebuild |
|---|---|
| `earth-crust`, `earth-mantle`, `earth-outer-core`, `earth-inner-core` | Concentric spherical shells retaining 270° around a quarter-wedge cut; common −25° orientation exposes the curved exterior at the existing chapter camera. Exact radii and 30 km crust example retained. Crust carries twelve geographically sourced coastline runs. |
| `edge-slab` | 73 analytic samples per boundary instead of 17. Horizontal entry and smooth descending tangent. Crust and mantle partition the original full thickness, meeting the incoming plate without gaps or overlapping surfaces. |
| `volcano-cone` | Dense concave flank meridian, recessed crater and rounded lip; eight nested strata ribbons on the cut face. |
| `volcano-host`, `volcano-storage` | Shared irregular chamber contour with lobed roof; filled storage fits the rock aperture. Original eleven crystal symbols retained. |
| `volcano-conduit`, `volcano-vent` | Curved trunk with connected branching dykes and a flattened sill. Trunk ends inside the crater; the vent rim surrounds the same single opening. |
| `volcano-lava` | Flattened, widening flow with two connected terminal lobes; flow illustration follows the revised path from the crater to the flank. |
| `volcano-ash` | Cube grid replaced by a narrowing jet and spreading plume of 231 uneven grains. One shared geometry/InstancedMesh; slow per-grain tumbling uses the existing animation system. Grain count and arrangement are illustration choices. |
| `fault-left`, `fault-right` | Strata bands travel with each block; original horizontal slip and locked-marker pivots preserved. |
| `sea-coast` | Existing smooth wave ribbon now explicitly uses 48 radial segments. Finite water snapshots unchanged. |

Misleading ash cubes and pipe-only volcanic plumbing are removed. Minimal bilingual detail corrections describe the inner core's quarter-wedge opening and the ash's illustrative plume arrangement. Chapters 03/04 and the volcano preset are framed slightly wider/higher to fit the plume. No engine camera/framing code changed.

## References

Inspected USGS [composite-volcano section, fig. 10](https://pubs.usgs.gov/gip/volc/fig10.gif) and [Earth section](https://pubs.usgs.gov/gip/dynamic/graphics/FigS1-1.gif). Their structural cues guide an unnamed teaching reconstruction. Coastlines use Natural Earth 1:110m v4.1.0 via installed `world-atlas@2.0.2`, projected and clipped at build time. Licence/source details are in [data/SOURCES.md](data/SOURCES.md). No reference image, GLB or runtime network request was added.

## Counts and verification

Exact engine-generated triangle inventory, including instances:

| Inventory | Before triangles | After triangles | Logical parts |
|---|---:|---:|---:|
| Earth + enlarged plate | 28,146 | 54,258 | 7 → 7 |
| Boundaries | 3,520 | 4,416 | 9 → 9 |
| Volcano | 38,176 | 154,664 | 8 → 8 |
| Fault + wave markers | 104,412 | 104,556 | 41 → 41 |
| Sea + structures | 111,448 | 114,296 | 26 → 26 |
| **Total** | **285,702** | **432,190** | **91 → 91** |

Material geometry pieces: 102 → 108 across the complete inventory; largest single chapter group: 45 pieces. These are geometry counts, not measured WebGL draw calls. Every chapter group remains below 300k triangles; inventory remains below 600k and the 1.5M upper budget. `audit-geometry.ts` now handles per-instance animation geometry correctly. All tested Earth/fault leader probes remain clear.

Global default: changed only `shaped.ts`'s private swept-tube radial default from 8 to 24 (coil-bank tubes and return bends). This affects only **aircon** (`evaporator-front`, `evaporator-rear`, `condenser-coil`, `condenser-hairpins`): 136,332 → 176,716 rendered triangles, unchanged draw calls (50) and frame rate (~60 fps headless Metal). 48 would have cost 237k for thin tubes with no visible gain. The public lathe schema already defaults to 48. Public organic sweep defaults live in `organic.ts`, outside the requested one-file change; this topic explicitly authors 48 on every sweep. Deliberate polygonal fasteners and other topics' explicit segment counts are preserved.

`pnpm check`, `pnpm validate`, `pnpm test` (238 files / 6,134 tests) and `pnpm build` passed. Topic/anchor checks include exact radii, material joins, crater, branching connections, instancing and budgets.

## Acceptance pass (Claude, 2026-11-02)

- `volcano-lava`: the half cone fills z ≤ 0, so the flow and its two lobes were hanging in front of the cut plane as twisted strips. They now lie on the flank exterior 9° behind the cut edge and spread onto the host-rock top.
- `volcano-ash` grains: 12 lathe segments instead of 48 (angular fragments, 88,704 → 22,176 triangles).
- Crust coastline hairlines (r 2.2 mm): radial 8 instead of 48 (85,984 → 24,304 triangles for `earth-crust`).
- Browser shoot (`--beats`, `--perf --gpu`): chapter groups 4–155k triangles, 6–46 draw calls, 53–64 fps headless.

## Visual inspection and remaining verification

Inspected before/after CPU z-buffer renders of the actual engine meshes: `/tmp/atlas-earth-qa/{before,after}/{earth,volcano,boundaries,fault}.png`. Two visual iterations corrected a cropped plume and coplanar slab surfaces. Reproduce using `scripts/geo/inside-the-earth/render-preview.ts`; the images explicitly identify themselves as CPU previews.

`pnpm shoot inside-the-earth --beats --locale en --theme paper` and `pnpm e2e --max-failures=1` were attempted. Headless Chromium exits before page creation because the sandbox denies macOS `bootstrap_check_in` / MachPortRendezvousServer. No shoot images were produced. WebGL materials, measured draw calls, HUD/beat screenshots, interactive cutaway/explode and GPU performance therefore still need verification in a browser-capable environment. The user's browser/desktop was never opened or controlled.
