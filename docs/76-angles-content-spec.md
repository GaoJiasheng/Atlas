# 76 · 角 · 内容 spec（`angles`，MathScene 课；v1 草案，待 Gavin 定稿）

Gavin 2026-11-15 选定的四节新课之一（另三节：docs/77 `graphs`、docs/78 `average`、docs/79 `symmetry`）。docs/17 §2.3–2.5 的 `angles` 一行（"P3–P5 一个主题三段：可转动的两条射线，扫过的转动量就是角"）与 §7 **A5 角模型**。2026-11-15 起草，**只出 spec，不施工、不建目录、不提交**。照 skill `.claude/skills/atlas-lesson-topic/`（SKILL.md + `references/` 全部）写；布局与密度照 docs/21（面积与周长）、docs/29（小数）、docs/39（展开图）。

记号同 docs/21：EN 字幕与题目是**口吻草稿**，施工时 Codex 起草英文全文、Claude 逐句核对；ZH 是 Claude 草稿，施工时 Claude 独立定稿。S1 = MOE *Mathematics Syllabus Primary One to Six*（Implementation starting with 2021 Primary One Cohort，页脚 "Updated: Oct 2025"），**本文起草时用 `pdftotext -layout` 从 PDF 逐页抄录**，页码是每页页脚印的 "Page | N"（这份 PDF 的页序号与页脚号一致）。

---

## 0. 决定

| # | 决定 | 建议 |
|---|---|---|
| D1 | **对象**：Measurement and Geometry · SUB-STRAND: GEOMETRY 的 **Angles 一线三段**：P3「1. Angles」1.1–1.2（第 01–03 步）、P4「1. Angles」1.1–1.3（第 05–07 步）、P5「1. Angles」1.1–1.4（第 08–11 步）；外加 P3「2. Perpendicular and Parallel Lines」2.1–2.2（第 04 步，docs/17 §2.3 写"并入 angles"，见 §0.1 Q2） | 同意 |
| D2 | **课的形状**同分数改版后（docs/15 §10）：每章 3–5 拍 + 章末一道随机小测（题库 8–10 道，"再来一道""跳过"都在）；练习章 8 道固定题；背景章 00 | 同意 |
| D3 | **UI 不出现年级**（docs/19 D3）。一个主题用三年（女儿 2027 P3 做 01–04，2028 P4 做 05–07，2029 P5 做 08–11）；分段只写在数据的 `level` 里（§0.1 Q1） | 同意 |
| D4 | **新模型 A5 `angle`**（§3.1）：从一个顶点出发的射线（或穿过顶点的直线）、角弧、直角小方块、点的字母、量角器（内外两圈刻度）、折纸直角板；过渡 `turn`（射线转动，弧跟着长）、`lay`（量角器 / 直角板滑到位）、`overlay`（一个角叠到另一个上比较）。**复用**：钟面 `clock`（第 02 步一拍，接 `telling-time`）、方格 `grid` 的点阵（第 04 步画垂线、平行线）、`fold` 过渡（第 02 步折直角板，同分数的"折"） | 同意 |
| D5 | **新小测**：`measure-angle`（摆量角器 + 读数）、`draw-angle`（转第二条边到给定度数）、`draw-segment`（在点阵上连两点画线；docs/79 对称课画对称轴也用它，谁先施工谁做）。其余用 `input`、`choose`（选项可以是 `angle` 模型） | 同意 |
| D6 | **新误解域 `angles`**，9 个码 + 复用 `measure-reading` 的 `read-end-mark`（量角器没对 0 就读末端，与尺子同一个误解）（§2.1） | 同意 |
| D7 | **度数**：讲解与题目一律整数度；量角题的答案接受 ±1°（屏幕上的量角器每 1° 一条刻度，孩子读到最近的一度）；画角题吸附 1°，检查 ±1°。P4 量、画只到 **180° 以内**（§0.1 Q4） | 同意 |
| D8 | **"不按比例"**：第 08–11 步求未知角的图右下角固定一行 "Not drawn to scale / 未按比例画"（同 docs/21 D8），而且**故意画得不准**（画出的角与真值差 ≥ 12°），量的人会得到别的数——这正是第 11 步 ⚑ 拍要讲的（`measured-not-calculated`） | 同意 |
| D9 | **情境**：钟面两针（接时间课）、组屋窗花的直角、剪刀张开、门打开、折纸、书角、风扇叶片；求未知角的图是纯几何图（新加坡试卷的样子），不硬套情境；人名多族群；无品牌 | 同意 |
| D10 | **步数**：11 个课步 + 练习 + 00（与面积与周长同量级）。拍 45 个 ≈ 15 min，小测 11 道 ≈ 7 min，练习 8 道 ≈ 5 min：**全课约 27 分钟**；三段各约 8–10 分钟 | 同意 |
| D11 | **图**：封面 + 2 张配图（§6）；`art/planned/angles/` 里已有 2026-10-18 生成的三张候选，按 §6 的检查重审，量角器那张改为代码画 | 同意 |

### 0.1 需要 Gavin 看的（每条有默认值，默认已写进全文）

| # | 问题 | 选项 | 默认 |
|---|---|---|---|
| Q1 | **三段怎么标**：P4、P5 两段要不要 `bridge: true`（章头 "Going further / 再往前一步"，同面积与周长 08–11） | (a) 不标，三段连续排，00 章说"可以在 04、07 章之后停"；(b) P4、P5 都标 bridge；(c) 只标 P5 | **(a)**：11 步里 7 步是 bridge 会让主线显得很短；三段本来就是一条线 |
| Q2 | **垂直与平行（P3 Geometry 2.1–2.2）放不放本课** | (a) 放，第 04 步；(b) 不放，留给将来的几何小课 | **(a)**：垂直 = 直角，紧接第 02、03 步；去掉则 10 步 41 拍 |
| Q3 | **锐角 / 钝角这两个词**：课纲 P3 只写 "greater than / smaller than a right angle"，没有 acute / obtuse | (a) 不出现；(b) 第 03 步一个 `<More>` 小框说一下名字，题目不考 | **(b)**：学校课本多半会提到，孩子在别处会碰到这两个词（**待核**课本） |
| Q4 | **大于 180° 的角**（reflex）：课纲 P4 只写 "measuring angles in degrees" | (a) 不量、不画；第 09 步"一点周围"出现 > 180° 的角，只用 360° 减；(b) 第 06 步加一拍"用 360° 减" | **(a)**（**待核**：手边有 P4 课本时看一眼是否量 reflex angle） |
| Q5 | **∠ 写法**：EN "∠ABC"，ZH 也写"∠ABC"（读作"角 ABC"）；垂直是否引入符号 "⊥"、平行 "//" | (a) 只写字 "AB is perpendicular to CD / AB 垂直于 CD"，不用 ⊥ 与 //；(b) 用符号 | **(a)**：课纲没有这两个符号（**待核**课本） |
| Q6 | **中文"角的边"**：英文课本说 arms，中文用"边"还是"臂" | (a) 边；(b) 臂 | **(a)** 边（大陆课本"角的两条边"；新加坡华文用法**未核**，§5.2） |

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字）

| 级 | 子线 · 条目 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|---|
| P1（地基） | Geometry · 1. 2D Shapes | "1.1 identifying, naming, describing and classifying 2D shapes" · "1.4 copying figures on dot grid or square grid" | 32 | 点阵与方格的来源（第 04 步） |
| P2（地基） | Measurement · 2. Time | "2.1 telling time to the minute" | 34 | 钟面（第 02 步一拍） |
| **P3** | Geometry · 1. Angles | "1.1 concepts of angle" · "1.2 right angles, angles greater than/smaller than a right angle" | 36 | 第 01–03 步 |
| **P3** | Geometry · 2. Perpendicular and Parallel Lines | "2.1 perpendicular and parallel lines" · "2.2 drawing perpendicular and parallel lines" | 36 | 第 04 步（Q2） |
| **P4** | Geometry · 1. Angles | "1.1 using notation such as ∠ABC and ∠a to name angles" · "1.2 measuring angles in degrees" · "1.3 drawing an angle of given size" | 39 | 第 05–07 步 |
| P4（相关） | Geometry · 2. Rectangle and Square | "2.1 properties of rectangle and square, excluding diagonal properties" | 39 | 只在第 02 步"长方形四个角都是直角"一句 |
| **P5** | Geometry · 1. Angles | "1.1 angles on a straight line" · "1.2 angles at a point" · "1.3 vertically opposite angles" · "1.4 finding unknown angles" | 42 | 第 08–11 步 |
| P5（不做） | Geometry · 2. Triangle | "2.2 angle sum of a triangle" · "2.3 finding unknown angles without additional construction of lines" | 42 | 将来 `triangles` 主题（复用 A5） |
| P6（不做） | Geometry · 1. Special Quadrilaterals | "1.1 finding unknown angles, without additional construction of lines, in composite geometric figures …" | 44 | 同上 |

