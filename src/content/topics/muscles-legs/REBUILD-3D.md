

## Rebuild 2026-11-05

Resumed and reinspected 2026-11-09. **Reviewable candidate; the unapplied engine patches and concrete below-A limits mean this is not final visual acceptance.**

This is one shared six-topic rebuild. Original selectable part IDs/counts, bilateral mappings, rig pivots, chapter/beat references, exercise IDs, teaching numbers and muscle labels remain. REVIEW.md, FIXES.md and REBUILD-3D.md were absent in these six topic directories at the beginning of the batch. No browser/desktop, git writes, engine edits, shared kit edits or package/lockfile edits were used.

### Rebuilt geometry and actual runtime boundary

The existing data contract now selects `views.exerciseBody: mannequin`. Continuous source skin replaces the coarse wire proxy: the 242 exact native Regions skin panels (100,798 source triangles) feed 2 mm voxel reconstruction, 3 mm regional closing, axial interior filling, relaxation and marching cubes. Bounded wrist-plane splitting, original rig/branch membership and regular smooth joint blends retain four-influence skinning. Source asymmetry, five separate unequal fingers, feet/toes and native nail plates remain. Native nail plates retain separate closed relief shells over the actual skin triangles; their five-component volume/topology audit is recorded with the decoded hand evidence. Signed UV wrap and normalized fibre fields survive meshopt, with quantization. Tiny accidental source holes and duplicate/degenerate faces are repaired; large regional dissection boundaries remain documented below.

The executing renderer removes source skin hands and substitutes `Hands.tsx`; improved GLB hands alone therefore do not fix training grips. The separate sculpted grip asset and `hands-runtime.patch` address that exact path. `gym-runtime.patch` replaces the actual equipment factories and mounted output pulley. `linea-alba.patch` adds a 2,324-triangle continuous pale source-profile band, inheriting rectus opacity and clipping, hidden while layers peel. These patches are intentionally unapplied in the worktree under the ownership rule; they are reviewable changes for the main session.

### Real references

Z-Anatomy geometry: https://github.com/LluisV/Z-Anatomy . Native source, changes and CC BY-SA separation are retained in `data/SOURCES.md`. Gray/Carter plates are public domain; the named 2016 OpenStax illustration is CC BY 4.0. These are genuine anatomical drawings, not AI comparison references.

