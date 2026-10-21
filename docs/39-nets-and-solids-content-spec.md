# 39 · 展开图与立体 · 内容 spec（`nets-and-solids`，MathScene 课；v1，§0 已定稿）

docs/17 §2.3 的 `nets-and-solids` 一行（P4 Geometry · Nets；"3D 展开图沿棱折起来"），以及 docs/17 §7 的 **A8「MathScene 里的 3D」**缺口。2026-10-21 起草，**只做规划，不施工、不建目录、不提交**。照 skill `.claude/skills/atlas-lesson-topic/`（SKILL.md + `references/spec-template.md`、`writing-rules.md`、`data-cookbook.md`、`build-order.md`、`acceptance.md`）写，布局和密度照 docs/29（小数）、docs/32（量的读数）；引擎现状以 docs/06「MathScene」（含「方格」「量的读数」两节）与「SpaceScene」「试一试」「时间线与回放」为准；视觉语法照 docs/08 §1、§2、「MathScene 语法」。

调研已做完（Sonnet，2026-10-21）：`art/research/nets-and-solids/`（`nets-research.md` 正文、`facts.json` 37 个来源 83 条、`hex_check.py` 与 `box_nets.py` 两个自算脚本）。本文的课纲原文、事实、误解出处、中文术语都出自那里，来源编号**沿用调研的 S1–S37**，方便对账。记号同 docs/32：EN 字幕与题目是**口吻草稿**，施工时 Sonnet 起草全文、Opus 逐句核对；ZH 是草稿，施工时 Opus 独立定稿。

本课是第一节真要"折起来"的数学课。§3 的引擎决定是全文最重要的一节：**MathScene 课 + 新模型 A8 `net`（SVG 正投影里的刚体折叠，不用 three.js）**，理由见 §0 D2 与 §3.0。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **对象与主体**：Measurement and Geometry · Geometry 的 **P4「4. Nets」四条（4.1–4.4）为主体**（第 02–08 步）；**P2「2. 3D Shapes」2.1**（认、叫、描述、分类正方体、长方体、圆锥、圆柱、球）是地基，做成正式的第 01 步，因为后面每一步都要用"面"这个词。P5 体积（单位立方体、等距方格画图，S1 第 42 页）不做，留给将来的 `volume` 主题（它会复用本课的 A8 投影） | 同意 | 定稿 |
| D2 | **引擎：MathScene 课，不用 SpaceScene**。一章 = 3–5 个讲解拍 + 章末一道小测（题库 8–10 道随机抽，"再来一道""跳过"都在）+ 最后一章 8 道练习。新模型 **A8 `net`**：在 SVG 舞台里用正投影（俯视 / 等轴测）画出按铰链树折起来的平面多边形，`fold` 0–1 连续可调；圆柱、圆锥的侧面按曲率卷起来。**不引 three.js，不加依赖**。理由（§3.0 详表）：① 本课的教学核心是"判断 + 解释为什么不行"，正好是课的形状（小测、诊断、练习），SpaceScene 没有题库、诊断与练习；② 折展开图的几何是 ≤ 50 个凸多边形的刚体旋转，SVG 画得准、画得快，而且就是 docs/08「MathScene 语法」要的"正投影线稿"；③ SpaceScene 的 `poses` 是数据里写死的关键帧，任意六连方的折叠要运行时算变换（docs/06「试一试 · 已知限制」写明是 v2）；④ 同一个投影以后给 `volume`（P5 等距方格画图、单位立方体）用，A8 一次解决 | 同意 | 定稿 |
| D3 | **课纲 4.1 "2D representations" 按严格读法**：理解为"展开图"（4.1 在 "Nets" 小标题下）。所以**圆柱、圆锥的展开图只要求认**（第 08 步只有讲解拍与选择题，不画、不拼、不点面）；**画展开图（4.2）、认展开图（4.3）、由展开图认立体（4.4）只做正方体、长方体、棱柱、棱锥**。docs/17 第 94 行把六种立体都写成"画；认展开图"，读宽了（调研 §1）。另一种读法（4.1 也包括立体的平面图画）列在 §0.1 | 同意 | 定稿 |
| D4 | **"画展开图"（4.2）在屏幕上做成"在方格上补全 / 画出展开图"**：新小测 `complete-net`——正方体在方格上点格子（最多从一个正方形画到六个），长方体和棱柱 / 棱锥从几个候选位置里选；检查 = 引擎把孩子的图真的折一遍。不做自由手画（触屏画直线不可靠，也不是课纲的重点） | 同意 | 定稿 |
| D5 | **判断展开图的标准是"折一折看"**，规则只是快速排除：2 × 2 的方块、一排 5 个、4 个一排的同一边有两个，一定不行；但有的非展开图没有这些记号（调研 §2.2：O / I / U / V 四条合起来也漏 3 个，`hex_check.py`），所以正文和第 04 步的最后一拍明说"要确定，就折一折"。小测里"折一折"是第二级提示（第一次检查之后才解锁），练习里不给 | 同意 | 定稿 |
| D6 | **数字只用调研核过的**：正方体 **11** 种展开图（S3、S6、S17，自算吻合）；6 个正方形连成的图形（六连方）一共 **35** 种，其中 11 种是展开图；长方体**三条棱都不一样长时 54 种**（S7、S8，自算吻合），放在 `<More>` 里并写清条件；**两条棱一样长时的 29 种是自算、没有出版来源，界面不用**；arXiv 的 723 等数不是"展开图"的意思（调研 §2.3），不用。正四面体 2 种（S3），只在 `<More>` | 同意 | 定稿 |
| D7 | **面、棱、顶点**：课纲 P2–P6 都没有 vertex、Euler，"face""edge"只在 P6 体积里出现（调研 §1 负面结果）。本课：**面**（平的面 / 曲面）要数（第 01 步、题库里数面）；**棱**只当"折的那条线"用，不数；**顶点**只在棱锥里说"三角形的尖碰在一个点上"，不数；**不讲欧拉公式**，不出 V − E + F | 同意 | 定稿 |
| D8 | **曲面立体的说法**：圆柱"2 个圆形的平的面 + 1 个曲面"，圆锥"1 个圆形的平的面 + 1 个曲面"，球"只有一个曲面"。课纲没给约定（S14 的锥体条目是"1 circular face and 1 conic surface"），这是本课的写法，名词表注明；题库不出"圆柱有几个面"这种依赖约定的数数题，只问"几个平的面" | 同意 | 定稿 |
| D9 | **正方体与长方体分开叫**：P2 课纲把 cube、cuboid 列成两种（S1 第 34 页）。本课不说"正方体是特殊的长方体"（S32 说部分教材这样讲，要看学校课本，§0.1）；命名题里正方体答 cube，从不让 cube 和 cuboid 同时算对；两端是正方形的长方体（S25 那种纸盒）叫 cuboid | 同意 | 定稿 |
| D10 | **对面配色**：讲解拍里"相对的面"用三种新的配对色（token `--face-1/2/3`）+ 三个形状记号 ● ▲ ■（不靠颜色也分得开）；棱柱的两个底面同色。小测里照 MathScene 语法：题目给的面 = cold，孩子点的 / 放的 = signal，看答案 = 墨色虚线；配对色只在讲解拍和"看答案"折起来之后出现 | 同意 | 定稿 |
| D11 | **长度只用方格数**：长方体、棱柱的展开图画在方格纸上，边长写"3 格""3 × 2 的长方形"，**不写 cm、不算面积**（表面积不在小学课纲，调研 §1）；长方体三条棱 ≤ 4 格；交互方格 ≤ 12 × 10 | 同意 | 定稿 |
| D12 | **新误解域 `nets`**，8 个码（§2.1）：`prototype-only`、`overlap-unseen`、`adjacent-as-opposite`、`face-size`、`face-count`、`prism-pyramid`、`cube-cuboid`、`curved-unrolled`。后三个没有带页码的研究出处（调研 §3.1 第 9、11 条），反馈句标"本课提出的诊断"，不说错误率 | 同意 | 定稿 |
| D13 | **中文术语**（§5.2）：立体图形 / 正方体 / 长方体 / 圆柱 / 圆锥 / 球 / 棱柱 / 棱锥 / 三棱柱 / 四棱锥 / 三棱锥 / 展开图 / 面 / 平的面 / 曲面 / 棱 / 顶点 / 底面 / 相对的面。新加坡用法**未核**（调研 §5：MOE 数学只用英文，找不到新加坡中文数学术语表），以仓库已用的正方体 / 长方体为准，待 Gavin 核（§0.1） | 同意 | 定稿 |
| D14 | **情境**：只用调研有出处的——折叠纸盒运来时是平的（S25）、四面体形的纸盒（S27，不写品牌名作卖点，只在正文 `<More>` 里一句"有一种牛奶盒是三棱锥形的"并注来源）、三棱柱形的巧克力盒（**不写品牌**，S26 只作出处）、冰淇淋蛋筒是烤平再卷起来的（S28）、罐头（配图）。纸巾盒、Milo 罐、红包**不说任何具体事实**（调研 §4 无出处）。人名多族群（Aisha、Ravi、Mei Ling、Wei Jie、Siti、Arjun、Hui Min、Daniel、Farah、Kumar）；无品牌、无价格 | 同意 | 定稿 |
| D15 | **UI 里不出现年级**（docs/19 D3）：课纲对照只写原文 + 来源芯片；第 08 步章头写 "Recognise only / 只要认得"，不写"P4 只要求认"；`level`、`ref` 只在数据里 | 同意 | 定稿 |
| D16 | **背景章 00**：照小数 / 量的读数的 00 章改写（讲节拍、章节轴、小测、再来一道 / 跳过），加一段"舞台上的展开图可以折、可以转"；标本是折到一半的十字形正方体展开图（状态行 `SPECIMEN CUBE NET · FOLD 50 %`）；不计入步数 | 同意 | 定稿 |
| D17 | **步数**：8 个课步 + 练习 + 00。拍 37 个 ≈ 12 分钟，小测 8 道 ≈ 5.5 分钟，练习 8 道 ≈ 5.5 分钟：**全课约 23 分钟**，可以分两次（01–04 / 05–08） | 同意 | 定稿 |
| D18 | **图：只用 `art/planned/nets-and-solids/` 里已审过的三张，不新画**（Codex 不可用）：首页图 = `nets-and-solids.png`（十字形正方体展开图）；配图 2 张 = `nets-and-solids-open-carton.png`（第 06 章）、`nets-and-solids-cylinder-faces.png`（第 08 章）。审图结论见 §6 | 同意 | 定稿 |

### 0.1 真正需要 Gavin 的

无阻塞项。下面是"按惯例代定、Gavin 想改随时改"的，手边有女儿的课本时各翻一页即可：

1. **课纲 4.1 "2D representations" 怎么读**（D3）：本文按"展开图"读。如果学校课本把 4.1 讲成"认立体的平面图画"（比如从不同方向看到的样子），就在第 01 步加一拍，题库加 2 道选择题；引擎不用改（A8 本来就能画立体）。
2. **中文术语**（D13）：新加坡华文材料写正方体还是立方体、棱柱 / 棱锥还是角柱 / 角锥（香港写法，S30）——问一下学校或看一眼华文材料；改动只在 `glossary.json` 和中文正文里替换。
3. **棱和顶点要不要数**（D7）：课纲不要求，本文不数、不讲欧拉公式。想加的话是第 07 步一个 `<More>`（F / E / V 表，S4、S10–S13），不加题。
4. **"正方体是特殊的长方体"**（D9）：本文不说。学校课本这样讲的话，第 01 步第 3 拍的字幕加一句即可。
5. **A8 的路线**（D2）：docs/17 §7 原来写"嵌 three.js 小舞台"或"让 SpaceScene 支持课"二选一；本文选了第三条（SVG 正投影）。Gavin 不同意的话，§3 的 N3、N5 换成 three.js 舞台，其余（几何、题型、诊断）不变。

---

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，逐字；调研 2026-10-21 从 PDF 抄录，`pdftotext` + 页面图核过）

S1 = MOE CPDD, *Mathematics Syllabus Primary One to Six*（Implementation starting with 2021 Primary One Cohort；页脚 "Updated: Oct 2025"）。页码是每页页脚印的 "Page | N"。

| 级 | 子线 · 条目 | 课纲原文（S1） | 列出的立体 | 页 | 本课 |
|---|---|---|---|---|---|
| P2（地基） | Geometry · 2. 3D Shapes · 2.1 | "identifying, naming, describing and classifying 3D shapes" | cube, cuboid, cone, cylinder, sphere | 34 | 第 01 步 |
| **P4** | Geometry · 4. Nets · 4.1 | "identifying 2D representations of" | cube, cuboid, cone, cylinder, prism, pyramid | 39 | 第 02、06、07、08 步 |
| **P4** | 4.2 | "drawing 2D representations of" | cube, cuboid, prism, pyramid | 39 | 第 03、04、06、07 步（`complete-net`） |
| **P4** | 4.3 | "identifying the nets of 3D solids" | cube, cuboid, prism, pyramid | 39 | 第 03–07 步 |
| **P4** | 4.4 | "identifying the solid which can be formed by a given net" | — | 39 | 第 02、06、07 步；练习 |
| P5（不做） | Area and Volume · 2. Volume of Cube and Cuboid · 2.1–2.6 | 2.1 "building solids with unit cubes" · 2.3 "drawing cubes and cuboids on isometric grid" · 2.4 "volume of a cube/cuboid" …… | — | 42 | 不做（将来 `volume`；复用 A8） |

