# 19 · 乘与除 · 内容 spec（`multiplication-division`，MathScene 课；v1 草案，待 Gavin 定稿）

docs/17 §6 #1。2026-10-13 起草，**只做规划，不施工、不建目录、不提交**（CLAUDE.md：内容未经 Gavin 定稿不展开）。照 skill `.claude/skills/atlas-lesson-topic/`（SKILL.md + `references/spec-template.md`、`writing-rules.md`、`data-cookbook.md`、`build-order.md`、`acceptance.md`）和样板 docs/15（分数，§10 是讲解优先的现形态）写。

本文的 §3.0 是 **docs/19–21 三节课共用的引擎泛化**（G1–G12）的唯一出处；docs/20（时间）、docs/21（面积与周长）只列各自用到哪几条和自己的新模型。

记号：EN 字幕与题目是**口吻草稿**，施工时由 Codex 起草全文、Claude 逐句核对；ZH 是 Claude 的草稿，施工时 Claude 独立定稿。课纲来源 S1 = MOE *Mathematics Syllabus Primary One to Six*（2021 Primary One Cohort，Updated Oct 2025），页码是 PDF 上印的页码。

---

## 0. 待定稿的决定（Gavin 确认）

| # | 决定 | 建议 |
|---|---|---|
| D1 | **对象与主体**：MOE 2021 课纲 Number and Algebra · Whole Numbers 的 Multiplication and Division 一线。**P2 + P3 为主体**（女儿 2026 P2、2027 P3）：第 01–06 步是 P2（P1 的乘除概念当"你已经知道"的地基并进第 01、05 步），第 07–11 步是 P3；第 12 步两位数乘两位数是 P4 的**桥**（`bridge: true`，可选） | 同意；一个主题用两年，P2 的孩子今年做 01–06 |
| D2 | **课的形状照分数改版后的样子**（docs/15 §8 D11–D16）：每章 3–5 个讲解拍 + 章末一道小测（从 8–10 道的题库随机抽，"再来一道""跳过"都在，不强制）；最后一章练习 8 道固定题；没有题单章 | 同意 |
| D3 | **UI 里不出现年级**（Gavin 的规则）：桥章的芯片不写"P4"，课纲对照只写条目原文与来源芯片，不写"P3 1.3"；`topic.yaml` 的 `levels` 本来就不渲染。要改引擎两个字符串（§3.0 G8），**分数主题也跟着变**（它现在显示"Bridge · P4""Syllabus P3 1.3"，00 章正文也写了 Primary 2 / 3） | 改引擎；分数主题的 00 章正文同步去掉年级（另开一个小任务） |
| D4 | **新模型**：A1 排列阵 / 等分组（`array`）+ 整数数轴（`numberline` 加 `scale: "whole"`）、A2 数位块（`blocks`）；第 12 步借用 docs/21 的 A4 方格（`grid`）。新小测类型 `group`、`arrange`、`skip-count`、`split-array`、`regroup`、`share`；`input` 加整数、余数、算式填空三种写法（§3） | 同意；A1–A4 一次做完（docs/17 §6 的建议），三节课共用 §3.0 |
| D5 | **乘法的读法**：新加坡课本把 `4 × 3` 读成 "4 groups of 3"（组数在前，**待核**：施工前翻一页 *My Pals Are Here!* P1/P2 乘法章确认）；字幕与题目一律"组数 × 每组几个"，`arrange` 一律"几行 × 每行几个" | 按核实结果定；若课本相反，全课一起换 |
| D6 | **余数的写法**：算式行（中英共用一条字符串）写 `14 ÷ 4 = 3 r 2`；EN 读 "3 remainder 2"，ZH 字幕写"3 余 2"（大陆课本的 `3……2` 不进算式行，名词表里提一句） | 同意 |
| D7 | **"进位 / 退位"的英文词**：课纲用 *renaming*（S1 第 31 页 "without renaming"），新加坡课堂也说 *regroup*。正文用 "regroup"，名词表 `regroup` 条注 "also called renaming"；舞台动作内部叫 `trade`（"10 个一换 1 个十"），字幕说 "trade 10 ones for 1 ten" | 同意 |
| D8 | **中文术语**：阵列（排成行和列的一组物体）、几个几个地数（跳数）、乘法表（乘法口诀）、平均分、商、余数、竖式；见 §4 | 同意或改 |
| D9 | **数字与情境**：每步的数字上限照课纲（§1.3 的"数字"列）；情境用 kueh、咖喱角（curry puff）、筷子、鸡蛋托、小巴（minivan）、组屋窗户、hawker 托盘，每个只出现一两次；不出现价格、品牌、比赛排名；人名多族群 | 同意 |
| D10 | **背景章 00**："怎么用这节课"照分数 00 章改写（讲节拍、章节轴、小测、再来一道 / 跳过），**不写年级**；不计入步数 | 同意 |
| D11 | **章节配图**：§6 的 3 张石墨图（hawker 柜台的等分托盘、组屋立面的窗户阵列、装盒剩下的咖喱角），放在第 01、03、08 章正文里；首页图沿用已有的 kueh 托盘 | 同意；配图可以晚于课上线 |
| D12 | **桥章（第 12 步）**：做 / 不做。做则依赖 A4 方格（docs/21），施工顺序上放到 A4 之后 | 做，但不阻塞 01–11 上线 |

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字）

Number and Algebra · SUB-STRAND: WHOLE NUMBERS。

| 级 | 条目 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|---|
| P1 | 3. Multiplication and Division | 3.1 concepts of multiplication and division · 3.2 use of x · 3.3 multiplying within 40 · 3.4 dividing within 20 | 31 | 地基：第 01、05 步的第一拍 |
| **P2** | 3. Multiplication and Division | 3.1 multiplication tables of 2, 3, 4, 5 and 10 · 3.2 use of ÷ · 3.3 relationship between multiplication and division · 3.4 multiplying and dividing within the multiplication tables · 3.5 mental calculation involving multiplication and division within multiplication tables of 2, 3, 4, 5 and 10 | 33 | 第 01–06 步 |
| **P3** | 3. Multiplication and Division | 3.1 multiplication tables of 6, 7, 8 and 9 · 3.2 multiplying and dividing within the multiplication tables · 3.3 division with remainder · 3.4 multiplication and division algorithms (up to 3 digits by 1 digit) · 3.5 mental calculation involving multiplication and division within multiplication tables | 35 | 第 07–11 步 |
| P4（桥） | 3. Four Operations | 3.1 multiplication algorithm · up to 4 digits by 1 digit · up to 3 digits by 2 digits · 3.2 division algorithm (up to 4 digits by 1 digit) | 37 | 第 12 步只取 3.1 的"2 位 × 2 位"一角 |
| P5（背景） | 2. Four Operations | 2.1 multiplying and dividing by 10, 100, 1000 and their multiples without calculator | 41 | 不做；第 09 步只讲"整十整百 × 一位数"，属于 P3 3.4 竖式的地基 |

核对要点（纠正常见二手说法）：
- **P2 只有 2、3、4、5、10 的乘法表**；6–9 在 P3（S1 第 33、35 页）。P1 已有乘除**概念**和 "use of x"，但 "use of ÷" 是 P2 3.2。
- **有余数的除法在 P3**（3.3），P2 的除法都在乘法表之内、没有余数。
- **竖式**（algorithm）P3 只到"3 位数 × / ÷ 1 位数"；2 位数乘数在 P4（3.1）。
- "× / ÷ 10、100、1000 及其倍数"作为条目在 **P5** 2.1，不在 P3；第 09 步的"30 × 4"是 P3 竖式里"整十 × 一位数"的部分积，课纲不单列。
- **因数与倍数**（P4 Factors and Multiples，第 37 页）不在本课，是 docs/17 的 `factors-multiples` 主题。

课纲框架（S1 第 12–20 页，同 docs/15 §1.1）：关系性理解优先（"知其所以然"）；大观念里与本课最直接的是 **Notations**（×、÷ 的意义）、**Diagrams**（阵列、模型）、**Equivalence**（3 × 4 = 4 × 3、乘除互逆）。2021 版正文没有 "Concrete-Pictorial-Abstract" 字样，CPA 的依据是 S3（TIMSS 百科）。

### 1.2 级别、步数与时间

- **12 个课步 + 练习章 + 背景章 00**（13 个带编号的章，00 不计）。
- 地基 P1 → 主体 P2（01–06）→ 主体 P3（07–11）→ 桥 P4（12，可选）。
- 拍数 52（每拍 ~20 s ≈ 17 min），小测 12 道（每道 ~40 s ≈ 8 min），练习 8 道（≈ 5 min）：**全课约 30 分钟**；P2 的孩子只做 01–06 约 13 分钟，P3 的孩子做 07–11 约 11 分钟。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字 |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | — | — | — | — |
| 01 | `equal-groups` | Equal groups | 相同的几组 | P1 3.1, 3.2, 3.3 | array（散 → 组） | 4 | 9 · group / choose / input | 组数 2–5，每组 2–5，总数 ≤ 40 |
| 02 | `skip-counting` | Counting in 2s, 5s and 10s | 几个几个地数 | P2 3.1, 3.5 | array（组）+ numberline（整数） | 4 | 9 · skip-count / input / choose | 2、5、10 的表，× 1–10 |
| 03 | `arrays` | Rows and columns | 排成行和列 | P2 3.1, 3.4 | array（行） | 4 | 9 · arrange / input / choose | 行、列 2–10，表 2–5、10 |
| 04 | `known-facts` | New facts from facts you know | 用会的算新的 | P2 3.1, 3.5 | array（切开） | 4 | 9 · split-array / input / choose | 3、4、5 的表 |
| 05 | `sharing-and-grouping` | Two ways to divide | 除法的两种问法 | P1 3.1, 3.4 · P2 3.2, 3.4 | array（发 / 装） | 4 | 10 · group / choose / input | 被除数 ≤ 50，除数 2–5、10，无余数 |
| 06 | `fact-families` | × and ÷ belong together | 乘法和除法是一家 | P2 3.3, 3.5 | array（遮住一边） | 4 | 9 · input / choose | 表 2–5、10 |
| 07 | `tables-6-to-9` | The 6, 7, 8 and 9 tables | 6、7、8、9 的乘法表 | P3 3.1, 3.2, 3.5 | array（切开 / 划掉 / 转） | 5 | 10 · input / split-array / choose | 6–9 × 2–10 |
| 08 | `remainders` | Some left over | 有余数的除法 | P3 3.3 | array（装盒 + 剩下） | 5 | 10 · group / input / choose | 除数 2–9，商 ≤ 10，余数 1 至 除数 − 1 |
| 09 | `multiplying-tens` | Tens and hundreds times a number | 整十、整百数乘一位数 | P3 3.4, 3.5 | blocks（行 → 换） | 4 | 9 · regroup / input / choose | 10–90、100–900 × 2–9 |
| 10 | `multiplying-in-columns` | Multiplying in columns | 乘法竖式 | P3 3.4 | blocks + 竖式 | 5 | 10 · input / regroup / choose | 2–3 位 × 1 位，积 ≤ 4 位 |
| 11 | `dividing-in-columns` | Dividing in columns | 除法竖式 | P3 3.3, 3.4 | blocks（发 → 换 → 发）+ 竖式 | 5 | 10 · share / input / choose | 2–3 位 ÷ 1 位，商里可有 0，可有余数 |
| 12 | `two-digit-by-two-digit` | Two-digit by two-digit（桥） | 两位数乘两位数 | P4 3.1 | grid（面积模型，不按比例） | 4 | 8 · input / split-figure / choose | 11–49 × 11–29，积 ≤ 999 |
| 13 | `practice` | Practice | 练习 | P2–P3 全部 | 按题 | — | 8 道固定题 | — |

