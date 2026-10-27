# 45 · 飞机为什么能飞 · 内容施工 spec（`how-planes-fly`，SpaceScene；定稿 v1）

2026-10-27。父 dossier：`how-planes-fly`。SpaceScene / Model3DStage；paper 默认，cinema 可切。通用客机、独立翼型实验、独立涡扇剖面三个尺度的教具。背景章 + 7 章，38 拍，3 张试一试卡。**上线方式：直接上线**（`docs/next-batch.md` §一）；施工夹具与未验收内容暂为 draft，§8 全绿后主题设 `status: published`，不另设历史草稿审阅关卡。本文件是施工依据，不是已完成施工的报告；§9 留空。

## 0. 决策与事实复核

### 0.1 代定项（供 Gavin 后审，不阻塞本规格）

| # | 采用的具体方案 |
|---|---|
| D1 | EN **How planes fly** / ZH **飞机为什么能飞**；`subject: science`，`tags: [singapore, beyond-syllabus]`，`mode: space`，`engine: space-scene`，`stage: model3d`。航空原理作为拓展；不写 PSLE 必考或未经本轮核实的 MOE 页码。 |
| D2 | 保留背景 + 七章与 38 拍；07 章压为飞行里程碑、机场迁移和建设代价。删 Comet、747、当前机队、RSAF、教育研究样本数及 CO₂ 换算侧栏。不是完整世界航空史。 |
| D3 | 无品牌的双发下单翼、常规尾翼客机；独立翼盒与两转子涡扇。整机仅通用外形，历史型号只出现在文字中，模型不变形成历史飞机。 |
| D4 | 对称 Joukowski 实验剖面，ε=0.08；不加弯度、阻力系数、质量、配平、飞行轨迹积分。客机的弯翼结构插画不是实验剖面的坐标依据。[F59,F-D01] |
| D5 | 附着流用原创解析实现；失速后用明确标 SIM 的人工折线，±12° 为本模型分界。分离区只画静态虚线示意，停用附着流粒子和压力计算。不称为测量曲线。[F12–F15,F-D02] |
| D6 | SI；速度是相对空气速度，角度显示 degree、三角函数用 radian。整机缩小十倍；实验件按物理弦长画；独立发动机和翼盒只作结构比例，不共用整机比例尺。[F-D01] |
| D7 | 涡扇只做机械与气路动画，不新增发动机数值模型。修正草稿轴系：本样件低压风扇轴穿过空心高压核心轴；不能照草稿把高低压轴内外关系画反。[F24] |
| D8 | 迎角（攻角）首现双名，之后统一“迎角”；翼型、翼弦、副翼、升降舵、方向舵、襟翼、缝翼、外涵道、涡扇为行业通行中文，**未建立新加坡官方中文对应来源**，按编辑译名使用。加冷、巴耶利峇、樟宜为本地常用地名，本轮所读历史原文为英文。 |
| D9 | 07 章直述拆楼与迁掘坟墓的数量，不配墓地或受影响者照片，不由建筑／坟墓数推算人数；删面积细目，避免把土地平整与海上填海混成一个口径。[F43] |
| D10 | 复用已审三张 PNG，不生成、修改或下载其他发布插图。NASA / TU Delft 仅作事实与拓扑参考；不复制软件、第三方 CAD、坐标或图像。 |
| D11 | 章末无测验、计分；试一试先猜后看。公式与模拟局限放细看；每章 EN 200–300 词 / ZH 350–500 字，中文独立成文。 |
| D12 | 04-4 用既有 `duration: 0` 姿态与固定世界方向的箭头说明一个已倾斜姿态；删新 `frame` 绑定，不演示连续倾斜中的力方向。T2、T6 使用既有记录表；T3 才新增全迎角曲线。 |

### 0.2 依据与记录口径

只读主 checkout 的 `art/research/how-planes-fly/{spec-draft.md,how-planes-fly-research.md,facts.json,facts-extra.json,datasets.json}` 与 `art/planned/how-planes-fly/manifest.jsonl`。原 F01–F59 / S01–S57 编号保留，以下核查结果覆盖旧稿；施工方不得把已 cut 的内容从旧稿补回。

本轮逐一打开 §6 所列采用来源。研究稿及 facts 文件未发现字面 `⚑` 标记；仍审计全部 59 个事实，重点复核数字、机场建设代价、许可及模型数学。全文独立转述，直接引文 **0 字**。外部事实与原创设计数分开；`F-D01`–`F-D06` 是新设计事实号，统一引用将来的 `S58`（`design: true`）。

### 0.3 事实核查表

`verified` = 本轮原文支持，保留限定；`changed` = 来源或措辞已修正，只能用本表版本；`cut` = 不进入正文、字幕、细看、零件说明及展示数值。来源可在 §6 按 ID 找到直接链接与定位。**原 59 项：verified 39、changed 6、cut 14。**

| fact id | 结果 | 可采用内容／变更与来源 |
|---|---|---|
| F01 | verified | 四力为升力、重力、推力、阻力。[S01，四个力的小节] |
| F02 | verified | 重量朝地心，取决于飞机、燃油、载荷；不把稀薄空气等同无重力。[S01，Weight] |
| F03 | verified | 升力垂直原始相对来流，阻力平行来流且阻碍相对运动；升力不总竖直。[S01；S02，合力的分量] |
| F04 | verified | 无倾斜、水平推力、稳定水平飞行示例中 L=W、T=D，仍可匀速运动。[S01，Thrust 末段] |
| F05 | verified | 滑翔机可无发动机飞行；常规客机机翼提供大部分升力，发动机供推力。[S01] |
| F06 | verified | 压力积分和空气动量变化描述同一个空气动力，不相加两份升力。[S02，Which camp is correct] |
| F07 | verified | 上下空气无需在后缘同时重逢；等时到达解释错误。[S02，What is the argument] |
| F08 | verified | 上下表面都影响气流转向；只说底面撞空气不完整。[S02，末段] |
| F09 | verified | L=½ρV²SCl；V 为相对空气速度，S 为参考面积，Cl 包含形状与工况影响。[S04] |
| F10 | verified | ρ、S、Cl 固定时 V 加倍使 L 四倍；为 F09 的代数推论。[S04] |
| F11 | verified | 迎角在翼弦与来流之间量，不能用机身对地平线的姿态角替代。[S03，Angle of Attack] |
| F12 | verified | 小迎角时升力一般增加；较大迎角的分离可能造成失速与升力下降。[S03，Lift / Wing Stall] |
| F13 | verified | 失速点须针对翼型和工况确定；本题人工阈值不是通用临界角。[S03，测试相似条件与实验确定] |
| F14 | verified | 理想对称流中对称剖面零迎角零升力；非零迎角可有升力；弯翼可零迎角有升力。[S03，Plot] |
| F15 | verified | 失速指机翼气流分离与升力问题，不指发动机停机；不说升力全部消失。[S03，由 wing stall 定义作教学区分] |
| F16 | verified | 外侧后缘副翼通常反向偏转，改变滚转与倾斜。[S05] |
| F17 | verified | 倾斜使升力有侧向分量，帮助航迹转弯。[S05] |
| F18 | verified | 本常规尾翼样件的升降舵在水平尾翼后缘，改变俯仰。[S06，Wing；不照抄其前置 Wright 舵面图] |
| F19 | verified | 方向舵控制偏航，协调转弯时帮助对准弯曲航迹；不照抄“绝不会转弯”的绝对句。[S07] |
| F20 | verified | 襟翼在后缘，缝翼在前缘；改变翼形，平移式也改变面积；襟翼增加阻力。[S08] |
| F21 | verified | 扰流板在翼上表面，减升、增阻，与襟翼不同。[S08，Spoilers] |
| F22 | verified | 前方风扇后分核心与外涵两路。[S09，工作过程] |
| F23 | verified | 核心先压缩、后加燃料燃烧，再经涡轮与喷口。[S09] |
| F24 | changed | 两转子样件由涡轮经轴驱动风扇／压气机；**风扇低压轴在核心高压轴里面**。原稿零件表把内外写反；其他发动机可能有更多转子。[S09，two spool 段] |
| F25 | verified | 外涵绕过燃烧室和涡轮；核心与风扇气流都贡献推力。[S09] |
| F26 | verified | 涵道比是绕核心与过核心的空气质量流量之比；不由粒子个数读比值。[S09] |
| F27 | verified | FoilSim 将理想二维流与另加的失速修正分开；其默认 10° 修正是软件规则，非自然常数。只作施工参考，不展示该数字。[S10，Analysis options] |
| F28 | verified | NASA 教学软件可显示流线、示踪、压力与变量曲线；本题自主实现，不继承其源码许可。[S10，Graphics / Output] |
| F29 | verified | NASA 平均大气模型中密度、压力随高度减小；本题只用其对流层公式，常数逐项核过。[S11，公式段] |
| F30 | verified | Cd、V、S 固定时减小密度会减小阻力；不能推广成已配平飞机的总阻力结论。[S14，方程推论] |
| F31 | verified | 巡航选择涉及性能、燃油、天气、空管和飞行包线限制；不提供操作速度或建议。[S12，开头及速度／高度限制段] |
| F32 | verified | 高度是取舍；较低密度并不免除机翼和发动机对空气的需要，不宣称越高越好。[S11、S04、S12、S14，明确为综合推论] |
| F33 | changed | 只展示 **1903-12-17** 莱特兄弟有动力、可操纵、持续的重于空气飞行及奥维尔首飞 **12 秒**；删距离与单位换算，避免增加无助主线的数。[S17，日期；新增 S59，首飞时长] |
| F34 | cut | 删 Comet 客运日期及型号旁支，缩减里程碑范围。原来源 S18；未作为本轮已核实事实。 |
| F35 | cut | 删 747 首飞日期与型号旁支。原来源 S19；未作为本轮已核实事实。 |
| F36 | changed | 只写新航 **2007-10-15** 接收首架 A380，**2007-10-25** 开始悉尼商业服务；删本来源未明确交代的“慈善航班”修饰。[S56，印 p.3 / PDF 第 3 页，Fleet and Route Development] |
| F37 | cut | 删当前机队清单、型号统计与日期快照，避免维护长期失效数据。原来源 S21。 |
| F38 | verified | 加冷正式开幕 **1937-06-12**，民用机场功能于 **1955** 转至巴耶利峇。[S24，The History] |
| F39 | verified | 巴耶利峇正式开幕 **1955-08-20**；不另造运营日期。[S25，首段] |
| F40 | verified | 樟宜商业运营 **1981-07-01**，正式开幕 **1981-12-29**，事件口径分开。[S22；S23] |
| F41 | cut | 删首班抵达的钟点及“7 时／7 时 10 分”的比较；F40 的日期已足够。S22、S23 已打开，不制造两者现在仍冲突的说法。 |
| F42 | verified | 扩建巴耶利峇与迁至樟宜均被考虑；考虑容量、用地、航路及噪音。[S23，Changi Versus Paya Lebar] |
| F43 | changed | **1975** 开始的场地准备涉及拆除 **558 座建筑**、迁掘 **4,096 座坟墓**；删沼泽／填海面积。单位不是住户或人数，事件不等于全部在同一天完成。[S22，场地准备段；S23，Building Changi 首段交叉支持] |
| F44 | cut | 删空防司令部成立与更名年表，保留航空工程主线。原来源 S26。 |
| F45 | cut | 删尼泊尔地震军方救援侧栏，避免转入国防史。原来源 S27。 |
| F46 | cut | 不展示 P6 推／拉课纲条目及页码：S15 本轮返回真人验证，未绕过，不把旧缓存核查冒充本轮实时核查。 |
| F47 | cut | 同上，删课纲所需／不需术语的断言；重力物理事实仍由 F02 独立支持。[S15，访问受阻] |
| F48 | cut | 删精确课纲条目；涡扇能量传递用 F23–F25 支持，链接既有 `energy-conversion`。[S15，访问受阻] |
| F49 | cut | 删 P3 社会科课纲条目及页码：S16 返回真人验证；机场史本身仍保留。 |
| F50 | cut | 删研究文章数量与图像样本数；本题无小学生误解率。[原 S30] |
| F51 | cut | 删研究回顾结论的归属，旧稿仅有索引摘要；误解纠正由 NASA 原理页直接支持。[原 S28–S29] |
| F52 | cut | 删教育研究流行程度／对象推断；力平衡仍匀速由 F04 支持。[原 S31] |
| F53 | changed | 删 UIUC 剖面数量、版本和排序细目；本轮只建立“未取得本项目需要的明确再分发授权，故不使用”的资产决策。[S32 及其背景页] |
| F54 | verified | NASA 媒体指南的一般使用规则不涵盖第三方材料或受保护标识，也不替代具体软件许可。[S35] |
| F55 | changed | 改用 **S43**：翼肋保持翼型，翼梁承担弯曲载荷。原 S13 Wing Geometry 主要给几何定义，不能单独支撑翼梁／翼肋功能。沿翼展布置为本结构样件布局。[S43，功能三段] |
| F56 | verified | 两梁、蒙皮及边界翼肋构成一种翼盒；实际设计依条件变化。[S43] |
| F57 | cut | 删燃油 CO₂ 系数及计算：S51 本轮原 PDF 404；不以历史调研代替当前可读依据，也不新增排放计算。 |
| F58 | verified | 旧 NASA 软件目录称 public domain，旧 FoilSim 下载页又有非商业／不得转售限制；本题不复用源码，不推定所有版本同一许可。[S54；S55，Copyright Notice] |
| F59 | verified | Joukowski 映射可将圆及理想流映为翼型；Kutta 条件选环量。它不是黏性分离求解器。[S57，映射、Kutta 段；S03 的失速限制] |

### 0.4 设计值与派生数的复算记录

以下数是原创教学选择，**不是 TYPICAL、实测或实机认证参数**。S58 必须把输入、方程、可见结果与限制写全；不伪造“落在典型机型范围”的依据。2026-10-27 用独立 Python 算式复算标量与边界压力积分；并未实现或验收引擎。

