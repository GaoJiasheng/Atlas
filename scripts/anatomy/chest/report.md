# Chest mesh review

Final GLB: **3,685,024 bytes** (3.685 MB), **231,986 triangles**.

Geometry and attachments: CC BY-SA 4.0.

## Surface audit

Symmetric sample-based Hausdorff: approximately 3,000 vertices and 6,000 area-weighted interior samples per direction. Distances are to triangles, in metres, after final quantization and compression decode. This is a sampled estimate, not a certified global maximum. Positional seams are compacted and source boundaries stay locked during simplification. Unreferenced vertices are excluded from the surface samples. Final topology welds coincident UV/normal seam vertices at 0.1 µm for geometric closedness.

| Mesh | Role | Before | Final | Max sample deviation (mm) | Budget (mm) | Closed before → final | Boundary edges |
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
| skin-outline | skin | 100,818 | 29,785 | 1.206 | 3.0 | False → False | 157 |
| subclavius.l | region | 794 | 794 | 0.001 | 0.5 | True → True | 0 |
| subclavius.r | region | 794 | 794 | 0.001 | 0.5 | True → True | 0 |
| thoracic-spine | bone | 27,527 | 14,981 | 0.334 | 1.0 | False → False | 2 |
| thorax | bone | 274,709 | 24,990 | 0.421 | 1.0 | False → False | 9 |
| triceps-brachii.l | neighbour | 10,264 | 2,996 | 0.658 | 1.5 | True → True | 0 |
| triceps-brachii.r | neighbour | 10,264 | 2,996 | 0.746 | 1.5 | True → True | 0 |

## Native preview and motion checks

Renderer: Blender Workbench studio; flat paper #EDE7D6, orthographic non-skin framing with 5% margin per edge.
The five review images are front, back, body-left, exploded-by-layer and opaque full-body skin. The pose image uses the decoded final GLB skin, with shoulder.l and elbow.l flexion inputs of 90°.
Measured left humerus forward displacement (+Z): 0.145641 m; resulting upper-arm/forearm bend: 103.00° (includes the source rest angle). All sampled muscle edges remain finite.
The midline column is thoracic spine: source sternum centroid z=0.02616 m, spine centroid z=-0.11519 m. Spine is posterior and its transform agrees with the source audit.
Visual inspection confirmed both sides, three pec-major parts per side, pec minor beneath, serratus slips along ribs, intercostals between ribs, midline sternum, posterior scapulae, hanging arm bones and a connected posed axilla. The exploded-by-layer preview lifts superficial and intermediate structures to inspect underlying anatomy.
The opaque skin and translucent same-camera shell passes place the selected anatomy inside the source body outline; source regional skin seams remain visible. Anatomical attachment approval remains separate.


## Budgets and coordinate gates

Native Blender FBX → glTF pipeline; 39 mesh nodes, 11 joints and 1 rig root.
Soft targets: 3,685,024 / 4,000,000 bytes; 231,986 / 350,000 triangles.
Mandatory caps: intercostals external/internal 20,000 each; external oblique 8,000 per side; skin 30,000; thorax 25,000.
Coordinates: metres, Y up, front +Z, own left +X. Chest centre is the inferior manubrium / sternal angle.
Chest source centre: [-1.6483021681779064e-05, -0.055000342428684235, 1.3499360084533691]; centred floorY = -1.350318 m (add chest-centre height to recover source floor).

## Rig sanity

| Joint | Position (m; X, Y, Z) | Source | Unit axes |
|---|---|---|---|
| trunk | 0.00000, 0.00000, -0.00000 | sternal angle frame | passed |
| clavicle.l | 0.01670, 0.05116, -0.02025 | medial end of clavicle (sternoclavicular joint) | passed |
| scapula.l | 0.14958, 0.06725, -0.09072 | lateral end of clavicle (acromioclavicular joint); glenoid: glenoid .j landmark | passed |
| shoulder.l | 0.17264, 0.03656, -0.08084 | humeral head sphere fit | passed |
| elbow.l | 0.22320, -0.23922, -0.09501 | midpoint of epicondyle .j landmarks | passed |
| wrist.l | 0.24355, -0.50444, -0.04325 | styloid landmark / distal forearm | passed |
| clavicle.r | -0.01667, 0.05116, -0.02025 | medial end of clavicle (sternoclavicular joint) | passed |
| scapula.r | -0.14955, 0.06725, -0.09072 | lateral end of clavicle (acromioclavicular joint); glenoid: glenoid .j landmark | passed |
| shoulder.r | -0.17260, 0.03656, -0.08084 | humeral head sphere fit | passed |
| elbow.r | -0.22317, -0.23922, -0.09501 | midpoint of epicondyle .j landmarks | passed |
| wrist.r | -0.24351, -0.50444, -0.04325 | styloid landmark / distal forearm | passed |

