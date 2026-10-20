# 34 · 新加坡的家、粮、路：土地利用的变化 · 内容施工 spec（v1）

TimeScene / GeoStage，paper 默认、cinema 可切。按 skill `atlas-history-topic` 的 `spec-template.md` 写，岛尺度底图照 docs/24（`four-taps`）与 docs/28（`singapore-1819-1965`，年代岛岸 E1 / E2 / P1 已落地）。**§0 由主会话按 Gavin 惯例代定（§0.1），Gavin 已说"做"；他可逐条推翻。**

- slug：`singapore-land-use`；标题 EN "Homes, Food and Getting Around: Singapore's Land" / ZH "新加坡的家、粮、路：土地利用的变化"；副标题 EN "How a small island changed its land, 1959–today" / ZH "一座小岛怎样改变土地的用途（1959 年至今）"；`shortTitle` EN "Singapore's land" / ZH "土地利用"。
- 课纲：MOE 2020 SS 课纲 P3（S1，§1.1 原文），docs/17 §4、§6 #12。`levels: [P3]` 只是规划元数据，**界面任何地方不出现年级**。`subject: geography`，`tags: [singapore, geography, map]`。
- **调查结论**（Codex 研究 `art/codex-research/singapore-land-use/`，2026-10-20 完成，136 条带出处的事实、33 个数据集；本文 2026-10-20 另查 Commons）：①今天的一端数据齐全且许可干净——URA 总蓝图 2003 / 2008 / 2014 / 2019 土地用途层、HDB 现存楼宇轮廓与组屋信息（含竣工年份）、URA 铁路线层、NParks 公园与自然保护区，全部 SODL；②1950–1980 年代**没有**许可干净的整岛土地利用图：国家档案馆的 1950 年地形图、1958 / 1980 / 1985 年总蓝图，NUS 托管的 1953 / 1966 / 1975 年 1:25,000 地形图都要 SLA / URA / NAS 许可；③能用的公有领域整岛图只有 **1959 年英国新闻处地图**（BIS，PD-UKGov，城区、海军基地、沼泽、森林、机场、蓄水池）；④1961 年以后的海岸没有公开的分年代 GIS，学术图（Wong 1992 / Hesp 1995、Glaser 1991）有版权——**本文改用 Landsat 卫星影像（USGS，公有领域）按固定方法提取海岸**（§3.3）。
- **引擎结论**（§4）：年代岛岸（`basemap.local` 带日期的 `land`）、今天海岸虚线、`persist` 线、`colorBy: entity`、`strings`、`certainty: approximate`、`TopicLink ch` 都已有。唯一必须补的是 **E1"按年份出现的图层"**（docs/17 C2：上万个组屋点、工业区、农业科技园、自然保护区、蓄水池按年份出现，各有自己的 `[from, to)`），它是 `lib/dated.ts`（河流、岛岸已在用）的第三个用户；另加两个小改动：控制区允许**空帧**（E2，让 1959 年与 2019 年两张整岛土地利用图只在自己的年份附近出现）、事件新增中性的 `milestone` 种类（E3）。E1 排不进时有退路（§4 Plan B，不改引擎）。

---

## 0. 决策（2026-10-20 起草，主会话按 Gavin 惯例代定，见 §0.1）

| # | 决定（建议） | 选项 / 理由 | 定稿 |
|---|---|---|---|
| 1 | **章数**：背景章 00 + 6 章（§2）。时间轴从 1959-04-01（BIS 地图出版，K1）到 2025-12-31。四条主线 = 课纲三条（粮、住、行）+ "多出来的土地"（填海、地下、往高处），第 06 章收在"今天怎样分配一座岛"并回到"在地图上找到你住的地方" | 另一选项 00 + 4（只做课纲三条）。不建议：填海、蓄水池、工业区、自然保护区是土地变化的另一半，课纲"在地图上认识新加坡的地方"也需要一章收尾 | 定稿 |
| 2 | **两张整岛土地利用图，只在自己的年份出现**：K1 = 1959 年 BIS 地图配准描摹（城区、海军基地、其余是"甘榜、农场与种植园"）；K4 = URA 总蓝图 2019（**规划用途**，写明）。1966–2018 年之间控制区是**空帧**（E2），这段时间地图上只有有日期的真实数据（海岸、组屋、工业区、农业科技园、保护区、蓄水池、地铁）。**不**用 1959 → 2019 的交叉淡化去"补"中间年份，也**不**拿 MP2003 / 2008 / 2014 当作那几年的实际土地利用（它们是规划，§1.2） | 另一选项：用 Landsat 分类图做 1973 / 1988 的"建成区 / 绿地"整岛图。暂不做（只能分出地表覆盖，分不出农场与甘榜），列入 §9 之后的可选扩展 | 定稿 |
| 3 | **8 个土地用途类别当作实体**（`colorBy: entity`，全部 `bloc: neutral`，颜色手工固定 `token:holder-1…8`）：住宅、甘榜农场与种植园、农业用地、工业、绿地与自然保护区、交通、国防与特殊用途、城区商业与公共设施（§2.3）。控制区和 E1 图层**共用**这 8 个类别的颜色与图例 | 不用阵营色；不为每座新镇建实体（新镇是事件 + 组屋点） | 定稿 |
| 4 | **组屋按竣工年份一栋栋出现**：HDB 现存楼宇轮廓（形心作点）× 组屋信息的 `year_completed`。**点是"今天还在的楼"**：1960 年代建、后来拆掉重建的楼不在图上，阅读说明与第 01 章写明，早年的数量用 HDB 年报的数字补（正文，不画） | 不用 OneMap 逐栋地理编码（要令牌、要条款）作为主路径，只作补漏（§3.4、§8.3-2） | 定稿 |
| 5 | **年代岛岸**：本主题自己的 `public/geo/land-sg-modern.json`。L4（–1961）、L5（1961–）**取自** `land-sg-history.json` 的同名时代（不改那个文件）；L6–L10 由 Landsat 影像按固定的水体指数方法提取（1973 / 1981 / 1990 / 2000 / 2010 前后各一景，日期按实际影像），L11 = URA 2019 今天的陆地。今天海岸虚线照常 | 改 `land-sg-history.json` 加时代：不建议——那个主题还在 Codex 第三轮地图里，文件归属会打架 | 定稿 |
| 6 | **蓄水池与 four-taps 一致**：几何、名字、日期、来源**照抄** four-taps（id 加前缀不变），正文 `<TopicLink slug="four-taps" ch="…">` 链过去；Codex 新查到的不同日期（滨海蓄水池 2008 堤坝启用 / 2010 投入使用等）写进细看，不改 four-taps | 同 docs/28 对 ww2 的做法 | 定稿 |
| 7 | **居住条件与搬迁两边写**：得到的（自来水、电、卫生、防火、产权、学校诊所）和失去的（甘榜邻里、农地与生计、祖坟与庙宇迁移、搬迁初期的不适应、对补偿的不满）都写，按来源写谁说的；河水山大火的起因写"至今不明"（NLB），并写居民中流传的说法与史家的研究（§1.2 争议表）。不写成"从贫民窟到花园城市"的成功故事，也不写成控诉 | | 定稿 |
| 8 | **"30 by 30" 写成过去的目标**：2025 年 11 月起是"新加坡食物故事 2"（2035 年纤维类 20%、蛋白质类 30%）；两个都写明定义，不当成整体自给率 | Codex 研究 §3 | 定稿 |
| 9 | **精度**：日期到天（默认）；只知道年 / 月的照写年 / 月。组屋点、蓄水池、工业区只到**年**（数据只有年份），图层说明写明 | | 定稿 |
| 10 | **中文用新加坡通行写法**：组屋、建屋发展局（建屋局）、新镇、甘榜、亚答屋、河水山、女皇镇、大巴窑、宏茂桥、淡滨尼、榜鹅、林厝港、裕廊、樟宜、兀兰、登加、双溪布洛、总蓝图、农业科技园、地铁、轻轨、蓄水池、填海、拥车证、电子道路收费（§5，Z 步逐个按 NLB、《联合早报》、华文课本核） | | 定稿 |
| 11 | 不做：测验、配音、视频、真实人物肖像、品牌（地铁线不用官方线色与标志，统一用"交通"类颜色，线名写字）、未来规划（2030 年以后的填海、长期规划图）只在细看里用文字提，不画 | | 定稿 |

### 0.1 代定（2026-10-20，主会话按 Gavin 惯例）

1. §0 全部按建议：00 + 6 章；1959 与 2019 两张整岛图 + 中间只画有日期的真实数据；8 类土地用途当实体；组屋点 = 今天还在的楼；本主题自己的年代岛岸文件（Landsat 方法）；蓄水池照抄 four-taps；搬迁两边写。
2. 地图数据只来自：BIS 1959（PD-UKGov）配准描摹、Landsat（USGS 公有领域）按固定阈值提取、URA / HDB / NParks / LTA 的 SODL 数据、Wikidata（CC0）读坐标；OSM 只用于给 URA 水面配名字（同 four-taps，ODbL 署名照抄）。NAS、NUS / SLA、学术论文里的地图只作核对，不描、不发布（§3.6）。
3. 引擎（Opus）：E1 必须、E2 必须（小）、E3 建议（小）、E4 / E5 建议（§4）。
4. 施工外包：Codex 做补充研究（§1.3 的〔待核〕）、数据管线、Landsat 海岸、BIS 描摹、英文初稿、图像；Opus 史学 / 客观性复核；中文由 Claude 独立成文；Sonnet 节拍与 QA。

---

## 1. 范围、立场、必须讲对的事实

### 1.1 课纲原文（S1：MOE CPDD，*2020 Social Studies Primary Teaching and Learning Syllabus*，"Updated as of January 2024"，印刷页码）

- 第 23 页，P3 标题与探究问题："Primary Three: Understanding Singapore's Environment and Challenges"；Inquiry Focus："What is Singapore's environment like and how do we overcome the challenges we face?"；Key Understandings："Knowing the location of places in Singapore helps me know my country better." · "We use resources wisely to protect the environment." · "We adapt to overcome challenges to meet our needs."
- 第 23 页 Knowledge Outcomes（本主题对上的几条）："recognise places in Singapore;" "identify the location of places in Singapore on the map;" "recognise that there are challenges in Singapore's environment; and" "describe how Singapore adapts to overcome challenges and meet needs."；Key Concepts："Place · Environment · Conservation · Change and Continuity · Adaptability"。
- 第 24 页："Locating where we live and places we know on the map of Singapore" · "Location and purpose of different places in Singapore"；"Conservation efforts"。
- 第 25 页（本主题的主干）："WE ADAPT TO OVERCOME CHALLENGES TO MEET OUR NEEDS." · "Changes in land use to meet our needs" · "Food — Challenges in meeting the needs of farming in Singapore — Changes in the types of farms over time — Technological advancements in farming" · "Housing — Challenges in the provision of housing in Singapore — Changes in living conditions over time — Improvements in public housing estates to cater to societal needs" · "Transport — Challenges in the provision of transport in Singapore — Changes in Singapore's transport system over time"。
- 第 26 页 Field-based Learning："Sustainable Singapore Gallery"、"Singapore Mobility Gallery"，学习重点含 "land use in Singapore"。
- 2024-07 更新版仍下载不到（404），差异**待核**（docs/17 §8.1-2）。

对应：第 01–02 章 = Housing（居住条件、组屋新镇的改进）；第 03 章 = Food（农场类型、农业技术）；第 04 章 = Transport；第 05 章 = 土地不够怎么办（适应：填海、地下、往高处）；背景章与第 06 章 = 在地图上认识地方、各处的用途、保护（自然保护区、集水区）。

### 1.2 范围、读者、立场与口吻

