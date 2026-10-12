# Legs mesh review

Final GLB: **3,983,112 bytes**, **251,523 triangles**, **86 total nodes** (66 meshes, 19 joints, rig root).
Draw-call estimate: **66** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.

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

Native wire: 3964 triangles; the table below reports actual decoded triangles after degenerate cleanup. The schematic has a separate 35 mm sampled surface ceiling; opaque skin retains its 3 mm gate. Split skin coverage is checked as the union of body and both hands, and each part is checked against the full original source. Intentional wrist boundaries are allowed.

Budgets: soft 4,000,000 bytes / 350,000 triangles; hard 8,000,000 bytes / 500,000 triangles. Both soft limits pass for this output.


Display muscle and bone selections retain their reviewed topic scope. The mannequin uses full-body joints even where corresponding display bones are absent. No hand/foot intrinsic muscle geometry is fabricated.

## Final decoded surface audit

Sampled surface deviation: referenced vertices (approximately 3,000) plus 6,000 area-weighted interior points in each direction for whole meshes; split skin parts use final-to-whole-source distances plus a symmetric union coverage gate. This estimates surface error rather than certifying a global maximum. Source boundaries are preserved; nonmanifold/open sources retain disabled section filling.

| Mesh | Role | Source triangles | Final triangles | Deviation mm | Budget mm | Closed before → after | Boundary edges |
|---|---|---:|---:|---:|---:|---|---:|
| adductor-brevis.l | region | 2,132 | 2,132 | 0.002 | 0.5 | True → True | 0 |
| adductor-brevis.r | region | 2,132 | 2,132 | 0.002 | 0.5 | True → True | 0 |
| adductor-longus.l | region | 3,714 | 3,714 | 0.003 | 0.5 | True → True | 0 |
| adductor-longus.r | region | 3,714 | 3,714 | 0.003 | 0.5 | True → True | 0 |
| adductor-magnus.l | region | 8,192 | 3,996 | 0.428 | 0.5 | True → False | 0 |
| adductor-magnus.r | region | 8,192 | 3,990 | 0.426 | 0.5 | True → False | 0 |
| biceps-femoris-long.l | region | 7,258 | 6,858 | 0.339 | 0.5 | True → False | 0 |
| biceps-femoris-long.r | region | 7,258 | 6,848 | 0.339 | 0.5 | True → False | 0 |
| biceps-femoris-short.l | region | 2,476 | 2,476 | 0.004 | 0.5 | True → True | 0 |
| biceps-femoris-short.r | region | 2,476 | 2,476 | 0.004 | 0.5 | True → True | 0 |
| femur.l | bone | 3,794 | 3,794 | 0.005 | 1.0 | True → True | 0 |
| femur.r | bone | 3,794 | 3,794 | 0.006 | 1.0 | True → True | 0 |
| fibularis-longus.l | neighbour | 5,522 | 1,486 | 0.747 | 1.5 | True → False | 0 |
| fibularis-longus.r | neighbour | 5,522 | 1,480 | 0.975 | 1.5 | True → False | 0 |
| foot.l | bone | 16,586 | 4,784 | 0.791 | 1.0 | True → True | 0 |
| foot.r | bone | 16,586 | 4,740 | 0.702 | 1.0 | True → True | 0 |
| gastrocnemius-lateral.l | region | 4,908 | 3,996 | 0.236 | 0.5 | True → True | 0 |
| gastrocnemius-lateral.r | region | 4,908 | 3,996 | 0.236 | 0.5 | True → True | 0 |
| gastrocnemius-medial.l | region | 6,460 | 3,990 | 0.441 | 0.5 | False → False | 6 |
| gastrocnemius-medial.r | region | 6,460 | 3,990 | 0.441 | 0.5 | False → False | 6 |
| gluteus-maximus.l | region | 3,326 | 3,326 | 0.003 | 0.5 | True → True | 0 |
| gluteus-maximus.r | region | 3,326 | 3,326 | 0.003 | 0.5 | True → True | 0 |
| gluteus-medius.l | region | 5,176 | 3,998 | 0.420 | 0.5 | True → True | 0 |
| gluteus-medius.r | region | 5,176 | 3,998 | 0.420 | 0.5 | True → True | 0 |
| gluteus-minimus.l | region | 6,250 | 3,998 | 0.219 | 0.5 | True → False | 0 |
| gluteus-minimus.r | region | 6,250 | 3,996 | 0.219 | 0.5 | True → False | 0 |
| gracilis.l | region | 4,812 | 3,992 | 0.280 | 0.5 | True → True | 0 |
| gracilis.r | region | 4,812 | 3,994 | 0.233 | 0.5 | True → True | 0 |
| iliacus.l | neighbour | 4,354 | 1,496 | 1.258 | 1.5 | True → True | 0 |
| iliacus.r | neighbour | 4,354 | 1,494 | 0.861 | 1.5 | True → False | 0 |
| iliotibial-tract.l | region | 48,612 | 3,988 | 0.409 | 0.5 | True → False | 0 |
| iliotibial-tract.r | region | 48,612 | 3,994 | 0.428 | 0.5 | True → True | 0 |
| lower-leg.l | bone | 2,934 | 2,934 | 0.005 | 1.0 | True → True | 0 |
| lower-leg.r | bone | 2,934 | 2,934 | 0.020 | 1.0 | True → True | 0 |
| lumbar-spine | bone | 16,846 | 4,000 | 0.790 | 1.0 | False → True | 0 |
| patella.l | bone | 276 | 276 | 0.000 | 1.0 | True → True | 0 |
| patella.r | bone | 276 | 276 | 0.000 | 1.0 | True → True | 0 |
| pectineus.l | region | 1,952 | 1,952 | 0.001 | 0.5 | True → True | 0 |
| pectineus.r | region | 1,952 | 1,952 | 0.002 | 0.5 | True → True | 0 |
| pelvis | bone | 20,418 | 6,000 | 0.608 | 1.0 | False → False | 13 |
| psoas-major.l | neighbour | 5,474 | 1,498 | 1.105 | 1.5 | True → True | 0 |
| psoas-major.r | neighbour | 5,474 | 1,498 | 0.973 | 1.5 | True → True | 0 |
| rectus-femoris.l | region | 8,276 | 5,610 | 0.445 | 0.5 | True → True | 0 |
| rectus-femoris.r | region | 8,276 | 3,992 | 0.434 | 0.5 | True → True | 0 |
| sartorius.l | region | 4,966 | 3,990 | 0.359 | 0.5 | True → False | 0 |
| sartorius.r | region | 4,966 | 4,912 | 0.098 | 0.5 | True → True | 0 |
| semimembranosus.l | region | 7,442 | 3,996 | 0.402 | 0.5 | True → True | 0 |
| semimembranosus.r | region | 7,442 | 3,998 | 0.402 | 0.5 | True → False | 0 |
| semitendinosus.l | region | 4,316 | 3,998 | 0.130 | 0.5 | True → True | 0 |
| semitendinosus.r | region | 4,316 | 3,998 | 0.176 | 0.5 | True → True | 0 |
| skin-hand.l | skin | 100,818 | 1,112 | 2.244 | 3.0 | False → False | 62 |
| skin-hand.r | skin | 100,818 | 1,399 | 2.489 | 3.0 | False → False | 67 |
| skin-outline | skin | 100,818 | 18,778 | 2.042 | 3.0 | False → False | 298 |
| skin-wire | skin | 100,818 | 3,438 | 8.165 | 35.0 | False → False | 471 |
| soleus.l | region | 6,774 | 6,440 | 0.232 | 0.5 | True → False | 0 |
| soleus.r | region | 6,774 | 6,470 | 0.146 | 0.5 | True → False | 0 |
| tensor-fasciae-latae.l | region | 1,862 | 1,862 | 0.002 | 0.5 | True → True | 0 |
| tensor-fasciae-latae.r | region | 1,862 | 1,862 | 0.002 | 0.5 | True → True | 0 |
| tibialis-anterior.l | region | 3,526 | 3,526 | 0.005 | 0.5 | True → True | 0 |
| tibialis-anterior.r | region | 3,526 | 3,526 | 0.005 | 0.5 | True → True | 0 |
| vastus-intermedius.l | region | 6,164 | 3,988 | 0.390 | 0.5 | True → False | 0 |
| vastus-intermedius.r | region | 6,164 | 3,990 | 0.391 | 0.5 | True → False | 0 |
| vastus-lateralis.l | region | 9,356 | 6,334 | 0.431 | 0.5 | True → True | 0 |
| vastus-lateralis.r | region | 9,356 | 6,354 | 0.431 | 0.5 | True → True | 0 |
| vastus-medialis.l | region | 6,460 | 4,322 | 0.319 | 0.5 | True → True | 0 |
| vastus-medialis.r | region | 6,460 | 4,322 | 0.371 | 0.5 | True → True | 0 |

