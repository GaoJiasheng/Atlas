# 29 · 小数 · 内容 spec（`decimals`，MathScene 课；v1，§0 已定稿）

docs/17 §6 #11。2026-10-17 起草，**只做规划，不施工、不建目录、不提交**（引擎代理此刻正在按 docs/19 §3.0 改 MathScene）。照 skill `.claude/skills/atlas-lesson-topic/`（SKILL.md + `references/spec-template.md`、`writing-rules.md`、`data-cookbook.md`、`build-order.md`、`acceptance.md`）和样板 docs/15（分数，§10 是讲解优先的现形态）写；布局和密度照 docs/19（乘与除）。三课共用的引擎泛化 G1–G12 见 **docs/19 §3.0**，本文 §3.0 只写小数在它之上要加的东西（X1–X11）和新模型 A6。

记号同 docs/19：EN 字幕与题目是**口吻草稿**，施工时由 Codex 起草全文、Claude 逐句核对；ZH 是 Claude 的草稿，施工时 Claude 独立定稿。课纲来源 S1 = MOE *Mathematics Syllabus Primary One to Six*（2021 Primary One Cohort，Updated Oct 2025），**本文起草时已下载 PDF 逐页核对**（2026-10-17），页码是每页页脚印的 "Page | N"。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **对象与主体**：Number and Algebra · SUB-STRAND: DECIMALS 一线。**P4 全部条目为主体**（1.1–1.5、2.1、3.1–3.3，第 02–13 步）；P2 / P3 的 Money（记法、换成分、加减）是地基，并成第 01 步"元和分"（docs/17："Money … 不单做；小数课第 01 步用钱引入"）；**P5 的两条**（× ÷ 10 / 100 / 1000 及其倍数、单位换算）是"再往前一步"的第 14、15 步（`bridge: true`） | 同意；女儿 2028 年 P4 做 01–13，2029 年 P5 接着做 14–15，一个主题用两年 | 定稿 |
| D2 | **课的形状照分数改版后的样子**（docs/15 §8 D11–D16）：每章 3–5 个讲解拍 + 章末一道小测（8–10 道的题库随机抽，"再来一道""跳过"都在，不强制）；练习章 8 道固定题；背景章 00"怎么用这节课"；没有题单章 | 同意 | 定稿 |
| D3 | **UI 里不出现年级**（Gavin 的规则；docs/19 D3、G8 已在引擎里做）：桥章章头只有 "Going further / 再往前一步"，课纲对照只写条目原文与来源芯片；`ref`、`level` 只留在数据里 | 同意 | 定稿 |
| D4 | **新模型 A6**（docs/17 §7 A6）：A6a 百格 / 千格 `decimal-grid`（与分数墙同一语言：一个整体切成 10 条、每条再切 10 格）、A6b 带小数列的位值表 `place-value`（位值圆片 + 竖式）、A6c 小数数轴 `numberline` 加 `scale: "decimal"` 与连续放大 `zoom`、A6d 钱 `money`（第 01 步和情境题）。A6 也是将来 `percentage` 主题的底（10 × 10 格 = 百分之一） | 同意；四个一次做完 | 定稿 |
| D5 | **千分位怎么画**：在百格上用**放大镜插图**（把一个小方格切成 10 条细条，引线连回原格，技术图版"详图 A"的画法），**不做 10 × 10 × 10 立方体**。理由：SVG 舞台、和分数墙同一平面语言；立方体在 390 px 宽的手机上数不清；要讲的正是"千分之一是百分之一的十分之一"，放大镜和数轴放大是同一个动作 | 放大镜 | 定稿 |
| D6 | **新小测类型**：`shade-decimal`（在百格 / 千格上涂）、`round-on-line`（先点更近的那一端，再写结果）、`align-add`（先把两行按小数点对齐，再写和 / 差）、`shift-digits`（桥：数字整体左右移，小数点不动）；现有的 `place`、`compare`、`order`、`input`、`choose` 和 docs/19 A2 的 `share`、`regroup` **扩到小数**（§3.6） | 同意 | 定稿 |
| D7 | **值类型 `Decimal`**：定标整数（百万分之一为单位的整数 + 写出的小数位数），数据里**一律写字符串**（`"0.50"`，不写 JSON 数 `0.5`），全程不用浮点（§3.1） | 同意 | 定稿 |
| D8 | **"写几位"什么时候算数**：一般题按**值**判（`0.5` 和 `0.50` 都对，D 的重点正是"它们一样大"）；**四舍五入的答案**要写够位数（四舍五入到一位小数写 `3.0`，不写 `3`）；**钱的答案**写两位（`$2.50`，新加坡试卷的写法）。位数不够但值对，反馈用"差一步"的口吻（`places-short`，同分数的 `not-simplest`），不算误解 | 同意 | 定稿 |
| D9 | **读法**：EN 小数点后逐位读 "zero point three five"（不读 "point thirty-five"，不用 "nought"）；ZH "零点三五"。钱 EN "2 dollars 35 cents"，ZH "2 元 35 分"（新加坡不用"角"；口语"两块三毛五"不进正文）。小数点前的 0 一律写（`0.35`，不写 `.35`）；作答框接受 `.35` 并显示成 `0.35` | 同意；施工前翻一页 P4 课本核对 EN 读法（**待核**，同 docs/21 §9.5 的做法） | 定稿 |
| D10 | **误解码复用**：`tick-counting`（分数域）、`carry-not-added`、`zero-in-quotient`（整数运算域）是同一个误解，本课**复用**这三个码（外加分数域的 `not-simplest`，§2.1），诊断注册表允许一个码在几个域文件里各登记一条规则（§3.0 X6）；本课新增 25 个小数域的码（§2.1） | 同意；若 E0 做出的注册表只许一码一规则，退回新码 `decimal-carry-dropped` 等，主会话在 §9 记一笔 | 定稿 |
| D11 | **中文术语**：小数、小数点、十分位 / 百分位 / 千分位、一位小数 / 两位小数 / 三位小数（= decimal places）、位值表、四舍五入、约等于（≈）、近似值；"等值小数"不造词，`0.5 = 0.50` 正文说"末尾添 0 或去掉 0，大小不变"（大陆课本叫"小数的基本性质"，名词表注一句）；见 §4 | 同意 | 定稿 |
| D12 | **数字与情境**：每步的数字上限照课纲（§1.3"数字"列，写进 `limits`）；情境是新加坡日常：熟食中心的饮料与面（价格是简单的 $ 数，**5 分的倍数**，不说"现在一杯多少钱"）、1.5 ℓ 的水瓶、0.75 kg 的米、厨房秤上的 0.125 kg、雨量（mm，虚构数字，不声称是某天的实测）、丝带、跑步；人名多族群（Mei Ling、Aisha、Ravi、Wei Jie、Siti、Arjun、Hui Min、Daniel）；无品牌 | 同意 | 定稿 |
| D13 | **NAPFA 跑步的距离**：brief 里写的 2.4 km 是**中学及以上**的 NAPFA 跑步，小学生跑 **1.6 km**（S20）。孩子自己的跑步写 1.6 km；2.4 km 只作"哥哥 / 姐姐的跑步"出现 | 改成 1.6 km | 定稿 |
| D14 | **背景章 00**：照分数 00 章改写（讲节拍、章节轴、小测、再来一道 / 跳过、四种模型），**不写年级**；不计入步数 | 同意 | 定稿 |
| D15 | **步数**：15 个课步 + 练习 + 00，比分数（12）多。理由：P4 小数是课纲里条目最多的一条子线（9 条），每条都有自己的误解；主线 01–13 约 32 分钟，按两年用 | 同意 | 定稿 |
| D16 | **× ÷ 一位数的位数**：课纲 P4 3.1 限定**被乘 / 被除的小数**最多两位小数；商可以到三位（`1.5 ÷ 4 = 0.375`），除不尽的按 3.3 四舍五入（第 13 步） | 同意 | 定稿 |
| D17 | **图**：首页图已做（静物：尺、读数 0.125 的厨房秤、量杯、一枚素面硬币）；章节配图 3 张（§6，第 01、04、12 章） | 同意；配图可以晚于课上线 | 定稿 |

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字；2026-10-17 从 PDF 抄录）

| 级 | 子线 · 条目 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|---|
| P1（背景） | Money · 1. Money | 1.1 counting amount of money · in cents up to $1 · in dollars up to $100 | 31 | 不引用；"你已经知道" |
| **P2**（地基） | Money · 1. Money | 1.1 counting amount of money in dollars and cents · 1.2 reading and writing money in decimal notation · 1.3 comparing two or three amounts of money · 1.4 converting an amount of money in decimal notation to cents only, and vice versa | 33 | 第 01 步 |
| P2（地基） | Measurement · 1. Length, Mass and Volume | 1.2 using appropriate units of measurement and their abbreviations m, g, kg, ℓ | 34 | 单位记号的来源（ℓ） |
| **P3**（地基） | Money · 1. Money | 1.1 adding and subtracting money in decimal notation | 35 | 第 01、09、10 步的钱 |
| P3（地基） | Measurement · 1. Length, Mass and Volume | 1.1 measuring · length in kilometres (km) · volume of liquid in millilitres (ml) · 1.2 measuring length/mass/volume (of liquid) in compound units · 1.3 converting a measurement in compound units to the smaller unit, and vice versa · kilometres and metres · metres and centimetres · kilograms and grams · litres and millilitres (numbers involved should be within easy manipulation) | 36 | 第 15 步的"你已经知道" |
| P4（地基） | Whole Numbers · 1. Numbers up to 100 000 | 1.5 rounding numbers to the nearest 10, 100 or 1000 · 1.6 use of ≈ | 37 | 第 08 步第一拍 |
| **P4** | Decimals · 1. Decimals up to 3 decimal places | 1.1 notation, representations and place values (tenths, hundredths, thousandths) · 1.2 comparing and ordering decimals · 1.3 expressing decimals as fractions · 1.4 expressing fractions as decimals when the denominator is a factor of 10 or 100 · 1.5 rounding decimals to · the nearest whole number · 1 decimal place · 2 decimal places | 38 | 第 02–08 步 |
| **P4** | Decimals · 2. Addition and Subtraction | 2.1 adding and subtracting decimals (up to 2 decimal places) | 38 | 第 09、10 步 |
| **P4** | Decimals · 3. Multiplication and Division | 3.1 multiplying and dividing decimals (up to 2 decimal places) by a 1-digit whole number · 3.2 dividing a whole number by a whole number with quotient as a decimal · 3.3 rounding answers to a specified degree of accuracy | 38 | 第 11–13 步 |
| P5（桥） | Decimals · 1. Four Operations | 1.1 multiplying and dividing decimals (up to 3 decimal places) by 10, 100, 1000 and their multiples without calculator · 1.2 converting a measurement from a smaller unit to a larger unit in decimal form, and vice versa · kilometres and metres · metres and centimetres · kilograms and grams · litres and millilitres | 41 | 第 14、15 步 |
| P5（不做） | Fractions · 1. Fraction and Division | 1.2 expressing fractions as decimals | 41 | 不做：分母不限于 10、100 的因数（如 {1/8} → 0.125 的方向）是 P5 |
| P5（不做） | Whole Numbers · 2. Four Operations | 2.1 multiplying and dividing by 10, 100, 1000 and their multiples without calculator | 41 | 整数版，docs/19 不做；本课第 14 步只做小数版 |

核对要点（纠正常见二手说法，包括 docs/17）：
- **P4 3.3 "rounding answers to a specified degree of accuracy"** 是 docs/17 §2 表漏掉的一条：除不尽时按题目要求四舍五入（第 13 步第 4 拍）。
- **小数 ↔ 分数两个方向限制不同**：1.3 "expressing decimals as fractions" 不限分母（`0.125 = {1/8}` 可以），1.4 "fractions as decimals" 只限分母是 **10 或 100 的因数**（1、2、4、5、10、20、25、50、100）；`{1/8}` → 0.125 这个方向是 P5 Fractions 1.2。题库照此分方向出题。
- **加减限两位小数**（2.1）；**× ÷ 一位数时被乘 / 被除的小数限两位**（3.1）；**× ÷ 10 / 100 / 1000 限三位小数**且在 P5（1.1）。
- **钱的小数记法在 P2**（1.2），加减在 P3；钱的乘除课纲没有单列，本课只在 P4 3.1、3.2 的情境题里用（"$7 平分给 4 人"）。
- **单位换算的小数形式在 P5 1.2**；P3 1.3 只做复合单位（2 km 45 m ↔ 2045 m），不涉及小数。
- 2021 课纲 P5–P6 Foundation 的 P5（第 46 页）把 P4 的小数条目和 P5 的 × ÷ 10 / 100 / 1000、换算合在一起，本课对 Foundation 同样适用（不在 UI 提）。

课纲框架（S1 第 11–12 页，大观念）：与本课最直接的是 **Notations**（小数点、位值记法，"the rules and conventions"）、**Equivalence**（`0.5 = 0.50 = {1/2}`："the conversion from one form to another equivalent form"）、**Measures**（量有单位，"one unit serve as useful reference"）、**Diagrams**（百格、数轴、位值表）。CPA 的依据同 docs/19：S3（TIMSS 百科）。

### 1.2 级别、步数与时间

- **15 个课步 + 练习章 + 背景章 00**（16 个带编号的章，00 不计）。
- 地基 P2–P3 钱 → 主体 P4（02–13）→ 桥 P5（14–15，可选）。
- 拍数 69（每拍 ~20 s ≈ 23 min），小测 15 道（每道 ~40 s ≈ 10 min），练习 8 道（≈ 5 min）：**全课约 38 分钟**；P4 部分（01–13）约 32 分钟，适合分两三次做。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字（`limits`） |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | — | — | — | — |
| 01 | `dollars-and-cents` | Dollars and cents | 元和分 | P2 Money 1.1–1.4 · P3 Money 1.1 · P4 1.1 | money · decimal-grid | 4 | 9 · input / choose / compare | $0.05–$20.00，5 分的倍数；分 ≤ 2000 |
| 02 | `tenths` | Tenths | 十分位：一位小数 | P4 1.1 | bar → decimal-grid(10) · numberline | 4 | 9 · shade-decimal / place / input / choose | 0.1–9.9，一位小数 |
| 03 | `hundredths` | Hundredths | 百分位：两位小数 | P4 1.1 | decimal-grid(100) | 4 | 10 · shade-decimal / input / choose | 0.01–9.99，两位小数 |
| 04 | `thousandths` | Thousandths: zooming in | 千分位：放大再放大 | P4 1.1 | decimal-grid(1000) · numberline(zoom) | 4 | 9 · place(zoom) / input / shade-decimal | 0.001–9.999，三位小数；数轴放大 ≤ 2 层 |
| 05 | `place-value` | Place value after the point | 小数的位值 | P4 1.1 | place-value | 5 | 10 · input / choose | 整数部分 ≤ 99，三位小数 |
| 06 | `comparing-decimals` | Which is greater? | 小数比大小 | P4 1.2 | decimal-grid 并排 · place-value 对齐 · numberline | 4 | 10 · compare / order / choose | < 100，三位小数，排 3–4 个 |
| 07 | `decimals-and-fractions` | Decimals and fractions | 小数和分数 | P4 1.3, 1.4 | decimal-grid · bar | 5 | 10 · input(分数 / 小数) / choose | 小数 → 分数：三位小数以内；分数 → 小数：分母 2、4、5、10、20、25、50、100，带分数整数部分 ≤ 9 |
| 08 | `rounding` | Rounding | 四舍五入 | P4 1.5 · P4 Whole 1.5, 1.6 | numberline（两端 + 中点） | 5 | 10 · round-on-line / input / choose | < 100，三位小数以内；到整数 / 一位 / 两位小数 |
| 09 | `adding-decimals` | Adding decimals | 小数加法 | P4 2.1 · P3 Money 1.1 | decimal-grid · place-value + 竖式 | 5 | 10 · align-add / input / regroup / choose | 两个加数各 ≤ 两位小数，和 < 1000，进位 ≤ 2 次 |
| 10 | `subtracting-decimals` | Subtracting decimals | 小数减法 | P4 2.1 · P3 Money 1.1 | decimal-grid · place-value + 竖式 | 5 | 10 · align-add / input / regroup / choose | ≤ 两位小数，被减数 < 1000，可为整数 |
| 11 | `multiplying-decimals` | Multiplying by a 1-digit number | 小数乘一位数 | P4 3.1 | decimal-grid（几组）· place-value（几行） | 5 | 10 · input / choose | ≤ 两位小数，< 100，× 2–9，积 < 1000 |
| 12 | `dividing-decimals` | Dividing by a 1-digit number | 小数除以一位数 | P4 3.1 | place-value（发 → 换 → 发） | 5 | 10 · share / input / choose | 被除数 ≤ 两位小数、< 100，÷ 2–9，商能除尽且 ≤ 三位小数 |
| 13 | `whole-number-division` | Whole numbers divided, decimal answers | 整数除以整数，商是小数 | P4 3.2, 3.3 | place-value（钱）· numberline | 4 | 9 · share / input / choose | 被除数 ≤ 999，÷ 2–9；商除尽 ≤ 三位小数，或按要求四舍五入到一位 / 两位 |
| 14 | `times-ten` | × and ÷ by 10, 100 and 1000（桥） | 小数乘除以 10、100、1000 | P5 Decimals 1.1 | place-value（数字整体移位） | 5 | 9 · shift-digits / input / choose | 给定 ≤ 三位小数，结果 ≤ 三位小数；× ÷ 10、100、1000 及 20–900 的整十整百 |
| 15 | `measures-in-decimals` | Measurements in decimals（桥） | 用小数表示量 | P5 Decimals 1.2 · P3 Measurement 1.3 | numberline（双刻度）· place-value | 5 | 9 · input / choose | km↔m、m↔cm、kg↔g、ℓ↔ml；≤ 三位小数 |
| 16 | `practice` | Practice | 练习 | P2–P4 全部 | 按题 | — | 8 道固定题 | — |

### 1.4 不在本课

- 小数乘小数、小数除以小数（新加坡课纲小学不做；中学）。
- 分母不是 10 或 100 的因数的分数化小数（`{3/8}` → 0.375，P5 Fractions 1.2）。第 13 步的 `2 ÷ 3 ≈ 0.67` 是 P4 3.2–3.3 的"整数除以整数"，不说成"{2/3} 化小数"。
- 百分数（P5 `percentage` 主题，复用 A6 百格）。
- 循环小数的记号（点在数字上）：第 13 步只写 `0.666…` 并四舍五入，不教记号。
- 用计算器：P4 小数条目没有说"without calculator"，但 P5 的 × ÷ 10 / 100 / 1000 写明了不用；全课不出现计算器。

