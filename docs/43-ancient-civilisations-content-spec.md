# 43 · 古文明：从苏美尔到马六甲 · 内容施工 spec（v1）

TimeScene / GeoStage，paper 默认、cinema 可切。按 skill `atlas-history-topic` 的 `spec-template.md` 写；地图的写法照 docs/27（春秋战国：公元前时间轴、区域图版、按国配色、`certainty: approximate` 虚线、LICENSE-CONTENT 的 CC BY-SA 例外），页面结构照 docs/42。**§0 由主会话按 Gavin 惯例代定（§0.1），Gavin 已说"做"；他可逐条推翻。`status: draft` 不变，直到 Gavin 读完 §0.2 的敏感段落。**

- slug：`ancient-civilisations`；标题 EN "Ancient Civilisations" / ZH "古文明"；副标题 EN "From Sumer to Melaka, c. 3200 BCE – 1511 CE" / ZH "从苏美尔到马六甲（约公元前3200年—公元1511年）"；`shortTitle` EN "Ancient civilisations" / ZH "古文明"。
- 课纲：MOE 2020 SS 课纲 P6（印刷页 39–43，§1.1 原文）。`levels: [P6]` 只是规划元数据，**界面任何地方不出现年级**，也不写"课纲要求""P6 名单"之类的话。`subject: history`，`tags: [history, map]`。docs/17 第 209 行原计划拆成 `ancient-civilisations` 与 `southeast-asian-kingdoms` 两个主题，本文合成一个（§0-2），docs/17 与 docs/04 由主会话同步。
- **调查结论**（Sonnet 研究 `art/research/ancient-civilisations/`，2026-10-21 完成：`ancient-research.md` §1–§5；`facts.json` 342 条事实、54 个地点、110 个中文词、`meta.sensitive_index`；`datasets.json` 16 个数据集、20 张 Commons 地图）：①课纲原文核对过：五个特征的印刷写法、四个举例文明、"河流"只对印度次大陆和中国、东南亚六国按 MOE 顺序；淡马锡不在 P6 名单（山尼拉乌他玛是 P4）。②地图数据：**Cliopatria（CC BY 4.0）是唯一给出带年份多边形的开放数据**，覆盖埃及、阿卡德、乌尔第三王朝、罗马、孔雀、笈多、商、周、秦、室利佛逝、高棉、满者伯夷、马六甲；**没有**印度河、希腊城邦；扶南、素可泰本文不画面（§0-6）。点用 Wikidata（CC0），Pleiades（CC BY 3.0）核对。③**没有下载任何数据集**，各政体在 Cliopatria 里有没有所需年份的多边形，要在施工第一步（§3.2 G0）清点后才知道；本文为每个实体写了"缺了怎么办"。④事实大多来自维基百科（三级来源）：凡进正文的都要换成博物馆、UNESCO、学术或公有领域原典（§1.3 ⚑，Sonnet F 步）。
- **引擎结论**（§4）：**一处小改 E1**（同一主题跨公元前后时，公元 1–999 年标 "CE / 公元"）；其余全用已有能力：区域图版 `basemap.region`（含河流与河名）、`colorBy: entity`、`certainty: approximate`、`datePrecision: year`、`strings`、`datedLayers`（东南亚的"势力范围"）、控制区空帧、`milestone` / `site` 事件、`persist` 航线。施工前核对 V1–V9。

---

## 0. 决策（2026-10-21 起草，主会话按 Gavin 惯例代定，见 §0.1）

| # | 决定 | 选项 / 理由 | 定稿 |
|---|---|---|---|
| 1 | **背景章 00 + 8 章，按时间排**：01 苏美尔（-3200）→ 02 埃及（-3150）→ 03 印度次大陆（-2600）→ 04 中国（-1250）→ 05 希腊与罗马（-0508）→ 06 东南亚（一）：季风海上的港口（0150）→ 07 东南亚（二）：吴哥、素可泰、满者伯夷与马六甲（0802）→ 08 流传至今：遗产与世界遗产（2021）。时间轴从公元前 3200 年到公元 2021 年（第 08 章的日期 = 本主题最后一个世界遗产的列入年，多拉维拉 2021）。章节在时间上重叠（拍晚于下一章开始），docs/10 允许 | 硬规则"章节顺序 = 时间顺序"不允许照 MOE 的顺序（苏美尔、埃及、希腊、罗马，然后印度、中国、东南亚）：印度河城市（约前 2600）、商（约前 1250）都早于雅典民主（前 508）。按时间排，四条大河流域在前、"靠海不靠河"的希腊罗马居中、东南亚的海峡与稻田在后，正好是"河—海—海峡"一条线 | 主会话按 Gavin 惯例代定 |
| 2 | **一个主题，不拆成两个**：东南亚六国占两章（06、07），世界遗产与"连到今天的国家"放在 07 的细看与 08 | docs/17 原计划另做 `southeast-asian-kingdoms`。不建议：课纲的四个引导问题是同一套"特征—遗产"框架，拆开以后两边都要重讲五个特征和海路；一个主题也能在 08 章把四大块的遗产并排比较 | 主会话按 Gavin 惯例代定 |
| 3 | **希腊与罗马合成一章**（05） | 另一选项：希腊、罗马各一章，东南亚合成一章（仍是 8 章）。不建议：课纲里希腊、罗马只是"五个特征"的举例，而东南亚有三条知识目标（海与农、连到今天的国家、世界遗产），六个王国挤一章写不下；希腊罗马合章还能讲清"字母从希腊到拉丁""罗马吞并希腊" | 主会话按 Gavin 惯例代定 |
| 4 | **底图 = 一张"旧大陆"区域图版**（`basemap.region`，bounds [-12, -12, 135, 58]：大西洋岸到朝鲜半岛、不列颠到爪哇），7 个区域预设镜头（§2.3）。陆地 = Natural Earth 1:10m 裁切简化；河流图层用今天的河道（NE），另加已在仓库里的古黄河两条复原河道（docs/27 G1）；**不开今天的国界** | brief 倾向"世界底图 + 区域预设"。世界底图没有河流图层（`rivers` 只在 `region` 模式里有，`controller.ts` 第 183 行），而"河流"是课纲点名的知识目标；旧大陆图版 = 世界底图上本主题用到的那一块 + 河流与河名，**零引擎改动**。代价：没有 B 键的今天国界与国名（"今天在哪个国家"改在字幕、细看和事件 `summary` 里写）。另一选项：世界底图 + 引擎把 `rivers` 从 `region` 里拿出来（§0.1-1） | 主会话按 Gavin 惯例代定 |
| 5 | **版图来源 = Cliopatria（CC BY 4.0）**，16 个控制区关键帧（K1–K16，§3.3）由管线从 Cliopatria 按年份**机械地**取出、裁到海岸、简化；**所有要素 `certainty: approximate`**（虚线分界、淡底 ×0.7）；每帧在 `SOURCES-GEO.md` 记 Cliopatria 版本、DOI、SHA-256、所用记录名与年份。只画本主题讲到的国家（12 个实体）；其余土地留白，阅读说明写明"空白不是无人" | Cliopatria 作者自己说多边形是"按已出版地图手工重描"、不确定性无法量化、只是"一种版本"（ct-13–15）：所以一律虚线、标"示意"。拒用：historical-basemaps（GPL-3.0、来源不可记）、DARMC（无许可）、AWMC 瓦片（运行时外部请求）、OHM（来源标签缺失，只作核对） | 主会话按 Gavin 惯例代定 |
| 6 | **印度河、扶南、素可泰、希腊城邦只画点，不画面**。点 = Wikidata 坐标（Pleiades 核对）；印度河一章靠城市点 + 河流讲"河流的作用"；图上和细看都写明"这里没有可靠的范围图" | 研究：Cliopatria 无印度河、无希腊城邦；扶南只见于中国史书，可能是几个城邦（sa-04、sa-06）；素可泰的范围是国王碑文的说法，后人读作"关系网络"（sa-43），找不到有出处的范围图 | 主会话按 Gavin 惯例代定 |
| 7 | **东南亚的曼荼罗政体画成"势力范围"而不是国界**：室利佛逝、高棉、满者伯夷、马六甲四个用 `datedLayers`（`kind: area`，`certainty: approximate`，Cliopatria 的多边形与年份，`holder` = 各自实体），可以互相重叠、按 Cliopatria 年份出现消失；不进控制区（控制区的分界线会把重叠画成假国界）。名字靠都城的事件引线标注 + KEY 一行 | sa-01："overlapping spheres of influence rather than fixed territorial boundaries"。研究建议的 mandala 画法，引擎已有（docs/34 E1） | 主会话按 Gavin 惯例代定 |
| 8 | **海路画成"示意航线"**：没有开放的海上丝绸之路数据集，航线由**有来源的港口点**连成，中间只为"让线留在海上"加海上折点（每个折点在 `SOURCES.md` 写"不是记录的航迹"）；标签一律带"（示意）/ (schematic)"。只画有文献记录起止的航行（黑石号、义净、朱罗袭击）和一条 `persist` 的"季风海路"（§3.5） | 照 warring-states 行军的写法 | 主会话按 Gavin 惯例代定 |
| 9 | **许可**：Cliopatria（CC BY 4.0）、NE（公有领域）、Wikidata（CC0）、Pleiades（CC BY 3.0，只核对）都能直接进 CC BY-NC-SA 4.0 的内容包，署名即可。**河流文件 `ancient-rivers.json` 含有 warring-states 从 Kanguole 的 CC BY-SA 4.0 地图描出的古黄河**，照 warring-states 的先例在 LICENSE-CONTENT 加一段例外（该文件 CC BY-SA 4.0）。**AWMC geodata（ODbL）本版不用**，不加 ODbL 例外；Commons CC BY-SA 地图本版只作肉眼核对、不描摹 | §0.1-2、§0.1-3；研究 §3.3（不是法律意见） | 主会话按 Gavin 惯例代定 |
| 10 | **立场**：五个特征是课本的"检查表"，不是给人类排名次；不在 Atlas 自己的话里称任何人群为"野蛮人"，旧称呼只在引用时出现并注明是谁说的；各方的征服、屠杀、奴役、人牲**同一套写法、同一种标记**（§1.4、§3.4 的"同类同标"规则：有记录的大规模杀戮 / 掳掠 / 人牲 = `atrocity` 空心方块，无伤亡记录的征服与攻城 = `political`，罗马、希腊一方的同类事件同样上图）；外人起的名字（扶南、室利佛逝的"重新发现"）、殖民时代的说法（"印度化"）都写明来历；东南亚的主角是东南亚人自己（南岛航海者、本地碑文） | CLAUDE.md 历史内容硬规则；研究 §4 | 主会话按 Gavin 惯例代定 |
| 11 | **年代**：`datePrecision: year`；EN 正文写 "2600 BCE" / "150 CE"，ZH 写"公元前 2600 年""公元 150 年"（同章后文可省"公元"）；不写 BC / AD（背景章细看解释 BCE/CE 与"没有公元 0 年"）。所有"约"的年份标题和字幕里写 "c." / "约"；同一事有两个年份的（682/683、1292/1293、前 322/前 320、马六甲约 1400 与 1402）并列，正文选一个、细看写另一个。公元前 2000 年以前的绝对年代随"年代学"而变（su-06），背景章说明一次 | 研究 §2.0 | 主会话按 Gavin 惯例代定 |
| 12 | **淡马锡**：不是本章六个王国之一（界面这样写，不提课纲年级）；07 章一个细看 + 一个 `site` 点（福康宁，坐标与 `singapore-1819-1965` 的 `site-fort-canning-temasek` 相同）+ `<TopicLink slug="singapore-1819-1965" ch="background">`，不重讲山尼拉乌他玛的故事 | 研究 §1 | 主会话按 Gavin 惯例代定 |
| 13 | **中国只讲"河流 + 商 + 秦统一 + 汉的纸"，东周与秦链到 `warring-states`**（`ch="eastern-zhou"`、`ch="qin-conquest"`、`ch="after-221"`）；地图上前 508 至前 261 年的中国画成一个"周代诸侯国"整体（Cliopatria 该时期诸国多边形的并集，§3.3），不在本主题里逐国画 | 不重复春秋战国 | 主会话按 Gavin 惯例代定 |
| 14 | **中文用词**（§5、§1.5）：古埃及象形文字（首次出现写"古埃及象形文字（学名圣书体）"）；室利佛逝（细看注"宋以后的中国史书称三佛齐"）；吴哥 = 城与遗址，吴哥窟 = 那座寺庙（注 UNESCO 中文名把整个遗产叫"吴哥窟"）；淡马锡（引汪大渊时写"单马锡"，同 1819–1965）；Óc Eo 在中文正文写"Óc Eo（俄厄）"，不用"喔㕭"（生僻字，字体未必有）；山尼拉乌他玛、拜里米苏拉照 1819–1965 的写法 | 研究 §5 | 主会话按 Gavin 惯例代定 |
| 15 | **图像只用已审草稿**（本轮没有 Codex）：首页图 = 乌尔式塔庙；章节图 = 大浴场（03）、双耳陶罐与罗马水道（05）。不生成新图 | §7 | 主会话按 Gavin 惯例代定 |
| 16 | **不做**：测验、配音文件、视频、人物肖像、神像与宗教符号的图、今天的国旗；罗马道路与水道网（AWMC / Itiner-e，§0.1-3）；古海岸线（只在苏美尔一章的细看写"海岸当时深入内陆约 200 公里"）；赫梯、亚述、迦太基、帕提亚、贵霜、拜占庭、唐宋等本主题不讲的国家不上色 | | 主会话按 Gavin 惯例代定 |

### 0.1 代定说明与给 Gavin 的事项（2026-10-21）

主会话按 Gavin 惯例代定 §0 全部 16 条：背景 + 8 章按时间排、希腊罗马合章、东南亚两章、旧大陆区域图版、Cliopatria 虚线版图、东南亚画势力范围、示意海路、只用已有三张图、一处小的引擎改动。Gavin 已说"做"。

**要 Gavin 定的（默认做法已按建议写进本文，不改就照做）：**

1. **底图**：默认"旧大陆"区域图版（有河流和河名，没有今天的国界）。另一选项：世界底图 + 引擎小改（`basemap.rivers` 不依赖 `region`），能按 B 看今天的国界和国名，代价是多一处引擎改动和 ww1 / ww2 / warring-states 的回归截图。
2. **许可例外（河流）**：默认复用 warring-states 的古黄河（CC BY-SA 4.0），LICENSE-CONTENT 加一段"`public/geo/ancient-rivers.json` 按 CC BY-SA 4.0 提供"。另一选项：不复用，黄河下游只画今天的河道并标"今天的河道"（不准确：今天的下游是 1855 年以后的），或干脆不画下游。
3. **AWMC（ODbL）**：默认不用，罗马章不画道路、水道网。若 Gavin 想要罗马道路线，加一段 ODbL 例外（派生的道路 GeoJSON 按 ODbL 提供），或改用 Itiner-e（CC BY 4.0，不用例外，但只有道路）。
4. **章节结构**：默认按时间（河—海—海峡）、希腊罗马合章、东南亚两章。另一选项：希腊、罗马各一章，东南亚一章。
5. **扶南画不画面**：默认只画点（Óc Eo、吴哥波雷）。Cliopatria 有 "Funan I / II" 两条记录，若 Gavin 同意，可以像室利佛逝一样画成势力范围，图例写"中国史书所称的扶南（示意）"。
6. **沉重段落的中文稿**（§0.2）：商代人牲、阿育王征服羯陵伽（国王自己说的死伤数）、罗马攻毁科林斯与斯巴达克斯起义后的处决（若 F 步找到原典）、各文明的奴隶制、"野蛮人 / 夷"一类称呼、高棉与占婆、阿瑜陀耶攻陷吴哥。
7. **中文译名**：新加坡没有公开的 P6 华文课本或教育部华文词表，§5 的词按 zh.wikipedia（zh-sg 转换）、UNESCO 中文名、NLB / NHB / ACM 写。要 Gavin 或孩子课本核对的：苏美尔 / 苏美、金字形神塔（塔庙）、大浴场、羯陵伽 / 卡林加、室利佛逝 / 三佛齐、满者伯夷、拜里米苏拉、Óc Eo 的中文写法。默认见 §0-14；建议加进 review-queue 第三组"课本核对"。
8. **数据下载**：施工第一步要下载 Cliopatria（GitHub / Zenodo 发布包）、Natural Earth 1:10m 河流与湖泊、Wikidata 与 Pleiades 的地点 JSON（都在构建期，运行时不请求）。研究阶段按规矩没有下载；Gavin 说了"做"，主会话视为同意。
9. **docs/17 的计划改变**：原来两个主题（古文明、东南亚古国），本文合成一个。请知悉。

### 0.2 敏感段落（给 `docs/review-queue.md` 第一组；草稿完成后按实际段落号更新）

下面是加进 review-queue「一、草稿主题：上线前要读的段落」的条目原文（编号接在当时最后一条之后；章节与细看标题按本文 §2，施工后主会话核对段落号）：

> ### N. 古文明
>
> - **在哪看**：`src/content/topics/ancient-civilisations/REVIEW.md`（中文在前），事实核查见同目录 AUDIT.md，地图来源见 `scripts/geo/ancient-civilisations/SOURCES-GEO.md`，规格 docs/43。
> - **重点段落**：
>   - **00 背景**：细看"谁说谁是'文明'"（希腊人的 barbaros、罗马人的用法、阿卡德人给苏美尔起的名字、《岛夷志略》书名里的"夷"及 NLB 的英译）；阅读说明里"只给本主题讲到的国家上色，空白不是无人"。
>   - **01 苏美尔**：细看"谁在干活"（苏美尔城市使用从山地掳来的奴隶劳动）；"轮子是谁发明的"；若 F 步找到博物馆来源，乌尔王陵殉葬的一句。
>   - **02 埃及**：细看"谁修了金字塔"（希罗多德的"十万人"、狄奥多罗斯把金字塔与奴隶连在一起、工人村的发现与仍在继续的争论）；细看"埃及有没有奴隶"（三种形式，学者意见不一）；第 5 拍罗马吞并埃及。
>   - **03 印度次大陆**：第 3 段与细看"羯陵伽：国王自己写下的数字"（十万人被杀、十五万人被掳，阿育王的悔恨），事件 `kalinga-war`；细看"一条河的两个名字"（"印度河—萨拉斯瓦蒂"之争）；"还读不懂的文字"。
>   - **04 中国**：细看"商王的祭祀"（人与动物被用作国家祭祀的牺牲），事件 `shang-sacrifice`；细看"夏：有没有这个朝代"；第 3 段秦的劳役一句（链到春秋战国）。
>   - **05 希腊与罗马**：细看"谁算'人民'"（雅典公民不超过成年人的三成；希腊与罗马的奴隶；斯巴达的希洛人）；细看"被征服者怎么说"（塔西佗借喀里多尼亚首领之口的那句话；公元前 146 年科林斯、公元前 71 年斯巴达克斯起义之后——只有 F 步找到原典才写），事件 `corinth-destroyed-146`、`spartacus-crucifixions-71`；第 3 拍亚历山大的征服。
>   - **06 东南亚（一）**：细看"'扶南'是谁起的名字"；"一千年后才被'重新发现'的室利佛逝"；"印度化：殖民还是贸易"；事件 `chola-raids-1025`；黑石号的商业打捞（只在 F 步核实后写一句）。
>   - **07 东南亚（二）**：细看"吴哥与占婆：两边都打赢过"（1145、1177）；第 1 段与事件 `angkor-sacked-1431`（阿瑜陀耶攻陷吴哥）；细看"画成势力范围的原因"（《爪哇史颂》的 98 个属地、兰甘亨碑文的范围）；"第一个泰人王国"这一说法；细看"淡马锡"（满者伯夷攻打新加坡拉：被击退还是被攻陷，两说）；1293 年拉登·威查耶转而攻击元军。
>   - **08 遗产**：细看"零：谁'最早'"（巴克沙利手稿年代之争）；"世界遗产名录与'欧洲中心'的批评"；新加坡植物园是殖民时期的遗产。
>   - 名词 `civilisation`、`mandala`、`maritime-silk-road`、`legacy` 的释义。
> - **要定的**：底图（旧大陆图版还是世界底图 + 引擎小改）；河流文件的 CC BY-SA 例外；AWMC 用不用；希腊罗马合章；扶南画不画范围；中文译名（§5 的"待核"）。

