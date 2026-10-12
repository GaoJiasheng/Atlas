# Core mesh review

Final GLB: **3,828,212 bytes**, **280,452 triangles**, **56 total nodes** (36 meshes, 19 joints, rig root).
Draw-call estimate: **36** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.

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

Native wire: 3945 triangles; the table below reports actual decoded triangles after degenerate cleanup. The schematic has a separate 35 mm sampled surface ceiling; opaque skin retains its 3 mm gate. Split skin coverage is checked as the union of body and both hands, and each part is checked against the full original source. Intentional wrist boundaries are allowed.

Budgets: soft 4,000,000 bytes / 350,000 triangles; hard 8,000,000 bytes / 500,000 triangles. Both soft limits pass for this output.


Display muscle and bone selections retain their reviewed topic scope. The mannequin uses full-body joints even where corresponding display bones are absent. No hand/foot intrinsic muscle geometry is fabricated.

## Final decoded surface audit

Sampled surface deviation: referenced vertices (approximately 3,000) plus 6,000 area-weighted interior points in each direction for whole meshes; split skin parts use final-to-whole-source distances plus a symmetric union coverage gate. This estimates surface error rather than certifying a global maximum. Source boundaries are preserved; nonmanifold/open sources retain disabled section filling.

| Mesh | Role | Source triangles | Final triangles | Deviation mm | Budget mm | Closed before → after | Boundary edges |
|---|---|---:|---:|---:|---:|---|---:|
| erector-spinae-lumbar.l | region | 19,690 | 11,362 | 0.375 | 0.5 | True → False | 0 |
| erector-spinae-lumbar.r | region | 19,690 | 7,884 | 0.439 | 0.5 | True → False | 0 |
| external-oblique.l | region | 29,622 | 12,168 | 0.465 | 0.5 | True → False | 0 |
| external-oblique.r | region | 29,622 | 12,188 | 0.408 | 0.5 | True → False | 0 |
| femur.l | bone | 3,794 | 3,794 | 0.005 | 1.0 | True → True | 0 |
| femur.r | bone | 3,794 | 3,794 | 0.005 | 1.0 | True → True | 0 |
| gluteus-maximus.l | neighbour | 3,326 | 2,900 | 0.572 | 1.5 | True → True | 0 |
| gluteus-maximus.r | neighbour | 3,326 | 2,896 | 0.572 | 1.5 | True → True | 0 |
| iliacus.l | region | 4,354 | 4,264 | 0.167 | 0.5 | True → True | 0 |
| iliacus.r | region | 4,354 | 4,272 | 0.167 | 0.5 | True → True | 0 |
| internal-oblique.l | region | 28,869 | 26,691 | 0.258 | 0.5 | False → False | 5 |
| internal-oblique.r | region | 28,869 | 26,673 | 0.256 | 0.5 | False → False | 5 |
| latissimus-dorsi.l | neighbour | 21,580 | 2,062 | 1.210 | 1.5 | True → True | 0 |
| latissimus-dorsi.r | neighbour | 21,580 | 2,054 | 1.292 | 1.5 | True → True | 0 |
| lumbar-spine | bone | 16,846 | 5,996 | 0.587 | 1.0 | False → True | 0 |
| multifidus-lumborum.l | region | 2,820 | 2,820 | 0.002 | 0.5 | True → True | 0 |
| multifidus-lumborum.r | region | 2,820 | 2,820 | 0.002 | 0.5 | True → True | 0 |
| pelvis | bone | 20,418 | 12,000 | 0.184 | 1.0 | False → False | 13 |
| psoas-major.l | region | 5,474 | 3,992 | 0.465 | 0.5 | True → True | 0 |
| psoas-major.r | region | 5,474 | 3,992 | 0.452 | 0.5 | True → True | 0 |
| quadratus-lumborum.l | region | 2,832 | 2,832 | 0.002 | 0.5 | True → True | 0 |
| quadratus-lumborum.r | region | 2,832 | 2,832 | 0.002 | 0.5 | True → True | 0 |
| rectus-abdominis.l | region | 20,604 | 5,418 | 0.405 | 0.5 | True → False | 0 |
| rectus-abdominis.r | region | 20,604 | 10,828 | 0.271 | 0.5 | True → True | 0 |
| serratus-anterior.l | neighbour | 25,240 | 1,900 | 1.209 | 1.5 | True → False | 0 |
| serratus-anterior.r | neighbour | 25,240 | 1,966 | 1.345 | 1.5 | True → False | 0 |
| skin-hand.l | skin | 100,818 | 1,869 | 1.413 | 3.0 | False → False | 87 |
| skin-hand.r | skin | 100,818 | 2,153 | 1.561 | 3.0 | False → False | 83 |
| skin-outline | skin | 100,818 | 28,182 | 1.396 | 3.0 | False → False | 336 |
| skin-wire | skin | 100,818 | 3,426 | 8.345 | 35.0 | False → False | 460 |
| tensor-fasciae-latae.l | neighbour | 1,862 | 1,500 | 0.324 | 1.5 | True → False | 0 |
| tensor-fasciae-latae.r | neighbour | 1,862 | 1,500 | 0.324 | 1.5 | True → False | 0 |
| thoracic-spine | bone | 27,527 | 14,974 | 0.491 | 1.0 | False → False | 4 |
| thorax | bone | 274,709 | 24,984 | 0.478 | 1.0 | False → False | 9 |
| transversus-abdominis.l | region | 34,328 | 10,764 | 0.469 | 0.5 | True → True | 0 |
| transversus-abdominis.r | region | 34,328 | 10,702 | 0.457 | 0.5 | True → True | 0 |

