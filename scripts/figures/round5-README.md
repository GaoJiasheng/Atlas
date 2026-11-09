# i-a round 5 — coral-reef-polyp only

The entire vertical almond rim and the round-4 dark dot are removed. One small
horizontal mouth has a low rounded lip, shallow graded interior, and radiating
disc ridges flowing into it. The accepted tiger tally is untouched. No deletions.
Round-4 English/Chinese alt text and captions are retained verbatim.

Method: built-in imagegen `precise-object-edit` on a 4× crop of the failed
retouch, then a feathered local composite onto the frozen round-4 original.
`materials/round5-polyp-mouth-patch.png` preserves the selected AI patch, so
reproduction does not need another generation call. The source is pinned by
SHA-256. Run:

```sh
pnpm tsx scripts/figures/round5-polyp-retouch.ts
```

The lossless master changes 17,640 pixels inside one 148×172 elliptical mouth
patch only; every pixel outside the patch and every alpha value matches the
original. Export: 1200×900 transparent WebP, 113,604 bytes, quality 91, alpha
quality 80 (maximum alpha rounding error 2/255). The entire animal fills 73.8%
of the frame width. The user's explicit small-mouth size takes precedence over
the generic 40px teaching-feature target. Inversion is appropriate: graphite
shading describes relief, not a physical illumination state.

Six manually inspected acceptance checks ship in
`scripts/figures/round5-manifest.jsonl`. Offline paper/cinema proofs,
420/840px views, native-4× before/after crops and lossless-master/export
comparisons are in `/private/tmp/atlas-ia-round5`. No browser or desktop is used.

## Gates

`pnpm check`, `pnpm validate`, and `pnpm build` pass. The standard `pnpm test`
still encounters the round-4 shared-store `@react-three/drei/web/Html` resolution
failure and a five-second toad-model timeout. The full suite passes **275 files,
6,523 tests** using the existing round-4 temporary alias to a byte-identical
dependency copy, four workers, and a 30-second timeout:

```sh
pnpm run test --config /private/tmp/atlas-ia-round5/vitest-local.mts
```

No tests are skipped, assertions changed, or repository configuration edited.
This is a passing full-suite workaround, not a passing default test command.
Both runs and all other gate logs are retained in the preview directory.

## Exact imagegen prompt

Use case: precise-object-edit. Input image 1 is the edit target: a 4x enlarged crop of an existing graphite illustration of a coral polyp oral disc. Retouch the original pixels ONLY within the central area; preserve registration, framing, the outer ridges, exact graphite grain, shade, line weight and original organic texture. Completely remove the ENTIRE tall vertical almond-shaped raised rim (roughly x=350..610, y=270..700) AND the flat dark oval dot inside it. Replace that whole tall almond with ordinary oral-disc tissue ridges that converge inward naturally to ONE small HORIZONTAL rounded oval mouth at image centre (480,480). Mouth width about 130 pixels, height about 65 pixels, i.e. one third of the removed vertical almond's length. Soft, low raised fleshy lip; shallow shaded interior, gently graded darkening along depth, NO flat black fill, NO isolated hard dark centre, no pupil, no iris, no sharp points, no surrounding large almond. Radiating disc ridges flow continuously inward into this small lip, including through former top and bottom points of the erased almond. Keep everything outside this local retouch absolutely unchanged. Monochrome graphite scientific technical plate, original stipple grain. Countable facts: exactly one mouth, zero eye structures. NO text, NO characters, NO inscriptions, NO floating parts, NO eye-like shapes, NO zigzag break lines, NO exposed bones outside muscles. Do not create any tentacle or organ or extra opening. Return same crop composition with only this precise local repair.
