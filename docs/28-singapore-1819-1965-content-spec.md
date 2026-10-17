# 28 · 新加坡 1819–1965 · 内容施工 spec（v1 草案）

TimeScene / GeoStage，paper 默认、cinema 可切。按 skill `atlas-history-topic` 的 `spec-template.md` 写，范本 docs/27（春秋战国：spec → Codex 草稿 → Opus 史学复核 → 草稿部署）、docs/09（二战）；岛尺度底图照 docs/24（`four-taps`）。**未经 Gavin 定稿不写正文、不建脚手架**（CLAUDE.md）；§0 由主会话按 Gavin 惯例代定（§0.1），Gavin 可逐条推翻。

- slug：`singapore-1819-1965`；标题 EN "Singapore, 1819–1965" / ZH "新加坡 1819–1965"；副标题 EN "From trading port to republic" / ZH "从商港到共和国"；`shortTitle` EN "Singapore 1819–1965" / ZH "新加坡 1819–1965"。
- 课纲：MOE 2020 SS 课纲 P4 全部（S5 第 28–32 页：早期历史、移民、日据、战后到建国）+ P5 的 1964 年骚乱与社会凝聚（第 33–35 页），docs/17 §4、§6 #10。`levels: [P4, P5]` 只是规划元数据（schema 注明 never rendered，docs/06「年级、索引页与偏好」）；**界面任何地方不出现年级**。`tags: [singapore, history, map]`。
- **本文的调查结论**（2026-10-17 用 Commons API 实查，§3.1 有清单）：①新加坡岛与城区有一批**公有领域**的历史地图可以配准（1822 Jackson Plan、1825 印度事务部测图、1828 Crawfurd 版城区图、1839 Coleman 城郊图、1846–54 Thomson 海峡测图、1879 城区图、1893 Constable 城区图、1912/1916 英国陆军部全岛图、1941/1944 1:63,360 全岛图、1961 年测、1966 年版的海军部海图）；②马来亚的州界可以全部用 **Natural Earth admin-1（公有领域）** 按州组合出来，CShapes 只作核对；③所以本主题发布的地图数据**全部来自公有领域与 SODL 数据**，可以照 `LICENSE-CONTENT` 按 CC BY-NC-SA 4.0 提供，没有 ww2 那种 BY-SA 与 BY-NC-SA 同许可条款互相冲突的问题（§3.5）。
- **引擎结论**（§4）：三个尺度在今天的引擎里**已经能共存**——默认世界底图（`land-50m` + zoom ≥ 7 的东南亚 1:10m）+ `basemap.local`（zoom ≥ 9.4 的岛尺度陆地）就是 four-taps 的配置，不需要 `basemap.region`。唯一必须补的是**按年代切换的岛尺度海岸线**（E1：`basemap.local` 文件里的 `kind: land` 带 `from / to`），否则 1822 年的城区图会画在 2019 年的填海地上。E1 做不了时有退路（只用一条 1961–66 年海岸，§4 Plan B）。

---

## 0. 决策（2026-10-17 起草，主会话按 Gavin 惯例代定，见 §0.1）

| # | 决定（建议） | 选项 / 理由 | 定稿 |
|---|---|---|---|
| 1 | **章数**：背景章 00 + 11 章（§2）。时间轴从 1819-01-28（莱佛士船队抵达）到 1965-12-22（尤索夫·伊萨就任第一任总统）；淡马锡（14 世纪）只在背景章，写成 `site` 事件和细看，**不进时间轴**（否则时间轴跨 650 年，1819 以后的章被挤扁） | 另一个选项是 00 + 10（把第 08、09 章合成"从殖民地到自治 1945–1959"）。不建议：两章各有一组沉重段落（玛丽亚·赫托暴乱、福利巴士工潮 / 1956 年学潮），合并后每段都写不足 | 按建议 |
| 2 | **三种尺度、一张底图**：区域（印度洋—南中国海，贸易与移民航线）· 马来亚（1957 联合邦、1963 马来西亚、1965 分家）· 岛与城区（1822 城区规划、填海、地点）。用默认世界底图 + `basemap: { local: land-sg-history, maxZoom: 14 }`；章节镜头在三档之间飞（§2.1）。不用 `basemap.region`：它会藏掉世界，而移民航线要从哈德拉毛（49°E）画到厦门（118°E） | §4 | 按建议 |
| 3 | **岛尺度海岸按年代切换**（引擎 E1）：6 段海岸 L0–L5（1819 / 1823 / 1887 / 1912 / 1937 / 1961），每段由公有领域地图配准描摹（§3.3）；外加一条虚线"今天的海岸"（E2，可选）。1965 年以后的填海（滨海湾、樟宜、大士、裕廊岛）**任何一帧都不出现** | E1 做不了就走 Plan B（只用 L5 一条海岸，误差写进阅读说明） | 按建议 |
| 4 | **控制区按"谁治理"画**，`colorBy: entity`，所有实体 `bloc: neutral`，不用阵营色（不把殖民政府、马来统治者、日本、各政党分成"两边"）。23 个关键帧（含 6 个"保持帧"、4 个"换岸帧"，§3.4）；州界来自 NE admin-1，1822 城区规划分区来自 Jackson Plan 配准描摹 | 不采用 `allied = 英国 / axis = 日本`：那是二战的框架，套到 146 年上会把整个殖民时期写成"同盟一方" | 按建议 |
| 5 | **1822 城区规划的各分区当作控制区的 holder**（只在 K2 一帧）：欧洲人市区、华人甘榜、朱利亚甘榜、武吉士甘榜、阿拉伯甘榜、甘榜格南（苏丹）、政府山等，按 Jackson Plan 图例逐项列（**待核**原图图例）。正文写明这是**殖民政府按族群划地的规划**，实际居住很快就混杂了 | 另一个选项是引擎加一个"规划分区"图层（虚线轮廓 + 名称，不进图例）。不建议现在做：多一个图层语义，多一条引擎工作；分区本来就是 Jackson Plan 上着色的区块，用控制区画最接近原图 | 按建议 |
| 6 | **日据三年八个月不重写**：第 07 章是一章概览（沦陷前、新加坡之战、肃清、日常生活、各群体、结束），数字、措辞与 `ww2` 第 07、08、11 章**逐字一致**，事件 / 路线按 ww2 的 id 和来源**复制**，正文用 `<TopicLink slug="ww2" ch="…">` 链过去细看（E3）。本主题补 ww2 没写的：马来人、印度人、欧亚裔各自的处境，1944–45 年盟军轰炸新加坡的平民伤亡 | 复制而不是跨主题引用：引擎每个主题一份数据，跨主题读数据是新功能，不值得 | 按建议 |
| 7 | **沉重内容写到什么程度**：肃清（与 ww2 同一组数字和争议）、1854 年福建—潮州械斗、1915 年兵变与公开处决、苦力贸易（"猪仔"）、印度罪犯劳工、鸦片饷码、1950 年玛丽亚·赫托暴乱、1955 年福利巴士工潮、1956 年华校学潮、1963 年冷藏行动（逮捕的理由与争议两边写）、1964 年 7 月与 9 月种族骚乱、印尼对抗（1965 年麦唐纳大厦爆炸）。**同一套写法、同一种标记**：屠杀 / 暴行空心方块，伤亡数字带来源，有名字写名字。`sensitivity: open`；这些段落的中文稿 Gavin 亲审（§9） | 不配图（不画暴乱、屠杀、处决） | 按建议 |
| 8 | **传说与史料分开**：桑尼拉乌他马与狮子写成"《马来纪年》里的故事"，常见的"1299 年"注明是后人推算、不见于《马来纪年》原文（**待核**）；与汪大渊《岛夷志略》、《爪哇史颂》、托梅·皮列士的记载和福康宁考古并列。"沉睡的小渔村"一说写进细看，作为被近年研究修正的说法（P13 Kwa 等） | | 按建议 |
| 9 | **多方视角**（§1.2 表）：英国官员（莱佛士、法夸尔、克劳福德之间也有分歧）、苏丹胡先与天猛公阿都拉曼、廖内—林加一方（阿都拉曼苏丹、武吉士贵族、荷兰）、各移民群体、海人（Orang Laut）、罪犯与苦力本人；战后写英国、马来亚联盟党 / 巫统、人民行动党、社阵与左翼工运、马来西亚联邦政府、印尼。1965 年分家写吉隆坡与新加坡两边当时的公开说法和后来的回忆录 | | 按建议 |
| 10 | **精度**：时间轴到天（默认 `datePrecision`）；只知道年或月的事件照写年 / 月精度（data-cookbook 允许），不编日子。人口、伤亡数字取整写"约"，精确值放细看 | | 按建议 |
| 11 | **名称**：EN 用当时的正式名称并附今天的写法（Malacca / Melaka，Province Wellesley / Seberang Perai，Kampong Glam）；ZH 用新加坡本地通行译名（莱佛士、法夸尔、苏丹胡先、天猛公阿都拉曼、东姑阿都拉曼、李光耀、马绍尔、林有福、尤索夫·伊萨、拉惹勒南、吴庆瑞、杜进才、奥斯曼·渥），首次出现附原文；"苦力 coolie"是当时的称呼，正文写成"经客头招募的劳工（当时称'苦力'）"，名词表说明这个词今天带贬义 | 译名清单 Opus 中文定稿时按 NLB 与《联合早报》用法核一遍（**待核**） | 按建议 |
| 12 | 不做：测验、孩子提问、配音文件、视频、真实人物肖像、旗帜和徽章；首页图已有（新加坡河石墨图版） | | 按建议 |

### 0.1 代定（2026-10-17，主会话按 Gavin 惯例）

1. §0 全部按建议：00 + 11 章；默认世界底图 + 年代岛岸；控制区按治理者、按实体配色、无阵营；1822 规划分区只在 K2；日据一章概览、数字与 ww2 一致并链过去；沉重内容写足、Gavin 亲审中文；传说与史料分开。
2. 地图数据：公有领域历史地图配准描摹 + NE admin-1 按州组合 + URA 2019 岛岸；CShapes、CC BY-SA 的 Commons 现代示意图只作核对、不描、不发布（§3.5）。每帧在 `data/SOURCES.md`、`SOURCES-GEO.md` 记来源、许可原文、配准模型与残差。
3. 引擎（Opus，**等当前改引擎的代理提交之后**再开）：E1 年代岛岸（必须）、E2 今天海岸虚线（建议）、E3 `TopicLink ch`（建议）；管线 P1 `local-land.ts` 的 `eras` 配方、P2 按帧指定海岸裁剪陆地、P3 分框简化容差（先核对现有代码是否已支持）。
4. 施工外包：Codex 做研究表、地图配准管线、数据草稿、英文初稿（§8 brief）；Opus 史学复核与客观性复核；中文由 Claude（Opus）独立成文；Sonnet 节拍与 QA；草稿部署给 Gavin（`status: draft`）。

---

## 1. 范围、立场、必须讲对的事实

### 1.1 范围与读者

- 时段：1819 年 1 月—1965 年 12 月；背景章回溯到 14 世纪的淡马锡和 17–18 世纪柔佛—廖内治下的新加坡海峡。地域：新加坡岛与城区；马来半岛、廖内—林加、婆罗洲北部；贸易与移民的来处（华南沿海、印度南部与孟加拉、马来群岛、哈德拉毛、欧洲）。
- 读者：小学高年级学生和家长；P4 社会课的主线，但不按课本复述。每章正文 EN 200–300 词 / ZH 350–500 字，3–5 段，细看 2–4 块。
- 不讲：1965 年以后（国民服役、组屋、经济起飞——留给 `singapore-land-use` 等主题，docs/17 #12）；马来西亚其他州的内政只写到与新加坡相关为止。

### 1.2 立场与口吻（最高优先级）

- **不写建国神话，也不写殖民功劳簿**：不写"莱佛士创建了新加坡""从小渔村到大都会""先辈们披荆斩棘（我们的）""英国人带来文明"。写"1819 年英国东印度公司在新加坡河口建立商站"，接着写为什么是这里、谁同意了、谁反对、谁付了代价。
- **开埠的合法性要交代**：莱佛士承认胡先为苏丹，是为了让条约有一个签字的君主；胡先的弟弟阿都拉曼已在廖内由武吉士贵族和荷兰人扶立，王室信物（regalia）在恩古布特里·哈米达手里，两边都不承认对方（**待核**：Trocki 1979、Andaya & Andaya 2017）。荷兰抗议，英国政府起初也犹豫。1824 年《英荷条约》在伦敦把马来世界一分为二，当地统治者没有参加。
- **殖民经济的收益和代价并列**：自由港、转口贸易、学校医院之外，写鸦片饷码占殖民地收入的比重（Trocki 1990，**数字待核**）、苦力贸易的欺骗与死亡、印度罪犯修路建屋、甘蜜与胡椒种植砍光森林、按族群划地。
- **各群体对称**：每个移民群体都写来处、原因、住处、困难和贡献，篇幅按人数与历史分量，不按"和读者有关"。海人（Orang Laut）、马来人是 1819 年以前就在这里的居民，不写成"背景"。
- **战后政治两边写**：冷藏行动（1963）写政府当时的理由（共产党统战、安全威胁）与被捕者、部分史家的看法（打压反对党），都给出处；1964 年骚乱写巫统与《马来前锋报》的宣传、行动党"马来西亚人的马来西亚"、联邦政府指称印尼特工挑动——**不判谁对**；分家写东姑的说法（避免流血）、李光耀的公开反应、马来西亚国会表决，以及后来公开的档案与回忆录。
- **不用**"我们 / 敌人 / 我国先辈"；殖民官员、苏丹、移民、政治人物一律用名字和职位。
- **数字**：每个 `<Num s>`；来源冲突列区间，两端各用自己的来源（肃清、1854 年械斗、苦力死亡率）。

用词表：

| 不写 | 写 | 说明 |
|---|---|---|
| 莱佛士创建 / 发现新加坡 | 英国东印度公司在新加坡河口建立商站（1819） | 岛上已有居民和天猛公的村落 |
| 沉睡的小渔村 | 1819 年岛上约有一千名居民（来源不一，**待核**） | 细看写这个说法的来历与修正 |
| 先驱 / 开拓者（只指移民或英国人） | 按身份写：商人、种植者、劳工、罪犯、官员 | |
| 苦力（不加说明） | 经客头招募的劳工（当时称"苦力"） | 名词表 `coolie` |
| 海盗（泛指海人） | 海人；袭击商船的人（按来源写是谁说的） | 英国文献把许多海人一概称为 pirates |
| 光复 / 解放（1945） | 日本投降，英军重返新加坡；英国军政府 | 1945 年对不同群体意义不同 |
| 暴徒（泛指） | 参加暴乱的人；按来源写人数、被捕人数 | |
| 共党分子（作定论） | 被政府指为共产党统战成员的人 | 冷藏行动两边写 |
| 被踢出马来西亚 | 新加坡脱离马来西亚，成为独立国家 | 两边的说法放细看 |

### 1.3 必须讲对的事实（施工时每条配 `<Num>` / `sources`；P# 见 §6）

