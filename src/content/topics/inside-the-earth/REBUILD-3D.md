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

## Polish 2026-11-03

### Changes and scientific contract

- **Conduit / crater / vent:** extended the same conduit sweep into a flared throat meeting the crater floor at r=.115, y=1.22. The vent is a small filled meniscus, not a separate floating ring or second overlapping pipe wall. The rock has a continuous rim, inner slope and floor; the lava follows that slope and crosses the rim against the rock. CPU close-ups caught and eliminated the initial overlap seam and suspended lava bridge.
- **Volcano:** original sculpted mesh replaces the regular surface of revolution: uneven summit rim, variable flank relief and erosion, and solid engraved deposition beds on both cut faces. Uniform radial section grids removed streaking from skinny triangles in the first mesh iteration. Host rock has mineral bands/joints; the eleven crystals retain their count and now have varied six-sided mineral terminations. Existing branching dykes, sill, lobate lava and 231 instanced ash symbols remain.
- **Earth shell edges / materials:** smoother shared meridians, fine section grain confined inside the exact shell radii, and a mineral line inside the actual 30 km crust thickness. Crust, mantle and outer core keep the smooth `plastic` family (acceptance 2026-11-03: the `abrasive` sand normal map turned the globe into orange peel and streaked across the lathe cut faces, and `stainless` blurred the outer-core/mantle boundary); the inner core uses the `steel` family. Original token tints and liquid/solid teaching descriptions are retained. Fine mantle grain is explicitly illustrative, not extra seismic boundaries.
- **Boundaries:** incoming/slab full-thickness joins and smooth tangent retained; narrow crust/mantle laminae follow the descending curve. The overriding specimen now has a trench-facing toe, deformed beds, and depth-varying forearc/arc relief. The collision specimen has an asymmetric mountain surface rather than a triangular extrusion. The partial-melt symbol is an irregular lenticular region, retaining its hot tint and location above the slab. Other moving blocks carry adjoining solid beds, uneven upper contacts and mineral joints.
- **Fault:** both specimens are generated closed meshes with uneven rock tops, engraved shared bedding, mineral grain, joint depressions and fine slickenside relief on the contact faces. Their original horizontal slip, marker pivots, focus/epicentre and offsets remain. The relief is illustrative; it is not a new named rock succession.
- **Other chapters:** inspected all depth/wave markers, both sea states and the generic building's rest/sway states. Retained their explicit SIM/structural-diagram roles. Nearshore sample now has a smooth shelf slope and sediment laminae; moving source samples carry section grain without changing shared extents. Concrete uses the mineral finish. Tiny spherical diagram markers retain their exact radii and counts, with 32 radial × 24 meridian segments suited to their screen size.

No IDs, logical counts, chapter/beat references, teaching quantities, controls, poses, bindings or flow rates changed. Minimal EN/ZH detail edits: `earth-mantle` explains illustrative section grain; `volcano-vent` describes the joined flared opening instead of a ring. No shared kit or engine edits.

### References

