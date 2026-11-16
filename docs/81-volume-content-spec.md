# 81 · 体积 · 内容 spec（`volume`，MathScene 课；v1 草案，待 Gavin 定稿）

docs/17 §2.5 的 `volume` 一行（"一层一层摆单位立方体；水箱灌水的高度"，依赖 §7 **A8 MathScene 里的 3D**）。2026-11-16 起草，**只出 spec，不施工、不建目录、不提交**。照 skill `.claude/skills/atlas-lesson-topic/`（SKILL.md + `references/` 全部）写；布局与密度照 docs/76–79；3D 画法复用 docs/39（展开图与立体）的 A8 投影（`lib/project.ts`），D2 已写明"同一个投影以后给 `volume` 用"。

记号同 docs/76：EN 字幕与题目是**口吻草稿**，施工时 Codex 起草英文全文、Claude 逐句核对；ZH 是 Claude 草稿，施工时 Claude 独立定稿。S1 = MOE *Mathematics Syllabus Primary One to Six*（2021 P1 cohort，页脚 "Updated: Oct 2025"），起草时用 `pdftotext -layout` 从本机临时目录里的 PDF 逐页抄录（806 004 字节，sha256 `e8f77fe1…ae70e1`，与 docs/76–79 §10 同一份，不进仓库），页码是页脚 "Page | N"。

---

## 0. 决定

| # | 决定 | 建议 |
|---|---|---|
| D1 | **对象**：Measurement and Geometry · SUB-STRAND: AREA AND VOLUME · **P5「2. Volume of Cube and Cuboid」2.1–2.6 全部**（第 01–06 步）；地基 P2 / P3 Measurement（ℓ、ml 与换算）、P3 面积（cm²、m²）、P4 Nets（正方体、长方体）；P6 的 2.1–2.5（已知体积求一边、³√）**不在本课**（§0.1 Q1） | 同意 |
| D2 | **课的形状**同分数改版后：每章 4–5 拍 + 章末一道随机小测（题库 9–10 道）；练习章 8 道固定题；背景章 00 | 同意 |
| D3 | **UI 不出现年级**；本课全是 P5，不标 bridge | 同意 |
| D4 | **3D 怎么画**：MathScene 现在能画 3D——A8 `net`（docs/39）在 SVG 里用正投影画折好的正方体 / 长方体（`view: iso` 是真等轴测：偏航 45°、俯角 35.264°，和等距点格纸对得上），有 `dims`、`turn`，**但没有一块块的单位立方体、没有分层、没有水**。本课加**一个**新模型 `cubes`（E-VO1）：单位立方体堆、整块长方体（带或不带接缝）、玻璃水箱与水，全部复用 `lib/project.ts` 的相机、`fitIn` 与转向；**不引 three.js，不加依赖** | 同意 |
| D5 | **新小测两种**（§0.1 Q3 可减）：`build-cubes`（在底面图上点格子叠方块，2.1 "building"）、`draw-iso`（在等距点格纸上连点补全正方体 / 长方体，2.3 "drawing"）。其余用 `input`（`whole`、`measure` 的单位芯片、`decimal`、`compound`）与 `choose` | 同意 |
| D6 | **新误解域 `volume`**，10 个码 + 共用 `unit-factor-wrong`（小数域）（§2.1） | 同意 |
| D7 | **顺序与课纲不同一处**：2.6（ℓ / ml 与 cm³）放在 2.5（水箱里的水）**之前**（第 05、06 步），因为水箱题的答案常要写成升 | 同意 |
| D8 | **数字**：单位立方体堆 ≤ 60 块（交互的 ≤ 5 × 4 × 4）；长方体边长是整数（cm 或 m），三边**同一个单位**（§0.1 Q4）；水箱各边 ≤ 100 cm，水的体积换成升是整数或一位小数；**不做 cm³ ↔ m³ 的换算**（课纲 2.2 原文明确排除） | 同意 |
| D9 | **情境**：积木、方糖盒、文具盒、牛奶盒、组屋家里的鱼缸、学校的蓄水箱、搬家的纸箱；无品牌；人名多族群 | 同意 |
| D10 | **步数**：6 个课步 + 练习 + 00。拍 26 个 ≈ 9 min，小测 6 道 ≈ 4 min，练习 8 道 ≈ 5.5 min：**约 19 分钟** | 同意 |
| D11 | **图**：封面 + 2 张配图（§6）；`art/planned/volume/` 三张候选里，分层图的方块排布前后对不上，改代码画；封面与水箱图按检查复核 | 同意 |

### 0.1 需要 Gavin 看的（每条有默认值，默认已写进全文）

| # | 问题 | 选项 | 默认 |
|---|---|---|---|
| Q1 | **P6 的体积**（S1 第 44 页 2.1–2.5：已知体积求一边、求正方体棱长、已知底面积求高、求一个面的面积、√ 与 ³√ 记号）现在做不做 | (a) 不做，2030 年加 2 步（docs/17 §2.6）；(b) 现在加两个桥步 | **(a)**：同 docs/80 Q1；`cubes` 模型那时直接复用 |
| Q2 | **等距方格怎么用** | (a) 孩子只补全**长方体 / 正方体**（只画棱，不画块与块的接缝）；单位立方体堆只由舞台画、用来数；(b) 也补全 L 形等单位立方体堆 | **(a)**：课纲 2.3 原文是 "drawing cubes and cuboids on isometric grid"；(b) 在 390 px 手机上点不准（**待核**课本是否要画 L 形堆） |
| Q3 | **两种新小测是否都做** | (a) 都做（`build-cubes` + `draw-iso`）；(b) 只做 `draw-iso`，"搭"改成 `choose`（哪一个是 12 块搭成的长方体）；(c) 都不做，全用 `choose` | **(a)**：2.1 是 "building"、2.3 是 "drawing"，课纲的动词是动手；两个都小（§3.2、§3.3），`build-cubes` 若工期紧可先降为 (b) |
| Q4 | **三边单位不同**（2 m × 50 cm × 40 cm）出不出 | (a) 不出；三边总是同一单位；(b) 出 2 道，先把 m 化成 cm | **(a)**：课纲排除 cm³ ↔ m³，混单位题极易滑到那里；(b) 留给 P6 |
| Q5 | **中文"体积"和"容量 / 容积"** | (a) 立体占的空间叫"体积"；水箱里水的多少也叫"水的体积"；"容量"只在第 05 步说"量液体时也说容量"（接 `measuring` 主题的名词表）；不引"容积"；(b) 水箱装满时的量叫"容积"（大陆课本） | **(a)**：MOE 英文全用 volume；`measuring` 名词表已写"以后学正方体、长方体时，同一个量叫体积"（新加坡华文**待核**） |
| Q6 | **"isometric grid"的中文** | 等距点格纸 / 等距方格纸 / 等轴测网格 | **等距点格纸**（屏幕上画的是点阵；**待核**新加坡华文） |
| Q7 | **1 m³ 有多大**怎么讲 | (a) 一拍：1 m 的立方体旁边画一张课桌高度的发丝线（只用几何，不画人）；(b) 只说"一个大纸箱那么大" | **(a)**：MathScene 不画人物（docs/08）；用学过的长度对照 |

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字）

