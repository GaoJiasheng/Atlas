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


## Polish 2026-11-03

Verified the current generated data before editing: the quay was a single `token:neutral` satin surface, which resolves to the bright UI grey `#a6a199` in cinema; the sea used brushed, 80%-metal `casing` tinted cold. No topic GLB or texture existed.

- **Quay and yard:** the same `quay-context` now contains a matte concrete apron (`abrasive` + `token:mannequin`) and a charcoal asphalt yard (the existing `abrasive` mineral preset). Cinema concrete base colour is `#6f7174`; asphalt is `#6b6359`. Both use zero metalness, roughness .93 and fine mineral grit. The apron has flush 45 mm saw-cut expansion joints at a schematic 10 m × 8 m spacing. The yard topping is 24 mm thick; no teaching part, load height, rail, parking position or solver coordinate changed. The first CPU proof showed the alternate carbon-dioxide tint was too brown on cinema, so the final yard uses the quieter mineral preset. All colours are existing token/material families.
- **Water:** applied the explicitly permitted **data-only fallback**: `enamel` + `token:cold` gives nonmetal satin water (roughness .34) instead of brushed aluminium. A dedicated animated/static ripple normal is **not implemented**: primitive placement/material data has no texture URI/normal-scale field (`schema.ts`), and opt-in GLB source materials explicitly clear `normalMap` (`GltfSource.tsx`). Adding that capability would require the shared engine, outside this task's ownership. No decorative strips, fake waves or extra asset fetches were added.
- **References:** the existing S1 design study, Liebherr container-crane/terminal photographs and Konecranes RTG photographs listed in `data/SOURCES.md`; technical-plate material discipline in `docs/08-technical-plate.md`, `master-spec.md` E/R3 and the existing engine material/token definitions. Surface values and joint layout are original design choices, not Tuas measurements. No reference asset is redistributed; EN/ZH teaching text and facts remain unchanged.

Measured with the actual renderer geometry factory, all authored parts and maximum sample repeats expanded (including parts hidden in normal lesson states):

| Metric | Before polish | After polish |
|---|---:|---:|
| Selectable / context parts | 30 / 2 | 30 / 2 |
| Expanded triangles | 305,030 | 305,294 |
| Mesh/material pieces | 89 | 90 |
| Instanced meshes | 26 | 26 |
| Topic GLB bytes | 0 | 0 |
| parts.json bytes | 823,560 | 828,965 |
| parts.json gzip bytes | 28,173 | 28,323 |

The earlier rebuild table predates the accepted deck-fitting removal; this fresh baseline measures the code at the start of this polish. The maximum remains below 350k, now enforced by `tests/container-port-rebuild.test.ts`. The two material slots of the context paving merge independently; 22 added cuboids contribute just 264 triangles. No GLTF parse, Draco decode, texture fetch or extra runtime model request is introduced. The shipped compressed data grows by less than 200 bytes. Alternating seven Node CPU geometry builds per state measured cold 116.8/93.4 ms and warm medians 64.2/74.4 ms before/after on the shared task host; the small noisy difference is not a browser first-load or GPU timing. No browser load-time/FPS claim is made.

**Offline visual verification:** actual generated geometry, theme-resolved base colours, depth buffer; inspected overall hero, quay, yard and water close-ups for both themes. Final images: `/tmp/atlas-port-polish-after-{paper,cinema}-{hero,quay,yard,water}-depth.png`. Before equivalents use `before` instead of `after`. CPU previews validate silhouettes, surface separation and material values; they do not reproduce the GPU's PBR grit, reflections, shadows or HUD. Reproduction scripts and metrics are `/tmp/atlas-port-polish-{render.mts,zbuffer.py,metrics.ts}` and `/tmp/atlas-port-polish-{before,after}-metrics.json`. No Chromium, user browser or desktop was opened.

Targeted verification: `pnpm exec vitest run --configLoader runner tests/container-port-rebuild.test.ts tests/space-scene/container-port-model.test.ts tests/space-scene/container-port-content.test.ts` — 3 files / 18 tests pass. The runner config loader avoids the read-only shared `node_modules/.vite-temp` path. Global check/validate/test/build are run by the coordinating session after all four topic changes.

Production build cross-check: `dist/topics/container-port/data.json` is **324,168 bytes / 24,179 gzip bytes** (minified, excluding HTML/shared code). The source `parts.json` table above is pretty-printed generator input, so its byte count is larger. There is still no GLB or new texture request. The combined preview index is `/tmp/atlas-group-b/index.md`.

### Combined group B gates · run 2026-11-05

- `pnpm check`: PASS, 0 errors / 0 warnings, 5 existing unused-code hints.
- `pnpm validate`: PASS, 94 topics, 0 errors / 0 warnings.
- `pnpm build`: PASS, 191 pages and PWA generation; the full built-topic JavaScript budget test passes.
- **`pnpm test`: NOT GREEN** — 275 suites / 6,527 tests pass; one untouched `tests/space-scene/living-things-toad-skin.test.ts` geometry test exceeds its existing 5,000 ms limit. Repeated with default workers, two workers, and alone: the same timeout is the only failure. The isolated test passes both assertions/tests with a diagnostic 30,000 ms command-line limit (13.08 s test time); no foreign source, assertion or stored timeout was changed. That diagnostic is not presented as a passing standard gate. The permitted four-topic implementation and regression suites pass. Fixing the unrelated test's timing contract is outside this task's ownership.