| # | 事实 | 写法 | 来源 | 争议与注意 |
|---|---|---|---|---|
| F1 | **淡马锡的史料** | 汪大渊《岛夷志略》（1349 年成书）记"单马锡"与"龙牙门"、"班卒"；《爪哇史颂》（1365）把 Tumasik 列为满者伯夷的属地；托梅·皮列士《东方志》（1512–15）记巨港王子拜里米苏拉杀了新加坡的统治者、后来逃到马六甲；《马来纪年》记桑尼拉乌他马建"新加坡拉"、末代王伊斯坎达沙逃走 | P1 汪大渊（Rockhill 1915 英译，公有领域）；P2 《马来纪年》（Leyden 1821 英译，公有领域；Brown 1952）；P3 Pires（Cortesão 1944）；P13 | 龙牙门、班卒的位置学界有不同说法（**待核**：Miksic 2013 第 4 章）；两种"末代统治者"叙述并列，不选边 |
| F2 | **福康宁考古** | 1984 年起米克锡克（John Miksic）在福康宁山发掘，出土 14 世纪中国瓷片、玻璃、钱币等；1928 年修蓄水池时出土一批爪哇风格金饰（**年份待核**）；新加坡石（河口的刻文巨石）1843 年被炸，残片藏国家博物馆，文字尚未释读 | P14 Miksic 2013；P15 国家博物馆藏品页 | 金饰出土年份有 1926 / 1928 两说，施工时以博物馆页为准 |
| F3 | **1819 年的条约** | 1819 年 1 月 28 日莱佛士、法夸尔的船队抵达；1 月 30 日与天猛公阿都拉曼订初步协议；2 月 6 日与苏丹胡先、天猛公订约，东印度公司每年付苏丹 5,000、天猛公 3,000 西班牙银元（**待核**） | P4 Buckley 1902（公有领域，条约原文）；P10 Turnbull 2009 | 抵达日有 28 / 29 日两说（**待核**） |
| F4 | **1819 年岛上人口** | 约一千人：海人（Orang Kallang、Orang Seletar、Orang Gelam 等）约五百、马来人一两百、华人二三十（**各数待核**） | P10；P13 | 来源不一，写区间 |
| F5 | **1823–1824 年的条约** | 1823 年 6 月 7 日协议：苏丹、天猛公放弃大部分权利换年俸；1824 年 3 月 17 日《英荷条约》：马六甲归英、明古连归荷，马六甲海峡以南归荷兰势力范围；1824 年 8 月 2 日克劳福德条约：新加坡岛及周围 10 地理英里内岛屿永久割让给东印度公司，苏丹、天猛公得一次性款项与月俸（**数额待核**） | P4；P10；P16 Tarling 1962 | 当地统治者没有参加英荷谈判，写清楚 |
| F6 | **海峡殖民地** | 1826 年槟城、马六甲、新加坡合为海峡殖民地，隶属东印度公司；1832 年首府迁新加坡；1867 年 4 月 1 日改为英国直辖殖民地 | P10；NLB Infopedia | 1858 年东印度公司撤销后归印度事务部，再到 1867 年改归殖民地部 |
| F7 | **人口普查** | 1824 年 10,683 人；1871 年 97,111；1931 年 557,745；1957 年 1,445,929（**全部待核**，含各族人数和比例） | P20 Saw Swee Hock 2012；各次普查报告（P21） | 1824 年的数字是点算（enumeration），不是正式普查；1871 年起才是正式普查 |
| F8 | **印度罪犯劳工** | 1825 年起从明古连、印度各口岸运来罪犯，修路、填地、盖圣安德烈座堂和总督府；1873 年停止运送（**待核**） | P22 Anand Yang 2021；P23 Pieris 2009 | 人数逐年不同，写区间 |
| F9 | **华人移民与苦力贸易** | 客头、"猪仔馆"、赊单（credit-ticket）制度；1877 年设华民护卫司（毕麒麟）；20 世纪初每年经新加坡入境的华人移民数以十万计（**年份与数字待核**） | P24 Yen Ching-hwang 1986；P25 Kuhn 2008；P26 Warren 1986 | 船上死亡率、拐骗的记载要有出处，不用小说化的描写 |
| F10 | **鸦片饷码** | 政府把鸦片专卖权拍卖给饷码商，19 世纪鸦片税收常占海峡殖民地财政收入的四成到一半（**待核**） | P27 Trocki 1990 | 1910 年政府接手专卖，1946 年禁吸（**待核**） |
| F11 | **1854 年械斗** | 1854 年 5 月福建帮与潮州帮冲突，持续约十天，死者约 400–500 人（**待核**） | P4；P10 | 数字来自英文报纸与官员记载，写"据当时记载" |
| F12 | **1915 年兵变** | 1915 年 2 月 15 日驻新加坡的印度第 5 轻步兵团部分士兵兵变，打死英国军官、士兵与平民约 47 人（**待核**）；兵变被镇压后 47 人在欧南路监狱外被公开枪决（**待核**） | P28 Harper & Miller 1984（**待核**书目）；NLB | 兵变者的动机（战争宣传、宗教、对调防的担心）有几种解释，并列 |
| F13 | **日据** | 与 ww2 一致：1942 年 2 月 15 日约 8.5 万守军投降；肃清的遇难人数日方约 5,000，新加坡华人社会估计最高 10 万，多数估计 2.5 万到 5 万；樟宜海滩 66 人、榜鹅海滩约 400 人；三年八个月 | 复制 ww2 S29、S43、S95–S100 的原文（新编号，`note` 写"同 ww2 S95"） | **ww2 第 08 章写"2 月 18 日到 3 月 4 日"，它引的 S100 写"2 月 21 日起"**：本主题写"2 月 18 日开始，市区集中检证主要在 21–23 日（Hayashi，S97），到 3 月 4 日"，与 ww2 一致（2 月 20 日樟宜海滩屠杀已在 ww2 里；§10-1 已定，不改 ww2） |
| F14 | **玛丽亚·赫托暴乱** | 1950 年 12 月 11–13 日，围绕一名荷兰裔少女的监护权判决爆发暴乱，死 18 人、伤 173 人（**待核**） | P30 NLB Infopedia；P31 Hughes 1980 | 死者包括欧洲人、欧亚裔和被警察打死的参与者，逐类写 |
| F15 | **福利巴士工潮** | 1955 年 5 月 12 日，4 人死亡（含一名警察、一名学生、一名美国记者，**名字与身份待核**） | P30；P32 | 工人、学生、政府三方的说法 |
| F16 | **1956 年华校学潮** | 1956 年 10 月 24–29 日，死 13 人、伤百余人（**待核**） | P30 | |
| F17 | **自治与第一届内阁** | 1959 年 5 月 30 日大选，行动党得 51 席中的 43 席（**待核**）；6 月 3 日自治；6 月 5 日李光耀宣誓就任总理，内阁 9 人（**名单待核**）；12 月尤索夫·伊萨就任元首 | P33 新加坡国家档案馆 / Singapore Statutes；P10 | |
| F18 | **合并公投** | 1962 年 9 月 1 日，A 案约 71%，空白票约 25%（**待核**） | P30；P34 Lau 1998（**待核**） | 选项设计本身有争议（没有"反对合并"一项），两边写 |
| F19 | **冷藏行动** | 1963 年 2 月 2 日，内部安全理事会下令逮捕 100 余人（113 / 111 / 107 说法不一，**待核**） | P35 Thum 2013；P36 Ramakrishna 2015；P37 李光耀 1998 | 两种解释各一段，不下结论 |
| F20 | **马来西亚成立** | 1963 年 7 月 9 日在伦敦签《马来西亚协定》；9 月 16 日马来亚、新加坡、沙巴、砂拉越组成马来西亚，文莱没有加入；印尼"对抗"、菲律宾对沙巴的主张 | P9 Malaysia Agreement（UNTS vol. 750，**待核**）；P38 Tan Tai Yong 2008；P39 Sopiee 1974 | 原定 8 月 31 日，因联合国调查团推迟（**待核**） |
| F21 | **1964 年种族骚乱** | 7 月 21 日先知诞辰游行时爆发，死 23 人、伤 454 人；9 月 3 日起第二次，死 13 人、伤 106 人（另有 12 人之说） | P30 NLB Infopedia SIP_45（**原文待读**）；P34 | 两次都写；亲善委员会、宵禁；各方当时的说法并列 |
| F22 | **麦唐纳大厦爆炸** | 1965 年 3 月 10 日，印尼突击队员在乌节路麦唐纳大厦放炸弹，3 人死、33 人伤（**待核**） | P30 | 两名突击队员 1968 年被处决，写在细看，不进时间轴 |
| F23 | **分家** | 1965 年 8 月 7 日签《新加坡独立协定》；8 月 9 日马来西亚国会以 126 票对 0 票通过修宪（**待核**）；同日新加坡宣布独立；12 月 22 日尤索夫·伊萨成为第一任总统 | P9 Singapore Statutes Online（Independence of Singapore Agreement 1965、Republic of Singapore Independence Act 1965）；P34；P40 Tunku 1977；P37；P39 | 东姑与李光耀的说法、后来公开的英国档案（Lau 1998）并列 |

---

## 2. 章节计划（背景章 + 11 章）

### 2.1 总表

`cam` = `[lng, lat, zoom]`；三档：区域 3.0–3.4、马来亚 5.0–6.4、岛 10.2、城区 13.6–14（`maxZoom: 14`；岛尺度海岸在 9.4–9.6 渐入，镜头取 ≤ 9.3 或 ≥ 9.6，docs/06）。`layers` 默认 `base, control, movements, battles`，需要地点的章加 `sites`；**不写 `borders`**。章节 `t` 落在关键帧日期上或之后、早于下一帧开始淡入（区间最后 30%），逐章已核（"校验"列）。

| # | id | 标题 EN / ZH | t | cam | 帧 | 校验 |
|---|---|---|---|---|---|---|
| 00 | background | Background: Temasek and the Malay world / 背景：淡马锡与马来世界 | （`state.time` 1819-01-28） | 103.0, 2.0, 5.6 | K1 | 早于第一帧 = K1 |
| 01 | founding-1819 | 1819: a British trading post / 1819：英国商站 | 1819-02-06 | 103.85, 1.29, 13.2 | K1 | K1→K2 淡入从 1822-03 起 |
| 02 | town-plan | The town plan and the treaties, 1822–1824 / 城区规划与条约（1822–1824） | 1823-06-09 | 103.852, 1.291, 13.8 | K2 | K2→K3 淡入从 1825-10 起；末拍 1824-08-02 仍是 K2 |
| 03 | free-port | A free port in the Straits, 1826–1869 / 海峡里的自由港（1826–1869） | 1826-11-27 | 101.5, 3.5, 5.4 | K3 | K3→K4 是同一几何，标签在 1867-01 前后换成"直辖殖民地"，与 1867-04 一致 |
| 04 | arrivals | Who came, and why / 谁来了，为什么来 | 1877-05-01 | 88.0, 9.0, 3.1 | K4 | K4→K5 淡入从 1889-10 起 |
| 05 | town-life | Living in the town: hardship and building / 城里的日子：艰难与建设 | 1887-12-31 | 103.848, 1.289, 13.6 | K4a（岛岸 L2） | K4a→K5 淡入从 1893-08 起 |
| 06 | british-malaya | The Crown Colony and British Malaya, 1874–1941 / 直辖殖民地与英属马来亚（1874–1941） | 1909-07-09 | 102.4, 4.2, 5.6 | K6 | 下一帧 K6a（1912）只差新填地；1942 年的变化有保持帧 K7 挡住 |
| 07 | war-and-occupation | War and occupation, 1941–1945 / 战争与日据（1941–1945） | 1942-02-15 | 103.82, 1.36, 10.2 | K8 | K8→K9 淡入从 1943-03 起 |
| 08 | after-the-war | Back under British rule, 1945–1955 / 重回英国统治（1945–1955） | 1946-04-01 | 103.85, 1.33, 10.2 | K12 | K12→K13 淡入从 1947-07 起 |
| 09 | self-government | Towards self-government, 1955–1959 / 走向自治（1955–1959） | 1959-06-03 | 103.85, 1.33, 10.2 | K15 | 下一帧 K15a（1961）只差新填地；1963 年的变化有保持帧 K16 挡住 |
| 10 | merger | Merger: Malaysia, 1961–1963 / 合并：马来西亚（1961–1963） | 1963-09-16 | 109.0, 4.0, 4.8 | K17 | K17→K18 淡入从 1965-02 起 |
| 11 | separation | Riots and separation, 1964–1965 / 骚乱与分家（1964–1965） | 1965-08-09 | 103.82, 1.36, 10.2 | K19 | 最后一帧 |

阅读说明（背景章 `state.note`）：①本主题从哪些人的角度讲（英国官员、马来统治者、各移民群体、战后各政党与两国政府），哪些材料是谁写的（多数是英文档案和报纸，马来文、中文、泰米尔文的材料较少，《阿都拉传》是少有的本地人亲历记）；②数字怎么标（每个数字可点开来源，来源不一时并列）；③地图怎么来的（岛与城区来自配准的旧地图，海岸按年代变化，1965 年以后的填海不画；马来亚的州界取今天的州界，殖民时期的差别写在帧说明里）；④传说怎么写。

### 2.2 各章

格式同 docs/27：**正文要点 → 细看 → 节拍（3–5，字幕 EN / ZH 草稿，日期开头、描述地图）→ 事件（`id · t（until）· at · kind`）→ 路线 → 领土名称**。坐标取 Wikidata（CC0）或配准后的旧图读数，不取 OSM 以外的商业地图。

#### 00 background · 背景：淡马锡与马来世界

- 正文：马六甲海峡与新加坡海峡是季风航路的咽喉；14 世纪的淡马锡（F1、F2）；15 世纪起马六甲王国，1511 年葡萄牙人占马六甲后，马六甲王室在柔佛重建，1613 年新加坡河口的据点被葡萄牙人焚毁（**待核**：Borschberg）；17–18 世纪新加坡海峡属柔佛—廖内，海人替苏丹巡海；18 世纪武吉士贵族在廖内掌权；1812 年苏丹马哈茂德三世去世后的继承之争（§1.2）。地图怎么读：区域图上的点是港口和都城；控制区只画有可靠地图的部分（1819 年只有槟城、马六甲和新加坡岛）。
- 细看：①**桑尼拉乌他马与狮子：故事，不是记载**（《马来纪年》的情节；新加坡不产狮子，"他看见的可能是什么"有几种猜测；1299 年是后人推算，**待核**）；②**史书里的淡马锡**（汪大渊、《爪哇史颂》、皮列士：三份记载各说了什么）；③**地下的淡马锡**（福康宁的瓷片、金饰，新加坡石；**配图 `temasek-finds`**）；④"小渔村"之说从哪里来。
- 节拍（4）：
  1. 区域（88.0, 9.0, 3.1）。EN "Before 1819: the monsoon winds carry ships between India, the Malay world and China, and every route through the Straits of Malacca passes the island at the tip of the peninsula." ZH "1819 年以前：季风把船送到印度、马来群岛和中国之间，凡是穿过马六甲海峡的航线，都要经过半岛南端的这座岛。"
  2. 岛（103.82, 1.30, 11.5，开 `sites`，高亮 `site-fort-canning-temasek`、`site-singapore-stone`）。EN "The fourteenth century: on the hill above the river mouth, now Fort Canning, archaeologists have found Chinese porcelain, glass and gold from a town that Chinese and Javanese writers called Danmaxi and Tumasik." ZH "14 世纪：河口上方的小山，也就是今天的福康宁，考古学家挖出了中国瓷器、玻璃和金饰。中国和爪哇的作者把这个地方叫做单马锡、Tumasik。"
  3. 海峡（104.2, 1.0, 8.2，高亮 `site-riau-penyengat`、`site-johor-lama`）。EN "From the sixteenth century the island belongs to the Sultanate of Johor, whose rulers move between the Johor River and the Riau islands; Orang Laut sea people patrol the straits for them." ZH "16 世纪起，这座岛属于柔佛苏丹国，苏丹的王都在柔佛河与廖内群岛之间迁来迁去；海人替苏丹巡守海峡。"
  4. 马来亚（103.0, 2.0, 5.6，高亮 `site-penang`、`site-malacca`）。EN "By 1818 the British hold Penang and the Dutch hold Malacca again; in Riau two sons of the late Sultan Mahmud are both claimed as his heir." ZH "到 1818 年，英国人占着槟城，荷兰人重新占有马六甲；在廖内，已故苏丹马哈茂德的两个儿子都被人拥立为继承人。"
- 事件：`site-fort-canning-temasek` · 1984 · [103.846, 1.295] · site｜`site-singapore-stone` · 1843 · [103.853, 1.288] · site（河口原址，**坐标待核**）｜`site-longyamen` · 1349 · [103.82, 1.265]（**位置有争议**，detail 写各说）· site｜`site-johor-lama` · 1540 · [104.0, 1.58] · site｜`site-riau-penyengat` · 1803 · [104.42, 0.94] · site｜`site-lingga-daik` · 1787 · [104.58, -0.2] · site｜`site-penang` · 1786 · [100.34, 5.42] · site｜`site-malacca` · 1511 · [102.25, 2.19] · site｜`mahmud-iii-dies` · 1812 · [104.58, -0.2] · political。
- 领土名称（K1）：PENANG（EIC）· MALACCA（Dutch）· SINGAPORE（Johor）。

#### 01 founding-1819 · 1819：英国商站