核对要点：
- P3 只有"直角、比直角大 / 小"，**不出度数**；度数从 P4 1.2 开始。第 01–04 步的字幕、题目、右上卡都不写 °。
- P4 1.1 原文是 "∠ABC **and ∠a**"：两种命名都要教（第 05 步第 4 拍）。
- P5 1.4 "finding unknown angles" 在 Angles 小节下，只用直线、一点、对顶角三条事实；三角形内角和是 P5 Triangle 2.2，**不在本课**。
- 课纲 P4 没有指南针、"转动"（quarter turn 等）条目；本课用"转"只是讲角的概念，不考方位。

### 1.2 级别、步数与时间

- 11 个课步 + 练习章 + 背景章 00；地基 P1–P2，主体 P3（01–04）、P4（05–07）、P5（08–11）。
- 拍 45 个（每拍 ~20 s ≈ 15 min），小测 11 道（≈ 7 min），练习 8 道（≈ 5 min）：**约 27 分钟**。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字（`limits`） |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | angle（标本） | — | — | — |
| 01 | `what-is-an-angle` | An angle is a turn | 角：转了多少 | P3 1.1 | angle | 4 | 9 · choose / input | 不写度数 |
| 02 | `right-angles` | Right angles | 直角 | P3 1.2 | angle · clock · fold | 4 | 9 · choose / input | 不写度数 |
| 03 | `bigger-or-smaller` | Greater or smaller than a right angle | 比直角大，还是比直角小 | P3 1.2 | angle（直角板） | 4 | 9 · choose | 角 15°–165°，离 90° ≥ 15° |
| 04 | `perpendicular-and-parallel` | Perpendicular and parallel lines | 垂直与平行 | P3 2.1, 2.2 | angle · grid（点阵） | 4 | 9 · choose / draw-segment | 点阵 ≤ 10 × 8 |
| 05 | `naming-angles` | Naming angles | 给角起名字 | P4 1.1 | angle（字母） | 4 | 9 · choose | ≤ 4 条射线 |
| 06 | `measuring-angles` | Measuring with a protractor | 用量角器量角 | P4 1.2 | angle + protractor | 5 | 10 · measure-angle / input / choose | 10°–170°，整数 |
| 07 | `drawing-angles` | Drawing an angle | 画一个角 | P4 1.3 | angle + protractor | 4 | 9 · draw-angle / choose | 10°–170°，整数 |
| 08 | `angles-on-a-straight-line` | Angles on a straight line | 直线上的角 | P5 1.1 | angle（直线） | 4 | 9 · input / choose | 2–3 个角 |
| 09 | `angles-at-a-point` | Angles at a point | 一点周围的角 | P5 1.2 | angle（射线组） | 4 | 9 · input / choose | 3–5 个角 |
| 10 | `vertically-opposite-angles` | Vertically opposite angles | 对顶角 | P5 1.3 | angle（两线相交） | 4 | 9 · input / choose | 两条直线 |
| 11 | `finding-unknown-angles` | Finding unknown angles | 求未知角 | P5 1.4 | angle（不按比例） | 4 | 10 · input / choose | 最多两步 |
| 12 | `practice` | Practice | 练习 | — | 按题 | — | 8 道固定题 | — |

### 1.4 不在本课

- 三角形、四边形的角（P5 Triangle、Parallelogram…；P6 Special Quadrilaterals）→ 将来 `triangles`，复用 A5。
- 大于 180° 的角的量与画（Q4）；方位、罗盘、"转了几个直角"的题。
- 弧度、角的作图（尺规）、平行线的同位角 / 内错角（中学）。
- 饼图的圆心角（饼图在 docs/77 只用分数读，不用度数）。

### 1.5 和别的主题怎么接（不重复讲）

| 主题 | 接在哪 | 本课怎么用 | 不在本课重复的 |
|---|---|---|---|
| `telling-time` | 分针一小时转一圈；15 分钟 = 四分之一圈 | 第 02 步第 2 拍用 3:00 的钟面：两针成直角；第 06 步第 1 拍一句"分针每分钟转 6°"放 `<More>` | 读钟、时长 |
| `measuring` | 刻度、从 0 量起、`read-end-mark` | 量角器就是弯成半圆的尺子：第 06 步正文第一句接它；`read-end-mark` 直接复用 | 尺、秤、量杯的读数 |
| `area-perimeter` | 长方形、直线图形的角都是直角 | 第 02 步"长方形四个角都是直角"一句；第 04 步用 A4 点阵 | 面积、周长 |
| `fractions` | "折"：对折两次 | 第 02 步折直角板用同一个 `fold` 过渡；半圈 = 一半，四分之一圈 = 直角 | 分数本身 |
| `nets-and-solids` | 正方体的棱两两垂直 | 不用（只在第 04 步正文一句"盒子的棱"） | — |
| `graphs`（docs/77） | 饼图里四分之一 = 圆心一个直角 | docs/77 第 07 步引用本课第 02 步；本课不讲饼图 | — |
| `symmetry`（docs/79） | `draw-segment`、点阵 | 共用 E-AN5；对称课不讲角 | — |

---

## 2. 课的设计

### 2.0 写法约定（照 skill `writing-rules.md`）

- **固定说法**（字幕、正文、反馈一致）：
  - EN "An angle is the amount of turn between two arms." / ZH "角的大小，是两条边之间转了多少。"
  - EN "Centre on the vertex, 0 on an arm, count from 0." / ZH "中心对顶点，0 线对一条边，从 0 数起。"
  - EN "Check with a right angle." / ZH "和直角比一比。"（量、画之后的自查）
  - EN "Angles on a straight line add up to 180°." / ZH "直线上的角加起来是 180°。"；"Angles at a point add up to 360°." / "一点周围的角加起来是 360°。"；"Vertically opposite angles are equal." / "对顶角相等。"
- 颜色只表示"谁的"：给定的边 / 角 = cold；孩子转的边、画的线、选的角 = signal；第二个比较的角 = hot；"看答案" = 墨色虚线；未知角的弧标 "?"（signal）。量角器本身是墨色发丝线，正在读的那一圈加粗（signal），另一圈淡到 40 %。不用红绿。
- 算式：P3 段用 `words`（`bigger turn → bigger angle` / `转得多，角就大`）；P4 起 `65°`、`180° − 65° = 115°`；写理由时用 `words`（`∠a = ∠c (vertically opposite)` / `∠a = ∠c（对顶角）`）。

### 2.1 误解目录（新域 `angles`，§3.4 写诊断规则）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `arm-length` | 用边的长短（或两边末端隔多远）判断角的大小 | 两边画得长的角说"大"；末端隔得远的说"大" | "These arms are longer, but they have turned less. Compare the turn, not the length of the arms." / "这两条边长，可是转得少。比的是转了多少，不是边有多长。" | S3、S5、S8 |
| `right-angle-upright` | 只认得一条边横、一条边竖的直角（以及垂线） | 斜放的直角说"不是直角"；斜着的两条垂线说"不垂直" | "Turn the page in your head: the corner is still square. Put the right-angle tester in it." / "在脑子里把纸转一转，这个角还是方方正正的。用直角板去比一比。" | S3、S4 |
| `looks-parallel` | 在画面里不相交就以为平行 | 两条慢慢靠拢的线说"平行" | "These lines come closer as they go. Count the squares between them at both ends: 3 and 2. Parallel lines stay the same distance apart." / "这两条线越走越近。数一数两头之间隔几格：3 格和 2 格。平行线之间的距离处处一样。" | S9（教学建议）；本课提出的诊断 |
| `vertex-not-middle` | 三个字母的角名，顶点不放中间；或几条边共顶点时只写 ∠B | 把 ∠ABC 写成 ∠BAC；三个角共顶点时答 ∠B | "The vertex letter always goes in the middle: ∠ABC turns at B." / "顶点的字母永远在中间：∠ABC 的顶点是 B。" | 本课提出的诊断 |
| `wrong-scale` | 量角器读了另一圈（答成 180° − 正确值）；画角时数错圈，画成 180° − 目标 | 50° 的角读成 130°；画 65° 画成 115° | "Which row starts at 0 on the arm you lined up? Count up from that 0. Check: this angle is smaller than a right angle, so it is less than 90°." / "哪一圈的 0 对着你对准的那条边？从那个 0 数起。再和直角比一比：这个角比直角小，一定小于 90°。" | S6、S7、S8 |
| `read-end-mark`（复用 `measure-reading`） | 边没有对着 0，直接读另一条边对着的数 | 一条边对着 20，另一条对着 75，答 75° | "This arm is on 20, not on 0. Count from 20 to 75: 75 − 20 = 55°." / "这条边对着 20，不是 0。从 20 数到 75：75 − 20 = 55°。" | docs/32 §2.1；S7 |
| `angle-sum-swap` | 直线上用 360°，或一点周围用 180° | 直线上 40° 和 ? 答 320°；一点周围三个角用 180° 减 | "These angles sit on a straight line: half a turn, 180°. A full turn, 360°, is for angles all the way round a point." / "这几个角在一条直线上，是半圈，180°。整整一圈 360° 是一点周围的角。" | S10、S11 |
| `right-mark-missed` | 没看见直角小方块（当成未知或不算） | 一点周围有一个直角标记，没减 90° | "The small square means a right angle: 90°, even though no number is written." / "这个小方块表示直角，是 90°，虽然没写数字。" | S11 |
| `opposite-adjacent` | 把相邻的角当成对顶角（相等），或对顶角答成 180° − x | 70° 的对顶角答 110° | "Opposite angles face each other across the crossing; they are equal. The angle next to 70° makes a straight line with it: 110°." / "对顶角隔着交点面对面，它们相等。挨着 70° 的那个角和它拼成直线，才是 110°。" | S10、S11 |
| `measured-not-calculated` | 未按比例的图拿量角器量 | 图上画得像 60°，算出来是 48°，答 60° | "The drawing is not to scale, so measuring it does not work. Use the facts: angles on a straight line add up to 180°." / "图没有按比例画，量出来的不算数。用规律算：直线上的角加起来是 180°。" | S11；D8 |