- 时段：1959 年至今；背景章回看 1950 年代（拥挤的城区、甘榜、两万个农场）。地域：新加坡本岛与离岛，不画马来西亚（柔佛只在海岸线外作底图）。
- 读者：P3 学生和家长。每章正文 EN 180–260 词 / ZH 320–460 字（比 docs/28 短一档，读者年龄小），3–4 段，细看 2–3 块。句子短；每个数字只给一个最需要的。
- **立场（最高优先级）**：
  - 不写"从贫民窟到花园城市""奇迹""先辈披荆斩棘""我们的组屋"；不用"我们 / 我国"。写"政府""建屋发展局""居民""农民"，写谁做了什么、为什么、谁得到什么、谁失去什么。
  - **甘榜不是"贫民窟"的同义词**：甘榜是村子，有的通水电、有的没有（Codex `kampong-services-varied`、`living-services`），邻里互助（`living-kampong-community`）。"非正式住区 / squatter settlement"只在来源这样说时用，附说明。
  - **规划不是现状**：总蓝图是"可以怎样用"的规划（`master-plan-meaning`），地图标签与字幕一律写"规划用途 / planned use"。
  - **地图上的点是今天还在的楼**，不是当年建的全部。
  - **搬迁两边写**：政府当时的理由（住房短缺、防火、卫生、需要土地建新镇、工业和蓄水池）与居民的经历（补偿、搬迁时间、生计、社区、信仰场所）并列；口述史写明是谁的回忆。
- 用词表：

| 不写 | 写 | 说明 |
|---|---|---|
| 贫民窟（泛指甘榜） | 甘榜（村子）；拥挤的店屋隔间；没有自来水和电的木屋区（按来源） | 名词表 `kampong` |
| 清除甘榜 | 甘榜居民搬迁；政府征用土地 | 写清谁决定、怎么补偿 |
| 新加坡人终于住上了好房子 | 到 1990 年，每 100 名居民中约 87 人住在组屋（按来源写分母） | 数字带来源，分母按 F6 |
| 消灭养猪场 / 落后的农业 | 1975–1984 年约 8,000 个农场停业 | 写原因（土地、蓄水池水质）和农民的去处 |
| 填海造地，变不可能为可能 | 用沙土把浅海填成陆地（填海），海岸线向外推 | 写沙从哪里来的争议在细看 |
| 总蓝图上的 2019 年土地利用 | 2019 年总蓝图里每块地的**规划用途** | |

### 1.3 必须讲对的事实（施工时每条配 `<Num>` / `sources`；C-id = Codex `facts.json` 的 id，已有出处与原文摘录；〔待核〕= Codex R 步补查）

| # | 事实 | 写法 | 来源 | 注意 |
|---|---|---|---|---|
| F1 | **1950 年代的岛** | 1957 年总人口 1,445,929；1959 年约 20,000 个农场；1960 年底陆地面积 581.5 km² | C `total-population-1957`、`farms-1959`、`land-area-dec-1960` | 农场数是 SFA 的回顾数字，写"据新加坡食品局" |
| F2 | **城里怎么住** | 约 1960 年，一些家庭住在与别家共用的店屋小隔间里；数以千计的人住在没有自来水、电不稳定、卫生差的住区（不推到所有甘榜） | C `living-shophouses`、`living-services` | 甘榜的亚答屋：坡顶、棕榈叶盖顶、地板架高（C `living-attap-material`） |
| F3 | **建屋发展局成立** | 1960 年 2 月 1 日〔待核〕接替新加坡改良信托局（SIT）；SIT 1927–1959 年建了约 2.3 万个单位〔待核〕；第一个五年建屋计划（1960–1965）的目标与实际数〔待核〕 | Codex R：HDB 年报、NLB Infopedia；Commons 上的 HDB 年报 1964–1975（CC0 声明可疑，只作文字来源） | 1953 年 SIT 规划女皇镇是第一个卫星镇（C `town-queenstown-1953`） |
| F4 | **河水山大火** | 1961 年 5 月 25 日；约 100 英亩；约 16,000 人失去家园，4 人死亡；起因不明；1962 年 2 月前受灾家庭全部安置；到 1967 年在原地及周边建了 12,562 个单位（含一房式紧急组屋）；五座楼九个月建成 | C `living-bhs-*` 七条 | 起因写"至今不明"；居民中流传的说法与 Loh Kah Seng（2013）的研究写在细看（§1.4） |
| F5 | **组屋自置居所** | 1964 年 2 月〔待核〕"居者有其屋"计划开始出售组屋 | Codex R | |
| F6 | **住在组屋的人口比例** | 1960 年 9%；1965 年 23%；1970 年 35%；1980 年 67%；1990 年 87%；2025 年 3 月底 76.0% | C `hdb-population-share-*`、`hdb-resident-share-2025-03-31` | **分母不同**：1960、1965、1975 是总人口，1970 与 1980 年起是居民；正文只写 1990 年与今天两点，细看表格标分母 |
| F7 | **土地征用** | 1966 年《土地征用法令》〔待核：通过与生效日期〕；补偿按法令规定的市值计算〔待核〕；国有土地的比例从 1960 年代约四成多到今天约九成〔待核，两端各要来源〕 | Codex R：Singapore Statutes Online、NLB、学术来源 | 两边写：政府的理由（公共用途、地价不让少数人得利）与地主、居民的不满（补偿低于市价的说法，按来源） |
| F8 | **新镇** | 女皇镇 1953 年规划；大巴窑 1964 年整地、HDB 第一个全面规划的新镇；宏茂桥 1973 年第一批板式楼；淡滨尼 1979 年动工；登加 2023 年 8 月首批居民领钥匙 | C `town-*` | 新镇没有单一"建成年份"：写规划 / 动工 / 首批钥匙，不编 |
| F9 | **裕廊工业区** | JTC 把裕廊工业区的构想定在 1961 年；裕廊镇管理局 1968 年成立〔待核日期〕 | C `jurong-industrial-1961`；Codex R | |
| F10 | **农场减少** | 1970 年代初农地约 14,000 公顷降到约 8,400 公顷；1975–1984 年约 8,000 个农场停业，剩约 7,900 个；1980 年代农地约 1,500 公顷 | C `farm-land-early-transition`、`farm-phase-out-1975-84`、`farmland-1980s-rounded` | "1980 年代"是笼统年代，不写成 1980 年 |
| F11 | **养猪业逐步停止** | 1984 年宣布〔待核〕、1990 年前后结束〔待核〕；原因：土地、蓄水池水质〔待核原文〕；榜鹅养猪区 | Codex R：NLB、PUB、国会记录 | 与 four-taps 的集水区写法一致 |
| F12 | **农业科技园** | 1986 年 URA 为六处农业科技园划出 3,555 公顷（林厝港、姆赖、双溪登加、义顺、罗央、亚妈宫）；1986 年 9 月的计划书提出 1986–1992 年 2,000 公顷；2000 年在园区约 1,465 公顷中有 937 公顷用来耕作 | C `agrotech-1986-land-reservation`、`agrotech-programme-1986`、`farm-area-2000-fao` | "划出"≠"耕作"，两个数不接成一条线；中文地名〔待核〕 |
| F13 | **今天的农场与食物** | 2024 年 153 个陆上、72 个海上食物农场；本地鸡蛋约 34%、蔬菜约 3%、海产约 6%；新加坡第一个室内农场 2014 年；"30 by 30"（2030 年本地生产满足 30% 营养需要的能力）是**以前**的目标；2025 年 11 月起：2035 年纤维类 20%、蛋白质类 30%；2025 年实际约 8% 与 25% | C `food-farms-2024`、`local-food-shares-2024`、`farm-indoor-2014`、`previous-30-by-30-target`、`food-story2-*`、`local-fibre-protein-2025` | 纤维类、蛋白质类都写定义；"九成以上食物进口"之类的说法要来源〔待核〕再用 |
| F14 | **交通** | 1975 年 6 月 2 日区域执照计划〔待核〕；1981 年 7 月 1 日樟宜机场启用〔待核〕；1987 年 11 月 7 日第一段地铁（大巴窑—杨厝港）；1990 年东西线到文礼；2003 年东北线；2009 年 5 月 28 日环线第一段；滨海市区线 2013-12-22、2015-12-27、2017-10-21；汤申—东海岸线 2020-01-31；1990 年拥车证〔待核〕；1998 年电子道路收费〔待核〕；地铁长度 1990 年 67 km、2024 年 242.5 km | C `mrt-*`、`ewl-original-complete`、`nel-opening-year`、`ccl-first-stage-opening`、`dtl-stage-*`、`tel-first-stage-opening`、`mrt-network-length-*`；Codex R | 第一段载客与 1988 年 3 月 12 日正式开幕分开写；轻轨另算（271.3 km 是含轻轨） |
| F15 | **陆地面积** | 1960 年 581.5、1980 年 617.8、2000 年 682.7、2024 年 735.7 km²（年底） | C `land-area-dec-*` | 2002 年起计算口径改变（C `land-area-method-break`），细看写明 |
| F16 | **填海** | 东海岸填海 1966 年起〔待核〕；樟宜机场的填海地〔待核〕；裕廊岛：七个南部岛屿连成约 3,000 公顷，2000 年 10 月正式开幕〔待核日期〕；滨海湾填海 1970–1990 年代〔待核〕；大士 | C `jurong-island-reclamation`；Codex R：NLB "Land From Sand"（文字）、JTC、URA | 填海用的沙从哪里来（进口、邻国禁运的报道）写细看，按来源两边写〔待核〕 |
| F17 | **往地下、往高处** | 裕廊岩洞 2014 年 9 月启用〔待核〕；达士岭组屋 2009 年落成、50 层〔待核〕；HDB 组屋信息里 `max_floor_lvl` 按竣工年代的中位数（由数据算出，写明是计算值） | Codex R；D05 计算 | |
| F18 | **蓄水池** | 照抄 four-taps 的日期与来源；Codex 的补充（上贝雅士 1975 年完工、1977 年 2 月 27 日开幕；班丹 1974 年形成、克兰芝—班丹计划 1975 年完成；勿洛 1986 年，原是采沙场；下实里达 1986 年筑坝；滨海 2008 堤坝 / 2010 投入使用；榜鹅、实龙岗 2011） | four-taps `sources.json`；C `reservoir-*` | 两套日期并存时细看写明各自指什么 |
| F19 | **自然保护区与绿地** | 1963 年植树运动、1967 年公园与树木组、1970 年花园城市行动委员会；武吉知马与中央集水区保护区、双溪布洛湿地保护区、拉柏多自然保护区的设立 / 宪报年份〔待核〕 | C `green-history`；Codex R：NParks、法令 | 公园今天的边界≠当年的植被 |
| F20 | **总蓝图** | 总蓝图显示"允许的土地用途和密度"；2019 年版 2019 年 11 月 18 日批准 | C `master-plan-meaning`；D01 | 地图标签写"规划用途" |
| F21 | **最后的甘榜** | 罗弄万国甘榜（Kampong Lorong Buangkok）〔待核名称写法与现状〕 | Codex R：NLB、URA | 只作地点，不写成怀旧 |

### 1.4 争议与两边写

| 题目 | 一边（按来源） | 另一边（按来源） | 写在哪 |
|---|---|---|---|
| 河水山大火的起因 | NLB：起因至今不明 | 当年居民中有人纵火的传言；Loh Kah Seng, *Squatters into Citizens*（NUS Press, 2013）〔待核页码与原话〕研究了这些说法与政府的回应 | 第 01 章细看 |
| 土地征用的补偿 | 政府：土地用于公共用途，补偿按法令；地价上涨的好处不该归少数地主〔待核出处〕 | 地主与居民：补偿低于市价、搬迁时间紧的说法〔待核出处〕 | 第 02 章细看 |
| 甘榜搬迁 | 新居有自来水、电、卫生设施，防火，可以买下组屋（F2、F4、F5） | 失去邻里、田地、牲口与生计，初期不适应、要人帮忙看英文合同（C `living-adjustment`、`living-resettlement-personal`） | 第 02 章正文与细看 |
| 停止养猪 | 养猪场废水影响集水区水质、土地要用来建新镇〔待核〕 | 农民的收入与技能；转业或转去邻国养殖〔待核〕 | 第 03 章 |
| 填海用沙 | 填海让陆地增加约四分之一（F15） | 进口海沙对邻国海岸的影响、邻国的出口禁令〔待核：只写有来源的报道〕 | 第 05 章细看 |
| 农地与保护区 | 2026 年林厝港部分农地拟改作国防用途（C `lim-chu-kang-2026`） | 农民的去处与本地粮食目标（按来源） | 第 06 章细看，写成"仍在讨论的规划" |

### 1.5 沉重内容

