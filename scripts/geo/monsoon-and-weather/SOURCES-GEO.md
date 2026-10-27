# monsoon-and-weather · geo provenance

The topic's layers are two monthly climatologies on their native grids and six city points; there are no control areas, routes or traced maps. The reader-facing record is `src/content/topics/monsoon-and-weather/data/SOURCES.md`.

## Rebuild

```bash
pnpm tsx scripts/geo/monsoon-and-weather/derive.ts --in <raw dir>          # writes the two public/geo files
pnpm tsx scripts/geo/monsoon-and-weather/derive.ts --in <raw dir> --check  # re-derives and compares, writes nothing
pnpm tsx scripts/geo/monsoon-and-weather/build-chapters.ts                 # chapter frontmatter from chapters.ts
```

`<raw dir>` is the research cache `art/research/monsoon-and-weather/data/` (gitignored; on 27 October 2026 it was read from the main checkout). `derive.ts` refuses any raw file whose size or SHA-256 differs from the values below, and never touches the network.

## Raw inputs (not in git)

| File | Bytes | SHA-256 | Request |
|---|---:|---|---|
| `wind-u-subset.ascii` | 80,453 | `dee581745952a24fddbe97bdfb496d15693f8e5d5e687e4a969e8e95822c6e38` | https://psl.noaa.gov/thredds/dodsC/Datasets/ncep.reanalysis.derived/pressure/uwnd.mon.ltm.1991-2020.nc.ascii?uwnd%5B0:1:11%5D%5B2:1:2%5D%5B24:1:42%5D%5B36:1:56%5D,valid_yr_count%5B0:1:11%5D%5B2:1:2%5D%5B24:1:42%5D%5B36:1:56%5D,climatology_bounds |
| `wind-v-subset.ascii` | 81,383 | `c67a52d4c2f6366f8e998af899fd62fe83ea4613d1e200f8b70b7c2c10f6718c` | https://psl.noaa.gov/thredds/dodsC/Datasets/ncep.reanalysis.derived/pressure/vwnd.mon.ltm.1991-2020.nc.ascii?vwnd%5B0:1:11%5D%5B2:1:2%5D%5B24:1:42%5D%5B36:1:56%5D,valid_yr_count%5B0:1:11%5D%5B2:1:2%5D%5B24:1:42%5D%5B36:1:56%5D,climatology_bounds |
| `rain-subset.ascii` | 68,457 | `be7b59d1f2776296b1fd0bea05d9cdd32f6fce27e23601e24c4d1b8f46aecd9c` | https://psl.noaa.gov/thredds/dodsC/Datasets/gpcp/precip.mon.ltm.1991-2020.nc.ascii?precip%5B0:1:11%5D%5B30:1:47%5D%5B36:1:55%5D,valid_yr_count%5B0:1:11%5D%5B30:1:47%5D%5B36:1:55%5D,climatology_bounds |
| `ne-110m-populated-places.geojson` | 654,324 | `a86028b083182b68c7620fc6e1a8a47ee547cb9cd2fb62ccbb78bea786440899` | https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_populated_places.geojson |

The array selectors in the URLs are index ranges (time 0–11, level 850 hPa, lat, lon), not years. Metadata: `uwnd.mon.ltm.1991-2020.nc.das` and `precip.mon.ltm.1991-2020.nc.das` (S101, S102): climo_period 1991/01/01–2020/12/31, units m/s and mm/day, GPCP V2.3.

## Method

1. Parse each OPeNDAP ASCII block (`name[dims]` then value rows); every block's length must equal the product of its dimensions; every value must be finite.
2. Check the climatology bounds run from January 1991 to December 2020 (hours since 1800-01-01 for R1, days since 1800-01-01 for GPCP), the level is 850 hPa, and u and v share one grid and identical valid-year counts.
3. Read the lat/lon map arrays; R1 latitudes run north to south and are reversed, GPCP latitudes already run south to north. Write each month as a south-to-north, row-major array. No resampling, interpolation, unit change or accumulation.
4. Check each site in `data/events.json` against its NE_ID in the pinned populated-places file (NAME and both coordinates equal).

Not a georeference: no control points, no registration residual. The rain cell geometry (centre ± 1.25°) and the wind arrows are built at runtime by the engine from these numbers.

## Outputs

| File | Bytes | SHA-256 | Licence family |
|---|---:|---|---|
| `public/geo/monsoon-and-weather-wind-850-1991-2020.json` | 115,499 | `211fe99f421a233d74d7daf64c3bde2bff71d0d3e711462f8d18f71fdbcd8db4` | PD-derived |
| `public/geo/monsoon-and-weather-rain-gpcp-1991-2020.json` | 55,669 | `f3d738525cbcf6c54b0a15e37b4725deb0412769e79e3ec79796b234ac820e1f` | PD-derived |

Their `frames` equal the research cache's `wind-850-1991-2020.json` (`43a35472…beef`) and `rain-gpcp-1991-2020.json` (`7bf4cb29…a0fa`) value for value; the metadata differ (sources S22/S25/S101 and S32/S25/S102 instead of the cache's SX01/S46/SX02, and the notes).

Reused basemaps, unchanged: `public/geo/land-50m.json` (`71513927…dc96`), `public/geo/land-10m-sea.json` (`896b8697…aead`).
