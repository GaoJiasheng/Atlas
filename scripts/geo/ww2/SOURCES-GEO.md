# WW2 map data — source survey and per-keyframe provenance

Survey done 2026-10-08 for docs/09 §5 (step 2: K1 1937-07-07 and K6 1942-03-09). Every edge in `src/content/topics/ww2/data/control.json` comes from one of the datasets below; nothing is drawn by hand. Reference ids `[G#]` are the same as in the topic's `data/SOURCES.md`.

## 1. Survey

### (a) CShapes 2.0 — [G1]

- **URL**: https://icr.ethz.ch/data/cshapes/ → `CShapes-2.0.geojson` (26 MB; also CSV, Shapefile, SQL, R package). GW (Gleditsch–Ward) and COW variants; we use the GeoJSON of the GW variant.
- **Citation**: Schvitz, Rüegger, Girardin, Cederman, Weidmann, Gleditsch (2022), *Mapping the International System, 1886–2017: The CShapes 2.0 Dataset*, Journal of Conflict Resolution 66(1).
- **License (exact, from the download page)**: "CShapes by Schvitz, Rüegger, Girardin, Cederman, Weidmann, Gleditsch is licensed under a **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**." docs/09 §5.1 says CC BY 4.0 — that is wrong; it is **CC BY-NC-SA 4.0**. Use here is non-commercial: Atlas is a non-commercial family education site. Derived data must keep the attribution and the same licence (see §4).
- **Coverage**: polygons of independent states **and dependent territories (colonies, protectorates, mandates)** with day-precise validity (`gwsyear/gwsmonth/gwsday` … `gweyear/…`; the `gwsdate` string fields are `DD.MM.YYYY` and must not be compared as text). 173 polygons valid on 1937-07-07, 199 on 1942-03-09.
- **Limits for this topic**: GW coding follows recognised sovereignty, so wartime occupation is **not** modelled — Poland, France, Norway, Yugoslavia, Greece, the Baltic states keep (or lose) their de jure polygons; no Manchukuo (China 1921–1945 includes Manchuria); no Kwantung, South Seas Mandate, Hong Kong, Macau, Channel Islands, Guam. Used as the **sovereign / colonial base** for both keyframes.

### (b) OpenHistoricalMap Overpass — [G2]

- **URL**: https://overpass-api.openhistoricalmap.org/api/interpreter (queried by `ohm-export.ts`; results cached in `raw/ohm-<set>.json`).
- **License**: **ODbL 1.0**, © OpenHistoricalMap contributors.
- **Date coverage found** (`ohm-export.ts --list <date>` lists every boundary relation valid on a day):
  - 1937-07-07: *Empire of Japan* r2889894 (1931 – 1939-04-09; home islands, Korea, Taiwan, Karafuto, Kurils, Kwantung, South Seas Mandate), *Manchukuo* r2885965 (1932 – 1945-08-17, includes Rehe), *China* r2694471 (1935 – 1938-07-03, de jure incl. Manchuria and Tibet — not used), *British Hong Kong* r2694575, *Federated Malay States*, *Straits Settlements*, *British Burma*, *British Raj*, *Dutch East Indies*, *Commonwealth of the Philippines*, *Siam*, *Indochinese Union*.
  - 1942-03-09: *Empire of Japan* r2948948 (1939-04-09 – 1945-09-02, adds Spratly/Paracel claims), *Japanese occupation of Malaya* r2801989, *Japanese occupation of Borneo* r2848293 (1942-01-03 – 04-01), *Hong Kong Occupied Territory* r2694574, *Philippine Executive Commission* r2889833, *Thailand* r2874870 (1941-03 –, incl. the 1941 gains from Indochina), *Indochinese Federation* r2745895; Europe: *German Reich* r2692712, *Generalgouvernement*, *Bezirk Bialystok*, *Reichskommissariat Ostland / Ukraine*, *Protectorate of Bohemia and Moravia*, *Military Administration in Belgium and Northern France*, *Territory of the Military Commander in Serbia*, *Independent State of Croatia*, *Slovak Republic*, *Kingdom of Hungary* (1941-12-14), *Kingdom of Romania* (1941-08-19, incl. Transnistria), *Tsardom of Bulgaria* (1941-04-30), *Italy* (1941-04-18), *Italian protectorate of Albania*, *Governorate of Montenegro*, *Greece* (1941-04-30), *Finland* (1940-03-12), Guernsey, Jersey; a dated series of *British Empire* (admin_level 1) snapshots, e.g. 1942-02-15 – 1942-03-23.
  - **Not in OHM** (as of the survey): Japanese-occupied China (no Wang Jingwei / occupation-zone polygon), Japanese occupation extents in the Netherlands East Indies, Burma and the Philippines at a given date, German military-administration areas east of the Reichskommissariats, Axis–Soviet front lines, Burma districts.