## Workbench previews

Studio lighting, paper #EDE7D6, orthographic evaluated non-skin bounds with 5% margin; shell composite at 30%. Superficial/intermediate layers move out 0.12/0.06 m; bones and neighbours remain fixed.

- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-exploded-by-layer.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-skin.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-wire-rest.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-pose.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-pose-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-pose-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-pose-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-pose-anatomy.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-wire-pose.png`

Right angle convention: positive inputs; right axes signed by the engine mirrorSignedAxes rule. Positive inputs use the current engine’s mirrorSignedAxes rule with the real left/right joint midline normal; stored metadata remains the exact X-only axis reflection.
Pose inputs: {'shoulder.l.flexion': 90, 'elbow.r.flexion': 90, 'hip.l.flexion': 60, 'knee.r.flexion': 90, 'ankle.l.dorsiflexion': 15, 'ankle.r.dorsiflexion': 15}; femur.l centroid displacement 0.214131 m. All evaluated coordinates and muscle-edge stretches are finite.
Visual inspection results are recorded in `preview-review.md` after viewing every PNG.

## Frame and rig

Metres; Y up; front +Z; own left +X. Source region centre [0.0, 0.03147326037287712, 1.0404850244522095]; floorY -1.040867 m. Add −floorY for grounded full-body display.
Unexported reference bones locate joints and attachment candidates without adding out-of-region display bones. Hand joints pivot at wrist styloid midpoints; grip offsets are 0.08 m along the distal hand direction.

| Joint | Position X/Y/Z m | Parent | Evidence |
|---|---|---|---|
| trunk | 0.00000, 0.00000, -0.00000 | None | region frame |
| clavicle.l | 0.01669, 0.36061, 0.06622 | trunk | medial clavicle / sternoclavicular joint |
| scapula.l | 0.14956, 0.37670, -0.00425 | clavicle.l | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.l | 0.17262, 0.34601, 0.00563 | scapula.l | humeral head sphere fit; .i/.j landmark patch |
| elbow.l | 0.22319, 0.07023, -0.00854 | shoulder.l | midpoint of humeral epicondyle .i/.j cubes |
| forearm.l | 0.22319, 0.07023, -0.00854 | elbow.l | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.l | 0.26462, -0.19500, 0.04568 | forearm.l | midpoint of radial/ulnar styloid cubes |
| hip.l | 0.08529, -0.16946, 0.01650 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.l | 0.07621, -0.58454, -0.00162 | hip.l | midpoint of femoral epicondyle .i/.j cubes |
| ankle.l | 0.08182, -0.96118, -0.01198 | knee.l | midpoint of medial/lateral malleolar landmarks |
| clavicle.r | -0.01669, 0.36061, 0.06622 | trunk | medial clavicle / sternoclavicular joint |
| scapula.r | -0.14956, 0.37670, -0.00425 | clavicle.r | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.r | -0.17262, 0.34601, 0.00563 | scapula.r | humeral head sphere fit; .i/.j landmark patch |
| elbow.r | -0.22319, 0.07023, -0.00854 | shoulder.r | midpoint of humeral epicondyle .i/.j cubes |
| forearm.r | -0.22319, 0.07023, -0.00854 | elbow.r | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.r | -0.26464, -0.19500, 0.04568 | forearm.r | midpoint of radial/ulnar styloid cubes |
| hip.r | -0.08529, -0.16946, 0.01650 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.r | -0.07621, -0.58454, -0.00162 | hip.r | midpoint of femoral epicondyle .i/.j cubes |
| ankle.r | -0.07861, -0.96128, -0.01193 | knee.r | midpoint of medial/lateral malleolar landmarks |

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
| forearm | rotation | 0.999999913 |
| forearm | internal-rotation | 0.999999913 |
| forearm | external-rotation | 0.999999913 |
| forearm | horizontal-abduction | 1.000000000 |
| forearm | horizontal-adduction | 1.000000000 |
| forearm | elevation | 1.000000000 |
| forearm | depression | 1.000000000 |
| forearm | protraction | 1.000000000 |
| forearm | retraction | 1.000000000 |
| forearm | upward-rotation | 1.000000000 |
| forearm | downward-rotation | 1.000000000 |
| forearm | lateral-flexion | 1.000000000 |
| forearm | pronation | 0.999999913 |
| forearm | supination | 0.999999913 |
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
| knee | rotation | 1.000000049 |
| knee | internal-rotation | 1.000000049 |
| knee | external-rotation | 1.000000049 |
| knee | horizontal-abduction | 1.000000000 |
| knee | horizontal-adduction | 1.000000000 |
| knee | elevation | 1.000000000 |
| knee | depression | 1.000000000 |
| knee | protraction | 1.000000000 |
| knee | retraction | 1.000000000 |
| knee | upward-rotation | 1.000000000 |
| knee | downward-rotation | 1.000000000 |
| knee | lateral-flexion | 1.000000000 |
| knee | pronation | 1.000000049 |
| knee | supination | 1.000000049 |
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

- [待核] rectus-abdominis.l origin → pelvis: proximity; pending; nodes none.
- [待核] rectus-abdominis.l insertion → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Rectus abdominis muscle.el.
- [待核] rectus-abdominis.l insertion → ribs: .o/.e mesh; pending; nodes Rectus abdominis muscle.ol.
- [待核] rectus-abdominis.r origin → pelvis: proximity; pending; nodes none.
- [待核] rectus-abdominis.r insertion → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Rectus abdominis muscle.er.
- [待核] rectus-abdominis.r insertion → ribs: .o/.e mesh; pending; nodes Rectus abdominis muscle.or.
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
- [待核] internal-oblique.l origin → pelvis: .o/.e mesh; pending; nodes Internal abdominal oblique muscle.o3l.
- [待核] internal-oblique.l insertion → ribs: .o/.e mesh; pending; nodes Internal abdominal oblique muscle.o1l.
- [待核] internal-oblique.l insertion → ribs: .o/.e mesh; pending; nodes Internal abdominal oblique muscle.o2l.
- [待核] internal-oblique.l insertion → ribs: .o/.e mesh; pending; nodes Internal abdominal oblique muscle.o4l.
- [待核] internal-oblique.l insertion → ribs: .o/.e mesh; pending; nodes Internal abdominal oblique muscle.ol.
- [待核] internal-oblique.r origin → pelvis: .o/.e mesh; pending; nodes Internal abdominal oblique muscle.o3r.
- [待核] internal-oblique.r insertion → ribs: .o/.e mesh; pending; nodes Internal abdominal oblique muscle.o1r.
- [待核] internal-oblique.r insertion → ribs: .o/.e mesh; pending; nodes Internal abdominal oblique muscle.o2r.
- [待核] internal-oblique.r insertion → ribs: .o/.e mesh; pending; nodes Internal abdominal oblique muscle.o4r.
- [待核] internal-oblique.r insertion → ribs: .o/.e mesh; pending; nodes Internal abdominal oblique muscle.or.
- [待核] erector-spinae-lumbar.l origin → pelvis: proximity; pending; nodes none.
- [待核] erector-spinae-lumbar.l origin → pelvis: proximity; pending; nodes none.
- [待核] erector-spinae-lumbar.l origin → lumbar-spine: proximity; pending; nodes none.
- [待核] erector-spinae-lumbar.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e10l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e11l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e12l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e13l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e14l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e15l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e16l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e17l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e18l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e19l.
- [待核] erector-spinae-lumbar.l insertion → lumbar-spine: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Longissimus thoracis muscle.e1l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e20l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e21l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e22l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e23l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e24l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e25l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e26l.
- [待核] erector-spinae-lumbar.l insertion → lumbar-spine: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Longissimus thoracis muscle.e2l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e3l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e4l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e5l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e6l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e7l.
- [待核] erector-spinae-lumbar.l insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e8l.
- [待核] erector-spinae-lumbar.l insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e9l.
- [待核] erector-spinae-lumbar.l insertion → lumbar-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.el.
- [待核] erector-spinae-lumbar.r origin → pelvis: proximity; pending; nodes none.
- [待核] erector-spinae-lumbar.r origin → pelvis: proximity; pending; nodes none.
- [待核] erector-spinae-lumbar.r origin → lumbar-spine: proximity; pending; nodes none.
- [待核] erector-spinae-lumbar.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e10r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e11r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e12r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e13r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e14r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e15r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e16r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e17r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e18r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e19r.
- [待核] erector-spinae-lumbar.r insertion → lumbar-spine: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Longissimus thoracis muscle.e1r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e20r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e21r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e22r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e23r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e24r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e25r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e26r.
- [待核] erector-spinae-lumbar.r insertion → lumbar-spine: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Longissimus thoracis muscle.e2r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e3r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e4r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e5r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e6r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e7r.
- [待核] erector-spinae-lumbar.r insertion → ribs: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e8r.
- [待核] erector-spinae-lumbar.r insertion → thoracic-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.e9r.
- [待核] erector-spinae-lumbar.r insertion → lumbar-spine: .o/.e mesh; pending; nodes Longissimus thoracis muscle.er.
- [待核] transversus-abdominis.l origin → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Transversus abdominis muscle.ol.
- [待核] transversus-abdominis.l insertion → pelvis: proximity; pending; nodes none.
- [待核] transversus-abdominis.r origin → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Transversus abdominis muscle.or.
- [待核] transversus-abdominis.r insertion → pelvis: proximity; pending; nodes none.
- [待核] quadratus-lumborum.l origin → pelvis: proximity; pending; nodes none.
- [待核] quadratus-lumborum.l insertion → ribs: proximity; pending; nodes none.
- [待核] quadratus-lumborum.l insertion → lumbar-spine: proximity; pending; nodes none.
- [待核] quadratus-lumborum.r origin → pelvis: proximity; pending; nodes none.
- [待核] quadratus-lumborum.r insertion → ribs: proximity; pending; nodes none.
- [待核] quadratus-lumborum.r insertion → lumbar-spine: proximity; pending; nodes none.
- [待核] multifidus-lumborum.l origin → lumbar-spine: proximity; pending; nodes none.
- [待核] multifidus-lumborum.l insertion → lumbar-spine: proximity; pending; nodes none.
- [待核] multifidus-lumborum.l insertion → thoracic-spine: proximity; pending; nodes none.
- [待核] multifidus-lumborum.r origin → lumbar-spine: proximity; pending; nodes none.
- [待核] multifidus-lumborum.r insertion → lumbar-spine: proximity; pending; nodes none.
- [待核] multifidus-lumborum.r insertion → thoracic-spine: proximity; pending; nodes none.
- [待核] psoas-major.l origin → thoracic-spine: proximity; pending; nodes none.
- [待核] psoas-major.l origin → lumbar-spine: proximity; pending; nodes none.
- [待核] psoas-major.l insertion → femur: proximity; pending; nodes none.
- [待核] psoas-major.r origin → thoracic-spine: proximity; pending; nodes none.
- [待核] psoas-major.r origin → lumbar-spine: proximity; pending; nodes none.
- [待核] psoas-major.r insertion → femur: proximity; pending; nodes none.
- [待核] iliacus.l origin → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Iliacus muscle.ol.
- [待核] iliacus.l insertion → femur: proximity; pending; nodes none.
- [待核] iliacus.r origin → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Iliacus muscle.or.
- [待核] iliacus.r insertion → femur: proximity; pending; nodes none.
- [待核] gluteus-maximus.l origin → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Gluteus maximus muscle.ol.
- [待核] gluteus-maximus.l insertion → femur: .o/.e mesh; pending; nodes Gluteus maximus muscle.el.
- [待核] gluteus-maximus.r origin → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Gluteus maximus muscle.or.
- [待核] gluteus-maximus.r insertion → femur: .o/.e mesh; pending; nodes Gluteus maximus muscle.er.
- [待核] tensor-fasciae-latae.l origin → pelvis: .o/.e mesh; pending; nodes Tensor fasciae latae.ol.
- [待核] tensor-fasciae-latae.l insertion → iliotibial-tract: proximity; pending; nodes none.
- [待核] tensor-fasciae-latae.r origin → pelvis: .o/.e mesh; pending; nodes Tensor fasciae latae.or.
- [待核] tensor-fasciae-latae.r insertion → iliotibial-tract: proximity; pending; nodes none.
- [待核] latissimus-dorsi.l origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.el.
- [待核] latissimus-dorsi.l origin → pelvis: .o/.e mesh; pending; nodes Latissimus dorsi muscle.ol.
- [待核] latissimus-dorsi.l insertion → humerus: proximity; pending; nodes none.
- [待核] latissimus-dorsi.r origin → ribs: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Latissimus dorsi muscle.er.
- [待核] latissimus-dorsi.r origin → pelvis: .o/.e mesh; pending; nodes Latissimus dorsi muscle.or.
- [待核] latissimus-dorsi.r insertion → humerus: proximity; pending; nodes none.
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

- erector-spinae-lumbar.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- erector-spinae-lumbar.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- external-oblique.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- external-oblique.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- rectus-abdominis.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- serratus-anterior.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- serratus-anterior.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- tensor-fasciae-latae.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- tensor-fasciae-latae.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.

## Automatic result

All decoded surface error, topology, attribute, joint, coordinate and output budget gates passed. Anatomical attachment review remains pending.

## Published skin-weight audit

Decoded published GLB SHA-256: `18aa3fa529eb7ff90b226c45fc1504d6ef8533b049f90a54adeb824637409573`.

Shares sum decoded weights over referenced vertices, including UV/normal seams. Required alternatives are joints bordering the manifest attachment bones; allowed joints include intervening joints in the rig parent chain (e.g. shoulder between scapula and elbow). Radius uses elbow unless the rig provides a separate pronation joint. Missing attachment weights, unrelated joints above 30%, reversed fibre fields and violated persistent endpoint overrides and local weight outliers fail this gate. Outliers compare welded 1–2-ring dominant joints and area-weighted vectors; a discrepant vector must be over twice the neighbours’ median dominant-joint distance. Sub-edge detached scraps use nearby substantial surface rings because their component-local endpoint seeds are artificial; >1% discrepant weight mass on those scraps also fails. Smooth joint crossovers are excluded. Fixed counts refer to unique welded bind vertices.

skin-wire: all 19 full-body joints weighted; 0 shell mismatch flags. Right-axis exact mirror checks passed.

| Muscle | Joint shares | Required attachment joints | Fibre endpoints | Outliers remaining / fixed | Result |
|---|---|---|---|---|---|
| erector-spinae-lumbar.l | trunk 100.00% | hip.l / trunk | origin → insertion | 0 / 0 | clean |
| erector-spinae-lumbar.r | trunk 100.00% | hip.r / trunk | origin → insertion | 0 / 0 | clean |
| external-oblique.l | trunk 100.00% | hip.l / trunk | origin → insertion | 0 / 0 | clean |
| external-oblique.r | trunk 100.00% | hip.r / trunk | origin → insertion | 0 / 0 | clean |
| gluteus-maximus.l | trunk 51.72%, hip.l 48.28% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| gluteus-maximus.r | trunk 51.86%, hip.r 48.14% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| iliacus.l | trunk 63.47%, hip.l 36.53% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| iliacus.r | trunk 63.39%, hip.r 36.61% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| internal-oblique.l | trunk 100.00% | hip.l / trunk | origin → insertion | 0 / 0 | clean |
| internal-oblique.r | trunk 100.00% | hip.r / trunk | origin → insertion | 0 / 0 | clean |
| latissimus-dorsi.l | trunk 66.05%, shoulder.l 33.95% | elbow.l / shoulder.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| latissimus-dorsi.r | trunk 67.64%, shoulder.r 32.36% | elbow.r / shoulder.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| multifidus-lumborum.l | trunk 100.00% | hip.l / trunk | named surfaces: ambiguous/shared | 0 / 0 | clean |
| multifidus-lumborum.r | trunk 100.00% | hip.r / trunk | named surfaces: ambiguous/shared | 0 / 0 | clean |
| psoas-major.l | trunk 77.92%, hip.l 22.08% | hip.l / knee.l, trunk | origin → insertion | 0 / 0 | clean |
| psoas-major.r | trunk 77.60%, hip.r 22.40% | hip.r / knee.r, trunk | origin → insertion | 0 / 0 | clean |
| quadratus-lumborum.l | trunk 100.00% | hip.l / trunk | origin → insertion | 0 / 0 | clean |
| quadratus-lumborum.r | trunk 100.00% | hip.r / trunk | origin → insertion | 0 / 0 | clean |
| rectus-abdominis.l | trunk 100.00% | hip.l / trunk | origin → insertion | 0 / 0 | clean |
| rectus-abdominis.r | trunk 100.00% | hip.r / trunk | origin → insertion | 0 / 0 | clean |
| serratus-anterior.l | clavicle.l 41.71%, trunk 39.07%, scapula.l 19.22% | scapula.l / shoulder.l, trunk | origin → insertion | 0 / 5 | clean |
| serratus-anterior.r | trunk 44.55%, clavicle.r 36.78%, scapula.r 18.66% | scapula.r / shoulder.r, trunk | origin → insertion | 0 / 5 | clean |
| tensor-fasciae-latae.l | hip.l 67.79%, trunk 32.21% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| tensor-fasciae-latae.r | hip.r 67.43%, trunk 32.57% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| transversus-abdominis.l | trunk 100.00% | hip.l / trunk | named surfaces: ambiguous/shared | 0 / 0 | clean |
| transversus-abdominis.r | trunk 100.00% | hip.r / trunk | named surfaces: ambiguous/shared | 0 / 0 | clean |

Skin nodes: `skin-outline, skin-hand.l, skin-hand.r, skin-wire`. Both hand nodes are rigidly bound to their named hand joint. Wrist half-space checks pass at 5 mm distal to the styloid midpoint; wrist openings are intentionally open.


| Other mesh | Outliers remaining / fixed |
|---|---|
| femur.l | 0 / 0 |
| femur.r | 0 / 0 |
| lumbar-spine | 0 / 0 |
| pelvis | 0 / 0 |
| skin-hand.l | 0 / 0 |
| skin-hand.r | 0 / 0 |
| skin-outline | 0 / 1 |
| skin-wire | 0 / 21 |
| thoracic-spine | 0 / 0 |
| thorax | 0 / 0 |

Audit result: **clean** (26 muscle nodes; 0 outliers remaining, 32 fixed).