---

## 2. 课的设计

### 2.0 写法约定（照 skill `writing-rules.md`）

- 一拍讲一件事：看什么 + 为什么；EN ≤ 35 词、ZH ≤ 60 字；第一拍接"你已经知道的"，最后一拍给结论或一个应用。
- 算式行短：`0.3 = {3/10}`、`0.45 + 0.38 = 0.83`、`2.96 ≈ 3.0`、`7 ÷ 4 = 1.75`；未知写 `?`；不在算式里写解释。比较用 `<` `>` `=` `≠`。
- **小数直接写**（`0.235`、`$2.35`），不用记号；朗读由 `words.ts` 读成 "zero point two three five / 零点二三五"、"2 dollars 35 cents / 2 元 35 分"（§3.0 X8）。带单位的量写 G7 记号 `{u:1.5 l}`（显示 `1.5 ℓ`，读 "1.5 litres / 1.5 升"）。时刻一律走 `{t:…}`，正文里不写裸的 `9.40 am`（会被读成小数，validate 拦）。
- 颜色只表示"谁的"：给定的量 = cold，新加上的 / 孩子涂的 = signal，第二个量（拿来比的那个、另一组）= hot，拿走 = 墨色斜线，"看答案" = 墨色虚线。位值表的圆片**不按位着色**（各位一律墨线圆 + 印字 1 / 0.1 / 0.01 / 0.001），不用红绿判对错。
- 口吻：平静、第二人称、先具体后符号；不用感叹号，不说 easy / wrong / 错了 / 太棒了；错误反馈 = 原因 + 下一步看哪里。

### 2.1 误解目录（小数域 `decimals`；§3.8 写诊断规则）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `longer-is-larger` | 小数点后数字多的大（把小数部分当整数比） | 0.25 > 0.3；4.125 > 4.5；3.15 > 3.5 | "25 is more than 3, but 0.25 is 25 hundredths and 0.3 is 30 hundredths. Line them up on the point." / "25 比 3 大，可是 0.25 是 25 个百分之一，0.3 是 30 个百分之一。按小数点对齐再比。" | S4、S5、S6、S7 |
| `shorter-is-larger` | 小数点后数字少的大（"十分位总比百分位大"） | 0.4 > 0.45；0.5 > 0.55 | "0.45 has the same 4 tenths, and 5 hundredths more." / "0.45 也有 4 个十分之一，还多 5 个百分之一。" | S4、S5、S11 |
| `trailing-zero-changes` | 末尾添 0 / 去 0 会改变大小 | 0.50 > 0.5；认为 0.3 ≠ 0.30 | "Cut each tenth into 10 hundredths: 5 tenths is 50 hundredths. Same squares, same amount." / "把每个十分之一再切成 10 个百分之一：5 个十分之一就是 50 个百分之一，涂的格子一样多。" | S6、S14 |
| `point-separator` | 小数点把两个整数隔开，两边各算各的 | 2.35 + 1.8 = 3.43；0.4 × 3 = 0.12；0.9 + 0.1 = 0.10 | "The digits after the point are tenths and hundredths, not a whole number. 8 tenths is 80 hundredths." / "小数点后面是十分位、百分位，不是另一个整数。8 个十分之一是 80 个百分之一。" | S4、S6、S9 |
| `zero-placeholder` | 漏掉 / 多写占位的 0 | 7 个百分之一写 0.7；4.035 写 4.35；$2.05 写 $2.5；3 in 4.035 的值说成 0.3 | "There are no tenths, so the tenths place needs a 0: 0.07." / "没有十分之一，十分位要写 0：0.07。" | S5、S6、S8 |
| `place-order` | 按题目说的顺序写数字，不按位 | "4 个一、7 个百分之一、2 个十分之一"写 4.72 | "Put each digit in its own place: 2 tenths go next to the point, 7 hundredths after that." / "每个数字放进自己的位：2 个十分之一紧挨小数点，7 个百分之一在它后面。" | S5、S13 |
| `fraction-as-digits` | 把分子分母的数字直接写成小数 / 把小数数字当分母 | {1/4} = 0.4 或 0.14；{3/5} = 0.35；0.3 = {1/3} | "0.3 is 3 tenths. {1/3} is one of 3 equal parts, and it is more than 0.3." / "0.3 是 3 个十分之一。{1/3} 是平均分成 3 份里的 1 份，比 0.3 多。" | S4、S5、S12 |
| `place-denominator` | 化分数时分母用错了位 | 0.35 = {35/10}；0.7 = {7/100}；{7/100} = 0.7 | "0.35 ends in the hundredths place, so it is 35 hundredths: {35/100}." / "0.35 的最后一位在百分位，所以是 35 个百分之一：{35/100}。" | S6、S14 |
| `interval-misread` | 放大后的数轴上把每一格还当上一层的大小 | 0.2–0.3 之间第 3 格读成 0.5 或 0.203 | "This line only goes from 0.2 to 0.3, so each jump is 0.01." / "这条线只从 0.2 到 0.3，每一格是 0.01。" | S10、S12 |
| `round-truncated` | 四舍五入时只是把后面的数字去掉 | 2.96 → 2.9；4.67 → 4.6；2 ÷ 3 ≈ 0.66 | "The next digit is 6, which is 5 or more, so round up." / "下一位是 6，满 5 了，要进一。" | S13、S15 |
| `round-carry-slip` | 进一后把 10 写进同一位 | 2.96 到一位小数写 2.10；4.98 写 4.10 | "9 tenths and 1 more tenth is 10 tenths, which is 1 whole: 3.0." / "9 个十分之一再加 1 个是 10 个十分之一，就是 1 个一：3.0。" | S15 |
| `places-short` | 值对，位数没写够（"差一步"，单独语气） | 四舍五入到一位小数写 3；钱写 $2.5 | "Yes, it is about 3. Rounded to 1 decimal place it is written 3.0." / "对，大约是 3。四舍五入到一位小数要写成 3.0。" | S1 1.5、D8 |
| `round-wrong-place` | 四舍五入到了别的位 | 3.476 到一位小数写 3.48 或 3 | "1 decimal place means keep the tenths: 3.476 lies between 3.4 and 3.5." / "一位小数就是留到十分位：3.476 在 3.4 和 3.5 之间。" | S13 |
| `round-chain` | 从最后一位一级一级往前四舍五入 | 3.447 → 3.45 → 3.5 | "Look only at the digit right after the tenths. It is 4, so 3.447 ≈ 3.4." / "只看十分位后面那一位：是 4，所以 3.447 ≈ 3.4。" | S15 |
| `round-half-down` | 正好是 5 时舍去 | 0.65 → 0.6；2.5 → 2 | "When the next digit is 5, round up: 0.65 ≈ 0.7." / "下一位正好是 5，也要进一：0.65 ≈ 0.7。" | S13 |
| `aligned-right` | 竖式加减按最后一位对齐，不按小数点 | 3.4 + 1.25 = 1.59；7.25 − 1.5 = 7.10 | "Line up the points, so tenths sit over tenths. Write 3.40 if it helps." / "按小数点对齐，十分位对十分位。可以写成 3.40。" | S9、S15 |
| `smaller-from-larger` | 每一位都用大数减小数（不退位） | 0.72 − 0.35 = 0.43；5.20 − 1.47 = 4.27 | "2 hundredths take away 5 cannot be done. Trade 1 tenth for 10 hundredths first." / "2 个百分之一不够减 5 个，先拿 1 个十分之一换成 10 个百分之一。" | S15 |
| `empty-place-brought-down` | 被减数位数少，减数多出来的位直接落下来 | 5 − 1.47 = 4.47；3.5 − 1.27 = 2.37 | "5 is 5.00. Take 7 hundredths from 0 hundredths: trade first." / "5 就是 5.00。0 个百分之一减 7 个，要先退位。" | S9、S15 |
| `point-misplaced` | 数字对，小数点点错了位 | 2.35 × 3 = 70.5 或 0.705；7 ÷ 4 = 17.5 | "Estimate first: 2.35 is about 2, and 2 × 3 = 6. Which answer is near 6?" / "先估一估：2.35 大约是 2，2 × 3 = 6。哪个答案接近 6？" | S9、S13 |
| `remainder-as-decimal` | 把余数接在小数点后面 | 7 ÷ 4 = 1 r 3 写成 1.3；9 ÷ 4 = 2.1 | "The 3 left over is 3 whole ones, still to share. Trade them for 30 tenths." / "剩下的 3 是 3 个一，还要接着分。换成 30 个十分之一。" | S13、S15 |
| `shift-wrong-way` | × 当 ÷ / ÷ 当 ×；大单位化小单位却除 | 2.35 × 10 = 0.235；1.5 km = 0.0015 m | "× 10 makes a number bigger: the digits move left." / "乘 10，数变大：数字往左移。" | S13 |
| `shift-count-wrong` | 移的位数不对 | 2.35 × 100 = 23.5；4.8 ÷ 100 = 0.48 | "× 100 is × 10 twice: two places." / "乘 100 就是乘两次 10：移两位。" | S13 |
| `zero-appended` | "乘 10 就在后面添一个 0" | 2.35 × 10 = 2.350；0.4 × 100 = 0.400 | "A 0 at the end of a decimal does not change it: 2.350 is still 2.35. Move the digits instead." / "小数末尾添 0，大小不变：2.350 还是 2.35。要把数字移位。" | S13、S9 |
| `decimal-as-subunit` | 把小数部分当成小单位的个数 | 1.5 ℓ = 1 ℓ 5 ml / 1005 ml；2.5 kg = 2005 g；$2.5 = 2 元 5 分 | "0.5 ℓ is 5 tenths of a litre. A tenth of 1000 ml is 100 ml, so 0.5 ℓ = 500 ml." / "0.5 ℓ 是 5 个十分之一升。1000 ml 的十分之一是 100 ml，所以 0.5 ℓ = 500 ml。" | S8、S13 |
| `unit-factor-wrong` | 换算用错进率 | 1.5 km = 150 m；0.75 kg = 75 g | "1 km = 1000 m, so multiply by 1000, not 100." / "1 km = 1000 m，要乘 1000，不是 100。" | S13 |

**复用的旧码**（D10）：`tick-counting`（分数域：数轴上数刻度线不数格；本课的十分 / 百分数轴同样会出现）、`carry-not-added`（整数运算域：进上去的那一位没加；本课用于小数加法和小数 × 一位数）、`zero-in-quotient`（整数运算域：商中间漏写 0；本课用于 `6.12 ÷ 6 = 1.2`）；另有分数域的 `not-simplest`（"差一步"），小数 → 最简分数的题照现有的 `simplest` 写法诊断，不加规则。

诊断只认题目声明过的 code（`feedback.wrong[].when`、`choose` 错选项的 `misconception`）。每个 code 至少在一拍里**正面讲**（拍表里标 ⚑），至少一道题库题能诊断它（§8 验收）。

### 2.2 逐步设计

拍表的列：`#` · **模型状态**（§3 的 schema 写法，简写）· **过渡**（`move`）· **算式**（`equation`）· **字幕 EN / ZH**（草稿）。第一拍不写 `move`。模型简写：`grid{…}` = `decimal-grid`，`pv{…}` = `place-value`，`line{…}` = `numberline{scale:"decimal"}`，`money{…}`。

---

#### 第 01 步 `dollars-and-cents` · 元和分（P2 Money 1.1–1.4 · P3 Money 1.1 · P4 1.1，地基）

**概念**：$2.35 的小数点把整元和不到一元的部分分开：3 个一角硬币是 3 个十分之一元，5 分是 5 个百分之一元。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `money{amount:"2.35", layout:"tray"}`（2 枚 $1、3 枚 10¢、1 枚 5¢ 散在托盘里） | — | `$2.35` | A drink at a hawker centre costs $2.35. You already read this: 2 dollars and 35 cents. | 熟食中心的一杯饮料 $2.35。你会读：2 元 35 分。 |
| 2 | `money{amount:"2.35", layout:"by-place"}`（三列：dollars · ten cents · cents） | `arrange` | `$2.35 = $2 + $0.30 + $0.05` | Sort the coins into columns: 2 one-dollar coins, 3 ten-cent coins and 5 cents. Each column is one digit of 2.35. | 把硬币按列排好：2 枚 1 元、3 枚 10 分，还有 5 分。每一列就是 2.35 的一位数字。 |
| 3 | `money{pieces:["0.1"×10], layout:"by-place", trade:"t>O"}`（10 枚 10¢ 合成 1 枚 $1） | `trade` | `10 × $0.10 = $1` | Ten 10-cent coins make one dollar, so 10 cents is one tenth of a dollar. 100 cents make a dollar, so 1 cent is one hundredth. | 10 枚 10 分硬币是 1 元，所以 10 分是 1 元的十分之一。100 分是 1 元，所以 1 分是 1 元的百分之一。 |
| 4 ⚑ | `money{pair:[{amount:"2.05"},{amount:"2.50"}], layout:"by-place"}` | `morph` | `$2.05 ≠ $2.50` | $2.05 is 2 dollars and 5 cents: the 0 keeps the 5 in the cents place. $2.50 is 2 dollars and 50 cents, five 10-cent coins. | $2.05 是 2 元 5 分，0 让 5 留在"分"那一位。$2.50 是 2 元 50 分，是 5 枚 10 分硬币。（`zero-placeholder`、`decimal-as-subunit`） |

**要点**：① In $2.35, the point separates whole dollars from cents. / $2.35 里，小数点把整元和分隔开。② 10 cents is one tenth of a dollar; 1 cent is one hundredth. / 10 分是 1 元的十分之一，1 分是 1 元的百分之一。③ $2.05 and $2.50 are different amounts. / $2.05 和 $2.50 不一样多。

**题库（9）**：3 道 `input`（`work: {do:"convert"}`，钱 → 分：`$2.35 = ? cents` → 235；`$2.5 = ? cents` → 250，错例 `"205"` → `decimal-as-subunit`；分 → 钱：305 分 → `$3.05`，错例 `"3.5"` → `decimal-as-subunit`）；2 道 `input`（`unit: "dollar"`，看硬币写钱数 $1.60、$0.85；错例 `"1.6"` → `places-short`）；2 道 `compare`（$3.15 和 $3.50 谁多：错例 `">"` → `longer-is-larger`；$4.05 和 $4.50）；2 道 `choose`（哪一盘硬币是 $1.25：$1 + 2 × 10¢ + 5¢ ✓；$1 + 2 × 10¢ + 5 × 10¢（读成"1、2、5"）→ `place-order`；$1 + 25 × 10¢ → `point-separator`）。人名：Siti 买饮料、Wei Jie 数零钱。

---

#### 第 02 步 `tenths` · 十分位：一位小数（P4 1.1）

**概念**：一个整体平均分成 10 份，1 份是 {1/10}，写作 0.1；3 份是 0.3。小数点在个位后面。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `bar{parts:10, given:3, object:"strip"}`（分数主题的条） | — | `{3/10}` | You know fractions. Cut a strip into 10 equal parts and shade 3 of them: {3/10}. | 你学过分数。把纸条平均分成 10 份，涂 3 份：{3/10}。 |
| 2 | `grid{level:10, given:"0.3"}`（正方形，10 条竖条） | `morph` | `{3/10} = 0.3` | Make the whole a square and cut it into 10 strips. Three tenths can also be written 0.3, read "zero point three". | 把整体画成正方形，切成 10 条。3 个十分之一也可以写成 0.3，读作"零点三"。 |
| 3 ⚑ | `line{from:"0", to:"1", step:"0.1", labels:"all", marks:["0.3"]}` + 上方的 `grid` 竖条对齐 | `place` | `0.3` | On a number line from 0 to 1, there are 10 equal jumps of 0.1. 0.3 is 3 jumps from 0. Count the jumps, not the marks. | 0 到 1 的数轴上有 10 段，每段 0.1。0.3 离 0 有 3 段。数段，不数刻度线。（`tick-counting`） |
| 4 ⚑ | `grid{level:10, wholes:2, given:"1.4"}` + `line{from:"0", to:"2", step:"0.1", labels:"wholes", marks:["0.9","1.0","1.4"]}` | `morph` | `0.9 + 0.1 = 1.0` | Ten tenths make one whole. So after 0.9 comes 1.0, not 0.10. 1 whole and 4 tenths is 1.4. | 10 个十分之一是 1 个整体。所以 0.9 后面是 1.0，不是 0.10。1 个整体和 4 个十分之一是 1.4。（`point-separator`） |

**要点**：① One tenth is {1/10}, written 0.1. / 十分之一是 {1/10}，写作 0.1。② The point comes after the ones: 1.4 is 1 one and 4 tenths. / 小数点写在个位后面：1.4 是 1 个一和 4 个十分之一。③ 10 tenths make 1. / 10 个十分之一是 1。

**题库（9）**：2 道 `shade-decimal`（level 10，涂 0.7；涂 1.6（两个整体）；level 10 涂不出百分之一，这两道不设误解码，错答走通用反馈 + 下一级提示）；2 道 `place`（0–1 数轴放 0.8；0–2 放 1.3；错例 `"0.7"` / `"1.2"` → `tick-counting`）；3 道 `input`（看图写小数：竖条 9 条 → 0.9；{7/10} = ? → 0.7，错例 `"0.07"` → `place-denominator`；`0.9 + 0.1 = ?` → 1.0 或 1，错例 `"0.10"` → `point-separator`）；2 道 `choose`（哪一幅是 1.2：1 个整体 + 2 条 ✓，1 个整体 + 2 小格（=1.02）→ `zero-placeholder`，12 条散在两个整体里 ✓ 也对，`multi`）。

---

#### 第 03 步 `hundredths` · 百分位：两位小数（P4 1.1）

