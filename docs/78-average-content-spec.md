# 78 · 平均数 · 内容 spec（`average`，MathScene 课；v1 草案，待 Gavin 定稿）

Gavin 2026-11-15 选定的四节新课之一（另三节：docs/76 `angles`、docs/77 `graphs`、docs/79 `symmetry`）。docs/17 §2.6 的 `average` 一行（"把高低不齐的条削峰填谷摊平"）与 §7 **A7 图表模型**。2026-11-15 起草，**只出 spec，不施工、不建目录、不提交**。照 skill `.claude/skills/atlas-lesson-topic/` 写；本课小（S–M），布局照 docs/21、docs/29，引擎**建在 docs/77 的 `chart` 模型上**。

记号同 docs/21：EN 口吻草稿、ZH Claude 草稿。S1 = MOE *Mathematics Syllabus Primary One to Six*（2021 P1 cohort，Updated Oct 2025），起草时用 `pdftotext -layout` 逐页抄录，页码是页脚 "Page | N"。

**年级更正**：brief 写"P5 average"。S1 第 44 页，平均数在 **P6** STATISTICS · SUB-STRAND: DATA ANALYSIS「1. Average of a Set of Data」；P5 没有任何统计条目（docs/17 §2.5–2.6 已写对）。女儿 2030 年才在学校学到，本课是提前给的。

---

## 0. 决定

| # | 决定 | 建议 |
|---|---|---|
| D1 | **对象**：P6「1. Average of a Set of Data」1.1–1.2 全部（第 01–05 步）。地基：P2–P3 的除法（等分）、P4 整数除以整数商是小数（S1 第 38 页 3.2）、docs/77 的条形图 | 同意 |
| D2 | **课的形状**同分数改版后；练习 7 道；背景章 00 | 同意 |
| D3 | **UI 不出现年级**；不标 bridge（整课一个年级） | 同意 |
| D4 | **关键画面"削峰填谷"**：高低不齐的方块塔，从高的搬到矮的，直到一样高；那个高度就是平均数；总数不变。之后才出现"总数 ÷ 个数"，并且同一拍里两种做法给出同一个数（第 02 步第 2 拍） | 同意 |
| D5 | **模型**：复用 docs/77 的 A7 `chart`（条形图）+ 本课加 `stack`（条画成一块一块的单位方块）、`mean`（平均线，墨色虚线）、`ghost`（未知的条画成虚线框）、过渡 `level`（方块从高塔飞到矮塔）、`pool`（全部叠成一座塔，再平分）；复用现有 `barmodel`（第 03 步：几段一样长的条 = 平均 × 个数） | 同意 |
| D6 | **新小测** `even-out`（在方块塔之间搬方块直到一样高，再写平均数）；其余 `input`、`choose` | 同意 |
| D7 | **误解域**：并进 docs/77 的 `data` 域（同一个 `lib/diagnose/data.ts`），本课加 6 个码 + 复用整数运算域的 `remainder-dropped`（7.5 写成 7）（§2.1） | 同意 |
| D8 | **数字**：2–6 个数据；数据 ≤ 100（钱 ≤ $50）；平均数是整数、.5，或钱（分是 5 的倍数）；不出循环小数，不要求四舍五入（P6 课纲没写；题目都选得除得尽） | 同意 |
| D9 | **情境**：贴纸、储蓄、米袋的质量、一周读的书、豆苗高度、跳绳次数、测验分数（只出现在练习一题，口吻中性，不排名）；人名多族群；无品牌 | 同意 |
| D10 | **步数**：5 个课步 + 练习 + 00。拍 21 个 ≈ 7 min，小测 5 道 ≈ 3.5 min，练习 7 道 ≈ 5 min：**约 16 分钟** | 同意 |
| D11 | **图**：封面 + 1 张配图（§6），用 `art/planned/average/` 的候选，按 §6 重审 | 同意 |

### 0.1 需要 Gavin 看的（每条有默认值）

| # | 问题 | 选项 | 默认 |
|---|---|---|---|
| Q1 | **"削峰填谷"的中文说法** | (a) 正文用大陆课本的"移多补少"，字幕第一次出现时说"把多的移给少的"；(b) 用"削峰填谷"；(c) 两个都出现 | **(a)**："移多补少"是小学课本的说法（人教版"平均数"一课），"削峰填谷"更像成语、偏书面；新加坡华文用哪个**待核** |
| Q2 | **平均数可以是小数**（7.5）：课纲 P6 没说，但 P4 已学"整数除以整数商是小数" | (a) 第 02 步第 5 拍讲，题库 2 道；(b) 只用整数 | **(a)**：孩子会问"平均 7.5 本书是什么意思"，正好讲"平均数不一定是其中一个数" |
| Q3 | **测验分数作情境** | (a) 只在练习一题，不比人；(b) 不用 | **(a)**：这是新加坡试卷最常见的情境；全课不出"谁考得好" |
| Q4 | **配图 `average-level-water.png`（三个连通的水杯，水面一样高）** | (a) 不用；(b) 放第 01 章 `<More>` | **(a)**：连通器的水面相平是物理现象，与"杯子不一样粗时平均怎么算"会搞混；只用方块图 |
| Q5 | **封面与 docs/77 封面都是木方块塔**（这里 2、4、6，那里 2、4、3），首页上两张相像 | (a) 照用，同属统计；(b) 本课封面换成"三座塔已摊平成 4、4、4"那张（`average-equal-stacks.png`），候选的 2、4、6 那张移到第 01 章 | **(b)**：首页上一眼分得开；"摊平之后"也正是本课要的结果 |

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字）

