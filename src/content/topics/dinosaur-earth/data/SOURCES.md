# Dinosaur Earth — data and numerical source ledger

Research/snapshots: **2026-10-26**. Editorial source access/reverification: **2026-10-27**. The fixed dataset snapshot date is not the site's current fetch date. The application makes no external data requests.

Full source→algorithm→asset audit, per-frame hashes and validation: [SOURCES-GEO](../../../../../scripts/geo/dinosaur-earth/SOURCES-GEO.md), [build report](../../../../../scripts/geo/dinosaur-earth/build-report.json), [retained-record PBDB bibliography](../../../../../scripts/geo/dinosaur-earth/publication-references.json).

## Runtime source aliases

The project source schema requires `S` followed by a positive integer. The content spec's DE source labels map to these runtime IDs; the identity and attribution are unchanged.

| Spec label | Runtime ID | Scope |
|---|---|---|
| S29; DE-S03 / DE-S07 | S29 | Scotese/Wright PaleoDEM v2; CSV source members / topology audit |
| DE-S01 | S61 | LPI modern Chicxulub location |
| DE-S02 | S62 | USGS Pangaea explanation |
| DE-S04 | S64 | Natural Earth modern countries/land and Singapore label anchor |
| DE-S05 | S65 | PBDB bounded global snapshot |
| DE-S06 | S66 | PBDB regional snapshot |

## Reconstructed land (S29)

Scotese & Wright, PALEOMAP PaleoDEMs v2, <https://zenodo.org/records/5460860>, CC BY 4.0. Ten actual numeric sample ages: **250, 230, 200, 170, 150, 130, 100, 70, 65, 0 Ma**. No 66 Ma sample exists. The netCDF archive has 109 members, which does not replace the publisher description's count of 117 models. The build uses only verified CSV bytes, not unparsed netCDF arrays.

The first five grids each have **64,800 rows**, dimensions 180×360, coordinate extents [-180,-89,179,90]. The remaining five each have **65,341 rows**, 181×361, extents [-180,-90,180,90]. Grid spacing is **1°**, not a measure of location accuracy. The elevation/bathymetry unit is metres. **z>0** is the chosen exposed-land threshold; exact zero is grouped with non-land and labelled uncertain at sea level. K70 has **3023** exact-zero samples. Source seam land-sign mismatches are preserved (K0 **6**, K100 **25**); the map is not a seamless globe.

Nearest-sample categorical cells have interior half-width **0.5°**; maximum planar cell-to-sample distance √0.5°. Land is clipped to **±85.051129°** for Mercator. Old-grid +179…+180° is an explicit unavailable strip. Coast lines exclude source-domain, crop and unavailable edges. These are cartographic choices (DS01), not ancient observations. Simplification removes only collinear vertices with **0°** added displacement. No measured ancient shoreline residual is claimed. Main-map maximum zoom **3.6** is a design choice.

The 66 Ma selected event displays the actual 70 Ma sample and **Δ4 Ma**. At 65 Ma the sample is 65 Ma. At selected 32.5 Ma the older provided sample is 65 Ma and **Δ32.5 Ma**, with the missing-intermediate-sample notice. Time selection is discrete hold-older, not a continuous drift simulation.

## Modern collection records (S65 / S66; CC0)

The two original CSV responses explicitly declare Creative Commons CC0, <https://creativecommons.org/publicdomain/zero/1.0/>. Retain PBDB contributor/database credit and the original publication references. The public retained-record bibliography is linked above and included offline in `public/geo/de-pbdb-references.json` (815original reference strings keyed by PBDB reference number); `de-modern-inset.json` binds this file with `referenceFile`. Per-occurrence records carry the matching original reference number, so inspector details can show the full citation without an external request. No database licence is inferred from an older API paper.

Exact global snapshot query:

```text
https://paleobiodb.org/data1.2/occs/list.csv?datainfo&rowcount&base_name=Dinosauria%5EAves&interval=Triassic,Jurassic,Cretaceous&timerule=overlap&show=coords,loc,strat,ref&limit=2000&order=agespan
```

Exact regional snapshot query:

```text
https://paleobiodb.org/data1.2/occs/list.csv?datainfo&rowcount&base_name=Dinosauria%5EAves&interval=Triassic,Jurassic,Cretaceous&timerule=overlap&cc=TH,LA,MY&show=coords,loc,strat,ref&limit=5000
```