河水山大火（4 人死亡、约 16,000 人失去家园）与 1959–1961 年的其他甘榜火灾〔待核：Kampong Tiong Bahru 1959 年等〕。`sensitivity: open`；事件用 `disaster`（空心三角）。不画火灾，不写伤者细节，写人数、日期、谁失去了什么、怎样安置。**这几段的中文稿请 Gavin 亲审**（§8.3-3）。

---

## 2. 章节计划（背景章 + 6 章）

### 2.1 总表

`cam` = `[lng, lat, zoom]`；岛尺度 10.2（全岛）到 13.6（城区 / 一个新镇）；`maxZoom: 14`；本地岛岸在 9.4–9.6 渐入，镜头一律 ≥ 9.6。`layers` 默认 `base, control, movements, battles`，需要地点加 `sites`，需要 E1 图层写图层 id（`hdb-blocks`、`estates`、`farm-parks`、`reserves`、`reservoirs`）；**不写 `borders`**。

| # | id | 标题 EN / ZH | t | cam | 控制区 | 校验 |
|---|---|---|---|---|---|---|
| 00 | background | The island in 1959 / 1959 年的岛 | （`state.time` 1959-04-01） | 103.82, 1.36, 10.2 | K1 | = K1 |
| 01 | crowded-city | A crowded city and the first flats, 1959–1965 / 拥挤的城市与第一批组屋（1959–1965） | 1960-02-01 | 103.84, 1.30, 11.8 | K1（1964 年起淡出） | 末拍 1964-02 时 K1 仍约 95% |
| 02 | new-towns | New towns and industrial estates, 1966–1990 / 新镇与工业区（1966–1990） | 1966-06-01 | 103.82, 1.36, 10.4 | 空帧 K2 | K1 已在 1966-01-01 淡完 |
| 03 | farms-and-food | Farms: fewer, smaller, smarter / 农场：变少、变小、变聪明 | 1975-01-01 | 103.72, 1.41, 11.4 | 空帧 | 拍到 2024 |
| 04 | getting-around | Roads and railways / 路与铁路 | 1975-06-02 | 103.84, 1.33, 10.8 | 空帧 | 拍到 2024 |
| 05 | more-land | Making more land / 土地不够怎么办 | 1981-07-01 | 103.80, 1.32, 10.2 | 空帧 | 每拍日期 ≥ 用到的岛岸时代起点（§3.3） |
| 06 | sharing-the-island | Sharing a small island today / 今天怎样分配一座小岛 | 2019-11-18 | 103.82, 1.36, 10.2 | K4（MP2019） | K3 空帧在 2019-01-01，淡入只在 2019-08 到 11 月 |

阅读说明（背景章 `state.note`）：①讲谁的经历（政府与建屋局、居民、农民、工人；得到的和失去的都写）；②数字怎么标（每个数字可点开来源；组屋比例的分母前后不同）；③地图怎么来的：1959 年的图描自当年的英国政府地图；2019 年的图是**总蓝图的规划用途**；中间几十年只画有年份的东西——组屋点是**今天还在的楼**（早年拆掉的不在），工业区、农业科技园、保护区用今天的范围、从启用那年出现（近似）；海岸 1961 年以后取自卫星影像，误差约 30–60 米；蓄水池与"四大水喉"主题一致；④地图上没有画的：1960–80 年代的农场范围（没有可以公开使用的地图），1959–2019 年之间的整岛土地用途。

### 2.2 各章

格式同 docs/28：**正文要点 → 细看 → 节拍（字幕 EN / ZH 草稿，日期开头、描述地图）→ 事件（`id · t（until）· at · kind`）→ 路线 / 图层**。坐标取 Wikidata（CC0）或 URA / HDB 数据算出的形心；不取商业地图。字幕里的数字都在 F 表里有来源。

#### 00 background · 1959 年的岛

- 正文：1959 年的地图上，城区（新加坡河两岸、加冷到丹戎巴葛）挤满店屋；城外是甘榜、农场、橡胶和椰子园，北边是英国海军基地，中部是森林和蓄水池，沿海与河口是红树林沼泽；约 2 万个农场养猪、鸡、鸭，种菜（F1）；岛的面积（F1）；**怎么读这张地图**（图例：颜色 = 土地用途，虚线 = 今天的海岸）；东南西北与中部（P3"在地图上找到地方"，预设镜头 `north`、`south`、`east`、`west`、`central`）。
- 细看：①**这张 1959 年的地图从哪里来**（BIS《新加坡邦》小册子，图上画了什么、没画什么；为什么农场和甘榜不能分开画）；②**甘榜是什么**（村子，不是贫民窟的同义词；有的通水电、有的没有；邻里互助）；③**1959 年的机场与基地**（巴耶利峇机场、实里达、登加、三巴旺、樟宜）。
- 节拍（4）：
  1. 1959-04-01 · 全岛（103.82, 1.36, 10.2，高亮 `countryside`）。EN "1959: most of the island is countryside, shown in sand colour: villages called kampongs, farms, and rubber and coconut estates. The dashed line is today's coast." ZH "1959 年：岛上大部分是乡村，就是沙色的部分，有甘榜、农场、橡胶园和椰园。虚线是今天的海岸线。"
  2. 1959-04-01 · 城区（103.85, 1.295, 12.6，高亮 `town-and-services`）。EN "The City of Singapore, around the river mouth, is the only large built-up area. Many families here share rooms in crowded shophouses." ZH "新加坡市区围着河口，是岛上唯一一大片房屋。这里许多家庭挤在店屋里，几家人合住一层。"
  3. 1959-04-01 · 北部（103.82, 1.43, 11.2，开 `sites`，高亮 `defence-special`、`site-seletar-airbase`）。EN "In the north, the British naval base and several airfields take up large pieces of land." ZH "北部有英国海军基地和几个机场，占了大片土地。"
  4. 1959-04-01 · 中部（103.81, 1.37, 11.4，开 `reservoirs`、`reserves`，高亮 `site-macritchie-reservoir`）。EN "In the middle of the island, forest is kept around three reservoirs, so the rain that falls there stays clean." ZH "岛的中部，三个蓄水池周围保留着森林，让落在那里的雨水保持干净。"
- 事件：`site-paya-lebar-airport` · 1955〔待核〕· site｜`site-seletar-airbase` · 1928〔待核〕· site｜`site-tengah-airbase` · 1939〔待核〕· site｜`site-sembawang-airbase` · site｜`site-changi-airbase` · site｜`singapore-naval-base` · 1938-02-14 · [103.82, 1.46]（id、日期、坐标与来源照抄 singapore-1819-1965 / ww2；kind 在那边是 `political`，E3 落地后两边一起改 `milestone` 前先问主会话，未改前照抄）｜蓄水池 `site-*`（照抄 four-taps）。

#### 01 crowded-city · 拥挤的城市与第一批组屋（1959–1965）

- 正文：城里怎么住（F2）；SIT 建得不够快（F3）；1960 年建屋局成立、先建小单位求快；1961 年河水山大火（F4，起因不明）；火场上和女皇镇的楼；1964 年开始出售组屋（F5）；到 1965 年约 23% 的人住组屋（F6，写明分母）。**地图上的点**：今天还在的楼，早年许多楼后来重建了。
- 细看：①**一房式紧急组屋**（为什么先建小单位；配图 `housing-change`）；②**大火之后**：安置、原地重建（F4）；起因不明与各种说法（§1.4）；③**为什么早年的点那么少**（数据是今天还在的楼；HDB 年报里的建屋数〔待核〕）。
- 节拍（5）：
  1. 1959-06-03 · 城区（103.85, 1.295, 12.6，高亮 `town-and-services`）。EN "1959: about one and a half million people live on the island; the city is crowded, and wooden houses spread over the hills around it." ZH "1959 年：岛上住着约 150 万人。城区很挤，城外的山坡上满是木屋。"（数字用 1957 年普查值，字幕写"约"，〔待核〕1959 年估计值能否找到）
  2. 1960-02-01 · 城区西南（103.83, 1.29, 12.8，高亮 `hdb-founded`）。EN "1 February 1960: the Housing and Development Board is set up to build low-cost flats quickly." ZH "1960 年 2 月 1 日：建屋发展局成立，要尽快建造价格低廉的组屋。"
  3. 1961-05-25 · 河水山（103.827, 1.288, 13.4，高亮 `bukit-ho-swee-fire`）。EN "25 May 1961: a fire sweeps through the kampong at Bukit Ho Swee. About 16,000 people lose their homes and four people die." ZH "1961 年 5 月 25 日：河水山甘榜发生大火，约 1 万 6000 人失去家园，4 人死亡。"
  4. 1963-12-31 · 河水山到女皇镇（103.81, 1.29, 12.6，开 `hdb-blocks`，高亮 `bukit-ho-swee-rebuilt`、`queenstown-first-flats`）。EN "1962 to 1963: new blocks rise on the burnt land and in Queenstown. Each dot is a block that still stands today." ZH "1962 年到 1963 年：火场上和女皇镇盖起一座座新楼。每个点是一座今天还在的组屋。"
  5. 1964-02-01 · 全岛（103.82, 1.33, 10.8，开 `hdb-blocks`，高亮 `home-ownership-1964`）。EN "1964: the Board begins to sell flats to the families who live in them, so they can own their homes." ZH "1964 年：建屋局开始把组屋卖给住户，让他们拥有自己的家。"
- 事件：`hdb-founded` · 1960-02-01〔待核〕· [103.835, 1.29]（HDB 早年办公地〔待核〕，否则放城区）· milestone｜`bukit-ho-swee-fire` · 1961-05-25 · [103.827, 1.288] · disaster｜`bukit-ho-swee-rebuilt` · 1962（until 1967）· milestone｜`queenstown-first-flats` · 1953 规划 / 1960 年代建〔待核哪个日期〕· [103.80, 1.295] · milestone｜`home-ownership-1964` · 1964-02〔待核〕· milestone｜`kampong-fire-1959`〔待核，有来源才建〕· disaster。

#### 02 new-towns · 新镇与工业区（1966–1990）

- 正文：要建的楼多、地不够：1966 年《土地征用法令》（F7，两边写）；大巴窑（1964 年整地，第一个全面规划的新镇）→ 宏茂桥（1973）→ 淡滨尼（1979）；新镇里有学校、诊所、图书馆（C `living-hdb-amenities`）；**西边的裕廊**：沼泽和小山变成工业区，旁边建工人住的组屋（F9）；甘榜居民搬进组屋：得到的和失去的（§1.4）；到 1990 年约 87% 的居民住组屋（F6）。
- 细看：①**搬家的那一天**（口述：Au Seck Ngee 一家，C `living-resettlement-personal`；搬迁补偿〔待核〕）；②**土地征用：两种看法**（§1.4）；③**新镇怎么规划**（邻里、中心、工业区就在附近；大巴窑的"第一"）。
- 节拍（5）：
  1. 1966-06-01 · 全岛（103.82, 1.36, 10.4，开 `hdb-blocks`，高亮 `land-acquisition-act`）。EN "1966: a new law lets the government acquire private land for public use, paying compensation set by the law. Much of the land for new towns is acquired this way." ZH "1966 年：新法令让政府可以为公共用途征用私人土地，按法令付补偿。许多新镇的土地就是这样来的。"
  2. 1968-12-31 · 裕廊（103.71, 1.32, 11.6，开 `estates`、`hdb-blocks`，高亮 `jtc-founded`）。EN "1968: in the west, the swamps and low hills of Jurong are becoming an industrial estate, with flats nearby for the people who work there." ZH "1968 年：西部裕廊的沼泽和小山正变成工业区，附近也建了组屋，给在那里工作的人住。"
  3. 1973-12-31 · 宏茂桥（103.85, 1.37, 12.4，开 `hdb-blocks`，高亮 `amk-first-blocks`）。EN "1973: the first blocks of Ang Mo Kio go up in the middle of the island." ZH "1973 年：宏茂桥的第一批组屋在岛的中部建起来。"
  4. 1979-12-31 · 东部（103.94, 1.35, 11.8，开 `hdb-blocks`，高亮 `tampines-begins`）。EN "1979: building starts at Tampines in the east; the dots now reach from Jurong to Bedok." ZH "1979 年：东部的淡滨尼开始动工。组屋点已经从裕廊连到勿洛。"
  5. 1990-12-31 · 全岛（103.82, 1.36, 10.2，开 `hdb-blocks`、`estates`）。EN "1990: blocks of flats now stand all over the island; about 87 in every 100 residents live in them." ZH "1990 年：岛上到处是组屋，每 100 名居民中约有 87 人住在组屋里。"
