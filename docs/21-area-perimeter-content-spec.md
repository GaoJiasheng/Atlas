# 21 · 面积与周长 · 内容 spec（`area-perimeter`，MathScene 课；v1 草案，待 Gavin 定稿）

docs/17 §6 #4。2026-10-13 起草，**只做规划，不施工、不建目录、不提交**。照 skill `.claude/skills/atlas-lesson-topic/` 与样板 docs/15（分数，§10）写；三课共用的引擎泛化（G1–G12）见 **docs/19 §3.0**，本文写本课用到的部分、新模型 A4（方格）和量度域的误解诊断。A4 也给 docs/19 第 12 步（面积模型）用，并将给三角形面积、对称、圆（docs/17 §7 A4）复用。

记号同 docs/19：EN 是口吻草稿，ZH 是 Claude 草稿；S1 = MOE *Mathematics Syllabus Primary One to Six*（2021 Primary One Cohort，Updated Oct 2025），页码是 PDF 上印的页码。字幕里的量写 G7 记号 `{u:12 cm2}`（显示 12 cm²），本文为了好读直接写 cm²。

---

## 0. 待定稿的决定（Gavin 确认）

| # | 决定 | 建议 |
|---|---|---|
| D1 | **对象与主体**：Measurement and Geometry · Area and Volume 的 Area and Perimeter 一线。**P3 为主体**（第 01–07 步覆盖 P3 1.1–1.4），**P4 三条**（已知面积 / 周长求边、正方形求边长、组合图形）作为第 08–11 步。P1 的量长度、方格临摹与 P2 的米是"你已经知道的"，不单独成步 | 同意 |
| D2 | **P4 的四步怎么标**：(a) `bridge: true`，章头显示"再往前一步 / Going further"（不写年级），练习里只放 3 道；(b) 和 P3 一样当主体 | **(a)**：女儿 2027 年 P3 先做 01–07，2028 年接着做 08–11，一个主题用两年 |
| D3 | 课的形状同分数改版后：每章 3–5 拍 + 一道随机小测；练习 8 道固定题 | 同意 |
| D4 | **UI 不出现年级**（docs/19 D3、G8） | 同意 |
| D5 | **新模型 A4 方格**（`grid`）：单位正方形铺满、沿边走、画长方形、切开组合图形、带尺寸线的"不按比例"图；新小测类型 `count-squares`、`trace-perimeter`、`draw-rectangle`、`split-figure`；`input` 加 `measure`（数 + 单位芯片）写法（§3） | 同意 |
| D6 | **英文用 length 和 breadth**（新加坡课本的说法，不用 width；**待核**一页 P3 课本）；ZH 用"长""宽"；正方形的边叫 side / 边长 | 同意 |
| D7 | **单位**：课纲只要求 square units、cm²、m²，**不做 cm² ↔ m² 换算**（S1 第 36 页原文 "excluding conversion between cm2 and m2"）；周长用 cm、m；方格题不带单位时写 "square units / 平方单位" 和 "units / 单位长" | 同意 |
| D8 | **"不按比例"**：第 04 步起出现没有方格、只标边长的图，右下角固定一行 "Not drawn to scale / 未按比例画"（新加坡试卷的写法）；方格图按比例 | 同意 |
| D9 | **情境**：餐垫、组屋地砖、卧室地面、社区花园的围栏、学校告示板、hawker 桌面、组屋户型平面图；数字是虚构的整数，不声称某户型的真实面积 | 同意 |
| D10 | **背景章 00**：同 docs/19 D10（不写年级） | 同意 |
| D11 | **首页图**：本课没有现成的，§6.1 给 Codex 一条新 prompt（铺地砖 + 量边）；章节配图 2 张（花园围栏、组屋平面图） | 同意 |

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字）

| 级 | 子线 · 条目 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|---|
| P1（地基） | Measurement · 1. Length | 1.1 measuring length in centimetres · 1.2 use of abbreviation cm · 1.3 comparing and ordering lengths in cm · 1.4 measuring and drawing a line segment to the nearest cm | 32 | "你已经知道的" |
| P1（地基） | Geometry · 1. 2D Shapes | 1.4 copying figures on dot grid or square grid | 32 | 方格语法的来源 |
| P2（地基） | Measurement · 1. Length, Mass and Volume | 1.1 measuring · length in metres · 1.2 using appropriate units of measurement and their abbreviations m, g, kg, ℓ | 34 | m 的来源 |
| **P3** | Area and Volume · 1. Area and Perimeter | 1.1 concepts of area and perimeter of a plane figure · 1.2 measuring area in square units, cm2 and m2, excluding conversion between cm2 and m2 · 1.3 perimeter of · rectilinear figure · rectangle · square · 1.4 area of rectangle/square | 36 | 第 01–07 步 |
| **P4** | Area and Volume · 1. Area and Perimeter | 1.1 finding one dimension of a rectangle given the other dimension and its area/perimeter · 1.2 finding the length of one side of a square given its area/perimeter · 1.3 finding the area and perimeter of composite figures made up of rectangles and squares | 39 | 第 08–11 步（D2） |
| P4（相关） | Geometry · 2. Rectangle and Square | 2.1 properties of rectangle and square, excluding diagonal properties · 2.2 drawing rectangles and squares | 39 | 第 04 步"对边相等"一句话；`draw-rectangle` 题型 |
| P5（不做） | Area and Volume · 1. Area of Triangle | （三角形面积，第 42 页） | 42 | docs/17 `triangle-area` 主题，复用 A4 |

核对要点：
- **面积与周长的概念、平方单位、长方形 / 正方形面积都在 P3**；"求边"和"组合图形"在 **P4**。
- P3 的周长包括 **rectilinear figure**（直线图形：边都是直线、角都是直角），所以第 05 步在 P3 内；组合图形的**面积**是 P4 1.3。
- **不做 cm² ↔ m² 换算**（S1 第 36 页原文）。
- 长方形 / 正方形的性质（对边相等、四个直角）条目在 P4 Geometry 2.1，P3 第 04 步只用"对边一样长"这一句，不展开。

### 1.2 级别、步数与时间