### 1.4 不在本课

- 因数、倍数、公因数、公倍数（P4，另一主题）；运算顺序、括号（P5）；× ÷ 10 / 100 / 1000 作为独立技能（P5）。
- 4 位数 × 1 位、3 位数 × 2 位、4 位数 ÷ 1 位（P4 3.1、3.2 的其余部分）：第 12 步只示范方法，题库不出。
- 钱的乘除（课纲 Money 子线在 P2–P3 只有记法与加减）。
- 多步应用题的模型法（docs/17 的 `bar-model-problems` 系列）：本课的情境题都是一步。

---

## 2. 课的设计

### 2.0 写法约定（照 skill `writing-rules.md`）

- 一拍讲一件事：看什么 + 为什么；EN ≤ 35 词、ZH ≤ 60 字；第一拍接"你已经知道的"，最后一拍给结论或一个应用。
- 算式行短：`4 × 3 = 12`、`14 ÷ 4 = 3 r 2`、`6 × 7 = 5 × 7 + 1 × 7`；未知写 `?`；不在算式里写解释。
- 颜色只表示"谁的"：给定的物体 / 方块 = cold，新加上 / 孩子放的 = signal，第二个量（另一部分积、拿来比的那组）= hot，拿走 = 墨色斜线，"看答案" = 墨色虚线。不用红绿判对错。
- 口吻：平静、第二人称、先具体后符号；不用感叹号，不说 easy / wrong / 错了 / 太棒了；错误反馈 = 原因 + 下一步看哪里。
- 数字在字幕里直接写阿拉伯数字（朗读由 `words.ts` 读成 "twelve / 十二"）；`r` 读作 "remainder / 余"。

### 2.1 误解目录（`MisconceptionCode`，整数运算域；§3.4 写诊断规则）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `unequal-groups` | 不等的几堆也叫"几组" | 2、5、5 叫"3 组" | "These groups are not the same size, so they are not '3 groups of' anything." / "这几组不一样多，不能说'3 组，每组几个'。" | S4、S7 |
| `added-not-multiplied` | 把组数和每组个数相加 | 5 组 4 个写 9 | "5 + 4 counts the numbers, not the things. There are 5 groups, and each has 4." / "5 + 4 是把两个数加起来，不是数东西。一共 5 组，每组 4 个。" | S6、S15 |
| `groups-size-swapped` | 组数和每组个数对调 | "4 组，每组 3 个"摆成 3 组 4 个；"3 行 5 个"排成 5 行 | "You made 3 groups of 4. The question asks for 4 groups of 3." / "你摆的是 3 组、每组 4 个。题目要的是 4 组、每组 3 个。" | S4、S7 |
| `skip-count-slip` | 跳数多跳 / 少跳一组 | 7 × 5 写 30 或 40 | "Count the jumps: 7 jumps of 5. You have one jump too many." / "数一数跳了几次：要跳 7 次，你多跳了一次。" | S4 |
| `split-slip` | 拆开算时补了 1 而不是补一整组 | 6 × 7 = 35 + 1 = 36 | "The extra part is a whole row of 7, not 1." / "多出来的是一整行 7 个，不是 1 个。" | S5、S14 |
| `sharing-only` | 只认"平均分给几份"，不认"每几个一份" | 只选分给 4 人的故事，不选每 4 个一包 | "Packing in 4s is also 20 ÷ 4: it asks how many groups." / "每 4 个装一包，也是 20 ÷ 4：问的是能分几份。" | S8、S6 |
| `divide-order` | 除数和被除数对调 | 写 3 ÷ 12；"4 除 12" | "Start with what you have: 12. 12 ÷ 3." / "先写有多少：12。写成 12 ÷ 3。" | S4 |
| `operation-swapped` | 该除却乘 / 该乘却除 | ? × 6 = 42 填 252 | "42 is the total. Ask which number times 6 makes 42." / "42 是总数。想一想：几乘 6 得 42？" | S6 |
| `remainder-too-big` | 余数 ≥ 除数 | 14 ÷ 4 = 2 r 6 | "6 left over can still fill another box of 4." / "剩下的 6 个还能再装一盒 4 个。" | S1 3.3、S12 |
| `remainder-dropped` | 丢掉余数 | 14 ÷ 4 写 3 | "3 boxes use 12. What happens to the other 2?" / "3 盒只用了 12 个，另外 2 个呢？" | S9 |
| `remainder-context` | 不按问题处理余数 | 50 人坐 8 人小巴，答 6 辆 | "6 minivans seat 48. The 2 children left over need a 7th." / "6 辆只坐得下 48 人，剩下 2 个小朋友还要第 7 辆。" | S9 |
| `tens-as-ones` | 把几个十当成几个一 | 30 × 4 = 12；23 × 14 里 23 × 1 当 23 × 10 | "Each row is 3 tens. 12 tens is 120." / "每行是 3 个十。12 个十是 120。" | S5、S11 |
| `extra-zero` | 多写一个 0 | 30 × 4 = 1200 | "3 tens × 4 is 12 tens, not 12 hundreds." / "3 个十乘 4 是 12 个十，不是 12 个百。" | S5、S11 |
| `carry-not-added` | 换上去的十（百）没加 | 26 × 3 = 68 | "18 ones is 1 ten and 8 ones. Add that ten to the tens." / "18 个一是 1 个十和 8 个一，那个十要加到十位上。" | S12 |
| `digits-concatenated` | 各位的积并排写 | 26 × 3 = 618 | "18 ones cannot sit in the ones place. Trade 10 of them for a ten." / "个位放不下 18。拿 10 个一换成 1 个十。" | S12 |
| `partial-product-missed` | 漏一个部分积 | 23 × 4 = 83；23 × 14 = 212 | "Every part of the number must be multiplied: the 20 and the 3." / "每一部分都要乘：20 要乘，3 也要乘。" | S13、S12 |
| `zero-in-quotient` | 商的中间漏写 0 | 412 ÷ 4 = 13 | "1 ten shared into 4 gives 0 tens each. Write the 0 to hold the tens place." / "1 个十分给 4 份，每份 0 个十。十位上要写 0。" | S12 |
| `not-traded` | 剩下的十没换成一 | 72 ÷ 3 = 20 r 2（丢了剩下的 1 个十） | "The ten left over is still 10 ones. Trade it and share the ones." / "剩下的那个十还是 10 个一，换开再分。" | S5、S11 |

诊断只认题目声明过的 code（`feedback.wrong[].when`、`choose` 错选项的 `misconception`）。每个 code 至少在一拍里**正面讲**（拍表里标 ⚑）。

### 2.2 逐步设计

拍表的列：`#` · **模型状态**（§3 的 schema 写法，简写）· **过渡**（`move`）· **算式**（`equation`）· **字幕 EN / ZH**（草稿）。第一拍不写 `move`。

---

#### 第 01 步 `equal-groups` · 相同的几组（P1 3.1–3.3，地基）

**概念**：每组一样多，就可以数"几组"，不用一个一个数；4 组、每组 3 个写作 4 × 3。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `array{object:kueh, layout:scatter, count:12}` | — | — | Twelve kueh on a tray. You can count them one by one, but there is a quicker way. | 托盘上有 12 块 kueh。可以一块一块地数，不过有更快的办法。 |
| 2 | `array{layout:groups, groups:4, size:3, container:plate}` | `group` | `3 + 3 + 3 + 3 = 12` | Put 3 on each plate. Now there are 4 plates, and every plate has 3. | 每个盘子放 3 块。现在有 4 个盘子，每盘都是 3 块。 |
| 3 ⚑ | `array{layout:groups, sizes:[2,5,5], container:plate}` | `group` | `2 + 5 + 5 = 12` | These plates hold 2, 5 and 5. The groups are not equal, so you cannot say how many are in each group. | 这样放是 2 块、5 块、5 块。每组不一样多，就说不出"每组几块"。（`unequal-groups`） |
| 4 | `array{layout:groups, groups:4, size:3, braces:true}` | `group` | `4 × 3 = 12` | Equal groups can be written with ×. 4 groups of 3 is 4 × 3, and 4 × 3 = 12. | 一样多的几组可以用 × 来写。4 组、每组 3 块，写作 4 × 3，4 × 3 = 12。 |

**要点**：① Equal groups have the same number in every group. / 相同的几组，每组一样多。② 4 × 3 means 4 groups of 3. / 4 × 3 表示 4 组、每组 3 个。③ Adding the same number again and again is multiplying. / 同一个数连加，就是乘法。

**题库（9）**：3 道 `group`（散放 → 摆成 k 组每组 n；k、n 2–5；错例 `groups-size-swapped` 样例 `"3x4"`）；3 道 `input`（看图写总数，5 组 4 个 → 20；错例 `added-not-multiplied` 9、`skip-count-slip` 16 / 24）；2 道 `choose`（哪一盘是"3 组，每组 5 个"：不等分的一盘 → `unequal-groups`，5 组 3 个 → `groups-size-swapped`）；1 道 `choose`（哪个算式和 3 + 3 + 3 + 3 + 3 一样：`5 × 3` ✓、`3 + 5` → `added-not-multiplied`）。情境轮换：kueh、橘子、铅笔、贴纸。