- 事件：`land-acquisition-act` · 1966〔待核日期〕· [103.85, 1.29] · milestone｜`toa-payoh-new-town` · 1964（整地）· [103.85, 1.335] · milestone｜`jurong-industrial-estate` · 1961（构想）/ 1962〔待核动工〕· [103.70, 1.32] · milestone｜`jtc-founded` · 1968-06-01〔待核〕· milestone｜`amk-first-blocks` · 1973 · [103.845, 1.37] · milestone｜`tampines-begins` · 1979 · [103.945, 1.353] · milestone｜`woodlands-new-town`〔待核年份〕· milestone｜`jurong-west-new-town`〔待核〕· milestone。

#### 03 farms-and-food · 农场：变少、变小、变聪明

- 正文：1959 年约 2 万个农场（F1）；1970 年代农地减少（F10）；1975–1984 年约 8,000 个农场停业：土地要建新镇和工业区，养猪场废水影响蓄水池（F11，链到 four-taps）；农民的去处（§1.4）；1986 年起农业科技园（F12）：用机器、温室、科学方法在小块地上种更多；今天：约 150 个陆上农场、约 70 个海上渔场，室内农场与多层栽培（F13，配图 `hydroponic-trough`）；大部分食物靠进口，所以目标是**提高本地生产的能力**（F13，写定义）。
- 细看：①**1960 年代的甘榜农场**：猪、鸡、鸭、菜、鱼塘、兰花（配图 `kampong-farm`）；②**为什么不能再养猪**（集水区，链 `<TopicLink slug="four-taps" ch="damming-the-rivers">`〔章 id 施工时核〕）；③**目标改了**："30 by 30"与 2025 年的新目标各是什么意思（F13）；④林厝港的未来（§1.4，写成仍在讨论的规划）。
- 节拍（5）：
  1. 1975-01-01 · 西北（103.72, 1.41, 11.4，高亮 `farm-phase-out-begins`）。EN "1975: thousands of small farms in the north and west still raise pigs, chickens and vegetables. Over the next ten years about 8,000 of them close." ZH "1975 年：北部和西部还有成千上万个小农场，养猪、养鸡、种菜。接下来十年，约 8000 个农场停业。"
  2. 1984-12-31 · 榜鹅（103.90, 1.41, 12.2，高亮 `pig-farming-phase-out`）。EN "1984: the government decides to phase out pig farming; the farms at Punggol close over the following years." ZH "1984 年：政府决定逐步停止养猪，榜鹅的养猪场在之后几年陆续关闭。"（年份〔待核〕）
  3. 1986-12-31 · 林厝港（103.71, 1.43, 12.0，开 `farm-parks`，高亮 `agrotech-parks-1986`）。EN "1986: land is set aside for agrotechnology parks, where farms use machines and science to grow more on less land." ZH "1986 年：政府划出农业科技园，农场用机器和科学方法，在较小的地上种出更多食物。"
  4. 2014-12-31 · 西部（103.73, 1.38, 11.4，开 `farm-parks`，高亮 `first-indoor-farm`）。EN "2014: Singapore's first indoor farm opens; vegetables now grow in stacked trays under lamps, inside buildings." ZH "2014 年：新加坡第一个室内农场出现，蔬菜种在一层层的架子上，用灯光照着，长在屋子里。"
  5. 2024-12-31 · 全岛（103.82, 1.36, 10.4，开 `farm-parks`）。EN "2024: about 150 farms on land and about 70 in the sea grow food; most of what people eat still comes from abroad." ZH "2024 年：约 150 个陆上农场和约 70 个海上渔场生产食物，但人们吃的大部分食物仍然来自外国。"（"大部分"要来源〔待核〕，否则改写为鸡蛋、蔬菜、海产三个比例）
- 事件：`farm-phase-out-begins` · 1975 · [103.72, 1.41] · milestone｜`pig-farming-phase-out` · 1984（until 1990）〔待核〕· [103.90, 1.41] · milestone｜`agrotech-parks-1986` · 1986-09 · [103.71, 1.43] · milestone｜`first-indoor-farm` · 2014〔待核地点〕· milestone｜`food-story-2` · 2025-11 · milestone｜`site-kampong-lorong-buangkok` · site。
- 图层：`farm-parks`（§3.4）。

#### 04 getting-around · 路与铁路

- 正文：城里车多路窄；1975 年区域执照计划（进城区要买证，F14）；巴士整合〔待核〕；高速公路（泛岛高速第一段〔待核〕）；1981 年樟宜机场建在填出来的地上（F14、F16）；1987 年第一段地铁（F14）；1990 年拥车证；1998 年电子道路收费；地铁一条条延伸（东北线、环线、滨海市区线、汤申—东海岸线），轻轨通到新镇里（武吉班让 1999〔待核〕、盛港、榜鹅）；地铁网从 67 km 到 242.5 km（F14）；铁路走地下、高架，占地少。
- 细看：①**为什么要限制车子**（地少，路不能无限多；区域执照、拥车证、电子道路收费各是什么）；②**地铁线怎么选路**（连新镇和工作地点；1987 年的五个站）；③**轻轨**：新镇里的小环线。
- 节拍（5）：
  1. 1975-06-02 · 城区（103.85, 1.29, 12.6，高亮 `area-licensing-scheme`）。EN "2 June 1975: cars entering the city centre in the morning rush must now carry a paid licence, to keep the narrow streets moving." ZH "1975 年 6 月 2 日：早上进入市中心的车子要先买通行证，好让窄街不塞车。"（日期〔待核〕）
  2. 1981-07-01 · 东部（103.99, 1.36, 11.8，高亮 `changi-airport-opens`）。EN "1 July 1981: Changi Airport opens at the eastern tip, much of it on land filled in from the sea." ZH "1981 年 7 月 1 日：樟宜机场在岛的东端启用，很大一部分建在填海得来的地上。"（本拍岛岸须为 L7，§3.3）
  3. 1987-11-07 · 大巴窑（103.85, 1.35, 12.4，高亮 `nsl-toa-payoh-yio-chu-kang`）。EN "7 November 1987: the first trains of the Mass Rapid Transit run between Toa Payoh and Yio Chu Kang, five stations long." ZH "1987 年 11 月 7 日：第一段地铁通车，从大巴窑到杨厝港，一共五个站。"
  4. 1990-12-31 · 全岛（103.82, 1.35, 10.4，高亮 `ewl-boon-lay-1990`）。EN "1990: the first two lines reach Boon Lay in the west, Pasir Ris in the east and Marina Bay in the south." ZH "1990 年：最早的两条地铁线西到文礼、东到巴西立、南到滨海湾。"（各端点〔待核〕）
  5. 2024-12-31 · 全岛（103.82, 1.36, 10.2）。EN "2024: the railway network is about 240 kilometres long, and most new towns have a station or a light rail line." ZH "2024 年：地铁网长约 240 公里，大多数新镇都有地铁站或轻轨。"
- 事件：`area-licensing-scheme` · 1975-06-02〔待核〕· milestone｜`changi-airport-opens` · 1981-07-01〔待核〕· [103.989, 1.364] · milestone｜`mrt-official-opening` · 1988-03-12 · milestone｜`coe-1990` · 1990-05〔待核〕· milestone｜`erp-1998` · 1998-04〔待核〕· milestone。
- 路线（movements，全部 `persist: true`、`from = to = 通车日`、`kind: land`、`holder: transport`）：每个通车段一条，id `nsl-…`、`ewl-…`、`nel-2003`、`ccl-stage-3-2009` …、`dtl-stage-1-2013` …、`tel-stage-1-2020` …、`bplrt-1999`、`sklrt-…`、`pglrt-…`；约 35–45 条，清单与日期由 Codex 按 LTA / NLB 逐段核（§3.5）。章节高亮用这些 id。

#### 05 more-land · 土地不够怎么办

- 正文：人多地少：陆地面积从 581.5 到 735.7 km²（F15，写口径变化）；**填海**：东海岸、樟宜、大士、滨海湾、裕廊岛（七个岛连成一个，F16）；**往地下**：裕廊岩洞存油、深层隧道排污〔待核〕、地铁走地下（F17）；**往高处**：组屋从十几层到 50 层（F17，由数据算出的中位数）；代价：沙从哪里来、海岸生态（§1.4）。
- 细看：①**怎么填海**（围堤、填沙、等地沉实；配图 `reclamation-section`）；②**这些海岸线是怎么画的**（卫星影像、误差、潮水的影响，§3.3）；③**组屋越来越高**（数据算出的每十年中位数层数表）。
- 节拍（5，每拍时间 ≥ 用到的岛岸时代起点；§3.3 的 L# 日期定了以后同步改）：
  1. 1981-07-01 · 东海岸（103.93, 1.31, 11.6）。EN "1981: compare the coast with the dashed line of today. Along the East Coast and at Changi, sand has already pushed the shore far out to sea." ZH "1981 年：看看海岸和今天的虚线。东海岸和樟宜一带，填进去的沙已经把海岸推出去很远。"
  2. 1990-12-31 · 西南（103.70, 1.27, 11.2）。EN "1990: in the south-west, small islands off Jurong are still separate, but the gaps between them are starting to fill." ZH "1990 年：西南面裕廊外的小岛还是分开的，岛和岛之间开始被填起来。"
  3. 2000-10-14 · 裕廊岛（103.69, 1.26, 11.8，高亮 `jurong-island-opens`）。EN "2000: seven islands have been joined into one, Jurong Island, for oil and chemical plants." ZH "2000 年：七个小岛已经连成一个岛，叫裕廊岛，用来建炼油厂和化工厂。"（日期〔待核〕）
  4. 2014-09-02 · 裕廊岛下（103.70, 1.26, 12.6，高亮 `jurong-rock-caverns`）。EN "2014: deep under Jurong Island, caverns cut into the rock store oil, so the land above can be used for other things." ZH "2014 年：在裕廊岛的地底深处，人们在岩石里挖出岩洞来储油，地面上的土地就能用来做别的事。"（日期〔待核〕）
  5. 2019-12-31 · 全岛（103.82, 1.33, 10.2，高亮 `pinnacle-duxton`）。EN "Today: the island is about a quarter bigger than in 1960, and new homes are built higher, some fifty storeys tall." ZH "今天：岛比 1960 年大了约四分之一，新的组屋越盖越高，有的高达 50 层。"（"四分之一"= 735.7 / 581.5，计算值写明）
- 事件：`east-coast-reclamation` · 1966〔待核〕（until 1985〔待核〕）· milestone｜`marina-bay-reclamation`〔待核〕· milestone｜`jurong-island-opens` · 2000-10-14〔待核〕· [103.69, 1.265] · milestone｜`jurong-rock-caverns` · 2014-09-02〔待核〕· [103.705, 1.26] · milestone｜`pinnacle-duxton` · 2009-12〔待核〕· [103.841, 1.277] · milestone｜`tuas-reclamation`〔待核〕· milestone。

#### 06 sharing-the-island · 今天怎样分配一座小岛