---

## 1. 课纲、范围、立场、必须讲对的事实

### 1.1 课纲原文（S1：MOE CPDD，*2020 Social Studies Teaching and Learning Syllabus, Primary*，封面 "Updated as of January 2024"，印刷页 = PDF 页 − 1；研究 moe-01–moe-27）

MOE 只允许"整本"复制（moe-27），所以下面的原文只放在本 spec，**不进主题正文**；正文用自己的话。

- **第 39 页标题**：*Primary Six: Understanding Features and Legacies of Civilisations*（2022 年起实施）。Inquiry Focus："How are the legacies of the civilisations seen in our lives today?"
- **第 39 页 Level Descriptor**（印刷错字照抄）："Students will learn the features that make up a civilisation. They will also learn about the legacies of the civilisations of the Indian subcontinent, the Chinese civilisation and the ancient kingdoms and empires of Southeast Asia that continue to influence our lives or can still be seenin the present day."
- **第 39 页 Key Understandings**：(1) "The features of ancient civilisations can be seen in our lives today." (2) "The legacies of the civilisations of the Indian subcontinent influence our lives today." (3) "The legacies of the Chinese civilisation influence our lives today." (4) "The legacies of the ancient kingdoms and empires of Southeast Asia have influenced the region andcan still be seen today."
- **第 39 页 Knowledge Outcomes**（"Students will be able to"）：identify the five features of a civilisation; describe examples of each feature of a civilisation; recognise that rivers influenced the beginning of the civilisations of the Indian subcontinent; evaluate how legacies of the civilisations of the Indian subcontinent continue to influence our lives today; recognise that rivers influenced the beginning of the Chinese civilisation; evaluate how legacies of the Chinese civilisation continue to influence our lives today; recognise that maritime and farming activities influenced the developmentof the ancient kingdoms and empires of SoutheastAsia; evaluate how the ancient kingdoms and empires are connected to the countries in Southeast Asia today; and identify the heritage sites found in Southeast Asia.
- **第 39 页 Key Concepts**：Civilisation · Legacy · Change and Continuity · Heritage。**Values Outcomes** 包括 "appreciate cultural diversity"、"recognise that beliefs shape one's thinking"、"consider the ethical effects of one's actions and the impact on others"（沉重内容的写法以此为锚）。
- **第 40 页 Content**：Guiding question 1 "In what ways are the features of ancient civilisations seen in our lives today?"——"Development of ancient civilisations (Sumer, Egypt, Greece and Rome)"；"The five main features of a civilisation:" 依次为 **Government / Writing / Cities with public buildings / The arts, crafts and sciences / Economic activities**。Guiding question 2（印度次大陆）："Development of the civilisations of the Indian subcontinent" · "Legacies of the civilisations of the Indian subcontinent and their influence on our lives today"。Guiding question 3（中华文明）：同样两条。
- **第 41 页 Content**：Guiding question 4 "How have the legacies of the ancient kingdoms and empires of Southeast Asia influenced our region today?"——"Development of ancient kingdoms and empires of Southeast Asia" · "Legacies of ancient kingdoms and empires of Southeast Asia:" **Funan, Srivijaya, Angkor, Majapahit, Sukhothai, Melaka** · "UNESCO World Heritage Sites in Southeast Asia"（不列名单）。
- **第 42 页 实地考察**：建议地点 Asian Civilisations Museum；目的 "understand the cultural and historical ties that have influence on the countries in Southeast Asia"、"explore how Singapore's cultural heritage has evolved over time, influenced by the diverse mix of cultures"。
- **第 43 页 表现任务**：校内展览 *Inventions of Civilisations: Then and Now*——分组找出 "three inventions of the civilisations of the Indian subcontinent or the Chinese civilisation that continue to influence our lives today"，做一张 A3 信息图。
- **第 29 页（P4）**："The story of Sang Nila Utama"——淡马锡在 P4，不在 P6 名单。
- 课纲**没有**点名任何印度河城市、阿育王、孔雀、汉朝；印度与中国的"发展"由 Atlas 选例子（本文：印度河城市、孔雀与阿育王、笈多与那烂陀；二里头、商、秦、汉）。五个特征**不是** Childe 的十条（ct-03），不要归给 Childe。2024 年 7 月更新版的链接 404，差异未知。

对应：五个特征 = 01、02、05 章各一张"五个特征"表（细看）+ 背景章总表；河流 = 03、04 章第一拍和第一段；印度与中国的遗产 = 03、04 章细看 + 08 章（表现任务的"发明"候选）；海与农 = 06（海）、07（稻与水）；连到今天的国家 = 07 细看④ + 每个东南亚事件 `summary` 写"今天在哪个国家"；世界遗产 = 08 章第 5 拍与细看③；亚洲文明博物馆 = 06 细看④、08 第 5 拍。

### 1.2 范围、读者、立场与口吻

- 时段：约公元前 3200 年（乌鲁克）到公元 1511 年（葡萄牙人攻占马六甲）；第 08 章落在 2021 年（今天的遗产）。地域：地中海、尼罗河、两河、印度次大陆、黄河长江、东南亚。
- 读者：小学高年级学生和家长。每章正文 EN 220–280 词 / ZH 380–480 字，3–4 段，细看 2–4 块；数字少而准。
- **立场（最高优先级）**：
  - **"文明"是检查表，不是排名**：五个特征是课本用来比较的工具；本主题不说哪个文明"更先进"，不说没有文字或城市的人"不文明"。背景章细看写清"文明 / 野蛮"这对词的来历（ct-02、gr-18、gr-19、ct-05、ct-06、su-23、sa-53）。
  - **全球视角、篇幅按分量**：四大河流域、地中海、东南亚各有专章；新加坡、中国只是视角之一。东南亚写东南亚人自己（南岛航海者 tr-02 需学术来源、旧马来语碑文 sa-13、高棉碑文 in-33），外人的记录（中国史书、法国学者、葡萄牙人）注明是外人。
  - **征服两边写**：胜者怎么说、被征服的人失去了什么；数字注明是谁的说法（阿育王自己的铭文、宫廷颂诗）。同类同标（§3.4）。
  - **奴隶制不只写罗马**：苏美尔、埃及、希腊、罗马各一段（研究已有），印度、中国、东南亚由 F 步找来源（秦的劳役已有 cn-20）；找不到的在 §9 记为已知差距，不用"没有写 = 没有"的暗示——背景章一句"这些社会大多有奴隶或强迫劳动"（ct-04，需非维基来源）。
  - **"最早""发明"写成"已知最早""迄今发现最早"**（su-29、cn-24、cn-25、in-30–34）。
  - **不确定就说不确定**：印度河文字、扶南一名的来历、室利佛逝的都城、夏是否存在、金字塔工人、吴哥人口、马六甲建立年份。
  - 不用"我们 / 敌人"；EN 不用 "we / our"（"the numbers we write" 改成 "the numbers written today"）。
- 用词表：

| 不写 | 写 | 说明 |
|---|---|---|
| 四大文明古国 / 人类文明的摇篮 | 四条大河流域的早期文明；"文明的摇篮"只在引用时出现 | ct-08 的"西方文明的摇篮"同样只引用 |
| 野蛮人 / 蛮夷（Atlas 自己的话） | 外族 / 别的民族；引用时加引号并写明说话人 | §0-10 |
| 苏美尔人发明了轮子 / 文字 | 已知最早的文字来自乌鲁克一带；轮子在好几个地区差不多同时出现 | su-19 不用，su-29 |
| 奴隶建造了金字塔 | 古代作者这样说；考古发现了工人村；学者仍有争论 | eg-19–21 |
| 印度河—萨拉斯瓦蒂文明 | 印度河流域文明（哈拉帕文明） | in-18、in-19 |
| 黄金时代（笈多） | 笈多时代；"黄金时代"只作有人这样称呼 | in-38 |
| 第一个泰人王国 | 素可泰王国；"第一个泰人王国"是泰国旧史学的说法 | sa-42 |
| 印度殖民东南亚 / 大印度 | 通过贸易和往来受到印度影响（印度化，学者的旧说与新说） | in-35 |
| 室利佛逝帝国统治新加坡 | 不写（sa-19 只有维基一句，可信度低） | |
| 罗马帝国灭亡 / 野蛮人入侵 | 西罗马帝国在 476 年结束（这个年份是惯例）；东罗马延续到 1453 年 | ro-07、ro-08 |
| 象形文字（单独） | 古埃及象形文字（学名圣书体） | 研究 §5 |
| 吴哥窟（指整个吴哥） | 吴哥 / 吴哥古迹；吴哥窟只指那座寺庙 | tm-29 |
| BC / AD、公元前（EN 正文） | BCE / CE；中文"公元前""公元" | ct-09–12 |

### 1.3 必须讲对的事实（施工时每条配 `<Num>` / `sources`；方括号是研究的事实 id）

来源层级：**U** = UNESCO 页面（只用事实，不抄原文，BY-SA IGO）；**M** = 博物馆 / 国家机构（Met、ACM、NHB、NLB、Bodleian）；**H** = World History Encyclopedia（二级，有错，标出）；**W** = 维基百科（三级）——**⚑ = 进正文前必须换成非维基来源**（博物馆、UNESCO、学术书、公有领域原典的英译），Sonnet F 步做，取不到就删句或改写成有来源的说法。