诊断只认题目声明的码。每个码至少一拍正面讲（拍表 ⚑）、至少一道题库题能诊断它（§8）。`arm-length`、`right-angle-upright`、`looks-parallel`、`vertex-not-middle` 只由 `choose` 选项诊断。

### 2.2 逐步设计

模型简写（§3.1）：`A{rays:[0,40]}` = 顶点在原点、两条射线方向 0° 与 40°（方向从右边起逆时针量）；`lines:[0,70]` = 穿过顶点的两条直线；`arc[0→40]`、`arc[0→40 "?"]`；`sq[0,90]` = 直角小方块；`L{0:"C",50:"A",v:"B"}` = 点的字母；`P{base:0}` = 量角器中心在顶点、0 线沿 0° 方向；`T@30` = 直角板一条边沿 30°；`len[…]` = 边长（舞台单位）；`nts` = 不按比例。

---

#### 第 01 步 `what-is-an-angle` · 角：转了多少（P3 1.1）

**概念**：两条直线交于一点形成角；角的大小是一条边相对另一条转了多少，与边的长短无关。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `A{rays:[0,35]}`，顶点、两条边各标一次名字 | — | — | Two straight lines that meet at a point make an angle. The point is the vertex; the two lines are the arms. | 两条直线相交于一点，就形成一个角。这个点叫顶点，两条线叫角的边。 |
| 2 | `rays:[0,35] → [0,80]`，`arc` 跟着长 | `turn` | `words: bigger turn → bigger angle` | Turn one arm away from the other. The more it turns, the bigger the angle. | 让一条边转开。转得越多，角越大。 |
| 3 ⚑ | `pair:[A{rays:[0,40], len:[3,3]} hot, A{rays:[0,60], len:[1.2,1.2]} cold]` | `morph` | `words: long arms, smaller turn · short arms, bigger turn` | These arms are long, but they have turned less. The length of the arms does not change the size of an angle. | 这两条边很长，可是转得少。边的长短不改变角的大小。（`arm-length`） |
| 4 | 第二个角的复制品叠到第一个上：顶点对顶点、一条边对一条边 | `overlay` | `words: the second arm shows the bigger angle` | To compare two angles, put one on top of the other: vertex on vertex, one arm along one arm. The other arm shows which is bigger. | 比两个角，就把一个叠到另一个上：顶点对顶点，一条边对一条边。另一条边露在外面的，那个角大。 |

**要点**：① An angle is made by two arms meeting at a vertex. / 角由两条边和一个顶点组成。② The size of an angle is the amount of turn, not the length of the arms. / 角的大小是转了多少，不看边有多长。

**题库（9）**：5 道 `choose`（哪个角大：两道有"边长"干扰项 → `arm-length`，一道末端隔得远的干扰项 → `arm-length`；选项是 `angle` 模型）；2 道 `input`（这个图形里有几个角：三角形、四边形、五边形，图形是 A5 的多边形写法）；2 道 `choose`（哪些图形成角：两条线不相交、一条曲线与直线、两条直线相交 → 多选）。

---

#### 第 02 步 `right-angles` · 直角（P3 1.2）

**概念**：方方正正的角叫直角，用小方块标出；转四分之一圈；折两次的纸角就是随身的直角板；斜着放也还是直角。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `A{rays:[0,90], sq[0,90]}` | — | — | A square corner, like the corner of a page, is a right angle. We mark it with a small square. | 方方正正的角，像书页的角，叫直角。直角用一个小方块标出来。 |
| 2 | `clock{time:"03:00"}`（复用 A3） | `morph` | `words: ¼ turn = 1 right angle` | At 3 o'clock the two hands make a right angle. The minute hand turns through a right angle in 15 minutes: a quarter of a full turn. | 3 点整，两根针成一个直角。分针 15 分钟转过一个直角，是一整圈的四分之一。 |
| 3 | 一张纸对折、再对折，折角 = 直角板（`tester`），放进书角、窗花的角 | `fold` | `words: fold twice → right angle` | Fold a sheet of paper in half, then in half again. The folded corner is a right angle you can carry: a right-angle tester. | 把一张纸对折，再对折。折出来的角就是一个随身的直角，叫直角板。 |
| 4 ⚑ | `A{rays:[30,120], sq}` + `T@30` | `lay` | `words: still a right angle` | Turned round, it is still a right angle. Put the tester in the corner: both arms lie along its edges. | 斜着放，它还是直角。把直角板放进去，两条边都贴着直角板的边。（`right-angle-upright`） |

**要点**：① A right angle is a square corner, a quarter turn. / 直角是方方正正的角，是四分之一圈。② A right angle stays a right angle however it is turned. / 不管怎么转，直角还是直角。

**题库（9）**：5 道 `choose`（哪些是直角，多选；含斜放的直角 → `right-angle-upright` 的漏选诊断，含"差一点"的 80°、100° 干扰）；3 道 `input`（这个图形里有几个直角：长方形 4、直角梯形 2、"小屋"五边形 2）；1 道 `choose`（哪个钟面上两针成直角：3:00、9:00、6:00、12:15 不选——12:15 时针已离开 12，不是直角；**注**：12:15 这个选项要在 `reveal` 里说清时针走了一点）。

---

#### 第 03 步 `bigger-or-smaller` · 比直角大，还是比直角小（P3 1.2）

**概念**：用直角板去比：另一条边在直角板里面，比直角小；在外面，比直角大。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `A{rays:[0,50]}` + `T@0` | `lay` | `words: smaller than a right angle` | Put the tester on the angle, one edge along an arm. The other arm lies inside the tester, so this angle is smaller than a right angle. | 把直角板放上去，一条边对齐。另一条边在直角板里面，所以这个角比直角小。 |
| 2 | `A{rays:[0,130]}` + `T@0` | `turn` | `words: greater than a right angle` | Now the other arm lies outside the tester. This angle is greater than a right angle. | 这次另一条边在直角板外面。这个角比直角大。 |
| 3 ⚑ | `set` 5 个角（35° 长边、90°、150° 短边、70°、120°）分进三组（小于 / 等于 / 大于） | `arrange` | `words: 2 smaller · 1 right · 2 greater` | Sort these angles with the tester. The long arms on the first one do not make it bigger: it is still smaller than a right angle. | 用直角板把这几个角分一分。第一个角的边很长，可它还是比直角小。（`arm-length`） |
| 4 | 一个三角形（钝角在左）、一个梯形，各角标出三种 | `morph` | `words: one shape, all three kinds` | A shape can have all three kinds of angle. This triangle has one angle greater than a right angle and two smaller ones. | 一个图形里，三种角都可能有。这个三角形有一个角比直角大，两个比直角小。 |

**要点**：① Inside the tester: smaller than a right angle. Outside: greater. / 在直角板里面，比直角小；在外面，比直角大。

**题库（9）**：6 道 `choose`（比直角大 / 小 / 相等；多选"哪些比直角大"；含边长干扰 → `arm-length`、斜放 → `right-angle-upright`）；3 道 `choose`（图形里标出的角是哪一种）。`<More>`（Q3）：比直角小的角叫锐角（acute angle），比直角大、比两个直角小的叫钝角（obtuse angle）。

---

#### 第 04 步 `perpendicular-and-parallel` · 垂直与平行（P3 2.1, 2.2；Q2）

