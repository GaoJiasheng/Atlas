# 32 · 量的读数 · 内容 spec（`measuring`，MathScene 课；v1，§0 已定稿）

docs/17 §2.2 / §2.3 的 `measuring` 一行（"尺、台秤、量杯三种读数盘（刻度语法与数轴同源）"；P3 "加两步（复合单位 = 数轴上的两段）"）。2026-10-19 起草，**只做规划，不施工、不建目录、不提交**。照 skill `.claude/skills/atlas-lesson-topic/`（SKILL.md + `references/spec-template.md`、`writing-rules.md`、`data-cookbook.md`、`build-order.md`、`acceptance.md`）写，布局和密度照 docs/29（小数）；引擎现状以 docs/06「MathScene」（含「整数与时间」「钟面与时间线」「小数」三节）和 docs/19 / 20 / 21 / 29 的 §9 施工记录为准。本课要的新东西集中在 §3：模型 **A11 `instrument`**（读数器具一家：尺、卷尺、指针秤、量杯、天平）、三种新小测、复合单位值、量读数误解域。

记号同 docs/29：EN 字幕与题目是**口吻草稿**，施工时由 Codex 起草全文、Claude 逐句核对；ZH 是 Claude 的草稿，施工时 Claude 独立定稿。课纲来源 S1 = MOE *Mathematics Syllabus Primary One to Six*（2021 Primary One Cohort，Updated Oct 2025），**本文起草时已从 moe.gov.sg 下载 PDF 逐页核对**（2026-10-19），页码是每页页脚印的 "Page | N"；Codex 的平行调研（`art/codex-research/measuring/measuring-research.md`、`syllabus.json`，43 行逐字核过 PDF）与本文 §1.1 一致。教学惯例另核了 MOE 自编的现行课本 *Primary Mathematics* 2A / 2B / 3B（CPDD × Star Publishing，S4），只作写法与顺序参考，不照抄题目、插图、措辞。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **对象与主体**：Measurement and Geometry · SUB-STRAND: MEASUREMENT 的 **1. Length / Length, Mass and Volume** 一线（时间不在本课，见 `telling-time`）。**P2 全部三条（1.1–1.3）为主体**（第 03–09 步）；**P3 三条（1.1–1.3）**接着做（第 10–12 步）；**P1 的四条**（cm、量与画到最接近的厘米、比长短）是地基，但读尺本身就是全课的入口，所以做成正式的第 01、02 步，不只当"你已经知道"；**P5 Decimals 1.2**（小数形式的单位换算）是"再往前一步"的第 13 步（`bridge: true`），以 P4 Decimals 1.1 为地基 | 同意。女儿 2026 年 P2：01–09 当下就能用，2027 年 P3 接 10–12，13 留到 P5 | 定稿 |
| D2 | **课的形状照分数改版后的样子**：每章 3–5 个讲解拍 + 章末一道小测（8–10 道题库随机抽，"再来一道""跳过"都在，不强制）；练习章 8 道固定题；背景章 00"怎么用这节课"；没有题单章 | 同意 | 定稿 |
| D3 | **UI 里不出现年级**（docs/19 D3、G8）：桥章章头只有 "Going further / 再往前一步"，课纲对照只写原文与来源芯片；`ref`、`level` 只留在数据里 | 同意 | 定稿 |
| D4 | **新模型 A11 `instrument`**（docs/17 §7 的 A 表新增一行；A7 已给图表、A9 已给代数用的天平，所以不占这两个号）：一家读数器具 `ruler`（直尺，可断）、`tape`（卷尺 / 身高尺 / 路上的距离标，横或竖）、`dial`（指针秤，圆盘）、`jug`（量杯 / 烧杯 / 量杯形的罐，竖刻度）、`balance`（两盘天平）。**刻度语法与数轴同源**：每一种都是一条带刻度的数轴（尺是直的、秤是弯成圆的、量杯是竖着的），共用一套 `from` / `to` / `major` / `minor` / 读数 / 放大镜 / 数格子（§3.2）。A9（代数天平）以后直接用这里的 `balance` | 同意；五种一次做完 | 定稿 |
| D5 | **"每一小格是多少"是全课的核心技能**，单独成第 03 步，并在第 06（秤）、10（量杯）、11（两种单位的刻度）步各再用一次：找两个相邻的标了数的刻度 → 两数之差 ÷ 中间的**格数**（不是刻度线数）= 每一小格 → 从箭头 / 指针下面那个标了数的刻度往上数。EN 用 MOE 课本的说法 "Each small part stands for 20 g"（S4 2A 第 138–140 页；3B 第 55 页 "Each marking represents 100 g"），不用 "division" / "interval"；ZH "每一小格表示 20 g" | 同意 | 定稿 |
| D6 | **秤盘是弯起来的数轴**：第 06 步第 2 拍用新过渡 `unroll` 把圆盘刻度拉直成一条数轴（同样的刻度、同样的数），再卷回去；小测里指针秤 / 量杯的题在 VIEW 组里可以切到"拉直的刻度"（整数数轴，§3.7） | 同意 | 定稿 |
| D7 | **新小测类型**：`read-scale`（读器具上的数：尺上物体的长、指针、液面、箭头）、`set-scale`（画一条线 / 往秤上加东西让指针指到 / 往量杯里倒到 / 天平上放砝码直到平）、`count-intervals`（点出两个标了数的刻度之间的每一小格，再写每一小格表示多少）；`compare`、`order`、`choose`、`input` 扩到量（带单位、复合单位，§3.4） | 同意 | 定稿 |
| D8 | **读数落在刻度上**：除第 01 步"量到最接近的厘米"（P1 1.4）外，所有题的读数正好在某条刻度线上；讲解拍里可以出现"在两条刻度之间，大约是 1 kg"（S4 2A 第 135 页 "about 1 kg" 的做法），题目不考"估读"。最接近的厘米：端点离最近的整厘米 0.2–0.4 cm，不出正好一半 | 同意 | 定稿 |
| D9 | **每一小格的取值**：1、2、5、10、20、50、100、200、250（250 只用于 1000 被分成 4 段的量杯 / 秤）；每两个标了数的刻度之间 1–10 格（1 只用于每条刻度都标数的尺）；桥步另有 0.1、0.05、0.01（§1.3 `limits`）。理由：S4 课本用 10 g、100 g、1 kg、50 ml、5 ml、1 ml；S9（Numicon）列 2、5、10、20、25、50、100 | 同意 | 定稿 |
| D10 | **量杯的液面画平的**，**不讲弯月面**（meniscus）：MOE 3B 量体积一章没有弯月面、液面画成水平线（S4 第 62 页）；弯月面是科学课的事。正文只说"从侧面看、眼睛和水面一样高，读水面对着的那条刻度" | 同意 | 定稿 |
| D11 | **单位记号**：照课纲与 MOE 课本写 **ℓ** 和 **ml**（"We write ℓ for litre." S4 2B 第 76 页；"We write ml for millilitre." 3B 第 62 页），不写 L / mL / mℓ；cm、m、km、g、kg 照常。**不教 mm**：P1–P3 课纲没有毫米（S1 第 32、34、36 页），所以 brief 里的"雨量计"不用（雨量按毫米记深度，S17）。复合单位写 `2 m 35 cm`、`3 kg 40 g`、`1 ℓ 250 ml`、`4 km 50 m`，中英文都用符号，ZH 读作"2 米 35 厘米" | 同意 | 定稿 |
| D12 | **复合单位与换算的数字**：课纲 P3 1.3 写"numbers involved should be within easy manipulation"：大单位 ≤ 9；小单位 cm 1–99，g / ml / m 5–995 且是 5 的倍数（读器具时是刻度值）；每步至少三成的题带"占位的 0"（`3 kg 40 g`、`4 m 6 cm`、`2005 g`），因为这正是本步的误解；只做"复合 ↔ 小单位"（P3 1.3），"小单位 ↔ 大单位的小数形式"留给第 13 步（P5） | 同意 | 定稿 |
| D13 | **误解码**：新开一个误解域 **`measure-reading`**（`measure` 已经是方格课的面积与周长域，不混用），新增 11 个码（§2.1）；**复用** 4 个旧码：`tick-counting`（分数域：数刻度线不数格，与"从 1 数起""数刻度线"是同一个误解）、`interval-misread`（小数域：每一格当成了别的大小）、`unit-factor-wrong`、`decimal-as-subunit`（小数域）。复用用 docs/29 X6 已经做好的"一码多域"：域名单里列出、规则写进 `lib/diagnose/measure-reading.ts`，一道题按自己的域诊断 | 同意 | 定稿 |
| D14 | **中文术语**：长度、**质量**（mass；正文口语说"有多重""哪个重"，"重量"是日常说法，不作术语）、**容量**（volume of liquid，"装了多少水"；名词表注明英文 MOE 写 volume，五年级正方体、长方体的"体积"是同一个量的另一面）、厘米 / 米 / 千米、克 / 千克、升 / 毫升（引擎朗读已用"千米""千克"，与小数课一致；名词表注"新加坡口语常说公斤、公里，1 公斤 = 1 千克"）、刻度、每一小格、天平、量杯（beaker 在实验室叫烧杯，本课一律"量杯"）、复合单位（复名数）、估计。依据：没有查到新加坡小学数学的官方中文术语标准（S5 调研的结论），以大陆小学课本用法为底、新加坡日常用法作注（§4） | 同意 | 定稿 |
| D15 | **情境**：新加坡日常——湿巴刹的指针秤（"称之前先看指针是不是指着 0"，S15、S16）、学校的 15 cm 尺（S19）、身高尺（小一、小三的健康检查量身高，S18；身高数字虚构）、熟食中心的甘蔗水（毫升数虚构，不说"一杯通常多少"）、1.5 ℓ / 500 ml 的水瓶（无牌子）、5 kg 一袋的米（虚构）、黄梨（pineapple）、木瓜、西瓜、鱼、虾、空心菜；公园连道的"每 100 m 一个距离标"写成虚构（"这条路每 100 m 立一根桩"），不说哪条真实路线。人名多族群（Mei Ling、Aisha、Ravi、Wei Jie、Siti、Arjun、Hui Min、Daniel、Farah、Kumar）；无品牌、无价格 | 同意 | 定稿 |
| D16 | **背景章 00**：照小数 00 章改写（讲节拍、章节轴、小测、再来一道 / 跳过、五种器具），**不写年级**；舞台标本是一台指针指着 0 的 0–1000 g 指针秤；不计入步数 | 同意 | 定稿 |
| D17 | **步数**：13 个课步 + 练习 + 00（与小数 15 步相近）。拍 57 个 ≈ 19 分钟，小测 13 道 ≈ 9 分钟，练习 8 道 ≈ 5 分钟：**全课约 33 分钟**；P2 部分（01–09）约 19 分钟，可以分两次做 | 同意 | 定稿 |
| D18 | **图**：Codex 已有的三张草图**都不用**（§6.1）：首页图和小数课的首页图几乎一样（尺 + 量杯 + 厨房秤，两张卡片挨着），两张章节图的刻度**间距不均**（量过：量杯刻度间距 17–27 px，长刻度之间 4 到 8 格不等；尺子长刻度之间的小格数也不一致），放在一节"每一小格一样大"的课里正好讲反了。新的一套：首页图 = 湿巴刹指针秤上的一条鱼；章节图 3 张 = 身高尺（第 04 章）、天平上的大球与小石头（第 05 章）、甘蔗水（第 07 章），都**不靠刻度**说事 | 同意；配图可以晚于课上线 | 定稿 |

**待核（不阻塞施工，Gavin 手边有课本时翻一页即可）**：① 2A 第 3 章（长度）用不用 "Each small part stands for" 的说法讲卷尺 / 米尺（本文只核到质量一章，S4 2A 第 138–140 页）；② 女儿学校的华文老师讲到 kg 时说"千克"还是"公斤"（D14 的朗读跟引擎走"千克"，若孩子更熟"公斤"，改 `words.ts` 一处即可）。

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字；2026-10-19 从 PDF 抄录，与 Codex `syllabus.json` 一致）

| 级 | 子线 · 条目 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|---|
| **P1**（地基） | Measurement · 1. Length | 1.1 measuring length in centimetres · 1.2 use of abbreviation cm · 1.3 comparing and ordering lengths in cm · 1.4 measuring and drawing a line segment to the nearest cm | 32 | 第 01、02 步（1.1、1.2、1.4）；第 09 步（1.3） |
| **P2** | Measurement · 1. Length, Mass and Volume | 1.1 measuring · length in metres · mass in kilograms/grams · volume of liquid in litres | 34 | 第 03、04（长度）、05、06（质量）、07（容量）步 |
| **P2** | 同上 | 1.2 using appropriate units of measurement and their abbreviations m, g, kg, ℓ | 34 | 第 04、05、07、08 步 |
| **P2** | 同上 | 1.3 comparing and ordering · lengths · masses · volumes | 34 | 第 05（天平）、07（倒进一样的杯）、09 步 |
| **P3** | Measurement · 1. Length, Mass and Volume | 1.1 measuring · length in kilometres (km) · volume of liquid in millilitres (ml) | 36 | 第 10（ml）、11（km）步 |
| **P3** | 同上 | 1.2 measuring length/mass/volume (of liquid) in compound units | 36 | 第 11 步 |
| **P3** | 同上 | 1.3 converting a measurement in compound units to the smaller unit, and vice versa · kilometres and metres · metres and centimetres · kilograms and grams · litres and millilitres (numbers involved should be within easy manipulation) | 36 | 第 12 步 |
| P4（地基） | Decimals · 1. Decimals up to 3 decimal places | 1.1 notation, representations and place values (tenths, hundredths, thousandths) | 38 | 第 13 步"你已经知道"（小数课第 02–04 步） |
| P5（桥） | Decimals · 1. Four Operations | 1.2 converting a measurement from a smaller unit to a larger unit in decimal form, and vice versa · kilometres and metres · metres and centimetres · kilograms and grams · litres and millilitres | 41 | 第 13 步 |
| P5（不做） | Area and Volume · 2. Volume of Cube and Cuboid | 2.5 finding the volume of liquid in a rectangular tank · 2.6 relationship between ℓ (or ml) with cm³ | 42 | 不做（将来 `volume` 主题） |

课纲框架（S1）：**Big Ideas about Measures**（第 12 页）—— "Numbers are used as measures to quantify a property … Many measures have units. Zero means the absence of the property in most cases."（第 06 步第 1 拍"先看指针指着 0"、第 01 步"从 0 量起"的依据）；**Skills**（第 14 页）—— "measurement, use of mathematical tools and estimation are explicitly taught."（估计的依据：估计不是单列的课纲条目，是贯穿的技能，本课在第 04、08 步正面讲，题库里只出"哪个估计合理"的选择题）。CPA 的依据同 docs/29：S3。

核对要点（纠正常见二手说法，包括 docs/17）：
- **2021 课纲 P1 没有"非标准单位"那一行**：第 32 页 P1 Length 只有 cm 的四条；旧课纲有"non-standard units"，现行版没有（S5 调研：旧版只作历史线索）。所以本课不做"用回形针量"，00 章也不提。
- **P2 已经要"比较与排序"质量和容量**（1.3），不只是长度；P2 的容量只有**升**，毫升在 P3。
- **km 和 ml 都在 P3 1.1**，不在 P2（docs/17 §2.2 那一行写对了，brief 里的"P2 m kg g ℓ"同）。
- **复合单位的小数形式在 P5**（第 41 页）；P3 1.3 的换算是"复合单位 ↔ 小单位"，没有小数。P4 Decimals 没有"量的小数"条目，所以第 13 步标桥、引 P5 1.2，P4 1.1 只作地基。
- **课纲没有写进率**（1000、100）：进率出自 SI 词头（S14 第 138 页：kilo = 10³、centi = 10⁻²、milli = 10⁻³），课本 S4 3B 第 62 页 "1 ℓ = 1000 ml"。
- **"nearest marking""each small division is" 在 MOE 课本里都没有**（S5 调研逐页查过 2A、3B）；课本的说法是 "Each small part stands for 10 g""Each long marking represents 1 kg""about 1 kg"。本课 EN 照课本（D5）。

### 1.2 级别、步数与时间

- **13 个课步 + 练习章 + 背景章 00**（14 个带编号的章，00 不计）。
- 地基 P1（01–02）→ 主体 P2（03–09）→ P3（10–12）→ 桥 P5（13，可选）。
- 拍 57 个（每拍 ~20 s ≈ 19 min），小测 13 道（~40 s ≈ 9 min），练习 8 道（≈ 5 min）：**全课约 33 分钟**。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字（`limits`） |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | dial（标本） | — | — | — |
| 01 | `using-a-ruler` | Measuring with a ruler | 用尺子量 | P1 1.1, 1.2, 1.4 | ruler | 5 | 9 · read-scale / set-scale / choose | cm；尺 0–15 或 0–30；物体 2–15 cm、从 0 起；`nearest`（只本步） |
| 02 | `not-from-zero` | When it does not start at 0 | 不从 0 开始 | P1 1.1, 1.4 | ruler（含断尺） | 4 | 9 · read-scale / count-intervals / choose | cm；起点 1–10，长 2–15 cm；断尺从 2–8 起 |
| 03 | `reading-scales` | What each small part stands for | 每一小格表示多少 | P2 1.1 | tape（横）· tape（竖，身高尺） | 5 | 10 · count-intervals / read-scale / set-scale | cm；每小格 2、5、10、20；读数 ≤ 200 cm |
| 04 | `metres` | Metres | 米 | P2 1.1, 1.2 | tape（米尺、卷尺） | 4 | 9 · read-scale / choose / set-scale | m（整米）≤ 20；每小格 1、2、5；cm ↔ m 只有"1 m = 100 cm" |
| 05 | `mass-and-balances` | Heavier, lighter, the same | 质量：哪个重 | P2 1.1, 1.2, 1.3 | balance | 4 | 9 · choose / set-scale(weights) / read-scale | 砝码 1 kg、500 g、200 g、100 g、50 g、20 g、10 g；≤ 1000 g 或整千克 ≤ 10 |
| 06 | `weighing-scales` | Reading a weighing scale | 读指针秤 | P2 1.1, 1.2 | dial | 5 | 10 · read-scale / count-intervals / set-scale / choose | g：0–500、0–1000，每小格 10、20、50、100；kg：0–10，每小格 1 |
| 07 | `volume-and-litres` | How much does it hold? | 容量与升 | P2 1.1, 1.2, 1.3 | jug（成对、没有数的一样的杯 / 标了升的量杯） | 4 | 9 · choose / read-scale / set-scale / order | ℓ（整升）≤ 10，每小格 1、2 |
| 08 | `choosing-units` | Which unit? Guess first | 用哪个单位，先估一估 | P2 1.2 · S1 第 14 页（估计） | ruler · dial · jug（三件并排）· balance | 4 | 9 · choose / input(measure + 单位芯片) | cm、m、g、kg、ℓ |
| 09 | `comparing-measures` | Comparing and ordering | 比一比，排一排 | P1 1.3 · P2 1.3 | ruler / dial / tape 成对或三件 | 4 | 10 · compare / order / choose / input | 同一单位或只差"1 m = 100 cm""1 kg = 1000 g"；≤ 1000 |
| 10 | `millilitres` | Millilitres and measuring cups | 毫升与量杯 | P3 1.1 | jug（量杯 / 烧杯） | 5 | 10 · read-scale / count-intervals / set-scale / choose | ml：0–100、0–500、0–1000，每小格 5、10、20、50、100、250 |
| 11 | `compound-units` | Two units at once | 复合单位 | P3 1.1（km）, 1.2 | tape（身高尺 m / cm、路 km / m）· dial（kg / g）· jug（ℓ / ml） | 4 | 10 · read-scale(compound) / set-scale / choose / compare | 大单位 ≤ 5；小格 1 cm、2 cm、100 g、50 g、100 ml、100 m |
| 12 | `converting-units` | Changing to the smaller unit and back | 化成小单位，再化回来 | P3 1.3 | tape · balance · jug（`brackets` 两段） | 5 | 10 · input(whole / compound) / choose / compare | 大单位 ≤ 9；cm 1–99，g / ml / m 5–995 且 5 的倍数；≥ 3 道带占位 0 |
| 13 | `scales-in-decimals` | Scales in decimals（桥） | 刻度上的小数 | P5 Decimals 1.2 · P4 Decimals 1.1 | dial（kg，每小格 0.1）· jug（ℓ）· tape（身高尺 m，`zoom`） | 4 | 9 · read-scale(decimal) / input(convert) / choose | 一位或两位小数；kg↔g、ℓ↔ml、m↔cm、km↔m |
| 14 | `practice` | Practice | 练习 | P1–P3 全部 | 按题 | — | 8 道固定题 | — |

