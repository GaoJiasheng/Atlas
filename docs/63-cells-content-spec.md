# 细胞 · 内容施工 spec（cells · SpaceScene + 显微镜试一试）

2026-10-29 · 本轮授权定稿并施工；决策表采用供 Gavin 复核的默认值。父 dossier：准备阶段完成的 `cells-research.md`、`facts.json`、`datasets.json`。本主题独立成题，无 sibling。原型为生物细胞模型 + 精密光学仪器，程序化几何；paper 默认，cinema 同等支持。下文所有事实指向父 dossier 的 F-*；设计决定也有 F-D*，不伪装成实测。

## 0. 决策与默认值

| # | 默认决定 | 依据 / 状态 |
|---|---|---|
| D1 | 主题为 cells；EN Cells / ZH 细胞；subject biology；engine space-scene；stage model3d；status published | 本轮用户指定；创建 topic.yaml |
| D2 | 背景章 + 7 章，共 40 拍；主要学习问题是结构、作用与观察证据的关系 | F-C01,F-B04–F-B12 |
| D3 | 明示 2023 只有“基本单位”核心锚点；细胞结构、液泡及显微镜按用户指定作深化；2014 Cell System 只作历史说明 | F-C01–F-C05；不得把旧纲冒充新纲 |
| D4 | 典型光合植物细胞、扁平上皮细胞模型；洋葱鳞茎、绿色水草叶、预制口腔上皮三种模拟玻片 | F-B04,F-E01,F-D04 |
| D5 | 显微镜试一试只提供安全的微调，不开放粗调载物台；识别粗调节器但不驱动 | F-M07–F-M09；设计选择 |
| D6 | 不使用生物样本采集、染色药剂、切片刀操作或微生物培养指令；真实课堂使用预制玻片并听从教师 | F-M03,F-M06；编辑选择 |
| D7 | 不从 plant 等主题复制器官 mesh；跨主题链接 + 一张复用的生成式心肺插图足够 | F-REP01,F-L02；避免 BY-SA/BY-NC-SA 混合 |
| D8 | 模型与观察分开显示；细胞独立放大 2000×，膜/壁厚度另作可见性夸张；不得声称这是实际显微镜影像 | F-D04,F-D06 |
| D9 | 不需要地图、TimeScene、地理数据或预取。B 的零下载说明已交付 | data/INVENTORY.md |
| D10 | 复用一张系统联系图；生成封面和显微镜图；确切检查、来源、尝试次数在 art manifest | F-D05–F-D06 |

### 0.1 采用默认值，供 Gavin 复核

默认保留完整 7 章，将 enrichment 状态放在课纲说明而非面向儿童的技术警告中。细胞精细结构主线与细看分工按本规格执行，Gavin 可在 REVIEW 中复核。本轮用户已授权定稿、构建并指定 published；默认值逐项列入 REVIEW.md，毋须再次审批。

## 1. 课纲对照与范围

### 1.1 2023 原文与页码

| F id | 逐字短引 / 完整释义 | PDF 定位 | 拍 |
|---|---|---|---|
| F-C01 | “Recognise that a cell is a basic unit of life.” | 印43 / PDF44，P5 Standard reproduction，Core Ideas 第1条 | 00.1、00.3、07.1 |
| F-C03 | “Identify the different parts of plants and state their functions.” | 印56 / PDF57，P4 Plant parts | 00.2、07.2，链接 plant |
| F-C04 | 释义：P4 辨认消化系统部位及作用；P5 Standard 认识消化、呼吸、循环系统协同，并比较植物与人的运输 | 印53–54 / PDF54–55；植物运输印57 / PDF58 | 07.3–07.4 |
| F-C02 | 全文审计：没有 Cell System / microscope / chloroplast / vacuole / cytoplasm / nucleus | syllabus-verification.json，87页全文 | 01–06 属本任务要求的深化 |

上表只重复相同两条短引；同一来源的独特引文合计 20 词。页码和逐字子串由缓存原件验证。2014 的历史对照另见 F-C05，不能用它声称 2023 考试要求。社会科不是本主题直接锚点。

### 1.2 主线、细看、边界

| 主线 | 细看 | 不展开 |
|---|---|---|
| 生命基本单位；共同三结构；植物的壁、叶绿体、大液泡；部位→作用；低倍找标本、居中、微调 | 动物细胞也可有小囊泡；核不一定居中；微观观察的对比度；倍率与分辨率不同 | ATP、生化反应式、膜双层分子、渗透压计算、细胞分裂阶段、遗传概率、染色体计数、疾病诊断 |
| F-B01–F-B12,F-M04–F-M11 | F-B12–F-B13,F-R01,F-M02–F-M03 | 编辑范围决定 |

### 1.3 学习目标与误解

| 学完能做的事 | 误解 / 证据 | 对应拍 |
|---|---|---|
| 用结构和作用比较细胞 | 墙代替膜是错误推断；植物有两者 F-B08 | 02.1–02.4、03.1–03.5 |
| 旋转模型后仍识别相同部位 | 平面细胞、固定位置/颜色 F-R02 | 00.5、02.5 |
| 以标本反例检查全称说法 | 所有植物细胞都有叶绿体、核永远在中央 F-R01 | 03.5、04.1–04.5 |
| 分清物体大小、图像放大与清晰度 | 倍率≠分辨率 F-M02；大生物→大细胞误解 F-R03 | 05 全章；00 细看 |
| 以低倍定位并比较同一标本 | 视野和图像倒置 F-M01、F-D02 | 05.4、06 全章 |

### 1.4 与已发布主题分工

| 路由 slug | 已核状态 | 此处链接文字 EN / ZH | 分工 |
|---|---|---|---|
| plant | published | Follow a whole plant / 回到整株植物 | 此处放大一个细胞；对方解释根茎叶与运输 |
| living-things | published | Compare living things / 比较不同生物 | 此处说明单细胞/多细胞；对方拥有分类与更多生物 |
| digestive-system | published | Follow digestion / 沿消化道看下去 | 此处说明器官由组织构成；对方拥有消化和吸收路径 |
| heart-and-lungs | published | Follow oxygen and blood / 继续看氧气与血液 | 此处用系统作为细胞的整体背景；对方拥有肺/心/血管过程 |

反向链接各补一句：plant / leaves-make-food、living-things / alive-or-not、digestive-system / small-intestine-chapter、heart-and-lungs / three-systems，指向本主题相应结构或系统章节。

路由按现有 locale 主题链接 helper 生成；施工时查对应章 id，只使用已存在章 id。证据 F-REP01。中文独立成文，caption EN ≤45词，专有词首现解释；不拟人，不用统一形状做唯一分类依据。[F-R02]

## 2. 事实表（TYPICAL / DESIGN / SIM）

| 类 | 内容 | 数值 / 限定 | 父事实 |
|---|---|---|---|
| 生物事实 | 三共同结构、壁在膜外、光合叶细胞有叶绿体、成熟植物常见大液泡 | “典型”“本标本”；不强加所有细胞都有核或所有植物细胞都有叶绿体 | F-B04–F-B13,F-E01 |
| 观察事实 | 多数细胞需显微镜；染色与薄标本有助观察；焦平面限制；常规复式像倒置 | 不把核是否看见当成有无核判断 | F-B02,F-M01–F-M03,F-M10–F-M12 |
| DESIGN | 目镜、物镜、视场数 | 10×；4×/10×/40×；18mm | F-D01 |
| SIM | 倍率 M = ocular × objective | 40 / 100 / 400 | F-D01 |
| SIM | 物方视野 D = 1000 × fieldNumberMm / objective | 4500 / 1800 / 450 µm | F-D02 |
| DESIGN | 焦点容差 w | 4×→20µm；10×→8µm；40×→2µm；线性清晰度仅是教学代理量 | F-D03 |
| DESIGN | 放大细胞名义尺寸 | 叶细胞80×40×25µm；上皮细胞60×45×8µm；放大2000×；膜壁厚度单独夸张 | F-D04,F-D06 |
| DESIGN | 图像数量 | 封面植物模型6个叶绿体、1核、1大液泡；动物1核；不规定真实数量 | F-D05 |

### 2.1 算例（显示 SIM）

40×物镜时，10×目镜×40× = 400×；视野直径18000/40 = 450µm。若校准目标宽100µm，其跨度占22.222…%，对比4×物镜时2.222…%。[F-D01–F-D02] 洋葱目标核中心 x=200µm，slide-x=−200µm 时在视野中心；移到−100µm 时，投影 u=−100/225=−0.444444…。核没有移动到细胞另一处，是玻片与成像移动。[F-D04,F-M01] 40×下焦差1µm：clarity=1−1/2=0.5；焦差2µm：0。此值不是光学分辨率或实测质量。[F-D03]

### 2.2 来源使用纪律

模型数字对应 S20（施工时为 design:true 的设计研究来源）：写全输入、公式、结果与非实测声明。事实仍引用各原始 S#；迁入 sources.json 可重排但必须保留 F-id→S-id 对照。正文数字用 `<Num s>`；纯文本 caption 和 part.detail 用 source refs，数值写明“这个模型”。真实结构和课纲事实不得引设计研究冒充外部证据。

## 3. 对象、分区与零件

### 3.1 分区、坐标和尺度

| 分区 id | EN / ZH | 内容与 token |
|---|---|---|
| animal-cell | Animal cell / 动物细胞 | 膜、质、核；token:neutral |
| plant-cell | Plant cell / 植物细胞 | 壁、膜、质、核、叶绿体、液泡；token:seedling / neutral；颜色是解释编码 |
| microscope-bench | Microscope / 显微镜 | 通用仪器、玻片；token:ink-2 |
| tissue-context | Tissue / 组织背景 | 洋葱片、叶、组织、肠段、身体背景；token:neutral；card:false |

单位为m，Y向上、+Z向观者。显微镜中心(0.20,0.18,0)，高0.35m，基座0.18×0.03×0.14m；植物模型中心(−0.10,0.12,0)，包络0.16×0.08×0.05m；动物模型中心(0.10,0.10,0)，包络0.12×0.09×0.016m。显示模型只在对应章出现；显微镜仪器与细胞模型不按同一真实比例。全主题 note EN: “Model study · cells enlarged separately · microscope field simulated”; ZH: “模型研究 · 细胞另行放大 · 显微视野为模拟”。全部尺寸为 F-D04/F-D06 的设计值。

细胞膜/壁用薄壳 bevelBox / extruded ring，细胞质用半透明体，核与叶绿体用缩放 sphere；优先既有 primitive，不需真实人体 mesh。薄壳按已支持的 extra/repeat 组合；细胞质透明体不能把中央液泡填成第二层实心细胞质。[F-B06,F-B10,F-D04]

### 3.2 零件表（29个逻辑零件）

