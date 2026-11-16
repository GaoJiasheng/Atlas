# 80 · 百分数 · 内容 spec（`percentage`，MathScene 课；v1 草案，待 Gavin 定稿）

docs/17 §2.5 的 `percentage` 一行（"10 × 10 格 = 百分之一；模型图上的折扣与 GST"，依赖 A6 与现有 `barmodel`）。2026-11-16 起草，**只出 spec，不施工、不建目录、不提交**。照 skill `.claude/skills/atlas-lesson-topic/`（SKILL.md + `references/` 全部）写；布局与密度照 docs/76–79，模型复用 docs/29（小数）的 A6a 百格与分数主题的 `barmodel`。

记号同 docs/76：EN 字幕与题目是**口吻草稿**，施工时 Codex 起草英文全文、Claude 逐句核对；ZH 是 Claude 草稿，施工时 Claude 独立定稿。S1 = MOE *Mathematics Syllabus Primary One to Six*（2021 P1 cohort，页脚 "Updated: Oct 2025"），起草时用 `pdftotext -layout` 从本机临时目录里的 PDF 逐页抄录（806 004 字节，sha256 `e8f77fe1…ae70e1`，与 docs/76–79 §10 同一份，不进仓库），页码是页脚 "Page | N"。

---

## 0. 决定

| # | 决定 | 建议 |
|---|---|---|
| D1 | **对象**：Number and Algebra · SUB-STRAND: PERCENTAGE · **P5「1. Percentage」1.1–1.4 全部**（第 01–07 步）；地基 P4 Decimals 1.3、1.4（小数 ↔ 分数，`decimals` 第 07 步已讲）、P5 Fractions 1.2（分数化小数）；P6 的两条（已知部分和百分比求整体、增减百分比）**不在本课**（§0.1 Q1） | 同意 |
| D2 | **课的形状**同分数改版后（docs/15 §10）：每章 4–5 拍 + 章末一道随机小测（题库 9–10 道，"再来一道""跳过"都在）；练习章 8 道固定题；背景章 00 | 同意 |
| D3 | **UI 不出现年级**；本课全是 P5，不标 bridge | 同意 |
| D4 | **模型全部复用，只做加法**：A6a `decimal-grid`（百格 = 100 个百分之一，加 `percent` 读法与 `groups` 分块线，E-PC2）；分数主题的 `barmodel`（加上方百分比刻度、下方数量刻度，E-PC3）；新加一个只画文字与金额的小模型 `price-card`（价签 / 账单 / 存折三种样式，E-PC4）。不做新的小测类型：`shade-decimal`、`input`、`choose` 够用 | 同意 |
| D5 | **新误解域 `percentage`**，9 个码 + 共用 `not-simplest`（分数域）、`places-short`（小数域）（§2.1） | 同意 |
| D6 | **数字**：百分比多是 5 的倍数，GST 固定 9 %、利率 1 %–5 %；"占百分之几"的答案都是整数百分比；钱的答案最多两位小数；整体 ≤ 1000（钱 ≤ $3000）。按"不用计算器也能算"挑数（§0.1 Q4） | 同意 |
| D7 | **教法顺序**：先百格（"每一百份里的几份"）→ 百分数 ↔ 分数 ↔ 小数 → 整体不是 100 时化成百分之几 → 求一个量的百分之几（先"10 % 一份"的单位法，再"{p/100} × 整体"）→ 三种生活应用（折扣、GST、年利息）都用同一张"100 % 条"的模型图 | 同意 |
| D8 | **GST 说真话**（§0.1 Q3）：新加坡的商店价签已经含 GST（IRAS 规定，S4），所以第 06 步不画"$80 + GST"的价签，而用**账单 / 收据**（列出 GST 前的价钱、GST、总数）讲怎么算；第 1 拍说清这一点 | 同意 |
| D9 | **情境**：学校书局、组屋区的小店、学校义卖会、学生储蓄、班上的统计（走路上学的人数、戴眼镜的人数）；物品用通称（书包、风扇、水壶），**无品牌、无真实商店名**；人名多族群 | 同意 |
| D10 | **步数**：7 个课步 + 练习 + 00。拍 32 个 ≈ 11 min，小测 7 道 ≈ 5 min，练习 8 道 ≈ 5.5 min：**约 21 分钟** | 同意 |
| D11 | **图**：封面 + 2 张配图（§6）；`art/planned/percentage/` 有三张候选，封面可用，另两张**不过检**（折扣图四块不一样宽；"附加费"图 5 + 1 枚圆片暗示 20 %，与 9 % 的 GST 不符），重画 | 同意 |

### 0.1 需要 Gavin 看的（每条有默认值，默认已写进全文）

| # | 问题 | 选项 | 默认 |
|---|---|---|---|
| Q1 | **P6 的两条**（S1 第 43 页 1.1 已知部分和百分比求整体、1.2 增减百分比）现在做不做 | (a) 不做，2030 年给本课加两步（docs/17 §2.6 "加两步"）；(b) 现在加两个"再往前一步"的桥步（第 08、09 步，+9 拍） | **(a)**：女儿 2029 年上 P5，P6 那两步到时再写，倒推的模型图和本课第 05 步同一张图，加起来便宜 |
| Q2 | **"求折扣是百分之几"**（$50 卖 $40，折扣是百分之几）算 P5 还是 P6 | (a) 算 P5（它是 1.1 "部分占整体的百分之几"用在 1.4 上），第 05 步第 4、5 拍 + 题库 3 道；(b) 归 P6 "增减百分比"，不讲 | **(a)**（**待核**：手边有 P5 课本或学校卷时看一眼；若课本放在 P6，把这 3 道题和两拍挪到 Q1 的桥步） |
| Q3 | **GST 的情境** | (a) 只用账单 / 收据（GST 前的价钱、GST、总数分开列），第 1 拍说"店里的价签已经含 GST"；(b) 照课本习惯写"$80 before GST"的价签 | **(a)**：IRAS 规定价签、报价必须含 GST（S4），(b) 在新加坡不真实；账单上分列 GST 是真的 |
| Q4 | **计算器**：课纲 P5 有几条注明 "without calculator"，百分数各条没有注 | (a) 不提计算器，挑好算的数（D6）；(b) 练习里放一两道"可以用计算器"的大数题 | **(a)**：本课讲道理，不练计算；学校考卷的 Paper 2 可用计算器（**待核**），不影响本课 |
| Q5 | **GST 税率写死 9 % 还是每题给** | (a) 每道题都写 "GST of 9%"，正文第 06 步说"从 2024 年起是 9 %"（S3），`<More>` 说以前是 7 %、8 %；(b) 只写 9 %，不提年份 | **(a)**：税率会变，题目自带税率才不会过时 |
| Q6 | **中文"20 % off"与"八折"** | (a) 正文与题目说"减价 20 %""折扣是 20 %"，第 05 步第 3 拍顺带说"中文常说'打八折'，就是付原价的 80 %"；(b) 不提"打折"说法 | **(a)**：华人家庭在店里天天听到"八折"，而"八"与"20 %"正好方向相反，是一个真实的混淆点（新加坡华文课本的说法**待核**） |
| Q7 | **中文用"百分数"还是"百分比"** | (a) 正文"百分数"（35 % 这种数）+"百分之几"（口语）；名词表注"也叫百分比"；(b) 全用"百分比" | **(a)**（大陆人教版叫"百分数"；新加坡华文常说"百分比"，**待核**） |
| Q8 | **写作规则"题目不出现价格"**（skill `writing-rules.md`）与本课冲突 | (a) 本课例外：可以出现金额（都是编的整数价钱，无品牌）；(b) 只用"$80 的东西"不说物品 | **(a)**：这条规则原意是不放真实商品价格和品牌；本课 spec 里写明例外，`acceptance` 抽查"无品牌、无真实商店" |

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字）

