# Arms mesh review

Final GLB: **3,133,112 bytes**, **193,602 triangles**, **81 total nodes** (61 meshes, 19 joints, rig root).
Draw-call estimate: **61** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.

Native Blender, cached FBX only. Geometry and derived rig/attachment data: CC BY-SA 4.0.

## Source coverage and scope

- Selected from docs/16 §5.3, region reviews and exact cached FBX inventory; no mirrored geometry.
- Parent/group cards are not duplicated as meshes. Neighbours include adjacent exercise secondary/stabiliser muscles; distant whole-body stabilisers excluded.
- Reference surfaces outside the exported bone list are used only for attachment and joint evidence.
- Whole neighbour muscle extents retained at low budget; educational crops remain [待核].
- Intrinsic hand/foot muscles and deep forearm flexors excluded by v1 scope; hand/foot bones are merged per side.
- Optional thoracolumbar fascia, linea alba and diaphragm omitted. Linea-alba attachment evidence uses the unexported named source surface.
- No named region muscle is missing in Z-Anatomy; multifidus uses the actual paired lumbar meshes, not rotatores or invented geometry.

Display muscle and bone selections retain their reviewed topic scope. The mannequin uses full-body joints even where corresponding display bones are absent. No hand/foot intrinsic muscle geometry is fabricated.

## Final decoded surface audit

Symmetric sampled Hausdorff: referenced vertices (approximately 3,000) plus 6,000 area-weighted interior points in each direction. This estimates surface error rather than certifying a global maximum. Source boundaries are preserved; nonmanifold/open sources retain disabled section filling.

