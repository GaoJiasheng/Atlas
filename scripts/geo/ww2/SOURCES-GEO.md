# World War II — map source and licence ledger

Updated 2026-11-09. This is the active ledger; the retired 2026-11-05 inventory is `scripts/geo/ww2/licence-inventory-before.json` (metadata only, never a geometry input). Every runtime control/route file now uses only compatible sources. Chapters, beats and historical figures are unchanged; only S92 route attribution is updated in EN/ZH.

## Active map sources

| Ref | Source / author | Licence | Geometry / date role |
|---|---|---|---|
| G1 | [CShapes 2.0 (GW version), borders of independent states and dependent territories 1886-2019](https://icr.ethz.ch/data/cshapes/) — Schvitz, Rüegger, Girardin, Cederman, Weidmann, Gleditsch (ETH Zürich ICR), 2022 | CC BY-NC-SA 4.0 | sovereign and colonial base borders on each keyframe date |
| G4 | [Natural Earth 1:10m Admin 1 states and provinces (v5)](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/) — Natural Earth | Public domain | province units to cut partially occupied colonies (Burma, Philippines, Sumatra) at the dated front |
| G8 | [Japanese advance in Burma, 20 January - 19 March 1942 (Map 3)](https://commons.wikimedia.org/wiki/File:Japanese_advance_in_Burma,_20_January-19_March_1942.jpg) — C. F. Romanus, R. Sunderland, Stilwell's Mission to China (US Army CMH, 1953) | Public domain (US Government work) | dates for the Burma cut (Moulmein 30 Jan, Sittang 21 Feb, Pegu/Rangoon 7-8 Mar) |
| G9 | [Netherlands East Indies 1941: Japanese centrifugal offensive, Dec 1941 - Apr 1942 (Map 10)](https://commons.wikimedia.org/wiki/File:Pacific_War_-_Dutch_East_Indies_1941-42_-_Map.jpg) — US Military Academy, Department of History | Public domain (US Government work) | dates for the DEI / Philippines cut (landings and surrenders before 9 Mar 1942) |
| G10 | [Second World War Europe 09 1939 (German SVG), situation at the end of September 1939](https://commons.wikimedia.org/wiki/File:Second_World_War_Europe_09_1939_de.svg) — San Jose (after OKH GenStdH Lagekarten, BArch RH 2, and USMA Department of History) | Public domain (released by the author) | K3 cross-check: German / Soviet occupation of Poland at the end of September 1939 |
| G11 | [Second World War Europe 06 1940 (German SVG), situation at the end of June 1940](https://commons.wikimedia.org/wiki/File:Second_World_War_Europe_06_1940_de.svg) — San Jose (after OKH GenStdH Lagekarten, BArch RH 2, and USMA Department of History) | Public domain (released by the author) | K4 cross-check: occupied France, the Low Countries, Denmark and Norway, Vichy zone, Soviet annexations |
| G12 | [Second World War Europe 11 1941 (German SVG), situation at the end of November 1941](https://commons.wikimedia.org/wiki/File:Second_World_War_Europe_11_1941_de.svg) — San Jose (after OKH GenStdH Lagekarten, BArch RH 2, and USMA Department of History) | Public domain (released by the author) | K5: Axis-held Europe, North Africa and the Eastern Front at the end of November 1941 |
| G13 | [Second World War Europe 10 1942 (German SVG), situation at the end of October 1942](https://commons.wikimedia.org/wiki/File:Second_World_War_Europe_10_1942_de.svg) — San Jose (after OKH GenStdH Lagekarten, BArch RH 2, and USMA Department of History) | Public domain (released by the author) | K7: Axis-held Europe at its peak (Stalingrad, Caucasus, El Alamein) |
| G14 | [Second World War Europe 12 1942 (German SVG), situation at the end of December 1942](https://commons.wikimedia.org/wiki/File:Second_World_War_Europe_12_1942_de.svg) — San Jose (after OKH GenStdH Lagekarten, BArch RH 2, and USMA Department of History) | Public domain (released by the author) | K8: German and Italian occupation zones in France and the Balkans after November 1942 |
| G19 | [China, 1900-1949, Map 5: Situation at the End of World War II](https://commons.wikimedia.org/wiki/File:Situation_at_the_End_of_World_War_Two.PNG) — US Military Academy, Department of History (West Point atlas, Chinese Civil War series) | Public domain (US Government work) | K9-K11: Japanese-occupied China in 1944-45, incl. the Ichi-Go corridor (Henan, Hunan, Guangxi, Guangdong) |
| G20 | [The New Guinea Area - Allied Advance (American Military History, map AMH-43)](https://commons.wikimedia.org/wiki/File:The_New_Guinea_Area_-_Allied_Advance_(AMH-43).jpg) — US Army Center of Military History, American Military History | Public domain (US Government work) | dates only: Allied advance in New Guinea, the Solomons and the Bismarcks 1942-44 |
| G21 | [Allied Third Burma Campaign, June 1944 - May 1945](https://commons.wikimedia.org/wiki/File:Allied_Third_Burma_Campaign_June_1944-May_1945.jpg) — US Military Academy, Department of History | Public domain (US Government work) | dates only: the reconquest of Burma (Rangoon 3 May 1945; Japanese withdrawal to Tenasserim) |
| G22 | [Pacific War - Micronesia, Melanesia and New Guinea 1941-42](https://commons.wikimedia.org/wiki/File:Pacific_War_-_Micronesia,_Melanesia_and_New_Guinea_1941-42_-_Map.jpg) — US Military Academy, Department of History | Public domain (US Government work) | dates only: Japanese landings in New Guinea, the Solomons and the Aleutians in 1942 |
| G23 | [Japanese Occupation, 1940 — China 1900–1949, map 4 (original USMA raster)](https://commons.wikimedia.org/wiki/File:Japanese_Occupation_-_Map.jpg) — US Military Academy, Department of History; cartography Edward J. Krasnoborski / Frank Martini | Public domain (US Government work) | Independently registered and colour-traced original, replacing G3; no geometry or registration pixels copied from its CC BY-SA SVG derivative |
| G24 | [Second World War Europe, end of March 1942 (public-domain monthly map)](https://commons.wikimedia.org/wiki/File:Second_World_War_Europe_03_1942_de.svg) — San Jose (after OKH GenStdH Lagekarten, BArch RH 2, and USMA Department of History) | Public domain (released by the author) | K6 Europe and Eastern Front; 22-day date offset replaces May 1942 line |
| G25 | [German Summer Offensive, Situation 4 July 1943 (left panel only)](https://dhc.westpoint.edu/atlases/) — US Military Academy, Department of History; Edward J. Krasnoborski / Frank Martini | Public domain (US Government work) | Registered published campaign map; 1400-pixel server rendition normalised losslessly to PNG by prepare.ts |
| G26 | [Russian Leningrad and Ukraine Offensives, 2 December 1943–30 April 1944](https://dhc.westpoint.edu/atlases/) — US Military Academy, Department of History; Edward J. Krasnoborski / Frank Martini | Public domain (US Government work) | Registered published campaign map; 1400-pixel server rendition normalised losslessly to PNG by prepare.ts |
| G27 | [Russian Balkan and Baltic Campaigns, 19 August–31 December 1944](https://dhc.westpoint.edu/atlases/) — US Military Academy, Department of History; Edward J. Krasnoborski / Frank Martini | Public domain (US Government work) | Registered published campaign map; 1400-pixel server rendition normalised losslessly to PNG by prepare.ts |
| G28 | [The General Situation, 15 December 1944](https://dhc.westpoint.edu/atlases/) — US Military Academy, Department of History; Edward J. Krasnoborski / Frank Martini | Public domain (US Government work) | Registered published campaign map; 1400-pixel server rendition normalised losslessly to PNG by prepare.ts |
| G29 | [Allied Advance to Gothic Line, 5 June–31 December 1944](https://dhc.westpoint.edu/atlases/) — US Military Academy, Department of History; Edward J. Krasnoborski / Frank Martini | Public domain (US Government work) | Registered published campaign map; 1400-pixel server rendition normalised losslessly to PNG by prepare.ts |
| G30 | [Final Operations, 19 April–7 May 1945](https://dhc.westpoint.edu/atlases/) — US Military Academy, Department of History; Edward J. Krasnoborski / Frank Martini | Public domain (US Government work) | Registered published campaign map; 1400-pixel server rendition normalised losslessly to PNG by prepare.ts |
| G31 | [Allied Gains in Europe, 15 December 1944–7 May 1945](https://dhc.westpoint.edu/atlases/) — US Military Academy, Department of History; Edward J. Krasnoborski / Frank Martini | Public domain (US Government work) | Registered published campaign map; 1400-pixel server rendition normalised losslessly to PNG by prepare.ts |
| G32 | [Allied Advance to Volturno River and Attack on Gustav Line, 17 January–11 May 1944](https://dhc.westpoint.edu/atlases/) — US Military Academy, Department of History; Edward J. Krasnoborski / Frank Martini | Public domain (US Government work) | Registered published campaign map; 1400-pixel server rendition normalised losslessly to PNG by prepare.ts |
| G33 | [The Partition of Greece, map 2, German Antiguerrilla Operations in the Balkans (1941–1944), CMH Publication 104-18 (1954)](https://www.ibiblio.org/hyperwar/ETO/East/Balkans/AG-Balkans.html) — US Department of the Army, Office of the Chief of Military History | Public domain (US Government work) | Independently registered Italian/German occupation-zone demarcation, replacing the G5 mask |
| G35 | [geoBoundaries gbOpen Greece ADM3, municipalities (2010 boundaries; build 2023-12-12)](https://www.geoboundaries.org/) — Runfola, D. et al. and geoBoundaries community contributors (2020), PLoS ONE 15(4), e0231866; source geometries credited in geoBoundaries Greece metadata | CC BY 4.0 (gbOpen; underlying Greece metadata lists CC0 1.0 and CC BY 3.0) | Real municipal units as explicit administrative approximations: Chania/Platanias/Apokoronas for the German northwestern Crete pocket; Sitia, Agios Nikolaos, Ierapetra and Lasithi Plateau for Italian eastern Crete, with location evidence G38. No invented border. |
| G36 | [German Invasion of Russia, 22 June–25 August 1941, USMA plate 19](https://dhc.westpoint.edu/atlases/) — US Military Academy, Department of History | Public domain (US Government work) | Independent route-axis redigitisation replacing the S92/Gdr adaptation; main-map pixels, no old route geometry |
| G37 | [German Invasion of Russia, Advance on Moscow, 26 August–5 December 1941, USMA plate 20](https://dhc.westpoint.edu/atlases/) — US Military Academy, Department of History | Public domain (US Government work) | Independent route-axis redigitisation replacing the S92/Gdr adaptation; main-map pixels, no old route geometry |
| G38 | [OSS dissemination A-12634, Italian-German relations and Italian troops in eastern Crete, distributed 15 October 1943 (reports August–September 1943)](https://www.elia.org.gr/userfiles/pdf_archieve/1943%2010-2443%20Crete%2C%20Ierapetra%2C%20Sitia%2C%20Iraklion%2C%20Italian%20Surrender%2C%20226-CID-L19124%20%28A-12634%2C%20British%29.pdf) — United States Office of Strategic Services, Washington DC; declassified archival report, ELIA archive scan | Public domain (US Government work) | Location evidence for Italian posts in Sitia, Ierapetra, Agios Nikolaos and Palaiokastro before the September 1943 surrender. Text facts only; no geometry traced from the PDF. Municipal boundaries remain an explicit approximation, including in the earlier frames. |
| G2 | [OpenHistoricalMap contributors](https://www.openhistoricalmap.org/copyright) | CC0 1.0, except tagged features | Dated boundary relations; every exported element checked for licence exceptions. No exception found. |
| G34 | [Natural Earth, Tom Patterson / Nathaniel Vaughn Kelso and contributors](https://www.naturalearthdata.com/about/terms-of-use/) | Public domain | Existing 1:50m global and 1:10m Southeast Asia coast clipping. |

The author-released monthly SVG maps are public domain, not CC BY-SA. The USMA/CMH maps are US Government works. G35 is geoBoundaries gbOpen (CC BY 4.0); its [Greece ADM3 metadata](https://www.geoboundaries.org/api/current/gbOpen/GRC/ADM3/) also credits underlying CC0 / CC BY 3.0 sources. These 2010 municipalities are administrative approximations of Crete occupation zones, not claimed as wartime boundaries. G38 is a period OSS report locating Italian troops at Sitia, Ierapetra, Agios Nikolaos and Palaiokastro before the 1943 surrender; it supplies factual location evidence, not geometry. CMH G33 is used for the mainland partition, not for a precise eastern-Crete demarcation. Original downloads and SHA-256 hashes: `scripts/geo/ww2/input-checksums.json`. No geometry is copied from G3/G5/G7/G15–G18 or S92’s former Gdr map.

## Every keyframe

Each row produces `work/K#.geojson` (CC BY-NC-SA 4.0), then one shared `data/control.json` (CC BY-NC-SA 4.0). CShapes uses valid-from/to date queries; OHM uses named, dated relations. SVG colour paths and raster palette regions are registered from published maps. Line fronts follow source-colour pixels between image-space waypoints, then clip against dataset borders. Geographic closure points and coverage boxes select the retained side; they do not invent a displayed border. Finnish Karelia uses the connected Finland component of G14 **before** sea buffering; buffering first joins it to German-held territory across the Gulf of Finland/Ladoga. The final Poland/USSR overlay in K5 restores the dated G12 front after multipart occupation erasures while preserving Finnish/Romanian selections. K11 Soviet erasure is scoped to the mainland pocket, preserving Norway/Denmark and Crete. K10/K11 Courland uses the traced G27 pocket clipped to pre-war CShapes Latvia, with no rectangular selection edge or Estonian islands. K6 retains its original bilingual Denmark occupation label after the monthly overlay. After composition, `restore-source-coverage.ts` adds the sourced Sitia municipal unit to the Italian eastern-Crete approximation in K5–K8, then fills only unpainted interiors of Poland/Yugoslavia/USSR in K5/K7 from the dated registered G12/G13 classes, clipped to CShapes and erased against all existing coverage; it never overwrites a holder. The 1-degree interior coverage audit tests the old supported land against the rebuilt coverage with four 0.2-degree probes to reject new broad holes. Detailed selectors, including every clip/erasure dependency, are in `sources.json`; the machine ledger is `provenance/map-provenance.json`.

| Frame / date | Sources and licences | Registration / selection | Date and resolution limits |
|---|---|---|---|
| K1 · 1937-07-07 | G1, G2, G34; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | CShapes + OHM date queries; no map registration. | None. |
| K2 · 1938-10-27 | G1, G2, G4, G23, G34; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | G23 original USMA 1940 China raster; Natural Earth province cuts preserve the existing 1938 approximation. | 1940 China map constrained to the earlier occupied provinces; still a regional approximation. |
| K3 · 1939-10-06 | G1, G2, G23, G34; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | G23 China raster with the existing geographic date cut; European dated OHM polygons; G10 September map cross-check. | 1940 China line retained as before; southern China after 1938 excluded by the original cut. |
| K4 · 1940-07-01 | G1, G2, G11, G23, G34; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | G11 monthly SVG: France demarcation and Europe; G23 China raster; dated OHM states. | End-June map for 1 July; China remains the 1940 approximation. |
| K5 · 1941-12-05 | G1, G2, G4, G12, G14, G23, G33, G34, G35, G38; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | G12 monthly SVG: November Europe/front; G33 CMH Greek occupation trace, G35 eastern Crete municipal selection; G23 China. | End-November Europe map for 5 December. |
| K6 · 1942-03-09 | G1, G2, G4, G8, G9, G14, G23, G24, G33, G34, G35, G38; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | G24 end-March Europe/front, replacing G5/G7; G33/G35 Greece; G23 China; NE provinces and G8/G9 conquest dates. | 31 March for 9 March (+22 days), replacing the former 5 May front (+57 days). Crimea/date differences remain approximate. Vichy France keeps only the G24 parts containing Vichy and Corsica, so annexed Moselle (drawn in the Reich colour) stays German. |
| K7 · 1942-11-08 | G1, G2, G4, G13, G14, G22, G23, G33, G34, G35, G38; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | G13 October Europe/front; G33/G35 Greece; G23 China; NE island/province selections dated by G22. | End-October Europe for 8 November; existing dates retained. |
| K8 · 1943-07-12 | G1, G2, G4, G14, G20, G23, G25, G33, G34, G35, G38; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | G14 December 1942 occupation zones + G25 July 1943 front; CMH Greece/municipal Crete; G23 China; G20 Pacific dates. | 4 July front for 12 July (−8 days); northern section above 60 N comes from monthly/Finnish layers. December 1942 western occupation zones remain applicable. |
| K9 · 1944-06-05 | G1, G2, G4, G14, G19, G20, G23, G25, G26, G32, G34; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | G25 + G26 April 1944 east; G32 Gustav Line + existing Rome/Latina/Frosinone provinces, Sardinia/Corsica; G19 Henan + G23 China. | 30 April east for 5 June; Crimea coastal closure keeps the established May liberation convention. 11 May Gustav Line is advanced by the existing Rome province step (4 June). |
| K10 · 1944-12-16 | G1, G2, G4, G19, G20, G21, G23, G25, G27, G28, G29, G34, G35; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | G27 December eastern front/Courland; G28 western front; G29 Italy; CShapes/OHM Balkan states, G35 western Crete; G19 + G23 China. | Eastern/Italian line 31 December (+15 days), western line 15 December (−1 day). Existing end-month convention; Budapest remains approximate at this scale. |
| K11 · 1945-05-08 | G1, G2, G4, G19, G21, G23, G27, G30, G31, G34, G35; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | G30 Soviet 7 May limit, G31 Allied gains/German pockets, G27 Courland; dated OHM zones and municipal western Crete; G19 + G23 China. | 7 May government plates for 8 May (−1 day); Bohemia/Moravia holdouts preserved. Courland retains the 31 December 1944 front, as in the former output, and is approximate for May; the pocket contracted during 1945. Municipal Chania pocket is approximate. Only the G31 white regions holding Bohemia-Moravia/Austria are kept (registration slivers on the Rhine, Saar and Elbe dropped). Fortress Holland, joined on G31 to the liberated south, is the provinces of North Holland, South Holland and Utrecht (G4 admin-1 approximation). Finnmark (G4), evacuated by German forces by February 1945, is left out of German-held Norway. |
| K12 · 1945-09-02 | G1, G2, G34; G1 NC-SA, G2 CC0, G35 BY when present, all others PD; output NC-SA | CShapes + OHM date queries; no registered front. Existing surrender/administration conventions retained. | Singapore/British administration anticipates 5–12 September landings (original bilingual map label); Taiwan transfer 25 October; Korea divided at 38 N as before. |

## Registration results

Great-circle fitted residuals, not historical boundary uncertainty. Budgets: max 30 km Europe / 60 km Asia. Leave-one-out RMS is reported separately; it is not substituted for fitted residual. All current registrations pass.

| Map | Points | Model | RMS km | Max km | LOO RMS / max km |
|---|---|---|---|---|---|
| G10 europe-1939-09 | 42 | lcc(10.3,41.3,65.1)+poly2 | 3.8 | 12.9 | 4.6 / 15.9 |
| G11 europe-1940-06 | 42 | lcc(10.3,41.3,65.1)+poly2 | 3.8 | 12.9 | 4.6 / 15.9 |
| G12 europe-1941-11 | 42 | lcc(10.3,41.3,65.1)+poly2 | 3.8 | 12.9 | 4.6 / 15.9 |
| G13 europe-1942-10 | 42 | lcc(10.3,41.3,65.1)+poly2 | 3.8 | 12.9 | 4.6 / 15.9 |
| G14 europe-1942-12 | 42 | lcc(10.3,41.3,65.1)+poly2 | 3.8 | 12.9 | 4.6 / 15.9 |
| G24 europe-1942-03 | 42 | lcc(10.3,41.3,65.1)+poly2 | 3.8 | 12.9 | 4.6 / 15.9 |
| G19 china-1945 | 16 | lcc(114.0,26.6,40.4)+affine | 15.1 | 28.3 | 19.0 / 35.5 |
| G23 pd-china-1940 | 29 | lcc(109.0,25.3,38.5)+poly2 | 20.1 | 53.7 | 25.9 / 70.8 |
| G31 pd-gains-1945 | 19 | lcc(11.7,45.1,52.5)+affine | 9.1 | 20.2 | 10.6 / 21.9 |
| G25 pd-27 | 16 | lcc(34.0,47.5,57.5)+affine | 15.5 | 28.4 | 19.2 / 34.6 |
| G26 pd-29 | 15 | laea(29.1,51.7)+poly2 | 9.9 | 22.6 | 15.6 / 30.8 |
| G27 pd-31 | 15 | laea(26.1,52.3)+poly2 | 10.0 | 22.8 | 16.7 / 29.5 |
| G28 pd-71 | 14 | equirectangular+poly2 | 13.9 | 24.7 | 31.1 / 77.2 |
| G29 pd-51 | 14 | lcc(12.5,43.8,46.0)+affine | 4.4 | 6.7 | 5.4 / 7.8 |
| G32 pd-48 | 14 | laea(14.9,40.3)+affine | 10.4 | 19.5 | 14.0 / 24.9 |
| G30 pd-82 | 15 | laea(13.0,50.7)+affine | 11.2 | 24.7 | 13.5 / 28.3 |
| G33 greece | 10 | equirectangular+affine | 17.1 | 25.3 | 23.7 / 35.1 |
| G36/G37 route main map | 18 | laea(29.4,52.7)+poly2 | 9.9 | 24.7 | 15.0 / 31.3 |

USMA route registration replaces obscured Leningrad/Tilsit control locations with visible Helsinki/Tallinn/Viipuri/Kaunas city rings; no point was removed merely to reduce residual. Main-map plate 20 shares the printed plate 19 base; its Moscow inset is excluded. Route axes are sampled from published drive corridors through named places, not precise roads or individual unit tracks. Town endpoints are factual coordinates. Pixel waypoints, control points and fit: `scripts/geo/ww2/route-registration.json`; generator does not read old route paths.

## Derived geo files (complete active inventory)

| Files | Inputs | Output licence |
|---|---|---|
| `work/ohm-k1.geojson` … `work/ohm-k12.geojson` | G2, 12 dated relation exports | CC0 1.0 |
| `work/svg-europe-1939-09.geojson` | G10, registration above | Source Public domain (released by the author); Atlas adaptation CC BY-NC-SA 4.0 |
| `work/svg-europe-1940-06.geojson` | G11, registration above | Source Public domain (released by the author); Atlas adaptation CC BY-NC-SA 4.0 |
| `work/svg-europe-1941-11.geojson` | G12, registration above | Source Public domain (released by the author); Atlas adaptation CC BY-NC-SA 4.0 |
| `work/svg-europe-1942-10.geojson` | G13, registration above | Source Public domain (released by the author); Atlas adaptation CC BY-NC-SA 4.0 |
| `work/svg-europe-1942-12.geojson` | G14, registration above | Source Public domain (released by the author); Atlas adaptation CC BY-NC-SA 4.0 |
| `work/svg-europe-1942-03.geojson` | G24, registration above | Source Public domain (released by the author); Atlas adaptation CC BY-NC-SA 4.0 |
| `work/raster-china-1945.geojson` | G19, registration above | Source Public domain (US Government work); Atlas adaptation CC BY-NC-SA 4.0 |
| `work/raster-pd-china-1940.geojson` | G23, registration above | Source Public domain (US Government work); Atlas adaptation CC BY-NC-SA 4.0 |
| `work/raster-pd-gains-1945.geojson` | G31, registration above | Source Public domain (US Government work); Atlas adaptation CC BY-NC-SA 4.0 |
| `work/lines-traces.geojson` | G25–G30, G32–G33; registered source pixels (open lines) | Atlas redigitisation CC BY-NC-SA 4.0; source maps PD |
| `work/svg-lines.geojson` | Same front traces; G4 Greece clipping; G27 Courland erasure | Atlas redigitisation CC BY-NC-SA 4.0; source maps PD |
| `work/K1.geojson` … `work/K12.geojson` | Per-frame sources above; no BY-SA | CC BY-NC-SA 4.0 |
| `data/control.json` | All 12 composed frames + G34 coast; one TopoJSON | CC BY-NC-SA 4.0 |
| `data/movements.json` | Original 28 compatible routes; 3 independently redigitised axes G36/G37 (S75/S76 historical cross-check); route-by-route ledger below | CC BY-NC-SA 4.0; no BY-SA geometry |
| build `dist/topics/ww2/data.json` | Control, movements, original bilingual facts/text | CC BY-NC-SA 4.0; no BY-SA geometry |
| `public/geo/land-50m.json`, `land-10m-sea.json` | Existing Natural Earth basemap; unchanged | Public domain |
| `provenance/map-provenance.json`, manifests / fit reports / checksums | Source metadata and audit, not old map geometry | Atlas documentation CC BY-NC-SA 4.0 |
| `work/previews/*.png`, `work/lines-show-*.png` | Rebuilt maps or PD originals with traced lines | Rebuilt maps NC-SA; source maps remain PD; Atlas overlays NC-SA |

## Retired inputs and inventory before replacement

Seven traced BY-SA maps were removed: G3 → G23 original China raster; G5 → G12/G24 monthly Europe + G33 CMH Greece; G7 → G24 March Europe; G15 → G25 USMA July 1943; G16 → G26/G27 USMA April/December 1944; G17 → G30 USMA May 1945; G18 → G28/G29/G31/G32 USMA western/Italian fronts and gains. G6 was cross-check only and is no longer active. S92’s Gdr route map → G36/G37. Source-specific derivative files for the seven maps are absent from the active work directory.

| Former frame | Inputs recorded in original control features | Conflicting BY-SA + NC-SA? |
|---|---|---|
| K1 · 1937-07-07 | G1, G2 | No |
| K2 · 1938-10-27 | G1, G2, G3, G4 | Yes |
| K3 · 1939-10-06 | G1, G2, G3 | Yes |
| K4 · 1940-07-01 | G1, G2, G3, G11 | Yes |
| K5 · 1941-12-05 | G1, G2, G3, G5, G12 | Yes |
| K6 · 1942-03-09 | G1, G2, G3, G4, G5, G7 | Yes |
| K7 · 1942-11-08 | G1, G2, G3, G4, G5, G13 | Yes |
| K8 · 1943-07-12 | G1, G2, G3, G4, G5, G14, G15 | Yes |
| K9 · 1944-06-05 | G1, G2, G3, G4, G5, G15, G16, G18, G19 | Yes |
| K10 · 1944-12-16 | G1, G2, G3, G4, G15, G16, G18, G19 | Yes |
| K11 · 1945-05-08 | G1, G2, G3, G4, G16, G17, G18, G19 | Yes |
| K12 · 1945-09-02 | G1, G2 | No |

The old mixed `control.json` had 10 affected frames (K2–K11). Its 7 source-specific traced GeoJSONs, composed K2–K11 files and shared topology are superseded, not relicensed. The old routes had three S92-derived paths; they are replaced rather than labelled as a compatible collection. `licence-inventory-before.json` lists each retired source URL, author, original licence and derivative file. The original basemaps and 28 other route paths remain unchanged.

## Rebuild and offline QA

```sh
git show 6668a386ab3b68e04dd7c2f61aa7cd0d311a1886:src/content/topics/ww2/data/control.json > /tmp/ww2-control-before.json
pnpm tsx scripts/geo/ww2/prepare.ts
pnpm tsx scripts/geo/lib/ohm-export.ts --topic ww2
pnpm tsx scripts/geo/lib/georef-svg.ts --topic ww2
pnpm tsx scripts/geo/lib/georef-raster.ts --topic ww2
pnpm tsx scripts/geo/lib/lines.ts --topic ww2
pnpm tsx scripts/geo/ww2/finalize-lines.ts
pnpm tsx scripts/geo/ww2/stamp-sources.ts
pnpm tsx scripts/geo/lib/compose.ts --topic ww2
pnpm tsx scripts/geo/ww2/restore-source-coverage.ts
pnpm tsx scripts/geo/lib/simplify.ts --topic ww2
pnpm tsx scripts/geo/ww2/redraw-routes.ts
pnpm tsx scripts/geo/ww2/audit-licences.ts
pnpm tsx scripts/geo/ww2/audit-map.ts
pnpm tsx scripts/geo/ww2/coverage-audit.ts
pnpm tsx scripts/geo/ww2/render-previews.ts /tmp/ww2-control-before.json
pnpm tsx scripts/geo/ww2/write-source-ledger.ts
```

Offline PNGs: `scripts/geo/ww2/work/previews/K1.png` … `K12.png`, `all-keyframes.png`, `routes-pd-19.png`, `routes-pd-20.png`; source-line overlays `work/lines-show-*.png`. These rasterise the actual decoded output geometry in Mercator using the existing Natural Earth land; they are not browser/UI screenshots. No browser, desktop or Chromium was used.

Full route and numbered-fact bibliography: `src/content/topics/ww2/data/SOURCES.md`.