| 级 | 子线 · 条目 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|---|
| P4（地基） | Decimals · 1. Decimals up to 3 decimal places | "1.3 expressing decimals as fractions" · "1.4 expressing fractions as decimals when the denominator is a factor of 10 or 100" | 38 | 第 02 步引用（`decimals` 第 07 步已讲） |
| P5（地基） | Fractions · 1. Fraction and Division | "1.2 expressing fractions as decimals" | 41 | 第 02、03 步 |
| P5（地基） | Fractions · 2. Four Operations | "2.2 multiplying a proper/improper fraction and a whole number without calculator" | 41 | 第 04 步第 4 拍（"{15/100} × 60"） |
| **P5** | Percentage · 1. Percentage | "1.1 expressing a part of a whole as a percentage" · "1.2 use of %" · "1.3 finding a percentage part of a whole" · "1.4 finding discount, GST and annual interest" | 41 | 第 01–07 步 |
| P6（不在本课） | Percentage · 1. Percentage | "1.1 finding the whole given a part and the percentage" · "1.2 finding percentage increase/decrease" | 43 | Q1 |

核对要点：
- 1.4 的三样只写 "finding discount, GST and annual interest"：本课求折扣、折后价、GST、含税总数、一年的利息、一年后的本利和；**不求"含税价倒推税前价"**（那是 P6 1.1 已知部分求整体），**不讲多年利息、复利**。
- "annual interest" 是一年的利息。课纲没有"本金 principal""利率 rate"这两个词，本课正文说 "the money in the account""2% per year"，名词表收 interest rate。
- 百分数整章没有注 "without calculator"（P5 Whole Numbers 2.1–2.3、Fractions 2.2–2.3 有注），Q4。

### 1.2 级别、步数与时间

- 7 个课步 + 练习 + 00；全部 P5。
- 拍 32 个（≈ 11 min），小测 7 道（≈ 5 min），练习 8 道（≈ 5.5 min）：**约 21 分钟**。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字（`limits`） |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | decimal-grid（标本） | — | — | — |
| 01 | `out-of-a-hundred` | Per cent: out of a hundred | 百分之几：一百份里的几份 | 1.1, 1.2 | decimal-grid(100) | 4 | 9 · shade-decimal / input / choose | 0 %–100 %，整数 |
| 02 | `percent-fraction-decimal` | Percentages, fractions and decimals | 百分数、分数和小数 | 1.2 · P4 Dec 1.3, 1.4 · P5 Frac 1.2 | decimal-grid（`groups`、`quarters`） | 5 | 10 · input / choose | 分母是 100 的因数（2、4、5、10、20、25、50） |
| 03 | `part-of-a-whole` | A part of a whole as a percentage | 部分占整体的百分之几 | 1.1 | bar(20) → decimal-grid（`groups`）· barmodel | 5 | 10 · input / choose | 整体 ≤ 200；答案是整数百分比 |
| 04 | `percentage-of-a-quantity` | Finding a percentage of a quantity | 求一个量的百分之几 | 1.3 · P5 Frac 2.2 | barmodel（`units: 10`、百分比刻度） | 5 | 10 · input / choose | 整体 ≤ 1000；答案整数或两位小数的钱 |
| 05 | `discount` | Discount | 折扣 | 1.4, 1.1 | price-card(tag) · barmodel | 5 | 10 · input / choose | 原价 ≤ $500，折扣 5 %–50 % |
| 06 | `gst` | GST | 消费税（GST） | 1.4 | price-card(bill) · decimal-grid(两个整体) · barmodel | 4 | 9 · input / choose | GST 9 %；GST 前价钱 ≤ $500 |
| 07 | `annual-interest` | Annual interest | 一年的利息 | 1.4 | price-card(passbook) · barmodel | 4 | 9 · input / choose | 存款 ≤ $3000；年利率 1 %–5 % |
| 08 | `practice` | Practice | 练习 | — | 按题 | — | 8 道固定题 | — |

### 1.4 不在本课

- P6：已知部分和百分比求整体（含"含 GST 的价钱倒推税前价"）、增减百分比（Q1）。
- 大于 100 % 的百分数作为"占整体的百分之几"（只有 GST 一拍出现 109 %，作为"原价再多 9 %"的图，不当考点）；小数百分数（12.5 %）只在第 02 步 `<More>` 提一句。
- 服务费（restaurant service charge）、多年利息、复利、汇率、分期付款。
- 比（ratio，P6 另一课）。

### 1.5 和别的主题怎么接（不重复讲）

| 主题 | 接在哪 | 本课怎么用 | 不在本课重复的 |
|---|---|---|---|
| `decimals`（docs/29） | A6a 百格；第 03 步"百分位"；第 07 步小数 ↔ 分数 | 百格原样用，只加"%"读法与分块线；第 02 步第 1 拍说"学小数时见过 35 个百分之一" | 小数的位值、小数化分数的道理 |
| `fractions` | 等值分数（"×5 化成分母是 100"）；`barmodel`；`not-simplest` | 第 03 步把 {7/20} 化成 {35/100} 用分数主题的"同一个量，不同的分数名字"；百分比化最简分数的题照分数域的 `simplest` 写法诊断 | 等值分数、约分 |
| `graphs`（docs/77） | 饼图（分数的饼图） | 第 01 步 `<More>` 一句：饼图也常写百分数（25 %、50 %）；本课不画饼图 | 读饼图 |
| `average`（docs/78） | 无 | — | — |
| 将来的 `fractions-2`（P5 分数 × 整数） | "{15/100} × 60" | 第 04 步先讲单位法（10 % 一份），分数法只用一拍、数字小；`fractions-2` 做好后在正文加一个 `<Term>` 链接 | 分数乘整数的道理 |
| 将来的 `ratio`、`rate` | 同一张模型图 | — | — |

---

## 2. 课的设计

### 2.0 写法约定（照 skill `writing-rules.md`）

- **固定说法**：
  - EN "Per cent means out of a hundred." / ZH "百分之几，就是一百份里的几份。"
  - EN "The whole is 100%." / ZH "整体是 100 %。"
  - EN "Find 10% first: the whole divided into 10 equal parts." / ZH "先找 10 %：把整体平均分成 10 份，一份就是 10 %。"
  - EN "A percentage is always a percentage *of* something. Ask: of what?" / ZH "百分之几总是'谁的'百分之几。先问：是谁的？"
  - EN "Discount is taken off. GST is added on. Interest is added on." / ZH "折扣要减去。GST 要加上。利息要加上。"
- **读法**：字幕与算式里的百分数写 `{pc:35}`（E-PC1，显示 35 %，朗读 "thirty-five per cent" / "百分之三十五"）；钱写 `$12.40`（沿用小数主题的读法）；分数仍写 `{35/100}`。
- **颜色**：整体（100 %）= cold；要找的部分 / 孩子涂的 = signal；第二个量（GST、利息这种"加上去的"）= hot；折扣（拿走的）= 墨色斜线；"看答案" = 墨色虚线。不用红绿。
- **算式**短：`35% = {35/100} = 0.35`、`10% of $80 = $8`、`$60 − $12 = $48`；英文算式里写 `of`，中文界面算式照写（`of` 换成"的"：`$80 的 10 % = $8`，E-PC1 的算式本地化）。