---

#### 第 02 步 `skip-counting` · 几个几个地数（P2 3.1, 3.5：2、5、10 的乘法表）

**概念**：每次跳同样远，跳几次就是几组；落点就是乘法表。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `array{object:chopsticks, layout:groups, groups:6, size:2}` | — | — | Six pairs of chopsticks. A pair is a group of 2. | 6 双筷子。一双就是 2 根一组。 |
| 2 | 同上 + `numberline{scale:whole, from:0, to:20, step:1, labels:"tens", jumps:{size:2, count:6}}` | `jump` | `2, 4, 6, 8, 10, 12` | Count the pairs with jumps of 2: 2, 4, 6, 8, 10, 12. Six jumps land on 12, so 6 × 2 = 12. | 2 根 2 根地跳着数：2、4、6、8、10、12。跳 6 次落在 12，所以 6 × 2 = 12。 |
| 3 | `array{object:curry-puff, groups:7, size:5, container:box}` + `numberline{to:50, step:5, jumps:{size:5, count:7}}` | `morph` | `7 × 5 = 35` | Boxes of 5 curry puffs. Jumps of 5 land on 5, 10, 15 and on. The 7th jump lands on 35. | 每盒 5 个咖喱角。5 个 5 个地跳：5、10、15……第 7 跳落在 35。 |
| 4 ⚑ | `numberline{to:50, step:10, jumps:{size:10, count:4}, counter:true}` | `jump` | `4 × 10 = 40` | Count the jumps, not the marks you pass. 4 jumps of 10 land on 40. Counting 0 as a jump gives one too many. | 数跳了几次，不是数经过几条刻度。跳 4 次 10，落在 40。把 0 也算一跳，就多了一次。（`skip-count-slip`） |

**要点**：① Skip counting in 2s, 5s or 10s lands on the 2, 5 or 10 times table. / 2 个 2 个、5 个 5 个、10 个 10 个地数，落点就是 2、5、10 的乘法表。② The number of jumps is the number of groups. / 跳几次就是几组。

**题库（9）**：3 道 `skip-count`（按顺序点落点：2 到 20、5 到 50、10 到 100；错例样例 `"5,10,15,21"` → `skip-count-slip`）；4 道 `input`（8 × 5、6 × 10、9 × 2、3 × 5，配跳数图；错例 ± 一组 → `skip-count-slip`，两数相加 → `added-not-multiplied`）；2 道 `choose`（哪条数轴画的是 4 × 5：跳 5 次 4 的 → `groups-size-swapped`；跳 3 次的 → `skip-count-slip`）。

---

#### 第 03 步 `arrays` · 排成行和列（P2 3.1, 3.4）

**概念**：把几组排成整齐的行，就是阵列；按行读、按列读都行，转一下数量不变，所以 3 × 4 = 4 × 3。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `array{object:egg, layout:groups, groups:3, size:4, container:ring}` | — | `4 + 4 + 4` | Three groups of 4 eggs. | 3 组鸡蛋，每组 4 个。 |
| 2 | `array{layout:rows, rows:3, cols:4, braces:"rows"}` | `arrange` | `3 × 4 = 12` | Line each group up as a row. 3 rows of 4 is called an array: 3 × 4 = 12. | 把每组排成一行。3 行、每行 4 个，叫作阵列：3 × 4 = 12。 |
| 3 | 同上，`braces:"cols"`，列轮流高亮 | `shade` | `4 × 3 = 12` | Now read it by columns: 4 columns of 3. They are the same eggs, so 4 × 3 = 12 as well. | 再按列看：4 列、每列 3 个。还是这些鸡蛋，所以 4 × 3 也等于 12。 |
| 4 | `array{rows:4, cols:3, rotate:90}` | `rotate` | `3 × 4 = 4 × 3` | Turn the tray a quarter turn. Nothing is added or taken away, so 3 × 4 = 4 × 3. You can multiply in either order. | 把托盘转四分之一圈，一个没多、一个没少，所以 3 × 4 = 4 × 3：两个数换个顺序乘，积不变。 |

**要点**：① An array has equal rows: number of rows × number in each row. / 阵列每行一样多：行数 × 每行几个。② Turning an array does not change how many: 3 × 4 = 4 × 3. / 阵列转一下数量不变：3 × 4 = 4 × 3。

**题库（9）**：3 道 `arrange`（排出"3 行，每行 5 个"一类；错例 `"5x3"` → `groups-size-swapped`）；3 道 `input`（4 × 7 阵列共几个；错例 11 → `added-not-multiplied`，24 / 32 → `skip-count-slip`）；2 道 `choose`（`multi`：哪两个算式表示这个阵列：`3 × 6`、`6 × 3` ✓，`3 + 6` → `added-not-multiplied`）；1 道 `choose`（哪个阵列和 5 × 4 一样多：转过来的 4 × 5 ✓，4 × 4 → `skip-count-slip`）。情境：鸡蛋托、组屋窗户、教室座位。

---

#### 第 04 步 `known-facts` · 用会的算新的（P2 3.1, 3.5：3、4、5 的表）

**概念**：把阵列切成会算的几块，再加起来：4 × 是 2 × 的两倍，3 × 是 2 × 再多一组，5 × 是 10 × 的一半。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `array{rows:2, cols:7, braces:"rows"}` | — | `2 × 7 = 14` | You know 2 × 7 = 14: two rows of 7. | 你会 2 × 7 = 14：两行，每行 7 个。 |
| 2 | `array{rows:4, cols:7, split:{rows:[2]}, given:"top", shaded:"bottom"}` | `arrange` | `4 × 7 = 2 × 7 + 2 × 7 = 28` | Four rows is two rows and two rows again. Double 14: 4 × 7 = 28. | 4 行就是 2 行再来 2 行。14 的两倍：4 × 7 = 28。 |
| 3 ⚑ | `array{rows:3, cols:7, split:{rows:[2]}}`，第 3 行 signal | `arrange` | `3 × 7 = 2 × 7 + 1 × 7 = 21` | Three rows is two rows and one more row: 14 + 7 = 21. The extra part is a whole row of 7, not just 1. | 3 行是 2 行再多 1 行：14 + 7 = 21。多出来的是一整行 7 个，不是 1 个。（`split-slip`） |
| 4 | `array{rows:10, cols:4, split:{rows:[5]}, crossed:"bottom"}` | `morph` | `10 × 4 = 40 · 5 × 4 = 20` | Ten rows of 4 is 40. Five rows is half of that: 5 × 4 = 20. | 10 行、每行 4 个是 40。5 行是它的一半：5 × 4 = 20。 |

**要点**：① Split an array into parts you know, then add the parts. / 把阵列切成会算的几块，再加起来。② 4 × is double 2 ×; 3 × is 2 × and one more group; 5 × is half of 10 ×. / 4 × 是 2 × 的两倍；3 × 是 2 × 再多一组；5 × 是 10 × 的一半。

**题库（9）**：4 道 `split-array`（在阵列上放一条切线，再填 `sentence` 里的几格：`2 × 8 = ?, 1 × 8 = ?, 3 × 8 = ?`；错例 `"=17"` → `split-slip`）；4 道 `input`（4 × 9、3 × 6、5 × 8；错例 `split-slip`、`skip-count-slip`）；1 道 `choose`（算 4 × 6 时哪种切法有用：切成 2 + 2 行 ✓，切成 4 + 6 → `added-not-multiplied`）。

---

#### 第 05 步 `sharing-and-grouping` · 除法的两种问法（P1 3.1, 3.4 · P2 3.2, 3.4）

**概念**：÷ 回答两种问题：平均分给几份，每份几个；每几个一份，能分几份。算式一样。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `array{object:curry-puff, layout:scatter, count:12, containers:{kind:plate, count:3}}` | — | `12 ÷ 3 = ?` | 12 curry puffs and 3 plates, the same number on each plate. How many go on each? | 12 个咖喱角，平均放在 3 个盘子里。每盘几个？ |
| 2 | `array{layout:groups, groups:3, size:4, container:plate}` | `deal` | `12 ÷ 3 = 4` | Deal them out one at a time, round and round. Each plate gets 4. 12 ÷ 3 = 4 is read "12 divided by 3". | 一轮一个地发，发完每盘 4 个。12 ÷ 3 = 4，读作"12 除以 3"。 |
| 3 | `array{layout:groups, groups:4, size:3, container:box}` | `group` | `12 ÷ 3 = 4` | A different question: pack the 12 into boxes of 3. How many boxes? Fill one box at a time: 4 boxes. | 换个问题：每 3 个装一盒，能装几盒？一盒一盒地装：4 盒。 |
| 4 ⚑ | 两格并排：`pair:[{groups:3,size:4,container:plate},{groups:4,size:3,container:box}]` | `morph` | `12 ÷ 3 = 4` | Both are 12 ÷ 3. One asks how many in each group, the other asks how many groups. You always start with the 12. | 两题都是 12 ÷ 3：一题问每份几个，一题问能分几份。算式总是从 12 写起。（`sharing-only`、`divide-order`） |

**要点**：① ÷ shares into equal groups, or finds how many groups. / ÷ 可以是平均分给几份，也可以是看能分几份。② The number you start with comes first: 12 ÷ 3. / 先写原来有多少：12 ÷ 3。

**题库（10）**：4 道 `group`（`by: "share"` 分给 k 个盘子 / `by: "pack"` 每 k 个一盒；被除数 ≤ 50，除数 2–5、10；错例对调 → `groups-size-swapped`）；3 道 `choose`（`multi`：哪些故事是 20 ÷ 5：分给 5 人 ✓、每 5 个一包 ✓，"5 个人每人有 20 个" → `operation-swapped`；只选第一个时右选项的 `misconception: "sharing-only"`）；2 道 `input`（看图写商）；1 道 `choose`（哪个算式写对了：`3 ÷ 12 = 4` → `divide-order`）。

---

#### 第 06 步 `fact-families` · 乘法和除法是一家（P2 3.3, 3.5）

