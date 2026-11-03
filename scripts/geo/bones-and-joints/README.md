# Bones and joints teaching plates

The source skeleton, rig and geometry credits remain in
`scripts/anatomy/bones-joints/`. The 2026-11-03 polish adds original teaching
geometry here; no source skeleton mesh is reshaped or rescaled.

Rebuild the owned topic data and cortical mesh, from the repository root:

```sh
node scripts/geo/bones-and-joints/build-polish.mjs
python3 scripts/geo/bones-and-joints/cortex-mesh.py
python3 scripts/geo/bones-and-joints/repair-mesh.py
pnpm tsx scripts/geo/bones-and-joints/build-cortex.mjs
pnpm tsx scripts/geo/bones-and-joints/protected-organs.ts
node scripts/geo/bones-and-joints/verify-polish.mjs
```

Python uses the available NumPy, SciPy and scikit-image installation; no project
dependency/lockfile changes are required. The raw triangulation is an intermediate
in `/tmp/bones-polish/`. `build-cortex.mjs` simplifies/compacts it, preserves the
cut-face crease and adds the attached periosteal flap. It appends that cortex
with the four repair specimens and two uncounted tissue material skins to a
copy of the existing GLB, retaining every original node, accessor and binary
byte. The shipped file is `public/models/bones-and-joints-polished.glb`.
The cortex and four repair selections have no primitive stand-ins in final
`parts.json`.

`specimens.mjs` builds the deterministic irregular trabecular network, red and
yellow marrow, branching vessel, conforming cartilage/growth plate.
`repair-mesh.py` cuts the actual bone volumes and builds continuous clot,
callus and remodelled surfaces. Repeated fine details are merged by the
existing runtime builder. Original part ids, 61 selectable parts, both
original context parts,
chapter/beat state, poses, selection, exploded/cutaway and lever bindings remain.
`details.mjs` supplies the student text; the cortex card now names the femur
shape in EN and ZH. The joint is an unchanged generic synovial schematic.
Two uncounted material
skins provide clot/callus colour while the parent meshes retain their selection
geometry; every authored hide/ghost/highlight state mirrors the parent. Authored
positions are quantised to 10 μm and normals to signed bytes to keep the copied
packet under 4 MB.

The figure generator imports the proven 040f192 rib construction and adds
original cranial and vertebral-canal sections. It writes a 1200×900 transparent
graphite WebP under `public/illustrations/bones-and-joints/`, within 120 KiB.
Figure publication, bilingual labels, counts and hashes are in the topic's
`FIGURES.md`; sources/licences are in `data/SOURCES.md`.

CPU previews and architecture counts, without a browser or GPU:

```sh
pnpm tsx scripts/geo/bones-and-joints/preview-polish.ts
python3 scripts/geo/bones-and-joints/render-preview.py scripts/geo/bones-and-joints/previews/polish-2026-11-03/*.json
pnpm tsx scripts/geo/bones-and-joints/measure-polish.ts
```

The exporter reads the actual shipped cortex accessors and uses the runtime
builder for procedural parts. The CPU z-buffer interpolates vertex normals.
Views include frontal/oblique/rear bone, head and marrow close-ups, growth plate,
frontal/oblique repair row and the unchanged joint. They verify forms, tints and
framing; they do not certify runtime shaders, transparency or GPU FPS. Image
and geometry previews stay in ignored `previews/polish-2026-11-03/`.
