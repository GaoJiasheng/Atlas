# Classifying Living Things: review status (22 October 2026)

Published (`status: published`): a Primary 3 science topic with no heavy or contested content (docs/38 §0.1 lists no blocking item). The build record is docs/38 §9.2; sources and reading limits are in `data/SOURCES.md`. The items below are judgement calls taken while building, for Gavin to confirm or change.

## For Gavin to check (Chinese first)

1. **Chinese terms** (docs/38 §0.1-1, D17). No MOE or Singapore-publisher Chinese science glossary was found; the terms follow the spec:
   - 开花植物 / 不开花植物 (Hong Kong uses 有花植物 / 无花植物; no source at all uses 不开花植物).
   - 分类流程图 for "flowchart"; 检索表 appears only in chapter 6's More box "什么是检索表" and in the glossary definition; 打勾表 for "table of ticks".
   - 哺乳动物、爬行动物、两栖动物、鸟类、鱼类、昆虫 (not 哺乳类 etc.).
   - 霉菌 for the syllabus's "mould" (body text also says 霉 / 发霉); 菌落 for "colony" (only in a part detail and the glossary).
2. **Chinese species names not checked against a Singapore source** (part names and the chapter 6 tick table): 斑鳢 (the table and chapter 2 say 斑鱼; is 生鱼 more usual in Singapore?), 短耳犬蝠 (body text 果蝠), 斑腿泛树蛙 (also called 四线树蛙; body text 树蛙), 网纹蟒, 玳瑁, 龙船花 (山丹?), 木麻黄, 鸟巢蕨, 鹿角蕨, and the dolphin **印度太平洋驼背豚** (or 中华白海豚; the research found the naming contested, and Singapore Biodiversity Online's Chinese field is a Cantonese romanisation). The house gecko's part name is the SBO name 疣尾蜥虎; the tick table says 壁虎.
3. **Two questions designed for this topic, not taken from MOE** (§0.1-4): chapter 2 separates animals by "takes in food through a mouth", and chapter 4's flowchart asks six legs → feathers → hair or fur → fins → scales → moist skin. The chapter 4 More box "Why ask about six legs first" says this is a design.
4. **Geniebook as the Singapore source** for what each group "looks like" and for the toy car that responds (S2–S5, a commercial tuition site). Its errors are avoided and listed in the source notes.
5. **Status lines in part details**: native / introduced is stated only where a Singapore agency page says so. The Asian toad's three conflicting statuses are given side by side (detail and chapter 5 More box); the body text says only that it is common.
6. **Conservation**: chapter 5 says in one plain sentence that the humpback dolphin, the pangolin and the hawksbill turtle are critically endangered in Singapore (details give the sources).
7. **Comparisons with other countries** in More boxes: Wales (MRS GREN), England (living / dead / never alive; "Is a flame alive?"; classification keys in Year 4) and the Turkish studies of students' ideas (191 ninth-graders; four fifth-graders). None is presented as a finding about Singapore children.

## Decisions taken in building that you may want to reverse

- **A smaller sorting tray** (1.0 × 0.5 m instead of the spec's 1.32 × 0.58 m) with tighter group grids (two groups: 4 × 3; three: 4 × 4; six: 3 × 2), so the 7 cm specimens read at the tray camera. Every grid still holds the largest group the model ever makes (`pnpm validate` enumerates all questions). The engine fixture keeps the spec's layout.
- **Specimens built from scratch** in `scripts/geo/living-things/specimens/` (2–3 draw calls each) rather than copied from the grasshopper and plant topics, whose parts are 25–50 times larger and multi-part. Eight specimens were drawn a little too large and are scaled down to fit their cell (×0.86 to ×0.99, printed by `build-parts.ts`).
- **The penguin and the fruit bat face the viewer** (white front; wings spread left and right); all other animals are seen from their left side.
- **No reference photographs were downloaded** for modelling (a download needs your permission in this session): the models follow the written descriptions in the NParks pages cited in each detail (bony ridges behind the toad's eyes, four lines on the tree frog, the snakehead's long back fin, the mudskipper's fleshy fins, the rhu's drooping shoots and cone-like fruits). A side-by-side check against photographs (docs/38 §3.3) is still to do.
- **Group colours**: the spec's `token:food` (plants) and `token:holder-5` (amphibians), and `token:cut` (bacteria) and `token:holder-2` (birds), are near-identical, so the groups use non-living `ink-2`, plants `holder-8`, fungi `accent-3`, bacteria `holder-7`, insects `holder-5`, birds `holder-1`, mammals `holder-3`, fish `holder-6`, amphibians `holder-4`, reptiles `accent-1`, other animals `neutral`, tray `ink-3`, magnified `accent-2`.
- **Felt pads drawn in the matte `plastic` family** (sage grey): the `fabric` family's speckle read as terrazzo at the tray camera.
- **Images**: the cover and the two chapter figures are the three drawings already reviewed for this topic in `art/planned/living-things/` (docs/38 §7), processed with `scripts/illustrate.ts`; the cover was softened slightly (median filter) to fit the 90 KB home-page budget. No new images were made.
- **Back-links** added to the shipped topics (docs/38 §1.7): one sentence each in the More boxes of grasshopper `whole-animal`, plant `the-whole-plant` and mosquito `the-adult`.

## Engine notes (not changed here)

- The magnified group's scale bar appears only when that group is the focus (the lens beats); chapter beats that show the microscope corner label the group so the bar is drawn.
- A sort chapter's flowchart card is the right-hand top card; at 1600 × 900 with the LAYERS panel open it covers the right third of the tray, so the chapter camera is set back to keep all six pads in the free band.
