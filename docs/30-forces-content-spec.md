# 30 · 力 · 内容施工 spec（`forces`，SpaceScene + 试一试；v1，§0 已定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §2 封闭设备的变体 **"实验台"**（docs/22、docs/23 的同类决定）：一张摆着五套器材的科学实验台，每套器材做一个课纲里的力的实验，读者在每一章动手改一个量、看结果、记进数据表、画成图。本主题的任务：**P6 学生看完能说清力是推或拉；力能让静止的物体动起来、让运动的物体加快、减慢、改变方向或停下，还能改变物体的形状；能认出并举例磁力、重力、弹簧的弹力、摩擦力；知道物体有重量是因为重力作用在它上面；能做、能读、能设计"只改一个量"的公平测试（摩擦力对运动的影响、弹簧的弹力），并从数据表和图里找出规律。**

`subject: science`；对应 2023 课纲 P6 *Interaction of Forces (Frictional force, gravitational force, elastic spring force)*（S2 第 63–66 页）。docs/17 §3.4 Interactions 行（"Sim（主）/ S；斜面 + 不同表面、弹簧挂重物、落体"）、§3.6（Booklet B 的变量 / 公平测试题）、§7 B10 与 D0–D1。

2026-10-18 起草。**只做规划，不施工、不建目录、不提交。** 结构照 docs/22 / docs/23（§0 决定 → §1 课纲与范围 → §2 事实 → §3 对象与零件 → §4 引擎 → §5 章节 → §6 名词与来源 → §7 图像 → §8 施工与验收 → §9 施工记录（空））。字幕是**草稿**，用来定节拍和模型状态：EN 施工时由 Codex 起草全文、Claude 逐句核对；ZH 是 Claude 的草稿，施工时 Claude 独立定稿。标"待核"的事实，施工代理读原文核对后才能用，核不到就换值或删掉。课纲来源 S2 **本文起草时已下载 PDF 逐页核对**（2026-10-18，封面"Updated Jan 2026"，文件名 `Primary-Science-Syllabus-2023_May24.pdf`），页码是每页页脚印的数字。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **对象 = 一张 1.8 m 长的科学实验台 + 台边地上一座落体架**，五区（§3.1）：① 斜面与跑道（木斜面、1.3 m 跑道、可换的玻璃板 / 地毯条、玩具车、米尺）；② 摩擦板（三条并排的面：玻璃、木、砂纸；带钩木块、两只 200 g 黄铜砝码、水平拉的弹簧秤）；③ 弹簧架（铁架台、一根弹簧、50 g 砝码挂钩与槽码、竖直米尺；旁边挂一只称重用的弹簧秤）；④ 落体架（地上的沙盘、两只释放夹，0.5 / 1.0 / 1.5 m；两只钢球、一张 A4 纸、一团揉皱的 A4 纸）；⑤ 刹车轮（自行车前轮装在架上、轮圈刹车、刹车把）。另有生活里的几件：两块鞋底样品（光滑皮底、带花纹的橡胶底）、一块海绵、一根条形磁铁和车尾的小磁铁（第 01 章的磁力）。**通用设计研究**，无品牌、无型号、无文字（尺和秤上只有刻度、没有数字）；标题块 `note`：EN "Generic design study · a school science bench · not a specific product" / ZH "通用设计研究 · 小学科学实验台 · 不代表任何具体产品" | 同意 | 定稿 |
| D2 | **引擎：SpaceScene + `sim`，新加一个模型 `kind: 'force'`**（§4），不做 docs/03 §C 的独立 Simulation 引擎（已在 docs/23 §0.1-1 作废），也不硬套 `circuit` / `magnet`。理由：要的"可操作"仍然只是开关、步进、选择（同磁、电）；要的物理是六个毫秒级的确定性小模型（推、落体、滑动摩擦、滚动、弹簧、刹车），都写成纯函数、单测钉死；真正新的引擎能力只有两样——**物体按物理"跑一遍"的回放**（时间线输出，F2）和**力的箭头**（F3），外加弹簧伸缩（F4）、数据表下的小图（F5）。不做通用"查表"模型：查表要把数字手写进数据，违反"SIM 由模型算出、内部自洽"的事实纪律 | 新 `kind: 'force'` + F1–F9（§4.3），引擎约 6 天 | 定稿 |
| D3 | **课纲边界**（§1.1 原文）：要的——力是推或拉；力的作用（使静止物体运动；加快、减慢或改变运动方向；使运动物体停下；可能改变形状）；认出并举例磁力、重力、弹簧的弹力、摩擦力；**探究**摩擦力对物体运动的影响；**探究**弹簧弹力的作用；物体有重量是因为重力作用在它上面。Note 明说**不要求**：滚动物体（车轮、球）所受摩擦力的**方向**；"air resistance""water resistance"这两个**词**。Foundation（第 65–66 页）不要求弹簧的弹力。本主题：主线不画、不讲车轮上的摩擦力方向（第 04 章玩具车只说"跑道表面让它慢下来"，力的箭头只画在**滑动**的木块和刹车块上，不画在车轮上）；"空气阻力"这个词只在第 02 章细看出现，主线说"空气向上推它 / the air pushes back on it"；UI 不出现年级，也不标 Foundation（同 docs/29 D3） | 同意 | 定稿 |
| D4 | **数字与单位：读数可以有牛顿，计算不进主线。** 课纲学习结果里**没有**牛顿、没有任何公式或计算（PDF 全文检索 "newton" 0 处；第 63–66 页只有定性的条目和两条"探究"）。但公平测试离不开读数：弹簧秤本来就按牛顿刻度。所以：弹簧秤读数写 N（第一次出现时一句话："newton，力的单位，读作牛顿"，包 `<Term>`），伸长写 cm、距离写 cm、质量写 g、时间写 s；**不出现** F = mg、F = kx、μ、"每千克约 10 N"这类算式与换算（"1 kg 的重量约 10 N""弹簧的伸长与拉力成正比"只在细看里当规律说，注明"中学会学"）；模型内部 g 取 9.8 N/kg（F-3），读数取到 0.1 N（学校弹簧秤的读数精度量级，F-24 待核） | 同意 | 定稿 |
| D5 | **必须讲对的八处**（§1.4 误解目录逐条对应）：① 不受空气影响时轻重物体同时落地（重的不更快）；同样重的纸，揉成团的比摊平的落得快——差别来自空气，不来自重量；② 运动的物体**不需要**一直有力推着才能保持运动，它慢下来是因为摩擦力（和空气）；③ 摩擦力**不总是坏的**：走路、刹车、拧瓶盖都靠它；④ 东西不动**也有力**：静止的木块被拉着却没动，是摩擦力顶住了拉力；挂着的砝码不动，重力向下、弹簧向上；⑤ 摩擦力在物体还没滑动时就有（拉到某个值才开始滑），开始滑之后拉住它所需的力**比开始时小**；⑥ 重量和质量不同：同一个球在月球上质量不变、重量约为地球上的六分之一；⑦ 弹簧只在一定范围内"挂多少、伸多少"，拉过头就回不到原长；⑧ 磁力、重力不用接触就能作用 | 同意 | 定稿 |
| D6 | **章数 6 + 背景章 00**（§5）：00 怎样做这一课的实验 / 01 推和拉 / 02 重力与重量 / 03 摩擦力：开始滑动有多难 / 04 摩擦力让运动的物体慢下来 / 05 弹簧的弹力 / 06 生活中的力。每章一个"试一试"（00 没有），**不做测验** | 同意 | 定稿 |
| D7 | **公平测试一等公民**（docs/22 §0-7 同）：每章写明改变 / 不变 / 观察的量；第 02–06 章可"记一行"进数据表，**表下画小图**（改变量是步进 → 折线图，是选择 → 条形图；F5）。课纲 P6 末"设计公平测试""用表格、条形图、折线图推断规律"（S2 第 15–16 页）正好对上。"重复三次取平均"只在细看讲：模型每次给同一个数（S1 写明） | 同意 | 定稿 |
| D8 | **跑一遍（回放）**：改了量以后器材**自己跑一遍**（车滑下、木块被拉动、两个球落下、轮子转停），读者也可以按"再跑一次 / Run again"（键 `G`）；深链接、截图、拍的瞬切直接显示终态（同指南针的 `settle`）；落体太快，画面**放慢 4 倍**，卡片上写明"slowed down 4 times / 放慢 4 倍"。不做自由拖动（v2，§4.6） | 同意 | 定稿 |
| D9 | **力的箭头**：重力、摩擦力、弹簧的弹力、推力或拉力、磁力各一种颜色（新 token `f-gravity`、`f-friction`、`f-elastic`、`f-push`；磁力复用 `pole-n`），长度按读数（每牛顿 3 cm，封顶 0.25 m），右侧 KEY 里有图例；LAYERS 里一行"FORCES 力"开关（默认开）。滚动的车轮上不画摩擦力箭头（D3） | 同意 | 定稿 |
| D10 | **表面选择**：滑动木块用 **玻璃 / 木 / 砂纸**，滚动小车用 **玻璃 / 木 / 地毯**。理由：木块在砂纸和地毯上谁的摩擦更大没有可靠数据，小车在地毯上慢下来主要是绒毛被压扁（不是"粗糙"），两种排序可能相反，混用会教出"砂纸和地毯哪个更粗"的伪问题；玻璃和木两种面两边都有，读者能对照。第 04 章细看讲"地毯为什么特别能让车慢下来" | 同意 | 定稿 |
| D11 | **刹车轮代替"拉力 vs 刹车距离"的整车实验**：第 06 章用一只架起来的自行车前轮（转速 2 圈 / 秒），刹车把 不捏 / 轻捏 / 用力捏，看停下要多久、转几圈。轮子在架上，没有骑车人，没有危险画面；MRT 刹车、组屋电梯、操场滑梯、鞋底用插图和细看 | 同意 | 定稿 |
| D12 | **弹性限度**：课纲没有点名，但"弹簧拉过头回不去"是真实而常见的观察，且是 F5 折线图上最直观的一处"转弯"。做法：槽码可加到 400 g，300 g 以内每 50 g 伸长 1.0 cm；超过 300 g 伸长变快、取下砝码后回不到原长（DESIGN，§2）；主线只说"挂得太重，弹簧会被拉坏、回不到原来的长度"，"elastic limit / 弹性限度"只在细看 | 同意 | 定稿 |
| D13 | **生活情境（新加坡）**：操场滑梯（光滑的滑道、防滑的台阶）、MRT 列车刹车时站着的人往前倾（扶好扶手）、组屋电梯（钢缆向上拉、重力向下）、自行车刹车、鞋底花纹、组屋里的地毯与瓷砖地。无品牌、不点名某条地铁线或某栋楼、不写官方没给的数字；需要官方说法的（乘车扶好、电梯钢缆）找 LTA / BCA 原文（**待核**，§6.2） | 同意 | 定稿 |
| D14 | **背景章 00**：讲"实验台上有什么、试一试卡片怎么用（改变 / 不变 / 观察三行、记一行、看图、再跑一次）、这里的数字是模型算出来的"。SpaceScene 还没有主题用过背景章（core 已支持 `kind: background`，见 docs/06「背景章」），F0 由引擎代理验证编号、章节轴、演示在 SpaceScene 下都对 | 同意 | 定稿 |
| D15 | **不做**：品牌 / 型号 / 照片贴图 / 视频 / 配音文件 / 测验 / 人体与手（推力用箭头和一根推杆表示，不画手）/ 真实危险的演示（刹车失灵、摔车）/ 行星重力的计算 / 斜面上的力的分解 / 滑轮与杠杆（课纲外） | 同意 | 定稿 |
| D16 | **单位**：SI；正文长度 cm、mm，质量 g、kg，力 N，时间 s；模型坐标米；转速"圈 / 秒（turns per second）" | 同意 | 定稿 |
| D17 | **图**：Codex 已按 docs/17 在草稿目录里出图；本文 §7 只给定稿清单（首页图 1 张 + 章节图 4 张），主会话逐张核对 §2 后入库 | 同意 | 定稿 |

### 0.1 真正需要 Gavin 的

无阻塞项。两处是"按惯例代定、Gavin 想改随时改"的：读数用牛顿（D4；改成"只看伸长和距离、不出现 N"也能做，第 03 章改看"拉开始滑动时弹簧秤伸长了几格"）；弹性限度进一拍（D12；不要就删第 05 章第 5 拍，F-15 只留细看）。

---

## 1. 课纲对照与范围

### 1.1 课纲原文（S2，逐字；2026-10-18 从 PDF 抄录）

**第 63 页** · Interaction of Forces (Frictional force, gravitational force, elastic spring force) (P6 Standard) · Learning Outcomes

| Core Ideas | Practices | Values, Ethics and Attitudes |
|---|---|---|
| • Identify a force as a push or a pull. | • Investigate the effect of frictional force on the motion of objects. | • Show objectivity by using data and information to validate observations and explanations about forces. |
| • Show an understanding of the effects of a force. – A force can move a stationary object. – A force can speed up, slow down or change the direction of motion. – A force can stop a moving object. – A force may change the shape of an object. | • Investigate the effects of elastic spring force. | |
| • Recognise and give examples of the different types of forces. – Magnetic force – Gravitational force – Elastic spring force – Frictional force | | |

**第 64 页**（同一课题续）

| Core Ideas |
|---|
| Note: – Direction of frictional force for "rolling objects" such as wheels and balls is not required. – The use of specific terms such as 'air resistance' and 'water resistance' is not required. |
| • Recognise that objects have weight because of the gravitational force acting on the object. |

**第 65–66 页** · Interaction of Forces (Frictional force, gravitational force) (P6 Foundation)：同上，但 Core Ideas 第一条之后写 "State the effects of a force"（不是 "Show an understanding of"），力的种类只列 Magnetic force、Gravitational force、Frictional force（**没有** elastic spring force），Practices 只有 "Investigate the effect of frictional force on the motion of objects."；两条 Note 与重量一条同 Standard。

**相关页**
- 第 15 页 表 1 Designing investigations：By the end of P4 "Recognise a fair test (changed/ unchanged variables)."；By the end of P6 "Design a fair test (changed/ unchanged variables)."
- 第 16 页 Analysing and interpreting data（P6）："Analysis of data and information in representations (e.g., tables, bar and line graphs, charts, and diagrams) to infer patterns and relationships or explain findings."；Conducting investigations（P6）："Record and/or compare observations/ data using a variety of forms e.g., notes, drawings, and charts."
- 第 17 页 Using and developing models："Use multiple representations (e.g., pictures, charts, diagrams, tables, graphs) to explain concepts, describe and predict phenomena."
- 第 20 页 表 2：P6 课题 "Interaction of forces (Frictional force, gravitational force, elastic spring force)"；P3 "Interaction of forces (Magnets)"（已做：`magnets`，docs/22）。
- 第 61 页 About Interactions："Interactions are the actions between and within living and non-living systems in the environment."
- 第 80 页 Energy Conversion 的 Note："The use of specific terms (chemical potential energy, gravitational potential energy and elastic potential energy) is not required."（本主题不讲能量；第 05、06 章细看提到"拉长的弹簧、举高的球储存着能量"时只用 potential energy，不用细分词）

### 1.2 边界一览（主线 / 细看 / 不讲）

| 内容 | 主线 | 细看 | 不讲 |
|---|---|---|---|
| 推、拉；五种作用 | ✓ 01 | | |
| 磁力、重力、弹簧的弹力、摩擦力 | ✓ 01–06 | | |
| 重量来自重力；重量 vs 质量 | ✓ 02 | 月球上的重量（F-4） | 万有引力定律 |
| 牛顿作读数单位 | ✓（D4） | "1 kg 约 10 N" | 任何计算 |
| 空气阻力 | 现象（"空气向上推"）02 | 这个词 | 阻力公式 |
| 滑动摩擦：开始滑动 > 保持滑动 | ✓ 03 | 与接触面积无关（F-8） | 摩擦系数 μ |
| 滚动物体的摩擦方向 | — | — | ✓（Note） |
| 弹簧伸长随拉力；弹簧秤原理 | ✓ 05 | 胡克定律的名字（中学） | k、公式 |
| 弹性限度 | 现象（D12） | 这个词 | |
| 运动不需要持续的力 | ✓ 04、06 | 牛顿第一定律的名字（中学） | 惯性定律的表述 |
| 力的平衡（东西不动也有力） | ✓ 03、05 | "平衡"一词 | 合力的计算 |
| 能量 | — | 一句伏笔（05、06） | 势能细分词（第 80 页 Note） |

### 1.3 读者学到什么（P6 用词）

1. **力是推或拉。** 力能使静止的物体运动，使运动的物体加快、减慢、改变方向或停下，也可能改变物体的形状。
2. **四种力**：磁力（第 01 章，不用接触）、重力（第 02 章，不用接触，把东西拉向地面）、摩擦力（第 03、04、06 章，两个面互相擦过或要擦过时出现，阻碍运动）、弹簧的弹力（第 05 章，被拉长或压缩的弹簧要回到原来的长度）。
3. **重量**：物体有重量是因为重力拉着它；弹簧秤能称出重量。
4. **摩擦力与表面**：越粗糙的表面摩擦越大，拉动木块要的力越大；同一个表面上，木块越重摩擦越大；跑道表面摩擦越大，小车滑得越短。
5. **弹簧**：挂得越重伸得越长，在一定范围内"多挂一份、多伸一份"；拉过头会坏。
6. **运动与摩擦**：运动的物体自己会慢下来，是因为摩擦力；摩擦越小滑得越远；刹车靠的就是摩擦。
7. **摩擦力有用也有害**：走路、刹车靠它；它也让零件磨损、发热。
8. **做法**：一次只改一个量，其余保持不变（公平测试）；记进表、画成图、从图里找规律；用数据说明自己的结论（课纲价值观"用数据和信息验证观察与解释"）。

### 1.4 误解目录（每条至少一拍或一段正文正面讲）