**概念**：一个阵列能写出两个乘法、两个除法；做除法时想乘法：15 ÷ 3 问的是"几乘 3 得 15"。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `array{rows:3, cols:5, braces:"rows"}` | — | `3 × 5 = 15` | 3 rows of 5 make 15. | 3 行、每行 5 个，一共 15 个。 |
| 2 | 同上，`braces:"cols"` | `shade` | `5 × 3 = 15` | By columns it is 5 columns of 3: 5 × 3 = 15. | 按列看是 5 列、每列 3 个：5 × 3 = 15。 |
| 3 | `array{rows:3, cols:5, cover:{rows:true}}`（行数被纸条盖住，只见"每行 5 个，共 15 个"） | `cover` | `15 ÷ 5 = ?` | Now cover the number of rows. You know there are 15 in rows of 5. How many rows? Think: what times 5 makes 15? | 把行数盖住。只知道一共 15 个、每行 5 个，有几行？想一想：几乘 5 得 15？ |
| 4 | `array{rows:3, cols:5, cover:{cols:true}}` → 揭开 | `cover` | `3 × 5 = 15 · 5 × 3 = 15 · 15 ÷ 5 = 3 · 15 ÷ 3 = 5` | One array, four number sentences. To divide, use the multiplication you know. | 一个阵列，四个算式。做除法，就用你会的乘法。（`operation-swapped`） |

**要点**：① Every array gives two multiplications and two divisions. / 每个阵列都能写出两个乘法、两个除法。② 15 ÷ 3 = ? asks ? × 3 = 15. / 15 ÷ 3 = ? 问的是 ? × 3 = 15。

**题库（9）**：4 道 `input`（缺因数 `? × 4 = 28`、`35 ÷ 5 = ?`；错例 112 → `operation-swapped`，8 → `skip-count-slip`）；3 道 `choose`（哪个不属于 4、6、24 这一家：`4 ÷ 24 = 6` → `divide-order`）；2 道 `input`（`sentence`：`20 ÷ 4 = ?，因为 ? × 4 = 20`）。

---

#### 第 07 步 `tables-6-to-9` · 6、7、8、9 的乘法表（P3 3.1, 3.2, 3.5）

**概念**：新的乘法表不用死记一整张：从会的 5 ×、10 ×、4 × 切出来，再用交换律减半。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `array{rows:6, cols:7, split:{rows:[5]}, given:"top"}` | — | `6 × 7 = 5 × 7 + 1 × 7` | 6 × 7: split off 5 rows, which you know. 5 × 7 = 35. | 6 × 7：先切出你会的 5 行，5 × 7 = 35。 |
| 2 ⚑ | 同上，第 6 行 signal | `shade` | `6 × 7 = 35 + 7 = 42` | Then add one more row of 7: 35 + 7 = 42. A whole row, so add 7, not 1. | 再加一整行 7 个：35 + 7 = 42。加的是一整行，所以加 7，不是加 1。（`split-slip`） |
| 3 | `array{rows:10, cols:6, crossed:{rows:[9]}}` | `cross` | `9 × 6 = 10 × 6 − 1 × 6 = 54` | 9 × 6: start from 10 rows of 6, then take one row away: 60 − 6 = 54. | 9 × 6：从 10 行、每行 6 个算起，再拿走一行：60 − 6 = 54。 |
| 4 | `array{rows:8, cols:7, split:{rows:[4]}}` | `morph` | `8 × 7 = 4 × 7 + 4 × 7 = 56` | 8 × 7 is double 4 × 7: 28 + 28 = 56. | 8 × 7 是 4 × 7 的两倍：28 + 28 = 56。 |
| 5 | `array{rows:7, cols:6, rotate:90}` | `rotate` | `7 × 6 = 6 × 7 = 42` | And 7 × 6 is 6 × 7 turned round, so you already know it. Each new table repeats facts you have met. | 7 × 6 就是把 6 × 7 转过来，你已经会了。新的乘法表里，很多是见过的。 |

**要点**：① 6 × = 5 × and one more group. / 6 × 就是 5 × 再多一组。② 9 × = 10 × and one group less. / 9 × 就是 10 × 少一组。③ 8 × = double 4 ×. / 8 × 是 4 × 的两倍。

**题库（10）**：5 道 `input`（6–9 × 2–10，附阵列；错例 `split-slip`（如 6 × 8 写 41）、`skip-count-slip`（± 一组））；3 道 `split-array`（选切线再填部分积）；2 道 `choose`（算 9 × 8 哪种想法对：`10 × 8 − 8` ✓、`10 × 8 − 1` → `split-slip`、`9 + 8` → `added-not-multiplied`）。

---

#### 第 08 步 `remainders` · 有余数的除法（P3 3.3）

**概念**：分不完的叫余数；余数一定比除数小；剩下的怎么办，看题目问什么。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `array{object:curry-puff, layout:scatter, count:14, containers:{kind:box, size:4}}` | — | `14 ÷ 4 = ?` | 14 curry puffs, packed in boxes of 4. | 14 个咖喱角，每 4 个装一盒。 |
| 2 | `array{layout:groups, groups:3, size:4, extra:2, container:box}` | `group` | `14 ÷ 4 = 3 r 2` | 3 boxes are full and 2 are left over. 14 ÷ 4 = 3 remainder 2, written 3 r 2. | 装满 3 盒，还剩 2 个。14 ÷ 4 = 3 余 2，写作 3 r 2。 |
| 3 ⚑ | `array{groups:2, size:4, extra:6, container:box}`，剩下的 6 个里虚线圈出又一盒 | `group` | `14 ÷ 4 ≠ 2 r 6` | If 6 were left over, you could still fill another box. The remainder is always less than the number in each group. | 如果剩下 6 个，还能再装一盒。余数总比每盒的个数少。（`remainder-too-big`） |
| 4 | `array{layout:rows, rows:3, cols:4, extra:2}`（最后一列只排了 2 个） | `arrange` | `3 × 4 + 2 = 14` | Check: 3 boxes of 4 is 12, and 2 more makes 14. Groups times size, plus the remainder, gives back the number you started with. | 验算：3 盒、每盒 4 个是 12 个，再加 2 个是 14 个。商乘除数再加余数，就回到原来的数。（`remainder-dropped`） |
| 5 ⚑ | `array{object:seat, groups:4, size:4, filled:[4,4,4,2], container:car}` | `morph` | `14 ÷ 4 = 3 r 2 → 4` | 14 children, 4 in each car: 3 cars are full, but the 2 left over still need a car, so 4 cars. The question decides what to do with the remainder. | 14 个小朋友，每辆车坐 4 人：3 辆坐满，剩下 2 人还要一辆，所以要 4 辆。余数怎么处理，看题目问什么。（`remainder-context`） |

**要点**：① The remainder is less than the divisor. / 余数比除数小。② quotient × divisor + remainder = the number you started with. / 商 × 除数 + 余数 = 被除数。③ Read the question: a remainder may need one more group, or be left out. / 看清问题：余数可能要再多一组，也可能不算。

**题库（10）**：4 道 `group`（`by: "pack"` 带剩余，`then` 写 `remainder` 形式；除数 2–9、商 ≤ 10）；3 道 `input`（`form: "remainder"`；错例 `"2 r 6"` → `remainder-too-big`、`"3"` → `remainder-dropped`）；3 道 `input`（`whole`，情境题：坐车 / 装满几盒 / 每人分几个，向上或向下取；错例 → `remainder-context`）。

---

#### 第 09 步 `multiplying-tens` · 整十、整百数乘一位数（P3 3.4, 3.5）

**概念**：30 × 4 就是 3 个十乘 4 = 12 个十 = 120；十个十换一个百。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `blocks{value:3, copies:4}` | — | `3 × 4 = 12` | 4 rows of 3 ones make 12 ones. | 4 行、每行 3 个一，一共 12 个一。 |
| 2 ⚑ | `blocks{value:30, copies:4}` | `morph` | `3 tens × 4 = 12 tens` | Now each row is 3 tens. 4 rows of 3 tens make 12 tens: the same 3 × 4, counted in tens. | 现在每行是 3 个十。4 行就是 12 个十：还是 3 × 4，只是数的是十。（`tens-as-ones`） |
| 3 | `blocks{value:120, combined:true, trade:"T>H"}` | `trade` | `12 tens = 1 hundred 2 tens = 120` | Ten tens make a hundred. Trade them: 12 tens is 1 hundred and 2 tens, which is 120. | 10 个十是 1 个百。换一换：12 个十是 1 个百和 2 个十，就是 120。 |
| 4 ⚑ | `blocks{value:200, copies:3}` → `combined` | `combine` | `30 × 4 = 120 · 200 × 3 = 600` | Hundreds work the same way: 2 hundreds × 3 = 6 hundreds = 600. Work out the small fact, then say what you were counting. | 百也一样：2 个百乘 3 = 6 个百 = 600。先算小的那道乘法，再说清楚数的是什么。（`extra-zero`） |

**要点**：① 30 × 4 = 3 tens × 4 = 12 tens = 120. / 30 × 4 = 3 个十 × 4 = 12 个十 = 120。② 10 ones = 1 ten; 10 tens = 1 hundred. / 10 个一是 1 个十，10 个十是 1 个百。

**题库（9）**：3 道 `regroup`（把 14 个十换开写成数 → 140；错例 `"=14"` → `tens-as-ones`）；4 道 `input`（40 × 6、70 × 3、300 × 3、50 × 8；错例 `tens-as-ones`、`extra-zero`）；2 道 `choose`（哪个等于 60 × 3：18 个十 ✓、18 个一 → `tens-as-ones`、18 个百 → `extra-zero`）。

---

#### 第 10 步 `multiplying-in-columns` · 乘法竖式（P3 3.4）

**概念**：先乘个位，满十换一个十加到十位；再乘十位、百位；竖式里的小 1 就是换上去的十。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `blocks{value:26, copies:3, column:{op:"×", a:26, b:3, show:"none"}}` | — | `26 × 3` | 26 × 3: three rows of 2 tens and 6 ones. | 26 × 3：3 行，每行 2 个十和 6 个一。 |
| 2 | 个位推到一起：`left:{O:18}, trade:"O>T"`，`column.show:"ones"` | `combine` | `6 × 3 = 18` | Multiply the ones first: 3 × 6 ones = 18 ones. That is 10 or more, so trade 10 ones for 1 ten. | 先乘个位：3 × 6 个一 = 18 个一。满 10 了，拿 10 个一换 1 个十。 |
| 3 ⚑ | `trade` 完成，`left:{T:1, O:8}`，`column.show:"carry"` | `trade` | `18 = 1 ten 8 ones` | Now 8 ones stay in the ones place, and the traded ten waits above the tens. Writing 18 in the ones place does not fit. | 个位留下 8 个一，换来的 1 个十先写在十位上方。个位上写 18 是放不下的。（`digits-concatenated`） |
| 4 ⚑ | 十位推到一起 + 那 1 个十，`value:78, column.show:"all"` | `combine` | `26 × 3 = 78` | Then the tens: 3 × 2 tens = 6 tens, plus the traded ten makes 7 tens. 26 × 3 = 78. Forgetting the small 1 gives 68. | 再乘十位：3 × 2 个十 = 6 个十，加上换来的 1 个十是 7 个十。26 × 3 = 78。忘了那个小 1，就会得 68。（`carry-not-added`） |
| 5 | `blocks{value:213, copies:4, column:{op:"×", a:213, b:4, show:"all"}}` | `morph` | `213 × 4 = 852` | Three digits work the same way, place by place: ones, then tens, then hundreds. 213 × 4 = 852. | 三位数也一样，一位一位地乘：个位、十位、百位。213 × 4 = 852。（`partial-product-missed`） |

