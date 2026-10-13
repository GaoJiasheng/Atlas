# 20 · 时间 · 内容 spec（`telling-time`，MathScene 课；v1 草案，待 Gavin 定稿）

docs/17 §6 #2。2026-10-13 起草，**只做规划，不施工、不建目录、不提交**。照 skill `.claude/skills/atlas-lesson-topic/` 与样板 docs/15（分数，§10）写；三课共用的引擎泛化（G1–G12）见 **docs/19 §3.0**，本文只写本课用到哪几条、新模型 A3（钟面 + 时间线）和时间域的误解诊断。

记号同 docs/19：EN 字幕与题目是口吻草稿（施工时 Codex 起草全文、Claude 核对），ZH 是 Claude 草稿；S1 = MOE *Mathematics Syllabus Primary One to Six*（2021 Primary One Cohort，Updated Oct 2025），页码是 PDF 上印的页码。字幕里的时刻写成 G7 记号：`{t:19:20}` = 12 时制带 am / pm，`{t:7:20|face}` = 钟面读法（不带 am / pm），`{t:19:20|24}` = 24 时制，`{d:95m}` = 时长（§3.3）。

---

## 0. 待定稿的决定（Gavin 确认）

| # | 决定 | 建议 |
|---|---|---|
| D1 | **对象与主体**：Measurement and Geometry · Measurement 的 Time 一线。**P2 + P3 为主体**：P1 的"读到 5 分钟、am / pm、h 和 min、一小时 / 半小时"是地基（第 01、04、05 步），P2 的"读到每一分钟、h 和 min 互换"（第 02、03、05 步），P3 的"秒、已知其二求第三、24 小时制"（第 06–11 步）。P4 以后课纲没有 Time 条目，**本课没有桥** | 同意 |
| D2 | 课的形状同分数改版后：每章 3–5 拍 + 一道随机小测（8–10 道题库，"再来一道""跳过"）；练习 8 道固定题 | 同意 |
| D3 | **UI 不出现年级**（docs/19 D3、G8） | 同意 |
| D4 | **新模型 A3**：钟面 `clock`（两针联动、可拖、时长弧、24 时内圈、秒针）+ 时间线 `timeline`（一天 0–24 h 或一段时间、跳段弧）；新小测类型 `read-clock`、`set-clock`、`duration`；`input` 加 `time12`、`time24`、`duration` 三种写法（§3） | 同意 |
| D5 | **12 时制的写法**：课纲写 'am' 和 'pm'（S1 第 32 页）；新加坡课本常见 "7.20 a.m."（点作分隔、a.m. 带点，**待核**：施工前翻 *My Pals Are Here!* P1 / P2 时间章）。引擎把写法做成主题级设置（`notation.clock12`），字幕与题目只写记号 `{t:…}`，换写法不改数据 | 先按课本核实结果定；未核前默认 `7.20 am`（课纲的 am / pm + 新加坡常见的点） |
| D6 | **24 时制的写法**：`19:20`、`1920` 还是 `19 20`（**待核**，同上翻 P3 课本）；ZH 读作"19 时 20 分" | 同 D5，做成 `notation.clock24` |
| D7 | **"past / to"**：P1–P2 只讲 "past"（"20 minutes past 7""half past 3""quarter past"），"quarter to / 差一刻"只在名词表里出现一次 | 同意（课纲没点名 "to"，少一套说法少一个误区） |
| D8 | **中文读法**：正文用口语"3 点 40 分""3 点半"，名词表注明课本写法"3 时 40 分"；24 时制读"15 时 15 分"；am / pm 译"上午 / 下午"，晚上的 pm 在正文里说"晚上 7 点（pm）" | 同意或改 |
| D9 | **情境**：上学、课间休息（recess）、CCA、游泳课、巴士换乘站（interchange）、MRT、晚饭；**不写真实时刻表或真实班次**（全部是虚构的题目情境，不声称事实）；不写宗教节日的具体时刻 | 同意 |
| D10 | **背景章 00**：同 docs/19 D10（不写年级） | 同意 |
| D11 | **章节配图**：§6 的 4 张（钟楼、钟的齿轮、一天里的太阳、巴士换乘站），放在第 01、02、04、11 章；首页图沿用已有的挂钟 + 怀表 | 同意；可晚于课上线 |

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字）

Measurement and Geometry · SUB-STRAND: MEASUREMENT · Time。

| 级 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|
| P1 | 2. Time — 2.1 telling time to 5 minutes · 2.2 use of 'am' and 'pm' · 2.3 use of abbreviations h and min · 2.4 duration of one hour/half hour | 32 | 地基：第 01、04、05 步 |
| **P2** | 2. Time — 2.1 telling time to the minute · 2.2 measuring time in hours and minutes · 2.3 converting time in hours and minutes to minutes only, and vice versa | 34 | 第 02、03、05、06 步 |
| **P3** | 2. Time — 2.1 measuring time in seconds · 2.2 finding the starting time, finishing time or duration given the other two quantities · 2.3 24-hour clock | 36 | 第 06–11 步 |
| P4–P6 | 无 Time 条目（第 39、42、44 页） | — | — |

核对要点：
- **am / pm 在 P1**（2.2），**24 小时制在 P3**（2.3）；"一小时 / 半小时的时长"在 P1（2.4），"已知其二求第三"在 P3（2.2）。
- P2 的 "measuring time in hours and minutes"（2.2）是"量一段时间有几小时几分"，本课放在第 05 步（时长的单位）和第 06 步（量时长）的开头；跨整点的经过时间计算按 P3 2.2 写。
- 课纲没有"秒与分的互换"字样，只有 "measuring time in seconds"（P3 2.1）；第 09 步讲到"1 min 15 s = 75 s"作为 2.1 的自然延伸，题库只出 ≤ 2 min 的互换（D 可改为只读秒表）。
- 2021 版 P1–P6 没有 speed，时间与速率不连。

### 1.2 级别、步数与时间

- **11 个课步 + 练习章 + 背景章 00**（12 个带编号的章）。
- 拍数 46（≈ 15 min），小测 11 道（≈ 7 min），练习 8 道（≈ 5 min）：**全课约 27 分钟**；P2 的孩子做 01–05（约 11 分钟），P3 的孩子做 06–11（约 13 分钟）。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字 |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | — | — | — | — |
| 01 | `the-clock-face` | Two hands on one face | 钟面上的两根针 | P1 2.1 | clock | 4 | 9 · read-clock / set-clock / choose | 整点、半点、5 分钟 |
| 02 | `hands-move-together` | The hour hand moves too | 时针也在走 | P1 2.1 · P2 2.1 | clock（时针轨迹） | 4 | 9 · read-clock / choose / set-clock | 5 分钟，偏向接近整点的时刻 |
| 03 | `to-the-minute` | Reading to the minute | 读到每一分钟 | P2 2.1 | clock（分钟刻度） | 4 | 10 · read-clock / set-clock / choose | 每一分钟 |
| 04 | `am-and-pm` | Morning, afternoon and night | 上午和下午 | P1 2.2 | timeline（一天）+ clock | 4 | 9 · choose / read-clock / input | 整点、半点 |
| 05 | `hours-and-minutes` | Hours and minutes | 小时和分钟 | P1 2.3, 2.4 · P2 2.2, 2.3 | clock（时长弧）+ timeline（时长） | 4 | 10 · input / choose | ≤ 3 h，≤ 180 min |
| 06 | `how-long` | How long did it take? | 经过了多长时间 | P2 2.2 · P3 2.2 | timeline（跳段）+ clock | 5 | 10 · duration / input / choose | 跨 1–3 个整点，≤ 3 h |
| 07 | `finishing-time` | When does it end? | 什么时候结束 | P3 2.2 | timeline + clock | 4 | 9 · duration / set-clock / choose | 时长 ≤ 2 h 30 min，可跨中午 |
| 08 | `starting-time` | When did it start? | 什么时候开始 | P3 2.2 | timeline + clock | 4 | 9 · duration / input / choose | 同上 |
| 09 | `seconds` | Seconds | 秒 | P3 2.1 | clock（秒针）/ stopwatch | 4 | 8 · read-clock / input / choose | ≤ 2 min |
| 10 | `twenty-four-hour-clock` | The 24-hour clock | 24 小时计时法 | P3 2.3 | timeline（一天，双标尺）+ clock（内圈 13–24） | 5 | 10 · input（time24 / time12）/ choose | 全天 |
| 11 | `timetables` | Timetables and time problems | 时刻表与时间问题 | P3 2.2, 2.3 | timeline（24 时，带标记）| 4 | 9 · duration / input / choose | 24 时制，≤ 3 h |
| 12 | `practice` | Practice | 练习 | P1–P3 全部 | 按题 | — | 8 道固定题 | — |