课纲框架：**Skills**（S1 第 14 页）——"numerical calculation, algebraic manipulation, spatial visualisation, data analysis, measurement, use of mathematical tools and estimation are explicitly taught"。"空间想象"是明确要教的技能，这是"在脑子里折"的依据，也是舞台能折、能转的理由。

核对要点（纠正常见二手说法，包括 docs/17）：
- **圆锥、圆柱只在 4.1 出现**；4.2（画）、4.3（认展开图）只有四种立体（D3）。
- **课纲没有 vertex、surface area、Euler**；"face""edge"只出现在 P6 体积的两条里（第 44 页）。数棱、数顶点、欧拉公式、表面积都不是课纲（D7、D11）。
- **"2D representations" 课纲没定义**（D3、§0.1 第 1 条）。
- Singapore OER 页（S9）转述的旧课纲写过 "Exclude nets of cylinder and cone" 和 "making 3-D solids from given nets"；2021 版没有这两句，旧版 PDF 没取到，只当线索，不引用。
- **等距方格画图在 P5 2.3**，不在 P4。本课舞台用等轴测投影，但不教"在等距方格上画"。

### 1.2 级别、步数与时间

- **8 个课步 + 练习章 + 背景章 00**（9 个带编号的章，00 不计）。
- 地基 P2（01）→ 主体 P4（02–08）；没有桥步。
- 拍 37 个（每拍 ~20 s ≈ 12 min），小测 8 道（~40 s ≈ 5.5 min），练习 8 道（≈ 5.5 min）：**全课约 23 分钟**。

### 1.3 步表

| # | 步 id | EN | ZH | 课纲 | 模型 | 拍 | 题库（道 · 主要题型） | 数字（`limits`） |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | net（标本） | — | — | — |
| 01 | `solids-and-faces` | Solids and their faces | 立体和它的面 | P2 2.1 | net（立体，`set`） | 4 | 9 · choose / input | 立体 7 种；只数"平的面" |
| 02 | `opening-a-cube` | Open a cube flat | 把正方体摊平 | P4 4.1, 4.3, 4.4 | net（正方体） | 4 | 8 · choose / input | 正方体（命名题里可有一道长方体） |
| 03 | `many-nets` | More than one net | 不只一种展开图 | P4 4.2, 4.3 | net（正方体，`set`） | 5 | 9 · choose（多选、是 / 否）/ complete-net | 正方体；方格 ≤ 6 × 5 |
| 04 | `fold-to-test` | Fold it and look | 折一折，看一看 | P4 4.2, 4.3 | net（六连方） | 5 | 10 · choose / complete-net | 六连方；方格 ≤ 6 × 5 |
| 05 | `opposite-faces` | Opposite faces | 相对的面 | P4 4.3, 4.4 | net（正方体、开口盒） | 4 | 9 · tap-face / choose | 正方体、开口正方体 |
| 06 | `cuboid-nets` | Nets of a cuboid | 长方体的展开图 | P4 4.1–4.4 | net（长方体，方格） | 5 | 9 · complete-net / choose / input | 三条棱 1–4 格；方格 ≤ 10 × 10 |
| 07 | `prisms-and-pyramids` | Prisms and pyramids | 棱柱和棱锥 | P4 4.1–4.4 | net（棱柱、棱锥） | 5 | 10 · choose / input / complete-net | 三棱柱、四棱柱（≠ 长方体时才用）、五 / 六棱柱只在讲解；三棱锥、四棱锥 |
| 08 | `cylinders-and-cones` | Cylinders and cones | 圆柱和圆锥 | P4 4.1 | net（曲面） | 5 | 8 · choose | 只认，不画 |
| 09 | `practice` | Practice | 练习 | — | — | — | 8 道固定题 | — |

### 1.4 不在本课

- 体积、单位立方体、等距方格画图、表面积（P5 / 不在课纲）→ 将来 `volume`。
- 数棱、数顶点、欧拉公式（不在课纲，D7）。
- 圆柱、圆锥展开图的**画**与**判断对不对**的细节（只认，D3）；圆周长 2πr（P6 圆）——第 08 步只说"长方形的长边正好绕圆一圈"。
- 球没有展开图（第 01 步一句话带过）。
- "沿面剪开"的展开（arXiv 的 723 等，D6）。

---

## 2. 课的设计

### 2.0 写法约定（照 skill `writing-rules.md`）

- 一拍讲一件事：看什么 + 为什么；EN ≤ 35 词、ZH ≤ 60 字；第一拍接"你已经知道的"，最后一拍给结论或一个应用。
- 算式行很短，多数是 `words`：`6 faces` / `6 个面`、`6 + 4 + 1 = 11`、`2 triangles + 3 rectangles` / `2 个三角形 + 3 个长方形`、`bottom → sides → top` / `底 → 侧面 → 顶`。不在算式里写解释。
- **固定说法**（全课一致，字幕、正文、反馈三处一样）：
  - EN "A net is a flat shape that folds up into a solid." / ZH "展开图是能折成立体的平面图形。"
  - EN "Fold it and look." / ZH "折一折，看一看。"
  - EN "Opposite faces never touch." / ZH "相对的两个面不相挨。"
  - EN "Choose a bottom, fold up the sides, then close the top." / ZH "先选一个底，把四周折起来，最后盖上顶。"（S18 第 347 页的成功做法）
- 颜色只表示"谁的"：题目给的面 / 给的立体 = cold；孩子点的格子、放上的面 = signal；"看答案" = 墨色虚线；讲解拍里平的面 = cold、曲面 = hot（第 01、08 步）；相对的面 = 配对色 + ● ▲ ■（D10）；折起来后"叠在一起的两个面" = 墨色双线 + 引线小字 "2 faces here / 这里有两个面"，"空着的面" = 墨色虚线 + "nothing here / 这里空着"。不用红绿判对错。
- 口吻：平静、第二人称、先具体后术语；不用感叹号，不说 easy / wrong / 错了 / 太棒了；错误反馈 = 原因 + 下一步看哪里。

### 2.1 误解目录（新域 `nets`；§3.6 写诊断规则）

| code | 误解 | 典型表现 | 反馈要点（口吻样例） | 来源 |
|---|---|---|---|---|
| `prototype-only` | 只认得最熟悉的那种（十字形）展开图，长得不像就说不行 | "这个能折成正方体吗？"对一个合法的 2-3-1 形说"不能"；多选时漏掉不像十字的合法展开图 | "This one does not look like the cross, but fold it: choose a bottom, fold up the sides, then close the top. All 6 faces are covered." / "它不像十字形，但折一折：先选一个底，把四周折起来，最后盖上顶，6 个面都盖住了。" | S18 第 344、347 页（Mariotti 1989 转述；弱生按原型判断） |
| `overlap-unseen` | 面的个数对了就以为能折成（没看折起来会不会叠） | 选含 2 × 2 方块的六连方；补全时把第 6 个正方形放在会压到别的面的位置；棱柱的两个三角形放在同一边 | "There are 6 squares, but fold it and look: two of them land on the same face, and one face is left open." / "确实有 6 个正方形，可是折一折看：有两个叠在同一个面上，另一个面空着。" | S21 第 3 页；S18 第 347 页（"overlapping faces … missing faces"）；S24 |
| `adjacent-as-opposite` | 把在展开图里共用一条边的面当成相对的面 | 问"哪个面和涂色的面相对"，点了紧挨着它的那个 | "These two squares share an edge, so they meet when folded. Opposite faces never touch: look one square further along the row." / "这两个正方形共用一条边，折起来一定挨着。相对的两个面不相挨：沿着这一排再隔一个找。" | S21 第 4 页（对面 / 邻面专门一节，无错误率）；S35（隔一个相对） |
| `face-size` | 面的大小或形状配不上：长方体的长方形没有成对、接在一起的两条边不一样长 | 长方体展开图里少了一对相同的长方形，或放了一个太短 / 太长的长方形 | "When folded, this rectangle has to meet an edge 3 squares long, but its edge is only 2. A gap is left. Each rectangle needs a twin the same size." / "折起来，这个长方形要接一条 3 格长的边，它的边只有 2 格，留下一条缝。每个长方形都要有一个一样大的"双胞胎"。" | S8（三对相等的长方形）；S1 第 39 页 4.2 |
| `face-count` | 面数不对（5 个或 7 个正方形；棱柱少了一个底面） | 选 5 个正方形的图当正方体展开图；三棱柱展开图只有 1 个三角形 | "A cube has 6 faces, so its net needs 6 squares. This one has 5: the box would have no lid." / "正方体有 6 个面，展开图要 6 个正方形。这里只有 5 个：盒子会没有盖。" | S9（老师清单：多于或少于 6 个） |
| `prism-pyramid` | 棱柱和棱锥分不清：看到三角形就说棱锥 | 三棱柱的展开图答"棱锥"；四棱锥的展开图答"棱柱" | "Both nets have triangles, so look at what else is there. Rectangles joining two equal ends make a prism. Triangles meeting at one point make a pyramid." / "两个展开图都有三角形，看看还有什么：用长方形把两个一样的底连起来的是棱柱；三角形的尖碰在一个点上的是棱锥。" | S24（"Prism vs pyramid confusion"，教辅网站，非研究） |
| `cube-cuboid` | 正方体和长方体叫混（只看"是个盒子"） | 两端是正方形、侧面是长方形的盒子答 cube；全是正方形的答 cuboid | "Look at the faces: a cube has 6 squares all the same size. This box has rectangles on its sides, so it is a cuboid." / "看面：正方体的 6 个面是一样大的正方形。这个盒子侧面是长方形，所以是长方体。" | S1 第 34 页（P2 分开列）；本课提出的诊断 |
| `curved-unrolled` | 以为曲面摊开是别的形状：圆柱的侧面摊成圆或太短的长方形，圆锥的侧面摊成三角形 | 选"三角形 + 圆"当圆锥展开图；选长方形太短的那个当圆柱展开图 | "The curved face of a cone opens into a shape like an open fan, with a curved edge. A triangle has straight sides, so it could not wrap round the circle." / "圆锥的曲面摊开像一把打开的扇子，有一条弯的边。三角形的边是直的，绕不住那个圆。" | S8、S14（几何事实）；**本课提出的诊断，无研究出处**（调研 §3.1 第 11 条） |

诊断只认题目声明过的 code（`choose` 选项的 `misconception`、`feedback.wrong[].when`）；`complete-net` 与 `tap-face` 的码由折叠结果**算出来**（§3.6），validate 拒绝"这道题诊断不出"的码。每个 code 至少在一拍里**正面讲**（拍表里标 ⚑），至少一道题库题能诊断它（§8）。`prism-pyramid`、`cube-cuboid`、`curved-unrolled` 只由 `choose` 选项诊断。

难点的记录（不是误解码，写进正文与题目的分布）：最长一排只有 2 或 3 个、带 L 形三个一组的展开图最难（S18 第 345 页：全班正确率 26 %、43 %，十字形 100 %）；开口盒的底在一端最难（S19：155 名 8 年级学生，最难的一题 47 % 没认出）。题库里这两类至少各占三成。

### 2.2 逐步设计

拍表的列：`#` · **模型状态**（§3.2 的写法，简写）· **过渡**（`move`）· **算式**（`equation` 或 `words`）· **字幕 EN / ZH**（草稿）。第一拍不写 `move`。

简写：
- 立体：`cube` = `{ type: "cuboid", size: [1, 1, 1] }`；`box 3×2×1` = 长 3、宽 2、高 1 的长方体；`tri-prism` = `{ type: "prism", sides: 3, edge: 2, length: 3 }`；`sq-pyr` = `{ type: "pyramid", sides: 4, edge: 2, height: 1.6 }`；`tri-pyr` = `{ type: "pyramid", sides: 3, edge: 2, regular: true }`；`cyl r1 h2`、`cone r1 h2`、`sphere r1`。
- 展开图：正方体的 11 种用名字（§3.2 表）：`141-a … 141-f`、`231-a … 231-c`、`33`、`222`；其它写 `cells{(x,y)…}`、`rects{[x,y,w,h]…}`、`tree{…}`。
- 状态：`f0` / `f.5` / `f1` = `fold`；`top` / `iso` / `auto` = `view`；`↻1` = 转 90°（`turn: 1`）；`pairs` = 对面配色；`foot` = 地上画出摊平时的轮廓（墨色虚线）；`grid` = 方格纸；`dims` = 尺寸线；`mark{…}` = 给定的面（cold）；`num` = 正方形上标 1–6；`set[…]` = 一排小图。

---