| id | EN / ZH | group | 几何 / DESIGN中心 | summary 要点与核查 |
|---|---|---|---|
| animal-membrane | Cell membrane / 细胞膜 | animal-cell | 薄椭圆壳，(0.10,.10,0) | Regulates passage / 调节物质进出；shell:true；F-B05 |
| animal-cytoplasm | Cytoplasm / 细胞质 | animal-cell | 扁椭球，(0.10,.10,0) | Supports reactions / 进行多种反应；透明、核留空；F-B06 |
| animal-nucleus | Nucleus / 细胞核 | animal-cell | 椭球，(.115,.10,.001) | Holds instructions / 保存指令并参与控制；F-B07 |
| plant-cell-wall | Cell wall / 细胞壁 | plant-cell | 圆角长方壳，(−.10,.12,0) | Supports cell / 支持保护；在膜外，shell:true；F-B08 |
| plant-membrane | Cell membrane / 细胞膜 | plant-cell | 壁内独立薄壳，(−.10,.12,0) | Regulates passage / 调节进出；独立于壁，shell:true；F-B05,F-B08 |
| plant-cytoplasm | Cytoplasm / 细胞质 | plant-cell | 薄外围体；(−.10,.12,0) | Supports reactions / 进行多种反应；不填入液泡；F-B06 |
| plant-nucleus | Nucleus / 细胞核 | plant-cell | 侧面椭球；(−.169,.12,0) | Holds instructions / 保存指令；在液泡外；F-B07,F-D04 |
| plant-chloroplasts | Chloroplasts / 叶绿体 | plant-cell | 6个ellipsoid，repeat，沿外围 | Make food in light / 光合作用制造食物；数量DESIGN；F-B09,F-D05 |
| plant-vacuole | Large vacuole / 大液泡 | plant-cell | 中央圆角透明体；(−.10,.12,0) | Contains cell sap / 容纳细胞液；非空气；F-B10–F-B11 |
| scope-base | Base / 底座 | microscope-bench | bevelBox；(.20,.015,0) | Supports instrument / 稳固支撑；F-M05 |
| scope-arm | Arm / 镜臂 | microscope-bench | extrude弧形；(.25,.18,−.03) | Supports head / 支撑镜头机构；F-M05–F-M06 |
| scope-eyepiece | Eyepiece / 目镜 | microscope-bench | 倾斜cylinder；(.18,.33,0) | Magnifies image / 再次放大；F-M04 |
| scope-tube | Body tube / 镜筒 | microscope-bench | cylinder；(.18,.28,0) | Aligns optics / 对齐光学路径；F-M05 |
| scope-turret | Nosepiece / 物镜转换器 | microscope-bench | disc；(.18,.23,0) | Selects objective / 切换物镜；F-M05 |
| scope-objective-four | Scanning lens / 最低倍物镜 | microscope-bench | 短cylinder；基准在光轴上 | Magnifies specimen / 初步放大；4× DESIGN；F-D01 |
| scope-objective-ten | Low lens / 低倍物镜 | microscope-bench | 中cylinder；停靠偏轴 | Magnifies specimen / 初步放大；10× DESIGN；F-D01 |
| scope-objective-forty | High lens / 高倍物镜 | microscope-bench | 长cylinder；停靠偏轴 | Magnifies specimen / 初步放大；40× DESIGN；F-D01 |
| scope-stage | Stage / 载物台 | microscope-bench | 4块薄板围光孔；(.18,.17,0) | Supports slide / 托住玻片；F-M05 |
| slide-glass | Slide / 载玻片 | microscope-bench | 薄bevelBox；(.18,.172,0) | Supports specimen / 承载薄标本；F-M10 |
| coverslip-glass | Coverslip / 盖玻片 | microscope-bench | 小薄box；光孔上方 | Covers specimen / 覆盖标本；结构参考S06，F-M10 |
| scope-condenser | Condenser / 聚光镜 | microscope-bench | cylinder；(.18,.135,0) | Concentrates light / 集中照明；F-M05 |
| scope-illuminator | Illuminator / 光源 | microscope-bench | base内disc；(.18,.04,0) | Illuminates slide / 从下方照明；F-M05 |
| scope-coarse-focus | Coarse knob / 粗调节器 | microscope-bench | 大cylinder；(.26,.16,0) | Identifies coarse focus / 辨认粗调；不开放驱动；F-M08 |
| scope-fine-focus | Fine knob / 微调节器 | microscope-bench | 同轴小cylinder；(.27,.16,0) | Refines focus / 细调焦平面；F-M08 |
| onion-patch | Onion epidermis / 洋葱表皮 | tissue-context | 3×3薄壳示意片；(−.10,.12,0) | Shows joined cells / 展示相邻细胞；F-E01,F-D04 |
| leaf-context | Leaf / 叶 | tissue-context | 薄extrude；(−.20,.20,−.03) | Relates cell to leaf / 从细胞连回叶；F-C03 |
| tissue-patch | Tissue patch / 组织示意 | tissue-context | 相邻ellipsoid组；(0,.12,0) | Relates cells to tissue / 从细胞连到组织；F-B03 |
| intestine-context | Small intestine / 小肠 | tissue-context | 简化曲tube；(.16,.12,−.03) | Relates tissue to organ / 从组织连到器官；F-B03,F-C04 |
| body-context | Body outline / 身体轮廓 | tissue-context | 简化身体轮廓；(.20,.14,−.05) | Relates organ to system / 从器官连回系统；F-C04 |

上表29个逻辑零件（9细胞 + 15仪器 + 5背景）；几何重复不增加逻辑零件数。索引中的所有 id 必须在 parts 表存在。膜和壁 shell；核、叶绿体是可选对象，液泡透明可选；context示意不是医学解剖。plant-chloroplasts 的六份保持一逻辑零件与一标签；微观图像不显示内部类囊体。计数属 F-D04–F-D06。

植物内部几何DESIGN：大液泡size[.12,.06,.04]、中心[−.10,.12,0]；核中心[−.169,.12,0]、size[.014,.012,.012]，核最右x=−.162，小于液泡最左x=−.160，间隙.002m；核最左x=−.176在膜内侧界x≈−.178以内。6叶绿体中心x∈[−.15,−.10,−.05]、y∈[.084,.156]、z=0，size[.014,.004,.008]，保持在液泡外、膜内；这些是可读模型的人工放大结构，不当实测。细胞质壳用6个薄体组合并排除液泡/核的内部体积；薄外壳使用已有extrude.holes或extra薄板，避免全盒透明套全盒的重叠。shell厚度与视觉偏移在note解释。[F-D04–F-D06]

### 3.3 Tier-1 与 reference plan

| 关键画面 | 必须看见 | 参考 / 许可 |
|---|---|---|
| 植物剖开 | 壁外膜内、外围质和叶绿体、液泡外的侧核 | S04正文；S17 PD SVG；F-B05–F-B11 |
| 动物剖开 | 薄膜、细胞质、一个示例核；不画壁或叶绿体 | S04正文；S18 PD SVG；F-B04–F-B07,F-B12 |
| 显微镜 | 1目镜、3不同长度物镜、同轴调焦、光源→聚光镜→光孔→玻片→物镜连续 | S07页面参考，不复制照片；F-M05,F-D06 |
| 洋葱 vs 水草 | 连续植物细胞边界；洋葱无叶绿体；水草叶绿体在周边，不在液泡内 | S08/S19文字；F-E01,F-M12 |

Reference 来源当前均为列出，不擅自下载受限照片；开放HTML小样在 sources/，各自hash在 datasets.json。施工参考图只从已核开放许可资产取，不依赖外链。[F-L01–F-L02]

### 3.4 流、动画、模式与预算

- 无常动粒子流；不把细胞物质运输画成未定义的管路，不把细胞膜画成许多大洞。[F-B05]
- 物镜选择使用三套完整 poses；每套摆正一个物镜，另外两个离轴并与玻片保持正间隙；不使用按可视rpm自转的假仪器。stage、slide、coverslip水平位移同步；微调仅转动小旋钮，stage真实微小变化不夸大成危险接触。[F-M07,F-D04,F-D06]
- xray：膜/壁透明，内件仍有边界。cutaway：切掉前方一部分，不能让核的label锚点落在裁掉一侧。explode仅用于结构比较，title写“分离示意”；观察字段开启时强制回assembled，恢复旧模式只由用户显式操作。[F-D04]
- 目标预算：静止<50 draw calls，观察开启<60、硬上限100；总三角形<0.3M；原生程序化无需glb。field轮廓批量绘制并复用一个≤512²离屏缓冲；无WebGL第二renderer、无照片纹理、无运行时外部请求。数字均为工程预算而非生物事实。

## 4. 新引擎契约

### 4.1 已有能力与缺口核查

2026-10-29 已核本 checkout（main 已含 monthly climatology、orbit-rotation、airfoil、Ma deep-time；table/pose、sort、light、magnet、circuit、materials、steam mechanism 均已有）。也执行了 main..codex/{monsoon-engine,sem-engine,airfoil-content,dinosaur,plates} 日志并用 git show 逐一检查这些分支的 schema；前四分支无 main 外提交，plates 保留 reference/catalogue/impact 工作。这些能力均不能提供有限生物标本的双轴倒像、逐特征焦深与圆形观察视野。只保留 E-C1 纯 microscope 模型与 E-C2 观察视野；删去任何新的 primitive、通用控件、姿态系统、URL/记录系统、blur binding、timeline、地图或 reference layer 工作。控件、poses、offset、rotate、TryIt、记录、状态 URL 复用 main；不依赖任何未合并代码。


`src/engines/space-scene/lib/sim/index.ts` 与 `sim-schema.ts` 已查：controls、choice/step/toggle、predictions、records、visibility、pose、offset、rotate、shift可复用；没有 microscope kind 或 microscope-field overlay。不能把新字段直接写进旧schema假装可用。[F-REP02] 交付是实施契约，本轮按下列最小契约施工。

### 4.2 E-C1：纯函数 microscope 模型

新增 `microscope-schema.ts` 与 `lib/sim/microscope.ts`，注册 `SIM_KINDS`、`simQuantities`、数量枚举、状态映射、来源校验；输出数值必须finite。所有距离输入以µm，fieldNumber以mm，仪器scene坐标以m；不要把微观单位直接传给Three。预期API `solveMicroscope(config,values): quantities`，无DOM、随机数、时钟、网络、URL副作用。模型运行只依赖当前值。[F-D01–F-D04]

控制字段（共7个，沿用sim.controls）：