- 正文：总蓝图把每块地分给一种用途（F20，写"规划用途"）；住宅、工业、绿地、交通、国防、农业各占多少（由 MP2019 数据算出的面积比例，写明是规划面积）；蓄水池和集水区（链 four-taps）；自然保护区与公园（F19）；还没决定的地（预留地）；**在地图上找到你住的地方**，再把时间拖回 1959 年看看那里原来是什么。
- 细看：①**一座岛，八种用途**：MP2019 各类面积表（计算值、规划用途）；②**保护区为什么不能盖房子**（集水、动植物；配合课纲"保护"）；③**规划会改**：MP2003 与 MP2019 的农业用地面积对比（计算值；两个都是规划），林厝港的新规划（§1.4）。
- 节拍（4）：
  1. 2019-11-18 · 全岛（103.82, 1.36, 10.2）。EN "Master Plan 2019: every piece of land has a planned use. Rose is housing, indigo is industry, green is parks and nature reserves." ZH "2019 年总蓝图：每一块地都有规划用途。玫瑰色是住宅，靛蓝是工业，绿色是公园和自然保护区。"（颜色词按最终 token 改）
  2. 2019-11-18 · 中部（103.80, 1.37, 11.4，开 `reservoirs`、`reserves`，高亮 `site-macritchie-reservoir`）。EN "The forest in the middle is kept for water and for wildlife: rain falling here flows into reservoirs." ZH "中部的森林留给水源和野生动植物：落在这里的雨水流进蓄水池。"
  3. 2019-11-18 · 西部（103.68, 1.33, 11.0，高亮 `defence-special`、`industry`）。EN "In the west, large areas are used for industry and for military training, close to the sea and away from homes." ZH "西部有大片土地用作工业区和军事训练场，靠近海边，离住宅区较远。"
  4. 2025-12-31 · 全岛（103.82, 1.36, 10.6，开 `hdb-blocks`）。EN "Today: zoom in to find where you live, then drag the timeline back to 1959 to see what was there before." ZH "今天：放大地图，找到你住的地方，再把时间轴拖回 1959 年，看看那里以前是什么。"
- 事件：`master-plan-2019` · 2019-11-18 · milestone｜`sungei-buloh-reserve`〔待核年份〕· site｜`labrador-reserve`〔待核〕· site。2026 年 5 月林厝港的规划改动晚于时间轴末端（2025-12-31），只写在细看，不建事件。

### 2.3 数据清单汇总

- **实体（entities.json，8 个土地用途类别，`bloc: neutral`，颜色手工固定，不跑 `colour-holders --write`；`joined` = 第一次出现的日期）**：

| id | EN / ZH | 颜色 | 1959（K1） | MP2019（K4，LU_DESC，Codex 导出实际取值后核对） | E1 图层 |
|---|---|---|---|---|---|
| `housing` | Housing / 住宅 | `token:holder-3`（玫） | — | RESIDENTIAL；RESIDENTIAL WITH COMMERCIAL AT 1ST STOREY；COMMERCIAL & RESIDENTIAL；RESIDENTIAL / INSTITUTION | `hdb-blocks` |
| `countryside` | Kampongs, farms and estates / 甘榜、农场与种植园 | `token:holder-2`（沙） | L4 陆地 − 城区 − 海军基地 − 蓄水池 | — | — |
| `agriculture` | Farmland / 农业用地 | `token:holder-5`（橄榄） | — | AGRICULTURE | `farm-parks` |
| `industry` | Industry / 工业 | `token:holder-1`（靛） | — | BUSINESS 1、BUSINESS 2、BUSINESS PARK 及各 "- WHITE" | `estates` |
| `green` | Parks and nature reserves / 公园与自然保护区 | `token:holder-8`（绿） | —（森林与沼泽在 1959 图上只是散布的符号，不描，§3.2） | PARK；OPEN SPACE；BEACH AREA；（自然保护区在 MP2019 里的类别〔待核〕） | `reserves` |
| `transport` | Transport / 交通 | `token:holder-6`（天蓝） | —（机场作 site） | PORT / AIRPORT；TRANSPORT FACILITIES；MASS RAPID TRANSIT；LIGHT RAPID TRANSIT | 地铁 movements |
| `defence-special` | Defence and special use / 国防与特殊用途 | `token:holder-7`（酒红） | 海军基地（图上的网点区） | SPECIAL USE | — |
| `town-and-services` | City, shops and services / 城区、商业与公共设施 | `token:holder-4`（青） | City of Singapore（图上的网点区） | COMMERCIAL；HOTEL；WHITE；各类 INSTITUTION；HEALTH & MEDICAL CARE；PLACE OF WORSHIP；UTILITY；CEMETERY；SPORTS & RECREATION；RESERVE SITE | — |

  ROAD、WATERBODY 不画（陆地色 / 水色）。K1 标签：`town-and-services` 写 "City of Singapore (homes, shops and the port)" / "新加坡市区（住家、商店与港口）"；`defence-special` 写 "Naval Base (British)" / "海军基地（英国）"。
- **`topic.yaml`**：`colorBy: entity`；`blocLabels.neutral = { en: "Land use", zh: "土地用途" }`；`strings: { joined: { en: "on the map from", zh: "地图上始于" }, left: { en: "until", zh: "止于" }, notYet: { en: "Not on the map yet", zh: "尚未出现" } }`；`basemap: { local: land-sg-modern, maxZoom: 14 }`；`datedLayers`（E1，§4）；`note`：EN "1959 map traced from a British government map · 2019 map is URA Master Plan planned use · HDB dots are blocks standing today · coasts after 1961 from Landsat images (approximate)" / ZH "1959 年的图描自英国政府地图 · 2019 年的图是市区重建局总蓝图的规划用途 · 组屋点是今天还在的楼 · 1961 年以后的海岸取自 Landsat 卫星影像（近似）"。
- **事件**：约 70 个（milestone 约 40、site 约 25（含照抄 four-taps 的蓄水池 19 个）、disaster 1–3）。**路线**：约 40 条地铁 / 轻轨通车段（`persist`）。
- **预设**：`island` 全岛 [103.82, 1.36] 10.2 · `north` 北部 [103.80, 1.43] 11.4 · `south` 南部与城区 [103.84, 1.28] 11.8 · `east` 东部 [103.94, 1.35] 11.4 · `west` 西部 [103.70, 1.34] 11.2 · `central` 中部 [103.81, 1.36] 11.6。不用 `world`、`theatre` 以外的同名；不和实体重名。
- **规格行**：`YEARS 1959–2025 · CHAPTERS 6 · LAND-USE MAPS 2 · COASTLINES 8 · HDB BLOCKS ~10,000 · RAIL SEGMENTS ~40`。

---

## 3. 地图与数据

### 3.1 数据集（D# = Codex `datasets.json` 的行号；G# = 本主题 SOURCES-GEO 的地图号）

| G# | 数据 | 许可 | 用途 |
|---|---|---|---|
| G1 | D11 BIS, *Map of Singapore from The State of Singapore*（1959 年 4 月），Commons，3176×1994 | PD-UKGov（1976 年以前出版的英国政府作品） | **K1 主源**：城区网点区、海军基地网点区的轮廓；1959 年的蓄水池、机场核对 |
| G2 | D01 URA Master Plan 2019 Land Use（`d_90d86daa5bfaa371668b84fa5f01424f`） | SODL v1.0 | **K4 主源**；工业区、农业科技园、绿地的今天范围 |
| G3 | D07 URA MP2019 Planning Area Boundary (No Sea)（`d_4765db0e87b9c86336792efe8a1f7a66`） | SODL v1.0 | 今天的陆地（L11、mask、今天海岸虚线），同 four-taps |
| G4 | D05 HDB Property Information（`d_17f5382f26140b1fdae0ba2ef6239d2f`） | SODL v1.0 | `year_completed`、`max_floor_lvl`、`residential` |
| G5 | D06 HDB Existing Building（`d_16b157c52ed637edd6ba1232e026258d`） | SODL v1.0 | 楼宇轮廓 → 形心点 |
| G6 | D08 URA MP2019 Rail Line（`d_222bfc84eb86c7c11994d02f8939da8d`）+ 2019 年以后通车段的官方数据（LTA DataMall 或 data.gov.sg 的 LTA 层，许可〔待核〕） | SODL v1.0 | 地铁 / 轻轨走向，按站切段 |
| G7 | D26 NParks Parks and Nature Reserves（`d_77d7ec97be83d44f61b85454f844382f`） | SODL v1.0 | 自然保护区今天的范围（`N_RESERVE`） |
| G8 | D04 / D03 / D02 URA MP2003 / 2008 / 2014 Land Use | SODL v1.0 | **只算面积**（第 06 章细看的农业用地对比），不画 |
| G9 | Landsat Collection 2（USGS）：1973（Landsat 1 MSS）、约 1981（Landsat 2/3 MSS）、约 1990（Landsat 5 TM）、约 2000（Landsat 7 ETM+，2003 年 5 月以前）、约 2010（Landsat 5 TM）；取景：WRS-2 path 125 row 59 一带（MSS 用 WRS-1 对应行列），云量最低、潮位尽量相近 | 公有领域（USGS："Landsat data … no restrictions"，Codex 抄原文）；下载服务的条款另记（Microsoft Planetary Computer STAC 匿名访问，或 USGS M2M——后者要账户，见 §8.3-2） | **L6–L10 年代岛岸**（§3.3） |
| G10 | four-taps 的蓄水池几何与 OSM 名称（`scripts/geo/four-taps/`） | URA SODL + OSM ODbL（只用于名字匹配，署名照抄） | `reservoirs` 图层 |
| G11 | `land-sg-history.json` 的 L4、L5 | 同 docs/28（公有领域地图配准 + SODL） | 本主题 L4、L5 |
| G12 | D30 / D31 / D32 data.gov.sg 统计（陆地面积、人口、公共交通） | SODL v1.0 | E5 读数与正文数字 |
| G13 | D14 TPC L-10C（1984，PD-USGov-Military）；docs/28 G14–G17 海军部海图（1966，PD-UKGov） | 公有领域 | Landsat 海岸的独立核对 |

**只作核对、不描、不发布**（§3.6）：D16 NAS 1950 GSGS 4203；D17–D19 1958 / 1980 / 1985 总蓝图；D20 1987 地形图；D28 NUS 1953 / 1966 / 1975 地形图拼接（SLA 版权）；D21 Glaser 1991、D22 Hesp 1995 / Wong 1992、D23 NLB "Land From Sand" 的图；D24 / D25 / D27 / D29 SFA 与 1986 年计划书的附图；Commons 上标 CC0 的 HDB 年报与 *Housing a Nation*（1985）（只引文字，图不描）；Commons `Map of Queenstown.jpg`（SIT 1958，CC BY-SA 4.0 标注可疑）。

### 3.2 两张整岛图（控制区 `control.json`，四帧）

| K | t | 内容 | 方法 |
|---|---|---|---|
| K1 | 1959-04-01 | `town-and-services`（City of Singapore 网点区）、`defence-special`（海军基地网点区）、`countryside`（其余陆地） | G1 用 `georef-raster.ts` 配准（控制点 ≥ 16：河口、海角、蓄水池坝、铁路与长堤交点、图廓经纬网交点；模型 `auto`）；网点区用 `lines.ts` 沿网点边缘描线（网点区边界清楚，不是散布符号）；`countryside` = L4 陆地 − 前两者 − 蓄水池（compose `difference`，不手画）。**残差预算**：最大 ≤ 300 m、RMS ≤ 150 m（全岛小比例尺图，同 docs/28 L0 全岛）。森林、沼泽在 G1 上是散布符号、没有边界，**不描**（写进已知差距；中部森林在背景章由 E1 `reserves` 图层的今天范围示意，标"近似"） |
| K2 | 1966-01-01 | **空帧**（E2） | — |
| K3 | 2019-01-01 | **空帧** | — |
| K4 | 2019-11-18 | MP2019 按 §2.3 的表归类，同类合并（dissolve），道路与水面留空 | compose `geojson` 选择器按 `LU_DESC` 筛 → `union`；裁到 L11；DP 5–10 m；`rings: N, zero-area 0, self-crossing 0`；体积预算 1.2 MB（超了先把阈值放到 10 m、丢 < 0.002 km² 的碎块，报数） |

交叉淡化：K1 → K2 在 1964-01 到 1966-01 之间淡出；K3 → K4 在 2019-08 到 11 月淡入。第 01 章末拍（1964-02）时 K1 约 95%。

### 3.3 年代岛岸（`public/geo/land-sg-modern.json`，`local-land.ts` 的 `eras`）

