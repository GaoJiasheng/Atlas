# Atlas human muscle mesh pipeline

Offline native Blender pipeline for all six topics in `docs/16-muscles-content-spec.md` §5. Cached FBX inputs only; no downloads or application build/test/check commands. Generated files stay under `scripts/anatomy/` and `public/models/muscles-*.glb`.

Round 8 acceptance, hashes, axis tables and pose links: [report.md](report.md).

## Run

Requirements: Blender 5.1 on PATH, NumPy in both Blender and Python 3, Node ≥22, pnpm and the already installed tsx, glTF Transform and meshoptimizer dependencies. Pillow is used only for optional contact sheets.

```sh
python3 scripts/anatomy/run.py --topic back
```

Topics: `chest` (default), `back`, `shoulders`, `arms`, `legs`, `core`. Run the same command for each topic. The manifest must exist before building. Cached inventory is reused; `--refresh-inventory` scans the four local FBX systems again.

`manifests.py` expands docs §5.3 and the reviewed draft IDs/Z-Anatomy names into exact source selections, validating both sides against `cache/inventory.json`. It writes **each manifest immediately followed by that topic's `MANIFEST-READY`**, containing the manifest SHA-256, before starting any geometry work:

```sh
python3 scripts/anatomy/manifests.py
```

This publishes all six topics, each with the full-body joint declaration and required unexported skeleton references. Parent `.g` cards remain navigation groups rather than duplicate geometry. Optional thoracolumbar fascia, linea alba and diaphragm display parts are omitted. Lumbar multifidus is present and uses its actual left/right main meshes. Deep forearm and intrinsic hand/foot muscles are excluded by the v1 scope. Core erectors retain the full named iliocostalis-lumborum/longissimus-thoracis sources; a lumbar-only teaching crop remains [待核]. Neighbours are adjacent exercise secondary/stabiliser muscles, retaining their whole named source extents at low triangle targets.

Each native step can also run independently:

```sh
blender -b --python-exit-code 1 -P scripts/anatomy/build.py -- --topic back
pnpm exec node --import tsx scripts/anatomy/optimize.ts --topic back
python3 scripts/anatomy/audit.py --topic back
blender -b --python-exit-code 1 -P scripts/anatomy/preview.py -- --topic back
blender -b --python-exit-code 1 -P scripts/anatomy/report.py -- --topic back
python3 scripts/anatomy/audit.py --topic back --write-report
python3 scripts/anatomy/contact.py --topic back
```

`chest/preview.py` remains a compatibility entry point accepting `--topic`; `chest/pose.py` independently runs the chest pose check through the shared renderer. Inventory is a shared source scan rather than a per-topic artifact. `simplify.ts` takes explicit topic-prefixed input/output filenames from `build.py`. Historical fallback/probe scripts are retained for provenance and are not part of the native acceptance command.

## Artifacts

- `<topic>/manifest.json`, `rig.json`, `attachments.json`, `report.md`, `preview-review.md`.
- `cache/<topic>-raw.glb`, `cache/<topic>-audit.glb`, `<topic>-review.blend`.
- `cache/<topic>-{build,optimize,report,pose}-stats.json`, preview metadata, simplification jobs and logs.
- `cache/<topic>-preview-{front,back,left,exploded-by-layer,skin,pose}.png`, plus `pose-{front,back,left,anatomy}`; optional contact sheets.
- `public/models/muscles-<topic>.glb`.

The audit GLB is decoded from the actual compressed output, dequantized and stripped only of scalar custom attributes that Blender cannot import. The published GLB retains `_U`, `_FIBRE`, UVs, joints, normalized weights and required `EXT_meshopt_compression` / `KHR_mesh_quantization`.

The skin-weight gate runs between optimization and previews in `run.py`. To audit all published topics and append their share tables to existing reports without rebuilding:

```sh
python3 scripts/anatomy/audit.py --topic all --write-report
```

