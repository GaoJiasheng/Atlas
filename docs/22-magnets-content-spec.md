# 22 · 磁铁 · 内容施工 spec（v1 草案）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §2 封闭设备的变体——**"实验台"**：不是一台机器，而是一张摆着实验器材的工作台，按实验分区（磁铁 / 指南针 / 测试盘 / 制作磁铁 / 生活中的磁铁），读者在每一区做一个可操作的实验。本主题的任务：**P3 学生看完能说清磁铁能推能拉、有两极且两极最强、自由悬挂时指向南北、同极相斥异极相吸、只吸引磁性材料（铁、钢）且隔着非磁性材料也能吸、怎样用摩擦法和电流法制磁铁、生活里哪里用到磁铁；并能读、能做"公平测试"的小实验和数据表。**

`subject: science`；对应 PSLE 2023 课纲 P3 *Interaction of Forces (Magnets)*（S3 第 62 页）。docs/17 §6 的 #3 brief（场线、相吸 / 相斥、悬挂、摩擦法、线圈 + 电池的电磁铁、冰箱门）。

本主题**需要一个引擎扩展**：SpaceScene 的 `sim`（"可操作的小实验"，§4.3）。它在本 spec 里第一次定义，docs/23（电路）复用同一个核心，各加一个模型（`magnet` / `circuit`）。哪个主题先施工，哪个就带上 E-SIM 核心。正文、字幕、来源条目未经 Gavin 定稿不写（CLAUDE.md）；本文的字幕是**草稿**，用来定节拍和模型状态。标"待核"的事实施工代理读原文核对后才能用，核不到就换值或删掉。

结构照 skill `atlas-space-topic` 的 `references/spec-template.md`，按本次 brief 重排（模板 → 本文）：决策 §0 → §0；主题、事实、口吻 §1 → §1；参考图 §9.1 → §2；分区与零件 §2–§3 → §3；流、动画、引擎缺口 §4–§5、§8 → §4（物理与 sim）；章节与名词 §6 → §5、§6；来源 §9.2 → §7；图像清单 → §8；施工 §10 → §9；验收 → §10；HUD §7 → §4.6；待确认 §11 → §0.1。

---

## 0. 决策记录（2026-10-13 起草，待 Gavin 定稿）

| # | 决定（提议） |
|---|---|
| 1 | **对象 = 一张小学科学实验台**：两根条形磁铁、一块马蹄形磁铁、一对环形磁铁（套在立柱上）、一个指南针、一盘 8 件待测物、一叠卡片和一串回形针、一根待磁化的钢棒、一个"钢钉 + 线圈 + 两节电池 + 开关"的电磁铁；台子右端是"生活中的磁铁"：一段冰箱门（门封里的磁条、一块冰箱贴）和一个橱柜磁吸门扣。**通用设计研究**，无品牌、无型号、无文字；标题块 `note`：EN "Generic design study · a school science bench · not a specific product" / ZH "通用设计研究 · 小学科学实验台 · 不代表任何具体产品" |
| 2 | **引擎：SpaceScene + `sim` 扩展**，不新做 Simulation 引擎。docs/03 §C 与 docs/04 把"磁铁"排在 Simulation（2028）；docs/17 §6 #3 已改判为 SpaceScene。理由：磁铁的核心是"看得见的实物 + 看不见的场"，3D 实物台本身就是课本插图的升级版；需要的"可操作"只有几个开关 / 步进 / 选择，外加一张数据表（§4.3）。定稿后 docs/03 §C、docs/04 改写 |
| 3 | **课纲边界**（S3 第 62 页原文）：课纲要的——推或拉；磁铁可由铁或钢制成；两极；自由悬挂的条形磁铁静止时指南北；同极相斥、异极相吸；吸引磁性材料；比较磁铁、磁性材料、非磁性材料；**摩擦法与电流法**制磁铁；日常用途。课纲 Note 明说**不要求**：记住镍、钴是磁性材料；磁屏蔽；磁感应。本主题：主线只说"铁和钢"；镍、钴放细看一句（不进字幕、不进测试盘）；不讲磁屏蔽（测试"隔着东西吸"时**不用铁片当隔板**）；回形针串（感应磁化）只当现象出现，不解释成"感应" |
| 4 | **"磁场"一词**：P3 课纲没有"magnetic field"。主线用"磁铁周围、它的吸力能起作用的地方（the space around a magnet where its pull acts）"，第一次出现时包 `<Term id="magnetic-field">`；铁屑图样和场线是**模型的表示法**，字幕说"铁屑排出的图样"，"场线"只在细看。中学（Lower Sec Science）才正式讲磁场，细看注明 |
| 5 | **必须讲对的五处**：① 不是所有金属都被吸引（铝、铜不被吸；**多数不锈钢餐具几乎不被吸**）；② 磁铁隔着纸、塑料、木头、铝都能吸，隔得越厚吸力越小；③ 两极最强、中间最弱，每根磁铁都有两极，切开也还是两极（细看）；④ 指"北"的那一极叫北极（north-seeking pole），地球的地理北极附近其实是一个磁"南"极（细看，P3 不考）；⑤ 电流法：线圈通电时钉子变成磁铁；**钢**钉断电后还留一点磁性（这正是"制磁铁"），**软铁**芯几乎不留（电磁铁可开关）|
| 6 | 章数 6（§5）：01 磁铁能做什么 / 02 两极与指南北 / 03 相吸与相斥 / 04 磁性材料与隔物吸引 / 05 制作磁铁 / 06 生活中的磁铁。每章一个"试一试"（开关、步进、选择或先猜后看），**不做测验**、不打分 |
| 7 | **公平测试（PSLE Booklet B 最常见题型）做成一等公民**：每章的试一试写明"改变的量 / 保持不变的量 / 观察的量"，试一试卡片里显示成三行芯片；第 03、04、05 章可"记一行"进**数据表**（只在内存，刷新即清）。数据表是 docs/17 §7 D0 的最小版本 |
| 8 | 分区（§3.1）：01 `magnets` 磁铁 / 02 `compass` 指南针与悬挂 / 03 `materials` 测试材料（`card: false`）/ 04 `making` 制作磁铁 / 05 `uses` 生活中的磁铁；06 `field` 磁场（铁屑 + 场线，`card: false`）；只有流的组 `current`（电磁铁里的电流）。context：实验台面、橱柜一角 |
| 9 | 模型布局：实物尺寸（§2.2、§3.2），"生活中的磁铁"一区的冰箱门、橱柜是**截取的一段**（示意，不是整台冰箱）。磁铁两端按学校常见做法涂两色（北极砖红、南极灰蓝，新 token，§4.4 M7），模型上不写 N / S 字母（引线标注写） |
| 10 | 事实纪律：规格行 = DESIGN（落在 TYPICAL 内）；PLATE 块读数 = **SIM**，由设计研究 S1 的模型算出（§4.2），字幕里的回形针数、吸力百分比都写"在这个模型里"。磁力的绝对值（牛顿、特斯拉）不进主线，只在细看给一个数量级 |
| 11 | 不做：品牌 / 型号 / 照片贴图 / 视频 / 配音文件 / 测验 / 硬币（新加坡硬币是钢芯镀层、会被吸，是好例子，但硬币外观涉及货币复制规则，只在细看提一句，不建模）/ 在舞台上自由拖动磁铁和指南针（v2，§4.5） |
| 12 | 单位：SI；长度在正文里用厘米（cm）、毫米（mm），模型坐标用米；磁感应强度只在细看出现，用微特斯拉（µT）、毫特斯拉（mT） |

### 0.1 待 Gavin 确认

1. 引擎路线：同意 SpaceScene + `sim` 扩展（§4.3），而不是 docs/03 §C 的独立 Simulation 引擎？（推荐：是。独立引擎仍留给光影、力学这类需要 2D 物理的主题。）
2. 试一试卡片放在阅读面板"节拍行"之后、"选中对象"之前——这要改 docs/08 §2 铁律 d 的顺序（章头 → 节拍行 → **试一试** → 选中对象 → 正文 → 本章索引）。同意？
3. 不锈钢勺放进测试盘（真实、反直觉，但 P3 学生可能困惑"钢不是磁性材料吗"）。推荐放，字幕写"很多不锈钢勺是一种特殊的钢，磁铁几乎吸不动"。或换成铝勺。
4. 电磁铁的"线圈圈数"做不做成变量：课纲只要求"电流法制磁铁"，圈数 / 电池数对电磁铁强弱的探究不在 P3 条目里，但 PSLE 练习题常见。推荐 v1 只变电池数（1 / 2）和开关，圈数固定 30 圈，圈数的影响写细看。
5. "地球像一块大磁铁、地理北极附近是磁南极"放不放主线。推荐只放第 02 章细看。
6. Codex 首页图版 `magnets.png` 重画（§8.1：铁屑图样画成了漩涡，没有指南针）。
7. 磁铁两端的颜色：北极砖红 / 南极灰蓝（新加坡课本常见红 / 蓝或红 / 白）。新增 token `pole-n`、`pole-s`。

---

## 1. 主题、范围与事实

### 1.1 读者学到什么（P3 用词）

1. 磁铁能**推**也能**拉**，不用接触就能起作用。
2. 磁铁有**两极**（北极、南极），两极吸力最强；**自由悬挂**的条形磁铁静止时指向**南北**；指南针的针就是一根小磁铁。
3. **同极相斥，异极相吸**；离得越近，推或拉越强。
4. 磁铁只吸引**磁性材料**（铁、钢），不吸非磁性材料（铝、铜、木头、塑料、玻璃、橡胶）；**不是所有金属都是磁性材料**；磁铁**隔着**非磁性材料也能吸，隔得越厚越弱。
5. **摩擦法**：用磁铁的一极沿同一方向反复摩擦钢棒；**电流法**：钢钉外绕绝缘导线、接电池通电。
6. 生活中的磁铁：冰箱门封、冰箱贴、橱柜门扣、指南针、电铃、废钢回收的电磁起重机、磁悬浮列车。
7. 做法：一次只改一个量，其余保持不变（公平测试），把结果记进表里，从表里找规律。

### 1.2 对象（台面从左到右）

- **左区 · 磁铁**：条形磁铁 A（100 × 20 × 10 mm，两端涂色）平放在一张 A4 纸下，纸上撒铁屑；它右侧一条导轨上是条形磁铁 B，可沿导轨靠近或离开 A、可调头；左后是一对环形铁氧体磁铁套在木立柱上（同极相对时上面一只悬浮）；左前是一块马蹄形磁铁，两个极尖各吸着几只回形针。
- **中区 · 指南针与悬挂**：一个 Ø 50 mm 的指南针（铜壳、刻度盘、菱形针、玻璃罩），可以放在磁铁 A 周围 8 个位置；一个铁架台（L 形支杆 + 底座 + 细线 + 纸托），第 02 章把磁铁 A 挂上去。
- **中前区 · 测试盘**：一只塑料盘，8 件物品：铁钉、钢回形针（3 只）、钢罐头盒、铝饮料罐、一卷铜线、不锈钢勺、木块、塑料纽扣；盘旁一叠 2 mm 厚的卡片和一串回形针（隔物吸引实验）。
- **右中区 · 制作磁铁**：一根 Ø 6 × 120 mm 的钢棒（摩擦法）；电磁铁：100 mm 钢钉、30 圈绝缘铜线、两节 AA 电池（电池盒）、拨动开关、导线、钉尖下一小堆回形针。
- **右区 · 生活中的磁铁**：一段竖立的冰箱门（门板、门封胶条里的柔性磁条、门上一块冰箱贴）；一个橱柜一角，门框上是磁吸门扣（塑料壳、磁铁、两片钢极板），柜门内侧是钢吸片。

### 1.3 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源的典型值或定性事实；`DESIGN` = 本设计研究取的值；`SIM` = §4.2 模型的结果。P# → §7，施工时变 S#。

