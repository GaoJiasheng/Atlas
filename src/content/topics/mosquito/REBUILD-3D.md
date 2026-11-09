# Mosquito — 3D rebuild record

## Rebuild 2026-11-05

Implemented and reviewed offline on 2026-11-09. Scope: docs/68 B-grade insect
appendages and wings, plus a consistency sweep. No engine, existing shared kit,
HUD, runtime framing, package, lockfile or other-topic changes. No browser,
desktop, Git writes or runtime network requests.

### Reference photographs and drawings

- **M1** — James Gathany / CDC PHIL 9258; US public domain. [https://commons.wikimedia.org/wiki/File:Aedes_aegypti_CDC-Gathany.jpg](https://commons.wikimedia.org/wiki/File:Aedes_aegypti_CDC-Gathany.jpg) Female front-oblique silhouette, banded legs and attachment points.
- **M2** — CDC, Aedes aegypti mosquito2; US public domain. [https://commons.wikimedia.org/wiki/File:Aedes_aegypti_mosquito2.jpg](https://commons.wikimedia.org/wiki/File:Aedes_aegypti_mosquito2.jpg) Side-oblique silhouette and white basal leg bands; horizontally flipped in final profile sheet.
- **M3** — Louise, Vidal & Suesdek (2015), Figure 2A; CC BY. [https://doi.org/10.1371/journal.pone.0137851.g002](https://doi.org/10.1371/journal.pone.0137851.g002) Dissected female wing in plan: radial/medial forks, cross-veins, scale-bearing veins and fringe.

Photos are development references, not albedo textures. `refs/manifest.json`
records the downloaded files. Comparison crops/rotations are visual study
copies under the photograph's stated licence, with the source URL on each sheet.
The GLB is original procedural geometry with no third-party mesh or image data.

### Iteration evidence: look → change → look

`before/`, `round1/`, `round2/`, `round3/` and `final/` live in
`/Users/gavin/work/atlas-q-insects/scripts/geo/mosquito/comparisons/`.

1. Looked at the initial wing, foot and whole-adult sheets. The wing could be
   read against ivory, but white band overlays intersected the dark tarsomeres,
   and aggressive simplification created large highlights on the leg shafts.
   Removed the separate white sleeves: pigment is now on the same profiled
   segment surface. Added normal/colour-aware simplification.
2. Looked at the next sheets against the dissected-wing micrograph. Corrected
   the venation from the initial generic fork sketch to radial and medial
   branches with cross-veins, moved the fringe onto the trailing margin, and
   kept opaque scales/veins separate from membrane alpha in COLOR_0. Reframed
   the detail camera along the actual wing normal to obtain a plan comparison.
3. Looked at the final plan sheet, hook-claw close-up, profile, male and oblique
   adult views. Pulled the whole-adult preview cameras back to include the
   distal legs. The all-white hind fifth tarsomere and both terminal claws
   survive the final meshopt decode.

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
| `head-capsule` | A | 848 → 848 | Retained accepted geometry and teaching role; no rebuild. |
| `compound-eyes` | A | 1,152 → 1,152 | Retained accepted geometry and teaching role; no rebuild. |
| `antennae` | A | 2,336 → 2,336 | Retained accepted geometry and teaching role; no rebuild. |
| `palps` | A | 1,216 → 1,216 | Retained accepted geometry and teaching role; no rebuild. |
| `proboscis` | A | 840 → 840 | Retained accepted geometry and teaching role; no rebuild. |
| `stylets` | A | 1,296 → 1,296 | Retained accepted geometry and teaching role; no rebuild. |
| `thorax` | A | 4,576 → 4,576 | Retained accepted geometry and teaching role; no rebuild. |
| `fore-legs` | A | 3,136 → 7,784 | Separate profiled femur/tibia and five tarsomeres per leg, narrowed joints and paired hook claws; basal pigment follows the same surface. M1/M2. |
| `mid-legs` | A | 3,136 → 7,784 | Same five-segment tarsus and claws, preserving its distinct path and basal band distribution. M1/M2. |
| `hind-legs` | A | 4,736 → 7,782 | Five tarsomeres, four basal white bands and all-white fifth tarsomere, paired claws; all six leg origins preserved. M1/M2. |
| `wings` | A | 14,272 → 47,576 | Cambered translucent membrane, costal rim, twelve raised venation paths with radial/medial forks and cross-veins, lanceolate scales on veins, 99 nonuniform trailing hairs per wing. M1–M3. |
| `halteres` | A | 976 → 976 | Retained accepted geometry and teaching role; no rebuild. |
| `salivary-glands` | A | 2,640 → 2,640 | Retained accepted geometry and teaching role; no rebuild. |
| `abdomen` | A | 23,136 → 23,136 | Retained accepted geometry and teaching role; no rebuild. |
| `midgut` | A | 1,248 → 1,248 | Retained accepted geometry and teaching role; no rebuild. |
| `ovaries` | A | 1,792 → 1,792 | Retained accepted geometry and teaching role; no rebuild. |
| `male-body` | A | 27,072 → 30,160 | Existing head, eyes, thorax, lyre, abdomen and body marks baked from their original geometry; replaced the six continuous leg sweeps and band sleeves with articulated feet and claws. Body geometry was retained; a common cuticular finish follows the merged mesh. M1/M2. |
| `male-antennae` | A | 18,560 → 18,560 | Retained accepted geometry and teaching role; no rebuild. |
| `male-palps` | A | 3,328 → 3,328 | Retained accepted geometry and teaching role; no rebuild. |
| `male-wings` | A | 14,272 → 47,570 | The same venation/scale/fringe construction at the existing male scale and resting orientation. M1–M3; fine male venation inferred from the female reference, as already taught. |
| `dish` | A | 2,304 → 2,304 | Retained accepted geometry and teaching role; no rebuild. |
| `dish-water` | A | 4,480 → 4,480 | Retained accepted geometry and teaching role; no rebuild. |
| `eggs` | A | 2,400 → 2,400 | Retained accepted geometry and teaching role; no rebuild. |
| `larva-l1` | A | 7,856 → 7,856 | Retained accepted geometry and teaching role; no rebuild. |
| `larva-l2` | A | 7,856 → 7,856 | Retained accepted geometry and teaching role; no rebuild. |
| `larva-l3` | A | 7,856 → 7,856 | Retained accepted geometry and teaching role; no rebuild. |
| `larva-l4` | A | 7,856 → 7,856 | Retained accepted geometry and teaching role; no rebuild. |
| `moult-skins` | A | 2,832 → 2,832 | Retained accepted geometry and teaching role; no rebuild. |
| `pupa` | A | 2,512 → 2,512 | Retained accepted geometry and teaching role; no rebuild. |
| `developing-adult` | A | 3,064 → 3,064 | Retained accepted geometry and teaching role; no rebuild. |
| `pupal-case` | A | 5,520 → 5,520 | Retained accepted geometry and teaching role; no rebuild. |
| `emerging-adult` | A | 20,504 → 20,504 | Retained accepted geometry and teaching role; no rebuild. |
| `escaped-adults` | A | 41,008 → 41,008 | Retained accepted geometry and teaching role; no rebuild. |
| `flower-pot` | A | 13,184 → 13,184 | Retained accepted geometry and teaching role; no rebuild. |
| `soil-hardened` | A | 592 → 592 | Retained accepted geometry and teaching role; no rebuild. |
| `soil-loosened` | A | 384 → 384 | Retained accepted geometry and teaching role; no rebuild. |
| `pot-plate` | A | 480 → 480 | Retained accepted geometry and teaching role; no rebuild. |
| `plate-water` | A | 288 → 288 | Retained accepted geometry and teaching role; no rebuild. |
| `pail` | A | 4,656 → 4,656 | Retained accepted geometry and teaching role; no rebuild. |
| `pail-water` | A | 240 → 240 | Retained accepted geometry and teaching role; no rebuild. |
| `vase` | A | 10,264 → 10,264 | Retained accepted geometry and teaching role; no rebuild. |
| `vase-water` | A | 256 → 256 | Retained accepted geometry and teaching role; no rebuild. |
| `roof-gutter` | A | 124 → 124 | Retained accepted geometry and teaching role; no rebuild. |
| `gutter-debris` | A | 13,440 → 13,440 | Retained accepted geometry and teaching role; no rebuild. |
| `gutter-water` | A | 12 → 12 | Retained accepted geometry and teaching role; no rebuild. |
| `bti-granules` | A | 3,136 → 3,136 | Retained accepted geometry and teaching role; no rebuild. |
| `follow-marker` | A | 3,456 → 3,456 | Retained accepted geometry and teaching role; no rebuild. |
| `dish-ruler` | A | 1,188 → 1,188 | Retained accepted geometry and teaching role; no rebuild. |
| `bench` | A | 588 → 588 | Retained accepted geometry and teaching role; no rebuild. |
| `home-floor` | A | 672 → 672 | Retained accepted geometry and teaching role; no rebuild. |
| `home-wall` | A | 1,176 → 1,176 | Retained accepted geometry and teaching role; no rebuild. |
| `home-plinth` | A | 588 → 588 | Retained accepted geometry and teaching role; no rebuild. |

### Performance

| Metric | Before | After |
|---|---:|---:|
| GLB bytes | 0 (procedural JSON) | 682,912 |
| Inventory triangles, every layer enabled | 301,340 | 383,372 |
| Inventory draw calls, estimate | 81 | 74 |
| Maximum authored chapter/beat triangles | 251,848 | 333,880 |
| Maximum authored chapter/beat calls, estimate | 58 | 51 |

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