`decode_weights.ts` reads the **published compressed GLB**, resolves skin joint indices and normalized weights, and reports vertex-weight shares for every muscle node. `audit_fibres.py` checks the decoded `_U=0/1` endpoint clouds against native cached attachment reference surfaces. Missing weights at the joints adjacent to each manifest attachment bone, missing required rig joints, and >30% on joints outside the attachment parent path are failures. Connecting joints belong to both adjacent bones: shoulder borders scapula/humerus, elbow borders humerus/forearm and hip borders pelvis/femur. Intermediate joints are valid for long muscles. Audit results, endpoint checks, proximal/mid/distal share bins, per-mesh outlier counts (remaining and fixed), bytes, triangles and SHA-256 are saved in `cache/<topic>-weights-audit.json`; flags print to stdout and return exit status 1.

## Selection, frames and rigs

All source sides are real cached geometry. No mirroring, guessed muscle substitutes, marker helpers, hair, nails or section planes are exported. Moving bones are sided. Ribs, cartilage and sternum merge into `thorax`. Arms retain **separate radius and ulna**, with hand bones merged per side; legs merge tibia/fibula and foot bones per side. Pelvis merges both hip bones, sacrum and coccyx. Thoracic/lumbar/cervical columns remain named static meshes when relevant. `referenceParts` supplies actual unexported bones or connective surfaces needed to measure joints and attachments outside the display region.

Source coordinates are metres, Z up, anterior −Y, own left +X. Export is `(x,y,z) → (x,z,−y)`. Topic centres are near the selected anatomy: chest sternal angle, back spine, shoulders clavicle midline, arms humerus midline, legs pelvis, core lumbar spine. `rig.json` records source centre, `floorY`, stature and orientation evidence. Add `−floorY` to ground the whole-body shell. Build and decoded-output gates verify stature, floor and bilateral signs; no silent mirroring/rescaling is allowed.

Every topic has **19 joints**: trunk, and bilateral clavicle → scapula → shoulder → elbow → forearm → hand and hip → knee → ankle chains. Neck is optional and remains bound to trunk. Forearm inserts between elbow and hand: ulna remains rigid on elbow, radius/hand follow forearm pronation. Hip pivots come from acetabulum landmark cubes, checked against numerical femoral-head sphere fits. Knee centres are femoral epicondyle midpoints; ankles are medial/lateral malleolar midpoints. Upper joint centres use medial/lateral clavicle endpoints, glenoid/epicondyle landmarks, humeral-head sphere fits and wrist styloid midpoints. Hand metadata provides a **0.08 m grip offset** distal to its wrist pivot.

Each topic manifest explicitly declares the same `jointNames`, including exercise joints whose display bones are not exported. `handGripOffsetM` and each hand joint declare the **0.08 m** grip offset. `complete_manifest` validates attachment ownership and the full parent chains before geometry work. Missing or unknown limb owners fail. The native landmark paths in `regional.make_rig` locate every topic's joints from the same cached skeleton references; acetabulum and humeral/femoral sphere fits, epicondyle and malleolar midpoints, clavicle endpoints and wrist styloid midpoints remain the source of truth. Region muscle weighting paths are retained; neighbouring limb muscles bind to their actual limb owners rather than trunk.

Right joint centres use real right skeleton landmarks. Every right anatomical axis is the **exact X-negated copy** of its left counterpart. Build stdout, `rig.json`, decoded audit data and reports include `dot(right, mirrorX(left))` tables (all 1.0); exact component equality is required. Previews apply the requested positive inputs with the current engine’s `mirrorSignedAxes` rule, using each real left/right joint pair to measure the midline normal and sign right axes against the left axial mirror. Stored right axes remain the exact X-negated copy. Draft elbow pronation/supination aliases remain on the arms rig. Joint centre/axis evidence remains anatomically unapproved.