| # | 项 | TYPICAL（来源） | DESIGN / SIM（本模型） | 待核 |
|---|---|---|---|---|
| F-1 | 磁铁能推能拉；不接触也能作用 | 课纲（P2 第 62 页）；P4 | — | |
| F-2 | 两极；同极相斥、异极相吸；两极总成对出现，切开仍有两极 | P2 第 62 页；P4（22.1） | — | |
| F-3 | 自由悬挂的条形磁铁静止时指南北 | P2 第 62 页 | 悬挂姿态 `suspended`：A 的北极朝 −Z（模型的"北"，§3.2） | |
| F-4 | 地球磁场在地表约 25–65 µT；新加坡附近约 40 µT 量级 | P10（NOAA NCEI 世界磁场模型） | 指南针计算里的地磁背景场取 40 µT、水平分量指向模型"北"（SIM 用） | 新加坡值待核（WMM 计算器） |
| F-5 | 场线：磁铁外从北极出发回到南极；越密越强；不相交 | P6（OpenStax 22.3） | 场线按 Gilbert 磁荷模型积分（§4.2） | |
| F-6 | 两极最强（铁屑在两端最密） | P6；P8（1913 铁屑照片） | 铁屑密度按 \|B\| 加权 | |
| F-7 | 磁性材料：铁、钢（课纲）；还有镍、钴（课纲 Note：不要求记忆） | P2 第 62 页；P5 | 测试盘：铁钉、钢回形针、钢罐头盒被吸 | |
| F-8 | 非磁性：铝、铜、黄铜、木、塑料、玻璃、橡胶 | P4；P12 | 铝罐、铜线、木块、塑料纽扣不被吸 | |
| F-9 | 不锈钢：奥氏体（304 / "18/8"，多数餐具）基本不被吸；铁素体、马氏体不锈钢被吸 | P13（BSSA） | 测试盘的不锈钢勺按奥氏体：不被吸（字幕写"几乎吸不动"） | 是：读 BSSA 原文 |
| F-10 | 隔着非磁性材料仍能吸；距离增大吸力迅速变小 | P4；P7 | 卡片实验：0–6 张 × 2 mm，吸住回形针 10 / 5 / 3 / 2 / 1 / 1 / 0 只（SIM，§4.2） | |
| F-11 | 吸力随距离：远处偶极子 ∝ 1/r⁴（力）、场 ∝ 1/r³；近处单极项主导 | P7（HyperPhysics / OpenStax UP2 ch.12） | 两磁铁间隙 6 / 3 / 1.5 cm，相对吸力约 12 / 41 / 100 %（SIM，脚本算出后回填，§4.2） | 数值由脚本定 |
| F-12 | 摩擦法：用一极沿同一方向从一端摩擦到另一端，抬起回到起点重复 | P2 第 62 页；P14 | 0 / 10 / 20 / 30 次 → 吸 0 / 2 / 4 / 6 只回形针（SIM，示意，饱和于 6） | 次数待核（课本常写"约 20 次"） |
| F-13 | 电流法：钢钉外绕绝缘导线、接电池；通电时成磁铁；钢断电后留磁，软铁几乎不留 | P2 第 62 页；P5（22.2） | 30 圈；1 节电池 3 只、2 节 6 只；断电后钢钉留 1 只（SIM） | |
| F-14 | 电磁铁强弱随电流和圈数增大 | P5 | 细看；v1 不做圈数变量（§0.1-4） | |
| F-15 | 加热到居里点（铁约 770 °C）失去磁性；摔打也会减弱 | P18 | 细看 | 是 |
| F-16 | 学校磁铁常见材料：铁氧体（陶瓷，含铁的氧化物）、铝镍钴、磁钢；钕铁硼更强；冰箱贴是柔性铁氧体（橡胶 + 铁氧体粉） | P17 | 条形磁铁 = 磁钢（DESIGN）；环形磁铁 = 铁氧体；冰箱贴 = 柔性铁氧体 | 是 |
| F-17 | 冰箱贴、门封磁条按条纹交替充磁，磁通集中在一面（Mallinson 1973 的"单面磁通"） | P16 | 细看 | 柔性片材的充磁方式待核 |
| F-18 | 学校条形磁铁常见 75–150 mm 长 | P19（教具目录） | 100 × 20 × 10 mm（DESIGN） | 是 |
| F-19 | 指南针：最早的明确文字记载是沈括《梦溪笔谈》（约 1088 年）的磁针 | P11（Britannica） | 第 06 章细看 | |
| F-20 | 上海磁浮线：约 30 km，2003 年起运营；2021 年 5 月前最高运营时速 431 km/h，之后 300 km/h；常导吸引式（车体抱住轨道、电磁铁向上吸） | P15 | 图 `magnets-maglev` + 细看 | 运营方原文待核 |
| F-21 | 电铃：电磁铁吸动衔铁敲铃，触点断开、弹回、再接通 | P20 | 图 `magnets-electric-bell` + 细看 | |
| F-22 | 回收站用磁铁把钢罐与铝罐分开 | P21 | 第 04 章细看；图 `magnets-scrap-crane` | 是：找新加坡 NEA / 回收厂一手说明 |
| F-23 | 新加坡第三系列硬币是钢芯多层镀层 | P22（MAS） | 只在第 04 章细看提一句（"被吸是因为里面是钢"），不建模 | 被吸为推论，施工时找直接说法或删"被吸" |

**模拟（SIM，内部自洽）**：§4.2 的四个小模型——两磁铁吸 / 斥力（相对值）、指南针方位、隔卡片吸回形针、制磁铁吸回形针——的算式与数字都写进设计研究来源 S1；PLATE 块读数、字幕、细看里的同一个量必须同值。

### 1.4 口吻

按 skill 的 `writing-rules.md`。课纲用词：magnet、push、pull、pole、north pole / south pole（north-seeking 在细看）、attract、repel、magnetic material、non-magnetic material、freely suspended、stroke method、electrical method、electromagnet。中文：磁铁、磁极、北极 / 南极、相吸 / 相斥、磁性材料 / 非磁性材料、自由悬挂、摩擦法、电流法、电磁铁。不说"磁铁有魔力""神奇"；不拟人（"磁铁想抓住钉子"）；感叹号、问句标题都不用。安全：强力钕磁铁会夹手、吞下多颗小磁铁对儿童危险（细看一句，带来源 P23）；电磁铁只用干电池，线圈会发热、不要长时间接通。


### 1.5 PSLE 题型 → 本主题哪里支持

| 题型（S3 第 16–18 页：认出 / 设计公平测试、读表、用模型预测） | 支持 |
|---|---|
| 把物品分成磁性 / 非磁性（含"不是所有金属"） | 第 04 章测试盘，先猜后看 |
| 比较磁铁强弱：吸住回形针的只数；隔几张卡片 | 第 04 章卡片实验 + 数据表（只改卡片张数） |
| 由相吸 / 相斥判断未知的极 | 第 03 章（细看：只有"推"能证明同极） |
| 悬挂磁铁、指南针指向 | 第 02 章 |
| 摩擦法的次数、电流法的电池个数与吸起的回形针 | 第 05 章 + 数据表 |
| 生活用途的判断（为什么冰箱门用磁条） | 第 06 章 |

---

## 2. 写实与参考图

### 2.1 Tier-1（一眼能认）

| 对象 | 必须对的 |
|---|---|
| 条形磁铁 | 长方条、两端两色、边缘小圆角；长:宽:高 ≈ 10:2:1 |
| 马蹄形磁铁 | U 形、两臂平行、极尖平头且涂色；臂截面近方形 |
| 环形磁铁 | 深灰哑光铁氧体环，中孔；同极相对时上环悬空（间隙约等于环厚的 1–2 倍） |
| 指南针 | 圆壳 + 刻度盘（32 条刻度、4 条长刻度）+ 菱形针（一半涂色）+ 玻璃罩；针绕中心轴转 |
| 铁屑 | 细短的针状颗粒、沿场线排成串、两极处最密成簇，中部稀疏；**图样从一极弯回另一极，不成漩涡、不交叉** |
| 电磁铁 | 钉子 + 密绕的漆包线（铜色）+ 两头引线 + 电池盒 + 开关；回形针挂在钉尖 |
| 冰箱门封 | 门板边缘的橡胶胶条，截面里有一条扁平磁条（P24 专利图的截面） |
| 磁吸门扣 | 塑料壳内一块磁铁夹在两片钢极板之间，柜门上一块钢吸片 |

### 2.2 尺寸（米；R2 按参考图调）

| 对象 | 尺寸 | 来源 |
|---|---|---|
| 实验台面（context） | 0.90 × 0.50 m，台面在 y = 0 | 设计 |
| 条形磁铁 A、B | 0.100 × 0.010 × 0.020（长 × 高 × 宽） | F-18 |
| 马蹄形磁铁 | 外宽 0.060、高 0.075、臂截面 0.012 × 0.012 | 教具目录（P19，待核） |
| 环形磁铁 | 外径 0.030、内径 0.008、厚 0.008 | 同上 |
| 指南针 | 外径 0.050、高 0.012 | 同上 |
| 回形针 | 长 0.033、钢丝径 0.0009（标准 No.1，待核） | P19 |
| 钢棒 | Ø 0.006 × 0.120 | 设计 |
| 钢钉 | 0.100 长、杆径 0.004 | 设计 |
| AA 电池 | Ø 0.0145 × 0.0505 | docs/23 F-8 |
| 冰箱门段 | 0.30 宽 × 0.40 高 × 0.05 厚 | 设计（示意截取） |
| 门封胶条截面 | 约 0.020 × 0.015，磁条 0.012 × 0.002 | P24（专利图，待核） |

### 2.3 参考图（`scripts/geo/magnets/refs/`，gitignore，不发布）

| # | 文件 | 来源 | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | `filings-bar.png` | Commons `File:Magnet0873.png`（Black & Davis, *Practical Physics*, 1913, fig. 200） | 公有领域 | 单根条形磁铁的铁屑图样：两端成簇、弧线回绕、中部稀 |
| R2 | `vfpt-bar-B.svg` | Commons `File:VFPt magnet B currents.svg`（Geek3） | CC BY-SA 4.0 | 条形磁铁的场线形状（内外闭合、两端密） |
| R3 | `vfpt-dipoles.svg` | Commons `File:VFPt dipoles magnetic.svg`（Geek3） | CC BY-SA | 远处偶极场；与模型脚本结果对照 |
| R4 | `filings-attract.jpg`、`filings-repel.jpg` | Commons 分类 *Magnetic field lines* / *Iron filings* 里异极相对、同极相对的照片（施工时选定文件名） | 逐张核 | 中间连成桥 / 中间空白（中性点） |
| R5 | `horseshoe.jpg` | Commons 分类 *Horseshoe magnets*（选一张红色涂装的） | 逐张核 | 臂截面、极尖涂色、长宽比 |
| R6 | `compass.jpg` | Commons 分类 *Magnetic compasses*（选一个简单的学生指南针） | 逐张核 | 壳、刻度盘、针形 |
| R7 | `ring-magnets-levitation.jpg` | Commons 分类 *Magnetic levitation* 里环形磁铁套在立柱上的照片 | 逐张核 | 悬浮间隙 |
| R8 | `fridge-gasket-patent.png` | 冰箱门封专利图（Google Patents，截面图；施工时选一份美国专利，专利图为公有领域） | 公有领域 | 胶条截面与磁条位置 |
| R9 | `cabinet-catch.jpg` | Commons 分类 *Magnetic catches*（若无，用专利图） | 逐张核 | 壳、两片极板、吸片 |
| R10 | `electromagnet-nail.jpg` | Commons 分类 *Electromagnets* 里"钉子 + 线圈 + 电池"的教学照片 | 逐张核 | 线圈疏密、引线、回形针 |
| R11 | `maglev-shanghai.jpg` | Commons 分类 *Shanghai Maglev Train* | 逐张核 | 车体抱轨的截面（图 `magnets-maglev` 用） |
| R12 | `electric-bell.png` | 1900 年前后物理教科书里的电铃图（Commons / archive.org，公有领域） | 公有领域 | 电磁铁、衔铁、触点螺钉、铃碗（图 `magnets-electric-bell` 用） |

写实轮次：R2 两轮并排（条形磁铁 + 铁屑、指南针、电磁铁、门封截面）→ R3 材质（磁钢的缎面漆、铁氧体的哑光、铜线、玻璃罩）→ R4 流（场线粒子、电流）与 sim 绑定（针的摆动、回形针跳起）。

---

