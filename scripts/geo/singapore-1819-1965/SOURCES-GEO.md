# Singapore, 1819–1965: map evidence and reconstruction log

This is an evidence log for a **draft**, not a claim that the geographical acceptance criteria have passed. Published boundaries must derive from the cited datasets or a printed shoreline traced after georeferencing. OSM extracts in `raw/control-*.json` are used exclusively for coordinate control points and are never published as geometry.

`fetch.ts` requests Commons `imageinfo&iiprop=url|size|extmetadata` plus the file-page revision wikitext, downloads the full-resolution original, and records its SHA-256. Every original file page and API response is retained in ignored `raw/`; `raw/fetch-log.json` is the machine-readable record. All G1–G27 and G29 originals, plus G30, were downloaded; Natural Earth G21/G22 records from the regional pipeline are merged into the 29-record log. Wikimedia repeatedly returned HTTP 429 with `Retry-After: 600`; retries respected the cooldown. A licence name in structured metadata alone is not a rights investigation.

## Material corrections to the specification

- **G5 is not a whole-main-island Singapore map.** Inspection of the downloaded 15357 × 11856 original shows Chart 2404 Sheet 3 covers approximately 104°00′–104°35′ E: east Johor, Pulau Tekong, Batam and Bintan. Main Singapore, the town, the west coast and most north coast are outside it. It cannot supply the L0/L1 whole-main-island outline promised in §3.3. G2's upper panel, previously described only as a town comparison, is an early whole-island chart and is the available historical alternative, but its first four modern-feature diagnostics give approximately 2.29 km RMS / 2.80 km maximum. It was rejected rather than treating an inaccurate historical sketch as a qualified control source.
- **G1 is monochrome sepia**, despite §3.1 describing coloured classes. It has printed plan-division names and street perimeters. Division outlines require `lines.ts`, not colour classification.
- **G19** identifies a Shell *Road Map of Malaya* (1951), Survey Department Federation of Malaya No. 88-1951, while the uploader invokes Malaysian government copyright duration and the file is tagged `PD-old-70`. This does not establish its Singapore status. **Cross-check only**.
- **G20** is a 2015 digitally repaired/assembled scan attributed to Terry Fitzpatrick; its file page contains both `{{self|cc-by-sa-4.0}}` and `{{PD-UKGov}}`, without identifying the original agency and edition. **Cross-check only; no trace enters published geometry**.
- **G27** is attributed to Robert M. Chapin, *Time*, 12 April 1963, tagged `{{PD-US-not renewed}}`. No copyright-renewal search has been completed. **Cross-check only**.
- **G16** file-page date is 1954 and template is `{{PD-UKGov}}`; the title says published 1936. The original bottom small-corrections line was visually read through **1954** (crop `work/G16-corrections-bottom.png`); it does not establish a 1961 coast. The separate top “63.54” mark is not treated as a correction year.

- **G6** is a small proposed Master Attendant Office layout near Cavenagh Bridge with an 1873 signature, rather than a complete 1879 town/Telok Ayer plan. Its exact file remains available for research but is not used as a town-wide shoreline.
- **G9** prints 1911, has a February 1912 edition and February 1916 revision: shoreline survey age is mixed. **G11** prints revision 1937, War Office 1941, and AMS reproduction 1944.

## Reproduction and contracts

Shared `scripts/geo/lib/local-land.ts` now consumes manifest `pipeline.localLand.eras`, inland `water` and `coastToday`. It writes six dated `kind: land` features, one replacement mask and one dashed `kind: coast-today` line, and decodes the published eras for compose. The former local `coasts.ts`/`simplify.ts` and separate `coast-eras.json`/`coast-lines.json` have been deleted. Rebuild commands are in README.md. Current measurements and unresolved historical criteria are in CODEX-REPORT.md → Second pass.
Recipes use today's URA land as the base, remove source-traced blocks which were sea in the era, and restore any source-traced historical land now gone. `outline` is a traced historical retention polygon; it is not a rectangular extent and cannot be substituted by a bbox. No OSM geometry, modern Commons schematic or CShapes geometry is authorized for publication.

## Georeferencing control points and residuals

### G1 Jackson town plan — 12 candidate homologous junctions

`georef-G1.json` records every pixel and WGS84 control coordinate, with exact modern shared-node extraction in `raw/control-roads-osm.json`. These are visual identifications of proposed 1822 street junctions with modern streets; their historic continuity still requires review. This limitation is separate from fitting error. Projection selection uses unchanged shared `fit.ts` `candidates("auto", …)` and least leave-one-out RMS.

Measured best model: `laea(103.9,1.3)+affine`; fitted RMS **42.22 m**, fitted max **87.43 m**; leave-one-out RMS **58.39 m**, leave-one-out max **113.58 m**. Numerically within the L0/L1 town budget (RMS 60 m/max 120 m); continuity review remains open. Poly2 was not selected: its leave-one-out RMS was 149.18 m/max 377.13 m.

| Surviving feature candidate | Pixel x,y in G1 | WGS84 lon,lat |
|---|---|---|
| Bridge Street crossing / later Elgin Bridge centre | 735,327 | 103.8493033,1.2890664 |
| North Bridge Road / High Street | 785,350 | 103.8500150,1.2901963 |
| North Bridge Road / Coleman Street | 844,376 | 103.8509674,1.2917649 |
| North Bridge Road / Stamford Road canal | 936,418 | 103.8520429,1.2935887 |
| North Bridge Road / Bras Basah Road | 1003,447 | 103.8531036,1.2951261 |
| Beach Road / Bras Basah Road | 956,568 | 103.8546543,1.2939345 |
| North Bridge Road / Middle Road | 1132,505 | 103.8549985,1.2976349 |
| Beach Road / Middle Road | 1082,637 | 103.8562528,1.2965189 |
| North Bridge Road / Arab Street | 1328,590 | 103.8585234,1.3019710 |
| Beach Road / Arab Street | 1250,748 | 103.8599148,1.3002979 |
| South Bridge Road / Upper Pickering Street | 618,282 | 103.8471684,1.2854539 |
| South Bridge Road / Cross Street | 511,239 | 103.8461028,1.2836322 |

## First-pass era acceptance register (archived)

