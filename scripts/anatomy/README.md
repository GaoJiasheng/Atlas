# Atlas chest anatomy pipeline

Offline native Blender pipeline for `docs/16-muscles-content-spec.md` §2.2, §5 and M5–M7. All source files are already in `cache/`; nothing is downloaded. Only pipeline files and `public/models/muscles-chest.glb` are generated. No application build, tests, checks or dependency changes are needed.

## Run

Requirements: Blender 5.1 on PATH (FBX/glTF importers, bundled NumPy, Workbench renderer), Python 3, Node ≥22, pnpm and the installed `tsx`, glTF Transform and meshoptimizer dependencies.

```sh
python3 scripts/anatomy/run.py
```

Each native step runs directly, aborting on a failed gate:

```sh
blender -b --python-exit-code 1 -P scripts/anatomy/inventory.py
blender -b --python-exit-code 1 -P scripts/anatomy/build.py
pnpm exec node --import tsx scripts/anatomy/optimize.ts
blender -b --python-exit-code 1 -P scripts/anatomy/chest/preview.py
blender -b --python-exit-code 1 -P scripts/anatomy/report.py
```

The preview command also poses the decoded final skin at shoulder.l flexion 90° and elbow.l flexion 90° and checks that the humerus moves forward. Blender cannot import scalar custom attributes: `chest.audit.glb` is read back from the final compressed bytes, dequantized, and stripped only of `_U` and `_FIBRE`. The published GLB retains both float32 attributes, UVs, joints and weights.

## Selection, coordinates and rig

`chest/manifest.json` selects exact named source structures. Muscles and moving bones retain both real sides; no mirrored geometry is invented. Pectoralis major retains its three parts per side. The intercostals merge into two unsided neighbour/context meshes; the three triceps heads merge per side; radius and ulna merge per side. Sternum/ribs/cartilages merge into `thorax`, with thoracic spine separate. Source helpers are removed even when hidden. Review imports use `disable_bone_shape=True`: Blender otherwise creates an `Icosphere` display helper after import, which caused the original report failure even though it was absent from the exported file. Only the manifest meshes, `chest-rig` and nine named joint nodes may appear in the GLB; the optimizer rejects missing, unexpected or duplicate names.

Blender source coordinates are metres, Z up, front −Y. The frame subtracts the inferior manubrium centroid as the sternal-angle estimate and exports `(x,y,z) → (x,z,−y)` to glTF. Both build and decoded-output checks enforce metres, Y up, body front +Z and own left +X. Sternum is anterior to spine; left clavicle lies at positive X. The trunk joint is the chest origin. `sourceChestCentre` records the original XYZ centre; `floorY = sourceFloorZ − sourceChestCentre[2]`. Adding chest-centre height to the centred floor recovers the source floor; a viewer can add `−floorY` to put the feet on world y=0.

Joint centres use glenoid/epicondyle landmarks, a numerical humeral-head sphere fit (no helper sphere), and wrist landmarks. Build prints every joint against its associated bone bounds and verifies unit axes. Shoulder/elbow flexion uses a negative-X axis so the downward arm moves forward (+Z). `chest/rig.json` records candidate centres, hierarchy, axes and source evidence. The independent pose check can also run with `blender -b --python-exit-code 1 -P scripts/anatomy/chest/pose.py`.

Muscle `_U` is the ratio of two mesh-edge distance fields, seeded from classified attachments; each disconnected component gets both endpoints. `_FIBRE` is the normalized surface gradient, explicitly rotated for glTF; UV u follows `_U`, with radial v and unwrapped seams. Skin and muscles have up to four weights; bones are rigidly bound. Muscle attachment candidates retain raw labels, source objects, proximity distances and review flags; proximity does not approve anatomy.

## Simplification and gates

