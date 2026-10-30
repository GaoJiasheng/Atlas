# 太阳系与恒星 · 内容施工 spec（solar-system，SpaceScene；v1.0）

2026-10-29。**本轮定稿并施工，状态按用户指令 published；§0 为默认决定，供 Gavin 后审。** 结构照 docs/44–52；基础研究为 `solar-system-research.md`、`facts.json`、`sources.json`、`datasets.json`。本主题没有拆分的 sibling，因此省略拆分说明。字幕为本轮生产内容的审阅依据；实现差异记§9。

任务：能区分恒星、行星与较小天体，比较八颗行星的大小、参考距离与公转周期，解释大气闪烁和夜空的视运动，辨认新加坡可探索的星空图案，理解光年与银河系的包含关系。[F001–F044] 默认 paper，cinema 可切；SpaceScene / Model3DStage，程序化几何，不用天文照片贴图，不接外部运行时服务。

## 0. 决定（本轮采用的默认值）

| # | 决定与默认 | 理由 / 退路 |
|---|---|---|
| D0-1 | `subject: science`，`engine: space-scene`，规划标签 `beyond-syllabus`；背景 + 7 主章，40 拍 | P4 光、P6 太阳与能量是直接接口；天文范围属拓展。[C001–C003] |
| D0-2 | 原型 = 多尺度天文模型台；太阳系轨道、光路台、地平天球、星系模型是分开的教学工位 | 不把几千米模型、相对光强和星系放进一个假装真实的场景尺。[D001–D004] |
| D0-3 | 只链接已发布 `sun-earth-moon` 的昼夜、四季、月相与食 | 不重讲四套机制、不复制其章节；复用既有轨道向量数学与显示绑定；不复制这些现象的章节。仓库依据 docs/44 与该 topic.yaml。 |
| D0-4 | 三种学生读法：轨道总览（示意）、大小并排（大小同比例）、距离尺（大小/参考距离同比例）；微小球体不另放大。原始true-scale轨道开关留引擎夹具 | 披露必须在当前画面可见，不能只藏在细看。[F009–F020,D001–D002] |
| D0-5 | 默认行星运动采用圆形、共面、匀角速教学模型；半径取 JPL 参考半长轴，周期取 JPL 恒星周期；起始相位为 DESIGN | 真实轨道是椭圆、速率变化；本模型不是当天星历。JPL 全表保留作参考，不宣称实现了它的拟合星历。[F018–F020] |
| D0-6 | 新增小型 `sim.kind: solar-system`，以可直达的时间步比较；保留旧 `orbit-rotation` 严格 schema 与输出 | 旧 schema 固定 Sun/Earth/Moon 三体、13 控件、23 输出、全年日出表和指定来源 S33/S36，不能拿来直接装八行星。 |
| D0-7 | 采用 HYG v4.1 最小星点样本；独立 CC BY-SA 文件、独立许可清单 | Atlas NC-SA 文字、线图与生成图绝不写进星表派生文件；LICENSE-CONTENT 独立例外。[F043] |
| D0-8 | 新加坡默认位置 = 近科学馆的教学输入（不是官方精确测绘）；日期选择四个固定 2026 示例日；星点坐标固定 J2000，显示为近似教学天空 | 不给升落预报、星历精度、天气或夜空可见度保证；不混入导航用途。[F033–F035,F041] |
| D0-9 | 星座章主讲猎户座、南十字座、天蝎座；连接线是少量原创识别辅助线 | 图案不等于物理星团，IAU 区域不等于唯一文化图案。[F031–F032,F042] |
| D0-10 | 每章至多一张试一试卡；先口头/点选预测再换时间步，不加必答评分测验 | M001–M004 支持先看视点、再对照模型；不宣称本卡经过学习成效试验。 |
| D0-11 | 三张新图：土星封面、双彗尾、银河系结构；已有 art/planned 全部先做适用性检查，没有合适复用 | 现有三体仪、四季/月相图会重复排除内容；火箭图不代表行星结构。 |
| D0-12 | 数字均有 fact id；物理量与 DESIGN 显示量、SIM 派生量分列 | 真实大小/距离来自 F010–F018，示意摆放不伪装测量结果；图案距离不当最新恒星距离出版。 |

## 1. 课纲对照、范围与写法

### 1.1 课纲与链接

Science 2023（缓存为 Jan 2026 更新版）印 p.75 的光与看见、印 p.78–80 的太阳与能量提供接口；完整可核对的 PDF 短引文、页号与 sha256 见研究 dossier §a 和 `cached-syllabus-provenance.json`。[C001,C002] SS 2020 印 p.23 的本地环境可作观察背景，不提供行星/星座学习成果。[C003] 不写成 PSLE 必考内容。

| 链接目标 | 本主题何处链接 | 已有内容边界 |
|---|---|---|
| sun-earth-moon（published） | 00 最后一拍、05 最后一拍、03 月球细看 | 昼夜、四季、月相、日月食；按现存章节 id 解析链接，见下表 |
| light-and-shadows（published） | 01 发光/反光，04 光路 | 直线传播、遮挡与看见；大气折射是本主题新增背景。[C002,F028] |
| forces（published） | 01 引力细看 | 推拉/重力概念；本主题不做 N-body 引力游戏。[F003,F019] |
| energy-conversion（published） | 01 太阳能量细看 | energy-from-the-sun：能量链，不复制发电机或光合作用模型。 |
| inside-the-earth（published） | 02 地球固体表面细看 | 地球内部另看该主题；气态巨行星没有可站立硬表面。[F006] |
| saturn-v（published） | 00 可选延伸 | 火箭 Saturn V 与土星 Saturn 的名称区别；不加航天史章节。 |

已从现有MDX核实的跨主题章节id：sun-earth-moon `a-turning-earth`（05末拍）、`a-tilted-year`（00延伸）、`one-moon-many-views`（03细看）、`alignment-and-eclipses`（00延伸）；light-and-shadows `seeing-light`/`straight-lines`；forces `gravity-and-weight`；energy-conversion `energy-from-the-sun`；inside-the-earth `layers-of-earth`。实际`TopicLink`调用按现有组件契约写，不能把本topic的fact编号当对方来源id。

仓库链接清单来自 `topic-status-snapshot.json`，施工时再次检查状态。未发布的 space-race 不是学习主线依赖。词语用 轨道（路径）/公转（运动），自然卫星不一概叫“月球”，光年是距离。[F021,F036；术语来源 S21,S33]

### 1.2 深度与事实边界

儿童问题是规划探针，正式章名不写问句。主线不做核聚变反应链、八行星百科大全、星座占卜、星座文化全史、星等公式教学或银河动力学。太阳是等离子体、核聚变释放能量只讲到足够纠正“太阳在烧普通火”的程度。[F002,M001] 不冻结卫星总数、系外行星总数或太阳系已知小天体总数。[F022,F023]

### 1.3 误解 → 对照

| 证据 | 预测 | 对照结果 |
|---|---|---|
| M001 | 太阳算不算恒星？星座里的星都靠在一起吗？ | 01 近/远同一球；06 同一角方向、不同距离。 |
| M002,M004 | 两小时后，亮星会在哪里？ | 05 地平观察与外部视点用同一时刻。 |
| M003 | 每晚同一钟点一定看同一星图吗？ | 05 改日期、保持本地钟点；不把逐日变化画成恒星绕地球转。 |
| 教学自选探针（不称实证误解率） | 彗尾必定拖在后面吗？光年是不是一年？ | 03 反太阳方向；07 同一距离换 km/ly。 |

不写“多数新加坡孩子误以为……”或百分比；文献的年龄、样本和地域限制保留在 dossier。[M001–M004]

## 2. 事实表与数值纪律