### 1.4 不在本课

- **时间**（P1 2、P2 2、P3 2）：`telling-time`。**面积与周长**：`area-perimeter`。
- **毫米、雨量**：课纲 P1–P3 没有 mm（D11）；雨量是"深度"，科学课的事（S17）。
- **弯月面**、量筒的读数技巧（D10）。
- **电子秤**：只在第 06 步正文提一句"电子秤直接显示数，本课学读指针"（MOE 2A 第 147 页、3B 第 78 页都画了电子秤，S4），不做题。
- **质量与重量的物理区别**（重力）：科学课；本课只说"质量 = 有多重"。
- **立方厘米、液体在长方体水箱里的体积**（P5 第 42 页）：将来的 `volume` 主题。
- **小单位 ↔ 大单位的小数换算的全部做法**：小数课第 15 步（docs/29）已经讲了位值移位；本课第 13 步只讲"刻度上的小数怎么读、读完怎么换"，正文最后一句链到小数课第 15 章。
- **非标准单位**（§1.1 核对要点）。
- 量角器（`angles`）、条形图的刻度（`graphs`，docs/17 A7；那边的"换刻度"和本课第 03 步同源，施工时互相链接）。

---

## 2. 课的设计

### 2.0 写法约定（照 skill `writing-rules.md`）

- 一拍讲一件事：看什么 + 为什么；EN ≤ 35 词、ZH ≤ 60 字；第一拍接"你已经知道的"，最后一拍给结论或一个应用。
- 算式行短：`8 − 3 = 5`、`100 ÷ 5 = 20`、`200 + 4 × 20 = 280`、`1 m 32 cm = 132 cm`、`1 kg > 900 g`；未知写 `?`；不在算式里写解释。只有文字时用 `words`（如 `{ en: "The stone is heavier.", zh: "石头更重。" }`）。
- **量一律写 `{u:…}` 记号**（字幕、算式、题目、正文）：`{u:9 cm}`、`{u:350 g}`、`{u:1 l 250 ml}`（显示 `1 ℓ 250 ml`，读 "1 litre 250 millilitres" /「1 升 250 毫升」）；validate 拦"裸写的数 + 单位"（M8，§3.0）。本文表格为了好读直接写 `9 cm`，施工时换成记号。
- **固定说法**（全课一致，三处都要一样）：EN "Each small part stands for 20 g." / ZH "每一小格表示 20 g。"；EN "Count the parts, not the marks." / ZH "数格子，不数刻度线。"；EN "Start at 0." / ZH "从 0 量起。"
- 颜色只表示"谁的"：给定的（物体、液体、秤上的东西）= cold；孩子放的 / 画的 / 倒的 / 点出的格子 = signal；第二个（比较时的另一个）= hot；"看答案" = 墨色虚线（虚线指针、虚线液面、虚线端点）。刻度一律墨线，标了数的长刻度粗一点，不用红绿判对错。
- 口吻：平静、第二人称、先具体后符号；不用感叹号，不说 easy / wrong / 错了 / 太棒了；错误反馈 = 原因 + 下一步看哪里。

### 2.1 误解目录（量读数域 `measure-reading`；§3.6 写诊断规则）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `tick-counting`（复用） | 数刻度线不数格；从 1 数起 | 从 3 到 8 的钥匙说 6 cm；0 和 100 之间有 4 条短线说每格 25；指针在 200 后 4 格说 300 | "From 3 to 8 there are 6 marks but 5 parts. Count the parts, not the marks." / "从 3 到 8 有 6 条刻度线，却只有 5 格。数格子，不数刻度线。" | S6、S7、S8 |
| `read-end-mark` | 物体不从 0 开始时，直接读末端对着的数（含"对准 1""对准尺子边"） | 从 3 到 8 的钥匙说 8 cm；对准 1 的橡皮说 5 cm（其实 4 cm） | "The key starts at 3, not 0. Take away: 8 − 3 = 5." / "钥匙从 3 开始，不是从 0。用减法：8 − 3 = 5。" | S6、S7、S8 |
| `not-nearest` | 端点在两条刻度之间时，取了远的那一条（多半是一律取小的） | 端点在 6.7 处说 6 cm | "The end is past halfway between 6 and 7, so it is nearer 7." / "末端过了 6 和 7 的中间，离 7 更近。" | S1 第 32 页 P1 1.4 |
| `interval-misread`（复用） | 每一小格当成 1（或当成"总是十格"） | 每格 20 g 的秤，指针在 200 后 4 格说 204 g；每格 50 ml 说 302 ml | "Between 200 and 300 there are 5 parts, so each part stands for 20 g, not 1 g." / "200 到 300 之间有 5 格，每一小格表示 20 g，不是 1 g。" | S9、S5 调研、S4 2A 第 138 页 |
| `wrong-unit` | 数对了，单位写错 / 选了不合适的单位 | 秤上是 g，写 350 kg；铅笔长 15 m | "The dial is marked in grams, so the fish is 350 g. 350 kg would be heavier than four grown-ups together." / "秤上写的是克，鱼是 350 g。350 kg 比四个大人加起来还重。" | S1 第 34 页 P2 1.2 |
| `unreasonable-estimate` | 估计离谱（只用于 `choose`） | 门高 20 m；木瓜 100 kg | "A door is about 2 m tall. 20 m is as tall as ten doors stacked up." / "门大约 2 m 高。20 m 有十扇门叠起来那么高。" | S1 第 14 页 |
| `ignored-unit` | 不看单位，只比数 | 900 g > 1 kg；排序 85 cm、120 cm、1 m 排成 1 m 最短 | "900 is more than 1, but 1 kg is 1000 g. Change to the same unit, then compare." / "900 比 1 大，可是 1 kg 是 1000 g。先换成同一个单位，再比。" | S1 第 34 页 P2 1.3（本课提出的诊断） |
| `size-is-mass` | 大的就重（只用于 `choose`） | 选大球比小石头重 | "Look at the balance, not the size: the pan with the stone went down." / "看天平，不看大小：放石头的那边沉下去了。" | S10、S11、S4 2A 第 148 页 |
| `taller-holds-more` | 高的就装得多（只用于 `choose`） | 选又高又细的瓶子装得多 | "Pour both into the same kind of cup. The bowl's water came up higher." / "倒进一样的杯子里比：碗里的水升得更高。" | S1 第 34 页 P2 1.3、S4 2B 第 68–77 页 |
| `balance-misread` | 天平高起来的一边重（只用于 `choose`） | 选翘起来的那边 | "On a balance, the heavier side goes down." / "天平上，重的一边往下沉。" | S11 |
| `compound-concatenated` | 复合单位化小单位时，把两个数并排写 | 3 kg 40 g = 340 g；2 km 35 m = 235 m；4 m 6 cm = 46 cm | "3 kg is 3000 g. Add 40 g: 3040 g. 340 g is less than 1 kg." / "3 kg 是 3000 g，再加 40 g：3040 g。340 g 还不到 1 kg。" | S12（本课提出的诊断） |
| `compound-place` | 小单位那部分放错了位（漏写 / 多写占位的 0） | 3 kg 40 g = 3400 g；1 m 5 cm = 150 cm；3040 g = 3 kg 4 g；读 1 m 5 cm 写 1 m 50 cm | "40 g is forty grams, so it fills the tens: 3040 g. 3400 g would be 3 kg 400 g." / "40 g 是四十克，占十位和个位：3040 g。3400 g 是 3 kg 400 g。" | S12 |
| `compound-split-wrong` | 小单位化复合单位时，在错的位置拆开 | 1250 ml = 12 ℓ 50 ml；2350 g = 23 kg 50 g | "1 ℓ is 1000 ml, so take out 1000 ml: 1 ℓ and 250 ml left." / "1 ℓ 是 1000 ml，先拿出 1000 ml：1 ℓ，还剩 250 ml。" | S12、S13 |
| `unit-factor-wrong`（复用） | 进率用错（km、kg、ℓ 用 100；m 用 1000） | 5 km = 500 m；3 ℓ 250 ml = 550 ml；4 m = 4000 cm | "1 km = 1000 m, not 100 m." / "1 km = 1000 m，不是 100 m。" | S13、S14 |
| `decimal-as-subunit`（复用，桥） | 小数部分当成小单位的个数 | 1.4 kg = 1 kg 4 g；1.3 ℓ = 1003 ml | "The 4 is 4 tenths of a kilogram. A tenth of 1000 g is 100 g, so 1.4 kg = 1400 g." / "4 是 4 个十分之一千克。1000 g 的十分之一是 100 g，所以 1.4 kg = 1400 g。" | docs/29 S8；S12 |

诊断只认题目声明过的 code（`feedback.wrong[].when`、`choose` 错选项的 `misconception`）。每个 code 至少在一拍里**正面讲**（拍表里标 ⚑），至少一道题库题能诊断它（§8 验收）。`size-is-mass`、`taller-holds-more`、`balance-misread`、`unreasonable-estimate` 只由 `choose` 选项诊断（同时间域的 `hour-hand-on-numeral`）。

### 2.2 逐步设计

拍表的列：`#` · **模型状态**（§3.2 的写法，简写）· **过渡**（`move`）· **算式**（`equation` 或 `words`）· **字幕 EN / ZH**（草稿）。第一拍不写 `move`。简写：`ruler{0–15 cm; pencil 0→9}` = `{ kind: "instrument", type: "ruler", unit: "cm", from: 0, to: 15, major: 1, minor: 1, object: { kind: "pencil", from: 0, to: 9 } }`；`tape{…}`、`dial{…}`、`jug{…}`、`bal{…}` 同理；`M` = 标数的间隔（major），`i` = 每一小格（minor）；`count{a→b}` = 数格子的弧，`zoom{a→b}` = 放大镜，`brackets` = 刻度下的两段括号。

---

#### 第 01 步 `using-a-ruler` · 用尺子量（P1 1.1, 1.2, 1.4，地基）

**概念**：物体的一端对准 0；长度是从 0 到另一端有几个 1 cm 的**格**；末端在两条刻度之间时，取近的那一条。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `ruler{0–15 cm, M 1, i 1; pencil 0→9}` | — | `9 cm` | This is a 15 cm school ruler. Line one end of the pencil up with 0. The other end is at 9, so the pencil is 9 cm long. | 这是一把 15 cm 的学校尺子。铅笔的一端对准 0，另一端对着 9，所以铅笔长 9 cm。 |
| 2 ⚑ | 同上 + `count{0→9}` | `jump` | `9 × 1 cm = 9 cm` | A centimetre is the part between two marks. Count the parts the pencil covers: 1, 2, 3 … 9. The 0 mark is where you start, so you do not count it. | 1 厘米是两条刻度线中间的那一格。数铅笔盖住了几格：1、2、3……9。0 那条线是起点，不算一格。（`tick-counting`） |
| 3 ⚑ | `ruler{…, inset 0.6, highlight [0]; eraser 0→4}` | `slide` | `4 cm` | On many rulers, 0 is a little way in from the end. Line the eraser up with the 0 mark, not with the edge of the ruler and not with 1. | 很多尺子的 0 不在最边上，而是往里一点。橡皮要对准 0 这条刻度线，不是对准尺子的边，也不是对准 1。（`read-end-mark`） |
| 4 ⚑ | `ruler{…; crayon 0→6.7}`，6.5 处画短虚线 | `slide` | `about 7 cm` | This crayon ends between 6 and 7. It is past halfway, so it is nearer 7. To the nearest centimetre, the crayon is about 7 cm long. | 蜡笔的末端在 6 和 7 之间，过了中间，离 7 更近。量到最接近的厘米，蜡笔大约长 7 cm。（`not-nearest`） |
| 5 | `ruler{…; line 0→5, tone signal}` | `morph` | `5 cm` | To draw a line 5 cm long, put your pencil on 0 and draw along the ruler until you reach 5. | 画一条 5 cm 长的线：笔尖放在 0，沿着尺子画到 5 停下。 |

**要点**：① Start at 0. / 从 0 量起。② A centimetre is a part between two marks: count the parts, not the marks. / 1 厘米是两条刻度线中间的一格：数格子，不数刻度线。③ If the end is between two marks, choose the nearer one. / 末端在两条刻度之间，取近的那一条。

**题库（9）**：4 道 `read-scale`（`form: "whole"`、`unit: "cm"`：铅笔 0→12，错例 `"13"` → `tick-counting`；叶子 0→8.3 量到最接近的厘米 → 8，错例 `"9"` → `not-nearest`；钥匙 0→5.7 → 6，错例 `"5"` → `not-nearest`；吸管 0→11 在 0 往里 0.5 的尺上）；2 道 `set-scale`（`mode: "line"`：画 7 cm 的线，错例 `"6"` → `tick-counting`（把 0 那条线也数成一格）；画 11 cm）；3 道 `choose`（哪一幅量对了：对准 0 ✓、对准尺子边 → `read-end-mark`、对准 1 → `read-end-mark`；吸管长多少：6 cm ✓、7 cm → `tick-counting`；哪一支蜡笔量到最接近的厘米是 9 cm）。人名：Hui Min 量文具。

---

#### 第 02 步 `not-from-zero` · 不从 0 开始（P1 1.1, 1.4，地基）

**概念**：物体不从 0 开始（或尺子断了）也能量：数从一端到另一端有几格，或者用"末端 − 起点"。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `ruler{0–15 cm; key 3→8}` | — | `? cm` | Ravi's key does not start at 0. Its left end is at 3 and its right end is at 8. | Ravi 的钥匙不是从 0 开始的：左端在 3，右端在 8。 |
| 2 ⚑ | 同上 + `count{3→8}` | `jump` | `8 − 3 = 5` | Count the parts the key covers, from 3 to 8: there are 5. Or take away: 8 − 3 = 5. The key is 5 cm long, not 8 cm. | 数钥匙盖住了几格，从 3 到 8：一共 5 格。也可以用减法：8 − 3 = 5。钥匙长 5 cm，不是 8 cm。（`read-end-mark`） |
| 3 ⚑ | 同上，`highlight [3,4,5,6,7,8]`（6 条刻度线加粗） | `shade` | `6 marks · 5 parts` | From 3 to 8 there are 6 marks, but only 5 parts between them. Counting the marks gives 6 cm, one too many. | 从 3 到 8 有 6 条刻度线，中间却只有 5 格。数刻度线会得到 6 cm，多了 1。（`tick-counting`） |
| 4 | `ruler{4–15 cm, broken; ribbon 6→13}` | `morph` | `13 − 6 = 7` | Part of this ruler has broken off, so it starts at 4. You can still measure: the ribbon goes from 6 to 13. That is 7 parts, so it is 7 cm long. | 这把尺子断了一截，从 4 开始。照样能量：丝带从 6 到 13，是 7 格，长 7 cm。 |

**要点**：① Length is the number of parts from one end to the other. / 长度是从一端到另一端有几格。② You can take away: end − start. / 也可以用减法：末端 − 起点。③ There is always one more mark than parts. / 刻度线总比格子多 1。

**题库（9）**：4 道 `read-scale`（物体 a→b，`a ≠ 0`：错例 `"b"` → `read-end-mark`、`"b − a + 1"` → `tick-counting`）；2 道 `read-scale`（断尺，起点 3、5）；1 道 `count-intervals`（`ask: "length"`：点出钥匙盖住的每一格，再写长度）；2 道 `choose`（两件东西位置不同、哪两件一样长；"Wei Jie 说丝带长 13 cm，他看的是哪里" → 末端读数，`read-end-mark` 的说法选项）。

---

#### 第 03 步 `reading-scales` · 每一小格表示多少（P2 1.1，全课的核心）

**概念**：不是每条刻度线都标数。找两个相邻的标了数的刻度，两数之差 ÷ 中间的格数 = 每一小格表示多少；再从箭头下面那个标了数的刻度往上数。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `tape{0–50 cm, M 10, i 5; arrow 35}` | — | `? cm` | Not every mark on this measuring tape has a number. The numbers go up in tens, with one short mark halfway between them. | 这条卷尺上，不是每条刻度线都标了数。数一次跳 10，两个数中间只有一条短线。 |
| 2 ⚑ | 同上 + `zoom{30→40}` + `count{30→40}` | `zoom` | `40 − 30 = 10 · 10 ÷ 2 = 5` | From 30 to 40 there are 2 small parts. 10 shared between 2 parts is 5, so each small part stands for 5 cm, not 1 cm. | 从 30 到 40 有 2 小格。10 平均分成 2 格，每格 5，所以每一小格表示 5 cm，不是 1 cm。（`interval-misread`） |
| 3 | 同上，箭头处标出 | `place` | `30 + 5 = 35` | Start at the numbered mark just below the arrow, 30, and count on one small part of 5. The arrow points to 35 cm. | 从箭头前面那个标了数的刻度 30 开始，往后数一格，每格 5：箭头指着 35 cm。 |
| 4 ⚑ | `tape{100–150 cm, vertical, look "height-chart", M 10, i 2; head 128}` + `count{120→130}` | `morph` | `130 − 120 = 10 · 10 ÷ 5 = 2` | Mei Ling's height chart counts in tens, with 4 short marks between the numbers. 4 marks make 5 parts, so each small part stands for 2 cm. Count the parts, not the marks. | Mei Ling 的身高尺一次跳 10，两个数中间有 4 条短线。4 条线分出 5 格，每一小格表示 2 cm。数格子，不数刻度线。（`tick-counting`） |
| 5 | 同上，`count{120→128}` | `jump` | `120 + 4 × 2 = 128` | The head board is 4 small parts above 120: 122, 124, 126, 128. Mei Ling is 128 cm tall. | 头顶的木板在 120 上面 4 格：122、124、126、128。Mei Ling 身高 128 cm。 |

**要点**：① Find two numbered marks next to each other. / 找两个相邻的、标了数的刻度。② Their difference ÷ the number of parts = what each small part stands for. / 两数之差 ÷ 格数 = 每一小格表示多少。③ Count on from the numbered mark just below. / 从下面那个标了数的刻度往上数。