| # | 事实 | 写法 | 研究 | 层级 | 争议与注意 |
|---|---|---|---|---|---|
| F1 | 五个特征 | Government / Writing / Cities with public buildings / The arts, crafts and sciences / Economic activities；中文草稿"政府、文字、有公共建筑的城市、艺术工艺与科学、经济活动" | moe-05–08 | 课纲 | 没有官方中文；不归给 Childe（ct-03） |
| F2 | BCE / CE | 与 BC / AD 年数相同；约 525 年 Dionysius Exiguus 定纪元；没有公元 0 年 | ct-09–12 | W ⚑ | 背景章细看 |
| F3 | 苏美尔的位置与粮食 | 美索不达米亚南部，底格里斯河与幼发拉底河之间，农民种出余粮；前 5000–前 3000 年海水深入今天海岸线以内约 200 公里 | su-01、su-02、su-30 | W⚑ / U | 地图用今天的海岸，细看写这一句 |
| F4 | 乌鲁克 | 约前 3200 年美索不达米亚南部最大的聚落；被称作"历史上第一座城市"；全盛时**可能**多达 5 万人 | su-11、su-12、su-13 | M / W | 人口是估计，写"可能"；"第一座城市"写成"被称作" |
| F5 | 最早的文字 | 已知最早的文字出自乌鲁克和杰姆代特奈斯尔，约前 3350–前 2500 年；楔形文字最早用来写苏美尔语；起因：神庙记账（Met）/ 贸易（WHE）两说；叙利亚、土耳其可能更早就有原始楔形文字 | su-07–10、su-20 | W⚑ / M / H | 两说并列；"最早"写"已知最早" |
| F6 | 阿卡德征服 | 约前 2270 年（短年代学），阿卡德的国王征服苏美尔 | su-04、su-06 | W ⚑ | Cliopatria 可能用中年代学（约前 2334），细看"年代为什么对不上"；阿卡德城至今没找到 |
| F7 | 乌尔第三王朝 | 约前 2100–前 2000 年苏美尔人重新统治；乌尔纳姆建大塔庙（前 21 世纪）；乌尔纳姆法典是迄今发现最古老的法典 | su-05、su-14、su-16 | W ⚑ | |
| F8 | 60 进位 | 起于苏美尔（前 3 千纪），传给巴比伦，今天的时、分、秒和角度还在用；来历"不像常说的那么简单" | su-18、su-27、su-28 | H / W⚑ | 写"来自美索不达米亚"，不写"苏美尔人发明了 60 分钟" |
| F9 | 苏美尔的奴隶 | 城市使用从山地掳来的奴隶劳动；不是经济的主要部分（维基；学者对规模看法不一） | su-21、su-22 | W ⚑ | 敏感 |
| F10 | 轮子 | 轮式运输最早的间接证据是黑海以北前 4000 年以前的小泥轮 | su-29 | W ⚑ | su-19（WHE"苏美尔人发明了轮子"）**不用** |
| F11 | 衰落与世界遗产 | 前 2000 年后海退、沼泽干涸，南部大城衰落（UNESCO 的解释；征服、盐碱化另有说法）；乌鲁克、乌尔、埃利都 2016 年列入（伊拉克南部沼泽区） | su-25、su-26 | U | |
| F12 | "苏美尔"一名 | 阿卡德人的称呼，意为"文明国王之地"；苏美尔人自称 Kengir | su-23 | H ⚑ | 背景章细看 |
| F13 | 尼罗河 | 可预测的泛滥 + 灌溉 → 余粮、人口稠密；三季：泛滥、播种、收获 | eg-01、eg-16 | W ⚑ | |
| F14 | 统一 | 约前 3150 年（传统年表）上下埃及统一；实际是渐进的，"一位统一者"之说有争议；孟菲斯是第一个首都 | eg-02、eg-03、eg-05 | W⚑ / U | |
| F15 | 胡夫金字塔 | 约前 2600 年、约 26 年建成；原高 146.6 米，3,700 多年里是最高的人造建筑；古代七大奇迹中唯一大致完好的；金字塔建造在第四王朝前期达到顶峰；孟菲斯墓地 1979 年列入世界遗产 | eg-06–09、eg-18 | U / W⚑ / M | 年代与工期是现代估计（希罗多德说 20 年） |
| F16 | 谁修了金字塔 | 希罗多德说十万人轮班三个月；狄奥多罗斯把金字塔与奴隶连在一起；莱纳发现"工人村"，后来也有人认为那里住的是士兵和水手 | eg-19–21 | W ⚑ | 敏感；三说并列，不下结论 |
| F17 | 埃及的奴隶 | 今天意义上的奴隶制是否存在，学者意见不一；有三种形式：动产奴隶、债务劳役、强迫劳动 | eg-22、eg-23 | W ⚑ | 敏感 |
| F18 | 底比斯 | 中王国、新王国的首都，有卡纳克、卢克索神庙和帝王谷；1979 年列入 | eg-10 | U | |
| F19 | 古埃及象形文字 | 混合表意、表音等元素，超过 1,000 个字符；是腓尼基字母的远祖；是否独立于楔形文字产生，学者有争论 | eg-11–13 | W ⚑ | |
| F20 | 罗塞塔石碑 | 前 196 年托勒密王朝的一道诏令，三种文本；1822 年商博良在巴黎宣布破译 | eg-14、eg-15 | W ⚑ | 诏令在哪里颁布（孟菲斯）、三种文字的名称：F 步核 |
| F21 | 王朝与结束 | 马涅托把国王分成 30 个王朝；古埃及的结束有 332（亚历山大）和 30（罗马）两种算法；前 30 年成为罗马行省 | eg-04、eg-17、eg-24 | W ⚑ | |
| F22 | 历法 | 民用历一年 365 天（3 季 × 120 天 + 5 天） | eg-25 | W ⚑ | 08 章可用 |
| F23 | 印度河与河流 | 繁荣于印度河冲积平原和一组终年有水、季风补给的河流（加加尔—哈克拉一带）；范围包括今天巴基斯坦大部、印度西北、阿富汗东北；已知成熟期遗址一千多处，发掘过近一百处 | in-04–06 | W ⚑ | 课纲"河流"目标 |
| F24 | 年代 | 全期约前 3300–前 1300，成熟期前 2600–前 1900；多拉维拉约前 3000–前 1500（UNESCO） | in-01、in-03 | W⚑ / U | in-02（WHE 前 7000–前 600）**不用** |
| F25 | 城市 | 摩亨佐-达罗、哈拉帕很可能各有 3–6 万人（估计）；摩亨佐-达罗下城按严格规则布局（UNESCO 1980）；排水沟；大浴场约 12 × 7 米、深 2.4 米，用途是推测；多拉维拉的水利系统（UNESCO 2021）；与美索不达米亚、阿曼半岛有贸易 | in-07、in-08、in-10–13 | W⚑ / U | **砖**：UNESCO 说摩亨佐-达罗"全用未烧砖"，维基说"烧砖房屋"——不写"全是烧砖"（in-09、in-11） |
| F26 | 印度河文字 | 刻文极短，难判断是否记录语言；没有双语刻文；超过 400 个符号；与达罗毗荼语有关只是一种假说 | in-14–17 | W ⚑ | "还读不懂，也可能根本不是文字" |
| F27 | 衰落 | 约前 1700 年摩亨佐-达罗等大城已被废弃；原因（气候、河流改道）无定论 | in-20 | W ⚑ | |
| F28 | 名称 | "哈拉帕文明"得名于哈拉帕；"印度河—萨拉斯瓦蒂"把它连到《梨俱吠陀》的河，但地球物理研究认为加加尔—哈克拉是季风补给河，不是吠陀里雪水补给的萨拉斯瓦蒂 | in-18、in-19 | W ⚑ | 敏感（命名政治） |
| F29 | 孔雀王朝 | 约前 322 / 前 320 年建立（来源不一），到前 185 年；首都华氏城 | in-21、in-41 | H / W⚑ | |
| F30 | 羯陵伽 | 阿育王自己的铭文：15 万人被掳走、10 万人被杀、更多人死于其他原因；"深深悔恨" | in-22、in-23 | W ⚑ | 敏感；数字是国王自己的说法；战争年份（约前 261）**F 步核**；原文用 Hultzsch 1925 英译（公有领域）或 F 步找到的版本 |
| F31 | 学问之地 | 桑吉：现存最古老的佛教圣地（UNESCO 1989）；那烂陀：前 3 世纪—13 世纪，"印度次大陆最古老的大学"（UNESCO 2016 的说法）；塔克西拉：前 5 世纪—2 世纪的佛教学术中心（UNESCO 1980） | in-24–26 | U | "最古老"写成 UNESCO 的说法 |
| F32 | 笈多 | 3 世纪中叶—6 世纪中叶（起点说法不一）；"黄金时代"之称有争议；学者有阿耶波多等 | in-38–40 | W ⚑ | |
| F33 | 数字与零 | 十进位值记数由印度数学家在 1–4 世纪发明（维基）；9 世纪阿拉伯数学家采用，13 世纪经斐波那契传到欧洲；婆罗摩笈多 7 世纪定下零的运算规则；印度最早无疑的圆圈零：瓜廖尔 876 年铭文；柬埔寨一块碑上的"605"（塞种纪年 = 683 年）含零；巴克沙利手稿 2017 年"3–4 世纪"的测年有争议（各页年代不同） | in-27–34 | W⚑ / M | 08 章细看"零：谁最早"；高棉 683 年的零**连到东南亚** |
| F34 | 象棋、棉 | 象棋有记录的历史始于 7 世纪印度的恰图兰卡；摩亨佐-达罗出土前 3 千纪的棉布碎片和纺轮 | in-36、in-37 | W ⚑ | 表现任务候选 |
| F35 | 印度化 | 早期说法是"印度殖民"，后来认识到影响主要通过贸易与和平往来 | in-35 | W ⚑ | 06 细看 |
| F36 | 中国的河 | 中华文明起源于黄河、长江流域；黄河因黄土高原泥沙而黄；黄河流域约前 7000 年已种小米，长江边的栽培稻约 8,000 年前 | cn-01–05 | W ⚑ | 课纲"河流"目标；年份不进时间轴（会把轴拉到前 7000） |
| F37 | 二里头与夏 | 二里头约前 1750–前 1500（2007 年后的测年）；有宫殿和青铜作坊；中国考古学家一般认为是夏代后期；许多史家质疑夏是否存在；夏商周断代工程的年代有学者质疑 | cn-06–09 | W⚑ / H | 两边写 |
| F38 | 商与殷墟 | 商约前 1600–前 1046（惯例）；殷墟是晚商都城（前 1300–前 1046），2006 年列入 | cn-10、cn-11 | H / U | |
| F39 | 甲骨文 | 殷墟的甲骨刻辞是世界最古老的文字体系之一（UNESCO），已知最早的汉字，多是占卜记录；1920–30 年代的发掘出土两万多片 | cn-12–14 | U / W⚑ | 最早甲骨约前 1250（cn-10 注） |
| F40 | 商的人牲 | 发掘出土国家祭祀中被用作牺牲的人和动物的遗骸 | cn-15 | W ⚑ | 敏感；数字只用 F 步找到的考古报告（殷墟王陵、祭祀坑）；写法照 warring-states"人殉与人牲" |
| F41 | 周 | 前 1046–前 256；周人发展出"天命"观念 | cn-16、cn-17 | H | 链到春秋战国 |
| F42 | 秦 | 前 221 年统一；统一货币、度量衡和文字；工程用了数十万农民和刑徒的劳力；把早先的城墙连成长城（UNESCO）；兵马俑 1974 年发现；前 206 年亡 | cn-18–22、cn-32 | W⚑ / U | 劳役链到 warring-states `qin-construction-labour` |
| F43 | 发明 | "四大发明"（指南针、火药、造纸、印刷）；这个说法源自培根 1620 年的"三大发明"，有中国学者认为别的发明更重要；有字的纸可早到前 8 年，传统归功蔡伦约 105 年；已知最早有日期的印本《金刚经》868 年；火药最早确切记载 9 世纪（唐）；指南针汉代用于占卜、宋代 11 世纪用于航海；丝在新石器时代已有；丝绸之路（长安—天山廊道）前 2 世纪—1 世纪成形（UNESCO 2014） | cn-23–31 | W⚑ / U | 08 章；写"已知最早" |
| F44 | 希腊 | 一群语言文化相近的城邦，不是一个国家；城邦从前 8 世纪形成；山地占八成，河流小 | gr-01、gr-02、gr-05 | W⚑ / H | 不是大河文明 |
| F45 | 时期 | 古典时期前 480（波斯入侵）—前 323（亚历山大去世）；希腊化时期结束于前 146 / 31 / 30，说法不一 | gr-03、gr-04 | W ⚑ | |
| F46 | 雅典民主 | 克里斯提尼前 508–前 507 年的改革；只有自由的成年男性公民参加（不含未成年人、外邦人、妇女、奴隶）；成年男性公民**大概**不超过成年人口的 30% | gr-06–08 | W ⚑ | 敏感："谁算人民" |
| F47 | 卫城、德尔斐、奥林匹亚 | 卫城 1987 年列入；德尔斐前 6 世纪是希腊世界的宗教中心（UNESCO）；古代奥运会最通行的起始年前 776 年，1896 年雅典举行第一届现代奥运会 | gr-09、gr-10、gr-14、gr-15 | U / W⚑ | |
| F48 | 希腊字母 | 由腓尼基字母演变而来，已知最早系统地写元音的字母；前 9 世纪末或前 8 世纪初开始使用；是拉丁、西里尔等字母的祖先 | gr-11–13 | W ⚑ | "英文与马来文用拉丁字母"：F 步补一个来源（研究 §2.10 标为推论） |
| F49 | 希腊的奴隶 | 奴隶主要用于农业，也在采石场、矿山、家中；动产奴隶与斯巴达希洛人一类依附于土地的人要区分 | gr-16、gr-17 | W ⚑ | 敏感 |
| F50 | "野蛮人" | 希腊语原指非希腊人（语言习俗不同的外人），罗马人指罗马文化与政治圈以外的人，后来才有贬义 | gr-18、gr-19、ct-05、ct-06 | W ⚑ | 背景章细看 |
| F51 | 亚历山大 | 征服使希腊文化传到北非和西亚；前 323 年去世 | gr-03、gr-20 | W ⚑ | 去世地（巴比伦）F 步核 |
| F52 | 罗马共和 | 传说前 753 年建城（UNESCO）；传统上前 509 年推翻王政，到前 27 年；每年选两名执政官，可互相否决；与希腊直接民主大约同时；拉丁文 res publica | ro-01–05 | U / W⚑ | 509 是"传统年份" |
| F53 | 十二铜表法 | 之前法律不成文，只由上层祭司解释；约前 451–前 449（来源不一）；西塞罗说它是罗马法千年的基础 | ro-11–13 | W ⚑ | 写"约前 449" |
| F54 | 水道与道路 | 第一条水道前 312 年；水道只靠重力、沿很缓的下坡输水；加德桥约 50 米高、三层，为尼姆水道而建（UNESCO 1985）；道路"超过 40 万公里"是旧估计 | ro-14–17 | W⚑ / U | 道路数字不进正文（Itiner-e 的新数字未核） |
| F55 | 帝国 | 前 27 年元老院授屋大维"奥古斯都"称号；奥古斯都以后约 200 年称"罗马和平"；西罗马 476 年结束（惯例年份），东罗马到 1453 年 | ro-06–08、ro-26 | W ⚑ | "疆域最大在 117 年"**F 步补来源**；117 帧以 Cliopatria 为准 |
| F56 | 万神庙、罗马数字 | 万神庙穹顶是世界上最大、最古老的无钢筋混凝土穹顶；罗马数字没有零，14 世纪起被印度—阿拉伯数字取代，钟面上还在用 | ro-10、ro-18、ro-19 | W ⚑ | 08 章 |
| F57 | 罗马的奴隶 | 可以被释放并取得公民权是罗马奴隶制的特点；田间、矿山、磨坊的奴隶几乎没有机会；前 71 年斯巴达克斯被击败，奴隶起义的时期结束 | ro-20–22 | W ⚑ | 敏感；起义后的处决人数 F 步用阿庇安《内战记》1.120（公有领域英译）核，核到才写 |
| F58 | 被征服者的话 | 塔西佗借喀里多尼亚首领卡尔加库斯之口说罗马人"造出一片荒凉，却称之为和平"；卡尔加库斯是否真有其人有争议 | ro-23、ro-24 | W ⚑ | 原典：塔西佗《阿古利可拉传》第 30 章（公有领域英译）；说明这是罗马作者写的 |
| F59 | 共和国 | 新加坡是议会共和制国家 | ro-25 | W ⚑ | F 步换宪法 / 政府来源 |
| F60 | 曼荼罗 | 重叠的势力范围，不是固定的领土边界；高棉、室利佛逝、满者伯夷常被归入此类 | sa-01、sa-02 | W ⚑ | 学术来源（Wolters）F 步补 |
| F61 | 扶南 | 1–7 世纪（zh 维基：1–6 世纪）；"扶南"之名不见于任何当地文献，来自中国记录；东吴使者康泰、朱应 3 世纪中叶到过；可能是一群城邦；名称来历有争议 | sa-03–06、sa-10 | W ⚑ | 敏感（外人起名） |
| F62 | Óc Eo | 湄公河三角洲的港口，处在古运河网中；出土罗马、中国、印度物品，包括安东尼·庇护时期的罗马金章 | sa-07–09、sa-69 | W ⚑ | Óc Eo 作为遗址比扶南更早也更久（前 2 世纪—12 世纪） |
| F63 | 室利佛逝 | 义净 671 年在此住了六个月；格杜坎武吉碑 682 或 683 年（换算不一），已知最早的古马来语文字；最早在巨港一带的穆西河边建立（另有学者认为都城不在巨港）；第一个主导海岛东南亚西部的政体；新研究认为它主要是陆上政体；1920 年代经法国学者赛代斯才为人所知；1025 年朱罗多次袭击后可能瓦解 | sa-11–18、sa-68 | W ⚑ | "统治新加坡"（sa-19）不用 |
| F64 | 海路 | 海上丝绸之路连接东南亚、东亚、南亚、阿拉伯、东非与欧洲；（维基）主要由东南亚的南岛航海者建立和经营；约前 2 世纪与南亚、中东、地中海的网络连通；不只是丝；"丝绸之路"是 19 世纪末才有的名字 | tr-01–05 | W ⚑ | "南岛航海者"**必须**找到学术来源才进正文（F 步），否则写成"东南亚的航海者" |
| F65 | 黑石号 | 约 830 年沉没的阿拉伯缝合船，载唐代货物；从广州出发；1998 年在勿里洞岛附近、新加坡东南约 600 公里处发现；现藏亚洲文明博物馆（中文名"黑石号"） | tr-07–09、tm-06 | W⚑ / M | 商业打捞的伦理争议（tr-10，低可信）F 步核到才写一句 |
| F66 | 高棉 | 惯例以 802 年阇耶跋摩二世自称"转轮王"为开始，到 1431 年；"水利城市"，水网用于灌溉、弥补不稳定的季风；吴哥窟 1113–1150 年由苏利耶跋摩二世建；吴哥考古公园约 400 平方公里（UNESCO 1992）；75–100 万人口之说是研究争论；衰落原因仍有争论 | sa-20–27 | W⚑ / U | |
| F67 | 高棉与占婆 | 1145 年高棉攻取占婆都城毗阇耶；双方都打赢过（WHE）；1177 年占婆攻掠吴哥 | sa-28 | H | 1177 年 F 步补来源；两边同写 `political` |
| F68 | 1431 | 高棉反抗暹罗之后，阿瑜陀耶 1431 年攻掠吴哥 | sa-29 | W ⚑ | 敏感（今天的泰柬关系）：只写来源所说 |
| F69 | 满者伯夷 | 拉登·威查耶 1292 年建立（另说 1293 年 11 月 10 日加冕）；元军 1293 年远征爪哇，拉登·威查耶在打败查耶卡湾之后转而攻击元军；都城在特罗乌兰一带；1527 年被淡目所灭（维基） | sa-31、sa-32、sa-35、sa-37、sa-38 | W ⚑ | |
| F70 | 《爪哇史颂》 | 1365 年普腊班扎所作的宫廷颂诗；列出从苏门答腊到新几内亚的 98 个朝贡地，范围有争议；其中有 Tumasik（新加坡） | sa-33、sa-34、sa-36 | W ⚑ | 敏感：宫廷说法，画成势力范围 |
| F71 | 素可泰 | 1238 年（传统）建立；1438 年归入阿瑜陀耶；13–14 世纪是"第一个暹罗王国"的都城（UNESCO 1991 的写法）；"第一个泰人王国"是泰国旧史学说法，艺术厅已不用；兰甘亨碑文所说的范围后人读作关系网络 | sa-39–43 | U / W⚑ | 敏感（民族史叙事） |
| F72 | 马六甲 | 约 1400 年由新加坡拉的国王拜里米苏拉（伊斯坎达沙）建立（有更早的说法，Commons 地图写 1402）；15 世纪成为最重要的转口港之一；1511 年被葡萄牙攻占；马来与葡萄牙记载对新加坡拉的结局说法不同；马六甲与乔治市 2008 年列入 | sa-44–49 | W⚑ / U | 与 1819–1965 背景章一致：两种叙述并列 |
| F73 | 淡马锡 | 汪大渊约 1330 年到访，《岛夷志略》（1349 年成书）记"单马锡"；NHB：中国商人称 Danmaxi，14 世纪繁荣的港口；福康宁出土 14 世纪文物；山尼拉乌他玛是《马来纪年》里的传说人物；14 世纪起"新加坡拉"（源自梵语，狮城）取代淡马锡；满者伯夷攻打新加坡拉：《马来纪年》说被击退，另有说法是被攻陷 | sa-50–57 | W / M | 与 1819–1965 F1 的写法逐字对齐（Opus T 步）；sa-57 两说并列 |
| F74 | 东南亚世界遗产 | 婆罗浮屠（8–9 世纪，1991）、普兰巴南（10 世纪，1991）、蒲甘（11–13 世纪，2019）、班清（1992）、美山（4–13 世纪，1999）、阿瑜陀耶（约 1350 年建，1991）、瓦普（5–15 世纪，2001）、三波坡雷古（伊奢那补罗，2017）、吴哥（1992）、素可泰（1991）、马六甲（2008）、新加坡植物园（2015，殖民时期的植物园，不是古迹）；特罗乌兰、穆阿拉占碑只在印尼的预备名单；维基列出的 50 处 / 9 国是快照，UNESCO 被批评"欧洲中心" | sa-30、sa-58–67、sa-71、sa-72 | U / W⚑ | 数目印之前到 whc.unesco.org 重查 |
| F75 | 亚洲文明博物馆 | 课纲建议的实地考察地点；黑石号的货物在这里 | moe-20、tr-08 | 课纲 / M | 08 第 5 拍 |

### 1.4 争议与两边写（汇总，各章细看照此写）

| 题目 | 一边 | 另一边 | 写在哪 |
|---|---|---|---|
| 文字为什么出现 | Met：神庙要记账（su-09） | WHE：贸易（su-20）；Met 也说叙利亚、土耳其可能更早（su-10） | 01 细看② |
| 年代学 | 短年代学：阿卡德约前 2270 | 中年代学早约 60 年；Cliopatria 的年份可能不同 | 01 细看④ |
| 金字塔工人 | 希罗多德、狄奥多罗斯 | 工人村；也有人说住的是士兵水手 | 02 细看② |
| 埃及的奴隶 | 三种形式 | 是否算"今天意义上的奴隶制"，学者不一 | 02 细看③ |
| 印度河的名字 | 印度河—萨拉斯瓦蒂 | 地球物理研究：加加尔—哈克拉是季风河 | 03 细看① |
| 阿育王的数字 | 国王自己的铭文 | 这是胜者的说法，没有羯陵伽一方的记录 | 03 细看③ |
| 夏 | 中国考古学家：二里头 = 夏代后期 | 许多史家质疑夏是否存在 | 04 细看① |
| 四大发明 | 通行说法 | 来自培根的"三大发明"；有中国学者认为别的更重要；纸早于蔡伦 | 04 细看④、08 |
| 雅典民主 | 公民大会治理 | 只有不到三成成年人能参加 | 05 细看③ |
| 罗马的和平 | "罗马和平"200 年 | 塔西佗借被征服者之口；科林斯、斯巴达克斯 | 05 细看④ |
| 室利佛逝 | 海上帝国（通行） | 新研究：主要是陆上政体；都城在不在巨港 | 06 细看② |
| 印度化 | 旧说：印度殖民 | 新说：贸易与和平往来，本地人自己选择 | 06 细看③ |
| 海路由谁经营 | 南岛航海者（需学术来源） | 外人记录多来自中国、阿拉伯、印度 | 06 正文① |
| 吴哥与占婆 | 1145 高棉攻占占婆都城 | 1177 占婆攻掠吴哥 | 07 细看② |
| 满者伯夷的范围 | 《爪哇史颂》98 个属地 | 宫廷颂诗，范围有争议 | 07 细看① |
| 新加坡拉的结局 | 《马来纪年》：满者伯夷进攻被击退，末王逃往马六甲 | 皮列士：拜里米苏拉杀了新加坡的统治者；另说被攻陷 | 07 细看③（与 1819–1965 一致） |
| 零 | 巴克沙利 2017 测年"3–4 世纪" | 测年受批评，各页年代不同；有确切日期的：高棉 683、瓜廖尔 876 | 08 细看① |

### 1.5 沉重与敏感内容

- `sensitivity: open`。沉重内容讲事实和数字、不回避，用词克制；每处写清是谁说的。不用血腥图像（本主题三张图都是器物和建筑）。
- **同类同标**（地图标记）：有记录的大规模杀戮、掳掠、人牲 → `atrocity`（空心方块）：`shang-sacrifice`（-1250）、`kalinga-war`（-0261）、`corinth-destroyed-146`（-0146，F 步核到原典才建）、`spartacus-crucifixions-71`（-0071，同上）。没有伤亡记录的征服、攻城、袭击 → `political`：`akkad-conquers-sumer`、`rome-takes-egypt`、`chola-raids-1025`、`khmer-take-vijaya-1145`、`cham-sack-yasodharapura-1177`、`angkor-sacked-1431`、`melaka-falls-1511`。秦的劳役不另建事件，链到 warring-states 的 `qin-construction-labour`。若 F 步找到乌尔王陵殉葬的博物馆来源（宾大博物馆 / 大英博物馆），加 `ur-royal-tombs`（-2600，`atrocity`），写法与商的人牲相同；找不到就不写。
- 奴隶制：§1.2。每段写"谁、做什么、有没有出路"，不写"残酷""悲惨"这类评价词。
- 中文稿由 Gavin 亲审的段落：§0.2。

---

## 2. 章节计划（背景章 + 8 章）

### 2.1 总表

`cam` = `[lng, lat, zoom]`（桌面 1280×720 下的值，施工时按 `pnpm shoot --beats` 调）。图版全图约 zoom 2.6（引擎内置第一预设"全图"）；区域 4–6.5；城市 7.5–8.5（`maxZoom: 9`）。`layers` 默认 `[base, control, movements, battles, sites]` 加本章需要的势力范围层；**不写 `borders`**（区域图版本来就没有）。"帧"列 = 章节 `t` 显示的关键帧（§3.3），章节 `t` 都落在该帧日期上或之后、不早于下一帧淡入开始。