- **11 个课步 + 练习章 + 背景章 00**（12 个带编号的章）。
- 拍数 45（≈ 15 min），小测 11 道（≈ 7 min），练习 8 道（≈ 5 min）：**全课约 27 分钟**；P3 部分（01–07）约 15 分钟。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字 |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | — | — | — | — |
| 01 | `what-is-area` | How much surface? | 面积：盖住多大的面 | P3 1.1 | grid（铺砖） | 4 | 9 · count-squares / choose | ≤ 24 格 |
| 02 | `square-units` | Square units: cm² and m² | 平方单位：cm² 和 m² | P3 1.2 | grid（cm、m，半格） | 4 | 9 · count-squares / input（measure）/ choose | ≤ 30 格，半格成对 |
| 03 | `what-is-perimeter` | The distance around | 周长：绕一圈有多长 | P3 1.1, 1.3 | grid（沿边走） | 4 | 9 · trace-perimeter / input / choose | 方格内 ≤ 10 × 8 |
| 04 | `rectangle-perimeter` | Perimeter of rectangles and squares | 长方形和正方形的周长 | P3 1.3 | grid（不按比例 + 尺寸线） | 4 | 10 · input / choose | 边 ≤ 50 cm 或 ≤ 30 m |
| 05 | `rectilinear-perimeter` | Perimeter of rectilinear figures | 直线图形的周长 | P3 1.3 | grid（L 形、缺边） | 4 | 9 · input / trace-perimeter / choose | 6–8 条边，边 ≤ 20 |
| 06 | `rectangle-area` | Area of rectangles and squares | 长方形和正方形的面积 | P3 1.4 | grid（按行铺 → 不按比例） | 5 | 10 · input（measure）/ draw-rectangle / count-squares / choose | 边 ≤ 12（乘法表内） |
| 07 | `same-area-different-perimeter` | Same area, different perimeter | 面积相同，周长不同 | P3 1.1, 1.3, 1.4 | grid（同样 12 块重排） | 4 | 9 · draw-rectangle / choose / input | 面积 ≤ 36 |
| 08 | `missing-side` | Finding a missing side | 已知面积或周长，求一条边 | P4 1.1 | grid（不按比例，一边 "?"） | 4 | 10 · input / draw-rectangle / choose | 边 ≤ 12（面积）、周长 ≤ 60 |
| 09 | `square-side` | The side of a square | 求正方形的边长 | P4 1.2 | grid（正方形逐个长大） | 4 | 9 · input / choose / draw-rectangle | 边 ≤ 12 |
| 10 | `composite-area` | Area of composite figures | 组合图形的面积 | P4 1.3 | grid（切开 / 补全再减） | 4 | 10 · split-figure / input / choose | 两三个长方形，边 ≤ 20 |
| 11 | `composite-perimeter` | Perimeter of composite figures | 组合图形的周长 | P4 1.3 | grid（拼合、内边消失） | 4 | 9 · input / trace-perimeter / choose | 同上 |
| 12 | `practice` | Practice | 练习 | P3–P4 | 按题 | — | 8 道固定题 | — |

### 1.4 不在本课

- cm² ↔ m² 换算（课纲排除）；km²、公顷。
- 三角形、平行四边形、圆的面积（P5–P6，另外的主题）。
- 体积（P5）；对称（P4 Line Symmetry，另一主题，复用 A4）。
- 长方形的对角线性质（课纲排除）。
- 不规则曲线图形的估算面积（课纲没有）。

---

## 2. 课的设计

### 2.0 写法约定

同 docs/19 §2.0；另加：
- **面积说"盖住 / 铺满"，周长说"绕一圈 / 走一圈"**：两个动作对应两个词，全课不混用（"铺"和"走"是 docs/17 #4 的关键画面）。
- 颜色：给定的图形 = cold 轮廓；孩子铺的单位正方形 = signal 填色；孩子走过的边 = signal 粗线；第二个图形（比较用）= hot；拿走的一块 = 墨色斜线；"看答案" = 墨色虚线。面积（填色）和周长（粗线）在灰度下也分得开：一个是面、一个是线。
- 尺寸线照技术图版：延长线、两端小箭头、数字居中、未知写 "?"。

### 2.1 误解目录（量度域，`lib/diagnose/measure.ts`）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `unequal-units` | 用大小不同的方块比面积 | 3 块大砖和 12 块小砖比 | "The squares must all be the same size before the counts can be compared." / "方块要一样大，数出来的个数才能比。" | S5、S10 |
| `half-squares` | 半格当整格数，或干脆不数 | 6 整 + 2 半数成 8 或 6 | "Two half squares make one whole square." / "两个半格合起来是一个整格。" | S5、S10 |
| `unit-not-squared` | 面积写成 cm，周长写成 cm² | 28 cm 当面积 | "Area counts squares, so its unit is cm². cm is for lengths." / "面积数的是正方形，单位是 cm²；cm 是量长度的。" | S6、S12 |
| `area-perimeter-swap` | 面积和周长混了 | 求面积写周长（14 当 12） | "Area is the squares inside. Perimeter is the distance around." / "面积是里面有几个正方形，周长是绕一圈有多长。" | S7、S8、S9 |
| `border-squares` | 数边上的格子当周长 | 4 × 3 的长方形周长数成 10 | "Count the sides of squares along the edge, not the squares. A corner square has two sides on the edge." / "数边上的线段，不是数格子。角上的格子有两条边在外面。" | S4、S9 |
| `two-sides-only` | 只加一个长一个宽 | 5 × 3 长方形周长写 8 | "5 + 3 is only half the way round." / "5 + 3 只走了半圈。" | S9、S12 |
| `sides-added-for-area` | 面积把长宽相加 | 4 × 3 的面积写 7 | "Adding the sides gives a length. Count the rows of squares: 3 rows of 4." / "长加宽得到的是一段长度。数一数正方形：3 行，每行 4 个。" | S6、S8 |
| `missing-side` | 直线图形漏了没标的边 | L 形只把标出的四条边加起来 | "Walk all the way round. Some sides have no label yet: find them from the sides opposite." / "走完一整圈。有的边没标长度，用对面的边求出来。" | S9、S12 |
| `same-area-same-perimeter` | 以为面积相同周长就相同（或周长大面积就大） | 用 3 × 4 当"面积 12、周长 16" | "These two have the same area but different perimeters. Walk round each one." / "这两个面积一样，周长不一样。各走一圈看看。" | S7、S13 |
| `perimeter-not-halved` | 已知周长和长求宽时直接相减 | 周长 20、长 6，宽写 14 | "20 − 6 is the other three sides together. Half the perimeter is one length and one breadth." / "20 − 6 是另外三条边的和。周长的一半才是一个长加一个宽。" | S9 |
| `side-from-total` | 正方形求边长时除错 | 周长 20 → 10；面积 36 → 9 或 18 | "A square has 4 equal sides, so divide the perimeter by 4. For the area, find the number that times itself makes 36." / "正方形 4 条边一样长，周长除以 4；已知面积，就找哪个数乘它自己得 36。" | S12 |
| `overlap-counted` | 组合图形的面积多算 | 两块重叠的部分算两次；大长方形没减去缺的角 | "The two pieces overlap here, so this part was counted twice." / "这两块在这里重叠了，这一部分算了两次。" | S11、S12 |
| `inner-edge-counted` | 组合图形的周长把内边也算上 | 两个正方形拼起来，周长写成两个周长之和 | "The sides where the shapes touch are inside now. Walk round the outside only." / "拼在一起的那两条边到里面去了，只走外面一圈。" | S9、S12 |

### 2.2 逐步设计

拍表的列同 docs/19。模型写法见 §3.1（简写：`R(x,y,w,h)` 长方形，`L{…}` 直线图形的顶点）。

---

#### 第 01 步 `what-is-area` · 面积：盖住多大的面（P3 1.1）

