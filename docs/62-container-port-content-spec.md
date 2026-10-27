# 集装箱港口与岸桥 · 内容 spec（`container-port`，定稿施工版）

SpaceScene / Model3DStage；paper 默认、cinema 可切。主原型：`industrial-3d-showcase/archetypes.md` §3 的车辆／大型设施环境；补充一个可隔离的岸桥机构。**本次按用户 BUILD 授权定稿并施工；status: published；e2e 端口 5450。** 结构依照 docs/40–41：决定 → 范围与事实 → 章节 → 对象与零件 → 引擎契约 → 名词 → 来源 → 图像 → 验收 → 施工记录。

任务：读者能沿一只箱子解释船—岸桥—运输车—堆场—下一条船的关系，分清箱数与 TEU、起升与小车行走、实测吞吐量与规划能力，并用真实海岸地图说明新加坡的位置与枢纽联系。[F01, F05–F08, F12, F16, F18–F21, F31–F35]

研究依据为本轮新建的 `container-port-research.md`、`facts.json`、`datasets.json`；它们就是 parent dossier。无 sibling，按用户要求不设拆分说明。研究的 C/F/M id 沿用；本稿新增的设计／模拟条目为 `facts-extra.json` 的 D01–D06。所有字幕为 EN/ZH 草稿，未写入产品内容。

## 0. 决定（2026-10-27；给 Gavin 的默认建议）

| id | 默认决定 | 理由与证据 | 状态 |
|---|---|---|---|
| D0-1 | `subject: geography`，`tags: [singapore, beyond-syllabus]`，`engine: space-scene`，`stage: model3d`，`mode: space` | 机器服务于港口系统解释；课纲外，接 SS P4/P5 与 Sci P6。[C01–C03] | 本轮默认 |
| D0-2 | 00 背景 + 7 正章；共 36 拍；不设默认测验 | 留出动手预测与可追踪的一只箱。[D01] | 本轮默认 |
| D0-3 | 通用单箱、单小车、轨道式岸桥；船、车、场桥只是教学配置，无公司身份 | 有真实功能关系，非 Tuas 精确复刻。[F05–F07, F16, D01] | 本轮默认 |
| D0-4 | 地理作为阅读面板内的**静态 Geo 图版**，取真实 Natural Earth；可选 TimeScene 附录暂不纳入主引擎 | 避免新混合宿主；本轮已预取任何地图所需数据。[F18, F26–F28, D06] | 本轮默认 |
| D0-5 | 不画实际航线、不画交通分隔通航线、不做未来填海海岸动画 | 尚无已核许可与覆盖的路线／现状港区数据。真实岸线不能充当路线。[F27–F28] | 本轮默认 |
| D0-6 | 2025 吞吐量 44.66m TEU；Tuas 2040年代规划能力 65m TEU/年，分开两张证据卡 | 不把容量当结果，不把全港当 Tuas。[F08, F12, F35] | 本轮默认 |
| D0-7 | `port` 纯函数模型 + `span` 绳索绑定为两项必要新增；已复核现有机制，其它复用 | 已查 docs/06 与当前 sim registry，尚无 port kind 或两移动锚点绳段。[D02–D05] | 本轮默认 |
| D0-8 | 无品牌、旗帜、标牌贴图、遥测实况；模型数字一律 DESIGN/SIM | 所有资产本地、无运行时外部请求。[D01–D06] | 用户约束 |
| D0-9 | 数据许可按 BRIEF2：PD、CC0、BY、BY-SA、BY-NC-SA、ODbL、ODC-BY；BY-SA 与 BY-NC-SA 不进入同一派生文件 | 本轮只选 PD 地图与原创 BY-NC-SA 艺术。许可记录见数据清单。[F26, D06] | 用户已决定 |

### 0.1 可讨论而不阻断的选择

默认不增加航线层、实际作业 KPI、工人数量或港口排名。若以后补航线，先核真实轨迹数据许可、采样年份、船型与覆盖，另写数据设计；不能用两港点之间的平滑曲线替代。当前施工不依赖这些扩展。[F18–F20, F27–F28]

## 1. 课纲对照与范围

### 1.1 课纲锚点

逐字短引文、打印页/PDF页、缓存路径与 SHA 见 parent dossier §a、S02/S03。Sci P6 的重力与重量在打印 p64；SS P4 贸易港在打印 p29；SS P5 区域地理/经济联系在打印 pp33、35–36。**本主题不自称 PSLE 起重机必考内容。** [C01–C03]

### 1.2 主线／细看／不展开

| 主线 | 细看 | 本轮不展开 |
|---|---|---|
| TEU 与箱数；四角吊具；升降与横移；车与场桥；转运；两海峡与枢纽；Tuas；系统瓶颈 | 实际与名义尺寸、空重与货重的区别、历史两日期、数据口径、自动化与工作、全球排放的年份范围 | 浮力计算、吊机强度设计、真实锁具操作程序、危险品、海关法规教程、实际潮位/吃水计算、公司比较、未经许可 AIS、填海未来几何 |

事实边界：[F01–F35]；教学模型边界：[D01–D06]。用港口模型提出浮沉预测，只说大小/轻重本身不足以判断，不从一幅无水体模型推出浮力公式。[M01–M02]

### 1.3 学到什么与误解

- 把两个 20 英尺箱与一个 40 英尺箱读作 **3 箱 / 4 TEU**；不能据此给出总质量。[F01, F32, F34]
- 指出吊具接上角件，起升机构改高度，小车沿臂架行走；岸桥整体还能沿码头轨道移动。[F05–F07, F29, F33]
- 解释堆场作为中间环节，并追踪同一只转运箱去下一条船；不把所有箱都送进新加坡。[F16, F21, F31]
- 指出马六甲海峡和新加坡海峡，说明位置之外还需要班轮联系、作业和服务。[F18–F20, F27]
- 分清 2021 首批泊位作业、2022 正式开港、2025 全港实际量、2040 年代 Tuas 规划能力。[F08, F10–F12]
- 在本模型里，只增加非瓶颈工序的资源不一定改变链条能力。[D04]

文献型误解只使用 M01/M02 的年龄/重量/尺寸结果；TEU、转运、吊具、瓶颈误解均标“教学预测假设”，无儿童发生率宣称。短句、先画面后解释、EN 默认/简体中文独立成文、英式拼写；章名不写问句，孩子的问题放 `state.question`。不拟人化机器。

### 1.4 与已发布主题分工

`forces`（published）：重量/重力；`energy-conversion`（published）：能量形式；`materials`（published）：材料性质；`multiplication-division`（published）：单位计数；`measuring`/`nets-and-solids`（published）：尺寸和长方体。`singapore-land-use`、`singapore-1819-1965`、`singapore-after-1965` 当前均 draft，保留编辑交叉引用，发布前不显示不可用链接。状态按本轮 topic.yaml 实读。

### 1.4 事实表与模型口径

### 1.5 实证事实

| id | 必须写对的内容 | 来源 | 产品写法 |
|---|---|---|---|
| F01–F04 | 1/2 TEU；6.058/12.192 m；标准高 2.591 m、高箱 2.896 m；箱型有别 | S08/S09 | 图示用标准高干货箱；名义英尺与外部长不同 |
| F05–F07/F29/F33 | 顶部角件、旋锁、吊具、小车与起升机构 | S10/S11/S30 | S10 原页 403，原文全文待施工复核；S11 支持机构动作 |
| F08–F09 | 2025 全港 44.66m TEU、同比 8.6% | S04 | `OBSERVED · Singapore · 2025`，不标 Tuas 实测 |
| F10–F15 | 首批作业、开港、分期与未来能力 | S05/S20 | 日期/阶段各自标名；完成时间为目标 |
| F16–F17/F30 | 电动自动化场桥、AGV、远程管理、集装箱业务集中 | S05/S20 | 不宣称港内无人，不宣称所有海事业都搬去 Tuas |
| F18–F24/F31 | 地点、服务、联系、转运、历史与延误例子 | S06/S07/S12/S21/S27/S28 | 不复制旧年度联系页的数字作为今天数据 |
| F25 | 2018 全球航运排放占比估计 2.89% | S22 | 仅细看；范围含各类航运，不能当新加坡/码头占比 |
| F26–F28 | 公开地理图层及尺度限制 | S15/S16/S26 | 不作导航或最新岸线证据 |
| F32/F34/F35 | 单位推论、计数算式、图表类别约束 | S08/S04 + 关联来源 | 读数注清“箱”“TEU”“次搬运”“TEU/年” |

### 1.6 DESIGN / SIM（新增事实 D01–D06）

下列是**明确自述的教学设计**，不是典型作业速度、真实港区尺寸或安全阈值。容器外形采用 F02/F03 的尺度；整体港区压缩、船和设备位置示意，不能从图量取实际 Tuas 工程参数。[D01]

| id | 参数／定义 | 默认 | 可变 | 性质 |
|---|---|---|---|---|
| D01 | 模型米制，箱子长按 F02，高 2.591，设计宽 2.438；海在 -Z、陆在 +Z、Y向上 | 一个工作箱、一个示意船、少量箱堆 | 章姿态 | DESIGN，不作工程强度承诺 |
| D02 | 计数 `boxes=n20+n40`；`teu=n20+2*n40` | n20=2,n40=1 → 3箱/4TEU | 各 0–4 整数 | SIM/精确单位算式 |
| D03 | 起吊教学过程 32模型秒；见 §4.2；仅单只20英尺箱参与 | 锁确认=true | 锁确认开关、重放 | SIM；时间是演示设计，不是典型吊机周期 |
| D04 | 每台岸桥30、车24、场桥18 箱/小时；能力取各工序总能力最小值 | 1/1/1 →18箱/小时 | 各1或2台；到达率0/12/24/36/48；时长1/2h | SIM，流量近似、忽略启动延时和干扰 |
| D05 | 单列三层箱，目标上方0/1/2只；先移开的只数=上方只数；取出前搬运数=上方只数+1 | 上方2只→2次移开+1次取目标 | above 0–2；original/cleared/retrieved | SIM；不计复位，不声称实际堆高上限 |
| D06 | 区域 bbox[94,-7,115,16]；真实PD数据裁切、250m DP简化；标签由裁后水域内点推导 | 静态图版 | regional / straits viewbox | DESIGN，海岸非测绘现状 |

