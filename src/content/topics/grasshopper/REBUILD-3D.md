# Grasshopper — 3D rebuild record

## Rebuild 2026-11-05

Implemented and reviewed offline on 2026-11-09. Scope: docs/68 B-grade insect
appendages and wings, plus a consistency sweep. No engine, existing shared kit,
HUD, runtime framing, package, lockfile or other-topic changes. No browser,
desktop, Git writes or runtime network requests.

### Reference photographs and drawings

- **G1** — Lucius Winslow, adult female in Singapore; CC BY-SA 4.0. [https://commons.wikimedia.org/wiki/File:Female_Javanese_Grasshopper.png](https://commons.wikimedia.org/wiki/File:Female_Javanese_Grasshopper.png) Adult silhouette, head/eye placement, walking feet.
- **G2** — Hqwebsite, Valanga nigricornis nymph; CC BY-SA 3.0. [https://commons.wikimedia.org/wiki/File:Valanga_nigricornis.jpg](https://commons.wikimedia.org/wiki/File:Valanga_nigricornis.jpg) Wingless instar, proportion of antenna to body.
- **G3** — Dustin VanOverbeke, V. n. rammei; CC BY 4.0. [https://commons.wikimedia.org/wiki/File:Valanga_nigricornis_rammei_207842820.jpg](https://commons.wikimedia.org/wiki/File:Valanga_nigricornis_rammei_207842820.jpg) Antenna annuli, herringbone femur, twin tibial spine rows, distal foot.

Photos are development references, not albedo textures. `refs/manifest.json`
records the downloaded files. Comparison crops/rotations are visual study
copies under the photograph's stated licence, with the source URL on each sheet.
The GLB is original procedural geometry with no third-party mesh or image data.

### Iteration evidence: look → change → look

`before/`, `round1/`, `round2/`, `round3/` and `final/` live in
`/Users/gavin/work/atlas-q-insects/scripts/geo/grasshopper/comparisons/`.

1. Looked at the initial profile, tibial, foot, antenna and growth sheets. The
   pads had been flattened by position-only simplification, antenna joints were
   too deeply necked, and some femoral ribs did not follow the changing radius.
   Changed to smoothly rounded pad profiles, normal-aware mesh simplification,
   shallower annular collars and interpolated rib support.
2. Looked at the second set of close-ups. Reduced the bead-like antenna profile,
   kept the tarsal pad silhouettes smooth, corrected tibial reference crops,
   and checked both rows of attached spines. The growth tray exceeded the
   concurrent budget when the adult was also visible; reduced only the small
   specimens' radial/longitudinal samples. Instar antenna counts now progress
   from 16 to 26 rather than repeating one count.
3. Looked at the final detail and hero renders. Interpolated the head vault and
   increased thorax sampling to remove coarse surface facets while retaining
   their accepted silhouettes. The final feet retain three tarsomeres, the
   ventral pads, a central arolium and two hooks, with no sleeve intersections.

The studio preview decodes the shipped compressed GLB and uses the engine's
material resolver, bilateral expansion and primitive geometry. It reuses
`fossils-and-skeletons/studio-cpu.ts`: current paper/cinema hemisphere,
key/fill/rim, sampled installed RoomEnvironment, exposure 1.05/1.0, linear PBR,
and the installed ACES matrices. Surface opt-in, vertex pigment and vertex
alpha are read from the actual GLB. It is a numerical CPU study; procedural
micro-normal maps, GPU shadows and transparency ordering are acceptance limits.

### Self-grades and per-part counts

A = credible under docs/68's shape criteria; these are author self-grades,
not GPU acceptance. Counts include a bilateral twin where the data declares
one. Existing schematic internal organs and reference props retain their
accepted teaching role. Every original part is listed to make the sweep auditable.

| Part | Self-grade | Triangles before → after | Change / reference |
|---|---|---:|---|
| `head-capsule` | A | 2,676 → 9,220 | Consistency only: interpolated outer and inner vault profiles, 64 radial segments; original shell opening, outline and frontal costa retained. G1/G3. |
| `compound-eyes` | A | 5,952 → 5,952 | Retained accepted geometry and teaching role; no rebuild. |
| `ocelli` | A | 1,584 → 1,584 | Retained accepted geometry and teaching role; no rebuild. |
| `antennae` | A | 9,536 → 14,728 | 27 tapered annulated segments per adult antenna, narrow flexible collars; separate opposite-side node with slight unequal growth. G1/G3. |
| `labrum` | A | 532 → 532 | Retained accepted geometry and teaching role; no rebuild. |
| `mandibles` | A | 340 → 340 | Retained accepted geometry and teaching role; no rebuild. |
| `maxillae` | A | 2,088 → 2,088 | Retained accepted geometry and teaching role; no rebuild. |
| `labium` | A | 1,532 → 1,532 | Retained accepted geometry and teaching role; no rebuild. |
| `pronotum` | A | 9,776 → 9,776 | Retained accepted geometry and teaching role; no rebuild. |
| `prosternal-spine` | A | 640 → 640 | Retained accepted geometry and teaching role; no rebuild. |
| `pterothorax` | A | 2,160 → 6,288 | Consistency only: increased longitudinal/radial sampling of the accepted hollow thoracic shape; attachment centres unchanged. G1. |
| `abdomen-tergites` | A | 16,952 → 16,952 | Retained accepted geometry and teaching role; no rebuild. |
| `abdomen-sternites` | A | 16,424 → 16,424 | Retained accepted geometry and teaching role; no rebuild. |
| `tympanum` | A | 1,056 → 1,056 | Retained accepted geometry and teaching role; no rebuild. |
| `cerci` | A | 1,280 → 1,280 | Retained accepted geometry and teaching role; no rebuild. |
| `ovipositor` | A | 560 → 560 | Retained accepted geometry and teaching role; no rebuild. |
| `fore-legs` | A | 9,600 → 12,026 | Profiled coxa/femur/tibia, three hinged tarsomeres, three ventral pads, pretarsal arolium and two recurved claws; sparse sensory setae. G1/G3. |
| `mid-legs` | A | 9,344 → 11,540 | Same three-segment foot topology with its own existing leg proportions and joint centres. G1/G3. |
| `hind-femora` | A | 5,696 → 8,530 | Accepted muscle-containing femur silhouette retained; shallow herringbone relief follows interpolated lateral cuticle. G3. |
| `semilunar-processes` | A | 432 → 432 | Retained accepted geometry and teaching role; no rebuild. |
| `hind-tibiae` | A | 9,632 → 22,000 | Rounded tapering tibia, two staggered rows of ten individually rooted curved spines, four apical spurs; three-segment foot, pads, arolium and paired claws. G1/G3. Spine counts are reconstruction choices within the review's 9–10 range, not a new species-wide teaching number. |
| `tegmina` | A | 13,184 → 13,184 | Retained accepted geometry and teaching role; no rebuild. |
| `hindwings` | A | 25,280 → 25,280 | Retained accepted geometry and teaching role; no rebuild. |
| `salivary-glands` | A | 9,024 → 9,024 | Retained accepted geometry and teaching role; no rebuild. |
| `pharynx-oesophagus` | A | 832 → 832 | Retained accepted geometry and teaching role; no rebuild. |
| `crop` | A | 1,008 → 1,008 | Retained accepted geometry and teaching role; no rebuild. |
| `proventriculus` | A | 1,728 → 1,728 | Retained accepted geometry and teaching role; no rebuild. |
| `gastric-caeca` | A | 5,760 → 5,760 | Retained accepted geometry and teaching role; no rebuild. |
| `midgut` | A | 6,240 → 6,240 | Retained accepted geometry and teaching role; no rebuild. |
| `malpighian-tubules` | A | 39,024 → 39,024 | Retained accepted geometry and teaching role; no rebuild. |
| `hindgut` | A | 1,024 → 1,024 | Retained accepted geometry and teaching role; no rebuild. |
| `rectum` | A | 6,312 → 6,312 | Retained accepted geometry and teaching role; no rebuild. |
| `brain` | A | 2,976 → 2,976 | Retained accepted geometry and teaching role; no rebuild. |
| `suboesophageal-ganglion` | A | 1,264 → 1,264 | Retained accepted geometry and teaching role; no rebuild. |
| `thoracic-ganglia` | A | 1,584 → 1,584 | Retained accepted geometry and teaching role; no rebuild. |
| `abdominal-ganglia` | A | 2,640 → 2,640 | Retained accepted geometry and teaching role; no rebuild. |
| `nerve-cord` | A | 4,096 → 4,096 | Retained accepted geometry and teaching role; no rebuild. |
| `leg-nerves` | A | 3,456 → 3,456 | Retained accepted geometry and teaching role; no rebuild. |
| `tympanal-organ` | A | 2,144 → 2,144 | Retained accepted geometry and teaching role; no rebuild. |
| `spiracles` | A | 5,760 → 5,760 | Retained accepted geometry and teaching role; no rebuild. |
| `tracheal-trunks` | A | 29,128 → 29,128 | Retained accepted geometry and teaching role; no rebuild. |
| `air-sacs` | A | 6,336 → 6,336 | Retained accepted geometry and teaching role; no rebuild. |
| `dorsal-vessel` | A | 2,580 → 2,580 | Retained accepted geometry and teaching role; no rebuild. |
| `extensor-tibiae` | A | 3,680 → 3,680 | Retained accepted geometry and teaching role; no rebuild. |
| `flexor-tibiae` | A | 3,808 → 3,808 | Retained accepted geometry and teaching role; no rebuild. |
| `flight-muscles` | A | 6,080 → 6,080 | Retained accepted geometry and teaching role; no rebuild. |
| `ovaries` | A | 12,056 → 12,056 | Retained accepted geometry and teaching role; no rebuild. |
| `egg-pod` | A | 15,592 → 15,592 | Retained accepted geometry and teaching role; no rebuild. |
| `nymph-1` | A | 11,072 → 19,378 | Instar 1: retained body and wing-bud progression; rebuilt six jointed feet, tibial spine rows and segmented antennae (16 segments per antenna). Reduced subdivisions at tray scale, not the anatomical counts. G2/G3. |
| `nymph-2` | A | 12,096 → 19,762 | Instar 2: retained body and wing-bud progression; rebuilt six jointed feet, tibial spine rows and segmented antennae (18 segments per antenna). Reduced subdivisions at tray scale, not the anatomical counts. G2/G3. |
| `nymph-3` | A | 14,944 → 21,154 | Instar 3: retained body and wing-bud progression; rebuilt six jointed feet, tibial spine rows and segmented antennae (20 segments per antenna). Reduced subdivisions at tray scale, not the anatomical counts. G2/G3. |
| `nymph-4` | A | 16,608 → 21,482 | Instar 4: retained body and wing-bud progression; rebuilt six jointed feet, tibial spine rows and segmented antennae (22 segments per antenna). Reduced subdivisions at tray scale, not the anatomical counts. G2/G3. |
| `nymph-5` | A | 19,928 → 21,720 | Instar 5: retained body and wing-bud progression; rebuilt six jointed feet, tibial spine rows and segmented antennae (24 segments per antenna). Reduced subdivisions at tray scale, not the anatomical counts. G2/G3. |
| `nymph-6` | A | 24,320 → 22,090 | Instar 6: retained body and wing-bud progression; rebuilt six jointed feet, tibial spine rows and segmented antennae (26 segments per antenna). Reduced subdivisions at tray scale, not the anatomical counts. G2/G3. |
| `ruler` | A | 1,716 → 1,716 | Retained accepted geometry and teaching role; no rebuild. |
| `soil-section` | A | 588 → 588 | Retained accepted geometry and teaching role; no rebuild. |
| `hand-outline` | A | 170 → 170 | Retained accepted geometry and teaching role; no rebuild. |

### Performance

| Metric | Before | After |
|---|---:|---:|
| GLB bytes | 0 (procedural JSON) | 896,396 |
| Inventory triangles, every layer enabled | 421,830 | 480,958 |
| Inventory draw calls, estimate | 111 | 93 |
| Maximum authored chapter/beat triangles | 306,512 | 346,682 |
| Maximum authored chapter/beat calls, estimate | 94 | 82 |

The 350k budget is checked over every authored chapter/beat using the engine's
visibility resolver, including faint parts and context geometry. Manually
turning on every layer is represented separately by the inventory row and can
exceed 350k; no engine visibility restriction was added. Counts exclude shadow
passes, clipping caps and flow particles; no hardware FPS is claimed. The audit
and the actual decoded asset tests are in `audit-rebuild.mjs` and
`tests/space-scene/insects-rebuild.test.ts`.

### Behaviour and facts

Part ids/order/count, labels, EN/ZH summaries and details, connects, explode
vectors, poses, animations, flow routes, chapter and beat references, teaching
numbers and simulations are preserved. No text corrections were necessary.
The new mesh nodes use the existing selection, explode, clipping and pose paths;
grasshopper bilateral nodes are explicitly paired rather than adding new parts.
The accepted hindwing folding primitive and its fan mechanism are unchanged.

### Acceptance limits / not done

- **Matched straight-frontal photographic evidence remains incomplete.** Front
  render sheets exist, but their reference is an oblique photograph; it must
  not be represented as a same-angle frontal match. Extra Wikimedia downloads
  returned HTTP 403/429. Profile/oblique and diagnostic detail evidence is
  supplied, including the mosquito's plan micrograph comparison.
- Fine tarsal anatomy is reconstructed from the review's required topology and
  the available macros; the photos do not resolve every claw tip. This limits
  the strength of a museum close-up claim. Geometry self-grades above do not
  waive this evidence gap or certify overall topic A acceptance.
- The numerical preview cannot certify GPU finish, alpha sorting or interactive
  poses. Browser/GPU acceptance and e2e/shoot were deliberately not performed
  under this task's explicit prohibition. No engine patch was required.

Rebuild/review commands and the cache-isolated gate commands are recorded in
`scripts/geo/grasshopper/REBUILD.md`. Gate outcomes are recorded below. The initial stock check/test commands hit the shared read-only
node_modules cache; the wrappers redirect only transient caches. The first
unlimited-worker test attempt also timed out in an existing unrelated sculpt
suite under load; the final run uses two workers and a 60-second timeout.

### Final GPU-contract follow-up

A final look at the wing exposed an acceptance hazard: meshopt may reorder
transparent membrane triangles and opaque vein triangles within one draw.
The publisher now explicitly sorts the decoded candidate's membrane triangles
before its opaque relief after optimization. The preview follows the actual
index order and the source material's BLEND/no-depth-write contract, including
opaque vertex-alpha fragments; it no longer substitutes an opaque depth pass
for the veins. The focused test checks this order in the shipped compressed GLB.
Wing scales use the ink token with a matte 0.72 source roughness under the studio
rig. Female distal legs and the opposite wing have small deterministic
asymmetries, retaining their coxal/hinge attachment points. Existing primitive
vein hairlines are included in the baseline preview as the engine draws them.

### Gate outcomes — 2026-11-09

- Check: passed, Astro 0 errors / 0 warnings (existing informational hints),
  plus `tsc --noEmit` exit 0. The Astro command uses the topic-local cache
  wrapper; it otherwise inherits the root config.
- Validate: 94 topics, 0 errors / 0 warnings.
- Full tests: **277 files, 6,534 tests passed**, exit 0, no runner errors,
  using the documented cache wrapper, two workers and 60-second test timeout.
  The earlier concurrent run passed all assertions but exited with two
  `onTaskUpdate` RPC timeout errors; it was rerun cleanly after builds/checks
  completed. No test failures or runner errors were ignored.
- Final focused decoded-asset suite after the last wing/asymmetry changes:
  **6/6 passed**, including the actual GPU index-order and budget checks.
- Build: passed with the cache wrapper; 191 pages. Final public/dist GLB hashes
  are verified equal in the build consistency audit.
- GPU browser / e2e / shoot: not run, as explicitly prohibited by this task.

The joint, spine, segment and colour assertions read the actual asset. The
performance fixture is checked against decoded node triangle counts to prevent
stale audit files from certifying a different renderer input.

### GPU acceptance — 2026-11-09 (Claude)

Shot every beat in paper and cinema with `pnpm shoot grasshopper --beats --gpu`
(0 beat failures), plus GPU close-ups of the hind tibia, hind femur, fore and
hind feet, antenna and growth tray, against the main-branch build.

- `hind-femora`: the herringbone ridges were placed at a fixed z offset that
  sat inside the flattened elliptical section, so only seven short pale ticks
  surfaced mid-femur and read as painted arrows. Rebuilt them on the femur's
  own section: a median carina plus 21 chevron pairs running to the dorsal and
  ventral carinae, angled proximally as in G1, in the femur's own pigment so
  they read as relief. Grade A after the fix.
- `nymph-1` … `nymph-6`: antennae used the bulbous joint segment and read as a
  string of beads; they now use the same shallow-collar annulus as the adult.
- Every other rebuilt part (tibial spine rows, three-segment tarsi with pads,
  arolium and claws, adult antennae) confirmed A on the GPU.
- Out of scope, noted for a later pass: nymph compound eyes are lumpy clusters
  and the nymph bodies are plain lathes (accepted earlier, not rebuilt here).
- Performance with every layer switched on (480,958 triangles, 95 calls) holds
  60 fps at 3112×1904 (DPR 2) on Apple M5 Max under heavy host load; authored
  views stay under 350k (max 346,682). Accepted: the all-layer state is
  user-only and is not on any authored path.

## Rebuild 2026-11-05 — residual polish (implemented 2026-11-09)

Scope: only this batch's named residual parts. **Self-grade A** means credible form, attachments and relief for the existing teaching role under docs/68; it is an offline judgement, pending Claude's GPU acceptance. Earlier accepted limitations on unrelated parts are not regraded here. No browser/desktop, git writes, engine/shared-kit changes or display-text edits.

Rebuilt all six juvenile bodies: sloping prismatic frons/vertex/genae, a skin-following clypeal shield, smooth elongated compound-eye domes, seated sockets and the three shallow ocellar lenses of the accepted adult frontal triad, a flared pronotal saddle with integrated carinae and sulci, nine unequal overlapping abdominal tergites, two thoracic/eight abdominal pairs of seated spiracular valves, a tapered terminal segment and short cerci. Retained six articulated legs, three tarsomeres/pads/claws per foot, tibial spine rows, femoral relief projected onto the actual tapered elliptical cuticle and 16/18/20/22/24/26 antennal annuli. Two pairs of thin veined wing pads develop from stage III: pendent in III/IV, dorsal after the original twist in V/VI. Stage I/II remain wingless. The authored six size/placement envelopes, schematic size disclaimer and female instar-count teaching remain unchanged.

References actually downloaded and viewed (development only; no runtime photo textures or third-party meshes):

- [Valanga nigricornis.jpg](https://commons.wikimedia.org/wiki/File:Valanga_nigricornis.jpg) — Hqwebsite; CC BY-SA 3.0.
- [Javanese grasshopper (Valanga nigricornis) nymph.jpg](https://commons.wikimedia.org/wiki/File:Javanese_grasshopper_(Valanga_nigricornis)_nymph.jpg) — Charles J. Sharp; CC BY-SA 4.0.

Review iterations:

1. **Look 1 → change:** Smooth eyes removed the lumps, but the retained saddle still read as a barrel and late wing pads were undersized/buried. Enlarged the pads to the authored source lengths, seated them on the thorax and added the tapered terminal abdomen.
2. **Look 2 → change:** Replaced the retained pronotum with the carinate flared saddle, integrated the sulci, corrected top-face/pad winding, and used attribute-aware normal preservation. Ray-projected both eye perimeters onto the true head surface so the sockets cannot float. A subsequent macro look showed angular thorax highlights: tightened the actual normal-aware simplifier. Dedicated head crops then revealed unsupported facial filaments and head radii inferred from height: seated the carinae on the skin, restored each authored instar radius, shaped the frons/clypeus and checked the frontal ocellar triad. Femoral chevrons now follow the real section. Rechecked the growth beat budget.
3. **Final look:** inspected the final decoded asset in front, three-quarter, profile and detail views, plus cinema. Sheets: `/tmp/atlas-residual-polish-2026-11-05/final/grasshopper`. These are renders beside real photographic/histological references, not silhouettes. Photo crops/orientations are development comparisons; generic specimens and available oblique photographs are not a calibrated photogrammetric solve. A histological section has no photographed three-quarter view, so the same section references support the additional oblique model views. No unavailable camera angle is invented or claimed as a measured match.

| Part | Self-grade | Triangles before → after | Estimated model draws before → after |
|---|---|---:|---:|
| `nymph-1` | A, offline | 18,134 → 20,430 | 1 → 1 |
| `nymph-2` | A, offline | 18,404 → 20,804 | 1 → 1 |
| `nymph-3` | A, offline | 19,846 → 21,580 | 1 → 1 |
| `nymph-4` | A, offline | 20,260 → 22,026 | 1 → 1 |
| `nymph-5` | A, offline | 20,540 → 22,410 | 1 → 1 |
| `nymph-6` | A, offline | 20,742 → 22,088 | 1 → 1 |

Inventory: **480,958 → 492,370 triangles**; **93 → 93 draws**. Maximum authored chapter/beat: **346,682 → 346,682 triangles**, **82 → 82 draws**. GLB: **896,396 → 989,292 bytes**. Counts use the decoded renderer mesh, expanded bilateral parts, instance matrices and each-animation path. They exclude shadows, flows and labels; no GPU FPS is claimed. Inventory can include mutually hidden stations; the authored maxima remain below 350k.

Preservation audit: all IDs/order, names, labels, EN/ZH summaries/details, teaching numbers, groups, chapter/beat references, flows, animations, rig/pose pivots, sorting and explosion inputs are unchanged. **10 unrelated decoded meshes** retain identical attribute streams, world transforms and oriented triangle topology (meshopt may cyclically rotate a triangle's three indices). No retained specimen was simplified to pay for this work.

The offline preview reuses `fossils-and-skeletons/studio-cpu.ts`: engine studio directions, light colours/intensities, hemisphere, exposure, sampled Three RoomEnvironment, GGX and ACES. Rig/exposure values are checked against live `Lighting.tsx`. For the two finish-sensitive residuals, the actual engine-generated sand/pile pixels are exported by `living-things/export-finish-maps.ts`, with UV derivatives selecting trilinear mips. CPU numerical environment filtering and lack of GPU contact-shadow/anisotropic filtering are explicit limits; this is not GPU acceptance. Float64 depth avoids artificial z-fighting in thin-sheet/recess macro views.

Reproduce the targeted build without regenerating stale editorial text:

```sh
pnpm tsx scripts/geo/grasshopper/polish-nymphs.mjs
pnpm tsx scripts/geo/living-things/export-finish-maps.ts
pnpm tsx scripts/geo/plant/residual-review.mjs final grasshopper
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
