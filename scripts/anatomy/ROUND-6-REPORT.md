# Round 6 stray skin-weight vertices

All six published GLBs pass the decoded skin-weight and fibre audit with zero remaining outliers. Native Blender rebuilt every flagged topic: back, shoulders, arms, legs and core. All six pose previews were refreshed and inspected at full resolution. Chest stayed byte-identical; core and back retained their complete pre-round rig metadata.

`build.py` now runs the shared `skin_weights.py` pass before export. It votes over welded 1–2-ring mesh neighbours, compares the dominant joint and weight vector, and replaces far-joint outliers with the triangle-area-weighted neighbour vector. Updates are simultaneous, normalized, capped at four influences and repeated until stable. An area-weighted decreasing isotonic projection enforces the component’s proximal share along `_U`; the result is checked again for outliers.

Tiny detached source scraps were assigned independent 0/1 fibre seeds next to the main muscle surface. They borrow nearby substantial-surface rings, repair their fibre station with their weights, and refresh `_U`, fibre gradients and UVs together. This additional fragment check catches partially blended contamination as well as wrong dominant joints. Body-skin neighbourhoods use the existing 16-bit export position grid, covering the shoulder seam that becomes coincident only after quantization. Chest keeps its legacy branch.

The audit independently reads every mesh’s bind positions, triangle adjacency and complete weights from the published compressed GLB. Remaining/fixed counts are reported per mesh in every topic’s `report.md` and `weights-audit.json`. Build repair records use native vertex IDs; optimized seam indices may differ.

| Topic | Outliers fixed | Remaining | GLB bytes | Triangles | SHA-256 |
|---|---:|---:|---:|---:|---|
| chest | 0 | 0 | 3685024 | 231986 | `4ddd10ce16131977074cb4ba0a1bbf223a7dbee928b8b84c369553e9362a6687` |
| back | 6 | 0 | 3837476 | 267885 | `c5cde813fce48e70c41a95b57ee40191ad83547aee9a83ade7f51b706b22b6c2` |
| shoulders | 5 | 0 | 2113460 | 150985 | `af72a83504d441c6c336b9435e9d12fcc4f1a580fa776c8e9825f04ecd8d9347` |
| arms | 18 | 0 | 3079348 | 193602 | `f00c57237c2edef88df976de5e477fee7c8219d4ffdec209a5244e11f5574ca3` |
| legs | 31 | 0 | 3983116 | 244638 | `243af0ad87d01a461557f8a7143ccd7912714d41803108da8ae8e86d72633deb` |
| core | 10 | 0 | 3711480 | 274634 | `8be266415b4a40777f7a920f0a1127243381548992b317ac42ecd491ad2a282c` |

Total: **70** unique welded vertices repaired. All six outputs remain below 4,000,000 bytes and 350,000 triangles.

## Pose review

Legs no longer show the round-5 transverse upper-thigh streak. The semimembranosus, gastrocnemius-medial and iliotibial scraps follow their local muscle surfaces. Arms wrist-end extensor scraps follow the distal forearm/hand. Back, shoulders and core show no new isolated weight streaks; the static thin neck-border source slip in back is also present in its older rest/exploded views. Each topic’s `preview-review.md` records the pose PNG and published GLB hashes.

## Verification

- Every final published audit is clean, including body skin and bone meshes.
- Native rebuilds passed final decoded surface, topology, fibre/UV, joint, coordinate and output-budget gates.
- Synthetic checks exercised isolated far-joint repair, normalization, the four-weight limit and decreasing isotonic projection.
- Full core and back `rig.json` objects match their pre-round snapshots exactly.
- Chest SHA-256 is `4ddd10ce16131977074cb4ba0a1bbf223a7dbee928b8b84c369553e9362a6687`.
- No downloads, application build/test/check commands, `src/` edits or `tests/` edits.