| 事实块 | 必须讲对 | ids |
|---|---|---|
| 太阳 | 一颗恒星、等离子体、核心核聚变；不是最大恒星 | F001–F004 |
| 分类 | 八颗由内到外；四类地、两气巨、两冰巨；冥王星仍在太阳系 | F005–F008 |
| 尺与钟 | 半径不是直径；AU 定义精确；半长轴不是固定实际距离；共面圆轨道只是教学模型 | F009–F020 |
| 较小天体 | 卫星同时随母体绕太阳；小行星多数在主带；彗尾反太阳；流星不是真恒星 | F021–F027 |
| 从地面看 | 变化空气使光偏折；行星通常闪得较少；日视运动与年视野变化不同 | F028–F034 |
| 新加坡与远方 | 近赤道看南北天；星座图案有深度；光年是距离；银河系包含太阳系 | F035–F044 |
| 原创计算 | 10mm 地球的 AU 尺、星空几何、光行时间、理想圆轨道 | D001–D006 |

### 2.1 行星输入表（源数据，不作当天星历）

下面 radius 是平均半径，`a` 是 JPL Table 1 的 J2000 拟合值；Earth a 是 EM barycentre 代理。`period` 是 JPL 恒星公转年数。[F010–F018,F020] 教学圆轨道仅把 a 当常半径，不同时声称模拟了真实离心率。Sun radius 取 700,000 km 的粗略值（F004），在模型 note 写明近似。

| id | mean radius km | a AU | period Julian years | ids |
|---|---:|---:|---:|---|
| mercury | 2439.4 | 0.38709927 | 0.2408467 | F010,F018 |
| venus | 6051.8 | 0.72333566 | 0.61519726 | F011,F018 |
| earth | 6371.0084 | 1.00000261 | 1.0000174 | F012,F018 |
| mars | 3389.5 | 1.52371034 | 1.8808476 | F013,F018 |
| jupiter | 69911 | 5.202887 | 11.862615 | F014,F018 |
| saturn | 58232 | 9.53667594 | 29.447498 | F015,F018 |
| uranus | 25362 | 19.18916464 | 84.016846 | F016,F018 |
| neptune | 24622 | 30.06992276 | 164.79132 | F017,F018 |

### 2.2 DESIGN / SIM，与真比例分开

DESIGN：1 Julian model-year = 31,557,600 s；body phase0 全取 0 rad，故 t=0 人为同向排开，永久显示“初始位置为教学排列 / Teaching alignment, not today’s sky”。轨道共面；不模拟自转方向/速度，以免让视觉转动被误读为真实 Venus/Uranus 自转。Sun 在原点固定，省略太阳绕重心的运动。[F019,F020；DESIGN]

SIM：`theta = theta0 + 2π t/(periodYears*Y)`，`pKm = (aKm cos theta,0,-aKm sin theta)`；物理输入永远是 km/s/rad。`completedTurns=t/P` 不取模，位置角取模。这里没有实时日期，所以本地 sky-date 不改变行星相位。[D005；DESIGN]

若地球直径 10 mm，行星的直径约为：水星3.83、金星9.50、地球10.00、火星5.32、木星109.73、土星91.40、天王星39.81、海王星38.65 mm；同尺 1 AU =117.405m，太阳约1.099m，海王星 a 约3530.36m。[F010–F018,D001,D002；舍入值以 oracle 文件计算结果为准]

## 3. 对象、分区、数据与图版

### 3.1 分区与工位

| 区 | group id | EN / ZH | 几何 / 用途 | 比例与约束 |
|---|---|---|---|---|
| 01 | solar-family | Solar family / 太阳系天体 | Sun+八行星、轨道线；球体+土星薄环 | 轨道、大小、距离三种实验分开读；F005–F020 |
| 02 | small-bodies | Small bodies / 较小天体 | Moon/Earth 局部示意、小行星标本、稀疏主带、彗核/彗发/双尾、流星对照、Pluto | 全为明确“不按比例”的局部示意；不把流星放进外太空轨道；F008,F021–F027 |
| 03 | light-and-air | Light and air / 光与空气 | point/disc 发光源、分层空气、光路、观察者 | 示意相对起伏不标真实星等或湍流物理数值；F028–F030 |
| 04 | local-sky | Local sky / 本地天空 | 28 星点、地平环、观察点、方向刻度、原创 pattern links、深度视图 | HYG 位置；地平环是天球几何，不是地理地图；F031–F035,F041,F043 |
| 05 | galaxy-context | Galactic context / 星系背景 | 光行尺、Proxima marker、薄盘/中央棒、Sun inclusion marker | 银河系是结构示意；没有精确手臂数、当前位置图或可量测边界；F036–F040,F044 |

各 lab 只显示对应工位，整体不做爆炸图。`cutaway` 只用于 01 的太阳核心示意，没有真实层厚的承诺。X-RAY 不应用到整片天空；天空和星点不得接棚灯阴影。Sun 与恒星是自发光源；行星表面棚灯只帮助看清球形，不模拟日照；发光/反光以独立光路线稿表示，避免重讲昼夜。[F001–F003,C002]

### 3.2 parts 计划（生产时才创建）

可选 id：`sun,mercury,venus,earth,mars,jupiter,saturn,uranus,neptune`；`saturn-rings` 与土星共享姿态，不计第九颗行星。`moon-demo,asteroid-specimen,asteroid-belt,comet-nucleus,comet-coma,ion-tail,dust-tail,meteor-demo,pluto-demo`；`star-source,planet-disc,air-layer,light-rays,observer,horizon,sky-stars,orion-pattern,crux-pattern,scorpius-pattern,depth-stars,north-pole-marker`；`scale-ruler,light-ruler,galaxy-disc,galaxy-bar,sun-location,proxima-marker`。共 37 个语义 id（其中 stars/links 是批量绘制的可选组，不为每个 catalogue 行建一个 React 组件）。

每颗主行星 summary：先说类别、位置/作用，再在 detail 列 mean diameter、a、period 与来源。不用“气体球全部是空气”或“冰巨行星表面都是冰”。选中行星会显示其真值与本视图放大倍率；所有章里提到的对象列入 `state.index`。[F006,F010–F018]

### 3.3 数据文件及许可隔离

| 本轮文件 / 未来用途 | 内容 | 许可族 / 接线 |
|---|---|---|
| data/planet-reference.json | 八行星 mean radius、a、period，meta 说明 | CC0 数值转录；未来复制为独立物理输入，不含 HYG 行 |
| data/jpl-elements-table1.txt | JPL 第一张表，8条值/8条速率 | 公共数值；只供核对，不暗示当前 solver 实现 JPL 星历 |
| data/stars-hyg-v41-cc-by-sa.json | 28条最小星表，J2000 RA[h]/Dec[deg]/dist[pc]/mag，source hash | **CC BY-SA 4.0**；独立目录/派生文件/署名，不混 NC-SA |
| 未来 pattern-links.json | 少量本项目原创连线，引用 HIP id | Atlas CC BY-NC-SA；独立配置，运行时引用星点，不把它合进星表派生物 |
| 未来 sources.json / glossary.json / parts.json | 独立双语文字与模型设定 | Atlas CC BY-NC-SA；来源引用不复制受限整页 |

HYG distance 是该版本的星表估计，不是最新距离测量。深度视图只说明“同方向并非相邻”；不出版 Betelgeuse 等不确定距离为精确主线读数。Proxima 主线距离采用 F037 的约4.24ly。未知/哨兵距离须屏蔽；即使星等大于显示阈值，也不能把 Proxima 画成肉眼可见亮星。[F032,F037,F043]

### 3.4 真实样本覆盖与最小 pattern-links