## 3. 分区与零件

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色 | 链路卡 |
|---|---|---|---|---|---|
| 01 | `magnets` | Magnets / 磁铁 | 条形 A（两极两件）、条形 B、马蹄形、环形 ×2、立柱 | `token:ink-2` | ✓ |
| 02 | `compass` | Compass / 指南针与悬挂 | 指南针四件、铁架台 | `token:accent-1` | ✓ |
| 03 | `materials` | Test objects / 测试材料 | 测试盘、8 件物品、卡片、回形针串 | `token:neutral` | `card: false` |
| 04 | `making` | Making magnets / 制作磁铁 | 钢棒、钢钉、线圈、电池、开关、导线、回形针 | `token:accent-2` | ✓ |
| 05 | `uses` | Magnets at work / 生活中的磁铁 | 冰箱门、门封、冰箱贴、门扣 | `token:ink-3` | ✓ |
| 06 | `field` | Magnetic field / 磁场 | 铁屑（零件）+ 场线（流） | `token:accent-3` | `card: false` |
| — | `current` | Current / 电流 | 只有流（电磁铁回路） | `token:accent-4` | — |

右上卡 4 列 = magnets、compass、making、uses；`connects` 很少（磁铁 ↔ 指南针、线圈 ↔ 电池 ↔ 开关），链路卡在本主题是次要读物。

### 3.2 坐标与尺度

- 米，Y 向上，+Z 朝观者，+X 向右；台面 y = 0。**模型的"北"= −Z**（台面里侧），指南针和悬挂磁铁都按它；读者看到的"北"由引线标注和指南针刻度盘的长刻度表示（无文字）。
- `units: { "modelUnit": "cm", "scale": 100 }`（PLATE 块比例尺用 cm）。
- 整体包络 x −0.45…0.45、y 0…0.42（冰箱门段最高）、z −0.25…0.25；模型半径约 0.55。投影规则：包围半径 ≥ 0.28 × 模型半径 ≈ 0.15 的零件投影 → 只有冰箱门段、橱柜一角投影，小件不投影（台面接触阴影仍在）。
- 各区中心：磁铁 A (−0.16, 0.005, 0)；导轨 x −0.08…0.06；马蹄形 (−0.36, 0.006, 0.14)；环形立柱 (−0.36, 0, −0.14)；指南针默认 (−0.16, 0.017, 0.085)（A 正前方，纸面之上）；铁架台 (0.04, 0, −0.18)；测试盘 (0.12, 0.006, 0.13)；卡片架 (0.02, 0, 0.17)；钢棒 (0.15, 0.003, −0.06)；电磁铁 (0.29, 0, −0.05)；冰箱门段 (0.40, 0.20, −0.14)；门扣 (0.40, 0.12, 0.14)。

### 3.3 零件（35 个 + 3 个 context）

"shell"= X-RAY 时透明；"隐"= 默认 hide 的章；"sim"= 被 §4.3 绑定的属性。

| # | id · 名称 | 组 | primitive（+ extra） | at | 材质 | explode | sim | 隐 | 参考 |
|---|---|---|---|---|---|---|---|---|---|
| 01 | `bar-magnet-n` 条形磁铁 A · 北极 | magnets | bevelBox [0.050, 0.010, 0.020] bevel 0.0012 | (−0.135, 0.005, 0) | `steel` + tint `token:pole-n`（新） | [0,1,0] 0.06 | 姿态 suspended / card-test / stroke | | R1 |
| 02 | `bar-magnet-s` 条形磁铁 A · 南极 | magnets | 同上 | (−0.185, 0.005, 0) | `steel` + `token:pole-s` | 同上 | 同上 | | R1 |
| 03 | `bar-magnet-b` 条形磁铁 B | magnets | bevelBox ×2（extra，两色各一半） | (−0.03, 0.005, 0) | 同上两色 | [1,0,0] 0.08 | `offset` x ← `gap`；`pose` ← `facing` | 01 外的不相关章 | R1 |
| 04 | `horseshoe-magnet` 马蹄形磁铁 | magnets | sweep U 形 path（平放，开口朝 +X），section flat 1.0，r 0.006；extra 2 个极尖 bevelBox（两色） | (−0.36, 0.006, 0.14) | `steel` + tint 砖红；极尖 `pole-n` / `pole-s` | [−1,0,0.5] 0.08 | | | R5 |
| 05 | `ring-magnet-lower` 下环形磁铁 | magnets | lathe 环 外 0.015 / 内 0.004 / 厚 0.008 | (−0.36, 0.004, −0.14) | `powder` + tint 深灰（铁氧体） | [0,1,0] 0.02 | | | R7 |
| 06 | `ring-magnet-upper` 上环形磁铁 | magnets | 同上 | (−0.36, 0.030, −0.14) | 同上 | [0,1,0] 0.06 | `pose` ← `top-ring`（repel 悬浮 / attract 贴合）；`ring-bob` 动画 | | R7 |
| 07 | `ring-post` 立柱 | magnets | cylinder [0.0035, 0.0035, 0.12] + 底座 bevelBox | (−0.36, 0.06, −0.14) | `wood`（新材质族，§4.4 M8；退路 `plastic` + 木色 tint） | — | | | R7 |
| 08 | `compass-case` 指南针外壳 | compass | lathe（底 + 侧壁 + 唇边） | (−0.16, 0.017, 0.085) | `brass` | [0,1,0] 0.03 | `offset` ← `compass-at`（8 个位置） | 除 02、03、06 | R6 |
| 09 | `compass-card` 刻度盘 | compass | cylinder 盘 + extra bevelBox 刻度 `repeat {count 32, radius 0.019}` + 4 条长刻度 | 同上 +y 0.004 | `enamel` | 同上 0.04 | 跟随 08 | 同上 | R6 |
| 10 | `compass-needle` 指南针针 | compass | extrude 菱形 ×2（extra，两色） | 同上 +y 0.006 | `steel`，北半 `pole-n` | 同上 0.05 | `rotate` y ← `needle-bearing`（阻尼摆动，§4.3 S4） | 同上 | R6 |
| 11 | `compass-glass` 玻璃罩 | compass | lathe 低穹顶 | 同上 +y 0.010 | `glass`，`shell` | 同上 0.06 | | 同上 | R6 |
| 12 | `suspension-stand` 铁架台与吊线 | compass | tube L 形支杆 + bevelBox 底座 + sweep 细线 r 0.0004 + 纸托（extra） | (0.04, 0, −0.18) | `steel` / 线 `plastic` 白 | [0,0,−1] 0.05 | | 除 02 | — |
| 13 | `test-tray` 测试盘 | materials | extrude 浅盘（壁厚 0.002） | (0.12, 0.006, 0.13) | `plastic` 暖灰 | [0,−1,0] 0.02 | | | — |
| 14 | `iron-nail` 铁钉 | materials | cylinder + cone 尖 + 钉帽 cylinder | 盘内 | `steel` | [0,1,0] 0.04 | `pose` ← reveal（跳到磁铁） | | — |
| 15 | `steel-paper-clips` 钢回形针 | materials | sweep 回形针路径 r 0.00045，`repeat` 3 | 盘内 | `stainless`（镀锌钢的亮色） | 同上 | 同上 | | — |
| 16 | `steel-can` 钢罐头盒 | materials | lathe 罐身 + 卷边，Ø 0.065 × 0.075（小罐，示意缩小，待核） | 盘外右侧 | `steel` + tint 镀锡 | [1,0,0] 0.04 | 吸力箭头 | | — |
| 17 | `aluminium-can` 铝饮料罐 | materials | lathe 罐身（缩颈、罐底穹）Ø 0.066 × 0.115（330 ml 罐，待核） | 盘外右后 | `casing`（拉丝铝） | [1,0,0] 0.04 | | | — |
| 18 | `copper-wire` 铜线卷 | materials | torus ×3（extra，错开） | 盘内 | `copper` | [0,1,0] 0.04 | | | — |
| 19 | `steel-spoon` 不锈钢勺 | materials | sweep 勺柄 + lathe 勺碗（压扁 scale） | 盘内 | `stainless` | 同上 | | | — |
| 20 | `wooden-block` 木块 | materials | bevelBox [0.03, 0.02, 0.02] | 盘内 | `wood` | 同上 | | | — |
| 21 | `plastic-button` 塑料纽扣 | materials | lathe 扁盘 + 4 孔（extrude holes） | 盘内 | `plastic` + tint | 同上 | | | — |
| 22 | `barrier-cards` 卡片叠 | materials | bevelBox [0.06, 0.002, 0.04]，`repeat` 6 沿 y 间距 0.002 | 卡片架 (0.02, 0.06, 0.17) | `plastic` 纸板色 tint | [0,0,1] 0.04 | `count` ← `cards`（0–6 张可见） | 除 04 | — |
| 23 | `clip-chain` 回形针串 | materials | 回形针 sweep，`repeat` 10 沿 −y 间距 0.03（首尾相钩，交替转 90° 用 extra 两向） | 卡片下方 | `stainless` | 同上 | `count` ← 输出 `clips-cards` | 除 04 | — |
| 24 | `steel-rod` 钢棒 | making | cylinder [0.003, 0.003, 0.12]，横放 | (0.15, 0.003, −0.06) | `steel` | [0,1,0] 0.04 | extra 回形针 `repeat` 6，`count` ← `clips-stroke`（见注） | | — |
| 25 | `em-nail` 钢钉 | making | cylinder 杆 + cone 尖 + 钉帽，竖放钉尖朝下（被小夹子夹在支架上） | (0.29, 0.07, −0.05) | `steel` | [0,1,0] 0.04 | | | R10 |
| 26 | `em-coil` 线圈 | making | **coil**（新 primitive，§4.4 M6）r 0.0035、导线 r 0.0004、30 圈、节距 0.0012 | 绕 25 | `copper` + tint 漆包红褐 | [1,0,0] 0.04 | | | R10 |
| 27 | `em-cells` 电池与电池盒 | making | 电池盒 extrude + AA lathe `repeat` 2 | (0.36, 0.008, 0.00) | `plastic` 黑 / `casing` | [1,0,0] 0.05 | `count` ← `em-cells`（1 / 2 节可见） | | — |
| 28 | `em-switch` 开关 | making | bevelBox 底座 + 拨钮 bevelBox | (0.29, 0.006, 0.04) | `plastic` | [0,1,0] 0.03 | `pose` ← `em-switch`（拨钮左右） | | — |
| 29 | `em-leads` 导线 | making | sweep ×3（extra），r 0.0012，红 / 黑绝缘层 | 连 26–27–28 | `rubber` + tint | — | | | — |
| 30 | `em-paper-clips` 回形针（电磁铁） | making | 回形针 sweep `repeat` 6（钉尖下一簇） | (0.29, 0.012, −0.05) | `stainless` | — | 钉尖下吸起的只数 `count` ← `clips-em`；台面上另有一小堆静止的回形针（extra，不随数变） | | R10 |
| 31 | `fridge-door` 冰箱门段 | uses | bevelBox 门板 + extrude 内胆凸缘（extra） | (0.40, 0.20, −0.14) | `enamel` | [0,0,1] 0.06 | `pose` ← `fridge-door`（开 25° / 关） | 01–05 | R8 |
| 32 | `door-gasket` 门封与磁条 | uses | sweep 胶条（U 截面，`hollow`）沿门边一圈 + extra 磁条 sweep（扁） | 门板四周 | `rubber` 灰白 / 磁条 `powder` 深灰 | 同上 | | 01–05 | R8 |
| 33 | `fridge-magnet` 冰箱贴 | uses | bevelBox [0.05, 0.035, 0.002] | 门板前面 | `plastic` + 暖色 tint；背面 `powder` | [0,0,1] 0.03 | | 01–05 | — |
| 34 | `cabinet-latch` 磁吸门扣 | uses | bevelBox 壳 + extra 磁铁块、两片钢极板；柜门内侧钢吸片（extra，随门 pose） | (0.40, 0.12, 0.14) | `plastic` 白 / `steel` | [0,0,1] 0.04 | `pose` ← `cabinet-door` | 01–05 | R9 |
| 35 | `iron-filings` 铁屑与纸 | field | 纸 plane（A4，在 A 之上 y 0.0105）+ **filings**（新 primitive，§4.4 M3）：2,400 根针 0.002 × 0.0003，方向与密度按场 | (−0.16, 0.0105, 0) | 纸 `enamel` 白；铁屑 `powder` 深灰 | — | 跟随磁场状态（state-keyed） | 除 02、03 | R1、R4 |
| — | `bench` 实验台面 | context | bevelBox [0.90, 0.03, 0.50] | (0, −0.015, 0) | `wood` | — | | | — |
| — | `fridge-body` 冰箱侧壁一段 | context | bevelBox | 门段后 | `enamel` | — | | 01–05 | — |
| — | `cabinet-corner` 橱柜一角 | context | bevelBox 柜体 + 柜门（柜门随 pose） | 门扣处 | `wood` / `enamel` | — | | 01–05 | — |

