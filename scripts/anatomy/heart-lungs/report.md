# Heart and lungs region — mesh pipeline report

Published: `public/models/heart-and-lungs.glb`. **1,952,300 bytes / 213,380 triangles / 25 nodes / 25 draws.**

SHA-256: `a4e67065c6cd1521239464effc7fbc2d6857cc423b067a01b24e587781ff903a`

Static native Blender meshes from the cached Z-Anatomy FBX files (no downloads), same source body, centre and transform as the digestive topic (`organs.json`: umbilicus at the origin, +Y up, +Z front, +X the body's left, metres). No armature, weights, fibres or attachment sites. meshopt + quantised; `asset.copyright` carries the attribution (below).

## Audit

**PASS** — node allowlist, budgets (≤ 4 MB, ≤ 350 k triangles), copyright field, sides, sampled surface deviation, topology, `_U` range and agreement with the segment centrelines, routes containment and blood-loop joins, digestive model unchanged.

Review notes: Bifurcation of pulmonary trunk: centreline leaves its source tube by 3.88 mm (at station 0.11); Pulmonary trunk: centreline leaves its source tube by 6.57 mm (at station 0.71, 0.86); Common iliac artery.l: centreline leaves its source tube by 6.36 mm (at station 0.0); Common iliac artery.r: centreline leaves its source tube by 6.35 mm (at station 0.0, 0.06)

`digestive-system.glb` SHA-256 after this pipeline: `24ecf044c1c48ad4cfefbc6222d0f8c192469c18b873270372c80deb22263c95` (unchanged; docs/25 §9.1 records `24ecf044c1c48ad4cfefbc6222d0f8c192469c18b873270372c80deb22263c95`). `optimize_static.ts` writes each static model's attribution from its manifest's `changes` (and optional `attribution` lines); the digestive manifest carries the sentence its published model already had.

## Nodes

| Node | Role | Source tris | Published tris | Sample error mm | Limit mm | Closed src/pub | Open edges | Size x × y × z (cm) |
|---|---|---:|---:|---:|---:|---|---:|---|
| nasal-cavity | organ | 9,808 | 3,987 | 0.480 | 1.5 | False/False | 4 | 2.7 × 4.8 × 6.6 |
| pharynx | tube | 6,972 | 3,500 | 0.217 | 1.5 | True/True | 0 | 6.6 × 13.5 × 7.6 |
| epiglottis | organ | 3,376 | 1,000 | 0.097 | 1.5 | True/False | 0 | 1.6 × 3.0 × 0.8 |
| larynx | organ | 6,370 | 2,500 | 0.123 | 1.5 | False/True | 0 | 4.1 × 4.2 × 3.1 |
| trachea | tube | 4,756 | 3,500 | 0.129 | 1.5 | False/False | 42 | 2.7 × 10.5 × 3.9 |
| bronchi | tube | 82,944 | 12,000 | 0.287 | 1.5 | False/False | 2376 | 25.1 × 25.1 × 16.1 |
| lung-right | organ | 23,596 | 9,999 | 0.187 | 1.5 | False/False | 96 | 12.8 × 26.0 × 18.6 |
| lung-left | organ | 18,548 | 8,000 | 0.201 | 1.5 | False/False | 48 | 12.1 × 26.4 × 18.4 |
| diaphragm | organ | 38,868 | 5,000 | 0.489 | 1.5 | False/True | 0 | 25.1 × 22.0 × 16.8 |
| ribcage | system | 274,709 | 13,986 | 0.755 | 4.0 | False/False | 13 | 28.4 × 39.0 × 21.0 |
| heart | organ | 29,664 | 10,000 | 0.232 | 1.5 | False/False | 804 | 11.9 × 10.8 × 11.3 |
| great-vessels | tube | 3,186 | 3,186 | 0.004 | 1.5 | False/False | 240 | 6.1 × 38.7 × 9.4 |
| lung-vessels | tube | 3,279 | 3,279 | 0.002 | 1.5 | False/False | 317 | 13.5 × 9.3 × 10.3 |
| vessels-out | tube | 40,476 | 12,000 | 0.446 | 1.5 | False/False | 1190 | 57.5 × 156.5 × 14.3 |
| vessels-back | tube | 56,762 | 11,998 | 0.695 | 1.5 | False/False | 1222 | 57.1 × 154.0 × 16.2 |
| oesophagus | organ | 16,320 | 2,000 | 0.192 | 1.5 | True/True | 0 | 2.7 × 28.1 × 5.2 |
| stomach | organ | 10,404 | 5,000 | 0.108 | 1.5 | False/False | 62 | 13.4 × 12.5 × 10.5 |
| small-intestine | organ | 29,398 | 10,000 | 0.484 | 1.5 | False/False | 48 | 18.3 × 26.2 × 7.5 |
| large-intestine | organ | 62,746 | 8,000 | 0.851 | 1.5 | False/False | 0 | 22.8 × 33.1 × 15.3 |
| liver | organ | 12,270 | 5,000 | 0.239 | 1.5 | False/False | 38 | 20.6 × 16.6 × 15.3 |
| leg-muscles.l | organ | 35,460 | 5,996 | 1.006 | 1.5 | False/False | 6 | 12.5 × 71.0 × 16.7 |
| leg-muscles.r | organ | 35,460 | 5,998 | 1.018 | 1.5 | False/False | 6 | 12.5 × 71.0 × 16.7 |
| skeleton | system | 277,182 | 46,298 | 3.388 | 4.0 | False/False | 124 | 57.8 × 169.4 × 21.3 |
| skin-outline | skin | 100,818 | 17,843 | 2.650 | 35.0 | False/False | 169 | 67.9 × 171.0 × 29.5 |
| skin-wire | skin | 100,818 | 3,310 | 11.116 | 35.0 | False/False | 45 | 67.3 × 170.9 × 29.3 |

Bounding boxes (metres, topic frame) are in `cache/heart-lungs-static-audit.json` (`bboxMin` / `bboxMax`).

## Heart shell

The heart node merges the four Z-Anatomy chamber surfaces (Left / Right atrium, Left / Right ventricle); the source has no whole-heart mesh (`Heart.g` is an empty group). Source: 882 open boundary edges; published: 804 open edges in 29 openings. Largest openings (span, mm):

| Span mm | Ring vertices | Centre (m) |
|---:|---:|---|
| 86.3 | 261 | 0.021, 0.278, -0.099 |
| 75.0 | 72 | 0.019, 0.277, -0.114 |
| 42.3 | 45 | 0.057, 0.247, -0.047 |
| 39.5 | 103 | -0.013, 0.261, -0.084 |
| 36.3 | 78 | 0.024, 0.267, -0.119 |
| 26.7 | 28 | 0.018, 0.229, -0.088 |
| 21.4 | 25 | -0.000, 0.289, -0.051 |
| 17.8 | 19 | 0.054, 0.281, -0.057 |

Whether these read as holes at the cover distance is judged on the renders in [preview-review.md](preview-review.md).

## Segment centrelines

One centreline per source segment, extracted **before merging** (`static_region.segment_centrelines`), 3 mm spacing, running in the flow direction (airways from the larynx, arteries from the heart, veins to the heart). Tube nodes carry `_U` = station along each vertex's own segment (0 upstream), normalised per segment. Containment: the centreline against its source tube (audit-only caps on open rings, 1.5 mm tolerance).

| Segment | Node | Method | Length cm | Max outside mm |
|---|---|---|---:|---:|
| Laryngopharynx | pharynx | principal-axis triangle-section perimeter centroids (closed solid: not a lumen) | 4.6 | 0.00 |
| Nasopharynx | pharynx | principal-axis triangle-section perimeter centroids (closed solid: not a lumen) | 4.6 | 0.00 |
| Oropharynx | pharynx | principal-axis triangle-section perimeter centroids (closed solid: not a lumen) | 11.2 | 3.48 |
| Trachea | trachea | surface-geodesic ring centroids (anatomical neighbour end rings) | 10.6 | 0.00 |
| (Anteromedial basal segmental bronchus of left lung) | bronchi | topological medial axis: exact 12-vertex source section rings | 12.2 | 0.00 |
| Anterior basal segmental bronchus of left lung (BVIII) | bronchi | topological medial axis: exact 12-vertex source section rings | 9.1 | 0.00 |
| Anterior basal segmental bronchus of right lung (BVIII) | bronchi | topological medial axis: exact 12-vertex source section rings | 9.1 | 0.00 |
| Anterior segmental bronchus of left lung (BIII) | bronchi | topological medial axis: exact 12-vertex source section rings | 8.0 | 0.00 |
| Anterior segmental bronchus of right lung (BIII) | bronchi | topological medial axis: exact 12-vertex source section rings | 9.8 | 0.00 |
| Apical segmental bronchus of right lung (BI) | bronchi | topological medial axis: exact 12-vertex source section rings | 1.4 | 0.00 |
| Apicoposterior segmental bronchus of left lung (BI+BII) | bronchi | topological medial axis: exact 12-vertex source section rings | 2.9 | 0.00 |
| Inferior lingular segmental bronchus of left lung (BV) | bronchi | topological medial axis: exact 12-vertex source section rings | 11.4 | 0.00 |
| Intermediate bronchus.r | bronchi | topological medial axis: exact 12-vertex source section rings | 3.6 | 0.00 |
| Lateral basal segmental bronchus of left lung (BIX) | bronchi | topological medial axis: exact 12-vertex source section rings | 12.1 | 0.00 |
| Lateral basal segmental bronchus of right lung (BIX) | bronchi | topological medial axis: exact 12-vertex source section rings | 12.3 | 0.00 |
| Lateral segmental bronchus of right lung (BIV) | bronchi | topological medial axis: exact 12-vertex source section rings | 8.9 | 0.00 |
| Left inferior lobar bronchus | bronchi | topological medial axis: exact 12-vertex source section rings | 5.0 | 0.00 |
| Left main bronchus | bronchi | topological medial axis: exact 12-vertex source section rings | 6.8 | 0.00 |
| Left superior lobar bronchus | bronchi | topological medial axis: exact 12-vertex source section rings | 3.6 | 0.00 |
| Medial basal segmental bronchus of left lung (BVII) | bronchi | topological medial axis: exact 12-vertex source section rings | 13.9 | 0.00 |
| Medial basal segmental bronchus of right lung (BVII) | bronchi | topological medial axis: exact 12-vertex source section rings | 6.3 | 0.00 |
| Medial segmental bronchus of right lung (BV) | bronchi | topological medial axis: exact 12-vertex source section rings | 8.3 | 0.00 |
| Middle lobar bronchus.r | bronchi | topological medial axis: exact 12-vertex source section rings | 3.1 | 0.00 |
| Posterior basal segmental bronchus of left lung (BX) | bronchi | surface-geodesic ring centroids (anatomical neighbour end rings) | 8.6 | 0.00 |
| Posterior basal segmental bronchus of right lung (BX) | bronchi | topological medial axis: exact 12-vertex source section rings | 8.3 | 0.00 |
| Posterior segmental bronchus of right lung (BII) | bronchi | topological medial axis: exact 12-vertex source section rings | 8.3 | 0.00 |
| Right inferior lobar bronchus | bronchi | topological medial axis: exact 12-vertex source section rings | 7.2 | 0.00 |
| Right main bronchus | bronchi | topological medial axis: exact 12-vertex source section rings | 2.6 | 0.00 |
| Right superior lobar bronchus | bronchi | topological medial axis: exact 12-vertex source section rings | 1.7 | 0.00 |
| Superior lingular segmental bronchus of left lung (BIV) | bronchi | topological medial axis: exact 12-vertex source section rings | 3.5 | 0.00 |
| Superior segmental bronchus of left lung (BVI) | bronchi | topological medial axis: exact 12-vertex source section rings | 2.6 | 0.00 |
| Superior segmental bronchus of right lung (BVI) | bronchi | topological medial axis: exact 12-vertex source section rings | 9.2 | 0.00 |
| Abdominal aorta | great-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 18.5 | 0.00 |
| Aortic arch | great-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 8.4 | 0.00 |
| Ascending aorta | great-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 5.1 | 0.00 |
| Brachiocephalic trunk | great-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 4.1 | 0.00 |
| Inferior vena cava (abdominal part) | great-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 14.2 | 0.00 |
| Inferior vena cava (thoracic part) | great-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 9.4 | 0.00 |
| Left brachiocephalic vein | great-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 5.7 | 0.00 |
| Right brachiocephalic vein | great-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 4.0 | 0.00 |
| Superior vena cava | great-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 3.5 | 0.00 |
| Thoracic aorta | great-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 15.9 | 0.00 |
| Bifurcation of pulmonary trunk | lung-vessels | longest connected piece: surface-geodesic ring centroids (anatomical neighbour end rings) | 3.5 | 3.88 |
| Left inferior pulmonary vein | lung-vessels | longest connected piece: surface-geodesic ring centroids (anatomical neighbour end rings) | 1.3 | 0.00 |
| Left pulmonary artery | lung-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 11.1 | 0.00 |
| Left superior pulmonary vein | lung-vessels | longest connected piece: surface-geodesic ring centroids (anatomical neighbour end rings) | 1.4 | 0.00 |
| Pulmonary trunk | lung-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 2.6 | 6.57 |
| Right inferior pulmonary vein | lung-vessels | longest connected piece: surface-geodesic ring centroids (anatomical neighbour end rings) | 2.2 | 0.00 |
| Right pulmonary artery | lung-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 4.6 | 0.00 |
| Right superior pulmonary vein | lung-vessels | surface-geodesic ring centroids (anatomical neighbour end rings) | 4.3 | 0.00 |
| Anterior tibial artery.l | vessels-out | principal-axis triangle-section perimeter centroids | 30.8 | 0.00 |
| Anterior tibial artery.r | vessels-out | principal-axis triangle-section perimeter centroids | 30.8 | 0.00 |
| Axillary artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 7.5 | 0.00 |
| Axillary artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 7.5 | 0.00 |
| Brachial artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 29.4 | 0.00 |
| Brachial artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 29.4 | 0.00 |
| Coeliac trunk | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 2.5 | 0.00 |
| Common hepatic artery | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 4.2 | 0.00 |
| Common iliac artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 5.7 | 6.36 |
| Common iliac artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 6.4 | 6.35 |
| Deep femoral artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 29.8 | 0.71 |
| Deep femoral artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 29.8 | 0.71 |
| Dorsalis pedis artery.l | vessels-out | principal-axis triangle-section perimeter centroids | 6.5 | 0.00 |
| Dorsalis pedis artery.r | vessels-out | principal-axis triangle-section perimeter centroids | 6.5 | 0.00 |
| External carotid artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 7.6 | 0.00 |
| External carotid artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 7.6 | 0.00 |
| External iliac artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 10.4 | 0.00 |
| External iliac artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 10.4 | 0.00 |
| Femoral artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 35.7 | 0.00 |
| Femoral artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 35.7 | 0.00 |
| Internal carotid artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 13.3 | 0.00 |
| Internal carotid artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 13.3 | 0.00 |
| Internal iliac artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 4.8 | 0.00 |
| Internal iliac artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 4.8 | 0.00 |
| Left common carotid artery | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 9.3 | 0.00 |
| Left subclavian artery | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 8.5 | 0.00 |
| Popliteal artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 20.5 | 0.00 |
| Popliteal artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 20.5 | 0.00 |
| Posterior tibial artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 35.9 | 1.04 |
| Posterior tibial artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 35.9 | 1.04 |
| Proper hepatic artery | vessels-out | principal-axis triangle-section perimeter centroids | 11.5 | 0.61 |
| Radial artery.l | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 26.2 | 0.00 |
| Radial artery.r | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 26.2 | 0.00 |
| Right common carotid artery | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 7.7 | 0.00 |
| Right subclavian artery | vessels-out | surface-geodesic ring centroids (anatomical neighbour end rings) | 7.5 | 0.00 |
| Splenic artery | vessels-out | longest connected piece: surface-geodesic ring centroids (anatomical neighbour end rings) | 10.6 | 0.41 |
| Superior mesenteric artery | vessels-out | longest connected piece: surface-geodesic ring centroids (anatomical neighbour end rings) | 20.4 | 0.39 |
| Ulnar artery.l | vessels-out | principal-axis triangle-section perimeter centroids | 23.0 | 0.00 |
| Ulnar artery.r | vessels-out | principal-axis triangle-section perimeter centroids | 23.0 | 0.00 |
| Anterior tibial veins.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 30.9 | 0.00 |
| Anterior tibial veins.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 30.9 | 0.00 |
| Axillary vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 11.4 | 0.00 |
| Axillary vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 11.4 | 0.00 |
| Basilic vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 48.9 | 0.00 |
| Basilic vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 48.9 | 0.00 |
| Brachial veins.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 25.6 | 0.00 |
| Brachial veins.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 25.6 | 0.00 |
| Cephalic vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 63.5 | 0.00 |
| Cephalic vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 63.5 | 0.00 |
| Common iliac vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 5.9 | 0.00 |
| Common iliac vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 5.3 | 0.00 |
| Deep femoral vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 27.8 | 0.00 |
| Deep femoral vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 27.8 | 0.00 |
| External iliac vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 11.4 | 0.00 |
| External iliac vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 11.4 | 0.00 |
| External jugular vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 13.2 | 0.00 |
| External jugular vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 13.2 | 0.00 |
| Femoral vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 33.4 | 0.00 |
| Femoral vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 33.4 | 0.00 |
| Great saphenous vein.l | vessels-back | longest connected piece: surface-geodesic ring centroids (anatomical neighbour end rings) | 84.8 | 0.00 |
| Great saphenous vein.r | vessels-back | longest connected piece: surface-geodesic ring centroids (anatomical neighbour end rings) | 84.8 | 0.00 |
| Hepatic portal vein | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 5.1 | 0.00 |
| Hepatic veins | vessels-back | longest connected piece: surface-geodesic ring centroids (anatomical neighbour end rings) | 1.8 | 0.00 |
| Internal iliac vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 4.8 | 0.00 |
| Internal iliac vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 4.8 | 0.00 |
| Internal jugular vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 17.2 | 1.24 |
| Internal jugular vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 17.2 | 1.24 |
| Left subclavian vein | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 7.3 | 0.00 |
| Popliteal vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 17.7 | 0.00 |
| Popliteal vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 17.7 | 0.00 |
| Posterior tibial veins.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 36.6 | 0.77 |
| Posterior tibial veins.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 36.6 | 0.77 |
| Radial veins.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 22.3 | 0.82 |
| Radial veins.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 22.3 | 0.82 |
| Right subclavian vein | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 7.8 | 0.00 |
| Small saphenous vein.l | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 50.3 | 0.31 |
| Small saphenous vein.r | vessels-back | surface-geodesic ring centroids (anatomical neighbour end rings) | 50.3 | 0.31 |
| Splenic vein | vessels-back | longest connected piece: surface-geodesic ring centroids (anatomical neighbour end rings) | 11.6 | 0.99 |
| Superior mesenteric vein | vessels-back | geodesic walk from the end ring to the capped end, local section centroids (ring-to-ring path doubled back) | 29.0 | 0.00 |
| Ulnar veins.l | vessels-back | principal-axis triangle-section perimeter centroids | 20.8 | 0.00 |
| Ulnar veins.r | vessels-back | principal-axis triangle-section perimeter centroids | 20.8 | 0.00 |

`_U` pharynx: 1,656 of 1,754 published vertices matched to one source segment; 2 differ from an independent projection on that segment by more than 0.02 (max 0.0389).

`_U` trachea: 1,772 of 1,772 published vertices matched to one source segment; 0 differ from an independent projection on that segment by more than 0.02 (max 0.0041).

`_U` bronchi: 6,967 of 7,188 published vertices matched to one source segment; 0 differ from an independent projection on that segment by more than 0.02 (max 0.0107).

`_U` great-vessels: 1,542 of 1,713 published vertices matched to one source segment; 0 differ from an independent projection on that segment by more than 0.02 (max 0.0174).

`_U` lung-vessels: 1,730 of 1,798 published vertices matched to one source segment; 0 differ from an independent projection on that segment by more than 0.02 (max 0.0032).

`_U` vessels-out: 6,021 of 6,594 published vertices matched to one source segment; 0 differ from an independent projection on that segment by more than 0.02 (max 0.0125).

`_U` vessels-back: 6,129 of 6,610 published vertices matched to one source segment; 0 differ from an independent projection on that segment by more than 0.02 (max 0.0035).

## Landmarks

Measured on the source objects before merging (`landmarks.json`); definitions in the manifest.

| Landmark | Kind | Point (m) |
|---|---|---|
| right-atrium | centroid | -0.017, 0.280, -0.093 |
| right-ventricle | centroid | 0.021, 0.262, -0.059 |
| left-atrium | centroid | 0.020, 0.291, -0.119 |
| left-ventricle | centroid | 0.051, 0.257, -0.090 |
| heart | centroid | 0.019, 0.272, -0.090 |
| tricuspid | opening | -0.006, 0.268, -0.082 |
| mitral | opening | 0.022, 0.272, -0.116 |
| diaphragm-dome.r | top | -0.063, 0.242, -0.086 |
| diaphragm-dome.l | top | 0.055, 0.222, -0.095 |
| thoracic-spine-front | front | 0.000, 0.289, -0.146 |
| hilum.r | end | -0.014, 0.330, -0.132 |
| hilum.l | end | 0.044, 0.303, -0.136 |
| larynx | centroid | 0.000, 0.457, -0.101 |
| nasopharynx | centroid | 0.000, 0.550, -0.086 |
| oropharynx | centroid | 0.000, 0.515, -0.082 |
| laryngeal-inlet | between | 0.000, 0.471, -0.096 |
| liver-core | centroid | -0.036, 0.173, -0.080 |
| liver-hilum | end | -0.007, 0.181, -0.084 |
| choana | back | 0.000, 0.551, -0.069 |
| nostril.l | nostril | 0.005, 0.538, -0.008 |
| nasal-passage.l | passage | 0.007, 0.547, -0.033 |
| thigh.l | centroid | 0.108, -0.340, -0.085 |
| calf.l | centroid | 0.059, -0.670, -0.185 |
| nostril.r | nostril | -0.005, 0.538, -0.008 |
| nasal-passage.r | passage | -0.007, 0.547, -0.033 |
| thigh.r | centroid | -0.108, -0.340, -0.085 |
| calf.r | centroid | -0.059, -0.670, -0.185 |
| superior-lobe-right | centroid | -0.057, 0.330, -0.111 |
| middle-lobe-right | centroid | -0.066, 0.260, -0.077 |
| inferior-lobe-right | centroid | -0.078, 0.230, -0.140 |
| superior-lobe-left | centroid | 0.065, 0.310, -0.096 |
| inferior-lobe-left | centroid | 0.081, 0.228, -0.133 |

## Routes (`routes.json`, from `heart-lungs/routes.py`)

Every flow of docs/40 §3.6 that runs in the body. Points every 8 mm. *Traced* legs follow source centrelines; *schematic* legs (inside the heart, lungs and liver, the nose and throat, the exchange arcs, bridges over source gaps) are flagged per path in `routes.json` (`schematic`). Containment: six rays perpendicular to the path from every point; traced points need five of six on their tube, schematic points four of six on their organ (they pass real openings). 15 traced points at tight bends of 3–4 mm vessels were moved up to 2.2 mm to the centre of the published tube's section (`recentred` in each path).

| Flow | Paths | Length m | Traced pts outside / tested | Schematic pts outside / tested | Bridges |
|---|---:|---:|---|---|---:|
| air-right | 10 | 4.508 | 0 / 332 | 0 / 268 | 1 |
| air-left | 9 | 4.418 | 0 / 336 | 0 / 261 | 4 |
| heart-right | 2 | 0.289 | 0 / 0 | 0 / 39 | 0 |
| to-lungs | 5 | 1.120 | 0 / 94 | 0 / 64 | 0 |
| exchange-lungs | 5 | 0.174 | 0 / 0 | 0 / 30 | 0 |
| from-lungs | 5 | 0.522 | 0 / 21 | 0 / 64 | 0 |
| heart-left | 1 | 0.114 | 0 / 0 | 0 / 16 | 0 |
| to-body | 7 | 6.021 | 0 / 769 | 0 / 10 | 4 |
| from-body | 7 | 5.103 | 0 / 632 | 0 / 25 | 2 |
| exchange-body | 7 | 0.324 | 0 / 0 | 0 / 51 | 0 |
| oxygen-lungs | 5 | 0.243 | 0 / 0 | 0 / 38 | 0 |
| co2-lungs | 5 | 0.243 | 0 / 0 | 0 / 38 | 0 |
| oxygen-muscle | 4 | 0.178 | 0 / 0 | 0 / 30 | 0 |
| co2-muscle | 4 | 0.178 | 0 / 0 | 0 / 30 | 0 |
| food-in | 4 | 0.325 | 0 / 0 | 0 / 47 | 0 |
| food-route | 1 | 1.980 | 0 / 178 | 0 / 91 | 0 |

Blood loop joins (each path's end to the nearest start of the next flow): max 0.00 mm, 0 over the 5 mm tolerance.

### Bridges (junction gaps over 5 mm, drawn straight and flagged schematic)

| Flow / path | From | To | Gap mm |
|---|---|---|---:|
| air-right/apical-segmental-bronchus-of-right-lung-bi | (tree parent) | Apical segmental bronchus of right lung (BI) | 55.5 |
| air-left/apicoposterior-segmental-bronchus-of-left-lung-bi-bii | (tree parent) | Apicoposterior segmental bronchus of left lung (BI+BII) | 61.2 |
| air-left/inferior-lingular-segmental-bronchus-of-left-lung-bv | (tree parent) | Inferior lingular segmental bronchus of left lung (BV) | 31.0 |
| air-left/superior-lingular-segmental-bronchus-of-left-lung-biv | (tree parent) | Superior lingular segmental bronchus of left lung (BIV) | 33.5 |
| air-left/superior-segmental-bronchus-of-left-lung-bvi | (tree parent) | Superior segmental bronchus of left lung (BVI) | 41.5 |
| to-body/head-right | Aortic arch | Brachiocephalic trunk | 5.5 |
| to-body/head-left | Aortic arch | Left common carotid artery | 13.9 |
| to-body/arm-left | Aortic arch | Left subclavian artery | 8.1 |
| from-body/leg-right | Posterior tibial veins.r | Popliteal vein.r | 39.4 |
| from-body/leg-left | Posterior tibial veins.l | Popliteal vein.l | 39.4 |

Branch-offs from the aorta bridge the aorta's own radius (its centreline to the branch mouth). The posterior tibial veins and four segmental bronchi stop 3–6 cm short of the vessel or airway they join in the source; their bridges cross that gap.

## Attribution

```
Z-Anatomy — The open source atlas of anatomy, CC BY-SA 4.0
(https://github.com/LluisV/Z-Anatomy), derived from BodyParts3D, © The Database Center
for Life Science (CC BY-SA 2.1 Japan as stated by Z-Anatomy; BodyParts3D is now
CC BY 4.0, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html).
Changes for Atlas: structures selected for the respiratory and circulatory systems with digestive and skeletal context, simplified, renamed, centrelines and route landmarks baked.
Static meshes; no rig, weights, fibres or attachment sites. heart-and-lungs.glb is licensed
CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
```

## Reproduce

```sh
python3 scripts/anatomy/manifests.py --topic heart-lungs
python3 scripts/anatomy/run.py --topic heart-lungs
```

Inputs: `scripts/anatomy/cache/{VisceralSystem100,CardioVascular41,MuscularSystem100,SkeletalSystem100}.fbx`, `Regions of human body100.fbx`, `inventory.json` (local only; hashes in `cache/SHA256SUMS.txt`). Previews: [preview-review.md](preview-review.md).
