Round 4 is the final packaging pass after the accepted round-3 build.

- `node scripts/anatomy/round4/restore.mjs` reads immutable pre-rebuild main (994cdc76) and accepted round 3 (490d13bf). Missing local cache inputs are extracted using read-only `git show`. It writes only the six owned topic GLBs.
- `node scripts/anatomy/round4/fixtures.mjs` records the baseline decoded hero attributes/binds, not rebuilt output. The checked-in fixture is an independent regression reference.
- `pnpm exec tsx scripts/anatomy/round4/preview.ts final` writes main/render/diff/drawing comparisons only to `/private/tmp/atlas-muscles-round4-comparisons/final`. `look1` and `look2` are retained outside the repository.
- `node scripts/anatomy/round4/metrics.mjs` and `node scripts/anatomy/round4/write-report.mjs` update metrics and the six internal rebuild reports.
- `python3 scripts/anatomy/round4/run-gates.py` runs the mandatory gates against an exact-source snapshot with writable caches. The environment override is documented in `gates/environment.json`.

Every anatomy mesh carries main's buffers exactly (topology, normals, `_FIBRE`, UVs, binds), checked per node against `anatomy-digests.json` (`node scripts/anatomy/round4/anatomy-digests.mjs`). These six GLBs are an exception to the 1.5 MB model cap, like heart-and-lungs: the cap is main's own file size. The only surface simplification is in the rebuilt exercise body, with an explicit 0.3 mm error cap. PartNode's exercise normalScale=0 acceptance fix is unchanged. No browser is launched by this workflow.