| id | kind / values | default | EN / ZH |
|---|---|---|---|
| specimen | choice onion-bulb / pondweed-leaf / prepared-cheek | onion-bulb | Specimen / 标本 |
| objective | step [4,10,40] | 4 | Objective power / 物镜倍数 |
| slide-x | step −1000…1000，间隔100µm | 0 | Slide right / 玻片左右 |
| slide-y | step −1000…1000，间隔100µm；正值向远离观察者 | 0 | Slide away / 玻片前后 |
| focus-z | step −20…20，间隔1µm，物方焦平面坐标 | 0 | Fine focus plane / 微调焦平面 |
| illumination | step [0,.25,.5,.75,1] | .5 | Illumination / 照明 |
| field-on | toggle | false | Observe field / 观察视野 |

新config的严格形状（本轮 E-C1 新增字段，未扩展前旧 schema 不接受）：

```json
{
  "microscope": {
    "controls": {
      "specimen": "specimen",
      "objective": "objective",
      "slideX": "slide-x",
      "slideY": "slide-y",
      "focusZ": "focus-z",
      "illumination": "illumination",
      "enabled": "field-on"
    },
    "ocularPower": 10,
    "fieldNumberMm": 18,
    "objectives": [
      {
        "power": 4,
        "focusWidthUm": 20
      },
      {
        "power": 10,
        "focusWidthUm": 8
      },
      {
        "power": 40,
        "focusWidthUm": 2
      }
    ],
    "specimens": [
      {
        "id": "onion-bulb",
        "label": {
          "en": "Prepared onion-bulb epidermis",
          "zh": "预制洋葱鳞茎表皮"
        },
        "target": {
          "id": "onion-nucleus",
          "atUm": [
            200,
            0,
            0
          ]
        },
        "pattern": "onion-grid"
      },
      {
        "id": "pondweed-leaf",
        "label": {
          "en": "Green pondweed leaf",
          "zh": "绿色水草叶"
        },
        "target": {
          "id": "pondweed-near-chloroplast",
          "atUm": [
            0,
            0,
            3
          ]
        },
        "pattern": "leaf-grid"
      },
      {
        "id": "prepared-cheek",
        "label": {
          "en": "Prepared cheek epithelium",
          "zh": "预制口腔上皮"
        },
        "target": {
          "id": "cheek-nucleus",
          "atUm": [
            0,
            0,
            0
          ]
        },
        "pattern": "cheek-grid"
      }
    ],
    "sources": [
      "S20"
    ]
  }
}
```

输出与公式：令o为objective，R = 500×fieldNumberMm/o，t=(tx,ty,tz)，x=tx+slide-x，y=ty+slide-y。`total-power=ocularPower×o`；`field-diameter-um=2R`；`target-u=−x/R`、`target-v=−y/R`，u向屏幕右，v向屏幕上；Canvas像素Y=cy−v×radiusPx。像旋转180度而非只水平翻转。`target-location`= hypot(x,y)≤R ? inside : outside（边界算inside）。公式依据F-X01；数值设定来自F-D01–F-D04。这些输出是**目标中心位置**，不是声称整个细胞都在视野里。[F-M01,F-D01–F-D04]

`clarity=max(0,1−abs(focus-z−tz)/focusWidthUm[o])`；`blur-px=8×(1−clarity)`，512px基准；每feature按自身z独立算blur。`focus-status`: clarity≥.75→sharp；0<clarity<.75→soft；0→blurred。`view-status`: field-on=false→inactive；否则illumination=0→dark；否则target-location=outside→outside；否则→focus-status。illumination只控制明暗，不改变clarity；关灯时仍返回可测试的数学位置与clarity，不宣称可见。[F-D03–F-D04]

输出kind：total-power/field-diameter-um/target-u/target-v/clarity/blur-px为number；target-location、focus-status、view-status为state；不需vector或timeline。只把total-power和field-diameter-um作为默认观察大读数；其余数输出供测试和overlay，UI不显示虚假的清晰度百分比。source S20 design:true；output telemetry≤6，不使用真实镜头分辨率数字。[F-D01–F-D04]

### 4.3 E-C1 校验与错误路径

1. config与对象严格字段，拒绝unknown；ocularPower、fieldNumberMm、focusWidthUm均finite >0；objectives power恰好与objective step一致且升序；choice ids恰好覆盖specimens，id唯一，target.atUm三个finite数；label双语；sources存在且至少一条design:true。[F-D01–F-D04]
2. 7个控制id不得复用；kind和值域必须匹配上述契约；focus-z和slide范围有界；不接受NaN/Infinity、不接受字符串数值、负倍率或空样本。URL非法值走已有normalization回default，并在测试中断言；正常setSim非法值返回false。solver本身非法输入返回typed error，不悄悄输出0。
3. 每个specimen.pattern必须是E-C2枚举之一；target id必须在该pattern生成的feature模板存在，coordinates与该模板一致；config数据最多3 specimen、每个pattern可见feature≤2048、可见实例预算超限则构建错误。
4. 每条binding引用存在的control/output/part/pose。不得给context绑定offset；不得给instrument stage绑定scale。没有coarse-control，因此无需模拟粗调碰撞，也不能以未实现的碰撞保护作卖点。

### 4.4 E-C2：显微视野 overlay 与观察卡

新增overlay严格形状 `{kind:"microscope-field", model:"microscope", group:"microscope-bench", when:{control:"field-on",is:true}, diameterPx:300, maxBufferPx:512, title:{en:"Simulated light-microscope field",zh:"模拟光学显微视野"}}`。引用同一sim配置，不新建真实相机，不拍摄3D cutaway；圆形视野里只有程序化标本，图像平移、倍率和focus均来自E-C1。右上卡在打开field时替换零件链路卡，<1024px移到TryIt内；同一renderer模型数据源、不并行显示两个独立可交互field。

overlay校验：kind/model/group/when引用均存在；diameterPx为整数[180,360]（默认300）、maxBufferPx恰为512；title双语；每topic至多一个该overlay；when必须是field-on的布尔条件；不允许外部URL或纹理字段。pattern.tileRange的端点是有界整数[−20,20]、min≤max，完整patch feature上界≤2048；origin/period/axes均finite，period>0；polygon≥3且无自交。

局部几何契约：每个pattern是有限基本cell模板加平移平铺参数 `{periodUm:[px,py], originUm:[ox,oy], features:[{id,kind:"ellipse"|"polygon",role:"wall"|"membrane-boundary"|"nucleus"|"chloroplast"|"cytoplasm-area",atUm:[x,y,z], axesUm:[major,minor]?,pointsUm?:[[x,y]…], contrast:0..1, parentCell:id}]}`。椭圆major/minor>0；polygon至少3点、不自交，坐标finite；feature id在模板内唯一，parentCell作为语义分组键指向本模板的细胞区域/轮廓feature，允许轮廓引用自己的id（不是递归树）；最多32模板feature；每pattern另有 `tileRange:{x:[min,max],y:[min,max]}` 的有限样本片边界。先按tileRange限定，再生成视野bbox加1周期的候选并裁圆；硬上限2048，构建期用整个有限样本片上界验证，禁止运行时随机消失。所有实例由(tileX,tileY,featureId)组成稳定id。几何连线来自同一真实解释模型的原创设计，不是测量数据。[F-D04]

| pattern | 基本单元设计 | 可观察元素 / 不画的东西 |
|---|---|---|
| onion-grid | period[300,120]µm；cell长方轮廓300×120µm；以目标核[200,0,0]为明确锚点，模板origin由该核反算；一个较淡核 | 植物壁边界、染色核、淡细胞内容；不画叶绿体，不把紧贴壁的膜分辨成清楚双线 |
| leaf-grid | period[80,40]µm；cell80×40µm；6个叶绿体沿外围，near/far面z=±3µm；目标near叶绿体[0,0,3]；核不显示 | 边界、叶绿体、淡透明内部；不画内部膜叠层、核孔、大量细小细胞器 |
| cheek-grid | period[110,90]µm；不规则扁椭圆60×45µm；核[0,0,0]；低对比度细胞界 | 预制染色核和边界；无壁、无叶绿体；不画动物大中央液泡 |

onion/leaf的period等于细胞轮廓尺寸，相邻单元共享壁；边界重合线去重一次。cheek为稀疏涂片，单元间可有间隙。低倍下有限标本片外侧是空玻片；不用无限平铺填满视野，不把宽空隙画成植物组织结构。exact配方见microscope-field-design.json；所有几何尺寸均F-D04。模板里的结构含义与F-B04–F-B12一致；不保证每个真实玻片都看见同样对比度。[F-M03]

render：feature投影u,v = −(p.xy+slide.xy)/R；axes跟随1/R，clip到圆盘；光照强度乘illumination（0为黑暗）；contrast只影响灰度而非结构有无；per-feature blur用F-D03公式，分三个深度层绘到同一≤512²buffer后合成，512px基准blur按输出像素比例缩放。颜色全用已有ink/paper/seedling token；叶绿体可以用功能色，颜色旁有结构名称；两套主题中界线与底的对比度≥3:1。不复制图版的黑色透明预览底为页面背景。

交互：3D slide和field用同一控件；通过44px ‹ ›按钮与键盘操作，不要求拖拽；若将来加拖拽不属本期。用CSS布局把圆形field放进现有右上卡，不增加底部控件。观察卡aria-label给出标本、总倍率、视野直径和明暗/焦点文字；Canvas为图像角色，提供等价的结构清单与一句状态文字。field关闭恢复链路卡；field在手机抽屉可打开，不把细节藏在hover。

新测试API `__atlas.engine.microscopeField()` → `{specimen,totalPower,fieldDiameterUm,targetUV:[u,v],targetLocation,focusStatus,viewStatus,visibleFeatureIds,bufferSize:[w,h]}`；来自同一E-C1和pattern枚举，测试不以读取DOM文本代替数据值。仅在microscope topic存在，否则null。

有限patch最大实例feature：onion25×3=75，leaf121×8=968，cheek81×3=243；任一时刻只显示一种标本。出处为F-D04，完整数据在microscope-field-design.json。不得把样本片边界裁成真实叶片形态；它只是有限观察区域。

### 4.5 绑定（其余复用）

| 来源 | 目标 | 既有binding与明确映射 |
|---|---|---|
| objective | turret + 3 objective parts | pose映射4→scope-scan、10→scope-low、40→scope-high；每套姿态为绝对角/位置，实际只一个物镜占光轴 |
| slide-x | slide-glass + coverslip-glass | offset axis[1,0,0], per=1e-6；移动1µm为1e-6m；不能再乘细胞放大倍数 |
| slide-y | slide-glass + coverslip-glass | offset axis[0,0,−1], per=1e-6；向远处对−Z，物方y向上 |
| focus-z | scope-fine-focus | rotate axis[1,0,0],per=9 degrees/µm,origin=0；可读性示意，不宣称真实旋钮传动比 |
| field-on | overlay/card | 由when开关；field打开时exploded/cutaway不作用于观察图像，设置assembled |

仪器载物台不作粗调的动态升降；slide-x/y代表夹持滑座平移而非抬高stage。基座/聚光镜/光源不跟着slide移，光轴不移。[F-M05–F-M08,F-D04] 不需要新增通用blur binding：模糊只属于microscope-field feature renderer。