**概念**：面积是一个图形盖住的面有多大；用同样大的正方形铺满，数有几块。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{show:"none", figures:[a:R(0,0,4,3) cold, b:R(6,0,6,2) hot]}` | — | — | Two placemats of different shapes. Which one covers more of the table? It is hard to tell just by looking. | 两张形状不同的餐垫。哪一张盖住的桌面多？光看不好说。 |
| 2 | `tiles:{a:12}` | `tile` | `a: 12` | Cover the first mat with squares that are all the same size. It takes 12 squares. | 用同样大的正方形把第一张铺满，要 12 块。 |
| 3 | `tiles:{a:12, b:12}` | `tile` | `a: 12 · b: 12` | The second mat also takes 12 of the same squares. Different shapes can cover the same amount: they have the same area. | 第二张也要 12 块同样的正方形。形状不同，盖住的一样多：面积相同。 |
| 4 ⚑ | b 改铺 2 × 2 的大方块：`tiles:{b:{count:3, size:2}}` | `tile` | `3 big = 12 small` | Counting 3 big squares on one mat and 12 small ones on the other does not compare them. Area is measured with squares of one size. | 一张数 3 块大的，一张数 12 块小的，没法比。量面积要用同样大的正方形。（`unequal-units`） |

**要点**：① Area is how much surface a shape covers. / 面积是图形盖住的面有多大。② Measure it by counting squares of one size. / 用同样大的正方形去数。

**题库（9）**：4 道 `count-squares`（在方格上铺满一个图形，再写块数；≤ 24 格）；3 道 `choose`（哪个面积大：方格上两个形状不同的图形；一项用不同大小的方块 → `unequal-units`）；2 道 `choose`（哪两个面积一样）。

---

#### 第 02 步 `square-units` · 平方单位：cm² 和 m²（P3 1.2）

**概念**：边长 1 cm 的正方形面积是 1 cm²；量大的面用 m²；两个半格是一个整格。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{unit:"cm", show:"cells", legend:true, figures:[R(0,0,1,1)]}`（尺寸线 1 cm × 1 cm） | — | `1 cm²` | A square with sides of 1 cm has an area of 1 square centimetre, written 1 cm². | 边长 1 cm 的正方形，面积是 1 平方厘米，写作 1 cm²。 |
| 2 ⚑ | `figures:[R(0,0,4,2)], tiles:8` | `tile` | `8 cm²` | This shape is covered by 8 of these squares, so its area is 8 cm². The small 2 means square centimetres; 8 cm would be a length. | 这个图形铺了 8 个这样的正方形，面积是 8 cm²。右上角的小 2 表示"平方"；写成 8 cm 就成了长度。（`unit-not-squared`） |
| 3 ⚑ | `figures:[poly 6 整格 + 2 个半格三角形], halves 成对高亮` | `tile` | `6 + 1 = 7 cm²` | Two half squares make one whole square. This shape is 6 whole squares and 2 halves: 7 cm². | 两个半格合起来是一个整格。这个图形是 6 个整格加 2 个半格：7 cm²。（`half-squares`） |
| 4 | `grid{unit:"m", legend:"1 m²", figures:[R(0,0,3,4)]}` | `morph` | `12 m²` | Bigger surfaces, like a bedroom floor, are measured in square metres. A square 1 m by 1 m is 1 m². This floor is 12 m². | 大一些的面，比如卧室的地面，用平方米来量。边长 1 m 的正方形是 1 m²。这块地面是 12 m²。 |

**要点**：① 1 cm² is the area of a square with 1 cm sides; 1 m² has 1 m sides. / 1 cm² 是边长 1 cm 的正方形的面积，1 m² 是边长 1 m 的。② Two half squares make one square. / 两个半格是一个整格。

**题库（9）**：3 道 `count-squares`（带半格；错例 `half-squares`）；3 道 `input`（`measure`：写数并选单位；错例 `unit-not-squared`）；3 道 `choose`（量这个面用 cm² 还是 m²：邮票、告示板、教室地面、组屋走廊）。

---

#### 第 03 步 `what-is-perimeter` · 周长：绕一圈有多长（P3 1.1, 1.3）

**概念**：周长是沿图形的边走一圈的长度；数边上的线段，不数格子。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{unit:"cm", figures:[R(0,0,4,3)]}` | — | — | Perimeter is the distance all the way round the edge of a shape. | 周长是沿着图形的边走一圈的长度。 |
| 2 | `walk:{figure:a, edges:14, counter:true}` | `walk` | `14 cm` | Walk round the edge one square side at a time: 1, 2, 3 … You are back at the start after 14 steps. The perimeter is 14 cm. | 沿着边一小段一小段地走：1、2、3……走 14 段回到起点。周长是 14 cm。 |
| 3 ⚑ | 边上的 10 个格子画墨色虚线，四个角格各标两段 | `shade` | `10 ≠ 14` | Counting the squares along the edge gives 10, not 14. Each corner square has two sides on the edge. Count the sides, not the squares. | 数边上的格子只有 10 个，不是 14。角上的格子有两条边在外面。要数边，不数格子。（`border-squares`） |
| 4 ⚑ | `tiles:{a:12}` + `walk:{a:14}` 同时显示 | `tile` | `area 12 cm² · perimeter 14 cm` | Area counts the squares inside; perimeter counts the lengths around. One shape, two measures, two units. | 面积数里面的正方形，周长量外面一圈的长度。同一个图形，两种量法，两种单位。（`area-perimeter-swap`） |

**要点**：① Perimeter is the distance around a shape. / 周长是绕图形一圈的长度。② Count the sides of the squares along the edge. / 数边上的线段，不数格子。

**题库（9）**：4 道 `trace-perimeter`（在方格上点出外圈的每一小段，再写周长；错例 `"=10"` → `border-squares`、`"=12"` → `area-perimeter-swap`）；3 道 `input`（方格上的长方形写周长）；2 道 `choose`（哪一条描的是周长：描了里面的线的一项 → `area-perimeter-swap`）。

---

#### 第 04 步 `rectangle-perimeter` · 长方形和正方形的周长（P3 1.3）

**概念**：没有方格时用边长：四条边加起来；长方形对边相等，正方形四边相等。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{show:"none", figures:[R(0,0,5,3)], dims:[{side:"top",label:"5 cm"},{side:"left",label:"3 cm"}], notToScale:true}` | — | `5 + 3 + 5 + 3 = 16 cm` | Without a grid, use the side lengths. Add all four sides: 5 + 3 + 5 + 3 = 16 cm. | 没有方格时，就用边长。把四条边加起来：5 + 3 + 5 + 3 = 16 cm。 |
| 2 | 对边成对高亮（两长 cold、两宽 hot） | `shade` | `2 × 5 + 2 × 3 = 16 cm` | Opposite sides of a rectangle are equal, so there are two lengths of 5 cm and two breadths of 3 cm. | 长方形的对边一样长：两条长各 5 cm，两条宽各 3 cm。 |
| 3 ⚑ | `walk` 只走到对角 | `walk` | `5 + 3 = 8 cm` | 5 + 3 takes you only halfway round. Keep walking: the other half is another 8 cm. | 5 + 3 只走到一半。接着走，另一半还有 8 cm。（`two-sides-only`） |
| 4 | `figures:[R(0,0,4,4)], dims:[{side:"top",label:"4 cm"}]` | `morph` | `4 × 4 = 16 cm` | A square has four equal sides, so its perimeter is 4 × side: 4 × 4 = 16 cm. | 正方形四条边一样长，周长 = 4 × 边长：4 × 4 = 16 cm。 |

**要点**：① Perimeter of a rectangle: add the four sides, two lengths and two breadths. / 长方形周长：两条长加两条宽。② Perimeter of a square = 4 × side. / 正方形周长 = 4 × 边长。

