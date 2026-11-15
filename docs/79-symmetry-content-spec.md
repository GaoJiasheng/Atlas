# 79 · 线对称 · 内容 spec（`symmetry`，MathScene 课；v1 草案，待 Gavin 定稿）

Gavin 2026-11-15 选定的四节新课之一（另三节：docs/76 `angles`、docs/77 `graphs`、docs/78 `average`）。docs/17 §2.4 的 `symmetry` 一行（"沿线对折（与分数的'折'同一个动作）"）与 §7 **A4 方格**（docs/21 已做）。2026-11-15 起草，**只出 spec，不施工、不建目录、不提交**。照 skill `.claude/skills/atlas-lesson-topic/` 写；本课小（S–M），布局照 docs/21，引擎**扩展 A4 `grid`**，不另起模型。

记号同 docs/21：EN 口吻草稿、ZH Claude 草稿。S1 = MOE *Mathematics Syllabus Primary One to Six*（2021 P1 cohort，Updated Oct 2025），起草时用 `pdftotext -layout` 逐页抄录，页码是页脚 "Page | N"。

---

## 0. 决定

| # | 决定 | 建议 |
|---|---|---|
| D1 | **对象**：Measurement and Geometry · SUB-STRAND: GEOMETRY · P4「3. Line Symmetry」3.1–3.3 全部（第 01–05 步）；地基 P1 2D Shapes（认图形、在方格 / 点阵上临摹）、P2 图案 | 同意 |
| D2 | **课的形状**同分数改版后；练习 7 道；背景章 00 | 同意 |
| D3 | **UI 不出现年级**；不标 bridge | 同意 |
| D4 | **核心动作是"折"**：图形沿线对折，两半完全重合 = 对称，这条线 = 对称轴；不重合的地方用墨色斜线标出。`fold` 过渡与分数主题的纸条对折同一个画法（docs/15 §10：沿折线翻 180°，背面淡色，折痕留发丝线） | 同意 |
| D5 | **模型**：扩展 A4 `grid`（E-SY1）：对称轴（技术图版的点划线 = 中心线）、候选线、整幅图沿轴折起、不重合处斜线、点与对应点的连线和格数；`poly` 允许斜边（只在本课，`free: true`，不算面积周长）。不新建模型 | 同意 |
| D6 | **新小测** `complete-symmetric`（在方格上补全对称图形：点格 / 半格，或点格点连轮廓）；`draw-segment`（画出对称轴；docs/76 的 E-AN5，谁先施工谁做）；判断题用 `choose`（选项是 `grid` 图），第二级提示解锁舞台上的"折一折"（同 docs/39 D5 展开图的做法） | 同意 |
| D7 | **新误解域 `symmetry`**，7 个码（§2.1） | 同意 |
| D8 | **补全题的对称轴只用竖直、水平两种**；斜的对称轴只出现在"判断"里（正方形的对角线、斜放的风筝）（§0.1 Q1） | 同意 |
| D9 | **情境**：风筝、蝴蝶剪纸、窗花、Peranakan 花砖的一块图案（只画几何形，不仿真实花砖）、剪纸；图形多是几何图（新加坡试卷的样子）；不用字母（双语界面里字母的对称会和中文混，见 §1.4） | 同意 |
| D10 | **步数**：5 个课步 + 练习 + 00。拍 20 个 ≈ 7 min，小测 5 道 ≈ 3.5 min，练习 7 道 ≈ 5 min：**约 15 分钟** | 同意 |
| D11 | **图**：封面 + 2 张配图（§6），用 `art/planned/symmetry/` 的候选，按 §6 重审 | 同意 |

### 0.1 需要 Gavin 看的（每条有默认值）

| # | 问题 | 选项 | 默认 |
|---|---|---|---|
| Q1 | **补全题要不要斜的对称轴**（课纲 3.3 只写 "with respect to a given line of symmetry on square grid"，没说方向） | (a) 只竖直、水平；(b) 加 45° 斜线（第 05 步一拍 + 2 道题） | **(a)**（**待核**：手边有 P4 课本或学校卷时看一眼有没有斜轴补全题；有就改 (b)，引擎 E-SY1 已按任意 45° 轴设计） |
| Q2 | **"一个图形有几条对称轴"考不考** | (a) 讲解一拍（正方形 4、长方形 2、等边三角形 3），题目只问"这条线是不是"（课纲 3.2 原文）；(b) 也出"有几条"的题 | **(a)**，另有 2 道多选"哪几条是对称轴"，相当于数，但不要求凭空找全 |
| Q3 | **圆** | (a) 一句话："圆有无数条对称轴"放 `<More>`；(b) 不提 | **(a)** |
| Q4 | **中文"对称图形 / 轴对称图形"** | 对称图形（课纲 "symmetric figures" 直译）/ 轴对称图形（大陆课本） | **对称图形**；名词表注"大陆课本叫轴对称图形"（新加坡华文**待核**） |
| Q5 | **字母** | (a) 不用；(b) 第 03 步用几个大写字母（A、H、M、T…） | **(a)**：英文题常用字母，但中文界面下读不顺，用几何图和生活物件代替 |

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字）

