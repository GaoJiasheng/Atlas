# 3D model realism review: muscles ×6, senses, sound, earth & space, water, matter

Reviewer: Claude (read-only), 2026-11-02, worktree `claude-review3d-2` @ `dee51e3`.
Shots: `pnpm shoot muscles-core --beats --locale en --theme paper` (killed after 62 beats; the training loops are slow). The other 12 topics used a chapter-camera shot list plus one `exploded` shot per topic, in en/paper at 1920×1080. They are in `shots/<slug>/en-paper/`. I judged form only (silhouette, proportion, characteristic detail, material family). The ivory/graphite plate styling is intended and was not judged.

## Summary table

| topic | model(s) | grade | what reads as fake (concrete parts) | what "realistic" needs | method suggestion | effort | priority |
|---|---|---|---|---|---|---|---|
| muscles-core | Z-Anatomy glb (muscles, bones, skin ghost) + exercise-mode wire figure + equipment | **B** (anatomy A, exercise mode C) | Anatomy is convincing. **Exercise figure** (`skin-wire`, WireBody.tsx) is a coarse faceted low-poly shell. The facets read as a 1990s game mesh, and the hands are white mittens. **Dumbbell**: two plain chamfered cylinders that float beside the hand, not gripped. **Barbell** (RDL): bare rod plus two flat discs, with no sleeve collar, plate hub or lip. | A smooth mannequin with a recognisable male figure and anatomically shaped hands that wrap the bar. Real gym kit: knurled handle, hex or round heads with collars, Olympic sleeves with a collar step, and plates with a raised rim and hub. | Swap `skin-wire` for a smoothed/decimated Z-Anatomy skin (subdivided, smooth-shaded, hairline silhouette edges only, not every triangle edge), or a CC0 mannequin (e.g. Quaternius/Kenney CC0 base mesh) skinned to the existing rig. Lathe-profile the equipment from catalogue drawings. Make the grip poses close the fingers (Hands.tsx already has handShapes). | M (once for all 6) | 2 |
| muscles-back | same kit | **B** | Anatomy A. Bent-over row: same faceted figure, a plain-rod barbell, and plates that are flat discs. | as above | shared kit | — (in core) | 2 |
| muscles-shoulders | same kit | **B** | Anatomy A. Overhead press: faceted figure; the bar is a 2.2 m rod whose plates have no collars. The figure is small in frame, so facets dominate. | as above | shared kit | — | 2 |
| muscles-chest | same kit + bench + rack | **B** | Anatomy A. Incline press: faceted figure with balloon-like thighs. The **rack** is two square sticks with plank J-hooks and no base feet. The **bench** is a single slab with no frame, upholstery seam or adjustable spine. | Commercial flat/incline bench: steel frame with two-foot stance, padded seat plus back with a radius edge, and an adjustment ladder. Squat/bench rack: box-section uprights with hole rows, J-cups and a floor base. | bevelBox/extrude steel sections with hole-row instancing; pad as rounded bevelBox; one reusable `gym-kit` module | M (shared) | 2 |
| muscles-arms | same kit | **B** | Anatomy A. Close-grip bench: same rack, bench and figure issues as chest. | as above | shared kit | — | 2 |
| muscles-legs | same kit | **B** | Anatomy A (thigh and calf meshes read well, side view too). The training chapter camera showed anatomy only, so I saw no props here. | — | — | — | 3 |
| eyes-and-ears | procedural lathe/sweep eye and ear | **C** (eye B−, ear D) | **Pinna**: a flat extruded pink oval with one swept ridge and a sphere for the tragus. It has no concha bowl, no antihelix Y-fork and no lobe, so it reads as a pink cookie. **Canal**: a straight square-ish duct. **Ossicles**: thin wire sweeps with rings, like paper-clips; the malleus and incus are not recognisable. **Stapes**: a ring on a stick, with no stirrup arch or footplate. **Cochlea**: a flat planar spiral disc (a "cinnamon roll") with a fat white tube for the nerve. Real cochlea is a conical 2¾-turn snail shell. **Semicircular canals**: three tangled loops with no vestibule and no ampullae, so the three mutually perpendicular planes cannot be read (factually important). **Eustachian tube**: a detached white chalk-stick floating below the ear. **Eye**: the lathe shells read OK. Cornea bulge and iris are good. The lens in the cutaway is hard to see against the iris, and the optic nerve leaves dead-centre (real: ~15° nasal). | Ear: Gray/Netter-style external, middle and inner ear. Pinna with helix, antihelix and crura, scapha, concha, tragus, antitragus and lobule. S-curved canal of ~2.5 cm. Malleus with head and handle, incus with body and long process, stapes stirrup with footplate in the oval window. Conical cochlea, vestibule, and three canals at right angles with ampullae. Eye: biconvex lens clearly separate, ciliary body/zonules, optic disc offset, plus the six extra-ocular muscle stubs in the exterior view. | Ear: check the Z-Anatomy/BodyParts3D inventory (already licensed, same pipeline as muscles) for auricle, ossicles and the bony labyrinth, and run them through `scripts/anatomy/` as a small glb. Alternative: sculpt the pinna as a lofted/displaced surface from a reference silhouette, the cochlea as a tapered helical sweep around a cone axis, and the canals as three orthogonal tori on a vestibule ellipsoid. Ossicles as small lofted meshes. | L | 1 |
| sound | procedural bench set (fork, drum, monochord, pipe, speaker, earmuffs) | **C** | **Drum shell** (`drum-shell`): a wooden lathe ring with a large rectangular window cut out, like a sawn tin can, with no counter-hoop, lugs or tension rods. **Speaker** (`speaker-case`): a black box with one grey ring and no cone, dust cap, surround or tweeter. **Laboratory bench**: a thin slab on four pencil legs, so it reads as a coffee table. **Pulse emitter / receivers / reflectors**: black slabs and pucks. **Tuning fork**: acceptable (U-extrude with stem), but the tines are square-section and there is no stem ball. **Monochord**: plain box plus wedges, acceptable. **Earmuffs**: good (B). | Snare/hand-drum with hoop and 6–8 lugs plus tension rods (a cutaway may stay, as a clean stand-cut). Bookshelf speaker with a cone driver (cone, surround roll, dust cap) and a tweeter. School lab bench with a thick top, apron and sturdy frame. A tuning fork with round-section tines and a stem/handle as in a real 440 Hz fork. | lathe profiles for the cone/surround and drum hoop; instanced lugs; sweep for round tines; shared `lab-bench` prop with states-of-matter | M | 2 |
| inside-the-earth | layered sphere, plate blocks, volcano, fault, sea columns, building | **D** (hero), **C** (local models) | **Earth layers hero**: seen head-on, it is a flat bullseye of hatched rings with no globe surface, no continents/ocean and no 3D wedge, so it reads as a 2D target, not a planet. The crust ring is a hairline (true to scale, but nothing outside says "Earth"). **Plate boundaries**: orange-topped boxes; the subducting slab extrude shows visible stair-step jaggies along its bend. **Volcano**: a straight-sided triangular cone sliced in half, a pipe-straight conduit, lava as one sausage tube down the flank, and **ash** as rows of floating cubes and discs in a grid, which is factually misleading as a plume. **Fault**: two plain boxes. **Tsunami**: a row of lollipop sticks on a slab. **Building**: box frame, acceptable as a schematic. | Classic textbook globe with a 90° wedge removed (exterior: oceans, continents, cloud wisp, slight relief). Concave-up stratovolcano profile with summit crater, layered strata in the cut face, branching dykes/sill, a magma chamber with irregular roof, and an ash column rising as a billowing plume. Subduction with a smooth slab bend, trench, accretionary wedge and volcanic arc. Fault blocks with layered strata faces so the offset reads. | Globe: sphere with a procedural/Natural Earth equirectangular land mask baked to a local texture (Natural Earth is public domain and already in the geo pipeline), `lathe` wedge cut with hatched faces. Volcano: lathe with a concave profile, strata as banded cut-face texture, ash as instanced billboards or puffs along a rising cone. Slab: sweep with a smooth spline (raise segments). Strata: banded material on the box cut faces. | L | 1 |
| solar-system | 8 planet spheres + Sun, rings, comet, galaxy, sky | **C** | **Planets**: smooth single-tint spheres. **Jupiter** is a flat grey-brown ball with no bands or Great Red Spot. **Earth** has no continents or clouds. **Mars** is plain orange. Uranus and Neptune are near-identical teal. **Sun**: pastel yellow sphere with a *specular highlight*, which is wrong for a light source; it should be self-lit with limb darkening, granulation and sunspots. **Asteroid specimen**: a sphere (`asteroid-specimen` sphere), which is factually misleading because small asteroids are irregular. **Galaxy disc/bar**: spheres scaled, per parts.json (not visually checked). Saturn's rings are OK (lathe), but there is no Cassini division. | Recognisable planet faces at teaching size. Jupiter: belts/zones and the GRS. Saturn: banding and ring A/B with the Cassini gap. Earth: continents, oceans and cloud. Mars: ochre with dark albedo features and a polar cap. Venus: cream cloud veil. Uranus: pale cyan. Neptune: deeper blue with a dark spot. Moon: maria. Sun: emissive, limb darkening, granulation noise and optional sunspot group. Asteroid: an irregular potato (Itokawa/Bennu-like). | One shared **planet-surface kit**: local equirect textures generated procedurally (band noise for the gas giants) or from public-domain NASA/USGS maps downsampled and baked into the repo (no runtime fetch). Sun: unlit shader with limb-darkening term plus a noise granulation. Asteroid: an icosphere displaced by low-frequency noise. | M | 1 |
| sun-earth-moon | Sun, Earth (axis, equator), Moon, tracks | **C/D** | **Earth**: a plain teal sphere with a pure-black night side and no continents, so rotation, tilt and Singapore's position cannot be *seen*, only inferred from the observer dot. The night side is dead black (violates the "no dead black" plate rule). **Moon**: plain dark ball, and the near-side "same face" is shown by a dot instead of the maria, which is factually weak. **Sun**: flat unshaded mustard disc. | Earth with continents, so the turning and tilt read (Singapore near the equator, visible on the globe), plus a soft terminator with a little ambient on the night side. Moon with the real near-side maria pattern (the "same face" is then self-evident). Sun as in solar-system. | reuse the planet-surface kit (same Earth/Moon textures); terminator via a lit material with ambient floor; Singapore marker pinned to the texture's lat/long | S–M (after the kit) | 1 |
| water | Singapore water-loop diorama | **C** | **Clouds**: clusters of identical white ellipsoids, like cartoon cotton balls. **Forested catchment**: green domes studded with sphere "trees" (lollipops). **HDB block**: a white box with a grid, with no void deck, corridor slabs, roof water-tank housing or lift core. City blocks are bare boxes. Sea and reservoirs as flat extrudes: OK. Waterworks clarifiers, RO racks and NEWater membranes: acceptable (B). | Clouds: cumulus with a flat base and cauliflower top. Nimbostratus/cumulonimbus darker with a rain shaft. Tropical secondary-forest canopy as clumped crowns of varied height. HDB point/slab block with void deck pilotis, corridor bands, recessed windows and a rooftop tank enclosure. Marina-Barrage-like crest gates. | Clouds: metaball/instanced puffs with a flattened base and size falloff (one shared cloud generator). Trees: instanced crown clusters from a shared tree generator (see the mangrove review). HDB: parametric bevelBox kit (floors × bays) with instanced windows. | M | 2 |
| states-of-matter | lab bench set (balances, glassware, syringes, ball, pumps, wheel, torch…) | **B** | Glassware, balances, syringes and measuring cylinders read well. Crude props: **bicycle wheel** (`bicycle-wheel`) is a bare black torus with no rim, spokes or hub. **Round balloon**: a red teardrop with no knot or neck. **Balloon pump / ball pump**: a lilac cylinder and a blue capsule, unrecognisable as pumps. **Basketball**: orange sphere with only 3 meridian seams (real: 8-panel layout, 2 great circles + 2 curved seams) and no pebble grain. Ice cubes are plain bevel boxes. | Bicycle wheel: rim, tyre torus, 32–36 instanced spokes and a hub. Balloon with a neck and tied knot. Hand pump with barrel, T-handle and hose. Basketball seam layout. Ice cubes with a slightly frosted cloudy core. | instanced spokes; lathe the balloon and pumps; seam lines as a texture or sweep curves on the ball | S | 3 |

