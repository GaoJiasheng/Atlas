# Solar system — 3D polish

## Polish 2026-11-03 — earlier-stage record

**Historical snapshot, superseded by the completed continuation below.** This earlier stage was partially connected. The topic now uses the rebuilt Sun, irregular asteroids/comet nucleus and gapped Saturn rings. The complete textured proposal is generated and visually reviewable, but the engine currently drops GLB materials/textures/vertex colours and hard-codes catalogue point size. Permission for those additional rendering edits was requested; it has not been received. Existing planet/coma/tail content is preserved until that ownership boundary is resolved. No browser, desktop, git write, package/lockfile or other-topic edit was performed.

### Items and references

1. **Sun — connected.** Baked warm photosphere, emissive shader that bypasses studio diffuse/specular, view-dependent limb darkening, and one smoothly faded corona. An initial layered halo showed concentric rings in CPU close-ups and was replaced after inspection. Solar mesh attributes alone opt into this path. No shared light rig changes. Reference: NASA Sun descriptions, planet imagery and Technical Plate restrained-glow guidance; visual construction, not measured brightness.
2. **Planets — built, pending renderer scope.** Nine local 1024×512 procedural maps (the eight planets plus Moon), 11,884–59,968 bytes each. Earth uses Natural Earth coastlines with constructed climate/cloud patterns; Jupiter has turbulent belts, southern oval Great Red Spot and small anticyclones; Saturn has cloud belts; Mars has rusty/dark albedo and polar ice; Venus a continuous cloud deck; Mercury grey impact terrain; Uranus pale cyan and Neptune blue. Replaced the first vertex-colour attempt after its coastline/cloud grid was visible at 800px. Texture-aware CPU close-ups were inspected again. Reference/rights details are in `data/SOURCES.md`. No claim of a dated global map.
3. **Saturn rings — connected geometry.** C/B/A structure, an actual Cassini opening, Encke-scale opening and separate F ring; both sides visible, many irregular-intensity ringlets stored in vertex colour. Live rendering currently uses a neutral ring material; the proposed vertex colour/alpha requires the pending renderer permission. Reference: NASA Cassini and USGS ring radii.
4. **Asteroids/comet — connected solid bodies; coma/tails pending.** Non-ellipsoidal rocky specimen, 36 separate belt bodies with varied proportions/rotations/jitter, and an unequal bilobed nucleus with a neck and local depressions. The proposal adds a soft coma, narrow tapered ion tail and broader curved dust tail. Existing `comet-positions`/`comet-angle` bindings and their four anti-solar snapshots are retained. Tail material/alpha requires the pending renderer path; existing live tail behaviour is preserved. Reference: NASA comet facts and bilobed nucleus morphology, not a specific surveyed body.
5. **Stars — pending renderer scope.** Factual HYG rows and Orion links are untouched. Star size lives in `CatalogueSky.tsx`, outside the explicit Sun-only renderer exception. Requested narrow permission for readable, theme-coloured screen-space points; no catalogue or camera workaround was used.
6. **Chapter illustrations — complete.** Existing WebP paths retained, quality 85/full alpha, Lanczos3 reduction. Comet: 189,364→115,514 bytes, 1200×900→888×666. Galaxy: 191,856→117,502 bytes, 1200×900→860×645. Inspected native-size and 420 CSS-pixel comparisons on paper/cinema; graphite detail and smooth transparent edges retained. Both exceed 2× the desktop 420px illustration width.

### Counts and budget

These are actual generated index counts, not GPU/FPS measurements. `triangle-audit.json` reports conservative chapter/beat visibility bounds before frustum and simulation visibility culling. Peak: **113,088 before → 155,392 live**, or **260,608 for the complete proposal**, below 350k. Sums across mutually exclusive chapters are 433,218→457,794 live (592,802 proposed); those sums are not simultaneous screen loads. The lossless compressed GLB is about 2.4 MB, below 8 MB.

| Part | Before | Live | Complete proposal |
|---|---:|---:|---:|
| Sun | 2,976 | 20,096 | 20,096 |
| Each main planet | 2,976 | 2,976 | 16,128 |
| Saturn rings | 768 | 83,840 | 83,840 |
| Asteroid specimen | 2,976 | 4,992 | 4,992 |
| Belt (36 bodies) | 107,136 | 10,368 | 10,368 |
| Comet nucleus | 2,976 | 4,992 | 4,992 |
| Comet Sun | 2,976 | 20,096 | 20,096 |
| Coma | 2,976 | 2,976 | 4,992 |
| Ion tail | 7,200 | 7,200 | 3,072 |
| Dust tail | 1,408 | 1,408 | 3,072 |

