# 郑和下西洋：来源 / Sources

历史事实索引见 ../FACTS.md；运行时 S01→S1，依此去掉前导零，满足现有 sourceId schema。无逐字引文。

## 地图数据

- **G1 / D01** Natural Earth contributors, 1:10m land, modern cartographic geometry. Public domain / 公有领域。URL: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson . Terms: https://www.naturalearthdata.com/about/terms-of-use/ . Source SHA256 `1ac90796408bc6ad6911d69448485d3c4dbf2190370080368a09976e1c9f7416`.
- **G2 / D02** Natural Earth contributors, 1:10m populated places, public domain / 公有领域。URL: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson . SHA256 `9b8e3de09048ef00dfc70357dbb9fa324493f214b5e0ae4daf1aa79a8d10116b`. 15 selected modern city points copied exactly; no present population/date/border metadata treated as fifteenth-century evidence.
- **G3 / D03** GeoNames, Iran gazetteer, **CC BY 4.0**, https://download.geonames.org/export/dump/IR.zip . Record 131231 (Hormoz): `[56.4529,27.095]`. SHA256 `d4338847ec485215ecde11c0ab197fef7e6abb84be155f40fbdf65452caa64b2`.
- **G4 / D04** GeoNames, Tanzania gazetteer, **CC BY 4.0**, https://download.geonames.org/export/dump/TZ.zip . Record 157382 (Kilwa Kisiwani): `[39.49808,-8.95897]`. SHA256 `fb3cc5ede2af2bee7db31c750d236ed1a3367f610770f276c49c022b3cb69170`.

GeoNames licence and table contract: https://download.geonames.org/export/dump/readme.txt . Credit GeoNames; selected records and added descriptions are identified as changes. Raw databases not shipped. Selection evidence: `scripts/geo/zheng-he/evidence/ports.geojson`, `ports-provenance.json`, `INVENTORY.md`, `download-records.json`. Natural Earth terms state that its raster/vector data are in the public domain; GeoNames readme offers its data under CC BY 4.0. No CC BY-SA geometry or text is incorporated into an NC-SA derived file.

## Nanjing display offsets / 南京记录的显示偏移（2026-10-27）

All `at` coordinates still copy the 17 sourced anchors exactly. `site-nanjing` remains at D02 `[118.778029, 32.051965]`. Nine dated records at that anchor use `displayOffset` in CSS pixels, independent of zoom: radius 96 px, first slot north, clockwise every 40°, rounded to 0.1 px. Slot order is chronological, with equal-year records in the explicit order below. These offsets separate symbols, their click targets and leader anchors; each shifted mark draws a hairline leg back to the Nanjing point; they are not geographic coordinates, departure quays, court buildings, or a route. The background note and prose explain the display convention in both languages. City point and every record can be selected independently; adjacent centres are approximately 65.7 px apart, exceeding the 44 px target width.

南京原始坐标不变；九条有日期记录按半径 96 CSS px 的圆环分开显示，从正北起顺时针每隔 40° 一条，偏移四舍五入至 0.1 px。偏移只区分记录，每个偏移标记画一条细线连回南京点，不代表历史实址。中央城市点不偏移。

| Slot | Record | Offset `[x,y]` px |
|---|---|---|
| 0 | evt-first-voyage | [0.0, -96.0] |
| 1 | evt-third-voyage | [61.7, -73.5] |
| 2 | evt-captives-1411 | [94.5, -16.7] |
| 3 | evt-fourth-voyage | [83.1, 48.0] |
| 4 | evt-giraffe-gift-1414 | [32.8, 90.2] |
| 5 | evt-fifth-voyage | [-32.8, 90.2] |
| 6 | evt-sixth-voyage | [-83.1, 48.0] |
| 7 | evt-seventh-voyage | [-94.5, -16.7] |
| 8 | evt-final-return | [-61.7, -73.5] |