The following table preserves the first-pass measurements only. Current areas, river masks, inland water, G15 western splice, shared topology, current-coast line and sizes are recorded in CODEX-REPORT.md → Second pass and data/SOURCES.md. All six outputs remain reviewable **rejected research drafts**, rather than accepted historical coast reconstructions. The ranges are L0 before 1 January 1823; L1 1823–1887; L2 1887–1912; L3 1912–1937; L4 1937–1961; L5 from 1961. G9 supplies the outer-island source for L0–L3, G11 for L4, and G16 for L5. The early town water selectors come from G1, G4 and G7 respectively. Their offshore source-image closures select water for subtraction and are not treated as territory boundaries.

All eras omit untraced detached historical islands, rather than retaining known post-1965 reclaimed islands. They retain only the source-traced main-island/connected-source portions clipped to today's URA land. Historical land now gone is not restored. Urban inland river-water exclusions are incomplete, including the L0 and L1 Singapore River inlets. A parent-workflow river-bank A* trial was visually rejected because it followed neighbouring street ink, then rolled back; its audit output remains in ignored work/. G7’s water-colour channel is retained for L2. G9's later 1911–1916 source substitutes outside early-town map coverage; G1 is a proposed 1822 plan backcast to 1819; G4's 1839 source substitutes for 1823; G7's 1893 source substitutes for 1887. L5 uses a chart corrected through 1954 and has no completed 1961 Jurong source trace (G14/G15/G17). Neither its era date nor its coastline is accepted as established.

| Era | Sources (all use G30 clip) | Published area km² | Difference to today's URA baseline km² | Acceptance |
|---|---|---:|---:|---|
| L0 | G9, G1, G30 | 521.864 | 266.572 | rejected: accuracy/source-age/coverage gaps |
| L1 | G9, G4, G30 | 522.345 | 266.091 | rejected: accuracy/source-age/coverage gaps |
| L2 | G9, G7, G30 | 522.258 | 266.178 | rejected: accuracy/source-age/coverage gaps |
| L3 | G9, G30 | 523.137 | 265.299 | rejected: accuracy/source-age/coverage gaps |
| L4 | G11, G30 | 554.031 | 234.405 | rejected: accuracy/source-age/coverage gaps |
| L5 | G16, G11, G30 | 552.652 | 235.784 | rejected: accuracy/source-age/coverage gaps |

The URA baseline is 788.436 km². These area differences include omitted islands, clipping, unresolved inland water and trace/registration error; they are **not measured reclamation areas**. Areas use a local equirectangular shoelace calculation. `work/coast-report.json` is the measured record.

Final frozen topology has 237418 bytes (the 200 KiB coastal asset budget is **failed**), six dated land features and the existing replacement mask; the optional `coast-today` line is omitted to reduce size. The source comparisons still draw today's coast as a dashed diagnostic line. Shared topology is simplified at 10 m Douglas–Peucker tolerance after normalizing input precision to 1e−7 degrees; each temporal layer is cleaned independently, quantized to 100000, then cleaned at 0.00001-degree snapping. A 0.005 km² island/sliver filter removes tiny ink/clip fragments, another documented coverage loss. Global cleaning of overlapping temporal polygons is deliberately avoided because it erases earlier eras. The final check is **rings 39, zero-area 0, self-crossing 0**. `work/coast-L#.geojson` is rewritten from the decoded final TopoJSON so keyframe clipping uses exactly the published coastline.

Six side-by-side review plates are written to `docs/screenshots/singapore-1819-1965/coast-L#.png`; All six were visually inspected. The source panel has a different scale and is labelled accordingly; overlays from the tracing stage assess printed-ink adherence. Neither ring validity nor file size implies historical accuracy.

## First-pass whole-island fits (archived; superseded)

The following control tables and paragraphs preserve the rejected first-pass candidate set; they are not the active controls. Active G9/G11/G16 inputs and before→after metrics are in SECOND-PASS-COAST.md. `georef-fit.ts` evaluates the shared `fit.ts` projection candidates with `projection: auto`; the chosen model minimizes leave-one-out RMS. Control coordinates below come from named modern capes/peaks in `raw/control-island-osm.json` (coordinate controls only). Their continuity with the historical labels is not independently established. For G16, nine external points are unnamed Warper controls, so its nominal count does **not** satisfy sixteen qualified surviving-feature points.

| Map | Candidate CP | Selected model | Fit RMS / max (m) | Leave-one-out RMS / max (m) | Printed-shoreline ink share | Result |
|---|---:|---|---:|---:|---|---|
| G9 | 16 | mercator+affine | 189.70 / 359.50 | 232.84 / 440.71 | 94%, 95%, 94%, 95% across four connected parts | accuracy budget failed |
| G11 | 16 | mercator+affine | 145.59 / 290.67 | 177.64 / 353.96 | 87% | accuracy budget failed |
| G16 | 16 | equirectangular+affine | 139.15 / 386.61 | 160.24 / 425.96 | 78% | accuracy budget failed |

G9 fails the early whole-island 150/300 m and L3 40/80 m budgets. G11 fails the L4 30/60 m budget. G16 fails the L5 30/60 m budget and qualified-point count; its 78% ink share also fails solid-line tracing acceptance. G11's 87% fails that ink criterion too. The nine-point Warper-only diagnostic (`georef-G16-warper.json`) yields fit 81.31/132.13 m and leave-one-out 125.87/205.25 m, but is not a qualifying replacement.

G9 source-pixel shoreline guides were derived by `coast-segment.py` from the original RGB land/water classes, split into four parts because a closed single-part path is unsuitable for the current shared line simplifier. G11 guides likewise follow the printed land/water colour boundary; only the Singapore coast arc between the causeway ends is retained, closed through Johor outside URA Singapore land. G16's global grayscale classification was rejected. Its actual trace uses the geographically projected G11 printed coast as **search guides**, then snaps to G16 original ink with shared `lines.ts`; stipple, soundings or the earlier coast can be mistaken for the intended shoreline. This is an explicit failed independent-verification condition.

Current tracing runs the unchanged shared `scripts/geo/lib/lines.ts --topic singapore-1819-1965` directly on merged `lines.json`. `coast-inputs.ts` selects its named outputs; `river-bank-inputs.ts` retains separately inspected source-pixel bank polygons. Shoreline-ink percentages alone do not prove bank or coast identity. The old wrapper and separate coast recipe files are retired.

### G9: first-pass controls (archived)

