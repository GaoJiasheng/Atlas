# Silk Roads — Cliopatria inventory (G0, docs/73 §3.2)

| | |
|---|---|
| Release | Cliopatria **v0.2.1**, from the tagged repository `cliopatria.geojson.zip` (<https://github.com/Seshat-Global-History-Databank/cliopatria/raw/v0.2.1/cliopatria.geojson.zip>), downloaded 2026-11-15 |
| Files (raw/, gitignored) | `cliopatria.geojson.zip` 46,005,176 bytes, SHA-256 `e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4` (same file as the ancient-civilisations download) → `cliopatria_polities_only_v021.geojson` SHA-256 `fc6f0d1e4cc42f45da83522b3696db6f2cc85ec0d12259a85c89b31347b8fc0a`; `LICENSE.md` SHA-256 `62ca7e92dee4ebe402372d5e64f87845de445a6c0e5d76fddb68b3e33739d1a6` |
| Licence (LICENSE.md) | “licensed under a Creative Commons Attribution 4.0 International License … as long as you give appropriate credit to the original author(s) and the source, provide a link to the Creative Commons license, and indicate if changes were made.” |
| Rule | README: a polity's extent in a year is the record whose `FromYear ≤ year ≤ ToYear`. A year no record covers borrows the nearest record within 50 years (`inventory.ts`). |

## Coverage of the polities the spec asked about (docs/73 §2.2)

| entity | Cliopatria name(s) | result |
|---|---|---|
| Xiongnu | `Xiongnu` (−208 … 153) | drawn in K1–K3 |
| Western Turks | `Western Göktürks` (587 … 660) | drawn in K6 |
| Tibet | `Tibetan Empire` (623 … 849) | drawn in K6–K8 |
| Uyghurs | `Uyghur Khaganate` (750 … 849) | drawn in K7–K8 |
| Mongol Empire | `Mongol Empire` (1206 … 1293) | drawn in K10–K12 |
| the four khanates | `Yuan Dynasty`, `Ilkhanate`, `Golden Horde`, `Chagatai Khanate` | **only from 1294**: Cliopatria draws a single Mongol Empire up to 1293. K12 (1271) therefore shows one `mongols` area; the four khanates appear in K13 (1335) |
| Kushans | `Kushan Empire` (43 … 237), then `Eastern Kushans` and `Western Kushans` | K3 from the first, K4 (240) from the two successor records |
| Khwarazm, Jin | `Khwarezmid Empire`, `Great Jin` | drawn in K10 |
| Eastern Rome | `Eastern Roman Empire` (to 632), `Byzantine Empire` (633 … with a gap 1227–1278), `Nicaean Empire` (1206 … 1278) | K11 and K12 use the Nicaean record, labelled “Empire of Nicaea (Eastern Roman)” |
| Delhi Sultanate | relation `(Delhi Sultanate)`, member `Tughlaq Dynasty` | drawn in K13–K14 from the Tughlaq record |
| Ming | `Ming Dynasty` (from 1375) | K14 (1368) borrows the 1375–1384 record (7 years), as does the Golden Horde (1352–1362) |

No entity needed the spec's “points only” fallback.

## Per-frame records

| K | year | holder | Cliopatria records (FromYear–ToYear, km²) | covers the year? |
|---|---|---|---|---|
| K1 | -138 | `han` | Han Dynasty -197–-127, 2,042,840 | record covers the year |
| K1 | -138 | `xiongnu` | Xiongnu -144–-127, 5,619,496 | record covers the year |
| K1 | -138 | `parthia` | Parthian Empire -144–-127, 1,867,950 | record covers the year |
| K1 | -138 | `rome` | Roman Republic -144–-127, 850,666 | record covers the year |
| K2 | -60 | `han` | Han Dynasty -77–-51, 3,949,395 | record covers the year |
| K2 | -60 | `xiongnu` | Xiongnu -66–-51, 2,404,729 | record covers the year |
| K2 | -60 | `parthia` | Parthian Empire -63–-41, 2,702,720 | record covers the year |
| K2 | -60 | `rome` | Roman Republic -63–-51, 1,612,110 | record covers the year |
| K3 | 50 | `han` | Han Dynasty 43–50, 3,606,539 | record covers the year |
| K3 | 50 | `xiongnu` | Xiongnu 30–50, 2,402,267 | record covers the year |
| K3 | 50 | `kushan` | Kushan Empire 43–50, 458,050 | record covers the year |
| K3 | 50 | `parthia` | Parthian Empire 43–50, 2,702,797 | record covers the year |
| K3 | 50 | `rome` | Roman Empire 43–50, 3,888,657 | record covers the year |
| K4 | 240 | `sasanian` | Sasanian Empire 238–259, 2,687,808 | record covers the year |
| K4 | 240 | `kushan` | Eastern Kushans 238–259, 1,240,514; Western Kushans 238–246, 684,686 | record covers the year |
| K4 | 240 | `rome` | Roman Empire 238–246, 4,560,711 | record covers the year |
| K5 | 400 | `sasanian` | Sasanian Empire 397–401, 2,985,924 | record covers the year |
| K5 | 400 | `gupta` | Gupta Empire 387–409, 1,990,750 | record covers the year |
| K5 | 400 | `rome` | Western Roman Empire 396–401, 2,133,725; Eastern Roman Empire 397–401, 1,763,135 | record covers the year |
| K6 | 629 | `tang` | Tang Dynasty 628–629, 3,376,263 | record covers the year |
| K6 | 629 | `sasanian` | Sasanian Empire 629–629, 3,243,113 | record covers the year |
| K6 | 629 | `eastern-rome` | Eastern Roman Empire 629–629, 2,445,610 | record covers the year |
| K6 | 629 | `western-turks` | Western Göktürks 629–629, 4,205,976 | record covers the year |
| K6 | 629 | `tibet` | Tibetan Empire 628–633, 1,280,149 | record covers the year |
| K7 | 751 | `tang` | Tang Dynasty 751–754, 4,652,678 | record covers the year |
| K7 | 751 | `abbasid` | Abbasid Caliphate 751–754, 7,548,681 | record covers the year |
| K7 | 751 | `eastern-rome` | Byzantine Empire 751–767, 693,825 | record covers the year |
| K7 | 751 | `tibet` | Tibetan Empire 751–756, 2,483,080 | record covers the year |
| K7 | 751 | `uyghur` | Uyghur Khaganate 750–754, 2,943,976 | record covers the year |
| K8 | 786 | `tang` | Tang Dynasty 768–829, 3,093,452 | record covers the year |
| K8 | 786 | `abbasid` | Abbasid Caliphate 783–799, 8,138,040 | record covers the year |
| K8 | 786 | `eastern-rome` | Byzantine Empire 783–787, 677,620 | record covers the year |
| K8 | 786 | `tibet` | Tibetan Empire 783–792, 3,564,231 | record covers the year |
| K8 | 786 | `uyghur` | Uyghur Khaganate 783–792, 3,892,812 | record covers the year |
| K9 | 971 | `song` | Northern Song 970–979, 1,579,510 | record covers the year |
| K9 | 971 | `liao` | Liao Dynasty 960–979, 1,924,491 | record covers the year |
| K9 | 971 | `eastern-rome` | Byzantine Empire 970–979, 893,166 | record covers the year |
| K9 | 971 | `fatimid` | Fatimid Caliphate 970–979, 1,946,467 | record covers the year |
| K9 | 971 | `chola` | Chola Empire 970–999, 111,539 | record covers the year |
| K10 | 1206 | `jin` | Great Jin 1206–1215, 2,118,396 | record covers the year |
| K10 | 1206 | `song` | Southern Song 1139–1240, 2,057,332 | record covers the year |
| K10 | 1206 | `khwarazm` | Khwarezmid Empire 1206–1209, 2,112,958 | record covers the year |
| K10 | 1206 | `mongols` | Mongol Empire 1206–1209, 2,464,171 | record covers the year |
| K11 | 1254 | `mongols` | Mongol Empire 1250–1259, 23,974,433 | record covers the year |
| K11 | 1254 | `song` | Southern Song 1250–1259, 1,944,002 | record covers the year |
| K11 | 1254 | `mamluk` | Mamluk Sultanate 1250–1259, 1,517,704 | record covers the year |
| K11 | 1254 | `eastern-rome` | Nicaean Empire 1250–1259, 235,927 | record covers the year |
| K12 | 1271 | `mongols` | Mongol Empire 1260–1271, 25,801,958 | record covers the year |
| K12 | 1271 | `song` | Southern Song 1260–1271, 1,731,185 | record covers the year |
| K12 | 1271 | `mamluk` | Mamluk Sultanate 1260–1271, 1,344,977 | record covers the year |
| K12 | 1271 | `eastern-rome` | Nicaean Empire 1260–1271, 242,675 | record covers the year |
| K13 | 1335 | `yuan` | Yuan Dynasty 1294–1351, 14,249,991 | record covers the year |
| K13 | 1335 | `ilkhanate` | Ilkhanate 1333–1343, 3,577,557 | record covers the year |
| K13 | 1335 | `golden-horde` | Golden Horde 1333–1343, 4,882,279 | record covers the year |
| K13 | 1335 | `chagatai` | Chagatai Khanate 1326–1343, 2,454,494 | record covers the year |
| K13 | 1335 | `mamluk` | Mamluk Sultanate 1294–1343, 1,468,646 | record covers the year |
| K13 | 1335 | `eastern-rome` | Byzantine Empire 1333–1343, 166,431 | record covers the year |
| K13 | 1335 | `delhi` | Tughlaq Dynasty 1333–1343, 2,449,486 | record covers the year |
| K14 | 1368 | `ming` | Ming Dynasty 1375–1384, 4,550,676 | no record covers 1368; nearest within 50 years: 1375–1384 |
| K14 | 1368 | `golden-horde` | Golden Horde 1352–1362, 4,891,354 | no record covers 1368; nearest within 50 years: 1352–1362 |
| K14 | 1368 | `chagatai` | Chagatai Khanate 1363–1374, 1,893,043 | record covers the year |
| K14 | 1368 | `mamluk` | Mamluk Sultanate 1363–1374, 1,474,766 | record covers the year |
| K14 | 1368 | `eastern-rome` | Byzantine Empire 1363–1374, 70,197 | record covers the year |
| K14 | 1368 | `delhi` | Tughlaq Dynasty 1352–1374, 436,448 | record covers the year |

| sphere file | Cliopatria records (FromYear–ToYear, km²) |
|---|---|

| listed, not drawn | records (FromYear–ToYear, km²) |
|---|---|


## Overlaps (build-keyframes.ts)

Cliopatria draws each polity on its own, so outlines can overlap. Pairs over 2 % of the smaller area were decided by paint order in `keyframes.json` `overlapDecisions`:

| frame | pair | km² | share of smaller | decision |
|---|---|---|---|---|
| K7 | tang / tibet | 2,489,723 | 100 % | Cliopatria's Tang 751-754 outline takes in the whole Tibetan Empire 751-756 outline; the Tibetan record is painted later and wins, so the plateau shows as Tibet (Tang did not rule it). |
| K7 | abbasid / eastern-rome | 590,448 | 85 % | Cliopatria's Abbasid 751-754 outline runs over Anatolia; the Byzantine 751-767 record is painted later and wins (Anatolia stayed Eastern Roman). |
| K8 | abbasid / eastern-rome | 589,227 | 86.8 % | As K7: the Byzantine 783-787 record is painted after the Abbasid 783-799 record and wins in Anatolia. |
| K12 | mongols / eastern-rome | 121,770 | 50.1 % | Cliopatria's Mongol Empire 1260-1271 outline covers part of the Nicaean Empire 1260-1271 in western Anatolia; the Nicaean record is painted later and wins. |
| K14 | ming / chagatai | 229 | 0 % | under 2 %: the later step (chagatai) wins |