Shoulder and elbow flexion axes point toward −X: a downward left arm rotates toward +Z. Preview check poses the decoded final skin at shoulder.l flexion 90° and elbow.l flexion 90°; see cache/chest-preview-pose.png.

## Attachment candidates against spec §1.3

Every box is a human review gate. Geometry proximity does not verify anatomy. The spec itself leaves rib counts and tendon wording pending; no external references were fetched.

- [ ] **pectoralis-major-clavicular · F-1/F-2**: origin on medial half of anterior clavicle; insertion at lateral lip of intertubercular groove.
  - [ ] pectoralis-major-clavicular.l origin → clavicle: [0.0334, 0.0490, -0.0106]; [0.0614, 0.0527, -0.0188]; [0.0858, 0.0555, -0.0379]; .o/.e mesh Pectoralis major muscle.ol; pending.
  - [ ] pectoralis-major-clavicular.l insertion → humerus: [0.1979, -0.0449, -0.0711]; [0.1943, -0.0351, -0.0708]; [0.1834, -0.0118, -0.0709]; .o/.e mesh Pectoralis major muscle.el; pending.
  - [ ] pectoralis-major-clavicular.r origin → clavicle: [-0.0857, 0.0555, -0.0379]; [-0.0614, 0.0527, -0.0188]; [-0.0334, 0.0490, -0.0106]; .o/.e mesh Pectoralis major muscle.or; pending.
  - [ ] pectoralis-major-clavicular.r insertion → humerus: [-0.1979, -0.0449, -0.0711]; [-0.1943, -0.0351, -0.0708]; [-0.1834, -0.0118, -0.0709]; .o/.e mesh Pectoralis major muscle.er; pending.
- [ ] **pectoralis-major-sternocostal · F-1/F-2**: origin at anterior sternum and upper six costal cartilages; insertion at lateral lip; review 1–6 versus 2–6.
  - [ ] pectoralis-major-sternocostal.l origin → ribs: [0.0334, 0.0490, -0.0106]; [0.0614, 0.0527, -0.0188]; [0.0858, 0.0555, -0.0379]; .o/.e mesh Pectoralis major muscle.ol; REQUIRED: attachment away from named surface.
  - [ ] pectoralis-major-sternocostal.l origin → sternum: [0.0169, -0.0773, 0.0505]; [0.0155, -0.0394, 0.0400]; [0.0134, -0.0083, 0.0308]; .o/.e mesh Sternocostal head of pectoralis major muscle.e1l; pending.
  - [ ] pectoralis-major-sternocostal.l origin → sternum: [0.0143, 0.0071, 0.0243]; [0.0223, 0.0230, 0.0067]; [0.0255, 0.0344, -0.0025]; .o/.e mesh Sternocostal head of pectoralis major muscle.e2l; pending.
  - [ ] pectoralis-major-sternocostal.l origin → ribs: [0.0382, -0.1095, 0.0551]; [0.0764, -0.1266, 0.0482]; [0.0916, -0.1245, 0.0416]; .o/.e mesh Sternocostal head of pectoralis major muscle.el; pending.
  - [ ] pectoralis-major-sternocostal.l insertion → humerus: [0.1979, -0.0449, -0.0711]; [0.1943, -0.0351, -0.0708]; [0.1834, -0.0118, -0.0709]; .o/.e mesh Pectoralis major muscle.el; pending.
  - [ ] pectoralis-major-sternocostal.r origin → ribs: [-0.0857, 0.0555, -0.0379]; [-0.0614, 0.0527, -0.0188]; [-0.0334, 0.0490, -0.0106]; .o/.e mesh Pectoralis major muscle.or; REQUIRED: attachment away from named surface.
  - [ ] pectoralis-major-sternocostal.r origin → sternum: [-0.0169, -0.0773, 0.0505]; [-0.0155, -0.0394, 0.0400]; [-0.0134, -0.0083, 0.0308]; .o/.e mesh Sternocostal head of pectoralis major muscle.e1r; pending.
  - [ ] pectoralis-major-sternocostal.r origin → sternum: [-0.0142, 0.0071, 0.0243]; [-0.0223, 0.0230, 0.0067]; [-0.0255, 0.0344, -0.0025]; .o/.e mesh Sternocostal head of pectoralis major muscle.e2r; pending.
  - [ ] pectoralis-major-sternocostal.r origin → ribs: [-0.0915, -0.1244, 0.0416]; [-0.0764, -0.1266, 0.0482]; [-0.0382, -0.1095, 0.0551]; .o/.e mesh Sternocostal head of pectoralis major muscle.er; pending.
  - [ ] pectoralis-major-sternocostal.r insertion → humerus: [-0.1979, -0.0449, -0.0711]; [-0.1943, -0.0351, -0.0708]; [-0.1834, -0.0118, -0.0709]; .o/.e mesh Pectoralis major muscle.er; pending.
