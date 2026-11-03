# Equal-slice cover repair — 2026-11-03

Independent Atlas graphite drawing of the same round roti / pie composition,
with one upper-right slice moved out. No image generation or labels.

Generator: `scripts/figures/fractions.ts`, shared engraving / encoding:
`scripts/figures/graphite.ts`. Regenerate:
`pnpm tsx scripts/figures/fractions.ts`.

| Output under `public/illustrations/` | Dimensions | Bytes |
|---|---|---:|
| `fractions.webp` | 800×800 | 55,930 |
| `fractions@2x.webp` | 1600×1600 | 116,352 |

Checks (`tests/figure-geometry.test.ts`, also asserted by the generator):

- Exactly eight contiguous sectors, each π/4 = 45°, from the same radius and centre; their areas sum to the whole disc.
- Only one sector moves out. It is translated along its bisector without changing its angle, radius, orientation or area.
- One affine transform creates the slightly oblique cover view; all sectors share it, so equal areas stay equal. Both densities use the same source geometry and deterministic flaky-roti texture clipped inside it.
- Transparent ground, exactly neutral decoded greys, original filenames and dimensions, both below 120,000 bytes. Topic-title alt remains accurate. The generator refreshes the fractions-only 16×16 alpha mask in `src/lib/illustrations.json`, keeping frontispiece leaders on the new silhouette.

Visually inspected at large size and 420 px on paper and cinema. Counted seven
sectors in place and the eighth outside; checked matching radial cut edges and
surface texture. No chapter content changes.

QA: `pnpm check`, `pnpm validate`, `pnpm test`, `pnpm build` passed.
The new headless tone e2e and `pnpm shoot light-and-shadows --layout --keys
--theme all` could not launch Chromium in this macOS sandbox
(`MachPortRendezvousServer: Permission denied`), before any page loaded.
Visual inspection used local raster composites; the unit tone regression also
checks the actual CSS exclusion and samples all four shipped Moon phases.
