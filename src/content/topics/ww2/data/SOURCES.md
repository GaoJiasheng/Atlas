# World War II — sources

Rules: docs/09 §6. Numbered facts are `[S#]` (added with the chapter texts); map geometry is `[G#]`. Each control-area feature in `control.json` lists the `[G#]` it was built from in `properties.src`. Full survey, georeferencing residuals and the rebuild commands: `scripts/geo/ww2/SOURCES-GEO.md`.

## Map data

- **[G1]** CShapes 2.0, GW version — Schvitz, Rüegger, Girardin, Cederman, Weidmann, Gleditsch (ETH Zürich ICR), *Mapping the International System, 1886–2017: The CShapes 2.0 Dataset*, Journal of Conflict Resolution 66(1), 2022. https://icr.ethz.ch/data/cshapes/ — **CC BY-NC-SA 4.0** (non-commercial use; Atlas is a non-commercial education site). Sovereign and colonial borders on each keyframe date.
- **[G2]** OpenHistoricalMap, boundary relations exported through https://overpass-api.openhistoricalmap.org/ — © OpenHistoricalMap contributors, **ODbL 1.0**. K1: Empire of Japan r2889894, Manchukuo r2885965, British Hong Kong r2694575. K6: Empire of Japan r2948948, Manchukuo r2885965, Hong Kong Occupied Territory r2694574, Thailand r2874870, Indochinese Federation r2745895, Italy r2747829, Italian protectorate of Albania r2695459, Governorate of Montenegro r2695479, Kingdom of Hungary r2692359, Kingdom of Romania r2693255, Tsardom of Bulgaria r2695478, Finland r2692833, Slovak Republic r2747847, Independent State of Croatia r2692713, Guernsey r2828270, Jersey r2828299.
- **[G3]** *Japanese Occupation of China 1940* (SVG), Rowanwindwhistler after `Japanese_Occupation_-_Map.jpg`, English by Odie5533 — https://commons.wikimedia.org/wiki/File:Japanese_Occupation_of_China_1940.svg — **CC BY-SA 3.0**.
- **[G4]** Natural Earth 1:10m Admin 1 states and provinces, v5 — https://www.naturalearthdata.com/ — public domain.
- **[G5]** *World War II in Europe, 1942 (no labels)* (SVG), Goran tek-en — https://commons.wikimedia.org/wiki/File:World_War_II_in_Europe,_1942_(no_labels).svg — **CC BY-SA 4.0**.
- **[G6]** *Second world war asia 1937-1942 map* (French SVG), RedTony and Skimel — https://commons.wikimedia.org/wiki/File:Second_world_war_asia_1937-1942_map-fr.svg — **CC BY-SA 4.0**. Cross-check only, not traced.
- **[G7]** *Eastern Front 1941-12 to 1942-05* (Spanish SVG), Gdr and Rowanwindwhistler — https://commons.wikimedia.org/wiki/File:Eastern_Front_1941-12_to_1942-05-es.svg — **CC BY-SA 3.0**.
- **[G8]** C. F. Romanus and R. Sunderland, *Stilwell's Mission to China* (US Army Center of Military History, 1953), Map 3 "Japanese advance in Burma, 20 January – 19 March 1942" — https://commons.wikimedia.org/wiki/File:Japanese_advance_in_Burma,_20_January-19_March_1942.jpg — public domain. Dates only.
- **[G9]** US Military Academy, Department of History, "Netherlands East Indies, 1941: Japanese centrifugal offensive, December 1941 – April 1942" — https://commons.wikimedia.org/wiki/File:Pacific_War_-_Dutch_East_Indies_1941-42_-_Map.jpg — public domain. Dates only.

## Control keyframes

| K | date | method | sources | control-point residual | checked |
|---|---|---|---|---|---|
| K1 | 1937-07-07 | dataset query: CShapes borders on the day, OHM Japan / Manchukuo / Hong Kong over them | G1, G2 | none (no georeferencing) | side-by-side image `docs/screenshots/ww2/geo-K1.png` (against G6); reviewer sign-off pending |
| K6 | 1942-03-09 | CShapes base; OHM states; SVG georeferencing for occupied China (G3), Axis Europe (G5) and the Eastern Front (G7); Southeast Asia from whole CShapes units / islands and Natural Earth provinces taken by 9 March (dates G8, G9) | G1–G5, G7–G9 | G3: RMS 19.8 km, max 54.4 km (29 points); G5: RMS 9.2 km, max 16.1 km (33 points); G7: RMS 10.1 km, max 22.4 km (51 points) | side-by-side image `docs/screenshots/ww2/geo-K6.png` (against G6, G5, G7); reviewer sign-off pending |

Known simplifications in K6: the Eastern Front is the line of 5 May 1942 (G7), which differs from 9 March mainly in Crimea (Sevastopol and the Kerch peninsula were still Soviet-held on 9 March); occupied China is the 1940 line (G3); Lower Burma is cut on modern province lines (Pegu, taken 7 March, falls outside them); the Philippines show Luzon (without Bataan), Mindoro and Jolo, the areas held on 9 March, not the whole archipelago.