| 级 | 子线 · 条目 | 课纲原文（S1） | 页 | 本课 |
|---|---|---|---|---|
| P2（地基） | Measurement · 1. Length, Mass and Volume | "1.1 measuring … volume of liquid in litres" · "1.2 using appropriate units of measurement and their abbreviations m, g, kg, ℓ" | 34 | 第 05 步（升） |
| P3（地基） | Measurement · 1. Length, Mass and Volume | "1.1 measuring … volume of liquid in millilitres (ml)" · "1.3 converting a measurement in compound units to the smaller unit, and vice versa … litres and millilitres" | 36 | 第 05 步（ℓ ↔ ml） |
| P3（地基） | Area and Volume · 1. Area and Perimeter | （平方单位 cm²、m²；见 docs/21 §1.1） | 36 | 第 02 步 ⚑ 拍（平面 vs 立体） |
| P4（地基） | Geometry · 4. Nets | "4.1 identifying 2D representations of · cube · cuboid …" | 39 | 第 03 步（立体的平面画法） |
| P5（地基） | Decimals · 1. Four Operations | "1.2 converting a measurement from a smaller unit to a larger unit in decimal form, and vice versa … litres and millilitres" | 41 | 第 05、06 步（2500 ml = 2.5 ℓ） |
| **P5** | Area and Volume · 2. Volume of Cube and Cuboid | "2.1 building solids with unit cubes" · "2.2 measuring volume in cubic units, cm3/m3, excluding conversion between cm3and m3" · "2.3 drawing cubes and cuboids on isometric grid" · "2.4 volume of a cube/cuboid" · "2.5 finding the volume of liquid in a rectangular tank" · "2.6 relationship between ℓ (or ml) with cm3" | 42 | 第 01–06 步 |
| P6（不在本课） | Area and Volume · 2. Volume of Cube and Cuboid | "2.1 finding one dimension of a cuboid given its volume and the other dimensions" · "2.2 finding the length of one edge of a cube given its volume" · "2.3 finding the height of a cuboid given its volume and base area" · "2.4 finding the area of a face of a cuboid given its volume and one dimension" · "2.5 use of √ and ∛"（符号在 `pdftotext` 里丢失，**施工时看第 44 页原图**） | 44 | Q1 |

核对要点：
- PDF 里 "cm3" 是上标丢失后的写法，界面一律写 cm³、m³。2.2 原文排除 cm³ ↔ m³ 的换算（D8）。
- 2.5 只说"求长方体水箱里液体的体积"：已知水深求水的体积、还要多少水才满、几分之几满。**"倒进多少水、水面升多高"是已知体积求高，属于 P6 2.1 / 2.3**，不在本课。
- 2.6 原文 "relationship between ℓ (or ml) with cm3"：1 ml = 1 cm³、1 ℓ = 1000 cm³。

### 1.2 级别、步数与时间

- 6 个课步 + 练习 + 00；全部 P5。
- 拍 26 个（≈ 9 min），小测 6 道（≈ 4 min），练习 8 道（≈ 5.5 min）：**约 19 分钟**。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字（`limits`） |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | cubes（标本） | — | — | — |
| 01 | `unit-cubes` | Building with unit cubes | 用单位立方体搭 | 2.1 | cubes（`cells`、`apart`） | 4 | 9 · build-cubes / input / choose | ≤ 24 块 |
| 02 | `cubic-units` | Cubic units: cm³ and m³ | 体积单位：cm³ 和 m³ | 2.2 · P3 面积 | cubes（`dims`）· grid（对照） | 4 | 9 · input(measure) / choose | ≤ 36 块 |
| 03 | `isometric-drawing` | Drawing on isometric grid | 在等距点格纸上画 | 2.3 · P4 Nets 4.1 | cubes（`paper: iso`） | 4 | 9 · draw-iso / choose | 边长 ≤ 4 |
| 04 | `cuboid-volume` | Volume of a cuboid and a cube | 长方体和正方体的体积 | 2.4 | cubes（`layers`、`seams`） | 5 | 10 · input / build-cubes / choose | 边长 ≤ 20；体积 ≤ 8000 |
| 05 | `litres-and-cubic-centimetres` | Litres, millilitres and cm³ | 升、毫升和立方厘米 | 2.6 · P3 Meas 1.3 · P5 Dec 1.2 | cubes（`tank`）· instrument(jug) | 4 | 9 · input(decimal / compound / whole) / choose | ≤ 20 000 cm³ |
| 06 | `water-in-a-tank` | Water in a rectangular tank | 长方体水箱里的水 | 2.5 | cubes（`tank`、`pour`） | 5 | 10 · input / choose | 各边 ≤ 100 cm；水 ≤ 200 ℓ |
| 07 | `practice` | Practice | 练习 | — | 按题 | — | 8 道固定题 | — |

### 1.4 不在本课

- P6：已知体积求一边、棱长、高、面积；√、³√（Q1）。
- 倒水后水面升高、放入石头后水面上升（已知体积求高，P6）。
- cm³ ↔ m³ 换算（课纲排除）；三边不同单位（Q4）。
- 组合立体的体积（课纲 P5 没有）；表面积（课纲没有）。
- 圆柱等其他立体的体积（中学）。

### 1.5 和别的主题怎么接（不重复讲）

| 主题 | 接在哪 | 本课怎么用 | 不在本课重复的 |
|---|---|---|---|
| `nets-and-solids`（docs/39） | A8 投影（`lib/project.ts`）、正方体 / 长方体、面、棱 | `cubes` 用同一个相机与等轴测；第 03 步第 1 拍说"学展开图时见过正方体从这个角度看的样子" | 面、棱、展开图 |
| `area-perimeter`（docs/21） | cm²、m²；长 × 宽；方格 | 第 04 步第 1 拍"一层的块数 = 长 × 宽"直接用面积的排列；第 02 步 ⚑ 拍对照 cm² 与 cm³ | 面积 |
| `measuring`（docs/32） | ℓ、ml、量杯（`instrument` 的 `jug`）、`compound` 作答框；名词表"容量" | 第 05 步一拍把 1 ℓ 倒进 10 cm 的空心正方体；`compound` 框（2 ℓ 500 ml） | 读量杯 |
| `decimals`（docs/29） | 第 15 步"用小数表示量"（2500 ml = 2.5 ℓ） | 第 05 步第 3 拍引用 | 小数换算的道理 |
| `multiplication-division` | 乘法交换、三个数连乘 | 第 04 步"先乘哪两个都一样"一句 | 乘法 |
| `fractions` | 几分之几满 | 第 06 步第 5 拍 "{3/4} full" | 分数 |

---

## 2. 课的设计

### 2.0 写法约定

- **固定说法**：
  - EN "Volume is the amount of space a solid takes up." / ZH "体积是一个立体占的空间有多大。"
  - EN "Count the cubes in one layer, then count the layers." / ZH "先数一层有几块，再数有几层。"
  - EN "Volume = length × breadth × height." / ZH "体积 = 长 × 宽 × 高。"
  - EN "1 cm³ holds 1 ml. 1000 cm³ holds 1 ℓ." / ZH "1 cm³ 装得下 1 ml。1000 cm³ 装得下 1 ℓ。"
  - EN "Use the height of the water, not the height of the tank." / ZH "用水的高度，不是水箱的高度。"
- **读法**：体积写 `{u:36 cm3}`（显示 36 cm³，朗读 "thirty-six cubic centimetres" / "36 立方厘米"；E-VO4）；升沿用 `{u:2.5 l}`。
- **颜色**：给定的块 / 长方体 = cold；新加上的一层、孩子搭的块、水 = signal（水是淡 signal 填色 + 水面一条实线）；第二个量（被挡住的块、空的部分）= hot 虚线；拿走的 = 墨色斜线；答案 = 墨色虚线。看不见的棱：墨色虚线（技术图版的隐藏线）。不用红绿。
- **算式**：`4 × 3 = 12`、`12 × 3 = 36`、`4 × 3 × 3 = {u:36 cm3}`、`{u:1000 cm3} = {u:1 l}`；对错只用文字和 ✓ / ○。