### (c) Wikimedia Commons vector maps

| ref | file | author | license | what it shows | used for |
|---|---|---|---|---|---|
| [G3] | `File:Japanese_Occupation_of_China_1940.svg` | Rowanwindwhistler (SVG from `Japanese_Occupation_-_Map.jpg`), Odie5533 (English) | CC BY-SA 3.0 | Japanese-occupied China 1940 (one pink path), 83 city dots | **K6** occupied China (traced) |
| [G5] | `File:World_War_II_in_Europe,_1942_(no_labels).svg` | Goran tek-en | CC BY-SA 4.0 | Reich / German-occupied / allies and client states / nominally unoccupied / Allied / neutral; areas retaken in the 1941–42 Soviet winter offensive (hatched clip paths). **Composite of maximum extents** (Moscow front of Dec 1941 *and* Caucasus–Stalingrad of Nov 1942) | **K6** Europe outside the USSR, Finnish Karelia, Transnistria (traced) |
| [G7] | `File:Eastern_Front_1941-12_to_1942-05-es.svg` | Gdr (PNG), Rowanwindwhistler (SVG) | CC BY-SA 3.0 | Soviet-held area at 1942-05-05 and Soviet gains since 1941-12-05; 75 city dots | **K6** Eastern Front (traced) |
| [G6] | `File:Second_world_war_asia_1937-1942_map-fr.svg` | RedTony, Skimel | CC BY-SA 4.0 | Japanese Empire 1936, Indochina 1940, conquests Dec 1941 – May 1942, maximum extent 1942 | cross-check image for K1 and K6 (not traced: maximum extent, not a dated line) |
| — | `File:Japanese_expansion_april_1942.svg` | Createaccount | CC BY-SA 3.0 | a single perimeter line, April 1942 | not used (no land control) |
| — | `File:Japanese_Empire_-_1942.svg`, `File:Axis_Occupation_of_Europe_(1942).svg`, `File:Europe_1942.svg` | TastyCakes / TRAJAN 117 / Alphathon | CC BY-SA 3.0 | maximum extents, no date | not used |

Public-domain campaign maps used for **dates only** (which units had fallen by 9 March 1942; nothing traced):
[G8] `File:Japanese_advance_in_Burma,_20_January-19_March_1942.jpg` (US Army CMH, Romanus & Sunderland 1953) and [G9] `File:Pacific_War_-_Dutch_East_Indies_1941-42_-_Map.jpg` (USMA Department of History).

### (d) UMN Historical National Boundaries (cross-check)

- Kropelnicki, Johnson, Kne (U-Spatial, University of Minnesota, 2022), handle https://hdl.handle.net/11299/227302; layers 1800, 1914, 1918, **1939, 1945**, 1970, 1990, 2000; Shapefile, 94.8 MB; "may be freely downloaded for research, study, or teaching, but must be cited" (catalogue text).
- **Not obtained**: the repository (conservancy.umn.edu) answered HTTP 403 and the BTAA geoportal record sits behind a browser verification page; the pipeline does not try to get around either. Its dates (1939, 1945) also do not match K1 / K6, so it could only be a coarse cross-check. Fallback: K1 and K6 are cross-checked against [G6] and the dated PD campaign maps [G8], [G9] instead. To add it later, download the zip by hand into `raw/` and list it in `sources.json`.

