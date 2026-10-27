# 热 · 内容施工 spec（heat，SpaceScene + 实验台 + 试一试曲线）

2026-10-27 · **施工定稿；状态 published；e2e 端口 5443**。沿用 docs/40–41 的课纲→事实→对象→引擎→章节→名词/来源→图像→验收结构。paper 默认、cinema 可切；静态离线；EN 默认、简体中文独立成文。母 dossier 为 `/Users/gavin/work/atlas/art/research/heat/` 中 heat-research.md、facts.json、datasets.json；无 sibling，因此省略拆分说明。用户已授权本轮定稿、引擎与内容施工；§0 均采用默认值，留 Gavin 后审。

## 0. 决定与默认值

| ID | 默认决定 | 理由 / 开放项 |
|---|---|---|
| D0-1 | P4 Heat为主线；背景章加七章，共37拍 | 印刷页76–77；公式留后台。[H01,H18,H19] |
| D0-2 | 开放式lab bench原型 | 选择/聚焦/对照优于机器外壳拆解；通用原创器材。[D01–D04] |
| D0-3 | 温度、导热/隔热、曲线、通常的热胀冷缩 | 四个已发布邻课跨链，不重复能量链、空调和材料总表 |
| D0-4 | °C温度、s时间、g水量、J能量、W功率、mm伸长 | 不要求P4代入比热或微分式。[H02,H18,D01] |
| D0-5 | 显式时间步进；进入默认0s，无自动实验播放 | 阅读、舞台、曲线用同一时间真值；等待不改变结果 |
| D0-6 | 程序化器材、无下载网格和照片纹理 | 既有primitive、offset、pose、flow intensity足够 |
| D0-7 | DESIGN参数、SIM读数与曲线标识 | 不冒充实测勺子或杯子。[D01–D07] |
| D0-8 | T1同温、T2勺柄、T3隔热、T4加热、T5冷却；T6杆端短控制 | 先猜后看不评分；主动记一行 |
| D0-9 | NC-SA派生家族；无CC BY-SA输入 | 采用BRIEF2许可；当前OpenStax网页许可S18 |
| D0-10 | 三张新图，未发现真正适配的邻课图 | 复用审查记录，不把防水当隔热 |
| D0-11 | 屏幕实验；不指导手摸热金属或加热密封器皿 | 无未经核实的家庭操作或安全温度阈值。[D08] |

### 0.1 开放问题（均给默认，不阻塞准备交付）

1. 焦耳是否进主线？默认01短对照及PLATE可收起读数出现，公式不要求。[H02,D05]
2. 液体和气体是否各保留一拍？默认保留定性姿态，不新增体积求解器，满足三态膨胀的观察范围。[H12,H22,H27]
3. 章末是否出考试题？默认非评分预测与证据句架，不宣称高频题或SEAB评分标准。[D08]
4. 八个完整中文译法仍未核得词形：默认采用清楚的编辑译法，发布前复核；不号称MOE华文标准。详见terms与§6。

## 1. 课纲对照与范围

### 1.1 课纲对齐

MOE 2023 Primary Science，P4 Heat，印刷pp.76–77；短引、页码与逐字验证保留于母 dossier §a和syllabus-verification.json，不在本spec重复引文。页76对应热源、温度测量、热与温度的区别、热至冷直到等温、得热失热与温度；页77对应三态膨胀/收缩、物态变化、良/不良导体，不要求背特定材料传热速率。[H01–H07,H12]

### 1.2 主线 / 细看 / 跨链

| 内容 | 本课深度 | 事实 / 本地路由 |
|---|---|---|
| 热与温度、读数与方向 | 01/02主线 | H02–H05；measuring补刻度 |
| 导热、隔热、手感 | 02/03主线 | H06–H11；materials补其他性质 |
| 加热/冷却曲线、控制变量 | 04/05/07主线 | H18,H19,H28,D01–D08 |
| 三态通常膨胀/收缩 | 06定性；杆给SIM | H12,H22,H27 |
| 内能、粒子间距、水例外 | 教师细看 | H14–H16,H20；states-of-matter |
| 完整熔化/凝结/沸腾过程 | 一句边界后跨链 | H17；states-of-matter、water |
| 太阳/电能/热能完整能量链 | 热源一句+跨链 | H21,H24；energy-conversion |
| 空调做功搬运热 | 自发传热适用条件+跨链 | H03；aircon |
| 微分方程、热容、导热率、气体方程 | 引擎/细看，不背术语 | H18,H19,H26,H27 |

### 1.3 读者学到什么

温度计测温度；有温差才有自发净传热；良导体较易传热，不良导体仍传热；比较保持条件相同；冷却终点与环境相关；通常受热变大、冷却变小，但不是所有物质在任何条件都一样。[H02–H19,H27,H28]

### 1.4 误解目录与证据层级

| 提示 | 哪里可见地纠正 | 证据 |
|---|---|---|
| 手感冷等于温度更低 | 01预测与同读数 | H09；M04为综述转引 |
| 金属吸引/制造热，只会升温 | 02热浴与冷浴反向 | H03,H06,H11；M03为NZ试测 |
| 热与温度同一个量 | 01单位，04水量 | H02,H18,H20；M02文献综述 |
| 不良导体完全不传、包覆主动供能 | 03仍冷却与保冷 | H07,H08,D02；D08教学假设 |
| 冷却一直降到0、总是直线 | 05早晚等间隔比较 | H19,H28；D08教学假设 |
| 环孔缩小、粒子变大、质量添加 | 06图示/细看 | H13–H15；D08教学假设 |
| 得热永远升温 | 05相变边界 | H17 |

M01–M05的人口与阅读限制继承母 dossier；禁止写成新加坡P4误解的比例统计。日常语言研究不证明家长导致误解；也不把所有推理说成孩子固定不变的观念。[M01,M02,M04]

### 1.5 证据表达与语气

支持改变/保持/观察、同刻温度、相同时间间隔变化、解释用途、识别多变量的弱比较。句架：EN “With … held the same, … changed more slowly. This supports … under these conditions.” / ZH “保持……相同时，……变化较慢。这支持在这些条件下……。”为教学设计，不冒充已核真题或评分规则。[D08]

不拟人，不喊小朋友，不以问句作章标题。先讲可见现象再解释，首次术语当场释义。S编号给来源；H/M给事实；D给设计/模拟。正文施工时数字用Num来源，字幕纯文本也写明模拟。[H02,D01–D08]

## 2. 事实表（沿用母 dossier编号）

| 类别 | 编号 | 要点 |
|---|---|---|
| P4核心 | H01–H11 | 热/温度、方向、探头、导热/隔热、手感 |
| 膨胀 | H12–H16,H22,H26,H27 | 一般性、自由边界、孔、质量、水例外 |
| 曲线与物理量 | H17–H20,H25,H28 | 相变边界、Q=mcΔT、指数近似、质量、环境 |
| 热源/本地 | H21,H23,H24,H29–H31 | 太阳非接触；气象和温泉值的地点/时段 |
| 文献 | M01–M05 | 直接研究/综述/诊断/未读原文分层 |
| DESIGN | D01–D04,D08 | 参数、忽略项、放大、教学假设 |
| SIM | D05–D07 | 精确数值与统一计算口径 |

所有fact的逐项claim/source/locator/confidence在facts.json；本稿不建平行新事实号。

### 2.1 模拟运行点

- 水200g，比热4.2J/(g·K)，100W，从25°C加热120s：Q=12000J，ΔT=14.285714286K，T≈39.3°C。忽略容器与散热。[H18,H25,D01,D05]
- 冷却C=840J/K，环境25°C，初温85°C，U=2或0.5W/K，300s分别≈54.4与75.2°C。U不是空气/塑料导热率。[H19,D02,D06]
- 勺远端有效热容各20J/K、导热通路1/3或1/30W/K；85°C浴中60s远端≈62.9与30.7°C。非真实两勺实验。[D03,D07]
- 杆100mm，参考25°C，α=12×10⁻⁶K⁻¹；85°C时伸长0.072mm。PLATE真数值，独立标记放大500倍，不把钢杆本身假缩放。[H26,D04]

## 3. 对象、零件、数据与图版

### 3.1 分区与坐标

世界单位m，Y向上，+Z朝观者，+X向右。DESIGN工作台1.8×0.7m、台面y=0.75，并非学校标准。01 transfer左侧x≈−0.55；02 curves在中右x≈0.15/0.55；03 expansion后方z≈−0.2；04 heat-paths只有能量示意流。台面context不入零件组。并排器材不是热接触，这不是地图。[D01–D04]

### 3.2 零件计划（34个id + bench context）

primitive用已有lathe、tube、sphere、box、extrude及extra。勺碗与手柄同一part，但必须有浅凹碗与连续柄。下面尺寸为原创建模设计起点，不是外部典型参数。

| 件数 | id | 分区 | 几何/用途与关系 |
|---|---|---|---|
| 1 | bath-beaker | transfer | 玻璃lathe，R0.045/H0.12，开口、薄壁、杯嘴；shell |
| 1 | bath-water | transfer | R0.041/H0.065内腔，水平水面，外部维持浴温。[D03] |
| 2 | metal-spoon, plastic-spoon | transfer | 长0.16；extrude/lathe组合；凹碗、可比形状、浸入深度 |
| 2 | metal-tip-marker, plastic-tip-marker | transfer | distal-tip指示/标注锚，文字显示温度；不自发光 |
| 2 | probe, probe-marker | transfer | tube+球泡/独立标定指示，浸水不触壁底。[H05,H22] |
| 2 | retort-stand, probe-clamp | transfer | 杆+底座/夹具，确实支承探头 |
| 1 | heater | curves | box0.14×0.035×0.14，通用电热台 |
| 1 | heater-beaker | curves | 玻璃敞口薄壁杯，放在加热器上 |
| 1 | heater-water | curves | 独立水体；质量可变，需依§3.5处理水位 |
| 2 | heater-probe, heater-probe-marker | curves | 浸水管/读数指示，与加热曲线同值 |
| 1 | cooling-beaker | curves | 同形独立冷却杯，不和heater共享能量 |
| 1 | cooling-water | curves | 对应cooler的物体 |
| 2 | cool-probe, cool-probe-marker | curves | 独立测温管/指示，lag0 |
| 1 | wrap | curves | annular lathe包在杯外，bare隐藏；厚度示意 |
| 1 | air-gap | curves | 包覆剖面空隙指示，不是流体管线 |
| 1 | rod | expansion | 钢cylinder长0.1，左端参考，自由伸缩。[D04] |
| 1 | rod-end-marker | expansion | 独立薄片，端点位移×500，不能误作实际端头 |
| 2 | rod-support-left, rod-support-right | expansion | 支持且留轴向自由，不把两端锁死。[H12] |
| 1 | expansion-ball | expansion | sphere+stem/handle；定性放大图示 |
| 1 | expansion-ring | expansion | 有真实孔的annular lathe+shank；保持原温。[H13] |
| 1 | expansion-thermometer | expansion | tube+bulb+capillary extra；两种定性液柱姿态。[H22] |
| 2 | gas-cylinder, gas-piston | expansion | clear cylinder/独立活塞；定性可动边界。[H27] |
| 1 | bath-holder | transfer | 勺架，固定浸入深度 |
| 1 | heater-probe-support | curves | 探头支承，不能悬空 |
| 1 | cooler-probe-support | curves | 独立探头支承 |
| 1 | room-reference | curves | 环境25°C设计参考，不读真实天气。[D02] |
| context1 | bench | context | 台面，不入索引 |

