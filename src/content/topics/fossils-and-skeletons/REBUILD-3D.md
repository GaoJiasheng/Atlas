# 3D realism rebuild — 2026-11-02

Original anatomical teaching reconstructions; no specimen identities or bone
inventories are implied. All 33 selectable IDs, one context platform, labels,
chapter/beat references, evidence inventory (7/3/2), teaching text and numbers,
explode directions and simulation settings are preserved. No engine changes.

| Parts | Rebuild |
|---|---|
| `sk-skull`, `sk-jaw` | Deep, narrow, widening skull; curved nasal/cheek/temporal struts, fenestrated maxillae, open orbit/antorbital/temporal spaces, separate dentaries, mandibular openings and curved teeth. |
| `sk-neck`, `sk-trunk` | Separate articular centra, perforated neural arches and neural spines along a curved axis. Dorsal transverse processes. |
| `sk-ribs` | Twelve varied rib pairs rooted at the corresponding dorsal vertebrae; posterior ribs diminish; separate ventral gastralia. |
| `sk-pelvis` | Paired iliac blades with acetabula, pubes and pubic boot, ischia. |
| `sk-arm-l/r`, `sk-leg-l/r` | Separate shafts and articular ends; humerus/radius/ulna, femur/tibia/fibula, metapodials and phalanges. Two finger claws per hand; three support toes and a raised hallux per hindfoot. Fixes fleshy limbs under **Direct record**. |
| `sk-tail-base/tip` | Individual tapering caudal centra, neural spines and ventral chevrons, with visible joint gaps. |
| `prince/apollonia/twinky-study` | Generic diplodocid skeleton: small fenestrated skull, elongate cervicals with bifid processes, separate dorsals/sacrals/whip-tail caudals, attached ribs, scapulae/pelvis, jointed columnar limbs and digits. |
| `myna-body`, `myna-wing` | Continuous body/nape/cranium loft; separate bill/mandible, iris/pupil, short crest; overlapping primaries/secondaries/coverts on both sides, white wing bar, graduated white-tipped tail feathers. |
| `myna-leg` | Scaled tarsi, joints, curved claws, **three forward toes plus a backward hallux on each foot**. |
| `myna-feather` | Asymmetric vane, projecting calamus/rachis, swept surface barbs. |
| `bone-sample`, `buried-bone`, bone in `fossil-bed` | Asymmetric cortical fragment with curved tapered shaft, enlarged articular end and open broken end. |
| `leaf-slab` | Recessed leaf-shaped floor with midrib and branching secondary vein grooves, below the slab rim. |
| Remaining strata, pores/minerals, crystal, footprint, lid/platform | Existing geometry and teaching semantics retained; existing sweeps upgraded to 48 radial divisions. |

Reusable build-time kits: `scripts/geo/kits/dinosaur-skeleton.ts` and `bird.ts`.
All lathe/sweep surfaces start at 48 radial divisions. The bird exposes bill,
neck, leg, wing, tail and crest parameters for later heron/sunbird/hen work.
Repeated bones are merged by material within their selectable module. The
three museum nodes reuse one mesh. Their hundreds of kit primitives exceed
the schema's 33-per-part limit, so `bake-museum.ts` exports an original CC0
meshopt GLB (823,480 bytes), with 0.10% maximum simplifier error. No external
mesh or runtime network source is used; the offline decoder is already native
to Atlas. The existing model schema requires `/models/fossils-and-skeletons.glb`.
Licence/provenance and institutional references are in `data/SOURCES.md` and
`public/models/fossils-and-skeletons/LICENSE.md`.

| Complete tessellation | Before triangles | After triangles | Parts before → after |
|---|---:|---:|---:|
| Specimens | 3,268 | 8,226 | 4 → 4 |
| Burial | 8,274 | 14,322 | 6 → 6 |
| Age section | 4,548 | 8,420 | 4 → 4 |
| Theropod | 90,768 | 280,060 | 12 → 12 |
| Bird + feather | 89,624 | 128,916 | 4 → 4 |
| Three museum studies | 103,920 | 152,790 | 3 → 3 |
| Context platform | 588 | 588 | 1 → 1 |
| **All studies, including hidden** | **300,990** | **593,322** | **34 → 34** |

Counts from the actual engine tessellation and decoded GLB, via
`measure-model.ts`; no back-face culling. Static mesh pieces remain **41 → 41**
over the entire inventory. Largest individual study is 0.280M triangles
(only one study is on screen at a time), within the runbook's 0.3M target.

## Acceptance pass (Claude, 2026-11-02)

- Thin bones sweep at 24 radial divisions (widest radius < 0.045: ribs,
  gastralia) or 16 (< 0.03: teeth, claws, phalanges); thicker bones and all
  lathes keep 48. Theropod 440,252 → 280,060 triangles, museum 254,751 →
  152,790, GLB 1,047,560 → 823,480 bytes. No visible faceting at chapter cameras.
