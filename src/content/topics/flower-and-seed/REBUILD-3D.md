# Flower and seed — 3D rebuild

Round 1 below is retained as history. The final **round 2** section supersedes its open bat-finish item; the engine opt-in was supplied by the main session before round 2.

## Rebuild 2026-11-05

Resumed and delivered on 2026-11-09. The bat’s close-up fur finish and complete matched-pose reference coverage remain open as recorded below. Scope: docs/68 `review-living.md` flower-and-seed row: bird’s-nest fern, cave nectar bat, sunbird and fruit specimens, with additional flower/moss detail and colour batching. These are original procedural scientific reconstructions, not specimen scans.

The baseline is the untouched HEAD `parts.json` archived in `scripts/geo/flower-and-seed/evidence/before/`; it was checked byte-for-byte against `git show HEAD:...`. No other topic, existing kit or engine was edited. The topic has 55 selectable parts, 5 context parts, 14 groups, 7 flows, 16 poses and 25 simulation bindings throughout.

### Implementation and renderer verification

`sculpt.ts` builds closed ribbon surfaces, ring lofts, skin panels bounded by the same curves as bones, fine fibre meshes and actual nested cut faces. It imports the existing living-things build-time surface/tube utilities read-only. `bake.ts` merges by selectable part with vertex colour; atlas source-surface extras use the existing engine bridge. It welds, simplifies using normal/colour attributes and meshopt-compresses the result. No photograph is used as a runtime texture. The only base-colour maps are original periodic procedural fig pigmentation and rubber-seed marbling.

`preview.ts` decodes the SHIPPING compressed GLB, not a separate proxy. It uses fossils-and-skeletons `studio-cpu.ts`: the installed RoomEnvironment, hemisphere, all three directional lights, their colours/intensities, exposure, linear RGB, GGX/multiscattering and Three’s ACES/output conversion. Source checks guard the actual renderer lighting values. Roughness comes from the decoded regional UV1 mask and the actual material-family factor (0.62). Lighting is evaluated per fragment with interpolated normals. Tests load through Three’s GLTFLoader and call the renderer’s actual `gltfSurface` + `stylePartMaterial` bridge for both themes, checking maps, channel, colour and roughness.

This is a numerical studio approximation: finite room sampling replaces PMREM cube filtering; GPU shadowing, antialiasing and fragment derivatives are not reproduced. It is not GPU acceptance and no FPS is claimed. No browser or desktop was opened. Browser e2e/shoot were not run because this batch explicitly prohibits Chromium.

### Look / change / look record

The inherited round1–3 images were inspected on resume; no undocumented historical visual sign-off is claimed. The resume rounds contain the following actual observations and changes:

1. **Resume audit / round4:** inspected the inherited round3 contact sheet and full fern, bat and coconut comparisons. The fern was too drooping and pale; increased inner frond rise and margin waves. The bat’s first finger did not bound the skin and bent bones could sit above straight panels; rebuilt all membrane panels directly between the finger curves. The opened rubber valves collapsed their length/width onto one axis; replaced them with cupped surfaces and wall thickness. The coconut cavity read flat, coir was sparse and the three eyes looked like raised rings; added cavity depth shading, coir relief and depressed pore floors. Also replaced vertex-light interpolation in the CPU preview with fragment lighting, which removed a false source of faceting. Preserved all technical-plate colour families.
2. **Round4 / round5:** looked at four-view comparison sheets for the fruits, moss, flower and durian, plus full bat and fern detail comparisons. Changed fern green to the plate’s deep-green token, the ring-shaped humus to an irregular depressed mound, and the corolla to a joined cup. Bat pinnae were floating above the skull: moved their bases into the cranial loft. Pores were changed from bright raised rings to inset pits. Added fruit outline asymmetry and unequal sunbird feather lengths. Corrected the small fig-wasp leg/wing counts. Grounded loose specimens from their decoded build geometry.
3. **Round5 / round6:** looked again at the face-to-face bat, fern, coconut and flower details. The bat’s face still looked bald: follicles swept partly INTO the head because their direction had not been projected into the skin tangent plane. Corrected that projection, lifted the fibres along the surface normal, and biased coverage to the face. Reoriented the pinnae toward the face rather than leaving edge-on discs; recessed the nostril geometry into the actual nasal pad. Figs were too uniformly brown: changed the embedded map to token-derived green/red-brown patches and lenticels. Narrowed the balsam pod and moved seams onto the actual valve valleys. Replaced the angsana’s circular pillow boss with a wrinkled irregular seed case and made its veins uneven.
4. **Final detail pass:** the dense-fur experiment replaced three-triangle tufts with twice as many shorter single-triangle blades, improving facial coverage while reducing the asset size. Buried the eye globes and thinned the lid relief, reduced the nasal pad/pore scale and made the pinnae darker than the fur. The last fruit audit found the inherited green chilli still read as a straight cone: rebuilt whole and cut chilli as curved lofts with shoulder folds, five-lobed calyces, an actual hollow cut wall, placenta and thirteen attached seeds. The S1 design note was amended EN/ZH to supersede the old reuse description. A final side view exposed a gap between the chilli flower stalk and calyx; extended the stalk into its actual calyx attachment and regenerated the asset. Grounded the detached fern frond as well.
5. **Label audit:** compression had changed node frames without converting `extras.labelPoint` from world to node-local coordinates. Repaired all 35 GLB label points after quantization, and added a test through the engine’s actual `glbLabelPoint` function, checking each point against the decoded world bounds and expected world position. An intermediate JSON/binary comparison verified the repair was label metadata only. The final complete raster pass was subsequently regenerated after the label repair, and its asset hash must match the delivered file. The cinema audit also exposed channel-threshold banding from 5-bit vertex colour on the bat membrane: retained 6-bit precision for that part instead of allowing green/purple patches.
6. **Final:** the final sheets are decoded again from the delivered GLB and include front, three-quarter, profile, characteristic detail and a cinema check per hero. Review notes and remaining limitations follow below.

### Final self-grade and part accounting

A/B/C use docs/68: A = credible scientific model, B = recognisable but requires refinement, C = crude. An A here is an offline self-grade; independent GPU acceptance remains required. Abstract reproductive cells, scale markers and intentionally cut-away classroom furniture retain their stated schematic purpose.

| Part | Before → after triangles | Before → after material calls | Grade | Change / retained function | References |
|---|---:|---:|:---:|---|---|
| `fern-fronds` | 2,448 → 20,454 | 2 → 1 | A | Twelve independent curved strap fronds, entire wavy margins, relief midribs, secondary veins, dark humus and interwoven root fibres. Token green corrected under ACES. | fern |
| `fern-underside` | 4,516 → 1,988 | 2 → 1 | A | Cambered leaf and relief linear sori on the distal half; raised above the table. | fern |
| `sorus-close` | 4,188 → 2,588 | 2 → 1 | A | Colour batch retains the magnified sporangia/vein teaching specimen. | fern |
| `moss-cushion` | 1,728 → 9,264 | 2 → 1 | A | Irregular substrate with individually placed leafy gametophytes instead of a smooth green cushion. | moss |
| `moss-capsules` | 2,160 → 3,116 | 1 → 1 | A | Five independently leaning setae with smooth asymmetric capsule lofts. | moss |
| `flower` | 320 → 2,318 | 1 → 1 | A | Five cambered petals with unequal outline/azimuth and a joined corolla cup; replaces the flat star. | flower |
| `sepals` | 1,184 → 596 | 1 → 1 | A | Retains five-part flower attachments and stalk; smooth baked colour batch. | flower |
| `stamens` | 7,420 → 4,964 | 2 → 1 | A | Retains five stamens, filaments and anthers; one selectable colour batch. | flower |
| `pistil` | 740 → 510 | 1 → 1 | A | Retains ovary, style and stigma; one selectable colour batch. | flower |
| `flower-section` | 5,850 → 2,368 | 3 → 1 | A | Retains the half-flower, three visible stamens and ovule attachment; one colour batch. | flower |
| `ovules` | 960 → 2,560 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `bee` | 4,768 → 8,224 | 4 → 4 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `pollen-grains` | 1,836 → 1,836 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `red-flower` | 3,784 → 3,076 | 3 → 1 | A | Retained classroom diagram / apparatus and teaching behaviour; colour-batched where applicable. | Existing topic sources |
| `sunbird` | 3,356 → 9,952 | 3 → 1 | A | Continuous head/neck/breast loft; curved two-part bill; layered coverts and remiges, twelve tail feathers, convex eyes, anisodactyl feet. Feather lengths vary between sides. | sunbird |
| `durian-flowers` | 5,536 → 17,966 | 2 → 1 | A | Three flowers retain their locations; five curved petals and five bundles of six individual filaments/anthers per flower. | durian |
| `nectar-bat` | 5,344 → 19,917 | 4 → 1 | B | Continuous cranium/neck and long narrow muzzle; convex eyes/lids, recessed nostrils, forward-facing concave pinnae attached to skull, swept fur rooted on the skin, nectar tongue. Four finger curves per wing are the exact membrane boundaries; elbow/wrist/thumb claw, five toes per foot, reduced interfemoral membrane and short tail. | bat |
| `fig-cut` | 7,240 → 3,794 | 3 → 1 | A | Retained classroom diagram / apparatus and teaching behaviour; colour-batched where applicable. | Existing topic sources |
| `fig-wasp` | 1,376 → 4,000 | 2 → 2 | A | Corrected the old two-leg sketch to six jointed legs and four wings; retains part identity, scale convention and entry animation. | Existing topic sources |
| `male-cell` | 576 → 1,584 | 2 → 1 | A | Retained classroom diagram / apparatus and teaching behaviour; colour-batched where applicable. | Existing topic sources |
| `female-cell` | 576 → 1,864 | 2 → 1 | A | Retained classroom diagram / apparatus and teaching behaviour; colour-batched where applicable. | Existing topic sources |
| `sperm` | 792 → 772 | 1 → 1 | A | Retained classroom diagram / apparatus and teaching behaviour; colour-batched where applicable. | Existing topic sources |
| `egg` | 864 → 3,456 | 3 → 3 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `angsana-pod` | 920 → 4,762 | 1 → 1 | A | Asymmetric papery wing with irregular outline, uneven relief venation, wrinkled seed boss and short stalk. The original repetition/flow anchor is retained. | angsana |
| `sea-almond` | 912 → 2,462 | 1 → 1 | A | Flattened asymmetric drupe with a longitudinal keel, graded shoulders and tapered ends. | almond |
| `sea-almond-cut` | 3,870 → 14,396 | 3 → 1 | A | Nested rind, corky layer with relief air spaces, hard stone and kernel, with actual cut faces. | almond |
| `coconut` | 3,408 → 32,120 | 3 → 1 | A | Three-ridged ovoid coir, hundreds of attached longitudinal fibres, fibrous cut edges, hard shell, three inset germination pores, thick white endosperm and a concave cavity. A lengthwise teaching window retains the shell cap. Restored contact with table. | coconut |
| `chilli-young` | 814 → 4,012 | 2 → 1 | A | Replaced the near-straight cone with a curved shoulder-to-tip loft, shallow longitudinal folds, five-lobed calyx and bent stalk; retains the original positioning anchor. | chilli |
| `chilli-cut` | 5,270 → 9,328 | 3 → 1 | A | Curved hollow pericarp with actual cut edges, placenta and thirteen seeds attached by funiculi; original part identity, anchor and teaching count retained. | chilli |
| `ripe-figs` | 1,716 → 8,608 | 2 → 1 | A | Three varied syconia with stalks, depressed ostioles and closing bracts; embedded periodic mottled green/red-brown pigmentation and fine lenticels, without raised painted spots. | fig |
| `rubber-capsule` | 1,056 → 3,148 | 1 → 1 | A | Continuous three-lobed woody capsule with slightly unequal lobes, dehiscence seams and stalk. | rubber |
| `rubber-seeds` | 6,408 → 4,376 | 2 → 1 | A | Three unequal smooth seeds with a hilar depression; embedded periodic marbling, not floating spot meshes. | rubber |
| `balsam-pod` | 432 → 3,146 | 1 → 1 | A | Narrow pointed five-valved capsule with true fine hairs, relief seam traces and curved stalk. | balsam |
| `rubber-valves` | 216 → 5,836 | 1 → 1 | A | Three concave valves with independent length/width coordinates, inner and outer faces and actual wall thickness; removes the degenerate ribbon surfaces. | rubber |
| `balsam-valves` | 2,880 → 2,882 | 2 → 1 | A | Retains five rolled valves and the seed-release replacement/visibility logic; colour-batched. | balsam |
| `bean-whole` | 552 → 724 | 2 → 1 | A | Retained classroom diagram / apparatus and teaching behaviour; colour-batched where applicable. | Existing topic sources |
| `bean-cut` | 1,212 → 882 | 3 → 1 | A | Retained classroom diagram / apparatus and teaching behaviour; colour-batched where applicable. | Existing topic sources |
| `bean-sprout` | 6,672 → 2,590 | 2 → 1 | A | Retained classroom diagram / apparatus and teaching behaviour; colour-batched where applicable. | Existing topic sources |
| `day-strip` | 744 → 744 | 2 → 2 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `day-marker` | 96 → 96 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `half-flag` | 200 → 200 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `towel-dish` | 1,872 → 2,642 | 3 → 1 | A | Retained classroom diagram / apparatus and teaching behaviour; colour-batched where applicable. | Existing topic sources |
| `bean-seedling-close` | 1,796 → 1,572 | 2 → 1 | A | Retained classroom diagram / apparatus and teaching behaviour; colour-batched where applicable. | Existing topic sources |
| `cup-a` | 800 → 800 | 2 → 2 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `cup-b` | 800 → 800 | 2 → 2 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `cup-d` | 800 → 800 | 2 → 2 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `cup-e` | 800 → 800 | 2 → 2 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `seeds-a` | 600 → 1,600 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `seeds-b` | 600 → 1,600 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `seeds-d` | 600 → 1,600 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `seeds-e` | 600 → 1,600 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `seedlings-a` | 3,120 → 5,120 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `seedlings-d` | 3,120 → 5,120 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `pick-ring` | 3,456 → 3,456 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `ref-ring` | 2,592 → 2,592 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `table` | 5,284 → 5,284 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `sea-water` | 12 → 12 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `windowsill` | 1,224 → 1,224 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `cupboard` | 264 → 264 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |
| `fridge` | 2,952 → 2,952 | 1 → 1 | A | Retained accepted apparatus / teaching marker; no remodel required by docs/68. | Existing topic sources |

