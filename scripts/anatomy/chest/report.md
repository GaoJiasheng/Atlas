# Chest mesh review

Final GLB: **3,802,480 bytes**, **237,847 triangles**, **62 total nodes** (42 meshes, 19 joints, rig root).
Draw-call estimate: **42** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.

Native Blender, cached FBX only. Geometry and derived rig/attachment data: CC BY-SA 4.0.

## Source coverage and scope

- Intercostal and forearm ids follow the task spelling; specId records §5.2 aliases.
- Sternum and ribs merge as thorax; thoracic-spine is the second static material group.
- Absolute surface errors are audited after simplification and final decode; specified context caps are mandatory.
- No source surfaces are mirrored; bilateral intercostals are merged as unsided parts.

## Round 9 skin parts

Skin nodes: `skin-outline, skin-hand.l, skin-hand.r, skin-wire`.

The wrist planes are perpendicular to the real elbow-to-styloid-midpoint forearm axes, 5 mm distal to the hand pivots. `skin-outline` excludes the hands. The wrist openings are intentionally open. `skin-hand.l/r` are rigidly bound to `hand.l/r`; hide these nodes when substituting procedural hands.

`skin-wire` includes both hands and uses the full 19-joint skin. Native planar dissolve at 3 degrees precedes quadric planar-preserving simplification. Weights are interpolated barycentrically from the existing skin triangles, reduced to four influences, then shell-synchronized and audited for outliers. Any remaining mismatch is repaired on the exact codec-roundtripped bind geometry before publication. Source UVs are omitted from skin nodes; wire normals are omitted because the engine draws edges.

Native wire: 3921 triangles; the table below reports actual decoded triangles after degenerate cleanup. The schematic has a separate 35 mm sampled surface ceiling; opaque skin retains its 3 mm gate. Split skin coverage is checked as the union of body and both hands, and each part is checked against the full original source. Intentional wrist boundaries are allowed.

Budgets: soft 4,000,000 bytes / 350,000 triangles; hard 8,000,000 bytes / 500,000 triangles. Both soft limits pass for this output.


Display muscle and bone selections retain their reviewed topic scope. The mannequin uses full-body joints even where corresponding display bones are absent. No hand/foot intrinsic muscle geometry is fabricated.

## Final decoded surface audit

Sampled surface deviation: referenced vertices (approximately 3,000) plus 6,000 area-weighted interior points in each direction for whole meshes; split skin parts use final-to-whole-source distances plus a symmetric union coverage gate. This estimates surface error rather than certifying a global maximum. Source boundaries are preserved; nonmanifold/open sources retain disabled section filling.