**Round 8 removes chest's byte lock.** Chest now uses the same full-body landmark rig, `hand` names, 0.08 m grip offsets and shell weighting as the other topics. Its SHA-256 intentionally changes. Chest retains its existing muscle blending and attribute precision. `run.py` records chest SHA before/after for provenance without rejecting the expected change.

Muscle `_U` comes from two mesh-edge distance fields seeded by attachment candidates; disconnected components receive both endpoints. `_FIBRE` is the normalized surface gradient rotated to glTF; UV u follows `_U`, radial v unwraps across seams. Muscle weights blend across the entire fibre length with smoothstep; long multi-joint muscles include intervening joints. Skin uses a smooth anatomical capsule partition across trunk, shoulder girdles, upper/lower limbs, hands and feet, with up to four weights. Fields use skeleton centres rather than the topic origin, so all topic frames produce the same whole-body motion. Both thin shells share complete weight vectors at coincident seams and parallel shell samples within the 6 mm source/simplification envelope; joint blends include shoulders, elbows, wrists, groin, knees and ankles. Head/neck stay smoothly on trunk. Shell equivalence groups survive simultaneous outlier repairs. `finalize_shell.py` repeats synchronization on the final quantized bind geometry, accounting for exported normal seams; the published audit requires identical shell weight vectors and nonzero shares on every body joint. No geometry is welded or moved. Bones are rigidly bound.

The skinning step runs a shared bind-space outlier pass (`skin_weights.py`) on each mesh before export. Normal/UV seams are welded for 1–2-ring neighbour votes. A vertex is replaced by the neighbours’ triangle-area-weighted weight vector when its dominant joint disagrees with a strict majority, its vector differs by more than 25% weight mass, and its dominant-joint distance exceeds twice the neighbours’ median distance to their own dominant joints. Updates are simultaneous, normalized, limited to four joints and repeated until stable; gradual joint crossovers are retained.

Detached scraps whose diameter is at most twice the median mesh edge length, and which lie within that distance of a larger surface component, borrow nearby surface rings. Their component-local origin/insertion seeds are artificial: more than 1% discrepant weight mass is repaired even when the dominant joint agrees. The local fibre station is repaired alongside the weights, then `_U`, fibre gradients and UVs are written together. This prevents tiny source scraps from becoming false opposite-end attachments. Larger disconnected muscle heads retain their own topology. Muscle proximal shares receive an area-weighted decreasing isotonic projection along `_U`, grouped by the actual component attachment owner; the final weights are checked again for outliers. Body skin uses the existing 16-bit export position grid for its neighbour check so quantization cannot introduce a missed seam vote. Chest uses its established muscle blending and the shared full-body skin/outlier path.

The published audit independently decodes positions, triangle adjacency and complete weight vectors from the compressed GLB and applies the same outlier predicate, including skin and bones. `cache/<topic>-weight-repair.json` records unique welded vertices changed by the build, iteration counts and monotonic projection counts. `cache/<topic>-weight-meshes.json` is the decoded bind-space inspection input; `weights-audit.json` and `report.md` report remaining/fixed counts per mesh. Vertex IDs in repair records refer to the native build; decoded seam IDs may differ after export and optimization.

Reviewed per-muscle `fibre` overrides persist in `manifest.json` and in the manifest generator. Their `origin`/`insertion` selectors specify source axes (`x`, `y`, `z`, or `absX`) and `min`/`max` ends, with a metre-valued `bandM`. Bounds are evaluated within each connected surface component, welding coincident seams for the distance field. Bands shrink for short fragments so the endpoints remain disjoint. Trapezius descending runs from its fixed medial border (`absX min`) toward its lateral clavicular end (`absX max`); iliocostalis thoracis and spinalis thoracis run inferior (`z min`) to superior (`z max`). The decoded audit checks all endpoint seeds against those rules, catching scattered or reversed seeds even when both attachments share a static bone surface. Optional `flipU: true` swaps the boundary conditions before baking `_U`, `_FIBRE`, UVs and weights together. Original attachment candidates remain in the human review record.