## Workbench previews

Studio lighting, paper #EDE7D6, orthographic evaluated non-skin bounds with 5% margin; shell composite at 30%. Superficial/intermediate layers move out 0.12/0.06 m; bones and neighbours remain fixed.

- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-exploded-by-layer.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-skin.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-wire-rest.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-pose.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-pose-front.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-pose-back.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-pose-left.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-pose-anatomy.png`
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-wire-pose.png`

Right angle convention: positive inputs; right axes signed by the engine mirrorSignedAxes rule. Positive inputs use the current engine’s mirrorSignedAxes rule with the real left/right joint midline normal; stored metadata remains the exact X-only axis reflection.
Pose inputs: {'shoulder.l.flexion': 90, 'elbow.r.flexion': 90, 'hip.l.flexion': 60, 'knee.r.flexion': 90, 'ankle.l.dorsiflexion': 15, 'ankle.r.dorsiflexion': 15}; femur.l centroid displacement 0.214131 m. All evaluated coordinates and muscle-edge stretches are finite.
Visual inspection results are recorded in `preview-review.md` after viewing every PNG.

## Frame and rig

Metres; Y up; front +Z; own left +X. Source region centre [0.0, 0.04269799590110779, 0.9112197160720825]; floorY -0.911602 m. Add −floorY for grounded full-body display.
Unexported reference bones locate joints and attachment candidates without adding out-of-region display bones. Hand joints pivot at wrist styloid midpoints; grip offsets are 0.08 m along the distal hand direction.