The global snapshot returns **2000 of 21720** matching occurrences, sorted by age-span, with **1224 collections**. It is bounded and geographically unrepresentative. The regional query returns **167/167 occurrences**, **90 collections**: TH141, LA23, MY3. This is completeness for that exact query at retrieval, not all regional dinosaur evidence.

Union by occurrence ID gives **2106** unique records; duplicate count **61**. Suppress every MY fossil occurrence before aggregation: **3 occurrences / 3 collections** removed. Public result: **2103 occurrences / 1274 collections / 61 countries**. The count is a selected record, never a dinosaur census, species-richness measure or country ranking. Raw Malaysian IDs, coordinates, locality descriptions and reversible precise-location fields never enter publication assets. Pahang is a text-only region card with no point, radius or centroid.

A collection has one marker and can include multiple occurrences. Collection **24178** has **3 occurrences**, each with original bounds **121.4–100.5 Ma**. Other collections preserve every occurrence interval independently; gaps are not filled by taking an envelope. Ages use closed interval intersection with the chosen browsing window **±5 Ma** (DS02), which is a UI selection rather than measurement error or a claimed lifespan. At q66 the window is [61,71]; at q70 [65,75]. All-mesozoic mode shows selected finds of different ages, not simultaneous communities. Coordinates are modern publication positions, never palaeocoordinates or migration paths.

## Modern reference geometry and locators (S31 / S64 / S61)

Natural Earth data are public domain: <https://www.naturalearthdata.com/about/terms-of-use/>. 110m land source v4.1.0: <https://naturalearth.s3.amazonaws.com/110m_physical/ne_110m_land.zip>. 50m countries v5.1.1: <https://naturalearth.s3.amazonaws.com/50m_cultural/ne_50m_admin_0_countries.zip>. Modern land includes 127 real features /128 rings; 15 relevant country features contain264 rings. Source rounding to6 decimal degrees is at most approximately0.079m diagonal at equator, separate from source map accuracy. These files are modern-inset-only.

Singapore **[103.816925,1.366587]** comes from source LABEL_X/LABEL_Y: a modern cartographic label anchor, not a find coordinate, city centroid or museum address. Chicxulub **[-89.5,21.333333]** comes from LPI's21°20′N/89°30′W (S61): approximate modern location, not an ancient point or crater outline. The crater's66Ma event age comes from S11/S01, not the locator page's obsolete age/diameter.

Cards deliberately use the source's stated precision: Thailand Nakhon Ratchasima region (S20; Early Cretaceous/Aptian Khok Kruat), Laos country (S21; Early Cretaceous, partial postcranial remains), Pahang region (S22; teeth and locality protection), Wyoming→Singapore region narrative (S17/S57; Jurassic Morrison, museum diplodocid sauropods). Their stratigraphic ages are independent of the displayed main-map sample. There is no transportation line, invented centroid or exact age assigned to these cards.

## Other scientific quantities and design counts

| Quantity | Source / scope |
|---|---|
| Mesozoic251.902–66.00Ma; Triassic/Jurassic201.4±0.2; Jurassic/Cretaceous143.1±0.6; oldest boundary251.902±0.024 | S01, ICS2026/06; values can be revised; not copied as every fossil's uncertainty |
| Established dinosaur records by about230Ma | S52 original transcript; no claim all earlier candidates are ruled out |
| About66Ma non-avian dinosaur extinction; some bird lineages survive | S11/S01; all dinosaurs did not disappear |
| About10km impactor; crater about180–200km | S13 original full text introduction; no averaging with conflicting old locator-page values |
| Three forward toe marks, five main schematic rock layers, one conceptual asteroid | DS03 illustration design only, not specimen classification, measured ages or impactor shape |
| 35 beats, background+7 chapters; camera/view bounds; ±5Ma window | Editorial/design values, not measured natural facts |

## Licence families

Every file stays in its own family under docs/next-batch §三: PaleoDEM-derived frame geometry **Atlas CC BY-NC-SA4.0** (upstream **CC BY4.0**, attribution retained); PBDB-derived records and offline bibliography **CC0**; Natural Earth geometry **public domain**; original editorial reference text/manifests **Atlas CC BY-NC-SA4.0**. No CC BY-SA or licence requiring an agreement is used. The whole site's content licence does not override upstream CC0/PD/CC BY assets. Original research data remain read-only, ignored and outside the deployment.

Final publication update:18public `de-*.json` files total1,924,316bytes, including the194,623-byte offline bibliography and918,555-byte collection file. Geometry is unchanged. With the separately measured roughly28KBtopic payload the combined data remains below decimal2MB; exact topic bytes are recorded by the root integration task. Original precision codes are retained and all six coordinate-basis labels have Chinese translations.

