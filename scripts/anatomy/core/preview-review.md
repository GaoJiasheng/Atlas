# Core round 4 visual inspection

Inspected all six final Workbench PNGs through a six-view contact sheet; full-resolution source paths are linked below. This checks placement, side coverage and layer displacement; it does not approve anatomical attachments.

| View | Preview path | Observed result |
|---|---|---|
| front | [cache/core-preview-front.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-front.png) | Rectus/oblique surfaces are bilateral around the rib cage and pelvis; spine remains posterior, femora remain centred in their hip sockets. |
| back | [cache/core-preview-back.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-back.png) | Back view shows the full-source erector representation and grey latissimus/gluteal neighbours. Lumbar multifidus uses real paired source meshes; whole neighbours obscure some deep parts at rest. |
| left | [cache/core-preview-left.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-left.png) | Body-left view shows abdominal layers between ribs and pelvis, with femoral head/shaft in the source hip frame. No displaced rib cage or femur is visible. |
| exploded-by-layer | [cache/core-preview-exploded-by-layer.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-exploded-by-layer.png) | Superficial abdominal wall peels 0.12 m, intermediate structures 0.06 m, leaving deep transversus/quadratus/multifidus/psoas/iliacus and skeleton fixed. Whole-source erector extent still needs a teaching crop [待核]. |
| skin | [cache/core-preview-skin.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-skin.png) | Whole-body shell is intact and includes both limbs, hands and feet. Source regional seams remain visible; no partial-body outline replaces it. |
| pose | [cache/core-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-pose.png) | Trunk rotation and left hip flexion move the decoded final skinning with finite coordinates. Femoral motion stays connected to pelvis through broad iliopsoas/gluteal blends. Whole-body foot-contact kinematics remain [待核]. |

## Preview provenance

- `core-preview-front.png`: SHA-256 `02d9dc979a590f60d28f5c3d81d74f9ca1c88b621715893c0515efd913c30550`
- `core-preview-back.png`: SHA-256 `8725c591c1be31be0cb53501b31a3666f0f1591828b0d52cd821015df3507133`
- `core-preview-left.png`: SHA-256 `629b6e9bbc2f9adbac2416a871863478a64ef0977b3740dd194adf1d6e08a161`
- `core-preview-exploded-by-layer.png`: SHA-256 `0cd7a8e7b00d77de9a909c8e8748d93d8a7c5c0a45197a9d1e61f04b0c7bef65`
- `core-preview-skin.png`: SHA-256 `77384e7a0baf2e5264c92904ef3c9f1de72eb6f6502b81719ab035d805ca7193`
- `core-preview-pose.png`: SHA-256 `29392cc3383f30ce988afa4f8afa4a284957beb7b29d5791e0ee5f782ecaa53c`

## [待核] attachments and extent

All attachment candidates retain pending human review. Source-marker labels and bone proximity do not independently verify the anatomical endpoint or tendon identity.
Whole neighbouring muscle extents are intentionally retained at low budget; approve teaching crops separately.
Full longissimus-thoracis geometry is retained in the merged lumbar erector part. Approve or define the lumbar teaching crop.