**题库（10）**：6 道 `input`（长方形、正方形，cm 与 m；错例 `two-sides-only`、`area-perimeter-swap`（算成长 × 宽））；2 道 `input`（告示板、花园围栏的情境题）；2 道 `choose`（哪个算式求的是周长）。

---

#### 第 05 步 `rectilinear-perimeter` · 直线图形的周长（P3 1.3）

**概念**：直线图形的边都是直线、角都是直角；没标的边用对面的边求，然后走完一整圈。

L 形：外框 7 × 5，右上角缺 3 × 2。六条边：底 7、左 5、顶 4、下台阶 2、横台阶 3、右 3。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{unit:"cm", show:"none", figures:[L{(0,0),(7,0),(7,3),(4,3),(4,5),(0,5)}], dims:[底 7, 左 5, 顶 4, 右 3], notToScale:true}` | — | — | A rectilinear figure has straight sides that meet at square corners, like this L shape. | 直线图形的边都是直线，角都是直角，像这个 L 形。 |
| 2 | `walk` 逐边描，两条没标的边写 "?" | `walk` | `7 + 3 + ? + ? + 4 + 5` | Walk round it: there are 6 sides. Two of them have no length marked yet. | 沿边走一圈：一共 6 条边，有两条还没标长度。 |
| 3 ⚑ | 对边配对：顶 4 + "?" 对齐底 7；右 3 + "?" 对齐左 5 | `shade` | `4 + ? = 7 → 3 · 3 + ? = 5 → 2` | Find each missing side from the side opposite it. Across: 4 + ? = 7, so it is 3 cm. Up: 3 + ? = 5, so it is 2 cm. | 用对面的边求没标的边。横着看：4 + ? = 7，所以是 3 cm；竖着看：3 + ? = 5，所以是 2 cm。（`missing-side`） |
| 4 | 台阶"推出去"成 7 × 5 外框（虚线） | `morph` | `7 + 3 + 3 + 2 + 4 + 5 = 24 cm` | Altogether 24 cm. When a step is cut from a corner, the perimeter is the same as the rectangle around it: 2 × (7 + 5) = 24. | 一共 24 cm。从角上切掉一个台阶时，周长和外面那个长方形一样：2 × (7 + 5) = 24。 |

**要点**：① Find unmarked sides from the opposite sides. / 没标的边，用对面的边求。② Walk all the way round, every side once. / 走完一整圈，每条边算一次。

**题库（9）**：5 道 `input`（L 形、凹形，6–8 条边；错例 `missing-side`）；2 道 `trace-perimeter`（方格上的直线图形）；2 道 `choose`（哪条没标的边是 5 cm）。注：凹口在一条边中间的图形（U 形）周长**不等于**外框，题库至少一道 U 形，提示里不用"推出去"的捷径。

---

#### 第 06 步 `rectangle-area` · 长方形和正方形的面积（P3 1.4）

**概念**：长方形里的正方形排成阵列：几行、每行几个；面积 = 长 × 宽，正方形 = 边长 × 边长。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{unit:"cm", figures:[R(0,0,4,3)], tiles:{a:{rows:1}}}` → 逐行 | `tile` | `4 + 4 + 4 = 12` | Cover a 4 cm by 3 cm rectangle with 1 cm squares, one row at a time: 3 rows of 4. | 用 1 cm 的正方形一行一行地铺 4 cm × 3 cm 的长方形：3 行，每行 4 个。 |
| 2 | 铺满 + 行括号 | `tile` | `3 × 4 = 12 cm²` | That is an array: 3 rows of 4 is 3 × 4 = 12 squares. The area is 12 cm². | 这就是阵列：3 行、每行 4 个，3 × 4 = 12 个正方形。面积是 12 cm²。 |
| 3 | `show:"none"`，只留尺寸线 4 cm、3 cm | `morph` | `area = length × breadth` | Without the squares: the length tells you how many squares in each row, and the breadth tells you how many rows. Area = length × breadth. | 不画方格也一样：长是每行有几个，宽是有几行。面积 = 长 × 宽。 |
| 4 ⚑ | 同上 | — | `4 × 3 = 12 cm²` | Adding 4 + 3 gives 7, which counts no squares at all, and 14 is the perimeter. Multiply to find the area: 12 cm². | 4 + 3 = 7，一个正方形也没数到；14 是周长。求面积要相乘：12 cm²。（`sides-added-for-area`、`area-perimeter-swap`） |
| 5 | `figures:[R(0,0,5,5)], dims:[side 5 cm]` | `morph` | `5 × 5 = 25 cm²` | A square: side × side. 5 × 5 = 25 cm². | 正方形：边长 × 边长。5 × 5 = 25 cm²。 |

**要点**：① Area of a rectangle = length × breadth. / 长方形面积 = 长 × 宽。② Area of a square = side × side. / 正方形面积 = 边长 × 边长。③ Area is in square units: cm², m². / 面积用平方单位：cm²、m²。

**题库（10）**：5 道 `input`（`measure`；错例 `sides-added-for-area`、`area-perimeter-swap`、`unit-not-squared`）；2 道 `draw-rectangle`（画一个面积 18 cm² 的长方形：3 × 6、2 × 9、1 × 18 都对）；1 道 `count-squares`（只铺一行一列，再写面积）；2 道 `choose`。边长在乘法表内（≤ 12）。

---

#### 第 07 步 `same-area-different-perimeter` · 面积相同，周长不同（P3 1.1, 1.3, 1.4）

**概念**：同样 12 块正方形能拼成周长不同的长方形；越接近正方形，周长越短；周长相同，面积也可以不同。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{figures:[R(0,0,12,1)], tiles:12, walk:26}` | — | `area 12 · perimeter 26` | 12 square tiles in one long row: area 12 square units, perimeter 26 units. | 12 块方砖排成一长行：面积 12 平方单位，周长 26 单位。 |
| 2 | `R(0,0,6,2)` | `arrange` | `area 12 · perimeter 16` | The same 12 tiles as 2 rows of 6: the area is still 12, but the perimeter is now 16. | 同样 12 块排成 2 行、每行 6 块：面积还是 12，周长变成 16。 |
| 3 ⚑ | `R(0,0,4,3)` | `arrange` | `area 12 · perimeter 14` | 3 rows of 4: area 12, perimeter 14. Same area, three different perimeters. The closer to a square, the shorter the way round. | 3 行、每行 4 块：面积 12，周长 14。面积一样，周长有三种。越接近正方形，绕一圈越短。（`same-area-same-perimeter`） |
| 4 ⚑ | `pair:[R(0,0,7,1), R(0,0,4,4)]` | `morph` | `perimeter 16 · area 7 / 16` | It works the other way too. A 7 by 1 strip and a 4 by 4 square both have a perimeter of 16, but their areas are 7 and 16. | 反过来也一样：7 × 1 的长条和 4 × 4 的正方形，周长都是 16，面积一个是 7，一个是 16。 |

**要点**：① Shapes with the same area can have different perimeters. / 面积相同，周长可以不同。② Shapes with the same perimeter can have different areas. / 周长相同，面积也可以不同。

**题库（9）**：4 道 `draw-rectangle`（"画一个面积 12、周长 16 的长方形" → 2 × 6；错例 `"3x4"` → `same-area-same-perimeter`）；3 道 `choose`（哪个周长最长 / 哪两个面积相同）；2 道 `input`（同样 16 块拼成 4 × 4 和 2 × 8，周长各是多少）。

---

#### 第 08 步 `missing-side` · 已知面积或周长，求一条边（P4 1.1，D2）

**概念**：已知面积和长：几行这样的正方形才凑够面积（除）；已知周长和长：周长的一半是一个长加一个宽，再减去长。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{show:"none", figures:[R(0,0,6,4)], dims:[{side:"top",label:"6 cm"},{side:"left",unknown:true}], note:"24 cm²", notToScale:true}` | — | `6 × ? = 24` | A rectangle has an area of 24 cm² and a length of 6 cm. What is its breadth? | 一个长方形面积 24 cm²，长 6 cm。宽是多少？ |
| 2 | 浅方格逐行铺入（每行 6 个） | `tile` | `24 ÷ 6 = 4 cm` | Think in rows of 6 squares. How many rows make 24? 24 ÷ 6 = 4, so the breadth is 4 cm. | 按每行 6 个正方形来想：几行才有 24 个？24 ÷ 6 = 4，宽是 4 cm。 |
| 3 | 新图 `note:"perimeter 20 cm"`，`walk` 走半圈（一长一宽） | `walk` | `20 ÷ 2 = 10 cm` | Another rectangle has a perimeter of 20 cm and a length of 6 cm. Half the way round is one length and one breadth: 20 ÷ 2 = 10 cm. | 另一个长方形周长 20 cm，长 6 cm。走半圈正好是一条长加一条宽：20 ÷ 2 = 10 cm。 |
| 4 ⚑ | 同上，宽亮起 | `shade` | `10 − 6 = 4 cm` | So the breadth is 10 − 6 = 4 cm. Working out 20 − 6 = 14 gives the other three sides together, not one breadth. | 所以宽是 10 − 6 = 4 cm。用 20 − 6 = 14，算出的是另外三条边的和，不是一条宽。（`perimeter-not-halved`） |

