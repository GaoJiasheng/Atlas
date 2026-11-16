# 83 · 新加坡的海岸线：从 1819 年到今天的填海 · 内容施工 spec（v1 草案）

TimeScene / GeoStage，paper 默认、cinema 可切。按 skill `atlas-history-topic` 的 `spec-template.md` 写；岛尺度底图与年代岛岸**照 docs/24（`four-taps`，C1 岛尺度底图）、docs/28（`singapore-1819-1965`，L0–L5 旧地图配准岛岸）、docs/34（`singapore-land-use`，L5–L11 Landsat 岛岸、E1 `datedLayers`）**，本文只写新增的部分（§3.0 列"沿用 / 新做"）。**§0 由起草者按 Gavin 惯例给默认值（§0.1），未经 Gavin 定稿不展开正文。** 本文起草时只读网页、未下载任何文件；§3.2 每个要下载的数据集写了 URL、大小、许可，等 Gavin 批准。

- slug：`singapore-reclamation`；标题 EN "Singapore's Moving Coastline" / ZH "新加坡的海岸线：填海两百年"；副标题 EN "How and why the island grew into the sea, 1819–today" / ZH "这座岛怎样、为什么向海里长大（1819 年至今）"；`shortTitle` EN "Reclamation" / ZH "填海"。
- 课纲：MOE 2020 SS P3 "Changes in land use to meet our needs"（docs/34 §1.1 原文；docs/17 §5 表"新加坡填海 1819 → 今天"一行，C1 之后的 M 级）。`levels: [P3]` 只是规划元数据，界面不出现年级。`subject: geography`，`tags: [singapore, geography, map]`，`sensitivity: open`，`status: draft`。
- **和四个已发布主题的分工（不重讲）**：
  - `singapore-1819-1965`：开埠、城区规划与 1822 年河南岸填土、直落亚逸填海的**历史背景**在第 02、05 章；本题只讲"土从哪来、海岸怎么变"，事件 `boat-quay-fill`、`telok-ayer-reclamation` **逐字节复制**。
  - `singapore-land-use`：第 05 章 `more-land` 已有填海一段（东海岸 1966、裕廊岛 1993–2003、陆地面积 581.5 → 735.7、沙两种看法）；本题是它的**展开**，事件 `east-coast-reclamation`、`marina-bay-reclamation`、`jurong-island-opens`、`tuas-reclamation`、`changi-airport-opens` 逐字节复制，名词 `land-reclamation` 定义逐字相同；正文用 `<TopicLink slug="singapore-land-use" ch="more-land">` 链过去，不重写组屋、地铁、往地下 / 往高处。
  - `singapore-after-1965`：独立后的政治、外交不讲；与邻国的关系只在第 04 章讲**沙与填海**这一件事，链 `ch="neighbours"`。
  - `container-port`：大士港的作业、TEU、开港日期不讲，第 03、05 章各一句链 `ch="the-tuas-transition"`。
  - 另链：`four-taps` `ch="a-reservoir-in-the-city"`（滨海湾是填海围出来的蓄水池）、`mangrove-food-web` `ch="human-impact-and-evidence"`、`coral-reef` `ch="bleaching-and-pressures"`、`monsoon-and-weather` `ch="averages-and-change"`（海平面上升只在本题第 06 章讲）。
- **调查结论**（2026-11-16，本文起草时读网页；`[✓]` = 当天读到原文，`[✓继]` = 继承其它主题 `sources.json` 已核的条目，`〔待核〕` = R 步要补读原文）：
  1. **陆地面积有官方逐年数**：data.gov.sg "Land Area (As At December), Annual"（SODL）1960–2025 每年一个数，1960 年 581.5 km²、2025 年 **744.3 km²**（2024 年 735.7）[✓]。2002 年起口径改变（docs/34 F15）。
  2. **项目史有一篇可靠总述**：NLB BiblioAsia《Land From Sand》（Lim Tin Seng 2017）给了殖民时期约 300 公顷、1965–2015 年 13,800 公顷、东海岸七期 1,525 公顷、各机构分项面积 [✓，本题 S10]。
  3. **今天这一端的海岸有五个官方年份**：URA 总蓝图 1998 / 2008 / 2014 / 2019 / 2025 的 "Planning Area Boundary (No Sea)" 都在 data.gov.sg（SODL）[✓ 目录已查]；MP2025 于 2025-12-01 宪报公布 [✓]。
  4. **1973–2019 年的海岸 land-use 已做好**（Landsat，公有领域，`land-sg-modern.json` L5–L11，7 段，没有变动的海岸上 p50 19–49 m、p95 113–268 m）[✓ 读 `coast-statistics.json`]；**1819–1961 年的海岸 1819–1965 已做好**（公有领域旧地图配准，`land-sg-history.json` L0–L5），但它自己的 SOURCES-GEO 仍写"rejected research drafts / acceptance incomplete"（残差预算、控制点分布未过），离岛没画（§3.6）。
  5. **公开的、许可干净的"新加坡填海史"GIS 不存在**：学术与新闻地图（Glaser 1991、Wong 1992、Hesp 1995、De Koninck 2017《Fifty Years in Fifty Maps》、Kontinentalist 2023、URA LTPR 图、NLB 文章附图）都有版权或未声明许可，只能看不能描。Commons 和英文维基"Land reclamation in Singapore"条目里**没有**填海分期图（2026-11-16 用 API 查过）。全球数据里有一份能用作独立核对：Zhang（2024）*Global dynamics of coastal reclamation…*，figshare，**CC BY 4.0**，1985–2020 年 30 m 逐年"变成陆地的年份"栅格 [✓ 元数据]。
  6. **红树林有开放数据**：Global Mangrove Watch v3.0（Bunting et al. 2022，Zenodo，**CC BY 4.0**，1996–2020）[✓ 元数据]；1953 年的红树林面积只有论文里的数字（Hilton & Manning 1995），图有版权。
  7. **引擎**：不需要新底图种类、新图层种类。年代岛岸（`basemap.local` 的 dated `land`）、今天海岸虚线、`datedLayers`（点 / 线 / 面按年份出现）、空控制帧、`milestone`、`site`、`TopicLink ch` 都已有。只建议两个小扩展（§4）：E-RC1 面图层的 PLATE **面积合计**、E-RC2 PLATE **逐年读数**（docs/34 E5 当时没做）。都不做也能发布（Plan B：数字只进正文与细看表格）。

---

## 0. 决策（2026-11-16 起草，默认值见 §0.1）

| # | 决定（建议） | 选项 / 理由 | 定稿 |
|---|---|---|---|
| 1 | **章数**：背景章 00 + 6 章，共 29 拍（§2）。时间轴 1819-02-06（K1 空帧）到 2026-08-31（K2 空帧，收进 2026-08-23 国庆群众大会宣布"西部岛"）。主线：殖民时期削山填岸 → 为住屋填东海岸 → 为机场、工业、港口填海 → 沙从哪里来 → 圩田（新方法）→ 代价与海平面上升 | 另一选项 00 + 4（把沙和圩田并进代价章）。不建议：沙的来源是本题争议最大、最需要两边写的一块，单独一章才写得下；圩田是 2025 年完成的新做法，是"适应"这条课纲线的结尾 | 待定 |
| 2 | **一个本题自己的年代岛岸文件** `public/geo/land-sg-reclaim.json`，13 段：L0–L5 解码自 `land-sg-history.json`（**今天的版本**，2026-11-09 重新配准过），L6–L11 解码自 `land-sg-modern.json`，**新做 L12**（2025-12-01 起）= MP2025 陆地 ∩ 2025 年 Landsat 9 影像上的陆地（§3.3）。两个来源文件**不改** | 另一选项：直接用 `land-sg-modern`（只到 2019，没有德光岛圩田和大士港）。不建议：本题的结尾就是圩田 | 待定 |
| 3 | **1973 年以前的离岛**：`land-sg-history` 的 L0–L4 没有乌敏岛、德光岛、南部诸岛，若照用，乌敏岛会在 1961 / 1973 年"冒出来"，在填海主题里会被读成填海。L0–L5 一律补上 1973 年 Landsat 的离岛轮廓（land-use `historic-islands.py` 的同一规则：不碰本岛、≥ 0.02 km²），标 `certainty: approximate`，阅读说明写"1973 年以前的离岛用 1973 年的轮廓" | 另一选项：从 1941 年 AMS 图（docs/28 G11）描离岛。可作后续扩展，本轮不做（G11 的残差未过预算） | 待定 |
| 4 | **"新填的地"按时期上色，只画对得上工程的块**：相邻两段岛岸相减得到新陆地块，丢掉 < 0.1 km² 的碎块；**每块要对上一个有来源的工程**（§3.4 工程表）才画进按时期的面图层；对不上的块（潮位、像元、两种来源图的高水位线约定不同造成的假变化）只留在岛岸里，不上色，列进报告由主会话看图决定 | 不对就不画是硬规则的延伸：只有日期、没有工程的"新陆地"不能当填海讲 | 待定 |
| 5 | **四个时期**（面图层颜色手工固定）：`added-1822-1964`（殖民与自治时期）`token:holder-2`、`added-1965-1989` `token:holder-3`、`added-1990-2009` `token:holder-4`、`added-2010-2025` `token:holder-5`；外加一条线图层 `shore-1819`（L0 的海岸线，`token:ink-2`，标"约 1819 年的海岸（近似）"）。今天海岸虚线照常 | 不用控制区画新地：控制区在两帧之间交叉淡化，新地会在影像日期**之前**就淡入（docs/34 §3.2 同理） | 待定 |
| 6 | **红树林**：只画 Global Mangrove Watch 2020 年的范围（`mangroves-2020`，`f = 2020`，`token:holder-6`，标"2020 年卫星测出的红树林"）；1953 年的面积（Hilton & Manning 1995）只写数字，不画 | 另一选项：再加 GMW 1996 层看 1996–2020 的变化。新加坡在这段时间变化小，加了反而误导"损失发生在 1996 年以后"；不建议 | 待定 |
| 7 | **珊瑚礁、海草床不画**：没有许可干净的历史分布图；数字写正文（Chou 2008 经 Yaakub et al. 2014 转引的约 60%、Hilton & Manning 1995 的潮间带礁坪 24% 剩余），标谁的估计、哪年 | | 待定 |
| 8 | **不画沙的来源**：不画运沙航线、不在邻国标点；各国出口限制写成第 04 章细看里的年表（每条带来源），地图只在新加坡一侧画"土从哪座山来"（`site`，坐标取 Wikidata，CC0） | 运沙路线没有真实数据；在别国国土上落"禁令"标记会把一国政策钉在某个点上 | 待定 |
| 9 | **未来项目只写不画**："长岛"（Long Island，约 800 公顷，规划研究中）、"西部岛"（2026 年 8 月宣布，没有边界）、2030 年的面积目标都只在第 06 章正文 / 细看用文字写，写"计划""研究中"。地图到 L12（2025）为止 | 同 docs/34 §0-11、docs/62 D0-5 | 待定 |
| 10 | **许可**：发布的几何只来自公有领域（旧地图、Landsat）、SODL（URA、data.gov.sg）、CC BY 4.0（GMW；Zhang 只作核对）、CC0（Wikidata）。**CC BY-SA 的东西不进任何发布文件**（例：Commons 上 1893 年海军部海图 No 2023 的扫描件标了 CC BY-SA 4.0，只看不描），因为本站内容按 CC BY-NC-SA 4.0 发布，两者不能合在一个文件里；OSM（ODbL）不用于几何 | §3.5 | 待定 |
| 11 | **口吻**：不写成"向大海要地"的成功故事，也不写成控诉。好处（住屋、机场、工业、港口、海岸防护）与代价（红树林、珊瑚礁、海草床、渔村迁移、沙的来源争议、费用）同一套写法，按来源写谁说的 | §1.2 | 待定 |
| 12 | **精度**：日期到天（有来源时），工程只知年份的写年；面积写来源给的单位（公顷 / 英亩 / km²），换算写"约"；地图上量出的面积**不**当官方面积用，只在细看里和官方数并排看趋势 | | 待定 |
| 13 | **不做**：测验、配音、视频、真实人物肖像、公司品牌（承包商名不进正文）、3D | | 待定 |

### 0.1 默认值（Gavin 不改就照做）