- [Gray434.png](https://commons.wikimedia.org/wiki/File:Gray434.png): Hamstrings and gluteal attachments.
- [Gray438.png](https://commons.wikimedia.org/wiki/File:Gray438.png): Gastrocnemius and Achilles.
- [Gray441.png](https://commons.wikimedia.org/wiki/File:Gray441.png): Lateral foot and tendons.
- [1105_Anterior_and_Posterior_Views_of_Muscles.jpg](https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles.jpg): Whole-body proportions.

Hands/feet also use [Gray424.png](https://commons.wikimedia.org/wiki/File:Gray424.png) and [Gray441.png](https://commons.wikimedia.org/wiki/File:Gray441.png). Each gym hero has 2–4 real photo/drawing references, author/licence metadata and residual design differences in [GYM-REBUILD.md](../../../../scripts/geo/muscles-core/GYM-REBUILD.md).

### Visual iteration log

1. **First inherited rebuild look:** engine-studio/ACES comparison showed skin panel gaps, wrist seams, angular digits and disconnected anatomy context. Reconstructed the outer skin volume, relaxed it, retained native nail plates and merged the nails into the first primitive because the executing GltfSource drops secondary primitives.
2. **Second look:** rejected corrugation and sawtooth wrist boundaries. Replaced nearest-owner partitions with shared wrist planes and restored signed UV wrap after an intermediate clamp would have made false texture seams.
3. **Resume look 1:** the saved surface finish had stopped before completion. Isolated hand inspection exposed a thigh fragment assigned to a hand. Finished the saved wrist split, rebuilt all six, and added an actual decoded-hand-bounds regression.
4. **Resume look 2:** replaced lifted nearest-vertex nail projection with closest-triangle projection and reduced relief. A later dorsal close-up exposed the collapsed closed-shell underside; the final repair retains true plate thickness and adds an independent shell-volume/topology regression. A first camera correction based on native FBX normals was itself wrong; final decoded nail visibility established camera 180 as dorsal, and the isolated view is rolled 180 degrees to align the historical reference. A posed-body review then exposed a separate skin-weight fold; its final correction and residual limits are recorded in [body-review.md](../../../../scripts/anatomy/rebuild-evidence/body-review.md).
5. **Native volume and pose review:** rejected the hollow 11 litre shell and 25 mm closing experiment. Axial filling prevents facial openings from draining the torso; 3 mm regional closing preserves armpit/crotch spaces. Rebuilt from 242 native skin panels instead of the decimated baseline, increased each hand target to 7.5k triangles, regularised source-rig skin weights and checked solid volume, soles, shared wrists and actual-data poses. Also caught generic source axes differing from the executing topic axes; the final preview reads `parts.json.rig` and a mutation regression verifies those values affect the posed render.
6. **Fascia looks:** native source band comparison showed an irregular tessellated boundary; a section-derived continuous relief loft removes the ladder appearance. Reopened the smooth front/detail/profile renders; the band is continuous and pale. Added opacity/clipping and peel-state gating so it cannot float between exploded muscles.
7. **Gym and covers:** resumed inspection caught an unmounted cable output, an unsupported bench adjustment brace and a chassis collision; corrected all three. Cover inspection rejected a false rectus-visibility claim: reflected the native oblique aponeurosis to reveal true rectus intersections before graphite processing. Full iteration details are in the shared gym, body and illustration reviews.
8. **Final-pixel rejection and revision 18:** revision 15 still visually merged rectus with obliques despite correct source selection. Withdrew its A claim. Made obliques pale and rectus distinct, removed generic diagonal hatch over rectus, retained its three native relief grooves, replaced the ragged alba source margin with a smooth source-profile ribbon, and bounded medial source-surface finishing to 2 mm. Reopened exact final WebPs at 2×; native upper-attachment/dissection edges keep the cover grade B.

### Offline lighting and evidence limits

`scripts/anatomy/rebuild-evidence/studio.ts` reuses the fossils GGX numerical studio. Its gate reads the executing Lighting.tsx and checks the actual intensity/exposure/environment bindings, the installed R3F ACES/sRGB configuration, mannequin material and tissue emission. Installed RoomEnvironment sampling has a source/version fingerprint. Rendering uses the actual decoded compressed GLB, per-material environment intensity, muscle emission, ACES and sRGB. Roughness-map mean, environment filtering and muscle micrograin remain approximations; no GPU shadow/AA/contact claim is made.

Front, three-quarter, profile and characteristic-detail sheets exist for all six regions, plus complete-body, dorsal hand, lateral foot and asymmetric pose studies. **Most Gray references differ in angle/dissection depth; exact four-angle same-object photographic acceptance is not complete.** Sheet captions disclose that difference. Gym perspective studies also disclose generic-equipment differences. CPU checks and finite pose bounds do not substitute for GPU acceptance.

### Per-part self-grades and measured counts

A = meets the reviewed form/proportion criterion; B = the concrete source/close-up/evidence limitation below remains; C = old unchanged runtime geometry. The previous docs/68 review graded source anatomy A; this stricter brief also evaluates dissection boundaries and close-up surface quality. Retained regional muscle/bone surfaces are **B** because uneven fascia cuts and exposed deep structures remain at some angles, and the regional assets do not form a complete superficial anatomical body. Whole-body silhouette/proportions are **A**; hand/foot close-up remains **B** for shallow knuckle/crease/toe detail, and extreme poses remain **B** because the existing linear blend rig has no corrective axillary/groin shapes. No below-A part is silently marked accepted.

| Part ID | Change / grade | Triangles before → after | Sampled max surface delta |
|---|---|---:|---:|
| `gluteus-maximus` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 6,652 → 2,200 | 1.692 mm |
| `tensor-fasciae-latae` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 3,724 → 928 | 0.863 mm |
| `iliotibial-tract` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,982 → 1,992 | 2.042 mm |
| `sartorius` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 8,902 → 2,222 | 1.425 mm |
| `rectus-femoris` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 9,602 → 2,536 | 1.297 mm |
| `vastus-lateralis` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 12,688 → 3,170 | 1.124 mm |
| `vastus-medialis` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 8,644 → 2,286 | 1.394 mm |
| `biceps-femoris-long` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 13,706 → 3,426 | 1.839 mm |
| `semitendinosus` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,996 → 1,996 | 1.324 mm |
| `gastrocnemius-medial` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,980 → 1,996 | 1.715 mm |
| `gastrocnemius-lateral` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,992 → 1,996 | 0.852 mm |
| `tibialis-anterior` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,052 → 1,752 | 5.514 mm |
| `gluteus-medius` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,996 → 1,994 | 3.823 mm |
| `adductor-longus` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,428 → 1,852 | 0.727 mm |
| `gracilis` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,986 → 1,996 | 1.839 mm |
| `pectineus` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 3,904 → 976 | 1.293 mm |
| `semimembranosus` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,994 → 1,996 | 2.652 mm |
| `biceps-femoris-short` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 4,952 → 1,236 | 0.928 mm |
| `soleus` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 12,910 → 3,216 | 1.424 mm |
| `gluteus-minimus` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,994 → 1,992 | 2.233 mm |
| `vastus-intermedius` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,978 → 1,992 | 1.958 mm |
| `adductor-brevis` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 4,264 → 1,060 | 0.864 mm |
| `adductor-magnus` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,986 → 2,064 | 2.688 mm |
| `psoas-major` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 2,996 → 1,918 | 4.978 mm |
| `iliacus` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 2,990 → 1,118 | 3.510 mm |
| `fibularis-longus` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 2,966 → 756 | 3.444 mm |
| `pelvis` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 6,000 → 3,212 | 1.658 mm |
| `femur` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 7,588 → 2,276 | 1.261 mm |
| `patella` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 552 → 552 | 0.000 mm |
| `lower-leg` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 5,868 → 1,760 | 1.255 mm |
| `foot` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 9,524 → 4,126 | 1.786 mm |
| `lumbar-spine` | Source cleanup/simplification; **B** (regional cut/evidence limits above) | 4,000 → 2,488 | 1.421 mm |
| `skin-outline` | Continuous skin; **A silhouette / B hand-foot detail** | 18,778 → 32,412 | — (reconstructed surface) |

Surface deltas come from exact decoded bind-space meshes, up to 1,800 sampled vertices and 1,600 area-weighted interior samples each direction, with complete closest-triangle search. These are sampled estimates, not certified global Hausdorff bounds. Meshopt error settings are simplification targets, **not independently measured surface-distance guarantees**. The durable per-mesh audit accompanies this report. `anatomy-retention.json` independently decodes the final skin-only rebuilds and verifies their muscle/bone topology and bind positions exactly match the audited inputs.

| Shared hero | Grade | Before → after triangles / calls | Concrete remaining limit |
|---|---|---|---|
| Native skin hands (both) | **B close-up** | 2,511 → 19,270; 2 colour draws | Five closed native nail shells per hand; fine skin detail and exact-photo acceptance remain. |
| Training grip hands | **B candidate / C unchanged runtime** | Per hand: relaxed 2,396 / palm 1,820 / fist 3,548 → 9,000 each; one colour draw per hand | Runtime patch unapplied; exact-angle close-up and GPU grasp/contact acceptance pending. |
| barbell | **B candidate / C unchanged runtime** | 1,536 → 35,096; 1 → 1 calls | Related-design photo comparisons; engine patch and actual exercise contacts pending. |
| dumbbell | **B candidate / C unchanged runtime** | 880 → 22,784; 1 → 1 calls | Related-design photo comparisons; engine patch and actual exercise contacts pending. |
| bench | **B candidate / C unchanged runtime** | 1,212 → 28,012; 1 → 1 calls | Related-design photo comparisons; engine patch and actual exercise contacts pending. |
| rack | **B candidate / C unchanged runtime** | 4,704 → 21,780; 1 → 1 calls | Related-design photo comparisons; engine patch and actual exercise contacts pending. |
| cable | **B candidate / C unchanged runtime** | 1,368 → 64,252; 1 → 1 calls | Related-design photo comparisons; engine patch and actual exercise contacts pending. |
| pulley | **B candidate / C unchanged runtime** | 192 → 5,240; 1 → 1 calls | Related-design photo comparisons; engine patch and actual exercise contacts pending. |
| Smooth linea alba | **A reviewed band / B integration** | 338 native → 2,324 smooth relief; +1 call if integrated | Renderer patch unapplied; remaining regional dissection boundaries are separate. |
| Six covers | **B overall; named docs/69 defects corrected** | 0 runtime triangles/calls/GLB bytes | Six checks per cover verified at 2×; native dissection-edge stylization remains and the shared alpha-mask patch is unapplied. |
| Three exercise sketches | **A for reviewed technique relationships** | 0 runtime triangles/calls/GLB bytes | Final generated pixels checked at 2×, separately from exact input-guide coordinate assertions. |

### Performance and licence separation

- Topic GLB: **3,983,112 → 1,446,512 bytes**, **251,523 → 149,174 declared node triangles**, **66 → 66 estimated mesh draws**. Optional wire/body nodes are mutually exclusive; the declared node sum conservatively counts shared body geometry twice. Wire fill/depth, shadows and transparency add passes. These are architecture estimates, not measured GPU statistics.
- Default training body geometry: **3,438 → 32,412 triangles**; wire depth/fill/edge draws → one smooth mannequin colour draw, excluding the two hands, muscle overlays and equipment.
- SHA-256: `f143525883833a449f96e16f486a0ce80dbaa22d8920805afc41866b69633c9c`.
- All six anatomy GLBs are ≤1,500,000 bytes. Separate gym GLB: 0 → **1,047,684 bytes**. Separate grip GLB: 0 → **362,668 bytes**. Barbell+bench+rack add **84,888 triangles / about 3 merged colour draws**. The cable review mesh contains the output sheave; actual runtime split is 64,252 tower + 5,240 output, not two copies of the review cable. Even a conservative single-topic body/anatomy + bench/rack/bar + grip + fascia estimate stays below 350k colour-pass triangles. No FPS is claimed.
- Z-Anatomy-derived anatomy GLBs, generated fascia and cover art remain CC BY-SA 4.0 with upstream BodyParts3D attribution. Original gym/grip code and code-guided exercise drawings stay separate; research images keep their recorded licences. No runtime network.
- This topic’s two cover WebPs: **176,254 → 150,322 bytes**. All six covers plus three exercises: **2,098,588 → 1,280,800 bytes**; exact per-image dimensions, margins, grayscale and SHA-256 are in `image-metrics.json`.
- Only the skin detail wording was minimally updated in EN/ZH to describe a smooth source-derived surface; labels, counts, numbers, chapters and beats were preserved.

### Illustrations and remaining work

All six covers use the same native pose family/proportions and line rules, complete superficial source selections, covered head/neck/hands/feet and a smooth pale anterior band. Native medial aponeurosis is reflected for the rectus teaching view, rather than drawing fake six-pack lines. Unchanged `scripts/illustrate.ts` processes the corrected renders in a temporary workspace. The three exercise drawings use deterministic countable pose guides followed by reviewed graphite style transfer; final pixels are visually checked, not falsely certified by guide-coordinate assertions. Per-image manifests have six checks and reference URLs.

- **Engine integration:** concrete gym, hands and linea-alba patches are supplied in `scripts/geo/muscles-core/`; forbidden worktree engine files are unchanged. Main-session application and GPU acceptance remain.
- **Shared cover masks:** `scripts/anatomy/rebuild-illustrations/shared-coverage.patch` refreshes only six alpha-mask entries in out-of-scope `src/lib/illustrations.json`; it is unapplied.
- **Below-A anatomy details:** fine hand/foot relief, extreme-pose axillary creasing, regional fascia/dissection boundaries, complete same-object four-angle references and exercise grasp/contact evidence remain. These are described as unfinished quality/evidence items, not dismissed as unit-test success.
- Native Blender previously crashed during Metal initialization; the resumed surface finish uses saved native baselines plus offline Three/meshoptimizer/SciPy/scikit-image. This is not native Blender or GPU acceptance.

### Gates

- `pnpm check`: PASS (exit 0; 115.01s; `scripts/anatomy/rebuild-evidence/gate-logs/1-check.log`).
- `pnpm validate`: PASS (exit 0; 15.02s; `scripts/anatomy/rebuild-evidence/gate-logs/2-validate.log`).
- `pnpm test (2 workers, 30s timeout)`: PASS (exit 0; 108.35s; `scripts/anatomy/rebuild-evidence/gate-logs/3-test.log`).
- `pnpm build`: PASS (exit 0; 81.45s; `scripts/anatomy/rebuild-evidence/gate-logs/4-build.log`).

The combined proposed engine patches also passed isolated Astro sync + TypeScript and 17 hand/gym regression tests; see `scripts/anatomy/rebuild-evidence/integration-verification.json`. This proves patch compatibility, not GPU or exercise-contact acceptance.

The provided `node_modules` symlink points at a read-only sibling, so direct Astro/Vite cache writes fail with EPERM. `prepare-gates.py` creates an exact source/asset snapshot with writable cache directories and identical installed package files/versions under `/private/tmp/atlas-muscles-rebuild-gates`. The unchanged Drei package is copied locally for Vite realpath resolution. Gate commands/logs and input hashes record the actual check environment. Browser e2e/shoot is intentionally not run because the user forbids Chromium/browser/desktop access.

Comparison-sheet directory: **`/Users/gavin/work/atlas-b2-r-muscles/scripts/anatomy/rebuild-evidence/comparison-sheets`**.
It links the anatomy baseline/iterations/final/poses/fascia sheets, gym final photos and illustration 2×/theme sheets.

## Acceptance round 1 (2026-11-09)

Shared with all six muscles topics: see `../muscles-core/REBUILD-3D.md` § Acceptance round 1.

## Rebuild 2026-11-05 — round 2 (offline review 2026-11-09)

This section supersedes round-one counts and readiness claims. No browser, Chromium, desktop, git writes, teaching labels, chapter IDs, beat references or EN/ZH display text were changed.

### Rebuilt parts and references

- [Gray434.png](https://commons.wikimedia.org/wiki/File:Gray434.png) — Gray/Carter historical anatomical drawing, public domain; proportions, native muscle boundaries and characteristic attachments.
- [Gray438.png](https://commons.wikimedia.org/wiki/File:Gray438.png) — Gray/Carter historical anatomical drawing, public domain; proportions, native muscle boundaries and characteristic attachments.
- [Gray441.png](https://commons.wikimedia.org/wiki/File:Gray441.png) — Gray/Carter historical anatomical drawing, public domain; proportions, native muscle boundaries and characteristic attachments.

| Part ID | docs/68 self-grade / change | Triangles before → after |
|---|---|---:|
| `gluteus-maximus` | A: source anatomy retained; accepted regional form | 2,200 → 2,200 |
| `tensor-fasciae-latae` | A: source anatomy retained; accepted regional form | 928 → 928 |
| `iliotibial-tract` | A: source anatomy retained; accepted regional form | 1,992 → 1,992 |
| `sartorius` | A: source anatomy retained; accepted regional form | 2,222 → 2,222 |
| `rectus-femoris` | A: native transverse creases restored | 2,536 → 2,536 |
| `vastus-lateralis` | A: source anatomy retained; accepted regional form | 3,170 → 3,170 |
| `vastus-medialis` | A: source anatomy retained; accepted regional form | 2,286 → 2,286 |
| `biceps-femoris-long` | A: source anatomy retained; accepted regional form | 3,426 → 3,426 |
| `semitendinosus` | A: source anatomy retained; accepted regional form | 1,996 → 1,996 |
| `gastrocnemius-medial` | A: source anatomy retained; accepted regional form | 1,996 → 1,996 |
| `gastrocnemius-lateral` | A: source anatomy retained; accepted regional form | 1,996 → 1,996 |
| `tibialis-anterior` | A: source anatomy retained; accepted regional form | 1,752 → 1,752 |
| `gluteus-medius` | A: source anatomy retained; accepted regional form | 1,994 → 1,994 |
| `adductor-longus` | A: source anatomy retained; accepted regional form | 1,852 → 1,852 |
| `gracilis` | A: source anatomy retained; accepted regional form | 1,996 → 1,996 |
| `pectineus` | A: source anatomy retained; accepted regional form | 976 → 976 |
| `semimembranosus` | A: source anatomy retained; accepted regional form | 1,996 → 1,996 |
| `biceps-femoris-short` | A: source anatomy retained; accepted regional form | 1,236 → 1,236 |
| `soleus` | A: source anatomy retained; accepted regional form | 3,216 → 3,216 |
| `gluteus-minimus` | A: source anatomy retained; accepted regional form | 1,992 → 1,992 |
| `vastus-intermedius` | A: source anatomy retained; accepted regional form | 1,992 → 1,992 |
| `adductor-brevis` | A: source anatomy retained; accepted regional form | 1,060 → 1,060 |
| `adductor-magnus` | A: source anatomy retained; accepted regional form | 2,064 → 2,064 |
| `psoas-major` | A: source anatomy retained; accepted regional form | 1,918 → 1,918 |
| `iliacus` | A: source anatomy retained; accepted regional form | 1,118 → 1,118 |
| `fibularis-longus` | A: source anatomy retained; accepted regional form | 756 → 756 |
| `pelvis` | A: source anatomy retained; accepted regional form | 3,212 → 3,212 |
| `femur` | A: source anatomy retained; accepted regional form | 2,276 → 2,276 |
| `patella` | A: source anatomy retained; accepted regional form | 552 → 552 |
| `lower-leg` | A: source anatomy retained; accepted regional form | 1,760 → 1,760 |
| `foot` | A: source anatomy retained; accepted regional form | 4,126 → 4,126 |
| `lumbar-spine` | A: source anatomy retained; accepted regional form | 2,488 → 2,488 |
| `skin-outline` | B: continuous neutral skin; pose/close-up limits below | 32,412 → 34,562 |

Rectus keeps its original 16,246 triangles in core (5,684 in round one); transverse intersections were not smoothed away. Pectoral/intercostal simplification retains edge loops and weights normal changes. Intercostals remain **B at extreme close-up**: the original closed source bundles retain corrugated dissection margins; CPU derivative-free shading exaggerates those facets, and exact GPU/source-photo margin matching is not certified. This is an explicit remaining finish limit, not a claim that the focused CPU detail is A. IDs, counts and source attachment relationships are preserved.

Training skin is a single closed implicit source surface with a smooth neutral pubic cap. The genital extension, detached supine pad and rejected artificial shorts leg cylinders are removed. Source asymmetry, hands and feet remain. New exact-skin muscle masks share the mannequin's position, normal, skin indices, weights, skin and transform at **0 mm offset**; nearest-source ownership and island cleanup remove overlapping/frayed patches, with a 7 mm geodesic vertex-alpha transition fading the remaining border into skin. No detached anatomical muscle sheet is needed in training. **B for extreme-pose corrective anatomy and close-up digit/axillary detail**: linear blend skinning has no corrective flexion shapes, and a 32k body cannot reproduce every small skin crease.

### Runtime equipment / owned integration

Barbell, dumbbell, four authored bench inclines and fitted rack load from `muscles-core-gym.glb`. A complete pulldown adds sixteen bored stack plates, guide rods, selector pin, supported top grooved sheave/guards, connected cable, bent bar/eye, seat and fitted thigh rollers. Bench carry handle now meets a crossmember. Linea alba is a narrow flattened pale tendon band from pubis to xiphoid loaded from a 10,608-byte GLB; code-built material and lazy mount remain intact. High-detail geometry and the legacy small-prop builders are absent from shared first-load JS.

Equipment form **A**; exact same-machine four-angle photo evidence **B** (related production machines rather than a single calibrated prototype). Existing barbell, dumbbell, bench, rack and cable photos/licences: [gym reference manifest](/Users/gavin/work/atlas-b2-r-muscles/scripts/anatomy/rebuild-evidence/gym/reference-manifest.json). Additional heroes: [pulldown exercise](https://commons.wikimedia.org/wiki/File:PulldownMachineExercise.JPG), [pulldown machine](https://commons.wikimedia.org/wiki/File:Lat_Pull_down_Machine.jpg), [Olympic bar](https://commons.wikimedia.org/wiki/File:Olympic_barbell.jpg), [incline bench](https://commons.wikimedia.org/wiki/File:Incline_bench.jpg), [rack](https://commons.wikimedia.org/wiki/File:Power_Rack.JPG), [chrome dumbbells](https://commons.wikimedia.org/wiki/File:Chrome_dumbbells.jpg), [dumbbell](https://commons.wikimedia.org/wiki/File:Dumbbell_4kg.jpg), [cable column](https://commons.wikimedia.org/wiki/File:CableMachinePushdown.JPG), [cable/row machines](https://commons.wikimedia.org/wiki/File:Multifunctional_cable_and_row_machines_in_a_gym.jpg).

### Shared hero counts (colour-pass estimates)

| Hero | Grade / remaining limit | Triangles before → after | Colour draws |
|---|---|---:|---:|
| barbell | A form; B same-prototype photo evidence | 35,096 → 22,376 | 1 → 1 |
| dumbbell | A form; B same-prototype photo evidence | 22,784 → 14,240 | 1 → 1 |
| bench, per authored incline | A form; attached carry handle | 28,012 → 26,800 | 1 → 1 |
| rack | A form/contact; B photo correspondence | 21,780 → 19,268 | 1 → 1 |
| cable tower | A connected frame/stack | 64,252 → 58,444 | 1 → 1 |
| output sheave | A groove/guard geometry | 5,240 → 4,088 | 1 → 1 |
| pulldown assembly | A component/attachment form; B exact four-angle prototype evidence | 1,368 old frame → 94,732 complete kit | about 4 + cable |
| fascia band | A narrow smooth pubis-to-xiphoid band | 2,324 → 2,324 | 1 → 1 |
| native skin hands (pair) | B fine knuckle/crease detail | 19,284 → about 19,346 | 2 → 2 |
| grip hands | B accepted wrist seam, retained | 18,000 → 18,000 | 2 → 2 |

### Explicit shared-file boundary

**Three acceptance fixes are verified candidates and remain unapplied here** because their required files are outside this round's ownership: highlight selection in GltfSource/PartNode, bench and close-grip exercise motion JSON, and the shared bodyGeometry buffer-lifetime fix. Gallery alpha masks also require a shared manifest update. Apply only `scripts/anatomy/round2-acceptance.patch` in the main session; its constituent patches are included for inspection, not additional application. No claim is made that the live worktree has these fixes.

The combined patch selects exact skinned masks during exercise, uses the engine blend flag for vertex-alpha borders without shader churn, treats the masks as open surfaces in cutaway, suppresses contraction scaling, resets old animation/material state, and clones interleaved buffers using Three's shared-data map. Cause of INVALID_OPERATION: a derived hand-clipped/edge geometry shared GL buffer attributes with the still-live body; disposing that derived geometry deleted buffers from another geometry's VAO. Real decoded core/legs interleaved-buffer regression tests verify independent lifetime after the patch. **GPU warning elimination remains unverified**, since browser access is forbidden.

Bench candidates solve both asymmetric arms in the actual −93.3018° supported root, with straight start arms over shoulders, lower-sternum contact, vertical bottom forearms and constant grip. The source-aware gate checks both arms and 101 stroke samples; `--actual` intentionally fails old live shared data and passes after applying the patch in the isolated snapshot. References: [standard start](https://commons.wikimedia.org/wiki/File:Bench_press_1.svg), [standard bottom](https://commons.wikimedia.org/wiki/File:Bench_press_2.svg), [close-grip start](https://commons.wikimedia.org/wiki/File:Close_grip_barbell_bench_press_1.svg), [close-grip bottom](https://commons.wikimedia.org/wiki/File:Close_grip_barbell_bench_press_2.svg), Everkinetic, CC BY-SA 3.0. Candidate technique **A**; exact-angle evidence **B**.

### Two looks, studio and illustration audit

The offline renderer checks executing Lighting.tsx intensities, exposure, environment and installed R3F ACES/sRGB bindings; it reuses the fossils numerical GGX/RoomEnvironment rig. Materials use engine technical-plate tokens. CPU texture derivatives, shadows, AA and PMREM filtering are approximations; no GPU/FPS claim.

1. Anatomy look1 exposed softened rectus intersections and serrated intercostal/pectoral margins. Restored full core rectus and feature-weighted boundary budgets; look2 confirmed distinct transverse grooves and cleaner margins. Neutral-body looks rejected blocky fitted shorts and a small central remnant. Replaced them with the continuous implicit cap; the second cap look removes the remnant in standing/profile/supine.
2. Exact mask/pose review exposed overlapping coplanar highlights. Resolved nearest-source face ownership and disconnected crumbs; masks keep identical body vertices/weights. Pulldown look1 showed a cantilever gap and missing free cable, corrected in look2. Bench support look1 omitted real wrist links and hid sternum contact behind a plate; look2 includes links and a clear contact camera. Subsequent profile review exposed the detached carry handle; added its crossmember.
3. Covers: rejected tiny full-body r18 → region-filling studio r22 → graphite r23. Reopened exact final 2× detail and 420px paper/cinema sheets. All six per-topic docs/69 checks pass: region dominates; head/neck outline only with no face; no exposed/spine-like bones; smooth below-xiphoid pale alba; no offset halo/frayed free flaps; neutral graphite/transparent margins/readable inversion. Cover **A presentation / B exact-source fidelity**, because the graphite transfer interprets some fine fibre boundaries.
4. Exercise sketches: lighter house hatching, faceless heads and clean arrows. Bench r1–r4 iterations moved the bottom shaft onto the lower chest and kept the near plate clear of the chin; heel-walk and hip-adduction final pixels inspected. **A teaching relationships / B exact figure correspondence**; image transfer is not a verified 3D projection.

Comparison views are front, three-quarter, profile and characteristic detail. Most anatomical plates and machine photos differ in angle/dissection; captions disclose that difference. **Exact four-angle same-object photographic acceptance is not complete**; this is a concrete evidence limit rather than an A claim.

### Performance and gates

Topic GLB **1,446,512 → 1,341,536 bytes**; declared node triangles **149,174 → 159,064**; stored node/material draws **66 → 110**. These conservative sums include mutually exclusive anatomy/exercise masks and wire/body nodes, not measured simultaneous draws. See `round2-final-metrics.json` for per-asset counts and screen upper bounds; every individual meshopt GLB remains ≤1,500,000 bytes and the conservative single-topic colour-pass sum is <350k. Shadows/transparency add passes.

Gym GLB: 1,047,684 → 1,312,116 bytes; new pulldown: 0 → 515,228 bytes; linea: inline JS → 10,608 bytes. Current topic SHA-256: `0016306e9e5e84db14edf59cd0ad10a62c454d8537086cfc20484623b2e7ecfe`. Current illustration metrics and hashes: `scripts/anatomy/rebuild-illustrations/round2-image-metrics.json`.

- live: {"status":"PASS","runs":5,"record":"scripts/anatomy/rebuild-evidence/gate-logs/round2/live-run.json"}
- patch: {"status":"PASS","runs":7,"record":"scripts/anatomy/rebuild-evidence/gate-logs/round2/patch-run.json"}

Snapshot gates use unchanged installed dependency versions with writable Astro/Vite caches because the provided node_modules points into a read-only sibling. Live-worktree and patch-applied runs are recorded separately. The M8 BENCH/DUMBBELL/RACK and motion-limits rack assertions were not edited. Browser e2e/shoot/--beats GPU acceptance was not run.

Comparison-sheet directory: **/Users/gavin/work/atlas-b2-r-muscles/scripts/anatomy/rebuild-evidence/comparison-sheets/round2**. This indexes native studio/neutral poses, apparatus, bench support and exact final illustration sheets.

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

### Per-mask triangle changes (all other native parts unchanged)

| Topic / source muscle node | skinFaces before → after |
|---|---:|
| core / external-oblique.l | 603 → 387 |
| core / external-oblique.r | 627 → 416 |
| core / internal-oblique.l | 21 → 18 |
| core / internal-oblique.r | 26 → 22 |
| core / rectus-abdominis.l | 23 → 233 |
| core / rectus-abdominis.r | 21 → 228 |
| core / multifidus-lumborum.l | 0 → 108 |
| core / multifidus-lumborum.r | 0 → 110 |
| core / quadratus-lumborum.l | 0 → 168 |
| core / quadratus-lumborum.r | 0 → 177 |
| back / longissimus-thoracis.r | 0 → 567 |
| back / rhomboid-major.l | 0 → 205 |
| back / rhomboid-major.r | 0 → 250 |
| back / teres-major.l | 0 → 126 |
| back / teres-major.r | 0 → 125 |
| chest / pectoralis-minor.l | 0 → 523 |
| chest / pectoralis-minor.r | 0 → 273 |
| legs / biceps-femoris-short.l | 0 → 219 |
| legs / biceps-femoris-short.r | 0 → 213 |
| legs / gluteus-minimus.l | 0 → 76 |
| legs / gluteus-minimus.r | 0 → 74 |
| shoulders / rhomboid-major.l | 0 → 204 |
| shoulders / rhomboid-major.r | 0 → 248 |
| shoulders / subscapularis.l | 0 → 405 |
| shoulders / subscapularis.r | 0 → 211 |
| shoulders / supraspinatus.l | 0 → 158 |
| shoulders / supraspinatus.r | 0 → 109 |
| shoulders / teres-major.l | 0 → 126 |
| shoulders / teres-major.r | 0 → 125 |
| shoulders / teres-minor.l | 0 → 135 |
| shoulders / teres-minor.r | 0 → 128 |

Final verification: both complete snapshots passed pnpm check, pnpm validate, all 280 test files, pnpm build, and the post-build JS-budget gate. The final authored-camera/opaque-tower delta additionally passed current TypeScript, all 10 muscles-specific tests, rebuild and post-build budget checks in both snapshots. The 26 final runtime/asset/test source hashes match both snapshots (round3/gates/final-inputs.json). Verifier-only Drei inlining and a two-worker limit are recorded in environment.json; no repository test assertions/configuration were changed.

Final fixture audit also restored the omitted back-mounted squat bar in the CPU fixture; the production bar path was already present. General mask fixtures retain native hand surfaces, while the dedicated bench fixture includes the actual grip-hand meshes and wrist links. Accepted runtime Hands geometry is unchanged.

## Rebuild 2026-11-05 — round 4, anatomy precision restoration (2026-11-09)

This supersedes the earlier claims of anatomy buffer identity. The round-two/three shipped anatomy used int8 normals and int8 fibre directions; those files were **not byte-identical to pre-rebuild main**. Baseline anatomy is the actual checked-in GLB at **994cdc76**, not an offline uncompressed precursor. The accepted exercise/kit baseline is **490d13bf**. No display text, labels, IDs, bilateral counts, chapters, beats, grips, equipment, poses or teaching numbers changed. PartNode's accepted `if (exerciseMask) pm.material.normalScale.set(0, 0)` remains intact.

### Changes and self-grades

- **A — complete original close-up meshes:** rectus-femoris.l, rectus-femoris.r. Restored every original vertex attribute (including int16 NORMAL and float32 _FIBRE/_U/UV), indices, original inverse-bind matrices and joint associations. Every attribute and bind buffer is verified by SHA-256 against the original decoded baseline. Meshopt cyclically rotates some index triplets; orientation/topology are identical. No claim of identical raw compressed GLB bytes is made.
- **A — remaining anatomy precision:** retained the accepted topology and restored NORMAL and _FIBRE from native source vertices, resolving coincident seams with source UV/U/fibre data. Normals use a 16-bit octahedral meshopt filter; fibre uses normalized int16, retaining the source's binary 1/4096 lattice (the original chest fields use full-range int16). No anatomy NORMAL or _FIBRE accessor is int8. Complete original buffers are guaranteed only for the named close-up meshes, not every anatomical part.
- **A — exercise-mask boundary:** an eight-pass skin-adjacency field supplies continuous per-vertex alpha, with zero-alpha support outside the edge and small disconnected islands removed. It interpolates inside triangles. Obliques still exclude the rectus-owned faces, all labelled deep masks remain nonempty, and POSITION/NORMAL/JOINTS/WEIGHTS and the skeleton are shared with the actual body. The executing PartNode already blends these masks and applies depth bias. Untinted masks remain hidden.
- **A — elbow weights:** 1080 skin vertices considered for correction. The flexion bone carries the elbow; pronation weight starts distally and spreads toward the wrist, instead of twisting through the upper-arm/elbow blend. Weights stay normalized and the wrist/hand transforms remain intact. A decoded-GLB regression test poses the real rig at 90° pronation and checks the near-elbow radius stays at least 98% of rest. No animation keys or rig DOFs changed.
- Removed unused exercise-mask UVs (their normalScale is zero). Moved build-only sourceNodes strings to `scripts/anatomy/round4/provenance-legs.json`; licensing remains embedded. Float prediction is kept only when an actual decode proves bit-for-bit equality. No version-1 codec is used: the test decodes with the engine's bundled meshopt decoder.

### References

- https://commons.wikimedia.org/wiki/File:Gray430.png — Gray/Carter historical anatomical drawing, public domain; anatomy and attachment detail.
- https://commons.wikimedia.org/wiki/File:Gray434.png — Gray/Carter historical anatomical drawing, public domain; anatomy and attachment detail.
- https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles.jpg — OpenStax, CC BY 4.0; anterior/posterior proportions.

References are development drawings, not runtime textures. Existing downloaded plates are reused. **B, reference-angle evidence only:** these are related anatomical dissections, not four photographs of this exact individual/specimen. No claim of photo-perfect four-angle registration is made; the exact same-angle regression reference is main's original GLB. This limitation does not limit the buffer/renderer equality result.

### Three inspected looks

1. Opened look1 front/detail rectus and exercise sheets, chest front and shoulder detail. Rectus was already identical; the chest framing clipped its lateral margin and the shoulder detail looked between the two sides. Corrected camera span to account for width and aimed detail at the left muscle. Increased the mask diffusion from four to eight passes after seeing residual angular edges.
2. Opened look2 core/chest/arms/legs/shoulder sheets. Original precision alone left visible differences from earlier simplification, especially in deltoid folds. Restored complete original buffers/topology for all six named close-up subjects instead. To remain under the cap, moved savings to exercise UVs, exercise-body sampling and build-only metadata, not those muscles.
3. Opened final detail sheets for all six subjects and elbow comparisons. All **24** final front/three-quarter/profile/detail main comparisons have **zero changed channels, zero maximum error and zero MAE**, under the engine studio/ACES numerical renderer. Each topic's result: [{"view":"front","mae":0,"max":0},{"view":"three-quarter","mae":0,"max":0},{"view":"profile","mae":0,"max":0},{"view":"detail","mae":0,"max":0}]. Characteristic folds/intersections match main. The elbow sheet preserves the joint volume through flexion/pronation, rather than forming the old local waist.

Renderer: reuses `scripts/anatomy/round3/studio.ts`, with optional file selection and unchanged defaults. It verifies the executing Lighting.tsx rig/exposure/environment bindings and installed R3F ACES/sRGB defaults. GGX/RoomEnvironment CPU rasterization approximates shader derivatives, AA, shadows and muscle micrograin. Thus the additional exact original shader-input/bind-buffer hashes are essential. No Chromium, user browser or desktop was opened; GPU acceptance remains with the main session. Evidence images are outside the repository at **/private/tmp/atlas-muscles-round4-comparisons/**.

### Storage, topology and draws

Topic GLB: **1,350,972 → 1,497,508 bytes**, below 1,500,000. Declared-node triangles **159,646 → 177,356**; estimated colour draws **114 → 114**. These sums include mutually exclusive anatomy, masks, body and wire nodes, not measured simultaneous GPU draws. The conservative maximum topic-node sum is 182,426; adding the 94,732-triangle pulldown and two 9,000-triangle grip hands gives **295,158**, below 350k even while counting hidden topic nodes. Equipment GLBs and their counts/bytes are unchanged. Actual shadow/transparency passes are additional; no FPS claim.

| Anatomical node | Triangles before → after | Change / self-grade |
|---|---:|---|
| adductor-brevis.l | 530 → 530 | Accepted topology retained; original-precision normals/fibres restored; A |
| adductor-brevis.r | 530 → 530 | Accepted topology retained; original-precision normals/fibres restored; A |
| adductor-longus.l | 926 → 926 | Accepted topology retained; original-precision normals/fibres restored; A |
| adductor-longus.r | 926 → 926 | Accepted topology retained; original-precision normals/fibres restored; A |
| adductor-magnus.l | 1,026 → 1,026 | Accepted topology retained; original-precision normals/fibres restored; A |
| adductor-magnus.r | 1,038 → 1,038 | Accepted topology retained; original-precision normals/fibres restored; A |
| biceps-femoris-long.l | 1,714 → 1,714 | Accepted topology retained; original-precision normals/fibres restored; A |
| biceps-femoris-long.r | 1,712 → 1,712 | Accepted topology retained; original-precision normals/fibres restored; A |
| biceps-femoris-short.l | 618 → 618 | Accepted topology retained; original-precision normals/fibres restored; A |
| biceps-femoris-short.r | 618 → 618 | Accepted topology retained; original-precision normals/fibres restored; A |
| femur.l | 1,138 → 1,138 | Accepted topology retained; original-precision normals/fibres restored; A |
| femur.r | 1,138 → 1,138 | Accepted topology retained; original-precision normals/fibres restored; A |
| fibularis-longus.l | 386 → 386 | Accepted topology retained; original-precision normals/fibres restored; A |
| fibularis-longus.r | 370 → 370 | Accepted topology retained; original-precision normals/fibres restored; A |
| foot.l | 2,062 → 2,062 | Accepted topology retained; original-precision normals/fibres restored; A |
| foot.r | 2,064 → 2,064 | Accepted topology retained; original-precision normals/fibres restored; A |
| gastrocnemius-lateral.l | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| gastrocnemius-lateral.r | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| gastrocnemius-medial.l | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| gastrocnemius-medial.r | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| gluteus-maximus.l | 1,136 → 1,136 | Accepted topology retained; original-precision normals/fibres restored; A |
| gluteus-maximus.r | 1,064 → 1,064 | Accepted topology retained; original-precision normals/fibres restored; A |
| gluteus-medius.l | 996 → 996 | Accepted topology retained; original-precision normals/fibres restored; A |
| gluteus-medius.r | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| gluteus-minimus.l | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| gluteus-minimus.r | 994 → 994 | Accepted topology retained; original-precision normals/fibres restored; A |
| gracilis.l | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| gracilis.r | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| iliacus.l | 564 → 564 | Accepted topology retained; original-precision normals/fibres restored; A |
| iliacus.r | 554 → 554 | Accepted topology retained; original-precision normals/fibres restored; A |
| iliotibial-tract.l | 996 → 996 | Accepted topology retained; original-precision normals/fibres restored; A |
| iliotibial-tract.r | 996 → 996 | Accepted topology retained; original-precision normals/fibres restored; A |
| lower-leg.l | 880 → 880 | Accepted topology retained; original-precision normals/fibres restored; A |
| lower-leg.r | 880 → 880 | Accepted topology retained; original-precision normals/fibres restored; A |
| lumbar-spine | 2,488 → 2,488 | Accepted topology retained; original-precision normals/fibres restored; A |
| patella.l | 276 → 276 | Accepted topology retained; original-precision normals/fibres restored; A |
| patella.r | 276 → 276 | Accepted topology retained; original-precision normals/fibres restored; A |
| pectineus.l | 488 → 488 | Accepted topology retained; original-precision normals/fibres restored; A |
| pectineus.r | 488 → 488 | Accepted topology retained; original-precision normals/fibres restored; A |
| pelvis | 3,212 → 3,212 | Accepted topology retained; original-precision normals/fibres restored; A |
| psoas-major.l | 954 → 954 | Accepted topology retained; original-precision normals/fibres restored; A |
| psoas-major.r | 964 → 964 | Accepted topology retained; original-precision normals/fibres restored; A |
| rectus-femoris.l | 1,400 → 5,610 | Complete original main attributes/topology/bind; A |
| rectus-femoris.r | 1,136 → 3,992 | Complete original main attributes/topology/bind; A |
| sartorius.l | 996 → 996 | Accepted topology retained; original-precision normals/fibres restored; A |
| sartorius.r | 1,226 → 1,226 | Accepted topology retained; original-precision normals/fibres restored; A |
| semimembranosus.l | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| semimembranosus.r | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| semitendinosus.l | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| semitendinosus.r | 998 → 998 | Accepted topology retained; original-precision normals/fibres restored; A |
| soleus.l | 1,604 → 1,604 | Accepted topology retained; original-precision normals/fibres restored; A |
| soleus.r | 1,612 → 1,612 | Accepted topology retained; original-precision normals/fibres restored; A |
| tensor-fasciae-latae.l | 464 → 464 | Accepted topology retained; original-precision normals/fibres restored; A |
| tensor-fasciae-latae.r | 464 → 464 | Accepted topology retained; original-precision normals/fibres restored; A |
| tibialis-anterior.l | 876 → 876 | Accepted topology retained; original-precision normals/fibres restored; A |
| tibialis-anterior.r | 876 → 876 | Accepted topology retained; original-precision normals/fibres restored; A |
| vastus-intermedius.l | 996 → 996 | Accepted topology retained; original-precision normals/fibres restored; A |
| vastus-intermedius.r | 996 → 996 | Accepted topology retained; original-precision normals/fibres restored; A |
| vastus-lateralis.l | 1,582 → 1,582 | Accepted topology retained; original-precision normals/fibres restored; A |
| vastus-lateralis.r | 1,588 → 1,588 | Accepted topology retained; original-precision normals/fibres restored; A |
| vastus-medialis.l | 1,138 → 1,138 | Accepted topology retained; original-precision normals/fibres restored; A |
| vastus-medialis.r | 1,148 → 1,148 | Accepted topology retained; original-precision normals/fibres restored; A |

### Verification and outstanding scope

`tests/muscles-round4.test.ts` verifies the actual shipped GLBs, original hero hashes, engine decoder compatibility, cap, mask/body attribute sharing, feather weights, actual pronation deformation and the retained PartNode normalScale opt-out. Existing round-three mask, runtime-motion, equipment, skin/nail and topic tests remain active. Gate results/logs: `scripts/anatomy/round4/gates/results.json` (writable exact-source verification snapshot because this worktree's node_modules symlink points outside the allowed write roots). No tests are skipped or weakened; the verifier uses the same installed dependency versions. Final gates: pnpm check, pnpm validate, pnpm test and pnpm build all exit 0; 312 test files / 6,791 tests pass. The post-build JS budget check also passes. See the final gate JSON for exit codes.

Outstanding: GPU acceptance (explicitly reserved for Claude); exact specimen/photo angle evidence described above. No requested code/asset change remains as an unapplied shared-engine patch. No git writes, evidence-image commits or display-text edits.

## Acceptance fix (GPU, 2026-11-09): main's anatomy restored in full

GPU acceptance found that the six hero meshes matched main but the surrounding meshes did not. The obliques that cover the rectus, the trapezius, the intercostals and the rest were still decimated, and the close-ups differed from main with every part visible. `scripts/anatomy/round4/restore.mjs` now carries main's buffers (topology, normals, `_FIBRE`, UVs, binds) for every anatomy mesh. `tests/muscles-round4.test.ts` checks each node against `scripts/anatomy/round4/anatomy-digests.json`.

**Size exception.** These six GLBs are exempt from the 1.5 MB model cap, as heart-and-lungs is. Each must stay within main's own file size, which all six do: core 3,275,612, back 3,443,044, chest 3,336,744, arms 2,874,324, legs 3,682,876 and shoulders 1,975,152 bytes. The 1.5 MB, cap and hero-only statements in the round-4 sections above are superseded by this note. `skin-wire` and the hands were left as they are because no GLB exceeds main's size.