| # | id | 标题 EN / ZH | t | cam | 章节 hl | 帧 |
|---|---|---|---|---|---|---|
| 00 | background | What makes a civilisation / 什么是文明 | （`state.time` "-3200"） | 全图 | — | K1 |
| 01 | sumer | Sumer: cities between two rivers / 苏美尔：两河之间的城市 | "-3200" | 45.8, 31.6, 6.4 | `uruk-first-city` | K1 |
| 02 | egypt | Egypt: a kingdom on the Nile / 古埃及：尼罗河上的王国 | "-3150" | 31.3, 27.5, 5.2 | `egypt-unified` | K2 |
| 03 | indian-subcontinent | The Indian subcontinent: the Indus and after / 印度次大陆：从印度河说起 | "-2600" | 70.5, 27.5, 5.0 | `mohenjo-daro` | K3 |
| 04 | china | China: the Yellow River and the Yangtze / 中华文明：黄河与长江 | "-1250" | 113.0, 34.0, 5.0 | `yinxu-oracle-bones` | K6 |
| 05 | greece-and-rome | Greece and Rome: around the Mediterranean / 希腊与罗马：环地中海 | "-0508" | 22.0, 38.5, 5.4 | `athens-democracy` | K7 |
| 06 | southeast-asia-seas | Southeast Asia I: ports on the monsoon seas / 东南亚（一）：季风海上的港口 | "0150" | 105.0, 8.0, 4.6 | `oc-eo-port` | K12 |
| 07 | southeast-asia-kingdoms | Southeast Asia II: Angkor, Sukhothai, Majapahit and Melaka / 东南亚（二）：吴哥、素可泰、满者伯夷与马六甲 | "0802" | 104.0, 13.0, 5.6 | `khmer-802` | K16（空帧） |
| 08 | legacies | Still with us: legacies and heritage / 流传至今：遗产与世界遗产 | "2021" | 全图 | — | K16（空帧） |

阅读说明（背景章 `state.note`）草稿：

- EN "**What this topic covers.** Civilisations along four great rivers, around the Mediterranean and across the seas and rice plains of Southeast Asia, from about 3200 BCE to 1511 CE. 'Civilisation' here means the five features textbooks use to compare societies, not a ranking of peoples; old words such as 'barbarian' appear only in quotation marks, with the person who used them named. Conquests, slavery and sacrifice are written the same way whoever carried them out. **Numbers and dates.** Every number opens its source. Dates before about 2000 BCE are approximate and differ between experts by decades; where two dates are given in the sources, both are shown. **The map.** Land and rivers are drawn as they are today, except two old courses of the Yellow River, shown dashed. Only the states this topic discusses are coloured, and blank land was not empty. Coloured areas come from the Cliopatria dataset and are approximate: their edges are dashed. In Southeast Asia, kingdoms are shown as spheres of influence that could overlap, not as countries with borders. Places are points from Wikidata. Sea routes are schematic: the ports are real, the lines between them are not recorded tracks."
- ZH "**讲什么**：从约公元前 3200 年到公元 1511 年，四条大河沿岸、地中海周围、东南亚海上与稻田间的文明。这里的'文明'指课本用来比较各个社会的五个特征，不是给人分高下；'野蛮人'这类旧称呼只在引号里出现，并写明是谁说的。征服、奴隶制和人祭，不论是谁做的，都用同一种写法。**数字与年代**：每个数字都能点开来源。公元前 2000 年以前的年代都是约数，专家之间会差几十年；来源给出两个年份时，两个都列出。**地图**：陆地和河流按今天的样子画，只有黄河的两条古河道用虚线画出。只给本主题讲到的国家上色，空白的地方并不是没有人。色块来自 Cliopatria 数据集，范围是大致的，所以边界画成虚线。东南亚的王国画成可以互相重叠的势力范围，不是有国界的国家。地点是从维基数据读出的点。海上航线是示意：港口是真的，港口之间的线不是记录下来的航迹。"

### 2.2 各章

格式同 docs/42：**正文要点 → 细看 → 图 → 节拍（字幕 EN / ZH 草稿，日期开头、描述此刻地图上的东西）→ 事件**。字幕里的每个数字在 §1.3 有来源。东南亚事件的 `summary` 末尾写"今天在哪个国家"（课纲"连到今天的国家"）。

#### 00 background · 什么是文明

- `summary`：EN "Between about 3200 BCE and 1511 CE, people in many places built cities, wrote things down and set up governments. This topic travels from Sumer to Melaka to see how they lived and what they left behind." / ZH "约从公元前 3200 年到公元 1511 年，许多地方的人建起城市、写下文字、设立政府。这个主题从苏美尔走到马六甲，看看他们怎样生活，又留下了什么。"
- 正文：①五个特征（F1），各举一个本主题里的例子（政府 = 雅典公民大会 / 罗马执政官；文字 = 楔形文字 / 甲骨文；有公共建筑的城市 = 乌尔塔庙 / 摩亨佐-达罗大浴场；艺术工艺与科学 = 陶器、历法、零；经济活动 = 农耕与海上贸易）。②从哪里开始：四条大河流域靠泛滥和灌溉种出余粮（F3、F13、F23、F36），然后是靠海的希腊罗马（F44），再到东南亚的海峡与稻田。③年代怎么写（F2）。④这张地图怎么读（阅读说明的短版）。
- 细看：①**五个特征：一张表**（特征 · 本主题的例子 · 在哪一章）；②**谁说谁是"文明"**（F50、F12、ct-02、sa-53：希腊人、罗马人、阿卡德人、《岛夷志略》的书名；"本主题只把五个特征当检查表"）；③**公元前与公元**（F2：BCE / CE，没有公元 0 年；"公元前 3200 年"离今天约 5,200 年）；④**这张地图是怎么画的**（Cliopatria 是什么、为什么是虚线、为什么东南亚画势力范围、为什么印度河只有点；§3）。
- 节拍（3）：
  1. "-3200" · 全图（plate；无高亮）。EN "About 3200 BCE: land and rivers are drawn as they are today. The coloured areas that appear are the states this topic follows; blank land was not empty." ZH "约公元前 3200 年：陆地和河流按今天的样子画。之后出现的色块是本主题讲到的国家；空白的地方并不是没有人。"
  2. "-3200" · 全图（plate；无高亮；N 开着，河名显示）。EN "The first chapters follow four river valleys: the Tigris and Euphrates, the Nile, the Indus, and the Yellow River and Yangtze." ZH "前几章沿着四条大河流域：底格里斯河与幼发拉底河、尼罗河、印度河，以及黄河与长江。"
  3. "-3200" · `southeast-asia`（107, 4, 4.4）。EN "Later chapters turn to the Mediterranean, then to the straits and rice plains of Southeast Asia, ending at Melaka in 1511 CE." ZH "后面几章转到地中海，再到东南亚的海峡与稻田，最后停在公元 1511 年的马六甲。"
- 事件：无（背景章只用别章的点，不新建）。

#### 01 sumer · 苏美尔：两河之间的城市

- `summary`：EN "In southern Mesopotamia, between the Tigris and the Euphrates, Sumerian cities such as Uruk and Ur grew up, and the earliest known writing appeared." / ZH "在美索不达米亚南部的底格里斯河与幼发拉底河之间，兴起了乌鲁克、乌尔等苏美尔城市，已知最早的文字也出现在这里。"
- 正文：①两河与余粮；当时海岸比今天深入内陆约 200 公里（F3）。②乌鲁克：约前 3200 年最大的聚落、"第一座城市"之称、人口估计（F4）；已知最早的文字，楔形文字，为什么写（F5）。③城邦、国王与神庙；约前 2270 年阿卡德征服（F6）；约前 2100 年乌尔第三王朝：塔庙与法典（F7）。④留下的：60 进位（F8）；前 2000 年以后的衰落（F11）。
- 细看：①**五个特征在苏美尔**（表：政府 = 城邦与国王、乌尔纳姆；文字 = 楔形文字；有公共建筑的城市 = 乌鲁克、乌尔塔庙；艺术工艺科学 = 60 进位、F 步补一项工艺；经济 = 灌溉农业与贸易）；②**文字为什么出现：两种说法**（F5）；③**谁在干活**（F9）与**轮子是谁发明的**（F10）；④**年代为什么对不上**（F6、su-06：几种年代学；地图色块按 Cliopatria 的年份）。
- 图：首页图（塔庙）不在章内重复。
- 节拍（4）：
  1. "-3200" · `mesopotamia`（45.8, 31.6, 6.4；hl `uruk-first-city`）。EN "About 3200 BCE: Uruk is the largest settlement in southern Mesopotamia. The earliest known writing comes from cities like it." ZH "约公元前 3200 年：乌鲁克是美索不达米亚南部最大的聚落。已知最早的文字就出自这样的城市。"
  2. "-2600" · 同上（hl `site-ur`、`site-lagash`、`site-kish`、`site-nippur`）。EN "About 2600 BCE: Ur, Lagash, Kish and other Sumerian cities are city-states, each with its own ruler and temples." ZH "约公元前 2600 年：乌尔、拉格什、基什等苏美尔城市各自成为城邦，有自己的统治者和神庙。"
  3. "-2270" · （44.5, 32.5, 5.4；hl `akkad`、`akkad-conquers-sumer`）。EN "About 2270 BCE: the kings of Akkad, to the north, conquer the Sumerian cities and rule them as one empire." ZH "约公元前 2270 年：北边阿卡德的国王征服了苏美尔各城，把它们并入一个帝国。"
  4. "-2100" · `mesopotamia`（hl `ur-nammu-law`、`sumer`）。EN "About 2100 BCE: Sumerian kings rule again from Ur. Ur-Nammu builds the great ziggurat, and the oldest law code yet found carries his name." ZH "约公元前 2100 年：苏美尔人的国王重新从乌尔统治。乌尔纳姆王建起大塔庙；迄今发现最古老的法典也以他命名。"
- 事件：`uruk-first-city` · "-3200" · 乌鲁克 · milestone · 3；`akkad-conquers-sumer` · "-2270" · 尼普尔（`detail`：阿卡德城至今没有找到，标记放在苏美尔中部的尼普尔）· political · 2；`ur-nammu-law` · "-2100" · 乌尔 · milestone · 3（塔庙 + 法典）；`site-ur`、`site-lagash`、`site-kish`、`site-nippur`、`site-eridu` · site（乌尔、埃利都的 `detail` 写 2016 年列入世界遗产）。

#### 02 egypt · 古埃及：尼罗河上的王国

- `summary`：EN "The Nile's yearly flood watered a narrow valley. From about 3150 BCE Egypt was one kingdom ruled by pharaohs, until it became a Roman province in 30 BCE." / ZH "尼罗河每年泛滥，灌溉狭长的河谷。约公元前 3150 年起，埃及成为由法老统治的王国，直到公元前 30 年成为罗马的行省。"
- 正文：①泛滥、三季、余粮（F13）。②统一与孟菲斯（F14）；法老与 30 个王朝（F21）。③金字塔（F15）与底比斯的神庙（F18）。④古埃及象形文字（F19）、罗塞塔石碑与商博良（F20）；365 天的历（F22）；结束：前 332 与前 30（F21）。
- 细看：①**五个特征在埃及**（表）；②**谁修了金字塔**（F16）；③**埃及有没有奴隶**（F17）；④**埃及"结束"于哪一年**（F21：托勒密王朝是马其顿希腊人的王朝；两种算法）。
- 节拍（5）：
  1. "-3150" · `nile-valley`（31.3, 27.5, 5.2；hl `egypt-unified`）。EN "About 3150 BCE: Upper Egypt, the valley, and Lower Egypt, the delta, become one kingdom. Memphis, near the delta, is its first capital." ZH "约公元前 3150 年：上埃及（河谷）和下埃及（三角洲）合成一个王国，三角洲附近的孟菲斯是第一个首都。"
  2. "-2600" · 吉萨（31.2, 29.9, 7.6；hl `great-pyramid`）。EN "About 2600 BCE: the Great Pyramid is built at Giza in about 26 years. At 146.6 metres, it stays the tallest human-made structure for more than 3,700 years." ZH "约公元前 2600 年：吉萨的胡夫金字塔用了大约 26 年建成。它高 146.6 米，此后 3,700 多年一直是世界上最高的人造建筑。"
  3. "-1250" · （32.0, 25.0, 4.8；hl `egypt`、`site-thebes`）。EN "About 1250 BCE: in the New Kingdom, Thebes in the south, with the temples of Karnak and Luxor, is one of Egypt's capitals." ZH "约公元前 1250 年：新王国时期，南方的底比斯是埃及的都城之一，那里有卡纳克和卢克索的神庙。"（"都城之一"的说法 F 步核）
  4. "-0196" · （30.5, 30.5, 6.0；hl `rosetta-decree`）。EN "196 BCE: a decree of the Ptolemaic king is written in three scripts on one stone, later found at Rosetta. It helped Champollion read hieroglyphs in 1822." ZH "公元前 196 年：托勒密王朝国王的一道诏令，用三种文字刻在同一块石碑上；石碑后来在罗塞塔被发现，1822 年商博良借助它读懂了古埃及象形文字。"
  5. "-0030" · （29.9, 31.2, 6.0；hl `rome-takes-egypt`）。EN "30 BCE: after the defeat of Mark Antony and Queen Cleopatra, Egypt becomes a province of Rome." ZH "公元前 30 年：马克·安东尼和克娄巴特拉女王战败，埃及成为罗马的一个行省。"
- 事件：`egypt-unified` · "-3150" · 孟菲斯 · political · 3；`great-pyramid` · "-2600" · 吉萨 · milestone · 3（`detail`：F16 三说）；`site-thebes` · site（1979）；`rosetta-decree` · "-0196" · 孟菲斯（颁布地 F 步核；核不到改锚罗塞塔 / 拉希德，Wikidata 读坐标）· milestone · 2；`rome-takes-egypt` · "-0030" · 亚历山大 · political · 2。

#### 03 indian-subcontinent · 印度次大陆：从印度河说起

- `summary`：EN "Rivers fed the first cities of the Indian subcontinent: by about 2600 BCE, planned brick cities stood along the Indus and other monsoon-fed rivers. Later kingdoms on the Ganges plain built centres of Buddhist learning." / ZH "印度次大陆最早的城市靠河流养活：约公元前 2600 年，印度河和其他季风河流沿岸已有规划整齐的砖城。后来，恒河平原上的王国建起了佛教的学术中心。"
- 正文：①河流怎样养活城市（F23）；城市、排水、大浴场、棉布、与两河的贸易（F25、F34）。②还读不懂的文字（F26）；约前 1900 年起衰落（F27）。③孔雀王朝、华氏城、阿育王征服羯陵伽与悔恨（F29、F30）。④笈多时代、那烂陀与塔克西拉（F31、F32）；数字与零留到第 08 章（`<FlyTo>` 不用，写"见第 08 章"）。
- 细看：①**河流与一条河的两个名字**（F23、F28）；②**一种还读不懂的文字**（F26）；③**羯陵伽：国王自己写下的数字**（F30；原文译文一句，注明是胜者的记录、羯陵伽一方没有留下记载）；④**遗产：棉、象棋、零**（F33、F34，指向 08 章与表现任务）。
- 图：`ancient-civilisations-indus-bath`（§7），放在细看①之后。
- 节拍（5）：
  1. "-2600" · `indus-valley`（70.5, 27.5, 5.0；hl `mohenjo-daro`、`site-harappa`、`site-dholavira`）。EN "About 2600 BCE: planned brick cities stand on the plains of the Indus and nearby rivers. Over a thousand sites of this period are known; about a hundred have been dug." ZH "约公元前 2600 年：印度河及附近河流的平原上，出现规划整齐的砖城。这一时期的遗址已知一千多处，发掘过的大约一百处。"
  2. "-2600" · 摩亨佐-达罗（68.14, 27.33, 8.0；hl `mohenjo-daro`）。EN "Mohenjo-daro: a lower town laid out by strict rules, drains along the streets, and the Great Bath, a brick tank about 12 by 7 metres." ZH "摩亨佐-达罗：下城按严格的规则布局，街边有排水沟，还有约 12 米长、7 米宽的砖砌大浴场。"
  3. "-1900" · `indus-valley`（hl `indus-decline`）。EN "About 1900 BCE: the great Indus cities begin to decline; by about 1700 BCE Mohenjo-daro has been abandoned. Why is still debated." ZH "约公元前 1900 年：印度河的大城市开始衰落，约公元前 1700 年摩亨佐-达罗已被废弃。原因至今仍有争论。"
  4. "-0261" · （82.0, 23.0, 4.4；hl `maurya`、`kalinga-war`）。EN "About 261 BCE: the Maurya king Ashoka conquers Kalinga. In his own inscription he counts 100,000 killed and 150,000 carried away, and says he feels deep remorse." ZH "约公元前 261 年：孔雀王朝的阿育王征服羯陵伽。他在自己的铭文里说，十万人被杀、十五万人被掳走，并表示深深悔恨。"
  5. "0400" · （80.0, 24.0, 4.4；hl `gupta`、`site-nalanda`）。EN "About 400 CE: the Gupta kings rule much of northern India. Scholars of this age include the mathematician Aryabhata; Nalanda becomes a great Buddhist university." ZH "约公元 400 年：笈多王朝统治印度北部的大片地方。这个时代的学者有数学家阿耶波多；那烂陀成为著名的佛教学府。"（那烂陀"成为"的年代 F 步核：UNESCO 只给前 3 世纪—13 世纪）
- 事件：`mohenjo-daro` · "-2600" · 摩亨佐-达罗 · milestone · 3（`detail`：1980 年列入；砖的两种说法）；`site-harappa`、`site-dholavira`（2021 年列入）· site；`indus-decline` · "-1900" · 摩亨佐-达罗 · milestone · 2；`maurya-founded` · "-0320" · 华氏城 · political · 2（`detail`：322 / 320 两说）；`kalinga-war` · "-0261" · 道里（Dhauli，阿育王铭文所在地，Wikidata 读坐标，F 步核）· atrocity · 3（`casualties` 只在核到原典后写，并注明"阿育王自己的数字"）；`site-sanchi`、`site-taxila`、`site-nalanda` · site。

#### 04 china · 中华文明：黄河与长江

- `summary`：EN "Chinese civilisation began in the basins of the Yellow River and the Yangtze. The late Shang kings at Yin Xu left the oldest known Chinese writing; in 221 BCE Qin united the Zhou-era states." / ZH "中华文明起源于黄河和长江流域。晚商在殷墟留下已知最早的汉字；公元前 221 年，秦统一了周代的各诸侯国。"
- 正文：①两条河：黄土与小米、长江与稻（F36）。②二里头与夏的问题（F37）；商、殷墟、甲骨文（F38、F39）；祭祀（F40，一句，细看展开）。③周与"天命"（F41）；东周五百年的故事见 `<TopicLink slug="warring-states" ch="eastern-zhou">`；前 221 年秦统一、统一文字度量衡、长城、兵马俑、数十万人的劳役（F42，`<TopicLink slug="warring-states" ch="qin-conquest">`、`ch="after-221"`）。④汉与纸、丝绸之路（F43）；"四大发明"留到第 08 章。
- 细看：①**夏：有没有这个朝代**（F37）；②**甲骨上的问题**（F39：占卜，问天气、收成、战事——内容 F 步核）；③**商王的祭祀**（F40）；④**"四大发明"是怎么来的**（F43）。
- 节拍（4）：
  1. "-1750" · `china-plain`（112.6, 34.6, 5.6；hl `erlitou`）。EN "About 1750 BCE: at Erlitou, near the Yellow River, a town has palace buildings and bronze workshops. Many Chinese archaeologists link it to the Xia dynasty of later histories." ZH "约公元前 1750 年：黄河边的二里头有宫殿建筑和青铜作坊。不少中国考古学家把它和后代史书里的夏朝联系起来。"
  2. "-1250" · 殷墟（114.3, 36.1, 6.4；hl `yinxu-oracle-bones`、`shang`）。EN "About 1250 BCE: at Yin Xu, the late Shang capital near today's Anyang, questions put to the ancestors are carved on oracle bones: the oldest Chinese writing known." ZH "约公元前 1250 年：在晚商都城殷墟（今安阳附近），向祖先占问的问题被刻在甲骨上，这是已知最早的汉字。"
  3. "-0221" · （110.0, 33.0, 4.4；hl `qin`、`qin-unifies`）。EN "221 BCE: Qin conquers the last of the other states and rules one empire, with the same writing, weights, measures and coins everywhere." ZH "公元前 221 年：秦灭掉最后一个诸侯国，建立统一的帝国，各地用同样的文字、度量衡和货币。"
  4. "0105" · （110.0, 34.0, 4.6；hl `paper-han`、`han`）。EN "105 CE: by tradition, the court official Cai Lun presents paper to the Han emperor, though paper with writing on it is known from more than a century earlier." ZH "公元 105 年：按传统说法，宦官蔡伦向汉朝皇帝献上纸；不过，写有字的纸早在一百多年前就有了。"