- 正文：英国东印度公司要一个在马六甲海峡南口、不在荷兰控制下的港口，保护通往中国的航线（茶叶与鸦片贸易）；莱佛士（明古连副总督）与法夸尔（前马六甲驻扎官）1819 年 1 月底到河口，天猛公阿都拉曼的村子已在那里；为了订约，他们从廖内请来胡先，立他为苏丹（F3）；2 月 6 日订约，法夸尔任驻扎官；荷兰抗议，廖内的阿都拉曼苏丹一方不承认；岛上已有的人（F4）；法夸尔头几年靠开放赌博、鸦片专卖筹钱，与莱佛士起冲突（1823 年被撤换）；武吉士商人和廖内的华人甘蜜种植者陆续迁来。
- 细看：①**两个苏丹**：继承之争、王室信物，以及胡先一方和廖内一方各自怎么看 1819 年的条约；②**天猛公**：为什么他在新加坡、他和海人的关系（Trocki 1979）；③**《阿都拉传》**：马六甲文人阿都拉·门希亲历的早年新加坡，以及这本书本身的立场（他为英国人工作）；④为什么英国政府起初不想要新加坡。
- 节拍（4）：
  1. 1819-01-28 · 岛（103.85, 1.29, 12.6，高亮 `raffles-arrives`）。EN "28 January 1819: ships of the East India Company anchor off the Singapore River, where the Temenggong Abdul Rahman has his village." ZH "1819 年 1 月 28 日：英国东印度公司的船停在新加坡河口外，河口有天猛公阿都拉曼的村子。"
  2. 1819-02-01 · 海峡（104.1, 1.0, 8.4，高亮 `hussein-brought-from-riau`）。EN "Early February 1819: Hussein, elder son of the late Sultan Mahmud, is brought from the Riau islands; the British will recognise him as Sultan of Johor." ZH "1819 年 2 月初：已故苏丹马哈茂德的长子胡先从廖内群岛被接来，英国人准备承认他为柔佛苏丹。"
  3. 1819-02-06 · 河口（103.85, 1.29, 13.2，高亮 `treaty-1819`）。EN "6 February 1819: Raffles, Sultan Hussein and the Temenggong sign a treaty allowing the Company to build a trading post here, in return for yearly payments." ZH "1819 年 2 月 6 日：莱佛士与苏丹胡先、天猛公签约，公司可以在这里设商站，每年向两人付钱。"
  4. 1819-03 · 马来亚（103.0, 2.0, 5.6，高亮 `dutch-protest-1819`）。EN "1819: the Dutch in Malacca and Batavia protest that Singapore belongs to the Sultan they recognise in Riau; in Singapore, Farquhar is left in charge with a few hundred troops." ZH "1819 年：马六甲和巴达维亚的荷兰人抗议，说新加坡属于他们在廖内承认的那位苏丹；新加坡这边，法夸尔带着几百名士兵留下主持。"
- 事件：`raffles-arrives` · 1819-01-28 · [103.853, 1.287] · political｜`preliminary-agreement-1819` · 1819-01-30 · 同上 · political｜`hussein-brought-from-riau` · 1819-02-01（**待核**）· [104.42, 0.94] · political｜`treaty-1819` · 1819-02-06 · [103.853, 1.289] · political｜`dutch-protest-1819` · 1819 · [102.25, 2.19] · political｜`farquhar-resident` · 1819-02-07 · [103.85, 1.29] · political｜`site-temenggong-village` · 1819 · [103.852, 1.288] · site。
- 路线：`eic-to-singapore-1819` · 1819-01-19 → 1819-01-28 · 槟城—马六甲海峡—卡里摩岛—新加坡河口（sea；**途经待核**：Buckley）｜`hussein-riau-1819` · 1819-01-31 → 1819-02-01 · 廖内—新加坡海峡—河口。
- 领土名称（K1）：同背景章。

#### 02 town-plan · 城区规划与条约（1822–1824）

- 正文：1822 年 10 月莱佛士第三次到新加坡，成立城区委员会，测量官杰克逊画出城区规划（Jackson Plan）：政府山与欧洲人市区在河北岸，华人甘榜在河南岸，朱利亚（印度穆斯林）甘榜、武吉士甘榜、阿拉伯甘榜和苏丹的甘榜格南各占一块；河南岸的沼泽用削平小山（今莱佛士坊）的土填起来（**海岸 L1**）；1823 年天猛公迁到直落布兰雅；1823 年 6 月协议、1824 年 3 月《英荷条约》、8 月克劳福德条约（F5）。**这是按族群划地的规划**；它让同乡聚居，也方便殖民政府管理，实际住法很快就混了。
- 细看：①**怎么读 Jackson Plan**（原图、配准、哪些街道今天还在；**写明规划和实际的差别**）；②**按族群划地**：谁定的、为什么、谁不在图上（海人、劳工）；③**一纸条约分开的马来世界**：1824 年《英荷条约》为什么今天还是马来西亚与印尼的分界的来历之一；④街名：Hill Street、Bencoolen Street、Crawfurd Street、Coleman Street 是怎么来的。
- 节拍（4）：
  1. 1822-11-04 · 城区（103.852, 1.291, 13.8，高亮 `town-committee-1822`）。EN "November 1822: Raffles sets up a Town Committee; Lieutenant Jackson's plan divides the land around the river among the government, Europeans and each Asian community." ZH "1822 年 11 月：莱佛士成立城区委员会；杰克逊中尉的规划把河两岸的土地分给政府、欧洲人和各个亚洲族群。"
  2. 1823-01 · 河南岸（103.849, 1.286, 14.0，高亮 `boat-quay-fill`）。EN "1822 to 1823: a small hill is cut down and its earth fills the swamp on the south bank; the shoreline you see here is the one after that first land reclamation." ZH "1822 年到 1823 年：一座小山被削平，土拿去填河南岸的沼泽；这里看到的海岸，已经是第一次填土之后的样子。"
  3. 1823-06-09 · 岛（103.82, 1.28, 11.6，高亮 `convention-1823`、`site-telok-blangah`）。EN "June 1823: the Sultan and the Temenggong give up most of their rights in the settlement for monthly allowances, and the Temenggong moves to Telok Blangah." ZH "1823 年 6 月：苏丹和天猛公放弃在商站里的大部分权利，改领月俸；天猛公迁到直落布兰雅。"
  4. 1824-08-02 · 海峡（103.4, 1.6, 6.6，高亮 `anglo-dutch-treaty`、`crawfurd-treaty`）。EN "1824: in London, Britain and the Netherlands divide the Malay world along the Straits; in August the Sultan and the Temenggong cede Singapore island to the Company for good." ZH "1824 年：英国和荷兰在伦敦以海峡为界瓜分马来世界；8 月，苏丹和天猛公把新加坡岛永久割让给东印度公司。"
- 事件：`town-committee-1822` · 1822-11-04（**日期待核**）· [103.851, 1.292] · political｜`boat-quay-fill` · 1822 – 1823 · [103.849, 1.286] · political｜`convention-1823` · 1823-06-07 · [103.851, 1.292] · political｜`site-telok-blangah` · 1823 · [103.82, 1.27] · site｜`site-kampong-glam-istana` · 1819 · [103.859, 1.302] · site｜`singapore-institution` · 1823-06-05（**待核**）· [103.85, 1.297] · political｜`anglo-dutch-treaty` · 1824-03-17 · [103.4, 1.6]（锚点放在海峡上，detail 写签于伦敦）· political｜`crawfurd-treaty` · 1824-08-02 · [103.851, 1.292] · political｜`census-1824` · 1824-01 · [103.85, 1.29] · political。
- 领土名称（K2）：JOHOR（岛上规划区以外）· 各规划分区（label 写"1822 年规划"）· PENANG · MALACCA（Dutch）。

#### 03 free-port · 海峡里的自由港（1826–1869）

- 正文：海峡殖民地（F6）；自由港：不收进出口税，靠鸦片、酒、赌博饷码收钱（F10）；中国帆船随东北季风南来、西南季风北返，武吉士商船每年秋天从望加锡来，印度"港脚商人"把鸦片和棉布运来、把锡、胡椒、海产运往中国；1840 年代鸦片战争、1841 年香港开埠，新加坡转口贸易的对手和伙伴；1864 年丹戎巴葛船坞；1867 年改直辖殖民地；1869 年苏伊士运河通航，蒸汽船让航程从三四个月缩到一个多月（**待核**）。
- 细看：①**季风时刻表**：什么时候哪里的船来（**配图 `ocean-junk`**）；②**谁出钱养殖民地**：饷码制度和饷码商（Trocki）；③**甘蜜与胡椒**：种植园、森林被砍光、老虎伤人的记载（**数字待核**）；④香港开埠以后。
- 节拍（4）：
  1. 1826-11-27 · 马来亚（101.5, 3.5, 5.4，高亮 `straits-settlements-1826`）。EN "1826: Penang, Malacca and Singapore become one colony, the Straits Settlements, run by the East India Company from Calcutta." ZH "1826 年：槟城、马六甲和新加坡合成一个殖民地，叫海峡殖民地，由东印度公司从加尔各答管理。"
  2. 1830 · 区域（110.0, 10.0, 3.4，`junk-amoy`、`bugis-prahu`、`country-trade-opium` 三条路线）。EN "Around 1830: junks come south from Amoy and Canton on the north-east monsoon, Bugis traders sail in from Makassar, and country ships bring opium and cloth from India." ZH "1830 年前后：中国帆船趁东北季风从厦门、广州南下，武吉士商人从望加锡驶来，港脚商船从印度运来鸦片和棉布。"
  3. 1864 · 岛（103.84, 1.27, 12.0，高亮 `tanjong-pagar-dock`）。EN "1864: the Tanjong Pagar Dock Company opens wharves in deep water west of the town, ready for steamships." ZH "1864 年：丹戎巴葛船坞公司在城区以西的深水处建码头，准备迎接蒸汽船。"
  4. 1869-11-17 · 区域（70.0, 18.0, 2.6，`suez-route-1869`）。EN "1867: the Straits Settlements become a Crown Colony; in 1869 the Suez Canal opens and steamships reach Singapore from Europe in weeks, not months." ZH "1867 年：海峡殖民地改由英国政府直接管理；1869 年苏伊士运河通航，蒸汽船从欧洲到新加坡只要几个星期。"
- 事件：`straits-settlements-1826` · 1826-11-27（**日期待核**）· [100.34, 5.42] · political｜`capital-to-singapore` · 1832 · [103.851, 1.292] · political｜`malacca-handover` · 1825-04-09（**待核**）· [102.25, 2.19] · political｜`naning-war` · 1831 – 1832 · [102.3, 2.4] · battle · `straits-settlements` vs `naning`（不建实体时改 political）｜`hong-kong-1841` · 1841-01-26 · [114.16, 22.28] · political｜`tanjong-pagar-dock` · 1864 · [103.84, 1.265] · political｜`crown-colony-1867` · 1867-04-01 · [103.851, 1.292] · political｜`suez-1869` · 1869-11-17 · [32.35, 30.6] · political。
- 路线（sea，途经点按 Horsburgh《印度航行指南》（公有领域）的航路取，§6 P42）：`junk-amoy`（厦门—南澳—海南东—越南中部外海—昆仑岛—新加坡）· `junk-canton` · `bugis-prahu`（望加锡—爪哇海—邦加海峡—廖内—新加坡）· `country-trade-opium`（加尔各答—安达曼海—槟城—马六甲海峡—新加坡—南中国海—广州）· `suez-route-1869`（伦敦—直布罗陀—塞得港—亚丁—加勒（锡兰）—槟城—新加坡）· `cape-route`（1869 年以前，经好望角）。`strength` 不写（没有逐船人数）。
- 领土名称（K3）：STRAITS SETTLEMENTS（East India Company）；K4 起"（Crown Colony）"。

#### 04 arrivals · 谁来了，为什么来

- 正文（每个群体一段的骨架，Codex 按人数分配篇幅）：**华人**（福建、潮州、广府、客家、海南；华南人口压力、战乱、天灾；客头与赊单，F9；苦力馆里的欺骗）；**印度人**（泰米尔、朱利亚商人、锡克、孟加拉；罪犯劳工 F8，1873 年以后的契约劳工与工头（kangany）制度；商人与放贷人（齐智人））；**马来群岛的人**（武吉士、爪哇人、波阳人（巴韦安岛）、米南加保；朝圣中转）；**阿拉伯人**（哈德拉毛的商人家族：阿尔沙哥夫、阿裕尼，土地与清真寺）；**欧洲人、亚美尼亚人、犹太人、欧亚裔**；1877 年华民护卫司（F9）。**移民大多是男人**，女性移民少、处境更难（妹仔、被拐卖的妇女，Warren 1993）。
- 细看：①**一张船票的代价**：赊单怎么还、为什么很多人还不清；②**罪犯修的城**：哪些建筑是印度罪犯盖的；③**哈德拉毛到新加坡**：阿拉伯家族与街名；④1871 年和 1931 年的人口普查：数字会说什么、不会说什么（F7）。
- 节拍（5）：
  1. 1821-02 · 区域（112.0, 12.0, 3.6，`junk-amoy`，高亮 `first-amoy-junk`）。EN "February 1821: the first junk from Amoy arrives in Singapore; over the next century millions of people from southern China will pass through this port." ZH "1821 年 2 月：第一艘从厦门来的帆船到达新加坡；此后一百年里，数以百万计的华南人经过这个港口。"
  2. 1825 · 区域（90.0, 8.0, 3.6，`convicts-bencoolen`、`convicts-madras`）。EN "From 1825: convicts from India and from Bencoolen are shipped to Singapore; they build roads, bridges and public buildings." ZH "1825 年起：印度和明古连的罪犯被运到新加坡，修路、架桥、盖公共建筑。"
  3. 1850 · 区域（75.0, 8.0, 3.0，`hadhrami-route`、`chulia-route`）。EN "Mid-nineteenth century: Tamil and Chulia traders sail from the Coromandel coast, and Arab merchant families from Hadhramaut in southern Arabia settle in Singapore." ZH "19 世纪中叶：泰米尔和朱利亚商人从科罗曼德尔海岸驶来，南阿拉伯哈德拉毛的商人家族在新加坡定居。"
  4. 1860 · 群岛（110.0, -3.0, 4.6，`bugis-prahu`、`bawean-route`）。EN "From across the archipelago come Bugis from Sulawesi, Javanese and Boyanese from Bawean island, many staying for good." ZH "从群岛各处来的有苏拉威西的武吉士人、爪哇人和巴韦安岛的波阳人，许多人留了下来。"
  5. 1877-05-01 · 岛（103.85, 1.29, 12.4，高亮 `chinese-protectorate`）。EN "1877: after years of complaints about kidnapping and cheating in the labour trade, the government opens a Chinese Protectorate under William Pickering." ZH "1877 年：劳工贸易中的拐骗和欺诈投诉多年之后，政府设立华民护卫司，由毕麒麟主持。"
- 事件：`first-amoy-junk` · 1821-02（**待核**）· [103.853, 1.287] · political｜`convicts-arrive` · 1825 · [103.85, 1.295] · political｜`convict-transport-ends` · 1873 · 同上 · political｜`chinese-protectorate` · 1877-05-01（**日期待核**）· [103.845, 1.285] · political｜`indian-immigration-ordinance` · 1876 / 1884（**待核**）· political｜`census-1871` · 1871-04-03（**待核**）· political。
- 路线：`junk-amoy`、`junk-canton`、`junk-swatow`、`junk-hainan`、`steamer-amoy-1900`（汕头 / 厦门—香港—新加坡，1900 年以后的苦力轮船）、`convicts-bencoolen`、`convicts-madras`、`chulia-route`（纳加帕蒂南 / 讷戈尔—槟城—新加坡）、`hadhrami-route`（木卡拉—亚丁—卡利卡特—亚齐—槟城—新加坡）、`bugis-prahu`、`bawean-route`。`linger` 让每条到章末仍可见。
- 领土名称（K4）：STRAITS SETTLEMENTS（Crown Colony）。

#### 05 town-life · 城里的日子：艰难与建设

- 正文：住处：河南岸的华人街区按方言群分，牛车水；甘榜格南、甘榜武吉士、实龙岗的印度人聚居区；店屋与"五脚基"（**配图 `shophouse-cutaway`**）；困难：疟疾与霍乱、拥挤、私会党、1854 年械斗（F11）、鸦片；**各群体出钱出力建的东西**：天福宫（1839–42）、马里安曼兴都庙（1827）、詹美回教堂（1826）、苏丹回教堂（1824–26，1928–32 重建）、亚美尼亚教堂（1835）、圣安德烈座堂（1856–61，罪犯劳工）、陈笃生医院（1844）、莱佛士书院（1823）、各会馆和义学（**配图 `places-of-worship`**）；以人名命名的街道（陈金声、余东旋、阿裕尼、阿尔沙哥夫……）；1880 年代直落亚逸填海（**海岸 L2**）。
- 细看：①**街名里的人**：一张表，街名、人名、他是谁、做了什么（**每条待核**，NLB Infopedia 与 Roots.sg）；②**会馆与私会党**：同乡互助和暴力是同一套组织的两面；③**1854 年**：发生了什么、多少人死、为什么今天还要记住（死者没有名字，只知道是普通人）；④亚逸街原是海边：一条街怎么从海岸变成内陆。
- 节拍（4）：
  1. 1827 · 城区（103.845, 1.283, 14.0，开 `sites`，高亮 `site-sri-mariamman`、`site-masjid-jamae`）。EN "1827: on South Bridge Road, a Hindu temple and a Chulia mosque stand a short walk apart." ZH "1827 年：桥南路上，一座兴都庙和一座朱利亚人的清真寺相隔没几步。"
  2. 1842 · 城区（103.847, 1.281, 14.0，高亮 `site-thian-hock-keng`、`site-tan-tock-seng-1844`）。EN "1839 to 1844: Hokkien merchants build the Thian Hock Keng temple on Telok Ayer Street, then on the shore, and Tan Tock Seng pays for a hospital for the poor." ZH "1839 年到 1844 年：福建商人在当时还在海边的直落亚逸街建起天福宫，陈笃生出钱建了一所给穷人看病的医院。"
  3. 1854-05-05 · 岛（103.85, 1.31, 11.4，高亮 `riots-1854`）。EN "May 1854: fighting between Hokkien and Teochew groups spreads from the town to the plantations and lasts about ten days; hundreds are killed." ZH "1854 年 5 月：福建帮与潮州帮的冲突从城里蔓延到种植园，持续约十天，几百人被杀。"
  4. 1887-12-31 · 城区（103.848, 1.279, 13.6，高亮 `telok-ayer-reclamation`）。EN "1879 to 1887: the bay in front of Telok Ayer Street is filled in; Robinson Road now runs where boats once anchored." ZH "1879 年到 1887 年：直落亚逸街前面的海湾被填平，罗敏申路就修在当年停船的地方。"
