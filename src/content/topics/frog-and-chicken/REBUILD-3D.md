# Frog and chicken · 3D rebuild record

## Polish 2026-11-03

### What changed

1. **Hen** — topic-owned `specimens.ts`, with no edit to `kits/bird.ts`. One continuous smooth breast/shoulder/neck/head loft; five-point rounded serrated single comb; two free-hanging wattles; paired earlobes, iris/pupil, two-part hooked beak, nares and gape. Both folded wings carry overlapping curved primary/secondary-style vanes and smaller coverts, with unequal lengths and mild tip curl. Fourteen graduated rectrices in seven pairs make a short arched hen tail; the old three wedge plates are gone. Cuffed upper legs, hock bends, finely sampled transverse shank relief plus overlapping anterior scutes, three forward toes and a rear hallux, with separate claws. Repeated detail is statically batched by the existing engine/material slots; no per-frame geometry work. Vanes vary in outline and pose rather than using a regular radial fan.
2. **Frog feet and form** — `amphibians.ts`: individually rounded, jointed digits; exactly four unwebbed front fingers and five long hind toes per foot, fourth hind toe longest. Two thin, bevelled web membranes follow the toe roots and have concave interdigital margins. Smooth broad snout, horizontal pupils, attached lids, tympana and skin-level dorsolateral folds; forearm and thigh connections pass through the body, not through exposed hairline connectors. Round limb ends heal wrist/knee/ankle joins.
3. **Egg** — asymmetric oviform meridian (47 samples), 96 circumferential segments for both complementary hollow shell sectors and albumen; yolk 64 segments. Shell-window pose, yaw/arcs, explosion and embryo visibility controls remain unchanged. Added blunt-end air-cell lens and opposed twisted chalazae. EN/ZH albumen text now describes those structures while still declaring omitted shell membranes.
4. **Metamorphosis** — smoothly profiled blunt larval body, attached eyes/mouth, continuous tapered tail muscle and smoothly sampled dorsal/ventral tail membrane, with no invented fin rays or separate fish fins. Hind-leg larva retains two five-toed hind feet and no forelimbs. Froglet has the complete four-limb anatomy and an attached tapered remnant tail. Chick has its own rounder proportions, small beak/tuft, layered wings and four-toed feet. Frog/chicken comparison rows are local meshes baked from the complete stage forms, retaining bodies, digits and the smooth oviform egg. These two comparison casts use a single body-colour material per row; the main specimens retain their individual anatomical colours and translucent membranes. EN/ZH no longer says the miniatures omit digits.

### References and fact discipline

Read and inspected: University of Kentucky/Poultry Extension external hen anatomy (S23); Naturalis common-frog morphology (S24); David Perez CC BY 3.0 hind-foot macro; PurePNG/DodgeBanger hen profile (page states CC0); Illinois Extension egg structure (S7); Mayer et al. 2004 tail study for seven rectrix pairs. Full links, licensing and development-only photo handling are in `data/SOURCES.md`. Original geometry throughout; no downloaded mesh, photo texture, new dependency or runtime external resource. `public/models/frog-and-chicken.glb` contains the two generated comparison nodes, with its licence in `asset.copyright` and `data/SOURCES.md`. It is written under the engine’s required flat `/models/<slug>.glb` URL namespace.

Kept all **24 part IDs (21 selectable + 3 context), 13 poses, 6 chapters, 30 beats**, simulation tables/control IDs and teaching stage counts. Only four bilingual part-detail paragraphs change: hen, adult frog, albumen and frog comparison. Published names, summaries, control/output labels and teaching specifications are preserved verbatim in `scripts/geo/frog-and-chicken/editorial.json`; the earlier generator had stale editorial wording, so the metadata is now separated from geometry to prevent accidental relabelling on rebuild. Original generic specimens remain independently enlarged, not measurements or a Singapore species/breed identification.

### Actual geometry counts

Counts use the runtime `partPieces` factory, including instances, rather than estimates from primitive names. Before is the saved original `parts.json`; after is the regenerated delivery data.

| Item | Before triangles | After triangles |
| --- | ---: | ---: |
| Adult hen | 9,580 | 120,710 |
| Chick | 8,788 | 80,604 |
| Adult frog | 14,848 | 38,472 |
| Froglet | 15,360 | 39,952 |
| Legless tadpole | 2,836 | 7,964 |
| Hind-leg tadpole | 8,980 | 19,284 |
| Egg shell + removable window | 1,336 | 20,976 |
| Albumen, yolk/chalazae + embryo | 2,816 | 16,192 |
| Frog comparison row | 11,264 | 107,592 |
| Chicken comparison row | 8,992 | 161,650 |
| Complete geometry inventory | 126,348 | 659,552 |
| Maximum authored visible state | 81,824 | 349,786 |

