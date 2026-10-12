# Round 8 full-body mannequin acceptance

All six native cached-FBX builds completed. Every topic has the same 19-joint body rig, measured through the shared skeleton landmark paths, including joints whose display bones are not exported. Neck is optional; head/neck stay on trunk. Hand grip offsets are 0.08 m.

Full joint set: `trunk, clavicle.l, scapula.l, shoulder.l, elbow.l, forearm.l, hand.l, hip.l, knee.l, ankle.l, clavicle.r, scapula.r, shoulder.r, elbow.r, forearm.r, hand.r, hip.r, knee.r, ankle.r`.

Region muscle weighting paths remain unchanged. Neighbouring limb muscles use their attachment owners and full limb parent chains. The mannequin uses smooth trunk/girdle/limb capsule blends. Thin-shell weights are synchronized before export and again on final quantized bind geometry; all published shell vector checks are identical and every joint has nonzero mannequin shares. Right axes are exact X-negated copies of left axes.

Native and decoded weight/fibre/outlier audits, surface/topology audits, coordinate/attribute gates and 4,000,000-byte / 350,000-triangle limits passed. No application build, test or e2e command ran; cached inputs only, no downloads. Edits made for this round are confined to scripts/anatomy and the six muscles GLBs.

The common test pose is shoulder.l flexion 90°, elbow.r flexion 90°, hip.l flexion 60°, knee.r flexion 90°, ankle.l/r dorsiflexion 15°. Native previews sign right axes with the current engine mirrorSignedAxes rule while preserving the requested stored axis convention. Rest, opaque pose front/back/left/oblique and anatomy views were inspected for every topic: no new open neck/shoulder/groin gap or detached shell was observed. Existing source panel borders, creases and stretched axilla/hip panels remain visible. This confirms this test pose; anatomical attachments and exercise motion approval remain pending.

Chest intentionally changes from its former byte baseline. Legs use a conservative 0.85 native shell audit safety factor; the final shell is within 3 mm. To preserve surface fidelity and fit the fuller weights under 4 MB, legs keep _U at 1/8192 and UVs at 1/1024 (maximum UV component rounding error 1/2048); positions, muscle weights and fibre directions retain their existing encoding.

## Published outputs

| Topic | Joints | Bytes | Triangles | SHA-256 | Audit | Pose preview |
|---|---:|---:|---:|---|---|---|
| chest | 19 | 3,739,748 | 231,986 | `7d46091cad408a65e7a952f2843c9e83957b571a7d1ba4b4dca0ecc07a083ee7` | clean | [chest-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-pose.png) |
| back | 19 | 3,891,084 | 267,885 | `e7e881d12905e19ede46fb60f1998968e936d1eaec4794925d5e12cb6ad4396d` | clean | [back-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-pose.png) |
| shoulders | 19 | 2,169,056 | 150,985 | `fa122f0617bd1f7ca00f6b715144bbbb24bab12346403a667a72bd6e2fb50f60` | clean | [shoulders-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-pose.png) |
| arms | 19 | 3,133,112 | 193,602 | `843d5a4de618b35de9637a7036138d5ce7a6ef1b9c6ea075aa869e0816234141` | clean | [arms-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-pose.png) |
| legs | 19 | 3,984,152 | 246,139 | `c12602c27f22d0df1b82c4302bb665358878db312eb964dbc416a8edb8d29eef` | clean | [legs-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-pose.png) |
| core | 19 | 3,766,588 | 274,634 | `3c099f3bb5edd3be4b6be61d2812b57a5ef50dd598685723170ddd7de646229b` | clean | [core-preview-pose.png](/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-pose.png) |

## Chest axis mirror check

dot(right, X-mirror(left)); exact component equality is separately enforced for every action. Dot products round to 1.000000; float32 unit-axis normalization can differ from one below 1e-6.