Second-expedition location checked against S1, “The Seven Voyages”, second-expedition paragraph (re-read 27 October 2026): it names Calicut as the destination for a new king’s inauguration and distinguishes Zheng He’s organisation from personal command. `evt-second-voyage.at` remains D02 Calicut `[75.768044, 11.252382]`; its detail and index now explain that association. This is not a known ceremony site or an exact-day ship position. No number of ships was added.

## Control keyframes

| K | 年份 | 控制要素 | 地图、方法与残差 | 检查 |
|---|---|---:|---|---|
| K0 | 1405 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K1 | 1407 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K2 | 1409 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K3 | 1411 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K4 | 1413 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K5 | 1415 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K6 | 1417 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K7 | 1421 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |
| K8 | 1433 | 0 | G1 同一现代海岸；空控制帧，不推测历史疆界；无配准、无残差 | 首尾与中间帧数据一致；静态来源／成品图已看，应用截图待主会话 |

区域 [35,-15,125,37]，外扩 0.25° 防纸框边缘露缝。使用 **准备时实际下载并固定 SHA 的 D01 GeoJSON**；不使用第一轮试跑的 world-atlas 成品。现有 mapshaper：裁切、Douglas–Peucker 500 m、keep-shapes、clean；现有 regionTopology：不二次简化，保留 ≥1 km² 岛环，量化 1,000,000。成品 `public/geo/zheng-he-land.json` 单对象 `zheng-he-land`，只有 land/coast；裁切直边不冒充海岸。

最终 363,634 bytes（355.1 KiB），1,034 多边形／环、31,889 顶点、1,038 coast arcs；`zero-area: 0; self-crossing: 0`。这不是十五世纪海岸重建。城市点非码头、战场中心、登陆或个人行程的证明；尤其加勒是碑发现地、达卡是孟加拉区域参照、泗水是爪哇区域参照、基尔瓦是背景而非确认到访。霍尔木兹保留岛上点，不换成阿巴斯港。

复建（需要原始 D01 文件及现有 geo 工具，不改项目依赖）：

```sh
pnpm tsx scripts/geo/zheng-he/build-land.ts --source <ne-10m-land.geojson>
```

`build-land.ts` 在任何处理前检查精确源 SHA，超过 2 MB 或出现坏环即失败。`region-land.ts` 通用命令读的是 world-atlas，并非本版固定 D01 的复建入口。

静态来源／成品对照：`scripts/geo/zheng-he/evidence/coastline-comparison.png`（概览、海峡、霍尔木兹、锡兰、基尔瓦），已打开检查，首尾和所有空控制帧共用这份海岸。它是离线数据 QA 图，**不是浏览器验收截图**。应用的标签遮挡、手机布局、paper/cinema 和逐拍取景仍须主会话 shoot。

## Movement routes

0 条；没有可用的原始航线文件，禁止人工连港口。

## Numbered sources