**题库（10）**：4 道 `count-intervals`（`ask: "part"`：10 之间 1 条短线 → 5；10 之间 4 条 → 2；20 之间 1 条 → 10；100 之间 4 条 → 20；错例 `"=1"` → `interval-misread`、`"=25"`（100 ÷ 4）→ `tick-counting`）；4 道 `read-scale`（卷尺 / 身高尺，每小格 2、5、10、20：错例 `L + k`（每格当 1）→ `interval-misread`、`L + (k + 1)·i` → `tick-counting`）；2 道 `set-scale`（`mode: "arrow"`：把箭头移到 46 cm（每小格 2）、移到 85 cm（每小格 5））。人名：Mei Ling、Arjun。数：cm，≤ 200。

---

#### 第 04 步 `metres` · 米（P2 1.1 length in metres, 1.2）

**概念**：100 cm 是 1 m；短的东西用厘米，长的东西用米；量之前先估一估。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `pair:[tape{0–100 cm, M 10, i 2, look "metre-rule"}, ruler{0–15 cm}]`（一样的比例） | — | `1 m = 100 cm` | This is a metre ruler. It is 100 cm long: 1 metre. Your 15 cm ruler fits along it 6 times, with some left over. | 这是一把米尺，长 100 cm，就是 1 米。你那把 15 cm 的尺子能沿着它放 6 次，还剩一点。 |
| 2 | `tape{0–5 m, M 1, i 1, unit m, look "tape"; object whiteboard 0→3}` | `morph` | `3 m` | Longer things are measured in metres. The whiteboard in Hui Min's class is 3 m long. We write m for metre. | 长的东西用米量。Hui Min 班上的白板长 3 m。米写作 m。 |
| 3 ⚑ | `pair:[ruler{0–15 cm; pencil 0→14}, tape{0–40 m, M 10, i 2; corridor 0→30}]` | `morph` | `14 cm · 30 m` | Measure a pencil in centimetres and a school corridor in metres. A pencil 14 m long would be longer than a bus. | 铅笔用厘米量，学校的走廊用米量。14 m 长的铅笔，比一辆巴士还长。（`wrong-unit`） |
| 4 ⚑ | `tape{0–3 m, vertical, unit m, M 1, i 1; door 0→2}` | `morph` | `about 2 m` | Guess before you measure. A classroom door is about 2 m tall. Something as tall as two doors is about 4 m, not 4 cm and not 40 m. | 量之前先估一估。教室的门大约 2 m 高。有两扇门那么高的东西大约 4 m，不是 4 cm，也不是 40 m。（`unreasonable-estimate`） |

**要点**：① 1 m = 100 cm. / 1 米 = 100 厘米。② Use cm for short things and m for long things. / 短的用厘米，长的用米。③ Guess first, then measure. / 先估一估，再量。

**题库（9）**：3 道 `read-scale`（卷尺，单位 m，每小格 1、2、5：读 7 m、14 m、35 m；错例 `L + k` → `interval-misread`）；1 道 `set-scale`（剪 4 m 的绳：`mode: "line"`，单位 m）；3 道 `choose`（用 cm 还是 m：一本书的宽、游泳池的长、门的高；错选项 → `wrong-unit`）；2 道 `choose`（估计：门高 2 m ✓、20 m → `unreasonable-estimate`、2 cm → `wrong-unit`；巴士长约 12 m）。人名：Hui Min、Kumar。

---

#### 第 05 步 `mass-and-balances` · 质量：哪个重（P2 1.1 mass, 1.2, 1.3 masses）

**概念**：质量就是有多重。天平比轻重：重的一边往下沉，一样高就一样重；大的不一定重。克量轻的东西，千克量重的东西；1 kg = 1000 g。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 ⚑ | `bal{left: [ball (大, 60 g)], right: [stone (小, 400 g)], hideMass}` | — | `words: The stone is heavier. / 石头更重。` | The beach ball is much bigger, but the pan with the stone goes down. On a balance, the heavier side goes down. Bigger is not always heavier. | 沙滩球大得多，可是放石头的那边往下沉。天平上，重的一边往下。大的不一定重。（`size-is-mass`、`balance-misread`） |
| 2 | `bal{left: [pineapple 1000 g], right: [weight 1 kg]}`，倾 → 平 | `tip` | `pineapple = 1 kg` | When the two sides are level, they have the same mass. This pineapple balances a 1 kg weight, so it has a mass of 1 kg. We write kg for kilogram. | 两边一样高，就是一样重。这个黄梨和 1 kg 的砝码一样重，它的质量是 1 kg。千克写作 kg。 |
| 3 | `bal{left: [weight 1 kg], right: [weight 500 g, 200 g, 200 g, 100 g]}` | `tip` | `1 kg = 1000 g` | Grams are for lighter things. We write g for gram. A 1 kg weight balances 1000 g: here 500 g, 200 g, 200 g and 100 g. | 克用来量轻一些的东西，写作 g。1 kg 的砝码和 1000 g 一样重：这里是 500 g、200 g、200 g 和 100 g。 |
| 4 | `bal{left: [flour 750 g], right: [weight 500 g, 200 g, 50 g]}` | `tip` | `500 g + 200 g + 50 g = 750 g` | To find a mass, add weights to the other pan until the beam is level, then add them up. Farah's bag of flour is 750 g. | 要知道东西有多重，就在另一边加砝码，加到天平平了，再把砝码加起来。Farah 的那袋面粉是 750 g。 |

**要点**：① On a balance, the heavier side goes down; level means the same mass. / 天平上重的一边往下沉，平了就是一样重。② Bigger is not always heavier. / 大的不一定重。③ 1 kg = 1000 g. / 1 千克 = 1000 克。

**题库（9）**：3 道 `choose`（看天平选哪个重 / 哪个轻：错选项 → `balance-misread`、`size-is-mass`；三件东西两次称，选最重的）；2 道 `set-scale`（`mode: "weights"`：放砝码让天平平，木瓜 800 g、一袋豆 350 g；托盘芯片 500 g、200 g、100 g、50 g、20 g、10 g）；2 道 `read-scale`（天平已平，`form: "measure"` 写质量：洋葱 = 500 g + 200 g + 20 g → 720 g；西瓜 = 2 个 1 kg → 2 kg，错例 `"2 g"` → `wrong-unit`）；2 道 `choose`（g 还是 kg：一个回形针、一袋 5 kg 的米；错选项 → `wrong-unit`）。

---

#### 第 06 步 `weighing-scales` · 读指针秤（P2 1.1, 1.2）

**概念**：指针秤是弯成圆圈的数轴。称之前先看指针指着 0；找出每一小格表示多少；从指针前面那个标了数的刻度往上数；看清秤上写的是 g 还是 kg。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `dial{0–1000 g, M 100, i 50; value 0, load none}` | — | `0 g` | Before you weigh anything, look at the needle. With nothing on the pan, it should point to 0. You can check this at the wet market too. | 称东西以前，先看指针。盘上什么都没有时，指针应该指着 0。在湿巴刹买东西，也可以这样看一看。 |
| 2 | 同上 → 拉直成 `numberline{scale: whole, 0–1000, step 50, labels by 100}` → 卷回 | `unroll` | `0, 100, 200, …, 1000` | A dial is a number line bent into a circle. Straighten it out and you see the same marks and numbers: 0, 100, 200 … up to 1000. | 秤盘是弯成圆圈的数轴。把它拉直，刻度和数都一样：0、100、200……一直到 1000。 |
| 3 ⚑ | `dial{0–500 g, M 100, i 20}` + `zoom{200→300}` + `count{200→300}` | `zoom` | `300 − 200 = 100 · 100 ÷ 5 = 20` | Between 200 and 300 there are 4 short marks, which make 5 small parts. 100 ÷ 5 = 20, so each small part stands for 20 g, not 25 g. | 200 到 300 之间有 4 条短线，分出 5 小格。100 ÷ 5 = 20，所以每一小格表示 20 g，不是 25 g。（`tick-counting`） |
| 4 ⚑ | 同上，`load prawns, value 280` | `sweep` | `200 + 4 × 20 = 280` | Siti's prawns: the needle is 4 small parts past 200. Count on in twenties: 220, 240, 260, 280. The prawns are 280 g, not 204 g. | Siti 买的虾：指针在 200 后面 4 格。二十二十地数：220、240、260、280。虾是 280 g，不是 204 g。（`interval-misread`） |
| 5 ⚑ | `dial{0–10 kg, M 2, i 1; load watermelon, value 3}` | `morph` | `2 + 1 = 3 kg` | A bigger scale is marked in kilograms. The numbers go up in twos, with one mark between, so each small part stands for 1 kg. The watermelon is 3 kg. | 大一点的秤用千克。数一次跳 2，中间一条短线，所以每一小格表示 1 kg。西瓜是 3 kg。（`wrong-unit`：看清是 g 还是 kg） |

**要点**：① Check that the needle starts at 0. / 先看指针是不是指着 0。② Find what each small part stands for, then count on from the number below the needle. / 先找出每一小格表示多少，再从指针前面那个数往上数。③ Read the unit on the dial: g or kg. / 看清秤上的单位：g 还是 kg。

**题库（10）**：5 道 `read-scale`（`form: "measure"`、`units: ["g","kg"]`：每小格 10 g、20 g、50 g、100 g 各一道，1 道 kg 秤；错例 `L + k` → `interval-misread`、`L + (k + 1)·i` → `tick-counting`、数对单位错 → `wrong-unit`）；2 道 `count-intervals`（0–500 g 每 100 有 4 条短线 → 20；每 100 有 1 条 → 50）；2 道 `set-scale`（`mode: "load"`：往盘里加米直到 450 g（每小格 50）；加到 160 g（每小格 20），错例 `"140"` → `tick-counting`）；1 道 `choose`（哪一台秤指着 350 g，四个秤盘作选项）。情境：湿巴刹的鱼、虾、空心菜；Wei Jie、Siti。

---

#### 第 07 步 `volume-and-litres` · 容量与升（P2 1.1 volume in litres, 1.2, 1.3 volumes）

**概念**：容量就是装了多少液体。比容量：倒进一样的杯子里看谁升得高，高的瓶子不一定装得多。升是容量的单位；量杯从侧面看，眼睛和水面一样高。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 ⚑ | `pair:[jug{shape bottle (高、细), scale false, liquid water}, jug{shape bowl (矮、宽), scale false, liquid water}]` | — | `bottle ? bowl` | A tall, thin bottle and a short, wide bowl, both full of water. The bottle looks as if it holds more because it is taller. Looking is not enough. | 一个又高又细的瓶子，一个又矮又宽的碗，都装满了水。瓶子高，看起来装得多。光看不够。（`taller-holds-more`） |
| 2 | `pair:[jug{0–6 l, shape jug, labels none, M 5, i 1, value 3}, jug{同, value 5, tone hot}]`（一样的两个量杯，刻度不标数） | `fill` | `bottle < bowl` | Pour each into the same kind of jug. The water from the bowl comes up 5 marks; the water from the bottle, only 3. The bowl held more. | 把两边的水各倒进一样的量杯。碗里的水升到第 5 条线，瓶子里的只到第 3 条。碗装得多。 |
| 3 | `jug{0–5 l, M 1, i 1, shape jug; value 3}`，三次倒入 1 ℓ | `fill` | `1 ℓ + 1 ℓ + 1 ℓ = 3 ℓ` | The litre is a unit of volume. We write ℓ for litre. Aisha pours three 1 ℓ cartons of water into a big measuring jug. It comes up to 3 ℓ. | 升是容量的单位，写作 ℓ。Aisha 把 3 盒 1 ℓ 的水倒进一个大量杯，水升到 3 ℓ。 |
| 4 ⚑ | `jug{0–10 l, M 2, i 1; value 7, eye true}` | `fill` | `6 + 1 = 7 ℓ` | Read a measuring jug from the side, with your eyes level with the top of the water. Numbers go up in twos, so each small part stands for 1 ℓ: the pail holds 7 ℓ. | 量杯要从侧面看，眼睛和水面一样高。数一次跳 2，每一小格表示 1 ℓ：桶里有 7 ℓ。（`interval-misread`） |

**要点**：① To compare volumes, pour into the same kind of container. / 比容量，倒进一样的容器里比。② A taller container does not always hold more. / 高的不一定装得多。③ Read the level from the side, eyes level with the water. / 从侧面读，眼睛和水面一样高。

**题库（9）**：3 道 `choose`（倒进一样的杯子后哪个装得多 / 少：错选项 → `taller-holds-more`；三个容器排出"最多"）；3 道 `read-scale`（量杯，单位 ℓ，每小格 1、2；错例 `L + k`（每格当 1，在每格 2 的杯上）→ `interval-misread`）；1 道 `set-scale`（`mode: "fill"`：倒到 4 ℓ）；2 道 `order`（三个量杯读出的数排序：3 ℓ、5 ℓ、2 ℓ，`items` 是量）。

---

#### 第 08 步 `choosing-units` · 用哪个单位，先估一估（P2 1.2 · S1 第 14 页）

**概念**：长度、质量、容量各有自己的单位；按东西的大小选单位；读数之前先估，读出来离估计太远就再读一次。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `set:[ruler{0–15 cm}, dial{0–5 kg}, jug{0–2 l}]`（三件并排，各带标签 LENGTH / MASS / VOLUME） | — | `words: cm · m / g · kg / ℓ` | Three things to measure, three kinds of unit. Length in centimetres and metres. Mass in grams and kilograms. Volume in litres. | 要量的有三种，单位也分三家。长度用厘米、米；质量用克、千克；容量用升。 |
| 2 ⚑ | `pair:[dial{0–20 g, M 5, i 1; load paper-clip, value 1}, dial{0–10 kg, M 2, i 1; load rice, value 5}]` | `morph` | `1 g · 5 kg` | A paper clip is about 1 g, so light things are weighed in grams. A bag of rice is 5 kg. A 5 g bag of rice would hold only a spoonful. | 一个回形针大约 1 g，所以轻的东西用克。一袋米 5 kg。5 g 的一袋米，只有一小勺。（`wrong-unit`） |
| 3 ⚑ | `dial{0–5 kg, M 1, i 1; load papaya}`，指针还没动（`value` 0）→ 估计条 | `sweep` | `about 1 kg` | Guess before you read. A papaya feels about as heavy as the pineapple, about 1 kg, not 1 g and not 100 kg. Then read the scale: 1 kg. | 读之前先估。木瓜拿在手里和黄梨差不多重，大约 1 kg，不是 1 g，也不是 100 kg。再读秤：1 kg。（`unreasonable-estimate`） |
| 4 | `pair:[jug{0–2 l; value 2, shape bottle-jug}, jug{0–10 l; value 8, shape pail}]` | `morph` | `2 ℓ · 8 ℓ` | Volume works the same way. A large bottle of water is about 2 ℓ; a pail for washing the corridor holds about 8 ℓ. If your reading is far from your guess, read again. | 容量也一样。一大瓶水大约 2 ℓ，洗走廊的一桶水大约 8 ℓ。读出来的数离你的估计太远，就再读一次。 |

**要点**：① Length: cm, m. Mass: g, kg. Volume: ℓ. / 长度：cm、m；质量：g、kg；容量：ℓ。② Choose the unit that fits the size. / 按大小选单位。③ Guess first; if a reading is far from your guess, check again. / 先估；读出来离估计太远，再看一遍。

**题库（9）**：5 道 `choose`（最合适的单位：铅笔 / 书桌 / 走廊（cm、m）、橡皮 / 一袋米（g、kg）；最合理的估计：门 2 m、书包 3 kg、一桶水 8 ℓ；错选项 → `wrong-unit`、`unreasonable-estimate`）；2 道 `input`（`form: "measure"`、`units` 芯片：读秤 / 读尺后填数与单位，错例数对单位错 → `wrong-unit`）；2 道 `choose`（"Kumar 说一个西瓜重 3 g，他哪里错了"：选"单位"那一句）。

---

#### 第 09 步 `comparing-measures` · 比一比，排一排（P1 1.3 · P2 1.3）

**概念**：单位一样，比数；单位不一样，先换成同一个单位再比；排序从最小（最短、最轻、最少）开始。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `pair:[ruler{0–15 cm; ribbon 0→12}, ruler{0–15 cm; ribbon 0→9, tone hot}]` | — | `12 cm > 9 cm` | Same unit, so compare the numbers. 12 cm is longer than 9 cm, by 3 cm. | 单位一样，就比数。12 cm 比 9 cm 长，长 3 cm。 |
| 2 ⚑ | `pair:[dial{0–1000 g, M 100, i 50; value 900}, dial{0–5 kg, M 1, i 1; value 1, tone hot}]` | `morph` | `900 g < 1 kg` | 900 is more than 1, but the units are different. 1 kg is 1000 g, so the 1 kg bag is heavier than the 900 g bag. | 900 比 1 大，可是单位不一样。1 kg 是 1000 g，所以 1 kg 那袋比 900 g 那袋重。（`ignored-unit`） |
| 3 ⚑ | `set:[tape{0–150 cm, M 10, i 5; string 0→85}, tape{…; string 0→100 (写 1 m)}, tape{…; string 0→120}]` | `morph` | `85 cm < 1 m < 120 cm` | Order the strings from the shortest. Change 1 m to 100 cm first: 85 cm, then 1 m, then 120 cm. | 把三根绳子从短到长排。先把 1 m 换成 100 cm：85 cm，然后 1 m，然后 120 cm。（`ignored-unit`） |
| 4 | `pair:[dial{0–600 g, M 100, i 10; load mango, value 520}, dial{同; load guava, value 450, tone hot}]` | `morph` | `520 g − 450 g = 70 g` | How much heavier? Take away: the mango is 70 g heavier than the guava. | 重多少？用减法：芒果比番石榴重 70 g。 |

**要点**：① Same unit: compare the numbers. / 单位一样，比数。② Different units: change to the same unit first. / 单位不一样，先换成同一个单位。③ "How much more" is a subtraction. / "多多少"用减法。

**题库（10）**：4 道 `compare`（量：`9 cm ? 12 cm`；`900 g ? 1 kg`，错例 `">"` → `ignored-unit`；`1 m ? 95 cm`；`650 g ? 600 g`；`align: "unit"` 可点"换成同一个单位"）；3 道 `order`（3 个量，混单位：错例按数排 → `ignored-unit`）；2 道 `choose`（三台秤读出最重的）；1 道 `input`（差：两段丝带 15 cm 与 9 cm 差多少）。

---

#### 第 10 步 `millilitres` · 毫升与量杯（P3 1.1 volume in ml）