| Joint | Flexion | Abduction | Rotation | Pronation | Dorsiflexion | Minimum over all actions |
|---|---:|---:|---:|---:|---:|---:|
| clavicle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| scapula | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| shoulder | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| elbow | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| forearm | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hand | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hip | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| knee | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| ankle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |

Decoded skin surface deviation: 1.206 mm / 3.000 mm. Full mesh audit and attachment evidence: [chest/report.md](chest/report.md); visual observations: [chest/preview-review.md](chest/preview-review.md).

## Back axis mirror check

dot(right, X-mirror(left)); exact component equality is separately enforced for every action. Dot products round to 1.000000; float32 unit-axis normalization can differ from one below 1e-6.

| Joint | Flexion | Abduction | Rotation | Pronation | Dorsiflexion | Minimum over all actions |
|---|---:|---:|---:|---:|---:|---:|
| clavicle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| scapula | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| shoulder | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| elbow | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| forearm | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hand | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hip | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| knee | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| ankle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |

Decoded skin surface deviation: 1.389 mm / 3.000 mm. Full mesh audit and attachment evidence: [back/report.md](back/report.md); visual observations: [back/preview-review.md](back/preview-review.md).

## Shoulders axis mirror check

dot(right, X-mirror(left)); exact component equality is separately enforced for every action. Dot products round to 1.000000; float32 unit-axis normalization can differ from one below 1e-6.

| Joint | Flexion | Abduction | Rotation | Pronation | Dorsiflexion | Minimum over all actions |
|---|---:|---:|---:|---:|---:|---:|
| clavicle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| scapula | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| shoulder | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| elbow | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| forearm | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hand | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hip | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| knee | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| ankle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |

Decoded skin surface deviation: 1.481 mm / 3.000 mm. Full mesh audit and attachment evidence: [shoulders/report.md](shoulders/report.md); visual observations: [shoulders/preview-review.md](shoulders/preview-review.md).

## Arms axis mirror check

dot(right, X-mirror(left)); exact component equality is separately enforced for every action. Dot products round to 1.000000; float32 unit-axis normalization can differ from one below 1e-6.

| Joint | Flexion | Abduction | Rotation | Pronation | Dorsiflexion | Minimum over all actions |
|---|---:|---:|---:|---:|---:|---:|
| clavicle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| scapula | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| shoulder | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| elbow | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| forearm | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hand | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hip | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| knee | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| ankle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |

Decoded skin surface deviation: 1.553 mm / 3.000 mm. Full mesh audit and attachment evidence: [arms/report.md](arms/report.md); visual observations: [arms/preview-review.md](arms/preview-review.md).

## Legs axis mirror check

dot(right, X-mirror(left)); exact component equality is separately enforced for every action. Dot products round to 1.000000; float32 unit-axis normalization can differ from one below 1e-6.

| Joint | Flexion | Abduction | Rotation | Pronation | Dorsiflexion | Minimum over all actions |
|---|---:|---:|---:|---:|---:|---:|
| clavicle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| scapula | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| shoulder | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| elbow | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| forearm | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hand | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hip | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| knee | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| ankle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |

Decoded skin surface deviation: 2.294 mm / 3.000 mm. Full mesh audit and attachment evidence: [legs/report.md](legs/report.md); visual observations: [legs/preview-review.md](legs/preview-review.md).

## Core axis mirror check

dot(right, X-mirror(left)); exact component equality is separately enforced for every action. Dot products round to 1.000000; float32 unit-axis normalization can differ from one below 1e-6.

| Joint | Flexion | Abduction | Rotation | Pronation | Dorsiflexion | Minimum over all actions |
|---|---:|---:|---:|---:|---:|---:|
| clavicle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| scapula | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| shoulder | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| elbow | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| forearm | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hand | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| hip | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| knee | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |
| ankle | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 | 1.000000 |

Decoded skin surface deviation: 1.358 mm / 3.000 mm. Full mesh audit and attachment evidence: [core/report.md](core/report.md); visual observations: [core/preview-review.md](core/preview-review.md).