1. §0 全部按建议：00 + 6 章、29 拍；本题自己的 13 段岛岸文件（新做的只有 L12 和 L0–L5 的离岛补丁）；新地按四个时期上色、只画对得上工程的块；红树林只画 GMW 2020；珊瑚礁、沙的来源、未来项目都不画。
2. **下载清单（§3.2）**：D1–D4、D6、D8 默认要下（合计约 100 MB，其中 Landsat 只取新加坡窗口约 20 MB）；D5（Zhang，42 MB）、D7（1969 年海图，32 MB）是核对用，默认也下；D9（CORONA 1960 年代卫星照片）要 EarthExplorer 账户，默认**不做**。
3. **引擎**（Opus）：E-RC1、E-RC2 建议做（都小）；不做就走 Plan B。
4. **施工外包**：Codex 做补充研究（所有〔待核〕）、管线、工程表、英文初稿、图像草稿；Opus 做史学 / 客观性复核；中文由 Claude 独立成文；Sonnet 节拍与 QA。
5. **Gavin 亲审的中文**：第 04 章（沙）全章与细看、第 06 章的红树林 / 珊瑚礁 / 南部岛民迁移段、第 03 章的马来西亚诉新加坡（国际海洋法法庭）一块。

---

## 1. 范围、立场、必须讲对的事实

### 1.1 范围与读者

- 时段：1819 年至今（2026 年 8 月），重点 1960 年代以后。地域：新加坡本岛与离岛；柔佛、廖内群岛只作底图，不着色、不标点。
- 读者：P3 学生和家长。每章正文 EN 180–260 词 / ZH 320–460 字，3–4 段，细看 2–3 块（同 docs/34）。句子短，每段一个最需要的数字。
- 课纲对应：P3 "We adapt to overcome challenges to meet our needs" · "Changes in land use to meet our needs"（docs/34 §1.1 已抄原文）。本题回答三个孩子会问的问题：岛变大了多少？土和沙从哪里来？填海有什么代价、将来怎么办？

### 1.2 立场与口吻（最高优先级）

- 不写"向大海要地""变不可能为可能""征服大海""奇迹""我们 / 我国"。写"政府""建屋发展局（建屋局）""裕廊镇管理局""港务局""公用事业局""居民""渔民"，写谁做了什么、为什么、谁得到什么、谁失去什么。
- **沙的来源两边写**（§6 详列）：批评方（联合国环境署的统计、全球见证、柬埔寨环保团体、印尼环保团体）与新加坡政府的回应（国家发展部、外交部）并列，按来源写"某某说"；不替任何一方下结论；邻国政府的决定写决定本身和它自己说的理由。
- **代价不是脚注**：红树林、珊瑚礁、海草床、南部岛屿上的村子搬迁，与好处写在同一章的正文里（第 06 章），不是只放细看。
- **地图上的新地不是工程的完工日**：每段海岸是某一天的卫星影像或某一年的地图；字幕写"这张 1979 年 10 月的影像上……"，不写"1979 年完工"。
- **未来是计划**：长岛、西部岛、2030 年面积都写"计划 / 研究中 / 宣布"，不画。

用词表（施工时逐条查）：

| 不写 | 写 | 说明 |
|---|---|---|
| 向大海要地、征服大海、与海争地 | 填海：用沙土把浅海或沼泽填成陆地 | 名词 `land-reclamation` |
| 新加坡买光了邻国的沙 / 偷沙 | 新加坡从邻国进口沙；某组织指出……；新加坡政府回应…… | 每一句都要有出处 |
| 非法沙 | 被指控违反出口禁令的沙（按来源） | 只在来源这样说时用，写明是谁的指控 |
| 印尼的岛被挖没了 | 联合国环境署的报告说，印尼有一些小岛因挖沙消失 | 原文〔待核〕，不写成全部因为新加坡 |
| 马来西亚抗议 / 告新加坡 | 2003 年马来西亚把新加坡在柔佛海峡的填海提交国际海洋法法庭；2005 年两国签订和解协议 | §1.3 F24 |
| 红树林被消灭 / 破坏殆尽 | 1953 年约 63 平方公里的红树林，到 1993 年只剩约 6.5%（按 Hilton & Manning 1995） | 写清基准年和谁的估计 |
| 海平面上升会淹没新加坡 | 到 2100 年，新加坡附近的平均海平面可能上升 0.23 到 1.15 米（第三次气候变化研究） | 区间两端都写，写明取决于排放 |
| 填海让新加坡变大四分之一 | 1960 年底 581.5 km²，2025 年底 744.3 km²，多了约 28%（官方数，2002 年改过算法） | 正文只用这一对数 |
| 原住民 / 土著（泛指岛民） | 南部岛屿上的马来村民（按来源用 Orang Pulau / Orang Laut 时加说明） | §6-5 |

### 1.3 必须讲对的事实

状态：`[✓]` 2026-11-16 读到原文（URL 见 §7）；`[✓继]` 继承其它主题已核的 `sources.json` 条目（编号写原主题的）；`〔待核〕` R 步补读原文，读不到写"未能核实"，正文不用。

| # | 事实 | 写法 | 来源 | 状态 | 注意 |
|---|---|---|---|---|---|
| F1 | **官方陆地面积** | 1960 年底 581.5 km²；1980 年 617.8；2000 年 682.7；2024 年 735.7；**2025 年 744.3**；1960 → 2025 多 162.8 km²（约 28%） | S1 data.gov.sg Land Area | [✓]（今天读 API，2025 列 744.3） | 2002 年起口径改变（land-use S200 原文）；正文写"约四分之一多"不如写两端的数 |
| F2 | **殖民时期填了多少** | 1822 年起到 1960 年代以前约 300 公顷（3 km²） | S10 NLB *Land From Sand* | [✓] | NLB 文中 1822 年前后的全岛面积写作 578 km²，图注写 58,150 公顷（≈ 581.5），两数不一致：正文不用 578 |
| F3 | **1822–23 年河南岸** | 一座小山被削平（今莱佛士坊），土填河南岸沼泽，驳船码头建在上面；约 300 名苦力、约四个月 | 1819–1965 `boat-quay-fill`（S2、S291）；S10 | [✓继][✓] | 事件逐字节复制 |
| F4 | **哥烈码头** | 1859–1864 年从约翰斯顿码头到旧直落亚逸巴刹一段 | S10 | [✓] | 只在细看年表 |
| F5 | **直落亚逸填海** | 1879 年开始，约 42 英亩；一说 1890 年完工、一说 1897 年；土来自削平的华利山（Mount Wallich）等小山；罗敏申路、安顺路建在新地上 | 1819–1965 `telok-ayer-reclamation`（S76、S306、S368）；S10 | [✓继] | 两个完工年都写 |
| F6 | **直落亚逸湾（Telok Ayer Basin）** | 1902 年计划、1904 年修订 88 英亩；1910 年海堤下沉，65 英亩已填；1930 年复工、1932 年完成；费用从 250 万增到 1,500 万海峡元 | S10 | [✓] | 细看"一道海堤沉下去"可以讲：新填的地要等它沉实 |
| F7 | **加冷盆地与加冷机场** | 1931 年计划（339 英亩、900 万海峡元）；1932 年 5 月开始填、1936 年 10 月完成；1937 年 6 月机场启用 | S10；1819–1965 / land-use 的加冷机场事件〔待核：是否有现成 id〕 | [✓] | L4 岛岸自 1937-01-01（docs/28）——字幕写"1937 年的地图上" |
| F8 | **1963 年试点与加冷盆地（独立前后）** | 1963 年建屋局在勿洛试填 48 英亩；1963 年起加冷盆地约 400 公顷，土来自大巴窑，1971 年完成 | S10 | [✓] | 这段在 L5（1961）与 L6（1973）之间，地图要到 1973 年才看得到 |
| F9 | **东海岸填海** | 1966 年开始，七期、约 30 年、共 1,525 公顷；第一、二期（1966–1971）458 公顷、9 公里海滩；第三期 67、第四期 486 公顷（1971–1975）；第五期直落亚逸盆地 34 公顷（1974–1977）；第六、七期（1979 起）滨海东、滨海南；费用 6.13 亿元；土来自实乞纳平原和勿洛、淡滨尼的山；东海岸公园 185 公顷 | S10；land-use S207 | [✓] | 事件 `east-coast-reclamation` 复制（land-use）；新增分期写细看表 |
| F10 | **滨海湾** | 滨海中心、滨海城 / 滨海湾共约 660 公顷；1990–1992 年 38 公顷滨水步道；滨海堤坝 2008 年启用，围出的海湾成为蓄水池 | S10；four-taps / land-use S31 | [✓][✓继] | 链 four-taps |
| F11 | **裕廊与大士** | 1963 年裕廊工业用地 46 公顷；1970 年代裕廊与大士填了 2,000 多公顷；1980 年代末大士再扩 650 公顷 | S10 | [✓] | `tuas-reclamation` 复制（land-use），本题加 `jurong-reclamation-1963` |
| F12 | **樟宜机场** | 1975 年起樟宜填海 745 公顷（NLB）；1981 年 7 月 1 日启用；机场用地 1,663 公顷中 707 公顷是填海（1981-12-29 开幕演讲）；另有 NLB 文章写 870 公顷 | S10；land-use S151、S222 | [✓][✓继] | 三个数并列，不选；`changi-airport-opens` 复制 |
| F13 | **樟宜东** | 1992–2004 年五期；1998 年计划樟宜东 2,000 多公顷（820 公顷航站楼与跑道、125 公顷海军基地、639 公顷工业） | S10 | [✓] | 第五搭客大厦不讲（未建成） |
| F14 | **德光岛（1981–1985）** | 540 公顷；填料来自樟宜和邻国 | S10 | [✓] | 2000 年再批准 3,310 公顷，并入德光岛小岛（S10）——与 F25 圩田的关系〔待核〕 |
| F15 | **港口填海** | 1967 年吉宝港 23 公顷，1971 年第一个集装箱码头三泊位启用；1972–1979 年巴西班让 61 英亩；1993–1999 年巴西班让一、二期；大士港 2021 年 12 月首两个泊位作业、2022 年 9 月正式开港 | S10；container-port F10–F11 | [✓][✓继] | 港口作业链 container-port |
| F16 | **建屋局的其它填海** | 金文泰 89 公顷（1976–78）、白沙 44 公顷（1979–80）、榜鹅 277 公顷（1983–86）、东北海岸 685 公顷（1985–2001，含榜鹅与科尼岛 155 公顷）；1965–2015 年建屋局共 3,869 公顷，约占总数三分之一 | S10 | [✓] | 细看表 |
| F17 | **裕廊岛** | 1993 年起把七个小岛连成一个岛，分四个阶段；2000 年 10 月 14 日正式开幕；2003 年完成；约 3,000 公顷（NLB）/ 约 3,200 公顷（JTC〔待核〕）；费用约 60 亿元 | S10；land-use S208 | [✓][✓继] | 七个岛的名字（亚逸查湾、亚逸美宝、美利茂、北实巴、北实巴小岛、沙克拉、士拉耶〔待核写法〕）写细看；`jurong-island-opens` 复制 |
| F18 | **1965–2015 年合计** | 约 13,800 公顷（138 km²） | S10 | [✓] | 与 F1 的 1965→2015（581.5→719.1 = 137.6 km²）一致，细看可以并排 |
| F19 | **实马高垃圾埋置场** | 1999 年启用；在实马高岛与锡京岛之间筑约 7 公里的海堤围出〔待核：面积约 350 公顷〕 | NEA〔待核〕；land-use coast-statistics 引过 NEA 页 | 〔待核〕 | 填海用的是"围堤 + 灰渣"，不是沙：细看一句 |
| F20 | **沙的进口量** | 联合国环境署 2014 年：新加坡 20 年内进口约 5.17 亿吨沙，是世界最大的进口国，人均用量最高（5.4 吨 / 人） | S20 UNEP GEAS 2014 | [✓]（经 UNEP-GRID PDF 摘要）〔待核：读 PDF 原文与年份范围〕 | 写"据联合国环境署估计"；2019 年 UNEP 报告说新加坡申报的进口比四个邻国申报的出口少约 1.2 亿吨（S21〔待核原文〕） |
| F21 | **邻国的出口限制（年表）** | 马来西亚 1997 年停止向新加坡卖沙〔待核：官方来源〕；印尼 2002 年 2 月暂停、2003 年 2 月禁止海沙出口（外交部 2007 年国会答复）；印尼 2007 年禁止陆沙出口（同上：影响建筑业、不影响填海）；柬埔寨 2016 年 11 月暂停、2017 年 7 月 10 日禁止戈公省出口建筑沙与泥沙〔待核：部令原文〕；印尼 2023 年 5 月 15 日第 26/2023 号条例重新允许出口"海洋沉积物"，2024 年颁布实施细则，2025 年最高法院撤销其中三条〔待核〕；越南〔待核〕 | land-use S209；S22–S26 | 部分 [✓继]，其余〔待核〕 | 只写决定与各国政府自己说的理由；不写"因为新加坡" |
| F22 | **沙的争议（两边）** | 2010 年全球见证报告《流动的沙》说新加坡对柬埔寨沙的需求造成当地环境破坏，含野生动物保护区内挖沙；国家发展部：沙由私人公司按商业方式进口，政府查核来源，柬埔寨的须附执照文件；2016 年柬埔寨出口记录与新加坡进口记录对不上（报道）〔待核〕；2026 年 7–8 月柬埔寨团体指出出口又恢复，戈公省官员说禁令已解除，两部未回应（Mongabay 报道） | land-use S227、S228；S27、S28 | [✓继]；2026 部分 [✓ 报道] | 2026 年的是"指控 / 报道"，写明；新加坡方面若有回应〔待核〕一并写 |
| F23 | **填料不只是沙** | 早期用削平的山（华利山、大巴窑、实乞纳、勿洛、淡滨尼）；樟宜用附近海床挖起的沙；后来用进口沙；圩田用池塘挖出的黏土 1,000 多万立方米 | S10；land-use 第 05 章细看（同来源）；S30 | [✓][✓继]〔圩田黏土待核原文〕 | |
| F24 | **马来西亚诉新加坡（柔佛海峡填海案）** | 2003 年马来西亚依《联合国海洋法公约》附件七提起仲裁，并向国际海洋法法庭申请临时措施；法庭 2003 年 10 月 8 日的命令要求两国合作、成立专家组，对大士段不下临时措施；2005 年 4 月 26 日两国签署和解协议，仲裁庭 2005 年 9 月 1 日按协议作出裁决 | S40 ITLOS Case No. 12；S41 PCA / UN RIAA vol. XXVII | [✓ 页面列表]〔待核：读命令原文段落〕 | 写程序与结果，不写"谁赢"；涉及德光岛与大士两段 |
| F25 | **德光岛圩田** | 2016 年宣布〔待核〕；约 800 公顷（2016 年报道 810）；新加坡第一个低于平均海平面的造地；海堤约 10 公里〔待核〕；靠排水沟、蓄洪池与抽水站保持干燥；比传统填海省约一半的沙；主体工程 2024 年底完成，2025 年 9 月宣布，余下的测试完成后交给公用事业局与国防部；用于军事训练 | S30 HDB 2025 媒体资料（Annex 1）〔待核：PDF 原文〕；S31 报道 | [✓ 报道]〔待核原文〕 | 只写"用于军事训练"，不写设施 |
| F26 | **2025 年面积的跳升** | 官方面积 2024 → 2025 年增 8.6 km² | S1 | [✓] | 与圩田的关系〔待核：SLA 说明〕；未核前正文**不**写"因为圩田" |
| F27 | **红树林** | 1953 年约 63.3 km²，到 1993 年剩约 6.5%（Hilton & Manning 1995）；NParks：1800 年代的红树林剩下不到 5%；双溪布洛湿地保护区是本岛最大的一片〔面积 NParks 两页写 130 / 100 公顷，待核〕 | S50、S51 | [✓ 摘要][✓] | 两个数基准不同（1953 vs 1800 年代），不拼成一条线 |
| F28 | **珊瑚礁与海草床** | 填海估计使约 60% 的珊瑚礁面积消失（Chou 2008，经 Yaakub et al. 2014 转引）；1993 年潮间带珊瑚礁坪只剩 1953 年的约 24%（Hilton & Manning 1995）；海草床的损失没有统计（Yaakub 2014） | S50、S52、S53 | [✓ 摘要]〔Chou 2008 原文待核〕 | 写"估计""据……" |
| F29 | **保留下来的海岸** | 仄爪哇（乌敏岛）原定 2001 年底填海，2001 年 12 月政府宣布暂缓〔待核〕；姐妹岛海洋公园 2014 年设立〔待核〕 | NLB / NParks〔待核〕 | 〔待核〕 | 写决定和理由，不写"环保胜利" |
| F30 | **南部岛屿的居民** | 裕廊岛诸岛、实马高、布康等岛上原有马来村落，因炼油、工业、垃圾埋置场在 1960–1990 年代迁到本岛〔待核：年份与人数〕；2026 年"西部岛"宣布后，后人团体希望环境评估纳入他们对礁石与海域的知识（Mongabay 报道） | NLB / NAS 口述史〔待核〕；S60 | 〔待核〕 | 名称写法按来源；不浪漫化，也不写成控诉 |
| F31 | **海平面上升** | 第三次国家气候变化研究（2024，新加坡气象局气候研究中心）：到 2100 年平均海平面上升 0.23–1.15 m（相对 1995–2014 年），高排放下 2150 年约 2 m；约 30% 的土地海拔低于 5 m | S70 CCS V3；S71 PUB | [✓ 报道]〔待核：MSS 原文与 PUB 页〕 | 区间两端都写；"4–5 米"是叠加风暴潮和潮汐的说法，来源不同，正文不用 |
| F32 | **海岸防护** | 2020 年公用事业局成为国家海岸防护机构；海岸与防洪基金首笔 50 亿元〔待核〕；2022 年起研究樟宜、东海岸、大南部滨水区的防护方案 | S71、S72〔待核〕 | 〔待核〕 | |
| F33 | **长岛** | 东海岸外约 800 公顷的填海构想，抬高的陆地连成海岸防线，围出新蓄水池（可能是第 18 个），研究中；2025 年 8 月起在东海岸公园外做实地勘察 | S73 go.gov.sg/Long-Island；S74 CLC | [✓ 页面摘要]〔待核〕 | 只写，不画 |
| F34 | **西部岛（2026）** | 2026 年 8 月 23 日国庆群众大会，黄循财总理宣布将在未来几十年把实马高、布康、苏东等南部岛屿填成一个"西部岛"，用于先进制造、能源与国防；政府说先做环境、技术与可行性研究，并宣布绘制海洋与海岸生境图；保育团体指出这一带有新加坡相当大一部分剩余珊瑚礁 | S61 总理演讲〔待核：PMO 原文〕；S60、S62 报道 | [✓ 报道]〔待核原文〕 | 有关核能的猜测**不写**；"约 60% 剩余礁石"出自社交媒体帖子，不当事实，只写"保育团体担心" |
| F35 | **到 2030 年** | 2013 年土地利用规划：到 2030 年再填约 5,600 公顷 | S10 | [✓] | "766 km²"〔待核：MND 原文〕未核不用 |