## Simplification and output gates

| Role | Sampled surface tolerance | Triangle targets / caps |
|---|---:|---|
| Region | 0.5 mm | nominal 4–8k; smaller original meshes retain their full source |
| Neighbour | 1.5 mm | nominal 1–2k, subject to surface tolerance |
| Bone | 1 mm | nominal 2–6k; named static groups may be larger |
| Skin | 3 mm | target 18–30k; mandatory cap 30k |
| Thorax | 1 mm | mandatory cap 25k |
| External oblique as neighbour | 1.5 mm | mandatory cap 8k per side |
| Chest external/internal intercostals | 1.5 mm | mandatory cap 20k each |

Core external oblique is a **region** muscle: its stricter 0.5 mm tolerance takes precedence over the neighbour-only 8k cap. Total output is always **≤4,000,000 bytes and ≤350,000 triangles**, including bones and full-body skin. Both ceilings are checked before publishing. Triangle targets are subordinate to the absolute surface tolerance; caps remain mandatory where specified.

Simplification welds coincident positions into compact buffers, preserves source borders/folds, protects vertices responsible for thin-fold error and retries conservatively. New topics also reduce the global simplifier tolerance when protection alone stops improving an error; unresolved pieces retain original geometry. Opposite coincident collapsed-fold triangles are cancelled in pairs to avoid introducing artificial boundaries. The independent final decoded audit samples referenced vertices plus 6,000 area-weighted triangle-interior points in both directions. These are sampled Hausdorff estimates, not certified global maxima. New boundaries on boundary-free sources fail; open/nonmanifold sources keep section filling disabled.

Positions/normals/weights retain the chest quantization settings. Legs use `_U` 1/8192 and UV 1/1024 (maximum per-component UV rounding error 1/2048) to leave room for full-body skin weights under 4 MB; exact 0/1 fibre endpoints and direction precision are retained. New topics keep custom accessors **float32** while rounding excess mantissa precision on binary grids: `_U` 1/32768, `_FIBRE` 1/4096, UV 1/8192. Fibre direction changes are below 0.013°, endpoint parameters stay exactly 0/1, and decoded fibre length stays within 0.0003 of unity. All decoded weights/attributes/joint references are validated. Chest retains its existing muscle attribute precision.

## Workbench review

Workbench studio `paint.sl`, flat paper `#EDE7D6`, warm clay region muscles, grey-green neighbours, bone-white skeleton. Orthographic cameras fit evaluated non-skin bounds with 5% margin per edge. A same-camera opaque shell is composited at 30% opacity because Workbench has no independent object opacity. The opaque skin view frames the full body.

Exploded previews move superficial/intermediate muscles out 0.12/0.06 m radially; deep, neighbours and bones stay fixed. Back uses a posterior exploded camera so its deeper structures can be reviewed. All six topics use the same decoded full-body pose: **left shoulder flexion 90°, right elbow flexion 90°, left hip flexion 60°, right knee flexion 90°, both ankles dorsiflexion 15°**. `preview-pose.png` shows the opaque posed mannequin; additional `pose-front`, `pose-back`, `pose-left` and `pose-anatomy` views inspect neck/shoulder/groin continuity and retained muscle motion. The pose gate checks finite coordinates and mesh-edge stretches. This verifies the full-body rig and test pose, not complete exercise/contact kinematics.

`preview-review.md` records actual inspection of all six PNGs. Attachment candidates preserve `.o/.e` nodes, raw labels, classification, named surface distance and explicit proximity fallbacks. Every candidate remains **[待核]**: geometry success does not approve anatomical wording, tendon identity, source-label disagreements or exercise-specific motion quality.

Geometry, GLB and derived data: CC BY-SA 4.0. GLB attribution is embedded. Original license/provenance/checksums remain in `cache/License.txt`, `FETCHED.txt` and `SHA256SUMS.txt`.