| 级 | 子线 · 条目 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|---|
| P1（地基） | Geometry · 1. 2D Shapes | "1.1 identifying, naming, describing and classifying 2D shapes" · "1.4 copying figures on dot grid or square grid" | 32 | 认图形；方格上临摹 = 补全的前身 |
| P2（地基） | Geometry · 1. 2D Shapes | "1.1 making/completing patterns with 2D shapes according to one or two of the following attributes · size · shape · colour · orientation" | 34 | "方向（orientation）"一词的来源 |
| **P4** | Geometry · 3. Line Symmetry | "3.1 identifying symmetric figures" · "3.2 determining whether a straight line is a line of symmetry of a symmetric figure" · "3.3 completing a symmetric figure with respect to a given line of symmetry on square grid" | 39 | 第 01–05 步 |
| P4（相关） | Geometry · 2. Rectangle and Square | "2.1 properties of rectangle and square, excluding diagonal properties" | 39 | 第 02 步：长方形 2 条、正方形 4 条（只说折得重合，不讲对角线性质） |

核对要点：
- 课纲只有**线对称**（line symmetry），没有旋转对称、没有"镜子里的像"（reflection 作为变换是中学内容）。本课说"折"和"对应的点"，不说"镜像变换"。
- 3.2 原文是"判断一条直线是不是对称图形的对称轴"：题目给线，孩子判断；"找出全部对称轴"不是课纲原文（Q2）。
- 3.3 限定 "on square grid"：补全全部在方格上（D8、Q1）。

### 1.2 级别、步数与时间

- 5 个课步 + 练习 + 00；全部 P4。
- 拍 20 个（≈ 7 min），小测 5 道（≈ 3.5 min），练习 7 道（≈ 5 min）：**约 15 分钟**。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字（`limits`） |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | grid（标本） | — | — | — |
| 01 | `fold-and-match` | Fold it: do the halves match? | 对折，看两半是否重合 | P4 3.1 | grid（`mirror`、`fold`） | 4 | 9 · choose | 方格 ≤ 12 × 10 |
| 02 | `testing-a-line` | Is this a line of symmetry? | 这条线是对称轴吗 | P4 3.2 | grid（候选线、折） | 4 | 9 · choose / draw-segment | 同上 |
| 03 | `symmetric-figures` | Symmetric figures | 对称图形 | P4 3.1, 3.2 | grid（`set`，斜放） | 4 | 9 · choose | 同上 |
| 04 | `mirror-on-grid` | Every point has a partner | 每个点都有对应点 | P4 3.3 | grid（`pairs`） | 4 | 9 · complete-symmetric / choose | 轴竖直或水平；离轴 ≤ 5 格 |
| 05 | `completing-figures` | Completing a symmetric figure | 补全对称图形 | P4 3.3 | grid（补全 → 折） | 4 | 10 · complete-symmetric / choose | 同上；半格 ≤ 4 个 |
| 06 | `practice` | Practice | 练习 | — | 按题 | — | 7 道固定题 | — |

### 1.4 不在本课

- 旋转对称、平移、镜像变换（中学）；坐标。
- 斜轴补全（Q1 默认）；字母与数字的对称（Q5）。
- 自然物（树叶、人脸）只"差不多对称"：正文一句话说明，不出题。

### 1.5 和别的主题怎么接（不重复讲）

| 主题 | 接在哪 | 本课怎么用 | 不在本课重复的 |
|---|---|---|---|
| `fractions` | "对折"；"一样大的两半不一定一样形状"（分数域 `equal-area-not-same-shape`） | `fold` 过渡同一个；第 02 步 ⚑ 拍反过来用：长方形沿对角线分成两个一样大的三角形（分数里这是"一半"），**但折起来不重合**，所以不是对称轴 | 分数 |
| `area-perimeter` | A4 方格、半格、`count-squares` 的点格交互 | 补全题直接用方格与半格；点格交互、行首按钮的手机做法照搬 | 面积、周长 |
| `angles`（docs/76） | 垂直；点阵上画线 `draw-segment` | 第 04 步一句"点和它的对应点的连线与对称轴垂直"（只说"横穿过去"，不考）；共用 E-AN5 | 角 |
| `graphs`（docs/77） | 饼图对折看一半 | docs/77 第 07 步引用本课的折；本课不讲饼图 | — |
| `nets-and-solids` | "折一折，看一看" 提示 | 第二级提示解锁"折一折"的做法照 docs/39 D5 | 展开图 |

---

## 2. 课的设计

### 2.0 写法约定

- **固定说法**：
  - EN "Fold along the line. If the two halves match exactly, the line is a line of symmetry." / ZH "沿这条线对折。两半完全重合，这条线就是对称轴。"
  - EN "Equal halves are not enough: they must match when folded." / ZH "分成一样大的两半还不够，要折起来能重合。"
  - EN "A point and its partner are the same distance from the line, on opposite sides." / ZH "一个点和它的对应点，在对称轴两边，离轴一样远。"
  - EN "Flip it across the line; do not slide it." / ZH "翻过去，不是挪过去。"