The 36 differing belt bodies are merged into one draw rather than 36 high-resolution sphere instances. Their combined cost drops by 90%; hero geometry receives the budget instead. No part IDs, 49-object count, 40-beat/chapter references, physical inputs, labels or teaching numbers were changed. No bilingual text correction was necessary: current descriptions remain valid for these shapes.

### Offline visual verification and reproducibility

Commands:

```sh
pnpm tsx scripts/geo/solar-system/build-parts.ts --textures  # regenerate images and meshes
pnpm tsx scripts/geo/solar-system/build-parts.ts             # reuse vendored images
pnpm tsx scripts/geo/solar-system/audit.ts
pnpm tsx scripts/geo/solar-system/render-preview.ts
pnpm tsx scripts/geo/solar-system/render-regressions.ts
```

Inspected final actual-mesh CPU renders in `/tmp/atlas-solar-system-polish/`: `planets-contact-sheet.png`, `small-bodies-contact-sheet.png`, `sun-dark.png`, `sun-paper.png`, Earth opposing hemispheres, Jupiter storm, Saturn inclined rings, three asteroid angles, comet nucleus and four direction panels. These are CPU raster/shader reconstructions, not WebGL, interaction, retina-device or GPU performance acceptance. Texture/coma panels show the labelled proposal, not the current live renderer. The direction panels use explicit radial QA placements; the existing simulation bindings are separately covered by content tests.

Illustration comparisons: `/tmp/solar-system-{comet-tails,milky-way}-{paper,cinema}-webp-comparison.png`.

Shared-material regression: aircon and sun-earth-moon data are byte-identical to the pre-pass files; their actual primitive geometry has no solar emission attribute. Tests check the new emission override is guarded and all existing material uniforms remain unchanged. The additional `render-regressions.ts` pass rendered actual aircon and sun-earth-moon primitive geometry before/after the solar guard, in both themes. All four nonblank CPU image pairs are byte-identical (0 changed channels, maximum delta 0). Inspected comparisons and `report.json` are under `/tmp/atlas-solar-system-polish/regressions/`. This verifies the zero-emission reconstruction stays neutral; WebGL/PBR parity still needs downstream acceptance. No browser was launched here.

### Gates

All four required gates pass on the final assets:

- `pnpm check`: 0 errors, 0 warnings, 4 existing hints.
- `pnpm validate`: 94 topics, 0 errors, 0 warnings.
- `pnpm test`: 251 files, **6,349 tests passed**, no skipped tests (plain command after the final build).
- `pnpm build`: 191 static pages; successful PWA output.
- `git diff --check`: clean (read-only check; no git writes).

The complete built-topic JavaScript budget test also passes. Removed explanatory comments from the emitted solar GLSL string after it pushed the largest shared entry 60 bytes over its existing limit; those explanations remain in TypeScript documentation. No budget was raised. Lossless meshopt compression reduced the first 22 MB export to **2,559,308 bytes**, with no geometry quantisation. The production Three.js meshopt decoder successfully decodes all 24 exported meshes. Earlier parallel checks caused timing-only test failures; the final plain `pnpm test` ran with no build/type-check contention and passed all tests in 47 seconds.

At that checkpoint, texture/alpha and catalogue-point rendering awaited scope approval. The continuation below records the approved implementation and final live assets.

## Polish 2026-11-03 — completed continuation

All requested texture, comet-alpha and catalogue-point work is now connected. The prior permission-dependent list above is resolved. No part ID, selectable-object count (49), chapter/beat reference, label, physical input or teaching number changed. Existing EN/ZH prose remains accurate; no text correction was needed.

### Items completed