**要点**：① Multiply the ones, then the tens, then the hundreds. / 从个位乘起，再乘十位、百位。② 10 or more in a place: trade 10 for 1 of the next place and add it in. / 哪一位满十，就换成上一位的 1，加进去。

**题库（10）**：6 道 `input`（2–3 位 × 1 位，至少 4 道要进位；错例 `carry-not-added`、`digits-concatenated`、`partial-product-missed`）；2 道 `choose`（"这道竖式哪里出了问题"：选项是一句话 + 小竖式图，错选项各带 code）；2 道 `regroup`（ones 满十换十，再写积）。

---

#### 第 11 步 `dividing-in-columns` · 除法竖式（P3 3.3, 3.4）

**概念**：从最高位分起；分不完的换成下一位再分；哪一位每份分到 0，就写 0。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `blocks{value:72, plates:3, column:{op:"÷", a:72, b:3, show:"none"}}` | — | `72 ÷ 3` | Share 72 into 3 equal groups: 7 tens and 2 ones. | 把 72 平均分成 3 份：7 个十和 2 个一。 |
| 2 | `dealt:{T:2}, left:{T:1, O:2}` | `deal` | `7 tens ÷ 3 = 2 tens r 1 ten` | Share the tens first: each group gets 2 tens, and 1 ten is left. | 先分十：每份 2 个十，剩 1 个十。 |
| 3 ⚑ | `trade:"T>O"`，`left:{O:12}` | `trade` | `1 ten + 2 ones = 12 ones` | The ten left over cannot be shared as a ten, so trade it for 10 ones. Now there are 12 ones. | 剩下的 1 个十没法再分，就换成 10 个一，现在有 12 个一。（`not-traded`） |
| 4 | `dealt:{T:2, O:4}, left:{}`，`column.show:"all"` | `deal` | `72 ÷ 3 = 24` | Share the 12 ones: 4 each. Each group has 2 tens and 4 ones, so 72 ÷ 3 = 24. | 把 12 个一分掉：每份 4 个。每份是 2 个十和 4 个一，72 ÷ 3 = 24。 |
| 5 ⚑ | `blocks{value:412, plates:4, column:{op:"÷", a:412, b:4, show:"all"}}`，十位那格写 0 | `morph` | `412 ÷ 4 = 103` | 412 ÷ 4: 1 hundred each. 1 ten cannot go into 4 groups, so each gets 0 tens: write 0, then trade the ten. 12 ones give 3 each: 103. | 412 ÷ 4：每份 1 个百。1 个十分不到 4 份，每份 0 个十，十位上写 0，再把这个十换开。12 个一每份 3 个：103。（`zero-in-quotient`） |

**要点**：① Divide from the biggest place: hundreds, tens, ones. / 从最高位分起：百、十、一。② What cannot be shared is traded into the next place. / 分不完的换成下一位再分。③ If a place gives 0 each, write the 0. / 哪一位每份分到 0，就写 0。

**题库（10）**：3 道 `share`（在数位块上发、换、发，`then` 写商或商和余数）；5 道 `input`（2–3 位 ÷ 1 位，2 道有余数、2 道商中间有 0；错例 `zero-in-quotient`、`not-traded`、`remainder-too-big`）；2 道 `choose`（找竖式里的问题）。

---

#### 第 12 步 `two-digit-by-two-digit` · 两位数乘两位数（P4 3.1，**桥**，可选）

