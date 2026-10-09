# The First World War map data — source survey and per-keyframe provenance

Every edge in `src/content/topics/ww1/data/control.json` comes from a dataset below; nothing is drawn by hand. Reference ids `[G#]` are the same as in the topic's `data/SOURCES.md`. Commands: `pnpm tsx scripts/geo/lib/<step>.ts --topic ww1` (skill atlas-history-topic, references/geo-runbook.md). Content plan: `docs/11-ww1-content-spec.md` §5.

## 1. Survey

### Used for geometry

- **[G1] CShapes 2.0 (GW version)** — https://icr.ethz.ch/data/cshapes/ (file `CShapes-2.0.geojson`). Schvitz, Rüegger, Girardin, Cederman, Weidmann, Gleditsch, *Mapping the International System, 1886–2017: The CShapes 2.0 Dataset*, Journal of Conflict Resolution 66(1), 2022. Licence quoted from the dataset page (checked 2026-10-09): "CShapes by Schvitz, Rüegger, Girardin, Cederman, Weidmann, Gleditsch is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License." Coverage: independent states and colonial units, day-precise validity. Border changes are dated by treaty signature or annexation (Germany changes on 1919-06-28, Austria and Italy on 1919-09-10, Hungary and the Kingdom of Serbs, Croats and Slovenes on 1920-06-04, Romania gains Bessarabia on 1920-10-28). Limits for this topic: no German Micronesia, Samoa or Kiautschou; no Kuwait, Bahrain or Qatar; Cyprus only from 1914-11-05; the Ottoman Empire keeps its Arab provinces until 1920 (de jure); Russia is one unit through the civil war (Ukraine, Belarus and Transcaucasia inside it); no Kingdom of Hejaz.
- **[G2] OpenHistoricalMap** — boundary relations through https://overpass-api.openhistoricalmap.org/ (`ohm-export.ts`, sets `k1` and `k9` in `sources.json`; the export checks every relation's name and `start_date` / `end_date` against the set date — no warnings). Licence quoted from https://www.openhistoricalmap.org/copyright (checked 2026-10-09): "Except where otherwise noted, OpenHistoricalMap data is dedicated to the public domain under a Creative Commons CC0 dedication." Individual features may carry CC BY / CC BY-SA in `license=*` tags; none of the 25 relations used carries a `license` tag (checked in `raw/ohm-k1.json`, `raw/ohm-k9.json`). The same page says coastline data comes from OpenStreetMap (© OpenStreetMap contributors, CC BY-SA 2.0); some coastal member ways may descend from it, so OHM and OSM contributors are credited. Discovery: `--list 1914-07-28 --levels 1-2` (196 relations) and `--list 1919-06-28 --levels 1-2` (207), plus `--list 1919-06-28 --levels 1-4 --bbox 10,25,45,65` for the Middle East.

### Cross-check images (not traced)

- **[G3]** *Map Europe alliances 1914* (English SVG), historicair (French original, 2006), Fluteflute and Bibi Saint-Pol (English, 2009) — https://commons.wikimedia.org/wiki/File:Map_Europe_alliances_1914-en.svg — Commons licence field: "CC BY-SA 2.5 | Creative Commons Attribution-Share Alike 2.5". Europe only; shows Italy in the Triple Alliance (its 1914 treaty position, before it declared neutrality).
- **[G4]** *German colonial empire* (SVG), Ketsdekaeru (2025) — https://commons.wikimedia.org/wiki/File:German_colonial_empire.svg — "CC0 | Creative Commons Zero, Public Domain Dedication". World view of the German colonies in 1914; Micronesia drawn as a maritime box.
- **[G5]** *Map Europe 1923* (English SVG), Historicair (French original), Fluteflute (English derivative, 2009) — https://commons.wikimedia.org/wiki/File:Map_Europe_1923-en.svg — "CC BY-SA 2.5 | Creative Commons Attribution-Share Alike 2.5". Post-war states and treaty changes; dated 1923, so it differs from K9 where later events intervene (Memel 1923, the Polish–Soviet border of 1921, Turkey after Lausanne).

### Looked at and not used