样本覆盖 Ori≤3mag 8条，Cru 4条，Sco 13条，另 Polaris/Sirius/Proxima 3条，共28条；分组计数以 `data/INVENTORY.md` 的实际核验为准。主图默认裸眼教学亮星阈值 mag≤3，选中 Proxima 只能出现在带“位置标记，不代表可见”的目录/距离视图。[F043；DESIGN，目录选择不是实际新加坡能见极限]

原创连接线默认：Ori belt `25930–26311–26727`，肩/腿辅助 `25336–27989,25336–25930,27989–26727,25930–24436,26727–27366,24436–27366`；Crux 十字 `61084–60718,59747–62434`；Sco 开放骨架 `78820–78401–80763–82396–82514`，其余弯尾点只按 catalogue 显示、不臆造缺失星点。此处仅是原创识别辅助线，**不称完整 IAU 星座边界或官方线图**。每条边端点必须在样本，星点坐标绝不手画；读数和截图核验可以直接查 HIP。[F031,F032,F041,F043；DESIGN]

绘制预算 DESIGN：九天体 <20 draw calls，8轨道共用几何/材质，星点一个 instanced/Points draw，连线至多3个 draw；主题静止 <50、运行 <60，三角形 <0.3M；目标≤300KB gzip 首屏 JS，真实测量后填验收，不在准备阶段报“通过”。太阳核心、彗尾、星系均程序化，不用 glb 和照片贴图。

## 4. 引擎（最终最小契约）

### 4.1 逐项去重与复用

2026-10-29 已核对 main 的 docs/06、src/engines 与 `git log main..codex/{monsoon-engine,sem-engine,airfoil-content,dinosaur,plates}`，并读相关 `git show`。前四分支引擎已在 main；plates 的参考层、目录检查器与撞击记录为 TimeScene，不用于本题。现有 table/pose/shift/rotate/glow、light、magnet、circuit、materials 足够承担静态显隐、姿态、定性亮度和局部示意。无 unmerged code 依赖。

保留两项：E-SS1 天文纯函数求值及一个通用数值 scale 绑定；E-SS2 目录天球图层。删除草案专用 systemBodyTransform/systemSolarIllumination、system-orbit-guides、重复 session/clock/ss-t、专用 observation card。复用 `orbit-rotation.ts` 的 RAD/unit/wrap 等数学；旧三体 schema/输出/会话原样兼容。新内容以离散 elapsed-years / sky-hour / twinkle-seconds 控件直接比较，所有拍 paused，不承诺连续播放。现有全局运行不应被描述成真实天文时间。用户明确要求的昼夜/四季/月相/食只链接 docs/44 已发布主题。

### 4.2 E-SS1 配置、输入、输出与绑定

`sim.kind:'solar-system'`，`solarSystem:{version:1,bodies:[{id,radiusKm,aAu?,periodYears?}],controls:{lab,elapsedYears,planet,scaleMode,skyDate,skyHour,observer,skyTarget,patternLinks,depth,atmosphere,sourceKind,altitudeMode,twinkleSeconds,cometStep,distanceTarget},patterns:{orion:[[hip,hip]],crux:...,scorpius:...},sources:['S5','S6','S37']}`。键映射到 controls 的 kebab-case id，一对一；Sun+八行星恰九体，Sun不写轨道，行星参数严格有限且>0，无重复 id。来源必须存在；未知输出、错误 kind、漏配置、错误范围要给路径错误。

默认 lab=orbits；其余 lab=sizes,distances,small-bodies,twinkle,sky,galaxy。elapsed-years=[0,.25,1,12,30,84,165]；planet=八行星；scale-mode=overview,true-scale；sky-date=2026-01-15/04-15/07-15/10-15；sky-hour=[0,2,4,18,20,22] SGT；observer=singapore,equator,north45；sky-target=orion,crux,scorpius；links=true/depth=false；atmosphere=true/source-kind=point/altitude-mode=high；twinkle-seconds=[0,1,2,3,4]；comet-step=[0,90,180,270]；distance-target=sun-earth,neptune,proxima,milky-way。

输出：物理 `planet-frame` vector（id.xKm/yKm/zKm/radiusKm/turns）；显示 `display-positions` vector（part:x/y/z/shown）；`radius-<body>` number；selected `planet-diameter-km,reference-au,period-years,completed-turns` number；`scale-state` state；`twinkle-flux` number、`twinkle-state` state；`comet-angle` number/位置 vector；`light-distance-km,light-time-seconds` number。实际命名可在§9记录精确对应。

物理：Y=31557600s，AU=149597870.7km，theta=2π*elapsedYears/periodYears；p=(aKm*cosθ,0,-aKm*sinθ)，turns不取模。phase0=0 为教学排列，非当天星历。overview rho=5sqrt(aAu)，球半径为DESIGN；true-scale k=10/AU，中心/半径都乘k；sizes 行星半径=R/69911，间隔为排版；distances 中心沿x取aKm*k、球取真k。每种读法当拍常驻说明，大小改变不改物理输入。

既有 shift 绑定把球移到输出中心；新增通用 `scale:{per:1}` 绑定以非负 scalar 均匀缩放单位球，禁止非数值/负值模型输出与冲突的变换 writer。例：`{output:'display-positions',part:['sun','mercury',...],shift:{ease:0,stagger:0,lift:0}}`；`{output:'radius-earth',part:'earth',scale:{per:1}}`。glow/rotate/visible继续复用，不建重复binding。

### 4.3 E-SS2 目录天球与许可

28条 HYG v4.1 数据保持独立 CC BY-SA 4.0 文件，不进通用 topic data bundler、不与NC-SA文字/原创连线合并派生文件。单独静态目录资源或独立软件模块读取；源hash、许可和署名可核验。原创pattern边在配置中按HIP引用；未知端点、自连、重复无向边报错。目录RA hours∈[0,24)、Dec degrees∈[-90,90]、唯一id；无效距离不当0距离。

采用S30近似GMST，UTC=Date.UTC(date,skyHour-8)，不读浏览器本地时区。JD0为UTC日0h，D0=JD0−2451545，H为UT小时，T=(JD−2451545)/36525；GMST=mod(6.697375+.065709824279D0+1.0027379H+.0000258T²,24)。LST=GMST+lonEast/15。Hrad=15(LST-raHours)°；east=−cosδsinH；north=sinδcosφ−cosδcosHsinφ；up=sinδsinφ+cosδcosHcosφ；alt=asin(up)，az=atan2(east,north)，天顶不输出NaN方位。

图层 `catalogue-sky` 用Points/LineSegments，地平固定；mag≤3且up>0只表示几何教学筛选。选中target/date示例同§5。links开关不移动星点；depth沿原星方向以目录pc同尺摆放，并明确历史距离估计。J2000固定，不做岁差/章动/自行/天气/折射/地形/消光，不输出升落预报。近赤道位置为教学输入(1.3342,103.7357)，不称科学馆官方精确测绘坐标。

### 4.4 可复用的小模型与验收数值

闪烁：A=0(无空气)/.1(high)/.3(low)，ω=2π/4，Ij=1+A*bj*sin(ωt+phasej)，b=[1,.8,.6,.4]、phase=[0,π/2,π,3π/2]，point=I0/disc=平均。任意单位、定性示意，不是天气/星等实测；运行改为时间步对照。彗核E四步，p=(3(cosE−.6),0,−2.4sinE)，antiSolar=unit(p)，直离子尾沿反太阳方向、尘尾偏15°示意，不依据速度反向。光年=cY，c=299792.458km/s；目标1AU、30.06992276AU、4.24ly、100000ly（银河系粗略盘直径，不是太阳到边缘）。

