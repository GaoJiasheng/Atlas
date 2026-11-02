# Dinosaur Earth · factual and data audit

2026-10-27. Authoring contract: `docs/47-dinosaur-earth-content-spec.md`, including its engine record. This audit distinguishes the completed data work from application/browser acceptance. No runtime external data source is used. Sources are paraphrased, with no long quotation or republished third-party scientific figure.

## Fact disposition

The spec's47 adopted/rejected fact records remain **28 verified /3 changed /16 cut**. `verified` reflects the original-source/data review recorded in spec§0.3; this content task reread the dossier and fixed local data and does not claim a new independent download of every source. `changed` narrows the museum and PBDB claims; `cut` records omitted scope, not proof that the original statement was false.

Verified: F001,F002,F003,F004,F009,F014,F017,F019,F020,F021,F022,F023,F028,F031,F032,F033,F034,F039,F041,F050,F051,DE001,DE002,DE003,DE004,DE005,DE006,DE007. Changed: F026,F027,F036. Cut: F010,F011,F012,F016,F018,F024,F025,F029,F030,F037,F038,F040,F044,F045,F048,F052. No cut claim is reintroduced in the metadata, points, cards, glossary or source summaries.

Numerical source table, design choices DS01–DS03, complete PBDB query URLs and source alias mapping are in `data/SOURCES.md`. Runtime source IDs omit leading zeros and map the DE labels to S61/S62/S64/S65/S66. S67 explicitly marks original editorial/UI/illustration choices as design values. There are26runtime sources (25research/data sources plus one design source) and15glossary entries. These counts are implementation counts, not natural facts.

## Dataset evidence

`build.py` reads ten official already-opened PaleoDEM CSV members, verifies original SHA256/CRC, grid uniqueness, finiteness and1°spacing, and creates ten independently loadable named TopoJSON objects. Stable numeric ages are250,230,200,170,150,130,100,70,65,0Ma. Nearest-sample categorical cell union uses z>0, zero assigned non-land; source-domain and polar cuts do not become coast lines. Collinear polar fill edges spanning more than180°are subdivided without any geometric displacement so the loader can reject real transverse bridges. No frame is hand-drawn, modern-filled, warped or renamed66Ma.

K250/K0 were produced and their paired source/output plots inspected before expanding to all frames; all remaining eight pairs were then inspected with the local image viewer. The source interiors and published land agree at the stated categorical sampling scale. The independent existing topojson decoder and ringIssues checker report2317ancient/unavailable rings, zeroArea0,selfCrossing0. Modern NE geometry additionally has128land rings and264country rings, also0/0. Coast cut checks pass. Model seam inconsistencies remain recorded rather than silently repaired.

Two fixed PBDB snapshots are stably deduplicated by occurrence before Malaysian protection exclusion and collection grouping. Counts:2000global+167regional−61duplicates=2106unique;3MYoccurrences/3collections suppressed;2103public occurrences,1274collections,61countries. The815original bibliographic strings for public retained records are deployed once in `public/geo/de-pbdb-references.json`, available offline in each occurrence inspector, and independently recorded in `scripts/geo/dinosaur-earth/publication-references.json`. Each runtime occurrence retains the original PBDB reference number and age bounds; all2103references resolve. Chinese coordinate-basis explanations are translated while original publication titles remain unchanged. No original MYidentifier, coordinate or precise locality prose is copied to publication files. The region-only Pahang card contains no coordinate field.

Collection24178has3occurrences, each121.4–100.5Ma. The closed-interval browse rule operates on each occurrence rather than an envelope, and the±5Ma half-window is labelled design. Two reference points and four editorial cards do not count as fossil collections. Cards preserve their independent region/country precision and stratigraphic context.

All18public `de-*.json` assets total1,924,316bytes; adding the28,388-byte compact topic response gives1,952,704bytes, below2,000,000 including original bibliography and descriptive point metadata. Input/output hashes and exact individual byte counts are in `scripts/geo/dinosaur-earth/build-report.json`. Reproduce and verify with:

```sh
python3 scripts/geo/dinosaur-earth/build.py
pnpm tsx scripts/geo/dinosaur-earth/verify.ts
```

## Art and licence scope

The three approved source PNGs were individually inspected before running the project's existing illustration processor. The cover is a generic three-forward-toe footprint, not an identified specimen; strata are a conceptual five-main-layer block, not a measured K–Pg section; the asteroid is conceptual, with no asserted exact shape, flame or injury. Source raster metadata1024²and1536×1152are file dimensions, not scientific quantities. Standard trimming/grayscale/alpha preservation and WebP encoding are followed by byte-only encoding optimisation; compositions are unchanged. `process-art.ts` records the reproducible commands. No new image generation or third-party photograph is used. Final encoded files were visually inspected: cover800px65,226bytes; cover1600px255,548bytes; strata1200×900118,092bytes; asteroid1200×90094,556bytes.