connects表达浴水→勺→远端、heater→heater-beaker→heater-water→probe、cooling-water→cup/wrap→room-reference；不画成密封流体管路。每part首句summary说明功能，detail明确模型简化和来源。exploded方向均为小幅+Y，分组剖视优先，避免误示实际装配。[H23,D03]

### 3.3 Tier-1与视图

一眼认出敞口杯、水平水面、凹碗勺、支承温度计、包覆层、有自由端直杆、有真孔的环、气缸/活塞。材料靠材质族和文字双重识别，颜色只用token；常温热物不发红光。水的颜色编码若用，必须说是温度编码而非污染。[H05,H06,H09,D03,D04]

主视assembled；X-RAY只淡shell，水与marker仍可读；CUTAWAY仅包覆/气缸近景，默认关闭；EXPLODED与流按现有规则互斥。视图不改elapsed。隐藏件不进labels；每拍labels≤6。目标静止≤70draw calls、带流≤90、三角形≤0.3M，都是施工预算，非已测性能。

### 3.4 流、姿态与动画

两条heat-to-metal/heat-to-plastic，从浴到远端，signed rate控制方向，最多各48点。粒子是能量示意，不是物质从热端流向冷端。[H23,D03] 冷却用读数和文字方向，不装作CFD。RUN只开装饰流，不是实验时间开关。

液柱与活塞姿态liquid-column-start/warm、gas-start/warm由第06章指定，无体积/压力数字；ball-ring-start/warm为独立放大情景，不引用杆的尺寸。材质无品牌/铭牌/照片纹理。没有新primitive或任意机械转速。

### 3.5 HUD、数据与镜头

note EN “Generic heat bench · model results, not measurements · effective spoon-tip paths · endpoint indicator enlarged” / ZH “通用热实验台 · 数值为模型非实测 · 勺远端为有效导热通路 · 端点指示已放大”。规格行≤4：DESIGN time0–300s、water200g默认、ambient25°C、rod100mm。[D01–D04]

PLATE≤6行，跟随本章所见实验：温度、时间、能量、环境或杆ΔL；follow取同一sim/control，lag0。曲线放阅读try-it区，底部只有章节轴；阅读顺序章头→拍→试一试→选中详情→正文→索引。

改变水量时不把摄氏度当fill体积；准备默认只给质量文字与有界定性液位姿态，明确“液位示意”。若施工要求精确水位，另需有来源密度和容器容积模型复核，不在当前spec声称已支持。[H18,D01] 主线公平对照只比较算法输入质量，不能靠图上高度估质量。

未来生产文件：topic.yaml、8章MDX、parts.json（34件+context、presets/poses/sim）、glossary.json、sources.json、SOURCES.md。参数可编译合入parts，不把独立heat-parameters.json当已有自动加载入口。后续LICENSE-CONTENT标NC-SA衍生家族；准备阶段不编辑它。

六个preset设计起点，单位m、fov30：view-hero pos[2.4,2.1,3.0] target[0,0.83,0]；view-probe[-0.15,1.15,0.65] target[-0.55,0.86,0]；view-spoons[-0.2,1.25,0.8] target[-0.55,0.85,0]；view-heater[0.65,1.25,0.75] target[0.15,0.84,0]；view-cooler[1.05,1.2,0.75] target[0.55,0.85,0]；view-expansion[0.55,1.2,0.55] target[0.15,0.85,-0.2]。不是已验收构图，施工须框住器材与标注锚。

## 4. 引擎与模拟契约

以下为本轮实现契约。已有能力复用，不依赖未合并分支。


### 4.0 实查与删减（2026-10-27）

已读 main 当前工作树 docs/06、sim-schema、materials / matter / energy / light / table 以及 chart/trial/TryChart。materials 为性质测试，matter 为状态与质量体积，energy 为能量分配，light 为光线，不包含热瞬态。table 可列离散来源行，record.chart 只画已记的行，均不能替代解析曲线和显式时间游标。既有 offset、pose、signed flow、控件/URL/telemetry、非评分预测与手工记录复用；不新增通用尺寸缩放、热场、时钟或地图能力。

按只读 git log main..codex/<branch> 与 git show 核对：monsoon-engine 的 monthly climatology（e1eb305/b8b2725）、sem-engine 的 orbit-rotation（5a0400d）、airfoil-content 的 airfoil（b1f97b5）、dinosaur 的 docs/47（该分支相对 main 无新增提交；深时 Ma/古地貌）、plates 的 reference/catalogue/impact（a0a2c0e）均不提供 heat/连续温度图/记录条件隔离。steam mechanism、table/pose、sort 等已在 main，不重复。保留 E-H1 热解析模型、E-H2 模型曲线、E-H3 条件隔离与预测失效；移除的仅是可复用基础设施，不依赖任何未合并代码。

最终澄清：同温预测沿用已有 before/after 非评分机制，讲解拍可直接显示读数；预测遮蔽仅作用带 predict 的当前 try 卡及其数值 HUD，已写入讲解字幕的知识不作为隐藏测验答案。端点温度范围和单位由 schema 强校验；重用源数据事实和独立物理公式，原创参数文件不从教材图表复制派生内容。

### 4.1 已有能力与真正缺口

核对入口：`docs/06-dev-guide.md`「SpaceScene · 试一试」、`docs/08-technical-plate.md` §2、`docs/13-space-topic-template.md`；实际实现以 `src/engines/space-scene/` 下的 `sim-schema.ts`、`lib/sim/{index,controls,bind,timeline,trial,chart}.ts`、`explorer/{TryIt,TryChart}.tsx` 为准。

现有 `SIM_KINDS` 是 circuit、magnet、force、energy、life-cycle、matter、light、sort、materials、table、seeds，**没有 heat**。materials 的分类/材料性能实验、matter 的质量/体积实验和 energy 的能量分配不能冒充温度随时间求解器。复用它们的已讲内容，链接已有主题，不重复新增其模型。

已经可用：最多 16 个双语控件；toggle、最多 24 值的 step、choice；最多 32 个 number/state/vector/timeline 输出；`state.sim.set`、拍 `sim.set`、`try.vary/also/keep/observe`、先猜后看、记一行、URL `sim`。现有 part 绑定包括 visible、offset、rotate、tint、fill；既有 flow intensity 可表示传热方向和相对速率。`stretch` 专用于 coil，不能宣称它可缩放任意金属杆；`fill` 表示体积，不能把摄氏度直接当体积输入。

现有 `record.chart` 是**记录表图**：至少两行才出现，横轴是 vary 控件的离散值，step 画连接线、choice 画柱。它不会生成连续实验曲线。现有 Timeline 用常加速度片段或最多 256 个线性插值采样点；首次进入、深链接、REFERENCE、EXPLODED、reduced motion 默认显示终态，并由逐帧时钟回放。热实验采用下文显式时间控制，不接入该时钟，避免 PLATE 已读终点而模型/图标仍在中途的双重状态。

### 4.2 新增能力 E-H1：解析式热模型

增加可复用 `sim.kind: "heat"`、`heatSchema`、`lib/sim/heat.ts`。模型为有限个互不耦合的 lump（均匀温度物体），共同读取一个经过验证的 elapsed-time step 控件。每个 lump 面向一个固定温度热库，或接收固定功率；没有空间温度网格、迭代积分、墙钟、随机数和网络请求。

建议数据形状如下，全部为**新增契约**。`NumericSource` 为有限数，或 `{control: id}`（step），或 `{control: id, values: {optionId: number}}`（choice 到数值的全映射）。`capacity` 为正数 J/K，或 `{mass: NumericSource, specific: 正数}`，后者单位明确为 g × J/(g·K)。模型内部温差 K 与摄氏度温差数值相同；读数只显示 °C。[H02, H18]

```jsonc
"heat": {
  "time": "elapsed-s",
  "lumps": {
    "heater": {
      "initial": 25,
      "capacity": { "mass": { "control": "water-g" }, "specific": 4.2 },
      "power": { "control": "heater-w" }
    },
    "cooler": {
      "initial": { "control": "cool-start-c" },
      "capacity": { "mass": { "control": "water-g" }, "specific": 4.2 },
      "reservoir": { "temperature": 25,
        "conductance": { "control": "cover", "values": { "bare": 2, "wrapped": 0.5 } } }
    },
    "metal-tip": {
      "initial": 25, "capacity": 20,
      "reservoir": { "temperature": { "control": "bath-c" }, "conductance": 0.3333333333333333 }
    },
    "plastic-tip": {
      "initial": 25, "capacity": 20,
      "reservoir": { "temperature": { "control": "bath-c" }, "conductance": 0.03333333333333333 }
    }
  },
  "expansions": {
    "rod": { "temperature": { "control": "rod-c" }, "reference": 25,
      "length": 0.1, "alpha": 0.000012 }
  },
  "compare": { "tips": { "first": "metal-tip", "second": "plastic-tip", "epsilon": 0.01 } }
}
```

上限：lumps 1–6，expansions 0–4，compare 0–4，禁止全主题 id 冲突。`power` 默认 0 W，正值表示向物体供能；无 reservoir 等价 U=0；有 reservoir 时 conductance U 必须正，单位 W/K。第一版不开放负功率。不是所有实验同时讲：chapter hide、layers、index 和 observe 决定该章所见器材与读数；`SEPARATE_EXPERIMENTS.heat = true`，避免 PLATE 引用无关实验的状态。

