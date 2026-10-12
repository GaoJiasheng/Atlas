# Core mesh review

Final GLB: **3,671,156 bytes**, **274,634 triangles**, **37 total nodes** (33 meshes, 3 joints, rig root).
Draw-call estimate: **33** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.

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
| erector-spinae-lumbar.l | region | 19,690 | 11,362 | 0.375 | 0.5 | True → False | 0 |
| erector-spinae-lumbar.r | region | 19,690 | 7,884 | 0.439 | 0.5 | True → False | 0 |
| external-oblique.l | region | 29,622 | 12,168 | 0.465 | 0.5 | True → False | 0 |
| external-oblique.r | region | 29,622 | 12,188 | 0.408 | 0.5 | True → False | 0 |
| femur.l | bone | 3,794 | 3,794 | 0.005 | 1.0 | True → True | 0 |
| femur.r | bone | 3,794 | 3,794 | 0.010 | 1.0 | True → True | 0 |
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
| skin-outline | skin | 100,818 | 29,812 | 1.358 | 3.0 | False → False | 168 |
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
- `/Users/gavin/work/atlas/scripts/anatomy/cache/core-preview-pose.png`

Pose inputs: {'trunk.rotation': 12, 'hip.l.flexion': 25}; femur.l centroid displacement 0.074396 m. All evaluated coordinates and muscle-edge stretches are finite.
Visual inspection results are recorded in `preview-review.md` after viewing every PNG.

## Frame and rig

Metres; Y up; front +Z; own left +X. Source region centre [0.0, 0.03147326037287712, 1.0404850244522095]; floorY -1.040867 m. Add −floorY for grounded full-body display.
Unexported reference bones locate joints and attachment candidates without adding out-of-region display bones. Hand joints pivot at wrist styloid midpoints; grip offsets are 0.08 m along the distal hand direction.

| Joint | Position X/Y/Z m | Parent | Evidence |
|---|---|---|---|
| trunk | 0.00000, 0.00000, -0.00000 | None | region frame |
| hip.l | 0.08529, -0.16946, 0.01650 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |
| hip.r | -0.08529, -0.16946, 0.01650 | trunk | acetabulum .i/.j cube cross-checked against femoral head sphere fit |

Full-body draft motion keys outside this regional rig: ankle.l, ankle.r, clavicle.l, clavicle.r, elbow.l, elbow.r, hand.l, hand.r, knee.l, knee.r, scapula.l, scapula.r, shoulder.l, shoulder.r. They need a whole-body motion driver; this export provides the relevant regional joints only.
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
