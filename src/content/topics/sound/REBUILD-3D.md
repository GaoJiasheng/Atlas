# Sound apparatus rebuild

## Polish 2026-11-03

### Items completed

- **06, beat 2, labels 18 / 20:** the string's old midpoint coincided with the short bridge. Preserve one continuous string, its end anchors, bridge positions, active lengths and part id. Two contacting collinear spans put label 18 on the actual left vibrating span (x = −1.945) instead of on bridge 20 (x = −1.4). Each span uses an eight-sided fine-wire sweep, avoiding the old straight tube's unnecessary tessellation. Both labels remain in the same beat. Production leader/projection tests sweep English/Chinese card widths and check padded card/leader intersections.
- **02, vacuum beat:** the purple object was `wave-reference`, the air particle's fixed rest-position tick. Bind its visibility to `medium == air`, matching its specimen. It is hidden for vacuum, water and solid, including interactive changes; the source and receiver remain visible. No part removed or renumbered.
- **1024 × 768 PLATE:** current `solveHudRoom` already folds the left column, including PLATE. No topic camera change is required. Regression checks use tall bilingual column fixtures and all 32 authored beats against a conservatively sized manually reopened PLATE using production `fitCameraToHud`. This is an analytical check, not a browser DOM measurement.
- **Drum:** continuous hollow wooden shell (no rectangular windows or missing wedge), shaped bearing edge, inner reinforcing rings, open bottom with protective edge, rolled/flanged upper hoop, six drilled hoop ears, six tapered oval lugs with insulating gaskets, threaded tension rods, washers and square key heads, small vent ferrule, and one formed thin drumhead with flesh-hoop collar. Preserve the original single-head teaching fact and local marker animation. Rods physically meet their hoop ears. A bottom view verifies the empty cavity and absence of a second membrane.
- **Speaker:** hollow cabinet with an intentionally opened right side and exposed section edges. The mounting baffle has an actual hole. Inside: smooth paper cone, half-roll surround, domed dust cap, four shaped open basket ribs, corrugated spider, former/copper winding, ferrite magnet, steel front/back plates and vented pole, flexible leads and mounting screws. All geometry belongs to the original `speaker-case`, preserving near/far pose transforms, selection and explosion.
- **Bench:** resin worktop, under-top rails, steel underframe, levelling feet, suspended drawer pedestals with individual fronts and bent metal pulls. The working surface stays at y = 0.65 so every apparatus remains supported. Extend the underframe downward to restore standing-height bench proportions. No unrelated props added.

### References and provenance

Original procedural geometry only, no imported meshes/textures, logos, runtime network or third-party geometry. Manufacturer pages are development references, not assertions that this generic design matches a branded product. Reference images stay in ignored `scripts/geo/sound/refs/` and are not distributed.

