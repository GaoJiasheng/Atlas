# Sun, Earth and Moon — 3D rebuild

## Polish 2026-11-03

**Status: topic-only improvements applied; full surface integration prepared but blocked by the explicit ownership boundary.** The user permits this topic's generators, content, assets and tests, while the current renderer discards glTF albedo maps and accepts only flat `/models/<name>.glb` routes. A concise approval request for the minimum shared support was sent during the work; no approval has been received. No shared engine file, framing code, browser, desktop, package/lock file or git state was modified. The reviewable proposed shared diff is `scripts/geo/sun-earth-moon/surface-support.patch`; it is **not applied**.

### Items and references

1. **Earth — prepared, not live.** Real Natural Earth 110m land rings, pole/seam closure, muted surface-cover variation, non-dated cloud wisps, and a fixed Singapore ring. The longitude convention is aligned to the existing observer meridian, so the Singapore ring and the observer coincide at the Singapore chapter latitude. The existing 23.44° axial transform, axis-end label, equator, spin and other chapter controls remain unchanged. Reference: Natural Earth provenance and Apollo 17 Blue Marble; details/licences in `data/SOURCES.md`. Live data raises dark fill from 0.035 to the permitted 0.05; the prepared opt-in shader supplies a neutral grey floor independent of dark blue ocean albedo.
2. **Moon — prepared, not live.** Genuine NASA LROC near-side maria, highlands and crater rays; real LOLA radial relief with no height exaggeration. Near-side longitude zero maps to the existing local +X synchronous face, so the texture turns with the same quaternion as the former blank sphere and pin. The far side is separately mapped, not mirrored from the near side. Sources: NASA SVS CGI Moon Kit, LROC WAC and LOLA. Existing small orange near-side pin stays as an explicitly artificial orientation aid.
3. **Sun — existing self-light verified; refinement prepared.** `OrbitDriver` already sets the Sun's `uOrbitLight` to 2, and the shared material overwrites studio diffuse/specular lighting with self-lit colour. Thus the live topic has no specular highlight to remove. The prepared surface adds subtle granulation and view-dependent limb darkening, gated to explicitly opted-in textured surfaces. No changes to solar-system or shared material files were applied.
4. **F1–F5 — audited, with an additional live F5 fix.** Current follow-up tests cover axis/normal anchors, all authored observer/pin hemisphere checks, tilt geometry, unchanged controls, and the four narrow-tablet full-Moon projections. F3 remains radius 0.006. F4's exact bilingual note and one-scale diagram are retained, pending Gavin's editorial choice. For F5, 04.5 now uses a genuine lunar close-up (position `[0.05,0.26,1.08]`, target `[0,0,0.75]`, FOV 34°); it retains α=90° and synchrony=false, and keeps the orientation pin on the visible hemisphere. A projected-size regression requires the lunar radius to exceed 100 px at a 900 px viewport. The old view's tiny lit patch is no longer the only evidence for the caption. The close-up hides the Earth body and its auxiliary guides for this beat only, preventing the hidden Earth from forcing the HUD fitter to zoom away from the Moon. All following beats restore their own visibility state. Other chapter cameras and shared framing are unchanged.

### Geometry, behaviour and text

- Thirteen selectable part ids, four groups, eight chapters, 39 beats, thirteen controls, 23 outputs and the existing teaching numbers are retained. No explode/cutaway mechanism was added: these are already disabled for the orbit model.
- Baseline and final live triangle counts are unchanged (only fill and one camera changed). The prepared model's counts and complete visible-scene comparison are recorded below after generation.
- The complete proposed topic data is produced by `pnpm tsx scripts/geo/sun-earth-moon/build-parts.ts` at `/tmp/atlas-sun-earth-moon/proposed-parts.json`. It replaces only the three body spheres with the prepared meshes and minimally corrects Earth, observer, Moon and near-side details in EN + ZH. Live details still accurately describe the unintegrated model.
- Rebuild: `pnpm tsx scripts/geo/sun-earth-moon/build-surfaces.ts`. Committed NASA inputs are under this topic's `sources/`; Natural Earth comes from installed world-atlas. `prepare-support-patch.py` creates a diff without writing to shared paths. Apply that diff only after scope approval, then install proposed parts and rerun the gates.

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

These gates do **not** validate the unapplied shared patch or an integrated textured runtime. Activating the prepared surfaces and neutral night shader remains unfinished solely because approval to change the four shared files has not arrived. The exact files are `PartNode.tsx`, `GltfSource.tsx`, `materials.ts` and `schema.ts` under `src/engines/space-scene/`; no core/framing/widgets code is proposed. The patch retains local opted-in albedo maps, provides neutral night fill and solar limb darkening, and admits the topic-owned nested GLB route. After that scope exception, install the proposed data, rerun the gates against the integrated state, and perform the browser checklist above. No browser, desktop, Chromium, e2e or GPU tool was used in this polish pass, as instructed.