- [ ] **pectoralis-major-abdominal · F-1/F-2**: origin in external-oblique aponeurosis; insertion on humerus; shared/twisted tendon needs visual review.
  - [ ] pectoralis-major-abdominal.l origin → external-oblique: [0.0574, -0.1572, 0.0540]; [0.0657, -0.1645, 0.0526]; [0.0799, -0.1701, 0.0480]; .o/.e mesh (Abdominal part of pectoralis major muscle).ol; REQUIRED: attachment away from named surface.
  - [ ] pectoralis-major-abdominal.l insertion → humerus: [0.1979, -0.0449, -0.0711]; [0.1943, -0.0351, -0.0708]; [0.1834, -0.0118, -0.0709]; .o/.e mesh Pectoralis major muscle.el; pending.
  - [ ] pectoralis-major-abdominal.r origin → external-oblique: [-0.0799, -0.1701, 0.0480]; [-0.0657, -0.1645, 0.0526]; [-0.0574, -0.1572, 0.0540]; .o/.e mesh (Abdominal part of pectoralis major muscle).or; REQUIRED: attachment away from named surface.
  - [ ] pectoralis-major-abdominal.r insertion → humerus: [-0.1979, -0.0449, -0.0711]; [-0.1943, -0.0351, -0.0708]; [-0.1834, -0.0118, -0.0709]; .o/.e mesh Pectoralis major muscle.er; pending.
- [ ] **pectoralis-minor · F-4**: ribs 3–5 to coracoid process; spec leaves 2–5 versus 3–5 pending.
  - [ ] pectoralis-minor.l origin → ribs: [0.1001, -0.0535, 0.0098]; [0.1086, -0.0449, -0.0042]; [0.1132, -0.0391, -0.0131]; .o/.e mesh Pectoralis minor muscle.e1l; pending.
  - [ ] pectoralis-minor.l origin → ribs: [0.1066, -0.0823, 0.0192]; [0.1103, -0.0812, 0.0143]; [0.1157, -0.0767, 0.0046]; .o/.e mesh Pectoralis minor muscle.e2l; pending.
  - [ ] pectoralis-minor.l origin → ribs: [0.0807, -0.0212, 0.0005]; [0.0891, -0.0118, -0.0105]; [0.1000, -0.0053, -0.0271]; .o/.e mesh Pectoralis minor muscle.el; pending.
  - [ ] pectoralis-minor.l insertion → scapula: [0.1319, 0.0420, -0.0555]; [0.1296, 0.0441, -0.0579]; [0.1269, 0.0449, -0.0633]; .o/.e mesh Pectoralis minor muscle.ol; pending.
  - [ ] pectoralis-minor.r origin → ribs: [-0.1001, -0.0535, 0.0098]; [-0.1086, -0.0449, -0.0042]; [-0.1132, -0.0391, -0.0131]; .o/.e mesh Pectoralis minor muscle.e1r; pending.
  - [ ] pectoralis-minor.r origin → ribs: [-0.1065, -0.0823, 0.0192]; [-0.1102, -0.0812, 0.0143]; [-0.1157, -0.0767, 0.0046]; .o/.e mesh Pectoralis minor muscle.e2r; pending.
  - [ ] pectoralis-minor.r origin → ribs: [-0.0807, -0.0212, 0.0005]; [-0.0891, -0.0118, -0.0105]; [-0.1000, -0.0053, -0.0271]; .o/.e mesh Pectoralis minor muscle.er; pending.
  - [ ] pectoralis-minor.r insertion → scapula: [-0.1319, 0.0420, -0.0555]; [-0.1296, 0.0441, -0.0579]; [-0.1268, 0.0449, -0.0633]; .o/.e mesh Pectoralis minor muscle.or; pending.