| Joint | Position X/Y/Z m | Parent | Evidence |
|---|---|---|---|
| trunk | 0.00000, 0.00000, -0.00000 | None | region frame |
| clavicle.l | 0.01669, 0.48987, 0.07745 | trunk | medial clavicle / sternoclavicular joint |
| scapula.l | 0.14956, 0.50597, 0.00698 | clavicle.l | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.l | 0.17262, 0.47527, 0.01686 | scapula.l | humeral head sphere fit; .i/.j landmark patch |
| elbow.l | 0.22319, 0.19950, 0.00269 | shoulder.l | midpoint of humeral epicondyle .i/.j cubes |
| forearm.l | 0.22319, 0.19950, 0.00269 | elbow.l | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.l | 0.26462, -0.06573, 0.05691 | forearm.l | midpoint of radial/ulnar styloid cubes |
| hip.l | 0.08529, -0.04019, 0.02773 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.l | 0.07621, -0.45528, 0.00960 | hip.l | midpoint of femoral epicondyle .i/.j cubes |
| ankle.l | 0.08182, -0.83191, -0.00076 | knee.l | midpoint of medial/lateral malleolar landmarks |
| clavicle.r | -0.01669, 0.48987, 0.07745 | trunk | medial clavicle / sternoclavicular joint |
| scapula.r | -0.14956, 0.50597, 0.00698 | clavicle.r | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.r | -0.17262, 0.47527, 0.01686 | scapula.r | humeral head sphere fit; .i/.j landmark patch |
| elbow.r | -0.22319, 0.19950, 0.00269 | shoulder.r | midpoint of humeral epicondyle .i/.j cubes |
| forearm.r | -0.22319, 0.19950, 0.00269 | elbow.r | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.r | -0.26464, -0.06573, 0.05691 | forearm.r | midpoint of radial/ulnar styloid cubes |
| hip.r | -0.08529, -0.04019, 0.02773 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.r | -0.07621, -0.45528, 0.00960 | hip.r | midpoint of femoral epicondyle .i/.j cubes |
| ankle.r | -0.07861, -0.83202, -0.00071 | knee.r | midpoint of medial/lateral malleolar landmarks |

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