控件建议：`elapsed-s` = 0,30,…,300 s；`water-g` = 200/300/400 g；`heater-w` = 0/50/100 W；`cool-start-c` = 5/45/65/85 °C；`cover` = bare/wrapped；`bath-c` = 5/25/45/65/85 °C；`rod-c` 同 bath。共 7 个控件。默认分别 0、200、100、85、bare、85、25。时间显示 `unit:"s"`，**不写 `format:"time"`**：现有 time 格式是当地时刻小时，不是实验经过秒数。

解析解：设热容量 C、初温 T₀、库温 Tₐ、功率 P、传热系数 U，t 为经过秒数。

- U=0：`T(t)=T₀+Pt/C`；`q(t)=P`。
- U>0：`T∞=Tₐ+P/U`，`T(t)=T∞+(T₀−T∞)exp(−Ut/C)`；`q(t)=P−U(T−Tₐ)`。
- 累积净传入能量：`E(t)=C(T−T₀)`；外部供能 `Ein=Pt`；传至热库的净能量 `Eout=Ein−E`。符号允许反向，不能把负值裁零。[H03, H18, H19]
- 杆：`ΔL=L₀α(T−Tref)`，`L=L₀+ΔL`。这是温度直接控制的固体线性膨胀演示，不是空气/液体体积模型。[H12]

勺子模型只表示相同形状、相同初温与理想固定温浴下，较好的导热路径让远端更快接近浴温。[H06] 本文把 tip lump 的热容量设为相同，是为控制变量选的教学参数；不能据此宣称现实金属勺和塑料勺具有相同热容量，也不能把远端单节点温度当作勺上处处温度。热库被视作由外部维持恒温，其能量变化不在此模型中；不得声称有限杯水与勺子的封闭系统总能量已求解。

### 4.3 输出与验证

新增 quantity 目录由 `heatQuantity` 提供，`quantityKind` 必须识别，不能靠缺失输出默认 0 掩盖拼写错误：

| from | 种类 / 单位 | 含义 |
|---|---|---|
| `temperature:<lump>` | number / °C | 该时刻温度 |
| `change:<lump>` | number / K | 相对初温的温差 |
| `rate:<lump>` | number / W | 净传入功率，正入负出 |
| `energy:<lump>` | number / J | 净传入能量 |
| `supplied:<lump>` | number / J | 外部定功率供能 |
| `reservoir-energy:<lump>` | number / J | 净传至热库能量 |
| `direction:<lump>` | state | warming / steady / cooling，按 q 的 ±1e−9 W 判定 |
| `compare:<pair>` | state | first-warmer / same / second-warmer；ε 是设计比较带 |
| `delta-mm:<rod>`、`length-mm:<rod>` | number / mm | 由米转毫米的变化 / 长度 |

按章仅声明所用输出，建议总数 ≤ 24；读数温度 1 位小数、膨胀 3 位、能量整数。所有数值以全精度求解，最后格式化。温差、传热量、温度分别命名，禁止把 °C 标在热量上。[H02]

`simIssues` 新检查：time 必须是非负升序 step，首值 0，至少两值；NumericSource 引用存在且类型匹配，choice 映射覆盖全部选项且无多余键；容量在所有允许质量下 >0；length>0、alpha≥0、epsilon≥0；比较双方存在、不是同一 lump；每个输出 from 指向有效对象，kind/states 与目录相符。所有数值有限，禁止 NaN/Infinity。

第一版 domain 固定在 0–95 °C、0–600 s。对每个独立实验自己的控制组合遍历端点/选项，检查 t=0 与最大 t 的温度在 domain 内；解析式单调，足以约束整条轨迹。新驱动形式若会产生非单调过程，必须另加极值检查。本参数集最高浴温 85、最低 5；加热最大 60.714… °C，故不会跨相变。遇越界参数应构建失败，不能硬夹温度产生“沸腾平台”。相变细节链接 states-of-matter。

### 4.4 新增能力 E-H2：连续模型曲线

在 `simTrySchema` 增加独立可选 `curve`，不改变既有 `record.chart` 的语义：

```yaml
state:
  sim:
    set: { elapsed-s: 0, water-g: 200, heater-w: 100 }
    try:
      vary: elapsed-s
      also: [heater-w]
      keep: [water-g, { en: "Same starting temperature", zh: "相同初温" }]
      observe: [heated-c, heated-input-j]
      record: true
      curve: { x: elapsed-s, y: [heated-c], samples: 101 }
```

`curve.x` 必须是模型公开支持连续取值的 step 控件，heat v1 仅允许 `heat.time`。`y` 为 1–3 个 number 输出、同单位，并且随 x 有意义；samples 为 33–201 的整数，默认 101。第一版温度图只允许 °C，不混能量与长度。curve 范围取 x 的最小/最大值，全部其他 controls 保持当前值；x 的合法 UI 步值仍是 11 个，采样时可算两步之间的解析值。

新增纯函数 `curveModel` 与 `curveSummary`、组件 `TryCurve`；模型注册一个 `curveEvaluator` 适配器返回 `sampleAt(t)`。heat 适配器调用同一个 `solveHeatAt`；不能绕过全局 `isControlValue` 把非 step 值写进 store。曲线只是函数的显示采样；不是样本测量、不是积分、没有平滑拟合。样条不得越过真实单调轨迹。101 点折线在小图上读作连续曲线，标注 “Model curve / 模型曲线”。

图始终显示全 0–300 s 轨迹，当前 elapsed 用竖游标与该点读数标记；尚未选到的时刻也可见，教学说明写“模型预计”。先猜后看尚未选择时隐藏该题要揭晓的曲线/读数，揭晓后显示全轨迹，避免预测答案先出现在图中。改变功率/覆盖层后整条曲线立刻重算，游标保留原 elapsed，不自动归零。若教师要从零开始，按钮明确写“回到 0 s”，调用同一 `setSim`；它不是 replay，不注册 G。

纵轴固定 0–100 °C；横轴 s，刻度 0/60/120/180/240/300。不使用已有 `TryChart` 的零截断来掩盖负值：本模型范围由验证保证；后续支持零下温度时须显式扩展 domain 与双向坐标。轴与读数来自同一 sampler。曲线缓存键包括实验参数、全部保持量、series 和采样设置，**不包括游标时间**；移动游标只计算一个时刻。

### 4.5 绑定、状态与观察记录

温度计用独立的示意液柱端点/指示片沿 Y 移动；杆用独立端点指示片沿 X 移动，静止杆保留准确长度。复用已有 offset，明确“位移放大 500 倍”。若未来必须让整根杆真实变长，应独立新增通用轴向尺寸绑定，不能盗用 coil stretch。下列绑定语法已经存在；仅引用的新 heat outputs 尚待 E-H1：

```jsonc
[
  { "output": "heated-c", "part": "thermometer-marker",
    "offset": { "axis": [0,1,0], "per": 0.001, "origin": 25 } },
  { "output": "rod-delta-mm", "part": "rod-end-marker",
    "offset": { "axis": [1,0,0], "per": 0.5, "origin": 0 } },
  { "output": "metal-rate-w", "flow": "heat-to-metal",
    "intensity": { "full": 20, "mode": "speed" } }
]
```

最后一例路径从温浴向远端；正速率向勺、负速率反向。粒子是热传递示意标记，不是物质颗粒；同色/线向箭头表达方向，关闭 RUN/FLOW 只停装饰运动，不改温度。常温热物不自发光，不用 glow；如使用 tint，写明这是温度编码，并保留文字读数。

唯一时间真值是 store 中 resolved `elapsed-s`。章节进入采用本章 set；拍叠加自己的 set；URL `?sim=elapsed-s.120~…` 恢复同一计算时刻。暂停、隐藏 HUD、切纸/深色、镜头预设、REFERENCE、EXPLODED、reduced motion 均不改 elapsed。不因真实等待而升降温；不存在后台实验继续走时的问题。过渡 ease 只是视觉插值，不能进入日志；需精确对照的截图/instant 直接显示结果。telemetry follow 用 `lag:0`，避免数值读数在实际模型时刻后面追赶。

现有 recordRow 只以 vary 值覆盖，最多 12 行，未保存保持量。为避免把不同功率的行连成同一实验，新增通用 table-context key：当前章 + 排序后的所有 resolved controls（排除 vary）。context 变化立即清除此章表并用双语短提示说明；换章/拍/刷新仍遵守既有临时 UI 状态规则，不写 localStorage、遥测或网络。记录的每一行是显式时刻的**模型结果**；不把101条曲线采样自动塞进学生表。数据表清空不清曲线，曲线也不伪装成已记一行。

预测沿用现有非评分机制；优先预测 `compare:tips` 状态，或大幅温度差。现有数值 outcomeOf 的“same”是 ±5% 比较带，不适合判断0.072 mm与0.048 mm这样的微小数绝对精度，也不是物理平衡定义。揭晓保留 before/after 条件；再改变相关参数或时间时清除该预测结果，避免旧的“之前”与新的控制量混读。

### 4.6 自证用例与实现验收

默认设计点 C=200×4.2=840 J/K；热浴85 °C；t 如表。以下值预先用解析式计算，单测绝对误差 ≤1e−6（图格式化另测）：

| t / s | 加热100 W / °C | 裸杯冷却85→25 / °C | 包覆冷却 / °C | 金属远端 / °C | 塑料远端 / °C |
|---|---|---|---|---|---|
| 0 | 25 | 85 | 85 | 25 | 25 |
| 60 | 32.142857143 | 77.012673985 | 82.894956662 | 62.927233530 | 30.709754918 |
| 120 | 39.285714286 | 70.088637585 | 80.863766782 | 76.879883006 | 35.876154815 |
| 300 | 60.714285714 | 54.372499573 | 75.187858438 | 84.595723180 | 48.608160417 |

还必须测：

1. t=120 加热输入12,000 J，净传入12,000 J，库能量0；加热0 W保持25 °C；质量400 g时120 s只升7.142857143 K。
2. t=120裸杯 q≈−90.177275169 W，`E+Eout=0`；包覆杯同刻更接近85 °C。T₀=Tₐ、P=0时所有时刻不变，方向steady。
3. 冷浴5 °C、t=60时金属端12.357588823 °C，塑料端23.096748361 °C，compare为second-warmer；说明好的导热体也能更快降温，不制造“金属自己产生热”的误解。[H03, H06]
4. 杆85 °C：ΔL=0.072 mm，L=100.072 mm；5 °C：−0.024 mm，L=99.976 mm；25 °C回到0。标记放大500倍时位移分别+0.036 m、−0.012 m。
5. 先算300再算60、直接深链接60、反复往返、切章再回到同样输入都得到相同结果；无累计误差。冷却不越过热库温度；所有能量恒等式成立。
6. 非法温度、负容量、无穷系数、未覆盖choice、错误输出单位/kind、curve引用choice或非time控件均被validate拒绝；旧主题无curve时解析结果与界面不变。
7. 曲线101点含端点，t=120对应第40点；游标120的值与observe、表行、PLATE完全相等。改变power清表/重算曲线、保留120；只改elapsed保留表的其他行。相同vary值覆盖，不超过12行。
8. `__atlas.engine.setSim` 设合法步值；`engine.sim().values/outputs/table`能复核。曲线增加只读测试诊断 `{x, domain, series, cursor}`，返回数值不返回SVG；不用现有simSeek改变本实验时间。