| case | 输入 | 期望 |
|---|---|---|
| O1 | a=1AU,P=1y,elapsed=.25 | (0,0,−149597870.7)km，turn=.25 |
| O2 | 同上elapsed=1 | (149597870.7,0,0)，turn=1 |
| O3 | 真实Earth/ Mercury/Neptune，elapsed=1 | turns=.9999826003027548/4.152018690727338/.006068280780808115 |
| O4 | Earth真比例k | radius≈.0004258756m；换scale物理frame不变 |
| O5 | Earth直径10mm | Jupiter109.7330212mm；1AU117.4051746m |
| S1 | φ0 δ0 H−90/0/+90 | east/zenith/west，az90/未定义/270 |
| S2 | φ1.3342 δ0 H0；δ−63 H0 | alt88.6658/25.6658°，az180° |
| S3 | δ90，Singapore | alt1.3342° |
| S4 | 2000-01-01T12Z | GMST≈18.6973748878605h |
| T1 | air=false | flux=1，steady |
| T2 | high，t0与t1 | point1/1.1，disc1.01/1.01 |
| T3 | low，t1 | point1.3，disc1.03 |
| C1 | comet E0/180 | p=(1.2,0,0)/(−4.8,0,0)，tail=(1,0,0)/(−1,0,0) |
| L1 | 1AU/1ly | 499.004783836s/31557600s；1ly9460730472580.8km |

还测非法参数、未知输出、错误端点/许可、无距离、时区独立、scale绑定/旧主题兼容。draft sample-solar fixture + unit/e2e写全；浏览器门槛按用户brief禁跑，留主会话。

## 5. 章节与40拍（每拍可直达，字幕双语草稿）

### 5.0 章状态别名与相机

所有 alias 在生成生产数据时展开为**已有 state 字段 + 新 kind 的 sim.set**，不把冒号字符串当引擎字段。`orbits:*` 设置lab=orbits；`sizes:*`/`distances:*`对应lab；`small-bodies:*`按index切显隐；`twinkle:*`对应source/atmosphere/altitude；`sky:*`对应日期/target/observer/links/depth；`galaxy:*`对应distance-target/当前可见工位；`links:*`保持静止画面+TopicLink。所有拍初始run=false，读者用时间步比较快照，不自动播放；节拍切换不自动播放。

必须独立展开的例子：`sky:orion` = Singapore,2026-01-15,20SGT,target=orion,t0；`sky:crux` = Singapore,2026-04-15,22SGT,target=crux,t0；`sky:scorpius` = Singapore,2026-07-15,22SGT,target=scorpius,t0。`sky:links-off`沿用Scorpius这一明确日期但links=false，`sky:depth`明确回Orion日期并depth=true/camera=sky-outside。`sky:two-hours`固定Jan15,sky-hour=22，不依赖前一拍累计；`sky:another-date`固定Apr15,20SGT,t0。`orbits:one-year`的elapsed-years=1，`sun:near-far`只改相机与源显示，不改太阳本体真值。`twinkle:disc`明确air=true/high，`twinkle:low`明确point/air=true/low；compare给point/disc并列同相位参考窗。各图案在所选日期的样本星均在几何地平上，数值范围见INVENTORY和oracle；不保证现实能见度。[F033–F035,F041,F043；DESIGN]

相机preset DESIGN（stage单位m）：`solar-overview`=(0,30,38)→origin；`planet-size-row`=(0,6,17)→rowCentre；`distance-ruler`正交横向适配选定a范围（必须显式正交fit，不把不可见微球放大）；`small-body-close`=(6,4,8)→小模型局部原点；`air-bench`=(0,3,10)；`sky-horizon`观察者眼位、交互yaw/pitch有限制以保留地平；`sky-outside`=(10,7,10)；`galaxy-context`=(8,8,12)。除distance-ruler以外均默认fov30°。这些是起点，截图QA再调，不是天文测量位置。

| ch | lab / camera | 默认状态与 note | 试一试 |
|---|---|---|---|
|00|orbits / solar-overview|overview,run=false；示意倍率常驻|三种尺度按拍比较，保持同一物理输入|
|01|orbits / sun close preset派生|选择Sun；核心只作结构标记|无试一试；太阳近景与正文解释远处恒星，不编“变成另一颗星”|
|02|orbits / solar-overview|earth,t0,overview|预测一年转几圈→统一经过年数快照|
|03|small-bodies / small-body-close|无真实轨道钟，E0|四个comet-step检查反太阳方向|
|04|twinkle / air-bench|point,air=true,high,t0|先预测air开关与disc平均，再选时间步|
|05|sky / sky-horizon|SG,2026-01-15,20SGT,Orion|同一日期选两个相隔两小时的钟点；换日期保持钟点|
|06|sky / sky-horizon|同上；展示target与horizon|按拍换target/日期；试一试只改links/日期/钟点；depth用末拍外部镜头|
|07|galaxy / galaxy-context|sun-earth,run禁用|同一距离换单位，不做虚假实时飞行|

### 5.1 第00章 `reading-a-model` · 读懂模型 / Reading a model

- **规划问题**：这幅图改动了什么？ / What has this picture changed?
- **summary 草稿**：天体被放大了，间距也被压缩了。 / The worlds are enlarged and their gaps are compressed. [D001,D002]
- **正文提纲**：天体被放大了，间距也被压缩了。；这里的行星大小用同一比例；间隔只是排版。；把地球直径缩成十毫米，一天文单位约是117米。；昼夜、四季、月相与食的原理，请看链接的主题。。每项事实沿本表ids回查，不另加无来源细节。
- **state.index**：`sun, earth, neptune, scale-ruler`；隐去的局部工位也能从索引切入对应有效视图。

| 拍 | state alias / 看得见的改变 | Caption EN | 字幕 ZH | fact ids |
|---|---|---|---|---|
| 1 | `overview` | The worlds are enlarged and their gaps are compressed. | 天体被放大了，间距也被压缩了。 | D001,D002 |
| 2 | `sizes:earth` | Here the planet sizes share one scale; the gaps are just layout. | 这里的行星大小用同一比例；间隔只是排版。 | F010–F017 |
| 3 | `distances:earth` | A ten-millimetre Earth puts one AU about 117 metres away. | 把地球直径缩成十毫米，一天文单位约是117米。 | D001 |
| 4 | `links:prior` | The linked topic explains day and night, seasons, phases and eclipses. | 昼夜、四季、月相与食的原理，请看链接的主题。 | C001,C002; repo:docs/44 |

细看：同尺为何看不清地球；44px可点圈与真实球体的区别；太阳系图从未保证当天排列。[D001,D002,F020]

### 5.2 第01章 `our-star` · 我们的恒星 / Our star

- **规划问题**：太阳也是恒星吗？ / Is the Sun a star too?
- **summary 草稿**：太阳是一颗恒星。其他恒星很远，看起来才像小光点。 / The Sun is a star. Other stars look tiny because they are far away. [F001,F004,M001]
- **正文提纲**：太阳是一颗恒星。其他恒星很远，看起来才像小光点。；太阳发出光；行星反射太阳光，才被我们看见。；剖面标出了核心；核聚变在这里释放能量。；太阳的引力把这个行星系统维系在一起。。每项事实沿本表ids回查，不另加无来源细节。
- **state.index**：`sun, earth, star-source, light-rays`；隐去的局部工位也能从索引切入对应有效视图。

| 拍 | state alias / 看得见的改变 | Caption EN | 字幕 ZH | fact ids |
|---|---|---|---|---|
| 1 | `sun:near-far` | The Sun is a star. Other stars look tiny because they are far away. | 太阳是一颗恒星。其他恒星很远，看起来才像小光点。 | F001,F004,M001 |
| 2 | `sun:light` | The Sun gives off light; the planet is visible by reflected sunlight. | 太阳发出光；行星反射太阳光，才被我们看见。 | C002,F003 |
| 3 | `sun:core` | This cutaway marks the core, where nuclear fusion releases energy. | 剖面标出了核心；核聚变在这里释放能量。 | F002 |
| 4 | `orbits:focus-sun` | The Sun’s gravity holds the planetary system together. | 太阳的引力把这个行星系统维系在一起。 | F003,F019 |