| Feature candidate | Original pixel x, y | WGS84 longitude, latitude |
|---|---|---|
| Tanjong Buloh | 3020, 1470 | 103.730281, 1.4490131 |
| Tanjong Gedong | 1873, 2008 | 103.6756751, 1.4253172 |
| Tanjong Irau | 5538, 1378 | 103.8499021, 1.4512352 |
| Tanjong Changi | 8302, 2588 | 103.9865343, 1.3928616 |
| Tanjong Batu Kekek | 7680, 2088 | 103.955389, 1.4189142 |
| Tanjong Tajam | 7057, 2008 | 103.9269082, 1.423175 |
| Tanjong Chek Jawa | 8390, 2260 | 103.9921622, 1.4081417 |
| Tanjong Berlayer | 4584, 5309 | 103.8051074, 1.2622889 |
| Tanjong Rimau | 4630, 5443 | 103.8066725, 1.2597496 |
| Bukit Timah Hill | 3936, 3378 | 103.7763724, 1.3546901 |
| Mount Faber | 4837, 5093 | 103.817645, 1.2735672 |
| Fort Canning Hill | 5406, 4656 | 103.8465965, 1.293576 |
| Pearl's Hill | 5300, 4853 | 103.8399396, 1.2845482 |
| Bukit Gombak | 3573, 3230 | 103.7577303, 1.3653968 |
| Bukit Batok | 3749, 3485 | 103.7653798, 1.3517702 |
| Mount Serapong | 5175, 5557 | 103.8332569, 1.2498869 |

### G11: first-pass controls (archived)

| Feature candidate | Original pixel x, y | WGS84 longitude, latitude |
|---|---|---|
| Tanjong Buloh | 2453, 1636 | 103.730281, 1.4490131 |
| Tanjong Gedong | 1444, 2100 | 103.6756751, 1.4253172 |
| Tanjong Irau | 4759, 1642 | 103.8499021, 1.4512352 |
| Tanjong Changi | 7247, 2718 | 103.9865343, 1.3928616 |
| Tanjong Batu Kekek | 6683, 2236 | 103.955389, 1.4189142 |
| Tanjong Tajam | 6158, 2167 | 103.9269082, 1.423175 |
| Tanjong Chek Jawa | 7367, 2448 | 103.9921622, 1.4081417 |
| Tanjong Berlayer | 3880, 5135 | 103.8051074, 1.2622889 |
| Tanjong Rimau | 3903, 5207 | 103.8066725, 1.2597496 |
| Bukit Timah Hill | 3340, 3458 | 103.7763724, 1.3546901 |
| Mount Faber | 4090, 4974 | 103.817645, 1.2735672 |
| Fort Canning Hill | 4646, 4550 | 103.8465965, 1.293576 |
| Pearl's Hill | 4522, 4701 | 103.8399396, 1.2845482 |
| Bukit Gombak | 2980, 3241 | 103.7577303, 1.3653968 |
| Bukit Batok | 3117, 3485 | 103.7653798, 1.3517702 |
| Mount Serapong | 4407, 5398 | 103.8332569, 1.2498869 |

### G16: first-pass controls (archived)

| Feature candidate | Original pixel x, y | WGS84 longitude, latitude |
|---|---|---|
| Warper5112 point1, unnamed; not verified survivingfeature | 14147.46622984, 5014.601814512 | 103.9868241515, 1.3933882328 |
| Warper5112 point2, unnamed; not verified survivingfeature | 2701.5887096776, 6486.891129025 | 103.443049189, 1.326040844 |
| Warper5112 point3, unnamed; not verified survivingfeature | 2588.7036290306, 13635.004032250501 | 103.4364831413, 0.9878515502 |
| Warper5112 point4, unnamed; not verified survivingfeature | 14028.362903224, 13845.4677419302 | 103.9819371665, 0.9756653817 |
| Warper5112 point5, unnamed; not verified survivingfeature | 25899.472782258, 9014.368951607099 | 104.5470893348, 1.2029038228 |
| Warper5112 point6, unnamed; not verified survivingfeature | 22924.759576615, 6342.436491926999 | 104.4055438008, 1.3293551643 |
| Warper5112 point7, unnamed; not verified survivingfeature | 20339.882560484, 5470.925403220001 | 104.283205566, 1.371824188 |
| Warper5112 point8, unnamed; not verified survivingfeature | 23003.683467739, 14170.7298387109 | 104.4095584976, 0.9597375856 |
| Warper5112 point9, unnamed; not verified survivingfeature | 15293.044979772, 2863.0874251759997 | 104.0404865372, 1.4955394363 |
| Tanjong Buloh | 8758, 3858 | 103.730281, 1.4490131 |
| Tanjong Irau | 11266, 3803 | 103.8499021, 1.4512352 |
| Tanjong Tajam | 12853, 4390 | 103.9269082, 1.423175 |
| Tanjong Chek Jawa | 14165, 4703 | 103.9921622, 1.4081417 |
| Bukit Timah Hill | 9683, 5845 | 103.7763724, 1.3546901 |
| Mount Faber | 10588, 7568 | 103.817645, 1.2735672 |
| Fort Canning Hill | 11181, 7108 | 103.8465965, 1.293576 |

### Jackson Plan K2 trace provenance

The parent topic workflow uses `jackson.ts` → `lines.json` → unchanged shared `lines.ts`: nine printed divisions mapped to eight holders, with Native Cantonment and Cantonment combined. `jackson-legend.json` records the printed wording and semantic gaps. Every K2 division is approximate because of proposed-plan interpretation and control-point continuity. The original is monochrome, so these are printed-line classes, not an invented colour legend. Source-pixel review: `docs/screenshots/singapore-1819-1965/geo-K2-traces.png`; selected-ink shares are 90–100% (Government minimum 90%, Bugis 91%, Kampong Glam 94%, Chinese 99–100%). Exact division-line geometry is in parent `work/svg-lines.geojson`; fit and trace logs are retained in `work/lines-fit.json` and `work/jackson-lines.log`.

## Licence obligations