### 1.4 争议与两边写（正文 / 细看位置）

| 争议 | 一方 | 另一方 | 放在 |
|---|---|---|---|
| 进口沙对出口国的影响 | UNEP 2014 / 2019 的统计与对印尼小岛的描述；全球见证 2010；柬埔寨团体 2016、2026 | 国家发展部 2010（私人公司进口、查核来源与执照）；外交部 2007（2003 年后未从印尼进口海沙） | 第 04 章正文一段 + 细看"两种看法" |
| 柔佛海峡填海 | 马来西亚：填海影响其海域与海岸（按 ITLOS 命令所载的主张） | 新加坡：填海在本国领海内进行（同上） | 第 03 章细看；只写程序与 2005 年和解 |
| 填海的代价值不值 | 保育团体、学者（Hilton & Manning；Yaakub）对生境损失的记录 | 政府对土地需要的说明（S10 列的住屋、工业、港口、机场）；后来的保护措施（暂缓仄爪哇、海洋公园、生境图） | 第 06 章正文 |
| 西部岛 | 保育团体、岛民后人对礁石与渔场的担心 | 政府：几十年的长期计划，先研究 | 第 06 章末拍与细看 |
| 数字口径 | 樟宜 707 / 745 / 870 公顷；裕廊岛 3,000 / 3,200 公顷；红树林 1953 与 1800 年代两种基准；面积 2002 年改口径 | — | 各自细看，区间两端各带来源 |

---

## 2. 章节计划（背景章 + 6 章，29 拍）

### 2.1 总表

`cam` = `[lng, lat, zoom]`。岛尺度海岸在 zoom 9.4–9.6 渐入（docs/06），镜头一律 ≥ 9.6。`layers` 默认 `[base, sites, battles]` 加本章需要的 dated 图层；**不写 `borders`**；本题没有控制区着色（控制区只有两个空帧定时间范围）。"岛岸"列 = 这一章 `t` 时显示哪一段（§3.3 的 L#）。

| # | id | 标题 EN / ZH | t | cam | 岛岸 | 链接 |
|---|---|---|---|---|---|---|
| 00 | background | An island that grew / 一座会长大的岛 | 2025-12-31 | 103.82, 1.35, 10.2 | L12 | 全部四题 |
| 01 | first-fills | Cutting hills to fill the shore / 削山填岸（1822–1937） | 1937-01-01 | 103.852, 1.285, 13.6 | L4 | 1819–1965 `town-plan`、`town-life` |
| 02 | homes-by-the-sea | Land for homes: Kallang and the East Coast / 为住屋填海：加冷与东海岸 | 1991-04-28 | 103.93, 1.305, 11.6 | L8 | land-use `new-towns`、`more-land`；four-taps `a-reservoir-in-the-city` |
| 03 | airport-factories-port | An airport, factories and a port / 机场、工厂与港口 | 2011-02-14 | 103.80, 1.32, 10.4 | L10 | land-use `getting-around`；container-port `the-tuas-transition` |
| 04 | where-the-sand-comes-from | Where the sand comes from / 沙从哪里来 | 2003-02-28 | 103.82, 1.35, 10.2 | L9 | after-1965 `neighbours`；land-use `more-land` |
| 05 | the-polder | A different way: the polder at Pulau Tekong / 另一种造地：德光岛圩田 | 2025-12-01 | 104.05, 1.41, 11.6 | L12 | container-port `the-tuas-transition` |
| 06 | costs-and-the-rising-sea | What was lost, and the rising sea / 失去的与上涨的海 | 2026-08-23 | 103.82, 1.33, 10.2 | L12 | mangrove-food-web `human-impact-and-evidence`；coral-reef `bleaching-and-pressures`；monsoon-and-weather `averages-and-change` |

时间顺序：第 04 章是专题章（按沙），`t` 取它的代表日期（2003 年 2 月印尼禁止海沙出口），正文讲 1970 年代到 2026 年，节拍的 `t` 可早于第 03 章结束（docs/10 允许章节重叠）。高亮规则：每章 `state.highlight` 只放开始时间 ≤ 本章 `t` 的事件。

### 2.2 各章

#### 00 background · 一座会长大的岛

- 正文：今天的新加坡比 1960 年大了约 163 km²（F1，两端的数，写口径变化）；大部分是填海得来的；地图上彩色的块是不同时期填出来的地，细线是约 1819 年的海岸；本题讲三件事：土从哪里来、为什么要填、填了失去什么。
- 阅读说明（`state.note`，双语）：①海岸是怎么画的：1819–1961 年取自配准的公有领域旧地图（城区图 1822 / 1839 / 1893，全岛图 1911–16 / 1941，海图修订到 1954 年、1958 年测绘图的裕廊），1973–2011 年取自 Landsat 卫星影像，2019、2025 年取自市区重建局总蓝图的陆地边界；②误差：旧地图几十到几百米，卫星影像受潮位、云、像元（60 m / 30 m）影响；1973 年以前的离岛用 1973 年的轮廓；③彩色的块只画对得上有记载的工程的新地；④数字写法：每个数字可点开来源，面积以官方统计为准，地图上量出的面积只看趋势；⑤红树林是 2020 年卫星测出的范围；珊瑚礁和海草床没有能公开的地图，只写数字。
- 细看：①**岛有多大：官方数与地图上量的数**（表：1960 / 1980 / 2000 / 2025 官方面积 vs 对应时代岛岸的量算面积，说明口径不同）；②**这些海岸线是怎么画的**（同阅读说明，用孩子能懂的话；链 land-use 的同名细看，不重写方法）。
- 节拍（4）：
  1. 2025-12-31 · 全岛（103.82, 1.35, 10.2），`layers: [base, shore-1819, added-1822-1964, added-1965-1989, added-1990-2009, added-2010-2025]`，hl —。EN "Today: every coloured patch was sea, swamp or shallow reef before it was filled in. The thin line is the shore of about 1819." ZH "今天：每一块彩色的地，在填海以前都是海、沼泽或浅礁。细线是约 1819 年的海岸。"
  2. 1819-02-06 · 全岛，`layers: [base, shore-1819]`。EN "1819: the island as early maps show it, with mangrove creeks along the north and west and a river mouth on the south coast." ZH "1819 年：旧地图上的岛，北岸和西岸是红树林河汊，南岸有一个河口。"
  3. 2025-12-31 · 西南（103.68, 1.27, 11.2），hl `jurong-island-opens`。EN "Today: Jurong Island, joined up from seven small islands, is the largest single piece of new land." ZH "今天：由七个小岛连成的裕廊岛，是最大的一块新地。"
  4. 2025-12-31 · 城区（103.852, 1.283, 13.6），hl `telok-ayer-reclamation`。EN "Today: even the old city centre stands partly on filled land. Robinson Road was once the shore." ZH "今天：就连老城中心也有一部分建在填出来的地上。罗敏申路一带以前就是海边。"