Inspected the USGS composite-volcano section and Earth section, NPS composite-volcano crater description and Shishaldin photograph, and the USGS public-domain subduction/wedge schematic. See [data/SOURCES.md](data/SOURCES.md#polish-geometry-provenance--2026-11-03) for links, licence and reconstruction limits. All new meshes are original code; no reference image is shipped.

### Triangle inventory

Actual generated geometry, instances included; loaded GLB replaces its authoring/anchor primitives in these counts. Ground, shadow passes and flow point sprites are excluded. These are CPU inventory counts, not measured WebGL draw calls or FPS.

| Item | Before | After |
|---|---:|---:|
| Four Earth shells | 54,222 | 66,826 |
| Cone + conduit + vent | 95,256 | 63,872 |
| Incoming + slab + overriding + melt | 4,200 | 22,520 |
| Collision specimen | 96 | 17,408 |
| Two fault specimens | 168 | 47,104 |
| Nearshore specimen + wave symbols | 12,500 | 14,032 |
| Three moving seafloor samples | 36 | 4,572 |
| **Entire topic, 91 parts** | **432,190** | **413,254** |
| **Largest chapter** | **154,664** | **118,704** |

All chapters remain below 200k and the total below 450k. Material pieces across the complete inventory: 108 → 123. Thin coastlines retain radial 8, ash radial 12; small symbols are reduced while the large shells retain radial 96 and conduit branches radial 48.

### Verification and integration status

Offline CPU z-buffer inspection: `/tmp/atlas-earth-polish/before/`, multiple intermediate iterations, and `/tmp/atlas-earth-polish/final/`. Final views cover every chapter, crater front/oblique macros, backside volcano, subduction and plate details, fault rest/slip, sea rest/displacement, building rest/sway, Earth and volcano exploded views. Exact counts and engine-equivalent label rays are in `/tmp/atlas-earth-polish/candidate/audit.json`; all tested rays have a clear probe. Previews read the generated GLB accessors, not a simplified proxy. They do not reproduce runtime PBR, shadows, HUD or interactive clipping; no browser or desktop was opened.

### Integration completed · 2026-11-03

Gavin approved the single flat runtime path in this continuation. The normal generator now creates `public/models/inside-the-earth.glb` and writes the complete sculpted `parts.json`; `--candidate <parts-path>` remains available for scratch builds and `--primitives-only` is explicit opt-in. The obsolete uncompressed `public/models/inside-the-earth/geology.glb` staging copy has been removed. No shared schema, kit, engine or dependency changes were needed.

- **Compression:** 3,738,872 → 587,332 bytes (84.3% smaller; below the 1,500,000-byte cap). Meshopt high mode, 16-bit positions, complete triangle topology retained; six named nodes and `extras.closed` retained. The source/CC BY-NC-SA 4.0 notice is embedded and recorded in `data/SOURCES.md`; Natural Earth coastline attribution remains unchanged.
- **Contract:** final runtime JSON exactly matches the prepared full candidate. All 91 IDs, EN/ZH names and labels, chapter/beat references, 27 poses, six controls, seven outputs, four bindings and two flows remain. There are no additional prose or teaching-number changes in this continuation.
- **Counts:** whole-topic inventory 432,190 → 413,254 triangles; largest chapter 154,664 → 118,704. Compression changes neither count. The eight chapter inventories are 66,826 / 71,398 / 50,656 / 118,704 / 118,704 / 101,092 / 71,032 / 372. The inventory total spans separately displayed chapters; all chapter counts stay below 200k. Geometry pieces remain 123 after integration.
- **Offline decoder/geometry verification:** the topic's CPU loader now decodes meshopt, dequantises attributes and applies GLB world transforms before audit/render. A regression loads the shipped binary with the same Three.js GLTFLoader/bundled MeshoptDecoder as runtime, checks the compression extension and 1.5 MB cap, and compares every decoded vertex in scene space against the independent CPU loader (error below 2e-7 scene units). The licence and sculpt checks now require the runtime asset rather than skipping when it is absent.
- **Visual verification:** regenerated and inspected all 20 views from the shipped compressed binary at `/tmp/atlas-earth-polish/integrated/`, including the contact sheet, crater macros, rear flank, subduction, rest/slipped faults, sea/building states and exploded views. Compression comparison against the uncompressed final candidate: mean absolute RGB error 0.0074–0.0158 out of 255 in four close/rear views. The geometry audit is `/tmp/atlas-earth-polish/integrated-audit.json`; all 15 tested label probes are clear, including measured runtime-style bounds for all six mesh parts and slipped faults.
- **Reproducibility:** a fresh `--candidate /tmp/atlas-earth-polish/repro/parts.json` generation produces byte-identical JSON and compressed GLB. The production build's `dist/models/inside-the-earth.glb` also matches the runtime source byte for byte.
- **Final gates, integrated runtime files without environment overrides:** `pnpm check` passed (1,091 files, 0 errors / 0 warnings, four pre-existing hints); `pnpm validate` passed (94 topics, 0 errors / 0 warnings); `pnpm test -- --maxWorkers=2` passed (250 files / 6,344 tests, including 40 topic tests); `pnpm build` passed (191 pages). Logs: `/tmp/atlas-earth-polish/integrated-{check,validate,test,build}.log`. `git diff --check` is clean.

No implementation item remains pending. Browser/GPU/HUD and interactive clipping acceptance is left to the requested Claude browser review; no browser or desktop was opened. CPU previews do not claim runtime PBR, shadow or FPS validation.
