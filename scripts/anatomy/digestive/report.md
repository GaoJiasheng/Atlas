# Digestive region — round 10

Published: `public/models/digestive-system.glb`. **2,089,100 bytes / 233,254 triangles / 28 nodes / 28 draws.**

SHA-256: `7f91334e469754b5b92fc2f2fa3a003bd22c220dd73d5e03a5309309569106d7`

Static native Blender meshes, no armature, JOINTS, WEIGHTS, fibres or attachment sites. Every tube carries float32 `_U` (0 upstream, 1 downstream). Mesh/node extras retain role, layer, bodySystem, source labels and section-cap intent (`closed`); source topology is recorded separately.

## Audit

**PASS mesh gates; FLOW REVIEW REQUIRED** — node allowlist, finite attributes, source scale/floor/sides, codec roundtrip, soft/hard budgets, sampled surface deviation, topology and tube station projection.

Surface errors sample both directions with referenced vertices plus 6,000 area-weighted triangle points each direction. These are sampled estimates. No section filling or repairs to source openings. Closed sources may not acquire new boundary edges. Centreline containment uses 2 mm sampling, audit-only caps over open rings, and local convex section envelopes at intentional C-shaped wall windows; 1.5 mm exit tolerance. Separate ray-segment checks detect path intersections with actual source walls. Codec `_U` nearest-segment ties permit at most 0.1 mm extra spatial projection error. Jejunal `_U` is independently checked against source-ring stations by source-triangle interpolation; at overlapping coils, a matching original station vertex must exist within 0.2 mm. Nearest-centreline projection is intentionally not the jejunal station authority. This is a mesh check, not anatomical validation.

Flow review:  **jejunum: 13 flow segments cross overlapping source walls; exact original section centres independently reproduce the defect**

| Mesh | Role | Source tris | Decoded tris | Sample error mm | Limit mm | Closed before/after | Boundaries |
|---|---|---:|---:|---:|---:|---|---:|
| teeth-upper | organ | 23,088 | 4,500 | 0.230 | 1.5 | True/True | 0 |
| teeth-lower | organ | 23,772 | 4,500 | 0.238 | 1.5 | True/True | 0 |
| tongue | organ | 682 | 682 | 0.001 | 1.5 | True/True | 0 |
| salivary-glands.l | organ | 2,420 | 2,420 | 0.001 | 1.5 | True/True | 0 |
| salivary-glands.r | organ | 2,420 | 2,420 | 0.001 | 1.5 | True/True | 0 |
| pharynx | organ | 5,020 | 3,500 | 0.111 | 1.5 | True/True | 0 |
| oesophagus | tube | 16,320 | 4,000 | 0.083 | 1.5 | True/True | 0 |
| stomach | tube | 9,468 | 9,468 | 0.002 | 1.5 | False/False | 140 |
| duodenum | tube | 1,750 | 1,750 | 0.001 | 1.5 | False/False | 24 |
| jejunum | tube | 27,648 | 26,000 | 0.063 | 1.5 | False/False | 24 |
| appendix | tube | 442 | 442 | 0.001 | 1.5 | True/True | 0 |
| ascending-colon | tube | 17,512 | 6,000 | 0.259 | 1.5 | True/True | 0 |
| transverse-colon | tube | 16,616 | 7,000 | 0.141 | 1.5 | True/True | 0 |
| descending-colon | tube | 24,744 | 9,000 | 0.256 | 1.5 | True/True | 0 |
| sigmoid-colon | tube | 3,432 | 3,432 | 0.001 | 1.5 | True/True | 0 |
| liver | organ | 12,270 | 10,000 | 0.078 | 1.5 | False/False | 38 |
| gallbladder | organ | 722 | 722 | 0.001 | 1.5 | True/True | 0 |
| pancreas | organ | 5,222 | 5,000 | 0.026 | 1.5 | True/True | 0 |
| bile-duct | organ | 2,016 | 2,000 | 0.010 | 1.5 | False/False | 24 |
| skeleton | system | 551,891 | 39,853 | 2.589 | 4.0 | False/False | 134 |
| muscles-superficial | system | 325,496 | 34,926 | 1.793 | 4.0 | False/False | 12 |
| diaphragm | system | 38,868 | 4,000 | 0.655 | 4.0 | False/True | 0 |
| lungs | system | 42,144 | 13,999 | 0.249 | 4.0 | False/False | 144 |
| trachea | system | 4,756 | 3,500 | 0.129 | 4.0 | False/False | 42 |
| heart | system | 29,664 | 9,000 | 0.304 | 4.0 | False/False | 800 |
| great-vessels | system | 3,987 | 3,987 | 0.004 | 4.0 | False/False | 293 |
| skin-outline | skin | 100,818 | 17,843 | 2.650 | 35.0 | False/False | 169 |
| skin-wire | skin | 100,818 | 3,310 | 11.116 | 35.0 | False/False | 45 |

## Tube centrelines

Coordinates match GLB world coordinates: metres, +Y up, +Z anterior, +X anatomical left. Topic origin is the midline umbilicus. `organs.json` records the exact source centre, floor and ground offset. Add `groundOffsetM` only when grounding both model and paths. `centrelines.json` is the flow hand-off; points are spaced at most 8 mm. Each polyline runs upstream to downstream. Appendix is a blind side branch, not part of the food route.