细看：核心释放能量与向外传能不等于普通火焰；圆轨道背后的椭圆事实；把引力基础链到 forces。[F002,F019]

### 5.3 第02章 `eight-worlds` · 八个世界 / Eight worlds

- **规划问题**：行星的间隔和公转速度都一样吗？ / Are planets evenly spaced and equally fast?
- **summary 草稿**：从水星到海王星，这是八颗行星由内到外的顺序。 / From Mercury to Neptune, these are the eight planets in order. [F005]
- **正文提纲**：从水星到海王星，这是八颗行星由内到外的顺序。；水星、金星、地球与火星都有固体表面。；木星和土星是气态巨行星；天王星和海王星是冰巨行星。；在同一大小比例下，木星最大，水星最小。；这些参考轨道距离并不是等间隔的。；每条轨道都经过相同的一年；外侧行星绕一圈要久得多。。每项事实沿本表ids回查，不另加无来源细节。
- **state.index**：`sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune`；隐去的局部工位也能从索引切入对应有效视图。

| 拍 | state alias / 看得见的改变 | Caption EN | 字幕 ZH | fact ids |
|---|---|---|---|---|
| 1 | `orbits:order` | From Mercury to Neptune, these are the eight planets in order. | 从水星到海王星，这是八颗行星由内到外的顺序。 | F005 |
| 2 | `orbits:inner` | Mercury, Venus, Earth and Mars have solid surfaces. | 水星、金星、地球与火星都有固体表面。 | F006 |
| 3 | `orbits:outer` | Jupiter and Saturn are gas giants; Uranus and Neptune are ice giants. | 木星和土星是气态巨行星；天王星和海王星是冰巨行星。 | F006 |
| 4 | `sizes:all` | Jupiter is largest and Mercury smallest, on this shared size scale. | 在同一大小比例下，木星最大，水星最小。 | F007,F010–F017 |
| 5 | `distances:all` | The reference orbital distances are not evenly spaced. | 这些参考轨道距离并不是等间隔的。 | F018 |
| 6 | `orbits:one-year` | The same elapsed year is applied to every orbit. Outer planets take much longer to go around. | 每条轨道都经过相同的一年；外侧行星绕一圈要久得多。 | F010–F019,D005 |

细看：a与瞬时距离；mean radius/equatorial radius的区别；冰巨行星没有裸露冰面之意；Pluto分类在03接下去。[F006,F008,F010–F020]

### 5.4 第03章 `smaller-companions` · 较小的天体 / Smaller companions

- **规划问题**：会移动的光点都是行星吗？ / Is every moving point a planet?
- **summary 草稿**：卫星绕着母体公转，同时也随母体绕太阳运动。 / A moon orbits its parent while both travel around the Sun. [F021]
- **正文提纲**：卫星绕着母体公转，同时也随母体绕太阳运动。；多数小行星位于火星与木星之间；这条稀疏的小行星带是示意图。；彗核接近太阳受热时，可能形成彗发和彗尾。；彗尾大致背向太阳伸展，并不总拖在公转方向的后面。；流星是发光现象，冥王星是矮行星；它们都不是掉落的恒星。。每项事实沿本表ids回查，不另加无来源细节。
- **state.index**：`earth, moon-demo, asteroid-belt, asteroid-specimen, comet-nucleus, comet-coma, ion-tail, dust-tail, meteor-demo, pluto-demo`；隐去的局部工位也能从索引切入对应有效视图。

| 拍 | state alias / 看得见的改变 | Caption EN | 字幕 ZH | fact ids |
|---|---|---|---|---|
| 1 | `small-bodies:moon` | A moon orbits its parent while both travel around the Sun. | 卫星绕着母体公转，同时也随母体绕太阳运动。 | F021 |
| 2 | `small-bodies:belt` | Most asteroids lie between Mars and Jupiter; this sparse belt is schematic. | 多数小行星位于火星与木星之间；这条稀疏的小行星带是示意图。 | F023 |
| 3 | `small-bodies:comet` | Heating near the Sun can turn an icy comet nucleus into an active comet. | 彗核接近太阳受热时，可能形成彗发和彗尾。 | F024 |
| 4 | `small-bodies:tails` | The tails extend generally away from the Sun, rather than always behind the orbit. | 彗尾大致背向太阳伸展，并不总拖在公转方向的后面。 | F025 |
| 5 | `small-bodies:compare` | A meteor is a light phenomenon; Pluto is a dwarf planet. Neither is a falling star. | 流星是发光现象，冥王星是矮行星；它们都不是掉落的恒星。 | F008,F026 |

细看：Moon层级而非月相；Mercury/Venus无卫星；彗发随太阳加热而变化；流星/陨石区别。主带不画拥挤岩石墙。[F021–F026]

### 5.5 第04章 `through-the-air` · 穿过大气 / Through the air

- **规划问题**：是恒星自己在闪吗？ / Is the star itself blinking?
- **summary 草稿**：拿掉大气后，模型中的光源保持稳定。 / With the atmosphere removed, this model’s source stays steady. [F028]
- **正文提纲**：拿掉大气后，模型中的光源保持稳定。；变化的空气使这束狭窄的星光发生偏折。；来自行星视圆面不同位置的光，沿不同路径传播，起伏部分互相抵消。；靠近地平线时，星光穿过更多大气，往往闪烁得更明显。；这是定性的比较；行星也可能闪烁。。每项事实沿本表ids回查，不另加无来源细节。
- **state.index**：`star-source, planet-disc, air-layer, light-rays, observer`；隐去的局部工位也能从索引切入对应有效视图。

| 拍 | state alias / 看得见的改变 | Caption EN | 字幕 ZH | fact ids |
|---|---|---|---|---|
| 1 | `twinkle:air-off` | With the atmosphere removed, this model’s source stays steady. | 拿掉大气后，模型中的光源保持稳定。 | F028 |
| 2 | `twinkle:point-air-on` | Changing air bends this narrow bundle of starlight. | 变化的空气使这束狭窄的星光发生偏折。 | F028 |
| 3 | `twinkle:disc` | Different paths from a planet’s disk partly average the fluctuations. | 来自行星视圆面不同位置的光，沿不同路径传播，起伏部分互相抵消。 | F030 |
| 4 | `twinkle:low` | Near the horizon, starlight crosses more air and often twinkles more. | 靠近地平线时，星光穿过更多大气，往往闪烁得更明显。 | F029 |
| 5 | `twinkle:compare` | This is a qualitative comparison. A planet can still twinkle. | 这是定性的比较；行星也可能闪烁。 | F030 |

细看：均匀介质直线传播与大气分层折射并不矛盾；source模型恒定不代表所有真实星永不变光；看不闪不能直接判定是行星。[C002,F028–F030]

### 5.6 第05章 `a-turning-viewpoint` · 转动的视点 / A turning viewpoint

- **规划问题**：恒星为什么会划过夜空？ / Why does a star cross the night sky?
- **summary 草稿**：地平线属于观察者；恒星方向则指向遥远的太空。 / The horizon belongs to the observer; the star direction is far beyond Earth. [F034,F041]
- **正文提纲**：地平线属于观察者；恒星方向则指向遥远的太空。；比较同一日期两小时后的快照，看恒星方向怎样改变。；从外部看，天空的扫过与地球上转动的视点连在一起。；换一个日期，在相同钟点朝夜空看，面向的太空方向会改变。；沿昼夜的链接，继续看地球自转与被照亮的半面。。每项事实沿本表ids回查，不另加无来源细节。
- **state.index**：`observer, horizon, sky-stars, earth, north-pole-marker`；隐去的局部工位也能从索引切入对应有效视图。

