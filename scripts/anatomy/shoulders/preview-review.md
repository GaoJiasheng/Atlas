# Shoulders round 5 visual inspection

Inspected all six final Workbench PNGs through a six-view contact sheet; full-resolution source paths are linked below. This checks placement, side coverage and layer displacement; it does not approve anatomical attachments.

| View | Preview path | Observed result |
|---|---|---|
| front | [cache/shoulders-preview-front.png](/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-front.png) | All three deltoid parts are present per side. Clavicles, rib cage, humeri and forearms stay in the source anatomical frame; cervical spine is centred. |
| back | [cache/shoulders-preview-back.png](/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-back.png) | Posterior deltoids and scapular region are bilateral. Grey trapezius/latissimus neighbours retain whole source extents and can obscure deeper muscles in the rest view. |
| left | [cache/shoulders-preview-left.png](/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-left.png) | Body-left view keeps deltoid outside the humeral head/girdle and shows the forearm hanging below the elbow; no bone is detached or mirrored. |
| exploded-by-layer | [cache/shoulders-preview-exploded-by-layer.png](/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-exploded-by-layer.png) | Deltoids peel outward while intermediate teres/infraspinatus lift less; deep shoulder-cuff muscles stay at rest. Bones and grey neighbours stay fixed. |
| skin | [cache/shoulders-preview-skin.png](/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-skin.png) | Full source body shell is intact at the 3 mm simplification allowance. Visible segmented surface seams belong to the cached regional skin source. |
| pose | [cache/shoulders-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-pose.png) | Decoded shoulder flexion 55° and elbow flexion 75° move the biceps long head with the arm. The persisted trapezius field changes its weight distribution while the rest mesh and layers retain their positions. |

## Preview provenance

- `shoulders-preview-front.png`: SHA-256 `a31cc99976820c1885f427cfc62a2217d4c13301dc4384c6b52d6cada0bdf781`
- `shoulders-preview-back.png`: SHA-256 `60cdbdf566e9cd735210cc7b75950f377eb9c3633ed04f93f396af0440a6057d`
- `shoulders-preview-left.png`: SHA-256 `2e14e74a7e7b90fdb8c20c3c86c3b083022437629254b1ed128c185d366ccdd8`
- `shoulders-preview-exploded-by-layer.png`: SHA-256 `5b4e434a3d7f59ab384f08da8e1c59550d857fccdbce5b2573899087e98ebc32`
- `shoulders-preview-skin.png`: SHA-256 `c3bf061e07f6776ba3768539e36857553a8dedba4d9524f4c463736478be3327`
- `shoulders-preview-pose.png`: SHA-256 `1acddf24620feb7a228788ae50067f7a1231293bd980ff2fe9e27b0a68d59242`

## [待核] attachments and extent

All attachment candidates retain pending human review. Source-marker labels and bone proximity do not independently verify the anatomical endpoint or tendon identity.
Whole neighbouring muscle extents are intentionally retained at low budget; approve teaching crops separately.

## Round 5 published-weight gate

All six refreshed views were inspected through the contact sheet; the back pose was also inspected at full resolution. The published compressed GLB passes the attachment-joint, unrelated-share and fibre-endpoint gates; see `report.md`.