| # | 误解 | 本主题怎样让它站不住 | 章 · 拍 | 来源 |
|---|---|---|---|---|
| M1 | 重的东西落得快 | 28 g 和 225 g 两只钢球同时落进沙盘（0.45 / 0.45 s，SIM）；先猜后看 | 02 · 2–3 | S11、S12、S17 |
| M2 | 轻的东西落得慢是因为它轻 | 同一张纸：摊平 1.00 s、揉成团 0.46 s（SIM）——一样重，差别在空气 | 02 · 4 | S7、S17 |
| M3 | 运动的物体要一直有力推着才能保持运动；推它的力"跟着"它走、慢慢用完 | 跑道越光滑车滑得越远；刹车轮不捏刹车时转约 80 秒才停（SIM）；"想象一条完全没有摩擦的跑道" | 04 · 4；06 · 2 | S14、S15、S18 |
| M4 | 东西不动就没有力 | 拉木块：弹簧秤读数从 0 升到 1.0 N 时木块还没动，摩擦力箭头与拉力箭头等长；挂着的砝码：重力向下、弹簧的弹力向上 | 03 · 2；05 · 2 | S16、S14 |
| M5 | 摩擦力只在东西动的时候才有 | 同 M4 前半；开始滑之后读数反而降到 0.6 N | 03 · 2–3 | S5 |
| M6 | 摩擦力总是坏的 | 鞋底、刹车、滑梯的台阶；摩擦太小（冰上、湿地）才危险 | 06 · 1、4 | S5（鞋在木 / 冰上）、S14 |
| M7 | 接触面越大摩擦越大 | 细看：木块立着拉和平放着拉，读数一样（模型里摩擦与面积无关，F-8） | 03 细看 | S5 |
| M8 | 重量就是质量 | 225 g 的球在弹簧秤上读 2.2 N；在月球上还是 225 g，读数约 0.4 N（细看） | 02 · 5 | S10、S2 |
| M9 | 弹簧挂多少都能回到原长 | 第 05 章第 5 拍 | 05 · 5 | S8 |
| M10 | 力要接触才能起作用 | 磁铁隔着空隙推开小车；球没碰任何东西也被拉下来 | 01 · 4；02 · 1 | S2、S13 |
| M11 | 改变方向不算"力的作用" | 从侧面推一下，车速差不多、方向变了 | 01 · 3 | S2 |

### 1.5 PSLE 题型 → 本主题哪里支持

| 题型（S2 第 15–17 页；S3 评估目标 II） | 支持 |
|---|---|
| 从图里认力的作用（开始动 / 加快 / 减慢 / 转向 / 停 / 变形） | 第 01 章，五种作用逐拍 |
| 斜面 + 不同表面，小车滑行距离；"他改了什么、保持了什么、为什么" | 第 04 章 + 数据表 + 条形图 |
| 用弹簧秤拉木块，表面 / 重量对拉力的影响 | 第 03 章 + 数据表 + 条形图（另：改变"加几只砝码"） |
| 弹簧挂重物，读表、画折线图、预测伸长、发现"拉过头" | 第 05 章 + 折线图 |
| 落体：重量 / 形状对下落的影响 | 第 02 章 |
| 判断摩擦力有用还是有害、怎样增减摩擦 | 第 06 章 |

### 1.6 口吻

按 skill `atlas-space-topic` 的 `writing-rules.md`。课纲用词：force、push、pull、stationary、speed up、slow down、change the direction of motion、stop、change the shape、magnetic force、gravitational force、elastic spring force、frictional force、weight、motion、surface、fair test。中文（新加坡华文课本的说法）：力、推力、拉力、静止、加快、减慢、改变运动方向、停下、改变形状、磁力、重力（地心引力）、弹簧的弹力、摩擦力、重量、质量、运动、表面、公平测试。**"重量"不说"重力"**（新加坡用法：weight = 重量，gravitational force = 重力 / 地心引力，名词表注明）。不拟人（"摩擦力想让车停下"）、不说"神奇"、不用感叹号和问句标题。安全：刹车只在架起的轮子上演示；落体用钢球与沙盘，细看一句"不要从高处往下扔东西，楼下可能有人"（新加坡高楼抛物，来源待核，删去也可）。

---

## 2. 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源的典型值或定性事实；`DESIGN` = 本设计研究取的值（落在 TYPICAL 内，没有 TYPICAL 的写"示意"并在 S1 说明）；`SIM` = §4.2 模型算出的值（单测钉死）。S# → §6.2。

| # | 项 | TYPICAL（来源） | DESIGN / SIM（本模型） | 待核 |
|---|---|---|---|---|
| F-1 | 力是推或拉；五种作用；四种力；重量来自重力 | S2 第 63–64 页 | — | |
| F-2 | 力的单位牛顿 N；弹簧秤按 N 刻度 | S4（OpenStax 4.1）；S25 | 读数到 0.1 N | 学校弹簧秤的量程与分度（S25） |
| F-3 | 标准重力加速度 9.80665 m/s²；新加坡（北纬约 1.3°）约 9.78 m/s² | S9（NIST）；S27（WGS 84 正常重力公式，算出值） | 模型 g = 9.8 N/kg | 9.78 是公式算值，S27 原文核 |
| F-4 | 月球表面重力 1.62 m/s²，约为地球的 0.165 | S10（NASA 月球数据表，已读） | 细看：225 g 球在月球上读约 0.4 N | |
| F-5 | 真空中轻重物体同时落下：Apollo 15，1.32 kg 铝锤与一根猎鹰羽毛同时落地 | S11（NASA NSSDC，已读）；S12（伽利略 1638） | 细看 + 第 02 章图 | 羽毛质量原页标为"可能有误"，只说"一根羽毛"、不写克数 |
| F-6 | 静摩擦大于动摩擦；木对木 μs 0.5、μk 0.3；木对木（干净干燥）0.25–0.5 | S5（OpenStax 表 5.1，已读）；S6（Engineering ToolBox，已读） | 木面 μs 0.50 / μk 0.30（DESIGN，取 S5） | |
| F-7 | 木对玻璃、木对砂纸：公开表里没有 | — | 玻璃 0.25 / 0.20、砂纸 0.90 / 0.70（DESIGN，**示意**；排序"越粗糙越大"来自 S13 一类的课堂实验与 S14） | 若找到实测值换上，排序不变即可 |
| F-8 | 摩擦力与压力成正比，与接触面积无关 | S5（已读："proportional to the normal force, but not to the area in contact"） | 模型 F = μ × 重量，不含面积 | |
| F-9 | 鞋在木地上 μs 0.9 / μk 0.7；鞋在冰上 0.1 / 0.05 | S5（表 5.1，已读） | 第 06 章细看（鞋底） | |
| F-10 | 滑动木块读数（SIM） | — | 200 g 木块：玻璃 0.5 / 0.4 N，木 1.0 / 0.6 N，砂纸 1.8 / 1.4 N（开始滑动 / 保持滑动）；+200 g：1.0 / 0.8、2.0 / 1.2、3.5 / 2.7 N；+400 g：1.5 / 1.2、2.9 / 1.8、5.3 / 4.1 N | |
| F-11 | 斜面小车：表面越"粗糙 / 软"滑得越短；地毯最短 | S13（Science Sparks，已读：地毯上比光滑面短） | 滚动阻力系数 玻璃 0.06、木 0.09、地毯 0.25；斜面损失 20 %（DESIGN，**示意**：真实玩具车滚得远得多，系数放大是为了让 1.3 m 的跑道装得下） | 是：S19 的滚动阻力范围只当量级 |
| F-12 | 小车滑行距离（SIM） | — | 释放高度 3 / 6 / 9 cm：玻璃 40 / 80 / 120 cm，木 27 / 53 / 80 cm，地毯 10 / 19 / 29 cm（d = 0.8 h ÷ 系数） | |
| F-13 | 阻力随速度平方：F = ½ C ρ A v²；球 C = 0.45、圆形平板 1.12；空气密度 1.21 kg/m³ | S7（OpenStax 5.2 表 5.2，已读） | 钢球 C 0.45；摊平的纸 C 1.12（取圆形平板值，示意）；纸团 C 0.6（DESIGN，待核） | 纸团的 C |
| F-14 | 落体时间（SIM，1 ms 步长积分） | 真空：t = √(2h/g)（S4） | 高 0.5 / 1.0 / 1.5 m：28 g 钢球 0.32 / 0.45 / 0.55 s；225 g 钢球同；纸团 0.32 / 0.46 / 0.57 s；摊平的纸 0.54 / 1.00 / 1.47 s（终端速度约 1.1 m/s） | 真纸会翻飞，比模型更慢更乱（细看写明） |
| F-15 | 弹簧：在弹性限度内伸长与拉力成正比；超过弹性限度后不能完全恢复 | S8（OpenStax 5.3、16.1） | 每 50 g 伸 1.0 cm（劲度约 49 N/m）、原长 8.0 cm、弹性限度 300 g（伸 6.0 cm）；350 g 伸 7.3 cm、400 g 伸 9.2 cm；取下后留下 0.4 / 1.2 cm（DESIGN，**示意**） | 学校弹簧的典型劲度（S25） |
| F-16 | 槽码的重量读数（SIM） | — | 50 g 0.5 N、100 g 1.0 N … 300 g 2.9 N、400 g 3.9 N；28 g 球 0.3 N、225 g 球 2.2 N、一张 A4 纸 0.05 N（显示 0.0 → 卡片写"太轻，这只秤读不出"） | |
| F-17 | 钢的密度约 7.8 g/cm³ | S28（OpenStax 表 11.1） | Ø 19 mm 钢球 28 g、Ø 38 mm 钢球 225 g | |
| F-18 | A4 纸 210 × 297 mm（ISO 216）、常见 80 g/m² → 约 5 g | S29 | 一张 A4 5.0 g（纸团同一张） | 80 g/m² 的出处 |
| F-19 | 自行车轮圈刹车：刹车块夹住轮圈，摩擦让轮子停下；湿了效果变差 | S20 | 16 英寸轮（外径约 0.40 m）、轮圈半径 0.18 m、转动惯量 0.032 kg·m²、刹车块 μ 0.6、轮毂摩擦 0.005 N·m、夹紧力 不捏 0 / 轻 1 N / 用力 3 N（DESIGN，**示意**：没有骑车人，数字比真车小得多） | 是：刹车块 μ 范围（S20） |
| F-20 | 刹车轮（SIM） | — | 2 圈 / 秒起转：不捏约 80 s、80 圈才停；轻捏 1.8 s、1.8 圈；用力 0.6 s、0.6 圈 | |
| F-21 | 推的作用（SIM，第 01 章） | — | 车在推点的速度 0.6 m/s；从后推 +0.3 → 0.9（加快）；从前推 −0.3 → 0.3（减慢）；从前用力推 −0.6 → 0（停下）；从侧面推 0.3 → 0.67 m/s、转 27°（改变方向）；静止时从后推 → 0.3（开始运动）；推后在玻璃上照 F-11 的系数减速 | |
| F-22 | 列车刹车时，站着的乘客身体往前倾：身体要保持原来的运动 | S4（OpenStax 4.2 惯性）；S21（LTA 乘车须知，待核） | 第 06 章细看 + 图 | 是 |
| F-23 | 电梯：钢缆向上拉轿厢，重力向下；对重平衡大部分重量 | S22（BCA 电梯资料，待核）；S4 | 第 02 章细看 + 图 `forces-lift` | 是 |
| F-24 | 学校器材的典型规格：弹簧秤 0–10 N（分度 0.1–0.2 N）、50 g 挂钩槽码、带钩木块 | S25（教具目录，不点名） | 两只弹簧秤 0–10 N；挂钩 50 g + 7 片 50 g 槽码；木块 100 × 60 × 40 mm、200 g | 是 |
| F-25 | 误解研究：力 = 运动、力被"用完"、静止物体无力、重物下落快 | S14（IOP Spark）、S15（Clement 1982）、S16（Minstrell 1982）、S17（Driver 等 1994）、S18（Hestenes 等 1992） | 误解目录 §1.4 | S17、S18 只读到目录 / 摘要，写进 `note` |

**模拟（SIM，内部自洽）**：§4.2 的六个模型的算式和上表全部数字写进设计研究来源 S1；PLATE 读数、卡片、字幕、细看、数据表、图里同一个量必须同值，字幕写"在这个模型里 / in this model"。

---

## 3. 对象、写实与零件

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色 | 链路卡 |
|---|---|---|---|---|---|
| 01 | `ramp` | Ramp and runway / 斜面与跑道 | 斜面、垫块、释放挡片、跑道、玻璃板、地毯条、米尺、玩具车、车轮 | `token:ink-2` | ✓ |
| 02 | `friction` | Friction board / 摩擦板 | 三面板、玻璃条、砂纸条、木块、砝码、水平弹簧秤（壳、弹簧、指针）、拉线 | `token:accent-1` | ✓ |
| 03 | `spring` | Spring stand / 弹簧架 | 铁架台、弹簧、挂钩、槽码、竖尺；称重弹簧秤（壳、弹簧、指针） | `token:accent-2` | ✓ |
| 04 | `drop` | Drop tower / 落体架 | 立杆与底座、两只释放夹、两只钢球、纸、纸团、沙盘 | `token:ink-3` | ✓ |
| 05 | `brake` | Brake wheel / 刹车轮 | 车轮、轮架、刹车钳与刹车块、刹车把、刹车线 | `token:accent-3` | ✓ |
| 06 | `everyday` | Everyday forces / 生活中的力 | 鞋底样品、海绵、条形磁铁、车尾磁铁 | `token:neutral` | `card: false` |

LAYERS 另有一行 **FORCES / 力**（F3 的箭头叠加，不是组；默认开）。右上卡 = 零件链路（5 列，`everyday` 不进）；`connects` 很少（弹簧 ↔ 挂钩 ↔ 槽码、拉线 ↔ 木块 ↔ 弹簧秤、刹车把 ↔ 刹车线 ↔ 刹车钳），链路卡是次要读物（同 docs/22）。

### 3.2 坐标与尺度

- 米，Y 向上，+Z 朝观者，+X 向右；**台面 y = 0**，台面离地 0.75 m（地面 y = −0.75）。`units: { "modelUnit": "cm", "scale": 100 }`。
- 台面 1.80 × 0.70 m（x −0.90…0.90，z −0.35…0.35）。各区中心：斜面与跑道沿台前 z = 0.22，斜面顶 x = −0.88、跑道 x −0.48…0.82；摩擦板 (−0.45, 0, −0.12)；弹簧架 (0.10, 0, −0.20)；刹车轮 (0.55, 0, −0.12)（轮心 y 0.30）；生活中的力 (−0.10, 0, 0.02)（台中央一小块）；**落体架在台右侧地上** (1.15, −0.75, 0)，沙盘在地上，释放夹在沙面上方 0.5 / 1.0 / 1.5 m（最高 y ≈ 0.78）。
- 整体包络 x −0.92…1.35、y −0.75…0.85、z −0.36…0.36，模型半径约 1.25；投影规则（≥ 0.28 × 半径 ≈ 0.35）：台面、跑道、落体架立杆、车轮投影，小件只留接触阴影。
- 放大镜头：小件（木块 10 cm、车 9 cm）靠预设镜头看，hero 只求一眼认出五套器材。

### 3.3 Tier-1（一眼能认）与参考图

| 对象 | 必须对的 | 参考 |
|---|---|---|
| 弹簧秤 | 圆筒或扁管外壳、透明窗里的弹簧、指针在刻度旁、上端吊环、下端钩子；刻度只有线 | R1 |
| 槽码与挂钩 | 带开口槽的圆片叠在挂钩杆上，开口错开 | R2 |
| 带钩木块 | 长方木块、端面一只羊眼钩，木纹 | R3 |
| 斜面与小车 | 一块木板一端垫高，小车四轮、轮子明显比车身窄 | R4 |
| 弹簧 | 密绕的钢丝圈，上下两个钩环；伸长时圈距变大、钢丝不变粗 | R5 |
| 铁架台 | 方底座、竖杆、十字夹、横杆 | R6 |
| 自行车轮圈刹车 | 钳形刹车两臂、两块橡胶刹车块对着轮圈侧面、刹车线到把手 | R7 |
| 砂纸 / 地毯 | 砂纸：细密颗粒的暗面；地毯：短绒毛的厚条、边缘可见绒毛 | R8 |
| 鞋底 | 平滑皮底 vs 带纵横沟纹的橡胶底 | R9 |

参考图下到 `scripts/geo/forces/refs/`（gitignore，不发布）；施工时逐张选 Commons 文件并记许可：

| # | 文件 | 来源（候选） | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | `spring-balance.jpg` | Commons 分类 *Spring scales*（选一只实验室管式弹簧秤） | 逐张核 | 外壳、窗、指针、钩 |
| R2 | `slotted-masses.jpg` | Commons 分类 *Laboratory weights* / *Slotted masses* | 逐张核 | 槽的开口、叠法 |
| R3 | `friction-block.jpg` | Commons 分类 *Friction*（课堂木块实验照片） | 逐张核 | 钩、拉线方向 |
| R4 | `ramp-car.jpg` | Commons 分类 *Inclined planes*（课堂斜面） | 逐张核 | 垫块、角度 |
| R5 | `extension-spring.jpg` | Commons 分类 *Tension springs* | 逐张核 | 钩环、圈距 |
| R6 | `retort-stand.jpg` | Commons 分类 *Retort stands* | 逐张核 | 底座、夹 |
| R7 | `rim-brake.jpg` | Commons 分类 *Rim brakes*（caliper / V-brake 近照） | 逐张核 | 刹车块与轮圈的位置 |
| R8 | `sandpaper.jpg`、`carpet-edge.jpg` | Commons 分类 *Sandpaper*、*Carpets* | 逐张核 | 质感（只作 R3 材质对照） |
| R9 | `shoe-soles.jpg` | Commons 分类 *Shoe soles* | 逐张核 | 沟纹 |
| R10 | `galileo-1638.png` | Galileo, *Discorsi*（1638）书页或插图（公有领域） | 公有领域 | 只作背景，不建模 |

写实轮次：R2 并排两轮（弹簧秤、弹簧与槽码、车与斜面、刹车钳）→ R3 材质（木纹、玻璃、砂纸颗粒、地毯绒毛、黄铜、钢丝）→ R4 回放、箭头与 sim 绑定（车滑下、木块拉动、球落下、弹簧振几下停住、轮子转停）。

### 3.4 零件（44 个 + 2 个 context）

"sim"= 被 §4.4 绑定的属性；"隐"= 默认 `hide` 的章（不写 = 不隐）。尺寸米。