### 1.4 不在本课

- 日历、星期、月份、年（课纲 2021 版 P1–P6 没有日历条目）。
- 跨午夜的时长（如 22:30 到 01:15）：P3 2.2 没排除，但课本少见，题库不出，只在第 10 步讲 00:00 的意思。
- 时区、夏令时、秒以下单位；速度。
- 数字钟以外的计时器读数（沙漏、日晷）只在配图里出现，不作内容。

---

## 2. 课的设计

### 2.0 写法约定

同 docs/19 §2.0；另加：
- 时刻一律写记号（`{t:…}`），不写死"7.20 am"一类的字符串，以便按 D5 / D6 统一换写法；钟面读法（P1–P2，不问上下午时）用 `|face`。
- 时长写 `{d:…}`，显示为 "1 h 35 min / 1 小时 35 分钟"；算式行的加减用 "+ 25 min"、"− 1 h"。
- 颜色：给定的时刻（开始）= cold，第二个时刻（结束）= hot，孩子拖的针 / 放的标记 / 跳的弧 = signal，"看答案" = 墨色虚线。钟针本身是墨色；孩子在拖的那根针变 signal。

### 2.1 误解目录（时间域，`lib/diagnose/time.ts`）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `hands-swapped` | 时针分针读反 | 7:20 读成 4:36 | "The long hand shows the minutes and the short hand shows the hour." / "长针表示分，短针表示时。" | S6、S7 |
| `next-hour` | 读时针快到的那个数 | 2:50 读成 3:50 | "The hour hand has not reached 3 yet, so it is still 2 o'clock and some minutes." / "时针还没到 3，所以还是 2 点多。" | S8、S5 |
| `hour-hand-on-numeral` | 以为半点、几十分时时针正指着整数 | 选"时针指 4、分针指 6"的钟当 4:30 | "At half past 4 the hour hand is halfway between 4 and 5." / "4 点半时，时针在 4 和 5 中间。" | S8、S9 |
| `numeral-as-minutes` | 把分针指的数字当成分钟 | 7:20 读成 7:04 | "On the minute hand, each number means 5 more minutes: 4 means 20 minutes." / "对分针来说，每个数代表 5 分钟：指着 4 是 20 分。" | S6、S9 |
| `five-count-slip` | 5 个 5 个地数时多数 / 少数一次 | 7:28 读成 7:33 或 7:23 | "Count in 5s up to the last number the hand has passed, then count the small marks." / "5 个 5 个数到分针走过的最后一个数，再数小格。" | S9 |
| `am-pm` | 上午下午弄反 | 晚饭写 7.00 am | "7.00 am is in the morning. Dinner is in the evening, so pm." / "上午 7 点是早上。晚饭在晚上，是 pm。" | S7 |
| `noon-midnight` | 中午 / 午夜 12 点弄反 | 中午 12:30 写成 12.30 am；午夜写成 24:00 或 12:00（24 时制） | "12 noon to 1 pm is pm. In the 24-hour clock, midnight is 00:00." / "中午 12 点到下午 1 点之间是 pm。24 时制里，午夜是 00:00。" | S7 |
| `base-100` | 把时间当成十进制（1 小时当 100 分） | 2 h 15 min = 215 min；11.15 − 9.40 = 1.75；10.45 + 50 min = 10.95 | "An hour is 60 minutes, not 100. Jump to the next full hour first." / "1 小时是 60 分钟，不是 100 分钟。先跳到下一个整点。" | S4、S5 |
| `count-endpoints` | 数整点刻度而不是数整点之间的段 | 9 点到 12 点数成 4 小时 | "Count the jumps between the hour marks, not the marks." / "数整点之间跳了几段，不是数有几个整点。" | S4、S10 |
| `wrong-direction` | 求开始时间却往后加，求结束时间却往前减 | 4.10 pm 结束、用了 1 h 25 min，答 5.35 pm | "The trip started before it ended. Go back from 4.10 pm." / "开始一定在结束之前。从下午 4 点 10 分往回推。" | S4 |
| `24h-offset` | 12 / 24 时制互换时加减 10，或忘了加 12 | 3.15 pm 写 13:15 或 03:15；19:40 读成 9.40 pm | "After noon, add 12 to the hour: 3 + 12 = 15." / "下午的时刻，小时数加 12：3 + 12 = 15。" | S7、S11 |

每个 code 至少在一拍里正面讲（拍表 ⚑），至少一道题库题能诊断它。

### 2.2 逐步设计

拍表的列同 docs/19。模型写法见 §3（简写）。

---

#### 第 01 步 `the-clock-face` · 钟面上的两根针（P1 2.1，地基）

**概念**：短针指几时，长针指几分；分针每走过一个数是 5 分钟。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `clock{time:"03:00", numerals:true, ticks:"minutes"}` | — | `{t:3:00|face}` | A clock face has 12 numbers and two hands. The short hand is the hour hand. The long hand is the minute hand. | 钟面上有 12 个数和两根针。短的是时针，长的是分针。 |
| 2 | 同上，两针轮流高亮 | `shade` | `{t:3:00|face}` | At 3 o'clock the minute hand points straight up at 12, and the hour hand points at 3. | 3 点整，分针指着 12，时针指着 3。 |
| 3 ⚑ | `clock{time:"03:30", hourTrack:true}` | `sweep` | `{t:3:30|face}` | Half an hour later the minute hand has gone halfway round, to 6. The hour hand has moved too: it is halfway between 3 and 4. This is half past 3. | 过了半小时，分针走了半圈，指着 6。时针也走了，停在 3 和 4 正中间。这是 3 点半。（`hour-hand-on-numeral`） |
| 4 ⚑ | `clock{time:"03:40", minuteLabels:true}` | `sweep` | `{t:3:40|face}` | Each number the minute hand passes is 5 more minutes: 5, 10, 15 … 40. At 8 it is 40 minutes past 3. | 分针每走过一个数，就多 5 分钟：5、10、15……40。分针指着 8，就是 3 点 40 分。（`numeral-as-minutes`） |

**要点**：① The short hand shows the hour, the long hand the minutes. / 短针是时针，长针是分针。② For the minute hand, each number is 5 minutes. / 对分针来说，每个数是 5 分钟。

**题库（9）**：4 道 `read-clock`（整点、半点、5 分钟；错例 `numeral-as-minutes`（3:08）、`hands-swapped`）；3 道 `set-clock`（`snap: 5`，"把钟拨到 9 点 15 分"；错例 `next-hour` 的样例 `"10:15"`）；2 道 `choose`（哪个钟是 4 点半：时针正指 4 的画法 → `hour-hand-on-numeral`）。

---

#### 第 02 步 `hands-move-together` · 时针也在走（P1 2.1 · P2 2.1）

