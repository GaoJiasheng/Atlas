# Singapore historical topic draft pipeline

Read `CODEX-REPORT.md` and `SOURCES-GEO.md` first. This is an unaccepted geographical research draft. Numerical and schema checks do not establish historical accuracy. No shared engine or pipeline file is modified by this topic.

All original inputs are in ignored `raw/`; intermediates are in ignored `work/`. Durable receipts, licences, control coordinates and residuals are retained in `SOURCES-GEO.md`. The raw download ledger is `raw/fetch-log.json`; `fetch-datasets.ts` verifies fixed Natural Earth SHA-256 values rather than silently accepting upstream changes. Wikimedia retry cooldowns must be respected.

The retained `lines.json` contains both planned town divisions and source shoreline recipes. The shared lines step reads that combined file; no generated wrapper or separate coast recipe file is needed. Source-pixel authoring helpers (`jackson.ts`, `town-early.ts`, `town-shore.py`, `town-shore.ts`, `coast-segment.py`) are for deliberate recipe edits, after inspection of the original maps. Do not rerun them over reviewed recipes as part of a routine rebuild.

Rebuild the measured draft from those retained recipes:

```sh
pnpm tsx scripts/geo/singapore-1819-1965/fetch-datasets.ts
pnpm tsx scripts/geo/singapore-1819-1965/fetch.ts
pnpm tsx scripts/geo/singapore-1819-1965/river-bank-inputs.ts
pnpm tsx scripts/geo/singapore-1819-1965/west-coast-inputs.ts
pnpm tsx scripts/geo/lib/lines.ts --topic singapore-1819-1965
pnpm tsx scripts/geo/singapore-1819-1965/coast-inputs.ts
pnpm tsx scripts/geo/singapore-1819-1965/borders.ts
pnpm tsx scripts/geo/lib/local-land.ts --topic singapore-1819-1965
pnpm tsx scripts/geo/singapore-1819-1965/keyframes.ts K2 K19
pnpm tsx scripts/geo/singapore-1819-1965/check.ts K2 K19
```

Inspect the first pair before proceeding. Source comparison plates are evidence for review, not historical accuracy acceptance.

```sh
pnpm tsx scripts/geo/singapore-1819-1965/keyframes.ts --all
pnpm tsx scripts/geo/lib/simplify.ts --topic singapore-1819-1965
pnpm tsx scripts/geo/singapore-1819-1965/finalise-control.ts
pnpm tsx scripts/geo/lib/colour-holders.ts --topic singapore-1819-1965 --write
pnpm tsx scripts/geo/singapore-1819-1965/check.ts
pnpm tsx scripts/geo/singapore-1819-1965/check-coasts.ts
pnpm tsx scripts/geo/singapore-1819-1965/check-contact.ts
pnpm tsx scripts/geo/singapore-1819-1965/audit.ts
pnpm tsx scripts/geo/singapore-1819-1965/provenance.ts
pnpm tsx scripts/geo/singapore-1819-1965/geo-notes.ts
pnpm tsx scripts/sources-md.ts singapore-1819-1965
pnpm validate
pnpm check
pnpm vitest run tests/geo-rings.test.ts
```

The shared `local-land.ts` consumes `sources.json` → `pipeline.localLand.eras`, inland `water` exclusions and `coastToday`. It stores shared shoreline once and decodes published era features into `work/coast-L#.geojson` for composition. Capture its size, ring, area and coastline-deviation diagnostics in `work/local-land-shared.log`.

`keyframes.ts` is a small topic adapter around shared `compose.ts`: it decodes the existing Natural Earth 10m land asset into `work/land-10m.geojson`, used by manifest regional intersections inside the coast exclusion box, and copies each hold frame verbatim from its predecessor. The shared `simplify.ts` reads `pipeline.focus` (Singapore at 5 m and the wider region at its configured interval) and `pipeline.coast.excludeBox`. The old topic-local `coasts.ts`, `simplify.ts`, `coast-eras.json` and `coast-lines.json` have been retired.

`check.ts` makes standalone source comparisons with dated land substituted into the check basemap; `check-coasts.ts` makes coast/source plates only. Neither builds or shoots the application. Generated runner files in ignored `work/` are disposable.

Do not rerun `content-build.ts --publish` over final content: subsequent primary-source/date/coordinate additions would be lost. `content-close-evidence.ts`, its ledgers and `content-anchor-review.json` document the incremental updates. Historian review remains required. Chapter figures were supplied by the main session.

Second-pass evidence is retained in [SECOND-PASS-COAST.md](SECOND-PASS-COAST.md), [SECOND-PASS-BORDERS.md](SECOND-PASS-BORDERS.md) and `anchor-second-pass.json`. `anchor-apply.py --write` is a one-time migration guarded against repeat application; its before-state is retained in ignored work. The 92 new references remain approximate, with district/city reference semantics stated in each event source note.

`audit.ts` keeps an independent 5 m post-simplification fringe gate. Its current failure is reported in the Second pass handoff; the required validate/type/ring gates are separate. No geometry repair is hidden in the metadata-only `finalise-control.ts`.