- 事件：`erlitou` · "-1750" · 二里头 · milestone · 2；`yinxu-oracle-bones` · "-1250" · 殷墟 · milestone · 3（`detail`：2006 年列入；两万多片）；`shang-sacrifice` · "-1250" · 殷墟 · atrocity · 2（`summary` 一句、`detail` 写数字只引 F 步找到的考古报告）；`qin-unifies` · "-0221" · 咸阳 · political · 3（`detail` 链到春秋战国）；`site-qin-mausoleum` · site（1987；兵马俑 1974 年发现）；`paper-han` · "0105" · 洛阳（东汉都城，F 步核蔡伦在洛阳）· milestone · 2；`site-changan` · site（丝绸之路 2014）。

#### 05 greece-and-rome · 希腊与罗马：环地中海

- `summary`：EN "Greece and Rome grew up around a sea, not a great river. Athens tried rule by its citizens; Rome, first a republic and then an empire, spread its law, roads and aqueducts around the Mediterranean." / ZH "希腊和罗马靠的是海，不是大河。雅典尝试由公民治理；罗马先是共和国，后来成为帝国，把法律、道路和水道带到地中海各地。"
- 正文：①山多、河小、城邦与殖民（F44、F45）。②雅典民主与"谁算公民"（F46）；字母（F48）、卫城与德尔斐（F47）；波斯与亚历山大（F51）。③罗马共和：执政官、十二铜表法（F52、F53）；水道（F54）；帝国与"罗马和平"（F55）；奴隶与被征服者（F57、F58）。④476 年与 1453 年（F55）；罗马数字、共和国一词留到 08 章。
- 细看：①**五个特征：希腊**（表）；②**五个特征：罗马**（表）；③**谁算"人民"**（F46、F49、F57）；④**被征服者怎么说**（F58；F 步核到原典后加科林斯 146 与斯巴达克斯 71 各一句）。
- 图：`ancient-civilisations-greek-pottery` 放在细看①之后；`ancient-civilisations-roman-aqueduct` 放在细看②之后（§7）。
- 节拍（5）：
  1. "-0508" · `mediterranean`（22.0, 38.5, 5.4；hl `athens-democracy`、`achaemenid`）。EN "508–507 BCE: reforms in Athens begin rule by an assembly of citizens, and only free adult men count as citizens. To the east lies the Persian Empire." ZH "公元前 508 至前 507 年：雅典的改革开始由公民大会治理，只有自由的成年男子才算公民。东边是波斯帝国。"
  2. "-0449" · 罗马（12.5, 41.9, 6.0；hl `twelve-tables`、`rome`）。EN "About 449 BCE: Rome, a small republic that elects two consuls every year, writes its laws down for the first time, in the Twelve Tables." ZH "约公元前 449 年：罗马还是个小共和国，每年选出两名执政官；这时它第一次把法律写下来，就是十二铜表法。"
  3. "-0323" · （40.0, 33.0, 3.6；hl `macedon`、`alexander-dies-323`）。EN "323 BCE: when Alexander of Macedon dies, his conquests reach from Greece and Egypt to the Indus." ZH "公元前 323 年：马其顿的亚历山大去世时，他征服的地方从希腊、埃及一直到印度河。"（范围以 K8 的 Cliopatria 多边形为准，T 步核字幕）
  4. "-0312" · 罗马（12.5, 41.9, 7.0；hl `first-aqueduct`）。EN "312 BCE: Rome's first aqueduct is built. Aqueducts carried water by gravity alone, down a gentle slope." ZH "公元前 312 年：罗马建成第一条水道。水道只靠重力，沿着很缓的下坡把水送进城。"
  5. "0117" · （15.0, 40.0, 3.8；hl `rome`）。EN "117 CE: the Roman Empire is at its largest, from Britain to Egypt and Mesopotamia." ZH "公元 117 年：罗马帝国疆域最大，从不列颠一直到埃及和美索不达米亚。"（"最大"F 步补来源）
- 事件：`athens-democracy` · "-0508" · 雅典 · political · 3（`detail`：卫城 1987 年列入）；`twelve-tables` · "-0449" · 罗马 · political · 2；`alexander-dies-323` · "-0323" · 巴比伦（F 步核）· political · 2；`first-aqueduct` · "-0312" · 罗马 · milestone · 2；`corinth-destroyed-146` · "-0146" · 科林斯 · atrocity · 2（**只在 F 步取到原典时建**）；`spartacus-crucifixions-71` · "-0071" · 卡普阿（F 步核地点）· atrocity · 2（同上）；`augustus-27` · "-0027" · 罗马 · political · 2；`rome-west-ends` · "0476" · 罗马 · political · 2（`detail`：476 是惯例年份；东罗马到 1453）；`site-delphi`、`site-olympia`（古代奥运会）、`site-sparta`（希洛人）、`site-pont-du-gard`（1985）、`site-pantheon` · site；`olympics-revived-1896`（见 08）。

#### 06 southeast-asia-seas · 东南亚（一）：季风海上的港口

- `summary`：EN "Ships sailing with the monsoon winds linked Southeast Asia with India and China. Funan's port at Óc Eo, and later Srivijaya on the Strait of Malacca, grew rich on this trade." / ZH "随季风航行的船，把东南亚和印度、中国连在一起。扶南的港口 Óc Eo（俄厄），以及后来马六甲海峡边的室利佛逝，都靠这条海路兴盛。"（"季风航行"F 步补来源：ACM / NHB）
- 正文：①海路与谁在航行（F64；南岛航海者一句只在有学术来源时写）。②扶南：中国史书里的名字、康泰与朱应、Óc Eo 的运河与罗马金章（F61、F62）。③室利佛逝：义净、格杜坎武吉碑、穆西河、海上还是陆上、1920 年代"重新发现"、朱罗袭击（F63）；印度的影响是怎样来的（F35）。④黑石号（F65）——课纲建议去看的亚洲文明博物馆。
- 细看：①**"扶南"是谁起的名字**（F61）；②**一千年后才被"重新发现"的室利佛逝**（F63：都城之争、海陆之争）；③**印度化：殖民还是贸易**（F35）；④**黑石号：在亚洲文明博物馆**（F65、F75）。
- 节拍（5）：
  1. "0150" · `southeast-asia`（105.0, 8.0, 4.6；hl `oc-eo-port`、`monsoon-routes`）。EN "2nd century CE: Óc Eo, a port linked by canals in the Mekong Delta, holds goods from Rome, India and China, among them Roman gold medallions. The sea route is schematic." ZH "公元 2 世纪：湄公河三角洲上有运河相连的港口 Óc Eo（俄厄），出土了来自罗马、印度和中国的物品，其中有罗马金章。航线是示意。"
  2. "0250" · （105.0, 11.0, 6.0；hl `funan-envoys-250`）。EN "Mid-3rd century CE: two envoys from China, Kang Tai and Zhu Ying, stay in a land Chinese records call Funan. What its own people called it is not known." ZH "公元 3 世纪中叶：中国派出的使者康泰、朱应，在中国史书称为'扶南'的地方住过一段时间。当地人自己怎样称呼这里，今天已不知道。"
  3. "0683" · （104.0, -1.0, 5.6；layers + `srivijaya-sphere`；hl `yijing-srivijaya-671`、`kedukan-bukit-683`）。EN "671–683 CE: the Chinese monk Yijing stays six months in Srivijaya; near Palembang, an inscription of 682 or 683, the oldest known writing in Old Malay, records its early years." ZH "公元 671 至 683 年：中国僧人义净在室利佛逝住了六个月；巨港附近一块 682 或 683 年的碑，是已知最早的古马来语文字，记下了它早年的事。"（碑文内容 F 步核）
  4. "0830" · （110.0, 6.0, 4.6；layers + `srivijaya-sphere`；hl `belitung-wreck`、`belitung-voyage`）。EN "About 830 CE: an Arab ship with a cargo from China sails from Guangzhou and sinks off Belitung, about 600 kilometres south-east of Singapore." ZH "约公元 830 年：一艘载着中国货物的阿拉伯船从广州出发，在离新加坡东南约 600 公里的勿里洞岛附近沉没。"
  5. "1025" · （95.0, 5.0, 3.8；layers + `srivijaya-sphere`；hl `chola-raids-1025`、`chola-raids`）。EN "1025 CE: the Chola kingdom of southern India raids Srivijaya's ports. Srivijaya may have broken apart after this." ZH "公元 1025 年：印度南部的朱罗王朝袭击室利佛逝的港口，室利佛逝此后可能就此瓦解。"
- 事件：`oc-eo-port` · "0150" · Óc Eo · milestone · 2（`summary` 末："today in Viet Nam / 今天在越南"）；`funan-envoys-250` · "0250" · 吴哥波雷（`detail`：扶南的都城不能确定，标记放在扶南时期的聚落吴哥波雷；今天在柬埔寨）· political · 2；`yijing-srivijaya-671` · "0671" · 巨港 · milestone · 2；`kedukan-bukit-683` · "0683" · 巨港 · milestone · 3（`detail`：682 / 683；今天在印度尼西亚）；`belitung-wreck` · "0830" · 沉船点（Wikidata 若无，用勿里洞岛的点并写"附近"）· milestone · 2；`chola-raids-1025` · "1025" · 巨港 · political · 2；`khmer-zero-683` · "0683" · 三波（桔井省，K-127 碑出土地，Wikidata / F 步核）· milestone · 2（08 章用）；`site-muaro-jambi`（预备名单）、`site-borobudur`（1991）、`site-prambanan`（1991）· site。

#### 07 southeast-asia-kingdoms · 东南亚（二）：吴哥、素可泰、满者伯夷与马六甲

- `summary`：EN "On the plains, kingdoms grew rice with stored water, and Angkor's reservoirs fed a great city. By the sea, Majapahit in Java and then Melaka on the Strait drew traders and tribute, until the Portuguese took Melaka in 1511." / ZH "在平原上，王国靠蓄水种稻，吴哥的水库养活了一座大城。在海边，爪哇的满者伯夷、后来海峡边的马六甲，吸引商人、接受朝贡，直到 1511 年葡萄牙人攻占马六甲。"
- 正文：①吴哥：802 年、水利城市、吴哥窟、人口之争；与占婆互有攻伐（1145、1177）；1431 年阿瑜陀耶攻掠吴哥（F66–F68）。②素可泰：约 1238 年、碑文与"第一个泰人王国"的说法、1438 年归入阿瑜陀耶（F71）。③满者伯夷：1292/1293 年与元军、特罗乌兰、1365 年的《爪哇史颂》（F69、F70）。④马六甲：约 1400 年来自新加坡拉的拜里米苏拉、转口港、1511 年（F72）；淡马锡见细看③。
- 细看：①**为什么画成"势力范围"**（F60、F70、F71：曼荼罗；98 个属地是宫廷颂诗的说法；兰甘亨碑文的范围）；②**吴哥与占婆：两边都打赢过**（F67）；③**淡马锡**（F73：不是本章六个王国之一；汪大渊、《爪哇史颂》、福康宁；山尼拉乌他玛的故事见 `<TopicLink slug="singapore-1819-1965" ch="background">`；满者伯夷攻打新加坡拉的两说）；④**古代王国与今天的国家**（表：扶南 → 柬埔寨、越南南部；室利佛逝 → 印度尼西亚（苏门答腊）及马来半岛一部分；吴哥 → 柬埔寨；满者伯夷 → 印度尼西亚（爪哇）；素可泰 → 泰国；马六甲 → 马来西亚；每行一个今天还看得到的东西，如马来语的旧马来语碑文、素可泰历史公园——每项 F 步配来源，没有来源的格留空）。
- 节拍（5）：
  1. "0802" · （104.0, 13.0, 5.6；layers + `khmer-sphere`；hl `khmer-802`）。EN "802 CE: the Khmer king Jayavarman II proclaims himself universal ruler, the usual starting date of the Khmer Empire. The shaded area is its approximate sphere, not a border." ZH "公元 802 年：高棉国王阇耶跋摩二世自称'转轮王'，通常以这一年为高棉帝国的开始。浅色区域是它大致的势力范围，不是国界。"
  2. "1150" · 吴哥（103.87, 13.42, 8.5；layers + `khmer-sphere`；hl `angkor-wat`）。EN "1113–1150 CE: Angkor Wat is built. Around the city, reservoirs and canals store the monsoon rain and spread it over the rice fields." ZH "公元 1113 至 1150 年：吴哥窟建成。城的周围，水库和水渠储存季风雨水，再把水分到稻田里。"
  3. "1365" · （108.0, 2.0, 4.0；layers + `khmer-sphere`、`majapahit-sphere`；hl `nagarakretagama-1365`、`sukhothai-founded`）。EN "1365 CE: a court poem of Majapahit in East Java lists 98 tributary places, among them Tumasik, an old name for Singapore. To the north, Sukhothai has been a kingdom since about 1238." ZH "公元 1365 年：东爪哇满者伯夷的宫廷长诗列出 98 个朝贡之地，其中有新加坡的旧名'淡马锡'。北方的素可泰，大约从 1238 年起就是一个王国。"
  4. "1400" · `straits`（102.5, 1.8, 6.6；layers + `majapahit-sphere`、`melaka-sphere`；hl `melaka-founded`、`site-temasek`）。EN "About 1400 CE: Parameswara, who came from Singapura, founds Melaka. It grows into one of the great trading ports of its time." ZH "约公元 1400 年：来自新加坡拉的拜里米苏拉建立马六甲，它发展成当时最重要的转口港之一。"
  5. "1511" · 马六甲（102.25, 2.19, 7.0；layers + `melaka-sphere`；hl `melaka-falls-1511`）。EN "1511 CE: Portuguese forces take Melaka. Its royal family moves south and goes on ruling from the Johor River." ZH "公元 1511 年：葡萄牙军队攻占马六甲，王室南迁，在柔佛河一带继续统治。"（与 1819–1965 背景章一致）
- 事件：`khmer-802` · "0802" · 荔枝山（Phnom Kulen，Wikidata 读坐标；核不到改锚吴哥）· political · 2；`angkor-wat` · "1113"（until "1150"）· 吴哥窟 · milestone · 3（`detail`：吴哥 1992 年列入；吴哥 / 吴哥窟两个词）；`khmer-take-vijaya-1145` · "1145" · 毗阇耶（Wikidata 读坐标）· political · 1；`cham-sack-yasodharapura-1177` · "1177" · 吴哥 · political · 1（F 步来源）；`sukhothai-founded` · "1238" · 素可泰 · political · 2；`majapahit-founded` · "1293" · 特罗乌兰 · political · 2（`detail`：1292 / 1293；元军与拉登·威查耶）；`nagarakretagama-1365` · "1365" · 特罗乌兰 · milestone · 3；`melaka-founded` · "1400" · 马六甲 · political · 3（`detail`：约 1400，另有 1402 等说法；两种关于新加坡拉结局的记载）；`angkor-sacked-1431` · "1431" · 吴哥 · political · 2；`sukhothai-to-ayutthaya-1438` · "1438" · 素可泰 · political · 1；`melaka-falls-1511` · "1511" · 马六甲 · political · 3；`site-temasek` · site（坐标 [103.847, 1.29444]，与 1819–1965 的 `site-fort-canning-temasek` 相同；文字本主题自写，`detail` 链过去）；`site-ayutthaya`、`site-bagan`、`site-my-son`、`site-vat-phou`、`site-sambor-prei-kuk`、`site-ban-chiang` · site（08 章用）。

#### 08 legacies · 流传至今：遗产与世界遗产

- `summary`：EN "Sixty minutes in an hour, the letters of the alphabet, the zero in written numbers, written laws, paper: much of what these civilisations made is still in use, and many of their places are now protected as World Heritage Sites." / ZH "一小时 60 分钟、字母、写数字用的零、成文的法律、纸——这些文明创造的许多东西今天还在用；它们的许多遗址如今是受到保护的世界遗产。"
- 正文：①写下来：楔形文字、圣书体、甲骨文、古马来文；字母从埃及符号经腓尼基、希腊传到拉丁（F5、F19、F39、F48、F63）。②数：60 进位（F8）、罗马数字没有零（F56）、十进位值与零（F33）。③法律与政府：乌尔纳姆法典、十二铜表法、雅典公民大会；新加坡是共和国，republic 来自 res publica（F7、F46、F52、F53、F59）。④发明（表现任务的候选）：纸、印刷、火药、指南针、丝；棉、象棋（F43、F34）。⑤遗址：东南亚的世界遗产、没列入的、新加坡唯一的一处（F74、F75）。
- 细看：①**零：谁"最早"**（F33）；②**字母是怎样传下来的**（F19、F48）；③**东南亚的世界遗产**（表：遗址 · 今天在哪个国家 · 哪个王国 / 时代 · 列入年份；下附"没列入的"与"欧洲中心"的批评，F74）；④**到亚洲文明博物馆看什么**（F75、F65；只写黑石号与课纲建议，不编展厅内容）。
- 节拍（5，全部 `t: "2021"`，`layers: [base, battles, sites, movements]`，不开势力范围层）：
  1. 全图（plate；hl `uruk-first-city`、`rosetta-decree`、`yinxu-oracle-bones`、`kedukan-bukit-683`）。EN "Writing: cuneiform at Uruk, hieroglyphs in Egypt, oracle bones at Yin Xu, Old Malay near Palembang. The letters of English and Malay go back, through Latin and Greek, to Egyptian signs." ZH "文字：乌鲁克的楔形文字、埃及的象形文字、殷墟的甲骨文、巨港附近的古马来文。英文和马来文用的字母，经过拉丁、希腊字母，可以追溯到埃及的符号。"
  2. （85.0, 18.0, 3.2；hl `gwalior-zero-876`、`khmer-zero-683`、`uruk-first-city`）。EN "Numbers: the sixty minutes of an hour come from counting in sixties in Mesopotamia. The zero now written in every number is found in a Khmer inscription of 683 CE and at Gwalior in India in 876." ZH "数字：一小时 60 分钟，来自美索不达米亚以 60 为单位的计数。今天每个数字里都可能写到的零，见于公元 683 年的高棉碑文和公元 876 年印度瓜廖尔的铭文。"
  3. （25.0, 35.0, 3.4；hl `ur-nammu-law`、`twelve-tables`、`athens-democracy`）。EN "Laws and government: Ur-Nammu's law code, Rome's Twelve Tables and the citizens' assembly of Athens. Singapore is a republic, a word from the Latin res publica." ZH "法律与政府：乌尔纳姆法典、罗马的十二铜表法、雅典的公民大会。新加坡是共和国，republic 一词来自拉丁文 res publica。"
  4. （100.0, 30.0, 3.6；hl `paper-han`、`diamond-sutra-868`、`mohenjo-daro`）。EN "Inventions: paper by the Han dynasty, the oldest dated printed book in 868 CE, the compass and gunpowder from China; cotton cloth from the Indus cities; chess from India." ZH "发明：汉代的纸、公元 868 年已知最早有日期的印本书、中国的指南针和火药；印度河城市的棉布；印度的象棋。"
  5. `southeast-asia`（105.0, 6.0, 4.4；hl `angkor-wat`、`site-borobudur`、`sukhothai-founded`、`melaka-founded`、`site-sg-botanic-gardens`、`site-acm`）。EN "Heritage: Angkor, Borobudur, Sukhothai and Melaka are World Heritage Sites. Singapore's one site, the Botanic Gardens, is from colonial times; the Belitung ship's cargo is at the Asian Civilisations Museum." ZH "遗产：吴哥、婆罗浮屠、素可泰和马六甲都是世界遗产。新加坡唯一的世界遗产新加坡植物园来自殖民时期；黑石号的货物在亚洲文明博物馆。"
