# Equal-slice engraving cover — 2026-11-03

Generator: `scripts/figures/fractions.ts`; engraving/encoding:
`scripts/figures/graphite.ts`; local material quilting:
`scripts/figures/materials.ts`. Regenerate with
`pnpm tsx scripts/figures/fractions.ts`.

| Output under `public/illustrations/` | Dimensions | Bytes |
|---|---|---:|
| `fractions.webp` | 800×800 | 91,772 |
| `fractions@2x.webp` | 1600×1600 | 118,970 |

Checks (`tests/figure-geometry.test.ts` and generator assertions):

- Exactly eight sectors share one radius and centre, each π/4 = 45°. Their areas sum to the whole disc. Seven stay together; the upper-right eighth moves out along its bisector by translation only.
- One affine camera transform applies to all eight pieces. Both densities use the same geometry, so angle, area and orientation stay consistent between outputs.
- The original round-roti composition is retained. Small interior graphite surface samples from the original repository cover are quilted deterministically and clipped inside the new sectors. They contain no original silhouette or cut lines; all eight boundaries are code geometry. Provenance and crop coordinates: `scripts/figures/materials/README.md`. No network imagery.
- Fine layered pencil lines on the cut faces/rim and a soft cast shadow give the disc thickness. Texture, shadows and line shading cannot change the equal sector geometry. No labels or invented text.
- Exterior alpha and filenames/dimensions are retained. Neutral WebP channel rounding is at most one 8-bit code value; both files are below 120,000 bytes. The generator refreshes only the fractions 16×16 alpha mask in `src/lib/illustrations.json`.

Topic-title EN/ZH alt remains accurate. No chapter text changes.
Full-size and 420 px paper/cinema composites were inspected beside the original
neighbouring `circuits-tester` and `light-and-shadows-opaque-translucent` plates.
Reproduce with `pnpm tsx scripts/figures/review.ts`, which writes
`/tmp/atlas-fig-review/final/`. No browser or desktop was used.

Gates: `pnpm check`, `pnpm validate`, `pnpm test`, `pnpm build` passed.