| 级 | 子线 · 条目 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|---|
| P2（地基） | Whole Numbers · 3. Multiplication and Division | "3.2 use of ÷" · "3.3 relationship between multiplication and division" | 33 | "你已经知道的"：平分；乘除互逆（第 03 步） |
| P4（地基） | Decimals · 3. Multiplication and Division | "3.2 dividing a whole number by a whole number with quotient as a decimal" | 38 | 第 02 步第 5 拍（Q2） |
| P3–P4（地基） | Statistics · Bar Graphs / Tables | "reading and interpreting data from bar graphs" · "completing a table from given data" | 36、40 | 条形图、表格（docs/77） |
| **P6** | Statistics · DATA ANALYSIS · 1. Average of a Set of Data | "1.1 average as 'total value ÷ number of data'" · "1.2 relationship between average, total value and number of data" | 44 | 第 01–05 步 |

核对要点：
- **平均数在 P6**（第 44 页）。P5 无统计。
- 1.1 原文里的 "÷" 在 `pdftotext` 输出里是一个丢了字形的空位（"total value  number of data"）；按上下文是除号，**施工时打开第 44 页看一眼原图核对**。
- 课纲用 "total value" 和 "number of data"；本课 EN 正文用 "total" 和 "number of items"（孩子读得懂），名词表注课纲原词。

### 1.2 级别、步数与时间

- 5 个课步 + 练习 + 00；全部 P6（地基 P2–P4）。
- 拍 21 个（≈ 7 min），小测 5 道（≈ 3.5 min），练习 7 道（≈ 5 min）：**约 16 分钟**。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字（`limits`） |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | chart（标本） | — | — | — |
| 01 | `evening-out` | Even them out | 移多补少 | P6 1.1 | chart（`stack`、`level`、`mean`） | 4 | 8 · even-out / input / choose | 2–5 座塔，每座 ≤ 10 块，总数能平分 |
| 02 | `total-divided` | Total ÷ number of items | 总数 ÷ 个数 | P6 1.1 | chart（`pool`）· bar | 5 | 10 · input / choose | 2–6 个数，≤ 100；平均是整数或 .5 |
| 03 | `average-total-number` | Average, total and number | 平均数、总数和个数 | P6 1.2 | barmodel · chart | 4 | 9 · input / choose | 总数 ≤ 600 |
| 04 | `missing-value` | Finding a missing value | 求缺的那个数 | P6 1.2 | chart（`ghost`、`mean`） | 4 | 9 · input / choose | 3–5 个数，缺 1 个 |
| 05 | `changing-the-average` | When an item joins or leaves | 多一个、少一个 | P6 1.2 | chart · barmodel | 4 | 9 · input / choose | 加入或离开 1 个 |
| 06 | `practice` | Practice | 练习 | — | 按题 | — | 7 道固定题 | — |

### 1.4 不在本课

- 中位数、众数（不在小学课纲）；加权平均；"平均速度"（2021 课纲无 speed）。
- 平均数的四舍五入、循环小数（D8）。
- 用平均数比较两组数据的好坏（不排名，D9）。

### 1.5 和别的主题怎么接（不重复讲）

| 主题 | 接在哪 | 本课怎么用 | 不在本课重复的 |
|---|---|---|---|
| `graphs`（docs/77） | 条形图、读条、`chart` 模型 | 本课全部舞台都是 `chart` 条形图；读条不再讲，第 02 步第 3 拍直接给数 | 刻度、读图 |
| `multiplication-division` | 等分、乘除互逆 | "平分"= 第 02 步；"总数 = 平均 × 个数"= 乘除互逆（第 03 步） | 乘除算法 |
| `decimals` | 整数除以整数商是小数 | 第 02 步第 5 拍 15 ÷ 2 = 7.5；钱写两位（$4.50） | 小数位值 |
| `fractions` | 平分 | 不用分数写平均数（P6 课纲写 ÷） | — |
| `measuring` | 质量、长度的单位 | 情境题带单位（kg、cm、$） | 读秤 |

---

## 2. 课的设计

### 2.0 写法约定

- **固定说法**：
  - EN "Move from the tall ones to the short ones until they are all the same." / ZH "把多的移给少的，直到一样多。"
  - EN "The average is the total shared equally among all the items." / ZH "平均数是把总数平均分给每一个。"
  - EN "Average = total ÷ number of items. Total = average × number of items." / ZH "平均数 = 总数 ÷ 个数；总数 = 平均数 × 个数。"
  - EN "Nothing is added or taken away, so the total stays the same." / ZH "没有多也没有少，总数不变。"