- 事件：`gwalior-zero-876` · "0876" · 瓜廖尔查图尔布杰神庙（Wikidata）· milestone · 2；`diamond-sutra-868` · "0868" · 敦煌（藏经洞 / 莫高窟，Wikidata）· milestone · 2；`olympics-revived-1896` · "1896" · 雅典 · milestone · 1；`site-sg-botanic-gardens` · site（2015）；`site-acm` · site（亚洲文明博物馆，Wikidata 读坐标）。

### 2.3 数据清单汇总

- **实体**（`entities.json`，20 个，全部 `bloc: neutral`，`color` 由 `colour-holders.ts` 给控制区实体分配，其余手工指定，§3.6）：
  - 控制区（12）：`sumer`（Sumerian city-states / 苏美尔城邦，K1–K5）、`akkad`（Akkadian Empire / 阿卡德帝国）、`egypt`（Egypt / 埃及，含托勒密王朝）、`achaemenid`（Persian Empire / 波斯帝国，语境）、`macedon`（Alexander's empire / 亚历山大帝国，语境）、`rome`（Rome / 罗马）、`maurya`（Magadha and the Maurya Empire / 摩揭陀与孔雀王朝）、`gupta`（Gupta Empire / 笈多王朝）、`shang`（Shang / 商）、`zhou-states`（Zhou-era states / 周代诸侯国）、`qin`（Qin / 秦）、`han`（Han / 汉）。
  - 东南亚（6，非控制区；四个有势力范围层）：`funan`、`srivijaya`、`khmer`、`sukhothai`、`majapahit`、`melaka`。
  - 航线持有者（2）：`traders`（Sea traders of many peoples / 各族海上商人）、`chola`（Chola kingdom / 朱罗王朝）。共 20 个。`joined` / `left` = 本主题地图上出现的年份（`strings` 写"地图上始见 / 止于"，不写"加入 / 退出"）。
- **控制区**：TopoJSON，16 帧（§3.3），全部 `certainty: approximate`。
- **按年份的图层**（`datedLayers`，4 个 `area`）：`srivijaya-sphere`、`khmer-sphere`、`majapahit-sphere`、`melaka-sphere`（§3.4）。
- **事件**：约 72 个（milestone 24、political 19、atrocity 2–4、site 27；施工后按实际数填 §9）。
- **航线**：4 条（§3.5）。
- **预设**（`presets.json`；区域图版自带"全图"，**不要再写全图预设**）：`mesopotamia` [45.8, 31.6] 6.4 · `nile-valley` [31.3, 27.5] 5.2 · `indus-valley` [70.5, 27.5] 5.0 · `china-plain` [113.0, 34.0] 5.0 · `mediterranean` [20.0, 39.0] 4.3 · `southeast-asia` [107.0, 4.0] 4.4 · `straits` [102.5, 1.8] 6.6。与实体、事件、图层、名词不重名。
- **名词**：15 个（§5）。
- **规格行**（引擎按数据生成，以引擎为准）：`ENTITIES 20 · KEYFRAMES 16 · EVENTS ~72 · MOVEMENTS 4`。
- **`topic.yaml`**：

```yaml
# Authoring contract: docs/43-ancient-civilisations-content-spec.md.
id: ancient-civilisations
title: { en: "Ancient Civilisations", zh: "古文明" }
subtitle: { en: "From Sumer to Melaka, c. 3200 BCE – 1511 CE", zh: "从苏美尔到马六甲（约公元前3200年—公元1511年）" }
shortTitle: { en: "Ancient civilisations", zh: "古文明" }
subject: history
mode: time
engine: time-scene
stage: geo
theme: paper
sensitivity: open
status: draft
levels: [P6]
tags: [history, map]
illustration: ancient-civilisations
basemap:
  region:
    bounds: [-12, -12, 135, 58]
    land: ancient-world-plate
    rivers: ancient-rivers
  maxZoom: 9
colorBy: entity
datePrecision: year
blocLabels:
  neutral: { en: "States drawn on this map", zh: "地图上画出的国家" }
  out: { en: "No longer drawn", zh: "已不在图上" }
strings:
  joined: { en: "On the map from", zh: "地图上始见" }
  left: { en: "On the map until", zh: "地图上止于" }
  notYet: { en: "Not yet on the map", zh: "尚未见于地图" }
note:
  en: "Approximate extents from Cliopatria · Southeast Asian kingdoms as overlapping spheres · today's land and rivers, two old Yellow River courses dashed · schematic sea routes"
  zh: "范围取自 Cliopatria，为示意 · 东南亚王国画成可重叠的势力范围 · 陆地与河流按今天，黄河两条古河道为虚线 · 海路为示意"
datedLayers:
  - { id: srivijaya-sphere, file: ac-srivijaya, kind: area, holder: srivijaya, label: { en: "Srivijaya (sphere, approximate)", zh: "室利佛逝（势力范围，示意）" } }
  - { id: khmer-sphere, file: ac-khmer, kind: area, holder: khmer, label: { en: "Khmer Empire (sphere, approximate)", zh: "高棉帝国（势力范围，示意）" } }
  - { id: majapahit-sphere, file: ac-majapahit, kind: area, holder: majapahit, label: { en: "Majapahit (sphere, approximate)", zh: "满者伯夷（势力范围，示意）" } }
  - { id: melaka-sphere, file: ac-melaka, kind: area, holder: melaka, label: { en: "Melaka (sphere, approximate)", zh: "马六甲（势力范围，示意）" } }
```

---

## 3. 地图与数据

### 3.1 来源与许可（2026-10-21 研究读到的许可原文见 `datasets.json`）

| D# | 来源 | 许可 | 用途 | 进发布数据？ |
|---|---|---|---|---|
| D1 | **Cliopatria**（Seshat Global History Databank；GitHub `Seshat-Global-History-Databank/cliopatria` + Zenodo 发布包；论文 doi:10.1038/s41597-025-04516-9） | CC BY 4.0（仓库 LICENSE.md；GitHub API 显示 NOASSERTION，以 LICENSE.md 为准） | 16 个控制区关键帧；4 个势力范围层 | 是（署名） |
| D2 | Natural Earth 1:10m land（`world-atlas/land-10m.json`，仓库已有） | 公有领域 | 区域图版陆地（`region-land.ts`） | 是 |
| D3 | Natural Earth 1:10m rivers_lake_centerlines、lakes | 公有领域 | 河流与洞里萨湖岸线 | 是 |
| D4 | warring-states 的 `public/geo/warring-states-rivers.json` 中 `huang-before-602`、`huang-602-to-11ce`（Kanguole，Commons，CC BY-SA 4.0，docs/27 G1） | CC BY-SA 4.0 | 两条古黄河下游 | 是 → **LICENSE-CONTENT 例外**（§0-9） |
| D5 | Merikanto, *Simple map of Indus valley civilization.png*（Commons） | CC BY 4.0 | **可选**：加加尔—哈克拉古河道配准描摹，残差 ≤ 15 km 才用，否则不画 | 可选（署名） |
| D6 | Wikidata | CC0 | 全部地点坐标、中文标签核对 | 是 |
| D7 | Pleiades（编号发布版） | CC BY 3.0 | 地中海—近东地点的坐标核对；只有采用了 Pleiades 坐标的点才署名 | 视情况 |
| C1–C8 | Commons 核对图：Maurya c.250 BCE（Kulke & Rothermund，CC BY-SA 3.0）、Srivijaya Empire.svg（Munoz 2006，CC BY-SA 3.0）、Malacca Sultanate en.svg（CC BY-SA 3.0）、Khmer Empire Expansion.png（CC BY-SA 4.0）、Map of Majapahit Empire revised.png（CC BY 4.0）、Ancient Egypt map-en.svg（CC BY-SA 4.0）、Greek World in 490 BC（CC0）、Austronesian maritime trade network（CC0） | 各自 | **只作肉眼并排核对，不描摹、不发布像素** | 否 |
| — | 拒用：historical-basemaps（GPL-3.0、来源不可记）、DARMC（无许可）、DARE（未确认）、AWMC 瓦片（运行时外部请求）、AWMC geodata（ODbL，本版不用，§0.1-3）、AWMC 地图（CC BY-NC，仅参考）、OHM（只作核对）、UNESCO 描述文字（BY-SA IGO，只用事实）、维基百科文字（只引不抄） | | | |

LICENSE-CONTENT 要加的一段（主会话写，照 warring-states 的格式）：

> Exception — Ancient Civilisations (topic `ancient-civilisations`): the river courses in `public/geo/ancient-rivers.json` include two reconstructed courses of the Yellow River taken from `public/geo/warring-states-rivers.json` (traced from a Wikimedia Commons map licensed CC BY-SA 4.0) and are therefore licensed CC BY-SA 4.0, with the attribution given in `src/content/topics/ancient-civilisations/data/SOURCES.md` and `scripts/geo/ancient-civilisations/SOURCES-GEO.md`. The control areas and spheres of that topic are derived from Cliopatria (CC BY 4.0) and stay under CC BY-NC-SA 4.0 as above, with attribution.

`THIRD-PARTY-NOTICES.md` 加 Cliopatria、Natural Earth 河流湖泊、Wikidata、（采用时）Pleiades、（采用时）Merikanto。

### 3.2 管线（build brief，Opus；文件全在 `scripts/geo/ancient-civilisations/`，`raw/`、`work/`、`check/` 加 `.gitignore`）

每一步把命令、版本、SHA-256、计数写进 `SOURCES-GEO.md`；不许手画多边形、不许 `bbox` 当版图、不许从记忆填坐标。

- **G0 下载与清点**（先做，结果交主会话看过再往下）：
  1. 下载 Cliopatria 最新发布包（Zenodo 的版本号与 DOI、GitHub tag）到 `raw/`，记 SHA-256；读 README 确认字段名（预计 `Name`、`FromYear`、`ToYear`、`SeshatID`、`Wikipedia`、`MemberOf`、`Components`、`Type`、`Area`，以实际为准）与年份含义（`ToYear` 含不含当年）。
  2. `inventory.ts`：按 §3.3 / §3.4 表里的"预计 Cliopatria 记录"逐个模糊匹配名称，输出 `work/inventory.json` 与 SOURCES-GEO.md 一张表：实体 · 匹配到的记录名 · 每条的 FromYear–ToYear · 面积 · 是否覆盖所需帧年份。同时列出 Cliopatria 里名字含 Funan、Sukhothai、Champa、Ayutthaya、Harappa / Indus、Athens / Sparta 的记录（只记录，不用）。
  3. 下载 NE 10m `rivers_lake_centerlines`、`lakes`（naturalearthdata.com，构建期），记版本与 SHA-256。
  4. **决策点**：主会话按清点结果确认每个实体"画面 / 只画点"；缺的实体照 §3.3 的"缺了怎么办"处理，记入本文 §9。
- **G1 区域图版陆地**：`topic.yaml` 写好 `basemap.region` 后，`pnpm tsx scripts/geo/lib/region-land.ts --topic ancient-civilisations`；`sources.json` 的 `pipeline.regionLand` = `{ padDeg: 0.25, simplifyKm: 2, minIslandKm2: 20, quantization: 50000, budgetKB: 450 }`。末尾必须打印 `rings: N, zero-area 0, self-crossing 0`。输出 `public/geo/ancient-world-plate.json`。检查新加坡岛、马六甲海峡、尼罗河三角洲、波斯湾口在 zoom 7 下的形状。
- **G2 河流**：`build-rivers.ts` → `public/geo/ancient-rivers.json`（≤ 250 KB）。
  - 从 NE 10m 按名字取（名单与中文：底格里斯河 Tigris、幼发拉底河 Euphrates、尼罗河 Nile、印度河 Indus、杰赫勒姆河 Jhelum、杰纳布河 Chenab、拉维河 Ravi、萨特莱杰河 Sutlej、比亚斯河 Beas、恒河 Ganges、亚穆纳河 Yamuna、黄河 Huang He（只取中上游到郑州附近，下游见下）、渭河 Wei、长江 Yangtze、湄公河 Mekong、湄南河 Chao Phraya、永河 Yom、穆西河 Musi、布兰塔斯河 Brantas、台伯河 Tiber）；NE 里没有的河**不画**，列进 SOURCES-GEO.md。中文名由 Opus Z 步核。
  - 洞里萨湖：NE lakes 多边形的外环转成线（`id: tonle-sap`，名"洞里萨湖"）。
  - 古黄河：从 `warring-states-rivers.json` 原样复制 `huang-before-602`（`to: "-0602"`）与 `huang-602-to-11ce`（`from: "-0602"`, `to: "0011"`），`reconstructed: true`；公元 11 年以后的下游没有数据，**不画**（§9 已知差距）。
  - 可选 D5：加加尔—哈克拉古河道（`reconstructed: true`，`to: "-1300"`），配准控制点 ≥ 10（印度河、萨特莱杰河汇口、海岸），残差 ≤ 15 km 才用。
  - 每条 `properties: { id: "river-<name>", name: { en, zh }, label?: [lng, lat], from?, to?, reconstructed? }`。
- **G3 控制区关键帧**：`build-keyframes.ts` 读 `work/inventory.json` 与 `keyframes.json`（§3.3 表的机器版：帧日期 · 实体 · Cliopatria 记录名 · 标签 EN/ZH）：
  1. 对每帧日期 Y、每个实体，取 `FromYear ≤ Y ≤ ToYear`（按 README 的含义）的记录；同一实体多条记录（如周代诸国、苏美尔诸城）**合并成一个 holder**（`zhou-states` 用并集；`sumer` 保留各城为单独要素、各自 `label`）。
  2. 如果 Y 不在任何记录的年份内，但 Y ± 50 年内有：用那条记录，`properties.note` 写"按 Cliopatria 某年的范围"，SOURCES-GEO.md 记一行；±50 年内也没有：该实体不进这一帧（§9 记录）。
  3. 裁到区域图版陆地（`ancient-world-plate.json` 的 `kind: land`，同 docs/10 的海岸规则：控制区只在陆地上，海岸只有底图一条线），再裁到 `bounds`。
  4. **重叠检查**：同一帧里不同 holder 的要素两两求交；交集 < 较小者面积 2 % → 归面积大的 holder，记日志；≥ 2 % → 停下，写进 `work/overlaps.json` 交主会话定（通常是"属国 / 宣称"，按 Cliopatria 的 `MemberOf` 字段归属），决定写进 SOURCES-GEO.md。
  5. 每个要素 `properties: { holder, label: { en, zh }, certainty: "approximate", src: "Cliopatria vX: <Name> <FromYear>–<ToYear>" }`。
  6. `simplify.ts --topic ancient-civilisations`：TopoJSON 共享弧、量化；`control.json` ≤ 2.0 MB（验收上限 2.5）；末尾打印 `rings: N, zero-area 0, self-crossing 0`；slug 加进 `tests/geo-rings.test.ts`。
  7. **首末帧先做**：K1（-3200）与 K12（0117，罗马最大、帧最复杂），并排图（Cliopatria 原始渲染 vs 成品）主会话看过再铺其余帧。
- **G4 势力范围层**：`build-spheres.ts`：四个政体的全部 Cliopatria 记录，每条 → 一个几何，`properties: { f: FromYear, u: ToYear + 1（或按 README 的含义）, certainty: "approximate" }`，裁到陆地、简化，写 `public/geo/ac-srivijaya.json` 等（TopoJSON，对象名 = 文件名，单个 ≤ 120 KB）。`pnpm validate` 的 `datedLayerIssues` 通过。
- **G5 地点**：`points.ts`：§3.7 表的 Wikidata QID 用 `wbgetentities` 取 P625（CC0），写 `work/places.json`（5 位小数）；有 Pleiades id 的同时取 Pleiades 代表点，差 > 2 km 的列出（已知：雅典城中心 vs 卫城约 1.3 km、底比斯 Wikidata 25.7206, 32.6103 vs Pleiades 25.6648, 32.6319 约 6.5 km——底比斯用 Wikidata 的卢克索点并在 `detail` 写"标记在卢克索城区"）。表里写"F 步读"的 QID 由 F 步补（Sonnet 查到 QID 写进 RESEARCH.md，G5 再取坐标）。
- **G6 航线**：`routes.ts`：港口 = G5 的点；海上折点写在 `route-waypoints.json`（每个写 `reason: "keep the line at sea"`）；检查每段与陆地相交 < 5 km；输出到 `movements.json` 的草稿（D 步合并）。
- **G7 配色**：`pnpm tsx scripts/geo/lib/colour-holders.ts --topic ancient-civilisations --write`（控制区 12 个实体按所有帧的邻接 DSatur，8 色内）；东南亚 6 个与 `traders`、`chola` 手工指定，互相重叠的势力范围（室利佛逝 / 满者伯夷 / 马六甲；高棉 / 素可泰）不同色。
- **G8 核对**：`check.ts` 每帧出并排图 `docs/screenshots/ancient-civilisations/geo-K#.png`（成品 vs Cliopatria 原始），K9（孔雀）、K12（罗马）与 C1、C6 等 Commons 图肉眼对照，差别 > 150 km 的写进 SOURCES-GEO.md"来源之间的差别"；势力范围层各出一张。

### 3.3 控制区关键帧（16 帧）

"预计记录"取自研究读到的 Seshat 政体名单（`datasets.json`），以 G0 清点为准。标签括号里的说明在地图上不显示（引擎去掉末尾括号）。