单测位置建议 `tests/space-scene/heat.test.ts` 与 curve/context 纯函数测试；后续施工运行项目全部门槛和 `pnpm shoot heat --keys --layout --beats`，检查EN/ZH、paper/cinema、390宽。持续工作时优先保证模型一次求解预算与旧evaluateSim相同级别；101×4次解析采样有界且仅参数改变时运行，实测后记录性能，不先声称真机60 fps。

图放在 readerTop 的试一试区域，不侵占底部章节轴。复用ink线、虚线/不同点形区分最多三条曲线，signal仅给游标；不用颜色单独编码金属/塑料。SVG提供双语标题与趋势摘要，旁边可展开“模型值表”（固定0/60/120/180/240/300 s）；与手工记录表明确分名。所有操作≥44 px、键盘可达，`[`/`]`通过同一store改变vary，不要求hover或拖动。读屏只在用户操作后读当前秒数与温度，101个采样不逐条播报。reduced motion保留静态曲线与精确读数；离线/无网络时全部工作。

施工文件边界：新增 heat schema/solver、curve model/UI；扩展 sim-schema 的kind/quantity/issues与curve验证，index注册及SEPARATE_EXPERIMENTS；为记录表增加context隔离、预测结果失效和测试诊断；更新docs/06。本文只完成设计，未修改以上引擎源码或生产主题。

### 4.7 本主题实例化与E-H3

E-H1 heat、E-H2 curve如上；E-H3为通用记录context隔离及预测遮蔽/失效。现有表以vary值覆盖但没保存保持条件，可能混连不同功率/初温。改变非vary条件清本章表，提示EN “Conditions changed; start a new record.” / ZH “条件已改变，请开始新记录。”曲线采样不能自动混入学生记录。[D08]

本主题cool-start-c取5/45/65/85°C（默认85），扩展冷起点保冷。5°C时裸杯120s≈9.970454138°C、包覆≈6.378744406°C；环境25°C不变，包覆减慢输入而非造冷。[H08,D02]

输出实际声明24个，label双语、from一一映射：

| id | from | unit / kind |
|---|---|---|
| heated-c | temperature:heater | °C/number |
| heated-j | energy:heater | J/number |
| heated-input-j | supplied:heater | J/number |
| metal-c | temperature:metal-tip | °C/number |
| plastic-c | temperature:plastic-tip | °C/number |
| metal-rate-w | rate:metal-tip | W/number |
| plastic-rate-w | rate:plastic-tip | W/number |
| tip-comparison | compare:tips | state: first-warmer/same/second-warmer |
| cool-c | temperature:cooler | °C/number |
| cool-rate-w | rate:cooler | W/number |
| cool-energy-j | energy:cooler | J/number |
| cool-reservoir-j | reservoir-energy:cooler | J/number |
| cool-direction | direction:cooler | state: warming/steady/cooling |
| heated-direction | direction:heater | state: warming/steady/cooling |
| metal-direction | direction:metal-tip | state: warming/steady/cooling |
| plastic-direction | direction:plastic-tip | state: warming/steady/cooling |
| rod-delta-mm | delta-mm:rod | mm/number |
| rod-length-mm | length-mm:rod | mm/number |
| heater-rate-w | rate:heater | W/number |
| heated-change-k | change:heater | K/number |
| cool-change-k | change:cooler | K/number |
| heated-reservoir-j | reservoir-energy:heater | J/number |
| metal-energy-j | energy:metal-tip | J/number |
| plastic-energy-j | energy:plastic-tip | J/number |

环境温度固定设计规格；浴温/经过时间直接读控件，不偷加不存在的输出。时间、温度、差值、能量的单位不混。不得在observe/bind引用未声明的output。

| card | vary / also | 保持条件 | observe / curve / prediction |
|---|---|---|---|
| T1同温 | elapsed-s / 无also；bath固定25 | 初温、室内条件、两通路 | metal-c,plastic-c；先猜两温关系，无曲线 |
| T2勺柄 | elapsed-s / bath-c | 外形、浸入深度、初温、相同有效容量 | metal-c,plastic-c,tip-comparison；curve两温；热/冷浴预测 |
| T3隔热 | cover / elapsed-s,cool-start-c | water-g=200、环境25、器形 | cool-c,cool-direction；curve沿elapsed-s一条；先猜bare/wrapped |
| T4加热 | elapsed-s / water-g,heater-w | 初温25，理想无散热 | heated-c,heated-j；curve heated-c；水量/功率预测 |
| T5冷却 | elapsed-s / cover,cool-start-c | water-g=200、环境25 | cool-c,cool-rate-w；curve cool-c；后期趋势预测 |
| T6杆端 | rod-c / 无also | L0、α、参考温度 | rod-delta-mm,rod-length-mm；主动记温度行，无时间曲线 |

T3的curve.x仍为heat.time，与vary=cover的记录图不同；类别改变不能偷偷变成时间轴。T4同一时间下改质量/功率，旧数据表须清；预测before/after另保留条件快照。T1/T2预测前遮蔽PLATE、读数、曲线和定量caption，揭示后同步；自由try默认未揭示，讲解拍可显式揭示。改变相关条件使旧预测失效。这些遮蔽规则是新增UI合同，不能假设既有引擎已完成。

无需地图层、GLB、GPU热场、真实材料排名或壁钟积分。E-H2没完成时，不能用现有record.chart声称交付了连续模型曲线。优先实现顺序E-H1→E-H3→E-H2。

## 5. 章节与双语字幕草稿

章state不累积。先默认控件⊕章set，再拍set；表中preset/labels为本拍全量。共同view=assembled、explode=0、cutaway=none、run=false。02揭示后可手动RUN装饰流，不改实验时间。hide按本拍分区决定，不让上一拍隐藏状态泄漏。

章节计划与37个独立caption的机器可读版本在chapter-plan.json。所有自然事实与SIM数值在最后一栏标fact id，布局/UI设计不冒充外部事实。

### 5.0 总表

| 章 | id / EN / ZH | 拍数 | 镜头/分区 | 默认sim.set |
|---|---|---|---|---|
| 00 | before-you-start / Before You Start / 开始之前 | 4 | view-hero / all | {"elapsed-s": 0} |
| 01 | temperature-and-heat / Temperature and Heat / 温度与热 | 5 | view-probe / transfer | {"elapsed-s": 0, "bath-c": 25} |
| 02 | heat-along-spoons / Heat Along a Spoon / 勺柄上的传热 | 5 | view-spoons / transfer | {"elapsed-s": 0, "bath-c": 85} |
| 03 | slowing-heat-transfer / Slowing Heat Transfer / 隔热材料 | 4 | view-cooler / curves | {"elapsed-s": 0, "water-g": 200, "cover": "bare", "cool-start-c": 85} |
| 04 | heating-curves / Heating Curves / 加热曲线 | 5 | view-heater / curves | {"elapsed-s": 0, "water-g": 200, "heater-w": 100} |
| 05 | cooling-curves / Cooling Curves / 冷却曲线 | 5 | view-cooler / curves | {"elapsed-s": 0, "water-g": 200, "cover": "bare", "cool-start-c": 85} |
| 06 | expansion-and-contraction / Expansion and Contraction / 热胀冷缩 | 5 | view-expansion / expansion | {"elapsed-s": 0, "rod-c": 25} |
| 07 | explain-with-evidence / Explain with Evidence / 用证据解释 | 4 | view-hero / all | {"elapsed-s": 0} |

### 5.1 00 · 开始之前 · before-you-start

**Summary EN**: Read temperature, follow heat, and compare one condition at a time. / **ZH**: 读温度、看传热，每次比较一个改变。

**孩子的问题（写作动机，不作标题）**：我们究竟在量什么？

**正文/summary提纲**：先总览测温、传热、曲线与膨胀四区。SIM表示模型结果，热水操作只发生在屏幕中。[H02,H05,D01–D04]

| 拍id | 本拍可见state草稿 | caption EN | caption ZH | fact ids |
|---|---|---|---|---|
| beat-overview | preset=view-hero; layers=transfer,curves,expansion,heat-paths; sim.set={}; labels=bath-beaker,probe,rod | The bench brings measurement, heat transfer and expansion into one view. | 实验台把测温、传热和膨胀放在同一个画面里。 | H01,D01,D04 |
| beat-heat-source | preset=view-heater; layers=curves; sim.set={"heater-w": 100, "elapsed-s": 0}; labels=heater,heater-beaker | The heater supplies energy to the water. Its input is separate from the temperature reading. | 加热器向水供能。供能与温度读数分开显示。 | H02,H21,D01 |
| beat-probe | preset=view-probe; layers=transfer,heat-paths; sim.set={"bath-c": 25, "elapsed-s": 0}; labels=probe,probe-marker | The probe reports temperature. It does not measure an amount of heat. | 探头报告温度，不是物体里有多少热。 | H05 |
| beat-model-label | preset=view-hero; layers=transfer,curves,expansion,heat-paths; sim.set={}; labels=bath-water,cooling-water | SIM marks a model result. Compare conditions without handling hot apparatus. | SIM表示模型结果。你可以比较条件，不必操作热器材。 | D01,D08 |

**细看**：

- 热源链接energy-conversion，不重讲能量链。[H21,H24]
- 解释通用模型而非实物测量报告。[D01–D03]

**本章索引**：parts=[bath-beaker, bath-water, metal-spoon, plastic-spoon, probe, heater, cooling-beaker, wrap, rod, rod-end-marker]。对象可点，选中详情在章头下方。

### 5.2 01 · 温度与热 · temperature-and-heat

**Summary EN**: Temperature readings and energy transfers tell different things. / **ZH**: 温度读数和能量传递描述不同的量。

**孩子的问题（写作动机，不作标题）**：摸起来冷就一定温度低吗？

**正文/summary提纲**：同室样品先猜手感与读数，揭晓相同温度。把温度与传递能量的单位分开，再看不同水量。内能与热容留细看。[H02,H09,H18,H20]