**概念**：相交成直角的两条直线互相垂直；方向一样、处处距离相等、永远不相交的两条直线互相平行；在点阵上数格子画。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `A{lines:[0,90], sq}`，点 A、B、C、D | — | `words: AB is perpendicular to CD` | Two straight lines that meet at a right angle are perpendicular. Line AB is perpendicular to line CD. | 两条直线相交成直角，就说它们互相垂直。直线 AB 垂直于直线 CD。 |
| 2 | `grid{show:"dots", segments:[(1,1)-(8,1), (1,4)-(8,4)], gap brackets 3 · 3}` | `morph` | `words: 3 squares apart · 3 squares apart` | Parallel lines go the same way and stay the same distance apart. However far they go, they never meet. | 平行线方向一样，之间的距离处处相等。不管延长多远，都不会相交。 |
| 3 ⚑ | 点阵上两组斜线：一组斜着垂直（`sq`）、一组慢慢靠拢（两头间距 3 格、2 格） | `morph` | `words: 3 ≠ 2 → not parallel` | Tilted lines can be perpendicular too. These two lines do not meet on the page, but they come closer, 3 squares apart, then 2: they are not parallel. | 斜着的两条线也能垂直。这两条线在纸上没有相交，可是越来越近，先隔 3 格，再隔 2 格：它们不平行。（`right-angle-upright`、`looks-parallel`） |
| 4 | 点阵上已有线 AB（右 3、上 1），过点 P 画平行线：同样右 3、上 1；再画垂线：右 1、下 3 | `place` | `words: right 3, up 1` | To draw a parallel line on dot paper, copy the steps: AB goes 3 right and 1 up, so the new line does too. | 在点阵上画平行线，就照着走法画：AB 向右 3 格、向上 1 格，新线也一样。 |

**要点**：① Perpendicular lines meet at a right angle. / 互相垂直的两条线相交成直角。② Parallel lines are always the same distance apart and never meet. / 平行线之间的距离处处相等，永远不相交。

**题库（9）**：4 道 `draw-segment`（过点 P 画 AB 的平行线 / 垂线；横竖与斜的各两道；错例：画成不平行 → `looks-parallel` 的判定由引擎算间距；画成斜交 → 一般 fallback）；3 道 `choose`（哪两条线平行 / 垂直，含斜放 → `right-angle-upright`、慢慢靠拢 → `looks-parallel`）；2 道 `choose`（窗花图里哪两根互相垂直 / 平行；窗花画成 A5 线段组）。数字：点阵 ≤ 10 × 8；斜线的走法分量 ≤ 4。

---

#### 第 05 步 `naming-angles` · 给角起名字（P4 1.1）

**概念**：角用三个大写字母命名，顶点字母放中间；也可以在角里写一个小写字母。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `A{rays:[0,50]}`，`L{0:"C",50:"A",v:"B"}`，`arc` | — | `∠ABC` | Points on the arms are named with capital letters. This angle is ∠ABC, said "angle ABC". The vertex letter, B, goes in the middle. | 边上的点用大写字母表示。这个角写作 ∠ABC，读作"角 ABC"。顶点 B 写在中间。 |
| 2 | 同上，读的方向从 C 经 B 到 A 的小箭头动画（不留箭头） | `shade` | `∠ABC = ∠CBA` | ∠CBA names the same angle: start on one arm, go through the vertex, end on the other arm. | ∠CBA 说的是同一个角：从一条边上的点出发，经过顶点，到另一条边上的点。 |
| 3 ⚑ | 三条射线 BA、BD、BC：`arc[ABD] cold`、`arc[DBC] hot`、`arc[ABC]` 虚线 | `turn` | `∠ABD + ∠DBC = ∠ABC` | Three angles meet at B here, so "∠B" alone is not clear. Three letters, with B in the middle, say which one you mean. | 这里有三个角都以 B 为顶点，只写"∠B"说不清是哪一个。写三个字母、B 在中间，才说得清。（`vertex-not-middle`） |
| 4 | 一个四边形，内角里写 a、b、c、d | `morph` | `∠a` | An angle can also be named with a small letter written inside it, like ∠a. | 也可以在角里写一个小写字母，叫它 ∠a。 |

**要点**：① ∠ABC: the vertex letter goes in the middle. / ∠ABC：顶点字母在中间。② ∠a: a small letter inside the angle. / ∠a：角里写一个小写字母。

**题库（9）**：6 道 `choose`（"标出的角叫什么"：选项含顶点不在中间 → `vertex-not-middle`；"∠PQR 是哪一个"：选项是同一图里点亮不同的弧）；3 道 `choose`（多选：哪些名字说的是同一个角，∠XYZ 与 ∠ZYX）。

---

#### 第 06 步 `measuring-angles` · 用量角器量角（P4 1.2）

**概念**：角的大小用度量；整整一圈 360°、直角 90°；量角器的中心对顶点、0 线对一条边，从对着这条边的那个 0 数起；量完和直角比一比。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | 一整圈分成 360 小格的示意圆（每 10° 一条长刻度），一个直角扇形 signal | — | `360° ÷ 4 = 90°` | Angles are measured in degrees. A full turn is 360 degrees, written 360°. A right angle is a quarter turn: 90°. | 角的大小用"度"来量。一整圈是 360 度，写作 360°。直角是四分之一圈：90°。 |
| 2 | `A{rays:[0,50]}`，量角器从旁边滑过来：`P{base:0}` | `lay` | `words: centre on the vertex · 0 on an arm` | Put the centre of the protractor on the vertex. Turn it so that the 0 line lies along one arm. | 把量角器的中心对准顶点，转一转，让 0 线和一条边对齐。 |
| 3 | 同上，内圈加粗（从右边 0 起的那一圈），沿圈数到 50 | `shade` | `50°` | There are two rows of numbers. Use the row that starts at 0 on the arm you lined up, and count up to the other arm: 50°. | 量角器上有两圈数。用 0 对着你对齐那条边的那一圈，一直数到另一条边：50°。 |
| 4 ⚑ | 外圈在 130 处点亮（hot）；直角板淡入在 90 处 | `shade` | `50° < 90° → not 130°` | The other row says 130 here. Check with a right angle: this angle is smaller, so it must be less than 90°. It is 50°. | 另一圈这里写着 130。和直角比一比：这个角比直角小，一定小于 90°。它是 50°。（`wrong-scale`） |
| 5 | `A{rays:[180,115]}`（开口朝左），`P{base:180}`，外圈加粗 | `turn` | `65°` | When the arm you line up points left, its 0 is on the other row. Count from that 0: the angle is 65°. | 对齐的那条边朝左时，它的 0 在另一圈上。从那个 0 数起：这个角是 65°。 |

**要点**：① Centre on the vertex, 0 on an arm, count from 0. / 中心对顶点，0 线对一条边，从 0 数起。② Check with a right angle: smaller means less than 90°. / 和直角比：比直角小，就小于 90°。

**题库（10）**：5 道 `measure-angle`（先摆量角器：拖到顶点、转到一条边；再写度数；开口朝左 / 朝右各半；错例 `"=130"` → `wrong-scale`）；3 道 `input`（量角器已经摆好；其中 1 道一条边对着 20 → `read-end-mark`，1 道朝左用外圈）；2 道 `choose`（估一估：哪个角大约 120°；选项里有 60° → `wrong-scale`）。度数 10°–170° 的整数，离 90° ≥ 10°（自查有意义）。

---

#### 第 07 步 `drawing-angles` · 画一个角（P4 1.3）

**概念**：先画一条边、定顶点；量角器摆好，在对的那圈找到度数点一个点；连起来；画完和直角比一比。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | 一条线段 BC（`rays:[0]`），点 B 标出 | — | `∠ABC = 65°` | To draw ∠ABC = 65°, first draw one arm, BC, and mark the vertex, B. | 要画 ∠ABC = 65°，先画一条边 BC，标出顶点 B。 |
| 2 | `P{base:0}` 摆好；内圈 65 处点一个 signal 小点 | `lay` | `65°` | Put the protractor's centre on B and its 0 line along BC. On the row that starts at 0 on BC, find 65 and mark a dot. | 量角器中心对准 B，0 线对齐 BC。在 0 对着 BC 的那一圈上找到 65，点一个点。 |
| 3 | 量角器移开，B 连到点（signal 线），标 A，`arc[0→65 "65°"]` | `place` | `∠ABC = 65°` | Take the protractor away and join B to the dot. Label the new arm BA. | 拿开量角器，把 B 和这个点连起来，新的边标上 A。 |
| 4 ⚑ | 另一条（hot 虚线）在 115° 处 | `turn` | `65° < 90°` | If you used the other row, you would draw 115°, which is greater than a right angle. A 65° angle must be smaller than a right angle. | 要是用了另一圈，就会画成 115°，比直角大。65° 的角一定比直角小。（`wrong-scale`） |

**要点**：① Draw an arm, mark the vertex, measure, mark, join. / 画边、定顶点、量、点点、连线。② Check the drawn angle against a right angle. / 画好后和直角比一比。

**题库（9）**：6 道 `draw-angle`（给定边 BC（朝右或朝左，或斜放），转第二条边到 20°–170° 的目标；量角器可开可关；错例 `"115"` → `wrong-scale`）；3 道 `choose`（哪一个是 ∠PQR = 40° 画对的；选项含画成 140° → `wrong-scale`、顶点放错 → `vertex-not-middle`）。

---

#### 第 08 步 `angles-on-a-straight-line` · 直线上的角（P5 1.1）

