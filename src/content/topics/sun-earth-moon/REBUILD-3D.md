# Sun, Earth and Moon — 3D rebuild

## Polish 2026-11-03 — round 1 historical checkpoint

**Historical checkpoint, superseded by round 2 below.** At the end of round 1, surfaces were prepared but not integrated because the allowed scope excluded shared renderer support. Only topic data, assets and the F5 close-up were live. The later accepted solar-system work supplied the shared surface/emission mechanism used in round 2. No shared engine, browser, desktop, package/lock or git write was performed in round 1.

### Items and references

1. **Earth — prepared, not live.** Real Natural Earth 110m land rings, pole/seam closure, muted surface-cover variation, non-dated cloud wisps, and a fixed Singapore ring. The longitude convention is aligned to the existing observer meridian, so the Singapore ring and the observer coincide at the Singapore chapter latitude. The existing 23.44° axial transform, axis-end label, equator, spin and other chapter controls remain unchanged. Reference: Natural Earth provenance and Apollo 17 Blue Marble; details/licences in `data/SOURCES.md`. Live data raises dark fill from 0.035 to the permitted 0.05; the prepared opt-in shader supplies a neutral grey floor independent of dark blue ocean albedo.
2. **Moon — prepared, not live.** Genuine NASA LROC near-side maria, highlands and crater rays; real LOLA radial relief with no height exaggeration. Near-side longitude zero maps to the existing local +X synchronous face, so the texture turns with the same quaternion as the former blank sphere and pin. The far side is separately mapped, not mirrored from the near side. Sources: NASA SVS CGI Moon Kit, LROC WAC and LOLA. Existing small orange near-side pin stays as an explicitly artificial orientation aid.
3. **Sun — existing self-light verified; refinement prepared.** `OrbitDriver` already sets the Sun's `uOrbitLight` to 2, and the shared material overwrites studio diffuse/specular lighting with self-lit colour. Thus the live topic has no specular highlight to remove. The prepared surface adds subtle granulation and view-dependent limb darkening, gated to explicitly opted-in textured surfaces. No changes to solar-system or shared material files were applied.
4. **F1–F5 — audited, with an additional live F5 fix.** Current follow-up tests cover axis/normal anchors, all authored observer/pin hemisphere checks, tilt geometry, unchanged controls, and the four narrow-tablet full-Moon projections. F3 remains radius 0.006. F4's exact bilingual note and one-scale diagram are retained, pending Gavin's editorial choice. For F5, 04.5 now uses a genuine lunar close-up (position `[0.05,0.26,1.08]`, target `[0,0,0.75]`, FOV 34°); it retains α=90° and synchrony=false, and keeps the orientation pin on the visible hemisphere. A projected-size regression requires the lunar radius to exceed 100 px at a 900 px viewport. The old view's tiny lit patch is no longer the only evidence for the caption. The close-up hides the Earth body and its auxiliary guides for this beat only, preventing the hidden Earth from forcing the HUD fitter to zoom away from the Moon. All following beats restore their own visibility state. Other chapter cameras and shared framing are unchanged.

### Geometry, behaviour and text

- Thirteen selectable part ids, four groups, eight chapters, 39 beats, thirteen controls, 23 outputs and the existing teaching numbers are retained. No explode/cutaway mechanism was added: these are already disabled for the orbit model.
- Baseline and final live triangle counts are unchanged (only fill and one camera changed). The prepared model's counts and complete visible-scene comparison are recorded below after generation.
- Round 1 prepared three surface meshes and minimal bilingual corrections for Earth, observer, Moon and the near-side pin; these were not live at that checkpoint. Round 2 installs them through `build-parts.ts`.
- Committed NASA inputs are under this topic's `sources/`; Natural Earth comes from installed world-atlas. Current rebuild commands are listed in round 2 below.

### Offline visual QA and browser handoff

CPU previews are generated with `pnpm tsx scripts/geo/sun-earth-moon/render-preview.ts`. They rasterise the generated triangles, UV maps, measured relief, actual snapshot transforms and analytic sunlight from several directions. Surface previews explicitly say **proposed shared surface support**; they are not evidence that the current runtime displays textures. The footer also states that these are not browser/GPU/HUD acceptance.

Browser acceptance must inspect exactly:

- **F1:** BG.2; 01.2 / 01.4 / 01.5; all of 02.1–02.5. After the camera settles, axis and plane labels must anchor on the exposed axis/normal ends. Check chapter-entry labels as well as beat links, in EN/ZH and paper/cinema.
- **F2:** 04.3 / 05.3 / 07.3 / 07.5 at 1024×768, 1180×820, 1280×720 and 1600×900. Both Earth and Moon must be visible, Earth readable, Sun outside HUD text, and newly detailed bodies must not cause excess framing retreat. Repeat after resize, card collapse, reader collapse, scale switches, PRESENT exit and return from free camera. CPU projection tests do not certify DOM panel measurements.
- **F3:** BG.2, all of 01, and 02.1–02.5: fine guide strokes stay readable without overpowering the surface; axis and tilt arc remain distinct.
- **F4:** 05.3 / 05.4: the bilingual “too thin” note remains next to the finite-Sun, one-scale diagram. Do not enlarge physical cones to manufacture visibility; Gavin still decides whether to retain the strip.
- **F5:** 01.5 track leader lands on the actual track; 02.5 plane leader lands on the normal; 04.5 shows the enlarged sunlit far-side patch and a legible near-side pin label; 06.5 Sun avoids title/PLATE text. For 04.5 verify the larger Moon in both languages/themes and on narrow screens after HUD fitting, not just the author camera.
- **After surface integration:** rotate Earth through a full turn, inspect Africa/Americas/SE Asia close up, verify the Singapore ring coincides with the observer at 1.3342° N, inspect tilted Earth in 02, and inspect both Earth and Moon night hemispheres for neutral dark grey rather than black. Follow the Moon through the synchronous orbit and switch synchrony off: maria must stay fixed to the lunar body and show nearly the same face toward Earth when on. Inspect near/far-side craters close up and Sun from multiple camera angles: no facets, UV seam, inverted pole, moving specular highlight or runtime external request.

### Final measurements, visual observations and gates

| Geometry | Before / live after | Prepared integration |
|---|---:|---:|
| Sun | 2,976 | 16,128 |
| Earth | 2,976 | 16,128 |
| Moon | 2,976 | 65,024 |
| Axis, equator and two markers | 6,816 | 6,816 |
| Six runtime guides, all enabled | 4,992 | 4,992 |
| **Conservative total** | **20,736 / 20,736** | **109,088** |

The prepared GLB is **3,882,408 bytes** (3.70 MiB), with three textured meshes and embedded JPEG maps. Counts come from the actual generated indices plus OrbitDriver's six-sided runtime guide segments, not estimated primitive labels. Audit: `public/models/sun-earth-moon/triangle-audit.json`. These are geometry counts; no GPU frame rate or measured draw-call claim is made. Crater/colour/cloud detail is baked into three local maps, with no per-crater geometry/draw overhead.

Previews: **`/tmp/atlas-sun-earth-moon/previews/`**. Inspected Earth Singapore/Africa/Americas and night-side views, lunar near-side/quarter/far-side close-ups, Sun, 02.1 with the actual guide point sequence/radius, before 04.5, current live 04.5, and proposed textured 04.5. Compared the Earth rendering to Apollo 17 AS17-148-22727 and the Moon to the downloaded NASA albedo. The first 04.5 render exposed an Earth/Moon overlap: raised the camera and hid Earth/auxiliary references for this close-up, rerendered, and confirmed a clear Moon disc and visible lit far-side patch. Final key files are `earth-singapore.png`, `moon-nearside.png`, `moon-quarter.png`, `moon-farside.png`, `sun-self-lit.png`, `tilt-02-1.png`, `before-04-5.png`, `live-after-04-5.png`, and `far-side-04-5.png`. The current live preview shows the untextured Moon; coloured previews explicitly remain proposed integration evidence.

Focused verification: **23/23 topic and asset tests passed**, including all existing content/geometry/HUD projection contracts, the enlarged lunar disc, asset budget, winding, geographic convention, lunar uint16 preservation and maria contrast. Final gate outcomes are recorded below.

Final gates for the authorised topic-only state:

- `pnpm check`: **pass**, 0 errors / 0 warnings; four pre-existing hints outside this topic. A final `pnpm exec tsc --noEmit` also passed after the preview-index update.
- `pnpm validate`: **pass**, 94 topics, 0 errors / 0 warnings.
- `pnpm run test --maxWorkers=4`: **pass**, 251 files / **6,344 tests**. The first unrestricted concurrent run hit resource timeouts; a subsequent run overlapped a rebuild and caught `dist/en/topics` temporarily missing in the JS-budget test. The final complete run happened after the build, with no overlapping build and no relaxed timeout/assertion settings.
- `pnpm build`: **pass**, 191 pages, PWA generated.
- `git diff --check`: **pass**, read-only inspection; no git writes.

Logs: `/tmp/atlas-sun-earth-moon/check-complete.log`, `tsc-final.log`, `validate-final.log`, `test-complete.log`, `build-final.log`.

Those historical gates covered the unintegrated topic-only state. Round 2 below supersedes the unfinished integration and its old renderer proposal. No browser, desktop, Chromium, e2e or GPU tool was used in either pass, as instructed.

## Polish 2026-11-03 — round 2 completed integration