### 2.1 误解目录（新域 `percentage`，§3.5 写诊断规则）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `percent-as-amount` | 把百分数当成个数或钱数 | 40 的 25 % 写 25；$80 加 9 % 的 GST 写 $89 | "25% is not 25 things. It means 25 out of every 100. Find 10% of 40 first." / "25 % 不是 25 个，是每一百份里的 25 份。先找 40 的 10 %。" | S5（**待核**页） |
| `percent-decimal-shift` | 百分数 ↔ 小数时小数点挪错位 | 5 % = 0.5；0.4 = 4 %；0.07 = 70 % | "5% is 5 hundredths: 0.05. 0.5 is 5 tenths, which is 50%." / "5 % 是 5 个百分之一，写 0.05。0.5 是 5 个十分之一，是 50 %。" | 本课提出的诊断（同小数域 `place-denominator`） |
| `fraction-digits` | 把分数的分子分母拼成百分数 | {3/5} = 35 %；{1/4} = 14 % | "{3/5} means 3 out of 5, not 35. Make the 5 into 100: {3/5} = {60/100} = 60%." / "{3/5} 是 5 份里的 3 份，不是 35。把 5 份化成 100 份：{3/5} = {60/100} = 60 %。" | S6（**待核**） |
| `part-to-part` | 用一个部分比另一个部分，而不是比整体 | 12 个男生 8 个女生，女生占 {8/12} | "Girls out of all the pupils: 8 out of 20, not 8 out of 12. The whole is everyone." / "女生占全体的几分之几：20 人里的 8 人，不是 12 人里的 8 人。整体是所有人。" | S5 |
| `wrong-base` | 拿错了"谁的百分之几"：折扣按折后价算、GST 按总数算 | 原价 $50 折后 $40，说折扣是 {10/40} = 25 % | "The discount is a part of the usual price, so compare with $50: {10/50} = 20%." / "折扣是原价的一部分，所以和原价 $50 比：{10/50} = 20 %。" | S5 |
| `one-step-short` | 只算了一半：问折后价答折扣，问总数答 GST，问一年后有多少答利息（或反过来） | 原价 $60 减 20 %，问要付多少，答 $12 | "$12 is the discount, the part taken off. The question asks what is paid: $60 − $12." / "$12 是折扣，是减去的那一部分。题目问的是要付多少：$60 − $12。" | 本课提出的诊断 |
| `direction-swapped` | 加减方向反了：折扣加上去、GST 减掉 | 折后价写 $60 + $12 = $72 | "A discount makes the price lower. Take $12 off, do not add it." / "打折价钱变低。要减去 $12，不是加上。" | 本课提出的诊断 |
| `divided-by-rate` | 用整体除以百分数里的数 | 40 的 25 % 写 40 ÷ 25 = 1.6 | "Dividing by 25 makes 25 equal parts. 25% is 25 parts out of 100: find 1% or 10% first." / "除以 25 是平均分成 25 份。25 % 是 100 份里的 25 份：先找 1 % 或 10 %。" | 本课提出的诊断 |
| `rest-not-subtracted` | 问"其余占百分之几"，答的是给出的那一部分 | 35 % 的人走路上学，问其余的人占百分之几，答 35 % | "35% walk. Everyone is 100%, so the rest is 100% − 35% = 65%." / "35 % 走路。全体是 100 %，其余的是 100 % − 35 % = 65 %。" | 本课提出的诊断 |

**共用码**（照 docs/29 D10 的做法，规则写在本域）：`not-simplest`（分数域：百分数化最简分数时差一步，45 % 写 {45/100}）；`places-short`（小数域：钱写成 $5.4）。

"来源"一列的研究文献页码都未核（docs/76 §10 的规则）：不进 `sources.json`；误解目录是本课自己的诊断设计，正文不说"研究表明"。每个码至少一拍 ⚑、至少一道题能诊断。

### 2.2 逐步设计

简写：`DG{…}` = `decimal-grid`（`level: 100` 缺省）；`pct` = 格下印百分数（E-PC2）；`groups:n` = 把 100 格分成 n 块的粗线（E-PC2）；`BM{…}` = `barmodel`，`scale%` = 上方百分比刻度、下方数量刻度（E-PC3）；`PC{tag|bill|passbook}` = `price-card`（E-PC4）。

---

#### 第 01 步 `out-of-a-hundred` · 百分之几：一百份里的几份（P5 1.1, 1.2）

**概念**：百分之几就是一百份里的几份；35 份写作 35 %；整体是 100 %，其余的是 100 % 减去这一部分。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `DG{given:0.35, labels:hundredths}` | — | `35 out of 100` | This square is cut into 100 equal small squares, and 35 are shaded: 35 out of 100. You met this in decimals as 35 hundredths. | 这个正方形平均分成 100 个小格，涂了 35 格：100 格里的 35 格。学小数时，它叫 35 个百分之一。 |
| 2 | 同图，格下改印 `pct` | `shade` | `35 out of 100 = {pc:35}` | Per cent means out of a hundred. 35 out of 100 is written 35%, and read thirty-five per cent. | 百分之几，就是一百份里的几份。100 份里的 35 份写作 35 %，读作百分之三十五。 |
| 3 | `runs:[0.35 cold, 0.65 signal]`（没涂的 65 格换成 signal） | `shade` | `{pc:35} + {pc:65} = {pc:100}` | All 100 squares together are 100%, the whole. The 65 squares not shaded are the rest: 100% − 35% = 65%. | 100 格合起来是 100 %，就是整体。没涂的 65 格是其余的部分：100 % − 35 % = 65 %。（`rest-not-subtracted`） |
| 4 ⚑ | `pair:[大百格 0.35, 小百格（半边长）0.35]` | `morph` | `{pc:35} · {pc:35}` | These two squares are different sizes, and each has 35% shaded. The shaded parts are not the same size, but they are the same share: 35 out of every 100. 35% is not 35 things. | 两个正方形大小不同，都涂了 35 %。涂的部分不一样大，但占的份数一样：每 100 份里的 35 份。35 % 不是 35 个东西。（`percent-as-amount`） |

**要点**：① Per cent means out of a hundred: 35% is 35 out of 100. / 百分之几就是一百份里的几份：35 % 是 100 份里的 35 份。② The whole is 100%. / 整体是 100 %。③ The rest is 100% minus the part. / 其余的部分 = 100 % − 这一部分。

**题库（9）**：3 道 `shade-decimal`（`percent: true`：涂 40 %、7 %、85 %；7 % 的错例涂 70 格 → `percent-decimal-shift`）；3 道 `input`（百格涂了 23 格 → 23 %；涂了 60 格，没涂的占百分之几 → 40，错例 60 → `rest-not-subtracted`；整个涂满 → 100）；3 道 `choose`（哪一幅涂了 50 %：选项含"50 格散开"✓、"5 条里涂 5 格"→ `percent-decimal-shift`；两个大小不同的百格谁涂的百分比大 → 一样大，错项"大的那个" → `percent-as-amount`；哪一句对：100 % 是整体 ✓）。

---

#### 第 02 步 `percent-fraction-decimal` · 百分数、分数和小数（P5 1.2 · P4 Decimals 1.3, 1.4 · P5 Fractions 1.2）