**概念**：分针走一圈，时针只走一格；读"几点"看时针已经走过的那个数。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `clock{time:"02:00", hourTrack:true}` | — | `{t:2:00|face}` | Watch both hands while the minute hand goes once round the face. | 分针转一整圈，看看两根针各怎么走。 |
| 2 | `clock{time:"03:00", hourTrack:{from:"02:00"}}` | `sweep` | `60 min = 1 h` | One full turn of the minute hand is 60 minutes. In that time the hour hand moves only from 2 to 3, one number. | 分针转一整圈是 60 分钟。这段时间里，时针只从 2 走到 3，走了一格。 |
| 3 ⚑ | `clock{time:"02:45", zoom:"hour"}` | `sweep` | `{t:2:45|face}` | At 2.45 the hour hand is most of the way to 3, but it has not reached 3. The hour is still 2. | 2 点 45 分，时针快到 3 了，但还没到，所以还是 2 点多。（`next-hour`） |
| 4 ⚑ | `pair:[clock{time:"04:30"}, clock{time:"04:30", faulty:"hour-on-numeral"}]` | `morph` | `{t:4:30|face}` | A clock with the hour hand right on 4 and the minute hand on 6 cannot be real. At half past 4 the hour hand is halfway to 5. | 时针正指 4、分针指 6 的钟是画错的。4 点半时，时针走到了 4 和 5 中间。（`hour-hand-on-numeral`） |

**要点**：① The hour hand moves one number in an hour. / 一小时里时针走一格。② The hour is the number the hour hand has passed. / 几点，看时针已经走过的那个数。

**题库（9）**：4 道 `read-clock`（2:50、7:55、11:40 一类接近整点的；错例 `next-hour`）；3 道 `choose`（哪个钟是 4:45：正确 / 时针正指 4（`hour-hand-on-numeral`）/ 5:45（`next-hour`）/ 长短针画反（`hands-swapped`））；2 道 `set-clock`（拨到 6:50，看时针停在哪里）。

---

#### 第 03 步 `to-the-minute` · 读到每一分钟（P2 2.1）

**概念**：先 5 个 5 个地数到分针走过的最后一个数，再一格一格地数。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `clock{time:"07:25", minuteLabels:true}` | — | `{t:7:25|face}` | The minute hand is on 5: that is 25 minutes past 7. | 分针指着 5：7 点 25 分。 |
| 2 ⚑ | `clock{time:"07:28", ticks:"minutes", highlightTicks:[26,27,28]}` | `sweep` | `{t:7:28|face}` | Now it is 3 small marks past the 5. Count 25, then 26, 27, 28: 28 minutes past 7. | 现在分针过了 5 又走了 3 小格。先数到 25，再数 26、27、28：7 点 28 分。（`five-count-slip`） |
| 3 ⚑ | 同上，长短针轮流描边 | `shade` | `{t:7:28|face}` | Read the long hand for the minutes and the short hand for the hour. Reading them the other way round gives a different time. | 长针读分，短针读时。读反了，就成了另一个时刻。（`hands-swapped`） |
| 4 | 同上 + 数字读数 | `morph` | `{t:7:28|face} · {t:7:05|face}` | We write it {t:7:28|face}. The minutes always have two digits, so 5 minutes past 7 is {t:7:05|face}. | 写作 {t:7:28|face}。分钟总写两位，7 点 5 分写作 {t:7:05|face}。 |

**要点**：① Count in 5s, then in 1s. / 先 5 个 5 个数，再一个一个数。② Minutes are written with two digits. / 分钟写两位数。

**题库（10）**：5 道 `read-clock`（任意分钟；错例 `five-count-slip`、`numeral-as-minutes`、`hands-swapped`）；3 道 `set-clock`（`snap: 1`）；2 道 `choose`（哪个写法是 8 点 6 分：`8.06` ✓、`8.6`（通用）、`6.08` → `hands-swapped`）。

---

#### 第 04 步 `am-and-pm` · 上午和下午（P1 2.2）

**概念**：一天时针走两圈，同一个钟面读数一天出现两次；午夜到中午是 am，中午到午夜是 pm。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `timeline{scale:"day", from:"00:00", to:"24:00", bands:"ampm", labels:"12h"}` + `clock{time:"07:00"}` | — | `{t:7:00|face}` | The hour hand goes round twice a day, so 7 o'clock happens twice: once in the morning, once in the evening. | 时针一天转两圈，所以 7 点一天有两次：早上一次，晚上一次。 |
| 2 | 时间线标记 `07:00`（cold），am 段描边 | `place` | `{t:07:00}` | From midnight to noon the times are am. 7.00 am is in the morning, before school starts. | 从午夜 12 点到中午 12 点是 am（上午）。上午 7 点是早上，还没上学。 |
| 3 | 标记 `19:00`（hot），pm 段描边 | `place` | `{t:19:00}` | From noon to midnight the times are pm. 7.00 pm is in the evening, around dinner time. | 从中午 12 点到午夜 12 点是 pm（下午、晚上）。晚上 7 点，差不多吃晚饭了。（`am-pm`） |
| 4 ⚑ | 标记 `12:00`、`00:00`、`12:30` | `place` | `{t:12:00} · {t:00:00} · {t:12:30}` | 12 noon is the middle of the day, and 12 midnight starts a new day. Half an hour after noon is 12.30 pm. | 中午 12 点是一天的正中，午夜 12 点是新一天的开始。中午 12 点过半小时，写作 12.30 pm。（`noon-midnight`） |

**要点**：① am: from midnight to noon. pm: from noon to midnight. / am：午夜到中午；pm：中午到午夜。② The same clock reading happens twice a day. / 同一个钟面读数，一天出现两次。

**题库（9）**：4 道 `choose`（这件事是 am 还是 pm：上学、课间休息、晚饭、睡觉；错例 → `am-pm`）；3 道 `read-clock`（`ampm: "ask"`，钟面 + 时间线上的一个标记；错例 `am-pm`、`noon-midnight`）；2 道 `input`（"中午 12 点过 1 小时是几点？"写 time12；错例 `"1:00 am"` → `noon-midnight`）。

---

#### 第 05 步 `hours-and-minutes` · 小时和分钟（P1 2.3, 2.4 · P2 2.2, 2.3）

**概念**：1 h = 60 min；几小时几分换成分钟，先把小时换成 60 分钟一份；反过来，每 60 分钟凑一小时。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `clock{time:"04:00", arc:{from:"04:00", to:"05:00"}}` | — | `1 h = 60 min` | One full turn of the minute hand takes 1 hour, which is 60 minutes. We write h for hours and min for minutes. | 分针转一整圈是 1 小时，也就是 60 分钟。小时写作 h，分钟写作 min。 |
| 2 | `clock{arc:{from:"04:00", to:"04:30"}}` | `sweep` | `{d:30m}` | Half a turn is half an hour: 30 minutes. | 转半圈是半小时：30 分钟。 |
| 3 ⚑ | `timeline{scale:"duration", to:"120m", minor:10, jumps:[["0m","60m"],["60m","80m"]]}` | `jump` | `1 h 20 min = 60 min + 20 min = 80 min` | 1 h 20 min is one full hour and 20 minutes more: 60 + 20 = 80 minutes. An hour is 60 minutes, not 100. | 1 小时 20 分钟是一整个小时再多 20 分钟：60 + 20 = 80 分钟。1 小时是 60 分钟，不是 100 分钟。（`base-100`） |
| 4 | `timeline{scale:"duration", to:"120m", jumps:[["0m","60m"],["60m","95m"]]}` | `jump` | `95 min = 60 min + 35 min = 1 h 35 min` | Going back: take out 60 minutes for each hour. 95 minutes is 60 + 35, so 1 h 35 min. | 反过来，每 60 分钟凑成 1 小时。95 分钟是 60 + 35，就是 1 小时 35 分钟。 |

