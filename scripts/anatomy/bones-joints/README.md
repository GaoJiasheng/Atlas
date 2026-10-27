# Bones and joints offline geometry

This topic-local pipeline reads the already cached Z-Anatomy skeleton FBX and the
published `muscles-arms.glb`. It neither downloads sources nor modifies the shared
six-region pipeline. Its original selection, teaching geometry, labels and glue,
the resulting `parts.json`, rig/contact metadata and GLB are CC BY-SA 4.0.

```sh
python3 scripts/anatomy/bones-joints/run.py --source-cache /path/to/scripts/anatomy/cache
```

Native Blender 5.1.2 could not initialize in this restricted build environment:
the harmless `--background --factory-startup --python-expr 'print(...)'` probe
exited 139 before executing Python. This pipeline is an explicitly recorded
deviation. It does **not** claim native export, native preview acceptance, medical
review, approved attachment faces or approved motion axes.

`build.mjs` uses Three's installed FBXLoader to extract exact named source meshes.
`fbx-vertices.mjs` independently reads the binary FBX control points to compare
all-source bounds against the cached native inventory. Render meshes contain only
vertices referenced by faces; unreferenced FBX control points are intentionally
excluded from visible geometry. Each rib is simplified separately before its side
is regrouped. Small detail bones and the source pieces that failed the first
surface audit are retained without simplification.

Inherited muscle and skin primitives are decoded to true bind-world geometry
before regrouping. The compressed source has per-mesh quantization embedded in
different inverse-bind matrices; sharing one of those matrices would distort
another mesh. The new skin uses the exact existing 19-joint hierarchy, fresh
inverse-world bind matrices and remapped original joint indices/weights.
`verify.mjs` checks the actual compressed output against source bind bounds, finite
normalized weights, joint world positions and the GLB hash.

`audit.py` independently computes bidirectional sampled point-to-triangle errors.
It samples source and simplified vertices and face centres and searches 64 nearest
triangle-centroid candidates. This gives a conservative sampled ceiling, not a
proof of continuous Hausdorff error. The gate remains 1 mm; the codec adds less
than 0.003 mm in the present output. `contacts.py` derives candidate hand pivots
from opposing source-surface vertices and explicitly retains `review: pending`.

`preview.py` makes source/decimated front, back, left and elbow-pose CPU orthographic
diagnostics. Their painter shading is useful for proportions and silhouette,
but does not test browser lighting, clipping, transparency, skin deformation or
clinical correctness. The generated PNGs and large intermediate triangle arrays
stay in the ignored `scripts/anatomy/cache/bones-joints/` directory.

The limits are unchanged: 4,000,000 compressed bytes, 350,000 triangles, fewer than
100 runtime calls. Runtime calls, labels, paper/cinema, skin, mobile and browser
screenshots still require the separately recorded page QA.