| # | id · 名称 | 组 | primitive（+ extra） | at（约） | 材质 | sim | 隐 |
|---|---|---|---|---|---|---|---|
| 01 | `ramp-board` 斜面板 | ramp | bevelBox [0.42, 0.012, 0.10]，绕 z 倾 14°（顶高 0.11） | (−0.70, 0.06, 0.22) | `wood` | | |
| 02 | `ramp-block` 垫块 | ramp | bevelBox [0.06, 0.10, 0.10] | (−0.87, 0.05, 0.22) | `wood` + 深木 tint | | |
| 03 | `release-gate` 释放挡片 | ramp | bevelBox [0.004, 0.03, 0.10] + extra 小铰链 | 斜面上 | `plastic` | `offset` ← `ramp-height`（沿斜面，3 / 6 / 9 cm 高处）；`pose` 抬起 ← 时间线开始 | 02、05 |
| 04 | `runway` 跑道板（木面） | ramp | bevelBox [1.30, 0.012, 0.10] + extra 两侧护边 | (0.17, 0.006, 0.22) | `wood` | | |
| 05 | `glass-mat` 玻璃板 | ramp | bevelBox [1.20, 0.004, 0.09] | 跑道上 | `glass`（偏绿玻璃边） | `visible` ← `runway = glass` | |
| 06 | `carpet-mat` 地毯条 | ramp | bevelBox [1.20, 0.008, 0.09]，**新 finish `pile`**（F7） | 跑道上 | `fabric`（新材质族，F7） | `visible` ← `runway = carpet` | |
| 07 | `metre-rule` 米尺 | ramp | bevelBox [1.20, 0.002, 0.025] + extra 刻度 `repeat` 120（每 1 cm，每 10 cm 长刻） | 跑道前沿 | `wood` 浅 tint；刻度 `powder` | | |
| 08 | `toy-car` 玩具车 | ramp | extrude 车身侧面轮廓 [0.09 长 × 0.035 高]，宽 0.045；extra 车窗 bevelBox | 斜面顶 | `plastic` + 暖红 tint | `play` ← `car-run`（x / y 沿斜面与跑道）、`push-run`（第 01 章） | |
| 09 | `car-wheels` 车轮 | ramp | lathe 轮（Ø 0.022 × 0.008），`repeat` 4（两轴 × 两侧，用 extra 的对称做法） | 随车 | `rubber` | `play` 通道 `spin`（每只绕自己的轴） | |
| 10 | `friction-board` 摩擦板（木面道） | friction | bevelBox [0.60, 0.012, 0.24] + extra 三条道的分隔木条 | (−0.45, 0.006, −0.12) | `wood` | | |
| 11 | `glass-lane` 玻璃道 | friction | bevelBox [0.56, 0.004, 0.07] | 后道 z −0.20 | `glass` | | |
| 12 | `sandpaper-lane` 砂纸道 | friction | bevelBox [0.56, 0.0015, 0.07]，**新 finish `sand`**（F7） | 前道 z −0.04 | `abrasive`（新材质族，F7） | | |
| 13 | `wooden-block` 带钩木块 | friction | bevelBox [0.10, 0.04, 0.06] + extra 羊眼钩 torus + cylinder | 选定道的起点 | `wood` | `offset` z ← `lane`（三条道）；`play` ← `pull-run`（x） | |
| 14 | `brass-weights` 黄铜砝码 | friction | lathe 圆柱砝码 + 提钮，`repeat` 2 沿 y | 木块上 | `brass` | `count` ← `block-load`（0 / 1 / 2 只，per 200）；随木块 `play` | |
| 15 | `pull-balance` 水平弹簧秤 · 外壳 | friction | tube 管壳 Ø 0.022 × 0.20 + extra 透明窗（`glass` shell）、吊环、刻度 `repeat` 50 | 木块前方，横放 | `steel` / 窗 `glass` | 随木块 `play`（通道 `x-balance`） | 01、02、05 |
| 16 | `pull-balance-spring` 水平弹簧秤 · 弹簧 | friction | **coil** r 0.007、wire 0.0008、30 圈、length 0.10 | 管内 | `steel` | `stretch` ← 时间线通道 `pull`（N → 伸长 0.010 m/N） | 同上 |
| 17 | `pull-balance-pointer` 水平弹簧秤 · 指针 | friction | bevelBox 小片 | 窗边 | `brass` | `play` 通道 `pull`（沿刻度 0.010 m/N） | 同上 |
| 18 | `pull-string` 拉线 | friction | sweep r 0.0006（钩到秤钩，直线） | 木块—秤之间 | `plastic` 白 | 随木块与秤（长度不变） | 同上 |
| 19 | `retort-stand` 铁架台 | spring | bevelBox 底座 [0.20, 0.015, 0.14] + cylinder 立杆 Ø 0.012 × 0.60 + extra 十字夹、横杆 0.18 | (0.10, 0, −0.20) | `steel` / 底座 `powder` | | |
| 20 | `test-spring` 弹簧 | spring | **coil** r 0.008、wire 0.0009、40 圈、length 0.08 + extra 上下钩环（sweep） | 横杆下 y 0.50…0.42 | `steel` | `stretch` ← `extension`（cm × 0.01，`settle` period 0.7 s、damping 0.15：振几下停） | |
| 21 | `mass-hanger` 挂钩（50 g） | spring | cylinder 杆 + lathe 底盘 + sweep 钩；extra 小指针（指向竖尺） | 弹簧下 | `brass` | `offset` y ← `extension`（同 settle）；`visible` ← `spring-load`（`gte: 50`）；`unload` → 姿态 `spring-unloaded`（挂钩连槽码放到台面上） | |
| 22 | `slotted-masses` 槽码 | spring | extrude 带开口槽的圆片 Ø 0.04 × 0.006，`repeat` 7 沿 y | 挂钩杆上 | `brass` | `count` ← `spring-load`（(值 − 50) ÷ 50）；随挂钩 offset | |
| 23 | `spring-ruler` 竖尺 | spring | bevelBox [0.025, 0.30, 0.003] + 刻度 `repeat` 30 | 弹簧旁 | `wood` 浅 tint | | |
| 24 | `weigh-balance` 称重弹簧秤 · 外壳 | spring | 同 15，竖挂 | 横杆另一端 (0.24, 0.40, −0.20) | `steel` / `glass` | | 03、04、06 |
| 25 | `weigh-balance-spring` 称重弹簧秤 · 弹簧 | spring | coil 同 16 | 管内 | `steel` | `stretch` ← `weight`（0.010 m/N，settle） | 同上 |
| 26 | `weigh-balance-pointer` 称重弹簧秤 · 指针 | spring | 同 17 | 窗边 | `brass` | `offset` y ← `weight`（settle） | 同上 |
| 27 | `weigh-cradle` 称重网兜 | spring | sweep 细线网兜（四根线 + 环） | 秤钩下 | `plastic` 白 | `visible` ← `weigh ≠ none`；所称物体由 pose 挂进 | 同上 |
| 28 | `drop-stand` 落体架 | drop | bevelBox 底座 [0.30, 0.02, 0.30] + cylinder 立杆 Ø 0.016 × 1.65 + extra 高度标记环 ×3 | (1.15, −0.75, −0.10) | `steel` / `powder` | | 03、04、05、06 |
| 29 | `release-clamps` 释放夹 | drop | extra 两只（bevelBox 夹臂 + 小舌板），左右各一 | 立杆上 | `plastic` 黑 / `steel` | `offset` y ← `drop-height`；`pose` 张开 ← 时间线开始 | 同上 |
| 30 | `sand-tray` 沙盘 | drop | extrude 浅盘 [0.50 × 0.30 × 0.05] + extra 沙面 bevelBox（`grain`） | (1.15, −0.75, 0.05) | `plastic` 灰 / 沙 `abrasive` 浅 tint | 落点小坑：`pose` 每只球一个凹痕盘（visible ← 时间线结束） | 同上 |
| 31 | `steel-ball-small` 小钢球 28 g | drop | sphere r 0.0095（lathe） | 释放夹 | `steel` | `pose` ← `pair`（左 / 右 / 不在）；`play` ← `drop-run` 通道 `left` / `right` | 同上（02 也用于称重） |
| 32 | `steel-ball-large` 大钢球 225 g | drop | sphere r 0.019 | 同上 | `steel` | 同上 | 同上 |
| 33 | `paper-flat` 摊平的 A4 纸 | drop | bevelBox [0.21, 0.0004, 0.297] | 同上 | `enamel` 白 | 同上；下落时绕 x 轻摆（时间线通道 `tilt`，示意） | 同上 |
| 34 | `paper-crumpled` 纸团 | drop | **organic** 球（docs/14 B 的 `shaped` 噪声球，r 0.025，固定种子） | 同上 | `enamel` 白 | 同上 | 同上 |
| 35 | `wheel` 自行车前轮 | brake | lathe 轮圈（外 0.18、槽形截面）+ torus 轮胎（外径 0.40）+ lathe 花鼓 + extra 辐条 sweep `repeat` 28 | 轮心 (0.55, 0.30, −0.12)，轮面朝 ±Z | `casing`（铝圈）/ 胎 `rubber` / 辐条 `stainless` | `play` ← `wheel-run` 通道 `spin`（绕 z） | 01–05 |
| 36 | `wheel-stand` 轮架 | brake | tube 前叉形 ×2 + bevelBox 底座 + 横轴 | 轮下 | `powder` | | 同上 |
| 37 | `brake-caliper` 刹车钳与刹车块 | brake | extrude 两臂 + extra 两块刹车块 bevelBox（`rubber`）+ 弹簧 | 轮顶 | `casing` / `rubber` | `pose` ← `squeeze`（off：块离圈 3 mm；light：贴住；firm：贴住、两臂略收） | 同上 |
| 38 | `brake-lever` 刹车把 | brake | extrude 把手 + cylinder 一段车把 + extra 握套 | 轮后上方 | `casing` / 握套 `rubber` | `pose` ← `squeeze`（0 / 12° / 22°） | 同上 |
| 39 | `brake-cable` 刹车线 | brake | sweep r 0.0025（外套）弧线 | 把—钳 | `plastic` 黑 | | 同上 |
| 40 | `shoe-soles` 鞋底样品 | everyday | extrude 鞋底轮廓 ×2（extra）：光滑皮底、带沟纹橡胶底（沟纹用 extra bevelBox `repeat`） | (−0.10, 0.006, 0.05) | `plastic` 棕 tint / `rubber` | | 01–05 |
| 41 | `sponge` 海绵 | everyday | bevelBox [0.10, 0.04, 0.07]（`grain`） | (−0.10, 0.02, −0.06) | `plastic` 黄 tint（低饱和） | `pose` ← `squash`（压扁到 0.6 高，被 14 号砝码压住） | 02–06 |
| 42 | `bar-magnet` 条形磁铁 | everyday | bevelBox ×2（两色，同 docs/22） | 跑道右端外 | `steel` + `pole-n` / `pole-s` | | 02–06 |
| 43 | `car-magnet` 车尾小磁铁 | everyday | bevelBox ×2 [0.02, 0.006, 0.01] | 车尾（随车） | 同上 | `visible` 只在 01；随车 `play` | 02–06 |
| 44 | `push-rod` 推杆 | everyday | cylinder Ø 0.008 × 0.15 + 橡胶头 | 跑道边，pose 到车后 / 前 / 侧 | `wood` / 头 `rubber` | `pose` ← `push`（后 / 前 / 侧；轻推 / 用力只差行程）；时间线通道 `rod` | 02–06 |
| — | `bench` 实验台 | context | bevelBox 台面 [1.80, 0.03, 0.70] + extra 四腿 | (0, −0.015, 0) | `wood` | | |
| — | `floor` 地面 | context | bevelBox [3.0, 0.01, 1.6] | (0.2, −0.755, 0) | `enamel` 暖灰 tint | | |

- **零件数理由**：每个实验要看得见的器材一件不能少；弹簧秤拆成壳、弹簧、指针三件，才能让弹簧伸缩、指针走、壳不动。删减顺序（超预算时）：`weigh-cradle` 并进 `weigh-balance` 的 extra → `brake-cable` 并进 `brake-lever` → `metre-rule` 的刻度从 120 根减到 60 根 → `shoe-soles` 改成一只（只留沟纹底）。
- **绘制预算**：circuits（35 件、70 材质槽）静止 71 calls。本主题目标**静止 ≤ 70、运转 ≤ 80、上限 100**；每件尽量单材质（extra 同材质）；刻度、辐条、槽码、砝码都走 `repeat`（InstancedMesh）；力的箭头 1 次；三角形 < 0.3 M（辐条 28 × 小管、两根 coil 约 25 k、纸团 4 k）。
- **默认不隐藏**：第 01 章 hero 是全台；各章 `hide` 只藏远处挡镜头的区（表"隐"列），截图验证。

### 3.5 summary / detail 要点（施工时写成 EN / ZH）

| id | summary（≤ 60 字符） | detail 要点 |
|---|---|---|
| ramp-board | Lets the car start from a set height. / 让小车从同一高度出发。 | 释放高度 3 / 6 / 9 cm（DESIGN）；同一高度 = 公平测试里"保持不变"的量 |
| glass-mat | A smooth surface for the car to run on. / 让小车跑的光滑表面。 | 跑得最远（F-12，SIM） |
| carpet-mat | A soft, furry surface that slows the car. / 柔软起绒的表面，让车慢下来。 | 绒毛被车轮压扁又弹起，很费劲（细看，不讲方向，D3） |
| toy-car | Rolls down the ramp and along the runway. / 沿斜面滚下、在跑道上滑行。 | 车的质量不影响滑行距离（模型里，S1）；轮子上的摩擦方向不讲（课纲 Note） |
| wooden-block | Pulled across each surface in turn. / 依次在各表面上被拉动。 | 200 g（DESIGN）；钩在端面，拉线水平 |
| brass-weights | Make the block heavier, pressing harder. / 让木块更重、压得更紧。 | 每只 200 g；越重，开始滑动所需的拉力越大（F-10） |
| pull-balance | Measures the pull in newtons. / 以牛顿为单位量拉力。 | 拉力越大弹簧伸得越长，指针沿刻度走（第 05 章同一道理）；0–10 N（DESIGN，F-24） |
| sandpaper-lane | The roughest surface on the board. / 板上最粗糙的表面。 | 颗粒互相卡住（细看）；μ 示意值（F-7） |
| test-spring | Stretches more when more weight hangs on it. / 挂得越重，伸得越长。 | 每 50 g 伸 1.0 cm，300 g 以内能回原长（F-15，DESIGN） |
| slotted-masses | Each slotted mass adds 50 grams. / 每片槽码 50 克。 | 槽口错开，防止滑落 |
| weigh-balance | Shows an object's weight. / 称出物体的重量。 | 重量 = 重力对它的拉力；读数 N（F-16） |
| steel-ball-large | Eight times as heavy as the small ball. / 是小球的八倍重。 | 225 g vs 28 g（F-17）；同时落地（F-14） |
| paper-flat | Same paper as the ball, spread out wide. / 和纸团是同一张纸，摊开了。 | 空气向上推它，落得慢（F-13、F-14） |
| wheel | Spins until friction stops it. / 一直转，直到摩擦力让它停下。 | 起转 2 圈 / 秒；不捏刹车约 80 秒才停（SIM） |
| brake-caliper | Squeezes rubber pads against the rim. / 把橡胶刹车块夹紧在轮圈上。 | 捏得越紧摩擦越大、停得越快；湿了变差（F-19） |
| shoe-soles | Grooves help a sole grip the floor. / 沟纹让鞋底抓得住地面。 | 鞋在木地 vs 冰上（F-9） |
| sponge | A force can change an object's shape. / 力可以改变物体的形状。 | 拿开砝码后海绵弹回 |
| bar-magnet | Pushes the car away without touching it. / 不用接触就把小车推开。 | 同极相斥（docs/22 第 03 章） |
| push-rod | Gives the car a short push. / 给小车短短推一下。 | 代替手；推的方向决定作用（F-21） |

---

## 4. 引擎：`sim.kind: 'force'` 与 F0–F9

### 4.1 要看得见的物理（课纲 → 画面 → 机制）

| 课纲点 | 画面 | 机制 |
|---|---|---|
| 力能使静止物体运动、加快、减慢、改变方向、停下 | 推杆从后 / 前 / 侧推一下；小车在玻璃跑道上照推后的速度走；推力箭头一闪 | `force.push` → 时间线 `push-run`（F2）；箭头 `f-push`（F3） |
| 改变形状 | 砝码压扁海绵、弹簧被拉长 | 姿态；F4 |
| 磁力不用接触 | 车尾磁铁与条形磁铁同极相对，小车被推开，两支磁力箭头 | 姿态 + 时间线 `magnet-run`（同 push 模型，Δv 固定）；箭头 `pole-n` |
| 重力；轻重同落 | 两只钢球同时落进沙盘（放慢 4 倍），沙面出现两个坑 | `force.fall` → `drop-run`；重力箭头 |
| 空气的影响 | 纸团与摊平的纸：纸团先落地，纸慢慢飘下 | 同上（阻力项） |
| 重量 | 称重弹簧秤上挂球：指针走到 2.2 N | `weight` 输出 → `stretch` + `offset` |
| 摩擦力：静止时也有；开始滑动 > 保持滑动 | 拉线拉紧、指针升到 1.0 N 木块才动，动起来指针退到 0.6 N；摩擦力箭头与拉力箭头等长反向 | `force.slide` → `pull-run`（通道 x、pull）；箭头跟时间线通道 |
| 表面 / 重量对摩擦的影响 | 换道、加砝码，读数变 | 同上 |
| 摩擦力对运动的影响 | 车从同一高度滑下，在玻璃 / 木 / 地毯上滑出 120 / 80 / 29 cm（9 cm 高时） | `force.roll` → `car-run` |
| 弹簧的弹力 | 加一片槽码，弹簧伸长、振几下停；弹力箭头向上、重力箭头向下 | `force.spring` → `extension`；F4 settle |
| 拉过头 | 400 g 时伸 9.2 cm，取下后停在 9.2 → 1.2 cm 而不是 0 | 同上，`unload` |
| 刹车 | 轮子 2 圈 / 秒转着，捏刹车：刹车块贴上，轮子 0.6 s 停下 | `force.brake` → `wheel-run` |

### 4.2 模型（设计研究 S1 的内容；`lib/sim/force.ts`，纯函数，有单测）

全部同步、确定、< 1 ms；只在控件值变化时算。g = 9.8 N/kg（`force.g`）。读数按输出的 `decimals` 四舍五入后才进 PLATE / 卡片 / 表（模型内部用全精度，单测按 3 位有效数字）。