| Mesh | Role | Source triangles | Final triangles | Deviation mm | Budget mm | Closed before → after | Boundary edges |
|---|---|---:|---:|---:|---:|---|---:|
| biceps-brachii-short.l | neighbour | 2,696 | 1,484 | 1.265 | 1.5 | True → True | 0 |
| biceps-brachii-short.r | neighbour | 2,696 | 1,484 | 1.265 | 1.5 | True → True | 0 |
| clavicle.l | bone | 1,550 | 1,500 | 0.005 | 1.0 | True → True | 0 |
| clavicle.r | bone | 1,550 | 1,500 | 0.004 | 1.0 | True → True | 0 |
| coracobrachialis.l | neighbour | 1,160 | 1,000 | 0.124 | 1.5 | True → True | 0 |
| coracobrachialis.r | neighbour | 1,160 | 1,000 | 0.125 | 1.5 | True → True | 0 |
| deltoid-anterior.l | neighbour | 2,902 | 2,000 | 0.279 | 1.5 | True → True | 0 |
| deltoid-anterior.r | neighbour | 2,902 | 2,000 | 0.280 | 1.5 | True → True | 0 |
| external-oblique.l | neighbour | 29,622 | 7,992 | 1.307 | 1.5 | True → True | 0 |
| external-oblique.r | neighbour | 29,622 | 7,986 | 1.307 | 1.5 | True → True | 0 |
| forearm.l | bone | 1,688 | 1,688 | 0.003 | 1.0 | True → True | 0 |
| forearm.r | bone | 1,688 | 1,688 | 0.003 | 1.0 | True → True | 0 |
| humerus.l | bone | 4,280 | 4,000 | 0.057 | 1.0 | False → False | 4 |
| humerus.r | bone | 4,280 | 4,000 | 0.102 | 1.0 | False → False | 4 |
| intercostals-external | neighbour | 82,820 | 19,782 | 0.964 | 1.5 | True → False | 0 |
| intercostals-internal | neighbour | 80,366 | 19,860 | 0.978 | 1.5 | False → False | 44 |
| latissimus-dorsi.l | neighbour | 21,580 | 3,000 | 1.206 | 1.5 | True → True | 0 |
| latissimus-dorsi.r | neighbour | 21,580 | 2,996 | 1.184 | 1.5 | True → True | 0 |
| pectoralis-major-abdominal.l | region | 1,508 | 1,508 | 0.002 | 0.5 | True → True | 0 |
| pectoralis-major-abdominal.r | region | 1,508 | 1,508 | 0.002 | 0.5 | True → True | 0 |
| pectoralis-major-clavicular.l | region | 850 | 850 | 0.002 | 0.5 | True → True | 0 |
| pectoralis-major-clavicular.r | region | 850 | 850 | 0.002 | 0.5 | True → True | 0 |
| pectoralis-major-sternocostal.l | region | 3,222 | 3,222 | 0.002 | 0.5 | True → True | 0 |
| pectoralis-major-sternocostal.r | region | 3,222 | 3,222 | 0.002 | 0.5 | True → True | 0 |
| pectoralis-minor.l | region | 4,142 | 4,086 | 0.042 | 0.5 | True → False | 0 |
| pectoralis-minor.r | region | 4,142 | 4,086 | 0.068 | 0.5 | True → False | 0 |
| rectus-abdominis.l | neighbour | 20,604 | 1,998 | 1.215 | 1.5 | True → True | 0 |
| rectus-abdominis.r | neighbour | 20,604 | 2,328 | 0.838 | 1.5 | True → True | 0 |
| scapula.l | bone | 25,326 | 4,000 | 0.250 | 1.0 | False → True | 0 |
| scapula.r | bone | 25,326 | 4,000 | 0.260 | 1.0 | False → True | 0 |
| serratus-anterior.l | region | 25,240 | 18,848 | 0.406 | 0.5 | True → False | 0 |
| serratus-anterior.r | region | 25,240 | 19,184 | 0.407 | 0.5 | True → False | 0 |
| skin-hand.l | skin | 100,818 | 1,859 | 1.234 | 3.0 | False → False | 89 |
| skin-hand.r | skin | 100,818 | 2,153 | 1.652 | 3.0 | False → False | 87 |
| skin-outline | skin | 100,818 | 28,221 | 1.289 | 3.0 | False → False | 329 |
| skin-wire | skin | 100,818 | 3,413 | 9.478 | 35.0 | False → False | 444 |
| subclavius.l | region | 794 | 794 | 0.001 | 0.5 | True → True | 0 |
| subclavius.r | region | 794 | 794 | 0.001 | 0.5 | True → True | 0 |
| thoracic-spine | bone | 27,527 | 14,981 | 0.334 | 1.0 | False → False | 2 |
| thorax | bone | 274,709 | 24,990 | 0.421 | 1.0 | False → False | 9 |
| triceps-brachii.l | neighbour | 10,264 | 2,996 | 0.658 | 1.5 | True → True | 0 |
| triceps-brachii.r | neighbour | 10,264 | 2,996 | 0.746 | 1.5 | True → True | 0 |

## Workbench previews

Studio lighting, paper #EDE7D6, orthographic evaluated non-skin bounds with 5% margin; shell composite at 30%. Superficial/intermediate layers move out 0.12/0.06 m; bones and neighbours remain fixed.

- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-exploded-by-layer.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-skin.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-wire-rest.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-pose.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-pose-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-pose-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-pose-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-pose-anatomy.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/chest-preview-wire-pose.png`

Right angle convention: positive inputs; right axes signed by the engine mirrorSignedAxes rule. Positive inputs use the current engine’s mirrorSignedAxes rule with the real left/right joint midline normal; stored metadata remains the exact X-only axis reflection.
Pose inputs: {'shoulder.l.flexion': 90, 'elbow.r.flexion': 90, 'hip.l.flexion': 60, 'knee.r.flexion': 90, 'ankle.l.dorsiflexion': 15, 'ankle.r.dorsiflexion': 15}; humerus.l centroid displacement 0.198882 m. All evaluated coordinates and muscle-edge stretches are finite.
Visual inspection results are recorded in `preview-review.md` after viewing every PNG.

## Frame and rig

Metres; Y up; front +Z; own left +X. Source region centre [-1.6483021681779064e-05, -0.055000342428684235, 1.3499360084533691]; floorY -1.350318 m. Add −floorY for grounded full-body display.
Unexported reference bones locate joints and attachment candidates without adding out-of-region display bones. Hand joints pivot at wrist styloid midpoints; grip offsets are 0.08 m along the distal hand direction.

| Joint | Position X/Y/Z m | Parent | Evidence |
|---|---|---|---|
| trunk | 0.00000, 0.00000, -0.00000 | None | region frame |
| clavicle.l | 0.01670, 0.05116, -0.02025 | trunk | medial clavicle / sternoclavicular joint |
| scapula.l | 0.14958, 0.06725, -0.09072 | clavicle.l | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.l | 0.17264, 0.03656, -0.08084 | scapula.l | humeral head sphere fit; .i/.j landmark patch |
| elbow.l | 0.22320, -0.23922, -0.09501 | shoulder.l | midpoint of humeral epicondyle .i/.j cubes |
| forearm.l | 0.22320, -0.23922, -0.09501 | elbow.l | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.l | 0.26464, -0.50445, -0.04079 | forearm.l | midpoint of radial/ulnar styloid cubes |
| hip.l | 0.08531, -0.47891, -0.06997 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.l | 0.07622, -0.89399, -0.08809 | hip.l | midpoint of femoral epicondyle .i/.j cubes |
| ankle.l | 0.08184, -1.27063, -0.09846 | knee.l | midpoint of medial/lateral malleolar landmarks |
| clavicle.r | -0.01667, 0.05116, -0.02025 | trunk | medial clavicle / sternoclavicular joint |
| scapula.r | -0.14955, 0.06725, -0.09072 | clavicle.r | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.r | -0.17260, 0.03656, -0.08084 | scapula.r | humeral head sphere fit; .i/.j landmark patch |
| elbow.r | -0.22317, -0.23922, -0.09501 | shoulder.r | midpoint of humeral epicondyle .i/.j cubes |
| forearm.r | -0.22317, -0.23922, -0.09501 | elbow.r | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.r | -0.26462, -0.50445, -0.04079 | forearm.r | midpoint of radial/ulnar styloid cubes |
| hip.r | -0.08527, -0.47891, -0.06997 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.r | -0.07619, -0.89399, -0.08809 | hip.r | midpoint of femoral epicondyle .i/.j cubes |
| ankle.r | -0.07859, -1.27073, -0.09840 | knee.r | midpoint of medial/lateral malleolar landmarks |

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
| knee | rotation | 1.000000058 |
| knee | internal-rotation | 1.000000058 |
| knee | external-rotation | 1.000000058 |
| knee | horizontal-abduction | 1.000000000 |
| knee | horizontal-adduction | 1.000000000 |
| knee | elevation | 1.000000000 |
| knee | depression | 1.000000000 |
| knee | protraction | 1.000000000 |
| knee | retraction | 1.000000000 |
| knee | upward-rotation | 1.000000000 |
| knee | downward-rotation | 1.000000000 |
| knee | lateral-flexion | 1.000000000 |
| knee | pronation | 1.000000058 |
| knee | supination | 1.000000058 |
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

- [待核] pectoralis-major-clavicular.l origin → clavicle: .o/.e mesh; pending; nodes Pectoralis major muscle.ol.
- [待核] pectoralis-major-clavicular.l insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.el.
- [待核] pectoralis-major-clavicular.r origin → clavicle: .o/.e mesh; pending; nodes Pectoralis major muscle.or.
- [待核] pectoralis-major-clavicular.r insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.er.
- [待核] pectoralis-major-sternocostal.l origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Pectoralis major muscle.ol.
- [待核] pectoralis-major-sternocostal.l origin → sternum: .o/.e mesh; pending; nodes Sternocostal head of pectoralis major muscle.e1l.
- [待核] pectoralis-major-sternocostal.l origin → sternum: .o/.e mesh; pending; nodes Sternocostal head of pectoralis major muscle.e2l.
- [待核] pectoralis-major-sternocostal.l origin → ribs: .o/.e mesh; pending; nodes Sternocostal head of pectoralis major muscle.el.
- [待核] pectoralis-major-sternocostal.l insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.el.
- [待核] pectoralis-major-sternocostal.r origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Pectoralis major muscle.or.
- [待核] pectoralis-major-sternocostal.r origin → sternum: .o/.e mesh; pending; nodes Sternocostal head of pectoralis major muscle.e1r.
- [待核] pectoralis-major-sternocostal.r origin → sternum: .o/.e mesh; pending; nodes Sternocostal head of pectoralis major muscle.e2r.
- [待核] pectoralis-major-sternocostal.r origin → ribs: .o/.e mesh; pending; nodes Sternocostal head of pectoralis major muscle.er.
- [待核] pectoralis-major-sternocostal.r insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.er.
- [待核] pectoralis-major-abdominal.l origin → external-oblique: .o/.e mesh; REQUIRED: attachment away from named surface; nodes (Abdominal part of pectoralis major muscle).ol.
- [待核] pectoralis-major-abdominal.l insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.el.
- [待核] pectoralis-major-abdominal.r origin → external-oblique: .o/.e mesh; REQUIRED: attachment away from named surface; nodes (Abdominal part of pectoralis major muscle).or.
- [待核] pectoralis-major-abdominal.r insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.er.
- [待核] pectoralis-minor.l origin → ribs: .o/.e mesh; pending; nodes Pectoralis minor muscle.e1l.
- [待核] pectoralis-minor.l origin → ribs: .o/.e mesh; pending; nodes Pectoralis minor muscle.e2l.
- [待核] pectoralis-minor.l origin → ribs: .o/.e mesh; pending; nodes Pectoralis minor muscle.el.
- [待核] pectoralis-minor.l insertion → scapula: .o/.e mesh; pending; nodes Pectoralis minor muscle.ol.
- [待核] pectoralis-minor.r origin → ribs: .o/.e mesh; pending; nodes Pectoralis minor muscle.e1r.
- [待核] pectoralis-minor.r origin → ribs: .o/.e mesh; pending; nodes Pectoralis minor muscle.e2r.
- [待核] pectoralis-minor.r origin → ribs: .o/.e mesh; pending; nodes Pectoralis minor muscle.er.
- [待核] pectoralis-minor.r insertion → scapula: .o/.e mesh; pending; nodes Pectoralis minor muscle.or.
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
- [待核] subclavius.l origin → ribs: proximity; pending; nodes none.
- [待核] subclavius.l insertion → clavicle: .o/.e mesh; pending; nodes Subclavius muscle.ol.
- [待核] subclavius.r origin → ribs: proximity; pending; nodes none.
- [待核] subclavius.r insertion → clavicle: .o/.e mesh; pending; nodes Subclavius muscle.or.
- [待核] intercostals-external origin → ribs: proximity; pending; nodes none.
- [待核] intercostals-external insertion → ribs: proximity; pending; nodes none.
- [待核] intercostals-internal origin → ribs: proximity; pending; nodes none.
- [待核] intercostals-internal insertion → ribs: proximity; pending; nodes none.
- [待核] deltoid-anterior.l origin → clavicle: .o/.e mesh; pending; nodes Clavicular part of deltoid muscle.ol.
- [待核] deltoid-anterior.l insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.el.
- [待核] deltoid-anterior.r origin → clavicle: .o/.e mesh; pending; nodes Clavicular part of deltoid muscle.or.
- [待核] deltoid-anterior.r insertion → humerus: .o/.e mesh; pending; nodes Deltoid muscle.er.
- [待核] biceps-brachii-short.l origin → scapula: proximity; pending; nodes none.
- [待核] biceps-brachii-short.l insertion → forearm: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] biceps-brachii-short.r origin → scapula: .o/.e mesh; pending; nodes Short head of biceps brachii.ol.
- [待核] biceps-brachii-short.r insertion → forearm: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] coracobrachialis.l origin → scapula: .o/.e mesh; pending; nodes Coracobrachialis muscle.ol.
- [待核] coracobrachialis.l insertion → humerus: proximity; pending; nodes none.
- [待核] coracobrachialis.r origin → scapula: .o/.e mesh; pending; nodes Coracobrachialis muscle.or.
- [待核] coracobrachialis.r insertion → humerus: proximity; pending; nodes none.
- [待核] triceps-brachii.l origin → humerus: .o/.e mesh; pending; nodes Lateral head of triceps brachii.ol.
- [待核] triceps-brachii.l origin → scapula: .o/.e mesh; pending; nodes Long head of triceps brachii.ol.
- [待核] triceps-brachii.l origin → humerus: .o/.e mesh; pending; nodes Medial head of triceps brachii.ol.
- [待核] triceps-brachii.l insertion → forearm: .o/.e mesh; pending; nodes Triceps brachii muscle.el.
- [待核] triceps-brachii.r origin → humerus: .o/.e mesh; pending; nodes Lateral head of triceps brachii.or.
- [待核] triceps-brachii.r origin → scapula: .o/.e mesh; pending; nodes Long head of triceps brachii.or.
- [待核] triceps-brachii.r origin → humerus: .o/.e mesh; pending; nodes Medial head of triceps brachii.or.
- [待核] triceps-brachii.r insertion → forearm: .o/.e mesh; pending; nodes Triceps brachii muscle.er.
- [待核] latissimus-dorsi.l origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.el.
- [待核] latissimus-dorsi.l origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.ol.
- [待核] latissimus-dorsi.l insertion → humerus: proximity; pending; nodes none.
- [待核] latissimus-dorsi.r origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.er.
- [待核] latissimus-dorsi.r origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.or.
- [待核] latissimus-dorsi.r insertion → humerus: proximity; pending; nodes none.
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
- [待核] rectus-abdominis.l origin → pelvis: proximity; pending; nodes none.
- [待核] rectus-abdominis.l insertion → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Rectus abdominis muscle.el.
- [待核] rectus-abdominis.l insertion → ribs: .o/.e mesh; pending; nodes Rectus abdominis muscle.ol.
- [待核] rectus-abdominis.r origin → pelvis: proximity; pending; nodes none.
- [待核] rectus-abdominis.r insertion → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Rectus abdominis muscle.er.
- [待核] rectus-abdominis.r insertion → ribs: .o/.e mesh; pending; nodes Rectus abdominis muscle.or.

## Automatic warnings

- biceps-brachii-short.l insertion: no 2 mm contact; nearest 28.28 mm
- biceps-brachii-short.r insertion: no 2 mm contact; nearest 28.28 mm
- intercostals-external: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- pectoralis-minor.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- pectoralis-minor.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- serratus-anterior.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- serratus-anterior.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.

## Automatic result

All decoded surface error, topology, attribute, joint, coordinate and output budget gates passed. Anatomical attachment review remains pending.

## Published skin-weight audit

Decoded published GLB SHA-256: `6f44edb5b63f8d242bc6fd9abfbe1d3b53bc92842abc87c7c8358fc325647963`.

Shares sum decoded weights over referenced vertices, including UV/normal seams. Required alternatives are joints bordering the manifest attachment bones; allowed joints include intervening joints in the rig parent chain (e.g. shoulder between scapula and elbow). Radius uses elbow unless the rig provides a separate pronation joint. Missing attachment weights, unrelated joints above 30%, reversed fibre fields and violated persistent endpoint overrides and local weight outliers fail this gate. Outliers compare welded 1–2-ring dominant joints and area-weighted vectors; a discrepant vector must be over twice the neighbours’ median dominant-joint distance. Sub-edge detached scraps use nearby substantial surface rings because their component-local endpoint seeds are artificial; >1% discrepant weight mass on those scraps also fails. Smooth joint crossovers are excluded. Fixed counts refer to unique welded bind vertices.

skin-wire: all 19 full-body joints weighted; 0 shell mismatch flags. Right-axis exact mirror checks passed.

| Muscle | Joint shares | Required attachment joints | Fibre endpoints | Outliers remaining / fixed | Result |
|---|---|---|---|---|---|
| biceps-brachii-short.l | shoulder.l 54.75%, elbow.l 24.32%, scapula.l 20.93% | elbow.l / forearm.l, scapula.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| biceps-brachii-short.r | shoulder.r 53.77%, elbow.r 25.21%, scapula.r 21.02% | elbow.r / forearm.r, scapula.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| coracobrachialis.l | shoulder.l 58.63%, scapula.l 41.37% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| coracobrachialis.r | shoulder.r 58.55%, scapula.r 41.45% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| deltoid-anterior.l | clavicle.l 65.70%, shoulder.l 34.30% | clavicle.l / scapula.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| deltoid-anterior.r | clavicle.r 65.46%, shoulder.r 34.54% | clavicle.r / scapula.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| external-oblique.l | trunk 100.00% | hip.l / trunk | origin → insertion | 0 / 0 | clean |
| external-oblique.r | trunk 100.00% | hip.r / trunk | origin → insertion | 0 / 0 | clean |
| intercostals-external | trunk 100.00% | trunk | named surfaces: ambiguous/shared | 0 / 0 | clean |
| intercostals-internal | trunk 100.00% | trunk | named surfaces: ambiguous/shared | 0 / 0 | clean |
| latissimus-dorsi.l | trunk 65.97%, shoulder.l 34.03% | elbow.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| latissimus-dorsi.r | trunk 67.11%, shoulder.r 32.89% | elbow.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-major-abdominal.l | trunk 62.18%, shoulder.l 37.82% | elbow.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-major-abdominal.r | trunk 62.58%, shoulder.r 37.42% | elbow.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-major-clavicular.l | clavicle.l 62.77%, shoulder.l 37.23% | clavicle.l / scapula.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| pectoralis-major-clavicular.r | clavicle.r 61.81%, shoulder.r 38.19% | clavicle.r / scapula.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| pectoralis-major-sternocostal.l | trunk 73.35%, shoulder.l 26.65% | elbow.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-major-sternocostal.r | trunk 72.12%, shoulder.r 27.88% | elbow.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-minor.l | trunk 71.91%, scapula.l 28.09% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-minor.r | trunk 72.17%, scapula.r 27.83% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| rectus-abdominis.l | trunk 100.00% | hip.l / trunk | origin → insertion | 0 / 0 | clean |
| rectus-abdominis.r | trunk 100.00% | hip.r / trunk | origin → insertion | 0 / 0 | clean |
| serratus-anterior.l | trunk 63.44%, scapula.l 36.56% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| serratus-anterior.r | trunk 67.74%, scapula.r 32.26% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| subclavius.l | trunk 61.49%, clavicle.l 38.51% | clavicle.l / scapula.l, trunk | origin → insertion | 0 / 0 | clean |
| subclavius.r | trunk 61.49%, clavicle.r 38.51% | clavicle.r / scapula.r, trunk | origin → insertion | 0 / 0 | clean |
| triceps-brachii.l | shoulder.l 72.02%, elbow.l 27.98% | elbow.l / forearm.l, scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| triceps-brachii.r | shoulder.r 71.46%, elbow.r 28.54% | elbow.r / forearm.r, scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |

Skin nodes: `skin-outline, skin-hand.l, skin-hand.r, skin-wire`. Both hand nodes are rigidly bound to their named hand joint. Wrist half-space checks pass at 5 mm distal to the styloid midpoint; wrist openings are intentionally open.


| Other mesh | Outliers remaining / fixed |
|---|---|
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
| skin-outline | 0 / 1 |
| skin-wire | 0 / 15 |
| thoracic-spine | 0 / 0 |
| thorax | 0 / 0 |

Audit result: **clean** (28 muscle nodes; 0 outliers remaining, 16 fixed).