### 2.1 误解目录（新域 `volume`，§3.4 写诊断规则）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `visible-only` | 只数看得见的方块，漏掉被挡住的 | 3 × 2 × 2 的堆说 10 块 | "Some cubes are hidden behind and under the others. Count layer by layer: 6 on top and 6 underneath." / "有的方块被挡在后面、压在下面。一层一层地数：上层 6 块，下层 6 块。" | S5、S6（**待核**页） |
| `faces-counted` | 数看得见的正方形面，不数方块 | 2 × 2 × 2 的正方体说 12 | "You counted the squares you can see: 4 on top, 4 in front, 4 on the side. Each cube shows up to 3 of them. Count cubes, not faces." / "你数的是看得见的小正方形：上面 4 个、前面 4 个、侧面 4 个。一个方块最多露出 3 个面。要数方块，不是数面。" | S5、S6 |
| `dimensions-added` | 长、宽、高相加 | 4 × 3 × 2 的长方体写 9 cm³ | "Adding 4 + 3 + 2 gives the lengths of three edges, not the space inside. One layer has 4 × 3 cubes, and there are 2 layers." / "4 + 3 + 2 只是三条棱的长度，不是里面的空间。一层有 4 × 3 块，一共 2 层。" | S5 |
| `one-layer-only` | 只算一层（长 × 宽），忘了乘高 | 4 × 3 × 5 写 12 | "12 is one layer. The cuboid is 5 layers tall." / "12 是一层的块数。这个长方体有 5 层高。" | S6 |
| `edge-times-three` | 正方体的体积写成棱长 × 3 | 棱长 5 cm 写 15 cm³ | "5 × 3 adds three edges. A cube's volume is 5 × 5 × 5 = 125 cm³." / "5 × 3 是三条棱加起来。正方体的体积是 5 × 5 × 5 = 125 cm³。" | 本课提出的诊断 |
| `square-units` | 体积写成平方单位（或长度单位） | 36 cm² | "cm² measures a flat surface. Space is measured in cubes: cm³." / "cm² 量的是一个平面。空间要用小方块量：cm³。" | 本课提出的诊断 |
| `tank-height-used` | 求水的体积时用了水箱的高 | 水深 10 cm、箱高 25 cm，用 25 | "The water is only 10 cm deep. The water is a cuboid 30 cm by 20 cm by 10 cm." / "水只有 10 cm 深。水是一个长 30 cm、宽 20 cm、高 10 cm 的长方体。" | 本课提出的诊断 |
| `filled-not-empty` | 问"还要倒多少水才满"，答的是已有的水 | 答 6000 cm³（已有的水） | "6000 cm³ is the water already in the tank. The empty part above it is 30 × 20 × 15." / "6000 cm³ 是箱里已经有的水。要倒满的是上面空的部分：30 × 20 × 15。" | 本课提出的诊断 |
| `edge-length-wrong` | 在等距点格纸上画的棱长差了一格 | 3 长的棱画成 2 格或 4 格 | "This edge should be 3 units long: count 3 spaces between dots, not 3 dots." / "这条棱长 3，要数 3 个点间隔，不是数 3 个点。" | S7（**待核**） |
| `hidden-edge-drawn` | 把看不见的棱也画成实线 | 立方体画出"透视框"的 12 条棱 | "From this side you cannot see these three edges, so they are not drawn." / "从这边看不到这三条棱，所以不画。" | S7 |

**共用码**：`unit-factor-wrong`（小数域：换算时用错了进率，1 ℓ = 100 cm³、2.5 ℓ = 250 cm³）。

"来源"列的研究文献页码都未核（docs/76 §10 的规则）：不进 `sources.json`，误解目录是本课自己的诊断设计。每个码至少一拍 ⚑、至少一道题能诊断。

### 2.2 逐步设计

简写（§3.1）：`C{…}` = `cubes`；`size:[l,b,h]` = 整块长方体（x 向右前、y 向左前、z 向上；等轴测）；`cells` = 单个方块的列表；`apart` = 分层拉开；`seams:false` = 不画块与块的接缝；`T{…}` = `tank`；`paper:iso` = 等距点格纸；`dims` = 边上的尺寸标注。

---

#### 第 01 步 `unit-cubes` · 用单位立方体搭（P5 2.1）

**概念**：棱长都是 1 的正方体叫单位立方体；用几块单位立方体搭成的立体，体积就是几个单位立方体，不管搭成什么形状；数的时候被挡住的也要算。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `C{cells:[一块]}` → 6 块排成一排 | — | `1 unit cube` | This is a unit cube: every edge is 1 unit long. Put 6 of them in a row and you have built a solid. | 这是一个单位立方体：每条棱长都是 1。把 6 块排成一排，就搭成了一个立体。 |
| 2 | `set:[6 块一排, 3 × 2 × 1, L 形 6 块]` | `morph` | `6 · 6 · 6` | Rebuild the same 6 cubes in other ways. Each solid takes up the space of 6 unit cubes: they have the same volume. | 同样 6 块换几种搭法。每个立体都占 6 个单位立方体的空间：它们的体积一样。 |
| 3 | `C{size:[2,2,2], apart}`（上下两层拉开） | `split` | `4 + 4 = 8` | Here are 8 cubes in a bigger cube. Lift the top layer: 4 on top and 4 underneath, 8 in all. | 这个大正方体里有 8 块。把上面一层抬起来：上层 4 块，下层 4 块，一共 8 块。 |
| 4 ⚑ | `C{size:[3,2,2]}`，看得见的 10 块 cold；`apart` 后下层后排 2 块 hot 虚线 | `split` | `10 + 2 = 12` | From the front you see only 10 cubes. Lift the top layer and 2 more appear at the back. The solid has 12 unit cubes. | 从前面看只能看到 10 块。把上层抬起来，后面还有 2 块。这个立体是 12 个单位立方体。（`visible-only`） |

**要点**：① A unit cube has edges 1 unit long. / 单位立方体的棱长是 1。② Solids made of the same number of unit cubes have the same volume. / 同样多块单位立方体搭成的立体，体积相同。③ Count hidden cubes too. / 看不见的也要数。

**题库（9）**：3 道 `build-cubes`（用 8 块搭一个长方体；搭 3 × 2 × 2；搭一个 2 层高、一共 12 块的长方体）；3 道 `input`（数块数：3 × 2 × 2 → 12，错例 10 → `visible-only`、16（看得见的面 6 + 6 + 4）→ `faces-counted`；2 × 2 × 2 → 8，错例 12 → `faces-counted`、7 → `visible-only`；L 形 7 块）；3 道 `choose`（哪两个体积一样；哪一个用了 10 块；"看不见的有几块"）。数字：`visible-only` 与 `faces-counted` 的错例值互不相同（validate 由几何算出两者）。

---

#### 第 02 步 `cubic-units` · 体积单位：cm³ 和 m³（P5 2.2）

**概念**：棱长 1 cm 的正方体，体积是 1 立方厘米（1 cm³）；棱长 1 m 的正方体是 1 立方米（1 m³）；量体积就是数里面有多少个这样的立方体；平面用平方单位，空间用立方单位。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `C{cells:[一块], dims:"1 cm"}`（三条棱都标 1 cm） | — | `{u:1 cm3}` | A cube with edges of 1 cm has a volume of 1 cubic centimetre, written 1 cm³. It is about the size of a sugar cube. | 棱长 1 cm 的正方体，体积是 1 立方厘米，写作 1 cm³，大约一块方糖那么大。 |
| 2 | `C{size:[4,3,1]}` 每块 1 cm | `morph` | `12 cubes → {u:12 cm3}` | This solid is made of 12 of those cubes, so its volume is 12 cm³. | 这个立体由 12 块这样的小正方体组成，体积是 12 cm³。 |
| 3 | `C{cells:[一块], dims:"1 m", ruler:"desk"}`（旁边一条 75 cm 高的发丝线，Q7） | `morph` | `{u:1 m3}` | A cube with edges of 1 m has a volume of 1 cubic metre, 1 m³: taller than a school desk. Big things, like a room or a water tank, are measured in m³. | 棱长 1 m 的正方体，体积是 1 立方米，写作 1 m³，比课桌还高。房间、蓄水箱这样的大东西用 m³ 量。 |
| 4 ⚑ | `pair:[grid 一个 1 cm 的正方形（cold，"cm²"）, C 一块 1 cm 的正方体（signal，"cm³"）]` | `morph` | `cm² · cm³` | A flat square of 1 cm by 1 cm has an area of 1 cm². A cube of 1 cm takes up space: 1 cm³. Flat surfaces use square units; space uses cubic units. | 1 cm × 1 cm 的平面正方形，面积是 1 cm²。1 cm 的正方体占空间，是 1 cm³。平面用平方单位，空间用立方单位。（`square-units`） |

