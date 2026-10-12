# Shoulders mesh review

Final GLB: **2,112,884 bytes**, **150,985 triangles**, **57 total nodes** (45 meshes, 11 joints, rig root).
Draw-call estimate: **45** opaque primitives; skin overlay adds its shell pass. Both 4 MB and 350,000 triangle ceilings enforced.

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
| serratus-anterior.l | neighbour | 25,240 | 1,930 | 1.291 | 1.5 | True → False | 0 |
| serratus-anterior.r | neighbour | 25,240 | 2,008 | 1.479 | 1.5 | True → False | 0 |
| skin-outline | skin | 100,818 | 29,791 | 1.481 | 3.0 | False → False | 172 |
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
- `/Users/gavin/work/atlas/scripts/anatomy/cache/shoulders-preview-pose.png`

Pose inputs: {'shoulder.l.flexion': 55, 'elbow.l.flexion': 75}; humerus.l centroid displacement 0.129863 m. All evaluated coordinates and muscle-edge stretches are finite.
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
| hand.l | 0.26462, -0.56460, 0.01293 | elbow.l | midpoint of radial/ulnar styloid cubes |
| clavicle.r | -0.01669, -0.00899, 0.03347 | trunk | medial clavicle / sternoclavicular joint |
| scapula.r | -0.14956, 0.00710, -0.03700 | clavicle.r | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.r | -0.17262, -0.02359, -0.02712 | scapula.r | humeral head sphere fit; .i/.j landmark patch |
| elbow.r | -0.22319, -0.29937, -0.04129 | shoulder.r | midpoint of humeral epicondyle .i/.j cubes |
| hand.r | -0.26464, -0.56460, 0.01293 | elbow.r | midpoint of radial/ulnar styloid cubes |

Full-body draft motion keys outside this regional rig: ankle.l, ankle.r, hip.l, hip.r, knee.l, knee.r. They need a whole-body motion driver; this export provides the relevant regional joints only.
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

Decoded published GLB SHA-256: `eadd5ac55266c3d4688b9908437b74df0b2513e4cd2f2988754df8f8465ec24e`.

Shares sum decoded weights over referenced vertices, including UV/normal seams. Required alternatives are joints bordering the manifest attachment bones; allowed joints include intervening joints in the rig parent chain (e.g. shoulder between scapula and elbow). Radius uses elbow unless the rig provides a separate pronation joint. Missing attachment weights, unrelated joints above 30%, reversed fibre fields and violated persistent endpoint overrides fail this gate.