#### 第 01 步 `solids-and-faces` · 立体和它的面（P2 2.1，地基）

**概念**：立体占着空间；它的每一个"边"叫面，有平的、有弯的。正方体 6 个一样大的正方形；长方体 6 个长方形，成 3 对；圆柱、圆锥有圆形的平的面和一个曲面；球只有曲面。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `set[cube, box 3×2×1, cyl, cone, sphere]` 各 `f1 iso`，图下小字名称 | — | words `5 solids` / `5 种立体` | You have met these solids before: a cube, a cuboid, a cylinder, a cone and a sphere. A solid takes up space. You can hold it and turn it round. | 这些立体你见过：正方体、长方体、圆柱、圆锥和球。立体占着空间，可以拿在手里转着看。 |
| 2 | `cube f1 iso num` | `rotate`（↻1，再 ↻1） | words `6 faces` / `6 个面` | Each flat side of a solid is a face. Turn the cube and count: top, bottom, front, back, left and right. A cube has 6 faces, all squares of the same size. | 立体上每一块平平的面叫作面。把正方体转着数：上、下、前、后、左、右。正方体有 6 个面，都是一样大的正方形。 |
| 3 ⚑ | `box 3×2×1 f1 iso pairs` | `morph` | words `6 faces · 3 pairs` / `6 个面 · 3 对` | A cuboid has 6 faces too, but they are rectangles. They come in 3 pairs: each face has a twin of the same size on the opposite side. | 长方体也有 6 个面，但面是长方形。它们成 3 对：每个面在对面都有一个一样大的。（`cube-cuboid`） |
| 4 | `set[cyl, cone, sphere]` `f1 iso`，平的面 cold、曲面 hot | `morph` | words `flat faces · curved faces` / `平的面 · 曲面` | Some faces are curved. A cylinder has 2 flat faces that are circles and 1 curved face. A cone has 1 flat circle and 1 curved face. A sphere has only a curved face. | 有的面是弯的。圆柱有 2 个圆形的平的面和 1 个曲面；圆锥有 1 个圆形的平的面和 1 个曲面；球只有一个曲面。 |

**要点**：① A face is a flat or curved side of a solid. / 面是立体上平的或弯的那一块。② A cube has 6 faces, all equal squares. / 正方体有 6 个面，都是一样大的正方形。③ A cuboid has 6 rectangle faces in 3 pairs. / 长方体有 6 个长方形的面，成 3 对。

**题库（9）**：3 道 `choose`（舞台是一个立体 `f1 iso` 可转，选项是名字 `solid: …`：长方体 ✓ / 正方体 → `cube-cuboid`；圆锥 ✓ / 棱锥 → `prism-pyramid`；圆柱 ✓）；2 道 `input`（`form: whole`：正方体几个面 → 6；长方体几个面 → 6）；2 道 `choose`（几个平的面：圆柱 2 ✓、圆锥 1 ✓）；2 道 `choose`（"哪一个是长方体"：选项是四个立体小图，含一个两端正方形的长方体 ✓ 和一个正方体 → `cube-cuboid`）。人名：Siti 整理一盒积木。

---

#### 第 02 步 `opening-a-cube` · 把正方体摊平（P4 4.1, 4.3, 4.4）

**概念**：沿着几条棱剪开、摊平，正方体变成 6 个边挨着边的正方形——这就是展开图；沿着同样的棱折回去，它又合成正方体。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `cube 141-e f1 iso` | — | words `6 faces` / `6 个面` | Imagine a cube made of card. Cut along some of its edges, and it can open out flat. | 想象一个用卡纸做的正方体。沿着几条棱剪开，它就能摊平。 |
| 2 | `cube 141-e f.5 auto foot` | `fold` | — | The faces stay joined along the edges you did not cut. Each face turns about its edge, like a door turning on its hinge. | 没剪开的棱还连着。每个面绕着自己那条棱转，像门绕着门轴转。 |
| 3 | `cube 141-e f0 top grid` | `fold` | words `6 squares` / `6 个正方形` | Flat on the table, the cube is 6 squares joined edge to edge. This flat shape is a net of the cube. | 摊平在桌上，正方体变成 6 个边挨着边的正方形。这个平面图形叫作正方体的展开图。 |
| 4 | `cube 141-e f1 auto foot` | `fold` | words `net → cube` / `展开图 → 正方体` | Fold it back along the same edges and the 6 squares close up into a cube again. A net is a flat shape that folds up into a solid. | 沿着同样的棱折回去，6 个正方形又合成正方体。展开图是能折成立体的平面图形。 |

**要点**：① A net is a flat shape that folds up into a solid. / 展开图是能折成立体的平面图形。② A net of a cube has 6 squares joined edge to edge. / 正方体的展开图是 6 个边挨着边的正方形。③ You fold along the edges. / 沿着棱折。

**题库（8）**：3 道 `choose`（舞台是展开图 `f0 top`，"它能折成哪个立体"，选项名字：cube ✓ / cuboid → `cube-cuboid` / pyramid → `prism-pyramid`；一道的展开图是 `box 2×2×1`，cuboid ✓）；2 道 `choose`（"哪一个是正方体的展开图"，选项是展开图小图：`141-e` ✓、5 个正方形 → `face-count`、7 个正方形 → `face-count`、一个立体的图画 → fallback）；1 道 `input`（"正方体的展开图有几个正方形" → 6）；2 道 `choose`（`folds`：给一个合法展开图，"能 / 不能折成正方体"；一道 `141-c` 能 ✓、"不能" → `prototype-only`）。

---

#### 第 03 步 `many-nets` · 不只一种展开图（P4 4.2, 4.3）

**概念**：沿不同的棱剪，得到不同的展开图；转一转、翻一翻还是同一种。正方体一共 11 种：中间一排 4 个的有 6 种，最长一排 3 个的有 4 种，两个两个错开的有 1 种。在脑子里试的办法：选一个底，四周折起来，最后盖上顶。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 ⚑ | `cube 141-e f0 top` | — | — | This cross is the net most people know. Is it the only one? Cut the cube along different edges and you get a different net. | 这个十字形是大家最熟悉的展开图。它是唯一的吗？沿着不同的棱剪开，就会得到不同的展开图。（`prototype-only`） |
| 2 | `cube 141-b f0→f1 auto foot` | `morph` 后 `fold` | — | Keep the row of 4 and slide the top square along to the end. It still folds into a cube: the row of 4 wraps round, and the two other squares close its two open ends. | 中间一排 4 个不动，把上面那个挪到最左边。它照样能折成正方体：一排 4 个绕一圈，另外两个盖住两头的口。 |
| 3 | `set[141-a … 141-f] f0 top` | `morph` | `6` | With a row of 4 in the middle and one square on each side, there are 6 different nets. Turning a net round or flipping it over does not make a new one. | 中间一排 4 个、两边各一个，一共有 6 种不同的展开图。把展开图转一转、翻过来，不算新的一种。 |
| 4 | `set[231-a, 231-b, 231-c, 33, 222] f0 top` | `morph` | `6 + 4 + 1 = 11` | In the other nets, the longest row has only 3 squares, or only 2. Altogether a cube has 11 different nets. | 另外几种，最长的一排只有 3 个，或者只有 2 个。正方体一共有 11 种不同的展开图。 |
| 5 | `cube 222 f0→f1 auto foot num`（按层折：底 → 四周 → 顶） | `fold` | words `bottom → sides → top` / `底 → 侧面 → 顶` | To test a net in your head, choose a bottom, fold up the sides, then close the top. This zigzag net works too. | 在脑子里试：先选一个底，把四周折起来，最后盖上顶。这个 Z 字形的展开图也行。 |

**要点**：① A cube has 11 different nets. / 正方体有 11 种不同的展开图。② Turning or flipping a net does not make a new one. / 转一转、翻一翻不算新的一种。③ Choose a bottom, fold up the sides, then close the top. / 先选一个底，把四周折起来，最后盖上顶。

**题库（9）**：3 道 `choose` `multi`（"选出所有能折成正方体的"：4–6 个小图，含 2–3 个合法的、其中至少一个不像十字（`231-*`、`33`、`222`）；漏掉它 → `prototype-only`；选了非展开图 → `overlap-unseen`）；3 道 `choose` `folds`（是 / 否：`33`、`222`、`231-c` 都是"能"，"不能"→ `prototype-only`）；3 道 `complete-net`（`candidates` 是邻格：给 5 个正方形，补第 6 个；有 2 个以上合法位置时任何一个都算对；放成重叠的 → `overlap-unseen`）。至少三成题用最长一排 2 或 3 个的展开图（S18 难点）。

---

#### 第 04 步 `fold-to-test` · 折一折，看一看（P4 4.2, 4.3）

**概念**：展开图要 6 个正方形，但 6 个正方形不一定是展开图：折起来有两个叠在同一个面上、另一个面空着，就不是。几个快速排除的记号，但不够——要确定就折一折。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 ⚑ | `cells{(0,0),(1,0),(0,1),(1,1),(2,1),(3,1)} f0 top`（含 2 × 2 方块） | — | words `6 squares` / `6 个正方形` | These are 6 squares too. Will they fold into a cube? Counting is not enough. Fold it and look. | 这也是 6 个正方形。能折成正方体吗？光数个数不够。折一折，看一看。（`overlap-unseen`） |
| 2 ⚑ | 同上 `f1 auto`，叠面墨色双线 + "2 faces here"，空面墨色虚线 + "nothing here" | `fold` | words `2 on one face · 1 face open` / `一个面上两个 · 一个面空着` | Folded up, two squares land on the same face, and one face is left open. So this shape is not a net of a cube. | 折起来以后，有两个正方形叠在同一个面上，另一个面空着。所以它不是正方体的展开图。 |
| 3 | `cells{(0,0)…(4,0),(2,1)} f0→f1`（一排 5 个） | `morph` 后 `fold` | — | Five in a row is too many. The fifth square wraps round and lands on top of the first. | 一排 5 个太多了。第 5 个绕一圈，正好压在第 1 个上。 |
| 4 | `cells{(0,0)…(3,0),(0,1),(3,1)} f0→f1`（4 个一排，两个在同一边） | `morph` 后 `fold` | — | Here both extra squares are on the same side of the row of 4. Folded, they both close the same end, and the other end stays open. | 这里两个多出来的正方形在 4 个一排的同一边。折起来，它俩盖住同一头，另一头空着。 |
| 5 | `set[2×2 方块, 一排 5 个, 同一边两个, cells{(0,0),(0,1),(0,2),(1,2),(1,3),(2,2)}] f0 top`，最后一个打 "?" | `morph` | words `fold to be sure` / `折一折才确定` | Quick signs of a non-net: a 2 by 2 block, 5 in a row, or two squares on the same side of a row of 4. Some non-nets show none of these, so fold to be sure. | 看到 2×2 的方块、一排 5 个、或者 4 个一排的同一边有两个，就不是展开图。有的不是展开图却没有这些记号，所以要折一折才确定。 |

第 5 拍最后一个图（最长一排 3 个、没有上面三个记号）是调研 `hex_check.py` 找出的"规则漏掉"的一种，舞台上 `?` 不先说答案，正文里点一下"折起来，它也有两个面叠在一起"。

**要点**：① A cube net needs 6 squares, but not every 6 squares make a net. / 正方体的展开图要 6 个正方形，但不是随便 6 个都行。② If two squares land on the same face when folded, it is not a net. / 折起来有两个正方形叠在同一个面上，就不是展开图。③ The quick signs help, but fold it to be sure. / 快速记号有用，要确定还得折一折。

**题库（10）**：4 道 `choose` `folds`（是 / 否：非展开图 3 道——含 2 × 2、同一边两个、规则漏掉的那种，"能"→ `overlap-unseen`；合法的 1 道 `231-a`，"不能"→ `prototype-only`）；2 道 `choose`（"哪一个**不是**正方体的展开图"，正确项是非展开图，错选项是合法的 → `prototype-only`）；4 道 `complete-net`（给 5 个，补第 6 个：候选里有会叠的位置 → `overlap-unseen`；其中 1 道 `candidates: "free"`、`add: 2`，在 6 × 5 方格上从 4 个画到 6 个）。

---

#### 第 05 步 `opposite-faces` · 相对的面（P4 4.3, 4.4）