**要点**：① Breadth = area ÷ length. / 宽 = 面积 ÷ 长。② Half the perimeter = length + breadth. / 周长的一半 = 长 + 宽。

**题库（10）**：6 道 `input`（3 道已知面积、3 道已知周长；错例 `perimeter-not-halved`、`area-perimeter-swap`）；2 道 `draw-rectangle`（画出长 5 cm、面积 20 cm² 的长方形）；2 道 `choose`。

---

#### 第 09 步 `square-side` · 求正方形的边长（P4 1.2，D2）

**概念**：已知周长：4 条边一样长，除以 4；已知面积：找乘它自己得这个面积的数。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{show:"none", figures:[R(0,0,5,5)], dims:[all "?"], note:"perimeter 20 cm"}` | — | `4 × ? = 20` | A square has a perimeter of 20 cm. Its four sides are equal. | 一个正方形周长 20 cm，四条边一样长。 |
| 2 ⚑ | 四条边逐条亮起 | `walk` | `20 ÷ 4 = 5 cm` | So each side is 20 ÷ 4 = 5 cm. Halving 20 gives 10, which is two sides, not one. | 所以每条边是 20 ÷ 4 = 5 cm。20 的一半是 10，那是两条边的长。（`side-from-total`） |
| 3 | 新图 `note:"area 36 cm²"`，方格隐约可见 | `morph` | `? × ? = 36` | Another square has an area of 36 cm². Which number times itself makes 36? | 另一个正方形面积 36 cm²。哪个数乘它自己得 36？ |
| 4 ⚑ | 方格上正方形 4 × 4 → 5 × 5 → 6 × 6 逐个长大 | `arrange` | `5 × 5 = 25 · 6 × 6 = 36 → 6 cm` | Try squares: 5 × 5 = 25, 6 × 6 = 36. The side is 6 cm. 36 ÷ 4 = 9 does not work: a 9 cm square has an area of 81 cm². | 一个个试：5 × 5 = 25，6 × 6 = 36，边长是 6 cm。36 ÷ 4 = 9 不对：边长 9 cm 的正方形面积是 81 cm²。（`side-from-total`） |

**要点**：① Side of a square = perimeter ÷ 4. / 正方形边长 = 周长 ÷ 4。② From the area, find the number that times itself gives the area. / 已知面积，找乘它自己得到面积的那个数。

**题库（9）**：5 道 `input`（边长 ≤ 12；错例 `side-from-total`（周长 ÷ 2、面积 ÷ 4、面积 ÷ 2））；2 道 `choose`；2 道 `draw-rectangle`（`square: true`，画面积 49 cm² 的正方形）。

---

#### 第 10 步 `composite-area` · 组合图形的面积（P4 1.3，D2）

**概念**：把组合图形切成几个长方形，分别求面积再加；或补成一个大长方形再减去缺的那块。

L 形房间：外框 8 m × 6 m，右上缺 3 m × 2 m，面积 42 m²。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{unit:"m", show:"none", figures:[L{(0,0),(8,0),(8,4),(5,4),(5,6),(0,6)}], dims:[底 8, 左 6, 顶 5, 右 4], notToScale:true}` | — | `area = ?` | The floor plan of an L-shaped room. It is not a rectangle, so length × breadth does not work straight away. | 一个 L 形房间的平面图。它不是长方形，不能直接用长 × 宽。 |
| 2 | `cuts:[{x:5}]`，两块微微分开 | `cut` | `5 × 6 + 3 × 4 = 30 + 12 = 42 m²` | Cut it into two rectangles: 5 m by 6 m and 3 m by 4 m. 30 + 12 = 42 m². | 切成两个长方形：5 m × 6 m 和 3 m × 4 m。30 + 12 = 42 m²。 |
| 3 | `cuts:[{y:4}]` | `cut` | `8 × 4 + 5 × 2 = 32 + 10 = 42 m²` | Cut it the other way and the pieces change, but the total stays the same: 32 + 10 = 42 m². | 换一种切法，两块变了，总面积不变：32 + 10 = 42 m²。 |
| 4 ⚑ | 补成 8 × 6 外框，缺角墨色斜线 | `cross` | `8 × 6 − 3 × 2 = 48 − 6 = 42 m²` | Or start from the whole 8 m by 6 m rectangle and take away the missing corner: 48 − 6 = 42 m². Pieces that overlap would be counted twice. | 也可以先算 8 m × 6 m 的大长方形，再减去缺的角：48 − 6 = 42 m²。两块重叠的话，重叠的部分就算了两次。（`overlap-counted`） |

**要点**：① Cut a composite figure into rectangles and add their areas. / 把组合图形切成长方形，面积相加。② Or take the missing piece away from a bigger rectangle. / 或者从大长方形里减去缺的那块。

**题库（10）**：4 道 `split-figure`（沿格线切一刀，再填两块的面积与总和；错例 `overlap-counted`（`"=71"` 一类：两块重叠））；4 道 `input`（先求没标的边，再求面积；错例 `missing-side`、`overlap-counted`（没减缺角））；2 道 `choose`（哪种切法对）。

---

#### 第 11 步 `composite-perimeter` · 组合图形的周长（P4 1.3，D2）

