# Dinosaur Earth: reproducible source-to-map ledger

Built 2026-10-27 from the **2026-10-26 fixed snapshots**; coastlines retraced 2026-11-10 from the same snapshots. `build.py` reads local source data, never downloads, never installs packages, and never writes into the source directory. Public payload hashes and per-frame source hashes/CRC are in [build-report.json](build-report.json). The script uses only Python's standard library. `verify.ts` independently decodes the actual public TopoJSON with the existing `topojson-client`, then applies the project's existing `ringIssues` checker.

Reproduce from the repository root:

```sh
python3 scripts/geo/dinosaur-earth/build.py --inputs /Users/gavin/work/atlas/art/research/dinosaur-earth/data
pnpm tsx scripts/geo/dinosaur-earth/verify.ts
```

Optional inspection uses the already available Pillow interpreter, without installation:

```sh
/usr/local/bin/python3.11 scripts/geo/dinosaur-earth/qa-plots.py
```

`qa/` is ignored and contains source categorical samples beside actual output polygons. Initial K250/K0 plots were generated and inspected before expanding the same algorithm to the other eight. All ten pairs have been inspected using the local image viewer. The source interiors and output land patterns agree; the source point plot extends into polar rows deliberately omitted from published polygons. This visual check is not a claim of measured ancient shoreline accuracy.

## Reconstruction family — upstream CC BY 4.0; Atlas adaptation CC BY-NC-SA 4.0

Scotese, C. R. and Wright, N. (2018), **PALEOMAP PaleoDEMs v2**, Zenodo record 5460860: <https://zenodo.org/records/5460860>. Source ZIP: <https://zenodo.org/records/5460860/files/PaleoDEMS_long_lat_elev_csv_v2.zip?download=1>. Runtime source **S29**; spec aliases DE-S03/DE-S07 refer to the same source family. Licence: CC BY 4.0, <https://creativecommons.org/licenses/by/4.0/>. The downloaded official record metadata and `keyframes-csv.json` establish licence, member CRC, SHA256 and numeric ages. Only the ten verified CSV members are used; no netCDF arrays or modern coastlines are substituted.