| fact id | DESIGN / SIM 数值及其身份 |
|---|---|
| F-D01 | 整机构图长 40 m、翼展 36 m、高 12 m，舞台缩小 10 倍；样件物理 c=1 m、教学参考 S=2 m²，绘制厚度 0.12 m 只是裁出的短段，不拿其可见展长计算 S。ε=0.08。全属选定尺寸。[S58] |
| F-D02 | 人工峰值 12°；16°、20° 分别取峰值系数的 0.85、0.60；正负镜像。不是实测 polar；所有失速区数值标 SIM。[S58] |
| F-D03 | α 控件 −20…20°、每 4° 一档，默认 4°；V=[0,20,30,40,50,60] m/s，默认 40；h=[0,5000,10000] m，默认 0。这些是实验取值，不是客机速度／高度推荐。[S58] |
| F-D04 | 固定密度测试 ρ=1.225 kg/m³ 时 α4、V40、S2 得 q=980 Pa、Cl=0.47075898801417243、L=922.687616507778 N；V20 时 L=230.6719041269445 N，严格四倍关系。[S04、S57、S58] |
| F-D05 | **主题实际默认**采用 S11 平均大气：h0/5000/10000 时 ρ=1.226613787410970 / 0.7376745768470427 / 0.4140080791698312 kg/m³；α4、V40、S2 对应 L=923.9031443933111 / 555.6270996484747 / 311.8368390074898 N。不能把固定密度夹具读数抄进主题默认。[S11、S58] |
| F-D06 | LP/HP 画面转速 30/45 rpm；舵面及倾斜角、粒子数、时间放慢 80 倍、流线域和采样分辨率都是可读性参数，详 §3–4。只在模型说明中出现，不作为实机数据。[S58] |

## 1. 立场、范围与必须讲对的事实

本题让读者从可辨认的客机出发，看清四力、相对气流、迎角和失速，再把操纵面与涡扇的结构接起来。EN 用 aeroplane、metre 等英式拼写；默认英语，中文完整可切换。公式可选读，主文先讲看得到的变化；专业词首现当场解释。[F01–F26]

| 必须成立的教学结论 | 落点与可见证据 |
|---|---|
| 平衡不等于静止；四力平衡示例有明确条件。[F01–F05] | 01：水平、无倾斜，成对等长箭头，短段匀速示意；不拿该图解释爬升或转弯。 |
| 气压和动量是同一过程的描述；上下空气无需重逢。[F06–F08] | 02：同输入切换流线／压力；同刻释放示踪点，无后缘等候。只有一根升力合力箭头。 |
| 迎角相对空气量；对称翼型可有升力；失速不等于熄火。[F11–F15] | 03：对称样件 0° → 4° → 12° → 16°，实线到虚线，发动机风扇仍转。 |
| 副翼、升降舵、方向舵改变不同转动；倾斜升力帮助转弯。[F16–F21] | 04：分开的滚转／俯仰／偏航姿态，随后固定倾斜示意，不求飞行路径。 |
| 外涵不穿燃烧室；轴传功与气流通道不同。[F22–F26] | 05：冷外涵在核心之外，核心冷→热分段；低压内轴和空心高压外轴机械连接正确。 |
| 稀薄空气实验不是实际巡航配平。[F29–F32] | 06：固定 V、α、S 改 h；明确只是这个模型的条件比较。 |
| 机场迁移兼有交通目的与建设影响，事件口径清楚。[F38–F43] | 07：运营／正式开幕分列，拆除和迁掘数量单位不改成人数。 |

与已发布 `forces`、`energy-conversion` 互接（施工前读其 topic.yaml 确认可解析）；`singapore-land-use`、两个人文历史题若仍 draft，只在内部施工说明提及，不做公开死链。不讲 CFD、可压缩激波、真实飞机性能、操作步骤、事故、机型排名或自动驾驶。整机并非用于预测安全飞行的模型。[F09,F13,F31,F59]

## 2. 章节（00–07，共38拍）

### 2.0 总表与状态规则

每章显式写 view、run、cutaway、explode0、layers、hide、pose、part、camera、labels、sim.set。拍没有写的值继承**本章基线**，不继承上一拍；下表的“同02”也必须展开成实际值，尤其0速度／16°不能漏复位。`labels`每拍≤6，章近景≤3。未列的index对象只在细看提及也补进相应章索引。

| # / id | 标题 EN / ZH | 基线 | 拍数／试一试 |
|---|---|---|---|
| 00 `before-you-start` background | Before you start / 开始之前 | aircraft-overview；全静止；airframe,flight-controls,propulsion；不显实验读数 | 4／无 |
| 01 `four-forces` | Four forces in flight / 飞行中的四种力 | aircraft-overview；W+flight-flows；平衡示意；α4,V40,h0后台默认 | 5／无 |
| 02 `wing-and-air` | The wing and the air / 机翼与空气 | section-view；airfoil-bench,flight-flows；run；α4,V40,h0,streamlines | 5／速度 |
| 03 `angle-and-stall` | Angle of attack and stall / 迎角与失速 | section-view；同02；α0,V40,h0；run | 5／迎角 |
| 04 `changing-direction` | Changing direction / 改变方向 | controls-view；整机；pose null；run false | 5／无 |
| 05 `inside-a-turbofan` | Inside a turbofan / 涡扇发动机的里面 | engine-section-view；propulsion,flight-flows；engine-cut；run | 5／无 |
| 06 `thin-air` | Flying in thinner air / 在较稀薄的空气中飞行 | section-view；同02；α4,V40,h0；run | 4／高度 |
| 07 `flight-and-singapore` | Flight and Singapore / 飞行与新加坡 | aircraft-overview；整机 assembled，run false；无地图 | 5／无 |

### 2.0.1 可见对象集合（作者简写，输出时必须展开成现有 layers/hide）

不能只用propulsion组开关来分整机与独立发动机，否则同组另一个工位会漏出来。定义四个不重叠集合：**W整机23件**＝fuselage-shell,cockpit-glazing,wing-left,wing-right,wing-tip-left,wing-tip-right，全部13个flight-controls对象，以及nacelle-left,nacelle-right,fan-left,fan-right；**B翼盒4件**＝wing-box-skin,front-spar,rear-spar,wing-ribs；**E发动机13件**＝engine-shell,fan-disc,bypass-duct,compressor-bank,compressor-rotor,combustor-ring,turbine-bank,hp-turbine-rotor,lp-turbine-rotor,lp-shaft,hp-shaft,core-nozzle,bypass-nozzle；**A实验4件**＝foil-sample,chord-marker,inflow-reference,angle-marker。四者合计44件。context照常。

每个章和每一拍将目标集合的补集逐一写入`hide`，**不是累积上一拍hide**；再合并该拍临时隐藏（例如B中移开蒙皮、W中去掉两机舱两fan），layers打开目标集合所在的组与需要的flight-flows。mask不是新schema字段。进入每章／拍显式`part:null`、未提pose:null、非切面拍`cutaway:none`，避免带入上个工位。静态camera布局不作为隐藏的替代。

基线可见集合：00、01、04、07为W，02、03、06为A，05为E。例外必须展开：00-2=A，00-3=E，00-4=A；01-4=W减4个机舱／fan；01-5=A；02-1=B减wing-box-skin；03-5=A加fan-right和nacelle-right（合计6件，镜头拍内[−2,3.4,7]→[0,1.7,1.7]、fov30，同框看实验与静止机舱内旋转fan）；06-4=W。02-2至5回A，不能延续02-1隐藏；所有01的力箭头仅在W可见时出现，01-5换A后仅用来流基准，不残留飞机四力箭头。pressure、角弧、理想流与分离示意以foil-sample是否可见为总门控。

### 2.1 背景章 00 `before-you-start`

**summary** EN: “Use a generic airliner and a separate wing experiment to see forces, flow and propulsion.” / ZH：“从一架通用客机和独立的翼型实验，看清力、气流与推进。”[F01,F22,F59]

**正文提纲**：整机、翼型实验、发动机剖面是不同尺度的教具；说明SIM与有来源事实、虚线与实线；本题与既有 forces / energy-conversion 的概念连接，不作课纲逐条对照。`topic.yaml.note` EN：“The aircraft and engine are generic design studies. The separate wing uses ideal two-dimensional flow. The dashed stall region is an illustrative teaching rule, not measured aircraft performance.” / ZH：“飞机与发动机是通用设计研究。旁边的翼型采用理想二维流。失速区虚线是教学示意，不是实测飞机性能。”[F27,F59；DESIGN S58]

| 拍 | state／画面变化 | caption EN / ZH | fact ids |
|---|---|---|---|
| 00-1 | camera aircraft-overview；labels wing-left,nacelle-left,fin | This generic airliner has wings, engines and a tail. The wings provide most of its lift; the engines supply thrust. / 这架通用客机有机翼、发动机和尾翼。大部分升力来自机翼，发动机提供推力。 | F05 |
| 00-2 | camera section-view；只开airfoil-bench；labels foil-sample,chord-marker | This separate wing section is an experiment. It uses a simple mathematical shape, not the wing of a named aircraft. / 旁边这块翼型是实验教具。它用一个简单的数学形状，不是哪一型号飞机的机翼。 | F59；DESIGN S58,F-D01 |
| 00-3 | camera engine-section-view；E；engine-cut；labels fan-disc,combustor-ring,turbine-bank | The cutaway shows a fan, a core and the machinery joining them. Some air passes around the core. / 剖面能看见风扇、核心和连接它们的机构。有一部分空气绕过核心流动。 | F22–F25 |
| 00-4 | camera section-view；A；cutaway none；angle16,V40,h0；run；labels foil-sample | Dashed lines mark an illustrative stall region. They explain a limit of this teaching model; they are not a wind-tunnel measurement. / 虚线标出失速示意区。它说明教学模型的范围，不是风洞测量。 | F12–F13,F59；SIM S58,F-D02 |

**细看**：三种尺度；模型的人工参数；与既有力学／能量主题的关系。**索引**：wing-left,nacelle-left,fin,foil-sample,chord-marker,fan-disc,combustor-ring,turbine-bank。**首现名词**：lift、thrust、airfoil。

### 2.2 第01章 `four-forces`

**summary** EN: “Balanced forces can accompany steady motion.” / ZH：“力平衡时，飞机仍可以保持匀速运动。”[F04]

**正文提纲**：四力分别作用于飞机；重量随飞机／燃油／载荷；四箭头基于水平稳定飞行条件；滑翔机没有发动机仍能有升力、阻力；气流相对飞机的方向。定义力的平衡不等于静止，链已发布`forces`。[F01–F05]

| 拍 | state／画面变化 | caption EN / ZH | fact ids |
|---|---|---|---|
| 01-1 | camera aircraft-overview；lift/weight先显；labels wing-left,fuselage-shell | Weight pulls the aircraft towards Earth. In this level-flight picture, lift acts upwards against it. / 重力把飞机拉向地球。在这幅水平飞行示意里，升力向上，与重力相对。 | F02–F04 |
| 01-2 | 四箭头成对相等；balanced-travel run；labels nacelle-left | Lift balances weight and thrust balances drag in this steady, level example. The aircraft keeps moving. / 在这个稳定水平飞行的例子里，升力与重力平衡，推力与阻力平衡。飞机继续运动。 | F01,F04,F-D06 |
| 01-3 | 关balanced-travel；只保留thrust/drag；labels nacelle-left,wing-left | Thrust acts forwards, while drag opposes motion through the air. These arrows show forces on the aircraft. / 推力向前，阻力阻碍飞机相对空气的运动。这里的箭头都表示飞机受到的力。 | F01,F03 |
| 01-4 | engine图层隐藏双舱与fan；机翼保留；移到side camera | A glider needs no engine to have lift. An engine and a wing do different jobs. / 滑翔机没有发动机，也能产生升力。发动机和机翼做的事不同。 | F05 |
| 01-5 | section-view；A；inflow-reference显示；四箭头收起 | Lift is measured across the incoming airflow, and drag along it. Lift does not always point vertically upwards. / 升力垂直于来流方向，阻力沿着来流方向。升力并不总是竖直向上。 | F03 |

01-4 的隐藏只是概念对照，不把剩余客机称为可实际滑翔的设计；图注“engine-free comparison / 无发动机概念对照”。**细看**：四力图的条件；空气与地面速度；为什么平衡仍运动。[F03–F05] **索引**：fuselage-shell,wing-left,wing-right,nacelle-left,nacelle-right,inflow-reference。**首现**：weight、drag（balanced forces 当场用短句解释）。

### 2.3 第02章 `wing-and-air`

**summary** EN: “A wing changes the surrounding airflow and pressure.” / ZH：“机翼改变周围的气流和气压。”[F06,F08]

**正文提纲**：先看翼盒的梁肋和剖面，再用独立对称样件；同时有上下表面；气流、压力是同一物理过程的视角；直接否定“路径长必须赶上”；固定密度／面积／系数比较速度。公式只在细看。[F06–F10,F14,F55–F56,F59]

| 拍 | state／画面变化 | caption EN / ZH | fact ids |
|---|---|---|---|
| 02-1 | wing-structure-view；B；hide wing-box-skin；labels front-spar,rear-spar,wing-ribs | Spars run along the wing, while ribs hold its cross-sectional shape. This cutaway shows one chosen structural example. / 翼梁沿翼展延伸，翼肋维持机翼的剖面形状。这幅剖面画的是选定的一种结构样件。 | F55–F56,F-D06 |
| 02-2 | section-view；alpha4,V40,h0；streamlines；labels foil-sample,inflow-reference | In this ideal flow model, air changes direction around both sides of the wing. The lines show direction, not packets that must stay together. / 在这个理想流模型里，空气沿机翼上下两侧改变方向。线表示气流方向，不表示必须结伴的空气包。 | F06–F08,F59 |
| 02-3 | 相同上游时刻发脉冲；同alpha4；labels foil-sample | The marked air follows local speeds. Air passing above and below has no requirement to meet again at the trailing edge. / 标出的空气按各处的速度前进。经过上下两侧的空气，不需要在后缘重新碰头。 | F07,F28,F59 |
| 02-4 | flow-view pressure；同一物理输入；labels foil-sample | This pressure view uses the same ideal flow. Pressure differences and the turning of air describe one aerodynamic force. / 气压图使用同一个理想流。气压差与气流转向，是对同一个空气动力的两种描述。 | F06,F08,F59 |
| 02-5 | flow-view streamlines；V20→拍终值40；alpha4,h0 | In this simulation, doubling speed gives four times the lift while density, area and lift coefficient stay fixed. / 在这个模拟里，密度、面积和升力系数不变时，速度加倍，升力变成四倍。 | F09–F10；SIM S58,F-D04 |

**试一试T2**：vary airspeed-mps；keep angle-deg,altitude-m,双语“Same section and reference area / 翼型和参考面积不变”；observe speed-now,lift-n；record true（共用记录表；本版不画 T2 折线图）。预测 start速度20、change40，observe lift-n，选more/same/less（具体倍数在观察后说明）；速度0得到零力但几何不消失。**细看**：L方程；理想模型不含什么；上下空气无需重逢。**索引**：wing-box-skin,front-spar,rear-spar,wing-ribs,foil-sample,chord-marker,inflow-reference。**首现**：pressure、streamline、wing-structure。

