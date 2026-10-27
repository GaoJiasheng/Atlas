# Sample climate fixture provenance

Draft engine fixture only; no final educational narrative. All source-cache inputs were read on 2026-10-27 from `/Users/gavin/work/atlas/art/research/monsoon-and-weather/data/`; no fetch or conversion was rerun in that directory. The user-selected fixture slug is `sample-climate` (spec uses `sample-climatology`).

## Copied monthly resources

Only the `sources` metadata array changed. Numeric bytes, coordinate order, period, validYears, units and notes remain untouched. Output hashes therefore differ from inputs. Wind sources are S22/S25/S101; rain sources are S32/S25/S102 (the research cache's S46 is deliberately removed per docs/50).

| Input cache filename | Input bytes | Input SHA-256 | Output | Output bytes | Output SHA-256 |
|---|---:|---|---|---:|---|
| `wind-850-1991-2020.json` | 115443 | `43a354726dea139bd25fabce94997f685373c3c7bff3faae4be49da9699dbeef` | `public/geo/sample-climate-wind-850-1991-2020.json` | 115443 | `d1c893ce4474ced4ecaccfaa1bf7fa0f1007e764c1d36bd24f0cdcf3b4e38583` |
| `rain-gpcp-1991-2020.json` | 55628 | `7bf4cb2999d5ce3acf096b9b2655f9182ffdc56095c1320e2d2e0e75cd3ca0fa` | `public/geo/sample-climate-rain-gpcp-1991-2020.json` | 55628 | `1d4252d0b235397f2d347a75cb13bb20aaca6a1d02b20bc5cfc1ca8200fb15c0` |

Each file is **PD-derived**, from NOAA PSL NCEP/NCAR Reanalysis 1 pressure-level wind and GPCP V2.3 precipitation. This licence applies to the data, not NOAA production software. Atlas acknowledgement: NCEP Reanalysis and GPCP precipitation data provided by NOAA PSL, Boulder, Colorado, USA, from https://psl.noaa.gov/. Not an official NOAA product or forecast.

Wind: 12×399 nodes, 21×19, 850 hPa, m/s, [90,-15] at 2.5° south-to-north row-major. Rain: 12×360 cells, 20×18, mm/day, [91.25,-13.75] at 2.5°, with footprint [90,-15,140,30]. No spatial resampling; these grids are offset by half a cell and sampled independently.

## Exact raw inputs

- `wind-u-subset.ascii`: 80453 bytes; SHA-256 `dee581745952a24fddbe97bdfb496d15693f8e5d5e687e4a969e8e95822c6e38`.
- `wind-v-subset.ascii`: 81383 bytes; SHA-256 `c67a52d4c2f6366f8e998af899fd62fe83ea4613d1e200f8b70b7c2c10f6718c`.
- `rain-subset.ascii`: 68457 bytes; SHA-256 `be7b59d1f2776296b1fd0bea05d9cdd32f6fce27e23601e24c4d1b8f46aecd9c`.
- `ne-110m-populated-places.geojson`: 654324 bytes; SHA-256 `a86028b083182b68c7620fc6e1a8a47ee547cb9cd2fb62ccbb78bea786440899`.
- `places-selected.json`: 1441 bytes; SHA-256 `dfbaefeac63688682f6c38bccd30be5e47de2af316b729d1a8ee4aaccadcb80c`.

### 逐文件URL / 派生链

- `wind-u-subset.ascii`：https://psl.noaa.gov/thredds/dodsC/Datasets/ncep.reanalysis.derived/pressure/uwnd.mon.ltm.1991-2020.nc.ascii?uwnd%5B0:1:11%5D%5B2:1:2%5D%5B24:1:42%5D%5B36:1:56%5D,valid_yr_count%5B0:1:11%5D%5B2:1:2%5D%5B24:1:42%5D%5B36:1:56%5D,climatology_bounds
  许可：Public domain; NOAA PSL policy S25。
- `wind-v-subset.ascii`：https://psl.noaa.gov/thredds/dodsC/Datasets/ncep.reanalysis.derived/pressure/vwnd.mon.ltm.1991-2020.nc.ascii?vwnd%5B0:1:11%5D%5B2:1:2%5D%5B24:1:42%5D%5B36:1:56%5D,valid_yr_count%5B0:1:11%5D%5B2:1:2%5D%5B24:1:42%5D%5B36:1:56%5D,climatology_bounds
  许可：Public domain; NOAA PSL policy S25。
- `rain-subset.ascii`：https://psl.noaa.gov/thredds/dodsC/Datasets/gpcp/precip.mon.ltm.1991-2020.nc.ascii?precip%5B0:1:11%5D%5B30:1:47%5D%5B36:1:55%5D,valid_yr_count%5B0:1:11%5D%5B30:1:47%5D%5B36:1:55%5D,climatology_bounds
  许可：Public domain distribution under NOAA PSL S25; NOAA PSL distribution S25; GPCP product metadata S102。
- `ne-110m-populated-places.geojson`：https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_populated_places.geojson
  许可：Public domain; Natural Earth Terms of Use F43。
- `wind-850-1991-2020.json`：derived locally; source URLs in parent rows
  许可：PD-derived; no share-alike family。 派生自 wind-u-subset.ascii, wind-v-subset.ascii。
- `rain-gpcp-1991-2020.json`：derived locally; source URLs in parent rows
  许可：PD-derived; no share-alike family。 派生自 rain-subset.ascii。
- `places-selected.json`：derived locally; source URLs in parent rows
  许可：PD-derived; no share-alike family。 派生自 ne-110m-populated-places.geojson。
- `reused-land-50m.json`：local:public/geo/land-50m.json; upstream https://www.naturalearthdata.com/about/terms-of-use/
  许可：Public domain; Natural Earth。
- `reused-land-10m-sea.json`：local:public/geo/land-10m-sea.json; upstream https://www.naturalearthdata.com/about/terms-of-use/
  许可：Public domain; Natural Earth。



## Sites and geometry

`events.json` copies all six Natural Earth original representative coordinates and NE_ID values from `places-selected.json`, with source remapped SX03→S103 and bilingual fixture descriptions added. This file is PD-derived; city points are neither stations nor fire locations. Existing Natural Earth basemap files `public/geo/land-50m.json` and `land-10m-sea.json` are reused, not copied. No invented geographical boundaries, event routes or control areas are introduced.

## Artificial resources

`public/geo/sample-climate-fixture-wind.json` and `sample-climate-fixture-rain.json` are deliberately artificial, offset 2×2 test arrays, attributed to S199. They include zero, null, 29/30 years, calm flow and six compass directions over the 12 months. They are not observations and do not represent real land, coast or weather boundaries. They are Atlas-authored test values (the schema field `licenceFamily: PD-derived` only records that no share-alike input is mixed in) and fall under LICENSE-CONTENT like the rest of the fixture. The NOAA arrays need attribution only; it is given here and in THIRD-PARTY-NOTICES.md.

## M01–M12 derivation record

For every month M01…M12, runtime frames map to array frames[month−1] and retain the source-file hashes listed above, period 1991–2020, original 2.5° spacing and south-to-north row-major order. Method: native grid, no spatial resampling. Licence: PD-derived. This is not georeferencing; no registration residual or measurement precision is claimed. Rain polygons use native cell-centre ± half-step edges and represent grid cells. Wind arrows are projected display glyphs from the native vector components.

## Other fixture output fingerprints

- `src/content/topics/sample-climate/data/events.json`: 4359 bytes; SHA-256 `a6ea7dece69446f095303a89a469baaf63f84f67048b3100059c4511ca035b35`.
- `public/geo/sample-climate-fixture-wind.json`: 1441 bytes; SHA-256 `e0746561dc7c788d2fd0162c533e1be4b07ec095fcc718b05087daf4ac59d066`.
- `public/geo/sample-climate-fixture-rain.json`: 1252 bytes; SHA-256 `1403a1b800f984917299fa2a71eb9667c9b68b09c6b7fbe19b423cca219ffc0e`.
