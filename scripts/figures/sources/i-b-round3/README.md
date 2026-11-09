# i-b round 3 (2026-11-09)

Only circuits-power-chain and the telling-time cover (800/1600 px) are changed.
The accepted steam motion and reclamation assets are untouched.

## Power supply

`power-edit.png` is an exact recovery from commit 208d2711, read with `git show`.
Its verified SHA-256 is
`5ff573952ba5ac15b874de4672cc5cdefa0853dbdca5ae3b9dcebfe9392235ce`.
The four retained groups use that source's original round-two crop rectangles and
positions. The rejected underground crop is never embedded in the output.
`circuits-power-chain.ts` replaces it with an orthographic transverse tunnel
section, a surface line, hatched soil, a concrete arch, and three cable sections
resting on a wall-supported tray. Each cable has seven solid conductor ends.
There is no back-wall projection, transverse pipe, flange, or pipe clamp.
Four arrows are code geometry: 4.5 px shafts, 20 px heads, before scaling to 420.

## Clock cover

`telling-time.ts` retains the exact two dial positions, numeral/tick geometry and
hand silhouettes from round two. Both clocks read 10:10 (305/60 degrees from
12). No raster material or AI underdrawing is used. All bezel contours and
material marks share their dial's local origin. `graphite-hatching.ts` draws
layered curved graphite strokes and oblique cross-hatching to model the rolled
bezel, with bowed pencil hatching on the face. No noise texture is added.

## Reproduction and review

```sh
pnpm tsx scripts/figures/circuits-power-chain.ts
pnpm tsx scripts/figures/telling-time.ts
pnpm tsx scripts/figures/review-i-b-round3.ts
```

Optional `--svg /absolute/path.svg` writes either geometry master for inspection.
The exporters preserve drawn strokes and encode under 120,000 B (90,000 B for
the 800 px cover). Geometry assertions cover stage order, three nonintersecting
cable sections on the tray, overburden, arrow dimensions, concentric rings,
ticks inside the face, 60 ticks / twelve numerals per clock, hand angles,
reading-width hand lengths and clear margins.

Offline previews: `/tmp/atlas-i-b-round3/previews`. They include 420 px paper and
cinema comparisons with the A-grade circuits-series-parallel plate; full native
2x images; exact 2x critical-region crops; and single-sheet side-by-side 2x
comparisons with the A plate. The A reference retains its actual no-invert CSS;
the two revised illustrations use normal inversion because their values describe
materials, not physical illumination. The simulation uses the application's
multiply / inverse-contrast-screen formula and paper/cinema backgrounds.
The size/hash/bounds report identifies the exact inspected rasters. No browser
or desktop is opened. Checklists are in scripts/figures/b-review-manifest.jsonl.

Power-chain EN/ZH chapter alt and captions describe its new two-row order and
end-on sections. Cover alt is supplied by the application from the topic title;
the cover has no displayed caption. Detailed EN/ZH cover alt/caption descriptions
are updated in the illustration checklist, without changing topic metadata.

No deletions in this round: unused-image cleanup was already accepted. No other
illustrations, topic prose, dependencies, queue documents or git metadata change.

Final delivered sizes: power chain 119,994 B; clock 800 px 73,346 B; clock
1600 px 119,750 B. Six checks accompany each raster, including exact SHA-256
hashes, in the public manifest. Logs are in `/tmp/atlas-i-b-round3`.

Gates passed: `pnpm check` (zero errors/warnings), `pnpm validate` (94 topics,
zero errors/warnings), `pnpm build` (191 pages), and all 275 test files / 6,523
tests. The final test command preserves the original 5-second timeout and limits
Vitest workers using its supported environment variables:

```sh
VITEST_MAX_FORKS=4 VITEST_MIN_FORKS=1 VITEST_MAX_THREADS=4 VITEST_MIN_THREADS=1 pnpm test
```

Uncapped default runs reproduce an unrelated toad-skin geometry timeout; no test,
assertion or repository configuration was changed. The final capped run passes
that same test in 2.4 seconds. Built raster hashes match the public rasters and
the inspected preview report.
