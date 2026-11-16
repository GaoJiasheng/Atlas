# The Silk Roads map data — source survey and provenance

Every edge in `src/content/topics/silk-road/data/control.json`, every route line (`public/geo/sr-*.json`), the journeys (`data/movements.json`) and the rivers (`public/geo/silk-road-rivers.json`) comes from a dataset below or is built by a rule written in a script here; nothing is drawn by hand, no `bbox` is used as a territory, no coordinate is typed from memory. Reference ids `[G#]` are those of the topic's `data/SOURCES.md`. Cliopatria inventory and decisions: `INVENTORY.md`. Spec: docs/73 §3.

## 1. Survey

| ref | dataset | licence (quoted from its file or page) | used for | limits |
|---|---|---|---|---|
| [G1] | **Cliopatria v0.2.1**, Seshat Global History Databank (release 2026-10-03; Zenodo 13363121; doi:10.1038/s41597-025-04516-9). Downloaded 2026-11-15 from the tagged repository; SHA-256 in INVENTORY.md | LICENSE.md: “licensed under a Creative Commons Attribution 4.0 International License … as long as you give appropriate credit … and indicate if changes were made.” | 14 control keyframes | README: the maps are “only one version” of past territory; polygons overlap (§5); the four Mongol khanates exist only from 1294 |
| [G2] | **Natural Earth 1:10m land**, as `public/geo/ancient-world-plate.json` (built for ancient-civilisations, SOURCES-GEO §3 there) | public domain | plate land and coast; the 0.025° water raster of the sea legs | today's coast; DP 2 km closes the Bosporus (routes go through a waypoint, §7) and leaves the Pearl River, Hooghly, Indus creeks and Shatt al-Arab as land |
| [G3] | **Natural Earth 1:10m rivers_lake_centerlines v5.0.0** (2,079,507 bytes, SHA-256 `ded71b01870855ccfe19b51f2ec14c9bb48fae23c0e9f3c11974d426433b5c38`) and **lakes v5.0.0** (2,349,685 bytes, SHA-256 `0803a06f9c3cb4671d89b68c48b142aad9366ba40f665245e12a913fbc61722a`), naciscdn.org, downloaded 2026-11-15 | public domain | 15 rivers and the Aral Sea and Issyk-Kul outlines | today's courses and shores (the Aral Sea is today's) |
| [G4] | **Wikidata** P625, read by `points.ts` on 2026-11-15 (130 places, `places.json`) | CC0 | every point | one point per item; region points (Ferghana, Bactria, Badakhshan, Lintao for Longxi, Sri Lanka) are reference points only; Bactria's Wikidata point is Balkh's |
| — | **al-Thurayya** gazetteer (github.com/althurayya/althurayya.github.io): `DATA-LICENSE.md` and `README.md` read 2026-11-15 (DATA-LICENSE.md 1,071 bytes, SHA-256 `f99d3f9f9bee98aaabf99bedd8200c4ee7c9e90ae1d32e696b19540163271837`) | DATA-LICENSE.md: CC BY 4.0 covers “original project data such as curated place records, route records, coordinates … It does not automatically apply to source-derived material, third-party data …”; README: the route sections are “georeferenced from Georgette Cornu's *Atlas du monde arabo-islamique à l'époque classique* (Leiden: Brill, 1983)” | **not used** | the route geometry is derived from a copyrighted atlas and is not clearly inside the CC BY grant, so `routes.json` / `places.geojson` were not downloaded; the 9th-century layer joins Ibn Khurradadhbih's stops instead (spec §0.1-5 fallback) |

Not used (spec §3.1): Pleiades (no coordinate adopted, no attribution owed), Commons maps C1–C2 (not traced), Itiner-e, ORBIS, PastPart, CHGIS, OWTRAD, historical-basemaps, DARMC, the Flappiefh plague map.

## 2. Pipeline and commands

```bash
pnpm tsx scripts/geo/silk-road/inventory.ts            # G0: Cliopatria inventory, raw/cliopatria-subset.geojson, raw/check-K#.geojson
pnpm tsx scripts/geo/silk-road/build-keyframes.ts      # G3: sources.json recipes + overlap check (work/overlaps.json)
pnpm tsx scripts/geo/lib/compose.ts --topic silk-road  # work/K#.geojson
pnpm tsx scripts/geo/lib/simplify.ts --topic silk-road # data/control.json
pnpm tsx scripts/geo/silk-road/finalize-control.ts     # certainty: approximate on every feature + ring check
pnpm tsx scripts/geo/silk-road/build-rivers.ts         # G2: public/geo/silk-road-rivers.json
pnpm tsx scripts/geo/silk-road/points.ts               # G4: places.json (Wikidata)
pnpm tsx scripts/geo/silk-road/routes.ts               # G5–G7: public/geo/sr-*.json and data/movements.json
pnpm tsx scripts/geo/lib/colour-holders.ts --topic silk-road   # adjacency report; colours then set so that holders of one frame all differ (§6)
pnpm tsx scripts/geo/lib/check.ts --topic silk-road    # G9: docs/screenshots/silk-road/geo-K#.png
```