- 事件（site 写设立年，`t` 不进时间轴）：`site-sri-mariamman`（1827）、`site-masjid-jamae`（1826）、`site-sultan-mosque`（1824）、`site-thian-hock-keng`（1839）、`site-armenian-church`（1835）、`site-st-andrews`（1856）、`site-tan-tock-seng-1844`（1844，原址 **待核**）、`site-raffles-institution`（1823）、`site-chinatown`、`site-kampong-glam`、`site-serangoon-road`；`riots-1854` · 1854-05-05（until 1854-05-16，**待核**）· [103.85, 1.30] · massacre｜`telok-ayer-reclamation` · 1879（until 1887）· [103.848, 1.279] · political｜`post-office-riots-1876` · 1876-12（**待核**）· political。
- 领土名称：K4。

#### 06 british-malaya · 直辖殖民地与英属马来亚（1874–1941）

- 正文：1874 年《邦咯条约》：英国在霹雳派驻扎官，之后雪兰莪、森美兰、彭亨；1896 年组成马来联邦（FMS）；1909 年《英暹条约》：吉打、玻璃市、吉兰丹、登嘉楼由暹罗转到英国保护；柔佛 1885 年与英国订约，1914 年接受总顾问；这些州仍有自己的苏丹，所以叫"保护"而不是"殖民地"（马来统治者的视角、英国的视角）；锡和橡胶让新加坡成为加工与出口港（**配图 `rubber-and-tin`**）；1915 年兵变（F12）；1923–24 年长堤；1927 年牛车水事件（**待核**）；1930 年代大萧条，政府遣返失业华工、1933 年起限制男性移民（**待核**）；1931 年普查；1938 年海军基地（复用 ww2 `singapore-naval-base`）；水：1927 年与柔佛订第一份供水协议（链到 `<TopicLink slug="four-taps">`）。
- 细看：①**"英属马来亚"不是一个国家**：海峡殖民地、马来联邦、马来属邦各是什么（名词表）；②**1915 年**：兵变、镇压、公开处决，以及新加坡各族志愿军（**两边写**）；③橡胶园里的人：工头制度下的泰米尔劳工；④大萧条：为什么这十年移民变少了、女性移民变多了（萨姆水女，**待核**）。
- 节拍（5）：
  1. 1874-01-20 · 马来亚（101.0, 4.4, 6.2，高亮 `pangkor-1874`）。EN "January 1874: at Pangkor, a disputed succession in Perak ends with a treaty that places a British Resident beside the Sultan." ZH "1874 年 1 月：在邦咯，霹雳的王位之争以一份条约收场，英国驻扎官从此留在苏丹身边。"
  2. 1896-07-01 · 马来亚（102.0, 4.0, 6.0，高亮 `fms-1896`）。EN "1 July 1896: Perak, Selangor, Negeri Sembilan and Pahang are joined as the Federated Malay States, each keeping its Sultan." ZH "1896 年 7 月 1 日：霹雳、雪兰莪、森美兰和彭亨组成马来联邦，各州仍保留自己的苏丹。"
  3. 1909-07-09 · 马来亚（101.8, 5.0, 5.8，高亮 `anglo-siamese-treaty`）。EN "1909: Siam transfers Kedah, Perlis, Kelantan and Terengganu to British protection; with Johor they become the Unfederated Malay States." ZH "1909 年：暹罗把吉打、玻璃市、吉兰丹和登嘉楼转给英国保护；它们和柔佛被称为马来属邦。"
  4. 1915-02-15 · 岛（103.82, 1.31, 11.0，高亮 `mutiny-1915`、`mutiny-executions-1915`）。EN "15 February 1915: part of the 5th Light Infantry, an Indian regiment, mutinies; British, Asian and volunteer forces crush it within days, and dozens of mutineers are executed in public." ZH "1915 年 2 月 15 日：印度第 5 轻步兵团部分官兵兵变；英军、各族志愿军几天内把它镇压，几十名兵变者被公开枪决。"
  5. 1924-06-28 · 岛北（103.77, 1.44, 11.2，`causeway-rail`，高亮 `causeway-1924`）。EN "28 June 1924: the Causeway opens across the Johor Strait, carrying a railway and a road to the peninsula." ZH "1924 年 6 月 28 日：长堤横跨柔佛海峡通车，铁路和公路从此连到半岛。"
- 事件：`pangkor-1874` · 1874-01-20 · [100.56, 4.22] · political｜`perak-war` · 1875-11 – 1876（**待核**；马来一方：毕治被杀与英军镇压）· battle｜`fms-1896` · 1896-07-01 · [101.69, 3.15] · political｜`johor-treaty-1885` · 1885-12-11（**待核**）· [103.76, 1.46] · political｜`labuan-to-ss` · 1907 · [115.24, 5.28] · political｜`anglo-siamese-treaty` · 1909-07-09 · [100.5, 13.75] · political｜`mutiny-1915` · 1915-02-15（until 1915-02-22）· [103.80, 1.30]（亚历山大兵营，**坐标待核**）· atrocity｜`mutiny-executions-1915` · 1915-03-25（**待核**）· [103.837, 1.282]（欧南路监狱）· atrocity｜`causeway-1924` · 1924-06-28 · [103.77, 1.452] · political｜`kreta-ayer-1927` · 1927-03-12（**待核**）· massacre｜`census-1931` · 1931-04 · political｜`dindings-to-perak` · 1935-02-16（**待核**）· [100.63, 4.23] · political｜`singapore-naval-base`（复制 ww2）。
- 路线：`causeway-rail` · 1923-09 → 1924-06-28 · `persist: true`（land；途经点取 1941 年陆军部图上的铁路线配准读数，不取 OSM）。
- 领土名称（K5 / K6）：STRAITS SETTLEMENTS · FEDERATED MALAY STATES · JOHOR · KEDAH（K5 写"under Siam"，K6 写"British protection"）· PERLIS · KELANTAN · TERENGGANU · SIAM · SARAWAK（Brooke）· NORTH BORNEO（Company）· BRUNEI。

#### 07 war-and-occupation · 战争与日据（1941–1945）

- 正文（与 ww2 逐字核对数字）：沦陷前：海军基地、"新加坡堡垒"的说法、1941 年 12 月 8 日哥打巴鲁登陆与新加坡第一次空袭；新加坡之战：渡海、武吉知马、巴西班让与武吉布朗（阿南·赛迪少尉与马来军团）、星华义勇军；2 月 15 日投降；肃清（F13）；日常生活（香蕉钱、配给、木薯）；**各群体的处境**：华人首当其冲（肃清、五千万"奉纳金"），马来人与印度人被拉拢也被强征（印度国民军、泰缅铁路的亚洲劳工），欧亚裔与欧洲平民被拘禁、迁往巴哈乌；林谋盛、136 部队、马来亚人民抗日军、周美玉（**待核**）；1943 年日本把北马四州交给泰国（K9）；1944–45 年盟军空袭新加坡，平民伤亡（**数字待核**，Commons 有 USAAF 目标图作核对）；1945 年 9 月 12 日市政大厦受降。
- 细看：①**数字为什么对不上**：肃清遇难人数的三组数字（同 ww2）；②**同一场占领，不同的经历**：华人、马来人、印度人、欧亚裔各一段；③**盟军的轰炸**：港口和船坞附近的平民；④链接：`<TopicLink slug="ww2" ch="fall-of-singapore">`、`ch="syonan"`、`ch="end-and-home"`。
- 节拍（5）：
  1. 1941-12-08 · 马来亚（102.0, 4.0, 5.6，`japan-malaya`，高亮 `kota-bharu`）。EN 与 ww2 第 07 章第 1 拍同义（缩短）。ZH 同。
  2. 1942-02-15 · 岛（103.79, 1.33, 10.4，高亮 `bukit-chandu`、`surrender-ford`）。EN "February 1942: after a week of fighting on the island, including the Malay Regiment's stand at Bukit Chandu, the garrison of about 85,000 surrenders on 15 February." ZH "1942 年 2 月：岛上打了一个星期，马来军团在武吉布朗死守；2 月 15 日，约 8.5 万守军投降。"
  3. 1942-02-21 · 岛（103.88, 1.36, 10.4，开 `sites`，高亮 `sook-ching`、`site-changi-beach`、`site-punggol-beach`）。EN 用 ww2 第 08 章第 2 拍的数字与措辞。ZH 同。
  4. 1943-10-18 · 马来亚（101.5, 5.5, 5.6，高亮 `four-states-to-thailand`）。EN "October 1943: Japan hands Kedah, Perlis, Kelantan and Terengganu to its ally Thailand; in Singapore, food is rationed and the occupation money loses its value." ZH "1943 年 10 月：日本把吉打、玻璃市、吉兰丹和登嘉楼交给盟友泰国；新加坡这边，粮食配给，占领当局的钞票越来越不值钱。"
  5. 1945-09-12 · 城区（103.852, 1.291, 13.0，高亮 `singapore-ceremony`）。EN 同 ww2 第 11 章新加坡受降一拍。ZH 同。
- 事件：复制 ww2 的 `singapore-naval-base`、`kota-bharu`、`singapore-air-raid-1941`、`johor-crossing`、`bukit-timah`、`bukit-chandu`、`alexandra-hospital`、`surrender-ford`、`sook-ching`、`double-tenth`、`singapore-ceremony`、`sook-ching-trial-1947` 与 site 类（id、`t`、`at`、数字、来源文字逐字一致）；新增 `four-states-to-thailand` · 1943-10-18 · [100.37, 6.12] · political｜`allied-raids-singapore` · 1944-11-05（until 1945-03，**待核**）· [103.84, 1.265] · bombing · `sides: { attacker: uk?/usa }`（**按来源定**）｜`bahau-settlement` · 1943-12（**待核**）· [102.4, 2.82] · political｜`endau-settlement` · 1943（**待核**）· [103.62, 2.65] · political。
- 路线：复制 ww2 `japan-malaya`、`japan-malaya-east`、`japan-malaya-patani`（同 id、同 path）。
- 领土名称（K7 → K8 → K9）：K8 `japan`（label "Malaya (Japanese-occupied)" / "Syonan (Singapore, Japanese-occupied)"）；K9 北马四州 `siam`（label "Kedah (Thai-administered)"）。

#### 08 after-the-war · 重回英国统治（1945–1955）

- 正文：英国军政府（1945-09 – 1946-03）：粮荒、黑市、通胀（"黑市政府"之称）；1946 年 4 月 1 日新加坡成为单独的直辖殖民地，半岛组成马来亚联盟——马来人反对（巫统 1946 年成立），1948 年改为马来亚联合邦；新加坡留在外面的原因（华人人口比例、英国的基地与港口）；1948 年第一次立法议会选举（6 个民选议席，**待核**）；1948 年 6 月紧急状态（马共、英国、新村，三方写）；1950 年玛丽亚·赫托暴乱（F14）；1953 年林德宪制委员会，1955 年选举，马绍尔任首席部长；1955 年福利巴士工潮（F15）。
- 细看：①**1945 年不是所有人的"光复"**：各群体对英国人回来的看法；②**紧急状态**：在马来亚打的仗、在新加坡怎样感受到（逮捕、学校、工会）；③**玛丽亚·赫托**：一宗监护权官司为什么引发暴乱，死者是谁（逐类写，不渲染）；④**福利巴士**：工人、学生、警察三方，四个死者的名字（**待核**）。
- 节拍（5）：
  1. 1945-09-12 · 岛（103.85, 1.33, 10.2，高亮 `bma-1945`）。EN "September 1945: the British return and set up a military administration; food is short, prices are high and the black market thrives." ZH "1945 年 9 月：英国人回来，设立军政府；粮食短缺、物价高涨，黑市兴旺。"
  2. 1946-04-01 · 马来亚（102.6, 3.0, 6.0，高亮 `colony-of-singapore-1946`、`malayan-union`）。EN "1 April 1946: Singapore becomes a separate Crown Colony, while the peninsula's states and Penang and Malacca form the Malayan Union." ZH "1946 年 4 月 1 日：新加坡成为单独的直辖殖民地，半岛各州与槟城、马六甲组成马来亚联盟。"
  3. 1948-06-18 · 马来亚（101.8, 4.2, 6.0，高亮 `emergency-1948`）。EN "June 1948: after the killing of planters in Perak, a state of Emergency is declared against the Malayan Communist Party's armed revolt; it will last twelve years." ZH "1948 年 6 月：霹雳的种植园主被杀后，政府宣布紧急状态，对付马来亚共产党的武装起事，紧急状态持续十二年。"
  4. 1950-12-11 · 城区（103.85, 1.30, 12.6，高亮 `hertogh-riots`）。EN "11 December 1950: a court ruling on the custody of Maria Hertogh sets off three days of rioting; 18 people are killed and 173 injured." ZH "1950 年 12 月 11 日：法院对玛丽亚·赫托监护权的判决引发三天暴乱，18 人死亡、173 人受伤。"
  5. 1955-05-12 · 岛（103.88, 1.32, 12.0，高亮 `hock-lee-riots`）。EN "12 May 1955: a bus workers' strike at Hock Lee turns into a riot; four people die, among them a police officer, a student and a journalist." ZH "1955 年 5 月 12 日：福利巴士公司工人罢工演变成骚乱，四人死亡，其中有一名警察、一名学生和一名记者。"
- 事件：`bma-1945` · 1945-09-12 · [103.852, 1.291] · political｜`colony-of-singapore-1946` · 1946-04-01 · 同上 · political｜`malayan-union` · 1946-04-01 · [101.69, 3.15] · political｜`umno-founded` · 1946-05-11 · [103.76, 1.46] · political｜`federation-1948` · 1948-02-01 · [101.69, 3.15] · political｜`election-1948` · 1948-03-20（**待核**）· political｜`emergency-1948` · 1948-06-18 · [101.0, 4.6] · political｜`hertogh-riots` · 1950-12-11（until 12-13）· [103.856, 1.302]（苏丹回教堂附近，**待核**）· massacre｜`election-1955` · 1955-04-02 · political｜`hock-lee-riots` · 1955-05-12 · [103.88, 1.322]（亚历山大路车厂，**待核**）· massacre。
- 领土名称（K11 → K12 → K13）：K11 `bma`；K12 `singapore`（"Colony of Singapore"）、`malayan-union`；K13 `federation-of-malaya`。

#### 09 self-government · 走向自治（1955–1959）

- 正文：马绍尔与劳工阵线政府，1956 年伦敦宪制谈判破裂、马绍尔辞职，林有福接任；1956 年 10 月华校学潮（F16）与随后的逮捕；1957 年 8 月 31 日马来亚独立（东姑阿都拉曼）；1957 年新加坡公民权法令（**待核**）；1958 年《新加坡州宪法》；1959 年 5 月 30 日大选（F17）、6 月 3 日自治、6 月 5 日第一届内阁；12 月尤索夫·伊萨就任元首，州旗、州徽、州歌《前进吧，新加坡》（1959 年 12 月 3 日首次正式使用，**待核**）。
- 细看：①**谁能投票**：1955 年自动登记、1957 年公民权，选民从几万变成几十万（**数字待核**）；②**1956 年的学生**：华校生、工会、政府各自的说法；③**第一届内阁**：九个人是谁（表，**待核**）；④马来亚独立对新加坡意味着什么。
- 节拍（4）：
  1. 1956-10-24 · 岛（103.84, 1.32, 11.6，高亮 `school-riots-1956`）。EN "October 1956: the government closes two Chinese school unions and students occupy their schools; when police clear them, rioting spreads and 13 people are killed." ZH "1956 年 10 月：政府查封两个华校学生组织，学生留守学校；警察清场后骚乱扩大，13 人死亡。"
  2. 1957-08-31 · 马来亚（102.2, 3.8, 6.0，高亮 `merdeka-1957`）。EN "31 August 1957: the Federation of Malaya becomes independent, with Tunku Abdul Rahman as Prime Minister; Singapore remains a British colony." ZH "1957 年 8 月 31 日：马来亚联合邦独立，东姑阿都拉曼任首相；新加坡仍是英国殖民地。"
  3. 1959-05-30 · 岛（103.82, 1.36, 10.2，高亮 `election-1959`）。EN "30 May 1959: in the first fully elected Legislative Assembly, the People's Action Party wins 43 of the 51 seats." ZH "1959 年 5 月 30 日：第一次全部议席民选的立法议院选举，人民行动党在 51 席中赢得 43 席。"
  4. 1959-06-05 · 城区（103.851, 1.291, 13.4，高亮 `first-cabinet-1959`）。EN "3 June 1959: Singapore becomes a self-governing state; on 5 June Lee Kuan Yew and his eight ministers are sworn in at City Hall." ZH "1959 年 6 月 3 日：新加坡成为自治邦；6 月 5 日，李光耀和八名部长在市政厅宣誓就职。"