Before: **136,232 triangles / 107 material calls** across all parts before visibility. The prior REVIEW.md’s **96 calls** was the background chapter’s visible running table, a different visibility state. After: **267,317 triangles / 71 material calls** before visibility, hence a conservative **80 calls** including all seven flows and both ground passes. GLB parts count as ONE call each; the inherited counter erroneously counted them as zero and has been fixed. Main-light shadow redraw and optional selection/cutaway overlay passes are not included in this material/flow estimate. No new object was hidden to obtain this budget. The whole-table triangle total stays below 350,000 even with both mutually exclusive burst variants included.

GLB: **none / 0 bytes → 1,463,328 bytes** (1.463 MB, meshopt), below the strict 1,500,000-byte limit. Original `parts.json` contained only primitives. Per-part counts are from the compressed deliverable, not pre-simplification working meshes; see `evidence/metrics.json` and `evidence/after-counts.txt`.

### Text and behaviour

No part ID, part count, chapter/beat reference, teaching count, label, simulation equation, cup repetition or seed-release pose was removed. The bat’s contact anchor is its extended tongue, so the hover pivot and one pollen path face-contact point move with it. The contract test allows precisely that one path point and checks the rest unchanged. The coconut detail adds one EN/ZH sentence explaining the retained cap and lengthwise window. Fig-wasp geometry corrects an old sketch with only two legs/two wings; its existing text made no numerical claim, so no text edit was needed. Explode vectors, simulation visibility replacement, seed throws, camera presets and part connections are retained.

### Reference photographs / drawings (development only)

The following frozen manifest includes 2–4 real references per hero family, Commons URLs, authors and licence strings. Images are fetched only by the build-time `fetch-refs.py`; no runtime network is used. Comparison sheets reproduce photographs as development reference panels with attribution; they are not runtime assets. The authored GLB contains no third-party mesh.

**fern**