| 拍 | state alias / 看得见的改变 | Caption EN | 字幕 ZH | fact ids |
|---|---|---|---|---|
| 1 | `sky:anchor` | The horizon belongs to the observer; the star direction is far beyond Earth. | 地平线属于观察者；恒星方向则指向遥远的太空。 | F034,F041 |
| 2 | `sky:two-hours` | Compare the same date two hours later and see how the direction changes. | 比较同一日期两小时后的快照，看恒星方向怎样改变。 | F034,F041 |
| 3 | `sky:outside` | The outside view links that sweep to Earth’s rotating viewpoint. | 从外部看，天空的扫过与地球上转动的视点连在一起。 | F034 |
| 4 | `sky:another-date` | At the same clock time on another date, the nightward view is different. | 换一个日期，在相同钟点朝夜空看，面向的太空方向会改变。 | F033 |
| 5 | `links:day-night` | Follow the day-and-night link for Earth’s spin and the illuminated half. | 沿昼夜的链接，继续看地球自转与被照亮的半面。 | F034; repo:docs/44 |

细看：星的真实自行与几个小时内近似固定方向；每天同钟点和同一夜逐小时分开比；链接昼夜与四季，不重建原主题图解。[F033,F034]

### 5.7 第06章 `singapore-star-patterns` · 新加坡的星空图案 / Singapore’s star patterns

- **规划问题**：在新加坡能看到南北两边的恒星吗？ / Can Singapore see northern and southern stars?
- **summary 草稿**：这条地平线采用新加坡接近赤道的教学位置。 / This horizon uses a Singapore teaching location near the Equator. [F035]
- **正文提纲**：这条地平线采用新加坡接近赤道的教学位置。；星表给出猎户座亮星的位置；连线帮助我们辨认图案。；南十字座位于南天；能否看见，还取决于日期、钟点与地平线。；换到天蝎座，在同一条本地地平线上比较。；连线是人画上去的；不同文化连接、命名星空图案的方式不同。；这些恒星可能相隔很远；图案取决于我们观看的方向。。每项事实沿本表ids回查，不另加无来源细节。
- **state.index**：`observer, horizon, orion-pattern, crux-pattern, scorpius-pattern, sky-stars, depth-stars`；隐去的局部工位也能从索引切入对应有效视图。

| 拍 | state alias / 看得见的改变 | Caption EN | 字幕 ZH | fact ids |
|---|---|---|---|---|
| 1 | `sky:singapore` | This horizon uses a Singapore teaching location near the Equator. | 这条地平线采用新加坡接近赤道的教学位置。 | F035 |
| 2 | `sky:orion` | The catalogue places Orion’s bright stars; these links help us recognise the pattern. | 星表给出猎户座亮星的位置；连线帮助我们辨认图案。 | F031,F041,F043 |
| 3 | `sky:crux` | Crux is in the southern sky. Its visibility depends on date, time and horizon. | 南十字座位于南天；能否看见，还取决于日期、钟点与地平线。 | F033,F035,F041 |
| 4 | `sky:scorpius` | Switch to Scorpius and compare the same local horizon. | 换到天蝎座，在同一条本地地平线上比较。 | F033,F035,F041 |
| 5 | `sky:links-off` | The lines are imagined; cultures connect and name star patterns differently. | 连线是人画上去的；不同文化连接、命名星空图案的方式不同。 | F032,F042 |
| 6 | `sky:depth` | These stars can lie at very different distances; the pattern is a viewpoint. | 这些恒星可能相隔很远；图案取决于我们观看的方向。 | F032,F043 |

细看：北天极接近Singapore北地平；图案/区域/文化分组之别；cloud和城市天空不是本模型输入；所有连线都能关闭。[F031–F035,F041,F042]

### 5.8 第07章 `beyond-the-planets` · 行星之外 / Beyond the planets

- **规划问题**：恒星有多远？ / How far is a star?
- **summary 草稿**：一光年是距离，约等于9.46万亿千米。 / One light-year is a distance: about 9.46 trillion kilometres. [F036,D004]
- **正文提纲**：一光年是距离，约等于9.46万亿千米。；光走完一天文单位，大约要八分十九秒。；太阳以外最近的恒星——比邻星，距离约为4.24光年。；太阳系属于银河系；银河系里还有大量恒星。；这张外部圆盘图是结构示意；我们实际是从银河系里面向外看。。每项事实沿本表ids回查，不另加无来源细节。
- **state.index**：`sun, earth, light-ruler, proxima-marker, galaxy-disc, galaxy-bar, sun-location`；隐去的局部工位也能从索引切入对应有效视图。

| 拍 | state alias / 看得见的改变 | Caption EN | 字幕 ZH | fact ids |
|---|---|---|---|---|
| 1 | `galaxy:lightyear` | One light-year is a distance: about 9.46 trillion kilometres. | 一光年是距离，约等于9.46万亿千米。 | F036,D004 |
| 2 | `galaxy:au-lighttime` | Light takes about eight minutes nineteen seconds to cross one AU. | 光走完一天文单位，大约要八分十九秒。 | D004 |
| 3 | `galaxy:proxima` | The nearest star beyond the Sun, Proxima Centauri, is about 4.24 light-years away. | 太阳以外最近的恒星——比邻星，距离约为4.24光年。 | F037 |
| 4 | `galaxy:inclusion` | Our solar system belongs to the Milky Way, a galaxy of many stars. | 太阳系属于银河系；银河系里还有大量恒星。 | F038,F039 |
| 5 | `galaxy:outside-inside` | This external disk is a structural reconstruction; our view is from inside it. | 这张外部圆盘图是结构示意；我们实际是从银河系里面向外看。 | F038,F044 |

细看：Proxima不是最亮的那颗半人马座α双星；光年/光行时间不同量；星系盘大小是估计；外部图是重建不是照片。[F036–F040,F044]

## 6. 名词表与来源

### 6.1 主线词汇（独立定义草稿）

| id | EN / ZH | 定义 EN / ZH | fact / 词形证据 |
|---|---|---|---|
| star | star / 恒星 | A body that releases energy from its interior and shines. / 从内部释放能量并发光的天体。 | F001–F002；IAU OAE 331 |
| planet | planet / 行星 | One of the eight major planets in this solar-system lesson. / 本主题讲的太阳系八颗主要行星之一；完整分类定义另作细看。 | F005,F008；OAE253 |
| solar-system | solar system / 太阳系 | The Sun and the bodies bound to it by gravity. / 太阳和受其引力束缚的天体。 | F001,F003；OAE314 |
| orbit | orbit / 轨道 | A path around another body. / 绕另一天体运动的路径。 | F019；OAE232；与公转区分 |
| orbital-motion | orbital motion / 公转 | Moving around another body. / 围绕另一天体运动。 | F019,F021；中文释义独立起草，词形本轮未另核，编辑复核 |
| moon | natural satellite / 自然卫星 | A natural companion orbiting a larger body. / 绕较大天体运动的天然伴星。 | F021；OAE412词形卫星 |
| asteroid | asteroid / 小行星 | A small rocky solar-system body. / 太阳系里较小的岩质天体。 | F023；OAE17 |
| comet | comet / 彗星 | An icy body that can develop a coma and tails near the Sun. / 接近太阳时可能形成彗发与彗尾的含冰天体。 | F024–F025；OAE62 |
| dwarf-planet | dwarf planet / 矮行星 | A solar-system classification including Pluto. / 包括冥王星在内的一类太阳系天体；完整定义细看。 | F008；OAE87 |
| au | astronomical unit / 天文单位 | A defined length useful for planetary distances. / 适合描述行星距离的一个定长单位。 | F009；OAE26 |
| refraction | refraction / 折射 | A change in the direction of light passing between different optical conditions. / 光经过不同光学条件时方向改变。 | F028；OAE282 |
| constellation | constellation / 星座 | A named sky area; a familiar figure is an imagined pattern within it. / 有名称与边界的天区；熟悉的图形是其中想象的图案。 | F031,F032；OAE66 |
| horizon | horizon / 地平线 | The local dividing direction between the sky above and below. / 本地天空上方与下方的分界方向。 | F041；OAE145标签地平，正文用线 |
| light-year | light-year / 光年 | The distance light travels in vacuum in a year. / 光在真空中一年走过的距离。 | F036；OAE178 |
| milky-way | Milky Way / 银河系 | The galaxy containing our Sun and solar system. / 包含太阳与太阳系的星系。 | F038,F044；OAE199 |
| galaxy | galaxy / 星系 | A large gravity-bound system of stars and other matter. / 由引力维系、包含大量恒星等物质的系统。 | F038,F039；OAE119定义正文的通名，不沿用其银河系标题 |

