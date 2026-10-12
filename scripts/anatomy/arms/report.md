# Arms mesh review

Final GLB: **3,078,272 bytes**, **193,602 triangles**, **75 total nodes** (61 meshes, 13 joints, rig root).
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

The core erector-spinae-lumbar part merges full lumbar iliocostalis and thoracic longissimus sources; extent remains [待核]. No multifidus substitute was necessary. Intercostal meshes are not region parts for these five topics; thorax includes actual ribs, cartilages and sternum. No hand/foot intrinsic muscle geometry is fabricated.

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

Pose inputs: {'shoulder.l.flexion': 55, 'elbow.l.flexion': 75, 'forearm.l.pronation': 65, 'hand.l.flexion': 15}; humerus.l centroid displacement 0.129443 m. All evaluated coordinates and muscle-edge stretches are finite.
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
| clavicle.r | -0.01669, 0.15273, 0.06554 | trunk | medial clavicle / sternoclavicular joint |
| scapula.r | -0.14956, 0.16883, -0.00493 | clavicle.r | lateral clavicle / acromioclavicular joint; glenoid landmark retained |
| shoulder.r | -0.17262, 0.13813, 0.00495 | scapula.r | humeral head sphere fit; .i/.j landmark patch |
| elbow.r | -0.22319, -0.13764, -0.00922 | shoulder.r | midpoint of humeral epicondyle .i/.j cubes |
| forearm.r | -0.22319, -0.13764, -0.00922 | elbow.r | elbow centre to ulnar styloid rotation axis; ulna stays on elbow |
| hand.r | -0.26464, -0.40287, 0.04500 | forearm.r | midpoint of radial/ulnar styloid cubes |

Full-body draft motion keys outside this regional rig: ankle.l, ankle.r, hip.l, hip.r, knee.l, knee.r. They need a whole-body motion driver; this export provides the relevant regional joints only.
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