- [ ] **serratus-anterior · F-5**: outer upper 8–9 ribs to costal surface of medial scapular border; review each slip.
  - [ ] serratus-anterior.l origin → ribs: [0.1094, 0.0048, -0.0448]; [0.1111, 0.0087, -0.0516]; [0.1123, 0.0135, -0.0640]; .o/.e mesh Serratus anterior muscle.e2r; pending.
  - [ ] serratus-anterior.l origin → ribs: [0.1207, -0.0281, -0.0314]; [0.1242, -0.0243, -0.0457]; [0.1248, -0.0205, -0.0613]; .o/.e mesh Serratus anterior muscle.e3l; pending.
  - [ ] serratus-anterior.l origin → ribs: [0.1228, -0.0719, -0.0087]; [0.1263, -0.0664, -0.0180]; [0.1288, -0.0628, -0.0286]; .o/.e mesh Serratus anterior muscle.e4l; pending.
  - [ ] serratus-anterior.l origin → ribs: [0.1324, -0.1039, -0.0187]; [0.1363, -0.0996, -0.0326]; [0.1379, -0.0960, -0.0412]; .o/.e mesh Serratus anterior muscle.e5l; pending.
  - [ ] serratus-anterior.l origin → ribs: [0.1398, -0.1320, -0.0332]; [0.1409, -0.1254, -0.0485]; [0.1396, -0.1208, -0.0594]; .o/.e mesh Serratus anterior muscle.e6l; pending.
  - [ ] serratus-anterior.l origin → ribs: [0.1344, -0.1700, -0.0451]; [0.1346, -0.1646, -0.0555]; [0.1333, -0.1597, -0.0641]; .o/.e mesh Serratus anterior muscle.e7l; pending.
  - [ ] serratus-anterior.l origin → ribs: [0.0695, 0.0564, -0.0451]; [0.0690, 0.0626, -0.0524]; [0.0683, 0.0677, -0.0578]; .o/.e mesh Serratus anterior muscle.el; pending.
  - [ ] serratus-anterior.l insertion → scapula: [0.0851, -0.0765, -0.1583]; [0.0684, -0.0162, -0.1562]; [0.0679, 0.0282, -0.1464]; .o/.e mesh Serratus anterior muscle.ol; pending.
  - [ ] serratus-anterior.r origin → ribs: [-0.0983, 0.0387, -0.0561]; [-0.0990, 0.0424, -0.0618]; [-0.0980, 0.0459, -0.0655]; .o/.e mesh Serratus anterior muscle.e1l; pending.
  - [ ] serratus-anterior.r origin → ribs: [-0.1094, 0.0048, -0.0448]; [-0.1110, 0.0087, -0.0516]; [-0.1123, 0.0135, -0.0640]; .o/.e mesh Serratus anterior muscle.e2l; pending.
  - [ ] serratus-anterior.r origin → ribs: [-0.1206, -0.0281, -0.0314]; [-0.1242, -0.0243, -0.0457]; [-0.1248, -0.0205, -0.0613]; .o/.e mesh Serratus anterior muscle.e3r; pending.
  - [ ] serratus-anterior.r origin → ribs: [-0.1228, -0.0719, -0.0087]; [-0.1263, -0.0664, -0.0180]; [-0.1287, -0.0628, -0.0286]; .o/.e mesh Serratus anterior muscle.e4r; pending.
  - [ ] serratus-anterior.r origin → ribs: [-0.1323, -0.1039, -0.0187]; [-0.1363, -0.0996, -0.0326]; [-0.1378, -0.0960, -0.0412]; .o/.e mesh Serratus anterior muscle.e5r; pending.
  - [ ] serratus-anterior.r origin → ribs: [-0.1398, -0.1320, -0.0332]; [-0.1409, -0.1254, -0.0485]; [-0.1395, -0.1208, -0.0594]; .o/.e mesh Serratus anterior muscle.e6r; pending.
  - [ ] serratus-anterior.r origin → ribs: [-0.1344, -0.1700, -0.0451]; [-0.1346, -0.1646, -0.0555]; [-0.1333, -0.1597, -0.0641]; .o/.e mesh Serratus anterior muscle.e7r; pending.
  - [ ] serratus-anterior.r origin → ribs: [-0.1296, -0.1900, -0.0767]; [-0.1264, -0.1814, -0.0875]; [-0.1243, -0.1768, -0.0944]; .o/.e mesh Serratus anterior muscle.e8l; pending.
  - [ ] serratus-anterior.r origin → ribs: [-0.0695, 0.0564, -0.0451]; [-0.0690, 0.0626, -0.0524]; [-0.0682, 0.0677, -0.0578]; .o/.e mesh Serratus anterior muscle.er; pending.
  - [ ] serratus-anterior.r insertion → scapula: [-0.0851, -0.0765, -0.1583]; [-0.0684, -0.0162, -0.1562]; [-0.0679, 0.0282, -0.1464]; .o/.e mesh Serratus anterior muscle.or; pending.
