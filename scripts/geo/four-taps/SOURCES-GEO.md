# Singapore's Four Taps map data — source survey and per-keyframe provenance

Every edge in `src/content/topics/four-taps/data/control.json` and in the island-scale basemap `public/geo/land-sg.json` comes from a dataset below; nothing is drawn by hand. Reference ids `[G#]` are the same as in the topic's `data/SOURCES.md`. Commands: `pnpm tsx scripts/geo/lib/<step>.ts --topic four-taps` (skill atlas-history-topic, references/geo-runbook.md, section 城市尺度主题). Method decided in docs/24 §0-10 and §0.1-4: **past keyframes = today's reservoir water surfaces filtered by the year each reservoir was completed; enlargements, vanished reservoirs and the coast before land reclamation are known gaps and are never drawn.**

```bash
pnpm tsx scripts/geo/lib/fetch.ts --topic four-taps        # D1, D2 from data.gov.sg (poll-download), D3 from the Overpass API
pnpm tsx scripts/geo/lib/local-land.ts --topic four-taps   # public/geo/land-sg.json (C1)
pnpm tsx scripts/geo/lib/compose.ts --topic four-taps      # work/K1–K7.geojson
pnpm tsx scripts/geo/lib/simplify.ts --topic four-taps     # data/control.json
pnpm tsx scripts/geo/lib/check.ts --topic four-taps        # docs/screenshots/four-taps/geo-K#.png
```

## 1. Survey

Downloads are logged by `fetch.ts` in `raw/fetch-log.json` (gitignored with `raw/`); the values below are copied from it.