Second-pass additions: G32 is URA Master Plan 2019 Land Use WATERBODY (Singapore Open Data Licence 1.0); G33 is an OSM named-reservoir overlap selector only, with no copied OSM boundary geometry; G34 is Stanford’s public-domain 1903 British North Borneo map (Library of Congress g8033s.ct001930), qualified in [SECOND-PASS-BORDERS.md](SECOND-PASS-BORDERS.md). Contains information from URA Master Plan 2019 Land Use accessed on 17 October 2026 from data.gov.sg which is made available under the terms of the Singapore Open Data Licence version 1.0 (https://data.gov.sg/open-data-licence). © OpenStreetMap contributors, ODbL 1.0, selector/control attribution only.

G30 attribution: **Contains information from URA Master Plan 2019 Planning Area Boundary (No Sea) accessed on 2026-10-17 from data.gov.sg which is made available under the terms of the Singapore Open Data Licence version 1.0.** Licence: https://data.gov.sg/open-data-licence. Natural Earth is public domain. Exact Commons file-page licence-template text is listed below; rights concerns are recorded above and those sources excluded from trace output.

<!-- BEGIN FETCH SURVEY -->
### G1 · File:Plan of the Town of Singapore (1822) by Lieutenant Philip Jackson original.jpg

Source page: https://commons.wikimedia.org/wiki/File%3APlan_of_the_Town_of_Singapore_(1822)_by_Lieutenant_Philip_Jackson_original.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/b/bc/Plan_of_the_Town_of_Singapore_%281822%29_by_Lieutenant_Philip_Jackson_original.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Lieutenant Philip Jackson. Size: 1846 × 1127 pixels; 1032765 bytes. SHA-256: `6ecf50108c5dab0a0db493e7560d7b9e817f30f6092be94736e1596177edc4cc`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-old-100-1923}}
```

### G2 · File:Plan of the British settlement of Singapore published 1828.jpg

Source page: https://commons.wikimedia.org/wiki/File%3APlan_of_the_British_settlement_of_Singapore_published_1828.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/4/44/Plan_of_the_British_settlement_of_Singapore_published_1828.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: John Crawfurd. Size: 1566 × 2035 pixels; 2064680 bytes. SHA-256: `9b869866c4bdca90ac2b2f1f5c5c85c12a95ce775ff85db1ac0a48c7d55e4d0c`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-old-70-1923}}
```

### G3 · File:Part of Singapore Island (British Library India Office Records, 1825, detail).jpg

Source page: https://commons.wikimedia.org/wiki/File%3APart_of_Singapore_Island_(British_Library_India_Office_Records%2C_1825%2C_detail).jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/9/9f/Part_of_Singapore_Island_%28British_Library_India_Office_Records%2C_1825%2C_detail%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Unknown authorUnknown author.. Size: 3395 × 2256 pixels; 2340979 bytes. SHA-256: `53632c93fed59d9f4a60360b8adf84f53506b7c6513ca9e56cb0e16ba3bf6522`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-old-70-1923}}
```

### G4 · File:Singapore Environs 1839.jpg

Source page: https://commons.wikimedia.org/wiki/File%3ASingapore_Environs_1839.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/e/e6/Singapore_Environs_1839.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: G.D. Coleman. Size: 1536 × 1136 pixels; 395573 bytes. SHA-256: `1cf21036223d63c6bdb8234cd00524d04b96fa35a7074cf9fbbfc77c14592a9e`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-old}}
```

### G5 · File:Admiralty Chart No 2404 Strait of Singapore Sheet 3 Surveyed by J.T. Thomson Esq. Government Survr. 1846-54, Published 1855, Corrections to 1866.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AAdmiralty_Chart_No_2404_Strait_of_Singapore_Sheet_3_Surveyed_by_J.T._Thomson_Esq._Government_Survr._1846-54%2C_Published_1855%2C_Corrections_to_1866.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/3/32/Admiralty_Chart_No_2404_Strait_of_Singapore_Sheet_3_Surveyed_by_J.T._Thomson_Esq._Government_Survr._1846-54%2C_Published_1855%2C_Corrections_to_1866.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: United Kingdom Hydrographic Office. Size: 15357 × 11856 pixels; 24197160 bytes. SHA-256: `603e3d6cb9f1d96cb74bf54cf0aedaebce03092a3082a8845be4b5aac9f9c0b4`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-UKGov}}
```

### G6 · File:Singapore town centre 1879 plan.jpg

Source page: https://commons.wikimedia.org/wiki/File%3ASingapore_town_centre_1879_plan.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/1/1e/Singapore_town_centre_1879_plan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Unknown authorUnknown author. Size: 5268 × 3394 pixels; 1910050 bytes. SHA-256: `5acfdc7bf359db8e313770fadbbee22d71bdf311791fc6c9cd75574c5bc269c7`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-US-expired}}
```

### G7 · File:Plan map of the City of Singapore of British Malaya, from the Constable's Hand Atlas of India (1893).jpg

Source page: https://commons.wikimedia.org/wiki/File%3APlan_map_of_the_City_of_Singapore_of_British_Malaya%2C_from_the_Constable's_Hand_Atlas_of_India_(1893).jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/1/18/Plan_map_of_the_City_of_Singapore_of_British_Malaya%2C_from_the_Constable%27s_Hand_Atlas_of_India_%281893%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: The Edinburgh Geographical Institute / John Bartholomew and Co.. Size: 2980 × 2312 pixels; 1172891 bytes. SHA-256: `191f6841f986ad848571052dfb27dacf5eed8bad52015c35eff4cb3d4d33b2a8`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-old-70}}
```

### G8 · File:Guide map of Singapore Town from The Stranger's Guide to Singapore (1890).jpg

Source page: https://commons.wikimedia.org/wiki/File%3AGuide_map_of_Singapore_Town_from_The_Stranger's_Guide_to_Singapore_(1890).jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/c/cf/Guide_map_of_Singapore_Town_from_The_Stranger%27s_Guide_to_Singapore_%281890%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Unknown authorUnknown author.. Size: 4964 × 4411 pixels; 3948247 bytes. SHA-256: `4775e604a45f0333a82c14c1877e85621efb24491ea609135eeb6f6a93ac25cd`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-SG-artisticwork}}
{{FlickrVerifiedByUploadWizard|Flickr-no known copyright restrictions}}
{{Flickr-no known copyright restrictions}}
```

### G9 · File:Map of the island of Singapore and its dependencies - btv1b53064721c.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AMap_of_the_island_of_Singapore_and_its_dependencies_-_btv1b53064721c.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/2/2c/Map_of_the_island_of_Singapore_and_its_dependencies_-_btv1b53064721c.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Grande-Bretagne. War office. Auteur du texte. Size: 11234 × 8203 pixels; 11083956 bytes. SHA-256: `363819236e3a03160060fe718c9d4faca1edc2e41384c595ec9636d455d2a65e`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-US-expired}}
{{PD-France}}
```

### G10 · File:Admiralty Chart No 1995 Singapore Road, China Sea, Published 1925.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AAdmiralty_Chart_No_1995_Singapore_Road%2C_China_Sea%2C_Published_1925.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/6/6d/Admiralty_Chart_No_1995_Singapore_Road%2C_China_Sea%2C_Published_1925.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: United Kingdom Hydrographic Office. Size: 8363 × 13628 pixels; 31214674 bytes. SHA-256: `d4c236192c301cc956ca9aaa05076ffef56842dde74939a3f342ff0ec0d7da99`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-UKGov}}
```

### G11 · File:Map by the US Army Map Service - Singapore Island - singapore and johore - txu-pclmaps-oclc-37163037-east.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AMap_by_the_US_Army_Map_Service_-_Singapore_Island_-_singapore_and_johore_-_txu-pclmaps-oclc-37163037-east.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/a/af/Map_by_the_US_Army_Map_Service_-_Singapore_Island_-_singapore_and_johore_-_txu-pclmaps-oclc-37163037-east.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: United States Army Map Service. Size: 8016 × 6993 pixels; 17350749 bytes. SHA-256: `fdf4d9ff4b4480383b9c0d772b0e5a10bca0867511e11d195b753155b76892b5`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-USGov-Military}}
```

### G12 · File:Map by the US Army Map Service - Singapore Pulai Forest Reserve - singapore and johore - txu-pclmaps-oclc-37163037-west.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AMap_by_the_US_Army_Map_Service_-_Singapore_Pulai_Forest_Reserve_-_singapore_and_johore_-_txu-pclmaps-oclc-37163037-west.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/8/81/Map_by_the_US_Army_Map_Service_-_Singapore_Pulai_Forest_Reserve_-_singapore_and_johore_-_txu-pclmaps-oclc-37163037-west.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: United States Army Map Service. Size: 4406 × 5044 pixels; 4641145 bytes. SHA-256: `64a7fb50ccab796f67f7dfa33c65ac60b8f7e21b28400ae6737e5ab72db6acac`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-USGov-Military}}
```

### G13 · File:Telok Ayer Singapore 1932.png

Source page: https://commons.wikimedia.org/wiki/File%3ATelok_Ayer_Singapore_1932.png

Original/download API: https://upload.wikimedia.org/wikipedia/commons/6/67/Telok_Ayer_Singapore_1932.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Federated Malay States Survey Department 1932. Map of Business Area Singapore, 1:6,336. Publisher not given. In: "Historical Maps of Singapore, digitised by Department of Geography, National University of Singapore." https://libmaps.nus.edu.sg.. Size: 593 × 600 pixels; 712991 bytes. SHA-256: `cb781ec2377811b2e082346c47a8a7e81c48e80bd4de05f425b6462ff0451289`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-author|author}}
Rights and Restrictions None see https://libmaps.nus.edu.sg/metadata/1932.xml
```

### G14 · File:Admiralty Chart No 2014 Eastern Approaches to Selat Jurong, Published 1966.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AAdmiralty_Chart_No_2014_Eastern_Approaches_to_Selat_Jurong%2C_Published_1966.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/4/43/Admiralty_Chart_No_2014_Eastern_Approaches_to_Selat_Jurong%2C_Published_1966.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: United Kingdom Hydrographic Office. Size: 8545 × 11143 pixels; 19484615 bytes. SHA-256: `738c875867e607407cb3abc252f2df40299959cc702c7352f616ad853c215096`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-UKGov}}
```

### G15 · File:Admiralty Chart No 2587 Western Portion of Johore Strait, Published 1966.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AAdmiralty_Chart_No_2587_Western_Portion_of_Johore_Strait%2C_Published_1966.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/9/9b/Admiralty_Chart_No_2587_Western_Portion_of_Johore_Strait%2C_Published_1966.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: United Kingdom Hydrographic Office. Size: 11171 × 16275 pixels; 42370957 bytes. SHA-256: `bc00c000e109733955769626d78263f04d48afd95ce32b5f97729580f80fa407`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-UKGov}}
```

### G16 · File:Admiralty Chart No 2403 Singapore Strait, Published 1936.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AAdmiralty_Chart_No_2403_Singapore_Strait%2C_Published_1936.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/7/74/Admiralty_Chart_No_2403_Singapore_Strait%2C_Published_1936.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: United Kingdom Hydrographic Office. Size: 27521 × 16456 pixels; 94732817 bytes. SHA-256: `2d9bfea7b4e0abd965d61f106322b3adfc9843bb4e2ec52646482b80057d3ba0`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-UKGov}}
```

### G17 · File:Admiralty Chart No 2586 Eastern Portion of Johore Strait (Singapore Old Strait) Uulau Ubin to Sungei Kranji Surveyed By Commander J.A. Edgell O.B.E. R.N. & The Officers of the Surveying Ship Merlin 1921, Published 1924. Corrections to 1954.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AAdmiralty_Chart_No_2586_Eastern_Portion_of_Johore_Strait_(Singapore_Old_Strait)_Uulau_Ubin_to_Sungei_Kranji_Surveyed_By_Commander_J.A._Edgell_O.B.E._R.N._%26_The_Officers_of_the_Surveying_Ship_Merlin_1921%2C_Published_1924._Corrections_to_1954.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/6/69/Admiralty_Chart_No_2586_Eastern_Portion_of_Johore_Strait_%28Singapore_Old_Strait%29_Uulau_Ubin_to_Sungei_Kranji_Surveyed_By_Commander_J.A._Edgell_O.B.E._R.N._%26_The_Officers_of_the_Surveying_Ship_Merlin_1921%2C_Published_1924._Corrections_to_1954.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: United Kingdom Hydrographic Office. Size: 31214 × 16748 pixels; 146426813 bytes. SHA-256: `10179d46d00f5e2668ddc90571b6c6723863cea8dfc335e4c48209a4840c27e0`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-UKGov}}
```

### G18 · File:Map of Singapore from The State of Singapore (BIS, 1959).jpg

Source page: https://commons.wikimedia.org/wiki/File%3AMap_of_Singapore_from_The_State_of_Singapore_(BIS%2C_1959).jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/f/f0/Map_of_Singapore_from_The_State_of_Singapore_%28BIS%2C_1959%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: British Information Services. Size: 3176 × 1994 pixels; 2606903 bytes. SHA-256: `67bece7ece9b1d0529326f33013d4ca8dd8f12905ac44f34d55446a2e7559fbf`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-UKGov}}
```

### G19 · File:Map of Singapore City in 1951.png

Source page: https://commons.wikimedia.org/wiki/File%3AMap_of_Singapore_City_in_1951.png

Original/download API: https://upload.wikimedia.org/wikipedia/commons/6/66/Map_of_Singapore_City_in_1951.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Survey Department Federation of Malaya. Size: 2623 × 3603 pixels; 18551521 bytes. SHA-256: `7a77f226abc323d1cae54eb0dbdfe9ce6efdf99755573b2951ac02d9246deccd`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-old-70}}
```

### G20 · File:Singapore Map - 1945.jpg

Source page: https://commons.wikimedia.org/wiki/File%3ASingapore_Map_-_1945.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/d/d1/Singapore_Map_-_1945.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Terry Fitzpatrick (Tfitzp (talk)). Size: 7820 × 6080 pixels; 20624995 bytes. SHA-256: `d846619fcb41c30655657c7a0120b116eadc26eaad32d8607b68680ee0ee5526`.

File-page licence-template text (category tags omitted):

```wikitext
{{self|cc-by-sa-4.0}}
{{PD-UKGov}}
```

### G21 · ne_10m_admin_1_states_provinces.geojson

Source page: https://www.naturalearthdata.com/about/terms-of-use/

Original/download API: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson

Author: Natural Earth. Size: vector dataset; pixel size not applicable; 40726851 bytes. SHA-256: `22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5`.

File-page licence-template text (category tags omitted):

```wikitext
All versions of Natural Earth raster + vector map data found on this website are in the public domain.
```

### G22 · ne_10m_admin_0_countries.geojson

Source page: https://www.naturalearthdata.com/about/terms-of-use/

Original/download API: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson

Author: Natural Earth. Size: vector dataset; pixel size not applicable; 13287234 bytes. SHA-256: `239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255`.

File-page licence-template text (category tags omitted):

```wikitext
All versions of Natural Earth raster + vector map data found on this website are in the public domain.
```

### G23 · File:A Map of Malay peninsula compiled by and published for the straits branch of the royal asiatic Society, Singapore 1898 - btv1b53029747c.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AA_Map_of_Malay_peninsula_compiled_by_and_published_for_the_straits_branch_of_the_royal_asiatic_Society%2C_Singapore_1898_-_btv1b53029747c.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/b/b5/A_Map_of_Malay_peninsula_compiled_by_and_published_for_the_straits_branch_of_the_royal_asiatic_Society%2C_Singapore_1898_-_btv1b53029747c.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: . Size: 15614 × 20593 pixels; 40219069 bytes. SHA-256: `f4e3626af3bd43256648407cc2b6cfa8ee73e349a3c1c9ab60dfee49cb430a91`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-US-expired}}
{{PD-France}}
```

### G24 · File:Map of the Straits Settlements of British Malaya, from the Constable's Hand Atlas of India (1893).jpg

Source page: https://commons.wikimedia.org/wiki/File%3AMap_of_the_Straits_Settlements_of_British_Malaya%2C_from_the_Constable's_Hand_Atlas_of_India_(1893).jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/0/0f/Map_of_the_Straits_Settlements_of_British_Malaya%2C_from_the_Constable%27s_Hand_Atlas_of_India_%281893%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: The Edinburgh Geographical Institute / John Bartholomew and Co.. Size: 2973 × 2333 pixels; 1155423 bytes. SHA-256: `c457a0c96591dfc2689431e6c88043d792ae9944479f3b325731647a54e9605c`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-old-70}}
```

### G25 · File:Penang, Province Wellesley, The Dindings.jpg

Source page: https://commons.wikimedia.org/wiki/File%3APenang%2C_Province_Wellesley%2C_The_Dindings.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/f/f8/Penang%2C_Province_Wellesley%2C_The_Dindings.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Unknown (late 19th century map). Size: 459 × 628 pixels; 186107 bytes. SHA-256: `27956296ad2bd886bceb89382d6a71681db0b2b2173fcf69db24329469836a7c`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-old-70}}
```

### G26 · File:Federation of Malaya and the Crown Colony of Singapore - DPLA - 9a3e01bd9fb8173d4f0e50f8b4343347.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AFederation_of_Malaya_and_the_Crown_Colony_of_Singapore_-_DPLA_-_9a3e01bd9fb8173d4f0e50f8b4343347.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/f/f8/Federation_of_Malaya_and_the_Crown_Colony_of_Singapore_-_DPLA_-_9a3e01bd9fb8173d4f0e50f8b4343347.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Central Intelligence Agency. Size: 2554 × 3280 pixels; 8208711 bytes. SHA-256: `6a0aa5430ed12316c9ada7c757020cf4f1d47fe6545ad3f153c8e03c753b9de3`.

File-page licence-template text (category tags omitted):

```wikitext
== {{int:filedesc}} ==
 {{ Artwork
   | Other fields 1 = {{ InFi | Creator | Central Intelligence Agency. 12/4/1981 }}
   | title = Federation of Malaya and the Crown Colony of Singapore
   | description = Today part of Malaysia.
   | date = 
   | permission = {{PD-USGov-CIA}}
   | author = Central Intelligence Agency
   | source = {{ DPLA
       | Q59661038
       | hub = National Archives and Records Administration
       | url = http://catalog.archives.gov/id/266782382
       | dpla_id = 9a3e01bd9fb8173d4f0e50f8b4343347
       | local_id = 266782382
   }}
   | Institution = {{ Institution | wikidata = Q59661038 }}
   | Other fields = {{ InFi | Standardized rights statement | {{ rights statement | http://rightsstatements.org/vocab/NoC-US/1.0/ }} }}
 }}
```

### G27 · File:Federation of Malaysia, 1963.jpg

Source page: https://commons.wikimedia.org/wiki/File%3AFederation_of_Malaysia%2C_1963.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/d/dd/Federation_of_Malaysia%2C_1963.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Robert M. Chapin. Size: 2164 × 885 pixels; 573043 bytes. SHA-256: `211be8ba336104e58140cc38ce9f1337bba4c4f9002eae689ebd88812b15405f`.

File-page licence-template text (category tags omitted):

```wikitext
{{PD-US-not renewed}}
```

### G29 · File:1828 - Karte von der Insel Singapur.jpg

Source page: https://commons.wikimedia.org/wiki/File%3A1828_-_Karte_von_der_Insel_Singapur.jpg

Original/download API: https://upload.wikimedia.org/wikipedia/commons/f/f6/1828_-_Karte_von_der_Insel_Singapur.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original

Author: Berghaus, Heinrich Karl Wilhelm. Size: 3735 × 2726 pixels; 2911278 bytes. SHA-256: `3ec368c2904230310436d4b09b0f8dd2500f144e6000a459dd78a9ce1882810a`.

File-page licence-template text (category tags omitted):

```wikitext
{{cc-zero}}
```

### G30 · URA Master Plan 2019 Planning Area Boundary (No Sea)

Source page: https://data.gov.sg/datasets/d_4765db0e87b9c86336792efe8a1f7a66/view

Original/download API: https://api-open.data.gov.sg/v1/public/api/datasets/d_4765db0e87b9c86336792efe8a1f7a66/poll-download

Author: Urban Redevelopment Authority. Size: vector dataset; pixel size not applicable; 2092229 bytes. SHA-256: `f23856251b467089f788d0fff72ef5a38e753f21aa69b4352401d7ed50d380cc`.

File-page licence-template text (category tags omitted):

```wikitext
Contains information from URA Master Plan 2019 Planning Area Boundary (No Sea) accessed on 2026-10-17 from data.gov.sg which is made available under the terms of the Singapore Open Data Licence version 1.0
```

<!-- END FETCH SURVEY -->

<!-- BEGIN PARENT GEOGRAPHIC AUDIT -->
## Integrated control-point and source audit

The standalone check renderer is check.ts; it substitutes the dated published coast into its basemap. It invokes the unchanged shared geo renderer and does not build or shoot the application. K2 and K19 were composed and visually compared with their source images before the other frames. These comparisons expose gaps; they do not constitute geographic acceptance.

The topic uses shared local-land.ts and simplify.ts. Dated outline/minus/plus recipes, source IDs, inland water exclusions and the dashed current coast are configured in sources.json pipeline.localLand. Shared shorelines are stored once in the coast topology; published eras are decoded for compose. The topic keyframes.ts adapter decodes the existing 10m land asset, invokes shared compose and copies hold files verbatim. Regional recipes intersect actual 10m land inside the coast exclusion box. Shared simplify reads the fixed 5 m Singapore focus and the wider regional focus. Retired local coasts.ts/simplify.ts and their separate coast JSON recipes must not be restored. Current size and area measurements, historical acceptance and completed boundary corrections are recorded in the Second pass section of CODEX-REPORT.md.

G1 is a proposed plan, not observed 1819 land. G4 is 1839 rather than 1823. G7 is 1893 rather than 1887. G9 and G11 substitute for early areas outside town coverage. G16's 1954 corrections do not establish 1961 Jurong reclamation. No detached modern island fallback remains in historical land; untraced historical detached islands are omitted. No historical land now gone has been restored. These are substantive unfinished geography, not engine errors.

The first-pass G1/G4 river-bank trial was rejected after source-image inspection: a high share on dark ink concealed paths along adjacent streets. Any replacement bank trace must be reviewed against the raster itself. Current river-bank coverage is recorded in the Second pass report. Numeric ink shares describe colour agreement, not proof that every pixel is shoreline. Rejected trial previews/logs remain in ignored work/.

G23 has no Borneo coverage. Limbang was annexed in 1890 and belongs in 1896 Sarawak; Lawas was acquired in 1905 and must be excluded until then. Dindings now uses the qualified G23 source trace; the 1896 Lawas exclusion uses G34, preserving Trusan and Limbang. The separate Second pass report records which source traces and administrative-piece corrections have been completed; this generated CP table does not certify them. No bbox or invented polygon substitutes for a historical boundary.

G23's state comparison is geo-G23-state-audit.png: green is Natural Earth, orange dots are independently read named-town controls. The G23 border audit now applies source traces to the mismatches documented in SECOND-PASS-BORDERS.md. A named-town fit is a registration comparison; town-symbol centres and generalized Natural Earth city points have their own correspondence uncertainty.

OSM CP coordinate extract: © OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright); registration only, with no OSM boundary/road/coast geometry in published data. Natural Earth town controls are public domain; their dataset SHA-256 and NE_ID values are retained in georef-G23-landmarks.json.