**概念**：直线是半圈 = 180°；直线上一点出发的射线把 180° 分成几份，加起来还是 180°。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `A{lines:[0]}`，`arc[0→180]`，量角器底边淡显重合 | — | `180°` | A straight line is half a turn, so the angle on a straight line is 180°. The flat edge of a protractor is a straight line too. | 直线是半圈，所以直线上的角是 180°。量角器的直边也是一条直线。 |
| 2 | 加射线 `ray:50`，转到 70 再回 50；两弧标数实时变 | `turn` | `130° + 50° = 180°` | Draw a line from a point on it, and 180° splits into two angles. Turn the new line: one angle grows, the other shrinks, and together they stay 180°. | 从直线上一点再画一条线，180° 就分成了两个角。转动这条线：一个变大，另一个变小，合起来一直是 180°。 |
| 3 | `arc[0→115 "?"]`、`arc[115→180 "65°"]`，`nts` | `shade` | `180° − 65° = 115°` | So an unknown angle on a straight line is 180° take away the angles you know: 180° − 65° = 115°. | 所以直线上的未知角，就是 180° 减去已知的角：180° − 65° = 115°。 |
| 4 ⚑ | 三个角：40°、?、75°，`nts` | `morph` | `180° − 40° − 75° = 65°` | Three angles on a straight line also add up to 180°, not 360°: 180° − 40° − 75° = 65°. | 直线上三个角，加起来也是 180°，不是 360°：180° − 40° − 75° = 65°。（`angle-sum-swap`） |

**要点**：① Angles on a straight line add up to 180°. / 直线上的角加起来是 180°。

**题库（9）**：6 道 `input`（2–3 个角，一个未知；错例 `angle-sum-swap`（用 360 减）、`measured-not-calculated`（图画得像的度数））；2 道 `choose`（哪一组角能拼成一条直线）；1 道 `input`（两个相等的未知角 + 一个已知：`2 × ? = 180° − 50°`，答 65°）。

---

#### 第 09 步 `angles-at-a-point` · 一点周围的角（P5 1.2）

**概念**：绕一点转一整圈是 360°；一点周围的角加起来是 360°；直角小方块是 90°。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | 一条射线从 0 转一整圈回到 0，弧画满 | `turn` | `360°` | Turn a line all the way round until it is back where it started. One full turn is 360°. | 让一条线绕着一点转，转回原来的位置。一整圈是 360°。 |
| 2 | 四条射线：90°（`sq`）、110°、70°、90°（`sq`） | `morph` | `90° + 110° + 70° + 90° = 360°` | Angles all the way round a point fill one full turn, so they add up to 360°. | 一点周围的几个角，合起来正好一整圈，加起来是 360°。 |
| 3 | 三个角：140°、95°、?，`nts` | `shade` | `360° − 140° − 95° = 125°` | To find the unknown one, take the angles you know away from 360°: 360° − 140° − 95° = 125°. | 求未知角，就用 360° 减去已知的角：360° − 140° − 95° = 125°。 |
| 4 ⚑ | 三个角：直角（`sq`，无数字）、130°、? | `shade` | `360° − 90° − 130° = 140°` | The small square is a right angle, 90°, though no number is written. And it is 360° here, not 180°: these angles go all the way round. | 小方块是直角，90°，虽然没写数字。而且这里要用 360°，不是 180°：这些角绕了一整圈。（`right-mark-missed`、`angle-sum-swap`） |

**要点**：① Angles at a point add up to 360°. / 一点周围的角加起来是 360°。② A small square marks 90°. / 小方块表示 90°。

**题库（9）**：6 道 `input`（3–5 个角；错例 `angle-sum-swap`、`right-mark-missed`）；2 道 `choose`（哪一组角能绕一点围满）；1 道 `input`（三个相等的角围一点：`360° ÷ 3`）。

---

#### 第 10 步 `vertically-opposite-angles` · 对顶角（P5 1.3）

**概念**：两条直线相交成四个角；面对面的两个角叫对顶角，相等；相邻的两个角拼成直线，加起来 180°。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `A{lines:[0,40]}`，四个角写 a、b、c、d | — | — | Two straight lines cross and make four angles. ∠a and ∠c face each other across the crossing: they are vertically opposite angles. | 两条直线相交，形成四个角。∠a 和 ∠c 隔着交点面对面，叫对顶角。 |
| 2 | 一条线转动（40 → 70 → 55），a、c 的数一起变、始终相等 | `turn` | `∠a = ∠c` | Turn one line. ∠a and ∠c change together and are always equal. So are ∠b and ∠d. | 转动一条线，∠a 和 ∠c 一起变，一直相等。∠b 和 ∠d 也一样。 |
| 3 | a、b 弧 cold，c、b 弧 hot，先后点亮 | `shade` | `∠a + ∠b = 180° · ∠c + ∠b = 180° → ∠a = ∠c` | Why? ∠a and ∠b make a straight line, and so do ∠c and ∠b. Both pairs are 180°, so ∠a must equal ∠c. | 为什么？∠a 和 ∠b 拼成一条直线，∠c 和 ∠b 也拼成一条直线。两组都是 180°，所以 ∠a 等于 ∠c。 |
| 4 ⚑ | 给 70°：对面 70°、相邻 110° | `shade` | `∠c = 70° · ∠b = 180° − 70° = 110°` | If ∠a is 70°, the angle opposite is also 70°. The angle next to it is not equal: it makes a straight line with ∠a, so it is 110°. | 如果 ∠a 是 70°，对面的角也是 70°。挨着它的角不相等，它和 ∠a 拼成直线，是 110°。（`opposite-adjacent`） |

**要点**：① Vertically opposite angles are equal. / 对顶角相等。② Angles next to each other at a crossing add up to 180°. / 相交处相邻的两个角加起来是 180°。

**题库（9）**：5 道 `input`（求对顶角、相邻角；错例 `opposite-adjacent`）；2 道 `choose`（哪两个角是对顶角；选项含相邻的一对 → `opposite-adjacent`）；2 道 `input`（三条直线交于一点，6 个角，给两个求一个：用对顶角 + 直线）。

---

#### 第 11 步 `finding-unknown-angles` · 求未知角（P5 1.4）

**概念**：先找图里的直线、一点、交叉，用三条规律一步一步算，每一步写上理由；未按比例的图不量。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 ⚑ | 直线上 132° 与 ?（画成约 60°，真值 48°），`nts`；量角器淡入后划掉（墨色斜线） | `lay` | `180° − 132° = 48°` | This drawing is not to scale. A protractor would show about 60°, but the facts say 180° − 132° = 48°. Work it out; do not measure. | 这个图没有按比例画。用量角器量大约是 60°，可是按规律算，180° − 132° = 48°。要算，不要量。（`measured-not-calculated`） |
| 2 | 两条直线相交，交点处再有一条射线与其中一条直线成直角（`sq`）：已知 35°，求 ∠x（先对顶角得 ∠y，再用直线：∠y、直角、∠x 在同一条直线上） | `shade` | `∠y = 35° (vert. opp.) · ∠x = 180° − 35° − 90° = 55°` | Some angles take two steps. First find the angle opposite 35°: it is also 35°. Then use the straight line. | 有的角要两步。先找 35° 的对顶角，也是 35°；再用直线上的角。 |
| 3 | 一点周围：直角、两个相等的未知角 ∠p、120° | `shade` | `2 × ∠p = 360° − 90° − 120° = 150° → ∠p = 75°` | Here two unknown angles are marked equal. Together they are 360° − 90° − 120° = 150°, so each is 75°. | 这里两个未知角标着相等。合起来是 360° − 90° − 120° = 150°，每个是 75°。 |
| 4 | 同第 2 拍，算式行改成带理由的两行 | — | `words: ∠y = 35° (vertically opposite angles) · ∠x = 55° (angles on a straight line)` | Write each step with its reason: vertically opposite angles, angles on a straight line, angles at a point. | 每一步都写上理由：对顶角、直线上的角、一点周围的角。 |

**要点**：① Look for a straight line, a point, or a crossing. / 找直线、找一点、找交叉。② Calculate; do not measure a drawing that is not to scale. / 要算，不量未按比例的图。

**题库（10）**：7 道 `input`（一步或两步；错例 `measured-not-calculated`（答图上画出的度数）、`angle-sum-swap`、`opposite-adjacent`、`right-mark-missed`）；3 道 `choose`（这一步用的是哪条规律）。每道图 `nts`，画出的角与真值差 ≥ 12°（validate）。

---

### 2.3 练习章 `practice`（8 道固定题，每题一次检查、一个提示）