- [待核] gluteus-maximus.l origin → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Gluteus maximus muscle.ol.
- [待核] gluteus-maximus.l insertion → femur: .o/.e mesh; pending; nodes Gluteus maximus muscle.el.
- [待核] gluteus-maximus.r origin → pelvis: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Gluteus maximus muscle.or.
- [待核] gluteus-maximus.r insertion → femur: .o/.e mesh; pending; nodes Gluteus maximus muscle.er.
- [待核] tensor-fasciae-latae.l origin → pelvis: .o/.e mesh; pending; nodes Tensor fasciae latae.ol.
- [待核] tensor-fasciae-latae.l insertion → iliotibial-tract: proximity; pending; nodes none.
- [待核] tensor-fasciae-latae.r origin → pelvis: .o/.e mesh; pending; nodes Tensor fasciae latae.or.
- [待核] tensor-fasciae-latae.r insertion → iliotibial-tract: proximity; pending; nodes none.
- [待核] iliotibial-tract.l origin → pelvis: proximity; pending; nodes none.
- [待核] iliotibial-tract.l origin → tensor-fasciae-latae: proximity; pending; nodes none.
- [待核] iliotibial-tract.l origin → gluteus-maximus: proximity; pending; nodes none.
- [待核] iliotibial-tract.l insertion → lower-leg: proximity; pending; nodes none.
- [待核] iliotibial-tract.r origin → pelvis: proximity; pending; nodes none.
- [待核] iliotibial-tract.r origin → tensor-fasciae-latae: proximity; pending; nodes none.
- [待核] iliotibial-tract.r origin → gluteus-maximus: proximity; pending; nodes none.
- [待核] iliotibial-tract.r insertion → lower-leg: proximity; pending; nodes none.
- [待核] sartorius.l origin → pelvis: .o/.e mesh; pending; nodes Sartorius muscle.ol.
- [待核] sartorius.l insertion → lower-leg: .o/.e mesh; pending; nodes Sartorius muscle.el.
- [待核] sartorius.r origin → pelvis: .o/.e mesh; pending; nodes Sartorius muscle.or.
- [待核] sartorius.r insertion → lower-leg: .o/.e mesh; pending; nodes Sartorius muscle.er.
- [待核] rectus-femoris.l origin → pelvis: .o/.e mesh; pending; nodes Rectus femoris muscle.ol.
- [待核] rectus-femoris.l insertion → patella: proximity; pending; nodes none.
- [待核] rectus-femoris.l insertion → lower-leg: proximity; pending; nodes none.
- [待核] rectus-femoris.r origin → pelvis: .o/.e mesh; pending; nodes Rectus femoris muscle.or.
- [待核] rectus-femoris.r insertion → patella: proximity; pending; nodes none.
- [待核] rectus-femoris.r insertion → lower-leg: proximity; pending; nodes none.
- [待核] vastus-lateralis.l origin → femur: .o/.e mesh; pending; nodes Vastus lateralis muscle.ol.
- [待核] vastus-lateralis.l insertion → lower-leg: proximity; pending; nodes none.
- [待核] vastus-lateralis.r origin → femur: .o/.e mesh; pending; nodes Vastus lateralis muscle.or.
- [待核] vastus-lateralis.r insertion → lower-leg: proximity; pending; nodes none.
- [待核] vastus-medialis.l origin → femur: .o/.e mesh; pending; nodes Vastus medialis muscle.ol.
- [待核] vastus-medialis.l insertion → patella: proximity; pending; nodes none.
- [待核] vastus-medialis.l insertion → lower-leg: proximity; pending; nodes none.
- [待核] vastus-medialis.r origin → femur: .o/.e mesh; pending; nodes Vastus medialis muscle.or.
- [待核] vastus-medialis.r insertion → patella: proximity; pending; nodes none.
- [待核] vastus-medialis.r insertion → lower-leg: proximity; pending; nodes none.
- [待核] biceps-femoris-long.l origin → pelvis: .o/.e mesh; pending; nodes Long head of biceps femoris.ol.
- [待核] biceps-femoris-long.l insertion → lower-leg: proximity; pending; nodes none.
- [待核] biceps-femoris-long.l insertion → lower-leg: proximity; pending; nodes none.
- [待核] biceps-femoris-long.r origin → pelvis: .o/.e mesh; pending; nodes Long head of biceps femoris.or.
- [待核] biceps-femoris-long.r insertion → lower-leg: proximity; pending; nodes none.
- [待核] biceps-femoris-long.r insertion → lower-leg: proximity; pending; nodes none.
- [待核] semitendinosus.l origin → pelvis: .o/.e mesh; pending; nodes Semitendinosus muscle.ol.
- [待核] semitendinosus.l insertion → lower-leg: .o/.e mesh; pending; nodes Semitendinosus muscle.el.
- [待核] semitendinosus.r origin → pelvis: .o/.e mesh; pending; nodes Semitendinosus muscle.or.
- [待核] semitendinosus.r insertion → lower-leg: .o/.e mesh; pending; nodes Semitendinosus muscle.er.
- [待核] gastrocnemius-medial.l origin → femur: .o/.e mesh; pending; nodes Medial head of gastrocnemius.ol.
- [待核] gastrocnemius-medial.l insertion → foot: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] gastrocnemius-medial.r origin → femur: .o/.e mesh; pending; nodes Medial head of gastrocnemius.or.
- [待核] gastrocnemius-medial.r insertion → foot: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] gastrocnemius-lateral.l origin → femur: .o/.e mesh; pending; nodes Lateral head of gastrocnemius.ol.
- [待核] gastrocnemius-lateral.l insertion → foot: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] gastrocnemius-lateral.r origin → femur: .o/.e mesh; pending; nodes Lateral head of gastrocnemius.or.
- [待核] gastrocnemius-lateral.r insertion → foot: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] tibialis-anterior.l origin → lower-leg: .o/.e mesh; pending; nodes Tibialis anterior muscle.ol.
- [待核] tibialis-anterior.l insertion → foot: .o/.e mesh; pending; nodes Tibialis anterior muscle.e1l.
- [待核] tibialis-anterior.l insertion → foot: .o/.e mesh; pending; nodes Tibialis anterior muscle.el.
- [待核] tibialis-anterior.r origin → lower-leg: .o/.e mesh; pending; nodes Tibialis anterior muscle.or.
- [待核] tibialis-anterior.r insertion → foot: .o/.e mesh; pending; nodes Tibialis anterior muscle.e1r.
- [待核] tibialis-anterior.r insertion → foot: .o/.e mesh; pending; nodes Tibialis anterior muscle.er.
- [待核] gluteus-medius.l origin → pelvis: .o/.e mesh; pending; nodes Gluteus medius muscle.ol.
- [待核] gluteus-medius.l insertion → femur: .o/.e mesh; pending; nodes Gluteus medius muscle.el.
- [待核] gluteus-medius.r origin → pelvis: .o/.e mesh; pending; nodes Gluteus medius muscle.or.
- [待核] gluteus-medius.r insertion → femur: .o/.e mesh; pending; nodes Gluteus medius muscle.er.
- [待核] adductor-longus.l origin → pelvis: .o/.e mesh; pending; nodes Adductor longus.ol.
- [待核] adductor-longus.l insertion → femur: .o/.e mesh; pending; nodes Adductor longus.el.
- [待核] adductor-longus.r origin → pelvis: .o/.e mesh; pending; nodes Adductor longus.or.
- [待核] adductor-longus.r insertion → femur: .o/.e mesh; pending; nodes Adductor longus.er.
- [待核] gracilis.l origin → pelvis: .o/.e mesh; pending; nodes Gracilis muscle.ol.
- [待核] gracilis.l insertion → lower-leg: .o/.e mesh; pending; nodes Gracilis muscle.el.
- [待核] gracilis.r origin → pelvis: .o/.e mesh; pending; nodes Gracilis muscle.or.
- [待核] gracilis.r insertion → lower-leg: .o/.e mesh; pending; nodes Gracilis muscle.er.
- [待核] pectineus.l origin → pelvis: .o/.e mesh; pending; nodes Pectineus muscle.ol.
- [待核] pectineus.l insertion → femur: proximity; pending; nodes none.
- [待核] pectineus.r origin → pelvis: .o/.e mesh; pending; nodes Pectineus muscle.or.
- [待核] pectineus.r insertion → femur: .o/.e mesh; pending; nodes Pectineus muscle.el.
- [待核] semimembranosus.l origin → pelvis: .o/.e mesh; pending; nodes Semimembranosus muscle.ol.
- [待核] semimembranosus.l insertion → lower-leg: .o/.e mesh; pending; nodes Semimembranosus muscle.el.
- [待核] semimembranosus.r origin → pelvis: .o/.e mesh; pending; nodes Semimembranosus muscle.or.
- [待核] semimembranosus.r insertion → lower-leg: .o/.e mesh; pending; nodes Semimembranosus muscle.er.
- [待核] biceps-femoris-short.l origin → femur: proximity; pending; nodes none.
- [待核] biceps-femoris-short.l insertion → lower-leg: proximity; pending; nodes none.
- [待核] biceps-femoris-short.l insertion → lower-leg: proximity; pending; nodes none.
- [待核] biceps-femoris-short.r origin → femur: .o/.e mesh; pending; nodes Short head of biceps femoris.el.
- [待核] biceps-femoris-short.r insertion → lower-leg: proximity; pending; nodes none.
- [待核] biceps-femoris-short.r insertion → lower-leg: proximity; pending; nodes none.
- [待核] soleus.l origin → lower-leg: .o/.e mesh; pending; nodes Soleus muscle.o1l.
- [待核] soleus.l origin → lower-leg: .o/.e mesh; pending; nodes Soleus muscle.ol.
- [待核] soleus.l insertion → foot: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] soleus.r origin → lower-leg: .o/.e mesh; pending; nodes Soleus muscle.o1r.
- [待核] soleus.r origin → lower-leg: .o/.e mesh; pending; nodes Soleus muscle.or.
- [待核] soleus.r insertion → foot: proximity; REQUIRED: no vertices within 2 mm; nodes none.
- [待核] gluteus-minimus.l origin → pelvis: .o/.e mesh; pending; nodes Gluteus minimus muscle.ol.
- [待核] gluteus-minimus.l insertion → femur: proximity; pending; nodes none.
- [待核] gluteus-minimus.r origin → pelvis: .o/.e mesh; pending; nodes Gluteus minimus muscle.or.
- [待核] gluteus-minimus.r insertion → femur: proximity; pending; nodes none.
- [待核] vastus-intermedius.l origin → femur: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Vastus intermedius muscle.ol.
- [待核] vastus-intermedius.l insertion → patella: proximity; pending; nodes none.
- [待核] vastus-intermedius.l insertion → lower-leg: proximity; pending; nodes none.
- [待核] vastus-intermedius.r origin → femur: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Vastus intermedius muscle.or.
- [待核] vastus-intermedius.r insertion → patella: proximity; pending; nodes none.
- [待核] vastus-intermedius.r insertion → lower-leg: proximity; pending; nodes none.
- [待核] adductor-brevis.l origin → pelvis: proximity; pending; nodes none.
- [待核] adductor-brevis.l insertion → femur: proximity; pending; nodes none.
- [待核] adductor-brevis.r origin → pelvis: proximity; pending; nodes none.
- [待核] adductor-brevis.r insertion → femur: proximity; pending; nodes none.
- [待核] adductor-magnus.l origin → pelvis: .o/.e mesh; pending; nodes Adductor magnus.ol.
- [待核] adductor-magnus.l insertion → femur: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Adductor magnus.el.
- [待核] adductor-magnus.r origin → pelvis: .o/.e mesh; pending; nodes Adductor magnus.or.
- [待核] adductor-magnus.r insertion → femur: .o/.e mesh; REQUIRED: attachment away from named surface; nodes Adductor magnus.er.
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
- [待核] fibularis-longus.l origin → lower-leg: .o/.e mesh; pending; nodes Fibularis longus muscle.ol.
- [待核] fibularis-longus.l insertion → foot: proximity; pending; nodes none.
- [待核] fibularis-longus.l insertion → foot: proximity; pending; nodes none.
- [待核] fibularis-longus.r origin → lower-leg: .o/.e mesh; pending; nodes Fibularis longus muscle.or.
- [待核] fibularis-longus.r insertion → foot: proximity; pending; nodes none.
- [待核] fibularis-longus.r insertion → foot: proximity; pending; nodes none.