**概念**：每一条再切成 10 小格，整体就是 100 格，1 格是 0.01；0.3 = 0.30，末尾的 0 不改变大小；没有十分之一时十分位写 0。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{level:10, given:"0.3"}` | — | `0.3` | Start with 3 tenths: 3 strips of the square. | 从 3 个十分之一开始：正方形里的 3 条。 |
| 2 ⚑ | `grid{level:100, given:"0.3"}` | `cut` | `0.3 = 0.30 = {30/100}` | Cut every strip into 10 small squares. Now the whole has 100 squares, and 3 strips are 30 squares: 0.3 = 0.30. The same amount, with another name. | 把每一条都切成 10 小格。整体有 100 格，3 条就是 30 格：0.3 = 0.30。一样多，换了个写法。（`trailing-zero-changes`） |
| 3 | `grid{level:100, runs:[{value:"0.3", tone:"cold"},{value:"0.05", tone:"signal"}]}` | `shade` | `0.3 + 0.05 = 0.35 = {35/100}` | Shade 5 more squares. 3 tenths and 5 hundredths is 0.35, read "zero point three five". It is also 35 hundredths: {35/100}. | 再涂 5 小格。3 个十分之一和 5 个百分之一是 0.35，读作"零点三五"，也就是 35 个百分之一：{35/100}。 |
| 4 ⚑ | `grid{level:100, given:"0.07"}`，旁边淡显 `grid{level:100, given:"0.7", tone:"ghost"}` | `morph` | `0.07 ≠ 0.7` | 7 hundredths is 7 small squares, less than one strip. Write 0.07: the 0 says there are no whole strips. 0.7 would be 7 strips. | 7 个百分之一是 7 小格，还不到一条。写成 0.07，十分位的 0 表示一条也没有。0.7 是 7 条。（`zero-placeholder`） |

**要点**：① One hundredth is {1/100}, written 0.01. / 百分之一是 {1/100}，写作 0.01。② 0.35 = 3 tenths 5 hundredths = 35 hundredths. / 0.35 = 3 个十分之一 5 个百分之一 = 35 个百分之一。③ 0.3 = 0.30; a 0 at the end does not change the amount. / 0.3 = 0.30，末尾的 0 不改变大小。

**题库（10）**：3 道 `shade-decimal`（level 100：0.48；0.06，错例 `"0.6"` → `zero-placeholder`；0.6 用 60 小格或 6 条都对（`accept: "value"`））；3 道 `input`（`sentence`："0.35 = ? tenths ? hundredths" → [3, 5]；"0.35 = ? hundredths" → 35，错例 `"=5"`（只数小格）→ 通用；"4 hundredths = ?" → 0.04，错例 `"0.4"` → `zero-placeholder`）；2 道 `choose`（哪两个一样大：0.5 和 0.50 ✓；选"0.50 更大"的说法 → `trailing-zero-changes`）；2 道 `input`（看百格写小数，含整体：1.25；0.09，错例 `"0.9"` → `zero-placeholder`）。

---

#### 第 04 步 `thousandths` · 千分位：放大再放大（P4 1.1）

**概念**：把一个小格再切成 10 条细条，每条是 0.001；在数轴上放大一次看十分之一里的百分之一，再放大一次看千分之一。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{level:100, given:"0.23"}` | — | `0.23` | 0.23 on the hundred grid: 2 strips and 3 squares. | 百格上的 0.23：2 条再加 3 小格。 |
| 2 | `grid{level:1000, given:"0.235", zoom:{at:"0.23"}}`（第 24 格放大成 10 细条，涂 5 条） | `zoom` | `0.235 = 0.2 + 0.03 + 0.005` | Look closely at the next square and cut it into 10 thin slivers. Each sliver is one thousandth, 0.001. Five slivers make 0.005, so the grid shows 0.235. | 把下一小格放大，切成 10 条细条。每一细条是千分之一，0.001。涂 5 条是 0.005，整幅图就是 0.235。 |
| 3 | `line{from:"0", to:"1", step:"0.1", labels:"all", zoom:[{from:"0.2", to:"0.3"}]}` | `zoom` | `0.2 < 0.235 < 0.3` | On the number line, 0.235 is between 0.2 and 0.3. Zoom into that gap ten times: ten new jumps, each 0.01. | 在数轴上，0.235 在 0.2 和 0.3 之间。把这一段放大十倍：又是 10 段，每段 0.01。 |
| 4 ⚑ | 同上 + 第二层 `{from:"0.23", to:"0.24"}`，`marks:["0.235"]` | `zoom` | `0.23 < 0.235 < 0.24` | It is between 0.23 and 0.24. Zoom in once more: jumps of 0.001. 0.235 is 5 jumps past 0.23. On each line, a jump is a tenth of the jump above. | 它在 0.23 和 0.24 之间。再放大一次：每段 0.001。0.235 是从 0.23 往后 5 段。每一层的一段，是上一层一段的十分之一。（`interval-misread`） |

**要点**：① One thousandth is {1/1000}, written 0.001: a tenth of a hundredth. / 千分之一是 {1/1000}，写作 0.001，是百分之一的十分之一。② To find 0.235, zoom from tenths to hundredths to thousandths. / 找 0.235：从十分位放大到百分位，再放大到千分位。

**题库（9）**：3 道 `place`（`zoom: 2`：放 0.235 类（0.418、0.306、0.072）；错例 `"0.234"` → `tick-counting`，`"0.36"`（0.306 放成 0.36）→ `zero-placeholder`）；3 道 `input`（读放大数轴上箭头所指：0.2–0.3 层第 7 格 → 0.27，错例 `"0.9"`（0.2 + 7 × 0.1）、`"0.207"` → `interval-misread`；厨房秤 0.125 kg 那一层读数）；2 道 `shade-decimal`（level 1000：0.104，错例 `"0.14"` → `zero-placeholder`）；1 道 `choose`（0.007、0.07、0.7 哪个最接近 0：0.007 ✓；选 0.7 → `shorter-is-larger`）。

---

#### 第 05 步 `place-value` · 小数的位值（P4 1.1）

**概念**：位值表在个位右边接着往下：十分位、百分位、千分位；每一位是右边那一位的十倍；空位写 0；读的时候小数点后面一位一位地读。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `pv{columns:["O","t","h","th"], value:"0.235", show:"discs"}` | — | `0.235` | Put 0.235 in a place-value chart: 2 tenths, 3 hundredths, 5 thousandths. The point sits between the ones and the tenths, and never moves. | 把 0.235 放进位值表：2 个十分之一、3 个百分之一、5 个千分之一。小数点在个位和十分位之间，不会动。 |
| 2 | `pv{columns:["T","O","t","h","th"], value:"34.506", show:"both"}` | `morph` | `34.506 = 30 + 4 + 0.5 + 0.006` | Bigger numbers add places on the left. In 34.506, the 5 is worth 5 tenths and the 6 is worth 6 thousandths. Each place is ten times the place on its right. | 数大了，左边多几位。在 34.506 里，5 表示 5 个十分之一，6 表示 6 个千分之一。每一位都是右边一位的十倍。 |
| 3 ⚑ | 同上，`highlight:["h"]`（百分位空着，只有一个 0） | `shade` | `34.506 ≠ 34.56` | There are no hundredths, so the hundredths place holds a 0. Leave it out and you get 34.56, a different number. | 没有百分之一，百分位就写 0。漏掉它，就成了 34.56，是另一个数。（`zero-placeholder`） |
| 4 ⚑ | `pv{columns:["O","t","h"], value:"4.27", show:"discs", fill:["O","h","t"]}`（圆片按"4 个一、7 个百分之一、2 个十分之一"的顺序放进各自的列） | `arrange` | `4 + 0.07 + 0.2 = 4.27` | 4 ones, 7 hundredths and 2 tenths. The places are named out of order, so put each digit in its own column: 4.27, not 4.72. | 4 个一、7 个百分之一、2 个十分之一。说的顺序是乱的，每个数字放进自己的列：4.27，不是 4.72。（`place-order`） |
| 5 ⚑ | `pv{…value:"34.506", show:"digits"}` + 读法条 | `shade` | `34.506` | Read it "thirty-four point five zero six". After the point, say each digit, because 506 there is not five hundred and six: it is 5 tenths, 0 hundredths, 6 thousandths. | 读作"三十四点五零六"。小数点后面一位一位地读，因为这里的 506 不是五百零六，而是 5 个十分之一、0 个百分之一、6 个千分之一。（`point-separator`） |

**要点**：① After the ones come tenths, hundredths and thousandths. / 个位后面是十分位、百分位、千分位。② An empty place holds a 0. / 空着的位要写 0。③ Read the digits after the point one by one. / 小数点后面的数字一个一个地读。

**题库（10）**：3 道 `input`（"4.035 里 3 的值" → 0.03，错例 `"0.3"` → `zero-placeholder`，`"3"` → 通用）；3 道 `input`（`sentence` 展开式 "2 + 0.4 + 0.009 = ?" → 2.409，错例 `"2.49"` → `zero-placeholder`；按名称写数 "6 tenths, 3 ones, 8 thousandths" → 3.608，错例 `"3.68"` → `zero-placeholder`、`"6.38"` → `place-order`）；2 道 `choose`（哪一种读法对：`"thirty-four point five zero six"` ✓，`"thirty-four point five hundred and six"` → `point-separator`）；2 道 `choose`（哪个数的 7 表示 7 个百分之一：`3.075` ✓，`3.75` → `zero-placeholder`，`3.507` → 通用）。

---

#### 第 06 步 `comparing-decimals` · 小数比大小（P4 1.2）

**概念**：按小数点对齐、补成一样多的位，从左往右一位一位比；不是"位数多的大"，也不是"位数少的大"。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 ⚑ | `grid{pair:[{level:100, given:"0.3"},{level:100, given:"0.25", tone:"hot"}]}` | — | `0.3 ? 0.25` | Which is greater, 0.3 or 0.25? 25 looks bigger than 3. But look at the grids: 0.3 covers 30 squares, 0.25 only 25. | 0.3 和 0.25 哪个大？25 看起来比 3 大。可是看百格：0.3 涂了 30 格，0.25 只有 25 格。（`longer-is-larger`） |
| 2 | `pv{rows:["0.3","0.25"], align:"point", pad:true}`（0.3 后面补一个淡显的 0） | `align` | `0.30 > 0.25` | Line them up on the point and give both the same number of places: 0.30 and 0.25. Compare from the left: 3 tenths is more than 2 tenths. | 按小数点对齐，补成一样多的位：0.30 和 0.25。从左往右比：3 个十分之一比 2 个十分之一多。 |
| 3 ⚑ | `grid{pair:[{level:100, given:"0.4"},{level:100, given:"0.45", tone:"hot"}]}` | `morph` | `0.4 < 0.45` | Now 0.4 and 0.45. Tenths are bigger than hundredths, but 0.45 has the same 4 tenths, plus 5 hundredths more. So 0.45 is greater. | 再比 0.4 和 0.45。十分之一比百分之一大，可是 0.45 也有 4 个十分之一，还多 5 个百分之一。所以 0.45 大。（`shorter-is-larger`） |
| 4 | `line{from:"0", to:"1", step:"0.1", labels:"all", marks:["0.07","0.4","0.45","0.7"]}` | `place` | `0.07 < 0.4 < 0.45 < 0.7` | To order several decimals, place them on a number line, or compare place by place. From the smallest: 0.07, 0.4, 0.45, 0.7. | 几个小数排顺序：放到数轴上，或者一位一位地比。从小到大：0.07、0.4、0.45、0.7。 |

**要点**：① Line decimals up on the point, then compare from the left. / 按小数点对齐，从左往右比。② More digits does not mean greater: 0.3 > 0.25, and 0.45 > 0.4. / 位数多不一定大：0.3 > 0.25，0.45 > 0.4。

**题库（10）**：4 道 `compare`（0.6 ? 0.58，错例 `"<"` → `longer-is-larger`；0.4 ? 0.45，错例 `">"` → `shorter-is-larger`；2.09 ? 2.1，错例 `">"` → `longer-is-larger`；3.5 ? 3.50，错例 `">"` / `"<"` → `trailing-zero-changes`；`align: "point"` 可点"对齐"按钮）；3 道 `order`（3–4 个数，升 / 降序；错例按小数部分当整数排 → `longer-is-larger`，按位数少的大排 → `shorter-is-larger`；`line: true` 排完显示在数轴上）；2 道 `choose`（最大 / 最小的是哪个；雨量情境：Monday 12.6 mm、Tuesday 12.55 mm……）；1 道 `choose`（哪一句对："0.8 和 0.80 一样大" ✓）。

---

#### 第 07 步 `decimals-and-fractions` · 小数和分数（P4 1.3, 1.4）

**概念**：小数的最后一位在哪一位，分母就是 10、100 还是 1000；分数化小数，先化成分母是 10 或 100 的等值分数。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 ⚑ | `grid{level:100, given:"0.75"}` | — | `0.75 = {75/100}` | 0.75 ends in the hundredths place: it is 75 hundredths, so 0.75 = {75/100}, not {75/10}. | 0.75 的最后一位在百分位：是 75 个百分之一，所以 0.75 = {75/100}，不是 {75/10}。（`place-denominator`） |
| 2 ⚑ | 同上 + `quarters:true`（百格画成 4 块，每块 25 格） | `split` | `{75/100} = {3/4}` | Split the hundred grid into 4 equal parts of 25 squares. 75 squares are 3 of those parts, so {75/100} can be joined into {3/4}, its simplest form. | 把百格分成 4 块一样大的，每块 25 格。75 格是其中 3 块，所以 {75/100} 还能合成 {3/4}，这是最简分数。（`not-simplest`） |
| 3 ⚑ | `bar{parts:5, given:2}` → `grid{level:10, given:"0.4"}` | `convert` | `{2/5} = {4/10} = 0.4` | Now the other way: {2/5}. Fifths are not a place, so turn them into tenths first: {2/5} = {4/10} = 0.4. Not 0.2, and not 0.25. | 反过来：{2/5}。五分之一不是一个数位，先化成十分之一：{2/5} = {4/10} = 0.4。不是 0.2，也不是 0.25。（`fraction-as-digits`） |
| 4 ⚑ | `bar{rows:[{parts:3, given:1},{parts:10, given:3}]}`（叠放，同一整体） | `morph` | `0.3 < {1/3}` | 0.3 is not {1/3}. 0.3 is 3 of 10 parts, {1/3} is 1 of 3 parts, and {1/3} reaches a little further. | 0.3 不是 {1/3}。0.3 是 10 份里的 3 份，{1/3} 是 3 份里的 1 份，{1/3} 长一点。（`fraction-as-digits`） |
| 5 | `grid{level:100, wholes:3, given:"2.75"}` | `morph` | `{2 3/4} = 2 + {75/100} = 2.75` | Mixed numbers work the same way. The wholes stay in front of the point: {2 3/4} = 2.75. | 带分数也一样，整数部分写在小数点前面：{2 3/4} = 2.75。 |

**要点**：① The last place of a decimal gives the denominator: 0.7 = {7/10}, 0.35 = {35/100}, 0.125 = {125/1000}. / 小数最后一位在哪一位，分母就是 10、100 或 1000。② To write a fraction as a decimal, first make tenths or hundredths. / 分数化小数，先化成分母是 10 或 100 的分数。③ 0.3 is not {1/3}. / 0.3 不是 {1/3}。

**题库（10）**：4 道 `input`（小数 → 最简分数，`form: "simplest"`：0.6 → {3/5}；0.25 → {1/4}；0.04 → {1/25}；0.125 → {1/8}（1.3 方向，不限分母）；错例 `"35/10"`（0.35）→ `place-denominator`；`"25/100"` → `not-simplest`（分数域码，"差一步"））；4 道 `input`（分数 → 小数，`form: "decimal"`：{3/4} → 0.75，错例 `"0.34"` → `fraction-as-digits`；{7/20} → 0.35；{9/25} → 0.36；{1 1/2} → 1.5；{3/50} → 0.06，错例 `"0.6"` → `place-denominator`）；2 道 `choose`（哪个等于 {1/2}：0.5 ✓、0.50 ✓（`multi`）、0.2 → `fraction-as-digits`；哪个说法对："0.3 = {1/3}" → `fraction-as-digits`）。

---

#### 第 08 步 `rounding` · 四舍五入（P4 1.5 · P4 Whole Numbers 1.5, 1.6）

**概念**：先找出数夹在哪两个数之间（到整数 / 一位小数 / 两位小数），再看它离哪一端近；只看要保留那一位的**下一位**：满 5 进一，不满 5 舍去。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `line{from:"3", to:"4", step:"0.1", labels:"ends", marks:["3.7"], halfway:true}` | — | `3.7 ≈ 4` | You already round whole numbers. 3.7 lies between 3 and 4, past the halfway mark 3.5. Rounded to the nearest whole number, 3.7 ≈ 4. | 整数的四舍五入你会。3.7 在 3 和 4 之间，过了中点 3.5。四舍五入到整数，3.7 ≈ 4。 |
| 2 ⚑ | `line{from:"4.6", to:"4.7", step:"0.01", labels:"ends", marks:["4.63"], halfway:true, nearest:"4.6"}` | `round` | `4.63 ≈ 4.6` | To round to 1 decimal place, keep the tenths: find the two tenths around the number. 4.63 is between 4.6 and 4.7, and nearer 4.6. Rounding to 5 answers a different question. | 四舍五入到一位小数，就是留到十分位：先找它两边的两个一位小数。4.63 在 4.6 和 4.7 之间，离 4.6 近。写成 5 是四舍五入到整数，问的不是这个。（`round-wrong-place`） |
| 3 ⚑ | `line{from:"2.9", to:"3.0", step:"0.01", labels:"ends", marks:["2.96"], halfway:true, nearest:"3.0"}` | `round` | `2.96 ≈ 3.0` | 2.96 to 1 decimal place: it lies between 2.9 and 3.0, nearer 3.0. Write 3.0, not 2.10. The 0 shows you rounded to 1 decimal place. | 2.96 四舍五入到一位小数：它在 2.9 和 3.0 之间，离 3.0 近。写 3.0，不是 2.10。末尾的 0 表示保留了一位小数。（`round-carry-slip`、`places-short`） |
| 4 ⚑ | `line{from:"0.6", to:"0.7", step:"0.01", labels:"ends", marks:["0.65"], halfway:true, nearest:"0.7"}` | `morph` | `0.65 ≈ 0.7` | Exactly halfway? 0.65 rounds up to 0.7. The rule: look only at the next digit. 5 or more, round up; less than 5, keep the digit. | 正好在中点？0.65 进一成 0.7。规则：只看下一位。满 5 进一，不满 5 舍去。（`round-half-down`、`round-truncated`） |
| 5 ⚑ | `line{from:"3.4", to:"3.5", step:"0.01", labels:"ends", marks:["3.447"], halfway:true, nearest:"3.4"}` | `morph` | `3.447 ≈ 3.4` | 3.447 to 1 decimal place is 3.4: the digit after the tenths is 4. Rounding to 3.45 first and then to 3.5 moves the number twice, and lands on the wrong side. | 3.447 四舍五入到一位小数是 3.4：十分位后面那一位是 4。先变成 3.45 再变成 3.5，是挪了两次，落到了另一边。（`round-chain`） |

