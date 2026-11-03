# Local graphite material samples

These are **material only**, sampled from existing Atlas engravings at
`56dfcf5^`. No downloaded or generated images are involved. New silhouettes,
electrical wiring, projections and slice boundaries are all generated in code.
The DEFLATE files contain unsigned 8-bit neutral luminance, row-major.

- `wood-surface.gray.deflate`: 350×64 pixels from the original
  `public/illustrations/figures/circuits-series-parallel.webp`, crop
  `(left=180, top=375, width=350, height=64)`. Clear wood between the components.
- `roti-surface.gray.deflate`: six consecutive 256×256 samples from the original
  `public/illustrations/fractions@2x.webp`. Interior crops, resized to 256×256:
  `(240,480,180,180)`, `(220,470,200,220)`, `(900,230,210,210)`,
  `(240,800,190,200)`, `(550,1070,120,180)`, `(270,530,160,150)`.
  These contain folds/toast shading, with no exterior silhouette or cut lines.

`scripts/figures/materials.ts` embeds the wood as a grain field, and assembles
roti samples by deterministic mirrored quilting with 64-pixel overlap and
48-pixel feathering. Neither operation supplies teaching geometry. Both are
clipped to the new mathematically defined surfaces.