**要点**：① 1 h = 60 min. / 1 小时 = 60 分钟。② h and min to min: 60 for each hour, then add the minutes. / 几小时几分化成分钟：每小时 60 分钟，再加上分钟数。

**题库（10）**：6 道 `input`（`duration` 或 `whole`：2 h 15 min → 135 min，150 min → 2 h 30 min，1 h 5 min → 65 min；错例 `base-100`（215、1 h 50 min））；2 道 `choose`（哪个和 90 min 一样长）；2 道 `input`（钟面时长弧读几分钟：3:10 到 3:55 → 45 min）。

---

#### 第 06 步 `how-long` · 经过了多长时间（P2 2.2 · P3 2.2）

**概念**：在时间线上跳：先跳到下一个整点，再跳整小时，最后跳剩下的分钟；把几段加起来。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `timeline{from:"09:00", to:"12:00", minor:5, marks:[{at:"09:40",tone:"cold"},{at:"11:15",tone:"hot"}]}` | — | `{t:09:40} → {t:11:15}` | A school concert runs from 9.40 am to 11.15 am. How long is it? | 学校音乐会从上午 9 点 40 分到 11 点 15 分。一共多长时间？ |
| 2 | `jumps:[["09:40","10:00"]]` | `jump` | `+ 20 min` | Jump to the next full hour first: 9.40 to 10.00 is 20 minutes. | 先跳到下一个整点：9 点 40 分到 10 点是 20 分钟。 |
| 3 ⚑ | `jumps:[…,["10:00","11:00"]]` | `jump` | `+ 1 h` | Then jump whole hours: 10.00 to 11.00 is 1 hour. Count the jumps between hour marks, not the marks. | 再跳整小时：10 点到 11 点是 1 小时。数整点之间跳了几段，不是数有几个整点。（`count-endpoints`） |
| 4 | `jumps:[…,["11:00","11:15"]]` + 钟面时长弧 | `jump` | `20 min + 1 h + 15 min = 1 h 35 min` | Then the last part: 15 minutes. Altogether 1 h 35 min. | 最后一段 15 分钟。一共 1 小时 35 分钟。 |
| 5 ⚑ | 同上，旁边划掉的竖式 `11.15 − 9.40 = 1.75` | `cross` | `11.15 − 9.40 ≠ 1.75` | Subtracting 11.15 − 9.40 like ordinary numbers gives 1.75, which is not a time. Minutes stop at 60, not 100. | 把 11.15 − 9.40 当普通的数来减，得 1.75，这不是一个时间。分钟到 60 就进一小时，不是到 100。（`base-100`） |

**要点**：① Jump to the next hour, then whole hours, then the minutes left. / 先跳到整点，再跳整小时，最后跳剩下的分钟。② Add the jumps. / 把每一跳加起来。

**题库（10）**：5 道 `duration`（`ask: "length"`；在时间线上用 +1 h / +10 min / +5 min / +1 min 跳，再写 h + min；错例 `base-100`（`"1h75m"`）、`count-endpoints`）；3 道 `input`（两只钟，读开始、结束，写经过时间）；2 道 `choose`（哪种跳法对）。

---

#### 第 07 步 `finishing-time` · 什么时候结束（P3 2.2）

**概念**：从开始时刻往后跳：先跳到整点，再跳剩下的；跨过中午时 am 变 pm。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `timeline{from:"14:00", to:"16:00", marks:[{at:"14:35",tone:"cold"}]}` + `clock{time:"14:35"}` | — | `{t:14:35} + {d:50m}` | A swimming lesson starts at 2.35 pm and lasts 50 minutes. When does it end? | 游泳课下午 2 点 35 分开始，上 50 分钟。几点结束？ |
| 2 | `jumps:[["14:35","15:00"]]`，钟面分针走到 12 | `jump` | `+ 25 min → {t:15:00}` | Jump to 3.00 pm. That uses 25 of the 50 minutes. | 先跳到下午 3 点，用掉了 50 分钟里的 25 分钟。 |
| 3 | `jumps:[…,["15:00","15:25"]]`，`marks` 加 `15:25`（hot） | `jump` | `{t:14:35} + {d:50m} = {t:15:25}` | 25 minutes are left: 3.00 pm + 25 min = 3.25 pm. | 还剩 25 分钟：下午 3 点再过 25 分钟是 3 点 25 分。 |
| 4 ⚑ | `timeline{from:"11:00", to:"13:00", bands:"ampm", jumps:[["11:40","12:00"],["12:00","12:25"]]}` | `morph` | `{t:11:40} + {d:45m} = {t:12:25}` | Crossing 12 noon changes am to pm: 11.40 am + 45 min = 12.25 pm. Writing 11.85 forgets that an hour ends at 60 minutes. | 跨过中午 12 点，am 就变成 pm：上午 11 点 40 分再过 45 分钟是 12.25 pm。写成 11.85，是忘了 60 分钟就是一小时。（`base-100`、`am-pm`） |

**要点**：① Start time + duration = finishing time. / 开始时刻 + 经过时间 = 结束时刻。② Jump to the next hour first. / 先跳到下一个整点。

**题库（9）**：5 道 `duration`（`ask: "end"`；错例 `base-100`（`"=10:95"`）、`am-pm`）；2 道 `set-clock`（"把钟拨到结束的时刻"）；2 道 `choose`。

---

#### 第 08 步 `starting-time` · 什么时候开始（P3 2.2）

**概念**：从结束时刻往回跳；用往前加来验算。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `timeline{from:"14:00", to:"17:00", marks:[{at:"16:10",tone:"hot"}]}` | — | `? + {d:1h25m} = {t:16:10}` | A bus trip ends at 4.10 pm after 1 h 25 min. When did it start? | 一趟巴士下午 4 点 10 分到站，路上用了 1 小时 25 分钟。几点出发的？ |
| 2 ⚑ | `jumps:[["16:10","15:10"]]`（向左的弧） | `jump` | `− 1 h → {t:15:10}` | The trip started before it ended, so go back, not forward. Jump back 1 hour to 3.10 pm. | 出发一定在到站之前，所以往回推，不是往后加。先往回跳 1 小时，到下午 3 点 10 分。（`wrong-direction`） |
| 3 | `jumps:[…,["15:10","15:00"]]` | `jump` | `− 10 min → {t:15:00}` | Then back 10 minutes to the full hour, 3.00 pm. 15 of the 25 minutes are still to go. | 再往回 10 分钟，到整点下午 3 点。25 分钟里还差 15 分钟。 |
| 4 | `jumps:[…,["15:00","14:45"]]`，`marks` 加 `14:45`（cold） | `jump` | `{t:16:10} − {d:1h25m} = {t:14:45}` | Back 15 more minutes: 2.45 pm. Check forwards: 2.45 pm + 1 h 25 min = 4.10 pm. | 再往回 15 分钟：下午 2 点 45 分。往前验算：2 点 45 分过 1 小时 25 分钟，正好 4 点 10 分。 |

**要点**：① Finishing time − duration = starting time. / 结束时刻 − 经过时间 = 开始时刻。② Check by adding forwards. / 往前加一遍来验算。

**题库（9）**：5 道 `duration`（`ask: "start"`；错例 `wrong-direction`、`base-100`）；2 道 `input`（钟面 + 一句话）；2 道 `choose`。

---

#### 第 09 步 `seconds` · 秒（P3 2.1）