**要点**：① 1 cm³ is the space of a 1 cm cube. / 1 cm³ 是棱长 1 cm 的正方体占的空间。② 1 m³ is the space of a 1 m cube. / 1 m³ 是棱长 1 m 的正方体占的空间。③ Area uses square units; volume uses cubic units. / 面积用平方单位，体积用立方单位。

**题库（9）**：4 道 `input`（`measure`，单位芯片 cm / cm² / cm³：数块写体积；错例芯片选 cm² → `square-units`；2 × 3 × 2 堆写 10 → `visible-only`）；3 道 `choose`（量一个房间的体积用 cm³ 还是 m³；量一块橡皮用哪个；哪一个是 1 m³ 的东西）；2 道 `choose`（这是面积还是体积：图是平面方格 / 方块堆 → `square-units`）。

---

#### 第 03 步 `isometric-drawing` · 在等距点格纸上画（P5 2.3 · P4 Nets 4.1）

**概念**：等距点格纸上，竖的棱沿竖直方向画，另外两组棱沿两条斜的点线画；互相平行的棱画出来也平行；看不见的棱不画；每条棱的长度数点之间的间隔。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `C{cells:[一块], paper:iso}`：点格纸 + 单位立方体的线框（外形是六边形，里面一个 Y） | — | `3 faces seen` | On isometric grid paper the dots line up in three directions. A unit cube drawn here shows 3 faces: the top, the front and one side. You saw this view in nets. | 等距点格纸上的点沿三个方向排成直线。在上面画一个单位立方体，看得到 3 个面：顶面、正面和一个侧面。学展开图时见过这个角度。 |
| 2 | 同图，三组棱按方向上三种 tone（竖、左斜、右斜） | `shade` | `3 directions` | Every edge goes one of three ways: straight up, or along one of the two slanted dot lines. Edges that are parallel on the cube stay parallel in the drawing. | 每条棱只有三个方向：竖直向上，或者沿两条斜的点线。正方体上平行的棱，画出来也平行。 |
| 3 | `C{size:[3,2,2], paper:iso, seams:false}`，按顺序一条条画出 9 条看得见的棱（先画最近的竖棱） | `place` | `3 · 2 · 2` | To draw a cuboid 3 long, 2 wide and 2 high, start with the nearest upright edge, then count 3 spaces one way and 2 the other. Nine edges can be seen. | 画一个长 3、宽 2、高 2 的长方体：先画最靠近你的那条竖棱，再沿一边数 3 个间隔、沿另一边数 2 个间隔。看得见的棱一共 9 条。 |
| 4 ⚑ | `pair:[对的（cold ✓），一条 3 长的棱画成 3 个点即 2 个间隔、并画了 3 条虚的隐藏棱成实线（hot）]` | `morph` | `spaces ✓ · dots ○` | Count spaces between dots, not dots: 3 spaces is a length of 3. And the 3 edges at the back cannot be seen, so they are not drawn. | 数点之间的间隔，不是数点：3 个间隔才是长 3。后面那 3 条棱看不见，所以不画。（`edge-length-wrong`、`hidden-edge-drawn`） |

**要点**：① Upright edges stay upright; the others follow the slanted dot lines. / 竖的棱画竖直，别的棱沿斜点线。② Count spaces, not dots. / 数间隔，不数点。③ Hidden edges are not drawn. / 看不见的棱不画。

**题库（9）**：6 道 `draw-iso`（补全：正方体 2 × 2 × 2 缺 3 条棱；长方体 3 × 2 × 1 缺 4 条；4 × 1 × 2 缺 2 条；正方体 1 × 1 × 1 只给一条竖棱；3 × 3 × 1；2 × 1 × 3；错例 → `edge-length-wrong`、`hidden-edge-drawn`）；3 道 `choose`（哪一幅是 3 × 2 × 1 的长方体；哪一幅画在点格上是对的（选项含画了隐藏棱、棱长差一格）；这幅图画的长方体由几块组成（实心））。

---

#### 第 04 步 `cuboid-volume` · 长方体和正方体的体积（P5 2.4）

**概念**：一层的块数 = 长 × 宽，层数 = 高，所以体积 = 长 × 宽 × 高；正方体三条棱一样长：体积 = 棱长 × 棱长 × 棱长。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `C{size:[4,3,1], dims}`（底层 12 块 cold） | — | `4 × 3 = 12` | The bottom layer is 4 cubes long and 3 cubes wide, so it has 4 × 3 = 12 cubes, the same as the area of a rectangle. | 底层长 4 块、宽 3 块，所以有 4 × 3 = 12 块，和数长方形面积一样。 |
| 2 | 再叠两层（每层 signal，逐层落下） | `layer` | `12 × 3 = 36` | Stack 2 more layers of 12. There are 3 layers, so 12 × 3 = 36 cubes. | 再叠两层，每层 12 块。一共 3 层：12 × 3 = 36 块。 |
| 3 | 接缝淡出 `seams:false`，`dims: 4 cm · 3 cm · 3 cm` | `morph` | `4 × 3 × 3 = {u:36 cm3}` | So the volume of a cuboid is length × breadth × height. With edges in cm: 4 cm × 3 cm × 3 cm = 36 cm³. Any order of multiplying gives the same answer. | 所以长方体的体积 = 长 × 宽 × 高。棱长用 cm：4 cm × 3 cm × 3 cm = 36 cm³。先乘哪两个都一样。 |
| 4 ⚑ | 同图，hot 虚线 "4 + 3 + 3 = 10" 与 "4 × 3 = 12" 被划掉 | `cross` | `4 × 3 × 3, not 4 + 3 + 3` | Adding the edges gives 10, which is only a length. 12 is one layer. The volume counts every layer: 36 cm³. | 把三条棱加起来是 10，那只是长度。12 只是一层。体积要把每一层都算上：36 cm³。（`dimensions-added`、`one-layer-only`） |
| 5 ⚑ | `C{size:[5,5,5], seams:false, dims:"5 cm"}` | `morph` | `5 × 5 × 5 = {u:125 cm3}` | A cube has three equal edges. A 5 cm cube has a volume of 5 × 5 × 5 = 125 cm³, not 5 × 3 = 15. | 正方体三条棱一样长。棱长 5 cm 的正方体，体积是 5 × 5 × 5 = 125 cm³，不是 5 × 3 = 15。（`edge-times-three`） |

**要点**：① Volume of a cuboid = length × breadth × height. / 长方体的体积 = 长 × 宽 × 高。② Volume of a cube = edge × edge × edge. / 正方体的体积 = 棱长 × 棱长 × 棱长。③ The answer is in cubic units. / 答案用立方单位。

**题库（10）**：6 道 `input`（`measure` cm³ / m³：6 × 5 × 4 → 120，错例 15 → `dimensions-added`、30 → `one-layer-only`、120 cm² → `square-units`；10 × 8 × 3；12 × 5 × 2 m；正方体 3 cm → 27，错例 9 → `edge-times-three`；正方体 10 cm → 1000，错例 30 → `edge-times-three`；牛奶盒 6 × 6 × 20）；1 道 `build-cubes`（搭体积 18 的长方体，高 3）；3 道 `choose`（哪两个长方体体积一样：2 × 3 × 4 与 4 × 3 × 2 ✓、2 × 3 × 4 与 3 × 3 × 3（同和 9）→ `dimensions-added`；哪个算式求的是这个长方体的体积；一个文具盒 20 cm × 8 cm × 5 cm 的体积约是多少）。数字：正方体题不出 `dimensions-added` 的错例（与 `edge-times-three` 同值，§3.4）。

