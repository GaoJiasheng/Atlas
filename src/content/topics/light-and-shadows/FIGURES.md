# Shadow figure repair — 2026-11-03

`public/illustrations/figures/light-and-shadows-same-object-two-shadows.webp`:
1200×900, 31,780 bytes, neutral graphite, transparent ground. Independent Atlas
geometry drawing; no image generation or labels.

Generator: `scripts/figures/light-shadows.ts` (shared engraving / encoding:
`scripts/figures/graphite.ts`). Regenerate with
`pnpm tsx scripts/figures/light-shadows.ts`.

Checks (`tests/figure-geometry.test.ts`, also asserted by the generator):

- One cylinder of radius 52 and length 170, centred at X = 475. Only its axis changes: upper Y (perpendicular to the beam), lower X (parallel to the beam).
- Identical collimating torches, cylinder centres, screen planes (X = 850), affine camera and scale in both rows. The torch aperture covers both silhouettes.
- Rays run along +X. Projection `(x,y,z) → (850,y,z)` gives a 170×104 rectangle for the side-on tin and a circle of radius 52 for the end-on tin, before the same oblique view is applied. The circle looks elliptical on the angled screen, like any circle on that plane.
- Bilingual caption explicitly states that the torch uses parallel rays, and that dashed lines are construction lines behind the opaque tin. A point-source torch would curve the side-on cylinder silhouette; this plate intentionally models a collimated beam so the stated rectangle is exact.
- Both themes preserve dark shadows on pale screens (`invert={false}`). The cinema image sits on muted paper. Neutral greys, alpha, dimensions and the 120,000-byte budget are tested.

Visually inspected large and at 420 px on paper and cinema. Traced the cylinder
axes and the parallel boundary rays to the two computed screen contours. The
existing bilingual alt still describes the two orientations and shadows.

QA: `pnpm check`, `pnpm validate`, `pnpm test`, `pnpm build` passed.
The new headless tone e2e and `pnpm shoot light-and-shadows --layout --keys
--theme all` could not launch Chromium in this macOS sandbox
(`MachPortRendezvousServer: Permission denied`), before any page loaded.
Visual inspection used local raster composites; the unit tone regression also
checks the actual CSS exclusion and samples all four shipped Moon phases.