#### 01 first-fills · 削山填岸（1822–1937）

- 正文：1822–23 年削平今莱佛士坊的小山，填河南岸的沼泽（F3）；船多了要码头，哥烈码头（F4）、直落亚逸填海用华利山的土（F5）；20 世纪初直落亚逸湾的海堤下沉、等了多年才填完（F6）；1930 年代加冷盆地填出来，建了加冷机场（F7）；殖民时期合计约 300 公顷（F2）——和后来比很小，但办法一样：削山、筑堤、填土。历史背景链 `<TopicLink slug="singapore-1819-1965" ch="town-plan">`。
- 细看：①**一道沉下去的海堤**（F6：新填的地要沉实，费用涨了六倍）；②**城里的街原来在海边**（直落亚逸街、哥烈码头、罗敏申路三条街的"海岸"年表；与 1819–1965 第 05 章的"亚逸街原是海边"不重复，只列日期与来源）。
- 节拍（4）：
  1. 1823-01-01 · 城区（103.849, 1.286, 14.0），hl `boat-quay-fill`。EN "1822 to 1823: a small hill is cut down and its earth fills the swamp on the south bank of the river." ZH "1822 年到 1823 年：一座小山被削平，泥土拿去填新加坡河南岸的沼泽。"
  2. 1887-01-01 · 城区（103.848, 1.280, 13.6），hl `telok-ayer-reclamation`、`site-mount-wallich`。EN "From 1879: earth from Mount Wallich fills the bay in front of Telok Ayer Street. This shore comes from an 1893 map." ZH "1879 年起：华利山的土把直落亚逸街前的海湾填平。这条海岸取自 1893 年的地图。"
  3. 1937-01-01 · 城区东（103.865, 1.297, 12.8），hl `telok-ayer-basin-reclamation`、`kallang-basin-1930s`。EN "1930s: Telok Ayer Basin is finished in 1932 and Kallang Basin in 1936; an airport opens on the new land at Kallang in 1937." ZH "1930 年代：直落亚逸湾 1932 年填完，加冷盆地 1936 年填完；1937 年，加冷的新地上启用了机场。"
  4. 1961-01-01 · 全岛（103.82, 1.35, 10.2），`layers` 加 `added-1822-1964`。EN "By 1961: the land filled in colonial times adds up to about 3 square kilometres, small next to what comes later." ZH "到 1961 年：殖民时期填出来的地加起来约 3 平方公里，和后来比很小。"

#### 02 homes-by-the-sea · 为住屋填海：加冷与东海岸

- 正文：1960 年代要大量建组屋（链 `<TopicLink slug="singapore-land-use" ch="new-towns">`，不重讲）；1963 年勿洛试填、加冷盆地用大巴窑的土（F8）；1966 年起东海岸七期、1,525 公顷，土来自实乞纳、勿洛、淡滨尼的山（F9），山削平了、海岸往外推了约〔由数据量出〕公里，东海岸公园和组屋、高速公路建在新地上；第六、七期向西接上滨海东、滨海南，围出滨海湾（F10，链 four-taps）。
- 细看：①**东海岸七期**（表：期、年份、公顷，F9）；②**怎样填海**（配图 `reclamation-fill`：筑堤、填土、等沉实；与 land-use 的剖面图不同，本图没有岩洞）；③**山去了哪里**（实乞纳、勿洛、淡滨尼的山今天是什么地方，按 NLB / URA〔待核〕；不画成"消失的山"地图）。
- 节拍（4）：
  1. 1973-10-17 · 东部（103.93, 1.31, 11.6），hl `east-coast-reclamation`。EN "October 1973 image: the first phases along the East Coast have pushed the shore out beyond the old beach." ZH "1973 年 10 月的影像：东海岸前几期填海，已经把海岸推到旧海滩外面。"
  2. 1973-10-17 · 东部内陆（103.94, 1.33, 12.0），hl `site-siglap-hills`、`site-bedok-hills`、`site-tampines-hills`。EN "The earth came from hills inland at Siglap, Bedok and Tampines, which were cut down." ZH "填海的土来自内陆实乞纳、勿洛和淡滨尼的山，这些山被削平了。"
  3. 1979-10-31 · 滨海（103.87, 1.285, 12.6），hl `marina-bay-reclamation`。EN "October 1979 image: new land at Marina Centre and Marina South begins to close in the bay." ZH "1979 年 10 月的影像：滨海中心和滨海南的新地，开始把海湾围起来。"
  4. 1991-04-28 · 东部（103.93, 1.305, 11.4）。EN "April 1991 image: the East Coast scheme is nearly done. East Coast Park, homes and an expressway stand on the new land." ZH "1991 年 4 月的影像：东海岸填海快完成了。东海岸公园、组屋和高速公路都建在新地上。"

#### 03 airport-factories-port · 机场、工厂与港口

- 正文：裕廊工业区从 1963 年的 46 公顷起，1970 年代裕廊、大士填了 2,000 多公顷（F11）；樟宜机场：一半左右建在填海地上（F12，三个数并列），1981 年启用（链 land-use `getting-around`）；1981–85 年德光岛填了 540 公顷（F14）；港口：吉宝、巴西班让、大士（F15，链 container-port `the-tuas-transition`）；1993–2003 年七个岛连成裕廊岛（F17）。
- 细看：①**七个岛变一个岛**（裕廊岛七个岛名与原来的用途，F17）；②**柔佛海峡的官司**（F24：2003 年提交、10 月 8 日法庭命令、2005 年和解，只写程序与结果）；③**一块地有多大**（几个工程的公顷数换成"几个大巴窑镇"之类的比较〔Codex 按 HDB 公布的镇面积算，写明是计算〕）。
- 节拍（5）：
  1. 1973-10-17 · 西部（103.66, 1.31, 11.4），hl `jurong-reclamation-1963`。EN "October 1973 image: along the Jurong coast, swamp and shallow sea have been filled for factories and wharves." ZH "1973 年 10 月的影像：裕廊沿岸的沼泽和浅海，已经填成工厂和码头。"
  2. 1981-07-01 · 樟宜（103.99, 1.36, 11.8），hl `changi-airport-opens`。EN "1 July 1981: Changi Airport opens at the eastern tip; a large part of it stands on land filled in from 1975." ZH "1981 年 7 月 1 日：樟宜机场在岛的东端启用，很大一部分建在 1975 年起填出来的地上。"
  3. 1991-04-28 · 东北（104.05, 1.40, 11.6），hl `tekong-reclamation-1981`。EN "April 1991 image: Pulau Tekong has grown, with fill brought from Changi and from abroad." ZH "1991 年 4 月的影像：德光岛变大了，填料来自樟宜，也来自国外。"
  4. 2002-10-11 · 西南（103.69, 1.265, 11.6），hl `jurong-island-opens`。EN "October 2002 image: the seven islands off Jurong are almost one. Jurong Island was opened in October 2000." ZH "2002 年 10 月的影像：裕廊外海的七个岛快连成一个了。裕廊岛在 2000 年 10 月开幕。"
  5. 2011-02-14 · 大士（103.63, 1.28, 11.6），hl `tuas-reclamation`。EN "February 2011 image: the western end at Tuas keeps moving out to sea for industry and, later, a new port." ZH "2011 年 2 月的影像：西端的大士继续往海里推，先是工业，后来是新港口。"

#### 04 where-the-sand-comes-from · 沙从哪里来

- 正文：一开始用自己的山和附近海床的沙（F23）；山削得差不多了、工程越来越大，就从邻国买沙（F14、F20）；邻国先后限制出口（F21，写各国自己说的理由）；有组织指出挖沙破坏出口国的河流、海岸和小岛，新加坡政府回应说沙由私人公司进口、会查来源（F22，两边写）；于是新加坡也找少用沙的办法：用挖出的泥土、垃圾焚化后的灰、圩田（下一章）。链 `<TopicLink slug="singapore-after-1965" ch="neighbours">` 只讲"邻国关系另有一章"，不讲政治。
- 细看：①**一张出口限制年表**（F21，每行一个国家、日期、决定、来源；未核的行不列）；②**两种看法**（F22，同 land-use 那块，**本题扩写**：加 UNEP 2014 / 2019 的统计、2016 年记录对不上、2026 年的指控与官员说法；写"至今仍有争议"）；③**沙也会用完吗**（UNEP 2019：沙是用量最大的固体资源之一〔待核原文〕；不渲染危机）。
- 节拍（3）：
  1. 1973-10-17 · 东部（103.94, 1.33, 11.8），`layers` 加 `sites`，hl `site-siglap-hills`、`site-bedok-hills`。EN "1970s: the first fill comes from Singapore's own hills, dug and carried to the shore." ZH "1970 年代：最早的填料来自新加坡自己的山，挖下来运到海边。"
  2. 1979-10-31 · 樟宜（103.99, 1.36, 11.8），hl `changi-seabed-sand`。EN "Late 1970s: at Changi, sand is dredged from the nearby seabed and pumped onto the site." ZH "1970 年代末：在樟宜，人们从附近海床挖沙，再泵到工地上。"
  3. 2003-02-28 · 全岛（103.82, 1.35, 10.2），`layers` 加四个 `added-*`。EN "By 2002 most of today's new land is in place, and much of the later sand had to be bought from other countries." ZH "到 2002 年，今天的大部分新地已经填好，后期用的沙很多要向别的国家买。"

#### 05 the-polder · 另一种造地：德光岛圩田

- 正文：传统填海是把沙填到高出海面；圩田（荷兰的做法）是筑一道海堤围住一片浅海，把水抽干，地面**低于**海面，靠排水沟、蓄洪池和抽水站保持干燥（F25，配图 `polder-section`）；德光岛西北约 800 公顷，比传统做法省约一半的沙，挖蓄洪池的黏土也拿来填（F23）；2024 年底主体完成，用于军事训练；同一时期大士港、樟宜东也在填（F13、F15）。2025 年官方面积 744.3 km²（F1、F26，不写因果）。
- 细看：①**圩田怎样保持干燥**（海堤、排水沟、蓄洪池、抽水站四样东西，每样一句）；②**低于海面安全吗**（按 HDB / PUB 的说法写防护设计〔待核原文〕；不写评价）。
- 节拍（4）：
  1. 2019-11-18 · 德光岛（104.06, 1.41, 11.8），hl `tekong-polder-begins`。EN "2019 map: the land boundary at north-western Pulau Tekong, where a polder is being built behind a long dike." ZH "2019 年的地图：德光岛西北的陆地边界，那里正在一道长长的海堤后面建圩田。"
  2. 2025-12-01 · 德光岛（104.06, 1.41, 12.2），hl `tekong-polder-completed`。EN "2025 map: the polder adds about 800 hectares. Its ground is lower than the sea outside and is kept dry by drains, a pond and pumps." ZH "2025 年的地图：圩田多出约 800 公顷。地面比外面的海还低，靠排水沟、蓄洪池和抽水站保持干燥。"
  3. 2025-12-01 · 大士（103.62, 1.27, 11.6），hl `tuas-port-opens`。EN "2025 map: Tuas, the newest port, stands on land reclaimed in stages since the 2010s." ZH "2025 年的地图：最新的大士港，建在 2010 年代起分期填出来的地上。"
  4. 2025-12-31 · 全岛（103.82, 1.35, 10.2），`layers` 加四个 `added-*`。EN "End of 2025: Singapore's official land area is 744.3 square kilometres, up from 581.5 in 1960." ZH "2025 年底：新加坡的官方陆地面积是 744.3 平方公里，1960 年是 581.5 平方公里。"

#### 06 costs-and-the-rising-sea · 失去的与上涨的海