**概念**：秒针一圈是 1 分钟 = 60 秒；很短的时间用秒量。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `clock{time:"10:15:00", second:true}` | — | `1 min = 60 s` | The thin hand is the second hand. It goes once round in 1 minute, which is 60 seconds, written 60 s. | 细细的那根是秒针。它转一圈是 1 分钟，也就是 60 秒，写作 60 s。 |
| 2 | `clock{time:"10:15:15", second:true}` | `sweep` | `{d:15s}` | For the second hand, each small mark is 1 second, just as each small mark is 1 minute for the minute hand. | 对秒针来说，每一小格是 1 秒；对分针来说，每一小格是 1 分钟。 |
| 3 ⚑ | `clock{face:"stopwatch", elapsed:"75s"}` | `sweep` | `1 min 15 s = 60 s + 15 s = 75 s` | This stopwatch shows 1 min 15 s. That is 60 + 15 = 75 seconds, not 115. | 秒表显示 1 分 15 秒，就是 60 + 15 = 75 秒，不是 115 秒。（`base-100`） |
| 4 | `pair:[clock{face:"stopwatch", elapsed:"40s"}, clock{time:"10:55", arc:{from:"10:15", to:"10:55"}}]` | `morph` | `s · min · h` | Seconds measure short times, like a race across the school field. Minutes and hours measure longer ones, like a lesson. | 很短的时间用秒，比如跑过学校操场；长一些的用分钟、小时，比如一节课。 |

**要点**：① 1 min = 60 s. / 1 分钟 = 60 秒。② Use seconds for short times. / 很短的时间用秒来量。

**题库（8）**：3 道 `read-clock`（读秒表 / 秒针，≤ 2 min）；3 道 `input`（1 min 25 s → 85 s，100 s → 1 min 40 s；错例 `base-100`）；2 道 `choose`（量这件事用秒、分还是小时）。

---

#### 第 10 步 `twenty-four-hour-clock` · 24 小时计时法（P3 2.3）

**概念**：从午夜 00:00 一直数到 23:59，不用 am / pm；下午的时刻小时数加 12。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `timeline{scale:"day", from:"00:00", to:"24:00", labels:"both"}`（上 24 时、下 12 时） | — | `{t:00:00|24} … {t:23:59|24}` | The 24-hour clock counts the hours of the whole day from midnight, 00:00, up to 23:59. It needs no am or pm. | 24 小时计时法从午夜 00:00 一直数到 23:59，不用写 am 或 pm。 |
| 2 | 标记 `07:30` | `place` | `{t:07:30} = {t:07:30|24}` | Morning times keep their numbers: 7.30 am is 07:30. There are always four digits, so a 0 goes in front. | 上午的时刻数字不变：上午 7 点 30 分是 07:30。总写四位，所以前面补一个 0。 |
| 3 ⚑ | 标记 `15:15`，上下两条标尺之间连一条竖线 | `place` | `{t:15:15} = {t:15:15|24}` | After noon, add 12 to the hour: 3.15 pm is 3 + 12 = 15, so 15:15. Adding 10 would give 13:15, which is 1.15 pm. | 中午以后，小时数加 12：下午 3 点 15 分，3 + 12 = 15，写作 15:15。加 10 就成了 13:15，那是下午 1 点 15 分。（`24h-offset`） |
| 4 | `clock{time:"19:40", inner24:true}` | `morph` | `19:40 → 19 − 12 = 7 → {t:19:40}` | To go back, take 12 away: 19:40 is 7.40 pm. The small numbers inside this clock face are the afternoon and evening hours. | 反过来，减去 12：19:40 是晚上 7 点 40 分。钟面里圈的小数字，就是下午和晚上的钟点。 |
| 5 ⚑ | 时间线标记 `12:00`、`00:00`、`12:45`、`00:45` | `place` | `{t:12:00|24} · {t:00:00|24}` | 12 noon is 12:00, and 12 midnight is 00:00, the start of a new day. So 12.45 pm is 12:45, but 12.45 am is 00:45. | 中午 12 点是 12:00，午夜 12 点是 00:00，新一天的开始。所以中午 12 点 45 分是 12:45，半夜 12 点 45 分是 00:45。（`noon-midnight`） |

**要点**：① Morning: same numbers, four digits. / 上午：数字不变，写四位。② After noon: add 12 to the hour. / 中午以后：小时数加 12。③ Noon is 12:00; midnight is 00:00. / 中午是 12:00，午夜是 00:00。

**题库（10）**：4 道 `input`（`time24`：12 时 → 24 时；错例 `24h-offset`（`"13:15"`、`"03:15"`）、`noon-midnight`）；3 道 `input`（`time12`：24 时 → 12 时；错例 `24h-offset`（`"9:40 pm"`））；3 道 `choose`（哪个 24 时制时刻是晚饭时间 / 午夜后）。

---

#### 第 11 步 `timetables` · 时刻表与时间问题（P3 2.2, 2.3）

**概念**：时刻表用 24 小时计时法；用同样的跳法求经过时间、开始、结束时刻；需要时换回 12 时制。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `timeline{from:"13:00", to:"17:00", labels:"24h", marks:[{at:"13:50",label:{en:"bus leaves",zh:"巴士开出"},tone:"cold"},{at:"14:35",label:{en:"bus arrives",zh:"巴士到站"},tone:"hot"}]}` | — | `{t:13:50|24} → {t:14:35|24}` | Timetables use the 24-hour clock. This bus leaves the interchange at 13:50 and arrives at 14:35. | 时刻表用 24 小时计时法。这趟巴士 13:50 从换乘站开出，14:35 到站。 |
| 2 | `jumps:[["13:50","14:00"],["14:00","14:35"]]` | `jump` | `10 min + 35 min = 45 min` | Jump to 14:00, then to 14:35: 10 + 35 = 45 minutes on the bus. | 先跳到 14:00，再跳到 14:35：10 + 35 = 45 分钟。 |
| 3 | 加两段：等车 `14:35→14:55`、坐 MRT `14:55→16:05`（hot） | `jump` | `{t:14:35|24} + {d:20m} = {t:14:55|24} · + {d:1h10m} = {t:16:05|24}` | After a 20-minute wait, Siti takes the MRT for 1 h 10 min. 14:35 + 20 min = 14:55, and 14:55 + 1 h 10 min = 16:05. | Siti 等了 20 分钟，再坐 1 小时 10 分钟的 MRT。14:35 过 20 分钟是 14:55，14:55 过 1 小时 10 分钟是 16:05。 |
| 4 | 整段描边 `13:50→16:05`，下方 12 时标尺 | `shade` | `{t:13:50|24} → {t:16:05|24} = {d:2h15m} · {t:16:05}` | The whole journey is 13:50 to 16:05, which is 2 h 15 min. In 12-hour time she arrives at 4.05 pm. | 整趟路从 13:50 到 16:05，一共 2 小时 15 分钟。换成 12 时制，她下午 4 点 05 分到。 |

**要点**：① Timetables use the 24-hour clock. / 时刻表用 24 小时计时法。② Same jumps: to the hour, whole hours, minutes left. / 跳法一样：先到整点，再整小时，再剩下的分钟。

**题库（9）**：5 道 `duration`（全部 24 时制；`ask` 三种都有；错例 `base-100`、`wrong-direction`、`24h-offset`）；2 道 `input`（读一张两行的小时刻表，写经过时间）；2 道 `choose`（"要在 15:30 前到，坐哪一班"）。时刻表全是虚构的，不写真实线路号与站名之外的班次信息（D9）。

---

### 2.3 练习章 `practice`（8 道固定题）