- The theropod and the three museum studies now stand on the platform
  (`lift` in `model-layout.json`) instead of floating 0.55 / 1.04 units above
  it; their preset and chapter cameras move by the same amount, so framing is
  unchanged.
- Myna thigh shortened and tucked into the belly, so it no longer reads as a
  dark stump in front of the leg.
- Browser renderer.info (headless Metal, loaded machine, 1520×1023 buffer):
  ch05 15 calls / 298,572 tris / 47 fps (was 440,844; now 280,652); ch06 12 / 129,508 / 50;
  ch07 6 / 171,868 / 59 (was 255,343; now ~153k). Main before: ch07 104,512 / 63 fps.

References inspected: AMNH's T. rex mount photograph; Hatcher's public-domain
1901 Diplodocus plate via Carnegie Birthplace Museum; Tschopp & Mateus (2017)
on diplodocid vertebrae; NParks myna identification; Abourachid et al. (2017)
on passerine foot orientation. No reference imagery is shipped. NParks and
Smithsonian image downloads returned 403; the AMNH/Hatcher images were viewed.

Two offline geometry rounds checked side/oblique silhouettes. The second
added maxillary bone mass, refined occipital/hip contacts, true bifid cervical
processes, and a narrower myna face. Viewed projections are under
`/private/tmp/fossils-model-qa/`: `r2-1-*`, `r2-2-*`, and final bird/skeleton
side/oblique/exploded views. AABB checks retain expected joint/cavity overlaps;
they are not triangle-intersection certification. Offline painter sorting can
misorder overlapping slab triangles; browser depth-buffer QA remains pending.

Verification: `pnpm check`, `pnpm validate`, `pnpm test` (239 files, 6,136 tests)
and `pnpm build` pass. New regressions check bone/digit topology, ribs attached
to distinct dorsal vertebrae, 48-segment surfaces, module limits and local GLB
decode/nodes/finite normals/size. `pnpm shoot fossils-and-skeletons --beats
--locale en --theme paper` cannot launch Chromium: macOS
`MachPortRendezvousServer` / `bootstrap_check_in: Permission denied (1100)`.
No browser screenshots were produced or viewed. GPU lighting, HUD clearance,
runtime cutaway/selection and paper/cinema browser acceptance remain for a
permitted headless environment. No browser/desktop control or git writes used.
- e2e `fossils-and-skeletons.spec.ts`: 9/9 with GPU. Under software GL on the
  loaded machine (load ~70), `direct … hides precisely five modules` misses its
  5 s poll: hiding modules stalls the page ~6 s here versus ~5.3 s on main (main
  passes just under the limit), so it is borderline on both; software-GL fps
  is the same as main (14 vs 13).

## Polish 2026-11-03

### Museum readability and bone surfaces

- The three study IDs retain one shared anatomical mesh, but their author
  positions are now staggered in X and separated by 2.6 author units in Z.
  The elevated `museum-close` / `museum-pair` cameras show three separate
  rib cages, necks and tails. Chapter 07's two explicit cameras follow the
  same arrangement; chapter/beat IDs, selections and teaching claims stay.
- Replaced emissive `tissue` with non-emissive `abrasive` + `token:bone`.
  This retains the theme's warm bone colour, with the existing grain albedo,
  roughness and recessed normal shading instead of a pale self-lit surface.
  Cinema retains its warm bone token and dark-plate lighting. No added SSAO,
  lights, shader changes or engine changes.
- The previous opaque platform covered the engine's shadow catcher. Its
  replacement is an original bevelled open display frame whose bottom is at
  the standing studies' ground height. The paper/cinema ground and contact
  catcher are visible through it; all three museum modules cast real key-light
  shadows. The context part ID/name stay; only its EN/ZH summary and detail
  now explain the open frame rather than a supporting slab.
- Close-up inspection also found flat iliac/scapular plates and square-ended
  neural spines. `sculpt-museum.ts` generates rounded outlines and bowed,
  variable-thickness cortical surfaces with analytical normals, preserving
  their actual openings. Small exhibit centra use 12–24 radial samples;
  limb shafts use 16–24. This offsets the curved surfaces' extra triangles.