1. **推（`push`）**：车质量不进模型，推 = 速度增量 Δv（m/s，按选项）。`car-start = moving` 时车从斜面滑下，在推点（跑道 x = 0.25 m 处）速度 v₀ = 0.6 m/s（模型反算释放高度），`rest` 时车停在推点。推后速度 v₁ = v₀ + Δv（向量，跑道平面）。输出 `effect`（状态）：|v₀| < 0.01 且 |v₁| ≥ 0.01 → `starts`；|v₁| < 0.01 且 |v₀| ≥ 0.01 → `stops`；方向变化 > 10° → `turns`；|v₁| > |v₀| × 1.05 → `speeds-up`；< 0.95 → `slows-down`；否则 `none`。`speed-before`、`speed-after`（m/s，2 位）。推后照玻璃跑道的滚动系数减速（a = 0.06 × g，F-11）直到停或到跑道端（跑道端有挡板，车停在挡板前）。侧推时车的朝向转到 v₁ 方向（时间线通道 `heading`）。
2. **落体（`fall`）**：每个物体 `{ m, cd, area }`；dv/dt = g − (½ ρ C A / m) v²，ρ = 1.21；1 ms 步长显式积分到下落高度 h（`drop-height`）；输出 `t-left`、`t-right`（s，2 位）、`landing`（状态：|Δt| < 0.03 s → `together`，否则 `left-first` / `right-first`）。时间线 `drop-run` 每 10 ms 一个采样（≤ 160 点 / 物体）。`pair` 选项 → 左右两个物体：`balls` = 小钢球 | 大钢球；`papers` = 纸团 | 摊平的纸；`ball-paper` = 大钢球 | 摊平的纸；`ball-crumpled` = 大钢球 | 纸团。`weigh`（称重）→ `weight` = m × g（N，1 位）；纸 0.05 N 显示 0.0，卡片另起一行写"too light for this balance to show / 太轻，这只秤读不出"（`weight < 0.05` 的状态输出 `weigh-note`）。
3. **滑动摩擦（`slide`）**：m = 0.2 + 0.2 × 砝码只数（kg）；`f-start` = μs m g，`f-move` = μk m g（N，1 位）。时间线 `pull-run`：0–1.2 s 拉力从 0 线性升到 `f-start`（木块不动，秤的弹簧伸长、指针走）；1.2 s 起木块以 0.15 m/s 匀速滑 0.25 m（拉力降到 `f-move`，0.1 s 过渡）；通道 `x`（木块与秤一起）、`pull`（N，驱动秤的弹簧伸长与指针）、`friction`（N，箭头用：拉住时等于拉力，滑动时等于 `f-move`）。
4. **滚动（`roll`）**：释放高度 h（`ramp-height`，cm）；跑道起点速度 v₀ = √(2 g h η)，η = 0.8（斜面损失，DESIGN）；跑道上匀减速 a = c g（c 按表面）；`distance` = η h ÷ c（cm，0 位）、`run-time` = v₀ ÷ a（s，1 位）。时间线 `car-run`：斜面段（匀加速 g sin θ × η 的等效值，到坡底速度 v₀）+ 跑道段（匀减速）；通道 `x`、`y`（沿斜面）、`spin`（车轮角度 = 路程 ÷ 轮半径 0.011 m）。距离超出跑道（> 125 cm）时停在端挡板前，`distance` 写 `125+`（状态 `off-end`，卡片写"reached the end of the runway / 到了跑道尽头"）——默认的三种表面 × 三档高度都不会触发，单测保证。
5. **弹簧（`spring`）**：载荷 L（`spring-load`，g）；L ≤ 300：`extension` = L ÷ 50 × 1.0 cm；L > 300：6.0 + n + 0.3 n²（n = (L − 300) ÷ 50）；`unload = true`：`extension` = 永久伸长 `set`（≤ 300 为 0；350 → 0.4；400 → 1.2 cm，数据给表）；`spring-length` = 8.0 + `extension`；`load-weight` = L ÷ 1000 × g（N，1 位；`unload` 时 0）；`returns`（状态：`returns` / `stays-longer`，只在 `unload` 时有意义，否则 `loaded`）。
6. **刹车（`brake`）**：ω₀ = 2 圈 / 秒；摩擦力矩 τ = τ₀ + 2 μ N r（τ₀ 0.005 N·m、μ 0.6、r 0.18 m、N 按 `squeeze`）；I = 0.032 kg·m²；`stop-time` = I ω₀ ÷ τ（s，1 位）、`turns` = ω₀ t ÷ 2 ÷ 2π（圈，1 位）。时间线 `wheel-run`：通道 `spin`（匀减速）；"不捏"时 80 s，照常放完（读者随时可换值打断）。
7. **与真实的差别（S1 与细看必须写）**：滚动系数与刹车数字是为了"装得进实验台、看得清"而取的示意值，**排序是对的，数字不是实测**；真纸会翻飞、侧滑，比模型落得更慢更乱；木块的摩擦系数在同一块板上也会因灰尘、湿度而变；每次试验模型给同一个数，真实实验要重复几次取平均。

### 4.3 数据形状（`parts.json` 的 `sim`）

```jsonc
"sim": {
  "kind": "force",
  "controls": [
    { "id": "push", "kind": "choice", "default": "behind", "label": {en, zh},
      "options": [ {"id":"behind"}, {"id":"front"}, {"id":"front-firm"}, {"id":"side"} ] },            // 各带 {en, zh}
    { "id": "car-start", "kind": "choice", "default": "moving", "options": [ {"id":"rest"}, {"id":"moving"} ], … },
    { "id": "pair", "kind": "choice", "default": "balls", "options": [ "balls", "papers", "ball-paper", "ball-crumpled" ], … },
    { "id": "drop-height", "kind": "step", "values": [0.5, 1.0, 1.5], "default": 1.0, "unit": "m", … },
    { "id": "weigh", "kind": "choice", "default": "none", "options": [ "none", "small-ball", "large-ball", "paper" ], … },
    { "id": "lane", "kind": "choice", "default": "wood", "options": [ "glass", "wood", "sandpaper" ], … },
    { "id": "block-load", "kind": "step", "values": [0, 200, 400], "default": 0, "unit": "g", … },
    { "id": "runway", "kind": "choice", "default": "wood", "options": [ "glass", "wood", "carpet" ], … },
    { "id": "ramp-height", "kind": "step", "values": [3, 6, 9], "default": 6, "unit": "cm", … },
    { "id": "spring-load", "kind": "step", "values": [0, 50, 100, 150, 200, 250, 300, 350, 400], "default": 0, "unit": "g", … },
    { "id": "unload", "kind": "toggle", "default": false, … },
    { "id": "squeeze", "kind": "choice", "default": "off", "options": [ "off", "light", "firm" ], … },
    { "id": "squash", "kind": "toggle", "default": false, … },          // 不进卡片：第 01 章的拍用（海绵）
    { "id": "magnet-push", "kind": "toggle", "default": false, … }      // 不进卡片：第 01 章的拍用（磁力）
  ],
  "outputs": [
    { "id": "effect", "kind": "state", "states": { "none": {…}, "starts": {…}, "speeds-up": {…}, "slows-down": {…}, "stops": {…}, "turns": {…} } },
    { "id": "speed-before", "unit": "m/s", "decimals": 2 }, { "id": "speed-after", "unit": "m/s", "decimals": 2 },
    { "id": "t-left", "unit": "s", "decimals": 2 }, { "id": "t-right", "unit": "s", "decimals": 2 },
    { "id": "landing", "kind": "state", "states": { "together": {…}, "left-first": {…}, "right-first": {…} } },
    { "id": "weight", "unit": "N", "decimals": 1 }, { "id": "weigh-note", "kind": "state", … },
    { "id": "f-start", "unit": "N", "decimals": 1 }, { "id": "f-move", "unit": "N", "decimals": 1 },
    { "id": "distance", "unit": "cm", "decimals": 0 }, { "id": "run-time", "unit": "s", "decimals": 1 },
    { "id": "extension", "unit": "cm", "decimals": 1 }, { "id": "spring-length", "unit": "cm", "decimals": 1 },
    { "id": "load-weight", "unit": "N", "decimals": 1 }, { "id": "returns", "kind": "state", … },
    { "id": "stop-time", "unit": "s", "decimals": 1 }, { "id": "turns", "decimals": 1 },
    { "id": "push-run", "kind": "timeline" }, { "id": "magnet-run", "kind": "timeline" }, { "id": "drop-run", "kind": "timeline" },
    { "id": "pull-run", "kind": "timeline" }, { "id": "car-run", "kind": "timeline" }, { "id": "wheel-run", "kind": "timeline" }
  ],
  "bind": [
    { "output": "car-run", "part": ["toy-car", "car-wheels"], "play": { "channels": { "x": [1,0,0], "y": "ramp" } } },   // "ramp"：沿斜面方向（force.roll.ramp 给出）
    { "output": "car-run", "part": "car-wheels", "play": { "channel": "spin", "turn": [0,0,1], "each": true } },          // 每只轮绕自己的中心
    { "output": "pull-run", "part": ["wooden-block", "brass-weights", "pull-balance", "pull-balance-spring", "pull-balance-pointer", "pull-string"], "play": { "channel": "x", "axis": [1,0,0] } },
    { "output": "pull-run", "part": "pull-balance-spring", "stretch": { "channel": "pull", "per": 0.010 } },
    { "output": "pull-run", "part": "pull-balance-pointer", "play": { "channel": "pull", "axis": [1,0,0], "per": 0.010 } },
    { "output": "drop-run", "part": "steel-ball-small", "play": { "channel": "@side", "axis": [0,-1,0] } },               // @side：这个物体在左还是右由 pair 决定
    { "output": "extension", "part": "test-spring", "stretch": { "per": 0.01, "settle": { "period": 0.7, "damping": 0.15 } } },
    { "output": "extension", "part": ["mass-hanger", "slotted-masses"], "offset": { "axis": [0,-1,0], "per": 0.01, "settle": { "period": 0.7, "damping": 0.15 } } },
    { "control": "spring-load", "part": "slotted-masses", "count": { "per": 50, "minus": 50 } },
    { "control": "lane", "part": ["wooden-block", "brass-weights", "pull-balance", "pull-balance-spring", "pull-balance-pointer", "pull-string"], "pose": { "glass": "lane-glass", "wood": null, "sandpaper": "lane-sand" } },
    { "control": "block-load", "part": "brass-weights", "count": { "per": 200 } },
    { "control": "runway", "part": "glass-mat", "visible": { "eq": "glass" } },
    { "control": "runway", "part": "carpet-mat", "visible": { "eq": "carpet" } },
    { "control": "squeeze", "part": ["brake-caliper", "brake-lever"], "pose": { "off": null, "light": "brake-light", "firm": "brake-firm" } },
    { "output": "wheel-run", "part": "wheel", "play": { "channel": "spin", "turn": [0,0,1] } },
    { "output": "weight", "part": "weigh-balance-spring", "stretch": { "per": 0.010, "settle": { "period": 0.6, "damping": 0.2 } } },
    { "output": "weight", "part": "weigh-balance-pointer", "offset": { "axis": [0,-1,0], "per": 0.010, "settle": { "period": 0.6, "damping": 0.2 } } },
    …
  ],
  "overlays": [
    { "kind": "force-vectors", "arrows": [
      { "part": "wooden-block", "force": "push", "dir": [1,0,0], "value": { "output": "pull-run", "channel": "pull" } },
      { "part": "wooden-block", "force": "friction", "dir": [-1,0,0], "value": { "output": "pull-run", "channel": "friction" } },
      { "part": "mass-hanger", "force": "gravity", "dir": [0,-1,0], "value": { "output": "load-weight" } },
      { "part": "mass-hanger", "force": "elastic", "dir": [0,1,0], "value": { "output": "load-weight" }, "at": "top" },
      { "part": "steel-ball-large", "force": "gravity", "dir": [0,-1,0], "value": 2.2, "when": { "control": "pair", "is": { "in": ["balls", "ball-paper", "ball-crumpled"] } } },
      { "part": "brake-caliper", "force": "friction", "dir": "tangent", "value": { "output": "wheel-run", "channel": "brake" } },
      { "part": "toy-car", "force": "push", "dir": "@push", "value": { "output": "push-run", "channel": "push" } },
      { "part": "car-magnet", "force": "magnetic", "dir": [1,0,0], "value": { "output": "magnet-run", "channel": "push" } }
    ], "per": 0.03, "max": 0.25 }
  ],
  "force": {
    "g": 9.8,
    "push":  { "speed": 0.6, "at": 0.25, "dv": { "behind": [0.3,0,0], "front": [-0.3,0,0], "front-firm": [-0.6,0,0], "side": [0,0,0.3] }, "surface": "glass", "start": "car-start", "choice": "push" },
    "magnet":{ "toggle": "magnet-push", "dv": [0.4,0,0] },
    "fall":  { "air": 1.21, "height": "drop-height", "pair": "pair", "slow": 4,
               "objects": { "small-ball": { "part": "steel-ball-small", "m": 0.0282, "cd": 0.45, "area": 2.835e-4 },
                            "large-ball": { "part": "steel-ball-large", "m": 0.225, "cd": 0.45, "area": 1.134e-3 },
                            "crumpled":   { "part": "paper-crumpled", "m": 0.005, "cd": 0.6, "area": 1.963e-3 },
                            "flat":       { "part": "paper-flat", "m": 0.005, "cd": 1.12, "area": 6.237e-2 } },
               "pairs": { "balls": ["small-ball", "large-ball"], "papers": ["crumpled", "flat"], "ball-paper": ["large-ball", "flat"], "ball-crumpled": ["large-ball", "crumpled"] },
               "weigh": { "control": "weigh", "map": { "small-ball": "small-ball", "large-ball": "large-ball", "paper": "flat" } } },
    "slide": { "block": 0.2, "per": 0.2, "load": "block-load", "lane": "lane", "rise": 1.2, "speed": 0.15, "travel": 0.25,
               "surfaces": { "glass": [0.25, 0.20], "wood": [0.50, 0.30], "sandpaper": [0.90, 0.70] } },              // [静, 动]
    "roll":  { "height": "ramp-height", "surface": "runway", "loss": 0.2, "wheel": 0.011, "runway": 1.25, "ramp": { "angle": 14, "dir": [0.970, -0.242, 0] },
               "rolling": { "glass": 0.06, "wood": 0.09, "carpet": 0.25 } },
    "spring":{ "load": "spring-load", "unload": "unload", "per50": 1.0, "length": 8.0, "limit": 300, "beyond": [1.0, 0.3], "set": { "350": 0.4, "400": 1.2 } },
    "brake": { "squeeze": "squeeze", "rps": 2, "inertia": 0.032, "radius": 0.18, "mu": 0.6, "hub": 0.005, "force": { "off": 0, "light": 1, "firm": 3 } }
  }
}
```

章 / 拍里照 docs/06「试一试」现有写法（`state.sim.set`、`try.vary / also / keep / observe / record / predict`），另加：`record: { chart: true }`（F5）；`predict.observe` 可以是状态输出（F6，揭晓写状态的标签）；`try.replay: true` 显示"再跑一次"（F2）。

### 4.4 引擎件 F0–F9（E-FORCE）

