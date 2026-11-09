# Heat · 3D rebuild evidence

## Rebuild 2026-11-05

Scope: generic school-laboratory apparatus, not a replica of any named product. All 34 selectable apparatus IDs, their order, groups, chapter/beat references, teaching numbers and index/leader references are retained; the bench remains the only context part. There are still 8 chapters and 37 beats. Geometry dimensions remain design values [S27].

### References actually downloaded and inspected

Development-only photographs are in `scripts/geo/heat/refs/` and are excluded from source control and the runtime. The generated GLB and its calibration texture contain no photograph or external asset. Commons originals are credited below; their licences do **not** become the geometry licence.

| Ref | Photograph / original URL | Author | File licence |
|---|---|---|---|
| R1 | [Retort stand with a clamp.jpg](https://commons.wikimedia.org/wiki/File:Retort_stand_with_a_clamp.jpg) | Tsaenmai | CC BY-SA 4.0 |
| R2 | [Clamp holder with utility clamp.jpg](https://commons.wikimedia.org/wiki/File:Clamp_holder_with_utility_clamp.jpg) | Cellsparkle | CC BY-SA 4.0 |
| R3 | [Boss Head Right Angle.jpg](https://commons.wikimedia.org/wiki/File:Boss_Head_Right_Angle.jpg) | Ansgar Hellwig | CC BY-SA 2.0 de |
| R4 | [Laboratory support stand.jpg](https://commons.wikimedia.org/wiki/File:Laboratory_support_stand.jpg) | real name: Nadina Wiórkiewicz; pl.wiki: Nadine90; commons: Nadine90 | CC BY-SA 3.0 |
| R5 | [Laboratory hot plate.JPG](https://commons.wikimedia.org/wiki/File:Laboratory_hot_plate.JPG) | Jeffrey M. Vinocur | GFDL, CC BY-SA 3.0, CC BY 2.5 |
| R6 | [Laboratory thermometer-04.jpg](https://commons.wikimedia.org/wiki/File:Laboratory_thermometer-04.jpg) | Lilly_M | GFDL, CC BY-SA 3.0 |
| R7 | [Glass_100ml_beaker.jpg](https://commons.wikimedia.org/wiki/File:Glass_100ml_beaker.jpg) | Lilly_M | GFDL, CC BY-SA 3.0 |
| R8 | [Schott_Duran_Beaker_low_form_100ml.jpg](https://commons.wikimedia.org/wiki/File:Schott_Duran_Beaker_low_form_100ml.jpg) | Lucasbosch | CC BY-SA 3.0 |
| R9 | [Hot_plate_with_magnetic_stirrer_01.jpg](https://commons.wikimedia.org/wiki/File:Hot_plate_with_magnetic_stirrer_01.jpg) | Gannu03 | CC BY-SA 4.0 |
| R10 | [Thermometer.JPG](https://commons.wikimedia.org/wiki/File:Thermometer.JPG) | See file page | CC BY-SA 2.0, GFDL, CC BY-SA 3.0 |
| R11 | [Spoons.jpg](https://commons.wikimedia.org/wiki/File:Spoons.jpg) | Wolfgangus Mozart | Public domain |
| R12 | [Brass_teaspoon.jpg](https://commons.wikimedia.org/wiki/File:Brass_teaspoon.jpg) | Gurnoor ghuman | CC BY-SA 4.0 |
| R13 | [Lab thermometer.JPG](https://commons.wikimedia.org/wiki/File:Lab_thermometer.JPG) | Aleksander Sobolewski | CC BY-SA 4.0 |
| R14 | [Hot plate.jpg](https://commons.wikimedia.org/wiki/File:Hot_plate.jpg) | Cjp24 | CC BY-SA 3.0 |
| R15 | [Hot plate2.jpg](https://commons.wikimedia.org/wiki/File:Hot_plate2.jpg) | Cjp24 | CC BY-SA 3.0 |

Hero reference coverage: stand/boss/clamp R1–R4; beakers R7–R8; thermometer R6/R10/R13; hotplate R5/R9/R14/R15; conduction spoons R11–R12. Each has two to four independent photographs. The stand photos constrain the base/rod ratio, separate screw seats and jaw topology; the beaker photos constrain the rolled lip, wall return, heel and pouring spout; thermometer photos constrain bulb/stem proportions and a continuous column; hotplate photos constrain the deck/casing/fascia relationship; spoon photos constrain the hollow bowl and handle neck.

### Offline studio and actual-delivery checks

Run `pnpm tsx scripts/geo/heat/build-parts.ts` to regenerate both data and the compressed asset. It also synchronises only the initial chapter camera blocks with their named beat presets. `HEAT_ITERATION=1` reproduces the broad-spout first sculpt; the default build selects the final sculpt.

`studio-preview.ts` decodes the **shipped meshopt GLB**, uses the engine's `partPieces`, material slots, actual theme tokens and `resolveMaterialLook`, and reuses `fossils-and-skeletons/studio-cpu.ts`. The latter uses the installed RoomEnvironment, GGX studio shading and Three's ACES matrices. Paper uses key/fill/rim 2.6/.55/.9, hemisphere .75, environment .7, exposure 1.05; cinema uses 2.4/.28/1.15, .35, .8, exposure 1.0. These match `Lighting.tsx`. The alpha decal is sampled per pixel; smooth lighting is interpolated from mesh vertices. This is a lighting-matched CPU study, **not GPU pixel identity**: GPU PMREM filtering, transparency ordering, contact shadows and the engine's normal maps still require the acceptance pass. No Chromium, browser or desktop was launched.

The thermometer preview uses `resolveSimValues → evaluateSim → simEffects → createFillGeometry/updateFillGeometry`, the same volume/below/meniscus values that PartNode receives. The lower column and bulb are fixed; only the upper column's meniscus moves. Its radius is constant. Tests exercise cold, ambient and warm conditions and verify immersion, wall/floor clearance and continuity. The previous floating rectangular thermometer pointer is now a real coloured column; corresponding part names/summary/detail changed minimally in EN + ZH. Spoon and rod endpoint diagram markers are unchanged.

The glass material is deliberately an opted-in source material on an opaque enamel family, with **per-pixel alpha in its original calibration texture**. This prevents the glass family's uniform .22 opacity from making the printed scale vanish. The actual `gltfSurface` styling/fade path is tested: it retains the alpha texture, opacity 1, BLEND and disabled depth writing. Only the outer wall carries ink; the inner wall samples an unprinted area. The back UV seam is a duplicated angular endpoint, not a quad interpolating across the whole texture.

### Sheets looked at and iterations

Comparison directory: `/Users/gavin/work/atlas-b2-r-heat/scripts/geo/heat/comparisons/`.

- `before/`: original delivery geometry, including the crude stand, weak rims, pointer thermometer and flat heater.
- `round1/`: front, three-quarter, profile and detail sheets for stand, glass, thermometer and hotplate; spoon bowl detail. **Look 1:** the spout was too wide; beaker ink was mirrored on the far side; spoon bowl winding showed its wrong face; cork pads missed the stem; the software painter produced false crossing triangles on the heater. Narrowed the spout, moved the calibration to the front, corrected bowl winding and pad spacing, and added proper opaque depth testing. Replaced the preview's simplified column displacement with actual engine fill geometry.
- `round2/`: repeated four views and detail. **Look 2:** the glass carried duplicated inner-wall ink; the boss still read as a squared-off bracket. Removed inner-wall ink and increased rim edge opacity; replaced the boss with curved open seats in perpendicular planes. Kept the bowl/handle form after inspecting its concavity. Rotated the horizontal thermometer reference to the model's vertical presentation.
- `final/`: final front / three-quarter / profile / characteristic-detail sheets for all five hero families, including the spoon pair. **Look 3:** retained the narrowed integral lip, single exterior scale, connected liquid column and three cork-lined fingers. A final assembled-clearance audit found that enlarged stand shoes encroached on the heater/cooling cup: both feet now point away from the vessel, the uprights move 20 mm farther left, and a regression checks the gaps. The rod saddle valley now contacts the rod underside. Tiny printed/engraved bars use 12-triangle relief boxes; their submillimetre bevels added no visible benefit. This reduced the total from the intermediate 266k to the final budget below.

These are real photo comparison sheets, not generated reference images. Front and near-frontal detail comparisons are the strongest matches. Some full profile/three-quarter sheets use the nearest available photograph of the generic apparatus, rather than a calibrated photograph at exactly the model's camera angle. **Exact matched-angle photo evidence for every view is therefore not complete.** It must not be presented as a successful photo-registration gate. This is an evidence limitation, not a claim that a CPU comparison has already passed GPU acceptance.

### Presentation and camera audit

The opening camera now frames the bath apparatus closely, rather than the entire 1.8 m bench. All original introductory part references remain available in the index; other apparatus enter through the original teaching-beat cameras. Heating/cooling cameras target both experiments and include the second stand and reservoir reference. `views.hudFrame` opts into the existing engine's fitting, naming apparatus rather than the bench and using a modest 28 px primary-radius floor. No engine, CameraRig, layout or CSS was changed.

The first attempted wide overview still fell into the bottom HUD strip. It was rejected in the offline inspection. `framing-final/` shows the final opening and probe/heater/cooler views in paper and cinema with reserved HUD rectangles. `framing-audit.ts` uses the real `fitCameraToAspect`, `freeStageRect` and `fitCameraToHud` helpers at stage sizes 1520×1023, 1200×843 and 1017×703, and audits every authored beat. The proxy rectangles are not screenshots of rendered DOM. In both curve presets, the second beaker's projected right edge stays inside the stage; no second apparatus is cut at a canvas edge. GPU acceptance must still confirm current DOM measurements and leaders.

### Curve range: reviewable engine patch, not silently changed shared code

`fit-temperature-axis.patch` changes the actual curve sampler **and** TryCurve SVG mapping/ticks, plus the existing engine test. It fits all series over the complete experiment, adds padding and clean 1/2/5 ticks, handles constant and negative ranges, and does not resize when only cursor time changes. The cold-start wrapped experiment no longer has to share a 100 °C axis. It uses the same exact solver samples/cursor.

Per the ownership rule, this patch is **not applied** to shared engine files. `make-curve-patch.py` creates executable candidate copies directly from the patch edits. The heat tests cover all authored curves and render the candidate TryCurve SVG in EN/ZH: the cold-start line must rise by more than 20 pixels and its ticks must omit 100 °C. This checks the actual proposed renderer math, not an unused token file. Until the main session applies the patch, the live shared curve remains fixed at 0–100 °C.

### Per-part review against docs/68

A = credible apparatus form / teaching annotation at close range; B = shape/finish still needs polish; C = recognisable but crude. These are **self-grades**, not a substitute for GPU acceptance. All rebuilt physical parts are self-graded A for shape/topology under the available offline evidence. Unchanged diagram markers are graded as explicit annotations, not claimed physical apparatus. The incomplete exact-angle photo-registration evidence is stated above and is not graded A.

Triangles and estimated visible material draw calls are counted from decoded GLB + actual engine primitive geometry, with all layers enabled. Counts exclude shadow passes, flow symbols and HUD. Repeated microscopic detail is merged by the engine's material slot, not emitted as a draw call for each screw/tick.

| Part ID | What changed / reviewed | Self-grade | Triangles before → after | Calls before → after |
|---|---|---|---:|---:|
| `bath-beaker` | Smooth 192-sector loft with dense spout sampling, open returned wall, thick heel, rolled rim, averaged seam normals and exterior fired-ink calibration. | A | 736 → 25,344 | 1 → 1 |
| `bath-water` | Retained open liquid volume, fixed schematic level and maintained-temperature teaching model. | A | 192 → 192 | 1 → 1 |
| `metal-spoon` | Closed hollow oval bowl with a deeper concavity, gentle distal widening and arched waisted handle; capped handle tip. | A | 796 → 6,528 | 1 → 1 |
| `plastic-spoon` | Same bowl/handle geometry and immersion as metal; retains its contrasting plastic material. | A | 796 → 6,528 | 1 → 1 |
| `metal-tip-marker` | Retained explicit diagram pointer and exact temperature binding; not a glowing spoon. | A | 12 → 12 | 1 → 1 |
| `plastic-tip-marker` | Retained explicit diagram pointer and exact temperature binding. | A | 12 → 12 | 1 → 1 |
| `probe` | Fixed 4.4 mm glass stem, smoothly blended elongated reservoir, opaque backing, relief scale numerals and connected capillary. | A | 8,448 → 8,176 | 2 → 4 |
| `probe-marker` | Rebuilt as the moving liquid meniscus and upper column; same part ID and bath control. | A | 12 → 384 | 1 → 1 |
| `retort-stand` | Rounded heavy cast shoe, pads, threaded socket, hex locknut and smooth upright. | A | 780 → 4,604 | 1 → 4 |
| `probe-clamp` | Two curved open boss seats, two independent thumbscrews, arm, jaw adjuster and three cork-lined fingers. | A | 204 → 22,632 | 2 → 3 |
| `heater` | Layered ceramic deck and rim, casing seam, inset fascia, two raised knobs, pointer marks, lamp, vent relief, feet and cable. | A | 780 → 14,196 | 2 → 8 |
| `heater-beaker` | Same continuous glass construction; correct contact with the ceramic deck. | A | 736 → 25,344 | 1 → 1 |
| `heater-water` | Retained independent water-mass input and fixed schematic liquid level. | A | 192 → 192 | 1 → 1 |
| `heater-probe` | Fixed glass stem and bulb; live column uses the heated-c output through the engine fill geometry. | A | 8,448 → 8,176 | 2 → 4 |
| `heater-probe-marker` | Upper liquid column, anchored below the fixed stem; unchanged temperature source. | A | 12 → 384 | 1 → 1 |
| `cooling-beaker` | Same glass shell; sleeve and air gap still surround it independently. | A | 736 → 25,344 | 1 → 1 |
| `cooling-water` | Retained the independent liquid and fixed-reservoir cooling model. | A | 192 → 192 | 1 → 1 |
| `cool-probe` | Fixed glass stem and bulb; live column uses cool-c through the engine fill geometry. | A | 8,448 → 8,176 | 2 → 4 |
| `cool-probe-marker` | Upper liquid column; fixed lower column joins it without a gap. | A | 12 → 384 | 1 → 1 |
| `wrap` | Retained annular sleeve and cutaway behaviour; smoothed to 64 radial segments. | A | 320 → 512 | 1 → 1 |
| `air-gap` | Retained real annular gap and independent cutaway behaviour; smoothed circumference. | A | 320 → 512 | 1 → 1 |
| `rod` | Exact 100 mm reference length retained; smooth turned surface with chamfered ends. | A | 192 → 640 | 1 → 1 |
| `rod-end-marker` | Retained independent 500× displacement pointer; the 100 mm rod is never stretched. | A | 12 → 12 | 1 → 1 |
| `rod-support-left` | Pedestal foot, stem and open V saddle contact the underside of the rod. | A | 620 → 1,368 | 1 → 2 |
| `rod-support-right` | Same open saddle; the right end remains free to slide axially. | A | 620 → 1,368 | 1 → 2 |
| `expansion-ball` | Reviewed and retained the ball, shank and handle; warm pose still scales the same independent part. | A | 3,360 → 3,360 | 2 → 2 |
| `expansion-ring` | Retained real 44 mm opening, handle and mounting bracket; smoothed the annular surface. | A | 716 → 908 | 2 → 2 |
| `expansion-thermometer` | Retained qualitative expanding liquid column; static bulb/envelope stay in bench context. | A | 192 → 192 | 1 → 1 |
| `gas-cylinder` | Open returned glass wall, rolled mouth, physical calibration relief and stable pedestal. | A | 480 → 2,396 | 1 → 3 |
| `gas-piston` | Retained movable plunger, handle and travel; added a separate visible sealing ring. | A | 576 → 960 | 2 → 3 |
| `bath-holder` | Retort upright and boss support a crossbar with two individual lined spring clips. | A | 60 → 32,892 | 1 → 5 |
| `heater-probe-support` | Full cast-foot stand and three-prong clamp; foot moved left and faced away to clear the hotplate. | A | 5,892 → 27,236 | 2 → 5 |
| `cooler-probe-support` | Full cast-foot stand and clamp; foot faced away from the glass vessel. | A | 5,244 → 27,236 | 2 → 5 |
| `room-reference` | Raised 25° display relief identifies the fixed reservoir; it is still explicitly not a live reading. | A | 600 → 1,820 | 2 → 4 |
| `bench` | Graphite laboratory surface, rounded edges and levelling pads; fixed glass expansion envelope retained. | A | 10,716 → 13,068 | 5 → 5 |

Totals: **61,464 → 271,280 triangles**, **50 → 83 estimated material calls**. The active fill geometry/menisci add a small number of triangles; the asset regression reserves an extra 5,000 and still remains below 350k. No GPU FPS is claimed. Topic GLB: **none / 0 bytes → 371,868 bytes** (371.9 kB), meshopt-compressed, including the generated RGBA calibration texture. Five named nodes, corresponding to the three beakers and two spoons. All remaining apparatus remain engine-generated, independently selectable and functional.

### Not done / external acceptance

- Shared Y-axis range is supplied as an unapplied patch because engine/widgets are outside this task's write ownership. It is executable and tested, but not active in the lesson yet.
- Exact matched-angle real photographs for **every** profile/three-quarter view are incomplete; nearest-angle generic-equipment photos are identified honestly above. These comparisons must not be reported as calibrated photo matches.
- GPU browser acceptance, DOM/leader acceptance and true GPU performance remain for the main session, as expressly required by the no-browser instruction.
- No Bunsen burner, tripod or wire gauze was added: this topic uses an electric hotplate with direct beaker support. Adding a burner/tripod would change the experiment.

### Gates

Final commands/results are recorded in the delivery update below after completion. No git writes, package/lockfile edits, other-topic edits or shared-engine edits were made.

### Resume inspection · 2026-11-09

The previous partial work was inspected with read-only git status/diff. Continued the same rebuild; no git metadata or shared engine files were changed.

**Look 4 — `resumed-look1/`:** inspected the five hero families against the downloaded photographs. The thermometer's spherical reservoir read as a bead and its capillary was too close to the front glass surface. Rebuilt it as an elongated reservoir blending into a fixed stem, moved the capillary inside the glass, and added original relief numerals in 20 °C steps with intermediate ticks. Preserved the original temperature binding, actual fill solver, part IDs and immersion. Added R13 as a closer scale photograph. Capped the spoon handle tip. Corrected the CPU texture interpolation to use perspective-correct UVs, as the GPU does.

**Look 5 — `resumed-look2/`:** the first token-only glass experiment was too green under ACES; rejected it and used neutral bone/ink plate tokens in the generated decal instead. The thermometer profiles pinched to zero radius before reopening into the neck; removed that internal collapse and checked it in the actual authored profile. Shortened the reservoir. The spoon bowl needed more concavity and a less regular ellipse; deepened it to 4.4 mm and gently widened its distal end. Inspected the hotplate and stand again; retained their functional topology and clearances.

**Look 6 — `final-delivery/`:** close-up spout inspection showed the upper wall needed denser longitudinal sampling. Increased the glass to 192 angular sectors with four samples across each upper-wall profile interval, and averaged the duplicated back-seam normals. This is why the final glass triangle count is higher than the earlier November 5 candidate. Inspected the final bulb, spout, scale, clamp jaws and spoon bowls. A final screw-axis audit found the horizontal boss heads on the inner shaft ends; moved them to the outside ends, leaving the screw tips at the rod. Added a regression for that real assembly relationship. Retained the finished forms. `all-heroes-contact.png` collects the four standard views of all five families. Individual full-size comparison sheets remain alongside it.

Eight additional `match-*` studies use hand-set cameras and crops of the **real downloaded photographs** to compare the stand front, clamp profile, beaker front/spout, thermometer scale/bulb, hotplate front and spoon bowl. Crops are taken before rotating a horizontal reference into the model's vertical orientation. These improve the detail/angle comparisons, but do not supply the absent exact-profile photographs of every complete apparatus. No generated image is used as a reference; no exact camera calibration is claimed. Additional hotplate photographs R14–R15 were inspected for the fascia and deck relationship. All five hero families have two to four references.

`final-framing/` contains freshly decoded delivery meshes in paper and cinema with HUD-reservation proxies. The projection audit now **asserts** the complete hotplate, both beakers, both supports, both probes and reservoir display stay within the stage in comparison cameras/teaching beats. Result: **43 cameras and beats × 3 layouts**, all passing. This checks the helpers the renderer uses, rather than a separate framing token. It does not replace GPU/DOM acceptance.

Final architecture totals are **61,464 → 271,280 triangles**, **50 → 83 estimated material calls**, and **0 → 371,868 bytes** of topic GLB. The same 34 selectable part IDs plus bench are retained. The table above gives the final counts for every part. All rebuilt apparatus retain the table's **A shape/topology self-grade**; the photographic evidence limitation is explicitly outstanding, as is GPU acceptance.

The Y-axis change remains an unapplied shared-engine patch, as required by ownership. `git apply --check scripts/geo/heat/fit-temperature-axis.patch` succeeds. The executable candidate sampler and SVG component are regenerated directly from that proposal and tested against every authored curve and EN/ZH cold-start chart output. The live lesson will still use the fixed axis until the main session applies it.

### Delivery verification · 2026-11-09

- `pnpm check`: **passed**, zero errors/warnings; five pre-existing hints in other-topic scripts/tests.
- `pnpm validate`: **passed**, 94 topics, zero errors and warnings.
- `pnpm test -- --config scripts/geo/heat/verification.config.ts`: **passed**, 276 files, **6,531 tests**. This runs the entire existing suite plus the new heat tests; no exclusions or mocks. The topic-local config processes the actual Drei dependency through Vite, uses four workers and allows 30 seconds for CPU geometry tests. The initial plain `pnpm test` hit an unrelated extensionless Drei import in solar-system and a five-second toad-geometry timeout. The root test config, dependencies and other topics were left untouched; the exact successful command is given here rather than claiming the initial command passed.
- Final heat-only recheck: **15 tests passed**, including decoded delivery GLB budget/topology/material handling, probe immersion and capillary continuity, exterior boss screw heads, and proposed curve SVG rendering.
- Camera audit: **43 presets/chapter beats × 3 sizes passed**, using actual engine fitting helpers and decoded delivery mesh bounds.
- `git apply --check scripts/geo/heat/fit-temperature-axis.patch`: **passed**, read-only applicability check.
- No Chromium, browser/desktop, `shoot` or browser e2e was invoked, per this task's explicit restriction. No git writes.

Captured console records are in `scripts/geo/heat/comparisons/gates/`. The final build result and copied-asset check follow below.

- `pnpm build`: **passed**, 191 static pages; content validator reports 94 topics with zero errors/warnings. The built heat payload matches `partsFile.parse` of the final authored data (including schema defaults), and the copied GLB is byte-identical to the source: SHA-256 `fb3cb6909227c016049f46c819d60d1eb59abc0cf69541760b22403884c68321`.
- Final read-only scope audit: all changed/untracked deliverable files are inside the authorised heat paths. `git diff --check` is clean.

### Main-session acceptance · 2026-11-09

- The fitted °C axis was applied to the shared engine (`lib/sim/curve.ts`, `explorer/TryCurve.tsx`) by the main session, so the notes above about an unapplied patch are historical. The candidate copies (`curve-candidate.ts`, `try-curve-candidate.tsx`) and the one-off report writer were removed; `heat-topic.test.ts` now tests the engine modules directly. GPU check of every TryCurve in heat and sample-heat: spoons 20–100, insulation / cooling 50–90, heating 20–70 °C, all with clean ticks.
- Fix: `views.cover` / `assembled` / `exploded` had been set to the bath close-up, so hiding the HUD in chapters 03–06 showed an empty bench. They now use an `overview` camera of every experiment; the chapter-0 hero beat still frames the bath apparatus.
- GPU (Apple M5 Max, ANGLE Metal, 1920×1080): full bench 83 draw calls, 271k triangles, 52–60 fps; bath hero 50 calls / 61k; heating bench 43 / 152k. Within docs/08 (< 100 calls, ≤ 1.5 M triangles).
- Follow-ups: the expansion liquid-column demonstration (bulb on a grey block) and the ball-and-ring stand are still schematic; in the hero view the bath thermometer hangs in line with the plastic spoon handle, so the two read as one.


## Rebuild 2026-11-05 · round 2 GPU follow-ups

Delivered 2026-11-09, based on accepted commit `7442bc7c`. Its overview / assembled / exploded cameras and applied shared curve axis remain intact. No shared engine, widget, framing or CSS edits; no browser, Chromium, desktop or git writes.

### New references downloaded and looked at

All images are development-only files in `scripts/geo/heat/refs/`, never runtime textures or assets. This remains a generic design reconstruction, not a replica of one historic or commercial specimen. The earlier R1–R15 reference sets continue to cover the stand, clamp, beakers, probes, spoons and heater.

| Ref | Original URL | Rights / use | Features inspected |
|---|---|---|---|
| R16 | [1912 Gravesande ring and ball](https://commons.wikimedia.org/wiki/File:Gravesande%27s_ring_and_ball.png) | Public-domain Baird & Tatlock catalogue drawing, Smithsonian trade literature | Linked suspension, eye, ball/ring relationship; historic stand variant |
| R17 | [Gravesande ring drawing](https://commons.wikimedia.org/wiki/File:Gravesande_ring.png) | Public domain, historical Cours de physique plate | Hanging sphere, open ring and separate suspension; side elevation |
| R18 | [Eisco handled Gravesande apparatus](https://www.eiscolabs.com/products/ph0374b) | Manufacturer photograph, copyright Eisco; development comparison only, no redistribution in the site | Brass ring/rod/ferrule, turned wooden grip and captive chain; an additional handled variant |
| R19 | [Round bottom flask 500ml](https://commons.wikimedia.org/wiki/File:Round_bottom_flask_500ml.jpg) | Lilly_M, CC BY-SA 3.0 (also other licences offered) | Rounded body, smooth shoulder, neck and flared glass lip |
| R20 | [Round bottom flask 1](https://commons.wikimedia.org/wiki/File:Round_bottom_flask_1.jpg) | Stephanie cheks, CC BY-SA 4.0 | Body-to-neck proportions, continuous glass wall and lip |
| R21 | [Purdue 3A-04 Liquid Expansion](https://www.physics.purdue.edu/demos/display_page.php?item=3A-04) ([photo](https://www.physics.purdue.edu/demos/images/3A-04_sized.jpg)) | Copyright Purdue University; development comparison only | Real stoppered flask, narrow open tube, visible coloured liquid and demonstration assembly |

The flask hero uses R19–R21; the ball/ring hero uses R16–R18. Only the two Commons reference sets are openly licensed; the two additional photos are clearly labelled copyrighted study references. No borrowed mesh, photograph or calibration art is shipped. Original generated GLB remains CC0-1.0.

### Lighting, inspection and two revisions

Reused `studio-preview.ts` and the fossil studio renderer: actual engine-generated apparatus, decoded delivered meshopt GLB, actual engine material families/theme tokens, hemisphere + three directional lights, sampled installed RoomEnvironment, engine exposure and ACES. CPU shading is a numerical lighting approximation, not GPU pixel identity. New pose renders use the engine's `toTransform`, `partFrame` and `applyFrame`, rather than an unrelated column-height token. The exact authored simulation/fill solver remains in the existing previews and tests.

Comparison root: `/Users/gavin/work/atlas-b2-r-heat/scripts/geo/heat/comparisons/`. Current delivery sheets: `gpu-followup-final/`.

- **Before:** `gpu-followup-before/`, rendered from the saved accepted `comparisons/round2-before/` snapshot (local only; it is `git show 7442bc7c:` of parts.json and the GLB). Captures the old bulb/block and shank/ball, original probe overlap and floor topology.
- **Look 1:** `gpu-followup-look1/`. The stopper hid too much neck, so the flask still read too much like the old bulb. Lengthened the exposed neck and returned glass lip, moved the stopper/capillary/scale together, kept liquid continuous through the neck and changed its dye to the plate heat-energy token. The handle saddles looked like tall black blocks: replaced them with slim turned pedestals and open padded forks. Reduced invisible over-tessellation of tiny chain links and the brass sphere; kept ten separately interlinked closed loops.
- **Look 2:** `gpu-followup-look2/`. Checked full and detail views, both themes and both qualitative states. Tightened saddle contact to the actual local handle radius; added a shallow waist to both wooden grips. The warm-state preview camera cropped the very top of the tube/support: pulled the comparison camera back. Added the actual Purdue stoppered-flask photograph and a matching near-front study. Isolated neighbouring context apparatus in new object sheets, retaining the bench surface and all of each object's hardware; authored hero/teaching views show the complete scene.
- **Final:** `gpu-followup-final/` repeats front, three-quarter, profile and characteristic details for all seven hero families, plus paper/cinema start/warm states, top-down beaker floors, photo-detail studies and the authored bath view. Final visual observations and gate outcomes are recorded below after viewing these exports.

The flask's return wall, stopper bore and capillary bore are actual open geometry. The scale has qualitative divisions, **no invented temperature units**. Only the liquid-column part changes length; the flask, dye reservoir, glass, scale and support remain fixed. The brass sphere alone changes size; the ring, chain and handles do not grow. Sphere/ring hardware shares the original equal explode displacement. Original 40 mm cold sphere / 44 mm ring opening and 1.2× sphere warm scale are retained as enlarged qualitative design values, not claimed real expansion. The bath probe moves bodily with its clamp, without changing immersion, fill calibration or temperature output. All 34 selectable IDs, groups, labels, chapter/beat links, eight chapters, 37 beats and numerical teaching model remain. Minimal EN/ZH part summaries/details now describe the real flask and handled brass apparatus; chapter prose needed no change.

### Per-part self-review and architecture counts

A = credible shape/topology against docs/68; retained entries keep the accepted round-1 grade. These are self-grades, awaiting GPU acceptance. Counts below use **accepted round 1 → this round**, all layers visible, decoded GLB + actual engine geometry, excluding shadow passes, HUD and flow symbols. The test reserves 5,000 extra triangles for live fill/menisci and remains below 350k.

| Part ID | Change / review | Grade | Triangles before → after | Estimated calls before → after |
|---|---|---|---:|---:|
| `bath-beaker` | Single shared floor poles, no degenerate fan triangles, exact plane normals; smooth derivative normals on the shell. | A | 25,344 → 24,960 | 1 → 1 |
| `metal-spoon` | Retained accepted geometry and teaching behaviour. | A | 6,528 → 6,528 | 1 → 1 |
| `plastic-spoon` | Retained accepted geometry and teaching behaviour. | A | 6,528 → 6,528 | 1 → 1 |
| `heater-beaker` | Same corrected beaker construction. | A | 25,344 → 24,960 | 1 → 1 |
| `cooling-beaker` | Same corrected beaker construction. | A | 25,344 → 24,960 | 1 → 1 |
| `bath-water` | Retained accepted geometry and teaching behaviour. | A | 192 → 192 | 1 → 1 |
| `metal-tip-marker` | Retained accepted geometry and teaching behaviour. | A | 12 → 12 | 1 → 1 |
| `plastic-tip-marker` | Retained accepted geometry and teaching behaviour. | A | 12 → 12 | 1 → 1 |
| `probe` | Moved with its live capillary to x −0.580, z 0.102 m, clear of both spoons; immersion unchanged. | A | 8,176 → 8,176 | 4 → 4 |
| `probe-marker` | Moved with fixed stem; original bath-temperature/fill binding retained. | A | 384 → 384 | 1 → 1 |
| `retort-stand` | Upright follows the relocated probe; shoe is offset forward under its socket to leave a 12 mm gap from the spoon-holder shoe. | A | 4,604 → 4,604 | 4 → 4 |
| `probe-clamp` | Arm and three padded jaws meet the relocated stem. | A | 22,632 → 22,632 | 3 → 3 |
| `heater` | Retained accepted geometry and teaching behaviour. | A | 14,196 → 14,196 | 8 → 8 |
| `heater-water` | Retained accepted geometry and teaching behaviour. | A | 192 → 192 | 1 → 1 |
| `heater-probe` | Retained accepted geometry and teaching behaviour. | A | 8,176 → 8,176 | 4 → 4 |
| `heater-probe-marker` | Retained accepted geometry and teaching behaviour. | A | 384 → 384 | 1 → 1 |
| `cooling-water` | Retained accepted geometry and teaching behaviour. | A | 192 → 192 | 1 → 1 |
| `cool-probe` | Retained accepted geometry and teaching behaviour. | A | 8,176 → 8,176 | 4 → 4 |
| `cool-probe-marker` | Retained accepted geometry and teaching behaviour. | A | 384 → 384 | 1 → 1 |
| `wrap` | Retained accepted geometry and teaching behaviour. | A | 512 → 512 | 1 → 1 |
| `air-gap` | Retained accepted geometry and teaching behaviour. | A | 512 → 512 | 1 → 1 |
| `rod` | Retained accepted geometry and teaching behaviour. | A | 640 → 640 | 1 → 1 |
| `rod-end-marker` | Retained accepted geometry and teaching behaviour. | A | 12 → 12 | 1 → 1 |
| `rod-support-left` | Retained accepted geometry and teaching behaviour. | A | 1,368 → 1,368 | 2 → 2 |
| `rod-support-right` | Retained accepted geometry and teaching behaviour. | A | 1,368 → 1,368 | 2 → 2 |
| `expansion-ball` | Smooth brass sphere; only this sphere scales in the existing warm pose. | A | 3,360 → 9,216 | 2 → 1 |
| `expansion-ring` | Chamfered brass annulus, unchanged 44 mm bore, brass rod and turned wood handle. Includes fixed chain/ball handle and hooked display support so both assemblies explode together. | A | 908 → 27,628 | 2 → 4 |
| `expansion-thermometer` | Closed meniscus on a coloured liquid column; 1.9× vertical warm pose anchored inside the stopper. | A | 192 → 640 | 1 → 1 |
| `gas-cylinder` | Retained accepted geometry and teaching behaviour. | A | 2,396 → 2,396 | 3 → 3 |
| `gas-piston` | Retained accepted geometry and teaching behaviour. | A | 960 → 960 | 3 → 3 |
| `bath-holder` | Retained accepted geometry and teaching behaviour. | A | 32,892 → 32,892 | 5 → 5 |
| `heater-probe-support` | Retained accepted geometry and teaching behaviour. | A | 27,236 → 27,236 | 5 → 5 |
| `cooler-probe-support` | Retained accepted geometry and teaching behaviour. | A | 27,236 → 27,236 | 5 → 5 |
| `room-reference` | Retained accepted geometry and teaching behaviour. | A | 1,820 → 1,820 | 4 → 4 |
| `bench` | Replaced old bulb/block/sleeve with a continuous returned-wall round-bottom flask, filled neck, bored stopper, open capillary, printed-scale relief, ring rest, two fitted handle saddles and a post under the brass rim. | A | 13,068 → 39,868 | 5 → 8 |

Full-scene total: **271,280 → 329,952 triangles**, **83 → 87 estimated material calls**. GLB: **371,868 → 371,316 bytes** after meshopt. New expansion apparatus uses engine-generated parametric meshes, already merged by material; it does not increase the GLB. Corrected beaker pole topology reduces the five-node GLB slightly. No GPU FPS is inferred from CPU rendering.

### Final visual inspection and remaining evidence limits

Looked at all seven `*-contact.png` sheets (four views each), both `*-pose-contact.png` sheets, `hero-before-after.png`, the floor close-ups and the additional Purdue match. Retained the connected flask shoulder/neck, returned lip, bored stopper, scale, ten linked loops, turned grips and actual ring opening. The profile shows the capillary/scale edge rather than inventing front-facing marks on its back. The bath view now has three distinct vertical silhouettes: thermometer, metal spoon and plastic spoon. The corrected delivered floor normals are planar and every decoded beaker triangle has nonzero area. Both themes retain readable brass/wood separation. Final suspension review changed the sphere pose pivot to its fixed upper attachment: expansion occurs below that point, keeping the lowest chain link outside the sphere in both states. Its 1.2× scale is unchanged.

**Not completed:** GPU/DOM acceptance and GPU performance measurement, because this task expressly prohibits launching a browser. Exact matched-angle photographs of every complete variant are also unavailable: the historical Gravesande drawings show stand-mounted apparatus, the handled manufacturer example is a different variant, and the Commons flask photos show empty flasks. The Purdue image supplies the actual stoppered/capillary school assembly; nearest-angle drawings/photos remain explicitly identified for the other views. These are useful side-by-side shape studies, **not** successful calibrated photo registrations. No geometry is knowingly left below A; photographic angle coverage is an outstanding evidence limitation, not silently awarded A. The static display fixtures are design reconstructions, not claimed museum hardware.

### Why the JS rose from about 476 to 496 KB gz

Reproduce after build with `pnpm tsx scripts/geo/heat/bundle-audit.ts`. The script reads the emitted ownership/import graph and the real conditional roots used by `scripts/js-budget.ts` / the localhost acceptance hooks. It gzips each transferred chunk separately, using gzip-9 for the acceptance comparison; KB = 1024 bytes.

- Local acceptance closure: **496.669 KB**, versus **476.397 KB** when its GLTF-support chunk is excluded. Difference **20.272 KB** (rounding). The first five mesh parts introduced that chunk: Three's GLTFLoader, inline meshopt decoder and SkeletonUtils. The actual compressed mesh is fetched separately.
- Curve sampler plus TryCurve chunks together: **2.897 KB gz**. They do not account for the 20 KB increase.
- Production selected-feature closure: **479.542 KB gzip-6**, or **478.499 KB gzip-9**. Localhost loads another **18.170 KB gzip-9** of existing QA hooks and their orbit/microscope/airfoil dependencies. This explains why production and GPU/local acceptance totals differ.
- Topic JSON is separately fetched (about 32 KB gz after this round's additional apparatus); it is **not bundled into JS**. Geometry arrays have not been added to the JS bundle. The GLB stays a separate 371,316-byte request.

No topic-side JS removal is appropriate: removing the loader would remove the accepted curved glass/spoon meshes. Loader or QA-hook splitting is shared-engine work outside this topic's ownership. Therefore this round leaves the JS closure unchanged, below the **509 KB** limit in both measured modes. The fetched JSON increase is explicitly reported rather than hidden in the JS figure. Exact final sizes are in `comparisons/gates/round2-bundle.json`.

Final clearance audit: offset the probe stand shoe 14 mm forward under the unchanged socket/upright. The separate spoon-holder shoe now has a **12 mm** physical gap; a regression checks this gap and that the socket remains within the cast shoe. Re-rendered the stand and authored bath/probe views after this final adjustment. Counts and the GLB are unchanged.

Gate-load note: a repeated full suite run overlapped check/build and the existing catalogue p95 benchmark measured 110.4 ms against its 100 ms limit (all other 6,534 tests passed). The record is retained as `comparisons/gates/round2-test-concurrent.log`. No benchmark, assertion, timeout or unrelated source was changed; a subsequent two-worker run also hit this timing assertion (211.0 ms, recorded in `round2-test-two-workers.log`) and was stopped. The final full-suite run is serial (`--maxWorkers 1 --no-file-parallelism`) after the build, removing test-file contention as well. No tests are excluded.

The first serial run still measured the catalogue benchmark at 110.2 ms and was stopped after that failure (`round2-test-serial-first.log`). Final diagnostic full-suite command uses the fixed task-date seed as well: `pnpm test -- --config scripts/geo/heat/verification.config.ts --maxWorkers 1 --no-file-parallelism --sequence.shuffle --sequence.seed=20261105`. This changes execution order only; it does not change the benchmark, timeout, assertions, module implementation or test set. Its final result follows below.

Final load-path refinement: added a turned post at the outer rear brass rim. Its pad meets the real ring underside at y = 0.814 m and remains wholly outside the 44 mm opening; the regression uses the actual authored post/ring geometry. This prevents the heavy brass head from cantilevering off two open grip saddles. Re-rendered all Gravesande views/poses; total is 329,952 triangles and 87 estimated calls. The GLB remains 371,316 bytes.

The diagnostic shuffle also reordered cases inside files, exposing an unrelated existing solar-system test dependency (`getRoot` on an uninitialised document). That diagnostic was stopped and retained as `round2-test-shuffled-cases.log`; its timing result also overlapped the last support build. The final full-suite attempt preserves case order, shuffles files only with seed 20261105, and starts after model work, check and build complete. No unrelated tests or benchmark thresholds were edited.


### Final gate certificate · 2026-11-09

- `pnpm check`: **passed**, zero errors/warnings, five existing hints outside heat.
- `pnpm validate`: **passed**, 94 topics, zero errors/warnings.
- `pnpm build`: **passed**, 191 static pages. Final authored/schema-parsed parts exactly match `dist/topics/heat/data.json`; the copied GLB is byte-identical. This check includes the upper ball pivot, final rim support and 12 mm stand-foot gap.
- Full suite: **276 files / 6,535 tests passed** in 47.88 seconds using `pnpm test -- --config scripts/geo/heat/verification.config.ts --maxWorkers 4 --sequence.shuffle.files --sequence.shuffle.tests=false --sequence.seed=20261105`. All existing tests are included, without mocks or assertion/threshold changes. The existing heat-local config resolves actual Drei imports and allows CPU geometry tests to finish; the final command changes file order only and preserves normal case order. The catalogue benchmark passes in this run. Earlier timing failures and the case-shuffle diagnostic remain explicitly retained above; this is not a claim that every earlier invocation passed.
- Final heat-only checks: **19 tests passed**, covering the delivered decoded GLB, floor normals/pole topology, immersion, actual fill geometry, authored pose transforms, cold/warm ring clearance, probe/spoon screen separation, physical stand-foot separation and rim-support contact outside the bore.
- Framing: **43 cameras/beats × 3 layouts passed**, using actual engine fitting helpers.
- Full-scene architecture: **271,280 → 329,952 triangles**, **83 → 87 estimated material calls**; includes all layers, with an additional tested 5,000-triangle fill allowance below 350k. GLB **371,868 → 371,316 bytes**. SHA-256 `01cd153166829187bbed163b97458c3a316eacadae31d4d98b80648dae431f3f`.
- Production JS **479.542 KB gzip-6**, local acceptance **496.669 KB gzip-9**, both below 509 KB. No topic-side JS growth; the roughly 20 KB historic increase is GLTF support.
- Final separately fetched JSON: **166,490 bytes raw / 32,458 bytes gzip-9**. This is separate from the JS budget.
- All 28 standard real-reference sheets, additional detail studies and both themes/poses are in `/Users/gavin/work/atlas-b2-r-heat/scripts/geo/heat/comparisons/gpu-followup-final/`. Re-inspected the final Gravesande contact sheet after the added load support. All rebuilt physical parts retain **A self-grades**. Exact-angle photograph coverage and GPU/DOM/FPS acceptance remain the stated external evidence limitations.
- `git diff --check`: clean. Scope audit: all 15 changed files are authorised heat paths. No git writes, package/lockfile/shared-engine/other-topic changes, Chromium, desktop or browser control, or browser e2e.

### GPU acceptance · round 2 (2026-11-09)

Hardware GL (Apple M5 Max, ANGLE Metal), `pnpm shoot heat --beats --gpu` and `--perf --gpu`, paper and cinema.

- Flask + capillary, Gravesande ball and ring, and the probe/spoon separation all read as the real school apparatus next to R16–R21. Compare sheets: `.claude/compare/r-heat2-*.png` in the main checkout.
- Beaker floors: the round-2 streaks were stronger than round 1. Removing each floor in turn showed the cause: the outer base sat exactly on the bench plane (y = 0) and depth-fought with the bench top, which shows through the glass as radial streaks. Fixed in `bake-apparatus.ts`: the base is now slightly domed (centre 1.8 mm, heel 0.3 mm above the bench), as moulded glass is; the poles keep one vertex per sector so fan triangles never span the whole texture width. Floors are now clean in both themes.
- The handle saddles and rim post moved from `bench` into `expansion-ring`, so they hide and explode with the ring instead of standing orphaned in chapters 01–05.
- The round-1 before-snapshot (`round2-before-parts.json`, `round2-before.glb`) moved to the ignored `comparisons/round2-before/`; it is not shipped and should not be in git.
- Measured: whole bench 87 draw calls (reference mode 89), 329,796 triangles, 57–63 fps at 1520×1023 and 1920×1080, 57–59 fps at 3840×2160; chapter views 27–45 calls. GLB 374,392 bytes.
- JS: `scripts/js-budget.ts` gives heat 457.03 KB on main and 479.54 KB here. The whole difference is two chunks, `GltfSource` (20.27 KB) and `BufferGeometryUtils` (1.99 KB). These are the same files already in the closure of cells and the other glb topics (cells 477.9 KB on both builds). The cause is the topic's first GLB, not curve code or bundled data.
- Remaining outside this job: the gas cylinder's floor shows the same bench-plane streaks (an engine primitive from round 1).
- Text: regenerating from the stale `build-parts.ts` had reverted 58 EN/ZH values (32 fields) to the pre-readability 2d5deeb3 wording (see atlas-prep/TEXT-AUDIT.md). Main's wording is restored in `build-parts.ts` itself, so a rebuild now reproduces it exactly. `water()` takes a summary, a `cite()` helper avoids a doubled `[S27]`, and `outputLabelsZh` holds the four Chinese readout labels. Only text that the new shapes actually need was changed, each rewritten from main's sentence: beakers (thick base, rim, approximate scale), probe liquid columns (name, summary, detail), clamp and probe supports (screw clamp, padded jaws), brass ball and ring, and the flask/tube column and bench. A second rebuild gives a byte-identical parts.json.
