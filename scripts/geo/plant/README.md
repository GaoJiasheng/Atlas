# Plant botanical rebuild

`pnpm tsx scripts/geo/plant/build.mjs` compiles the final procedural surfaces and writes only plant parts and `public/models/plant.glb`. The immutable baseline is `baseline-parts.json`. The source uses lofts, continuous curved sheets and tapered sweeps; no browser is needed.

`audit.mjs` measures the shipped, decoded indexed file plus every remaining runtime primitive, including mirrored nodes. This is the authoritative triangle/call/byte report. `preview.mjs final` reads the shipped asset and uses the existing fossil CPU studio renderer; `sheets.mjs final` pairs the renders with locally cached Commons references. `PLANT_SHOTS=id,id` limits a preview. `preview.mjs before baseline` draws original runtime geometry. Reference files stay in the gitignored `refs/` directory; `fetch-refs.py` can restore the documented reference cache.

See `src/content/topics/plant/REBUILD-3D.md` for credits, observations, limitations and gate results. CPU images are not GPU acceptance or FPS evidence.

The existing flower-and-seed primitive reuse helper also consumes plant JSON. It must point to the immutable baseline when this GLB migration is integrated. `flower-and-seed-reuse.patch` is the proposed one-line compatibility change; the protected helper was not changed without permission. The unpatched full suite consequently has ten reuse-test failures, detailed in the rebuild record.
