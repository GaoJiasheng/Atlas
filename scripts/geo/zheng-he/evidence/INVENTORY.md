# Data inventory / 地图数据预取验收

Fetched 2026-10-27. Preparation only; no runtime files installed. All raw datasets below are under 300 MB; total below 1 GB.

| ID / file | Licence | Bytes | Features / rows | Extent [W,S,E,N] | Drives |
|---|---|---:|---:|---|---|
| D01 `ne-10m-land.geojson` | Public domain | 10,157,965 | 11 | [-180, -90, 180, 83.634101] | K0–K8 basemap |
| D02 `ne-10m-populated-places.geojson` | Public domain | 19,359,003 | 7,342 | [-179.589979, -90, 179.383304, 82.483323] | port/site anchors in all chapters |
| D03 `geonames-IR.zip` | CC BY 4.0 | 13,669,556 | 254,986 | [36.286, 25.0, 63.47302, 59.64] | chapter 04/07 Hormuz |
| D04 `geonames-TZ.zip` | CC BY 4.0 | 531,720 | 19,524 | [-4.26, -11.73333, 41.13333, 31.32694] | chapter 00/05 Kilwa context |

## Download URLs, hashes and coverage checks

### D01 · ne-10m-land.geojson

- URL: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson
- Licence evidence: https://www.naturalearthdata.com/about/terms-of-use/
- SHA256: `1ac90796408bc6ad6911d69448485d3c4dbf2190370080368a09976e1c9f7416`
- Coverage: Modern cartographic snapshot; downloaded 2026-10-27; no 1405–1433 time series
- Verified: JSON opened; geometry coordinates finite and in WGS84 bounds; extent and row count measured; upstream master mutable, pinned by SHA256

### D02 · ne-10m-populated-places.geojson

- URL: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson
- Licence evidence: https://www.naturalearthdata.com/about/terms-of-use/
- SHA256: `9b8e3de09048ef00dfc70357dbb9fa324493f214b5e0ae4daf1aa79a8d10116b`
- Coverage: Modern cartographic snapshot; downloaded 2026-10-27; no 1405–1433 time series
- Verified: JSON opened; geometry coordinates finite and in WGS84 bounds; extent and row count measured; upstream master mutable, pinned by SHA256

### D03 · geonames-IR.zip

- URL: https://download.geonames.org/export/dump/IR.zip
- Licence evidence: https://download.geonames.org/export/dump/readme.txt
- SHA256: `d4338847ec485215ecde11c0ab197fef7e6abb84be155f40fbdf65452caa64b2`
- Coverage: Modern records; record modification dates 1994-02-10 to 2026-10-26; no historical observation series
- Verified: ZIP CRC passed; UTF-8 TSV decoded; every row has 19 columns; exact geonameid 131231 selected; Hormoz, lon/lat [56.4529, 27.095]

### D04 · geonames-TZ.zip

- URL: https://download.geonames.org/export/dump/TZ.zip
- Licence evidence: https://download.geonames.org/export/dump/readme.txt
- SHA256: `fb3cc5ede2af2bee7db31c750d236ed1a3367f610770f276c49c022b3cb69170`
- Coverage: Modern records; record modification dates 1994-01-05 to 2026-10-23; no historical observation series
- Verified: ZIP CRC passed; UTF-8 TSV decoded; every row has 19 columns; exact geonameid 157382 selected; Kilwa Kisiwani, lon/lat [39.49808, -8.95897]

## Derived selection / 派生点文件

`ports.geojson`: 17 Point features. Extent [39.49808, -8.95897, 119.2981, 32.051965]. Exact upstream coordinates copied; no hand-placed polygons or waypoints. `ports-provenance.json` preserves role and licence.

Raw and selected coordinates use WGS84 longitude, latitude. Modern city centres locate a region only: Fuzhou ≠ exact Changle departure quay; Singapore ≠ verified landing; Surabaya ≠ known Java battle site; Galle ≠ Sri Lankan ruler’s palace; Dhaka ≠ a documented giraffe boarding point. Hormuz uses GeoNames 131231 on the island, never Bandar Abbas as a substitute. Kilwa 157382 is context, not a documented visit. No population or present-day political border used as fifteenth-century data.

Runtime plan: simplify/crop D01 to [35,-15,125,37], preserve real island rings, convert to named TopoJSON object; final ≤2 MB map geometry target. This raw prefetch is not already a runtime-ready plate. At Singapore zoom, cap zoom to avoid implying quay-level coastline accuracy. K0–K8 are empty control snapshots: no inferred Ming territorial fills.

## Missing route geometry and fallback

D05 original SVG returned HTTP 403. Licence page was read; direct file unavailable; no verification, terms acceptance or login attempted. No downloaded SVG exists here. Default spec uses sourced port/site points and camera changes, with `movements: []`. Do not join ports with invented lines. A later route branch is conditional on obtaining the original, separating the published line classes and georeferencing with recorded residuals.

No medieval coast reconstruction, ship-position timeseries, historical wind grid or fleet hull mesh is needed. D06/D08 images are not cleared and were not downloaded. The fallback completes the preparation design; the optional sailing-line presentation remains unavailable.

## Licence partition

- `ne-10m-*`: public domain source files retained unchanged.
- `geonames-*.zip`: CC BY 4.0 unchanged databases; credit GeoNames and record selection.
- `ports.geojson`: Atlas selection and bilingual metadata CC BY-NC-SA 4.0; underlying NE PD + GeoNames CC BY 4.0. No BY-SA source geometry/prose.
- Future route file: select the offered CC BY 1.0 branch and attribute Vmenkov + Historicair, mark georeferencing/simplification changes. If instead a BY-SA-only map is used, isolate its derived geometry in a BY-SA file and add LICENSE-CONTENT carve-out; never merge with NC-SA.
- ODbL / ODC-BY are allowed by the user but not used here; if introduced later, preserve required database notices in independent files.

Total downloaded source bytes: 43,718,244. Derived files are small additional outputs, excluded from the download count. `download-records.json` is the machine-readable evidence.