- 零件数理由：每个课纲动作需要一组看得见的器材；磁铁 A 拆成两极两件，才能分别标注"北极 / 南极"。测试物 8 件 = 3 件被吸（铁钉、钢回形针、钢罐）+ 1 件"几乎不吸"（不锈钢勺）+ 4 件不被吸（铝罐、铜线、木块、塑料纽扣），其中 3 件是金属却不被吸，覆盖"不是所有金属"。删减顺序（若超预算）：`ring-post` 并入下环形磁铁的 extra → `copper-wire` 并入测试盘 extra（失去单独标注）。
- 注：钢棒的摩擦法结果（吸几只回形针）用 `em-paper-clips` 之外的一小簇——实现时给 24 号 `steel-rod` 加 extra 回形针 `repeat` 6 + `count` 绑定，零件数不变。
- 绘制预算：静止约 35 零件 × 1.3 材质槽 ≈ 46 + 地面 2 + 铁屑 1 ≈ 49（< 50）；运转加场线 1、电流 1、针 0 → < 55。三角形：线圈 30 圈（约 20 k）、铁屑 2,400 × 12 ≈ 29 k、其余 < 120 k → < 0.2 M。
- 默认不隐藏零件（第 01 章是全台）；"生活中的磁铁"一区在 01–05 章 `hide`（不抢画面），06 章露出。

### 3.4 summary / detail 要点（施工时写成 EN / ZH）

| id | summary（≤ 60 字符） | detail 要点 |
|---|---|---|
| bar-magnet-n | The end that turns to point north. / 会转向北方的一端。 | 磁钢条形磁铁的北极（north-seeking pole）；两端吸力最强 [F-6]；颜色只是标记，真磁铁的极要用指南针或已知磁铁判断 |
| bar-magnet-s | The other pole; pairs with the north. / 另一极，和北极成对。 | 每根磁铁都有两极；切成两半各自又有两极（细看）[F-2] |
| bar-magnet-b | A second magnet to push and pull. / 第二根磁铁，用来推和拉。 | 沿导轨移动、可调头；间隙 6 / 3 / 1.5 cm 时相对吸力（SIM）[S1] |
| horseshoe-magnet | Bends both poles to the same side. / 把两极弯到同一侧。 | 两极靠近，两极之间吸力集中；回形针吸在极尖 |
| ring-magnet-upper | Floats when like poles face. / 同极相对时悬浮。 | 铁氧体 [F-16]；翻过来异极相对就贴紧 |
| compass-needle | A tiny magnet free to turn. / 能自由转动的小磁铁。 | 针的北极指向地磁场方向；靠近磁铁时改指磁铁 [F-4, F-5]；阻尼摆动后停下 |
| suspension-stand | Lets a magnet turn freely. / 让磁铁能自由转动。 | 细线 + 纸托，摩擦极小；静止时指南北 [F-3] |
| iron-nail | Iron: a magnet pulls it. / 铁：会被磁铁吸。 | 磁性材料 [F-7] |
| steel-can | Steel can: attracted. / 钢罐：会被吸。 | 罐头盒是镀锡钢；回收站用磁铁把它和铝罐分开 [F-22] |
| aluminium-can | Aluminium: not attracted. / 铝：不被吸。 | 金属，但非磁性 [F-8] |
| steel-spoon | Most stainless spoons: hardly pulled. / 多数不锈钢勺：几乎吸不动。 | 奥氏体不锈钢 [F-9]；有的不锈钢（铁素体）会被吸——用磁铁试一试 |
| barrier-cards | Cards add a gap between. / 卡片把距离拉开。 | 每张 2 mm（DESIGN）；吸住回形针数（SIM）[S1] |
| em-coil | Current here turns the nail into a magnet. / 这里通电，钉子就变成磁铁。 | 30 圈绝缘铜线；绝缘层让电流沿导线绕圈而不是走捷径 [F-13] |
| em-nail | Steel core; keeps a little magnetism. / 钢芯，断电后留一点磁性。 | 钢 vs 软铁 [F-13] |
| door-gasket | A magnet strip seals the fridge door. / 门封里的磁条把门吸紧。 | 柔性铁氧体，单面磁通 [F-17] |
| cabinet-latch | Holds the door shut with a magnet. / 用磁铁把柜门吸住。 | 两片钢极板把磁力引到正面 |
| iron-filings | Filings line up to show the pattern. / 铁屑排出磁铁周围的图样。 | 每粒铁屑被磁化成小磁铁，沿场线排列；两极最密 [F-5, F-6] |

---

## 4. 引擎必须展示的物理，以及最小的"小模拟"

### 4.1 要看得见的物理（课纲 → 画面 → 机制）

| 课纲点 | 画面 | 机制 |
|---|---|---|
| 推或拉 | B 沿导轨靠近 A：异极相对时被拉过去、同极相对时被推开；两根**力箭头**（墨色，长度 ∝ 力） | sim `magnet`：`gap`、`facing` 控件 → 力（Gilbert 四磁荷）→ B 的 `offset`、箭头 |
| 两极最强 | 铁屑在两端成簇；马蹄形极尖的回形针 | `filings` 密度 ∝ \|B\| |
| 磁铁周围有场 | 纸上铁屑（静态写实层）+ 场线（缓慢流动的粒子线，可开关） | 构建期按偶极子积分；多路径流 |
| 指南北 | 悬挂的 A 转到南北；指南针在 8 个位置上转向 | 姿态 `suspended`；sim 计算针的方位 + 阻尼摆动 |
| 同极相斥异极相吸 | B 调头；铁屑图样：异极之间连成桥，同极之间中间空白 | 状态切换场线 / 铁屑（state-keyed） |
| 距离 | 间隙 6 → 3 → 1.5 cm，箭头变长，读数 12 → 41 → 100 % | sim 力 |
| 磁性 / 非磁性材料 | 磁铁扫过测试盘，铁钉、回形针跳起贴上，钢罐出箭头，其余不动 | 姿态 `tray-picked`；先猜后看 |
| 隔物吸引 | 卡片 0–6 张，回形针串变短：10 / 5 / 3 / 2 / 1 / 1 / 0 | sim：`cards` → `clips-cards`；`count` 绑定 |
| 摩擦法 | A 的北极沿钢棒一个方向滑过、抬起、回到起点，循环；次数 0 / 10 / 20 / 30 → 吸 0 / 2 / 4 / 6 只 | `sequence` 动画；sim `strokes` → `clips-stroke` |
| 电流法 / 电磁铁 | 开关拨上：电流沿导线和线圈流动（粒子），钉子周围出现场线，回形针跳起；拨下：多数掉落、留 1 只 | sim `em-switch`、`em-cells` → `clips-em`、流可见、场状态 |
| 用途 | 冰箱门开合、门封截面的磁条、门扣 | 姿态 + 命名剖切 `uses` |

### 4.2 模型（设计研究 S1 的内容；全部纯函数，有单测）

1. **磁铁 = Gilbert 磁荷对**：每根条形磁铁两极各一个点磁荷 ±q，位于距端面 0.08 L 处（有效磁极距 0.84 L，L = 0.10 m；"磁长约为几何长度的 0.85"是教科书经验值，待核 P7）。马蹄形：两磁荷在两极尖内 6 mm。环形：沿轴的一对磁荷。电磁铁：钉子两端一对磁荷，q ∝ 电池节数（开关断开时 q = 剩磁 0.15 q₁）。
2. **场**：B(r) = Σ k qᵢ (r − rᵢ) / \|r − rᵢ\|³ + B_earth（40 µT 水平向模型"北"，只影响指南针）。单位任意；只用方向与相对大小。
3. **场线（构建期）**：从北极磁荷周围半径 4 mm 的球面上取种子（每个场线状态 24 根：xy 平面 8、xz 平面 8、两斜面各 4），RK4 积分，步长 1 mm，到达任一南极磁荷 4 mm 内或离开台面包络时停；方向从北到南。输出折线 → 多路径流（§4.4 M2）。铁屑：纸面网格（4 mm 抖动采样）上每点取 B 在纸面的投影方向，按 \|B\|^0.5 的概率保留，得到 2,400 根针的位置与朝向。
4. **场的状态（离散，构建期全部算好）**：`single`（只有 A）、`ns-6`、`ns-3`、`ns-1.5`、`nn-6`、`nn-3`、`nn-1.5`、`ss-3`（B 调头 + 间隙）、`horseshoe`、`em-on-1`、`em-on-2`、`em-off`。共 12 套 × 24 根 × ≤ 120 点，量化到 0.1 mm，约 120 KB（JSON gzip 后约 40 KB）。
5. **两磁铁的力**（运行时）：F = Σᵢ∈A Σⱼ∈B k qᵢ qⱼ (rⱼ − rᵢ)/\|·\|³ 的 x 分量；**相对值**：以 `ns` 间隙 1.5 cm 为 100 %。脚本算出 6 / 3 cm 两档后回填 F-11 与 S1（Gilbert 四磁荷模型估算为 12 / 41 %，同极为同值的推力）；同极为负值（推）。
6. **指南针**（运行时）：针的目标方位 θ = atan2(Bₓ, −B_z)（模型"北" = −Z）在指南针中心处；针按二阶阻尼振子趋向 θ（周期 1.2 s、阻尼比 0.3），约 3 s 停稳；深链接和截图直接取终值。8 个位置：以 A 中心为圆心、半径 0.085 m 的圆上每 45° 一个。
7. **隔卡片吸回形针**（运行时）：间隙 g = 2 mm × 卡片数；吸住只数 n = floor(10 × (5 / (5 + g))²) → 0–6 张：10、5、3、2、1、1、0。示意模型（单极近场 ∝ 1/距离²，5 mm 为极面到有效磁荷的等效距离），**排序正确、数字是示意**，S1 写明。
8. **摩擦法**：n = min(6, floor(strokes / 5)) → 0 / 10 / 20 / 30 次：0 / 2 / 4 / 6 只（示意、饱和）。
9. **电磁铁**：n = 3 × 电池节数（开关接通）；断开时 1（钢的剩磁）。示意。电流读数不在本主题出现（P5 内容，见 docs/23）。

### 4.3 共享引擎扩展 E-SIM：SpaceScene 的 `sim`（"试一试"）

**目标**：在 SpaceScene 里加"读者可操作的变量 + 由纯函数模型算出的结果 + 结果驱动模型与读数 + 公平测试的数据表"，不新开引擎。磁铁（`kind: 'magnet'`）和电路（`kind: 'circuit'`，docs/23 §4）共用核心 S1–S8，各自带模型。docs/17 §7 的 B8（场线生成）、B2（姿态序列）、D0（变量与数据表的最小版）、D2（电路求解，见 docs/23）都落在这里。

#### parts.json 的数据形状

