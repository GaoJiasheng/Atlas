# Eyes and ears · 3D reconstruction

## Polish 2026-11-03

Original anatomical reconstruction; independently enlarged eye, ear and sensory-cell stations retain their existing teaching scales. No scan, downloaded mesh, photo texture, runtime network, engine change, new part ID or new lesson beat was introduced.

### Changes and visual references

| Item | Completed work | References inspected |
|---|---|---|
| Pinna | Continuous front/back sculpted skin with rolled helix, branching antihelix and crura, scapha, depressed concha, tragus, antitragus, soft lobule and an actual meatus opening. Relief is part of one smooth surface. | Gray 904, public domain; lateral silhouette and fold relationships. |
| Canal and drum | Curved portal enters the conchal opening, then bends into an S-shaped canal. Open longitudinal wall exposes the passage. Oblique thin conical drum has an inward umbo, thin annulus and malleus attachment. | Gray external/middle-ear plates; existing NIDCD S7/S8 relationships. |
| Ossicles | Implicit blended, smooth bone surfaces: malleus head/articular facet, neck, processes and tapered manubrium; incus body, short crus, curved long crus and lenticular process; stapes head, asymmetric crura enclosing the stirrup opening, and oval footplate at the window. | Gray 916–918, public domain; all three individual bone plates inspected. |
| Cochlea | Tapered three-dimensional spiral with exactly 2.5 centreline turns, progressively smaller coil radius and tube cross-section, rounded apex, and axial rise. Basal turn meets the vestibule beside the oval window. | Gray 923 and existing NIDCD S7; external contour is a reconstruction, not a measured cast. |
| Vestibular system | Three distinct tube loops in an orthonormal frame: anterior and posterior vertical planes, lateral horizontal plane. Each has one integrated ampulla and two ends entering the vestibule. | Gray inner-ear plate and S8; exact perpendicularity is a teaching idealisation of near-perpendicular anatomy. |
| Pressure tube | Tympanic opening, narrowing isthmus and widening pharyngeal end; partial posterior/inferior tympanic wall physically anchors the upper opening to the middle-ear cavity. | Gray middle-ear anatomy and S8. |
| Eye | Smooth rounded corneal bulge; asymmetric biconvex lens and fine capsule rim; iris collarette, irregular crypts, branching stromal relief and broken contraction furrows; folded ciliary body and fine staggered zonular bundles; nasal optic-disc/nerve exit and matching signal centreline. | NEI eye cross-section; Mcorrens iris macro photograph, CC BY-SA 3.0, reference only. |

References and licences are recorded in [data/SOURCES.md](data/SOURCES.md). Minimal EN/ZH part descriptions now name the modelled folds, cone/helix, vestibule, pressure-tube attachment and nasal nerve exit. Teaching numbers, part counts, chapter references, pupil aperture ratio, lens poses, ossicle animation IDs/pivots and simulation bindings are retained.

### Generation and verification

`pnpm tsx scripts/geo/eyes-and-ears/build-parts.ts` regenerates `data/parts.json` and the topic-owned `public/models/eyes-and-ears.glb`. The existing model-path schema requires a flat `/models/<name>.glb` filename. The GLB is original CC0 geometry and carries attribution/licence metadata; reference images are ignored development inputs only.

`sculpt-ear.ts` generates the continuous auricle, meatal canal, implicit ossicles and anatomical tube paths. `polish-eye.ts` generates the optical profiles and static iris/ciliary meshes. Static details are merged into one mesh per part; vertex indexing reduces the local GLB size. Hairline zonules use six radial segments, tubes use 16–24 and large optical profiles use 64.

Offline verification uses the actual engine geometry builders plus the shipped GLB, CPU depth-buffer rasterisation and smooth vertex normals. Run:

```sh
pnpm tsx scripts/geo/eyes-and-ears/render-preview.ts --out /tmp/atlas-eyes-and-ears-qa/after
```

Before/after previews and `triangle-counts.json` are under `/tmp/atlas-eyes-and-ears-qa/{before,after}/`. Individual views cover frontal and oblique auricle/ossicles, canal and drum, frontal/oblique/superior labyrinth, eye section, iris, lens and cornea close-ups. Geometry was visually inspected and iterated: smoother ear fold sampling, denser auricle tessellation, tighter cochlear turns, tympanic-floor attachment, irregular iris relief and removal of the nerve's artificial round end cap.