| L | `from` – `to` | 依据 | 方法 | 误差预算（与今天海岸重合段的偏差） |
|---|---|---|---|---|
| L4 | – 1961-01-01 | docs/28 L4 | `outline` = `land-sg-history.json` 解码的 L4 | 同 docs/28 |
| L5 | 1961-01-01 – L6 影像日 | docs/28 L5 | 同上，L5 | 同 docs/28 |
| L6 | 1973 影像日 – L7 | Landsat 1 MSS | 下文 | p50 ≤ 60 m、p95 ≤ 120 m |
| L7 | 约 1981 影像日 – L8 | Landsat 2/3 MSS | 下文 | 同 L6 |
| L8 | 约 1990 影像日 – L9 | Landsat 5 TM | 下文 | p50 ≤ 30 m、p95 ≤ 60 m |
| L9 | 约 2000 影像日 – L10 | Landsat 7 ETM+ | 下文 | 同 L8 |
| L10 | 约 2010 影像日 – 2019-11-18 | Landsat 5 TM（或 7 SLC-off 合成，写明） | 下文 | 同 L8 |
| L11 | 2019-11-18 – | G3 今天的陆地 | 无 `minus` | — |

**Landsat 海岸方法（固定、可复跑，写进 SOURCES-GEO.md）**：①Collection 2 Level-1（L1TP，已正射）；②水体指数：MSS 用 NDWI（绿 / 近红外波段），TM / ETM+ 用 MNDWI（绿 / 短波红外 1），每景在今天海岸外扩 2 km 的带里用 Otsu 求阈值，阈值写进记录；③得到"那天的陆地"栅格 → 多边形；④`minus` = 今天陆地 − （那天陆地外扩 2 个像元），再丢掉面积 < 0.1 km² 的碎块（避免潮水与混合像元的噪声）；`plus` = 那天陆地内缩 2 个像元 − 今天陆地外扩 2 个像元（那时有、今天没了的小岛），同样丢 < 0.1 km²；⑤每块 `minus` 要对得上一个有来源的填海工程（东海岸、樟宜、大士、裕廊诸岛、滨海湾、实马高……；对不上的列出来，主会话看图决定是噪声还是漏查）；⑥核对：TPC 1984（G13）、1966 海军部海图、NLB "Land From Sand"（只看）；⑦已知限制写给读者：潮位、云、MSS 60 m 像元，海岸只到"几十米"的精度。

- 时代日期 = 实际影像日期；章节拍的 `t` 若要显示某块新地，必须 ≥ 那个时代的起点（第 04 章第 2 拍、第 05 章各拍；Codex 交付 L# 日期后主会话同步改 §2.2 并跑 `--beats`）。
- `kind: mask`、`kind: coast-today` 同 four-taps / docs/28；水面挖洞照抄 four-taps 的 `water` 配置（`keepMatch` 的山谷蓄水池保持陆地色，由 `reservoirs` 图层按年份上色；勿洛蓄水池建成前是采沙场，也是陆地）。
- 预算 ≤ 250 KB；`rings` 0 / 0；每段面积与今天陆地的差（km²）列表，并和 F15 的统计面积并排（两者口径不同，只看趋势）。

### 3.4 按年份出现的图层（E1 `datedLayers`，文件 `public/geo/<id>.json`）

| 图层 id | 形状 | 类别 / 颜色 | 内容与方法 | `from` / `to` |
|---|---|---|---|---|
| `hdb-blocks` | 点 | `housing` | G5 轮廓（`residential = Y` 的楼）形心；与 G4 连接：①按 HDB 镇代码（G4 `bldg_contract_town`）+ `BLK_NO` 在镇内唯一的直接配上（轮廓所属的镇由空间关系判定，镇代码与规划区的对应表写进脚本）；②从①配上的对学出 `ST_COD` ↔ 街名对照表，再按 街名 + 门牌配剩下的；③仍配不上的列表（数量、镇），超过 2% 才考虑 OneMap（§8.3-2）。属性只留 `f`（竣工年，数字）、`h`（`max_floor_lvl`） | `from` = `year_completed`；无 `to` |
| `estates` | 面 | `industry` | G2 的 BUSINESS 类地块，按 JTC 工业区名（裕廊、大士、兀兰、实里达航空园…）用 `overlap` 选取（名字来源：JTC 页面或 URA 规划区，**不手画边界**），同区合并 | 各区启用年〔待核〕；`certainty: approximate`（今天的范围） |
| `farm-parks` | 面 | `agriculture` | G2 AGRICULTURE 地块，按六个农业科技园所在的规划区 / 子区选取 | 1986（林厝港等）或各园启用年〔待核〕；`approximate` |
| `reserves` | 面 | `green` | G7 `N_RESERVE = Y` 的四个保护区 | 各自宪报年份〔待核〕；`approximate` |
| `reservoirs` | 面 | `token:cold`（同 four-taps） | 照抄 four-taps 的几何与年份 | four-taps 的年份 |

- 体积预算：`hdb-blocks` ≤ 300 KB（约 1 万点，量化 1e5）；面图层合计 ≤ 400 KB。
- 图层说明（图例行 / 控制面板 LAYERS 行的字）：`hdb-blocks` EN "HDB blocks standing today, by year completed" / ZH "今天还在的组屋，按竣工年份"；`estates` "Industrial estates (today's extent)" / "工业区（今天的范围）"；`farm-parks` "Agrotechnology parks (today's farmland)" / "农业科技园（今天的农业用地）"；`reserves` "Nature reserves (today's extent)" / "自然保护区（今天的范围）"；`reservoirs` "Reservoirs, by year completed" / "蓄水池，按建成年份"。

### 3.5 地铁与轻轨（movements）

- 几何：G6 按站点切段（站点坐标取同一数据或 LTA 站点层），一段 = 一次通车的连续区间；`path` 是 LineString（复线取中线），途经点不删减到失真（城区段每 100–200 m 一点）。
- 日期：每段的首次载客日（不是开幕典礼），按 LTA / NLB 逐段核；查不到日的写到月 / 年（data-cookbook 允许）。Codex 已核的见 F14；其余〔待核〕。
- 2019 年以后通车而 MP2019 铁路层里没有的段：用 LTA 的官方开放数据（许可〔待核〕）；没有就不画，写进已知差距。

### 3.6 许可

- 发布的几何只来自：G1（PD-UKGov）、G2–G8、G12（SODL，署名格式照 four-taps："Contains information from {数据集} accessed on {日期} from {来源} which is made available under the terms of the Singapore Open Data Licence version 1.0"）、G9（USGS 公有领域）、G10 的 OSM 名称匹配（ODbL 署名照抄 four-taps）、G11（docs/28 已登记）、Wikidata（CC0）。全部可按 `LICENSE-CONTENT`（CC BY-NC-SA 4.0）提供。
- NAS、SLA / NUS、URA 历史总蓝图、学术图、SFA 附图只在 `scripts/geo/singapore-land-use/refs/`（gitignore）作核对，SOURCES-GEO.md 写明"只看、未描"。

### 3.7 已知差距（先写下）

- 1959–2019 年之间没有整岛土地用途图；1960–80 年代农场与甘榜的范围不画。
- 组屋点缺了拆掉的楼；1960 年代尤其少。
- 工业区、农业科技园、保护区用今天的范围，从启用年出现。
- 1959 年的森林、沼泽、红树林不画（来源图上只有符号）。
- 1961–1973 年之间的填海要到 L6（1973 影像）才出现；潮位与像元带来几十米误差。
- 2019 年以后的填海与新线路，若没有开放数据就不画。

---

## 4. 引擎与管线

| # | 缺口 | 现状 | 最小提案 | 必要？ |
|---|---|---|---|---|
| E1 | **按年份出现的图层**（docs/17 C2） | 点事件开始后一直显示，但语义是"事件"、会脉冲、没有 `to`，上万个点不合适；`movements` 只适合线；控制区是整岛关键帧 | `topic.yaml` 可选 `datedLayers: [{ id, file, kind: point \| line \| area, holder?, color?, label: {en, zh}, count?: boolean }]`；`public/geo/<file>.json`（TopoJSON，一个同名对象；要素属性 `f`（开始，十进制年，构建时写好）、`u?`（结束）、`certainty?`、`h?`）。GeoStage 在地图 load 后与 `basemap.local` 一起 fetch；每个图层一个 source + MapLibre 图层（点：圆 1.2–3 px 随缩放；面：淡底 .35 + 0.6 px 同色边，`approximate` 边虚线、淡底 ×0.7；线：hairline），位于控制区之上、事件之下；过滤 `['all', ['<=', ['get','f'], T], ['>', ['coalesce', ['get','u'], 1e9], T]]`，**只在可见数目变化时** `setFilter`（构建期按 `f` 排序，二分求数目；播放头缓动时不逐帧重设）；"今年新建"另一层：`f` 在 `(T − 1, T]` 的点画大一号、signal 色描边。颜色取 `holder` 实体的颜色（与控制区同一条路径）或 `color` token。图例每个可见图层一行；控制面板 LAYERS 每个图层一个开关；章节 / 拍的 `layers` 可写图层 id（`pnpm validate` 查存在）；`count: true` 的图层在左列 PLATE 块出一行读数（`HDB BLOCKS · 3,412` / `组屋 3,412 座`，HUD 铁律 b）。复用 `lib/dated.ts` 的区间语义（`[from, to)`）。`pnpm validate`：文件存在、对象名、`kind` 与几何类型相符、`f < u`、`holder` 存在。单测 + 一个最小 fixture（`sample-time` 或新 `sample-layers`，占位数据）| **必要**。退路 Plan B 见下 |
| E2 | **控制区空帧** | schema 的关键帧要素数组是否允许为空、领土名称 / 图例 / REFERENCE / 状态串遇到空帧的行为〔Opus 先读代码确认〕 | 允许 `features: []`（TopoJSON 为空 GeometryCollection）；图例、领土名称、REFERENCE 对空帧不报错、不画；状态串照常 `K2→K3` | 必要（小；若已支持只补单测与 docs/06 一句） |
| E3 | 中性事件种类 `milestone` | `EVENT_KINDS` 里最接近的是 `political`，眉题会写 POLITICAL | 新增 `milestone`（EN "Milestone" / ZH "里程碑"）：画法同 `political`（中性墨色点 + 环），不需要 `sides`；图例一行；i18n | 建议（小）；不做就用 `political`，眉题不准 |
| E4 | 点的大小按属性 | — | `datedLayers[].sizeBy: "h"` + `sizeStops`（例：≤ 12 层 1.2 px、13–25 层 2 px、> 25 层 3 px），图例写说明 | 可选（第 05 章"往高处"用；不做就只在细看给表） |
| E5 | 按年份的读数 | 左列 PLATE 只有引擎内置的读数 | `topic.yaml` 可选 `readouts: [{ id, label: {en, zh}, unit: {en, zh}, series: [{ t, v, s }] }]`：PLATE 显示播放头之前最近一点的值与来源上标（`s` = `sources.json` 编号），例：陆地面积、住组屋的比例（分母变化时 `label` 分段写）、地铁长度 | 建议；不做就只在正文和细看写数字 |

- **不需要**：新的底图种类（`basemap.local` 带日期的 `land` 已有，`land-sg-modern` 只是又一个文件）；新的控制区语义（`colorBy: entity` + `blocLabels`）；`persist` 线（已有）。
- **Plan B（E1 排不进时，不改引擎）**：把 1966–2018 年的空帧换成每 5 年一帧的"已有日期的东西"控制区：组屋点外扩 60 m 合并成住宅块（`housing`），加工业区、农业科技园、保护区（同 E1 的数据）；交叉淡化让每 5 年的增长在最后 1.5 年里淡入；没有 PLATE 计数、没有"今年新建"。缺点：住宅显示成块不是点、增长滞后、`control.json` 变大（预算 2 MB）。地铁、蓄水池照常（蓄水池改回 four-taps 的控制区写法则要占用控制区——Plan B 里蓄水池改为 `site` 事件）。
- 管线（不改 `scripts/geo/lib/**`，全部写成主题本地脚本，Codex 负责）：`scripts/geo/singapore-land-use/landsat-coast.ts`（取景、指数、阈值、多边形化、`minus` / `plus`）、`hdb-join.ts`、`dated-layers.ts`（写 `public/geo/sg-*.json`，算 `f` / `u`）、`rail-segments.ts`；`local-land.ts`、`compose.ts`、`simplify.ts`、`check.ts` 用共享的。若共享步骤缺选项，写本地脚本产出同格式并在报告里说明，Opus 再决定是否并入 lib。
- 文件归属（引擎代理，Opus，一个）：`src/engines/time-scene/**`、`src/content/schema/**`（若 `datedLayers` / `readouts` 进 topic schema）、`scripts/validate-content.ts`、`tests/time-scene/**`、`src/content/topics/sample-*/**`（新 fixture）、`src/i18n/**`（若需）、docs/06（TimeScene「作者怎么写数据」「图层」后加「按年份出现的图层」「读数」两节）。
- 验收：four-taps、singapore-1819-1965、ww2 的 `pnpm shoot --keys` 截图不回归（four-taps 逐像素）；fixture 的 `--beats` 能看到点按年份出现与消失、空帧前后控制区淡入淡出、PLATE 计数随拖动变化；1 万点时 `stats().fps` ≥ 50（1080p）、拖动播放头不卡。