**概念**：同一部分有三种写法：35 % = {35/100} = 0.35；常用的几对要记住：50 % = {1/2}、25 % = {1/4}、10 % = {1/10}。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `DG{given:0.35, pct}` | — | `{pc:35} = {35/100} = 0.35` | The same 35 squares have three names: 35%, 35 hundredths as a fraction, and 0.35 as a decimal. | 同样这 35 格有三个名字：35 %，分数 {35/100}，小数 0.35。 |
| 2 | `DG{quarters:true, runs:[0.25 cold]}` → 再涂到 0.5、0.75 | `shade` | `{1/4} = {pc:25} · {1/2} = {pc:50} · {3/4} = {pc:75}` | Draw lines to cut the square into 4 equal blocks. Each block is 25 squares, so a quarter is 25%. Two quarters are 50%, three are 75%. | 画线把正方形平均分成 4 块，每块 25 格，所以四分之一是 25 %。两块是 50 %，三块是 75 %。 |
| 3 | `DG{groups:10, runs:[0.3 cold]}`（10 条竖条） | `split` | `{3/10} = {30/100} = {pc:30} = 0.3` | Each strip is 10 squares: one tenth is 10%. Three strips are 30%, or 0.3. | 每一条是 10 格：十分之一是 10 %。三条是 30 %，也就是 0.3。 |
| 4 ⚑ | `pair:[DG 5 格（0.05，cold ✓），DG 5 条（0.5，hot）]` | `morph` | `{pc:5} = 0.05` | 5% is 5 squares out of 100: 0.05. Five whole strips would be 0.5, which is 50%. Count hundredths, not tenths. | 5 % 是 100 格里的 5 格：0.05。5 整条是 0.5，那是 50 %。数的是百分之一，不是十分之一。（`percent-decimal-shift`） |
| 5 ⚑ | `DG{groups:5, runs:[0.6 signal]}`，hot 虚线标注"35 %?"被划掉 | `split` | `{3/5} = {60/100} = {pc:60}` | {3/5} is not 35%. Cut the square into 5 equal blocks of 20 squares; 3 blocks are 60 squares, so {3/5} = 60%. | {3/5} 不是 35 %。把正方形平均分成 5 块，每块 20 格；3 块是 60 格，所以 {3/5} = 60 %。（`fraction-digits`） |

**要点**：① 35% = {35/100} = 0.35. ② {1/2} = 50%, {1/4} = 25%, {1/10} = 10%. ③ To change a fraction to a percentage, make it out of 100. / 分数化成百分数：先化成分母是 100 的分数。

`<More>`：百分数不一定是整数，比如 {1/8} = 12.5 %；本课的题都用整数百分数。

**题库（10）**：4 道 `input`（分数 → 百分数：{3/4}、{2/5}、{7/10}、{1/20}；错例 34、25（2/5 → 25）→ `fraction-digits`）；2 道 `input`（`decimal`：8 % = ? → 0.08，错例 0.8 → `percent-decimal-shift`；45 % = ?）；2 道 `input`（小数 → 百分数，单位 `percent`：0.6 → 60，错例 6；0.09 → 9，错例 90 → `percent-decimal-shift`）；1 道 `input`（`simplest`：45 % = {9/20}，错例 {45/100} → `not-simplest`）；1 道 `choose`（哪个和 {1/4} 一样大：25 % ✓、14 % → `fraction-digits`、0.4、{4/100} → `fraction-digits`）。

---

#### 第 03 步 `part-of-a-whole` · 部分占整体的百分之几（P5 1.1）

**概念**：整体不是 100 份时，先把它化成 100 份（等值分数），或者用"部分 ÷ 整体 × 100 %"；整体永远是"所有的"。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `bar{parts:20, given:[0..6], label:"20 pupils"}` | — | `7 out of 20` | In a group of 20 pupils, 7 walk to school. What percentage of the group walk? | 一组 20 个学生里，有 7 个走路上学。走路上学的占这组的百分之几？ |
| 2 | 变成 `DG{groups:20, runs:[0.35 cold]}`：每个学生是 5 格 | `morph` | `{7/20} = {35/100} = {pc:35}` | Spread the 20 pupils over 100 squares: each pupil gets 5 squares. 7 pupils get 35 squares, so 35% of the group walk. | 把 20 个学生摊到 100 格上，每人 5 格。7 个人就是 35 格，所以这组有 35 % 的人走路上学。 |
| 3 | `BM{part-whole: 整条 $48（cold），其中 $12（signal）; brace}` | `morph` | `{12/48} × 100% = {pc:25}` | Mei Ling saved $12 out of her $48 pocket money. As a fraction of the whole, that is {12/48} = {1/4}. Times 100% gives 25%. | 美玲在 $48 零用钱里存了 $12。占整体的 {12/48} = {1/4}，乘 100 % 就是 25 %。 |
| 4 ⚑ | `BM{part-whole: 男生 12（cold）+ 女生 8（signal）; brace 在整条上 "20"}`，hot 虚线 "{8/12}" 被划掉 | `place` | `{8/20} × 100% = {pc:40}` | A class has 12 boys and 8 girls. The percentage of girls compares 8 with everyone, 20, not with the 12 boys: {8/20} = 40%. | 一个班有 12 个男生、8 个女生。女生占百分之几，要拿 8 和全班 20 人比，不是和 12 个男生比：{8/20} = 40 %。（`part-to-part`） |
| 5 | 同图，男生段转 signal | `shade` | `{pc:100} − {pc:40} = {pc:60}` | The boys are the rest of the class: 100% − 40% = 60%. Check: {12/20} is also 60%. | 男生是全班的其余部分：100 % − 40 % = 60 %。验算：{12/20} 也是 60 %。（`rest-not-subtracted`） |

**要点**：① To find what percentage a part is, compare it with the whole: part ÷ whole × 100%. / 求部分占整体的百分之几：部分 ÷ 整体 × 100 %。② The whole is everything, not the other part. / 整体是全部，不是另一个部分。

**题库（10）**：5 道 `input`（单位 `percent`：20 人里 9 个戴眼镜 → 45；$40 里花了 $30 → 75；50 道题对了 43 道 → 86；25 个水果里 4 个榴莲 → 16，错例 4 → `percent-as-amount`；16 个男生 4 个女生，女生占 → 20，错例 25（{4/16}）→ `part-to-part`）；2 道 `input`（其余占：35 % 走路上学，其余 → 65，错例 35 → `rest-not-subtracted`）；3 道 `choose`（18 个男生 12 个女生，女生占百分之几：40 % ✓、67 % → `part-to-part`、12 % → `percent-as-amount`；哪幅模型图表示"$12 占 $48 的百分之几"；{7/20} 化成百分数的哪一步对）。数字约束：所有 `part-to-part` 错例要么是整数（写进 `sample`），要么只出 `choose`。

---

#### 第 04 步 `percentage-of-a-quantity` · 求一个量的百分之几（P5 1.3 · P5 Fractions 2.2）

**概念**：先找 10 %（整体平均分成 10 份），几个 10 % 就乘几；25 %、50 % 用四分之一、二分之一；一般地，p % 的量 = {p/100} × 整体。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `BM{part-whole: 整条 $80（cold）, units:10, scale%（0 %…100 %，每 10 %）}`，第一格 signal | — | `10% of $80 = $8` | The whole bar is $80, which is 100%. Cut it into 10 equal parts: each part is 10%, and $80 ÷ 10 = $8. | 整条是 $80，也就是 100 %。平均分成 10 份，每份是 10 %：$80 ÷ 10 = $8。 |
| 2 | 同图，前三格 signal，下方刻度写 $24 | `shade` | `30% of $80 = 3 × $8 = $24` | 30% is 3 of those parts: 3 × $8 = $24. | 30 % 是其中 3 份：3 × $8 = $24。 |
| 3 | `BM{units:4, scale%（每 25 %）}`，一格 signal | `convert` | `25% of $80 = {1/4} × $80 = $20` | 25% is a quarter, so cut the bar into 4 instead: $80 ÷ 4 = $20. | 25 % 是四分之一，所以改成平均分成 4 份：$80 ÷ 4 = $20。 |
| 4 | `BM{整条 60 pupils, scale% 标 15 %}`，15 % 段 signal | `morph` | `15% of 60 = {15/100} × 60 = 9` | Any percentage works the same way: 15% of 60 pupils is {15/100} of 60, which is 9 pupils. | 什么百分数都一样：60 个学生的 15 % 就是 60 的 {15/100}，是 9 个学生。 |
| 5 ⚑ | `BM{整条 40, units:4, 一格 signal "10"}`，hot 虚线两个错答 "25" "1.6" 被划掉 | `shade` | `25% of 40 = 10` | 25% of 40 is not 25, and not 40 ÷ 25. It is a quarter of 40: 10. Always ask: 25% of what? | 40 的 25 % 不是 25，也不是 40 ÷ 25，而是 40 的四分之一：10。先问：是谁的 25 %？（`percent-as-amount`、`divided-by-rate`） |

