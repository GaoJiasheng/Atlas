# 77 · 统计图表 · 内容 spec（`graphs`，MathScene 课；v1 草案，待 Gavin 定稿）

Gavin 2026-11-15 选定的四节新课之一（另三节：docs/76 `angles`、docs/78 `average`、docs/79 `symmetry`）。docs/17 §2.3–2.4 的 `graphs` 一行（"同一组数据换刻度，条的高度怎么变"）与 §7 **A7 图表模型**。2026-11-15 起草，**只出 spec，不施工、不建目录、不提交**。照 skill `.claude/skills/atlas-lesson-topic/` 写；布局照 docs/21、docs/29。

记号同 docs/21：EN 是口吻草稿（施工时 Codex 起草、Claude 核对），ZH 是 Claude 草稿（施工时独立定稿）。S1 = MOE *Mathematics Syllabus Primary One to Six*（2021 P1 cohort，Updated Oct 2025），**起草时用 `pdftotext -layout` 逐页抄录**，页码是页脚 "Page | N"。

**年级更正**：brief 里写"P6 pie charts"。S1 第 40 页 P4 Statistics 的条目是 **"1. Tables, Line Graphs and Pie Charts"**：饼图在 **P4**，和表格、折线图同一条。P5 没有统计条目，P6 只有平均数（第 44 页，docs/78）。docs/17 §2.4 写的 P4 是对的。

---

## 0. 决定

| # | 决定 | 建议 |
|---|---|---|
| D1 | **对象**：STATISTICS · SUB-STRAND: DATA REPRESENTATION AND INTERPRETATION。**主体 P3「1. Bar Graphs」1.1–1.2**（第 02–03 步）与 **P4「1. Tables, Line Graphs and Pie Charts」1.1–1.2**（第 04–07 步）；P1 Picture Graphs、P2 Picture Graphs with Scales 是地基，并成第 01 步 | 同意 |
| D2 | **课的形状**同分数改版后：每章 3–5 拍 + 一道随机小测；练习 8 道；背景章 00 | 同意 |
| D3 | **UI 不出现年级**；P4 段不标 bridge（§0.1 Q1） | 同意 |
| D4 | **课纲只要求"读和解释"**（reading and interpreting）与"填表"（completing a table）：**不让孩子画条形图、折线图、饼图**。讲解拍里由引擎画；小测是读、比、算、填表 | 同意 |
| D5 | **关键画面**（docs/17）：同一组数据换刻度（每格 1 → 每格 2 → 每格 5 / 10），条的高度变、表示的数不变；刻度之间的"半格"怎么读；**截断的纵轴**作为一个细节拍（第 03 步第 5 拍）+ 一道 `choose` | 同意 |
| D6 | **新模型 A7 `chart`**（§3.1）：象形图、条形图（竖 / 横）、折线图、饼图、表格（含划记）五种画法一个模型；过渡 `rescale`、`stack`、`join`；**docs/78 平均数复用**同一个模型（加 `level`） | 同意 |
| D7 | **新小测**只有一种：`fill-table`（填表格里的空格）。读图题用 `input`（舞台上点一根条 / 一个点会画出读数发丝线，是脚手架、不判）和 `choose` | 同意 |
| D8 | **新误解域 `data`**（docs/78 平均数共用这个域）：本课 9 个码 + 复用 `interval-misread`（每格当 1，小数 / 量读数域）与 `unequal-parts`（分数域：饼图里份不等大）（§2.1） | 同意 |
| D9 | **饼图只用分数**：½、¼、⅛（以及 ⅓、⅙ 只在 `choose` 里），求值 = 分数 × 总数（接 P4 Fractions「2. Fraction of a Set」，S1 第 37 页）。百分比（P5）不用；圆心角度数不用 | 同意 |
| D10 | **数据全是虚构的小整数**，图题写清"一个班 / 一个摊位 / 一周"，不说成真实统计；情境：最喜欢的水果、上学方式、借书、食堂饮料、豆苗长高、储蓄罐；人名多族群；无品牌 | 同意 |
| D11 | **步数**：7 个课步 + 练习 + 00。拍 30 个 ≈ 10 min，小测 7 道 ≈ 5 min，练习 8 道 ≈ 5 min：**约 20 分钟** | 同意 |
| D12 | **图**：封面 + 3 张配图（§6）；`art/planned/graphs/` 有 2026-10-18 的 4 张候选，按 §6 重审 | 同意 |

### 0.1 需要 Gavin 看的（每条有默认值）

| # | 问题 | 选项 | 默认 |
|---|---|---|---|
| Q1 | **P4 段（第 04–07 步）标不标 bridge** | (a) 不标；(b) 标 "Going further" | **(a)**：表格、折线图、饼图和条形图是同一种"读图"，连着读顺 |
| Q2 | **截断纵轴**讲多深 | (a) 一拍 + 一道 `choose`（"这张图看起来是两倍，其实是吗"）；(b) 只放 `<More>`；(c) 不讲 | **(a)**：Gavin 指定的细节；课纲没有这条，所以不进练习章 |
| Q3 | **折线图的两点之间能不能读** | (a) 只读点上的值，正文说"两点之间的线只是把变化连起来"；(b) 连续量（豆苗高度）允许读两点之间的估计值 | **(a)**：新加坡 P4 题多半只读点（**待核**课本）；(b) 会碰上"离散的数据不该连线"的讨论，超出 P4 |
| Q4 | **饼图的分数** | (a) 只用 ½、¼、⅛；(b) 加 ⅓、⅙ | **(a) 为主，(b) 只在 choose**（三分之一不好用直角检查） |
| Q5 | **中文"饼图 / 扇形图"与"象形图"** | 饼图（新加坡华文常见说法，**待核**）/ 扇形统计图（大陆课本）；象形图 / 图像统计图 | **饼图、象形图**；名词表注大陆写法（§5.2） |

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字）

| 级 | 子线 · 条目 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|---|
| P1（地基） | Statistics · 1. Picture Graphs | "1.1 reading and interpreting data from picture graphs" | 32 | 第 01 步第 1 拍 |
| P2（地基） | Statistics · 1. Picture Graphs with Scales | "1.1 reading and interpreting data from picture graphs with scales" | 34 | 第 01 步 |
| **P3** | Statistics · 1. Bar Graphs | "1.1 reading and interpreting data from bar graphs" · "1.2 using different scales on axis" | 36 | 第 02–03 步 |
| **P4** | Statistics · 1. Tables, Line Graphs and Pie Charts | "1.1 completing a table from given data" · "1.2 reading and interpreting data from tables/line graphs/pie charts" | 40 | 第 04–07 步 |
| P4（相关） | Fractions · 2. Fraction of a Set | "2.1 fraction as part of a set" | 37 | 第 07 步求值（分数 × 总数） |
| P6（docs/78） | Statistics · SUB-STRAND: DATA ANALYSIS · 1. Average of a Set of Data | "1.1 average as 'total value ÷ number of data'" · "1.2 relationship between average, total value and number of data" | 44 | 不在本课 |