```jsonc
"sim": {
  "kind": "magnet",                                  // magnet | circuit（模型注册表，lib/sim/<kind>.ts）
  "controls": [                                      // 读者能改的量（≤ 10）
    { "id": "gap", "kind": "step", "label": { "en": "Gap", "zh": "间隙" }, "unit": "cm",
      "values": [6, 3, 1.5], "default": 6 },         // step：有序离散值；‹ › 与 [ ] 键
    { "id": "facing", "kind": "choice", "label": { "en": "Facing poles", "zh": "相对的极" },
      "options": [ { "id": "ns", "label": { "en": "N–S", "zh": "北–南" } },
                   { "id": "nn", "label": { "en": "N–N", "zh": "北–北" } },
                   { "id": "ss", "label": { "en": "S–S", "zh": "南–南" } } ], "default": "ns" },
    { "id": "compass-at", "kind": "step", "values": [1,2,3,4,5,6,7,8], "default": 1, "label": {…} },
    { "id": "cards", "kind": "step", "values": [0,1,2,3,4,5,6], "default": 0, "label": {…} },
    { "id": "strokes", "kind": "step", "values": [0,10,20,30], "default": 0, "label": {…} },
    { "id": "em-switch", "kind": "toggle", "default": false, "label": {…} },
    { "id": "em-cells", "kind": "step", "values": [1,2], "default": 2, "label": {…} },
    { "id": "top-ring", "kind": "choice", "options": [ "repel", "attract" ], "default": "repel", "label": {…} }
  ],
  "outputs": [                                       // 模型给出的量（读数、绑定、数据表都引用它们）
    { "id": "force", "label": {…}, "unit": "%", "decimals": 0 },
    { "id": "needle-bearing", "label": {…}, "unit": "°", "decimals": 0 },
    { "id": "clips-cards", "label": {…}, "unit": "" }, { "id": "clips-stroke", … }, { "id": "clips-em", … },
    { "id": "field-state", "kind": "state" }          // 离散状态名（选场线 / 铁屑那一套）
  ],
  "bind": [                                          // 结果 → 模型（每帧只在值变化时写）
    { "control": "gap", "part": "bar-magnet-b", "offset": { "axis": [1,0,0], "per": 0.01, "origin": 6 } },
    { "control": "facing", "part": "bar-magnet-b", "pose": { "ns": null, "nn": "b-flipped", "ss": "b-flipped" } },
    { "output": "needle-bearing", "part": "compass-needle", "rotate": { "axis": [0,1,0], "settle": { "period": 1.2, "damping": 0.3 } } },
    { "control": "compass-at", "part": ["compass-case","compass-card","compass-needle","compass-glass"], "at": "compass-ring" },
    { "output": "clips-cards", "part": "clip-chain", "count": true },
    { "control": "cards", "part": "barrier-cards", "count": true },
    { "output": "field-state", "flow": "field-lines", "state": true },
    { "output": "field-state", "part": "iron-filings", "state": true },
    { "control": "em-switch", "flow": "em-current", "visible": true },
    { "control": "em-switch", "part": "em-switch", "pose": { "true": "switch-on", "false": null } }
  ],
  "overlays": [ { "kind": "force-arrows", "between": ["bar-magnet-n", "bar-magnet-b"], "output": "force" } ],
  "magnet": { "magnets": [ … 磁荷位置、q … ], "earth": { "uT": 40, "north": [0,0,-1] }, "rings": { "compass-ring": { "center": [-0.16,0.017,0], "radius": 0.085, "count": 8 } } }
}
```

章 / 拍里：

```yaml
state:
  sim:
    set: { facing: ns, gap: 6 }          # 本章 / 本拍的控件值（不累积：没写的回到 default）
    try:                                  # 本章的"试一试"（每章最多一个；拍可以不写）
      vary: gap                           # 改变的量（signal 芯片，读者能操作）
      keep: [facing]                      # 保持不变的量（cold 芯片，锁住，显示当前值）
      observe: [force]                    # 观察的量（大号读数）
      record: true                        # 显示"记一行"按钮与数据表
      predict:                            # 可选：先猜后看（不打分）
        prompt: { en: "Turn magnet B round. What will happen?", zh: "把磁铁 B 调个头，会怎样？" }
        change: { facing: nn }            # 读者选完后应用的改变
        options: [ { id: pull, label: {…} }, { id: push, label: {…} }, { id: nothing, label: {…} } ]
        observe: force                    # 揭晓时按这个输出的符号 / 大小自动写"观察到：…"
```

#### 核心件（S1–S8）

| # | 件 | 内容 | 优先级 |
|---|---|---|---|
| S1 | schema + store + URL | zod：`sim` 顶层、章 / 拍 `sim`；store 字段 `sim: Record<id, number\|string\|boolean>`（不累积，换章重置为 default ⊕ 本章 set）；URL `sim=gap.3~facing.nn`（只写与本章基线不同的）；`pnpm validate` 核对控件 id、选项、`bind` 目标存在 | 必须 |
| S2 | 模型注册表 | `lib/sim/index.ts`：`evaluate(kind, data, values) → outputs`（纯函数、同步、< 1 ms）；`magnet.ts`、`circuit.ts` 各一份；有单测 | 必须 |
| S3 | 试一试卡片 | 阅读面板"节拍行"之后（docs/08 §2 铁律 d 改为：章头 → 节拍行 → **试一试** → 选中对象 → 正文 → 本章索引）：三行芯片（改变 / 不变 / 观察）、控件（toggle = 开关钮；step = ‹ 值 ›；choice = 分段按钮），全部 ≥ 44 px；手机在底部抽屉里同样可用。**快捷键与按钮共用 store**：`[` `]` = 当前 `vary` 控件上一值 / 下一值，`T` = 切换本章第一个 toggle；ESC 不清 sim | 必须 |
| S4 | 绑定 | 零件：`offset`（沿轴，值 × per）、`at`（命名位置环）、`rotate`（可带 `settle` 阻尼摆动）、`pose`（值 → 姿态名）、`count`（repeat 实例前 k 个可见；InstancedMesh.count）、`visible`、`glow`（docs/23）、`state`（选 state-keyed 几何的那一套）；流：`visible`、`state`、`intensity`（docs/23，每条路径的粒子速度 / 透明度）；动画：`rpm`（docs/23）、`enabled`（开 / 停）。绑定只在值变化时写；姿态与 sim 绑定叠加顺序：静止 → 拆开 / 移开 → 姿态 → sim offset / rotate → 动画 | 必须 |
| S5 | 读数 | `telemetry` 行加 `follow: "<output id>"`（此时 `idle` / `run` 可省；`lag` 默认 0.3 s）；本章 `try.observe` 里的输出在 PLATE 块读数里加粗；不适用的输出显示 `—`。PLATE 块状态小行加 `SIM <状态>`（如 `SIM N–S · 3 CM`） | 必须 |
| S6 | 数据表 | "记一行"把当前 `vary` 与 `observe` 的值追加一行（≤ 12 行，同值覆盖），列头 = 控件 / 输出标签与单位；表在试一试卡片里；只在内存（不进 URL、不进 storage，刷新即清，同 MathScene）；`__atlas.sim().table` | 必须（PSLE 公平测试） |
| S7 | 先猜后看 | 读者点一个选项 → 应用 `change` → 等绑定落定 → 卡片写"你猜：推开 · 观察到：推开 / You predicted: push · Observed: push"（观察由 `observe` 输出的符号 / 增减自动得出，**不判对错、不计分**）；再点"再看一次"回到改变前 | 应该 |
| S8 | 测试与文档 | 单测（模型、URL 往返、不累积语义、绑定写入）；`__atlas.sim()` / `__atlas.setSim(values)`；`pnpm shoot <slug> --beats` 应用拍的 `sim.set` 后截图；docs/06 新增「SpaceScene · 试一试（sim）」一节；docs/08 §2 铁律 d 改顺序 | 必须 |

- 演示（P）：拍的 `sim.set` 与其他拍字段一起应用；自动播放不操作控件；先猜后看在演示里显示为"先停在改变前 → 下一拍是改变后"，字幕里说"先想一想"（无交互）。
- `run`：sim 主题里 RUN 仍是"动起来"（流粒子、动画、指南针摆动的过程）；结果（回形针只数、灯亮度、针的终值）不受 RUN 影响——物理不暂停。REFERENCE 暂停运转，sim 值冻结、读数保留。
- 性能：模型在控件变化时算一次，不进每帧；场线 / 铁屑的 12 套几何构建期生成，运行时只切 draw range 或换 instance 矩阵缓冲（一次绘制）。

### 4.4 本主题另需的引擎件（E-MAG）

| # | 件 | 现状（已查） | 最小方案 | 退路 | 优先级 |
|---|---|---|---|---|---|
| M1 | 构建期场线 / 铁屑生成 `scripts/sim/magnet-field.ts` | 无；docs/17 B8 | 读 `sim.magnet`，按 §4.2 积分；输出写进 `data.json` 的生成段（不手写进 parts.json）；`pnpm validate` 时比对哈希，过期就报 | 手算写死 3 套 | 必须 |
| M2 | **多路径流** `paths: [[…],[…]]` + state-keyed `states: { <name>: [paths…] }` | 一条流一条 path、一次绘制（`Flows.tsx`） | 多条折线按弧长拼进同一行浮点纹理，粒子带路径号；一条流仍一次绘制；状态切换 = 换纹理段（0.4 s 交叉淡入） | 每种状态一条流（12 次绘制，超预算） | 必须（docs/23 也用） |
| M3 | `filings` primitive | 无 | 一个 InstancedMesh（细长 box），实例矩阵由 M1 生成；state-keyed：每套一段实例缓冲，切换时换 | 用 M2 的场线代替铁屑（损失"课堂里看到的样子"） | 必须 |
| M4 | 指南针绑定（`rotate` + `settle`） | 动画只有恒速 rotate / oscillate | S4 的 `settle`：二阶阻尼，每帧推进，停稳后不再请求帧 | 直接跳到终值 | 必须 |
| M5 | 力箭头叠加 `overlays: force-arrows` | 无 | 两支墨色箭头（cylinder + cone 实例，1 次绘制），长度 ∝ \|F\|^0.5（视觉压缩，读数给真实相对值），方向 = 推 / 拉 | 只用 PLATE 读数 | 应该 |
| M6 | `coil` primitive `{ radius, wire, turns, pitch, leads? }` | `sweep` 路径 ≤ 128 点，30 圈螺旋需 ≈ 400 点 | 解析螺旋管几何（TubeGeometry 等价，手工三角化），沿 Y | sweep 分 4 段拼 | 必须（docs/23 的电机也用） |
| M7 | token `pole-n`（砖红）、`pole-s`（灰蓝），paper / cinema 各一套 | 无 | `tokens.css` + `theme.ts` | 用 `hot` / `cold`（语义冲突，不推荐） | 必须 |
| M8 | 材质族 `wood`（木纹程序化贴图，哑光） | 无 | `textures.ts` 加一种木纹 canvas（固定种子） | `plastic` + 木色 tint | 应该（docs/23 也用） |
| M9 | `count` 绑定对 `repeat` 零件 | repeat 同材质会烘焙合并 | 有 `count` 绑定的零件强制 InstancedMesh（同 `each` 的路径） | — | 必须（S4 的一部分） |

**工作量估计**（Opus 引擎代理，含单测与 docs/06）：E-SIM 核心 S1–S8 ≈ 4–5 天；E-MAG M1–M9 ≈ 3–4 天（M2、M6、M8 与 docs/23 共享，先做的主题承担）。

### 4.5 "自己拖磁铁"（v2）

读者在舞台上沿导轨拖 B、拖指南针到任意位置：约束在一条线 / 一个圆上的拖动（射线投到导轨直线），需要运行时算场线（Web Worker，24 根 × RK4 ≈ 5 ms）或只更新铁屑。v1 用 step 控件 + 舞台上可点的导轨刻度 / 8 个位置圈（44 px 命中区）代替；v2 约 2 天。

### 4.6 HUD 数据

- **规格行**（≤ 4）：`Bar magnets` 100 × 20 × 10 mm · steel（design）；`Compass` Ø 50 mm（design）；`Electromagnet` 30 turns · 2 × AA（design）；`Earth's field here` ≈ 40 µT（typical，F-4，待核）。
- **PLATE 块读数**（telemetry，全部 `follow`，SIM）：Gap / 间隙 cm（`gap`）；Pull (+) or push (−) / 吸 (+) 斥 (−) %（`force`）；Needle / 指针 °（`needle-bearing`，0 = 模型北）；Clips held / 吸住回形针（`clips-cards` / `clips-stroke` / `clips-em` 中本章 `observe` 的那个，用一行 `follow: "clips"` 的别名输出）。
- **立面**：`views.section.plane = "xz"`（俯视，台面布局最清楚）。
- **镜头预设**（≤ 6，不与组同名）：`two-magnets`（A、B 与纸，3/4 俯视）、`field-top`（正上方俯视纸面，fov 28）、`compass-view`（指南针 + 悬挂）、`tray-view`（测试盘 + 卡片）、`make-bench`（钢棒 + 电磁铁）、`uses-bay`（冰箱门 + 门扣）。`hero` 用 `views.assembled.camera`：整台 3/4 前右上，距离约 1.9 m。
- **命名剖切**（`views.cuts`）：`uses`（normal [0,0,−1]，offset 过门封中线：剖开门封露出磁条）；`compass`（过指南针中心的竖切，看针轴与玻璃罩，细看用）。
- **模式组合**：X-RAY 只透明玻璃罩和门板（shell）；CUTAWAY + FLOW：场线 `clip: false`（不被切）；EXPLODED + FLOW：照引擎禁用；sim 读数在 EXPLODED 下保留，但 B 的 `offset` 让位于拆开位移（拆开时 sim 绑定暂停，状态行写 `SIM PAUSED WHILE EXPLODED`）。