| # | 件 | 现状（2026-10-18 查代码） | 最小方案 | 退路 | 优先级 |
|---|---|---|---|---|---|
| F0 | SpaceScene 下的背景章 | core 支持（`core/chapters.ts`），SpaceScene 没有主题用过 | 验证 00 的编号、章节轴（不进段）、阅读面板眉题、演示开场；缺什么补什么；`sample-space` 加一个 00 章做回归 | 不要 00 章，内容并进 01 的细看 | 必须（验证 + 小修） |
| F1 | 模型 `lib/sim/force.ts` + schema `force` 段 | `lib/sim/index.ts` 只有 `circuit`、`magnet` | §4.2 六个子模型（各自可选，数据里没写的子模型不算）；注册进 `simQuantities`；`sim-schema.ts` 的 `forceIssues`：子模型引用的控件存在且种类对、表面选项 ⊂ `surfaces`、μs ≥ μk > 0、`pairs` 的物体存在、物体的 `part` 有 primitive、弹簧 `limit` 是 `spring-load` 的一个值、`set` 的键 > `limit`、时间线输出只被 `play` / `stretch` / 箭头引用、默认值下 `distance` 不超跑道 | — | 必须 |
| F2 | **时间线输出与回放**（`kind: 'timeline'`，绑定 `play`） | 绑定只有 `offset` / `rotate` 0.5 s 缓动与 `settle` | 时间线 = `{ duration, channels: { <名>: 分段匀加速 [{t0, t1, x0, v0, a}] 或采样 [{t, x}] } }`（模型给；采样 ≤ 256 点、线性插值）；`play` 绑定把通道值沿 `axis`（或 `"ramp"` 方向、或 `turn` 轴转角，`each` = repeat 每份绕自己中心）加在姿态之后（叠加顺序同 S4，在 offset 之后）；**值变化 → 0.4 s 后自动从 0 播放**；卡片"再跑一次 / Run again"按钮（`try.replay`，44 px）与键 `G`（命令 `sim-replay`，注册前查 `core/keys.ts` 没占用）写同一个 store 计数；`slow` 倍数放慢（卡片芯片"slowed down 4 times / 放慢 4 倍"）；深链接、截图、拍的瞬切、REFERENCE、减少动态时直接终态；播放中舞台只在播放的零件上要帧，结束后停帧；EXPLODED 时暂停并回到终态（同 sim 绑定的规则）；`__atlas.engine.sim().timeline` 给当前播放时刻，`__atlas.engine.simSeek(id, t)` 供截图 | 只用 `offset` 0.5 s 缓动到终点（失去"慢下来"的观感） | 必须 |
| F3 | **力的箭头** `overlays: force-vectors` | 只有 `force-arrows`（两零件之间的吸 / 斥） | 每支箭头 `{ part, force, dir, value, at?, when? }`：`force` ∈ `gravity / friction / elastic / push / magnetic` → token；`dir` 向量、`"tangent"`（轮缘切向，与转向相反）或 `"@push"`（推的方向）；`value` = 数、数输出或时间线通道；长度 = `per` × N（默认 0.03 m/N，≤ `max`）；起点在零件包围盒的中心 / 顶 / 底（`at`）；一次绘制（实例化 cylinder + cone，平涂）；随零件的 `play` / offset 走；< 0.05 N 淡出；**KEY 图例**自动列出本章出现的力（色块 + "Gravitational force / 重力"…）；LAYERS 一行 `forces`（键无，默认开）；不画在滚动的车轮上（validate 拒绝 `part` 是 `car-wheels` 的 friction 箭头） | 只用 PLATE 读数 | 必须 |
| F4 | **弹簧伸缩** `stretch` 绑定 + `offset` / `stretch` 的 `settle` | `coil` 有固定 `length`；`settle` 只给 `rotate` | `stretch`：coil 的 length = 原长 + 值 × per，**圈距变大、钢丝截面不变**（顶点着色器按每个顶点的螺旋参数 t 重算 y，`coil` 几何加一个 `t` 属性；或值变化时重建几何，≤ 2 k 顶点）；上端固定（`anchor: top` 默认）；`settle` 推广到 `offset` 与 `stretch`（同一二阶阻尼振子，`lib/sim/settle.ts`）；挂在弹簧下的零件用同一值同一 settle，保证不脱节 | 姿态 `scale`（钢丝会变粗，不推荐） | 必须 |
| F5 | **数据表下的小图** `record: { chart: true }` | 只有表 | `explorer/TryChart.tsx`：≥ 2 行时画；改变量是步进 → 折线（点 + 线，x 轴按值），是选择 → 条形（按选项顺序）；y = 第一个观察量（或 `chart: { y: "<output>" }`）；hairline 坐标轴、mono 数字、轴标题 = 标签 + 单位；墨色 + signal 当前行；`role="img"` + `aria-label`（"Extension rises by 1.0 cm for every 50 g up to 300 g…" 由数据自动拼：首末值与是否单调）；表仍是可读屏的主体；手机抽屉里同宽 | 只有表 | 应该（PSLE 读图） |
| F6 | 读数与先猜后看的小扩展 | `follow` 一个输出；`predict.observe` 只认数 | ① `telemetry` 行 `follow: ["t-left", "t-right"]` 两值同行（"0.45 · 0.45 s"）；② 行 `scope: "observe"`：本章卡片没观察这个输出时显示 `—`（取代磁铁的 `clips` 别名做法，磁铁不改）；③ `predict.observe` 是状态输出时，选项写 `means: "<状态 id>"`，揭晓写状态标签 | 每章只放相关读数行（不可能：PLATE 行是全主题的） | 必须 |
| F7 | 材质：`fabric`（地毯 `pile` 绒毛法线 + 粗糙度）、`abrasive`（砂纸 / 沙 `sand` 颗粒法线）；token `f-gravity`、`f-friction`、`f-elastic`、`f-push` | 无 | `lib/color.ts` 两个材质族 + `textures.ts` 两种固定种子的程序化法线；`src/theme/tokens.css` + `theme.ts` 四个 token（建议：重力 石板灰蓝、摩擦 赭褐、弹力 橄榄绿、推拉 暗梅；两套主题都调到与 `hot` / `cold` / `signal` / `pole-n` 一眼区分、低饱和；cinema 不发光） | `plastic` + tint（地毯、砂纸认不出） | 必须 |
| F8 | `count` 绑定 `{ per, minus }` | `count: true` 或 `{ per }` | `minus`：先减再除（槽码片数 = (载荷 − 挂钩的 50 g) ÷ 50，`minus: 50`） | 挂钩也做成槽码的一份 | 应该 |
| F9 | 测试与文档 | — | 单测 `tests/space-scene/force.test.ts`（§2 F-10、F-12、F-14、F-16、F-20、F-21 全表 3 位有效数字；不变量：同高度轻重钢球 \|Δt\| < 0.005 s、纸团 < 摊平、距离 ∝ 高度、`f-start` > `f-move`、表面排序、载荷 ≤ 300 时线性且 `returns`、`turns` 随夹紧力单调减）、`timeline.test.ts`（分段与采样的插值、终态 = 输出值：车停在 `distance`、轮子停在 `turns` 圈）、`stretch` 与 settle 的单测、chart 的数据映射；`pnpm shoot <slug> --beats` 截终态；`--keys` 加 `G`；docs/06 新增「SpaceScene · 试一试 · 力（force）」一节、「时间线与回放」、「力的箭头」；`sample-space` 加一个最小的 `force` 例（弹簧 + 一块木块） | — | 必须 |

**规模**：`force.ts` 约 350 行、schema 约 200 行、时间线与 `play` 约 250 行、箭头约 200 行、stretch / settle 约 120 行、图约 180 行、测试约 500 行。**引擎 ≈ 6 天**（F1 1、F2 1.5、F3 1、F4 0.5、F5 1、F6 0.5、F7 0.5、F0 + F8 + 文档 0.5；可分两个代理：A = F1 + F2 + F4 + F8（`lib/sim/`、`PartNode.tsx`、`geometry.ts` 的 coil），B = F3 + F5 + F6 + F7（`SimOverlays.tsx`、`explorer/TryIt.tsx`、新 `TryChart.tsx`、`hud/`、`lib/color.ts`、`textures.ts`、`src/theme/`）；`sim-schema.ts` 归 A，B 要的字段先由 A 加好）。docs/17 §7 的 D0（变量面板 + 表 + 曲线）至此完整，D1（"2D 物理小引擎"）由 F1 + F2 代替：只做确定性的一维 / 平面运动，不做碰撞与刚体求解。

### 4.5 HUD 数据

- **规格行**（≤ 4）：`Spring` 1.0 cm per 50 g · up to 300 g（design）；`Wooden block` 200 g（design）；`Spring balances` 0–10 N（design，F-24）；`Gravity here` ≈ 9.8 N per kg（typical，F-3）。
- **PLATE 读数**（telemetry，全部 `follow`，SIM；F6）：Pull to start / 开始滑动的拉力 N（`f-start`，scope observe）；Distance / 滑行距离 cm（`distance`）；Fall time · L · R / 下落时间 · 左 · 右 s（`t-left`、`t-right`）；Weight / 重量 N（`weight`，第 05 章换 `load-weight`：用两行，各 scope observe）；Extension / 伸长 cm（`extension`）；Time to stop / 停下用时 s（`stop-time`）。≤ 6 行：`weight` 与 `load-weight` 合一行时用 F6 ①（`follow: ["weight", "load-weight"]`，只显示本章观察的那个）。块尾 `SIM <本章第一个状态输出> · <本章改变量的值>`（如 `SIM TOGETHER · BALLS · 1.0 M`）。
- **立面**：`views.section.plane = "xy"`（正视：斜面、弹簧、落体架的高度最清楚）。
- **镜头预设**（≤ 6，不与组同名）：`ramp-view`（斜面 + 跑道 3/4 前低机位）、`board-view`（摩擦板俯 45°）、`spring-view`（弹簧架正前近景）、`tower-view`（落体架全高，台右侧）、`wheel-view`（刹车轮 3/4）、`runway-top`（跑道正上方俯视，米尺看得清）。hero 用 `views.assembled.camera`：整台 3/4 前右上，距离约 3.2 m，落体架在右。
- **命名剖切**：无（本主题没有要剖开的东西；`views.cutaway` 默认面不用）。
- **模式组合**：X-RAY 只透明弹簧秤的窗与玻璃（shell）；EXPLODED + FLOW 照引擎禁用；EXPLODED 时回放暂停并显示终态、箭头淡出（F2、F3）；REFERENCE 冻结 sim 与回放。

### 4.6 不做（v2）

自由拖动小车、推杆、木块（要运行时重算时间线，约 2 天）；自己摆斜面角度（连续控件 + 斜面上的力分解，课纲外）；重复试验的随机散布（与"确定性模型"冲突，v1 只在细看讲）。

### 4.7 姿态与动画

| id | 类 | 内容 |
|---|---|---|
| 姿态 | `lane-glass`、`lane-sand`（木块组移到另一条道）、`brake-light`、`brake-firm`、`push-behind` / `push-front` / `push-side`（推杆就位）、`magnet-mounted`（车尾磁铁 + 条形磁铁对齐）、`sponge-squashed`（14 号砝码移到海绵上、海绵压扁）、`weigh-small` / `weigh-large` / `weigh-paper`（所称物体挂进网兜）、`balls-left-right` 等四种 `pair` 摆法、`spring-unloaded`（槽码放回台面） | 0.6–1.0 s |
| `wheel-idle` | 动画 rotate（`wheel`） | 只在第 06 章开头、未改值之前：2 圈 / 秒（可读速度），与 `wheel-run` 的起始转速一致；`enabled` ← 时间线未播放 |

---

## 5. 章节

### 5.0 总表

"hide"写远处挡镜头的区（§3.4"隐"列）。

| # | id | 标题 EN / ZH | sim.set | try（改变 / 不变 / 观察） | 镜头 | 拍 |
|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start / 开始之前 | — | — | hero | 4 |
| 01 | `pushes-and-pulls` | Pushes and pulls / 推和拉 | push behind, car-start moving | push / 同一辆车、同一条玻璃跑道 / effect、speed-after | ramp-view | 6 |
| 02 | `gravity-and-weight` | Gravity and weight / 重力与重量 | pair balls, drop-height 1.0 | pair / drop-height / t-left、t-right、landing | tower-view | 5 |
| 03 | `friction-starting` | Friction: getting things moving / 摩擦力：让东西动起来 | lane wood, block-load 0 | lane / block-load、同一块木块 / f-start、f-move | board-view | 5 |
| 04 | `friction-and-motion` | Friction slows moving things / 摩擦力让运动的物体慢下来 | runway wood, ramp-height 6 | runway / ramp-height、同一辆车 / distance | ramp-view | 5 |
| 05 | `elastic-spring-force` | Elastic spring force / 弹簧的弹力 | spring-load 0 | spring-load（also unload）/ 同一根弹簧 / extension | spring-view | 5 |
| 06 | `forces-at-work` | Forces at work / 生活中的力 | squeeze off | squeeze / 起转 2 圈每秒、同一只轮 / stop-time、turns | wheel-view | 5 |

### 5.0′ 第 00 章 `before-you-start`（背景章）

- **summary**：A bench of five experiments, one for each kind of force; in each chapter you change one thing and watch what happens. / 一张实验台、五套器材，每套讲一种力；每一章你改一个量，看会发生什么。
- **`state.note`**（阅读说明）：EN "The numbers on this bench come from a simple model of each experiment, worked out the same way every time. They show the right patterns; real measurements would differ a little." / ZH "这张实验台上的数字来自每个实验的一个简单模型，每次算出来都一样。规律是对的；真实测量会有些出入。"
- **正文提纲**：① 台上五区（§3.1）。② 试一试卡片：改变 / 不变 / 观察三行；为什么一次只改一个量（公平测试，S2 第 15 页）。③ 记一行、表下的图、再跑一次（键 `G`）。④ 力的箭头与颜色。⑤ 数字是模型（S1）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | hero；labels ramp-board, wooden-block, test-spring, drop-stand, wheel | This bench holds five experiments: a ramp and runway, a friction board, a spring stand, a drop tower and a bicycle wheel with a brake. / 这张实验台上有五套实验：斜面和跑道、摩擦板、弹簧架、落体架，还有一只带刹车的自行车轮。 |
| 2 | camera ramp-view；labels toy-car, ramp-board, glass-mat, carpet-mat | In each chapter you change one thing, such as the surface under the car, and keep everything else the same. That is a fair test. / 每一章你只改一样东西，比如车下的表面，其余都保持不变。这就是公平测试。 |
| 3 | camera spring-view；sim spring-load 100；labels test-spring, slotted-masses | Each result can go into a table, and the table becomes a graph. Here, each slotted mass stretches the spring a little further. / 每次的结果都能记进表里，表再画成图。这里每加一片槽码，弹簧就伸长一点。 |
| 4 | 同上；layers + forces；labels mass-hanger | Coloured arrows show the forces. Grey blue is gravity pulling down, green is the spring pulling up. / 彩色箭头表示力。灰蓝色是向下拉的重力，绿色是向上拉的弹簧的弹力。 |

- **本章索引**：ramp-board, toy-car, friction-board, wooden-block, test-spring, slotted-masses, drop-stand, wheel
- **名词首现**：force、fair-test。

### 5.1 第 01 章 `pushes-and-pulls`

- **summary**：A force is a push or a pull; it can start, speed up, slow down, turn or stop a moving thing, and it can change a thing's shape. / 力是推或拉；它能让东西动起来、加快、减慢、转向或停下，还能改变东西的形状。
- **正文提纲**：① 力是推或拉（F-1）。② 五种作用，每种一个画面（F-21）。③ 改变形状：海绵、弹簧。④ 有的力要接触（推杆、摩擦），有的不用（磁力、重力）。⑤ 四种力的名字，后面几章各讲一种。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章；sim car-start rest, push behind；labels toy-car, push-rod | The car sits still on the glass runway. A short push from behind and it starts to move. A force can move a still object. / 小车静静停在玻璃跑道上。从后面轻推一下，它就动起来了。力能让静止的物体运动。 |
| 2 | sim car-start moving, push behind → front（拍终值 front） | The car is already rolling. Push it from behind and it speeds up; push it from the front and it slows down. / 小车已经在滚动。从后面推，它加快；从前面推，它减慢。 |
| 3 | sim push side；camera runway-top | Push it from the side and it keeps about the same speed but changes direction. / 从侧面推，它的快慢差不多，方向却变了。 |
| 4 | sim push front-firm；然后 magnet-push true（另一拍内状态：车尾磁铁、条形磁铁）；labels car-magnet, bar-magnet | A firm push from the front stops it. A magnet can push too, without touching: like poles facing, and the car is pushed away. / 从前面用力一推，它就停下。磁铁也能推，而且不用接触：同极相对，小车被推开了。 |
| 5 | camera 台中央；sim squash true；labels sponge, brass-weights | A force can also change shape. The weight presses the sponge flat; take it off and the sponge springs back. / 力还能改变形状。砝码把海绵压扁；拿开砝码，海绵又弹回原样。 |
| 6 | hero；layers + forces；labels wooden-block, test-spring, steel-ball-large, car-magnet | Four kinds of force act on this bench: magnetic force, gravitational force, elastic spring force and frictional force. Each of the next chapters looks at one. / 这张台上有四种力：磁力、重力、弹簧的弹力和摩擦力。接下来几章各讲一种。 |

- **试一试**：`vary: push`，`also: [car-start]`，`keep: [{ en: "Same car", zh: "同一辆车" }, { en: "Same glass runway", zh: "同一条玻璃跑道" }]`，`observe: [effect, speed-after]`，`replay: true`；`predict`：prompt "The car is rolling. Push it firmly from the front. What happens?" / "小车在滚动。从前面用力推一下，会怎样？"，start `{ car-start: moving, push: behind }`，change `{ push: front-firm }`，options 加快 / 减慢 / 停下 / 转向（`means` = 状态 id，F6 ③），observe `effect`。
- **细看**：`Contact and non-contact forces`（推杆、摩擦要接触；磁力、重力不用，F-1、docs/22 链接）；`About this model`（推 = 给一个速度增量；推后车在玻璃上照第 04 章的系数慢下来，S1）；`Why a rod, not a hand`（一句话，D15 不必写进正文——删掉也可）。
- **本章索引**：toy-car, push-rod, glass-mat, car-magnet, bar-magnet, sponge, brass-weights
- **名词首现**：push、pull、stationary、magnetic-force、gravitational-force、frictional-force、elastic-spring-force。

### 5.2 第 02 章 `gravity-and-weight`

- **summary**：Gravity pulls everything towards the ground; without the air in the way, heavy and light things fall together, and the pull of gravity on an object is its weight. / 重力把一切拉向地面；没有空气挡着，轻的和重的一起落下；重力对物体的拉力就是它的重量。
- **正文提纲**：① 重力不用接触，把东西拉向地球（F-1）。② 轻重两球同落（M1，F-14、F-5）。③ 同一张纸，团起来与摊开（M2，F-13、F-14）：空气向上推它。④ 重量：弹簧秤称出重力对它的拉力（F-16）；重量与质量（M8，F-4 细看）。⑤ 电梯：钢缆向上拉、重力向下（F-23，图）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（tower-view）；labels steel-ball-small, steel-ball-large, release-clamps | Two steel balls wait one metre above a tray of sand. The big one is about eight times as heavy as the small one. / 两只钢球停在沙盘上方一米处。大的约是小的八倍重。 |
| 2 | 回放 drop-run；layers + forces；labels steel-ball-small, steel-ball-large, sand-tray | Release them together. Nothing touches them, yet gravity pulls both down. Shown four times slower, they land at the same moment. / 一起放手。没有东西碰它们，重力却把两只都拉了下去。画面放慢四倍：它们同时落地。 |
| 3 | 同上；labels sand-tray | In this model both take about 0.45 seconds to fall one metre. Being heavier does not make the big ball fall faster. / 在这个模型里，两只球落下一米都用了约零点四五秒。更重并没有让大球落得更快。 |
| 4 | sim pair papers；labels paper-crumpled, paper-flat | Now two sheets of the same paper, one crumpled into a ball. The ball drops in under half a second; the flat sheet drifts down in about one second. The air pushes back on the wide sheet much more. / 换成两张一样的纸，一张揉成团。纸团不到半秒就落地，摊平的纸飘了约一秒。空气对宽大的纸片向上推得多得多。 |
| 5 | camera spring-view（称重秤）；sim weigh large-ball；labels weigh-balance, weigh-balance-pointer | Hang the big ball on a spring balance and it reads about 2.2 newtons. That is its weight: the pull of gravity on it. / 把大球挂在弹簧秤上，读数约二点二牛顿。这就是它的重量：重力对它的拉力。 |

- **试一试**：`vary: pair`，`keep: [drop-height]`，`observe: [t-left, t-right, landing]`，`record: { chart: true }`（条形：两组柱），`replay: true`；`predict`：prompt "Drop the small and the big steel ball together. Which lands first?" / "小钢球和大钢球一起放手，哪个先落地？"，change `{ pair: balls }`（start `{ pair: ball-paper }`），options big first / small first / together（`means` = `left-first` / `right-first` / `together` 对应），observe `landing`。
- **细看**：`Air resistance`（这个词，课纲不要求，S2 第 64 页；空气阻力随速度变大，F-13）；`The hammer and the feather`（F-5，Apollo 15；伽利略 1638，S12）；`Mass and weight`（质量用 g、kg，到哪里都一样；重量用 N，月球上约是地球上的 0.165，F-4；"1 kg 的重量约 10 N"，中学会学）；`Lifts`（`<Figure src="figures/forces-lift">`，F-23）；`About this model`（真纸会翻飞，F-14）。
- **本章索引**：drop-stand, release-clamps, steel-ball-small, steel-ball-large, paper-crumpled, paper-flat, sand-tray, weigh-balance
- **名词首现**：weight、mass、spring-balance、newton。