**Grade counts (13 topics):** A 0 · B 7 (six muscle topics, states-of-matter) · C 5 (eyes-and-ears, sound, solar-system, sun-earth-moon, water) · D 1 (inside-the-earth hero). In the muscle topics, the Z-Anatomy meshes themselves are grade A. Their B grade comes from the shared exercise-mode figure and equipment.

## Per-part notes

### Muscle series (core, back, shoulders, chest, arms, legs)
- **Keep:** every Z-Anatomy muscle/bone mesh, the ghost skin and the origin/insertion markers. These are museum quality.
- **Exercise figure** (`skin-wire`, `src/engines/space-scene/stages/model3d/WireBody.tsx`, `Hands.tsx`):
  - Every triangle edge is drawn as a hairline, so the body reads as a crude low-poly mesh, worst on the thighs and calves in the incline/bench views.
  - Fix: draw silhouette and crease edges only (EdgesGeometry with a ~30° threshold on a smooth, denser body), or replace the mesh with a smoothed skin.
  - The hands are mittens, and the fingers do not close around handles. In the RDL, suitcase-carry and press shots the dumbbell or bar sits next to the palm.
- **Equipment** (`src/engines/space-scene/lib/equipment.ts`): all pieces come from the base primitives in one grey.
  - Dumbbell heads look oversized relative to the hand at this zoom; check 140 mm against the rig's hand scale.
  - Plates are flat discs.
  - The rack is two posts with plank hooks and no feet.
  - The bench is a single slab with one stick leg (incline).
  - Suggestion: a reusable `gym-kit` built from catalogue dimensions, one asset set for all six topics.