**要点**：① Find the two neighbours, then the nearer one. / 先找两边的数，再看离哪个近。② Look only at the next digit: 5 or more rounds up. / 只看下一位：满 5 进一。③ Rounded to 1 decimal place, 2.96 ≈ 3.0. / 四舍五入到一位小数，2.96 ≈ 3.0。

**题库（10）**：5 道 `round-on-line`（到整数：7.5 → 8；到一位：4.98 → 5.0（错例 `"=4.10"` → `round-carry-slip`、`"=5"` → `places-short`、`"=4.9"` → `round-truncated`）；到两位：1.234 → 1.23；0.65 → 0.7（错例 `"=0.6"` → `round-half-down`）；3.447（错例 `"=3.5"` → `round-chain`））；3 道 `input`（`work: {do:"round"}`，无数轴：12.57 到一位小数 → 12.6；错例 `"12.57"`→ 通用，`"13"` → `round-wrong-place`）；2 道 `choose`（哪些数四舍五入到一位小数是 2.5：2.46 ✓、2.54 ✓、2.55 → 通用、2.449 → `round-chain`）。

---

#### 第 09 步 `adding-decimals` · 小数加法（P4 2.1 · P3 Money 1.1）

**概念**：同一位的数加在一起，满十进一（10 个百分之一换 1 个十分之一）；竖式按小数点对齐。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{level:100, runs:[{value:"0.45", tone:"cold"},{value:"0.38", tone:"signal"}]}` | — | `0.45 + 0.38 = ?` | 0.45 + 0.38 on a hundred grid: 45 squares, then 38 more. | 百格上的 0.45 + 0.38：先涂 45 格，再涂 38 格。 |
| 2 | `pv{columns:["O","t","h"], rows:["0.45","0.38"], show:"discs", combined:true, trade:"h>t"}` | `trade` | `5 + 8 = 13` 个百分之一 | Add the hundredths first: 5 + 8 = 13 hundredths. Ten of them make one more tenth, with 3 hundredths left. | 先加百分之一：5 + 8 = 13 个百分之一。其中 10 个换成 1 个十分之一，还剩 3 个百分之一。 |
| 3 ⚑ | 同上 + `column:{op:"+", a:"0.45", b:"0.38", show:"all"}` | `combine` | `0.45 + 0.38 = 0.83` | Then the tenths: 4 + 3 + 1 = 8. So 0.45 + 0.38 = 0.83. The small 1 in the column is the traded tenth; leave it out and you get 0.73. | 再加十分之一：4 + 3 + 1 = 8。0.45 + 0.38 = 0.83。竖式里的小 1 就是换来的那个十分之一，漏加它就成了 0.73。（`carry-not-added`） |
| 4 ⚑ | `pv{rows:["3.4","1.25"], align:"right"}` → `align:"point", pad:true` | `align` | `3.40 + 1.25 = 4.65` | With different numbers of places, line up the points, not the last digits. Write 3.4 as 3.40 if it helps: the sum is 4.65, not 1.59. | 位数不一样时，按小数点对齐，不按最后一位对齐。可以把 3.4 写成 3.40：和是 4.65，不是 1.59。（`aligned-right`） |
| 5 ⚑ | `money{pair:[{amount:"2.35"},{amount:"1.80"}]}` + `column:{op:"+", a:"2.35", b:"1.80"}` | `morph` | `$2.35 + $1.80 = $4.15` | The same with money. 35 cents and 80 cents make 115 cents, which is $1.15, so the total is $4.15. Adding 35 + 8 as whole numbers gives $3.43. | 钱也一样。35 分加 80 分是 115 分，就是 $1.15，一共 $4.15。把 35 + 8 当整数加，会得出 $3.43。（`point-separator`） |

**要点**：① Line up the points; add each place. / 按小数点对齐，同一位相加。② 10 hundredths make 1 tenth; 10 tenths make 1 one. / 10 个百分之一是 1 个十分之一，10 个十分之一是 1 个一。

**题库（10）**：3 道 `align-add`（`op: "+"`：3.4 + 1.25；12.6 + 8.75（两天的雨量 mm）；0.9 + 2.35；起点按右对齐，错例 `"align:right"` → `aligned-right`；`then` 写和）；4 道 `input`（`work: {do:"add"}`：0.68 + 0.57 = 1.25（错例 `"0.15"` → `carry-not-added`，`"0.125"`→ `point-separator`）；$4.50 + $2.85 = $7.35（`unit: "dollar"`）；1.5 + 0.75（1.5 ℓ 的水再加 0.75 ℓ，`{u:…}`））；2 道 `regroup`（百格 / 位值圆片：13 个百分之一换开写成 0.13，错例 `"=0.013"` → `zero-placeholder`）；1 道 `choose`（哪个竖式写对了：对齐小数点的 ✓，右对齐的 → `aligned-right`）。

---

#### 第 10 步 `subtracting-decimals` · 小数减法（P4 2.1 · P3 Money 1.1）

**概念**：不够减就从上一位退一（1 个十分之一换 10 个百分之一）；被减数位数少，先补 0 再减。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{level:100, given:"0.72", crossed:"0.35"}` | — | `0.72 − 0.35 = ?` | 0.72 − 0.35: take 35 squares away from 72. | 0.72 − 0.35：从 72 格里拿走 35 格。 |
| 2 | `pv{columns:["O","t","h"], value:"0.72", show:"discs", trade:"t>h"}` | `trade` | `0.72 = 0.6 + 0.12` | There are only 2 hundredths, not enough to take away 5. Trade 1 tenth for 10 hundredths: now 6 tenths and 12 hundredths. | 只有 2 个百分之一，不够拿走 5 个。把 1 个十分之一换成 10 个百分之一：现在是 6 个十分之一和 12 个百分之一。 |
| 3 ⚑ | 同上，划掉 3 个十分之一、5 个百分之一 + `column:{op:"−", a:"0.72", b:"0.35", show:"all"}` | `cross` | `0.72 − 0.35 = 0.37` | 12 − 5 = 7 hundredths, 6 − 3 = 3 tenths: 0.37. Taking the smaller digit from the bigger one in each column gives 0.43, which is not the difference. | 12 − 5 = 7 个百分之一，6 − 3 = 3 个十分之一：0.37。每一位都用大的减小的，会得出 0.43，那不是差。（`smaller-from-larger`） |
| 4 ⚑ | `pv{rows:["5","1.47"], align:"point", pad:true}`（5 后面补出淡显的 .00） + `column` | `align` | `5.00 − 1.47 = 3.53` | 5 − 1.47: 5 shows no tenths or hundredths, but it is 5.00. Write the zeros, then trade. 5.00 − 1.47 = 3.53. Bringing down the .47 gives 4.47, which is too big. | 5 − 1.47：5 后面看不到十分位和百分位，其实是 5.00。先补 0，再退位。5.00 − 1.47 = 3.53。把 .47 直接落下来得 4.47，太大了。（`empty-place-brought-down`） |
| 5 | `money{amount:"10.00", note:true}` → `column:{op:"−", a:"10.00", b:"6.85"}` | `morph` | `$10.00 − $6.85 = $3.15` | Change from a $10 note: Ravi pays $6.85 for noodles and a drink. $10.00 − $6.85 = $3.15. Check by adding: $6.85 + $3.15 = $10.00. | 找零：Ravi 买面和饮料一共 $6.85，付了一张 $10。$10.00 − $6.85 = $3.15。用加法验算：$6.85 + $3.15 = $10.00。 |

**要点**：① Not enough in a place? Trade 1 from the place on the left. / 哪一位不够减，从左边一位退一。② Write zeros so both numbers have the same places: 5 = 5.00. / 补 0，让两个数位数一样：5 = 5.00。③ Check a subtraction by adding. / 用加法验算减法。

**题库（10）**：3 道 `align-add`（`op: "−"`：7.25 − 1.5（错例 `"align:right"` → `aligned-right`）；6 − 2.38；4.3 − 1.65）；4 道 `input`（0.9 − 0.36 = 0.54（错例 `"0.66"` → `smaller-from-larger`）；5 − 1.47（错例 `"4.47"` → `empty-place-brought-down`）；$20 − $12.45 = $7.55；7.2 m 的丝带剪去 2.65 m）；2 道 `regroup`（位值圆片：1 个十分之一换 10 个百分之一，再写差）；1 道 `choose`（哪个算式能验算 8.4 − 3.75 = 4.65：`4.65 + 3.75` ✓，`4.65 − 3.75` → 通用）。

---

#### 第 11 步 `multiplying-decimals` · 小数乘一位数（P4 3.1）