### 2.4 第03章 `angle-and-stall`

**summary** EN: “More angle gives more lift only over part of the range.” / ZH：“增加迎角只能在一定范围内增加升力。”[F11–F13]

**正文提纲**：用来流为基准量迎角；姿态角不等于迎角；对称样件零迎角；先增后降；失速与发动机无关；失速不等于所有升力归零。明确本曲线12°是设计分界，不是“查到的真实临界值”。[F11–F15,F27,F59]

| 拍 | state／画面变化 | caption EN / ZH | fact ids |
|---|---|---|---|
| 03-1 | section-view；alpha0,V40,h0；labels chord-marker,inflow-reference | Angle of attack is measured between the chord and the incoming air. Here the symmetric wing is at zero angle and has zero lift in the ideal model. / 迎角是翼弦与来流之间的角。在理想模型里，这块对称翼型零迎角时，升力为零。 | F11,F14,F59,F-D01 |
| 03-2 | alpha4；labels foil-sample,angle-marker | Tilt this symmetric section to four degrees in the simulation. It now produces lift; a rounded top alone is not the explanation. / 在模拟里，把对称翼型转到四度，它就产生了升力。不能只用上表面的弯曲来解释。 | F14；SIM S58,F-D03 |
| 03-3 | alpha12；图点到峰；labels foil-sample | The teaching curve rises to its chosen peak at twelve degrees. This value belongs to our illustrative model, not every real wing. / 这条教学曲线在选定的十二度达到峰值。这个数属于示意模型，不适用于每一块真实机翼。 | F12–F13；SIM S58,F-D02 |
| 03-4 | alpha16；虚线分离图／曲线；pressure消失；labels foil-sample | Beyond that model boundary, lift falls on the dashed curve. Separated flow is shown as a diagram; the ideal solver cannot calculate a real stall. / 超过模型分界，虚线上的升力减小。分离气流用示意图表示；理想求解器不能计算真实失速。 | F12–F13,F59；SIM S58,F-D02 |
| 03-5 | 显式alpha16；A加fan-right,nacelle-right；拍内镜头；fan run；labels foil-sample,fan-right | A wing can stall while the engine is still running. Stall concerns airflow and lift, and does not mean all lift suddenly disappears. / 发动机仍在运转时，机翼也可能失速。失速说的是气流和升力，不是所有升力突然消失。 | F12,F15 |

**试一试T3**：vary angle-deg；keep airspeed-mps,altitude-m,“Same section and reference area / 翼型和参考面积不变”；observe cl-now,lift-n,flow-state；record true＋E-AF3（不叠普通record.chart）。预测 start12→change16，observe lift-n，more/same/less；观察后不打分。可向负角度走，按镜像比较。**细看**：迎角／姿态区别；真实Re/Mach／表面状况会影响结果但本模型不求这些；为何虚线不是风洞数据。[F11–F15,F27] **索引**：foil-sample,chord-marker,inflow-reference,angle-marker,fan-right,nacelle-right。**首现**：angle-of-attack、chord、stall；flow separation 与 Cl 用句子解释。

### 2.5 第04章 `changing-direction`

**summary** EN: “Control surfaces change the aircraft’s orientation.” / ZH：“操纵面改变飞机的姿态。”[F16–F19]

**正文提纲**：三种转动分开画、轴线可见；之后倾斜升力引出转弯；最后说明低速时翼形可改变，扰流板另在细看。每种舵面是示意动作，不提供机型操作角。[F16–F21]

| 拍 | state／画面变化 | caption EN / ZH | fact ids |
|---|---|---|---|
| 04-1 | controls-roll；labels aileron-left,aileron-right | The ailerons move in opposite directions. They help roll the aircraft into a bank. / 两侧副翼朝相反方向偏转，帮助飞机滚转、倾斜。 | F16 |
| 04-2 | controls-pitch；labels elevator-left,elevator-right | The elevator changes pitching motion: the nose turns up or down. It is part of the horizontal tail. / 升降舵改变俯仰，让机头向上或向下转动。它位于水平尾翼。 | F18 |
| 04-3 | controls-yaw；labels rudder,fin | The rudder controls yaw, turning the nose left or right. In a coordinated turn, it helps keep the aircraft aligned with its path. / 方向舵控制偏航，让机头左右转动。在协调转弯时，它帮助飞机沿着弯曲的航迹对准方向。 | F19 |
| 04-4 | controls-bank（duration:0）；world重力＋固定倾斜lift；labels wing-right | Banking tilts lift. Its sideways component helps curve the flight path; this pose is an explanation, not a calculated flight. / 飞机倾斜时，升力也倾斜。向侧面的分量帮助航迹转弯；这个姿态用于说明，并非飞行计算。 | F17；DESIGN S58,F-D06 |
| 04-5 | high-lift-open；labels flap-left,slat-left | Flaps and slats change the wing for lower-speed flight. Flaps also add drag; they are different from spoilers. / 襟翼和缝翼改变翼形，帮助较低速度的飞行。襟翼也增加阻力；它与扰流板不同。 | F20–F21 |

**细看**：滚转／俯仰／偏航；扰流板抬起；设计角度与真实飞机区别。**索引**：aileron-left,aileron-right,elevator-left,elevator-right,tailplane-left,tailplane-right,rudder,fin,wing-right,flap-left,flap-right,slat-left,slat-right,spoiler-left。**首现**：flight-controls、high-lift-devices；各舵面和 roll/pitch/yaw 在这两个词条与正文解释。

### 2.6 第05章 `inside-a-turbofan`

**summary** EN: “A turbofan has two air paths and machinery linking turbines to the fan and compressor.” / ZH：“涡扇有两条气路，涡轮通过轴带动风扇和压气机。”[F22–F25]

**正文提纲**：入口风扇→分流→核心压缩燃烧→涡轮提取能量→双喷口。轴不是空气管，外涵不烧油。两转子是样件，不说所有发动机一样。链已发布energy-conversion。[F22–F26]

| 拍 | state／画面变化 | caption EN / ZH | fact ids |
|---|---|---|---|
| 05-1 | engine-cut；engine-intake；labels fan-disc,engine-shell | The large front fan draws air into the engine. The cutaway lets us see what lies behind it. / 前方的大风扇把空气引入发动机。剖面让我们看见它后面的结构。 | F22 |
| 05-2 | bypass与core-cold同开；labels bypass-duct,compressor-bank | Air divides into an outer bypass stream and a central core stream. The bypass air goes around the core. / 空气分成外侧的外涵气流和中央的核心气流。外涵空气绕着核心流过。 | F22,F25 |
| 05-3 | core-hot开启；labels compressor-bank,combustor-ring,turbine-bank | In the core, air is compressed before fuel is added and burned. The hot gas then passes through turbines and towards the nozzle. / 核心气流先被压缩，再加入燃料燃烧。热气随后经过涡轮，流向喷口。 | F23 |
| 05-4 | nested shaft cut-back；labels lp-shaft,hp-shaft,fan-disc | Turbines drive the fan and compressor through shafts. The fan shaft runs inside the core shaft in this two-spool example. / 涡轮通过轴带动风扇与压气机。在这个两转子样件里，风扇轴从核心轴的内部穿过。 | F24；DESIGN S58,F-D06 |
| 05-5 | 两出口流亮；labels core-nozzle,bypass-nozzle | Both streams help provide thrust. Hot gas also drives the turbines connected to the fan and compressor. / 两股气流都帮助产生推力。热气还推动涡轮，经轴带动风扇与压气机。 | F23,F25 |

**细看**：涵道比是质量流量比，不用图上粒子数代替；两轴关系；本样件的叶片数、级数与画面转速不代表实机。[F24,F26,F-D06] **索引**：engine-shell,fan-disc,bypass-duct,compressor-bank,compressor-rotor,combustor-ring,turbine-bank,hp-turbine-rotor,lp-turbine-rotor,lp-shaft,hp-shaft,core-nozzle,bypass-nozzle。**首现**：turbofan、core-machinery；其他机械子词在相关词条解释。

### 2.7 第06章 `thin-air`

**summary** EN: “Thinner air changes aerodynamic forces, but does not remove the need to support weight.” / ZH：“稀薄空气会改变空气动力，但飞机仍需要支撑重量。”[F02,F09,F29–F32]

**正文提纲**：标准大气的密度高度关系；固定速度迎角的实验与实际巡航分开；方程推论不等于最佳巡航高度；实际限制包含动力、天气、交通和飞行包线。[F29–F32]

| 拍 | state／画面变化 | caption EN / ZH | fact ids |
|---|---|---|---|
| 06-1 | section-view；alpha4,V40,h0；rho-now读数 | This average-atmosphere model starts near sea level. It is a reference model, not today’s Singapore weather. / 这个平均大气模型从接近海平面开始。它是参考模型，不是新加坡今天的天气。 | F29,F-D05 |
| 06-2 | h5000；alpha4,V40固定；lift箭头变短 | At the same speed, angle and reference area, the thinner air gives less lift in this simulation. / 在这个模拟里，速度、迎角和参考面积不变时，较稀薄的空气产生较小的升力。 | F09,F29；SIM S58,F-D05 |
| 06-3 | h10000；相同几何线、较小lift；labels foil-sample | Density changes the force here, while the ideal streamline shape stays the same. A real aircraft still needs to support its weight. / 这里密度改变了力，理想流线的形状仍相同。真实飞机仍然需要支撑自身重量。 | F02,F09,F29,F59；SIM S58,F-D05 |
| 06-4 | cruise-view；W；重力示意保留，实验图退为卡片 | Flying higher is a compromise. Aircraft performance, available thrust, weather and traffic all limit the choice; higher is not always better. / 飞得更高是一种取舍。飞机性能、可用推力、天气和空中交通都会限制选择；并非越高越好。 | F31–F32 |

**试一试T6**：vary altitude-m；keep angle-deg,airspeed-mps,“Same section and reference area / 翼型和参考面积不变”；observe rho-now,lift-n；record true（复用记录表，不画 T6 图）；预测0→10000观察lift less。此卡没有drag输出，不给“节油曲线”。**细看**：S11完整公式和数值；真实巡航会改变速度与迎角；固定条件的drag推论只文字说明，不输出本模型没有求解的阻力。[F29–F32] **索引**：foil-sample,chord-marker,inflow-reference,fuselage-shell,wing-left,nacelle-left。**首现**：air-density；airspeed 用句子解释。

### 2.8 第07章 `flight-and-singapore`

**summary** EN: “Air travel uses machines and airports, and airport development changes land and communities.” / ZH：“航空交通依靠飞机与机场；机场建设也改变土地与社区。”[F36,F38–F43]

**正文提纲**：选择性里程碑，不写单一国家胜利史。日期列表是正文中的记录，不启动 TimeScene。整机只作通用对照，常驻图注 EN “Generic comparison model / 通用对照模型”；不把这架双发客机称为 Wright Flyer 或 A380。民用机场序列不代表新加坡从未有其他机场。[F33,F36,F38–F43]

| 拍 | state／画面变化 | caption EN / ZH | fact ids |
|---|---|---|---|
| 07-1 | W；aircraft-overview；reader 的 1903 记录；labels wing-left | In December 1903, the Wrights demonstrated powered, controlled, sustained heavier-than-air flight. Orville’s first flight lasted twelve seconds. This generic model is not their aircraft. / 1903 年 12 月，莱特兄弟展示了有动力、可操纵、持续的重于空气飞行。奥维尔首飞持续十二秒。画面里的通用模型不是那架飞机。 | F33 |
| 07-2 | W；reader 的 2007 两条不同事件日期；labels nacelle-left | Singapore Airlines received its first A380 on 15 October 2007 and began commercial services to Sydney on 25 October. Delivery and passenger service are different events. / 新航在 2007 年 10 月 15 日接收首架 A380，10 月 25 日开始悉尼商业服务。交付与投入客运是不同事件。 | F36 |
| 07-3 | W；reader 加冷→巴耶利峇文字序列；labels fuselage-shell | Kallang Airport officially opened in 1937. Its civil-airport role passed to Paya Lebar in 1955. These names describe a sequence of civil-airport changes. / 加冷机场在 1937 年正式开幕，民用机场功能在 1955 年转到巴耶利峇。这条文字序列记录的是民用机场的变化。 | F38–F39 |
| 07-4 | W；reader 樟宜两事件；labels wing-left | Changi began commercial operations on 1 July 1981. Its official opening was on 29 December that year. Operations and a formal opening can have different dates. / 樟宜在 1981 年 7 月 1 日开始商业运营，同年 12 月 29 日正式开幕。开始运营和正式开幕可以是不同日期。 | F40 |
| 07-5 | W；reader 同段呈现规划目标与影响；labels fuselage-shell | Planning considered capacity and noise. Site preparation beginning in 1975 involved demolishing 558 buildings and exhuming 4,096 graves. These count buildings and graves, not people. / 规划考虑了容量与噪音。1975 年开始的场地准备涉及拆除 558 座建筑、迁掘 4,096 座坟墓。这里统计的是建筑和坟墓，不是人数。 | F42–F43 |

**细看**：莱特里程碑的完整日期 1903-12-17；不把气球／滑翔机史抹去。[F33] 加冷正式开幕 1937-06-12、巴耶利峇正式开幕 1955-08-20；运营与典礼的用词。[F38–F40] 为什么机场会换地方；建设影响和计数单位。[F42–F43] 不再附机队、军方、研究统计、填海面积或排放数值。**索引**：fuselage-shell,wing-left,nacelle-left；历史记录从正文自然顺序阅读，不假造历史飞机的可选零件。**首现**：无需新增专业词。

### 2.9 正文写作和跨章闭合

施工后每章主文 EN200–300词、ZH350–500字，3–5段；细看2–4块。字幕EN≤45词，中文独立成文；每拍先说当前可见变化。首现 `<Term>`，正文数量用 `<Num s>`，SIM数量在句中写“在这个模拟里”。来源超短引文可以保留，但本文目前只转述，0条新增直接引文。章节数字序号与设计参数也不得包装成事实。链接目标必须已发布，draft sibling先文字提及；00/01/03→forces，05→energy-conversion，07→将来的交通内容（对方 published 后才加链接）。背景＋7章的拍数为4+5+5+5+5+5+4+5=38。

## 3. 零件、数据与图层计划

### 3.1 分区、尺度与可见集合