### Measured maps

| Map | CP count | Selected model | Fit RMS / max (m) | Leave-one-out RMS / max (m) | Acceptance limitation |
|---|---:|---|---|---|---|
| G1 | 12 | laea(103.9,1.3)+affine | 42.22 / 87.43 | 58.39 / 113.58 | Proposed town plan; assess junction continuity and the 1819 backcast separately. |
| G2 | 4 | equirectangular+affine | 2287.25 / 2799.99 | not measured / not measured | Four-point diagnostic source, not used as output geometry. |
| G4 | 12 | mercator+affine | 44.39 / 75.78 | 60.16 / 103.47 | 1839 source used for the earlier era; assess junction continuity separately. |
| G7 | 12 | mercator+affine | 24.02 / 49.94 | 32.77 / 63.31 | 1893 source substituted for 1887; source coverage needs independent review. |
| G9 | 18 | equirectangular+affine | 69.79 / 153.31 | 107.71 / 243.91 | Whole-island budget: RMS 40 m, max 80 m; point identities and source shoreline require review. |
| G11 | 18 | equirectangular+affine | 61.91 / 124.73 | 77.78 / 146.13 | Whole-island budget: RMS 30 m, max 60 m; point identities and source shoreline require review. |
| G15 | 12 | equirectangular+affine | 3.22 / 4.84 | 4.40 / 7.54 | Internal printed graticule only; chart datum and external accuracy unmeasured; western splice only. |
| G16 | 6 | mercator+affine | 41.16 / 53.69 | 152.53 / 289.29 | Whole-island budget: RMS 30 m, max 60 m; 1954/1961 source-age gap and external control identities require review. |
| G23 | 12 | mercator+affine | 1801.42 / 2813.53 | 2447.51 / 4829.04 | External town-centre registration; historical state-boundary acceptance is separate. |