- 颜色：数据的方块 = cold；被搬动的方块 = signal；平均线 = 墨色虚线（唯一一条，读作 "average / 平均"）；未知的条 = signal 虚线框 "?"；新加入 / 离开的一项 = hot。不用红绿。
- 算式：`2 + 4 + 6 = 12`、`12 ÷ 3 = 4`、`4 × 6 = 24`、`24 − 16 = 8`；带单位时跟数据走。

### 2.1 误解目录（并入 docs/77 的 `data` 域）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `average-as-total` | 平均数和总数混：求平均答总数，或求总数答平均 | 4 袋平均 6 kg，问一共多重，答 6 kg | "6 kg is what one bag would be if they were all the same. Altogether the 4 bags are 4 × 6 = 24 kg." / "6 kg 是每袋一样重时一袋的重量。4 袋一共 4 × 6 = 24 kg。" | S3、S5 |
| `zero-ignored` | 有一项是 0 时不算它的个数 | 第 5 周存 $0，用 20 ÷ 4 | "Week 5 counts as an item even though nothing was saved. Divide by 5." / "第 5 周虽然没存钱，也算一项。要除以 5。" | S4、S6 |
| `average-as-middle` | 以为平均数就是中间那个数（或最常见的数） | 1、2、9 的平均说 2 | "Even them out: 1, 2 and 9 become 4, 4 and 4. The average is 4, not the middle number." / "移一移：1、2、9 变成 4、4、4。平均数是 4，不是中间那个数。" | S3、S5 |
| `remainder-dropped`（复用整数运算域） | 平均数不是整数时舍掉余数 | 7 kg 和 8 kg 的平均写 7 | "15 ÷ 2 is not a whole number. Share the last kilogram too: 7.5 kg." / "15 ÷ 2 不是整数。最后那 1 kg 也要分：7.5 kg。" | docs/19 §2.1 |
| `missing-equals-average` | 缺的那个数直接写成平均数 | 平均 6，求第 4 个数答 6 | "If the fourth were 6, the total would be 5 + 7 + 4 + 6 = 22, not 24." / "如果第 4 个是 6，总数是 5 + 7 + 4 + 6 = 22，不是 24。" | S4、S7 |
| `wrong-count` | 乘或除时用错个数（多数时候是只数已知的几个） | 平均 6 的 4 个数，用 6 × 3 − 16 | "The average is for all 4 numbers, so the total is 4 × 6, not 3 × 6." / "平均数说的是 4 个数，总数是 4 × 6，不是 3 × 6。" | S5 |
| `averages-averaged` | 加入一项后，用（旧平均 + 新数）÷ 2 求新平均 | 4 人平均 5、第 5 人 10，答 7.5 | "The old average stands for 4 people, the new number for only 1. Find the new total: 20 + 10 = 30, then 30 ÷ 5 = 6." / "旧平均数代表 4 个人，新的数只有 1 个人。先求新总数：20 + 10 = 30，再 30 ÷ 5 = 6。" | S3、S6 |

诊断只认题目声明的码；每个码至少一拍 ⚑、至少一道题。

### 2.2 逐步设计

简写：`S[2,4,6]` = 三座方块塔（`chart{type:bar, stack:true}`），`mean:4` = 平均线，`?` = 虚线框的条，`BM[6,6,6,6]` = 模型图里四段一样长的条。

---

#### 第 01 步 `evening-out` · 移多补少（P6 1.1）

**概念**：把多的移给少的，直到一样多；那个一样多的数就是平均数；总数不变。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `S[2,4,6]`，名字 Wei Jie、Siti、Arjun | — | `2 · 4 · 6` | Wei Jie, Siti and Arjun have 2, 4 and 6 stickers. Their towers are not the same height. | Wei Jie、Siti、Arjun 分别有 2、4、6 张贴纸。三座塔高低不一样。 |
| 2 | Arjun 的两块飞到 Wei Jie 那里（signal） | `level` | `6 − 2 = 4 · 2 + 2 = 4` | Move stickers from the tallest tower to the shortest until every tower is the same height. | 把最高那座的贴纸移给最矮的，直到每座一样高。 |
| 3 | `S[4,4,4]` + `mean:4` | `shade` | `2 + 4 + 6 = 12 = 4 + 4 + 4` | Now each has 4. Nothing was added or taken away, so the total is still 12. 4 is the average. | 现在每人 4 张。没有多也没有少，总数还是 12。4 就是平均数。 |
| 4 ⚑ | `S[1,2,9] → [4,4,4]` | `level` | `1 + 2 + 9 = 12 → 4, 4, 4` | The average is not always the middle number. 1, 2 and 9 even out to 4 each, not 2. | 平均数不一定是中间那个数。1、2、9 移一移，每座 4，不是 2。（`average-as-middle`） |

**要点**：① Even out the amounts; the level they reach is the average. / 移多补少，一样多时的数就是平均数。② Evening out does not change the total. / 移来移去，总数不变。

**题库（8）**：4 道 `even-out`（2–5 座塔；错例 `"=5"` 这类写成中间数 → `average-as-middle`）；2 道 `input`（看塔写平均数）；2 道 `choose`（哪一组的平均数是 5）。

---

#### 第 02 步 `total-divided` · 总数 ÷ 个数（P6 1.1）