- [ ] **subclavius · F-6**: first rib/costal-cartilage junction to inferior clavicle.
  - [ ] subclavius.l origin → ribs: [0.0441, 0.0410, -0.0159]; proximity ; pending.
  - [ ] subclavius.l insertion → clavicle: [0.0753, 0.0522, -0.0338]; [0.0852, 0.0576, -0.0485]; [0.0943, 0.0608, -0.0610]; .o/.e mesh Subclavius muscle.ol; pending.
  - [ ] subclavius.r origin → ribs: [-0.0440, 0.0410, -0.0159]; proximity ; pending.
  - [ ] subclavius.r insertion → clavicle: [-0.0752, 0.0522, -0.0338]; [-0.0851, 0.0576, -0.0485]; [-0.0942, 0.0608, -0.0610]; .o/.e mesh Subclavius muscle.or; pending.
- [ ] **intercostals-external · F-7**: adjacent rib surfaces; review each disconnected intercostal sheet and fibre slope.
  - [ ] intercostals-external origin → ribs: [-0.0009, -0.0820, -0.0843]; proximity ; pending.
  - [ ] intercostals-external insertion → ribs: [-0.0009, -0.0820, -0.0843]; proximity ; pending.
- [ ] **intercostals-internal · F-7**: adjacent rib surfaces; review each sheet; separate interosseous/interchondral functions.
  - [ ] intercostals-internal origin → ribs: [-0.0008, -0.1142, -0.0506]; proximity ; pending.
  - [ ] intercostals-internal insertion → ribs: [-0.0008, -0.1142, -0.0506]; proximity ; pending.