- 正文：填海的代价——红树林从 1953 年的约 63 km² 到 1993 年只剩约 6.5%（F27）、珊瑚礁面积估计少了约六成、潮间带礁坪剩约四分之一（F28）、海草床没有统计；南部岛屿上的村子搬到本岛（F30）；后来的做法：环境研究、暂缓仄爪哇、设海洋公园（F29），链 mangrove-food-web、coral-reef；**海在上涨**：到 2100 年可能上升 0.23–1.15 米，约三成土地海拔低于 5 米（F31）；公用事业局负责海岸防护，长岛是研究中的计划（F32、F33）；2026 年宣布的西部岛也要先研究礁石（F34）。结尾：在地图上找到离你家最近的海岸，把时间拖回 1819 年，看看那里原来是什么。
- 细看：①**红树林和珊瑚礁的数字是怎么来的**（论文、年份、方法；基准不同的数不连成线）；②**海平面上升的区间**（为什么是一个区间：取决于排放；链 `monsoon-and-weather` `averages-and-change`）；③**南部岛屿的人**（F30，口述史写明是谁的回忆）。
- 节拍（5）：
  1. 2025-12-31 · 西北（103.73, 1.445, 12.0），`layers: [base, sites, mangroves-2020]`，hl `site-sungei-buloh`。EN "Green shows mangroves mapped from satellite images in 2020. In 1953 there were about 63 square kilometres; most were cleared or filled." ZH "绿色是 2020 年卫星测出的红树林。1953 年约有 63 平方公里，大多被砍掉或填掉了。"
  2. 2025-12-31 · 南部诸岛（103.76, 1.215, 12.0），hl `semakau-landfill`、`site-sisters-islands`。EN "The southern islands keep some of Singapore's last coral reefs, next to a landfill built inside a sea wall in 1999." ZH "南部诸岛保留着新加坡最后的一部分珊瑚礁，旁边是 1999 年在海堤里建成的垃圾埋置场。"
  3. 2025-12-31 · 乌敏岛东（103.99, 1.41, 12.6），hl `site-chek-jawa`。EN "Chek Jawa on Pulau Ubin was due to be reclaimed; in 2001 the plan was put off and its shore is still here." ZH "乌敏岛的仄爪哇原本要填海；2001 年计划暂缓，这片海岸至今还在。"
  4. 2025-12-31 · 东海岸（103.93, 1.30, 11.4），hl `coastal-protection-agency`。EN "By 2100 the sea here may rise by 0.23 to 1.15 metres. About a third of Singapore's land is less than 5 metres above the sea." ZH "到 2100 年，这里的海平面可能上升 0.23 到 1.15 米。新加坡约三分之一的土地海拔不到 5 米。"
  5. 2026-08-23 · 南部诸岛（103.76, 1.22, 11.6），hl `western-island-announced`。EN "23 August 2026: a plan is announced to join Semakau, Bukom, Sudong and smaller islands over the coming decades; studies of the reefs come first." ZH "2026 年 8 月 23 日：政府宣布要在未来几十年把实马高、布康、苏东等岛连起来；先研究这里的珊瑚礁。"

### 2.3 数据清单汇总

- **id 命名空间**（与实体、事件、图层、预设、名词共用，已查与 land-use / 1819–1965 复制来的 id 不冲突）。
- **实体**（`entities.json`）：本题没有控制区着色，`datedLayers` 用 `color: token:*`，不需要实体；`entities.json` 写空数组（若 validate 要求至少一个，放一个 `singapore` neutral 叙事实体，〔Opus 查〕）。
- **控制区**（`control.json`）：K1 1819-02-06、K2 2026-08-31，都是空帧（E2 已支持）。
- **事件**（`events.json`）：
  - 复制（逐字节，`sources` 指向复制来的来源条目，来源同样复制）：`boat-quay-fill`、`telok-ayer-reclamation`（1819–1965）；`east-coast-reclamation`、`marina-bay-reclamation`、`jurong-island-opens`、`tuas-reclamation`、`changi-airport-opens`（land-use）。
  - 新增 `milestone`：`telok-ayer-basin-reclamation` · 1930（until 1932）· [103.846, 1.276]；`kallang-basin-1930s` · 1932-05（until 1936-10）· [103.868, 1.305]；`jurong-reclamation-1963` · 1963 · [103.72, 1.31]〔待核坐标〕；`kallang-basin-1963` · 1963（until 1971）；`tekong-reclamation-1981` · 1981（until 1985）· [104.04, 1.40]；`changi-seabed-sand` · 1975 · [104.00, 1.35]；`semakau-landfill` · 1999-04-01〔待核〕· [103.76, 1.20]；`itlos-johor-strait` · 2003-10-08 · [103.66, 1.36]（标记放在大士段；详情写德光岛与大士两段）；`tekong-polder-begins` · 2016〔待核〕；`tekong-polder-completed` · 2024-12（until 2025-09）〔待核〕· [104.06, 1.41]；`tuas-port-opens` · 2022-09〔与 container-port F11 一致〕· [103.62, 1.26]；`coastal-protection-agency` · 2020-04〔待核〕· [103.93, 1.30]；`western-island-announced` · 2026-08-23 · [103.76, 1.21]。
  - 新增 `site`：`site-mount-wallich`、`site-siglap-hills`、`site-bedok-hills`、`site-tampines-hills`、`site-toa-payoh-hills`、`site-sungei-buloh`、`site-chek-jawa`、`site-sisters-islands`（坐标取 Wikidata，CC0，QID 写进 `detail` 的来源；削平的山写"山原来所在的大致位置"，`certainty: approximate`）。
- **图层**（`datedLayers`，§3.4）：`added-1822-1964`、`added-1965-1989`、`added-1990-2009`、`added-2010-2025`（面）、`shore-1819`（线）、`mangroves-2020`（面）。
- **预设**（`presets.json`）：`island`（103.82, 1.35, 10.2）、`town`（103.852, 1.285, 13.6）、`east`（103.93, 1.31, 11.6）、`west`（103.66, 1.29, 11.2）、`north-east`（104.04, 1.40, 11.6）、`south-islands`（103.76, 1.215, 11.8）。
- **规格行**（HUD 左上）：EN "1819 → 2026 · coasts from old maps, Landsat and URA · new land coloured by period" / ZH "1819 → 2026 · 海岸取自旧地图、Landsat 与市区重建局 · 新地按时期上色"。
- **`topic.yaml`**：`basemap: { local: land-sg-reclaim, maxZoom: 14 }`；`datedLayers`（§3.4）；`note` EN "Coasts to 1961 traced from old public-domain maps · 1973–2011 from Landsat satellite images · 2019 and 2025 from URA land boundaries · islands before 1973 drawn as in 1973 · coloured patches: new land matched to a recorded project (approximate)" / ZH "1961 年以前的海岸描自公有领域旧地图 · 1973–2011 年取自 Landsat 卫星影像 · 2019 与 2025 年取自市区重建局的陆地边界 · 1973 年以前的离岛按 1973 年画 · 彩色块：对得上有记载工程的新地（近似）"。

---

## 3. 地图与数据

### 3.0 沿用什么、新做什么

| 东西 | 沿用 | 本题新做 |
|---|---|---|
| 岛尺度底图（mask、今天海岸虚线、水面挖洞） | four-taps C1 的 `local-land.ts` 配方与 `water` / `keepMatch` 配置（docs/24 §15）；mask 照 land-sg | — |
| 1819–1961 岛岸 L0–L5 | `land-sg-history.json`（docs/28 P1，2026-11-09 版），**解码，不改** | 补 1973 年离岛（§0-3） |
| 1973–2019 岛岸 L6–L11 | `land-sg-modern.json`（docs/34 §3.3 / §9.2，Landsat + MP2019），**解码，不改** | — |
| 2025 岛岸 L12 | — | MP2025 ∩ Landsat 9（§3.3） |
| 一个年代岛岸文件串起 13 段 | `local-land.ts` 的 `eras`（docs/06「岛尺度底图 · 按年代的海岸」，validate 要求首尾相接、不重叠） | `public/geo/land-sg-reclaim.json` |
| 按年份出现的面 / 线 | E1 `datedLayers`（docs/34 §9.1） | 新地分块与工程匹配、四个时期图层、1819 海岸线、红树林 |
| 事件 | land-use、1819–1965 的同名事件逐字节复制 | 13 个 milestone、8 个 site |
| 核对 | land-use 的 TPC 1984、1966 海图（docs/34 G13） | MP1998 / 2008 / 2014 边界、Zhang 2024、1969 海图 |

### 3.1 已在仓库里、不用下载的

| G# | 数据 | 许可 | 用途 |
|---|---|---|---|
| G1 | `public/geo/land-sg-history.json`（426 KB，对象 `land-sg-history`，L0–L5 + mask + coast-today） | 公有领域旧地图配准 + URA MP2019 SODL（署名照 docs/28 SOURCES-GEO：G30 与 G32 的原文）；OSM 只作选择器，不入几何 | L0–L5 |
| G2 | `public/geo/land-sg-modern.json`（247 KB，L5–L11） | Landsat（USGS 公有领域）+ URA MP2019 SODL | L6–L11；L5 只用于取 1973 年离岛 |
| G3 | `scripts/geo/singapore-land-use/coast-statistics.json`（每段影像号、阈值、偏差、每块 `minus` 的候选工程） | 本仓库 | 工程匹配的起点（候选多数写"unmatched"，要补） |
| G4 | four-taps 的 `water` / `keepMatch` 配置（`scripts/geo/four-taps/sources.json`） | URA SODL；OSM 名称匹配署名照抄 | 水面挖洞（蓄水池、滨海湾） |

### 3.2 要下载的（等 Gavin 批准；下载进 `scripts/geo/singapore-reclamation/raw/`，gitignore；每个文件记 URL、时间、SHA-256、许可原文到 `raw/fetch-log.json`）

| D# | 数据 | URL | 大小 | 许可 | 用途 | 默认 |
|---|---|---|---|---|---|---|
| D1 | Landsat 9 OLI-2 Collection 2 Level-2，WRS-2 path 125 row 59，2025 年内云量最低的一景（若 2025 年都不清，取 2026 年 1–6 月）；只要 SR_B3（绿）、SR_B6（短波红外 1）、QA_PIXEL | Microsoft Planetary Computer STAC（匿名）`https://planetarycomputer.microsoft.com/api/stac/v1`，collection `landsat-c2-l2`（land-use 已用同一途径） | 整景三个 COG 各约 60–120 MB；按新加坡外扩 5 km 的窗口读约 15–25 MB | 公有领域（USGS："Landsat data … no restrictions"，land-use SOURCES-GEO 已抄原文）；Planetary Computer 条款另记 | L12 的"影像上确实是陆地"检验 | 下 |
| D2 | URA Master Plan 2025 Planning Area Boundary (No Sea)，`d_2cc750190544007400b2cfd5d7f53209` | https://data.gov.sg/datasets/d_2cc750190544007400b2cfd5d7f53209/view | 2.19 MB GeoJSON | Singapore Open Data Licence v1.0（署名格式同 four-taps） | L12 几何主源 | 下 |
| D3 | URA MP1998 / MP2008 / MP2014 Planning Area Boundary (No Sea)：`d_448eb9464bde22a85d6e9efff8489906`、`d_773f010a4eaae0ce6d81cbe78d251642`、`d_28feff20a3500b31589c8adb057b7199` | 同上格式 | 1.69 / 2.02 / 2.02 MB | SODL v1.0 | L8–L10 Landsat 海岸的**独立核对**（不进发布几何，§3.3） | 下 |
| D4 | Land Area (As At December), Annual，`d_0b2c034da121ef8efc71949af1694b4d` | https://data.gov.sg/datasets/d_0b2c034da121ef8efc71949af1694b4d/view | 约 1 KB CSV | SODL v1.0 | F1、E-RC2 读数 | 下 |
| D5 | Zhang Q.（2024）*Global dynamics of coastal reclamation and its impact on biodiversity and blue carbon*，figshare v4，DOI 10.6084/m9.figshare.25556901.v4，只要 `changeyear.rar` | https://figshare.com/articles/dataset/Global_Coastal_Reclamation/25556901 | 42.4 MB（RAR，解压需 `bsdtar` / `unar`，不进 package.json） | CC BY 4.0 | 1985–2020 年新地日期的**独立核对**：每块新地的"变成陆地年份"中位数应落在对应两段岛岸之间 | 下（只核对） |
| D6 | Global Mangrove Watch v3.0（Bunting et al. 2022），Zenodo 6894273，`gmw_v3_2020_gtiff.zip` | https://zenodo.org/records/6894273 | 66.1 MB（全球瓦片 zip，只取覆盖新加坡的 1–2 块） | CC BY 4.0（Zenodo 记录 `cc-by-4.0`） | `mangroves-2020` 图层 | 下 |
| D7 | Commons `File:Admiralty Chart No 1358 Pandang and One Fathom Bank to Singapore, Published 1969.jpg` | https://commons.wikimedia.org/wiki/File:Admiralty_Chart_No_1358_Pandang_and_One_Fathom_Bank_to_Singapore,_Published_1969.jpg | 32.0 MB，16282×11273 | Commons 标 Public domain（英国政府 1976 年以前出版；下载时抄模板原文） | 1969 年前后海岸的**只看核对**（小比例尺进近图，填补 1961–1973 的空档，不描） | 下（只看） |
| D8 | Wikidata 坐标（8 个 site），SPARQL 查询 | https://query.wikidata.org/ | < 10 KB | CC0 | site 坐标 | 下 |
| D9 | USGS EarthExplorer Declassified Data（CORONA KH-4，1966–1972） | https://earthexplorer.usgs.gov/ | 每帧约 100–400 MB | 美国政府作品，公有领域〔待核页面原文〕 | 可补一段 1960 年代末岛岸 | **不做**（要账户，代理不能注册） |