| 拍id | 本拍可见state草稿 | caption EN | caption ZH | fact ids |
|---|---|---|---|---|
| beat-same-room | preset=view-probe; layers=transfer,heat-paths; sim.set={"bath-c": 25, "elapsed-s": 0}; labels=metal-spoon,plastic-spoon | Both spoon tips start at the model room temperature. Their materials are different. | 两个勺子远端从模拟室温开始，材料不同。 | D03,H09 |
| beat-predict-feel | preset=view-probe; layers=transfer,heat-paths; sim.set={"bath-c": 25, "elapsed-s": 0}; labels=metal-spoon,plastic-spoon | Metal may feel cooler than plastic even at equal temperature. Predict the readings before revealing them. | 同温的金属摸起来也可能比塑料冷。先猜读数，再揭晓。 | H09,M04 |
| beat-equal-reading | preset=view-probe; layers=transfer,heat-paths; sim.set={"bath-c": 25, "elapsed-s": 120}; labels=probe-marker,metal-spoon,plastic-spoon | Both model readings stay at 25 degrees Celsius. Feeling cold is not a temperature measurement. | 两个模拟读数都保持二十五摄氏度。冷的手感不是温度测量。 | H05,H09,D03 |
| beat-different-quantities | preset=view-heater; layers=curves; sim.set={"heater-w": 100, "water-g": 200, "elapsed-s": 120}; labels=heater,heater-water,heater-probe-marker | In this simulation, input is 12,000 joules and water temperature is about 39.3 degrees Celsius. These units describe different quantities. | 这个模拟里，供能是一万二千焦耳，水温约三十九点三摄氏度。单位描述不同的量。 | H02,D05 |
| beat-mass-matters | preset=view-heater; layers=curves; sim.set={"heater-w": 100, "water-g": 400, "elapsed-s": 120}; labels=heater-water,heater-probe-marker | With twice the model water mass and the same input, temperature rises less. Temperature alone does not tell the whole energy story. | 模拟水量加倍、供能相同，升温较少。只看温度，不能知道完整的能量变化。 | H18,H20,D01 |

**细看**：

- 金属不会产生一种叫冷的物质。[H03,H09]
- 质量不同的水升高相同温度所需能量不同。[H18,H20]

**本章索引**：parts=[metal-spoon, plastic-spoon, probe, probe-marker, heater-beaker, heater-water]。对象可点，选中详情在章头下方。

**试一试**：T1，参数与预测按§4.7；每次进入自由卡的揭示状态独立于讲解拍。

### 5.3 02 · 勺柄上的传热 · heat-along-spoons

**Summary EN**: Follow energy from a hotter bath toward a cooler tip. / **ZH**: 看能量从较热温浴传向较冷远端。

**孩子的问题（写作动机，不作标题）**：为什么金属勺柄先变暖？

**正文/summary提纲**：热浴外部维持恒温。模型用相同有效远端热容量、不同导热通路比较，不声称实际两勺热容量相同。改时间后，再用冷浴作独立对照。[H03,H06,H10,H11,D03]

| 拍id | 本拍可见state草稿 | caption EN | caption ZH | fact ids |
|---|---|---|---|---|
| beat-matched-start | preset=view-spoons; layers=transfer,heat-paths; sim.set={"bath-c": 85, "elapsed-s": 0}; labels=metal-spoon,plastic-spoon,bath-water | The tips start together. The bath is held hotter than both tips. | 两个远端从相同温度开始，温浴维持在比它们更高的温度。 | H03,D03 |
| beat-hot-bath | preset=view-spoons; layers=transfer,heat-paths; sim.set={"bath-c": 85, "elapsed-s": 60}; labels=metal-spoon,metal-tip-marker,plastic-tip-marker | At the same model time, the metal-path tip is warmer. Energy travels more readily along that path. | 同一模拟时刻，金属通路远端较暖，能量较容易沿这条通路传过去。 | H06,D07 |
| beat-later-tip | preset=view-spoons; layers=transfer,heat-paths; sim.set={"bath-c": 85, "elapsed-s": 120}; labels=metal-tip-marker,plastic-tip-marker | Both tips warm toward the bath temperature. The poorer conducting path still transfers energy. | 两个远端都向温浴温度靠近。不良导热通路仍会传递能量。 | H06,H07,D03 |
| beat-cold-bath | preset=view-spoons; layers=transfer,heat-paths; sim.set={"bath-c": 5, "elapsed-s": 60}; labels=bath-water,metal-tip-marker,plastic-tip-marker | In the colder bath, the metal-path tip cools faster in this model. Heat still goes from hotter to colder. | 较冷的温浴中，金属通路远端在模型里降温较快。热仍从较热处传向较冷处。 | H03,H11,D03 |
| beat-equal-bath | preset=view-spoons; layers=transfer,heat-paths; sim.set={"bath-c": 25, "elapsed-s": 300}; labels=metal-tip-marker,plastic-tip-marker | When bath and tips start at equal temperature, no net transfer changes either tip reading. | 温浴与远端从同温开始，没有改变远端读数的净传热。 | H04,D03 |

**细看**：

- 恒温浴不是有限杯水与勺子的封闭系统。[D03]
- 不输出真实材料导热率排名；真实器材还受热容、几何与散热影响。[H10,D03]

**本章索引**：parts=[bath-beaker, bath-water, metal-spoon, metal-tip-marker, plastic-spoon, plastic-tip-marker]。对象可点，选中详情在章头下方。

**试一试**：T2，参数与预测按§4.7；每次进入自由卡的揭示状态独立于讲解拍。

### 5.4 03 · 隔热材料 · slowing-heat-transfer

**Summary EN**: A poor conductor slows a transfer; it does not make energy. / **ZH**: 不良导体减慢传热，不会制造能量。

**孩子的问题（写作动机，不作标题）**：包起来会自己变热吗？

**正文/summary提纲**：同水量、初温、时间比较有无包覆。有效系数为设计值，不等于某种塑料导热率。保热、保冷方向相反但隔热都减慢传热。[H07,H08,D02]

| 拍id | 本拍可见state草稿 | caption EN | caption ZH | fact ids |
|---|---|---|---|---|
| beat-bare-cup | preset=view-cooler; layers=curves; sim.set={"cover": "bare", "cool-start-c": 85, "elapsed-s": 120}; labels=cooling-water,cool-probe-marker | The bare model cup transfers energy to cooler surroundings. Its temperature falls. | 裸杯模型向较冷的环境传递能量，水温下降。 | H03,D02 |
| beat-wrapped-cup | preset=view-cooler; layers=curves; sim.set={"cover": "wrapped", "cool-start-c": 85, "elapsed-s": 120}; labels=wrap,cool-probe-marker | At equal time and starting temperature, the wrapped model cup has cooled less. | 初温与经过时间相同时，包覆杯模型降温较少。 | H08,D02 |
| beat-slow-not-zero | preset=view-cooler; layers=curves; sim.set={"cover": "wrapped", "cool-start-c": 85, "elapsed-s": 300}; labels=wrap,cooling-water | The wrapped cup still cools. Slower transfer is different from no transfer. | 包覆杯仍会冷却。传得较慢不等于完全不传。 | H07,D06 |
| beat-keep-cold | preset=view-cooler; layers=curves; sim.set={"cover": "wrapped", "cool-start-c": 5, "elapsed-s": 120}; labels=wrap,cool-probe-marker | For a colder starting object, insulation slows energy entering from warmer surroundings. It can help keep cold things cold. | 物体起点较冷时，隔热减慢能量从较暖环境传入，也能帮助保冷。 | H08,D02 |

**细看**：

- 空气不良导热，但流动空气还可带走能量。[H07,H08]
- 其他材料性能接materials，不把防水误当隔热。[H10]

**本章索引**：parts=[cooling-beaker, cooling-water, cool-probe-marker, wrap, air-gap]。对象可点，选中详情在章头下方。

**试一试**：T3，参数与预测按§4.7；每次进入自由卡的揭示状态独立于讲解拍。

### 5.5 04 · 加热曲线 · heating-curves

**Summary EN**: Read time and temperature together, then change one condition. / **ZH**: 把时间与温度一起读，再改变一个条件。

**孩子的问题（写作动机，不作标题）**：水量加倍，同样加热会怎样？

**正文/summary提纲**：横轴时间、纵轴温度、单位明确。游标与读数同步；同功率水量大或同水量功率小，曲线较平缓。理想无散热模型才画直线，不保证真实杯水线性升温。[H18,D01,D05]

| 拍id | 本拍可见state草稿 | caption EN | caption ZH | fact ids |
|---|---|---|---|---|
| beat-axes | preset=view-heater; layers=curves; sim.set={"water-g": 200, "heater-w": 100, "elapsed-s": 0}; labels=heater-water,heater-probe-marker | The horizontal axis is elapsed time in seconds. The vertical axis is water temperature in degrees Celsius. | 横轴是经过时间，单位秒；纵轴是水温，单位摄氏度。 | D01 |
| beat-advance-time | preset=view-heater; layers=curves; sim.set={"water-g": 200, "heater-w": 100, "elapsed-s": 120}; labels=heater,heater-probe-marker | At 120 seconds, cursor and probe agree at about 39.3 degrees Celsius in this model. | 一百二十秒时，游标和探头在这个模型里都读约三十九点三摄氏度。 | D05 |
| beat-more-water | preset=view-heater; layers=curves; sim.set={"water-g": 400, "heater-w": 100, "elapsed-s": 120}; labels=heater-water,heater-probe-marker | With twice the water mass, equal input gives half the temperature rise in this ideal model. | 理想模型中，水量加倍、供能相同，升温幅度变为一半。 | H18,D01 |
| beat-less-power | preset=view-heater; layers=curves; sim.set={"water-g": 200, "heater-w": 50, "elapsed-s": 120}; labels=heater,heater-probe-marker | At fixed water mass, lower power makes the model heating line less steep. | 水量不变时，功率较低使模拟加热线较平缓。 | H18,D01 |
| beat-zero-input | preset=view-heater; layers=curves; sim.set={"water-g": 200, "heater-w": 0, "elapsed-s": 300}; labels=heater,heater-probe-marker | With no input and no heat loss in this ideal heating model, temperature stays unchanged. | 理想加热模型没有输入、也没有散热时，温度不变。 | D01 |

**细看**：

- 公式后台或细看，不要求P4背比热公式。[H18]
- 模拟不跨相变；不硬夹到沸点造假平台。[H17,D01]

