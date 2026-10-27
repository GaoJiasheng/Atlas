# Bones and joints geometry report · 2026-10-27

The published packet contains **44 mesh nodes**, **313,580 triangles**, and
**3,024,092 compressed bytes**. SHA-256:
`4ddb706ff0664f772e294d6210294258556775a3037cf7c3a3ed51fead6f362e`.
Limits remain 4,000,000 bytes and 350,000 triangles. The model has 49 mesh primitives;
the inherited biceps/triceps heads and three body-surface pieces retain separate
primitives inside their grouped selectable nodes.

There are 34 full-body semantic bone selections, seven source-backed left-hand
close-up bones, two inherited muscle selections and one context body surface.
Eighteen original procedural teaching selections complete the runtime packet to
61 selectable parts plus the one context. The 34 overview regions merge many
individual bones and are never presented as an anatomical bone count.

The adult source frame is metres, +Y up, +Z anterior, +X the body's own left.
Source centre is `[0, 0.030789900571107864, 1.2483623027801514]` in the original
Z-up frame; source stature is 1.7095352601027116 m. The source is not scaled to
represent a child and is not grounded a second time.

`manifest.json` records every source mesh, its simplification count and native
inventory control-point bbox error (all at most 1 micrometre). Both sides contain
all twelve named rib meshes and ten costal-cartilage pieces. The sternum merges
Manubrium, Body and Xiphoid meshes; no `.g` EMPTY is used as geometry. Radius/ulna,
tibia/fibula and patella are separate sided selections. Source skeleton FBX SHA:
`294a649765cd060a62a4095da52b9c8ef2d97769aa447e196448aa5f7d596dea`.

The **independent sampled surface audit passed 236 source jobs** with a maximum
0.945331684201157 mm against the unchanged 1 mm gate. Initial left/right parietal
and fourth-left costal cartilage failures were resolved by retaining their full
source geometry (both fourth cartilages retained symmetrically). No gate was
relaxed. Sampling and nearest-centroid candidate limitations are explicit in
`surface-audit.json` and the runner README.

The **actual compressed-output audit passed** all 44 node bind bounds, finite
normalized skin weights and all 19 inherited joint world positions. Maximum
codec bbox difference is 0.002653060639123961 mm. A fresh inverse-bind skin avoids
distortion from the source GLB's per-mesh quantization; the two grouped muscles
and merged body context are compared with independently decoded original arms
nodes. Custom muscle fibre fields and original normalized weights are retained.

The hand close-ups share one translation `[-2.27, .39, -.03]` with no scale change.
`joint-detail.json` records nearest-source-surface pivot candidates for the plane,
MCP and thumb examples. Their source vertex gaps are approximately 0.441, 0.335
and 0.472 mm. The displayed conservative XYZ rotations are DESIGN demonstrations;
their axes and ranges have **not** received medical approval. `anatomy-sites.json`
retains original muscle attachment candidates and their pending status. Visible
tendon segments are explicitly enlarged schematics, not scanned isolated tendons.

Teaching stations are x=-2 m (generic joint and actual hand, shown separately),
x=2 m (cut bone/growth/remodelling and four fixed repair specimens), and x=4 m
(ideal lever). Beam length is 0.30 m; the point load lies at L=0.15/0.30 m. Twenty-
four static rows independently implement `d=L|sin(theta)|`, `tau=W*d`,
`Fm=tau/0.04`. Four angle-guarded equivalent pull arrows act 0.04 m from the pivot,
perpendicular to the beam; they do not depict the real biceps line. Gravity stays
vertical. Arrow display scale is 0.001 m/N, capped at 0.20 m. Tip x/y are internal
layout outputs. Exploration mode applies no joint override; lever mode overrides
only the left elbow. Named end poses and manual beat stepping replace looping
clips to avoid two simultaneous sequences controlling the same forearm chain.

The engine merges same-material procedural pieces within each selectable part.
The 16 lattice struts therefore form **one** material draw. Conservative all-parts
base estimate: 49 GLB primitives + 22 procedural material batches + 1 force-vector
batch = **72**; normal chapters hide other stations. Browser diagnostics must
still measure runtime calls including edge/shadow/cap passes; 72 is not a hardware
or page-performance measurement.

Front/back/left/pose source-versus-reduced CPU projections were generated and
visually inspected; observations and limits are in `preview-review.md`.

**REVIEW:** Native Blender initialization exited 139 before Python execution.
This recorded Three FBXLoader extraction path is not native export acceptance.
Native previews, named attachment faces, clinical demonstration axes, actual
browser skin poses, labels, materials, clipping, mobile and paper/cinema remain
separate review gates. The topic's requested publication status does not convert
any of those pending reviews to approval.