| Tube | Method | Points | Length m | Schematic | Max exit mm | _U audit outliers |
|---|---|---:|---:|---|---:|---:|
| oesophagus | principal-axis triangle-section perimeter centroids | 36 | 0.2778 | False | 0.000 | 0 |
| stomach | surface-geodesic ring centroids (anatomical neighbour end rings) | 30 | 0.2287 | False | 0.000 | 0 |
| duodenum | surface-geodesic ring centroids (anatomical neighbour end rings) | 13 | 0.0912 | False | 0.000 | 0 |
| jejunum | topological medial axis: exact 12-vertex source section rings | 1015 | 2.0191 | False | 0.000 | 0 |
| appendix | principal-axis triangle-section perimeter centroids | 11 | 0.0745 | False | 0.000 | 0 |
| ascending-colon | principal-axis triangle-section perimeter centroids | 25 | 0.1879 | False | 0.000 | 0 |
| transverse-colon | principal-axis triangle-section perimeter centroids | 27 | 0.2019 | False | 0.000 | 0 |
| descending-colon | principal-axis triangle-section perimeter centroids | 39 | 0.2969 | False | 0.000 | 0 |
| sigmoid-colon | principal-axis triangle-section perimeter centroids | 17 | 0.1203 | False | 0.000 | 0 |

## Available-source endpoint gaps

These are extraction endpoints, not a continuous food path. Paths are inset at partial wall lips. Content must review and bridge only anatomically supported gaps; the missing segments remain explicit breaks.

| From | To | Gap mm | Missing between |
|---|---|---:|---|
| oesophagus | stomach | 5.77 | — |
| stomach | duodenum | 0.00 | — |
| duodenum | jejunum | 70.14 | — |
| jejunum | ascending-colon | 40.49 | ileum, caecum |
| ascending-colon | transverse-colon | 28.59 | — |
| transverse-colon | descending-colon | 17.64 | — |
| descending-colon | sigmoid-colon | 46.57 | — |

## Source gaps and grouping

- No separately named **ileum, caecum, rectum, anal canal/anus** in either new FBX or existing anatomy inventory. Omitted; never substituted with urinary/reproductive structures or invented geometry. The sigmoid source reaches the pelvic outlet; its label is retained rather than relabelling an inferred rectum.
- **Jejunum is a connected coiled tube**, with two 12-vertex end rings, not a lumped mass. Exact 12-vertex source section rings trace its actual connectivity (1,153 source sections). The source is only about 2 m along this derived path; do not use mesh length as physiological intestine length or call this a separately identified ileum.
- Exact jejunal source ring centres independently cross neighbouring source walls at tight folds. `sourceOverlapCrossings` records the affected flow locations in topic coordinates. This is a source self-overlap defect, not a lumped mass or a schematic path. Do not claim an unobstructed lumen at those stations; clipping/flow presentation needs review.
- Pharynx combines oropharynx and laryngopharynx; nasopharynx excluded from the food route. Salivary glands combine three real glands per side. Teeth are merged by jaw: **28 source teeth**, no third molars.
- Lungs merge five visceral lung lobes. Heart merges four cardiovascular chamber surfaces; no single Heart source. Skeleton merges skull/jaw, thorax, spine/pelvis and limb bones into one context mesh; superficial muscles merge selected real bilateral meshes. Full source labels are in manifest and GLB extras.
- Skin outline and 3–5k wire keep whole static hands; the muscle topics’ articulated wrist split is unnecessary here. Skin context permits 35 mm sampled deviation. Opaque outline is higher detail than wire.
- Source oesophagus and colon have partial C-shaped wall windows near their ends. Section-envelope containment includes the exposed lumen; it does not claim these source windows are physically sealed. End paths are inset from oblique wall lips to avoid crossing tissue.
- Missing segments leave gaps: content must not silently join a continuous mouth-to-anus path. Neighbour endpoints and gaps are reported in the centreline hand-off. Procedural close-ups and flow rendering remain content/engine work.

## Provenance

Local cached FBX only; no downloads. [New source inventory](inventory.md) lists every object, triangles and welded closedness, including helpers (not exported). Source file hashes match `cache/SHA256SUMS.txt`. Model copyright survives compression. Cached source attribution follows Z-Anatomy / BodyParts3D; organ-by-organ upstream licence verification remains a publication review item.

## Nodes

```text
teeth-upper
teeth-lower
tongue
salivary-glands.l
salivary-glands.r
pharynx
oesophagus
stomach
duodenum
jejunum
appendix
ascending-colon
transverse-colon
descending-colon
sigmoid-colon
liver
gallbladder
pancreas
bile-duct
skeleton
muscles-superficial
diaphragm
lungs
trachea
heart
great-vessels
skin-outline
skin-wire
```

## Reproduce

```sh
python3 scripts/anatomy/manifests.py --topic digestive
python3 scripts/anatomy/run.py --topic digestive
```

Previews and visual inspection: [preview-review.md](preview-review.md).