**概念**：正方体有 3 对相对的面；相对的两个面不相挨。在展开图上：一排里隔一个的两个相对；共用一条边的两个一定挨着。开口的盒子：底是空着的那面对面的那个。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `cube 141-e f1 iso pairs` | — | words `3 pairs` / `3 对` | Opposite faces never touch. On a cube, the top and bottom are opposite, so are the front and back, and the left and right. | 相对的两个面不相挨。正方体的上和下相对，前和后相对，左和右相对。 |
| 2 | `cube 141-e f1→f0 auto pairs` | `fold` | words `skip one square` / `隔一个` | Unfold the cube and keep the colours. In the row of 4, squares one apart are opposite: the 1st and 3rd, the 2nd and 4th. | 把正方体展开，颜色不变。在 4 个一排里，隔一个的两个相对：第 1 和第 3，第 2 和第 4。 |
| 3 ⚑ | `cube 141-d f0 top mark{(1,1)}`，和它共边的两个格子描 cold 虚边 | `morph` | — | Squares that share an edge in the net always meet on the cube, so they can never be opposite. | 在展开图里共用一条边的两个正方形，折起来一定挨着，不可能相对。（`adjacent-as-opposite`） |
| 4 | `cube open-end（cells{(0,1),(1,1),(2,1),(3,1),(0,0)}，open） f0→f1 auto` | `morph` 后 `fold` | words `bottom = opposite the open side` / `底 = 空着那面的对面` | This net makes a box with no lid. The row of 4 wraps round as the sides, and the square at the end becomes the bottom. A bottom at the end is the hardest to spot. | 这个展开图折成没有盖的盒子。一排 4 个绕一圈当四周，尽头那个正方形当底。底在一端的最难看出来。 |

第 4 拍的"最难"出自 S19（155 名学生，最难的一题 47 % 没认出），正文写来源，字幕不写百分比。

**要点**：① Opposite faces never touch. / 相对的两个面不相挨。② In a straight row, squares one apart are opposite. / 在一排里，隔一个的两个相对。③ Squares that share an edge meet on the cube. / 共用一条边的两个面，折起来挨着。

**题库（9）**：5 道 `tap-face` `ask: "opposite"`（给定的面 cold，点相对的那个：`141-a`、`141-d`、`231-b`、`33`、`222` 各一道；点了邻格 → `adjacent-as-opposite`）；2 道 `tap-face` `ask: "bottom"`（开口盒，点底：一道底在中间、一道底在一端）；2 道 `choose`（舞台是有字母 A–F 的展开图，"哪个字母和 A 相对"，邻格字母 → `adjacent-as-opposite`）。

---

#### 第 06 步 `cuboid-nets` · 长方体的展开图（P4 4.1–4.4）

**概念**：长方体的 6 个面是 3 对一样大的长方形；展开图里每个长方形都有一个"双胞胎"，接在一起的两条边一样长；配不上就合不拢。长方体的展开图比正方体还多。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `box 3×2×1 f1 iso pairs` | — | words `3 pairs` / `3 对` | A cuboid's 6 faces are rectangles in 3 pairs: top and bottom, front and back, left and right. The two faces in a pair are the same size. | 长方体的 6 个面是 3 对长方形：上和下、前和后、左和右。每一对的两个面一样大。 |
| 2 | `box 3×2×1 rects{[1,1,3,2],[1,0,3,1],[1,3,3,1],[1,4,3,2],[0,1,1,2],[4,1,1,2]} f1→f0 auto grid pairs` | `fold` | words `6 rectangles = 3 pairs` / `6 个长方形 = 3 对` | Open it out on squared paper. The colours show the pairs: each rectangle has a twin with the same length and breadth. | 把它摊在方格纸上。同样的颜色是一对：每个长方形都有一个长、宽都一样的"双胞胎"。 |
| 3 ⚑ | 同上 `dims`，铰链边描粗、两侧标格数 | `shade` | words `3 = 3 · 2 = 2` | Rectangles that fold together must share an edge of the same length. The front, 3 by 1, meets the bottom, 3 by 2, along an edge 3 squares long. | 折在一起的两个长方形，接着的那条边要一样长。前面 3 × 1，底面 3 × 2，它们接在一条 3 格长的边上。（`face-size`） |
| 4 ⚑ | 右面换成 `[4,1,1,1]`（太短）`f0→f1 auto` | `morph` 后 `fold` | — | Swap in a rectangle that is too short, and the box cannot close. It covers only half of its side, and a gap is left. | 换一个太短的长方形，盒子就合不拢：它只盖住那一面的一半，留下一条缝。（`face-size`） |
| 5 | `set[box 3×2×1 的 3 种展开图] f0 top` | `morph` | — | Like a cube, a cuboid has many nets. Any of them works if the rectangles pair up and nothing overlaps when you fold it. | 和正方体一样，长方体也有很多种展开图。只要长方形配成对、折起来不重叠，就行。 |

`<More>`（第 5 段后）："How many? When the three lengths of a cuboid are all different, people have counted 54 different nets."（S7、S8；条件写清，不提 29）

**要点**：① A cuboid's net has 6 rectangles in 3 matching pairs. / 长方体的展开图有 6 个长方形，配成 3 对。② Edges that fold together are the same length. / 折在一起的边一样长。③ A cuboid has many nets. / 长方体有很多种展开图。

**题库（9）**：3 道 `complete-net`（`rects`，从 3–4 个候选长方形里选缺的那一块：大小对、位置对 ✓；太短 / 太长 → `face-size`；放在会叠的位置 → `overlap-unseen`）；3 道 `choose`（舞台是长方体 `f1 iso` 可转，"哪一个是它的展开图"：选项小图，错项各带 `face-size` / `overlap-unseen` / `face-count`）；2 道 `choose`（舞台是长方体展开图，"能折成什么"：cuboid ✓ / cube → `cube-cuboid`）；1 道 `input`（"缺的那个长方形长几格" → 数，`face-size` 的 sample 是相邻边的长度）。三条棱 1–4 格，至少两道题用两端是正方形的长方体（如 2 × 2 × 3）。

---

#### 第 07 步 `prisms-and-pyramids` · 棱柱和棱锥（P4 4.1–4.4）

**概念**：棱柱 = 两个一样的底 + 把它们连起来的长方形；棱锥 = 一个底 + 尖碰在一个点上的三角形。看展开图里除了三角形还有什么，就知道是哪一种。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `tri-prism f1 iso`，两个底同色（`--face-1`） | — | words `2 triangles + 3 rectangles = 5 faces` / `2 个三角形 + 3 个长方形 = 5 个面` | A prism has two ends that are the same shape and size, joined by rectangles. This triangular prism has 2 triangles and 3 rectangles: 5 faces. | 棱柱有两个形状、大小都一样的底，中间用长方形连起来。这个三棱柱有 2 个三角形、3 个长方形，一共 5 个面。 |
| 2 | `tri-prism tree{side-2 根; side-1, side-3, end-a, end-b 挂 side-2} f1→f0 auto foot` | `fold` | — | Its net is 3 rectangles side by side, with a triangle above and below the middle one. The triangles fold in to close the two ends. | 它的展开图是 3 个并排的长方形，中间那个的上边、下边各接一个三角形。三角形折进去，盖住两头。 |
| 3 | `sq-pyr f1 iso`，底 `--face-1` | `morph` | words `1 square + 4 triangles = 5 faces` / `1 个正方形 + 4 个三角形 = 5 个面` | A pyramid has one base, and triangles that all meet at one point at the top. This square pyramid has 1 square and 4 triangles: 5 faces. | 棱锥有一个底，三角形的尖都碰在顶上的一个点。这个四棱锥有 1 个正方形、4 个三角形，一共 5 个面。 |
| 4 | `sq-pyr tree{base 根; side-1…4 挂 base} f1→f0 auto foot` | `fold` | — | Its net is the square with a triangle on each edge, like a star. Fold the triangles up and their tips meet at the top. | 它的展开图是正方形每条边上接一个三角形，像一颗星。把三角形折起来，尖就在顶上碰到一起。 |
| 5 ⚑ | `set[tri-prism 展开图, tri-pyr 展开图] f0 top` | `morph` | words `prism: 2 ends + rectangles · pyramid: 1 base + triangles` / `棱柱：2 个底 + 长方形 · 棱锥：1 个底 + 三角形` | Both nets have triangles, so look at what else is there. Rectangles joining two equal ends make a prism. Triangles meeting at one point make a pyramid. | 两个展开图都有三角形，看看还有什么：用长方形把两个一样的底连起来的是棱柱；三角形的尖碰在一个点上的是棱锥。（`prism-pyramid`） |

`<More>`（第 5 段后）：一个由 4 个三角形组成的三棱锥只有 2 种展开图（S3，正四面体）；有一种牛奶盒就是三棱锥形的（S27，不写品牌名）。五棱柱、六棱柱只在第 1 拍之后的正文里各提一句（"底是五边形、六边形，侧面还是长方形"），不进题库。

**要点**：① A prism has two equal ends joined by rectangles. / 棱柱有两个一样的底，用长方形连起来。② A pyramid has one base and triangles meeting at one point. / 棱锥有一个底，三角形的尖碰在一个点上。③ Count the faces in the net: it is the same as on the solid. / 数展开图里的面，和立体上的一样多。

**题库（10）**：4 道 `choose`（舞台是展开图，"能折成什么"：prism ✓ / pyramid → `prism-pyramid`；pyramid ✓ / prism → `prism-pyramid`；一道四棱柱（侧面长方形、底面正方形但不全等于侧面）答 prism，cube → `cube-cuboid`；一道三棱锥）；2 道 `input`（展开图数面：三棱柱 5、四棱锥 5；错例 `"4"` 只数了三角形 → `face-count`）；2 道 `complete-net`（`tree` 候选：三棱柱少一个三角形，候选是"接在中间长方形的下边"✓ / "接在旁边长方形的上边"→ `overlap-unseen`；四棱锥少一个三角形，候选同理）；2 道 `choose`（舞台是立体 `f1 iso`，"哪一个是它的展开图"：错项 `face-count`（少一个底）、`prism-pyramid`、`overlap-unseen`（两个三角形在同一边））。

---

#### 第 08 步 `cylinders-and-cones` · 圆柱和圆锥（P4 4.1，只要认）

章头眉题 "Recognise only / 只要认得"（D15）。

**概念**：圆柱摊开是一个长方形和两个圆，长方形的长边正好绕圆一圈；圆锥摊开是一个圆和一个像打开的扇子的形状（扇形），扇形的弯边绕圆一圈。

| # | 模型状态 | 过渡 | 算式 | 字幕 EN | 字幕 ZH |
|---|---|---|---|---|---|
| 1 | `cyl r1 h2 f1 iso`，平的面 cold、曲面 hot | — | words `2 circles + 1 curved face` / `2 个圆 + 1 个曲面` | Now a solid with a curved face. Cut a cylinder straight down its side and most of the way round its two ends, then open it out. | 现在看有曲面的立体。把圆柱的侧面竖着剪开一刀，两个圆形的底也沿边剪开大半圈，然后摊开。 |
| 2 | `cyl f1→f0 auto foot` | `fold` | words `1 rectangle + 2 circles` / `1 个长方形 + 2 个圆` | The curved face unrolls into a rectangle. The two circles stay joined to it, one on the top edge and one on the bottom edge. | 曲面摊开成一个长方形，两个圆还连在它上面：一个在上边，一个在下边。 |
| 3 ⚑ | `cyl f0 top`，长边上画一条与圆周等长的墨色弧线展开动画（`dims` 叠加 "once round"） | `fold`（0 → .6 → 0） | words `long side = once round the circle` / `长边 = 绕圆一圈` | The long side of the rectangle wraps once round the circle. So it is exactly as long as the distance round the circle, no shorter. | 长方形的长边正好绕圆一圈，所以它和圆一圈的长度一样长，短一点都不行。（`curved-unrolled`） |
| 4 ⚑ | `cone r1 h2 f1→f0 auto foot` | `morph` 后 `fold` | words `1 circle + 1 fan shape` / `1 个圆 + 1 个扇形` | A cone opens into a circle and a shape like an open fan, not a triangle. The fan's curved edge wraps once round the circle. | 圆锥摊开是一个圆和一个像打开的扇子的形状，不是三角形。扇形那条弯的边正好绕圆一圈。（`curved-unrolled`） |
| 5 | `set[cyl f0, cone f0, tri-prism f0, sq-pyr f0] top` | `morph` | — | Now you can name a solid from its net: circles mean a cylinder or a cone; rectangles with two equal ends mean a prism; triangles meeting at a point mean a pyramid. | 现在你能看展开图说出立体了：有圆的是圆柱或圆锥；长方形连着两个一样的底的是棱柱；三角形尖碰在一起的是棱锥。 |

正文用冰淇淋蛋筒（S28：先烤成平的，再卷起来）讲第 4 拍；配图（罐头和盖子）放在第 1 段后。

**要点**：① A cylinder's net: a rectangle and 2 circles. / 圆柱的展开图：1 个长方形 + 2 个圆。② A cone's net: a circle and a fan shape. / 圆锥的展开图：1 个圆 + 1 个扇形。③ The curved part wraps once round the circle. / 弯的那部分正好绕圆一圈。

**题库（8，全部 `choose`）**：3 道"哪一个能折成圆柱"（选项小图：对的 ✓；长方形太短（`wrap: 0.7`）→ `curved-unrolled`；两个圆在同一边 → `overlap-unseen`；只有一个圆 → `face-count`）；3 道"哪一个能折成圆锥"（扇形 + 圆 ✓；三角形 + 圆 → `curved-unrolled`；扇形 + 两个圆 → `face-count`）；2 道"这个展开图能折成什么"（cylinder ✓ / prism → fallback；cone ✓ / pyramid → `curved-unrolled`）。

---