**概念**：先把全部合起来得到总数，再平均分给每一项：平均数 = 总数 ÷ 个数；和移多补少得到同一个数。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `S[2,4,6]` 全部叠成一座 12 块的塔 | `pool` | `2 + 4 + 6 = 12` | Another way: put all the stickers together into one tower. The total is 2 + 4 + 6 = 12. | 换一种做法：把贴纸全部叠成一座塔。总数是 2 + 4 + 6 = 12。 |
| 2 | 12 块平分回三座，每座 4，`mean:4` | `level` | `12 ÷ 3 = 4` | Now share the total equally among the 3 friends: 12 ÷ 3 = 4. It is the same 4 as evening out. | 再把总数平均分给 3 个人：12 ÷ 3 = 4。和移多补少得到的 4 一样。 |
| 3 | `chart{bar; Siti 每周存的钱 $3, $5, $4, $8}`（不画方块），`mean:5` | `morph` | `(3 + 5 + 4 + 8) ÷ 4 = 20 ÷ 4 = $5` | With bigger numbers, you do not need the blocks. Siti saved $3, $5, $4 and $8 in four weeks. On average she saved 20 ÷ 4 = $5 a week. | 数大了，就不用画方块。Siti 四周存了 3、5、4、8 元。平均每周存 20 ÷ 4 = 5 元。 |
| 4 ⚑ | 加第 5 周：$0（一根高度为 0 的条，只有底线和名字），`mean` 从 5 移到 4 | `level` | `(20 + 0) ÷ 5 = $4` | In week 5 she saved nothing: $0. It is still a week, so divide by 5: (20 + 0) ÷ 5 = $4. | 第 5 周一分钱也没存：0 元。可那也是一周，要除以 5：(20 + 0) ÷ 5 = 4 元。（`zero-ignored`） |
| 5 ⚑ | `S[7,8]`（米袋，kg），最后一块切成两半分给两边，`mean:7.5` | `level` | `(7 + 8) ÷ 2 = 7.5 kg` | The average does not have to be a whole number, or one of the values. Two bags of 7 kg and 8 kg have an average of 15 ÷ 2 = 7.5 kg. | 平均数不一定是整数，也不一定是其中一个数。7 kg 和 8 kg 两袋米，平均 15 ÷ 2 = 7.5 kg。（`remainder-dropped`） |

**要点**：① Average = total ÷ number of items. / 平均数 = 总数 ÷ 个数。② A value of 0 is still an item. / 0 也算一项。③ An average can be a decimal. / 平均数可以是小数。

**题库（10）**：6 道 `input`（2–6 个数；含一个 0 → `zero-ignored`；平均 .5 → `remainder-dropped`；钱 $4.50）；2 道 `choose`（哪一个算式求的是平均数）；2 道 `input`（从 docs/77 式的条形图或表格读数再求平均）。

---

#### 第 03 步 `average-total-number` · 平均数、总数和个数（P6 1.2）

**概念**：知道其中两个就能求第三个：总数 = 平均数 × 个数；个数 = 总数 ÷ 平均数。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `BM[6,6,6,6]`（四段一样长，每段标 6 kg），右边总括号 "?" | — | `4 × 6 = 24 kg` | 4 bags of rice have an average mass of 6 kg. It is as if every bag were 6 kg, so the total is 4 × 6 = 24 kg. | 4 袋米平均每袋 6 kg。就好像每袋都是 6 kg，所以一共 4 × 6 = 24 kg。 |
| 2 | 同一图三处轮流标 "?"：总数 / 每段 / 段数 | `shade` | `words: total = average × number · average = total ÷ number · number = total ÷ average` | Average, total and number of items go together. Know any two, and you can find the third. | 平均数、总数、个数连在一起。知道其中两个，就能求第三个。 |
| 3 | 新图：总括号 $45，每段 $9，段数 "?" → 5 段逐段出现 | `split` | `45 ÷ 9 = 5` | Hui Min spent $45 in all, $9 a day on average. For how many days? 45 ÷ 9 = 5 days. | Hui Min 一共花了 45 元，平均每天 9 元。花了几天？45 ÷ 9 = 5 天。 |
| 4 ⚑ | 回到第 1 拍，"6 kg" 标在总括号上（hot 虚线）后划掉 | `cross` | `6 kg ≠ total` | An average of 6 kg is what one bag would be, not all of them together. The 4 bags are 24 kg altogether. | 平均 6 kg 说的是一袋，不是全部加起来。4 袋一共是 24 kg。（`average-as-total`） |

**要点**：① Total = average × number of items. / 总数 = 平均数 × 个数。② Number of items = total ÷ average. / 个数 = 总数 ÷ 平均数。

**题库（9）**：5 道 `input`（求总数 / 个数；错例 `average-as-total`）；2 道 `choose`（哪一个是总数）；2 道 `input`（两组合起来：3 个平均 10、2 个平均 15，一共多少 = 60）。

---

#### 第 04 步 `missing-value` · 求缺的那个数（P6 1.2）

