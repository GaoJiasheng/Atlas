# Back mesh review

Final GLB: **3,954,616 bytes**, **273,682 triangles**, **82 total nodes** (62 meshes, 19 joints, rig root).
Draw-call estimate: **62** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.

Native Blender, cached FBX only. Geometry and derived rig/attachment data: CC BY-SA 4.0.

## Source coverage and scope

- Selected from docs/16 §5.3, region reviews and exact cached FBX inventory; no mirrored geometry.
- Parent/group cards are not duplicated as meshes. Neighbours include adjacent exercise secondary/stabiliser muscles; distant whole-body stabilisers excluded.
- Reference surfaces outside the exported bone list are used only for attachment and joint evidence.
- Whole neighbour muscle extents retained at low budget; educational crops remain [待核].
- Intrinsic hand/foot muscles and deep forearm flexors excluded by v1 scope; hand/foot bones are merged per side.
- Optional thoracolumbar fascia, linea alba and diaphragm omitted. Linea-alba attachment evidence uses the unexported named source surface.
- No named region muscle is missing in Z-Anatomy; multifidus uses the actual paired lumbar meshes, not rotatores or invented geometry.

## Round 9 skin parts

Skin nodes: `skin-outline, skin-hand.l, skin-hand.r, skin-wire`.

The wrist planes are perpendicular to the real elbow-to-styloid-midpoint forearm axes, 5 mm distal to the hand pivots. `skin-outline` excludes the hands. The wrist openings are intentionally open. `skin-hand.l/r` are rigidly bound to `hand.l/r`; hide these nodes when substituting procedural hands.

`skin-wire` includes both hands and uses the full 19-joint skin. Native planar dissolve at 3 degrees precedes quadric planar-preserving simplification. Weights are interpolated barycentrically from the existing skin triangles, reduced to four influences, then shell-synchronized and audited for outliers. Any remaining mismatch is repaired on the exact codec-roundtripped bind geometry before publication. Source UVs are omitted from skin nodes; wire normals are omitted because the engine draws edges.

Native wire: 3927 triangles; the table below reports actual decoded triangles after degenerate cleanup. The schematic has a separate 35 mm sampled surface ceiling; opaque skin retains its 3 mm gate. Split skin coverage is checked as the union of body and both hands, and each part is checked against the full original source. Intentional wrist boundaries are allowed.

Budgets: soft 4,000,000 bytes / 350,000 triangles; hard 8,000,000 bytes / 500,000 triangles. Both soft limits pass for this output.


Display muscle and bone selections retain their reviewed topic scope. The mannequin uses full-body joints even where corresponding display bones are absent. No hand/foot intrinsic muscle geometry is fabricated.

## Final decoded surface audit

Sampled surface deviation: referenced vertices (approximately 3,000) plus 6,000 area-weighted interior points in each direction for whole meshes; split skin parts use final-to-whole-source distances plus a symmetric union coverage gate. This estimates surface error rather than certifying a global maximum. Source boundaries are preserved; nonmanifold/open sources retain disabled section filling.

