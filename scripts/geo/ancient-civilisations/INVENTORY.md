# Ancient Civilisations — Cliopatria inventory (G0, docs/43 §3.2)

Checkpoint before any keyframe was built (2026-10-22): which polities and years the spec needs (docs/43 §3.3, §3.4) against what the Cliopatria release actually contains, and the decision taken for each. The tables are written by `inventory.ts` (`work/inventory-table.md`, `work/inventory.json`); the decisions are the defaults of docs/43 §0 unless a row says otherwise. Everything here is for Gavin to overrule.

## Release and licence

| item | value |
|---|---|
| Release | Cliopatria **v0.2.1**, GitHub tag `v0.2.1` (published 2026-10-03), `cliopatria.geojson.zip` from the tagged repository; Zenodo concept record 13363121 (doi:10.5281/zenodo.13363121); data paper doi:10.1038/s41597-025-04516-9 |
| Files (raw/, gitignored) | `cliopatria.geojson.zip` SHA-256 `e10a4e429fca708788ff9e7572a95fce801fae55852d217cffabc1c59cd4eed4` (46,005,176 bytes) → `cliopatria_polities_only_v021.geojson` SHA-256 `fc6f0d1e4cc42f45da83522b3696db6f2cc85ec0d12259a85c89b31347b8fc0a`; `LICENSE.md` `62ca7e92…5b9e5`; `README.md` `1d705794…5e9` |
| Licence (LICENSE.md, quoted) | "This data is licensed under a Creative Commons Attribution 4.0 International License … as long as you give appropriate credit to the original author(s) and the source, provide a link to the Creative Commons license, and indicate if changes were made." → **CC BY 4.0**; compatible one way into the content licence (CC BY-NC-SA 4.0) with attribution and a note of the changes (clipped to the plate's coast, simplified, records merged per holder). |
| Fields (README) | `Name`, `FromYear`, `ToYear`, `Area` (km², EPSG:6933), `Type` (POLITY / RELATION), `MemberOf`, `Wikipedia`, `Wikidata`, `SeshatID`; geometry EPSG:4326 |
| Year rule (README, quoted) | "Data … for any entity for any year … can be obtained finding the row (if any) containing the Name of the entity where the year of interest is between the row's FromYear and ToYear, inclusive." → a frame year Y takes the rows with `FromYear ≤ Y ≤ ToYear`; a dated layer's `[f, u)` is `[FromYear, ToYear + 1)`. |
| Authors' caveat (README, quoted) | "these maps reflect only one version of the territory held by past polities" → every feature `certainty: approximate` (dashed borders, lighter tint). |
| Overlaps | Within each frame the records do not overlap (pairwise spherical intersection 0 km² for every pair; `build-keyframes.ts`, `work/overlaps.json`). No overlap decisions were needed. |

## Spec vs dataset: what changed

| spec (docs/43) | found in v0.2.1 | decision |
|---|---|---|
| Names expected from the Seshat polity list ("Uruk", "Egypt - Early Dynastic", "Ur - Dynasty III", "Late Shang", "Roman Principate", "Magadha-Maurya Empire" …) | The release uses other names: "Sumerian City-States", "Early Dynastic Period of Egypt", "Old Kingdom of Egypt", "Shang Dynasty", "Roman Republic", "Roman Empire", "Western Roman Empire", "Maurya Empire", "Janapada of Magadha", "Nanda Empire", "Macedonian Empire" (+ members), "Han Dynasty", "Gupta Empire" | Matched by these names (keyframes.json). |
| K1 Egypt "if a Dynasty 0 record exists" | none before -3000 | K1 has Sumer only. |
| K3 Egypt "Old Kingdom" | at -2600 the record is still "Early Dynastic Period of Egypt" (-2700…-2501); "Old Kingdom" starts at -2500 (Cliopatria samples by frame years) | Drawn from the record that covers -2600; label "Egypt (Cliopatria record: Early Dynastic, to 2501 BCE)", the bracket not shown. |
| K4 akkad + egypt | "Sumerian City-States" also has a small record for -2300 (8,294 km²) | Not drawn (spec K4 = akkad + egypt). |
| K5 "Ur - Dynasty III" | no such record; "Sumerian City-States" -2100…-2001 (12,568 km²); Egypt split into "Upper Egypt" and "Lower Egypt" (First Intermediate Period) | `sumer` labelled "Sumerian cities (Third Dynasty of Ur)"; both Egyptian records as `egypt`, labelled separately. |
| K6 "Late Shang" | "Shang Dynasty" -1600…-1241 (one unchanged outline, 154,175 km²) | Used; label "Shang". |
| K7 Rome "Roman Republic (Early)"; Magadha | at -508 Rome is still the "Roman Kingdom" record (-700…-501, 859 km²); "Janapada of Magadha" -530…-501; the 26th-dynasty Egypt record also exists but Egypt was Persian then | Rome from the Kingdom record (label "Rome"); Magadha drawn; Egypt not drawn in K7 (spec). |
| K8 Magadha "if any" | "Nanda Empire" -323…-319 | Drawn as `maurya`, label "Magadha (Nanda kings)". Alexander's empire = "Macedonian Empire" + its member satrapies (Laomedon, Perdiccas). |
| K11 at -30 (Rome incl. Egypt) | at -30 Cliopatria still has a separate "Ptolemaic Kingdom" (-30…-28); from -27 the "Roman Empire" record includes Egypt | **K11 moved to -27** (the Roman Empire record of -27…-26; Augustus's title, event `augustus-27`). Chapter 02 beat 5 at -30 falls in the K10→K11 crossfade, 95 % K11. |
| K13 Rome only ("Han ended 220") | "Han Dynasty" records continue to 237 | Han not drawn after K12 (spec); its last frame is 117. |
| K14 "Roman Dominate" | from 395 Cliopatria has "Western Roman Empire" and "Eastern Roman Empire" | K14 draws the Western Roman Empire only (spec K15 leaves the east out); label "Western Roman Empire". |
| §0-6 Indus only as points ("Cliopatria has no Indus") | **"Indus Valley Civilization" exists**: -3000…-1701; at -2600 only 14,901 km² around a few cities, 755,121 km² for -2300…-1801 | **Kept as points** (default), and the text no longer says no outline exists: chapter 03 More ① says the dataset's 2600 BCE outline covers far less than where the 1,022 known sites lie. For Gavin: draw it from K4 (-2300) on? |
| §0-6 Funan points only | "Funan" exists: 51…640, the same outline (245,198 km²) in all four records | Kept as points (default). For Gavin: §0.1-5. |
| §0-6 Sukhothai points only | "Sukhothai Kingdom" exists: 1241…1458 | Kept as points (default). For Gavin. |
| §0-6 Greek city-states points only | no classical Athens / Sparta; only "Athenian Coalition" (-323, -264) and "Second Athenian League" (-366…-338) | Points (as spec). |
| §3.4 melaka-sphere ~1400–1511 | "Sultanate of Malacca" starts only in **1459**; its 1459…1511 outline (6,939 km²) covers southern Johor, Singapore and the Riau islands **but not the city of Melaka** (bbox 102.99–104.22 E, 0.93–1.83 N; Melaka is at 102.25 E, 2.19 N) | **Not drawn** (deviation): a layer named "Melaka" that leaves Melaka out would mislead. Melaka is a point; chapter 07 More ① says why. MOVEMENTS and spheres: 3 sphere layers, not 4. |
| §3.4 srivijaya / khmer / majapahit | Srivijaya 674…1293; Khmer Empire 800…1867 (taken to 1539); Majapahit 1294…1518 | Drawn as dated layers, every record unchanged. |
| §3.5 chola-raids route "if the port can be verified" | (not Cliopatria) no source read names the 1025 fleet's port | Not drawn (spec rule); event `chola-raids-1025` only. Entity `chola` dropped (nothing of it on the map). |

## Tables (generated)

| K | year | holder | Cliopatria records (FromYear–ToYear, km²) | covers the year? |
|---|---|---|---|---|
| K1 | -3200 | `sumer` | Sumerian City-States -3200–-3001, 35,615 | record covers the year |
| K2 | -3000 | `sumer` | Sumerian City-States -3000–-2701, 45,290 | record covers the year |
| K2 | -3000 | `egypt` | Early Dynastic Period of Egypt -3000–-2701, 93,286 | record covers the year |
| K3 | -2600 | `sumer` | Sumerian City-States -2700–-2501, 80,618 | record covers the year |
| K3 | -2600 | `egypt` | Early Dynastic Period of Egypt -2700–-2501, 93,286 | record covers the year |
| K4 | -2300 | `egypt` | Old Kingdom of Egypt -2300–-2251, 93,286 | record covers the year |
| K4 | -2300 | `akkad` | Akkadian Empire -2300–-2251, 390,387 | record covers the year |
| K5 | -2100 | `sumer` | Sumerian City-States -2100–-2001, 12,568 | record covers the year |
| K5 | -2100 | `egypt` | Upper Egypt -2100–-2001, 19,657 | record covers the year |
| K5 | -2100 | `egypt` | Lower Egypt -2100–-2001, 74,134 | record covers the year |
| K6 | -1250 | `egypt` | New Kingdom of Egypt -1300–-1241, 700,582 | record covers the year |
| K6 | -1250 | `shang` | Shang Dynasty -1600–-1241, 154,175 | record covers the year |
| K7 | -508 | `achaemenid` | Achaemenid Empire -530–-501, 4,269,863 | record covers the year |
| K7 | -508 | `rome` | Roman Kingdom -700–-501, 859 | record covers the year |
| K7 | -508 | `maurya` | Janapada of Magadha -530–-501, 5,040 | record covers the year |
| K7 | -508 | `zhou-states` | 17 members of (Spring and Autumn States): Qin, Song, Teng, Chen, Cao, Lu, Zheng, Cai, Zhu, Yan, Later Zhou, Xu, Chu, Wu, Wey, Qi, Jin | record covers the year |
| K8 | -323 | `macedon` | Laomedon -323–-319, 122,343; Perdiccas -323–-319, 117,037; Macedonian Empire -323–-319, 4,700,858 | record covers the year |
| K8 | -323 | `rome` | Roman Republic -323–-319, 10,455 | record covers the year |
| K8 | -323 | `maurya` | Nanda Empire -323–-319, 1,411,917 | record covers the year |
| K8 | -323 | `zhou-states` | 13 members of (Warring States China): Xu, Yan, Lu, Zhongshan, Later Zhou, Wey, Song, Qi, Han, Zhao, Chu, Qin, Wei | record covers the year |
| K9 | -260 | `egypt` | Ptolemaic Kingdom -264–-257, 754,256 | record covers the year |
| K9 | -260 | `rome` | Roman Republic -264–-257, 118,455 | record covers the year |
| K9 | -260 | `maurya` | Maurya Empire -291–-257, 3,816,378 | record covers the year |
| K9 | -260 | `zhou-states` | 10 members of (Warring States China): Later Zhou, Han, Zhao, Wei, Yan, Lu, Wey, Qi, Chu, Qin | record covers the year |
| K10 | -221 | `egypt` | Ptolemaic Kingdom -239–-219, 798,660 | record covers the year |
| K10 | -221 | `rome` | Roman Republic -222–-219, 216,879 | record covers the year |
| K10 | -221 | `maurya` | Maurya Empire -225–-189, 1,140,195 | record covers the year |
| K10 | -221 | `qin` | Qin -222–-219, 1,523,240 | record covers the year |
| K11 | -27 | `rome` | Roman Empire -27–-26, 3,059,904 | record covers the year |
| K11 | -27 | `han` | Han Dynasty -36–5, 4,465,266 | record covers the year |
| K12 | 117 | `rome` | Roman Empire 117–126, 5,263,199 | record covers the year |
| K12 | 117 | `han` | Han Dynasty 117–153, 3,819,735 | record covers the year |
| K13 | 220 | `rome` | Roman Empire 215–237, 4,577,379 | record covers the year |
| K14 | 400 | `rome` | Western Roman Empire 396–401, 2,133,725 | record covers the year |
| K14 | 400 | `gupta` | Gupta Empire 387–409, 1,990,750 | record covers the year |
| K15 | 476 | `gupta` | Gupta Empire 476–489, 2,060,373 | record covers the year |
| K16 | 600 | — | empty frame | — |

| sphere file | Cliopatria records (FromYear–ToYear, km²) |
|---|---|
| ac-srivijaya | 674–681 (5,524), 682–691 (170,101), 692–717 (483,627), 718–859 (537,553), 860–1138 (537,553), 1139–1201 (456,772), 1202–1284 (456,772), 1285–1293 (456,772) |
| ac-khmer | 800–805 (5,340), 806–874 (449,975), 875–1027 (397,553), 1028–1055 (540,563), 1056–1110 (397,553), 1111–1187 (397,553), 1188–1205 (830,253), 1206–1219 (953,197), 1220–1226 (830,253), 1227–1240 (830,253), 1241–1313 (515,874), 1314–1351 (515,787), 1352–1362 (515,985), 1363–1374 (304,077), 1375–1474 (240,474), 1475–1539 (286,870) |
| ac-majapahit | 1294–1343 (404,896), 1344–1351 (419,017), 1352–1362 (858,304), 1363–1401 (1,001,530), 1402–1474 (1,001,501), 1475–1481 (85,824), 1482–1515 (86,053), 1516–1518 (86,053) |

Listed, not drawn (records present; full list in `work/inventory.json`): Indus Valley Civilization (-3000…-1701, see above); Funan (51…640); Sukhothai Kingdom (1241…1458); Sultanate of Malacca (1459…1861; see above); Chenla (555…717); Ayutthaya Kingdom (1352…1768); Athenian Coalition (-323, -264); Second Athenian League (-366…-338); Chola Empire (850…1259); Eastern Roman Empire (395…); Middle Kingdom of Egypt (-2000…-1601); Zhou Dynasty (-1000…-751); Qin Dynasty (-218…-209); Magadha (Haryanka, Shaishunaga); Antigonid Macedonia; Twenty-sixth Dynasty of Egypt.