| 分区 | group id | EN / ZH | 用途与颜色 |
|---|---|---|---|
| 01 | `airframe` | Airframe / 机体 | 整机机体和独立翼盒；`token:ink-2`，蒙皮 casing。 |
| 02 | `flight-controls` | Controls / 操纵面 | 主操纵面与增升装置；材质 casing，选中 signal。 |
| 03 | `propulsion` | Propulsion / 推进 | 整机发动机外形和独立剖面；钢轴、哑光壳；气路颜色另给。 |
| 04 | `airfoil-bench` | Airfoil / 翼型实验 | 原创解析剖面、弦线、来流基准、角度锚点；石墨与 signal。 |
| 05 | `flight-flows` | Air and forces / 气流与力 | 只有流与叠加，没有实体；冷空气 `token:air`、燃后 `token:hot`；力类别见 E-AF5。 |

Y 向上，整机机头 −X，来流 +X；从驾驶员向前看的左翼在 +Z、右翼在 −Z。整机质心示意 `[0,1.1,0]`，舞台包络长 4、展 3.6、高 1.2。翼盒独立工位 `[0,1.1,2.4]`；发动机剖面轴 +X、中心 `[0,.8,-2.8]`。实验未旋转前缘 O=`[-.5,2.2,2.7]`，弦向 +X；迎角正值绕 Z 负转角，pivot=`[-.25,2.2,2.7]`。实验实体 Z 厚 .12，前表面 z=2.76，流与角弧 z=2.762；不得按草稿把居中 extrude 的中心误当前表面。[F11,F-D01,F-D06]

**44 个可选对象 + 1 个 context**：W 整机 23、B 翼盒 4、E 独立发动机 13、A 实验 4；分集合是作者生成器变量，不增加 schema 字段。与旧稿的 41 件相比，多拆出压气机转子和高／低压涡轮转子，让不同转速能用既有动画实现。**不为此新增组件内独立动画系统。** §2 的 E 集合、总数与索引按这里修正。

### 3.2 零件清单（同表的左右件各有独立 id、summary、detail）

每件 `summary` ≤60 字符，先写功能；`detail` 2–3 段，事实引用 F 对应的 S，设计引用 S58。不编材料牌号、真实级数、真实转速。`connects` 双向核对，是机械或结构关系，不自动代表空气通路。

| 集合 / id | 名称 EN / ZH；功能 | 现有 primitive、材质、拓扑与拆开 |
|---|---|---|
| W `fuselage-shell` | Fuselage / 机身；连接翼尾 | 椭圆 sweep，沿 X 长 4；casing，shell；向 +Y .4；连双翼、fin、双 tailplane。 |
| W `cockpit-glazing` | Cockpit / 驾驶舱；标出机头 | 鼻部 `[-1.7,1.15,0]` 薄 extrude，glass；连机身，不拆。 |
| W `wing-left`, `wing-right` | Left / Right wing / 左翼／右翼；主要升力面 | 渐缩平面形 extrude，左 +Z／右 −Z 镜像，根部 x≈−.15、y≈1；半展 1.8；shell、casing；向外 ±Z .5；连机身、相应舵面。[F05] |
| W `wing-tip-left`, `wing-tip-right` | Left / Right tip / 左／右翼尖；完整轮廓 | 薄 extrude，z=±1.8；与翼连续；不声称节油或减阻百分比。 |
| W `aileron-left`, `aileron-right` | Aileron / 副翼；滚转 | 外侧后缘 extrude；pivot 在各自翼展铰链上；连对应主翼。[F16] |
| W `tailplane-left`, `tailplane-right` | Tailplane / 水平尾翼；承载升降舵 | x≈1.5，z 正负成对的 extrude；连机身、对应 elevator。[F18] |
| W `elevator-left`, `elevator-right` | Elevator / 升降舵；俯仰 | 水平尾翼后缘，铰链沿展向；casing。[F18] |
| W `fin` | Vertical fin / 垂直尾翼；承载方向舵 | 竖向 extrude，后机身，连 rudder。[F19] |
| W `rudder` | Rudder / 方向舵；偏航 | fin 后缘，竖直铰链。[F19] |
| W `flap-left`, `flap-right` | Flap / 襟翼；改变低速构型 | 内侧后缘 extrude，pose 平移后下偏。[F20] |
| W `slat-left`, `slat-right` | Slat / 缝翼；前缘增升 | 薄弯壳，pose 前移留缝，不穿主翼。[F20] |
| W `spoiler-left` | Spoiler / 扰流板；减升增阻 | 左翼上表面片，后缘铰起；一侧示范，不暗示实机只装一块。[F21] |
| W `nacelle-left`, `nacelle-right` | Nacelle / 发动机舱；包围风扇 | 环形 lathe 壳，轴 X，位于翼下；shell，连各自 fan。[F22] |
| W `fan-left`, `fan-right` | Fan / 风扇；推动空气 | blades，轴 X；实例叶片同一转子；连各自 nacelle。[F22] |
| B `wing-box-skin` | Wing skin / 翼蒙皮；围成翼盒 | 局部翼型薄壳 extrude；shell、casing；向 +Y .3。[F56] |
| B `front-spar`, `rear-spar` | Spar / 翼梁；承载弯曲 | 两道沿翼展的 bevelBox 腹板与帽缘；steel；连 skin 和 ribs；沿 ±X .15 拆。[F55–F56] |
| B `wing-ribs` | Ribs / 翼肋；保持翼型 | 有孔 extrude，线性 repeat 3；casing；连两梁和 skin。三道是绘图选择。[F55,F-D06] |
| E `engine-shell` | Engine case / 发动机外壳；围住核心 | 空心 lathe；shell、casing；向 Z .3；入口导叶为静止 extra。[F22] |
| E `fan-disc` | Fan / 风扇；推动两路空气 | 大直径 blades，轴 X；连内侧 lp-shaft；LP 视觉转速。[F22,F24] |
| E `bypass-duct` | Bypass duct / 外涵道；绕核心通气 | 同轴环形薄壳；shell；连 fan-disc、bypass-nozzle。[F25] |
| E `compressor-bank` | Compressor stators / 压气机静子；导向核心气流 | 不动的分排叶片与壳体，叶高沿轴变化；连 compressor-rotor、combustor-ring。[F23] |
| E `compressor-rotor` | Compressor rotor / 压气机转子；压缩空气 | 独立 blades / repeat；连空心 hp-shaft，HP 转速；不与静子合成一个旋转 part。[F23–F24] |
| E `combustor-ring` | Combustor / 燃烧室；向核心加入能量 | 环形 lathe，轴心留机械通孔；连压气机与 turbine-bank；无外喷火。[F23] |
| E `turbine-bank` | Turbine stators / 涡轮静子；导向热气 | 静止叶列与外部结构；连两个 turbine-rotor、core-nozzle。[F23] |
| E `hp-turbine-rotor` | Core turbine / 核心涡轮转子；驱动压气机 | 燃烧室后，独立 blades，连 hp-shaft；HP 转速。[F24] |
| E `lp-turbine-rotor` | Fan turbine / 风扇涡轮转子；驱动风扇 | HP 涡轮之后，独立 blades，连 lp-shaft；LP 转速。[F24] |
| E `lp-shaft` | Fan shaft / 风扇轴；传递功 | **中心内轴**，tube / cylinder；steel；连 fan-disc 与 lp-turbine-rotor。[F24] |
| E `hp-shaft` | Core shaft / 核心轴；传递功 | **空心外轴**包住 lp-shaft，局部 cut-back 露内轴；连 compressor-rotor、hp-turbine-rotor；两轴留间隙。[F24] |
| E `core-nozzle` | Core nozzle / 核心喷口；排出核心气流 | 收敛 lathe，连 turbine-bank；不得堵中心轴机械端。[F23] |
| E `bypass-nozzle` | Bypass outlet / 外涵出口；排出外涵气流 | 外层环形出口，连 bypass-duct。[F25] |
| A `foil-sample` | Airfoil / 翼型；计算样件 | §4 公式采样 128 点→extrude depth .12、bevel 0；casing。禁止用昆虫 `wing` primitive；禁止外部坐标。[F59] |
| A `chord-marker` | Chord / 翼弦；量迎角 | 细 tube，O 至 O+[c,0,0]，与 sample 同 pivot 负α转动；不投影。[F11] |
| A `inflow-reference` | Incoming air / 来流；固定角度基准 | 固定 +X 细 tube；不随 sample 转，不投影。[F11] |
| A `angle-marker` | Angle / 迎角；角弧索引锚点 | 极小 marker，实际弧由 E-AF2 画；选中显示迎角说明，不制造第三个角度求解。[F11] |
| context `display-plinth` | Display base / 展台 | 组外、不可选、不标注、不进索引；可按现有 hide 控制；无虚假整机共同实长比例。 |

**本章索引点击**：实际 `explorer/ChapterIndex.tsx` 的 part 行只执行 `patch({part:id})`，立即在章头下方显示所选详情并更新 aria-pressed；**不自动显出 hide 对象或飞镜头**，不为本题改造它。每件 detail 首段说明所属工位及可见拍，例如翼盒见 02-1、发动机见 05、实验件见 02-2；读者用已有拍行／章拍轴进入相应画面。跨工位对象仍留索引，因为其详情已经可点读，不假造 `index.preset` 字段。

### 3.3 流与动画（全部复用现有机制，实验流除外）

| flow id | 路径、显示与绑定 | DESIGN 参数 |
|---|---|---|
| `section-air` | E-AF2；16 条解析路径，共用场、独立物理时间；不是手画装饰曲线 | count 128、spread 0、flat true、clip false；其余 schema 见 §4。 |
| `engine-intake` | 入口→fan-disc；air；`parts` 关联入口、风扇 | count 96、speed .25、ends open。 |
| `engine-bypass` | fan-disc 外环→bypass-duct→bypass-nozzle；四条周向路径 | count 128、speed .35、air、ends open；不穿核心。 |
| `engine-core-cold` | fan-disc 中央→compressor-bank/rotor→combustor-ring 入口 | count 96、speed .25、air、ends open。 |
| `engine-core-hot` | combustor-ring 出口→两个 turbine-rotor／静子通道→core-nozzle | count 128、speed .35、hot、ends open；颜色不是温度量尺。 |

发动机各段入口／出口坐标一致，按路径长度调整每段可见粒子数维持示意连续，不由粒子数量推涵道比。气路避开轴和叶片实体；剖切只切外壳，气流不随切面失踪。only-flow 组可独立关，`whenRun:true`。发动机路径与速度为拓扑动画，无数值流量输出。[F22–F26,F-D06]

分拍显隐用既有 flow `visible` 绑定读 diagram-case：intake 在五个 engine-* 值都显示；bypass/core-cold 在 split/core/shafts/exhaust 显示；core-hot 在 core/shafts/exhaust 显示。其余拍都关闭这些流。动画 balanced-travel 的 enabled 只读 diagram-case=level；这不是新的求解变量。

动画均用现有 `rotate` / `sequence`，可视转速不作为真实 rpm：整机两风扇各 30；LP 内轴、fan-disc、lp-turbine-rotor 各同 30；HP 外轴、compressor-rotor、hp-turbine-rotor 各同 45。相同轴系共享既有运行时钟、相位起点，所有静子保持不动；不需要新刚体／齿轮 sim。[F24,F-D06]

`balanced-travel-<part-id>` 给 W 的 23 件同样的非循环 sequence：2 s 沿 −X 线性移动 .3，终态停住；只是短段匀速示意。只在 01-2 由既有 animation `enabled` 条件开，其他拍显式复位。姿态：`controls-roll` 双副翼反向 12°；`controls-pitch` 双升降舵上偏 10°；`controls-yaw` 方向舵 10°；`controls-bank` W 各件绕同 `[0,1.1,0]`、X −20°；`high-lift-open` 襟翼后移 .04 后下偏 20°、缝翼前移 .025；`spoiler-raised` 35°。均 DESIGN。bank 姿态 `duration:0`，其余沿既有过渡。姿态能否“右滚”以驾驶员视角和实际铰链核对，不由镜像矩阵猜符号。[F16–F21,F-D06]

### 3.4 镜头、HUD 与完整状态

| preset id | camera → target，均 fov 30 | 工位 |
|---|---|---|
| `aircraft-overview` | [-5,4.5,6] → [0,1.1,0] | W，封面与 00/01/07。 |
| `wing-structure-view` | [-1,2.5,5.5] → [0,1.1,2.4] | B，02-1。 |
| `section-view` | [0,2.2,7.5] → [0,2.2,2.7] | A，二维正视。 |
| `controls-view` | [3.5,3.4,5] → [.9,1.3,0] | W 后缘舵面。 |
| `engine-section-view` | [0,1.4,1.4] → [0,.8,-2.8] | E；`engine-cut` 保留后侧半壳，切去面对读者的一侧。 |
| `cruise-view` | [-4.5,4,6] → [0,1.1,0] | W，06-4。 |

R2 可调构图相机，不改变求解参数。`views.section.plane: xy`；`views.cover` 整机三分之四视角。章节中要用的镜头写进 state.camera，不把换章伪装成 VIEW 按钮。

HUD 遵守 docs/08 §2，采用含试一试的现行顺序：章头 → 节拍行 → 试一试 → 选中详情 → 正文 → 本章索引。底部只有章节轴；左列 PLATE 放读数。标题 `note` 采用 00 的双语模型说明。spec ≤4 行：通用客机 DESIGN；对称 Joukowski DESIGN；弦长 1 m／参考面积 2 m² DESIGN；迎角实验 −20…20° SIM。六条 `telemetry` 用现有 `follow` / `scope:observe`：angle-now（0 位）、speed-now（0 位）、rho-now（3 位）、q-now（1 位）、cl-now（3 位）、lift-n（1 位）。状态 flow-state 使用既有状态显示，不给 state 输出写数字专用的 `tag`。[F-D01–F-D05]

无试一试的章不显示孤立样件的后台读数；不要新增 `pressure-ready` 的 pupil-facing 数字。每章／拍显式设置全部物理控件、`flow-view`、`diagram-case`、part、pose、run、cutaway、explode=0、目标集合的 hide 补集。拍基于本章，不继承前一拍。00-2/4=A，00-3=E；01-4=W 去双发动机舱与 fan；01-5=A；02-1=B 去 skin；03-5=A 加 nacelle-right/fan-right；06-4=W；其余按 §2 基线。实验流、压力、角弧与实验升力都以 foil-sample 可见且未 exploded 为总门控。

### 3.5 文件、来源与许可家族

本题不用地图：**无 INVENTORY 地图数据、无地理关键帧、无国界／航线／海岸线派生文件**。07 的日期列表只在正文中，不作地理数据。现有 `datasets.json` 中候选不等于已采用素材。