| K | t | 实体与标签（EN / ZH） | 预计 Cliopatria 记录 | 缺了怎么办 | 用在 |
|---|---|---|---|---|---|
| K1 | -3200 | `sumer`：Uruk / 乌鲁克；`egypt`（若有前王朝 / 0 王朝记录）：Egypt / 埃及 | "Uruk"；"Egypt - Dynasty 0" | 苏美尔缺 → 只画点；埃及缺 → K1 不画埃及 | 00、01-1 |
| K2 | -3150 | `sumer`；`egypt`：Egypt (Early Dynastic) / 埃及（早王朝） | 同上 + "Egypt - Early Dynastic" | 埃及早王朝若从 -3100 起 → 用 ±50 规则 | 02-1 |
| K3 | -2600 | `sumer`：苏美尔诸城（各城单独要素，若有）；`egypt`：Egypt (Old Kingdom) / 埃及（古王国） | 早王朝苏美尔诸城（名单里没看到，待清点）；"Egypt - Old Kingdom" | 苏美尔诸城缺 → 01-2 只画点 | 01-2、02-2、03-1/2 |
| K4 | -2270 | `akkad`：Akkadian Empire / 阿卡德帝国；`egypt` | "Akkadian Empire" | 缺 → 01-3 只用事件点 + 字幕改写 | 01-3 |
| K5 | -2100 | `sumer`：Ur III / 乌尔第三王朝；`egypt` | "Ur - Dynasty III" | 缺 → 01-4 只画点 | 01-4、03-3（无印度河面） |
| K6 | -1250 | `egypt`：Egypt (New Kingdom) / 埃及（新王国）；`shang`：Shang (late) / 商（晚期） | "Egypt - New Kingdom"；"Late Shang" | 晚商若从 -1250 以后才有 → K6 改到晚商起始年，02-3、04-2 的 `t` 同步改 | 02-3、04-1/2 |
| K7 | -0508 | `achaemenid`：Persian Empire (Achaemenid) / 波斯帝国（阿契美尼德）；`zhou-states`；`rome`：Roman Republic / 罗马共和国；`maurya`：Magadha / 摩揭陀（若该记录早于孔雀） | "Achaemenid Empire"；"Eastern Zhou / Warring States" 及其组成；"Roman Republic (Early)"；"Magadha-Maurya Empire" | 摩揭陀早期缺 → 不画 | 05-1/2 |
| K8 | -0323 | `macedon`：Alexander's empire / 亚历山大帝国；`rome`；`zhou-states`；`maurya`（若有） | "Macedonian Empire" | | 05-3/4 |
| K9 | -0261 | `maurya`：Maurya Empire / 孔雀王朝；`rome`；`zhou-states`（含秦）；`egypt`：Egypt (Ptolemaic) / 埃及（托勒密王朝） | "Magadha-Maurya Empire"；"Ptolemaic Kingdom" | | 03-4 |
| K10 | -0221 | `qin`：Qin / 秦；`maurya`；`rome`；`egypt`（托勒密） | "Qin Empire" | | 04-3 |
| K11 | -0030 | `rome`（含埃及）：Roman Republic / 罗马共和国；`han`：Han / 汉 | "Roman Republic (Late)"；"Western Han"（名单未见，待清点） | 汉缺 → 不画，04-4 字幕不提范围 | 02-5 |
| K12 | 0117 | `rome`：Roman Empire / 罗马帝国；`han` | "Roman Principate"；"Eastern Han" | | 04-4、05-5、06-1 |
| K13 | 0220 | `rome`（汉在 220 年结束，中国不上色） | | | 06-2 |
| K14 | 0400 | `rome`；`gupta`：Gupta Empire / 笈多王朝 | "Roman Dominate"；"Gupta Empire" | | 03-5 |
| K15 | 0476 | `gupta`（西罗马结束；东罗马本主题不画） | | | — |
| K16 | 0600 | 空帧（`features: []`） | — | — | 06-3 以后、07、08 |

核对规则：每拍 `t` 显示的帧与字幕一致（T 步逐拍核：字幕说"罗马最大"时图上是 K12）；两帧之间只有最后 30 % 在交叉淡化，拍都落在帧日期上或淡入开始之前。帧日期若因 G0 清点改动，§2 的章节 / 拍 `t` 同步改，并在 §9 记录。

### 3.4 东南亚势力范围（`datedLayers`）

| 层 | 实体 | 预计 Cliopatria 记录 | 年份（预计，以数据为准） | 用在 |
|---|---|---|---|---|
| `srivijaya-sphere` | `srivijaya` | "Srivijaya Empire" | 约 650–1025 以后 | 06-3/4/5 |
| `khmer-sphere` | `khmer` | "Khmer Kingdom" | 802–1431 | 07-1/2/3 |
| `majapahit-sphere` | `majapahit` | "Majapahit Kingdom" | 1293–1527 | 07-3/4 |
| `melaka-sphere` | `melaka` | "Malacca Sultanate" | 约 1400–1511 | 07-4/5 |

- 扶南（"Funan I / II"）、素可泰、占婆、阿瑜陀耶：不画（§0-6、§0.1-5）。
- 层的 KEY 一行写名字；地图上没有领土名称，名字由都城事件的引线标注给出（第 06、07 章每拍高亮都城事件）。

### 3.5 航线（`movements.json`，全部 `kind: sea`、标签带"（示意）"）

| id | holder | from → to | 路径 | 依据 |
|---|---|---|---|---|
| `monsoon-routes` | `traders` | "-0200" → "-0200"，`persist: true` | 穆济里斯 → 斯里兰卡南端外海（折点）→ 阿里卡梅杜 → 孟加拉湾（折点）→ 安达曼海（折点）→ 马六甲海峡（折点）→ 新加坡海峡（折点）→ Óc Eo → 海南岛南（折点）→ 广州 | tr-01–04、sa-07–09；港口 Wikidata；标签 "Monsoon sea routes (schematic) / 季风海路（示意）"；`detail` 写"线连接的是有考古或文献记录的港口，不是哪一艘船的航迹" |
| `belitung-voyage` | `traders` | "0830-01" → "0830-06"，`linger: "0900"` | 广州 → 海南岛南（折点）→ 南海（折点）→ 沉船点 | tr-07–09（ACM）；日期只知道"约 830 年"，`datePrecision: year` 下只显示年 |
| `yijing-voyage-671` | `traders` | "0671-01" → "0671-12"，`linger: "0700"` | 广州 → 南海（折点）→ 巨港 | sa-11；**出发港 F 步核**（义净自述从广州出发），核不到就不建这条线 |
| `chola-raids` | `chola` | "1025-01" → "1025-06"，`linger: "1060"` | 朱罗的港口（讷加帕蒂南，Wikidata，F 步核）→ 孟加拉湾（折点）→ 马六甲海峡（折点）→ 巨港 | sa-18；朱罗出发港与路线 F 步核，核不到就只留事件、不画线 |

不画：元军 1293 远征爪哇（出发港未核，写进 07 事件 `detail`）、亚历山大的行军、罗马道路。

### 3.6 配色（参考，最终以 G7 为准）

控制区 12 个实体按邻接自动分配 `token:holder-1…8`（埃及 / 波斯 / 亚历山大 / 罗马在不同帧相邻，必须不同色）。手工：`srivijaya` holder-6、`majapahit` holder-7、`melaka` holder-2、`khmer` holder-4、`sukhothai` holder-5、`funan` holder-8、`traders` holder-3、`chola` holder-1；与同帧控制区颜色冲突时以 G7 调整。不新增颜色 token。

### 3.7 地点（坐标 = Wikidata P625，CC0；Pleiades 核对；研究 §2.9，2026-10-21 读）

| 地点 | 中文 | Wikidata | [lon, lat] | 用在 |
|---|---|---|---|---|
| Uruk | 乌鲁克 | Q168518 | 45.6374, 31.3259 | `uruk-first-city` |
| Ur | 乌尔 | Q5699 | 46.1044, 30.9622 | `ur-nammu-law`、`site-ur` |
| Eridu | 埃利都（埃里都，待核） | Q210065 | 45.9946, 30.826 | `site-eridu` |
| Nippur | 尼普尔 | Q188395 | 45.2308, 32.1261 | `site-nippur`、`akkad-conquers-sumer` |
| Lagash | 拉格什 | Q207330 | 46.4072, 31.4114 | `site-lagash` |
| Kish | 基什 | Q132272 | 44.6047, 32.5403 | `site-kish` |
| Babylon | 巴比伦 | Q5684 | 44.4211, 32.5425 | `alexander-dies-323`（F 步核） |
| Memphis | 孟菲斯 | Q5715 | 31.2509, 29.8447 | `egypt-unified`、`rosetta-decree` |
| Giza pyramids | 吉萨金字塔群 | Q12508 | 31.1328, 29.9761 | `great-pyramid` |
| Thebes (Luxor) | 底比斯 | Q101583 | 32.6103, 25.7206 | `site-thebes` |
| Alexandria | 亚历山大 | Q87 | 29.8925, 31.1975 | `rome-takes-egypt` |
| Athens | 雅典 | Q1524 | 23.7281, 37.9842 | `athens-democracy`、`olympics-revived-1896` |
| Sparta | 斯巴达 | Q5690 | 22.4236, 37.0819 | `site-sparta` |
| Delphi | 德尔斐 | Q75459 | 22.5, 38.4833 | `site-delphi` |
| Olympia | 奥林匹亚 | Q38888 | 21.63, 37.6383 | `site-olympia` |
| Corinth | 科林斯 | Q103011 | 22.9272, 37.9386 | `corinth-destroyed-146` |
| Rome | 罗马 | Q220 | 12.4828, 41.8931 | 罗马各事件 |
| Pantheon | 万神庙 | Q99309 | 12.4769, 41.8986 | `site-pantheon` |
| Pont du Gard | 加德桥 | F 步读 | — | `site-pont-du-gard` |
| Capua | 卡普阿 | F 步读 | — | `spartacus-crucifixions-71` |
| Mohenjo-daro | 摩亨佐-达罗 | Q5725 | 68.1389, 27.3292 | `mohenjo-daro`、`indus-decline` |
| Harappa | 哈拉帕 | Q185562 | 72.8667, 30.6333 | `site-harappa` |
| Dholavira | 多拉维拉 | Q9468 | 70.2167, 23.8861 | `site-dholavira` |
| Pataliputra | 华氏城 | Q389755 | 85.144, 25.611 | `maurya-founded` |
| Dhauli | 道里 | F 步读 | — | `kalinga-war` |
| Taxila | 塔克西拉（UNESCO 塔克希拉） | Q156093 | 72.7875, 33.7458 | `site-taxila` |
| Nalanda | 那烂陀寺 | Q216243 | 85.4438, 25.1368 | `site-nalanda` |
| Sanchi | 桑吉 | Q181123 | 77.7397, 23.4794 | `site-sanchi` |
| Gwalior (Chaturbhuj Temple) | 瓜廖尔 | F 步读 | — | `gwalior-zero-876` |
| Erlitou | 二里头遗址 | Q2692927 | 112.69, 34.6925 | `erlitou` |
| Yinxu | 殷墟 | Q464904 | 114.3186, 36.1225 | `yinxu-oracle-bones`、`shang-sacrifice` |
| Xianyang | 咸阳 | Q497341 | 108.7092, 34.3297 | `qin-unifies` |
| Qin mausoleum | 秦始皇陵 | Q47672 | 109.2731, 34.385 | `site-qin-mausoleum` |
| Chang'an | 长安 | Q6501000 | 108.8583, 34.3083 | `site-changan` |
| Luoyang | 洛阳 | Q187136 | 112.4245, 34.6587 | `paper-han` |
| Dunhuang (Library Cave) | 敦煌 | F 步读 | — | `diamond-sutra-868` |
| Óc Eo | Óc Eo（俄厄） | Q2344822 | 105.163, 10.2329 | `oc-eo-port` |
| Angkor Borei | 吴哥波雷 | Q986338 | 104.9888, 10.9643 | `funan-envoys-250` |
| Palembang | 巨港 | Q8131 | 104.7644, -2.9833 | 室利佛逝各事件 |
| Muaro Jambi | 穆阿拉占碑 | Q2725535 | 103.6342, -1.4769 | `site-muaro-jambi` |
| Belitung wreck | 黑石号沉船点 | F 步读（无则用勿里洞岛） | — | `belitung-wreck` |
| Sambor (K-127) | 三波 | F 步读 | — | `khmer-zero-683` |
| Phnom Kulen | 荔枝山 | F 步读 | — | `khmer-802` |
| Angkor Wat | 吴哥窟 | Q43473 | 103.8667, 13.4125 | `angkor-wat` |
| Angkor (park) | 吴哥 | Q163607 | 103.8333, 13.4333 | `angkor-sacked-1431`、`cham-sack-yasodharapura-1177` |
| Vijaya (Champa) | 毗阇耶 | F 步读 | — | `khmer-take-vijaya-1145` |
| Sambor Prei Kuk | 三波坡雷古 | Q1818746 | 105.04, 12.8673 | `site-sambor-prei-kuk` |
| Trowulan | 特罗乌兰（待核） | Q962410 | 112.3667, -7.55 | 满者伯夷各事件 |
| Sukhothai | 素可泰 | Q423654 | 99.7036, 17.0211 | `sukhothai-founded`、`sukhothai-to-ayutthaya-1438` |
| Melaka | 马六甲 | Q61089 | 102.2511, 2.1889 | 马六甲各事件 |
| Fort Canning | 福康宁 | Q1438470 | 103.847, 1.2944 | `site-temasek` |
| Borobudur | 婆罗浮屠 | Q42798 | 110.2038, -7.6079 | `site-borobudur` |
| Prambanan | 普兰巴南 | F 步读 | — | `site-prambanan` |
| Bagan | 蒲甘 | Q29317 | 94.86, 21.1725 | `site-bagan` |
| Ban Chiang | 班清 | Q584125 | 103.3583, 17.5486 | `site-ban-chiang` |
| My Son | 美山 | F 步读 | — | `site-my-son` |
| Ayutthaya | 阿瑜陀耶（大城） | F 步读 | — | `site-ayutthaya` |
| Vat Phou | 瓦普 | F 步读 | — | `site-vat-phou` |
| Guangzhou | 广州 | Q16572 | 113.26, 23.13 | 航线 |
| Muziris | 穆济里斯 | Q2974112 | 76.2, 10.15 | 航线（Pleiades 50146 F 步核） |
| Arikamedu | 阿里卡梅杜 | Q2861278 | 79.8199, 11.9027 | 航线 |
| Singapore Botanic Gardens | 新加坡植物园 | F 步读 | — | `site-sg-botanic-gardens` |
| Asian Civilisations Museum | 亚洲文明博物馆 | F 步读 | — | `site-acm` |

所有事件 `detail` 里说明锚点（"标记在卢克索城区""都城不能确定，标记在……"）；不为凑点编地点。

---

## 4. 引擎

**一处小改（E1），其余不改。** 春秋战国（docs/27 G1–G13）与新加坡主题（docs/28、docs/34）补上的能力本主题全部用得上。

| # | 内容 | 现状 | 最小改动 | 阻塞？ |
|---|---|---|---|---|
| E1 | **跨公元前后的主题，公元 1–999 年标 CE / 公元** | `lib/format.ts`：正年份只写数字（"150" / "150年"），紧挨着"260 BCE"容易看错 | `TimeModel` 记 `mixedEra = min < 0 && max > 0`；`formatTime` / `formatReadout` / `yearLabel` 在 `mixedEra` 且 0 < 年 < 1000 时写 EN "150 CE"、ZH "公元150年"（段标签同）；单测；docs/06「时间」一句。其他主题（全公元后或全公元前）输出逐字不变 | 否（退路：字幕写 "150 CE"，读数仍是 "150"） |

施工前核对（Opus，脚手架之后，结论写 §9）：

| # | 核对 | 怎么查 | 不过怎么办 |
|---|---|---|---|
| V1 | **大区域图版**：147° × 70° 的图版，陆地文件 ≤ 450 KB，全图 zoom、`aspectBounds`、10° 经纬网、河名避让正常；fps 不掉 | `pnpm shoot ancient-civilisations --layout --keys`、`stats()` | 文件超预算 → 调 `simplifyKm`；性能问题报主会话，不改图版范围前先问 |
| V2 | **5,200 年的时间轴**：16 帧、8 段等宽、段标签 "3200 BCE"…"2021"、拖动 / 点刻度、`datePrecision: year`；不出现 "0000" 年；跨公元前 1 年的时长误差（docs/27 G12）不影响显示 | 同上 + `--beats` | 只报告，不改（E1 以外） |
| V3 | **20 个实体、跨千年**：参与卡行数（`planBandRows`）、图例只列当前帧的 holder、实体卡用 `strings`、领土名称按帧换字 | 截图 | — |
| V4 | **控制区 + 势力范围叠在区域图版上**：`datedLayers` 在 `region` 模式下正常（docs/34 只在 `local` 模式验证过）；面重叠时淡底叠加可读 | 06、07 章截图 | 若 `region` 模式漏了 dated 图层：Opus 引擎代理补最小分支 + 单测 |
| V5 | **空帧 + 实体 `left`**：K16 空帧之后无领土名称、无空图例；`left` 的实体卡写"地图上止于" | 07、08 章截图 | — |
| V6 | **约 27 个 `site` 菱形**在全图视角的密度；`sites` 图层开关 | 08 章截图 | 太挤时 08 章各拍只开高亮相关区域的镜头，不删点 |
| V7 | `--keys` 的拖动检查在区域图版全图视角跳过（docs/27 §11.1 已有处理） | `--keys` | — |
| V8 | `persist` 的季风海路在 05–08 章一直显示、不计入 MOVEMENTS | 截图 | — |
| V9 | 河流 `from` / `to` 带公元前年份（"-0602"）与公元年份（"0011"）都过 `riversFile` | `pnpm validate` | — |

- 不需要：新的事件种类、`person` 事件、新的颜色 token、`basemap.local`、`borders`。
- E1 的文件归属：`src/engines/time-scene/lib/format.ts`、`lib/model.ts`（或等价位置）、`tests/time-scene/**`、docs/06 一句；一个 Opus 引擎代理，改前主会话确认没有别的代理在改引擎。

---

## 5. 名词表（`glossary.json`，15 个）

每个词只包全主题第一次出现处。中文"已核"= 研究在 zh.wikipedia（zh-sg）/ Wikidata / UNESCO 中文名见到；"待核"= Opus Z 步再查（新加坡没有公开的 P6 华文词表）。