核对要点：
- **饼图在 P4**（第 40 页），不是 P6；P5 没有统计条目。
- P3 1.2 "using different scales on axis" 是读图时看懂刻度，不是孩子自己选刻度画图（D4）。
- P4 1.1 "completing a table from given data"：唯一一条"写"的条目，做成 `fill-table`。
- 课纲没有"截断坐标轴""误导的图"（Q2：本课的细节，不进练习）。

### 1.2 级别、步数与时间

- 7 个课步 + 练习 + 00；地基 P1–P2（01），主体 P3（02–03）、P4（04–07）。
- 拍 30 个（≈ 10 min），小测 7 道（≈ 5 min），练习 8 道（≈ 5 min）：**约 20 分钟**。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字（`limits`） |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | chart（标本） | — | — | — |
| 01 | `picture-graphs` | From pictures to bars | 从象形图到条形图 | P1 1.1 · P2 1.1 | chart（picture → bar） | 4 | 9 · input / choose | 每个图 = 1、2、5、10；半个图 |
| 02 | `reading-bar-graphs` | Reading a bar graph | 读条形图 | P3 1.1 | chart（bar，竖 / 横） | 4 | 10 · input / choose | 值 ≤ 100，3–6 根条 |
| 03 | `scales` | Same data, different scales | 同样的数，不同的刻度 | P3 1.2 | chart（bar，`rescale`、`pair`） | 5 | 10 · input / choose | 每格 1、2、5、10、20 |
| 04 | `tables` | Tables | 表格 | P4 1.1, 1.2 | chart（table，划记） | 4 | 9 · fill-table / input / choose | ≤ 4 × 4 格 |
| 05 | `line-graphs` | Reading a line graph | 读折线图 | P4 1.2 | chart（line） | 4 | 10 · input / choose | 4–7 个点 |
| 06 | `changes-on-line-graphs` | Going up, going down | 折线的升和降 | P4 1.2 | chart（line + 括号） | 4 | 9 · input / choose | 同上 |
| 07 | `pie-charts` | Pie charts | 饼图 | P4 1.2 · P4 Fractions 2.1 | chart（pie）· angle（直角） | 5 | 10 · input / choose | ½、¼、⅛；总数 ≤ 96 |
| 08 | `practice` | Practice | 练习 | — | 按题 | — | 8 道固定题 | — |

### 1.4 不在本课

- 画图（D4）；选择合适的图；众数、中位数、极差（不在小学课纲）。
- 百分比饼图、圆心角（D9）；平均数（docs/78）。
- 双折线、复式条形图（课纲没写；两行表格用第 04 步的二维表代替）。

### 1.5 和别的主题怎么接（不重复讲）

| 主题 | 接在哪 | 本课怎么用 | 不在本课重复的 |
|---|---|---|---|
| `measuring` | 刻度、每一小格表示多少 | 纵轴就是竖起来的尺子：第 03 步复用 `interval-misread` 的说法"先看每格是多少" | 尺、秤的读数 |
| `decimals` | 两条刻度之间的中点 | 第 03 步"半格"一拍只用整数（30 和 40 中间是 35），不出小数 | 小数 |
| `multiplication-division` | 每个图 = 2 个：乘法 | 第 01 步 `4 × 2 = 8` | 乘法表 |
| `fractions` | 一半、四分之一、份要一样大 | 第 07 步：饼图 = 分数墙的圆形版；复用 `unequal-parts`；"对折"看一半 | 分数概念 |
| `angles`（docs/76） | 四分之一圆 = 圆心一个直角 | 第 07 步第 4 拍：用直角检查是不是四分之一 | 量角 |
| `average`（docs/78） | 条形图、`chart` 模型 | docs/78 用本课的 `chart`（加 `stack`、`level`、`mean`）；本课不讲平均 | — |
| `plant`（科学） | 豆苗长高 | 第 05 步的数据是虚构的"一株豆苗每周的高度"，不说成实验结果 | 植物生长 |

---

## 2. 课的设计

### 2.0 写法约定

- **固定说法**：
  - EN "Read the scale first: how much is one gridline?" / ZH "先看刻度：每一格表示多少？"
  - EN "From the top of the bar, go straight across to the scale." / ZH "从条的顶端，平平地看到刻度上。"
  - EN "How many more? Look at the gap between the tops." / ZH "多多少？看两个顶端之间差多少。"
  - EN "The whole circle is everyone." / ZH "整个圆是全部。"
- 颜色只表示"谁的"：题目里点亮的条 / 点 / 扇形 = cold；第二个比较的 = hot；孩子点出的读数发丝线、填的格 = signal；"看答案" = 墨色虚线。条的本色是墨色发丝轮廓 + 极淡的墨色填充（不是彩色分类图）；类别靠标签，不靠颜色。
- 算式：`4 × 2 = 8`、`15 − 7 = 8`、`7 × 5 = 35`、`½ of 32 = 16`；单位跟数据走（"pupils / 人""books / 本""$"）。

