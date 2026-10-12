# Core round 7 visual inspection

Inspected all six final Workbench PNGs through a six-view contact sheet; full-resolution source paths are linked below. This checks placement, side coverage and layer displacement; it does not approve anatomical attachments.

| View | Preview path | Observed result |
|---|---|---|
| front | [cache/core-preview-front.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-front.png) | Rectus/oblique surfaces are bilateral around the rib cage and pelvis; spine remains posterior, femora remain centred in their hip sockets. |
| back | [cache/core-preview-back.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-back.png) | Back view shows the full-source erector representation and grey latissimus/gluteal neighbours. Lumbar multifidus uses real paired source meshes; whole neighbours obscure some deep parts at rest. |
| left | [cache/core-preview-left.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-left.png) | Body-left view shows abdominal layers between ribs and pelvis, with femoral head/shaft in the source hip frame. No displaced rib cage or femur is visible. |
| exploded-by-layer | [cache/core-preview-exploded-by-layer.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-exploded-by-layer.png) | Superficial abdominal wall peels 0.12 m, intermediate structures 0.06 m, leaving deep transversus/quadratus/multifidus/psoas/iliacus and skeleton fixed. Whole-source erector extent still needs a teaching crop [待核]. |
| skin | [cache/core-preview-skin.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-skin.png) | Whole-body shell is intact and includes both limbs, hands and feet. Source regional seams remain visible; no partial-body outline replaces it. |
| pose | [cache/core-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-pose.png) | Decoded trunk rotation 12°, hip flexion 25° and added shoulder flexion 55° exercise the corrected arm-neighbour chain. Latissimus now has shoulder weights and serratus has clavicle/scapula weights; femora and broad iliopsoas/gluteal blends remain connected. |

## Preview provenance

- `core-preview-front.png`: SHA-256 `56473b6100d081bfd693f4983a7023a7d6e1c30b4a216feeda4625f26e826c81`
- `core-preview-back.png`: SHA-256 `f810a91b0e9ce3df1b8a40288bc55c70ff37f625c408dd5f7402474a05645000`
- `core-preview-left.png`: SHA-256 `db5fbfabb1711d5b884c976ff07f65d74e969f1d9014b773523ebbad36fc0939`
- `core-preview-exploded-by-layer.png`: SHA-256 `a5d61d57498bb8e65c68764435fd181cc25af9e923808265ff0f472f5886efc2`
- `core-preview-skin.png`: SHA-256 `0efb2c277ce0ca2bfde56eef0a1b3eb999f1c53d3826d521a27cd488555f7366`
- `core-preview-pose.png`: SHA-256 `3dfd86fefe867d847c9a669c7d6ce5d6d3e27c0c95164aeb88352f2b03ffdc6e`

## [待核] attachments and extent

All attachment candidates retain pending human review. Source-marker labels and bone proximity do not independently verify the anatomical endpoint or tendon identity.
Whole neighbouring muscle extents are intentionally retained at low budget; approve teaching crops separately.
Full longissimus-thoracis geometry is retained in the merged lumbar erector part. Approve or define the lumbar teaching crop.

## Round 7 published-weight gate

All six refreshed core views were inspected through the contact sheet after the native rebuild. Rest views retain bilateral placement and the complete shell; the pose retains connected femora and broad iliopsoas/gluteal blends. The native rig now contains trunk plus both clavicle/scapula/shoulder/elbow/hand and hip/knee/ankle chains (17 joints); both hand grip offsets are 0.08 m. The manifest replaces the removed post-export extension. The published compressed GLB passes the attachment-joint, unrelated-share and fibre-endpoint gates; see `report.md`.
