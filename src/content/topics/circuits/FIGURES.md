# Circuit figure repairs — 2026-11-03

These two independent Atlas graphite plates are drawn from explicit geometry,
without image generation. Generator: `scripts/figures/circuits.ts`, shared SVG /
encoding tools: `scripts/figures/graphite.ts`.

Regenerate: `pnpm tsx scripts/figures/circuits.ts`.

| Output under `public/illustrations/figures/` | Dimensions | Bytes |
|---|---|---:|
| `circuits-series-parallel.webp` | 1200×900 | 24,538 |
| `circuits-festive-lights.webp` | 1200×900 | 32,498 |

Checks (`tests/figure-geometry.test.ts`, also asserted by the generator):

- Series board: one path, battery → first bulb → second bulb → battery. Opening either filament breaks it.
- Parallel board: each lamp has one terminal connected to each battery pole. Opening either filament leaves the other branch complete. Every visible wire ends at the screw identified by the electrical graph; there are no wire crossings on either board.
- The same lamp geometry is used four times. The parallel pair has longer and heavier radiating pencil strokes (brightness 1 versus .26), which remain distinguishable when the plate is inverted for cinema.
- Festive string: ten lamps and eleven connecting wires, one broken filament, all ten dark, no glow or light rays. Repairing the one open filament completes the circuit. Lower-row terminal order reverses with the string, avoiding crossings.
- Both rasters have neutral greys, transparent ground, and are below 120,000 bytes. No labels or invented text.

Visually inspected at large size and 420 px, on paper and with the cinema
inversion. Followed both battery poles to each parallel lamp and counted all
ten dark festive lamps. Bilingual festive alt now describes the series path,
batteries and broken filament; caption no longer claims a before-break view.

QA: `pnpm check`, `pnpm validate`, `pnpm test`, `pnpm build` passed.
The new headless tone e2e and `pnpm shoot light-and-shadows --layout --keys
--theme all` could not launch Chromium in this macOS sandbox
(`MachPortRendezvousServer: Permission denied`), before any page loaded.
Visual inspection used local raster composites; the unit tone regression also
checks the actual CSS exclusion and samples all four shipped Moon phases.