**本章索引**：parts=[heater, heater-beaker, heater-water, heater-probe-marker, heater-probe]。对象可点，选中详情在章头下方。

**试一试**：T4，参数与预测按§4.7；每次进入自由卡的揭示状态独立于讲解拍。

### 5.6 05 · 冷却曲线 · cooling-curves

**Summary EN**: Cooling slows as the temperature difference becomes smaller. / **ZH**: 与环境温差较小时，冷却也慢下来。

**孩子的问题（写作动机，不作标题）**：冷却会一直降到零度吗？

**正文/summary提纲**：读等长时间区间的温度变化，而非只看末端。靠近环境温度时冷却变慢。包覆对照清记录重算。相变平台只作一句边界跨链，不重复完整三态课程。[H17,H19,H28,D02,D06]

| 拍id | 本拍可见state草稿 | caption EN | caption ZH | fact ids |
|---|---|---|---|---|
| beat-cool-start | preset=view-cooler; layers=curves; sim.set={"cool-start-c": 85, "cover": "bare", "elapsed-s": 0}; labels=cooling-water,cool-probe-marker | Water starts hotter than the model surroundings, held at 25 degrees Celsius. | 水从比环境更热的温度开始，模拟环境维持二十五摄氏度。 | D02 |
| beat-early-cooling | preset=view-cooler; layers=curves; sim.set={"cool-start-c": 85, "cover": "bare", "elapsed-s": 60}; labels=cool-probe-marker | The early curve falls more steeply. The temperature difference is larger. | 曲线前段下降较陡，这时与环境的温差较大。 | H19,D02 |
| beat-later-cooling | preset=view-cooler; layers=curves; sim.set={"cool-start-c": 85, "cover": "bare", "elapsed-s": 300}; labels=cooling-water,cool-probe-marker | Later, cooling is slower. The model approaches room temperature rather than continuing to zero. | 后来冷却较慢。模型向环境温度靠近，不会一直降到零度。 | H19,H28,D06 |
| beat-cooling-compare | preset=view-cooler; layers=curves; sim.set={"cool-start-c": 85, "cover": "wrapped", "elapsed-s": 300}; labels=wrap,cool-probe-marker | The wrapped model remains warmer at the same time. Use equal starting conditions for comparison. | 相同时刻，包覆模型仍较暖。比较须使用相同起始条件。 | H08,D02,D06 |
| beat-flat-segments | preset=view-cooler; layers=curves; sim.set={"cool-start-c": 85, "cover": "bare", "elapsed-s": 300}; labels=cooling-water | Flattening near room temperature differs from a phase-change plateau. This model contains no phase change. | 靠近环境温度而变平与相变平台不同。这里的模型没有物态变化。 | H17,H28,D01 |

**细看**：

- 读数四舍五入相同不一定是后台精确相等。[H04,H28]
- 真实杯子还受容器、蒸发与空气流动影响。[D02]

**本章索引**：parts=[cooling-beaker, cooling-water, cool-probe, cool-probe-marker, wrap]。对象可点，选中详情在章头下方。

**试一试**：T5，参数与预测按§4.7；每次进入自由卡的揭示状态独立于讲解拍。

### 5.7 06 · 热胀冷缩 · expansion-and-contraction

**Summary EN**: Temperature change can alter an object’s size. / **ZH**: 温度变化也可能改变物体大小。

**孩子的问题（写作动机，不作标题）**：球与环都加热时，哪里会变大？

**正文/summary提纲**：杆端读数是真模型变化，独立标记放大500倍。球环尺寸另作放大示意。液柱和可动活塞采用定性姿态，不假称杆模型解出液体/气体体积。回温后回到起点，质量不因膨胀添加。[H12–H16,H22,H27,D04]

| 拍id | 本拍可见state草稿 | caption EN | caption ZH | fact ids |
|---|---|---|---|---|
| beat-rod-expands | preset=view-expansion; layers=expansion; sim.set={"rod-c": 85}; labels=rod,rod-end-marker | The warmer model rod is longer. A separate marker magnifies its tiny endpoint change five hundred times. | 较暖的模拟杆更长，独立标记把微小端点变化放大五百倍。 | H12,D04 |
| beat-ball-ring | preset=view-expansion; layers=expansion; sim.set={"rod-c": 85}; labels=expansion-ball,expansion-ring; pose=ball-ring-warm | The enlarged ball is above a ring kept at its original temperature. The size change is exaggerated; a heated ring hole would also expand. | 放大的球在保持原温的环上方。尺寸变化已夸大；环受热时孔也会变大。 | H12,H13 |
| beat-liquid-column | preset=view-expansion; layers=expansion; sim.set={"rod-c": 65}; labels=expansion-thermometer; pose=liquid-column-warm | Expansion moves liquid along a narrow thermometer tube. This qualitative view gives no calculated liquid volume. | 膨胀使液体沿温度计窄管移动。定性画面不给液体体积计算值。 | H22 |
| beat-gas-boundary | preset=view-expansion; layers=expansion; sim.set={"rod-c": 65}; labels=gas-cylinder,gas-piston; pose=gas-warm | A movable piston allows warmed gas to occupy more space. A rigid sealed vessel is a different condition. | 可动活塞让受热气体占更多空间，刚性密闭容器是另一种条件。 | H27 |
| beat-return-size | preset=view-expansion; layers=expansion; sim.set={"rod-c": 25}; labels=rod,rod-end-marker | Cooling the rod to its starting temperature restores its original model length. Expansion did not add material. | 冷却回初温，杆恢复模型原长。膨胀没有添加材料。 | H12,H14,D04 |

**细看**：

- 若环均匀受热，孔也变大。[H13]
- 水0–4摄氏度是一般规则的例外，细看链接states-of-matter。[H16]
- 刚性密闭容器与可动边界不同。[H27]

**本章索引**：parts=[rod, rod-end-marker, expansion-ball, expansion-ring, expansion-thermometer, gas-cylinder, gas-piston]。对象可点，选中详情在章头下方。

**试一试**：T6，参数与预测按§4.7；每次进入自由卡的揭示状态独立于讲解拍。

### 5.8 07 · 用证据解释 · explain-with-evidence

**Summary EN**: Name the change, cite the observation, and explain the transfer. / **ZH**: 说出改变、引用观察，再解释传热。

**孩子的问题（写作动机，不作标题）**：从读数能得出什么结论？

**正文/summary提纲**：回看公平比较，用同刻读数作证据。把温度、传热方向与快慢连成句。气候与温泉值只作本地资料，非本杯实测。末拍链接四个已发布主题。[H03,H10,H29,H30,D08]

| 拍id | 本拍可见state草稿 | caption EN | caption ZH | fact ids |
|---|---|---|---|---|
| beat-fair-conditions | preset=view-spoons; layers=transfer,heat-paths; sim.set={"bath-c": 85, "elapsed-s": 60}; labels=metal-spoon,plastic-spoon | Compare at equal time, bath temperature and starting temperature. Changing several conditions weakens the conclusion. | 在相同时间、温浴温度与初温下比较。同时改几个条件会削弱结论。 | H10,D03,D08 |
| beat-explanation-chain | preset=view-cooler; layers=curves; sim.set={"cool-start-c": 85, "cover": "wrapped", "elapsed-s": 120}; labels=wrap,cooling-water | The wrapped model stays warmer because energy leaves more slowly under these conditions. Insulation supplies no energy. | 这些条件下，包覆模型因失去能量较慢而保持较暖。隔热不会供能。 | H08,D02 |
| beat-singapore-context | preset=view-probe; layers=transfer,heat-paths; sim.set={"bath-c": 25, "elapsed-s": 0}; labels=probe | Climate data describe outdoor air; a hot-spring value describes one location. Neither measures this model cup. | 气候资料描述室外空气，温泉数值描述特定地点，都不是这杯模拟水的实测。 | H29,H30,D02 |
| beat-continue-reading | preset=view-hero; layers=transfer,curves,expansion,heat-paths; sim.set={}; labels=probe,metal-spoon,plastic-spoon,rod | Follow the links for air-conditioning, energy conversion, states of matter and other material properties. | 跟随链接继续看空调、能量转换、物质三态及材料其他性质。 | H02,H21,H17,H07 |

**细看**：

- 句架：保持……相同时，……变化较慢，这支持……。[D08]
- 不能用一组设计值推出所有金属或塑料的排名。[H07,H10,D03]

**本章索引**：parts=[metal-spoon, plastic-spoon, cooling-beaker, wrap, rod, probe]。对象可点，选中详情在章头下方。
### 5.9 跨链与计数

00/07→energy-conversion；01/06→states-of-matter；03/07→materials；05→water；07→aircon。六个邻课均published，状态取本地topic.yaml；施工时从原课读取当前chapter id再做深链，不编造锚。EN/ZH链接随locale。无sibling，不设拆分说明。

合计 **8章（背景1+主线7）、37拍**。每拍有可见状态/读数/对照变化，不只是朗读正文。后续正文目标主章EN200–300词/ZH350–500字，当前交付为提纲及caption草稿，非已完成生产正文。

## 6. 名词表与来源

### 6.1 产品glossary建议（16项）

从60词研究清单选出以下项，attestation/Singapore状态继承facts.json terms。†完整短语为编辑译法待核；其组成概念有事实依据，不号称MOE官方华文。

| id | EN / ZH | 首现 / 定义依据 |
|---|---|---|
| heat | Heat / 热 | 01；因温差传递的能量。[H02] |
| temperature | Temperature / 温度 | 00；冷热程度的测量量。[H02,H05] |
| thermometer | Thermometer / 温度计 | 00；测温仪器。[H05] |
| heat-transfer | Heat Transfer / 热传递 | 02；温差造成从较热处至较冷处的净传能。[H03] |
| good-conductor | Good Conductor of Heat / 热的良导体† | 02；可比条件下较易传热。[H06,H10] |
| poor-conductor | Poor Conductor of Heat / 热的不良导体† | 03；较慢传热，并非完全不传。[H07] |
| thermal-equilibrium | Thermal Equilibrium / 热平衡 | 02；同温且无净传热。[H04] |
| insulation | Insulation / 隔热† | 03；减慢进出物体的热传递。[H08] |
| heating-curve | Heating Curve / 加热曲线† | 04；本课温度随时间的加热模型图。[D01] |
| cooling-curve | Cooling Curve / 冷却曲线 | 05；本课温度随冷却时间的模型图。[D02] |
| mass | Mass / 质量 | 04；以克控制水量，不靠外观高度猜。[H18,D01] |
| power | Power / 功率 | 04；单位时间供能，单位瓦。[D01] |
| expansion | Expansion / 膨胀 | 06；所给条件下尺寸增加。[H12] |
| contraction | Contraction / 收缩 | 06；所给条件下尺寸减小。[H12] |
| fair-test | Fair Test / 公平测试 | 07；保持相关条件相同以比较改变的量。[H10,D08] |
| temperature-difference | Temperature Difference / 温差 | 05；两个温度的差。[H19] |