Modification notice for every `de-land-*.json`: strict positive elevation classification (`z>0`); exact zero assigned to non-land, so the sea-level boundary is uncertain. The coast is traced by marching squares between each land sample and its non-land neighbour. Along each such grid edge the crossing is placed by linear interpolation of the two elevations, clamped to the middle half of the edge (25-75 %), so a steep drop to deep ocean cannot pin the coast onto a land sample and a one-sample island keeps a visible size. Saddle cells are resolved by the bilinear centre of the four source elevations. Two Chaikin corner-cutting passes round the grid-scale corners; Douglas-Peucker at **0.05°** (under one CSS pixel at the map's maximum zoom 3.6) removes redundant vertices; vertices are stored on a 0.02° lattice as delta-encoded TopoJSON. Islands and holes are retained. TopoJSON shares genuine coastline arcs between fill and line objects.

The source grid is 1°, and this method does not add detail: the smooth line is a drawing of where the coast can lie between samples, not a measurement. The build asserts that **every published sample stays on its source side** of the land/non-land line in all ten frames, so the coast moves only inside grid edges that already separate land from non-land; it asserts no contact or crossing between rings. Measured over all frames, smoothing and simplification leave every published vertex within **0.0816°** of the traced contour (50,278 traced vertices, 48,588 published). Compared with the previous nearest-sample cells, a coast can sit up to about 0.25° further along a grid edge in either direction, and diagonal contacts follow the source elevations instead of always staying separate. Features narrower than the 1° spacing remain unknown. The source provides no ancient shoreline truth set; positional model error is unknown. Heights are model elevation/bathymetry in metres, not measurements of present relief. Previous stepped version: git history before this change.

No seam welding, wraparound or cross-dateline interpolation occurs. Contours stop at the source sample-coordinate domain: old five frames stop at +179°, with an explicit unavailable polygon from +179° to +180°. Both source-edge signs remain independent in newer grids. All land is clipped at ±85.051129°. A crop/cut edge closes fill rings but is excluded from the coast line object. Genuine land/non-land internal boundaries become coast; the source frame and unavailable-mask boundary never do. `renderWorldCopies:false` is an engine requirement. No continuous drift or 66 Ma synthetic frame is produced.

Each frame follows exactly `CSV SHA/CRC → strict-positive classification → contour between land and non-land samples, closed along the source-domain/polar cut → smoothing with cut ends pinned → sample-side and ring checks → shared coast arcs → named TopoJSON`. Exact input/output hashes, rows, zero counts, seam counts, polygon/ring counts and zero-area/self-crossing checks are machine-readable in the report. Legacy member period labels never determine display ages.

| Age Ma | Input CSV | Output stem | Sample bounds W/S/E/N | Rings (land) | Bytes |
|---:|---|---|---|---:|---:|
| 250 | `keyframes-csv/Map49_250Ma.csv` | `de-land-250.json` | [-180.0, -89.0, 179.0, 90.0] | 77 | 21,452 |
| 230 | `keyframes-csv/Map46_230Ma.csv` | `de-land-230.json` | [-180.0, -89.0, 179.0, 90.0] | 94 | 20,897 |
| 200 | `keyframes-csv/Map43_200Ma.csv` | `de-land-200.json` | [-180.0, -89.0, 179.0, 90.0] | 189 | 36,837 |
| 170 | `keyframes-csv/Map37_170Ma.csv` | `de-land-170.json` | [-180.0, -89.0, 179.0, 90.0] | 245 | 49,830 |
| 150 | `keyframes-csv/Map33_150Ma.csv` | `de-land-150.json` | [-180.0, -89.0, 179.0, 90.0] | 246 | 54,637 |
| 130 | `keyframes-csv/Map29_130Ma.csv` | `de-land-130.json` | [-180.0, -90.0, 180.0, 90.0] | 230 | 50,115 |
| 100 | `keyframes-csv/Map23_100Ma.csv` | `de-land-100.json` | [-180.0, -90.0, 180.0, 90.0] | 180 | 46,136 |
| 70 | `keyframes-csv/Map17_070Ma.csv` | `de-land-70.json` | [-180.0, -90.0, 180.0, 90.0] | 267 | 63,793 |
| 65 | `keyframes-csv/Map16_065Ma.csv` | `de-land-65.json` | [-180.0, -90.0, 180.0, 90.0] | 238 | 56,996 |
| 0 | `keyframes-csv/Map01_000Ma.csv` | `de-land-0.json` | [-180.0, -90.0, 180.0, 90.0] | 235 | 58,279 |

Checks preserve K0 seam land-sign mismatch **6**, K100 **25**, and K70 source zero count **3023**. Their absence would indicate unrecorded source repair. Independent decoder checks report **2,006 rings** including five unavailable masks, **0 zero-area / 0 self-crossing**, and no coast segment along source or polar frame cuts. No map-shape source is authored by hand.

## Modern inset family — public domain

Natural Earth 110m land v4.1.0 (`ne_110m_land.zip`) and 50m countries v5.1.1 (`ne_50m_admin_0_countries.zip`). Exact source URLs and hashes are in the input INVENTORY. <https://www.naturalearthdata.com/about/terms-of-use/> declares public domain; runtime sources **S31/S64**. `de-modern-land.json` contains all 127 land features (128 rings). `de-modern-countries.json` contains the 15 real country features used in the SEA/Mexico inset views (264 rings): TH, LA, MY, SG, MX, VN, KH, MM, ID, BN, PH, TL, BZ, GT, CU. The world view uses full 110m land; no country is fabricated. Country IDs are ISO A2. The museum-origin card intentionally has no linked US country feature.

The script reads shapefile/DBF bytes directly, reverses shapefile winding to RFC 7946 and rounds coordinates to 6 decimal degrees (at most approximately 0.079 m diagonal rounding displacement at equator). No geometric simplification occurs. Independent ring checks: zero-area **0**, self-crossing **0**. These files are used only by the separately labelled modern inset. They are never merged into a PaleoDEM frame.

Singapore's [103.816925,1.366587] is the source DBF label anchor, not a museum address or excavation. Chicxulub [-89.5,21.333333] is the spec's approximate modern LPI location (runtime **S61**, original DE-S01); no crater outline is invented. Event age 66 Ma remains separate from the selected K70 map sample.

## PBDB publication family — CC0

`de-modern-points.json` is derived solely from the two fixed PBDB CSVs (runtime **S65/S66**, original DE-S05/DE-S06), using their explicit CC0 metadata. Exact full queries are in the topic data source ledger. Stable occurrence deduplication precedes protection exclusion and collection aggregation. Conflicting occurrence content or collection coordinates fails the build. Missing coordinates/invalid ages fail with an explicit error; no selected rows are missing coordinates.

Global 2000 + regional 167 → **2106 unique occurrences** (61 duplicates) → suppress **3 Malaysian collections / 3 occurrences** → **2103 occurrences / 1274 collections / 61 modern countries**. No raw Malaysian IDs, coordinates or reversible locality prose are written to public assets or this report. Only aggregate suppression counts are published. Publication point IDs are `pbdb-col-<collection_no>` and occurrence IDs remain unmodified strings. Every occurrence retains its own original older/younger age bounds and PBDB reference number; no interval envelope is substituted. The complete bibliography of **public retained records only** is preserved in [publication-references.json](publication-references.json) and deployed offline as `de-pbdb-references.json`: `{version:1,references:{reference_no:original_primary_reference}}`. Its815keys preserve original publication reference numbers and unmodified bibliography strings. `de-modern-inset.json` binds it through `referenceFile: de-pbdb-references`; every published occurrence reference resolves. The compact bilingual occurrence basis states published age bounds and the matching original PBDB reference number; no guessed external publication URL is added. Source query IDs in the point file remain S65/S66. PBDB precision codes remain original source values, never converted into invented metres or a false radius. The six coordinate-basis phrases are translated into Chinese: nearby landmark / 据附近地标; estimated from map / 据地图估计; stated in text / 原文载明; not specified / 未注明; political unit / 据行政区; unpublished field data / 未发表野外资料. The bilingual summary remains a modern-location label; the bounded-selected-record explanation remains in topic source/context text.

The four separately authored evidence cards are editorial facts, not PBDB localities. No card has `at`, `geometry`, `coordinates` or `centroid`. Pahang stays region-only. TH/LA/MY cards optionally link the correct country feature solely for weak modern country highlighting. These cards and the two modern reference points have no share-alike map-data inheritance; their editorial text follows the Atlas content licence.

## Budget and licence separation

All **18** published `de-*.json` payloads together are **1,929,023 bytes** (below even a strict decimal 2 MB budget). Ten ancient frame vectors: **458,972 bytes**; modern NE geometry: **350,774 bytes**; PBDB collection metadata: **918,555 bytes**; offline PBDB bibliography: **194,623 bytes**; manifests/editorial references/cards: remainder. Original snapshots and QA raster files are not deployed.

The families stay in separate files: PaleoDEM-derived frames Atlas CC BY-NC-SA 4.0 (upstream CC BY 4.0); NE geometry public domain; PBDB-derived points and offline bibliography CC0; editorial cards/manifests Atlas CC BY-NC-SA 4.0. No CC BY-SA, ODbL, ODC-BY or licence requiring an agreement is used. Corresponding family exceptions and attribution are recorded in LICENSE-CONTENT and THIRD-PARTY-NOTICES.md.