### (e) Natural Earth admin-1 — [G4]

`ne_10m_admin_1_states_provinces` (v5, public domain), used to cut partially occupied colonies along province lines: Myanmar (Tanintharyi, Mon, Kayin, Yangon), Indonesia (Sumatera Selatan, Lampung), Philippines (Bataan, removed).

## 2. Per keyframe

### K1 — 1937-07-07 (Marco Polo Bridge)

- **Method**: dataset query only, no georeferencing. CShapes polygons valid on the day, mapped GW code → holder (colonies to their metropole: British, French, Dutch, Belgian, Portuguese, Spanish, Italian, US; British India → `india`; Papua and the New Guinea mandate → `australia`; Ethiopia → `italy` with label "Italian-occupied since 1936"). Then OHM painted over: Manchukuo r2885965 (with Rehe), Empire of Japan r2889894 (home islands, Korea, Taiwan, Karafuto, Kurils, Kwantung, South Seas Mandate), British Hong Kong r2694575.
- **Why**: everything K1 needs exists as dated polygons; Manchukuo, Kwantung and the Mandate are only in OHM.
- **Left out on purpose** (no entity in docs/09 §4.1): Mongolia, Tibet, Nepal, Bhutan, Afghanistan, Iran, Iraq, Egypt, Saudi Arabia, Yemen, Oman, Liberia, South Africa and South West Africa, Latin America except Brazil, and in Europe Austria, Czechoslovakia, Albania, Denmark, Iceland, Luxembourg, Danzig, the Baltic states. The Japanese client administrations in East Hebei (1935–38) and Inner Mongolia (1936) are not shown separately (spec: Japan = home islands, Korea, Taiwan, Manchukuo + Rehe).
- **Residuals**: none (no control-point fit).

### K6 — 1942-03-09 (Java surrenders)

