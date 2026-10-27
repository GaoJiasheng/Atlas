# Third-party notices · 第三方许可清单

Atlas code is MIT (see `LICENSE`); Atlas content is CC BY-NC-SA 4.0 (see
`LICENSE-CONTENT`). The works below are used under their own licences.

## Geographic data

`sample-climate` uses NOAA PSL NCEP/NCAR Reanalysis 1 monthly 850 hPa wind
climatology and GPCP V2.3 monthly precipitation-rate climatology (1991–2020),
distributed as public-domain-derived numeric arrays in
`public/geo/sample-climate-{wind-850,rain-gpcp}-1991-2020.json`. NCEP Reanalysis
and GPCP precipitation data provided by NOAA PSL, Boulder, Colorado, USA,
https://psl.noaa.gov/. Changes: source-id metadata remapped; numeric arrays,
native coordinates and valid-year counts unchanged. Native-grid cell polygons
and projected wind glyphs are PD-derived. These are not official NOAA products
or forecasts. The fixture's six city anchors preserve Natural Earth 1:110m
populated-place coordinates (public domain). Separate 2×2 arrays are artificial
test values, not observations. Exact requests, input/output SHA-256 and licence
families are in `src/content/topics/sample-climate/data/SOURCES.md` and
`scripts/geo/sample-climate/SOURCES-GEO.md`. NOAA software is not covered by this
data acknowledgement.