**概念**：拼在一起的边到了里面，不再是周长的一部分；组合图形的周长只走外面一圈。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `grid{show:"none", figures:[a:R(0,0,4,4) cold, b:R(6,0,4,4) hot], dims:[4 cm]}` | — | `16 cm · 16 cm` | Two squares with sides of 4 cm. Each has a perimeter of 16 cm. | 两个边长 4 cm 的正方形，周长各是 16 cm。 |
| 2 | b 推过来贴住 a：`R(0,0,8,4)`，接缝画虚线 | `arrange` | `perimeter = ?` | Push them together into one figure. The sides where they touch are now inside it. | 把它们推到一起，拼成一个图形。贴在一起的两条边到了里面。 |
| 3 ⚑ | `walk` 沿外圈 | `walk` | `8 + 4 + 8 + 4 = 24 cm` | Walk round the outside only: 24 cm, not 16 + 16 = 32. The two touching sides, 4 cm each, are no longer on the edge. | 只走外面一圈：24 cm，不是 16 + 16 = 32。贴在一起的两条 4 cm 的边，已经不在外面了。（`inner-edge-counted`） |
| 4 | 第 10 步的 L 形房间，六条边，两条先求出 | `walk` | `8 + 4 + 3 + 2 + 5 + 6 = 28 m` | The L-shaped room: find the missing sides first, then walk round all six. The perimeter is 28 m. | 再看 L 形房间：先求出没标的边，再把六条边走一圈。周长是 28 m。（`missing-side`） |

**要点**：① Only the outside edge counts. / 只算外面一圈。② Find missing sides first. / 先求出没标的边。

**题库（9）**：5 道 `input`（两三个长方形拼成的图形；错例 `inner-edge-counted`、`missing-side`）；2 道 `trace-perimeter`（方格上的拼合图形）；2 道 `choose`。

---

### 2.3 练习章 `practice`（8 道固定题；第 08–11 步的 3 道排在最后）

| # | 题型 | 题目（EN / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `count-squares` | Find the area of the shaded figure. / 求涂色图形的面积。（8 整格 + 2 半格） | 9 cm² | 10 → `half-squares` | 02 |
| Q2 | `trace-perimeter` | Trace the perimeter of the rectangle, then write it. / 描出长方形的周长，再写出来。（方格上 4 × 3） | 14 cm | `"=10"` → `border-squares`；`"=12"` → `area-perimeter-swap` | 03 |
| Q3 | `input`（`measure`） | A rectangle has a length of 7 cm and a breadth of 4 cm. What is its area? / 长方形长 7 cm、宽 4 cm，面积是多少？ | 28 cm² | 11 → `sides-added-for-area`；22 → `area-perimeter-swap`；`"28 cm"` → `unit-not-squared` | 06 |
| Q4 | `input` | Find the perimeter of the L-shaped figure. / 求 L 形的周长。（外框 9 × 6，右上缺 4 × 2；标出 9、6、5、4） | 30 cm | 24 → `missing-side` | 05 |
| Q5 | `draw-rectangle` | Draw a rectangle with an area of 12 cm² and a perimeter of 16 cm. / 画一个面积 12 cm²、周长 16 cm 的长方形。 | 2 × 6 | `"3x4"` → `same-area-same-perimeter` | 07 |
| Q6 | `input` | A rectangular garden has a perimeter of 30 m and a length of 9 m. What is its breadth? / 长方形花园周长 30 m，长 9 m，宽是多少？ | 6 m | 21 → `perimeter-not-halved` | 08 |
| Q7 | `choose` | A square has a perimeter of 28 cm. What is its area? / 正方形周长 28 cm，面积是多少？ | 49 cm² | 196 cm² → `side-from-total`；28 cm² → `area-perimeter-swap`；49 cm → `unit-not-squared` | 09 |
| Q8 | `split-figure` → `input` | Cut the floor plan into two rectangles, then find its area. / 把平面图切成两个长方形，再求面积。（外框 9 m × 7 m，右上缺 4 m × 3 m） | 51 m² | 71 → `overlap-counted`（两块重叠算两次）；63 → `overlap-counted`（没减缺角） | 10 |

6 种题型（count-squares、trace-perimeter、input、draw-rectangle、choose、split-figure）。

---

## 3. 引擎：A4 方格

### 3.0 用到的共用泛化（docs/19 §3.0）

G1（`Measure` 值）、G2（`measure`、`whole` 写法）、G3（AREA 卡）、G4（grid 的 PLATE 行：单位 · 格数 · 边数）、G5（量度域误解）、G6（`tile`、`walk`、`cut`、`cross`、`arrange`、`morph`）、G7（`{u:…}` 记号与 "square centimetres / 平方厘米" 读法）、G8–G12 全部。

### 3.1 A4a `grid`：模型

```json
{ "kind": "grid",
  "cols": 12, "rows": 8,                       // 格点范围（显示 ≤ 24 × 16；交互题 ≤ 12 × 10）
  "unit": "unit" | "cm" | "m",                 // 一格 = 1 单位 / 1 cm / 1 m
  "show": "cells" | "dots" | "none",           // 方格线 / 点阵（接 P1 1.4）/ 不画格（不按比例）
  "figures": [ { "id": "a",
                 "rect": [x, y, w, h] | "cells": [[x, y], …] | "poly": [[x, y], …],
                 "halves": [[x, y, "ne" | "nw" | "se" | "sw"], …],   // 半格三角形
                 "tone": "cold" | "hot" } ],
  "tiles": { "a": 12 } | { "a": { "rows": 1 } } | { "b": { "count": 3, "size": 2 } },   // 已铺的单位正方形
  "walk": { "a": 14 } | { "figure": "a", "edges": 9, "counter": true },               // 已走过的外圈段
  "dims": [ { "side": "top" | "left" | …, "figure": "a", "label": "5 cm" } | { "from": [x, y], "to": [x, y], "label": "?", "unknown": true } ],
  "cuts": [ { "x": 5 } | { "y": 4 } ],         // 沿格线的切线
  "pieces": "apart",                           // 切开后两块分开 6 px
  "crossed": "notch" | [[x, y], …],            // 墨色斜线（补全后减去的部分）
  "note": { "en": "area 24 cm²", "zh": "面积 24 cm²" },   // 图下方一行已知条件
  "legend": true | "1 m²",                     // 右下角图例：一个单位正方形 + "1 cm²"
  "notToScale": true,                          // 右下角 "Not drawn to scale / 未按比例画"
  "pair": [ {…}, {…} ] }                       // 两个图并排（第 07 步）
```

**画面**：方格线是发丝线（paper 上 ink 18 %，cinema 上 paper 22 %），每 5 格一条略重的线便于数；点阵是发丝小点。图形轮廓 1.5 px（cold / hot）；铺上的单位正方形 signal 填色，内留 1 px 缝（看得出是一块一块的）；走过的边 signal 2.5 px 粗线，走的过程有一个 signal 小圆点在动，旁边的计数器 1、2、3… 跟着跳；尺寸线按技术图版（延长线 + 箭头 + 居中数字，"?" 用 signal）；`show: "none"` 时图形按尺寸线的比例示意，不保证比例（`notToScale` 必须同时为 true，validate 检查）。

**交互规模**：手机（390 宽）上格子最小 22 px，点按区补到 44 px 的方式是"按行操作"（行首的 44 px 按钮一次铺满 / 清空一行）；交互题的格点 ≤ 12 × 10。

### 3.2 A4b 小测类型