<!-- sources:begin (generated by scripts/sources-md.ts from sources.json; edit sources.json) -->
- [S1] Columbia University, Asia for Educators · The Ming Voyages / 明代远航（Columbia University, Asia for Educators） (Preparation dossier read on 27 October 2026. Locator: The Seven Voyages; Preparing the Fleet; The Fateful Decision. Copyright; read and cite only. The old teaching page has overconfident dimensions and chronology/biography simplifications; these are not adopted as settled facts. / 2026 年 10 月 27 日准备档案核读。“七次航行”“准备船队”“决定停航”等节。旧教材的宝船尺寸与个别叙述不作定论。 本题引用事实，另写说明，不复制来源段落或图像。) — https://afe.easia.columbia.edu/special/china_1000ce_mingvoyages.htm
- [S2] Geoff Wade / NUS Asia Research Institute, Working Paper 31 (2004) · The Zheng He Voyages: A Reassessment / 韦德（Geoff Wade）／新加坡国立大学亚洲研究所工作论文第 31 号（2004）·《郑和远航：重新评估》 (Preparation dossier read on 27 October 2026. Locator: printed pp. 3, 13–17, 20–25; PDF pages +1. Copyright; read and cite only. Build rechecked printed pp. 3 and 14–16 against the public PDF: childhood castration, Old Port/Java reported deaths and Sri Lanka captivity. / 2026 年 10 月 27 日准备档案核读。纸页第 3、13—17、20—25 页；PDF 页码比纸页加一。 本题引用事实，另写说明，不复制来源段落或图像。) — https://ari.nus.edu.sg/wp-content/uploads/2018/10/wps04_031.pdf
- [S3] National Library Board Singapore · Bukit Larangan: Early Singapore in Maps, Texts, and Artifacts / 武吉拉让：地图、文字与器物中的早期新加坡（National Library Board Singapore） (Preparation dossier read on 27 October 2026. Locator: Early Singapore Maps; Early Singapore Artefacts. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。地图、文字与福康宁器物的相关段落。 本题引用事实，另写说明，不复制来源段落或图像。) — https://curiocity.nlb.gov.sg/digital-stories/fort-canning-hill/bukit-larangan/
- [S4] The Mariners’ Museum and Park, Ages of Exploration · Zheng He / 郑和（The Mariners’ Museum and Park, Ages of Exploration） (Preparation dossier read on 27 October 2026. Locator: Principal Voyage; Later Years and Death; Legacy. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。“主要航行”“晚年与逝世”“遗产”等节；第二航次年份与 S1 不同，沿用 S1 常用航次范围并明示约定。 本题引用事实，另写说明，不复制来源段落或图像。) — https://exploration.marinersmuseum.org/subject/zheng-he/
- [S5] The Metropolitan Museum of Art · Giraffe with Two Keepers (object 51649) / 长颈鹿与两位饲养者（藏品说明）（The Metropolitan Museum of Art） (Preparation dossier read on 27 October 2026. Locator: Curatorial description; object date Qing dynasty. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。藏品 51649 的说明；1414 年事件与后出清代绘画分开。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.metmuseum.org/art/collection/search/51649
- [S6] UNESCO World Heritage Centre · Ruins of Kilwa Kisiwani and Ruins of Songo Mnara / 基尔瓦基斯瓦尼与松戈马拉遗址（UNESCO World Heritage Centre） (Preparation dossier read on 27 October 2026. Locator: Description; Outstanding Universal Value. CC BY-SA IGO 3.0 for description; no download or adaptation. / 2026 年 10 月 27 日准备档案核读。遗址简介与突出普遍价值。 本题引用事实，另写说明，不复制来源段落或图像。) — https://whc.unesco.org/en/list/144
- [S7] UNESCO World Heritage Centre · Melaka and George Town, Historic Cities of the Straits of Malacca / 马六甲与乔治市：马六甲海峡历史城市（UNESCO World Heritage Centre） (Preparation dossier read on 27 October 2026. Locator: Description; Outstanding Universal Value. CC BY-SA IGO 3.0 for description; no download or adaptation. / 2026 年 10 月 27 日准备档案核读。历史城市简介与突出普遍价值。 本题引用事实，另写说明，不复制来源段落或图像。) — https://whc.unesco.org/en/list/1223/
- [S8] Asian Civilisations Museum / NHB Singapore · Tang Shipwreck / 唐代沉船（Asian Civilisations Museum / NHB Singapore） (Preparation dossier read on 27 October 2026. Locator: About the gallery. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。展厅介绍；九世纪沉船与长距离交换。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.nhb.gov.sg/acm/galleries/maritime-trade/tang-shipwreck
- [S9] Kan Shuyi, ACM / NHB Roots · Sunken Treasure: A Ninth Century Shipwreck / 沉没的宝藏：九世纪沉船（Kan Shuyi, ACM / NHB Roots） (Preparation dossier read on 27 October 2026. Locator: Ship construction; uncertain departure port. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。船体建造及最后出发港的不确定性。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.roots.gov.sg/stories-landing/stories/sunken-treasure-a-ninth-century-shipwreck/story
- [S10] Sally K. Church, Monumenta Serica 53 (2005), 1–43 · Zheng He: An Investigation into the Plausibility of 450-ft Treasure Ships / 郑和：四百五十英尺宝船的可行性研究（Sally K. Church, Monumenta Serica 53 (2005), 1–43） (Preparation dossier read on 27 October 2026. Locator: Author-uploaded public text: opening; Xin Yuan’ou’s engineering arguments; conclusion; DOI 10.1179/mon.2005.53.1.001. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。作者公开上传文本：开篇、工程反对论点及结论。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.researchgate.net/publication/261905911_ZHENG_HE_AN_INVESTIGATION_INTO_THE_PLAUSIBILITY_OF_450-FT_TREASURE_SHIPS
- [S11] American Historical Association · Frederic Wakeman Jr., presidential address / Wakeman 学会主席演说（American Historical Association） (Preparation dossier read on 27 October 2026. Locator: notes 45–46: Needham, liao, rudder evidence. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。注 45—46：船容量单位与舵杆论据。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.historians.org/presidential-address/frederic-wakeman-jr/
- [S12] 万明 / 中国社会科学院（中国社会科学报，2019-12-02） · 郑和下西洋七至满剌加 / 郑和下西洋七至满剌加（万明 / 中国社会科学院（中国社会科学报，2019-12-02）） (Preparation dossier read on 27 October 2026. Locator: 时间上存在可能性; 1403 尹庆; 五次/七次争论. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。讨论时间可能性、尹庆出使与五次／七次争论。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.cass.cn/xueshuchengguo/xscg_lsyjy/201912/t20191202_5051930.shtml
- [S13] Sri Lanka National Commission for UNESCO · Trilingual Inscription / 三语碑（Sri Lanka National Commission for UNESCO） (Preparation dossier read on 27 October 2026. Locator: Memory of the World item description. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。世界记忆项目说明：碑上语言。 本题引用事实，另写说明，不复制来源段落或图像。) — https://slncu.lk/partnerships-networks/mow/trilingual-inscription/
- [S14] Siddham, The Asian Inscription Database · IN03152 Galle Trilingual Stele – Chinese Inscription / 加勒三语碑：中文碑文（Siddham, The Asian Inscription Database） (Preparation dossier read on 27 October 2026. Locator: Metadata; Chinese text, Tamil and Persian positions. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。碑文元数据与中文部分；碑文日期和安装日期分开。 本题引用事实，另写说明，不复制来源段落或图像。) — https://siddham.network/inscription/in03152/?section=metadata
- [S15] Meteorological Service Singapore · Climate of Singapore / 新加坡的气候（Meteorological Service Singapore） (Preparation dossier read on 27 October 2026. Locator: Seasons; Surface Wind; 1991–2020 station climatology. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。季节与地面风；1991—2020 年现代气候平均，不作为明代观测。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.weather.gov.sg/climate-climate-of-singapore
- [S16] Meteorological Service Singapore · Winds / 风（Meteorological Service Singapore） (Preparation dossier read on 27 October 2026. Locator: Tropical Monsoon. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。热带季风机制说明。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.weather.gov.sg/learn_winds/
- [S17] Keith C. Barton / American Historical Association (2004) · Research on Students’ Historical Thinking and Learning / 学生历史思考与学习研究（Keith C. Barton / American Historical Association (2004)） (Preparation dossier read on 27 October 2026. Locator: Individual agency; overnarrativisation; historical evidence. Copyright; read and cite only. Background editorial/reference source; not voyage-level evidence. / 2026 年 10 月 27 日准备档案核读。个体能动性、叙述与历史证据；仅作编辑依据。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.historians.org/perspectives-article/research-on-students-historical-thinking-and-learning-october-2004/
- [S18] Ofsted / UK Department for Education (2021) · Research review series: history / 历史学科研究综述（Ofsted / UK Department for Education (2021)） (Preparation dossier read on 27 October 2026. Locator: Interpretations; misconceptions; contingency. Open Government Licence v3.0. Background editorial/reference source; not voyage-level evidence. / 2026 年 10 月 27 日准备档案核读。历史解释、误解与偶然性；仅作编辑依据。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.gov.uk/government/publications/research-review-series-history/research-review-series-history
- [S19] Ministry of Education Singapore · 2020 Social Studies Primary Teaching and Learning Syllabus, updated January 2024 / 小学社会科教学大纲（2024 年更新）（Ministry of Education Singapore） (Preparation dossier read on 27 October 2026. Locator: printed pp. 39, 41–42; PDF pp. 40, 42–43. Copyright; read and cite only. Background editorial/reference source; not voyage-level evidence. / 2026 年 10 月 27 日准备档案核读。纸页第 39、41—42 页；课纲接口，不把郑和远航称作课纲考试单元。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.moe.gov.sg/media/files/primary/d8ea4817-c1b3-4217-84d4-82838d39d75c.pdf
- [S20] Ministry of Education Singapore · 2023 Primary Science Syllabus (local January 2026 copy) / 小学科学教学大纲（Ministry of Education Singapore） (Preparation dossier read on 27 October 2026. Locator: printed p. 62; PDF p. 63. Copyright; read and cite only. Background editorial/reference source; not voyage-level evidence. / 2026 年 10 月 27 日准备档案核读。纸页第 62 页：磁铁指南北；仅作课纲接口。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.moe.gov.sg/-/media/files/primary/syllabus/primary-science-syllabus-2023_may24.pdf
- [S21] Vmenkov, based on Historicair’s Asie.svg / Wikimedia Commons · File:Ming-Expeditions.svg / 明代远航地图：文件说明（Vmenkov, based on Historicair’s Asie.svg / Wikimedia Commons） (Preparation dossier read on 27 October 2026. Locator: Summary and Licensing; main fleet versus possible Hong Bao route. Choose offered CC BY 1.0, not its alternative CC BY-SA/GFDL licence. Original SVG download returned HTTP 403; no route geometry derived. / 2026 年 10 月 27 日准备档案核读。文件简介、许可与主队／可能支队的区分；未取得 SVG 原图，不派生路线。 本题引用事实，另写说明，不复制来源段落或图像。) — https://commons.wikimedia.org/wiki/File:Ming-Expeditions.svg
- [S22] Natural Earth contributors · Natural Earth Terms of Use / Natural Earth 使用条款（Natural Earth contributors） (Preparation dossier read on 27 October 2026. Locator: Terms of Use. Public domain. / 2026 年 10 月 27 日准备档案核读。使用条款：Natural Earth 地图数据属公有领域。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.naturalearthdata.com/about/terms-of-use/
- [S23] GeoNames · GeoNames Gazetteer extract readme / GeoNames 地名数据说明（GeoNames） (Preparation dossier read on 27 October 2026. Locator: Licence and geoname table columns. CC BY 4.0. / 2026 年 10 月 27 日准备档案核读。地名记录字段与 CC BY 4.0 许可；本题选霍尔木兹及基尔瓦记录。 本题引用事实，另写说明，不复制来源段落或图像。) — https://download.geonames.org/export/dump/readme.txt
- [S24] Wikimedia Foundation / Wikidata contributors · Wikidata:Licensing / 维基数据许可（Wikimedia Foundation / Wikidata contributors） (Preparation dossier read on 27 October 2026. Locator: Official policy. CC0 structured data; page prose CC BY-SA 4.0. Background editorial/reference source; not voyage-level evidence. / 2026 年 10 月 27 日准备档案核读。许可政策；候选参考，未派生本题地图。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.wikidata.org/wiki/Wikidata:Licensing
- [S25] Channel Islands Maritime Museum volunteer education page · Admiral Zheng He and the Chinese Treasure Fleet / 郑和与中国宝船队（教育页）（Channel Islands Maritime Museum volunteer education page） (Preparation dossier read on 27 October 2026. Locator: Size of the ships; uncertain reconstructions. Copyright; read and cite only. Background editorial/reference source; not voyage-level evidence. / 2026 年 10 月 27 日准备档案核读。船只规模讨论；参考目录，不作为确定尺寸的依据。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.education.maritime-museum.org/training/north-gallery-2/asian-history/admiral-zheng-he-and-the-chinese-treasure-fleet/
- [S26] Tanzania Wildlife Management Authority · RUINS OF KILWA AND SONGО MNARA / 基尔瓦与松戈马拉遗址（Tanzania Wildlife Management Authority） (Preparation dossier read on 27 October 2026. Locator: Cultural Heritage Sites; Swahili coastal culture. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。文化遗址与斯瓦希里沿海贸易。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.tawa.go.tz/attraction-details/ruins-kilwa-and-songo-mnara-world-heritage-site
- [S27] UNESCO World Heritage Centre · 基尔瓦基斯瓦尼遗址和松戈马拉遗址 / 基尔瓦遗址（中文简介）（UNESCO World Heritage Centre） (Preparation dossier read on 27 October 2026. Locator: 中文简介. CC BY-SA IGO 3.0; terminology reference only. Background editorial/reference source; not voyage-level evidence. / 2026 年 10 月 27 日准备档案核读。基尔瓦中文简介；仅作译名参考。 本题引用事实，另写说明，不复制来源段落或图像。) — https://whc.unesco.org/zh/list/144
- [S28] Gakusho Nakajima, Socio-Economic History 76(4), 501–524 (2011) · Transformation and reorganization of the international trade order in East Asia from the 14th to 16th century / 十四至十六世纪东亚国际贸易秩序的转变与重组（Gakusho Nakajima, Socio-Economic History 76(4), 501–524 (2011)） (Preparation dossier read on 27 October 2026. Locator: Author abstract; DOI 10.20624/sehs.76.4_501. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。作者摘要；讨论十四至十六世纪贸易秩序变化，不提供连续贸易总量。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.jstage.jst.go.jp/article/sehs/76/4/76_KJ00007943782/_article/-char/en
- [S29] Columbia University, Asia for Educators · China’s Ming Voyages: teaching guide / 中国明代远航：教学提纲（Columbia University, Asia for Educators） (Preparation dossier read on 27 October 2026. Locator: Outline III–IV, 23:00 and 42:00; source contains apparent transcription errors, do not use chronology in vocabulary box. Copyright; read and cite only. / 2026 年 10 月 27 日准备档案核读。提纲第 III—IV 部分及 23:00、42:00；存在转录错误，不采用词表里的错误纪年。 本题引用事实，另写说明，不复制来源段落或图像。) — https://video.afe.easia.columbia.edu/teaching-guides/the-ming-maritime-expedititons-zheng-he-teaching-guide/
- [S30] Wang Gungwu / ISEAS–Yusof Ishak Institute, in Admiral Zheng He and Southeast Asia (2005), pp. 1–25 · The Opening of Relations between China and Malacca, 1403–05 / 中国与马六甲关系的开端（1403—1405）（Wang Gungwu / ISEAS–Yusof Ishak Institute, in Admiral Zheng He and Southeast Asia (2005), pp. 1–25） (Preparation dossier read on 27 October 2026. Locator: Public chapter summary, paragraphs 1–4; full chapter gated and not accessed. Copyright; public summary read and cited only. Public summary only; full chapter gated and not read. / 2026 年 10 月 27 日准备档案核读。只读公开章节摘要的前四段；未读受限全文。 本题引用事实，另写说明，不复制来源段落或图像。) — https://www.cambridge.org/core/books/abs/admiral-zheng-he-and-southeast-asia/opening-of-relations-between-china-and-malacca-140305/E65EFF1BD3DCEA4AB517D8DA201ABE66
<!-- sources:end -->