Upstream PaleoDEM CC BY4.0 attribution and changes are retained; Atlas derived frame geometry is CC BY-NC-SA4.0 as specified. PBDB-derived facts remain CC0; NE geometry remains public domain. Original editorial cards/manifests/prose/art remain Atlas CC BY-NC-SA4.0. File families stay separate, with notices in LICENSE-CONTENT and THIRD-PARTY-NOTICES.md. No CC BY-SA/NC-SA mixing or agreement-restricted source is used.

## Application acceptance boundary

`pnpm tsx scripts/geo/dinosaur-earth/verify.ts` passes the actual deployed dataset checks. The root agent owns final check/validate/test/build results, scientific-state/caption unit tests and integration records. Browser shoot/e2e are explicitly skipped here per BRIEF-CONTENT sandbox instructions; true iPad/GPU performance and gzip/interactive measurements are pending, not passed. The sibling target topic's absence and the six prescribed target chapters are listed in REVIEW.md. `published` records the user's direct publication instruction; it is not a claim that these unexecuted gates passed.

Content integration check at the completed-chapter stage: `pnpm validate` read58topics and returned14errors/0warnings, all exclusively the absent `fossils-and-skeletons` TopicLink target (EN/ZH occurrences). No data, source-ID, glossary, coordinate-space, frame or metadata error was reported. This is a recorded failing gate, not a pass; root integration owns the prescribed sibling-link handling.


Final integration gates: `pnpm check` 0 errors/0 warnings (3 pre-existing hints); `pnpm test`164 files/4312 tests passed. `pnpm validate`58topics/14errors/0warnings, exclusively the prescribed absent-sibling links. `pnpm build` stops on those validation errors. Direct `pnpm exec astro build` generated119pages successfully; it does not waive link validation. Static compressed dependency auditing identifies the map-ready JS path at458,408gzip bytes, above400,000; exact bytes/method and the combined public-map/topic-payload budget are in bundle-report.json. Shoot/e2e/visual regressions and actual-device p95 remain unexecuted as required by the briefs.


## 2026-10-29 · Reader-copy polish: retained source audit detail

All eight chapters now use shorter EN/ZH sentences in summaries, 35 beat captions, reading guidance, main text and More sections. Repeated caveats are consolidated within each explanation; standalone beat captions retain the cautions needed to read that beat. All original source buttons, glossary Term IDs and TopicLink targets remain. Scientific dates, source tables, numeric examples, camera/layer/index/highlight state, privacy handling and reference metadata are unchanged. The figure wording still identifies the strata and asteroid as illustrations rather than measured specimens. No source was newly fetched or re-reviewed for this copy edit.

The student-facing notes were shortened to explain what each source contributes. The original notes below preserve review dates, access limits, excluded claims, source aliases, query counts, coordinate conversions, licensing and pipeline decisions. They are an archive of the previous notes, not a claim of a new source review.

### S1 · International Chronostratigraphic Chart 2026/06 · International Commission on Stratigraphy

EN: Mesozoic columns and footnotes: 251.902±0.024, 201.4±0.2, 143.1±0.6 and 66.00 Ma. Numerical ages can be revised; only facts transcribed. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 中生代栏及图下注；采用251.902±0.024、201.4±0.2、143.1±0.6及66.00Ma。数值年龄可以修订，只转录事实。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S2 · How Fossils Form · US National Park Service

EN: Introduction / Odds of Becoming a Fossil: body remains, activity traces and preservation bias. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: Introduction / Odds of Becoming a Fossil：身体遗存、活动痕迹和保存偏差。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S5 · How do we know how long ago dinosaurs lived? · American Museum of Natural History

EN: Relative stratigraphic ages; the full isotope-method explanation belongs to the sibling topic. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 采用相对地层年龄部分；完整同位素方法交由姊妹主题。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S58 · Rock Dating · Utah Geological Survey

EN: Superposition; undisturbed, unreversed sedimentary sequence. Layer thickness does not establish elapsed years. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 叠覆律；限定未扰动、未倒转的沉积序列。不以层厚推算年数。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S7 · Dinosaur evidence and reconstruction · Natural History Museum, London

EN: Bone, footprint and soft-tissue evidence answer different questions; reconstruction has limits. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 骨骼、足迹和软组织证据回答不同问题；重建存在限制。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S8 · Ask a Scientist About Dinosaurs · American Museum of Natural History

EN: Question 9: birds belong within theropod dinosaurs. Other old numbers on this page are not adopted. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 问题9：鸟属于兽脚类恐龙。不采用该页其他旧数字。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S11 · How an asteroid ended the age of the dinosaurs · Natural History Museum, London

