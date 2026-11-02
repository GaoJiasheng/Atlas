# Third-party notices · 第三方许可清单

Atlas code is MIT (see `LICENSE`); Atlas content is CC BY-NC-SA 4.0 (see
`LICENSE-CONTENT`). The works below are used under their own licences.

## Geographic data

| Work | Use | Licence |
|---|---|---|
| CShapes 2.0 (Schvitz, Girardin, Rüegger, Walter, Cederman, Gleditsch; ETH Zürich) | sovereign borders at each keyframe date | CC BY-NC-SA 4.0 |
| OpenHistoricalMap | boundary relations for occupations, colonies, client states | CC0 (features tagged `license=*` excepted; none used) |
| Natural Earth 1:50m and 1:10m (via `world-atlas`) | basemap land, coastlines, country borders | Public domain |
| Wikimedia Commons historical maps (per-file list in each topic's `SOURCES-GEO.md`) | georeferenced control areas and fronts; `warring-states` control areas and rivers are traced only from these maps and are published CC BY-SA 4.0 (see LICENSE-CONTENT) | CC BY-SA 2.5 / 3.0 / 4.0 or public domain, as listed |
| United States Military Academy, Department of History atlases; US Army Center of Military History maps | fronts, routes, dates | Public domain (US Government work) |
| UMN Historical National Boundaries | cross-check only | see repository |
| Cliopatria v0.2.1, Seshat Global History Databank (https://github.com/Seshat-Global-History-Databank/cliopatria, Zenodo record 13363121, data paper doi:10.1038/s41597-025-04516-9) | `ancient-civilisations` control areas (16 keyframes) and Southeast Asian sphere layers (`public/geo/ac-*.json`); changes: clipped to the Natural Earth coast, simplified, records merged per state | CC BY 4.0 |
| GeoNames gazetteer (https://www.geonames.org), records 131231 (Hormoz) and 157382 (Kilwa Kisiwani) | two site coordinates of `zheng-he` (`data/events.json`); no changes beyond selection and added descriptions | CC BY 4.0 |
| Natural Earth 1:10m rivers and lake centerlines, lakes (v5.0.0) | `ancient-civilisations` rivers and the Tonlé Sap outline (`public/geo/ancient-rivers.json`) | Public domain |
| Wikidata | point coordinates (P625) of the `ancient-civilisations` events and sites | CC0 |
| Kanguole, *Ancient North China Plain blank relief map.svg* (Wikimedia Commons), via `public/geo/warring-states-rivers.json` | two reconstructed Yellow River courses in `public/geo/ancient-rivers.json`, which is therefore published CC BY-SA 4.0 (see LICENSE-CONTENT) | CC BY-SA 4.0 |
| NOAA PSL NCEP/NCAR Reanalysis 1, monthly long-term mean 850 hPa `uwnd` / `vwnd` with valid-year counts, 1991–2020 (https://psl.noaa.gov/) | `sample-climate` wind arrays (`public/geo/sample-climate-wind-850-1991-2020.json`); native 2.5° grid, values unchanged, source ids remapped | Public domain (US Government data); "NCEP Reanalysis data provided by NOAA PSL, Boulder, Colorado, USA" |
| GPCP Version 2.3 monthly precipitation, long-term mean 1991–2020, via NOAA PSL (https://psl.noaa.gov/) | `sample-climate` rain arrays (`public/geo/sample-climate-rain-gpcp-1991-2020.json`); native 2.5° grid, values unchanged, source ids remapped | Public domain (US Government data); "GPCP Precipitation data provided by NOAA PSL, Boulder, Colorado, USA" |
| Natural Earth 1:110m populated places | `sample-climate` city anchor coordinates (`data/events.json`) | Public domain |

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

### Bones and joints (`public/models/bones-and-joints.glb`)

The adult skeleton, seven hand-bone detail specimens, two arm-muscle groups and
body outline derive from the cached Z-Anatomy / BodyParts3D anatomy sources.
The GLB carries the upstream attribution:

```
BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan
Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0
```

Source: https://github.com/LluisV/Z-Anatomy. BodyParts3D's current distribution
is CC BY 4.0 (https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html); that
does not replace the CC BY-SA 4.0 terms of the selected Z-Anatomy derivative.
Changes for Atlas: source structures selected and grouped, simplified within
sampled surface tolerances, renamed and rigidly assigned to existing joints;
existing muscle skinning retained; joint-detail specimens repositioned and
original teaching sections and an ideal lever added. The topic-local export
path and its limitations are recorded in `scripts/anatomy/bones-joints/`.

The GLB, the entire topic `data/parts.json`, derived rig/manifest/audit/previews
and model screenshots are CC BY-SA 4.0. Atlas's original geometry, labels and
mathematical configuration in that packet are offered under the same licence.
OpenStax teaching prose is kept in separate NC-SA chapters/glossary; no
OpenStax image, diagram or prose is baked into the BY-SA geometry packet.
The independent graphite illustrations retain CC BY-NC-SA 4.0 and are not
model-render derivatives. See `LICENSE-CONTENT` and the topic's
`data/SOURCES.md` for the file boundaries.

The draft `sample-joint` fixture reuses `muscles-arms.glb` and its rig. Its
`data/parts.json` is also CC BY-SA 4.0 with the same upstream attribution.

## Industrial Revolution map data (`industrial-revolution`)

| Work | Use | Licence |
|---|---|---|
| RShapes 1.0 (Müller-Crepon, Girardin; ETH Zürich, https://icr.ethz.ch/data/rshapes/). Requested reference: Cederman, Girardin, Müller-Crepon and Pengl (2025), *Nationalism and the Transformation of the State*, Cambridge University Press | `public/geo/industrial-rail-rshapes.json`; changes: features touching the Great Britain / Ireland main islands removed, years to 1914, simplified, quantised, same-year connected lines merged. Derived only from RShapes (no CC BY-SA or OpenHistoricalMap input) | CC BY-NC-SA 4.0 |
| British Geological Survey, *Coal resources for new technologies* (https://www.bgs.ac.uk/datasets/coal-resources-for-new-technologies/) | `public/geo/industrial-coal-strata.json`; changes: GB coal-bearing strata only, EPSG:27700 to WGS84 (OSGB36 seven-parameter, no OSTN15 grid), simplified, quantised | Open Government Licence 3.0 |
| GeoNames cities15000 (https://www.geonames.org/) | six modern city coordinates in the topic's `data/events.json` | CC BY 4.0 |
| Natural Earth 1:10m populated places and 1:50m land | 21 modern city coordinates; main-island masks | Public domain |

Attribution: **Contains British Geological Survey materials © UKRI 2026.** The
BGS product also carries *Contains OS data © Crown copyright 2020*; no OS map is
redistributed. City coordinates © GeoNames. Inputs, hashes and methods:
`scripts/geo/industrial-revolution/SOURCES-GEO.md`.

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

## Watt steam engine (`steam-engine`)

| Source / work | Use and changes | Licence |
|---|---|---|
| Science Museum Group collection, *Rotative Steam Engine by Boulton and Watt, 1788* (object 1861-46, https://collection.sciencemuseumgroup.org.uk/objects/co50948/rotative-steam-engine-by-boulton-and-watt-1788), *Newcomen Atmospheric Engine* (https://collection.sciencemuseumgroup.org.uk/objects/co50900/newcomen-atmospheric-engine) and *James Watt* (https://collection.sciencemuseumgroup.org.uk/people/ap24508/watt-james), accessed 2026-10-27 | Object descriptions independently rewritten, shortened and translated for the chapters, part explanations and glossary; museum photographs are not copied, traced or used as textures | Descriptive text CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ (metadata CC0) |

The other sources of this topic (public-domain mechanism texts, NASA, NOAA and NIST explanatory pages, the Lap-engine dimension references) are cited fact by fact; no text, drawing or image from them is reproduced. Per-source locators are in `src/content/topics/steam-engine/data/SOURCES.md`. The three illustrations (`public/illustrations/steam-engine*.webp`) are original artwork under the content licence above.

## Dinosaur Earth (`dinosaur-earth`)

**PALEOMAP PaleoDEMs v2**, Christopher R. Scotese and Nicky Wright (2018),
Zenodo record 5460860, <https://doi.org/10.5281/zenodo.5460860>. Upstream
licence **CC BY 4.0**, <https://creativecommons.org/licenses/by/4.0/>.
`public/geo/de-land-{250,230,200,170,150,130,100,70,65,0}.json` are Atlas
adaptations licensed **CC BY-NC-SA 4.0**: ten verified 1° CSV elevation grids
were classified with strict `z>0`, converted to nearest-sample categorical
cells, unioned, clipped to explicit source-domain/dateline and Mercator polar
limits, and encoded as TopoJSON with shared true-coast arcs. Exact-zero samples
remain non-land; old-grid 179…180° is unavailable. No modern coast substitution,
seam welding, continuous interpolation or synthetic 66 Ma frame. Only exact
collinear reduction is applied. Per-input/output hashes, grid limits, changes
and topology checks are in `scripts/geo/dinosaur-earth/SOURCES-GEO.md` and
`build-report.json`.

**Paleobiology Database contributors**, API 1.2 fixed CSV snapshots 26 October 2026.
Both raw responses explicitly declare **CC0**,
<https://creativecommons.org/publicdomain/zero/1.0/>. The retained occurrence
and collection facts in `public/geo/de-modern-points.json`, together with the
815 original retained-public-record citations in `public/geo/de-pbdb-references.json`,
remain CC0. The manifest binds the bibliography locally for offline inspector access.
The bounded global and TH/LA/MY query snapshots were stably deduplicated by
occurrence, Malaysian locations were suppressed before grouping, and the
public result retains 2103 occurrences in 1274 collections. Original occurrence,
collection and publication reference numbers and separate age bounds are
preserved. Complete exact queries and contributor/publication credit:
`src/content/topics/dinosaur-earth/data/SOURCES.md` and
`scripts/geo/dinosaur-earth/publication-references.json`. No raw Malaysian
location data is deployed. The selected record is not a census.

**Natural Earth contributors**, 110m land v4.1.0 / 50m countries v5.1.1,
<https://www.naturalearthdata.com/>. **Public domain**, per
<https://www.naturalearthdata.com/about/terms-of-use/>.
`public/geo/de-modern-land.json` retains global 110m land;
`de-modern-countries.json` selects 15 real country features for the modern
SEA/Mexico inset views. Shapefile winding is converted to RFC 7946 and
coordinates rounded to 6 decimal places. No additional restrictions are
asserted. These files and the Singapore DBF label anchor are modern references
only, never ancient reconstruction inputs.

The two modern editorial reference points, four text evidence cards,
manifests, original bilingual prose and the three approved generated
illustrations are Atlas content (CC BY-NC-SA 4.0). Modern factual coordinates
retain their original source credit and are not claimed as exclusive facts.
The illustrations are conceptual drawings, not specimen photographs,
measured reconstructions or third-party map geometry.

## Plates and hazards — frozen scientific reference datasets

- **PB2002**, Peter Bird (2003), “An updated digital model of plate boundaries”,
  doi:10.1029/2001GC000252. GeoJSON conversion by Hugo Ahlenius/Nordpil and
  fraxen/tectonicplates contributors, https://github.com/fraxen/tectonicplates.
  Derived database files `public/geo/ph-plate-{divergent,transform,subduction,convergent}.json`,
  `ph-orogens.json` and `ph-catalogue-{plate-divergent,plate-transform,plate-subduction,plate-convergent,orogens}.json`
  retain **ODC-BY 1.0**, https://opendatacommons.org/licenses/by/1-0/.
  Modified: selected original STEPCLASS groups, preserved split geometry parts
  and SEQNUM, simplified/quantized geometry and separate bilingual catalogue.
  Modern reference model, not historical plate or coastline reconstruction.
- **Smithsonian Global Volcanism Program**, Venzke, E. (compiler), *Volcanoes of
  the World*, v5.4.0, doi:10.5479/si.GVP.VOTW5-2026.5.4. WFS snapshot
  2026-10-26, https://volcano.si.edu/database/webservices.cfm.
  `ph-volcano-catalogue.json` and `ph-catalogue-volcano-catalogue.json` use only
  employee-produced database facts treated as **public domain** under the
  database-specific statement at https://volcano.si.edu/gvp_termsofuse.cfm.
  Photo links/captions/credits and geological-summary prose are excluded.
- **US Geological Survey**, reviewed ComCat earthquake sample, UTC
  2000-01-01 inclusive to 2025-01-01 exclusive, catalogue magnitude at least 6,
  snapshot 2026-10-26, https://earthquake.usgs.gov/fdsnws/event/1/.
  `ph-quake-sample.json` / `ph-catalogue-quake-sample.json` retain numerical
  source facts as **public domain**; no third-party linked products are used.
  Magnitude types, source times and updates are preserved, not homogenised.
- **NOAA/NCEI/WDS Global Historical Tsunami Database**,
  doi:10.7289/V5PN93H7, https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/.
  `ph-observations-{1883,2004,2018}.json` and matching catalogue files select
  **public-domain NOAA compiled location/type facts** from complete paginated
  snapshots 2026-10-26. Source-event association is explicit. Missing-coordinate
  records remain in the audit; no height, arrival-time, report text or photograph
  is redistributed. Clearance is limited to these compiled tables, per dataset
  metadata and NCEI Open Data Policy §4a–c, not third-party archive attachments.
- **Natural Earth**, https://www.naturalearthdata.com/about/terms-of-use/,
  existing local 50m global and 10m Southeast Asia land files: **public domain**.
  Used once as modern reference coastlines; no new coastline file.
- **NOAA/ITIC October 2024 Indian Ocean tsunami poster**, facts only:
  https://www.ncei.noaa.gov/sites/default/files/2024-11/IO_Poster_20241030_final_lowres.pdf.
  Atlas independently organises the sourced total, definition, source date and
  explicitly incomplete four-country breakdown in `events.json`. The mixed-rights
  poster, photographs and layout are not reproduced.

Atlas's original explanatory text and translations remain CC BY-NC-SA 4.0;
no BY-SA/NC-SA combination or restricted/by-agreement material is used.
Frozen hashes, output hashes, versions, modifications, coverage, simplification
residuals and per-file licences are recorded in the topic's data provenance.

## Solar system — separately licensed star catalogue

Star positions: **HYG Database v4.1, David Nash / Astronexus**,
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Source: <https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv>
and <https://github.com/astronexus/HYG-Database>. HYG acknowledges the underlying
Hipparcos, Yale Bright Star and Gliese catalogues.

`public/catalogues/solar-system/stars-hyg-v41-cc-by-sa.json` retains 28 rows:
bright Orion, Crux and Scorpius stars, with comparison records. Changes:
selected rows/columns and JSON formatting; no positional corrections.
RA is hours, declination degrees, distance parsecs. Positions are J2000
references, with historical distance estimates, not observation forecasts.
The catalogue source SHA-256 is recorded in its metadata; the distributed
subset SHA-256 is `c8a2a4282f7d83a87523996e317675dbe7ab5feb569c57ec7c8bb491a60c13a0`.

This file stays independent of the Atlas topic bundle. Original constellation
recognition links reference catalogue identifiers at runtime; they are not
added to the share-alike catalogue. No third-party constellation chart or
photograph is distributed.