| Mesh | Role | Source triangles | Final triangles | Deviation mm | Budget mm | Closed before → after | Boundary edges |
|---|---|---:|---:|---:|---:|---|---:|
| biceps-brachii.l | neighbour | 5,914 | 1,490 | 0.655 | 1.5 | True → False | 0 |
| biceps-brachii.r | neighbour | 5,914 | 1,492 | 0.723 | 1.5 | True → False | 0 |
| brachialis.l | neighbour | 3,478 | 1,496 | 0.976 | 1.5 | True → True | 0 |
| brachialis.r | neighbour | 3,478 | 1,496 | 0.976 | 1.5 | True → True | 0 |
| brachioradialis.l | neighbour | 7,312 | 1,500 | 0.747 | 1.5 | True → True | 0 |
| brachioradialis.r | neighbour | 7,312 | 1,500 | 0.651 | 1.5 | True → True | 0 |
| clavicle.l | bone | 1,550 | 1,500 | 0.005 | 1.0 | True → True | 0 |
| clavicle.r | bone | 1,550 | 1,500 | 0.003 | 1.0 | True → True | 0 |
| deltoid-anterior.l | neighbour | 2,902 | 1,500 | 0.458 | 1.5 | True → True | 0 |
| deltoid-anterior.r | neighbour | 2,902 | 1,500 | 0.392 | 1.5 | True → True | 0 |
| deltoid-posterior.l | neighbour | 4,378 | 1,498 | 0.560 | 1.5 | True → True | 0 |
| deltoid-posterior.r | neighbour | 4,378 | 1,498 | 0.653 | 1.5 | True → True | 0 |
| external-oblique.l | neighbour | 29,622 | 7,986 | 1.308 | 1.5 | True → False | 0 |
| external-oblique.r | neighbour | 29,622 | 7,988 | 1.306 | 1.5 | True → True | 0 |
| gluteus-maximus.l | neighbour | 3,326 | 2,902 | 0.572 | 1.5 | True → True | 0 |
| gluteus-maximus.r | neighbour | 3,326 | 2,896 | 0.572 | 1.5 | True → True | 0 |
| humerus.l | bone | 4,280 | 4,000 | 0.042 | 1.0 | False → False | 4 |
| humerus.r | bone | 4,280 | 4,000 | 0.103 | 1.0 | False → False | 4 |
| iliocostalis-lumborum.l | region | 10,038 | 3,994 | 0.319 | 0.5 | True → True | 0 |
| iliocostalis-lumborum.r | region | 10,038 | 3,992 | 0.373 | 0.5 | True → True | 0 |
| iliocostalis-thoracis.l | region | 5,772 | 3,996 | 0.259 | 0.5 | True → True | 0 |
| iliocostalis-thoracis.r | region | 5,772 | 3,996 | 0.404 | 0.5 | True → True | 0 |
| infraspinatus.l | region | 3,166 | 3,166 | 0.002 | 0.5 | True → True | 0 |
| infraspinatus.r | region | 3,166 | 3,166 | 0.002 | 0.5 | True → True | 0 |
| latissimus-dorsi.l | region | 21,580 | 8,958 | 0.422 | 0.5 | True → False | 0 |
| latissimus-dorsi.r | region | 21,580 | 11,886 | 0.368 | 0.5 | True → True | 0 |
| levator-scapulae.l | region | 3,082 | 3,082 | 0.002 | 0.5 | True → True | 0 |
| levator-scapulae.r | region | 3,082 | 3,082 | 0.002 | 0.5 | True → True | 0 |
| longissimus-thoracis.l | region | 9,652 | 6,900 | 0.464 | 0.5 | True → False | 0 |
| longissimus-thoracis.r | region | 9,652 | 6,918 | 0.463 | 0.5 | True → False | 0 |
| lumbar-spine | bone | 16,846 | 5,996 | 0.575 | 1.0 | False → True | 0 |
| pelvis | bone | 20,418 | 12,000 | 0.184 | 1.0 | False → False | 13 |
| rhomboid-major.l | region | 4,800 | 3,994 | 0.307 | 0.5 | True → True | 0 |
| rhomboid-major.r | region | 4,800 | 3,994 | 0.306 | 0.5 | True → True | 0 |
| rhomboid-minor.l | region | 1,494 | 1,494 | 0.001 | 0.5 | True → True | 0 |
| rhomboid-minor.r | region | 1,494 | 1,494 | 0.003 | 0.5 | True → True | 0 |
| scapula.l | bone | 25,326 | 3,998 | 0.217 | 1.0 | False → True | 0 |
| scapula.r | bone | 25,326 | 4,000 | 0.270 | 1.0 | False → True | 0 |
| serratus-anterior.l | neighbour | 25,240 | 1,980 | 1.133 | 1.5 | True → False | 0 |
| serratus-anterior.r | neighbour | 25,240 | 2,022 | 1.267 | 1.5 | True → False | 0 |
| serratus-posterior-inferior.l | region | 8,958 | 3,990 | 0.337 | 0.5 | True → True | 0 |
| serratus-posterior-inferior.r | region | 8,958 | 3,988 | 0.324 | 0.5 | True → True | 0 |
| skin-hand.l | skin | 100,818 | 1,871 | 1.439 | 3.0 | False → False | 85 |
| skin-hand.r | skin | 100,818 | 2,199 | 2.175 | 3.0 | False → False | 87 |
| skin-outline | skin | 100,818 | 28,117 | 1.312 | 3.0 | False → False | 337 |
| skin-wire | skin | 100,818 | 3,407 | 9.266 | 35.0 | False → False | 469 |
| spinalis-thoracis.l | region | 5,532 | 3,992 | 0.286 | 0.5 | True → True | 0 |
| spinalis-thoracis.r | region | 5,532 | 3,994 | 0.286 | 0.5 | True → True | 0 |
| teres-major.l | region | 1,154 | 1,154 | 0.001 | 0.5 | True → True | 0 |
| teres-major.r | region | 1,154 | 1,154 | 0.001 | 0.5 | True → True | 0 |
| teres-minor.l | region | 1,522 | 1,522 | 0.001 | 0.5 | True → True | 0 |
| teres-minor.r | region | 1,522 | 1,522 | 0.001 | 0.5 | True → True | 0 |
| thoracic-spine | bone | 27,527 | 14,982 | 0.335 | 1.0 | False → False | 4 |
| thorax | bone | 274,709 | 24,992 | 0.511 | 1.0 | False → False | 9 |
| trapezius-ascending.l | region | 4,596 | 3,996 | 0.244 | 0.5 | True → True | 0 |
| trapezius-ascending.r | region | 4,596 | 3,996 | 0.244 | 0.5 | True → True | 0 |
| trapezius-descending.l | region | 6,760 | 3,988 | 0.376 | 0.5 | True → True | 0 |
| trapezius-descending.r | region | 6,760 | 3,988 | 0.412 | 0.5 | True → True | 0 |
| trapezius-transverse.l | region | 2,992 | 2,992 | 0.002 | 0.5 | True → True | 0 |
| trapezius-transverse.r | region | 2,992 | 2,992 | 0.002 | 0.5 | True → True | 0 |
| triceps-brachii.l | neighbour | 10,264 | 1,496 | 1.274 | 1.5 | True → True | 0 |
| triceps-brachii.r | neighbour | 10,264 | 1,500 | 1.051 | 1.5 | True → True | 0 |

## Workbench previews

Studio lighting, paper #EDE7D6, orthographic evaluated non-skin bounds with 5% margin; shell composite at 30%. Superficial/intermediate layers move out 0.12/0.06 m; bones and neighbours remain fixed.

- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-exploded-by-layer.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-skin.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-wire-rest.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-pose.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-pose-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-pose-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-pose-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-pose-anatomy.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-wire-pose.png`

Right angle convention: positive inputs; right axes signed by the engine mirrorSignedAxes rule. Positive inputs use the current engine’s mirrorSignedAxes rule with the real left/right joint midline normal; stored metadata remains the exact X-only axis reflection.
Pose inputs: {'shoulder.l.flexion': 90, 'elbow.r.flexion': 90, 'hip.l.flexion': 60, 'knee.r.flexion': 90, 'ankle.l.dorsiflexion': 15, 'ankle.r.dorsiflexion': 15}; humerus.l centroid displacement 0.197935 m. All evaluated coordinates and muscle-edge stretches are finite.
Visual inspection results are recorded in `preview-review.md` after viewing every PNG.

## Frame and rig

Metres; Y up; front +Z; own left +X. Source region centre [0.0, 0.04927174001932144, 1.1982355117797852]; floorY -1.198618 m. Add −floorY for grounded full-body display.
Unexported reference bones locate joints and attachment candidates without adding out-of-region display bones. Hand joints pivot at wrist styloid midpoints; grip offsets are 0.08 m along the distal hand direction.

| Joint | Position X/Y/Z m | Parent | Evidence |
|---|---|---|---|
| trunk | 0.00000, 0.00000, -0.00000 | None | region frame |
| clavicle.l | 0.01669, 0.20286, 0.08402 | trunk | medial clavicle / sternoclavicular joint |
| scapula.l | 0.14956, 0.21895, 0.01355 | clavicle.l | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.l | 0.17262, 0.18826, 0.02343 | scapula.l | humeral head sphere fit; .i/.j landmark patch |
| elbow.l | 0.22319, -0.08752, 0.00926 | shoulder.l | midpoint of humeral epicondyle .i/.j cubes |
| forearm.l | 0.22319, -0.08752, 0.00926 | elbow.l | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.l | 0.26462, -0.35275, 0.06348 | forearm.l | midpoint of radial/ulnar styloid cubes |
| hip.l | 0.08529, -0.32721, 0.03430 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.l | 0.07621, -0.74229, 0.01618 | hip.l | midpoint of femoral epicondyle .i/.j cubes |
| ankle.l | 0.08182, -1.11893, 0.00581 | knee.l | midpoint of medial/lateral malleolar landmarks |
| clavicle.r | -0.01669, 0.20286, 0.08402 | trunk | medial clavicle / sternoclavicular joint |
| scapula.r | -0.14956, 0.21895, 0.01355 | clavicle.r | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.r | -0.17262, 0.18826, 0.02343 | scapula.r | humeral head sphere fit; .i/.j landmark patch |
| elbow.r | -0.22319, -0.08752, 0.00926 | shoulder.r | midpoint of humeral epicondyle .i/.j cubes |
| forearm.r | -0.22319, -0.08752, 0.00926 | elbow.r | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.r | -0.26464, -0.35275, 0.06348 | forearm.r | midpoint of radial/ulnar styloid cubes |
| hip.r | -0.08529, -0.32721, 0.03430 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.r | -0.07621, -0.74229, 0.01618 | hip.r | midpoint of femoral epicondyle .i/.j cubes |
| ankle.r | -0.07861, -1.11903, 0.00587 | knee.r | midpoint of medial/lateral malleolar landmarks |

## Bilateral axis checks

| Joint | Action | dot(right, X-mirror(left)) |
|---|---|---:|
| clavicle | flexion | 1.000000000 |
| clavicle | extension | 1.000000000 |
| clavicle | abduction | 1.000000000 |
| clavicle | adduction | 1.000000000 |
| clavicle | rotation | 1.000000000 |
| clavicle | internal-rotation | 1.000000000 |
| clavicle | external-rotation | 1.000000000 |
| clavicle | horizontal-abduction | 1.000000000 |
| clavicle | horizontal-adduction | 1.000000000 |
| clavicle | elevation | 1.000000000 |
| clavicle | depression | 1.000000000 |
| clavicle | protraction | 1.000000000 |
| clavicle | retraction | 1.000000000 |
| clavicle | upward-rotation | 1.000000000 |
| clavicle | downward-rotation | 1.000000000 |
| clavicle | lateral-flexion | 1.000000000 |
| clavicle | pronation | 1.000000000 |
| clavicle | supination | 1.000000000 |
| clavicle | dorsiflexion | 1.000000000 |
| clavicle | plantarflexion | 1.000000000 |
| clavicle | inversion | 1.000000000 |
| clavicle | eversion | 1.000000000 |
| scapula | flexion | 1.000000000 |
| scapula | extension | 1.000000000 |
| scapula | abduction | 1.000000000 |
| scapula | adduction | 1.000000000 |
| scapula | rotation | 1.000000000 |
| scapula | internal-rotation | 1.000000000 |
| scapula | external-rotation | 1.000000000 |
| scapula | horizontal-abduction | 1.000000000 |
| scapula | horizontal-adduction | 1.000000000 |
| scapula | elevation | 1.000000000 |
| scapula | depression | 1.000000000 |
| scapula | protraction | 1.000000000 |
| scapula | retraction | 1.000000000 |
| scapula | upward-rotation | 1.000000000 |
| scapula | downward-rotation | 1.000000000 |
| scapula | lateral-flexion | 1.000000000 |
| scapula | pronation | 1.000000000 |
| scapula | supination | 1.000000000 |
| scapula | dorsiflexion | 1.000000000 |
| scapula | plantarflexion | 1.000000000 |
| scapula | inversion | 1.000000000 |
| scapula | eversion | 1.000000000 |
| shoulder | flexion | 1.000000000 |
| shoulder | extension | 1.000000000 |
| shoulder | abduction | 1.000000000 |
| shoulder | adduction | 1.000000000 |
| shoulder | rotation | 0.999999928 |
| shoulder | internal-rotation | 0.999999928 |
| shoulder | external-rotation | 0.999999928 |
| shoulder | horizontal-abduction | 1.000000000 |
| shoulder | horizontal-adduction | 1.000000000 |
| shoulder | elevation | 1.000000000 |
| shoulder | depression | 1.000000000 |
| shoulder | protraction | 1.000000000 |
| shoulder | retraction | 1.000000000 |
| shoulder | upward-rotation | 1.000000000 |
| shoulder | downward-rotation | 1.000000000 |
| shoulder | lateral-flexion | 1.000000000 |
| shoulder | pronation | 0.999999928 |
| shoulder | supination | 0.999999928 |
| shoulder | dorsiflexion | 1.000000000 |
| shoulder | plantarflexion | 1.000000000 |
| shoulder | inversion | 1.000000000 |
| shoulder | eversion | 1.000000000 |
| elbow | flexion | 1.000000000 |
| elbow | extension | 1.000000000 |
| elbow | abduction | 1.000000000 |
| elbow | adduction | 1.000000000 |
| elbow | rotation | 1.000000005 |
| elbow | internal-rotation | 1.000000005 |
| elbow | external-rotation | 1.000000005 |
| elbow | horizontal-abduction | 1.000000000 |
| elbow | horizontal-adduction | 1.000000000 |
| elbow | elevation | 1.000000000 |
| elbow | depression | 1.000000000 |
| elbow | protraction | 1.000000000 |
| elbow | retraction | 1.000000000 |
| elbow | upward-rotation | 1.000000000 |
| elbow | downward-rotation | 1.000000000 |
| elbow | lateral-flexion | 1.000000000 |
| elbow | pronation | 1.000000005 |
| elbow | supination | 1.000000005 |
| elbow | dorsiflexion | 1.000000000 |
| elbow | plantarflexion | 1.000000000 |
| elbow | inversion | 1.000000000 |
| elbow | eversion | 1.000000000 |
| forearm | flexion | 1.000000000 |
| forearm | extension | 1.000000000 |
| forearm | abduction | 1.000000000 |
| forearm | adduction | 1.000000000 |
| forearm | rotation | 0.999999919 |
| forearm | internal-rotation | 0.999999919 |
| forearm | external-rotation | 0.999999919 |
| forearm | horizontal-abduction | 1.000000000 |
| forearm | horizontal-adduction | 1.000000000 |
| forearm | elevation | 1.000000000 |
| forearm | depression | 1.000000000 |
| forearm | protraction | 1.000000000 |
| forearm | retraction | 1.000000000 |
| forearm | upward-rotation | 1.000000000 |
| forearm | downward-rotation | 1.000000000 |
| forearm | lateral-flexion | 1.000000000 |
| forearm | pronation | 0.999999919 |
| forearm | supination | 0.999999919 |
| forearm | dorsiflexion | 1.000000000 |
| forearm | plantarflexion | 1.000000000 |
| forearm | inversion | 1.000000000 |
| forearm | eversion | 1.000000000 |
| hand | flexion | 1.000000000 |
| hand | extension | 1.000000000 |
| hand | abduction | 1.000000000 |
| hand | adduction | 1.000000000 |
| hand | rotation | 1.000000000 |
| hand | internal-rotation | 1.000000000 |
| hand | external-rotation | 1.000000000 |
| hand | horizontal-abduction | 1.000000000 |
| hand | horizontal-adduction | 1.000000000 |
| hand | elevation | 1.000000000 |
| hand | depression | 1.000000000 |
| hand | protraction | 1.000000000 |
| hand | retraction | 1.000000000 |
| hand | upward-rotation | 1.000000000 |
| hand | downward-rotation | 1.000000000 |
| hand | lateral-flexion | 1.000000000 |
| hand | pronation | 1.000000000 |
| hand | supination | 1.000000000 |
| hand | dorsiflexion | 1.000000000 |
| hand | plantarflexion | 1.000000000 |
| hand | inversion | 1.000000000 |
| hand | eversion | 1.000000000 |
| hip | flexion | 1.000000000 |
| hip | extension | 1.000000000 |
| hip | abduction | 1.000000000 |
| hip | adduction | 1.000000000 |
| hip | rotation | 0.999999968 |
| hip | internal-rotation | 0.999999968 |
| hip | external-rotation | 0.999999968 |
| hip | horizontal-abduction | 1.000000000 |
| hip | horizontal-adduction | 1.000000000 |
| hip | elevation | 1.000000000 |
| hip | depression | 1.000000000 |
| hip | protraction | 1.000000000 |
| hip | retraction | 1.000000000 |
| hip | upward-rotation | 1.000000000 |
| hip | downward-rotation | 1.000000000 |
| hip | lateral-flexion | 1.000000000 |
| hip | pronation | 0.999999968 |
| hip | supination | 0.999999968 |
| hip | dorsiflexion | 1.000000000 |
| hip | plantarflexion | 1.000000000 |
| hip | inversion | 1.000000000 |
| hip | eversion | 1.000000000 |
| knee | flexion | 1.000000000 |
| knee | extension | 1.000000000 |
| knee | abduction | 1.000000000 |
| knee | adduction | 1.000000000 |
| knee | rotation | 0.999999930 |
| knee | internal-rotation | 0.999999930 |
| knee | external-rotation | 0.999999930 |
| knee | horizontal-abduction | 1.000000000 |
| knee | horizontal-adduction | 1.000000000 |
| knee | elevation | 1.000000000 |
| knee | depression | 1.000000000 |
| knee | protraction | 1.000000000 |
| knee | retraction | 1.000000000 |
| knee | upward-rotation | 1.000000000 |
| knee | downward-rotation | 1.000000000 |
| knee | lateral-flexion | 1.000000000 |
| knee | pronation | 0.999999930 |
| knee | supination | 0.999999930 |
| knee | dorsiflexion | 1.000000000 |
| knee | plantarflexion | 1.000000000 |
| knee | inversion | 1.000000000 |
| knee | eversion | 1.000000000 |
| ankle | flexion | 1.000000000 |
| ankle | extension | 1.000000000 |
| ankle | abduction | 1.000000000 |
| ankle | adduction | 1.000000000 |
| ankle | rotation | 1.000000000 |
| ankle | internal-rotation | 1.000000000 |
| ankle | external-rotation | 1.000000000 |
| ankle | horizontal-abduction | 1.000000000 |
| ankle | horizontal-adduction | 1.000000000 |
| ankle | elevation | 1.000000000 |
| ankle | depression | 1.000000000 |
| ankle | protraction | 1.000000000 |
| ankle | retraction | 1.000000000 |
| ankle | upward-rotation | 1.000000000 |
| ankle | downward-rotation | 1.000000000 |
| ankle | lateral-flexion | 1.000000000 |
| ankle | pronation | 1.000000000 |
| ankle | supination | 1.000000000 |
| ankle | dorsiflexion | 1.000000000 |
| ankle | plantarflexion | 1.000000000 |
| ankle | inversion | 1.000000000 |
| ankle | eversion | 1.000000000 |

Full-body draft motion keys outside this regional rig: none. All topics provide the complete 19-joint body rig.
Motion aliases: {}. Arms keep ulna on elbow and radius/hand on forearm, with pronation along the forearm rather than the elbow flexion axis.

## [待核] attachment candidates

All candidates remain unapproved. `.o/.e` markers are classified by named-surface distance, with raw labels retained. Proximity fallback is explicit; no anatomical wording is approved by geometry alone.

- [待核] trapezius-descending.l origin → cervical-spine: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] trapezius-descending.l insertion → clavicle: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Descending part of trapezius muscle.ol.
- [待核] trapezius-descending.r origin → cervical-spine: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] trapezius-descending.r insertion → clavicle: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Descending part of trapezius muscle.or.
- [待核] trapezius-transverse.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] trapezius-transverse.l insertion → scapula: .o/.e mesh; pending; nodes Transverse part of trapezius muscle.ol.
- [待核] trapezius-transverse.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] trapezius-transverse.r insertion → scapula: .o/.e mesh; pending; nodes Transverse part of trapezius muscle.or.
- [待核] trapezius-ascending.l origin → thoracic-spine: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Ascending part of trapezius muscle.el.
- [待核] trapezius-ascending.l insertion → scapula: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Ascending part of trapezius muscle.ol.
- [待核] trapezius-ascending.r origin → thoracic-spine: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Ascending part of trapezius muscle.er.
- [待核] trapezius-ascending.r insertion → scapula: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Ascending part of trapezius muscle.or.
- [待核] latissimus-dorsi.l origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.el.
- [待核] latissimus-dorsi.l origin → pelvis: .o/.e mesh; pending; nodes Latissimus dorsi muscle.ol.
- [待核] latissimus-dorsi.l insertion → humerus: proximity; pending; nodes none.
- [待核] latissimus-dorsi.r origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.er.
- [待核] latissimus-dorsi.r origin → pelvis: .o/.e mesh; pending; nodes Latissimus dorsi muscle.or.
- [待核] latissimus-dorsi.r insertion → humerus: proximity; pending; nodes none.
- [待核] rhomboid-major.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] rhomboid-major.l insertion → scapula: .o/.e mesh; pending; nodes Rhomboid major muscle.el.
- [待核] rhomboid-major.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] rhomboid-major.r insertion → scapula: .o/.e mesh; pending; nodes Rhomboid major muscle.er.
- [待核] rhomboid-minor.l origin → cervical-spine: proximity; pending; nodes none.
- [待核] rhomboid-minor.l insertion → scapula: .o/.e mesh; pending; nodes Rhomboid minor muscle.el.
- [待核] rhomboid-minor.r origin → cervical-spine: proximity; pending; nodes none.
- [待核] rhomboid-minor.r insertion → scapula: .o/.e mesh; pending; nodes Rhomboid minor muscle.er.
- [待核] levator-scapulae.l origin → cervical-spine: .o/.e mesh; pending; nodes Levator scapulae.o1l.
- [待核] levator-scapulae.l origin → cervical-spine: .o/.e mesh; pending; nodes Levator scapulae.o2l.
- [待核] levator-scapulae.l origin → cervical-spine: .o/.e mesh; pending; nodes Levator scapulae.o3l.
- [待核] levator-scapulae.l origin → cervical-spine: .o/.e mesh; pending; nodes Levator scapulae.ol.
- [待核] levator-scapulae.l insertion → scapula: .o/.e mesh; pending; nodes Levator scapulae.el.
- [待核] levator-scapulae.r origin → cervical-spine: .o/.e mesh; pending; nodes Levator scapulae.o1r.
- [待核] levator-scapulae.r origin → cervical-spine: .o/.e mesh; pending; nodes Levator scapulae.o2r.
- [待核] levator-scapulae.r origin → cervical-spine: .o/.e mesh; pending; nodes Levator scapulae.o3r.
- [待核] levator-scapulae.r origin → cervical-spine: .o/.e mesh; pending; nodes Levator scapulae.or.
- [待核] levator-scapulae.r insertion → scapula: .o/.e mesh; pending; nodes Levator scapulae.er.
- [待核] teres-major.l origin → scapula: .o/.e mesh; pending; nodes Teres major muscle.ol.
- [待核] teres-major.l insertion → humerus: proximity; pending; nodes none.
- [待核] teres-major.r origin → scapula: .o/.e mesh; pending; nodes Teres major muscle.or.
- [待核] teres-major.r insertion → humerus: proximity; pending; nodes none.
- [待核] infraspinatus.l origin → scapula: .o/.e mesh; pending; nodes Infraspinatus muscle.ol.
- [待核] infraspinatus.l insertion → humerus: .o/.e mesh; pending; nodes Infraspinatus muscle.el.
- [待核] infraspinatus.r origin → scapula: .o/.e mesh; pending; nodes Infraspinatus muscle.or.
- [待核] infraspinatus.r insertion → humerus: .o/.e mesh; pending; nodes Infraspinatus muscle.er.
- [待核] teres-minor.l origin → scapula: .o/.e mesh; pending; nodes Teres minor muscle.ol.
- [待核] teres-minor.l insertion → humerus: .o/.e mesh; pending; nodes Teres minor muscle.el.
- [待核] teres-minor.r origin → scapula: .o/.e mesh; pending; nodes Teres minor muscle.or.
- [待核] teres-minor.r insertion → humerus: .o/.e mesh; pending; nodes Teres minor muscle.er.
- [待核] serratus-posterior-inferior.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] serratus-posterior-inferior.l origin → lumbar-spine: proximity; pending; nodes none.
- [待核] serratus-posterior-inferior.l insertion → ribs: proximity; pending; nodes none.
- [待核] serratus-posterior-inferior.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] serratus-posterior-inferior.r origin → lumbar-spine: proximity; pending; nodes none.
- [待核] serratus-posterior-inferior.r insertion → ribs: .o/.e mesh; pending; nodes Serratus posterior inferior muscle.e1l.
- [待核] serratus-posterior-inferior.r insertion → ribs: .o/.e mesh; pending; nodes Serratus posterior inferior muscle.e2l.
- [待核] serratus-posterior-inferior.r insertion → ribs: .o/.e mesh; pending; nodes Serratus posterior inferior muscle.e3l.
- [待核] serratus-posterior-inferior.r insertion → ribs: .o/.e mesh; pending; nodes Serratus posterior inferior muscle.el.
- [待核] iliocostalis-lumborum.l origin → pelvis: proximity; pending; nodes none.
- [待核] iliocostalis-lumborum.l origin → pelvis: proximity; pending; nodes none.
- [待核] iliocostalis-lumborum.l insertion → ribs: proximity; pending; nodes none.
- [待核] iliocostalis-lumborum.r origin → pelvis: proximity; pending; nodes none.
- [待核] iliocostalis-lumborum.r origin → pelvis: proximity; pending; nodes none.
- [待核] iliocostalis-lumborum.r insertion → ribs: proximity; pending; nodes none.
- [待核] iliocostalis-thoracis.l origin → ribs: proximity; pending; nodes none.
- [待核] iliocostalis-thoracis.l insertion → ribs: proximity; pending; nodes none.
- [待核] iliocostalis-thoracis.r origin → ribs: proximity; pending; nodes none.
- [待核] iliocostalis-thoracis.r insertion → ribs: proximity; pending; nodes none.
- [待核] longissimus-thoracis.l origin → pelvis: proximity; pending; nodes none.
- [待核] longissimus-thoracis.l origin → pelvis: proximity; pending; nodes none.
- [待核] longissimus-thoracis.l origin → lumbar-spine: proximity; pending; nodes none.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e10l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e11l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e12l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e13l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e14l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e15l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e16l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e17l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e18l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e19l.
- [待核] longissimus-thoracis.l insertion → lumbar-spine: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Longissimus thoracis muscle.e1l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e20l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e21l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e22l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e23l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e24l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e25l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e26l.
- [待核] longissimus-thoracis.l insertion → lumbar-spine: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Longissimus thoracis muscle.e2l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e3l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e4l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e5l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e6l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e7l.
- [待核] longissimus-thoracis.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e8l.
- [待核] longissimus-thoracis.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e9l.
- [待核] longissimus-thoracis.l insertion → lumbar-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.el.
- [待核] longissimus-thoracis.r origin → pelvis: proximity; pending; nodes none.
- [待核] longissimus-thoracis.r origin → pelvis: proximity; pending; nodes none.
- [待核] longissimus-thoracis.r origin → lumbar-spine: proximity; pending; nodes none.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e10r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e11r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e12r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e13r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e14r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e15r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e16r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e17r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e18r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e19r.
- [待核] longissimus-thoracis.r insertion → lumbar-spine: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Longissimus thoracis muscle.e1r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e20r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e21r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e22r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e23r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e24r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e25r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e26r.
- [待核] longissimus-thoracis.r insertion → lumbar-spine: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Longissimus thoracis muscle.e2r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e3r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e4r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e5r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e6r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e7r.
- [待核] longissimus-thoracis.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e8r.
- [待核] longissimus-thoracis.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e9r.
- [待核] longissimus-thoracis.r insertion → lumbar-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.er.
- [待核] spinalis-thoracis.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] spinalis-thoracis.l origin → lumbar-spine: proximity; pending; nodes none.
- [待核] spinalis-thoracis.l insertion → thoracic-spine: proximity; pending; nodes none.
- [待核] spinalis-thoracis.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] spinalis-thoracis.r origin → lumbar-spine: proximity; pending; nodes none.
- [待核] spinalis-thoracis.r insertion → thoracic-spine: proximity; pending; nodes none.
- [待核] deltoid-posterior.l origin → scapula: .o/.e mesh; pending; nodes Scapular spinal part of deltoid muscle.ol.
- [待核] deltoid-posterior.l insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.el.
- [待核] deltoid-posterior.r origin → scapula: .o/.e mesh; pending; nodes Scapular spinal part of deltoid muscle.or.
- [待核] deltoid-posterior.r insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.er.
- [待核] triceps-brachii.l origin → humerus: .o/.e mesh; pending; nodes Lateral head of triceps brachii.ol.
- [待核] triceps-brachii.l origin → scapula: .o/.e mesh; pending; nodes Long head of triceps brachii.ol.
- [待核] triceps-brachii.l origin → humerus: .o/.e mesh; pending; nodes Medial head of triceps brachii.ol.
- [待核] triceps-brachii.l insertion → ulna: .o/.e mesh; pending; nodes Triceps brachii muscle.el.
- [待核] triceps-brachii.r origin → humerus: .o/.e mesh; pending; nodes Lateral head of triceps brachii.or.
- [待核] triceps-brachii.r origin → scapula: .o/.e mesh; pending; nodes Long head of triceps brachii.or.
- [待核] triceps-brachii.r origin → humerus: .o/.e mesh; pending; nodes Medial head of triceps brachii.or.
- [待核] triceps-brachii.r insertion → ulna: .o/.e mesh; pending; nodes Triceps brachii muscle.er.
- [待核] gluteus-maximus.l origin → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Gluteus maximus muscle.ol.
- [待核] gluteus-maximus.l insertion → femur: .o/.e mesh; pending; nodes Gluteus maximus muscle.el.
- [待核] gluteus-maximus.r origin → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Gluteus maximus muscle.or.
- [待核] gluteus-maximus.r insertion → femur: .o/.e mesh; pending; nodes Gluteus maximus muscle.er.
- [待核] external-oblique.l origin → ribs: .o/.e mesh; pending; nodes External abdominal oblique muscle.o1l.
- [待核] external-oblique.l origin → ribs: .o/.e mesh; pending; nodes External abdominal oblique muscle.o2l.
- [待核] external-oblique.l origin → ribs: .o/.e mesh; pending; nodes External abdominal oblique muscle.o3l.
- [待核] external-oblique.l origin → ribs: .o/.e mesh; pending; nodes External abdominal oblique muscle.ol.
- [待核] external-oblique.l insertion → pelvis: .o/.e mesh; pending; nodes External abdominal oblique muscle.o4l.
- [待核] external-oblique.l insertion → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes External abdominal oblique muscle.o5l.
- [待核] external-oblique.r origin → ribs: .o/.e mesh; pending; nodes External abdominal oblique muscle.o1r.
- [待核] external-oblique.r origin → ribs: .o/.e mesh; pending; nodes External abdominal oblique muscle.o2r.
- [待核] external-oblique.r origin → ribs: .o/.e mesh; pending; nodes External abdominal oblique muscle.o3r.
- [待核] external-oblique.r origin → ribs: .o/.e mesh; pending; nodes External abdominal oblique muscle.or.
- [待核] external-oblique.r insertion → pelvis: .o/.e mesh; pending; nodes External abdominal oblique muscle.o4r.
- [待核] external-oblique.r insertion → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes External abdominal oblique muscle.o5r.
- [待核] biceps-brachii.l origin → scapula: .o/.e mesh; pending; nodes Long head of biceps brachii.ol.
- [待核] biceps-brachii.l insertion → radius: .o/.e mesh; pending; nodes Biceps brachii muscle.el.
- [待核] biceps-brachii.r origin → scapula: .o/.e mesh; pending; nodes Long head of biceps brachii.or.
- [待核] biceps-brachii.r origin → scapula: .o/.e mesh; pending; nodes Short head of biceps brachii.ol.
- [待核] biceps-brachii.r insertion → radius: .o/.e mesh; pending; nodes Biceps brachii muscle.er.
- [待核] brachialis.l origin → humerus: .o/.e mesh; pending; nodes Brachialis muscle.ol.
- [待核] brachialis.l insertion → ulna: .o/.e mesh; pending; nodes Brachialis muscle.el.
- [待核] brachialis.r origin → humerus: .o/.e mesh; pending; nodes Brachialis muscle.or.
- [待核] brachialis.r insertion → ulna: .o/.e mesh; pending; nodes Brachialis muscle.er.
- [待核] brachioradialis.l origin → humerus: .o/.e mesh; pending; nodes Brachioradialis muscle.ol.
- [待核] brachioradialis.l insertion → radius: .o/.e mesh; pending; nodes Brachioradialis muscle.el.
- [待核] brachioradialis.r origin → humerus: .o/.e mesh; pending; nodes Brachioradialis muscle.or.
- [待核] brachioradialis.r insertion → radius: .o/.e mesh; pending; nodes Brachioradialis muscle.er.
- [待核] deltoid-anterior.l origin → clavicle: .o/.e mesh; pending; nodes Clavicular part of deltoid muscle.ol.
- [待核] deltoid-anterior.l insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.el.
- [待核] deltoid-anterior.r origin → clavicle: .o/.e mesh; pending; nodes Clavicular part of deltoid muscle.or.
- [待核] deltoid-anterior.r insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.er.
- [待核] serratus-anterior.l origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e2r.
- [待核] serratus-anterior.l origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e3l.
- [待核] serratus-anterior.l origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e4l.
- [待核] serratus-anterior.l origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e5l.
- [待核] serratus-anterior.l origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e6l.
- [待核] serratus-anterior.l origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e7l.
- [待核] serratus-anterior.l origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.el.
- [待核] serratus-anterior.l insertion → scapula: .o/.e mesh; pending; nodes Serratus anterior muscle.ol.
- [待核] serratus-anterior.r origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e1l.
- [待核] serratus-anterior.r origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e2l.
- [待核] serratus-anterior.r origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e3r.
- [待核] serratus-anterior.r origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e4r.
- [待核] serratus-anterior.r origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e5r.
- [待核] serratus-anterior.r origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e6r.
- [待核] serratus-anterior.r origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e7r.
- [待核] serratus-anterior.r origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.e8l.
- [待核] serratus-anterior.r origin → ribs: .o/.e mesh; pending; nodes Serratus anterior muscle.er.
- [待核] serratus-anterior.r insertion → scapula: .o/.e mesh; pending; nodes Serratus anterior muscle.or.

## Automatic warnings

- trapezius-descending.l origin: no 2 mm contact; nearest 32.85 mm
- trapezius-descending.r origin: no 2 mm contact; nearest 32.85 mm
- biceps-brachii.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- biceps-brachii.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- external-oblique.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- latissimus-dorsi.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- longissimus-thoracis.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- longissimus-thoracis.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- serratus-anterior.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- serratus-anterior.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.

## Automatic result

All decoded surface error, topology, attribute, joint, coordinate and output budget gates passed. Anatomical attachment review remains pending.

## Published skin-weight audit

Decoded published GLB SHA-256: `7c087f4f9575bc74ff5f4562b3a00083e0b6155aaffa90711a9da05029421963`.

Shares sum decoded weights over referenced vertices, including UV/normal seams. Required alternatives are joints bordering the manifest attachment bones; allowed joints include intervening joints in the rig parent chain (e.g. shoulder between scapula and elbow). Radius uses elbow unless the rig provides a separate pronation joint. Missing attachment weights, unrelated joints above 30%, reversed fibre fields and violated persistent endpoint overrides and local weight outliers fail this gate. Outliers compare welded 1–2-ring dominant joints and area-weighted vectors; a discrepant vector must be over twice the neighbours’ median dominant-joint distance. Sub-edge detached scraps use nearby substantial surface rings because their component-local endpoint seeds are artificial; >1% discrepant weight mass on those scraps also fails. Smooth joint crossovers are excluded. Fixed counts refer to unique welded bind vertices.

skin-wire: all 19 full-body joints weighted; 0 shell mismatch flags. Right-axis exact mirror checks passed.

| Muscle | Joint shares | Required attachment joints | Fibre endpoints | Outliers remaining / fixed | Result |
|---|---|---|---|---|---|
| biceps-brachii.l | elbow.l 41.64%, shoulder.l 29.13%, forearm.l 16.26%, scapula.l 12.96% | forearm.l / hand.l, scapula.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| biceps-brachii.r | elbow.r 40.62%, shoulder.r 28.66%, forearm.r 16.96%, scapula.r 13.76% | forearm.r / hand.r, scapula.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| brachialis.l | shoulder.l 74.95%, elbow.l 25.05% | elbow.l / forearm.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| brachialis.r | shoulder.r 73.62%, elbow.r 26.38% | elbow.r / forearm.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| brachioradialis.l | elbow.l 51.73%, shoulder.l 32.37%, forearm.l 15.91% | forearm.l / hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| brachioradialis.r | elbow.r 51.26%, shoulder.r 32.57%, forearm.r 16.17% | forearm.r / hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| deltoid-anterior.l | scapula.l 43.00%, clavicle.l 42.06%, shoulder.l 14.94% | clavicle.l / scapula.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| deltoid-anterior.r | scapula.r 43.05%, clavicle.r 41.84%, shoulder.r 15.12% | clavicle.r / scapula.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| deltoid-posterior.l | scapula.l 55.33%, shoulder.l 44.67% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| deltoid-posterior.r | scapula.r 55.82%, shoulder.r 44.18% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| external-oblique.l | trunk 100.00% | hip.l / trunk | origin → insertion | 0 / 0 | clean |
| external-oblique.r | trunk 100.00% | hip.r / trunk | origin → insertion | 0 / 0 | clean |
| gluteus-maximus.l | trunk 51.64%, hip.l 48.36% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| gluteus-maximus.r | trunk 51.81%, hip.r 48.19% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| iliocostalis-lumborum.l | trunk 100.00% | hip.l / trunk | origin → insertion | 0 / 0 | clean |
| iliocostalis-lumborum.r | trunk 100.00% | hip.r / trunk | origin → insertion | 0 / 0 | clean |
| iliocostalis-thoracis.l | trunk 100.00% | trunk | persistent bounds endpoints | 0 / 0 | clean |
| iliocostalis-thoracis.r | trunk 100.00% | trunk | persistent bounds endpoints | 0 / 0 | clean |
| infraspinatus.l | scapula.l 71.41%, shoulder.l 28.59% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| infraspinatus.r | scapula.r 72.50%, shoulder.r 27.50% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| latissimus-dorsi.l | trunk 65.16%, shoulder.l 34.84% | elbow.l / shoulder.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| latissimus-dorsi.r | trunk 65.75%, shoulder.r 34.25% | elbow.r / shoulder.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| levator-scapulae.l | trunk 35.75%, scapula.l 33.38%, clavicle.l 30.87% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| levator-scapulae.r | trunk 35.59%, scapula.r 34.11%, clavicle.r 30.30% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| longissimus-thoracis.l | trunk 100.00% | hip.l / trunk | origin → insertion | 0 / 0 | clean |
| longissimus-thoracis.r | trunk 100.00% | hip.r / trunk | origin → insertion | 0 / 0 | clean |
| rhomboid-major.l | trunk 39.47%, clavicle.l 30.45%, scapula.l 30.09% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| rhomboid-major.r | trunk 39.46%, clavicle.r 30.67%, scapula.r 29.88% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| rhomboid-minor.l | clavicle.l 43.56%, scapula.l 32.81%, trunk 23.62% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| rhomboid-minor.r | clavicle.r 43.92%, scapula.r 33.83%, trunk 22.25% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| serratus-anterior.l | clavicle.l 41.59%, trunk 38.26%, scapula.l 20.15% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 6 | clean |
| serratus-anterior.r | trunk 45.17%, clavicle.r 35.93%, scapula.r 18.90% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| serratus-posterior-inferior.l | trunk 100.00% | trunk | origin → insertion | 0 / 0 | clean |
| serratus-posterior-inferior.r | trunk 100.00% | trunk | origin → insertion | 0 / 0 | clean |
| spinalis-thoracis.l | trunk 100.00% | trunk | persistent bounds endpoints | 0 / 0 | clean |
| spinalis-thoracis.r | trunk 100.00% | trunk | persistent bounds endpoints | 0 / 0 | clean |
| teres-major.l | shoulder.l 50.29%, scapula.l 49.71% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| teres-major.r | shoulder.r 51.11%, scapula.r 48.89% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| teres-minor.l | scapula.l 60.41%, shoulder.l 39.59% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| teres-minor.r | scapula.r 59.89%, shoulder.r 40.11% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| trapezius-ascending.l | clavicle.l 54.03%, scapula.l 25.23%, trunk 20.74% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| trapezius-ascending.r | clavicle.r 54.32%, scapula.r 23.71%, trunk 21.97% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| trapezius-descending.l | trunk 76.94%, clavicle.l 23.06% | clavicle.l / scapula.l, trunk | persistent bounds endpoints | 0 / 0 | clean |
| trapezius-descending.r | trunk 77.41%, clavicle.r 22.59% | clavicle.r / scapula.r, trunk | persistent bounds endpoints | 0 / 0 | clean |
| trapezius-transverse.l | trunk 53.12%, clavicle.l 26.42%, scapula.l 20.45% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| trapezius-transverse.r | trunk 53.79%, clavicle.r 26.27%, scapula.r 19.94% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| triceps-brachii.l | shoulder.l 66.59%, elbow.l 22.76%, scapula.l 10.65% | elbow.l / forearm.l, scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| triceps-brachii.r | shoulder.r 65.23%, elbow.r 24.55%, scapula.r 10.22% | elbow.r / forearm.r, scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |

Skin nodes: `skin-outline, skin-hand.l, skin-hand.r, skin-wire`. Both hand nodes are rigidly bound to their named hand joint. Wrist half-space checks pass at 5 mm distal to the styloid midpoint; wrist openings are intentionally open.


| Other mesh | Outliers remaining / fixed |
|---|---|
| clavicle.l | 0 / 0 |
| clavicle.r | 0 / 0 |
| humerus.l | 0 / 0 |
| humerus.r | 0 / 0 |
| lumbar-spine | 0 / 0 |
| pelvis | 0 / 0 |
| scapula.l | 0 / 0 |
| scapula.r | 0 / 0 |
| skin-hand.l | 0 / 0 |
| skin-hand.r | 0 / 0 |
| skin-outline | 0 / 2 |
| skin-wire | 0 / 26 |
| thoracic-spine | 0 / 0 |
| thorax | 0 / 0 |

Audit result: **clean** (48 muscle nodes; 0 outliers remaining, 34 fixed).