排放细看只有 sourced 历史估计，没有排放模拟。产品 `S1` 在 `sources.json` 带 `design: true`，完整记录 D01–D06 的参数、公式、限制；不能伪装成仪器测量。

## 2. 章节与节拍

### 2.0 总表与共享规则

**8章 = 背景4 + 5 + 5 + 5 + 4 + 4 + 4 + 5 = 36拍。** 每拍只讲当前可见的一件变化，字幕独立可读。下表state是内容计划，不是已提交frontmatter。所有pose、hide、labels均不累积；每章写完整基线，拍叠在本章上。除专门重放拍外 `sim.set.lift-live=false`。取 `run=false`，默认assembled、cutaway=none、explode=0；没有卡片的章不注册试一试键。

共用命名pose计划：`port-source`（箱在船上）；`lock-closeup`（只放大显示锁件、不改工作箱的几何尺度说明）；`lift-locked`/`lift-raised`/`lift-crossed`/`lift-landed`/`lift-released`（§4.2采样）；`box-comparison`（样箱台）；`transfer-on-carrier`/`transfer-at-yard`/`transfer-onward`（同working-box移动到车/院/接续船，绝不复制）；`tuas-context`（仍是通用模型）。pose快照中相关part都用同一采样计算，四绳用span跟随。[D01,D03]

| # / id | EN / ZH | beats | camera / 主索引 |
|---|---|---|---|
| 00 `before-you-start` | A box passing through / 经过港口的一只箱 | 4 | hero；船、岸桥、车、堆场、工作箱 |
| 01 `boxes-and-teu` | Boxes and TEU / 箱子与标准箱单位 | 5 | box；两种样箱 |
| 02 `the-crane-load-path` | The crane’s load path / 岸桥的起吊链 | 5 | lift；角件、锁、吊具、小车、绳、工作箱 |
| 03 `quay-to-yard` | From quay to yard / 从岸边到堆场 | 5 | yard；车、场桥、目标箱、阻挡箱 |
| 04 `an-onward-connection` | An onward connection / 接着乘下一条船 | 4 | network；工作箱、船、车、接续船、本地箱 |
| 05 `beside-two-straits` | Beside two straits / 两条海峡旁的枢纽 | 4 | network；船、岸桥、control-room + 阅读面板Geo图 |
| 06 `the-tuas-transition` | The Tuas transition / 转向大士港口 | 4 | tuas；车、场桥、控制室、岸桥 |
| 07 `keeping-the-chain-moving` | Keeping the chain moving / 让整条链保持畅通 | 5 | hero；岸桥、车、场桥 |

### 2.1 背景章 00 `before-you-start`（4拍）

**问题** ZH 这只箱子会留在新加坡吗？ / EN Will this box stay in Singapore? **summary** ZH 一只箱子可以在这里换船，港口把几种搬运工作接起来。 / EN A box can change ships here; the port joins several handling jobs. [F16,F21,F31]

基线：hero，pose=port-source，layers全五组，hide=[sample-20,sample-40,onward-ship,destination-box,yard-target,yard-blocker-a,yard-blocker-b]，part=working-box，labels=[working-box,ship-hull,portal,agv-body,yard-gantry]，sim.set={lift-live:false}。`index.parts`=[working-box,ship-hull,portal,agv-body,yard-gantry]。

| 拍 | state变化 | ZH字幕草稿 | EN caption draft | facts |
|---|---|---|---|---|
| 00-1 | hero，part=working-box | 先看这一只箱子；接下来的画面保持它的身份。 | Follow this one box; the next views keep its identity. | F31,D01 |
| 00-2 | labels=ship-hull,portal,agv-body,yard-gantry | 船、岸桥、运输车和堆场分别完成不同的一段工作。 | The ship, quay crane, carrier and yard each handle a different part of the transfer. | F06,F16,D01 |
| 00-3 | part=ship-hull；细看浮沉预测，不加算式 | 船很大，但“大”或“重”本身不足以判断一个物体会不会浮。 | The ship is large, but size or heaviness alone cannot tell us whether an object floats. | M01,M02 |
| 00-4 | hero，隐藏非必要标注 | 这是通用港口模型；它不表示大士港的实测平面布局。 | This is a generic port model; it is not a surveyed plan of Tuas Port. | D01,F28 |

正文提纲：可见系统→一箱两去向→示意与实测的区别。细看：浮沉研究的范围（不教密度公式）；模型中的简化。首现词：container、quay、yard、transhipment。链接published `materials`，勿把“船浮着”的视觉当作模拟测量。

### 2.2 第01章 `boxes-and-teu`（5拍）

**问题** ZH 三只箱子怎么能算成四？ / EN How can three boxes count as four? **summary** ZH 箱数数物体，TEU用共同单位比较不同长度的箱子。 / EN Box count counts objects; TEU uses a common unit for different container lengths. [F01,F34]

基线：box，pose=box-comparison，layers=[trace]，hide=[working-box,corner-fittings]，part=sample-20，labels=[sample-20,sample-40]，sim.set={n20:2,n40:1,lift-live:false}。卡片 `try={vary:n40,also:[n20],observe:[boxes,teu],record:true}`；predict在正文，避免自动改变n40盖过拍的基线。index=[sample-20,sample-40]。

| 拍 | state变化 | ZH字幕草稿 | EN caption draft | facts |
|---|---|---|---|---|
| 01-1 | n20=1,n40=0；part=sample-20 | 一只20英尺集装箱记为1 TEU。 | One 20-foot container counts as 1 TEU. | F01,D02 |
| 01-2 | n20=0,n40=1；part=sample-40 | 这一只40英尺箱仍是一只物体，却记为2 TEU。 | This 40-foot box is one object, but it counts as 2 TEU. | F01 |
| 01-3 | n20=2,n40=1 | 现在是三只箱子，合计4 TEU。 | There are now three boxes, totalling 4 TEU. | F34,D02 |
| 01-4 | 相同比例近景；n20=2,n40=1 | 两只20英尺箱的实际总长略短于一只40英尺箱；名称不是外长的精确米数。 | Two 20-foot boxes are slightly shorter in total than one 40-foot box; the names are nominal lengths. | F02 |
| 01-5 | 两种样箱都可点选；保持计数 | TEU不告诉我们箱里装了多重的货物。 | TEU does not tell us how heavy the cargo inside is. | F32 |

正文：同单位计数→2+1的算式→实际尺寸→质量独立。细看：6.058+6.058=12.116，与12.192差0.076m；标准高/高箱区别。图A=TEU比较。首现TEU、standard-height、high cube。链接`multiplication-division`、`measuring`。[F02–F04]

### 2.3 第02章 `the-crane-load-path`（5拍）

**问题** ZH 岸桥抓住箱子的什么地方？ / EN Which parts of the box does the crane hold? **summary** ZH 吊具接上四个上角件，起升机构和小车分别改变高度与横向位置。 / EN The spreader connects to four upper corners; the hoist and trolley change height and horizontal position. [F05,F29,F33]

基线：lift，pose=lift-locked，layers=[vessel,quay-crane,transfer,trace]，hide=[sample-20,sample-40,onward-ship,destination-box,ship-cargo]，part=spreader，labels=[corner-fittings,twistlocks,spreader,trolley,rope-a]，sim.set={lock-confirmed:true,lift-live:false}。index=[working-box,corner-fittings,twistlocks,spreader,trolley,rope-a,crane-boom,portal]。卡片 `try={vary:lock-confirmed,observe:[lift-status],replay:[lift-run]}`；仅第5拍启用live，卡片提示此过程为教学时间。

| 拍 | state变化 | ZH字幕草稿 | EN caption draft | facts |
|---|---|---|---|---|
| 02-1 | isolate=working-box局部；labels=corner-fittings；pose=port-source | 先找箱顶的四个角件；起吊连接点不在薄屋顶的中央。 | Find the four upper corner fittings; the lifting connections are not at the centre of the thin roof. | F05,F07,F29 |
| 02-2 | pose=lift-locked；part=twistlocks | 吊具的旋锁接上四角；本模型先确认连接，再开始抬升。 | The spreader’s twistlocks engage the corners; this model confirms the connection before lifting. | F05,F29,D03 |
| 02-3 | pose=lift-raised；part=rope-a | 起升机构把箱子抬高；这一拍小车尚未横移。 | The hoist raises the box; in this step the trolley has not yet crossed. | F33,D03 |
| 02-4 | pose=lift-crossed；part=trolley | 箱子保持抬高，小车沿臂架把它移向岸边。 | With the box raised, the trolley moves it along the boom towards the quay. | F33,D03 |
| 02-5 | pose=null，lift-live=true，run=true；重放或终态 | 在这段示意过程里，箱子先落稳再解锁；空吊具升起，箱子留在车上。 | In this schematic sequence, the box is supported before release; the empty spreader rises while the box stays on the carrier. | D03 |

正文：角件→吊具→绳与小车→支承后解锁。细看：单箱顶吊只是本主题选例；塔吊与岸桥不同；32秒为SIM非典型周期。图B=吊具与上角件。首现spreader、twistlock、trolley、hoist。S10 原 wiki 403；本轮改读官方 FAO/IPPC 全文副本，定位与核查见 §9。

### 2.4 第03章 `quay-to-yard`（5拍）

