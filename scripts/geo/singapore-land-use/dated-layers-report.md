# Dated-layer audit — second pass

Access/build date: 20 October 2026. All geometry is derived from published datasets. No OneMap, guessed coordinates, hand-drawn polygons, or historical interpolated footprints are used. Topic remains draft.

## Reproduce

Run `pnpm tsx scripts/geo/singapore-land-use/layers-fetch.ts`, then `pnpm tsx scripts/geo/singapore-land-use/dated-layers.ts`. The topic-local Python step needs shapely and pyproj; set `ATLAS_GEO_PYTHON` to that interpreter, or use `work/venv/bin/python`. Run `layers-review.py` with matplotlib for the 20 dated review PNGs. Raw inputs, intermediate matching tables and review PNGs remain gitignored.

## HDB join

10,644 matched residential property rows / 10,817 residential rows = **98.401%**. There are 13,436 source footprint features. 173 rows are omitted: 121 ambiguous, 52 without a matching footprint candidate. No OneMap request was made.

G5 contains no residential flag. The `residential = Y` filter therefore applies to G4 Property Information after the spatial/address join. Footprint centroids are assigned to official URA planning areas and to the explicit HDB town correspondence in `layers-build.py` (including Kallang/Whampoa ↔ Kallang/Novena and Central Area ↔ its component planning areas). A town+block key is seeded only when there is one property row, including non-residential rows so that carpark/residential address collisions cannot be silently resolved. These seeds learn ST_COD ↔ street names. The second pass joins unique street+block keys. For otherwise unseeded street codes, candidate street sets across all town+block matches are intersected; only singleton intersections are accepted. Conflicting seeded codes are excluded, with no majority-vote guess.

There are 614 trusted street codes, including 32 learned by singleton set intersection. Two conflicted codes (`PAH04B`, `SAT00T`) are excluded. Multiple footprint pieces for one property row are dissolved before computing one block centroid; the public layer retains only numeric `f` and `h`, sorted by `f`, and is quantized to 100000. Completion years span 1937–2026. The 26 rows dated after 2025 are retained as source metadata but cannot appear within this topic's timeline. These are blocks listed in the current datasets, including surviving SIT-era blocks; demolished blocks are absent and early-year dot totals are not historical production totals.

Full row-level diagnostics: `work/layers-hdb-matches.json`, `work/layers-hdb-unmatched.json`, `work/layers-hdb-street-map.json`. These are reproducible, gitignored audit outputs.

| HDB contract town | Matched | By town seed | By learned street | Ambiguous | Unmatched |
|---|---:|---:|---:|---:|---:|
| AMK | 392 | 392 | 0 | 0 | 0 |
| BB | 435 | 435 | 0 | 0 | 9 |
| BD | 510 | 354 | 156 | 20 | 0 |
| BH | 236 | 236 | 0 | 0 | 2 |
| BM | 395 | 100 | 295 | 31 | 0 |
| BP | 346 | 346 | 0 | 0 | 0 |
| BT | 21 | 12 | 9 | 6 | 0 |
| CCK | 529 | 529 | 0 | 0 | 0 |
| CL | 206 | 206 | 0 | 0 | 0 |
| CT | 74 | 59 | 15 | 5 | 0 |
| GL | 291 | 140 | 151 | 19 | 0 |
| HG | 604 | 604 | 0 | 0 | 6 |
| JE | 234 | 234 | 0 | 0 | 0 |
| JW | 744 | 732 | 12 | 0 | 3 |
| KWN | 288 | 90 | 198 | 24 | 3 |
| MP | 59 | 59 | 0 | 0 | 0 |
| PG | 557 | 557 | 0 | 0 | 0 |
| PRC | 438 | 438 | 0 | 2 | 1 |
| QT | 242 | 85 | 157 | 0 | 0 |
| SB | 281 | 281 | 0 | 0 | 0 |
| SGN | 232 | 232 | 0 | 0 | 0 |
| SK | 669 | 669 | 0 | 0 | 0 |
| TAP | 915 | 790 | 125 | 6 | 3 |
| TG | 127 | 127 | 0 | 0 | 18 |
| TP | 378 | 262 | 116 | 8 | 0 |
| WL | 737 | 734 | 3 | 0 | 4 |
| YS | 704 | 704 | 0 | 0 | 3 |

## Areas and dates

MP2019 BUSINESS parcels are selected by majority spatial overlap with official URA planning areas, then dissolved; no industrial boundary is drawn by hand. Jurong uses JURONG EAST, JURONG WEST, BOON LAY and PIONEER; Seletar Aerospace Park uses SELETAR. These represent today’s indicative industrial areas, not estate boundaries at their activation date. All estate and farm features have `certainty: approximate`. Geometry is repaired, simplified at 5 m in SVY21 metres, converted to WGS84, cleaned by shared mapshaper, and quantized to 100000. The official planning boundaries select complete real parcels; they are not replacement estate polygons.

