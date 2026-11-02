# Container port · 3D rebuild · 2026-11-02

Build: `pnpm tsx scripts/geo/container-port/build-parts.ts`. Reusable kit: `scripts/geo/kits/port.ts`. `parts-template.json` preserves the authored lesson metadata, poses and solver independently of generated geometry.

| Parts | Rebuild |
|---|---|
| `ship-hull`, `onward-ship` | Smooth hull lofts, curved shoulders, flare, sheer, transom, joined stem/bulb and deck surfaces. Longer main hull restores credible length/beam proportions; onward accommodation is scaled as a complete assembly. |
| `ship-deck`, `ship-cargo` | Hatch covers, lashing bridges, corner fittings and 320 corrugated containers: ten populated bays × eight rows × four tiers. Short boxes in the centre lanes preserve the working-cell clearance; outer lanes use 40-ft boxes. Mixed token finishes. |
| `ship-bridge` | Seven deck edges, window bands/mullions, wheelhouse wings, funnel and mast. |
| `portal`, `crane-boom` | Paired A-frames/stays, machinery house, high cross-bracing, deep two-sided lattice boom, transverse links and hinge bosses. Braces clear the original suspended-load corridor. |
| `rail-bogies`, `crane-rails` | Equaliser beams, eight wheel treads per corner and aligned paired running rails. |
| `trolley`, `spreader` | Rail-aligned wheels, drums, outboard cab clear of the ropes, telescopic headblock/end frames and four flippers. |
| `rope-a`–`rope-d`, `twistlocks` | Original four live spans, lock positions, instance axes and operation retained. |
| `working-box`, `corner-fittings` | Hollow corrugated body, inset roof/floor, perimeter rails, one pair of end doors with four locking bars, and open oval corner sockets. Skin/rail overlaps removed; original clip/explode/replay contracts retained. |
| `sample-20`, `sample-40` | Exact original ISO envelopes and finer corrugation. Samples remain single primitives without extras, as required by count controls. |
| `agv-body`, `agv-wheels` | Rounded chassis/bumpers, outside alignment guides, load pads, tyre shoulders and hubs. Existing six wheels and landing height retained. |
| `yard-gantry`, `yard-trolley` | Four legs, eight shaped tyres, braced side sills, twin girders, machinery house, spanning trolley, cab, drums, ropes and spreader. Five-row/four-tier background block stands beside the landside RTG leg and follows the yard layer. |
| `yard-target`, `yard-blocker-a`, `yard-blocker-b`, `yard-slot` | Detailed individual containers; target/blocker identities, tier heights and parking-slot experiment unchanged. Background stacks clear both parking positions. |
| `destination-box`, `control-room` | Detailed dry box; bevelled room and window mullions. |
| `quay-context`, `water-context` | Wider quay; cold-token water surface plane with the existing procedural finish, replacing the solid blue slab. |

No engine kind, dependency, third-party mesh or runtime asset request added. `repeat` batches bays; `fins` batches fittings, ribs and links. Large repeated shell batches remain InstancedMesh; small details merge by material. All lathes/sweeps use at least 48 radial segments.

References: existing BIC/CTU sources, Liebherr STS/container-ship photographs and Konecranes RTG/AGV photographs. URLs and reference-only licence boundaries are in [data/SOURCES.md](data/SOURCES.md). No reference image is redistributed. Equipment remains a generic S1 design study, not a surveyed Tuas terminal or certified machine.

The review listed **no factually misleading shape** for this topic. Its prism hull, loose cargo blocks, ladder boom, wheelless yard frame and puck wheels were replaced. No teaching text, number, label, ID, chapter/beat reference, pose or solver changed. Topic-owned wide cameras accommodate the longer ship.

## Counts and checks

Actual renderer geometry factory, including every authored repeat and maximum sample count:

| Metric | Before | After |
|---|---:|---:|
| Selectable/context parts | 30 / 2 | 30 / 2 |
| Authored primitives | 140 | 415 |
| Expanded triangles | 14,368 | 308,870 |
| Mesh pieces/material passes | 37 | 89 |
| Actual instanced meshes | 2 | 26 |

Below the 1.5M triangle ceiling. Mesh pieces exclude ground/shadow/cut-face passes; they are not measured browser draw calls. No GPU FPS claim. Regression tests protect lesson metadata, ISO sample dimensions/count controls, four locks, smooth lofts, eight RTG tyres, lift/portal clearance and carrier landing.

Required gate results are recorded below after the final run.

## Visual QA and remaining work

Normal/performance and `--beats` paper shoots were attempted. Chromium launch is blocked by the sandbox: `bootstrap_check_in … MachPortRendezvousServer … Permission denied (1100)`. No browser screenshot was produced; no user browser or desktop was accessed.

Inspected actual-mesh software projections and depth-rasterised PNGs over multiple iterations: `/tmp/atlas-container-port-{hero,crane,yard,box}-depth.png`. These validate geometry, not application materials, shadows or HUD. Corrections included bow/stem continuity, trolley/girder connections, hoist/cab clearance, skin/rail overlap and yard-layer visibility.

Remaining: application screenshots and beat/keyboard/layout/e2e checks in a Chromium-capable environment; inspect both themes. Water retains the existing procedural finish rather than a dedicated ripple normal. Ropes retain the documented straight-span teaching contract.

Final gates: `pnpm check` PASS (0 errors/warnings); `pnpm validate` PASS (94 topics, 0 errors/warnings); `pnpm test` PASS (239 files, 6,138 tests); `pnpm build` PASS (191 pages). An earlier concurrent run exceeded an unrelated catalogue-search timing threshold; the isolated full rerun passed. `git diff --check` is clean. Browser shoot/e2e remains blocked as described above.

## Claude acceptance · 2026-11-02

First browser shoots (`--beats`, paper; default shots, cinema; hardware GL). Two fixes:

- The background yard block sat between the yard camera and the target column, hiding the target and its blockers in chapter 03. It now stands beside the landside RTG leg (x≈4.5), off the sight lines to the target and both parking slots.
- Stack-top lashing fittings belonged to `ship-deck`, so they floated above the bare deck when a beat hid `ship-cargo` (chapter 02). Only deck-level fittings remain on the deck.

Perf (cinema, hardware GL, loaded machine): 73 calls, 252,948 drawn triangles, 60 fps on every preset.
