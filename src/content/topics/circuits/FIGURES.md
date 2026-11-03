# Circuit engraving repairs — 2026-11-03

Generator: `scripts/figures/circuits.ts`; engraving and encoding:
`scripts/figures/graphite.ts`; local material sampler:
`scripts/figures/materials.ts`. Regenerate with
`pnpm tsx scripts/figures/circuits.ts`.

| Output under `public/illustrations/figures/` | Dimensions | Bytes |
|---|---|---:|
| `circuits-series-parallel.webp` | 1200×900 | 110,524 |
| `circuits-festive-lights.webp` | 1200×900 | 117,904 |

Checks (`tests/figure-geometry.test.ts` and generator assertions):

- Series board: battery → first bulb → second bulb → battery, one loop. Opening either filament breaks it. Parallel board: each lamp's two separate terminals connect to opposite battery poles; opening either lamp leaves the other branch complete.
- The same board projection places wire ends and terminal screws. Clearance assertions reject wires passing within 11 scene units of unrelated terminals and crossings between unrelated electrical branches. Rounded bends and gently bowed inter-lamp wires were also followed visually.
- Both boards have depth, wood grain, upright glass globes, turned metal sockets, pencil shading, contact shadows and soft cast shadows. The parallel pair has brighter filaments, larger light halos and longer radiating strokes; the series pair is dimmer.
- Festive string: exactly ten lamps, eleven wires, one open filament, all ten dark. The top-right lamp has cracked glass and separated filament ends, with an intact rounded outline and no flame shape. Every lamp's conservative bounding box lies inside the tray's inner ellipse. No wire crosses an unrelated terminal.
- Transparent exterior, neutral graphite and no labels. Lossy WebP RGB/YUV rounding is allowed one 8-bit code value of channel difference; all assets stay within 120,000 bytes. No network images. The wood material is sampled from clear board grain in the original repository illustration; provenance is in `scripts/figures/materials/README.md`.

Accepted EN/ZH series/parallel alt text is unchanged, as are its captions.
Festive EN/ZH alt/captions still accurately describe ten dark lamps, two
batteries, the oval tray and the top-right broken bulb. Series/parallel now uses
`invert={false}` in both language copies, preserving light halos in cinema.

Offline visual QA: full-size outputs beside the original neighbouring
`circuits-tester` and `light-and-shadows-opaque-translucent` engravings; also
420 px paper/cinema composites. Reproduce with
`pnpm tsx scripts/figures/review.ts` (writes `/tmp/atlas-fig-review/final/`).
No browser or desktop was opened or driven.

Gates: `pnpm check`, `pnpm validate`, `pnpm test`, `pnpm build` passed.