| 将来的文件／产物 | 输入与许可家族 | 署名／例外处理 |
|---|---|---|
| `data/parts.json`；原创采样若另存 `data/airfoil-reference.json` | 自主几何、数学事实、教学规则；**CC BY-NC-SA 4.0 家族** | S58 说明生成公式与设计选择；不含 BY-SA 源网格、UIUC 坐标或 NASA 软件。 |
| `chapters/00–07-*.mdx`、`data/{glossary,sources}.json`、`data/SOURCES.md` | 独立转述与编辑文本；**NC-SA 家族** | 来源逐条列直接 URL、访问日、口径；TU Delft 事实来源注明其课程 CC BY-NC-SA 4.0，但不捆绑其图像。 |
| 三张 PNG 的 webp、截图 | 项目原创图片／原创几何；**NC-SA 家族** | 保留 manifest 的原始 provenance、处理和复用路径。 |
| 引擎求解／渲染代码 | 原创实现，按仓库软件许可 | 不把内容 NC-SA 误加到源码；NASA 公式是数学依据而非复制实现。 |

允许 PD、CC0、BY、BY-SA、BY-NC-SA、ODbL、ODC-BY；**同一派生文件不能混 BY-SA 与 NC-SA**。本题没有需要 BY-SA/ODbL 例外的输入。施工时在 `LICENSE-CONTENT` / `THIRD-PARTY-NOTICES` 对本题产物写明家族与来源，没有的例外写“无”，不空泛写已清权。若今后换成第三方模型，另开数据与例外，重新审本表；本规格不授权该替换。未同意任何条款页，未绕过登录／真人验证。[F53–F54,F58]

## 4. 引擎契约（只留下实际缺失项）

### 4.1 代码现实检查与最小清单

已对照 `src/engines/space-scene/{schema.ts,sim-schema.ts}`、`lib/sim/{index,bind,arrows,chart,controls,trial,table}.ts`、`lib/flow-curve.ts`、`stages/model3d/{Flows,flowMaterial,MotionDriver,PartNode}`、`explorer/{TryIt,TryChart}`、`hud/sim.ts`、`View.tsx`、`core/test-api.ts`、`scripts/{shoot,validate-content}.ts` 与 docs/06 对应小节。注册表目前有 11 个 kind，**无 airfoil**；磁场的 field state 不能求航空流场；流 shader 对弧长采样均速前进，没有局部物理时间参数；现有记录图只有非负 y 轴、只连已记录点；已有箭头类别缺 lift/drag/thrust。

| 保留项 | 真正新增的边界 | 必须复用 |
|---|---|---|
| **E-AF1** | `airfoil` strict schema、标量纯函数、注册与来源校验 | controls、outputs、resolveSimValues、试一试与预测、URL sim。 |
| **E-AF2** | Joukowski 场、流线追踪、按时间采样的 `airfoilFlow` provider、角弧与失速静态示意 | extrude、现有流层、运行／暂停时钟、GPU 点批次、图层开关；不再造流引擎。 |
| **E-AF3** | 有符号全迎角曲线、实／虚线区域、当前点与记录标记；airfoil 记录条件签名 | 已有记录表／12 行上限、预测、触控控件、读屏格式。 |
| **E-AF4** | 同一场的表面 Cp 小图与不可用状态 | 现有试一试插槽／overlay 显隐与双语；不造面板体系。 |
| **E-AF5** | 三个力类别、KEY 文案与 token：lift、drag、thrust | 现有 force-vectors 的 value、固定 dir、when、锚点、合批、负值反向；**不新增 frame**。 |

| 从新工作移除／改写 | 已有实现怎样覆盖 |
|---|---|
| 章节对象索引、选中详情置顶、左列读数、章拍轴 | `state.index`、core HUD / axis、SpaceScene inspector / PlateBlock；docs/08 §2、docs/06「章节怎么写」。 |
| 参数控件、先猜后看、表格、普通记录小图、键盘与深链 | `TryIt`、`trial.ts`、`TryChart`、`controls.ts`；T2/T6 本版只需表格。现有小图仍供其他主题，无需重写。 |
| 新翼型 primitive、可旋转翼弦 | 128 点 `extrude`（现有上限 160），`rotate` 绑定共用 pivot；昆虫 `wing` 不适用，但无需扩它。 |
| 新发动机 sim、内部两转子动画扩展 | 静态路径 + `rotate`，把不同运动组件拆成独立 parts；无需在一个 turbine-bank 的 extra 内独立动画。 |
| `forceArrow.frame` | 只展示一个离散 bank 姿态，现有 `duration:0` + `when` + 固定世界 dir；重力继续 world down。 |
| 新记录存储／回放 URL／新底栏 | 共用表格驻内存；无 timeline、无 G 回放；曲线与压力放读者面板既有卡片内。 |

### 4.2 E-AF1：schema、输入、输出与纯函数

新增 `airfoil-schema.ts` 与 `lib/sim/airfoil.ts`。`sim.kind:'airfoil'` 与 `sim.airfoil` 成对；注册 `SIM_KINDS`、`simQuantities`、`quantityKind`、states/issue 检查、`SEPARATE_EXPERIMENTS.airfoil=true`。数据子对象 `.strict()`，所有数有限，未知字段报错，不静默夹值。

```ts
type AirfoilData = {
  model: 'joukowski-illustrative-v1';
  angle: string; // step control, all values within [-20,20] degrees
  speed: string; // step control, all values within [0,60] m/s
  atmosphere:
    | {kind:'constant'; density:number} // 0 < density <= 2 kg/m³
    | {kind:'nasa-troposphere'; altitude:string}; // step, [0,10000] m
  profile: {epsilon:0.08};
  chord:number; // [0.05,5] physical metres; topic=1
  area:number;  // [0.01,20] m²; topic=2, reference extrapolation only
  section:{part:string; origin:[number,number,number]};
  stall:{tag:'illustrative'; peakDeg:12;
         knots:[[12,1],[16,0.85],[20,0.60]]; source:string};
  sources:string[]; // nonempty; includes the self-described design study
  plot:{y:string}; // number output id whose from is 'cl' or 'lift-n'
};
```

主题三项物理 controls 见 F-D03。choice `flow-view` 默认 `streamlines`、另一选项 `pressure`；只控制显示。choice `diagram-case` 默认 `none`，其他选项 `vertical|level|axial|bank|weight|engine-intake|engine-split|engine-core|engine-shafts|engine-exhaust`；作者在各拍设定，只用于现有 when 条件，不参与物理求解。控制总数 5，不引入隐藏控件 schema。两 choice 也通过现有 sim URL 序列化。

`solveAirfoil(data,values)` 同步、确定、无随机、不依赖 DOM；解析值来自既有 resolver。非法 URL 值沿既有策略忽略／回默认；直接调用求解器的非法值抛 `AirfoilInputError{field,reason}`，不返回貌似有效的 0。来源 S58 `design:true`；S04、S11、S57 记录数学依据；状态不写数字专用的 tag。

```text
e=.08; R=1+e; zLE=-(1+2e)-1/(1+2e); C=2-zLE; A=8πR/C
a=angleDeg*π/180; t=abs(angleDeg); peak=A*sin(12*π/180)
cl = A*sin(a)                                     if t<=12
   = sign(a)*peak*(1-.15*(t-12)/4)                 if 12<t<=16
   = sign(a)*peak*(.85-.25*(t-16)/4)               if 16<t<=20
T=15.04-.00649*h
p=101.29*((T+273.1)/288.08)^5.256                  // kPa
rho=p/(.2869*(T+273.1))                           // kg/m³
q=.5*rho*V²; lift=q*area*cl
state = V==0 ? still : t<=12 ? ideal-attached : separated-illustration
```

constant 大气只用指定 density，不套 h 公式。S11 所有常数成组保留，不替换成另一套“标准”海平面密度。Cl 是二维剖面系数，无有限翼修正、黏性阻力、雷诺数修正或发动机性能。速度 0 时理论 Cl 保留，q=L=0，场不运动。[F09,F29,F59,F-D02–F-D05]

| 输出 id | from / kind / unit / decimals |
|---|---|
| `angle-now` | `control:angle-deg` / number / degree / 0 |
| `speed-now` | `control:airspeed-mps` / number / m/s / 0 |
| `rho-now` | `rho` / number / kg/m³ / 3 |
| `q-now` | `q` / number / Pa / 1 |
| `cl-now` | `cl` / number / 无量纲 / 3 |
| `lift-n` | `lift-n` / number / N / 1；有符号 |
| `flow-state` | `flow-state` / state；严格三个值：Still / 无气流；Ideal attached flow / 理想附着流；Separated-flow illustration / 分离气流示意 |

`control:<id>` 只允许本 airfoil 的 step 数控件；`from` 必须在此枚举中，不能靠 evaluateSim 的缺值回退 0 蒙混。所有 number tag sim。压力可用性直接读结构化 provider，不需要额外的数字开关输出。

### 4.3 E-AF2：几何、局部速度与时间

复变量 ζ=ξ+iη；复速度 w=u−iv。生成圆 ζ=−e+R·exp(iθ)，映射 f=ζ+1/ζ；B=(f−zLE)/C。轮廓 θj=2πj/128，j=0…127，闭合且不重复尾点。物理位置（以 c 为尺度）：

```text
p=.25+exp(-i*a)*(B-.25)              // chord coordinates
worldXY=O.xy+chord*[Re(p),Im(p)]
qz=ζ+e
g=exp(-i*a)-R²*exp(i*a)/qz²+i*2*R*sin(a)/qz
vOverV=exp(i*a)*g/(1-1/ζ²)
(u,v)=V*[Re(vOverV),-Im(vOverV)]
Cp=1-abs(vOverV)²
```

ζ→1 尾缘 0/0 的极限为 `exp(i*a)*cos(a)/R`（|ζ−1|<1e−6 用此式），不能设速度 0 或随意夹速度。环量 Γ=4πVR(c/C)sin(a)，2Γ/(Vc)=A sin(a)，与标量附着分支一致；这是共同模型的推导，不是额外一份升力。[F06,F59]

外部点逆映射先 Z=zLE+C·(.25+exp(i*a)(p−.25))，再解 ζ=(Z±sqrt(Z²−4))/2；取唯一 `|ζ+e|>=R−1e−10` 外根。两根均内返回 inside，非边界情况下两外根返回 invalid，禁止跳根造成不连续。边界压力直接从 θ 取 ζ。

```ts
type AirfoilField = {
  mode:'still'|'ideal-attached'|'separated-illustration';
  outline:Float32Array; // 128 XY pairs, unrotated chord coordinates
  paths:Array<{id:string; xy:Float32Array; tau:Float32Array;
    status:'complete'|'boundary-stop'|'stagnation'|'budget-stop'}>;
  pressure:null|Array<{theta:number; xy:[number,number]; cp:number}>;
  separation:null|{side:'upper'|'lower'; illustrative:true};
};
```

`airfoilField(data,values)` 为纯函数；结构化场不是强塞进 number/state/vector 的输出。xy 路径使用已经旋转的 p；渲染只平移缩放一次。sample 与 chord-marker 用现有 `rotate{axis:[0,0,1],per:-1,pivot:O+[.25c,0,0]}`；provider 已包含 −α，不能再旋转场。两者在切换期间统一到同一目标角（这两个绑定的 airfoil 特例直接 snap，不改其他 rotate 的既有缓动），避免新场套在半途样件上；这是 E-AF2 的窄集成要求。

固定域 x=[−1.5,3]、y=[−1.5,1.5]（弦长单位）；上游 x=−1.5，16 个种子 y=[−.85,−.65,−.50,−.38,−.28,−.18,−.10,−.04,.04,.10,.18,.28,.38,.50,.65,.85]，id `seed-01`…`seed-16`。沿单位局部速度作 RK4，步长上限 .008，最多 2048 接受步／路；中间点、完整线段与实体均查穿透，失败减半最多 8 次，再失败 boundary-stop，不投影、修线或穿翼。|v/V|<1e−5 停为 stagnation，超预算 budget-stop；出口精确裁域。失败路停在上一个合法点，不画该路粒子，显示双语说明“Some flow paths could not be drawn / 部分流线未能绘出”。

`tau` 是累计无量纲时间 tV/c，严格递增；Δtau≈Δs·(1/|v0/V|+1/|v1/V|)/2。GPU 使用**按相等 tau 重采样**的坐标纹理，不再按等弧长前进；重采样后逐段再查穿透，不能由 Catmull-Rom 重平滑把点带进实体。允许提高采样精度至每路 2048 点，但仍一个 points 批次；超出预算则停路并报状态，不把错误藏掉。

独立流线误差检查使用同一解析势函数的流函数：`psi=(Im(exp(-ia)*qz+R²*exp(ia)/qz)+2R*sin(a)*ln(abs(qz)/R))/C`，qz 为逆映射得到的 ζ+e。每条完整流线的 max(psi)−min(psi)≤1e−3（无量纲），不是比较不同种子之间的 psi。标记粒子的时间读取来自 tau 插值，不来自此误差检查。

每路 8 粒子，共 128；真实画面时钟 `tauClock += dt*V/c/80`，无随机。各路用**自己的** tauEnd 周期；不能用所有路归一化到同一到达时刻。编号 0 的标记粒子在各路从同一上游截面、同刻发出，用 signal 外环识别；其他粒子只是连续流示踪。换物理输入或应用一拍时重置此发射时刻；02-3 及其深链从零时刻开始。已发射的一对离开域后等待下一次共同发射；不在尾缘等候，也不把到达较早的粒子重新挪回。连续背景粒子的各路循环不改变这对比较标记的共同发射规则。[F07,F28,F-D06]

新 flowBind 分支：`{output:'flow-state',flow:'section-air',airfoilFlow:true}`；目标 flow 的普通字段用 group、color、count128、size、spread0、speed1、whenRun true、clip false、flat true，不写 path/paths。speed1 是 schema 兼容字段，锁死且不参与速度运算。只接受单 flow，kind 必须 airfoil，output.from 必须 flow-state；不能并用 paths、state、intensity、tidal、stops、bilateral 或 spread。既有磁场／普通流行为不变。

普通 `visible` 绑定仍可叠加，例如 `{control:'flow-view',flow:'section-air',visible:{eq:'streamlines'}}`；复用现有 SimFlowEffect 的 AND 显隐，只隐藏附着流线和点，不隐藏独立角弧、失速虚线或力。T2/T3/T6 的 try.also 加 flow-view，读者能用既有 choice 按钮切压力；diagram-case 不加入卡片控件。按 tau 重采样的 2048 上限只属于此 provider，不放宽其他流的弧长采样预算。