- 颜色：给定的一半 / 给定图形 = cold；孩子补的格、点、线 = signal；折过来的那一半（半透明，背面淡色）= hot 轮廓；不重合处 = 墨色斜线；"看答案" = 墨色虚线。对称轴 = 墨色点划线（技术图版的中心线），候选线（待判断）= 墨色虚线。不用红绿。
- 算式行多用 `words`：`2 squares · 2 squares`、`folds onto itself ✓ / 折起来重合 ✓`、`2 lines`；对错只用文字与 ✓ / ○。

### 2.1 误解目录（新域 `symmetry`，§3.4 写诊断规则）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `equal-halves` | 把图形分成一样大的两半的线都当对称轴 | 长方形的对角线、平行四边形的中线说"是" | "This line cuts the shape into two equal halves, but fold it: the corners stick out. Equal halves are not enough; they must match." / "这条线把图形分成一样大的两半，可是折一折，角会露出来。一样大还不够，要重合。" | S3、S4 |
| `upright-line-only` | 只认竖直的对称轴：漏掉水平、斜的轴；图形斜放就说不对称 | 正方形只选竖线；斜放的风筝说"不对称" | "Turn the page in your head: the kite still folds onto itself along this slanted line." / "在脑子里把纸转一转：沿这条斜线，风筝还是能折得重合。" | S3、S5 |
| `outline-only` | 只看外形，不看里面的涂色 / 花纹 | 外形对称、一侧多一个涂色格的图说"对称" | "The outline matches, but this shaded square lands on a blank one. Every part has to match, inside too." / "外形重合了，可是这个涂色的格折过去落在空格上。里面的每一部分也要重合。" | S4 |
| `slid-not-flipped` | 补全时把一半平移过去，没有翻 | 左半边的"台阶"原样搬到右边，方向没反 | "This half has been slid across, not flipped. The step that faces left must face right in its partner." / "这一半是挪过去的，不是翻过去的。朝左的台阶，翻过去要朝右。" | S5、S6 |
| `distance-not-kept` | 对应点离轴的距离不对（常见：贴着轴画，或从图形边上量） | 离轴 3 格的点画在离轴 1 格处 | "Count from the line: this point is 3 squares from it, so its partner is 3 squares on the other side." / "从对称轴数：这个点离轴 3 格，对应点在另一边也离轴 3 格。" | S5、S6 |
| `half-not-flipped` | 半格（三角形）补过去时斜边方向没翻 | 朝右上的半格补成朝右上，应是朝左上 | "A half square that leans right leans left in its partner. Fold it over and look." / "朝右斜的半格，翻过去要朝左斜。折过去看一看。" | S6；本课提出的诊断 |
| `line-count` | 数对称轴数错（正方形说 2；长方形说 4） | 多选"哪几条是对称轴"时漏选对角线或多选对角线 | "Fold the square along a diagonal: the halves match, so a square has 4 lines of symmetry. A rectangle's diagonal does not work." / "正方形沿对角线折，两半重合，所以正方形有 4 条对称轴。长方形的对角线不行。" | S3、S4 |

`equal-halves`、`upright-line-only`、`outline-only`、`line-count` 由 `choose`（单选、多选的漏选与多选）诊断；`slid-not-flipped`、`distance-not-kept`、`half-not-flipped` 由 `complete-symmetric` 的结果**算出来**（§3.4）。每个码至少一拍 ⚑、至少一道题。

### 2.2 逐步设计

简写（§3.1）：`G{…}` = `grid`；`mirror:x=6` = 竖直对称轴在 x = 6（点划线）；`cand:[…]` = 待判断的虚线；`fold:x=6` = 左半边沿轴折到右边；`miss` = 不重合处斜线；`pairs` = 点与对应点的连线 + 两边格数；格点 y 向上（同 docs/21）。

---

#### 第 01 步 `fold-and-match` · 对折，看两半是否重合（P4 3.1）

**概念**：沿一条线对折，两半完全重合的图形是对称图形，这条线是它的对称轴；里面的涂色也要重合。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `G{"小屋"：4 × 3 的格 + 屋顶两格与两个半格; mirror:x=2}` | — | — | Here is a shape on square grid paper, with a dashed line down the middle. Imagine folding the paper along the line. | 方格纸上有一个图形，中间一条点划线。想一想沿这条线把纸对折。 |
| 2 | 左半边沿轴翻过去，与右半边重合；轮廓叠成一条线 | `fold` | `words: folds onto itself ✓` | The two halves match exactly, with nothing sticking out. The shape is symmetric, and the fold line is a line of symmetry. | 两半完全重合，没有露出来的地方。这个图形是对称图形，折痕这条线叫对称轴。 |
| 3 | `G{L 形; cand:x=2}` 折过去，多出的部分 `miss` | `fold` | `words: parts stick out ○` | This L shape does not match when folded along the line: parts stick out on both sides. The line is not a line of symmetry. | 这个 L 形沿线对折不重合，两边都有露出来的部分。这条线不是对称轴。 |
| 4 ⚑ | 外形对称的十字形，左臂里多一个涂色格；折过去落在空格上（`miss` 只标那一格） | `fold` | `words: outline ✓ · inside ○` | The outline matches, but the shaded square lands on a blank one. Every part of the figure has to match, inside too. | 外形重合了，可是涂色的格折过去落在空格上。图形的每一部分都要重合，里面也一样。（`outline-only`） |