### 2.1 误解目录（新域 `data`，与 docs/78 共用；§3.4 写诊断规则）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `key-ignored` | 象形图不看图例：一个图当 1 个；半个图当 1 个或不算 | 4 个芒果图（每个 = 2 人）说 4 人；4 个半说 5 | "The key says one picture stands for 2 pupils. 4 pictures stand for 4 × 2 = 8." / "图例说一个图表示 2 人。4 个图表示 4 × 2 = 8 人。" | S3、S4 |
| `interval-misread`（复用） | 每一格当成 1 | 每格 5 的条在第 7 格说 7 | "Each gridline here is 5, not 1. The bar ends at the 7th line: 7 × 5 = 35." / "这里每一格是 5，不是 1。条顶在第 7 格：7 × 5 = 35。" | docs/32 §2.1；S3 |
| `between-gridlines` | 条顶在两格中间时读成下面（或上面）那条线 | 30 和 40 中间说 30 | "The top is halfway between 30 and 40. Halfway is 35." / "顶端在 30 和 40 正中间。正中间是 35。" | S3、S5 |
| `value-for-difference` | 问"多多少"答成大的那个数（或两数之和） | 15 和 7 问多多少，答 15 或 22 | "How many more is the gap between the two tops: 15 − 7 = 8." / "多多少，是两个顶端之间的差：15 − 7 = 8。" | S4、S6 |
| `scale-ignored-compare` | 两张刻度不同的图，直接比条的高矮 | 刻度 10 的矮条说比刻度 2 的高条少 | "These two graphs have different scales. Read each number first, then compare the numbers." / "这两张图刻度不一样。先读出数，再比数。" | S5；本课提出的诊断 |
| `truncated-axis` | 纵轴不从 0 开始时，按条的高矮比倍数 | 24 和 28 的条看起来一个是另一个的两倍 | "This axis starts at 20, not 0, so the bars do not show the whole amounts. 28 is not twice 24." / "这条轴从 20 开始，不是 0，条没有画出全部。28 不是 24 的两倍。" | S7 |
| `tally-misread` | 划记数错：一捆（四竖一斜）当 4 或 6 | 3 捆 + 2 说 14 或 20 | "Each bundle is 5: four strokes and one across. Count in fives: 5, 10, 15, then 16, 17." / "每一捆是 5：四竖加一斜。五个五个地数：5、10、15，再 16、17。" | 本课提出的诊断 |
| `total-misused` | 表格里求缺的数时，把"总数"当成一行加进去，或漏掉一行 | 总数 60，其余 18、15、12，答 105 或 30 | "The total is all the rows together. Take the rows you know away from it: 60 − 18 − 15 − 12 = 15." / "总数是所有行加起来。用总数减去知道的几行：60 − 18 − 15 − 12 = 15。" | S6 |
| `height-for-change` | 折线图上"增加最多"选最高的点，而不是最陡的一段 | 选到 6 月（最高），其实 1 → 2 月涨得最多 | "The highest point is the biggest amount, not the biggest increase. The steepest rise is from January to February: 25 − 10 = 15." / "最高的点是最多的时候，不是增加最多的时候。最陡的一段是 1 月到 2 月：25 − 10 = 15。" | S8、S9 |
| `fraction-as-count` | 饼图上的分数当成人数（¼ → 4 人），或用错总数 | 32 人里 ¼ 说 4 人 | "¼ is a part of the whole class, not 4 pupils. ¼ of 32 = 32 ÷ 4 = 8." / "¼ 是全班的一部分，不是 4 个人。32 的 ¼ 是 32 ÷ 4 = 8。" | S10 |
| `unequal-parts`（复用分数域） | 饼图里有 4 份就说每份是 ¼，不看份是否一样大 | 4 块不等的扇形说每块 ¼ | "There are 4 parts, but they are not the same size, so this part is not a quarter. A quarter has a right angle at the centre." / "有 4 份，可是不一样大，这一份不是四分之一。四分之一在圆心是一个直角。" | docs/15 §2.2 |

`scale-ignored-compare`、`truncated-axis` 只由 `choose` 诊断。每个码至少一拍 ⚑、至少一道题。

### 2.2 逐步设计

模型简写（§3.1）：`B{cats:[mango 8, …], step:1, labels:2}` = 条形图，每格 1、每 2 格一个数字；`Pic{… key:2}` = 象形图；`L{…}` = 折线图；`Pie{½ walk, ¼ bus, …, total 32}`；`T{rows…}` = 表格；`guide:mango` = 从条顶到刻度的读数发丝线；`brace:[a,b]` = 两顶端之间的差的括号；`from:20` = 纵轴从 20 开始。

数据（虚构）：**水果**（一个班最喜欢的水果）芒果 8、榴梿 6、红毛丹 9、香蕉 4；**借书**（六月读的书）Aisha 12、Ravi 7、Mei Ling 15、Daniel 9；**饮料**（食堂一个摊位一天卖出的杯数）豆奶 35、薏米水 20、酸柑汁 45、菊花茶 30；**豆苗**（每周末的高度，cm）第 0–5 周 2、3、5、8、10、11；**储蓄罐**（Siti 每月底罐里的钱，$）1–6 月 10、25、30、30、25、35；**上学方式**（一个班 32 人）走路 ½、巴士 ¼、地铁 ⅛、家长送 ⅛。

---

#### 第 01 步 `picture-graphs` · 从象形图到条形图（P1 1.1 · P2 1.1，地基）

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `Pic{走路 3、巴士 5、家长送 2、地铁 4; key:1}`，标题"一组人怎么上学" | — | `3 + 5 + 2 + 4 = 14` | In a picture graph, each picture stands for something counted. Here one picture is one pupil: 14 pupils in this group. | 在象形图里，每个图表示数过的东西。这里一个图是一个学生：这一组一共 14 人。 |
| 2 | `Pic{水果; key:2}`，图例框亮起（cold） | `morph` | `4 × 2 = 8` | With more to count, one picture can stand for 2 pupils. The key tells you so: 4 mango pictures mean 4 × 2 = 8 pupils. | 要数的多了，一个图可以表示 2 人。图例会告诉你。4 个芒果图表示 4 × 2 = 8 人。 |
| 3 ⚑ | 红毛丹一行 4 个半图，半图亮起 | `shade` | `4 × 2 + 1 = 9` | Half a picture is half of 2: 1 pupil. So rambutan is 4 × 2 + 1 = 9, not 5 and not 4. | 半个图是 2 的一半：1 人。所以红毛丹是 4 × 2 + 1 = 9 人，不是 5，也不是 4。（`key-ignored`） |
| 4 | 图一列列落下叠成条，竖轴 0–10、每格 1、每 2 格一个数 | `stack` | `mango 8 · durian 6 · rambutan 9 · banana 4` | Stack the pictures and draw round them: you get a bar graph. Now you do not count pictures; you read where each bar ends on the scale. | 把图叠起来，沿外边画一圈，就成了条形图。这时不用数图，看每根条顶到刻度的哪里。 |

**要点**：① Read the key first: how many does one picture stand for? / 先看图例：一个图表示多少？② A bar graph shows the same numbers with bars and a scale. / 条形图用条和刻度表示同样的数。

**题库（9）**：5 道 `input`（每个图 = 2、5、10；半个图只在每个图表示偶数时出现；错例 `key-ignored`）；2 道 `choose`（哪一种最多 / 最少）；2 道 `input`（一共多少）。

---

#### 第 02 步 `reading-bar-graphs` · 读条形图（P3 1.1）

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `B{借书; step:1, labels:2}`，标题、纵轴名"Number of books / 书的本数"、刻度依次点亮 | — | — | A bar graph has a title, a label on each axis and a scale. On this scale each gridline is 1 and every second one has a number. | 条形图有标题，两条轴各有名字，还有刻度。这个刻度每一格是 1，每隔一格写一个数。 |
| 2 | `guide:Mei Ling` | `place` | `15` | To read a bar, go from its top straight across to the scale. Mei Ling read 15 books: her bar ends on the line just above 14. | 读一根条，从顶端平平地看到刻度上。Mei Ling 读了 15 本：她的条顶在 14 上面那一格。 |
| 3 ⚑ | `brace:[Mei Ling, Ravi]` | `shade` | `15 − 7 = 8` | How many more books did Mei Ling read than Ravi? It is the gap between the two tops: 15 − 7 = 8, not 15. | Mei Ling 比 Ravi 多读了几本？看两个顶端之间差多少：15 − 7 = 8，不是 15。（`value-for-difference`） |
| 4 | 同一组数据变成横条形图（`orient: horizontal`） | `morph` | `12 + 7 + 15 + 9 = 43` | A bar graph can also lie on its side. Read along to the scale at the bottom. Together the four friends read 43 books. | 条形图也可以横着放，往下看到底下的刻度。四个人一共读了 43 本。 |