**概念**：少量的液体用毫升；1 ℓ = 1000 ml；量杯每一小格可能表示 5、10、20、50 或 100 ml，读法和秤一样。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `jug{0–1000 ml, M 100, i 50, shape beaker; value 1000}` | — | `1 ℓ = 1000 ml` | Small amounts of liquid are measured in millilitres. We write ml for millilitre. This beaker holds 1000 ml when full: exactly 1 ℓ. | 少量的液体用毫升量，写作 ml。这个量杯装满是 1000 ml，正好 1 ℓ。 |
| 2 ⚑ | `jug{0–500 ml, M 100, i 50; value 0}` + `zoom{300→400}` + `count{300→400}` | `zoom` | `100 ÷ 2 = 50` | This measuring cup counts in hundreds, with one mark between. 100 ÷ 2 = 50, so each small part stands for 50 ml. | 这个量杯一次跳 100，中间一条短线。100 ÷ 2 = 50，每一小格表示 50 ml。（`interval-misread`） |
| 3 | 同上，`liquid juice, value 350` | `fill` | `300 + 50 = 350` | Daniel's sugar cane juice comes up to the mark just above 300: 350 ml. | Daniel 的甘蔗水升到 300 上面那条线：350 ml。 |
| 4 ⚑ | `jug{0–500 ml, M 100, i 20; value 260}` + `count{200→300}` | `fill` | `100 ÷ 5 = 20 · 200 + 3 × 20 = 260` | On this cup there are 4 short marks between the numbers: 5 parts of 20 ml each. The water is 3 parts above 200: 260 ml. | 这个量杯两个数之间有 4 条短线：5 格，每格 20 ml。水在 200 上面 3 格：260 ml。（`tick-counting`） |
| 5 | `jug{0–1000 ml, M 250, i 50; value 750, eye true}` | `fill` | `750 ml` | Some jugs are numbered every 250 ml. To measure 750 ml for a recipe, pour until the water is level with the 750 mark, with your eyes at the same height. | 有的量杯每 250 ml 标一个数。做菜要 750 ml 水：倒到水面和 750 那条线一样高，眼睛也放在同样高。 |

**要点**：① 1 ℓ = 1000 ml. / 1 升 = 1000 毫升。② Find what each small part stands for: it may be 5, 10, 20, 50 or 100 ml. / 先找每一小格表示多少：可能是 5、10、20、50 或 100 ml。③ Read the level with your eyes at the same height. / 眼睛和水面一样高再读。

**题库（10）**：4 道 `read-scale`（每小格 10、20、50、100 ml；错例 `interval-misread`、`tick-counting`）；2 道 `count-intervals`（100 之间 4 条短线 → 20；1000 ml 量杯每 250 有 4 条 → 50）；2 道 `set-scale`（`mode: "fill"`：倒到 350 ml、680 ml（每小格 20））；1 道 `choose`（哪个等于 1 ℓ：1000 ml ✓、100 ml → `unit-factor-wrong`、10 ml → `unit-factor-wrong`）；1 道 `choose`（哪个杯子里正好 250 ml）。

---

#### 第 11 步 `compound-units` · 复合单位（P3 1.1 km, 1.2）

**概念**：一个量可以用两个单位一起写：先读够了几个大单位，剩下的用小单位。刻度上就是两段：一段整米（千克、升、千米），一段多出来的厘米（克、毫升、米）。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `tape{0–150 cm, vertical, look "height-chart", sub {m, 100}, skip {0→100}, M 10, i 2; head 132}` + `brackets [0→100 "1 m", 100→132 "32 cm"]` | — | `1 m 32 cm = 1 m + 32 cm` | Siti is taller than 1 m. Her head is 32 cm above the 1 m mark, so her height is 1 m 32 cm: two parts, a whole metre and 32 cm more. | Siti 比 1 m 高。她的头顶在 1 m 那条线上面 32 cm，所以身高是 1 m 32 cm：两段，一整米，再多 32 cm。 |
| 2 ⚑ | `dial{0–4 kg, sub {g, 1000}, M 1 kg, i 100 g; load fish, value 2300}` + `count{2 kg→3 kg}` | `sweep` | `1000 g ÷ 10 = 100 g · 2 kg 300 g` | On this wet-market scale, 10 small parts lie between 2 kg and 3 kg, each 100 g. The fish is 3 parts past 2 kg: 2 kg 300 g, not 2 kg 3 g. | 湿巴刹的秤上，2 kg 到 3 kg 之间有 10 小格，每一小格表示 100 g。鱼在 2 kg 后面 3 格：2 kg 300 g，不是 2 kg 3 g。（`interval-misread`） |
| 3 | `tape{0–3 km, sub {m, 1000}, look "path", M 1 km, i 100 m; arrow 1400}` | `morph` | `1 km = 1000 m · 1 km 400 m` | Long distances are measured in kilometres. We write km for kilometre: 1 km = 1000 m. This path has a post every 100 m. Arjun has walked 1 km 400 m. | 长的路程用千米量，写作 km：1 km = 1000 m。这条路每 100 m 立一根桩。Arjun 走了 1 km 400 m。 |
| 4 ⚑ | `pair:[tape{100–200 cm, sub m, M 10, i 5; head 105}, tape{同; head 150, tone hot}]` | `morph` | `1 m 5 cm < 1 m 50 cm` | 1 m 5 cm is just 5 cm past the 1 m mark. 1 m 50 cm is halfway to 2 m. Write the small part as it is: 5 cm is not 50 cm. | 1 m 5 cm 只比 1 m 那条线多 5 cm；1 m 50 cm 已经到 2 m 的一半了。小单位那部分照实写：5 cm 不是 50 cm。（`compound-place`） |

**要点**：① A compound unit has two parts: whole big units, and what is left in small units. / 复合单位有两段：几个整的大单位，剩下的用小单位。② Find what each small part stands for first. / 先找每一小格表示多少。③ 1 km = 1000 m. / 1 千米 = 1000 米。

**题库（10）**：5 道 `read-scale`（`form: "compound"`：身高尺 1 m 26 cm（每小格 2 cm）；秤 1 kg 600 g（每小格 100 g）；量杯 1 ℓ 250 ml（每小格 50 ml）；路 2 km 300 m；秤 3 kg 50 g（每小格 50 g）；错例 `(B, k)`（每格当 1）→ `interval-misread`，`(B, s × 10)` → `compound-place`）；2 道 `set-scale`（倒到 1 ℓ 250 ml；加米到 1 kg 600 g）；2 道 `choose`（哪台秤指着 2 kg 50 g：2 kg 50 g ✓、2 kg 500 g → `compound-place`）；1 道 `compare`（`1 m 5 cm ? 1 m 50 cm`）。

---

#### 第 12 步 `converting-units` · 化成小单位，再化回来（P3 1.3）

**概念**：复合单位化成小单位：大单位 × 进率 + 小单位（km→m、kg→g、ℓ→ml 是 1000，m→cm 是 100）；小单位化成复合单位：先拿出尽量多的整个大单位，剩下的还是小单位。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `tape{0–150 cm, vertical, sub m, skip {0→100}, dual, M 10, i 2; head 132}` + `brackets [0→100 "100 cm", 100→132 "32 cm"]` | — | `1 m 32 cm = 100 cm + 32 cm = 132 cm` | Siti's height again. 1 m is 100 cm, so 1 m 32 cm is 100 cm and 32 cm more: 132 cm. The chart shows both. | 还是 Siti 的身高。1 m 是 100 cm，所以 1 m 32 cm 就是 100 cm 再加 32 cm：132 cm。身高尺上两种写法都有。 |
| 2 ⚑ | `bal{left: [rice 3040 g], right: [1 kg, 1 kg, 1 kg, 20 g, 20 g]}`（平） | `tip` | `3 kg 40 g = 3000 g + 40 g = 3040 g` | 3 kg is 3000 g, and 40 g more makes 3040 g. Writing the 3 and the 40 side by side gives 340 g, which is less than 1 kg. | 3 kg 是 3000 g，再加 40 g，就是 3040 g。把 3 和 40 并排写成 340 g，还不到 1 kg。（`compound-concatenated`） |
| 3 ⚑ | `tape{0–3 km, sub m, look "path", M 1 km, i 50 m; arrow 2350}` + `brackets [0→2000 "2000 m", 2000→2350 "350 m"]` | `morph` | `2 km 350 m = 2000 m + 350 m = 2350 m` | 2 km 350 m: kilometres to metres is × 1000, so 2 km is 2000 m. Add 350 m: 2350 m. Using 100 would give 550 m, about half a kilometre, far too short. | 2 km 350 m：千米化米要乘 1000，2 km 是 2000 m，再加 350 m：2350 m。用 100 只得 550 m，太短了。（`unit-factor-wrong`） |
| 4 ⚑ | `jug{0–2000 ml, sub {l, 1000}, M 500, i 50; value 1250}` + `brackets [0→1000 "1 ℓ", 1000→1250 "250 ml"]` | `fill` | `1250 ml = 1000 ml + 250 ml = 1 ℓ 250 ml` | Going back: take out as many whole litres as you can. 1250 ml is 1000 ml and 250 ml, so 1 ℓ 250 ml, not 12 ℓ 50 ml. | 反过来：先拿出尽量多的整升。1250 ml 是 1000 ml 加 250 ml，所以是 1 ℓ 250 ml，不是 12 ℓ 50 ml。（`compound-split-wrong`） |
| 5 ⚑ | `pair:[tape{150–260 cm, sub m, M 10, i 5; head 205}, tape{同; head 250, tone hot}]` | `morph` | `205 cm = 2 m 5 cm · 250 cm = 2 m 50 cm` | 205 cm is 2 m and 5 cm. 250 cm is 2 m and 50 cm. The 0 in 205 keeps the 5 in the ones place. | 205 cm 是 2 m 5 cm；250 cm 是 2 m 50 cm。205 里的 0 让 5 留在个位上。（`compound-place`） |

**要点**：① 1 km = 1000 m, 1 kg = 1000 g, 1 ℓ = 1000 ml, 1 m = 100 cm. / 进率：千米、千克、升是 1000，米是 100。② To the smaller unit: big × 1000 (or 100), then add the small part. / 化成小单位：大单位乘进率，再加小单位。③ Back again: take out the whole big units first. / 化回来：先拿出整的大单位。

**题库（10）**：7 道 `input`（`work: { do: "convert" }`）：复合 → 小（`form: "whole"`，单位印在框后）：2 km 35 m → 2035（错例 `"235"` → `compound-concatenated`）；4 m 6 cm → 406（`"46"` → `compound-concatenated`、`"460"` → `compound-place`）；3 ℓ 250 ml → 3250（`"550"` → `unit-factor-wrong`）；5 kg 80 g → 5080（`"5800"` → `compound-place`）；小 → 复合（`form: "compound"`）：1250 ml → 1 ℓ 250 ml（`"12,50"` → `compound-split-wrong`）；3040 g → 3 kg 40 g（`"3,4"` → `compound-place`）；408 cm → 4 m 8 cm（`"4,80"` → `compound-place`）；2 道 `choose`（哪个等于 2 kg 5 g：2005 g ✓、25 g → `compound-concatenated`、2500 g → `compound-place`、205 g → `unit-factor-wrong`）；1 道 `compare`（`2 kg 50 g ? 2500 g`，`align: "unit"`）。

---

#### 第 13 步 `scales-in-decimals` · 刻度上的小数（P5 Decimals 1.2，**桥**，可选；地基 P4 Decimals 1.1）

**概念**：一千克（一升、一米）平均分成 10 小格，每一小格是 0.1 kg = 100 g；指针在 1 kg 后面 4 格就是 1.4 kg，也就是 1 kg 400 g、1400 g。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `dial{0–3 kg, M 1, i 0.1; value 1.4, load flour}` + `count{1→2}` | — | `1 kg ÷ 10 = 0.1 kg` | Between 1 kg and 2 kg there are 10 small parts. Each part is one tenth of a kilogram: 0.1 kg. | 1 kg 到 2 kg 之间有 10 小格，每一小格是一千克的十分之一：0.1 kg。 |
| 2 ⚑ | 同上 + 读数 | `sweep` | `1.4 kg = 1 kg 400 g = 1400 g` | The needle is 4 tenths past 1 kg: 1.4 kg. A tenth of 1000 g is 100 g, so 1.4 kg is 1 kg 400 g, not 1 kg 4 g. | 指针在 1 kg 后面 4 个十分之一：1.4 kg。1000 g 的十分之一是 100 g，所以 1.4 kg 是 1 kg 400 g，不是 1 kg 4 g。（`decimal-as-subunit`） |
| 3 | `jug{0–2 l, M 0.5, i 0.1; value 1.3}` | `morph` | `0.5 ÷ 5 = 0.1 · 1.3 ℓ = 1300 ml` | This jug is numbered every half litre: 0.5 ℓ, 1 ℓ, 1.5 ℓ. 0.5 ℓ shared between 5 parts is 0.1 ℓ each. The water is 1.3 ℓ, or 1300 ml. | 这个量杯每半升标一个数：0.5 ℓ、1 ℓ、1.5 ℓ。0.5 ℓ 分成 5 格，每格 0.1 ℓ。水是 1.3 ℓ，也就是 1300 ml。（`interval-misread`） |
| 4 | `tape{1.2–1.3 m, vertical, look "height-chart", M 0.1, i 0.01; head 1.28}` | `zoom` | `128 cm = 1.28 m` | Mei Ling's height from the start of this lesson, in metres. Each small part is 0.01 m, which is 1 cm, so 128 cm is 1.28 m. | 这节课一开始量过 Mei Ling 的身高，现在用米写。每一小格是 0.01 m，就是 1 cm，所以 128 cm 是 1.28 m。 |

**要点**：① When 1 kg is cut into 10 parts, each part is 0.1 kg = 100 g. / 1 千克分成 10 格，每格 0.1 kg = 100 g。② 1.4 kg = 1 kg 400 g = 1400 g. / 1.4 kg = 1 kg 400 g = 1400 g。③ Read the decimal on the scale, then change it if you need to. / 先读出刻度上的小数，需要时再换单位。

**题库（9）**：5 道 `read-scale`（`form: "decimal"`、`unit`：秤 2.6 kg、量杯 0.7 ℓ、身高尺 1.35 m、路 2.4 km、量杯 1.25 ℓ（每小格 0.05）；错例 `L + k × 0.01`（每格当 0.01）→ `interval-misread`）；2 道 `input`（`work: { do: "convert", from, into }`：1.4 kg = ? g → 1400，错例 `"1004"` → `decimal-as-subunit`；0.3 ℓ = ? ml → 300，错例 `"30"` → `unit-factor-wrong`）；2 道 `choose`（哪个和 2 kg 50 g 一样：2.05 kg ✓、2.5 kg → `decimal-as-subunit`）。正文最后一句前链到小数课第 15 章"用小数表示量"。

---

### 2.3 练习章 `practice`（8 道固定题，每题一次检查，总结页 + 再做一次）

| # | 题型 | 题目（EN 草稿 / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `read-scale`（ruler，钥匙 4→11） | How long is the key? / 钥匙有多长？ | 7 cm | `"11"` → `read-end-mark`；`"8"` → `tick-counting` | 02 |
| Q2 | `count-intervals`（dial 0–500 g，200→300 之间 4 条短线） | What does each small part stand for? / 每一小格表示多少？ | 20 g | `"=25"` → `tick-counting`；`"=1"` → `interval-misread` | 03、06 |
| Q3 | `read-scale`（dial 0–1000 g，M 100、i 20，指针 460） | Wei Jie weighs some long beans. What is their mass? / Wei Jie 称长豆，有多重？ | 460 g | `"403"` → `interval-misread`；`"480"` → `tick-counting`；`"460 kg"` → `wrong-unit` | 06 |
| Q4 | `set-scale`（jug 0–500 ml，M 100、i 50，`mode: "fill"`） | Fill the cup to 350 ml. / 把量杯倒到 350 ml。 | 350 ml | `"550"` → `interval-misread`（每格当 10） | 10 |
| Q5 | `choose` | About how heavy is a watermelon? / 一个西瓜大约多重？ | 3 kg | 3 g → `wrong-unit`；300 kg → `unreasonable-estimate` | 08 |
| Q6 | `order`（升序） | Order the parcels from the lightest: 1 kg, 850 g, 1 kg 200 g. / 把包裹从轻到重排：1 kg、850 g、1 kg 200 g。 | 850 g, 1 kg, 1 kg 200 g | `"1 kg,1 kg 200 g,850 g"` → `ignored-unit` | 09 |
| Q7 | `read-scale`（身高尺 100–150 cm，sub m，i 2，`form: "compound"`） | How tall is Kumar? / Kumar 有多高？ | 1 m 26 cm | `"1,23"` → `interval-misread`；`"1,28"` → `tick-counting` | 11 |
| Q8 | `input`（`work: convert`，`form: "whole"`、`unit: "g"`） | Farah buys 3 kg 40 g of rice. How many grams is that? / Farah 买了 3 kg 40 g 的米，是多少克？ | 3040 | `"340"` → `compound-concatenated`；`"3400"` → `compound-place` | 12 |

6 种题型（read-scale、count-intervals、set-scale、choose、order、input）；桥章不进练习。总结页一句话 + 表 + "再做一次"，同分数。

---

## 3. 引擎：A11 `instrument`、复合单位、三种新小测、量读数误解域

### 3.0 用到的现有东西与本课新增（M1–M12）

**直接用**（docs/06）：讲解节拍、章节轴、阅读面板、抽题、练习与总结；`under`；`words`；`{u:…}` 记号（G7 / X2）；`Measure` 的单位 `cm` `m` `km` `g` `kg` `l` `ml`（X2）；`form: "measure"`（方格课的数 + 单位芯片）、`whole`、`decimal` 写法与 `work`（X3）；整数数轴 `scale: "whole"`（A1）；放大镜的画法（A6c、钟面 `zoom`）；`jump`、`sweep`、`zoom`、`slide`、`morph`、`shade`、`place` 过渡；一码多域（X6）；`limits` 的框架（G11 / X9）；`check-pool --topic --step`；`pnpm shoot --beats --tasks --keys --layout`。