- 事件：`marshall-resigns` · 1956-06-07（**待核**）· political｜`school-riots-1956` · 1956-10-24（until 10-29）· [103.835, 1.32]（**待核**）· massacre｜`merdeka-1957` · 1957-08-31 · [101.69, 3.15] · political｜`citizenship-1957` · 1957（**待核**）· political｜`election-1959` · 1959-05-30 · [103.85, 1.30] · political｜`self-government-1959` · 1959-06-03 · [103.851, 1.291] · political｜`first-cabinet-1959` · 1959-06-05 · 同上 · political｜`yusof-ishak-1959` · 1959-12-03 · 同上 · political。
- 领土名称（K14 → K15）：`singapore`（"State of Singapore (self-governing)"）。

#### 10 merger · 合并：马来西亚（1961–1963）

- 正文：1961 年 5 月 27 日东姑提出"马来西亚"构想；行动党分裂、社会主义阵线成立（1961 年 7–8 月）；1962 年 9 月 1 日公投（F18）；1963 年 2 月 2 日冷藏行动（F19，两种解释）；沙巴、砂拉越的意见（科博德调查委员会）、文莱 1962 年 12 月起事、不加入；印尼的"对抗"、菲律宾对沙巴的主张；1963 年 8 月 31 日李光耀宣布新加坡"独立"（**待核**）；9 月 16 日马来西亚成立（F20）；9 月 21 日新加坡州选举（**待核**）。
- 细看：①**为什么要合并**：各方的理由（行动党：经济与腹地；东姑：抵消新加坡左翼、加上婆罗洲平衡人口；英国：撤出与基地；社阵：反对这种合并）；②**公投的三个选项**：设计本身的争议；③**冷藏行动**：两种解释各一段；④**婆罗洲的人怎么看**。
- 节拍（4）：
  1. 1961-05-27 · 马来西亚（109.0, 4.0, 4.8，高亮 `tunku-proposal-1961`）。EN "27 May 1961: in Singapore, Tunku Abdul Rahman proposes bringing Malaya, Singapore, Sarawak, North Borneo and Brunei together." ZH "1961 年 5 月 27 日：东姑阿都拉曼在新加坡提议，把马来亚、新加坡、砂拉越、北婆罗洲和文莱合在一起。"
  2. 1962-09-01 · 岛（103.82, 1.36, 10.2，高亮 `referendum-1962`）。EN "1 September 1962: Singapore votes in a referendum on the terms of merger; about 71 percent choose the government's option, and about a quarter cast blank votes." ZH "1962 年 9 月 1 日：新加坡就合并条件举行公投；约 71% 选了政府的方案，约四分之一投了空白票。"
  3. 1963-02-02 · 岛（103.82, 1.36, 10.2，高亮 `coldstore-1963`）。EN "2 February 1963: in Operation Coldstore, more than a hundred opposition politicians, unionists and students are detained without trial as alleged communist supporters." ZH "1963 年 2 月 2 日："冷藏行动"中，一百多名反对党人士、工会成员和学生被指为共产党支持者，未经审判被扣押。"
  4. 1963-09-16 · 马来西亚（109.0, 4.0, 4.8，高亮 `malaysia-day-1963`）。EN "16 September 1963: Malaya, Singapore, Sabah and Sarawak form Malaysia; Brunei stays out, and Indonesia launches its Confrontation." ZH "1963 年 9 月 16 日：马来亚、新加坡、沙巴和砂拉越组成马来西亚；文莱没有加入，印尼开始"对抗"。"
- 事件：`tunku-proposal-1961` · 1961-05-27 · [103.85, 1.29] · political｜`barisan-sosialis-1961` · 1961-07-26（**待核**）· political｜`referendum-1962` · 1962-09-01 · political｜`brunei-revolt` · 1962-12-08 · [114.94, 4.89] · battle（**sides 待定**）｜`coldstore-1963` · 1963-02-02 · [103.85, 1.30] · political｜`malaysia-agreement` · 1963-07-09 · [-0.13, 51.5] · political（锚点放伦敦会被拉出视野：改成 `at` 新加坡、detail 写签于伦敦）｜`malaysia-day-1963` · 1963-09-16 · [101.69, 3.15] · political｜`konfrontasi-begins` · 1963-01-20 / 1963-04-12（**哪天算开始待核**）· [110.3, 1.5] · political。
- 领土名称（K16 → K17）：`malaysia`（Malaya 各州、Sabah、Sarawak、Singapore，label 分别写"Singapore (state of Malaysia)"等）· BRUNEI · INDONESIA（K17 起出现，NE admin-0，label "Indonesia"）。

#### 11 separation · 骚乱与分家（1964–1965）

- 正文：1964 年 4 月马来西亚大选，行动党在半岛参选；巫统与《马来前锋报》的宣传、行动党"马来西亚人的马来西亚"；7 月 21 日与 9 月的骚乱（F21）、宵禁、各族亲善委员会；1965 年 3 月 10 日麦唐纳大厦爆炸（F22）；1965 年 5 月马来西亚团结总机构；8 月 7 日签约、8 月 9 日分家（F23），李光耀的记者会；第一届内阁（独立后，**名单待核**）；12 月 22 日尤索夫·伊萨就任总统；拉惹勒南、奥斯曼·渥等人对多元种族的主张（P5 课纲）；章末一段：今天新加坡把 7 月 21 日定为种族和谐日，马来西亚和新加坡怎样各自记住 1965 年。
- 细看：①**1964 年：谁在说什么**：两次骚乱前后各方的公开说法，死伤与逮捕数（F21）；②**分家：两边的说法**：东姑（避免流血）、李光耀（"痛苦的时刻"）、英国档案（Lau 1998）；③**第一届内阁**：表（**待核**）；④**种族和谐日与亲善委员会**（P5 课纲 · 拉惹勒南、奥斯曼·渥）。
- 节拍（5）：
  1. 1964-07-21 · 城区（103.86, 1.30, 12.4，高亮 `race-riots-july-1964`）。EN "21 July 1964: during a procession for the Prophet Muhammad's birthday, clashes between Malays and Chinese break out; by early August 23 people have died and 454 are injured." ZH "1964 年 7 月 21 日：庆祝先知穆罕默德诞辰的游行中，马来人与华人发生冲突；到 8 月初，23 人死亡，454 人受伤。"
  2. 1964-09-03 · 岛（103.88, 1.33, 11.0，高亮 `race-riots-september-1964`）。EN "September 1964: a second wave of riots begins in Geylang Serai; 13 people are killed and 106 injured, and curfews return." ZH "1964 年 9 月：芽笼士乃爆发第二次骚乱，13 人死亡，106 人受伤，宵禁再度实施。"
  3. 1965-03-10 · 城区（103.845, 1.299, 13.4，高亮 `macdonald-house-1965`）。EN "10 March 1965: Indonesian saboteurs bomb MacDonald House on Orchard Road; three people are killed." ZH "1965 年 3 月 10 日：印尼破坏分子在乌节路麦唐纳大厦放炸弹，三人死亡。"
  4. 1965-08-09 · 马来西亚（107.0, 3.5, 5.0，高亮 `separation-1965`）。EN "9 August 1965: Malaysia's Parliament votes to let Singapore go, and Singapore becomes an independent country." ZH "1965 年 8 月 9 日：马来西亚国会表决让新加坡退出，新加坡成为独立国家。"
  5. 1965-12-22 · 城区（103.851, 1.291, 13.4，高亮 `first-president-1965`）。EN "22 December 1965: Yusof Ishak becomes the first President of the Republic of Singapore." ZH "1965 年 12 月 22 日：尤索夫·伊萨成为新加坡共和国第一任总统。"
- 事件：`malaysia-election-1964` · 1964-04-25 · political｜`race-riots-july-1964` · 1964-07-21（until 1964-08-07）· [103.858, 1.303]（游行路线上冲突开始处，**待核**）· massacre｜`race-riots-september-1964` · 1964-09-03（until 09-07）· [103.897, 1.317]（芽笼士乃，**待核**）· massacre｜`macdonald-house-1965` · 1965-03-10 · [103.845, 1.299] · bombing · `sides: { attacker: indonesia, defender: malaysia }`｜`independence-agreement-1965` · 1965-08-07 · [101.69, 3.15] · political｜`separation-1965` · 1965-08-09 · [103.851, 1.291] · political｜`first-cabinet-1965` · 1965-08-09（**待核**）· political｜`first-president-1965` · 1965-12-22 · 同上 · political。
- 领土名称（K18 → K19）：`singapore`（"Republic of Singapore"）· `malaysia` · BRUNEI · INDONESIA。

### 2.3 数据清单汇总

- **实体（entities.json，约 25 个，全部 `bloc: neutral`，`color: token:holder-N` 由 `colour-holders.ts --write` 分配）**：`eic` 东印度公司（槟城，K1–K2）· `johor` 柔佛（K1–K2 新加坡岛；K5–K7 柔佛州；K8 起柔佛的土地依次归 `japan`、`bma`、`malayan-union`、`federation-of-malaya`、`malaysia`）· `netherlands` 荷兰（K1–K2 马六甲）· 规划分区 6–8 个（K2：`european-town`、`chinese-kampong`、`chulia-kampong`、`bugis-kampong`、`arab-kampong`、`kampong-glam`、`government-hill`、`cantonment`，**以原图图例为准，待核**）· `straits-settlements` 海峡殖民地（K3–K7）· `fms` 马来联邦（K5–K7）· `kedah`、`perlis`、`kelantan`、`terengganu`（K5–K7；K8 归 `japan`，K9–K10 归 `siam`）· `siam` 暹罗 / 泰国（K5–K19；改名写 label）· `sarawak`、`north-borneo`、`brunei`（K5 起）· `japan` 日本（K8–K10）· `bma` 英国军政府（K11）· `malayan-union` 马来亚联盟（K12）· `federation-of-malaya` 马来亚联合邦（K13–K16）· `singapore` 新加坡（K12–K16、K19）· `malaysia` 马来西亚（K17–K19）· `indonesia` 印尼（K17–K19）。另有只用于事件 `sides` 的 `uk`、`usa`（1944–45 空袭，**按来源定**）。
- **`topic.yaml`**：`colorBy: entity`；`blocLabels.neutral = { en: "Governments and plan divisions", zh: "政权与规划分区" }`；`strings: { joined: { en: "from", zh: "始于" }, left: { en: "until", zh: "止于" }, notYet: { en: "Not yet on the map", zh: "尚未出现" } }`；`basemap: { local: land-sg-history, maxZoom: 14 }`；`note`（右上小字）：EN "Island coast by date from georeferenced historical maps · Malayan state borders from Natural Earth" / ZH "岛岸按年代取自配准的旧地图 · 马来亚州界取自 Natural Earth"。
- **事件**：约 130 个（political 约 70、site 约 25、massacre / atrocity 约 12、battle 约 8、bombing 2、surrender 1），其中复制 ww2 的约 20 个。**路线**：约 18 条（sea 约 14：贸易与移民；land 2：长堤铁路 `persist`、日军南下复制 ww2）。
- **预设（presets.json）**：`indian-ocean` 印度洋到南中国海 [88, 9] 3.1 · `straits` 马六甲海峡 [102.5, 2.5] 6.0 · `malaya` 马来亚 [102.4, 4.2] 5.6 · `malaysia-1963` 马来西亚 [109, 4] 4.8 · `island` 新加坡岛 [103.82, 1.36] 10.2 · `town` 城区 [103.852, 1.291] 13.8。不用 `world` / `theatre`，不和实体重名（所以不叫 `malaysia`、`singapore`）。
- **规格行**：`YEARS 1819–1965 · CHAPTERS 11 · KEYFRAMES 23 · COASTLINES 6 · EVENTS ~130 · SCALES region / Malaya / island`。

---

## 3. 底图、海岸与关键帧

### 3.1 数据来源调查（2026-10-17 用 Commons API 读 `LicenseShortName`、作者、尺寸、描述）

**岛与城区的历史地图**（G# 是 SOURCES.md 的地图来源号；URL 一律 `https://commons.wikimedia.org/wiki/File:<文件名>`）：

| G# | 文件 | 作者 · Commons 许可 · 像素 | 内容 | 用途 |
|---|---|---|---|---|
| G1 | `Plan of the Town of Singapore (1822) by Lieutenant Philip Jackson original.jpg` | Philip Jackson · Public domain · 1846×1127（credit：National Archives of Singapore） | Jackson Plan 原图，按族群着色的分区 | **K2 分区主源**；L0 / L1 城区海岸 |
| G2 | `Plan of the British settlement of Singapore published 1828.jpg` | John Crawfurd · PD · 1566×2035 | 克劳福德《出使暹罗与交趾支那日记》（1828）的城区图与商站图（印刷版 Jackson Plan） | K2 核对；城区街道控制点 |
| G3 | `Part of Singapore Island (British Library India Office Records, 1825, detail).jpg` | 佚名 · PD · 3395×2256，1825-06-18 | 测图，"old lines of Singapore"、新加坡河、Rocky Point（新加坡石原址） | L0 / L1 河口海岸；`site-singapore-stone` 位置 |
| G4 | `Singapore Environs 1839.jpg` | G. D. Coleman · PD · 1536×1136（NAS） | 城区及郊区图（1836 年测，1839 年刊，**待核**） | L1 城区海岸 |
| G5 | `Admiralty Chart No 2404 Strait of Singapore Sheet 3 Surveyed by J.T. Thomson Esq. Government Survr. 1846-54, Published 1855, Corrections to 1866.jpg` | UK Hydrographic Office · PD · 15357×11856 | 汤申 1846–54 年测的海峡与全岛海岸 | **L0 / L1 全岛海岸主源**（城区以外 1819–1880 年代海岸按它画） |
| G6 | `Singapore town centre 1879 plan.jpg` | 佚名 · PD · 5268×3394（NAS） | 1879 年城区 | 直落亚逸填海之前的海岸（L1 末） |
| G7 | `Plan map of the City of Singapore of British Malaya, from the Constable's Hand Atlas of India (1893).jpg` | Bartholomew · PD · 2980×2312 | 1893 年城区 | **L2 城区海岸主源** |
| G8 | `Guide map of Singapore Town from The Stranger's Guide to Singapore (1890).jpg` | 佚名 · PD · 4964×4411（British Library Mechanical Curator） | 1890 年城区 | L2 核对 |
| G9 | `Map of the island of Singapore and its dependencies - btv1b53064721c.jpg` | 英国陆军部 · PD · 11234×8203（BnF；1:64,000，"Singapour -- 1912"，刊 1916） | 全岛 | **L3 全岛海岸主源** |
| G10 | `Admiralty Chart No 1995 Singapore Road, China Sea, Published 1925.jpg` | UKHO · PD · 8363×13628（1909 年测） | 新加坡锚地、城区海岸 | L3 城区海岸核对 |
| G11 | `Map by the US Army Map Service - Singapore Island - singapore and johore - txu-pclmaps-oclc-37163037-east.jpg` | AMS / 英国陆军部 · PD · 8016×6993（1:63,360，1941 年版，1944 年 AMS 重印） | 全岛 | **L4 全岛海岸主源**；长堤铁路途经点 |
| G12 | `Map by the US Army Map Service - Singapore Pulai Forest Reserve - singapore and johore - txu-pclmaps-oclc-37163037-west.jpg` | 同上 · PD · 4406×5044 | 西部图幅 | L4 西部 |
| G13 | `Telok Ayer Singapore 1932.png` | 马来联邦测量局 1932 · PD · 593×600（1:6,336，取自 NUS libmaps 的截图） | 直落亚逸湾 | L4 城区核对（图小，只作核对） |
| G14 | `Admiralty Chart No 2014 Eastern Approaches to Selat Jurong, Published 1966.jpg` | UKHO · PD · 8545×11143（1961 年测） | 裕廊一带 | **L5 西南海岸主源** |
| G15 | `Admiralty Chart No 2587 Western Portion of Johore Strait, Published 1966.jpg` | UKHO · PD · 11171×16275 | 柔佛海峡西段 | **L5 西北海岸** |
| G16 | `Admiralty Chart No 2403 Singapore Strait, Published 1936.jpg` | UKHO · PD · 27521×16456（Commons 日期 1954：**修订年份待核**） | 新加坡海峡，南岸与东岸 | **L5 南岸、东岸**（若修订到 1950 年代）/ 否则 L4 核对 |
| G17 | `Admiralty Chart No 2586 Eastern Portion of Johore Strait (Singapore Old Strait) Uulau Ubin to Sungei Kranji ... Published 1924. Corrections to 1954.jpg` | UKHO · PD · 31214×16748 | 柔佛海峡东段 | L5 北岸、乌敏岛 |
| G18 | `Map of Singapore from The State of Singapore (BIS, 1959).jpg` | British Information Services · PD · 3176×1994 | 1959 年全岛 | L5 核对 |
| G19 | `Map of Singapore City in 1951.png` | 马来亚联合邦测量局 · PD（上传者据马来西亚 1987 年版权法，**待核**新加坡法下的状态）· 2623×3603 | 1951 年城区 | L4 / L5 城区核对 |
| G20 | `Singapore Map - 1945.jpg` | Tfitzp 拼接的 1945 年地图 · PD · 7820×6080 | **原图是哪个机构哪一版，Commons 页没写**（**待核**） | 只作核对，查清原图后再决定 |

