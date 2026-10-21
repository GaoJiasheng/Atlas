# Ancient Civilisations map data — source survey and per-keyframe provenance

Every edge in `src/content/topics/ancient-civilisations/data/control.json`, in the dated sphere layers (`public/geo/ac-*.json`), the plate land (`public/geo/ancient-world-plate.json`) and the rivers (`public/geo/ancient-rivers.json`) comes from a dataset below; nothing is drawn by hand, no `bbox` is used as a territory, no coordinate is typed from memory. Reference ids `[G#]` are the same as in the topic's `data/SOURCES.md`. Inventory and the decisions taken on it: `INVENTORY.md` (this folder). Spec: docs/43 §3.

## 1. Survey

| ref | dataset | licence (quoted from its page) | used for | not used for / limits |
|---|---|---|---|---|
| [G1] | **Cliopatria v0.2.1**, Seshat Global History Databank. Release <https://github.com/Seshat-Global-History-Databank/cliopatria/releases/tag/v0.2.1> (2026-10-03); Zenodo record 13363121; data paper doi:10.1038/s41597-025-04516-9 | LICENSE.md: "licensed under a Creative Commons Attribution 4.0 International License … as long as you give appropriate credit to the original author(s) and the source, provide a link to the Creative Commons license, and indicate if changes were made." | all 15 control keyframes (K1–K15) and the three sphere layers | The README: "these maps reflect only one version of the territory held by past polities". The data paper says the polygons were redrawn by hand from published atlases, with references by region, not per polygon. Hence every feature is `certainty: approximate`. |
| [G2] | **Natural Earth 1:10m land**, via the `world-atlas` npm package (`land-10m.json`, already in node_modules) | public domain (Natural Earth terms of use, <https://www.naturalearthdata.com/about/terms-of-use/>, as read in the research pass: "no permission or credit required"; art/research/ancient-civilisations/datasets.json) | the plate land and its coast; the coast every control area and sphere is clipped to | today's coast: the head of the Persian Gulf, the Nile and Indus deltas and the Yellow River delta are not the ancient ones (chapter 01 says the sea reached about 200 km further inland) |
| [G3] | **Natural Earth 1:10m rivers_lake_centerlines v5.0.0** and **lakes v5.0.0**, <https://naciscdn.org/naturalearth/10m/physical/ne_10m_rivers_lake_centerlines.zip>, `…/ne_10m_lakes.zip` (raw/ne/; SHA-256 `ded71b01…5c38` and `0803a06f…722a`) | public domain (as G2) | 18 rivers by `name_en` and the Tonlé Sap lake outline | today's courses. Musi and Brantas are not in the dataset and are not drawn. |
| [G4] | **Yellow River reconstructed courses** from `public/geo/warring-states-rivers.json` (`huang-before-602-bc-58`, `huang-before-11-ad-57`), traced by the warring-states pipeline from Kanguole, *Ancient North China Plain blank relief map.svg* (Wikimedia Commons) | **CC BY-SA 4.0** (Commons file page) | two dashed courses, copied unchanged | the source file has no geometry for the 602 BCE – 11 CE course beyond Puyang, nor for any lower course after 11 CE; neither is drawn |
| [G5] | **Wikidata** (P625 coordinate location), fetched by `points.ts` on 2026-10-22, written to `places.json` (QID, 5-decimal point, labels) | CC0 (Wikidata:Licensing, read 2026-10-21: "All structured data … is released into the public domain under Creative Commons Zero.") | every event and site point; the ports of the sea routes | one representative point per item: Kalinga and Sambor are region / district points; Capua is today's town (ancient Capua is nearby); Thebes is the Luxor town point |

Not used (docs/43 §3.1): historical-basemaps (GPL-3.0, sources not recorded), DARMC (no licence), AWMC tiles (runtime requests) and AWMC geodata (ODbL; Gavin to decide), OpenHistoricalMap (check only), Commons maps C1–C8 (visual check only, not traced), Pleiades (no Pleiades coordinate was adopted, so no attribution is owed), Merikanto's Indus map (the optional Ghaggar–Hakra course was not traced).

## 2. Pipeline and commands

```bash
pnpm tsx scripts/geo/lib/region-land.ts --topic ancient-civilisations         # G1: plate land
pnpm tsx scripts/geo/ancient-civilisations/build-rivers.ts                     # G2: rivers
pnpm tsx scripts/geo/ancient-civilisations/inventory.ts                        # G0: inventory + raw/cliopatria-subset.geojson, raw/cliopatria-spheres.geojson, raw/check-K#.geojson
pnpm tsx scripts/geo/ancient-civilisations/build-keyframes.ts                  # G3: sources.json recipes + overlap check (work/overlaps.json)
pnpm tsx scripts/geo/lib/compose.ts --topic ancient-civilisations              # work/K#.geojson
pnpm tsx scripts/geo/lib/simplify.ts --topic ancient-civilisations             # data/control.json
pnpm tsx scripts/geo/ancient-civilisations/finalize-control.ts                 # certainty: approximate + the empty K16
pnpm tsx scripts/geo/ancient-civilisations/build-spheres.ts                    # G4: public/geo/ac-*.json
pnpm tsx scripts/geo/ancient-civilisations/points.ts                           # G5: places.json (Wikidata)
pnpm tsx scripts/geo/ancient-civilisations/routes.ts                           # G6: data/movements.json
pnpm tsx scripts/geo/lib/colour-holders.ts --topic ancient-civilisations      # G7: adjacency report (colours set by hand, below)
pnpm tsx scripts/geo/lib/check.ts --topic ancient-civilisations                # G8: docs/screenshots/ancient-civilisations/geo-K#.png
pnpm tsx scripts/geo/ancient-civilisations/check-points.ts                     # points against the plate's land
```

Downloads were made only from the dataset hosts named in docs/43 (GitHub release of Cliopatria, naciscdn.org for Natural Earth, the Wikidata API). No terms page, consent form or human check was met.

## 3. Plate land (G1)

`public/geo/ancient-world-plate.json`: Natural Earth 1:10m land clipped to [-12.25, -12.25, 135.25, 58.25] (plate [-12, -12, 135, 58] + 0.25°). `pipeline.regionLand { padDeg 0.25, simplifyKm 2, minIslandKm2 20, quantization 1000000, budgetKB 450, mapshaper: true }`. Output of the last run: **261 KB (budget 450 KB), 784 polygons, 22,490 vertices, 788 coast arcs, DP 2.00 km, islands ≥ 20 km²; rings: 785, zero-area 0, self-crossing 0.**

The per-ring Douglas–Peucker of `region-land.ts` left 9–11 self-crossing rings on a plate this size (the long Eurasian–African ring, Britain, Ireland, Taiwan, the Ganges delta) at every tolerance tried (0.3–2.5 km). The opt-in `mapshaper: true` (added to `scripts/geo/lib/region-land.ts`, off for every other plate) simplifies with mapshaper `keep-shapes` and repairs with `-clean` before the plate is cut; at a 200,000 grid one crossing in the Ganges delta came back after snapping, so the grid is 1,000,000.

## 4. Rivers (G2)

`public/geo/ancient-rivers.json`, 134 KB, 21 features: Tigris, Euphrates, Nile, Indus, Jhelum, Chenab, Ravi, Sutlej, Beas, Ganges, Yamuna, Yellow River (upper and middle course, cut at 113.546° E where the reconstructed course begins: today's lower course dates from 1855), Wei, Yangtze, Mekong, Chao Phraya, Yom, Tiber (NE, DP 500 m); Tonlé Sap (lake outline); `river-huang-old-trunk` (Zhengzhou → Puyang, `to: "0011"`, reconstructed) and `river-huang-before-602` (Puyang → the sea, `to: "-0602"`, reconstructed), both copied unchanged from the warring-states file. The warring-states file gives the trunk `from: "-0602"`; here it has no `from`, because the pre-602 course continues from the trunk's end (otherwise the river would have a gap before 602 BCE). Chinese names: docs/43 §3.2 list.

## 5. Control keyframes (G3)

Method for every frame: the Cliopatria records whose `FromYear ≤ year ≤ ToYear` for the holder (unchanged; several records of one holder are their union), painted in the order of `keyframes.json`, dissolved per holder and label (`compose.ts`, light pre-simplification 300 m, slivers < 5 km² dropped), simplified across all frames in one topology (`simplify.ts`: DP 1.5 km inside the focus box = the whole plate, quantisation 400,000) and clipped to the plate's coast (`coast.enabled`, land = `ancient-world-plate.json`, gap 6 km). No frame needed the ±50-year fallback. No two holders overlap in any frame (0 km² for every pair). The side-by-side images put the product (left) next to the frame's raw records drawn as published (right).

| K | date | holders (Cliopatria records) | check image |
|---|---|---|---|
| K1 | 3200 BCE | sumer (Sumerian City-States −3200…−3001) | `docs/screenshots/ancient-civilisations/geo-K1.png` |
| K2 | 3000 BCE | sumer (−3000…−2701); egypt (Early Dynastic Period of Egypt −3000…−2701) | geo-K2.png |
| K3 | 2600 BCE | sumer (−2700…−2501); egypt (Early Dynastic −2700…−2501) | geo-K3.png |
| K4 | 2300 BCE | egypt (Old Kingdom −2300…−2251); akkad (Akkadian Empire −2300…−2251) | geo-K4.png |
| K5 | 2100 BCE | sumer (−2100…−2001, labelled the Ur III period); egypt (Upper Egypt, Lower Egypt −2100…−2001) | geo-K5.png |
| K6 | 1250 BCE | egypt (New Kingdom −1300…−1241); shang (Shang Dynasty −1600…−1241) | geo-K6.png |
| K7 | 508 BCE | achaemenid (−530…−501); rome (Roman Kingdom −700…−501); maurya (Janapada of Magadha −530…−501); zhou-states (17 members of "(Spring and Autumn States)") | geo-K7.png |
| K8 | 323 BCE | macedon (Macedonian Empire, Laomedon, Perdiccas −323…−319); rome (Roman Republic −323…−319); maurya (Nanda Empire −323…−319); zhou-states (13 members of "(Warring States China)") | geo-K8.png |
| K9 | 260 BCE | egypt (Ptolemaic Kingdom −264…−257); rome (−264…−257); maurya (Maurya Empire −291…−257); zhou-states (10 members, incl. Qin) | geo-K9.png |
| K10 | 221 BCE | egypt (Ptolemaic −239…−219); rome (−222…−219); maurya (−225…−189); qin (Qin −222…−219) | geo-K10.png |
| K11 | 27 BCE | rome (Roman Empire −27…−26, Egypt included); han (Han Dynasty −36…5) | geo-K11.png |
| K12 | 117 CE | rome (Roman Empire 117…126); han (117…153) | geo-K12.png |
| K13 | 220 CE | rome (Roman Empire 215…237) | geo-K13.png |
| K14 | 400 CE | rome (Western Roman Empire 396…401); gupta (Gupta Empire 387…409) | geo-K14.png |
| K15 | 476 CE | gupta (476…489) | geo-K15.png |
| K16 | 600 CE | empty frame (`finalize-control.ts`); Southeast Asia is drawn as dated spheres | — |

Output: `control.json` **311 KB** (budget 1.92 MB = 2 MB × 15/16), 2,009 arcs, 35 features, all `certainty: "approximate"`; **rings: 418, zero-area 0, self-crossing 0** (`simplify.ts` and again in `finalize-control.ts`; slug in `tests/geo-rings.test.ts`). Deviation of the original vertices from the written boundary (`simplify.ts`, focus box = whole plate): p50 6.0 km, p95 11.4 km, p99 25.4 km, max 44.4 km — mostly Cliopatria's own coastlines replaced by the Natural Earth coast within 6 km, and the 300 m / 1.5 km simplification of long straight Cliopatria edges.

Differences between sources (G8): the product and the raw Cliopatria records match territory by territory in every image; the only visible differences are coasts (Natural Earth instead of Cliopatria's coarser coast) and islands under 20 km². The Commons maps C1–C8 were not compared pixel by pixel in this pass (listed for Gavin).

## 6. Dated sphere layers (G4)

`build-spheres.ts`: every Cliopatria record of the polity up to the year in `keyframes.json`, one geometry each with `{ f: FromYear, u: ToYear + 1, certainty: "approximate" }`; mapshaper DP 1 km (keep-shapes; no `-clean`, which would merge records drawn in the same place), then clipped to the plate land so the tint ends at the drawn coast; TopoJSON, one object named like the file, quantisation 100,000; ring check in the script.

| file | records | size | rings |
|---|---|---|---|
| `public/geo/ac-srivijaya.json` | 8 (674…1293) | 15 KB | 185, 0, 0 |
| `public/geo/ac-khmer.json` | 16 (800…1539) | 17 KB | 128, 0, 0 |
| `public/geo/ac-majapahit.json` | 8 (1294…1518) | 30 KB | 268, 0, 0 |

Melaka is not drawn: Cliopatria's "Sultanate of Malacca" begins in 1459 and its 1459–1511 outline covers southern Johor, Singapore and the Riau islands (102.99–104.22 E, 0.93–1.83 N), not the city of Melaka (INVENTORY.md).

## 7. Points (G5) and routes (G6)

66 places in `places.json` (Wikidata QID, P625 to 5 decimals, en / zh labels, notes on what a point stands for); every `at` in `events.json` is one of them, except `site-temasek`, which uses the same point as `singapore-1819-1965`'s `site-fort-canning-temasek` (103.847, 1.29444; also the Wikidata point of Fort Canning Hill). `check-points.ts`: 77 points, 3 outside the drawn land — the Belitung wreck (at sea, as it should be) and Melaka (on the coast; the 2 km coast passes about 0.2 km inland of the point).

Sea routes (`route-waypoints.json` → `routes.ts` → `movements.json`, both `kind: sea`, holder `traders`, labels end "(schematic)"): ports from `places.json`; between them only sea waypoints, each with `reason: "keep the line at sea"`, **not recorded tracks**. Every leg is sampled every 1 km against the plate land:

| route | ports | legs over land |
|---|---|---|
| `monsoon-routes` (persist, from 200 BCE) | Muziris → Arikamedu → Óc Eo → Guangzhou | Muziris leg 4.0 km; two 1 km touches; Óc Eo in and out 24.9 km each (the canals across the delta are not drawn); into Guangzhou 49.4 km (the Pearl River is not drawn) |
| `yijing-voyage-671` (Jan–Dec 671, linger to 700) | Guangzhou → Palembang | out of Guangzhou 49.4 km; up the Musi to Palembang 72.6 km (the Musi is not drawn) |

Not drawn: the Belitung ship's voyage (port of departure unknown), the Chola raid of 1025 (no source read names the port or route), the Yuan fleet of 1292, Alexander's marches, Roman roads.

## 8. Colours (G7)

`colour-holders.ts` finds one neighbouring pair across all frames (macedon–maurya, K8). Colours were then set by hand so that every holder differs from every other holder **shown in the same frame**, and the overlapping spheres differ: rome 1, egypt 2, sumer 3, han 3, akkad 4, zhou-states 4, khmer 4, achaemenid 5, shang 5, sukhothai 5, maurya 6, srivijaya 6, macedon 7, gupta 7, majapahit 7, qin 8, funan 8, melaka 2, traders 3. `pnpm validate` reports no neighbouring pair with the same colour.

## 9. Licences

- Cliopatria (CC BY 4.0): attributed in `data/SOURCES.md` [G1], `sources.json` S3 and THIRD-PARTY-NOTICES.md; changes indicated (clipped to the Natural Earth coast, simplified, records merged per holder, one empty frame added). The control areas and spheres stay under the content licence (CC BY-NC-SA 4.0).
- Natural Earth (public domain): no obligation; credited.
- Wikidata (CC0): no obligation; credited.
- `public/geo/ancient-rivers.json` contains two courses derived from a CC BY-SA 4.0 Commons map, so **that file is CC BY-SA 4.0** (LICENSE-CONTENT exception, THIRD-PARTY-NOTICES.md).