RUN=false 或 paused 冻结粒子，保留静态线；图层关、样件隐藏、EXPLODED 时整组隐藏；reduced-motion 留静态线与曲线，停点。V=0 返回 still、paths=[]、pressure=null；outline 保留。`|α|>12` 时 paths=[]、pressure=null，只画三条静态虚线分离示意：B 平面 x=.35+1.25s，y=k(.10+.20sin(πs/2))、k=1,1.5,2、s∈[0,1]；负α上下镜像，整组同样绕四分之一弦转 −α；穿实体的段不画。该图不测量真实分离点，也不声称预测时间波动。常驻 EN “Illustrative stall region, not wind-tunnel data. Ideal flow does not predict separation.” / ZH“失速区仅作示意，并非风洞数据；理想流不预测分离。”[F12–F15,F59,F-D02]

角弧以 quarter-chord 为心，半径 .16c，从 world +X 来流基线至已旋转弦线；正α顺时针，signed 读数来自 angle-now，0°不画假弧。该图解与流层共门控。

### 4.4 E-AF3：曲线和记录条件

新增 `explorer/AirfoilPlot.tsx`，只在本章 try.vary 等于 airfoil.angle 时显示；在观察量后、共用记录表前。标题 EN “Lift and angle · teaching model” / ZH“升力与迎角 · 教学模型”，SIM。读取 `airfoil.plot.y`；主题选 cl-now。固定 x=[−20,20]、0.5°采样；同一个 solveAirfoil 生成 y，不另写公式。y 对称覆盖 ±1.1×当前条件峰值；lift 轴 V0 时回 ±1 N，Cl 轴照常。

|α|≤12 实线，外部虚线＋轻斜线底，±12 界线明确是人工分界；当前值 signal 点，记录行只加实心小方标，图例区分“model curve / 模型曲线”和“recorded model values / 已记录模型值”。记录从未发生时没有测量点。不用原 record.chart 在同处再画一条非负折线；原 chart.ts 不需要为本题重写。

复用现有 recordRow 与 12 行上限（11 个角度不溢出）。**当前代码只按章保存表，并不自动比较 keep 条件**：新增仅 airfoil 适用的条件签名 `model+profile+chord+area+atmosphere+除vary以外的物理控件`；flow-view / diagram-case 不在签名中。签名改变清掉该章旧记录与预测结果，aria-live 说 “Conditions changed; the model table has been reset / 条件改变，模型记录表已重置”。换章可保留该章仍同签名的表，刷新按现有规则空表；不要虚称已有换章全清空。T2/T6 也用此保护，但只出既有记录表，不新增两种图。

SVG role img、双语轴／单位、可读说明与完整表格替代；390 宽无横滚。图、表和读数订阅同一次 resolved snapshot。模型输入更新同步更新曲线与当前点；异步场尚未 ready 时静态 outline 和“Updating flow / 正在更新气流”可见，不显示上个输入的场。

### 4.5 E-AF4：压力视图

新增 overlay `{kind:'airfoil-pressure',part:'foil-sample',group:'flight-flows',when:{control:'flow-view',is:{eq:'pressure'}}}`；part 必须等于 section.part。样件可见、该层开、flow-view=pressure、mode=ideal-attached 时，读取 E-AF2 同一场，以 θ=2π(j+.5)/64、j=0…63 采 Cp，按表面分上／下支画 Cp 对 x/c；不是按 Cp 再反算 Cl。压力小图在试一试卡内部；02–03–06 都复用此视图，T3 曲线可与压力小图纵向排，不占底栏。

横轴 x/c，Cp 轴负向朝上，注 EN “Negative Cp indicates pressure below the free stream / 负 Cp 表示静压低于来流静压”；y 覆盖真实有限样本极值，不夹 Cp。将图中所选样本点对应到实体表面，不用红／蓝色带暗示绝对温度。RUN 暂停不清 Cp；V0 或分离示意时 pressure=null，替代文字 EN “Pressure not modelled for this state / 此状态不计算压力”，保留适用的合力箭头。关闭压力视图不改变 L。

读屏提供前缘附近／中弦／后缘附近的上下表面代表样本值、坐标和 SIM 说明，完整数组供测试 API 读取。压力积分 QA 用更密的 >=2048 个 θ 中点，`−∮Cp*n*ds/c` 在世界轴投影：y 应等于附着 Cl、x 近零；这是无黏二维模型的自洽检查，**不发布真实阻力=0 的结论**。[F06,F59]

### 4.6 E-AF5：力类别；用现有固定向量取代 frame

`FORCE_KINDS` 追加 lift/drag/thrust；`FORCE_NAMES` 为 Lift/升力、Drag/阻力、Thrust/推力；`FORCE_COLORS` 指向新增 `token:f-lift`、`token:f-drag`、`token:f-thrust`。同时更新 tokens.css、theme.ts 的 token 注册及两主题 KEY。色可复用现有功能色的数值，但语义 token 独立；对舞台背景图形对比 ≥3:1，配名称和方向支持灰度辨认。不把 lift 假装成 elastic 或把航空 thrust 改名成全局 push。

不新增 `forceArrow.frame`。A 的来流固定 +X，升力 `dir:[0,1,0]`，value 指 lift-n（负值反向）；W 水平图 gravity `[0,-1,0]`、lift `[0,1,0]`、thrust `[-1,0,0]`、drag `[1,0,0]`。`diagram-case`：01-1 vertical、01-2 level、01-3 axial、04-4 bank、06-4 weight；05 的五拍分别 engine-intake/engine-split/engine-core/engine-shafts/engine-exhaust，其余 none；重力 when 为 vertical/level/bank/weight，水平 lift 为 vertical/level，推阻为 level/axial，倾斜 lift 仅 bank；各箭头用已有 when 条件分组，不让四力跟到其他工位。

bank 为整机 X −20° 固定 pose，升力世界方向 `[0,cos20°,-sin20°]`，即 `[0,.9396926208,-.3420201433]`；gravity 不动。bank 只画重力与倾斜 lift，不声称已配平，不显示推阻力平衡。进入／离开该拍的 W 姿态均用 duration0 的命名 pose，避免箭头方向与缓动中的飞机不同步；其他拍可正常缓动。若以后要求连续 bank 控件，再提真正的 frame 合同，不在本版实现。[F03,F17,F-D06]

W 箭头仅构图：L=W=1000 N、T=D=100 N，默认不出这些数；per=.0004、max=.55。A 用 per=.00015、max=.5，数字由输出给；当可见长度截顶，附 “Arrow lengths are scaled / 箭长经缩放”，不截断读数。箭头随对象锚点移动、按 layer/when 显隐、负值反向、EXPLODED 隐藏，全部复用原行为。

### 4.7 校验、URL、测试 API 与数值预期

`airfoilIssues` 接入 parts schema 的交叉校验；`airfoilSourceIssues` 接 `scripts/validate-content.ts`：kind/块配对；angle/speed/altitude 引合法 step；版本参数、人工 knots 精确锁定；sources 非空且 ID 全存在、stall.source 必须 design:true；输出 from/type/states 正确。section.part 非 context、非 bilateral，恰含一个按公式生成的 extrude，128 点位置差 ≤1e−5c、depth .12、bevel0，禁止独立 scale／pose／偏移；仅允许指定 α rotate。chord-marker 同 pivot 同角；inflow-reference 不随转。airfoilFlow 唯一、无普通 path 与其他速度机制；overlay part/group/when 正确；plot.y 来自 cl/lift-n 数输出；force 新类别使用合法 token。NaN、Infinity、越域角、未知字段都报清楚路径。种子是此版本的固定实现常数，不增加可填的 seeds schema。

复用 `sim` URL 编码，不增加 query。例：`?ch=angle-and-stall&b=4&sim=angle-deg.16~airspeed-mps.40~altitude-m.0`；choice 字段沿现有编码，缺省取章／拍基线。`part,view,run,layers,cam,b` 沿用；完整流线、压力数组、曲线样本、缓存 version、记录表不进 URL。刷新同一深链应恢复相同输入、状态、Cl、L、图中当前点及 field version 对应的数据，不依赖前一章。

复用 `__atlas.engine.sim()`、`__atlas.engine.setSim(values)` 与 `engine.apply(patch)` 现有测试入口，sim().outputs 是数／状态，不混图形数组。新增只在 airfoil 出现的读取入口：

```ts
engine.airfoil() => {
  model, mode, angle, speed, rho, cl, lift,
  fieldReady, version, inputKey, pathCount, pathStatuses,
  pressureCount, pulseTime, arrowDirections,
  plot:{x, y, segments, current}, recordSignature
}
engine.airfoilProbe({x,y}) => {status:'outside'|'inside'|'invalid'|'unavailable',uOverV,vOverV,cp}
engine.airfoilSamples() => {paths,pressure} // test builds only; copies, not live buffers
```

坐标为已经旋转的 chord 坐标；V0／失速 probe 返回 unavailable 及 null 数值，inside/invalid 同样返回 null 数值，不能输出旧 Cp。只有 outside 的 uOverV/vOverV/cp 为有限数。`arrowDirections` 读取当前画出的方向；`pulseTime` 是当前比较标记的时钟，可用于暂停冻结检查。既有 ready 只保证舞台；e2e 必须另等 fieldReady 且 inputKey 等于当前 snapshot。

固定密度夹具 ρ1.225、V40、S2、c1、ε.08，除表内指定修改。标量绝对误差 ≤1e−8，力 ≤1e−5 N；以下均已独立复算。[F-D04–F-D05]

| 输入／测试 | 预期 |
|---|---|
| 基础几何 | R=1.08，zLE=−2.0220689655172412，C=4.022068965517241，A=6.748606441044742；归一 LE0、TE1。 |
| α0 | Cl0、L0、q980；ideal-attached，上下镜像。 |
| α4 | Cl .47075898801417243，L 922.687616507778 N。 |
| α8 | Cl .9392244855592677，L 1840.8799916961648 N。 |
| α12 | Cl 1.4031141758212335，L 2750.103784609618 N；ideal-attached，压力存在。 |
| α16 | Cl 1.1926470494480486，L 2337.588216918175 N；separated-illustration，paths=[]、pressure=null。 |
| α20 | Cl .8418685054927401，L 1650.0622707657706 N；仍有升力，小于峰值。 |
| α−4／−16 | 相应正角 Cl、L 的相反数；−16 的分离示意在下侧。 |
| V0、α16 | Cl 仍1.1926470494480486，q=L=0，still，无路径、压力或活动粒子。 |
| V20→40、α4 | L230.6719041269445→922.687616507778 N，4 倍；ρ减半 L 减半。 |
| α0、θ=π/2 边界 probe | v/V≈[1.0799623152564328,−.07360301477948536]，Cp≈−.1717360061586639。 |
| α8、ζ1 尾缘极限 | v/V≈[.9079915258973699,−.12760988695231443]，无 NaN。 |
| S11 h0/5000/10000 | ρ 与 L 恰为 F-D05；h0 的 p=101.40093090454886 kPa，q=981.291029928776 Pa。 |
| 压力积分 α0/4/8/12 | y≈0/.4707589880/.9392244856/1.4031141758；α0 绝对误差≤1e−4，非零相对≤1%；x绝对≤1e−3。 |
| bank 姿态 | lift=[0,.9396926208,−.3420201433]；gravity=[0,−1,0]；默认水平箭头不混入。 |
| 场／粒子自洽 | 全部连续线段不穿实体；alpha± 镜像；alpha12 左右连续；完整路径流函数漂移≤1e−3；seed-07/seed-10 同刻脉冲到 x=1.2 的时刻差>1e−3 无量纲时间，细化步长后收敛。 |

表中局部速度允许误差 1e−6；压力积分与流线检查必须独立于 renderer。边界法向速度残差 ≤1e−4V（避开尾缘极限小邻域）；不能为过测篡改 outline 或期望值。控制非法角 21、负速、h10001、密度0、坏 source、错 from、错状态标签、外部 profile URL、双 provider、混 intensity、额外 transform、状态写 tag 等逐项作 schema 反例。

### 4.8 实施接口、性能与浏览器检查

新增单测 `airfoil.test.ts`、`airfoil-field.test.ts`、`airfoil-schema.test.ts`、`airfoil-plot.test.ts`；draft 夹具 `sample-airfoil`（显式 S58 设计来源），模板 `tests/space-scene/fixtures/airfoil-bench.ts`。E-AF1 只改注册和纯函数；E-AF2 新增场／追踪模块及受控 flow 分支；E-AF3/4 新增卡内 SVG；E-AF5 改箭头字典／enum／theme 注册。`shoot.ts` 的逐拍及深链检查增 airfoil inputKey、mode、Cl/L、场状态和 plot 当前点一致性，不新造截图驱动。

缓存只依赖几何、α、种子与积分版本的无量纲场；速度和密度变化不重新追线。同步标量目标 <1 ms；冷角度追踪总工作目标 <50 ms，主线程任务 ≤8 ms（任务分片或本地 module Worker，不新增依赖）。版本号递增，过时异步结果丢弃；等待期间隐藏旧输入的场，保留更新说明。最多缓存 11 档角度；切主题／销毁时释放 typed arrays 与 GPU 纹理，不将测试副本留在生产包。

运行期场层至多 +3 次绘制（线、点、角弧／分离示意合批）；力每 overlay 仍一次。整主题目标 draw calls<100、上限150，三角形≤1.5M，优先<.3M；首屏 JS≤300 KB gz（SpaceScene），pixelRatio=min(dpr,3840/W,2)，无运行时外部请求。静止无动画时 demand 渲染；每帧零分配，不每帧重算流场或 React 状态。报告设备、浏览器、renderer、drawing buffer；SwiftShader 不作真机 fps 证明。

e2e 检查 0/4/12/16/−16° 与 V0；压力切换不改 L，16→4 恢复压力，无旧附着残留；rapid 4→16→−4 最后只接受−4版本；暂停冻结 pulseTime 但不清数；FLOW 图层关／EXPLODED／隐藏样件均隐藏全部实验叠加；reduced-motion 不改数。T3 记录−16、0、12、16 后曲线正负轴、排序和标记正确；keep 改变清记录，flow-view 改变保留记录。bank 的固定方向和重力保持正确，深链 `b=4` 与演示终态相同；所有检查覆盖中英、paper/cinema、390×844 与1024×768。

## 5. 名词表 EN / ZH

`glossary.json` 固定 16 条；每条 EN/ZH 首次出现各包一次 `<Term>`，其余子词在句中解释，不为每个部件增加一张名词卡。定义不藏进公式，see 仅指本表已有 id。行业中文译名的本地来源状态见 D8。