- [File:Starr-090623-1444-Asplenium nidus-habit and sori-Nahiku-Maui (24335949904).jpg](https://commons.wikimedia.org/wiki/File:Starr-090623-1444-Asplenium_nidus-habit_and_sori-Nahiku-Maui_(24335949904).jpg) — Forest and Kim Starr, CC BY 3.0 us.
- [File:Asplenium-nidus-SF24240-01.jpg](https://commons.wikimedia.org/wiki/File:Asplenium-nidus-SF24240-01.jpg) — Steve Fitzgerald, CC BY-SA 4.0.
- [File:Starr-140909-1785-Asplenium nidus-sori-Wailua-Maui (24615268084).jpg](https://commons.wikimedia.org/wiki/File:Starr-140909-1785-Asplenium_nidus-sori-Wailua-Maui_(24615268084).jpg) — Forest and Kim Starr, CC BY 3.0 us.

**bat**

- [File:Eonycteris spelaea.jpg](https://commons.wikimedia.org/wiki/File:Eonycteris_spelaea.jpg) — Naturalis Biodiversity Center, CC0.
- [File:Eonycteris spelea.png](https://commons.wikimedia.org/wiki/File:Eonycteris_spelea.png) — Stephen Rossiter, CC BY 4.0.

**sunbird**

- [File:Olive-backed Sunbird female, Misamis Oriental, Philippines 1.jpg](https://commons.wikimedia.org/wiki/File:Olive-backed_Sunbird_female,_Misamis_Oriental,_Philippines_1.jpg) — Domzjuniorwildlife, CC BY-SA 4.0.
- [File:Olive backed Sunbird (Female).jpg](https://commons.wikimedia.org/wiki/File:Olive_backed_Sunbird_(Female).jpg) — Ranieljosecastaneda, CC BY-SA 4.0.

**coconut**

- [File:Coconuts - single and cracked open.jpg](https://commons.wikimedia.org/wiki/File:Coconuts_-_single_and_cracked_open.jpg) — Ivar Leidus, CC BY-SA 4.0.
- [File:Coconut half exocarp removed.jpg](https://commons.wikimedia.org/wiki/File:Coconut_half_exocarp_removed.jpg) — KEmel49, CC BY-SA 4.0.
- [File:Coconut face (2201055109).jpg](https://commons.wikimedia.org/wiki/File:Coconut_face_(2201055109).jpg) — tree-species, CC BY 2.0.

**almond**

- [File:Terminalia catappa (fruit).jpg](https://commons.wikimedia.org/wiki/File:Terminalia_catappa_(fruit).jpg) — Hans Hillewaert, CC BY-SA 3.0.
- [File:Terminalia catappa in Deshaies (1).jpg](https://commons.wikimedia.org/wiki/File:Terminalia_catappa_in_Deshaies_(1).jpg) — Tournasol7, CC BY 4.0.
- [File:Terminalia catappa MHNT.BOT.2007.27.25.jpg](https://commons.wikimedia.org/wiki/File:Terminalia_catappa_MHNT.BOT.2007.27.25.jpg) —  Roger Culos, CC BY-SA 3.0.

**angsana**

- [File:Pterocarpus-indicus-SF24103-03.jpg](https://commons.wikimedia.org/wiki/File:Pterocarpus-indicus-SF24103-03.jpg) — Steve Fitzgerald, CC BY-SA 4.0.
- [File:Pterocarpus-indicus-SF24103-02.jpg](https://commons.wikimedia.org/wiki/File:Pterocarpus-indicus-SF24103-02.jpg) — Steve Fitzgerald, CC BY-SA 4.0.
- [File:Starr-090714-2696-Pterocarpus indicus-fruit and leaves-Napili-Maui (24943275086).jpg](https://commons.wikimedia.org/wiki/File:Starr-090714-2696-Pterocarpus_indicus-fruit_and_leaves-Napili-Maui_(24943275086).jpg) — Forest and Kim Starr, CC BY 3.0 us.

**fig**

- [File:Ficus-variegata-SF24281-02.jpg](https://commons.wikimedia.org/wiki/File:Ficus-variegata-SF24281-02.jpg) — Steve Fitzgerald, CC BY-SA 4.0.
- [File:Ficus variegata SF26128-01.jpg](https://commons.wikimedia.org/wiki/File:Ficus_variegata_SF26128-01.jpg) — Steve Fitzgerald, CC BY-SA 4.0.

**rubber**

- [File:Hevea semillas2.jpg](https://commons.wikimedia.org/wiki/File:Hevea_semillas2.jpg) — User:Luis Fernández García, CC BY-SA 2.5 es.
- [File:Hevea brasiliensis seeds.jpg](https://commons.wikimedia.org/wiki/File:Hevea_brasiliensis_seeds.jpg) — Vis M, CC0.
- [File:Hevea brasiliensis 04.JPG](https://commons.wikimedia.org/wiki/File:Hevea_brasiliensis_04.JPG) — Vinayaraj, CC BY-SA 3.0.
- [File:Hevea brasiliensis 11.JPG](https://commons.wikimedia.org/wiki/File:Hevea_brasiliensis_11.JPG) — Vinayaraj, CC BY-SA 3.0.

**balsam**

- [File:Seeds of Impatiens balsamina.jpg](https://commons.wikimedia.org/wiki/File:Seeds_of_Impatiens_balsamina.jpg) — Plague, CC BY-SA 4.0.
- [File:Impatiens balsamine fruits.jpg](https://commons.wikimedia.org/wiki/File:Impatiens_balsamine_fruits.jpg) — ᱤᱧ ᱢᱟᱛᱟᱞ, CC BY-SA 3.0.

**durian**

- [File:Durian (Durio zibethinus L.); flowering and fruiting branch, Wellcome V0042690.jpg](https://commons.wikimedia.org/wiki/File:Durian_(Durio_zibethinus_L.);_flowering_and_fruiting_branch,_Wellcome_V0042690.jpg) — See source file page for creator, CC BY 4.0.
- [File:Durio flower 2, Cho Lach, Ben Tre, Viet Nam.JPG](https://commons.wikimedia.org/wiki/File:Durio_flower_2,_Cho_Lach,_Ben_Tre,_Viet_Nam.JPG) — Cheers!-test, CC BY-SA 3.0.
- [File:Durian flowers 5.jpg](https://commons.wikimedia.org/wiki/File:Durian_flowers_5.jpg) — Mokkie, CC BY-SA 3.0.

**moss**

- [File:Horn Calcareous Moss (Mnium hornum) capsule of a sporophyte (13564331274).jpg](https://commons.wikimedia.org/wiki/File:Horn_Calcareous_Moss_(Mnium_hornum)_capsule_of_a_sporophyte_(13564331274).jpg) — Bernard DUPONT from FRANCE, CC BY-SA 2.0.
- [File:Moss plants with sporangia.(capsules).jpg](https://commons.wikimedia.org/wiki/File:Moss_plants_with_sporangia.(capsules).jpg) — Krishna satya 333, CC0.

**flower**

- [File:Capsicum annuum 'Black Pearl' 03039.jpg](https://commons.wikimedia.org/wiki/File:Capsicum_annuum_%27Black_Pearl%27_03039.jpg) — Vengolis, CC BY-SA 4.0.
- [File:Capsicum annuum flower DSC 4532.jpg](https://commons.wikimedia.org/wiki/File:Capsicum_annuum_flower_DSC_4532.jpg) — Ranjithsiji, CC BY-SA 4.0.

**chilli**

- [File:-2021-09-06 Cayenne pepper (Capsicum annuum), Trimingham (2).JPG](https://commons.wikimedia.org/wiki/File:-2021-09-06_Cayenne_pepper_(Capsicum_annuum),_Trimingham_(2).JPG) —     Kolforn (Kolforn) I'd appreciate if you could mail me (Kolforn@gmail.com) if you want to use this picture out of the Wikimedia project scope.     This file is licensed under the Creative Commons Attribution-Share Alike 4.0 International license. You are free: to share – to copy, distribute and transmit the work to remix – to adapt the work Under the following conditions: attribution – You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use. share alike – If you remix, transform, or build upon the material, you must distribute your contributions under the same or compatible license as the original.https://creativecommons.org/licenses/by-sa/4.0CC BY-SA 4.0 Creative Commons Attribution-Share Alike 4.0 truetrue, CC BY-SA 4.0.
- [File:Cayenne Pepper in Cebu, Philippines 1.jpg](https://commons.wikimedia.org/wiki/File:Cayenne_Pepper_in_Cebu,_Philippines_1.jpg) — Bim24, CC0.
- [File:Capsicum annuum - Köhler–s Medizinal-Pflanzen-027.jpg](https://commons.wikimedia.org/wiki/File:Capsicum_annuum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-027.jpg) — Franz Eugen Köhler, Köhler's Medizinal-Pflanzen, Public domain.

### Bat finish below A — concrete remaining work

The bat is **B**, not signed off as A: its actual frontal comparison still shows individual stylised fibre blades rather than the dense soft coat in the photograph. The cranium, muzzle, tongue, pinnae, eye globes, digits and membrane attachments have been rebuilt, but the requested close-up fur standard is not achieved. Increasing the fidelity needs combined fine fur pigmentation/normal detail and the regional eye/wing roughness mask. The actual renderer currently takes the `atlasRoughness` branch and only copies the roughness map; that branch ignores a source albedo/normal map. The separate `atlasSurface` branch clears the source normal map. These are observed implementation limits, not a token-file gate.

`engine-microstructure.patch` proposes a strictly opt-in material bridge for the main session to review. It is **not applied**, and there is no claim that a future fur map is present or active in this GLB. After a main-session engine decision, the bat needs a new embedded fur map/UV pass, bridge tests and new GPU/photo acceptance. Engine edits are outside this batch's ownership, so this remaining finish is explicitly recorded rather than graded A. The patch alone is not a completed fur solution.

### View coverage and remaining limits

The frontal bat face, oblique fern rosette, soral frond, face-on papery pod, lateral sunbird and exposed coconut layers/pores are compared at approximately corresponding viewing angles. The files named front/three-quarter/profile describe the MODEL camera. Several references show a different living pose, a spread museum skin, an attached fruit, or a different maturity; these panels are explicitly labelled and must not be presented as exact photo registration. In particular, there is no complete four-angle photographic turntable of the same flying Eonycteris individual, the cut coconut retaining its cap, or the opened three-valve specimen. These unmeasured pose/registration gaps remain; the sheets are morphology evidence, not a numerical silhouette acceptance test. Fruit pigmentation, fur and coir are authored representative reconstructions rather than individual specimen scans. Feather/fur microstructure and full GPU self-shadowing require the reserved GPU review.

### Reproduce

```sh
python3 scripts/geo/flower-and-seed/fetch-refs.py
pnpm tsx scripts/geo/flower-and-seed/build-parts.ts
pnpm tsx scripts/geo/flower-and-seed/tris.ts
pnpm tsx scripts/geo/flower-and-seed/preview.ts final
node scripts/geo/flower-and-seed/review-sheets.mjs scripts/geo/flower-and-seed/evidence/final
```

Final comparison-sheet directory: `/Users/gavin/work/atlas-b2-r-flower-and-seed/scripts/geo/flower-and-seed/evidence/final`.

### Gates

See `scripts/geo/flower-and-seed/evidence/gates.txt` for final exit codes. Concurrent runs hit unrelated timing limits in the sauropod, toad and steam-gear tests while other CPU jobs were active. The final full run uses one worker and a 30-second default timeout without changing assertions, individual test timeouts or repository configuration. The default 5-second toad run timed out; that same test completed in about 9 seconds when allowed to finish. Chromium e2e/shoot are intentionally deferred under the explicit no-browser instruction.


## Rebuild 2026-11-05 — round 2, completed 2026-11-09

### Scope and self-grade

**`nectar-bat` body/head coat: A (offline self-grade, docs/68), previously B.** The coat now reads as dense short hair at the frontal, oblique and lateral close-ups, with backward flow from the face, a darker dorsal coat and a paler underside. Bare wing membranes, pinnae, nose and eye surfaces do not acquire fur detail. This is a representative scientific reconstruction in the technical-plate palette, not a scan or a claim of GPU acceptance. Anatomy, digit counts, attachments, tongue and the existing whole-part hover mechanism are retained from round 1.

| Part / finish | Grade | Before → after triangles | Estimated material calls | Change |
|---|:---:|---:|---:|---|
| `nectar-bat` (one selectable part, body and head fur) | A | 19,917 → 15,333 | 1 → 1 | Continuous periodic axial UV chart; embedded directional pigment and tangent-space normal maps; shorter, finer silhouette hairs; calibrated fabric/skin/cornea roughness. |
| Bare membranes / pinnae / eyes, within the same part | A, retained | Included above | Included above | Neutral UV swatch for pigmentation/normal maps; independent UV1 roughness regions. No fur on the membranes. |

**Whole table:** 267,317 → **262,733 triangles**, 71 → **71 material calls**, or **80** including every flow and both ground passes. Shadow redraw and optional selection/cutaway overlays are excluded from the call estimate. **GLB:** 1,463,328 → **1,478,916 bytes** (meshopt; strict ceiling 1,500,000). The two embedded maps are 1024×512 colour (124,559 bytes) and 512×256 normal (61,738 bytes), JPEG quality 88 with 4:4:4 sampling. No runtime image fetch, extra part or extra draw call was introduced. `fur-asset-audit.json` verifies that all 34 other decoded meshes, their material finishes and labels are identical to the round-1 asset.

### What was implemented and what reaches the renderer

`bat-finish.ts` follows the living-things build-time finish approach: seeded microstructure field, colour modulation and finite-difference tangent-space normals, separated from the regional roughness mask in `bat-finish.ts` there. The native chart strategy follows `living-things/uv.ts`; the studio/TBN sampling follows `preview-bat-studio.ts` and `render-bat-studio.py`. Here the field uses irregular tapered, slightly curved fibres rather than round carpet tufts. The cranium, neck and torso share a continuous ring chart. The jaw has its own nondegenerate ring chart. Periodic duplicated seam vertices are retained, with extended gutters and matching sampled image borders. Uncoated geometry uses a constant neutral swatch, so its triangles cannot sweep through a fur island.

Only the bat's topic material changes from `plastic` to existing **`fabric`**, tinted white so the original token-derived map supplies pigmentation. The actual family roughness is **0.96** and environment intensity **0.35**. The four UV1 pixels are 245 (fur), 160 (skin), 20 (cornea) and 153 (remaining detail): effective roughness is about **0.922 / 0.602 / 0.075 / 0.576**. This corrects the glossy ridge caused by the previous plastic-family scalar, rather than hiding it in a flat-light preview. The source normal scale is **0.43**.

The source material carries `atlasRoughness: true` and `atlasMicrostructure: true`. The main session's existing `GltfSource.tsx` opt-in copies the authored map, normal map and normal scale alongside the UV1 roughness mask. **No engine, widget, framing, shared kit or other topic was edited.** The old proposed engine patch/open-item text above describes the historical round-1 state and is superseded here.

The regression tests use **Three GLTFLoader + the actual `gltfSurface` and `stylePartMaterial` functions**. They verify both opt-in branches; exact legacy behavior when the flag is absent, false, the string `"true"` or numeric 1; preservation of both authored maps when literally true; and no opt-in from the microstructure flag alone. The shipping-asset tests decode all embedded images, check sRGB versus numeric normal data, flipY, dimensions, UV coverage, neutral membrane swatches, periodic border error, the dorsal/ventral pigment difference and the absence of the flag on every other topic mesh. The pre-existing living-things cornea and solar-system texture-loading tests were also rerun unchanged.

### Reference photographs (development only)

Four references are frozen in `evidence/reference-manifest.json`, fetched to the ignored `refs/` directory. All are real Eonycteris photographs. Only the original procedural maps enter the GLB.

1. [Naturalis, Eonycteris spelaea spread skin](https://commons.wikimedia.org/wiki/File:Eonycteris_spelaea.jpg), Naturalis Biodiversity Center, **CC0**. Ventral coat extent and bare membranes; specimen posture differs from flight.
2. [Frontal head, Eonycteris spelea.png](https://commons.wikimedia.org/wiki/File:Eonycteris_spelea.png), Stephen Rossiter, **CC BY 4.0**. Forehead/cheek grain, short muzzle hair and bare pinnae. Original Commons spelling retained in the reference title.
3. [Roosting colony, Indonesia](https://commons.wikimedia.org/wiki/File:Eonycteris_spelaea_364063832.jpg), Samuel GUIRAUDOU, **CC BY 4.0**. Dorsal grey-brown coat and contrast with folded bare membranes.
4. [Cook-Price et al. (2025), ZooKeys 1229, figure 19B](https://doi.org/10.3897/zookeys.1229.118127.figure19), Dawn R. Cook-Price, Olga N. Petko, Sunchai Makchai, Taksin Artchawakom and Pongthep Suwanwaree, **CC BY 4.0**. Lateral-oblique head and neck coat. Sheets crop **panel B only**; panel A depicts *Cynopterus sphinx* and is excluded. [Original figure image](https://binary.pensoft.net/fig/1262224); crop coordinates are in the manifest. The publisher XML supplies the licence and panel identification; the PDF download was unreadable by Poppler and was not used for the crop.

### Look → change → look record

The following are actual inspected renders decoded from each candidate GLB, under the engine studio rig and ACES. Intermediate sheets remain in `evidence/fur-round1` through `fur-round4`.

1. **Baseline / fur-round1:** viewed the round-1 close-up beside Rossiter's photograph: the face was smooth between sparse thick blades. Added the continuous chart and pigment/relief maps; reduced coarse blade coverage and replaced it with much finer silhouette hairs. The first mapped close-up was too pebbled and coarse. It was **not** graded A.
2. **fur-round1 → fur-round2:** increased colour resolution, lengthened the fibres and reduced relief/contrast. Looked at the new frontal detail: it had become too smooth and silky. Increased contrast and restored some relief for the next candidate.
3. **fur-round2 → fur-round3:** inspected the frontal detail, oblique view and newly photographed lateral reference. The long aligned fibres read as combed streaks; the dorsal highlight was also too strong. Shortened the facial fibres separately from the torso, varied their bend/direction and checked a normal-disabled control. The bright dorsal line remained in the control, so simply suppressing the normal map would not solve it. Periodic decoded texture-border tests also pass; this was not a bald UV gap.
4. **fur-round3 → fur-round4:** changed the topic material to fabric and calibrated the actual regional roughness values. Updated the preview to use the family's real environment intensity as well as roughness. Inspected front, oblique, lateral, detail and cinema views: the combed streaks and glossy dorsal ridge are removed; fine dense short grain, matte coat, pale ventral region and bare membranes now separate. This is the **A** coat finish. A new lateral photo also replaced the inappropriate spread-skin reference on the oblique/profile sheets.
5. **Final framing / filter audit:** widened and recentered the oblique/profile evidence cameras so the nose and tongue are included. Added a cinema head close-up, preserving the whole-animal cinema view. Corrected sRGB texel decoding to happen before bilinear filtering, matching GPU texture sampling, regenerated the final set and inspected its face detail again. No engine camera or topic preset was changed.

### Evidence, checks and remaining limits

Final comparison directory: **`/Users/gavin/work/atlas-b2-r-flower-and-seed/scripts/geo/flower-and-seed/evidence/fur-final`**. Four side-by-side sheets cover front, three-quarter, profile and characteristic face detail; the combined sheet retains both model and reference panels. Paper and cinema renders decode the **shipping** GLB. `snapshot.json` identifies the asset, lighting and reference-manifest hashes, map state and actual topic material. CPU shading reproduces the engine's light rig, exposure, ACES, source textures, interpolated normals, tangent-space perturbation, per-region roughness and family environment intensity.

No requested coat work remains below A. **Reserved external acceptance:** GPU shadows, texture derivatives, mip filtering and antialiasing remain for the main session's GPU review. No Chromium, user browser or desktop was opened. Photos show different individuals and a held/roosting pose; oblique/profile angles are approximate and do not constitute a registered silhouette measurement or a measured photometric match. The existing anatomical reconstruction is not newly certified by the coat-only grade.

No EN/ZH teaching text needed changing. IDs, part count, chapters, beats, labels, teaching numbers, flows, poses, explosion vectors, connections and hover pivot are unchanged. The only `parts.json` change is the bat's material-family name.

Reproduce:

```sh
python3 scripts/geo/flower-and-seed/fetch-refs.py
pnpm tsx scripts/geo/flower-and-seed/build-parts.ts
ONLY=nectar-bat pnpm tsx scripts/geo/flower-and-seed/preview.ts fur-final
node scripts/geo/flower-and-seed/review-sheets.mjs scripts/geo/flower-and-seed/evidence/fur-final
python3 scripts/geo/flower-and-seed/verify-fur.py
```

`evidence/fur-verification.json` records full gate commands, exit codes, timings and the shipping asset hash. The full test suite uses one worker and a 30-second default timeout, as in round 1, with no excluded tests or weakened assertions. An initial invocation was rejected by pnpm before tests started because it intercepted the Vitest flags; the corrected `pnpm run test` invocation and the rejected attempt are both recorded in the gate evidence. The first full run passed all 6,540 assertions in 276 files but exited on Vitest's 60-second `onTaskUpdate` worker RPC timeout (`fur-rpc-attempt.log`). The final run uses thread transport and the dot reporter, with the same complete suite and assertions. The final preview-filter correction also has a separate strict typecheck tied to its renderer hash in `fur-preview-typecheck.json`. Browser e2e/shoot are intentionally deferred under this task's explicit no-browser rule.

Final outcome (2026-11-09): **`pnpm check`, `pnpm validate`, the full `pnpm run test` suite and `pnpm build` all exit 0.** The successful full run passes **6,540 tests in 276 files**, using the documented one-worker thread transport and dot reporter. The build generates 191 static pages. Gate completion, final sheets and the strict preview typecheck all match the delivered asset/renderer hashes.


## Rebuild 2026-11-05 — Round 3 (performed 2026-11-09)

**Status: rebuilt; all four gates pass; visual acceptance remains open at B.** This section supersedes the previous “retained A” and coat-only A claims for the objects below. The higher photo-comparison bar has been applied to the entire object, including attachments and characteristic close-ups. A passing test, a technical feature checklist, or a lower triangle count does not establish an A visual grade.

### Scope and preservation

Round 3 replaces or revises the cave nectar bat, coconut, fern, cut fig, red Costus inflorescence, durian-flower branch, ripe-fig branch, cut sea almond and moss cushion. All new geometry is authored build-time surface/loft code, shipped in the existing single meshopt GLB; no runtime network or third-party model is used. Individual selectable targets remain merged into one material primitive each.

`evidence/round3-regression-audit.json` compares the decoded delivered binary against the frozen round-2 binary in `evidence/round3-before`. All **25 untouched meshes**, their attributes, indices, embedded finishes and materials are identical. This includes chilli-young, rubber capsule/seeds/valves, sunbird and the chilli flower. **272 bilingual part fields** and the interaction contract are unchanged: IDs, counts, chapters/beats, poses, flows, pivot/anchor positions, explosion and connections. The 26 cut-fig teaching florets and three durian flowers are retained. The source-preservation pass in `build-parts.ts` reads live editorial wording before rebuilding, preventing the generator from restoring stale text.

The only teaching-source correction is the requested ZH terminology fix in S1: 紫檀翅果 → **青龙木翅果**, synchronized in `sources.json` and generated `SOURCES.md`. No other display wording changed. Fern-fronds changes material family from plastic to fabric so the visible root mass can be matte; its existing UV1 mask keeps the leaves' effective roughness near 0.369 while roots use 0.96. No engine, widget, framing, shared kit, package file, lockfile or queue file was changed. No browser, Chromium or desktop was launched; no git write was made.

### Changes, counts and honest grades

Counts are **decoded post-meshopt triangles**, not source tessellation. Every listed selectable mesh remains one estimated material call. Grades refer to the inspected engine-rig CPU comparisons, pending GPU review. B means the form is improved and recognizable but still fails the requested photo-adjacent close-up standard; it is not an A release recommendation.

| Part | Before → after triangles | Calls | Grade | Implemented / remaining reason below A |
|---|---:|---:|:---:|---|
| `nectar-bat` | 15,333 → 20,565 | 1 → 1 | **B** | Unified cranium/stop/tapering muzzle surface; naked upturned nose with recessed nares; relief lips; brown embedded lenses, broadened upper lids; larger bare oval ears; neck, shoulders and waist; round forearms/elbows; reduced single thumb claw, no second-digit claw; directional short coat, warmer nape, pale belly and silhouette hairs. The face still looks too stylized beside the real animal, especially the skull/eye transition; the coat reads as procedural grain rather than the photographed dense pile. Further eye-orbit/head sculpting and finer, less contrasty coat shading are needed. |
| `coconut` | 32,120 → 14,456 | 1 → 1 | **B** | Brown relief-grained shell with three shallow depressed triangularly arranged scars; thick mesocarp, shell, meat and hollow cavity in a lengthwise window; curved surface-following fibres and embedded coir maps. Layer order and thickness now read, but the shell/cut face still look leathery and too uniformly grained; silhouette fibre density and irregular coir bundles remain short of the photo. |
| `fern-fronds` | 20,454 → 14,412 | 1 → 1 | **B** | Twelve broader elliptic-lanceolate fronds, acute tips, short narrowing stipes, upright central funnel, raised midribs and integrated vein relief. Visible dark root/humus mass with 310 crossing root paths. The broad triangular normal-flip patches are removed by using a curved two-sided lamina instead of a closed sub-millimetre bag. Some simplified margin/vein detail and the regular root-core surface remain visible at close range; a more irregular interwoven nest is needed. |
| `fern-underside` | 1,988 → 1,988 | 1 → 1 | **B** | Existing acute-tip/camber/midrib form retained and newly compared with the real underside; it shares the fern's remaining lamina simplification. This is not a “retained A” claim. |
| `fig-cut` | 3,794 → 6,900 | 1 → 1 | **B** | Smooth globose receptacle with a narrow peduncle, varied green skin, recessed ostiole/canal and five overlapping bract folds. Intact upper cap above a teaching window; dense papillate lining and exactly 26 display florets. The final ostiole no longer reveals the paper background, but its five folds are too graphic and the green skin lacks the reference's fine lenticel/striated character. The internal reference is a related-species structural proxy, not a species/stage match. |
| `red-flower` | 3,076 → 10,548 | 1 → 1 | **B** | Twenty-four thick convex curled bracts in staggered courses; two hollow asymmetric tubular corollas, cambered leaves and raised midribs/venation; sunbird contact retained. Bracts now have real volume, but the cone remains too regular and its waxy red finish is muted beside the photograph. Further unequal bract overlap and controlled red/wax response are needed. |
| `durian-flowers` | 17,966 → 16,760 | 1 → 1 | **B** | Support block removed; tapered brown bark-relief branch with twig nodes; attached tapered pedicels, retaining three flowers and existing floral counts. The branch still reads as a smooth manufactured bend at close-up; bark relief and node transitions need less uniform structure. Flower close-ups also remain more schematic than the photo. |
| `ripe-figs` | 8,608 → 9,986 | 1 → 1 | **B** | Tapered bark branch, node collars and joined fruit pedicels, preserving three fruits and their existing finish. The branch's basal termination and bark grain still look too clean; fruit lenticels remain too uniformly distributed. Further local bark/attachment shaping is needed. |
| `sea-almond-cut` | 14,396 → 8,320 | 1 → 1 | **B** | Pointed keeled drupe outline; fibrous/corky section with 54 recessed air spaces, thin irregular endocarp and plump creased kernel. The pie-dish silhouette is removed. The cut face is still too graphic and the tissue/endocarp boundary too even beside the sawn specimen; irregular tissue structure needs additional sculpting. The air spaces remain deliberately enlarged, as stated in the existing source note. |
| `moss-cushion` | 9,264 → 18,072 | 1 → 1 | **B** | Dense cushion of 410 leafy shoots, five asymmetric keeled leaves per shoot; lowered/reduced substrate core and irregular canopy outline. The grey blob is replaced, but the nine-vertex leaves remain too coarse at macro scale and the lower core rim is still apparent. A finer branching shoot hierarchy is needed. |

**Whole table:** **262,733 → 257,741 triangles**, **71 → 71 estimated material calls**; **80 → 80** including all flows and both ground passes. These are conservative all-visible CPU estimates, excluding shadow redraws and selection/cutaway overlays. The last external GPU measurement was max **63**; the draw-call topology is preserved, but no new GPU count is claimed. Both triangle totals are below 350k.

**GLB:** **1,478,916 → 1,481,744 bytes**, under the strict 1,500,000-byte ceiling by 18,256 bytes. Nine embedded images: three finish masks, two fruit pigment maps, two bat maps and two coir maps. No image URI or runtime fetch. The bat and coconut alone use the existing literal `atlasMicrostructure: true` opt-in. The real GLTFLoader → `gltfSurface` → `stylePartMaterial` path is tested on both paper and cinema for these authored maps. The renderer is not gated by a substitute token file.

Below-A work is explicitly **not finished to the requested visual standard**. Remaining deficiencies are listed per object above. The delivered budget-constrained reconstruction is not presented as a successful A acceptance: preserving all passing objects, the one-primitive target structure and the strict binary cap required stronger reductions on the rebuilt natural surfaces, and those reductions remain visible in the comparisons. Further progress requires redistribution/retopology of those surfaces and another measured photo-led sculpt pass; a green gate cannot substitute for that work.

### Reference photographs and drawings

All references are development-only. Originals/crops are in the ignored `refs/` directory; stable source URLs, authors, licences and crop coordinates are frozen in `evidence/reference-manifest.json`. No photo pixels are shipped in the GLB. References show different specimens and poses. The sheets approximate the corresponding viewing direction; they are **not registered same-angle measurements**. This angle/pose mismatch is an evidence limitation, especially for branches and the bat's flight-versus-held posture.

**Cave nectar bat**

- [File:Eonycteris spelaea.jpg](https://commons.wikimedia.org/wiki/File:Eonycteris_spelaea.jpg) — CC0.
- [File:Eonycteris spelea.png](https://commons.wikimedia.org/wiki/File:Eonycteris_spelea.png) — CC BY 4.0.
- [Eonycteris spelaea colony, Indonesia (2024)](https://commons.wikimedia.org/wiki/File:Eonycteris_spelaea_364063832.jpg) — CC BY 4.0.
- [Cook-Price et al. 2025, Fig. 19B (Eonycteris ONLY)](https://doi.org/10.3897/zookeys.1229.118127.figure19) — CC BY 4.0.

**Coconut**

- [File:Coconuts - single and cracked open.jpg](https://commons.wikimedia.org/wiki/File:Coconuts_-_single_and_cracked_open.jpg) — CC BY-SA 4.0.
- [File:Coconut half exocarp removed.jpg](https://commons.wikimedia.org/wiki/File:Coconut_half_exocarp_removed.jpg) — CC BY-SA 4.0.
- [File:Coconut face (2201055109).jpg](https://commons.wikimedia.org/wiki/File:Coconut_face_(2201055109).jpg) — CC BY 2.0.

**Bird’s-nest fern (habit and underside)**

- [File:Starr-090623-1444-Asplenium nidus-habit and sori-Nahiku-Maui (24335949904).jpg](https://commons.wikimedia.org/wiki/File:Starr-090623-1444-Asplenium_nidus-habit_and_sori-Nahiku-Maui_(24335949904).jpg) — CC BY 3.0 us.
- [File:Asplenium-nidus-SF24240-01.jpg](https://commons.wikimedia.org/wiki/File:Asplenium-nidus-SF24240-01.jpg) — CC BY-SA 4.0.
- [File:Starr-140909-1785-Asplenium nidus-sori-Wailua-Maui (24615268084).jpg](https://commons.wikimedia.org/wiki/File:Starr-140909-1785-Asplenium_nidus-sori-Wailua-Maui_(24615268084).jpg) — CC BY 3.0 us.

**Cut fig and ripe figs**

- [File:Ficus-variegata-SF24281-02.jpg](https://commons.wikimedia.org/wiki/File:Ficus-variegata-SF24281-02.jpg) — CC BY-SA 4.0.
- [File:Ficus variegata SF26128-01.jpg](https://commons.wikimedia.org/wiki/File:Ficus_variegata_SF26128-01.jpg) — CC BY-SA 4.0.
- [Ficus racemosa hollow syconium (proxy species; stage unspecified)](https://commons.wikimedia.org/wiki/File:Syconium_ficus_glomerata.JPG) — CC BY-SA 3.0.
- [Ficus racemosa interior macro (proxy species; stage unspecified)](https://commons.wikimedia.org/wiki/File:Inside_fig.jpg) — CC BY-SA 4.0.

**Red Costus inflorescence**

- [File:Costus woodsonii (flower).jpg](https://commons.wikimedia.org/wiki/File:Costus_woodsonii_(flower).jpg) — CC BY-SA 3.0.
- [File:Costus woodsonii (inflorescense).jpg](https://commons.wikimedia.org/wiki/File:Costus_woodsonii_(inflorescense).jpg) — CC BY-SA 3.0.
- [File:Costus Woodsonii Flower.jpg](https://commons.wikimedia.org/wiki/File:Costus_Woodsonii_Flower.jpg) — CC BY-SA 4.0.

**Durian-flower branch**

- [File:Durian (Durio zibethinus L.); flowering and fruiting branch, Wellcome V0042690.jpg](https://commons.wikimedia.org/wiki/File:Durian_(Durio_zibethinus_L.);_flowering_and_fruiting_branch,_Wellcome_V0042690.jpg) — CC BY 4.0.
- [File:Durio flower 2, Cho Lach, Ben Tre, Viet Nam.JPG](https://commons.wikimedia.org/wiki/File:Durio_flower_2,_Cho_Lach,_Ben_Tre,_Viet_Nam.JPG) — CC BY-SA 3.0.
- [File:Durian flowers 5.jpg](https://commons.wikimedia.org/wiki/File:Durian_flowers_5.jpg) — CC BY-SA 3.0.

**Sea almond section**

- [File:Terminalia catappa (fruit).jpg](https://commons.wikimedia.org/wiki/File:Terminalia_catappa_(fruit).jpg) — CC BY-SA 3.0.
- [File:Terminalia catappa in Deshaies (1).jpg](https://commons.wikimedia.org/wiki/File:Terminalia_catappa_in_Deshaies_(1).jpg) — CC BY 4.0.
- [File:Terminalia catappa MHNT.BOT.2007.27.25.jpg](https://commons.wikimedia.org/wiki/File:Terminalia_catappa_MHNT.BOT.2007.27.25.jpg) — CC BY-SA 3.0.
- [Terminalia catappa sawn longitudinal section (cropped)](https://commons.wikimedia.org/wiki/File:Terminalia_catappa_fruits_at_various_stages_of_ripeness-1.JPG) — CC BY-SA 3.0.

**Moss cushion**

- [File:Horn Calcareous Moss (Mnium hornum) capsule of a sporophyte (13564331274).jpg](https://commons.wikimedia.org/wiki/File:Horn_Calcareous_Moss_(Mnium_hornum)_capsule_of_a_sporophyte_(13564331274).jpg) — CC BY-SA 2.0.
- [File:Moss plants with sporangia.(capsules).jpg](https://commons.wikimedia.org/wiki/File:Moss_plants_with_sporangia.(capsules).jpg) — CC0.

For the bat profile, **only Cook-Price et al. Fig. 19B** is cropped; panel A is *Cynopterus sphinx* and is excluded. For fig interiors, *Ficus racemosa* is an explicitly labelled hollow-syconium structural proxy; stage is unspecified, so no claim about the model's pollination stage is inferred. The cut almond uses the actual sawn *Terminalia catappa* image, not an almond nut or an intact-fruit-only reference. The final fig detail crop selects a real ostiole. These corrections replace misleading/insufficient comparison choices from intermediate sheets.

### Look → change → look record

Actual decoded candidate sheets remain in `evidence/round3-look1` through `round3-look5`; final sheets are `evidence/round3-final`. Some intermediate candidates exceeded the binary cap and were rejected; their snapshots record the candidate asset hash rather than claiming they were shipped. Final evidence is regenerated from the shipping binary. No flat-shaded silhouette was used to assign a grade.

1. **First resumed look / look1–look2.** The cone/cranium join, bead eyes, black tubular mouth, smooth body, plank-like forearm, coconut eye holes/stick fibres, narrow fern blades and hidden humus mass remained visible. Built a continuous bat head/body loft with a stop and smaller relief lips; enlarged bare ears, rounded the forearm and reduced the thumb claw. Rebuilt coconut as nested longitudinal layers and curved fibres; broadened and sharpened the fern and exposed its nest. Started the previously unrebuilt fig, Costus, branches, almond and moss instead of calling them “retained A”.
2. **Look2 → look3.** The bat's eye rims and muzzle still looked appended; its coat was too streaky. Refit the lenses to the facial surface, carved orbits, buried lip corners and shortened facial fibres. Coconut scars were too deep and fibres too bright; made shallow filled scars, excluded fibre paths through their centres and subdued/swept the strands. Replaced Costus diamonds with closed convex curling bracts and actual hollow flower tubes. Almond still looked like a dish; narrowed/pointed the outline, added the keel, endocarp, kernel and real recessed cavities. Moss still exposed a core; increased shoot density and reduced/lowered the core.
3. **Look3 → look4.** The fern nest looked like a smooth glossy core and thin straight strands. Added denser crossing curved roots, darkened the core and used actual fabric roughness for the roots while calibrating leaf roughness with UV1. Removed dotted secondary vein tubes in favour of integrated relief. Costus bracts were too shallow; deepened their convex belly, darkened the overlaps and changed to staggered wrapping courses. Almond's long surface scratches and blown-out white kernel hid form; replaced them with restrained short rooted fibres, much shallower grain and an ACES-calibrated cream kernel with a crease. Broke up the moss canopy and enlarged/rolled its keeled leaves.
4. **Look4 → look5.** The bat retained a long horizontal muzzle and upward/sideways bead-eye appearance. Contracted the forward muzzle by 27%, lowered its distal line, refit the eye surface on an anterior-facing tangent plane and reduced the lip relief further. Increased coir-map resolution to 512×256; protected the coconut meat/cavity rim from welding with neutral UV islands and increased rim tessellation. Rounded durian twig nodes and connected pedicels; tapered both branches. The fig interior looked too flat and the ostiole was clipped by the half-section: rebuilt a complete upper cap above the front teaching window with joined exterior/lining normals and dense papillate tissue.
5. **Final close-up recheck.** The intact fig cap still let the paper background show through the open canal; extended five asymmetric bract folds into overlapping spiral closure, retaining the canal beneath. Looked again: the white hole is removed, but the bracts remain too graphic, hence B. The bat lenses still sat above the recess: moved the entire lens below the original cheek surface and widened the upper lid into a brow hood. The final front/oblique/profile/detail set is inspected with these changes. There remain visible shortcomings listed in the grading table; they have not been promoted to A.
6. **Proportion recheck / shape-check.** The frontal bat still had an over-large forehead and its nose/jaw read as a broad pad and pale flange. Lowered the skull dome, moved/enlarged the embedded eyes forward, reduced coat contrast/normal amplitude to avoid burlap grain, narrowed the nose pad and raised/narrowed the jaw. The fern silhouette was too broad and flat: reduced blade width to about 4–5.5 cm at model scale, raised the outer funnel and halved its edge-wave amplitude. Looked at the new front, oblique and profile; the silhouette is closer, while the nest and lamina detail remain B. Moss leaves were too flat/broad: changed to nine vertices/eight triangles, narrowed them, raised the apical leaves and varied shoot heights more. These changes use the bytes saved by reducing excessive coat-map noise. A further close-up exposed broad triangular shading patches on the thin closed fern blades. Replaced the closed bag construction with a curved two-sided lamina and inspected `round3-lamina-check`: the patches are removed; raised camber/midrib remains, with smoother interpolated shading. This is the final topology.
7. **Compression/material checks.** Rejected oversize candidates rather than relaxing the 1.5 MB gate. Kept full precision for bat/coconut/almond; used 12-bit source-grid snapping on the other rebuilt meshes and 14-bit shipping position quantization. Reduction ratios preserve more silhouette-sensitive surface while keeping one primitive per target. A lower-quality bat normal JPEG shifted a neutral texel to blue 250 and failed the existing assertion; raised that image's quality to 68 so the actual map passes. No assertion was weakened. Improved coir detail is in the actual embedded colour/normal maps that the renderer receives.

### Engine-light evidence and reproduction

Comparison directory (absolute):

`/Users/gavin/work/atlas-b2-r-flower-and-seed/scripts/geo/flower-and-seed/evidence/round3-final`

Each of the ten mesh entries has front, three-quarter, profile and characteristic-detail `*-comparison.webp` files, plus a combined `*-sheet.webp` retaining both render and photo panels. Each also has a cinema render; the bat additionally has a cinema head close-up. The fern underside has its own sheet. `snapshot.json` ties the asset, parts, reference manifest, lighting source and renderer hashes to those images.

`preview.ts` decodes the **compressed shipping GLB**, including embedded maps and UV1 masks. It reuses `fossils-and-skeletons/studio-cpu.ts` for studio GGX, sampled RoomEnvironment, hemisphere and three area-equivalent studio lights, exposure and Three ACES. The rig values are checked against actual `Lighting.tsx`; roughness/environment values come from the actual material-family resolver, and sRGB decoding occurs before texture filtering. Bat and coir tangent-space normal perturbations are sampled. This is an offline numerical approximation of the engine's lighting, **not a GPU screenshot**: raster derivatives, mip selection, GPU shadowing and exact antialiasing are not reproduced. GPU/Metal paper and cinema acceptance remains unperformed under this task's explicit no-browser rule.

```sh
pnpm tsx scripts/geo/flower-and-seed/build-parts.ts
ONLY=nectar-bat,coconut,fern-fronds,fern-underside,fig-cut,red-flower,durian-flowers,ripe-figs,sea-almond-cut,moss-cushion pnpm tsx scripts/geo/flower-and-seed/preview.ts round3-final
node scripts/geo/flower-and-seed/review-sheets.mjs scripts/geo/flower-and-seed/evidence/round3-final
pnpm tsx scripts/geo/flower-and-seed/audit-round3.ts
pnpm exec tsc --noEmit -p scripts/geo/flower-and-seed/tsconfig.round3.json
python3 scripts/geo/flower-and-seed/verify-round3.py
```

The verification script runs `pnpm check`, `pnpm validate`, the complete `pnpm run test --maxWorkers=1 --testTimeout=30000 --pool=threads --reporter=dot`, and `pnpm build`, recording exact commands, logs, timings, exits and binary SHA-256 in `evidence/round3-verification.json`. No test is excluded; no screenshot test is substituted for material/geometry checks. A separate strict TypeScript check covers the topic's build and preview modules. Earlier gates passed for earlier candidates; the final run is tied to the delivered binary and checks that it does not change while the gates run. Preceding runs correctly rejected their own provenance because final geometry bakes changed the asset during verification; those runs are not used as final acceptance.


**Final gate result (2026-11-09):** `pnpm check`, `pnpm validate`, the complete `pnpm run test` invocation above, and `pnpm build` all exit **0** for SHA-256 `65a62dee6f31d4a678c65a5ad4b63776cbb7ca98d8d1ec8410ba49f0b8ef439f`. The full suite passes **6,542 tests in 276 files**; the build generates **191 static pages**. Strict topic TypeScript check also exits 0. The asset remains unchanged throughout the accepted gate run. Logs are archived in `scripts/geo/flower-and-seed/evidence/round3-gates/`; results/commands are in `round3-verification.json`. `round3-final/evidence-audit.json` verifies 40 side-by-side views, 10 combined sheets, 11 cinema renders and the frozen source hashes. The rejected provenance run is preserved separately as `round3-stale-gates.json`. The last visual review includes all ten combined sheets, the enlarged bat/fern/moss details and the cinema overview. **All listed objects remain B; this is not an A-complete delivery.**


## Rebuild 2026-11-05 — Round 4 (2026-11-09)

Scope: only `fig-cut`, the Costus bracts/corollas in `red-flower`, and the bat limbs. The round-3 coconut, fern, moss, sea almond, ripe figs, durian branch, and accepted bat face/coat are retained. No display text or chapter data changed. No browser or desktop was opened; no git writes were performed.

### Requested fixes and self-grades

| Part / beat | Change | Self-grade for this round’s requested features | Triangles before → after | Material calls before → after |
|---|---|---|---:|---:|
| `fig-cut` / 5 | Green skin continues around the half-section; 12 mm short, thick green peduncle replaces the needle. A true longitudinal section removes the projecting front cap: the ostiole is flush with the retained rind. All 26 display florets retain their identities and now have larger ochre/oxide ovaries and relief styles. | **A, offline** | 6,900 → 9,936 | 1 → 1 |
| `red-flower` / 1–2 | 24 individually closed, rounded bracts follow a golden-angle spiral with shallow convex faces, raised free margins and dark overlaps. Both orange flowers are hollow corolla tubes with rolled flared lips and dark throats. Original mouths/contact anchors, stem, leaves and perch are retained. | **A, offline** | 10,548 → 10,074 | 1 → 1 |
| `nectar-bat` / 3–4 | One tapered arm follows shoulder → elbow → wrist along the leading edge. Removed the redundant shoulder-to-digit-II membrane panel that hid the forearm and exposed a peg. Shortened and darkened furred hind limbs end in five small hooked toes each; replaced the long projecting tail with a minute dark remnant. Accepted head/body sculpture and embedded coat maps are unchanged. | **A, offline** | 20,565 → 20,287 | 1 → 1 |

A means the specified defect now reads credibly at its authored beat and in the close-up studio study, using docs/68’s A/B/C criteria. It is not a regrade of unrelated round-3 geometry, and it is not GPU acceptance. No requested geometric fix is left at B/C.

### References inspected

Development photos are reused from the ignored reference directory. No reference pixels are embedded in the asset. Fig interior photographs are explicitly **Ficus racemosa structural proxies**, not asserted to show the model species or pollination stage. The bat’s Naturalis specimen is the same species but has extended wings rather than the model’s upstroke; no registered same-pose flight photograph was available. These plates are anatomical comparisons, not photogrammetric measurements.

**Fig section / rind / ostiole**

- [File:Ficus-variegata-SF24281-02.jpg](https://commons.wikimedia.org/wiki/File:Ficus-variegata-SF24281-02.jpg) — CC BY-SA 4.0; local `fig-0.jpg`.
- [File:Ficus variegata SF26128-01.jpg](https://commons.wikimedia.org/wiki/File:Ficus_variegata_SF26128-01.jpg) — CC BY-SA 4.0; local `fig-1.jpg`.
- [Ficus racemosa hollow syconium (proxy species; stage unspecified)](https://commons.wikimedia.org/wiki/File:Syconium_ficus_glomerata.JPG) — CC BY-SA 3.0; local `fig-syconium-racemosa.jpg`.
- [Ficus racemosa interior macro (proxy species; stage unspecified)](https://commons.wikimedia.org/wiki/File:Inside_fig.jpg) — CC BY-SA 4.0; local `fig-inside-racemosa.jpg`.

**Costus bracts / corolla**

- [File:Costus woodsonii (flower).jpg](https://commons.wikimedia.org/wiki/File:Costus_woodsonii_(flower).jpg) — CC BY-SA 3.0; local `costus-0.jpg`.
- [File:Costus woodsonii (inflorescense).jpg](https://commons.wikimedia.org/wiki/File:Costus_woodsonii_(inflorescense).jpg) — CC BY-SA 3.0; local `costus-1.jpg`.
- [File:Costus Woodsonii Flower.jpg](https://commons.wikimedia.org/wiki/File:Costus_Woodsonii_Flower.jpg) — CC BY-SA 4.0; local `costus-2.jpg`.

**Bat arm / hind foot / accepted coat**

- [File:Eonycteris spelaea.jpg](https://commons.wikimedia.org/wiki/File:Eonycteris_spelaea.jpg) — CC0; local `bat-0.jpg`.
- [File:Eonycteris spelea.png](https://commons.wikimedia.org/wiki/File:Eonycteris_spelea.png) — CC BY 4.0; local `bat-2.jpg`.
- [Cook-Price et al. 2025, Fig. 19B (Eonycteris ONLY)](https://doi.org/10.3897/zookeys.1229.118127.figure19) — CC BY 4.0; local `bat-profile.jpg`.

The full Naturalis body, rather than a head-only portrait, is used beside the limb plates. Cook-Price Fig. 19B remains a species/profile reference; panel A is excluded.

### Look → change → look record

1. **Round-3 baseline → look1.** The studio front view reproduces the white onion, white needle stalk and overhanging green lid. The Costus close-up reproduces the swollen sausage/pointed orange flowers. Built a broader green rim and short stalk, larger coloured florets, spiral shield bracts, flared corollas, shorter furred legs and a single tapered arm. Rejected oversize candidates rather than relaxing the 1,500,000-byte limit.
2. **Look1 → look2.** Inspected front/oblique/profile/detail comparisons and the actual beat renders. Fig still had a green canopy hanging into its cavity; the lining was too yellow. Costus throats looked like pale plugs. The near upper arm still looked like a spur because the shoulder-to-digit-II panel hid the forearm. Subdued the lining, enlarged the coloured ovaries, darkened the real hollow throats, brought the elbow onto the leading edge, removed the hiding panel and shortened the shoulder coat sleeve.
3. **Look2 → look3.** The arm now follows the wing edge and the hind toes read as a small foot. The fig canopy still projected into the window. Raised its cavity roof, shortened the canal and darkened the hind-leg coat without editing the shared fur maps. Rechecked the complete multi-view sheets.
4. **Look3 → final.** The front looked acceptable, but the profile exposed a residual overhanging front collar. Removed that collar and its front roof entirely; the fig is now a true half-section through the ostiole. Inspected final front, three-quarter, profile and ostiole close-up: the cap no longer projects. Inspected final Costus and bat sheets, paper/cinema beat comparison plates, and all neutral/±7° bat hover views. No further geometry changes after this look.

Source tessellation was reduced only on hidden bract backs and the fig lining; smooth floret ovaries and bract margins retain the higher visible sampling. The existing colour-aware simplifier and meshopt settings are unchanged.

### Engine lighting, beat framing and evidence

Absolute final comparison-sheet directory:

`/private/tmp/flower-and-seed-round4/final`

This directory is outside the repository. Evidence images were not committed or staged. Intermediate inspected sheets are `look1`, `look2`, and `look3` beside it. `before-beats` contains the round-3 shipping asset at the identical beat cameras.

- Each hero has `front`, `three-quarter`, `profile`, and characteristic `detail` render | photo plates, plus `*-sheet.webp`.
- `beat-comparison-paper.webp` and `beat-comparison-cinema.webp` show round 3 | round 4 | reference at beats 1, 3 and 5. The unscaled 1520×1023 PNGs preserve actual authored framing; beats 2 and 4 have the same cameras as 1 and 3.
- `bat-hover-sweep.webp` and the individual phase PNGs check neutral and ±7° with the engine’s actual `animationAngle()`, axis and pivot, in both themes.
- `beat-framing.json` records cameras read directly from chapter 03, actual `fitCameraToAspect()`, animation times and angles. This is the presentation camera path, with no HUD compensation or auto-fit/recentering.
- `snapshot.json` binds images to the shipping GLB, lighting source, renderer and unchanged parts data.

The CPU preview decodes the actual meshopt GLB and embedded images, uses the engine family roughness/environment intensity, sampled RoomEnvironment, GGX direct lights, hemisphere, exposure, Three ACES and sRGB. It checks rig values against actual Lighting.tsx, not a disconnected token. Perspective attributes use reciprocal-W interpolation. It cannot reproduce GPU derivatives/mip selection, shadow-map filtering or antialiasing. Exact pose registration for the bat and GPU browser acceptance remain outside this evidence; Chromium is expressly prohibited for this round.

Reproduce (images stay outside git):

```sh
pnpm tsx scripts/geo/flower-and-seed/build-parts.ts
ROUND4=1 ONLY=fig-cut,red-flower,nectar-bat PREVIEW_OUT=/tmp/flower-and-seed-round4/final pnpm tsx scripts/geo/flower-and-seed/preview.ts final
node scripts/geo/flower-and-seed/review-sheets.mjs /tmp/flower-and-seed-round4/final
node scripts/geo/flower-and-seed/round4-sheets.mjs /tmp/flower-and-seed-round4
pnpm tsx scripts/geo/flower-and-seed/audit-round4.ts /tmp/flower-and-seed-round4
```

The before/after sheet helper requires the preserved round-3 binary and `before-beats` directory. The source reference manifest remains `refs/manifest.json`; baseline binaries and photographs are not added to git.

### Counts and preservation audit

- Whole table, conservative all-parts upper bound: **257,741 → 260,025 triangles**. This includes mutually exclusive parts and stays below 350k even before chapter visibility.
- Material calls: **71 → 71** estimated, or **80 → 80** including all seven flows and both ground passes. GPU FPS is not claimed.
- Topic GLB: **1,481,744 → 1,498,568 bytes** after meshopt; cap **1,500,000 bytes**.
- `audit-round4.ts` verifies all **32 untouched meshes** are identical after decoding, including attributes, indices, world transforms, extras, material factors, texture sampler settings and embedded image bytes. It also asserts the bat’s accepted finish is identical and **parts.json is byte-identical**, preserving all ids, EN/ZH labels, counts, relationships, animation and mechanism data.
- Final asset SHA-256: `3d91988dc8da64ed25da297e5be97b05477e0dd8476edd937b52bfb7944e4ee5`.

### Gates

All four required gates passed on the final asset:

- `pnpm check`: 1,224 files; 0 errors, 0 warnings (6 existing hints).
- `pnpm validate`: 94 topics; 0 errors, 0 warnings.
- `pnpm run test --maxWorkers=1 --testTimeout=30000 --pool=threads --reporter=dot`: 276 test files passed; 6,541 tests passed, 1 skipped.
- `pnpm build`: 191 static pages built.
- `git diff --check`: clean. Scope audit: only the three target mesh generators, topic preview/audit/evidence scripts, topic metrics, topic GLB and this report changed. No display text, engine, kit, dependency or other-topic changes.

Final asset hash matches the inspected-sheet snapshot and decoded preservation audit. Gate commands and results are saved in `scripts/geo/flower-and-seed/evidence/round4-verification.json`; full logs remain beside the external comparison directory. No browser-based gate is run because this round expressly forbids Chromium.

### GPU acceptance (Claude, 2026-11-16)

Shot with `pnpm shoot flower-and-seed --beats --gpu` in paper and cinema against main (65c3af72); 41/41 beats, 0 beat failures. All three round-4 defects read correctly at their beats:

- `fig-cut` (who-carries-pollen 5): green skin around the section, a short green peduncle, a flush ostiole under the wasp and coloured florets. Reads as a cut fig, better than main's hatched diagram.
- `red-flower` (who-carries-pollen 1): overlapping rounded bracts with shadowed overlaps in a cone; orange corollas are flared tubes.
- `nectar-bat` (who-carries-pollen 3–4): the forearm runs along the leading edge; the hind foot is short, dark and furred.

Decoded audit re-run: the 32 untouched meshes are identical, parts.json is byte-identical, and the GLB is 1,498,568 bytes. The stale `evidence/oversize.glb` (a rejected bake that `bake.ts` writes only when over the cap) is removed from git.

Minor residuals, not blocking:
- Fig florets are sparse beads floating in the cavity, not a dense layer lining the wall.
- The Costus cone is close to a cylinder and a duller red than *Costus woodsonii*.
- The bat's toe claws cannot be made out at beat size.


## Rebuild 2026-11-05 — residual polish, delivered 2026-11-09

Scope: the five requested residuals in the accepted live topic. No display text was changed. Six selectable meshes were revised because moss foliage and sporophytes are separate parts. This section supersedes the three minor residuals listed after round-4 GPU acceptance, and addresses the durian holder and moss request.

### Per-part review and accounting

A means credible under the docs/68 form/attachment/detail criteria for this residual scope. These are offline self-grades, not new GPU acceptance of the whole topic. Existing accepted anatomy and other specimens were kept.

| Part | Triangles before → after | Estimated material calls | Self-grade | Change |
|---|---:|---:|:---:|---|
| `fig-cut` | 9,936 → 24,042 | 1 → 1 | A | Hundreds of sessile florets form a dense wall lining. Broad bases are embedded in the cavity loft; their axes follow its local inward normal. The 26 established teaching locations, half-section, green rind, stalk and flush ostiole remain. Shared-ring meshes and a fig-only simplification setting recover bytes. |
| `red-flower` | 10,074 → 10,074 | 1 → 1 | A | The same 24 imbricate bracts now follow a broad-shouldered, progressively tapering cone. Red derives from technical-plate blood-rich #c8222d with pole-n #b5473a variation; studio-calibrated pigment shading avoids the first pink result. Both corolla mouths/contact anchors remain fixed. |
| `nectar-bat` | 20,287 → 20,287 | 1 → 1 | A | Five toes on each foot have separate, slightly wider spacing and small swept keratin hooks. Reduced the first oversized pale trial to warm-grey #857d70 claws with 0.46 mm root radius and a 2.3 mm upturned hook. Accepted face, coat, membranes and whole-part hover source are retained; embedded finishes are byte-identical. |
| `durian-flowers` | 16,760 → 16,760 | 1 → 1 | A | Removed the actual third beige support block from the table context. Extended/flared the bark-covered branch butt to the table and cut its basal 3 mm onto y=0. Three flowers, their bundles, pedicels and bat contact sites remain in place. |
| `moss-cushion` | 18,072 → 8,706 | 1 → 1 | A | Low irregular cushion with 174 short leafy shoots and seven individually cambered leaves per shoot, varied azimuth, lean and colour. Shortened shoot/leaf rise, broadened tiny leaves and integrated the shaded olive undergrowth; replaces the grass-like upright blades. Six-edge leaf meshes free bytes for the fig. |
| `moss-capsules` | 3,116 → 3,116 | 1 → 1 | A | Retained exactly five sporophytes. Bases now enter the cushion instead of starting above it; finer curved setae carry narrower olive capsules. The selectable part and all chapter/beat references remain. |

### Look → change → look record

1. Inspected the real reference contact sheets and round-1 four-view plates. The fig still had exposed lanes and pale isolated ovaries; the new Costus pigment looked pink under ACES; claws were too pale/bulky; moss had thick setae and rounded capsule heads. Replaced fig grids with closed shared-ring florets, widened their embedded bases and darkened their token-derived pigmentation. Calibrated Costus bract pigment to 0.58 of the initial linear-light trial. Reduced claw radius/height and changed ivory to warm grey. Lowered/fined the five moss setae and narrowed the capsules.
2. Inspected `look3` against the photographs. Fig rows were unevenly spaced in physical space; sparse moss shoots still showed bare substrate. Changed fig placement to arc-length spacing and staggered circumference-dependent packing with broader sessile roots. Broadened moss leaves, reduced their rise, added the olive undergrowth and lowered its profile into a cushion. The durian base needed genuine contact: flattened the cut woody butt onto the table plane.
3. Inspected `look4` Costus and the later `look5` fig / `look6` moss sheets, plus the claw close-up. The cone now tapers, scarlet overlaps remain visible, fig florets cover the wall and the moss reads as a low leafy carpet. Reduced redundant leaf boundary vertices rather than removing characteristic detail to stay under the file cap. Final sheets are decoded once more from the shipping file, with both themes and the actual chapter-03 beat cameras/hover phases.

The first oversize trials and intermediate renders are not shipping assets. Their rasters informed iteration only; final evidence is bound to the delivered asset hash. All images and baseline binaries remain outside git.

### Real references (development-only)

The Commons file pages give author/licence; the frozen download URLs and attribution metadata are in `scripts/geo/flower-and-seed/residual-references.json`. No photograph is a new runtime texture.

**fig**

- [Syconium ficus glomerata.JPG](https://commons.wikimedia.org/wiki/File:Syconium_ficus_glomerata.JPG) — Prashanthns; CC BY-SA 3.0.
- [Inside fig.jpg](https://commons.wikimedia.org/wiki/File:Inside_fig.jpg) — Nikhil More; CC BY-SA 4.0.
- [Ficus-variegata-SF24281-02.jpg](https://commons.wikimedia.org/wiki/File:Ficus-variegata-SF24281-02.jpg) — Steve Fitzgerald; CC BY-SA 4.0.
- [Ficus variegata SF26128-01.jpg](https://commons.wikimedia.org/wiki/File:Ficus_variegata_SF26128-01.jpg) — Steve Fitzgerald; CC BY-SA 4.0.

**costus**

- [Costus woodsonii (flower).jpg](https://commons.wikimedia.org/wiki/File:Costus_woodsonii_(flower).jpg) — Hans Hillewaert; CC BY-SA 3.0.
- [Costus woodsonii (inflorescense).jpg](https://commons.wikimedia.org/wiki/File:Costus_woodsonii_(inflorescense).jpg) — Hans Hillewaert; CC BY-SA 3.0.
- [Costus Woodsonii Flower.jpg](https://commons.wikimedia.org/wiki/File:Costus_Woodsonii_Flower.jpg) — PapiPijuan; CC BY-SA 4.0.

**bat**

- [Eonycteris spelaea.jpg](https://commons.wikimedia.org/wiki/File:Eonycteris_spelaea.jpg) — Naturalis Biodiversity Center; CC0.
- [Eonycteris spelea.png](https://commons.wikimedia.org/wiki/File:Eonycteris_spelea.png) — Stephen Rossiter; CC BY 4.0.
- [Eonycteris spelaea 364063832.jpg](https://commons.wikimedia.org/wiki/File:Eonycteris_spelaea_364063832.jpg) — Samuel GUIRAUDOU; CC BY 4.0.

**durian**

- [Durian (Durio zibethinus L.); flowering and fruiting branch, Wellcome V0042690.jpg](https://commons.wikimedia.org/wiki/File:Durian_%28Durio_zibethinus_L.%29%3B_flowering_and_fruiting_branch%2C_Wellcome_V0042690.jpg) — Wellcome Collection; CC BY 4.0.
- [Durio flower 2, Cho Lach, Ben Tre, Viet Nam.JPG](https://commons.wikimedia.org/wiki/File:Durio_flower_2%2C_Cho_Lach%2C_Ben_Tre%2C_Viet_Nam.JPG) — Cheers!-test; CC BY-SA 3.0.

**moss**

- [Moss plants with sporangia.(capsules).jpg](https://commons.wikimedia.org/wiki/File:Moss_plants_with_sporangia.%28capsules%29.jpg) — Krishna satya 333; CC0.
- [Horn Calcareous Moss (Mnium hornum) capsule of a sporophyte (13564331274).jpg](https://commons.wikimedia.org/wiki/File:Horn_Calcareous_Moss_%28Mnium_hornum%29_capsule_of_a_sporophyte_%2813564331274%29.jpg) — Bernard DUPONT; CC BY-SA 2.0.

Fig interior references are *F. racemosa* structural proxies for the existing *F. variegata* classroom specimen. The Naturalis bat skin supplies the real foot/claw reference; its spread specimen posture differs from the accepted upstroke. Four-view sheets show front, three-quarter, profile and characteristic-detail renders next to real references, with pose differences labelled. Exact same-pose photographic registration is not available for every angle: the accepted bat upstroke and the exhibited cut branch are retained as requested. Those sheets are structural/angle studies, not claimed pixel-matched photography.

### Studio evidence and reproduction

Absolute comparison-sheet directory: `/private/tmp/flower-and-seed-residual/final`. Each target has four render | reference plates and a `*-sheet.webp`, plus cinema views. `*-before-after-detail.webp` adds accepted baseline | final | reference. Chapter-03 beat images retain the authored perspective camera, actual `fitCameraToAspect`, hover pivot/axis and animation phase in both themes.

`preview.ts` decodes the actual meshopt shipping GLB and embedded finishes. It reuses fossils-and-skeletons `studio-cpu.ts`: installed RoomEnvironment, hemisphere, three directional lights, exposure, linear-light GGX, Three ACES and sRGB. It checks the renderer's actual Lighting.tsx values. This numerical preview cannot reproduce GPU shadow filtering, mip derivatives or antialiasing. No browser or desktop was opened. Independent GPU acceptance remains for Claude, as instructed.

```sh
python3 scripts/geo/flower-and-seed/fetch-residual-refs.py
pnpm tsx scripts/geo/flower-and-seed/build-parts.ts
RESIDUAL=1 ROUND4=1 ONLY=fig-cut,red-flower,nectar-bat,durian-flowers,moss-cushion PREVIEW_OUT=/tmp/flower-and-seed-residual/final pnpm tsx scripts/geo/flower-and-seed/preview.ts final
node scripts/geo/flower-and-seed/review-sheets.mjs /tmp/flower-and-seed-residual/final
pnpm tsx scripts/geo/flower-and-seed/audit-residual.ts /tmp/flower-and-seed-residual
node scripts/geo/flower-and-seed/residual-sheets.mjs /tmp/flower-and-seed-residual
```

The audit and before/after strips require the accepted baseline GLB, parts and metrics saved in the external `before` directory before rebuilding; reference downloads stay in ignored `refs`.

### Preservation, totals and gates

- Conservative full-table triangles: **260,025 → 264,177**, below 350,000 even before mutually exclusive chapter visibility.
- Estimated material calls: **71 → 71**, or **80 → 80** with all seven flows and both ground passes. No GPU FPS claim.
- GLB after meshopt: **1,498,568 → 1,497,176 bytes**; cap 1,500,000 bytes. No new image texture was added.
- Decoded audit: **29 untouched meshes** have identical attributes, indices, transforms, extras, materials, samplers and embedded image bytes. Bat material/coat finish is identical. All EN/ZH text, ids, counts, chapters/beats, flow paths, animation data, poses, explosion controls and connections are unchanged. Only the durian holder primitive is removed from `table.extra`.
- Final SHA-256: `64ff54c79ad061bbd8b17d625281f31993587b96ff39e6352c174776c84b034a`. Final snapshot and regression audit must match.
- Gates: see the completed results recorded below. No browser gates were attempted because Chromium/desktop use is expressly forbidden for this task.


### Final verification results — full-suite gate blocked

- `pnpm check`: **passed**, 1,501 files; 0 errors, 0 warnings, 24 existing hints. Both Astro diagnostics and TypeScript completed.
- `pnpm validate`: **passed**, 94 topics; 0 errors/warnings.
- `pnpm build`: **passed**, 191 static pages.
- Topic tests: **32 passed** across `flower-and-seed-rebuild.test.ts` and `flower-and-seed-reuse.test.ts`, including actual GLTFLoader/material-bridge, finite normals, decoded labels, interaction preservation and budgets.
- Full `pnpm run test --configLoader runner --maxWorkers=1 --testTimeout=30000 --pool=threads --reporter=dot`: **301 files / 6,753 tests passed; 5 files / 5 tests failed; 1 skipped**. The 55-minute run encountered only timing failures in untouched code.
- Reran the five failing files unchanged, with the same limits: **487 passed, 4 failed**. The liquid CPU-budget test passed on rerun. The following four remained:

| Untouched test | Reproduced failure |
|---|---|
| `tests/coral-reef.test.ts:358` | Algal-marker containment test exceeded its explicit 20 s timeout (32.78 s on rerun). |
| `tests/time-scene/science-catalogue-contract.test.ts:88` | Search p95 was 147.17 ms against a 100 ms limit (168.10 ms in the full run). |
| `tests/space-scene/lazy-sim-tools.test.ts:35` | `sample-orbit` preparation exceeded 30 s, again at 30.41 s. |
| `tests/space-scene/living-things-toad-skin.test.ts:15` | Closed toad-skin test exceeded its explicit 20 s timeout again. |

The host reported a load average of **595.92** during verification and **201.50** before the isolated rerun. These results are consistent with resource contention, but a quiet-host pass has not been demonstrated. **The full-suite gate is not green.** A clean full-suite rerun remains outstanding; all four reproduced failures are outside this task's permitted edit scope. Their source and timing limits were retained. No engine or other-topic fix is claimed.

A temporary `/tmp` dependency overlay kept writable Astro/Vite caches out of the shared, read-only `node_modules` target. Package files stayed shared and unchanged; the original workspace dependency symlink was restored after verification. No Vitest configuration file was added.

All four final snapshot hashes match the delivered asset, actual engine lighting source, frozen reference manifest and final preview source. The final four-view, before/after/detail, cinema and beat sheets were inspected; `hash-verification.json` and the decoded preservation audit agree. `git diff --check` passed. The machine-readable record is `scripts/geo/flower-and-seed/residual-verification.json`; full logs remain beside the external comparison directory. GPU acceptance and exact same-pose photographic registration for every angle remain outstanding for the reasons stated above.

### GPU acceptance fixes (Claude, 2026-11-09)

GPU review at the chapter beats, in paper and cinema, passed the fig, Costus taper, bat claws and durian branch. Two faults needed fixing:

- `moss-cushion`: the sprigs sat sparsely on a bald, flat disc. The mat is now domed with `skin()` and trimmed inside the foliage footprint. It carries 240 evenly spread five-leaf shoots in deeper, patchy greens.
- `red-flower`: the receptacle was unshaded and showed as a neon band with a torn edge. The receptacle and bract backs now take the bracts' x0.58 shade, and the first six bracts skirt down past the base.

`fig-cut` keeps the settings above. A higher simplification error washed the green out of its stalk and rind, so the moss shoot count pays for the bytes instead. GLB: 1,497,588 bytes, SHA-256 `84ce8dd0e8e1092315b4eff46b5536cf63b75b10c784c3d0486cc6de3b541724`. Against the Codex delivery, only `moss-cushion` and `red-flower` differ.