**问题** ZH 为什么不能把所有箱子叠成一堆？ / EN Why not put every container in one pile? **summary** ZH 车负责水平运输，场桥负责堆场起吊；上面的箱子会挡住要取的箱子。 / EN A carrier moves boxes horizontally and a yard crane lifts them; upper boxes can block the one needed. [F16,D05]

基线：yard，pose=transfer-at-yard，layers=[transfer,yard]，hide=[destination-box,control-room]，part=yard-target，labels=[agv-body,yard-gantry,yard-target,yard-blocker-a,yard-blocker-b]，sim.set={above:2,yard-state:original,lift-live:false}。try={vary:above,also:[yard-state],observe:[rehandles,retrieval-lifts],record:true}。index=[agv-body,agv-wheels,yard-gantry,yard-trolley,yard-target,yard-blocker-a,yard-blocker-b,yard-slot]。

| 拍 | state变化 | ZH字幕草稿 | EN caption draft | facts |
|---|---|---|---|---|
| 03-1 | part=agv-body；camera=yard | 低平运输车把箱子从岸边送往堆场，不承担岸桥的起吊动作。 | The low carrier moves a box from wharf to yard; it does not do the quay crane’s lift. | F16,D01 |
| 03-2 | part=yard-gantry | 场桥跨在箱列上方，在堆场内抬起和放下箱子。 | The yard crane spans the container rows and lifts boxes within the yard. | F16,D01 |
| 03-3 | above=2,original；xray局部箱堆 | 这个示意箱堆把角部对齐；目标箱上方有两只箱。 | This schematic stack aligns the corners; two boxes sit above the target. | F07,D05 |
| 03-4 | above=2,cleared | 在这个模型里，先移开两只阻挡箱，再取目标箱。 | In this model, two blocking boxes must be moved before the target can be retrieved. | D05 |
| 03-5 | above=2,retrieved；再比较above=0 | 这里数了两次移开和一次取出；若上方没有箱子，只需取出目标。 | Here we count two rehandles and one retrieval; with no box above, only the target needs lifting. | D05 |

正文：运输与起吊分工→有序位置→可取性→模型的计次口径。细看：移开的箱还需放回吗（本模型未计复位）；为什么堆场容量不是只有土地面积（此处只说明可取性，不给真实效率数字）。首现yard crane、stack、rehandle。

### 2.5 第04章 `an-onward-connection`（4拍）

**问题** ZH 卸在这里的货物都要送进新加坡吗？ / EN Is all cargo unloaded here delivered into Singapore? **summary** ZH 转运箱可以经过堆场，再装上去另一个目的地的船。 / EN A transhipment box can pass through the yard and join a ship for another destination. [F21,F31]

基线：network，layers全五组，pose=port-source，hide=[sample-20,sample-40,yard-target,yard-blocker-a,yard-blocker-b,control-room]，part=working-box，labels=[working-box,ship-hull,onward-ship,destination-box]，sim.set={lift-live:false}。无试一试卡；index=[working-box,ship-hull,agv-body,yard-gantry,onward-ship,destination-box]。

| 拍 | state变化 | ZH字幕草稿 | EN caption draft | facts |
|---|---|---|---|---|
| 04-1 | pose=transfer-on-carrier | 这只箱从第一条船卸下后，进入岸上运输环节。 | After unloading from the first ship, this box enters the landside transfer. | F16,F21,D01 |
| 04-2 | pose=transfer-at-yard | 同一只箱暂放堆场，等待下一段运输。 | The same box waits in the yard for its next connection. | F21,F31,D01 |
| 04-3 | pose=transfer-onward；part=onward-ship | 箱子装上接续船继续去别处；这是一种转运过程。 | The box joins an onward ship for another destination; this is a transhipment transfer. | F21,F31,D01 |
| 04-4 | 高亮destination-box，与working-box分开 | 另一些货物会在本地交付；两条去向不能都叫本地进口。 | Other cargo is delivered locally; both paths should not be called local imports. | F21 |

正文：连续身份→中间等待→ onward connection→本地去向；不说箱子永不开封、不把物流移动当作海关手续完整定义。细看：检查/重新包装等例外只写存在，不编比例；转运统计与独立箱身份不同，避免从两次模型起吊推导MPA计数公式。首现hub、onward connection、local import。

### 2.6 第05章 `beside-two-straits`（4拍）

**问题** ZH 为什么许多船在这里接上下一段运输？ / EN Why do many ships connect here? **summary** ZH 两条海峡的位置很重要，港口联系和服务也重要。 / EN The two straits matter, alongside port connections and services. [F18–F20]

基线：network，pose=port-source，layers=[vessel,quay-crane,transfer]，hide=[onward-ship,destination-box]，part=ship-hull，labels=[ship-hull,portal,control-room]，sim.set={lift-live:false}。index=[ship-hull,portal,control-room]。阅读面板有本地 Geo 图版与两个有标签的viewbox；没有自称已存在的beat地图切换API。四拍模型保持本章姿态，字幕指引读者看同步展开的图/文字；图版本身不需要逐拍程序驱动。[D06]

| 拍 | state变化 | ZH字幕草稿 | EN caption draft | facts |
|---|---|---|---|---|
| 05-1 | 选船；阅读Geo regional | 在真实海岸图上找马来半岛、苏门答腊和新加坡所在的区域。 | Use the real coastline map to locate the Malay Peninsula, Sumatra and the Singapore region. | F18,F26–F28,D06 |
| 05-2 | 模型不变；阅读Geo straits | 马六甲海峡与新加坡海峡连接这一带的海上通道；图中没有虚构的船只轨迹。 | The Malacca and Singapore straits link sea passages in this region; this map adds no invented vessel tracks. | F18,F27,D06 |
| 05-3 | part=control-room；labels=portal,control-room | 位置之外，班轮联系和多种海事服务一起支持枢纽运作。 | Beyond location, shipping connections and maritime services support the hub. | F19,F20 |
| 05-4 | hero；part=ship-hull | 海岸图解释“在哪里”；刚才的港口模型解释“怎样搬运”。 | The coastline map explains where; the port model explains how boxes are handled. | F27,F28,D01,D06 |

正文：沿真实地理从区域到海峡→枢纽网络→服务与作业；不做地理决定论。细看：Natural Earth比例尺与缺失最新填海岸线；“600多个港口”的日期/来源；缺路线不是让作者手绘路线的理由。[F20,F27–F28]

### 2.7 第06章 `the-tuas-transition`（4拍）

**问题** ZH 大士港口已经全部建好了吗？ / EN Is Tuas Port already fully completed? **summary** ZH 港口分阶段运作和建设；开始作业、正式开港与最终处理能力是不同的事。 / EN Operations and construction proceed in phases; first operation, official opening and ultimate capacity are different milestones. [F10–F15]

基线：tuas，pose=tuas-context，layers=[vessel,quay-crane,transfer,yard]，hide=[onward-ship,destination-box,yard-target,yard-blocker-a,yard-blocker-b]，part=agv-body，labels=[portal,agv-body,yard-gantry,control-room]，sim.set={lift-live:false}。index=[portal,agv-body,yard-gantry,control-room]。阅读面板时间条是本地原生文档/表格，不借用不存在的TimeScene地图变岸线。无sim卡。

| 拍 | state变化 | ZH字幕草稿 | EN caption draft | facts |
|---|---|---|---|---|
| 06-1 | hero；文字日期卡1972 | 丹戎巴葛集装箱码头于1972年启用；现代港口经历了多次发展。 | Tanjong Pagar container terminal opened in 1972; the modern port developed through successive stages. | F22 |
| 06-2 | 同模型；文字日期卡2021/2022 | 大士首两个泊位于2021年12月开始作业，2022年9月正式开港。 | Tuas’s first two berths began operating in December 2021; the official opening followed in September 2022. | F10,F11 |
| 06-3 | part=control-room；标注车/场桥 | 自动导引车、自动化场桥和远程管理改变了工作方式，并不等于没有人。 | AGVs, automated yard cranes and remote management change the work; they do not mean there are no people. | F16,F17 |
| 06-4 | 两张分开的数据证据卡 | 2025年新加坡全港处理4,466万TEU；大士未来6,500万TEU/年是2040年代完工时的规划能力。 | Singapore handled 44.66 million TEU in 2025; Tuas’s planned 65 million TEU a year is for completion in the 2040s. | F08,F12,F35 |

正文：1972背景→两日期→自动化/工作→量与能力。细看：1,337ha/66泊位/26km仅为最终规划；全球2018航运2.89%排放估计，不能换成新加坡或港内设备数字；海岸与用地的变化另链未来土地主题。[F13,F25,F28,F30]

### 2.8 第07章 `keeping-the-chain-moving`（5拍）

**问题** ZH 多加一台岸桥就能消除等待吗？ / EN Will one more quay crane remove the waiting? **summary** ZH 在这个模型里，整条搬运链的能力受最慢工序限制。 / EN In this model, the slowest stage limits the handling chain. [D04]

基线：hero，pose=port-source，layers=[quay-crane,transfer,yard]，hide=[destination-box,control-room,yard-target,yard-blocker-a,yard-blocker-b]，part=portal，labels=[portal,agv-body,yard-gantry]，sim.set={cranes:1,carriers:1,yards:1,arrivals:24,hours:2,lift-live:false}。index=[portal,agv-body,yard-gantry]。try={vary:cranes,also:[carriers,yards],keep:[arrivals,hours],observe:[capacity-rate,queued,bottleneck],record:{chart:{y:capacity-rate}},predict:{start:{cranes:1,carriers:1,yards:1},change:{cranes:2},observe:capacity-rate,options:[{id:unchanged,means:same,label:{en:Same,zh:不变}},{id:higher,means:more,label:{en:Higher,zh:增加}}],prompt:{en:Will another crane increase this chain’s capacity?,zh:多一台岸桥会增加这条链的能力吗？}}}。最终JSON所有裸display strings转双语对象。