| id | EN / ZH | 双语定义要点；来源 |
|---|---|---|
| `lift` | Lift / 升力 | The aerodynamic force across the incoming airflow. / 空气动力中垂直于来流的分量。[F03,S01–S02] |
| `weight` | Weight / 重力 | The force pulling the aircraft towards Earth. / 把飞机拉向地球的力。[F02,S01] |
| `thrust` | Thrust / 推力 | The force supplied by the propulsion system. / 推进系统施加的力。[F01,S01] |
| `drag` | Drag / 阻力 | The aerodynamic force opposing movement through air. / 阻碍物体相对空气运动的空气动力。[F03,S01] |
| `airfoil` | Airfoil / 翼型 | The cross-sectional shape of a wing. / 机翼剖面的形状；不是整块机翼的俯视外形。[F14,F59,S13] |
| `chord` | Chord / 翼弦 | A straight line from leading edge to trailing edge. / 连接前缘和后缘的直线。[F11,S13] |
| `angle-of-attack` | Angle of attack / 迎角（攻角） | The angle between chord and incoming air. / 翼弦与来流之间的角，不是机头对地平线的角。[F11,S03] |
| `stall` | Wing stall / 机翼失速 | Flow separation can reduce lift at high angles. / 较大迎角下的气流分离可使升力下降；不等于发动机停转。[F12–F15,S03] |
| `pressure` | Pressure / 气压 | Force per unit area; pressure over the wing surface contributes to the aerodynamic force. / 单位面积上的作用力；翼面气压分布共同形成空气动力。[F06,S02] |
| `streamline` | Streamline / 流线 | A line tangent to the local flow direction in this steady model. / 在这个定常模型中，沿各处气流方向画出的线；线距不直接当速度。[F28,F59,S10,S57] |
| `flight-controls` | Control surfaces / 操纵面 | Ailerons change roll, elevators pitch, and the rudder yaw. / 副翼改变滚转，升降舵改变俯仰，方向舵改变偏航。[F16–F19,S05–S07] |
| `high-lift-devices` | Flaps and slats / 襟翼与缝翼 | Movable trailing- and leading-edge devices change the wing for lower-speed flight. / 后缘襟翼和前缘缝翼改变翼形，帮助较低速度飞行；襟翼也增阻。[F20,S08] |
| `wing-structure` | Spars and ribs / 翼梁与翼肋 | Spars carry bending loads; ribs maintain the airfoil shape. / 翼梁承担弯曲载荷，翼肋维持翼型。[F55–F56,S43] |
| `turbofan` | Turbofan / 涡扇发动机 | A turbine engine with a fan and a bypass air path around its core. / 有前方风扇、核心和绕核心的外涵气路的涡轮发动机；涵道比按质量流量定义。[F22–F26,S09] |
| `core-machinery` | Core machinery / 核心机械 | The compressor compresses air, fuel burns in the combustor, and turbines drive shafts. / 压气机压缩空气，燃烧室内加燃料燃烧，涡轮经轴传功。[F23–F24,S09] |
| `air-density` | Air density / 空气密度 | Air mass per unit volume. / 单位体积内空气的质量；本题随高度按平均大气公式改变。[F09,F29,S04,S11] |

Cl、bank、flow separation、bypass、spool、三种转动等在正文用一句话解释并互见上述相关词条；不是额外 glossary id。`glossary.see` 全部验引用。

## 6. 来源与证据定位

外部网页均在 **2026-10-27** 重新打开并读所引段落；受阻／404 的明确分表。S 编号不重排。施工的 `sources.json` 只收采用来源及 S58，不把 cut 事项重新带进课堂；`SOURCES.md` 给每个展示数字、单位、事件类型和对应 F 号。正文数量用 `<Num s>`，字幕为纯文本但数字写明 SIM 身份，零件 detail 数字后 `[S58]`。年份也标对应历史来源，不因排成年表而失去来源。