EN: Opening / What survived: about 66 Ma, extinction of non-avian dinosaurs and surviving bird lineages. Crater size here is not adopted. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 开篇 / What survived：约66Ma、非鸟类恐龙灭绝与鸟类支系存活。不采用该页坑径。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S12 · Schulte et al. (2010), Science · The Chicxulub asteroid impact and mass extinction at the Cretaceous-Paleogene boundary

EN: Original abstract obtained through Europe PMC REST core: global ejecta and extinction patterns. Abstract only, not a claim to reading the whole paper; old 65.5 Ma not adopted. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 经Europe PMC REST core取得原摘要：全球喷出物与灭绝对应。只读原摘要，不声称取得全文；旧65.5Ma不采用。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S13 · Chiarenza et al. (2020), PNAS · Asteroid impact, not volcanism, caused the end-Cretaceous dinosaur extinction

EN: Original full-text XML obtained from Europe PMC PMC7382232. Introduction: impactor about 10 km, crater about 180–200 km. Significance/model results are conditional findings attributed to the authors, not direct ancient-temperature observations. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 经Europe PMC PMC7382232取得原始全文XML。引言：撞击体约10km、坑约180–200km。Significance及模型结果归作者，属于条件性结论，不作直接古温度观测。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S15 · Schoene et al. (2019), Science · U-Pb constraints on pulsed eruption of the Deccan Traps across the end-Cretaceous mass extinction

EN: Author-institution public PDF, abstract/discussion: Deccan eruptions cross the boundary; temporal association and volatile causation are distinct. No precise eruption-pulse numbers reproduced. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 作者机构公开PDF，摘要及讨论：德干喷发跨越界线；时间关联与挥发物因果应分开。不搬精确喷发脉冲数值。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S51 · Sprain et al. (2019), Science · The eruptive tempo of Deccan volcanism in relation to the Cretaceous-Paleogene boundary

EN: Original abstract, final sentence: climate-active gas release need not coincide directly with erupted rock volume. Distinct dating results are not fused into one exact pulse. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 原摘要末句：影响气候的气体释放与喷发岩量未必直接同步。不把不同测年结果拼成一个精确脉冲。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S17 · Biodiversity Gallery · Lee Kong Chian Natural History Museum, NUS

EN: Highlights: Dinosaurs; displayed diplodocid sauropods. Facts rewritten; no museum photograph copied, no completeness percentages or family narrative. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: Highlights: Dinosaurs；展出的梁龙科蜥脚类化石。事实改写，不复制馆方照片，不采用完整率或家庭关系支线。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S57 · Interview with evolutionary palaeobiologist Emanuel Tschopp · Lee Kong Chian Natural History Museum, NUS

EN: Research work in LKCNHM: Dana Quarry near Ten Sleep, Wyoming; Jurassic Morrison Formation. Readable HTML replaces the oversized annual report. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: Research work in LKCNHM：怀俄明州Ten Sleep附近Dana Quarry、侏罗纪莫里森组。可读HTML替代过大年报。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S20 · Shibata et al. (2015), PLOS ONE · Sirindhorna khoratensis original description

EN: Abstract / Geological setting / Locality and horizon: Nakhon Ratchasima, Khok Kruat Formation, Early Cretaceous/Aptian. Not assigned the 130 Ma map sample as an exact fossil age. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 摘要 / Geological setting / Locality and horizon：呵叻府、Khok Kruat组、早白垩世阿普特期。不把130Ma地图样本当作化石精确年龄。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S21 · Allain et al. (2012) · Ichthyovenator original abstract

EN: Early Cretaceous Laos; partially associated postcranial skeleton. No complete skull reconstructed. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 早白垩世老挝；部分相连的头后骨骼。不补画完整头骨。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S22 · Dinosaur Di Malaysia? · Masatoshi Sone / Department of Museums Malaysia

EN: Researcher lecture abstract: dinosaur teeth in Pahang; locality withheld for protection. Event date is not fossil age. No coordinates or invented radius published. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 研究者讲座摘要：彭亨的恐龙牙齿，地点为保护而保密。网页活动日期不当作化石年龄；不发布坐标或虚构半径。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S24 · Peters & McClennen (2016), Paleobiology · The Paleobiology Database application programming interface

EN: Abstract / PBDB Data Model. DOI 10.1017/pab.2015.39. Collection/occurrence distinction; snapshot licences come from S65/S66 metadata. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 摘要 / PBDB Data Model；DOI10.1017/pab.2015.39。区分collection与occurrence；本题快照许可另据S65/S66元数据。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S29 · Scotese & Wright (2018) · PALEOMAP PaleoDEMs v2 · Zenodo record 5460860

