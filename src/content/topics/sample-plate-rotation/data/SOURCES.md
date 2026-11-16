# Synthetic plate-rotation fixture provenance

Everything in this draft topic is TEST/DESIGN data created by Atlas for rotation-map engine assertions (docs/72 §4.6), not a plate model or real fossil data. S1 identifies this design source. Files: `public/geo/spr-*.json`, written by `scripts/geo/sample-plate-rotation/build.ts`.

Fixture: three plates. Plate 1 turns about the 0° N 0° E axis (20° at 100 Ma, 40° at 200 Ma) and carries a ring round the South Pole. Plate 2 turns about the spin axis (−60° at 200 Ma) and carries a ring across the antimeridian, valid 150–0 Ma. Plate 3 follows plate 1 up to 100 Ma and plate 2 from 100 Ma (a fixed-plate switch), with a 10° turn about the spin axis. Two points, one group of two records (one valid 150–0 Ma), two labels (one shown 200–120 Ma only).