| 拍 | state变化 | ZH字幕草稿 | EN caption draft | facts |
|---|---|---|---|---|
| 07-1 | cranes=1,carriers=1,yards=1；先猜 | 先预测：只增加岸桥，整条链的处理能力会改变吗？ | Predict first: will adding only a quay crane change the chain’s capacity? | D04 |
| 07-2 | 读数30/24/18；选场桥 | 在这个模拟里，岸桥、运输和堆场分别能处理30、24和18箱/小时。 | In this simulation, the crane, transfer and yard stages can handle 30, 24 and 18 boxes an hour. | D04 |
| 07-3 | cranes=2,carriers=1,yards=1 | 岸桥能力增加，堆场仍限制全链为18箱/小时。 | Crane capacity increases, but the yard still limits the chain to 18 boxes an hour. | D04 |
| 07-4 | cranes=1,carriers=1,yards=2 | 增加堆场资源后，运输环节成为新的限制，能力为24箱/小时。 | With more yard resources, transfer becomes the new limit at 24 boxes an hour. | D04 |
| 07-5 | 维持1/1/2；比较排队读数 | 到达率固定为24箱/小时，这个模型不再继续积压；真实港口还受更多条件影响。 | With arrivals fixed at 24 boxes an hour, this model stops building a queue; real ports face more conditions. | D04,F23 |

正文：先改一个量→min能力→瓶颈会变→模型局限；不能把SIM队列12箱写成真实港内等待量。细看：连续流、空初始队列、同型箱、忽略起动/设备互扰/天气/装载计划；2024实际船期延误例子只解释复杂性。[D04,F23]

### 2.9 字幕与计数验收

字幕共36对，当前每行都有parent或extra fact id。数字正文用 `<Num s>`；字幕纯文本，但句中明确SIM情景。各章index只收可选择part；Geo名称作为图内可读标签/表格行，而非冒充3D part。每章预设有可达相机与完整hide/layers；无人为“按年级隐藏”章节。

## 3. 对象、零件与数据

### 3.1 分区与视觉

| 分区 | group id | EN / ZH | 内容与 token 语义 |
|---|---|---|---|
| 01 | `vessel` | Vessel / 船舶 | 船体、甲板、驾驶区、甲板箱；`token:ink-2` |
| 02 | `quay-crane` | Quay crane / 岸桥 | 门架、轮组、臂架、小车、绳、吊具、锁；`token:ink-2`，选中用 signal |
| 03 | `transfer` | Transfer / 水平运输 | 一台AGV与接箱位置；`token:neutral` |
| 04 | `yard` | Yard / 堆场 | 小场桥、对齐箱堆、被压目标与移箱空位；`token:ink-2` |
| 05 | `trace` | Box trace / 箱子路径 | 只强调同一箱身份；HUD标记，非无数粒子“货流” | 

码头基座 `quay-context` 与水面示意 `water-context` 为 context，不进可选零件索引。材质族钢、涂层金属、橡胶；没有公司颜色/铭牌。颜色不编码国别，不依赖颜色识别：目标箱还用边框与 HUD 名称标明。[D01]

### 3.2 坐标与比例

米制教学场景，X沿码头/箱长，Y上，Z向陆。码头边界 z=0；工作箱在船上中心 `[0,11.2955,-18]`（底10、顶12.591）；岸边接箱中心 `[0,3.2955,10]`（底2、顶4.591）。吊具厚0.6，其中心分别 `[0,12.891,-18]` 与 `[0,4.891,10]`，底面恰接箱顶。安全抬升状态：箱底25，吊具中心27.891；小车绳顶锚点 y=50。上述均为 D01/D03 设计，不是现场测量。

船体包络约 x[-50,50]、z[-32,-4]、y[-4,10]；示意船缩短，远端箱不计入本次计数。门架支承都在陆地 z≥1；四腿、两条平行轨道沿X，臂架跨Z。场桥位于 z≈40，小院箱场采用独立相机近景，不要求整个模型按真实码头用地比例。绳下端不得穿过箱体。[D01]

### 3.3 零件表（30 个可索引 part + 2 context；重复件为一个 id）

所有 extra / repeat 数必须在现有上限内。表中尺寸为设计起点；“连接”是阅读用功能链，非运行时物理约束。几何参考 R1=S25 的整机照片，R2=S10/S11 机构说明，R3=S09尺寸表，R4=S05港区关系；R1许可BY，R2只读不可复制图，R3数字而非整表，R4不复制照片。

| # | id / EN · ZH | group | primitive / 关键形状 | 位置/连接/说明 |
|---|---|---|---|---|
| 1 | `ship-hull` Hull · 船体 | vessel | extrude/lathe组合封闭船形 | 连续船体、尖首；不是箱子浮在陆地 |
| 2 | `ship-deck` Deck · 甲板 | vessel | 薄box+舱口轮廓 | 顶y=10；连接工作箱 |
| 3 | `ship-bridge` Bridge · 驾驶区 | vessel | box+extra分层 | 船后端；无文字/旗 |
| 4 | `ship-cargo` Deck cargo · 甲板箱 | vessel | box/fins+repeat | 少量平行列；不是计数样本 |
| 5 | `portal` Portal · 门架 | quay-crane | box/strut+extra | 四支腿全部落岸上；连接臂架与轮组 |
| 6 | `rail-bogies` Bogies · 行走轮组 | quay-crane | cylinders+repeat | 四组轮；两岸轨 |
| 7 | `crane-rails` Rails · 轨道 | quay-crane | 两长box | 沿X；不跨海 |
| 8 | `crane-boom` Boom · 臂架 | quay-crane | 梁+杆件extra | 沿Z，海向悬臂；不能画塔吊回转臂 |
| 9 | `trolley` Trolley · 小车 | quay-crane | box+轮 | y=50，z随 `trolley-dz` |
| 10–13 | `rope-a/b/c/d` Hoist rope · 起升绳 | quay-crane | 4个独立Y轴单位cylinder | E-CP2 两锚点 `span`；不画真实多倍率穿绳 |
| 14 | `spreader` Spreader · 吊具 | quay-crane | 四边框extra，中央留空 | 长约6m、宽约2.44m；底接四角 |
| 15 | `twistlocks` Twistlocks · 旋锁 | quay-crane | 4份repeat锁轴+扁头 | 随吊具移动，各自Y轴旋转；几何放大仅用于识别 |
| 16 | `working-box` Working box · 工作箱 | trace | 标准高20英尺薄板箱+角柱/角件 | 全过程同一id，中心/位移见§4.2 |
| 17 | `corner-fittings` Upper corners · 上角件 | trace | 4份box/plateHole | 只呈四上角；随working-box；非独立悬浮 |
| 18 | `sample-20` 20-ft samples · 20英尺样箱 | trace | 6.058×2.591×2.438，repeat4 | 与 sample-40 同尺度；由count绑定控制 |
| 19 | `sample-40` 40-ft samples · 40英尺样箱 | trace | 12.192×2.591×2.438，repeat4 | 不把长箱切成两个物体 |
| 20 | `agv-body` Carrier · 自动导引车 | transfer | 低平框架box | 平移搬运，不带起吊臂 |
| 21 | `agv-wheels` Wheels · 车轮 | transfer | cylinder+repeat | 随车；示意轮数不作真实车型说明 |
| 22 | `yard-gantry` Yard gantry · 场桥 | yard | 两端门架与跨梁 | 跨箱列，和岸桥外形区别 |
| 23 | `yard-trolley` Yard trolley · 场桥小车 | yard | box+小吊具extra | 静态说明用，不假装复现同一套绳系 |
| 24 | `yard-target` Target · 目标箱 | yard | 标准20英尺箱 | 保持底层；上方存在0/1/2箱，不与working-box混为同一实验 |
| 25 | `yard-blocker-a` Upper box A · 上层箱甲 | yard | 同尺寸箱 | 由above与yard-state控制shown/位移 |
| 26 | `yard-blocker-b` Upper box B · 上层箱乙 | yard | 同尺寸箱 | 只在above=2显示 |
| 27 | `yard-slot` Clear slot · 移箱位置 | yard | 地面细框box | 显示可存放位置，不当安全现场指导 |
| 28 | `onward-ship` Onward vessel · 接续船 | vessel | 缩略船形box/extrude | 章04相机/姿态启用，默认隐藏 |
| 29 | `destination-box` Local delivery · 本地交付箱 | transfer | 标准箱 | 与转运去向对比，不声称所有流程只两类 |
| 30 | `control-room` Control room · 控制室 | transfer | 建筑外形box | 章06工作角色提示，不画品牌控制屏 |

`summary` 首句写功能，例如 Spreader: “Connects the hoist to the container’s upper corners.” / “把起升机构连接到集装箱的上角件。” [F05,F29]。工作箱：“Keeps the same identity through this transfer.” / “在这次转运中保持同一只箱子的身份。” [F31,D01]。场桥：“Lifts containers within the yard.” / “在堆场内起吊箱子。” [F16]。每条detail写功能、连接、示意限制及fact id；避免把模型连接方法当作作业教程。

### 3.4 流、动画、剖切与预算

默认无 particle flows。货物是实体箱，不画成空气/水流；`trace` 是身份强调组。有限吊运用timeline/play；章节04用静态姿态串起空间位置，不能让一只箱同时出现在船、车和堆场。场桥静态示范、AGV只作短的示意位移；没有持续自动吊运的假循环。[D01,D03,D05]

局部剖切仅用于 `working-box` 或吊具连接近景；先隐藏不相关件。X-RAY显示角柱与角件关系；explode只在隔离的小组件中启用，运行时流/吊运暂停并到终态。船与整片码头不作“爆炸物理拆开”。预算目标：静止≤80 draw calls、动态≤100，三角形≤0.3M，实例化箱壁细节；不为每条箱壁波纹/绳股创建mesh。引用 docs/02 首屏JS≤300KB gzip，模型不用glb、所有资源本地。