首次EN/ZH各Term一次。J/K/latent heat等不全部塞进儿童弹窗，正文未使用的词不发布。

### 6.2 来源表

S沿用母 dossier；自然事实引H/M，DESIGN/SIM引D及S27自描述设计研究。后续生产sources.json中S27必须写完整参数、公式与忽略项，不能只写internal source。

| ID | 来源/出版者 | 访问与许可/用途限制 |
|---|---|---|
| S01 | [Primary Science Syllabus 2023, updated May 2024](https://www.moe.gov.sg/-/media/files/primary/syllabus/2023-primary-science.ashx) / Singapore MOE | Current search-index text + previously fetched local PDF text；Reference only; all rights reserved。Printed pp.76–77; live PDF returned human-verification gate, not bypassed. Cached fetch provenance and quote verification in syllabus-verification.json. |
| S02 | [College Physics 2e: 13.1 Temperature](https://openstax.org/books/college-physics-2e/pages/13-1-temperature) / OpenStax / Rice University; Urone and Hinrichs | full text；CC BY-NC-SA 4.0 (current web edition)。Current preface S18 governs this web edition; older mirrors label earlier versions CC BY 4.0. Individual third-party image licences require separate checks; no images copied. |
| S03 | [College Physics 2e: 14.1 Heat](https://openstax.org/books/college-physics-2e/pages/14-1-heat) / OpenStax / Rice University; Urone and Hinrichs | full text；CC BY-NC-SA 4.0 (current web edition)。Current preface S18 governs this web edition; older mirrors label earlier versions CC BY 4.0. Individual third-party image licences require separate checks; no images copied. |
| S04 | [College Physics 2e: 14.5 Conduction](https://openstax.org/books/college-physics-2e/pages/14-5-conduction) / OpenStax / Rice University; Urone and Hinrichs | full text；CC BY-NC-SA 4.0 (current web edition)。Current preface S18 governs this web edition; older mirrors label earlier versions CC BY 4.0. Individual third-party image licences require separate checks; no images copied. |
| S05 | [College Physics 2e: 13.2 Thermal Expansion of Solids and Liquids](https://openstax.org/books/college-physics-2e/pages/13-2-thermal-expansion-of-solids-and-liquids) / OpenStax / Rice University; Urone and Hinrichs | full text；CC BY-NC-SA 4.0 (current web edition)。Current preface S18 governs this web edition; older mirrors label earlier versions CC BY 4.0. Individual third-party image licences require separate checks; no images copied. |
| S06 | [College Physics 2e: 14.2 Temperature Change and Heat Capacity](https://openstax.org/books/college-physics-2e/pages/14-2-temperature-change-and-heat-capacity) / OpenStax / Rice University; Urone and Hinrichs | full text；CC BY-NC-SA 4.0 (current web edition)。Current preface S18 governs this web edition; older mirrors label earlier versions CC BY 4.0. Individual third-party image licences require separate checks; no images copied. |
| S07 | [College Physics 2e: 14.3 Phase Change and Latent Heat](https://openstax.org/books/college-physics-2e/pages/14-3-phase-change-and-latent-heat) / OpenStax / Rice University; Urone and Hinrichs | full text；CC BY-NC-SA 4.0 (current web edition)。Current preface S18 governs this web edition; older mirrors label earlier versions CC BY 4.0. Individual third-party image licences require separate checks; no images copied. |
| S08 | [College Physics 2e: 13.3 The Ideal Gas Law](https://openstax.org/books/college-physics-2e/pages/13-3-the-ideal-gas-law) / OpenStax / Rice University; Urone and Hinrichs | full text；CC BY-NC-SA 4.0 (current web edition)。Current preface S18 governs this web edition; older mirrors label earlier versions CC BY 4.0. Individual third-party image licences require separate checks; no images copied. |
| S09 | [Newton’s Law of Cooling](https://www.khanacademy.org/science/physics/thermodynamics/temp-kinetic-theory-ideal-gas-law/a/newtons-law-of-cooling) / Khan Academy | 本轮无法独立读取正文；H19/H28改由S29复核；Reference only; asset reuse not cleared。Only equation and independent original implementation; no media copied. |
| S10 | [Cold Metal](https://www.exploratorium.edu/snacks/cold-metal) / Exploratorium Teacher Institute | full text；CC BY-NC-SA 4.0。Licence explicitly displayed on page. Conceptual reference, no image download. |
| S11 | [Family Conversations About Heat and Temperature: Implications for Children’s Learning](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.01718/full) / M. R. Luce and M. A. Callanan / Frontiers in Psychology 11:1718 (2020) | full text；CC BY 4.0。Naturalistic conversation study, not Singapore P4 prevalence; separate original findings from review of older research. |
| S12 | [Heating metal and wood](https://arbs.nzcer.org.nz/resources/heating-metal-and-wood) / NZCER Assessment Resource Banks | full diagnostic text；Reference only; no asset reuse clearance。NZ Year 6 trial, dated 11/2004. Do not generalise prevalence to Singapore; some teaching suggestions simplify thermal storage. |
| S13 | [Children’s conceptions of heat and temperature (1979), Science Education 63:221–230](https://onlinelibrary.wiley.com/doi/10.1002/sce.3730630210) / G. L. Erickson / Wiley | metadata only；Restricted; subscription。Do not attribute specific interview results without full text; historical lead only. |
| S14 | [Climate of Singapore](https://www.weather.gov.sg/climate-climate-of-singapore) / Meteorological Service Singapore | full text；Reference only; no redistribution clearance。1991–2020 normals, not today’s weather or a school-lab measurement. |
| S15 | [Sembawang Hot Spring Park](https://www.nparks.gov.sg/visit/parks/park-detail/sembawang-hot-spring-park/) / NParks | full text；Reference only; no image/data reuse clearance。Collection-point temperature is location-specific. At access, banner says closed for urgent maintenance until 30 Oct 26. No visit recommendation or opening-hours content in static lesson. |
| S16 | [English–Chinese Physics Glossary (2020)](https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/ref-and-resources/PhyGlossary_2020.pdf) / Hong Kong Education Bureau | official PDF via web + existing local cache；Reference only; all rights reserved。Traditional forms attested; simplified forms are editorial character conversions, not evidence of Singapore usage. |
| S17 | [English–Chinese Science (S1–3) Glossary (2017)](https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/ref-and-resources/SciGlossary_2017.pdf) / Hong Kong Education Bureau | official PDF via web + existing local cache；Reference only; all rights reserved。PDF page locators below are one-based, not printed pagination. |
| S18 | [College Physics 2e — Preface / licence](https://openstax.org/books/college-physics-2e/pages/preface) / OpenStax | full text；CC BY-NC-SA 4.0。Licence checked live; no reliance on old CC BY mirrors. |
| S19 | [地热可助我国能源多元化？ (5 March 2025, p.3)](https://www3.ntu.edu.sg/corpcomms2/Documents/2025/03_Mar/LHZB_050325_Geothermal_energy_Yishun.pdf) / 联合早报, hosted by NTU | full PDF text via web；Reference only; newspaper copyright。Used only to attest Singapore Chinese terms 温度、摄氏度、热量、热能、传导、热水、蒸汽; no clipping or photograph reused. |
| S20 | [University Physics Vol.2 §1.3 Thermal Expansion](https://openstax.org/books/university-physics-volume-2/pages/1-3-thermal-expansion) / OpenStax | full text；Reference only in this plan; no figures copied。Water anomaly, free expansion and microscopic explanation; do not reuse third-party bridge photo. |
| S21 | [University Physics Vol.2 §1.6 Mechanisms of Heat Transfer](https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer) / OpenStax | full text；Reference only in this plan; no figures copied。 |
| S22 | [Singapore Open Data Licence v1.0](https://data.gov.sg/open-data-licence) / data.gov.sg | full text；Singapore Open Data Licence; outside explicit round-2 whitelist。Open does not automatically mean cleared by this brief; optional weather dataset rejected for this preparation. |
| S23 | [Atlas existing topic: aircon](../../../src/content/topics/aircon/topic.yaml) / Atlas | local production content；Existing Atlas content; project content licence。Published status read from topic.yaml on preparation date. |
| S24 | [Atlas existing topic: energy-conversion](../../../src/content/topics/energy-conversion/topic.yaml) / Atlas | local production content；Existing Atlas content; project content licence。Published status read from topic.yaml on preparation date. |
| S25 | [Atlas existing topic: states-of-matter](../../../src/content/topics/states-of-matter/topic.yaml) / Atlas | local production content；Existing Atlas content; project content licence。Published status read from topic.yaml on preparation date. |
| S26 | [Atlas existing topic: materials](../../../src/content/topics/materials/topic.yaml) / Atlas | local production content；Existing Atlas content; project content licence。Published status read from topic.yaml on preparation date. |
| S27 | [Atlas Heat design study](./spec-draft.md#4-引擎与模拟契约) / Atlas | authored model；Original Atlas content; intended CC BY-NC-SA 4.0。All apparatus dimensions and lump parameters are educational DESIGN; all numeric results SIM, not observed rates. Equations grounded in S04/S06/S09/S20. |
| S28 | [Air Temperature across Singapore — optional dataset catalogue](https://data.gov.sg/datasets?query=air%20temperature) / NEA / data.gov.sg | catalogue lead only；Singapore Open Data Licence; not cleared by whitelist。Not required; no API queried, no data downloaded, no runtime fetch planned. Current station coverage not verified. |


访问日期均2026-10-27，缓存最初抓取日期另见syllabus-verification。版权不混：当前OpenStax/Exploratorium衍生家族NC-SA，无SA输入；所有图均未抄原图。完整拒绝理由与0下载在datasets.json和data/INVENTORY.md。未来若引SA网格/图片，必须独立文件和LICENSE-CONTENT carve-out，不能并入NC-SA参数或合成同图。ODbL/ODC-BY获本轮许可但本课不需要。

### 6.3 本轮来源补证

S29：[OpenStax Calculus Volume 2 §4.3 Separable Equations](https://openstax.org/books/calculus-volume-2/pages/4-3-separable-equations)，Newton cooling 小节及 Example 4.13，2026-10-27 已读正文。支持 H19/H28 固定环境下指数趋近；k = −U/C 是 Atlas 独立模型换元，恒功率扩展为 DESIGN。S09 本轮取不到正文，不再宣称 transcript verified；事实号不变，来源增加 S29。

## 7. 图像清单与文字

| 文件（art/planned/heat） | 用途/尺寸 | 图注EN / ZH | 核查 |
|---|---|---|---|
| heat.png | cover1024×1024；00/01 | A thermometer measures water temperature. / 温度计测量水温。[H05,H22] | 1杯1温度计，球泡浸入不触底/壁，夹具和支架完整；无刻度不推温度 |
| heat-spoons.png | figure1536×1152；02 | Comparable spoon shapes in the same bath. / 相同温浴中两支形状可比的勺子。[H06,H07,H10,D03] | 恰好2勺，凹碗都浸入；完整连续柄，金属/塑料表面不同 |
| heat-expansion.png | figure1536×1152；06 | Expanded ball above a ring kept at its original temperature; size change exaggerated. / 膨胀球在保持原温的环上方；尺寸变化已夸大。[H12,H13] | 1球1环2柄，球宽于孔；不推真实热胀幅度 |

三图built-in image_gen：cover/spoons各1次，expansion2次，首次球小于孔故拒绝。最终逐张打开，R=G=B逐像素、alpha透明边缘、精确尺寸经验证（image-qa.json）；完整prompt见image-prompts.json；manifest.jsonl写subject/checks/tries。BRIEF2 DeliverableC替代首轮旧图要求。

邻课图的考虑与不适用原因在art-reuse-review.json。新增3、复用0，无伪造reusedFrom。禁止PNG内文字/数字/箭头/旗帜/纸纹/背景/边框/地面阴影；图注放页面双语文字。

## 8. 后续施工顺序与验收

这是后续build验收清单，非声称本次已跑应用测试。

1. 内容定稿后E-H1 schema/solver，钉死解析数值、符号、能量账与合法域。
2. E-H3记录context/预测遮蔽失效；E-H2同solver采样的curve/SVG/值表。
3. 原创几何写实、接触/浸入/自由端检查、signed热流及offset。
4. MDX、sources/glossary、37拍，保持fact→source与DESIGN/SIM一致。
5. 施工完成跑 check / validate / test / build；按本轮 brief 跳过全部 browser gates，由主会话以端口 5443 验收。

- [ ] 8章37拍，双语完整，EN caption≤45词；labels≤6且可见，索引覆盖提到的对象。
- [ ] 所有自然事实有H/M、设计有D；不把文献样本泛化新加坡P4。
- [ ] 七控件默认/合法值一致；cool-start-c含5；T3/T5质量200g；浴温和tip初温分开。
- [ ] §4解析数值、反向冷浴、能量恒等式与边界校验通过；不越过95°C造假平台。
- [ ] 所有output from存在、单位/kind/state枚举正确；同一时刻图/PLATE/marker/表行相等。
- [ ] 曲线101点含端点，无过冲；轴0–300s与0–100°C；移动游标不重算全曲线。
- [ ] 等待不改变温度；深链、换章、拍、REFERENCE、reduced-motion都恢复相同显式时刻。
- [ ] 改非vary条件清表并提示；改时间保留同实验行；相同vary覆盖；≤12行。
- [ ] 预测前遮蔽答案读数/曲线/PLATE/caption，揭示后同步；条件变更旧预测失效。
- [ ] 杆端500倍只作用独立marker，PLATE仍0.072mm；气体/液体不套杆输出。[D04,H22,H27]
- [ ] 薄壁玻璃、水面水平、probe浸水不触底、勺碗浸深可比；材料不靠颜色单独区分。
- [ ] 外部维持温浴说明可见；不声称求解有限水杯+勺子的封闭能量账。[D03]
- [ ] 三张PNG、manifest与哈希一致；只用最终球环图；每个派生文件有明确许可家族。
- [ ] 无运行时远程请求；PWA离线全部交互可用；无CDN/字体/图片API。
- [ ] 触控≥44px，键盘及读屏趋势摘要；EN/ZH、paper/cinema、390宽均可读。
- [ ] 后续pnpm check / validate / test / build / e2e（先build）；shoot heat --layout --keys --beats并逐张打开核查。

## 9. 施工记录

### 9.1 E-H1–E-H3 引擎交付

- **E-H1**：`heat-schema.ts`、`lib/sim/heat.ts`，注册heat kind / quantity / states / units / validation / separate experiments；无时间线通道。`solveHeatAt(heat, values, seconds)`为唯一解析求值入口，`solveHeat`读取time控件。数值源支持常数、带物理单位的step、choice完整数值映射；容量支持正数或mass×specific。四个独立lump、一个杆、一个tips compare，七控件、24输出与§4.7一致。
- **E-H2**：`curve.ts`、`TryCurve.tsx`。作者写`curve: {x: elapsed-s, y: [heated-c], samples: 101}`；采样不写store，游标不进缓存键。固定0–100℃纵轴，0–300s本课域；全轨迹、当前游标、双语趋势、六行模型值表与手工表分开；回零按钮复用setSim。`engine.sim().curve`返回`{x,domain,series:[{id,points:[{x,y}]}],cursor:{x,values}}`。
- **E-H3**：`trial.ts`、`session.ts`与UI状态。记录context为章+排序后的全部resolved controls（排除vary），保持量改变清表并提示，vary变化保留行，同值覆盖、最多12行。预测保存before/after/restore条件快照；条件改变作废。热课未揭示时reader/PLATE/curve一致遮蔽；旧主题读数不受新增遮蔽影响。
- **可复核夹具**：draft `sample-heat`，六张try卡覆盖全部新能力；`tests/space-scene/fixtures/heat-bench.ts`是七控件/24输出的可复制作者模板。`tests-e2e/sample-heat.spec.ts`八场景；生产`tests-e2e/heat.spec.ts`四场景。浏览器测试已编写、未运行。

### 9.2 最终契约澄清与差异

1. 数值step引用额外校验物理单位；heat.time禁止兼作其他模型参数。这样每条轨迹的参数恒定，端点域校验及“不含游标的曲线缓存”才成立；属于对§4恒参数模型的精确限制，没有加物理求解范围。
2. 新增章/拍`sim.reveal: true`，只在相应作者条件仍然成立时揭示讲解读数；自由探索的“Show current result / 显示当前结果”只记录当前条件的UI揭示，不修改控制量，不复活旧预测。更改条件后需重新显示；避免预测按钮把任意时刻拉回固定预测情景。这是生产联调发现的必要最小修正。
3. `telemetry.lag: 0`现已严格支持立即值；旧代码把0当默认滞后，已修正并有回归测试。
4. 温度marker用offset；固定参考杆仅移动独立500倍指示。水位固定为示意，不建质量→体积求解器。液柱、活塞、球环共六个定性pose；静态液柱玻璃套/球泡并入bench context，只有液柱本身变长，说明写入part detail。
5. Hero镜头改为position[2.6,2.2,3.25]、target[0,0.55,0]；expansion改为[0.70,1.30,0.70]、target[0.32,0.85,−0.22]，其余近景目标作局部器材中心修正。CPU投影六预设最大归一化范围≤0.80；这不是浏览器截图验收。
6. 术语temperature-difference在真正首现第01章标记，早于建议第05章；全16词每种语言各一次。S01–S08按生产schema变为S1–S8；H/M/D事实号不变。Khan正文不可复取，H19/H28改由S29已读正文补证。
7. 参数与曲线编译进parts.sim，原创几何/图/独立公式输出没有复用第三方资产或整表。没有新增许可例外；S27与data/SOURCES.md保留代表物性出处及原创参数、方法、忽略项。准备稿的“未来heat-parameters.json”不作为额外加载文件或下载数据集交付。

### 9.3 内容与几何交付

`heat/topic.yaml`保持published。8章（背景1+主线7）、37拍、六张非评分try卡、四个分组、34个语义器材+context bench、六预设、两条各48点的signed能量示意流、六定性pose；18来源、16术语；封面两密度+两幅章图。程序化数据生成器为`scripts/geo/heat/build-parts.ts`。既有六邻课链接均指向已存在章，不增加未上线sibling链接。

薄壁敞口杯、水面、同浸深凹勺、支承探头、有孔环、自由杆端均做结构检查。probe bulb距内底有间隔且浸没、clamp与stem接触；钢杆数字保真、marker位移0.036m对应0.072mm计算伸长。CPU几何统计50材质槽、60,276三角形；实际renderer draw calls、帧率与手机构图未测，预算不写作实测通过。

插图使用MAIN approved PNG，无需重绘；`scripts/illustrate.ts`输出：heat.webp800×800约57KB、heat@2x.webp1600×1600约144KB、heat-spoons1200×900约76KB、heat-expansion1200×900约71KB。三张原图已逐张查看，WebP保留本地透明图版。数据/事实限制和逐章Gavin后审项见`heat/REVIEW.md`及`AUDIT.md`。

### 9.4 门槛与主会话后续

- 引擎阶段：heat27项通过；validate58主题零错误/警告；Astro零错误/警告、TypeScript通过；build119页通过。首次重叠门槛造成旧energy守恒用例超时，其他4317项通过；停止构建后单独64/64通过，无数值断言差异。
- 最终内容门槛结果在本节末追加。
- 按本轮brief明确跳过全部`pnpm shoot`与`pnpm e2e`；没有用户浏览器/桌面操作。主会话以`ATLAS_E2E_PORT=5443`在build后跑e2e；补EN/ZH、paper/cinema、390×844、所有拍的引线/镜头、离线和draw calls验收，以及states-of-matter/materials/energy-conversion/light-and-shadows的视觉回归。不能把CPU投影当布局验收。
- 未做git写操作、未改package.json/lockfile或review-queue/next-batch。published首页smoke计数改为35主题、70badges、science11，末图版35；draft夹具不计入。

**最终验收（2026-10-27）**：`pnpm check`通过，776文件零错误/警告、3个既有hint；`pnpm validate`通过，59主题零错误/警告；`pnpm run test --maxWorkers=1`通过，165文件、4,329/4,329测试（211.17秒）。默认并行全套为4,328通过、旧energy守恒用例超时；串行同用例约2.22秒、64/64通过，无修改旧用例或超时。`pnpm build`通过，121静态页、148 precache entries（106.49秒），其内置validate仍为59主题零错误/警告。`git diff --check`通过。所有浏览器门槛依brief未运行。