**要点**：① A figure is symmetric if it can be folded so that the two halves match exactly. / 能对折得两半完全重合的图形是对称图形。② The fold line is a line of symmetry. / 折痕叫对称轴。

**题库（9）**：6 道 `choose`（"沿这条线折，两半重合吗"：是 / 否；含 `outline-only` 干扰、`slid` 式的"像但不对称"图）；3 道 `choose`（多选：哪些图形沿竖线对称）。第二级提示：舞台出现"折一折"按钮。

---

#### 第 02 步 `testing-a-line` · 这条线是对称轴吗（P4 3.2）

**概念**：判断一条线是不是对称轴，要沿它折；分成一样大的两半还不够。长方形 2 条，正方形 4 条，平行四边形 0 条。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `G{长方形 6 × 4; cand:x=3}` → 折，重合 | `fold` | `words: ✓` | Is this line a line of symmetry of the rectangle? Fold along it: the halves match, so yes. | 这条线是长方形的对称轴吗？沿它折，两半重合，所以是。 |
| 2 ⚑ | 同一长方形，`cand:` 对角线 → 沿对角线折，两个角露出（`miss`） | `fold` | `words: equal halves ✓ · match ○` | This diagonal cuts the rectangle into two equal triangles, but folding does not make them match: two corners stick out. Equal halves are not enough. | 这条对角线把长方形分成两个一样大的三角形，可是折起来不重合，两个角露在外面。一样大还不够。（`equal-halves`） |
| 3 | `cand:y=2` → 折，重合；两条对称轴都画成点划线 | `fold` | `words: 2 lines` | The line across the middle works too. A rectangle has 2 lines of symmetry. | 横着的中线也行。长方形有 2 条对称轴。 |
| 4 ⚑ | `pair:[正方形 4 × 4，4 条点划线（含两条对角线）, 平行四边形（free poly），两条候选线都 ○]` | `morph` | `words: square 4 · parallelogram 0` | A square has 4: its diagonals work as well. This parallelogram looks balanced, but no fold makes its halves match: it has none. | 正方形有 4 条：对角线也行。这个平行四边形看上去很匀称，可是怎么折都不重合，它一条对称轴也没有。（`line-count`、`equal-halves`） |

**要点**：① To test a line, fold along it. / 判断一条线，就沿它折。② Two equal halves are not enough; they must match. / 一样大的两半还不够，要重合。

**题库（9）**：5 道 `choose`（这条线是不是对称轴：长方形对角线、平行四边形中线、等腰梯形中线、正方形对角线、风筝的横线；错例 `equal-halves`）；2 道 `choose` 多选（这几条里哪几条是对称轴 → `line-count`）；2 道 `draw-segment`（在点阵上画出这个图形的对称轴，竖直或水平）。

---

#### 第 03 步 `symmetric-figures` · 对称图形（P4 3.1, 3.2）

**概念**：很多图形是对称图形，有的有不止一条对称轴；对称轴可以是横的、竖的、斜的；斜放的对称图形还是对称图形。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `set` 6 个图：等腰三角形、一般三角形、风筝、等腰梯形、平行四边形、L 形；对称的逐个画出轴 | `shade` | `words: 3 symmetric · 3 not` | Which of these are symmetric? The isosceles triangle, the kite and this trapezium each fold onto themselves. The other three do not. | 这几个里哪些是对称图形？等腰三角形、风筝和这个梯形都能折得重合，另外三个不能。 |
| 2 ⚑ | 风筝转 30°，对称轴跟着斜 | `turn`（整幅图绕中心转） | `words: still symmetric` | Turn the kite. Its line of symmetry is slanted now, but the kite still folds onto itself. A line of symmetry does not have to stand straight up. | 把风筝转一转，对称轴变成斜的，风筝还是能折得重合。对称轴不一定是竖的。（`upright-line-only`） |
| 3 | 等边三角形 3 条、正方形 4 条（回顾）、长方形 2 条并排 | `morph` | `words: 3 · 4 · 2` | Some figures have more than one line of symmetry: an equilateral triangle has 3, a square 4, a rectangle 2. | 有的图形不止一条对称轴：等边三角形 3 条，正方形 4 条，长方形 2 条。 |
| 4 | 生活里的对称：风筝、剪纸窗花、一块花砖图案（都画成方格上的几何图，不是照片） | `morph` | — | Many things people make are symmetric: a kite, a paper cutting, a floor tile pattern. Leaves and faces are only nearly symmetric. | 人做的很多东西是对称的：风筝、剪纸窗花、花砖的图案。树叶、人脸只是差不多对称。 |

**要点**：① A line of symmetry can be upright, across or slanted. / 对称轴可以是竖的、横的、斜的。② Some figures have more than one line of symmetry. / 有的图形不止一条对称轴。

**题库（9）**：5 道 `choose` 多选（哪些是对称图形；含斜放的对称图形 → `upright-line-only`、外形对称里面不对称 → `outline-only`）；2 道 `choose`（这个图形有几条对称轴：长方形、等边三角形 → `line-count`）；2 道 `choose`（哪条点划线是对称轴：斜的那条）。`<More>`（Q3）：圆沿任何一条过圆心的线都能对折重合，有无数条对称轴。

