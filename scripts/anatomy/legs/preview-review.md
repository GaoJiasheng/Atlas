# Legs round 5 visual inspection

Inspected all six final Workbench PNGs through a six-view contact sheet; full-resolution source paths are linked below. This checks placement, side coverage and layer displacement; it does not approve anatomical attachments.

| View | Preview path | Observed result |
|---|---|---|
| front | [cache/legs-preview-front.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-front.png) | Both thighs/calves, patellae, merged lower-leg bones and feet are present. Pelvis and lumbar spine stay centred. Paired hip/thigh muscles are inside the body shell. |
| back | [cache/legs-preview-back.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-back.png) | Gluteal and posterior thigh/calf surfaces are bilateral; pelvis/sacrum are in their expected source position. No missing hamstring or calf side is visible. |
| left | [cache/legs-preview-left.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-left.png) | Body-left view shows pelvis, patella/knee region and foot in anatomical depth order; merged foot bones sit at the floor near the skin sole. |
| exploded-by-layer | [cache/legs-preview-exploded-by-layer.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-exploded-by-layer.png) | Superficial gluteal/thigh/calf parts peel outward 0.12 m, intermediate parts 0.06 m. Deep muscles, pelvis, patellae, lower-leg and foot bones remain fixed; no left/right layer displacement is reversed. |
| skin | [cache/legs-preview-skin.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-skin.png) | Full-body shell remains intact after the lower skin target. Hands/feet/head are present, and source regional seams remain visible. |
| pose | [cache/legs-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-pose.png) | Decoded hip/knee flexion and ankle dorsiflexion move the raised leg. A thin transverse streak remains visible across the posed upper thigh; this attachment-share/endpoint audit does not certify every individual vertex weight. Rest, exploded and shell views retain bilateral coverage. |

## Preview provenance

- `legs-preview-front.png`: SHA-256 `c47f6cc23906f08db4634b371d55f21bffebf6ab448b8a7b1a44b9d7459b11f2`
- `legs-preview-back.png`: SHA-256 `874b862719299c8e7fd516767a40911d8a3d4188e90e4de5ec2a74572689e733`
- `legs-preview-left.png`: SHA-256 `c556e1f4b1d4763769dcb983cb965bafbab0c780e7aef5198a74750600f7fe49`
- `legs-preview-exploded-by-layer.png`: SHA-256 `a9a9478b770df3db8cf2a2a83d2075a5eadef70c7cac46fc24436a5233ff0cab`
- `legs-preview-skin.png`: SHA-256 `630b1fdc0bd9a521e07c3f0f89693096bd9cc6531366c9f5f625e3436e293e61`
- `legs-preview-pose.png`: SHA-256 `a2880eb96b7954fb16cd498643a59cd04f4c166d18f409d20f6785b1c44b9312`

## [待核] attachments and extent

All attachment candidates retain pending human review. Source-marker labels and bone proximity do not independently verify the anatomical endpoint or tendon identity.
Whole neighbouring muscle extents are intentionally retained at low budget; approve teaching crops separately.
Iliotibial tract is noncontractile connective tissue (`connectiveTissue: true` in manifest), despite the shared geometric fibre attributes. Calf-belly candidates can be separated from calcaneus by the unexported Achilles tendon; review tendon endpoints rather than treating absence of 2 mm belly contact as missing anatomy.

## Round 5 published-weight gate

All six refreshed views were inspected through the contact sheet; the back pose was also inspected at full resolution. The published compressed GLB passes the attachment-joint, unrelated-share and fibre-endpoint gates; see `report.md`.