- **Minor:** muscles-core ch01 shows a detached shadow blob at the feet, off to the left of the figure.

### eyes-and-ears
- `pinna`: extrude + 2 sweeps + sphere. This is the most visibly fake part in the topic. Rebuild it from a lateral reference photo/Gray fig. 904.
- `canal`: should S-curve (lateral cartilaginous part up/back, medial bony part forward/down) and end at an obliquely set eardrum.
- `malleus`/`incus`/`stapes`: each is a sphere + 2 sweeps, so their real shapes cannot be read; the stapes is the worst. The chapter is titled "three moving bones", so these are the subject (priority 1).
- `cochlea-shell`: flat spiral. It should be a cone of 2½–2¾ turns, base toward the vestibule.
- `balance-context`: three loops. They should be orthogonal arcs with ampullae on a vestibule.
- `eustachian-tube`: it should connect the middle-ear cavity to the nasopharynx, running down and forward as a tapering tube attached to the middle ear; at present it floats.
- `hair-patch`: capsule + bristles is acceptable as an enlarged schematic (already labelled ENLARGED SCHEMATIC).
- Eye (`cornea`, `iris`, `lens`, `sclera-shell`, `retina`, `optic-nerve`): fine as lathe shells.
  - Make the lens visibly biconvex and lighter than the iris in the cutaway.
  - Offset the optic nerve nasally.
  - Optionally add extra-ocular muscle stubs to the exterior view so the ball doesn't look like a doorknob.