| Mesh | Role | Source triangles | Final triangles | Deviation mm | Budget mm | Closed before → after | Boundary edges |
|---|---|---:|---:|---:|---:|---|---:|
| anconeus.l | region | 1,442 | 1,442 | 0.001 | 0.5 | True → True | 0 |
| anconeus.r | region | 1,442 | 1,442 | 0.001 | 0.5 | True → True | 0 |
| biceps-brachii-long.l | region | 3,218 | 3,218 | 0.004 | 0.5 | True → True | 0 |
| biceps-brachii-long.r | region | 3,218 | 3,218 | 0.004 | 0.5 | True → True | 0 |
| biceps-brachii-short.l | region | 2,696 | 2,696 | 0.003 | 0.5 | True → True | 0 |
| biceps-brachii-short.r | region | 2,696 | 2,696 | 0.003 | 0.5 | True → True | 0 |
| brachialis.l | region | 3,478 | 3,478 | 0.003 | 0.5 | True → True | 0 |
| brachialis.r | region | 3,478 | 3,478 | 0.003 | 0.5 | True → True | 0 |
| brachioradialis.l | region | 7,312 | 3,998 | 0.261 | 0.5 | True → True | 0 |
| brachioradialis.r | region | 7,312 | 3,998 | 0.309 | 0.5 | True → True | 0 |
| coracobrachialis.l | region | 1,160 | 1,160 | 0.002 | 0.5 | True → True | 0 |
| coracobrachialis.r | region | 1,160 | 1,160 | 0.002 | 0.5 | True → True | 0 |
| deltoid-anterior.l | neighbour | 2,902 | 1,500 | 0.421 | 1.5 | True → True | 0 |
| deltoid-anterior.r | neighbour | 2,902 | 1,500 | 0.492 | 1.5 | True → True | 0 |
| deltoid-lateral.l | neighbour | 2,964 | 1,498 | 0.475 | 1.5 | True → False | 0 |
| deltoid-lateral.r | neighbour | 2,964 | 1,498 | 0.466 | 1.5 | True → False | 0 |
| deltoid-posterior.l | neighbour | 4,378 | 1,498 | 0.525 | 1.5 | True → True | 0 |
| deltoid-posterior.r | neighbour | 4,378 | 1,498 | 0.653 | 1.5 | True → True | 0 |
| extensor-carpi-radialis-brevis.l | region | 3,142 | 3,142 | 0.004 | 0.5 | True → True | 0 |
| extensor-carpi-radialis-brevis.r | region | 3,142 | 3,142 | 0.004 | 0.5 | True → True | 0 |
| extensor-carpi-radialis-longus.l | region | 3,705 | 3,705 | 0.004 | 0.5 | False → False | 3 |
| extensor-carpi-radialis-longus.r | region | 3,705 | 3,705 | 0.004 | 0.5 | False → False | 3 |
| extensor-carpi-ulnaris.l | region | 1,412 | 1,412 | 0.004 | 0.5 | True → True | 0 |
| extensor-carpi-ulnaris.r | region | 1,412 | 1,412 | 0.004 | 0.5 | True → True | 0 |
| extensor-digitorum.l | region | 6,410 | 3,992 | 0.276 | 0.5 | True → False | 0 |
| extensor-digitorum.r | region | 6,410 | 3,992 | 0.278 | 0.5 | True → False | 0 |
| flexor-carpi-radialis.l | region | 1,666 | 1,666 | 0.003 | 0.5 | True → True | 0 |
| flexor-carpi-radialis.r | region | 1,666 | 1,666 | 0.003 | 0.5 | True → True | 0 |
| flexor-carpi-ulnaris.l | region | 5,378 | 3,990 | 0.431 | 0.5 | True → False | 0 |
| flexor-carpi-ulnaris.r | region | 5,378 | 3,986 | 0.372 | 0.5 | True → False | 0 |
| flexor-digitorum-superficialis.l | region | 14,074 | 4,000 | 0.394 | 0.5 | True → False | 0 |
| flexor-digitorum-superficialis.r | region | 14,074 | 4,000 | 0.369 | 0.5 | True → True | 0 |
| hand.l | bone | 14,014 | 6,000 | 0.194 | 1.0 | True → True | 0 |
| hand.r | bone | 14,014 | 6,000 | 0.246 | 1.0 | True → True | 0 |
| humerus.l | bone | 4,280 | 4,000 | 0.059 | 1.0 | False → False | 4 |
| humerus.r | bone | 4,280 | 4,000 | 0.046 | 1.0 | False → False | 4 |
| latissimus-dorsi.l | neighbour | 21,580 | 2,042 | 1.234 | 1.5 | True → True | 0 |
| latissimus-dorsi.r | neighbour | 21,580 | 2,070 | 1.242 | 1.5 | True → True | 0 |
| palmaris-longus.l | region | 4,374 | 4,000 | 0.179 | 0.5 | True → False | 0 |
| palmaris-longus.r | region | 4,374 | 4,000 | 0.178 | 0.5 | True → False | 0 |
| pectoralis-major-abdominal.l | neighbour | 1,508 | 1,500 | 0.028 | 1.5 | True → True | 0 |
| pectoralis-major-abdominal.r | neighbour | 1,508 | 1,500 | 0.014 | 1.5 | True → True | 0 |
| pectoralis-major-clavicular.l | neighbour | 850 | 850 | 0.002 | 1.5 | True → True | 0 |
| pectoralis-major-clavicular.r | neighbour | 850 | 850 | 0.002 | 1.5 | True → True | 0 |
| pectoralis-major-sternocostal.l | neighbour | 3,222 | 1,492 | 1.219 | 1.5 | True → True | 0 |
| pectoralis-major-sternocostal.r | neighbour | 3,222 | 1,490 | 1.219 | 1.5 | True → True | 0 |
| pronator-teres.l | region | 3,660 | 3,660 | 0.002 | 0.5 | True → True | 0 |
| pronator-teres.r | region | 3,660 | 3,660 | 0.002 | 0.5 | True → True | 0 |
| radius.l | bone | 784 | 784 | 0.003 | 1.0 | True → True | 0 |
| radius.r | bone | 784 | 784 | 0.004 | 1.0 | True → True | 0 |
| scapula.l | bone | 25,326 | 3,998 | 0.229 | 1.0 | False → True | 0 |
| scapula.r | bone | 25,326 | 4,000 | 0.222 | 1.0 | False → True | 0 |
| skin-outline | skin | 100,818 | 29,800 | 1.553 | 3.0 | False → False | 160 |
| triceps-brachii-lateral.l | region | 3,628 | 3,628 | 0.003 | 0.5 | True → True | 0 |
| triceps-brachii-lateral.r | region | 3,628 | 3,628 | 0.006 | 0.5 | True → True | 0 |
| triceps-brachii-long.l | region | 3,950 | 3,950 | 0.003 | 0.5 | True → True | 0 |
| triceps-brachii-long.r | region | 3,950 | 3,950 | 0.003 | 0.5 | True → True | 0 |
| triceps-brachii-medial.l | region | 2,686 | 2,686 | 0.004 | 0.5 | True → True | 0 |
| triceps-brachii-medial.r | region | 2,686 | 2,686 | 0.003 | 0.5 | True → True | 0 |
| ulna.l | bone | 904 | 904 | 0.003 | 1.0 | True → True | 0 |
| ulna.r | bone | 904 | 904 | 0.003 | 1.0 | True → True | 0 |

## Workbench previews

Studio lighting, paper #EDE7D6, orthographic evaluated non-skin bounds with 5% margin; shell composite at 30%. Superficial/intermediate layers move out 0.12/0.06 m; bones and neighbours remain fixed.

- `/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-exploded-by-layer.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-skin.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-pose.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-pose-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-pose-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-pose-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/arms-preview-pose-anatomy.png`