| # | 改动 | 改哪里 | 说明 |
|---|---|---|---|
| M1 | **复合单位值** `Compound`（§3.1）+ `{u:2 m 35 cm}` 记号与读法 | `lib/value.ts`（`parseCompound`、`compoundText`、`compoundWords`、`toSmall` / `fromSmall`）、`src/lib/rich-text.ts`、`lib/words.ts` | 内部存小单位的整数（`2 m 35 cm` → 235 cm）+ 写法；`l` 显示 ℓ；EN "2 metres 35 centimetres"，ZH "2 米 35 厘米" |
| M2 | **模型 A11 `instrument`**：`ruler`、`tape`、`dial`、`jug`、`balance`（§3.2） | `lib/instrument.ts`（新，纯函数：刻度位置、圆盘角、液面高、天平倾角、读数、放大镜范围）、`stage/Instrument.tsx` + `stage/instrument/{Ruler,Tape,Dial,Jug,Balance,Magnifier,Brackets}.tsx`、`stage/glyphs/measure.tsx`（物体轮廓） | 技术图版语法：纸面、1 px 墨线、正投影、无阴影 |
| M3 | **叠加层** `count`（每一小格一个编号的弧）、`zoom`（放大镜）、`brackets`（复合单位的两段）、`eye`（眼睛高度的虚线）、`highlight`（加粗刻度）、`dual`（刻度另一侧印小单位） | 同上 | 讲解拍和孩子的状态共用一套画法 |
| M4 | **过渡**：新 `unroll`（圆盘刻度拉直成数轴 / 卷回）、`fill`（液面升降）、`tip`（天平横梁转）；复用 `sweep`（指针转，同钟面）、`slide`（物体沿尺滑）、`jump`（格子弧一个个出现）、`zoom`（放大镜展开） | `schema.ts BEAT_MOVES`、`stage/BeatModel.tsx`、各器具 | 每个 ≤ 900 ms；`prefers-reduced-motion` 时淡入 / 直接到位；同一种器具换拍不重挂载 |
| M5 | **新小测** `read-scale`、`set-scale`、`count-intervals`；`compare` / `order` / `choose` 扩到量（§3.4） | `lib/measure-tasks.ts`（新：状态、动作、检查、解法、错例）、`tray/MeasureControls.tsx`（新）、`lib/solve.ts`、`lib/proof.ts`、`lib/check.ts` | 同 docs/29 X11 的套路 |
| M6 | **作答写法**：`measure` 的单位芯片按题 `units` 给（现在写死成方格单位）；新 `compound`（两个框，单位印好，同时长 `duration` 的做法）；`work.do: "convert"` 收复合单位 | `tray/inputs/WholeInput.tsx`、`tray/inputs/CompoundInput.tsx`（新）、`lib/forms.ts`、`lib/check.ts` | 小单位框空 = 0（`3 kg` = `3 kg 0 g`） |
| M7 | **误解域** `measure-reading`（§2.1 的 11 个新码 + 4 个复用码）与诊断规则（§3.6） | `schema.ts`（`MEASURE_READING_CODES`、`MISCONCEPTION_DOMAINS['measure-reading']`）、`lib/diagnose/measure-reading.ts`（新）、`validate.ts` | 一题按自己的域诊断（`isMeasureTask`，§3.6） |
| M8 | **文本里的量**：字幕、题目、正文里"裸写的数 + 单位"（`\b\d[\d.,]*\s?(cm|m|km|g|kg|ml|ℓ|l)\b`）validate 报错，要写 `{u:…}`（否则朗读成字母）；`sample` 字段不查 | `validate.ts` | 同 X8 拦裸写时刻的做法 |
| M9 | **每步上限**（`limits` 加键，§3.5） | `schema.ts stepLimits`、`validate-measure.ts`（新）、`scripts/math/check-pool.ts` | `check-pool --topic measuring --step <id>` 逐道查 |
| M10 | **右上卡 MEASURE** 与 **PLATE 行**；**VIEW**：读数题可切到"拉直的刻度"（整数数轴扩到 ≤ 10 000、`step` 任意）；背景章标本（§3.7） | `hud/cards/MeasureCard.tsx` + 注册表、`hud/plate.ts`、`stage/WholeLine.tsx`、`lib/lesson.ts canShow`、`schema.ts MODEL_VIEWS` | 小测里不先说答案 |
| M11 | **校验**：器具画得出、读数在刻度上、物体在尺上、天平的砝码 / 质量自洽、答案 = 器具读数、`limits`（§3.8） | `validate-measure.ts`（新）、`validate.ts` 挂上 | 规则与 `check-pool` 共用 `taskIssues` |
| M12 | **自证、截图、e2e、文档、示例主题**：三种新题型都有 `solve()`、`sampleState()`、`proveTask`、`goToTask`、`pnpm shoot --tasks` 三张、键盘路径；docs/06 新一节「量的读数（A11）」；示例主题 `sample-lesson-measure`（draft，占位数据：四步，每个器具、叠加、过渡、题型、写法各用一次） | `lib/solve.ts`、`lib/proof.ts`、`scripts/shoot.ts`（如需）、`src/content/topics/sample-lesson-measure/**`、`tests/math-scene/**`、docs/06 | 同 G12 / X11 |

不变的：章节轴、阅读面板顺序（章头 → 节拍行 → 小测托盘 → 正文 → 本章索引）、抽题与"再来一道 / 跳过"、练习与总结页、URL 只有 `ch` / `b` / `model`、答案与抽到的题不进 URL 和存储。

### 3.1 M1 复合单位值（`lib/value.ts`）

```ts
/** A measurement in two units, kept as an integer count of the small unit plus how it was written. */
export interface Compound { big: 'km' | 'm' | 'kg' | 'l'; small: 'm' | 'cm' | 'g' | 'ml'; total: number; bigPart: number; smallPart: number }
export const FACTOR = { 'km-m': 1000, 'm-cm': 100, 'kg-g': 1000, 'l-ml': 1000 } as const;

parseCompound("2 m 35 cm") → { big: 'm', small: 'cm', total: 235, bigPart: 2, smallPart: 35 } | null   // 也收 "2 m"（smallPart 0）、"2 ℓ 250 ml"
compoundText(c, locale) → "2 m 35 cm"                 // 两种语言都写符号；l → ℓ
compoundWords(c, locale) → "2 metres 35 centimetres" / "2 米 35 厘米"
toSmall(c) → Measure(235 cm) ;  fromSmall(Measure(1250 ml), 'l') → 1 ℓ 250 ml
```

- 合法：同一族的一对（km–m、m–cm、kg–g、ℓ–ml），`0 ≤ smallPart < factor`、`bigPart ≤ 99`；`"2 m 135 cm"`、`"2 kg 35 cm"` 报错。比较 / 排序时复合单位与单一单位（`"900 g"`、`"1 kg"`）一律换成同族最小单位比（`lib/value.ts compareMeasure`）。
- 第 13 步的小数量（`"1.4 kg"`）是现有的 `Measure`（`Decimal` 值），不新增类型。

### 3.2 M2 / M3 模型 A11 `instrument`

```json
{ "kind": "instrument",
  "type": "ruler" | "tape" | "dial" | "jug" | "balance",
  "unit": "cm" | "m" | "km" | "g" | "kg" | "ml" | "l",
  "from": 0, "to": 15,                          // 印出的范围（unit；有 sub 时是小单位）
  "major": 1, "minor": 1,                       // 每 major 标一个数、每 minor 一条刻度；major / minor 是 1–10 的整数
  "labels": "major" | "ends" | "none" | { "hide": [40] },   // hide：盖住几个数（缺数的尺）
  "sub": { "unit": "m", "per": 100 },           // 两种单位的刻度：值用小单位，整大单位处印 "1 m"、其余标数印小单位的余数
  "dual": true,                                 // 刻度另一侧再印一遍小单位的总数（第 12 步：1 m 32 cm 与 132 cm）
  "skip": { "from": 0, "to": 100 },            // tape：这一段压短，画两条技术制图的断开线（身高尺不必从 0 画满，括号照样跨过去）
  "orient": "horizontal" | "vertical",          // ruler / tape；jug 总是竖的；dial 是圆
  "look": "ruler" | "metre-rule" | "tape" | "height-chart" | "path",   // 同一套刻度的外形
  "inset": 0.6,                                 // ruler：0 刻度离尺子左端多远（unit）
  "broken": true,                               // ruler：左端画成断口，从 from 开始
  "object": { "kind": "pencil", "from": 0, "to": "6.7", "tone": "cold" },   // ruler / tape 上的东西（to 可以是小数字符串：最接近的厘米）
  "line": { "from": 0, "to": 5 },               // 画出的线（set-scale 的样子）
  "arrow": 35, "head": 128,                     // tape 上的箭头 / 身高尺的头顶板
  "value": 280,                                  // dial 的指针、jug 的液面
  "load": "prawns", "liquid": "water" | "juice" | "milk",
  "shape": "beaker" | "cup" | "jug" | "bottle" | "bowl" | "pail" | "bottle-jug",
  "scale": true,                                // false：只画容器，不画刻度（第 07 步第 1 拍）
  "dial": { "sweep": 330 },                     // 0 在正上方，顺时针，满量程占 330°
  "left": [ { "item": "pineapple", "mass": 1000 } ], "right": [ { "weight": 500 }, { "weight": 200 } ],   // balance（g）
  "tilt": "auto" | "left" | "right" | "level", "hideMass": true,
  "count": { "from": 30, "to": 40 },            // 叠加：每一小格一个编号的弧 1、2、3…（signal）
  "zoom": { "from": 200, "to": 300 },           // 叠加：放大镜，这一段放大到整宽
  "brackets": [ { "from": 0, "to": 100, "label": { "en": "1 m", "zh": "1 m" } }, { "from": 100, "to": 132, "label": { … }, "tone": "signal" } ],
  "eye": true, "highlight": [0],
  "pair": [ instrument, instrument ], "set": [ instrument, instrument, instrument ], "label": { "en": "…", "zh": "…" } }
```

**画面**（技术图版：纸面底、1 px 墨线、正投影、无阴影；docs/08）：
- **刻度**：短刻度发丝线，`major` 处长刻度 1.5 px 并标数（衬线体数字，随舞台缩放，最小 13 px），两数之间格数是 10 时第 5 格一条中长刻度；`labels: { hide }` 的数位置画一个小空框。**每一小格画得一样大**（validate 与单测都查）。可见的格子 ≤ 60（多了用放大镜），最小格距 6 px（390 宽手机）、1280 × 720 下 ≥ 10 px，不够就由引擎缩成"只画一段 + 两端断口"或提示作者用 `zoom`。
- **ruler**：浅色长条（paper 上 ink 4 %），0 刻度按 `inset` 离左端，`broken` 时左端锯齿断口；物体是轮廓图形（铅笔、蜡笔、橡皮、钥匙、丝带、叶子、吸管、绳子）贴在尺的上沿，两端各一条发丝竖线落到刻度上；`to` 不在刻度上时（最接近的厘米）末端竖线画在真位置，两侧刻度线不加粗（不提示）。
- **tape**：上面的东西是白板、走廊、门、绳子的轮廓（同 ruler 的 `object`）；`skip` 的那段按技术制图画两条锯齿断开线、长度压到约两格；`look` 定外形——`tape` 是卷尺带（一端带金属钩）、`metre-rule` 是木米尺、`height-chart` 是竖着贴墙的长条 + 一块可滑的头顶板（`head`）、`path` 是一条路 + 每 `minor` 一根短桩（标数的是高桩）。
- **dial**：圆盘外圈刻度，0 在正上方顺时针，`sweep` 缺省 330°（满量程与 0 之间留一个缺口，读的时候不会混）；中心轴 + 指针（ink，孩子拨的是 signal，"看答案"是虚线指针）；盘上方的秤盘里画 `load` 的轮廓（鱼、虾、空心菜、长豆、黄梨、木瓜、西瓜、芒果、番石榴、洋葱、米袋、面粉袋、回形针；天平上另有沙滩球、石头和素面砝码）；表面印单位 `g` 或 `kg`（大一点，读题要看）。
- **jug**：`shape` 定轮廓（`beaker` 直筒带嘴、`cup` 带把的量杯、`jug` 大量杯、`pail` 桶、`bottle` / `bowl` 只在比容量时出现）；刻度在右侧竖排；液面**一条水平线**（D10），液体 cold 淡填色，孩子倒的 signal；`eye` 时在液面高度画一条横穿的虚线并在右端画一个简笔眼睛符号（`◉`，不画人脸）。
- **balance**：中间支架 + 横梁 + 两个托盘（不画吊链细节，盘底清楚，S11 的建议），物体轮廓放在盘里，砝码是素面圆柱 + 面额字（`500 g`），`tilt: "auto"` 按两边质量定：重的一边低 8°，相等时水平；`hideMass` 时不显示物体质量。
- **叠加**：`count` 每格上方一条小弧 + 编号（同整数数轴 `counter`），dial 的弧沿圆周；`zoom` 是被放大那段上的小圆框 + 两条引线 + 右侧（窄屏下方）的大框（同 A6c / 钟面放大镜），大框里只放大刻度，**不印每格的值**；`brackets` 是刻度下方的尺寸线式括号（同方格课 `dims` 的画法），复合单位的两段 = docs/17 说的"数轴上的两段"；`dual` 在刻度另一侧印小单位的总数（132），与主刻度对齐。
- **成组**：`pair`（2 个，各带 `label`）、`set`（3 个）并排，同一种器具按同一比例画（比长短、比轻重时能直接看）。

**规模**：1920 × 1080 下一把 15 cm 尺约占模型框宽的 80 %（1 cm ≈ 50 px）；指针秤直径约为模型框高的 70 %；量杯高约为框高的 75 %。390 × 844 托盘打开时：尺按格距自动只画需要的一段（物体所在 + 两端各 1 格），秤直径 ≥ 180 px，量杯高 ≥ 200 px。

### 3.3 M4 过渡

| move | 用在 | 画面 |
|---|---|---|
| `slide` | 尺 / 卷尺换物体位置 | 物体沿刻度滑到新位置 |
| `sweep` | 秤换读数 | 指针按值的顺序转过去（同钟面，不取模） |
| `fill` | 量杯换液面 | 液面上升 / 下降，`pair` 时两个杯先后 |
| `tip` | 天平 | 横梁从上一拍的倾角转到这一拍，托盘保持水平 |
| `unroll` | 秤 ↔ 数轴（第 06 步第 2 拍） | 圆周上的每条刻度沿各自的路径插值到直线上的位置，数字跟着走；可逆 |
| `jump` | `count` 叠加 | 弧一条接一条出现，编号跟着 |
| `zoom` | 放大镜 | 小圆框 → 引线 → 大框展开 |
| `morph` | 换器具 / 换范围 | 整幅重挂载淡入 |

同一种器具、同样的刻度之间换拍时**不重挂载**（指针、液面、物体保留 key，CSS transform 过渡）；刻度变了才重挂载。

### 3.4 M5 小测类型

| kind | 字段 | 孩子做什么 | 键盘 | 检查 | `sample` 写法 |
|---|---|---|---|---|---|
| `read-scale`（新） | `{ model: instrument, answer: inputSpec, tools?: ["zoom", "count"] }`；`answer.form` ∈ `whole`（`unit` 印在框后）、`measure`（`units` 芯片）、`compound`、`decimal`（桥） | 舞台只读；托盘有两个工具：**放大这一段**（指针 / 液面 / 末端所在的那一段标数间隔放大，不印每格的值）、**数格子**（点格子出现编号的弧，是孩子的草稿，不参与检查）；在托盘写读数 | 作答框照现有写法；工具是按钮 | 值（和单位）= 器具读数（物体从 a 到 b 时是 b − a；`nearest` 时是最接近的整数） | 照孩子写的：`"13"`、`"350 kg"`、`"1,23"`（复合：大,小） |
| `set-scale`（新） | `{ model: instrument, target, mode: "line" \| "arrow" \| "load" \| "fill" \| "weights", weights?: [500, 200, 100, 50, 20, 10] }` | `line`：从 0 拖出一条线（线端是 44 px 的把手）；`arrow`：拖卷尺上的箭头；`load`：拖指针或用托盘 **加一点 / 拿走一点**（± 一小格、± 一个标数间隔）；`fill`：拖液面或 **倒一点 / 倒出一点**；`weights`：点托盘里的砝码芯片放到右盘，点盘里的砝码拿下来 | 器具是 `role="slider"`（← → 一小格，Shift ← → 一个标数间隔，Home 回到 0；`aria-valuetext` 是孩子自己设的读数）；砝码芯片是按钮 | `line` / `arrow` / `load` / `fill`：设的值 = `target`（吸附到 `minor`）；`weights`：天平平了（砝码之和 = 物体质量） | 设的值：`"6"`、`"550"`；`weights`：`"weights:500,200"` |
| `count-intervals`（新） | `{ model: instrument, between: [200, 300], ask: "part" \| "length", then: inputSpec }` | 舞台上 `between` 两个刻度加粗；点两者之间的每一格（再点一次撤销），格子上出现编号的弧；全部点完后托盘问"每一小格表示多少"（`part`）或"有多长"（`length`） | 格子是 roving-tabindex（← → 移，Enter 点）；托盘"撤销最后一格" | 点的格子 = 两刻度之间的全部格子，且 `then` 写对 | 第一段 `"parts:4"`（少点了，不诊断）；第二段 `"=25"` |
| `compare`（扩到量） | `{ a, b: "900 g" \| "1 kg" \| "1 m 5 cm", ask, align?: "unit" }` | 同分数；"换成同一个单位"按钮把两个量都写成同族最小单位（脚手架，不算答案） | 同分数 | 符号正确（按值） | `"<"` / `">"` / `"="` |
| `order`（扩到量） | `{ items: 量[3–5], direction }` | 同分数 | 同分数 | 顺序正确 | `"1 kg,1 kg 200 g,850 g"` |
| `choose` | 选项 `model` 可以是 `instrument`；选项文字可以是量 / 单位；错选项带 code | 同分数 | 同分数 | 同分数 | 选项 id |
| `input` | 写法 `whole` / `measure` / `compound` / `decimal`，诊断上下文 `work`（§3.5） | 同现有 | 同现有 | 按值（复合按总量） | `"340"`、`"12,50"` |

`set-scale` 的 `weights` 题，物体质量必须能由给的砝码凑出（validate）；"看答案"把最少个数的一组砝码画成虚线。

### 3.5 M6 写法、`work` 与 M9 `limits`

```json
{ "answer": "3040", "form": "whole", "unit": "g",
  "work": { "do": "convert", "from": "3 kg 40 g", "into": "g" } }
{ "answer": "1 l 250 ml", "form": "compound",
  "work": { "do": "convert", "from": "1250 ml", "into": "l-ml" } }
{ "answer": "350 g", "form": "measure", "units": ["g", "kg"] }
```

- `compound`：两个框，框后印单位（`ℓ`、`ml`），小单位框可以空（= 0），满了自动跳下一框；`sample` 写 `"1,250"`。
- `measure`：`units` 缺省取步的 `limits.units`；方格课照旧。
- `work.do: "convert"`：`from` 是复合或单一量，`into` 是单位或复合族（`"l-ml"`）；validate 查它算出来 = `answer`。`read-scale` 不需要 `work`：诊断上下文就是器具（读数、标数、每一小格、物体两端）。

`limits`（新键）：`units: ["cm", "m"]`（题里允许的单位）、`parts: [1, 2, 5, 10, 20]`（每一小格允许的值）、`partsPerLabel: [2, 10]`（两标数之间几格）、`maxValue`（小单位）、`nearest: true`（只第 01 步：读数可以不在刻度上）、`compound: ["m-cm", "kg-g", "l-ml", "km-m"]`、`bigMax: 9`、`smallStep: 5`（g / ml / m 的小单位部分是 5 的倍数）、`weights: [1000, 500, 200, 100, 50, 20, 10]`、`dp: [1, 2]`（桥）。validate 与 `check-pool --topic measuring --step <id>` 都查。

### 3.6 M7 诊断规则（`lib/diagnose/measure-reading.ts`，纯函数，每条一个单测）

记号：器具的读数上下文 `R = { from, to, M (major), i (minor), sub?, v（读数，小单位）, a, b（物体两端） }`；`L` = 不大于 `v` 的最大标数刻度，`U = L + M`，`n = M / i`（两标数间的格数），`k = (v − L) / i`；`c` = 正确答案，`x` = 孩子的答案。一条规则只在列出的题型下生效，且 `x ≠ c`。