**要点**：① Find 10% first, then take as many 10%s as you need. / 先找 10 %，需要几个 10 % 就取几个。② p% of a quantity = {p/100} × the quantity. / 一个量的 p % = {p/100} × 这个量。

**题库（10）**：7 道 `input`（30 % of 90 → 27；25 % of 120 → 30，错例 25 → `percent-as-amount`、4.8 → `divided-by-rate`；5 % of $60 → 3；45 % of 200 → 90；12 % of 50 → 6；75 % of 64 → 48；60 % of $35 → 21）；3 道 `choose`（哪幅模型图表示"$80 的 30 %"；"10 % of 250"是 2.5、25 ✓、250 ÷ 10 写成 2500；把 40 % of 70 算成 "70 ÷ 40" 的选项 → `divided-by-rate`）。数字：`percent-as-amount` 与 `divided-by-rate` 的错例值不能和正确答案或另一个错例相同（validate 查）。

---

#### 第 05 步 `discount` · 折扣（P5 1.4, 1.1）

**概念**：折扣是从原价里减掉的那一部分；折后价 = 原价 − 折扣，也 = 原价的（100 % − 折扣 %）；折扣是原价的百分之几，要和原价比。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `PC{tag: "School bag" · usual price $60 · 20% off}` | — | `20% of $60 = $12` | A school bag usually costs $60. In a sale it is 20% off. The discount is 20% of $60, which is $12. | 一个书包原价 $60，减价 20 %。折扣是 $60 的 20 %，就是 $12。 |
| 2 | `BM{整条 $60, units:5, scale%}`，前四格 cold，最后一格墨色斜线 "$12" | `cross` | `$60 − $12 = $48` | The discount is taken off the usual price. What is left is the sale price: $60 − $12 = $48. | 折扣要从原价里减掉。剩下的是折后价：$60 − $12 = $48。 |
| 3 | 同图，剩下四格 brace "80 %" | `shade` | `{pc:80} of $60 = $48` | Another way: 20% off means you pay 100% − 20% = 80% of the usual price, and 80% of $60 is $48. In Chinese shops this is called 打八折. | 另一种算法：减价 20 %，就是付原价的 100 % − 20 % = 80 %，$60 的 80 % 是 $48。中文说"打八折"：八折就是付 80 %，不是减 80 %。 |
| 4 | `PC{tag: "Fan" · usual $50 · now $40}`；`BM{整条 $50, 一段 $10 斜线}` | `morph` | `{10/50} × 100% = {pc:20}` | A fan is $50 and now sells for $40. The discount is $10. As a percentage of the usual price: {10/50} = 20%. | 一台风扇原价 $50，现在卖 $40。折扣是 $10，占原价的 {10/50} = 20 %。 |
| 5 ⚑ | 同图，hot 虚线 "{10/40} = 25 %" 被划掉 | `place` | `{10/50}, not {10/40}` | Compare the discount with the usual price, $50, not with the sale price. The discount was taken from $50. | 折扣要和原价 $50 比，不是和折后价 $40 比：折扣是从 $50 里减掉的。（`wrong-base`） |

**要点**：① Sale price = usual price − discount. / 折后价 = 原价 − 折扣。② 20% off means paying 80%. / 减价 20 % 就是付 80 %（八折）。③ The percentage discount compares the discount with the usual price. / 折扣是原价的百分之几，要和原价比。

**题库（10）**：4 道 `input`（求折后价：$75 减 20 % → 60，错例 15 → `one-step-short`、90 → `direction-swapped`；$120 减 25 % → 90；$48 减 50 %；$250 减 10 %）；2 道 `input`（求折扣：$80 减 15 % → 12，错例 68 → `one-step-short`）；2 道 `input`（单位 `percent`，求折扣是百分之几：$50 → $40 → 20，错例 25 → `wrong-base`；$150 → $120 → 20，错例 25 → `wrong-base`）；2 道 `choose`（"八折"是付多少：80 % ✓、20 % → `direction-swapped`；哪幅模型图是"$60 减 20 %"）。

---

#### 第 06 步 `gst` · 消费税（GST）（P5 1.4）

**概念**：GST 是买东西时要另交的税，从 2024 年起是 9 %：每 $100 多付 $9；GST = 9 % × 税前价，总数 = 税前价 + GST（= 109 %）。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `DG{wholes:2, runs:[1 cold, 0.09 hot]}`（一个满格 + 第二个百格里 9 格） | — | `9% of $100 = $9` | GST is a tax paid on most things bought in Singapore. Since 2024 it has been 9%: for every $100, $9 more. Price tags in shops already include it; a bill shows it separately. | GST 是在新加坡买大多数东西时要交的税。从 2024 年起是 9 %：每 $100 要多付 $9。店里的价签已经含 GST，账单上会把它分开列出来。 |
| 2 | `PC{bill: "Price before GST $60.00" · "GST 9% ?" · "Total ?"}` + `BM{整条 $60（cold）, 右边接一小段 9 %（hot）}` | `morph` | `9% of $60 = $5.40` | This bill shows $60 before GST. The GST is 9% of $60: 10% is $6, 1% is $0.60, so 9% is $6 − $0.60 = $5.40. | 账单上税前是 $60。GST 是 $60 的 9 %：10 % 是 $6，1 % 是 $0.60，所以 9 % 是 $6 − $0.60 = $5.40。 |
| 3 | bill 填上 "$5.40"、"Total $65.40"；BM 整条 + 小段 brace "109 %" | `place` | `$60 + $5.40 = $65.40` | GST is added on. The total to pay is $60 + $5.40 = $65.40, which is 109% of the price before GST. | GST 要加上去。要付的总数是 $60 + $5.40 = $65.40，是税前价的 109 %。 |
| 4 ⚑ | 同图，hot 虚线两个错答 "$54.60"、"$5.40 to pay" 被划掉 | `cross` | `$65.40` | GST is never taken off, and $5.40 is only the tax. The question "how much is paid" wants the total, $65.40. | GST 不是减掉的；$5.40 只是税。问"要付多少"，答的是总数 $65.40。（`direction-swapped`、`one-step-short`） |

**要点**：① GST is 9% of the price before GST. / GST 是税前价的 9 %。② Total = price before GST + GST. / 总数 = 税前价 + GST。③ Shop price tags already include GST. / 店里的价签已经含 GST。

`<More>`（Q5）：GST 的税率会变：2007 年 7 月至 2022 年底是 7 %，2023 年是 8 %，2024 年起是 9 %（S3；7 % 的起始日施工时在 S3 的表里核）。所以题目都会写明税率。

