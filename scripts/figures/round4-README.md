# i-a round 4: original-pixel corrections

Only `warring-states-tiger-tally` and `coral-reef-polyp` are retouched. The
crossbow, chariot, monsoon and all other images remain untouched. No deletions.
This pass does not run the historical redraw generators or an AI renderer.

The two `materials/round4-*-original.webp` files are byte-for-byte snapshots of
the current originals at the start of this pass, pinned by SHA-256 in the
retouch script. Reproduce with installed Python Pillow/numpy/OpenCV and Sharp:

```sh
python3 scripts/figures/round4-retouch.py
pnpm tsx scripts/figures/round4-review.ts
```

The tally retouch removes the glyphs inside two narrow internal bands only,
using uninscribed graphite sampled from the same cut faces. No animal,
silhouette, ornament, joint, notch, peg or outline is redrawn. The polyp retouch
fills the old vertical mouth slit with neighbouring original tissue texture
and puts a small plain oval opening at its centre. All tentacles, the cup,
viewpoint and framing remain as in the original. Both EN/ZH occurrences of
each Figure's alt/caption are updated; the polyp is described as an oblique
view, and the false cutaway claim is removed.

Lossless masters change 18,066 tally pixels and 1,857 polyp pixels. Assertions
check that every pixel outside the local masks and every alpha value is
identical to the original. Original subject widths remain 87.8% and 73.8% of
the frame. The small oval is 30×20 native pixels (10.5×7 at 420px); the user's
round-4 original-only instruction takes precedence over enlarging the mouth
to the generic 40px teaching-feature target.

Exports retain 1200×900 dimensions. Tally: 118,338 bytes, quality 92, exact
original alpha. Polyp: 119,616 bytes, quality 93, alpha quality 80; maximum
alpha rounding error is 2/255. No blur, resampling or global texture pass is
used. The comparison proofs show no visible encoding loss at 420px, 840px or
native-2× details. Composite PSNR is at least 52.8 dB and mean absolute channel
error at most 0.245/255. Neither figure needs an inversion exception: graphite
tone models surface shading, not an illumination state.

Six manually inspected checks per figure are in
`scripts/figures/round4-manifest.jsonl`. The selected final proofs and
audit are in `/private/tmp/atlas-ia-round4/final`, including
`contact-sheet-420.png`, both themes at 420/840px, native-2× local details and
lossless-master/WebP comparisons. All checks were inspected in both themes.
Gate logs are one directory above the selected proofs.

`pnpm check`, `pnpm validate` and `pnpm build` pass. The default `pnpm test`
run hit an existing shared-store deep-import resolution failure for
`@react-three/drei/web/Html`, plus one 5000ms timeout. The timeout passes with
bounded concurrency. The dependency itself exists and imports in Node; a
temporary Vitest configuration aliases that one path to a byte-identical
local dependency copy, leaving application/test sources and the shared store
untouched. The full suite is rerun with:

```sh
pnpm run test --config /private/tmp/atlas-ia-round4/vitest-local.mts
```

The temporary configuration keeps the original test include pattern, uses
four workers and a 30000ms timeout; it does not skip tests or change
assertions. See `test-final.log` and `test-environment.json` beside the proof
directory. This is an environment workaround, not a repair to the repository's
default test command. The full rerun passes all 275 files / 6,523 tests;
`final/gates.json` records both the standard-command failure and this pass.