**概念**：先用平均数 × 个数求总数，再减去知道的数；或者用"移多补少"看缺的那座要补多少。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `S[5,7,4,?]` + `mean:6` | — | `average 6 · ? = ?` | The average of four numbers is 6. Three of them are 5, 7 and 4. What is the fourth? | 四个数的平均数是 6，其中三个是 5、7、4。第四个是多少？ |
| 2 | 总括号 `4 × 6 = 24`，已知三座合起来 16 | `shade` | `4 × 6 = 24 · 24 − 16 = 8` | The total must be 4 × 6 = 24. The three you know make 16, so the fourth is 24 − 16 = 8. | 总数一定是 4 × 6 = 24。知道的三个合起来 16，所以第四个是 24 − 16 = 8。 |
| 3 | 移多补少看：5 缺 1、4 缺 2、7 多 1；`?` 塔 = 6 + 1 + 2 − 1 | `level` | `6 + 1 + 2 − 1 = 8` | You can also see it by evening out. The 5 needs 1 more and the 4 needs 2 more; the 7 has 1 extra. The fourth must bring 6 + 1 + 2 − 1 = 8. | 也可以用移多补少看：5 少 1，4 少 2，7 多 1。第四个要带来 6 + 1 + 2 − 1 = 8。 |
| 4 ⚑ | `?` 塔先填 6（hot 虚线），总数显示 22 ≠ 24 | `shade` | `5 + 7 + 4 + 6 = 22 ≠ 24` | The missing number is not the average itself. If it were 6, the total would be 22, not 24. | 缺的那个数不是平均数本身。如果是 6，总数是 22，不是 24。（`missing-equals-average`） |

**要点**：① Find the total first: average × number of items. / 先求总数：平均数 × 个数。② Missing value = total − the values you know. / 缺的数 = 总数 − 知道的数。

**题库（9）**：6 道 `input`（3–5 个数缺 1 个；错例 `missing-equals-average`、`wrong-count`（3 × 平均））；2 道 `choose`；1 道 `input`（钱：三天平均 $12，前两天 $10、$15）。

---

#### 第 05 步 `changing-the-average` · 多一个、少一个（P6 1.2）

**概念**：加入或离开一项时，先算新的总数，再除以新的个数；新的数比平均大，平均就升，比平均小就降。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `S[…4 座, mean:5]` → 第 5 座 10 块加入（hot），`mean` 升到 6 | `level` | `4 × 5 + 10 = 30 · 30 ÷ 5 = 6` | Four friends read 5 books each on average: 20 books. Daniel joins with 10 books. The new total is 30, shared by 5: the new average is 6. | 四个朋友平均每人读 5 本，一共 20 本。Daniel 带着 10 本加入。新总数 30，5 个人分：新平均数是 6。 |
| 2 ⚑ | `(5 + 10) ÷ 2 = 7.5` 写出后划掉；旧平均那段条标"4 人" | `cross` | `(5 + 10) ÷ 2 ≠ new average` | (5 + 10) ÷ 2 = 7.5 does not work: the old average stands for 4 people and the new number for only 1. Use the totals. | (5 + 10) ÷ 2 = 7.5 不对：旧平均数代表 4 个人，新的数只代表 1 个人。要用总数算。（`averages-averaged`） |
| 3 | 4 人那组里读 2 本的离开，`mean` 从 5 升到 6 | `level` | `(20 − 2) ÷ 3 = 6` | If someone below the average leaves, the average goes up: (20 − 2) ÷ 3 = 6. | 比平均少的人离开，平均数就升高：(20 − 2) ÷ 3 = 6。 |
| 4 | 新题：3 人平均 8（24），第 4 人加入后平均 9（36）；第 4 座 `?` | `shade` | `4 × 9 − 3 × 8 = 36 − 24 = 12` | Going backwards: 3 pupils average 8, and with a fourth the average is 9. The fourth brought 4 × 9 − 3 × 8 = 12. | 倒过来求：3 人平均 8，加上第 4 人后平均 9。第 4 人带来 4 × 9 − 3 × 8 = 12。 |

**要点**：① New average = new total ÷ new number of items. / 新平均数 = 新总数 ÷ 新个数。② A value above the average pulls it up; below pulls it down. / 比平均大的数让平均升，比平均小的让它降。

**题库（9）**：5 道 `input`（加入 / 离开后的新平均；倒求新加入的数；错例 `averages-averaged`、`wrong-count`）；3 道 `choose`（平均会升、降还是不变：加入一个等于平均的数 → 不变）；1 道 `input`（钱）。

---

### 2.3 练习章 `practice`（7 道固定题）

| # | 题型 | 题目（EN / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `even-out` | Even out the towers, then write the average. / 把塔移平，再写平均数。（3、5、7、9） | 6 | 5 或 7 → `average-as-middle` | 01 |
| Q2 | `input` | Find the average of 12, 15, 0 and 9. / 求 12、15、0、9 的平均数。 | 9 | 12 → `zero-ignored` | 02 |
| Q3 | `input` | Two ribbons are 13 cm and 16 cm long. What is their average length? / 两条丝带长 13 cm 和 16 cm，平均长多少？ | 14.5 cm | 14 → `remainder-dropped` | 02 |
| Q4 | `input` | 5 bags have an average mass of 8 kg. What is their total mass? / 5 袋平均重 8 kg，一共多重？ | 40 kg | 8 → `average-as-total` | 03 |
| Q5 | `input` | The average of four test scores is 15. Three are 12, 18 and 14. What is the fourth? / 四次小测的平均分是 15，其中三次是 12、18、14，第四次是多少？ | 16 | 15 → `missing-equals-average`；1 → `wrong-count` | 04 |
| Q6 | `input` | Four pupils read 6 books each on average. A fifth pupil read 11. What is the new average? / 四人平均每人读 6 本，第五人读了 11 本，新的平均数是多少？ | 7 | 8.5 → `averages-averaged` | 05 |
| Q7 | `choose` | Which is the average of 2, 3 and 10? / 2、3、10 的平均数是哪一个？ | 5 | 3 → `average-as-middle`；15 → `average-as-total` | 01、02 |