CPU previews deliberately do not certify runtime PBR, transparency, HUD placement, picking or browser timing. No Chromium, user browser or desktop was opened. Browser acceptance remains for the following Claude review; no requested anatomy item was intentionally deferred.

### Triangle audit

Counts below come from the shipped geometry builders and GLB index buffers, counting every instance. They are source surface triangles, rather than a claim about GPU frame rate. The conservative all-geometry count includes BOTH mutually exclusive iris inserts and every study-bench object, so it exceeds every lesson state's surface count.

| Item | Before | After |
|---|---:|---:|
| Pinna | 7,788 | 80,288 |
| Canal | 832 | 14,912 |
| Eardrum and annulus | 288 | 1,664 |
| Malleus / incus / stapes | 4,368 / 4,368 / 7,680 | 18,072 / 17,248 / 23,720 |
| Cochlea including central bony core | 18,208 | 16,416 |
| Canals, ampullae and vestibule | 6,456 | 23,280 |
| Pressure tube and partial tympanic wall | 768 | 13,352 |
| Cornea / lens | 348 / 576 | 5,408 / 10,796 |
| Iris root plus both aperture states | 1,152 | 48,128 |
| Ciliary apparatus / optic nerve | 16,612 / 672 | 13,188 / 5,808 |
| **All geometry, including both aperture states** | **108,062** | **330,226** |
| **Upper bound with one active aperture** | **107,678** | **308,210** |

The indexed local GLB is approximately 5.2 MiB, below the existing 8 MB asset cap. Small details do not cast shadows; the existing sclera is the only substantial shadow caster. No FPS or live renderer-info number is claimed. The model remains under the requested ~350k surface-triangle budget even if every object and both iris alternatives were shown together.

Final visual review: `/tmp/atlas-eyes-and-ears-qa/comparison.png` pairs four matching before/after views; `reference-comparison.png` places the final auricle and ossicle chain beside the public-domain Gray plates. Complete final close-ups are in `after/`. The continuous meatal canal removed the visible gap/overlapping portal seam found during the first two rounds. The tympanic-floor attachment, three-dimensional cochlear core and nasal nerve route were checked in frontal, oblique and superior views.

### Final gates

- `pnpm check`: passed; 1,093 files, zero errors, zero warnings, five existing informational hints.
- `pnpm validate`: passed; 94 topics, zero errors, zero warnings.
- **Standard `pnpm test`**: passed; **252 files / 6,346 tests**, 55.94 seconds. No timeout or worker overrides in the final run.
- `pnpm build`: passed; **191 static pages**, including the local model and static topic data.
- `git diff --check`: passed. No browser, desktop, e2e/shoot, package/lockfile edit, deployment or git write was performed.

The inset-clearance test now reads actual GLB vertex bounds for the three sculpted ossicles. New anatomy tests verify perpendicular canal planes, one ampulla per loop, vestibular endpoints, 2.5-turn axial cochlear winding, drum/umbo contact, preserved optical apertures/poses and the conservative triangle budget. A direct baseline comparison confirmed unchanged ordered part IDs, groups, animations, poses, presets, view settings and the complete simulation object; the optic electrical-flow path alone follows the newly offset nerve.

Earlier concurrent gate attempts suffered CPU timing failures and a built-JS-budget test ran while the build was replacing `dist`. The final build completed first, then the unmodified standard test command passed in isolation. The initial primitive-only inset assumption was corrected rather than suppressed. Requested anatomy work is complete; runtime PBR/transparency, HUD and touch interaction remain for the explicitly following browser acceptance.

### Claude acceptance 2026-11-03