| id | EN / ZH | 定义要点 | 中文 | see |
|---|---|---|---|---|
| `civilisation` | Civilisation / 文明 | 本主题按课本的五个特征使用这个词：政府、文字、有公共建筑的城市、艺术工艺与科学、经济活动；它是比较用的检查表，不是给人分高下 | 已核（"五个特征"的中文是草稿） | `legacy` |
| `city-state` | City-state / 城邦 | 一座城和周围的田地自成一国，有自己的统治者；苏美尔和希腊都有 | 已核 | |
| `cuneiform` | Cuneiform / 楔形文字 | 用芦苇笔在泥板上压出楔形笔画的文字，已知最早的文字体系，最初写苏美尔语 | 已核 | `civilisation` |
| `hieroglyphs` | Egyptian hieroglyphs / 古埃及象形文字 | 古埃及的文字，学名圣书体，有一千多个符号，兼有表意与表音 | 已核（写法见 §0-14） | `cuneiform` |
| `pharaoh` | Pharaoh / 法老 | 古埃及国王的称呼 | 已核 | |
| `ziggurat` | Ziggurat / 金字形神塔（塔庙） | 美索不达米亚用泥砖层层垒起的高台，顶上是神庙 | 待核 | |
| `democracy` | Democracy / 民主 | 由人民治理；古代雅典由公民大会直接决定，但只有自由的成年男性公民能参加 | 已核 | `republic` |
| `republic` | Republic / 共和国 | 没有国王、由选出的人治理的国家；来自拉丁文 res publica（公共的事） | 已核 | `democracy` |
| `indus-script` | Indus script / 印度河文字 | 印度河流域城市留下的符号，至今没有破译，也不能确定是不是在写一种语言 | 已核 | |
| `oracle-bones` | Oracle bones / 甲骨文 | 商朝刻在龟甲和兽骨上的占卜记录，已知最早的汉字 | 已核 | |
| `monsoon` | Monsoon / 季风 | 按季节改变方向的风；东南亚的帆船按季风出航和回航，稻田也靠季风带来的雨 | 待核（F 步补来源） | `maritime-silk-road` |
| `maritime-silk-road` | Maritime Silk Road / 海上丝绸之路 | 连接东南亚、东亚、南亚、阿拉伯和东非的海上贸易路线；运的不只是丝，名字是近代才起的 | 已核 | `monsoon` |
| `mandala` | Mandala (political) / 曼荼罗体系 | 学者用来描述东南亚古国的说法：一个中心的影响向外扩散，和别国的范围互相重叠，没有固定国界 | 已核（需白话释义） | |
| `legacy` | Legacy / 遗产（流传下来的影响） | 过去留下、今天仍影响我们生活的东西，例如文字、数字、法律；不同于"世界遗产" | 待核（教育部中文用词未见） | `world-heritage-site` |
| `world-heritage-site` | World Heritage Site / 世界遗产 | 联合国教科文组织列入名录、要求各国保护的地方 | 已核 | `legacy` |

不收：帝国（常用词）、BCE / CE（背景章细看）、印度化（细看里讲，不作定义）、"野蛮人"（不作名词条目，只在细看引用）。

---

## 6. 来源（施工时的 S#；研究 `facts.json` 的 139 个来源键按块编号）

每条写标题、发布者、URL、访问日期（2026-10-21，F 步新增的写实际日期）、页码 / 段落。维基百科、WHE 标"secondary / tertiary"，正文引用的句子必须另有非维基来源（§1.3 ⚑）。挡爬虫的站点（Britannica、大英博物馆、多数 Met 页面）只引读到的原文；UNESCO 页面经 Internet Archive 快照读，注明快照日期。

| 块 | 研究来源键 | 用于 |
|---|---|---|
| S1–S9 课纲与框架 | moe_p6、moe_p4、moe_front；wp:Civilization、wp:Urban revolution、wp:Eurocentrism、wp:Common Era、wp:Barbarian | §1.1、F1、F2、F50 |
| S10–S29 苏美尔 | unesco1481、met:writing、met:uruk、wh:Sumer、wh:Mesopotamia、wp:Sumer、wp:Chronology of the ancient Near East、wp:Cuneiform、wp:Uruk、wp:Ziggurat of Ur、wp:Royal Cemetery at Ur、wp:Sexagesimal、wp:Wheel；S23– 留给 F 步原典 | F3–F12 |
| S30–S49 埃及 | unesco86、unesco87、met:oking、wp:Ancient Egypt、wp:Great Pyramid of Giza、wp:Egyptian hieroglyphs、wp:Rosetta Stone、wp:Slavery in ancient Egypt、wp:Egyptian calendar；S40– F 步 | F13–F22 |
| S50–S89 希腊与罗马 | unesco404、unesco393、unesco91、unesco344、wh:Greece、wp:Ancient Greece、wp:Hellenistic period、wp:Athenian democracy、wp:Greek alphabet、wp:Olympic Games、wp:Slavery in ancient Greece、wp:Roman Republic、wp:Roman Empire、wp:Roman concrete、wp:Twelve Tables、wp:Roman law、wp:Roman aqueduct、wp:Roman roads、wp:Roman numerals、wp:Slavery in ancient Rome、wp:Calgacus、wp:Singapore；S75– F 步（塔西佗《阿古利可拉传》30、阿庇安《内战记》1.120、波利比乌斯 / 保萨尼亚斯论科林斯，均用公有领域英译） | F44–F59 |
| S90–S119 印度次大陆 | unesco138、unesco1645、unesco524、unesco1502、unesco139、wh:Indus、wh:Maurya、wp:Indus Valley Civilisation、wp:Great Bath、wp:Indus script、wp:Mohenjo-daro、wp:Kalinga War、wp:Hindu–Arabic numeral system、wp:0、bod（Bodleian）、wp:Bakhshali manuscript、wp:Indianization、wp:Chess、wp:Cotton、wp:Gupta Empire、wp:Maurya Empire；S112– F 步（阿育王第十三摩崖法敕 Hultzsch 1925 英译） | F23–F35 |
| S120–S149 中国 | unesco1114、unesco438、unesco441、unesco1442、wh:Shang、wh:Zhou、wp:History of China、wp:Yellow River、wp:Erlitou culture、wp:Xia–Shang–Zhou Chronology Project、wp:Shang dynasty、wp:Qin dynasty、wp:Four Great Inventions、wp:Papermaking、wp:Diamond Sutra、wp:Gunpowder、wp:Magnetic compass、wp:Silk；S138– F 步（《后汉书·宦者列传·蔡伦》、殷墟祭祀坑考古报告；warring-states 已用的《史记》各篇可引其 S 号的原文，不复制编号） | F36–F43 |
| S150–S199 东南亚与海路 | wp:Mandala (political model)、wp:Funan、wp:Óc Eo、wp:Srivijaya、wp:Kedukan Bukit inscription、wp:Temasek、wp:Khmer Empire、unesco668、wp:Angkor、wh:Khmer、unesco1532、wp:Majapahit、unesco574、wp:Sukhothai Kingdom、wp:Malacca Sultanate、unesco1223、nhb_pre、bib_sang、bib_dragon、unesco1483、unesco592、unesco642、unesco1588、unesco575、unesco949、unesco576、unesco481、wp:List of World Heritage Sites in Southeast Asia、wp:Maritime Silk Road、wp:Silk Road、wp:Straits of Malacca、wp:Belitung shipwreck、acm、curio、nlb_zh、nus_daoyi；S186– F 步（义净《大唐西域求法高僧传》《南海寄归内法传》、汪大渊《岛夷志略》、《马来纪年》Leyden 1821 英译、皮列士、Wolters 论曼荼罗、南岛航海的学术来源） | F60–F75 |
| S200–S219 地图与许可 | sci_clio、seshat、ne、wd_lic、pleiades_dl、awmc_maps、awmc_gis、orbis_purl、orbis_site、itinere、ohm、hb_readme | §3、阅读说明 |
| S220– | F 步新增的其余原文 | ⚑ 各条 |

与 1819–1965 共用的史实（汪大渊、《爪哇史颂》、山尼拉乌他玛、拜里米苏拉）：**句子逐字对齐，来源各自编号**（不复制事件、不复制 S 号）。

---

## 7. 图像（只用已审草稿 `art/planned/ancient-civilisations/`，主会话 2026-10-21 看过；不生成新图）

清单记录在 `art/planned/manifest.jsonl`（四张都是"Opened and visually reviewed"，灰度 + 透明底）。处理：首页图 `pnpm tsx scripts/illustrate.ts process art/planned/ancient-civilisations/ancient-civilisations.png ancient-civilisations`；章节图 `pnpm tsx scripts/illustrate.ts figure <src.png> ancient-civilisations-<id>`（`gen` 走 Codex，本轮不用）。正文 `<Figure src="figures/ancient-civilisations-<id>" alt caption />`。

| 用途 | 文件 | 画的是什么（看过） | 放在 | alt / caption 草稿 | 注意 |
|---|---|---|---|---|---|
| 首页图 | `ancient-civilisations.png`（1024×1024） | 一座多层泥砖塔庙，正面三道阶梯汇向第一层平台，墙面有扶壁；上层是简化的复原；无人、无字、无神像 | 索引卡、主题首页 | alt EN "A stepped mud-brick ziggurat with three stairways, drawn after the one at Ur." / ZH "一座有三道阶梯的泥砖塔庙，按乌尔的塔庙画成。" | 上层是推测复原，若在章内用要加 caption 说明；本版只作首页图 |
| 第 03 章 | `ancient-civilisations-indus-bath.png`（1536×1152） | 长方形砖砌水池，两端各有一道阶梯下到池底，四周砖铺地面与残墙 | 细看"河流与一条河的两个名字"之后 | alt EN "A brick-lined rectangular pool with a flight of steps down at each end." / ZH "一个砖砌的长方形水池，两端各有一道下到池底的阶梯。" caption EN "Drawing made for this topic of the Great Bath at Mohenjo-daro as excavated, about 12 by 7 metres. What it was used for is not known for certain." / ZH "为本主题画的示意图：发掘出来的摩亨佐-达罗大浴场，约 12 米长、7 米宽。它的用途至今不能确定。" | 尺寸与"用途不确定"出自 F25；不写"宗教沐浴" |
| 第 05 章 | `ancient-civilisations-greek-pottery.png`（1536×1152） | 一只无彩绘的双耳陶罐，口沿有缺口，放在小金属托架上 | 细看"五个特征：希腊"之后 | alt EN "A plain two-handled clay jar standing in a small museum support." / ZH "一只没有彩绘的双耳陶罐，立在博物馆的小托架上。" caption EN "Drawing made for this topic: an undecorated Greek amphora, a two-handled clay jar. It is not a particular object." / ZH "为本主题画的示意图：一只没有彩绘的希腊双耳陶罐，不是某一件真实的文物。" | 不写"用来装橄榄油 / 葡萄酒"（研究没有来源）；F 步若找到博物馆来源可加一句 |
| 第 05 章 | `ancient-civilisations-roman-aqueduct.png`（1536×1152） | 一段三孔石拱的水道桥，顶上是有水的渠槽，坡度很缓 | 细看"五个特征：罗马"之后 | alt EN "A section of a stone aqueduct bridge with three arches and a water channel on top." / ZH "一段三孔石拱水道桥，顶上是输水的渠槽。" caption EN "Drawing made for this topic: water ran in the channel on top, moved by gravity alone along a gentle slope. It is not a particular aqueduct." / ZH "为本主题画的示意图：水在顶上的渠槽里流动，只靠重力沿着很缓的坡往前走。这不是某一条真实的水道。" | 加德桥是三层，这张是一层：caption 不说是加德桥 |

不画：人物、神像与宗教符号、今天的国旗、武器、战争或祭祀场面。

---

## 8. 施工顺序、分工与验收

**没有 Codex。** 模型分工：**Opus** 做数据管线、引擎 E1、内容数据、史学复核、中文；**Sonnet** 写英文初稿、做事实核对（取 ⚑ 原文）、节拍与截图 QA；**Haiku** 做机械检查。主会话写 brief、预装依赖（本主题不需要新依赖）、验收、提交；push 等 Gavin。

| 步 | 内容 | 谁 | 写哪些文件 | 完成标准 |
|---|---|---|---|---|
| 0 | 脚手架：`pnpm tsx scripts/new-topic.ts ancient-civilisations --engine time-scene --subject history --title-en "Ancient Civilisations" --title-zh "古文明" --start -3200 --end 2021`；`topic.yaml` 照 §2.3（`datedLayers` 先注释掉，G4 之后打开）；`scripts/geo/ancient-civilisations/.gitignore` | 主会话 | `src/content/topics/ancient-civilisations/**`、`scripts/geo/ancient-civilisations/` | `pnpm validate` 绿 |
| V / E1 | 引擎核对 V1–V9（V1、V4 要等 G1、G4 的文件）；E1 实现 + 单测 + docs/06 | Opus（引擎） | `src/engines/time-scene/lib/**`、`tests/time-scene/**`、docs/06 | 单测绿；ww1 / ww2 / warring-states / singapore-* 截图不回归 |
| G0 | 下载与清点（§3.2） | Opus（数据） | `scripts/geo/ancient-civilisations/**` | `inventory.json` + SOURCES-GEO 表；**主会话确认后**再做 G1 以后 |
| G1–G8 | 图版陆地、河流、关键帧（K1、K12 先）、势力范围、地点、航线、配色、并排图 | Opus（数据） | `scripts/geo/ancient-civilisations/**`、`public/geo/ancient-*.json`、`public/geo/ac-*.json`、`data/control.json`、`docs/screenshots/ancient-civilisations/geo-*.png` | 环检查 0 / 0；预算内；SOURCES-GEO.md 记全 |
| F | **事实核对与取原文**：§1.3 每个 ⚑、每个"F 步核"、§3.7 每个"F 步读"的 QID；新增事实（科林斯、斯巴达克斯、乌尔王陵、印度 / 中国 / 东南亚的奴隶与强迫劳动、1177 年占婆、117 年罗马最大、季风航行、南岛航海、马来文用拉丁字母、蔡伦在洛阳、义净出发港、朱罗出发港）；写进 `RESEARCH.md`（事实、来源全名、URL、页码 / 段落、≤ 25 词原文、确认 / 更正 / 取不到）；不从记忆填任何数字或日期 | **Sonnet** | `RESEARCH.md` | 每条有结论 |
| D | 数据：实体、事件（§2.2 各章 + §3.7 坐标）、航线（G6 草稿合并）、预设、名词、`sources.json`（§6 编号块）、`data/SOURCES.md`（`pnpm tsx scripts/sources-md.ts ancient-civilisations`）；中文字段先填 Opus 草稿 | **Opus** | `data/*.json`、`data/SOURCES.md` | validate 0 error 0 warning |
| E | 英文正文：背景 + 8 章（§2.2 要点，220–280 词，3–4 段，2–4 个细看，`<Num s>`、`<Term>` 首次出现、`<TopicLink … ch>`、`<Figure>`）；敏感段落严格按 §1.4、§1.5 | **Sonnet** | `chapters/*.mdx`（EN） | 每个数字有 `s`；无 "we / our / enemy / barbarian"（引用除外） |
| T | 史学与客观性复核：§1.2 立场与用词表；§1.4 每行两边；F 步结论落地（取不到原文的句子删）；同类同标（§1.5）；与 1819–1965 背景章的淡马锡句子逐字对齐；每拍字幕与该时刻的关键帧一致（§3.3）；写 `AUDIT.md` 与 `REVIEW.md`（§0.2 的条目按实际段落号） | **Opus** | 正文、数据、`AUDIT.md`、`REVIEW.md` | 〔待核〕清零或列入 §9 |
| Z | 中文定稿：独立成文（不是翻译）；§0-14、§5 的写法；敏感段落克制 | **Opus** | 所有 `zh` 字段 | 无"【待译】" |
| I | 图像：§7 四张处理成 cover / figure，写 alt / caption | 主会话 | `public/illustrations/**`（脚本输出） | 对照"不画"清单 |
| B | 节拍与镜头：§2.2 草稿落地；`pnpm shoot ancient-civilisations --beats --keys --layout --locale en,zh` 逐张看 | **Sonnet**（镜头、帧问题退回 Opus） | 章节 frontmatter、`presets.json` | 节拍 0 失败；"unlabelled highlights""chapter highlights"两份清单为空 |
| Q | 截图 QA：`acceptance.md` + §8.1；paper / cinema；手机 390×844；回归 `pnpm shoot warring-states --keys`、`pnpm shoot singapore-1819-1965 --keys` | **Sonnet** | — | 全勾 |
| H | 机械检查：id 唯一（实体 / 事件 / 航线 / 预设 / 图层 / 名词共用命名空间）；每个 `<Num>` 有 `s` 且编号存在；每章 3–5 拍；`borders` 不在任何 `layers`；所有控制区要素 `certainty: approximate`；坐标与 §3.7 一致（5 位小数）；`site-temasek` 坐标与 1819–1965 相同；高亮 id 的 `t` ≤ 拍的 `t`；界面文本无年级、无"课纲""P6"；EN 无 "BC" / "AD"；ZH 无"喔㕭""象形文字"单用（首次）、无"蛮夷 / 野蛮人"（引号引用除外）；ZH 无"【待译】" | **Haiku** | 只读，报告 | 0 问题 |
| G | 门槛：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`CI=1 pnpm e2e`；LICENSE-CONTENT 例外段（§3.1）、THIRD-PARTY-NOTICES；`docs/review-queue.md` 加 §0.2 条目；docs/17、docs/04 同步；本文 §9 写实现记录；提交 | 主会话 | — | 全绿，`status: draft` |

**模板章**（先做完给 Gavin 看）：背景章 + 第 01 章苏美尔（第一帧、五个特征表的样板）+ 第 07 章东南亚（二）（空帧之后、势力范围层、淡马锡链接、最敏感的区域政治）。看过再铺开 02–06、08。

**并行规则**：G 步（数据代理）与 F 步（Sonnet）可并行；E 步等 F 步结论再写敏感段落，其余可并行；同一时间只有一个代理改 `events.json` / `entities.json` / `movements.json`；Sonnet 的 E 步与 Opus 的 D 步文件不重叠；任何代理不改 `package.json`、别的主题（warring-states、singapore-* 只读；复用的河流从 `warring-states-rivers.json` 读，不改它）、`src/engines/**`（E1 / V4 例外）。

### 8.1 验收（`acceptance.md` 之外，本主题另加）

- [ ] **地图只用真实数据**：控制区与势力范围全部来自 Cliopatria（版本、DOI、SHA-256、每帧记录名在 SOURCES-GEO.md）；河流来自 NE 与 warring-states 的复原河道；点来自 Wikidata；没有手画多边形、没有 `bbox`；印度河、扶南、素可泰、希腊城邦只有点，图上与细看写明原因。
- [ ] **虚线与势力范围**：所有控制区分界是虚线，图例有"边界为近似"；东南亚四个势力范围可重叠、KEY 有名字；阅读说明写了"空白不是无人"。
- [ ] **航线是示意**：标签带"（示意）"，折点在 SOURCES.md 写明用途；只有起止有来源的航行。
- [ ] **许可**：LICENSE-CONTENT 有河流文件的 CC BY-SA 例外；THIRD-PARTY-NOTICES 有 Cliopatria、NE、Wikidata（及采用时的 Pleiades、Merikanto）；没有 AWMC、historical-basemaps、UNESCO / 维基原文。
- [ ] **课纲覆盖**：五个特征表在 00、01、02、05；河流在 03、04 第一拍；印度与中国的遗产、发明在 03、04、08；海与农在 06、07；"今天在哪个国家"在 07 细看④与东南亚事件 `summary`；世界遗产在 08；亚洲文明博物馆在 06、08。界面无年级字样。
- [ ] **不重讲**：东周、秦的统一只一段 + `TopicLink ch`；淡马锡只一个细看 + 一个点 + 链接；与 1819–1965 的句子一致。
- [ ] **两边写与同类同标**：§1.4 每行在正文或细看里两边都有、各带来源；§1.5 的标记规则逐条落实（罗马一方的同类事件与阿育王、商同标，或同样因无原典而不建）。
- [ ] **原文**：§1.3 每个 ⚑ 换成了非维基来源，或那一句已删；正文没有只靠维基百科或 WHE 的句子。
- [ ] **年代**：EN 用 BCE / CE；E1 生效后时间轴、读数、引线日期里公元 1–999 年都标 CE / 公元；两说并列的年份都有。
- [ ] 图像 4 张：无人、无字、无神像；caption 写"示意图，不是……"。
- [ ] §0.2 的段落 Gavin 已读（中文稿），再改 `published`。

---

## 9. 实现记录与已知差距

（施工后填写。）