**要点**：① From the top of the bar, go straight across to the scale. / 从条的顶端平平地看到刻度。② "How many more" is the difference between two bars. / "多多少"是两根条的差。

**题库（10）**：5 道 `input`（读一根条；多多少；一共多少；错例 `value-for-difference`）；3 道 `choose`（最多 / 最少 / 哪两个一样多）；2 道 `input`（横条形图）。

---

#### 第 03 步 `scales` · 同样的数，不同的刻度（P3 1.2）

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `B{水果; step:1}`（每格同样高，图很高） | — | `1 gridline = 1` | Here is the fruit graph again, with each gridline worth 1. The bars are tall. | 还是那张水果图，每一格表示 1。条很高。 |
| 2 | `step:1 → 2`：刻度数字换、条变矮一半；红毛丹顶在 8 和 10 中间 | `rescale` | `1 gridline = 2 · rambutan 9` | Change the scale so that each gridline is 2. The bars get shorter, but the numbers they show do not change. Rambutan is halfway between 8 and 10: 9. | 换个刻度，每一格表示 2。条变矮了，表示的数没有变。红毛丹在 8 和 10 正中间：9。 |
| 3 ⚑ | `B{饮料; step:5}`，豆奶条顶在第 7 格 | `morph` | `7 × 5 = 35` | Bigger numbers need a bigger scale. Here each gridline is 5. Soya bean milk ends at the 7th line: 7 × 5 = 35 cups, not 7. | 数大了，就要用大一点的刻度。这里每一格是 5。豆奶顶在第 7 格：7 × 5 = 35 杯，不是 7。（`interval-misread`） |
| 4 ⚑ | 同一组数据 `step:10`；豆奶、酸柑汁顶在两格中间，中点画短虚线 | `rescale` | `halfway 30 → 40 = 35` | With each gridline worth 10, soya bean milk ends halfway between 30 and 40. Halfway is 35, the same as before. | 每一格是 10 时，豆奶顶在 30 和 40 的正中间。正中间是 35，和刚才一样。（`between-gridlines`） |
| 5 ⚑ | `pair:[B{24, 28; from:20}, B{24, 28; from:0}]` | `morph` | `28 ≠ 2 × 24` | Look where the axis starts. On the left it starts at 20, so the bar for 28 looks twice as tall as the bar for 24. From 0, they are nearly the same. | 看轴从哪里开始。左边从 20 开始，28 的条看起来是 24 的两倍高。从 0 开始画，两根条差不多高。（`truncated-axis`） |

**要点**：① Read the scale first: how much is one gridline? / 先看刻度：每一格表示多少？② Halfway between two gridlines is the number in the middle. / 两格正中间，是两个数中间的那个数。③ Check that the axis starts at 0 before you compare heights. / 比高矮之前，先看轴是不是从 0 开始。

**题库（10）**：6 道 `input`（每格 2、5、10、20，含半格；错例 `interval-misread`、`between-gridlines`）；2 道 `choose`（两张刻度不同的图，哪个数大 → `scale-ignored-compare`）；1 道 `choose`（截断轴：真的是两倍吗 → `truncated-axis`）；1 道 `choose`（这张图每格是多少）。

---

#### 第 04 步 `tables` · 表格（P4 1.1, 1.2）

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `T{tally}`：Ravi 在饮料摊划记，薏米水 4 捆（20）；第二列"数目"空着 → 填 20 | `place` | `5 + 5 + 5 + 5 = 20` | Ravi tallied the drinks a stall sold. Each bundle is four strokes with one across: 5. Count in fives, then write the number in the table. | Ravi 在饮料摊上划记卖出的杯数。每一捆是四竖加一斜：5。五个五个地数，再把数写进表格。 |
| 2 | 四行 + "Total / 总数"一行，一格写 "?"（signal） | `shade` | `35 + 20 + 45 + 30 = 130` | A table puts the numbers in rows. The last row is the total of all the rows above it. | 表格把数排成一行一行。最后一行是上面所有行的总数。 |
| 3 ⚑ | 新表：总数 60，三行 18、15、12，一行 "?" | `shade` | `60 − 18 − 15 − 12 = 15` | If the total is known, a missing row is the total take away the rows you know: 60 − 18 − 15 − 12 = 15. The total is not one of the rows. | 知道总数时，缺的那一行是总数减去知道的几行：60 − 18 − 15 − 12 = 15。总数本身不是其中一行。（`total-misused`） |
| 4 | 二维表：行 = 三年级、四年级，列 = 走路、巴士、地铁，带行总数、列总数；一格（四年级 · 巴士）亮起 | `shade` | `row: P4 · column: bus → 14` | Some tables have rows and columns. Go along a row and down a column: the cell where they meet answers one question. | 有的表格有行也有列。沿一行看过去、沿一列看下来，交叉的那一格回答一个问题。 |

**要点**：① Count tally marks in fives. / 划记五个五个地数。② The total row is all the other rows added together. / 总数是其他各行加起来。

**题库（9）**：4 道 `fill-table`（从划记或一段话填表、填总数；错例 `tally-misread`、`total-misused`）；3 道 `input`（二维表读一格、求缺的数）；2 道 `choose`（哪一行最多）。

---

#### 第 05 步 `line-graphs` · 读折线图（P4 1.2）

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `L{豆苗; points only; y step:2, x weeks 0–5}` | — | — | A line graph shows how something changes over time. Each point is one measurement: the height of a bean plant at the end of each week. | 折线图表示一样东西随时间怎么变。每个点是一次测量：一株豆苗每周末的高度。 |
| 2 | 点按顺序连线 | `join` | — | Join the points in order with straight lines. The line shows at a glance when the plant grew fast and when it grew slowly. | 按顺序用直线把点连起来。一眼就看得出豆苗什么时候长得快，什么时候长得慢。 |
| 3 | `guide:week 3`（从 x 轴往上到点，再平着到 y 轴），点在 4 和 6 中间 | `place` | `week 3 → 5 cm` | To read a point, go up from the week to the point, then straight across to the scale. At week 3 the plant was 5 cm tall, halfway between 4 and 6. | 读一个点，从那一周往上找到点，再平平地看到刻度。第 3 周豆苗高 5 cm，在 4 和 6 正中间。 |
| 4 | `L{储蓄罐; y step:5}`，三段分别标上升 / 平 / 下降（cold / 墨 / hot 小三角） | `morph` | `words: up · flat · down` | A different graph: the money in Siti's savings box at the end of each month. Where the line goes up, the amount increased; flat, it stayed the same; down, it decreased. | 换一张图：Siti 储蓄罐里每月底有多少钱。线往上，钱多了；平的，没变；往下，钱少了。 |

**要点**：① Each point is one reading; read it like the top of a bar. / 每个点是一次读数，读法和条顶一样。② Up means increase, down means decrease, flat means no change. / 往上是增加，往下是减少，平的是没变。