### 2.3 练习章 `practice`（8 道固定题，每题一次检查，总结页 + 再做一次）

| # | 题 | 题型 | 答案 | 回看 |
|---|---|---|---|---|
| q1 | 这个展开图（三棱柱，侧面并排、三角形在两端长方形上）能折成什么？ | `choose`（名字） | prism | `prisms-and-pyramids` |
| q2 | 这个展开图（`231-b`）能折成正方体吗？ | `choose` `folds` | 能 | `many-nets` |
| q3 | 选出所有正方体的展开图（`141-f`、`222`、2 × 2 方块的、同一边两个的、`33`） | `choose` `multi` | `141-f`、`222`、`33` | `fold-to-test` |
| q4 | 在方格上画一个正方体的展开图：已经有 1 个正方形，再点 5 个 | `complete-net` `free` `add: 5` | 任何合法展开图 | `many-nets` |
| q5 | 点和涂色的面相对的面（`141-d`，给定在一排的第 2 个） | `tap-face` `opposite` | 一排的第 4 个 | `opposite-faces` |
| q6 | 这个开口盒的展开图，哪个是底？（底在一端） | `tap-face` `bottom` | 一端的那个 | `opposite-faces` |
| q7 | 补全 `box 2×2×3` 的展开图：选缺的那个长方形 | `complete-net` `rects` | 2 × 3 那块在对的位置 | `cuboid-nets` |
| q8 | 哪一个能折成圆锥？ | `choose`（小图） | 扇形 + 圆 | `cylinders-and-cones` |

4 个 kind、7 种问法（选名字、能不能、多选、画、点对面、点底、补长方形）；skill 要求"至少 5 种题型"，本课的 kind 少是因为 `complete-net` 与 `tap-face` 各管两三种问法，在总结页按问法分行。总结页一句话："Fold it and look." / "折一折，看一看。" + 表 + "再做一次"。

---

## 3. 引擎：A8 `net`、两种新小测、`nets` 误解域

### 3.0 为什么是 MathScene（D2 详表）与本课新增（N1–N10）

| 看什么 | MathScene + A8 `net`（选） | SpaceScene（parts 当面、poses / timeline、试一试） |
|---|---|---|
| 课的形状（讲解拍 + 章末一道随机小测 + 练习 + 诊断） | 现成：题库、抽题、再来一道 / 跳过、诊断、proof、check-pool、练习总结、`pnpm shoot --tasks` | 没有：试一试卡片"不做测验"（docs/06），要从零加题库、诊断、练习，等于再造一个 MathScene |
| 任意展开图折叠 | 运行时由铰链树算：35 种六连方、孩子自己画的图都能折 | `poses` 是 parts.json 里写死的关键帧；孩子选的六连方要运行时算变换，docs/06 列为 v2 |
| 视觉语法 | docs/08「MathScene 语法」：SVG 线稿、正投影、无阴影——等轴测折叠正是正投影 | 三维材质、灯光、引线标注，数学课用不上 |
| 体积 / 性能 / iPad | 纯 SVG，≤ 50 个多边形，无 WebGL，课页不加载 three.js | three.js 分块 + R3F；对 6 块卡纸太重 |
| 以后 | `volume`（P5 单位立方体、等距方格画图）直接复用投影与排序 | — |
| 风险 | 画家算法的遮挡顺序：用两两平面测试排序 + 单测对照光线投射（§3.3） | 无此风险 |

**直接用**（docs/06）：讲解节拍、章节轴、阅读面板、抽题、练习与总结；`choose`（含 `multi`、选项带 `model`）、`input`（`whole`）；`morph`、`rotate`、`shade` 过渡；方格的画法（A4 `grid` 的格线语法）；`limits` 框架；`check-pool --topic --step`；`pnpm shoot --beats --tasks --keys --layout`。

| # | 改动 | 改哪里 | 说明 |
|---|---|---|---|
| N1 | **立体目录** | `lib/solid.ts`（新，纯函数） | `cuboid`（含正方体）、`prism`（底 3–6 边形）、`pyramid`（底 3–6 边形，`height` 或 `regular`）：顶点、面（带 id 与多边形）、面邻接（哪两个面共用哪条棱）、二面角；`cylinder`、`cone`、`sphere` 只有尺寸与面的种类 |
| N2 | **展开图几何** | `lib/net.ts`（新，纯函数） | 布局 → 铰链树；摊平时的二维位置；`fold` 时每个面的三维位置；折叠结果（合拢 / 叠面 / 空面 / 尺寸不配）；平面重叠检查；正方体 11 种的名字表 |
| N3 | **投影与遮挡** | `lib/project.ts`（新，纯函数） | 俯视 / 等轴测 / 自动视角、转 90°、正投影、背面判断、两两平面测试的绘制顺序、按动画全程算的固定缩放 |
| N4 | **曲面卷起** | `lib/curved.ts`（新，纯函数） | 圆柱侧面按半径 r / t 卷、圆锥按展开角卷（§3.3）；两端的圆绕切线转；`wrap ≠ 1` 时合不拢 |
| N5 | **舞台** | `stage/NetModel.tsx` + `stage/net/{Faces,Candidates,Labels,SolidSet}.tsx`（新）；`stage/BeatModel.tsx`、`stage/OptionGrid.tsx`（改） | 画面、过渡、`set`、选项小图、候选格子与可点的面、叠面 / 空面标注 |
| N6 | **数据格式** | `schema.ts`（改）、`validate-nets.ts`（新）、`validate.ts`（改） | 模型 `net`、两种新任务、`choose` 选项的 `solid` / `folds`、`limits.solids`、`MODEL_VIEWS` 加 `net`、`NETS_CODES` |
| N7 | **新小测** `complete-net`、`tap-face` | `lib/net-tasks.ts`（新）、`tray/NetControls.tsx`（新）、`lib/{check,solve,proof,lesson}.ts`（注册） | 状态、动作、检查、解法、错例、算式行 |
| N8 | **诊断** | `lib/diagnose/nets.ts`（新） | §3.6 |
| N9 | **HUD 与无障碍** | `hud/cards/SolidCard.tsx`（新）+ 注册表、`hud/plate.ts`（改）、`lib/net-description.ts`（新）、`math-scene.css`、`src/theme/tokens.css`（`--face-1/2/3`，两套主题） | §3.7 |
| N10 | **自证、截图、文档、示例主题** | `tests/math-scene/{solid,net,project,curved,net-tasks,diagnose-nets,sample-lesson-nets}.test.ts`、`tests/theme/face-colors.test.ts`、`src/content/topics/sample-lesson-nets/**`（draft）、`tests-e2e/sample-lesson-nets.spec.ts`、docs/06 新一节「展开图与立体（A8）」 | 同 docs/32 M12 |

不变的：章节轴、阅读面板顺序（章头 → 节拍行 → 小测托盘 → 正文 → 本章索引）、抽题与"再来一道 / 跳过"、练习与总结页、URL 只有 `ch` / `b` / `model`、答案与抽到的题不进 URL 和存储。**不加依赖、不改 `package.json`**。

### 3.1 N1 立体目录（`lib/solid.ts`）

```ts
type SolidSpec =
  | { type: 'cuboid'; size: [number, number, number] }            // 长 × 宽 × 高（格）；三个相等 = 正方体
  | { type: 'prism'; sides: 3|4|5|6; edge: number; length: number } // 正多边形的底
  | { type: 'pyramid'; sides: 3|4|5|6; edge: number; height?: number; regular?: boolean } // regular 只用于 sides 3（正四面体）
  | { type: 'cylinder'; radius: number; height: number }
  | { type: 'cone'; radius: number; height: number }
  | { type: 'sphere'; radius: number };
solid(spec) → { vertices: Vec3[]; faces: { id: string; poly: number[]; kind: 'flat' }[]; adjacency: Map<faceId, { face: faceId; edge: [number, number]; dihedral: number }[]> }
solidClass(spec) → 'cube' | 'cuboid' | 'prism' | 'pyramid' | 'cylinder' | 'cone' | 'sphere'
```

面 id：长方体 `bottom` `top` `front` `back` `left` `right`；棱柱 `end-a` `end-b` `side-1…n`；棱锥 `base` `side-1…n`。四棱柱的底是正方形（`edge` = 底边，`length` = 高）；**四棱柱与 `cuboid` 尺寸相同时 validate 报"写成 cuboid"**，避免同一个立体两种叫法（D9）。单测：每种立体 V − E + F = 2（只作几何自检，不进课）、长方体二面角全是 90°、三棱柱侧面之间 60°（折角 120°）、正四面体二面角 arccos(1/3)。

### 3.2 N2 / N5 / N6 模型 A8 `net`

```jsonc
{ "kind": "net",
  "solid": { "type": "cuboid", "size": [3, 2, 1] },     // §3.1
  "layout":                                             // 多面体四选一；曲面体写 curved
      { "cubeNet": "231-b" }                            // 正方体 11 种的名字（下表）
    | { "cells": [[0,1],[1,1],[2,1],[3,1],[1,2],[1,0]] } // 单位正方形（只配 1×1×1），y 向上，同 A4 方格
    | { "rects": [[1,1,3,2],[1,0,3,1], …] }             // 方格上的长方形 [x, y, w, h]（配 cuboid）
    | { "tree": [["side-2", null], ["side-1", "side-2"], ["end-a", "side-2"], …] },  // [面, 挂在哪个面上]
  "curved": { "caps": [0.5, 0.5], "wrap": 1, "lateral": "sector" },   // 圆柱 / 圆锥：两个圆接在长边的位置（0–1）、侧面长度倍数、圆锥侧面 sector | triangle（只用于错选项，不能折）
  "base": [1, 1] | "side-2",            // 留在地上的面（缺省：cells / rects 取邻居最多的，tree 取根）
  "open": "top",                        // 故意不要的面（开口盒）：折完那里空着，不算"空面"
  "fold": 0.5 | { "3": 1, "5": 0.5 },   // 0 = 摊平，1 = 合拢；按节点给 = 分步折
  "stagger": true,                      // 缺省 true：按树的层次先后折（底 → 四周 → 顶，S18 的做法）
  "view": "auto" | "top" | "iso", "turn": 0,       // auto：fold 0 俯视、≥ 0.25 等轴测，中间缓动；turn 0–3 = 绕竖轴 90° 的倍数
  "pairs": true,                        // 相对的面配色 + ● ▲ ■（cuboid、棱柱的两个底）
  "tone": { "[1,1]": "cold" },          // 单个面的颜色（cold / hot / signal），键是格子、长方形序号或面 id
  "mark": "[1,1]", "letters": true, "numbers": true,   // 给定的面（cold）；A–F 字母；1–6 编号
  "footprint": true, "grid": true, "dims": true,       // 地上的摊平轮廓（墨色虚线）；方格纸；尺寸线（格数）
  "labels": { "bottom": { "en": "bottom", "zh": "底" } },
  "set": [ { "solid": …, "layout": …, "fold": 0, "label": { … } } ]   // 2–7 个小图排一排（第 01、03、04、07、08 步）
}
```

**正方体 11 种的名字**（`lib/net.ts CUBE_NETS`；y 向上，一排 4 个时那一排在 y = 1，x = 0–3；单测证明 11 个互不相同、都能折、与 35 种六连方里能折的 11 种一一对应）：

| 名字 | 格子 | 说明 |
|---|---|---|
| `141-a` | 一排 + (0,2) + (0,0) | 上下两个都在第 1 格 |
| `141-b` | 一排 + (1,2) + (0,0) | |
| `141-c` | 一排 + (2,2) + (0,0) | |
| `141-d` | 一排 + (3,2) + (0,0) | Z 形 |
| `141-e` | 一排 + (1,2) + (1,0) | 十字形（首页图） |
| `141-f` | 一排 + (2,2) + (1,0) | |
| `231-a` | (0,0) (1,0) (1,1) (2,1) (3,1) (1,2) | 2-3-1 |
| `231-b` | (0,0) (1,0) (1,1) (2,1) (3,1) (2,2) | |
| `231-c` | (0,0) (1,0) (1,1) (2,1) (3,1) (3,2) | |
| `33` | (0,0) (1,0) (2,0) (2,1) (3,1) (4,1) | 两排 3 个错开 |
| `222` | (0,0) (1,0) (1,1) (2,1) (2,2) (3,2) | 阶梯（Z 字） |