**概念**：0.4 × 3 是 3 组 4 个十分之一 = 12 个十分之一 = 1.2；竖式从最低位乘起，满十进一；用估算检查小数点。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{level:10, wholes:2, runs:[{value:"0.4",tone:"cold"},{value:"0.4",tone:"hot"},{value:"0.4",tone:"cold"}]}` | — | `0.4 × 3 = 0.4 + 0.4 + 0.4` | 0.4 × 3 is 3 groups of 4 tenths. | 0.4 × 3 是 3 组，每组 4 个十分之一。 |
| 2 ⚑ | 同上，前 10 条合成一个整体（`trade:"t>O"`） | `trade` | `0.4 × 3 = 1.2` | That makes 12 tenths. Ten tenths make 1 whole, so 12 tenths = 1.2, not 0.12. | 一共 12 个十分之一。10 个十分之一是 1 个整体，所以 12 个十分之一 = 1.2，不是 0.12。（`point-separator`） |
| 3 | `pv{columns:["O","t","h"], value:"2.35", copies:3, show:"discs"}` | `morph` | `2.35 × 3` | 2.35 × 3: three rows of 2 ones, 3 tenths and 5 hundredths. | 2.35 × 3：3 行，每行 2 个一、3 个十分之一、5 个百分之一。 |
| 4 ⚑ | 同上，`combined:true`，依次 `trade:"h>t"`、`"t>O"`，`column:{op:"×", a:"2.35", b:3, show:"all"}` | `combine` | `2.35 × 3 = 7.05` | Hundredths: 15, trade 10 for a tenth. Tenths: 9 + 1 = 10, trade them for a one. Ones: 6 + 1 = 7. So 2.35 × 3 = 7.05, not 6.95. | 百分之一：15 个，10 个换 1 个十分之一。十分之一：9 + 1 = 10 个，换成 1 个一。一：6 + 1 = 7。所以 2.35 × 3 = 7.05，不是 6.95。（`carry-not-added`） |
| 5 ⚑ | `line{from:"0", to:"10", step:"1", labels:"all", marks:["6","7.05"]}` | `morph` | `2.35 × 3 ≈ 2 × 3 = 6` | Check the point by estimating: 2.35 is about 2, and 2 × 3 = 6. 7.05 is near 6; 70.5 and 0.705 are not. | 用估算检查小数点：2.35 大约是 2，2 × 3 = 6。7.05 接近 6，70.5 和 0.705 都不是。（`point-misplaced`） |

**要点**：① Multiply each place, starting from the right; trade 10 for 1 of the next place. / 从最右一位乘起，满十换成左边一位的 1。② Estimate to check where the point goes. / 估一估，检查小数点的位置。

**题库（10）**：7 道 `input`（`work: {do:"multiply"}`：1.6 × 4 = 6.4（错例 `"4.24"` → `point-separator`）；0.75 × 4 = 3（四袋 0.75 kg 的米，写 3 或 3.00 都对；错例 `"0.80"` → `carry-not-added`，`"30"` → `point-misplaced`）；$3.45 × 2 = $6.90；2.36 × 4 = 9.44；0.08 × 6 = 0.48（错例 `"4.8"` → `point-misplaced`）；12.5 × 3；0.9 × 7）；2 道 `choose`（不算，哪个最接近 4.85 × 6：30 ✓、3 → `point-misplaced`、300 → `point-misplaced`）；1 道 `choose`（3 组 0.6 用百格表示是哪一幅：18 条 = 1.8 ✓，18 小格 = 0.18 → `point-separator`）。

---

#### 第 12 步 `dividing-decimals` · 小数除以一位数（P4 3.1）

**概念**：从最高位分起；分不完的换成下一位（1 个一换 10 个十分之一）再分；哪一位每份分到 0，就写 0；末尾补 0 可以接着分。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `pv{columns:["O","t"], value:"8.4", plates:4, show:"discs"}` | — | `8.4 ÷ 4` | Share 8.4 equally among 4: 8 ones and 4 tenths. | 把 8.4 平均分成 4 份：8 个一和 4 个十分之一。 |
| 2 | `dealt:{O:2, t:1}, left:{}` + `column:{op:"÷", a:"8.4", b:4, show:"all"}` | `deal` | `8.4 ÷ 4 = 2.1` | Share the ones: 2 each. Share the tenths: 1 each. 8.4 ÷ 4 = 2.1. The point in the answer sits above the point in 8.4. | 先分一：每份 2 个。再分十分之一：每份 1 个。8.4 ÷ 4 = 2.1。商的小数点和 8.4 的小数点上下对齐。 |
| 3 | `pv{value:"5.6", plates:4}`：`dealt:{O:1}, left:{O:1, t:6}` → `trade:"O>t"` → `dealt:{O:1, t:4}` | `trade` | `5.6 ÷ 4 = 1.4` | 5.6 ÷ 4: 1 one each, and 1 one is left. Trade it for 10 tenths: 16 tenths share as 4 each. 5.6 ÷ 4 = 1.4. | 5.6 ÷ 4：每份 1 个一，剩 1 个一。把它换成 10 个十分之一：一共 16 个十分之一，每份 4 个。5.6 ÷ 4 = 1.4。 |
| 4 ⚑ | `pv{columns:["O","t","h"], value:"6.12", plates:6}`，十分位那格写 0 | `deal` | `6.12 ÷ 6 = 1.02` | 6.12 ÷ 6: 1 one each. 1 tenth cannot go into 6 groups, so each gets 0 tenths: write the 0, then trade. 12 hundredths, 2 each: 1.02, not 1.2. | 6.12 ÷ 6：每份 1 个一。1 个十分之一分不到 6 份，每份 0 个，商的十分位写 0，再把它换开。12 个百分之一，每份 2 个：1.02，不是 1.2。（`zero-in-quotient`） |
| 5 | `pv{columns:["O","t","h","th"], value:"1.5", pad:"1.500", plates:4}` → `column:{op:"÷", a:"1.5", b:4, show:"all"}` | `morph` | `1.5 ÷ 4 = 0.375` | A 1.5 ℓ bottle of water poured equally into 4 cups. Writing 1.5 as 1.500 lets you keep sharing: 0.375 ℓ each. Check: 0.375 × 4 = 1.5. | 一瓶 1.5 ℓ 的水平均倒进 4 个杯子。把 1.5 写成 1.500，就能接着分：每杯 0.375 ℓ。验算：0.375 × 4 = 1.5。 |

**要点**：① Divide from the biggest place; trade what is left into the next place. / 从最高位分起，剩下的换成下一位再分。② A place that gives 0 each still needs its 0. / 哪一位每份分到 0，也要写 0。③ Zeros at the end let you keep dividing: 1.5 = 1.500. / 末尾补 0 可以接着分：1.5 = 1.500。

**题库（10）**：3 道 `share`（位值圆片，`model.kind: "place-value"`：9.6 ÷ 3；5.6 ÷ 4；7.35 ÷ 5；`then` 写商；错例 `"O:1,t:1"`（剩下的一没换开）→ 通用）；5 道 `input`（`work: {do:"divide"}`：4.2 ÷ 4 = 1.05（错例 `"1.5"` → `zero-in-quotient`）；0.75 ÷ 3 = 0.25（0.75 kg 的米分 3 份）；$8.40 ÷ 6 = $1.40；2.7 ÷ 6 = 0.45（错例 `"4.5"` → `point-misplaced`）；6.3 ÷ 9 = 0.7）；2 道 `choose`（"这道竖式哪里出了问题"：选项是一句话 + 小竖式图，错选项各带 code）。

---

#### 第 13 步 `whole-number-division` · 整数除以整数，商是小数（P4 3.2, 3.3）

**概念**：有余数时不停下：余下的一换成十分之一、百分之一接着分；分不完的按题目要求四舍五入。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `pv{columns:["O","t","h"], value:"7", plates:4, money:true}`（圆片印 $1 / 10¢ / 1¢） | — | `7 ÷ 4 = 1 r 3` | Aisha shares $7 equally among 4 children. Each gets $1, and $3 is left over. | Aisha 把 $7 平均分给 4 个小朋友。每人 $1，还剩 $3。 |
| 2 | `trade:"O>t"` → `dealt:{O:1, t:7}, left:{t:2}` → `trade:"t>h"` → `dealt:{O:1, t:7, h:5}` + `column` | `trade` | `7 ÷ 4 = 1.75` | Keep going past the point. Trade the $3 for 30 ten-cents: 7 each, 2 left. Trade those for 20 cents: 5 each. Each child gets $1.75. | 越过小数点接着分。把 $3 换成 30 个 10 分：每人 7 个，剩 2 个。再换成 20 个 1 分：每人 5 分。每人 $1.75。 |
| 3 ⚑ | `line{from:"1", to:"2", step:"0.1", labels:"all", marks:["1.3","1.75"]}` | `morph` | `7 ÷ 4 ≠ 1.3` | 1 r 3 is not 1.3. The 3 left over is 3 whole dollars still to share, and 1.3 would be only $1.30 each. | 1 余 3 不是 1.3。剩下的 3 是 3 整元，还要接着分；1.3 是每人只有 $1.30。（`remainder-as-decimal`） |
| 4 ⚑ | `pv{value:"2", plates:3}` 分到第三位仍剩 2 个 → `line{from:"0.66", to:"0.67", step:"0.001", marks:["0.666"], halfway:true, nearest:"0.67"}` | `zoom` | `2 ÷ 3 = 0.666… ≈ 0.67` | Some divisions never finish: 2 ÷ 3 = 0.666…, with 6s for ever. The question says how to round. To 2 decimal places, 2 ÷ 3 ≈ 0.67. | 有的除法永远除不完：2 ÷ 3 = 0.666……，6 一直写下去。题目会说怎么取近似值。四舍五入到两位小数，2 ÷ 3 ≈ 0.67。（`round-truncated`） |

**要点**：① Do not stop at a remainder: trade it into tenths and hundredths. / 有余数不停：换成十分之一、百分之一接着分。② A remainder is not the digits after the point. / 余数不是小数点后面的数字。③ If it never ends, round as the question asks. / 除不完，就按题目要求四舍五入。

**题库（9）**：2 道 `share`（$9 ÷ 4、$15 ÷ 6 用钱圆片；`then` 写钱数）；5 道 `input`（9 ÷ 4 = 2.25（错例 `"2.1"` → `remainder-as-decimal`，`"22.5"` → `point-misplaced`）；3 ÷ 8 = 0.375；13 ÷ 5 = 2.6；10 ÷ 3 四舍五入到一位小数 ≈ 3.3（`places: 1`；错例 `"3.33"` → `round-wrong-place`）；7 ÷ 6 四舍五入到两位小数 ≈ 1.17（`places: 2`；错例 `"1.16"` → `round-truncated`））；2 道 `choose`（$10 平分给 4 人，每人多少：$2.50 ✓、$2.2（2 余 2）→ `remainder-as-decimal`、$25 → `point-misplaced`）。

---

#### 第 14 步 `times-ten` · 小数乘除以 10、100、1000（P5 Decimals 1.1，**桥**，可选）

**概念**：× 10 每个数字往左移一位（每一位是右边一位的十倍），小数点不动；× 100 移两位，× 1000 移三位；÷ 往右移；空位补 0。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `pv{columns:["H","T","O","t","h"], value:"2.35", show:"digits"}` | — | `2.35` | 2.35 in the place-value chart. Each place is worth ten times the place on its right. | 位值表里的 2.35。每一位都是右边一位的十倍。 |
| 2 ⚑ | `shift:{by:1, dir:"left"}`（数字整体滑过一列，原位置留虚线影子） | `slide` | `2.35 × 10 = 23.5` | × 10: every digit moves one place to the left, and the point stays where it is. 2.35 × 10 = 23.5. Writing 2.350 changes nothing, because a 0 at the end of a decimal adds no value. | 乘 10：每个数字往左移一位，小数点不动。2.35 × 10 = 23.5。写成 2.350 什么也没变，小数末尾添 0 大小不变。（`zero-appended`） |
| 3 | `shift:{by:2}` → `shift:{by:3}`（个位空出来，补一个 0） | `slide` | `2.35 × 100 = 235 · 2.35 × 1000 = 2350` | × 100: two places, 235. × 1000: three places, and a 0 holds the empty ones place: 2350. | 乘 100：移两位，235。乘 1000：移三位，个位空了，补一个 0：2350。（`shift-count-wrong`） |
| 4 ⚑ | `pv{columns:["O","t","h","th"], value:"4.8"}` → `shift:{by:2, dir:"right"}`，补 0 | `slide` | `4.8 ÷ 100 = 0.048` | ÷ moves the digits to the right. 4.8 ÷ 100 = 0.048: two places, with a 0 in the tenths place and a 0 in front of the point. | 除法往右移。4.8 ÷ 100 = 0.048：移两位，十分位补 0，小数点前面也写 0。（`shift-wrong-way`、`shift-count-wrong`） |
| 5 | `pv{value:"0.6"}` → `column:{op:"×", a:"0.6", b:3}` → `shift:{by:1}` | `morph` | `0.6 × 30 = 0.6 × 3 × 10 = 18` | × 30 is × 3, then × 10. 0.6 × 3 = 1.8, and 1.8 × 10 = 18. | 乘 30 就是先乘 3，再乘 10。0.6 × 3 = 1.8，1.8 × 10 = 18。 |

**要点**：① × 10, 100, 1000: digits move 1, 2, 3 places left. / 乘 10、100、1000：数字往左移 1、2、3 位。② ÷ moves them right. The point does not move. / 除法往右移，小数点不动。③ × 30 = × 3, then × 10. / 乘 30 = 先乘 3 再乘 10。

**题库（9）**：3 道 `shift-digits`（3.07 × 100 → 307；52.4 ÷ 10 → 5.24；6 ÷ 1000 → 0.006（结果不超过三位小数）；错例 `"0.0307"` → `shift-wrong-way`、`"30.7"` → `shift-count-wrong`）；4 道 `input`（`work: {do:"scale"}`：0.45 × 10 = 4.5（错例 `"0.450"` → `zero-appended`）；1.2 × 1000；38 ÷ 100 = 0.38；0.7 × 40 = 28）；2 道 `choose`（哪个等于 0.25 × 100：25 ✓、2.5 → `shift-count-wrong`、0.0025 → `shift-wrong-way`、0.2500 → `zero-appended`）。

---

#### 第 15 步 `measures-in-decimals` · 用小数表示量（P5 Decimals 1.2，**桥**，可选；地基 P3 Measurement 1.3）

**概念**：大单位化小单位乘进率（1000 或 100），小单位化大单位除以进率；小数部分是大单位的几分之几，不是小单位的个数。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `line{from:"0", to:"2", step:"0.1", labels:"wholes", unit:"km", dual:{unit:"m", factor:1000}, marks:["1.6"]}`（上面印 km，下面印 m） | — | `{u:1.6 km} = {u:1600 m}` | The NAPFA run for primary pupils is 1.6 km. 1 km = 1000 m, so each tenth of a kilometre is 100 m: 1.6 km = 1600 m. | 小学生 NAPFA 跑步是 1.6 km。1 km = 1000 m，所以每 0.1 km 是 100 m：1.6 km = 1600 m。 |
| 2 ⚑ | `line{from:"0", to:"2", step:"0.1", unit:"l", dual:{unit:"ml", factor:1000}, marks:["1.5"]}` | `morph` | `{u:1.5 l} = {u:1500 ml}` | A 1.5 ℓ bottle holds 1500 ml, not 1 ℓ 5 ml. The 5 means 5 tenths of a litre, and a tenth of 1000 ml is 100 ml. | 1.5 ℓ 的水瓶装 1500 ml，不是 1 ℓ 5 ml。5 表示 5 个十分之一升，1000 ml 的十分之一是 100 ml。（`decimal-as-subunit`） |
| 3 ⚑ | `pv{value:"0.75", shift:{by:3, dir:"left"}}` + 单位芯片 kg → g | `slide` | `{u:0.75 kg} = {u:750 g}` | 0.75 kg of rice in grams: kilograms to grams is × 1000. 0.75 × 1000 = 750, so 0.75 kg = 750 g. Multiplying by 100 would give 75 g, far too little. | 0.75 kg 的米是多少克：千克化克要乘 1000。0.75 × 1000 = 750，所以 0.75 kg = 750 g。乘 100 得 75 g，太少了。（`unit-factor-wrong`） |
| 4 ⚑ | `pv{value:"125", shift:{by:2, dir:"right"}}` + 芯片 cm → m | `slide` | `{u:125 cm} = {u:1.25 m}` | Going the other way, divide: 125 cm ÷ 100 = 1.25 m. A larger unit needs a smaller number. | 反过来就除：125 cm ÷ 100 = 1.25 m。单位变大，数就变小。（`shift-wrong-way`） |
| 5 ⚑ | `line{…km, dual m}` 放大两层（2.0–2.1 km，再 2.04–2.05 km），`marks:["2.045"]` | `zoom` | `2 km 45 m = {u:2045 m} = {u:2.045 km}` | Daniel's sister runs 2.4 km, but today she stops at 2 km 45 m. That is 2045 m, or 2.045 km: the 0 keeps 45 m in the hundredths and thousandths. | Daniel 的姐姐平时跑 2.4 km，今天跑到 2 km 45 m 停下。那是 2045 m，也就是 2.045 km：0 让 45 m 落在百分位和千分位。（`zero-placeholder`、`decimal-as-subunit`） |

**要点**：① Larger unit to smaller unit: multiply (1 km = 1000 m, 1 m = 100 cm, 1 kg = 1000 g, 1 ℓ = 1000 ml). / 大单位化小单位：乘进率。② Smaller to larger: divide. / 小单位化大单位：除以进率。③ 1.5 ℓ is 1500 ml, not 1 ℓ 5 ml. / 1.5 ℓ 是 1500 ml，不是 1 ℓ 5 ml。

**题库（9）**：6 道 `input`（`work: {do:"convert"}`，`form: "decimal"` + `unit`：2.4 km = ? m → 2400（错例 `"240"` → `unit-factor-wrong`，`"2004"` → `decimal-as-subunit`）；3.05 m = ? cm → 305（错例 `"350"` → `zero-placeholder`）；750 ml = ? ℓ → 0.75（错例 `"750000"` → `shift-wrong-way`）；1.25 kg = ? g；4005 g = ? kg → 4.005（错例 `"4.5"` → `decimal-as-subunit`）；60 cm = ? m → 0.6）；3 道 `choose`（哪一个等于 1.5 ℓ：1500 ml ✓、1 ℓ 5 ml → `decimal-as-subunit`、150 ml → `unit-factor-wrong`）。

---

### 2.3 练习章 `practice`（8 道固定题，每题一次检查，总结页 + 再做一次）

| # | 题型 | 题目（EN 草稿 / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `shade-decimal`（level 100） | Shade 0.06 of the grid. / 在百格上涂出 0.06。 | 6 小格 | `"0.6"` → `zero-placeholder` | 03 |
| Q2 | `place`（`zoom: 2`） | Put 0.235 on the number line. Zoom in as you need. / 把 0.235 放到数轴上，需要就放大。 | 0.235 | `"0.234"` → `tick-counting`；`"0.325"` → `place-order` | 04 |
| Q3 | `order`（升序，`line: true`） | Order from the smallest: 0.5, 0.45, 0.405, 0.54. / 从小到大排：0.5、0.45、0.405、0.54。 | 0.405, 0.45, 0.5, 0.54 | `"0.5,0.45,0.54,0.405"` → `longer-is-larger`；`"0.405,0.45,0.54,0.5"` → `shorter-is-larger` | 06 |
| Q4 | `input`（`form: "simplest"`） | Write 0.35 as a fraction in its simplest form. / 把 0.35 化成最简分数。 | {7/20} | `"35/10"` → `place-denominator`；`"35/100"` → `not-simplest` | 07 |
| Q5 | `round-on-line` | Round 4.98 to 1 decimal place. / 把 4.98 四舍五入到一位小数。 | 5.0 | `"=4.10"` → `round-carry-slip`；`"=5"` → `places-short`；`"=4.9"` → `round-truncated` | 08 |
| Q6 | `align-add`（`op: "−"`） | Hui Min has 7.2 m of ribbon and cuts off 2.65 m. How much is left? / Hui Min 有 7.2 m 丝带，剪去 2.65 m，还剩多少？ | 4.55 | `"align:right"` → `aligned-right`；`"=4.65"` → `empty-place-brought-down`；`"=5.45"` → `smaller-from-larger` | 10 |
| Q7 | `input`（`form: "decimal"`） | Arjun cuts 4 pieces of string, each 2.36 m long. How long are they altogether? / Arjun 剪了 4 段绳子，每段 2.36 m，一共多长？ | 9.44 | `"8.144"` → `point-separator`；`"8.24"` → `carry-not-added`；`"94.4"` → `point-misplaced` | 11 |
| Q8 | `input`（`unit: "dollar"`） | $9 is shared equally among 4 children. How much does each get? / $9 平均分给 4 个小朋友，每人多少？ | $2.25 | `"2.1"` → `remainder-as-decimal`；`"22.5"` → `point-misplaced` | 13 |

6 种题型（shade-decimal、place、order、input、round-on-line、align-add）；桥章不进练习。总结页一句话 + 表 + "再做一次"，同分数。

---

## 3. 引擎：小数值、A6 模型、新小测类型、误解诊断

### 3.0 用到的共用泛化（docs/19 §3.0）与本课新增（X1–X11）

用到 docs/19 的 G1（值类型的框架）、G2（作答写法的拆分 `tray/inputs/*`、`sentence`）、G3（右上卡注册表）、G4（PLATE 行注册表）、G5（误解分域）、G6（`trade`、`deal`、`combine`、`arrange`、`cut`、`shade`、`cross`、`merge`、`split`、`convert`、`morph`）、G7（`{u:…}` 记号、`words.ts`）、G8–G12 全部；还用到 A2 的 `share` / `regroup` 与竖式组件（docs/19 §3.2，E1 做），本课把它们扩到小数。本课在其上加：

| # | 改动 | 改哪里 | 说明 |
|---|---|---|---|
| X1 | **值类型 `Decimal`**（§3.1） | `lib/decimal.ts`（新，纯函数）、`schema.ts`（zod 转换器 `decimal`） | 定标整数，不用浮点；数据一律字符串 |
| X2 | **`Measure` 的值改成 `Decimal`**，单位加 `km`、`g`、`kg`、`l`（显示 ℓ）、`ml`；原有整数量照常解析 | `lib/value.ts`、`MEASURE_RE`、`unitText` / `unitWords` | `"1.5 l"` → 显示 `1.5 ℓ`，读 "1.5 litres / 1.5 升"；`{u:…}` 记号同步 |
| X3 | **作答写法 `decimal`**：一个框 + 屏上键盘多一个 `.` 键；`places`（必须写够几位小数）、`unit`（`dollar` 印在框前为 `$`；量的单位印在框后）、`work`（诊断上下文，§3.7） | `tray/inputs/DecimalInput.tsx`、`lib/check.ts`、`lib/solve.ts sampleState` | 物理键盘 `.` 直接打；`,` 忽略；`.35` 显示成 `0.35` |
| X4 | **右上卡 DECIMAL**（§3.9） | `hud/cards/DecimalCard.tsx` + 注册表 | 小测时不先说答案 |
| X5 | **PLATE 行**：decimal-grid（整体 · 十分 · 百分 · 千分 · 值）、place-value（数 · 换了几次 · 移位）、小数数轴（范围 · 每格 · 放大 · 标记）、money（硬币数 · 合计） | `hud/PlateBlock.tsx` + i18n | 手机隐藏，同现状 |
| X6 | **小数误解域** `decimals`（§2.1 的 25 个码，`DECIMAL_CODES`）+ **一码多规则**：诊断注册表 `registerRule(code, { kinds, when, test })` 允许 `tick-counting`、`carry-not-added`、`zero-in-quotient` 在 `lib/diagnose/decimals.ts` 里各再登记一条小数规则；validate 的"这种题型诊断得了这个 code 吗"按注册表查，不按域名单查 | `schema.ts`、`lib/diagnose/decimals.ts`（新）、`lib/diagnose/index.ts`（注册表）、`validate.ts` | D10；单测 `diagnose-decimals.test.ts` |
| X7 | **节拍过渡**加：`zoom`（数轴下方展开一层放大线 / 百格放大镜展开）、`slide`（位值表里数字整体滑过 n 列，小数点不动，原位留虚线影子）、`align`（竖式第二行左右滑到小数点对齐，补的 0 淡入）、`round`（标记旁的箭头指向较近的一端，那一端加粗） | `schema.ts BEAT_MOVES`、`stage/BeatModel.tsx`、各模型 | 每个 ≤ 900 ms；`prefers-reduced-motion` 换成淡入；不引入补间库 |
| X8 | **文本里的小数与钱**：正文、字幕、题目里**裸写**的小数（`\d+\.\d+`）与钱（`$\d+(\.\d{2})?`）不拆行（frac-glue 的 nowrap 扩到它们与相邻运算符），朗读：EN "zero point two three five"、"thirty-four point five zero six"、"2 dollars 35 cents"、"$0.35" → "35 cents"、"$3.00" → "3 dollars"；ZH "零点二三五"、"三十四点五零六"、"2 元 35 分"；`≈` 读 "is about / 约等于"；`0.666…` 读 "zero point six six six, and so on / 零点六六六，一直下去"。**validate 拦裸写的时刻**（`\d{1,2}\.\d{2}\s?(am\|pm)` 必须写成 `{t:…}`，否则会被读成小数） | `src/lib/rich-text.ts`、`src/lib/frac-glue.ts`、`lib/words.ts`（`decimalWords`、`moneyWords`）、`validate.ts` | `words.test.ts` 补全 |
| X9 | **每步数字上限**（G11 的 `limits` 加键）：`dp: [min, max]`（给定小数的位数）、`resultDp`（答案最多几位）、`maxValue`、`factor: [2, 9]`（× ÷ 一位数）、`denominators`（分数 → 小数允许的分母）、`roundTo: [0, 2]`、`by: [10, 100, 1000]` + `multiples: true`、`units: ["km-m","m-cm","kg-g","l-ml"]`、`money: true`（钱数是 5 分的倍数）、`zoomDepth` | `schema.ts stepLimits`、`validate.ts`、`scripts/math/check-pool.ts` | `check-pool --topic decimals --step <id>` 逐道查 |
| X10 | **VIEW 组**：`MODEL_VIEWS` 加 `decimal-grid`、`place-value`、`money`（小数数轴沿用 `numberline`）；同一个小数值的小测可以在百格 / 数轴 / 位值表之间切换（引擎按题目能否画来过滤） | `schema.ts`、`hud/Overlay.tsx` | 第 02–06 步 `views: ["decimal-grid", "numberline", "place-value"]` |
| X11 | **自证、截图、e2e 跟上新题型**：`shade-decimal`、`round-on-line`、`align-add`、`shift-digits` 与扩到小数的 `place` / `compare` / `order` / `share` / `regroup` 都有 `solve()`、`sampleState()`、`proveTask`、`__atlas.engine.goToTask`、`pnpm shoot --tasks` 的起始 / 错例 / 做对三张、键盘路径；docs/06「MathScene」写新模型、新 `kind`、`sample` 记号、`Decimal` 的规则 | `lib/solve.ts`、`lib/proof.ts`、`scripts/shoot.ts`、`tests-e2e/decimals.spec.ts`、docs/06 | 同 G12 |

不变的：章节轴、阅读面板顺序（章头 → 节拍行 → 小测托盘 → 正文 → 本章索引）、抽题与"再来一道 / 跳过"、练习与总结页、URL 只有 `ch` / `b` / `model`、答案与抽到的题不进 URL 和存储。

### 3.1 X1 `Decimal`：精确小数（`lib/decimal.ts`）

```ts
/** An exact decimal: `units` millionths (an integer) and the places it was written with. */
export interface Decimal { units: number; dp: number }   // 2.50 → { units: 2_500_000, dp: 2 }
export const SCALE = 1_000_000;          // 6 places inside; lessons write ≤ 3, wrong answers may need more
export const DECIMAL_MAX = 99_999.999999;