**题库（10）**：6 道 `input`（读一个点，每格 1、2、5，含半格；错例 `between-gridlines`、`interval-misread`）；4 道 `choose`（哪个月最多 / 最少；哪两个月一样多）。

---

#### 第 06 步 `changes-on-line-graphs` · 折线的升和降（P4 1.2）

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `L{储蓄罐}`，`brace:[Jan, Feb]`（竖括号） | `shade` | `25 − 10 = 15` | From January to February the line goes up from 10 to 25. The increase is the difference: 25 − 10 = $15. | 1 月到 2 月，线从 10 升到 25。增加了多少就是两数之差：25 − 10 = 15 元。 |
| 2 ⚑ | 每一段的升降写在段旁；1 → 2 月一段加粗（signal）；6 月的点（最高）hot | `shade` | `+15 · +5 · 0 · −5 · +10` | The biggest increase is the steepest part going up, January to February: $15. June is the highest point, but from May to June the increase is only $10. | 增加最多的是往上最陡的一段，1 月到 2 月：15 元。6 月的点最高，可是 5 月到 6 月只增加了 10 元。（`height-for-change`） |
| 3 | 3 → 4 月（平）、4 → 5 月（下降）两段点亮 | `shade` | `30 − 30 = 0 · 30 − 25 = 5` | From March to April the line is flat: no change. From April to May it goes down: Siti took out $5. | 3 月到 4 月线是平的：没有变化。4 月到 5 月往下：Siti 取出了 5 元。 |
| 4 | 从 y 轴 30 平着画虚线，碰到两个点（3 月、4 月） | `place` | `$30 → March, April` | You can also read the other way: start at $30 on the scale and go across. The line has $30 in two months, March and April. | 也可以反过来读：从刻度上的 30 平着看过去。有两个月是 30 元：3 月和 4 月。 |

**要点**：① An increase or decrease is the difference between two points. / 增加或减少多少，是两个点的差。② The steepest part shows the biggest change, not the highest point. / 最陡的一段变化最大，最高的点不一定。

**题库（9）**：5 道 `input`（两点之间增加 / 减少多少；错例 `value-for-difference`）；3 道 `choose`（哪两个月之间增加最多 → `height-for-change`；哪一段没变化）；1 道 `choose`（哪几个月是 $25，多选）。

---

#### 第 07 步 `pie-charts` · 饼图（P4 1.2 · Fractions 2.1）

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `Pie{上学方式; total 32}`，整个圆一圈 cold 轮廓 | — | `whole = 32 pupils` | A pie chart shows how a whole is shared. Here the whole circle stands for all 32 pupils in a class. | 饼图表示一个整体怎么分。这里整个圆表示全班 32 个学生。 |
| 2 | 走路那一份（½）亮起，圆沿直径对折一下再展开 | `fold` | `½ walk` | This part is half the circle: fold the circle along the line and the two halves match. Half of the class walks to school. | 这一份是半个圆：沿这条线对折，两半正好重合。全班一半的人走路上学。 |
| 3 ⚑ | 巴士那一份（¼）亮起 | `shade` | `¼ of 32 = 32 ÷ 4 = 8` | The bus part is a quarter of the circle, so it is a quarter of the class: ¼ of 32 = 32 ÷ 4 = 8 pupils, not 4. | 巴士那一份是圆的四分之一，就是全班的四分之一：32 的 ¼ = 32 ÷ 4 = 8 人，不是 4 人。（`fraction-as-count`） |
| 4 ⚑ | 另一个饼：4 块不等（150°、90°、70°、50°），70° 那块 hot；圆心直角小方块叠在 90° 那块（复用 A5 `square`） | `morph` | `4 parts ≠ 4 quarters` | This pie also has 4 parts, but they are not the same size. Only a part with a right angle at the centre is a quarter. | 这个饼也分成 4 块，可是大小不一样。圆心是直角的那一块才是四分之一。（`unequal-parts`） |
| 5 | 回到上学方式饼，走路与巴士比 | `shade` | `16 − 8 = 8 · 16 = 2 × 8` | Compare parts like bars: walking is 16 and bus is 8, so 8 more pupils walk. The walk part is twice the bus part. | 比两份就像比两根条：走路 16 人，巴士 8 人，走路的多 8 人。走路那一份是巴士的两倍大。 |

**要点**：① The whole circle is everyone. / 整个圆是全部。② A part's value is the fraction of the total: ¼ of 32 = 8. / 一份表示多少，是总数的几分之几：32 的 ¼ = 8。

**题库（10）**：6 道 `input`（½、¼、⅛ 乘总数；已知一份的人数求总数（¼ 是 8 人，全班多少）；错例 `fraction-as-count`）；3 道 `choose`（哪一份最大；哪一块是四分之一 → `unequal-parts`）；1 道 `choose`（⅓ 那一份，Q4）。总数是分母的倍数，≤ 96。

---

### 2.3 练习章 `practice`（8 道固定题）

| # | 题型 | 题目（EN / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `input` | Each picture stands for 10 pupils. How many P3 pupils chose durian?（3 个半图）/ 每个图表示 10 人。选榴梿的三年级学生有几人？ | 35 | 3 或 4 → `key-ignored` | 01 |
| Q2 | `input` | How many more cups of lime juice than barley water were sold?（每格 5）/ 酸柑汁比薏米水多卖了几杯？ | 25 | 45 → `value-for-difference`；5 → `interval-misread` | 02、03 |
| Q3 | `input` | How many cups of soya bean milk?（每格 10，顶在 30 与 40 正中）/ 豆奶卖了几杯？ | 35 | 30 → `between-gridlines` | 03 |
| Q4 | `fill-table` | Complete the table from the tally marks. / 按划记填表。（3 捆 + 2、4 捆 + 1、总数） | 17、21、38 | 14 → `tally-misread` | 04 |
| Q5 | `input` | The total is 80. How many pupils chose swimming? / 总数是 80，选游泳的有几人？ | 23 | 137 → `total-misused` | 04 |
| Q6 | `choose` | Between which two months did the savings increase the most? / 哪两个月之间增加最多？ | 1 → 2 月 | 5 → 6 月 → `height-for-change` | 06 |
| Q7 | `input` | ¼ of the 40 pupils take the bus. How many is that? / 40 人里 ¼ 坐巴士，是几人？ | 10 | 4 → `fraction-as-count` | 07 |
| Q8 | `input` | Read the temperature at 2 pm.（折线图，每格 2，点在 30 与 32 正中）/ 读出下午 2 点的气温。 | 31 °C | 30 → `between-gridlines` | 05 |

题型：input、fill-table、choose；象形图、条形图、表格、折线图、饼图都有。截断轴不进练习（Q2 of §0.1）。

---

## 3. 引擎：A7 `chart`、`fill-table`、`data` 误解域

### 3.0 复用与新增

