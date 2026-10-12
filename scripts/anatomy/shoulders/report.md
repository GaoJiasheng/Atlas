# Shoulders mesh review

Final GLB: **2,231,780 bytes**, **156,803 triangles**, **68 total nodes** (48 meshes, 19 joints, rig root).
Draw-call estimate: **48** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.

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

Native wire: 3933 triangles; the table below reports actual decoded triangles after degenerate cleanup. The schematic has a separate 35 mm sampled surface ceiling; opaque skin retains its 3 mm gate. Split skin coverage is checked as the union of body and both hands, and each part is checked against the full original source. Intentional wrist boundaries are allowed.

Budgets: soft 4,000,000 bytes / 350,000 triangles; hard 8,000,000 bytes / 500,000 triangles. Both soft limits pass for this output.


Display muscle and bone selections retain their reviewed topic scope. The mannequin uses full-body joints even where corresponding display bones are absent. No hand/foot intrinsic muscle geometry is fabricated.

## Final decoded surface audit

Sampled surface deviation: referenced vertices (approximately 3,000) plus 6,000 area-weighted interior points in each direction for whole meshes; split skin parts use final-to-whole-source distances plus a symmetric union coverage gate. This estimates surface error rather than certifying a global maximum. Source boundaries are preserved; nonmanifold/open sources retain disabled section filling.

