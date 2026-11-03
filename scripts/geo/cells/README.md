# Cells model study

Rebuild the complete production packet with:

```sh
pnpm tsx scripts/geo/cells/generate.mjs
pnpm exec vitest run tests/space-scene/cells-geometry.test.ts
```

The original procedural geometry follows `docs/63-cells-content-spec.md` §3
and §6. Units are metres, Y points up, +Z points towards the viewer. Cell
models are enlarged 2,000 times independently of the microscope. Membrane and
wall thicknesses are further exaggerated for visibility. Group scale bars
apply only to the independent animal and plant models.

## References inspected before construction

- `/Users/gavin/work/atlas/art/planned/cells/cells.png`: prepared original
  Atlas cutaway study; inspected with `view_image` on 2026-10-29. Used for the
  distinct plant wall/membrane, peripheral chloroplasts, large central
  vacuole, side nucleus and flattened animal-cell silhouette.
- `/Users/gavin/work/atlas/art/planned/cells/cells-microscope.png`: prepared
  original Atlas instrument study; inspected with `view_image` on 2026-10-29.
  Used for the curved arm, base, one inclined eyepiece, nosepiece, three lens
  barrels, illuminated stage aperture and coaxial focus knobs.
- Scientific topology and limitations: preparation dossier
  `art/research/cells/facts.json` and `docs/63` F-B04–F-B12, F-M04–F-M10,
  F-D01 and F-D04–F-D06. Production part prose cites S1–S24, consistently
  with the production source table. Geometry is an original reconstruction;
  no third-party figure, mesh, texture or photograph is incorporated.

The preparation images are references only; the production model has no
runtime external requests and no external assets. The model is original
Atlas content under the repository content licence.

## Polish construction (2026-11-03)

`generate.mjs` retains the source part metadata, then calls topic-owned
`polish-microscope.mjs`, `polish-field.mjs` and `build-organelles.mjs`.
The latter creates four original smooth GLB nodes for the irregular animal
boundary and rounded plant wall/membrane/vacuole. Indexed vertices
share analytic smooth normals; no external mesh or texture is imported.
The generator writes `public/models/cells.glb` at the schema-compatible
`/models/cells.glb` URL, using Meshopt compression (16-bit positions, filtered
normals, no mesh simplification) with a hard 1,500,000-byte limit. Both the
offline preview and geometry tests decode the production compressed asset;
content checks also load it with Three.js's production GLTFLoader/decoder.
Nuclei, nucleoli and six chloroplasts retain selectable logical ownership;
the cytoplasm uses coplanar, fitted gel regions and multi-material reliefs.
Mitochondrial matrices and rounded membrane lamellae have distinct warm
colours. Each cytoplasm label points at its first actual gel region, away
from the nucleus. The animal membrane, plant wall and plant membrane nodes
carry `extras.labelPoint` (node-local, written after quantisation) on their
visible front rims, so their leaders end on the boundary itself rather than
over the nucleus or vacuole.
Both cells have permanently exposed illustration faces in assembled mode.

The microscope preserves the original pivot `[0.20, 0.23, -0.011547005]`,
optical axis `[0.18, y, 0]`, three lens lengths and indexed rotations. The
40× barrel ends above the coverslip in every pose. Visible front surface
sectors anchor labels on the eyepiece/objectives. A CPU raycast test checks
those anchors from each authored named-lens beat.

The stage now has a continuous aperture plate and two folded spring clips;
knurled coarse/fine wheels remain coaxial. The original slide/coverslip
centres and physical motion scale are unchanged.

The live onion field is topic-owned pattern data, with nine staggered,
variable-width cells and nuclei per supertile. Every chapter/beat resets
illumination to 1; the schema-mandated shared fixture default remains .5.
The onion and tissue context reliefs also have distinct fitted cell profiles.

See `src/content/topics/cells/REBUILD-3D.md` for references, original/final
counts, preview paths and the verification boundary.

`profile.ts [parts.json] [cells.glb]` measures actual primitive generation,
Three.js GLTFLoader/Meshopt parsing, mesh pieces and triangles in Node.
It reports offline startup proxies, never browser-ready time or GPU FPS.

## Verification boundary

The focused CPU tests validate schema, counts, hollow shells, envelope sizes,
nuclear recesses, nucleus separation, chloroplast placement, objective
indexing and coverslip clearance in all three poses, slide-motion units,
finite generated vertices, triangle count and material-slot budget. They do
not substitute for the parent session's paper/cinema, bilingual, desktop and
phone screenshot review. Browser gates were deliberately left to that session.
