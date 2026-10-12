# Arms round 5 visual inspection

Inspected all six final Workbench PNGs through a six-view contact sheet; full-resolution source paths are linked below. This checks placement, side coverage and layer displacement; it does not approve anatomical attachments.

| View | Preview path | Observed result |
|---|---|---|
| front | [cache/arms-preview-front.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-front.png) | Biceps/triceps components and long forearm muscle/tendon surfaces appear on both sides, with hand bones enclosed by the shell. Scapulae anchor the upper arms; neighbour shoulder/chest extents remain whole. |
| back | [cache/arms-preview-back.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-back.png) | Triceps and extensor surfaces are bilateral; radius and ulna are retained as separate bones. No empty parent muscle group is emitted as extra geometry. |
| left | [cache/arms-preview-left.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-left.png) | Body-left view shows the forearm and separate hand bones extending from the upper arm without a misplaced skeletal column. |
| exploded-by-layer | [cache/arms-preview-exploded-by-layer.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-exploded-by-layer.png) | Superficial arm/forearm muscles peel 0.12 m; intermediate muscles peel 0.06 m. Bones and neighbouring chest/deltoid surfaces remain at rest. Long tendons peel with their muscle part. |
| skin | [cache/arms-preview-skin.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-skin.png) | Full-body opaque shell is intact; source skin segmentation seams remain visible. No intrinsic hand muscles have been invented. |
| pose | [cache/arms-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-pose.png) | Decoded shoulder/elbow flexion, forearm pronation and wrist flexion move the raised arm and hand. Radius/hand pronation and rigid ulna binding remain present; all weights pass attachment ownership and endpoint direction checks. |

## Preview provenance

- `arms-preview-front.png`: SHA-256 `83dc9ad5af959ce7c53688f7c2a3fcc51ebd94e7f09e13bbb397c70ec188ce72`
- `arms-preview-back.png`: SHA-256 `67c0017b59076706524e1193eac21535804e7504ff60d4ee5f814a6c8f9c039d`
- `arms-preview-left.png`: SHA-256 `45a1a8a2b41ec03d8e2f40bbb8635a06bf4401429a69f8bfbec8520a41b65fd3`
- `arms-preview-exploded-by-layer.png`: SHA-256 `8c88255a466f8434a90efd1c77c9e6e6d20ff6c2cb24c07152c317a8144ec50d`
- `arms-preview-skin.png`: SHA-256 `c6ce7336120fe9294c7252aba57d91c9f4e56154328869b9c84ae783331d5790`
- `arms-preview-pose.png`: SHA-256 `057149c9e43c7174497b27308d1e21453bc9137a7de250207a80afad8220a5fb`

## [待核] attachments and extent

All attachment candidates retain pending human review. Source-marker labels and bone proximity do not independently verify the anatomical endpoint or tendon identity.
Whole neighbouring muscle extents are intentionally retained at low budget; approve teaching crops separately.
Palmaris-longus `hand` is a region link: its insertion is connective tissue/palmar aponeurosis rather than direct hand-bone attachment. The geometric reference must not become false anatomical wording.

## Round 5 published-weight gate

All six refreshed views were inspected through the contact sheet; the back pose was also inspected at full resolution. The published compressed GLB passes the attachment-joint, unrelated-share and fibre-endpoint gates; see `report.md`.