Right angle convention: positive inputs; right axes signed by the engine mirrorSignedAxes rule. Positive inputs use the current engine’s mirrorSignedAxes rule with the real left/right joint midline normal; stored metadata remains the exact X-only axis reflection.
Pose inputs: {'shoulder.l.flexion': 90, 'elbow.r.flexion': 90, 'hip.l.flexion': 60, 'knee.r.flexion': 90, 'ankle.l.dorsiflexion': 15, 'ankle.r.dorsiflexion': 15}; humerus.l centroid displacement 0.198225 m. All evaluated coordinates and muscle-edge stretches are finite.
Visual inspection results are recorded in `preview-review.md` after viewing every PNG.

## Frame and rig

Metres; Y up; front +Z; own left +X. Source region centre [0.0, 0.030789900571107864, 1.2483623027801514]; floorY -1.248745 m. Add −floorY for grounded full-body display.
Unexported reference bones locate joints and attachment candidates without adding out-of-region display bones. Hand joints pivot at wrist styloid midpoints; grip offsets are 0.08 m along the distal hand direction.

| Joint | Position X/Y/Z m | Parent | Evidence |
|---|---|---|---|
| trunk | 0.00000, 0.00000, -0.00000 | None | region frame |
| clavicle.l | 0.01669, 0.15273, 0.06554 | trunk | medial clavicle / sternoclavicular joint |
| scapula.l | 0.14956, 0.16883, -0.00493 | clavicle.l | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.l | 0.17262, 0.13813, 0.00495 | scapula.l | humeral head sphere fit; .i/.j landmark patch |
| elbow.l | 0.22319, -0.13764, -0.00922 | shoulder.l | midpoint of humeral epicondyle .i/.j cubes |
| forearm.l | 0.22319, -0.13764, -0.00922 | elbow.l | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.l | 0.26462, -0.40287, 0.04500 | forearm.l | midpoint of radial/ulnar styloid cubes |
| hip.l | 0.08529, -0.37733, 0.01582 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.l | 0.07621, -0.79242, -0.00230 | hip.l | midpoint of femoral epicondyle .i/.j cubes |
| ankle.l | 0.08182, -1.16905, -0.01267 | knee.l | midpoint of medial/lateral malleolar landmarks |
| clavicle.r | -0.01669, 0.15273, 0.06554 | trunk | medial clavicle / sternoclavicular joint |
| scapula.r | -0.14956, 0.16883, -0.00493 | clavicle.r | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.r | -0.17262, 0.13813, 0.00495 | scapula.r | humeral head sphere fit; .i/.j landmark patch |
| elbow.r | -0.22319, -0.13764, -0.00922 | shoulder.r | midpoint of humeral epicondyle .i/.j cubes |
| forearm.r | -0.22319, -0.13764, -0.00922 | elbow.r | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.r | -0.26464, -0.40287, 0.04500 | forearm.r | midpoint of radial/ulnar styloid cubes |
| hip.r | -0.08529, -0.37733, 0.01582 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.r | -0.07621, -0.79242, -0.00230 | hip.r | midpoint of femoral epicondyle .i/.j cubes |
| ankle.r | -0.07861, -1.16916, -0.01261 | knee.r | midpoint of medial/lateral malleolar landmarks |

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
| shoulder | rotation | 0.999999927 |
| shoulder | internal-rotation | 0.999999927 |
| shoulder | external-rotation | 0.999999927 |
| shoulder | horizontal-abduction | 1.000000000 |
| shoulder | horizontal-adduction | 1.000000000 |
| shoulder | elevation | 1.000000000 |
| shoulder | depression | 1.000000000 |
| shoulder | protraction | 1.000000000 |
| shoulder | retraction | 1.000000000 |
| shoulder | upward-rotation | 1.000000000 |
| shoulder | downward-rotation | 1.000000000 |
| shoulder | lateral-flexion | 1.000000000 |
| shoulder | pronation | 0.999999927 |
| shoulder | supination | 0.999999927 |
| shoulder | dorsiflexion | 1.000000000 |
| shoulder | plantarflexion | 1.000000000 |
| shoulder | inversion | 1.000000000 |
| shoulder | eversion | 1.000000000 |
| elbow | flexion | 1.000000000 |
| elbow | extension | 1.000000000 |
| elbow | abduction | 1.000000000 |
| elbow | adduction | 1.000000000 |
| elbow | rotation | 1.000000000 |
| elbow | internal-rotation | 1.000000000 |
| elbow | external-rotation | 1.000000000 |
| elbow | horizontal-abduction | 1.000000000 |
| elbow | horizontal-adduction | 1.000000000 |
| elbow | elevation | 1.000000000 |
| elbow | depression | 1.000000000 |
| elbow | protraction | 1.000000000 |
| elbow | retraction | 1.000000000 |
| elbow | upward-rotation | 1.000000000 |
| elbow | downward-rotation | 1.000000000 |
| elbow | lateral-flexion | 1.000000000 |
| elbow | pronation | 1.000000000 |
| elbow | supination | 1.000000000 |
| elbow | dorsiflexion | 1.000000000 |
| elbow | plantarflexion | 1.000000000 |
| elbow | inversion | 1.000000000 |
| elbow | eversion | 1.000000000 |
| forearm | flexion | 1.000000000 |
| forearm | extension | 1.000000000 |
| forearm | abduction | 1.000000000 |
| forearm | adduction | 1.000000000 |
| forearm | rotation | 0.999999908 |
| forearm | internal-rotation | 0.999999908 |
| forearm | external-rotation | 0.999999908 |
| forearm | horizontal-abduction | 1.000000000 |
| forearm | horizontal-adduction | 1.000000000 |
| forearm | elevation | 1.000000000 |
| forearm | depression | 1.000000000 |
| forearm | protraction | 1.000000000 |
| forearm | retraction | 1.000000000 |
| forearm | upward-rotation | 1.000000000 |
| forearm | downward-rotation | 1.000000000 |
| forearm | lateral-flexion | 1.000000000 |
| forearm | pronation | 0.999999908 |
| forearm | supination | 0.999999908 |
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
| knee | rotation | 1.000000048 |
| knee | internal-rotation | 1.000000048 |
| knee | external-rotation | 1.000000048 |
| knee | horizontal-abduction | 1.000000000 |
| knee | horizontal-adduction | 1.000000000 |
| knee | elevation | 1.000000000 |
| knee | depression | 1.000000000 |
| knee | protraction | 1.000000000 |
| knee | retraction | 1.000000000 |
| knee | upward-rotation | 1.000000000 |
| knee | downward-rotation | 1.000000000 |
| knee | lateral-flexion | 1.000000000 |
| knee | pronation | 1.000000048 |
| knee | supination | 1.000000048 |
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
Motion aliases: {'elbow.l.pronation': 'forearm.l.pronation', 'elbow.r.pronation': 'forearm.r.pronation', 'elbow.l.supination': 'forearm.l.supination', 'elbow.r.supination': 'forearm.r.supination'}. Arms keep ulna on elbow and radius/hand on forearm, with pronation along the forearm rather than the elbow flexion axis.