| kind | 字段 | 孩子做什么 | 键盘 | 检查 | `sample` 写法 |
|---|---|---|---|---|---|
| `count-squares` | `{ figure, then: inputSpec(whole \| measure) }` | 点格子铺上单位正方形（或点行首按钮铺一行），半格点一下铺半块；计数器显示已铺几块，不显示目标；再写面积 | 方格是 roving-tabindex 网格（方向键移动、Enter 铺 / 撤），行首按钮 Tab 可达 | 铺满且不出界（不判分，只是脚手架；`then` 判对错） | `"=9"`、`"=9 cm2"` |
| `trace-perimeter` | `{ figure, then }` | 点外圈的每一小段（格边）；点里面的边也会亮（允许犯错），再点撤销；托盘 **Walk round / 走一圈** 按钮让小圆点沿已点的边走一遍，计数；再写周长 | 边是可聚焦的线段，方向键沿格线移动，Enter 选 | 选中的段 = 外圈全部段（`then` 写对周长） | `"edges:14"`、`"=10"` |
| `draw-rectangle` | `{ area?, perimeter?, length?, square?: true, accept: "any" \| "exact" }` | 左下角固定，拖右上角柄（吸附格点）画长方形；托盘里两个步进器（长、宽）做同样的事；尺寸线实时显示长、宽，不显示面积、周长 | 角柄 `role="slider"` 二维：←→ 长、↑↓ 宽 | 满足给定的面积 / 周长 / 长（`any`：任意满足的都对） | `"3x4"`（长 × 宽） |
| `split-figure` | `{ figure, then: inputSpec(sentence) }` | 点图形里的一条格线放切线（整条贯穿图形）；切出的两块分开并各自标尺寸；托盘里填 `? + ? = ?` | 切线游标沿格线移动，Enter 放 | 两块都是长方形；`then` 写对 | `"x:5"`；`"=30,12,42"` |

`input` 的 `measure` 写法：数字框 + 单位芯片（cm、cm²、m、m²，`radiogroup`）；`answer: "28 cm2"`；单位选错且数对 → `unit-not-squared`。

### 3.3 诊断规则（`lib/diagnose/measure.ts`）

给定图形的面积 `A`、周长 `P`、长 `l`、宽 `b`（或边 `s`），孩子答 `x`：

| code | 规则 |
|---|---|
| `unequal-units` | `choose` 专用 |
| `half-squares` | `x = 整格数 + 半格数`（半格当整格）或 `x = 整格数`（不数半格） |
| `unit-not-squared` | 数值对、单位是长度单位（面积题）或平方单位（周长题） |
| `area-perimeter-swap` | 面积题 `x = P`；周长题 `x = A`（`A ≠ P`） |
| `border-squares` | 周长题 `x` = 与外圈相邻的格子数（长方形为 `2l + 2b − 4`） |
| `two-sides-only` | `x = l + b` |
| `sides-added-for-area` | 面积题 `x = l + b` |
| `missing-side` | 直线图形周长 `x` = 只加标出长度的边 |
| `same-area-same-perimeter` | `draw-rectangle` 画出面积对、周长错的长方形；`choose` 选项 |
| `perimeter-not-halved` | `x = P − l` |
| `side-from-total` | 正方形：`x = P ÷ 2`、`x = A ÷ 4`、`x = A ÷ 2`；或（Q7 类）用这样的边算出的面积 |
| `overlap-counted` | 组合图形面积 `x = A + 重叠部分`（两个"自然"长方形：全高的左块与全宽的下块之和）或 `x = 外框面积`（没减缺角） |
| `inner-edge-counted` | 组合图形周长 `x = 各块周长之和` |

单测：`tests/math-scene/grid.test.ts`（面积、周长、外圈段集合、半格、切开后两块、U 形与 L 形的周长）、`diagnose-measure.test.ts`（每条两个正例一个反例）。

### 3.4 校验

`validate.ts`：图形在格点范围内、不自交；`poly` 是直线图形（边都水平或竖直）；`halves` 成对（总面积为整数，课纲 P3 只数整格与半格）；`show: "none"` 必须 `notToScale: true`；`dims` 的数与图形一致（按比例的图）；`limits`（如第 06 步 `{ "maxSide": 12 }`、第 10–11 步 `{ "maxSide": 20 }`）；面积单位不在 cm² / m² 之间换算（D7）。

---

## 4. 名词表（`glossary.json`，14 个）

| id | EN | ZH | 定义要点 |
|---|---|---|---|
| `area` | area | 面积 | 图形盖住的面有多大，用单位正方形去数。 |
| `perimeter` | perimeter | 周长 | 沿图形的边走一圈的长度。 |
| `square-unit` | square unit | 平方单位 | 一个单位正方形的面积；方格上数面积的单位。 |
| `square-centimetre` | square centimetre (cm²) | 平方厘米（cm²） | 边长 1 cm 的正方形的面积。 |
| `square-metre` | square metre (m²) | 平方米（m²） | 边长 1 m 的正方形的面积；量地面、墙面。 |
| `unit-square` | unit square | 单位正方形 | 边长是 1 个单位的正方形。 |
| `length-breadth` | length, breadth | 长、宽 | 长方形较长的边叫长，较短的叫宽。面积 = 长 × 宽。 |
| `side` | side | 边、边长 | 图形的一条直边；正方形四条边一样长。 |
| `rectangle` | rectangle | 长方形 | 四个角都是直角、对边一样长的四边形。 |
| `square` | square | 正方形 | 四条边一样长、四个角都是直角的四边形。 |
| `rectilinear-figure` | rectilinear figure | 直线图形 | 边都是直线、角都是直角的图形，比如 L 形。 |
| `composite-figure` | composite figure | 组合图形 | 由几个长方形、正方形拼成的图形。 |
| `not-to-scale` | not drawn to scale | 未按比例画 | 图上的长短只是示意，要用标出的数来算。 |
| `grid` | square grid | 方格 | 画满同样大正方形的纸或图，用来数面积和周长。 |

---