### 3.5 地图与数据计划

主方案是阅读面板内本地 Geo 图版：由 `data/straits-land.geojson`、`marine-labels.geojson`、`singapore-label.geojson` 构建本地SVG，不在线取瓦片。可选交互附录若获后续施工授权，使用已有 TimeScene 区域底图/静态图层，**不开发 SpaceScene/TimeScene 同画布切换器**。[D06,F26–F28]

| view / layer | 实际数据 | 范围与用途 | 时间语义 |
|---|---|---|---|
| `geo-regional` / `land` | straits-land | bbox[94,-7,115,16]；马来半岛、苏门答腊与区域位置 | 无日期的制图快照；不称“2026现状海岸” |
| `geo-regional` / `water-labels` | marine-labels | 印度洋、安达曼海、南海、两海峡；EN/ZH | 无时间插值 |
| `geo-straits` / `land` | 同一真实几何，viewbox[98,0,106,7] | 放大海峡关系；禁放大到泊位 | 与上同源 |
| `geo-straits` / `water-labels` | 同源内点 | 标签可用引线避让但不改地理锚点 | 内点是算法推导，不是实测点 |
| `shipping-lanes` | **无** | 不显示；未来另行核数据 | 不准由港点手绘 |

原始数据两份共11.85MB左右（精确字节见INVENTORY），派生运行时陆地约217KB，标签约1.3KB；其余原始/中间件不进入网站。无实际Tuas点坐标、码头边界、泊位、未来填海多边形。MPA原始CSV未下载：SGODL不在本次明确列举许可内。正文只摘独立核实的发布数字。[F08,F12,D06]

## 4. 引擎契约（本轮最小新增）

### 4.1 复用与缺口

已读 `docs/06-dev-guide.md` sim、timeline/play、shift、章节/图层；代码检查 `sim-schema.ts`、`lib/sim/index.ts`、`table.ts`。现有 `table` 只做查表、输出数/状态，不会按参数合成多通道吊运或绳端几何。已有 count/offset/rotate/shift/play、predict/record/replay、试一试键和URL均保留。只新增以下两项：

1. **E-CP1：`sim.kind: port`**，纯函数及交叉校验；统计计数、吊运timeline、堆场slots、工序能力。[D02–D05]
2. **E-CP2：零件 `span` 绑定**，把单位Y轴圆柱绳段连接到两个已变换锚点；同帧更新。[D03]

不增加新primitive、新UI框架、新地图层类型、独立游戏引擎或依赖。

### 4.1a 施工前复核（2026-10-27）

- main 已有 `mechanism-schema.ts` / `MechanismDriver.tsx`，只接受 `beam-steam` 的固定刚性连杆角色、二维机构解算、规定的 table 控件和每机独占零件。其内部 restEndpoints 只在固定杆长下转动/平移，不能给两任意移动零件之间的变长绳使用。复用其帧顺序思想，不扩展 steam 专用结构。
- 已有 count / offset / rotate / play / shift / pose / timeline / record / predict / replay / try-it / URL 完整保留；删去任何新增动画时钟、港口专用 UI、rigid-link 求解器、地图宿主、primitive 的需求。静态移箱用零时长 shift；快照用命名 pose。
- table 可枚举计数及有限能力算式，却只输出 number/state，不能输出本题所需 timeline/vector；单主题只用一个 sim kind。port 保留统一的最小纯函数适配器，将计数/能力两条短算式与吊运/堆场输出放在同一 sim，避免新增组合模型框架或大量人工表格。没有引入真实排队/碰撞/吊摆物理。
- 按要求以 `git log main..codex/<branch>` 和 `git show` 复核：monsoon-engine（月气候层）、sem-engine（orbit-rotation）、airfoil-content（airfoil）、dinosaur（本轮无超前 main 提交，deep-time/Ma）、plates（reference/catalogue/impact）。没有任一分支提供此 port timeline 或两锚点变长 span。全部不依赖未合并代码。
- span 新增纯几何分支，只有 part+span，不需 output/control。所有其它绑定维持原契约。Source S01 必须 design:true；正文 OBSERVED/PLANNED 不使用模拟输出。


### 4.2 E-CP1 数据结构与算法

扩展现有 `sim` discriminated union；此为拟议字段，不能假装现schema已接受：

```ts
interface PortData {
  count: { n20: string; n40: string }; // step control ids
  lift: {
    enabled: string;                  // toggle: lock-confirmed
    workingPart: string; spreaderPart: string; trolleyPart: string;
    source: [number,number,number];   // box centre [0,11.2955,-18]
    destination: [number,number,number]; // [0,3.2955,10]
    boxHeight: number;               // 2.591
    spreaderDepth: number;           // 0.6
    clearBottomY: number;            // 25
    knots: { lock: 4; raised: 12; crossed: 20; landed: 28; released: 30; finished: 32 };
    slow: number;                    // 1; timing already schematic
  };
  yard: { above: string; state: string; target: string;
    blockers: [string,string]; // at most two, order lower->upper
    pitch: number;             // 2.591; model stacks corner aligned
    park: [[number,number,number],[number,number,number]];
    retrieved: [number,number,number]; // absolute centre
  };
  capacity: {
    cranes: string; carriers: string; yards: string;
    arrivals: string; hours: string;
    rate: { crane: number; carrier: number; yard: number }; // 30,24,18 boxes/h
  };
  source: string[]; // must include a sources.json design:true item
}
```

控件（最终11个，≤16）：`n20,n40` step0..4；`lock-confirmed` toggle；`above` step0..2；`yard-state` choice `original|cleared|retrieved`；`cranes,carriers,yards` step[1,2]；`arrivals` step[0,12,24,36,48]；`hours` step[1,2]；`lift-live` toggle（默认true，只控制play是否应用，不进入模型key）。不设置 `time/phase` 控件；过程由现timeline重放与拍姿态采样。数字不能同时解释为质量。[D02–D05]

输出名与类型（合计15，≤32）：

| `from` | kind / unit | 定义 |
|---|---|---|
| `boxes` | number / boxes | n20+n40 |
| `teu` | number / TEU | n20+2n40 |
| `lift-status` | state | lock-not-confirmed / ready（不随播放时钟伪造模型状态） |
| `lift-run` | timeline | 以下通道及32s终态；禁绑定普通numeric readout |
| `yard-slots` | vector | 现shift协议 `<part>:x/y/z/shown`，相对静止中心偏移 |
| `rehandles` | number / moves | above，仅移开阻挡箱的次数 |
| `retrieval-lifts` | number / moves | above+1，含取出目标，不含还原 |
| `crane-rate` | number / boxes/h | cranes×30 |
| `carrier-rate` | number / boxes/h | carriers×24 |
| `yard-rate` | number / boxes/h | yards×18 |
| `capacity-rate` | number / boxes/h | min(三工序能力) |
| `completed` | number / boxes | min(arrivals,capacity-rate)×hours，空初始队列的连续流近似 |
| `queue-growth` | number / boxes/h | max(0,arrivals-capacity-rate) |
| `queued` | number / boxes | queue-growth×hours |
| `bottleneck` | state | crane/carrier/yard/tied（全部达到最小值的数量>1时tied） |

默认 n20=2,n40=1,lift-live=true,lock-confirmed=true,above=2,yard-state=original,cranes=carriers=yards=1,arrivals=24,hours=2。`boxes`3/`teu`4、`capacity-rate`18、`completed`36、`queued`12。capacity模型假设每次搬一只20英尺箱，因此箱/小时恰与该情景的TEU/小时数值相同；UI只显示箱/小时，**不拿混箱计数控件计算全港TEU吞吐率**。[D02,D04]

**吊运timeline（线性采样，不做加速度真实性宣称）**：key=`port-lift:${enabled}:${geometryHash}`，不能包含n20/n40或capacity控件；duration32，slow1。所有channels含时间0和32；未锁确认时duration=0、单个[0,0]采样、工作箱/吊具/小车都保持起点，status=`lock-not-confirmed`。正式timeline：

| t | trolley-dz | spreader-dy | cargo-dy | cargo-dz | lock-deg | 含义 |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 | 吊具底面在箱顶，未转锁 |
| 4 | 0 | 0 | 0 | 0 | 90 | 教学旋锁确认；90°为本模型示意 |
| 12 | 0 | 15 | 15 | 0 | 90 | 箱底升到25 |
| 20 | 28 | 15 | 15 | 28 | 90 | 横移到岸上接箱位 |
| 28 | 28 | -8 | -8 | 28 | 90 | 车上箱底2，已承托 |
| 30 | 28 | -8 | -8 | 28 | 0 | 解锁，箱不再跟吊具 |
| 32 | 28 | 15 | -8 | 28 | 0 | 空吊具升起，箱留车上 |

t=30→32只有吊具上升，货物高度不变；不宣称实机锁确认需要4秒。初始加载/截图/深链接/减少动态依现timeline规则直接终态。正文拍想显示过程某时刻时使用预先写好的 **命名pose**（0/4/12/20/28/32快照），不要增加不受支持的beat字段 `seek`。pose拍临时禁用所有lift `play`绑定；`try.replay:[lift-run]` 的专门运转拍清pose、恢复绑定，避免双重位移。[D03]

绑定示例：