---

## 5. 名词表（`glossary.json`，14 个）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| `land-use` | Land use / 土地用途 | 一块地拿来做什么：住、种、工厂、路、公园……总蓝图上写的是"规划用途" | `master-plan` |
| `master-plan` | Master Plan / 总蓝图 | 市区重建局定的法定规划，显示每块地允许的用途和密度，大约五年检讨一次〔待核〕 | `land-use` |
| `kampong` | Kampong / 甘榜 | 马来语"村子"；用木头、亚答叶或锌板盖的房子聚成的村落，邻里来往密切 | `attap-house` |
| `attap-house` | Attap house / 亚答屋 | 屋顶用亚答（棕榈叶）铺成、地板架高的木屋 | `kampong` |
| `hdb-flat` | HDB flat / 组屋 | 建屋发展局建造的公共住宅；大多数住户买下了自己的单位（99 年地契〔待核〕） | `new-town` |
| `new-town` | New town / 新镇 | 按整体规划建造的组屋区，有自己的中心、学校、诊所和交通 | `hdb-flat` |
| `resettlement` | Resettlement / 搬迁 | 政府需要土地时，原住户搬到别处（多为组屋），按规定得到补偿或安置 | `land-acquisition` |
| `land-acquisition` | Land acquisition / 土地征用 | 政府依法令把私人土地收归公用，并付补偿 | `resettlement` |
| `land-reclamation` | Land reclamation / 填海 | 在浅海筑堤、填进沙土，造出新陆地 | — |
| `agrotechnology-park` | Agrotechnology park / 农业科技园 | 政府划出、出租给用新技术耕作的农场的地区 | `hydroponics` |
| `hydroponics` | Hydroponics / 水耕 | 不用泥土，把植物的根放在含养分的水里种 | `agrotechnology-park` |
| `industrial-estate` | Industrial estate / 工业区 | 专门划给工厂的地区，有路、水、电和码头 | — |
| `nature-reserve` | Nature reserve / 自然保护区 | 依法保护的森林、湿地等，不许开发 | `water-catchment` |
| `water-catchment` | Water catchment / 集水区 | 雨水汇集、流进蓄水池的地面（同 four-taps 的定义，逐字一致） | `nature-reserve` |

id 查重：实体（`housing`、`countryside`、`agriculture`、`industry`、`green`、`transport`、`defence-special`、`town-and-services`）、章节（`crowded-city`、`new-towns`、`farms-and-food`、`getting-around`、`more-land`、`sharing-the-island`）、预设（`island`、`north`…`central`）、E1 图层（`hdb-blocks`、`estates`、`farm-parks`、`reserves`、`reservoirs`）与名词不重名；**E1 图层 id 进同一个命名空间**（引擎代理在 `timeSceneIds` 里加上）。中文定义请 Gavin 看：`kampong`、`resettlement`、`land-acquisition`。

---

## 6. 来源（施工时的 S#）

| 段 | 内容 |
|---|---|
| S1 | MOE SS 课纲 2020（2024-01 更新版），印刷第 23–27 页（Codex `sources/moe-jan2024.pdf`） |
| S2–S49 | data.gov.sg 数据集 D01–D08、D26、D30–D33（每个数据集一条，SODL 署名原文）；USGS Landsat（每景一条：景号、日期、下载处）；BIS 1959（G1）；four-taps 照抄的来源（`note` 写"同 four-taps S#"） |
| S50–S99 | 住房：NLB Infopedia 河水山大火；NHB *Who's Your Neighbour?*（印刷第 7、9 页）；NHB 甘榜屋藏品；建国一代纪念馆《人民的家园》；HDB 镇设计指南（女皇镇第 10 页、宏茂桥第 12 页）；HDB 年报 2020/21 关键统计第 13 页、2024/25 第 7 页、2023/24 第 18 页；《土地征用法令》（Singapore Statutes Online）；Loh Kah Seng 2013〔待核〕；HDB 年报 1964–1975（文字） |
| S100–S149 | 粮食：SFA "Of Change & Challenges"（2022）；CLC *Food and the City*（2018，印刷第 27、36 页）；1986 年 9 月政府新闻稿（NAS）；FAO AQUASTAT；SFA 食物统计 2023（第 15 页）/ 2024（第 5 页）/ 2025 新闻稿；MSE 国会答复 2026-01-13；养猪业停止〔待核〕 |
| S150–S199 | 交通：MOT 演讲（1987 首段）；LTA 各线页面与 Circle Line Book；LTA Rail Length 2024；区域执照 / 拥车证 / 电子道路收费 / 樟宜机场〔待核〕 |
| S200–S249 | 土地：data.gov.sg 陆地面积；JTC（裕廊工业区、裕廊岛）；NParks（绿化史、保护区）；URA 总蓝图说明；PUB（蓄水池，照抄 four-taps 之外的补充）；填海与沙〔待核〕 |

每条写读到的原文 ≤ 25 词；挡爬虫的只引读到的（同 docs/28 §6）。Codex 的 E# 证据账本直接转成 S#，`note` 写"Codex E0xx"。

---

## 7. 图像（Codex 草稿已在 `art/planned/singapore-land-use/`，主会话 2026-10-20 看过）

风格 = `STYLE_BRIEF`（石墨铅笔、标本图版、透明底、无文字）；章节图 4:3，`pnpm tsx scripts/illustrate.ts figure <src.png> singapore-land-use-<id>`；首页图 `pnpm tsx scripts/illustrate.ts cover …`（流程同 mosquito / measuring）。**所有图都不许出现**：人、可读文字、数字、标志、旗、地铁线色与品牌、可辨认的某一座真实建筑当事实。caption 写"为本主题画的示意图，依据……"。

| id | 用在 | 决定 | 说明 |
|---|---|---|---|
| `singapore-land-use`（首页） | 首页 / 封面 | **保留**（`singapore-land-use.png`） | 板式组屋（有底层空间）+ 高架地铁 + 一棵树；车轮落在轨上、桥墩完整、无字无标志。家与路在一张图里，粮由章节图补 |
| `housing-change` | 01 | **重画** | 草稿右边的"早期组屋"有底层空间（void deck），但 1960 年代初的组屋底层多是住户和店铺，底层空间是后来才普遍的〔待核：HDB 来源〕；左边木屋是锌板屋顶，正文写的是亚答屋。SUBJECT："A compact architectural comparison specimen at one scale: on the left a small timber kampong house raised on short posts, with a steep roof thatched with attap palm leaves and a plain front veranda; on the right a plain early-1960s seven-storey slab block of small flats with flats on every floor including the ground floor, open common corridors with simple railings along one face, an external staircase at one end, and plain bamboo laundry-pole holders without clothes. No void deck, no people, no lettering or numbers, no antennas, no scenery, sharing one narrow plain foundation strip; square-on architectural plate, no ground shadow." 层数写"约七层"前先核（不核就去掉层数） |
| `kampong-farm` | 03 | **新画** | SUBJECT："A small 1960s Singapore kampong mixed farm as one museum diorama specimen, no people: a raised timber pigsty with a corrugated zinc roof and a concrete feeding trough with three pigs, a wire-mesh chicken coop with a few hens and ducks, three raised beds of leafy vegetables, a small fish pond edged with earth, and a well with a bucket; plain packed-earth ground on a rectangular base, square-on three-quarter specimen view, no lettering, no tools with writing, no ground shadow." |
| `hydroponic-trough` | 03 | **保留**（`singapore-land-use-hydroponic-farm.png`） | 根挂在空气层和营养液里、液面水平；caption："不用泥土种菜的一种方法：根的上半截在空气里，下半截在营养液里" |
| `reclamation-section` | 05 | **新画** | SUBJECT："A cross-section specimen block of reclaimed land at the sea edge, like a geology teaching model: the original soft grey seabed at the bottom, layers of pale sand fill above it, vertical drains as thin columns in the soft clay, a sloping seawall of large armour rocks on a rock-and-gravel core facing a flat sea surface on the right, a level road surface with a kerb on top; far below the seabed, separated by solid rock, one round tunnel-shaped rock cavern with a smooth lining. Cut faces clean and flat, no machines, no people, no arrows, no labels or numbers, neutral graphite, square-on section view, no ground shadow." |

图数：首页 1 + 章节 4 = 5（保留 2、重画 1、新画 2）。不画：火灾、拆迁场面、具体的人、地图（地图本身就是图）。

---

## 8. 施工顺序与分工