- *Area of the OETA* (SVG, SPQR10, CC BY-SA 4.0) — https://commons.wikimedia.org/wiki/File:Area_of_the_OETA.svg. Shows the Occupied Enemy Territory Administration zones of 1918–1919 as dotted lines only, with no fill per zone, so the class-by-colour georeferencing (`georef-svg.ts`) cannot turn it into areas. The occupation zones are therefore named in the Ottoman label instead of drawn. A fill-coded map of the zones would let a later pass split them.
- *OETA Syria* (PNG, CC BY-SA 3.0), *Russian State (1 Jan 1919)* (PNG, CC BY-SA 4.0), *Map of Europe in 01-01-1919* (PNG, CC BY-SA 4.0, 2025): either the wrong date for K9 or recent amateur compilations without cited sources.
- *Bartholomew's general war map of Europe and the Mediterranean, 1919* (National Library of Wales, public domain): a reference map, not a dated control map.
- No sourced map of the Russian civil-war fronts on or near 28 June 1919 was found; per the content spec Russia is one holder with a civil-war label.

## 2. Keyframes

Both frames are dataset queries: no georeferencing, so no control-point residuals. Simplification: `simplify.ts --fine 1.5` (see §4).

### K1 · 1914-07-28 — Austria-Hungary declares war on Serbia

- **Recipe**: CShapes on 1914-07-28 (124 polygons mapped to 33 holders; 26 states outside the topic left out, e.g. Mexico, Argentina, Ethiopia, Afghanistan, Tibet), then OHM over it: German New Guinea with the Bismarck Archipelago, northern Solomons and Micronesia (r2889769, a maritime polygon cut to land by the coast step), German Samoa, Kiautschou, Weihaiwei, Hong Kong, Kwangchowan, Macau, Cyprus (British-administered under Ottoman sovereignty), Kuwait, Bahrain, New Hebrides, Gilbert and Ellice Islands, Tonga, Cook Islands.
- **Labels**: Egypt (British-occupied, Ottoman suzerainty), Anglo-Egyptian Sudan, Newfoundland, Iceland (Danish dependency), Straits Settlements (incl. Singapore), Bukhara and Khiva (Russian protectorates), the leased ports and protectorates above.
- **Check**: `docs/screenshots/ww1/geo-K1.png` — Europe and the Balkans against [G3] (all borders agree; G3 colours Italy as a Triple Alliance member, the map leaves it neutral until 23 May 1915 by entity dates), world against [G4] (all German colonies present), East Asia and Pacific.
- **Known simplifications**: Bosnia-Herzegovina is inside Austria-Hungary without its own outline (annexed 1908; Sarajevo is an event marker); Micronesian atolls smaller than the Natural Earth 1:50m land are lost in the coast step; Tibet and Mongolia are left unfilled (not participants).

### K9 · 1919-06-28 — Treaty of Versailles signed