| # | 题型 | 题目（EN / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `choose` | Which angle is bigger? / 哪个角大？（边很长的 45° vs 边短的 70°） | 70° 那个 | 长边那个 → `arm-length` | 01 |
| Q2 | `choose`（多选） | Which of these are right angles? / 哪些是直角？（正放、斜放的直角各一，80°、100° 各一） | 两个直角 | 漏选斜放的 → `right-angle-upright` | 02 |
| Q3 | `draw-segment` | Draw a line through P parallel to AB. / 过 P 画一条与 AB 平行的线。（AB：右 3 上 1） | 右 3 上 1 | 右 3 上 2 → `looks-parallel` | 04 |
| Q4 | `measure-angle` | Measure ∠PQR. / 量出 ∠PQR。（开口朝左，48°） | 48° | 132° → `wrong-scale` | 06 |
| Q5 | `draw-angle` | Draw ∠XYZ = 125°. / 画 ∠XYZ = 125°。 | 125° | 55° → `wrong-scale` | 07 |
| Q6 | `input` | Find ∠a.（直线上 38°、∠a、67°，nts）/ 求 ∠a。 | 75° | 255° → `angle-sum-swap` | 08 |
| Q7 | `input` | Find ∠b.（两线相交，∠b 对着 63°）/ 求 ∠b。 | 63° | 117° → `opposite-adjacent` | 10 |
| Q8 | `input` | Find ∠c.（一点周围：直角、145°、∠c；nts，∠c 画成约 100°） | 125° | 215° → `right-mark-missed`；100 → `measured-not-calculated` | 09、11 |

6 种题型（choose、draw-segment、measure-angle、draw-angle、input ×3）；三段各有题。

---

## 3. 引擎：A5 `angle`、三种新小测、`angles` 误解域

### 3.0 复用与新增

| 编号 | 内容 | 复用 / 新增 |
|---|---|---|
| — | 讲解拍、题库、练习、章节轴、阅读面板、`words` 算式、`limits`、`check-pool` | 复用（docs/06「MathScene」） |
| — | `clock`（第 02 步第 2 拍）、`grid` 的 `show: "dots"`（第 04 步）、`fold` 过渡（第 02 步） | 复用 |
| — | `read-end-mark`（`measure-reading` 域） | 复用，用 docs/29 X6 的"一码多域" |
| **E-AN1** | 模型 `angle`（§3.1）+ 过渡 `turn`、`lay`、`overlay` | 新增 |
| **E-AN2** | 小测 `measure-angle`（§3.2） | 新增 |
| **E-AN3** | 小测 `draw-angle`（§3.2） | 新增 |
| **E-AN4** | 误解域 `angles`（9 码，§2.1）+ `lib/diagnose/angles.ts` | 新增 |
| **E-AN5** | `grid` 加 `segments`（线段）+ 小测 `draw-segment`（§3.2）；docs/79 对称课共用 | 新增（谁先施工谁做） |
| **E-AN6** | 右上卡 ANGLE、PLATE 行（§3.3） | 新增 |

### 3.1 E-AN1 模型 `angle`

```json
{ "kind": "angle",
  "rays":   [ { "dir": 0, "label": "C", "len": 3 }, { "dir": 50, "label": "A" } ],   // 从顶点出发的射线；dir 从右边起逆时针，度
  "lines":  [ { "dir": 0, "labels": ["A", "B"] } ],                               // 穿过顶点的整条直线（两头各一个字母）
  "vertex": { "label": "B" },
  "arcs":   [ { "from": 0, "to": 50, "label": "50°" | "?" | "a", "tone": "cold" | "hot" | "signal" } ],
  "square": [ [0, 90] ],                       // 直角小方块（validate：两边真的相差 90°）
  "protractor": { "base": 0, "row": "inner" | "outer", "flip": false, "show": true },  // 中心在顶点，0 线沿 base；正在读的那圈
  "tester": { "dir": 30, "state": "flat" | "folding" },                               // 折纸直角板，一条边沿 dir
  "copy":   { "of": 1, "onto": 0 },            // overlay：第二个角叠到第一个上
  "polygon": [[x, y], …],                      // 多边形（数角、命名），角弧画在内角
  "notToScale": true, "drawn": { "1": 60 },    // 不按比例：第 1 条射线画在 60°（真值写在 arcs 里）
  "pair": [ {…}, {…} ], "set": [ {…}, … ]      // 并排 2 个 / 一排 3–6 个（分类拍、choose 选项）
}
```

**画面**：边 1.5 px 墨线，端点无箭头（射线在 P3 段不讲"无限长"）；顶点一个 3 px 实心点；弧半径 = 较短边的 0.28，标注在弧外；直角小方块边长 = 弧半径的 0.6。量角器按真物：半圆、底边、中心小十字、每 1° 发丝刻度、每 5° 稍长、每 10° 长刻度；**两圈数字**：外圈从左 0 到右 180，内圈从右 0 到左 180（真量角器的排法），数字随舞台缩放、最小 12 px；`row` 那一圈 signal 加粗，另一圈降到 40 %。直角板是一个四分之一圆的折纸（折痕发丝线，背面淡色），同分数的折纸质感。手机 390 宽：量角器半径 ≥ 150 px，1° 刻度在 150 px 半径下间隔 2.6 px，所以**手机上只画 5° 与 10° 刻度**，读数靠托盘的放大镜（§3.2）。

**过渡**：`turn`（射线绕顶点转到新方向，弧与标注的数字跟着变，≤ 900 ms，按角度差压缩）；`lay`（量角器 / 直角板从舞台边滑入并转到 base，≤ 700 ms）；`overlay`（第二个角平移 + 转动，顶点对顶点）；`fold`、`morph`、`shade`、`place` 复用。`prefers-reduced-motion` 时淡入到位。

**校验**（`validate-angles.ts`）：`dir` ∈ [0, 360)；`arcs` 的数与射线方向一致（不按比例时与 `drawn` 无关、与真值一致）；`square` 两边差 90°；`notToScale` 时至少一个 `drawn` 与真值差 ≥ 12°（D8）；`limits.degrees: false`（第 01–04 步）时字幕、算式、选项不出现 °；`limits.range: [10, 170]`、`limits.awayFromRight: 10`。

### 3.2 E-AN2 / E-AN3 / E-AN5 小测

| kind | 字段 | 孩子做什么 | 键盘 | 检查 | `sample` |
|---|---|---|---|---|---|
| `measure-angle` | `{ model, answer: 50, place: true \| false, tolerance: 1 }` | `place: true`：量角器在舞台边上，拖它（中心吸附到顶点，12 px 内）、转它（底边吸附到任一条边，5° 内）；摆好后托盘出现度数框和"放大镜"（把两条边附近的刻度放大 4 倍）；写度数 | 量角器 `role="slider"` 二维：方向键移动、`[` `]` 转 1°、Shift × 15°；"对准顶点""对准一条边"两个托盘按钮做同样的事（触屏与读屏都能做完） | 写的度数在 ±1° 内；摆放是脚手架，不判（但没摆好时度数框不出现） | `"=130"`、`"=75"` |
| `draw-angle` | `{ base: { dir: 0 }, target: 65, open: "ccw" \| "cw", protractor: true }` | 第一条边给定；拖第二条边绕顶点转（吸附 1°），量角器可开关；托盘有 −/+ 1° 与 −/+ 10° | 第二条边 `role="slider"`：←→ 1°、Shift × 10°；`aria-valuetext` 读"指着内圈 65、外圈 115"，**不读角的大小** | 画出的角 = target（±1°），开口方向对 | `"115"`（画出的度数） |
| `draw-segment` | `{ grid, from?: [x, y], relation: "parallel" \| "perpendicular" \| "symmetry", to: segmentId }` | 在点阵上点两个格点连成线段（或从给定点出发点一个点） | 格点 roving-tabindex，方向键移动、Enter 选 | 线段与给定线平行 / 垂直（向量叉积 / 点积为 0），长度 ≥ 2 格；`symmetry` 见 docs/79 | `"(2,1)-(5,2)"` |

`measure-angle` 摆好后的放大镜和 `instrument` 的 `zoom`（docs/32）同一种画法。答案、抽到的题不进 URL。

### 3.3 E-AN6 HUD

右上卡 **ANGLE**：P3 段（`limits.degrees: false`）只写 "SMALLER THAN / RIGHT / GREATER THAN A RIGHT ANGLE"，讲解拍里是这一拍那个角，小测里做完才显示；P4 起是度数（讲解拍：这一拍点亮的弧；小测：孩子量 / 画的，不先说答案）。PLATE 行 MODEL ANGLE · ARMS · TURN · SCALE（`SCALE` = 正在读的那圈 INNER / OUTER，P3 段写 "—"）。背景章 00 的标本：张开 50° 的角 + 摆好的量角器（`SPECIMEN ANGLE · 50°`）。

### 3.4 E-AN4 诊断规则（`lib/diagnose/angles.ts`，纯函数，每条 ≥ 2 正例 1 反例）

正确值 `t`，孩子答 `x`（或画出 `x`）：