Logs: `/tmp/atlas-group-b-{check-final,validate,build,test-isolated,test-workers2,toad-isolated,toad-diagnostic}.log`. All inspected CPU previews are linked from `/tmp/atlas-group-b/index.md`. No browser, desktop, e2e or GPU pass was run. No git write or package/lockfile edit was performed. An ephemeral local dependency-cache wrapper allowed the gates to run without writing through the pre-existing read-only `node_modules` symlink; the original symlink was restored afterwards.

## Rebuild 2026-11-05 — residual polish (implemented 2026-11-09)

Scope: only this batch's named residual parts. **Self-grade A** means credible form, attachments and relief for the existing teaching role under docs/68; it is an offline judgement, pending Claude's GPU acceptance. Earlier accepted limitations on unrelated parts are not regraded here. No browser/desktop, git writes, engine/shared-kit changes or display-text edits.

Baked the accepted 23 paving solids into a tiny topic-local mesh and gave every face metre-based UVs. The engine still supplies the abrasive sand albedo/normal/roughness finish: one UV unit spans 1.08 m and the existing map repeats ten times, giving approximately 3 mm grains instead of normalized-box grains stretched across a 200 m quay. Preserved asphalt/concrete separation, all expansion joints, quay dimensions, vehicle clearances and 03.x beats. No engine material or shared texture was edited.

References actually downloaded and viewed (development only; no runtime photo textures or third-party meshes):

- [Asphalt high resolution texture.jpg](https://commons.wikimedia.org/wiki/File:Asphalt_high_resolution_texture.jpg) — John Harvey; Public domain.
- [Asphalt concrete.JPG](https://commons.wikimedia.org/wiki/File:Asphalt_concrete.JPG) — kallerna; CC BY-SA 3.0.

Review iterations:

1. **Look 1 → change:** Confirmed normalized box UVs were stretching the shared abrasive map over the complete quay. Replaced them with metric UVs, preserving the engine finish and actual paving solids.
2. **Look 2 → change:** The first metric period still looked coarse in the macro comparison. Reduced it from 1.8 to 1.08 m per UV unit, then checked trilinear mip filtering and both themes. Added a decoded UV-to-metre regression.
3. **Final look:** inspected the final decoded asset in front, three-quarter, profile and detail views, plus cinema. Sheets: `/tmp/atlas-residual-polish-2026-11-05/final/container-port`. These are renders beside real photographic/histological references, not silhouettes. Photo crops/orientations are development comparisons; generic specimens and available oblique photographs are not a calibrated photogrammetric solve. A histological section has no photographed three-quarter view, so the same section references support the additional oblique model views. No unavailable camera angle is invented or claimed as a measured match.

| Part | Self-grade | Triangles before → after | Estimated model draws before → after |
|---|---|---:|---:|
| `quay-context` | A, offline | 276 → 276 | 2 → 1 |

Inventory: **305,294 → 305,294 triangles**; **89 → 88 draws**. Maximum authored chapter/beat: **294,618 → 294,618 triangles**, **75 → 74 draws**. GLB: **0 → 8,564 bytes**. Counts use the decoded renderer mesh, expanded bilateral parts, instance matrices and each-animation path. They exclude shadows, flows and labels; no GPU FPS is claimed. Inventory can include mutually hidden stations; the authored maxima remain below 350k.

Preservation audit: all IDs/order, names, labels, EN/ZH summaries/details, teaching numbers, groups, chapter/beat references, flows, animations, rig/pose pivots, sorting and explosion inputs are unchanged. **0 unrelated decoded meshes** retain identical attribute streams, world transforms and oriented triangle topology (meshopt may cyclically rotate a triangle's three indices). No retained specimen was simplified to pay for this work.

The offline preview reuses `fossils-and-skeletons/studio-cpu.ts`: engine studio directions, light colours/intensities, hemisphere, exposure, sampled Three RoomEnvironment, GGX and ACES. Rig/exposure values are checked against live `Lighting.tsx`. For the two finish-sensitive residuals, the actual engine-generated sand/pile pixels are exported by `living-things/export-finish-maps.ts`, with UV derivatives selecting trilinear mips. CPU numerical environment filtering and lack of GPU contact-shadow/anisotropic filtering are explicit limits; this is not GPU acceptance. Float64 depth avoids artificial z-fighting in thin-sheet/recess macro views.

Reproduce the targeted build without regenerating stale editorial text:

```sh
pnpm tsx scripts/geo/container-port/polish-grit.mjs
pnpm tsx scripts/geo/living-things/export-finish-maps.ts
pnpm tsx scripts/geo/plant/residual-review.mjs final container-port
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