| code | 题型 · 上下文 | 规则 |
|---|---|---|
| `tick-counting`（复用） | `read-scale`（尺上物体、指针、液面、箭头）、`count-intervals`、`set-scale` | 物体：`x = (b − a) + i`（两端的刻度都数了）；读数：`x = L + (k + 1)·i`；每一小格：`x = M / (n − 1)` 或 `M / (n + 1)`（数的是中间的短线或全部刻度线，须为整数）；`set-scale`：设的值 = `target − i`（把起点那条线也数成一格） |
| `read-end-mark` | `read-scale`（尺，`a ≠ 0`）、`choose` | `x = b` |
| `not-nearest` | `read-scale`（`nearest`） | `b` 不在刻度上，`x` = 离 `b` 远的那个相邻整刻度 |
| `interval-misread`（复用） | `read-scale`、`set-scale`、`count-intervals`（`then`） | 读数：`x = L + k·i′`，`i′ ∈ {1, M/10, 10} \ {i}`（`M/10` 须为整数；复合刻度上 `i′` 用小单位，如 2 kg 后 3 格写 2 kg 3 g）；每一小格：`x ∈ {1, M/10} \ {i}`；`set-scale`：设的值 `v′ = L′ + ((target − L′) / i′)·i`（按错的格值走了那么多格） |
| `wrong-unit` | `read-scale` / `input`（`measure`）、`choose` | 数 = `c` 的数，单位 ≠ `c` 的单位；`choose`：选项带码 |
| `ignored-unit` | `compare`、`order`、`choose` | `compare`：孩子的符号 = 只比两个印出来的数（复合取大单位的数）得到的符号，且 ≠ 正确符号；`order`：孩子的顺序 = 按印出来的数排 |
| `compound-concatenated` | `input`（`work: convert`，复合 → 小） | `x` = 把 `bigPart` 与 `smallPart` 的数字串并排读成的整数，且 `smallPart` 的位数少于进率的 0 的个数（否则并排正好是对的） |
| `compound-place` | `input`（`convert` 两个方向）、`read-scale`（`compound`）、`compare` | 复合 → 小：`x = B·f + s·10^j`，`j ∈ {1, 2}`、`s·10^j < f`；小 → 复合 / 读复合：`x = (B, s′)`，`s′ = s·10^j` 或 `s / 10^j`（整除），`s′ ≠ s`、`s′ < f` |
| `compound-split-wrong` | `input`（`convert`，小 → 复合） | `x = (⌊a / f′⌋, a mod f′)`，`f′ ∈ {10, 100, 1000} \ {f}` |
| `unit-factor-wrong`（复用） | `input`（`convert`）、`choose` | `x = B·f′ + s`，`f′ ∈ {10, 100, 1000} \ {f}`；单一量：`x = a·f′` 或 `a / f′`；**排除与并排写法相同的值**（`3 kg 40 g → 340` 既是并排又是 × 100，只算 `compound-concatenated`，不报 WARN） |
| `decimal-as-subunit`（复用，桥） | `read-scale`（`decimal` ↔ 复合）、`input`（`convert`） | 同 docs/29 §3.8：大 → 小 `x = W(a)·f + int(F(a))`；读成复合时 `(W, int(F))` |
| `size-is-mass`、`taller-holds-more`、`balance-misread`、`unreasonable-estimate` | 只 `choose` | 选项带码 |

**域的归属**（`lib/measure-tasks.ts isMeasureTask`）：模型是 `instrument`、题型是 `read-scale` / `set-scale` / `count-intervals`、写法是 `compound`、`compare` / `order` 的值是带单位的量、或 `work.convert` 带复合量 → `measure-reading` 域；`MISCONCEPTION_DOMAINS['measure-reading'] = [...MEASURE_READING_CODES, 'tick-counting', 'interval-misread', 'unit-factor-wrong', 'decimal-as-subunit']`。其余照旧（小数课第 15 步的换算仍归小数域）。validate 拒绝别的域的码和"这道题诊断不出"的码（如没有 `work.convert` 却写 `compound-concatenated`、器具不是尺却写 `read-end-mark`）。

### 3.7 M10 右上卡、PLATE、VIEW、背景章

**MEASURE 卡**（右上）：
- 讲解拍：第一行大号读数 `350 g`（复合 `1 m 32 cm`，换算拍加 `= 132 cm`），第二行读法（"three hundred and fifty grams /「三百五十克」"），第三行 "Each small part stands for 50 g / 每一小格表示 50 g"（器具有 `minor` 时）；天平拍写 "Level: same mass / 平：一样重" 或 "Left side heavier / 左边重"。
- 小测：只显示给定的东西（单位、标数间隔 "Numbers every 100 g / 每 100 g 标一个数"）；`read-scale` 写 `? g`；`count-intervals` 的"每一小格"在答完前写 `?`；`set-scale` 显示目标和孩子设的读数（孩子自己的状态）。做完才给答案。

**PLATE 行**：

| 模型 | 行 |
|---|---|
| ruler / tape | MODEL RULER（TAPE / HEIGHT CHART / PATH）· UNIT cm · NUMBERS EVERY 10 · SMALL PART 2 · START 3 · END 8 |
| dial | MODEL SCALE · UNIT g · NUMBERS EVERY 100 · SMALL PART 20 · NEEDLE 280 |
| jug | MODEL MEASURING CUP · UNIT ml · NUMBERS EVERY 100 · SMALL PART 50 · LEVEL 350 |
| balance | MODEL BALANCE · LEFT pineapple · RIGHT 1 kg · BEAM level |

小测里：`read-scale` 的 NEEDLE / LEVEL / END 写 `?`，SMALL PART 在 `count-intervals` 答完前写 `—`；`set-scale` 是孩子设的值。

**VIEW**：`MODEL_VIEWS` 加 `instrument`；`read-scale` / `set-scale` 的题，器具是 `dial` 或 `jug` 时 VIEW 组多一个"拉直的刻度"（整数数轴 `scale: "whole"`，`from` / `to` / `step` = 器具的范围与 `minor`，标数同 `major`，读数是标记 / 孩子的游标）——这要求整数数轴放宽到 `to ≤ 10 000`、`step` 任意正整数（≤ 60 段），其余写法不变。尺、卷尺、天平只画自己。

**背景章**：有 `instrument` 模型的课，00 章舞台画 `dial{0–1000 g, M 100, i 50, value 0}`；规格表多一行 UNITS（`cm · m · km · g · kg · ℓ · ml`，按课里出现的取）；没有 S / E / N / L 辅助。

### 3.8 M11 校验与单测

- **validate**（`validate-measure.ts`）：`from < to`，`(to − from)` 是 `minor` 的整数倍，`major` 是 `minor` 的 1–10 倍，可见格子 ≤ 60（或配 `zoom`）；`value` / `arrow` / `head` / 物体两端在 `[from, to]` 里且落在刻度上（`limits.nearest` 时物体末端可以不在，离最近刻度 0.2–0.4 个 `minor`）；`sub` 是同族一对且 `from`、`to` 用小单位；`brackets` 首尾相接、合起来 = 读数；天平：`tilt` 不写或与质量一致，`weights` 题的质量能由给的砝码凑出；`read-scale` 的答案 = 器具读数（单位换算后）；`set-scale` 的 `target` 在刻度上、起点不已经等于它；`count-intervals` 的 `between` 是相邻两个标数刻度；`limits` 全部；裸写的量（M8）。
- **单测**：`tests/math-scene/compound.test.ts`（解析、拒绝、换算两向、比较、读法）；`instrument.test.ts`（每一小格等距、圆盘角度 0 在正上方顺时针、液面高与值成正比、天平倾角、读数、`unroll` 插值首尾）；`diagnose-measure-reading.test.ts`（§3.6 每条 ≥ 2 正例 1 反例，复用码的本域规则各 2 例；`compound-concatenated` 与 `unit-factor-wrong` 重合的值只归前者）；`measure-tasks.test.ts`（三种新题型的状态、动作、检查、解法、`sampleState`）；`sample-lesson-measure.test.ts`（示例课全部自证）；以后课的 `measuring-lesson.test.ts`（每道题自证、`limits`、每个 ⚑ 码有题能诊断）。

---

## 4. 名词表（`glossary.json`，16 个）

| id | EN | ZH | 定义要点（1–2 句 + 例子） |
|---|---|---|---|
| `length` | length | 长度 | 一样东西从一端到另一端有多长。铅笔长 9 cm。 |
| `centimetre` | centimetre (cm) | 厘米 | 量短东西的单位，尺子上两条刻度线之间的一格是 1 cm。 |
| `metre` | metre (m) | 米 | 量长东西的单位。1 m = 100 cm，一扇门大约 2 m 高。 |
| `kilometre` | kilometre (km) | 千米 | 量路程的单位。1 km = 1000 m。（新加坡口语常说"公里"，1 公里就是 1 千米） |
| `mass` | mass | 质量 | 一样东西有多重。这个黄梨的质量是 1 kg。（日常也说"重量"；本课用"质量"，和英文 mass 对应） |
| `gram` | gram (g) | 克 | 量轻东西的单位。一个回形针大约 1 g。 |
| `kilogram` | kilogram (kg) | 千克 | 量重东西的单位。1 kg = 1000 g。（新加坡口语常说"公斤"，1 公斤就是 1 千克） |
| `volume` | volume (of liquid) | 容量 | 装了多少液体。比容量要倒进一样的容器里比。（英文 MOE 写 volume；以后学正方体、长方体时叫"体积"） |
| `litre` | litre (ℓ) | 升 | 容量的单位，写作 ℓ。1 ℓ = 1000 ml。 |
| `millilitre` | millilitre (ml) | 毫升 | 量少量液体的单位。一个量杯装满 1000 ml，就是 1 ℓ。 |
| `scale` | scale, marking | 刻度 | 器具上一条条的线和数，用来读出量。长刻度标数，短刻度不标。 |
| `small-part` | each small part | 每一小格 | 两条相邻刻度线之间的一段。每一小格表示多少 = 两个标数之差 ÷ 中间的格数。 |
| `balance` | balance | 天平 | 比轻重的器具：重的一边往下沉，平了就是一样重。 |
| `measuring-cup` | measuring cup, beaker | 量杯 | 带刻度的杯子，用来量液体。（实验室里的直筒量杯叫"烧杯"） |
| `compound-units` | compound units | 复合单位（复名数） | 用两个单位一起写的量，如 2 m 35 cm、3 kg 40 g。 |
| `estimate` | estimate | 估计 | 量之前先猜一个大约的数，用来检查读得对不对。门大约 2 m 高。 |

---

## 5. 来源（施工时进 `sources.json`，S#；访问日期 2026-10-19）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (implementation starting with 2021 Primary One Cohort; Updated Oct 2025). https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 课纲原文：第 32（P1 Length）、34（P2）、36（P3）、38（P4 Decimals）、41（P5 Decimals 1.2）、42（P5 Volume，不做）页；Big Ideas about Measures 第 12 页；Skills 第 14 页 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | TIMSS 2015 Encyclopedia · Singapore: The Mathematics Curriculum in Primary and Lower Secondary Grades. https://timssandpirls.bc.edu/timss2015/encyclopedia/countries/singapore/the-mathematics-curriculum-in-primary-and-lower-secondary-grades/ | CPA |
| S4 | MOE CPDD, *Primary Mathematics Textbook* 2A（ISBN 978-981-4895-71-2，2022）、2B（978-981-4431-31-6，2022 / 2023）、3B（978-981-4895-93-4，2023），Star Publishing。学校公开页 https://sites.google.com/moe.edu.sg/math-resources-fsps/p2/tb-and-pb 、…/p3/tb-and-pb | **只作写法与顺序参考，不照抄**：2A 第 130、133、135、138–140、147、148 页（天平、10 kg 秤每个长刻度 1 kg、"about 1 kg"、"Each small part stands for 10 g"、各种秤、大的不一定重）；2B 第 68–77 页（容量、"We write ℓ for litre"、量杯）；3B 第 55 页（"Each marking represents 100 g"）、第 62–64 页（"We write ml for millilitre"、1 ℓ = 1000 ml、烧杯 100 / 50 ml 与 10 / 5 ml 刻度、液面画平）、第 78 页（电子秤） |
| S5 | Codex 调研 `art/codex-research/measuring/measuring-research.md`（2026-10-19，不进 sources.json） | 课纲逐字核对、写法惯例、中文术语"没有官方标准"的结论、情境出处 |
| S6 | Solomon, T. L., Vasilyeva, M., Huttenlocher, J., & Levine, S. C. (2015). Minding the gap: Children's difficulty conceptualizing spatial intervals as linear measurement units. *Developmental Psychology*, 51(11), 1564–1573. https://doi.org/10.1037/a0039707 | 数刻度线比数格多 1（第 1565 页）；不从 0 开始的物体（`tick-counting`、`read-end-mark`） |
| S7 | Gómezescobar, A., Guerrero, S., & Fernández-Cézar, R. (2020). How long is it? Difficulties with conventional ruler use in children aged 5 to 8. *Early Childhood Education Journal*, 48, 693–701. https://doi.org/10.1007/s10643-020-01030-y | 对准 1、对准尺子边（第 695–697 页，表 5）；"0 离尺边有一段"的拍 |
| S8 | Clements, D. H., et al. (2020 online). Young children's actions on length measurement tasks: strategies and cognitive attributes. *Mathematical Thinking and Learning*. https://doi.org/10.1080/10986065.2020.1843231 | 断尺上从 1 数起、半格刻度当整格（第 14 页） |
| S9 | Oxford University Press (2022). *Numicon 3 Planning*, "Reading and creating scales with different intervals", p. 25. https://cdn.oxfordowl.co.uk/2024/10/31/16/54/24/2209f377-1e1f-4e34-b193-65b5d81ffe80/Numicon_Planning_3.pdf | 每一小格 2、5、10、20、25、50、100 的读法（D9；`interval-misread` 是本课提出的诊断，不是这份资料的统计） |
| S10 | MacDonald, A. (2010). Heavy thinking: Young children's theorising about mass. *Australian Primary Mathematics Classroom*, 15(4), 4–8. https://files.eric.ed.gov/fulltext/EJ906679.pdf | "大的就重"（第 6 页）；大而轻 vs 小而重的对比（第 05 步第 1 拍、配图 2） |
| S11 | Cheeseman, J., & McDonough, A. (2013). Testing young children's ideas of mass measurement. *International Journal for Mathematics Teaching and Learning*. https://www.cimt.org.uk/journal/cheeseman.pdf | 看天平时被大小、材料带偏（第 10 页）；天平画法要盘底清楚（`balance-misread`、`size-is-mass`） |
| S12 | Oak National Academy (2025). *Use knowledge of decimal place value to convert between and compare metres and centimetres* (Year 5). https://www.thenational.academy/teachers/lessons/use-knowledge-of-decimal-place-value-to-convert-between-and-compare-metres-and-centimetres | 2 m 5 cm 与 2 m 50 cm、占位的 0（`compound-place`、第 11 步第 4 拍、第 13 步） |
| S13 | Rose, S. (2020, 28 Aug). A closer focus: Common misconceptions in maths. NFER. https://www.nfer.ac.uk/assessment-hub/a-closer-focus-common-misconceptions-in-maths/ | ℓ ↔ ml 用 100 代替 1000（§3；`unit-factor-wrong`）；NFER 也说可能是计算出错，所以诊断句只说"进率是 1000" |
| S14 | BIPM (2026). *The International System of Units (SI)*, 9th ed., v4.01, p. 138（词头表）、p. 142（升的记号）. https://www.bipm.org/documents/20126/41483022/SI-Brochure-9-EN.pdf | 进率 1000 / 100 的依据；ℓ 与 L 国际上都可以，本课照 MOE 写 ℓ |
| S15 | Weights and Measures Office, Singapore. Consumer tips for products sold by weight. https://www.weightsandmeasures.gov.sg/consumers/consumer-tips-for-products-sold-by-weight/ | "称之前看是不是 0"（第 06 步第 1 拍） |
| S16 | SPRING Singapore (2014). The SAFETY Mark, Accuracy Label, and You. *The Consumer*, 2014 Issue 2, p. 4 (CASE). https://www.nea.gov.sg/docs/default-source/resource/case-the-consumer-2014-issue-2.pdf | 湿巴刹的秤，指针或数字（首页图、第 06、11 步情境） |
| S17 | Meteorological Service Singapore. Observing the weather · Measuring rainfall. https://www.weather.gov.sg/learn_observations | 雨量是深度（mm），本课不用雨量计的理由（D11） |
| S18 | Health Promotion Board, HealthHub. Health screening for primary school. https://www.healthhub.sg/well-being-and-lifestyle/personal-care/health_screening_for_primary_school | 小一、小三量身高（身高尺情境；数字虚构） |
| S19 | St Margaret's School (Primary). School rules & expectations. https://www.stmargaretspri.moe.edu.sg/school-information/school-rules-n-expectations/ | 学校里说"15-cm ruler"（第 01 步的 15 cm 尺） |
| S20 | 中文用词的旁证（不是课本标准）：樟宜机场中文页（"容量""毫升""升"）https://www.changiairport.com/cn/zh/fly/security-and-baggage-restrictions.html ；新加坡华语资料库"廊道"条（"公里"）https://www.languagecouncils.sg/mandarin/ch/learning-resources/singaporean-mandarin-database/terms/corridor ；陈笃生医院《体重管理》（"公斤""克""毫升""估计"）https://www.ttsh.com.sg/Patients-and-Visitors/Documents/Weight%20Management%20(Chinese).pdf ；联合国《关于危险货物运输的建议书 规章范本》中文版第 32 页（"长度""质量""体积"）https://digitallibrary.un.org/record/706060/files/Vol_Ic.pdf | D14 与名词表的注 |

事实纪律同 docs/15 §6.2：课纲逐字、注页码；误解的出处写进 `sources.json` 的 `note`，**只写来源真说过的**（S9 没有统计各种格值的错误率，S13 自己给了两种解释，S6–S8 不是新加坡的数据）；题干不需要来源；情境里的数字（身高、鱼重、甘蔗水的毫升数、5 kg 的米）是虚构的，不说成典型值或实测。

---

## 6. 图像清单（给 Codex）

风格一律照 `scripts/illustrate.ts` 的 `STYLE_BRIEF`（石墨铅笔、19 世纪科学图版、无色、无文字、透明底）。章节配图 4:3（生成时把 brief 里的 "1024x1024 square canvas" 换成 "4:3 landscape canvas, 1536x1152"）。**本课的图一律不靠刻度说事**：刻度是舞台 SVG 的事，图像模型画不出等距刻度（§6.1），所以画面里的刻度要么不出现，要么远到看不清；能看清的刻度必须等距，否则重画或裁掉。

### 6.1 Codex 草图的审查结论（`art/planned/measuring/`，三张都不用）

| 草图 | 结论 | 理由 |
|---|---|---|
| `measuring.png`（首页：尺 + 量杯 + 机械厨房秤） | **换** | 和小数课首页图（尺、读数 0.125 的厨房秤、量杯、硬币）几乎同一组静物，两张卡片在首页挨着；量杯与尺的刻度间距不均 |
| `measuring-pencil-length.png`（铅笔贴尺） | **换** | 尺上长刻度之间的小格数不一致（9、10 混着），铅笔对着尺子的边而不是 0；舞台第 01 步本来就画这个，图重复了模型 |
| `measuring-water-level.png`（量杯水位） | **换** | 刻度间距 17–27 px 不等，长刻度之间 4、5、6、8 格不等；提示词要了弯月面，和 D10 相反；上沿抠图有毛边 |

### 6.2 首页图（替换）

| id | SUBJECT（英文，原样交给 Codex） |
|---|---|
| `measuring` | a mechanical platform weighing scale of the kind used at a Singapore wet-market stall, seen from the front and slightly above: a wide shallow steel pan on top holding one whole fish and a small bundle of long beans, below it a large round dial face with a single pointer and only plain short marks around the rim, absolutely no numerals, letters or unit symbols on the dial; the body of the scale plain and unbranded; drawn as a specimen plate, no people, no text |

入库 `public/illustrations/measuring.webp` + `@2x`，`topic.yaml` 的 `illustration: measuring`。审图：盘面上没有字和数；指针只有一根；鱼和豆角看得出。

### 6.3 章节配图（3 张，可选，可以晚于课上线）