parseDecimal("0.50") → { units: 500_000, dp: 2 } | null     // 只认 /^\d{1,5}(\.\d{1,6})?$/ 和 /^\.\d{1,6}$/；逐位读数字，不经过 Number(text)
formatDecimal(d) → "0.50"                                     // 按 dp 写；dp = 0 时不写点
eq(a, b)            // 值相等（0.5 = 0.50）
same(a, b)          // 值与写法都相同（0.5 ≠ 0.50）——四舍五入、钱的 places 检查用
cmp(a, b) → -1 | 0 | 1
add(a, b), sub(a, b)                   // dp = max(a.dp, b.dp)；sub 结果 < 0 返回 null
mulWhole(a, k)                         // k 是整数；dp = a.dp
divWhole(a, k, maxDp = 6) → { q: Decimal, exact: boolean }   // 长除法逐位求商，exact = 余数为 0
round(a, n)                            // 四舍五入到 n 位（满 5 进一），dp = n（3.0 保留）
truncate(a, n)                         // 截断（诊断用）
scale(a, p)                            // × 10^p（p 可负）：整数移位，dp 相应变化
digitAt(a, place)                      // place: 1 = 个位、-1 = 十分位 …
toFraction(a) → Frac                   // units / SCALE 约到最简，用 lib/fraction.ts
fromFraction(f, maxDp = 3) → Decimal | null   // 分母只含因子 2、5 且结果 ≤ maxDp 位时有值
```

- **不用浮点**：`units` 是安全整数（最大 9.9 × 10¹⁰ < 2⁵³）；乘一位数、× 10ⁿ、加减都是整数运算；除法是整数长除法。`lib/decimal.ts` 里不出现 `parseFloat`、`toFixed`、`Number(text)` 对小数文本的直接转换（§8 验收用 grep 查）。单测必须有：`0.1 + 0.2 = 0.3`、`1.005` 四舍五入到两位 = `1.01`、`2.96 → 3.0`、`0.65 → 0.7`、`1.5 ÷ 4 = 0.375`（exact）、`2 ÷ 3`（不 exact，`round(…, 2) = 0.67`）、`2.35 × 1000 = 2350`、`4.8 ÷ 100 = 0.048`。
- **数据里一律字符串**：`lesson.json` 的小数字段写 `"0.50"`；zod 转换器拒绝 JSON 数（`0.5` → 报错 "write decimals as strings, e.g. \"0.5\""）。
- 范围：0 ≤ x ≤ 99 999.999999（不做负数）；`format` 的整数部分 ≥ 10 000 时用窄空格分组（同 G1 的整数）。

### 3.2 A6a `decimal-grid`：百格 / 千格

```json
{ "kind": "decimal-grid",
  "level": 10 | 100 | 1000,                // 10 = 10 条竖条；100 = 10 × 10 小格；1000 = 百格 + 放大镜里的细条
  "wholes": 1,                             // 并排几个整体（1–3，值 ≥ 1 时用）
  "given": "0.35",                         // 简写：一段 cold
  "runs": [ { "value": "0.3", "tone": "cold" }, { "value": "0.05", "tone": "signal" } ],   // 依次涂的几段
  "crossed": "0.12",                       // 墨色斜线：从已涂部分的末尾往回划
  "zoom": { "at": "0.23" },                // 放大镜：这一小格（0.23–0.24）展开成 10 条细条
  "quarters": true,                        // 叠一层 4 等分的粗线（第 07 步 {3/4}）
  "labels": "none" | "tenths" | "hundredths",   // 条下印 0.1、0.2 …（或小格计数）
  "trade": "t>O" | "h>t" | "th>h",         // 高亮要合并的 10 份（第 11 步 10 条合成 1 个整体）
  "tone": "ghost",                          // 整幅淡显（对照用）
  "pair": [ {…}, {…} ] }                    // 两个百格并排（第 06 步比较，左 cold 右 hot）
```

**画面**（技术图版语法：纸面底、1 px 墨线、正投影、无阴影）：一个整体是一个正方形，外框 1.5 px；十分之一是**竖条**（新加坡课本的画法，和分数条的竖切一致），条间 1 px 墨线；百分之一是条里的小格，格线是发丝线（paper 上 ink 18 %），每 5 格一条略重的线便于数。**涂的顺序固定**：先整个整体，再从左到右一条一条，最后一条从上往下一格一格（所以 0.35 永远是 3 条整条 + 第 4 条上面 5 格），孩子在小测里可以涂任意格，只检查总量（`accept: "value"`）。涂色 = 该段 tone 的填色，格内留 1 px 缝。放大镜：被放大的小格加一个小圆框，两条引线连到右侧（窄屏在下方）的大方框，大方框里是 10 条细条，涂了几条就是几个千分之一；技术图版的"详图"标注只用符号 `×10`，不写字。`level: 1000` 时 validate 要求值的第三位小数只出现在放大镜那一格里（也就是放大镜 `at` 必须是"涂到一半的那一格"）。

**规模**：1920 宽下一个整体 ~ 360 px（小格 36 px）；390 宽下 ~ 300 px（小格 30 px）。手机上小格不到 44 px，操作按"条"：每条下方一个 44 px 的条按钮（一次涂满 / 清空一条），托盘里 `−0.01 / +0.01`、`−0.1 / +0.1` 步进器（同 docs/21 A4 按行铺的取舍）。

### 3.3 A6b `place-value`：带小数列的位值表（位值圆片 + 竖式）

```json
{ "kind": "place-value",
  "columns": ["T", "O", "t", "h", "th"],    // 从 H 到 th 的连续一段；默认按值取
  "value": "2.35",
  "show": "digits" | "discs" | "both",
  "fill": ["O", "h", "t"],                  // 圆片放进各列的顺序（第 05 步 place-order）
  "highlight": ["h"],
  "rows": ["3.4", "1.25"], "align": "point" | "right", "pad": true,   // 竖排两行（比较、竖式对齐；pad = 补淡显的 0）
  "copies": 3, "combined": true,            // 乘：n 行同样的圆片，combined 时同列推到一起
  "plates": 4, "dealt": { "O": 1, "t": 4 }, "left": { "t": 2 },   // 除：k 个盘，每盘已有的 / 垫上没分的
  "trade": "O>t" | "t>O" | "t>h" | "h>t" | "h>th" | "th>h",
  "shift": { "by": 1 | 2 | 3, "dir": "left" | "right" },          // 桥：数字整体移位
  "money": true,                            // 圆片印 $1 / 10¢ / 1¢（第 13 步）
  "column": { "op": "+" | "−" | "×" | "÷", "a": "2.35", "b": "1.8" | 3, "show": "none" | "…" | "all" } }
```

**画面**：列头小号大写 `TENS · ONES · TENTHS · HUNDREDTHS · THOUSANDTHS` + 中文（十位 · 个位 · 十分位 · 百分位 · 千分位），列间发丝竖线；**个位和十分位之间画一个大墨点**（小数点），它是整幅图里唯一不动的东西（`slide` 时数字滑、点不动，这是第 14 步的重点）。圆片：直径 28 px（手机 22 px，点按区补到 44 px，点的是"这一列的一堆"），墨线圆 + 印字 `1`、`0.1`、`0.01`、`0.001`（钱版 `$1`、`10¢`、`1¢`），每列 5 个一排。`trade` 的动画沿用 A2：10 个圆片滑到一起合成一个左列圆片，或反过来一个裂成 10 个。`show: "digits"` 时每列一个大号数字，空位写 0（第 05 步拍 3 高亮那个 0）。

**竖式**（`column`）：复用 docs/19 A2 的 `ColumnWorking`，加小数：**小数点竖着对齐成一条线**（加减乘的积、除的商，小数点都在同一竖线上），`align: "right"` 只用来画"错的对齐"（灰色虚线框标出没对上的点）；进位 / 退位的小数字写在上方（signal）；除法用长除号，商写在上方、小数点和被除数的小数点上下对齐；`pad` 的补 0 淡显。竖式里每一位和左边的圆片列同一行高亮。

规模：`value` ≤ 99.999（`shift` 后 ≤ 9999）；同时 ≤ 120 个圆片（超了先 `trade`）。

### 3.4 A6c 小数数轴：`numberline` 加 `scale: "decimal"` 与连续放大

```json
{ "kind": "numberline", "scale": "decimal",
  "from": "0", "to": "1", "step": "0.1",            // ≤ 20 段
  "labels": "ends" | "wholes" | "all" | "none",
  "marks": ["0.3"], "arrow": "0.23",
  "zoom": [ { "from": "0.2", "to": "0.3" }, { "from": "0.23", "to": "0.24" } ],   // 每一层是上一层的一段，放大成 10 段
  "halfway": true,                                  // 中点画短虚线刻度，标中点的值
  "nearest": "3.0",                                 // 四舍五入：从标记到较近一端的箭头
  "unit": "km", "dual": { "unit": "m", "factor": 1000 } }   // 双刻度：线上印 km，线下印 m
```

**画面**：每一层是一条完整宽度的数轴，自上而下排；上一层被放大的那一段加粗并在下方画一个方括号，两条发丝引线从这一段的两端斜着连到下一层的两端（技术图版"详图 A"的画法），引线旁一个 `×10`。最多 **2 层放大**（三条线）；每层 10 段，端点标值（`labels: "ends"`）。`marks` 是空心圆 + 值，`arrow` 是线上方的小三角（读数题）。`halfway` 的中点刻度是短虚线；`nearest` 时较近的那一端刻度加粗，一条 signal 小箭头从标记指过去（`move: round`）。双刻度：上方印大单位、下方印小单位，同一位置两个读数（第 15 步）。分数数轴的写法不变（`scale` 缺省 = `"fraction"`），整数数轴 `scale: "whole"` 是 docs/19 A1 的。

validate：每层 `zoom` 是上一层的**恰好一段**（`to − from = 上一层 step`），`step` 自动是上一层的十分之一；`marks` 落在最深一层的刻度上；`nearest` 是 `from` 或 `to`；`halfway` 只在端点是相邻两个"保留位"时用。

### 3.5 A6d `money`：硬币与纸币

```json
{ "kind": "money",
  "amount": "2.35",                                  // 5 分的倍数（X9 money）
  "pieces": ["1", "1", "0.1", "0.1", "0.1", "0.05"], // 可选：指定硬币；缺省按新加坡面额贪心拆
  "layout": "tray" | "by-place",                     // 散在托盘里 / 按 元 · 10 分 · 分 三列排
  "trade": "t>O",                                    // 10 枚 10¢ 合成 $1
  "note": true,                                      // 画一张 $10 纸币（第 10 步找零）
  "pair": [ { "amount": "2.05" }, { "amount": "2.50" } ] }
```

面额：硬币 5¢、10¢、20¢、50¢、$1；纸币 $2、$5、$10、$50（S19）。**不画真实币面图案**：硬币是素面圆（大小按面额递增，$1 带一圈内环表示双金属），圆心印面额字；纸币是圆角矩形 + 面额字。没有 1 分硬币（早已不发行，S19），"分"在 `by-place` 的第三列只放 5¢ 和"x 分"的计数，百分之一由百格讲。

### 3.6 小测类型（新增与扩展）

| kind | 字段 | 孩子做什么 | 键盘 | 检查 | `sample` 写法 |
|---|---|---|---|---|---|
| `shade-decimal`（新） | `{ target: decimal, level: 10 \| 100 \| 1000, wholes?, start?: decimal, accept: "value" }`；模型必须是 `decimal-grid` | 点条按钮涂满 / 清空一条，点小格涂 / 撤一格；`level: 1000` 时放大镜跟着"下一格"走，点细条涂千分之一；托盘步进器 ±0.1、±0.01（±0.001）；计数显示"已涂 0.35"（是孩子自己的状态，不是答案） | 方格是 roving-tabindex 网格（方向键、Enter 涂 / 撤）；`+` / `−` 百分之一，Shift + `+` / `−` 十分之一 | 已涂总值 = `target`（`start` 是锁定的给定量） | 涂出的值：`"0.6"` |
| `place`（扩到小数） | `{ target: decimal, zoom?: 0 \| 1 \| 2, snap: "ticks" }`；模型 `numberline{scale:"decimal"}` | `zoom > 0` 时先点一段 → 下面展开放大线（`move: zoom`），可以换一段重开；在最深一层点刻度放标记 | 每层是 `role="slider"`（`aria-valuetext` "between 0.2 and 0.3"）：←→ 选段 / 刻度，Enter 展开 / 放，Esc 收起最深一层 | 标记的值 = `target` | 放的值：`"0.234"` |
| `compare`（扩到小数） | `{ a, b: frac \| decimal, ask, align?: "point" \| "grid" \| "line" }` | 同分数；"对齐"按钮把两个数按小数点竖排并补 0（`point`），或画成并排百格 / 放到数轴上 | 同分数 | 符号正确 | `"<"` / `">"` / `"="` |
| `order`（扩到小数） | `{ items: decimal[3–5], direction, line?: true }` | 同分数 | 同分数 | 顺序正确 | `"0.5,0.45,0.54,0.405"` |
| `round-on-line`（新） | `{ value: decimal, to: 0 \| 1 \| 2, labels?: "ends" \| "hidden", then: inputSpec(decimal, places = to) }`；模型由引擎按 `value` 和 `to` 推出（两端 = 相邻两个保留位、`halfway: true`） | 第一段：点离 `value` 更近的那一端（端点是 44 px 按钮）；第二段：在托盘写四舍五入的结果 | 两端是 `radiogroup`，←→ + Enter；作答框照 X3 | 选的一端 = 正确近似值；`then` 值与位数都对（`same`） | 第一段 `"end:2.9"`；第二段 `"=3.0"` |
| `align-add`（新） | `{ op: "+" \| "−", a, b: decimal, start: "right" \| "left", then: inputSpec(decimal) }`；模型 `place-value{rows:[a, b]}` + 竖式 | 第一段：用 ◀ ▶（或拖）左右移第二行，直到两个小数点在同一竖线上（对上时那条竖线变 signal）；可点"补 0"把空位补成淡显的 0；第二段：写和 / 差 | ◀ ▶ 是两个按钮（Tab + Enter），也可 ←→ | 第一段 = 按小数点对齐；`then` 按值 | 第一段 `"align:right"`（停在右对齐）/ `"align:point"`；第二段 `"=4.65"` |
| `shift-digits`（新，桥） | `{ value: decimal, op: "×" \| "÷", by: 10 \| 100 \| 1000 }`；模型 `place-value{show:"digits"}` | 点 **◀ one place / 往左一位**、**▶ one place / 往右一位**，数字整体滑（小数点不动），空出的位自动出现淡显的 0，点"确定"后成实 0 | 两个按钮 + ←→ | 结果值 = `value` × 或 ÷ `by` | 结果值：`"30.7"` |
| `share`（A2 扩到小数） | `{ value: decimal, k: 2–9, then: inputSpec(decimal) }`；模型 `place-value{plates:k}` | 同 A2：从最高位起点一列的 **Share / 分**，剩下的点 **Trade / 换开** 换到右边一列；分到最后一位（必要时点"补 0"多开一位，≤ 三位小数） | 同 A2 | 每盘相等、垫上空、`then` 写对 | `"O:1,t:4"`（每盘）、`"=1.4"` |
| `regroup`（A2 扩到小数） | `{ value: decimal, start: {O, t, h, th}, then? }` | 同 A2：某列 ≥ 10 时出现 **Trade 10 for 1**；减法题反向（"拿 1 换 10"） | 同 A2 | 总值不变、每列 < 10、`then` 写对 | `"h>t"`、`"=0.13"` |
| `input`（加 `decimal` 写法） | 见 §3.7 | 托盘里一个框 + 数字键 + `.` 键 | 物理键盘 | 按值（缺省）或按 `places` | `"0.43"`、`"=0.43"`（多段） |
| `choose` | 选项 `value` 可以是小数；`model` 可以是 A6 任一种 | 同分数 | 同分数 | 同分数 | 选项 id |

`fraction` 的 `input`（`simplest` / `equivalent`）照旧，用于小数 → 分数，配 `work: { do: "to-fraction", of: "0.35" }`。

### 3.7 X3 `input` 的 `decimal` 写法与诊断上下文 `work`

```json
{ "answer": "1.75", "form": "decimal",
  "places": 1,                 // 可选：必须正好写 1 位小数（四舍五入、钱）；缺省按值判
  "unit": "dollar" | "km" | "m" | "cm" | "kg" | "g" | "l" | "ml",
  "work": { "do": "add" | "subtract" | "multiply" | "divide" | "round" | "convert" | "scale" | "to-fraction" | "to-decimal" | "compose" | "read",
            "a": "2.35", "b": "1.8",          // add / subtract / multiply（b 是整数）/ divide（b 是整数）
            "to": 1,                           // round
            "from": "km", "into": "m",         // convert
            "op": "×", "by": 100,              // scale
            "of": "0.35" | "3/4",              // to-fraction / to-decimal
            "parts": [ { "digit": 4, "place": "O" }, { "digit": 7, "place": "h" }, { "digit": 2, "place": "t" } ],   // compose（按题目说的顺序）
            "line": { "from": "0.2", "step": "0.01" }, "tick": 3 } }   // read：箭头在第几格