**几何**（`lib/net.ts`）：
- **布局 → 铰链树**：`cells` / `rects` 从 `base` 广度优先，邻接 = 共用一段长度 > 0 的边，铰链 = 共用的那一段；每个节点按"滚动"（`hex_check.py` 的 roll）得到它要变成的立体面；`rects` 的长、宽与那个面不符记 `sizeMismatch`（照折，只是盖不满或伸出去）。`tree` 直接给面与父面，两面必须在立体里共用一条棱（validate），同一个面可以出现两次（第二次是"多出来的一块"，用来做非展开图的错选项）。
- **摊平**：根面放在 z = 0 平面；子面沿共用棱翻到父面的另一侧（等距变换），得到每个节点的二维多边形。`flatOverlap`：摊平后两两多边形内部相交（分离轴），validate 拒绝摊平就重叠的图。
- **折**：节点的折角 = `fold_i` × (180° − 二面角)（`cells` / `rects` 一律 90°），朝 +z 折；`stagger` 时第 d 层在 [ (d−1)/D, d/D ] 里从 0 到 1（相邻层重叠一半，看起来连续）。变换沿树相乘。
- **折叠结果** `foldResult(net)` → `{ closes, covered: faceId[], overlaps: [nodeA, nodeB][], missing: faceId[], sizeMismatch: node[], opposite(node) → node | null }`：`closes` = 每个立体面恰好被一个节点盖住（除 `open`）、无 `sizeMismatch`。**判断全部按"每个节点变成哪个面"算**，单测再用 fold = 1 时的顶点坐标核一遍（叠面的两个节点顶点重合，误差 < 1e-9）。
- **单测复现调研**（`tests/math-scene/net.test.ts`）：35 种六连方 → 11 种能折、24 种不能，其中 8 种含 2 × 2、4 种一排 ≥ 5、12 种只因重叠（调研 §2.2）；长方体所有 384 种生成树展开、按旋转 / 翻转去重：1 × 1 × 1 → 11、1 × 1 × 2 → 29、2 × 3 × 4 → 54，均无平面重叠（`box_nets.py`）；正四面体 → 2；每个 `CUBE_NETS` 的对面配对与 `hex_check.py` 一致（例：`141-e` 的 (0,1)–(2,1)、(1,1)–(3,1)、(1,0)–(1,2)）。

**画面**（`stage/NetModel.tsx`，技术图版语法）：面 = 纸色填充 + 1 px 墨色发丝线；铰链在摊平时是同一条线，不画虚线（课本的画法）；`pairs` 的面 = 配对色 25 % 填充 + 记号 ● ▲ ■ 印在面中心（折起来后在可见面上照样印）；面的背面（卡纸里侧）同色、填充减到 60 %，折到一半时分得清里外；`grid` 方格线同 A4（ink 18 %）；`footprint` = 摊平轮廓画在地面（墨色虚线）；`dims` 照标尺语法（延长线、两端箭头、格数居中）。叠面：两个面沿法线各外移 2 %、墨色双线，引线小字 "2 faces here / 这里有两个面"；空面：立体那一面的位置画墨色虚线框 + "nothing here / 这里空着"（`open` 的面不标）。球 = 圆 + 一条赤道椭圆（只能 `fold: 1`）。`set` 等分舞台宽，每格下方印 `label`。选项小图（`OptionGrid`）用同一个组件，最小 120 × 120 px，`top` 视角、只画轮廓与 `pairs`。

### 3.3 N3 / N4 投影、遮挡、曲面

- **视角**：正投影；`iso` = 偏航 45°、俯角 35.264°（真等轴测，以后与 P5 等距方格对得上）；`top` = 俯角 90°；`auto` = 由 `fold` 决定（≤ 0 俯视、≥ 0.25 等轴测，smoothstep）；`turn` 每格 90°。
- **遮挡**：面都是凸多边形；每帧对 ≤ 50 个面做两两"平面一侧"测试（A 整个在 B 的平面背向观察者一侧 → 先画 A），拓扑排序，有环时按面心深度兜底。**单测**（`project.test.ts`）：11 种正方体展开图、3 种长方体展开图、三棱柱、四棱锥、正四面体的 2 种，在 fold ∈ {0.25, 0.5, 0.75, 1}、turn 0–3 下，舞台上 64 × 64 个采样点：画家顺序里最后盖住该点的面 = 光线投射最近的面。
- **缩放**：一次过渡开始时取起止两态与中间 8 个采样态的投影包围盒的并集，过渡全程不变（不抖）。
- **曲面**（`lib/curved.ts`）：圆柱侧面是 2πr × h 的长方形，切成 48 条；卷到 t 时，离接圆处（`caps`）弧长 s 的点在半径 R = r / t 的圆柱上，角度 s / R；t = 0 平，t = 1 合拢。两端的圆是 64 边形，接在长边的 `caps` 位置，绕那里的切线转 90° × t。圆锥侧面是半径 l（母线）、圆心角 θ = 2πr / l 的扇形，切成 48 条；卷到 t 时，铺在展开角 Φ = 2π − t(2π − θ) 的圆锥上（sin 半顶角 = Φ / 2π）；底圆接在弧的中点。`wrap ≠ 1`（长方形或扇形长度乘这个数）时 t = 1 合不拢，缝隙照画。`lateral: "triangle"` 只能 `fold: 0`（validate）。单测：t = 1 时圆柱首尾两条边重合、扇形两条半径重合；t = 0 时全部在 z = 0；`wrap: 0.7` 时缝隙 = 0.3 × 2πr。

### 3.4 N5 过渡（都 ≤ 900 ms，`prefers-reduced-motion` 时直接到位）

- **`fold`**（复用分数课的名字，按模型种类分派）：同一个立体、同一个布局之间换拍**不重挂载**，各节点的折角从上一拍插值到这一拍（可以折起，也可以展开）；`view: auto` 跟着走。
- **`rotate`**（复用阵列课的名字）：`turn` 变化时绕竖轴转。
- **`morph`**：换布局 / 换立体 / 进出 `set`，淡出淡入。
- **`shade`**：`pairs`、`tone`、`dims` 出现。
- 不新增过渡名。

### 3.5 N7 小测类型（`lib/net-tasks.ts`，括号里是 `sample` 写法）

- **`complete-net`** `{ model: net（缺几个面的展开图）, add: 1–5, candidates: "free" | "adjacent" | [格 | 长方形 | [面, 挂在哪个面]] }`：舞台 `top` 视角；候选位置画成墨色虚线框 + 小 "+"，每个都是 ≥ 44 px 的按钮（`aria-pressed`），点了变 signal 填充，再点拿掉；`free` = 方格（`box: [cols, rows]`，≤ 12 × 10）里任何空格都能点，`adjacent` = 与现有面共边的空格。托盘："撤销"、"清空"、计数 `3 / 5`。**检查 = 把孩子的图折一遍**（舞台播放 fold 0 → 1，再停在折好的样子 1.5 s 后展开）：`closes` → 对；否则按 §3.6 诊断，叠面 / 空面 / 缝照画。答案不唯一：只要合拢就对（第 03、04 步常有 2–3 个对的位置）。`solve()` = 在候选里搜一组能合拢的（`free` 时取包含已有格子的第一个 `CUBE_NETS` 摆法）。（`"cells:3,1"`、`"cells:3,1;4,2"`、`"rects:2"`、`"faces:1"` = 候选序号）
- **`tap-face`** `{ model: net（`mark` 给定的面）, ask: "opposite" | "bottom" }`：舞台 `top`；每个面是按钮（方向键在面之间按网格移、Enter 选）；`opposite` = 点和 `mark` 相对的面，`bottom` = 开口盒的底（`open` 那面的对面）。validate 证明答案唯一。检查对了舞台折起来、配对色亮出这一对。（`"face:2,1"`、`"face:end-a"`）
- **`choose` 的展开图选项**：选项 `model` 可以是 `net`；选项新字段 **`solid`**（这个选项说的立体名：`cube` … `sphere`，没有 `text` 时自动用名字）、**`folds`**（这个选项说"能 / 不能折成舞台上 / 题目说的立体"）。validate 用几何核对每个选项的 `correct`（§3.8）。
- **"折一折"工具**（`tray/NetControls.tsx`）：讲解拍里舞台右下角一直有 FOLD 滑块（`role="slider"`，← → 一次 10 %，Home / End，`aria-valuetext` "folded 50 % / 折了一半"）和 ↺ ↻ 两个按钮；换拍复原，不进 URL。小测里滑块默认**锁着**：`choose`、`tap-face` 第一次检查之后或第二级提示时解锁（`complete-net` 本来就是检查时折）；练习里不解锁；"看答案"一律播放折叠。↺ ↻ 在小测里一直可用（转不泄露答案）。
- **算式行**：`complete-net` 是 `6 faces?` → 孩子放的个数 `5 + 1 = 6` → 检查后 `closes` / `2 on one face`；`tap-face` 是 `? opposite ●`；不先说答案。

### 3.6 N8 诊断规则（`lib/diagnose/nets.ts`，纯函数，每条 ≥ 2 正例 1 反例）

记号：R = 孩子的图折出来的 `foldResult`，T = 目标立体。

| code | 规则 |
|---|---|
| `overlap-unseen` | `complete-net`：面数对，`R.overlaps.length > 0`。`choose`：错选项的展开图面数 = T 的面数且有叠面（validate 核）；`folds` 题孩子说"能"而 `R.overlaps` 非空 |
| `face-size` | `complete-net`：`R.sizeMismatch` 非空（优先于 `overlap-unseen`）。`choose`：错选项 `sizeMismatch` 非空；`input` 的 sample 等于相邻边的长度 |
| `face-count` | `choose`：错选项的面数 ≠ T 的面数（含 `wrap` 正常但少一个圆）；`input`：答案 = 只数某一种形状的个数 |
| `adjacent-as-opposite` | `tap-face opposite`：点的面与 `mark` 在立体里共棱；`choose`：字母选项对应的面与 A 共棱 |
| `prototype-only` | `folds` 题：展开图合拢、孩子说"不能"、且它不是 `141-e`；`multi`：漏选的对项是合拢的、不是 `141-e`（沿用 `choose` "对项被漏 = 它的码"的语义） |
| `prism-pyramid` / `cube-cuboid` / `curved-unrolled` | 只由 `choose` 错选项声明；validate 核：`prism-pyramid` 的选项立体类与 T 一个是棱柱一个是棱锥（或圆锥对棱锥）；`cube-cuboid` 一个是正方体一个是长方体；`curved-unrolled` 的选项是 `lateral: triangle` 或 `wrap ≠ 1`，或名字是棱锥而 T 是圆锥 |

一道题按自己的域诊断（`schema.ts` 按域登记 `NETS_CODES`，同 docs/29 X6）；validate 拒绝别的域的码和"这道题诊断不出"的码；两条规则同时命中时 `check-pool` 报 WARN，优先级 `face-size` > `face-count` > `overlap-unseen`。

### 3.7 N9 右上卡、PLATE、VIEW、无障碍、背景章

- **右上卡 SOLID / 立体**（`hud/cards/SolidCard.tsx`）：讲解拍 = 立体名、面数（`6 faces · 6 squares` / `5 faces · 2 triangles · 3 rectangles`；曲面体写 `2 flat faces · 1 curved face`）、FOLD 百分比；折到 1 时一行状态 "closes / 合拢" 或 "2 faces on one · 1 open / 两个叠在一起 · 一个空着"。小测只给题目给的：名字是题目问的就写 `?`；面数只在孩子放完 / 检查后给；"能不能折"在检查前从不显示。
- **PLATE 行**（`hud/plate.ts netPlateRows`）：MODEL NET · SOLID · FACES · FOLD · VIEW（TOP / ISO / ISO ↻90 …）；`complete-net` 加 PLACED `3 / 5`；问名字的题 SOLID 是 `?`。
- **VIEW 组**：`MODEL_VIEWS` 加 `net`；小测里只有这一个视图（不给"折起来"的视图，那会泄露答案）。
- **键**：C 检查、I 提示、U 撤销照旧；FOLD 滑块与 ↺ ↻ 是普通可聚焦控件，不占全局键（← → 仍是换章）。
- **读屏**（`lib/net-description.ts`）：展开图读成形状，不说能不能折："6 squares: a row of 4; one square above the 2nd; one below the 3rd." /「6 个正方形：一排 4 个；第 2 个上面一个，第 3 个下面一个。」长方形写尺寸，三角形写"接在长方形的上边"；立体读名字与面数（问名字的题不读名字）。叠面 / 空面的引线文字也进 `aria`。
- **token**：`--face-1/2/3`（paper 与 cinema 两套）：与 `--signal`、`--cold`、`--hot` 及彼此在正常视觉与三种色觉缺陷模拟下 ΔE*ab ≥ 10，对底色 ≥ 3:1（`face-colors.test.ts`，照 `energy-colors.test.ts`）；记号 ● ▲ ■ 保证灰度下也分得开。
- **背景章**：舞台标本 = `141-e` 折到 0.5、`iso`，状态行 `SPECIMEN CUBE NET · FOLD 50 %`；规格表一行 SOLIDS（cube · cuboid · prism · pyramid · cylinder · cone · sphere）。
- **`__atlas.engine`** 加 `net()` → `{ fold, view, turn, result: { closes, overlaps, missing } }`、`setFold(t)`（截过程中的一帧）；`pnpm shoot --tasks` 走既有的 `goToTask → answer(code) → solve()`。

### 3.8 N6 校验与单测

