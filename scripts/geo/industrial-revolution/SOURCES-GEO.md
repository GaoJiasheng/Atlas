# Industrial Revolution — geometry provenance

Built 2026-10-27 for a **draft** topic. Research inputs are read-only files in `/Users/gavin/work/atlas/art/research/industrial-revolution/data/`; `INVENTORY.md` there is the upstream prefetch record. This build uses no network request, historical boundary inference or traced route. `build-report.json` records input/output SHA-256, tool versions, exact counts, geometry checks and measured simplification changes.

## Source families

| Ref | Dataset and direct source | Licence | Selected use and limits |
|---|---|---|---|
| G1 | Natural Earth 50m land, [download](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson), [terms](https://www.naturalearthdata.com/about/terms-of-use/) | Public domain | Two main-island outer rings containing London/Dublin select whole RShapes features for exclusion. The existing bundled NE physical basemap supplies land/coast at runtime. Modern reference, not historical shorelines. |
| G2 | Natural Earth 10m populated places, [download](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson) | Public domain | 21 modern city reference points, selected by exact name **and** modern country; original NE_ID retained. No population or historical-site footprint claim. |
| G3 | GeoNames [cities15000](https://download.geonames.org/export/dump/cities15000.zip), [about](https://www.geonames.org/about.html) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Six retained original TSV rows: Pawtucket, Dudley, Mechelen, Darlington, Stockton-on-Tees, Saint-Étienne. Current gazetteer locations, not original stations or factory buildings. © GeoNames, https://www.geonames.org/. |
| G4 | Müller-Crepon, Girardin / ETH Zürich, [RShapes 1.0](https://icr.ethz.ch/data/rshapes/), [GeoJSON](https://icr.ethz.ch/data/rshapes/RShapes.geojson) | [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) | Every selected original lid, merged only into same-year connected runs; dated cumulative construction records. The actual raw years are 1834–1921, although publisher coverage ends 1922. Does not establish traction, continued operation, kilometres or global coverage. |
| G5 | British Geological Survey, [Coal resources for new technologies](https://www.bgs.ac.uk/datasets/coal-resources-for-new-technologies/), [download ZIP](https://www.bgs.ac.uk/?wpdmdl=41597), [BGS attribution](https://www.bgs.ac.uk/bgs-intellectual-property-rights/open-government-licence/) | [Open Government Licence 3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) | GB `Coal-bearing strata` only; 622 native MultiPolygon features. Modern geological reference based on 2004 maps. Northern Ireland EPSG:29900 and mine-workings/exploitation tables are excluded. |

RShapes requested reference: Cederman, Lars-Erik, Luc Girardin, Carl Müller-Crepon, and Yannick Pengl (2025), *Nationalism and the Transformation of the State: Border Change and Political Violence in the Modern World*, Cambridge University Press.

BGS required attribution: **Contains British Geological Survey materials © UKRI 2026**. The source product also carries: **Contains OS data © Crown copyright 2020**. These source-context notices are retained here; no OS base-map image or additional workings layer is copied into production.

## Rebuild and exact inputs

Run `pnpm tsx scripts/geo/industrial-revolution/build.ts`, then `pnpm tsx scripts/geo/industrial-revolution/compare.ts`. `--out /private/tmp/ir-geo` stages the six data outputs elsewhere. The pipeline reads the already installed mapshaper 0.6.121 and mproj 0.0.40 from the main checkout's `scripts/geo/.tools`; another existing tool directory can be passed through `ATLAS_GEO_TOOLS`. It installs nothing and never edits upstream inputs. `ATLAS_IR_RESEARCH` can identify a copy of the exact prefetched input directory; hashes must still match.

The fixed fingerprints are in `build-report.json`. In particular the raw RShapes file is `c1e52458c7b325153ce079d0d4f3a129fd3549ed21cb8cfce67bb8bf031fde68`, source subset is `92e50dcb6fb7cd7bae8370928eaf57174b5beeb8380da022f191e575f8f051ac`, GB GeoPackage is `a4e08896ffd4f25f907494a62d3158ce6a9c9eea974e61df3f806d9d34d80a86`, and 27-point subset is `392d6cecadb432dfdf6ac07d624c834e4c03dcb793f3e1a7a5cbd5c5d2dcd285`.

Runtime dated layers belong in `public/geo/industrial-rail-rshapes.json` and `public/geo/industrial-coal-strata.json`, as the actual TimeScene loader requires. They are not duplicated into strict topic `data/`. `industrial-places.geojson` remains here as a source/build artifact because a non-JSON file in topic `data/` produces a validator warning. Runtime site coordinates live in topic `events.json`.

## Railway transformation

Validate every raw coordinate as finite WGS84. Select the two Natural Earth main-island exterior rings containing London and Dublin. Remove any **whole** RShapes feature with a vertex inside either ring: 1,061 removed from 20,661 before filtering year ≤1914. The 18,804 selected original lids exactly match the prefetched subset; no shoreline clipping or replacement line is drawn. Offshore islands are not a surveyed exclusion, so the description is available continental coverage. `spliced` is not carried into production (its meaning is not documented; it stays in the source file).

DP intervals 750/1,000/1,250/1,500 m are tried in order until the output is ≤ 1.5 MB; 750 m already fits. Quantisation is 100,000 (a grid of about 50 m × 40 m at 50° N, far below the 750 m simplification and a pixel at the topic's closest railway view, zoom 4.4). The small closed source loop lid 17463 collapses under ordinary DP; its actual original coordinates are quantised and restored into the same topology. No geometry is drawn or inferred.

Then, as docs/51 §3.3-7 allows, lines that share a construction year **and** a source endpoint are merged into one connected run (union-find on exact source endpoint coordinates; arcs are only regrouped, never moved). Output features are `LineString` / `MultiLineString` with `f` (the year) and `n` (how many source lids the run holds); the source/licence fields are recorded once here and in `THIRD-PARTY-NOTICES.md` rather than on 18,804 features. All 18,804 lids survive in 8,906 runs; the build asserts the lid sum at every year below.

| T | 1760 | 1830 | 1834 | 1840 | 1850 | 1869 | 1871 | 1890 | 1914 |
|---|---|---|---|---|---|---|---|---|---|
| Selected original lids with year≤T | 0 | 0 | 35 | 428 | 1,925 | 7,355 | 8,339 | 15,577 | 18,804 |
| Production runs with f≤T (runtime `visible`) | 0 | 0 | 11 | 182 | 830 | 3,230 | 3,691 | 7,273 | 8,906 |

These are data regressions, never kilometres, traffic, wealth, steam trains or total operational network counts. Missing England/Wales, US or Asian lines are gaps in this selected source, not historical zero.

## Coal transformation and topology checks

`read-bgs.py` opens the GB GeoPackage read-only through SQLite (integrity check passes), verifies EPSG:27700 and decodes only `Coal-bearing strata` GeoPackage/WKB records. mproj uses its formal `+init=epsg:27700` registry definition (British National Grid; Airy; OSGB36) and `+proj=longlat +datum=WGS84`. The datum operation is the OSGB36 seven-parameter Helmert transformation. mproj does **not** support OSTN15 grid shifts; no grid-based or survey-level positional accuracy is claimed. The maximum numerical forward/inverse round-trip discrepancy is 0.001057 m; this measures numerical consistency, not real-world positional accuracy.

After transformation every coordinate is finite and inside −9…3° longitude /49…61° latitude. DP 500 m and quantization 1,000,000 are used. Each source ring is protected as a small shape before restoring its original exterior/hole membership; ordinary feature-only `keep-shapes` would drop 206 holes. All **622 features, 624 polygon components and 1,017 rings** (including 393 holes) survive. `clean allow-overlaps rewind` avoids deleting overlapping source features. Four polygons had simplified holes crossing/outside their exteriors (`coal-gb-273/529/583/599`, polygon 0); their full transformed source coordinates were restored instead. Final checks find **0 zero-area rings, 0 self-crossing rings, 0 crossing ring pairs within a polygon, 0 holes outside exteriors, 0 winding mismatches, and all rings closed**. Source overlaps between distinct features remain source overlaps; no artificial disjoint partition is claimed.

`f:1760` is only the topic's display start. `surveyYear:2004` and `reference:modern-geology` are retained. Neither field supplies an opening year, a mine footprint or a coal-production quantity.

## Measured changes and budgets

Every source vertex is compared to the nearest output line/boundary belonging to the same source id, using local equirectangular metre distances. This one-way diagnostic is not a georeferencing residual, a strict Hausdorff bound or source accuracy. Rail (333,186 vertices, measured before the run merge, which moves nothing): p50 135 m, p95 494 m, p99 640 m, max 839 m. Coal (169,654 vertices): p50 65 m, p95 309 m, p99 414 m, max 1,926 m. Mapshaper repair and shape preservation mean the interval parameter is not a promise that every point moves less than the nominal interval. Georeferencing is **not applicable**: source coordinates were transformed, never fit to a raster.

| Production geometry | Raw bytes | gzip bytes | Target result |
|---|---:|---:|---|
| Rail | 1,304,627 | 300,369 | Within 1.5 MB raw target |
| Coal | 266,680 | 75,990 | Within 350 KB raw target |
| Total two layers | 1,571,307 | 376,359 | Within 2 MB raw geometry target |

The first build (one feature per lid, seven properties each, DP 1,500 m, quantisation 1,000,000) was 3,942,408 bytes, of which 2,049,993 were properties. Dropping the repeated properties and merging same-year connected lines brought it within budget at a finer 750 m interval; no historical feature, lid or date was removed. `build-report.json` records each attempted interval.

## Keyframes, points and absent routes

| Keyframe | Date | Geometry | Source/method | Residual |
|---|---|---|---|---|
| K1 | 1760 | Empty FeatureCollection | Deliberate non-territorial topic | Not applicable |
| K2 | 1914 | Empty FeatureCollection | Same | Not applicable |

`entities.json` and `movements.json` are empty. No industrialisation progress, nation ownership, mine/plantation footprint, historical harbour outline, steamship route, Suez centreline or telegraph cable is fabricated. British early-rail, Suez and cable views use cited modern city anchors with explicit endpoint captions. Source points do not establish historical dates or exact station positions.

The 27-place artifact preserves 21 Natural Earth and six GeoNames ids/licences. The prefetched point file is copied byte-for-byte. Names/current countries were used only for disambiguation; not as historical national boundaries. Dates come from independently cited event facts.

## Visual review and remaining runtime checks

`compare.ts` writes two local QA images to `qa/` (not in git): `bgs-native-wgs84-production.png` compares native CRS, full transformation and production at independently labelled extents; `rshapes-1834-1914-source-production.png` compares identical geographic extents at the first selected year and 1914. Both were opened: broad distribution and coverage match, early rail stays sparse and the 1914 network keeps the source pattern. They are offline geometry comparisons, not runtime screenshots; MapLibre labels and layout are checked by `pnpm shoot`.

## Licence isolation

Rail topology contains RShapes NC-SA plus public-domain selection only. No CC BY-SA geometry, attribute, tracing, topology or image is mixed into them. BGS files retain OGL attribution and source-context OS notice. Place coordinates retain PD/GeoNames CC BY rights; authored event prose stays Atlas CC BY-NC-SA. No OHM element ships: the mixed-provenance bounded response remains research quarantine. Optional NE rivers are not shipped as canals. `THIRD-PARTY-NOTICES.md` carries the attributions; `LICENSE-CONTENT` notes that no licence exception is needed (every distributed derivative is compatible with Atlas CC BY-NC-SA 4.0).