---

#### 第 05 步 `litres-and-cubic-centimetres` · 升、毫升和立方厘米（P5 2.6 · P3 Measurement 1.3 · P5 Decimals 1.2）

**概念**：1 ml 的水正好装满一个 1 cm³ 的小方块；棱长 10 cm 的空心正方体装 1000 cm³，就是 1000 ml = 1 ℓ。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `T{size:[1,1,1] cm, water:1}`（1 cm 的空心小方块装满水）+ `instrument{jug, ml, value:1}` 缩略 | — | `{u:1 cm3} = {u:1 ml}` | A hollow cube of 1 cm holds exactly 1 ml of water. So 1 cm³ and 1 ml are the same amount of space. | 一个 1 cm 的空心小方块正好装 1 ml 的水。所以 1 cm³ 和 1 ml 一样大。 |
| 2 | `T{size:[10,10,10] cm, water:0 → 10}`（1 ℓ 倒进去，正好满） | `pour` | `10 × 10 × 10 = {u:1000 cm3} = {u:1 l}` | A hollow cube with 10 cm edges holds 10 × 10 × 10 = 1000 cm³. Pour in 1 ℓ of water and it is exactly full: 1 ℓ = 1000 cm³. | 棱长 10 cm 的空心正方体能装 10 × 10 × 10 = 1000 cm³。倒进 1 ℓ 水，正好装满：1 ℓ = 1000 cm³。 |
| 3 | `T{size:[25,10,10], water:10}`，旁边写 `2500 cm³` | `morph` | `{u:2500 cm3} = {u:2500 ml} = {u:2.5 l}` | 2500 cm³ of water is 2500 ml, which is 2.5 ℓ, or 2 ℓ 500 ml, as you learnt with decimals. | 2500 cm³ 的水就是 2500 ml，也就是 2.5 ℓ，或者 2 ℓ 500 ml——学小数时换算过。 |
| 4 ⚑ | `pair:[10 cm 正方体 1000 块（cold）, 一排 10 块（hot 虚线，"10 cm³"）, 10 × 10 一层（hot 虚线，"100 cm³"）]` | `morph` | `{u:1 l} = {u:1000 cm3}` | 1 ℓ is not 10 or 100 cm³. A row of 10 small cubes is 10 cm³, one layer of 100 is 100 cm³; it takes 10 layers to fill a litre. | 1 ℓ 不是 10 cm³，也不是 100 cm³。一排 10 块是 10 cm³，一层 100 块是 100 cm³，要 10 层才是 1 升。（`unit-factor-wrong`） |

**要点**：① 1 cm³ = 1 ml. ② 1000 cm³ = 1 ℓ. ③ A 10 cm cube holds 1 litre. / 棱长 10 cm 的正方体装 1 升。

**题库（9）**：4 道 `input`（`whole`，单位 ml / cm³：3 ℓ = ? cm³ → 3000，错例 300 → `unit-factor-wrong`；450 cm³ = ? ml → 450；1.5 ℓ = ? cm³ → 1500，错例 150 → `unit-factor-wrong`；4 ℓ 200 ml = ? cm³）；3 道 `input`（`decimal` ℓ 或 `compound`：6000 cm³ = ? ℓ → 6，错例 60 → `unit-factor-wrong`；2750 cm³ = ? ℓ ? ml）；2 道 `choose`（哪个容器正好装 1 ℓ：10 cm 的正方体 ✓、1 cm 的正方体、10 × 10 × 1 cm 的盒子 → `unit-factor-wrong`；一瓶 500 ml 的水装得进哪个盒子）。

---

#### 第 06 步 `water-in-a-tank` · 长方体水箱里的水（P5 2.5）

**概念**：水箱里的水是一个长方体：长、宽和水箱一样，高是水的深度；水的体积 = 长 × 宽 × 水深；还能装多少 = 长 × 宽 × 空的高度。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `T{size:[30,20,25] cm, water:0 → 10, dims}` | `pour` | `30 × 20 × 10 = {u:6000 cm3}` | Pour water into an empty tank 30 cm long, 20 cm wide and 25 cm high until it is 10 cm deep. The water takes the shape of a cuboid 30 cm by 20 cm by 10 cm: 6000 cm³. | 往一个长 30 cm、宽 20 cm、高 25 cm 的空水箱里倒水，倒到 10 cm 深。水成了一个长 30 cm、宽 20 cm、高 10 cm 的长方体：6000 cm³。 |
| 2 | 同图，旁边写 `= 6 ℓ` | `place` | `{u:6000 cm3} = {u:6 l}` | 1000 cm³ is 1 ℓ, so 6000 cm³ of water is 6 ℓ. | 1000 cm³ 是 1 ℓ，所以 6000 cm³ 的水是 6 ℓ。 |
| 3 ⚑ | 同图，hot 虚线把水画到箱顶 "30 × 20 × 25" 被划掉 | `cross` | `30 × 20 × 10, not 30 × 20 × 25` | Use the depth of the water, not the height of the tank. 30 × 20 × 25 would be the water in a full tank. | 用水的深度，不是水箱的高度。30 × 20 × 25 是水箱装满时的水。（`tank-height-used`） |
| 4 ⚑ | 空的部分（10 cm 到 25 cm）hot 斜线 | `shade` | `30 × 20 × 15 = {u:9000 cm3} = {u:9 l}` | How much more water fills the tank? The empty part above the water is 25 − 10 = 15 cm high: 30 × 20 × 15 = 9000 cm³, or 9 ℓ. | 还要倒多少水才满？水上面空的部分高 25 − 10 = 15 cm：30 × 20 × 15 = 9000 cm³，也就是 9 ℓ。（`filled-not-empty`） |
| 5 | `T{size:[40,25,32], water:"3/4"}`（水深 24 cm） | `pour` | `{3/4} × 32 = 24 · 40 × 25 × 24 = {u:24000 cm3} = {u:24 l}` | A tank 32 cm high is {3/4} full, so the water is {3/4} of 32 = 24 cm deep. The water is 40 × 25 × 24 = 24 000 cm³, which is 24 ℓ. | 一个 32 cm 高的水箱装了 {3/4} 满，水深是 32 的 {3/4} = 24 cm。水的体积是 40 × 25 × 24 = 24 000 cm³，就是 24 ℓ。 |

**要点**：① The water in a tank is a cuboid: tank length × tank breadth × water depth. / 水箱里的水是长方体：长 × 宽 × 水深。② To fill up, use the empty height. / 求还要多少水，用空的那段高度。③ 1000 cm³ = 1 ℓ.

**题库（10）**：5 道 `input`（水的体积 cm³ 或 ℓ：50 × 30 × 20 水深 12 → 18 000 cm³ / 18 ℓ，错例 30 000 → `tank-height-used`、92 → `dimensions-added`；40 × 20 × 30 水深 15 → 12 ℓ，错例 12000 写进 ℓ 框 → `unit-factor-wrong`）；2 道 `input`（还要多少才满：错例 = 已有的水 → `filled-not-empty`）；1 道 `input`（{1/2} 满的水箱有多少升）；2 道 `choose`（哪个算式求水的体积；两个水箱谁的水多）。数字：水深 < 箱高；`tank-height-used` 与 `filled-not-empty` 的错例互不相同（水深 ≠ 箱高的一半）。

---

### 2.3 练习章 `practice`（8 道固定题，每题一次检查、一个提示）