## [待核] attachment candidates

All candidates remain unapproved. `.o/.e` markers are classified by named-surface distance, with raw labels retained. Proximity fallback is explicit; no anatomical wording is approved by geometry alone.

- [待核] biceps-brachii-long.l origin → scapula: .o/.e mesh; pending; nodes Long head of biceps brachii.ol.
- [待核] biceps-brachii-long.l insertion → radius: .o/.e mesh; pending; nodes Biceps brachii muscle.el.
- [待核] biceps-brachii-long.r origin → scapula: .o/.e mesh; pending; nodes Long head of biceps brachii.or.
- [待核] biceps-brachii-long.r insertion → radius: .o/.e mesh; pending; nodes Biceps brachii muscle.er.
- [待核] biceps-brachii-short.l origin → scapula: proximity; pending; nodes none.
- [待核] biceps-brachii-short.l insertion → radius: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] biceps-brachii-short.r origin → scapula: .o/.e mesh; pending; nodes Short head of biceps brachii.ol.
- [待核] biceps-brachii-short.r insertion → radius: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] triceps-brachii-long.l origin → scapula: .o/.e mesh; pending; nodes Long head of triceps brachii.ol.
- [待核] triceps-brachii-long.l insertion → ulna: .o/.e mesh; pending; nodes Triceps brachii muscle.el.
- [待核] triceps-brachii-long.r origin → scapula: .o/.e mesh; pending; nodes Long head of triceps brachii.or.
- [待核] triceps-brachii-long.r insertion → ulna: .o/.e mesh; pending; nodes Triceps brachii muscle.er.
- [待核] triceps-brachii-lateral.l origin → humerus: .o/.e mesh; pending; nodes Lateral head of triceps brachii.ol.
- [待核] triceps-brachii-lateral.l insertion → ulna: .o/.e mesh; pending; nodes Triceps brachii muscle.el.
- [待核] triceps-brachii-lateral.r origin → humerus: .o/.e mesh; pending; nodes Lateral head of triceps brachii.or.
- [待核] triceps-brachii-lateral.r insertion → ulna: .o/.e mesh; pending; nodes Triceps brachii muscle.er.
- [待核] brachioradialis.l origin → humerus: .o/.e mesh; pending; nodes Brachioradialis muscle.ol.
- [待核] brachioradialis.l insertion → radius: .o/.e mesh; pending; nodes Brachioradialis muscle.el.
- [待核] brachioradialis.r origin → humerus: .o/.e mesh; pending; nodes Brachioradialis muscle.or.
- [待核] brachioradialis.r insertion → radius: .o/.e mesh; pending; nodes Brachioradialis muscle.er.
- [待核] pronator-teres.l origin → humerus: proximity; pending; nodes none.
- [待核] pronator-teres.l origin → ulna: proximity; pending; nodes none.
- [待核] pronator-teres.l insertion → radius: proximity; pending; nodes none.
- [待核] pronator-teres.r origin → humerus: proximity; pending; nodes none.
- [待核] pronator-teres.r origin → ulna: proximity; pending; nodes none.
- [待核] pronator-teres.r insertion → radius: proximity; pending; nodes none.
- [待核] flexor-carpi-radialis.l origin → humerus: proximity; pending; nodes none.
- [待核] flexor-carpi-radialis.l insertion → hand: proximity; pending; nodes none.
- [待核] flexor-carpi-radialis.r origin → humerus: proximity; pending; nodes none.
- [待核] flexor-carpi-radialis.r insertion → hand: proximity; pending; nodes none.
- [待核] palmaris-longus.l origin → humerus: proximity; pending; nodes none.
- [待核] palmaris-longus.l insertion → hand: proximity; pending; nodes none.
- [待核] palmaris-longus.r origin → humerus: proximity; pending; nodes none.
- [待核] palmaris-longus.r insertion → hand: proximity; pending; nodes none.
- [待核] flexor-carpi-ulnaris.l origin → ulna: .o/.e mesh; pending; nodes Ulnar head of flexor carpi ulnaris.ol.
- [待核] flexor-carpi-ulnaris.l insertion → hand: proximity; pending; nodes none.
- [待核] flexor-carpi-ulnaris.r origin → ulna: .o/.e mesh; pending; nodes Ulnar head of flexor carpi ulnaris.or.
- [待核] flexor-carpi-ulnaris.r insertion → hand: proximity; pending; nodes none.
- [待核] extensor-carpi-radialis-longus.l origin → humerus: .o/.e mesh; pending; nodes Extensor carpi radialis longus.ol.
- [待核] extensor-carpi-radialis-longus.l insertion → hand: .o/.e mesh; pending; nodes Extensor carpi radialis longus.el.
- [待核] extensor-carpi-radialis-longus.r origin → humerus: .o/.e mesh; pending; nodes Extensor carpi radialis longus.or.
- [待核] extensor-carpi-radialis-longus.r insertion → hand: .o/.e mesh; pending; nodes Extensor carpi radialis longus.er.
- [待核] extensor-digitorum.l origin → humerus: proximity; pending; nodes none.
- [待核] extensor-digitorum.l insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e1l.
- [待核] extensor-digitorum.l insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e2l.
- [待核] extensor-digitorum.l insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e3l.
- [待核] extensor-digitorum.l insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e4l.
- [待核] extensor-digitorum.l insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e5l.
- [待核] extensor-digitorum.l insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e6l.
- [待核] extensor-digitorum.l insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e7l.
- [待核] extensor-digitorum.l insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.el.
- [待核] extensor-digitorum.r origin → humerus: proximity; pending; nodes none.
- [待核] extensor-digitorum.r insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e1r.
- [待核] extensor-digitorum.r insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e2r.
- [待核] extensor-digitorum.r insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e3r.
- [待核] extensor-digitorum.r insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e4r.
- [待核] extensor-digitorum.r insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e5r.
- [待核] extensor-digitorum.r insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e6r.
- [待核] extensor-digitorum.r insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.e7r.
- [待核] extensor-digitorum.r insertion → hand: .o/.e mesh; pending; nodes Extensor digitorum.er.
- [待核] extensor-carpi-ulnaris.l origin → humerus: proximity; pending; nodes none.
- [待核] extensor-carpi-ulnaris.l origin → ulna: proximity; pending; nodes none.
- [待核] extensor-carpi-ulnaris.l insertion → hand: proximity; pending; nodes none.
- [待核] extensor-carpi-ulnaris.r origin → humerus: proximity; pending; nodes none.
- [待核] extensor-carpi-ulnaris.r origin → ulna: proximity; pending; nodes none.
- [待核] extensor-carpi-ulnaris.r insertion → hand: proximity; pending; nodes none.
- [待核] brachialis.l origin → humerus: .o/.e mesh; pending; nodes Brachialis muscle.ol.
- [待核] brachialis.l insertion → ulna: .o/.e mesh; pending; nodes Brachialis muscle.el.
- [待核] brachialis.r origin → humerus: .o/.e mesh; pending; nodes Brachialis muscle.or.
- [待核] brachialis.r insertion → ulna: .o/.e mesh; pending; nodes Brachialis muscle.er.
- [待核] triceps-brachii-medial.l origin → humerus: .o/.e mesh; pending; nodes Medial head of triceps brachii.ol.
- [待核] triceps-brachii-medial.l insertion → ulna: .o/.e mesh; pending; nodes Triceps brachii muscle.el.
- [待核] triceps-brachii-medial.r origin → humerus: .o/.e mesh; pending; nodes Medial head of triceps brachii.or.
- [待核] triceps-brachii-medial.r insertion → ulna: .o/.e mesh; pending; nodes Triceps brachii muscle.er.
- [待核] coracobrachialis.l origin → scapula: .o/.e mesh; pending; nodes Coracobrachialis muscle.ol.
- [待核] coracobrachialis.l insertion → humerus: proximity; pending; nodes none.
- [待核] coracobrachialis.r origin → scapula: .o/.e mesh; pending; nodes Coracobrachialis muscle.or.
- [待核] coracobrachialis.r insertion → humerus: proximity; pending; nodes none.
- [待核] anconeus.l origin → humerus: .o/.e mesh; pending; nodes Anconeus muscle.ol.
- [待核] anconeus.l insertion → ulna: .o/.e mesh; pending; nodes Anconeus muscle.el.
- [待核] anconeus.r origin → humerus: .o/.e mesh; pending; nodes Anconeus muscle.or.
- [待核] anconeus.r insertion → ulna: .o/.e mesh; pending; nodes Anconeus muscle.er.
- [待核] extensor-carpi-radialis-brevis.l origin → humerus: proximity; pending; nodes none.
- [待核] extensor-carpi-radialis-brevis.l insertion → hand: .o/.e mesh; pending; nodes Extensor carpi radialis brevis.el.
- [待核] extensor-carpi-radialis-brevis.r origin → humerus: proximity; pending; nodes none.
- [待核] extensor-carpi-radialis-brevis.r insertion → hand: .o/.e mesh; pending; nodes Extensor carpi radialis brevis.er.
- [待核] flexor-digitorum-superficialis.l origin → humerus: proximity; pending; nodes none.
- [待核] flexor-digitorum-superficialis.l origin → ulna: proximity; pending; nodes none.
- [待核] flexor-digitorum-superficialis.l origin → radius: proximity; pending; nodes none.
- [待核] flexor-digitorum-superficialis.l insertion → hand: proximity; pending; nodes none.
- [待核] flexor-digitorum-superficialis.r origin → humerus: proximity; pending; nodes none.
- [待核] flexor-digitorum-superficialis.r origin → ulna: proximity; pending; nodes none.
- [待核] flexor-digitorum-superficialis.r origin → radius: proximity; pending; nodes none.
- [待核] flexor-digitorum-superficialis.r insertion → hand: proximity; pending; nodes none.
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
- [待核] pectoralis-major-clavicular.l origin → clavicle: .o/.e mesh; pending; nodes Pectoralis major muscle.ol.
- [待核] pectoralis-major-clavicular.l insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.el.
- [待核] pectoralis-major-clavicular.r origin → clavicle: .o/.e mesh; pending; nodes Pectoralis major muscle.or.
- [待核] pectoralis-major-clavicular.r insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.er.
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
- [待核] pectoralis-major-abdominal.l origin → ribs: .o/.e mesh; pending; nodes (Abdominal part of pectoralis major muscle).ol.
- [待核] pectoralis-major-abdominal.l insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.el.
- [待核] pectoralis-major-abdominal.r origin → ribs: .o/.e mesh; pending; nodes (Abdominal part of pectoralis major muscle).or.
- [待核] pectoralis-major-abdominal.r insertion → humerus: .o/.e mesh; pending; nodes Pectoralis major muscle.er.
- [待核] latissimus-dorsi.l origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.el.
- [待核] latissimus-dorsi.l origin → pelvis: .o/.e mesh; pending; nodes Latissimus dorsi muscle.ol.
- [待核] latissimus-dorsi.l insertion → humerus: proximity; pending; nodes none.
- [待核] latissimus-dorsi.r origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.er.
- [待核] latissimus-dorsi.r origin → pelvis: .o/.e mesh; pending; nodes Latissimus dorsi muscle.or.
- [待核] latissimus-dorsi.r insertion → humerus: proximity; pending; nodes none.