```

- `unit: "dollar"` 时框前印 `$`，`places` 缺省为 2（D8）；量的单位印在框后。
- 检查：`places` 缺省 → `eq`（`0.5` = `0.50`）；有 `places` → 值对且位数 = `places`，值对位数不够 → `places-short`（"差一步"）。
- `work` 只给诊断用，不显示；validate 检查 `work` 算出来等于 `answer`（防止题目数据自相矛盾）。

### 3.8 诊断规则（`lib/diagnose/decimals.ts`，纯函数，每条一个单测）

记号：`W(x)` 整数部分，`F(x)` 小数点后的数字串，`int(s)` 把数字串当整数，`c` 正确答案，`x` 孩子的答案（`Decimal`，带写法）；所有运算用 `lib/decimal.ts`。一条规则只在列出的题型 / `work` 下生效，且 `x ≠ c`。

| code | 题型 · 上下文 | 规则 |
|---|---|---|
| `longer-is-larger` | `compare`、`order`、`choose` | `W(a) = W(b)`、`a < b`、`F(a)` 比 `F(b)` 长且 `int(F(a)) > int(F(b))`，孩子判 `a > b`；`order`：孩子的顺序 = 按 (`W`, `int(F)`) 排的顺序 |
| `shorter-is-larger` | `compare`、`order`、`choose` | `W(a) = W(b)`、`a < b`、`F(a)` 比 `F(b)` 短，孩子判 `a > b`；`order`：孩子的顺序 = 先按 `W`、再按"小数位数少的大"、同位数按值排 |
| `trailing-zero-changes` | `compare`、`choose` | `eq(a, b)` 且 `a.dp ≠ b.dp`，孩子没选 `=` |
| `point-separator` | `work: add / subtract / multiply`；`input` 的 `0.9 + 0.1` 类 | `x` 的写法 = `(W(a) ∘ W(b))` + "." + `(int(F(a)) ∘ int(F(b)))`（乘：`W(a)·b` 与 `int(F(a))·b`）。例：2.35 + 1.8 → 3.43，0.4 × 3 → 0.12，0.9 + 0.1 → 0.10；`choose` 读法选项 |
| `zero-placeholder` | `work: compose / read`、`shade-decimal`、`place`、写数的 `input`；`work: convert` 只用于大单位 → 小单位 | `x` 的数字串 = `c` 的数字串**删去一个**夹在小数点与非零数字之间（或两个非零数字之间）的 0，或**多插一个** 0：0.07 → 0.7，4.035 → 4.35，0.03 → 0.3；换算（大 → 小）：`x` = 把 `a` 删去一个占位 0 后再换算（3.05 m → 350 cm）。小单位 → 大单位漏写的 0 归 `decimal-as-subunit` |
| `place-order` | `work: compose`、`place` | `x` = 按 `parts` 列出的顺序把数字依次写在小数点后（整数部分照写）；`place`：`x` = `target` 小数部分相邻两位对调 |
| `fraction-as-digits` | `work: to-decimal`、`to-fraction`、`choose` | to-decimal（`n/d`）：`x ∈ {0.n, 0.d, 0.nd, 0.dn}`；to-fraction（`0.f`）：`x = 1/int(f)` |
| `place-denominator` | `work: to-fraction`、`to-decimal` | to-fraction：`x = int(F)/10^k`，`k ≠ dp`（0.35 → {35/10}）；to-decimal（`d` 是 10 的幂）：`x = n / 10^k`，`10^k ≠ d`（{7/100} → 0.7） |
| `interval-misread` | `work: read` | `x = from + tick × step′`，`step′ = step × 10` 或 `step ÷ 10` |
| `tick-counting`（复用） | `place`、`work: read`（小数数轴） | `place`：`x = target − step`（把起点的刻度也数成一格）；`read`：`x = c + step` |
| `round-truncated` | `round-on-line`、`work: round`、`work: divide` + `places`（3.3） | `x = truncate(v, n)`，且下一位是 6–9（下一位是 5 归 `round-half-down`） |
| `round-carry-slip` | `round-on-line`、`work: round` | 保留位是 9 且要进一：`x` 的写法 = `truncate(v, n)` 去掉最后一位 + "10"（2.96 → "2.10"） |
| `places-short` | 有 `places` 的 `input`、`round-on-line` | `eq(x, c)` 且 `x.dp < places` |
| `round-wrong-place` | `round-on-line`、`work: round` | `x = round(v, m)`，`m ∈ {0, 1, 2, 3}`、`m ≠ n` |
| `round-chain` | 同上 | `x = round(round(v, n + 1), n)`，且 ≠ `round(v, n)`（要求 `v` 至少 `n + 2` 位） |
| `round-half-down` | 同上 | 下一位正好是 5（其后全 0 或没有），`x = truncate(v, n)` |
| `aligned-right` | `align-add`（第一段停在右对齐）、`work: add / subtract` | 第一段：`"align:right"`；值：`x = (int(a 去点) ± int(b 去点)) / 10^max(dp)`（3.4 + 1.25 → 1.59，7.25 − 1.5 → 7.10），结果须 ≥ 0 |
| `carry-not-added`（复用） | `work: add`、`work: multiply` | 在公共位数下把两数当整数，按位相加 / 乘，每位只留个位、不进位，再放回小数点（0.68 + 0.57 → 1.15；2.35 × 3 → 6.95） |
| `smaller-from-larger` | `work: subtract`、`align-add`（−） | 公共位数下每位取两个数字之差的绝对值（0.72 − 0.35 → 0.43；7.20 − 2.65 → 5.45） |
| `empty-place-brought-down` | `work: subtract`，`a.dp < b.dp` | `x = (a − truncate(b, a.dp)) + (b − truncate(b, a.dp))`（5 − 1.47 → 4.47；7.2 − 2.65 → 4.65） |
| `point-misplaced` | `work: multiply / divide`、钱的除法 | `x = c × 10^k`，`k ∈ {−3 … 3} \ {0}` |
| `zero-in-quotient`（复用） | `work: divide` | `x` 的数字串 = `c` 的数字串删去小数部分里一个后面跟着非零数字的 0（1.02 → 1.2，1.05 → 1.5） |
| `remainder-as-decimal` | `work: divide`（整数 ÷ 整数）、`choose` | `a = q·b + r`（`0 < r < b`），`x` 的写法 = `q` + "." + `r`（7 ÷ 4 → 1.3，10 ÷ 4 → 2.2） |
| `shift-wrong-way` | `shift-digits`、`work: scale / convert` | `x = a ÷ by`（题要 ×）或 `x = a × by`（题要 ÷）；convert 用进率 `f` 代替 `by` |
| `shift-count-wrong` | `shift-digits`、`work: scale` | `x = a × 10^m`（同方向），`10^m ≠ by` |
| `zero-appended` | `work: scale`（×）、`choose` | `a.dp > 0`，`x` 的写法 = `a` 的写法后面添 `log10(by)` 个 0（2.35 × 10 → "2.350"） |
| `decimal-as-subunit` | `work: convert`、钱 → 分 | 大 → 小：`x = W(a)·f + int(F(a))`（2.5 kg → 2005 g；$2.5 → 205 分）；小 → 大：`x` 的写法 = `⌊a/f⌋` + "." + `(a mod f)` 不补 0（4005 g → 4.5 kg）。若碰巧等于 `c`（1.25 m → 125 cm）不算 |
| `unit-factor-wrong` | `work: convert` | 方向对，`x = a × f′` 或 `a ÷ f′`，`f′ ∈ {10, 100, 1000} \ {f}` |

注册：`decimals.ts` 用 X6 的 `registerRule` 登记以上 25 条和 3 条复用码的小数规则；同一道题若两条规则同时命中（例：`point-separator` 与 `zero-placeholder` 都能解释同一个错答），按表中顺序取第一条，`check-pool` 报一个 warning，让出题人换数字。

### 3.9 X4 DECIMAL 卡与 X5 PLATE 行

**DECIMAL 卡**（右上）：
- 第一行大号数字，每一位下面一行小号位名（`ones · tenths · hundredths · thousandths` / `个位 · 十分位 · 百分位 · 千分位`），小数点画大；
- 第二行读法（"zero point two three five / 零点二三五"）；
- 第三行分数名 `{235/1000}`，展开后加展开式 `0.2 + 0.03 + 0.005`；
- 钱：`$2.35 · 2 dollars 35 cents · 235 cents`；四舍五入拍：`2.96 ≈ 3.0 · 1 decimal place`；量：`1.5 ℓ = 1500 ml`。
- 规则同 G3：讲解拍显示这一拍的值；**小测时只显示给定量**（涂了多少由 PLATE 显示孩子自己的状态，答案不先说）。

**PLATE 块**：

| 模型 | 行 |
|---|---|
| `decimal-grid` | MODEL HUNDRED GRID（或 TENTHS / THOUSAND）· WHOLES 2 · TENTHS 3 · HUNDREDTHS 5 · THOUSANDTHS — · SHADED 2.35 |
| `place-value` | MODEL PLACE VALUE · NUMBER 2.35 · TRADES 1 · SHIFT ×10 |
| `numberline`（decimal） | MODEL NUMBER LINE · RANGE 0–1 · STEP 0.1 · ZOOM ×100 · MARK 0.235 |
| `money` | MODEL MONEY · COINS 6 · TOTAL $2.35 |

### 3.10 单测与校验

- `tests/math-scene/decimal.test.ts`（§3.1 的必测项、parse 拒绝 `"1.2.3"` / `"-1"` / JSON 数、round 的 5 进位、`divWhole` exact 与否、`fromFraction` 只认分母因子 2、5）；`decimal-grid.test.ts`（涂的顺序、`runs` 守恒、放大镜位置）；`place-value.test.ts`（圆片数 = 值、`trade` 守恒、`shift` 后值 = × / ÷ 10ⁿ、竖式小数点对齐）；`numberline-zoom.test.ts`（每层是上一层的一段、刻度、`nearest`）；`diagnose-decimals.test.ts`（§3.8 每条至少两个正例、一个反例，复用码的小数规则各两例）；`decimals-lesson.test.ts`（每道题自证：解法通过、起点不通过、每个 `sample` 与错选项诊断正确；`limits`）。
- `validate.ts`：小数字段是字符串；拍的模型画得出（`runs` 合计 ≤ `wholes`，`level` 精度够，`zoom` 嵌套，圆片 ≤ 120）；`limits` 内；`work` 与 `answer` 一致；`round-on-line` 的 `then.places = to`；钱数是 5 分的倍数；分数 → 小数题的分母是 10 或 100 的因数（`to-decimal`）；桥步标了 `bridge`；裸写的时刻（X8）。

---

## 4. 名词表（`glossary.json`，13 个）

| id | EN | ZH | 定义要点（1–2 句 + 例子） |
|---|---|---|---|
| `decimal` | decimal | 小数 | 用小数点写的数，小数点后面是十分之一、百分之一、千分之一。0.35、2.4。 |
| `decimal-point` | decimal point | 小数点 | 写在个位后面的点，把整数部分和小于 1 的部分分开。2.35 里的点。 |
| `tenth` | tenth, tenths place | 十分之一、十分位 | 一个整体平均分成 10 份中的 1 份，写作 0.1；小数点后第一位是十分位。0.3 = {3/10}。 |
| `hundredth` | hundredth, hundredths place | 百分之一、百分位 | 一个整体平均分成 100 份中的 1 份，写作 0.01；小数点后第二位。0.07 = {7/100}。 |
| `thousandth` | thousandth, thousandths place | 千分之一、千分位 | 一个整体平均分成 1000 份中的 1 份，写作 0.001；小数点后第三位。0.235 里的 5。 |
| `place-value` | place value | 位值 | 数字所在的位决定它表示多少。4.035 里的 3 表示 3 个百分之一，0.03。 |
| `place-value-chart` | place value chart | 位值表 | 按位分列的表，个位右边接十分位、百分位、千分位。（大陆课本叫"数位顺序表"） |
| `decimal-places` | decimal places | 小数位数（一位小数、两位小数…） | 小数点后面有几位数字。2.35 有两位小数；"1 decimal place"也写作 "1 d.p."。 |
| `round-off` | round off, rounding | 四舍五入 | 取一个近似值：只看要保留那一位的下一位，满 5 进一，不满 5 舍去。2.96 四舍五入到一位小数是 3.0。 |
| `approximately` | is approximately, ≈ | 约等于、近似值 | 用 ≈ 表示"大约等于"。7 ÷ 3 ≈ 2.33。 |
| `trailing-zero` | zeros at the end | 末尾的 0 | 小数末尾添上或去掉 0，大小不变：0.5 = 0.50 = 0.500。（大陆课本叫"小数的基本性质"） |
| `dollars-and-cents` | dollars and cents | 元和分 | 100 分是 1 元，$2.35 是 2 元 35 分；10 分是 1 元的十分之一。 |
| `compound-unit` | compound units | 复合单位（复名数） | 用两个单位写的量，如 2 km 45 m；化成一个单位是 2045 m 或 2.045 km。 |

`remainder`、`quotient`、`regroup` 已在 docs/19 名词表；本课正文用到时 `<Term>` 指向本主题自己的 glossary，施工时从 docs/19 复制这三条（共 16 个）。

---

## 5. 来源（施工时进 `sources.json`，S#；访问日期 2026-10-17）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (implementation starting with 2021 Primary One Cohort; Updated Oct 2025). https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 课纲原文：第 31（P1 Money）、33（P2 Money）、34（P2 单位）、35（P3 Money）、36（P3 Measurement）、37（P4 Whole Numbers 1.5、1.6）、38（P4 Decimals 全部）、41（P5 Decimals、Fractions 1.2）、46（P5 Foundation）页；大观念第 11–12 页；第 30 页脚注 5 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | TIMSS 2015 Encyclopedia · Singapore: The Mathematics Curriculum in Primary and Lower Secondary Grades. https://timssandpirls.bc.edu/timss2015/encyclopedia/countries/singapore/the-mathematics-curriculum-in-primary-and-lower-secondary-grades/ | CPA 是新加坡数学的中心教学法 |
| S4 | Steinle, V., Stacey, K., & Chambers, D. (2006). *Teaching and Learning about Decimals* (Version 3.1) [CD-ROM / website]. University of Melbourne. https://extranet.education.unimelb.edu.au/SME/TNMY/Decimals/ （参考文献页 …/Decimals/backinfo/refs.htm） | 误解分类：longer-is-larger、shorter-is-larger、"money thinking"、0.3 = {1/3} 一类的 reciprocal / denominator-focused 想法 |
| S5 | Stacey, K., & Steinle, V. (1998). Refining the classification of students' interpretations of decimal notation. *Hiroshima Journal of Mathematics Education*, 6, 49–69 | 比较测验的题型与分类；占位 0 |
| S6 | Resnick, L. B., Nesher, P., Leonard, F., Magone, M., Omanson, S., & Peled, I. (1989). Conceptual bases of arithmetic errors: The case of decimal fractions. *Journal for Research in Mathematics Education*, 20(1), 8–27 | "整数规则""分数规则"；0.5 与 0.50；化分数的位 |
| S7 | Sackur-Grisvard, C., & Léonard, F. (1985). Intermediate cognitive organizations in the process of learning a mathematical concept: The order of positive decimal numbers. *Cognition and Instruction*, 2(2), 157–174 | 比较与排序的中间规则 |
| S8 | Irwin, K. C. (2001). Using everyday knowledge of decimals to enhance understanding. *JRME*, 32(4), 399–420 | 钱、量等日常情境对小数理解的作用（第 01、15 步的依据），也有"小数部分当小单位"的例子 |
| S9 | Hiebert, J., & Wearne, D. (1985). A model of students' decimal computation procedures. *Cognition and Instruction*, 2(3–4), 175–205 | 竖式对齐、小数点放置、"两边各算各的" |
| S10 | Durkin, K., & Rittle-Johnson, B. (2012). The effectiveness of using incorrect examples to support learning about decimal magnitude. *Learning and Instruction*, 22(3), 206–214 | 正面讲错例（拍表 ⚑ 的做法）；数轴上的小数大小 |
| S11 | Moloney, K., & Stacey, K. (1997). Changes with age in students' conceptions of decimal notation. *Mathematics Education Research Journal*, 9(1), 25–38 | shorter-is-larger 随年龄的变化 |
| S12 | Siegler, R., Carpenter, T., Fennell, F., Geary, D., Lewis, J., Okamoto, Y., Thompson, L., & Wray, J. (2010). *Developing Effective Fractions Instruction for Kindergarten Through 8th Grade* (NCEE 2010-4039). IES, U.S. Department of Education. https://ies.ed.gov/ncee/wwc/PracticeGuide/15 | 数轴作为分数与小数的中心表示；小数与分数的联系 |
| S13 | Common Core Standards Writing Team (2015). *Progressions for the Common Core State Standards in Mathematics: K–5, Number and Operations in Base Ten*. Tucson: Institute for Mathematics and Education, University of Arizona. （URL 施工时从 https://www.math.arizona.edu/~ime/progressions/ 取，**待核**） | 小数位值、× ÷ 10 的幂是"移位"、四舍五入用数轴、估算定小数点 |
| S14 | Common Core Standards Writing Team (2013). *Progressions: Number and Operations — Fractions, 3–5*. 同上（**待核**） | 十分之一、百分之一作为分数（0.3 = 0.30 = {30/100}） |
| S15 | Ashlock, R. B. (2010). *Error Patterns in Computation: Using Error Patterns to Help Each Student Learn* (10th ed.). Boston: Allyn & Bacon | 竖式的典型错误：右对齐、不退位、空位落下、四舍五入的进一 |
| S16 | Roche, A. (2005). Longer is larger — or is it? *Australian Primary Mathematics Classroom*, 10(3), 11–16 | 课堂里的 longer-is-larger 与百格的用法 |
| S17 | 教材系列（只作顺序参考，不照抄）：Marshall Cavendish *My Pals Are Here! Maths*（3rd ed.）P4；*Shaping Maths* P4。MOE 批准教材目录 https://www.moe.gov.sg/education-in-sg/approved-textbook-list | 课步顺序；D9 读法、"3.0"写法（**待核**） |
| S18 | Monetary Authority of Singapore (2013). MAS launches the Singapore Third Series commemorative coin sets（media release）. https://www.mas.gov.sg/news/media-releases/2013/mas-launches-the-singapore-third-series-commemorative-coin-sets | 现行硬币面额 5¢、10¢、20¢、50¢、$1 |
| S19 | 1 分硬币 2002 年停止流通的说法：来自二手（钱币商目录），施工时找 MAS 原文（**待核**）；纸币面额同 MAS currency 页面（**待核**） | `money` 模型不画 1 分硬币的依据 |
| S20 | National Physical Fitness Award — Wikipedia. https://en.wikipedia.org/wiki/National_Physical_Fitness_Award ；学校 NAPFA 标准（例：大众小学 NAPFA Standards Pri, https://www.dazhongpri.moe.edu.sg/files/NAPFA%20STANDARDS%20Pri%20(%20from%202006)_with%20Performance%20Band.pdf） | 小学生 NAPFA 跑步 1.6 km，中学及以上 2.4 km（D13）；施工时换成 MOE / SportSG 原文（**待核**） |

事实纪律同 docs/15 §6.2：课纲逐字、注页码；误解的出处写进 `sources.json` 的 `note`；题干不需要来源；情境里的数字（价格、雨量）是虚构的，不说成实测。

---

## 6. 图像清单（给 Codex）

风格一律照 `scripts/illustrate.ts` 的 `STYLE_BRIEF`（石墨铅笔、19 世纪科学图版、无色、无文字、透明底）。章节配图 4:3（`illustrate.ts figure`，生成时把 brief 里的 "1024x1024 square canvas" 换成 "4:3 landscape canvas, 1536x1152"）。

### 6.1 首页图：**已做**

静物：一把尺、读数 0.125 的厨房秤、一个量杯、一枚素面硬币（主会话已生成，入库路径 `public/illustrations/decimals.webp`，施工 0 阶段确认文件在、`topic.yaml` 的 `illustration: decimals`）。

### 6.2 章节配图（可选，3 张）

| id | 章 | 用途（一句话） | SUBJECT（英文，原样交给 Codex） |
|---|---|---|---|
| `figures/decimals-coin-tray` | 01 `dollars-and-cents` | 钱是小数的入口：零钱按面额分格放 | a small wooden cash tray on a Singapore hawker drinks stall counter seen from slightly above, with separate compartments holding stacks of plain round coins of four different sizes, one compartment empty, a folded paper note tucked under a clip at the back, a plastic cup of iced drink with a straw standing beside the tray; the coins are plain discs with milled edges and no designs, numerals or lettering; drawn as a specimen plate, no people, no text |
| `figures/decimals-ruler-lens` | 04 `thousandths` | "放大再放大"：放大镜下的刻度 | a steel ruler lying flat with only fine unnumbered tick marks, a round magnifying glass held just above it so that the lens shows the space between two long tick marks greatly enlarged with ten finer ticks inside, the handle of the magnifier resting on a sheet of squared paper; drawn as an engineering plate, no hands, no numbers, no text |
| `figures/decimals-four-cups` | 12 `dividing-decimals` | 平均分：一瓶水倒进四个杯子 | a 1.5-litre plastic water bottle without any label tilted over the last of four identical clear cups standing in a row, the first three cups already filled to exactly the same level, a thin stream of water falling into the fourth, on a plain kitchen table; drawn as a specimen plate, no people, no text, no markings on the bottle or cups |

用法：`<Figure src="figures/decimals-…" alt={{…}} caption={{…}} />` 放在本章正文第一段之后；alt 与 caption 双语，validate 检查文件存在。主会话审图：硬币不能出现可辨认的真实币面图案；尺上不能出现数字。

---

## 7. 施工顺序与分工（照 skill `build-order.md`；依赖由主会话预装，本课**不需要新依赖**；子代理不改 `package.json`、不提交）

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | 建 `src/content/topics/decimals/{chapters,data}`、`topic.yaml`（`engine: math-scene`、`stage: svg`、`mode: lesson`、`status: draft`、`illustration: decimals`）；确认首页图入库 | `topic.yaml` | docs/19 E0（G1–G12）与 E1（A1、A2：`share`、`regroup`、`ColumnWorking`、整数数轴）已合 | S |
| 1 | E-dec（Opus） | X1–X11、A6a–A6d、`shade-decimal` / `round-on-line` / `align-add` / `shift-digits`、`place` / `compare` / `order` / `share` / `regroup` 的小数扩展、`decimal` 写法、DECIMAL 卡、PLATE 行、小数域诊断与一码多规则、`words.ts` 的小数与钱读法、单测、docs/06「MathScene」 | `lib/decimal.ts`、`lib/diagnose/{decimals,index}.ts`、`stage/{DecimalGrid,PlaceValueChart,MoneyModel}.tsx`、`stage/NumberLine.tsx`（小数 + 放大分支）、`stage/ColumnWorking.tsx`（小数点对齐）、`tray/inputs/DecimalInput.tsx`、`tray/{AlignControls,ShiftControls,RoundControls}.tsx`、`hud/cards/DecimalCard.tsx`、`lib/value.ts`（X2）、`schema.ts`、`validate.ts`、`src/lib/{rich-text,frac-glue}.ts`、`lib/words.ts`、`scripts/math/check-pool.ts`、`tests/math-scene/{decimal,decimal-grid,place-value,numberline-zoom,diagnose-decimals}.test.ts`、docs/06 | 0 | L（约 1.5 天） |
| 2 | L（Opus） | `lesson.json`：`syllabus`（§1.1 原文，id 如 `p4-dec-notation`、`p4-dec-rounding`、`p5-dec-scale`）、15 步 × 4–5 拍（69 拍，按 §2.2）、`keyFacts`、`limits`、`views`、每步 1–2 道样板题、练习 8 题；`pnpm shoot decimals --beats` 逐张看 | `data/lesson.json` | 1 | M |
| 3 | Codex（批量，≤ 4 条并行，`< /dev/null`） | 每步题库其余 7–9 道（brief 照 `references/codex-pool-brief.md` 改：A6 的写法、本课的 `kind` 与 `sample` 记号、`work` 上下文、`limits`、§2.1 的 code、"小数一律写字符串"），每份草稿 `check-pool --topic decimals --step <id>` 到 0 错；15 章英文正文初稿（`codex-text-brief.md`） | `scripts/math/drafts/`（不进 git） | 2 | M（约 120 道 + 15 章） |
| 4 | T（Claude，Opus） | 合并题库（审题意、删超纲：分数 → 小数的分母、× ÷ 的位数；改中文）；定稿英文正文；**写中文正文**（15 章 + 00 + 练习章，ZH 400–550 字；"小数点后一位一位地读""按小数点对齐""满 5 进一"三句全课一致）；名词表、`sources.json`、`SOURCES.md`；配图 alt / caption | `data/{lesson,glossary,sources}.json`、`data/SOURCES.md`、`chapters/*.mdx` | 3 | M |
| 4′ | 主会话 + Codex | §6.2 三张配图（可与 2–4 并行），主会话审图 | `public/illustrations/figures/decimals-*` | 0 | S |
| 5 | P（Sonnet） | 布局、键盘、读屏、两套主题、手机；`pnpm shoot decimals --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`；`tests-e2e/decimals.spec.ts`（点刻度换拍；`shade-decimal` 点按 / 纯键盘 / 手机按条；`place` 两层放大与 Esc 收起；`round-on-line` 两段；`align-add` 移行与补 0；`share` 换开；错 → 诊断 → 看答案；再来一道；跳过；练习总结；zh；390 × 844）；朗读抽查（小数、钱、≈、`…`） | `tests-e2e/decimals.spec.ts`、`docs/screenshots/decimals/` | 4 | M |
| 6 | 主会话 | `acceptance.md` 全勾、门槛全绿、截图归档、本文 §9 记录、`git commit`；push 等 Gavin | — | 5 | S |

**文件归属的边界**：E-dec 动的 `schema.ts`、`validate.ts`、`NumberLine.tsx`、`ColumnWorking.tsx`、`value.ts`、`words.ts`、`rich-text.ts` 是 E0 / E1 刚改过的共享文件，所以 E-dec **必须在 E0、E1 合进 main 之后**开工，且同一时间没有别的引擎代理改 MathScene；L 只动 `data/lesson.json`；T 只动 `chapters/` 与 `data/` 的其余文件；P 只动 e2e 与截图（发现引擎问题写给主会话，不自己改引擎）。

估算：E-dec 约 1.5 天；本课内容（拍 + 题库 + 正文 + QA）约 2.5 天。

---

## 8. 验收

照 skill `references/acceptance.md` 全部打勾（门槛、讲解优先、HUD 铁律、内容与事实、截图存档），另加本课的：

- [ ] UI 里任何地方都不出现年级（P2–P5 / 小二–小五）：章节轴、阅读面板眉题、本章索引、00 章与练习章正文、右上卡；`grep -n "P[1-6]\b\|[一二三四五六]年级\|小[一二三四五六]" src/content/topics/decimals/chapters/` 为空；第 14、15 步章头只有 "Going further / 再往前一步"
- [ ] **没有浮点**：`grep -n "parseFloat\|toFixed\|toPrecision" src/engines/math-scene/lib/decimal.ts src/engines/math-scene/lib/diagnose/decimals.ts` 为空；`decimal.test.ts` 的 `0.1 + 0.2 = 0.3`、`1.005 → 1.01`、`2.96 → 3.0` 通过；`lesson.json` 里没有 JSON 数形式的小数（validate）
- [ ] 每步的数字在 `limits` 内（validate 与 `decimals-lesson.test` 证明）：加减 ≤ 两位小数；× ÷ 一位数的被乘 / 被除数 ≤ 两位小数；分数 → 小数的分母都是 10 或 100 的因数；钱数是 5 分的倍数；桥之外没有 × ÷ 10 / 100 / 1000 和单位换算
- [ ] §2.1 每个 code（含复用码）至少一拍正面讲（拍表的 ⚑），且至少一道题库题能诊断它；`check-pool` 无"两条规则同时命中"的 warning
- [ ] 百格的涂色与值一致：`pnpm shoot --beats` 每一拍的 PLATE `SHADED` = 算式里的值；放大镜只出现在"涂到一半的那一格"
- [ ] 数轴放大：每层是上一层的一段，引线连对端点；第 04 步第 4 拍三条线的刻度值都对
- [ ] 位值表：`slide` 时小数点不动（截图前后小数点像素位置相同）；竖式的小数点在同一竖线上；圆片与竖式每一位一一对应高亮
- [ ] 四舍五入题的答案按位数判（`3` 不算 `3.0`，走 `places-short` 的"差一步"口吻）；其余题 `0.5` 与 `0.50` 都算对
- [ ] 朗读：字幕与题目里的 `0.235`、`34.506`、`$2.35`、`$0.35`、`≈`、`0.666…` 在 EN / ZH 下读对（`words.test.ts` + 演示抽查）；正文与数据里没有裸写的时刻
- [ ] 情境：无品牌；价格只作简单的数，不说"现在多少钱"；小学生跑步是 1.6 km；同一物体在全课 ≤ 3 次；人名多族群、拼写保留
- [ ] `money` 模型没有真实币面图案、没有 1 分硬币；配图里硬币、尺子、瓶子都没有字
- [ ] 截图：第 01、04、08、12 章 + 练习章与一道小测，1920 × 1080、1280 × 720、390 × 844（paper；外加一张 cinema、一张 zh）

## 9. 施工记录 / 已知差距

### 9.1 引擎（E-dec：X1–X11 与 A6a–A6d，2026-10-18；课的内容未施工）

- **X1 值** `lib/decimal.ts`：`{ units, dp }`（百万分之一的整数 + 写出的位数），逐位解析，`eq` / `same` / `cmp` / `add` / `sub` / `mulWhole` / `divWhole`（长除法）/ `round`（满 5 进一，2.96 → 3.0）/ `truncate` / `scale` / `digitAt` / `toFraction` / `fromFraction`；`tests/math-scene/decimal.test.ts` 有 §3.1 的必测项（`0.1 + 0.2 = 0.3`、`1.005 → 1.01`、`2.96 → 3.0`、`0.65 → 0.7`、`1.5 ÷ 4 = 0.375` exact、`2 ÷ 3` 不 exact 且 `round(…, 2) = 0.67`、`2.35 × 1000`、`4.8 ÷ 100`），并用 grep 查 `decimal.ts`、`diagnose/decimals.ts` 里没有 `parseFloat` / `toFixed` / `toPrecision` / `Number(text)`。zod 转换器 `decimal`（带点的 JSON 数报 "write decimals as strings"）、`numValue`（分数或小数）、`answerValue` 带点识别为 `{ kind: 'dec' }`。
- **X2** `Measure.value` 改成 `Decimal`，单位加 `km` `g` `kg` `l`（ℓ）`ml`；方格课照旧（整数）。
- **X3** `decimal` 写法（`tray/inputs/DecimalInput.tsx`）：一个框 + 点键，`places`、`unit`（`dollar` 框前 `$`，量与 `work` 换算的单位印在框后）、`work`（诊断上下文，validate 查它算出来 = `answer`）；`places-short` 是"差一步"（`near`，同 `not-simplest`，控制器的 near 分支按 code 取反馈）；托盘进入写数一段的提示用新的"对。现在把数写出来。"（分数课的"写成分数"不动）。
- **X4 / X5** DECIMAL 卡（`hud/cards/DecimalCard.tsx`）与四种 PLATE 行（`hud/plate.ts decimalPlateRows`）。
- **X6 误解** `lib/diagnose/decimals.ts`：§2.1 的 25 个码 + 三个复用码的小数规则，每条 ≥ 2 正例 1 反例（`tests/math-scene/diagnose-decimals.test.ts`）。**注册表的做法**：E0 的注册表是"按域列码"（`MISCONCEPTION_DOMAINS`）+ 每个域一个规则文件，没有 `registerRule`；本课按 D10 的首选做了"一码多域"：`MISCONCEPTION_DOMAINS.decimals = [...DECIMAL_CODES, ...DECIMAL_SHARED_CODES]`（`tick-counting`、`carry-not-added`、`zero-in-quotient`、`not-simplest`），码只在老家域登记一次（`MISCONCEPTIONS` 无重复，zod enum 不变），**一个码的规则是列出它的各域规则之并，一道题按它自己的域诊断**（小数题 → `decimals.ts`）。validate 的"跨域"检查按域名单查，自然认这四个码；"诊断得了吗"按题型 / `work` 查（`validate-decimals.ts undiagnosable`）。没有退回 `decimal-carry-dropped` 一类的新码。
- **X7 过渡** `zoom`、`slide`、`align`、`round`（≤ 900 ms，减少动态时淡入）。
- **X8** 裸写的小数与钱是不拆行的值，朗读逐位（"zero point three five" /「零点三五」）、钱（"2 dollars 35 cents" /「2 元 35 分」）、`≈`（"is about" /「约等于」）、`0.666…`（", and so on" /「，一直下去」）；validate 拦裸写的时刻 `\d{1,2}.\d{2} am|pm`（`sample` 字段不查：那是作答写法）。
- **X9** `limits` 加 `dp`、`resultDp`、`factor`、`denominators`、`roundTo`、`by`、`multiples`、`units`、`money`、`zoomDepth`（`maxValue` 沿用）；`check-pool` 另报"一个错例两条规则都命中"的 warning（§3.8：按声明顺序取第一条，所有域通用）。
- **X10** VIEW 加 `decimal-grid`、`place-value`、`money`；比较两个小数的题在并排百格 / 位值表对齐 / 一条数轴之间切换（`lib/decimal-views.ts`）。
- **X11** 每个新题型和扩到小数的题型都有 `solve` / `sampleState` / `proveTask`、`goToTask`、`shoot --tasks` 三张、键盘路径；docs/06「MathScene · 小数」。
- **A6** 百格 / 千格（放大镜）`stage/DecimalGrid.tsx` + `lib/dgrid.ts`；位值表（圆片、竖式小数点对齐、`slide`）`stage/PlaceValueChart.tsx` + `stage/DecimalColumn.tsx` + `lib/placevalue.ts`；小数数轴（两层放大、四舍五入的两端与中点、双刻度）`stage/DecimalLine.tsx` + `lib/dline.ts`；钱（素面硬币与纸币，按位三列）`stage/MoneyModel.tsx` + `lib/money.ts`。题型状态 / 检查 / 解法 / 错例集中在 `lib/decimal-tasks.ts`，算式行在 `lib/decimal-working.ts`，规则在 `validate-decimals.ts`。
- **示例主题** `sample-lesson-decimal`（draft，占位数据）：四步 37 道，每个模型、过渡、题型、写法各一次；`tests/math-scene/{decimal,decimal-models,diagnose-decimals,sample-lesson-decimal}.test.ts`。截图：1920 × 1080 下百格边长约 460 px（舞台高的 43 %），位值表 250–370 px，钱按位三列约 300–560 px；390 × 844 托盘打开时都放得下（百格约 155 px，小格 15 px，按条按钮和步进器操作）。
- **与钟面 / 时间线合并**（main 2f70a01，docs/20 A3）：两边的注册都留着——题型 28 种（`read-clock` `set-clock` `duration` 与本课四种）、模型联合（`clock` `timeline` 与 `decimal-grid` `place-value` `money`，小数数轴仍按 `scale: "decimal"` 分流）、`limits`（`sameDay` 与小数各键）、右上卡（TIME 带节拍时刻、DECIMAL）、讲解背景章（小数课的百格优先，其次钟面）；数位块的 `regroup` 值在小数时不参与"有百位"的判断。

### 9.2 与本文 §3 不同的地方

1. **`round-on-line` 的模型照写**（`numberline` 从下邻到上邻、`step` = 10^-(to+1)、`marks: [value]`、`halfway`），不由引擎推；validate 查两端正是相邻两个保留位、`then.places = to`。
2. **`share` / `regroup` 的 sample** 写动作序列（`"O,O>t,t"`、`"h>t"`），同 docs/19 §9.2；`regroup` 多一个可选的 `goal`（减法前"1 个十分之一换 10 个百分之一"之后的样子）。
3. **`compare.align`** 只有 `"point"`（按钮把两数按小数点竖排补 0）；并排百格、数轴用 VIEW 组切换，不做 `grid` / `line` 两个按钮。
4. **`order.line: true`**：模型必须是小数数轴，做完（或看答案）后把各数画成标记；排序过程中不显示位置（否则等于给答案）。
5. **竖式 `column.show`** 只有 `none` / `all`（小数竖式不分步写）。
6. **数轴标记** §3.4 写"落在最深一层的刻度上"，放宽为"在线上"：四舍五入拍的 3.447 在 3.4–3.5（每格 0.01）的两刻度之间。
7. **`money.note`** 只加读屏文字（$10 的缺省拆法本来就是一张 $10 纸币）。
8. **DECIMAL 卡在小测里**只给给定的数（算式带 `?`）和读法，不画位名格子：位名把"0.06 在百分位"直接告诉了孩子，等于提示 `zero-placeholder` 的答案。
9. **作答框**整数部分最多 5 位、小数部分最多 6 位（99 999.999999）：§3.8 例子里 `750 ml = ? ℓ` 的错例 `"750000"` 写不进框，出题换小一点的数（`75 ml → 75000`）。
10. **`{u:1.5 l}` 的朗读**用逐位读法（"one point five litres"），不是 "1.5 litres"。
11. `tests-e2e/decimals.spec.ts` 没有写：§7 把它分给阶段 5（P），等课的内容有了再写。

### 9.3 给课的作者（阶段 2–4）

- 小数一律写字符串；整数可写 JSON 数。每道写小数的 `input` 都给 `work`（诊断全靠它；只是"写出这个数"的题可以不给）；钱写 `unit: "dollar"`（缺省两位，`$1.6` 走 `places-short`）。
- 题型要点：`shade-decimal` 的模型是同 `level` 的空百格（`start` 是锁定的给定量）；`place` 带 `zoom` 时数轴本身不画 `zoom` / `marks` / `arrow`，目标要落在第 `zoom` 层的刻度上；`align-add` 的两个数位数不同，`start: "left"` 不能一开始就对齐；`shift-digits` 的结果在千位到千分位之间（`3.07 × 100` 往右错移得 0.0307 出了表，`shift-wrong-way` 的错例要能画在表上，样例用 `3.7 × 100`）；小数 `share` 的商三位以内除尽，模型 `place-value` 的 `plates = k`。
- 比较题在步的 `views` 里写 `["decimal-grid", "place-value", "numberline"]`，引擎只给画得出的。
- 错例写法：`shade-decimal` / `place` / `shift-digits` 写值（`"0.6"`），`round-on-line` 第一段 `"end:2.9"`、第二段 `"=3.0"`，`align-add` `"align:right"` / `"=4.65"`，`choose` 写选项 id，小数框照孩子写的（`"0.10"` 保留）。`pnpm tsx scripts/math/check-pool.ts <draft> --topic decimals --step <id>` 到 0 错，看一眼 WARN（两条规则同时命中时换数字）。
