
## Rebuild 2026-11-05 — round 3 (2026-11-09 implementation)

This section supersedes round-two candidate/acceptance statements for the items below. Part IDs, bilateral counts, chapter/beat references, labels, teaching numbers and EN/ZH wording are unchanged. The two bench motions change only their bar-path joint keys/grip width; a middle key controls the path between endpoints. Groin, accepted grip hands, sketches and existing M8/rack assertions are retained.

### What changed / docs/68 self-grades

| Part / path | Change | Self-grade |
|---|---|---|
| All six topics' exercise highlights | Shared exact-skin masks retain the body's native POSITION/NORMAL/JOINTS/WEIGHTS. A small muscles-only helper applies polygonOffset factor −1 / units −4, resets it for anatomy, and hides every untinted mask. Both layout-time and frame-time visibility use the same rule. | A for depth/visibility design; GPU acceptance remains separate |
| Core rectus-abdominis.l/.r | Rectus gets the central sheath from native curved semilunar profiles, xiphoid to pubis; obliques lose those faces. Rectus 23/21 → 233/228 skin triangles. | A ownership and skin fit |
| Labelled deep muscles | Native anatomical extents project to the corresponding anterior, posterior or lateral skin surface. Every labelled exercise muscle now has nonzero shipped skinFaces. The GLB writer calls round3/mask-guard.mjs on the exact consumed skinFaces and refuses an asset build with an empty labelled muscle; the independent decoded-GLB test also rejects it. Lateral gluteus-minimus footprints are restricted to the lateral iliac surface, excluding the pubis. These are x-ray teaching footprints, not a claim that deep muscles are exposed skin anatomy. | A coverage/registration; B exact surface discrimination where deep and superficial muscles overlap, because no unique visible skin boundary exists |
| Bench / close-grip bench | Resolved actual native asymmetric arms toward a skin landmark 200 mm caudal to the shoulder midline. START arms straight over shoulders; END shaft underside meets the lower sternum, both forearms near vertical. Solved MID removes the bellyward excursion of two-key joint interpolation. | A geometric relationships |
| Cable column, all five exercises | Root cause was writing world-space metres back into normalized Int16 buffers: 2.2 m posts wrapped into −1…+1 m. gymGeometry expands actual loaded positions/normals to Float32 before transformations. Both uprights and crossmember now survive; carriage stays on its rail. | A geometry/runtime decoding |
| Lat pulldown | Floor-authored +Y tower, stack behind seat, opaque beside both solid and wire bodies. Upper rails fit the pulley height without scaling plates/base. Removed 180° authoring reversal. Extended grounded seat connection and thigh-pad support; rollers lowered to the thighs. Sixteen separate plates, guide rods, selector pin, grooved top sheaves, cable, bar/eye, seat and paired rollers retained. | A structure/attachments |
| Core cover | Alpha-only axillary edge cleanup. First median-only look left wispy tips; smoothed robust row bounds close the affected edges while preserving interior fibres/rectus. | A− retained illustration standard |
| Shoulders cover | Upper trapezius slopes into the empty neck outline. Built-in imagegen precise edit, composited only into the local upper-neck area; accepted lower drawing retained. | A− retained illustration standard |
| Anatomy rectus, intercostals, pectoral margins | Opened front/three-quarter/profile chapter-scale detail sheets. Three rectus transverse grooves remain. Every native anatomy attribute and triangle index is byte-identical to main; no source edge or intersection regressed. | A retention versus main; B extreme dissection-edge finish: the original closed native caps remain corrugated and were not replaced with invented anatomy |

### References (development only, no runtime network)