| # | 题型 | 题目（EN / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `read-clock` | What time does the clock show? / 钟面上是几点几分？（钟面 7:20） | {t:7:20|face} | `"7:04"` → `numeral-as-minutes`；`"4:36"` → `hands-swapped` | 01、03 |
| Q2 | `set-clock` | Set the clock to 2.50. / 把钟拨到 2 点 50 分。 | 2:50 | `"3:50"` → `next-hour` | 02 |
| Q3 | `choose` | Which clock shows 4.45? / 哪个钟是 4 点 45 分？ | 时针在 4、5 之间靠近 5 的钟 | 时针正指 4 → `hour-hand-on-numeral`；5:45 → `next-hour`；长短针画反 → `hands-swapped` | 02 |
| Q4 | `input`（`whole`） | 2 h 15 min = ? min / 2 小时 15 分钟 = ? 分钟 | 135 | 215 → `base-100` | 05 |
| Q5 | `duration`（length） | A film starts at 2.40 pm and ends at 4.15 pm. How long is it? / 电影下午 2 点 40 分开始、4 点 15 分结束，放了多长时间？ | {d:1h35m} | `"1h75m"` → `base-100` | 06 |
| Q6 | `duration`（end） | A swimming lesson starts at 10.45 am and lasts 50 min. When does it end? / 游泳课上午 10 点 45 分开始，上 50 分钟。几点结束？ | {t:11:35} | `"=10:95"` → `base-100`；`"=11:35 pm"` → `am-pm` | 07 |
| Q7 | `input`（`time24`） | Write 7.20 pm in 24-hour time. / 把晚上 7 点 20 分写成 24 时制。 | {t:19:20|24} | `"17:20"`、`"07:20"` → `24h-offset` | 10 |
| Q8 | `duration`（start，24 时） | A bus reached the interchange at 15:05 after a 40-min ride. When did it leave? / 巴士 15:05 到换乘站，路上 40 分钟。几点开出的？ | {t:14:25|24} | `"=15:45"` → `wrong-direction`；`"=14:65"` → `base-100` | 08、10 |

5 种题型（read-clock、set-clock、choose、input、duration）。

---

## 3. 引擎：A3 钟面与时间线

### 3.0 用到的共用泛化（docs/19 §3.0）

G1（`ClockTime`、`Duration` 值）、G2（`time12`、`time24`、`duration`、`whole` 写法）、G3（TIME 卡）、G4（clock / timeline 的 PLATE 行）、G5（时间域误解）、G6（`sweep`、`jump`、`place`、`morph`、`cross`）、G7（`{t:…}`、`{d:…}` 记号与读法）、G8–G12 全部。另加本课的 **主题级写法设置**（D5 / D6）：

```json
// lesson.json 顶层（新字段，可选；缺省 = 下面的值）
"notation": { "clock12": "h.mm am", "clock24": "HH:MM" }
```

`clock12` 可选 `"h.mm am"`（7.20 am）、`"h.mm a.m."`（7.20 a.m.）、`"h:mm am"`；`clock24` 可选 `"HH:MM"`（19:20）、`"HHMM"`（1920）、`"HH MM"`。所有显示（字幕、题目、算式行、TIME 卡、时间线标尺、托盘）都走这一处；中文读法不受影响（"晚上 7 点 20 分""19 时 20 分"）。

### 3.1 A3a `clock`：钟面

**画面**（技术图版语法）：

- 圆形钟面，1.5 px 墨线外圈 + 发丝内圈；**60 个分钟刻度**（发丝短线），每第 5 个加长加粗；**1–12 数字**（衬线体，与站内标题同族，大小随舞台缩放，手机最小 13 px）。
- 可选层：`minuteLabels: true` 在外圈之外写小号 `05 10 … 55`（第 01 步数 5 分钟用）；`inner24: true` 在数字内侧写小号 `13 … 24`（第 10 步）；`ticks: "minutes" | "fives" | "none"`；`highlightTicks: [26, 27, 28]`（这几格变 signal，数格子用）。
- **针**：时针短而宽（墨色实心，长 0.5 r），分针长而细（0.8 r），秒针最细（hot，带短尾配重，`second: true` 才画）。角度严格按真钟：时针 = 30° × (h mod 12) + 0.5° × m + s / 120，分针 = 6° × m + 0.1° × s，秒针 = 6° × s。孩子在拖的那根针变 signal。
- `hourTrack: true | { from }`：时针扫过的扇形用淡斜线画出（"一小时只走一格"）。
- `arc: { from, to }`：时长弧——外圈内侧一条环带（signal 斜线），从开始时刻的分针位置顺时针扫到结束；超过 60 分钟时每满一小时多一圈同心环，环端写 "1 h"；`arc` 与 `marks` 的开始 / 结束端点用 cold / hot 小三角标出。
- `zoom: "hour"`：放大时针尖端附近，两侧数字放大（第 02 步第 3 拍）。
- `face: "stopwatch"`：秒表画法（上方按钮、60 秒刻度、中心小表盘记分钟），`elapsed: "75s"`。
- `faulty: "hour-on-numeral" | "hands-swapped"`：**只用于讲解拍与 `choose` 的错选项**——故意画错的钟（时针正指数字 / 长短针对调），钟面右下角一个小 "×" 记号不出现在选项里（不剧透），validate 禁止 `faulty` 出现在 `set-clock` / `read-clock` 的题面模型上。
- `ampm` 小牌：钟心下方一块发丝框小牌写 "am" / "pm"（`ampm: "show"`），`"ask"` 时写 "?"。
- 数据里的时刻一律 24 时制字符串（`"14:35"`、`"10:15:15"`），钟面只显示 12 时制位置；`ampm` 由时刻推出。

**行为**：

- **拖分针**：指针绕中心拖动，角度 → 分钟（`snap: 1 | 5`），**时针按比例跟着走**（真钟联动，永远不会出现"时针停在数字上"）；顺时针越过 12 小时数 +1，逆时针 −1；`ampm` 显示时越过中午 / 午夜翻转。
- **拖时针**：按整小时移动（分钟不变），吸附到 12 个小时扇区。
- **点按替代**：钟圈外 12 个点按区（每个 ≥ 44 px，覆盖数字），点一下分针跳到那个数（= 5 分钟的倍数）；托盘里有步进器：时 −/+、分 −5 / −1 / +1 / +5。
- **键盘**：钟面是一个 `role="slider"`（`aria-valuetext` = 读法，如 "seven twenty / 七点二十分"）；← → ± 1 min，Shift + ← → ± 5 min，PgUp / PgDn ± 1 h，Home = 12:00。
- `move: sweep`：节拍过渡时分针按时间顺序扫过（≤ 900 ms，长时长按比例压缩，时针同步），减少动效时直接淡入。

### 3.2 A3b `timeline`：时间线

**画面**：水平标尺（工程标尺语法，同整数数轴），主刻度写整点，次刻度 `minor`（5、10、15、30 分钟）只画线；`labels: "12h" | "24h" | "both"`（`both` 时上标尺 24 时、下标尺 12 时，两条标尺对齐）；`scale: "day"`（00:00–24:00）或 `"span"`（`from`–`to`，≤ 6 h）或 `"duration"`（`0m`–`to`，标"0、1 h、2 h"）。

- `bands: "ampm"`：00:00–12:00、12:00–24:00 两段底色极淡的区分（纸色 / 纸色 + 5 % 墨，不用彩色），段上方小号大写 "AM · 上午"、"PM · 下午"；中午、午夜两条竖发丝线加标签。
- `marks: [{ at, tone, label? }]`：小三角 + 引线标签（cold / hot / signal）。
- `jumps: [[from, to], …]`：每段一道弧（向右的弧在上方，向左的弧在下方），弧顶写 "+ 20 min" / "− 1 h"，弧端小空心圆；`move: jump` 时逐段画出。
- 与钟面并排：`clock` 可带 `timeline` 子对象，或节拍用 `pair`；联动时拖钟面针，时间线上的 signal 标记同步走。

**交互**：时间线上的标记是 `role="slider"`（← → 一个 `minor`，Shift 一小时）；`duration` 题里托盘有跳段芯片（§3.4）。

### 3.3 文本记号（G7 的时间部分）