| Work | Use | Licence |
|---|---|---|
| CShapes 2.0 (Schvitz, Girardin, Rüegger, Walter, Cederman, Gleditsch; ETH Zürich) | sovereign borders at each keyframe date | CC BY-NC-SA 4.0 |
| OpenHistoricalMap | boundary relations for occupations, colonies, client states | CC0 (features tagged `license=*` excepted; none used) |
| Natural Earth 1:50m and 1:10m (via `world-atlas`) | basemap land, coastlines, country borders | Public domain |
| Wikimedia Commons historical maps (per-file list in each topic's `SOURCES-GEO.md`) | georeferenced control areas and fronts; `warring-states` control areas and rivers are traced only from these maps and are published CC BY-SA 4.0 (see LICENSE-CONTENT) | CC BY-SA 2.5 / 3.0 / 4.0 or public domain, as listed |
| United States Military Academy, Department of History atlases; US Army Center of Military History maps | fronts, routes, dates | Public domain (US Government work) |
| UMN Historical National Boundaries | cross-check only | see repository |
| Cliopatria v0.2.1, Seshat Global History Databank (https://github.com/Seshat-Global-History-Databank/cliopatria, Zenodo record 13363121, data paper doi:10.1038/s41597-025-04516-9) | `ancient-civilisations` control areas (16 keyframes) and Southeast Asian sphere layers (`public/geo/ac-*.json`); changes: clipped to the Natural Earth coast, simplified, records merged per state | CC BY 4.0 |
| Natural Earth 1:10m rivers and lake centerlines, lakes (v5.0.0) | `ancient-civilisations` rivers and the Tonlé Sap outline (`public/geo/ancient-rivers.json`) | Public domain |
| Wikidata | point coordinates (P625) of the `ancient-civilisations` events and sites | CC0 |
| Kanguole, *Ancient North China Plain blank relief map.svg* (Wikimedia Commons), via `public/geo/warring-states-rivers.json` | two reconstructed Yellow River courses in `public/geo/ancient-rivers.json`, which is therefore published CC BY-SA 4.0 (see LICENSE-CONTENT) | CC BY-SA 4.0 |

## 3D anatomy models

| Work | Use | Licence |
|---|---|---|
| Z-Anatomy — The open source atlas of anatomy (Gauthier Kervyn et al.; app by Lluís Vinent Juanico), https://github.com/LluisV/Z-Anatomy | muscle, bone and body-region meshes of the human muscle series (`public/models/muscles-*.glb`); organ, airway and blood-vessel meshes of the heart-and-lungs topic (`public/models/heart-and-lungs.glb`) | CC BY-SA 4.0 |
| BodyParts3D, © The Database Center for Life Science, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html | the source Z-Anatomy derives from; FMA ids and cross-checks | CC BY 4.0 (Z-Anatomy states CC BY-SA 2.1 Japan for the version it used) |

Attribution carried in each model's `asset.copyright`, in the topic's
`data/SOURCES.md` and on the topic's title block:

```
Muscle and bone meshes: Z-Anatomy — The open source atlas of anatomy, CC BY-SA 4.0
(https://github.com/LluisV/Z-Anatomy), derived from BodyParts3D, © The Database Center
for Life Science (CC BY-SA 2.1 Japan as stated by Z-Anatomy; BodyParts3D is now
CC BY 4.0, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html).
Changes for Atlas: structures selected per body region, simplified, re-rigged,
fibre and attachment data added. This model (muscles-<topic>.glb) is licensed
CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
```

The glb files, the geometry derived from them (`scripts/anatomy/<topic>/rig.json`,
`attachments.json`, the `sites` coordinates in `parts.json`), the series' hero
plates redrawn from model renders and the screenshots of the series are
CC BY-SA 4.0, not CC BY-NC-SA (see the exception in `LICENSE-CONTENT`). The
texts, muscle and exercise sheets remain under `LICENSE-CONTENT`.

### Digestive system (`public/models/digestive-system.glb`)

The digestive-tract, liver, pancreas, heart, lung, diaphragm, skeleton and skin
meshes of the digestive-system topic come from the same Z-Anatomy source
(CC BY-SA 4.0). Attribution carried in the model's `asset.copyright`:

```
Z-Anatomy — The open source atlas of anatomy, CC BY-SA 4.0
(https://github.com/LluisV/Z-Anatomy), derived from BodyParts3D, © The Database Center
for Life Science (CC BY-SA 2.1 Japan as stated by Z-Anatomy; BodyParts3D is now
CC BY 4.0, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html).
Changes for Atlas: structures selected for the digestive region and four other systems, simplified, renamed, centreline _U baked.
digestive-system.glb is licensed CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
```

The glb and the geometry derived from it (`scripts/anatomy/digestive/centrelines.json`,
`food-route.json`, and the flow paths and camera targets taken from them into
`src/content/topics/digestive-system/data/parts.json`) are CC BY-SA 4.0 (see the
exception in `LICENSE-CONTENT`).

### Heart and lungs (`public/models/heart-and-lungs.glb`)

The airway, lung, heart, blood-vessel, diaphragm, rib, digestive-context, leg-muscle,
skeleton and skin meshes of the heart-and-lungs topic come from the same Z-Anatomy
source (CC BY-SA 4.0). Attribution carried in the model's `asset.copyright`:

```
Z-Anatomy — The open source atlas of anatomy, CC BY-SA 4.0
(https://github.com/LluisV/Z-Anatomy), derived from BodyParts3D, © The Database Center
for Life Science (CC BY-SA 2.1 Japan as stated by Z-Anatomy; BodyParts3D is now
CC BY 4.0, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html).
Changes for Atlas: structures selected for the respiratory and circulatory systems with digestive and skeletal context, simplified, renamed, centrelines and route landmarks baked.
Static meshes; no rig, weights, fibres or attachment sites. heart-and-lungs.glb is licensed
CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
```

The glb and the geometry derived from it (`scripts/anatomy/heart-lungs/centrelines.json`,
`landmarks.json`, `routes.json`, and the flow paths, pivots and camera targets taken
from them into the topic's `parts.json`) are CC BY-SA 4.0.

## Fonts and libraries

| Work | Licence |
|---|---|
| IBM Plex Sans Condensed, IBM Plex Mono (self-hosted via `@fontsource`) | SIL Open Font License 1.1 |
| MapLibre GL JS | BSD-3-Clause |
| three.js, @react-three/fiber, @react-three/drei | MIT |
| Astro, React, zustand, topojson-client, vite-plugin-pwa and other npm dependencies | see `package.json` and each package's licence |

## Skills

The skills under `.claude/skills/` are working notes for AI assistants, not licensed works; no licence is asserted over them.

## Text sources

Figures and claims in topic texts cite their sources with `[S#]` ids; each
topic's `data/SOURCES.md` lists them with URLs. Quotations are short and
attributed; no source text is reproduced beyond that.