### 4.7 流与动画

| id | 类 | 内容 | 参数 |
|---|---|---|---|
| `field-lines` | 流（多路径、state-keyed，`whenRun: false`，`clip: false`） | §4.2 的 12 套场线 | 色 `token:accent-3`；speed 0.02（很慢，像"看得见的方向"）；size 0.5；每套 24 路径 × 40 粒子 |
| `em-current` | 流（`current` 组） | 电池 + → 开关 → 线圈（螺旋 3 圈示意，其余直线代替）→ 电池 −；`visible` ← `em-switch` | 色 `token:accent-4`；speed 0.05；`ends: open` |
| `stroke` | 动画 sequence（`bar-magnet-n`、`bar-magnet-s` 同键） | 1.6 s 一循环：落到钢棒左端 → 沿 +X 滑到右端 → 抬起 → 回到左端上方 | `loop: true`，`whenRun: true` |
| `ring-bob` | 动画 sequence（`ring-magnet-upper`） | 悬浮的上环上下微动 ±1 mm，2 s | `top-ring = attract` 时由 sim 绑定停用（S4 给动画加 `enabled` 绑定；退路：姿态 `rings-attract` 下动画幅度小到看不见也可接受） |
| 姿态 | `suspended`、`card-test`、`stroke-start`、`tray-picked`、`b-flipped`、`rings-attract`、`switch-on`、`fridge-open`、`cabinet-open`、`em-clips-up` | duration 0.8–1.2 s | |

---

## 5. 章节

### 5.0 总表

`layers` 不写 = 全部组。"hide uses" = 冰箱门段、门封、冰箱贴、门扣和两个 context。

| # | id | 标题 EN / ZH | view | run | cutaway | hide | sim.set | pose | labels | 镜头 |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `what-magnets-do` | What a magnet does / 磁铁能做什么 | assembled | true | none | uses | facing ns, gap 6 | — | bar-magnet-n, bar-magnet-b, horseshoe-magnet, test-tray | hero |
| 02 | `two-poles` | Two poles, pointing north / 两极，指向南北 | assembled | true | none | uses, bar-magnet-b | compass-at 1 | — | bar-magnet-n, bar-magnet-s, iron-filings, compass-needle | field-top |
| 03 | `attract-and-repel` | Like poles repel, unlike poles attract / 同极相斥，异极相吸 | assembled | true | none | uses, compass ×4 | facing ns, gap 6 | — | bar-magnet-n, bar-magnet-b, iron-filings | two-magnets |
| 04 | `magnetic-or-not` | Magnetic materials / 磁性材料 | assembled | false | none | uses | cards 0 | — | test-tray, iron-nail, aluminium-can, steel-spoon | tray-view |
| 05 | `making-magnets` | Making a magnet / 制作磁铁 | assembled | true | none | uses | strokes 0, em-switch false, em-cells 2 | stroke-start | steel-rod, em-coil, em-nail, em-switch | make-bench |
| 06 | `magnets-at-work` | Magnets at work / 生活中的磁铁 | assembled | false | none | — | — | — | fridge-door, door-gasket, cabinet-latch, compass-case | uses-bay |

### 5.1 第 01 章 `what-magnets-do`

- **summary**：A magnet can push or pull without touching, but only some things feel it. / 磁铁不用接触就能推、能拉，但只有一部分东西会被它影响。
- **正文提纲**：① 台上有什么（§1.2，规格行的设计值第一次出现）。② 推与拉：B 靠近 A 被拉过去；调头后被推开（F-1）。③ 不是什么都吸：测试盘（F-7、F-8，第 04 章细讲）。④ 磁铁的形状（条形、马蹄形、环形、薄片）和材料：铁、钢或含铁的材料（F-16；课纲"由铁或钢制成"）。
- **节拍**：

| 拍 | 模型状态（叠加在本章上） | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（hero） | This bench holds everything we will test: two bar magnets, a horseshoe magnet, ring magnets, a compass, a tray of objects and a home-made electromagnet. / 桌上摆着这一课要用的东西：两根条形磁铁、一块马蹄形磁铁、一对环形磁铁、一个指南针、一盘待测的物品，还有一个自制的电磁铁。 |
| 2 | camera two-magnets；sim gap 6 → 1.5（拍落定后再 → 贴合）；labels bar-magnet-n, bar-magnet-b | Slide the second magnet towards the first. Long before they touch, it is pulled the rest of the way. A magnet can pull. / 把第二根磁铁推向第一根。还没碰到，它就被拉了过去。磁铁能拉。 |
| 3 | sim facing nn, gap 3；力箭头朝外 | Turn the second magnet round and it is pushed away instead. A magnet can push, too. / 把第二根磁铁调个头，它反而被推开。磁铁也能推。 |
| 4 | camera tray-view；pose tray-picked；labels iron-nail, steel-paper-clips, wooden-block, plastic-button | Sweep a magnet over the tray. The nail and the paper clips jump up to it; the wooden block and the plastic button do not move. / 拿磁铁扫过测试盘，铁钉和回形针跳了上来，木块和塑料纽扣一动不动。 |
| 5 | hero 拉近；labels horseshoe-magnet, ring-magnet-upper, bar-magnet-s | Magnets come as bars, horseshoes, rings and thin sheets. They are made of iron or steel, or of materials that contain iron. / 磁铁有条形、马蹄形、环形和薄片。它们用铁或钢制成，或用含铁的材料制成。 |

- **试一试**：`vary: facing`，`keep: [gap]`，`observe: [force]`（toggle 风格的三段选择 N–S / N–N / S–S）。
- **细看**：`Push or pull`（力是推或拉，P6 力的主题再展开）；`What magnets are made of`（磁钢、铁氧体、钕铁硼，F-16）；`About this model`（模型北 = −Z、颜色只是标记、回形针只数是示意模型）。
- **本章索引**：bar-magnet-n, bar-magnet-s, bar-magnet-b, horseshoe-magnet, ring-magnet-upper, test-tray, iron-nail, wooden-block
- **名词首现**：magnet、attract、repel。

### 5.2 第 02 章 `two-poles`

- **summary**：A magnet pulls hardest at its two ends, its poles, and a freely hanging magnet turns to point north and south. / 磁铁两端吸力最强，叫磁极；自由悬挂的磁铁会转到指向南北。
- **正文提纲**：① 铁屑在两端成簇（F-6）：磁极。② 铁屑的图样：磁铁周围有一片"它的吸力能起作用的地方"（magnetic field，F-5；§0-4）。③ 指南针的针也是磁铁，靠近磁铁时跟着图样转（F-5）。④ 悬挂：静止时指南北，指北的一端叫北极（F-3）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（field-top）；场线流关；labels iron-filings | Iron filings sprinkled on paper over the magnet crowd at its two ends. The pull is strongest there; the two ends are called poles. / 在盖着磁铁的纸上撒铁屑，铁屑挤在两端。那里吸力最强，这两端叫磁极。 |
| 2 | 场线流开（layers + field）；labels iron-filings, bar-magnet-n, bar-magnet-s | The filings line up in curves that leave one pole and loop round to the other. They show the space around a magnet where its pull acts. / 铁屑排成弧线，从一极出发绕回另一极，显出磁铁周围吸力能起作用的地方。 |
| 3 | camera compass-view 近；sim compass-at 1 → 3 → 5（拍内用 `sim.set` 最后值 5）；labels compass-needle | A compass needle is a small magnet that can turn. Move the compass round the bar and the needle swings to follow the curves. / 指南针的针是一根能转动的小磁铁。把指南针绕着磁铁移动，针会转过来顺着弧线。 |
| 4 | pose suspended；hide + compass ×4；labels suspension-stand, bar-magnet-n | Hang the bar magnet from a thread so it can turn freely. It swings, slows, and comes to rest pointing north and south. / 用细线把条形磁铁挂起来，让它能自由转动。它摆几下，慢下来，最后指向南北停住。 |
| 5 | 同上近景；labels bar-magnet-n, bar-magnet-s | The end that points north is the north pole; the other end is the south pole. Every magnet has both. / 指向北方的一端叫北极，另一端叫南极。每块磁铁都有这两极。 |

- **试一试**：`vary: compass-at`（8 个位置，舞台上的位置圈也可点），`observe: [needle-bearing]`；无数据表。
- **细看**：`Earth is a giant magnet`（F-4；地理北极附近是磁南极，所以指南针的北极被它吸）；`Cut a magnet in half`（得到两根各有两极的磁铁，F-2）；`Why "field" is in brackets`（P3 不要求这个词，中学会正式学）。
- **本章索引**：bar-magnet-n, bar-magnet-s, iron-filings, compass-needle, compass-card, suspension-stand
- **名词首现**：pole、magnetic-field、compass、freely-suspended。

### 5.3 第 03 章 `attract-and-repel`

- **summary**：Unlike poles pull together, like poles push apart, and both grow stronger as the gap closes. / 异极相吸，同极相斥；间隙越小，推和拉都越强。
- **正文提纲**：① 北对南：拉（F-2），箭头与读数（SIM，F-11）。② 间隙减半，力变为几倍（F-11）。③ 北对北、南对南：推；铁屑图样中间出现空白（R4）。④ 环形磁铁悬浮。⑤ 用这个规律辨认未知磁铁的极（PSLE 常见：已知 A 的北极，看 B 的一端被吸还是被推）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（two-magnets）；sim ns, 6；箭头；labels bar-magnet-n, bar-magnet-b | North pole facing south pole, six centimetres apart. The arrows show the pull on each magnet: small at this distance. / 北极对着南极，相距六厘米。箭头表示两根磁铁受到的拉力：这么远，很小。 |
| 2 | sim gap 3 | Halve the gap to three centimetres. In this model the pull is now about three times as strong. / 把间隙缩到三厘米。在这个模型里，拉力变成原来的约三倍。 |
| 3 | sim gap 1.5；labels + iron-filings | At one and a half centimetres the filings join the two poles in a thick bridge, and the magnets snap together. / 到一厘米半，铁屑在两极之间连成一道粗桥，两根磁铁啪地吸在一起。 |
| 4 | sim nn, 3；箭头朝外 | North facing north: the magnets push apart, and the filings turn away from each other, leaving an empty patch in between. / 北极对北极：两根磁铁互相推开，铁屑在中间各自拐开，留下一块空白。 |
| 5 | camera 环形立柱；sim top-ring repel → attract；labels ring-magnet-upper, ring-magnet-lower | Ring magnets with like poles facing: the top one floats. Flip it so unlike poles face, and the two clamp together. / 同极相对的环形磁铁：上面那只悬在空中。翻过来让异极相对，两只就紧紧贴住。 |

- **试一试**：`vary: gap`，`keep: [facing]`，`observe: [force]`，`record: true`；`predict`：prompt "Turn magnet B round. What will happen?" / "把磁铁 B 调个头，会怎样？"，change `facing: nn`，options pull / push / nothing（拉 / 推 / 没反应），observe `force`。
- **细看**：`How the arrows are drawn`（长度按力的平方根压缩，读数是真实相对值；单位是相对值不是牛顿）；`Identifying an unknown pole`（只有"推"能证明同极；"拉"可能是异极，也可能是磁铁吸一块普通的铁——PSLE 常考的推理）；`Floating rings and maglev`（同极相斥托起物体，F-20 对照）。
- **本章索引**：bar-magnet-n, bar-magnet-s, bar-magnet-b, ring-magnet-upper, ring-magnet-lower, iron-filings
- **名词首现**：like-poles、unlike-poles。

### 5.4 第 04 章 `magnetic-or-not`