---

#### 第 04 步 `mirror-on-grid` · 每个点都有对应点（P4 3.3）

**概念**：对称图形上每个点在对称轴另一边都有一个对应点，离轴一样远；补全时要"翻过去"，不是"挪过去"。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `G{mirror:x=6; 一个涂色格在 x=3–4}`，`pairs` 画出它的对应格（x=8–9），两边格数 2 · 2 | `place` | `words: 2 squares · 2 squares` | This shaded square is 2 squares from the line. Its partner is on the other side, also 2 squares from the line, straight across. | 这个涂色格离对称轴 2 格。它的对应格在另一边，也离轴 2 格，正对着横过去。 |
| 2 | 一个"台阶"形（4 格），逐个格翻过去 | `fold` | `words: square by square` | A bigger piece works the same way, square by square. Each square's partner is the same distance from the line on the other side. | 大一点的图形也一样，一格一格地找：每个格的对应格在另一边，离轴一样远。 |
| 3 ⚑ | `pair:[翻过去的（cold ✓），平移过去的（hot，`miss` 标出朝向反了的台阶）]` | `morph` | `words: flipped ✓ · slid ○` | Compare these two. On the left the piece is flipped across the line. On the right it is slid across: the step faces the wrong way. | 比一比。左边是翻过去的；右边是挪过去的，台阶朝错了方向。（`slid-not-flipped`） |
| 4 ⚑ | `mirror:y=4`（水平轴）；一个点离轴 3 格，hot 虚线画在离轴 1 格处后移到 3 格 | `place` | `words: 3 squares · 3 squares` | With a line across, count up and down instead. A point 3 squares above the line has its partner 3 squares below it, not next to the line. | 对称轴是横的，就上下数。一个点在轴上面 3 格，对应点在轴下面 3 格，不是贴着轴。（`distance-not-kept`） |

**要点**：① A point and its partner are the same distance from the line, on opposite sides. / 一个点和它的对应点在轴的两边，离轴一样远。② Flip across the line; do not slide. / 翻过去，不是挪过去。

**题库（9）**：6 道 `complete-symmetric`（`mode: cells`，2–5 个涂色格，竖轴或横轴；错例 `slid-not-flipped`、`distance-not-kept`）；3 道 `choose`（哪一个是这个图形对的另一半 → 选项含平移的、距离错的）。

---

#### 第 05 步 `completing-figures` · 补全对称图形（P4 3.3）

**概念**：一个点一个点地翻过去，再连起来；半格的斜边方向要反过来；贴着轴的部分不动；最后折一折检查。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `G{mirror:x=5; 一半轮廓（5 个顶点，cold）}`，顶点逐个翻过去成 signal 点，再按顺序连线 | `place` | `words: corner by corner` | To complete a figure drawn with lines, find the partner of each corner first, then join them in the same order. | 补全一个用线画的图形，先找出每个顶点的对应点，再按同样的顺序连起来。 |
| 2 ⚑ | 一半由整格与两个半格组成；半格翻过去时斜边方向反过来（signal 半格），旁边一个 hot 虚线的"没翻"的半格 | `fold` | `words: leans right → leans left` | Half squares flip too. A half square that leans right leans left in its partner. | 半格也要翻。朝右斜的半格，翻过去要朝左斜。（`half-not-flipped`） |
| 3 | 图形有一段贴着对称轴（在轴上的格边不复制） | `shade` | `words: on the line: stays` | Parts that lie on the line stay where they are; they are their own partners. | 正好在对称轴上的部分不动，它们自己就是自己的对应部分。 |
| 4 | 补全的图沿轴折一折，两半重合（`fold` + ✓） | `fold` | `words: folds onto itself ✓` | Check by folding along the line: if your half lands exactly on the given half, the figure is complete. | 沿对称轴折一折来检查：你补的一半正好落在给的那一半上，就补对了。 |

**要点**：① Find each corner's partner, then join them in order. / 先找每个顶点的对应点，再按顺序连。② Half squares flip their slant. / 半格翻过去，斜的方向反过来。③ Check by folding. / 折一折来检查。

**题库（10）**：8 道 `complete-symmetric`（4 道 `mode: cells`（含半格），4 道 `mode: outline`（点格点连线）；竖轴 5、横轴 3；错例 `half-not-flipped`、`slid-not-flipped`、`distance-not-kept`）；2 道 `choose`（哪一幅补对了）。

---

### 2.3 练习章 `practice`（7 道固定题）