### sound
- `drum-shell` + `drumhead`: needs a hoop, lugs and tension rods. Make the cut window a clean section, not a rectangle.
- `speaker-case`: needs a driver (lathe cone + surround + dust cap) and a tweeter. "Generic" is fine; brand-free is required.
- `laboratory-bench`: needs a thicker top and a frame; the legs are too thin.
- `fork`: needs round tines, a stem and a resonator-box option. It is the subject of ch01, so medium priority.
- `pulse-emitter`, `echo-receiver`, `reflector-*`: abstract slabs are acceptable for an echo diagram.
- `wave-reference`, the particle rows: schematic, fine.

### inside-the-earth
- `earth-crust`/`mantle`/`outer-core`/`inner-core`: lathe rings. The chapter camera looks straight down the axis, so the model is perceived as 2D.
  - Re-aim the camera to a 3/4 view.
  - Add an exterior surface: a land/ocean texture on the crust shell, plus a wedge cut.
  - This is the topic hero and the cover image (priority 1).
- `edge-slab`: extrude with visible stepped edges along the curve. Raise the curve segments or use a sweep.
- `volcano-cone`: straight triangle profile. Real stratovolcanoes are concave-up with a summit crater.
- `volcano-ash`: grid of boxes. Replace it with a plume.
- `volcano-lava`: a single tube. Real lava flows are lobate sheets.
- `fault-left/right`: add strata bands so the offset reads.
- `sea-column-*`: lollipop markers are acceptable as a SIM schematic, but a water-surface ribbon would read better.

