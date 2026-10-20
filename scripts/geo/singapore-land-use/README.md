# Singapore land-use draft build

Read SOURCES-GEO.md (including “Review changes”) and CODEX-REPORT.md → Second pass first. Software gates pass separately from geographic acceptance: K1 independent controls, coast p95 accuracy, tide matching and engineering-project matches remain incomplete. No shared pipeline or engine code is changed.

Inputs and working files are ignored under raw/, work/ and refs/. Published files and durable source/hash receipts are tracked. Python dependencies are rasterio, shapely 2, pyproj, scipy, scikit-image, matplotlib, requests and networkx. The Landsat entry point uses work/venv/bin/python; dated layers can use ATLAS_GEO_PYTHON and rail can use RAIL_PYTHON. Shared mapshaper tools use the repository's ignored scripts/geo/.tools installation.

Rebuild from the retained inputs in this worktree (control and dated areas read the packed coast eras, so they follow build-coasts):

```sh
pnpm tsx scripts/geo/singapore-land-use/layers-fetch.ts
pnpm tsx scripts/geo/singapore-land-use/landsat-coast.ts fetch
pnpm tsx scripts/geo/lib/lines.ts --topic singapore-land-use
pnpm tsx scripts/geo/singapore-land-use/rail.ts
pnpm tsx scripts/geo/singapore-land-use/landsat-coast.ts extract
scripts/geo/singapore-land-use/work/venv/bin/python -I scripts/geo/singapore-land-use/historic-islands.py
pnpm tsx scripts/geo/singapore-land-use/coast-eras.ts
NODE_OPTIONS=--max-old-space-size=8192 pnpm tsx scripts/geo/singapore-land-use/build-coasts.ts
NODE_OPTIONS=--max-old-space-size=8192 pnpm tsx scripts/geo/singapore-land-use/control.ts
pnpm tsx scripts/geo/singapore-land-use/dated-layers.ts
scripts/geo/singapore-land-use/work/venv/bin/python scripts/geo/singapore-land-use/layers-report.py
pnpm tsx scripts/geo/singapore-land-use/review.ts
scripts/geo/singapore-land-use/work/venv/bin/python scripts/geo/singapore-land-use/review.py
scripts/geo/singapore-land-use/work/venv/bin/python scripts/geo/singapore-land-use/fetch-receipts.py
scripts/geo/singapore-land-use/work/venv/bin/python scripts/geo/singapore-land-use/audit-report.py
pnpm tsx scripts/sources-md.ts singapore-land-use
pnpm validate
pnpm check
pnpm vitest run tests/geo-rings.test.ts
```

A fresh checkout needs the original BIS preview, four-taps OSM water export and the decoded initial land inputs described by fetch-receipts.json. These are not invented or silently replaced if unavailable. `inputs.ts` decodes upstream L4/L5 and an initial undated modern land file; do not regenerate its today input by merging all dated eras. Raw scene catalogs are fetched when missing, but locked scene IDs never fall back to a different date. A rate-limited transport download was recovered from the original main-worktree research datastore response; the copy receipt explicitly distinguishes it from a new download.

The final coast packing keeps each era separate while cleaning. Cleaning all overlapping eras as one layer can delete dated features; the adapter asserts seven surviving land features and checks all rings. The final 50 m display DP is a documented budget compromise, not satisfaction of the finer accuracy specification. Review images remain gitignored. No push or publication is performed.