- **validate**（`validate-nets.ts`，与 `check-pool` 共用 `taskIssues`）：立体参数在范围内（`cuboid` 每边 1–4、`prism` / `pyramid` 3–6 边）；`cells` 只配 1 × 1 × 1、`rects` 只配 `cuboid`、连通、在 `grid` 范围内；`tree` 每对共棱；摊平不重叠；`cubeNet` 名字存在；`open` 是立体的面；`sphere`、`lateral: triangle` 只能 `fold: 0`（三角形）/ `1`（球）；**`choose` 的几何核对**：带 `model: net` 的选项，`correct` ⇔ 折起来合拢且立体与题目的立体全等（同类同尺寸，可转可翻）；带 `solid` 的选项，`correct` ⇔ 名字 = 舞台展开图的 `solidClass`；带 `folds` 的选项，`correct` ⇔ 说法 = 舞台展开图是否合拢；错选项的 `misconception` 符合 §3.6；`complete-net` 至少有一组候选能合拢、起点不已经合拢、每个 `sample` 诊断成声明的码；`tap-face` 答案唯一；**曲面体不能用 `complete-net` / `tap-face`**（D3）；`limits.solids`（每步允许的立体类）。
- **单测**：`solid.test.ts`（§3.1）；`net.test.ts`（§3.2 复现调研、摊平、折叠结果、`stagger` 的层次）；`project.test.ts`（§3.3 遮挡对照光线投射、缩放不抖）；`curved.test.ts`（§3.3）；`net-tasks.test.ts`（两种新题的状态、动作、检查、解法、`sampleState`）；`diagnose-nets.test.ts`（§3.6 每条 ≥ 2 正例 1 反例，优先级）；`sample-lesson-nets.test.ts`（示例课全部自证）；`face-colors.test.ts`；以后课的 `nets-and-solids-lesson.test.ts`（每道题自证、`limits`、每个 ⚑ 码有题能诊断）。
- **示例主题** `sample-lesson-nets`（`status: draft`，占位数据）：两步 16 道——第 1 步正方体 / 六连方（`complete-net` 三种候选、`tap-face` 两种 ask、`choose` 的 `folds` / `multi` / 选项小图），第 2 步长方体、棱柱、棱锥、圆柱、圆锥各一拍（每种过渡、`set`、`pairs`、`dims`、`footprint` 各用一次）；e2e 覆盖 FOLD 滑块纯键盘、↺ ↻、点候选、点面、检查时的折叠、看答案、390 × 844。

---

## 4. 名词表（`glossary.json`，16 个）

| id | EN | ZH | 定义要点（1–2 句 + 例子） |
|---|---|---|---|
| `solid` | solid, 3D shape | 立体图形（立体） | 占着空间、可以拿在手里转着看的形状。正方体、圆柱都是立体。 |
| `face` | face | 面 | 立体上平的或弯的一块。正方体有 6 个面。 |
| `flat-face` | flat face | 平的面 | 平平的面，可以平放在桌上。圆柱有 2 个圆形的平的面。 |
| `curved-face` | curved face | 曲面 | 弯的面，放在桌上会滚。球只有一个曲面。（本课把圆柱、圆锥弯的那部分算作 1 个曲面） |
| `edge` | edge | 棱 | 两个面相接的那条线。展开图就是沿着棱折起来的。 |
| `vertex` | vertex, corner | 顶点 | 几条棱碰在一起的点。棱锥的三角形尖碰在顶上的一个顶点。（本课不数顶点） |
| `net` | net | 展开图 | 能折成立体的平面图形。正方体的展开图是 6 个边挨着边的正方形，一共有 11 种。 |
| `cube` | cube | 正方体 | 6 个面都是一样大的正方形的立体。骰子的形状。 |
| `cuboid` | cuboid | 长方体 | 6 个面都是长方形（也可以有一对正方形）的立体，面成 3 对。牛奶盒、纸盒。 |
| `prism` | prism | 棱柱 | 两个一样的底，用长方形连起来的立体。三棱柱的底是三角形。 |
| `pyramid` | pyramid | 棱锥 | 一个底，加上尖碰在一个点上的三角形。四棱锥的底是正方形。 |
| `cylinder` | cylinder | 圆柱 | 两个一样的圆用一个曲面连起来。罐头的形状；展开图是一个长方形和两个圆。 |
| `cone` | cone | 圆锥 | 一个圆和一个收到尖上的曲面。冰淇淋蛋筒的形状；展开图是一个圆和一个扇形。 |
| `sphere` | sphere | 球 | 只有一个曲面的立体，没有展开图。 |
| `opposite-faces` | opposite faces | 相对的面 | 立体上正对着、互不相挨的两个面。正方体的上面和下面相对。 |
| `base` | base | 底面（底） | 立体放在桌上时贴着桌面的那个面；棱柱有两个底，棱锥有一个底。 |

---

## 5. 写作规则与术语

### 5.1 口吻样例
- 讲解："Fold it and look: two squares land on the same face." / "折一折，看一看：有两个正方形叠在同一个面上。"
- 提示（三级）：① "Choose one square as the bottom." / "先选一个正方形当底。" ② "Fold the squares next to it up. Where does the last one go?" / "把挨着它的折起来。最后一个落在哪？" ③ （小测解锁 FOLD）"Use the FOLD slider to watch it fold." / "用 FOLD 滑块看它折起来。"
- 反馈（错）：说原因 + 下一步，见 §2.1；（对）"Yes. All 6 faces are covered once." / "对。6 个面都正好盖住一次。"

### 5.2 术语（MOE 英文 · 中文 · 备注）

| EN（MOE / 本课） | ZH | 备注 |
|---|---|---|
| 3D shape / solid | 立体图形 / 立体 | P2 课纲写 3D shapes；正文多用 solid |
| cube · cuboid | 正方体 · 长方体 | 仓库已用；新加坡华文用法未核（§0.1-2）；不写立方体 |
| cylinder · cone · sphere | 圆柱 · 圆锥 · 球 | 不写"圆柱体""圆锥体""球体"（S30 的香港写法带"体"，口语可接受，课内统一不带） |
| prism · pyramid | 棱柱 · 棱锥 | 香港写角柱 / 角锥（S30）；三棱柱、四棱锥、三棱锥只作描述，命名题只考 prism / pyramid |
| net | 展开图 | HKIEd 课堂也说"摺纸图样"（S21），不用 |
| face · flat face · curved face | 面 · 平的面 · 曲面 | D8 |
| edge · vertex | 棱 · 顶点 | D7：棱只当"折的线"，顶点不数 |
| opposite · share an edge | 相对 · 共用一条边（挨着） | 不用"对面 / 邻面"作术语（S21 用），正文可以口语说"对面" |
| sector | 扇形 | EN 字幕说 "a shape like an open fan"，名词表附 sector |
| row of 4 | 4 个一排 | 固定说法 |

### 5.3 数字与情境
D6、D11、D14。人名多族群；无品牌、无价格；同一物体全课 ≤ 3 次；纸盒、罐头、蛋筒是泛指，不说任何具体产品的尺寸或做法（S28 只支持"蛋筒是烤平再卷"这一句）。

---

## 6. 图（只用已有的三张，不新画）

`art/planned/nets-and-solids/` 的三张都是 Codex 早先按 `STYLE_BRIEF` 画的石墨铅笔图（`art/planned/manifest.jsonl` 有提示词与自查记录），主会话本次逐张看过：

| 文件 | 画面 | 结论 | 用在 |
|---|---|---|---|
| `nets-and-solids.png`（1024²，透明底） | 十字形正方体展开图：竖排 4 个，第 2 个左右各一个（= `141-e`），6 个正方形等大，格内交叉排线 | **用作首页图**。几何是合法展开图，无字、无数、无品牌。注意它是"最熟悉的那一种"（第 03 步正要说"不只这一种"），首页图用熟悉的形状没问题，alt 写 "one of the 11 nets of a cube" | `topic.yaml` `illustration: nets-and-solids` |
| `nets-and-solids-open-carton.png`（1536 × 1152） | 两端正方形的竖长纸盒，盖子沿后上棱翻开，看得见盒内 | **用作配图**。正好是"面沿着棱转"和"长方体的一对正方形"（盖 = 底一样大），无字无牌子 | 第 06 章 `cuboid-nets`，第一段后 |
| `nets-and-solids-cylinder-faces.png`（1536 × 1152） | 空罐头 + 立在旁边的圆盖，侧面直、上口是椭圆 | **用作配图**。讲"一个曲面 + 两个圆"（底还连在罐上、盖在旁边），无字无牌子 | 第 08 章 `cylinders-and-cones`，第一段后 |

入库（主会话，阶段 0）：`pnpm tsx scripts/illustrate.ts process art/planned/nets-and-solids/nets-and-solids.png nets-and-solids`（→ `public/illustrations/nets-and-solids{,@2x}.webp` + 覆盖遮罩）；`pnpm tsx scripts/illustrate.ts figure art/planned/nets-and-solids/nets-and-solids-open-carton.png nets-and-solids-open-carton`；`… figure …cylinder-faces.png nets-and-solids-cylinder-faces`。用法 `<Figure src="figures/nets-and-solids-…" alt={{…}} caption={{…}} />`，alt / caption 双语、按画面写：

- 纸盒：alt "A tall paper box with square ends, its square lid turned open about one top edge." / "一个两端是正方形的高纸盒，正方形的盖子绕着上面的一条棱翻开。" caption "The lid turns about an edge, like every face of a net." / "盖子绕着一条棱转，展开图的每个面都是这样折的。"
- 罐头：alt "An empty tin standing upright, with its round lid standing on edge beside it." / "一个立着的空罐头，圆盖竖着靠在旁边。" caption "A curved face and two flat circles: the bottom, and the lid beside it." / "一个曲面加两个平的圆：罐底，和旁边的盖子。"

没有第三张配图，也不需要：其余章的画面由舞台的折叠负责。

---

## 7. 施工顺序与分工（照 skill `build-order.md`；依赖由主会话预装，本课**不需要新依赖**；子代理不改 `package.json`、不提交；**不用 Codex**）

| 阶段 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | 建 `src/content/topics/nets-and-solids/{chapters,data}`、`topic.yaml`（`engine: math-scene`、`stage: svg`、`mode: lesson`、`status: draft`、`illustration: nets-and-solids`）；三张图入库（§6）；docs/17 §7 A8 一行改成"SVG 正投影（docs/39 §3）" | `topic.yaml`、`public/illustrations/**`、`src/lib/illustrations.json`、docs/17 | 本文定稿 | S |
| 1 | E-net（Opus） | N1–N10：立体目录、展开图几何（含复现 11 / 35、54 / 29 / 11 的单测）、投影与遮挡、曲面、`NetModel` 与过渡、`complete-net` / `tap-face` / `choose` 选项几何、`nets` 域、SOLID 卡、PLATE、FOLD 滑块、读屏描述、`--face-*` token、validate、单测、示例主题 `sample-lesson-nets` + e2e、docs/06 新一节 | `src/engines/math-scene/lib/{solid,net,project,curved,net-tasks,net-description}.ts`、`lib/diagnose/nets.ts`、`lib/{check,solve,proof,lesson}.ts`、`stage/NetModel.tsx`、`stage/net/*`、`stage/{BeatModel,OptionGrid}.tsx`、`tray/NetControls.tsx`、`tray/Tray.tsx`（注册）、`hud/cards/SolidCard.tsx` + 注册表、`hud/plate.ts`、`schema.ts`、`validate.ts`、`validate-nets.ts`、`math-scene.css`、`src/theme/tokens.css`、`tests/math-scene/{solid,net,project,curved,net-tasks,diagnose-nets,sample-lesson-nets}.test.ts`、`tests/theme/face-colors.test.ts`、`src/content/topics/sample-lesson-nets/**`、`tests-e2e/sample-lesson-nets.spec.ts`、docs/06 | 0 | L（约 2 天） |
| 2 | L（Opus） | `lesson.json`：`syllabus`（§1.1 原文，id `p2-3d-shapes`、`p4-nets-2d-identify`、`p4-nets-2d-draw`、`p4-nets-identify`、`p4-nets-solid`）、8 步 × 4–5 拍（37 拍，按 §2.2）、`keyFacts`、`limits`、`views`、每步 1–2 道样板题、练习 8 题；`pnpm shoot nets-and-solids --beats` 逐张看（重点：折到一半的遮挡、`auto` 视角、`set` 小图） | `data/lesson.json` | 1 | M |
| 3 | Sonnet ×（≤ 4 并行，各管 2 步） | 每步题库其余 6–8 道（约 55 道），brief 照 `references/codex-pool-brief.md` 改写给 Sonnet：A8 写法、两种新题型与 `sample` 记号、`choose` 的 `solid` / `folds` / 选项小图、§2.1 的码、§2.2 每步的分布、D14 情境与人名；**每份草稿 `pnpm tsx scripts/math/check-pool.ts <draft> --topic nets-and-solids --step <id>` 到 0 错 0 WARN 才交** | `scripts/math/drafts/nets-*.json`（不进 git） | 2 | M |
| 3′ | Sonnet | 8 章 + 00 + 练习章英文正文初稿（`codex-text-brief.md` 改写给 Sonnet；固定说法照 §2.0；EN 250–350 词；每拍一个 `<Beat n>`；最后一句一个 `<Task>`） | `scripts/math/drafts/text-nets-NN.en.mdx` | 2 | M |
| 4 | T（Opus） | 合并题库（审题意、删超纲：曲面体不出画 / 点面题、不数棱和顶点、不出表面积；改中文）；定稿英文正文；**写中文正文**（ZH 400–550 字，术语照 §5.2，固定说法全课一致）；名词表、`sources.json`（§9 之前的来源表，S 编号沿用调研）、`SOURCES.md`；配图 alt / caption | `data/{lesson,glossary,sources}.json`、`data/SOURCES.md`、`chapters/*.mdx` | 3、3′ | M |
| 5 | P（Sonnet） | 截图 QA 与 e2e：`pnpm shoot nets-and-solids --beats --tasks --keys --layout --locale en,zh --theme paper,cinema` 逐张看；`tests-e2e/nets-and-solids.spec.ts`（点刻度换拍；FOLD 滑块拖与纯键盘；↺ ↻；`complete-net` 点候选 → 检查时折叠 → 叠面诊断 → 看答案；`tap-face` 方向键 + Enter；`choose` 多选漏项 → `prototype-only`；再来一道；跳过；练习总结；zh；390 × 844 下候选按钮 ≥ 44 px） | `tests-e2e/nets-and-solids.spec.ts`、`docs/screenshots/nets-and-solids/` | 4 | M |
| 5′ | Haiku | 机械检查，报告给主会话，不改文件：UI 文本里无年级（`grep -n "P[1-6]\b\|[一二三四五六]年级\|小[一二三四五六]" src/content/topics/nets-and-solids/`）；每个展示字符串 `{ en, zh }` 齐；每步拍数 / 题数与 §1.3 一致；名词表 id 在正文第一次出现都包了 `<Term>`；固定说法三处一字不差；`sources.json` 的 S# 都被引用；配图文件存在；无"29 种""723"；无品牌名 | — | 4 | S |
| 6 | Opus（独立审读）→ 主会话 | 审读子代理按 §8 逐条过（事实对来源、中文、诊断句、截图）；主会话 `acceptance.md` 全勾、门槛全绿、首页与冒烟测试的计数跟着改、截图归档、本文 §9 记录、`git commit`；push 等 Gavin | — | 5、5′ | S |