- Core rectus/obliques and core cover: [Gray 392](https://commons.wikimedia.org/wiki/File:Gray392.png), [Gray 399 rectus sheath](https://commons.wikimedia.org/wiki/File:Gray399.svg), [OpenStax anterior/posterior muscles](https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles.jpg). Gray/Carter public domain; OpenStax CC BY 4.0. Existing local images are in scripts/anatomy/rebuild-evidence/refs.
- Bench: [standard top](https://commons.wikimedia.org/wiki/File:Bench_press_1.svg), [standard bottom](https://commons.wikimedia.org/wiki/File:Bench_press_2.svg), [close-grip top](https://commons.wikimedia.org/wiki/File:Close_grip_barbell_bench_press_1.svg), [close-grip bottom](https://commons.wikimedia.org/wiki/File:Close_grip_barbell_bench_press_2.svg). Everkinetic, CC BY-SA 3.0; local refs under round2-motion/refs.
- Pulldown: [exercise pair](https://commons.wikimedia.org/wiki/File:PulldownMachineExercise.JPG), [machine](https://commons.wikimedia.org/wiki/File:Lat_Pull_down_Machine.jpg). Commons CC BY-SA 3.0/GFDL and CC BY-SA 4.0 respectively; original metadata retained under round2-gym/refs.
- Column: [cable pushdown](https://commons.wikimedia.org/wiki/File:CableMachinePushdown.JPG), [multiple cable/row machines](https://commons.wikimedia.org/wiki/File:Multifunctional_cable_and_row_machines_in_a_gym.jpg). Existing downloaded photos/licence metadata: rebuild-evidence/gym/reference-manifest.json.
- Pectorals/intercostals: [Gray 410](https://commons.wikimedia.org/wiki/File:Gray410.png), [Gray 411](https://commons.wikimedia.org/wiki/File:Gray411.png), plus OpenStax above. Public domain Gray/Carter; newly fetched Gray411 is in round3/Gray411.png.
- Shoulder/trapezius cover: [Gray 409](https://commons.wikimedia.org/wiki/File:Gray409.png), OpenStax posterior view above. Native Z-Anatomy licence/source lineage remains in each topic's SOURCES.md; no new third-party runtime model is introduced.

### Two opened looks and changes after looking

1. Opened look1 core curl-up/Pallof, pulldown three-quarter/profile, native rectus/pectoral/intercostal detail and both cover images. The restored float column was continuous. Pulldown profile exposed a small gap between seat and frame and an unsupported pad bracket: extended the floor rail and bracket, lowered rollers. The broad first lateral deep-muscle projection entered the anterior hip: restricted it to lateral-facing iliac skin. Core median-only cleanup left thin fibres at the axillary silhouette: replaced it with a closed, smoothed alpha boundary. Anatomy grooves and original margins match main, confirmed with raw-buffer comparisons.
2. Opened look2 pulldown profile, cable-hip abduction, core and shoulder before/after cover sheets, bench END/profile and core beat-distance views. Pad support now reaches the seat structure and the seat meets the frame rail. The core edge is closed; the trapezius has no horizontal crop. A trial applying the core cleanup too high made a hard notch at the upper crop and was rejected; the final cleanup stays in the axillary area. Actual MotionDriver projection testing caught an abdomenward arc in the two-key bench interpolation; the solved middle key fixes it. The final 101-sample record and final START/END/contact views are retained. Preview tint now reads the actual PartNode TINT/TINT_REST constants and uses the executing contractionPlan/contractionAt functions, rather than a stronger invented highlight colour.

3. Final beat-distance review caught the entire top sheave outside the body-only exercise camera. Added an explicit camera only to the muscles-back pulldown beat (no CameraRig/framing implementation change). It frames the complete machine instead of shrinking the real structure. The new projection gate checks every loaded tower vertex and the pulley against that authored camera. A direct actual Equipment frame-callback test also verifies opaque tower material beside the wire body.

### Evidence / honest limits

Browser-free preview.ts loads shipped compressed buffers through Three's GLTFLoader and uses the same gymGeometry/fitLatTower and highlight material helper as the runtime/patch. studio.ts reuses the fossils numerical GGX / installed RoomEnvironment / hemisphere + key/fill/rim studio, checks executing Lighting.tsx exposure/environment/light bindings and installed R3F ACES/sRGB defaults. It models 24-bit depth and slope/unit polygon bias. Beat views reuse the engine's fitExerciseCamera, posture direction and framing. CPU normal interpolation, derivative micrograin, PMREM filtering, shadows and AA remain approximations; this is not GPU acceptance or a claim of pixel identity.

Front, three-quarter, profile, characteristic detail and paper/cinema beat-distance renders are indexed in comparisons/look1 and look2. Comparison sheets explicitly mark angle/dissection differences. **Exact same-prototype four-angle reference matching is B / not complete:** the available machine photos supply related hardware and limited angles; anatomical drawings use different dissections and do not supply matched orthogonal photographs. No synthetic reference was substituted for a real photograph/drawing.

Runtime-motion tests execute the actual MotionDriver frame callback (only React/R3F scheduling mocked), read actual Three bones/palm offsets, sample 101 loop frames, and project bar/shoulder/sternum from the engine-fitted camera plus a side camera. Both END forearms are checked. Shaft underside/native posed skin clearance is recorded in runtime-motion.json (approximately 3.46 mm standard / −0.001 mm close grip). Native skin/grip/support geometry is retained. No GPU browser, desktop, e2e or shoot was launched.

### Ownership / patch integration

**PartNode.tsx is deliberately untouched.** Apply **scripts/anatomy/round3/highlights.patch** in the main session; it imports the owned muscles-core/runtime/highlight.ts helper and binds its depth/visibility policy at the actual material/frame sites. No GltfSource change is needed. The live worktree contains all allowed data/asset/equipment fixes; highlight depth/neutral-mask suppression remains a candidate until this patch is applied. Both unpatched and patch-applied verification snapshots are exercised. No git writes, engine framing edits, package/lock edits, display-text edits or existing test edits were made.

### Counts and performance

Counts below sum declared nodes, including mutually exclusive anatomy/masks/body/wire nodes, so they are conservative storage counts, not measured simultaneous draws. All individual GLBs remain ≤1,500,000 bytes. The conservative largest topic-node sum plus pulldown and two displayed grip hands remains <305k triangles; the actual exercise path draws fewer. Static gym geometry stays lazily loaded; no build-time kit enters runtime JS.

| Asset | Triangles before → after | Stored colour draws before → after | GLB bytes before → after |
|---|---:|---:|---:|
| muscles-core | 190,567 → 191,113 | 58 → 62 | 1,386,608 → 1,396,164 |
| muscles-back | 172,369 → 173,642 | 97 → 102 | 1,363,952 → 1,376,788 |
| muscles-chest | 183,213 → 184,009 | 62 → 64 | 1,364,000 → 1,369,752 |
| muscles-arms | 154,894 → 154,894 | 112 → 112 | 1,320,728 → 1,320,728 |
| muscles-legs | 159,064 → 159,646 | 110 → 114 | 1,341,536 → 1,350,972 |
| muscles-shoulders | 140,347 → 142,196 | 72 → 82 | 1,021,188 → 1,045,368 |
| muscles-core-gym | 225,616 → 225,616 | 9 → 9 | 1,312,116 → 1,312,116 |
| muscles-back-pulldown | 94,732 → 94,732 | 4 → 4 | 515,228 → 519,412 |
| muscles-core-linea | 2,324 → 2,324 | 1 → 1 | 10,608 → 10,608 |
| muscles-arms-hands | 54,000 → 54,000 | 6 → 6 | 362,668 → 362,668 |

Cable tower is still 58,444 triangles / one colour draw, plus its 4,088-triangle carriage; only decoding changed. Complete pulldown stays 94,732 triangles / four colour draws plus the animated cable. Shadow/transparency passes are additional; no GPU FPS is claimed. Native geometry audit and hashes: scripts/anatomy/round3/metrics.json. Exact cover pixels and dimensions are in public/illustrations/muscles-{core,shoulders}{,@2x}.webp. The imagegen prompt requested only an upper-trapezius extension into the blank neck contour, preserving all other graphite anatomy and transparent alpha; output retained as round3/shoulders-edit.png. Exact built-in prompts and saved output paths are in round3/cover-prompts.md. The core imagegen attempt was rejected by the tool; its final change is deterministic alpha processing of the existing drawing, with no generated anatomy.

### Gates

See scripts/anatomy/round3/gates/results.json and gates-patched/results.json for pnpm check, pnpm validate, pnpm test, pnpm build and the post-build JS-budget check. Source inputs are fingerprinted. The verifier has writable Astro/Vite caches because the supplied node_modules links into a read-only sibling. Its verifier-only config adjustments are limiting workers to two (avoids unrelated 5-second CPU geometry-test timeouts during rendering) and inlining the unchanged installed @react-three/drei for Vitest: the original external loader fails the existing solar-system Html.js import even when that suite runs alone. The real dependency then passes all 28 assertions; no test is mocked/skipped for this workaround. Original repo config is unchanged. Focused muscles gates also run independently. M8 BENCH/DUMBBELL/RACK and motion-limits rack assertions are unedited.

Absolute comparison-sheet directory: **/Users/gavin/work/atlas-b2-r-muscles/scripts/anatomy/round3/comparisons**.

Final verification: both complete snapshots passed pnpm check, pnpm validate, all 280 test files, pnpm build, and the post-build JS-budget gate. The final authored-camera/opaque-tower delta additionally passed current TypeScript, all 10 muscles-specific tests, rebuild and post-build budget checks in both snapshots. The 26 final runtime/asset/test source hashes match both snapshots (round3/gates/final-inputs.json). Verifier-only Drei inlining and a two-worker limit are recorded in environment.json; no repository test assertions/configuration were changed.