- [ ] **deltoid-anterior · neighbour**: review attachment bone and blended motion weights against anatomical references.
  - [ ] deltoid-anterior.l origin → clavicle: [0.0982, 0.0619, -0.0544]; [0.1163, 0.0664, -0.0746]; [0.1383, 0.0680, -0.0815]; .o/.e mesh Clavicular part of deltoid muscle.ol; pending.
  - [ ] deltoid-anterior.l insertion → humerus: [0.2100, -0.0770, -0.0830]; [0.2064, -0.0650, -0.0799]; [0.2043, -0.0501, -0.0788]; .o/.e mesh Deltoid muscle.el; pending.
  - [ ] deltoid-anterior.r origin → clavicle: [-0.1383, 0.0680, -0.0815]; [-0.1164, 0.0664, -0.0746]; [-0.0982, 0.0619, -0.0544]; .o/.e mesh Clavicular part of deltoid muscle.or; pending.
  - [ ] deltoid-anterior.r insertion → humerus: [-0.2100, -0.0770, -0.0830]; [-0.2064, -0.0650, -0.0799]; [-0.2043, -0.0501, -0.0788]; .o/.e mesh Deltoid muscle.er; pending.
- [ ] **biceps-brachii-short · neighbour**: review attachment bone and blended motion weights against anatomical references.
  - [ ] biceps-brachii-short.l origin → scapula: [0.1407, 0.0443, -0.0605]; proximity ; pending.
  - [ ] biceps-brachii-short.l insertion → forearm: [0.2151, -0.2251, -0.0731]; proximity ; REQUIRED: no vertices within 2 mm.
  - [ ] biceps-brachii-short.r origin → scapula: [-0.1416, 0.0434, -0.0566]; [-0.1417, 0.0446, -0.0591]; [-0.1400, 0.0457, -0.0627]; .o/.e mesh Short head of biceps brachii.ol; pending.
  - [ ] biceps-brachii-short.r insertion → forearm: [-0.2151, -0.2251, -0.0731]; proximity ; REQUIRED: no vertices within 2 mm.
- [ ] **coracobrachialis · neighbour**: review attachment bone and blended motion weights against anatomical references.
  - [ ] coracobrachialis.l origin → scapula: [0.1374, 0.0383, -0.0596]; [0.1398, 0.0392, -0.0593]; [0.1414, 0.0406, -0.0581]; .o/.e mesh Coracobrachialis muscle.ol; pending.
  - [ ] coracobrachialis.l insertion → humerus: [0.1918, -0.0964, -0.0864]; proximity ; pending.
  - [ ] coracobrachialis.r origin → scapula: [-0.1414, 0.0406, -0.0581]; [-0.1398, 0.0392, -0.0593]; [-0.1374, 0.0383, -0.0596]; .o/.e mesh Coracobrachialis muscle.or; pending.
  - [ ] coracobrachialis.r insertion → humerus: [-0.1917, -0.0965, -0.0863]; proximity ; pending.
- [ ] **triceps-brachii · neighbour**: review attachment bone and blended motion weights against anatomical references.
  - [ ] triceps-brachii.l origin → humerus: [0.2048, -0.0923, -0.0979]; [0.1971, -0.0511, -0.0945]; [0.1881, -0.0039, -0.0912]; .o/.e mesh Lateral head of triceps brachii.ol; pending.
  - [ ] triceps-brachii.l origin → scapula: [0.1524, 0.0100, -0.0954]; [0.1519, 0.0092, -0.0979]; [0.1515, 0.0089, -0.1005]; .o/.e mesh Long head of triceps brachii.ol; pending.
  - [ ] triceps-brachii.l origin → humerus: [0.2185, -0.2054, -0.1045]; [0.2066, -0.1506, -0.1019]; [0.1896, -0.0689, -0.0928]; .o/.e mesh Medial head of triceps brachii.ol; pending.
  - [ ] triceps-brachii.l insertion → forearm: [0.2040, -0.2511, -0.1058]; [0.2069, -0.2472, -0.1089]; [0.2202, -0.2479, -0.1120]; .o/.e mesh Triceps brachii muscle.el; pending.
  - [ ] triceps-brachii.r origin → humerus: [-0.2047, -0.0923, -0.0979]; [-0.1970, -0.0511, -0.0945]; [-0.1881, -0.0039, -0.0912]; .o/.e mesh Lateral head of triceps brachii.or; pending.
  - [ ] triceps-brachii.r origin → scapula: [-0.1524, 0.0100, -0.0954]; [-0.1519, 0.0092, -0.0979]; [-0.1515, 0.0089, -0.1005]; .o/.e mesh Long head of triceps brachii.or; pending.
  - [ ] triceps-brachii.r origin → humerus: [-0.2185, -0.2054, -0.1045]; [-0.2065, -0.1506, -0.1019]; [-0.1896, -0.0689, -0.0928]; .o/.e mesh Medial head of triceps brachii.or; pending.
  - [ ] triceps-brachii.r insertion → forearm: [-0.2202, -0.2479, -0.1120]; [-0.2069, -0.2472, -0.1089]; [-0.2040, -0.2511, -0.1058]; .o/.e mesh Triceps brachii muscle.er; pending.