| 记号 | 显示（按 `notation`） | 朗读 EN | 朗读 ZH |
|---|---|---|---|
| `{t:19:20}` | 7.20 pm | seven twenty p.m. | 晚上七点二十分 |
| `{t:7:20|face}` | 7.20 | seven twenty | 七点二十分 |
| `{t:19:20|24}` | 19:20 | nineteen twenty | 十九时二十分 |
| `{d:95m}` / `{d:1h35m}` | 1 h 35 min / 1 小时 35 分钟 | one hour thirty-five minutes | 一小时三十五分钟 |
| `{d:75s}` | 1 min 15 s（或按记号原样 75 s） | seventy-five seconds | 七十五秒 |

ZH 显示里 `{d:…}` 用"小时 / 分钟 / 秒"，算式行（中英共用）用 h / min / s。am / pm 在 ZH 字幕里写成"上午 / 下午 / 晚上"，算式行与时间线照 `notation`。

### 3.4 小测类型

| kind | 字段 | 孩子做什么 | 键盘 | 检查 | `sample` 写法 |
|---|---|---|---|---|---|
| `read-clock` | `{ model: clock, answer: "07:20", form: "time12" \| "time24" \| "face", ampm?: "given" \| "ask" }` | 看钟面（可有时间线），在托盘里填时、分（`ask` 时再选 am / pm） | 数字直接打，Tab 切格，am / pm 是 `radiogroup` | 时刻相等（`face` 只比 12 时位置） | `"7:20"`、`"7:20 pm"`、`"19:20"` |
| `set-clock` | `{ target: "14:50", snap: 1 \| 5, ampm?: true }` | 拖分针 / 时针，或点数字、用步进器 | §3.1 键盘 | 钟面时刻 = 目标（`ampm` 时连上下午） | `"3:50"` |
| `duration` | `{ ask: "length" \| "end" \| "start", start?, end?, length?, model: timeline (+clock), answer: inputSpec }` | 从已知时刻出发，点托盘芯片 **+1 h / +10 min / +5 min / +1 min**（求开始时是 **−**）在时间线上跳，每跳一段画一弧；跳到满意后在托盘里写答案（`duration` 或 `time12` / `time24` 写法） | 芯片 Tab + Enter；⌫ 撤销一跳 | 只检查写下的答案；跳段是脚手架，不判对错（题目写明 "use the timeline if it helps"） | `"1h35m"`；`"=11:35 am"`；`"=14:25"` |

`input` 用于换算（`form: "whole"` 配 `convert: { from: "2h15m", to: "min" }`，或 `form: "duration"` 配 `convert: { from: "95m" }`），诊断时知道源值。

### 3.5 诊断规则（`lib/diagnose/time.ts`）

给定正确时刻 `T = h:m`（12 时位置）、孩子答 `x`：

| code | 规则 |
|---|---|
| `hands-swapped` | `x.h = ⌊m / 5⌋`（0 记 12），`x.m = ⌊(h mod 12) × 5 + m / 12⌋`（把时针位置当分钟读） |
| `next-hour` | `x.h = h + 1`（mod 12），`x.m = m`，且 `m > 0` |
| `hour-hand-on-numeral` | `choose` 专用（`faulty: "hour-on-numeral"` 的选项） |
| `numeral-as-minutes` | `x.h = h`，`x.m = m / 5`（`m` 是 5 的倍数且 ≥ 10） |
| `five-count-slip` | `x.h = h`，`|x.m − m| = 5` |
| `am-pm` | 12 时位置相同、上下午相反（不含 12 点那一小时） |
| `noon-midnight` | 12:xx 的上下午相反；或 24 时制里午夜写成 `24:xx` / `12:xx` |
| `base-100` | 把 1 h 当 100 min（或 1 min 当 100 s）算出的值：h/min → min（2h15m → 215）；min → h/min（150 min → 1h50m）；两时刻相减按小数减（11:15 − 9:40 → `1h75m`）；时刻加减分钟时分钟位超过 59 不进位、不足 0 按 100 借位（10:45 + 50 → `10:95`，15:05 − 40 → `14:65`） |
| `count-endpoints` | 时长：`x = 正确 + 1 h`，且起止之间至少跨一个整点 |
| `wrong-direction` | `ask: "start"` 时 `x = end + length`；`ask: "end"` 时 `x = start − length` |
| `24h-offset` | 12 → 24：`x.h = h + 10`，或下午时刻没加 12（`x.h = h`）；24 → 12：`x.h = H − 10` |

每条至少两个正例、一个反例的单测（`tests/math-scene/diagnose-time.test.ts`）；`clock.test.ts` 测针角公式（含秒）、拖动吸附、越过 12 的进位与上下午翻转、`faulty` 的禁用位置。

### 3.6 校验

`validate.ts`：时刻字符串合法（00:00–23:59:59）；`limits`（如第 01 步 `{ "step": 5 }`、第 05 步 `{ "maxDuration": "180m" }`、第 07–08 步 `{ "maxDuration": "150m" }`、第 06–11 步不跨午夜）；`faulty` 只在节拍和 `choose` 选项里；`read-clock` 的 `form: "face"` 不配 `ampm: "ask"`。

---

## 4. 名词表（`glossary.json`，13 个）

| id | EN | ZH | 定义要点 |
|---|---|---|---|
| `clock-face` | clock face | 钟面 | 写着 1–12 和 60 个小格的圆面，针在上面转。 |
| `hour-hand` | hour hand | 时针 | 短针，一小时走一个数，转两圈是一天。 |
| `minute-hand` | minute hand | 分针 | 长针，一小时转一圈；每走过一个数是 5 分钟。 |
| `second-hand` | second hand | 秒针 | 最细的针，一分钟转一圈。 |
| `hour` | hour (h) | 小时（h） | 1 h = 60 min。课本也写"时"。 |
| `minute` | minute (min) | 分钟（min） | 1 min = 60 s。课本也写"分"。 |
| `second` | second (s) | 秒（s） | 很短的时间单位。 |
| `am-pm` | am, pm | 上午（am）、下午（pm） | am：午夜到中午；pm：中午到午夜。 |
| `noon-midnight` | noon, midnight | 中午 12 点、午夜 12 点 | 中午是一天的正中（12:00），午夜是新一天的开始（00:00）。 |
| `duration` | duration | 经过的时间（时长） | 从开始到结束一共多久。9.40 am 到 11.15 am 是 1 h 35 min。 |
| `starting-finishing-time` | starting time, finishing time | 开始时刻、结束时刻 | 开始时刻 + 经过的时间 = 结束时刻。 |
| `24-hour-clock` | 24-hour clock | 24 小时计时法 | 从 00:00 数到 23:59，不用 am / pm；下午 3 点是 15:00。 |
| `timeline` | timeline | 时间线 | 像尺一样标着钟点的线，用来跳着数经过的时间。 |

"quarter past / 一刻""quarter to / 差一刻"写在 `minute-hand` 条的第二句里（D7）。

---

