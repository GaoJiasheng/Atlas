# Dated layers engine fixture

This draft fixture contains placeholder data, not a Singapore land-use lesson. No geometry or date here may be reused as a historical source.

- **G1:** The existing `public/geo/land-sg.json` is reused unchanged. Real coastline: URA Master Plan 2019 Planning Area Boundary (No Sea), with waterbody holes from the Master Plan 2019 Land Use layer. SODL v1.0. The provenance, attribution and original pipeline are recorded in `four-taps/data/SOURCES.md` G1–G2 and `scripts/geo/four-taps/SOURCES-GEO.md`.
- **G2:** `generate.mjs`, a deterministic fixture generator (seed 34041959). All points, routes, areas, control patches, dates, floor heights and counts are invented. The Gaussian neighbourhood clusters follow recognisable urban locations, but no point identifies an actual building. All 11,000 points are tested against G1's largest polygon and its water holes; every point lies on Singapore mainland. Routes and areas are small illustrative synthetic shapes within Singapore, permitted only for this sample.
- **S1:** Synthetic test values, as explained in `sources.json`. **S2:** Real basemap attribution.

Rebuild from the repository root: `node src/content/topics/sample-dated-layers/generate.mjs`.

`sample-dated-blocks.json`, `sample-dated-rail.json` and `sample-dated-gardens.json` are TopoJSON; each has one object named exactly like its filename stem. Point features have numeric `f`, optional `u`, and numeric `h` (floor height metadata). All intervals use `[f, u)`.

| Time | Active points | Recent points at the exact year | Meaning |
|---|---:|---:|---|
| 1959 | 500 | 500 | Initial cohort |
| 1965 | 2,000 | 1,500 | Second cohort |
| 1966 | 2,000 | 0 | Empty control frame, independent dated layers |
| 1970 | 5,000 | 3,000 | Third cohort |
| 1979 | 5,000 | 0 | Before replacement |
| 1980 | 5,000 | 1,000 | 1,000 retire and 1,000 appear: identity changes, count does not |
| 2019 | 10,000 | 5,000 | 10,000 simultaneously visible points |
| 2020 | 10,000 | 0 | Recent highlight expires |

Control K1 (1959) and K3 (2019) use G2 synthetic patches; K2 (1966) deliberately contains no features. The shared engine crossfade is unchanged. The route changes geometry at 1980; the first approximate area expires at 1980 and is replaced, with a second certain area added in 2019. Milestones have no sides.