Maps without a measured georeferencing model (RMS/max **not measured**, never zero): G3, G5, G6, G8, G10, G12, G13, G14, G17, G18, G19, G20, G24, G25, G26, G27 and G29. They are downloaded sources or comparisons; no claim is made that all specified map reconstruction work was completed. G21/G22/G30/G32 are vector datasets; G33 is a selector only. G34 internal graticule residuals are recorded in SECOND-PASS-BORDERS.md and are not external accuracy. Raster CP residual is not applicable to those vector datasets/selectors.

### Pixel and geographic control coordinates

The table records shared fit.ts results; the input projection and control evidence are retained in each georef JSON. Model selection uses leave-one-out residuals, with projection:auto required for newly qualified source fits. Pixel coordinates below refer to the input raster specified in each georef JSON. G23 uses the quarter raster, with native pixels additionally preserved in its landmark file. Ambiguous control identities must be removed on evidence grounds; residuals alone cannot establish identity. See the Second pass report for control changes.

#### G2

Current named peaks/capes from raw/control-island-osm.json. CP only.

| Feature | Raster x, y | WGS84 longitude, latitude |
|---|---|---|
| Bukit Timah summit | 581, 378 | 103.7763724, 1.3546901 |
| Tanjong Changi | 1204, 433 | 103.9865343, 1.3928616 |
| Tanjong Pasir Laba | 230, 527 | 103.641158, 1.35676 |
| Singapore hill flagstaff / Fort Canning summit candidate | 828, 659 | 103.8465965, 1.293576 |

