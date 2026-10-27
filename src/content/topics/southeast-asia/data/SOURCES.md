# 东南亚 · 数据来源与派生记录 / Southeast Asia data provenance

2026-10-27；WGS84 / EPSG:4326。正文、插图、事实参考与数据许可分开。地图数据全部 PD-derived；不混合任何 share-alike 数据库。UNESCO/FAO 等仅提供事实与机制参考，没有下载或改编它们的图文素材。

## 固定国形与图层

`geography.json` 由 `scripts/geo/southeast-asia/build.py <research-directory>` 从已取得的文件确定性生成。原始目录 `/Users/gavin/work/atlas/art/research/southeast-asia/data/` 只读；具体 SHA-256、输出字节数、NE_ID 和输入名见主题根目录 `provenance.json`。取得的源字节被 hash 固定，主干 URL 可变，不能称为最新调查。

| Runtime component | Source / source ID | Licence | Method |
|---|---|---|---|
| 11 country shapes, P and A0–A6 | [NE admin-0](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson), S101 | Public domain | Select ADM0_A3=BRN,KHM,IDN,LAO,MYS,MMR,PHL,SGP,THA,TLS,VNM; preserve geometry exactly; discard unrelated attributes; preserve original NE_ID in provenance |
| 5 lines / 4 river systems | [NE drainage](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson), S102 | Public domain | Exact acquired geometry; Lancang and Mekong share selection id river-mekong, no geometric join or gap filling |
| 4 mountain points | [NE elevation points](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_geography_regions_elevation_points.geojson), S109 | Public domain | Exact source positions for Hkakabo Razi, Gunung Kinabalu, Gunung Kerinci and Pulog; no heights/rankings |
| 4 sea-name labels | [NE marine areas](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_geography_marine_polys.geojson), S108 | Public domain | Prepared polygon-interior label points from acquired source marine polygons; only points ship, never maritime claim areas |
| Country anchors | Same admin-0 file, S101 | Public domain | Original LABEL_X/LABEL_Y; a point aids selection, does not enlarge country land |
| Singapore city anchor | [NE 110m populated places](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_populated_places.geojson), S110 | Public domain | Exact city coordinate; no weather station or park boundary implied |
| Base coast/land | Existing public/geo/land-50m.json and land-10m-sea.json, S17 | Public domain | Existing engine basemap, unchanged |

River label anchors use the middle source vertex of the selected system’s longest segment by vertex count; they label the line, not its spring or a station. No simplification, new polygon, generated river curve, DEM, vegetation zone or shipping track. No registration was performed; surveyed residual is inapplicable. The small Singapore geometry is preserved. Modern cartography is a teaching reference, not a legal boundary determination. Sea labels do not delimit territorial claims.

The output contains 11 fixed country features, 5 source river features, 4 peak points, 4 marine label points, 24 anchors (11 countries+4 peaks+4 seas+Singapore city+4 river systems), 11 accession records and 11 country-scale reading cases. Cases contain locationRef, never at; no park/factory/terrace sites are invented. Their location scope is country even when a chapter camera looks closer.

## 成员日期 / Membership

Only the predicate `joined <= selectedDate` changes shading; all geometry stays byte-identical across A0–A6. Dates use inclusive ISO calendar days, count countries once despite MultiPolygons. Sources: [ASEAN founding](https://asean.org/the-founding-of-asean/) S6; [ASEAN membership chronology](https://asean.org/about-asean) S4; [Timor-Leste admission](https://asean.org/forging-a-new-era-timor-leste-admitted-into-asean/) S5. Founding and earlier accessions were checked against official indexed text; direct requests to some ASEAN pages returned 403 and were not bypassed. S5 was reverified during build against the official announcement. Timor-Leste joined on 26 October 2025; as of 27 October 2026 there are eleven members.

| Date | Newly joined | Count |
|---|---|---:|
| 1967-08-07 | None (boundary test) | 0 |
| 1967-08-08 | Indonesia, Malaysia, Philippines, Singapore, Thailand | 5 |
| 1984-01-07 | Brunei Darussalam | 6 |
| 1995-07-28 | Viet Nam | 7 |
| 1997-07-23 | Lao PDR, Myanmar | 9 |
| 1999-04-30 | Cambodia | 10 |
| 2025-10-26 | Timor-Leste | 11 |

This is a chronology of membership on fixed present-day shapes, not a reconstruction of historical borders or summit attendance.

## 月气候 / Shared climate, every M01…M12

The existing E-MW1–3 is reused, not rebuilt. No data arrays copied or transformed. Files are identical shared assets from `sample-climate` (only the real regional files, never the artificial 2×2 fixtures):

| Resource | SHA-256 | Source |
|---|---|---|
| public/geo/sample-climate-wind-850-1991-2020.json | d1c893ce4474ced4ecaccfaa1bf7fa0f1007e764c1d36bd24f0cdcf3b4e38583 | NCEP/NCAR Reanalysis 1, NOAA PSL, S201/S203/S20 |
| public/geo/sample-climate-rain-gpcp-1991-2020.json | 1d4252d0b235397f2d347a75cb13bb20aaca6a1d02b20bc5cfc1ca8200fb15c0 | GPCP V2.3, NOAA PSL, S202/S204/S20 |

Both are PD-derived. NCEP Reanalysis and GPCP precipitation data provided by NOAA PSL, Boulder, Colorado, USA, from https://psl.noaa.gov/. Not an official NOAA product. Exact original ASCII requests, hashes and valid-year handling are preserved in [sample-climate provenance](../../sample-climate/data/SOURCES.md); no refetch or resampling was run. Wind is 12×399 nodes (21×19) at 850 hPa in m/s, centres [90,-15] spaced 2.5°. Rain is 12×360 cells (20×18), centres [91.25,-13.75], mm/day and footprint [90,-15,140,30]. South-to-north row-major; independent grids. Each monthly state reads frames[month−1]. Rain uses the native containing cell, wind the nearest covered node. Outside coverage remains unavailable, never zero. The magnitude of the mean wind vector is not the mean of wind speeds.

The additive `sourceMap` in monthlyLayers remaps existing resource metadata into this topic's sources (wind S22→S201/S25→S20/S101→S203, rain S32→S202/S25→S20/S102→S204), because S101/S102 already mean Natural Earth countries/rivers locally. It changes no resource bytes or data and preserves strict source validation. Fixed display bins and arrow-scale choices are design source S205.

At 105°E, 0°: January u=1.1373713, v=−4.9311786 m/s, vector magnitude 5.060645794674989 m/s, rain=3.784817 mm/day; July u=0.11203182, v=3.5973375, magnitude 3.599081579736525, rain=3.726351. Wind index132 and rain index126. These are monthly 1991–2020 means, not observations at a school or forecasts.

## 内容、插图和许可

The newly generated terrace plate replaces the weak roundtable subject; no seat count appears. It is a generic qualitative landform schematic, not surveyed Ifugao geometry or universal irrigation routing. Its four fields are a drawing choice. The mangrove figure shows one stilt-root form; not all mangroves have it. The cover is a generic raised-house example. Main sources were copied into worktree art before processing; prompts, checks, attempt count and final image QA are in `art/planned/southeast-asia/manifest.jsonl` and `image-qa.json`. All three were processed with scripts/illustrate.ts. Original commissioned figures/text remain under LICENSE-CONTENT; no third-party art imported. Public-domain geographical facts need attribution here, not a new share-alike exception.