## 5. 来源（访问日期 2026-10-13）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (2021 P1 cohort; Updated Oct 2025). https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 课纲原文第 32、34、36、39、42 页 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | TIMSS 2015 Encyclopedia · Singapore (mathematics curriculum). https://timssandpirls.bc.edu/timss2015/encyclopedia/countries/singapore/the-mathematics-curriculum-in-primary-and-lower-secondary-grades/ | CPA |
| S4 | Battista, M. T., Clements, D. H., Arnoff, J., Battista, K., & Van Auken Borrow, C. (1998). Students' spatial structuring of 2D arrays of squares. *JRME*, 29(5), 503–532 | 方格的行列结构；数边与数格 |
| S5 | Outhred, L. N., & Mitchelmore, M. C. (2000). Young children's intuitive understanding of rectangular area measurement. *JRME*, 31(2), 144–167 | 铺满、单位一致、行列结构的发展 |
| S6 | Kamii, C., & Kysh, J. (2006). The difficulty of "length × width": Is a square the unit of measurement? *Journal of Mathematical Behavior*, 25(2), 105–115 | 面积公式的意义；长宽相加 |
| S7 | Ma, L. (1999). *Knowing and Teaching Elementary Mathematics*. Mahwah, NJ: Lawrence Erlbaum. 第 4 章（周长与面积的关系） | "周长大面积就大"的说法与反例 |
| S8 | Zacharos, K. (2006). Prevailing educational practices for area measurement and students' failure in measuring areas. *Journal of Mathematical Behavior*, 25(3), 224–239 | 只背公式时面积与周长混淆 |
| S9 | Common Core Standards Writing Team (2012). *Progressions for the Common Core State Standards in Mathematics: K–5, Geometric Measurement*. Tucson: Institute for Mathematics and Education, University of Arizona（URL 施工时从 https://www.math.arizona.edu/~ime/progressions/ 取，**待核**） | 面积作为铺满、周长作为长度、直线图形与组合图形的教学顺序与常见错误 |
| S10 | Clements, D. H., & Sarama, J. (2014). *Learning and Teaching Early Math: The Learning Trajectories Approach* (2nd ed.). New York: Routledge. 长度与面积的学习轨迹两章 | 单位迭代、半格、单位一致 |
| S11 | Baturo, A., & Nason, R. (1996). Student teachers' subject matter knowledge within the domain of area measurement. *Educational Studies in Mathematics*, 31(3), 235–268 | 组合图形、面积守恒与切拼 |
| S12 | Dickson, L. (1989). Area of a rectangle. In D. C. Johnson (Ed.), *Children's Mathematical Frameworks 8–13: A Study of Classroom Teaching* (pp. 89–125). Windsor: NFER-Nelson | 长方形面积、单位、边界格子的错误（**待核**页码） |
| S13 | Moyer, P. S. (2001). Using representations to explore perimeter and area. *Teaching Children Mathematics*, 8(1), 52–59（**待核**） | 同面积不同周长的活动 |
| S14 | 教材系列（只作顺序参考）：Marshall Cavendish *My Pals Are Here! Maths* P3–P4 面积与周长章；*Shaping Maths*。MOE 批准教材目录 https://www.moe.gov.sg/education-in-sg/approved-textbook-list | D6 length / breadth（**待核**）、"Not drawn to scale"、课步顺序 |

---

## 6. 图像清单（给 Codex）

风格同 docs/19 §6（`STYLE_BRIEF`；首页 1:1，章节配图 4:3）。

### 6.1 首页图：**新画**（roadmap 里没有本课的图）

`area-perimeter`，一条 prompt：

> SUBJECT: a rectangular floor being tiled, seen from above at a gentle three-quarter angle: the left part of the floor already covered with identical square tiles laid in neat rows and columns, the right part still bare, a short stack of loose square tiles beside it, and a plain wooden folding rule laid along two edges of the floor so that it bends round one corner; drawn as a specimen plate, no people, no numbers or markings on the rule

（铺砖 = 面积，量尺沿边拐角 = 周长；尺上不要刻度数字，免得出字。）生成：`pnpm tsx scripts/illustrate.ts gen area-perimeter "<SUBJECT>"`。

### 6.2 章节配图（可选，2 张）

| id | 章 | 用途 | SUBJECT（英文，原样交给 Codex） |
|---|---|---|---|
| `figures/ap-garden-fence` | 03 `what-is-perimeter` | 周长与面积在生活里的区别：围栏量的是一圈，泥土量的是一块面 | a small community garden plot in a Singapore HDB estate seen from above at a slight angle: a rectangular raised bed edged by a low wooden fence, a gardener's string line stretched taut round the fence posts, leafy vegetables planted in neat rows inside, a watering can on the path beside it, HDB blocks faint in the background; drawn as a specimen plate, no people, no text |
| `figures/ap-hdb-floor-plan` | 10 `composite-area` | 组合图形在生活里：户型图的客厅、卧室是几个长方形拼成的 | an architect's floor plan of a Singapore HDB flat drawn in plan view: walls as thick double lines, an L-shaped living and dining area, two rectangular bedrooms, a kitchen and a bathroom, doors drawn as quarter-circle swings, square floor tiles lightly drawn in the living area only; drawn as an architectural plate, no text, no dimensions, no furniture labels |

---

## 7. 施工顺序与分工

同 docs/19 §7，本课的差别：

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | §0 定稿（D2、D6 先核实）；建 `src/content/topics/area-perimeter/{chapters,data}`、`topic.yaml`（`illustration: area-perimeter`） | `topic.yaml` | — | S |
| 1 | E3（Opus） | A4 `grid`、`count-squares` / `trace-perimeter` / `draw-rectangle` / `split-figure`、`measure` 写法、量度域诊断、`{u}` 记号与读法、单测、docs/06；顺带接 docs/19 第 12 步的面积模型 | `stage/GridModel.tsx`、`tray/inputs/Measure*.tsx`、`lib/{geometry.ts,diagnose/measure.ts}`、`tests/math-scene/{grid,diagnose-measure}.test.ts` | docs/19 E0（G1–G12） | M |
| 2 | L（Opus） | `lesson.json`：`syllabus`（P1–P4）、11 步 × 4–5 拍（45 拍）、`keyFacts`、`limits`、每步 1–2 道样板题、练习 8 题；`pnpm shoot area-perimeter --beats` | `data/lesson.json` | 1 | M |
| 3 | Codex | 题库其余约 85 道（brief：量度域 code、`grid` 写法、"U 形不能推出去"）；11 章英文初稿 | `scripts/math/drafts/` | 2 | M |
| 4 | T（Opus） | 合并题库、定稿英文、**写中文正文**（"铺 / 走"两个动词全课一致）、名词表、来源 | `data/*`、`chapters/*` | 3 | M |
| 4′ | 主会话 + Codex | 首页图 `gen`、2 张配图 | `public/illustrations/**` | 0 | S |
| 5 | P（Sonnet） | QA 同 docs/19；e2e 另加：手机上按行铺、纯键盘沿格线描周长、拖角柄画长方形（尺寸线跟着变、不泄露面积）、切线贯穿、灰度截图里"铺的面"和"走的线"分得开 | `tests-e2e/area-perimeter.spec.ts`、`docs/screenshots/area-perimeter/` | 4 | M |
| 6 | 主会话 | 验收、提交 | — | 5 | S |

估算：A4 约 1 天；内容约 2 天。

---

## 8. 验收

照 skill `references/acceptance.md` 全部打勾，另加：

- [ ] UI 不出现年级（同 docs/19 §8 第一条）；第 08–11 步章头只有 "Going further / 再往前一步"
- [ ] 每个图形的面积、周长由 `lib/geometry.ts` 算出，拍的算式与字幕里的数和它一致（validate）；L 形"推出去"的说法只出现在角上缺口的图上，U 形题的提示不用它
- [ ] 不按比例的图都带 "Not drawn to scale / 未按比例画"；方格图按比例
- [ ] 没有 cm² ↔ m² 换算的题；面积答案的单位都是平方单位
- [ ] 灰度截图能分辨：铺的单位正方形（面）、走过的边（粗线）、给定轮廓、拿走的角（斜线）
- [ ] 手机 390 × 844：每道 `count-squares` 能用"按行"按钮做完；每道题能纯键盘做完
- [ ] §2.1 每个 code 有 ⚑ 拍、有能诊断它的题
- [ ] 截图：第 01、06、10 章 + 练习章与一道小测，三种尺寸（paper；外加 cinema、zh 各一张）

## 9. 施工记录 / 已知差距

施工时追加。