**马来亚与区域**：

| G# | 来源 | 许可 | 用途 |
|---|---|---|---|
| G21 | Natural Earth 1:10m Admin 1（`ne_10m_admin_1_states_provinces`，ww2 已登记的同一 URL） | 公有领域 | **马来亚各州、沙巴、砂拉越、纳闽**按州组合成每帧的 holder |
| G22 | Natural Earth 1:10m Admin 0 | 公有领域 | 泰国、印尼、文莱 |
| G23 | `A Map of Malay peninsula compiled by and published for the straits branch of the royal asiatic Society, Singapore 1898 - btv1b53029747c.jpg`（BnF，15614×20593，1:506,880） | PD | **K5 州界核对**：今天的州界与 1898 年图差 > 10 km 处按它描（lines.ts） |
| G24 | `Map of the Straits Settlements of British Malaya, from the Constable's Hand Atlas of India (1893).jpg` | PD | 威省、天定的范围（K5） |
| G25 | `Penang, Province Wellesley, The Dindings.jpg`（19 世纪末，Penang Monthly） | PD | 天定（K5、K6） |
| G26 | `Federation of Malaya and the Crown Colony of Singapore - DPLA - 9a3e01bd9fb8173d4f0e50f8b4343347.jpg`（CIA，NARA） | PD | K13 核对 |
| G27 | `Federation of Malaysia, 1963.jpg`（Time 1963-04-12，Robert M. Chapin） | Commons 标 PD（**待核**：理由是未续版权？） | K17 核对，不描 |
| G28 | CShapes 2.0（ETH ICR） | CC BY-NC-SA 4.0 | **只作核对**（1886 年以后的殖民地界线），不进发布数据 |
| G29 | `1828 - Karte von der Insel Singapur.jpg`（Berghaus，CC0，3735×2726） | CC0 | 1828 年的区域图（马六甲海峡到爪哇海），K1 核对点位 |
| G30 | URA Master Plan 2019 Planning Area Boundary (No Sea)（four-taps G2，data.gov.sg `d_4765db0e87b9c86336792efe8a1f7a66`） | Singapore Open Data Licence v1.0 | 今天的岛岸（L* 的基础与"今天的海岸"虚线） |
| G31 | USGS EarthExplorer Declassified Data（CORONA，1960 年代） | 美国政府作品（公有领域，**待核**页面原文与新加坡覆盖） | L5 的全岛核对（若有 1962–66 年的清晰片子） |

**不采用（只作核对或不用）**：`British Malaya circa 1922 en.svg`（Lilauid，CC BY-SA 4.0，2024 年自绘）、`Formation of Malaysia 1963.jpg`（CC BY-SA 4.0，自绘）、`Straits Settlements circa 1922.png`（CC BY 4.0，自绘）——都是今人画的示意图，没写依据，而且 BY-SA 会带来同许可冲突；`Riau-Lingga sultanate.png`（CC0，2025 自绘、无依据）；`Map of British Settlements in the Malay Peninsula ... .jpg`（Commons 标 CC BY-SA 3.0，但原图是 1860 年代的公有领域作品，许可标注可疑，**不用**）；`Admiralty Chart No 2023 Keppel Harbor ... 1893.jpg`、`Singapore Roads Surveyed by JW Reed ... .jpg`（Commons 标 CC BY-SA，原因不明，只作核对）。UT Austin PCL 的地图页（maps.lib.utexas.edu）有 Anubis 反爬虫，用 Commons 的副本。新加坡国家档案馆（NAS）的在线原图只作核对，使用条款**待核**。

### 3.2 底图（不改引擎就有的部分）

- `topic.yaml`：`basemap: { local: land-sg-history, maxZoom: 14 }`。世界陆地 `land-50m`（区域、马来亚尺度）+ zoom ≥ 7 的东南亚 1:10m（`land-10m-sea`，框 [95, -9, 125, 22]，含马来半岛、廖内、婆罗洲北部）+ zoom ≥ 9.4 的岛尺度陆地（mask 盖住 10m 新加坡，再画本主题的岛岸）。这正是 four-taps 的配置；`land-sg`（four-taps 用的 2019 年岛岸）不动。
- 1:10m 的新加坡是今天的海岸（含部分填海）：只在 zoom < 9.4 的马来亚 / 区域镜头里出现，几公里的差别在这个缩放下不到 10 px，写进已知差距。岛与城区镜头一律 ≥ 9.6。
- 东南亚 10m 叠层在 zoom 7–9.4 之间：马来亚章节镜头取 5.0–6.6，不进这一段的上半部。

### 3.3 年代岛岸 L0–L5（管线 P1，引擎 E1）

**方法**：①每张来源图用 `lines.ts` 沿印刷的海岸线描线（via 点每 200–300 m 一个，城区图更密），在来源图覆盖范围里，把**今天的陆地（G30）中位于历史海岸线以海一侧的部分**切出来，作为"那时还不是陆地"的块；②这一时代的岛岸 = 今天的陆地 − 所有在这一时代之后才填出来的块；③历史上有、今天已不是陆地的地方（被挖掉的小岛、河口沙洲）照描，写进 SOURCES-GEO.md；④来源图没覆盖的地方用下一张更早 / 更晚的全岛图（G5 / G9 / G11），都没有就用今天的海岸并写进已知差距；⑤不许手画补丁、不许用 `bbox` 当海岸。

| L | `from` – `to` | 依据（填海事件） | 主源 | 核对 | 残差预算（最大 / RMS） |
|---|---|---|---|---|---|
| L0 | – 1823-01-01 | 开埠时的自然海岸 | G3（河口）、G1（城区）、G5（全岛） | G2、G29 | 城区 ≤ 120 m / 60 m；全岛 ≤ 300 m / 150 m |
| L1 | 1823 – 1887 | 1822–23 河南岸填土（驳船码头、商业广场） | G4、G6（城区）、G5（全岛） | G2 | 同上 |
| L2 | 1887 – 1912 | 1879–87 直落亚逸填海（**完工年份待核**） | G7（城区）、G5 / G9 | G8 | 城区 ≤ 100 m；全岛 ≤ 200 m |
| L3 | 1912 – 1937 | 丹戎巴葛、吉宝港区码头与填地（**待核**） | G9（全岛）、G10（城区） | G13 | ≤ 80 m / 40 m |
| L4 | 1937 – 1961 | 1930 年代直落亚逸湾填平、加冷机场填地（1937 年启用，**待核**） | G11、G12 | G13、G19、G20 | ≤ 60 m / 30 m |
| L5 | 1961 – | 裕廊工业区等 1960 年代初的填海 | G14、G15、G16、G17 | G18、G31 | ≤ 60 m / 30 m |

- **配准**：控制点 ≥ 12（全岛图 ≥ 16），取今天还在的地物：城区用 1822 年起就在的街道交点（桥北路 / 禧街、桥南路 / 克罗士街……，**逐个待核**）、河道转弯、福康宁山顶的三角点；全岛图用河口、海角、山顶三角点（武吉知马）。坐标取 OSM / OneMap 读数只用于控制点（不发布几何），在 SOURCES-GEO.md 列表。模型：城区图仿射；全岛老图（G5、G9）`auto`（留一法 RMS 最小的投影 + 仿射 / 二次多项式）。超预算先查错点（留一法残差最大的），不靠删点凑数。
- **产物**：`public/geo/land-sg-history.json`（TopoJSON，对象 `land-sg-history`；`kind: mask` 同 land-sg；`kind: land` × 6，每个是**一整块完整的岛岸**并带 `from` / `to`，共用的海岸弧在拓扑里只存一次；可选 `kind: coast-today`（G30 的海岸线，E2））。预算 ≤ 200 KB（land-sg 单份 84 KB，六个时代大部分海岸共用）。另写 `scripts/geo/singapore-1819-1965/work/coast-L#.geojson` 供 compose 裁剪。
- 每段在 SOURCES-GEO.md 写：来源图、控制点表、模型、RMS / 最大残差、描线落在海岸色上的比例、相对今天海岸的面积差（km²）、已知差距；并排图 `docs/screenshots/singapore-1819-1965/coast-L#.png`。

### 3.4 关键帧（23 个：15 个变化帧、6 个保持帧、4 个换岸帧）

**保持帧**（K4、K7、K10、K14、K16、K18）= 和前一帧同样的几何与标签，日期放在突变的前一天：控制区只在区间最后 30% 淡化，没有保持帧时 1909 → 1942 的淡化会从 1932 年就开始，地图在 1930 年代就显出"日本占领"。

| K | t | 版图（供校对） | 方法与来源 |
|---|---|---|---|
| K1 | 1819-02-06 | 槟城与威省 `eic`；马六甲 `netherlands`；新加坡岛 `johor`（label "Singapore (Johor)"） | NE admin-1 Pulau Pinang、Melaka（`certainty: approximate`：1819 年的威省、荷属马六甲比今天的州小，§3.6）；新加坡岛 = 岛岸 L0 |
| K2 | 1823-06-09 | K1 + 新加坡岛上的规划分区（Jackson Plan 图例各项）；其余岛面仍 `johor` | G1 配准，`georef-raster.ts` 按颜色类别描（原图着色；若颜色不可分，用 `lines.ts` 沿分区界线描），裁到 L1 岛岸；G2 核对 |
| K3 | 1826-11-27 | 槟城与威省、马六甲、新加坡岛 = `straits-settlements`（label "(East India Company)"） | NE admin-1 + L1 |
| K4 | 1874-01-19 | = K3，label "(Crown Colony)"（保持帧） | 同上 |
| K5 | 1896-07-01 | 海峡殖民地（+ 天定）；马来联邦（霹雳、雪兰莪、森美兰、彭亨）；柔佛；吉打、玻璃市、吉兰丹、登嘉楼（label "under Siam"）；暹罗；砂拉越、北婆罗洲、文莱 | NE admin-1 / admin-0 按州组合；G23（1898）核对，差 > 10 km 处用 `lines.ts` 描 G23 的州界并 `clip` 到 NE；天定按 G24、G25；砂拉越不含林梦、老越（1890、1905 年才归砂拉越，**待核**），按 G23 切；暹罗 `approximate`（东部与法属印度支那的边界 1904/07 年才定） |
| K6 | 1909-07-09 | 北四州改 label "British protection"；纳闽并入海峡殖民地（1907） | K5 + NE admin-1 Labuan |
| K7 | 1941-12-07 | 保持帧（= K6b；天定 1935 年已归霹雳） | 复制 K6b |
| K8 | 1942-02-15 | 马来亚、新加坡、婆罗洲北部 = `japan`（label 分别写，新加坡写"Syonan"）；泰国（label "Thailand (allied with Japan)"） | K7 几何整块改归属 |
| K9 | 1943-10-18 | 北四州 → `siam`（label "Kedah (Thai-administered)" 等） | 同上 |
| K10 | 1945-09-04 | 保持帧 | |
| K11 | 1945-09-12 | 马来亚、新加坡 = `bma`；北四州归还；北婆罗洲、砂拉越 `bma`（**待核**：婆罗洲由澳军 / 英国军政府管理） | |
| K12 | 1946-04-01 | 新加坡 `singapore`（Colony）；马来亚联盟（9 州 + 槟城、马六甲）；砂拉越、北婆罗洲（label "Crown Colony"，1946-07 才成立，**label 写明**）；文莱 | |
| K13 | 1948-02-01 | `federation-of-malaya` | 同 K12 几何 |
| K14 | 1959-06-02 | 保持帧 | |
| K15 | 1959-06-03 | 新加坡 label "State of Singapore (self-governing)" | |
| K16 | 1963-09-15 | 保持帧 | |
| K17 | 1963-09-16 | `malaysia`（联合邦 11 州 + 新加坡 + 沙巴 + 砂拉越）；文莱；`indonesia`（NE admin-0，1963 年 5 月起含西新几内亚）；泰国 | |
| K18 | 1965-08-08 | 保持帧 | |
| K19 | 1965-08-09 | 新加坡 → `singapore`（"Republic of Singapore"） | |

**换岸帧**（K4a 1887-01-01、K6a 1912-01-01、K6b 1937-01-01、K15a 1961-01-01）= 前一帧的 holder 与标签，只把新加坡岛要素改裁到新开始的岸段（L2、L3、L4、L5）；K6b 同时去掉天定（1935 年归还霹雳，淡化在 1929–1937 之间完成，帧说明写明）。没有换岸帧时，新填出的陆地要等到下一个变化帧才着色（1887–1896、1912–1941、1961–1963 会露出不着色的新填地）；把控制区提前裁到下一段岸线则会在海上填色，两者都不对。

- 新加坡岛的要素在每一帧都**裁到那一帧日期所在时代的岛岸**（K1 → L0；K2–K4 → L1；K4a–K6 → L2；K6a → L3；K6b–K15 → L4；K15a–K19 → L5），用 compose 的 `intersect` + `geojson` 选择器读 `work/coast-L#.geojson`。马来亚、婆罗洲的要素裁到 1:10m 海岸（`coast.land` = `land-10m-sea`，`detailBox` 排除新加坡框——管线 P2）。
- **管线参数**：`pipeline.focus` 两个框：新加坡 [103.55, 1.15, 104.1, 1.48]（细到 5–10 m）和马来亚—婆罗洲 [99, 0, 120, 8]（1 km）；如果 `simplify.ts` 只支持全局一个细间隔，就加 P3（分框容差）；`budgetMB` 1.0；`simplify.ts` 必须打印 `rings: N, zero-area 0, self-crossing 0`，slug 加进 `tests/geo-rings.test.ts`。
- **首末先做**：K2（G1 配准、分区描摹、L1 岛岸，依赖链最长）和 K19（NE 组合 + L5），并排图通过后再铺开。帧 id 用 `K4a` 这类字母后缀（compose 的帧 id 是任意字符串，**待核**；不行就整体重新编号，并同步本文与章节表）。

### 3.5 许可

- 发布的地图数据（`control.json`、`land-sg-history.json`、`movements.json` 的 `path`、`events.json` 的 `at`）只来自：公有领域历史地图的配准描摹（G1–G19、G23–G26）、Natural Earth（公有领域）、URA（SODL v1.0，署名原文照 four-taps）、Wikidata（CC0）。所以可以按 `LICENSE-CONTENT` 的 CC BY-NC-SA 4.0 提供，**不需要**像 docs/27 那样单独声明 CC BY-SA，也没有 ww2 `SOURCES-GEO.md` §4 记的同许可冲突。
- CShapes（BY-NC-SA）、Commons 上 CC BY / BY-SA 的现代示意图只作核对，不描、不进 `public/` 或 `src/`。OSM 只用于读控制点坐标，不进发布几何（否则 `land-sg-history` 要按 ODbL 提供）。
- "公有领域"逐张在 Commons 页面抄原文许可模板（PD-old-70、PD-UKGov、PD-USGov-Military-Army……）进 SOURCES-GEO.md；G19、G20、G27 的状态**待核**，核不清就降为"只作核对"。

### 3.6 已知会有的简化（先写下，施工时补数）

- K1–K4 的威省、马六甲用今天的州界（威省 1800 年割让后边界有过调整，马六甲 1832 年并入南宁）：`approximate`，label 写明。
- 1874–1896 年英国在霹雳、雪兰莪、森美兰、彭亨派驻扎官，地图到 K5 才画（这段时间半岛各州不着色，正文写）。
- 1965 年以后的填海、马来亚的海岸变化不画；1:10m 新加坡在 zoom < 9.4 出现。

---

## 4. 引擎与管线缺口