## Automatic warnings

- gastrocnemius-medial.l insertion: no 2 mm contact; nearest 125.59 mm
- gastrocnemius-medial.r insertion: no 2 mm contact; nearest 125.59 mm
- gastrocnemius-lateral.l insertion: no 2 mm contact; nearest 139.34 mm
- gastrocnemius-lateral.r insertion: no 2 mm contact; nearest 139.34 mm
- soleus.l insertion: no 2 mm contact; nearest 56.37 mm
- soleus.r insertion: no 2 mm contact; nearest 56.37 mm
- adductor-magnus.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- adductor-magnus.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- biceps-femoris-long.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- biceps-femoris-long.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- fibularis-longus.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- fibularis-longus.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- gluteus-minimus.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- gluteus-minimus.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- iliacus.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- iliotibial-tract.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- sartorius.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- semimembranosus.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- soleus.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- soleus.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- vastus-intermedius.l: closedness changed, section filling disabled; nonmanifold source/simplification needs review.
- vastus-intermedius.r: closedness changed, section filling disabled; nonmanifold source/simplification needs review.

## Automatic result

All decoded surface error, topology, attribute, joint, coordinate and output budget gates passed. Anatomical attachment review remains pending.

## Published skin-weight audit

Decoded published GLB SHA-256: `0491bd76be00bce16bf562144ed5986a8131f68a13d550c3c7d3f7569ed22e2e`.

