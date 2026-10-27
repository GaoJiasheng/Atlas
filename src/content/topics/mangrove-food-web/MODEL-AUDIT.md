# Mangrove teaching model · geometry audit

Reproduce with `pnpm tsx scripts/geo/mangrove-food-web/audit-geometry.ts`. The script imports the same `buildParts()` used by `build-topic.ts`; `authoring/geometry-audit.json` records the numeric results. All positions and apparent sizes are original design choices, not specimen measurements or a surveyed site.

## Geometry and cost

- 18 selectable parts and 2 context parts; all primitive schemas parse.
- Each crab has exactly 16 extras: 8 walking legs, 2 cheliped arms, 2 pincer shapes, 2 eye stalks and 2 eyes. Four pairs of walking legs and the claw pair follow fact X01 / S32; male claw asymmetry follows S5. The climbing node groups several kinds, and its two food inputs do not establish one Episesarma species diet.
- Fish have 2 eyes and paired pectoral fins, plus dorsal and tail fins. The mudskipper has no legs or lung. The bird has 2 legs, a curved neck and tapered bill; it represents herons generally.
- Avicennia lateral roots join the tree and each pencil root begins at a lateral branch. The separate Bakau roots descend from its trunk into mud. `connects` records both tree/root relationships.
- CPU geometry generation: 39,860 triangles, including all hidden schematic insets and context. All 20 part bounds are finite. Maximum 16 extras per part.
- 31 material slots with every part shown; 27 while the three inset parts are hidden. Same-material extras merge. Six single-path flows add 6 geometry calls when visible. These are base geometry estimates, before contact-shadow, renderer and HUD passes; they are not measured GPU draw calls or frame rates.

## Reference reading

The three approved original graphite PNGs were inspected: complete habitat, breathing-root connection, predator/prey. The root types remain on separate trees, and the predator/prey illustration has two bird legs and a separate small fish.

For factual morphology, a genuine male fiddler photograph was also read: [Bernard Dupont, Ring-legged Fiddler Crab (Uca annulipes), 15748699382](https://commons.wikimedia.org/wiki/File:Ring-legged_Fiddler_Crab_(Uca_annulipes)_(15748699382).jpg), CC BY-SA 2.0. It was inspected from a temporary file outside the repository, solely to check flattened carapace, raised eye stalks and claw asymmetry. No pixels, traced outline, texture, reference-derived mesh or other photo derivative is incorporated. The original procedural shapes encode independently sourced biological features.

## Numerical framing

70 projections check the bounds-centre label anchors at desktop 16:9 and phone 390:844, using the engine's `fitCameraToAspect` behavior. All relevant anchors pass the mathematical frustum test in the six presets and two inline closeups. This does not establish occlusion, label placement, HUD clearance or touch-target visibility.

The spec's animal preset cannot frame both the fish and the gill inset at x≈1.04. Beat 03.3 therefore needs this inline camera: position `[1.9, .9, 2.2]`, target `[.65, .15, .18]`, fov `32`. It passes both aspect tests. The ordinary animal preset remains appropriate for the crab beat. The microbe inline camera is the spec's `[1.4, .8, .9]` → `[1.05, .2, 0]`, fov `28`.

## Conservative interference audit

Rest and fully exploded bounding boxes were enumerated. There are 47 rest and 42 exploded candidate overlaps. The mudskipper’s lowest fin is above mud. These are conservative boxes, not a collision test. Mud/water/root overlap is intentional; roots enter mud, water crosses roots, and crab feet touch the trunk. Whole-tree boxes include empty space under leaves; the specimen-base box also includes its separate inset platform and therefore overlaps many parts in the union box. The submerged fish lies in the front channel despite overlap with the whole mud-bank box. The JSON preserves all candidates for the visual review.

The low water plane spans the bank footprint below mud and is visible in the channel. Raising it by the existing 0.14 offset covers the exposed surface; this is an illustrative pose, not a volume calculation. The climbing-crab feet bend back to the bark; its high pose uses the existing 0.16 offset. Only mud is an X-RAY shell. CUTAWAY clips the mud but keeps organisms and root specimens whole; EXPLODED moves only the root specimens.

## Pending visual gates

Browser/shoot/e2e gates were explicitly prohibited by the build brief and were not run here. Screenshot comparison, both themes, phone layout, occlusion, actual draw calls, shadows and moving-particle clearance remain for the main session. No visual or GPU pass is claimed by this CPU audit.
