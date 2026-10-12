# Arms round 4 visual inspection

Inspected all six final Workbench PNGs through a six-view contact sheet; full-resolution source paths are linked below. This checks placement, side coverage and layer displacement; it does not approve anatomical attachments.

| View | Preview path | Observed result |
|---|---|---|
| front | [cache/arms-preview-front.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-front.png) | Biceps/triceps components and long forearm muscle/tendon surfaces appear on both sides, with hand bones enclosed by the shell. Scapulae anchor the upper arms; neighbour shoulder/chest extents remain whole. |
| back | [cache/arms-preview-back.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-back.png) | Triceps and extensor surfaces are bilateral; radius and ulna are retained as separate bones. No empty parent muscle group is emitted as extra geometry. |
| left | [cache/arms-preview-left.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-left.png) | Body-left view shows the forearm and separate hand bones extending from the upper arm without a misplaced skeletal column. |
| exploded-by-layer | [cache/arms-preview-exploded-by-layer.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-exploded-by-layer.png) | Superficial arm/forearm muscles peel 0.12 m; intermediate muscles peel 0.06 m. Bones and neighbouring chest/deltoid surfaces remain at rest. Long tendons peel with their muscle part. |
| skin | [cache/arms-preview-skin.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-skin.png) | Full-body opaque shell is intact; source skin segmentation seams remain visible. No intrinsic hand muscles have been invented. |
| pose | [cache/arms-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-pose.png) | Left shoulder/elbow, forearm pronation and wrist flexion are exercised. Radius/hand rotate on forearm while ulna remains on elbow; the bent limb and hand stay connected. Soft-tissue tendon identities and high-angle intersections remain [待核]. |

## Preview provenance

- `arms-preview-front.png`: SHA-256 `caa37c1aae841efe9f40100f8dfeb7319eac4de98fc8c89197e144ae13c4487c`
- `arms-preview-back.png`: SHA-256 `90a71639d866614c202bbe12e9359888666654d8302b665154dece9b6211b396`
- `arms-preview-left.png`: SHA-256 `fb9a84bc570d2786b6336129de3329b120da5cc4f69cd778d5206dece9ff8eb0`
- `arms-preview-exploded-by-layer.png`: SHA-256 `ed8547b1d0fc1da8c99231979530c5add23bef88dd0710ad1308a0525871de72`
- `arms-preview-skin.png`: SHA-256 `b2e890cf9c74ef75a01642fee5a5d5c82fd7e7bbe0e2c8d8083a7f29127064d9`
- `arms-preview-pose.png`: SHA-256 `d990c79783555d82c1b0e7138dabf40447f3a61f76c2e219cb0d55bc7a871f19`

## [待核] attachments and extent

All attachment candidates retain pending human review. Source-marker labels and bone proximity do not independently verify the anatomical endpoint or tendon identity.
Whole neighbouring muscle extents are intentionally retained at low budget; approve teaching crops separately.
Palmaris-longus `hand` is a region link: its insertion is connective tissue/palmar aponeurosis rather than direct hand-bone attachment. The geometric reference must not become false anatomical wording.