The live topic now loads `public/models/sun-earth-moon.glb`. All requested implementation items are complete. Browser/WebGL, interaction and GPU acceptance remain unperformed because this task explicitly prohibits browser/desktop use; the exact downstream checklist is in [FIXES.md](FIXES.md#polish-2026-11-03--round-2-browser-acceptance).

### Per-item changes and references

- **Earth:** enabled the Natural Earth 110m continents, illustrative broken cloud wisps and fixed Singapore ring. The geographic +X meridian remains 103.7357° E, so the movable observer at 1.3342° N coincides with Singapore's locator. Spin, true physical radii, axial tilt, equator, authored controls and dates are unchanged. Earth and Moon night sides now have a neutral 0.05 linear-grey floor, independent of ocean/albedo colour. Compared offline renders to the existing Apollo 17 Blue Marble reference; the cloud/surface colours remain illustrations rather than observed weather. All references and licences are in `data/SOURCES.md`.
- **Moon:** enabled NASA SVS CGI Moon Kit / LROC maria, highlands and rays with the real LOLA relief. Longitude zero remains local +X, the synchronous near-side direction. Preserved the original measured height scale and small artificial orientation pin. Inspection from Earth's direction at four actual orbit snapshots shows the same maria face. Fixed a newly exposed polar-normal defect: longitude samples collapse to one mean pole radius with radial pole normals, eliminating a lighting singularity at the cap.
- **Sun:** uses material `extras.atlasSurface` and `_EMISSION=1`, exactly the accepted solar-system mechanism. Warm gold granulation and its view-dependent limb darkening remain visible against both themes. The accepted shader replaces diffuse/specular illumination; the Sun uses the same membrane family as solar-system so its 0.55 opacity compensation preserves linear visibility fades. There is no moving studio highlight and no new Sun API, glow shell, flare or extra draw.
- **Integration:** moved `atlasSurface` from node extras to material extras; the accepted GLTFLoader/style/fade path preserves embedded albedo, sRGB and UV orientation. The sole essential renderer addition is a neutral night-fill expression gated by Three's existing `USE_MAP` define inside the existing analytic orbit-light branch. The accepted loader supplies that map through `atlasSurface`; there is no new material API or uniform. Untextured orbit bodies and solar-system's non-orbit PBR path retain their previous behavior. The GLB sits at the flat `/models/sun-earth-moon.glb` route (Claude acceptance moved it so the shared schema regex stays unchanged); build/audit reports stay in `public/models/sun-earth-moon/`. No changes to GltfSource, PartNode, CatalogueSky, lighting rig, core, widgets, framing or camera files.
- **Cleanup / text:** deleted the obsolete renderer proposal and its generator. `build-parts.ts` now installs live data by default and is idempotent (identical SHA-256 after a second run). Only Earth, observer, Moon and near-side pin details changed minimally in **both EN and ZH** to describe the now-visible surfaces. No part id/count, chapter/beat caption/reference, teaching number, sim input, group or binding changed. The solar-system test's obsolete assertions that this topic has no surface/emission opt-in were retired; its other material regressions remain intact.
- **F1–F5:** retained all axis/normal/track label anchors, `hudFrame.parts`, 24px Earth minimum radius, orbit-guide radius 0.006, one-scale shadow note, 04.5 close-up visibility and 06.5 framing. No new camera numbers or helper-line changes. Existing 18 content tests cover those behavior contracts. Exploded/cutaway remain disabled for this orbit model, as before.

### Counts and asset budget

| Item | Round-1 live before | Round-2 live after |
|---|---:|---:|
| Sun | 2,976 | 16,128 |
| Earth | 2,976 | 16,128 |
| Moon | 2,976 | 65,024 |
| Axis, equator and two markers | 6,816 | 6,816 |
| Six runtime guides, all enabled | 4,992 | 4,992 |
| **Conservative simultaneous total** | **20,736** | **109,088** |
| Prepared → final GLB bytes | **3,882,408** | **1,420,292** |

The full 97,280 body triangles from the prepared model are retained: no surface/silhouette reduction or height quantisation. Compression uses **WebP + lossless meshopt**. Earth/Moon remain 2048×1024 at quality 88 (105,746 / 381,990 bytes); Sun remains 1024×512 at quality 85 (15,066 bytes). The final GLB is below the **1,500,000-byte** task limit. Counts come from decoded indices and the actual six-sided runtime guide segments; they are conservative geometry inventory, not measured GPU/FPS/draw-call claims. Reports: `public/models/sun-earth-moon/{build-report,triangle-audit}.json`.

### Offline visual verification

Actual final compressed geometry and embedded images were decoded through meshopt and CPU-rasterised. Inspected Earth Singapore/Africa/Americas, its night side, Singapore plus actual observer, lunar near side/quarter/far side/night, Sun on paper/cinema with opposing light/camera directions, the four synchronous inspections, 02.1 tilt and 04.5 far-side patch. Close-up comparison used the existing Apollo 17 reference and NASA LROC map. The first normal audit exposed the lunar pole issue; fixed, rebuilt, rerendered and passed the audit. No missing surface is represented by an unchanged primitive preview.

Previews: **`/tmp/atlas-sun-earth-moon/round-2/previews/`**. Key files: `contact-sheet.png`, `earth-singapore.png`, `earth-africa.png`, `earth-americas.png`, `earth-night.png`, `singapore-observer.png`, `moon-nearside.png`, `moon-quarter.png`, `moon-farside.png`, `moon-night.png`, `sun-self-lit.png`, `sun-self-lit-cinema.png`, `synchronous-{0,90,180,270}.png`, `tilt-02-1.png`, `far-side-04-5.png`. `before-04-5.png` is explicitly labelled a round-1 primitive baseline. Synchronous inspection panels use an explicitly labelled camera-aligned inspection light to isolate face orientation from phase; the other panels reconstruct analytic sunlight. These are offline material reconstructions, not browser screenshots or HUD acceptance.

Reproduction:

```sh
pnpm tsx scripts/geo/sun-earth-moon/build-surfaces.ts
pnpm tsx scripts/geo/sun-earth-moon/build-parts.ts
pnpm tsx scripts/geo/sun-earth-moon/audit-geometry.ts
pnpm tsx scripts/geo/sun-earth-moon/render-preview.ts /tmp/atlas-sun-earth-moon/round-2/previews
```

### Final gates

The tiny mapped-orbit lighting addition initially pushed sample-space’s existing first-screen JS limit over by 70 bytes. Reused Three’s `USE_MAP` flag (no new loader code/API), shared the analytic-light dot product and removed indentation from emitted GLSL strings; these formatting changes alter no shader operations. The unchanged 539 KB budget subsequently passed. A final fade check also verifies the Sun’s family opacity matches the accepted photosphere compensation.

All four required gates pass on the final integrated assets and Sun fade setup:

- `pnpm check`: **0 errors / 0 warnings**, four existing hints (1,103 files).
- `pnpm validate`: **94 topics, 0 errors / 0 warnings**.
- `pnpm build`: **191 static pages**, successful PWA generation. The built GLB is byte-identical to the vendored file (SHA-256 `91479e3c21891782db4b5f3dbbaf3e9f3bdb4f09ba7ce470fe5ca8c7eae6e1f9`).
- `pnpm test`: **252 files / 6,376 tests passed**, no skipped tests; final complete run after build/check completion. Includes production GLTFLoader, meshopt, material/style/fade, the 1.5 MB asset budget, measured relief/winding/normals/maria, all F1–F5 topic contracts, legacy GLB and solar-system regressions, and the unchanged first-screen JS budget.
- `git diff --check`: clean (read-only; no git writes).

No requested implementation item remains unfinished. Browser/WebGL/interaction/HUD acceptance and GPU performance are intentionally left to the downstream acceptance in FIXES.md because this task prohibits browser/desktop use. No e2e/Chromium session, package/lockfile edit, core/widget/framing change or other-topic content change was performed.

Logs: `/tmp/atlas-sun-earth-moon/round-2/{check,validate,build,test,focused,preview,audit}.log`.

## Claude browser acceptance · 2026-11-03 (round 2)

GPU `pnpm shoot --beats` (en/paper, zh/cinema) against branch HEAD 93c5301 found the live surfaces broken in the real renderer, although every offline/unit check passed:

- **All three bodies sat at the origin** (Sun drawn over Earth, Earth/Moon hidden inside it in most beats). Cause: GLB parts mount after OrbitDriver, so their PartNode frame ran later and reset the placed position to the GLB rest pose each frame (scale survived). Fix: OrbitDriver marks the handles it places (`placed`), and PartNode leaves their position to it — the same result primitive bodies always got by running earlier. Two lines in PartNode/OrbitDriver; first-screen JS budget still passes.
- **Earth/Moon had no `_EMISSION` attribute** while sharing the part shader with the Sun; a missing attribute reads whatever generic value an earlier draw left. Every body now carries it (Earth/Moon 0), as solar-system does. GLB 1,420,292 bytes.
- The shared-schema regex change was reverted; the GLB moved to the flat `/models/sun-earth-moon.glb` route. The e2e external-request check now ignores the `blob:` URLs GLTFLoader uses for embedded textures.

After the fixes all 39 beats draw Earth (continents, clouds, Singapore ring), Moon (maria, relief) and a self-lit gold Sun in place; 39/39 beat links match. Remaining caveat: on cinema the neutral grey night side is close to the dark plate, so a fully night-side Earth (01.1) reads mostly by its outline.