**概念**：两个数都拆成几十和几个，长方形被切成四块，四块都要算，再加起来；竖式做的是同样的事。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{rect:{w:23, h:14}, cells:true, unit:"unit"}` | — | `23 × 14` | 23 × 14 as a rectangle of squares: 23 along, 14 down. Counting all the squares would take a long time. | 把 23 × 14 画成方格长方形：横 23 格，竖 14 格。一格一格地数要很久。 |
| 2 | `grid{rect:{w:23,h:14}, cuts:[{x:20},{y:10}], cells:false, scale:"schematic"}` | `cut` | `(20 + 3) × (10 + 4)` | Cut it where the tens meet the ones: 20 and 3 across, 10 and 4 down. Now there are four rectangles. | 在十和一的分界处切开：横着是 20 和 3，竖着是 10 和 4。现在是四个长方形。 |
| 3 | 四块依次标 `200`、`30`、`80`、`12`（cold / hot 交替） | `shade` | `200 + 30 + 80 + 12` | Each part is a fact you know, counted in tens or hundreds: 20 × 10, 3 × 10, 20 × 4 and 3 × 4. | 每一块都是你会的乘法，只是数的是十或百：20 × 10、3 × 10、20 × 4、3 × 4。 |
| 4 ⚑ | 同上 + `column:{op:"×", a:23, b:14, show:"all"}` | `merge` | `23 × 14 = 92 + 230 = 322` | Add them: 322. The column method adds the same parts in two rows: 23 × 4 = 92 and 23 × 10 = 230. Leave none of the four parts out. | 加起来是 322。竖式也是这四块，只是写成两行：23 × 4 = 92，23 × 10 = 230。四块一块都不能漏。（`partial-product-missed`、`tens-as-ones`） |

**要点**：① Split both numbers into tens and ones: four parts. / 两个数都拆成几十和几个：一共四块。② The column method adds 23 × 4 and 23 × 10. / 竖式是把 23 × 4 和 23 × 10 加起来。

**题库（8）**：4 道 `input`（11–49 × 11–29，积 ≤ 999；错例 `partial-product-missed`（只算 20 × 10 + 3 × 4）、`tens-as-ones`（第二行写 23 而不是 230））；2 道 `split-figure`（在面积模型上沿十位分界切两刀，再填四个部分积，借 docs/21 的 A4）；2 道 `choose`（哪种拆法对）。

---

### 2.3 练习章 `practice`（8 道固定题，每题一次检查，总结页 + 再做一次）

| # | 题型 | 题目（EN 草稿 / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `group`（share） | Share 18 kueh equally among 3 plates. / 把 18 块 kueh 平均放在 3 个盘子里。 | 每盘 6 | `"6x3"`（摆成 6 盘每盘 3）→ `groups-size-swapped` | 05 |
| Q2 | `arrange` | Make an array for 4 × 6: 4 rows of 6. / 排出 4 × 6 的阵列：4 行，每行 6 个。 | 4 行 6 列 | `"6x4"` → `groups-size-swapped` | 03 |
| Q3 | `split-array` → `input` | Split the 7 × 8 array into facts you know, then write 7 × 8. / 把 7 × 8 的阵列切成会算的两块，再写出 7 × 8。 | 56 | `"=41"`（5 × 8 + 1）→ `split-slip`；`"=48"` → `skip-count-slip`；`"=15"` → `added-not-multiplied` | 07 |
| Q4 | `choose`（multi） | Which stories can be written as 20 ÷ 4? / 哪些故事可以写成 20 ÷ 4？ | ① 20 张贴纸平均分给 4 人 ② 20 张贴纸每 4 张一包 | 只选 ① → `sharing-only`；③ "4 个人每人有 20 张" → `operation-swapped`；④ "20 张，又买了 4 张" → 通用 | 05 |
| Q5 | `input` | ? × 6 = 42 | 7 | 252 → `operation-swapped`；8 → `skip-count-slip` | 06 |
| Q6 | `input`（whole） | 50 pupils go on a trip. Each minivan seats 8. How many minivans are needed? / 50 名学生去参观，每辆小巴坐 8 人。至少要几辆？ | 7 | 6 → `remainder-context`；400 → `operation-swapped` | 08 |
| Q7 | `input` | 135 × 4 | 540 | 420 → `carry-not-added`；41220 → `digits-concatenated`；520 → `partial-product-missed` | 10 |
| Q8 | `share` → `input` | 312 curry puffs are packed equally into 3 boxes. How many in each box? / 312 个咖喱角平均装进 3 个盒子，每盒几个？ | 104 | 14 → `zero-in-quotient`；936 → `operation-swapped` | 11 |

6 种题型（group、arrange、split-array、choose、input、share）；桥章不进练习。总结页一句话 + 表 + "再做一次"，同分数。

---

## 3. 引擎：新模型、新小测类型、误解诊断

### 3.0 三节课共用的引擎泛化（G1–G12；docs/20、21 引用本节）

MathScene 现在是"分数引擎"：值只有 `Frac`，作答框两位数，右上卡叫 FRACTION，PLATE 块写"分数"，误解只有 15 个分数码，朗读只会读分数。乘除、时间、面积三课共用下面这批改动，**一次做完**（施工 E0），再分别加模型。每条写清改哪里。

| # | 改动 | 改哪里 | 说明 |
|---|---|---|---|
| G1 | **值类型**：`Frac` 之外加 `Whole`（整数 0–99 999）、`ClockTime`（午夜起的秒数，数据写 `"09:40"` / `"15:05:30"`，一律 24 时制）、`Duration`（秒，数据写 `"1h35m"`、`"95m"`、`"75s"`）、`Measure`（数 + 单位 `cm` `m` `cm2` `m2` `unit` `unit2`，数据写 `"28 cm2"`） | `schema.ts`（zod 转换器 `whole`、`clockTime`、`duration`、`measure`）、`lib/value.ts`（新，纯函数：解析、比较、格式化） | 分数仍是 `frac`；每个任务字段写明自己的值类型 |
| G2 | **作答托盘的写法**（`input.form`）：`whole`（1–5 位，原来限 2 位）、`remainder`（商 + "r" + 余数两格）、`sentence`（一句印好的算式里几格 `?`，按顺序填）、`time12`（时 : 分 + am / pm 切换）、`time24`（时 : 分，4 位）、`duration`（h + min 或 min + s 两格）、`measure`（数 + 单位芯片 cm / cm² / m / m²） | `tray/Tray.tsx`（拆出 `tray/inputs/*.tsx`）、`lib/check.ts`、`lib/solve.ts sampleState` | 屏上数字键 ≥ 44 px；物理键盘直接打；Tab 切格；`sample` 写法见各模型节 |
| G3 | **右上卡按模型种类换**：FRACTION（分数）、PRODUCT（`a × b = c`、"3 rows of 4"、读法）、PLACE VALUE（百十个三格数字 + 名称）、TIME（数字读数按 D 定的写法 + 读法 "twenty past seven / 七点二十分" + 另一种计时法的对照）、AREA（面积几格 / 几 cm²、周长几段 / 几 cm，实时计数） | `hud/Panels.tsx` → `hud/cards/{Fraction,Product,PlaceValue,Time,Area}Card.tsx` + 注册表；`lib/working.ts cardValue` 按种类 | 规则不变：小测时**不先说答案**（作答前只显示给定量） |
| G4 | **PLATE 块的行按模型种类换**：array（组数 · 每组 · 总数）、blocks（百 · 十 · 一 · 换了几次）、clock（时间 · 拖的针 · 计时法）、timeline（起 · 止 · 已跳）、grid（单位 · 格数 · 边数） | `hud/PlateBlock.tsx` + i18n | 手机隐藏，同现状 |
| G5 | **误解目录分域**：`MISCONCEPTIONS` 改成按域登记（`fractions`、`whole-ops`（本文 §2.1）、`time`（docs/20 §2.1）、`measure`（docs/21 §2.1）），zod 仍是一个扁平 enum；每个 code 一条诊断规则（`lib/diagnose/<domain>.ts`）和单测；validate 拒绝"这种题型诊断不了的 code" | `schema.ts`、`lib/check.ts` → `lib/diagnose/*`、`tests/math-scene/diagnose-*.test.ts` | code 全局唯一 |
| G6 | **节拍过渡**（`BEAT_MOVES`）加：`group`（散 → 圈）、`deal`（一轮一个发）、`arrange`（组 → 行）、`rotate`（转 90°）、`cover`（纸条盖住 / 揭开）、`jump`（数轴上的弧逐个出现）、`combine`（同一位的块推到一起）、`trade`（10 个合成 1 个 / 1 个散成 10 个，同分数的 `merge` / `split` 语法）、`sweep`（钟针顺 / 逆时针走，时针按比例跟）、`tile`（单位方块逐格铺）、`walk`（一个点沿边走一圈，计数跳）；`cut`、`cross`、`shade`、`morph` 复用 | `schema.ts BEAT_MOVES`、`stage/BeatModel.tsx`、各模型组件 | 每个 ≤ 900 ms；`prefers-reduced-motion` 时换成淡入淡出；同分数 G10：CSS / SVG 过渡，不引入补间库 |
| G7 | **文本记号**（字幕、题目、算式、正文）：`{t:09:40}` 时刻（按 D 定的写法显示，朗读 "nine forty a.m. / 上午九点四十分"）、`{d:95m}` 时长（"1 h 35 min / 1 小时 35 分钟"）、`{u:28 cm2}` 量（"28 cm²"，朗读 "28 square centimetres / 28 平方厘米"）；整数照写；`r` 读 "remainder / 余" | `src/lib/rich-text.ts`、`lib/words.ts`（整数到 99 999 的英文 / 中文读法、时刻、时长、单位）、frac-glue（运算符与相邻值不断行） | `words.test.ts` 补全 |
| G8 | **UI 不出现年级**：`math.bridge` 改 "Going further / 再往前一步"；`math.syllabus` 改 "MOE syllabus / 课纲"（不带 `ref`）；阅读面板眉题不写 "P4"；`ref`、`level` 只留在数据里给文档用 | `src/i18n/ui.{en,zh}.json`、`hud/ChapterIndex.tsx` | 分数主题同时生效（D3） |
| G9 | `LESSON_LEVELS` 加 `P1`（地基条目要引用 P1 原文） | `schema.ts` | 只是数据 |
| G10 | **VIEW 组**：`MODEL_VIEWS` 加 `array`、`blocks`、`clock`、`timeline`、`grid` | `schema.ts`、`hud/Overlay.tsx` | 小测时只列"这道题画得出"的模型 |
| G11 | **每步数字上限写进数据**：`steps[].limits`（可选），如 `{ "factors": [2, 5], "maxTotal": 40 }`、`{ "divisor": [2, 9], "maxQuotient": 10 }`、`{ "maxValue": 999 }`、`{ "clock": "12h", "step": 5 }`、`{ "gridMax": [12, 10] }`；validate 与 `check-pool` 用它查题库每道题 | `schema.ts`、`validate.ts`、`scripts/math/check-pool.ts`（加 `--topic` 读本主题的 limits） | 分数沿用全局"分母 ≤ 12"规则，不必写 limits |
| G12 | **自证、截图、e2e 跟上新题型**：每个新 `kind` 有 `solve()`、`sampleState()` 写法、`proveTask`、`__atlas.engine.goToTask` 能到、`pnpm shoot --tasks` 的起始 / 错例 / 做对三张、键盘路径 | `lib/solve.ts`、`lib/proof.ts`、`scripts/shoot.ts`、`tests-e2e/<slug>.spec.ts`、docs/06「MathScene」 | docs/06 同步写新模型、新 `kind`、`sample` 记号 |

不变的：章节轴、阅读面板顺序（章头 → 节拍行 → 小测托盘 → 正文 → 本章索引，docs/08 §2）、抽题与"再来一道 / 跳过"、练习与总结页、URL 只有 `ch` / `b` / `model`、答案与抽到的题不进 URL 和存储、`<Figure>` 已是共享 MDX 组件（MathScene 正文直接可用，施工时确认阅读面板里尺寸与暗色反相正常）。

### 3.1 A1 `array`：等分组 / 排列阵（含整数数轴）

**画面**（技术图版语法：纸面底、1 px 墨线、正投影、无阴影）：

- **物体**（`object`）：`dot`（实心小圆，默认）、`kueh`（方块带三层横线）、`curry-puff`（半月形带褶边）、`egg`（椭圆）、`chopsticks`（一双 = 两根平行细长条，算 1 组 2 根）、`seat`（小方座）、`orange`、`pencil`、`sticker`。都是程序化 SVG 小图形（≤ 6 条路径），40 px 基准，舞台按格子缩放；在 390 px 宽的手机上最小 22 px，点按区补到 44 px。
- **排法**（`layout`）：
  - `scatter`：`count` 个物体按种子固定的蓝噪声位置散在托盘（1 px 圆角矩形框）里，不重叠；
  - `groups`：`groups` 个容器（`container`：`ring` 发丝圈、`plate` 椭圆、`box` 矩形、`bag`、`car` 带 4 个座位格），每个里面 `size` 个，或 `sizes: [2, 5, 5]` 画不等的组；`extra` 个剩余物体放在容器外右侧，下面一条短虚线托着；`filled: [4,4,4,2]` 给 `car` 画部分坐满；
  - `rows`：`rows × cols` 的整齐阵列，行距 = 列距；`extra` 在最右一列从上往下补（"最后一列排不满"）。
- **标注**：`braces: "rows" | "cols" | true` 在左 / 上画花括号与计数 "3 rows / 3 行"、"4 in each row / 每行 4 个"（技术图版的尺寸线语法，不是卡通箭头）；`count` 标签可开关。
- **结构操作**：`split: { rows: [2] } | { cols: [5] }`（在第 2 行后画一条墨色切线，两部分之间留 6 px 缝，各自的括号写部分积）；`cover: { rows: true } | { cols: true }`（一条纸色窄条盖住那一边的计数，上面写 "?"）；`rotate: 90`（整个阵列转 90°，`move: rotate` 时转的过程可见）；`crossed`（墨色斜线划掉的行 / 列 / 物体）。
- **配对画面**：`pair: [ {…}, {…} ]` 两个排法并排（第 05 步"两种问法"），左右各一个小标题。
- **规模上限**：散放 / 组 ≤ 60 个物体；`rows` ≤ 12 × 12（`dot` 时 ≤ 14 × 14）；超出时 validate 报错，改用 A2 或 A4。

**整数数轴**（A1 的附件，第 02 步与时间课共用刻度语法）：`numberline` 加 `scale: "whole"` 分支：`from`、`to`（≤ 100）、`step`（1、2、5、10）、`labels`（`ends` / `tens` / `steps` / `all`）、`marks`、`jumps: { size, count, from? }`（从 `from` 起画 `count` 个弧，弧顶写 "+5"，每个落点一个小空心圆）、`counter: true`（弧下按顺序写 1、2、3…，正面讲"数跳不数刻度"）。分数数轴的写法不变（`scale` 缺省 = `"fraction"`）。

**交互（小测）**：

| kind | 孩子做什么 | 键盘 | 检查 | `sample` 写法 |
|---|---|---|---|---|
| `group` | 字段 `{ total, by: "share" \| "pack", k, then? }`。`share`：舞台上有 k 个空盘，点托盘里的 **Deal one round / 每盘发一个**（一轮给每盘一个），或点一个物体再点一个盘把它放进去；`pack`：点 **Fill a box / 装满一盒**（自动装 k 个），或逐个点放；剩下的留在托盘里。可撤销（⌫） | Tab 到物体 / 容器，Enter 拿起放下；托盘按钮 Tab + Enter | 每个容器里的数相等、容器数与每份数符合题意、剩下的 < k（`pack`）或 = 0（`share` 无余数） | `"4x3"`（4 组每组 3）、`"4x3+2"`（带剩余）；有 `then` 时 `"=…"` 是写下的答案 |
| `arrange` | 字段 `{ rows, cols, accept: "exact" \| "product" }`。舞台左上角一个吸附格点的角柄，拖或点格点拉出 `r × c` 的阵列；托盘里两个 `−/+` 步进器（行、列）做同样的事 | 角柄是 `role="slider"` 二维：←→ 列、↑↓ 行 | `exact`：行列都对；`product`：积对（"用另一种方法排出 12"） | `"3x5"`（3 行 5 列） |
| `skip-count` | 字段 `{ size, count, to }`。整数数轴上依次点落点，每点一下画一道弧；点错的落点可再点撤销 | 数轴游标 `role="slider"`，←→ 一格，Enter 落点 | 落点序列 = `size, 2·size, …, count·size` | `"5,10,15,20"` |
| `split-array` | 字段 `{ rows, cols, at?: {rows?: [], cols?: []}, then: inputSpec(sentence) }`。在阵列上点两行（列）之间放切线（吸附），再在托盘的算式里填各部分与总数 | 切线游标 `role="slider"`，Enter 放线 | 切线把阵列分成两个"会算的"部分（`at` 给定时须一致；未给定时任一切法都行）；再按 `then` 检查 | `"r5"`（第 5 行后切）；`"=35,7,42"` 是写下的几格 |

`input` 照旧，可配 `array` 模型做"看图写数"。

### 3.2 A2 `blocks`：数位块（× ÷ 整十整百、竖式、有余数的除法）

**画面**：

- 三种块，正投影 2D：**百** = 10 × 10 小格的方板（发丝内格线）、**十** = 1 × 10 的长条（9 条内分隔）、**一** = 单个小方块。单位格边长在 1920 宽下 9 px、390 宽下 5 px（个位块点按区补到 44 px：点的是"这一堆个位"，不是单个块）。
- **数位垫**（`mat: true`，默认开）：三列 H / T / O（百 / 十 / 一），列头小号大写 `HUNDREDS · TENS · ONES` + 中文，列间发丝竖线；每列里的块按 5 个一排、10 个两排的固定排法放，读数一眼可数。
- **乘**：`copies: n` 把 `value` 画成 n 行一样的（每行左侧标 "×1、×2…"）；`combined: true` 时各行同一列的块推进同一列（`move: combine`）。
- **除**：`plates: k` 在垫子下方画 k 个圆角矩形盘（每个盘也有 H / T / O 三小格）；`dealt: {H, T, O}` 是每盘已有的块；`left: {H, T, O}` 是垫上还没分的。
- **换**：`trade: "O>T" | "T>H" | "T>O" | "H>T"` 高亮要换的 10 个（或 1 个），`move: trade` 时 10 个一滑到一起合成一条十（反过来一条十裂成 10 个一，同分数的 `merge` / `split` 动画语法），换完的块落到相邻列。
- **竖式**（`column`）：`{ op: "×" | "÷", a, b, show: "none" | "ones" | "carry" | "tens" | "all" }` 在垫子右侧（窄屏在下方）画一个 SVG 竖式：乘法右对齐、换上去的小数字写在上方（signal）、横线发丝；除法用新加坡课本的长除号写法（**待核**：施工前对一页课本确认 `)‾‾` 的画法与商写在上方），商的每一位随拍出现，`0` 照写。竖式里每一位和左边的块列同一行高亮（块与数字一一对应是这一模型的重点）。
- 规模上限：`value` ≤ 999；画面上同时 ≤ 120 个块（超了先 `trade`）。

**交互（小测）**：

| kind | 孩子做什么 | 键盘 | 检查 | `sample` 写法 |
|---|---|---|---|---|
| `regroup` | 字段 `{ value, start: {H,T,O}, then? }`。某列 ≥ 10 时那一列下方出现 **Trade 10 for 1 / 10 个换 1 个**；点它换，直到每列 < 10；再写出这个数（`then`） | Tab 到按钮，Enter | 块的总值不变、每列 < 10，`then` 写对 | `"T>H"`（换了一次）；`"=140"` |
| `share` | 字段 `{ value, k, then: inputSpec(whole \| remainder) }`。从最高位起：点一列的 **Share / 分**（这一列尽量平均发给 k 盘，剩下的留在垫上）；剩下的点 **Trade / 换开** 换到下一列；到个位分完，剩下的是余数 | 同上 | 每盘相等、垫上只剩个位且 < k、`then` 写对 | `"T:2,O:4"`（每盘）、`"=24"`、`"=10 r 2"` |

### 3.3 `input` 的新写法（G2，本课用到的）

- `whole`：`{ answer: 56, form: "whole" }`；数字框 1–5 位。
- `remainder`：`{ answer: "3 r 2", form: "remainder" }`；两格，中间印 "r"。
- `sentence`：`{ sentence: "2 × 8 = ?, 1 × 8 = ?, 3 × 8 = ?", answer: [16, 8, 24], form: "whole" }`；托盘里印好算式，`?` 是格子。
- 配合 `sum` 一类的诊断上下文：`op: { kind: "×" | "÷", a, b }`（让诊断知道是哪道算式，推出 `carry-not-added` 等的错值）。

### 3.4 诊断规则（`lib/diagnose/whole-ops.ts`，纯函数，每条一个单测）

给定 `op = a × b`（或 `a ÷ b`）与孩子的值 `x`：

| code | 规则 |
|---|---|
| `added-not-multiplied` | `x = a + b` |
| `skip-count-slip` | `x = a·b ± a` 或 `x = a·b ± b`（且不是正确值） |
| `split-slip` | 有 `split` 时 `x = 已知部分积 ± 1`（如 5 × 7 + 1） |
| `groups-size-swapped` | `group` / `arrange`：摆出 `b × a` 而题要 `a × b`（`a ≠ b`） |
| `operation-swapped` | 除法题 `x = a × b`；缺因数题 `x = total × known` |
| `divide-order` | `choose` 专用（选了 `b ÷ a` 的选项） |
| `sharing-only` | `choose` 专用（漏选"包含除"选项） |
| `unequal-groups` | `choose` 专用 |
| `remainder-too-big` | `x = q′ r r′` 且 `q′·b + r′ = a`、`r′ ≥ b` |
| `remainder-dropped` | `x = ⌊a / b⌋`（题要 `remainder` 形式） |
| `remainder-context` | 情境题（`round: "up" \| "down"` 字段）答了另一种取法 |
| `tens-as-ones` | `x = a·b / 10^k`（少了一个或几个 0）；两位乘两位时第二个部分积用了 `a × 1` |
| `extra-zero` | `x = a·b × 10` |
| `carry-not-added` | 逐位乘、每位只留个位、不加进位所得的值 |
| `digits-concatenated` | 各位积按位并排拼接的值 |
| `partial-product-missed` | 漏掉一个部分积的值（任一个） |
| `zero-in-quotient` | 正确商去掉中间 0 的值 |
| `not-traded` | 从高位逐位除、余下的不往下换所得的值（如 72 ÷ 3 → `20 r 2`） |

### 3.5 单测与校验

- `tests/math-scene/array.test.ts`（排法、上限、`split` / `cover` 的几何）、`blocks.test.ts`（块数 = 值、换的守恒、竖式每一位）、`diagnose-whole-ops.test.ts`（上表每条至少两个例子、一个反例）、`lesson.test.ts` 扩到本主题（每道题自证：解法通过、起点不通过、每个 `sample` 与错选项诊断正确）。
- `validate.ts`：拍的模型画得出（物体数、行列、块数上限）；`limits` 内；`remainder` 题的余数 < 除数；桥步标了 `bridge`。

---

## 4. 名词表（`glossary.json`，13 个）

| id | EN | ZH | 定义要点（1–2 句 + 例子） |
|---|---|---|---|
| `equal-groups` | equal groups | 相同的几组 | 每组个数一样多的几组。4 组、每组 3 个。 |
| `multiplication` | multiplication, × | 乘法 | 求几个相同的组一共多少。4 × 3 = 12。 |
| `product` | product | 积 | 乘法的结果。4 × 3 的积是 12。 |
| `array` | array | 阵列 | 排成整齐行和列的一组物体；行数 × 每行个数。3 行 4 个。 |
| `skip-counting` | skip counting | 几个几个地数（跳数） | 每次加同样多地数：5、10、15、20。 |
| `times-table` | multiplication table | 乘法表（乘法口诀） | 一个数从 × 1 到 × 10 的全部积。5 的乘法表：5、10、…、50。 |
| `division` | division, ÷ | 除法 | 平均分，或看能分成几组。12 ÷ 3 = 4。 |
| `quotient` | quotient | 商 | 除法的结果。12 ÷ 3 的商是 4。 |
| `remainder` | remainder | 余数 | 平均分后剩下、不够再分一份的数，总比除数小。14 ÷ 4 = 3 r 2，余数是 2（大陆课本写作 14 ÷ 4 = 3……2）。 |
| `dividend-divisor` | dividend, divisor | 被除数、除数 | 12 ÷ 3 里 12 是被除数，3 是除数。（只在名词表） |
| `place-value` | place value | 位值 | 数字所在的位决定它代表几个一、几个十、几个百。352 里的 5 是 5 个十。 |
| `regroup` | regroup (also called renaming) | 换（满十进一 / 退一当十） | 10 个一换 1 个十，或 1 个十换 10 个一；数的大小不变。 |
| `column-method` | column method (algorithm) | 竖式 | 把数按位对齐，一位一位地乘或除的写法。 |

`fact-family`（乘除一家）和 `area-model`（面积模型）只在正文里讲，不进名词表（D 可改）。

---

## 5. 来源（施工时进 `sources.json`，S#；访问日期 2026-10-13）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (implementation starting with 2021 Primary One Cohort; Updated Oct 2025). https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 课纲原文：第 31（P1）、33（P2）、35（P3）、37（P4）、41（P5）页；第 30 页脚注 5；框架第 12–20 页 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | TIMSS 2015 Encyclopedia · Singapore: The Mathematics Curriculum in Primary and Lower Secondary Grades. https://timssandpirls.bc.edu/timss2015/encyclopedia/countries/singapore/the-mathematics-curriculum-in-primary-and-lower-secondary-grades/ | CPA 是新加坡数学的中心教学法 |
| S4 | Common Core Standards Writing Team (2011). *Progressions for the Common Core State Standards in Mathematics (draft): K, Counting and Cardinality; K–5, Operations and Algebraic Thinking*. Tucson: Institute for Mathematics and Education, University of Arizona. （URL 施工时从 https://www.math.arizona.edu/~ime/progressions/ 取，**待核**） | 等分组、阵列、两种除法（how many in each / how many groups）的情境分类；乘除关系 |
| S5 | Common Core Standards Writing Team (2015). *Progressions: K–5, Number and Operations in Base Ten*. 同上（**待核**） | 数位块、换、部分积与竖式为什么成立 |
| S6 | Fischbein, E., Deri, M., Nello, M. S., & Marino, M. S. (1985). The role of implicit models in solving verbal problems in multiplication and division. *Journal for Research in Mathematics Education*, 16(1), 3–17 | 隐含模型：乘 = 重复加，除默认是"分"；选错运算 |
| S7 | Mulligan, J. T., & Mitchelmore, M. C. (1997). Young children's intuitive models of multiplication and division. *JRME*, 28(3), 309–330 | 儿童的直接计数、跳数、加法策略；不等组 |
| S8 | Squire, S., & Bryant, P. (2002). The influence of sharing on children's initial concept of division. *Journal of Experimental Child Psychology*, 81(1), 1–43 | 分享（等分除）先于包含除；`sharing-only` |
| S9 | Silver, E. A., Shapiro, L. J., & Deutsch, A. (1993). Sense making and the solution of division problems involving remainders. *JRME*, 24(2), 117–135 | 情境里的余数（向上 / 向下取、丢余数） |
| S10 | Battista, M. T., Clements, D. H., Arnoff, J., Battista, K., & Van Auken Borrow, C. (1998). Students' spatial structuring of 2D arrays of squares. *JRME*, 29(5), 503–532 | 孩子怎样看出阵列的行列结构（第 03、12 步） |
| S11 | Fuson, K. C., Wearne, D., Hiebert, J. C., Murray, H. G., Human, P. G., Olivier, A. I., Carpenter, T. P., & Fennema, E. (1997). Children's conceptual structures for multidigit numbers and methods of multidigit addition and subtraction. *JRME*, 28(2), 130–162 | 多位数概念结构；把十当成一的错误 |
| S12 | Ashlock, R. B. (2010). *Error Patterns in Computation: Using Error Patterns to Help Each Student Learn* (10th ed.). Boston: Allyn & Bacon | 竖式的典型错误：漏加进位、并排写、商中漏 0、余数过大 |
| S13 | Izsák, A. (2004). Teaching and learning two-digit multiplication: Coordinating analyses of classroom practices and individual student learning. *Mathematical Thinking and Learning*, 6(1), 37–79 | 面积模型与部分积（第 12 步） |
| S14 | NCETM, *Primary Mastery Professional Development: Multiplication and division*（Spine 2）. https://www.ncetm.org.uk/（具体页面 URL **待核**） | "用会的算新的"、阵列与交换律的教学顺序 |
| S15 | Anghileri, J. (1989). An investigation of young children's understanding of multiplication. *Educational Studies in Mathematics*, 20(4), 367–385 | 等组、重复加、数轴跳数的理解阶段 |
| S16 | 教材系列（只作顺序参考，不照抄）：Marshall Cavendish *My Pals Are Here! Maths*（3rd ed.）P1–P3；*Shaping Maths*。MOE 批准教材目录 https://www.moe.gov.sg/education-in-sg/approved-textbook-list | 课步顺序；D5 乘法读法、长除号画法（**待核**） |

事实纪律同 docs/15 §6.2：课纲逐字、注页码；误解的出处写进 `sources.json` 的 `note`；题干不需要来源。

---

## 6. 图像清单（给 Codex）

风格一律照 `scripts/illustrate.ts` 的 `STYLE_BRIEF`（石墨铅笔、19 世纪科学图版、无色、无文字、透明底）。首页图 1:1（`illustrate.ts process`）；章节配图 4:3（`illustrate.ts figure`，生成时把 brief 里的 "1024x1024 square canvas" 换成 "4:3 landscape canvas, 1536x1152"）。

### 6.1 首页图：**保留** `genimg/roadmap/multiplication-division.png`

看过：一个浅托盘，4 行 × 6 格 kueh（每块三层），右下 3 格空着，拿出来的 3 块在托盘前排成一小排。阵列（4 × 6）和"拿出一组"都在画面里，石墨质感、无字、透明底，符合首页语法。保留，`pnpm tsx scripts/illustrate.ts process genimg/roadmap/multiplication-division.png multiplication-division`。

### 6.2 章节配图（可选，3 张）

| id | 章 | 用途（一句话） | SUBJECT（英文，原样交给 Codex） |
|---|---|---|---|
| `figures/md-hawker-trays` | 01 `equal-groups` | 生活里的"相同的几组"：柜台上每盘一样多 | a Singapore hawker stall's glass display cabinet seen straight from the front, three shelves, each shelf holding identical round metal trays, and every tray holding exactly four small square kueh arranged the same way, a pair of serving tongs lying on the counter in front; drawn as a specimen plate, no people, no signboard, no text |
| `figures/md-hdb-windows` | 03 `arrays` | 生活里的阵列：组屋立面的窗户成行成列 | the facade of a Singapore HDB residential block drawn as a flat orthographic elevation, eight storeys of identical windows in six equal bays forming a regular grid, laundry poles under some windows, open void-deck columns at the ground floor, a few trees at the base; drawn as an architectural plate, no text, no numbers |
| `figures/md-curry-puff-boxes` | 08 `remainders` | 余数：装满几盒，剩下的放在一边 | a baker's table seen from slightly above: three small closed cardboard boxes in a row, each known to hold four curry puffs, one open box showing four curry puffs inside, and two loose curry puffs left beside the boxes on a sheet of paper; drawn as a specimen plate, no text |

用法：`<Figure src="figures/md-…" alt={{…}} caption={{…}} />` 放在本章正文第一段之后；alt 与 caption 双语，validate 检查文件存在。

---

## 7. 施工顺序与分工（照 skill `build-order.md`；依赖由主会话预装，本课**不需要新依赖**；子代理不改 `package.json`、不提交）

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | Gavin 定稿 §0；建 `src/content/topics/multiplication-division/{chapters,data}`、`topic.yaml`（`engine: math-scene`、`stage: svg`、`mode: lesson`、`status: draft`、`illustration: multiplication-division`） | `topic.yaml` | — | S |
| 1a | E0（Opus） | §3.0 G1–G12（三课共用，**只做一次**）+ docs/06 | `src/engines/math-scene/**`（除新模型文件）、`src/lib/rich-text.ts`、`src/i18n/ui.*.json`、`scripts/math/check-pool.ts`、`scripts/shoot.ts`、`tests/math-scene/**` | 0 | L |
| 1b | E1（Opus） | A1 `array` + 整数数轴、A2 `blocks`、6 个新 `kind`、`whole-ops` 诊断、单测 | `stage/{ArrayModel,BlocksModel,ColumnWorking}.tsx`、`tray/inputs/*`、`lib/diagnose/whole-ops.ts`、`tests/math-scene/{array,blocks,diagnose-whole-ops}.test.ts` | 1a 的 schema 先合 | M |
| 2 | L（Opus） | `lesson.json`：`syllabus`（P1–P4 原文）、12 步 × 3–5 拍（52 拍，按 §2.2）、`keyFacts`、`limits`、每步 1–2 道样板题、练习 8 题；`pnpm shoot multiplication-division --beats` 逐张看 | `data/lesson.json` | 1b | M |
| 3 | Codex（批量，≤ 4 条并行，`< /dev/null`） | 每步题库其余 7–9 道（brief 照 `references/codex-pool-brief.md` 改：本主题的模型、`kind`、`sample` 记号、`limits`、§2.1 的 code），每份草稿 `check-pool --topic multiplication-division` 到 0 错；12 章英文正文初稿（`codex-text-brief.md`） | `scripts/math/drafts/`（不进 git） | 2 | M（约 95 道 + 12 章） |
| 4 | T（Opus） | 合并题库（审题意、删超纲、改中文）；定稿英文正文；**写中文正文**（12 章 + 00 + 练习章，ZH 400–550 字）；名词表、`sources.json`、`SOURCES.md`；配图 alt / caption | `data/*.json`、`data/SOURCES.md`、`chapters/*.mdx` | 3 | M |
| 4′ | 主会话 + Codex | §6 配图（可与 2–4 并行）：`illustrate.ts process` 首页图，3 张 `figure` | `public/illustrations/**` | 0 | S |
| 5 | P（Sonnet） | 布局、键盘、读屏、两套主题、手机；`pnpm shoot multiplication-division --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`；`tests-e2e/multiplication-division.spec.ts`（点按 / 纯键盘各一条、`group` 与 `share` 的拖与点、错 → 诊断 → 看答案、再来一道、跳过、练习总结、zh、390 × 844） | `tests-e2e/…`、`docs/screenshots/multiplication-division/` | 4 | M |
| 6 | 主会话 | `acceptance.md` 全勾、门槛全绿、截图归档、本文 §9 记录、`git commit`；push 等 Gavin | — | 5 | S |

**三课的引擎次序**：E0（G1–G12）→ E1（A1 + A2，本课）→ A3（docs/20）→ A4（docs/21）。本课第 12 步（桥）依赖 A4，可先上线 01–11、12 随 A4 补。估算：E0 约 1 天，A1 + A2 约 1 天；本课内容（拍 + 题库 + 正文 + QA）约 2 天，与分数主题同量级。

---

## 8. 验收

照 skill `references/acceptance.md` 全部打勾（门槛、讲解优先、HUD 铁律、内容与事实、截图存档），另加本课的：

- [ ] UI 里任何地方都不出现年级（P1–P4 / 小一–小四）：章节轴、阅读面板眉题、本章索引、00 章与练习章正文、右上卡；`grep -n "P[1-6]\b\|[一二三四五六]年级\|小[一二三四五六]" chapters/` 为空（课纲原文的 `ref` 只在数据里）
- [ ] 每步的数字在 `limits` 内（validate 与 `lesson.test` 证明）：P2 的步只用 2、3、4、5、10 的表；有余数的题只在第 08、11 步及练习；竖式不超过 3 位 × / ÷ 1 位（桥除外）
- [ ] §2.1 每个 code 至少一拍正面讲（拍表的 ⚑），且至少一道题库题能诊断它
- [ ] 数位块与竖式一一对应：`pnpm shoot --beats` 的第 10、11 步每一拍，竖式里亮的那一位 = 垫上动的那一列
- [ ] 阵列转 90° 前后物体数相同（单测）；`group` / `share` 的每一步可撤销
- [ ] 情境不重复堆砌（同一物体在全课 ≤ 3 次）、无价格、无品牌；人名多族群
- [ ] 截图：第 01、05、10 章 + 练习章与一道小测，1920 × 1080、1280 × 720、390 × 844（paper；外加一张 cinema、一张 zh）

## 9. 施工记录 / 已知差距

施工时追加。