- **Text regression fixed.** `build-parts.ts` predated the readability pass (53a9ea1), so regenerating reverted every part summary, most details and the spec table. The readability text is now in the build script; only the reshaped parts (pinna, canal, malleus, incus, cochlea, balance canals, Eustachian tube) carry new details, rewritten in the same plain style (EN + ZH).
- **Cochlea section.** The solid coil showed a large hatched cap under the ear cut; the tube is now hollow (0.016 wall), so the cut shows the spiral lumen and modiolus.
- **Optic nerve.** The nasal offset (root z −0.245) left only a stub behind the sclera on the "optic nerve" beat; the root moved to z −0.20, which keeps it off-axis, visible, and clear of the cut plane.
- Browser numbers (`pnpm shoot --gpu --perf`, M5 Max, machine load ≈150–200): at most 279,542 drawn triangles (main 65,986), 50–63 fps in every chapter/mode (main 55–63). Software-GL shoots under load time out on this topic; GPU shoots are clean (paper + cinema, 40/40 beats).

## Polish 2026-11-03 · Round 2

### Completed items

1. **Middle/inner-ear proportions.** Calibrated the reconstruction at 0.052 scene units/mm. The cochlea is now **9.16 mm across × 4.70 mm axially**, versus 22.90 × 11.73 mm before. Its spiral, lumen, wall and modiolus share a 0.4 scale about the relocated oval window. The incus and stapes also needed correction: their longest shipped-vertex spans are now approximately **7.05 and 2.97 mm**, versus 10.22 and 5.95 mm; malleus remains **9.03 mm**. Each semicircular loop now spans **6.91 / 6.68 / 6.22 mm**, retaining three perpendicular planes, three ampullae and vestibular insertions. The stapes footplate/window, vestibule, cochlear basal turn, middle-ear wall, auditory nerve and signal route were kept connected. The incus animation pivot follows its resized bone; all animation IDs and teaching movements remain. Anchors derive from the resized geometry. The EAR preset and middle-ear chapter camera were recentered on the smaller assembly; the cochlea view still includes the independent cell inset.
2. **Soft lobule.** Removed the two cartilage endpoint bumps from the lobule, blended the cartilage relief out above it and rebuilt the free edge with a smooth elliptical thickness profile. Nonuniform radial sampling preserves the rounded edge in close-up. The lobe is one continuous soft pad; the concha, helix, antihelix, meatus and natural asymmetry remain.
3. **Draw workload and visibility.** Applied offline, normal-aware, error-bounded meshoptimizer decimation to the continuous skin, bones, iris inserts and ciliary body, preserving borders and vertex normals. Removed unused vertices from the shipped buffers. Smooth optical rotations use 48 segments; small tubes use 16–24, with fewer longitudinal samples. Enlarged cell bodies retain 32 profile samples and use 32 rotational stations; the narrow oval window uses 24×20 and tiny markers 20×16 instead of the engine's fixed 48×32 sphere. The nine fine schematic stereocilia retain their paths and endpoints, using four axial divisions and eight radial segments instead of many redundant collinear rings. Existing same-material pieces stay merged, while animated/selectable parts remain separate. Introductory and care beats now explicitly switch layers for eye/ear close-ups; the overview beats still show both organs intentionally.

**Acceptance fixes preserved:** hollow cochlea (scaled wall thickness 0.0064), nasal optic-nerve root at z −0.20, all readability text. A baseline comparison verified identical ordered part IDs, names, summaries, details, spec rows, poses and simulation controls/bindings. **No EN/ZH text changes were needed.** Only the incus pivot and auditory signal coordinates change within animation/flow data. Chapter/beat IDs, counts, teaching numbers and labels remain unchanged.

### References and visual verification

Inspected the existing public-domain Gray 904, 916, 917, 918 and 923 images under `scripts/geo/eyes-and-ears/refs/`, alongside the supplied dimensional brief. Reference provenance and the calibration boundary are recorded in `data/SOURCES.md`. No downloaded mesh or additional asset licence is involved.

CPU renders use the actual shipped GLB and engine geometry builders. Inspected frontal, oblique and superior labyrinth views, frontal/oblique/rear pinna and a dedicated lobule close-up, drum/canal and bone close-ups, the entire ear and a drum–ossicles–cochlea proportion plate. Eye section, iris, lens, cornea and nerve views were also checked after decimation. Iteration 1 still showed cartilage endpoint shading in the lobule; the final blend and rounded edge remove it.

Previews and evidence are in **`/tmp/atlas-eyes-and-ears-round2/`**:

- `before/`, `before-detail/`, `iteration1/`, `after/`: full-size PNGs and triangle-count reports; final images are in `after/`.
- `comparison.png` and `lobule-comparison.png`: matching before/after overview, pinna, ossicles, iris and lobule; `references.png`: inspected Gray plates.
- `before-audit.json`, `after-audit.json`: per-part source triangles, all 40 beat visibility sets, conservative draw bounds, dimensions and recorded simplification errors.
- `baseline/`: unchanged input JSON/GLB for reproducible comparisons.

Reproduce with `pnpm tsx scripts/geo/eyes-and-ears/render-preview.ts --out /tmp/atlas-eyes-and-ears-round2/after` and `pnpm tsx scripts/geo/eyes-and-ears/audit-model.ts`. The preview now accepts `--model <baseline.glb>` in addition to `--input`, so a before render cannot accidentally load the replacement model.

### Before/after triangle counts

| Item | Before | Round 2 |
|---|---:|---:|
| Pinna | 80,288 | 24,000 |
| Canal | 14,912 | 5,998 |
| Malleus / incus / stapes | 18,072 / 17,248 / 23,720 | 5,000 / 5,000 / 5,000 |
| Cochlea, lumen and modiolus | 26,016 | 15,440 |
| Canals, ampullae and vestibule | 23,280 | 10,592 |
| Pressure tube / partial wall | 13,352 | 6,752 |
| Cornea / lens | 5,408 / 10,796 | 4,096 / 8,108 |
| Iris root plus both aperture states | 48,128 | 31,072 |
| Ciliary apparatus / optic nerve | 13,188 / 5,808 | 8,974 / 3,952 |
| Ear anatomy without separate cell study | 222,200 | 81,078 |
| Oval window / signal marker | 2,976 / 2,976 | 960 / 640 |
| Basilar strip with fixed cell bodies | 8,988 | 6,204 |
| Schematic hair bundles / optical object markers | 6,840 / 5,952 | 720 / 1,280 |
| **All stored surfaces, including both iris states** | **339,826** | **155,666** |
| **Worst authored beat: conservative drawn bound** | **284,622** | **128,604** |
| **All layers, one iris, both overlays, shadow refresh** | **341,470** | **165,326** |
| **All geometry including both iris inserts during transitions, overlays and shadow** | **363,486** | **179,326** |

The 339,826 baseline includes Claude's hollow-cochlea acceptance change; the earlier 330,226 report predates that change. Previously measured browser peak was 279,542. The like-for-like offline bound adds the 5,080-triangle shadow refresh to that frame. The new all-layer bound deliberately includes every part, one active iris insert, both study overlays counted with two transparent passes, the shadow pass and four ground triangles, with **no frustum-culling or clipping savings**. The stronger 179,326 bound also includes BOTH iris inserts during pupil crossfades; no combination of layers or chapter transitions can exceed 180k under these geometry/pass assumptions. Recorded decimation errors are below 0.0003 scene units; smooth normals and borders are preserved. The compacted original CC0 GLB is approximately 2 MiB instead of 5.2 MiB.

New regression checks measure the shipped bone dimensions, cochlear breadth/depth and loop diameters; verify hollow wall and basal/vestibular/window contact; resolve actual engine display/simulation state for all 40 beats; and enforce both close-up organ exclusivity and the 180k all-layer draw bound.

### Gates and remaining scope

Final standard gate runs all passed:

- `pnpm check`: 1,095 files, zero errors, zero warnings, four existing informational hints; TypeScript passed.
- `pnpm validate`: 94 topics, zero errors and zero warnings.
- `pnpm build`: 191 static pages, successful PWA output.
- `pnpm test`: 253 files / 6,349 tests passed in 26.18 seconds, without worker or timeout overrides. The build completed before tests started.
- `git diff --check`: passed. Gate logs are in `/tmp/atlas-eyes-and-ears-round2/{check,validate,build,test}.log`.

No anatomy item is intentionally deferred. Browser timing, PBR/transparency, HUD placement, touch interaction and software-GL screenshots are not certified by CPU rendering; browser/desktop access and Chromium launches were prohibited for this task. No browser, desktop, e2e/shoot, git write, package/lockfile edit, shared kit or engine edit was performed.