| id | 章 | 用途（一句话） | SUBJECT（英文，原样交给 Codex） |
|---|---|---|---|
| `figures/measuring-height-board` | 04 `metres` | 身高尺是一把竖着的长尺 | a plain wooden height-measuring board fixed upright against a school corridor wall, with a flat wooden head-piece that slides up and down along it, seen from a little distance so that the board's marks are too fine to count, a pair of small canvas school shoes placed neatly side by side on the floor in front of it; no people, no numbers, no text, no posters |
| `figures/measuring-ball-and-stone` | 05 `mass-and-balances` | 大的不一定重 | a simple two-pan balance standing on a table: on the raised left pan a large plain inflated beach ball without any pattern, on the lowered right pan a small smooth river stone, the beam clearly tilted down towards the stone, both pans with clearly visible flat bottoms; drawn as a specimen plate, no people, no numbers, no text |
| `figures/measuring-sugarcane` | 07 `volume-and-litres` | 容量：装了多少 | a sugar cane juice press at a Singapore hawker stall seen from the side, a few peeled sugar cane stalks resting beside it, juice running from the spout into a plain clear jug without any markings, a plain cup standing next to the jug; no people, no signs, no numbers, no text, no brand names |

用法：`<Figure src="figures/measuring-…" alt={{…}} caption={{…}} />` 放在本章正文第一段之后；alt 与 caption 双语、按画面实际内容写，validate 检查文件存在。主会话审图：无字、无数、无品牌；身高尺上的刻度看不清或等距；天平往石头一边沉；甘蔗水的壶上没有刻度。

---

## 7. 施工顺序与分工（照 skill `build-order.md`；依赖由主会话预装，本课**不需要新依赖**；子代理不改 `package.json`、不提交）

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | 建 `src/content/topics/measuring/{chapters,data}`、`topic.yaml`（`engine: math-scene`、`stage: svg`、`mode: lesson`、`status: draft`、`illustration: measuring`）；docs/17 §7 A 表加 A11 一行 | `topic.yaml`、docs/17 | 本文定稿 | S |
| 1 | E-meas（Opus） | M1–M12：复合单位值、A11 五种器具与叠加、四个新过渡、`read-scale` / `set-scale` / `count-intervals` 与量的 `compare` / `order` / `choose`、`compound` 写法与 `measure` 的单位芯片、`measure-reading` 域、裸写量的校验、`limits`、MEASURE 卡、PLATE 行、拉直的刻度视图、背景章标本、单测、docs/06 新一节、示例主题 `sample-lesson-measure` | `lib/{value,instrument,measure-tasks,solve,proof,check,forms,words,lesson}.ts`、`lib/diagnose/measure-reading.ts`、`stage/Instrument.tsx`、`stage/instrument/*`、`stage/glyphs/measure.tsx`、`stage/{BeatModel,WholeLine}.tsx`、`tray/MeasureControls.tsx`、`tray/inputs/{CompoundInput,WholeInput}.tsx`、`hud/cards/MeasureCard.tsx` + 注册表、`hud/plate.ts`、`schema.ts`、`validate.ts`、`validate-measure.ts`、`math-scene.css`、`src/lib/rich-text.ts`、`scripts/math/check-pool.ts`、`tests/math-scene/{compound,instrument,diagnose-measure-reading,measure-tasks,sample-lesson-measure}.test.ts`、`src/content/topics/sample-lesson-measure/**`、docs/06 | 0 | L（约 2 天） |
| 2 | L（Opus） | `lesson.json`：`syllabus`（§1.1 原文，id 如 `p1-length-cm`、`p2-mlv-measure`、`p2-mlv-units`、`p2-mlv-compare`、`p3-mlv-km-ml`、`p3-mlv-compound`、`p3-mlv-convert`、`p4-dec-notation`、`p5-dec-measures`）、13 步 × 4–5 拍（57 拍，按 §2.2）、`keyFacts`、`limits`、`views`、每步 1–2 道样板题、练习 8 题；`pnpm shoot measuring --beats` 逐张看 | `data/lesson.json` | 1 | M |
| 3 | Codex（批量，≤ 4 条并行，`< /dev/null`） | 每步题库其余 7–8 道（brief 照 `references/codex-pool-brief.md` 改：A11 的写法、三种新题型与 `sample` 记号、`compound` / `measure` 写法、`work.convert`、`limits`、§2.1 的码、"量写 `{u:…}`"、D15 的情境与人名），每份草稿 `check-pool --topic measuring --step <id>` 到 0 错 0 WARN；13 章英文正文初稿（`codex-text-brief.md`，固定说法照 §2.0） | `scripts/math/drafts/`（不进 git） | 2 | M（约 100 道 + 13 章） |
| 3′ | Codex | §6.2、§6.3 四张图（可与 1–4 并行），主会话审图 | `art/planned/measuring/`、`public/illustrations/{measuring,figures/measuring-*}.webp` | 0 | S |
| 4 | T（Claude，Opus） | 合并题库（审题意、删超纲：km / ml 不进 01–09、小数不进 01–12、读数在刻度上；改中文）；定稿英文正文；**写中文正文**（13 章 + 00 + 练习章，ZH 400–550 字；"每一小格表示""数格子，不数刻度线""从 0 量起"全课一致）；名词表、`sources.json`、`SOURCES.md`；配图 alt / caption | `data/{lesson,glossary,sources}.json`、`data/SOURCES.md`、`chapters/*.mdx` | 3 | M |
| 5 | P（Sonnet） | 布局、键盘、读屏、两套主题、手机；`pnpm shoot measuring --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`；`tests-e2e/measuring.spec.ts`（点刻度换拍；`read-scale` 用放大与数格子工具后作答；`set-scale` 四种 mode 点按 / 拖 / 纯键盘；`count-intervals` 点格子再写；`compound` 两框；错 → 诊断 → 看答案；再来一道；跳过；练习总结；zh；390 × 844）；朗读抽查（`{u:2 m 35 cm}`、`{u:1 l 250 ml}`、读数里不念出答案） | `tests-e2e/measuring.spec.ts`、`docs/screenshots/measuring/` | 4 | M |
| 6 | 主会话 | `acceptance.md` 全勾、门槛全绿、首页与冒烟测试的计数（已发布主题数、数学课数）跟着改、截图归档、本文 §9 记录、`git commit`；push 等 Gavin | — | 5 | S |

**文件归属的边界**：E-meas 动的 `schema.ts`、`validate.ts`、`lib/value.ts`、`lib/words.ts`、`stage/BeatModel.tsx`、`stage/WholeLine.tsx`、`tray/inputs/WholeInput.tsx`、`src/lib/rich-text.ts` 是几节课共用的文件，所以 E-meas 开工时**同一时间不能有别的引擎代理改 MathScene**（docs/33 蚊子是 SpaceScene，不冲突）；L 只动 `data/lesson.json`；T 只动 `chapters/` 与 `data/` 的其余文件；P 只动 e2e 与截图（发现引擎问题写给主会话，不自己改引擎）。E-meas 的验收：示例主题 `sample-lesson-measure` 的 `pnpm shoot --beats --tasks --keys --layout` 0 失败、五节已发布的数学课截图不变（回归）、`pnpm test` 全绿。

估算：E-meas 约 2 天；本课内容（拍 + 题库 + 正文 + QA）约 2.5 天。

---

## 8. 验收

照 skill `references/acceptance.md` 全部打勾（门槛、讲解优先、HUD 铁律、内容与事实、截图存档），另加本课的：

- [ ] UI 里任何地方都不出现年级（P1–P5 / 小一–小五）：章节轴、阅读面板眉题、本章索引、00 章与练习章正文、右上卡；`grep -n "P[1-6]\b\|[一二三四五六]年级\|小[一二三四五六]" src/content/topics/measuring/chapters/` 为空；第 13 步章头只有 "Going further / 再往前一步"
- [ ] **每一小格画得一样大**：`instrument.test.ts` 查等距；`pnpm shoot --beats` 每一拍 PLATE 的 SMALL PART 与算式一致；1280 × 720 下格距 ≥ 10 px、390 × 844 下 ≥ 6 px（否则有放大镜）
- [ ] **读数在刻度上**（第 01 步最接近的厘米除外）；`read-scale` 的答案 = 器具读数（validate）；读屏文字不念出读数（`aria` 只描述指针在哪两个标数之间、过了几格）
- [ ] 每步的数字在 `limits` 内（validate 与 `measuring-lesson.test` 证明）：km、ml、复合单位不出现在第 01–09 步；小数只在第 13 步；复合单位的大单位 ≤ 9、小单位合法（cm < 100，g / ml / m < 1000 且 5 的倍数）；第 12 步 ≥ 3 道带占位 0
- [ ] §2.1 每个 code（含复用码）至少一拍正面讲（拍表的 ⚑），且至少一道题库题能诊断它；`check-pool` 无"两条规则同时命中"的 WARN
- [ ] 圆盘：0 在正上方顺时针，满量程与 0 之间有缺口；`unroll` 前后刻度一一对应（截图首尾帧对比）；指针 `sweep` 不取模
- [ ] 量杯：液面是水平线，没有弯月面；`eye` 的虚线与液面同高
- [ ] 天平：重的一边低、相等时水平；砝码题的质量能由给的砝码凑出；"看答案"是最少个数的一组
- [ ] 复合单位：`brackets` 两段合起来 = 读数；`compound` 写法小单位框空 = 0；朗读 "2 metres 35 centimetres" /「2 米 35 厘米」
- [ ] 单位记号：全课 ℓ 与 ml（不出现 L、mL、mℓ）；没有 mm；字幕、题目、正文里没有裸写的"数 + 单位"（M8）
- [ ] 固定说法全课一致："Each small part stands for …" /「每一小格表示……」、"Count the parts, not the marks." /「数格子，不数刻度线。」、"Start at 0." /「从 0 量起。」
- [ ] 情境：无品牌、无价格；身高、鱼重、甘蔗水的数是虚构的且不说成典型值；同一物体全课 ≤ 3 次；人名多族群、拼写保留；没有雨量计
- [ ] 配图：首页图与小数课首页图不是同一组静物；所有图无字、无数、无品牌；看得清的刻度是等距的
- [ ] 截图：第 01、03、06、11 章 + 练习章与一道小测，1920 × 1080、1280 × 720、1024 × 768（从链接打开）、390 × 844（paper；外加一张 cinema、一张 zh）

## 9. 施工记录 / 已知差距

### 9.1 引擎（E-meas：M1–M12 与模型 A11，2026-10-19；Codex 收尾，正式课内容未施工）

- **M1 量** `lib/value.ts`：`Compound`（小单位的整数 + 写法）、`parseCompound` / `makeCompound` / `fromSmall` / `toSmall` / `compoundText` / `compoundWords`（"2 metres 35 centimetres" /「2 米 35 厘米」）；量的值 `MeasValue` / `CmpValue`（`QtyValue`）进 `AnswerValue`，`parseQuantity` 要求单位前有空格（`"50m"` 仍是时长）；`qtyIn`、`qtyBase`、`compareQty`（同族最小单位比）、`printedNumber`、`qtyToken`、`baseToken`。zod：`quantity`、`numOrQty`（`compare` / `order` / `choose` 选项的值；`place` 与小数的 `work.of` 仍是 `numValue`）。`{u:…}` 记号收复合单位（`src/lib/rich-text.ts`：显示 ℓ，`aria-label` 是读法，单一单位的记号也补了读法）；章节正文的 `<Qty u="…" />`（`src/components/mdx/Qty.astro`，在 `[slug].astro` 注册）。`tests/math-scene/compound.test.ts`。
- **M2 / M3 模型 A11** `schema.ts instrumentSpec` / `instrumentModel`（`pair` 2、`set` 3），`lib/instrument.ts`（刻度、标数、跳段的位置、圆盘角与反算、`unrollPoint`、读数与它的构成 L / U / M / i / n / k / a / b、最接近的刻度、放大的那一段、天平的质量与倾角、最少砝码 `fewestWeights`）。画法：`stage/Instrument.tsx`（成组、叠加、过渡、小测的把手 / 格子 / 砝码 / 工具）+ `stage/instrument/{geometry,Scale,Ruler,Dial,Jug,Balance,Magnifier,Brackets,Handle}` + `stage/glyphs/measure.tsx`（13 种长条物体、16 种秤盘上的东西、素面砝码、眼睛记号）。**每一小格一样大**由"轨道"保证（直的、圆的；`unroll` 是两条轨道的插值），`tests/math-scene/instrument.test.ts` 量尺、跳段卷尺、秤盘弦长、量杯。天平拆成不认识克的 `BalanceDrawing`（托盘里放 `PanItem`，自己画自己）和本课的 `BalanceInstrument`：代数课的天平（docs/17 A9）直接用前者。
- **M4 过渡** `slide`、`sweep`（指针按值的顺序转，CSS transform）、`fill`（液面平移）、`tip`（横梁转、托盘平移；新挂载时先按右盘空着画再转到位）、`unroll`（requestAnimationFrame 插值 780 ms）、`jump`（弧依次出现）、`zoom`（放大镜展开）；同一器具同样刻度之间不重挂载（`beatShape`）；减少动态时直接到位。
- **M5 题型** `lib/measure-tasks.ts`（状态 `mset` / `mweights` / `mparts` / `mzoom` / `mcount`，动作 `mset` / `mnudge` / `weigh` / `unweigh` / `mpart` / `mtool`，检查、解法、错例），`lib/measure-kind.ts`（`isMeasureTask`、`measureWorkOf` / `decimalWorkOf`：两种 `work` 并存），`tray/MeasureControls.tsx`（读数工具、"加一点 / 倒一点"四步、砝码芯片、再数一格 / 撤销最后一格），`check.ts` / `solve.ts` / `state.ts` / `working.ts` / `controller.ts` 接入。`tests/math-scene/measure-tasks.test.ts`。
- **M6 写法** `measure` 的芯片按题（`units`，与时长的 `h-min` / `min-s` 共用一个字段），缺省继承本步 `limits.units`（独立题 / 练习无步上限时取答案那一族）；新 `compound`（`tray/inputs/CompoundInput.tsx`，`forms.ts` 的 `b` / `s` 框，小单位框空 = 0，`"1,250"`）；`decimal` 写法在量读数题里印器具的单位；换算的句子 `{u:3 kg 40 g} = ?` 印在框前（`WholeInput` 的句子改用 `renderRich`，旧句子显示不变）。
- **M7 误解** `measure-reading` 域 11 条 + 复用 4 条，`lib/diagnose/measure-reading.ts`，`tests/math-scene/diagnose-measure-reading.test.ts`（每条 ≥ 2 正例 1 反例；choose-only 四条用选项测；`3 kg 40 g → 340` 只算并排）。
- **M8 / M11 校验** `validate-measure.ts`（器具、答案 = 读数 / 换算、诊断得了、limits、裸写的量 `bareQuantities`），挂在 `validate.ts`（题目、字幕、名词表；有器具的课才查裸写的量，课纲原文不查）与 `scripts/validate-content.ts`（`<Qty u>` 能解析；有器具的课的章节正文不许裸写量）。
- **M9 limits** `units`（与小数课的换算对共用一个键）、`parts`、`partsPerLabel`、`nearest`、`compound`、`bigMax`、`smallStep`、`weights`；`maxValue`、`dp` 沿用。`check-pool --topic --step` 照查。
- **M10 HUD** MEASURE 卡（`hud/cards/MeasureCard.tsx`，卡片注册表加 `measure`）、PLATE 行（`hud/plate.ts measurePlateRows`）、VIEW `instrument` / `straight`（读 / 设指针秤或量杯时自动多"拉直的刻度"，`lib/lesson.ts canShow` / `viewsFor`）、整数数轴放宽（`to ≤ 10 000`、`step` 任意、`major`）、背景章标本（0–1000 g 指针秤，指针指 0；规格表 UNITS 行）。
- **M12** 示例主题 `src/content/topics/sample-lesson-measure/**`（draft，占位文字）：四步 19 拍 32 道（尺子与卷尺 · 秤与天平 · 量杯与复合单位 · 换算（`bridge`）），五种器具、全部外形、`sub` / `dual` / `skip` / `count` / `zoom` / `brackets` / `eye` / `highlight` / `hide` / `scale: false` / `straight` / 小数刻度、八种过渡、七种题型（`set-scale` 五种 mode、`count-intervals` 两种 ask）、四种写法、15 个码；`tests/math-scene/sample-lesson-measure.test.ts`。docs/06 新一节「量的读数」。浏览器覆盖 `tests-e2e/sample-lesson-measure.spec.ts`；收尾新增 `instrument-description.test.ts`，补成组刻度换算后范围一致（修正示例中同尺寸杯身的容量比较）、尺子末端放大、压短卷尺拖动的反映射、圆盘缺口取近端、量杯窄屏大小、砝码目标与左盘质量相符、读数括号从 0 开始的单测。

### 9.2 与本文 §3 不同的地方

1. **`sub` 的写法**按 §3.2 的 JSON：`unit` 是值的单位（小单位），`sub.unit` 是大单位（`per` 可写，必须等于进率）。§2.2 拍表里 `dial{… sub {g, 1000} …}` 一类简写写成 `unit: "g", sub: { unit: "kg" }`。
2. **`major` / `minor`** 是任意正数（小数写字符串 `"0.1"`），validate 查 `major` 是 `minor` 的 1–10 倍、`from` 在刻度上、`(to − from)` 是整格；§3.2 的"1–10 的整数"读作两者的比。圆盘角度写器具顶层 `sweep`，不是草案 JSON 的 `dial.sweep`。
3. **`unroll`** 是一个器具在 `straight: false` 与 `straight: true` 之间的过渡（≤ 900 ms）。第 06 步第 2 拍"拉直再卷回"写成：第 2 拍 `straight: true`（拉直），下一拍同一器具不带 `straight` 再写 `move: "unroll"`（卷回）；拉直的样子在 VIEW 里也是同一个画法。
4. **拉直的刻度（VIEW）**是器具自己的直线画法（`straight`：同样的刻度和数、读数一个三角、`set-scale` 的游标照样能拖能键盘），不是换成 `numberline` 模型（换模型就丢了孩子的把手和放大镜）。M10 要的整数数轴放宽照做（`to ≤ 10 000`、`step` 任意、新 `major`），作者写数轴拍时用。共用整数数轴保留既有的最多 100 格校验；器具仍是最多 60 个可见小格（或配 `zoom`），本课的数轴拍按 §3.7 的 60 格以内写。
5. **`measure` 的芯片缺省**已按 §3.5 收尾：解析步骤时继承本步 `limits.units`；独立题 / 练习无步上限时取答案那一族（cm / m / km、g / kg、ml / ℓ）。题的显式 `units` 优先，也可只给一个芯片。
6. **`limits.units`** 一个键两种值：小数课的换算对（`km-m` …）与本课的单位（`cm` …），各自的规则只看自己那一种。
7. **数字不相撞**用"隔几个写一个"（每 2、5、10 个标数写一个，两端总写；圆盘首尾也查），没有做"手机上只画需要的一段"。密集刻度应写 `zoom` 或只给需要的范围；读数工具也可放大。窄屏缩短指针秤的秤盘，保留圆盘空间。量杯标签预留已收紧，复合括号不再把杯身挤成缩略图（336 px 模型框的带括号量杯 ≥ 200 px 高的几何单测）。
8. **`interval-misread` 的错格值**取 {1, 10, 0.1, 0.01, M / 10} 去掉真格值：§3.6 写 {1, M/10, 10}，加十分之一、百分之一是为了第 13 步"每格当 0.01"（1.25 ℓ 写 1.05）。`tick-counting` 在 `count-intervals`（`ask: length`）用"两端的刻度都数了"（`(b − a) + i`）。`compound-place` 在 `compare` 的规则是"把一边复合量的小单位读成 ×10ⁿ 或 ÷10ⁿ 后得到的符号"。
9. **复合量的读法**照 §3.1 写数字（"2 metres 35 centimetres" /「2 米 35 厘米」）；单一单位仍读成词（"three hundred and fifty grams" /「三百五十克」），与 docs/29 一致。
10. **天平**：`read-scale` 的读数是右盘砝码之和；物体的质量只在讲解拍印（物体上方的小字，`hideMass` 不印），小测里从不印。物体可写 `size: "big" | "small"`（大球与小石头）。
11. **量读数域的每道题都画器具**（`model.kind` 必须是 `instrument`），`compare` / `order` / 换算题也一样（画两台秤、三根绳子、一个量杯）。
12. **示例主题没有练习章**（同 `sample-lesson-decimal`）。引擎 e2e 已放在 `tests-e2e/sample-lesson-measure.spec.ts`（32 题浏览器解法、工具、拖动、键盘、复合两框、误解 / 看答案 / 再来一道 / 跳过、zh / cinema / 手机）。正式课的 `tests-e2e/measuring.spec.ts` 与练习总结按 §7 留给正式课施工。
13. **手机 `read-scale`**：舞台省掉与托盘作答框重复的量行，把高度留给器具；其他题与讲解拍保留算式。砝码盘最多 12 个，validate 额外拒绝最少解超过 12 个的题，避免数学上凑得出、交互上却放不下。
14. **规模**：§3.2 写秤直径约框高 70 %、量杯约 75 %；1920 × 1080 下那样会占舞台高的六到七成。审查时收成大屏约为舞台高的一半（秤直径、量杯高约 50 %，身高尺约 58 %），手机等小框不变（秤直径 ≥ 180 px、量杯 ≥ 200 px）。