**只看、不描、不发布**（放 `refs/`，SOURCES-GEO 写"只看、未描"）：Commons `File:Admiralty Chart No 2023 Keppel Harbor, Singapore, Published 1893.jpg`（103.6 MB，原图年代已过版权期，但 Commons 文件标 **CC BY-SA 4.0**——按标注对待，**不描进任何文件**）；NLB *Land From Sand* 与 *BiblioAsia* 附图；De Koninck（2017）；Kontinentalist（2023）；URA LTPR 2021 图；Hilton & Manning（1995）与 Yaakub（2014）的图；HDB 圩田资料里的平面图；Sengupta et al.（2023）只有城市汇总表（CC BY 4.0，Zenodo 7528236，22 KB），只读数，不画。

### 3.3 年代岛岸（`public/geo/land-sg-reclaim.json`）

| L | `from` – `to` | 几何 | 依据 | 误差（沿用 / 预算） |
|---|---|---|---|---|
| L0 | – 1823-01-01 | G1 L0 + 1973 离岛 | docs/28 | docs/28 残差（**未过预算**，照实写） |
| L1 | 1823-01-01 – 1887-01-01 | G1 L1 + 离岛 | 同上 | 同上 |
| L2 | 1887-01-01 – 1912-01-01 | G1 L2 + 离岛 | 同上 | 同上 |
| L3 | 1912-01-01 – 1937-01-01 | G1 L3 + 离岛 | 同上 | 同上 |
| L4 | 1937-01-01 – 1961-01-01 | G1 L4 + 离岛 | 同上 | 同上 |
| L5 | 1961-01-01 – 1973-10-17 | G1 L5（**今天的版本**）+ 离岛 | 同上；land-use 第一段在 11-09 重新配准前做的，本题用新版 | 同上 |
| L6 | 1973-10-17 – 1979-10-31 | G2 L6 | Landsat 1 MSS `LM01_L1TP_134059_19731017_02_T2` | p50 40 m、p95 173 m（已测） |
| L7 | 1979-10-31 – 1991-04-28 | G2 L7 | Landsat 2 MSS `LM02_L1TP_134059_19791031_02_T2` | p50 48、p95 215 |
| L8 | 1991-04-28 – 2002-10-11 | G2 L8 | Landsat 5 TM `LT05_L2SP_125059_19910428_02_T1` | p50 25、p95 158 |
| L9 | 2002-10-11 – 2011-02-14 | G2 L9 | Landsat 7 ETM+ `LE07_L2SP_125059_20021011_02_T1` | p50 19、p95 114 |
| L10 | 2011-02-14 – 2019-11-18 | G2 L10 | Landsat 5 TM `LT05_L2SP_125059_20110214_02_T1` | p50 27、p95 268 |
| L11 | 2019-11-18 – 2025-12-01 | G2 L11（URA MP2019 陆地） | MP2019 | — |
| L12 | 2025-12-01 – | **新做**：D2 MP2025 陆地 ∩（D1 影像陆地外扩 2 个像元） | MP2025 宪报日；影像只用来**去掉**规划里有、影像上还是水的部分 | 与 L11 不变海岸的偏差 p50 ≤ 10 m（同一机构两版边界）；被去掉的块逐块列出 |

- **L12 的方法**：①D2 的 55 个规划区并成陆地，同 four-taps 的碎块与内陆水面规则；②D1 按 land-use 的 Landsat 方法（MNDWI，绿 / 短波红外 1，今天海岸外扩 2 km 带里 Otsu 阈值，云与阴影用 QA_PIXEL 去掉）得到影像那天的陆地；③L12 = ① ∩（② 外扩 60 m），丢 < 0.1 km² 的碎块；被去掉的、> 0.1 km² 的块（大士港未建的后期、樟宜东等）列表，写进 SOURCES-GEO 与已知差距；④圩田的蓄洪池按 MP2025 的水面类别处理〔Codex 先导出 D2 无海边界里有没有池子的洞〕。land-use 的 `landsat-coast.py` 只读调用；若不能传参，复制到本题目录，文件头写"复制自 singapore-land-use，未改算法"。
- **1973 离岛补丁**：L6 里不接触本岛、≥ 0.02 km² 的陆地块并入 L0–L5（同 land-use `historic-islands.py`），属性 `certainty: approximate`；1973 年以前离岛上的变化（布康岛、亚逸查湾的早期工程）因此提前出现，写进已知差距。
- **D3 核对**：MP2008 对 L9、MP2014 对 L10、MP1998 对 L8，算每段的偏差与面积差；MP 边界与 Landsat 差 > 0.5 km² 的块列出（可能是规划边界含未填的地，也可能是 Landsat 误差），主会话看图。**本轮不用 MP 边界替换 Landsat 段**（总蓝图的边界不一定是当年的实际海岸，宪报日期也不是测量日期）；若核对显示 MP2008 / 2014 与影像在新地上高度一致（≥ 95% 面积重合），可在 v2 用它们加两段，写进 §8.3。
- **D5 核对**：每块 1985 年以后的新地，取 Zhang 栅格在块内的"变成陆地年份"中位数，应落在 `(上一段影像日, 本段影像日]`；不落的列表。只核对，不发布 Zhang 的像元。
- **产物**：`public/geo/land-sg-reclaim.json`（TopoJSON，对象 `land-sg-reclaim`；`kind: mask`、`kind: land` × 13（每段一整块岛岸、带 `from` / `to` 与 `src`）、`kind: coast-today` = L12 的海岸线）。简化：城区框（103.83–103.88, 1.27–1.31）10 m、其余 50 m（docs/28 P3 的分框容差）；预算 **≤ 550 KB**（两个来源文件合计 673 KB，共用弧只存一次）；`rings` 0 / 0；每段面积表与 F1 并排（只看趋势）。

### 3.4 按年份出现的图层（`datedLayers`，文件 `public/geo/sg-rc-*.json`）

**新地分块与工程匹配**（脚本 `scripts/geo/singapore-reclamation/pieces.ts`）：

1. 对每对相邻时代 `L(n-1) → L(n)`：`plus` = L(n) − L(n-1) 外扩 2 个像元（Landsat 段）/ 外扩 40 m（旧地图段），丢 < 0.1 km²（城区框内 < 0.01 km²，殖民时期的工程小）。
2. 工程表 `scripts/geo/singapore-reclamation/projects.json`：每个工程 `{ id, name: {en, zh}, years: [from, to], agency, hectares?, sources: [S#], where: 文字描述（"东海岸，加冷河口至勿洛"）, event?: 事件 id }`，至少包括 F3–F17、F19、F25 的每一项；`where` 只用来源原文里的地名，**不画范围**。
3. 匹配：块的形心与面积落在工程的地点与年份里（年份 ∈ (上一段日期 − 5 年, 本段日期]），由 Codex 逐块填 `project`，主会话看并排图确认。一块可对多个工程（东海岸几期同一段影像出现），写主工程。
4. 只把匹配上的块写进图层；每块属性 `f`（本段 `from`，十进制年）、`certainty: approximate`、`a`（km²，构建时算，E-RC1 用；若 validate 不收额外属性则先去掉，Opus 在 E-RC1 里放开）。
5. 报告 `pieces-report.md`：每段 `plus` 块数、已匹配面积、未匹配块（形心、面积、可能原因）、与 F18 的 13,800 公顷对照。

| 图层 id | 形状 | 颜色 | 内容 | `f` / `u` | label EN / ZH |
|---|---|---|---|---|---|
| `added-1822-1964` | 面 | `token:holder-2` | L1–L5 的已匹配块 | 各段 `from` | "New land, 1822–1964" / "1822–1964 年填出的地" |
| `added-1965-1989` | 面 | `token:holder-3` | L6–L7 的已匹配块（1966–1989 的工程） | 同上 | "New land, 1965–1989" / "1965–1989 年填出的地" |
| `added-1990-2009` | 面 | `token:holder-4` | L8–L9 | 同上 | "New land, 1990–2009" / "1990–2009 年填出的地" |
| `added-2010-2025` | 面 | `token:holder-5` | L10–L12 | 同上 | "New land, 2010–2025" / "2010–2025 年填出的地" |
| `shore-1819` | 线 | `token:ink-2` | L0 的外海岸线（不含河岸） | 1819.1 | "Shore of about 1819 (approximate)" / "约 1819 年的海岸（近似）" |
| `mangroves-2020` | 面 | `token:holder-6` | D6 2020 年栅格 → 多边形，裁到 L12，丢 < 0.5 公顷 | 2020.0 | "Mangroves mapped in 2020" / "2020 年测出的红树林" |

- 时期与图层的对应按**影像段**，不是工程年份：L6（1973-10-17）里有 1966–1973 的东海岸，所以 1965 那条线在 L5 / L6 之间；字幕与图例说明写"按影像日期分组"。
- 体积预算：四个新地图层合计 ≤ 250 KB；`shore-1819` ≤ 30 KB；`mangroves-2020` ≤ 80 KB。
- 匹配率：已匹配面积 ≥ 新地总面积的 85%（不到就报告，不放宽规则）。
- 署名：GMW "Bunting, P. et al. (2022) Global Mangrove Watch (1996–2020) Version 3.0 Dataset, Zenodo, doi:10.5281/zenodo.6894273, CC BY 4.0; modified (polygonised and clipped)"；写进 `data/SOURCES.md`、SOURCES-GEO.md 与 `THIRD-PARTY-NOTICES`。

### 3.5 许可

- 发布文件与各自来源：`land-sg-reclaim.json` = 公有领域（旧地图、Landsat）+ SODL（URA MP2019、MP2025）；`sg-rc-added-*` 与 `sg-rc-shore-1819` = 同上派生；`sg-rc-mangroves-2020` = CC BY 4.0（单独一个文件，不与其它来源合并）；事件坐标 = Wikidata CC0 + 来源原文。全部可按 `LICENSE-CONTENT`（CC BY-NC-SA 4.0）提供，署名逐条写。
- **不进任何发布文件**：CC BY-SA 来源（Commons 1893 海图 No 2023 扫描件，及任何标 BY-SA 的 Commons 图）、OSM 几何（ODbL）、有版权或未声明许可的学术与新闻地图、Zhang 2024 的像元（只核对；它是 CC BY，可以用，但本轮不需要）。
- SODL 署名格式："Contains information from {数据集} accessed on {日期} from data.gov.sg which is made available under the terms of the Singapore Open Data Licence version 1.0"（同 four-taps）。

### 3.6 已知差距（先写下）

- 1819–1961 的岛岸（docs/28）自己的验收未过：旧地图残差、控制点分布、海图的高水位线约定（西岸红树林边缘与 Landsat 水线可差 0.5–1 km）。在本题，这种差别会在 L5 → L6 处表现成"假的新地"：由 §3.4 的"只画对得上工程的块"挡住，但岛岸本身仍会变形，阅读说明写明。
- 1961–1973 年（加冷盆地 1963–71、东海岸第一、二期、裕廊早期）要到 1973 年 10 月的影像才出现；D9 不做时这个空档留着。
- 1973 年以前的离岛按 1973 年画。
- 填海前的珊瑚礁、海草床、1953 年的红树林不画。
- 被挖掉、今天已不是陆地的小岛和沙洲：docs/28 不还原，L6–L11 的 `plus` 只有 0.1 km² 以上的。
- 每段新地显示的是那张影像的日期，不是工程年份；工程的开始与完工写在事件里。
- 2025 年以后的填海（大士港后期、长岛、西部岛）不画。

---

## 4. 引擎与管线（最小）