Downloads came only from the hosts named in the spec (GitHub for Cliopatria and the al-Thurayya licence files, naciscdn.org for Natural Earth, the Wikidata API). No terms page, consent form or human check was met.

## 3. Plate (G1)

`topic.yaml`: `basemap.region { bounds: [-12, -12, 135, 58], land: ancient-world-plate, rivers: silk-road-rivers }`, `maxZoom: 9`. The land file is reused unchanged (no new land file). It extends to [-30, -72, 155, 72], so the plate's cut edge stays outside the camera bounds.

## 4. Rivers (G2)

`build-rivers.ts`: Natural Earth rivers by `name_en`, clipped to the plate, DP 500 m: Amu Darya, Syr Darya (`Syr Dar`), Zeravshan, Tarim, Ili, Volga, Don, Tigris, Euphrates, Indus, Ganges, Nile, Wei, Yangtze, and the Yellow River **only between 103.7° E (Lanzhou) and 113.546° E (Zhengzhou, the cut of ancient-rivers.json)**: its lower course of today dates from 1855 and is not drawn. Lake outlines (outer rings, DP 500 m): Aral Sea (north and south parts of today's lake), Issyk-Kul. Output **118 KB** (budget 200 KB), 17 features. Nothing is copied from `ancient-rivers.json` (which holds CC BY-SA courses).

## 5. Control keyframes (G3)

Method for every frame: the Cliopatria records whose `FromYear ≤ year ≤ ToYear` for each holder (unchanged; several records of one holder are their union), painted in the order of `keyframes.json`, dissolved per holder (`compose.ts`), simplified across all frames in one topology (`simplify.ts`: DP 1.5 km inside the focus box = the whole plate, quantisation 400,000) and clipped to the plate coast (gap 6 km). Two holders borrow the nearest record within 50 years: K14 Ming (1375–1384 for 1368) and Golden Horde (1352–1362 for 1368). Per-frame records: INVENTORY.md.

Overlaps over 2 % of the smaller area (Cliopatria draws polities independently) were decided by paint order, the later record winning: K7 Tang/Tibet (the Tang outline covers the whole Tibetan outline; Tibet painted later), K7 and K8 Abbasid/Byzantine (Byzantium painted later in Anatolia), K12 Mongols/Nicaea (Nicaea painted later). Reasons in `keyframes.json` `overlapDecisions`.

Output: `control.json` **669 KB** (budget 2 MB), 5,890 arcs, 64 features, all `certainty: "approximate"`; **rings: 944, zero-area 0, self-crossing 0** (`simplify.ts` and `finalize-control.ts`; slug in `tests/geo-rings.test.ts`). Deviation of original vertices from the written boundary: p50 5.98 km, p95 11.09 km, p99 22.60 km, max 44.45 km (mostly Cliopatria's coasts replaced by the Natural Earth coast).

| K | date | holders |
|---|---|---|
| K1 | 138 BCE | han, xiongnu, parthia, rome |
| K2 | 60 BCE | han, xiongnu, parthia, rome |
| K3 | 50 CE | han, xiongnu, kushan, parthia, rome |
| K4 | 240 CE | sasanian, kushan (Eastern and Western Kushans), rome |
| K5 | 400 CE | sasanian, gupta, rome (Western and Eastern Roman records) |
| K6 | 629 CE | tang, sasanian, eastern-rome, western-turks, tibet |
| K7 | 751 CE | tang, abbasid, eastern-rome, tibet, uyghur |
| K8 | 786 CE | tang, abbasid, eastern-rome, tibet, uyghur |
| K9 | 971 CE | song, liao, eastern-rome, fatimid, chola |
| K10 | 1206 | jin, song, khwarazm, mongols |
| K11 | 1254 | mongols, song, mamluk, eastern-rome (Nicaea) |
| K12 | 1271 | mongols (one area: Cliopatria has no separate khanates before 1294), song, mamluk, eastern-rome (Nicaea) |
| K13 | 1335 | yuan, ilkhanate, golden-horde, chagatai, mamluk, eastern-rome, delhi |
| K14 | 1368 | ming (1375 record), golden-horde (1362 record), chagatai, mamluk, eastern-rome, delhi |

Side-by-side images (product left, the frame's raw Cliopatria records right): `docs/screenshots/silk-road/geo-K1.png` … `geo-K14.png` (§9).

## 6. Colours

`colour-holders.ts --write` gave each holder a colour different from its neighbours; the colours were then reassigned (DSatur over "shown in the same frame", keeping the tool's colour where possible) so that every holder of one frame, and the sphere drawn with it, differs from all the others in that frame. Line layers and journeys: `token:ink-2` (land) and `token:cold` (sea).

## 7. Points and routes (G4–G7)

`points.ts`: 130 places, Wikidata P625 to 5 decimals (`places.json`, QID and note per place). Places a source names but that have no Wikidata point or no agreed location are **not** on any line: Rinan (the 166 visitors are timeline-only), Sarai (Rubruck's Volga stop and Pegolotti's “Sara”), Anatho (Isidore), Kangju, the Xiongnu court, Huangzhi and the other stops of the Han sea voyage, Tiaozhi, Yepoti, Kara-Djigach (the 1338 graves are marked at the Burana tower, the study's second cemetery).

`routes.ts` reads `itineraries.json` (stops and the text each line follows):

- **Land legs**: great-circle lines between consecutive stops, sampled every 25 km. They are not roads.
- **Sea legs**: the plate land is rasterised to a 0.025° grid; water connected to the open sea is flood-filled from seed points (Indian Ocean, Mediterranean, Black Sea, Sea of Marmara, Atlantic, South China Sea), so no port snaps into a lagoon; a port moves to the nearest such cell within 15 km (Banbhore 40 km, Tamluk 60 km, al-Ubulla 130 km: river ports whose water the plate does not draw); an island's inland point (Sri Lanka, `offshore`) is passed by at sea; 8-neighbour A* with great-circle steps; Douglas–Peucker 3 km, halved until the water path crosses no more than 1 km of drawn land. Where the 2 km coast closes the Bosporus, the line runs to a Bosporus waypoint and straight through the strait.
- Each layer is a TopoJSON file with one object named like the file, quantisation 100,000; every line has `{ f, u, certainty: "approximate", src }`.

| file | lines | size |
|---|---|---|
| `sr-routes-han.json` | 4 (Hexi, southern road, northern road, Isidore) | 5 KB |
| `sr-sea-periplus.json` | 2 | 3 KB |
| `sr-routes-tang.json` | 1 | 1 KB |
| `sr-sea-tang.json` | 1 | 6 KB |
| `sr-routes-abbasid.json` | 4 | 3 KB |
| `sr-routes-mongol.json` | 1 | 4 KB |

Length over drawn land of each sea leg, including the straight links from a river port to open water (`work/routes-log.txt`): Berenice–Muziris 4.4 km, Berenice–Barygaza 1.5 km, Tuen Mun–Cù Lao Chàm 1.9 km, Cù Lao Chàm–Phan Rang 3.9 km, Phan Rang–Côn Sơn 5.1 km, Côn Sơn–Sri Lanka 1.3 km, Sri Lanka–Kollam 1.3 km, Kollam–Bharuch 1.8 km, Bharuch–Banbhore 28.3 km (creek), Banbhore–al-Ubulla 81.7 km (creek and Shatt al-Arab), Clysma–Jeddah 1.8 km; journeys 2.9–7.7 km per leg. Guangzhou–Tuen Mun is a straight leg (the Pearl River is not drawn), 53.9 km over land.

## 8. Known simplifications and gaps

- Route lines are schematic by design: the stops are recorded, the lines between them are not (KEY, captions and the background chapter say so).
- Cliopatria's one Mongol area in K12 (1271), although by then four Mongol realms existed; the chapter text names them and the map shows them from K13.
- The Han Hexi line orders the four commanderies along the corridor; the Han History gives no itinerary for it.
- Jia Dan's sea route: Hirth and Rockhill (1911) placed 乌剌 / 末罗 at Sohar and Old Hormuz; the line follows Hsieh 2010 (al-Ubulla, Basra).
- Today's coasts: the head of the Persian Gulf, the Indus delta and the Aral Sea are not the medieval ones.

## 9. Licences

- Cliopatria (CC BY 4.0): attributed in `data/SOURCES.md` [G1], `sources.json` S3 and THIRD-PARTY-NOTICES.md; changes indicated. The control areas stay under the content licence (CC BY-NC-SA 4.0).
- Natural Earth (public domain), Wikidata (CC0): no obligation; credited.
- No CC BY-SA, ODbL or source-derived third-party geometry is in any published file; LICENSE-CONTENT needs no new exception.