| code | 规则 |
|---|---|
| `wrong-scale` | `x = 180 − t`（±1）且 `t ≠ 90` |
| `read-end-mark` | `measure-angle` / `input`：一条边对着 `k ≠ 0`，`x = k + t`（读了另一条边的刻度） |
| `angle-sum-swap` | 直线题 `x = 360 − Σ已知`；一点题 `x = 180 − Σ已知`（> 0 时） |
| `right-mark-missed` | 有直角标记的题 `x = t + 90`（没减 90）或 `x` = 把直角当 0 / 当未知时的值 |
| `opposite-adjacent` | 对顶角题 `x = 180 − t`；相邻角题 `x = 180 − 正确值`（即答成了对顶角） |
| `measured-not-calculated` | `notToScale` 的题 `x` = 画出的度数（±3） |
| `arm-length`、`right-angle-upright`、`looks-parallel`、`vertex-not-middle` | `choose` 专用；`draw-segment` 的 `looks-parallel` 由引擎算：两端间距差 1 格 |

单测：`tests/math-scene/{angle,diagnose-angles}.test.ts`（弧、直角标记、量角器两圈的数与位置、摆放吸附、画角吸附、不按比例的偏差、每条诊断规则）。docs/06 加「角（A5）」一节。

---

## 4. 名词表（`glossary.json`，14 个）

| id | EN | ZH | 定义要点 |
|---|---|---|---|
| `angle` | angle | 角 | 两条边从一个点出发形成的图形；大小是转了多少。 |
| `vertex` | vertex | 顶点 | 角的两条边相交的那个点。 |
| `arm` | arm | 边 | 组成角的两条直线中的一条（Q6）。 |
| `right-angle` | right angle | 直角 | 方方正正的角，四分之一圈，90°。 |
| `right-angle-tester` | right-angle tester | 直角板 | 一张纸对折再对折得到的角，用来比一个角是不是直角。 |
| `perpendicular` | perpendicular lines | 垂直 | 相交成直角的两条直线。 |
| `parallel` | parallel lines | 平行 | 方向一样、距离处处相等、永不相交的两条直线。 |
| `degree` | degree (°) | 度（°） | 量角的单位；一整圈 360°。 |
| `protractor` | protractor | 量角器 | 量角、画角的工具，有内外两圈刻度。 |
| `inner-outer-scale` | inner scale, outer scale | 内圈刻度、外圈刻度 | 量角器上方向相反的两圈数；用 0 对着边的那一圈。 |
| `straight-line-angles` | angles on a straight line | 直线上的角 | 在一条直线一侧、共一个顶点的角，加起来 180°。 |
| `angles-at-a-point` | angles at a point | 一点周围的角 | 围着一点一整圈的角，加起来 360°。 |
| `vertically-opposite` | vertically opposite angles | 对顶角 | 两条直线相交时面对面的两个角，相等。 |
| `not-to-scale` | not drawn to scale | 未按比例画 | 图上的角度只是示意，要用标出的数来算。（与 docs/21 同一条） |

---

## 5. 写作规则与术语

### 5.1 口吻样例

- 讲解："Put the tester in the corner. Both arms lie along its edges, so this is a right angle." / "把直角板放进角里。两条边都贴着直角板的边，所以这是直角。"
- 错误反馈："Not yet. Which row has its 0 on the arm you lined up? Count from that 0." / "还没对。哪一圈的 0 对着你对齐的那条边？从那个 0 数起。"
- 不说 "easy / wrong / 错了 / 太棒了"，无感叹号。

### 5.2 术语（MOE 英文 · 中文 · 备注）

| EN | ZH | 备注 |
|---|---|---|
| angle, vertex, arm | 角、顶点、边 | "arm" 中文用"边"（Q6，**待核**新加坡华文） |
| right angle | 直角 | |
| greater than / smaller than a right angle | 比直角大 / 比直角小 | 课纲原文 |
| acute angle, obtuse angle | 锐角、钝角 | 只在 `<More>`（Q3） |
| perpendicular, parallel | 垂直、平行 | "互相垂直""互相平行"；不用 ⊥、//（Q5） |
| ∠ABC, ∠a | ∠ABC、∠a | 读作 "angle ABC / 角 ABC" |
| degree, ° | 度、° | "50 度"写作 50° |
| protractor | 量角器 | |
| inner scale / outer scale | 内圈刻度 / 外圈刻度 | 新加坡课本英文 "inner scale / outer scale"（**待核**课本原文） |
| angles on a straight line | 直线上的角 | 大陆课本有"平角"（180° 的角），本课不用这个词，避免与 "straight line" 混 |
| angles at a point | 一点周围的角 | 大陆课本有"周角"；同上不用（**待核**新加坡华文） |
| vertically opposite angles | 对顶角 | |
| unknown angle | 未知角 | |
| not drawn to scale | 未按比例画 | 同 docs/21 |

### 5.3 数字与情境

- 整数度；量、画 10°–170°；求未知角的已知角 ≥ 15°，答案 ≥ 20°。
- 情境只在 P3 段和 `choose` 里出现（钟面、窗花、剪刀、门、书角、风扇）；P5 段是纯几何图。人名：Aisha、Ravi、Mei Ling、Wei Jie、Siti、Arjun、Hui Min、Daniel。无品牌、无价格。

---

## 6. 插图（交 Codex；风格与验收照 docs/69 §4.2，严格）

**共同风格**：fine graphite pencil，19th-century scientific / engineering plate，细交叉排线；**严格中性灰（R = G = B）**；透明 PNG；主体约占画面 85 %，不触边；**NO text, letters, numerals, labels, arrows, angle arcs, degree marks, logos, paper texture, background, frame, ground shadow**。交付 `art/planned/angles/` 原图 + `manifest.jsonl`（`{slug, kind, file, chapterIdea, subject, checks, tries}`）+ 420 px 宽预览 + cinema 反相模拟图；不合格最多重画 4 次。docs/69 §4.1-1：**教学点是角度、平行、垂直的图一律代码画**（SVG 几何 + 铅笔质感，`scripts/figures/<id>.ts` 写几何断言）。

`art/planned/angles/` 里有 2026-10-18 生成的三张候选（`angles.png`、`angles-protractor-arms.png`、`angles-window-frame.png`），缩略图目检未见明显问题，但都没按下列检查放大核过：

| # | 文件 | 尺寸 | 用在 | 画什么 | 可数的事实（逐条验收） | 不许出现 | 方法 |
|---|---|---|---|---|---|---|---|
| I-1 | `angles.png`（封面） | 1024² | 主题卡 | 一副木制画图分规（两条一样长的直木臂，顶端一个圆形金属铰钉），张开成一个比直角小的角，正面正投影 | ① 恰好两条臂、一个铰钉，两臂从铰钉出发；② 两臂一样长（±5 %），笔直；③ 张开角 30°–50°（量两臂中线）；④ 臂端圆钝，没有针尖；⑤ 无刻度 | 针尖、铅笔夹、刻度、数字、手、桌面、第三条臂 | AI 可（外观图）；**候选 `angles.png` 先按 ①–⑤ 量，过则用** |
| I-2 | `angles-protractor-arms.png` | 1536×1152 | 第 06 章 | 一个透明半圆量角器平放，两条木条的共同铰点正好在量角器底边中点：一条沿底边向右，一条斜向右上 | ① 铰点在底边中点（±1 % 宽）；② 一条木条与底边重合；③ 另一条与底边成 55°（±1°）；④ 圆弧上只有径向刻度：**每 10° 一条长刻度，共 19 条**（含两端），每 5° 一条短刻度，间隔均匀（断言脚本量）；⑤ 无数字 | 数字、字母、画出的角弧、箭头、手、第二个量角器 | **代码画**（候选是 AI 图，刻度间隔无法保证均匀，不用） |
| I-3 | `angles-window-frame.png` | 1536×1152 | 第 04 章 | 一扇组屋式金属窗花（从墙上取下的一块），正面正投影：长方形外框、三根等距竖杆、一根横杆与每根竖杆直角相交 | ① 恰好 3 根内竖杆，间距相等（±2 %）；② 竖杆互相平行（夹角 0°）；③ 横杆与竖杆、外框都成 90°（±0.5°）；④ 横杆在高度 40 %–60 % 之间；⑤ 无玻璃反光、无花饰 | 花饰、玻璃、墙、锁、文字 | **代码画**（几何关系是教学点）；候选 `angles-window-frame.png` 只作构图参考 |

图注草稿：I-2 "A protractor's centre sits exactly on the point where the two arms meet." / "量角器的中心正好对着两条边相交的点。"；I-3 "In a window grille, the upright bars are parallel and the crossbar is perpendicular to them." / "窗花里，竖杆互相平行，横杆和它们垂直。"。cinema 反相：三张都不靠明暗表意，可以反相。

---