- **Recipe**: CShapes on 1919-06-28 for Germany (Versailles borders, dated by CShapes from the signature), Poland, Danzig, Czechoslovakia, the Baltic states, Finland, Greece, Bulgaria, Albania and all colonies. Then: Austria on the Saint-Germain line and Italy with South Tyrol, Trieste and Istria (CShapes on 1919-09-10); the Kingdom of Serbs, Croats and Slovenes and Hungary on the Trianon line (CShapes on 1920-06-05); Galicia to Poland (CShapes Poland on 1919-09-10 inside the 1919-06-28 Austria; the Allied Supreme Council authorised Polish administration of Eastern Galicia on 25 June 1919); Ukraine labelled as contested (OHM r2848214, the 1919 Ukrainian SSR extent, held by `russia` so no line is drawn against the rest of Russia); Greater Romania with Bessarabia, Bukovina and Transylvania (CShapes on 1920-10-28, painted after Ukraine); Georgia, Armenia, Azerbaijan (OHM); Japan with Micronesia (OHM r2889768) and Kiautschou (OHM r2889899, holder Japan); the occupied German colonies (OHM: New Guinea and Nauru to Australia, Samoa to New Zealand, Ruanda-Urundi to Belgium, British Togoland; CShapes: French and British Cameroons, the rest of Togoland, Tanganyika, South West Africa).
- **Why later CShapes dates**: on 28 June 1919 CShapes still draws the de jure Austria (with Galicia, Bukovina, Slovenia, Dalmatia, South Tyrol and Istria) and Hungary (with Slovakia's neighbours, Transylvania, Croatia and the Banat), which were no longer governed from Vienna or Budapest. The treaty lines are the closest sourced approximation to the "new map" the chapter describes; each label says which line is shown. An earlier attempt with OHM's Kingdom of Romania (r2693464, "1919–1921") against CShapes Hungary left strips of Hungary up to 430 km² along the Romanian border, so Romania was switched to CShapes as well.
- **Check**: `docs/screenshots/ww1/geo-K9.png` — Europe and central Europe against [G5] (all post-war states and the Saint-Germain / Trianon lines agree; G5's 1923 differences: Memel, the Polish eastern border of 1921, Turkey after Lausanne, the mandates in the Levant), Middle East, world, East Asia and Pacific.
- **Known simplifications**: see `data/SOURCES.md` (treaty lines instead of the fighting lines of the day; Ottoman occupation zones and the Greek landing at Smyrna not drawn; Russia one unit; Albania one unit). Small strips (≤ 560 km²) of `russia` labelled as Russia remain between the OHM Ukraine extent and the Dniester; same holder, so no line is drawn.

## 3. Size and accuracy

- `control.json`: 2 keyframes, one TopoJSON, 1,702 arcs, **600 KB** (614,051 bytes). Focus boxes: Europe and Middle East `[-12, 28, 62, 72]`, East Asia and western Pacific `[100, -12, 180, 50]` (Tsingtao, Micronesia, New Guinea); 1.5 km inside, 50 km outside; quantisation 400,000; DP; global coast clip with Natural Earth 1:50m land (no 1:10m detail region).
- Budget: 2.5 MB for 9 planned keyframes, pro rata 569 KB for 2. The automatic search reaches 5.25 km before it fits (570 KB at 5 km), because most of the file is the world coastline, which is a fixed cost shared by all keyframes, not a per-keyframe one. 1.5 km costs 31 KB more than the pro-rata figure; the 9-frame total is expected to stay under 2.5 MB (ww2: 12 frames, 2.12 MB at 1.5 km). Rerun the default search once all frames exist and decide then.
- Deviation printed by `simplify.ts` (focus boxes, original vertices to written boundary): p50 0.25 km, p95 15.3 km, p99 38.9 km, max 92.1 km. The tail is not simplification error: almost all of it is the OHM maritime polygons of Micronesia, the Gilbert Islands and Tonga (open-sea vertices up to 2,500 km from any land, erased on purpose by the coast step) and the lakes and inlets that Natural Earth `land` counts as land (Mälaren, the IJsselmeer, the Sea of Azov shore, the Yangtze estuary). Measured on the Europe box alone, including coastal vertices: K1 p50 1.0 / p95 9.5 km, K9 p50 0.7 / p95 7.6 km.

## 4. Rebuild

```bash
pnpm tsx scripts/geo/lib/fetch.ts --topic ww1
pnpm tsx scripts/geo/lib/ohm-export.ts --topic ww1
pnpm tsx scripts/geo/lib/compose.ts --topic ww1
pnpm tsx scripts/geo/lib/simplify.ts --topic ww1 --fine 1.5
pnpm tsx scripts/geo/lib/check.ts --topic ww1
```

## 5. Licences

`control.json` is a derived database combining CC BY-NC-SA 4.0 geometry (CShapes) and CC0 geometry (OHM; coastal ways possibly from OpenStreetMap, CC BY-SA 2.0). Each feature keeps its source ids in `properties.src`; `data/SOURCES.md` attributes every source. Obligations: attribute CShapes and use it non-commercially, share derived data under CC BY-NC-SA 4.0; credit OpenHistoricalMap (and OpenStreetMap contributors for coastlines). The cross-check images [G3]–[G5] are not part of the published data; they appear only in the check screenshots, which carry their attribution. Before any commercial use the CShapes-derived base would have to be replaced.