| 编号 | 内容 | 复用 / 新增 |
|---|---|---|
| — | 讲解拍、题库、练习、`input`、`choose`（选项可以是 `chart`）、`words`、`limits`、`check-pool` | 复用 |
| — | `fold` 过渡（第 07 步对折饼）；A5 的直角小方块（第 07 步，若 docs/76 未先做，退回一条字幕 + 圆心一个小方块的 `chart` 自绘） | 复用 |
| — | `interval-misread`、`unequal-parts` | 复用（一码多域） |
| **E-GR1** | 模型 `chart`（§3.1）：`picture`、`bar`、`line`、`pie`、`table` | 新增 |
| **E-GR2** | 过渡 `rescale`、`stack`、`join` | 新增 |
| **E-GR3** | 小测 `fill-table`（§3.2）；`input` / `choose` 在 `chart` 上点条 / 点会画读数发丝线（脚手架） | 新增 |
| **E-GR4** | 误解域 `data`（本课 9 码；docs/78 再加 7 码）+ `lib/diagnose/data.ts` | 新增 |
| **E-GR5** | 右上卡 CHART、PLATE 行（§3.3） | 新增 |

### 3.1 E-GR1 模型 `chart`

```json
{ "kind": "chart",
  "type": "picture" | "bar" | "line" | "pie" | "table",
  "title": { "en": "…", "zh": "…" },
  "cats": [ { "id": "mango", "label": { "en": "Mango", "zh": "芒果" }, "value": 8, "icon": "mango" } ],   // picture / bar / pie；line 的 x 也是 cats
  "axis": { "from": 0, "to": 10, "step": 1, "labels": 2, "name": { "en": "Number of pupils", "zh": "人数" }, "unit": "pupils" },
  "orient": "vertical" | "horizontal",
  "key": { "per": 2, "icon": "mango" },        // 象形图图例；value 不是 per 的倍数时画半个图（validate：只许半个）
  "guide": ["mango"],                          // 读数发丝线（条顶 / 点 → 刻度；或 `{ "y": 30 }` 从刻度平着画）
  "brace": [ "aisha", "ravi" ],                // 两顶端之差的括号（signal，带数）
  "segments": "signs",                         // 折线：每段旁写 +15 / 0 / −5
  "highlight": { "mango": "cold", "rambutan": "hot" },
  "pie": [ { "id": "walk", "frac": "1/2" } ],  // 饼图份（分数，和为 1）或 `deg`（只在 ⚑ 拍画不等分）
  "total": 32,
  "table": { "cols": [...], "rows": [ { "id": "barley", "tally": 20, "value": 20 | "?" } ], "totalRow": true, "totalCol": false },
  "pair": [ {…}, {…} ],                        // 两张图并排（刻度不同 / 截断对比），同一尺寸
  "note": { "en": "…", "zh": "…" }
}
```

**画面**（技术图版语法）：坐标轴 1.5 px 墨线，格线发丝（ink 14 %），每格同样高（所以换刻度时图的总高度变，D5 的关键画面）；刻度数字衬线体、最小 12 px；条是墨色发丝轮廓 + ink 8 % 填充，点亮时 cold / hot；象形图的图标是 docs/08 的单色线描小图（芒果、榴梿、红毛丹、香蕉、书、杯、人），**不画国旗、商标**；饼图从 12 点方向顺时针排，份之间留发丝白缝，份名写在份内或引线外（docs/08 两栏引线规则）；表格是规格表样式（发丝分隔线、表头小号大写）；划记按真写法（四竖一斜）。`from > 0` 时**不画**断轴记号（截断拍要它"看起来误导"），validate 只许在 `⚑ truncated-axis` 拍和对应 `choose` 里用。

**过渡**：`rescale`（刻度数字淡换、条高按新刻度补间，≤ 900 ms）、`stack`（象形图的图标下落叠成条，再描出条轮廓）、`join`（点按顺序画线）、`morph`（换图种）；`shade`、`place`、`fold` 复用。

**校验**（`validate-data.ts`）：值落在轴范围内；象形图的值是 `per` 的整数倍或多半个（半个只许 `per` 为偶数）；饼图分数和为 1，`total` 是各分母的倍数；表格总数行与各行一致（除了 "?"）；`limits`（`maxValue`、`steps: [1, 2, 5, 10, 20]`、`fractions: ["1/2","1/4","1/8"]`）。

### 3.2 E-GR3 小测

| kind | 字段 | 孩子做什么 | 键盘 | 检查 | `sample` |
|---|---|---|---|---|---|
| `fill-table` | `{ model: chart(table), cells: { "barley.value": 20, "total.value": 130 } }` | 在表格的空格里写数（数字框，同 `input` 的整数写法）；上面可以有划记或一段话 | 格是 Tab 顺序的输入框，Enter 下一格 | 每格都对；错的格单独标 ○，反馈说那一格 | `"barley.value=14"` |
| `input` / `choose` + `chart` | 舞台上的 `chart` 可点：点一根条 / 一个点 → 画读数发丝线（不判、不泄露数）；横读题点刻度 → 平着的发丝线 | 条 / 点是 roving-tabindex 按钮 | 同 `input` / `choose` | 同 |

### 3.3 E-GR5 HUD

右上卡 **CHART**：TYPE（BAR / LINE / PIE / TABLE / PICTURE）· SCALE（"1 gridline = 5"；象形图 "1 picture = 2"；饼图 "whole = 32"）· READ（讲解拍：这一拍读出的数；小测：只有孩子点过的发丝线对应的刻度位置，不给答案）。PLATE 行 MODEL CHART · ITEMS · SCALE · TOTAL（TOTAL 在讲解拍有、小测里做完才有）。背景章 00 标本：水果条形图 + 一根读数发丝线（`SPECIMEN BAR GRAPH · 1 GRIDLINE = 1`）。

### 3.4 E-GR4 诊断规则（`lib/diagnose/data.ts`）

| code | 规则（正确值 `t`，孩子答 `x`） |
|---|---|
| `key-ignored` | `x` = 图标个数（半个算 1 或 0），`per ≠ 1` |
| `interval-misread` | `x` = 条顶所在的格数（每格当 1），`step ≠ 1` |
| `between-gridlines` | 条顶在两格中点，`x` = 下面或上面那条格线的值 |
| `value-for-difference` | "多多少 / 增加多少"题 `x` = 较大值或两值之和 |
| `tally-misread` | `x` = 捆数 × 4 + 零头 或 捆数 × 6 + 零头 |
| `total-misused` | 缺行题 `x` = 总数 + 已知各行，或少减一行 |
| `height-for-change` | `choose` 选项；`input` 型"增加最多是多少"答成最高点的值 |
| `fraction-as-count` | `x` = 分母或分子（`t ≠` 它） |
| `unequal-parts`、`scale-ignored-compare`、`truncated-axis` | `choose` 专用 |

单测：`tests/math-scene/{chart,diagnose-data}.test.ts`。docs/06 加「图表（A7）」一节。

---

## 4. 名词表（`glossary.json`，13 个）

