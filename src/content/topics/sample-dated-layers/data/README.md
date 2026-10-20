# Synthetic dated-layer fixture

`sample-dated-layers` is a draft engine test, not lesson content. All coloured features, dates and counts are synthetic. Only the Singapore coastline is real. Provenance and baseline counts are in [SOURCES.md](SOURCES.md).

Reproduce every generated geometry from the repository root:

```sh
node src/content/topics/sample-dated-layers/generate.mjs
```

The fixed seed produces 11,000 points in recognisable urban neighbourhood clusters, clipped against the largest actual mainland polygon of `public/geo/land-sg.json` and all its water holes. There are 10,000 simultaneously active points in 2019. The generator also writes the small synthetic route, green areas and control patches. It changes only fixture files.

Each layer file in `public/geo/` is TopoJSON with one object whose name equals the file stem. Properties use numeric decimal years: `f` is the inclusive start; optional `u` is the exclusive end. `certainty: approximate` gives an area a lighter fill and dashed edge. Point `h` is numeric height metadata. Layer definitions in `topic.yaml` choose point, line or area geometry, a holder's token colour or an explicit colour token, a bilingual label and an optional PLATE count.

The fixture exercises independent dates, retirement, replacement with an unchanged count, one-year new-point outlines, per-layer toggles and legend rows, PLATE counts, chapter and beat layer targets, milestone events without sides, and an empty control keyframe between two nonempty ones. The empty frame and REFERENCE comparison must remain valid in both themes.

Verify the clipping and replacement counts with `pnpm test tests/time-scene/dated-fixture.test.ts`; browser coverage is `tests-e2e/dated-layers.spec.ts`.