### 5.3 第 03 章 `friction-starting`

- **summary**：Friction acts between two surfaces even before they slide; rougher surfaces and heavier objects need a bigger pull to get moving. / 两个表面之间，还没滑动就已经有摩擦力；表面越粗糙、物体越重，要拉动它的力越大。
- **正文提纲**：① 用弹簧秤水平拉木块，读数一点点升，木块不动（M4、M5）：摩擦力顶住了拉力。② 到 1.0 N 才开始滑；滑起来只要 0.6 N（F-6、F-10）。③ 换道：玻璃 0.5、木 1.0、砂纸 1.8 N（F-7、F-10）——公平测试：同一块木块、同样的砝码。④ 加砝码：压得越紧摩擦越大（F-10）。⑤ 与面积无关（细看，F-8）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（board-view）；labels wooden-block, pull-balance, friction-board | A wooden block rests on the wooden lane, hooked to a spring balance. The balance measures the pull in newtons. / 一块木块放在木面道上，钩在弹簧秤上。弹簧秤以牛顿为单位量拉力。 |
| 2 | 回放 pull-run（停在 1.1 s 前：`simSeek`）；layers + forces；labels pull-balance-pointer, wooden-block | Pull gently. The reading climbs, but the block does not move: friction between the surfaces pulls back just as hard. Still things can have forces on them. / 轻轻拉。读数在升，木块却不动：两个表面之间的摩擦力往回拉，正好一样大。不动的东西身上也可以有力。 |
| 3 | 回放到终态；labels pull-balance-pointer | At about one newton the block starts to slide. Once it is moving, a pull of about 0.6 newtons keeps it going. / 拉到约一牛顿，木块开始滑动。滑起来以后，约零点六牛顿的拉力就能让它一直滑下去。 |
| 4 | sim lane sandpaper；labels sandpaper-lane, pull-balance-pointer | On sandpaper the block needs about 1.8 newtons to start; on glass, only about 0.5. The rougher the surface, the greater the friction. / 在砂纸上，木块要约一点八牛顿才开始滑；在玻璃上只要约零点五。表面越粗糙，摩擦力越大。 |
| 5 | sim lane wood, block-load 400；labels brass-weights | Back on wood, add two brass weights. The heavier block presses harder on the lane and needs about 2.9 newtons to start. / 回到木面道，加两只黄铜砝码。木块更重，压得更紧，要约二点九牛顿才开始滑。 |

- **试一试**：`vary: lane`，`keep: [block-load, { en: "Same block", zh: "同一块木块" }, { en: "Pull level and steady", zh: "水平、平稳地拉" }]`，`observe: [f-start, f-move]`，`record: { chart: true }`，`replay: true`；`predict`："Which lane needs the biggest pull to start the block?" / "哪条道要最大的拉力才能让木块滑动？"→ start `{ lane: glass }`，change `{ lane: sandpaper }`，options more / less / same，observe `f-start`。（砝码只数是本章的第二个公平测试：第 5 拍由拍的 `sim.set` 演示，细看 `Heavier block, more friction` 列出 0 / 200 / 400 g 三行读数；不放进同一张卡，免得一张表里改了两个量。）
- **细看**：`Why rough surfaces grip`（表面高低不平的地方互相卡住；砂纸的颗粒）；`Bigger area, same friction`（F-8：木块立起来拉，读数一样，模型也一样）；`Starting is harder than keeping going`（F-6）；`Heavier block, more friction`（F-10 三行：木面道 0 / 200 / 400 g → 1.0 / 2.0 / 2.9 N）；`About this model`（玻璃、砂纸是示意值，F-7；真实读数会抖，读数要取几次）；`Shoe soles`（`<Figure src="figures/forces-shoe-soles">`，F-9）。
- **本章索引**：friction-board, glass-lane, sandpaper-lane, wooden-block, brass-weights, pull-balance, pull-balance-pointer, pull-string
- **名词首现**：friction、surface、rough、smooth。

### 5.4 第 04 章 `friction-and-motion`

- **summary**：A moving thing slows down and stops because of friction, not because its push runs out; the less friction, the further it goes. / 运动的东西会慢下来、停下，是因为摩擦力，而不是推它的力"用完了"；摩擦越小，走得越远。
- **正文提纲**：① 从同一高度放车：木跑道 53 cm（F-12）。② 换表面：玻璃 80、地毯 19 cm（6 cm 高）；公平测试：同一辆车、同一高度、放手不推（F-11、F-12）。③ 车滑下来以后没人推它，它照样往前走——直到摩擦让它停下（M3）。④ 想象一条完全没有摩擦的跑道（S14 的做法）。⑤ 高度加倍，距离加倍（细看，F-12）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（ramp-view）；回放 car-run；labels toy-car, release-gate, runway | Let the car go from six centimetres up the ramp, without pushing. On the bare wooden runway it rolls about 53 centimetres in this model. / 让小车从斜面上六厘米高处出发，放手不推。在这个模型里，它在木跑道上滚了约五十三厘米。 |
| 2 | sim runway glass；labels glass-mat, metre-rule | Same car, same height, but a smooth glass runway: about 80 centimetres. / 同一辆车、同一高度，换成光滑的玻璃跑道：约八十厘米。 |
| 3 | sim runway carpet；labels carpet-mat, metre-rule | On carpet it stops after about 19 centimetres. Only the surface changed, so the surface made the difference. / 在地毯上，它约十九厘米就停了。只改了表面，所以差别来自表面。 |
| 4 | camera runway-top；sim runway glass；labels toy-car | Nothing pushes the car once it leaves the ramp. It keeps going by itself, and friction slowly brings it to a stop. With less friction it would go further still. / 小车离开斜面以后，没有东西推它。它自己一直往前走，是摩擦力让它慢慢停下。摩擦再小一些，它会走得更远。 |
| 5 | `<Figure>` 拍（camera hero 拉远，正文配图 slide）；labels ramp-board | A playground slide uses both sides of friction: a smooth chute so you slide, and rough steps so you do not slip on the way up. / 操场滑梯同时用到摩擦的两面：滑道很光滑，让你滑得下去；台阶很粗糙，让你爬上去时不打滑。 |

- **试一试**：`vary: runway`，`keep: [ramp-height, { en: "Same car", zh: "同一辆车" }, { en: "Let go, no push", zh: "放手，不推" }]`，`observe: [distance]`，`record: { chart: true }`，`replay: true`；`predict`："Change the wooden runway for carpet. Will the car go further or less far?" / "把木跑道换成地毯，小车会走得更远还是更近？"→ start `{ runway: wood }`，change `{ runway: carpet }`，options further / less far / the same（more / less / same），observe `distance`。
- **细看**：`Why carpet is so slow`（绒毛被车轮压下又弹起，很费劲；车轮上摩擦力的方向不讲，课纲 Note）；`Twice the height, twice the distance`（F-12：3 / 6 / 9 cm → 27 / 53 / 80 cm，木跑道；可以自己在卡片里改 `ramp-height` 另做一组公平测试）；`Repeat and average`（模型每次一样，真实实验重复三次取平均，D7）；`About this model`（F-11 的示意系数）；`Playground slides`（`<Figure src="figures/forces-playground-slide">`）。
- **本章索引**：ramp-board, release-gate, toy-car, car-wheels, runway, glass-mat, carpet-mat, metre-rule
- **名词首现**：motion。

### 5.5 第 05 章 `elastic-spring-force`

- **summary**：A stretched spring pulls back towards its own length; within a limit, each extra mass stretches it by the same amount, which is how a spring balance works. / 被拉长的弹簧要回到原来的长度；在一定限度内，每多挂一份，就多伸长同样一段，弹簧秤就是这样工作的。
- **正文提纲**：① 挂钩挂上，弹簧伸长、振几下停住：重力向下、弹簧的弹力向上（M4）。② 每 50 g 伸 1.0 cm（F-15）：表与折线图。③ 用图预测：没试过的 175 g 会伸多少（3.5 cm，读图不计算）。④ 弹簧秤：同一道理，刻度就是伸长（F-2）。⑤ 拉过头（D12，M9）。⑥ 压缩的弹簧往外推（细看：圆珠笔、床垫）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（spring-view）；sim spring-load 50；labels test-spring, mass-hanger, spring-ruler | Hang the 50 gram hanger on the spring. It stretches, bounces a few times and settles one centimetre longer. / 把五十克的挂钩挂上弹簧。弹簧伸长，弹几下，停在比原来长一厘米的地方。 |
| 2 | layers + forces；labels mass-hanger | The hanger is still, but two forces act on it: gravity pulls it down and the stretched spring pulls it up, just as hard. / 挂钩不动，但它身上有两个力：重力向下拉，被拉长的弹簧向上拉，两个一样大。 |
| 3 | sim spring-load 200；labels slotted-masses, spring-ruler | Add slotted masses one at a time. In this model every 50 grams stretches the spring one more centimetre: 200 grams, four centimetres. / 一片一片加槽码。在这个模型里，每多五十克，弹簧多伸一厘米：两百克，伸四厘米。 |
| 4 | sim spring-load 300；数据表与折线图展开 | Record each load and draw the graph: a straight line. A spring balance works the same way, with its scale marked in newtons. / 把每次的载荷记下来，画成图：是一条直线。弹簧秤也是这个道理，刻度标的是牛顿。 |
| 5 | sim spring-load 400 → unload true（拍终值 unload）；labels test-spring | Hang 400 grams and the spring stretches much more than before. Take the masses off and it stays longer than it was. Pulled too far, a spring is damaged. / 挂上四百克，弹簧伸得比之前多得多。取下槽码，它比原来长了。拉过了头，弹簧就坏了。 |

- **试一试**：`vary: spring-load`，`also: [unload]`，`keep: [{ en: "Same spring", zh: "同一根弹簧" }]`，`observe: [extension]`，`record: { chart: true }`（折线：x = 载荷 g，y = 伸长 cm）；`predict`："Go from 100 grams to 200 grams. What happens to the extension?" / "从一百克加到两百克，伸长会怎样？"→ start `{ spring-load: 100 }`，change `{ spring-load: 200 }`，options more / less / same，observe `extension`。
- **细看**：`Reading between the points`（从直线读出 175 g → 3.5 cm；超过 300 g 直线弯了，不能再这样读）；`Elastic limit`（这个词；F-15）；`Springs that push`（压缩弹簧：圆珠笔、床垫、自行车座下的弹簧）；`Stored energy`（拉长的弹簧储存着能量，放手能把东西弹出去——P6 能量转换会学；不用"弹性势能"一词，S2 第 80 页）；`Hooke's law`（名字，中学会学；S8）；`About this model`（F-15 示意值）。
- **本章索引**：retort-stand, test-spring, mass-hanger, slotted-masses, spring-ruler, weigh-balance
- **名词首现**：elastic-spring-force（已在 01）、extension、elastic-limit（细看）。

### 5.6 第 06 章 `forces-at-work`

- **summary**：Brakes, shoe soles, slides, trains and lifts all put forces to work; friction is often the force we need most. / 刹车、鞋底、滑梯、列车、电梯都在用力；摩擦力常常是我们最需要的力。
- **正文提纲**：① 刹车轮：不捏刹车，轮子转很久（M3）；捏刹车，刹车块的摩擦让它停下；捏得越紧停得越快（F-19、F-20）。② 摩擦有用（刹车、鞋底、拧瓶盖）也有害（磨损、发热；所以给链条上油、给机器装轮子和轴承）（M6）。③ MRT 列车刹车：站着的人往前倾，因为身体要保持原来的运动（F-22，扶好扶手）。④ 下雨天：湿的刹车块、湿的地面摩擦小（F-19、F-9 细看）。⑤ 回看四种力。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（wheel-view）；动画 wheel-idle；labels wheel, brake-caliper, brake-lever | A bicycle wheel spins on a stand at two turns each second. The brake pads wait just clear of the rim. / 一只自行车轮在架子上转，每秒两圈。刹车块停在轮圈旁边，还没碰到。 |
| 2 | sim squeeze off；回放 wheel-run；labels wheel | Leave the brake alone. In this model the wheel keeps turning for about 80 seconds; only a little friction at the hub slows it. / 不碰刹车。在这个模型里，轮子会转约八十秒；只有轴上的一点点摩擦让它慢下来。 |
| 3 | sim squeeze light；layers + forces；labels brake-caliper, brake-lever | Squeeze the lever lightly. The rubber pads rub on the rim and the wheel stops in under two seconds. / 轻轻捏刹车把。橡胶刹车块擦着轮圈，轮子不到两秒就停了。 |
| 4 | sim squeeze firm；labels brake-caliper | Squeeze hard and it stops in about half a second. Here friction is exactly what we want. / 用力捏，约半秒就停下。在这里，摩擦力正是我们需要的。 |
| 5 | hero；labels shoe-soles, wheel, toy-car, test-spring | Grooved soles grip the floor, brakes slow trains and bicycles, steel ropes lift the lift against gravity. Friction also wears things out, so oil and wheels are used to reduce it. / 有花纹的鞋底抓住地面，刹车让列车和自行车慢下来，钢缆顶着重力把电梯拉上去。摩擦也会让东西磨损，所以人们用油和轮子减小它。 |

- **试一试**：`vary: squeeze`，`keep: [{ en: "Same wheel, two turns a second to start", zh: "同一只轮子，起转每秒两圈" }]`，`observe: [stop-time, turns]`，`record: { chart: true }`，`replay: true`；`predict`："Squeeze harder. Will the wheel stop sooner or later?" / "捏得更紧，轮子会停得更快还是更慢？"→ start `{ squeeze: light }`，change `{ squeeze: firm }`，options sooner / later / the same（less / more / same），observe `stop-time`。
- **细看**：`Brakes in the rain`（F-19：湿了摩擦小，要早点刹）；`MRT trains`（`<Figure>` 无，文字：列车刹车时身体往前倾、扶好扶手，F-22 待核）；`Bicycle brakes`（`<Figure src="figures/forces-bicycle-brake">`）；`Reducing friction`（油、轮子、滚珠轴承；"轮子省力"的原理不讲方向）；`Is friction bad?`（M6 小结）；`About this model`（F-19 示意值）。
- **本章索引**：wheel, wheel-stand, brake-caliper, brake-lever, brake-cable, shoe-soles
- **名词首现**：brake。

### 5.7 拍数

4 + 6 + 5 + 5 + 5 + 5 + 5 = 35 拍（00 的 4 拍计入演示）。

### 5.8 章节配图（`<Figure>`，§7）

第 02 章 `forces-lift`；第 03 章 `forces-shoe-soles`；第 04 章 `forces-playground-slide`；第 06 章 `forces-bicycle-brake`。

---

## 6. 名词表与来源

### 6.1 名词表 `glossary.json`（16 个候选，正文用不到的删）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| force | Force / 力 | 推或拉；能改变物体的运动或形状 | push, pull |
| push | Push / 推力 | 把东西往离开自己的方向推的力 | pull |
| pull | Pull / 拉力 | 把东西往自己这边拉的力 | push |
| stationary | Stationary / 静止 | 不在运动 | motion |
| motion | Motion / 运动 | 位置在变；可以变快、变慢、转向 | stationary |
| gravitational-force | Gravitational force / 重力（地心引力） | 地球把物体拉向地面的力，不用接触；新加坡课本也叫"地心引力" | weight |
| weight | Weight / 重量 | 重力对物体的拉力，用弹簧秤量，单位牛顿；**不是质量**（新加坡华文"重量"= weight） | mass, gravitational-force |
| mass | Mass / 质量 | 物体有多少物质，用 g、kg；到哪里都一样 | weight |
| frictional-force | Frictional force / 摩擦力 | 两个表面互相擦过或要擦过时，阻碍运动的力 | surface |
| surface | Surface / 表面 | 物体的外层；有的粗糙、有的光滑 | frictional-force |
| elastic-spring-force | Elastic spring force / 弹簧的弹力 | 被拉长或压缩的弹簧要回到原长时产生的力 | extension |
| extension | Extension / 伸长（量） | 弹簧比原长多出的长度 | elastic-spring-force |
| magnetic-force | Magnetic force / 磁力 | 磁铁之间、磁铁与铁和钢之间的推或拉，不用接触 | —（链到 `magnets` 主题） |
| spring-balance | Spring balance / 弹簧秤 | 用弹簧的伸长量力（含重量）的器材 | newton |
| newton | Newton / 牛顿（N） | 力的单位；这一课只读、不算 | spring-balance |
| fair-test | Fair test / 公平测试 | 一次只改一个量、其余保持不变的实验 | — |
| （细看用，不进表也可） | air resistance / 空气阻力；elastic limit / 弹性限度；brake / 刹车 | | |

中文用词核对（施工时 T 步）：新加坡 P6 华文科学读物里"重力 / 地心引力""弹簧的弹力 / 弹力""弹簧秤""摩擦力""重量"的通行写法（**待核**：找一本新加坡出版的华文科普或 MOE 华文资源佐证；核不到就按本表）。

---

### 6.2 来源（施工时进 `sources.json`；访问日期 2026-10-18）

