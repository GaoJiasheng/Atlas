# Round 4 native mesh results

All five new native pipelines passed their final decoded geometry and output gates. All thirty PNGs were visually inspected. No downloads or application build/test/check commands were run.

| Topic | GLB bytes | Triangles | Total nodes | Mesh nodes / draw calls | Six preview paths |
|---|---:|---:|---:|---:|---|
| chest | 3,685,024 | 231,986 | 51 | 39 / 39 | `cache/chest-preview-{front,back,left,exploded-by-layer,skin,pose}.png` |
| back | 3,834,448 | 267,885 | 71 | 59 / 59 | `cache/back-preview-{front,back,left,exploded-by-layer,skin,pose}.png` |
| shoulders | 2,112,480 | 150,985 | 57 | 45 / 45 | `cache/shoulders-preview-{front,back,left,exploded-by-layer,skin,pose}.png` |
| arms | 3,078,272 | 193,602 | 75 | 61 / 61 | `cache/arms-preview-{front,back,left,exploded-by-layer,skin,pose}.png` |
| legs | 3,983,156 | 244,638 | 71 | 63 / 63 | `cache/legs-preview-{front,back,left,exploded-by-layer,skin,pose}.png` |
| core | 3,671,156 | 274,634 | 37 | 33 / 33 | `cache/core-preview-{front,back,left,exploded-by-layer,skin,pose}.png` |

Chest SHA-256 before/after: `4ddd10ce16131977074cb4ba0a1bbf223a7dbee928b8b84c369553e9362a6687`; identical native rerun.

704 pending attachment candidates; 70 escalated flags are [listed here](attachment-flags.md). Per-topic reports contain all candidates, surface tables, rig evidence, scope omissions and preview paths.

Concurrent back-model edit: a second process added unmanifested skull/cervical nodes after the audit. Its 3,988,552-byte version is preserved at `cache/back-concurrent-review.glb` with metadata in `cache/back-concurrent-review.json`. The published back GLB was regenerated from the requested manifest and reverified against the final native surface/preview audit.