## 7. 施工顺序与分工（照 skill `build-order.md`；**不需要新依赖**；子代理不改 `package.json`、不提交）

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | §0.1 定稿；建 `src/content/topics/angles/{chapters,data}`、`topic.yaml`（`engine: math-scene`、`stage: svg`、`mode: lesson`、`status: draft`、`illustration: angles`） | `topic.yaml` | — | S |
| 1 | E（Opus） | E-AN1–E-AN6（E-AN5 若 docs/79 已做则跳过）、`validate-angles.ts`、单测、docs/06「角（A5）」 | `stage/AngleModel.tsx`、`lib/{angle.ts,angle-tasks.ts,diagnose/angles.ts}`、`validate-angles.ts`、`tests/math-scene/{angle,diagnose-angles}.test.ts` | 0 | M |
| 2 | L（Opus） | `lesson.json`：`syllabus`、11 步 × 4–5 拍、`keyFacts`、`limits`、每步 1–2 道样板题、练习 8 题；`pnpm shoot angles --beats` 逐张看 | `data/lesson.json` | 1 | M |
| 3 | Codex | 题库其余约 80 道（`codex-pool-brief.md` 改写：角的模型写法、`angles` 码、度数范围、"不按比例要画偏"）；每份 `pnpm tsx scripts/math/check-pool.ts <draft> --topic angles --step <id>` 0 错；11 章英文初稿 | `scripts/math/drafts/` | 2 | M |
| 4 | T（Opus） | 合并题库、定稿英文、**写中文正文**、名词表、来源 | `data/*`、`chapters/*` | 3 | M |
| 4′ | Codex + 主会话 | §6 三张图（两张代码画） | `scripts/figures/angles-*.ts`、`public/illustrations/**` | 0 | S |
| 5 | P（Sonnet） | QA：`pnpm shoot angles --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`；e2e：手机上摆量角器（按钮与拖动两种）、纯键盘画角、点阵画平行线 | `tests-e2e/angles.spec.ts` | 4 | M |
| 6 | 主会话 | `acceptance.md` 全勾、截图进 `docs/screenshots/angles/`、§9 记录、提交 | — | 5 | S |

---

## 8. 验收

照 skill `references/acceptance.md` 全部打勾，另加：

- [ ] 第 01–04 步任何地方不出现 °（validate `limits.degrees: false`）
- [ ] 量角器两圈的数与真量角器一致（外圈左 0 右 180，内圈右 0 左 180），读法与 `row` 一致；手机 390 × 844 上能用"对准顶点 / 对准一条边"两个按钮摆好量角器
- [ ] 每道 `notToScale` 图画出的角与真值差 ≥ 12°；`measured-not-calculated` 的错例诊断得出
- [ ] §2.1 每个码有 ⚑ 拍、有能诊断它的题
- [ ] 灰度截图能分辨：给定的角（cold）、孩子转的边（signal）、比较的角（hot）、正在读的那圈刻度
- [ ] §6 每张图逐条打勾进 `art/planned/angles/image-qa.json`；两张代码图的断言通过
- [ ] 截图：第 02、06、11 章 + 练习与一道小测，三种尺寸（paper；外加 cinema、zh 各一张）

## 9. 来源（访问日期 2026-11-15；施工时进 `sources.json`）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (2021 P1 cohort; Updated Oct 2025). https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 课纲原文第 32、34、36、39、42、44 页 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | Mitchelmore, M. C., & White, P. (2000). Development of angle concepts by progressive abstraction and generalisation. *Educational Studies in Mathematics*, 41(3), 209–238 | 角作为转动 / 张开 / 两线；斜放的角难认（页码**待核**） |
| S4 | Clements, D. H., & Battista, M. T. (1989). Learning of geometric concepts in a Logo environment. *JRME*, 20(5), 450–467 | 转动的角、方向不同的直角（**待核**页码） |
| S5 | Keiser, J. M. (2004). Struggles with developing the concept of angle. *Mathematical Thinking and Learning*, 6(3), 285–306 | 边长、末端距离当角的大小 |
| S6 | Browning, C., Garza-Kling, G., & Sundling, E. H. (2007). What's your angle on angles? *Teaching Children Mathematics*, 14(5), 283–287 | 量角器两圈读错（**待核**） |
| S7 | Close, G. S. (1982). *Children's understanding of angle at the primary/secondary transfer stage*. London: Polytechnic of the South Bank | 量角器读数错误的类型（**待核**：原文难取得，取不到则删本行，`wrong-scale` 改引 S6、S8） |
| S8 | Hart, K. M. (Ed.) (1981). *Children's Understanding of Mathematics: 11–16*. London: John Murray（CSMS） | 角的大小与边长；量角器（章节页码**待核**） |
| S9 | Common Core Standards Writing Team (2012). *Progressions … K–5, Geometry / Geometric Measurement*. Institute for Mathematics and Education, University of Arizona | 平行、垂直的教学顺序（**待核**页） |
| S10 | Ministry of Education Singapore 批准教材目录（只作顺序参考）：*My Pals Are Here! Maths* P3–P5；*Shaping Maths*。https://www.moe.gov.sg/education-in-sg/approved-textbook-list | Q3–Q6 的写法（**待核**课本原文） |
| S11 | SEAB PSLE Mathematics 0008（2026）样卷 / 考试说明 | "Not drawn to scale"、未知角题的写法（**待核**：docs/17 S7 同一份 PDF 未能取到） |

## 10. 施工记录 / 已知差距

施工时追加。

### 10.1 2026-11-16 施工记录（分支 `claude/angles`）

- **定稿**：§0.1 Q1–Q6 全按默认（Gavin 2026-11-15："四个数学主题，你直接开工吧"）。三段不标 bridge；第 04 步在本课；第 03 步 `<More>` 说锐角、钝角，题目不考；不量、不画大于 180° 的角；不用 ⊥、//；"arm" 中文用"边"。
- **课纲**：S1 PDF 于 2026-11-16 重新下载（806 004 字节，sha256 `e8f77fe10d768e2ad5266dfc39a8821674be7eb1c81bc545ba4b841b12ae70e1`，只放在本机临时目录，不进 git），`pdftotext -layout` 逐字核对 §1.1 的 P3 / P4 / P5 Angles 与 P3 Perpendicular and Parallel Lines 原文和页码（36、39、42），全部一致。
- **实际做出**：11 步 45 拍（06 五拍，其余四拍）、题库 101 道（9–10 道 / 步）、练习 8 道；名词表 14 条；正文 13 章（EN / ZH）。9 个 `angles` 码 + `read-end-mark` 每个都有题能诊断（`angles-lesson.test.ts`）。
- **与 spec 的偏差**：
  - E-AN5 **没有扩展方格模型 A4**（同时施工的 `symmetry` 课负责 A4）：点阵与 `draw-segment` 做在 A5 里（`angle.paper`）。对称课以后要用点阵画线，可以直接用 A5 的 `paper` + `draw-segment`，或在 A4 上另做，合并时由主会话定。
  - 量角器的转向写作 `rot`（弧跨 rot…rot+180，内圈 0 在 rot），不是 §3.1 草案的 `base`；`P{base:180}` 即 `rot: 0` 读外圈。
  - 不按比例的真值写在弧的 `value` 里，不另设 `drawn`；input 的诊断上下文写在 `angle: { rule, known, rights, equal }`。
  - 第 09 步第 1 拍（射线转一整圈）不写 `move`（第一拍没有上一拍）：满圈的弧在进场时自动转一圈；第 11 步第 1 拍同理不写 `lay`。
  - 第 02 步钟面题做成多选（3:00、9:00 对；6:00、12:15 不对，看答案里说时针已离开 12）；"一条曲线与直线"选项换成"两条不相交的线"（模型不画曲线）。
  - 角的 `choose` 错选项允许不写码（回退到 fallback），同方格题。
  - 量角器的放大镜放大 2.5 倍（不是 4 倍），圈住正在读的那圈数字和刻度：4 倍时数字太大、只看得到刻度。量角器半径 < 190 px（手机、小框）时数字每 20° 一个，另外总写出各条边所在处的数；1° 刻度只在半径 ≥ 170 px 的宽舞台上画。
- **2026-11-16 复核后的规则（主会话 / Gavin）**：讲解拍一律按比例画（度数准确，validate 拒绝拍里的 `notToScale`）；"未按比例画"只用于模仿考卷的小测和练习题，而且画出的角**保持大小顺序与种类**（大的还是画得大，锐角还是锐角、钝角还是钝角，相等的画得差不多一样）——`validate-angles.ts orderIssues`，单测在 `angle.test.ts`。D8 的"≥ 12° 偏差"仍然要求，在这个顺序之内做到。据此改了第 08 步第 3、4 拍、第 09 步第 3 拍、第 11 步各拍（第 1 拍改为"要算、不要量"，按比例画），以及 7 道题库题与练习第 6 题的画法。
- **删掉的事实**：§9 的 S3–S11（研究论文、教材、PSLE 样卷）页码与原文都没能核实，不进 `sources.json`、正文和题目；误解目录作为本课自己的诊断，不说"研究表明"或出现频率。"新加坡课本用 inner scale / outer scale""华文用'边'"等待核用语按默认写，不作为事实陈述。
- **插图**：封面与两张配图（`angles-protractor-arms`、`angles-window-frame`）来自 `codex/img5`（c024fb85），代码画，图注照 `art/img5/angles-captions.json`；配图放在第 06、04 章。`scripts/figures/angles-img5-check.ts` 同时检查四节课的图，依赖另三课的脚本，没有带进本分支（主会话合并四课后再加）。