- **Planet/Moon surfaces:** all nine vendored 1024×512 WebP atlases now reach the live part material, including the four small Earth references. Three's production GLTFLoader retains sRGB interpretation, glTF UV orientation, embedded WebP textures, source base-colour factor and RGBA vertex colour. Texture sizes remain **11,884–59,968 bytes**, each below 60,000 bytes; no external runtime requests. Source maps replace the family micro-normal/roughness maps only for explicitly opted-in meshes, avoiding plastic grain over planetary geography.
- **Narrow generic material handoff:** `GltfSource.tsx` reads `extras.atlasSurface: true` from authored GLB materials. `PartNode.tsx` carries that optional source into the existing material styling/fading functions; The lazy GLB adapter preserves source alpha mode/alpha test and composes source opacity with chapter/x-ray fades; primitive topics retain the original family styling/fading path. Blended surfaces never write depth and use the existing membrane opacity ceiling for label occlusion, so a soft coma cannot hide the nucleus label. Selection, clipping and transforms retain their existing path; the self-lit solar/comet branches also retain selection emission. Cached loader materials/textures are shared without mutation or per-part disposal. Older GLBs have no opt-in and retain their family look. No camera, framing, light rig, core engine, widget, schema or CSS was changed.
- **Comet:** connected the bilobed nucleus, soft coma, tapered narrow ion tail and broader curved dust tail. Their authored RGBA opacity fades toward the ends and across the silhouette using the emission-3 front-surface shader. The four existing `comet-positions`/`comet-angle` anti-solar snapshots remain covered by the content tests. Both paper and cinema CPU close-ups were inspected.
- **Saturn rings:** connected radial colours and the translucent C ring while retaining the Cassini/Encke openings and F ring. Removed duplicate coplanar reverse-winding triangles; the source double-sided material provides both faces. Ring triangles halve from the earlier rebuild's 83,840 to **41,920**, with no loss of radial detail.
- **Lunar guide:** retains the original orbit centre and 1.9 model-unit radius, with an opening around the Moon so its close-up shows an unobscured lunar face. The guide samples one uniform polar texel rather than wrapping maria along the orbit. This is a schematic guide, not another physical body; no orbital inputs changed.
- **Catalogue points:** 3.2 CSS-pixel antialiased ink discs, no distance attenuation, tone mapping or enlarged glow. Three's actual uniform uploader applies renderer DPR exactly once (tested at 1×, 1.5×, 2×, 3×). All six sky beats were CPU-rendered in both themes at 1×/2×. The optional, validated `meta.pointSizeCssPx` presentation field is supplied only by `stars-hyg-v41-readable-cc-by-sa.json`. This separately licensed CC BY-SA display copy has identical 28 factual rows and all original attribution fields; the original catalogue is byte-identical. **sample-solar continues to use its original .12 world-unit, attenuated point material and unchanged shader.**
- **Earlier completed items retained:** emissive Sun/corona, irregular asteroids and belt, comet nucleus, and both re-encoded chapter illustrations. References and licences remain in `data/SOURCES.md`: NASA/JPL planet/comet/ring imagery, USGS ring boundaries, Natural Earth public-domain coastlines, and the independent HYG catalogue. No new observed surface features or scientific measurements are claimed.

### Counts

Counts are actual indexed geometry, with chapter/beat visibility bounds before frustum/simulation culling; they are not measured GPU draw calls or FPS.

| Item | Original | Completed live |
|---|---:|---:|
| Peak visible triangles | 113,088 | **218,688** |
| Each main planet | 2,976 | 16,128 |
| Each smaller Earth reference | 2,976 | 9,024 |
| Moon plus orbit guide | 6,432 | 12,096 |
| Sun / comet Sun (each) | 2,976 | 20,096 |
| Saturn rings | 768 | 41,920 |
| Asteroid specimen | 2,976 | 4,992 |
| Belt, 36 bodies | 107,136 | 10,368 |
| Comet nucleus | 2,976 | 4,992 |
| Coma | 2,976 | 4,992 |
| Ion tail | 7,200 | 3,072 |
| Dust tail | 1,408 | 3,072 |

From the earlier partially connected checkpoint, peak visible load changes **155,392 → 218,688**. The final peak stays below 350k. The sum across all mutually exclusive chapters is 433,218 → 550,498 triangles, not a simultaneous screen load. Removing unused exported guide copies and duplicate ring faces reduces the meshopt GLB **2,559,308 → 1,845,056 bytes**. Images remain embedded, losslessly mesh-compressed, and locally vendored.

### Offline verification and regression limits

Reproduction:

```sh
pnpm tsx scripts/geo/solar-system/build-parts.ts
pnpm tsx scripts/geo/solar-system/audit.ts
pnpm tsx scripts/geo/solar-system/render-preview.ts
pnpm tsx scripts/geo/solar-system/render-sky-preview.ts
pnpm tsx scripts/geo/solar-system/render-regressions.ts
```