| # | 题型 | 题目（EN / ZH 草稿） | 正确 | 错例 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `input`（`whole`） | How many unit cubes make this solid? / 这个立体由几个单位立方体组成？（3 × 3 × 2 堆） | 18 | 14（看得见的块）→ `visible-only`；21（看得见的面）→ `faces-counted` | 01 |
| Q2 | `build-cubes` | Build a cuboid with a volume of 12 cubic units that is 2 cubes high. / 搭一个体积是 12 个单位立方体、2 层高的长方体。 | 任意 a × b × 2，a × b = 6 | 不是长方体 / 块数不对 → fallback | 01 |
| Q3 | `draw-iso` | Complete the drawing of a cuboid 3 cm long, 2 cm wide and 2 cm high. / 补全一个长 3 cm、宽 2 cm、高 2 cm 的长方体。 | 9 条棱 | 一条画成 2 格 → `edge-length-wrong`；画了隐藏棱 → `hidden-edge-drawn` | 03 |
| Q4 | `choose` | Which is the volume of a box? / 哪一个是一个盒子的体积？ | 240 cm³ | 240 cm² → `square-units` | 02 |
| Q5 | `input`（`measure`） | Find the volume of a cuboid 8 cm × 5 cm × 3 cm. / 求长 8 cm、宽 5 cm、高 3 cm 的长方体的体积。 | 120 cm³ | 16 → `dimensions-added`；40 → `one-layer-only` | 04 |
| Q6 | `input`（`measure`） | Find the volume of a cube with edges of 6 cm. / 求棱长 6 cm 的正方体的体积。 | 216 cm³ | 18 → `edge-times-three` | 04 |
| Q7 | `input`（`whole`，cm³） | 2.4 ℓ = ? cm³ | 2400 | 240 → `unit-factor-wrong` | 05 |
| Q8 | `input`（`decimal`，ℓ） | A tank 50 cm × 40 cm × 30 cm has water 20 cm deep. How many litres of water are in it? / 水箱长 50 cm、宽 40 cm、高 30 cm，水深 20 cm。水箱里有多少升水？ | 40 | 60 → `tank-height-used`；40000 → `unit-factor-wrong` | 06 |

按问法 6 种：数块、搭、画、选单位、算体积、换算与水箱。

---

## 3. 引擎：新模型 `cubes`、两种小测、`volume` 误解域

### 3.0 复用与新增

| 编号 | 内容 | 复用 / 新增 |
|---|---|---|
| — | A8 `net`（docs/39 §3.2–3.3，docs/06「展开图与立体」）的 `lib/project.ts`：`camera(iso, turn)`、`ISO_PITCH`、`fitIn` / `transitionFit`（过渡中缩放不变）、`turn` | 复用 |
| — | A4 `grid`（第 02 步 ⚑ 拍的平面正方形）；A11 `instrument` 的 `jug`（第 05 步第 1 拍缩略） | 复用 |
| — | `input` 的 `whole`、`measure`（单位芯片）、`decimal`（`l`、`ml`）、`compound`（ℓ + ml）；`choose`（选项可是模型） | 复用 |
| **E-VO1** | 新模型 **`cubes`**（§3.1）：单位立方体堆、整块长方体、分层、等距点格纸、水箱与水；过渡 `layer`、`split`（拉开）、`pour` | 新增 |
| **E-VO2** | 小测 `build-cubes`（§3.2） | 新增 |
| **E-VO3** | 小测 `draw-iso`（§3.3） | 新增 |
| **E-VO4** | 单位 `cm3`、`m3`（`UNITS`、单位芯片、`{u:36 cm3}` 显示 cm³、朗读 "cubic centimetres" / "立方厘米"）；`measure` 芯片可列 cm / cm² / cm³ 三选一 | 新增 |
| **E-VO5** | 误解域 `volume`（10 码 + 共用 `unit-factor-wrong`）、`lib/diagnose/volume.ts`；`input.work` 加 `vol` 上下文（§3.4） | 新增 |
| **E-VO6** | 右上卡 VOLUME、PLATE 行（§3.5） | 新增 |

### 3.1 E-VO1 模型 `cubes`

```json
{ "kind": "cubes",
  "size": [4, 3, 2],                    // 整块长方体（长 × 宽 × 高，整数 ≤ 20）；或
  "cells": [[0,0,0], [1,0,0], [0,0,1]], // 单个方块（≤ 60），必须落地或压在别的方块上（validate）
  "seams": true,                        // 画块与块的接缝（size 默认 true，边长 > 6 时默认 false）
  "layers": 2,                          // 只画到第几层（逐层叠的拍）
  "apart": true,                        // 各层上下拉开（数被挡住的块）
  "tone": { "layer-2": "signal", "[2,1,0]": "hot" },   // 按层或按格上色；hot 被挡住的块画成虚线框
  "dims": true | "1 cm" | { "l": "4 cm", "b": "3 cm", "h": "3 cm" },   // 三条棱外侧的尺寸标注
  "unit": "cm" | "m",
  "paper": "iso",                       // 等距点格纸底（点距 = 一条单位棱的投影长）
  "tank": { "size": [30, 20, 25], "water": 10 | "3/4", "empty": true },   // 玻璃水箱：棱是细墨线、背后的棱虚线；水 = 淡 signal 长方体；empty 把空的部分画 hot 斜线
  "ruler": "desk",                      // 旁边一条 75 cm 高的发丝线（第 02 步第 3 拍）
  "turn": 0, "view": "iso" | "top" | "front",
  "pair": [ {…}, {…} ], "set": [ {…}, … ] }   // 2 个并排（共用比例）；2–4 个一排（第 01 步第 2 拍）
```

- **画法**：等轴测（`camera(1, turn)`），只画朝向相机的面（顶、前、右三向）；方块按 (x + y + z) 从远到近画（单位方块的轴对齐体素，不需要 `paintOrder` 的两两平面测试）；`seams: false` 时只画整块的 9 条可见棱；隐藏棱只在 `tank` 与 ⚑ 拍画成虚线。水箱的水面是一条平行四边形实线，水深标注在左侧竖着（signal），箱高在右侧（cold）。
- **比例**：长方体按真实比例画（validate：最长边 : 最短边 ≤ 6，否则要求 `seams: false` 并允许"不按比例"注记——本课题目不需要）；1 cm 与 1 m 的方块在 `pair` 里不同比例（第 02 步只并排 cm² 与 cm³，同一比例）。
- **过渡**（≤ 900 ms，reduced-motion 直接到位）：`layer`（新的一层从上方落下）、`split`（`apart` 拉开 / 合拢）、`pour`（水面从旧高度升到新高度）、`morph`（换形状，淡出淡入）。
- **规模**：1920 × 1080 下画面最高为舞台一半（同 docs/39 §9.1）；390 宽下 3 × 2 × 2 的单个方块棱投影 ≥ 28 px。
- **validate**：`cells` 不重复、都有支撑；`size` 与 `cells` 二选一；`tank.water` ≤ `tank.size[2]`、分数写法时水深为整数或一位小数；`paper: iso` 时 `size` 每边 ≤ 6；拍里写的算式与 `size` / `tank` 算出的体积一致（数字在算式里出现时 validate 抽查）。

### 3.2 E-VO2 `build-cubes`

| 字段 | 孩子做什么 | 键盘 | 检查 | `sample` |
|---|---|---|---|---|
| `{ base: [cols, rows]（≤ 5 × 4）, maxHeight: 4, target: { count?, size?, cuboid?, height? }, start?: heights }` | 左边（窄屏上方）是底面方格图，每格写这一摞有几块；点一格加一块，"拿走一块"按钮切换成减；右边等轴测随时画出搭好的立体，托盘写"已用 n 块" | 方格 roving-tabindex，方向键移动，Enter 加、Backspace 减 | `count`：块数相等；`size`：是长方体且三边（任意朝向）等于 `size`；`cuboid`：每摞一样高、占的格成长方形；`height`：最高 = height | `"h:2,2,2/2,2,2"`（每行的各摞高度，行间 `/`） |