| # | 题型 | 题目（EN / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `choose` | Is the dashed line a line of symmetry? / 虚线是对称轴吗？（长方形对角线） | 不是 | 是 → `equal-halves` | 02 |
| Q2 | `choose`（多选） | Which figures are symmetric? / 哪些是对称图形？（斜放的风筝、平行四边形、等腰三角形、外形对称内部不对称的图） | 风筝、等腰三角形 | 漏选风筝 → `upright-line-only`；多选最后一个 → `outline-only` | 01、03 |
| Q3 | `choose`（多选） | Which of these lines are lines of symmetry of the square? / 哪几条是正方形的对称轴？ | 4 条全选 | 漏选对角线 → `line-count` | 02 |
| Q4 | `draw-segment` | Draw the line of symmetry. / 画出对称轴。（侧放的等腰梯形：两条平行边竖着，所以对称轴是水平的） | 水平中线 | 画成竖线 → 一般 fallback | 02 |
| Q5 | `complete-symmetric` | Complete the figure. The dashed line is a line of symmetry. / 补全图形，虚线是对称轴。（`cells`，竖轴，5 格） | 镜像 5 格 | 平移 → `slid-not-flipped` | 04 |
| Q6 | `complete-symmetric` | Complete the figure.（`cells`，横轴，含 2 个半格）/ 补全图形。 | 镜像 | 半格没翻 → `half-not-flipped` | 05 |
| Q7 | `complete-symmetric` | Complete the figure.（`outline`，竖轴，6 个顶点，最远离轴 4 格）/ 补全图形。 | 镜像 | 离轴 2 格 → `distance-not-kept` | 05 |

题型：choose、draw-segment、complete-symmetric。

---

## 3. 引擎：扩展 A4 `grid`

### 3.0 复用与新增

| 编号 | 内容 | 复用 / 新增 |
|---|---|---|
| — | A4 `grid`（docs/21 §3、docs/06「方格」）：图形 `cells` / `rect` / `poly` + `halves`、点格交互、行首按钮、roving-tabindex | 复用 |
| — | `fold` 过渡的画法（docs/15 §10：沿折线翻 180°、背面淡色、折痕发丝线）；`choose` 的第二级提示解锁舞台操作（docs/39 D5 的"折一折"） | 复用 |
| — | `draw-segment`（docs/76 E-AN5） | 复用（谁先施工谁做） |
| **E-SY1** | `grid` 加：`mirror: { x } \| { y } \| { diag: [x0, y0, "up" \| "down"] }`（点划线对称轴；斜轴只用于判断，D8）、`candidates: [line…]`（待判断的虚线，可多条）、`fold: { line, t: 0–1 }` 与 `fold` 过渡（线一侧的整幅图沿线翻到另一侧，半透明 hot 轮廓）、`mismatch: true`（折后不重合的区域墨色斜线，由几何算出）、`pairs: [[x, y]…]`（点与对应点的连线 + 两边格数）、`turn`（整幅图绕中心转，第 03 步）、`poly` 的 `free: true`（允许斜边、顶点在格点上；本课专用，validate 不给它算面积周长） | 新增 |
| **E-SY2** | 小测 `complete-symmetric`（§3.2） | 新增 |
| **E-SY3** | 误解域 `symmetry`（7 码）+ `lib/diagnose/symmetry.ts` | 新增 |
| **E-SY4** | 右上卡 SYMMETRY、PLATE 行 | 新增 |

### 3.1 E-SY1 几何（`lib/symmetry.ts`，纯函数）

- `reflect(shape, line)`：格、半格（半格的方向 `ne ↔ nw`、`se ↔ sw`（竖轴），`ne ↔ se`、`nw ↔ sw`（横轴），斜轴另表）、多边形顶点。
- `isSymmetric(figure, line)`：图形（含 `cells` 的涂色）与它的反射集合相等。
- `linesOfSymmetry(figure)`：在竖、横、两条 45° 方向上搜（判断题与 `line-count` 的诊断用）。
- `mismatch(figure, line)`：折后不重合的区域（多边形差集），给 `miss` 画斜线。

### 3.2 E-SY2 `complete-symmetric`

| 字段 | 孩子做什么 | 键盘 | 检查 | `sample` |
|---|---|---|---|---|
| `{ grid, given: figureId, mirror, mode: "cells" \| "outline" }` | `cells`：在轴另一边点格（再点撤），点格的一角铺半格（同 `count-squares` 的半格交互）；`outline`：点格点放顶点，按放的顺序自动连线，"撤一个点"；托盘"折一折"（第二级提示后可用）把给的一半折过来看重不重合（不判分） | 格 / 格点 roving-tabindex，方向键移动、Enter 选、H 切换半格方向 | 孩子的部分 = `reflect(given)`（集合相等；`outline` 比顶点集合与连线顺序） | `"cells:(7,2),(8,2)"`、`"pts:(7,1),(9,1),(9,3)"` |

手机 390 宽：交互方格 ≤ 12 × 10，格最小 22 px；`cells` 模式的行首按钮"这一行照着翻"（一次补一整行，脚手架）同 A4 的按行铺。

### 3.3 E-SY3 诊断规则（由孩子的结果算出）

| code | 规则 |
|---|---|
| `slid-not-flipped` | 孩子的部分 = 给定部分**平移**到轴另一边（平移量 = 给定部分的宽 + 到轴距离的两倍，或贴着轴平移），且 ≠ 反射 |
| `distance-not-kept` | 孩子的部分 = 关于**另一条**平行轴的反射（轴偏 1–3 格），或每个对应点离轴的距离差同一个常数 |
| `half-not-flipped` | 整格都对，只有半格方向 = 原方向（没翻） |
| `equal-halves`、`upright-line-only`、`outline-only`、`line-count` | `choose` 专用（单选错项的 `misconception`；多选的漏选 / 多选映射到声明的码） |