| S# | 来源 | 用于 |
|---|---|---|
| S1 | 本设计研究（§2 DESIGN / SIM、§4.2 六个模型的算式与结果；本 spec） | 规格行、PLATE 读数、卡片、表与图、细看 |
| S2 | MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*（2023 P3 起实施，Updated Jan 2026），https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf ——**已下载逐页核对**：第 15–17 页（表 1）、第 20 页（表 2）、第 61 页、**第 63–66 页**、第 80 页 | §1 全部、D3、D4 |
| S3 | SEAB，*PSLE Science (Syllabus 0009), 2026*（docs/17 S6） | 评估目标 II、Booklet B |
| S4 | OpenStax，*College Physics 2e*，4.1 Development of Force Concept、4.2 Newton's First Law of Motion: Inertia；2.7 Falling Objects https://openstax.org/books/college-physics-2e/pages/4-2-newtons-first-law-of-motion-inertia | 牛顿、惯性、真空自由落体 |
| S5 | OpenStax，*College Physics 2e*，5.1 Friction（表 5.1；"proportional to the normal force, but not to the area in contact"；动摩擦系数小于静摩擦）https://openstax.org/books/college-physics-2e/pages/5-1-friction ——已读 | F-6、F-8、F-9 |
| S6 | Engineering ToolBox，"Friction and Friction Coefficients"（wood–wood clean 0.25–0.5）https://www.engineeringtoolbox.com/friction-coefficients-d_778.html ——已读 | F-6 |
| S7 | OpenStax，*College Physics 2e*，5.2 Drag Forces（F_D = ½CρAv²；表 5.2：Sphere 0.45、Circular flat plate 1.12；ρ = 1.21 kg/m³）https://openstax.org/books/college-physics-2e/pages/5-2-drag-forces ——已读 | F-13、F-14 |
| S8 | OpenStax，*College Physics 2e*，5.3 Elasticity: Stress and Strain；16.1 Hooke's Law: Stress and Strain Revisited | F-15 |
| S9 | NIST，CODATA "standard acceleration of gravity" 9.80665 m s⁻² https://physics.nist.gov/cgi-bin/cuu/Value?gn | F-3 |
| S10 | NASA NSSDC，Moon Fact Sheet（surface gravity 1.62 m/s²，ratio 0.165）https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html ——已读 | F-4 |
| S11 | NASA NSSDC，"The Apollo 15 Hammer-Feather Drop"（1.32 kg 铝锤、猎鹰羽毛）https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_15_feather_drop.html ——已读 | F-5、M1 |
| S12 | Galileo Galilei，*Dialogues Concerning Two New Sciences*（1638；H. Crew & A. de Salvio 英译 1914，公有领域，archive.org） | M1 历史 |
| S13 | Science Sparks，"Friction and speed"（玩具车在地毯上比光滑面滑得短；只改表面）https://www.science-sparks.com/friction-and-speed/ ——已读搜索摘要，施工时读原页 | F-11、公平测试写法 |
| S14 | IOP Spark（Institute of Physics）：*Many students think that a force is needed to keep an object moving with a constant speed* https://spark.iop.org/many-pupils-think-force-needed-keep-object-moving-constant-speed ；*Many students see friction as a phenomenon, rather than as a force* https://spark.iop.org/many-students-see-friction-phenomenon-rather-force ；*Force changes motion* https://spark.iop.org/force-changes-motion | M3、M4、M6；"想象无摩擦"的教法 |
| S15 | J. Clement，"Students' preconceptions in introductory mechanics"，*American Journal of Physics* 50(1)，1982，66–71（IOP Spark 的 Clement 条目 https://spark.iop.org/clement-1983 同一研究线，施工时核年份） | M3（力"跟着"物体、被用完） |
| S16 | J. Minstrell，"Explaining the 'at rest' condition of an object"，*The Physics Teacher* 20(1)，1982，10–14 | M4 |
| S17 | R. Driver, A. Squires, P. Rushworth, V. Wood-Robinson，*Making Sense of Secondary Science: Research into Children's Ideas*（Routledge，1994）"Forces"一章 | M1、M2、M4（只读目录 / 二手摘要，写进 `note`） |
| S18 | D. Hestenes, M. Wells, G. Swackhamer，"Force Concept Inventory"，*The Physics Teacher* 30(3)，1992，141–158 | M1、M3（摘要） |
| S19 | Engineering ToolBox，"Rolling Resistance"（滚动阻力系数的量级，硬路面约 0.001–0.02、软地面更大）https://www.engineeringtoolbox.com/rolling-friction-resistance-d_1303.html | F-11（只当量级，**待核**） |
| S20 | 自行车刹车：Sheldon Brown，"Brakes"（轮圈刹车、湿天效果下降）https://www.sheldonbrown.com/brakes.html ；或 D. G. Wilson，*Bicycling Science*（MIT Press，第 3 版 2004）刹车一章 | F-19（**待核**：读原文取刹车块 μ 与湿天说法） |
| S21 | LTA / 公共交通运营商的乘车须知（"站立时扶好扶手"）——施工时找 lta.gov.sg 原文 | F-22（**待核**；找不到就只留物理解释，删"官方建议"） |
| S22 | BCA（Building and Construction Authority）电梯安全 / 电梯构造资料（钢缆、对重）——施工时找 bca.gov.sg 原文 | F-23（**待核**） |
| S23 | MOE，*Science Syllabus Lower Secondary*（Express / N(A) / N(T)，2021）：力、牛顿、重量 = 质量 × g 在中学 | "中学会学"的依据（**待核**页码） |
| S24 | Commons 参考图 R1–R10 | 只作开发对照，不发布 |
| S25 | 学校教具目录（弹簧秤 0–10 N、槽码 50 g、带钩木块的典型规格；只当"典型"，不点名） | F-24（**待核**） |
| S26 | docs/22（磁铁）第 03 章：同极相斥 | 第 01 章磁力的链接 |
| S27 | NGA，*Department of Defense World Geodetic System 1984*（TR8350.2）第 4 章正常重力公式 | F-3 新加坡约 9.78 m/s²（算值，**待核**） |
| S28 | OpenStax，*College Physics 2e*，11.2 Density（表 11.1：steel 7.8 × 10³ kg/m³） | F-17 |
| S29 | ISO 216（A 系列纸张尺寸，A4 = 210 × 297 mm）；80 g/m² 复印纸的常见规格（**待核**来源） | F-18 |

事实纪律：课纲逐字、注页码；误解的出处写进 `sources.json` 的 `note`；只读到摘要的写"Abstract read"；Commons 参考图不进成品。

---

## 7. 图像清单（给 Codex，石墨图版风格）

风格固定用 `scripts/illustrate.ts` 的 `STYLE_BRIEF`（19 世纪科学图版的石墨铅笔画、无色、无文字、透明底）；首页图版 1:1，章节图 4:3（生成时把 brief 里的 "1024x1024 square canvas" 换成 "4:3 landscape canvas, 1536x1152"）。下面只写 SUBJECT（原样英文）。**Codex 已按 docs/17 在草稿目录出过初稿**：主会话拿这份清单逐张对照，合格的直接用、不合格的按这里的 SUBJECT 重画。图只当插画，不当事实依据；无人物（滑梯、电梯里也不画人）、无手、无文字和数字、无品牌。

### 7.1 首页图版 `genimg/roadmap/forces.png` → `public/illustrations/forces.webp`

> a still life of school science apparatus for forces on a plain bench: a wooden ramp propped on a block with a small four-wheeled toy car at its foot on a long flat runway; a wooden block with a hook on a board being pulled level by a tubular spring balance with a window showing its inner coil spring and pointer; beside them a retort stand with a coiled spring hanging from its arm, a mass hanger with three slotted masses stacked with their slots staggered; in the background a tall rod with two small steel balls held side by side at the same height above a shallow tray of sand; scales and rulers carry only plain tick marks, no numerals

核对：弹簧秤有窗、钩、指针；槽码槽口错开；两球同高；尺上无数字。

### 7.2 章节配图（4 张，4:3，`public/illustrations/figures/`）

| 文件 | 章 | 用途 | SUBJECT |
|---|---|---|---|
| `forces-lift` | 02 | 电梯：钢缆向上拉、重力向下、对重 | a cutaway of a passenger lift shaft in a residential tower block: the lift car hanging from several steel ropes that run up over a grooved drive sheave in the machine space at the top and down the other side to a heavy rectangular counterweight sliding in its own guide rails; the car and the counterweight at different heights; guide rails, the closed landing doors at two floors, plain technical cutaway, no people, no text, no logos |
| `forces-shoe-soles` | 03 | 鞋底花纹 | two shoe soles seen from below side by side: on the left a smooth flat leather sole with a low heel, on the right a rubber sports shoe sole covered with deep criss-cross grooves and a pattern of raised blocks; beside them a small square of each sole material shown edge-on in section so the grooves read as a toothed profile; specimen plate, no text, no logos |
| `forces-playground-slide` | 04 | 滑梯：光滑滑道、防滑台阶 | an empty modern playground slide in a public housing estate playground: a smooth, polished curved chute running down from a small platform, and a short flight of steps with ridged anti-slip treads leading up to the platform, a rubber safety mat on the ground at the foot of the chute; trees in faint outline behind; no people, no text, no signs |
| `forces-bicycle-brake` | 06 | 轮圈刹车 | close-up of the front of a bicycle: a caliper rim brake mounted above the tyre, its two curved arms holding a rubber brake pad on each side of the metal wheel rim, the pads just touching the braking surface of the rim; the brake cable running up to a brake lever on the handlebar, drawn slightly separated for clarity; a few spokes and the hub in the background; technical plate, no hands, no text, no logos |

主会话审图：电梯的钢缆与对重关系对；滑梯台阶有横纹、滑道光滑；刹车块对着轮圈侧面（不是轮胎）；全部无字、无人。

---

## 8. 施工顺序、分工与验收

### 8.1 施工顺序（照 skill `atlas-space-topic` 的 `build-order.md`；依赖由主会话预装，本主题**不需要新依赖**；子代理不改 `package.json`、不提交）

| 步 | 谁 | 做什么 | 文件归属 | 前置 | 量 |
|---|---|---|---|---|---|
| 0 | 主会话 | 脚手架 `pnpm tsx scripts/new-topic.ts forces --engine space-scene --subject science --title-en "Forces" --title-zh "力"`（subtitle EN "Push, pull, friction, springs and gravity on a science bench" / ZH "在科学实验台上探究推、拉、摩擦、弹簧与重力"）；`topic.yaml` 的 `note`、`illustration: forces`、`tags: [singapore, psle, p6, forces, space]`、`status: draft`；参考图 R1–R10 下到 `scripts/geo/forces/refs/`；§7 图入库 | 主题目录、refs、`public/illustrations/` | — | S |
| E-A | Opus 引擎 A | F1 模型、F2 时间线与回放、F4 stretch 与 settle、F8 count，`sim-schema.ts`（含 B 要的字段：`overlays.force-vectors`、`record.chart`、`telemetry.follow` 数组与 `scope`、`predict` 状态）、F0 背景章验证、单测 `force.test.ts` / `timeline.test.ts` / stretch、docs/06「力（force）」「时间线与回放」 | `src/engines/space-scene/lib/sim/{force,timeline,index,bind,settle}.ts`、`sim-schema.ts`、`stages/model3d/{PartNode,geometry}.tsx/ts`（coil 的 t 属性）、`stages/model3d/MotionDriver.tsx`（若回放在这里推进）、`core/keys.ts`（`G`）、`tests/space-scene/{force,timeline,sim}.test.ts`、`sample-space` 的 force 例、docs/06 | 0 | 3.5 天 |
| E-B | Opus 引擎 B（E-A 的 schema 合进来后开工，可与 E-A 后半并行） | F3 力的箭头 + KEY 图例 + LAYERS 行、F5 小图、F6 读数与先猜后看、F7 材质与 token；docs/06「力的箭头」、docs/08 §1 功能色表加四个力的颜色 | `stages/model3d/SimOverlays.tsx`、`explorer/{TryIt,TryChart}.tsx`、`explorer/ExplorerOverlay.tsx`（图例）、`hud/{sim,PlateBlock}.ts(x)`、`lib/{color,presets}.ts`、`stages/model3d/textures.ts`、`src/theme/{tokens.css,theme.ts}`、`tests/space-scene/{force-arrows,chart}.test.ts`、docs/06、docs/08 §1 | E-A 的 schema | 2.5 天 |
| D | Opus 内容（几何 + 数据） | 44 零件 + context、组、姿态、动画、views、presets、spec、telemetry、`sim` 段（§4.3）；章节 frontmatter：state、`sim.set`、`try`、35 拍的镜头 / labels / hide / sim；R2 两轮 → R3 → R4；`pnpm shoot forces --beats` 自证 | `data/parts.json` 几何与 sim 字段、`chapters/*.mdx` frontmatter、`docs/screenshots/forces/` | E-A、E-B | 3 天 |
| C | Codex（批量，≤ 4 条并行，`< /dev/null`） | 英文草稿：44 个零件的 summary / detail、7 章正文（EN 200–300 词）与细看、`sources.json` 骨架（照 §6.2，标出"已读 / 待核"）；不写中文 | `scripts/forces/drafts/`（不进 git） | D 的零件表定形 | M |
| T | Claude（Opus） | 逐条读来源、落定"待核"（F-3、F-11、F-13、F-19、F-22、F-23、F-24、S13、S20–S23、S25、S29）；S1 自描述；英文定稿；**中文独立成文**（正文 350–500 字 / 章、零件文字、字幕、名词表；新加坡用法核对）；`SOURCES.md`；配图 alt / caption | `data/{sources,glossary}.json`、`data/SOURCES.md`、parts.json 文本字段（D 结束后接手）、`chapters/*.mdx` 正文 | C | 2.5 天 |
| B | Sonnet | 35 拍字幕定稿（照 §5 草稿 + writing-rules 节拍部分：说"模型上显示什么"、模拟数字写"在这个模型里"、不用符号缩写）；`--beats` 0 失败、无漏标、四种组合 | `chapters/*.mdx` 的 `state.beats` | T | 1 天 |
| Q | Sonnet QA | §8.2 全勾；`pnpm shoot forces --beats --keys --layout --locale en,zh --theme paper,cinema`、`--perf`；e2e `tests-e2e/forces.spec.ts`（换道 → 读数与表、记一行与图、`G` 再跑、深链接 `sim=` 终态、先猜后看状态揭晓、手机抽屉 44 px）；发现引擎问题写给主会话，不自己改引擎 | `tests-e2e/forces.spec.ts`、截图 | B | 1 天 |
| 发布 | 主会话 | `status: published`；首页计数与 e2e；docs/04、docs/17 §6.1 同步；本文 §9 记录；`git commit`；push 等 Gavin | — | Q | S |

**文件归属的边界**：E-A 与 E-B 不同时改 `sim-schema.ts`（E-A 拥有，E-B 要改先提给主会话合并）；D 是唯一写 `parts.json` 的代理，T 在 D 交付后才接手其文本字段；同一时间只一个代理写某个 `.mdx`（T 写正文、B 写 `state.beats`，先后进行）。合计：引擎约 6 天，内容约 7.5 天。

### 8.2 验收（skill `acceptance.md` 全部 + 本主题另加）

- [ ] 课纲对齐：第 63–64 页每条 Core Idea、两条 Practices、Values 一条，各在某章正文或拍里出现（Values："用数据说明"= 每章卡片的表与图 + 00 章正文）；两条 Note 的边界守住：车轮 / 球上**没有**摩擦力箭头、主线无"air resistance / 空气阻力"（只在第 02 章细看，`grep` 正文与字幕）；UI 无年级、无 Foundation 字样。
- [ ] 必须讲对的八处（D5）与误解 M1–M11 各有一拍或一段正文；字幕与正文无"推力用完了""重的落得快""摩擦力都是坏的"的说法。
- [ ] 模型：`force.test.ts` 钉死 §2 F-10、F-12、F-14、F-16、F-20、F-21 全表（3 位有效数字）与 F9 的不变量；默认三种跑道 × 三档高度都不出跑道；`f-start` > `f-move` 对所有表面与载荷成立。
- [ ] 读数一致：PLATE、卡片、表、图、字幕、细看、S1 里同一个量同值（0.5 / 1.0 / 1.8 N；40 / 80 / 120、27 / 53 / 80、10 / 19 / 29 cm；0.45 / 0.46 / 1.00 s；1.0 cm 每 50 g、9.2 / 1.2 cm；80 / 1.8 / 0.6 s），都写明"在这个模型里 / SIM"。
- [ ] 回放：每章改值后自动跑一遍；`G` 与"再跑一次"按钮同一 store；深链接、`--beats` 截图、减少动态时直接终态，且终态 = 输出值（车停在 `distance` 刻度处、轮子转过 `turns` 圈）；落体卡片有"放慢 4 倍"芯片；EXPLODED / REFERENCE 下停在终态。
- [ ] 弹簧：伸长时圈距变大、钢丝不变粗（截图对照 R5）；挂钩与弹簧末端不脱节（settle 期间也不）；指针与竖尺刻度对得上。
- [ ] 力的箭头：五种颜色两套主题下都与 `hot` / `cold` / `signal` 一眼可分；KEY 图例只列本章出现的力；LAYERS `forces` 开关；长度与读数成比例（1.0 N 的箭头是 0.5 N 的两倍长）；第 03 章第 2 拍拉力与摩擦力两支等长反向。
- [ ] 公平测试：每章卡片三行芯片齐；"记一行"、≤ 12 行、同值覆盖；图：步进 → 折线、选择 → 条形，≥ 2 行才画，`aria-label` 自动文字中英都对。
- [ ] 先猜后看：第 01 章（状态揭晓）、02（状态）、03–06（多 / 少 / 一样）各一处，不判对错，中英文案对。
- [ ] 三种操作方式（触屏、鼠标、键盘 `[` `]` `T` `G`）都能完成每章的试一试；URL `sim=` 往返。
- [ ] 背景章 00：章节轨空心菱形、章节轴不占段、阅读说明细框、演示开场读"Background / 背景"。
- [ ] 性能：静止 ≤ 70 calls（目标；上限 100）、运转 ≤ 80；三角形 < 0.3 M；箭头 1 次绘制；回放结束后不再请求帧；模型计算 < 1 ms（落体积分在内）。
- [ ] 手机 390 × 844：卡片、表、图在抽屉里可用，按钮 ≥ 44 px。
- [ ] 无文字贴图：尺、秤、砝码上无数字；无品牌；无手、无人。
- [ ] 首页图与 4 张章节图逐张核对 §7 的核对项。

---

## 9. 施工记录 / 已知差距

### 9.1 引擎（E-A + E-B 合并为一个 Opus 代理，2026-10-18）

**做了什么**：§4.4 的 F0–F8 全部，文档 F9。夹具主题 `src/content/topics/sample-forces/`（draft，占位文字，只用程序化积木，28 个零件 + 2 个 context）：背景章 00 + 六章各一张试一试卡，每个子模型、回放与「再跑一次」、力的箭头、弹簧伸缩与回弹、数据表下的小图（条形、两组条形、折线）、PLATE 一行两值与"只本章"读数、先猜一个状态、地毯与砂纸、`count` 的 `minus` 各用一次。docs/06 新增「SpaceScene · 试一试 · 力（force）」「时间线与回放」「力的箭头」「弹簧伸缩与回弹」「数据表下的小图」，改了「试一试（sim）」的输出种类、绑定、读数、键、QA 几条和「背景章」；docs/08 §1 功能色表加力的四色。