**文件归属的边界**：E-net 动的 `schema.ts`、`validate.ts`、`lib/{check,solve,proof,lesson}.ts`、`stage/{BeatModel,OptionGrid}.tsx`、`tray/Tray.tsx`、`hud/plate.ts`、`src/theme/tokens.css` 是几节课共用的文件，所以 E-net 开工时**同一时间不能有别的引擎代理改 MathScene 或 tokens.css**（与 docs/37 的施工错开或先问清它动不动这两处）；L 只动 `data/lesson.json`；Sonnet 起草只写 `scripts/math/drafts/`；T 只动 `chapters/` 与 `data/` 的其余文件；P 只动 e2e 与截图（发现引擎问题写给主会话，不自己改引擎）；Haiku 只读。E-net 的验收：示例主题 `sample-lesson-nets` 的 `pnpm shoot --beats --tasks --keys --layout` 0 失败、六节已发布的数学课截图不变（回归）、`pnpm test` 全绿、`net.test.ts` 复现调研的 11 / 35 与 11 / 29 / 54。

估算：E-net 约 2 天；本课内容（拍 + 题库 + 正文 + QA）约 2 天。

---

## 8. 验收

照 skill `references/acceptance.md` 全部打勾（门槛、讲解优先、HUD 铁律、内容与事实、截图存档），另加本课的：

- [ ] 门槛：`pnpm check`、`pnpm validate`（0 error 0 warning）、`pnpm test`、`pnpm build`、`pnpm e2e` 全绿；`pnpm shoot nets-and-solids --beats --tasks --keys --layout --locale en,zh --theme paper,cinema` 0 失败、console 干净、无外部请求
- [ ] **几何对**：`net.test.ts` 复现 35 → 11 / 24（8 + 4 + 12）、长方体 11 / 29 / 54、正四面体 2；课里每个"能折"的展开图 fold = 1 时与立体顶点重合（< 1e-9），每个"不能"的有叠面 / 空面 / 尺寸不配
- [ ] **遮挡对**：`project.test.ts` 采样对照全过；`--beats` 截图里折到一半的每一拍没有"后面的面盖住前面的面"；`turn` 四个方向都看过一次
- [ ] **课纲范围**：圆柱、圆锥只在讲解拍和 `choose` 里（validate 拦 `complete-net` / `tap-face`）；不数棱和顶点、不出欧拉公式、不出表面积和体积；第 08 章头 "Recognise only / 只要认得"
- [ ] UI 任何地方都不出现年级；`grep` 为空
- [ ] **数字**：界面里只有 11、35、54（带"三条棱都不一样长"）、2（正四面体，`<More>`）；没有 29、384、723
- [ ] §2.1 每个 code 至少一拍正面讲（⚑），至少一道题库题能诊断它；`check-pool` 无 WARN；`curved-unrolled`、`cube-cuboid`、`prism-pyramid` 的来源注写"本课提出的诊断"或教辅网站，不写错误率
- [ ] 难点分布：第 03、04 步至少三成题用最长一排 2 或 3 个的展开图；第 05 步至少一道"底在一端"
- [ ] 小测里 FOLD 第一次检查前锁着、练习里不解锁、讲解拍里一直可用；SOLID 卡、PLATE、读屏文字在检查前不说"能不能折"、不说问的那个名字
- [ ] 不依赖颜色：灰度截图里对面的三对靠 ● ▲ ■ 分得开；叠面（双线 + 字）、空面（虚线 + 字）分得开；给定（cold）/ 孩子的（signal）/ 看答案（虚线）分得开
- [ ] 固定说法全课一致（§2.0 四句）；术语照 §5.2（无"立方体""角柱""摺纸图样"）
- [ ] 情境：无品牌（含 S26 那块巧克力的名字）、无价格；不说纸巾盒、Milo 罐、红包的任何具体事实；人名多族群
- [ ] 配图：首页图与两张章节图入库，alt / caption 与画面一致
- [ ] 性能：FOLD 滑块拖动与 `fold` 过渡在 1280 × 720 下每帧脚本 + 绘制 ≤ 8 ms（Chrome 性能面板，4 × CPU 节流下 ≤ 16 ms）；`prefers-reduced-motion` 直接到位
- [ ] 截图：第 02、04、06、08 章 + 练习章与一道 `complete-net`、一道 `tap-face`，1920 × 1080、1280 × 720、1024 × 768（从链接打开）、390 × 844（paper；外加一张 cinema、一张 zh）

---

## 9. 施工记录 / 已知差距

---

## 附：来源（施工时进 `sources.json`；编号沿用调研 `nets-research.md` §6；访问日期 2026-10-21）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (2021 Primary One Cohort; Updated Oct 2025). https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 课纲原文：第 34（P2 3D Shapes）、39（P4 Nets 4.1–4.4）、42（P5 体积，不做）页；Skills 第 14 页；负面结果（无 vertex / surface area / Euler） |
| S2 | Wikipedia, "Net (polyhedron)". https://en.wikipedia.org/wiki/Net_(polyhedron) | 展开图的定义；不是每种剪法都不重叠 |
| S3 | Weisstein, E. W., "Net", *MathWorld*. https://mathworld.wolfram.com/Net.html | 正方体 11 种；展开图 = 棱图的生成树；正四面体 2 种 |
| S4 | Weisstein, E. W., "Cube", *MathWorld*. https://mathworld.wolfram.com/Cube.html | 正方体 6 个面（棱、顶点数只作背景） |
| S5 | Qian, Wang, Subercaseaux, Heule, "Unfolding Boxes with Local Constraints", arXiv:2506.01079v1 (2025), pp. 11, 13. https://arxiv.org/pdf/2506.01079 | 384 种剪法 → 11；723 等是另一种定义（**不用于界面**） |
| S6 | Wikipedia, "Hexomino". https://en.wikipedia.org/wiki/Hexomino | 35 种六连方、11 种是展开图；不能含 O / I / U / V |
| S7 | Steward, D., "nets of a cuboid", *Median* blog, 24 May 2013. https://donsteward.blogspot.com/2013/05/nets-of-cuboid.html | 三条棱都不同时 54 种 |
| S8 | Save My Exams, "Nets of Solids" (CIE IGCSE Core). https://www.savemyexams.com/igcse/maths/cie/25/core/revision-notes/geometry/symmetry-and-shapes/nets-of-solids | 54；长方形成三对；四棱锥、圆柱的展开图 |
| S9 | Wee, L. K., "Nets of Cubes and Cuboids", Open Source Physics @ Singapore (updated 18 Jan 2025). https://sg.iwant2study.org/ospsg/index.php/interactive-resources/mathematics/measurement-and-geometry/geometry/2-3d-shapes/411-netsofsolidswee | 老师的快速排除清单（不完整）；`face-count` |
| S10–S17 | Wikipedia: Cuboid; Triangular prism; Square pyramid; Tetrahedron; Cone; Cylinder; Euler characteristic; Cube | 各立体的面；圆锥展开是扇形（S14）；圆柱侧面（S15） |
| S18 | Knight, R., & Wright, V. (2014). Will this net work? *MERGA 37*, pp. 343–348. ERIC ED572616. https://files.eric.ed.gov/fulltext/ED572616.pdf | `prototype-only`（第 344、347 页）、难的展开图与正确率（第 345 页）、"选底—折四周—盖顶"（第 347 页）、`overlap-unseen`（第 347 页） |
| S19 | NZCER Assessment Resource Banks, "Net of an open box" (Year 8, 10/2009, n = 155). https://arbs.nzcer.org.nz/resources/net-open-box | 底在一端最难（第 05 步第 4 拍、题库分布） |
| S20 | NZCER ARB, "Nets for a cube" (trial notes). https://arbs.nzcer.org.nz/node/4904 | 看与折两种做法（D5） |
| S21 | 羅家欣、關樹培（2009）。正方體的展開圖、截面與學生的空間感培養。香港教育學院 ICPE，第 1、3、4 页。https://www.eduhk.hk/primaryed/eproceedings/fullpaper/RN258.pdf | 六个正方形不一定行（第 3 页）；对面 / 邻面（第 4 页） |
| S22 | Zhang (2021). Opportunities to learn three-dimensional shapes in primary mathematics. *EJMSTE* 17(6), em1971, p. 2. | 画展开图、组合基本图形是难点（二手综述，只作背景） |
| S23 | Geniebook, "A Parent's Guide to PSLE Maths Geometry Questions: Nets & Volume". https://geniebook.com/exam-preparation/psle/article/psle-maths-nets-volume-3d-geometry-guide | 题型（教辅，未与 SEAB 核对）；三棱柱的面 |
| S24 | Odyssey Math Tuition, "Nets of 3D Solids: A Primary 4 Guide". https://odysseymathtuition.com/primary-4-nets/ | 题型；`prism-pyramid`（教辅，非研究） |
| S25 | Wikipedia, "Carton". https://en.wikipedia.org/wiki/Carton | 折叠纸盒运来时是平的 |
| S27 | Wikipedia, "Tetra Pak". https://en.wikipedia.org/wiki/Tetra_Pak | 三棱锥形纸盒（第 07 步 `<More>`，不写品牌作卖点） |
| S28 | Wikipedia, "Ice cream cone". https://en.wikipedia.org/wiki/Ice_cream_cone | 蛋筒烤平再卷（第 08 步） |
| S30 | Yan Chai 学校（香港）数学科 "Mathematical Terms 6. 立體圖形". http://www.yanlaap.edu.hk/it-school/php/webcms/pagemanager/subject/maths_hp/math_terms_6.htm | 中文术语旁证（香港写法） |
| S31–S34, S37 | zh.wikipedia：立方體；長方體；展開圖；棱锥；棱柱 | 中文术语旁证 |
| S35 | 知识新天地（搜狐，2024-04-01）"正方体11种展开图及口诀". https://www.sohu.com/a/768446242_121124318 | "隔一个相对"的教学口诀（非正式来源；本课用自算核对过） |
| S36 | GeoGebra, "How many nets of a cuboid are there?". https://mat.geogebra.org/material/show/id/zxvyknvh | 长方体展开图的思路（背景） |
| 自算 | `art/research/nets-and-solids/hex_check.py`、`box_nets.py`（调研 2026-10-21）；本文起草时另核了 11 种的对面配对与开口盒的底 | 24 种非展开图的分类、29（不进界面）、对面配对；E-net 的单测复现它们 |

不用的：S26（巧克力品牌，只作"三棱柱形巧克力盒"的出处，界面不写名字）、S29（红包，与展开图无关）。事实纪律同 docs/15 §6.2：课纲逐字、注页码；误解的出处写进 `sources.json` 的 `note`，**只写来源真说过的**（S18、S19 不是新加坡的数据；S24 是教辅网站；`curved-unrolled`、`cube-cuboid` 没有研究出处）；题干与人名的情境是虚构的。