| # | 缺口 | 现状 | 最小提案 | 必要？ |
|---|---|---|---|---|
| E-RC1 | **面图层的面积合计** | `count: true` 只数要素个数（docs/06「按年份出现的图层」） | `datedLayers[].sum: { prop: "a", unit: { en: "km²", zh: "平方公里" }, decimals: 1 }`（与 `count` 互斥）：PLATE 一行显示当前可见要素的 `a` 之和（例 `NEW LAND 1965–89 · 42.6 KM²` / `1965–89 年新地 42.6 平方公里`），复用 `lib/datedLayers.ts` 的有序索引（前缀和，二分）；`pnpm validate` 查 `prop` 是每个要素上的有限数；docs/06 加一段；单测 + fixture 一层 | 建议（小）。不做：面积只进正文与背景章细看的表 |
| E-RC2 | **按年份的读数**（docs/34 E5，当时没做） | PLATE 只有引擎内置读数与 dated 计数 | `topic.yaml` 可选 `readouts: [{ id, label: {en, zh}, unit: {en, zh}, series: [{ t, v, s }] }]`：PLATE 显示播放头之前最近一点的值与来源上标；`t` 早于第一点时显示 `—`；本题只用一条：官方陆地面积 1960–2025（D4，66 个点，`s` = S1） | 建议（小）。不做：同上 |
| — | 年代岛岸 13 段、单文件 | 已支持（docs/28 E1，land-use 7 段） | 无。Opus 只核：13 段时 `basemap.local` 的解码与切换耗时（目标 < 5 ms / 切换）、550 KB 的加载 | 核对 |
| — | 空控制帧、`milestone`、`site`、`TopicLink ch` | 已支持 | 无 | — |

- **不需要**：新底图种类、新的控制区语义、按要素着色（四个时期用四个图层）、航线、栅格图层。
- **Plan B（E-RC1 / E-RC2 都不做）**：背景章细看给"官方面积 vs 地图量算"表；每章正文写本章相关的一个面积数；PLATE 只有引擎默认读数。不影响其它任何部分。
- **管线（Codex，全部写成本题本地脚本，不改 `scripts/geo/lib/**`、不改其它主题的文件）**：`scripts/geo/singapore-reclamation/sources.json`（清单，`pipeline.localLand.eras` 13 段）；`fetch.ts`（D1–D8，记录收据）；`coast-chain.ts`（解码 G1、G2，补离岛，写各段 GeoJSON）；`landsat-2025`（调用或复制 land-use 的方法，见 §3.3）；`l12.ts`；`check-mp.ts`（D3 核对）；`check-zhang.ts`（D5 核对）；`pieces.ts`（§3.4）；`mangroves.ts`（D6）；共享的 `local-land.ts`、`simplify.ts`、`check.ts`。共享步骤缺选项时写本地脚本产出同格式并在报告里说明。
- **文件归属**：引擎代理（Opus，一个）：`src/engines/time-scene/**`、`src/content/schema/**`、`scripts/validate-content.ts`、`tests/time-scene/**`、`src/content/topics/sample-dated-layers/**`（fixture 加一层 `sum` 与一条 `readouts`）、docs/06。Codex：`scripts/geo/singapore-reclamation/**`、`public/geo/land-sg-reclaim.json`、`public/geo/sg-rc-*.json`、`src/content/topics/singapore-reclamation/**`、`art/planned/singapore-reclamation/**`。只读：`land-sg-history.json`、`land-sg-modern.json`、`scripts/geo/singapore-land-use/**`、`scripts/geo/singapore-1819-1965/**`、其它主题。不改 `package.json`。
- **验收**：four-taps、singapore-1819-1965、singapore-land-use 的 `pnpm shoot --keys` 不回归（岛岸与图层逐像素 0 差，只允许路线虚线动画、FPS 读数不同）；本题 `--beats` 能看到每段影像日期新地出现、PLATE 面积随拖动变化（E-RC1 / E-RC2 做了的话）。

---

## 5. 名词表（`glossary.json`，12 个）

| id | term EN / ZH | 定义（EN / ZH，施工时双语写全） | see |
|---|---|---|---|
| `land-reclamation` | Land reclamation / 填海 | **与 land-use 逐字相同**："Making new land by walling off shallow sea and filling it with sand or other material." / "在浅海筑堤围起来，填进沙土等材料，造出新的陆地。" | `fill`、`polder` |
| `fill` | Fill / 填料 | 用来把海或沼泽填高的沙、土、石或灰渣 / 用来把海或沼泽垫高的沙、泥土、石块或灰渣 | `dredging` |
| `seawall` | Seawall / 海堤 | 沿海岸用石块筑成的墙，挡住海浪，也围住要填的地方 | `dike` |
| `dredging` | Dredging / 挖沙（疏浚） | 用船从海底或河底把沙和泥挖起来 | `sand-mining` |
| `sand-mining` | Sand mining / 采沙 | 从河床、海岸或海底大量挖沙出售 | — |
| `polder` | Polder / 圩田 | 被堤围起来、地面低于外面水面的土地，靠排水和抽水保持干燥 | `dike` |
| `dike` | Dike / 圩堤 | 围住圩田、把海水挡在外面的长堤 | `seawall` |
| `mangrove` | Mangrove / 红树林 | 长在热带海边、潮水涨落处的树林，根能在咸水和软泥里生长 | （与 mangrove-food-web 的 `mangrove-forest` 定义对齐，id 不同，〔Codex 比对〕） |
| `coral-reef` | Coral reef / 珊瑚礁 | 由珊瑚多年堆积成的海底礁石，许多海洋生物住在那里 | — |
| `seagrass` | Seagrass / 海草 | 长在浅海沙泥里、会开花的植物（不是海藻） | — |
| `sea-level-rise` | Sea-level rise / 海平面上升 | 因为海水变暖膨胀、冰川融化，海面平均高度慢慢升高 | `coastal-protection` |
| `coastal-protection` | Coastal protection / 海岸防护 | 用海堤、抬高的陆地或其它办法保护海边不被淹、不被冲走 | — |

每个词只包全主题第一次出现处（EN、ZH 各一处）。

---

## 6. 敏感与有争议的点（逐条处理）

1. **沙的来源**（第 04 章）：只写有来源的事：进口量（UNEP 估计）、各国政府的决定与理由、组织的指控、新加坡政府的回应、报道里官员的说法。不写"新加坡造成……"的因果句，除非来源原文这样说并标明是谁说的。2026 年柬埔寨的情况是"指控与报道"。中文 Gavin 亲审。
2. **邻国与新加坡的关系**：第 04 章不扩展到水协议、领土（白礁）等别的议题；需要时一句话链 after-1965 `neighbours`。
3. **柔佛海峡填海案**（第 03 章细看）：写提交、命令、和解三件事与日期；两国各自的主张按命令原文概括，不写胜负。
4. **生境损失**（第 06 章）：数字标作者与年份；1953 年 vs 1800 年代两种基准不连线；不用"毁灭""浩劫"。
5. **南部岛屿的居民**：搬迁按来源写年份与原因，口述史写明是谁的回忆；名称（Orang Pulau / Orang Laut / 马来村民）按来源，第一次出现加一句说明；不浪漫化"失落的岛民生活"。
6. **海平面上升**：写区间与情景；不说"新加坡会被淹没"；不评价政策。
7. **未来计划**（长岛、西部岛、2030 年目标）：写"计划 / 研究中 / 宣布"；不画；有关核电的猜测不写。
8. **数字冲突**：樟宜 707 / 745 / 870、裕廊岛 3,000 / 3,200、1822 年全岛 578 km² vs 58,150 公顷：区间两端各带来源，或只写一个并在细看说明。
9. **地图的可信度**：每段海岸来自什么、误差多大、哪里是近似，阅读说明与背景章细看写清楚；"彩色的块"不等于工程的精确范围。

---

## 7. 来源（施工时的 S#；本文用到的都列在这里）

| S# | 来源 | 状态 |
|---|---|---|
| S1 | Singapore Land Authority / Department of Statistics, "Land Area (As At December), Annual", data.gov.sg `d_0b2c034da121ef8efc71949af1694b4d`（SODL；1960–2025） | [✓] |
| S2–S9 | 复制来源：1819–1965 S2、S76、S291、S306、S368；land-use S151、S200、S207、S208、S209、S222、S227、S228（编号在本题重排，`note` 写"同某主题 S#"） | [✓继] |
| S10 | Lim Tin Seng, "Land From Sand: Singapore's Reclamation Story", *BiblioAsia* 13(1), Apr–Jun 2017, https://biblioasia.nlb.gov.sg/vol-13/issue-1/apr-jun-2017/land-from-sand/ | [✓] |
| S20 | UNEP GEAS, "Sand, rarer than one thinks", March 2014, https://unepgrid.ch/storage/app/media/legacy/35/GEAS_Mar2014_Sand_Mining.pdf | 〔待核原文〕 |
| S21 | UNEP, *Sand and Sustainability* (2019), https://unepgrid.ch/storage/app/media/documents/Sand_and_sustainability_UNEP_2019.pdf | 〔待核〕 |
| S22 | 马来西亚 1997 年停止向新加坡出口沙的官方来源 | 〔待核：未找到一手〕 |
| S23 | Cambodia Ministry of Mines and Energy, Prakas No. 236 (10 July 2017), https://data.opendevelopmentmekong.net/laws_record/prakas-no-236-on-the-end-of-permission-to-export-all-types-of-sand-and-sand-of-mud-mix-in-koh-kong- | 〔待核原文〕 |
| S24 | Indonesia Government Regulation 26/2023（2023-05-15）及 2024 年实施细则；最高法院 2025 年判决 | 〔待核：一手文本或 Jakarta Post / Mongabay 报道〕 |
| S25 | RFA, "Cambodia Bans Exports of Two Types of Sand From Koh Kong", 11 July 2017 | 〔待核〕 |
| S26 | 越南出口限制 | 〔待核〕 |
| S27 | Mongabay, "Activists allege Cambodia has resumed sea sand exports to Singapore", July 2026；"Cambodia's banned sand trade with Singapore appears to be back", August 2026 | [✓ 标题与摘要]〔待核全文〕 |
| S28 | 新加坡政府对 2016 / 2026 柬埔寨报道的回应 | 〔待核〕 |
| S30 | HDB, "Singapore's first polder at Pulau Tekong adds 800 hectares of land", Annex 1 Media Factsheet, September 2025, https://www.hdb.gov.sg/-/media/hdb-pulse/news/2025/singapores-first-polder-at-pulau-tekong-adds-800-hectares-of-land/Annex-1---Media-Factsheet.pdf | 〔待核：PDF 是图片，需读 HDB 新闻页正文〕 |
| S31 | Malay Mail / Dredging Today 报道，2025-09-08 / 09 | [✓ 摘要] |
| S40 | ITLOS, Case No. 12, Land Reclamation by Singapore in and around the Straits of Johor (Malaysia v. Singapore), Order of 8 October 2003, https://www.itlos.org/en/main/cases/list-of-cases/case-no-12/ | [✓ 案件页]〔待核命令段落〕 |
| S41 | Award on Agreed Terms, 1 September 2005, UN RIAA vol. XXVII pp. 133–145, https://legal.un.org/riaa/cases/vol_XXVII/133-145.pdf | 〔待核〕 |
| S50 | Hilton, M. J. & Manning, S. S. (1995), "Conversion of coastal habitats in Singapore: indications of unsustainable development", *Environmental Conservation* 22(4): 307–322 | [✓ 摘要]〔待核全文〕 |
| S51 | NParks, "Mangrove forests in Singapore", https://biodiversitysg.nparks.gov.sg/our-ecosystems/coastal-and-marine-habitats/mangrove-forests-in-singapore/ | [✓ 摘要] |
| S52 | Yaakub, S. M. et al. (2014), seagrass paper citing Chou (2008), https://www.seagrasswatch.org/wp-content/uploads/Resources/Publications/2014/PDF/Yaakub_et_al_2014.pdf | [✓ 摘要]〔待核卷期〕 |
| S53 | Chou, L. M. (2008)（原文） | 〔待核〕 |
| S54 | Bunting, P. et al. (2022), Global Mangrove Watch v3.0, Zenodo, doi:10.5281/zenodo.6894273（CC BY 4.0）；论文 *Remote Sensing* 14: 3657 | [✓ 元数据] |
| S55 | Zhang, Q. (2024), *Global dynamics of coastal reclamation and its impact on biodiversity and blue carbon*, figshare, doi:10.6084/m9.figshare.25556901.v4（CC BY 4.0） | [✓ 元数据]（只核对） |
| S60 | Mongabay, "Singapore's plan to merge several islands could wipe out coral reefs", September 2026 | [✓] |
| S61 | 黄循财总理 2026 年国庆群众大会演讲（2026-08-23），PMO 原文 | 〔待核〕 |
| S62 | 政府宣布绘制海洋与海岸生境图（2026 年 9 月） | 〔待核〕 |
| S63 | 仄爪哇 2001 年暂缓填海（NLB Infopedia / NParks） | 〔待核〕 |
| S64 | 姐妹岛海洋公园（NParks） | 〔待核〕 |
| S65 | 南部岛屿居民迁移（NLB / NAS 口述史） | 〔待核〕 |
| S66 | NEA，实马高垃圾埋置场 | 〔待核〕 |
| S70 | Centre for Climate Research Singapore, *Third National Climate Change Study (V3)*（2024） | 〔待核：MSS 原文；报道已读〕 |
| S71 | PUB, Coastal Protection（含"约 30% 土地低于 5 m"、2020 年成为海岸防护机构）https://www.pub.gov.sg/Public/KeyInitiatives/Flood-Resilience/Coastal-Protection | 〔待核：旧链接 404〕 |
| S72 | 海岸与防洪基金（2020 年预算） | 〔待核〕 |
| S73 | Long Island 官方页 https://go.gov.sg/Long-Island | [✓ 摘要]〔待核〕 |
| S74 | Centre for Liveable Cities, "Box Story: The Long Island Project" | [✓ 摘要] |
| S80–S99 | 数据集：D1–D8 每个一条（景号 / 数据集号、日期、许可原文）；G1–G4 照抄原主题的数据来源条目 | 施工时 |