题型：even-out、input、choose。

---

## 3. 引擎（建在 docs/77 的 A7 `chart` 上）

### 3.0 复用与新增

| 编号 | 内容 | 复用 / 新增 |
|---|---|---|
| — | A7 `chart`（docs/77 E-GR1）、`barmodel`（第 03、05 步）、`split`、`cross`、`shade`、`morph` 过渡；`input` 的小数与钱写法（docs/29） | 复用 |
| — | `data` 域与 `lib/diagnose/data.ts`（docs/77 E-GR4）；`remainder-dropped`（整数运算域） | 复用（一码多域） |
| **E-AV1** | `chart` 加：`stack: true`（条画成单位方块，≤ 10 块 / 条，最小块 18 px）、`mean: number`（平均线）、`ghost: [catId]`（虚线框 "?" 条）、`halves: true`（一块切成两半，第 02 步第 5 拍）；过渡 `level`（方块逐块从高的飞到矮的，≤ 1200 ms，按搬动的块数压缩）、`pool`（全部叠成一座再平分） | 新增 |
| **E-AV2** | 小测 `even-out`（§3.1） | 新增 |
| **E-AV3** | `data` 域加 6 个码（§2.1）及诊断规则 | 新增 |
| **E-AV4** | 右上卡 AVERAGE、PLATE 行 | 新增 |

**依赖**：E-GR1（docs/77）。若 `average` 先于 `graphs` 施工，E-GR1 的 `bar` 部分随本课一起做，其余（picture、line、pie、table）留给 docs/77。

### 3.1 E-AV2 `even-out`

| 字段 | 孩子做什么 | 键盘 | 检查 | `sample` |
|---|---|---|---|---|
| `{ model: chart(bar, stack), answer: inputSpec(whole \| decimal) }` | 点一座塔的顶块（拿起，signal），再点另一座塔（放下）；托盘"一块一块搬"之外有"撤销一步""重来"；计数器显示"搬了几块"，不显示目标高度；塔都一样高后托盘出现数字框，写平均数 | 塔是 roving-tabindex 按钮：←→ 选塔、Enter 拿起 / 放下、Backspace 撤销 | 写的平均数对（搬块是脚手架，不判；但塔没一样高时数字框也出现，可以直接写） | `"=5"`；`"moves:2"` |

数据要能整平（总数是塔数的倍数）；不能整平的平均（.5）不出 `even-out`，只在讲解拍里切半块。

### 3.2 E-AV3 诊断规则（并入 `lib/diagnose/data.ts`）

数据 `v₁…vₙ`，总数 `T`，平均 `A`；孩子答 `x`：

| code | 规则 |
|---|---|
| `average-as-total` | 求平均 `x = T`；求总数 `x = A` |
| `zero-ignored` | 有 0 时 `x = T ÷ (n − 零的个数)` |
| `average-as-middle` | `x` = 排序后的中间值（或出现最多的值），且 ≠ `A` |
| `remainder-dropped` | `x = ⌊A⌋`，`A` 不是整数 |
| `missing-equals-average` | 缺值题 `x = A` |
| `wrong-count` | 缺值题 `x = (n − 1) × A − Σ已知`；求总数 `x = (n ± 1) × A` |
| `averages-averaged` | 加入 / 离开题 `x = (A旧 + v新) ÷ 2` |

单测：`tests/math-scene/{chart-level,diagnose-data}.test.ts`（整平搬块的最少步数、平均线位置、每条规则 ≥ 2 正例 1 反例）。docs/06「图表（A7）」加"平均"一段。

### 3.3 E-AV4 HUD

右上卡 **AVERAGE**：TOTAL · ITEMS · AVERAGE（讲解拍：这一拍算到哪一项就亮到哪一项；小测：只显示题目给的和孩子搬过的块数，平均做完才显示）。PLATE 行 MODEL BAR · ITEMS · TOTAL · LEVEL（LEVEL = 塔都一样高时的高度，没整平时写 "—"）。背景章 00 标本：`S[2,4,6]` 与平均线（`SPECIMEN 3 TOWERS · AVERAGE 4`）。

---

## 4. 名词表（`glossary.json`，8 个）