- **summary**：Only magnetic materials such as iron and steel are attracted, and a magnet's pull passes through materials that are not magnetic. / 只有铁、钢这类磁性材料会被吸；磁铁的吸力能穿过非磁性材料。
- **正文提纲**：① 测试盘：先猜后看（F-7、F-8）。② 不是所有金属：铝、铜（F-8）；不锈钢勺（F-9）。③ 隔着卡片也能吸，越厚越弱（F-10）：公平测试——只改卡片张数，同一根磁铁、同一种回形针、同一个高度。④ 用途：回收站分开钢罐和铝罐（F-22）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（tray-view）；labels test-tray, steel-can, aluminium-can | Eight everyday objects. Before testing, sort them in your head: which will a magnet attract? / 八件日常物品。试之前先在心里分一分：哪些会被磁铁吸住？ |
| 2 | pose tray-picked；箭头指向钢罐；labels iron-nail, steel-paper-clips, steel-can | The iron nail, the steel paper clips and the steel food can are attracted. Iron and steel are magnetic materials. / 铁钉、钢回形针和钢罐头盒被吸住了。铁和钢是磁性材料。 |
| 3 | 同上；labels aluminium-can, copper-wire, wooden-block, plastic-button | The aluminium can, the copper wire, the wooden block and the plastic button stay put. Not every metal is magnetic. / 铝罐、铜线、木块和塑料纽扣都没动。不是所有金属都是磁性材料。 |
| 4 | 近景勺；labels steel-spoon | This stainless steel spoon is hardly pulled at all. Many kitchen spoons are a kind of steel that magnets barely attract. / 这把不锈钢勺几乎吸不动。很多厨房用的勺子是一种磁铁吸不太动的钢。 |
| 5 | pose card-test；sim cards 0 → 3；labels barrier-cards, clip-chain, bar-magnet-n | Put cards between the magnet and the clips. With three cards it still holds two clips in this model: the pull passes through, but weaker. / 在磁铁和回形针之间夹卡片。在这个模型里，隔三张卡片仍吸住两只回形针：吸力穿过去了，但变弱了。 |
| 6 | 同上；sim cards 6；数据表展开 | Change only the number of cards, keep the magnet and the clips the same, and record each result. More cards, fewer clips. / 只改卡片张数，磁铁和回形针保持不变，每次记下结果。卡片越多，吸住的回形针越少。 |

- **试一试**：`vary: cards`，`keep: [magnet, clip-size]`（这两个是**只读芯片**，不对应控件：`keep` 允许写 `{ id, label, value }` 的固定说明项），`observe: [clips-cards]`，`record: true`。
- **细看**：`Nickel and cobalt`（也是磁性材料，P3 不要求，F-7）；`Stainless steel`（F-9）；`Sorting cans for recycling`（F-22）；`Singapore coins`（钢芯，F-23）；`Why "fewer clips" is a fair test`（变与不变的量，S3 第 16 页）。
- **本章索引**：test-tray, iron-nail, steel-paper-clips, steel-can, aluminium-can, copper-wire, steel-spoon, wooden-block, plastic-button, barrier-cards
- **名词首现**：magnetic-material、non-magnetic-material、fair-test。

### 5.5 第 05 章 `making-magnets`

- **summary**：Stroking a steel rod with a magnet, or passing a current through a coil around a steel nail, turns it into a magnet. / 用磁铁摩擦钢棒，或让电流流过绕在钢钉上的线圈，都能把它变成磁铁。
- **正文提纲**：① 摩擦法步骤（F-12），次数与回形针（SIM）。② 电流法：线圈、电池、开关（F-13）；绝缘导线为什么必要。③ 通电是磁铁、断电基本不是：电磁铁（F-13）；钢留磁 vs 软铁。④ 电池多一节吸得多（SIM；与 docs/23 第 04 章呼应）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（make-bench）；labels steel-rod | A plain steel rod picks up no paper clips. It is made of a magnetic material, but it is not yet a magnet. / 一根普通的钢棒吸不起回形针。它是磁性材料，但还不是磁铁。 |
| 2 | run；动画 stroke；sim strokes 0 → 20；labels steel-rod, bar-magnet-n | Stroke it with the north pole of a magnet, from one end to the other, always the same way, lifting the magnet clear each time. After twenty strokes it holds four clips in this model. / 用磁铁的北极从一端摩擦到另一端，每次方向相同，每次都把磁铁抬起来再回到起点。在这个模型里，摩擦二十次后它能吸住四只回形针。 |
| 3 | camera 电磁铁；labels em-coil, em-cells, em-switch | The electrical method: wind insulated wire round a steel nail and connect it to batteries through a switch. / 电流法：在钢钉上绕绝缘导线，经过开关接到电池上。 |
| 4 | sim em-switch true；current 流；场线 em-on-2；labels em-nail, em-paper-clips | Close the switch. Current flows round the coil, the nail becomes a magnet and lifts six clips in this model. / 合上开关。电流绕着线圈流动，钉子变成磁铁，在这个模型里吸起六只回形针。 |
| 5 | sim em-switch false | Open the switch and most clips drop. The steel nail keeps a little magnetism; an iron core would keep almost none. A magnet you can switch off is an electromagnet. / 断开开关，大部分回形针掉下。钢钉还留一点磁性；换成软铁芯几乎不留。能关掉的磁铁叫电磁铁。 |

- **试一试**：`vary: em-switch`，`keep: [em-cells]`，`observe: [clips-em]`；第二组（同一卡片里的第二个标签页，不算第二个试一试）：`vary: strokes`，`observe: [clips-stroke]`，`record: true`。若 Gavin 要严格一章一个，保留电磁铁。
- **细看**：`Why the wire is insulated`（裸线挨在一起电流走捷径，不绕圈；与 docs/23 第 03 章呼应）；`More cells, more turns`（F-14，v1 不做圈数变量）；`Destroying a magnet`（加热、摔打，F-15）；`The coil gets warm`（安全：只用干电池，不要长时间接通）。
- **本章索引**：steel-rod, em-nail, em-coil, em-cells, em-switch, em-leads, em-paper-clips, bar-magnet-n
- **名词首现**：stroke-method、electrical-method、electromagnet。

### 5.6 第 06 章 `magnets-at-work`

- **summary**：Magnets hold doors shut, find north, ring bells, lift scrap and even carry trains. / 磁铁能关紧门、找北、敲响电铃、吊起废钢，甚至托起列车。
- **正文提纲**：① 冰箱门封的磁条（F-17）、冰箱贴。② 橱柜门扣。③ 指南针与导航（F-19）。④ 电磁铁的用途：电铃（F-21，图）、废钢起重机（图）。⑤ 磁浮列车（F-20，图）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（uses-bay）；labels fridge-door, fridge-magnet | Magnets are hidden in everyday things. A fridge door stays shut without a catch, and a fridge magnet holds a note on its steel front. / 磁铁藏在很多日常用品里。冰箱门没有锁扣也能关紧，冰箱贴把便条吸在钢制的门板上。 |
| 2 | cutaway uses；labels door-gasket | Cut through the rubber seal: a flat magnetic strip runs all round the door and pulls it against the steel cabinet. / 剖开橡胶门封：一条扁平的磁条绕门一圈，把门吸在钢制的箱体上。 |
| 3 | cutaway none；pose cabinet-open → 回到关；labels cabinet-latch | A cabinet catch works the same way: a small magnet in the frame pulls a steel plate on the door. / 橱柜门扣也是同样的道理：门框里的小磁铁吸住柜门上的一块钢片。 |
| 4 | camera compass-view（指南针回到台面）；labels compass-needle, compass-card | A compass works anywhere on Earth, because the whole planet behaves like a giant magnet. / 指南针在地球上哪里都能用，因为整个地球就像一块巨大的磁铁。 |
| 5 | hero（拉远）；labels em-coil | Bigger jobs use electromagnets that can be switched on and off: electric bells, scrapyard cranes and the magnets that lift maglev trains. / 更大的活儿用能开能关的电磁铁：电铃、废钢场的起重机，以及托起磁浮列车的磁铁。 |

- **试一试**：`vary: cabinet-door`（开 / 关 toggle），`observe` 无（看门扣）；或 `predict`："Will a fridge magnet stick to an aluminium window frame?" / "冰箱贴能吸在铝窗框上吗？"→ 揭晓用测试盘的铝罐（pose）——二选一，推荐 toggle（简单）。
- **细看**：`How a fridge magnet holds on one side`（F-17）；`The first compasses`（F-19）；`Electric bell`（`<Figure src="figures/magnets-electric-bell">`）；`Maglev`（`<Figure src="figures/magnets-maglev">`，F-20：上海线的车体抱住轨道，电磁铁从下面向上吸）；`Strong magnets need care`（钕磁铁夹手、儿童误吞，P23）。
- **本章索引**：fridge-door, door-gasket, fridge-magnet, cabinet-latch, compass-needle, em-coil
- **名词首现**：（无新词，或 maglev 若保留进名词表）。

### 5.7 拍数

5 + 5 + 5 + 6 + 5 + 5 = 31 拍。

### 5.8 章节配图（`<Figure>`，§8.2）

第 02 章 `magnets-filings`、`magnets-compass`；第 04 章 `magnets-scrap-crane`；第 06 章 `magnets-fridge-seal`、`magnets-door-latch`、`magnets-electric-bell`、`magnets-maglev`。

---

## 6. 名词表 `glossary.json`（14 个候选，正文用不到的删）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| magnet | Magnet / 磁铁 | 能吸引铁、钢等磁性材料并有两极的物体 | pole, magnetic-material |
| attract | Attract / 吸引 | 拉向自己 | repel |
| repel | Repel / 排斥 | 推开 | attract |
| pole | Pole / 磁极 | 磁铁吸力最强的两端：北极、南极 | magnet |
| like-poles | Like poles / 同极 | 两个北极或两个南极；相斥 | unlike-poles |
| unlike-poles | Unlike poles / 异极 | 一北一南；相吸 | like-poles |
| magnetic-field | Magnetic field / 磁场 | 磁铁周围、它的吸力能起作用的地方；铁屑和指南针能把它显出来（中学正式学） | pole, compass |
| compass | Compass / 指南针 | 一根能自由转动的小磁针，静止时指向南北 | freely-suspended |
| freely-suspended | Freely suspended / 自由悬挂 | 挂起来能自由转动，不被别的东西挡住 | compass |
| magnetic-material | Magnetic material / 磁性材料 | 会被磁铁吸引的材料：铁、钢（还有镍、钴） | non-magnetic-material |
| non-magnetic-material | Non-magnetic material / 非磁性材料 | 不被磁铁吸引：铝、铜、木、塑料、玻璃、橡胶 | magnetic-material |
| stroke-method | Stroke method / 摩擦法 | 用磁铁的一极沿同一方向反复摩擦钢棒，使它成为磁铁 | electrical-method |
| electrical-method | Electrical method / 电流法 | 钢棒外绕绝缘导线并通电，使它成为磁铁 | electromagnet |
| electromagnet | Electromagnet / 电磁铁 | 通电时有磁性、断电时（几乎）没有的磁铁 | electrical-method |
| fair-test | Fair test / 公平测试 | 一次只改一个量、其余保持不变的实验 | — |

---

## 7. 来源计划（24 条；P# → 施工时的 S#）