EN: Publisher description and official metadata: model elevation/bathymetry in metres, 1° grid, 540–0 Ma, nominal 5 Myr spacing, CC BY 4.0. Actual ten numeric CSV ages/CRC/SHA are in SOURCES-GEO; no 66 Ma frame. Source says 117 models; downloaded nc archive contains 109 members. Adaptations: z>0 nearest-sample cells, explicit dateline/polar cuts, no modern coast substitution. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 发布说明及官方元数据：米制模型高程/水深、1°网格、540–0Ma、名义5Myr间隔、CC BY4.0。实际十份CSV年龄/CRC/SHA见SOURCES-GEO；没有66Ma帧。说明称117模型，所获nc归档实为109成员。改编为z>0最近样本格元，显式日界线/极区裁切，不以现代海岸替换。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S31 · Terms of Use · Natural Earth

EN: Public-domain declaration. Modern reference geometry only; no Natural Earth land is used in ancient main-map frames. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 公有领域声明。仅用于现代参照；古代主图帧不使用Natural Earth陆地。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S52 · 150 Million Years of Dinosaur Evolution · American Museum of Natural History

EN: Original video transcript: established dinosaur record by about 230 Ma in the Late Triassic. Does not rule out every older candidate. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 原视频文字稿：晚三叠世约230Ma已有确立恐龙记录。不宣称所有更早候选均被排除。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S61 · Chicxulub locator · Lunar and Planetary Institute / USRA

EN: Spec alias DE-S01. Latitude/Longitude only: 21°20′N/89°30′W → [-89.5,21.333333]. Approximate modern locator, not crater outline. Old 64.98 Ma and 170 km not adopted. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 规格别名DE-S01。仅用Latitude/Longitude：21°20′N/89°30′W换算[-89.5,21.333333]。现代近似定位，不是坑轮廓。不采用旧64.98Ma和170km。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S62 · What was Pangea? · US Geological Survey

EN: Spec alias DE-S02. Opening explanation of connected continents and later separation; concrete land boundaries derive solely from S29. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 规格别名DE-S02。开篇解释大陆相连与后来分离；具体陆地边界只来自S29。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S64 · Natural Earth 110m land v4.1.0 / 50m countries v5.1.1 · Natural Earth contributors

EN: Spec alias DE-S04. Fixed public-domain ZIP DBF LABEL_X/LABEL_Y for SGP gives [103.816925,1.366587], a modern label anchor, not museum/find coordinates. Land fixed ZIP: https://naturalearth.s3.amazonaws.com/110m_physical/ne_110m_land.zip. Modern inset only; six-decimal rounding. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 规格别名DE-S04。固定公有领域ZIP的SGP DBF LABEL_X/LABEL_Y为[103.816925,1.366587]，是现代制图标注点，不是馆址或化石位置。陆地固定ZIP：https://naturalearth.s3.amazonaws.com/110m_physical/ne_110m_land.zip。仅现代小图使用；坐标取六位小数。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S65 · PBDB contributors · API 1.2 bounded global snapshot, 26 October 2026

EN: Spec alias DE-S05. Original CSV metadata explicitly CC0; 2000 of 21720 matching occurrences, 1224 collections, sorted by agespan; bounded, non-random and not a census. Coordinates modern. Full query and source hash in data/SOURCES.md; retained publication references in pipeline bibliography. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 规格别名DE-S05。原CSV元数据明示CC0；匹配21720条中取2000条、1224组，按agespan排序；有界、非随机，不是普查。坐标为现代位置。完整查询、源哈希见data/SOURCES.md；保留文献详见管线书目。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S66 · PBDB contributors · API 1.2 TH/LA/MY regional snapshot, 26 October 2026

EN: Spec alias DE-S06. Original CSV explicitly CC0; 167 occurrences/90 collections. Union 2106 occurrences; suppress 3 MY occurrences/3 collections before grouping; publish 2103 occurrences/1274 collections/61 countries. Collection 24178 has 3 occurrences, each 121.4–100.5 Ma. No raw MY locations published. Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated.

ZH: 规格别名DE-S06。原CSV明示CC0；167条出现记录/90组。并集2106条；先抑制MY的3条/3组，再公开2103条/1274组/61国。24178组有3条记录，各为121.4–100.5Ma。不发布马来西亚原始位置。 规格记录的来源访问/复核日为2026年10月27日；注明的数据快照日期为2026年10月26日。

### S67 · Atlas editorial and illustration design choices

EN: DS01–DS03: z>0 threshold, view/camera bounds, zoom 3.6, ±5 Ma browse window, categorical-cell choice and diagram counts. These are design values, not scientific measurements. Original approved generated illustrations reused without changing composition.

ZH: DS01–DS03：z>0阈值、视图/镜头范围、zoom3.6、±5Ma浏览窗、分类格元选择和画面计数。这些是设计值，不是科学测量。复用已审生成插画，不改变构图。