研究词表78条在 facts.json/terms.json 与 dossier §h，不要求78条全进生产名词表。Neptune必须为海王星，拒绝OAE页面的误导标题海神；Crux区域用南十字座、熟悉图案可称南十字星。所有新加坡中文词形都尚无本地独立attestation，编辑时不能标“新加坡标准用语”。[S21,S33；F031,F042]

### 6.2 来源表（parent dossier ids，未来 source-id 可原样采用）

| id | 来源与定位用途 | URL / 许可摘要 |
|---|---|---|
| S1 | MOE Singapore · 2023 Primary Science Syllabus, updated Jan 2026 | [S1](https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf) · research-only; cached official PDF; no redistribution |
| S2 | MOE Singapore · 2020 Social Studies Primary Syllabus, updated Jan 2024 | [S2](https://www.moe.gov.sg/-/media/files/primary/syllabus/2020-social-studies-primary.pdf) · research-only; cached official PDF; no redistribution |
| S3 | NASA Science · Sun: Facts | [S3](https://science.nasa.gov/sun/facts/) · public-domain US government text; third-party media excluded |
| S4 | NASA Science · About Planets | [S4](https://science.nasa.gov/solar-system/planets/) · public-domain US government text; third-party media excluded |
| S5 | NASA/JPL Solar System Dynamics · Planetary Physical Parameters | [S5](https://ssd.jpl.nasa.gov/planets/phys_par.html) · public numerical data; NASA/JPL acknowledgement |
| S6 | NASA/JPL Solar System Dynamics · Approximate Positions of the Planets | [S6](https://ssd.jpl.nasa.gov/planets/approx_pos.html) · public numerical data; NASA/JPL acknowledgement |
| S7 | NASA/JPL Solar System Dynamics · Astrodynamic Parameters | [S7](https://ssd.jpl.nasa.gov/astro_par.html) · public numerical data; NASA/JPL acknowledgement |
| S8 | NASA Science · Moons | [S8](https://science.nasa.gov/solar-system/moons/) · public-domain US government text; third-party media excluded |
| S9 | NASA Science · Asteroid Facts | [S9](https://science.nasa.gov/solar-system/asteroids/facts/) · public-domain US government text; third-party media excluded |
| S10 | NASA Science · Comet Facts | [S10](https://science.nasa.gov/solar-system/comets/facts/) · public-domain US government text; third-party media excluded |
| S11 | NASA Science · Saturn: Facts | [S11](https://science.nasa.gov/saturn/facts/) · public-domain US government text; third-party media excluded |
| S12 | NASA GSFC StarChild · Why do stars twinkle? | [S12](https://starchild.gsfc.nasa.gov/docs/StarChild/questions/question26.html) · public-domain US government text; third-party media excluded |
| S13 | University of Wisconsin–Madison; astronomer James Lattis · Curiosities: Why do stars appear to twinkle in the night sky? | [S13](https://news.wisc.edu/curiosities-why-do-stars-appear-to-twinkle-in-the-night-sky/) · research-only; not cleared for asset download |
| S14 | International Astronomical Union · The Constellations | [S14](https://www.iau.org/IAU/Astronomy-FAQs/Constellations.aspx) · research-only page; individual charts require asset licence check |
| S15 | Science Centre Singapore · Stargazing / Our Observatory | [S15](https://www.science.edu.sg/whats-on/workshops-activities/stargazing) · research-only; not cleared for image download |
| S16 | NASA Science · Our Milky Way Galaxy: How Big is Space? | [S16](https://science.nasa.gov/universe/exoplanets/our-milky-way-galaxy-how-big-is-space/) · public-domain US government text; third-party media excluded |
| S17 | NASA/CXC/SAO Chandra · Proxima Centauri | [S17](https://www.chandra.cfa.harvard.edu/photo/2004/proxima/index.html) · research-only text; inspect individual image credit before download |
| S18 | Lunar and Planetary Institute · Stellar Evolution: Misconceptions and Educational Research | [S18](https://www.lpi.usra.edu/education/pre_service_edu/StellarMisconceptions.shtml) · research-only; not cleared for download |
| S19 | Julia D. Plummer; Penn State repository; IJSE 31(12), 1571–1605 (2009) · A cross-age study of children’s knowledge of apparent celestial motion | [S19](https://pure.psu.edu/en/publications/a-cross-age-study-of-childrens-knowledge-of-apparent-celestial-mo/) · research-only abstract; no full-paper download |
| S20 | Harvard–Smithsonian CfA MOSART · Student Misconceptions | [S20](https://waps.cfa.harvard.edu/mosart/misconceptions.php) · research-only public summary; no account or terms accepted |
| S21 | IAU Office of Astronomy for Education · IAU OAE Multilingual Glossary, simplified Chinese index | [S21](https://www.astro4edu.org/zh-hans/resources/glossary/search/) · CC BY 4.0 (glossary terms/definitions); credit IAU OAE |
| S22 | David Nash / Astronexus · HYG Stellar Database licence | [S22](https://raw.githubusercontent.com/astronexus/HYG-Database/main/LICENSE) · CC BY-SA 4.0 |
| S23 | NASA · NASA Images and Media Guidelines | [S23](https://www.nasa.gov/nasa-brand-center/images-and-media/) · research-only licence guidance; no media asset fetched |
| S24 | NASA Science · Galaxies | [S24](https://science.nasa.gov/universe/galaxies/) · public-domain US government text; third-party media excluded |
| S25 | NASA Science · Meteors and Meteorites: Facts | [S25](https://science.nasa.gov/solar-system/meteors-meteorites/facts/) · public-domain US government text; third-party media excluded |
| S26 | NASA Science · Kepler’s Three Laws Explained | [S26](https://science.nasa.gov/solar-system/orbits-and-keplers-laws/) · public-domain US government text; third-party media excluded |
| S27 | Julia D. Plummer; JRST 46(2), 192–209 (2009) · Early Elementary Students’ Development of Astronomy Concepts in the Planetarium | [S27](https://www.juliaplummer.com/papers/PlummerJRST2009.pdf) · research-only; web-viewed abstract, no local download |
| S28 | David Nash / Astronexus · HYG Database README and versioned catalogue | [S28](https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/README.md) · CC BY-SA 4.0 |
| S29 | IAU OAE · Light Year / 光年 | [S29](https://www.astro4edu.org/zh-hans/resources/glossary/term/178/) · CC BY 4.0 |
| S30 | US Naval Observatory · Computing Approximate Sidereal Time | [S30](https://aa.usno.navy.mil/faq/GAST) · public-domain US government algorithm |
| S31 | US Naval Observatory · Computing Altitude and Azimuth | [S31](https://aa.usno.navy.mil/faq/alt_az) · public-domain US government algorithm |
| S32 | NASA Space Place · What Are Constellations? | [S32](https://spaceplace.nasa.gov/constellations/en/) · public-domain US government text; third-party media excluded |
| S33 | China National Space Administration · 八大行星名称 | [S33](https://www.cnsa.gov.cn/n6758823/n6758838/c6809917/content.html) · research-only nomenclature attestation; no page download |
| S34 | David Nash / Astronexus · HYG v4.1 CURRENT catalogue | [S34](https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv) · CC BY-SA 4.0 |
| S35 | NASA GSFC Imagine the Universe · The Milky Way | [S35](https://imagine.gsfc.nasa.gov/science/objects/milkyway1.html) · public-domain US government text; third-party media excluded |
| S36 | NASA Science · Solar System: Facts | [S36](https://science.nasa.gov/solar-system/solar-system-facts/) · public-domain US government text; third-party media excluded |

另建未来 `S37` 模型研究来源（`design:true`）：逐条记录本spec的圆形共面假设、相位、缩尺、闪烁振幅、日期近似、彗星E步和星系结构示意；不要把它写成外部观测来源。S1、S2是本主题自己的来源编号，不照搬旧topic相同编号的意义。

## 7. 图像计划与已审草稿

| file | 位置 | 用意 / 事实核查 | 状态 |
|---|---|---|---|
| solar-system.png | cover 1024×1024 | 单颗土星、一个共面薄环系统，前后遮挡；冰/岩碎块系统的整体示意，不量环厚和缝宽。[F027] | 新生成1次；人工看图+像素审计 |
| solar-system-comet-tails.png |03 figure 1536×1152|单核、彗发、直细离子尾与弯宽尘尾；太阳在画外左下，双尾总体向右上。[F024,F025]|新生成1次；比例为示意|
| solar-system-milky-way.png |07 figure 1536×1152|单一扁平盘、中央长棒/核球、弯曲臂带；结构重建不称外拍真照片，不锁定臂数。[F038,F044]|新生成1次；不把细点大小当恒星半径|

全套是19世纪科学图版式细石墨线、交叉排线与点描；equal RGB；透明alpha；无纸纹、背景、框、文字、数字、logo、旗帜、箭头、地面投影。`manifest.jsonl`逐图列count/geometry/禁用元素核查，`image-audit.json`列尺寸、alpha、bbox与sha256；`prompts.json`保留最终提示词。无合适旧图，new=3,reused=0；没有假填reusedFrom。

## 8. 施工顺序与验收

1. 按本最终spec先实现§4两项；sample fixture/unit/e2e/docs06齐全。
2. 再建8章40拍、parts、try-it、16词表、sources及图版；所有beat展开确定state，run=false。
3. 数字与F/D ids核验；八行星计数、三种比例、彗尾、闪烁、星座视点、光年与银河系包含关系逐项审计。
4. pnpm check / validate / test / build；pnpm shoot与e2e由用户brief明确要求本sandbox跳过，主会话使用ATLAS_E2E_PORT=5453运行；不得浏览器绕过。
5. 内容status=published（用户指定）。REVIEW.md记录Gavin需审的默认、中文词形、截图/性能与手机待验；AUDIT.md记录事实、许可与模型局限，不把未跑门槛写成通过。

## 9. 施工记录

### 9.1 引擎实现（覆盖早期草稿式措辞）

保留E-SS1/E-SS2，两项均落地。新增solar-system-schema.ts、solar-constants.ts、solar-system.ts、solar-sky.ts与CatalogueSky.tsx。既有sim注册表、scale数值绑定、PartNode实际矩阵和调试API为短增量；旧orbit-rotation数学直接复用，旧三体schema/23输出/13控件/会话未放宽。无分支专有代码依赖。

精确配置为§4.2的16个controls映射；22输出=3vector（planet-frame/display-positions/comet-positions）+17number（9个radius与8种标量）+2state。sky-frame在独立目录载入后的overlay/debug里给出，不塞入同步topic bundle。配置及例子见draft sample-solar：7章31拍、24可选对象、全部绑定。测试API engine.solarSystem()给outputs与sky status/UTC/rows，engine.scale(id)反读actual三轴尺度；已有shift hook可查中心位移。

目录只从同源public/catalogues/solar-system读取，构建和运行均验证许可、源hash格式、RA/Dec、唯一id及HIP端点；出错有双语重试。PWA加CacheFirst目录规则，Capacitor静态包包含原独立文件。原始28行不与NC-SA文字或原创连线合并成派生JSON。

差异：不建新clock/session/ss-t、body-transform/solar-illumination binding、专门观测窗。全部采用受控时间步；其他纬度合成对照固定103.7357°E（改自准备稿的0经度，以便比较同一SGT钟点）；同尺Sun inset移至x=-32避免与大小行相交；ly浮点oracle容差<.01km。scale只乘局部单位几何，中心shift在其后，不把距离乘半径；土星环同尺度。

### 9.2 正式内容与几何

published，背景+7主章，40拍，49可选对象、5组、0flow、0自动动画；一个接收反射光的局部姿态。8章主文每章EN244–266词、ZH352–400字，每种语言各2块细看；37来源、16独立术语。所有拍显式给全16控制值、相机、显隐与标签，run=false。

学生用节拍选总览/同尺行星行/统一大小距离尺。正式try不暴露原始lab、scale、sky-target或depth切换，避免错误沿用相机/隐藏表；true-scale接口由sample-solar验证，距尺正式球体保持同一大小距离尺。星座目标/日期与深度外部相机由已配好的拍直达。Sun近景章不放无效试卡；其余7章各1卡。彗尾卡文字指明使用第四拍观察。

补齐四条圆盘光路与接收点通量glow（full1.3），光源保持稳定；光路是静态定性示意，未声称逐帧湍流追迹。银河系带/中央棒/太阳系标记移到扁盘表面以上；反射光路接在可见球面并与接收点姿态对齐。行星表面棚灯只显形，没有伪造日照计算。sun-earth-moon背景加双语回链，旧机制不重讲。

已审PNG经illustrate处理：封面800/1600px为42/116KB；双彗尾与银河系1200×900为185/187KB，超过既有管线120KB目标（保留细线，记录REVIEW）。无新增生成请求，new=3/reused=0为准备阶段既有图。数值转录在scripts/geo/solar-system/planet-reference.json；BY-SA目录始终为独立public文件。

### 9.3 验证与明确未跑项目

- pnpm check：0错误、0警告、4既有提示。
- pnpm validate：87主题、0错误、0警告。
- pnpm test：221文件、5477测试通过；引擎15项与内容14项包含在内。另目标回归74/74与旧sample7/7均通过。
- pnpm build：成功，177静态页面，PWA215项；独立catalogue输出哈希一致，topic bundle未嵌入星点行（gzip31,268bytes），首页49张published卡。Vite提示部分chunk>500KB；未把chunk列表当首屏请求预算通过。
- git diff --check：通过；无git写入、无package/lockfile改动、未碰review-queue/next-batch。
- sample-solar 8项、solar-system 9项e2e已编写，后者含双语双主题160个深链接及390手机契约；按本轮brief明确禁止浏览器门槛，均未执行。
- shoot/手机截图/真实draw calls/三角形与浏览器离线重载未测，不能称视觉或性能验收通过。主会话用ATLAS_E2E_PORT=5453补跑，命令与重点见REVIEW.md。

### 9.4 给 Gavin

请审默认快照取舍、三种比例读法、中文词形与新加坡坐标的DESIGN标识；确认星座/文化措辞、银河系重建边界、图片大小取舍。主会话完成EN/ZH×paper/cinema逐拍、手机390、目录失败重试/离线与性能验收。完整逐章审阅项在src/content/topics/solar-system/REVIEW.md，事实/许可在AUDIT.md及data/SOURCES.md。