| [G#] | dataset (manifest id) | source, exact id | licence (quoted from the licence page) | fetched (UTC) | SHA-256 of the file used |
|---|---|---|---|---|---|
| G1 | URA *Master Plan 2019 Land Use layer* (`ura-landuse`) | data.gov.sg dataset `d_90d86daa5bfaa371668b84fa5f01424f` (collection 1646, managed by the Urban Redevelopment Authority; "extracted from the Master Plan 2019 that was approved on 18 Nov 2019"; last updated 2025-12-05), https://data.gov.sg/datasets/d_90d86daa5bfaa371668b84fa5f01424f/view — GeoJSON, 174.2 MB, 113,212 polygons, WGS84 | Singapore Open Data Licence version 1.0 | 2026-10-14 13:08 | `81901f2b76a0d840706c56c234f80d338c10c6bcd2e7ab725c0ddf84faa076d5` |
| G2 | URA *Master Plan 2019 Planning Area Boundary (No Sea)* (`ura-planning-area`) | data.gov.sg dataset `d_4765db0e87b9c86336792efe8a1f7a66` (collection 2104; last updated 2025-12-05), https://data.gov.sg/datasets/d_4765db0e87b9c86336792efe8a1f7a66/view — GeoJSON, 2.1 MB, 55 planning areas | Singapore Open Data Licence version 1.0 | 2026-10-14 13:08 | `f23856251b467089f788d0fff72ef5a38e753f21aa69b4352401d7ed50d380cc` |
| G3 | OpenStreetMap named reservoirs (`osm-water`) | Overpass API (overpass-api.de), query in `sources.json`: `natural=water` with a name matching "Reservoir" or "Jurong Lake", `landuse=reservoir` named "Reservoir", in 1.15–1.48°N 103.55–104.10°E, plus relation 4461621 (Tasik Linggiu) | Open Database License 1.0, "© OpenStreetMap contributors" | 2026-10-14 13:21 | `fb9682b149888afdba16ece913cb7c7f161287d0b16886d147056bb741f70624` |
| G4 | OpenStreetMap lines (`osm-lines`) | Overpass: `waterway=river` named Johor, `man_made=pipeline` + `substance=water` in 1.25–2.00°N 103.55–104.10°E, the Causeway | ODbL 1.0 | 2026-10-14 13:21 | `22d326d0c763b1c2c7690eb84ee93f70f560b74a579fbe53f77e2997b5d7a2c3` |
| G5 | OpenStreetMap plants (`osm-sites`) | Overpass: `man_made=water_works / wastewater_plant` in Singapore, and names matching NEWater, Desalination, Waterworks, Water Reclamation, Linggiu in 1.10–2.20°N 103.40–104.40°E (`out center`) | ODbL 1.0 | 2026-10-14 13:24 | `360321f444edc1f84cbb8726b110c16298f5858c70a39ee5a6a73057f089e8b9` |
| G6 | Natural Earth 1:10m land, Southeast Asia (`public/geo/land-10m-sea.json`, already in the repo, scripts/build-geo.ts) | https://www.naturalearthdata.com/ | public domain | — | — |

**Singapore Open Data Licence v1.0** (https://data.gov.sg/open-data-licence, read 2026-10-14): "The Agency grants you a worldwide, perpetual, royalty-free, non-exclusive licence to Use the datasets, subject to the terms of this Licence"; you "can use, access, download, copy, distribute, transmit, modify and adapt the datasets, or any derived analyses or applications, whether commercially or non-commercially". Attribution is required in the form "[Contains information from {name of dataset} accessed on {date of access of dataset} from {source of data} which is made available under the terms of the Singapore Open Data Licence version 1.0 {URL link to licence}]"; the licence grants no rights over personal data, third-party rights or trademarks, and the data must not be used "in a way that suggests any official status or that an Agency endorses you".

**ODbL 1.0** (https://www.openstreetmap.org/copyright): attribution "© OpenStreetMap contributors"; the GeoJSON exports in `raw/` and the parts of them in `control.json`, `events.json` (`at`) and `movements.json` (`path`) are a derivative database, offered under the same licence (stated in `data/SOURCES.md`, which the topic's source list shows).

What each dataset is used for, and its limits:

- **G1 (control areas).** MP2019 has no `RESERVOIR` land-use class: every water surface — reservoirs, rivers, canals, ponds — is `LU_DESC = WATERBODY` (1,015 polygons). The parcels of one reservoir are selected with the `overlap` selector: the WATERBODY parcels whose area lies at least half inside the OpenStreetMap polygon of that reservoir's name (G3). The shape is URA's; OSM only picks and names the parcels. Areas agree within a few percent (km², URA / OSM): MacRitchie 1.05 / 0.90, Lower Peirce 0.67 / 0.65, Upper Seletar 3.23 / 3.27, Upper Peirce 2.97 / 3.01, Kranji 4.70 / 4.90, Pandan 1.73 / 1.73, Jurong Lake 0.63 / 0.61, Pulau Tekong 0.79 / 0.67, Murai 2.03 / 1.95, Poyan 3.98 / 3.60, Sarimbun 0.75 / 0.68, Tengeh 1.33 / 1.30, Lower Seletar 3.25 / 3.16, Bedok 0.84 / 0.83, Marina 1.77 / 1.80, Punggol 0.37 / 0.42, Serangoon 1.15 / 1.06. MP2019 is a plan (approved 18 November 2019), so the water surfaces are those of the plan, close to 2019's ground.
- **G2 (basemap).** The 55 planning areas without sea, dissolved into one land (`local-land.ts`): the island, Jurong Island, Pulau Tekong, Pulau Ubin, Sentosa and the Southern Islands, with today's reclaimed coast. It is the coast of 2019 in every keyframe (known gap below).
- **G3** names the reservoirs (17 of PUB's 17, plus Tasik Linggiu); Linggiu's outline is OSM's own (no URA data outside Singapore). Not used: service reservoirs (covered tanks), "Former Keppel Hill Reservoir", "Changi Creek Reservoir" (a canal).
- **G4** gives the route of the Johor River pipeline (movements.json): OSM ways 407019779, 677084240–677084246, 1392104462–1392104467 and 407019780 join end to end with no gap, 152 vertices from the Johor River Waterworks to Bukit Timah, thinned (Douglas–Peucker ≈ 165 m) for the line.
- **G5** gives the positions of plants (events.json `at`, `site` kind); plants missing from OSM are listed in data/SOURCES.md with the source of their position.
- **D6 (PUB catchment map)**: no open vector data found; PUB's maps are © PUB. Catchments are therefore **not drawn**; the text gives PUB's "more than two-thirds of our land" instead. No PUB map was traced.

## 2. Island-scale basemap `public/geo/land-sg.json` (docs/17 C1)

Recipe `pipeline.localLand` → `local-land.ts`: G2 dissolved, Douglas–Peucker 5 m, detached parts under 0.02 km² dropped, quantised (TopoJSON, 1e5). Mask: the one Natural Earth 1:10m polygon of Singapore (36 vertices) buffered by 400 m, minus the 10m land of the peninsula, Sumatra and the Riau islands, so the old coast disappears under the water colour without covering Johor. Inland water (rivers, canals, bays, estuary reservoirs) is cut out as described in §5. Result: **84 KB** (budget 150 KB), 26 land polygons, `rings: 113, zero-area 0, self-crossing 0`; deviation of the original outline vertices from the written coast p50 0.9 m, p95 5.0 m (max 1.7 km: an islet under 0.02 km² that is dropped). The engine draws it from zoom 9, fully at 10 (docs/06).

## 3. Keyframes

Common recipe: one step per reservoir completed by the keyframe date, holder `local-catchment` (Linggiu: `imported-water`), label = the reservoir's name (shown as territory name, key N, when it is large enough on screen); `src` G1 + G3 (Linggiu: G3). No base layer, no coast clip (`coast.enabled: false`: reservoirs are inland water). Simplification (all keyframes, one topology): Douglas–Peucker 10 m, quantisation 1e5, slivers under 0.005 km² dropped.

| K | date | steps (reservoirs) | year sources (data/SOURCES.md) | check |
|---|---|---|---|---|
| K1 | 1867 | MacRitchie | S2 | `geo-K1.png` |
| K2 | 1920 | + Lower Peirce, Upper Seletar | S5, S8 | `geo-K2.png` |
| K3 | 1975 | + Upper Peirce, Kranji, Pandan, Jurong Lake | S6, S2, S9, S10 | `geo-K3.png` |
| K4 | 1986 | + Murai, Poyan, Sarimbun, Tengeh, Lower Seletar, Bedok | S11, S3, S7 | `geo-K4.png` |
| K5 | 1993 | + Linggiu (OSM outline, holder imported-water) | S2 | `geo-K5.png` (with a Johor view) |
| K6 | 2008-10-31 | + Marina, Pulau Tekong | S12 | `geo-K6.png` |
| K7 | 2011 | + Punggol, Serangoon (17 reservoirs + Linggiu) | S2, S1 | `geo-K7.png` |

Each step's selector: `{ "overlap": { "geojson": "ura-landuse", "where": { "LU_DESC": "WATERBODY" } }, "within": { "geojson": "osm-water", "match": { "name": "^<name>$" } }, "minShare": 0.5 }`; the step `note` in `sources.json` gives the year and its source. Areas of the composed reservoirs agree with the OSM outlines within a few percent (§1). All 18 polygons were compared side by side with the OSM outlines at island scale (and Linggiu at Johor scale): every named reservoir is present, in the right place, with the right shape; no other water body is tinted.

Known gaps, in every keyframe:

1. **Enlargements are not drawn.** Each reservoir has today's outline from the first keyframe on. Reservoirs that were made bigger later (see the dates in data/SOURCES.md) are drawn too large in the frames before the enlargement.
2. **Vanished water bodies are not drawn.** Water surfaces that no longer exist (absorbed into a later reservoir, drained, built over) have no polygon in today's data and are left out; they are named in the text where the sources mention them.
3. **The coast is today's.** Land reclaimed since the 1960s (Marina South, Tuas, Jurong Island, Changi) is drawn in the 1868–1940 frames too; historical coastlines belong to a future `singapore-land-use` pipeline.
4. **Estuary reservoirs before they were closed** (Marina, Punggol, Serangoon; Kranji and Pandan were also river mouths) are drawn as today's land and water, without any water tint, until their keyframe.
5. Catchment areas are not drawn (no open vector data, §1).

## 4. Simplification and checks

`simplify.ts` (auto search from 0.01 km): **62 KB** for 7 keyframes (budget 102 KB = 0.1 MB), Douglas–Peucker 10 m, quantisation 1e5 over the data extent, 70 arcs; `rings: 205, zero-area 0, self-crossing 0`; deviation of the original vertices from the written boundary p50 0.00 km, p95 0.01 km, p99 0.10 km, max 0.44 km (thin river arms of the URA parcels). The post-quantisation vertex snap is now one grid cell of the data's own extent (it assumed a world-wide extent before; ww1 / ww2 output is byte-identical, verified by regenerating both control.json files with `--fine 1.5` and comparing SHA-256).

Side-by-side images: `docs/screenshots/four-taps/geo-K#.png` (gitignored QA records). Left: control.json on land-sg; right: the OpenStreetMap reservoir outlines and names (G3) on the same view — an independent dataset, drawn as is. PUB's own reservoir maps could not be fetched for local comparison (pub.gov.sg answers 403 to scripts); a QA reviewer can put a PUB map in `scripts/geo/four-taps/refs/` (gitignored) and point a check at it.

## 5. Notes for QA

- **Marina Reservoir's extent.** The OpenStreetMap relation "Marina Reservoir" (9542146) covers the Kallang Basin and the channel down to the barrage but not the central bay in front of the Downtown Core; the URA parcels are selected by it, so the central bay is drawn as water without the reservoir tint, although PUB describes the whole area behind the barrage as the reservoir. Fixing it needs a dataset that names the bay as part of the reservoir (an OSM edit, or a PUB vector map), not a hand-made selection.
- **Inland water in the basemap.** `land-sg.json` cuts out URA `WATERBODY` polygons of at least 0.02 km² (184 of 193): rivers, canals, Marina Bay and the estuary reservoirs, which were river mouths before their dams. Only the reservoirs made by flooding a valley (MacRitchie, Lower and Upper Peirce, Upper Seletar, Bedok, Pulau Tekong, Jurong Lake; `water.keepMatch`) stay land-coloured, so that before their keyframe they read as the land they were. Before its dam an estuary reservoir is drawn as today's water surface without tint, which is wider than the river mouth and swamps it replaced. Smaller streams and drains are not drawn. Size with the water cut: 84 KB.