| Output area | `f` | Date meaning and readable source |
|---|---:|---|
| Jurong industrial area | 1961 | Conception year, not the opening date of every factory. [JTC, Dream Factories](https://www.jtc.gov.sg/about-jtc/dream-factories), introduction: “Jurong Industrial Estate, conceptualised in 1961”. |
| Seletar Aerospace Park | 2007 | Launch of development, not completion of every phase. [MTI, 11 February 2014 speech](https://www.mti.gov.sg/newsroom/speech-by-second-minister-s-iswaran-at-the-opening-ceremony-of-bombardier-service-centre-at-seletar-aerospace-park/), paragraph beginning “Our investments”: “Since the launch of its development in 2007”. |
| Lim Chu Kang / western water catchment farmland | 1986 | Land reservation, not opening of every farm. [CLC, Food and the City](https://isomer-user-content.by.gov.sg/50/da33e51c-ad22-4d45-969d-319bc63dd0fc/food-and-the-city-overcoming-challenges-for-food-security.pdf), 1986 agrotechnology parks passage; source previously read and logged in `research/land-food.json`. |
| Bukit Timah and Central Catchment Nature Reserves | 1951 | Legally protected under the Nature Reserves Ordinance 1951 and re-declared Nature Reserves in 1990, according to [NParks, History of Bukit Timah Nature Reserve](https://www.nparks.gov.sg/visit/parks/bukit-timah-nature-reserve/special-features/history), “Important periods”. Review 2026-10-20: drawn from 1951, the start of continuous legal protection; 1990 is the re-declaration under the National Parks Act. |
| Sungei Buloh Wetland Reserve | 2002 | Gazette year, distinct from nature park opening 1993. [NParks, Nature areas](https://www.nparks.gov.sg/visit/when-visiting-parks/about-parks-nature-reserves-pcns), Sungei Buloh section. |
| Labrador Nature Reserve | 2002 | Gazette year. [Civil Service College, A City in a Garden](https://knowledge.csc.gov.sg/world-cities-summit-issue/a-city-in-a-garden/), conservation discussion: “The Sungei Buloh Wetland Reserve and Labrador Nature Reserve were gazetted in January 2002.” |

The G7 download has numeric `N_RESERVE = 1`, not the spec’s string `Y`. It flags seven features: four named legal reserves and three reservoir parks. The layer selects the four actual reserve names; it does not mislabel reservoir parks as additional reserves. These are current indicative managed boundaries, not survey/cadastral boundaries. G7 catalogue coverage says November 2025; download updated October 2026.

**Unverifiable/omitted:** no exact Tuas or Woodlands estate-wide opening year was verified, so their timed areas are omitted. NLB descriptions provide broad development decades only. This is a known reduction from the illustrative estate list. The six historical agricultural park names and 1986 reservation are sourced, but the 2019 AGRICULTURE layer does not preserve separate contemporary park boundaries. The output groups actual AGRICULTURE parcels in LIM CHU KANG and WESTERN WATER CATCHMENT (covering the western farm locations). No AGRICULTURE parcel overlaps the selected Sungei Tengah (CHOA CHU KANG/TENGAH), Nee Soon (YISHUN/MANDAI), or Loyang (PASIR RIS/CHANGI) planning areas. Those groups remain absent, rather than tracing copyrighted historical park annex maps or naming unrelated farmland as a park. The small AGRICULTURE parcel in SUNGEI KADUT is not assumed to be Sungei Tengah.

## Reservoir identity check

All four-taps reservoir geometries except Linggiu (Johor, outside this topic’s Singapore-only map; removed in review) are copied with their arc indices, full canonical arc array and transform unchanged. Labels are matched exactly to canonical site-event titles; IDs and source IDs are retained in `work/layers-reservoir-manifest.json`. `f` comes from the canonical site-event `t`, converted as actual elapsed UTC days divided by the length of that calendar year; year-only dates become integer years. Marina’s `2008-10-31` becomes `2008.8306010928961`. This includes Jurong Lake exactly as the upstream topic does. Lower Peirce’s conservative 1920 and Pulau Tekong’s unverified completion/first-drawn-2008 convention remain unchanged. Original source IDs refer to four-taps’ source list, not this topic’s independently numbered list. No opening-date corrections are silently applied to canonical water data.

## Calculated planned agriculture areas

These are sums of projected URA `AGRICULTURE` parcel areas, in SVY21, not observations of cultivated land. Edition dates do not imply agricultural activity in that year.

| Master Plan edition | Planned agriculture km² |
|---|---:|
| 2003 | 8.906493 |
| 2008 | 8.071918 |
| 2014 | 9.789920 |
| 2019 | 6.052121 |

## Budgets

| Layer | Features | Bytes | gzip bytes |
|---|---:|---:|---:|
| hdb-blocks | 10644 | 806969 | 93539 |
| estates | 4 | 47497 | 17636 |
| farm-parks | 1 | 7575 | 3507 |
| reserves | 4 | 8898 | 3811 |
| reservoirs | 17 | 52462 | 14195 |

HDB gzip 93,539 bytes ≤ 300,000. All area layers total 116,432 raw bytes ≤ 400,000. Every public file is TopoJSON with exactly one object matching its filename stem. The four non-reservoir outputs use 100000 quantization; reservoir quantization is unchanged from four-taps.

## Sources and licences

HDB Property Information G4 (`d_17f5382f26140b1fdae0ba2ef6239d2f`), HDB Existing Building G5 (`d_16b157c52ed637edd6ba1232e026258d`), URA MP2019 Land Use G2 (`d_90d86daa5bfaa371668b84fa5f01424f`), URA MP2019 Planning Area Boundary (No Sea) G3 (`d_4765db0e87b9c86336792efe8a1f7a66`), NParks Parks and Nature Reserves G7, and MP2003/2008/2014 G8 are under [Singapore Open Data Licence version 1.0](https://data.gov.sg/open-data-licence). The NParks catalogue’s exact licence statement is “Free forever for personal or commercial use, under the Open Data Licence.” Geometry rights come from the datasets; the JTC/MTI/NParks explanatory webpages are used for short factual chronology citations, not copied map artwork.

Contains information from HDB Property Information, HDB Existing Building, Master Plan 2019 Land Use, Master Plan 2019 Planning Area Boundary (No Sea), NParks Parks and Nature Reserves, Master Plan 2003 Land Use, MP08 Land Use, and Master Plan 2014 Land Use accessed on 20 October 2026 from data.gov.sg which is made available under the terms of the Singapore Open Data Licence version 1.0.

Reservoir source and attribution copied from four-taps: URA waterbody geometry (SODL v1.0); reservoir matching/names: **© OpenStreetMap contributors**, [ODbL 1.0](https://www.openstreetmap.org/copyright). Derived OSM database material retains ODbL obligations; the topic’s prose/content licence does not replace source database licences.

New source receipts (full receipts also remain in `raw/fetch-log.json`):

| Dataset | Dataset ID | Fetch UTC | Bytes | SHA-256 |
|---|---|---|---:|---|
| parks | d_77d7ec97be83d44f61b85454f844382f | 2026-10-20T11:42:04.344Z | 3095917 | `032a96ae1cde6057a2fd701b51388fc019df1b6e63e2a599e97a5942ada70526` |
| mp2003 | d_78c9a05019ea8594a657c192bddcd2d6 | 2026-10-20T11:42:06.504Z | 133064277 | `ed1c754e3e16ceb70ee0bd1fe6c8e56e7ff3c64fa3a06e24e7192afc1745ec92` |
| mp2008 | d_7ea297b9bf38956bd553638e5db042cd | 2026-10-20T11:43:11.296Z | 142359120 | `38ba4b111f8f0d0153b4427b87f8a0755bbebee89d70af1d74ac91d9e9c39b65` |
| mp2014 | d_6c3e60b98c170edc47024795330c1353 | 2026-10-20T11:43:14.202Z | 157523433 | `adf2283d965575ef102fe5691a3aa101a6043cc6987822ad4276a42bc6408e6c` |

## Verification and review

`layers-check.py` checks decoded final geometries after quantization: all five layers have zero invalid geometries, zero empty geometries and zero invalid date intervals; all 10,644 HDB points are inside the published current land outline. Area topology gets a second mapshaper clean after quantization (snap 0.000005 degrees, under one metre) to remove a quantization-induced tiny Jurong self-intersection; reservoir arcs are exempt to preserve canonical water geometry exactly. The active counts at 1965 / 1980 / 2000 / 2019 / 2025 are:

| Layer | 1965 | 1980 | 2000 | 2019 | 2025 |
|---|---:|---:|---:|---:|---:|
| hdb-blocks | 244 | 1751 | 7818 | 9890 | 10618 |
| estates | 1 | 1 | 1 | 2 | 2 |
| farm-parks | 0 | 0 | 1 | 1 | 1 |
| reserves | 2 | 2 | 2 | 4 | 4 |
| reservoirs | 3 | 7 | 13 | 17 | 17 |

The build enforces the gzip HDB budget and raw aggregate area budget. Standalone TypeScript compilation was used to resolve topic-local script issues; overall project gates belong to the parent integration run. Review images are `docs/screenshots/singapore-land-use/layers-<layer>-{1965,1980,2000,2019}.png`, generated from decoded final TopoJSON and the real official present-day planning outline (explicitly labelled a reference). These are map data reviews, not a substitute for final TimeScene screenshots.