| Mesh | Role | Source triangles | Final triangles | Deviation mm | Budget mm | Closed before → after | Boundary edges |
|---|---|---:|---:|---:|---:|---|---:|
| biceps-brachii-long.l | neighbour | 3,218 | 1,498 | 0.469 | 1.5 | True → True | 0 |
| biceps-brachii-long.r | neighbour | 3,218 | 1,498 | 0.470 | 1.5 | True → True | 0 |
| cervical-spine | bone | 15,712 | 6,000 | 0.474 | 1.0 | True → True | 0 |
| clavicle.l | bone | 1,550 | 1,500 | 0.006 | 1.0 | True → True | 0 |
| clavicle.r | bone | 1,550 | 1,500 | 0.003 | 1.0 | True → True | 0 |
| deltoid-anterior.l | region | 2,902 | 2,902 | 0.002 | 0.5 | True → True | 0 |
| deltoid-anterior.r | region | 2,902 | 2,902 | 0.002 | 0.5 | True → True | 0 |
| deltoid-lateral.l | region | 2,964 | 2,964 | 0.002 | 0.5 | True → True | 0 |
| deltoid-lateral.r | region | 2,964 | 2,964 | 0.002 | 0.5 | True → True | 0 |
| deltoid-posterior.l | region | 4,378 | 3,998 | 0.162 | 0.5 | True → False | 0 |
| deltoid-posterior.r | region | 4,378 | 3,998 | 0.151 | 0.5 | True → False | 0 |
| forearm.l | bone | 1,688 | 1,688 | 0.003 | 1.0 | True → True | 0 |
| forearm.r | bone | 1,688 | 1,688 | 0.004 | 1.0 | True → True | 0 |
| humerus.l | bone | 4,280 | 4,000 | 0.072 | 1.0 | False → False | 4 |
| humerus.r | bone | 4,280 | 4,000 | 0.074 | 1.0 | False → False | 4 |
| infraspinatus.l | region | 3,166 | 3,166 | 0.002 | 0.5 | True → True | 0 |
| infraspinatus.r | region | 3,166 | 3,166 | 0.002 | 0.5 | True → True | 0 |
| latissimus-dorsi.l | neighbour | 21,580 | 2,024 | 1.479 | 1.5 | True → True | 0 |
| latissimus-dorsi.r | neighbour | 21,580 | 2,036 | 1.340 | 1.5 | True → True | 0 |
| pectoralis-major-clavicular.l | neighbour | 850 | 850 | 0.002 | 1.5 | True → True | 0 |
| pectoralis-major-clavicular.r | neighbour | 850 | 850 | 0.002 | 1.5 | True → True | 0 |
| pectoralis-major-sternocostal.l | neighbour | 3,222 | 1,492 | 1.219 | 1.5 | True → True | 0 |
| pectoralis-major-sternocostal.r | neighbour | 3,222 | 1,490 | 1.219 | 1.5 | True → True | 0 |
| rhomboid-major.l | neighbour | 4,800 | 1,494 | 0.679 | 1.5 | True → True | 0 |
| rhomboid-major.r | neighbour | 4,800 | 1,494 | 0.679 | 1.5 | True → True | 0 |
| scapula.l | bone | 25,326 | 3,996 | 0.262 | 1.0 | False → True | 0 |
| scapula.r | bone | 25,326 | 4,000 | 0.227 | 1.0 | False → True | 0 |
| serratus-anterior.l | neighbour | 25,240 | 1,930 | 1.233 | 1.5 | True → False | 0 |
| serratus-anterior.r | neighbour | 25,240 | 2,008 | 1.479 | 1.5 | True → False | 0 |
| skin-hand.l | skin | 100,818 | 1,845 | 1.483 | 3.0 | False → False | 83 |
| skin-hand.r | skin | 100,818 | 2,138 | 1.393 | 3.0 | False → False | 88 |
| skin-outline | skin | 100,818 | 28,182 | 1.364 | 3.0 | False → False | 343 |
| skin-wire | skin | 100,818 | 3,444 | 10.998 | 35.0 | False → False | 454 |
| subscapularis.l | region | 2,954 | 2,954 | 0.001 | 0.5 | True → True | 0 |
| subscapularis.r | region | 2,954 | 2,954 | 0.001 | 0.5 | True → True | 0 |
| supraspinatus.l | region | 1,430 | 1,430 | 0.002 | 0.5 | True → True | 0 |
| supraspinatus.r | region | 1,430 | 1,430 | 0.002 | 0.5 | True → True | 0 |
| teres-major.l | region | 1,154 | 1,154 | 0.001 | 0.5 | True → True | 0 |
| teres-major.r | region | 1,154 | 1,154 | 0.001 | 0.5 | True → True | 0 |
| teres-minor.l | region | 1,522 | 1,522 | 0.001 | 0.5 | True → True | 0 |
| teres-minor.r | region | 1,522 | 1,522 | 0.002 | 0.5 | True → True | 0 |
| thorax | bone | 274,709 | 24,992 | 0.511 | 1.0 | False → False | 9 |
| trapezius-descending.l | neighbour | 6,760 | 1,494 | 1.102 | 1.5 | True → True | 0 |
| trapezius-descending.r | neighbour | 6,760 | 1,498 | 1.292 | 1.5 | True → True | 0 |
| trapezius-transverse.l | neighbour | 2,992 | 1,496 | 0.865 | 1.5 | True → True | 0 |
| trapezius-transverse.r | neighbour | 2,992 | 1,498 | 0.865 | 1.5 | True → False | 0 |
| triceps-brachii.l | neighbour | 10,264 | 1,500 | 1.201 | 1.5 | True → False | 0 |
| triceps-brachii.r | neighbour | 10,264 | 1,500 | 1.051 | 1.5 | True → True | 0 |

## Workbench previews

Studio lighting, paper #EDE7D6, orthographic evaluated non-skin bounds with 5% margin; shell composite at 30%. Superficial/intermediate layers move out 0.12/0.06 m; bones and neighbours remain fixed.

- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-exploded-by-layer.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-skin.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-wire-rest.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-pose.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-pose-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-pose-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-pose-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-pose-anatomy.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-wire-pose.png`

Right angle convention: positive inputs; right axes signed by the engine mirrorSignedAxes rule. Positive inputs use the current engine’s mirrorSignedAxes rule with the real left/right joint midline normal; stored metadata remains the exact X-only axis reflection.
Pose inputs: {'shoulder.l.flexion': 90, 'elbow.r.flexion': 90, 'hip.l.flexion': 60, 'knee.r.flexion': 90, 'ankle.l.dorsiflexion': 15, 'ankle.r.dorsiflexion': 15}; humerus.l centroid displacement 0.198868 m. All evaluated coordinates and muscle-edge stretches are finite.
Visual inspection results are recorded in `preview-review.md` after viewing every PNG.

## Frame and rig

Metres; Y up; front +Z; own left +X. Source region centre [0.0, -0.0012775821378454566, 1.410085678100586]; floorY -1.410468 m. Add −floorY for grounded full-body display.
Unexported reference bones locate joints and attachment candidates without adding out-of-region display bones. Hand joints pivot at wrist styloid midpoints; grip offsets are 0.08 m along the distal hand direction.

| Joint | Position X/Y/Z m | Parent | Evidence |
|---|---|---|---|
| trunk | 0.00000, 0.00000, -0.00000 | None | region frame |
| clavicle.l | 0.01669, -0.00899, 0.03347 | trunk | medial clavicle / sternoclavicular joint |
| scapula.l | 0.14956, 0.00710, -0.03700 | clavicle.l | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.l | 0.17262, -0.02359, -0.02712 | scapula.l | humeral head sphere fit; .i/.j landmark patch |
| elbow.l | 0.22319, -0.29937, -0.04129 | shoulder.l | midpoint of humeral epicondyle .i/.j cubes |
| forearm.l | 0.22319, -0.29937, -0.04129 | elbow.l | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.l | 0.26462, -0.56460, 0.01293 | forearm.l | midpoint of radial/ulnar styloid cubes |
| hip.l | 0.08529, -0.53906, -0.01625 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.l | 0.07621, -0.95414, -0.03437 | hip.l | midpoint of femoral epicondyle .i/.j cubes |
| ankle.l | 0.08182, -1.33078, -0.04474 | knee.l | midpoint of medial/lateral malleolar landmarks |
| clavicle.r | -0.01669, -0.00899, 0.03347 | trunk | medial clavicle / sternoclavicular joint |
| scapula.r | -0.14956, 0.00710, -0.03700 | clavicle.r | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.r | -0.17262, -0.02359, -0.02712 | scapula.r | humeral head sphere fit; .i/.j landmark patch |
| elbow.r | -0.22319, -0.29937, -0.04129 | shoulder.r | midpoint of humeral epicondyle .i/.j cubes |
| forearm.r | -0.22319, -0.29937, -0.04129 | elbow.r | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.r | -0.26464, -0.56460, 0.01293 | forearm.r | midpoint of radial/ulnar styloid cubes |
| hip.r | -0.08529, -0.53906, -0.01625 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.r | -0.07621, -0.95414, -0.03437 | hip.r | midpoint of femoral epicondyle .i/.j cubes |
| ankle.r | -0.07861, -1.33088, -0.04468 | knee.r | midpoint of medial/lateral malleolar landmarks |

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
| forearm | rotation | 0.999999927 |
| forearm | internal-rotation | 0.999999927 |
| forearm | external-rotation | 0.999999927 |
| forearm | horizontal-abduction | 1.000000000 |
| forearm | horizontal-adduction | 1.000000000 |
| forearm | elevation | 1.000000000 |
| forearm | depression | 1.000000000 |
| forearm | protraction | 1.000000000 |
| forearm | retraction | 1.000000000 |
| forearm | upward-rotation | 1.000000000 |
| forearm | downward-rotation | 1.000000000 |
| forearm | lateral-flexion | 1.000000000 |
| forearm | pronation | 0.999999927 |
| forearm | supination | 0.999999927 |
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
| knee | rotation | 0.999999928 |
| knee | internal-rotation | 0.999999928 |
| knee | external-rotation | 0.999999928 |
| knee | horizontal-abduction | 1.000000000 |
| knee | horizontal-adduction | 1.000000000 |
| knee | elevation | 1.000000000 |
| knee | depression | 1.000000000 |
| knee | protraction | 1.000000000 |
| knee | retraction | 1.000000000 |
| knee | upward-rotation | 1.000000000 |
| knee | downward-rotation | 1.000000000 |
| knee | lateral-flexion | 1.000000000 |
| knee | pronation | 0.999999928 |
| knee | supination | 0.999999928 |
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

- [待核] deltoid-anterior.l origin → clavicle: .o/.e mesh; pending; nodes Clavicular part of deltoid muscle.ol.
- [待核] deltoid-anterior.l insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.el.
- [待核] deltoid-anterior.r origin → clavicle: .o/.e mesh; pending; nodes Clavicular part of deltoid muscle.or.
- [待核] deltoid-anterior.r insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.er.
- [待核] deltoid-lateral.l origin → scapula: .o/.e mesh; pending; nodes Acromial part of deltoid muscle.ol.
- [待核] deltoid-lateral.l insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.el.
- [待核] deltoid-lateral.r origin → scapula: .o/.e mesh; pending; nodes Acromial part of deltoid muscle.or.
- [待核] deltoid-lateral.r insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.er.
- [待核] deltoid-posterior.l origin → scapula: .o/.e mesh; pending; nodes Scapular spinal part of deltoid muscle.ol.
- [待核] deltoid-posterior.l insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.el.
- [待核] deltoid-posterior.r origin → scapula: .o/.e mesh; pending; nodes Scapular spinal part of deltoid muscle.or.
- [待核] deltoid-posterior.r insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.er.
- [待核] infraspinatus.l origin → scapula: .o/.e mesh; pending; nodes Infraspinatus muscle.ol.
- [待核] infraspinatus.l insertion → humerus: .o/.e mesh; pending; nodes Infraspinatus muscle.el.
- [待核] infraspinatus.r origin → scapula: .o/.e mesh; pending; nodes Infraspinatus muscle.or.
- [待核] infraspinatus.r insertion → humerus: .o/.e mesh; pending; nodes Infraspinatus muscle.er.
- [待核] teres-minor.l origin → scapula: .o/.e mesh; pending; nodes Teres minor muscle.ol.
- [待核] teres-minor.l insertion → humerus: .o/.e mesh; pending; nodes Teres minor muscle.el.
- [待核] teres-minor.r origin → scapula: .o/.e mesh; pending; nodes Teres minor muscle.or.
- [待核] teres-minor.r insertion → humerus: .o/.e mesh; pending; nodes Teres minor muscle.er.
- [待核] teres-major.l origin → scapula: .o/.e mesh; pending; nodes Teres major muscle.ol.
- [待核] teres-major.l insertion → humerus: proximity; pending; nodes none.
- [待核] teres-major.r origin → scapula: .o/.e mesh; pending; nodes Teres major muscle.or.
- [待核] teres-major.r insertion → humerus: proximity; pending; nodes none.
- [待核] supraspinatus.l origin → scapula: .o/.e mesh; pending; nodes Supraspinatus muscle.ol.
- [待核] supraspinatus.l insertion → humerus: .o/.e mesh; pending; nodes Supraspinatus muscle.el.
- [待核] supraspinatus.r origin → scapula: .o/.e mesh; pending; nodes Supraspinatus muscle.or.
- [待核] supraspinatus.r insertion → humerus: .o/.e mesh; pending; nodes Supraspinatus muscle.er.
- [待核] subscapularis.l origin → scapula: .o/.e mesh; pending; nodes Subscapularis muscle.ol.
- [待核] subscapularis.l insertion → humerus: .o/.e mesh; pending; nodes Subscapularis muscle.el.
- [待核] subscapularis.r origin → scapula: .o/.e mesh; pending; nodes Subscapularis muscle.or.
- [待核] subscapularis.r insertion → humerus: .o/.e mesh; pending; nodes Subscapularis muscle.er.
- [待核] trapezius-descending.l origin → cervical-spine: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] trapezius-descending.l insertion → clavicle: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Descending part of trapezius muscle.ol.
- [待核] trapezius-descending.r origin → cervical-spine: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] trapezius-descending.r insertion → clavicle: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Descending part of trapezius muscle.or.
- [待核] pectoralis-major-clavicular.l origin → clavicle: .o/.e mesh; pending; nodes Pectoralis major muscle.ol.
- [待核] pectoralis-major-clavicular.l insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.el.
- [待核] pectoralis-major-clavicular.r origin → clavicle: .o/.e mesh; pending; nodes Pectoralis major muscle.or.
- [待核] pectoralis-major-clavicular.r insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.er.
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
- [待核] biceps-brachii-long.l origin → scapula: .o/.e mesh; pending; nodes Long head of biceps brachii.ol.
- [待核] biceps-brachii-long.l insertion → forearm: .o/.e mesh; pending; nodes Biceps brachii muscle.el.
- [待核] biceps-brachii-long.r origin → scapula: .o/.e mesh; pending; nodes Long head of biceps brachii.or.
- [待核] biceps-brachii-long.r insertion → forearm: .o/.e mesh; pending; nodes Biceps brachii muscle.er.
- [待核] latissimus-dorsi.l origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.el.
- [待核] latissimus-dorsi.l origin → pelvis: .o/.e mesh; pending; nodes Latissimus dorsi muscle.ol.
- [待核] latissimus-dorsi.l insertion → humerus: proximity; pending; nodes none.
- [待核] latissimus-dorsi.r origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.er.
- [待核] latissimus-dorsi.r origin → pelvis: .o/.e mesh; pending; nodes Latissimus dorsi muscle.or.
- [待核] latissimus-dorsi.r insertion → humerus: proximity; pending; nodes none.
- [待核] pectoralis-major-sternocostal.l origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Pectoralis major muscle.ol.
- [待核] pectoralis-major-sternocostal.l origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Sternocostal head of pectoralis major muscle.e1l.
- [待核] pectoralis-major-sternocostal.l origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Sternocostal head of pectoralis major muscle.e2l.
- [待核] pectoralis-major-sternocostal.l origin → ribs: .o/.e mesh; pending; nodes Sternocostal head of pectoralis major muscle.el.
- [待核] pectoralis-major-sternocostal.l insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.el.
- [待核] pectoralis-major-sternocostal.r origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Pectoralis major muscle.or.
- [待核] pectoralis-major-sternocostal.r origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Sternocostal head of pectoralis major muscle.e1r.
- [待核] pectoralis-major-sternocostal.r origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Sternocostal head of pectoralis major muscle.e2r.
- [待核] pectoralis-major-sternocostal.r origin → ribs: .o/.e mesh; pending; nodes Sternocostal head of pectoralis major muscle.er.
- [待核] pectoralis-major-sternocostal.r insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.er.
- [待核] rhomboid-major.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] rhomboid-major.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] rhomboid-major.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] rhomboid-major.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] rhomboid-major.l insertion → scapula: .o/.e mesh; pending; nodes Rhomboid major muscle.el.
- [待核] rhomboid-major.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] rhomboid-major.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] rhomboid-major.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] rhomboid-major.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] rhomboid-major.r insertion → scapula: .o/.e mesh; pending; nodes Rhomboid major muscle.er.
- [待核] trapezius-transverse.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] trapezius-transverse.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] trapezius-transverse.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] trapezius-transverse.l insertion → scapula: .o/.e mesh; pending; nodes Transverse part of trapezius muscle.ol.
- [待核] trapezius-transverse.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] trapezius-transverse.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] trapezius-transverse.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] trapezius-transverse.r insertion → scapula: .o/.e mesh; pending; nodes Transverse part of trapezius muscle.or.
- [待核] triceps-brachii.l origin → humerus: .o/.e mesh; pending; nodes Lateral head of triceps brachii.ol.
- [待核] triceps-brachii.l origin → scapula: .o/.e mesh; pending; nodes Long head of triceps brachii.ol.
- [待核] triceps-brachii.l origin → humerus: .o/.e mesh; pending; nodes Medial head of triceps brachii.ol.
- [待核] triceps-brachii.l insertion → ulna: .o/.e mesh; pending; nodes Triceps brachii muscle.el.
- [待核] triceps-brachii.r origin → humerus: .o/.e mesh; pending; nodes Lateral head of triceps brachii.or.
- [待核] triceps-brachii.r origin → scapula: .o/.e mesh; pending; nodes Long head of triceps brachii.or.
- [待核] triceps-brachii.r origin → humerus: .o/.e mesh; pending; nodes Medial head of triceps brachii.or.
- [待核] triceps-brachii.r insertion → ulna: .o/.e mesh; pending; nodes Triceps brachii muscle.er.

## Automatic warnings

- trapezius-descending.l origin: no 2 mm contact; nearest 32.73 mm
- trapezius-descending.r origin: no 2 mm contact; nearest 32.73 mm
- deltoid-posterior.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- deltoid-posterior.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- serratus-anterior.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- serratus-anterior.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- trapezius-transverse.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- triceps-brachii.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.

## Automatic result

All decoded surface error, topology, attribute, joint, coordinate and output budget gates passed. Anatomical attachment review remains pending.

## Published skin-weight audit

Decoded published GLB SHA-256: `2c94d1643a38bd73a7ad011821bd8007e9a8730ffe8dac1b6956b2c5aff1feb7`.

Shares sum decoded weights over referenced vertices, including UV/normal seams. Required alternatives are joints bordering the manifest attachment bones; allowed joints include intervening joints in the rig parent chain (e.g. shoulder between scapula and elbow). Radius uses elbow unless the rig provides a separate pronation joint. Missing attachment weights, unrelated joints above 30%, reversed fibre fields and violated persistent endpoint overrides and local weight outliers fail this gate. Outliers compare welded 1–2-ring dominant joints and area-weighted vectors; a discrepant vector must be over twice the neighbours’ median dominant-joint distance. Sub-edge detached scraps use nearby substantial surface rings because their component-local endpoint seeds are artificial; >1% discrepant weight mass on those scraps also fails. Smooth joint crossovers are excluded. Fixed counts refer to unique welded bind vertices.

skin-wire: all 19 full-body joints weighted; 0 shell mismatch flags. Right-axis exact mirror checks passed.

| Muscle | Joint shares | Required attachment joints | Fibre endpoints | Outliers remaining / fixed | Result |
|---|---|---|---|---|---|
| biceps-brachii-long.l | shoulder.l 55.19%, elbow.l 27.20%, scapula.l 17.61% | elbow.l / forearm.l, scapula.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| biceps-brachii-long.r | shoulder.r 53.97%, elbow.r 29.15%, scapula.r 16.88% | elbow.r / forearm.r, scapula.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| deltoid-anterior.l | scapula.l 43.25%, clavicle.l 42.12%, shoulder.l 14.63% | clavicle.l / scapula.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| deltoid-anterior.r | scapula.r 43.26%, clavicle.r 41.92%, shoulder.r 14.82% | clavicle.r / scapula.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| deltoid-lateral.l | scapula.l 57.50%, shoulder.l 42.50% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| deltoid-lateral.r | scapula.r 57.03%, shoulder.r 42.97% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| deltoid-posterior.l | scapula.l 54.23%, shoulder.l 45.77% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| deltoid-posterior.r | scapula.r 54.81%, shoulder.r 45.19% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| infraspinatus.l | scapula.l 71.41%, shoulder.l 28.59% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| infraspinatus.r | scapula.r 72.50%, shoulder.r 27.50% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| latissimus-dorsi.l | trunk 65.07%, shoulder.l 34.93% | elbow.l / shoulder.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| latissimus-dorsi.r | trunk 67.15%, shoulder.r 32.85% | elbow.r / shoulder.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-major-clavicular.l | clavicle.l 48.53%, scapula.l 27.84%, shoulder.l 23.63% | clavicle.l / scapula.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| pectoralis-major-clavicular.r | clavicle.r 47.31%, scapula.r 28.75%, shoulder.r 23.94% | clavicle.r / scapula.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| pectoralis-major-sternocostal.l | trunk 74.56%, shoulder.l 25.44% | elbow.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-major-sternocostal.r | trunk 73.09%, shoulder.r 26.91% | elbow.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| rhomboid-major.l | trunk 36.99%, scapula.l 32.25%, clavicle.l 30.75% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| rhomboid-major.r | trunk 36.86%, clavicle.r 31.64%, scapula.r 31.50% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| serratus-anterior.l | clavicle.l 40.64%, trunk 40.28%, scapula.l 19.07% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 4 | clean |
| serratus-anterior.r | trunk 43.92%, clavicle.r 36.64%, scapula.r 19.44% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| subscapularis.l | scapula.l 68.53%, shoulder.l 31.47% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| subscapularis.r | scapula.r 68.11%, shoulder.r 31.89% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| supraspinatus.l | shoulder.l 50.71%, scapula.l 49.29% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| supraspinatus.r | shoulder.r 51.54%, scapula.r 48.46% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| teres-major.l | shoulder.l 50.29%, scapula.l 49.71% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| teres-major.r | shoulder.r 51.11%, scapula.r 48.89% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| teres-minor.l | scapula.l 60.41%, shoulder.l 39.59% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| teres-minor.r | scapula.r 59.89%, shoulder.r 40.11% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| trapezius-descending.l | trunk 73.92%, clavicle.l 26.08% | clavicle.l / scapula.l, trunk | persistent bounds endpoints | 0 / 0 | clean |
| trapezius-descending.r | trunk 75.35%, clavicle.r 24.65% | clavicle.r / scapula.r, trunk | persistent bounds endpoints | 0 / 0 | clean |
| trapezius-transverse.l | trunk 52.44%, clavicle.l 27.64%, scapula.l 19.92% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| trapezius-transverse.r | trunk 53.38%, clavicle.r 27.31%, scapula.r 19.30% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| triceps-brachii.l | shoulder.l 66.54%, elbow.l 23.10%, scapula.l 10.36% | elbow.l / forearm.l, scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| triceps-brachii.r | shoulder.r 65.23%, elbow.r 24.55%, scapula.r 10.22% | elbow.r / forearm.r, scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |

Skin nodes: `skin-outline, skin-hand.l, skin-hand.r, skin-wire`. Both hand nodes are rigidly bound to their named hand joint. Wrist half-space checks pass at 5 mm distal to the styloid midpoint; wrist openings are intentionally open.


| Other mesh | Outliers remaining / fixed |
|---|---|
| cervical-spine | 0 / 0 |
| clavicle.l | 0 / 0 |
| clavicle.r | 0 / 0 |
| forearm.l | 0 / 0 |
| forearm.r | 0 / 0 |
| humerus.l | 0 / 0 |
| humerus.r | 0 / 0 |
| scapula.l | 0 / 0 |
| scapula.r | 0 / 0 |
| skin-hand.l | 0 / 0 |
| skin-hand.r | 0 / 0 |
| skin-outline | 0 / 0 |
| skin-wire | 0 / 17 |
| thorax | 0 / 0 |

Audit result: **clean** (34 muscle nodes; 0 outliers remaining, 21 fixed).