Simplification runs before fibre/skin baking. Coincident position seams are welded into a **compact** vertex buffer; orphan duplicate vertices must not remain as implicit seams. meshoptimizer updates positions using absolute metre errors, locks source borders and preserves folds. An independent symmetric nearest-triangle audit checks the actual surface. Context meshes protect offending thin-fold vertices and retry from the source instead of freezing the whole mesh; other meshes retry with a smaller error. Opposite coincident triangle pairs produced by collapsed thin folds are cancelled together before export; Blender would remove only one and create a boundary. Unreferenced source vertices are excluded from surface samples, since they are not part of any triangle.

| Role / context mesh | Absolute error | Mandatory triangle cap |
|---|---:|---:|
| Region muscles | 0.5 mm | manifest targets subordinate to error |
| Neighbour muscles | 1.5 mm | manifest targets subordinate to error |
| Intercostals external/internal | 1.5 mm | 20,000 each |
| External oblique | 1.5 mm | 8,000 per side |
| Bones | 1 mm | thorax 25,000 |
| Skin outline | 3 mm | 30,000 |

Optimization welds, reorders, quantizes positions/normals/UVs/weights and uses required `EXT_meshopt_compression` with `KHR_mesh_quantization`. It validates attributes, unit fibre vectors, normalized skin weights and all joint references before writing. Both **4,000,000 bytes / 350,000 triangles soft targets** are enforced, along with the 8 MB / 500k hard ceilings and context caps. `report.py` compares original and decoded final rest surfaces using referenced vertices plus 6,000 area-weighted interior samples per direction. The Hausdorff result is sampled, not a proof of a global maximum. Boundary creation on a previously boundary-free surface fails. Closedness welds positional seams at 0.1 µm; open/nonmanifold sources remain marked for section-cap review.

## Previews and review

Workbench uses studio lighting (no matcap), flat paper `#EDE7D6`, warm clay region muscles, grey-green neighbours and bone-white skeleton. The anatomy cameras are orthographic and fit evaluated non-skin bounds with 5% margin per edge. A same-camera shell pass is composited at 30% opacity, because Workbench has no independent object render opacity. The exploded view leaves skin hidden to expose the lifted layers: superficial 0.12 m and intermediate 0.06 m along the outward radial direction; deep/context/bones stay in place. The opaque skin view frames the full skin bounds to inspect enclosure. The pose view hides skin to expose axilla deformation.

Generated PNGs:

- `cache/preview-front.png`
- `cache/preview-back.png`
- `cache/preview-left.png` (body's own left)
- `cache/preview-exploded-by-layer.png`
- `cache/preview-skin.png`
- `cache/preview-pose.png`

Review the PNGs plus `chest/report.md`, `chest/attachments.json` and `chest/rig.json`. The report includes per-mesh counts/errors/topology, budgets, coordinates, a rig table and unchecked anatomical attachment candidates. Automatic geometry success does not mark the attachment wording or source-label disagreements as anatomically approved.

## Artifacts

`cache/inventory.json` and `inventory-report.md` cover all four cached FBX systems. `chest-review.blend` stores original comparison surfaces; the export scene removes these before writing `chest.raw.glb`. `chest.audit.glb` is the decoded geometry/skin audit copy. JSON stats record build, optimization, surface audit, preview backend/paths and pose measurements. Logs and probes stay in ignored `cache/`. `fallback/` and `assimp_inventory.py` retain the historical CPU route for inspection; the acceptance command above uses native Blender throughout.

Geometry, GLB and derived attachment/rig data use CC BY-SA 4.0. Exact attribution is embedded in the GLB. Original license, provenance and checksums remain in `cache/License.txt`, `FETCHED.txt` and `SHA256SUMS.txt`.

Current native result: **3,679,624 bytes (3.680 MB), 231,986 triangles, 39 mesh nodes / 49 total nodes**. All geometry/error/cap/coordinate gates passed. The 90° shoulder input moves the left humerus 0.145641 m forward; the 90° elbow input produces a 103.00° bend including the source rest angle. Source/open and simplification nonmanifold surfaces keep section caps disabled as listed in the report.