### solar-system
- Planet spheres (`mercury`…`neptune`, `earth`): single tints. Planets are recognised by their surface, so this is the main failure.
- `sun`: shaded like a matte ball with a highlight. It should be emissive.
- `saturn-rings`: OK; add the Cassini division.
- `asteroid-specimen`, `asteroid-belt`: spheres. Use irregular rocks.
- `comet-nucleus` (sphere): should be irregular/bilobed, like 67P.
- `galaxy-disc`/`galaxy-bar`: scaled spheres per data. Consider a spiral-arm texture on a thin disc.

### sun-earth-moon
- `earth-body`: no surface, which defeats the rotation/tilt/Singapore story. Share the solar-system Earth texture.
- `moon-body` + `near-side-mark`: replace the mark with real maria; the dot can stay as a pin.
- `sun-body`: emissive, as in solar-system.
- Night side: ambient floor, no pure black.

### water
- `cumulus`, `rain-cloud`: ellipsoid clusters. Use a shared cloud generator.
- `forest-hill`: sphere trees. Use a shared tree generator.
- `hdb-block`, `city-blocks`: grid boxes. Use a parametric HDB kit.
- `barrage`/`crest-gates`: bevel boxes. Marina Barrage has distinctive hinged crest gates between piers; model the piers plus gate leaves.
- `clarifiers`, `filter-beds`, `newater-ro`, `desal-ro`: fine for a diorama.

### states-of-matter
- Good: `balance-a`, `beam-balance`, cylinders, flask, beaker and `syringe-rack`.
- Crude:
  - `bicycle-wheel` (torus only)
  - `balloon-round` and `balloon-long`
  - `balloon-pump` and `ball-pump`
  - `basketball` (seams)
  - `ice-cube`
  - `torch`: not inspected closely

## Reusable assets (build once)
1. **Gym kit + smooth exercise figure**: fixes all six muscle topics at once. It uses the existing rig, `equipment.ts` and `Hands.tsx` grip poses.
2. **Planet-surface kit**: local equirect textures (procedural bands, or public-domain NASA/USGS maps baked into the repo) plus an emissive Sun shader. It serves solar-system and sun-earth-moon, and also the Earth exterior in inside-the-earth.
3. **Cloud generator + tree/canopy generator**: serves water, and mangrove-food-web and other ecosystem topics (see the parallel review of the bird and tree).
4. **Lab-bench prop kit** (bench, retort stand, glassware): shared by sound and states-of-matter.
5. **Z-Anatomy pipeline extension** to sensory organs (ear ossicles, bony labyrinth, auricle, eyeball): the same licence and attribution path as the muscles.

## Top 5 worst offenders
1. inside-the-earth: the layered-Earth hero reads as a flat bullseye, and the volcano is a triangle cone with grid-cube ash.
2. eyes-and-ears: the pinna is a pink cookie, the ossicles are paper-clips and the cochlea is a flat spiral.
3. sun-earth-moon: Earth and Moon are blank spheres, so rotation, tilt and the same-face story are invisible; the night side is pure black.
4. solar-system: planets are single-tint balls, and the Sun is shaded like a matte object.
5. The shared muscle exercise figure and gym kit: a faceted low-poly wire body, mitten hands that don't grip, and rod-and-disc barbells and benches.