| id | EN | ZH | 定义要点 |
|---|---|---|---|
| `average` | average | 平均数 | 把总数平均分给每一项时，每一项得到的数。 |
| `total` | total (total value) | 总数 | 所有数据加起来；课纲写 "total value"。（与 docs/77 同 id，内容一致） |
| `number-of-items` | number of items (number of data) | 个数 | 一共有几项数据；课纲写 "number of data"。0 也算一项。 |
| `evening-out` | evening out | 移多补少 | 把多的移给少的，直到一样多（Q1）。 |
| `data` | data | 数据 | 数出来、量出来的一组数。（与 docs/77 同 id） |
| `share-equally` | share equally | 平均分 | 每一份一样多。（与分数主题同一个词） |
| `mean-line` | average line | 平均线 | 图上画在平均数高度的一条虚线。 |
| `item` | item | 一项 | 一组数据里的一个。 |

（8 个少于 skill 建议的 10–16：本课词少，不凑数。）

---

## 5. 写作规则与术语

### 5.1 口吻样例

- 讲解："Nothing was added or taken away, so the total is still 12." / "没有多也没有少，总数还是 12。"
- 错误反馈："Not yet. The average is for all 4 numbers. Find the total first: 4 × 6." / "还没对。平均数说的是 4 个数，先求总数：4 × 6。"
- 测验分数只说"分"，不说"考得好 / 不好"，不比较人。

### 5.2 术语

| EN | ZH | 备注 |
|---|---|---|
| average | 平均数 | 大陆、新加坡通用 |
| total, total value | 总数 | 课纲 "total value"；ZH 不用"总值" |
| number of items, number of data | 个数、数据的个数 | |
| even out / levelling | 移多补少 | Q1（"削峰填谷"备选，**待核**新加坡华文） |
| share equally | 平均分 | |
| on average | 平均每…… | "平均每周存 5 元" |
| mass, kg | 质量、kg | 同 `measuring`（"重"只在口语句里） |

### 5.3 数字与情境

- 数据 2–6 个；单个数据 ≤ 100；钱 ≤ $50，分是 5 的倍数；平均数是整数、.5 或钱。
- 情境：贴纸、储蓄、米袋、读书、丝带、豆苗、跳绳、小测分数（只一题）。人名：Wei Jie、Siti、Arjun、Hui Min、Daniel、Aisha、Ravi、Mei Ling。

---

## 6. 插图（交 Codex；风格与验收同 docs/76 §6、docs/69 §4.2，严格）

数量是教学点，**每一块都要数**。`art/planned/average/` 有 2026-10-18 的三张候选；缩略图目检块数与描述一致。

| # | 文件 | 尺寸 | 用在 | 画什么 | 可数的事实（逐条验收） | 不许出现 | 方法 |
|---|---|---|---|---|---|---|---|
| I-1 | `average.png`（封面，Q5 默认用 `average-equal-stacks.png` 的构图） | 1024² | 主题卡 | 三座一样大的木方块塔并排，各 4 块，同一底线，正面略俯视 | ① 恰好三座；② 每座 4 块，共 12；③ 块一样大（±3 %），接缝清楚；④ 三座同高（±1 %）；⑤ 无底座、无散块 | 数字、刻度、平均线、手、桌面 | 候选 `average-equal-stacks.png` 过检后另存为 1024² 封面（裁成正方形，四边留白 ≥ 7 %） |
| I-2 | `average-uneven-stacks.png` | 1536×1152 | 第 01 章 | 同一套木方块，三座塔从左到右 2、4、6 块（"移之前"），画法、块大小与 I-1 完全一致 | ① 块数 2、4、6，共 12；② 块与 I-1 同大（同一次生成或代码拼合）；③ 同一底线；④ 塔间距相等 | 同 I-1；箭头（不画"移动"箭头） | 候选 `average.png`（2、4、6）改作配图；若与 I-1 的块大小、线重对不上，**两张一起代码拼合**（同一块方块图元复制） |

不用：`average-level-water.png`（Q4）。图注草稿：I-2 "Before: 2, 4 and 6 blocks. After evening out, each tower has 4." / "移之前：2、4、6 块。移多补少之后，每座 4 块。"。两张都可反相。

---

## 7. 施工顺序与分工（不需要新依赖；子代理不改 `package.json`、不提交）

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | §0.1 定稿；建 `src/content/topics/average/{chapters,data}`、`topic.yaml`（`illustration: average`） | `topic.yaml` | — | S |
| 1 | E（Opus） | E-AV1–E-AV4（依赖 E-GR1，§3.0）、单测、docs/06 | `stage/ChartModel.tsx`（与 docs/77 同文件，**不能与 graphs 的引擎代理同时改**）、`lib/{chart.ts,data-tasks.ts,diagnose/data.ts}` | 0、docs/77 阶段 1 | S |
| 2 | L（Opus） | `lesson.json`：5 步 × 4–5 拍、样板题、练习 7 题；`pnpm shoot average --beats` | `data/lesson.json` | 1 | S |
| 3 | Codex | 题库其余约 35 道（`pnpm tsx scripts/math/check-pool.ts <draft> --topic average --step <id>` 0 错）；5 章英文初稿 | `scripts/math/drafts/` | 2 | S |
| 4 | T（Opus） | 合并、定稿英文、写中文正文、名词表、来源 | `data/*`、`chapters/*` | 3 | S |
| 4′ | Codex + 主会话 | §6 两张图 | `public/illustrations/**` | 0 | S |
| 5 | P（Sonnet） | QA；e2e：手机上搬块（点拿、点放）、纯键盘搬块、`level` 动画在 reduced-motion 下直接到位 | `tests-e2e/average.spec.ts` | 4 | S |
| 6 | 主会话 | 验收、截图、提交 | — | 5 | S |

