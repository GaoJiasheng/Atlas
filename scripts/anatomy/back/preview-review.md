# Back round 5 visual inspection

Inspected all six final Workbench PNGs through a six-view contact sheet; full-resolution source paths are linked below. This checks placement, side coverage and layer displacement; it does not approve anatomical attachments.

| View | Preview path | Observed result |
|---|---|---|
| front | [cache/back-preview-front.png](/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-front.png) | Both sides present; clavicles and humeri sit beside the rib cage, sternum stays anterior and pelvis stays centred. Region muscles and low-budget neighbours remain distinct. |
| back | [cache/back-preview-back.png](/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-back.png) | Trapezius subdivisions and latissimus form a bilateral posterior surface; scapular region coverage is symmetric. No displaced midline spine or missing source side is visible. |
| left | [cache/back-preview-left.png](/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-left.png) | Body-left view shows anterior ribs and posterior back muscles in the expected depth order; clavicle/scapular girdle and humeral shaft remain inside the shell. |
| exploded-by-layer | [cache/back-preview-exploded-by-layer.png](/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-exploded-by-layer.png) | Posterior camera exposes the peeled back layers. Superficial trapezius/latissimus move 0.12 m and intermediate structures 0.06 m; deep erectors, spine and neighbouring muscles remain at rest. Camera was corrected from the chest front-facing view. |
| skin | [cache/back-preview-skin.png](/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-skin.png) | Whole-body shell includes head, hands and feet. Source region seams remain visible; no artificial one-sided shell or cropped outline is exported. |
| pose | [cache/back-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-pose.png) | Decoded shoulder flexion 55° and elbow flexion 75° raise the left biceps and brachioradialis with the humerus/forearm. Their centroid displacements are 0.117342 m and 0.332447 m; they no longer hang beside the trunk. Rest, exploded and shell views retain bilateral coverage. |

## Preview provenance

- `back-preview-front.png`: SHA-256 `84b4a3627942fd834872df397867a88ddd596297f94c8b74cacd31c7c8e0c2b7`
- `back-preview-back.png`: SHA-256 `cfaf61f3e216bc76a15a96d3df5143974f9589728d80440eebc0250d3749cb5d`
- `back-preview-left.png`: SHA-256 `d1d8b62a8865bcf37b48d35be5690a47970e9158dced5801d7e2ae399ceddd08`
- `back-preview-exploded-by-layer.png`: SHA-256 `30597dcca81fb8a9a4bd35f06b8a0d2911ad2a5af4d881dd1c3c18c0f8c4a443`
- `back-preview-skin.png`: SHA-256 `8b48458d5cf55c1102f6ef659eb67fc14e452743834d6dbb6b28e410833b4b38`
- `back-preview-pose.png`: SHA-256 `b05716c8d19661a8c3cc171ed277e1dde363456aeab96f0821c44dc7972f8301`

## [待核] attachments and extent

All attachment candidates retain pending human review. Source-marker labels and bone proximity do not independently verify the anatomical endpoint or tendon identity.
Whole neighbouring muscle extents are intentionally retained at low budget; approve teaching crops separately.

## Round 5 published-weight gate

All six refreshed views were inspected through the contact sheet; the back pose was also inspected at full resolution. The published compressed GLB passes the attachment-joint, unrelated-share and fibre-endpoint gates; see `report.md`.
