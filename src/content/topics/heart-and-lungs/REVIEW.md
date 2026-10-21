# The Heart and Lungs: review status (22 October 2026)

Published (`status: published`): a Primary 5 science topic built on the signed-off spec docs/40 (§0.1 lists no blocking item). Mesh pipeline: docs/40 §9.1; engine: §9.2; content build: §9.3. Sources, the claims that were cut or reworded, and the gaps in the source numbering are in `data/SOURCES.md`. The items below are judgement calls taken while building, for Gavin to confirm or change.

## For Gavin to check (Chinese first)

1. **Chinese terms** (docs/40 §0.1-1, D19). No MOE or Singapore-publisher Chinese science glossary was found.
   - Title 心与肺, short title 心肺.
   - 含氧多的血 / 含氧少的血 (not 含氧血 / 缺氧血).
   - Diaphragm is **膈** everywhere (as instructed for this build, the same as `digestive-system`), not the spec's 横膈膜.
   - Heart rate and breathing rate are 心跳 / 呼吸（每分钟几次）in the main text; 心率 and 呼吸频率 are not used; 脉搏 appears once, in the chapter 5 box "数一数你自己的".
   - Gills 鳃, gill cover 鳃盖, air tubes 支气管 (further), alveoli 肺泡 and 动脉 / 静脉 / 毛细血管 only in boxes marked 再进一步.
2. **Nitrogen in breathed-out air** shows 78 % on the card (the textbook value, §0.1-2); the chapter 2 box "Nitrogen is really about 75 % in breath" gives the measured value and why.
3. **Walking and running values are model values** (§0.1-3): 20 / 90 at rest, 26 / 115 walking, 40 / 165 running (breaths / heartbeats a minute), marked SIM and "in this model". The resting values sit in the guideline ranges; no source gives the others for 10–12-year-olds.
4. **"Count your own"** (chapter 5 box, §0.1-6) asks the reader to count breaths sitting still, then after jogging gently on the spot for a minute, and mentions feeling the pulse at the wrist or neck, with "If you feel unwell, do not do the jogging part". Delete the jogging sentence if you would rather the page did not ask children to exercise.
5. **Fish** (§0.1-5, D8): both fish beats are kept. The water route "in at the mouth, over the gills, out under the gill cover" is put together from two OpenStax Biology sections (29.1 and 29.2, S40); no single sentence states it for bony fishes. The fish is a generic bony fish with a lifted left gill cover and four arches.
6. **Plants breathe day and night** rests on the extension handbook the `plant` topic already cites (S42); the page refused automated access on 22 October, so it was not re-read for this topic.
7. **Heart shell** (§0.1-4): kept the Z-Anatomy four-chamber heart (no BodyParts3D fallback), as §9.1 recommended; no holes show at the chapter and cover cameras.

## Decisions taken in building that you may want to reverse

- **Two extra layers**: the side table is in its own layer `bench` (the spec had it as context in no group) so it does not stand beside the body in every chapter; `skin-wire`, the lighter copy of the skin, has its own layer `skin-light`, off in every chapter (with both skins on, X-RAY looked grey and faceted). The plant's gases are their own layer (`plant-gases`) so chapter 6 can show them in one beat and the plant's tubes in the next; the fish's gases share the `fish-water` layer.
- **Flow id**: the fish's water flow is `gill-water` (the spec's `fish-water` clashes with its group id).
- **The plant** is the `living-things` chilli seedling scaled 4.5 times (pot, stem, leaves) with three more pairs of leaves and the two tubes drawn along the front of the stem, not geometry copied from the `plant` topic's pepper (whose parts are a whole multi-part plant).
- **The jar and rack** are smaller than §3.5 (jar 9 cm across and 15 cm tall; balls 4.6 mm across at 5.2 mm spacing, 80 to a row) so the rack fits the table beside the fish tank and the plant. The balls are low-poly (the engine sphere made the rack 290,000 triangles).
- **Heart inside**: a preset cannot switch on a cutaway, so the chapter 3 box says "fly to the heart and press C".
- **Cover camera**: `views.cover` looks at the chest a little from the body's left, so the heart shows beside the left lung in X-RAY.
- **Labels**: blood vessels and lungs are see-through (`ghost`) in chapters 4 and 5 so the blood dots show inside them; ghosted parts cannot carry labels, so those beats label the heart, the lung vessels, the large vessels and the leg muscles instead.
- **Images**: the cover and the two chapter figures are the three drafts already reviewed in `art/planned/heart-and-lungs/`, processed with `scripts/illustrate.ts`; no new images were made.
- **Back-links** (one sentence each): `digestive-system` chapters `five-systems` and `small-intestine-chapter`, and `plant` chapter `the-stem`.

## Known gaps

- The LAYERS list is long (22 rows: 14 part layers, 8 flow layers).
- The body is an adult; children's values for blood circuit time, lung capacity and rates after exercise were not found and are not given.
- The air and blood paths inside the nose, heart, lungs and liver and at the far ends of the vessels are drawn, not traced (`routes.json` marks them); the topic says so in chapter 0.
