# continental-drift · geometry and data ledger

Built 2026-11-15 by `scripts/geo/continental-drift/build.py` (pygplates 1.0.0 in a local venv, numpy, scipy, Pillow; nothing downloaded by the script). Raw inputs live in `art/research/continental-drift/data/` (git-ignored); their URLs, byte counts, upstream md5 and local sha256 are in `INVENTORY.json`. Full numbers: `build-report.json`.

| Input | Size | sha256 (local) | Licence |
|---|---|---|---|
| DL1 Merdith et al. 2021 v1.2.4 zip (Zenodo 13635864), md5 `181ab32d1d235a923ee343568731e64a` matches upstream | 8,496,217 B | `c08cd59f…6b78e6e` | CC BY 4.0 |
| DL2 pygplates 1.0.0 wheel (build tool only, not deployed or distributed) | 59,930,915 B | `ba0aa4f3…287ca4c` | GPL-2.0 |
| DL3 PBDB occurrences, four genera (`datainfo` header: CC0; 1,502 records) | 804,642 B | `257667ac…dd74ddc` | CC0 |
| DL4 Seton et al. 2020 `age.2020.1.GTS2012.6m.grd` + README | 25,985,812 B | `67c1803d…5f2f6c` | CC BY 4.0 |
| DL5 GMT remote tile `N30W060.earth_mag_02m_p.jp2` (EMAG2v3 sea level) + server table | 1,556,154 B | `cf4df770…b4a6c` | NOAA/NCEI (US Government) via GMT |
| DL6 JPL `table2.html` (IGS14, epoch 2026-01-01) | 463,647 B | `808b3976…df59d5` | NASA JPL; a few values cited |

DL5 took the GMT tile route (the 175 MB global GeoTIFF was not downloaded). Only the [−36, 56, −20, 66] slice is published.

## Rotations — `cd-rotations.json`
Every non-999 line of `1000_0_rotfile_Merdith_etal.rot`, grouped into consecutive (moving, fixed) sequences, values unchanged; kept: the sequences of every plate used by a feature or point and of all plates above it at any age in 0–400 Ma, trimmed to [0, 400] plus one pole outside each end. 501 plates, 633 sequences, 2,428 poles, chain depth ≤ 38. Lossless check (§3.3-5): the JSON written back to `.rot` and loaded in pygplates reproduces all 12,380 golden positions exactly (max difference 0.0°).

Runtime (`src/engines/time-scene/lib/plateRotation.ts`): quaternion slerp between consecutive poles of a sequence; the reconstruction tree at each age is built as pyGPlates builds it (depth-first from the anchor, children in reverse file order, first sequence to reach a plate wins), which settles the 236 fixed-plate switch ages. Golden fixture `tests/fixtures/continental-drift/golden.json`: 12,380 positions from pygplates (200 random points over all used plates × 14 ages, plus every switch age ± 0.05 Ma for 40 of them, plus the site points); all within 0.001° (test `plate-rotation.test.ts`). Plan A of D3; plan B was not needed.

## Coverage (§3.3-2, D2)
Share of today's coastline area kept by the model per plate-ID group, at 400 Ma: North America 0.91, South America 0.93, Europe 0.75, Asia 0.84, Africa 0.98, Australia–Antarctica 0.96; no group below 0.5 at any 1 Myr step from 400 to 0 Ma. D2 start stays at 400 Ma.

## Plate geometry — `cd-land.json`, `cd-shelf.json`
Coastlines (`shapes_coastlines_Merdith_et_al_v2.gpmlz`) and continents (`shapes_continents.gpml`), every polygon valid at some age in 0–400 Ma, as present-day vertices with `{plateId, from, to}`. Simplification: Visvalingam effective areas in a local azimuthal projection per ring, one global threshold per level of detail; a ring that would cross itself keeps more points (checked with the `rings.ts` rule). Polygons sharing plate and valid time are merged into one MultiPolygon. TopoJSON, one arc per ring, quantised to 5 × 10⁴ steps.

| LOD | vertices | budget (DS03) | islands < 100 km² dropped |
|---|---|---|---|
| land full | 37,086 | ≤ 40,000 | 0 |
| land scrub | 12,000 | ≤ 12,000 | 739 |
| shelf full | 22,081 | ≤ 25,000 | 0 |
| shelf scrub | 7,906 | ≤ 8,000 | 3 |

## Points — `cd-points.json`, `cd-fossils.json`, `cd-points-text.json`
Plate IDs from pygplates `PlatePartitioner` with the static polygons at 0 Ma; no point unassigned. Singapore anchor [103.8198, 1.3521] → plate 64701 (Malay Peninsula, valid 410–0 Ma). Glacial and mountain-belt points are region-level placements of the places named by their sources (scripts/geo/continental-drift/sites.json). PBDB: 439 collections, one point per collection; countries per taxon in `build-report.json`. Labels: today's continent names (always) and Pangaea (320–195 Ma, S4) and Gondwana (400–155 Ma, S4) inside their windows. Sibumasu / Sukhothai Arc labels were not built: the model's blocks 603 and 64701 move together over 250–195 Ma, so a closing ocean is not visible (docs/72 §2.2 rule).

## Present-only — `cd-seafloor.json`, `cd-stripes.json`, `cd-gps.json`
- Ocean-floor age: 0.1° grid → 1° cells (median of valid nodes) → 19 nested "older than" areas (0, 10 … 180 Ma), Douglas–Peucker 0.45°, drawn young to old. Ridge anchors: the youngest node along 30°N (−42.7°) and 60°N (−29.4°).
- Magnetic stripes: tile N30W060, z = (u − 32768) × 0.2 + 800 nT (u = 0 no data), 5 × 5 cell running mean (about 18 km north–south, design), split at 0 nT, traced, Douglas–Peucker 0.02°. Orientation check: north-up rows give 61 % positive nodes over crust younger than 0.78 Ma (45 % if flipped).
- GPS: NTUS, REYK, HOFN, ALIC, ALGO, BRAZ, NKLG, WTZR, IISC, MKEA; north/east mm a year as printed in the table (columns N, E, V per its header). Arrow length 10 mm a year = 2.5° of arc (design, S30).

## Size (§3.3-6)
All `public/geo/cd-*`: 1.99 × 10⁶ B (1.90 MiB) raw. First screen (rotations + land + points + manifest + text): 231 KB gz.