| 件 | 代码 | 要点 |
|---|---|---|
| F0 背景章 | `schema.ts`（`spaceChapterState.note`） | SpaceScene 下 00 的编号、顶栏 `BG`、章节轨菱形、阅读面板眉题与阅读说明细框、演示开场"Background"都已由 core 处理，验证无缺口；只补了 `note`（docs/31 E-EN7 的同一件）。validate 已有"`note` 只能写在背景章" |
| F1 模型 | `lib/sim/force.ts`、`sim-schema.ts`（`forceSchema`、`forceIssues`、`quantityKind`、`simTimelineChannels`）、`lib/sim/index.ts` | 六个子模型 + 磁铁推；量名与种类表 `FORCE_MODEL`、状态表 `FORCE_STATES`；全部 §2 SIM 表单测钉死；模型 < 0.1 ms |
| F2 时间线与回放 | `lib/sim/timeline.ts`、`lib/sim/replay.ts`、`stages/model3d/TimelineClock.tsx`、`PartNode.tsx`（`play`）、`ui.ts`（`simReplay`、`simSeek`）、`bridge.ts`（`playback`）、`View.tsx`（`G`、`sim().timeline`、`simSeek`）、`core/controls.ts`（`SIM_KEYS.replay`） | 见 docs/06「时间线与回放」 |
| F3 力的箭头 | `lib/sim/arrows.ts`、`SimOverlays.tsx`（`ForceVectors`）、`ExplorerOverlay.tsx`（KEY）、`src/theme/{tokens.css,theme.ts}` | 一个叠加一次绘制（顶点色 + 透明度）；LAYERS 行 = 叠加的 `group` |
| F4 伸缩与回弹 | `lib/stretch.ts`、`stages/model3d/{shaped,geometry}.ts`（coil 顶点的螺旋参数 `atlasStretch`，合并几何保留）、`PartNode.tsx`、`lib/sim/settle.ts`（长度阈值） | 圈刚性平移、钢丝不变粗；挂钩同 settle 不脱节 |
| F5 小图 | `lib/sim/chart.ts`、`explorer/TryChart.tsx`、`explorer/TryIt.tsx`、`space-scene.css` | 折线 / 条形 / 多组，读屏文字自动拼（中英） |
| F6 读数与先猜后看 | `schema.ts`（`telemetry.follow` 数组、`scope`）、`hud/PlateBlock.tsx`、`TryIt.tsx`（状态揭晓）、`lib/sim/text.ts` | PLATE 块尾的状态改为"本章的状态"（下表第 12 条） |
| F7 材质与 token | `lib/color.ts`（`fabric`、`abrasive`）、`lib/presets.ts`、`schema.ts`、`stages/model3d/textures.ts`（`pile`、`sand` 的法线 + 颜色贴图）、`tokens.css` | 四个力的颜色在纸底 / dark plate、三种色觉缺陷模拟下与 `--pole-n`、`--signal` 两两 ΔE ≥ 9 |
| F8 count minus | `sim-schema.ts`、`lib/sim/bind.ts` | `{ per, minus }` |

**与 §4 的差异**（实现时的决定；内容代理照这里写数据）：

| # | spec | 实现 | 理由 |
|---|---|---|---|
| 1 | `squeeze` 选项 `off / light / firm` | `none / light / firm` | 选项 id 不能是 on / off（URL 编码把它们当开关） |
| 2 | 输出 26 个 | 输出上限从 16 提到 32 | 一张实验台的全部量 |
| 3 | `play: { channels: { x: [1,0,0], y: "ramp" } }`、`roll.ramp.dir` | 一条 `play` 一个通道（`channel` + `axis` 或 `turn`）；滚动模型直接给场景坐标的 `dx`、`dy`（以坡底为 0）和 `pitch`；`roll.ramp` 只有 `angle` | 引擎里不出现"ramp"这类主题词；能量主题的秋千、落球同一写法 |
| 4 | 落体 `@side` 通道 | 每个物体一个通道（物体 id），左右位置由 `pair` 的 `visible` / `pose` 绑定摆 | 同上 |
| 5 | 箭头 `dir: "tangent"`、`"@push"` | 只有向量；推的方向用几支带 `when` 的箭头（按 `push` 选项） | 不需要魔法字符串 |
| 6 | — | `play.when`（条件成立才播放） | 一辆车两种摆法（推 / 斜面），各自的时间线只在自己的摆法下动它 |
| 7 | `count: { per: 50, minus: 50 }` | 同；`per` 从乘数改为除数 | 原来的乘数语义没有主题用过 |
| 8 | `slide.per`，载荷按"只数" | 没有 `per`；`load` 是克数的步进，m = `block` + 载荷 ÷ 1000 | 少一个换算 |
| 9 | 推的车从斜面滑下 | 车从跑道起点滚到推点（`approach`，默认 = `at`）；`push` 另有 `rolling` 或 `surface`（`roll.rolling` 的键）、`wheel`、`arrow` | 推的模型不依赖斜面数据 |
| 10 | `distance` 写 `125+`、状态 `off-end` | `distance` 到挡板为止，另一个状态输出 `run-end`（`stops` / `off-end`），卡片写状态的标签 | 数输出只能是数 |
| 11 | `weigh-note` 状态未列 | `none / reads / too-light` | — |
| 12 | 块尾 `SIM <本章第一个状态输出>` | 本章卡片观察的状态 → 先猜后看的 → 第一个随卡片控件或本章 `set` 变的；都没有时电路、磁铁照旧用模型的第一个状态（逐章核对没变），力的模型不写状态 | 六套实验互不相干，`effect` 不该出现在弹簧章 |
| 13 | KEY"本章出现的力" | 此刻场景里画着的力（零件在场、`when` 成立、图层开着、整段里有一处 ≥ 0.05 N） | 由章的 `hide` / `layers` 决定"本章"，引擎不另记 |
| 14 | F0 在 `sample-space` 加 00 章 | 在 `sample-forces` 验证（`sample-space` 未改）；章节轴照 core 的 ChapterAxis 给背景章一段 `BG`（MathScene 课也是这样），"不占段"只对 TimeScene 的时间条成立 | 引擎间一致 |
| 15 | 时间线终态可另定 | 终态 = `t = duration` | 规则简单；能量主题"只演一次弹跳"能用 |
| 16 | 刹车的摩擦力通道 | 停下那一刻仍是 2 μ N（终态截图看得见箭头） | 截图要能说明"是摩擦力让它停下" |
| 17 | stretch 只给输出 | 也可以是步进控件；`anchor` 有 `top` / `bottom` / `centre` | 水平弹簧秤的弹簧固定在挂钩一端 |

**测试**：`tests/space-scene/force.test.ts`（F-10、F-12、F-14、F-15、F-16、F-20、F-21 全表按显示位数与 3 位有效数字；排序与不变量；弹性限度；时间线终态 = 输出值；确定性；`force` 数据、`play` / `stretch` / `count` 绑定、箭头、卡片字段的 validate；箭头长度、KEY 列表）、`timeline.test.ts`（分段 / 采样插值、峰值、抽稀、播放规则、`cardTimelines`、`cardStates`）、`chart.test.ts`（轴、模型、读屏文字中英）、`stretch.test.ts`（线圈顶点位置、刚性平移、转向的线圈、挂钩与弹簧同 settle 不脱节）；样板台 `tests/space-scene/fixtures/forces-bench.ts`。e2e `tests-e2e/sample-forces.spec.ts`（深链接终态与读数与 KEY、换值自动播放、`G` 与按钮同一计数、放慢芯片、条形图与折线图的读屏文字、先猜状态、背景章、手机 44 px）。`pnpm shoot` 的 `--keys` 加了 `G` 的检查。

**计数**（`sample-forces`，1920 × 1080，SwiftShader）：静止 19–34 calls、3.1–5.1 万三角形；箭头 1 次绘制；回放结束后停帧。

**已知差距 / 留给内容与 QA**：①推的箭头只在推的 0.15 s 里出现，终态截图看不到（要在细看或拍里讲）；②弹簧伸长时标注锚点留在静止中心；③车侧推后会驶出跑道（模型按直线算，内容代理定跑道宽或改 Δv）；④`sample-forces` 的镜头只求看得见，不是作品级取景；⑤能量主题（docs/31）要的 `energy` 模型、能量链卡、能量条、能量 token 与流的 density 模式不在本次。

### 9.2 主题施工（一个 Opus 代理，2026-10-18；发布）

**做了什么**：`src/content/topics/forces/`（`status: published`）：零件、组、姿态、预设、视图、规格行、PLATE 读数、`sim`（`kind: force`，§4.3 的六个子模型 + 磁铁推）、力的箭头；背景章 00 + 六章，每章一张试一试卡片（推 / 下落 / 摩擦 / 滚动 / 弹簧 / 刹车），有回放、"记一行"与表下小图、先猜后看；名词表、来源、`SOURCES.md`；四张章节图（02 `forces-lift`、03 `forces-shoe-soles`、04 `forces-playground-slide`、06 `forces-bicycle-brake`）与首页图。测试：`tests/space-scene/forces-topic.test.ts`（每拍字幕里的模拟数 = 该拍设置下模型的输出、正文每个 S1 数字 = 模型输出或设计值、课纲边界词不进主线、无年级、中文只用“ ”、摩擦力箭头只在木块与刹车上、侧推后车留在跑道内）、`tests-e2e/forces.spec.ts`（深链接终态与读数、换道自动播放、`G` 与"再跑一次"同一计数、条形图与折线图读屏文字、先猜一个状态、放慢 4 倍、中文页、手机 390 × 844 的 44 px 与图不出屏）；首页与 smoke 计数（23 个已发布、科学 5 个）。

**数量**：背景章 00 + 6 章，37 拍（4 + 7 + 5 + 5 + 5 + 6 + 5）；46 个零件（45 + 1 个 context：实验台）、7 组（`drop`、`everyday` 不进零件链路卡，`arrows` 是只放力的箭头的组）、15 个姿态、6 个预设；sim：16 个控件（上限）、26 个输出（6 条时间线）、47 条绑定、1 个力的箭头叠加 12 支箭头；4 个只在章 / 拍里设的控件（`setup`、`magnet-push`、`squash`、`hold`）；6 张卡片各一个先猜后看；16 个名词；29 条来源（S1 设计研究 + 28 条外部）；4 张章节图 + 首页图。绘制：静止 31–67 calls（目标 ≤ 70）、三角形 ≤ 0.15 M（SwiftShader，`pnpm shoot forces --perf`）。

**施工中的决定（数据照 §9.1 实际引擎写）**
- 刹车选项 `none / light / firm`；推车两种摆法用 `setup`（`roll` / `push`）+ `play.when`；每条 `play` 一个通道；落体每个物体一个通道（`small-ball`、`large-ball`、`crumpled`、`flat`，摊平的纸另有 `flat-sway`）；滚动出跑道用 `run-end`；箭头方向都是向量，推的方向用三支带 `when` 的箭头。
- **侧推留在跑道上（§9.1 已知差距 ③）**：加宽跑道并改 Δv：侧推取"只转向、不改快慢"的 Δv（−0.0204, 0, −0.1553），推后 0.60 m/s、偏 15°（spec F-21 原为 0.67 m/s、27°；Codex 审计 FOR-CAP-01 指出原字幕"快慢差不多"与 0.67 矛盾，二选一时取改 Δv，字幕原意保住）；跑道加宽到 28 cm（两侧护边），车推后横移 7.9 cm，单测钉住不出护边。
- **大钢球 224 g**（不是 225 g）：直径 38 mm、钢 7.8 g/cm³ 算得 224.1 g，与 28 g 小球正好 8 : 1（审计 F-17b）；称重 2.2 N、月球 0.4 N 不变。
- **静摩擦那一拍**：模型的 `pull-run` 终态总是"已滑过"，截图看不到"拉着不动"。加一个不进卡片的开关 `hold`（"还没动的时候"），`pull-run` 的位移 `play` 只在 `hold` 为假时播放：第 03 章第 2 拍木块停在起点、拉力与摩擦力箭头等长反向（都等于读数）。16 个控件刚好到上限。
- **称重**：`weigh` 选项带 `sets`（小球 / 大球 → `pair: balls`、纸 → `pair: papers`，都设 `drop-height: 1.0`），所称物体由姿态挂进网兜、它的下落 `play` 以 `when` 关掉；换 `pair` 或高度时称重自动回到"不称"或对应的物体，不会出现网兜空着或物体悬空。称纸用纸团（同一张纸，同 5 g）。
- **组名**：力的箭头所在的组不能叫 `forces`（与主题同名，validate 拒绝），用 `arrows`（LAYERS 显示 "Forces / 力"）。
- 落体架立杆 1.62 m（spec 1.65）：全景镜头装得下 1.5 m 夹臂与地上的沙盘。
- 推杆不动画：静止画面里它指出推力从哪里来（后 / 前 / 侧三个姿态），杆头在车顶上方 6 cm、斜 20°，车经过与推后前冲都不穿杆；推力箭头只在推的 0.15 s 出现（§9.1 差距 ①），第 01 章细看写明"按再跑一次看箭头"。
- 第 01 章 7 拍（开始运动、加快、减慢、停下、转向、磁铁推、海绵变形各一拍；四种力的名字放正文）；第 02 章第 1 拍改写为过去时（终态里球已在沙里），第 3 拍改成 1.5 m 再放一次（同时落地）；第 04 章第 5 拍用"高度加倍"（另一个公平测试）代替滑梯（滑梯进正文配图）；第 05 章拆成 6 拍（400 g 挂着、取下各一拍）。合计 4 + 7 + 5 + 5 + 5 + 6 + 5 = 37 拍。
- 弹簧取下砝码 = 挂钩与槽码由姿态放到台面，弹簧留 0.4 / 1.2 cm 永久伸长。
- 各章 `hide` 只藏挡镜头的器材（第 01–05 章藏刹车轮一组，第 03 章藏斜面，第 06 章前 4 拍藏落体架），全景拍不藏。
- 玻璃板与玻璃道加了不透明的绿灰色细边（`enamel`），否则 22 % 不透明度的玻璃在木面上看不见。
- 不画地面：浅色地面在 cinema 下是一块亮板（token 色受光后也发亮），落体架和台腿直接落在引擎的地面阴影上。
- 中文用"重力"（gravitational force，名词表注"也叫地心引力"）、"重量"（weight）、"弹簧的弹力"、"弹簧秤"、"摩擦力"；引号只用“ ”；不出现年级与 Foundation。

**事实审计（Codex `forces-facts.md`，86 行）落实的更正**：最大静摩擦与滑动摩擦比较（"让这块木块动起来比让它保持滑动费力"）；"两个表面压得多紧"代替"压力"（正压力）；"就这几种表面来说，越粗糙摩擦越大"并在细看写材料、干湿也有关系；侧推（见上）；钢球 224 g；刹车用 4π rad/s（80.4 s、1.8 s、0.6 s，S29）；落体时间按步内插值，与 F-14 表一致（0.45 / 0.46 / 1.00 s）；"真纸更慢更乱"改为"真纸下落更不规则"；"重复三次"写成"比如三次"的课堂做法（S12），不说是课纲要求；湿地"可能很滑"；磁力定义不说磁铁会推开普通铁钢；Clement 用 1982 AJP，不引 IOP 的 1983；初中纲要（S22）只引"用牛顿量力、比较质量与重量"，胡克定律只说"以后的科学课"；9.80665 改引 BIPM（NIST 链接失效）；电梯改引 Otis（找不到 BCA 说明页），不写对重比例；LTA 只引"扶好扶手"，不把巴士急刹的句子说成地铁规定。无法核实的常数（玻璃 / 砂纸系数、滚动系数、纸的阻力系数、弹簧劲度与限度、刹车参数、木块规格）在 S1 与各章细看标为示意值。

**Codex 的用法**：英文章节草稿与字幕（`art/codex-forces-energy/forces/`）逐句改写后进正文：删 `<Beat>` 链接（SpaceScene 不支持正文跳拍）、数字换成模型实际输出、侧推与 224 g 跟着审计改、"空气阻力"只留在第 02 章细看、主线不提滚动车轮上的摩擦方向；字幕按截图终态重写（过去时、数字用词写）。中文全部独立写。审计表的 URL 与位置用于 `sources.json`。

**门槛**：`pnpm check` 0 错误；`pnpm validate` 0 error、0 warning；`pnpm test` 92 个文件 2449 条全绿（含本主题 56 条）；`pnpm build`；`pnpm shoot forces --beats --keys --layout --locale en,zh --theme paper,cinema` 四种组合 37 拍 0 失败、无漏标、chapter highlights 全在屏、键位 0 失败、八个尺寸布局 0 问题、console 干净；`CI=1 pnpm e2e` 115 条全过（含 `forces.spec.ts` 7 条、smoke 的 23 个已发布主题）。`--perf`（SwiftShader，1920 × 1080）：静止 31–67 calls、≤ 0.15 M 三角形。

**已知差距 / 留给 Gavin**
- **D4 牛顿**：照定稿，读数用 N（弹簧秤、称重、拉力），无公式；"每千克约 9.8 N"只在规格行与第 02 章细看。要改成"只看伸长和距离"需改第 02、03 章的卡片与字幕。
- **D12 弹性限度**：照定稿保留（第 05 章第 5、6 拍 + 细看"Elastic limit"）；不要就删这两拍和细看，`spring-load` 的 350 / 400 g 两档一起去掉。
- 推力箭头只在推的 0.15 s 出现，截图里看不到（引擎行为，§9.1 ①）；静止画面靠推杆姿态表达方向。
- 刹车的摩擦箭头画在刹车钳上方（轮胎外），不在刹车块与轮圈的接触点：接触点在轮胎后面，从前方看不见。
- 第 01 章第 6 拍（磁铁推）若读者在这一拍把"推之前"改成"在滚动"，车会从条形磁铁中穿过（磁铁只在拍里出现，卡片不给磁铁开关）。
- 槽码用 `repeat`，槽口无法错开（每份同一朝向）。
- 读者改落体高度时，已称重的物体会回到落体架（`sets` 设计如此）。
- 参考图没有下载：器材照 §3.3 的 Tier-1 描述建模，未做逐张并排对照（R2 两轮），留给打磨轮。
- 能量主题（docs/31）发布后，第 05 章细看"Stored energy"与第 06 章可加 `<TopicLink slug="energy-conversion">`。
