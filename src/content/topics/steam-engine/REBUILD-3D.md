# Steam engine · 3D rebuild · 2026-11-02

Run `pnpm tsx scripts/geo/steam-engine/build-engine.mjs`. The old topic-local
`generate.mjs` delegates to this build. `definition.json` preserves the published
copy, labels, numbers, poses, tables and bindings; no engine changes were needed.

| Parts | Rebuilt form |
|---|---|
| sun, planet | Involute toothed rims, four open spokes, bored hubs, planet pin/retainer. Shared `scripts/geo/kits/gear.ts` supports module, tooth count, solid web/spokes and correct external mesh placement/phase. |
| beam | Deep built-up timber beam with iron strap bands, attachment bosses and projecting central trunnion (timber, as on the Lap engine; acceptance fix). |
| engine-frame | Front and rear timber A-frames under a timber cap, iron trunnion bearings and a rear output pedestal clear of the flywheel (acceptance fix: Codex's cast columns contradicted the Lap engine and the rear column cut the flywheel rim). |
| flywheel | Heavy rectangular rim, six straight tapered spokes, substantial hub and shaft key; existing outside diameter retained. |
| drive-rod | Bored joint eyes; original rigid endpoints retained. |
| cylinder | Lagged barrel, bolted flanged covers and rod gland; bore and moving clearances retained. |
| boiler, boiler-water, furnace, boiler-seating | Vaulted wagon shell with flat foot, matching level water, reinforcing bands, masonry setting and iron fire-door. |
| nc-beam, nc-cylinder, nc-pump | Deeper beam, substantial smooth arch heads and braces, trunnion, open rim and bolted base; pump rod extends below the shaft mouth in both poses. |
| comparison-support | Cutaway masonry engine house with bob-wall supporting the beam, dome boiler below the cylinder and an open pump-shaft well. |

The toothless-disc teaching problem is resolved with visibly meshing teeth.
This checkout already contained toothed sectors; the rebuild also fixes their
root-depth backtracking. Tests check 3,073 physical tooth-contact samples, correct
phase and two shaft turns per orbit. Original rigid drivers, Newcomen chain
scales, explosion vectors, ids and numbering remain intact. Only one bilingual
support description changed: stand → bob-wall house (the frame text stays "timber and metal").

References inspected: Science Museum Group Lap engine (S2), Ferguson figure 10
(S6), and Lardner plate III (S7). URLs and licence notes are in `data/SOURCES.md`.
The timber sections and house are reconstruction, not an exact Lap replica.

| CPU geometry census | Before | After |
|---|---:|---:|
| Selectable / context parts | 56 / 4 | 56 / 4 |
| All geometry triangles, including repeats and offstage studies | 132,144 | 178,360 |
| Merged material pieces, excluding shadows/flow/ground | 74 | 80 |

`measure.ts` uses the actual engine geometry builders. Repetition uses flange
bolt circles and fins; same-material extras merge. The entire census is below
0.3 M triangles. Material-piece counts are **not measured renderer draw calls**.

Validation: `pnpm check`, `pnpm validate`, `pnpm test` (6,135 tests) and `pnpm build`
pass. Browser shoot and the 11 steam-engine e2e tests cannot launch Chromium in
this sandbox (`bootstrap_check_in … Permission denied`). No browser screenshots
or GPU timing are claimed. The CPU depth-buffer previews use actual generated
meshes, original camera coordinates and both Newcomen end poses; they validate
form, not runtime shaders, clipping, HUD or animation playback.

Inspected before/after previews: `shots/steam-engine/cpu-before/` and
`shots/steam-engine/cpu-preview/`: hero, beam, gears, Newcomen; additionally the
90-degree gearing and Newcomen power pose. Later: rerun `pnpm shoot steam-engine
--beats --locale en --theme paper` and browser e2e in a Chromium-capable environment.