| id | 来源（直接链接） | 本轮读到的位置与用途 |
|---|---|---|
| S01 | NASA Glenn，[Four Forces on an Airplane](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/four-forces-on-an-airplane/) | Weight / Lift / Drag / Thrust；四力、平衡、滑翔。 |
| S02 | NASA Glenn，[Bernoulli and Newton](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/bernoulli-and-newton/) | Which camp is correct / What is the argument；同一合力、等时到达错误。 |
| S03 | NASA Glenn，[Fluid Dynamics Interactive](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/foilinc/) | Angle of Attack / Lift / Wing Stall / Plot；对称性及实验确定失速点。 |
| S04 | NASA Glenn，[Lift Equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation/) | 方程及密度；平方关系是本题代数推论。 |
| S05 | NASA Glenn，[Ailerons](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ailerons/) | 反向副翼、滚转、倾斜升力的侧向分量。 |
| S06 | NASA Glenn，[Aircraft Elevator Interactive](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/aircraft-elevator-interactive/) | Wing 段区分 Wright 前置与现代常规后置；本题采用后置。 |
| S07 | NASA Glenn，[Rudder Interactive](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/rudder-interactive/) | Vertical Stabilizer / Rudder；只采用偏航、协调航迹，不采用绝对化 steering 句。 |
| S08 | NASA Glenn，[Flaps and Slats Interactive](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/flaps-and-slats/) | 前／后缘装置、平移改变面积、襟翼增阻及 Spoilers。 |
| S09 | NASA Glenn，[Turbofan Engine](https://www.grc.nasa.gov/www/k-12/airplane/aturbf.html) | two spool 段明确 fan shaft 穿 core shaft；气路段与 bypass ratio 定义。 |
| S10 | NASA Glenn，[Student Airfoil Interactive](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/foilsimstudent/) | General Instructions、Graphics/Output 与 Analysis options；理想流与另加的失速修正。只参考教学形式，不复制程序。 |
| S11 | NASA Glenn，[Earth Atmosphere Model – Metric Units](https://www.grc.nasa.gov/www/k-12/airplane/atmosmet.html) | 对流层 T/p/ρ 公式及平均测量曲线拟合的说明；所有常数成组使用。 |
| S12 | Airbus Safety First，[Control your speed… in cruise](https://safetyfirst.airbus.com/control-your-speed-in-cruise/?airbus-iframe=true&airbus-post=2139) | 开头 fuel/performance/weather/ATC 与飞行包线／高度限制；仅综合定性取舍，不转成飞行操作建议。 |
| S13 | NASA Glenn，[Wing Geometry](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/wing-geometry/) | Top View 的前后缘、弦、展、投影面积定义；不再用来单独证明翼盒受力。 |
| S14 | NASA Glenn，[Drag Equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-equation/) | 方程及 reference area；固定条件推论，不造本题 drag 输出。 |
| S17 | NPS，[1903–The First Flight](https://www.nps.gov/wrbr/learn/historyculture/thefirstflight.htm) | December 17, 1903 段；背景为滑翔试验与动力飞行；时长另用 S59。 |
| S22 | SG101，[How Singapore’s Changi Airport Came To Be](https://www.sg101.gov.sg/resources/archives/challengeaccepted-how-singapore-changi-airport-came-to-be/) | 1975 场地准备、558 建筑、4,096 坟墓；1981 商业运营与典礼日期。 |
| S23 | NLB BiblioAsia，Rebecca Tan，[How Changi Airport Came To Be](https://biblioasia.nlb.gov.sg/all-sections/vol-17-issue-3-oct-dec-2021-changi-airport/) | 2021-10-10；Changi Versus Paya Lebar 与 Building Changi 首段；交叉核计数口径和规划权衡。 |
| S24 | URA，[Former Kallang Airport Conservation Area](https://www.ura.gov.sg/conservation/find-a-building/conservation-portal/fka/) | The History：1937-06-12、1955 功能迁移；不采用帝国宣传性形容词。 |
| S25 | SG101，[Official Opening of Paya Lebar Airport](https://www.sg101.gov.sg/resources/archives/onthisday-opening-paya-lebar-airport/) | 首段：1955-08-20 正式开幕。 |
| S32 | UIUC，[Airfoil Coordinates Database](https://m-selig.ae.illinois.edu/ads/coord_database.html) | 仅作被排除资产的核查入口；未导出任何坐标。 |
| S33 | UIUC，[Airfoil Data Site](https://m-selig.ae.illinois.edu/ads.html) | 背景、数据格式、版权尾注；未建立本项目所需的坐标再分发授权。 |
| S35 | NASA，[Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) | NASA Images and Media Usage Guidelines / 第三方与标识限制；本版只用数学事实、自主程序。 |
| S43 | TU Delft OCW，[Main Takeaways on Wing Structures](https://ocw.tudelft.nl/course-readings/3-4-6-main-takeaways-on-wing-structures/) | Ribs、Spars、Torsion box 三段及页脚 CC BY-NC-SA 4.0；独立转述，不复制课程图。 |
| S54 | NASA Glenn，[Free Software](https://www.grc.nasa.gov/www/k-12/freesoftware_page.htm) | 简介的 public-domain 说法，仅与 S55 并列记录，不下载软件。 |
| S55 | NASA Glenn，[FoilSim and CurveBall Download (legacy)](https://www.grc.nasa.gov/WWW/K-12/FoilSim/index.save) | Copyright Notice 内并存 PD 与非商业／不得转售语言；排除源码复用。 |
| S56 | Singapore Airlines，[FY2007–08 news release, 13 May 2008](https://www.singaporeair.com/content/dam/sia/web-assets/pdfs/about-us/information-for-investors/financial-results/nr-q4fy0708.pdf) | 印 p.3 / PDF 第3页，Fleet and Route Development：15 October 2007 delivery、25 October 2007 commercial services to Sydney。 |
| S57 | NASA Glenn，[Conformal Mapping](https://www.grc.nasa.gov/WWW/K-12/airplane/map.html) | f=ζ+1/ζ、流场映射、Kutta 与尖后缘；数学参考，不复制 Java。 |
| S58 | Atlas 原创，《通用飞机、两轴发动机与理想翼型教学设计研究 v1》 | **design:true，无外部 URL**。必须自描述 §0.4 所有参数、§3 尺度／姿态／转速、§4 方程、人工 stall knots、S11 常数、固定密度夹具与主题实际默认两种读数。明确“不是实测，不是任何机型性能”；来源 note 引 S04/S11/S57，记录独立压力积分校验与所有图形限制。 |
| S59 | NPS，[Four Powered Flights](https://www.nps.gov/places/3-four-powered-flights.htm) | 本轮新增佐证：首飞日期与 12 秒，展板转述段；不采用其余距离／时长。 |

本轮失败后已移除的来源：

| id | 原入口 | 结果与处理 |
|---|---|---|
| S15 | MOE，[Primary Science Syllabus](https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf) | 真人验证页；未绕过；F46–F48 cut。 |
| S16 | MOE，[Primary Social Studies Syllabus](https://www.moe.gov.sg/media/files/primary/d8ea4817-c1b3-4217-84d4-82838d39d75c.pdf) | 真人验证页；未绕过；F49 cut。 |
| S51 | ICAO，[旧 Carbon Calculator Methodology PDF](https://icec.icao.int/Methodology%20ICAO%20Carbon%20Emissions%20Calculator_v13_Final.pdf) | 404；F57 cut；不显示换算因子。 |

其余 §0.3 的 cut 原来源只作溯源指针，**未声称本轮重核**：S18 [National Museums Scotland, Comet](https://www.nms.ac.uk/discover-catalogue/the-worlds-first-passenger-jet-comet-4c)；S19 [Boeing Images, 747](https://secure.boeingimages.com/archive/Boeing-747-First-Flight-Take-off--PaineField--Everett--Washington-2JRSXLJOOXXK.html)；S21 [SIA fleet](https://www.singaporeair.com/en_UK/us/flying-withus/our-story/our-fleet/)；S26 [RSAF history](https://www.rsaf.gov.sg/about-us/history/)；S27 [MINDEF fact sheet](https://www.mindef.gov.sg/news-and-events/latest-releases/17jan18_fs/)；S28 [Wild Part 1](https://www.mdpi.com/2227-7102/13/8/762)、S29 [Part 2](https://www.mdpi.com/2227-7102/13/8/836)；S30 [Physics Education diagram study](https://doi.org/10.1088/1361-6552/acbad8)；S31 [McGill forces and motion](https://www.mcgill.ca/sciedchantier7/evidence-based-interventions/technological-world-forces-and-motion)。这些不进入本题发布来源包。

## 7. 插图（只用已存在的三张）

2026-10-27 已实际打开三张最终 PNG，核对外形、翼盒、气路和透明背景。manifest 的旧“通过”记录是生成溯源，不替代本规格的机械拓扑约束；图片不可用作实机比例或数值空气动力证据。尤其发动机图不能替代 S09 对两轴连接关系的说明。

| 文件（主 checkout 的 `art/planned/how-planes-fly/`） | 位置与尺寸 | EN / ZH alt 与使用边界 |
|---|---|---|
| `how-planes-fly.png` | 封面，1024×1024，397,027 B | “Generic twin-engine airliner with swept wings and a conventional tail.” / “通用双发客机，后掠机翼与常规尾翼。”无品牌，不冒充 A380／Wright Flyer。[F-D01] |
| `how-planes-fly-wing-cutaway.png` | 02 章，1536×1152，843,812 B | “A generic wing cutaway showing spars, ribs and skin.” / “通用机翼剖面，可见翼梁、翼肋与蒙皮。”只说明结构；三道可见内部翼肋为图中选定样件，不是所有机翼共同数量，也不是对称 Joukowski 坐标。[F55–F56,F-D06] |
| `how-planes-fly-turbofan-cutaway.png` | 05 章，1536×1152，947,012 B | “A generic turbofan cutaway with a fan, outer bypass and central core.” / “通用涡扇剖面，可见风扇、外涵道与中央核心。”不标真实级数、尺寸、涵道比或实机转速；轴系教学以交互模型和 S09 为准。[F22–F26] |

施工使用已有 `scripts/illustrate.ts` 处理成本地 webp 与 @2x，封面按现有首页管线；图片生成／处理本轮不执行。不改原 PNG 和 manifest，不重新画图。正文字段为双语 figure 元数据，版权家族见 §3.5。唯一发布图像输入就是此表；NASA / TU Delft 网页图只可在本地参考，不能顺手拷成第四张配图。

## 8. 施工与验收清单

以下均为**未来施工门槛，当前未运行、未打勾**。本轮仅定稿文档和独立数值复算，不假称主题或引擎已通过测试。实施顺序：E-AF1/2 → 3/4/5 与 sample-airfoil → 原创几何 R2 两轮／R3／R4 → 双语正文、三图、38拍 → 事实审计 → 全门槛 → 直接上线。无需新依赖、package.json 变更或新地图管线。

- [ ] `pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、**先 build 再** `pnpm e2e` 全绿；测试输出记入 §9，不把以往主题的通过记录当本题通过。
- [ ] E-AF1–5 的 schema 反例、§4.7 所有数值与压力积分、流线完整线段穿透、负角镜像、零速度、过时异步结果丢弃均通过；纯函数与 renderer 使用同一方程／输入，不改期望值迁就实现。
- [ ] `sample-airfoil` 与实际主题都跑 `pnpm shoot <topic> --locale all --theme all --beats --keys --layout --perf`；实际主题 `<topic>=how-planes-fly`。逐张查看关键截图，不能只看脚本退出码；逐拍与 b 深链状态一致。
- [ ] 八章、38拍无漏标：每拍 labels≤6、近景章≤3；part ID、组、流、动画、preset 无重名；已拆分转子使 E=13、全可选44，静子不随转。
- [ ] HUD 符合 docs/08 §2：底部仅章节轴；左列 PLATE；章头→拍行→试一试→详情→正文→索引；手机抽屉可操作；选对象不用先滚正文。
- [ ] 每章正文与字幕提到的模型对象全进 state.index；点每一行立即出现正确详情、aria-pressed 更新；隐藏对象可通过对应拍看到，索引不声称自动显出或飞镜头。所有真正导航按钮／链接有可见结果。
- [ ] 触控目标≥44px，键盘与按钮同 store；`,`/`.` 跨章，P 从当前拍起；默认点章节／拍不自动播放；输入控件聚焦时不误触快捷键。
- [ ] 390×844、1024×768 及 shoot 全部布局尺寸，中英、paper/cinema 无叠压／横滚；signed Cl 图不截负值，压力 Cp 负轴方向文字清楚；16°的 pressure=null 不显示上一状态的压力图。
- [ ] 01 四力箭头只在限定水平图成对平衡；04 固定 bank 箭头方向正确、重力不转；06 的 h 改变不是已配平巡航。所有力图数是 DESIGN／SIM，不是该通用客机的实际重量或推力。
- [ ] 流线不穿实体；比较标记同刻上游释放、无后缘等待／瞬移／归一同到达；失速虚线不运动，未偷偷叠加附着解；V0、RUN暂停、FLOW关、EXPLODED、reduced-motion 行为正确。
- [ ] 涡扇外涵绕核心，核心先压缩后燃烧再涡轮；低压轴在高压轴内，轴穿通且连接正确；HP/LP 分别同相位，静子不动；粒子不计量真实流量。
- [ ] 16 个 glossary id 在双语正文各首现一次；子词解释完整，无不存在的旧 glossary 引用。所有展示文本双语、所有颜色通过 token；自描述 S58 `design:true` 及非实测说明齐全。
- [ ] 展示数字逐个回查 S 和 F；固定密度夹具与 S11 默认区分，先全精度求值后统一格式化；F34/35/37/41/44–52/57 的已删断言不从旧稿回流。历史日期的运营／典礼／交付／客运事件不混。
- [ ] 07 建设影响有单位和来源，不渲染墓地、不推人数、不隐去代价；通用双发模型不冒充历史型号。非商业内容许可写清；同一派生物无 BY-SA/NC-SA 混合；源码与内容许可分开。
- [ ] 页面无 TODO、placeholder、未解析引用、死链接、console error；纯静态、离线资源本地、无运行时外部请求。原始三图与 manifest provenance 保留，不生成额外插图。
- [ ] R2 几何对比至少两轮；纸底／dark plate 的 hero-clean、翼盒与发动机剖面可辨，性能达到 §4.8；真机 fps 结论须带设备／renderer，不能拿软件 GL 宣称 iPad 帧率。
- [ ] 按 docs/02 记录 Lighthouse 性能与无障碍，均≥90；同时保留纯静态、离线和资源预算的实际结果，不能以 Lighthouse 替代五个命令门槛。
- [ ] 规范截图存 `docs/screenshots/how-planes-fly/`：hero-paper、hero-clean、hero-dark、hero-zh、mode-xray、mode-exploded、phone-390；另存 α0/4/12/16/−16、Cp有效／不可用、bank、LP/HP轴与07文字口径截图。
- [ ] 过门槛后 `topic.yaml.status: published`；施工方将实际改动、测试结果、与本 spec 的出入、截图路径、已知局限填 §9。任何偏离人工失速身份／来源／动力学范围的改动先改本规格，不能悄悄换成“实测”。

## 9. 引擎记录（施工后填写）

### 9.1 引擎 E-AF1–E-AF5（2026-10-27，Codex，`sample-airfoil`）

**范围与文件**：只施工 §4 引擎与 draft 夹具；没有展开正式飞机主题、三张插图、整机／翼盒／涡扇或38拍正文。新增 `airfoil-schema.ts`；`lib/sim/airfoil.ts`（标量、曲线与记录签名）、`airfoil-field.ts`（解析场、逆映射、RK4、tau重采样）、`airfoil-cache.ts`（分片与版本／生命周期）、`airfoil-api.ts`；`explorer/AirfoilDriver.tsx`、`AirfoilPlot.tsx`、`AirfoilPressure.tsx`；`stages/model3d/AirfoilFlow.tsx` 是既有 Flows 的受控 provider，复用 flowMaterial 的纹理／GPU points，不新造普通流引擎。共同注册保持单行／短分支：SIM_KINDS、simSchema、simQuantities、quantityKind、states/issues、SEPARATE_EXPERIMENTS；无 timeline。既有 SimOverlays、KEY 与 force-vectors 加 lift/drag/thrust，两个主题有独立语义 token；没有 frame。文档：docs/06 新作者节、docs/08、夹具 `data/SOURCES.md`、内容许可声明。`sample-airfoil` 五章16拍：背景、速度（含V0）、迎角（0/4/12/16/−16/20、压力）、高度、固定bank；来源S58自描述设计。测试模板 `tests/space-scene/fixtures/airfoil-bench.ts`；四个要求的单测文件、force-token测试、e2e与shoot逐拍／深链断言均已添加。

**与 §4 的出入／实施选择**：

1. **S04 写作 S4**：现有公共来源 ID schema 不接受前导零。公式来源与身份不变，S11/S57/S58照原编号；没有扩大全局sourceId规则。
2. **既有 extrude 原先不接受 bevel:0**：把该字段从 positive 改成 finite nonnegative，才可按 §4 写明确的零倒角；其他 primitive 的规则未改。夹具轮廓直接从原创公式采样，不用外部坐标。
3. **夹具页面采用 NASA 大气**，因此默认L=923.9031443933111 N；测试模板另外导出固定ρ1.225模型以逐项复现 §4.7 的922.687616507778 N。这是刻意区分，不用固定密度数替换页面默认。夹具的对照块仅练习固定世界方向，不能冒充飞机几何。
4. **本地任务分片而非 Worker**：RK4每32步、tau重采样每128点可yield，调度循环目标4ms；每路1024个等tau样本（provider上限2048），普通流采样预算不变。缓存只存无量纲场（角度，最多11项）；输入完整key还含速度／密度／几何，用递增版本拒绝旧结果。卸载取消发布、清缓存并释放GPU资源。
5. **测试数组限制**：`airfoilSamples()` 只在dev或localhost/127.0.0.1/[::1]测试host返回新副本，远程production返回null；运行期不保留测试副本。其余测试API只有airfoil主题才注册。
6. **浏览器门槛按本任务brief跳过**：未运行shoot、e2e、Lighthouse或截图／真机性能检查，也未操作用户浏览器／桌面。这些仍待主会话；不把纯函数通过当作视觉通过。§8整题清单没有因此勾选。

**数值／自动校验**：新增89条单测，包括 §4.7 所有标量和S11读数、64个Cp样本、4096中点独立压力积分、边界法向残差、完整流线段穿透与每路ψ漂移、±角镜像、同刻seed07/seed10的不同到达时间与步长收敛、V0/失速不可用、过时异步结果拒绝、实际记录守卫清表／清预测、章切换保留兼容表、固定bank向量与两主题token对比。schema反例覆盖越域、NaN/Infinity、模型／knots／sources、未知字段／外部profile、错from／state、双provider／混强度、额外transform、压力引用和禁止frame。所有失败均通过修实现／数据或把浮点断言改为规格已有误差界解决，未篡改预期物理数字。

**门槛记录**：`pnpm test`：160文件、4268条全过（新增89条）。`pnpm validate`：56主题、0错误、0警告。`pnpm check`：0错误、0警告、3个原有hint。`pnpm build`：115页，包含EN/ZH的sample-airfoil。一次误启动重叠build导致旧build的dist chunk被新build清理而失败；后一个独立完成的build全过，最终复核亦只运行一个build。浏览器e2e文件共14项，未执行；主会话命令 `CI=1 ATLAS_E2E_PORT=5406 pnpm e2e`。`pnpm shoot sample-airfoil --beats --keys --layout` 以及 `forces`、`sample-forces`、`energy-conversion` 的改前／改后 `--beats --keys` 全部跳过；没有可声称的0新增视觉失败结论。共享纯函数回归随全量单测通过。

**已知未验收项**：图形／触控／深链／暂停／reduced-motion／切换图层和展开恢复／bank的浏览器断言已写但没跑；无截图路径。流层架构最多3次绘制，实际draw calls、三角形、drawing buffer、renderer、首屏300KB gz与真机fps均未实测，不宣称达标。构建仍给出既有大chunk提示；不能用单个chunk gzip大小冒充首屏总量。冷角度目标50ms与每任务≤8ms仍需浏览器复核；Node测量只记为CPU探针，不作iPad结论。没有依赖／package.json／lockfile／review-queue变更，没有写git历史。

Node CPU探针（Node v25.8.2，darwin arm64；与check/build并行，含调度噪声，无browser/renderer）：1024点时α4/8/12总工作计时57.29/46.33/51.11ms，单次generator yield间隔最大2.43/1.95/4.64ms；因此不能宣称冷角50ms目标已验收。分片调度目标4ms，浏览器总任务≤8ms与真机预算仍待复核。所有16条路径为complete；完整场单测在1024点下仍通过。

### 9.2 浏览器验收（2026-10-27，Claude，`sample-airfoil` 与回归主题）

**代码审阅**：b1f97b5 对共享文件的改动都是加法式登记（SIM_KINDS、simSchema、quantityKind、states／issues、SEPARATE_EXPERIMENTS、FORCE_KINDS／名称／token、overlay 联合、flowBind 的 `airfoilFlow`、`shoot.ts` 的 airfoil 一致性检查、`validate-content.ts` 一行来源检查、extrude `bevel` 放宽到 ≥0）；其他主题的行为路径不变。`LICENSE-CONTENT`、`THIRD-PARTY-NOTICES.md` 里只覆盖原创夹具内容的两段已撤回（原创内容本来就在 CC BY-NC-SA 4.0 总条款下，无例外可写）。

**看图结论**（`pnpm shoot sample-airfoil --beats --keys --layout --theme paper,cinema`，SwiftShader，1920×1080 及八个布局尺寸）：两主题各 16 拍、16/16 拍链接一致、0 键位失败、0 布局问题、console 干净。逐张看过：流线绕上下两面、上游上洗与下游下洗；同一路上等 tau 的示踪点在翼型上方间距明显大于下方（按局部速度前进）；比较标记从同一上游截面同刻发出，不在后缘等待。α ±16° 与 20° 只剩静态虚线分离示意，虚线在正角上侧、负角下侧并随样件转；附着流线、粒子和压力均停用。升力–迎角图：±12° 内实线、外侧虚线加斜线底，y 轴对称取 ±1.1×峰值（Cl 轴 ±1.54），当前点落在曲线上。压力图只在 ideal-attached 时出现（α4：上表面 Cp 负峰约 −1.69，负值朝上），α16 显示“此状态不计算压力”。力箭头沿世界方向：样件升力 [0,1,0]，负角向下；bank 姿态的倾斜升力 [0,.94,−.34] 与竖直重力分开。

**修复（各带单测）**：

1. **力箭头在大牛顿数下看不见**。`force-vectors` 的箭杆和箭头粗细按 `per × 1.6 N` 缩放；翼型 `per = 0.00015`（单位是上千牛顿）时箭杆半径只有约 8×10⁻⁶ 场景单位，升力箭头实际不可见。新增 `lib/sim/arrows.ts` 的 `vectorScale(per, max) = max(per × 1.6, 0.16 × max)`，`SimOverlays` 改用它：`forces`、`sample-forces` 的比例不变（0.064、0.048），翼型变为 0.08。测试：`tests/space-scene/airfoil.test.ts`「force-vector arrow scale」。
2. **冷角度流场超出 50 ms 目标**（确有其事）。浏览器 Chrome trace（SwiftShader，机器负载约 120）实测改前：冷角度 α 8/−8/0/−4/12/−12 从 setSim 到 fieldReady 52–64 ms，主线程任务合计 42–54 ms。原因是追踪每步重复求同一点的场：每步开头的探针与 RK4 的 k1 是同一点，上一步末的探针又是下一步开头；中间段 `segmentClear` 与随后的单位方向各做一次逆映射。改为复用这些求值（`clearUnit`、`unitOf`，步末探针转为下一步开头），算法和步长不变，输出逐位相同（七个角度的路径散列与改前一致）。改后同一测法：30–42 ms（墙钟），主线程合计 31–43 ms；单个任务最大 6.4–9.0 ms，偶有一个 >8 ms 的任务落在发布结果后的渲染，而非追踪切片（切片预算仍为 4 ms）。Node 下单次追踪约 22–26 ms（改前 36–57 ms）。测试：`tests/space-scene/airfoil-field.test.ts`「tracer reuses each field evaluation」，钉住改前追踪出的路径长度、末端 tau 与第 500 个样本点。

**门槛记录（改后，不含 how-planes-fly 内容）**：`pnpm check` 0 错误 0 警告（3 个原有 hint）；`pnpm validate` 56 主题 0/0；`pnpm build` 115 页；`pnpm test` 160 文件 4271 条，整套跑时 2 条因机器负载超时（`tests/schemas.test.ts` 5 s 限时），单独重跑通过。改后 `pnpm shoot sample-airfoil --beats --keys --theme paper,cinema`：两主题 16/16 拍、拍链接一致、0 键位失败、0 拍失败。回归 `pnpm shoot <t> --beats --keys`（en·paper）：aircon 24/24 拍、0 失败；其余主题与浏览器 e2e 结果见 §9.3。

**仍未覆盖**：真机（iPad）帧率与触控；Lighthouse。