References inspected: Hatcher's public-domain 1901 Diplodocus restoration
([plate](https://commons.wikimedia.org/wiki/File:Hatcher_Diplodocus.jpg),
[original publication](https://www.biodiversitylibrary.org/part/234818)) for
limb ends, girdles, ribs and vertebral rhythm. The historical tail-dragging
pose is not adopted. These remain generic studies, not three specimen scans,
mount copies, size comparisons or original/restored inventories.

### Myna thigh and scaled lower leg

- Kept the correction local to this topic; **`kits/bird.ts` is unchanged**.
  Removed the kit's separately surfaced feathered femoral cuffs, which
  intersected the belly as dark protruding stumps. The continuous body loft
  now supplies that exterior, with a slightly fuller lower belly. Lower legs
  start inside its plumage, so their roots are concealed and there is no
  second dark surface or joint seam below the belly.
- Exposed tibial/tarsal surfaces use the existing `scales` material, with
  scutellation on the tibiae and tarsi as well as the forward digits. The
  anisodactyl 3+1 feet and curved claws are unchanged. Thin leg sweeps use 24
  radial samples. No bird text or teaching numbers needed changing.
- References: [NParks identification](https://biodiversitysg.nparks.gov.sg/our-biodiversity/birds/crows-starlings-mynas/javan-myna/)
  for identification; its image download still returned 403. A side-on
  [photograph by the Animal Photos author](https://www.animal.photos/bird1/myna-jav.htm)
  was viewed for the belly/plumage-to-scaled-leg transition. No photograph or
  derived texture is redistributed.

### Evidence-filter cost

- Source inspection: `SceneRoot` memoizes shapes independently of visibility;
  evidence filtering does not require a geometry rebuild. However, its
  put-aside transition renders the dense modules through transparency, while
  label occlusion raycasts their triangles. Keeping high-density authoring
  tessellation at runtime made both paths expensive.
- Bake the twelve theropod modules into twelve independent local GLB meshes,
  preserving their pivots, material tokens, clipping, explode vectors,
  connections and IDs. Meshopt simplification is bounded to 0.10% module
  extent. Generator inputs remain in `skeleton-source.json` for reproducible
  anatomy/topology tests; those authoring primitives are absent from runtime
  `parts.json`. There is no fallback geometry build or subsequent replacement
  of that skeleton during an early evidence interaction. No shared engine
  files and **no e2e timeout** were changed.
- Runtime JSON: 626,332 → 238,653 bytes. GLB: 823,480 → 1,963,212 bytes because
  it now carries the twelve theropod meshes as well as the shared diplodocid.
  Generated geometry is original CC0; local meshopt decode, no runtime network.
- Alternating A/B CPU occlusion benchmark, seven cycles, 480 fixed rays per
  cycle across whole/direct/whole: median 5,572 → 2,867 ms (49% lower) on this
  heavily loaded host (load average over 200 during the full gates). This is
  CPU work for an amplified fixed-ray batch, **not** browser interaction time,
  software-GL FPS or proof of the e2e's five-second limit.

### Triangle counts and verification

Complete decoded/tessellated geometry, without back-face culling:

| Study | Before | After |
|---|---:|---:|
| Specimens | 8,226 | 8,226 |
| Burial | 14,322 | 14,322 |
| Age section | 8,420 | 8,420 |
| Theropod, 12 modules | 280,060 | 86,864 |
| Bird and comparison feather | 128,916 | 100,884 |
| Three museum studies | 152,790 | 162,120 |
| Context frame/platform | 588 | 128 |
| **All studies, including hidden** | **593,322** | **380,964** |

Selectable parts **33 → 33**; context **1 → 1**. Largest steady chapter:
162,120 museum triangles; with the full shadow-caster pass, frame and catcher,
approximately **325k rendered triangles**, below the 350k target. The theropod
has 69% fewer triangles without dropping any anatomical module.

Offline CPU z-buffer previews were actually viewed: paper/cinema museum
arrays; girdle/rib/neck close-up; bird side, oblique and thigh close-up;
theropod side, skull close-up and exploded view. Iteration changed the flat
cortical plates, removed the remaining thigh surface seam, and exposed the
shadow catcher. Files:
`/private/tmp/fossils-polish-2026-11-03/{before,round1,final}-*.png`.
`polish-preview.ts` uses the actual decoded GLB and engine tessellation with
smooth normals, depth testing and approximate studio light/shadow/albedo.
These are geometry/material studies, not browser screenshots or HUD evidence.
CPU timings: `visibility-cpu.json` in that folder; triangle counts:
`/private/tmp/fossils-polish-counts-final.json`.

Browser/e2e timing, actual GPU shading and HUD/framing acceptance remain for
the subsequent permitted acceptance session: this task expressly prohibits
launching/controlling a browser. No browser, desktop, git writes, dependencies,
other topic or shared engine edits were used.

Final gates: `pnpm check` passes (0 errors / 0 warnings; four pre-existing
hints); `pnpm validate` passes (94 topics, 0 errors / warnings); the full
`pnpm test` script passes via `pnpm run test --maxWorkers=2` (250 files,
6,339 passed, one skipped), and `pnpm build` passes (191 pages). The final
asset's two topic regression files also pass, 53/53. Initial unconstrained
workers overloaded this already heavily loaded host and caused unrelated
five-second test/RPC timeouts; limiting workers fixed the run without changing
any timeout. `git diff --check` is clean. Direct JSON comparison confirms the
entire simulation, ordered part IDs, labels, connections, clipping flags and
explode settings match the baseline; only the context platform's EN/ZH
summary/detail changed. Final GLB SHA-256 matches the copy in `dist/models/`.

### Acceptance note (Claude, 2026-11-03)

- The open display frame is now hidden in chapters 00–06 and their beats
  (`hide: ["study-plinth"]`): spanning 10 × 8.4 units, its rails cut across
  the footprint slab, the sediment block, the theropod and the myna. It stays
  in chapter 07, the only place it frames the three studies.
- Chapter 07 remains open for a composition pass: see the acceptance report.

## Polish 2026-11-03 — browser acceptance return

### Chapter 07 composition and museum finish

- Replaced the 45.9° author view with a **30.0° three-quarter view**, tightened
  its distance, and updated the chapter, both explicit beat cameras and shared
  `museum-close` preset together. The engine's default HUD framing dollies
  along this direction and shifts the projection; it does not pitch the view.
  This topic does not opt into `views.hudFrame`. `museum-framing.ts` reproduces
  that actual placement for offline verification. At three representative
  desktop stage sizes (1520×1023, 1200×843, 1017×703), every decoded bone vertex
  stays in the free rectangle and the museum group occupies over 70% of its
  width. The right reader panel is outside that stage and explicitly included
  as an obstacle in the layout fixtures. No framing/CameraRig edits.
- Replaced `abrasive` + ivory with `plastic` + `token:f-drag`: warm mineral
  brown on paper, warm tan on cinema. Its fine roughness map has **zero normal
  strength and no albedo map**. The strong sand normal over compressed cortical
  UVs caused the previous wood-grain stripes; that source is removed, rather
  than hidden by lighting. Girdle holes, bowed cortical surfaces and all bone
  geometry are retained.
- Replaced the large open rectangular rail with **three low, individually
  bevelled plinths**, one under each study (6.5×1.32×0.16 scene units, 0.045
  bevel). Twelve small translucent contact patches sit directly under the
  actual feet. `views.shadows: none` disables the shared ground blob and shadow
  catcher rather than concealing it in an approximate preview. It also removes
  the redundant shadow-map pass. The one context ID stays `study-plinth`, and
  the accepted `hide` in every chapter/beat 00–06 is preserved. Only its EN/ZH
  detail changed to describe the three plinths; teaching labels/numbers stay.

### Javan myna colour

- The topic passes `billLegTint: token:lamp` to the unchanged shared bird kit.
  Both bill halves, tibiae, tarsi, joints and all eight toes are yellow; the
  small iris is yellow too. The existing four flight-feather bases form the
  small warm-white wing patch, with white tail tips/vent retained. The accepted
  belly/thigh junction and 3+1 feet are unchanged. No bird text change needed.
- Rechecked NParks/AVS's identification (yellow bill/legs/feet, white wing/tail
  bars); re-viewed the previously downloaded Animal Photos side photograph and
  Hatcher's public-domain Diplodocus plate. LKCNHM's Tschopp interview remains
  the exhibit-identity reference. Links and provenance are in `data/SOURCES.md`.
  No external mesh, photograph or texture is shipped.

### Actual visibility-path fix and measurement

- Code trace: the control updates `store.sim`; `SceneRoot` recalculates
  `simRun → simEffects → displays`. Its geometry, material-style and mesh-name
  memos do not depend on visibility. `PartNode` retains its geometry and
  material instances. `GltfSource`'s loader URL, mesh-name map and effect
  dependencies stay stable: a visibility change does **not** reparse the GLB.
- The expensive old path instead eased opacity, set `transparent` and
  `needsUpdate`, and rendered the dense modules during that fade. LabelProbe
  also invalidated occlusion and raycast their triangles. Initial page-ready
  waits for scene/HUD settling, so heavy shader/draw/occlusion work delayed it.
  The older `benchmark-visibility.ts` is an amplified ray benchmark, not a
  hide-path measurement or proof of an interaction timeout.
- Item 3 requires a narrow shared runtime exception: `SceneRoot.tsx`,
  `PartNode.tsx`, the `views.simVisibility` schema field and the small pure
  `visibilityFlags.ts` helper. Only this topic opts into `instant`; all other
  topics retain their previous fade default. A simulation filter preserves
  the underlying layer/aside/opacity decision and immediately gates draw,
  shadow, picking and label visibility in a layout effect, before LabelProbe.
  Hidden modules leave its occluder list immediately. Whole restores the same
  solid material and mesh. Normal layer/aside fades, clipping, explosion,
  animation and selection still use their existing paths. No core, framing,
  Model3DStage, widget, CSS or test-timeout edits.
- Unit-level operation measurement runs the **actual renderer helper** with
  the actual simulation's five hidden IDs and twelve stable module objects.
  Geometry/material/traversal/loader getters throw if touched. One-triangle
  and nominal million-triangle modules execute identical operations: exactly
  five mesh-visibility writes on direct, five on whole; ten shadow-flag writes
  in the shadow-casting test fixture for the complete cycle; **zero geometry/material/loader accesses**. GLTF
  loader load/parse spies remain at zero. Work is O(1) per draw piece, independent
  of triangle count; a filter visits its fixed module inventory.
- Final isolated CPU measurement, 31×1000 cycles: median direct→whole
  **2.67 µs** (tiny) / **2.50 µs** (dense), p95 **8.36 / 2.79 µs**. These are
  helper timings, not browser latency, GPU FPS or an e2e five-second guarantee.
  Reproduce with `pnpm tsx scripts/geo/fossils-and-skeletons/measure-hide-path.ts`;
  output `/private/tmp/fossils-polish-2026-11-03/visibility-flags.json`.

### Counts, previews and limits

Before = the uncommitted browser-return input, not the original pre-rebuild.

| Geometry | Before triangles | After triangles |
|---|---:|---:|
| Theropod (accepted, unchanged) | 86,864 | 86,864 |
| Bird and comparison feather | 100,884 | 100,884 |
| Three museum studies | 162,120 | 162,120 |
| One context ID: rail → three plinths + contacts | 128 | 2,868 |
| **All studies, including hidden** | **380,964** | **383,704** |
| **Chapter 07 submitted incl. shadow pass** | **~324,372** | **164,988** |

33 selectable IDs and one context ID remain. GLB geometry/resources/bytes are
unchanged in this return pass (1,963,212 bytes). The triangle increase is only
in the proper bevelled display furniture; all steady chapters remain below
350k submitted triangles. Source/measurement files:
`/private/tmp/fossils-return-{before,after}-counts.json`.

Actually viewed CPU depth-buffer renders through three visual iterations:
`/private/tmp/fossils-polish-2026-11-03/return-r{1,2,3}-*.png`, then
`return-final-{museum-hud-paper,museum-hud-cinema,museum-paper,museum-bones-close,bird-side,bird-oblique,bird-thigh-close}.png`.
Also viewed `return-1600-museum-hud-paper.png` and
`return-1366-museum-hud-paper.png`. HUD rectangles are clearly labelled offline
clearance proxies, not browser screenshots. The raster uses decoded GLB
geometry, smooth normals, depth testing, translucent contact patches and
approximate studio light. It does not simulate the browser's full PBR/fog.

Browser/e2e and GPU acceptance are deliberately not run because this task
prohibits launching/driving a browser. The code/operation proof above replaces
no timeout and makes no claim that the e2e has been observed passing here.

Final return gates: `pnpm check` passes (0 errors, 0 warnings; four existing
hints); `pnpm validate` passes (94 topics, 0 errors/warnings); the complete
`pnpm test` suite passes via `pnpm run test --maxWorkers=2` (**252 files,
6,349 tests**); `pnpm build` passes (**191 pages**). After the final contact
colour adjustment, all four topic files pass again (**62 tests**) and the
completed build's JS-budget tests pass (**3 tests**). No test timeout changed.
Build and the dist-reading JS-budget test were verified sequentially.
The final built JSON contains the instant-visibility mode and final contact
colour; built/public GLB hashes match the accepted return input exactly.
`git diff --check` passes. Comparison with the return input confirms identical
ordered IDs, simulation, labels, counts, clipping and explode data; the only
EN/ZH copy change is the context plinth detail. All accepted myna geometry
is identical after removing colour fields, and the accepted theropod mesh is
byte-for-byte unchanged. No browser/desktop control or git writes were used.

## Polish 2026-11-03 — round 3, chapter 07 sauropods

Scope: the three generic diplodocid studies only. The theropod and myna,
flag-only visibility path, 30° chapter/preset/beat cameras, three plinths,
neutral contact patches, and restored EN/ZH plinth summary are preserved.
No teaching text, number, part ID, selection, explosion vector, clipping flag,
chapter/beat reference or simulation value changed. Exactly one new colour
name, `fossil`, is registered and defined in both existing theme token blocks:
paper `#6e5a44`, cinema `#97816a`. The three studies use the existing opaque,
non-emissive plastic finish with that tint; there is no sand normal/albedo.

### Completed anatomy

1. **Scapulae and ilia:** replaced the oval shields with an oblique long
   scapular strap, expanded glenoid end and anterior acromion; the ilium has a
   long low arched blade, pre/postacetabular wings and distinct pubic/ischial
   peduncles around an open acetabular notch. Original closed cortical meshes
   use rounded contours, variable thickness, bowed surfaces and buttresses.
   Surface-gradient normals avoid triangulation-dependent flat patches.
2. **All twelve limbs:** each front hand has five unequal, appressed upright
   metacarpals in a posteriorly open U, reduced blunt distal phalanges and one
   medial thumb claw. Each hind foot has five short metatarsal rays, a broad
   semi-plantigrade base, short articulated toes and a large digit-I claw with
   successively smaller II–III claws; IV–V are clawless. Refined articular-end
   profiles of the long bones and retained separate radius/ulna or tibia/fibula.
3. **All three tails:** retain eighty separate caudal centra on a smooth
   axis. Centrum radii decrease progressively; proximal transverse processes,
   neural spines and paired chevron branches shrink independently. Projecting
   spines vanish by caudal 30, chevrons by 37; the distal half consists solely
   of small elongated centra. The whip remains legible instead of ending in
   a dotted sequence of subpixel triangles. Rounded neural-spine crowns also
   remove the former angular cap silhouettes.
4. **Preservation and budget:** three nodes still share one mesh. The new
   `build-sauropods.ts` performs the scoped rebuild and is also the final step
   of `build-model.ts`. `swap-museum-mesh.ts` copies every retained compressed
   buffer verbatim, avoiding even the one-unit normal drift caused by an
   ordinary GLB decode/re-encode. Regression fingerprints confirm every
   theropod index, position, normal, UV and world transform is identical to
   accepted HEAD 2463365; all content outside the three material references
   has the same fingerprint. No shared kit or engine code was edited.

### References actually inspected

- Hatcher (1901), *Diplodocus: its osteology, taxonomy and probable habits*,
  [BHL/public domain](https://www.biodiversitylibrary.org/part/234818), and its
  [restoration plate](https://commons.wikimedia.org/wiki/File:Hatcher_Diplodocus.jpg):
  scapular/iliac silhouettes and diminishing caudal structures. Historical
  tail dragging and obsolete hand posture are not adopted.
- [Carnegie Museum mount photograph](https://carnegiemnh.org/memoirs-of-the-carnegie-museum-volume-1-number-1/):
  viewed for proportions/girdle placement, not traced or redistributed.
- Osborn & Granger (1901), [fore/hind limbs, p. 204, figs. 4–5](https://www.miketaylor.org.uk/dino/out-of-copyright/Osborn-Granger_1901_sauropod-limbs.pdf):
  viewed metacarpal photographs for horseshoe topology, unequal rays and
  articular ends. PDF downloaded and page rendered locally after the first
  download timed out. Reference images remain in ignored `refs/` only.
- Wilson & Sereno (1998), [published sauropod phylogeny/anatomy](https://d3qi0qp55mx5f5.cloudfront.net/paulsereno/i/docs/98-JVP-Sauropod_Phylogeny.pdf):
  rigid U-shaped metacarpal column. Anatomical geometry remains an original
  generic reconstruction, not a measured mount or discovered-bone inventory.

### Counts and offline visual verification

Complete tessellation/decoded triangles, without back-face culling:

| Geometry | Before | After |
|---|---:|---:|
| One shared sauropod, rendered once | 54,040 | 63,500 |
| Three sauropods on screen | 162,120 | 190,500 |
| Plinths and twelve contact patches | 2,868 | 2,868 |
| **Museum chapter total** | **164,988** | **193,368** |
| Theropod | 86,864 | 86,864 |
| Myna + comparison feather | 100,884 | 100,884 |
| All geometry, including hidden studies | 383,704 | 412,084 |

Museum total stays below 200k. `views.shadows: none` is unchanged, so there is
no extra shadow-map pass. Curved limbs use 16–24 radial samples; minute tail
centra use 12 and fine chevron sweeps 10. Normal-aware simplification preserves
cortical curvature within 0.07% assembly error. Selectable/context counts are
33 + 1, unchanged. The asset remains CC0, 13 resources and 15 nodes; no
third-party mesh or runtime network access. Byte totals are recorded with the
final verification below.

Actually viewed CPU depth-buffer previews include the before view, successive
geometry rounds, front/rear feet, girdles, full individual skeleton, tapering
tail and paper/cinema museum arrays with the existing HUD-clearance proxy.
Inspection prompted thicker whip-end centra, refined long-bone profiles,
normal-aware simplification, analytic girdle normals and rounded spine crowns.
The rasterizer now rejects near-plane-crossing triangles so a distant tail
behind a close-up camera cannot project across the foot image.

Preview directory: `/private/tmp/fossils-polish-2026-11-03/`.
Final files: `round3-final-{sauropod-single,sauropod-girdles,sauropod-feet,
sauropod-feet-rear,sauropod-tail,museum-paper,museum-cinema,museum-hud-paper,
museum-hud-cinema}.png`. Baseline: `round3-before-*.png`; intermediate rounds:
`round3-r1-*` through `round3-r5-*`. Counts:
`/private/tmp/fossils-round3-counts-final.json`. These are actual decoded
geometry with approximate CPU lighting, not browser/GPU screenshots.

No requested model item is deferred. Actual browser lighting, interactive
cutaway/explosion/picking, HUD and GPU acceptance remain for the following
Claude browser acceptance, as instructed. No browser or desktop was opened;
no git writes, dependency changes or unrelated topic changes were made.

Final verification: `pnpm check` passes (0 errors, 0 warnings; four existing
hints); `pnpm validate` passes (94 topics, 0 errors/warnings);
`pnpm run test --maxWorkers=2` passes the complete test script (254 files,
6,360 tests); `pnpm build` passes (191 pages). Worker limiting changes no test
or timeout. Added regressions cover named theme-token resolution/contrast and
non-emissive finish, front/hind digit and claw topology, caudal taper and loss
of processes, closed cortical rims, exact accepted-content preservation, exact
theropod-buffer preservation, the existing 30° composition and decoded budget.
`git diff --check` is clean. Final GLB: **1,963,212 → 1,869,136 bytes**;
repeated scoped builds produce the same SHA-256, also matching the exported
`dist/models/fossils-and-skeletons.glb`:
`9547dc62d3e4349c6455f6a286cf9ba09766529ae1a74684387cea56f1e5ffa5`.
Gate logs: `/private/tmp/fossils-round3-{check,validate,test,build}.log`.

## Fix 2026-11-04 — mineral bone colour and museum separation

**Completed:** corrected the three sauropods' material at topic/asset level and
adjusted their longitudinal display stagger. No shared engine, theme token,
kit, package manifest, lockfile or other topic changed. The accepted sculpture,
33 selectable IDs, context ID, EN/ZH copy, teaching counts, chapter/beat
references, selection, cutaway and explosion settings remain intact. The
museum content lives in `07-singapore-skeletons.mdx` in this checkout (the
three-sauropod scene identified as ch06 in the return brief).

### Cause and repair

The token is correctly registered and resolves to paper `#6e5a44` / cinema
`#97816a`; Three converts it from sRGB to linear exactly once. The old GLB had
no texture, vertex colours or source material on this mesh. Its topic material
was opaque, non-emissive `plastic` (metalness 0, roughness .62, grain roughness
map). There is no persistent chapter fade or x-ray alpha in the assembled
museum state. Fog starts outside this assembly's bounds. The pale result
comes from treating the intended *display* brown as a dielectric base albedo
under the bright studio lighting: hemisphere + three directionals + the
RoomEnvironment, followed by ACES (exposure 1.05 paper / 1 cinema). The earlier
preview omitted that environment and ACES, concealing the problem.

`build-sauropods.ts` now authors an explicit `atlasSurface` GLB material using
the existing engine hook: linear base-colour multiplier **.44**, roughness
**.92**, metalness **0**, opaque, no emissive/map/normal map. The fossil token
still supplies the theme-dependent hue. Original CC0 `bone-surface.ts` bakes
24 short hemisphere rays per retained vertex into linear `COLOR_0`: darker
recesses/joint gaps, restrained convex-ridge wear, continuous 3D mottling and
a very small warm shift on exposed cortex. Colours remain in [0,1]. Baking
after simplification adds no triangles, meshes, draw calls or runtime work.
The three skeleton nodes still share one mesh and one material.

The display's source X offsets are now **−.3 / 0 / +.3**, with its existing
Z offsets **−2.6 / 0 / +2.6** and common scale retained. This makes the heads
and ribcages step diagonally through the paper plate instead of lining up.
The corresponding plinths and all twelve foot-contact patches move with their
skeletons. Two offline layout variants were inspected; the stronger diagonal
was selected. The accepted 30° chapter/preset/beat cameras are unchanged.
Three viewport composition regressions still pass. Even the deliberately
lower side-view diagnostic improves the rear skeleton's visible fraction
from 85.2% to 86.9% and the middle one from 91.2% to 92.0%; the authored view
has over 99.98% of each study's projected bone pixels visible.

### Lighting-matched offline measurement and references

`studio-preview.ts` rasterises the actual decoded GLB, with perspective-correct
normal/colour interpolation, front-face culling and depth testing.
`studio-cpu.ts` uses the installed engine's linear colours, directional and
hemisphere intensities/directions, scene environment intensity, GGX/DFG
multiscattering, exposure and exact Three ACES matrices, then sRGB output.
It ray-samples the actual installed `RoomEnvironment`, including its boxes,
point light and emissive panels, and numerically integrates spherical Gaussian
filters using PMREM's sigma values. This finite sampling replaces GPU cubeUV
filtering; the old roughness map uses its .92 mean. These are measurements of
a CPU rendering with the same studio rig, **not GPU screenshots or a promise
of pixel-identical GPU output**. Fog is outside the sampled assembly. The
first sampler revision incorrectly counted black-emissive room surfaces as
emitters; it was corrected and all final before/after images re-rendered.
Only `before-*`, `final-*` and `comparison-*` are final evidence.

Median sRGB over visible bone pixels only, at the same authored museum camera:

| Theme | Intended token | Before | After |
|---|---|---|---|
| Paper | `#6e5a44` | **`#a48765`** (164,135,101) | **`#705a43`** (112,90,67) |
| Cinema | `#97816a` | **`#c5b39d`** (197,179,157) | **`#927f6a`** (146,127,106) |

Bone pixels: 40,990 before / 40,890 after (stagger changes coverage).
Paper background/median-bone contrast rises **2.66:1 → 5.12:1**. The stationary
Apollonia girdle close-up controls for layout: identical 264,482 covered
pixels, median **`#a38664` → `#705943`**. Colour manifests:
`/private/tmp/fossils-fix-2026-11-04/{before,final}-colours.json`.

References used: Gavin's specified brown tokens; the installed
`Lighting.tsx`, `lib/color.ts`, `GltfSource.tsx`, `PartNode.tsx`, Three
`RoomEnvironment.js`, `lights_physical_pars_fragment.glsl.js`,
`envmap_physical_pars_fragment.glsl.js` and `tonemapping_pars_fragment.glsl.js`.
The existing public-domain Hatcher restoration plate
(`/private/tmp/fossils-diplodocus.jpg`) was inspected for the retained silhouette,
not for colour. The [museum's official gallery](https://lkcnhm.nus.edu.sg/exhibition/biodiversity-gallery/)
was checked, but its direct photo retrieval was blocked; no photograph was
used as a texture, colour measurement or new anatomical authority.

Actually viewed before/after paper/cinema arrays, HUD-clearance proxy arrays,
single skeleton, girdles, front/rear feet and tail renders. Final previews:
`/private/tmp/fossils-fix-2026-11-04/final-{museum-paper,museum-cinema,
museum-hud-paper,museum-hud-cinema,museum-side,sauropod-single,sauropod-girdles,
sauropod-feet,sauropod-feet-rear,sauropod-tail}.png`.
Side-by-side boards: `comparison-{paper,cinema}.png` in that directory.
The HUD rectangles are explicitly labelled offline clearance proxies.

### Geometry, preservation and gates

| Geometry | Before triangles | After triangles |
|---|---:|---:|
| One shared sauropod, rendered once | 63,500 | 63,500 |
| Three sauropods | 190,500 | 190,500 |
| Three plinths + twelve contact patches | 2,868 | 2,868 |
| **Museum chapter on screen** | **193,368** | **193,368** |
| Theropod | 86,864 | 86,864 |
| Myna + comparison feather | 100,884 | 100,884 |
| All geometry, including hidden studies | 412,084 | 412,084 |

Asset: **1,869,136 → 2,116,224 bytes**, below 2.5 MB. The retained compressed
theropod buffers are copied verbatim, with their original exact regression
fingerprint passing. IDs, names, summaries, details, counts, clipping flags,
connectivity and explosion vectors compare identical to the input. The data
preservation fingerprint masks only the authorised museum material and
plinth/contact X placements; separate checks verify their new placements.
New regressions load the real asset with Three's GLTFLoader and exercise the
production material hook, linear tint multiplication, matte/opaque state,
vertex-colour range and the calibrated lighting response. No test timeout or
test selection was weakened.

No requested colour or separation fix is deferred. Browser/GPU lighting,
interactive picking/explosion/cutaway and e2e acceptance remain for the next
browser-capable session, because this task explicitly prohibits opening or
driving a browser/desktop. No git writes were used.

Final gates: `pnpm check` passes (0 errors/warnings, four pre-existing hints),
`pnpm validate` passes (94 topics, 0 errors/warnings), and `pnpm build` passes
(191 pages). The full unchanged test suite passes: **271 files / 6,502 tests**,
using `pnpm run test --config /private/tmp/fossils-fix-2026-11-04/vitest-worktree.config.mts --maxWorkers=2`.
The temporary configuration imports the repository's exact Vitest configuration
and only adds this worktree and its shared `/Users/gavin/work/atlas/node_modules`
to Vite's filesystem allow list. The default run collected/passed 6,474 tests
but could not import Drei's existing `Html.js` for the unrelated solar-system
suite through the external dependency symlink; the access-only configuration
restores all 28 tests in that suite. No assertions, selection or timeouts
changed. A local dependency wrapper also keeps Vite's writable cache inside
this worktree; no dependencies or manifests changed.

All six topic files pass (72 tests), including the actual GLTFLoader material
integration and unchanged theropod-buffer fingerprint. `git diff --check` is
clean. The final built/public GLBs match SHA-256
`23bf1977bbad64711a77a8d54eb1d6ea0fb049d366bc3d9269d99a320ce5b38e`.
Logs, counts, before snapshot and measurements are in
`/private/tmp/fossils-fix-2026-11-04/` (`check.log`, `validate.log`, `test.log`,
`build.log`, `counts-after.json`, `{before,final}-colours.json`).

### Acceptance 2026-11-04 (Claude, real GPU)

Measured on `pnpm shoot fossils-and-skeletons --beats --gpu` (Metal ANGLE,
1920×1080), museum beat 1, median sRGB over bone pixels (chroma mask) at the
same authored camera, main vs this branch:

| Theme | Token | Before | After | After p10 / p90 |
|---|---|---|---|---|
| Paper | `#6e5a44` | `#a58868` | `#6f5943` | (76,59,42) / (157,141,123) |
| Cinema | `#97816a` | `#c3b19b` | `#8e7b67` | (96,81,66) / (173,155,133) |

Per skeleton (Prince / Apollonia / Twinky ribcage) the paper medians are
`#6f5942` / `#6f5942` / `#705a43`; bone vs paper background contrast is about
5.3:1 (was 2.6:1). The CPU estimates above agree with the GPU within a few
levels. Every other beat in both themes (theropod, myna, strata, tracks) is
pixel-identical to main. The three studies now read as three dark outlines on
the ivory plate; separation comes mainly from value contrast plus the stagger.
