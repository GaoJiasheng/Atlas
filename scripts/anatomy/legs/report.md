# Legs mesh review

Final GLB: **3,983,156 bytes**, **244,638 triangles**, **71 total nodes** (63 meshes, 7 joints, rig root).
Draw-call estimate: **63** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.

Native Blender, cached FBX only. Geometry and derived rig/attachment data: CC BY-SA 4.0.

## Source coverage and scope

- Selected from docs/16 §5.3, region reviews and exact cached FBX inventory; no mirrored geometry.
- Parent/group cards are not duplicated as meshes. Neighbours include adjacent exercise secondary/stabiliser muscles; distant whole-body stabilisers excluded.
- Reference surfaces outside the exported bone list are used only for attachment and joint evidence.
- Whole neighbour muscle extents retained at low budget; educational crops remain [待核].
- Intrinsic hand/foot muscles and deep forearm flexors excluded by v1 scope; hand/foot bones are merged per side.
- Optional thoracolumbar fascia, linea alba and diaphragm omitted. Linea-alba attachment evidence uses the unexported named source surface.
- No named region muscle is missing in Z-Anatomy; multifidus uses the actual paired lumbar meshes, not rotatores or invented geometry.

The core erector-spinae-lumbar part merges full lumbar iliocostalis and thoracic longissimus sources; extent remains [待核]. No multifidus substitute was necessary. Intercostal meshes are not region parts for these five topics; thorax includes actual ribs, cartilages and sternum. No hand/foot intrinsic muscle geometry is fabricated.

## Final decoded surface audit

Symmetric sampled Hausdorff: referenced vertices (approximately 3,000) plus 6,000 area-weighted interior points in each direction. This estimates surface error rather than certifying a global maximum. Source boundaries are preserved; nonmanifold/open sources retain disabled section filling.

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
| skin-outline | skin | 100,818 | 17,842 | 2.648 | 3.0 | False → False | 173 |
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
- `/Users/gavin/work/atlas/scripts/anatomy/cache/legs-preview-pose.png`

Pose inputs: {'hip.l.flexion': 35, 'knee.l.flexion': 55, 'ankle.l.dorsiflexion': 10}; femur.l centroid displacement 0.128781 m. All evaluated coordinates and muscle-edge stretches are finite.
Visual inspection results are recorded in `preview-review.md` after viewing every PNG.

## Frame and rig

Metres; Y up; front +Z; own left +X. Source region centre [0.0, 0.04269799590110779, 0.9112197160720825]; floorY -0.911602 m. Add −floorY for grounded full-body display.
Unexported reference bones locate joints and attachment candidates without adding out-of-region display bones. Hand joints pivot at wrist styloid midpoints; grip offsets are 0.08 m along the distal hand direction.

| Joint | Position X/Y/Z m | Parent | Evidence |
|---|---|---|---|
| trunk | 0.00000, 0.00000, -0.00000 | None | region frame |
| hip.l | 0.08529, -0.04019, 0.02773 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.l | 0.07621, -0.45528, 0.00960 | hip.l | midpoint of femoral epicondyle .i/.j cubes |
| ankle.l | 0.08182, -0.83191, -0.00076 | knee.l | midpoint of medial/lateral malleolar landmarks |
| hip.r | -0.08529, -0.04019, 0.02773 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| knee.r | -0.07621, -0.45528, 0.00960 | hip.r | midpoint of femoral epicondyle .i/.j cubes |
| ankle.r | -0.07861, -0.83202, -0.00071 | knee.r | midpoint of medial/lateral malleolar landmarks |

Full-body draft motion keys outside this regional rig: clavicle.l, clavicle.r, elbow.l, elbow.r, hand.l, hand.r, scapula.l, scapula.r, shoulder.l, shoulder.r. They need a whole-body motion driver; this export provides the relevant regional joints only.
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
