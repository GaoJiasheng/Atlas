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