来源优先级：政府统计与法律文本 > 国际法庭文件 > 同行评审论文 > 国家图书馆 / 档案馆 > 政府新闻稿 > 报道 > 维基百科（只作索引）。挡爬虫的站点读 Wayback 存档并写明。

---

## 8. 图像（给 Codex，严格）

风格 = `STYLE_BRIEF`（石墨铅笔、标本图版、透明底、无文字）；章节图 4:3，`pnpm tsx scripts/illustrate.ts figure <src.png> singapore-reclamation-<id>`；首页图 `pnpm tsx scripts/illustrate.ts cover …`。**所有图都不许出现**：人、可读文字、数字、刻度、箭头、标志、旗、公司标识、某一座可辨认的真实建筑、地图、船名、机器上的品牌；**不画**挖沙船在别国海岸作业、不画被淹的城市、不画"消失的岛"。caption 写"为本主题画的示意图，依据……（来源 S#）"。每张图交付前对照 SUBJECT 逐项检查，不合就重画，不放宽。

| id | 用在 | SUBJECT（原样给 Codex） | 必须对的地方 |
|---|---|---|---|
| `singapore-reclamation`（首页） | 首页 / 封面 | "A specimen block of a tropical shoreline cut square like a museum model: on the left the original low shore with a fringe of mangrove trees on soft mud; in the middle a straight rock seawall of large armour stones; on the right of the seawall a level platform of pale sand fill that sits higher than the flat sea surface around it; the sea surface is calm and flat; neutral graphite, three-quarter view from above, no buildings, no machines, no people, no text, no ground shadow." | 填土高于海面；海堤是大块石；红树林在原海岸一侧 |
| `reclamation-fill` | 02 | "A cross-section specimen block of land reclamation by filling, square-on side view: at the bottom the original soft grey seabed; on the right a sloping seawall of large armour rocks on a core of smaller rock and gravel, its top above the flat sea surface; behind the seawall, layers of pale sand fill rising from the seabed to a level surface above the sea; a thin layer of darker earth on top; the sea on the far right is a flat surface; cut faces clean and flat; neutral graphite; no machines, no pipes, no buildings, no people, no labels, no arrows, no cavern, no ground shadow." | 没有岩洞（与 land-use 的图区分）；海堤在海一侧；填土顶面高于海面 |
| `hill-to-shore` | 01、02 | "Two specimen blocks side by side at the same scale, square-on side view. Left block: a low rounded hill whose top has been cut away in flat steps, the removed part shown only as a faint dashed outline above it. Right block: a shallow shore where the same amount of reddish-brown earth forms a new flat layer over the old grey seabed, behind a low rock edge, its top just above a flat sea surface. Neutral graphite, the earth in both blocks the same tone so they read as the same material; no machines, no carts, no people, no arrows, no text, no ground shadow." | 两块同比例；左边被削的部分是虚线轮廓；右边新土与左边同色 |
| `polder-section` | 05 | "A cross-section specimen block of a polder, square-on side view: on the right the open sea with a flat surface; a broad dike of rock and clay holding the sea back, its top well above the sea; on the left of the dike a wide flat area of land whose surface is clearly LOWER than the sea surface outside; a straight drainage ditch running along the land, a wider shallow pond of still water at the left end, and a small plain box-shaped pumping house on the dike with a single plain pipe going over the dike top to the sea; underneath everything the original grey seabed; neutral graphite; no people, no text, no arrows, no numbers, no ground shadow." | 圩田地面**低于**外面海面（这是本图的重点）；抽水管越过堤顶通向海一侧；蓄洪池水面低于海面 |
| `natural-and-reclaimed-shore` | 06 | "Two specimen blocks side by side at the same scale, square-on side view, both with the same flat sea surface. Left block, a natural shore: mangrove trees with prop roots on soft mud at the top of the slope, then a bare mudflat, then a low meadow of seagrass in shallow water, then a fringing coral reef with a few rounded coral colonies at the outer edge. Right block, a reclaimed shore: a steep rock seawall rising straight from deeper water to a high flat platform of sand fill; no plants, no reef. Neutral graphite; no animals drawn larger than life, no people, no text, no arrows, no ground shadow." | 左边从岸到海：红树林 → 泥滩 → 海草 → 珊瑚礁，顺序不能错；右边没有生物 |

图数：首页 1 + 章节 4 = 5（全部新画）。不画：挖沙船、运沙驳船、具体的人、海平面上升的城市、地图（地图本身就是图）。

---

## 9. 施工顺序、验收与待定

### 9.1 施工顺序与分工

| 步 | 内容 | 谁 | 产出 | 过关 |
|---|---|---|---|---|
| R | 补充研究：§1.3 全部〔待核〕、§7 每条来源的原文摘录（≤ 25 词）、工程表 `projects.json`、8 个 site 的 Wikidata QID 与坐标 | Codex（与 E 并行） | `src/content/topics/singapore-reclamation/RESEARCH.md`、`scripts/geo/singapore-reclamation/research/` | 每条有出处与原文；查不到标"未能核实"，不进正文 |
| E | E-RC1、E-RC2（若 Gavin 同意） | Opus | §4 文件归属 | §4 验收；三个既有新加坡主题不回归 |
| M | 地图：先 L12 与 L5 → L6 的新地分块并排图，过了再铺其余；D3、D5 核对；红树林 | Codex | §4 管线文件、`docs/screenshots/singapore-reclamation/{coast,pieces,check}-*.png`、`pieces-report.md` | §3.3 / §3.4 预算；匹配率 ≥ 85%；`rings` 0 / 0 |
| C | 脚手架 `pnpm tsx scripts/new-topic.ts singapore-reclamation --engine time-scene --subject geography --title-en "Singapore's Moving Coastline" --title-zh "新加坡的海岸线：填海两百年" --start 1819-02-06 --end 2026-08-31`；背景章 + 第 01、04 章做模板章（EN 初稿） | Codex | 主题目录 | `pnpm validate` 绿 |
| H | 史学 / 客观性复核、英文改写 | Opus | `AUDIT.md`、`REVIEW.md` | §1.2 用词表、§6 逐条过 |
| Z | 中文独立成文 | Claude | 全部 `zh` 字段 | Gavin 亲审的段落单列 |
| B | 节拍、`pnpm shoot singapore-reclamation --beats --keys --layout --locale en,zh`、QA | Sonnet | 截图 | 节拍 0 失败、unlabelled 与 chapter highlights 清单为空 |
| I | 图像 5 张 | Codex | `art/planned/singapore-reclamation/` | §8 逐项 |

模板章先给 Gavin 看：背景章（13 段岛岸、四个时期、1819 海岸线）+ 第 01 章（旧地图段、城区镜头）+ 第 04 章（最敏感的一章）。同一时间只有一个代理改 `events.json`。

### 9.2 验收（`acceptance.md` 之外，本主题另加）

- [ ] **地图只用真实数据**：13 段岛岸、四个新地图层、1819 海岸线、红树林在 `data/SOURCES.md` 与 `SOURCES-GEO.md` 都有一行（来源、许可原文、方法、偏差、已知差距）；没有手画多边形、没有 `bbox` 当范围；CC BY-SA、OSM 几何、有版权的图只在 `refs/`。
- [ ] **新地都有工程**：每个上色块在 `pieces-report.md` 里对上 `projects.json` 的一项；未匹配块已列出并由主会话看过；匹配率 ≥ 85%。
- [ ] **日期对得上**：任何一拍里新上色的地只在它那段影像 / 地图日期之后出现；字幕写影像日期，不写成完工日期；L12 去掉的"规划未填"块已列出。
- [ ] **两个来源岛岸文件未改**：`land-sg-history.json`、`land-sg-modern.json` 的 SHA-256 与施工前相同；本题 L0–L11 与它们解码出的几何一致（离岛补丁除外，单测比对）。
- [ ] **复制的东西逐字节相同**：7 个复制事件、`land-reclamation` 定义、复制来源条目（脚本比对，同 docs/34 的 four-taps 比对法）。
- [ ] **不重讲**：组屋、地铁、往地下 / 往高处、港口作业、独立后政治都只有一句话 + `TopicLink ch`。
- [ ] **两边写**：沙的来源、柔佛海峡案、生境代价、西部岛各有两边的来源；没有"我们"、没有 §1.2 不写列里的词。
- [ ] **数字**：F1 两端用官方数并写口径变化；樟宜、裕廊岛的冲突数并列；红树林两种基准不连线；海平面区间两端都在；F26 的跳升未核前不写因果。
- [ ] **未来不画**：长岛、西部岛没有任何几何。
- [ ] 界面上没有年级；`levels` 只在 topic.yaml。
- [ ] 图像 5 张：§8 每张的"必须对的地方"都对；没有人、字、箭头、标志。
- [ ] 第 03 章细看（柔佛海峡）、第 04 章、第 06 章的生境与居民段落的中文 Gavin 已审。
- [ ] four-taps、singapore-1819-1965、singapore-land-use 的 `--keys` 不回归。

### 9.3 待 Gavin 确认（只列真正需要他决定的）

1. **§0 各条**（章数、13 段岛岸、离岛补丁、只画对得上工程的新地、红树林只画 2020、不画沙与未来）——不改就照 §0.1。
2. **下载**：§3.2 D1–D8（合计约 165 MB 下载、其中真正留用约 25 MB；D5、D7 只核对）。批准后 Codex 才 fetch。
3. **CORONA（D9）**：要不要以你的名义注册 USGS EarthExplorer 账户，补 1960 年代末的一段岛岸（加冷盆地、东海岸第一期、裕廊早期）。不注册也能发布，空档写进已知差距。
4. **v2 是否用 MP2008 / MP2014 边界加两段岛岸**：取决于 D3 的核对结果，M 步报告后再定。
5. **引擎 E-RC1 / E-RC2**：做不做（都小；不做走 Plan B）。
6. **中文亲审**：§0.1-5 列的段落。

---

## 10. 起草时的不确定（施工前先解决或保留）

- `land-sg-history` 的 L0–L5 自己的地理验收还没过（§3.6）；本题最依赖它的是第 01 章城区镜头与背景章的 1819 海岸线。若 Gavin 认为不够，第 01 章可以改成"只讲年表 + 城区三拍"，背景章去掉 `shore-1819`。
- land-use 的 `coast-statistics.json` 里大部分 `minus` 块写"unmatched"（L6 36 块中 30 块），工程匹配的工作量可能比 §3.4 估计的大；匹配率不到 85% 时先报告。
- MP2025 的"No Sea"边界是否已含 2025 年还没填完的大士港后期地块，要等 D2 / D1 比对才知道。
- 德光岛圩田的开工年、海堤长度、交付日期，HDB 原文还没读到（资料 PDF 是图片）。
- 1953 年红树林 63.3 km² 与 NParks"剩下不到 5%"基准不同；珊瑚礁约 60% 来自二次引用（Chou 2008 原文未读）。
- 马来西亚 1997 年禁令、越南的限制没有找到一手来源。
- 2026 年"西部岛"只有报道，总理演讲原文未读；政府绘制生境图的公告未读。
- Zhang（2024）的数据是全球深度学习产品，对新加坡的精度未知；只作核对。