| id | EN | ZH | 定义要点 |
|---|---|---|---|
| `data` | data | 数据 | 数出来、量出来的一组数。 |
| `picture-graph` | picture graph | 象形图 | 用图表示数的统计图；图例说一个图表示多少（Q5）。 |
| `key` | key | 图例 | 说明一个图表示多少的小框。 |
| `bar-graph` | bar graph | 条形图 | 用条的长短表示数的统计图。 |
| `axis` | axis | 轴 | 条形图、折线图边上的直线，上面有刻度。 |
| `scale` | scale | 刻度 | 轴上每一格表示多少。 |
| `gridline` | gridline | 格线 | 从刻度横过图的细线，帮你读数。 |
| `table` | table | 表格 | 把数排成行和列。 |
| `tally` | tally marks | 划记 | 边数边画的短线，四竖一斜是 5。 |
| `total` | total | 总数 | 全部加起来的数。 |
| `line-graph` | line graph | 折线图 | 把各个时候的读数用直线连起来，看变化。 |
| `pie-chart` | pie chart | 饼图 | 用圆的几份表示一个整体怎么分（Q5）。 |
| `increase-decrease` | increase, decrease | 增加、减少 | 两个读数之差；往上是增加，往下是减少。 |

---

## 5. 写作规则与术语

### 5.1 口吻样例

- 讲解："Read the scale first. Each gridline here is 5." / "先看刻度。这里每一格是 5。"
- 错误反馈："Not yet. How much is one gridline? Count the lines up to the top of the bar, then multiply." / "还没对。每一格表示多少？数到条顶有几格，再乘。"

### 5.2 术语（MOE 英文 · 中文 · 备注）

| EN | ZH | 备注 |
|---|---|---|
| picture graph | 象形图 | 大陆"象形统计图"；新加坡华文**待核**（Q5） |
| bar graph | 条形图 | 大陆"条形统计图" |
| line graph | 折线图 | 大陆"折线统计图" |
| pie chart | 饼图 | 大陆"扇形统计图"；新加坡华文**待核**（Q5） |
| table, row, column | 表格、行、列 | |
| tally marks | 划记 | 大陆课本"画正字"是另一种记法，本课用四竖一斜（新加坡英文课本写法） |
| key | 图例 | |
| axis, scale, gridline | 轴、刻度、格线 | "纵轴 / 横轴"只在正文第一次出现时说一次 |
| title | 标题 | |
| total | 总数 | |
| increase / decrease / no change | 增加 / 减少 / 没有变化 | |
| how many more / fewer | 多多少 / 少多少 | |
| fraction of a set | 一组的几分之几 | 接 P4 Fractions 2.1 |

### 5.3 数字与情境

- 整数；值 ≤ 100（P3）、≤ 200（P4 表格总数）；刻度 1、2、5、10、20；半格只在格值为偶数时出现（中点是整数）。
- 饼图总数是分母的倍数、≤ 96。
- 情境：班上最喜欢的水果（芒果、榴梿、红毛丹、香蕉）、上学方式（走路、巴士、地铁、家长送）、借书、食堂饮料摊（豆奶、薏米水、酸柑汁、菊花茶）、豆苗长高、储蓄罐；钱写 $（ZH "元"）。不出现品牌、真实学校名、真实统计数字。

---

## 6. 插图（交 Codex；风格与验收照 docs/69 §4.2，严格）

共同风格与交付同 docs/76 §6（graphite plate、R = G = B、透明、**无文字 / 数字 / 坐标轴 / 刻度 / 箭头 / 标签**、manifest + 420 px 预览 + cinema 反相模拟、最多重画 4 次）。数量是教学点：**每张都要逐个数**。`art/planned/graphs/` 有 2026-10-18 的四张候选，缩略图目检数量与描述一致，仍需按下表放大核：

| # | 文件 | 尺寸 | 用在 | 画什么 | 可数的事实（逐条验收） | 不许出现 | 方法 |
|---|---|---|---|---|---|---|---|
| I-1 | `graphs.png`（封面） | 1024² | 主题卡 | 一块窄木底座上三座一样大的木方块塔，从左到右 2、4、3 块，正面略带俯视 | ① 恰好三座塔；② 块数 2、4、3（共 9）；③ 每块一样大（±3 %），接缝清楚；④ 三座塔同一条底线；⑤ 塔之间有空隙 | 坐标轴、数字、刻度、散落的块、手、桌面 | 候选 `graphs.png` 过检则用；否则 AI 重画 |
| I-2 | `graphs-picture-tokens.png` | 1536×1152 | 第 01 章 | 一块素面磁性白板上三列一样的圆形芒果磁贴（芒果 + 一片叶的浮雕），共一条底线 | ① 列从左到右 2、4、3 枚，共 9；② 磁贴一样大、间距均匀；③ 每枚只有芒果和叶，无字；④ 无格子、边框、标题 | 字、数字、钱币纹样、边框、手 | 候选过检则用 |
| I-3 | `graphs-thread-trend.png` | 1536×1152 | 第 05 章 | 一块素面木板上五根一样粗的木钉，等距排开，高度依次：低、中、略低、高、最高；一根拉紧的深色线按顺序连起钉头 | ① 恰好 5 根钉、间距相等（±3 %）；② 钉头高度顺序：第 3 根低于第 2 根，第 5 根最高，第 1 根最低；③ 线只连相邻的钉头、按顺序、拉直；④ 无刻度 | 坐标轴、刻度、数字、箭头、第 6 根钉 | 候选过检则用 |
| I-4 | `graphs-cake-sectors.png` | 1536×1152 | 第 07 章 | 一块圆形白糕在熟食中心的圆盘上，俯视：一刀直径、右半边再一刀半径，成一个半圆 + 两个四分之一圆，块之间细缝 | ① 恰好 3 块；② 直径刀线过圆心（±1 % 直径）；③ 半径刀线与直径成 90°（±2°，脚本量）；④ 两个四分之一块一样大；⑤ 无配料、花纹 | 文字、数字、筷子、手、多余刀痕 | 候选先用脚本量 ②③④（几何是教学点，docs/69 §4.1-1）；不过则**代码画**（扇形几何 + 糕面质感） |

图注草稿：I-2 "Each magnet stands for one pupil's choice." / "每一枚磁贴代表一个学生的选择。"；I-3 "Joining the readings in order with a thread shows the rises and falls." / "用线按顺序连起各次读数，升和降一眼就看出来。"；I-4 "A half and two quarters make one whole cake." / "一半加两个四分之一，正好是一整块糕。"。四张都不靠明暗表意，可反相。

---

