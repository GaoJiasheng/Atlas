# The First World War map data — source survey and per-keyframe provenance

Every edge in `src/content/topics/ww1/data/control.json` comes from a dataset below; nothing is drawn by hand. Reference ids `[G#]` are the same as in the topic's `data/SOURCES.md`. Commands: `pnpm tsx scripts/geo/lib/<step>.ts --topic ww1` (skill atlas-history-topic, references/geo-runbook.md). Content plan: `docs/11-ww1-content-spec.md` §5.

## 1. Survey

### Used for geometry

- **[G1] CShapes 2.0 (GW version)** — https://icr.ethz.ch/data/cshapes/ (file `CShapes-2.0.geojson`). Schvitz, Rüegger, Girardin, Cederman, Weidmann, Gleditsch, *Mapping the International System, 1886–2017: The CShapes 2.0 Dataset*, Journal of Conflict Resolution 66(1), 2022. Licence quoted from the dataset page (checked 2026-10-09): "CShapes by Schvitz, Rüegger, Girardin, Cederman, Weidmann, Gleditsch is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License." Coverage: independent states and colonial units, day-precise validity. Border changes are dated by treaty signature or annexation (Germany changes on 1919-06-28, Austria and Italy on 1919-09-10, Hungary and the Kingdom of Serbs, Croats and Slovenes on 1920-06-04, Romania gains Bessarabia on 1920-10-28). Limits for this topic: no German Micronesia, Samoa or Kiautschou; no Kuwait, Bahrain or Qatar; Cyprus only from 1914-11-05; the Ottoman Empire keeps its Arab provinces until 1920 (de jure); Russia is one unit through the civil war (Ukraine, Belarus and Transcaucasia inside it); no Kingdom of Hejaz.
- **[G2] OpenHistoricalMap** — boundary relations through https://overpass-api.openhistoricalmap.org/ (`ohm-export.ts`, sets `k1` and `k9` in `sources.json`; the export checks every relation's name and `start_date` / `end_date` against the set date — no warnings). Licence quoted from https://www.openhistoricalmap.org/copyright (checked 2026-10-09): "Except where otherwise noted, OpenHistoricalMap data is dedicated to the public domain under a Creative Commons CC0 dedication." Individual features may carry CC BY / CC BY-SA in `license=*` tags; none of the 25 relations used carries a `license` tag (checked in `raw/ohm-k1.json`, `raw/ohm-k9.json`). The same page says coastline data comes from OpenStreetMap (© OpenStreetMap contributors, CC BY-SA 2.0); some coastal member ways may descend from it, so OHM and OSM contributors are credited. Discovery: `--list 1914-07-28 --levels 1-2` (196 relations) and `--list 1919-06-28 --levels 1-2` (207), plus `--list 1919-06-28 --levels 1-4 --bbox 10,25,45,65` for the Middle East.

- **[G6] Natural Earth 1:10m admin-1 states and provinces** (v5, public domain) — https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/. Used only where an occupation is dated by events but no map within the residual budget was found: the unit is selected whole and clipped to the CShapes state of the day (Belgian provinces 1914, East Galicia and Bukovina 1914, south-western Russian Poland 1914, Mesopotamia, Hejaz, Russian-occupied eastern Anatolia, German East Africa, eastern Greek Macedonia, the Baltic and Belarus 1918, the OETA zones 1918). The error of such a unit is the distance between the province edge and the real line of the day; it is described per frame below, not measured as a residual.
- **Traced front lines** (`scripts/geo/ww1/lines.ts`, recipes in `lines.json`). The West Point–based WWI maps draw fronts as coloured lines, not filled areas, so `georef-svg.ts` has nothing to classify. `lines.ts` fits each map on city control points (same models and leave-one-out report as `georef-svg.ts`), follows the drawn line between via points as a least-cost path over pixels of the line colour (the report gives the share of the path on line-coloured pixels; dash gaps and labels on the line are bridged), transforms it, and closes the area on one side through `close` points that lie outside the state the step is clipped to; compose.ts always intersects the area with CShapes / OHM / Natural Earth borders, so every edge on the map is either a traced front or a dataset border. Overlays of every trace on its map: `work/lines-show-<line>-<n>.png`.