#### G4

OpenStreetMap highway shared-node extract, GET Overpass API, 2026-10-17, raw/control-roads-osm.json; CP only; no OSM geometry permitted in outputs

| Feature | Raster x, y | WGS84 longitude, latitude |
|---|---|---|
| Bridge Street river crossing / later Elgin Bridge centre | 365, 575 | 103.8493033, 1.2890664 |
| North Bridge Road / High Street | 402, 571 | 103.850015, 1.2901963 |
| North Bridge Road / Coleman Street | 471, 572 | 103.8509674, 1.2917649 |
| North Bridge Road / Stamford Road canal | 532, 572 | 103.8520429, 1.2935887 |
| North Bridge Road / Bras Basah Road | 590, 573 | 103.8531036, 1.2951261 |
| Beach Road / Bras Basah Road | 591, 634 | 103.8546543, 1.2939345 |
| North Bridge Road / Middle Road | 675, 575 | 103.8549985, 1.2976349 |
| Beach Road / Middle Road | 673, 638 | 103.8562528, 1.2965189 |
| North Bridge Road / Arab Street | 834, 583 | 103.8585234, 1.301971 |
| Beach Road / Arab Street | 816, 645 | 103.8599148, 1.3002979 |
| South Bridge Road / Upper Pickering Street | 276, 580 | 103.8471684, 1.2854539 |
| South Bridge Road / Cross Street | 226, 582 | 103.8461028, 1.2836322 |