- **Base**: CShapes polygons valid on the day. Occupied European states (Poland, France, Belgium, Netherlands, Luxembourg, Norway, Denmark, Czechoslovakia, Austria, Yugoslavia, Greece) default to `germany`, then refined below. French colonies split by allegiance on the day: Vichy (North and West Africa, Togo, Djibouti, Madagascar, Réunion, Antilles, Guiana) → `vichy-france`; Free French (French Equatorial Africa, Cameroun, Syria, Lebanon, New Caledonia, French Polynesia) → `free-france`. Eritrea and Italian Somaliland → `uk` (British military administration); Ethiopia left out (sovereignty restored 1941–42).
- **East Asia**: [G3] occupied China (georeferenced, clipped to CShapes China, extended up to 40 km into the source map's sea so the coast follows CShapes) + Hainan (CShapes island, occupied Feb 1939) → `japan`; OHM Manchukuo, Empire of Japan r2948948, Hong Kong Occupied Territory, Thailand r2874870 (`thailand`), Indochinese Federation r2745895 (`japan`, label "Japanese-occupied, Vichy administration").
- **Southeast Asia and Pacific** (dates from [G8], [G9]; units are whole CShapes polygons, single islands picked by a point inside, or Natural Earth provinces): Malaya and Singapore (surrender 15 Feb); Sarawak, Brunei, North Borneo; Dutch Borneo, Celebes, Java, Madura, Bali, Bangka, Ambon, West Timor; Sumatera Selatan + Lampung (Palembang 14–16 Feb; the north of Sumatra was invaded on 12 March, after K6); Portuguese Timor (20 Feb); Luzon minus Bataan province, Mindoro, Jolo (the Visayas and most of Mindanao were taken in April–May); Lower Burma = Tanintharyi, Mon, Kayin, Yangon (Rangoon 8 Mar; Pegu, which fell on 7 Mar, lies in Bago Region and is therefore not included); New Britain and New Ireland (23 Jan) → `japan`.
- **Europe**: [G5] Reich + German-occupied → `germany`; allies class → `italy` by default, then Finnish-held Karelia (`finland`, part in the USSR north of 58° N) and Transnistria (`romania`, part in the USSR south of 49° N); "nominally unoccupied" in France → `vichy-france`. OHM polygons then override for Italy (with 1941 annexations), Albania, Montenegro, Hungary, Romania, Bulgaria (with occupied Macedonia and Thrace), Finland (1940 borders), Slovakia and Croatia (`germany`, labelled as client states), Guernsey and Jersey (`germany`). [G5]'s USSR classes are only used inside the [G7] frame or north of 58° N, because [G5] draws the Nov 1942 Caucasus–Stalingrad extent.
- **Eastern Front**: [G7] Soviet-held area at 1942-05-05 (after the winter counter-offensive) → `ussr`, clipped to the CShapes USSR. Its front is used for 9 March: the line moved little between March and early May 1942 (Demyansk and Rzhev salients, Izium bulge already formed). Known differences: Sevastopol and the Kerch peninsula were still Soviet-held on 9 March (fell May–July 1942); [G7] shows only the Kerch bridgehead.
- **Why these sources**: CShapes and OHM give exact dated polygons where they exist; no dataset holds occupation lines for China, the Eastern Front or the German/Italian zones, so those come from georeferenced Commons maps. [G6] is not traced because it shows the May 1942 maximum, not 9 March.

## 3. Control-point residuals (georef-svg.ts)

Residual = great-circle distance between the control point and where the fitted model puts its SVG position; leave-one-out = predicted by a fit without that point. Budget docs/09 §5.3: ≤ 30 km Europe, ≤ 60 km Asia-Pacific.

| map | points | model (auto, lowest leave-one-out RMS) | RMS | max | leave-one-out RMS / max |
|---|---|---|---|---|---|
| [G3] China 1940 | 29 city dots | Lambert conformal conic (109° E; 25.3°/38.5° N) + 2nd-order polynomial | 19.8 km | 54.4 km (Xiamen) | 25.4 / 71.8 km |
| [G5] Europe 1942 | 33 capes and island centres | Lambert azimuthal equal-area (12.4° E, 52.9° N) + affine | 9.2 km | 16.1 km (Lizard Point) | 10.1 / 17.3 km |
| [G7] Eastern Front 1942 | 51 city dots | Lambert conformal conic (29.1° E; 46.1°/57.4° N) + 2nd-order polynomial | 10.1 km | 22.4 km (Stockholm) | 12.2 / 28.6 km |

All fits are inside budget. [G3] is a hand-drawn map traced from a scan, so its own city positions scatter (Xiamen 54 km, Myitkyina 43 km, Chengdu 36 km); the occupied-China edge therefore carries about ±20–50 km. Per-point residuals are printed by `georef-svg.ts` and kept in `work/svg-<id>-fit.json`; control points are listed in `sources.json`.

## 4. Licences of the output

`control.json` is a derived database that combines CC BY-NC-SA 4.0 (CShapes), ODbL 1.0 (OHM), CC BY-SA 3.0/4.0 (Commons traces) and public-domain (Natural Earth) geometry. The share-alike terms of CC BY-NC-SA, ODbL and CC BY-SA are not formally compatible with each other, so each feature keeps its source ids in `properties.src` and the topic's `data/SOURCES.md` attributes every source. Before any commercial use or relicensing, the CShapes-derived base would have to be replaced (e.g. with OHM-only borders).

## 5. Size

All keyframes share one budget of 1.5 MB for the 12 keyframes of docs/09 §4.2 (`simplify.ts` scales it to the keyframes present). K1 + K6 = 253 KB at a 10.6 km simplification interval inside the focus boxes (Europe / Middle East, East and Southeast Asia) and 50 km elsewhere. With the full 12 keyframes at this budget the interval stays around 10 km; a TopoJSON control file with arcs shared across keyframes (most borders do not change between keyframes) would allow 2–3 km detail inside the same budget, but needs an engine/schema change.