| # | 缺口 | 现状（代码位置） | 最小提案 | 必要？能不能避免 |
|---|---|---|---|---|
| E1 | **岛尺度海岸按年代切换** | `stages/geo/controller.ts` `loadLocalLand` 把整个 `basemap.local` 文件塞进 `LOCAL.src`；`style.ts` `localLandLayers` 的 `fill` / `edge` 只按 `kind` 过滤 | `kind: land` 要素可带 `from` / `to`（`[from, to)`，与河流同一语义）。controller 载入后按播放头只显示一个时代：把 `lib/rivers.ts` 的区间判断抽成 `lib/dated.ts` 的 `datedAt(features, t)`（河流改用它），在可见集合变化时对 `LOCAL.fill`、`LOCAL.edge` `setFilter`（不逐帧）。`pnpm validate`：本地文件里带日期的 `land` 区间不重叠、首段可无 `from`、末段可无 `to`、中间无空档。**没有 `from / to` 的文件（land-sg）样式与行为逐字节不变** | **必要**：否则 1822 年的城区图画在滨海湾、丹戎巴葛的填海地上。**退路 Plan B**（不改引擎）：只发布 L5 一个时代的岛岸作为 `local`，阅读说明写"岛岸是 1961–66 年的海岸，更早的章节里，直落亚逸、驳船码头一带当时还是海"；分区与早期岛要素仍按各自时代裁剪，会露出"控制区比陆地小"的缝，要在 K2 并排图里说明。只在 E1 排不进时用 |
| E2 | 今天的海岸（虚线参照） | 无 | `kind: coast-today` 线：墨色 .35、`line-dasharray` [2, 2]、0.8 px，zoom ≥ 9.4 才画；图例一行"今天的海岸线 / Today's coastline"；跟 N 开关 | 建议做（读者一眼看出后来填了多少）；不做也行 |
| E3 | 链到别的主题的某一章 | `src/components/mdx/TopicLink.astro` 只有 `slug` | 加可选 `ch`：`localeHref(locale, '/topics/<slug>/') + '?ch=<id>'`；`pnpm validate` 检查章节存在 | 建议做；不做就只链到 ww2 主题首页 |
| P1 | `local-land.ts` 生成多时代岛岸 | 只有一份 `localLand`（four-taps） | 清单 `pipeline.localLand.eras: [{ id: "L0", to: "1823-01-01", minus: [<描线块 geojson>…] }, …]`、`coastToday: true`；输出同一个 TopoJSON；打印每段面积差与 `rings` 检查 | E1 的配套；Plan B 也需要（至少一段） |
| P2 | 按帧选海岸裁剪 | `coast.detailBox / detailLand` 全主题一份 | 允许 `coast.excludeBox`（这个框里不做海岸裁剪和补缝，新加坡要素已由 compose 按时代裁过），或关键帧级 `coastLand` 覆盖。**先读 `simplify.ts` 现有选项**，能用就不改 | 必要（否则补缝会把 1822 年的海涂成控制区） |
| P3 | 两个焦点框两种细度 | `pipeline.focus` 是框列表，细间隔全局一个（**待核**代码） | `focus: [{ box, fineKm }]` | 视 P2 后的体积决定 |

- 不需要：`basemap.region`（会藏掉世界、禁掉 `local`）；新的事件种类（地点用 `site`，规划分区用控制区）；`maxZoom: 14` 在 schema 范围内（6–16）。
- 文件归属：E1–E3 `src/engines/time-scene/**`、`src/components/mdx/TopicLink.astro`、`scripts/validate-content.ts`、`tests/time-scene/**`、docs/06；P1–P3 `scripts/geo/lib/**`、`tests/geo-*.test.ts`、docs/06「Geo pipeline」、geo-runbook「城市尺度主题」。**同一个 Opus 代理**，在当前引擎代理提交之后开工。
- 验收：four-taps、ww1、ww2、warring-states 的 `pnpm shoot --keys` 截图不回归（four-taps 的岛岸逐像素一致）；`sample-*` 主题之外新增一个最小 fixture（两段带日期的岛岸）进 `tests/time-scene/`；`pnpm shoot singapore-1819-1965 --beats` 在 1823 / 1887 / 1965 三拍看到三条不同的海岸；时代切换时只有一层陆地（没有两条半透明海岸叠影）。

---

## 5. 名词表（`glossary.json`，15 个）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| `orang-laut` | Orang Laut / 海人 | 住在船上和海岸边的马来群岛各族群，替柔佛苏丹巡海、划船 | `temenggong` |
| `temenggong` | Temenggong / 天猛公 | 柔佛苏丹国的高级官职，管治安与海人；1819 年在新加坡的是阿都拉曼 | `orang-laut` |
| `free-trade-port` | Free port / 自由港 | 不对进出口货物征税的港口；政府改靠鸦片、酒等专卖收入 | `revenue-farm` |
| `revenue-farm` | Revenue farm / 饷码 | 政府把鸦片、酒、赌博等专卖权按年拍卖给商人 | `free-trade-port` |
| `straits-settlements-colony` | Straits Settlements / 海峡殖民地 | 槟城、马六甲、新加坡（后加天定、纳闽）组成的英国殖民地，1826–1946 | `crown-colony` |
| `crown-colony` | Crown Colony / 直辖殖民地 | 由英国政府（殖民地部）直接管理的殖民地；1867 年起的海峡殖民地 | `straits-settlements-colony` |
| `kampong` | Kampong / 甘榜 | 马来语"村落、聚居区"；城区规划里按族群划分的居住区也叫甘榜 | — |
| `coolie` | "Coolie" / 苦力 | 19、20 世纪对经客头招募、出卖体力的亚洲劳工的称呼；今天带贬义，本主题只在引用时用 | `credit-ticket` |
| `credit-ticket` | Credit-ticket system / 赊单制 | 移民由客头垫付船费，到岸后以劳动抵债 | `coolie` |
| `kangany` | Kangany system / 工头制 | 由印度籍工头回乡招募劳工到橡胶园 | — |
| `kongsi` | Kongsi / 公司（会党） | 华人的互助组织，有的是同乡会馆，有的是秘密会党；1890 年起会党被取缔（**待核**） | — |
| `peranakan` | Peranakan / 土生华人 | 在马来世界出生、融合了本地习俗的华人后代（也有土生印度人） | — |
| `resident` | British Resident / 驻扎官 | 英国派到马来各州的官员，苏丹须"听取其意见"（宗教与马来习俗除外） | `crown-colony` |
| `self-rule` | Self-government / 自治 | 内政由民选政府负责，外交与国防仍归英国（1959–1963） | `merger-1963` |
| `merger-1963` | Merger / 合并 | 1963 年新加坡与马来亚、沙巴、砂拉越组成马来西亚 | `self-rule` |
| `konfrontasi` | Confrontation (Konfrontasi) / 对抗 | 1963–66 年印尼反对马来西亚成立的军事与政治行动 | `merger-1963` |

id 查重（spec-template：实体、事件、行军、预设、章节、名词共用一个命名空间）：实体 `straits-settlements`、章节 `free-port` / `self-government` / `merger` 已占用，所以名词写成 `straits-settlements-colony`、`free-trade-port`、`self-rule`、`merger-1963`；`kampong-glam`（实体）与 `kampong`（名词）、`crown-colony`（名词）与 `crown-colony-1867`（事件）不冲突。中文定义请 Gavin 审：`coolie`、`orang-laut`、`kongsi`、`konfrontasi`。

---

## 6. 来源（P# → 施工时的 S#；≥ 40 条）

原始文献与条约：

| P# | 来源 | 用途 |
|---|---|---|
| P1 | 汪大渊《岛夷志略》（1349）：原文维基文库 / ctext；W. W. Rockhill, "Notes on the Relations and Trade of China with the Eastern Archipelago...", *T'oung Pao* 16 (1915)（公有领域，archive.org） | F1 |
| P2 | 《马来纪年》：John Leyden (tr.), *Malay Annals* (1821，公有领域)；C. C. Brown (tr.), *Sejarah Melayu* (JMBRAS 1952 / OUP 1970) | F1 |
| P3 | Armando Cortesão (ed. & tr.), *The Suma Oriental of Tomé Pires* (Hakluyt Society, 1944) | F1 |
| P4 | Charles Burton Buckley, *An Anecdotal History of Old Times in Singapore* (1902，公有领域，archive.org)：条约原文、1854 年械斗、早年事件 | F3、F5、F11 |
| P5 | Abdullah bin Abdul Kadir, *Hikayat Abdullah* (1849)；A. H. Hill (tr.), JMBRAS 28 (1955) | 第 01、02 章 |
| P6 | Lady Sophia Raffles, *Memoir of the Life and Public Services of Sir Thomas Stamford Raffles* (1830，公有领域) | 莱佛士的信件（他的立场） |
| P7 | John Crawfurd, *Journal of an Embassy ... to the Courts of Siam and Cochin China* (1828，公有领域) | G2；1824 条约 |
| P8 | 1824 年《英荷条约》、1824 年克劳福德条约文本（Buckley 附录；英国议会文件） | F5 |
| P9 | Malaysia Agreement 1963（UNTS vol. 750，**待核**）；Independence of Singapore Agreement 1965 与 Republic of Singapore Independence Act 1965（Singapore Statutes Online，https://sso.agc.gov.sg） | F20、F23 |

研究文献：

| P# | 来源 |
|---|---|
| P10 | C. M. Turnbull, *A History of Modern Singapore, 1819–2005* (NUS Press, 2009) |
| P11 | Jean E. Abshire, *The History of Singapore* (Greenwood, 2011) |
| P12 | Mark Ravinder Frost & Yu-Mei Balasingamchow, *Singapore: A Biography* (Editions Didier Millet / NMS, 2009) |
| P13 | Kwa Chong Guan, Derek Heng, Peter Borschberg & Tan Tai Yong, *Seven Hundred Years: A History of Singapore* (NLB / Marshall Cavendish, 2019) |
| P14 | John N. Miksic, *Singapore and the Silk Road of the Sea, 1300–1800* (NUS Press, 2013) |
| P15 | 新加坡国家博物馆藏品页：福康宁金饰、新加坡石（URL 施工时查到并读过再填） |
| P16 | Nicholas Tarling, *Anglo-Dutch Rivalry in the Malay World, 1780–1824* (UQP, 1962) |
| P17 | Carl A. Trocki, *Prince of Pirates: The Temenggongs and the Development of Johor and Singapore, 1784–1885* (Singapore UP, 1979; NUS Press 2007) |
| P18 | Barbara Watson Andaya & Leonard Y. Andaya, *A History of Malaysia* (3rd ed., Palgrave, 2017) |
| P19 | Timothy P. Barnard, *Multiple Centres of Authority: Society and Environment in Siak and Eastern Sumatra, 1674–1827* (KITLV, 2003)；Leonard Y. Andaya, *The Kingdom of Johor, 1641–1728* (OUP, 1975)（海人、柔佛—廖内背景；只引读到的章节） |
| P20 | Saw Swee Hock, *The Population of Singapore* (3rd ed., ISEAS, 2012) |
| P21 | 普查报告：1871 年海峡殖民地普查；C. A. Vlieland, *British Malaya: A Report on the 1931 Census* (1932)；S. C. Chua, *State of Singapore: Report on the Census of Population 1957* (1964)（**可读副本待查**） |
| P22 | Anand A. Yang, *Empire of Convicts: Indian Penal Labor in Colonial Southeast Asia* (U California Press, 2021) |
| P23 | Anoma Pieris, *Hidden Hands and Divided Landscapes: A Penal History of Singapore's Plural Society* (U Hawai'i Press, 2009) |
| P24 | Yen Ching-hwang, *A Social History of the Chinese in Singapore and Malaya, 1800–1911* (OUP, 1986) |
| P25 | Philip A. Kuhn, *Chinese Among Others: Emigration in Modern Times* (Rowman & Littlefield, 2008) |
| P26 | James Francis Warren, *Rickshaw Coolie: A People's History of Singapore, 1880–1940* (OUP, 1986)；*Ah Ku and Karayuki-san* (OUP, 1993) |
| P27 | Carl A. Trocki, *Opium and Empire: Chinese Society in Colonial Singapore, 1800–1910* (Cornell UP, 1990) |
| P28 | 1915 年兵变：R. W. E. Harper & Harry Miller, *Singapore Mutiny* (OUP, 1984)；Sho Kuwajima 的研究（**书目待核**） |
| P29 | Rajesh Rai, *Indians in Singapore, 1819–1945* (OUP, 2014)；Ulrike Freitag, *Indian Ocean Migrants and State Formation in Hadhramaut* (Brill, 2003)；Myrna Braga-Blake (ed.), *Singapore Eurasians* (1992)；Song Ong Siang, *One Hundred Years' History of the Chinese in Singapore* (1923，公有领域) |
| P30 | NLB Infopedia（https://www.nlb.gov.sg/main/article-detail?cmsuuid=… ；1964 年骚乱条目旧址 `eresources.nlb.gov.sg/infopedia/articles/SIP_45_2005-01-06.html`）：各条目施工时逐条读原文，URL 写进 `sources.json` |
| P31 | Tom Eames Hughes, *Tangled Worlds: The Story of Maria Hertogh* (ISEAS, 1980)；《玛丽亚·赫托暴乱调查委员会报告》（1951，**待核**） |
| P32 | 福利巴士工潮：调查报告与 NAS 口述历史（**待核**） |
| P33 | 新加坡国家档案馆（https://www.nas.gov.sg/archivesonline/）：1959 年内阁、选举结果；新加坡选举局历届结果 |
| P34 | Albert Lau, *A Moment of Anguish: Singapore in Malaysia and the Politics of Disengagement* (Times Academic Press, 1998)。**Gavin 提到的"Lim & Lau"具体指哪两本待核**：Lau 1998 之外，另一位可能是 Edwin Lee（*Singapore: The Unexpected Nation*, ISEAS 2008）或 Lim 姓作者——施工时请主会话问清，问不清就只列读过的 |
| P35 | Thum Ping Tjin, "'The Fundamental Issue is Anti-colonialism, Not Merger'", ARI Working Paper 211 (2013) |
| P36 | Kumar Ramakrishna, *"Original Sin"? Revising the Revisionist Critique of the 1963 Operation Coldstore in Singapore* (ISEAS, 2015) |
| P37 | Lee Kuan Yew, *The Singapore Story* (Times, 1998)（当事人回忆录，写明是一方的说法） |
| P38 | Tan Tai Yong, *Creating "Greater Malaysia": Decolonization and the Politics of Merger* (ISEAS, 2008) |
| P39 | Mohamed Noordin Sopiee, *From Malayan Union to Singapore Separation* (Penerbit Universiti Malaya, 1974)（马来西亚一方的研究） |
| P40 | Tunku Abdul Rahman, *Looking Back* (Pustaka Antara, 1977)（当事人回忆录） |
| P41 | Matthew Jones, *Conflict and Confrontation in South East Asia, 1961–1965* (CUP, 2002) |
| P42 | James Horsburgh, *The India Directory* (多版，1809 起，公有领域)：航路途经点 |
| P43 | Kevin Blackburn & Karl Hack, *War Memory and the Making of Modern Malaysia and Singapore* (NUS Press, 2012)；ww2 的 S95–S106（复制） |

地图与数据：G1–G31（§3.1），每张写 URL、作者、Commons 许可模板原文、尺寸、用途。

编号段（并行时避免冲突）：S1–S49 原始文献、通论、背景章；S50–S99 第 01–05 章；S100–S149 第 06–07 章（含从 ww2 复制的来源）；S150–S199 第 08–11 章；S200+ 事件与路线补充；地图 `[G1]–[G31]`。挡爬虫的站点（JSTOR、Cambridge Core、部分 NLB 页面）只引读到的原文；只看到摘要的在 `note` 写"据搜索摘要"并列入已知差距。

---

## 7. 图像清单（给 Codex）

首页图已有并已处理（新加坡河约 1830 年代：帆船、驳船、货栈、福康宁山、测量经纬仪与卷起的地图；`public/illustrations/singapore-1819-1965.webp` 与 `@2x`，尚未提交），不再生成。章节图用 `pnpm tsx scripts/illustrate.ts figure <src.png> singapore-1819-1965-<id>`（4:3，`public/illustrations/figures/`），正文 `<Figure src="figures/singapore-1819-1965-<id>" …>`。风格 = `STYLE_BRIEF`（石墨铅笔、19 世纪科学图版、透明底、无文字）。Codex 生成的图放 scratchpad `genimg/singapore-1819-1965/`，主会话逐张看过再处理。**图只当插图，不当事实依据**；caption 写"为本主题画的示意图，依据……"。

**所有图都不许出现**：可辨认的真实人物（莱佛士、苏丹、任何政治人物）、任何人群的刻板形象（辫子、头巾、肤色夸张等）、旗帜、徽章、殖民军队列队、暴乱或屠杀场面、狮子 / 鱼尾狮、可读的文字（招牌、碑文、钞票上的字一律画成模糊笔触）。

