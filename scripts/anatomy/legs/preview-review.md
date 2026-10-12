# Legs round 4 visual inspection

Inspected all six final Workbench PNGs through a six-view contact sheet; full-resolution source paths are linked below. This checks placement, side coverage and layer displacement; it does not approve anatomical attachments.

| View | Preview path | Observed result |
|---|---|---|
| front | [cache/legs-preview-front.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-front.png) | Both thighs/calves, patellae, merged lower-leg bones and feet are present. Pelvis and lumbar spine stay centred. Paired hip/thigh muscles are inside the body shell. |
| back | [cache/legs-preview-back.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-back.png) | Gluteal and posterior thigh/calf surfaces are bilateral; pelvis/sacrum are in their expected source position. No missing hamstring or calf side is visible. |
| left | [cache/legs-preview-left.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-left.png) | Body-left view shows pelvis, patella/knee region and foot in anatomical depth order; merged foot bones sit at the floor near the skin sole. |
| exploded-by-layer | [cache/legs-preview-exploded-by-layer.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-exploded-by-layer.png) | Superficial gluteal/thigh/calf parts peel outward 0.12 m, intermediate parts 0.06 m. Deep muscles, pelvis, patellae, lower-leg and foot bones remain fixed; no left/right layer displacement is reversed. |
| skin | [cache/legs-preview-skin.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-skin.png) | Full-body shell remains intact after the lower skin target. Hands/feet/head are present, and source regional seams remain visible. |
| pose | [cache/legs-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-pose.png) | Left hip/knee/ankle angles produce anterior thigh motion and knee flexion while pelvis remains the trunk reference. The tibia/fibula group and foot follow their joints. Tendon-to-bone endpoints and patellar tracking need anatomical [待核] review. |

## Preview provenance

- `legs-preview-front.png`: SHA-256 `4e5afc83e4fd07f75782b5049d0610e05d33e110f91608ad9dacf3bc7433c742`
- `legs-preview-back.png`: SHA-256 `11e4be40e2376256243c20aea08902fe4e8dc2a9d35c400d7d6a9398ec3ca7f3`
- `legs-preview-left.png`: SHA-256 `5b8f97bb9bc5a49e9319c58695cf5583284afb69e3dee252e5c9d24323bc48c0`
- `legs-preview-exploded-by-layer.png`: SHA-256 `b73c047999db6a6d974a14fa9bd64ae1725d520edcd50e56243563d95ec08f81`
- `legs-preview-skin.png`: SHA-256 `008a751dff73066999511532a8b39d70e706fdea0751f1c0cae218b20482c71a`
- `legs-preview-pose.png`: SHA-256 `596c1e42c51c7275076047852dba135f8c5117cfb344dfa324e1d5ac068ede69`

## [待核] attachments and extent

All attachment candidates retain pending human review. Source-marker labels and bone proximity do not independently verify the anatomical endpoint or tendon identity.
Whole neighbouring muscle extents are intentionally retained at low budget; approve teaching crops separately.
Iliotibial tract is noncontractile connective tissue (`connectiveTissue: true` in manifest), despite the shared geometric fibre attributes. Calf-belly candidates can be separated from calcaneus by the unexported Achilles tendon; review tendon endpoints rather than treating absence of 2 mm belly contact as missing anatomy.