### 9.3 给课的作者（阶段 2–4）

- 量一律写 `{u:…}`（正文 `<Qty u="…" />`），单位前空格，升写 `l`（显示 ℓ），复合 `{u:1 l 250 ml}`；`sample` 照孩子写的（`"350 kg"`、`"1,23"`、`"weights:500,200"`、`"parts:4"`、`"=25"`）。
- 器具的值用器具的单位（有 `sub` 时用小单位：身高 132 不是 1.32）；物体从左到右；`limits.nearest` 只给第 01 步。
- `read-scale` 的答案必须等于读数（validate）；读复合单位的题写 `form: "compound"`，器具要有 `sub`（或是大单位的小数刻度：第 13 步）。
- `count-intervals` 的 `ask: "part"` 必须是相邻两个标数刻度；`set-scale` 的 `weights` 题右盘空着、左盘放东西。
- 想让误解被诊断出来，要选"故事唯一"的数（`check-pool` 报 WARN 的就换数）：例如路 0–3 km 每格 100 m 时 `1 km 4 m` 既是"每格当 1"又是"小单位 ÷100"，换成每格 200 m。

**数据形状速查**（引擎实际收的写法；照抄示例主题 `sample-lesson-measure` 的一道完整题再改最省事）：

- 数写普通数或小数字符串（`"0.05"`）；内部的百万分之一整数由解析产生，不要手写。单位只有 `cm` `m` `km` `g` `kg` `l` `ml`，数与单位之间一个空格（`"50m"` 仍是时长）。复合只认 km–m、m–cm、kg–g、ℓ–ml：`"2 m 35 cm"`、`"3 kg 40 g"`、`"1 l 250 ml"`、`"4 km 50 m"`；小单位部分 < 进率，大单位解析上限 99，课里由 `limits.bigMax` 收到 9 以内。
- 器具（A11）：

  ```json
  { "kind": "instrument", "type": "jug", "unit": "ml", "sub": { "unit": "l" },
    "from": 0, "to": 2000, "major": 500, "minor": 50, "value": 1250,
    "brackets": [ { "from": 0, "to": 1000, "label": { "en": "{u:1 l}", "zh": "{u:1 l}" } },
                  { "from": 1000, "to": 1250, "tone": "signal", "label": { "en": "{u:250 ml}", "zh": "{u:250 ml}" } } ] }
  ```

  有 `sub` 时 `unit` 是**小**单位，所有坐标和值都用它（身高 132 配 `sub: { "unit": "m" }`）；`sub.per` 可省，写了必须等于进率。`major / minor` 是 1–10 的整数，`from` 在刻度上，可见小格 ≤ 60（多了写 `skip` 或配 `zoom`）。读数落在刻度上，只有 `limits.nearest` 的步里物体末端可以离最近刻度 0.2–0.4 格。`pair` 两个、`set` 三个，各带双语 `label`、同一种器具、换算后范围相同（0–1000 ml 与 0–1 ℓ 可以，0–1000 ml 与 0–5 ℓ 不行）。天平：`left: [{ "item": "papaya", "mass": 800 }]`、`right: [{ "weight": 500 }]`，都是克；砝码题右盘空着、左盘放东西，最少的一组砝码不超过盘能放的 12 个。
- 题型（括号里是 `sample` 的写法）：

  | kind | 要写的字段 | 错答 `sample` |
  |---|---|---|
  | `read-scale` | `answer: { "answer": "280 g", "form": "measure", "units": ["g", "kg"] }`，可选 `tools: ["zoom", "count"]` | `"204"`、`"280 kg"`、复合 `"1,25"` |
  | `set-scale` | `target`（器具单位的数或量）、`mode: "line" \| "arrow" \| "load" \| "fill" \| "weights"`；`weights` 模式另给 `weights: [500, 200, 100, 50]` | `"550"`、`"weights:500,200"` |
  | `count-intervals` | `between: [200, 300]`、`ask: "part" \| "length"`、`then: { "answer": 20, "form": "whole", "unit": "g" }` | 第一段 `"parts:4"`（不诊断），第二段 `"=25"` |
  | `compare` | 量 `a` / `b`，可选 `align: "unit"` | `"<"`、`">"`、`"="` |
  | `order` | 量 `items`（3–5 个）、`direction` | 按孩子的顺序写量，逗号隔开 |
  | `choose` | 选项可带器具 `model`、量 `value` 或带 `{u:…}` 的句子 | 错选项 id（选项带 `misconception`） |
  | `input` | 写法见下，换算加 `work` | 写的数，或复合 `"12,50"` |

- 写法：`whole`（框后印 `unit`，读数题缺省器具的单位）、`measure`（数 + 单位芯片；题的 `units` 优先，否则继承本步 `limits.units`，独立题与练习取答案那一族）、`compound`（两个框、单位印在框后，小单位框空 = 0，`answer: "1 l 250 ml"`）、`decimal`（桥：`answer: "2.6", form: "decimal", unit: "kg"`）。换算：`work: { "do": "convert", "from": "3 kg 40 g", "into": "g" }`，或 `"into": "l-ml"` 化成复合；validate 查它算出来 = `answer`。
- 每步上限（`limits`）：`units`、`parts`、`partsPerLabel`、`maxValue`、`nearest`、`compound`、`bigMax`、`smallStep`、`weights`、`dp`（§3.5）。`pnpm tsx scripts/math/check-pool.ts <draft.json> --topic <slug> --step <id>` 与 validate 同一套规则，逐题证明答案与每个声明的错答。
- 误解码：本域 11 个（§2.1）加复用的 `tick-counting`、`interval-misread`、`unit-factor-wrong`、`decimal-as-subunit`；`size-is-mass`、`taller-holds-more`、`balance-misread`、`unreasonable-estimate` 只由 `choose` 的错选项诊断；validate 拒绝本题诊断不出的码（§3.6）。

### 9.4 Codex 引擎收尾验收（2026-10-19）

从 WIP `c842cd9` 继续；正式 `measuring` 课程未施工。收尾提交 `5735f31`、`78412c7`、`742d460`：补 12 个 fixture e2e；单位芯片继承步上限；中英文器具读屏描述不代算答案；修压短卷尺拖动反映射、圆盘缺口取近端；量杯印单位并扩大窄屏器具；开放尺子末端放大；验证砝码目标 / 最少解不超过盘的 12 个上限、读数括号从 0 开始，以及成组器具换算后范围一致。最后一项修正示例中两个相同杯身却使用不同容量范围的比较图。

| 门槛 | 结果 |
|---|---|
| `pnpm install --frozen-lockfile` | 通过；未改依赖、lockfile 或 package.json |
| `pnpm check` | 570 文件，0 errors、0 warnings；4 个既有 unused-symbol hints 在本次引擎范围外 |
| `pnpm validate` | 34 topics，0 errors、0 warnings |
| `pnpm test` | 105 文件、2734 tests 全部通过 |
| `pnpm build` | 通过，71 个静态页面 |
| `pnpm shoot sample-lesson-measure --beats --tasks --keys --layout` | 通过；24 拍、32 题（95 张题目状态图）、键盘 / 布局均 0 失败 |
| 最后按要求重跑 `pnpm shoot sample-lesson-measure --beats --keys --layout` | 通过；24 拍全部打开检查；8 个尺寸（390×844 至 3840×2160），16 张布局图，0 issues；成对量杯修正后补拍其开始 / 错误 / 正确三态 |
| 五个已发布 MathScene 主题回归截图 | fractions 15、multiplication-division 15、telling-time 14、area-perimeter 14、decimals 18，共 76 张与引擎施工前 `9b66ac6` 逐字节相同；8 张有 HUD 淡入差异的帧在两份构建上都关掉 CSS 动画后重拍比较 |
| `CI=1 pnpm e2e` | 144 passed（23.0 分钟，单 worker）；含 fixture 的 12 项、32 题浏览器解法、中文 cinema 手机器具尺寸与 44 px 控件 |

截图在 `shots/sample-lesson-measure/{en-paper,zh-cinema}/`；回归基线、比较清单、门槛日志在 `shots/measuring-regression/`（照仓库规则不进 git）。fixture 页面 JS 为 283.5 KB gzip（10 文件）。已看全部 24 拍，并检查 paper 的桌面 / 平板 / 手机与中文 cinema 手机的工具、作答与器具；修掉量杯过小及容量比较误导的问题。

并行截图期间曾触发现有地理单测的 5 秒超时，以及既有 SpaceScene 锚点等待误差；最终验收采用串行完整 CI，全部通过，未放宽测试容差、未改其他主题内容。没有 merge 或 push。数据形状见 §9.3，与 §3 的差异见 §9.2；§8 的正式课程内容验收仍留给课程施工。

### 9.5 正式课施工（2026-10-20，阶段 2–6）

**规模**：13 步 58 拍（第 08 步 5 拍，见下）、题库 128 道（每步 8–10：第 11、13 步 9 道，其余 10 道）+ 练习 8 道（read-scale、count-intervals、set-scale、choose、order、input 六种），共 136 道全部自证；背景章 00 + 13 章 + 练习章；名词表 16 条、来源 19 条（`sources.json` / `SOURCES.md`）；三张章节图放在第 04、05、07 章第一段之后（alt / caption 按画面写，双语）；`topic.yaml` `status: published`，`illustration: measuring`。`tests/math-scene/measuring-lesson.test.ts`（144 项：0 lesson issue、步数拍数题数、每拍每题都画器具且归量读数域、15 个码都有题能诊断、km / ml 从第 10 步起、复合单位从第 11 步起、小数只在桥步、第 12 步 ≥ 3 道占位 0、固定说法、章节里无年级与 L / mL、每道题自证且在本步 `limits` 内）；`tests-e2e/measuring.spec.ts`（9 项：点刻度换拍与放大镜、读秤 + 工具 + 单位诊断、天平放砝码、数格子 + tick-counting 诊断、复合两框 + compound-place、纯键盘倒水、练习到总结 + compound-concatenated、zh 与“再往前一步”、390 × 844）；首页 / 冒烟计数改为 25 个已发布主题（数学 6 个、徽章 50、ww2 图版 25）。

**分工与 Codex**：拍、要点、`limits`、每步 2 道样板题、练习 8 题由 Claude 手写（构建脚本在 scratchpad，产物是 `data/lesson.json`）。题库其余 102 道由 Codex 起草：13 条 `codex exec --sandbox danger-full-access`（4 条并行），brief 是 `scripts/math/drafts/BRIEF-measuring.md`（照 skill 的 codex-pool-brief 改：A11 写法、`{u:…}`、§9.3 的数据形状、各步题库计划），13 份草稿交回时都已 `check-pool --topic measuring --step <id>` 0 错 0 警告（Codex 在自己的会话里跑到通过），Claude 逐题读过（题意、数、课纲、中文）。英文正文由 Codex 按 `TEXT-BRIEF-measuring.md` 起草（4 条并行，以 `art/codex-drafts/measuring/` 的旧稿为底、按现在的拍重写），Claude 逐句核对、改写后定稿；中文正文（15 章）Claude 独立写，“ ”引号，术语按 D14（质量、容量、千克、千米；名词表注“公斤”“公里”）。

**审题删改**（合并脚本里逐条记录）：两道几乎相同的选秤题删一道；两道读数不从 0 开始的指针秤（2–4 kg、2000–2100 g）改成从 0 起或换成天平；与练习 Q7（1 m 26 cm）、拍里 Mei Ling 128 cm 重复的身高改人名和数；与读数题同值的加米题改成 2 kg 400 g；身高尺比 1 m 5 cm 的题改成两条卷尺的箭头（见引擎问题 2）；书桌改巴士（书桌常用厘米）；中文“标数刻度”统一为“标了数的刻度”，“叶片 / 细绳”改“叶子 / 绳子”。改过的题全部重新自证。

**与 §2.2 拍表不同的地方**（引擎约束下的写法）：
1. `pair` / `set` 只收同一种器具、同一物理范围：第 04 步第 1 拍只画米尺（括号标 1 m），第 3 拍只画走廊的卷尺（铅笔只在算式与字幕里）；第 08 步原第 1 拍"尺、秤、量杯三件并排"拆成五个单器具拍（尺上铅笔 → 回形针 0–20 g 秤 → 米 0–10 kg 秤 → 木瓜 0–5 kg 秤 → 一桶水），所以全课 58 拍不是 57；第 09 步第 2 拍两台同为 0–1000 g 的秤（B 袋指到 1000），在同一刻度上看出 1 kg = 1000 g。
2. 第 11 步第 4 拍、第 12 步第 5 拍用卷尺的箭头比 1 m 5 cm / 1 m 50 cm 与 205 / 250 cm（身高尺从 1 m 截断时，1 m 5 cm 只露出半个头顶）。
3. 第 03 步第 4、5 拍加放大镜（数格子的弧画在身高尺有人的一侧，被头挡住）；第 06 步第 3 拍只用 `count` 不用 `zoom`（圆盘上的放大镜圈很大，压住表盘）；第 13 步第 2 拍用 `count` 1 → 1.4 代替放大镜。
4. 成对 / 三件器具的 `label` 不写量（引擎问题 1），量写在字幕里（"Bag A is {u:900 g}…"）。
5. 第 07 步第 2 拍两只同样的量杯 0–6 ℓ、不标数（`labels: none`），读"第 3 / 第 5 条线"。
6. `limits`：第 04 步 `maxValue 100`（米尺 100 cm）、`partsPerLabel [1, 10]`（整米卷尺每格都标数）；第 11 步每小格加 5 cm（比 1 m 5 cm）与 200 g；`maxValue` 是刻度上限，按步给 30 / 200 / 100 / 1000 / 10 / 2000 / 5000 / 9999。

**引擎问题（未改引擎，交主会话）**：
1. 成对 / 三件器具的 `label` 原样印出，不走 `renderRich`：`{u:900 g}` 显示成字面量。课里已避开；应让 label 与括号标签一样渲染记号（并让 bare-quantity 校验覆盖它）。
2. 身高尺 `from > 0`（如 100–200 cm）时人形截在最低一条刻度，读数在最低处时只剩半个头顶；可考虑这种情况下省掉人形或画到框底。
3. 竖放身高尺的 `count` 弧画在人形一侧，被头挡住；`zoom` 的大框里画的是整段的弧（`count` 120 → 128 时框里仍是 1–5），与舞台上的 `count` 跨度不一致。
4. 圆盘上 `zoom` 的小圆框按整段标数间隔的弦长画，半径很大，压住表盘中心和单位字。

**门槛**（合并 main `99f37a8` 之后，同一工作树串行跑）：

| 门槛 | 结果 |
|---|---|
| `pnpm check` | 0 errors、0 warnings（3 个既有 hints） |
| `pnpm validate` | 36 topics，0 errors、0 warnings |
| `pnpm test` | 108 文件、2932 tests 全部通过（含 `measuring-lesson.test.ts` 144 项） |
| `pnpm build` | 通过，75 个静态页面 |
| `pnpm shoot measuring --beats --tasks --keys --layout --locale en,zh --theme paper,cinema` | 四组（en / zh × paper / cinema）各 0 beat、0 task（128 道题库 × 三态 + 8 道练习与总结）、0 key、0 layout（8 个尺寸，含 390 × 844、1024 × 768 与从链接打开）失败，console 干净；页面 JS 283.8 KB gz |
| `CI=1 pnpm e2e` | 163 passed（22.2 分钟；含 `measuring.spec.ts` 9 项、冒烟的 25 个主题计数） |

截图在 `shots/measuring/{en,zh}-{paper,cinema}/`（不进 git）。逐张看过 en-paper 的 58 拍，抽看了 zh-paper、cinema、390 × 844、1024 × 768 与题目三态 / 练习总结。

### 9.6 MathScene 量读数打磨（2026-10-20，`codex/measuring-polish`）

修复 §9.5 的四项引擎问题：成组标签与括号共用单位记号的显示 / 朗读路径（递归裸量校验已有覆盖，补回归测试）；非零起点身高尺完整保留头部，身体在最低刻度下方以断口收尾，同组身高尺共享留白、保持同一比例；竖尺的数格子弧和点格子区移到右侧空白，放大框只画实际数过的格子并保留原编号；圆盘放大镜的源圈缩为刻度边缘的小圈，避开指针、中心与单位。新增标签、身高尺、放大镜的单测，docs/06 同步契约。

正式课只恢复直接用到修复的拍：03.5 数 120 → 128（放大框为 4 格）；06.3、13.2 加回放大镜（13.2 仍只数 1 → 1.4）；09.2 / 09.3 标签带量；11.4 恢复两把身高尺，正文中英文同步改“箭头”为“头顶板”。12.5 的卷尺仍能清楚表达 205 / 250 cm，保留原写法；题库、课纲与题数不变。

验收：`pnpm check`（0 errors / warnings、3 个既有 hints）、`pnpm validate`（36 topics、0 errors / warnings）、`pnpm test`（111 文件、2956 项；新增 24 项）、`pnpm build`（75 个静态页面）全部通过；正式课 `--beats --tasks --keys --layout`、示例课 `--beats --tasks`、小数与整数乘除的 `--beats --tasks` 均 0 失败，console 干净；`CI=1 pnpm e2e` 163 passed。另截 EN / ZH × paper / cinema 的七个代表拍（1920 × 1080、390 × 844），看过改动拍、手机身高尺及示例课 PNG；手机成对身高尺的裁边在视觉验收中修正。截图留在 `shots/`，不进 git。