| id | 章 | SUBJECT（英文，原样交给 Codex） | 不许画 |
|---|---|---|---|
| `temasek-finds` | 00 | a museum specimen plate of fourteenth-century finds from a hill excavation in Singapore: several broken sherds of Chinese celadon and blue-and-white porcelain laid out in a loose row, a small earthenware pot rim, a few glass beads, and a delicate gold armlet decorated with a small monster-face (kala) head, all shown at the same scale on no ground, each object casting no shadow | 不画桑尼拉乌他马、狮子、王宫复原；金饰不画成王冠 |
| `ocean-junk` | 03 | a nineteenth-century southern Chinese ocean-going trading junk under sail, seen broadside: a high square stern with a large rudder, three masts carrying battened lug sails with fan-shaped ribs, a raised bow with a painted eye shown only as a simple circle, a small sampan towed behind; drawn as a ship-type plate with fine rigging lines | 不画船员、旗、船身上的字 |
| `shophouse-cutaway` | 05 | a cutaway elevation of a two-storey Singapore shophouse of the late nineteenth century, one of a terrace: a covered five-foot way with arches along the front, the ground-floor shop with wooden shutters and a counter, a narrow open-air light well in the middle of the house with a water jar, a steep wooden staircase, the upper floor with louvred windows and sleeping rooms, clay-tiled roof; architectural section plate, no people, the signboard over the door left blank | 不画人；招牌空白；不加"异国情调"装饰 |
| `places-of-worship` | 05 | four small architectural elevations side by side at the same scale, as a comparative plate: a South Indian temple gateway tower with stacked tiers of sculpted figures shown only as indistinct masses, a southern Chinese temple hall with a curved swallowtail roof ridge, a mosque with a large onion dome and two slender minarets, and a white neoclassical church with a columned portico and a tall spire | 不画具体可辨认的某一座建筑的细部当事实；不画人和宗教人物形象（神像只成模糊团块） |
| `rubber-and-tin` | 06 | a plate of two colonial Malayan commodities: the lower trunk of a rubber tree with a diagonal herringbone tapping cut, white latex running into a small cup tied to the bark, a curved tapping knife hanging beside it, and next to it on no ground a stack of ribbed smoked rubber sheets and a single trapezoid tin ingot | 不画劳工（避免刻板形象）；锭上不刻字 |
| `ballot-box` | 09 | a 1950s wooden ballot box with a narrow slot in the lid, metal corner straps, a hasp and a small padlock, seen at a three-quarter angle; beside it a few folded blank ballot papers and a wooden-handled rubber stamp | 不画政党标志、选票上的字、人 |

图数：首页 1 + 章节 6 = **7**。不画：暴乱、屠杀、处决、日据场面（ww2 已有首页图；正文用文字和地图）、地图（地图本身就是图）。

---

## 8. 施工顺序与分工

| 步 | 内容 | 谁 | 文件归属 | 完成标准 |
|---|---|---|---|---|
| 0 | 本 spec（§0 代定，§10 的问题回填） | 主会话 / Gavin | docs/28 | — |
| R | 研究表：§1.3 的〔待核〕逐条落实（读原文、抄出处）；普查表、伤亡表、街名表、第一届内阁两份名单；Commons 地图逐张下载、记 SHA-256 与许可模板原文 | **Codex**（与 E 并行，不依赖引擎） | `src/content/topics/singapore-1819-1965/RESEARCH.md`、`scripts/geo/singapore-1819-1965/raw/`（gitignore） | 每条有出处与原文摘录；查不到的标"未能核实"，不编 |
| E | 引擎 E1–E3 + 管线 P1–P3（§4） | **Opus**（一个代理，等当前引擎代理提交后开工） | §4 所列 | 单测；docs/06 更新；四个历史 / 地图主题截图不回归 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts singapore-1819-1965 --engine time-scene --subject history --title-en "Singapore, 1819–1965" --title-zh "新加坡 1819–1965" --start 1819-01-28 --end 1965-12-22`；entities / presets / glossary 存根 | 主会话（或 Codex 第一步） | `src/content/topics/singapore-1819-1965/**` | `pnpm validate` 绿 |
| M | 岛岸 L0–L5、关键帧 K1–K19 与换岸帧 K4a、K6a、K6b、K15a（先 K2、K19） | **Codex**（地图配准与描摹；E / P 未落地时写主题本地脚本，产物格式按 §3.3） | `scripts/geo/singapore-1819-1965/**`、`public/geo/land-sg-history.json`、`data/control.json`、`docs/screenshots/singapore-1819-1965/{coast,geo}-*.png` | 残差在预算内；rings 0 / 0；SOURCES-GEO.md 齐全 |
| C | 数据草稿（事件、路线、来源、名词）与 11 章 + 背景章 EN 初稿；ZH 字段写"【待译】" + EN | **Codex** | `data/*.json`、`chapters/*.mdx`（EN） | `pnpm validate` 0 error |
| I | 图像 6 张（§7） | **Codex** | scratchpad → 主会话处理 | 逐张对照"不许画" |
| T | 史学复核：§1.2 立场、§1.3 事实、每个 `<Num>` 对出处；多方视角逐章过一遍；与 ww2 的数字和措辞逐条比对 | **Opus** | 同 C 的文件，`AUDIT.md` | 〔待核〕清零或列入已知差距 |
| Z | 中文定稿：独立成文，不是翻译；译名按 §0-11 | **Claude（Opus）** | 所有 `zh` 字段 | 无"【待译】" |
| B | 节拍（§2.2 已给草稿）、章节镜头、高亮 | **Sonnet** | 章节 frontmatter | `pnpm shoot singapore-1819-1965 --beats` 0 失败，两份清单为空 |
| Q | QA：`acceptance.md` + §9；两套主题；手机 | **Sonnet**（视觉问题退回 Opus） | — | 全勾 |
| D | 草稿部署给 Gavin（`status: draft`，URL 访问），本文补 §11 实现记录 | 主会话 | — | 门槛全绿；push 等 Gavin |
| R2 | Gavin 亲审沉重段落中文（§9）与 §10 | Gavin | — | 回填后才改 `published` |

模板章（给 Gavin 先看）：背景章 + 第 02 章（城区规划：K2、岛岸 L1、城区尺度）+ 第 11 章（骚乱与分家：马来西亚尺度、沉重内容、两边写）。看过再铺开。并行规则照 `build-order.md`：同一时间只有一个代理改 events / movements；Codex 不改 `src/engines/**`、`scripts/geo/lib/**`、`package.json`、别的主题（ww2 只读）。

### 8.1 Codex brief（原样交给 Codex）

> Build the research and data drafts for the new TimeScene history topic `singapore-1819-1965` (Singapore, 1819–1965) in the Atlas project at /Users/gavin/work/atlas. Read first: CLAUDE.md (hard rules: maps only from real datasets or georeferenced published maps, every keyframe's source, licence and georeferencing method recorded in data/SOURCES.md; objective, multi-perspective writing, no "we/enemy"; heavy content told with sourced numbers in restrained wording; no grade labels anywhere in the UI); docs/28-singapore-1819-1965-content-spec.md ENTIRELY (§0.1 decisions; §1.2 stance and word list; §1.3 facts F1–F23 with every 待核 item; §2 chapters with beats, events, routes, territory names; §3 the coast eras L0–L5 and keyframes K1–K19 with the exact Commons files G1–G31; §5 glossary; §6 sources; §7 figures); .claude/skills/atlas-history-topic/ (SKILL.md and all references); docs/06 sections TimeScene, 区域底图, 按国配色, 不确定的边界, 用词覆盖, Geo pipeline, 岛尺度底图; docs/24 and src/content/topics/four-taps/**, scripts/geo/four-taps/** (island-scale manifest, datasets, SODL/ODbL attribution); docs/27 §11 and src/content/topics/warring-states/{AUDIT,REVIEW}.md (what the historian review expects); src/content/topics/ww2/chapters/{07-fall-of-singapore,08-syonan,11-end-and-home}.mdx and ww2/data/*.json (wording, ids and sources to copy for chapter 07). An Opus agent will later add, to these names: dated `kind: land` features (`from`/`to`) in a `basemap.local` file, an optional `kind: coast-today` line, `TopicLink ch="…"`, and the pipeline options `pipeline.localLand.eras`, `coast.excludeBox`; author your data to those names; where the pipeline option does not exist yet, write a topic-local script under scripts/geo/singapore-1819-1965/ that produces the same output format, and say so.
>
> Write only under src/content/topics/singapore-1819-1965/**, scripts/geo/singapore-1819-1965/** (raw/ and work/ gitignored — add the entries), public/geo/land-sg-history.json and docs/screenshots/singapore-1819-1965/**. Do not edit src/engines, scripts/geo/lib, src/components, package.json or any other topic; ww2 is read-only. Do in order:
> (0) Scaffold with `pnpm tsx scripts/new-topic.ts singapore-1819-1965 --engine time-scene --subject history --title-en "Singapore, 1819–1965" --title-zh "新加坡 1819–1965" --start 1819-01-28 --end 1965-12-22`, then set topic.yaml per spec §2.3 (`basemap: { local: land-sg-history, maxZoom: 14 }`, `colorBy: entity`, `blocLabels`, `strings`, `levels: [P4, P5]`, `illustration: singapore-1819-1965`, `status: draft`).
> (1) Research: for every 待核 in §1.3 and §2, read the source and record in RESEARCH.md the fact, the exact source (book and page, or URL), a short quotation (≤ 25 words) and whether it is confirmed, corrected or unverifiable; build the tables the spec asks for (census 1824/1871/1931/1957 with community breakdowns; casualty tables for 1854, 1915, 1950, 1955, 1956, 1964 July and September, 1965 MacDonald House, Sook Ching copied from ww2; the first Cabinets of June 1959 and August 1965; the street-name table for chapter 05). Never fill a number from memory; when two sources disagree, keep both with their sources. NLB Infopedia, Singapore Statutes Online, the National Archives of Singapore and archive.org copies of Buckley (1902), Song Ong Siang (1923), Leyden (1821) and Rockhill (1915) are the first places to read.
> (2) Fetch: download G1–G27 and G29 from Wikimedia Commons (full resolution via the API `imageinfo&iiprop=url`), and G30 from data.gov.sg as four-taps does, into raw/; record URL, author, the licence template text from each file page, pixel size and SHA-256 in raw/fetch-log.json. Re-check the licence status of G16 (correction year), G19, G20 (which original map) and G27; if unclear, mark them cross-check only.
> (3) Coast eras L0–L5 (§3.3): georeference each source map with ≥ 12 control points (≥ 16 for whole-island maps) on features that still exist (old street junctions in the town, river bends, capes, trig points), using georef-raster.ts / lines.ts with `projection: auto`; trace the printed shoreline with lines.ts; build each era as today's URA land minus the land reclaimed after that era (plus any historical land now gone), all eras in one TopoJSON public/geo/land-sg-history.json with the `kind: mask` of land-sg, six `kind: land` features with `from`/`to`, and `kind: coast-today`; also write work/coast-L#.geojson. Meet the residual budgets in §3.3; report leave-one-out RMS and max per map, the share of each traced line on shoreline colour, and the area difference to today's coast per era; side-by-side images to docs/screenshots/singapore-1819-1965/coast-L#.png.
> (4) Keyframes K1–K19 plus the coast-change frames K4a, K6a, K6b, K15a (§3.4): Malayan and Bornean units from Natural Earth admin-1/admin-0 grouped by state (public domain), cross-checked against G23–G26 (trace G23's state lines with lines.ts where they differ by > 10 km); the K2 Jackson Plan divisions from G1 (colour classes, or lines.ts along the division lines), each class listed with its legend wording; every Singapore feature clipped to the coast era in force on the frame's date (K1 → L0; K2–K4 → L1; K4a–K6 → L2; K6a → L3; K6b–K15 → L4; K15a–K19 → L5); hold frames K4, K7, K10, K14, K16, K18 duplicate the previous frame; every feature has `holder`, `label {en, zh}` and `src`, and `certainty: "approximate"` where §3.4/§3.6 says so. Do K2 and K19 first and check them side by side before the rest. compose → simplify (`rings: N, zero-area 0, self-crossing 0`; budget 1.0 MB) → check images. Run colour-holders.ts --write. Write SOURCES-GEO.md (per era and per keyframe: sources, licence text, control points, model, residuals, method, known gaps) and the Control keyframes table in data/SOURCES.md. No hand-drawn polygons, no bbox used as territory, no OSM geometry in published files.
> (5) Data: entities (§2.3), events (~130, ids exactly as in §2.2; chapter 07 events and movements copied from ww2 with the same ids, coordinates, numbers and source texts), movements (~18; sea routes with waypoints at the straits and capes named in Horsburgh's India Directory so no route crosses land; no `strength` unless sourced), presets (§2.3), glossary (§5, ids exactly as listed there), sources.json (≥ 40, numbered by the blocks in §6; every note states what was read) and `pnpm tsx scripts/sources-md.ts singapore-1819-1965`.
> (6) Chapters: background + 11 per §2, ENGLISH drafts only (200–300 words, 3–5 paragraphs, 2–4 <More> each; every number in <Num s>; <Term> on first use; dates as "6 February 1819"; legends marked as legends; each heavy passage with numbers, sources and every side's account, no judgement words; chapter 07 numbers and wording consistent with ww2 and linking to it with <TopicLink slug="ww2">); Chinese fields as "【待译】" + the English so validation passes; beats per §2.2 with the EN captions given there (ZH "【待译】" + EN).
> (7) Images: generate the six figures of §7 with `pnpm tsx scripts/illustrate.ts gen` into the scratchpad folder genimg/singapore-1819-1965/ only (do not run `process` / `figure`), one PNG per id, respecting every "must not show" item.
> Run `pnpm validate` until 0 errors (fields the engine has not landed yet may error — list them). Do not run build, test, e2e or shoot. Do not commit. Finish with: counts (eras, keyframes, features, entities, events, routes, sources, glossary terms), per-map RMS and max residual, the hold frames, every fact that stayed unverified, every licence you could not confirm, and the validate status.

---

## 9. 验收（`acceptance.md` 之外，本主题另加）

- [ ] **地图只用真实数据**：每段岛岸、每个关键帧在 `data/SOURCES.md` 与 `SOURCES-GEO.md` 都有一行（主源、核对、方法、模型、残差、已知简化）；没有手画多边形、没有 `bbox` 版图；1965 年以后的填海在任何一帧都不出现；岛尺度镜头里只有一条当年的海岸（E2 的虚线是今天的海岸，有图例）。
- [ ] **许可**：发布的几何只来自公有领域地图、NE、URA（SODL 署名原文在页面来源列表）、Wikidata；CShapes 与 BY-SA 示意图没有进入 `public/`、`src/`；每张 Commons 图的许可模板原文在 SOURCES-GEO.md。
- [ ] **三种尺度都对**：区域镜头里航线不穿陆地；马来亚镜头里各州 label 与年份对得上（K5 北四州"under Siam"、K9"Thai-administered"）；城区镜头 zoom 13.6–14 下 K2 分区贴合 L1 海岸，没有海里的填色。
- [ ] **与 ww2 一致**：第 07 章的每个数字、日期、id 与 ww2 相同（脚本比对两份 events / movements 的同名 id）；肃清的开始日期按 §10-1 的结论统一。
- [ ] **客观性**（writing-rules 清单逐章过一遍，加上）：没有"创建 / 发现新加坡""小渔村（当定论）""我们的先辈""光复"；开埠写了条约双方、廖内一方和荷兰的立场；殖民经济写了鸦片、苦力、罪犯劳工；每个移民群体都有来处、原因、住处、困难与贡献；冷藏行动、1964 年骚乱、1965 年分家都是两边各一段、不下结论；传说标明是传说。
- [ ] **沉重段落**（1854、1915、苦力贸易、罪犯劳工、肃清、1950、1955、1956、1963、1964、1965）：数字各有来源，冲突的并列；有名字写名字；每处一句为什么今天还要记住；中文稿 Gavin 已审。
- [ ] 界面上没有年级；`levels` 只在 topic.yaml。
- [ ] 图像 6 张：没有真实人物、旗帜、刻板形象、可读文字；caption 写明是示意图。

## 10. 待 Gavin 确认（只列真正需要他决定的）

1. ~~ww2 的肃清开始日期~~ **主会话已定（2026-10-17）**：不改 ww2。ww2 自己记有 2 月 20 日樟宜海滩的屠杀，"2 月 18 日开始"与此相符；S97 的 21–23 日是市区的集中检证。本主题与 ww2 一致：写"2 月 18 日开始，市区的集中检证主要在 21 日至 23 日（S97），持续到 3 月 4 日"，不写"21 日起"。
2. **冷藏行动与 1964 年骚乱的写法**：按 CLAUDE.md 两边写（政府当时的说法 / 被捕者与部分史家的说法；巫统、行动党、联邦政府各自的公开说法），不下结论。这在新加坡今天仍有争议，请确认可以这样写，以及中文稿由你亲审。
3. **"Lim & Lau"** 指的是哪两本书（§6 P34）。

（其余 §0 各条主会话已代定；E1 若排不进，按 §4 Plan B 走，不需要再问。）