Inspected actual generated geometry at `/tmp/atlas-solar-system-polish/`: the planet/small-body contact sheets, Earth opposing hemispheres, Jupiter storm, Saturn rings, Moon, Sun in both themes, comet close-ups in both themes and four anti-solar angles. Sky previews and per-beat/DPR counts: `sky/contact-sheet.png`, `sky/{paper,cinema}-{1..6}-{1,2}x.png`, `sky/report.json`. These are CPU geometry/shader reconstructions, not WebGL screenshots.

The unit tests use Three's real GLTFLoader and meshopt decoder on the final GLB, with Sharp-backed CPU image decoding, then apply the actual production family styling and lazy source style/fade adapters. They verify embedded textures, colour space, UV orientation, RGBA, alpha/depth behavior, unchanged selection/clipping uniforms, all mesh-to-part connections and the peak budget. Existing bones-and-joints, heart-and-lungs, digestive-system and all six muscles GLBs contain no `atlasSurface` opt-in. Their loaded-material selection and ordinary family/fade path remain unchanged; sun-earth-moon and sample-solar also retain that path. All their existing tests are included in the full test gate. The earlier primitive before/after CPU regression pairs for aircon and sun-earth-moon were rerun in both themes: **0 changed channels**, nonblank images, report and inspected comparisons in `regressions/`.

No browser, desktop, git write, package/lockfile edit or other-topic content edit was performed. Browser interaction, live WebGL/PBR parity and GPU performance remain for downstream browser acceptance, as explicitly required by the task's sandbox boundary. No requested implementation item remains unfinished.

### Final gates

- `pnpm check`: **0 errors, 0 warnings**, four existing hints (1,096 files).
- `pnpm validate`: **94 topics, 0 errors, 0 warnings**.
- `pnpm build`: **191 static pages**, successful PWA generation. The built GLB and display catalogue match the final vendored files.
- `pnpm test`: **251 files, 6,369 tests passed**, no skipped tests, final plain run after build/type-check completion. This includes the real-loader/alpha/DPR tests, sun-earth-moon, bones-and-joints, heart-and-lungs, digestive-system, the muscles series, sample-solar fixture coverage, and the complete built-topic JavaScript budget gate.
- `git diff --check`: clean; read-only verification, no git writes.

The first-screen JS limit remains unchanged. To fit the narrow renderer addition, the final shader reuses Three's existing RGBA colour path, groups equivalent GLSL declarations and keeps explanatory comments outside emitted GLSL. Source handling remains in the lazy GLB loader; primitive family styling is unchanged. Selection colour/emission and the membrane ceiling used for transparent label occlusion are retained. No feature, geometry detail or budget limit was removed to pass.

Final command logs: `/tmp/atlas-solar-system-polish/{check,validate,build,test}.log`. No requested implementation item remains unfinished; the downstream browser/WebGL acceptance described above is the only unperformed verification.

## Polish 2026-11-03 — browser acceptance fixes (Claude)

First WebGL look (headless Chromium, paper + cinema, DPR 1 and 2) found four problems the CPU previews hid; all fixed in the build scripts and regenerated:

- **Saturn rings:** ringlet modulation `sin(r·240)`/`sin(r·593)` sat above the 125 steps/unit radial sampling and aliased into concentric moiré; the 0.005-wide F ring was sub-pixel and drew a ragged, hairy outer edge. Now `sin(r·38)`/`sin(r·91)`, ring zones slightly brighter, F ring drawn 0.016 wide at 0.55 alpha (comment in `rings()`). Triangles 41,920 → 42,240.
- **Sun on paper:** the baked photosphere read as pale cream, close to the paper ground. Granulation base colours moved to a warmer gold (`surfaces.ts`); limb darkening and corona unchanged; cinema still reads as a glowing disc.
- **Comet:** the dust tail colour was almost the paper colour and tail/coma alpha too low, so the tails vanished on paper. Dust tail now ochre, ion tail deeper blue, peak alpha .34 → .62; coma alpha .23 → .42.
- **Catalogue stars:** 3.2 CSS px discs rendered as ~1.5 px dots after the soft edge, smaller than the old points. `pointSizeCssPx` 3.2 → 5 (still within the 1–6 clamp); Orion reads at DPR 1 and 2 in both themes.

Peak visible triangles now 219,008 (was 113,088 on main).