```jsonc
{"output":"lift-run","part":"trolley","play":{"channel":"trolley-dz","axis":[0,0,1],"when":{"control":"lift-live","is":true}}}
{"output":"lift-run","part":["spreader","twistlocks"],"play":{"channel":"spreader-dy","axis":[0,1,0],"when":{"control":"lift-live","is":true}}}
// spreader / twistlocks 再绑 trolley-dz 的Z向；working-box / corner-fittings 绑 cargo-dy / cargo-dz。
{"output":"lift-run","part":"twistlocks","play":{"channel":"lock-deg","turn":[0,1,0],"each":true,"when":{"control":"lift-live","is":true}}}
{"control":"n20","part":"sample-20","count":true}
{"control":"n40","part":"sample-40","count":true}
{"output":"yard-slots","part":["yard-target","yard-blocker-a","yard-blocker-b"],"shift":{"ease":0,"lift":0}}
```

pose与play冲突解决：`lift-live`作所有lift play绑定的`when.control`；快照拍设false；运转拍true。enabled控制锁状态。`lift-live`不进入timeline key，不改变算式；它只决定舞台应用play。最终契约为**11控件、15输出**。[D03]

**yard位置算法**：静止target中心在 `[18,1.2955,40]`；两blocker静止中心分别 `[18,3.8865,40]` / `[18,6.4775,40]`。`above=0/1/2` 表目标上面实际存在的箱数，多余blocker `shown=0`，目标始终底层（不是改目标的层次）。original=阻挡箱保持；cleared/retrieved=把存在的blocker移到park绝对中心 `[28,1.2955,40]` / `[38,1.2955,40]`；retrieved再把target移到 `[18,1.2955,50]`。slots值=绝对目标位置减静止中心。用0秒shift作为前后状态对照，避免现有拱形shift穿过另一箱或伪装安全吊运路线。[D05]

### 4.3 E-CP1 校验与测试向量

- PortData只允许上述字段，有限数、米/小时单位约定、nonnegative rates、cranes/carriers/yards整数≥1；n20/n40为非负整数step，above整数0..2，hours正值。control必须存在且类型匹配；默认值合法。
- 所有part id真实存在、非context；boxHeight/spreaderDepth>0；clearBottomY≥max(sourceY,destinationY)+boxHeight/2；trolley锚点必须高于最高spreader顶。knots严格升序、≤256采样点；所有timeline通道已登记；source/destination在模型包络内。
- 输出kind匹配；from只允许注册的15项；state枚举与数量完全一致；count repeat≥4；yard两blocker互异、target不得是blocker；pose引用有效。
- S01必须为design source；保存URL只写控件值，未知/非法值按现resolveSimValues忽略回默认，不让solver产NaN/Infinity。

| 测试输入/时刻 | 预期结果（绝对场景坐标） |
|---|---|
| n20=2,n40=1 | boxes=3，teu=4；无质量输出 |
| n20=0,n40=0 | boxes=0，teu=0；样箱实例均0 |
| lock-confirmed=false | lift-status=lock-not-confirmed；duration0；trolley dz0；box仍[0,11.2955,-18] |
| 锁=true，seek t8 | 吊具中心[0,20.391,-18]；箱底17.5；锁90° |
| seek t16 | trolley z=-4；吊具y27.891；箱底25 |
| seek t24 | trolley z10；吊具y16.391；箱底13.5 |
| seek t28与t30 | 箱中心[0,3.2955,10]；底2；t30锁0° |
| seek t32 | 箱仍[0,3.2955,10]；吊具[0,27.891,10] |
| above=2, original | rehandles2，retrieval-lifts3；blocker两只在原堆 |
| above=2, retrieved | 两blocker到park；target到[18,1.2955,50]；终态不重叠 |
| above=0 | rehandles0，retrieval-lifts1；两blocker shown0 |
| 1/1/1资源，到达24，2h | rates30/24/18；capacity18；completed36；growth6；queued12；bottleneck yard |
| 2/1/1资源，其余同上 | rates60/24/18；capacity仍18；queued仍12 |
| 1/1/2资源，其余同上 | rates30/24/36；capacity24；completed48；queued0；bottleneck carrier |
| 1/2/2资源，到达24，2h | rates30/48/36；capacity30；completed48（受需求限），queued0；bottleneck crane |
| rates自定义20/20/30，1/1/1 | capacity20；bottleneck tied |
| 只改n20或cranes | lift-run key不变，不重启吊运 |

以上为引擎单测明确 oracle；本轮结果见 §9。

### 4.4 E-CP2 `span` 绳索绑定

本绑定目标是**两点间直绳段**，不做垂缆、滑轮倍率、绳张力或碰撞求解。拟议shape：

```ts
{ part: 'rope-a', span: {
  from: { part: 'trolley', point: [-2.6,0,-1] },
  to:   { part: 'spreader', point: [-2.6,0.3,-1] },
  minLength: 0.001
}}
```

这是无control/output的几何绑定分支（允许part+span，不能和旧分支output/control规则混淆）。`point`是被引用part在**未变换姿态下、相对其主primitive.at的局部坐标**；用该part最终场景矩阵变换为世界坐标p/q，读取pose→offset/rotate→play→shift后的同帧位置。若零件含repeat，此端点只引用主实例；repeat端点另行禁止以免歧义。

目标仅支持单一Y轴单位高圆柱，无extra/repeat、非context。输出中心=(p+q)/2，长度=|q-p|，局部Y旋转到(q-p)/长度，半径不变；不再对rope叠加pose/offset/play/shift/explode。p/q任一端因hide/group而不可见，rope也隐藏。长度<minLength时隐藏，不产零除；超过检查范围时在内容验证报错，不在用户UI加工程警告。

校验：引用part存在且不是span目标、不可自引用、禁止span依赖span或repeat端点；无环。每target只一条span；全主题≤16，minLength>0；geometry cylinder轴Y、原height=1。bound rope不得同时有其他变形绑定；clear/covered静止模式与reduced-motion仍更新终态。几何变换后更新引线锚点、剖切包围盒与测试API，避免绳画对而标注留在原处。

四绳的x±2.6,z±1对应各角；图版仅示意绳段，不复现真实滑轮穿绳。绳顶y50，吊具顶=centreY+0.3。在t0各长 **36.809m**，t12/t16/t32各长 **21.809m**，t28各长 **44.809m**；p/q同z，皆竖直。两端 `[0,3,0]`/`[0,0,4]` 的一般测试长5、中心[0,1.5,2]；同点隐藏；改变trolley/spreader时不得滞后一帧。精度≤1mm。[D03]

代码落点：sim-schema、port-schema（新）、lib/sim/port（新）、registry、bind与PartNode/frame、validator、单测与docs/06。先引擎后内容；实现记录见 §9。

### 4.5 HUD、镜头与模式

标题注记：EN “Generic port study · schematic layout · simulated times and capacities · not a terminal plan”; ZH “通用港口研究 · 布局示意 · 时间和处理能力为模拟 · 非码头平面图”。四规格行：容器类别20/40ft（sourced）；模型箱宽2.438m（DESIGN）；2025全港44.66mTEU（OBSERVED）；Tuas未来65mTEU/年（PLANNED，带2040年代）。只在相关章显示后两项。[F01–F03,F08,F12,D01]

PLATE最多6行，本章observe优先：boxes、teu、rehandles、capacity-rate、queued、bottleneck；各章只启用相关量。动态吊运的时刻由timeline UI读取，不把终态status当作动画进度。右上链路卡=Vessel→Quay crane→Carrier→Yard；选中箱时身份说明在阅读面板。遵守docs/08底部只有章节轴、44px触控、双主题/无hover依赖。

| preset | position | target | fov | 用途 |
|---|---|---|---|---|
| hero | [105,85,115] | [0,15,5] | 34 | 船/岸/院整体 |
| box | [30,19,28] | [0,2,0] | 32 | 独立同尺度样箱台（其pose移到原点附近） |
| lift | [35,38,45] | [0,23,-3] | 32 | 吊具与横移 |
| yard-view | [68,32,72] | [25,5,43] | 34 | 三层箱与移箱位置 |
| network | [105,95,115] | [0,12,8] | 36 | 转运空间关系；非地理航线 |
| tuas | [105,85,115] | [0,15,5] | 34 | 同模型解释自动化，不换成伪精确未来港 |

镜头为D01起点，施工需按HUD空带/手机竖屏实拍调；不把相机表当视觉验收结果。命名cut `box-half`只切工作箱一侧显示角柱；默认assembled、run=false，吊运章的重放拍才run=true。EXPLODED/REFERENCE/减少动态用终态，隐藏对象仍隐藏；抖动和真实吊摆不在本模拟。

## 5. 名词表 EN / ZH

### 5.1 产品名词表（选16个，研究候选61个）

| id | EN / ZH | 定义与注意 | see / facts |
|---|---|---|---|
| container | Container / 集装箱 | 适合不同运输环节使用的货物箱；本主题选干货箱 | sample-20；F01,F04 |
| teu | Twenty-foot equivalent unit / 二十英尺当量单位（当地报道常称标准箱） | 20英尺箱1、40英尺箱2，不是质量 | sample-20/40；F01,F32 |
| quay | Quay / 码头岸壁 | 船靠泊、岸上装卸相接处 | portal；F06 |
| quay-crane | Quay crane / 岸桥 | 跨船岸搬运的起重机 | portal；F06,F33 |
| spreader | Spreader / 集装箱吊具 | 接上角件的框架 | spreader；F05,F29 |
| corner-fitting | Corner fitting / 角件 | 起吊、堆放、固定的角部连接结构 | corner-fittings；F07,F29 |
| twistlock | Twistlock / 旋锁 | 本例吊具接入角件的锁具 | twistlocks；F05 |
| trolley | Trolley / 小车 | 沿臂架行走、承接起升装置 | trolley；F33 |
| hoist | Hoist / 起升机构 | 改变悬吊物高度 | rope-a；F33 |
| agv | Automated guided vehicle / 自动导引车 | 本例水平运箱的无驾驶员车辆 | agv-body；F16 |
| yard | Yard / 堆场 | 临时放箱与取箱的区域 | yard-gantry；F16,F21 |
| rehandle | Rehandle / 翻箱 | 本模型先移开挡住目标的箱 | yard-target；D05 |
| transhipment | Transhipment / 转运 | 中间港换接后续运输 | working-box；F21 |
| hub | Hub / 枢纽 | 多条运输联系接合的节点 | ship-hull；F19,F20 |
| throughput | Throughput / 吞吐量 | 指定时期、指定口径实际处理量 | 数据证据卡；F08 |
| capacity | Capacity / 处理能力 | 在所述条件下可处理的能力；规划与实测不同 | 图版；F12,D04 |