The screen budget is **350,000** triangles. The largest of all 36 chapter/beat entry states is `00-before-you-start/entry`: 349,786. This conservative count uses authored layers/hide, even for off-camera, occluded or simulation-hidden pieces. The full inventory includes comparison and main specimens that are hidden in separate chapter states; it is not an on-screen count. No GPU frame-rate or shadow-pass performance claim is made. Full per-part/per-state data: `/tmp/frog-and-chicken-final-previews/triangles.json`.

### Offline visual verification

Run `pnpm tsx scripts/geo/frog-and-chicken/build-parts.ts`, then `pnpm tsx scripts/geo/frog-and-chicken/preview.ts --out /tmp/frog-and-chicken-final-previews`.

Inspected actual generated geometry in side/quarter/rear hen views, head and feet crops; adult frog quarter/dorsal/foot; froglet; tadpole side/dorsal and hind-leg stage; chick; closed/open egg. Iterations corrected the disconnected frog mouth/folds, clipped digit tips, visible limb caps, a neck collar seam, undersampled feather tips, overly broad raised vanes and shank groove aliasing. Tail pairs are sampled separately to preserve their end profiles. New comparison-row views caught and eliminated cross-stage sweep spikes and missing body surfaces; full independent stage surfaces are now baked into the two local mesh nodes. The Node `GLTFLoader` + native meshopt decoder is also checked directly, without WebGL or a browser.

Preview directory: `/tmp/frog-and-chicken-final-previews/` (19 PNG views, eight before/after panels, two reference-photo panels and JSON triangle reports). Baseline: `/tmp/frog-and-chicken-before-previews/`. These are CPU raster diagnostics with smooth normals and a z-buffer, not browser screenshots. The open-egg diagnostic deliberately omits the translucent albumen to expose internal geometry. Runtime PBR grain, transparency blending, HUD/framing and GPU timing cannot be certified by this rasterizer.

### Gates and remaining work

- `pnpm check`: green (existing repository hints only).
- `pnpm validate`: green, 94 topics, zero errors/warnings.
- `pnpm run test --maxWorkers=2`: green; full suite, including the existing 265 topic assertions and two added anatomy regressions; 251 files / 6,341 tests pass. The first unrestricted run suffered unrelated worker/test timeouts; limiting workers resolves them without altering other tests or global configuration.
- `pnpm build`: green; final delivery rerun recorded after geometry generation.

No requested anatomical item deferred. Browser/e2e/shoot and desktop inspection were not run, as explicitly prohibited for this task; runtime browser acceptance remains with the following Claude review. No engine/framing/style/kit changes, git writes, package changes or review-queue edits.

### Claude acceptance 2026-11-03: triangle trim

Browser check (headless shoot, paper + cinema): hen, chick, frog feet, tadpoles and the smooth egg read correctly; the comparison rows now show complete miniatures instead of the old blobs. The renderer draws only the current chapter's parts (renderer triangles equal the authored state counts: chapter 03 at 26.7k, so hidden parts are not drawn). But the Background chapter drew 348k triangles, at the 350k cap.

Trim (no visible loss in side-by-side CPU previews and browser shots):
- `build-parts.ts` `lod(prims, k)` scales tessellation by on-screen size: thin vanes and membranes get a 6-sided section, round limbs keep ≥ 10, hero bodies ≥ 32. Lengthwise samples stay ≥ 2.5 per path point, so feather tips and toe ends stay rounded. Ringed shanks keep ≥ 10 stations per ring with a 12-sided section. k = .7 hen, .5 chick, .7–.75 frogs and tadpoles, .4 comparison miniatures. The 96-segment egg is unchanged.
- `comparison-meshes.ts`: a meshopt bounded-error simplify (ratio .5, error .0008) runs before encoding.

| | before | after |
| --- | ---: | ---: |
| Adult hen | 120,710 | 63,370 |
| Chick | 80,604 | 41,596 |
| Adult frog / froglet | 38,472 / 39,952 | 28,424 / 27,672 |
| Frog / chicken comparison rows | 107,592 / 161,650 | 33,604 / 36,429 |
| Peak state (Background) | 349,786 | 225,814 |
| Cycles compared | 295,046 | 95,837 |
| Full inventory | 659,552 | 336,371 |

Hardware GL (Apple M5 Max, ANGLE Metal, 1920×1080, camera easing continuously): 60 fps on every chapter before and after. Software GL (SwiftShader) on the Background chapter, with the machine at load ≈150: main 0.8–0.9 frames/s at 80k triangles, this branch 0.3–0.4 frames/s at 224k triangles. The software fallback is about 2.5× slower than main, from more triangles and more draw calls (65 vs 36).