## Automatic warnings

- biceps-brachii-short.l insertion: no 2 mm contact; nearest 37.26 mm
- biceps-brachii-short.r insertion: no 2 mm contact; nearest 37.26 mm
- deltoid-lateral.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- deltoid-lateral.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- extensor-digitorum.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- extensor-digitorum.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- flexor-carpi-ulnaris.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- flexor-carpi-ulnaris.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- flexor-digitorum-superficialis.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- palmaris-longus.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- palmaris-longus.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.

## Automatic result

All decoded surface error, topology, attribute, joint, coordinate and output budget gates passed. Anatomical attachment review remains pending.

## Published skin-weight audit

Decoded published GLB SHA-256: `843d5a4de618b35de9637a7036138d5ce7a6ef1b9c6ea075aa869e0816234141`.

Shares sum decoded weights over referenced vertices, including UV/normal seams. Required alternatives are joints bordering the manifest attachment bones; allowed joints include intervening joints in the rig parent chain (e.g. shoulder between scapula and elbow). Radius uses elbow unless the rig provides a separate pronation joint. Missing attachment weights, unrelated joints above 30%, reversed fibre fields and violated persistent endpoint overrides and local weight outliers fail this gate. Outliers compare welded 1–2-ring dominant joints and area-weighted vectors; a discrepant vector must be over twice the neighbours’ median dominant-joint distance. Sub-edge detached scraps use nearby substantial surface rings because their component-local endpoint seeds are artificial; >1% discrepant weight mass on those scraps also fails. Smooth joint crossovers are excluded. Fixed counts refer to unique welded bind vertices.