**题库（9）**：4 道 `input`（`decimal`，单位 `dollar`：$40 税前 → GST 3.60，错例 "3.6" → `places-short`、9 → `percent-as-amount`；$200 → GST 18；$150 → 13.50；$80 → 7.20）；3 道 `input`（求总数：$40 → 43.60，错例 3.60 → `one-step-short`、36.40 → `direction-swapped`、49 → `percent-as-amount`；$300 → 327；$20 → 21.80）；2 道 `choose`（哪张账单算对了；"含 9 % GST 的总数是税前价的百分之几"：109 % ✓、9 % → `one-step-short`、91 % → `direction-swapped`）。

---

#### 第 07 步 `annual-interest` · 一年的利息（P5 1.4）

**概念**：把钱存在银行，一年后银行多给的钱叫利息；年利息 = 年利率 × 存的钱；一年后共有 = 存的钱 + 利息。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `PC{passbook: "Saved $500" · "Interest 2% per year" · "After 1 year ?"}` | — | `2% of $500 = $10` | Ravi keeps $500 in a savings account. The bank pays interest of 2% per year: after one year it adds 2% of $500, which is $10. | Ravi 在储蓄账户里存了 $500。银行每年给 2 % 的利息：一年后多给 $500 的 2 %，就是 $10。 |
| 2 | `BM{整条 $500（cold）+ 一小段 2 %（hot）, scale%}` | `morph` | `$500 + $10 = $510` | Interest is added on. After one year Ravi has $500 + $10 = $510. | 利息是加上去的。一年后 Ravi 一共有 $500 + $10 = $510。 |
| 3 | 换数：`PC{passbook: $2400 · 3% per year}` + BM | `morph` | `3% of $2400 = 3 × $24 = $72` | Siti saves $2400 at 3% per year. 1% of $2400 is $24, so the interest for one year is 3 × $24 = $72. | Siti 存了 $2400，年利率 3 %。$2400 的 1 % 是 $24，所以一年的利息是 3 × $24 = $72。 |
| 4 ⚑ | 同图，hot 虚线 "$2403" 与 "$72 after 1 year" 被划掉 | `cross` | `$2400 + $72 = $2472` | The interest is 3% of the money, not $3. And "how much after one year" asks for the money plus the interest: $2472. | 利息是存款的 3 %，不是 $3。问"一年后有多少"，要把存款和利息加起来：$2472。（`percent-as-amount`、`one-step-short`） |

**要点**：① Annual interest = the interest rate × the money saved, for one year. / 一年的利息 = 年利率 × 存的钱。② After one year: money saved + interest. / 一年后共有：存的钱 + 利息。

**题库（9）**：4 道 `input`（求利息：$800 · 2 % → 16，错例 2 → `percent-as-amount`、400 → `divided-by-rate`；$1500 · 4 % → 60；$600 · 5 % → 30；$3000 · 1 % → 30）；3 道 `input`（求一年后共有：$800 · 2 % → 816，错例 16 → `one-step-short`、802 → `percent-as-amount`；$2000 · 3 % → 2060；$450 · 2 % → 459）；2 道 `choose`（哪张存折的数字对；"$1000 存一年得 $30 利息"，年利率是：3 % ✓、30 % → `percent-decimal-shift`、0.3 %）。

---

### 2.3 练习章 `practice`（8 道固定题，每题一次检查、一个提示）

| # | 题型 | 题目（EN / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `shade-decimal`（`percent`） | Shade 45% of the square. / 在正方形上涂 45 %。 | 45 格（任意位置，只看总量） | 本题不设误解码：错答走 fallback（"数一数涂了几格，100 格是整体"） | 01 |
| Q2 | `input`（`percent`） | Write {3/5} as a percentage. / 把 {3/5} 写成百分数。 | 60 | 35 → `fraction-digits` | 02 |
| Q3 | `input`（`decimal`） | Write 7% as a decimal. / 把 7 % 写成小数。 | 0.07 | 0.7 → `percent-decimal-shift` | 02 |
| Q4 | `choose` | A class has 18 boys and 12 girls. What percentage are girls? / 一个班有 18 个男生、12 个女生，女生占百分之几？ | 40 % | 67 % → `part-to-part`；12 % → `percent-as-amount` | 03 |
| Q5 | `input` | Find 35% of 80. / 求 80 的 35 %。 | 28 | 35 → `percent-as-amount`；2.3 不整 → 不设 | 04 |
| Q6 | `input`（`dollar`） | A bottle is $24. It is sold at 25% off. How much is paid? / 一个水壶 $24，减价 25 %，要付多少？ | 18 | 6 → `one-step-short`；30 → `direction-swapped` | 05 |
| Q7 | `input`（`dollar`） | A bill is $50 before GST. GST is 9%. What is the total? / 账单税前 $50，GST 9 %，总数是多少？ | 54.50 | 4.50 → `one-step-short`；45.50 → `direction-swapped`；"54.5" → `places-short` | 06 |
| Q8 | `input`（`dollar`） | Aisha saves $1200 at 3% interest per year. How much does she have after one year? / Aisha 存 $1200，年利率 3 %，一年后一共有多少？ | 1236 | 36 → `one-step-short`；1203 → `percent-as-amount` | 07 |

按问法 6 种：涂、化（分数 / 小数）、占百分之几、求百分之几的量、折扣、GST / 利息。

---

## 3. 引擎：在 A6a 与 `barmodel` 上做加法

### 3.0 复用与新增

| 编号 | 内容 | 复用 / 新增 |
|---|---|---|
| — | A6a `decimal-grid`（docs/29 §3.2，docs/06「小数」）：百格、`runs`、`crossed`、`quarters`、`wholes`（两个整体）、`pair`；小测 `shade-decimal`（按条的 44 px 按钮、±0.01 / ±0.1 步进器） | 复用 |
| — | 分数主题的 `barmodel`（`part-whole` / `comparison`、`brace`、`units`、`unknown` 段） | 复用 |
| — | `input` 的 `decimal`（`unit: dollar`、`places`）、`simplest`；`choose`（选项可是模型） | 复用 |
| **E-PC1** | **百分数的写法与读法**：字幕 / 算式记号 `{pc:35}`（显示 "35%"、ZH 界面 "35 %"；朗读 "thirty-five per cent" / "百分之三十五"）；`ANSWER_UNITS` 加 `percent`（框后印 %）；算式里的 ` of ` 在 ZH 界面换成"的"语序（`$80 的 10 %`）——只认 `X% of Y` 一种句型 | 新增 |
| **E-PC2** | `decimal-grid` 加 `percent: true`（格下与 PLATE 写百分数；`labels` 的第三种读法）与 `groups: 2 \| 4 \| 5 \| 10 \| 20 \| 25 \| 50`（把 100 格分成 n 块一样大的粗线；`quarters` 是 `groups: 4` 的旧写法，保留）；`pair` 里的两个百格可以写 `size: 0.5–1`（大小不同的两个整体，第 01 步第 4 拍）；`shade-decimal` 加 `percent: true`（托盘读数写 %） | 新增 |
| **E-PC3** | `barmodel` 加 `scale: { marks: ["0", "25", "100"…], whole: "80", unit: "dollar" \| "none", below?: true }`：条上方一行百分比刻度（marks 是百分数），下方一行对应的数量（引擎按 `whole` 算出，`unknown` 的位置写 ?）；条可以超出 100 %（GST、利息的小段接在右边，validate 查 ≤ 120 %） | 新增 |
| **E-PC4** | 新模型 `price-card`（§3.1）：价签 / 账单 / 存折三种样式，只画文字和金额 | 新增 |
| **E-PC5** | 误解域 `percentage`（9 码 + 共用 `not-simplest`、`places-short`）、`lib/diagnose/percentage.ts`；`input.work` 加 `pct` 上下文（§3.2） | 新增 |
| **E-PC6** | 右上卡 PERCENT 与 PLATE 行（§3.3） | 新增 |