## Numbered sources

<!-- sources:begin (generated by scripts/sources-md.ts from sources.json; edit sources.json) -->
- [S1] International Chronostratigraphic Chart 2026/06 · International Commission on Stratigraphy / 2026/06国际地层表 · 国际地层委员会 (This chart gives the dates and uncertainties for the boundaries of the Triassic, Jurassic and Cretaceous. The dates may change as research improves. / 本表提供三叠纪、侏罗纪和白垩纪界线的年代及误差范围。年代数值可能随研究进展而修订。) — https://stratigraphy.org/ICSchart/ChronostratChart2026-06.pdf
- [S2] How Fossils Form · US National Park Service / 化石如何形成 · 美国国家公园管理局 (This explains how fossils form, including body remains and traces such as footprints. It also explains why only some evidence survives. / 这里说明化石如何形成，包括身体遗存和足迹等活动痕迹，也解释为什么只有部分证据能保存下来。) — https://www.nps.gov/subjects/fossils/how-fossils-form.htm
- [S5] How do we know how long ago dinosaurs lived? · American Museum of Natural History / 如何知道恐龙生活在多久以前？ · 美国自然历史博物馆 (This explains how rock layers help us put fossils in age order. / 这里说明如何用地层排列化石年代的先后。) — https://www.amnh.org/explore/videos/dinosaurs-and-fossils/how-do-we-know-how-long-ago-dinosaurs-lived
- [S58] Rock Dating · Utah Geological Survey / 岩石定年 · 犹他州地质调查局 (This explains why lower sedimentary layers are older when the layers have not been disturbed or turned upside down. Layer thickness alone does not tell us how many years passed. / 这里说明：沉积岩层没有受扰动或倒转时，下层比上层老。只看层厚，不能知道经过了多少年。) — https://geology.utah.gov/map-pub/survey-notes/rock-dating/
- [S7] Dinosaur evidence and reconstruction · Natural History Museum, London / 恐龙证据与重建 · 伦敦自然历史博物馆 (This explains what bones, footprints and preserved soft tissues can tell us about dinosaurs. It also shows why a reconstruction has limits. / 这里说明骨骼、足迹和保存下来的软组织能告诉我们什么，也说明复原恐龙有哪些限制。) — https://www.nhm.ac.uk/discover/what-can-scientists-learn-about-dinosaurs-and-how.html
- [S8] Ask a Scientist About Dinosaurs · American Museum of Natural History / 向科学家问恐龙 · 美国自然历史博物馆 (The answer about birds explains that they belong within theropod dinosaurs. / 其中关于鸟类的回答说明，鸟属于兽脚类恐龙。) — https://www.amnh.org/explore/ology/paleontology/ask-a-scientist-about-dinosaurs
- [S11] How an asteroid ended the age of the dinosaurs · Natural History Museum, London / 小行星如何终结恐龙时代 · 伦敦自然历史博物馆 (This explains the extinction of non-avian dinosaurs about 66 million years ago and the survival of some bird lineages. / 这里说明约 6600 万年前非鸟类恐龙灭绝，而部分鸟类谱系存活下来。) — https://www.nhm.ac.uk/discover/how-an-asteroid-caused-extinction-of-dinosaurs.html
- [S12] Schulte et al. (2010), Science · The Chicxulub asteroid impact and mass extinction at the Cretaceous-Paleogene boundary / Schulte等（2010），Science · 希克苏鲁伯撞击与白垩纪—古近纪界线的大灭绝 (The research summary links a worldwide layer of material thrown out by the impact with the timing and pattern of extinction. / 这篇研究摘要把全球的撞击喷出物层，与灭绝的时间和变化模式联系起来。) — https://pubmed.ncbi.nlm.nih.gov/20203042/
- [S13] Chiarenza et al. (2020), PNAS · Asteroid impact, not volcanism, caused the end-Cretaceous dinosaur extinction / Chiarenza等（2020），PNAS · 白垩纪末恐龙灭绝的撞击与火山模型研究 (This study supplies the approximate sizes of the asteroid and crater. Its computer models test how impact cooling and volcanic activity could affect climate and dinosaur habitats. / 这项研究提供小行星和陨石坑的约略尺寸，并用电脑模型检验撞击降温与火山活动可能怎样影响气候和恐龙生境。) — https://doi.org/10.1073/pnas.2006087117
- [S15] Schoene et al. (2019), Science · U-Pb constraints on pulsed eruption of the Deccan Traps across the end-Cretaceous mass extinction / Schoene等（2019），Science · 德干暗色岩喷发年代约束 (This study dates Deccan eruptions around the extinction boundary. Eruption timing and the effects of released gases are different questions. / 这项研究确定灭绝界线前后的德干喷发年代。喷发时间与释放气体造成的影响，是不同的问题。) — https://timslab.princeton.edu/sites/g/files/toruqf2276/files/schoene-2019-science.pdf
- [S51] Sprain et al. (2019), Science · The eruptive tempo of Deccan volcanism in relation to the Cretaceous-Paleogene boundary / Sprain等（2019），Science · 德干火山活动节奏与白垩纪—古近纪界线 (This research summary explains that the amount of erupted rock need not tell us when climate-changing gases were released. / 这篇研究摘要说明，喷出岩石的体积未必能告诉我们影响气候的气体何时释放。) — https://pubmed.ncbi.nlm.nih.gov/30792301/
- [S17] Biodiversity Gallery · Lee Kong Chian Natural History Museum, NUS / 生物多样性展厅 · 新加坡国立大学李光前自然历史博物馆 (The museum describes the diplodocid sauropod fossils on display in its Biodiversity Gallery. / 馆方介绍生物多样性展厅中展出的梁龙科蜥脚类化石。) — https://lkcnhm.nus.edu.sg/exhibition/biodiversity-gallery/
- [S57] Interview with evolutionary palaeobiologist Emanuel Tschopp · Lee Kong Chian Natural History Museum, NUS / 演化古生物学家Emanuel Tschopp访谈 · 李光前自然历史博物馆 (This museum interview identifies Dana Quarry near Ten Sleep, Wyoming, and the Jurassic Morrison Formation as the source of its sauropod fossils. / 这篇馆方访谈说明，蜥脚类化石来自怀俄明州 Ten Sleep 附近的 Dana Quarry，所在岩层属于侏罗纪莫里森组。) — https://lkcnhm.nus.edu.sg/interview-with-an-evolutionary-paleobiologist-dr-emanuel-tschopp/
- [S20] Shibata et al. (2015), PLOS ONE · Sirindhorna khoratensis original description / Shibata等（2015），PLOS ONE · 诗琳通龙Sirindhorna khoratensis原始描述 (This paper describes Sirindhorna from the Khok Kruat Formation in Nakhon Ratchasima Province, Thailand. It places the fossils in the Aptian, part of the Early Cretaceous. / 这篇论文介绍泰国呵叻府 Khok Kruat 组的诗琳通龙，年代属于早白垩世的阿普特期。) — https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0145904
- [S21] Allain et al. (2012) · Ichthyovenator original abstract / Allain等（2012）· 鱼猎龙Ichthyovenator原始摘要 (This research summary describes Early Cretaceous Ichthyovenator from Laos, based on partly connected bones from behind the head. / 这篇研究摘要介绍寮国早白垩世的鱼猎龙，依据是部分相连的头部以后的骨骼。) — https://pubmed.ncbi.nlm.nih.gov/22528021/
- [S22] Dinosaur Di Malaysia? · Masatoshi Sone / Department of Museums Malaysia / Dinosaur Di Malaysia? · Masatoshi Sone / 马来西亚博物馆局 (The researcher describes dinosaur teeth from Pahang, Malaysia. The find site is kept confidential to protect it. / 研究者介绍马来西亚彭亨的恐龙牙齿，并说明发现地点为保护而保密。) — https://www.jmm.gov.my/ms/syarahan-umum-dinosaur-di-malaysia
- [S24] Peters & McClennen (2016), Paleobiology · The Paleobiology Database application programming interface / Peters与McClennen（2016），Paleobiology · 古生物数据库API论文 (This explains how the Paleobiology Database groups fossil information into collections and records of particular fossil types. A map dot is not a count of animals. / 这里说明古生物数据库如何把化石资料分成采集记录组，以及某类化石的出现记录。地图上的点数不等于动物只数。) — https://www.cambridge.org/core/journals/paleobiology/article/the-paleobiology-database-application-programming-interface/4D20F5CAFA1B0AC7033975418668D82B
- [S29] Scotese & Wright (2018) · PALEOMAP PaleoDEMs v2 · Zenodo record 5460860 / Scotese与Wright（2018）· PALEOMAP PaleoDEMs v2 · Zenodo记录5460860 (This dataset supplies the reconstructed land and water heights used to make the ancient maps. We use ten separate ages from 250 million years ago to today; there is no exact 66-million-year map. / 这套资料提供制作古地图所用的复原陆地高程和水深。本题选用距今 2.5 亿年至今天的十个年代，没有恰好对应 6600 万年前的地图。) — https://zenodo.org/records/5460860
- [S31] Terms of Use · Natural Earth / 使用条款 · Natural Earth (Natural Earth allows its map data to be used freely. Its land shapes appear in the modern inset. / Natural Earth 的地图资料可自由使用。本题的现代小图使用它的陆地轮廓。) — https://www.naturalearthdata.com/about/terms-of-use/
- [S52] 150 Million Years of Dinosaur Evolution · American Museum of Natural History / 恐龙演化的一亿五千万年 · 美国自然历史博物馆 (The video transcript describes well-established dinosaur fossils from about 230 million years ago in the Late Triassic. Earlier possible dinosaurs are still a separate question. / 视频文字稿介绍晚三叠世约 2.3 亿年前已有确立的恐龙化石记录。更早的候选材料仍须另作判断。) — https://www.amnh.org/explore/videos/dinosaurs-and-fossils/150-million-years-of-dinosaur-evolution
- [S61] Chicxulub locator · Lunar and Planetary Institute / USRA / 希克苏鲁伯定位 · 月球与行星研究所 / USRA (This supplies the approximate modern position of Chicxulub. The marker locates the crater; it does not draw its outline. / 这里提供希克苏鲁伯陨石坑在今天的近似位置。标记只用来定位，不是坑的轮廓。) — https://www.lpi.usra.edu/science/kring/epo_web/impact_cratering/World_Craters_web/northamericacraters/Chicxulub.html
- [S62] What was Pangea? · US Geological Survey / 什么是盘古大陆？ · 美国地质调查局 (This explains how continents were joined in Pangaea and later separated. / 这里说明大陆如何曾连成盘古大陆，后来又逐渐分开。) — https://www.usgs.gov/faqs/what-was-pangea
- [S64] Natural Earth 110m land v4.1.0 / 50m countries v5.1.1 · Natural Earth contributors / Natural Earth 110m 陆地 v4.1.0 / 50m 国家 v5.1.1 · Natural Earth贡献者 (These maps supply the modern land and country outlines in the inset. The Singapore marker is a map-label position, not a museum address or fossil find site. / 这些地图提供现代小图的陆地与国界轮廓。新加坡标记采用制图标签的位置，不是博物馆地址或化石发现地。) — https://naturalearth.s3.amazonaws.com/50m_cultural/ne_50m_admin_0_countries.zip
- [S65] PBDB contributors · API 1.2 bounded global snapshot, 26 October 2026 / PBDB贡献者 · API 1.2有界全球快照，2026年10月26日 (This saved selection supplies published fossil records and modern find locations from around the world. It is a limited selection, so its dots cannot show every place dinosaurs lived. / 这份保存的资料提供世界各地已发表的化石记录及今天的发现位置。它只选取部分记录，因此不能显示恐龙曾生活的所有地方。) — https://paleobiodb.org/data1.2/occs/list.csv?datainfo&rowcount&base_name=Dinosauria%5EAves&interval=Triassic,Jurassic,Cretaceous&timerule=overlap&show=coords,loc,strat,ref&limit=2000&order=agespan
- [S66] PBDB contributors · API 1.2 TH/LA/MY regional snapshot, 26 October 2026 / PBDB贡献者 · API 1.2泰寮马区域快照，2026年10月26日 (This saved selection adds fossil records from Thailand, Laos and Malaysia. The public map leaves out Malaysian fossil locations to protect the sites. / 这份保存的资料补充泰国、寮国和马来西亚的化石记录。公开地图不显示马来西亚化石位置，以保护地点。) — https://paleobiodb.org/data1.2/occs/list.csv?datainfo&rowcount&base_name=Dinosauria%5EAves&interval=Triassic,Jurassic,Cretaceous&timerule=overlap&cc=TH,LA,MY&show=coords,loc,strat,ref&limit=5000
- [S67] Atlas editorial and illustration design choices / Atlas编辑与插画设计取值 (Atlas chose the map views, browsing window and details of the illustrations to help explain the topic. These choices are teaching tools, not scientific measurements. / Atlas 为讲解本题而选择了地图视图、浏览范围和插画细节。这些是教学设计，不是科学测量。) (design study / 设计研究)
<!-- sources:end -->