不设误解码（错答走 fallback："看一看：每一摞一样高吗？块数够吗？"）。手机上格 ≥ 44 px（5 × 4 在 390 宽下 = 每格 ~ 60 px）。

### 3.3 E-VO3 `draw-iso`

| 字段 | 孩子做什么 | 键盘 | 检查 | `sample` |
|---|---|---|---|---|
| `{ paper: [cols, rows]（≤ 12 × 9 点）, solid: [l, b, h], at: [x, y]（最近竖棱的下端点）, given: [segment…], hidden?: false }` | 等距点格纸上已画出几条棱（cold）；点一个点、再点另一个点连一条线（只能沿三个方向，跨几格都行）；点已画的线可删 | 点 roving-tabindex，方向键沿点阵六个方向走，Enter 选端点 | 把孩子的线和给定的线都拆成单位段，集合 = 这个长方体的 9 条可见棱拆成的单位段 | `"seg:(3,0)-(3,2);(3,2)-(6,2)"` |

**诊断（由结果算出）**：`edge-length-wrong` = 孩子的线与正确棱同方向、同起点，长度差 ±1 格；`hidden-edge-drawn` = 多出来的线正是 3 条隐藏棱中的一条或几条（其余都对）。

### 3.4 E-VO5 诊断（`lib/diagnose/volume.ts`，纯函数，每条 ≥ 2 正例 1 反例）

`input.work.vol = { size: [l,b,h] | cells, water?, tankH?, ask: "count" | "volume" | "water" | "fill", unit? }`

| code | 规则 |
|---|---|
| `visible-only` | `ask: count`，答 = 等轴测下看得见的方块数（引擎由几何算出） |
| `faces-counted` | `ask: count`，答 = 看得见的单位正方形面数 |
| `dimensions-added` | `ask: volume`，答 = l + b + h（**正方体除外**：l = b = h 时归 `edge-times-three`） |
| `one-layer-only` | `ask: volume`，答 = 某两边之积 |
| `edge-times-three` | 正方体，答 = 3 × 棱长 |
| `square-units` | `measure` 的单位芯片选了平方单位（数值对） |
| `tank-height-used` | `ask: water`，答 = l × b × tankH（或换成升后的值） |
| `filled-not-empty` | `ask: fill`，答 = l × b × water |
| `unit-factor-wrong`（共用） | ℓ ↔ cm³ / ml 的题，答 = 正确值 × 或 ÷ 10、100（同小数域的写法） |
| `edge-length-wrong`、`hidden-edge-drawn` | `draw-iso` 专用（§3.3） |

`check-pool`：同一题各错例值互不相同、≠ 正确答案；同值命中两条时 WARN。单测 `tests/math-scene/{cubes,diagnose-volume}.test.ts`（可见块数与可见面数在 1 × 1 × 1、2 × 2 × 2、3 × 2 × 2、L 形上与手数一致；`draw-iso` 的单位段拆分；水箱体积）。

### 3.5 E-VO6 HUD

右上卡 **VOLUME**：L · B · H（水箱另加 WATER）· LAYERS · VOLUME；讲解拍全显示；小测只显示题目给出的，要求的写 ?；`build-cubes` 显示"已用 n 块"，不写目标。PLATE 行 MODEL CUBES · VIEW ISO · LAYERS · CUBES（或 UNIT cm³）。背景章 00 标本：3 × 2 × 2 的方块堆，上层拉开一半（`SPECIMEN 12 CUBES`）。

---

## 4. 名词表（`glossary.json`，13 个）

| id | EN | ZH | 定义要点（带一个例子） |
|---|---|---|---|
| `volume` | volume | 体积 | 一个立体占的空间有多大。（与 `measuring` 的"容量"同一个英文词，Q5） |
| `unit-cube` | unit cube | 单位立方体 | 每条棱长都是 1 的正方体。 |
| `cubic-unit` | cubic unit | 立方单位 | 量体积的单位：1 个单位立方体的大小。 |
| `cubic-centimetre` | cubic centimetre (cm³) | 立方厘米（cm³） | 棱长 1 cm 的正方体的体积，大约一块方糖。1 cm³ = 1 ml。 |
| `cubic-metre` | cubic metre (m³) | 立方米（m³） | 棱长 1 m 的正方体的体积。 |
| `cube` | cube | 正方体 | 六个面都是一样大的正方形的立体。（与 `nets-and-solids` 同一条） |
| `cuboid` | cuboid | 长方体 | 六个面都是长方形（或有两个正方形）的立体。（同上） |
| `length-breadth-height` | length, breadth, height | 长、宽、高 | 长方体三个方向的棱长。体积 = 长 × 宽 × 高。（"breadth"同 docs/21 D6） |
| `layer` | layer | 层 | 平铺在同一高度的一层方块。4 × 3 的一层有 12 块。 |
| `edge` | edge | 棱 | 两个面相接的线。（同 `nets-and-solids`） |
| `isometric-grid` | isometric grid | 等距点格纸 | 点沿三个方向等距排列的纸，用来画立体。（Q6） |
| `litre` | litre (ℓ) | 升（ℓ） | 1 ℓ = 1000 ml = 1000 cm³。（与 `measuring` 同一条，加一句 cm³） |
| `millilitre` | millilitre (ml) | 毫升（ml） | 1 ml = 1 cm³。（同上） |

---

## 5. 写作规则与术语

### 5.1 口吻样例

- 讲解："Count one layer first: 4 rows of 3. Then count how many layers are stacked." / "先数一层：4 排，每排 3 块。再数叠了几层。"
- 错误反馈："Not yet. 12 is one layer. How many layers does this cuboid have?" / "还没对。12 是一层的块数。这个长方体有几层？"

### 5.2 术语（MOE 英文 · 中文 · 备注）

| EN | ZH | 备注 |
|---|---|---|
| volume | 体积 | Q5；液体也说"水的体积"；`measuring` 主题用"容量" |
| unit cube, cubic unit | 单位立方体、立方单位 | |
| cm³, m³ | 立方厘米、立方米 | 界面写符号 cm³、m³，朗读写全称 |
| cube, cuboid | 正方体、长方体 | 同 docs/39 D13（新加坡华文**待核**："立方体"不用） |
| length, breadth, height | 长、宽、高 | "breadth" 不写 width（MOE 用 breadth，docs/21 D6） |
| edge | 棱 | 正方体的"棱长" |
| layer | 层 | |
| isometric grid | 等距点格纸 | Q6（**待核**） |
| rectangular tank | 长方体水箱 | 不说"鱼缸"作术语（情境里可以说） |
| depth / height of water | 水深 / 水的高度 | EN 正文用 "depth of the water"，题目照课本也说 "height of the water"（**待核**） |
| litre, millilitre | 升、毫升 | 写 ℓ、ml（同 `measuring`） |
| full, empty, {3/4} full | 满、空、{3/4} 满 | |

### 5.3 数字与情境（新加坡）

- 数字：D8；舞台上数的方块堆 ≤ 24 块（讲解可到 60）；体积 ≤ 8000 cm³ 或 ≤ 200 m³；水箱各边 ≤ 100 cm，水 ≤ 200 ℓ；换算题 ≤ 20 000 cm³。
- 情境：积木、方糖、文具盒、牛奶盒（6 × 6 × 20 cm 一类的整数尺寸，编的，不对应真实品牌）、组屋家里的鱼缸、学校蓄水箱、搬家纸箱、冰块盒。1 m³ 只和课桌比（Q7）。
- 人名：Wei Jie、Nurul、Arjun、Mei Ling、Hafiz、Priya。

