# Continental Drift — data and source ledger

Facts read 2026-11-15 (docs/72 §0.3; facts that could not be read from a primary or authoritative page were cut, see docs/72 §9). The application makes no external requests: every file is local under `public/geo/cd-*`.

Geometry audit: [SOURCES-GEO](../../../../../scripts/geo/continental-drift/SOURCES-GEO.md), [build report](../../../../../scripts/geo/continental-drift/build-report.json), [download inventory](../../../../../scripts/geo/continental-drift/INVENTORY.json).

## Map (S2, S3, S34)
Merdith et al. 2021, plate model v1.2.4, CC BY 4.0. Adapted: the rotation file is extracted to JSON unchanged; coastline and continent polygons are simplified (two levels of detail); points are assigned to plates with the model's static polygons. Every frame is the model's position for the selected age, computed in the browser by interpolating between total rotation poles the way GPlates does, checked against pyGPlates 1.0.0 within 0.001° (golden test). Outlines are today's coasts, not ancient shorelines; plates are rigid; east–west positions are a model convention (S4). pyGPlates is a build tool only (GPL-2.0); it is not deployed.

## Present-day layers (shown at 0 Ma only)
- Ocean-floor age: Seton et al. 2020, CC BY 4.0 (S14), 1° cells, 19 nested bands. Not rotated with the Merdith model (D5).
- Magnetic stripes: EMAG2v3 sea-level grid (S16) through a GMT remote-data tile (S17); smoothed and split into positive / negative only.
- GPS: NASA JPL table2 snapshot (S27), IGS14, epoch 2026-01-01. Arrow scale 10 mm a year = 2.5° (S30).

## Evidence points
- Glacial rocks (S21, S6) and mountain belts (S23, S6): region-level placements of the places the sources name; not measured outcrops.
- Fossils: PBDB snapshot 2026-11-15, CC0 (S18): 1,502 occurrences in 439 collections of *Mesosaurus*, *Glossopteris*, *Lystrosaurus* and *Cynognathus*. Records, not a census.

## Corrections made while reading sources
- Pangaea assembly: ~320 Ma (S4), not ~335 Ma.
- Australia: ~7 cm a year towards the north-east (S28), not north-north-east; "1.5 m since 1994" not found, cut.
- Last reversal: 772.9 ka (S11); "~786 ka" not found, cut.
- Most ocean floor: "very little older than 150 Ma" (S15), not "younger than ~200 Ma".
- India–Asia collision: 50–40 Ma (S5).
- Singapore collision: essentially complete by c. 200–195 Ma (S25); Metcalfe gives Middle–Late Triassic for Sibumasu (S26); both are stated.
- Cynognathus: "mammal-like reptile" (S6); its diet was not read, so not stated.
