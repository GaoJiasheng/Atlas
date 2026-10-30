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

## Model construction and documented adjustments

The animal membrane is a hollow flattened ellipsoid approximated by fifteen
thin elliptical annuli. The cytoplasm uses matching slices with a conservative
opening around the single nucleus. The construction uses existing extrude
primitives, introduces no renderer primitive and retains the specified
0.12 × 0.09 × 0.016 m envelope. Small slice steps are a modelling compromise.

The plant wall and membrane are two separate hollow rounded rectangular
rings. Six thin bodies form peripheral cytoplasm: upper, lower, left, right,
front and back. The left body has a through-opening around the nucleus,
slightly larger than the nucleus rather than attempting an unsupported solid
subtraction. The central vacuole volume is not filled with cytoplasm. Three
linear repetitions of a pair of chloroplasts produce exactly six instances
and retain one logical selection.

The nosepiece pivot is `[0.20, 0.23, -0.011547005]`, adjusted from the
specification's overview centre. Its three mounting points form a triangle;
the shared specimen optical axis remains `[0.18, y, 0]`. Complete indexed
poses rotate the nosepiece and all barrels together by 0°, −120° and +120°
about Y. Only the chosen barrel occupies the optical axis in each endpoint.
The high objective ends at y = 0.177 m, 0.0037 m above the coverslip.

The stage top is y = 0.172 m. To sit on that surface rather than intersect
it, the slide centre is y = 0.1725 m and the coverslip centre y = 0.17315 m.
A support bracket belongs to the stage selection and connects it to the arm.
The four aperture plates leave a genuine 0.03 × 0.03 m opening. The small
focus knob overlaps the coarse knob's outer hub rather than floating beside
it. Knob rotation is a readable design animation, not a measured drive ratio.

All five tissue/context objects remain selectable; `card: false` is set on
the group, with no unselectable `context` role. These objects are symbols at
independent scales. They are not medical anatomy models or micrographs.

## Verification boundary

The focused CPU tests validate schema, counts, hollow shells, envelope sizes,
cytoplasm exclusion, nucleus separation, chloroplast placement, objective
indexing and coverslip clearance in all three poses, slide-motion units,
finite generated vertices, triangle count and material-slot budget. They do
not substitute for the parent session's paper/cinema, bilingual, desktop and
phone screenshot review. Browser gates were deliberately left to that session.