#### G7

OSM named highway shared nodes from raw/control-roads-osm.json, CP-only; no output geometry

| Feature | Raster x, y | WGS84 longitude, latitude |
|---|---|---|
| Bridge Street river crossing / later Elgin Bridge centre | 1830, 1405 | 103.8493033, 1.2890664 |
| North Bridge Road / High Street | 1920, 1404 | 103.850015, 1.2901963 |
| North Bridge Road / Coleman Street | 2076, 1401 | 103.8509674, 1.2917649 |
| North Bridge Road / Stamford Road canal | 2245, 1400 | 103.8520429, 1.2935887 |
| North Bridge Road / Bras Basah Road | 2389, 1409 | 103.8531036, 1.2951261 |
| Beach Road / Bras Basah Road | 2373, 1570 | 103.8546543, 1.2939345 |
| North Bridge Road / Middle Road | 2657, 1431 | 103.8549985, 1.2976349 |
| Beach Road / Middle Road | 2630, 1575 | 103.8562528, 1.2965189 |
| South Bridge Road / Upper Pickering Street | 1514, 1410 | 103.8471684, 1.2854539 |
| South Bridge Road / Temple Street | 1214, 1412 | 103.8452956, 1.2822174 |
| South Bridge Road / Pagoda Street | 1288, 1412 | 103.8455644, 1.2827013 |
| South Bridge Road / Mosque Street | 1352, 1412 | 103.8458432, 1.283202 |

#### G23

external named-town symbol audit; not exact surveyed surviving-feature control

| Feature | Raster x, y | WGS84 longitude, latitude |
|---|---|---|
| Alor Setar | 1064.25, 1353.5 | 100.372933, 6.113308 |
| Kota Baharu | 2281.5, 1351 | 102.229977, 6.119974 |
| Kuala Terengganu | 2841.5, 1859.5 | 103.12, 5.33041 |
| Taiping | 1302.5, 2183.75 | 100.719991, 4.86496 |
| Ipoh | 1521.75, 2347.25 | 101.064983, 4.599989 |
| Kuala Lipis | 2162.75, 2613.25 | 102.042001, 4.184001 |
| Kuantan | 2968.25, 2838 | 103.320039, 3.829959 |
| Kuala Lumpur | 1906.5, 3282.75 | 101.688699, 3.139797 |
| Seremban | 2072.5, 3555.25 | 101.94002, 2.710492 |
| Malacca | 2281.75, 3897 | 102.246461, 2.206414 |
| Muar | 2475.25, 3997.5 | 102.566597, 2.033738 |
| Teluk Intan | 1508.75, 2723.5 | 101.031445, 4.01186 |

Source-pixel recipes: jackson.ts (planned divisions), town-early.ts (outer G1/G4 water selectors), town-shore.py plus town-shore.ts (G7 colour-seeded shoreline guides), coast-segment.py plus merged lines.json (whole-main-island source ink). Source image-frame closures select water outside the printed shore; they are not historical territory borders. All control geometry is dataset selection, source-pixel tracing and clipping; no OSM shape or hand-drawn geographic polygon is published.
<!-- END PARENT GEOGRAPHIC AUDIT -->