单测：`tests/math-scene/{symmetry,diagnose-symmetry}.test.ts`（反射、半格方向表、对称判断、轴的搜索、`mismatch` 面积、三条算出的诊断各 ≥ 2 正例 1 反例）。docs/06「方格」加"对称"一段。

### 3.4 E-SY4 HUD

右上卡 **SYMMETRY**：LINE（UPRIGHT / ACROSS / SLANTED）· MATCH（讲解拍：折后 ✓ / ○；小测：只在孩子按"折一折"后显示）· LINES（讲解拍第 02、03 步：这个图形有几条）。PLATE 行 MODEL GRID · LINE · SQUARES · PARTNERS（PARTNERS = 孩子已补的对应格 / 点数，不写目标数）。背景章 00 标本："小屋"图形折到一半（`SPECIMEN FOLD 50 %`）。

---

## 4. 名词表（`glossary.json`，9 个）

| id | EN | ZH | 定义要点 |
|---|---|---|---|
| `symmetric-figure` | symmetric figure | 对称图形 | 能沿一条线对折、两半完全重合的图形（Q4：大陆课本"轴对称图形"）。 |
| `line-of-symmetry` | line of symmetry | 对称轴 | 让图形对折后两半完全重合的那条线。 |
| `fold` | fold | 对折 | 沿一条线把纸折过来，两边贴在一起。（与分数主题同一个词） |
| `match-exactly` | match exactly | 完全重合 | 折过来后一点也不多、一点也不少。 |
| `partner-point` | partner (of a point) | 对应点 | 对称图形上，一个点在对称轴另一边的那个点，离轴一样远。 |
| `half-square` | half square | 半格 | 一个方格沿对角线切开的一半。（与 docs/21 同一个词） |
| `square-grid` | square grid | 方格 | （与 docs/21 同一条） |
| `diagonal` | diagonal | 对角线 | 连接图形两个不相邻顶点的线段。本课只说"沿对角线折"。 |
| `kite` | kite (shape) | 风筝形 | 两组相邻的边分别相等的四边形，像风筝；有一条对称轴。 |

（9 个：本课词少，不凑数。）

---

## 5. 写作规则与术语

### 5.1 口吻样例

- 讲解："Fold along the line. Nothing sticks out, so the halves match exactly." / "沿这条线折。没有露出来的地方，两半完全重合。"
- 错误反馈："Not yet. Count from the line: how far is this square from it? Its partner is that far on the other side." / "还没对。从对称轴数一数：这个格离轴几格？对应格在另一边离轴同样远。"

### 5.2 术语（MOE 英文 · 中文 · 备注）

| EN | ZH | 备注 |
|---|---|---|
| line symmetry | 线对称 | 课纲小标题；正文少用，多说"对称图形""对称轴" |
| symmetric figure | 对称图形 | Q4（**待核**新加坡华文） |
| line of symmetry | 对称轴 | |
| fold, match exactly | 对折、完全重合 | |
| partner | 对应点 / 对应格 | 英文课本也说 "corresponding point"（**待核**），EN 正文用 partner，名词表注 corresponding |
| square grid, dot grid | 方格、点阵 | 同 docs/21、docs/76 |
| upright / across / slanted | 竖的 / 横的 / 斜的 | 不用"垂直的 / 水平的"（"垂直"在 docs/76 是两线关系） |
| kite, isosceles triangle, equilateral triangle, trapezium, parallelogram | 风筝形、等腰三角形、等边三角形、梯形、平行四边形 | 这几个图形名在 P4 课纲里没有专条（三角形、四边形性质在 P5），本课只当名字用，不讲性质 |

### 5.3 数字与情境

- 交互方格 ≤ 12 × 10；离轴 ≤ 5 格；补全 2–8 个格或 4–7 个顶点；半格 ≤ 4 个。
- 情境物件都画成方格上的几何图：风筝、剪纸窗花、花砖图案、窗户、"小屋"。不画国旗、徽章、宗教符号、文字。

---

## 6. 插图（交 Codex；风格与验收同 docs/76 §6、docs/69 §4.2，严格）

对称本身是教学点：**每张的左右（或上下）两半要用脚本比**（把图沿轴翻转，与原图的 alpha 轮廓求重合率）。`art/planned/symmetry/` 有 2026-10-18 的三张候选，缩略图目检形状与描述一致。