---

## 8. 验收

照 `references/acceptance.md`，另加：

- [ ] 每拍"总数不变"的地方，方块数前后相等（validate 数块）
- [ ] 平均线的高度 = 总数 ÷ 个数（validate）；.5 的平均只在讲解拍与 `input` 出现，不出 `even-out`
- [ ] 题目的平均数都除得尽（整数、.5、钱的 5 分倍数）
- [ ] §2.1 每个码有 ⚑ 拍、有能诊断它的题
- [ ] 灰度截图能分辨：数据方块、被搬的方块、平均线、"?" 虚线框
- [ ] 截图：第 01、04 章 + 练习与一道小测，三种尺寸

## 9. 来源（访问日期 2026-11-15）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six*（URL 同 docs/76 S1） | 课纲原文第 33、36、38、40、44 页 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | Mokros, J., & Russell, S. J. (1995). Children's concepts of average and representativeness. *JRME*, 26(1), 20–39 | 平均当众数 / 中间数；"平衡"的理解 |
| S4 | Strauss, S., & Bichler, E. (1988). The development of children's concepts of the arithmetic average. *JRME*, 19(1), 64–80 | 0 也算一项；平均不一定是其中一个数 |
| S5 | Cai, J. (1998). Exploring students' conceptual understanding of the averaging algorithm. *School Science and Mathematics*, 98(2), 93–98 | 会算不会倒推（缺值题）（**待核**页） |
| S6 | Pollatsek, A., Lima, S., & Well, A. D. (1981). Concept or computation: Students' understanding of the mean. *Educational Studies in Mathematics*, 12(2), 191–204 | 两组合并时把平均数再平均 |
| S7 | Watson, J. M., & Moritz, J. B. (2000). The longitudinal development of understanding of average. *Mathematical Thinking and Learning*, 2(1–2), 11–50 | 平均数的发展层次（**待核**页） |
| S8 | 人民教育出版社《义务教育教科书 数学》四年级下册"平均数"（只作中文说法参考："移多补少"） | Q1（**待核**册次） |
| S9 | 批准教材目录（只作顺序参考），https://www.moe.gov.sg/education-in-sg/approved-textbook-list | 新加坡 P6 平均数一章的情境与写法（**待核**） |

## 10. 施工记录 / 已知差距

**2026-11-16 施工**（分支 `claude/graphs-average`，在 docs/77 的 A7 `chart` 之后；§0.1 全部按默认值：Q1 正文用"移多补少"、字幕第一次说"把多的移给少的"，Q2 小数平均数第 02 步第 5 拍 + 题库 2 道，Q3 测验分数只在练习第 5 题，Q4 不用水杯图，Q5 封面用摊平后的 4、4、4）。

- **课纲核对**：S1 第 44 页 1.1 "average as 'total value ÷ number of data'"——除号对照第 44 页原图核过（`pdftotext` 丢了字形）；第 33、38 页引文无误。
- **建成**：5 步 21 拍、题库 45 道（8 / 10 / 9 / 9 / 9）、练习 7 道（按问法 6 种）、名词表 8 条；`status: published`。题库由 Claude 起草，每份 `check-pool` 0 错。
- **引擎**（E-AV1–4，docs/06「图表（A7）」的平均数一段）：`chart` 的 `stack`、`mean`、`ghost`、`was`、`pooled`、`type: strip`；过渡 `level`、`pool`（`lib/chart.ts blockKeys`：每块方块保留自己的 key，从一座塔滑到另一座）；`even-out` 小测；`data` 域加 7 条规则；AVERAGE 卡与 PLATE 行。单测 `tests/math-scene/{chart,diagnose-data,average-lesson}.test.ts`，e2e `tests-e2e/average.spec.ts`。
- **与 spec 不同的地方**：
  - 第 03 步的模型图不用分数模型 `barmodel`（它的长度是分数），改用 `chart` 的 `type: "strip"`：一条分成 n 段一样长的条，上面总数括号、下面"n × 每段"，`unknown` 写 ?，`wrongTotal` 把一段的数写在总数上并划掉；整课都用 AVERAGE 卡。
  - 半块方块（7.5）直接画成塔顶的半块（signal），不是"切成两半分给两边"的动画。
  - `even-out` 的平均数框一开始就在（spec 允许"没整平也可以直接写"）；搬块计数写"移了几块"，不显示目标高度。
  - `average-as-middle` 对偶数个数据也认中间两个数（练习第 1 题 3、5、7、9 写 5 或 7）。
  - S3–S9（平均数研究文献、人教版课本）页码 / 册次未核，按规则不进 sources.json；"移多补少"作为说法保留（§0.1 Q1 默认），不注出处。
- **插图**：Codex `codex/img5`（c024fb85）的封面（4、4、4）与第 01 章配图（2、4、6），图注照 `art/img5/average-captions.json`；封面 mask 进 `src/lib/illustrations.json`。
