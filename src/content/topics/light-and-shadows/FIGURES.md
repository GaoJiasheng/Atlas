# Shadow engraving repair — 2026-11-03

`public/illustrations/figures/light-and-shadows-same-object-two-shadows.webp`:
1200×900, 100,740 bytes, neutral graphite, transparent exterior.

Generator: `scripts/figures/light-shadows.ts`; shared engraving and encoding:
`scripts/figures/graphite.ts`. Regenerate with
`pnpm tsx scripts/figures/light-shadows.ts`.

Checks (`tests/figure-geometry.test.ts` and generator assertions):

- The same cylinder has radius 52, length 170 and centre X = 475 in both arrangements. Only its axis changes: upper Y (side-on to the light), lower X (end-on).
- Identical collimating torches, cylinder centres, screen planes (X = 850) and affine camera in both rows. The lens aperture covers both silhouettes. All objects have modelled depth, fine contours, surface pencil work and soft contact/cast shadows.
- Cylinder wall strips and curved pencil strokes lie on its analytical surface. End-face concentric rims, torch casing, lens and stand are projected from 3D points.
- Parallel rays travel along +X. Projection `(x,y,z) → (850,y,z)` produces a 170×104 rectangle for the side-on tin and a radius-52 circle for the end-on tin. The common oblique view makes the screen circle appear elliptical, as expected on that angled plane. Dashed segments behind the opaque tin are construction lines.
- Existing bilingual alt/caption remains accurate, including its explicit parallel-ray model and dashed construction lines. `invert={false}` remains in both copies, keeping shadows darker than the screen in both themes.
- No network images, labels or invented text. Alpha/dimensions and the 120,000-byte budget are tested. Neutral WebP rounding is limited to one 8-bit code value between channels.

Full-size outputs and 420 px paper/cinema composites were inspected beside the
original `circuits-tester` and `light-and-shadows-opaque-translucent` engravings.
Reproduce with `pnpm tsx scripts/figures/review.ts`, writing
`/tmp/atlas-fig-review/final/`. No browser or desktop was opened or driven.

Gates: `pnpm check`, `pnpm validate`, `pnpm test`, `pnpm build` passed.