**不新增**小测类型。

### 3.1 E-PC4 `price-card`

```json
{ "kind": "price-card", "style": "tag" | "bill" | "passbook",
  "title": { "en": "School bag", "zh": "书包" },          // tag：物品通称；bill / passbook：可省
  "lines": [ { "label": { "en": "Usual price", "zh": "原价" }, "amount": "60", "tone": "cold" },
             { "label": { "en": "Discount 20%", "zh": "折扣 20 %" }, "amount": "?", "tone": "ink", "struck": false } ],
  "off": 20 }                                             // tag 专用：右上角一个圆章 "20% off / 减 20 %"
```
- 画法（docs/08 MathScene 语法）：tag = 一张有穿绳孔的卡片轮廓（1 px 墨线），bill = 一张窄收据（上下锯齿边），passbook = 一页带横线的本子；字用课的字体，金额右对齐、两位小数；`amount: "?"` 画成虚线框；`struck` 画墨色删除线（原价被划掉）。**无 logo、无店名、无条码**。
- 尺寸：宽 ≤ 舞台 40 %；和 `barmodel` 同一拍时卡在左（窄屏在上）。
- validate：`lines` 2–4 行；金额 ≤ $10 000、最多两位小数；`bill` 若同时有"税前、GST、总数"三行，必须加得起来；`off` 1–90。

### 3.2 E-PC5 诊断（`lib/diagnose/percentage.ts`，纯函数，每条 ≥ 2 正例 1 反例）

`input.work.pct = { whole, rate?, part?, other?, ask: "pct" | "part" | "rest" | "sale" | "discount" | "gst" | "total" | "interest" | "after" | "decimal" | "from-fraction" }`

| code | 规则（答 = 孩子写的数） |
|---|---|
| `percent-as-amount` | `ask ∈ {part, discount, gst, interest}` 且 答 = rate；`ask ∈ {sale, total, after}` 且 答 = whole ± rate |
| `percent-decimal-shift` | `ask ∈ {decimal, pct}` 且 答 = 正确值 × 10 或 ÷ 10 |
| `fraction-digits` | `ask: from-fraction`（`work.pct.part / whole` 是分数）且 答 = 分子与分母拼起来的数 |
| `part-to-part` | `ask: pct`、给了 `other`（另一部分）且 答 = part ÷ other × 100（整数） |
| `wrong-base` | `ask: pct` 的折扣题（`other` = 折后价）且 答 = (whole − other) ÷ other × 100 |
| `one-step-short` | 问折后价 / 总数 / 一年后，答 = 折扣 / GST / 利息；或反过来 |
| `direction-swapped` | 折后价答 = whole + 折扣；总数答 = whole − GST；"八折"选 20 % |
| `divided-by-rate` | `ask: part` 等，答 = whole ÷ rate |
| `rest-not-subtracted` | `ask: rest` 且 答 = 给出的那一部分的百分数 |
| `not-simplest`（共用） | `simplest` 形式，答与正确值相等但未约到最简 |
| `places-short`（共用） | `unit: dollar`，答值对但少写末尾的 0 |

`check-pool` 要求：每道题的各个错例值互不相同、也不等于正确答案（同一个数命中两条规则时报 WARN，出题换数，同 docs/29 §9.3）。单测 `tests/math-scene/diagnose-percentage.test.ts`。

### 3.3 E-PC6 HUD

右上卡 **PERCENT**：WHOLE（100 % = 多少）· PART · % ；讲解拍三项都显示；小测里只显示题目给出的，要求的那项写 ?。PLATE 行 MODEL（GRID / BAR / CARD）· WHOLE · SHADED（百格）或 PARTS（模型图的份数）· PERCENT。背景章 00 标本：百格涂 35 %，格下写 35 %（`SPECIMEN 35 %`）。

---

## 4. 名词表（`glossary.json`，12 个）

| id | EN | ZH | 定义要点（带一个例子） |
|---|---|---|---|
| `percent` | per cent (%) | 百分之几（%） | 一百份里的几份。35 % 是 100 份里的 35 份。 |
| `percentage` | percentage | 百分数 | 写成"几 %"的数，表示部分占整体的多少。（Q7：也叫百分比） |
| `whole-100` | the whole (100%) | 整体（100 %） | 全部。全部是 100 %，其余部分 = 100 % − 已知部分。 |
| `hundredth` | hundredth | 百分之一 | 一个整体平均分成 100 份中的一份；1 % = {1/100} = 0.01。（与 `decimals` 同一条） |
| `equivalent-fraction` | equivalent fraction | 等值分数 | {7/20} = {35/100}。（与 `fractions` 同一条） |
| `discount` | discount | 折扣 | 从原价里减掉的钱。原价 $60 减 20 %，折扣 $12。 |
| `usual-price` | usual price | 原价 | 不打折时的价钱。 |
| `sale-price` | sale price | 折后价 | 打折后要付的价钱：原价 − 折扣。 |
| `gst` | GST (Goods and Services Tax) | 消费税（GST） | 在新加坡买大多数东西要交的税，2024 年起是 9 %。（中文正式名称"商品及服务税"，**待核**新加坡华文用法） |
| `interest` | interest | 利息 | 存钱时银行多给的钱。 |
| `interest-rate` | interest rate (per year) | 年利率 | 一年的利息是存款的百分之几。2 % per year：每 $100 一年得 $2。 |
| `bar-model` | model drawing | 模型图 | （与 `fractions` 同一条） |

---

## 5. 写作规则与术语

### 5.1 口吻样例

- 讲解："Cut the whole into 10 equal parts. Each part is 10% of $80, so each is $8." / "把整体平均分成 10 份。每份是 $80 的 10 %，就是 $8。"
- 错误反馈："Not yet. $12 is the discount, the part taken off. What is left to pay?" / "还没对。$12 是折扣，是减掉的部分。还要付多少？"

### 5.2 术语（MOE 英文 · 中文 · 备注）

| EN | ZH | 备注 |
|---|---|---|
| percentage, per cent, % | 百分数、百分之几、% | Q7：百分数 / 百分比（**待核**） |
| part, whole | 部分、整体 | 同分数主题 |
| express … as a percentage | 化成百分数 / 写成百分数 | |
| discount, usual price, sale price | 折扣、原价、折后价 | "sale price" 新加坡课本也写 "selling price"（**待核**）；ZH "售价"易与"原价"混，用"折后价" |
| 20% off | 减价 20 % / 减 20 % | Q6：顺带说"打八折 = 付 80 %" |
| GST | 消费税（GST） | 中文界面保留缩写 GST；全称"商品及服务税"（**待核**） |
| price before GST, total | 税前价、总数 | 不说"含税价"作术语，正文可口语 |
| interest, interest rate, per year | 利息、年利率、每年 | "annual interest" 在 ZH 写"一年的利息" |
| savings account | 储蓄账户 | 不说银行名 |
| model drawing | 模型图 | 同分数主题 |

### 5.3 数字与情境（新加坡）

- 数字：D6；百分比 ∈ {1–10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 60, 65, 70, 75, 80, 85, 90}；化百分数的分数分母 ∈ {2, 4, 5, 10, 20, 25, 50}（第 03 步的整体可以是 40、60、80、200，但结果是整数百分比）。
- 情境：学校书局（书包、文具）、组屋区小店（风扇、水壶）、学校义卖、学生储蓄、班上的统计；GST 只出现在账单 / 收据上（Q3）；利息只在"储蓄账户"。小贩中心不出 GST（小贩一般不收）；不写 Great Singapore Sale 一类活动名。
- 人名：Mei Ling、Ravi、Siti、Aisha、Wei Jie、Arjun、Nurul。
- 金额：整数元或 $x.x0；价钱是编的，不对应真实商品。