| 步 | 内容 | 谁 | 文件归属 | 完成标准 |
|---|---|---|---|---|
| 0 | 本 spec | 主会话 | docs/34 | — |
| R | 补充研究：§1.3 / §2.2 全部〔待核〕；地铁 / 轻轨逐段通车日；工业区、农业科技园、保护区的启用 / 宪报年份；Landsat 取景表 | **Codex**（与 E 并行） | `src/content/topics/singapore-land-use/RESEARCH.md`、`scripts/geo/singapore-land-use/research/` | 每条有出处与 ≤ 25 词原文；查不到标"未能核实" |
| E | 引擎 E1–E3（E4、E5 视工期） | **Opus**（一个代理） | §4 所列 | 单测；docs/06；不回归 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts singapore-land-use --engine time-scene --subject geography --title-en "Homes, Food and Getting Around: Singapore's Land" --title-zh "新加坡的家、粮、路：土地利用的变化" --start 1959-04-01 --end 2025-12-31` | Codex 第一步 | `src/content/topics/singapore-land-use/**` | `pnpm validate` 绿 |
| M | 地图：`land-sg-modern`（L4–L11）、K1（BIS 1959）与 K4（MP2019）、空帧 K2 / K3；E1 图层文件；地铁分段（先 K1 与 L6，并排图过了再铺开） | **Codex** | `scripts/geo/singapore-land-use/**`、`public/geo/land-sg-modern.json`、`public/geo/sg-*.json`、`data/control.json`、`data/movements.json`、`docs/screenshots/singapore-land-use/{coast,geo,layers}-*.png` | 残差 / 偏差在预算内；rings 0 / 0；SOURCES-GEO.md 齐全；连接率报表 |
| C | 数据草稿（实体、事件、预设、名词、来源）与 6 章 + 背景章 EN 初稿；ZH 字段"【待译】" + EN | **Codex** | `data/*.json`（control / movements 之外）、`chapters/*.mdx` | `pnpm validate` 0 error（E1 字段未落地时列出） |
| I | 图像：重画 1、新画 2（§7） | **Codex** | scratchpad `genimg/singapore-land-use/` → 主会话处理 | 逐张对照"不许画" |
| T | 史学与客观性复核：§1.2 立场、§1.3 每个数字对出处、§1.4 两边写、组屋比例的分母、"规划用途"的措辞、与 four-taps 的蓄水池逐条比对 | **Opus** | 同 C，`AUDIT.md`、`REVIEW.md` | 〔待核〕清零或列入已知差距 |
| Z | 中文定稿：独立成文，新加坡用词（§0-10、§5） | **Claude（Opus）** | 所有 `zh` 字段 | 无"【待译】" |
| B | 节拍、章节镜头、高亮（§2.2 草稿；L# 日期落地后改） | **Sonnet** | 章节 frontmatter | `pnpm shoot singapore-land-use --beats` 0 失败，两份清单为空 |
| Q | QA：`acceptance.md` + §8.2；两套主题；手机；1 万点性能 | **Sonnet**（视觉问题退回 Opus） | — | 全勾 |
| D | 草稿部署（`status: draft`），本文 §9 写实现记录 | 主会话 | — | 门槛全绿；push 等 Gavin |

模板章（先做完给 Gavin 看）：背景章 + 第 01 章（K1、河水山、组屋点开始出现、沉重内容）+ 第 05 章（Landsat 岛岸、填海）。看过再铺开。并行：同一时间只有一个代理改 events / movements；Codex 不改 `src/engines/**`、`scripts/geo/lib/**`、`package.json`、别的主题（four-taps、singapore-1819-1965 只读）。

### 8.1 Codex brief（原样交给 Codex）

> Build the research, map data and drafts for the new TimeScene topic `singapore-land-use` ("Homes, Food and Getting Around: Singapore's Land", Singapore Social Studies P3) in the Atlas project at /Users/gavin/work/atlas. Read first: CLAUDE.md (hard rules: maps only from real datasets or georeferenced public-domain maps, every layer's source, licence and method recorded; objective writing from several sides, no "we"; no grade labels in the UI); docs/34-singapore-land-use-content-spec.md ENTIRELY (§0 decisions, §1 facts F1–F21 with every 待核, §1.4 disputes, §2 chapters and beats, §3 map and data plan with datasets G1–G13, §4 the dated-layer format the engine agent is adding, §5 glossary, §7 images); your own research in art/codex-research/singapore-land-use/ (facts.json, datasets.json, land-use-research.md — reuse the evidence IDs); .claude/skills/atlas-history-topic/ (SKILL.md and all references, especially geo-runbook "城市尺度主题"); docs/06 sections TimeScene, 按国配色, 不确定的边界, 用词覆盖, Geo pipeline, 岛尺度底图 and 按年代的海岸; docs/24 and src/content/topics/four-taps/**, scripts/geo/four-taps/** (island-scale manifest, data.gov.sg fetch, SODL / ODbL attribution, reservoir method — copy reservoir geometry, names, years and sources from four-taps unchanged); docs/28 §3.3 and scripts/geo/singapore-1819-1965/README.md (how land-sg-history.json eras L4 and L5 were made). An Opus agent is adding, to these names: `datedLayers` in topic.yaml with files public/geo/<file>.json (TopoJSON, one object named like the file; feature properties `f` = start as decimal year, optional `u` = end, optional `certainty`, optional `h`), empty control keyframes, and the event kind `milestone`. Author your data to those names; until they land, `pnpm validate` may fail on them — list those errors.
>
> Write only under src/content/topics/singapore-land-use/**, scripts/geo/singapore-land-use/** (raw/, work/ and refs/ gitignored — add the entries), public/geo/land-sg-modern.json, public/geo/sg-*.json and docs/screenshots/singapore-land-use/**. Do not edit src/engines, src/components, scripts/geo/lib, package.json or any other topic (four-taps and singapore-1819-1965 are read-only; read their published files). Do in order:
> (0) Scaffold with `pnpm tsx scripts/new-topic.ts singapore-land-use --engine time-scene --subject geography --title-en "Homes, Food and Getting Around: Singapore's Land" --title-zh "新加坡的家、粮、路：土地利用的变化" --start 1959-04-01 --end 2025-12-31`, then set topic.yaml per spec §2.3 (`basemap: { local: land-sg-modern, maxZoom: 14 }`, `colorBy: entity`, `blocLabels`, `strings`, `note`, `levels: [P3]`, `tags`, `illustration: singapore-land-use`, `status: draft`, `datedLayers` per §3.4).
> (1) Research: every 待核 in §1.3 and §2.2 — read the source and record in RESEARCH.md the fact, exact source (title, publisher, URL, printed page or section, access date), a quotation of at most 25 words, and confirmed / corrected / unverifiable. Also: the first passenger-service date of every MRT and LRT segment (one row per segment, from LTA or NLB pages); the opening or gazette year of each industrial estate, agrotechnology park and nature reserve you map; Loh Kah Seng (2013) on the Bukit Ho Swee fire (only what you can read). Never fill a number or date from memory; when sources disagree keep both with their sources.
> (2) Fetch: G2–G8 and G12 from data.gov.sg as four-taps does (record dataset id, download time, SHA-256, licence text in raw/fetch-log.json); G1 from Wikimedia Commons at full resolution with its licence template text; Landsat Collection 2 scenes for about 1973 (Landsat 1 MSS), 1981 (Landsat 2/3 MSS), 1990 (Landsat 5 TM), 2000 (Landsat 7 ETM+, before May 2003) and 2010 (Landsat 5 TM) covering Singapore, lowest cloud over the island and similar tide stage, through an access route that needs no account (try the Microsoft Planetary Computer STAC API anonymously; if every route needs an account, stop and report — do not create accounts); copy the USGS statement that Landsat data are free of restrictions and the access service's terms into SOURCES-GEO.md. Put map references you may only look at (NAS, NUS / SLA, journal figures, SFA annexes) under refs/ and mark them look-only.
> (3) Coast eras (§3.3): build public/geo/land-sg-modern.json with scripts/geo/lib/local-land.ts and `pipeline.localLand.eras` — L4 and L5 as outlines decoded from public/geo/land-sg-history.json; L6–L10 from the Landsat scenes by the fixed method in §3.3 (NDWI for MSS, MNDWI for TM/ETM+, Otsu threshold within 2 km of today's coast, minus = today's land minus the scene's land buffered by 2 pixels, plus = the scene's land eroded by 2 pixels minus today's land buffered by 2 pixels, drop pieces under 0.1 km²); L11 = today's URA land; era dates = scene acquisition dates; water holes and keepMatch exactly as four-taps; `kind: mask` and `kind: coast-today`. Write the method as a topic-local script scripts/geo/singapore-land-use/landsat-coast.ts. Report for each era: scene ID and date, threshold, p50 / p95 deviation along unchanged coast against today's URA coast, area difference to today's land, and a table of every minus / plus piece over 0.1 km² with the named reclamation project and source it matches (or "unmatched"). Side-by-side images to docs/screenshots/singapore-land-use/coast-L#.png (Landsat false colour beside the traced coast).
> (4) Land-use maps (§3.2): K1 1959-04-01 from G1 — georeference with at least 16 control points (river mouths, capes, reservoir dams, the Causeway, graticule intersections), `projection: auto`, budget max 300 m / RMS 150 m; trace the stippled City of Singapore and Naval Base areas with lines.ts; countryside = L4 land minus those minus reservoirs via compose `difference`; do not trace scattered swamp or forest symbols. K2 1966-01-01 and K3 2019-01-01 empty. K4 2019-11-18 from G2 grouped by the LU_DESC table in §2.3 (first export the distinct LU_DESC values and their total areas; flag any value the table does not place), dissolved per category, clipped to L11. compose → simplify (`rings: N, zero-area 0, self-crossing 0`; budget 1.2 MB). Entity colours fixed as in §2.3 (do not run colour-holders --write). Side-by-side images docs/screenshots/singapore-land-use/geo-K#.png.
> (5) Dated layers (§3.4): hdb-blocks (join G5 footprints with residential=Y to G4 by town + block number, then learn ST_COD ↔ street name from unambiguous matches and join the rest; report matched, ambiguous and unmatched counts by town; do not use OneMap unless more than 2% stay unmatched, and then stop and ask), estates, farm-parks, reserves, reservoirs — each written by scripts/geo/singapore-land-use/dated-layers.ts to public/geo/sg-<id>.json with `f` (and `u`, `certainty`, `h` where the spec says), within the size budgets; one image per layer at 1965, 1980, 2000 and 2019 to docs/screenshots/singapore-land-use/layers-<id>-<year>.png.
> (6) Rail (§3.5): split the MP2019 rail line geometry at stations into one LineString per opening segment, `persist: true`, `from` = `to` = first passenger-service date, `holder: transport`, label {en, zh 【待译】}; record every segment with its date source in SOURCES.md "Movement routes".
> (7) Data and chapters: entities (§2.3), events (ids exactly as in §2.2; reservoir site events copied from four-taps with the same ids, coordinates, years and source texts), presets, glossary (§5 ids; `water-catchment` definition copied from four-taps), sources.json numbered by the blocks in §6, then `pnpm tsx scripts/sources-md.ts singapore-land-use`. Background + 6 chapters per §2 in ENGLISH only (180–260 words, 3–4 paragraphs, 2–3 <More> each; every number in <Num s>; <Term> on first use; dates as "25 May 1961"; "planned use" for every Master Plan statement; HDB dots described as blocks standing today; resettlement and land acquisition told from both sides with sources; the Bukit Ho Swee fire's cause as unknown, with the other accounts attributed); Chinese fields "【待译】" + the English; beats per §2.2 with the EN captions given there, moved later where a coast era date requires it.
> (8) Images: generate the three figures marked 重画 / 新画 in §7 with `pnpm tsx scripts/illustrate.ts gen` into the scratchpad folder genimg/singapore-land-use/ only (do not run `process` / `figure`), one PNG per id, respecting every "must not show" item.
> Run `pnpm validate` until 0 errors apart from fields the engine has not landed. Do not run build, test, e2e or shoot. Do not commit. Finish with: counts (eras, keyframes, features per category, HDB points and join rates, layer features, rail segments, events, sources, glossary terms), per-era coast statistics, the K1 georeference residuals, every fact still unverified, every licence you could not confirm, and the validate status.

### 8.2 验收（`acceptance.md` 之外，本主题另加）

- [ ] **地图只用真实数据**：每段岛岸、两张整岛图、每个图层在 `data/SOURCES.md` 与 `SOURCES-GEO.md` 都有一行（来源、许可原文、方法、残差或偏差、已知差距）；没有手画多边形、没有 `bbox` 当范围；NAS / SLA / 学术图只在 refs/。
- [ ] **年代对得上**：1959 年的图在 1966 年以后不出现、MP2019 在 2019 年 8 月以前不出现；任何一拍里新填的地只在它那个时代之后出现；Landsat 每块 `minus` 都对上一个有来源的工程或已说明。
- [ ] **组屋点**：连接率 ≥ 98%；图层说明、阅读说明、第 01 章都写了"今天还在的楼"；1 万点在 1080p 拖动播放头 ≥ 50 fps。
- [ ] **"规划用途"**：所有讲 MP2019 的字幕、标签、正文都写规划，不写现状；面积比例写明是计算值。
- [ ] **两边写**：河水山大火起因、土地征用、甘榜搬迁、停止养猪、填海用沙各有两边的来源；没有"贫民窟"泛指甘榜、没有"我们"。
- [ ] **数字与分母**：组屋比例的分母变化在细看里写明；"30 by 30"写成过去的目标；纤维类 / 蛋白质类有定义；陆地面积写了 2002 年的口径变化。
- [ ] **与 four-taps 一致**：蓄水池的 id、坐标、年份、来源逐条相同（脚本比对）；`water-catchment` 定义逐字相同。
- [ ] 界面上没有年级；`levels` 只在 topic.yaml。
- [ ] 图像 5 张：没有人、字、标志、地铁线色；`housing-change` 的组屋没有底层空间、木屋是亚答顶。
- [ ] 河水山大火等段落的中文稿 Gavin 已审（§8.3-3）。

### 8.3 待 Gavin 确认（只列真正需要他决定的）

1. **要不要向 SLA / NUS 申请 1966 年、1975 年 1:25,000 地形图的使用许可**（D28；NUS 已有配准好的拼接图）。拿到许可，就能把 1960–70 年代的农场、甘榜、海岸照真实地图描出来，补上本主题最大的空白（§3.7）；拿不到，按本文的做法（1959 BIS + 卫星海岸）照样能发布。申请要以 Gavin 的名义发邮件。
2. **OneMap 令牌**：只有组屋连接率低于 98% 时才需要；OneMap 搜索要注册账户拿令牌，代理不能替你注册。另外，若 Landsat 的所有免账户下载途径都不通，USGS EarthExplorer / M2M 也要账户。
3. **中文亲审**：河水山大火（4 人死亡）与甘榜搬迁、土地征用两边写的段落；名词 `kampong`、`resettlement`、`land-acquisition` 的中文定义。

（其余 §0 各条主会话已代定；E1 若排不进，按 §4 Plan B 走，不需要再问。）

---

## 9. 实现记录与已知差距

（施工后填写。）
