# Back mesh review

Final GLB: **3,834,448 bytes**, **267,885 triangles**, **71 total nodes** (59 meshes, 11 joints, rig root).
Draw-call estimate: **59** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.

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
| skin-outline | skin | 100,818 | 29,797 | 1.389 | 3.0 | False → False | 161 |
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
| trapezius-descending.l | region | 6,760 | 3,988 | 0.370 | 0.5 | True → True | 0 |
| trapezius-descending.r | region | 6,760 | 3,988 | 0.370 | 0.5 | True → True | 0 |
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
- `/Users/gavin/work/atlas/scripts/anatomy/cache/back-preview-pose.png`

Pose inputs: {'shoulder.l.flexion': 55, 'elbow.l.flexion': 75}; humerus.l centroid displacement 0.129254 m. All evaluated coordinates and muscle-edge stretches are finite.
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
| hand.l | 0.26462, -0.35275, 0.06348 | elbow.l | midpoint of radial/ulnar styloid cubes |
| clavicle.r | -0.01669, 0.20286, 0.08402 | trunk | medial clavicle / sternoclavicular joint |
| scapula.r | -0.14956, 0.21895, 0.01355 | clavicle.r | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.r | -0.17262, 0.18826, 0.02343 | scapula.r | humeral head sphere fit; .i/.j landmark patch |
| elbow.r | -0.22319, -0.08752, 0.00926 | shoulder.r | midpoint of humeral epicondyle .i/.j cubes |
| hand.r | -0.26464, -0.35275, 0.06348 | elbow.r | midpoint of radial/ulnar styloid cubes |

Full-body draft motion keys outside this regional rig: ankle.l, ankle.r, hip.l, hip.r, knee.l, knee.r. They need a whole-body motion driver; this export provides the relevant regional joints only.
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