- [ ] **latissimus-dorsi · neighbour**: review attachment bone and blended motion weights against anatomical references.
  - [ ] latissimus-dorsi.l origin → ribs: [0.0956, -0.0928, -0.1583]; [0.0943, -0.0882, -0.1609]; [0.0867, -0.0793, -0.1664]; .o/.e mesh Latissimus dorsi muscle.el; REQUIRED: attachment away from named surface.
  - [ ] latissimus-dorsi.l origin → ribs: [0.0389, -0.3913, -0.1336]; [0.0531, -0.3713, -0.1274]; [0.0704, -0.3542, -0.1093]; .o/.e mesh Latissimus dorsi muscle.ol; REQUIRED: attachment away from named surface.
  - [ ] latissimus-dorsi.l insertion → humerus: [0.1772, -0.0253, -0.0795]; proximity ; pending.
  - [ ] latissimus-dorsi.r origin → ribs: [-0.0956, -0.0928, -0.1583]; [-0.0943, -0.0882, -0.1609]; [-0.0867, -0.0793, -0.1664]; .o/.e mesh Latissimus dorsi muscle.er; REQUIRED: attachment away from named surface.
  - [ ] latissimus-dorsi.r origin → ribs: [-0.0389, -0.3913, -0.1336]; [-0.0531, -0.3713, -0.1274]; [-0.0704, -0.3542, -0.1093]; .o/.e mesh Latissimus dorsi muscle.or; REQUIRED: attachment away from named surface.
  - [ ] latissimus-dorsi.r insertion → humerus: [-0.1773, -0.0255, -0.0796]; proximity ; pending.
- [ ] **external-oblique · neighbour**: review attachment bone and blended motion weights against anatomical references.
  - [ ] external-oblique.l origin → ribs: [0.1306, -0.1133, -0.0107]; [0.1332, -0.1121, -0.0185]; [0.1357, -0.1099, -0.0285]; .o/.e mesh External abdominal oblique muscle.o1l; pending.
  - [ ] external-oblique.l origin → ribs: [0.1396, -0.1460, -0.0258]; [0.1407, -0.1389, -0.0402]; [0.1396, -0.1334, -0.0518]; .o/.e mesh External abdominal oblique muscle.o2l; pending.
  - [ ] external-oblique.l origin → ribs: [0.1349, -0.1787, -0.0442]; [0.1340, -0.1696, -0.0620]; [0.1298, -0.1624, -0.0728]; .o/.e mesh External abdominal oblique muscle.o3l; pending.
  - [ ] external-oblique.l origin → ribs: [0.1144, -0.0890, 0.0080]; [0.1254, -0.0778, -0.0144]; [0.1285, -0.0734, -0.0256]; .o/.e mesh External abdominal oblique muscle.ol; pending.
  - [ ] external-oblique.l insertion → pelvis: [0.1267, -0.3748, -0.0231]; [0.1205, -0.3482, -0.0563]; [0.1055, -0.3406, -0.0775]; .o/.e mesh External abdominal oblique muscle.o4l; pending.
  - [ ] external-oblique.l insertion → pelvis: [0.0722, -0.4579, -0.0016]; [0.1020, -0.4243, -0.0007]; [0.1134, -0.4091, 0.0007]; .o/.e mesh External abdominal oblique muscle.o5l; REQUIRED: attachment away from named surface.
  - [ ] external-oblique.r origin → ribs: [-0.1305, -0.1133, -0.0107]; [-0.1331, -0.1121, -0.0185]; [-0.1357, -0.1099, -0.0285]; .o/.e mesh External abdominal oblique muscle.o1r; pending.
  - [ ] external-oblique.r origin → ribs: [-0.1395, -0.1460, -0.0258]; [-0.1406, -0.1389, -0.0402]; [-0.1396, -0.1334, -0.0518]; .o/.e mesh External abdominal oblique muscle.o2r; pending.
  - [ ] external-oblique.r origin → ribs: [-0.1348, -0.1787, -0.0442]; [-0.1339, -0.1696, -0.0620]; [-0.1297, -0.1624, -0.0728]; .o/.e mesh External abdominal oblique muscle.o3r; pending.
  - [ ] external-oblique.r origin → ribs: [-0.1144, -0.0890, 0.0080]; [-0.1254, -0.0778, -0.0144]; [-0.1285, -0.0734, -0.0256]; .o/.e mesh External abdominal oblique muscle.or; pending.
  - [ ] external-oblique.r insertion → pelvis: [-0.1266, -0.3748, -0.0231]; [-0.1204, -0.3482, -0.0563]; [-0.1054, -0.3406, -0.0775]; .o/.e mesh External abdominal oblique muscle.o4r; pending.
  - [ ] external-oblique.r insertion → pelvis: [-0.0722, -0.4579, -0.0016]; [-0.1020, -0.4243, -0.0007]; [-0.1133, -0.4091, 0.0007]; .o/.e mesh External abdominal oblique muscle.o5r; REQUIRED: attachment away from named surface.