| P# | 来源（候选） | 用于 |
|---|---|---|
| P1 | 本设计研究（设计值、§4.2 四个模型的算式与结果；本 spec §1.3、§4.2） | 规格行、PLATE 读数、细看 |
| P2 | MOE CPDD，*Science Teaching & Learning Syllabus Primary Three to Six*（2023 P3 起实施），第 16 页（表 1：P4 末认出公平测试、P6 末设计公平测试）、第 18 页（用模型与多种表示解释与预测）、第 20 页（课题总表）、**第 62 页**（Interaction of Forces (Magnets) P3 学习结果与 Note）。https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf（页码按 2022-10 版文本核对，May24 / Jan 2026 版待比对，docs/17 §8.1） | 课纲边界、用词、公平测试 |
| P3 | SEAB，*PSLE Science (Syllabus 0009), 2026*（评估目标 II：预测、解读表格与图、评价方法；docs/17 S6） | §0-7 公平测试 |
| P4 | OpenStax，*College Physics 2e*，22.1 Magnets https://openstax.org/books/college-physics-2e/pages/22-1-magnets | 两极成对、同斥异吸、磁性材料 |
| P5 | OpenStax，*College Physics 2e*，22.2 Ferromagnets and Electromagnets | 磁化、电磁铁、软铁 vs 钢 |
| P6 | OpenStax，*College Physics 2e*，22.3 Magnetic Fields and Magnetic Field Lines | 场线方向、疏密、不相交、指南针作探针 |
| P7 | HyperPhysics（Georgia State）"Magnetic dipole" / OpenStax *University Physics Vol. 2* ch.12 | 偶极场随距离、Gilbert 模型、磁长 ≈ 0.85 L（待核） |
| P8 | Commons `File:Magnet0873.png`（N. H. Black & H. N. Davis, *Practical Physics*, 1913, fig. 200） | 公有领域；铁屑图样 R1 |
| P9 | Commons Geek3 VectorFieldPlot 系列（`VFPt magnet B currents.svg` 等） | CC BY-SA；场线 R2、R3 |
| P10 | NOAA NCEI，World Magnetic Model 与 Magnetic Field Calculators https://www.ncei.noaa.gov/products/world-magnetic-model | 地磁 25–65 µT、新加坡值（待核） |
| P11 | Britannica，"Shen Kuo" https://www.britannica.com/biography/Shen-Kuo | 1088《梦溪笔谈》最早记载磁针 |
| P12 | IOP Spark（Institute of Physics 教师资源）磁学的学生想法条目 https://spark.iop.org | "所有金属都被吸"等误解（待核具体页） |
| P13 | British Stainless Steel Association，"Magnetic properties of stainless steels"（bssa.org.uk） | 奥氏体 vs 铁素体（待核） |
| P14 | 新加坡 P3 科学教材或 MOE / Science Centre Singapore 的摩擦法步骤说明 | 摩擦法步骤与次数（待核；若只有出版社教材，写"教材常见做法"） |
| P15 | 上海磁浮：Guinness World Records "Fastest maglev train in regular public service"；运营方上海磁浮交通发展有限公司页面（待核） | F-20 |
| P16 | J. C. Mallinson, "One-sided fluxes — a magnetic curiosity?", *IEEE Trans. Magnetics* 9(4), 1973, 678–682 | 冰箱贴单面磁通（摘要） |
| P17 | 磁性材料典型值：Magnetic Materials Producers Association *MMPA 0100-00* 或大学讲义（铁氧体 Br ≈ 0.2–0.4 T，钕铁硼 ≈ 1.0–1.4 T） | F-16（待核） |
| P18 | Britannica，"Curie point"（铁 770 °C） | F-15（待核） |
| P19 | 学校教具目录（条形磁铁、马蹄形磁铁、指南针、回形针的尺寸；只当"典型"引，不点名） | F-18、§2.2（待核） |
| P20 | 电铃原理：OpenStax 或 Britannica "electric bell"；1900 年前后教科书电铃图（公有领域） | F-21、图 |
| P21 | 回收站磁选：NEA（新加坡国家环境局）回收资料或回收厂说明 | F-22（待核） |
| P22 | MAS，"Singapore Coins: Security Features" https://www.mas.gov.sg/currency/circulation-currency/identifying-genuine-currency/singapore-coins-security-features | 第三系列硬币钢芯多层镀层 |
| P23 | 磁铁误吞风险：新加坡 CPSO 或 KK 妇幼医院 / 美国 CPSC 关于小强磁铁的安全提示 | 安全细看（待核） |
| P24 | 冰箱门封专利（Google Patents，截面图） | §2.3 R8、F-17（待核选定专利号） |
| P25 | 儿童磁学误解研究：R. Hickey & R. A. Schibeci, "The attraction of magnetism", *Physics Education* 34(6), 1999, 383–388；R. Driver et al., *Making Sense of Secondary Science* (Routledge, 1994) 磁学一节 | 误解清单（摘要读；Driver 待核） |

---

## 8. 图像清单（给 Codex，石墨图版风格）

风格固定用 `scripts/illustrate.ts` 的 `STYLE_BRIEF`（19 世纪科学图版的石墨铅笔画、无色、无文字、透明底）；首页图版 1:1，章节图 4:3（`figure` 形状）。下面只写 SUBJECT（原样英文）。**图只当插画，不当事实依据**；画出来逐张对照 §1.3 与参考图，错的重画。

### 8.1 首页图版 `genimg/roadmap/magnets.png`：**替换**

已看过：马蹄形磁铁和条形磁铁并放在一只浅盘里，铁屑画成**两磁铁之间的漩涡**（同心弧围绕一个中心），这不是任何磁铁组合的真实图样，正好教出"场线绕圈"的误解；brief 要的指南针没画；条形磁铁两端的明暗区分尚可。重画 SUBJECT：

> a bar magnet lying flat with a sheet of paper laid over it, iron filings sprinkled on the paper tracing the classic pattern of a bar magnet: dense tufts bristling at both ends, smooth curved lines leaving one end and looping round to the other end on both sides, sparse filings near the middle, no spirals and no crossing lines; one half of the bar shaded darker than the other half; beside the paper a horseshoe magnet with three paper clips hanging in a short chain from one of its pole tips; a small round pocket compass on the paper near one end of the bar, its diamond needle lying along the curved filing lines

### 8.2 章节配图（7 张，4:3）

| 文件（`public/illustrations/figures/`） | 章 | 用途 | SUBJECT |
|---|---|---|---|
| `magnets-filings` | 02 | 两张对照：异极相对与同极相对的铁屑 | two pairs of bar magnets seen from above on sheets of paper sprinkled with iron filings, side by side: on the left the magnets face each other end to end with a short gap and the filings form a dense bridge of straight-ish lines joining the facing ends; on the right two identical magnets face each other end to end and the filings bend sharply away from the gap, leaving an empty patch between the facing ends; both pairs drawn at the same scale, plain shading only, no letters |
| `magnets-compass` | 02 | 悬挂磁铁与指南针 | a bar magnet hanging horizontally from a thin thread tied to a small paper stirrup under the arm of a laboratory retort stand, at rest; beside it on the bench a round student compass with a brass case, a dial with thirty-two tick marks and four longer ticks, and a diamond shaped needle with one half shaded darker, the needle parallel to the hanging magnet |
| `magnets-scrap-crane` | 04 | 电磁铁的用途、磁选 | a large round lifting electromagnet hanging from the cable of a crane over a heap of scrap steel, holding a tangled mass of steel pieces, crushed steel cans and old bicycle frames stuck to its flat underside, a few aluminium cans lying untouched in the heap below; industrial yard, no people, no text |
| `magnets-fridge-seal` | 06 | 门封截面 | a cutaway corner of a refrigerator door closed against the cabinet, the soft rubber door seal cut open to show its hollow folded profile and a flat flexible magnetic strip lying inside the seal pressed against the steel front edge of the cabinet; a flat flexible fridge magnet on the door front; clean technical cutaway style |
| `magnets-door-latch` | 06 | 橱柜门扣 | a magnetic cabinet catch mounted under a shelf inside a cupboard frame, drawn partly cut away to show a small block magnet held between two steel plates in a plastic housing, and a small steel plate screwed to the inside of the cupboard door that is about to close against it |
| `magnets-electric-bell` | 06 | 电铃 | an old-fashioned electric bell on a wooden base board: a pair of upright electromagnet coils wound on iron cores, a springy iron armature in front of them carrying a small hammer, a round metal gong beside the hammer, and a contact screw touching a spring on the armature; insulated wires leading to two terminals; drawn as a clear technical plate |
| `magnets-maglev` | 06 | 磁浮列车截面 | a high-speed maglev train on an elevated concrete guideway seen three-quarters from the front, and next to it an enlarged cross-section of the guideway beam showing the underside of the train body wrapping around the edges of the beam, with electromagnets on the train's arms beneath the beam pulling upward towards the steel rails on the underside of the beam; streamlined nose, no logos, no text |

---

## 9. 施工顺序、分工与工作量

| 步 | 内容 | 谁 | 文件 | 完成标准 | 估计 |
|---|---|---|---|---|---|
| 0 | 本 spec 定稿（§0.1 逐条）；docs/03 §C、docs/04 改写（引擎路线） | 主会话 + Gavin | docs/22、03、04 | Gavin 答复 | — |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts magnets --engine space-scene --subject science --title-en "How Magnets Work" --title-zh "磁铁是怎么起作用的"`；参考图 R1–R12 下到 `scripts/geo/magnets/refs/` | 主会话 | 主题目录、refs | `pnpm validate` 绿；参考图看过 | 0.5 天 |
| E1 | E-SIM 核心 S1–S8（与 docs/23 共享；若电路先做，这里只验收） | Opus 引擎 | `src/engines/space-scene/**`（新 `lib/sim/`、`explorer/TryIt.tsx`）、`schema.ts`、`scripts/validate-content.ts`、`scripts/shoot.ts`、docs/06、docs/08 §2 | 单测；aircon、grasshopper、b200-server、sample-space `--beats` 不回归 | 4–5 天 |
| E2 | E-MAG M1–M9（M1 构建期脚本、M2 多路径流、M3 filings、M6 coil、M7 token、M8 wood） | Opus 引擎（与 E1 分目录可并行：E2 拥有 `scripts/sim/`、`stages/model3d/` 的新原语、`tokens.css`） | 同上（不同文件） | 场线单测（从北到南、不交叉、对称）；铁屑截图对照 R1 | 3–4 天 |
| D1 | 数据骨架：35 零件、组、流、姿态、`sim` 段、views、presets、spec、telemetry；章节 state + 拍的 `sim.set` | Opus 几何 | `data/parts.json` 几何与 sim 字段、`chapters/*.mdx` frontmatter | `pnpm validate` 0 error | 1 天 |
| D2 | R2 几何并排两轮 → R3 材质 → R4 流、动画、sim 绑定 | Opus 视觉 | 同上 + `docs/screenshots/magnets/` | 每轮 `pnpm shoot magnets` 截图自证 | 2 天 |
| T | 来源逐条读、待核落定；S1 设计研究来源；名词表；零件文字；正文 + 细看（先样章：第 03 章） | Opus 事实与文字 | `sources.json`、`glossary.json`、parts.json 文本字段、`chapters/*.mdx` 正文 | `sources-md.ts`；事实表一一对应 | 2 天 |
| B | 31 拍字幕定稿、拍的镜头 / 标注 / sim | Sonnet | `state.beats` | `--beats` 0 失败、无漏标、四种组合 | 1 天 |
| P | HUD 排版、模式组合、手机、事实与代码审计；图像（Codex 重画首页图 + 7 张章节图，主会话过 `illustrate.ts`） | Sonnet QA；Codex | — | §10 全勾 | 1 天 |

合计：引擎 7–9 天（其中 E-SIM 与 M2、M6、M8 是两个主题共用的约 5–6 天），内容 6–7 天。子代理不提交、不改 package.json；同一时间只有一个代理写 `parts.json`。

---

## 10. 验收（`acceptance.md` 全部 + 本主题另加）

- [ ] 课纲对齐：第 62 页每条学习结果在某一章的正文或拍里出现；Note 里"不要求"的三项（镍钴记忆、磁屏蔽、磁感应）不在主线与字幕里。
- [ ] 必须讲对的五处（§0-5）各有一拍或一段正文；字幕无"磁铁吸所有金属"类说法。
- [ ] 场线 / 铁屑：单磁铁、异极、同极三种图样与 R1、R4 并排对照，形状对（两端成簇、弧线回绕、同极间空白），**无漩涡、无交叉**；单测验证每根场线起于北极、止于南极。
- [ ] 指南针：8 个位置上的终值方位与脚本计算一致（单测），阻尼摆动 ≤ 4 s 停稳；深链接直接终值。
- [ ] sim：每章试一试可用（鼠标、触屏、键盘 `[` `]` `T` 三种方式都能操作同一个量）；URL `sim=` 往返；换章重置；数据表"记一行"、覆盖、≤ 12 行；先猜后看不判对错、文案中英都对。
- [ ] 读数一致：PLATE 读数、字幕、细看、S1 里的回形针只数（10/5/3/2/1/1/0、0/2/4/6、3/6/1）与相对力（≈ 12/41/100 %，以脚本回填值为准）同值，且都写明"在这个模型里 / SIM"。
- [ ] 性能：静止 < 50 calls、运转 < 60；场线与铁屑各 1 次绘制；三角形 < 0.3 M；控件切换时不掉帧（模型计算 < 1 ms）。
- [ ] 手机 390 × 844：试一试卡片在抽屉里可用，按钮 ≥ 44 px。
- [ ] 无文字贴图：模型上无 N / S 字母（极名在引线里）；无品牌。
- [ ] 7 张章节图 + 首页图逐张核对 §1.3（铁屑无漩涡、电磁铁是绝缘导线、磁浮是车体抱轨向上吸）。