| # | 文件 | 尺寸 | 用在 | 画什么 | 可数 / 可量的事实（逐条验收） | 不许出现 | 方法 |
|---|---|---|---|---|---|---|---|
| I-1 | `symmetry.png`（封面） | 1024² | 主题卡 | 一只素面纸剪的蝴蝶平放、俯视，翅膀全开，中间一道竖直折痕 | ① 恰好四片翼瓣（上二下二）；② 折痕竖直、在正中（±1 % 宽）；③ 左右轮廓镜像：沿折痕翻转后 alpha 轮廓重合率 ≥ 97 %（脚本）；④ 无触角、无花纹；⑤ 纸边有薄厚感 | 花纹、触角、身体细节、文字、背景、阴影 | 候选过 ③ 则用；不过则代码画轮廓 + 铅笔质感 |
| I-2 | `symmetry-folded-heart.png` | 1536×1152 | 第 01 章 | 一张纸剪的心形沿竖直中线对折了一部分，右半边掀起一点，看得见折痕和两半的弯边 | ① 一张连着的纸，折痕是直线；② 掀起的右半边的轮廓与左半边的轮廓同形（透视下目测，不做脚本）；③ 只有一道折痕；④ 无画上去的线、虚线、箭头 | 两张分开的纸、第二道折痕、装饰、文字 | 候选过检则用 |
| I-3 | `symmetry-paper-folds.png` | 1536×1152 | 第 02 章 | 一张横放的长方形素纸，俯视，两道真实的折痕在正中十字相交，把纸分成四个一样大的小长方形；**没有对角线折痕** | ① 恰好两道折痕；② 横折痕在上下正中、竖折痕在左右正中（±1 %，脚本量）；③ 纸宽 : 高 在 1.3–1.6 之间（明显不是正方形，否则对角线也是对称轴）；④ 无对角折痕 | 对角折痕、字、画线、边框、背景 | 候选过 ②③ 则用；不过则代码画 |

图注草稿：I-2 "Folded along the middle, the two halves of the heart lie exactly on each other." / "沿中线对折，心形的两半正好叠在一起。"；I-3 "A rectangle folds onto itself along these two lines only, not along its diagonals." / "长方形只能沿这两条线折得重合，沿对角线不行。"。三张都可反相。

---

## 7. 施工顺序与分工（不需要新依赖；子代理不改 `package.json`、不提交）

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | §0.1 定稿；建 `src/content/topics/symmetry/{chapters,data}`、`topic.yaml`（`illustration: symmetry`） | `topic.yaml` | — | S |
| 1 | E（Opus） | E-SY1–E-SY4（+ E-AN5 若 docs/76 未做）、单测、docs/06 | `stage/GridModel.tsx`（**与面积周长共用，回归 `pnpm shoot area-perimeter --beats`**）、`lib/{symmetry.ts,diagnose/symmetry.ts}`、`tests/math-scene/{symmetry,diagnose-symmetry}.test.ts` | 0 | S–M |
| 2 | L（Opus） | `lesson.json`：5 步 × 4 拍、样板题、练习 7 题；`pnpm shoot symmetry --beats` | `data/lesson.json` | 1 | S |
| 3 | Codex | 题库其余约 35 道（`pnpm tsx scripts/math/check-pool.ts <draft> --topic symmetry --step <id>` 0 错）；5 章英文初稿 | `scripts/math/drafts/` | 2 | S |
| 4 | T（Opus） | 合并、定稿英文、写中文正文、名词表、来源 | `data/*`、`chapters/*` | 3 | S |
| 4′ | Codex + 主会话 | §6 三张图的复核（含翻转比对脚本） | `public/illustrations/**` | 0 | S |
| 5 | P（Sonnet） | QA；e2e：手机上补格（含半格方向）、纯键盘补轮廓、"折一折"在第二级提示后才出现；**面积周长主题回归** | `tests-e2e/symmetry.spec.ts` | 4 | S |
| 6 | 主会话 | 验收、截图、提交 | — | 5 | S |

---

## 8. 验收

照 `references/acceptance.md`，另加：

- [ ] 每个"重合 / 不重合"的拍由 `isSymmetric` 算出，字幕与几何一致（validate）；`mismatch` 斜线只在不重合时出现
- [ ] 补全题只用竖、横两种轴（D8、Q1）；斜轴只在判断题
- [ ] `fold` 过渡与分数主题的对折一个画法（并排截图比）；reduced-motion 下直接到位
- [ ] 面积周长主题 `pnpm shoot area-perimeter --beats --tasks` 0 回归
- [ ] §2.1 每个码有 ⚑ 拍、有能诊断它的题
- [ ] 灰度截图能分辨：给定的一半、孩子补的、折过来的轮廓、不重合的斜线、点划线对称轴与虚线候选线
- [ ] 截图：第 02、05 章 + 练习与一道小测，三种尺寸

## 9. 来源（访问日期 2026-11-15）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six*（URL 同 docs/76 S1） | 课纲原文第 32、34、39 页 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | Leikin, R., Berman, A., & Zaslavsky, O. (2000). Learning through teaching: The case of symmetry. *Mathematics Education Research Journal*, 12(1), 18–36 | 对角线当对称轴、数对称轴 |
| S4 | Hoyles, C., & Healy, L. (1997). Unfolding meanings for reflective symmetry. *International Journal of Computers for Mathematical Learning*, 2(1), 27–59 | 斜轴、"一样大的两半"（**待核**页） |
| S5 | Küchemann, D. (1981). Reflections and rotations. In K. M. Hart (Ed.), *Children's Understanding of Mathematics: 11–16* (pp. 137–157). London: John Murray | 平移代替反射、距离错、斜轴难（页码**待核**） |
| S6 | Ng, O.-L., & Sinclair, N. (2015). Young children reasoning about symmetry in a dynamic geometry environment. *ZDM*, 47(3), 421–434 | 小学生补全对称图形的做法 |
| S7 | 批准教材目录（只作顺序参考），https://www.moe.gov.sg/education-in-sg/approved-textbook-list | Q1、Q4 的写法（**待核**课本） |

## 10. 施工记录 / 已知差距

施工时追加。