Mannequin: all 19 full-body joints weighted; 0 shell mismatch flags. Right-axis exact mirror checks passed.

| Muscle | Joint shares | Required attachment joints | Fibre endpoints | Outliers remaining / fixed | Result |
|---|---|---|---|---|---|
| anconeus.l | elbow.l 70.49%, shoulder.l 29.51% | elbow.l / forearm.l, elbow.l / shoulder.l | origin → insertion | 0 / 1 | clean |
| anconeus.r | elbow.r 70.66%, shoulder.r 29.34% | elbow.r / forearm.r, elbow.r / shoulder.r | origin → insertion | 0 / 1 | clean |
| biceps-brachii-long.l | elbow.l 40.99%, shoulder.l 27.57%, forearm.l 20.51%, scapula.l 10.93% | forearm.l / hand.l, scapula.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| biceps-brachii-long.r | elbow.r 40.89%, shoulder.r 26.76%, forearm.r 21.44%, scapula.r 10.91% | forearm.r / hand.r, scapula.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| biceps-brachii-short.l | elbow.l 42.35%, shoulder.l 27.62%, forearm.l 15.43%, scapula.l 14.60% | forearm.l / hand.l, scapula.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| biceps-brachii-short.r | elbow.r 42.17%, shoulder.r 27.30%, forearm.r 15.91%, scapula.r 14.61% | forearm.r / hand.r, scapula.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| brachialis.l | shoulder.l 73.67%, elbow.l 26.33% | elbow.l / forearm.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| brachialis.r | shoulder.r 72.83%, elbow.r 27.17% | elbow.r / forearm.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| brachioradialis.l | elbow.l 51.33%, shoulder.l 32.72%, forearm.l 15.95% | forearm.l / hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| brachioradialis.r | elbow.r 51.85%, shoulder.r 32.55%, forearm.r 15.60% | forearm.r / hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| coracobrachialis.l | shoulder.l 59.09%, scapula.l 40.91% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| coracobrachialis.r | shoulder.r 58.86%, scapula.r 41.14% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| deltoid-anterior.l | scapula.l 42.80%, clavicle.l 42.53%, shoulder.l 14.67% | clavicle.l / scapula.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| deltoid-anterior.r | scapula.r 43.11%, clavicle.r 41.61%, shoulder.r 15.28% | clavicle.r / scapula.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| deltoid-lateral.l | scapula.l 56.58%, shoulder.l 43.42% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| deltoid-lateral.r | scapula.r 55.94%, shoulder.r 44.06% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| deltoid-posterior.l | scapula.l 55.24%, shoulder.l 44.76% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| deltoid-posterior.r | scapula.r 55.85%, shoulder.r 44.15% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| extensor-carpi-radialis-brevis.l | elbow.l 38.14%, forearm.l 25.94%, shoulder.l 23.47%, hand.l 12.45% | hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| extensor-carpi-radialis-brevis.r | elbow.r 38.71%, forearm.r 25.99%, shoulder.r 22.85%, hand.r 12.45% | hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| extensor-carpi-radialis-longus.l | shoulder.l 34.63%, elbow.l 33.24%, forearm.l 20.77%, hand.l 11.36% | hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 3 | clean |
| extensor-carpi-radialis-longus.r | shoulder.r 35.61%, elbow.r 33.96%, forearm.r 19.71%, hand.r 10.72% | hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 3 | clean |
| extensor-carpi-ulnaris.l | elbow.l 71.31%, forearm.l 18.69%, hand.l 10.00% | elbow.l / forearm.l, hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 1 | clean |
| extensor-carpi-ulnaris.r | elbow.r 71.51%, forearm.r 18.49%, hand.r 10.00% | elbow.r / forearm.r, hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 1 | clean |
| extensor-digitorum.l | hand.l 37.68%, forearm.l 29.90%, elbow.l 21.27%, shoulder.l 11.15% | hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| extensor-digitorum.r | hand.r 37.38%, forearm.r 30.20%, elbow.r 21.46%, shoulder.r 10.97% | hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| flexor-carpi-radialis.l | elbow.l 36.11%, forearm.l 29.15%, shoulder.l 22.55%, hand.l 12.19% | hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| flexor-carpi-radialis.r | elbow.r 34.83%, forearm.r 28.87%, shoulder.r 23.33%, hand.r 12.97% | hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| flexor-carpi-ulnaris.l | forearm.l 44.25%, elbow.l 42.60%, hand.l 13.16% | elbow.l / forearm.l, hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| flexor-carpi-ulnaris.r | forearm.r 44.49%, elbow.r 42.58%, hand.r 12.93% | elbow.r / forearm.r, hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| flexor-digitorum-superficialis.l | hand.l 42.80%, forearm.l 25.14%, elbow.l 16.36%, shoulder.l 15.69% | elbow.l / forearm.l, forearm.l / hand.l, hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 1 | clean |
| flexor-digitorum-superficialis.r | hand.r 40.81%, forearm.r 25.19%, elbow.r 17.44%, shoulder.r 16.56% | elbow.r / forearm.r, forearm.r / hand.r, hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 2 | clean |
| latissimus-dorsi.l | trunk 65.65%, shoulder.l 34.35% | elbow.l / shoulder.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| latissimus-dorsi.r | trunk 67.61%, shoulder.r 32.39% | elbow.r / shoulder.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| palmaris-longus.l | hand.l 35.70%, forearm.l 30.35%, elbow.l 18.98%, shoulder.l 14.96% | hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| palmaris-longus.r | hand.r 34.53%, forearm.r 30.54%, elbow.r 18.96%, shoulder.r 15.97% | hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| pectoralis-major-abdominal.l | trunk 62.49%, shoulder.l 37.51% | elbow.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-major-abdominal.r | trunk 62.48%, shoulder.r 37.52% | elbow.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-major-clavicular.l | clavicle.l 48.53%, scapula.l 27.84%, shoulder.l 23.63% | clavicle.l / scapula.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| pectoralis-major-clavicular.r | clavicle.r 47.31%, scapula.r 28.75%, shoulder.r 23.94% | clavicle.r / scapula.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| pectoralis-major-sternocostal.l | trunk 74.15%, shoulder.l 25.85% | elbow.l / shoulder.l, trunk | origin → insertion | 0 / 0 | clean |
| pectoralis-major-sternocostal.r | trunk 72.83%, shoulder.r 27.17% | elbow.r / shoulder.r, trunk | origin → insertion | 0 / 0 | clean |
| pronator-teres.l | forearm.l 58.09%, elbow.l 30.03%, shoulder.l 11.88% | elbow.l / forearm.l, forearm.l / hand.l, elbow.l / shoulder.l | origin → insertion | 0 / 2 | clean |
| pronator-teres.r | forearm.r 57.61%, elbow.r 30.39%, shoulder.r 12.00% | elbow.r / forearm.r, forearm.r / hand.r, elbow.r / shoulder.r | origin → insertion | 0 / 2 | clean |
| triceps-brachii-lateral.l | shoulder.l 66.64%, elbow.l 33.36% | elbow.l / forearm.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| triceps-brachii-lateral.r | shoulder.r 66.15%, elbow.r 33.85% | elbow.r / forearm.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| triceps-brachii-long.l | shoulder.l 44.46%, scapula.l 29.88%, elbow.l 25.66% | elbow.l / forearm.l, scapula.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| triceps-brachii-long.r | shoulder.r 44.01%, scapula.r 29.91%, elbow.r 26.08% | elbow.r / forearm.r, scapula.r / shoulder.r | origin → insertion | 0 / 0 | clean |
| triceps-brachii-medial.l | shoulder.l 69.11%, elbow.l 30.89% | elbow.l / forearm.l, elbow.l / shoulder.l | origin → insertion | 0 / 0 | clean |
| triceps-brachii-medial.r | shoulder.r 69.03%, elbow.r 30.97% | elbow.r / forearm.r, elbow.r / shoulder.r | origin → insertion | 0 / 0 | clean |

| Other mesh | Outliers remaining / fixed |
|---|---|
| hand.l | 0 / 0 |
| hand.r | 0 / 0 |
| humerus.l | 0 / 0 |
| humerus.r | 0 / 0 |
| radius.l | 0 / 0 |
| radius.r | 0 / 0 |
| scapula.l | 0 / 0 |
| scapula.r | 0 / 0 |
| skin-outline | 0 / 2 |
| ulna.l | 0 / 0 |
| ulna.r | 0 / 0 |

Audit result: **clean** (50 muscle nodes; 0 outliers remaining, 19 fixed).