- Yamaha, [drum structure](https://www.yamaha.com/en/musical_instrument_guide/drums/mechanism/mechanism002.html) and [toms](https://hub.yamaha.com/drums/studio/part-3-toms/): shell, head, hoop, lug and tuning bolt attachment; single-headed tom topology. Viewed the complete drum photo `parts_viewer02.png` and compared shell/head proportions and hardware to the close-up renders. Yamaha retains image copyright.
- MTX, [loudspeaker components](https://www.mtx.com/library-speakers), `https://i.mtx.com/mtxcom/speakerCompon.jpg`: viewed the complete section diagram; cone/half-roll/spider/coil/pole/magnet relationships. MTX retains image copyright. The first partial download was replaced by a complete image before final comparison.
- Kewaunee, [Element laboratory bench](https://kewaunee.com/product/adaptable-systems/stand-alone-benches/element-lab-bench/): viewed its suspended-cabinet bench thumbnail; resin top, metal underframe, lower rails, levelling feet, suspended storage. Original Atlas island configuration, no claimed manufacturer dimensions/load rating. Kewaunee retains image copyright.

Minimal EN/ZH part-text corrections describe the complete drum shell, actual speaker cutaway and laboratory bench. Numbers used for teaching, ids, 24 selectable parts, chapter/beat references, head count, string count, medium equations, controls and marker clocks are unchanged. Six lug stations are a generic DESIGN choice, not a branded instrument specification. Sources and independent-design status recorded in `data/SOURCES.md`.

### Counts and verification

Reproduce the geometry with `pnpm tsx scripts/geo/sound/build-sound.ts`. Count the production engine meshes with `pnpm tsx scripts/geo/sound/inspect-sound.ts [parts.json] [report.json]`. CPU previews use `pnpm tsx scripts/geo/sound/render-preview.ts --out /tmp/atlas-sound-qa/after`.

Structural triangles from actual engine geometry (all authored alternatives counted together): **64,356 → 94,392**, below the 350k screen budget even before layer/medium hiding. Maximum authored visible beat: **32,948 → 50,900**. These counts exclude ground, shadow passes and dynamic wave/pulse overlays.

| Assembly | Before | After |
|---|---:|---:|
| Drum shell / head / marker | 6,924 | 24,684 |
| Speaker | 4,236 | 19,868 |
| Laboratory bench | 2,940 | 16,704 |
| String | 17,280 | 160 |

The existing instanced wave overlay adds 41 × 216 = 8,856 triangles (12 × 10 sphere tessellation); allowing another 216 for the echo pulse keeps even the all-parts/all-overlays upper bound at 103,464 triangles. Shadows are a separate render pass, not additional model geometry.

Performance: 48 radial segments for hero shell/head/cone/surround, 16 for small tension rods, 8 for the fine string, 6 for coil wire/leads, 10–12 for small pulls. Repeated static hardware is batched by material through the existing engine's `partPieces` merger, retaining a single selectable assembly and the allowed part count; no separate hardware draw call per lug or screw. No kit or engine changes.

Viewed CPU depth-buffer previews before/after: `/tmp/atlas-sound-qa/{before,after}/{hero,drum,drum-bottom,speaker,speaker-side,bench}.png`, with camera/count manifests alongside. Iterated rod/hoop contact, washer/key-head seating, lower protective-ring contact with the bench, rounded lug silhouettes and cap/cone/spider face winding. Also viewed `/tmp/atlas-sound-polish-layout/ch06-beat02-layout.png`, a conservative production-solver projection with both labels. Previews show actual generated production geometry with smooth vertex lighting, not hand-drawn substitute models. Runtime PBR, transparency, shadows, font metrics and WebGL interaction are outside CPU-preview coverage.

Final gates:

- `pnpm check`: green, 1,092 files, 0 errors, 0 warnings, 4 existing hints. `pnpm exec tsc --noEmit` also passed after the final contact-test edit.
- `pnpm validate`: green, 94 topics, 0 errors, 0 warnings; repeated inside the final production build with the same result.
- `pnpm run test --maxWorkers=2 --testTimeout=60000 --retry=2`: green, 251 files, 6,343 passed, 1 existing skipped test. Assertions and unrelated code were unchanged. Earlier default/high-contention runs hit unrelated maths/map/mechanism timeouts, catalogue timing and worker RPC failures; the isolated catalogue benchmark also passed. The final complete run passed all files.
- Focused sound content/layout suite: 24/24 passed after final hardware seating changes, including washer-to-ear and key-head contact, the medium binding and all 32 tablet beats.
- `pnpm build`: green, 191 pages plus local service worker. The final run regenerated both languages after the last drum contact adjustment. Existing Vite chunk-size advisory remains.
- `git diff --check`: clean. No browser or desktop automation used.

### Anything not done

No requested item left unimplemented. Browser shoot/e2e and GPU timing were not run, per the explicit no-browser instruction. The PLATE result is solver-based and remains for Claude's browser acceptance, alongside paper/cinema material and real DOM checks. No git writes, other topic edits, shared kit edits, framing changes, package or lockfile edits.

### Claude browser acceptance (2026-11-03)

- Headless WebGL shoot (paper, all 32 beats; cinema spot check; 1024×768 layout pass: 0 issues, left column folds, no camera change needed) against main at the same angles. Vacuum beat shows no purple tick; ch06 beat 2 labels 18/20 anchor apart; drum, speaker cutaway and bench read correctly in close-ups.
- Fixes: tuning-fork U-bend outline densified from 12 to 32 steps per arc (it was visibly faceted in drum close-ups; same outline and dimensions); drum lug bevel 0.005 → 0.0095 so the cast lugs read rounded rather than as flat slabs. Both in `build-sound.ts` (re-run is idempotent).
- Renderer: 42–46k triangles in close-ups, 69k in the busiest overview beat, 80–110 fps headless paper under heavy machine load.

## Polish 2026-11-03 — round 2 drum hardware and worktop

- **Drum hardware:** replaced pointed teardrop lug bodies with parallel-sided, rounded-shoulder cast casings against insulating shell gaskets. Each of six casings has two recessed slotted screw heads. Shorter vertical tension rods pass through coaxial hoop-claw holes into upper lug inserts; the threaded ends disappear inside the casings. Washers contact the tops of the claws and square drum-key heads contact the washers. Nothing projects below a lug. The rods/heads travel with the upper hoop assembly when exploded; the mounted casings stay with the shell. Also separated the wooden lower edge from the protective ring's coplanar underside to remove close-up z-fighting.
- **Drum type/content:** chapter 01 explicitly describes one membrane and an open-bottom shell (EN and ZH), and its first beat identifies the single drumhead. Retained the single-headed concert tom, lower protective ring and open cavity; adding a resonant head or snare wires would contradict this lesson. Only the shell's EN/ZH detail was minimally revised to explain the corrected hardware; ids, six lug stations, teaching numbers, chapters, beats, marker animation and other apparatus are unchanged. The accepted speaker geometry is byte-for-byte unchanged as a JSON object.
- **Lab worktop:** replaced powder coat with dark charcoal, nonmetallic resin using the existing smooth `plastic` family (roughness 0.62, normal strength 0 in paper and cinema, no albedo map). This removes orange-peel bump relief while retaining a matte surface with restrained sheen. Tightened the clean edge radius from 0.025 to 0.012; the flat top and all specimen contacts remain at y = 0.65. Steel frame/drawer finishes are unchanged.

References actually viewed again: the existing ignored Yamaha tom photo `scripts/geo/sound/refs/drum.png` (hoop ears, square rod heads, rods terminating at rounded mounted lugs), and Kewaunee `refs/bench-small.png` (flat dark worktop). Original sources/URLs and copyright boundaries remain in the earlier section and `data/SOURCES.md`. The two-head reference photo supplies hardware topology only; the lesson's open-bottom concert-tom design is preserved. No external assets or runtime requests were added.

### Round 2 counts and close-up verification

Counts use actual production `partPieces` geometry via `inspect-sound.ts`, against the supplied branch state immediately before this round (which already includes Claude's tuning-fork acceptance fix):

| Assembly / visibility | Before | After |
|---|---:|---:|
| Drum shell + head + marker | 24,672 | 24,888 |
| Laboratory bench | 16,704 | 16,704 |
| All authored structural geometry | 95,020 | 95,236 |
| Maximum authored visible beat | 51,528 | 51,744 |

Including the existing 8,856-triangle wave overlay and 216-triangle echo pulse, even the conservative all-parts/all-overlays bound is **104,308 triangles**, below 350k. Shadow passes and ground are excluded; no GPU/FPS claim. Hero round surfaces remain 48 segments; rods 16, small inserts 20 and screw heads 20. The existing per-material production merger batches the repeated static detail, preserving nine drum geometry/material pieces and seven bench pieces rather than adding a draw call per screw.

Rendered and actually inspected `/tmp/atlas-sound-round2/after/{drum,drum-rear,drum-bottom,drum-hardware,bench,bench-top}.png`: front elevated, opposite elevated and underside angles, plus a tighter lug/rod/washer view and worktop close-up. Iterated lower-ring overlap and rod/claw-hole alignment, then regenerated and re-viewed the final images. Before images/parts/counts are in `/tmp/atlas-sound-round2/before/`; final camera manifest and counts are in `after/preview.json` and `after/counts.json`. These are CPU depth-buffer rasters of the shipped production geometry, with smooth lighting, not browser/PBR screenshots. Both-theme resin normal strength, roughness and nonmetallic response are also checked through the production material resolver.

Generator rerun is byte-for-byte idempotent. Semantic comparison confirms that only `laboratory-bench`, `drum-shell` and `drumhead` differ in `parts.json`; controls, animation, cameras, ids and the accepted speaker are unchanged. Hardware regression now verifies that every rod terminates inside its lug, all six rod/claw bores are coaxial, and washers/key heads remain seated. A viewed reference/before/after contact sheet is also saved at `/tmp/atlas-sound-round2/drum-comparison.png` (development-only manufacturer photo).

Final gates, all exit 0:

- `pnpm check`: 1,092 files, 0 errors, 0 warnings, 4 existing hints; TypeScript also passed.
- `pnpm validate`: 94 topics, 0 errors, 0 warnings; repeated successfully by the build.
- `pnpm run test --maxWorkers=2 --testTimeout=60000`: 251 files, all **6,345 tests passed**, no retries. The focused sound content/layout run also passed 25/25.
- `pnpm build`: successful static production build and local service worker; existing Vite chunk-size advisory remains. Logs: `/tmp/atlas-sound-round2/{check,validate,test,build}.log`.
- `git diff --check`: clean. Five owned files changed; no browser or desktop automation used.

### Round 2 omissions

No requested geometry/material item omitted. Browser shoot/e2e and runtime material/GPU acceptance are intentionally left to the following Claude browser review, per the explicit prohibition on browser/desktop use. No git writes, engine/kit edits, other-topic edits, package changes or lockfile changes.