### 4.6 必测例（预期数字）

| # | 输入（其余default（field-on false时数值仍计算）） | 精确期望 |
|---|---|---|
| T1 | objective4，onion-bulb，slide-x0，focus0 | total40；D4500；u=−0.0888888889，v=0；clarity1，blur0；inside |
| T2 | objective10 | total100；D1800；u=−0.2222222222 |
| T3 | objective40，slide-x−200 | total400；D450；u0；sharp |
| T4 | T3后slide-x−100 | u=−0.4444444444；右移100µm，像左移0.444444R |
| T5 | objective40，slide-x100 | u=−1.3333333333；outside |
| T6 | objective40，slide-x−200，focus1 | clarity.5；blur4px；soft |
| T7 | T6 focus2 | clarity0；blur8px；blurred |
| T8 | objective40，pondweed-leaf，focus3，slide0 | target uv0,0；near clarity1，far z−3 clarity0 |
| T9 | T8 illumination0，field-on true | view-status dark；total400、D450不变 |
| T10 | objective40，prepared-cheek，slide-y100 | v=−0.4444444444；最终像素Y在圆心下方 |
| T11 | width100µm calibration；objective4→40 | apparent span/diameter从.0222222222→.2222222222；实际宽仍100 |
| T12 | field-on false | view-status inactive；API数值不丢；不绘观察field |
| T13 | objective0、NaN焦点、重复specimen/target、缺中文、非design来源 | 构建拒绝；每项错误定位到字段 |
| T14 | setSim objective20 / URL objective20 | setSim返回false；URL值回default4；无错误读数 |
| T15 | URL指定chapter06,b3，来回换EN/ZH或paper/cinema | same specimen/objective/slide/focus/fieldDiameter；不累计前拍隐藏和姿态 |

数值容差1e-9（单位µm）；画面比较对blur用小容差、对结构存在性用visibleFeatureIds。几何验收：leaf里的每个chloroplast必须在膜与液泡之间；观察图里不画膜内部双层；onion无chloroplast ids；animal无wall/chloroplast ids。F-D03/F-D04只是教学模型，不能用shader数值证明实际光学性能。

### 4.7 最小施工包与退路

| 引擎件 | 必须改动范围（本轮施工） | 退路 |
|---|---|---|
| E-C1 microscope | schema/registry/pure function/controls normalization/sources validation/quantity test；复用现有TryIt与URL | 必须完成模型与交互；不能用手工静态数冒充交互完成 |
| E-C2 microscope-field | 单一局部renderer+卡片+overlay schema+responsive/a11y+test API | 结构章可独立评审；实际显微镜try-it为用户要求，不能静默删掉 |

不需要新npm依赖、网络服务、地理图层、新3D原语或真实医学mesh。

## 5. 章节与逐拍字幕草稿

### 5.0 总表

| # | id | EN / ZH | 镜头 / 模式 | 拍数 |
|---|---|---|---|
| 00 | before-you-start | From organisms to cells / 从整体到细胞 | pair-hero / assembled | 5 |
| 01 | microscope-safely | Using a microscope safely / 安全使用显微镜 | scope-whole / assembled | 5 |
| 02 | animal-cell-parts | Shared cell structures / 动物细胞的共同结构 | animal-close / assembled | 5 |
| 03 | plant-cell-parts | A photosynthetic plant cell / 植物细胞的附加结构 | plant-close / assembled | 5 |
| 04 | compare-cells | Comparing cells / 同与不同 | pair-hero / assembled | 5 |
| 05 | power-and-field | Magnification and field of view / 放大与视野 | scope-whole / assembled | 5 |
| 06 | microscope-try-it | Trying the microscope / 显微镜试一试 | scope-stage-close / assembled | 5 |
| 07 | cells-and-systems | Cells and systems / 细胞与系统 | pair-hero / assembled | 5 |

**状态约定。** 本表及每拍表是定稿 authoring 计划，施工时映射既有SpaceScene chapterState字段。每章为完整base：view如表、run:false、explode:0、cutaway:none、pose:null、part:null、field-on:false；只显示本章索引所需组，其余显式hide。进入拍时先从本章base合成，不累加上一拍；每拍sim.set下文省写的值用本章default，不用上一拍残留。05/06 base模拟值为onion-bulb/4/slide0/focus0/illumination.5；04每拍的完整设置见旁存beats-plan.json。label列表每拍≤6，选中对象必在画面；每章index覆盖该章及其拍提到的对象。所有defaults和beat完整字段见beats-plan.json，避免表格省写歧义。

### 5.1 00 `before-you-start` · 从整体到细胞

- **summary EN**：Cells are basic units of life. Enlarged models and microscope views show different things.
- **summary ZH**：细胞是生命的基本单位；放大的模型与显微镜观察各有用途。
- **正文提纲**：先描述这一章实际可见的变化，再解释对应结构或观察方法；caption中的事实逐项见下表。施工时扩成EN 200–300词 / ZH 350–500字，保留独立中文语序，本轮创建完整 MDX。
- **本章索引**：`plant-cell-wall, animal-membrane, animal-nucleus`。

| 拍 / id | 完整可见动作与state重点 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| 00.1 context-leaf | camera `pair-hero`；view `assembled`；cut `none`；part `plant-cell-wall`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | We start with a leaf, then switch to a separately enlarged cell model. The scale has changed. | 先看一片叶的整体，再切换到单独放大的细胞模型；这里的尺度已经改变。 | F-C01, F-B01, F-D04, F-D06 |
| 00.2 context-tissue | camera `plant-close`；view `assembled`；cut `none`；part `plant-cell-wall`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Cells work together in tissues. Tissues form organs such as a leaf. | 许多细胞共同组成组织，组织又组成器官；叶是器官。 | F-B03, F-C03 |
| 00.3 two-cells | camera `pair-hero`；view `assembled`；cut `none`；part `null`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Plants and animals are made of cells. These models show only the parts used in this topic. | 植物和动物都由细胞组成；这两个模型只展示本主题要用到的部分。 | F-B01, F-B04, F-D04 |
| 00.4 shared-parts | camera `animal-close`；view `assembled`；cut `none`；part `animal-nucleus`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | This animal-cell model has a membrane, cytoplasm and a nucleus. | 这个动物细胞模型中能找到细胞膜、细胞质和细胞核。 | F-B04 |
| 00.5 model-and-view | camera `pair-hero`；view `assembled`；cut `none`；part `null`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | A cutaway model explains structure. A light microscope does not necessarily reveal every part at once. | 剖开的模型帮助解释结构；真实光学显微镜下不一定能同时辨认所有结构。 | F-M03, F-M11 |

- **细看**：① 模型与真实观察的差别；②本章一条误解及证据；③相应安全或系统联系。每条引用本章事实，禁止用未核“有趣数字”填充。
- **细看具体题**：生物大是否必定细胞大？说明必须测量，不能从整体体积推出细胞大小。研究依据F-R03；不编造动物细胞尺寸比较。

### 5.2 01 `microscope-safely` · 安全使用显微镜

- **summary EN**：Start at low power, centre the specimen, and follow the teacher’s instructions.
- **summary ZH**：先低倍、再居中，按教师的指导保护镜头与玻片。
- **正文提纲**：先描述这一章实际可见的变化，再解释对应结构或观察方法；caption中的事实逐项见下表。施工时扩成EN 200–300词 / ZH 350–500字，保留独立中文语序，本轮创建完整 MDX。
- **本章索引**：`scope-arm, scope-base, scope-turret, scope-stage, slide-glass, scope-fine-focus`。