- [ ] **rectus-abdominis · neighbour**: review attachment bone and blended motion weights against anatomical references.
  - [ ] rectus-abdominis.l origin → pelvis: [0.0123, -0.4973, -0.0061]; proximity ; pending.
  - [ ] rectus-abdominis.l insertion → ribs: [0.0037, -0.4823, -0.0001]; [0.0072, -0.3130, 0.0376]; [0.0071, -0.1455, 0.0507]; .o/.e mesh Rectus abdominis muscle.el; REQUIRED: attachment away from named surface.
  - [ ] rectus-abdominis.l insertion → ribs: [0.0166, -0.1209, 0.0526]; [0.0428, -0.1091, 0.0542]; [0.0711, -0.1060, 0.0508]; .o/.e mesh Rectus abdominis muscle.ol; pending.
  - [ ] rectus-abdominis.r origin → pelvis: [-0.0131, -0.4971, -0.0060]; proximity ; pending.
  - [ ] rectus-abdominis.r insertion → ribs: [-0.0037, -0.4823, -0.0001]; [-0.0071, -0.3130, 0.0376]; [-0.0071, -0.1455, 0.0507]; .o/.e mesh Rectus abdominis muscle.er; REQUIRED: attachment away from named surface.
  - [ ] rectus-abdominis.r insertion → ribs: [-0.0710, -0.1060, 0.0508]; [-0.0428, -0.1091, 0.0542]; [-0.0166, -0.1208, 0.0526]; .o/.e mesh Rectus abdominis muscle.or; pending.

- [ ] F-2: three pectoralis components and two twisted insertion layers agree with the reference plate.
- [ ] F-3: verify shoulder flexion/abduction/rotation axis signs in viewer movement demos.
- [ ] F-15: male source figure, source orientation and metre scale agree with inventory.
- [ ] Whole external-oblique and rectus-abdominis neighbour sources: approve extent or crop upper region.
- [ ] Shoulder abduction 90° and elbow flexion 120°: human review of skin collapse and muscle intersections.

## Automatic warnings

- biceps-brachii-short.l insertion: no 2 mm contact; nearest 28.28 mm
- biceps-brachii-short.r insertion: no 2 mm contact; nearest 28.28 mm
- intercostals-external: closedness changed; cap disabled. Review nonmanifold topology.
- pectoralis-minor.l: closedness changed; cap disabled. Review nonmanifold topology.
- pectoralis-minor.r: closedness changed; cap disabled. Review nonmanifold topology.
- serratus-anterior.l: closedness changed; cap disabled. Review nonmanifold topology.
- serratus-anterior.r: closedness changed; cap disabled. Review nonmanifold topology.

## Automatic result

Geometry error budgets and topology checks passed. Anatomical review remains pending.