| Map (lines.json) | [G#] Commons file (licence on the file page, checked 2026-10-09) | Model, control points | RMS / max / leave-one-out RMS (km) |
|---|---|---|---|
| wf-1914, wf-1915-16, wf-1917, wf-1918 (same base, shared points) | [G7] Western_front_1914-es.svg, [G8] Western_front_1915-16-es.svg, [G9] Western_Front_1917-es.svg, [G10] Western_front_1918_allied-es.svg — Rowanwindwhistler after the US Military Academy atlas — "CC BY-SA 4.0" | laea + poly2, 38 cities | 1.6 / 3.5 / 1.9 |
| ef-1914, ef-1915, ef-1916 (same base) | [G11] MapOfWWIEasternFrontAutumn1914.svg (Goran tek-en), [G12] Ostfront_18021915-es.svg, [G13] EasternFront1916a-es.svg — "CC BY-SA 4.0" | equirectangular + poly2, 38 cities | 2.4 / 4.5 / 2.9 |
| wp-1917 | [G14] EasternFront1917.jpg — US Military Academy, map 41b — "Public domain" | lcc + affine, 57 cities (Kraków, Focșani, Cernavodă, Uman dropped: their labels sit off the symbols) | 9.2 / 21.9 / 9.7 |
| riga-1917 | [G23] Hutier's_Offensive_at_Riga.jpg — US Military Academy Campaign Atlas — "Public domain" | lcc + affine, 6 towns | 1.3 / 2.2 / 3.5 |
| caporetto | [G18] Battle_of_Caporetto-es.svg — Szajci, Rowanwindwhistler after the US Military Academy atlas — "CC BY-SA 4.0" | laea + affine, 36 towns | 3.2 / 14.8 / 3.4 |
| palestine-1917 | [G19] Palestine-WW1-2.jpg — US Military Academy — "Public domain" | laea + poly2, 12 towns | 1.7 / 2.9 / 4.8 |
| palestine-1918 | [G20] Palestine-WW1-3.jpg — US Military Academy — "Public domain" | equirectangular + affine, 19 towns | 4.7 / 12.3 / 5.2 |

- **[G16]** *Front d'Orient et Serbie en juillet 1916* (SVG; Jaspe, Rowanwindwhistler, SyntaxTerror) — https://commons.wikimedia.org/wiki/File:Front_d%27Orient_et_Serbie_en_juillet_1916.svg — "CC BY-SA 3.0". Fill-coded: the Bulgarian occupation zone of Serbia traced by `georef-svg.ts` (sources.json `svg.serbia-1916`, equirectangular + affine, 19 towns, RMS 8.0 km, max 26.1 km at Prizren, leave-one-out RMS 8.9 km). Serbia and Montenegro are otherwise taken whole from CShapes (both wholly occupied), northern and central Albania from its Austro-Hungarian zone.

### Cross-check images (not traced)

- **[G3]** *Map Europe alliances 1914* (English SVG), historicair (French original, 2006), Fluteflute and Bibi Saint-Pol (English, 2009) — https://commons.wikimedia.org/wiki/File:Map_Europe_alliances_1914-en.svg — Commons licence field: "CC BY-SA 2.5 | Creative Commons Attribution-Share Alike 2.5". Europe only; shows Italy in the Triple Alliance (its 1914 treaty position, before it declared neutrality).
- **[G4]** *German colonial empire* (SVG), Ketsdekaeru (2025) — https://commons.wikimedia.org/wiki/File:German_colonial_empire.svg — "CC0 | Creative Commons Zero, Public Domain Dedication". World view of the German colonies in 1914; Micronesia drawn as a maritime box.
- **[G5]** *Map Europe 1923* (English SVG), Historicair (French original), Fluteflute (English derivative, 2009) — https://commons.wikimedia.org/wiki/File:Map_Europe_1923-en.svg — "CC BY-SA 2.5 | Creative Commons Attribution-Share Alike 2.5". Post-war states and treaty changes; dated 1923, so it differs from K9 where later events intervene (Memel 1923, the Polish–Soviet border of 1921, Turkey after Lausanne).

- **[G15]** *Map Treaty of Brest-Litovsk-en.jpg* (US Military Academy, "Public domain") — K7/K8 check image. Not traced: 15 cities fit at 34 km RMS (max 64 km), over the 30 km budget; the Furfur SVG version (CC BY-SA 3.0) has generalised coasts and almost no towns to fit.
- **[G17]** *Area of the OETA* (SVG, SPQR10, "CC BY-SA 4.0") — K8 check image for the OETA zones drawn from Natural Earth units.
- **[G21]** *ATD of the regions of Turkey occupied by Russian troops during WW1* (PNG, Accipite7, "CC BY-SA 4.0") — K5/K6 check image for Russian-occupied eastern Anatolia.

### Looked at and not used

- *Area of the OETA* is dotted lines only (no fills), so it is a check image ([G17]) and K8 draws the zones with Natural Earth units; K9 still names them in the Ottoman label.
- *FrenteMacedonio1915-1916.svg*, *Battle of Galicia* SVGs, *Meso-WW1-2.jpg*, *Middle East 1914-1919.jpg* (1919 Philip atlas), *Map Europe WW1 Frontlines as of 1916.png*: looked at; either superseded by a map above, too small-scale, or (the Macedonian front around Monastir) left for a later pass.
- *OETA Syria* (PNG, CC BY-SA 3.0), *Russian State (1 Jan 1919)* (PNG, CC BY-SA 4.0), *Map of Europe in 01-01-1919* (PNG, CC BY-SA 4.0, 2025): either the wrong date for K9 or recent amateur compilations without cited sources.
- *Bartholomew's general war map of Europe and the Mediterranean, 1919* (National Library of Wales, public domain): a reference map, not a dated control map.
- No sourced map of the Russian civil-war fronts on or near 28 June 1919 was found; per the content spec Russia is one holder with a civil-war label.

## 2. Keyframes

K1 and K9 are dataset queries (no georeferencing); K2–K8 add traced front lines and dated Natural Earth units (residuals in §1). Simplification: `simplify.ts --fine 1.5` (see §4).

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

Frames K2–K8 (built 2026-10-09). Holders are only existing entities; occupied territory takes the occupier's holder and says so in its label.

### K2 · 1914-09-09 — the Marne
- **West**: German-held area east of the composite line traced on wf-1914 (the German line on the Marne from Montmirail to Verdun and the Lorraine front, red; the Allied line on the Ourcq of 9 September, blue; north of Noyon the race-to-the-sea front of mid-October, red), minus the Belgian provinces of Antwerp, East and West Flanders (still Belgian on 9 September). The two gaps of the battle (Noyon–Ourcq, Meaux–Montmirail) are joined straight across ≈ 35 km; Lille and French Flanders are shown occupied a month early. Luxembourg whole.
- **East**: Russian-held East Prussia east of the 1st Army front of 10 September (ef-1914, blue dashed; north of Wehlau joined straight to the lagoon); East Galicia and Bukovina by Natural Earth oblasts (L'viv, Ternopil', Ivano-Frankivs'k, Chernivtsi; Lemberg fell 3 September, Czernowitz 2 September), so the western edge is the modern oblast line, up to ≈ 50 km off the front on the Wereszyca.
- **Colonies**: Togoland (OHM r2694162, Anglo-French, holder `uk`), Samoa (OHM r2846171); German New Guinea, Micronesia and Kiautschou still German (Rabaul fell 11–17 September).
- Check: `docs/screenshots/ww1/geo-K2.png` (western front vs [G7], eastern front vs [G11]).

### K3 · 1914-12-15 — trench line and the Russian winter front
- **West**: west-1915 (wf-1915-16, the January 1915 line, unchanged since November 1914).
- **East**: Russian front of 7 February 1915 in Poland and Galicia (ef-1915; unchanged since mid-December) — east of it Galicia and Bukovina to Russia, west of it western Russian Poland to Germany (Łódź 6 December) with Świętokrzyskie, Lesser Poland and Silesian provinces to Austria-Hungary; East Prussian line held since November (ef-1915, red). Przemyśl (besieged, Austro-Hungarian until March 1915) is inside the Russian area. Serbia whole (Belgrade retaken 15 December).
- **Colonies / Middle East**: Micronesia (OHM r2961775) and Kiautschou to Japan; New Guinea, Nauru to Australia; Basra by its Natural Earth province. Kamerun stays German (Duala's fall on 27 September is not drawn).
- Check: `geo-K3.png`.

### K4 · 1915-12-31 — after the Great Retreat
- **West**: west-1915. **East**: Riga–Dvinsk–Pinsk from wp-1917 (that line did not move from autumn 1915 to September 1917), Pinsk–Romanian border from ef-1916 (March 1916); west of it Central Powers (one `germany` holder labelled with Ober Ost and the General Government of Warsaw; western Volhynia, Austro-Hungarian in fact, is inside it), the General Government of Lublin (OHM r2695683) to Austria-Hungary; the Russian strip of eastern Galicia from the same line.
- **Serbia**: whole country occupied (CShapes), Bulgarian zone from [G16] painted over it. Montenegro not yet (Lovćen fell 11 January 1916).
- **Italy**: Austrian territory held by Italy = south-west of the 24 October 1917 line (caporetto). That line includes the Gorizia (1916) and Bainsizza (1917) gains, ≤ 20 km beyond the line of December 1915; stated in the step note.
- **Africa / Middle East**: South West Africa to South Africa (CShapes base); Kamerun to France with the British zone from OHM r2828750 (the 1916 occupation zones; German forces still held Yaoundé until 1 January 1916, in the label); Lower Mesopotamia by Natural Earth provinces (Basra, Maysan, Dhi-Qar, Wasit incl. besieged Kut). The Helles bridgehead at Gallipoli (evacuated 9 January 1916) is too small for the budget and is not drawn.
- Check: `geo-K4.png` (Serbia vs [G16], Italy vs [G18]).

### K5 · 1916-12-18 — Verdun, the Somme, Romania
- **West**: west-1916 = the January 1915 line with the Somme bulge of 18 November 1916 (wf-1915-16, dotted 11/1916); Verdun back on its February 1916 line.
- **East and Romania**: the wp-1917 line of 1 January 1917 from Riga to the Danube delta. It is two weeks after the keyframe: on 18 December the Romanian retreat to the Siret was still under way (Brăila fell 5 January), so the occupied area of Wallachia is up to ≈ 60 km too large near Buzău–Brăila. Brusilov gains in Galicia and Bukovina east of the line to Russia; Kingdom of Poland from OHM r2695684.
- **Balkans**: Serbia as K4, Montenegro whole and northern/central Albania (Austro-Hungarian zone of [G16]); eastern Greek Macedonia (Natural Earth region Anatoliki Makedonia kai Thraki ∩ Greece) to Bulgaria. Allied recapture of Monastir (19 November 1916) not drawn.
- **Middle East / Africa**: Lower Mesopotamia (Basra, Maysan, Dhi-Qar); Hejaz = Natural Earth Makkah province; Russian-occupied eastern Anatolia = Rize, Trabzon, Gümüşhane, Bayburt, Erzurum, Erzincan, Ağrı, Van, Bitlis, Muş (unit edges vs the front west of Trabzon and Erzincan: ≤ 60 km). German East Africa: occupied provinces north and centre to `uk`, Tabora and Kigoma to Belgium, Ruanda-Urundi (OHM r2863621); Lindi, Mtwara, Ruvuma still German.
- Check: `geo-K5.png`.

### K6 · 1917-12-15 — Russian armistice, Caporetto, Jerusalem
- **West**: west-1917 (wf-1917, the Hindenburg Line of April 1917; 1917 battles moved it < 10 km).
- **East**: armistice front = Riga limit of advance of 5 September 1917 (riga-1917; north of Hinzenburg joined straight to the Gulf down the Livonian Aa) + wp-1917 Dvina–Pinsk–Brody + the post-Kerensky line of 3 August 1917 (wp-1917 dotted) + the Romanian front. Russian label: Soviet government, armistice 15 December. Finland from CShapes.
- **Italy**: Friuli and eastern Venetia north-east of the 12 November 1917 Piave–Grappa line (caporetto) to Austria-Hungary.
- **Palestine**: south of the Ottoman line of 30 December 1917 (palestine-1917, dotted red; joined straight from Et Tire to the coast at the Auja mouth, off the map); the 15 December line was ≤ 10 km south of it.
- **Mesopotamia**: Basra, Maysan, Dhi-Qar, Wasit, Babil, Karbala, Najaf, Qadisiyyah, Muthanna, Baghdad, Diyala (Ramadi and Tikrit areas are partly in Anbar and Salah ad-Din, left Ottoman). Hejaz, Anatolia as K5. Togoland split (OHM r2694159 / r2694161); German East Africa whole (the German force crossed into Mozambique 25 November).
- Check: `geo-K6.png` (Italy vs [G18], Palestine vs [G19]).

### K7 · 1918-03-20 — after Brest-Litovsk
- **West**: west-1917 (front on the eve of 21 March).
- **East**: K6 area + Estonia, Latvia and Brest, Grodno, Minsk, Mogilev, Gomel oblasts (Natural Earth; occupied in Operation Faustschlag) + Ukraine (OHM r2694815, whole 1918 extent; the advance reached Kharkov and the Crimea only in April — in the label) to `germany`; Lithuania (CShapes) German-occupied. Occupied parts of the Vitebsk and Pskov provinces are left out (the only map, [G15], fits at 34 km RMS). Bessarabia to Romania (CShapes 1920 minus 1914). Kars and Ardahan are Ottoman in CShapes from 3 March (occupied in April).
- **Palestine**: south of the front held March–September 1918 (palestine-1918). Russian-occupied Anatolia gone (Erzurum retaken 12 March).
- Check: `geo-K7.png` (east vs [G15], Palestine vs [G20]).

### K8 · 1918-11-11 — armistice
- **West**: west-1918 (wf-1918 dashed 11/11/1918 line; south of Étain the line held since St Mihiel). Ghent and Lille liberated, Brussels and the Ardennes still German.
- **Central Europe**: CShapes on 1918-11-11 (Poland, Czechoslovakia, Austria, Hungary as labelled units), State of Slovenes, Croats and Serbs (OHM r2747879) as `serbia` with its own label, Italian armistice occupation by the Saint-Germain line (CShapes 1919-09-10; Dalmatian occupation not drawn).
- **East**: Latvia (CShapes has no unit there on this date) and the six Belarusian oblasts, Ukraine and the Crimea (OHM r2854272) still German-occupied; Estonia and Lithuania as their new governments (CShapes); Wallachia occupied until December; Bessarabia Romanian; Georgia, Armenia, Azerbaijan (OHM, 1919 extents) with Batum (Ajaria) Ottoman.
- **Middle East (Mudros)**: OETA South = Israel, West Bank, Gaza units → `uk`; OETA West = Lebanon + Latakia, Tartus → `france`; OETA East = inland Syria + Jordan → `hejaz` (Faisal's administration); Mesopotamia incl. Anbar, Salah ad-Din, Kirkuk and Nineveh (Mosul entered early November) → `uk`; Kurdish provinces left Ottoman; Medina still Ottoman. Deir ez-Zor, Raqqa and Hasakah left Ottoman.
- Check: `geo-K8.png` (west vs [G10], Middle East vs [G17]).

## 3. Size and accuracy

- `control.json` (all 9 keyframes, `--fine 1.5`): one TopoJSON, 4,886 arcs, **999 KB** (1,022,847 bytes), under the 2.5 MB budget, so `--fine 1.5` stays. Printed deviation (both focus boxes): p50 0.20, p95 15.3, p99 38.9, max 92.1 km — the tail is still the OHM maritime polygons and lakes described below. Europe box `[-12, 34, 45, 72]` alone, all frames, coastal vertices included: p50 0.8 km, p95 9.6 km, p99 25.7 km (per frame p95 7.7–11.2 km).
- Earlier, K1 + K9 only: 2 keyframes, 1,702 arcs, 600 KB (614,051 bytes). Focus boxes: Europe and Middle East `[-12, 28, 62, 72]`, East Asia and western Pacific `[100, -12, 180, 50]` (Tsingtao, Micronesia, New Guinea); 1.5 km inside, 50 km outside; quantisation 400,000; DP; global coast clip with Natural Earth 1:50m land (no 1:10m detail region).
- Budget: 2.5 MB for 9 planned keyframes, pro rata 569 KB for 2. The automatic search reaches 5.25 km before it fits (570 KB at 5 km), because most of the file is the world coastline, which is a fixed cost shared by all keyframes, not a per-keyframe one. 1.5 km costs 31 KB more than the pro-rata figure; the 9-frame total is expected to stay under 2.5 MB (ww2: 12 frames, 2.12 MB at 1.5 km). Rerun the default search once all frames exist and decide then.
- Deviation printed by `simplify.ts` (focus boxes, original vertices to written boundary): p50 0.25 km, p95 15.3 km, p99 38.9 km, max 92.1 km. The tail is not simplification error: almost all of it is the OHM maritime polygons of Micronesia, the Gilbert Islands and Tonga (open-sea vertices up to 2,500 km from any land, erased on purpose by the coast step) and the lakes and inlets that Natural Earth `land` counts as land (Mälaren, the IJsselmeer, the Sea of Azov shore, the Yangtze estuary). Measured on the Europe box alone, including coastal vertices: K1 p50 1.0 / p95 9.5 km, K9 p50 0.7 / p95 7.6 km.

## 4. Rebuild

```bash
pnpm tsx scripts/geo/lib/fetch.ts --topic ww1
pnpm tsx scripts/geo/lib/ohm-export.ts --topic ww1
pnpm tsx scripts/geo/lib/georef-svg.ts --topic ww1          # serbia-1916
pnpm tsx scripts/geo/ww1/lines.ts                           # traced fronts -> work/svg-lines.geojson
pnpm tsx scripts/geo/lib/compose.ts --topic ww1
pnpm tsx scripts/geo/lib/simplify.ts --topic ww1 --fine 1.5
pnpm tsx scripts/geo/lib/check.ts --topic ww1
```

## 5. Licences

`control.json` is a derived database combining CC BY-NC-SA 4.0 geometry (CShapes), CC0 geometry (OHM; coastal ways possibly from OpenStreetMap, CC BY-SA 2.0), public-domain Natural Earth units and front lines traced from CC BY-SA 3.0 / 4.0 Commons maps ([G7]–[G13], [G16], [G18]: attribute the authors named above, share alike) and public-domain US Military Academy maps ([G14], [G19], [G20], [G23]). Each feature keeps its source ids in `properties.src`; `data/SOURCES.md` attributes every source. Obligations: attribute CShapes and use it non-commercially, share derived data under CC BY-NC-SA 4.0; credit OpenHistoricalMap (and OpenStreetMap contributors for coastlines). The cross-check images [G3]–[G5], [G15], [G17], [G21] are not part of the published data; they appear only in the check screenshots, which carry their attribution. Before any commercial use the CShapes-derived base would have to be replaced.