| Muscle | Joint shares | Required attachment joints | Fibre endpoints | Result |
|---|---|---|---|---|
| biceps-brachii-long.l | shoulder.l 55.19%, elbow.l 27.20%, scapula.l 17.61% | elbow.l / hand.l, scapula.l / shoulder.l | origin → insertion | clean |
| biceps-brachii-long.r | shoulder.r 53.97%, elbow.r 29.15%, scapula.r 16.88% | elbow.r / hand.r, scapula.r / shoulder.r | origin → insertion | clean |
| deltoid-anterior.l | scapula.l 43.25%, clavicle.l 42.12%, shoulder.l 14.63% | clavicle.l / scapula.l, elbow.l / shoulder.l | origin → insertion | clean |
| deltoid-anterior.r | scapula.r 43.26%, clavicle.r 41.92%, shoulder.r 14.82% | clavicle.r / scapula.r, elbow.r / shoulder.r | origin → insertion | clean |
| deltoid-lateral.l | scapula.l 57.50%, shoulder.l 42.50% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | clean |
| deltoid-lateral.r | scapula.r 57.03%, shoulder.r 42.97% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | clean |
| deltoid-posterior.l | scapula.l 54.23%, shoulder.l 45.77% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | clean |
| deltoid-posterior.r | scapula.r 54.81%, shoulder.r 45.19% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | clean |
| infraspinatus.l | scapula.l 71.41%, shoulder.l 28.59% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | clean |
| infraspinatus.r | scapula.r 72.50%, shoulder.r 27.50% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | clean |
| latissimus-dorsi.l | trunk 65.07%, shoulder.l 34.93% | elbow.l / shoulder.l, hip.l / trunk | origin → insertion | clean |
| latissimus-dorsi.r | trunk 67.15%, shoulder.r 32.85% | elbow.r / shoulder.r, hip.r / trunk | origin → insertion | clean |
| pectoralis-major-clavicular.l | clavicle.l 48.53%, scapula.l 27.84%, shoulder.l 23.63% | clavicle.l / scapula.l, elbow.l / shoulder.l | origin → insertion | clean |
| pectoralis-major-clavicular.r | clavicle.r 47.31%, scapula.r 28.75%, shoulder.r 23.94% | clavicle.r / scapula.r, elbow.r / shoulder.r | origin → insertion | clean |
| pectoralis-major-sternocostal.l | trunk 74.56%, shoulder.l 25.44% | elbow.l / shoulder.l, trunk | origin → insertion | clean |
| pectoralis-major-sternocostal.r | trunk 73.09%, shoulder.r 26.91% | elbow.r / shoulder.r, trunk | origin → insertion | clean |
| rhomboid-major.l | trunk 36.99%, scapula.l 32.25%, clavicle.l 30.75% | scapula.l / shoulder.l, trunk | origin → insertion | clean |
| rhomboid-major.r | trunk 36.86%, clavicle.r 31.64%, scapula.r 31.50% | scapula.r / shoulder.r, trunk | origin → insertion | clean |
| serratus-anterior.l | clavicle.l 40.75%, trunk 40.42%, scapula.l 18.83% | scapula.l / shoulder.l, trunk | origin → insertion | clean |
| serratus-anterior.r | trunk 43.92%, clavicle.r 36.64%, scapula.r 19.44% | scapula.r / shoulder.r, trunk | origin → insertion | clean |
| subscapularis.l | scapula.l 68.53%, shoulder.l 31.47% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | clean |
| subscapularis.r | scapula.r 68.11%, shoulder.r 31.89% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | clean |
| supraspinatus.l | shoulder.l 50.71%, scapula.l 49.29% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | clean |
| supraspinatus.r | shoulder.r 51.54%, scapula.r 48.46% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | clean |
| teres-major.l | shoulder.l 50.29%, scapula.l 49.71% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | clean |
| teres-major.r | shoulder.r 51.11%, scapula.r 48.89% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | clean |
| teres-minor.l | scapula.l 60.41%, shoulder.l 39.59% | scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | clean |
| teres-minor.r | scapula.r 59.89%, shoulder.r 40.11% | scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | clean |
| trapezius-descending.l | trunk 73.92%, clavicle.l 26.08% | clavicle.l / scapula.l, trunk | persistent bounds endpoints | clean |
| trapezius-descending.r | trunk 75.35%, clavicle.r 24.65% | clavicle.r / scapula.r, trunk | persistent bounds endpoints | clean |
| trapezius-transverse.l | trunk 52.44%, clavicle.l 27.64%, scapula.l 19.92% | scapula.l / shoulder.l, trunk | origin → insertion | clean |
| trapezius-transverse.r | trunk 53.38%, clavicle.r 27.31%, scapula.r 19.30% | scapula.r / shoulder.r, trunk | origin → insertion | clean |
| triceps-brachii.l | shoulder.l 66.54%, elbow.l 23.10%, scapula.l 10.36% | elbow.l / hand.l, scapula.l / shoulder.l, elbow.l / shoulder.l | origin → insertion | clean |
| triceps-brachii.r | shoulder.r 65.23%, elbow.r 24.55%, scapula.r 10.22% | elbow.r / hand.r, scapula.r / shoulder.r, elbow.r / shoulder.r | origin → insertion | clean |

Audit result: **clean** (34 muscle nodes).