| 拍 / id | 完整可见动作与state重点 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| 01.1 carry-and-place | camera `scope-whole`；view `assembled`；cut `none`；part `scope-arm`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Carry this kind of school microscope with one hand at the arm and one under the base. Follow the teacher’s instructions for the actual instrument. | 搬运这类学校显微镜时，一手扶镜臂，一手托底座；具体仪器要按教师的指导操作。 | F-M06 |
| 01.2 low-objective | camera `scope-stage-close`；view `assembled`；cut `none`；part `scope-turret`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Start with the lowest-power objective. Look from the side to check that it is clear of the slide. | 先让最低倍物镜对准玻片；从侧面确认镜头没有碰到玻片。 | F-M07, F-D06 |
| 01.3 slide-and-light | camera `scope-stage-close`；view `assembled`；cut `none`；part `slide-glass`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | A thin specimen rests on the slide. Light passes through it from below and enters the objective. | 薄标本放在载玻片上；光从下方穿过标本，再进入物镜。 | F-M05, F-M10 |
| 01.4 fine-focus | camera `scope-stage-close`；view `assembled`；cut `none`；part `scope-fine-focus`；sim `{"specimen":"onion-bulb","objective":40,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Refine the focus gently. At high power use fine adjustment, without large coarse movements of the stage. | 用微调让图像清楚；高倍下只做细微调焦，不用粗调节器大幅移动载物台。 | F-M08 |
| 01.5 finish-safely | camera `scope-whole`；view `assembled`；cut `none`；part `scope-base`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Finish at the lowest power with the stage lowered. Use lens paper for lenses and put slides away as instructed. | 结束时退回最低倍并降低载物台；镜头用擦镜纸清洁，玻片按教师指导收好。 | F-M07, F-M09 |

- **细看**：① 模型与真实观察的差别；②本章一条误解及证据；③相应安全或系统联系。每条引用本章事实，禁止用未核“有趣数字”填充。
- **安全细看**：显微镜搬运因机型而异；本例用扶臂托底通法，教师及实际机型说明优先（S06/S21）。玻片破损交成人处理；不在本主题教授自行采口腔样本。

### 5.3 02 `animal-cell-parts` · 动物细胞的共同结构

- **summary EN**：Connect each part with its function.
- **summary ZH**：把部位和作用放在同一幅图中看。
- **正文提纲**：先描述这一章实际可见的变化，再解释对应结构或观察方法；caption中的事实逐项见下表。施工时扩成EN 200–300词 / ZH 350–500字，保留独立中文语序，本轮创建完整 MDX。
- **本章索引**：`animal-membrane, animal-cytoplasm, animal-nucleus`。

| 拍 / id | 完整可见动作与state重点 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| 02.1 membrane-outline | camera `animal-close`；view `assembled`；cut `none`；part `animal-membrane`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | A thin membrane surrounds the cell and separates its contents from the surroundings. | 薄薄的细胞膜围住细胞，分隔内部与外部环境。 | F-B05 |
| 02.2 membrane-passage | camera `animal-close`；view `assembled`；cut `none`；part `animal-membrane`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | The membrane regulates what passes into and out of the cell. Its boundary is thickened here so it can be seen. | 细胞膜调节物质的进出；画面把边界加厚，方便看清。 | F-B05, F-D04 |
| 02.3 cytoplasm-open | camera `animal-close`；view `xray`；cut `half`；part `animal-cytoplasm`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | The cutaway reveals cytoplasm, where many chemical reactions needed for life take place. | 切开外层后，能看见细胞质；这里进行着许多生命活动所需的化学反应。 | F-B06 |
| 02.4 nucleus-open | camera `animal-close`；view `xray`；cut `half`；part `animal-nucleus`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | The nucleus holds genetic instructions and helps control the cell’s activities. | 细胞核保存遗传指令，并参与控制细胞的活动。 | F-B07 |
| 02.5 cell-volume | camera `animal-oblique`；view `assembled`；cut `none`；part `animal-nucleus`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | From another angle this is still the same cell, with depth as well as width. | 换一个角度，细胞仍是同一个立体结构；它并不是一张平面图。 | F-R02, F-D04 |

- **细看**：① 模型与真实观察的差别；②本章一条误解及证据；③相应安全或系统联系。每条引用本章事实，禁止用未核“有趣数字”填充。

### 5.4 03 `plant-cell-parts` · 植物细胞的附加结构

- **summary EN**：The wall lies outside the membrane. Chloroplasts and the large vacuole have different roles.
- **summary ZH**：细胞壁在细胞膜外；叶绿体和大液泡各有作用。
- **正文提纲**：先描述这一章实际可见的变化，再解释对应结构或观察方法；caption中的事实逐项见下表。施工时扩成EN 200–300词 / ZH 350–500字，保留独立中文语序，本轮创建完整 MDX。
- **本章索引**：`plant-cell-wall, plant-membrane, plant-cytoplasm, plant-nucleus, plant-chloroplasts, plant-vacuole`。

| 拍 / id | 完整可见动作与state重点 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| 03.1 wall-outline | camera `plant-close`；view `assembled`；cut `none`；part `plant-cell-wall`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | This plant cell has an outer wall that helps support and protect it. | 这个植物细胞的外面有细胞壁，帮助支持和保护细胞。 | F-B08 |
| 03.2 membrane-inside | camera `plant-close`；view `xray`；cut `half`；part `plant-membrane`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | A separate membrane lies just inside the wall. Having a wall does not remove the need for a membrane. | 细胞壁的内侧还有细胞膜；有细胞壁并不表示没有细胞膜。 | F-B05, F-B08 |
| 03.3 chloroplasts | camera `plant-close`；view `xray`；cut `half`；part `plant-chloroplasts`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Chloroplasts in this green leaf-cell example use light in photosynthesis to make food. | 这个绿色叶细胞的叶绿体吸收光，用于光合作用制造食物。 | F-B09 |
| 03.4 vacuole | camera `plant-close`；view `xray`；cut `half`；part `plant-vacuole`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | The large vacuole contains liquid with dissolved substances. It is not an air-filled hole. | 大液泡里是含有溶解物质的液体，并不是空气或空洞。 | F-B10, F-B11 |
| 03.5 peripheral-nucleus | camera `plant-close`；view `xray`；cut `half`；part `plant-nucleus`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | The large vacuole occupies much of the centre. This model’s nucleus lies in cytoplasm at the side. | 大液泡占据中间许多空间；这个模型的细胞核在侧面的细胞质中。 | F-B10, F-R01, F-D04 |

- **细看**：① 模型与真实观察的差别；②本章一条误解及证据；③相应安全或系统联系。每条引用本章事实，禁止用未核“有趣数字”填充。
- **细看具体题**：动物也可有较小的囊泡/液泡；本例未画出，不等于不存在。植物也有线粒体；本主题省略该标签，并不声称叶绿体替代一切。[F-B12–F-B13]

### 5.5 04 `compare-cells` · 同与不同

- **summary EN**：Compare shared structures, then test an idea with another specimen.
- **summary ZH**：比较共同结构，再用不同标本检验推测。
- **正文提纲**：先描述这一章实际可见的变化，再解释对应结构或观察方法；caption中的事实逐项见下表。施工时扩成EN 200–300词 / ZH 350–500字，保留独立中文语序，本轮创建完整 MDX。
- **本章索引**：`plant-cell-wall, plant-chloroplasts, onion-patch, animal-membrane, animal-nucleus`。

| 拍 / id | 完整可见动作与state重点 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| 04.1 predict-chloroplast | camera `plant-close`；view `assembled`；cut `none`；part `plant-chloroplasts`；sim `{"specimen":"pondweed-leaf","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Predict first: must onion-bulb epidermal cells have chloroplasts too? Next we change the specimen. | 先猜一猜：洋葱鳞茎表皮细胞也一定有叶绿体吗？接着换标本看。 | F-R01, F-E01 |
| 04.2 onion-view | camera `scope-stage-close`；view `assembled`；cut `none`；part `slide-glass`；sim `{"specimen":"onion-bulb","objective":10,"slide-x":-200,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":true}` | Onion-bulb epidermis is plant tissue without chloroplasts. Some internal structures are easier to distinguish after staining. | 洋葱鳞茎表皮是植物细胞，却没有叶绿体；有些内部结构需要染色才容易辨认。 | F-E01, F-M03, F-SG02 |
| 04.3 pondweed-view | camera `scope-stage-close`；view `assembled`；cut `none`；part `slide-glass`；sim `{"specimen":"pondweed-leaf","objective":40,"slide-x":0,"slide-y":0,"focus-z":3,"illumination":0.5,"field-on":true}` | A green pondweed leaf shows chloroplasts. Different specimens need not match one textbook drawing. | 换成绿色水生植物的叶，能观察到叶绿体；标本不同，不能只按一个图样推断。 | F-M12, F-B09 |
| 04.4 prepared-cheek-view | camera `scope-stage-close`；view `assembled`；cut `none`；part `slide-glass`；sim `{"specimen":"prepared-cheek","objective":40,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":true}` | A prepared cheek-cell slide provides an animal-cell comparison, without walls or chloroplasts. | 预制的口腔上皮玻片可用来比较动物细胞；它们没有细胞壁和叶绿体。 | F-B12, F-M03 |
| 04.5 compare-evidence | camera `pair-hero`；view `assembled`；cut `none`；part `null`；sim `{"specimen":"prepared-cheek","objective":40,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | The shared parts are membrane, cytoplasm and nucleus. Shape is a clue; structure and specimen identity provide stronger evidence. | 共同点是细胞膜、细胞质和细胞核；外形只是线索，证据还要看结构与标本来源。 | F-B04, F-B08, F-R02 |

- **细看**：① 模型与真实观察的差别；②本章一条误解及证据；③相应安全或系统联系。每条引用本章事实，禁止用未核“有趣数字”填充。
- **先猜后看（叙述式）**：04.1先保留猜测，04.2再用洋葱反例，不靠shape唯一判断；不计分，不借用跨输出的自动predict比较。

### 5.6 05 `power-and-field` · 放大与视野

- **summary EN**：Higher power shows a smaller area of the specimen.
- **summary ZH**：放大后只看到标本更小的一片范围。
- **正文提纲**：先描述这一章实际可见的变化，再解释对应结构或观察方法；caption中的事实逐项见下表。施工时扩成EN 200–300词 / ZH 350–500字，保留独立中文语序，本轮创建完整 MDX。
- **本章索引**：`scope-eyepiece, scope-turret, slide-glass, scope-fine-focus`。

| 拍 / id | 完整可见动作与state重点 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| 05.1 objective-and-ocular | camera `scope-whole`；view `assembled`；cut `none`；part `scope-eyepiece`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":-200,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":true}` | Total magnification is the eyepiece power multiplied by the objective power. These powers are chosen for this model. | 总放大倍数来自目镜与物镜相乘；这是这台模型的设计设定。 | F-M04, F-D01 |
| 05.2 forty-total | camera `scope-stage-close`；view `assembled`；cut `none`；part `scope-turret`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":-200,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":true}` | In this model a ten-power eyepiece and four-power objective give forty times magnification. | 在这个模型里，十倍目镜配四倍物镜，总共放大四十倍。 | F-D01 |
| 05.3 four-hundred-total | camera `scope-stage-close`；view `assembled`；cut `none`；part `scope-turret`；sim `{"specimen":"onion-bulb","objective":40,"slide-x":-200,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":true}` | With the forty-power objective, total magnification becomes four hundred. The field diameter becomes one tenth of its previous size. | 换成四十倍物镜，总共放大四百倍；视野直径缩为原来的十分之一。 | F-D01, F-D02 |
| 05.4 inverted-motion | camera `scope-stage-close`；view `assembled`；cut `none`；part `slide-glass`；sim `{"specimen":"onion-bulb","objective":40,"slide-x":-100,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":true}` | Move the slide right and the image moves left, as in this type of compound microscope. | 把载玻片向右移动，视野里的图像却向左移动；这是这类复式显微镜的成像特点。 | F-M01 |
| 05.5 focus-not-growth | camera `scope-stage-close`；view `assembled`；cut `none`；part `scope-fine-focus`；sim `{"specimen":"onion-bulb","objective":40,"slide-x":-100,"slide-y":0,"focus-z":2,"illumination":0.5,"field-on":true}` | The cell has not grown; its image has enlarged. More magnification does not automatically bring an unfocused structure into focus. | 细胞没有变大；变的是图像。没有调好焦时，放大也不能让模糊的结构自动变清楚。 | F-M02, F-D03 |

- **细看**：① 模型与真实观察的差别；②本章一条误解及证据；③相应安全或系统联系。每条引用本章事实，禁止用未核“有趣数字”填充。
- **先猜后看（复用predict）**：`vary:objective`，start `{objective:4,slide-x:-200,focus-z:0}` → change `{objective:40}`，observe `field-diameter-um`；more/less/same三个选项，正确为less；目标不是把“物镜倍数”与“总倍率”混成同一量。[F-D01–F-D02]

### 5.7 06 `microscope-try-it` · 显微镜试一试

- **summary EN**：Keep the same specimen, centre it, change power, refocus and record.
- **summary ZH**：保持同一标本，居中、换倍数、微调并记录。
- **正文提纲**：先描述这一章实际可见的变化，再解释对应结构或观察方法；caption中的事实逐项见下表。施工时扩成EN 200–300词 / ZH 350–500字，保留独立中文语序，本轮创建完整 MDX。
- **本章索引**：`slide-glass, scope-turret, scope-fine-focus`。

| 拍 / id | 完整可见动作与state重点 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| 06.1 start-low | camera `scope-stage-close`；view `assembled`；cut `none`；part `scope-turret`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":true}` | Start at low power to find the specimen. This field is a locally generated teaching simulation, not a recorded image. | 从最低倍开始找标本；这个视野是本地生成的教学模拟，不是真实拍摄。 | F-M07, F-D04 |
| 06.2 centre-target | camera `scope-stage-close`；view `assembled`；cut `none`；part `slide-glass`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":-200,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":true}` | Move the selected nucleus to the centre of the field before increasing power. | 将选中的细胞核移到视野中央，再提高倍数。 | F-M08, F-D04 |
| 06.3 increase-power | camera `scope-stage-close`；view `assembled`；cut `none`；part `scope-turret`；sim `{"specimen":"onion-bulb","objective":40,"slide-x":-200,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":true}` | At higher power the centred target remains in view, while less of the surrounding specimen is visible. | 提高倍数后，中央的目标仍在视野中；现在能看到的周围范围更小。 | F-D02, F-M08 |
| 06.4 fine-refocus | camera `scope-stage-close`；view `assembled`；cut `none`；part `scope-fine-focus`；sim `{"specimen":"onion-bulb","objective":40,"slide-x":-200,"slide-y":0,"focus-z":1,"illumination":0.5,"field-on":true}` | Use fine focus to compare focal planes. A structure coming into focus has not just grown inside the cell. | 用微调比较两个焦平面；图像变清楚，不能当成细胞里长出了新结构。 | F-M11, F-D03 |
| 06.5 record-same-specimen | camera `scope-stage-close`；view `assembled`；cut `none`；part `scope-fine-focus`；sim `{"specimen":"onion-bulb","objective":40,"slide-x":-200,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":true}` | Return to a clear focal plane and record power and field diameter. Change one condition at a time for the comparison. | 回到清楚的焦平面，记录倍数和视野直径。换条件时一次只改一个量。 | F-D02, F-D03, F-D04 |

- **细看**：① 模型与真实观察的差别；②本章一条误解及证据；③相应安全或系统联系。每条引用本章事实，禁止用未核“有趣数字”填充。
- **本章只用一张试一试卡**：vary `focus-z`；also `[slide-x,slide-y,objective,illumination]`（4个）；keep `[specimen]`；observe `[focus-status,view-status]`；record:true。读者可先移动玻片和选物镜，再保持这些量不变比较焦平面。beat.sim只可set，不可切换try配置，遵循当前beatSimSchema。开发用target-u不进儿童大号读数。
- **记录语义**：沿用已查trial.tableContextKey；任一非vary条件变化，下一次记录开启新条件表并提示；同focus值覆盖。不开新的多控制列，不写清晰度百分比。
- **记录任务**：05/06章分别用既有record API记录倍率→视野与焦平面→状态，表列只用该章vary及observe；如果同时想记多个控制值，属于新记录schema工作，本轮不增加此能力。

### 5.8 07 `cells-and-systems` · 细胞与系统

- **summary EN**：Connect cells to familiar plant and human systems.
- **summary ZH**：把微小的细胞放回熟悉的植物与人体系统中。
- **正文提纲**：先描述这一章实际可见的变化，再解释对应结构或观察方法；caption中的事实逐项见下表。施工时扩成EN 200–300词 / ZH 350–500字，保留独立中文语序，本轮创建完整 MDX。
- **本章索引**：`leaf-context, plant-cell-wall, tissue-patch, intestine-context, body-context`。

| 拍 / id | 完整可见动作与state重点 | Caption EN | 字幕 ZH | Fact ids |
|---|---|---|---|---|
| 07.1 cells-to-organs | camera `pair-hero`；view `assembled`；cut `none`；part `tissue-patch`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Cells form tissues, tissues form organs, and organs work together in systems. | 细胞组成组织，组织组成器官；器官在系统中共同作用。 | F-B03 |
| 07.2 plant-link | camera `plant-close`；view `assembled`；cut `none`；part `leaf-context`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | A leaf is a plant organ. The cell model explains a small part of it. Open A Plant to follow the root, stem and leaves. | 叶是植物器官；细胞模型解释叶的一小部分。回到《一株植物》看根、茎、叶怎样连接。 | F-C03, F-REP01 |
| 07.3 heart-lung-link | camera `pair-hero`；view `assembled`；cut `none`；part `body-context`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Heart and lungs belong to different systems that help supply and transport substances around the body. Continue in The Heart and Lungs. | 心与肺属于不同系统，却共同帮助身体获得并运送所需物质；到《心与肺》继续看。 | F-C04, F-REP01 |
| 07.4 digestive-link | camera `pair-hero`；view `assembled`；cut `none`；part `intestine-context`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | The small intestine is an organ, not one giant cell. Open The Digestive System to follow digestion and absorption. | 小肠是器官，不是一个大细胞；回到《消化系统》看食物怎样消化与吸收。 | F-B03, F-C04, F-REP01 |
| 07.5 living-things-link | camera `pair-hero`；view `assembled`；cut `none`；part `null`；sim `{"specimen":"onion-bulb","objective":4,"slide-x":0,"slide-y":0,"focus-z":0,"illumination":0.5,"field-on":false}` | Some organisms have one cell and others have many. Continue comparing living things in Classifying Living Things. | 有的生物只有一个细胞，有的有许多细胞；到《生物的分类》继续比较不同的生物。 | F-B01, F-REP01 |

- **细看**：① 模型与真实观察的差别；②本章一条误解及证据；③相应安全或系统联系。每条引用本章事实，禁止用未核“有趣数字”填充。
- **正文中的跨链**：plant、heart-and-lungs、digestive-system、living-things四个可点locale链接；器官过程留给对应主题。系统联系图是整器官插图，不作为细胞显微照片。[F-REP01]

### 5.9 拍数与画面核查

8个章节节点（背景1 + 正文7），每章5拍，共40拍。背景kind:background也有可见状态；优先采用docs/40–41新范本，旧data-cookbook“SpaceScene无背景章”已被较新范本覆盖。05/06的field读数均为SIM；04的反例不把“看不到”误写成一切细胞结构的缺失证据。

## 6. HUD、名词表与来源

### 6.1 HUD

- 底部只有章节轴；章头→节拍行→TryIt→详情→正文→索引。labels不超过6，索引含正文提到的全部可点零件，scope-slide与cell-model之间切换要避免索引选中不可见对象；必要时索引动作显式切到说明模型，禁止空点击。
- 规格行≤4：Model / 模型＝separate enlarged cells；Eyepiece / 目镜＝10× DESIGN；Objectives / 物镜＝4/10/40× DESIGN；Field number / 视场数＝18mm DESIGN。来源F-D01,F-D04,F-D06。
- PLATE只给≤3行SIM：total power、field diameter、focus status；无百分清晰度、无实时采样噪声。field-on false时隐藏观察读数而不是显示虚构实测。
- chain卡只显示animal/plant/microscope三列，可读短名；观察模式替换为圆形field卡。底部不新增实验台、滑块或计数器。
- 6相机预设均可触屏点击；ORBIT/REF保留已有职责，field不随3D orbit旋转；物方坐标与画面解释保持一致。[F-M01,F-D04]

### 6.2 六个相机预设（DESIGN，米）

| id | position | target | fov | 用途 |
|---|---|---|---|---|
| pair-hero | [0,.30,.85] | [0,.12,0] | 30 | 两细胞或系统联系示意 |
| animal-close | [.10,.17,.36] | [.10,.10,0] | 30 | 正面动物细胞 |
| animal-oblique | [.32,.22,.27] | [.10,.10,0] | 30 | 强调深度 |
| plant-close | [−.10,.22,.40] | [−.10,.12,0] | 30 | 植物细胞 |
| scope-whole | [.62,.40,.65] | [.20,.18,0] | 30 | 全显微镜 |
| scope-stage-close | [.42,.26,.32] | [.18,.17,0] | 30 | 玻片、物镜、调焦 |

H封面镜头用pair-hero，图版画面在HUD关闭后仍完整。hudFrame按实际可见主体列，不能把故意隐藏的scope拉进cell近景；cuts需用现有named-cut定义而非未登记字符串。cut half 指本主题定义的 named cut；labels锚点核不能恰被裁掉。

### 6.3 核心名词16项（EN / ZH，首现与定义）

| EN | ZH | 一句话定义 / 来源 | 首现 |
|---|---|---|---|
| cell | 细胞 | 生命的基本单位；F-B01 | 00 |
| cell membrane | 细胞膜 | 分隔内外、调节进出；F-B05 | 02 |
| cytoplasm | 细胞质 | 核外许多化学反应发生的区域；F-B06 | 02 |
| nucleus | 细胞核 | 保存遗传指令、参与控制；F-B07 | 02 |
| cell wall | 细胞壁 | 膜外支持结构；F-B08 | 03 |
| chloroplast | 叶绿体 | 含叶绿素、进行光合作用；F-B09 | 03 |
| vacuole | 液泡 | 含液体与溶解物质的腔室；F-B10 | 03 |
| chlorophyll | 叶绿素 | 参与吸收光的色素；F-B09 | 03 |
| microscope | 显微镜 | 用于观察微小结构的仪器；F-B02 | 01 |
| eyepiece | 目镜 | 观察者一侧的放大镜组；F-M04 | 01 |
| objective | 物镜 | 靠近标本的镜组；F-M04–F-M05 | 01 |
| slide | 载玻片 | 承载薄标本的玻璃片；F-M10/S06 | 01 |
| coverslip | 盖玻片 | 覆盖标本的薄玻璃片；F-M10/S06 | 01 |
| magnification | 放大率 | 图像相对于对象的放大程度；F-M02 | 05 |
| tissue | 组织 | 协同工作的细胞组成的结构；F-B03 | 00 |
| organ | 器官 | 由组织组成、执行功能的结构；F-B03 | 00 |

词形凭据见父facts.json的56项terms；除洋葱外未核到新加坡专门用例，不把香港EDB词表称为新加坡MOE官方译名。这里选常见简体，术语微调保留原始attestedForm与conversion说明。

### 6.4 来源表（24项；施工来源与父fact ids保持可追溯）

| id | 来源与publisher | 用途 / 许可限制 |
|---|---|---|
| S01 | [Science Teaching & Learning Syllabus, Primary Three to Six, 2023 (updated Jan 2026)](https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf) · Singapore MOE | Printed pp.43,53–57; PDF page = printed + 1; cached original verified locally；Reference only; no open asset permission established |
| S02 | [Primary Science Syllabus, implementation from 2014](https://www.moe.gov.sg/-/media/files/primary/science-primary-2014) · Singapore MOE | Printed p.38, Cell System (P5 and P6 Standard); search-index text only, historical comparison；Reference only; no open asset permission established |
| S03 | [Biology 2e §4.1 Studying Cells](https://openstax.org/books/biology-2e/pages/4-1-studying-cells) · OpenStax / Rice University | Introduction, Microscopy, Light Microscopes, Cell Theory；CC BY-NC-SA 4.0 (current preface; individual figure credits may differ) |
| S04 | [Biology 2e §4.3 Eukaryotic Cells](https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells) · OpenStax / Rice University | Plasma Membrane, Cytoplasm, Nucleus, Vacuoles and Vesicles, Chloroplasts, Cell Wall；CC BY-NC-SA 4.0 (current preface; individual figure credits may differ) |
| S05 | [Biology 2e Preface: About OpenStax resources](https://openstax.org/books/biology-2e/pages/preface) · OpenStax / Rice University | Customization; current book-level licence；CC BY-NC-SA 4.0 |
| S06 | [Microscope, Biology I Laboratory Manual](https://courses.lumenlearning.com/suny-biolabs1/chapter/microscope/) · SUNY teaching laboratory manual / Lumen Learning | Rules and Instructions for using Compound Light Microscopes; page attribution；Reference only; page-level open licence not independently verified; no asset download |
| S07 | [Microscope](https://histologylab.ctl.columbia.edu/microscope/) · Columbia University Histology Laboratory | Stand, optical system and method of use；Reference only; no open asset permission established |
| S08 | [Teaching Microscopy Using Plants](https://www.saps.org.uk/growth-hub/teaching-microscopy-using-plants/) · Science & Plants for Schools / University of Cambridge | Article 1 and pondweed video description; Article 2 specimen preparation; text read, cookie-gated videos skipped；Reference only; no open asset permission established |
| S09 | [Misconceptions: life science](https://waps.cfa.harvard.edu/mosart/misconceptions.php) · Harvard-Smithsonian Center for Astrophysics, MOSART | Elementary life science list; organism size and cell size; public page only；Reference only; no open asset permission established |
| S10 | [Combining different conceptual change methods within 5E model: a sample teaching design of cell concept and its organelles](https://www.eduhk.hk/apfslt/v9_issue2/muammer/muammer8.htm) · Mustafa Ürey & Muammer Çalık, APFSLT 9(2), article 12, 2008 | Appendix 2: misconception list; use for reported ideas, not all its corrective explanations；Reference only; no open asset permission established |
| S11 | [Contribution of 3D modelling and printing to learning in primary schools: a case study with visually impaired students from an inclusive Biology classroom](https://www.tandfonline.com/doi/full/10.1080/00219266.2022.2118352) · Journal of Biological Education / original research authors | Results: student knowledge before 3D modelling; public indexed results, not a Singapore prevalence study；Reference only; no open asset permission established |
| S12 | [DNA Learning Lab booklet 2018](https://www.science.edu.sg/docs/default-source/scs-documents/for-schools/dnabooklet_2018.pdf) · Science Centre Singapore | Printed pp.3–4 / PDF pp.3–4, Diversity of Cells; historical programme, not current booking advice；Reference only; no open asset permission established |
| S13 | [Allium cepa L.](https://www.nparks.gov.sg/florafaunaweb/flora/5/9/5931) · NParks Flora & Fauna Web | Common names, Local Conservation Status, Ethnobotanical Uses；Reference only; no open asset permission established |
| S14 | [An English-Chinese Glossary of Terms Commonly Used in Teaching Science (S1–3), 2017](https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/ref-and-resources/SciGlossary_2017.pdf) · Hong Kong Education Bureau | Alphabetical entries; cached PDF read locally; printed Arabic page = PDF page − 5; traditional forms converted explicitly；Reference only; no open asset permission established |
| S15 | [崔勇教授团队揭示植物细胞中液泡生物发生的机制](https://life.xmu.edu.cn/info/1045/30692.htm) · 厦门大学生命科学学院 | 2025-03-25 research report; simplified 液泡、细胞器、细胞内、细胞; terminology only；Reference only; no open asset permission established |
| S16 | [光学显微镜](https://www.keyence.com.cn/ss/products/microscope/microscope_glossary/optical_microscopes/) · KEYENCE China, manufacturer terminology resource | Structure and limitations; lexical evidence only, no product recommendations；Reference only; no open asset permission established |
| S17 | [Plant cell structure-en.svg](https://commons.wikimedia.org/wiki/File:Plant_cell_structure-en.svg) · Mariana Ruiz / LadyofHats, Wikimedia Commons | File description and licensing; reference only；Public domain (author dedication); Commons page text CC BY-SA is separate |
| S18 | [Animal cell structure en.svg](https://commons.wikimedia.org/wiki/File:Animal_cell_structure_en.svg) · Mariana Ruiz / LadyofHats, Wikimedia Commons | File description and licensing; reference only；Public domain (author dedication); Commons page text CC BY-SA is separate |
| S19 | [Microscopy of a pondweed leaf: exploring depth of field and focal plane](https://www.saps.org.uk/teaching-resources/resources/6294/microscopy-of-a-pondweed-leaf-exploring-depth-of-field-and-focal-plane/) · Science & Plants for Schools | Resource page; linked through S08；Reference only; no open asset permission established |
| S20 | Atlas cells model study and repository audit（本规格 §2 与生产 sources.json） · Atlas preparation, original design | F-D01–F-D06; source files inspected 2026-10-29; design values are not measurements；Original Atlas content: CC BY-NC-SA 4.0; no third-party geometry incorporated |
| S21 | [Microscope carrying guide, Eclipse E100](https://www.microscope.healthcare.nikon.com/guides/e100/en/page/carrying.html) · Nikon Corporation Healthcare | Carrying the microscope; model-specific two-hand arm grip differs from arm/base laboratory guidance；Reference only; no open asset permission established |
| S22 | [field of view (FOV), Glossary of Microscopy Terms](https://www.microscope.healthcare.nikon.com/en_AOM/resources/glossary/field-of-view) · Nikon Corporation Healthcare | Definition: field number divided by objective magnification; circular field diameter；Reference only; no open asset grant established |
| S23 | [BIO 1406 Laboratory Manual, 12th ed., Exercise 4 laboratory procedures](https://accmultimedia.austincc.edu/biocr/1406/labm/lab_procedure_files/lab_procedure_4.pdf) · Austin Community College, 2006 | Printed 4-8 / PDF page4: Onion Bulb Cells, subsection c; non-photosynthetic tissue and membrane visibility limits；Reference only; no open asset grant established |
| S24 | [BIOL 212 Botany Laboratory Manual §1.5 Cell Structures and Organelles](https://bio.libretexts.org/Courses/Harrisburg_Area_Community_College/BIOL_212%3A_Botany_-_Laboratory_Manual/01%3A_Lab_1-_From_Prokaryotes_to_Eukaryotes/1.05%3A_Cell_Structures_and_Organelles) · Brad Basehore and Rae Dennis, Harrisburg Area Community College / LibreTexts | Onion Cells; paragraph immediately following onion drawing task and chloroplast question；CC BY-NC 4.0 indicated by page metadata, outside the brief’s asset-licence list; factual reference only |

### 6.5 每个派生文件的许可家族

| 文件 | 内容来源 | 家族与处理 |
|---|---|---|
| cells parts.json / microscope-field geometry | 原创程序化，科学事实参考S03–04；可参考PD S17–18 | 原创Atlas CC BY-NC-SA；OpenStax改编文字同家族 |
| 本轮facts/spec/captions | 原创事实释义，有限短引 | Atlas CC BY-NC-SA；引文原权利不变 |
| sources/openstax-*.html | 当前OpenStax Biology2e | 原样保留CC BY-NC-SA attribution；不导入第三方图像 |
| cells.png / cells-microscope.png | 新生成图版+尺寸/灰度/alpha规范化 | Atlas生成资产；CC BY-NC-SA项目内容 |
| cells-systems-link.png | 复制现有generated heart-and-lungs.png再规范尺寸 | 原创Atlas图版，非Z-Anatomy mesh派生；CC BY-NC-SA |
| 未使用Z-Anatomy / BodyParts3D | 无 | 不导入；若未来独立引入，须BY-SA独立文件+LICENSE-CONTENT carve-out；严禁混入上列BY-NC-SA派生文件 |

仅在实际派生第三方 share-alike 文字或资产时登记 LICENSE-CONTENT / THIRD-PARTY-NOTICES；原创模型与事实释义不加无谓例外。ODbL/ODC-BY获准但本题无适用数据；不得只因可用而拉取。

## 7. 配图计划与成品

| file（art/planned/cells） | kind / chapter | subject与事实检查 | 来源 |
|---|---|---|---|
| cells.png | cover；00/03 | 两独立cell cutaway；植物壁膜分开、1液泡、侧核、6周边叶绿体；动物1核无壁无叶绿体；数量DESIGN | 新生成；F-B04–F-B12,F-D05 |
| cells-microscope.png | figure；01/05/06 | 1目镜、3不同长度物镜、最低倍在位、stage/slide/coverslip和下方照明光轴、调焦；不教图版中看不见的光学细节 | 新生成；F-M05,F-D06 |
| cells-systems-link.png | figure；07 | 两肺、气管及分支、心位于两肺之间；只承接系统链接，不声称是细胞微观图像，不从图推断交换过程 | 复用art/planned/heart-and-lungs/heart-and-lungs.png；F-C04,F-REP01 |

最终检查以manifest.jsonl与image-qa.json为准；原始generation保留，目标size cover1024²、figure1536×1152，RGBA、中性等RGB、无文字/箭头/纸纹/影子、alpha外围透明、主体不触边。生成prompt与每次纠错保存在prompts.json。

## 8. 施工顺序与验收

### 8.1 本轮施工顺序

1. 采用本轮scope → E-C1纯模型及校验 → E-C2观察field → 按reference建程序化细胞和仪器 → 内容与40拍 → 双语/主题/尺寸QA。将准备文件映射为生产schema，保留来源追溯。
2. 建立design:true来源；迁入F-id来源映射；确认OpenStax当前 licence/individual credits；只迁入已核开放图片。
3. 仪器接触/光轴、模型空间位置、观察结构清单分别验收；最后才运行app各门槛与截图。

### 8.2 接受清单（施工时）

- [ ] 2023 quote与页码和syllabus-verification一致；不得显示P5详细Cell System是2023明定。
- [ ] 8章40拍；每拍EN/ZH caption、visible change、fact ids；读者每次只看见一个主要变化；EN≤45词。
- [ ] 所有3共同结构有作用说明；wall在membrane外；植物有侧核和液体大液泡；动物不画wall/chloroplast；动物小vesicle省略有说明。
- [ ] 洋葱鳞茎与green leaf反例明确；不能把细胞形状或一个结构暂看不到当作唯一分类依据。
- [ ] 3D厚度、放大2000×、膜壁夸张均有模型说明；field里的光学限制不被cutaway结构覆盖。
- [ ] 仪器1目镜3物镜；最低倍最短、active optical axis对准slide aperture；任一pose与slide保持正间隙。
- [ ] E-C1 T1–T15通过；输出finite，input非法拒绝或按URL规则回default。
- [ ] E-C2倒像同时翻转两轴；target右移→像左移；缩field仍保持同一真实目标尺寸。
- [ ] 同一焦点下near/far层清晰度不同；illumination0变暗但不伪改数学倍率与clarity；无清晰度百分UI。
- [ ] TryIt按钮/键盘共store、触控≥44px、低倍定位/centre/high/fine可走通；记录按当前vary，刷新清除遵循现有语义。
- [ ] 每章index所有项可选；无隐藏对象空点击；labels≤6且在镜头与cut保留侧内。
- [ ] plant/living-things/digestive-system/heart-and-lungs四个locale链接正常，语言切换保留scene状态。
- [ ] paper/cinema × EN/ZH逐拍检查、390×844手机抽屉可看field；HUD不压模型，底部仅章节轴。
- [ ] 离线可用、外部运行时请求0、新依赖0；满足工程预算。
- [ ] pnpm check / validate / test / build 全绿；按本轮 brief，shoot 与 e2e 禁止在 sandbox 运行，由主会话以 ATLAS_E2E_PORT=5451 执行并人工看双语双主题及手机截图。published 为用户指定，不表示浏览器门槛已通过。
- [ ] 图片3张最终size/alpha/equalRGB/边距通过，manifest记录new/reusedFrom及实际tries，所有下载有url/licence/bytes/hash。
- [ ] 每个派生文件许可家族明确；CC BY-SA与CC BY-NC-SA从未混入同一派生文件。

## 9. 施工记录（施工后填写）

### 9.1 E-C1 / E-C2 引擎（2026-10-29）

两项保留工作均已实现。`microscope-schema.ts` 提供严格、有限、双语配置与来源校验；`lib/sim/microscope.ts` 提供无 DOM 的 `solveMicroscope`、逐特征焦点、有限实例、圆盘与椭圆/多边形相交检查、`MicroscopeInputError`。`microscope-patterns.json` 是原创标本模板；`microscope-fixture.ts` 的 `makeMicroscopeSim('S20')` 与 `MICROSCOPE_DEFAULTS` 可复用，不复制引擎逻辑到内容。

数据形状为 `sim.kind: microscope`、七个 controls、`microscope: { controls, ocularPower, fieldNumberMm, objectives, specimens, patterns, sources }`；pattern 含 `periodUm/originUm/tileRange/features`，feature 含 `id/kind/role/atUm/axesUm|pointsUm/contrast/parentCell`。六个数值和三个状态 quantity 均可查询；生产声明四个输出：总倍率、视野直径、焦点状态、观察状态。三标本有限片上界分别为 75/968/243 个 feature 实例；每次只有一个标本。

`hud/MicroscopeField.tsx` 以 token Canvas 绘圆形视野，使用复用的 512² 离屏缓冲按深度合成。≥1024px 替代过程链卡，较窄屏幕在 TryIt 内提供同一观察状态的唯一可见视野；有图像 aria-label、标本/倍率/视野/焦点文字和结构清单。API `microscopeField()` 与 §4.4 一致，其他主题返回 null。打开观察恢复 assembled、explode 0、cut none；原有控件、记录、URL、pose/offset/rotate 继续复用。注册与 source validation、SimOverlays 排除分支、PLATE 开关、shoot 数值/Canvas 检查、docs/06 均为小范围增量。

**明确差异 / 最小补充**：

1. 配方可省略，schema 默认原创三模板；实际生产 JSON 明列全部配方，静态站不依赖准备目录。
2. 每模板最多三个光学深度层，明确落实预算；focus-z 独占获得 41 个 step 值的例外，以支持指定的 −20…20；其他模型仍受 24 值上限。
3. TryIt 的 also 上限仍为四；七控件分布在 04/05/06 三卡，没有扩展记录或通用控件 DSL。观察状态作为第四个输出供 06 记录；PLATE 仅显示两项数值，状态留在视野与 TryIt。
4. 内容中细胞解释模型与仪器分时显示。既有 index 点击仅选择零件会选到隐藏模型，因此添加 microscope-only 回调：`microscope-index.ts` 找本章明确显示该对象的已有拍，先恢复该拍再选中；没有新增内容字段，其他主题行为不变。
5. draft 夹具为 `sample-microscope`，两章十四拍；`microscope.test.ts` 56/56，覆盖 §4 算例、严格非法输入、有限片、倒像、不同深度、明暗、URL 编解码与索引恢复。六条 sample e2e 已编写，未运行。

### 9.2 生产内容、几何与素材

`cells` 按用户指令为 **published**：背景 + 七章、40 拍、三张 TryIt 卡、29 个可选逻辑零件、四组、六个命名镜头、三套完整物镜姿态；零流、零常动动画；24 来源、16 名词、封面一张和两幅独立正文图（三次 Figure 引用）。正文各章 EN 218–255 词 / ZH 354–371 字，2–3 块细看；所有英文字幕 ≤45 词。每章索引有可见匹配拍，各拍完整设置七个 sim 值，避免前拍残留。

`pnpm tsx scripts/geo/cells/generate.mjs` 重建完整 parts/sim/bindings/telemetry；程序化几何不引用外部 mesh。动物膜采用十五片薄椭圆环形成扁平中空包络，局部层纹为已知几何妥协；植物壁/膜中空独立，六片细胞质排除中央液泡和侧核，三组双实例合成六个叶绿体。CPU 测试覆盖空腔、包络、计数、物镜光轴与玻片间隙、完全分离时的细胞件包围盒。显微镜 pivot 调为 `[.20,.23,-.011547005]`，三镜头仅一个在 `[.18,y,0]` 光轴上；slide/coverslip 中心 Y 为 .1725/.17315，40 倍物镜底端 .177，余隙 .0037 m。均为可读设计，不是实测仪器。细节见 `scripts/geo/cells/README.md`。

原准备表的 00.1/00.2 隐藏了字幕所说的叶/组织，已改成实际显示对应对象；来源去前导零，F-id→S-id 与逐拍证据见 SOURCES。MOE 2023 两条引文共 20 词，印43/56页，细胞细部与显微镜明确标作本次深化。没有把旧纲 Cell System 当作新纲详细目标，也没有把看不见结构说成结构不存在。

已用 `illustrate.ts` 处理三张批准 PNG，并在处理前后实际查看。封面 800/1600 方形 WebP 为 88/248 KB，显微镜与心肺图 1200×900 为 75/97 KB；透明边距与原始比例保留。心肺图为既有 Atlas 生成资产，非 BY-SA 人体 mesh。无第三方图片、网格或数据库派生文件；原创事实释义与设计不新增 LICENSE-CONTENT 例外，OpenStax 等事实参考及许可在 SOURCES 保留归属，未混合 share-alike 家族。

四个 TopicLink 均使用 locale/base helper，连接 plant、living-things、digestive-system、heart-and-lungs；各主题既定章节各增加一句返回链接。首页 smoke 更新为 49 published / 98 badges / biology 16，图版、插图和 ww2 序号同步。未改其他主题状态。

### 9.3 门槛、差异与交接

| 门槛 | 最终结果 |
|---|---|
| `pnpm check` | 0 error / 0 warning；4 个既有 hints；971 文件 |
| `pnpm validate` | 87 topics；0 error / 0 warning |
| `pnpm test` | 222 文件；5521/5521，通过；本轮 73 条 = 引擎56 + 几何9 + 内容8 |
| `pnpm build` | 通过；177 页；既有 Vite large-chunk 提示保留 |
| `git diff --check` | 通过；没有 git 写操作 |
| `pnpm shoot cells --beats --tasks --keys --layout --locale en,zh --theme paper,cinema` | 按本轮 brief 禁止在 sandbox 执行；0 张浏览器截图 |
| `CI=1 ATLAS_E2E_PORT=5451 pnpm e2e` | 同上，未运行；cells 12 条、sample-microscope 6 条已编写 |

日志在 `/private/tmp/atlas-cells-{check,validate,test,build}.log`。第一次集成检查发现 beat 内误带 sim.try、sample beat id、06 未声明的观察量及来源前导零不一致，均已修正；内容单测起初误从仅声明输出的 evaluateSim 读取内部 quantity，改为同时核对纯解算结果后全量通过。没有留下失败项冒充通过。

CPU 实际生成 76,120 三角形、39 geometry pieces / material slots，低于静态目标；40 拍标签锚点在所写 16:9 相机视锥中。**这些不是实际 draw calls、GPU fps、HUD 避让或手机视觉证明**。运行时绘制、加载、真实响应式与两套主题仍待浏览器验收；没有声称满足首屏 JS/GPU 预算。

**给 Gavin / 主会话**：REVIEW.md 列全部默认值与逐段复核点。优先核对 2023 锚点与拓展范围、中文术语、教师指导和预制玻片安全段落、典型植物/上皮细胞及洋葱反例、模拟焦点与实测的区别；再跑指定端口浏览器门槛，人工看 EN/ZH × paper/cinema、40 拍、390×844 手机抽屉、标注、索引切回可见拍与记录流程，并补实际性能。published 是用户指定状态，不等于这些浏览器检查已通过。无提交、安装、依赖或 package/lockfile 改动；review-queue 与 next-batch 未编辑。

### 9.x 浏览器验收（Claude Sonnet 5.5，2026-10-30）

`pnpm shoot cells --beats --tasks --keys --layout --locale en,zh --theme paper,cinema` 四组合全绿：40/40 拍、8 个版面尺寸（3840×2160…390×844）0 布局问题、按键 0 失败、控制台干净；肉眼看了 8 章（paper/EN）、2 章 cinema、3 张 390 宽中文和显微视野 4×/10×/40× 的桌面图。`--perf --gpu`：draw calls 最多 26（静止 <50、观察 <60），最大 67,518 三角形（<0.3M）；首屏 JS 541.2 KB gz，与 aircon 相同（共享 SpaceScene 包）；fps 在机器满载（load ≈ 65）下 29–61，不作为预算证据。回归：sample-microscope、heart-and-lungs、aircon 的 `--beats --keys` 无控制台错误。

修了四处：(1) `scope-whole` 镜头切掉目镜，调远并抬高；(2) 视野 `brightness(illumination)` 把默认 0.5 压成深灰，改为 0 保持黑、其余 0.5+illumination/2；(3) 视野卡片加 8×10 px 内边距（文字原先贴边）；(4) 视野开启时 X / E / C 键静默无效，现在按钮置灰（sample-microscope 脚本检查曾因此失败，补了 e2e）。两条 e2e 测试修正：URL 重放前等待 1.2 s 去抖；手机用例先展开阅读抽屉。

遗留：动物细胞模型在 paper 下很淡（扁平半透明椭球，靠透视/剖切才读得出）；`power-and-field` 与 `microscope-safely` 个别拍的“目镜/40× 物镜”标签在镜头内不可见（镜头已改善，40× 物镜在转盘后方被遮挡）；视野里洋葱细胞为矩形格，示意性强。