---

## 6. 插图（交 Codex；风格与验收同 docs/76 §6、docs/69 §4.2，严格）

共同风格：fine graphite pencil，19th-century scientific plate，细交叉排线；**严格中性灰（R = G = B）**；透明 PNG；主体约占画面 85 %，不触边；**NO text, letters, numerals, %, $, labels, arrows, logos, price stickers with writing, paper texture, background, frame, ground shadow**。交付 `art/planned/percentage/` 原图 + `manifest.jsonl` + 420 px 预览 + cinema 反相模拟；不合格最多重画 4 次。份数是教学点：**每张都要数、量**（docs/69 §4.1-1：等分与计数的图优先代码画）。

`art/planned/percentage/` 的三张候选（2026-10-18）已放大目检：

| # | 文件 | 尺寸 | 用在 | 画什么 | 可数 / 可量的事实（逐条验收） | 不许出现 | 方法 |
|---|---|---|---|---|---|---|---|
| I-1 | `percentage.png`（封面） | 1024² | 主题卡 | 一整块方形烤糕俯视，浅刀痕切成 10 × 10 个一样的小方块，最左一列 10 块颜色更深 | ① 恰好 10 行 10 列（脚本测刀痕间距，各间距相差 ≤ 3 %）；② 深色恰好 10 块、正好一整列；③ 一整块，无散块、无盘子；④ 外轮廓是正方形（宽高比 1 ± 2 %） | 字、数字、%、盘子、刀、手 | **候选目检过**（10 × 10、左列深色）；按 ①④ 跑脚本，过则用 |
| I-2 | `percentage-discount-piece.png` | 1536×1152 | 第 05 章 | 一条长方形烤糕切成**5 块一样宽**的小块排成一排，最右一块向右挪开一点（20 % 被拿走） | ① 恰好 5 块；② 5 块宽度相差 ≤ 2 %（脚本量 alpha 轮廓）；③ 前 4 块相接、第 5 块与它们有明显缝；④ 5 块同高、同一条底线 | 字、价签、刀、盘子、手 | **候选不过检**（只有 4 块，且最右一块明显较窄，约窄 20 %）→ **代码画**（几何 + 铅笔质感，`scripts/figures/percentage-discount.ts` 断言 ①②） |
| I-3 | `percentage-gst-hundred.png` | 1536×1152 | 第 06 章 | 左边一整块 10 × 10 的方块烤糕，右边隔一道缝放着 9 块同样大小的小方块排成一列（每 100 份多 9 份） | ① 左块 10 × 10 = 100 块（刀痕等距 ±3 %）；② 右边恰好 9 块；③ 9 块与左块的小方块一样大（±3 %）；④ 两组之间有明显的缝 | 硬币、钞票、字、数字、% | **代码画**；候选 `percentage-added-charge.png`（5 + 1 枚圆片，暗示 20 %）**不用** |

图注草稿：I-2 "Five equal pieces; one is taken away: 20% off." / "平均切成 5 块，拿走 1 块：减了 20 %。"；I-3 "For every 100 parts of the price, GST adds 9 more." / "价钱每 100 份，GST 再加 9 份。"。三张不靠明暗表意，可反相。

---

## 7. 施工顺序与分工（照 skill `build-order.md`；**不需要新依赖**；子代理不改 `package.json`、不提交）

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | §0.1 定稿；建 `src/content/topics/percentage/{chapters,data}`、`topic.yaml`（`illustration: percentage`） | `topic.yaml` | — | S |
| 1 | E（Opus） | E-PC1–E-PC6、单测、docs/06「百分数」一段 | `lib/{value,words}.ts`（只加 `percent` 与 `{pc:}`）、`stage/DecimalGrid.tsx`（**与小数主题共用，回归 `pnpm shoot decimals --beats --tasks`**）、`stage/BarModelDiagram.tsx`（**与分数主题共用，回归 `pnpm shoot fractions --beats`**）、新 `stage/PriceCard.tsx`、`lib/diagnose/percentage.ts`、`hud/cards/PercentCard.tsx`、`tests/math-scene/{percentage,diagnose-percentage}.test.ts` | 0 | M |
| 2 | L（Opus） | `lesson.json`：7 步 32 拍、每步 1–2 道样板题、练习 8 题；`pnpm shoot percentage --beats` 逐张看 | `data/lesson.json` | 1 | S |
| 3 | Codex | 题库其余约 55 道（每份 `pnpm tsx scripts/math/check-pool.ts <draft> --topic percentage --step <id>` 0 错）；7 章英文初稿 | `scripts/math/drafts/` | 2 | S |
| 4 | T（Opus） | 合并、定稿英文、写中文正文、名词表、来源 | `data/*`、`chapters/*` | 3 | S |
| 4′ | Codex + 主会话 | §6：I-1 脚本复核；I-2、I-3 代码画 | `public/illustrations/**`、`scripts/figures/percentage-*.ts` | 0 | S |
| 5 | P（Sonnet） | QA；e2e：手机上按条涂 45 %、键盘填 `percent` 框、价签 / 账单在 390 宽不挤；小数、分数主题回归 | `tests-e2e/percentage.spec.ts` | 4 | S |
| 6 | 主会话 | 验收、截图、提交 | — | 5 | S |

---

## 8. 验收

照 `references/acceptance.md`，另加：

- [ ] 每个百格拍的涂色数、模型图的刻度与金额由引擎从数据算出，和算式一致（validate）；`price-card` 账单三行加得起来
- [ ] 所有百分数在 EN / ZH 都按 `{pc:}` 朗读（读屏抽查 5 处）；ZH 算式没有残留的 "of"
- [ ] 无品牌、无真实店名、无"$80 + GST"式价签（Q3）；GST 每题写明 9 %
- [ ] §2.1 每个码有 ⚑ 拍、有能诊断它的题；共用码 `not-simplest`、`places-short` 各至少一道
- [ ] 小数主题 `pnpm shoot decimals --beats --tasks`、分数主题 `pnpm shoot fractions --beats` 0 回归
- [ ] 灰度截图能分辨：整体、要找的部分、加上去的小段、斜线划掉的折扣、答案虚线
- [ ] 截图：第 01、05 章 + 练习与一道小测，三种尺寸

## 9. 来源（访问日期 2026-11-16）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (2021 P1 cohort; Updated Oct 2025). https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 课纲原文第 38、41、43 页 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | IRAS, Current GST Rates. https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/basics-of-gst/current-gst-rates | "The current GST rate in Singapore is 9%"；历史税率表（8 %：2023-01-01 至 2023-12-31）。7 % 的起止年份施工时再在同页表里核一次 |
| S4 | IRAS, Displaying and quoting prices. https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/basics-of-gst/invoicing-price-display-and-record-keeping/displaying-and-quoting-prices | GST 登记商家的价签、报价须含 GST；收服务费的餐饮业例外（Q3、D8） |
| S5 | Parker, M., & Leinhardt, G. (1995). Percent: A privileged proportion. *Review of Educational Research*, 65(4), 421–481 | 百分数当个数、比错整体（页码**待核**，不进 `sources.json`） |
| S6 | 批准教材目录（只作顺序参考），https://www.moe.gov.sg/education-in-sg/approved-textbook-list | Q2、Q6、Q7 的写法（**待核**课本） |

## 10. 施工记录 / 已知差距

施工时追加。