---

## 6. 插图（交 Codex；风格与验收同 docs/76 §6、docs/69 §4.2，严格）

共同风格：fine graphite pencil，19th-century scientific plate；**严格中性灰（R = G = B）**；透明 PNG；主体约占画面 85 %，不触边；**NO text, letters, numerals, units, rulers with numbers, dimension lines, arrows, labels, logos, paper texture, background, frame, ground shadow**。交付 `art/planned/volume/` 原图 + `manifest.jsonl` + 420 px 预览 + cinema 反相模拟；不合格最多重画 4 次。块数与"平行"是教学点：docs/69 §4.1-1，**方块堆一律代码画**（等轴测几何 + 木纹铅笔质感，`scripts/figures/volume-*.ts` 断言）。

`art/planned/volume/` 三张候选（2026-10-18）已放大目检：

| # | 文件 | 尺寸 | 用在 | 画什么 | 可数 / 可量的事实（逐条验收） | 不许出现 | 方法 |
|---|---|---|---|---|---|---|---|
| I-1 | `volume.png`（封面） | 1024² | 主题卡 | 12 块一样的木制单位立方体拼成长 3、宽 2、高 2 的长方体，等轴测（看得到顶、前、右三面） | ① 顶面 3 × 2 = 6 格、前面 3 × 2、右面 2 × 2（逐面数接缝）；② 三组棱各自平行（±1°，脚本量线段方向）——**必须是等轴测，不是透视**；③ 每块的可见面一样大（±3 %）；④ 无散块 | 散块、字、数字、尺子、手、桌面 | **代码画**。候选块数对（3 × 2 × 2），但是透视画法、近处的块明显更大，过不了 ②③；只作构图参考 |
| I-2 | `volume-cube-layers.png` | 1536×1152 | 第 04 章 | 同一个 4 × 3 × 3 长方体的三层上下拉开（每层 12 块），等轴测，层间留一样的缝 | ① 恰好三层；② 每层 4 × 3 = 12 块（逐层数）；③ 三层上下对齐（竖直方向错位 ≤ 1 %）；④ 层间缝一样宽（±5 %）；⑤ 等轴测（同 I-1 ②） | 字、数字、箭头、手 | **代码画**。候选（两层并排各 6 块）排布前后对不上：左边一层前排像 3 块、后排像 2 块，**不用** |
| I-3 | `volume-half-full-tank.png` | 1536×1152 | 第 06 章 | 一个开口的透明长方体玻璃水箱，水正好一半，水面平 | ① 水面是一个平面，与四面箱壁的交线都在箱高的 50 %（±3 %，脚本量前、后两条交线）；② 箱体三组棱各自平行（±2°）；③ 无盖、无鱼、无水草、无刻度 | 鱼、气泡、水草、刻度、架子、字 | **候选目检大致过**（前壁水面约在 52 %），按 ①② 跑脚本：过则用，不过则代码画 |

图注草稿：I-1 "Twelve unit cubes make a cuboid 3 long, 2 wide and 2 high." / "12 个单位立方体拼成长 3、宽 2、高 2 的长方体。"；I-2 "Three equal layers of 12 cubes each." / "三层，每层 12 块。"；I-3 "The water in the tank is itself a cuboid." / "水箱里的水本身就是一个长方体。"。三张不靠明暗表意，可反相。

---

## 7. 施工顺序与分工（照 skill `build-order.md`；**不需要新依赖**；子代理不改 `package.json`、不提交）

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | §0.1 定稿；建 `src/content/topics/volume/{chapters,data}`、`topic.yaml`（`illustration: volume`） | `topic.yaml` | — | S |
| 1 | E（Opus） | E-VO1–E-VO6、单测、docs/06「体积（cubes）」一段 | 新 `stage/CubesModel.tsx`（懒加载，同 `ChartModel`）、新 `lib/{cubes,cube-tasks}.ts`、`lib/diagnose/volume.ts`、`tray/CubeControls.tsx`、`hud/cards/VolumeCard.tsx`、`validate-volume.ts`；共享文件只做登记式加法（schema 新模型 / 任务 / 码 / 单位、`lib/value.ts` 单位、state / check / solve / Stage / Tray / 卡片注册）；`lib/project.ts` **只读不改**（改则回归 `pnpm shoot nets-and-solids --beats --tasks`） | 0 | M–L |
| 2 | L（Opus） | `lesson.json`：6 步 26 拍、样板题、练习 8 题；`pnpm shoot volume --beats` 逐张看 | `data/lesson.json` | 1 | S |
| 3 | Codex | 题库其余约 45 道（`check-pool --topic volume --step <id>` 0 错）；6 章英文初稿 | `scripts/math/drafts/` | 2 | S |
| 4 | T（Opus） | 合并、定稿英文、写中文正文、名词表、来源 | `data/*`、`chapters/*` | 3 | S |
| 4′ | Codex + 主会话 | §6：I-1、I-2 代码画；I-3 脚本复核 | `public/illustrations/**`、`scripts/figures/volume-*.ts` | 0 | S |
| 5 | P（Sonnet） | QA；e2e：手机上叠块（5 × 4 底面）、纯键盘补全等距图、水箱 `pour` 在 reduced-motion 下直接到位；展开图主题回归 | `tests-e2e/volume.spec.ts` | 4 | S |
| 6 | 主会话 | 验收、截图、提交 | — | 5 | S |

---

## 8. 验收

照 `references/acceptance.md`，另加：

- [ ] 每个方块堆的块数、看得见的块数、水的体积由引擎从数据算出，与字幕和算式一致（validate）
- [ ] 等轴测画法与点格纸对齐：`paper: iso` 上每条单位棱的两端都落在点上（单测 + 截图放大看）
- [ ] 没有 cm³ ↔ m³ 换算题；三边同单位（D8、Q4）；没有"倒水后水面升多高"的题（P6）
- [ ] §2.1 每个码有 ⚑ 拍、有能诊断它的题；`unit-factor-wrong` 至少两道
- [ ] `pnpm shoot nets-and-solids --beats --tasks` 0 回归（若动了 `lib/project.ts`）
- [ ] 灰度截图能分辨：给定的块、新叠的一层、被挡住的（虚线）、水、空的部分（斜线）、隐藏棱（虚线）
- [ ] 截图：第 01、03、06 章 + 练习与一道 `draw-iso` 小测，三种尺寸

## 9. 来源（访问日期 2026-11-16）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (2021 P1 cohort; Updated Oct 2025). https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 课纲原文第 34、36、39、41、42、44 页 |
| S2 | MOE, Primary school curriculum · Syllabus. https://www.moe.gov.sg/primary/curriculum/syllabus | 版本核对 |
| S3 | docs/39 §3.3、§9.1（A8 投影，真等轴测 35.264°） | E-VO1 复用 |
| S4 | BIPM, *The International System of Units (SI)*, 9th ed. (2019)，表 8：litre（L、l），1 L = 1 dm³ = 10³ cm³ | 1 ℓ = 1000 cm³（施工时核页码） |
| S5 | Battista, M. T., & Clements, D. H. (1996). Students' understanding of three-dimensional rectangular arrays of cubes. *Journal for Research in Mathematics Education*, 27(3), 258–292 | 漏数被挡住的块、数面（页码**待核**，不进 `sources.json`） |
| S6 | Ben-Haim, D., Lappan, G., & Houang, R. T. (1985). Visualizing rectangular solids made of small cubes. *Educational Studies in Mathematics*, 16(4), 389–409 | 同上（**待核**） |
| S7 | 批准教材目录（只作顺序参考），https://www.moe.gov.sg/education-in-sg/approved-textbook-list | Q2、Q5、Q6 的写法；等距图的常见错（**待核**课本） |

## 10. 施工记录 / 已知差距

施工时追加。