Shares sum decoded weights over referenced vertices, including UV/normal seams. Required alternatives are joints bordering the manifest attachment bones; allowed joints include intervening joints in the rig parent chain (e.g. shoulder between scapula and elbow). Radius uses elbow unless the rig provides a separate pronation joint. Missing attachment weights, unrelated joints above 30%, reversed fibre fields and violated persistent endpoint overrides and local weight outliers fail this gate. Outliers compare welded 1–2-ring dominant joints and area-weighted vectors; a discrepant vector must be over twice the neighbours’ median dominant-joint distance. Sub-edge detached scraps use nearby substantial surface rings because their component-local endpoint seeds are artificial; >1% discrepant weight mass on those scraps also fails. Smooth joint crossovers are excluded. Fixed counts refer to unique welded bind vertices.

skin-wire: all 19 full-body joints weighted; 0 shell mismatch flags. Right-axis exact mirror checks passed.

| Muscle | Joint shares | Required attachment joints | Fibre endpoints | Outliers remaining / fixed | Result |
|---|---|---|---|---|---|
| adductor-brevis.l | hip.l 74.70%, trunk 25.30% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| adductor-brevis.r | hip.r 74.67%, trunk 25.33% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| adductor-longus.l | hip.l 68.68%, trunk 31.32% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| adductor-longus.r | hip.r 68.83%, trunk 31.17% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| adductor-magnus.l | hip.l 75.45%, trunk 24.55% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| adductor-magnus.r | hip.r 75.46%, trunk 24.54% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| biceps-femoris-long.l | hip.l 54.12%, trunk 22.99%, knee.l 22.89% | ankle.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| biceps-femoris-long.r | hip.r 54.53%, trunk 23.33%, knee.r 22.14% | ankle.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| biceps-femoris-short.l | hip.l 81.18%, knee.l 18.82% | hip.l / knee.l, ankle.l / knee.l | origin → insertion | 0 / 0 | clean |
| biceps-femoris-short.r | hip.r 77.32%, knee.r 22.68% | hip.r / knee.r, ankle.r / knee.r | origin → insertion | 0 / 0 | clean |
| fibularis-longus.l | knee.l 65.51%, ankle.l 34.49% | ankle.l, ankle.l / knee.l | origin → insertion | 0 / 0 | clean |
| fibularis-longus.r | knee.r 66.85%, ankle.r 33.15% | ankle.r, ankle.r / knee.r | origin → insertion | 0 / 0 | clean |
| gastrocnemius-lateral.l | knee.l 52.16%, hip.l 29.58%, ankle.l 18.26% | ankle.l, hip.l / knee.l | origin → insertion | 0 / 0 | clean |
| gastrocnemius-lateral.r | knee.r 52.12%, hip.r 29.03%, ankle.r 18.85% | ankle.r, hip.r / knee.r | origin → insertion | 0 / 0 | clean |
| gastrocnemius-medial.l | knee.l 49.25%, hip.l 31.40%, ankle.l 19.35% | ankle.l, hip.l / knee.l | origin → insertion | 0 / 3 | clean |
| gastrocnemius-medial.r | knee.r 49.29%, hip.r 31.89%, ankle.r 18.83% | ankle.r, hip.r / knee.r | origin → insertion | 0 / 3 | clean |
| gluteus-maximus.l | trunk 51.36%, hip.l 48.64% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| gluteus-maximus.r | trunk 51.70%, hip.r 48.30% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| gluteus-medius.l | trunk 58.83%, hip.l 41.17% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| gluteus-medius.r | trunk 59.27%, hip.r 40.73% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| gluteus-minimus.l | trunk 58.39%, hip.l 41.61% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 5 | clean |
| gluteus-minimus.r | trunk 58.40%, hip.r 41.60% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 5 | clean |
| gracilis.l | hip.l 47.50%, trunk 34.67%, knee.l 17.83% | ankle.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| gracilis.r | hip.r 47.10%, trunk 35.73%, knee.r 17.17% | ankle.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| iliacus.l | trunk 64.41%, hip.l 35.59% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| iliacus.r | trunk 65.01%, hip.r 34.99% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| iliotibial-tract.l | hip.l 72.53%, knee.l 27.47% | hip.l / knee.l, ankle.l / knee.l, hip.l / trunk | origin → insertion | 0 / 7 | clean |
| iliotibial-tract.r | hip.r 73.30%, knee.r 26.70% | hip.r / knee.r, ankle.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| pectineus.l | trunk 64.50%, hip.l 35.50% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| pectineus.r | trunk 65.03%, hip.r 34.97% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| psoas-major.l | trunk 78.41%, hip.l 21.59% | hip.l / knee.l, trunk | origin → insertion | 0 / 0 | clean |
| psoas-major.r | trunk 77.54%, hip.r 22.46% | hip.r / knee.r, trunk | origin → insertion | 0 / 0 | clean |
| rectus-femoris.l | hip.l 39.44%, knee.l 33.60%, trunk 26.96% | ankle.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| rectus-femoris.r | hip.r 38.92%, knee.r 33.32%, trunk 27.77% | ankle.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| sartorius.l | hip.l 48.66%, knee.l 26.61%, trunk 24.74% | ankle.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| sartorius.r | hip.r 49.15%, knee.r 25.65%, trunk 25.20% | ankle.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| semimembranosus.l | hip.l 50.96%, knee.l 31.52%, trunk 17.53% | ankle.l / knee.l, hip.l / trunk | origin → insertion | 0 / 4 | clean |
| semimembranosus.r | hip.r 50.89%, knee.r 31.29%, trunk 17.82% | ankle.r / knee.r, hip.r / trunk | origin → insertion | 0 / 4 | clean |
| semitendinosus.l | hip.l 36.14%, trunk 34.96%, knee.l 28.90% | ankle.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| semitendinosus.r | hip.r 36.23%, trunk 34.81%, knee.r 28.96% | ankle.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| soleus.l | knee.l 72.72%, ankle.l 27.28% | ankle.l, ankle.l / knee.l | origin → insertion | 0 / 0 | clean |
| soleus.r | knee.r 72.18%, ankle.r 27.82% | ankle.r, ankle.r / knee.r | origin → insertion | 0 / 0 | clean |
| tensor-fasciae-latae.l | hip.l 67.63%, trunk 32.37% | hip.l / knee.l, hip.l / trunk | origin → insertion | 0 / 0 | clean |
| tensor-fasciae-latae.r | hip.r 67.50%, trunk 32.50% | hip.r / knee.r, hip.r / trunk | origin → insertion | 0 / 0 | clean |
| tibialis-anterior.l | knee.l 75.40%, ankle.l 24.60% | ankle.l, ankle.l / knee.l | origin → insertion | 0 / 0 | clean |
| tibialis-anterior.r | knee.r 74.62%, ankle.r 25.38% | ankle.r, ankle.r / knee.r | origin → insertion | 0 / 0 | clean |
| vastus-intermedius.l | hip.l 76.51%, knee.l 23.49% | hip.l / knee.l, ankle.l / knee.l | origin → insertion | 0 / 0 | clean |
| vastus-intermedius.r | hip.r 76.34%, knee.r 23.66% | hip.r / knee.r, ankle.r / knee.r | origin → insertion | 0 / 0 | clean |
| vastus-lateralis.l | hip.l 80.64%, knee.l 19.36% | hip.l / knee.l, ankle.l / knee.l | origin → insertion | 0 / 0 | clean |
| vastus-lateralis.r | hip.r 80.52%, knee.r 19.48% | hip.r / knee.r, ankle.r / knee.r | origin → insertion | 0 / 0 | clean |
| vastus-medialis.l | hip.l 74.04%, knee.l 25.96% | hip.l / knee.l, ankle.l / knee.l | origin → insertion | 0 / 0 | clean |
| vastus-medialis.r | hip.r 73.98%, knee.r 26.02% | hip.r / knee.r, ankle.r / knee.r | origin → insertion | 0 / 0 | clean |

Skin nodes: `skin-outline, skin-hand.l, skin-hand.r, skin-wire`. Both hand nodes are rigidly bound to their named hand joint. Wrist half-space checks pass at 5 mm distal to the styloid midpoint; wrist openings are intentionally open.


| Other mesh | Outliers remaining / fixed |
|---|---|
| femur.l | 0 / 0 |
| femur.r | 0 / 0 |
| foot.l | 0 / 0 |
| foot.r | 0 / 0 |
| lower-leg.l | 0 / 0 |
| lower-leg.r | 0 / 0 |
| lumbar-spine | 0 / 0 |
| patella.l | 0 / 0 |
| patella.r | 0 / 0 |
| pelvis | 0 / 0 |
| skin-hand.l | 0 / 0 |
| skin-hand.r | 0 / 0 |
| skin-outline | 0 / 4 |
| skin-wire | 0 / 12 |

Audit result: **clean** (52 muscle nodes; 0 outliers remaining, 47 fixed).