只有 parent terms 中 `sg_attested:true` 的词可称已核本地用语。岸桥/场桥/角件/旋锁等本轮为准确但待本地来源复核的候选，不虚构MOE中译。施工时无可靠本地形式则用中文解释搭配英文，而不是宣称术语已获认证。

## 6. 来源与逐项引用计划

### 6.1 来源表

下表由 `sources.json` 逐项展开（S01是原创设计条目）。产品 `sources.json` 按现有 schema 一对一映射：准备稿 S01–S09 → S1–S9，S10–S31 原号；正文、sim.source、零件 detail 均用产品号，不写非法前导零；每个正文数字必须指向对应来源，S01不能代替实证来源。访问日2026-10-27。公开可读网页只作事实证据，不代表照片/图表可下载复用。
<!-- GENERATED SOURCES -->
| id | 来源/出版者 | 许可或访问限制 | 用途 |
|---|---|---|---|
| S01 | [Atlas container-port design study](spec-draft.md) · Atlas | Original model; CC BY-NC-SA 4.0 | 设计/SIM |
| S02 | [Primary Science Syllabus 2023 (cached Jan 2026 edition)](https://www.moe.gov.sg/-/media/files/primary/primary-science-syllabus-2023_may24.pdf) · MOE | Reference only; MOE copyright | 见parent事实/数据记录；访问2026-10-27 |
| S03 | [2020 Social Studies Primary Teaching and Learning Syllabus (cached Jan 2024 edition)](https://www.moe.gov.sg/-/media/files/primary/2020-social-studies-primary.pdf) · MOE | Reference only; MOE copyright | 见parent事实/数据记录；访问2026-10-27 |
| S04 | [Singapore Posts Record Port Performance in 2025](https://www.mpa.gov.sg/media-centre/details/singapore-posts-record-port-performance-in-2025-and-develops-future-readiness-through-industry-collaborations-for-2026) · MPA | Reference only; not an asset licence | 见parent事实/数据记录；访问2026-10-27 |
| S05 | [Port of the Future](https://www.mpa.gov.sg/maritime-singapore/port-of-the-future) · MPA | Reference only; not an asset licence | 见parent事实/数据记录；访问2026-10-27 |
| S06 | [What Maritime Singapore Offers](https://www.mpa.gov.sg/maritime-singapore/what-maritime-singapore-offers) · MPA | Reference only | 见parent事实/数据记录；访问2026-10-27 |
| S07 | [Global Connectivity](https://www.mpa.gov.sg/maritime-singapore/what-maritime-singapore-offers/global-hub-port) · MPA | Reference only; older 2022 figures | 见parent事实/数据记录；访问2026-10-27 |
| S08 | [TEU (Twenty foot equivalent unit)](https://www.cbs.nl/en-gb/our-services/methods/definitions/teu--twenty-foot-equivalent-unit--) · Statistics Netherlands (CBS) | Reference only | 见parent事实/数据记录；访问2026-10-27 |
| S09 | [Size & Type Code](https://www.bic-code.org/size-type-code/) · Bureau International des Containers (BIC) | Reference only; do not copy ISO tables wholesale | 见parent事实/数据记录；访问2026-10-27 |
| S10 | [CTU Code, Annex 2 §3 Transfer by lifting](https://wiki.unece.org/spaces/TransportSustainableCTUCode/pages/23101982/3%2BTransfer%2Bby%2Blifting) · IMO/ILO/UNECE | Reference only; no downloaded figures | 见parent事实/数据记录；访问2026-10-27 |
| S11 | [NTP 1083: Grúas pórtico portacontenedores. Cestas acopladas: seguridad](https://www.insst.es/documentacion/colecciones-tecnicas/ntp-notas-tecnicas-de-prevencion/31-serie-ntp-numeros-1066-a-1101-ano-2016/ntp-1.083-gruas-portico-portacontenedores.cestas-acopladas-seguridad) · INSST (Spain) | Reference only; diagram reuse not cleared | 见parent事实/数据记录；访问2026-10-27 |
| S12 | [Transhipment Procedures Overview](https://www.customs.gov.sg/businesses/transhipping-goods/transhipment-procedures/) · Singapore Customs | Reference only; current legal advice out of scope | 见parent事实/数据记录；访问2026-10-27 |
| S13 | [Does the Concept of Density Develop? Judgments of Sinking and Floating (1987)](https://eric.ed.gov/?id=ED285671) · ERIC author abstract, ED285671 | Abstract reference only | 见parent事实/数据记录；访问2026-10-27 |
| S14 | [Developmental Study of Judgments of Floating and Sinking (2023), 44(1)](https://www.jstage.jst.go.jp/article/jraps/44/1/44_1/_article/-char/ja) · Japanese Research Association of Psychological Science / J-STAGE | Abstract reference only; full text not obtained | 见parent事实/数据记录；访问2026-10-27 |
| S15 | [Natural Earth Terms of Use](https://www.naturalearthdata.com/about/terms-of-use/) · Natural Earth / NACIS | Public domain | 见parent事实/数据记录；访问2026-10-27 |
| S16 | [Natural Earth 1:10m land GeoJSON](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_land.geojson) · Natural Earth / nvkelso repository | Public domain | 见parent事实/数据记录；访问2026-10-27 |
| S17 | [新加坡对海事业有信心 大士港口首阶段工程启动 (2016-04-30)](https://www.zaobao.com.sg/beltandroad/news/story20160430-611498) · 联合早报 | Reference only; no photos or full article retained | 见parent事实/数据记录；访问2026-10-27 |
| S18 | [港务集团与科研局研发 港口电动导引车管理系统 (2022-03-03)](https://www.zaobao.com.sg/news/singapore/story20220303-1248224) · 联合早报 | Reference only; no photos or full article retained | 见parent事实/数据记录；访问2026-10-27 |
| S19 | [Once Upon a Tide: Chinese gallery guide](https://www.nhb.gov.sg/nationalmuseum/-/media/nms2024/exhibition/once-upon-a-tide/ouat-gallery-guide-chinese.pdf) · National Museum of Singapore / NHB | Reference only; not downloaded | 见parent事实/数据记录；访问2026-10-27 |
| S20 | [Shaping the future of Maritime Singapore (updated 2026-08-25)](https://www.mot.gov.sg/what-we-do/maritime/shaping-the-future-of-maritime-singapore/) · Ministry of Transport | Reference only | 见parent事实/数据记录；访问2026-10-27 |
| S21 | [Written Reply on Adequacy of Singapore’s Seaports to Anticipate and Manage Severe Cargo Congestion (2024)](https://www.mot.gov.sg/news-resources/newsroom/written-reply-to-parliamentary-question-on-adequacy-of-singapore-s-seaports-to-anticipate-and-manage-severe-cargo-congestion/) · Ministry of Transport | Reference only; date-specific disruption | 见parent事实/数据记录；访问2026-10-27 |
| S22 | [Fourth IMO Greenhouse Gas Study 2020](https://www.imo.org/en/ourwork/environment/pages/fourth-imo-greenhouse-gas-study-2020.aspx) · International Maritime Organization | Reference only; published estimates for 2018 | 见parent事实/数据记录；访问2026-10-27 |
| S23 | [Container Throughput, Annual](https://data.gov.sg/datasets/d_085682b824700b4e88d946529f503da0/view) · MPA / data.gov.sg | Singapore Open Data Licence; outside explicit round-2 whitelist | 见parent事实/数据记录；访问2026-10-27 |
| S24 | [Singapore Open Data Licence](https://data.gov.sg/open-data-licence) · data.gov.sg | Licence reference only | 见parent事实/数据记录；访问2026-10-27 |
| S25 | [Container Crane in Use (3465060944).jpg](https://commons.wikimedia.org/wiki/File:Container_Crane_in_Use_(3465060944).jpg) · Daniel Ramirez; Wikimedia Commons | CC BY 2.0 | 见parent事实/数据记录；访问2026-10-27 |
| S26 | [Natural Earth 1:10m Geography Marine Polygons](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_geography_marine_polys.geojson) · Natural Earth / nvkelso repository | Public domain | 见parent事实/数据记录；访问2026-10-27 |
| S27 | [PM Lee Hsien Loong at the Official Opening of Tuas Port (2022-09-01)](https://www.pmo.gov.sg/newsroom/pm-lee-hsien-loong-at-the-official-opening-of-tuas-port/) · Prime Minister’s Office Singapore | Reference only | 见parent事实/数据记录；访问2026-10-27 |
| S28 | [Global maritime hub (updated 2026-08-25)](https://www.mot.gov.sg/what-we-do/maritime/global-maritime-hub/) · Ministry of Transport | Reference only | 见parent事实/数据记录；访问2026-10-27 |
| S30 | [Corner Fittings](https://www.bic-code.org/corner-fittings/) · BIC | Reference only; no video downloaded | 见parent事实/数据记录；访问2026-10-27 |
| S29 | [Container crane (4387783671).jpg](https://commons.wikimedia.org/wiki/File:Container_crane_(4387783671).jpg) · Wikimedia Commons; per-file author must be checked before reuse | CC BY-SA 2.0; separate share-alike family | 见parent事实/数据记录；访问2026-10-27 |
| S31 | [Existing Atlas Natural Earth 1:50m country label derivative](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/) · Natural Earth / Atlas build-geo | Public domain (Natural Earth input); no share-alike source | 见parent事实/数据记录；访问2026-10-27 |

## 7. 图像计划与记录

| 文件 | 类型/尺寸 | 对应章 | 核对重点 |
|---|---|---|---|
| `art/planned/container-port/container-port.png` | cover 1024×1024 | 整体 | 一岸桥跨船岸、四腿在岸、箱在吊具下、连续船体、陆侧箱场；非真实Tuas图 |
| `art/planned/container-port/container-port-teu-comparison.png` | figure 1536×1152 | 01 | 上两只短箱/下一只长箱、同宽同高、约2:1长度、没有把一长箱画成两只 |
| `art/planned/container-port/container-port-spreader-corners.png` | figure 1536×1152 | 02 | 一箱一吊具、四上角连接、框架留空、不是屋顶中央钩；就位状态，不教实际穿绳 |

参考事实F01/F02/F05/F29；画法为细石墨铅笔工程图版、交叉排线与点描、严格中性灰、透明PNG、无底纸/背景/字/数字/标签/品牌/旗/箭头/地影，主体约85%，边缘留空。工具原图经用户要求的确定性后处理校正尺寸、RGB相等与alpha保留；不凭图生成新的机械事实。生成提示词和人工/像素检查记录在同目录 `generation-prompts.json`、`manifest.jsonl`、`image-qa.json`。

全部新图；旧计划图未找到契合对象。`reusedFrom`只在真实copy复用时记录，本次不填。图库照片S25只列为未来建模参考，S29 BY-SA照片不参与本次原创艺术派生；同一图不混BY-SA与BY-NC-SA。

## 8. 施工顺序与验收

### 8.1 顺序

本轮按以下次序施工：核CTU全文与术语 → E-CP1纯函数/schema/测试 → E-CP2同帧绳端/测试 → 程序几何与参考并排R2两轮 → 材质/光R3 → 过程R4 → 双语正文和逐数来源 → 36拍与触控/URL → 视觉/离线验收。不安装依赖，不修改 package.json 或锁文件。

### 8.2 验收清单

- [ ] 所有显示字符串双语；id kebab-case；每个正文数值有来源，DESIGN/SIM/OBSERVED/PLANNED四类不混。
- [ ] 本主题是课纲外，C01–C03页码与缓存版本保留；不可把现代岸桥列为MOE指定知识点。
- [ ] 8章/36拍；每拍均有EN/ZH caption、fact id、可达到的舞台状态；index涵盖提到的可选part。
- [ ] 同一箱无重复身份；样箱计数3箱=4TEU；无mass输出；40英尺箱保持一只物体。
- [ ] 四角/吊具/锁连接可信；门架四腿都在岸上；船不在陆上；绳同帧跟随、无穿箱；顶部不是屋顶钩。
- [ ] 锁=false时不起吊；t8/16/24/28/30/32采样坐标和四绳长度通过§4测试；快照pose与live不双重移动。
- [ ] 1/1/1与2/1/1能力同为18；1/1/2为24；到达24/h、2h默认积压12箱，且标SIM；不称现场等待量。
- [ ] 目标上方2只→2次移开+1次取目标；不计复位的口径写明；没有伪造碰撞安全吊运路径。
- [ ] 2025全港44.66m与Tuas未来65m的地理/时间/类别分开；不连接成预测曲线；不把开港日当全部竣工。
- [ ] Geo图由已核PD文件生成，来源/哈希/处理命令随包；无手绘海岸/路线、无现状Tuas坐标、无外部瓦片。
- [ ] 许可目录列各文件家族；若未来选BY-SA或ODbL数据，先写独立文件与相应LICENSE-CONTENT carve-out，不能混入BY-NC-SA派生文件。
- [ ] paper/cinema、iPad触控、手机竖屏、reduced-motion、深链接、键与按钮、G重放、hide/isolate/cutaway组合均通过实拍；画面H模式可独立成立。
- [ ] 未来施工的 `pnpm check / validate / test / build / e2e` 与 `shoot --keys --layout --beats` 全绿；本轮单元与构建门槛见 §9；浏览器门槛按 BRIEF 明确跳过，不声称视觉验收通过。

### 8.3 Phase 0 定稿复核

准备账本实读：facts.json 含 C01–C03、F01–F35、M01–M02 共 40 项；facts-extra.json 含 D01–D06。表中 fact id 与两份 JSON 相符，不新增无账本事实。上文的“待施工／未来”表示验收尚未发生；本轮按 §0 默认实施，不需要额外许可轮次。施工状态严格使用用户指定 published。新增引擎严格只有 §4 的 port 与 span。浏览器 shoot/e2e 按 BUILD 明确禁行，交主 session 执行；不能把其它单元门槛当作视觉验收。

## 9. 施工记录

### 9.1 引擎验收记录（Phase 1）

保留 E-CP1 `port`（11 控件、15 输出、5 timeline 通道）与 E-CP2 `part+span` 两点绳段；复用其它绑定、时钟、pose、try-it/HUD/URL。删除新地图宿主/primitive/队列物理/rigid-link 求解器的工作。与未合并分支无依赖。

纯函数、strict schema、注册、design 来源校验、sample-port draft 夹具、专用 e2e 脚本、docs/06 作者说明已施工。port 最终 38 项、span 17 项、shift 回归 11 项通过；全量门槛见 §9.3。`engine.span(id)` 读实际同帧端点、中心、长度与可见性，使用最终 attachment 矩阵；绳段无独立时钟。

契约澄清：本轮只支持 Y/Z 吊运，source.x 必须等于 destination.x（不丢弃 X 位移）；yard shift 按零件真实 rest centre 算相对位移。来源号 S01→S1 等映射见 §6。

浏览器门槛依 BUILD/ENGINE/CONTENT 明令禁止，本轮不执行 shoot 或 e2e，也未操作用户浏览器；主 session 使用 `ATLAS_E2E_PORT=5450` 验收。

### 9.2 内容施工记录

- `container-port`：published，背景 + 7 章、36 双语拍、4 张试一试卡；30 可选对象 + 2 context，5 组、12 命名姿态、6 镜头；4 个 span 绳段、无粒子流。原生阅读面板内 2 幅真实数据 SVG 地理图版，未新增地图引擎。
- 20 项实际来源、16 词条；批准封面及两图均已查看并经 illustrate.ts 处理：800px 88KB／1600px253KB；两正文图112／114KB。源图、CTU／INSST参考许可与阻挡情况在 data/SOURCES.md、AUDIT.md。
- 生成器：`scripts/geo/container-port/build-parts.ts`、`build-chapters.ts`、`build-map.py`；三份原 PD GeoJSON 保存在 topic/assets，哈希与准备文件一致。额外 map/editorial JSON 不进严格 engine data 目录。
- 30 个零件均有双语功能说明及设计限制；工作箱空心波纹壳与角柱，四角锁具放大只便于看清。无品牌、铭牌、旗帜或遥测。
- `sample-port` 保持 draft；正式／夹具 e2e 共17用例已写（9+8），未跑浏览器；smoke 已增为35主题／70badges／geography3／末页Plate35。

**偏差与决定**：source 编号去前导零；堆场镜头 id 为 `yard-view` 避免与 group yard 撞名；接续船移至 [48,2,-51] 以免和第一船相交，工作箱终点相应为 [48,8.2955,-51]；堆场镜头改 [75,40,95]→[19,5,39]、36°，carrier 在 yard 快照中移到 z33，避免离开同章视野。这些布局调整都是 S1，不代表现实坐标。角件近景用 xray 避免外壳遮住引线；只有 working-box 接受剖切，避免箱体局部剖面切掉整船／岸桥／背景。

保持两条固定规格行（箱类与 DESIGN 宽），OBSERVED/PLANNED 两项只在第06章独立证据表显示，避免把全港实绩／Tuas规划混在模拟 HUD。F09、F13–F15、F24、F25 的增长率／大工程数字／旧量／全球排放旁支不写入产品；§9 覆盖前文旧细看提纲。C01–C03 只作编辑背景，topic.moe为空。S25实际照片不可达未使用；S11读正文与实际发布照片，未声称获得其PDF。S10改用已读官方FAO/IPPC全文副本。三份PD地图+原创艺术无新增第三方许可例外。

`REVIEW.md` 中文逐章列出 Gavin 应审的默认、段落边界和剩余浏览器工作；`AUDIT.md` 对照40父事实与6设计事实逐项记录。没有写其它主题回链，因为规格只要求本主题出链；未链接尚未发布的历史／土地主题。

### 9.3 全量门槛与待 Gavin 审读

- `pnpm validate`：59 topics，0 errors／0 warnings；完整 build 内再次验证。
- `pnpm test` 首轮4336通过／1个既有energy组合测试超时；隔离默认超时仍触发，调为30秒后64/64通过。全量用 `pnpm run test --maxWorkers=2 --minWorkers=1 --testTimeout=30000`：**164 files，4343 tests 全通过**（182.69s）。模型／正文最终变更另复测11/11。
- `pnpm check`：Astro 777 files，0 errors／0 warnings／3个既有 unused hints；最终 TypeScript 亦完成 exit 0；`pnpm build` 最终 exit 0：121 static pages（120.88s），内含59主题再校验0错误／0警告，PWA产物生成。EN/ZH构建HTML各含35首页主题和2幅港口地图，built payload已确认只有working-box可剖切。
- 浏览器 shoot／e2e 按明确指令跳过；手机390×844、paper/cinema、EN/ZH、reduced-motion、labels、模式组合、实际drawcalls与回归均未测。不能据此声称R2–R6视觉或性能通过。下一步主session使用 `ATLAS_E2E_PORT=5450`。
- 无 git 写操作，无 package.json／lockfile、review-queue 或 next-batch 修改；`git diff --check` 通过。