## 7. 施工顺序与分工（不需要新依赖；子代理不改 `package.json`、不提交）

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | §0.1 定稿；建 `src/content/topics/graphs/{chapters,data}`、`topic.yaml`（`illustration: graphs`） | `topic.yaml` | — | S |
| 1 | E（Opus） | E-GR1–E-GR5、`validate-data.ts`、单测、docs/06「图表（A7）」；**留好 docs/78 要加的 `stack`、`level`、`mean` 的位置**（同一个模型） | `stage/ChartModel.tsx`、`lib/{chart.ts,data-tasks.ts,diagnose/data.ts}`、`tests/math-scene/{chart,diagnose-data}.test.ts` | 0 | M |
| 2 | L（Opus） | `lesson.json`：7 步 × 4–5 拍、`keyFacts`、`limits`、样板题、练习 8 题；`pnpm shoot graphs --beats` | `data/lesson.json` | 1 | S–M |
| 3 | Codex | 题库其余约 50 道（每份 `pnpm tsx scripts/math/check-pool.ts <draft> --topic graphs --step <id>` 0 错）；7 章英文初稿 | `scripts/math/drafts/` | 2 | S–M |
| 4 | T（Opus） | 合并题库、定稿英文、写中文正文、名词表、来源 | `data/*`、`chapters/*` | 3 | S–M |
| 4′ | Codex + 主会话 | §6 四张图的复核 / 重画 | `public/illustrations/**` | 0 | S |
| 5 | P（Sonnet） | QA（`pnpm shoot graphs --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`）；e2e：点条出发丝线、填表纯键盘、手机上横条形图不横向滚动 | `tests-e2e/graphs.spec.ts` | 4 | S |
| 6 | 主会话 | 验收、截图、提交 | — | 5 | S |

---

## 8. 验收

照 `references/acceptance.md` 全部打勾，另加：

- [ ] 换刻度的拍里每格高度不变、图的总高度跟着变；读数发丝线不泄露答案（小测里只在孩子点过之后出现，不写数）
- [ ] 截断轴只出现在第 03 步第 5 拍与对应的 `choose`（validate）
- [ ] 饼图分数只有 §0.1 Q4 允许的几种；总数是分母的倍数
- [ ] 象形图图标是单色线描，灰度下能分辨；条的类别靠标签，不靠颜色
- [ ] §2.1 每个码有 ⚑ 拍、有能诊断它的题
- [ ] 手机 390 × 844：6 根条的条形图、7 个点的折线图不横向滚动，刻度数字 ≥ 12 px
- [ ] §6 四张图逐条打勾进 `art/planned/graphs/image-qa.json`
- [ ] 截图：第 03、05、07 章 + 练习与一道小测，三种尺寸

## 9. 来源（访问日期 2026-11-15）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (2021 P1 cohort; Updated Oct 2025)（URL 同 docs/76 S1） | 课纲原文第 32、34、36、37、40、44 页 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | Friel, S. N., Curcio, F. R., & Bright, G. W. (2001). Making sense of graphs: Critical factors influencing comprehension and instructional implications. *JRME*, 32(2), 124–158 | 刻度、图例、读图层次（页码**待核**） |
| S4 | Curcio, F. R. (1987). Comprehension of mathematical relationships expressed in graphs. *JRME*, 18(5), 382–393 | "读数据 / 读数据之间"（**待核**） |
| S5 | Common Core Standards Writing Team (2011). *Progressions … K–3, Categorical Data; Grades 2–5, Measurement Data*. Institute for Mathematics and Education, University of Arizona | 象形图、条形图的刻度与"多多少"（**待核**） |
| S6 | Hart, K. M. (Ed.) (1981). *Children's Understanding of Mathematics: 11–16*（CSMS）. London: John Murray | 读表、差（**待核**章节） |
| S7 | Pandey, A. V., Rall, K., Satterthwaite, M. L., Nov, O., & Bertini, E. (2015). How deceptive are deceptive visualizations? *Proceedings of CHI 2015*, 1469–1478 | 截断纵轴让人高估差别 |
| S8 | Leinhardt, G., Zaslavsky, O., & Stein, M. K. (1990). Functions, graphs, and graphing. *Review of Educational Research*, 60(1), 1–64 | "高度当斜率"（height-for-slope）混淆 |
| S9 | Bell, A., & Janvier, C. (1981). The interpretation of graphs representing situations. *For the Learning of Mathematics*, 2(1), 34–42 | 折线图的升降 |
| S10 | Spence, I., & Lewandowsky, S. (1991). Displaying proportions and percentages. *Applied Cognitive Psychology*, 5(1), 61–77 | 饼图读份（**待核**页） |
| S11 | 批准教材目录（只作顺序参考），https://www.moe.gov.sg/education-in-sg/approved-textbook-list | 划记写法、Q3、Q5（**待核**课本） |

## 10. 施工记录 / 已知差距

**2026-11-16 施工**（分支 `claude/graphs-average`；§0.1 全部按默认值）。

- **课纲核对**：S1（PDF 806 004 字节，sha256 `e8f77fe1…ae70e1`，2026-11-15 下载，不进仓库）第 32、34、36、37、40 页逐字核对，§1.1 引文无误；第 44 页"total value ÷ number of data"的除号看过原页图（docs/78）。
- **建成**：7 步 30 拍、题库 67 道（9 / 10 / 10 / 9 / 10 / 9 / 10）、练习 8 道（按问法 6 种）、名词表 13 条；`status: published`。题库由 Claude 起草（不经 Codex），每份 `check-pool` 0 错。
- **引擎**（E-GR1–5，docs/06「图表（A7）」）：`schema.ts chartModel`、`lib/{chart,data-kind,data-tasks,data-working}.ts`、`lib/diagnose/data.ts`、`stage/ChartModel.tsx`（懒加载）、`tray/DataControls.tsx`、`hud/{data-facts,data-plate}.ts`、`hud/cards/ChartCard.tsx`、`validate-charts.ts`；共用文件只做登记式的小改动。单测 `tests/math-scene/{chart,diagnose-data,graphs-lesson}.test.ts`，e2e `tests-e2e/graphs.spec.ts`。
- **与 spec 不同的地方**：
  - `fill-table` 的数字框在托盘里（每个"?"一个带行列名的框，Tab / Enter 到下一格），写的数同时显示在舞台表格的格子里；SVG 里放输入框在手机和读屏上都不可靠。
  - 读数发丝线只从条 / 点出发（点刻度横着画的那种只在讲解拍 `guide: [{ y }]`）。
  - 象形图一张图只用一种图标（多为"学生"小人），不按水果换图标；图例写"= 2 pupils"。
  - 截断轴的 choose 用 44 / 48 和"3 倍"（spec 写 24 / 28 和"两倍"留给讲解拍）。
  - 折线图的温度题轴从 0 开始（validate 只许截断轴出现在 pair 和那道 choose）。
  - S3–S10（读图研究文献）页码未核，按规则不进 sources.json；误解目录本身是本课的诊断设计。
  - 表格题里的"P3 / P4"是数据（两个班），不是课的年级标注。
- **插图**：Codex `codex/img5`（c024fb85）的封面与 3 张配图，图注、替代文字照 `art/img5/graphs-captions.json`；封面 mask 进 `src/lib/illustrations.json`。