## 5. 来源（访问日期 2026-10-13）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (2021 P1 cohort; Updated Oct 2025). https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 课纲原文第 32、34、36 页；第 39、42、44 页无 Time 条目 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | TIMSS 2015 Encyclopedia · Singapore (mathematics curriculum). https://timssandpirls.bc.edu/timss2015/encyclopedia/countries/singapore/the-mathematics-curriculum-in-primary-and-lower-secondary-grades/ | CPA |
| S4 | Kamii, C., & Russell, K. A. (2012). Elapsed time: Why is it so difficult to teach? *Journal for Research in Mathematics Education*, 43(3), 296–315 | 经过时间的难点：单位换算、数端点、十进制干扰 |
| S5 | Earnest, D. (2017). Clock work: How tools for time mediate problem solving and reveal understanding. *JRME*, 48(2), 191–223 | 钟面与时间线两种工具；时针位置与经过时间 |
| S6 | Friedman, W. J., & Laycock, F. (1989). Children's analog and digital clock knowledge. *Child Development*, 60(2), 357–371 | 读钟的发展顺序；时针分针读反 |
| S7 | Burny, E., Valcke, M., & Desoete, A. (2009). Towards an agenda for studying learning and instruction focusing on time-related competences in children. *Educational Studies*, 35(5), 481–492 | 时间能力的综述：am / pm、24 时制、常见错误 |
| S8 | Burny, E., Valcke, M., & Desoete, A. (2012). Clock reading: An underestimated topic in children with mathematics difficulties. *Journal of Learning Disabilities*, 45(4), 351–360 | 读钟错误类型（时针接近整点、半点时的时针位置） |
| S9 | Harris, S. (2008). It's about time: Difficulties in developing time concepts. *Australian Primary Mathematics Classroom*, 13(1), 28–31（**待核**卷期页） | 教师向的读钟误区：数字当分钟、5 分钟数错 |
| S10 | Dixon, J. K. (2008). Tracking time: Representing elapsed time on an open timeline. *Teaching Children Mathematics*, 15(1), 18–24（**待核**页码） | 空白时间线跳段法（第 06–08、11 步的模型依据） |
| S11 | Long, K., & Kamii, C. (2001). The measurement of time: Children's construction of transitivity and unit iteration. *School Science and Mathematics*, 101(3), 125–132（**待核**） | 时间单位的迭代；时长概念 |
| S12 | 教材系列（只作顺序参考）：Marshall Cavendish *My Pals Are Here! Maths* P1–P3 时间章；*Shaping Maths*。MOE 批准教材目录 https://www.moe.gov.sg/education-in-sg/approved-textbook-list | D5 / D6 写法核对（**待核**）、课步顺序 |

---

## 6. 图像清单（给 Codex）

风格同 docs/19 §6（`STYLE_BRIEF`；章节配图 4:3，`illustrate.ts figure`）。

### 6.1 首页图：**保留** `genimg/roadmap/telling-time.png`

看过：一只圆形挂钟（1–12 阿拉伯数字、分钟刻度、两针约 10:10）斜放，右下一只带链环的怀表，同样的钟面语法；石墨、透明底、无多余文字（钟面数字是物体本身的一部分，可以）。时针位置正确地落在 10 和 11 之间靠近 10，没有"时针停在数字上"的错误。保留，`illustrate.ts process genimg/roadmap/telling-time.png telling-time`。

### 6.2 章节配图（可选，4 张）

| id | 章 | 用途 | SUBJECT（英文，原样交给 Codex） |
|---|---|---|---|
| `figures/tt-clock-tower` | 01 `the-clock-face` | 公共场所的钟：大家看同一个钟面对时间 | a white colonial-era civic clock tower in Singapore with a square tower, arched windows, a tiled roof and one large round clock face with plain numerals and two hands showing about twenty past four, tropical trees at its base; drawn as an architectural plate, no people, no signage |
| `figures/tt-clock-gears` | 02 `hands-move-together` | 为什么分针转一圈时针只走一格：钟里的齿轮把转速减到 1/12 | the movement of a simple mechanical wall clock seen from behind with the back plate removed, showing the minute wheel and the hour wheel on one centre post, the small reduction gears between them and the escapement, with the hands visible through the dial edge; drawn as an engineering plate in exploded three-quarter view, no text |
| `figures/tt-day-arc` | 04 `am-and-pm` | am / pm：太阳一天里从东到西，同一个钟点早上、晚上各一次 | a quiet Singapore HDB estate seen from a low angle, with the path of the sun drawn as a dotted arc from the left horizon to the right horizon and the sun shown as a small plain disc at seven evenly spaced positions along it, a thin crescent moon low on the far left; drawn as an astronomical plate, no faces on the sun or moon, no text |
| `figures/tt-bus-interchange` | 11 `timetables` | 时刻表在哪里用：巴士换乘站 | a Singapore bus interchange berth seen from the passenger queue area: a double-decker bus at the kerb, a covered walkway with steel columns, queue railings and a blank departure board mounted on a pillar; drawn as an architectural plate, the board left blank, no text, no route numbers, no logos |

---

## 7. 施工顺序与分工

同 docs/19 §7 的阶段表，本课的差别：

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | §0 定稿（D5 / D6 先翻课本核实写法）；建 `src/content/topics/telling-time/{chapters,data}`、`topic.yaml`（`illustration: telling-time`） | `topic.yaml` | — | S |
| 1 | E2（Opus） | A3 `clock` + `timeline`、`read-clock` / `set-clock` / `duration`、`notation` 设置、`time` 诊断、`{t}` `{d}` 记号与读法、单测、docs/06 | `stage/{ClockModel,Timeline}.tsx`、`tray/inputs/{Time,Duration}*.tsx`、`lib/{time.ts,diagnose/time.ts}`、`tests/math-scene/{clock,timeline,diagnose-time}.test.ts` | docs/19 E0（G1–G12） | M–L（拖针几何与联动是本课最难的一块） |
| 2 | L（Opus） | `lesson.json`：`syllabus`（P1–P3）、`notation`、11 步 × 4–5 拍（46 拍）、`keyFacts`、`limits`、每步 1–2 道样板题、练习 8 题；`pnpm shoot telling-time --beats` | `data/lesson.json` | 1 | M |
| 3 | Codex | 题库其余约 85 道（brief：时间域 code、`{t}` 记号、"不写真实班次"）；11 章英文初稿 | `scripts/math/drafts/` | 2 | M |
| 4 | T（Opus） | 合并题库、定稿英文、**写中文正文**（读法"7 点 20 分"统一）、名词表、来源 | `data/*`、`chapters/*` | 3 | M |
| 4′ | 主会话 + Codex | 首页图 process、4 张配图 | `public/illustrations/**` | 0 | S |
| 5 | P（Sonnet） | QA 同 docs/19；e2e 另加：拖分针时针跟着走（读 `aria-valuetext`）、越过 12 的进位、点数字代替拖、纯键盘拨钟、`duration` 芯片跳段与撤销、`notation` 换写法后全课截图一致 | `tests-e2e/telling-time.spec.ts`、`docs/screenshots/telling-time/` | 4 | M |
| 6 | 主会话 | 验收、提交 | — | 5 | S |

估算：A3 约 1–1.5 天；内容约 2 天。本课不依赖 A1 / A2 / A4。

---

## 8. 验收

照 skill `references/acceptance.md` 全部打勾，另加：

- [ ] UI 不出现年级（同 docs/19 §8 第一条）
- [ ] 钟面几何：任何时刻时针角 = 30h + 0.5m（+ s/120），单测覆盖 0:00、3:30、2:45、11:59、12:00、23:59:59；`faulty` 只出现在讲解拍和 `choose` 错选项
- [ ] 拖针：分针越过 12 时小时数进 / 退一，`ampm` 显示时中午 / 午夜翻转；点数字与步进器可完成每道 `set-clock`；纯键盘可完成
- [ ] 写法一致：把 `notation` 换成另一种，`pnpm shoot telling-time --beats --tasks` 全部重拍无失败，任何地方没有写死的"7.20 am"
- [ ] 朗读：每个 `{t}` `{d}` 在 EN / ZH 下读法正确（`words.test.ts`）
- [ ] 题库数字在 `limits` 内；不跨午夜；情境不写真实班次
- [ ] §2.1 每个 code 有 ⚑ 拍、有能诊断它的题
- [ ] 截图：第 01、06、10 章 + 练习章与一道小测，三种尺寸（paper；外加 cinema、zh 各一张）

## 9. 施工记录 / 已知差距

施工时追加。
