# Singapore land use — geographic audit, second pass

Built on 20 October 2026. **Draft; geographic accuracy is not accepted.** The required software gates are separate from the remaining K1 control-point and coastline accuracy requirements. Earlier access findings are retained in CODEX-REPORT.md and research/landsat-access.json.

## Source ledger and licences

| Source | Dataset | Licence |
|---|---|---|
| G2 | [Master Plan 2019 Land Use layer](https://data.gov.sg/datasets/d_90d86daa5bfaa371668b84fa5f01424f/view) | Singapore Open Data Licence v1.0; source attribution and link to current licence required. |
| G3 | [Master Plan 2019 Planning Area Boundary (No Sea)](https://data.gov.sg/datasets/d_4765db0e87b9c86336792efe8a1f7a66/view) | Singapore Open Data Licence v1.0; source attribution and link to current licence required. |
| G4 | [HDB Property Information](https://data.gov.sg/datasets/d_17f5382f26140b1fdae0ba2ef6239d2f/view) | Singapore Open Data Licence v1.0; source attribution and link to current licence required. |
| G5 | [HDB Existing Building](https://data.gov.sg/datasets/d_16b157c52ed637edd6ba1232e026258d/view) | Singapore Open Data Licence v1.0; source attribution and link to current licence required. |
| G6 | [Master Plan 2019 Rail Line layer](https://data.gov.sg/datasets/d_222bfc84eb86c7c11994d02f8939da8d/view) | Singapore Open Data Licence v1.0; source attribution and link to current licence required. |
| G7 | [NParks Parks and Nature Reserves](https://data.gov.sg/datasets/d_77d7ec97be83d44f61b85454f844382f/view) | Singapore Open Data Licence (linked by catalogue; attribution required) |
| G8 | [Master Plan 2003 Land Use](https://data.gov.sg/datasets/d_78c9a05019ea8594a657c192bddcd2d6/view) | Singapore Open Data Licence v1.0; source attribution and link to current licence required. |
| G8 | [MP08 Land Use](https://data.gov.sg/datasets/d_7ea297b9bf38956bd553638e5db042cd/view) | Singapore Open Data Licence v1.0; source attribution and link to current licence required. |
| G8 | [Master Plan 2014 Land Use](https://data.gov.sg/datasets/d_6c3e60b98c170edc47024795330c1353/view) | Singapore Open Data Licence v1.0; source attribution and link to current licence required. |
| G12 | [Land Area (As At December), Annual](https://data.gov.sg/datasets/d_0b2c034da121ef8efc71949af1694b4d/view) | Singapore Open Data Licence |
| G12 | [Indicators On Population, Annual](https://data.gov.sg/datasets/d_3d227e5d9fdec73f3bcadce671c333a6/view) | Singapore Open Data Licence |
| G12 | [Public Transport Operation And Ridership, Annual](https://data.gov.sg/datasets/d_ba615ec4cc5d9f5b7800ad82057f36f1/view) | Singapore Open Data Licence |
| G3 | [OpenStreetMap: named reservoirs of Singapore and Linggiu Reservoir (Johor), Overpass export](https://www.openstreetmap.org/) | ODbL 1.0 |
| G1 | [Map of Singapore from The State of Singapore (BIS, April 1959)](https://commons.wikimedia.org/wiki/File:Map_of_Singapore_from_The_State_of_Singapore_(BIS,_1959).jpg) | Public domain — PD-UKGov; UK government work published before 1976 |


Additional inherited sources:

- **G9:** USGS Landsat Collection 2 through the anonymous [Planetary Computer STAC API](https://planetarycomputer.microsoft.com/api/stac/v1). Exact scene IDs, bands, cloud measurements and thresholds appear below. Images courtesy of the U.S. Geological Survey, public domain.
- **G10:** canonical four-taps reservoir geometry, names and dates. Singapore water surfaces are URA SODL; name matching and the Linggiu outline use **© OpenStreetMap contributors**, [ODbL 1.0](https://www.openstreetmap.org/copyright). Database obligations remain in force.
- **G11:** decoded L4/L5 from `public/geo/land-sg-history.json`, unchanged upstream. Public-domain British maps, URA SODL and inherited OSM name selectors. The upstream audit calls these **rejected research drafts**. L4 uses a 1937 source; L5 includes earlier chart corrections and is not a certified 1961 survey. This topic preserves that limitation.
- **G13:** historical topic Admiralty charts G14–G17 copied read-only to ignored refs/. Chart 2014, published in 1966, was visually inspected: the separate Jurong islands broadly correspond to the early satellite pattern. Publication, survey and correction dates differ. No chart geometry was newly traced. TPC 1984 was not newly fetched; this independent check remains incomplete.

The [Singapore Open Data Licence 1.0](https://data.gov.sg/open-data-licence) permits reuse and adaptation with attribution and a current licence link. Catalogue wording: “Free forever for personal or commercial use, under the Open Data Licence.” Contains information from the URA, HDB, NParks and statistical datasets listed above, accessed on 20 October 2026 from data.gov.sg, made available under the Singapore Open Data Licence version 1.0. Per-file timestamps, SHA-256 hashes and source URLs are retained in fetch-receipts.json, dated-layers-report.md and rail-report.md.

No NAS, NUS/SLA, journal or SFA annex map artwork was traced or published. References in ignored refs/ are look-only. Text citations do not grant artwork reuse rights. Natural Earth background context is public domain and unchanged. The topic's content licence does not replace SODL or ODbL obligations.

## Landsat access and selection

The [USGS cloud public-domain FAQ](https://www.usgs.gov/faqs/are-landsat-data-cloud-still-considered-be-within-public-domain) states: “Permission is not required for use.” USGS requests acknowledgement. Its [redistribution FAQ](https://www.usgs.gov/faqs/are-there-any-restrictions-use-or-redistribution-landsat-data) confirms unrestricted use. [MPC SAS documentation](https://planetarycomputer.microsoft.com/docs/concepts/sas/) allows anonymous issuance. Collection token requests returned HTTP 200 and signed TIFF byte ranges returned 206. Native-resolution windows were read without an account, billing project or requester-pays access. Tokens and signed URLs were not retained.

Microsoft's [access-service terms](https://planetarycomputer.microsoft.com/terms) apply separately from data copyright. The retained indexed terms include “Previews are provided solely for evaluation and testing.” Tokens cannot be transferred. Direct HTML is a JavaScript shell; the complete terms are linked rather than reproduced. The user's second-pass instruction explicitly permits TM/ETM+ Level 2 products, superseding the earlier Level-1-only access stop.

| Era | Scene ID (STAC item) | Date | Scene / island QA cloud % | Bands and index | Otsu threshold |
|---|---|---|---:|---|---:|
| L6 | `LM01_L1TP_134059_19731017_02_T2` | 1973-10-17 | 2.00 / 1.47 | B4/B7 TOA reflectance; NDWI | 0.01465815 |
| L7 | `LM02_L1TP_134059_19791031_02_T2` | 1979-10-31 | 20.00 / 7.01 | B4/B7 TOA reflectance; NDWI | 0.17528600 |
| L8 | `LT05_L2SP_125059_19910428_02_T1` | 1991-04-28 | 11.00 / 4.07 | SR_B2/SR_B5 surface reflectance; MNDWI | 0.22265625 |
| L9 | `LE07_L2SP_125059_20021011_02_T1` | 2002-10-11 | 54.00 / 4.80 | SR_B2/SR_B5 surface reflectance; MNDWI | 0.12157136 |
| L10 | `LT05_L2SP_125059_20110214_02_T1` | 2011-02-14 | 26.00 / 22.55 | SR_B2/SR_B5 surface reflectance; MNDWI | 0.16941148 |


All returned corrected MSS and TM/ETM+ candidates in the recorded date windows were screened over Singapore; scene-wide cloud percentages alone did not determine selection. See scene-cloud.json. No 1981 L1TP scene was returned, so L7 uses 1979. A lower-cloud L1GS item was rejected because it lacks terrain precision correction. The lowest-QA 1992 and 2009 TM scenes were rejected after visual inspection showed severe haze and poor shore classification; 1991 and 2011 are disclosed substitutes. Tide levels could not be verified or matched. Acquisition UTC times remain in the STAC receipts.

## Reproducible water-detection method

`landsat-coast.ts` runs the topic-local Python raster method. MSS NDWI = (green B4 − NIR B7) / (green B4 + NIR B7), using MTL reflectance multipliers and offsets. The shared solar-elevation factor cancels. B7 covers 0.8–1.1 µm; see [USGS band designations](https://www.usgs.gov/faqs/what-are-band-designations-landsat-satellites) and the [USGS Landsat handbook](https://pubs.usgs.gov/gip/70039196/report.pdf). TM/ETM+ MNDWI uses SR_B2 and SR_B5; reflectance = DN × 0.0000275 − 0.2.

Otsu thresholds are computed on valid, clear pixels within 2 km of the original G3 outer coast, excluding inland reservoir shores. The lower-index class is land. QA bits 1, 3 and 4 identify dilated cloud, cloud and shadow. Unknown/cloud pixels conservatively retain today's land status; this is **not an observation of historical land beneath cloud**. A 3 × 3 closing fills one-pixel gaps.

Vectorise at native 60 m MSS / 30 m TM resolution. Minus = today's land minus scene land buffered by two pixels. Drop pieces below 0.1 km²; keep coastal-connected pieces to avoid mistaking inland reservoir water for reclamation. Plus = scene land eroded by two pixels minus today's land buffered by two pixels. Restrict plus to G11 L5 land to exclude Malaysia, Indonesia and turbid-water false positives; drop pieces below 0.1 km². No qualifying plus pieces remain. This extra conservative attribution mask cannot recover lost islands absent from L5. No nuisance polygons were hand-deleted.

## Coast measurements and limits

Sample every 100 m along G3's largest exterior ring where it lies within one native pixel of G11 L5, at least 500 m from detected minus, and is QA-clear. Measure distance to the unbuffered scene boundary before display packing. The table reports extraction diagnostics, not the error of a surveyed or packed final coastline. G11 is only a provisional unchanged-coast selector; its rejected status means that selector is not certified. Earlier reservoir-shore samples were corrected. **The sensor-specific p95 targets, 120 m MSS and 60 m TM, remain unmet.**

| Era | Acquisition / reference | Published land km² | Difference to L11 km² | Diagnostic p50 / p95 m | Samples |
|---|---|---:|---:|---:|---:|
| L4 | Inherited G11 approximate outline | 536.397 | -219.514 | Not requalified | — |
| L5 | Inherited G11 approximate outline | 521.855 | -234.057 | Not requalified | — |
| L6 | 1973-10-17 | 599.991 | -155.920 | 42.47 / 168.94 | 435 |
| L7 | 1979-10-31 | 629.848 | -126.063 | 47.60 / 214.38 | 477 |
| L8 | 1991-04-28 | 645.415 | -110.496 | 24.20 / 157.58 | 412 |
| L9 | 2002-10-11 | 704.788 | -51.123 | 19.19 / 113.64 | 422 |
| L10 | 2011-02-14 | 727.444 | -28.467 | 26.53 / 266.04 | 392 |
| L11 | URA MP2019 outline, from 2019-11-18 | 755.911 | 0.000 | Reference only | — |


Published areas are SVY21 projected areas of final packed geometries, not national statistical land area. The specified G3 MP2019 outline is indicative planning geometry rather than an independently surveyed 2026 coast. The official values (581.5 km² in 1960, 617.8 in 1980, 682.7 in 2000 and 735.7 in 2024) use a different definition, including a 2002 method change. L4 → L5 is not an accepted measured growth series.

The unchanged shared `local-land.ts` applies the exact four-taps water/keepMatch configuration and writes eight dated eras, mask and today's reference coast. `build-coasts.ts` keeps each era in a separate cleaning layer, so overlapping eras cannot erase each other. It then folds the layers into one object and asserts that all eight eras survive. Final display DP is **90 m**, with quantisation 10000 and a grid of approximately 5.37 × 3.38 m. Post-quantisation cleaning uses a 0.00001° snap. This display simplification is a disclosed budget tradeoff, not compliance with the tighter geographic accuracy targets. All final rings are checked; see coast-packing.json.

## Control maps

**K1:** G1's contiguous City and Naval Base stipple edges are traced through dense source-pixel anchors in lines.json. Straight connectors join image-observed anchors; the all-pixel mask is not claimed as a colour-detection accuracy test. Offshore closures only select a side and are clipped to G11 L4 mainland. Sentosa is not painted as City. Countryside is L4 minus City, Naval Base and three early named reservoirs. Unbounded forest/swamp symbols are not traced. Every K1 feature is approximate.

The retained source is a 1920 × 1205 Commons preview. Original-resolution requests failed with HTTP 403/429. Projection auto selected laea(103.8,1.3)+poly2. The 16 constructed graticule intersections have internal RMS 20.17 m, max 40.12 m; leave-one-out RMS 37.49 m, max 68.80 m. **These are correlated constructions from border ticks, not 16 independent ground identifications. They do not satisfy the brief's control-point requirement or establish external 150/300 m accuracy.** See k1-review.md.

**K2/K3:** literal empty GeometryCollections at 1966-01-01 and 2019-01-01. The shared compose/simplify tools do not build empty recipes, so topic-local control.ts builds K1/K4 and inserts empty objects. It marks K1 approximate without changing geometry. No shared code was patched.

**K4:** all LU_DESC values are exported with areas in layers-area-statistics.md. COMMERCIAL / INSTITUTION is explicitly assigned to town-and-services; this edition has no NATURE RESERVE value. ROAD and WATERBODY are excluded. Seven modern planned-use categories are dissolved, clipped to L11, simplified at 10 m and quantised to 50000. Countryside occurs only in K1. The four frames contain 3 / 0 / 0 / 7 features. The slug is included in the ring regression test.

## Dated layers and railway

The full [dated-layer audit](dated-layers-report.md) records the per-town HDB join and all area-date sources. There are 10,644 matched blocks from 10,817 residential property rows (98.401%); 121 ambiguous and 52 unmatched rows are omitted. No OneMap. Multiple footprint pieces dissolve to one centroid; only numeric f/h remain. Eighteen canonical reservoir geometries, arcs, transform and dates match four-taps, with ISO dates converted to decimal calendar years. Estates, farm parcels and reserves carry per-feature approximate certainty and present-day extent semantics. Tuas/Woodlands exact opening dates and unsupported separate historical farm boundaries are omitted.

The [rail audit](rail-report.md) records 37 opening segments, 2,594 vertices, source feature IDs, station-derived connectors and date citations. Railway geometry is URA SODL and OSM-free. Every route persists, uses holder transport and has equal from/to. Some dates use primary operator, MOT or NAS sources rather than the preferred LTA/NLB; two retain month precision. The closed Ten Mile Junction spur is omitted. Partial Punggol West service in 2014 is not rendered as a whole loop.

## Budgets and review

| File | Bytes | gzip -9 bytes | Budget |
|---|---:|---:|---|
| `control.json` | 1,029,411 | 319,960 | 1.2 MiB raw |
| `land-sg-modern.json` | 250,603 | 74,604 | 250 KiB raw |
| `sg-hdb-blocks.json` | 806,969 | 85,478 | 300 KB gzip |
| `sg-estates.json` | 36,910 | 14,628 | 400 KB raw, all four area files combined |
| `sg-farm-parks.json` | 7,483 | 3,451 | 400 KB raw, all four area files combined |
| `sg-reserves.json` | 8,430 | 3,617 | 400 KB raw, all four area files combined |
| `sg-reservoirs.json` | 52,754 | 14,144 | 400 KB raw, all four area files combined |


HDB's budget is gzip per §9. The four area files total 105,577 raw bytes. PNG source comparisons and dated-layer reviews are under ignored docs/screenshots/singapore-land-use/. Existing chapter illustration assets were reused. Visual comparison is evidence for review, not historical acceptance.

## Every retained difference piece at least 0.1 km²

Names below are candidate geographic correspondences inferred from centroid location and the cited project histories. They are not surveyed project-footprint/date matches. Unmatched pieces remain listed and visible. Changi, Tekong, port and offshore pieces still need dated engineering evidence.

| Era | Kind / piece | Area km² | Centroid lng, lat | Named correspondence / unresolved |
|---|---|---:|---|---|
| L6 | minus 1 | 37.4030 | 103.62925, 1.26742 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L6 | minus 2 | 30.8800 | 104.00213, 1.33989 | unmatched |
| L6 | minus 3 | 24.9788 | 104.05831, 1.38059 | unmatched |
| L6 | minus 4 | 19.3894 | 103.6777, 1.2591 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L6 | minus 5 | 6.1306 | 104.02673, 1.42776 | unmatched |
| L6 | minus 6 | 6.0915 | 103.86625, 1.28138 | Candidate Marina Bay — [URA Marina Bay, History and beginnings; 1971–1994 reclamation](https://www.ura.gov.sg/land-planning/shaping-our-city/marina-bay/); not a dated footprint match |
| L6 | minus 7 | 5.6200 | 103.7728, 1.27533 | unmatched |
| L6 | minus 8 | 3.3242 | 103.77098, 1.19901 | Candidate Semakau — [NEA, Celebrating20years, paragraph4 and AnnexA; 1999/2015](https://www.nea.gov.sg/media/news/news/index/celebrating-20-years-of-semakau-landfill); not a dated footprint match |
| L6 | minus 9 | 3.1062 | 103.88495, 1.42273 | unmatched |
| L6 | minus 10 | 2.9344 | 103.92874, 1.39875 | unmatched |
| L6 | minus 11 | 2.5544 | 103.71908, 1.27329 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L6 | minus 12 | 2.1152 | 103.9937, 1.40926 | unmatched |
| L6 | minus 13 | 1.8316 | 103.71867, 1.20728 | unmatched |
| L6 | minus 14 | 1.1023 | 103.75147, 1.23283 | unmatched |
| L6 | minus 15 | 0.9049 | 103.86653, 1.4429 | unmatched |
| L6 | minus 16 | 0.8148 | 103.71812, 1.28968 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L6 | minus 17 | 0.5377 | 103.8432, 1.24959 | unmatched |
| L6 | minus 18 | 0.5057 | 103.74749, 1.44253 | unmatched |
| L6 | minus 19 | 0.4689 | 103.85092, 1.24143 | unmatched |
| L6 | minus 20 | 0.4056 | 103.76905, 1.23227 | unmatched |
| L6 | minus 21 | 0.4040 | 103.85266, 1.22996 | unmatched |
| L6 | minus 22 | 0.2934 | 103.83818, 1.25998 | unmatched |
| L6 | minus 23 | 0.2928 | 103.85395, 1.45558 | unmatched |
| L6 | minus 24 | 0.2881 | 103.63718, 1.35017 | unmatched |
| L6 | minus 25 | 0.2819 | 103.67695, 1.30033 | unmatched |
| L6 | minus 26 | 0.2612 | 103.66984, 1.2931 | unmatched |
| L6 | minus 27 | 0.1727 | 103.63631, 1.34116 | unmatched |
| L6 | minus 28 | 0.1313 | 103.95464, 1.38115 | unmatched |
| L6 | minus 29 | 0.1090 | 103.79924, 1.20275 | unmatched |
| L6 | minus 30 | 0.1063 | 103.65171, 1.30193 | unmatched |
| L6 | minus 31 | 0.1026 | 103.838, 1.24042 | unmatched |
| L7 | minus 1 | 35.7391 | 103.62892, 1.26443 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L7 | minus 2 | 21.9472 | 104.01032, 1.33744 | unmatched |
| L7 | minus 3 | 21.0579 | 104.0547, 1.37771 | unmatched |
| L7 | minus 4 | 18.9568 | 103.67744, 1.2584 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L7 | minus 5 | 5.6019 | 104.02498, 1.42742 | unmatched |
| L7 | minus 6 | 3.3417 | 103.7712, 1.19913 | Candidate Semakau — [NEA, Celebrating20years, paragraph4 and AnnexA; 1999/2015](https://www.nea.gov.sg/media/news/news/index/celebrating-20-years-of-semakau-landfill); not a dated footprint match |
| L7 | minus 7 | 2.7088 | 103.76611, 1.27812 | unmatched |
| L7 | minus 8 | 2.6132 | 103.88398, 1.42296 | unmatched |
| L7 | minus 9 | 2.4277 | 103.93065, 1.39553 | unmatched |
| L7 | minus 10 | 2.0449 | 103.87068, 1.28267 | Candidate Marina Bay — [URA Marina Bay, History and beginnings; 1971–1994 reclamation](https://www.ura.gov.sg/land-planning/shaping-our-city/marina-bay/); not a dated footprint match |
| L7 | minus 11 | 1.7026 | 103.78657, 1.26439 | unmatched |
| L7 | minus 12 | 1.2187 | 103.99759, 1.40933 | unmatched |
| L7 | minus 13 | 1.0588 | 103.72441, 1.26916 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L7 | minus 14 | 0.9981 | 103.75307, 1.23139 | unmatched |
| L7 | minus 15 | 0.8638 | 103.86631, 1.4437 | unmatched |
| L7 | minus 16 | 0.4815 | 104.00391, 1.37518 | unmatched |
| L7 | minus 17 | 0.4689 | 103.85092, 1.24143 | unmatched |
| L7 | minus 18 | 0.2713 | 103.71645, 1.29113 | unmatched |
| L7 | minus 19 | 0.2705 | 103.84209, 1.26746 | Candidate Marina Bay — [URA Marina Bay, History and beginnings; 1971–1994 reclamation](https://www.ura.gov.sg/land-planning/shaping-our-city/marina-bay/); not a dated footprint match |
| L7 | minus 20 | 0.1629 | 103.84079, 1.2506 | Candidate Marina Bay — [URA Marina Bay, History and beginnings; 1971–1994 reclamation](https://www.ura.gov.sg/land-planning/shaping-our-city/marina-bay/); not a dated footprint match |
| L7 | minus 21 | 0.1244 | 103.69436, 1.28892 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L7 | minus 22 | 0.1232 | 103.70263, 1.28696 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L7 | minus 23 | 0.1231 | 103.74693, 1.44326 | unmatched |
| L7 | minus 24 | 0.1087 | 103.83768, 1.24027 | unmatched |
| L7 | minus 25 | 0.1022 | 103.75723, 1.44166 | unmatched |
| L7 | minus 26 | 0.1020 | 103.8562, 1.45507 | unmatched |
| L8 | minus 1 | 23.7714 | 103.62714, 1.24881 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L8 | minus 2 | 20.5248 | 104.05598, 1.37686 | unmatched |
| L8 | minus 3 | 19.1302 | 104.01249, 1.33819 | unmatched |
| L8 | minus 4 | 17.7318 | 103.67612, 1.25849 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L8 | minus 5 | 7.1037 | 104.02748, 1.42723 | unmatched |
| L8 | minus 6 | 3.9577 | 103.77382, 1.2724 | unmatched |
| L8 | minus 7 | 3.5889 | 103.77112, 1.19948 | Candidate Semakau — [NEA, Celebrating20years, paragraph4 and AnnexA; 1999/2015](https://www.nea.gov.sg/media/news/news/index/celebrating-20-years-of-semakau-landfill); not a dated footprint match |
| L8 | minus 8 | 2.5348 | 103.71899, 1.2763 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L8 | minus 9 | 2.1694 | 103.99345, 1.40935 | unmatched |
| L8 | minus 10 | 2.0607 | 103.64138, 1.30278 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L8 | minus 11 | 0.8054 | 103.86606, 1.4436 | unmatched |
| L8 | minus 12 | 0.5840 | 103.74709, 1.44251 | unmatched |
| L8 | minus 13 | 0.5225 | 103.7563, 1.44155 | unmatched |
| L8 | minus 14 | 0.4689 | 103.85092, 1.24143 | unmatched |
| L8 | minus 15 | 0.3713 | 103.85312, 1.45571 | unmatched |
| L8 | minus 16 | 0.3699 | 103.85585, 1.26845 | Candidate Marina Bay — [URA Marina Bay, History and beginnings; 1971–1994 reclamation](https://www.ura.gov.sg/land-planning/shaping-our-city/marina-bay/); not a dated footprint match |
| L8 | minus 17 | 0.3104 | 103.94037, 1.39199 | unmatched |
| L8 | minus 18 | 0.3061 | 103.75226, 1.23111 | unmatched |
| L8 | minus 19 | 0.2753 | 103.76471, 1.28977 | unmatched |
| L8 | minus 20 | 0.2695 | 103.71264, 1.29729 | unmatched |
| L8 | minus 21 | 0.2396 | 103.93533, 1.39824 | unmatched |
| L8 | minus 22 | 0.1983 | 103.62927, 1.33084 | unmatched |
| L8 | minus 23 | 0.1773 | 103.83696, 1.24043 | unmatched |
| L8 | minus 24 | 0.1747 | 103.84478, 1.25098 | Candidate Marina Bay — [URA Marina Bay, History and beginnings; 1971–1994 reclamation](https://www.ura.gov.sg/land-planning/shaping-our-city/marina-bay/); not a dated footprint match |
| L8 | minus 25 | 0.1596 | 103.63569, 1.349 | unmatched |
| L8 | minus 26 | 0.1418 | 103.6942, 1.28894 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L8 | minus 27 | 0.1269 | 103.73676, 1.27161 | unmatched |
| L8 | minus 28 | 0.1094 | 103.84414, 1.46109 | unmatched |
| L8 | minus 29 | 0.1085 | 103.86334, 1.43207 | unmatched |
| L8 | minus 30 | 0.1021 | 103.62232, 1.31618 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 1 | 17.6295 | 104.05522, 1.37579 | unmatched |
| L9 | minus 2 | 4.3620 | 104.03266, 1.43161 | unmatched |
| L9 | minus 3 | 4.2671 | 103.63612, 1.21756 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 4 | 2.5286 | 103.63103, 1.25004 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 5 | 2.2556 | 103.99315, 1.40927 | unmatched |
| L9 | minus 6 | 2.1083 | 103.61314, 1.26686 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 7 | 2.0854 | 103.63961, 1.2337 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 8 | 1.9057 | 103.67339, 1.24281 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 9 | 1.6162 | 103.78608, 1.26413 | unmatched |
| L9 | minus 10 | 1.0934 | 103.76766, 1.19559 | Candidate Semakau — [NEA, Celebrating20years, paragraph4 and AnnexA; 1999/2015](https://www.nea.gov.sg/media/news/news/index/celebrating-20-years-of-semakau-landfill); not a dated footprint match |
| L9 | minus 11 | 1.0486 | 103.63607, 1.26401 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 12 | 1.0065 | 103.64248, 1.30689 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 13 | 0.8712 | 103.866, 1.44368 | unmatched |
| L9 | minus 14 | 0.7610 | 103.62583, 1.3237 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 15 | 0.7581 | 104.01887, 1.41199 | unmatched |
| L9 | minus 16 | 0.5951 | 103.74723, 1.44242 | unmatched |
| L9 | minus 17 | 0.5818 | 103.72875, 1.2658 | unmatched |
| L9 | minus 18 | 0.5445 | 103.7563, 1.4416 | unmatched |
| L9 | minus 19 | 0.4689 | 103.85092, 1.24143 | unmatched |
| L9 | minus 20 | 0.4346 | 103.68652, 1.23913 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 21 | 0.3994 | 103.70461, 1.28306 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 22 | 0.3941 | 103.8559, 1.26844 | Candidate Marina Bay — [URA Marina Bay, History and beginnings; 1971–1994 reclamation](https://www.ura.gov.sg/land-planning/shaping-our-city/marina-bay/); not a dated footprint match |
| L9 | minus 23 | 0.3758 | 103.85311, 1.4557 | unmatched |
| L9 | minus 24 | 0.3647 | 104.01156, 1.31208 | unmatched |
| L9 | minus 25 | 0.3114 | 103.75227, 1.23116 | unmatched |
| L9 | minus 26 | 0.2825 | 103.65635, 1.27272 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 27 | 0.2772 | 103.69275, 1.25779 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 28 | 0.2580 | 103.94047, 1.39237 | unmatched |
| L9 | minus 29 | 0.1373 | 103.84405, 1.46128 | unmatched |
| L9 | minus 30 | 0.1186 | 103.60814, 1.22136 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L9 | minus 31 | 0.1160 | 103.86325, 1.43198 | unmatched |
| L10 | minus 1 | 5.1781 | 104.06968, 1.36045 | unmatched |
| L10 | minus 2 | 3.6132 | 103.63611, 1.21812 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 3 | 2.9289 | 103.63414, 1.23365 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 4 | 2.5461 | 103.63006, 1.24973 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 5 | 2.5073 | 104.03351, 1.38926 | unmatched |
| L10 | minus 6 | 1.9196 | 103.61044, 1.23104 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 7 | 1.4846 | 103.65992, 1.25913 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 8 | 0.8860 | 103.64223, 1.30653 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 9 | 0.7691 | 103.63674, 1.26362 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 10 | 0.7528 | 103.62581, 1.32371 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 11 | 0.6013 | 103.76622, 1.19583 | Candidate Semakau — [NEA, Celebrating20years, paragraph4 and AnnexA; 1999/2015](https://www.nea.gov.sg/media/news/news/index/celebrating-20-years-of-semakau-landfill); not a dated footprint match |
| L10 | minus 12 | 0.5358 | 103.74694, 1.44282 | unmatched |
| L10 | minus 13 | 0.4499 | 103.7289, 1.26578 | unmatched |
| L10 | minus 14 | 0.4358 | 103.78794, 1.26249 | unmatched |
| L10 | minus 15 | 0.3978 | 103.61072, 1.26199 | Candidate Tuas — [JTC Dream Factories; broad development history](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 16 | 0.3509 | 103.99376, 1.41609 | unmatched |
| L10 | minus 17 | 0.3221 | 103.84967, 1.24162 | unmatched |
| L10 | minus 18 | 0.3219 | 103.86898, 1.43811 | unmatched |
| L10 | minus 19 | 0.2798 | 103.70382, 1.28462 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 20 | 0.2009 | 103.85445, 1.26875 | Candidate Marina Bay — [URA Marina Bay, History and beginnings; 1971–1994 reclamation](https://www.ura.gov.sg/land-planning/shaping-our-city/marina-bay/); not a dated footprint match |
| L10 | minus 21 | 0.1813 | 103.86105, 1.45076 | unmatched |
| L10 | minus 22 | 0.1624 | 103.69341, 1.2551 | Candidate Jurong Island — [JTC Dream Factories; seven-island reclamation/opening](https://www.jtc.gov.sg/about-jtc/dream-factories); not a dated footprint match |
| L10 | minus 23 | 0.1482 | 103.85535, 1.45423 | unmatched |
| L10 | minus 24 | 0.1113 | 103.86332, 1.43203 | unmatched |
