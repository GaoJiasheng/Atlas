# 82 · 组屋电梯 · 内容施工 spec（v1，待 Gavin 定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §2 封闭设备（电梯在原型表里就是例子）。slug `hdb-lift`。

本主题要讲清楚的是：**电梯不是"用电把人吊上去"那么简单——钢丝绳一头挂轿厢、一头挂对重，电动机只需补上两边的差；而它的安全靠几道彼此独立的机关：一直通电才松开的制动器、量速度的限速器、卡住导轨的安全钳、井底的缓冲器，以及门没锁好就不准走的门锁。** 重力、重量在 `forces` 讲过（第 02 章细看只有一段"电梯里的力"），电能 → 动能 → 势能在 `energy-conversion` 讲过（那边的电梯链"只算轿厢，没有算对重"）；本主题直接链接，不重讲，只补上它们没讲的：曳引怎样靠摩擦、对重为什么省电、电梯怎样不会掉下去、门为什么能保护人、按钮背后的控制，以及从 1854 年奥的斯的演示到组屋"每层都停"。

范本：结构照 docs/74（冰箱）与 docs/13 + skill `atlas-space-topic` 的 `references/spec-template.md`；试一试复用已有的 `sim.kind: "table"`（docs/40 E-HL1，docs/06「试一试 · 表」）。本轮只出 spec。**正文、字幕、来源条目、parts.json 都等 Gavin 定稿后再写**（CLAUDE.md）。编号说明：本 spec 的引擎项记作 E-HL#（hdb-lift）；与 docs/40 的 E-HL1（table 模型本身）同名不同物，施工记录里写全称 `E-HDBL#` 以免混淆（★ §0.1-14）。

---

## 0. 决定与事实复核（2026-11-16 起草）

### 0.0 决策表（默认值，带 ★ 的在 §0.1 等 Gavin 拍板）

| # | 决定 |
|---|---|
| D-1 | 对象：**组屋住宅楼里一部通用的曳引式（traction）客梯**：楼顶机房、无齿轮永磁同步曳引机、1:1 绕绳、6 根钢丝绳、侧置对重、额定载重 1,000 kg（13 人）、额定速度 1.75 m/s、12 层、每层都停。**通用设计研究**：无品牌、无型号、无铭牌、无楼号、无按钮面板上的文字；每个物理事实和典型数字都有来源。★ 机房 / 无机房见 §0.1-1 |
| D-2 | 范围：井道与层门、轿厢与轿门、门机与门刀、光幕、曳引机（电动机 + 曳引轮 + 制动器）、导向轮、钢丝绳、对重、导轨与导靴、限速器与张紧轮、安全钳、缓冲器、控制柜（含变频驱动与能量回馈）、自动救援装置（ARD）、召唤按钮与轿内操纵盘、对讲。**不讲**：液压电梯、自动扶梯、高速超高层电梯（细看里一句带过）；电机内部的电磁原理（链接 `magnets` 或只说"电动机把电能转换成动能"）；群控调度算法的细节 |
| D-3 | **必须讲对的五处**：① 曳引轮不是"卷"钢丝绳，是靠绳与轮槽之间的**摩擦**带动绳子（F-9）；② 对重的重量 ≈ 轿厢 + 约一半额定载重，所以电动机只需"补差"，空梯上行、满梯下行时反而是重的一边往下走、电动机在"拉住"它（F-6、F-7、§1.2）；③ 制动器是**断电就合上**（弹簧压紧、通电才松开），所以停电时电梯不会滑走（F-11）；④ 限速器和安全钳是**机械的**，不靠电：轿厢超速时限速器卡住限速器绳，绳把轿厢上的安全钳楔块提起，楔块夹住导轨，轿厢在约半米内平稳停下（F-13–F-16）；⑤ 层门只能在轿厢停在这一层时由轿门上的门刀打开；任何一扇层门没锁好，安全回路断开，电梯就不能走（F-18、F-19） |
| D-4 | 7 章 31 拍（§6.0）。★ 是否合并第 05、06 章见 §0.1-9 |
| D-5 | 分区 01–05 = 井道与层站 / 轿厢与门 / 机房 / 绳、对重与导轨 / 能量与信号（只有流）（§2） |
| D-6 | 模型布局：**零件按真实尺寸**，**楼高做示意压缩**——画底层（1 楼）、2 楼、一条"省略带"（代表 3–11 楼，技术图的断裂线画法，`energy-conversion` 已用过）、顶层（12 楼）和楼顶机房；轿厢在画面上走 7.2 m，代表真实的 30.8 m。对重与绳的位移按同一压缩。`topic.yaml` 的 `note`："Generic design study · not a specific brand, model or block · floors 3–11 left out" / "通用设计研究 · 不代表任何品牌、型号或楼座 · 省略 3–11 楼" |
| D-7 | 事实纪律：规格行 = DESIGN（落在 TYPICAL 内）；PLATE 块模拟读数 = SIM，满足力与能量的自洽（§1.2 模拟运行点）；设计研究来源一条（S1） |
| D-8 | 试一试：做一个，**复用 `sim.kind: "table"`**，在第 03 章：改载重（0 / 250 / 500 / 750 / 1,000 kg）和"有没有对重"，看上行时电动机要出多大力、一趟用多少电；表下画小图。另有一个 `stop` 控件（1 楼 / 2 楼 / 12 楼）把轿厢、对重、钢丝绳摆到对应位置（bind `pose`）。**0 个必需的引擎扩展**（§9） |
| D-9 | 不做：品牌 / 型号 / 贴图 / 配音文件 / 视频 / 测验；**不画人**（轿厢里不放人形，载重用"每人按 75 kg 算"的数字和轿厢地板上的灰色方块表示，★ §0.1-10）；**不画坠落、断绳、事故画面**；安全钳只在"限速器动作试验"的语境里演示（每年的检验里确实要做，F-23） |
| D-10 | 单位：SI（m、m/s、kg、kN、kW、Wh）；载重同时写"人"（按每人 75 kg，F-3）；力的读数写 kN 只在 PLATE 和细看，正文主线不算力（`forces` D4 的边界：课纲没有牛顿计算） |
| D-11 | 课纲接口写准（§1.3）：P6 力的相互作用（重力、物体有重量是因为重力、力能让物体动起来 / 停下、摩擦力）与 P6 能量转换（电能 → 动能、举高的物体有势能、能量不会用完）。**简单机械（滑轮、杠杆）不在新加坡小学课纲**：曳引轮只说"带槽的轮子"，不引入"机械利益" |
| D-12 | 口吻：安全部分**精确而让人放心**：讲清楚每道机关怎样工作、法规要求定期检验，不渲染危险、不讲事故故事；被困时怎么做只写官方建议（按警铃 / 对讲，等待救援，不要扒门；F-27） |

### 0.1 代定项（每项给默认，Gavin 拍板）

| # | 问题 | 默认 | 备选与理由 |
|---|---|---|---|
| 0.1-1 | 楼顶机房还是无机房（MRL） | **楼顶机房** | 理由：MND 2006 年书面答复把"井道顶上有机房"称为当时的通常做法（P8）；组屋屋顶上的电梯机房是常见的楼顶构筑物（`energy-conversion` 已按此建了屋顶机房）；机房让曳引机、限速器、控制柜**一处看全**，最好讲。无机房电梯在组屋里也有：2007 年报道电梯翻新计划已在 56 座楼用 MRL（P9），翻新计划下约 270 座楼用了观光梯或 MRL（P10）。**待核**：近年新建 BTO 组屋的主流做法（施工时找 HDB 设计指引或 MND 答复；找不到就把正文写成"许多组屋"而不是"组屋通常"）。备选：无机房（曳引机装在井道顶部导轨上），改动 = 删机房、曳引机移进井道顶，章节不变 |
| 0.1-2 | 楼高 | **12 层（行程 30.8 m，层高 2.8 m）** | 电梯翻新计划时代的老组屋常见高度之一；也可选 16 层或 25 层以上（只改 S1 的行程与表的数，几何不变）。层高 2.8 m **待核**（HDB 资料） |
| 0.1-3 | 载重与速度 | **1,000 kg（13 人）、1.75 m/s** | 二手来源（电梯爱好者维基）写组屋标准梯不超过 1,000 kg（约 13 人）、速度多为 1.5 或 1.75 m/s（P11，**待核**：施工时找 BCA 检验报告模板 / 招标文件 / HDB 资料里的一手数字；找不到就只写"约"并在细看标"典型"）。13 人 = 1,000 ÷ 75 取整（P4） |
| 0.1-4 | 钢丝绳还是钢带 | **6 根直径 10 mm 的钢丝绳** | 钢带（包胶钢带）只见于部分厂家的无机房机型，属品牌特征，只在细看一句"有些新电梯用扁平的包胶钢带代替钢丝绳"。绳数 4–8、直径 8–13 mm 为典型（P13，**待核**） |
| 0.1-5 | 对重位置 | **侧置（轿厢左侧）** | 侧置在 3/4 前视镜头里能同时看见轿厢和对重；后置也常见。只改坐标 |
| 0.1-6 | 门 | **中分双扇（centre-opening）**，净宽 0.9 m、高 2.1 m | **待核**组屋常见是中分还是旁开；改它只改门扇与门机姿态 |
| 0.1-7 | 能量回馈 | **画能量回馈**（"重的一边往下走时，电动机当发电机用，电送回楼里"），并说明组屋另有"电梯能量回收系统 EERS"把回收的电用于轿厢照明、通风、显示屏，平均省电约 20 %（P20） | 备选：不画回馈，只在细看提。理由：回馈是"对重省电"之外的第二个能量故事，正好接 `energy-conversion` 的"能量不会用完"；HDB 有一手数字 |
| 0.1-8 | 安全钳演示 | **"限速器—安全钳动作试验"**：空轿厢、慢速、画面上只看限速器卡住、拉杆提起、楔块夹住导轨，轿厢停住；字幕写"每年检验都会做这个试验"（F-23） | 不演示断绳或坠落；"如果钢丝绳都断了会怎样"只在细看用一句回答（"限速器和安全钳不需要钢丝绳，也不需要电"），不配画面 |
| 0.1-9 | 章数 | **7 章 31 拍** | 备选：第 05 门、第 06 控制合并成"门和按钮"，6 章 27 拍；代价是光幕、门锁与救援装置挤在一章 |
| 0.1-10 | 载重怎么画 | **轿厢地板上的 0–4 个灰色方块（每块代表 250 kg，约 3 人）**，`count` 绑定载重控件 | 备选：不画，只看读数。不画人形（D-9） |
| 0.1-11 | 历史写到谁 | 奥的斯（Elisha Otis）1854 年在纽约水晶宫展览上的安全装置演示；1857 年第一部客用安全电梯（纽约 Haughwout 大楼）；1861 年专利 US 31,128；1880 年西门子在曼海姆展示电力驱动的电梯（**待核** P34）；全球视角一句：更早的人力 / 畜力 / 水力起重机由来已久（**待核**，找不到可靠来源就删） | 只写事实；"All safe" 那句话各来源措辞不一，**不引原话**，只写"他让人砍断吊绳，平台只下落了一点就停住" |
| 0.1-12 | 新加坡部分写到哪 | 电梯翻新计划（LUP，2001 年起，让每层都停，5,000 多座楼，约 99 % 组屋已每层直达，P5–P7）；电梯改进计划（LEP，2016 年宣布，10 年、约 18,500 部、HDB 出约九成费用、加装门光幕、防轿厢意外移动、上行超速保护、自动救援装置等，P16–P18）；电梯能量回收（P20）；法规：BCA 的运营许可证（PTO）、每月保养、每年检验与测试，2025-10-01 起由《建筑管制（固定装置）条例 2025》取代 2016 年的旧条例（P21–P23） | 不写具体事故；LEP 的起因只写"BCA 在一次全面检讨后建议的安全改进"（**待核**措辞，P17） |
| 0.1-13 | 插图 | 封面 1 + 章图 3（其中 2 张代码画），§12 | 备选：去掉 I-4（老组屋隔层停的示意），把那段放细看文字 |
| 0.1-14 | 引擎项编号 | 本 spec 内写 E-HL#，施工记录与 docs/06 用 `E-HDBL#` | brief 要求 E-HL#；docs/40 已用 E-HL1 指 table 模型 |

### 0.2 已做的事实复核（本轮联网读过的；施工代理仍要读原文抄准确措辞）

| 项 | 结论 | 来源（P#） |
|---|---|---|
| 电梯翻新计划（LUP） | HDB 2001 年推出，为老组屋加装"每层都停"的电梯；已在 5,000 多座原本不是每层直达的楼实施；约 99 % 的组屋已每层直达（MND 2024 年 2 月答复）；仍有约 140 座（2023 年 1 月）因技术限制无解 | HDB LUP 页（P5）、MND 书面答复（P6、P7） |
| 无机房电梯 | MND 2006 年答复：MRL 不需要井道顶上的机房（原文对 MRL 安装位置的描述**待读原文**）；2007 年报道 LUP 用 MRL 工期约 6 个月（原约 8 个月）、更便宜，已有 56 座楼；LUP 下约 270 座楼用了观光梯或 MRL | P8、P9、P10 |
| 电梯改进计划（LEP） | 2016 年宣布；约 4.5 亿元；10 年内为 18,500 多部组屋电梯加装安全功能；适用于运行 18 年及以内、缺少部分或全部功能的电梯；HDB 承担约 90 %；功能包括门的多光束传感器 / 光幕、防轿厢意外移动（UCMP）、上行超速保护（ACOP）、限速器绳松弛检测、轿厢护脚板、紧急通讯、电池供电的自动救援装置 | 新闻（PropertyGuru、Straits Times PDF）、市镇会页（P16–P18；**待核**：读 HDB / MND 一手页面） |
| 门的保护 | BCA 技术要求：门在关闭过程中有人穿过入口时自动重开；光幕能探测直径至少 50 mm 的障碍物 | BCA 2017-06-08 通函（P19，**待读原文**） |
| 能量回收（EERS） | 电梯运动和制动时产生的能量被回收，用于轿厢照明、通风、显示屏；平均降低电梯能耗约 20 %；截至 2025 年 1 月底 500 多部已改装，两份招标后总数将达 7,400 部 | HDB 2025-02-03 新闻附件（P20，已读 PDF 原文） |
| 法规 | 自 2025-10-01 起《建筑管制（固定装置）条例 2025》（S 614/2025，依据《建筑管制法》）取代《建筑维护与分层管理（电梯、自动扶梯与建筑维护）条例 2016》；运营前须有 BCA 运营许可证（PTO），经 LEAP 门户申请；普通电梯按厂家建议或至少每月保养（取较频者；用远程监测的可按批准的计划）；所有电梯每年由 BCA 注册的承包商检验与测试，独立的专业工程师 / 检验员在场 | BCA 固定装置法规页、BCA 生效日期通函（P21、P22）；2016 年旧条例 BCA 通函（P23） |
| 奥的斯 | 1854 年 5 月纽约水晶宫（"万国工业博览会"）演示：站在升起的平台上，让人砍断吊绳，安全装置让平台只下落几英寸就停住；1857 年 Haughwout 大楼第一部客用安全电梯；专利 US 31,128《起重装置的改进》1861-01-15 授权 | Britannica（P29）、Guinness（P30）、Google Patents US31128（P31，公有领域附图） |
| 对重平衡 | 对重 = 轿厢自重 + 额定载重的 40–50 %（行业通例）；ISO 25745-2 只考虑平衡 30–50 % 的曳引梯 | 电梯厂商培训资料（不点名）、能效论文（P12、P14） |
| 限速器动作速度 | 加州法规：轿厢限速器动作速度不低于额定速度的 115 %；EN 81-20 同为 ≥ 115 %，上限随速度和安全钳类型（**待核**原文条款） | California Title 8 §3036（P15）；EN 81-20（P13，付费，读二手） |

**没核到、默认不用**：组屋电梯总数、每天乘梯人次、电梯每年耗电占组屋公共用电的比例、"钢丝绳断裂"的统计——没有可靠一手来源，不写数字。

---

## 1. 主题与范围

### 1.1 对象（按一趟行程的顺序）

一座 12 层组屋里的一部客梯：

- **井道与层站**：钢筋混凝土井道，底下是约 1.6 m 深的**底坑**，顶上是**楼顶机房**。每层有一道**层门**（landing door），旁边是**召唤按钮**（上 / 下）。层门平时锁着，**门锁**里有一个电触点，串在电梯的安全回路里。
- **轿厢与门**：轿厢是挂在钢框（轿架）里的钢板箱子，地板下有称重装置。轿厢正面是**轿门**，由轿顶的**门机**推动；轿门上的**门刀**在轿厢平层时伸进层门的门锁滚轮之间，把层门一起带开——所以层门只能在轿厢就在这一层时打开。门边有**光幕**（一排红外光束），挡住任何一束，门就重新打开。轿厢底下两侧是**安全钳**，正面底边有**护脚板**。
- **绳、对重与导轨**：6 根**钢丝绳**一端挂轿厢，向上绕过机房里的**曳引轮**，再经**导向轮**下到**对重**——一叠铸铁块，重量约等于轿厢加一半额定载重。轿厢和对重各沿自己的一对 T 形**导轨**上下走，靠**导靴**贴住导轨。
- **机房**：**曳引机** = 永磁同步电动机 + 带绳槽的曳引轮 + 弹簧加压的**制动器**；**控制柜**里是控制器和变频驱动，决定什么时候开、开多快、在哪层停；**限速器**是一只由**限速器绳**带着转的轮子，绳的下端绕过底坑里的**张紧轮**，中间夹在轿架的安全钳拉杆上，所以限速器的转速就是轿厢的速度。
- **底坑**：轿厢和对重下面各有一只**缓冲器**（本设计为油压缓冲器，因为额定速度超过 1 m/s，F-17）。

一趟行程：按下召唤按钮 → 控制器选定方向和目的层 → 门关好、门锁触点全部接通 → 制动器通电松开 → 电动机由变频驱动慢慢加速 → 接近目的层减速、平层 → 制动器合上 → 门刀带开层门。

### 1.2 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源的典型范围（厂商资料只当"典型"，不点名）；`DESIGN` = 本设计取值，落在 TYPICAL 内；`SIM` = 运行时模拟值。P# 见 §14。**"待核"= 本轮没读到原文的工作值**，施工代理读原文核对后才能用，核不到就换值或删。

| # | 项 | TYPICAL（来源） | DESIGN / SIM（本模型） | 待核 |
|---|---|---|---|---|
| F-1 | 楼高与行程 | 组屋多为 10–40 层以上（P5 背景）；层高约 2.8 m（P11） | 12 层、层高 2.8 m、行程 30.8 m（画面 7.2 m，D-6） | 是（层高） |
| F-2 | 额定载重 | 组屋标准梯约 1,000 kg 以内、约 13 人（P11） | 1,000 kg / 13 人 | 是 |
| F-3 | 每人按多少算 | EN 81-20 按每人 75 kg 计算乘客数（P13） | 75 kg | 是（条款） |
| F-4 | 额定速度 | 组屋梯多为 1.5 或 1.75 m/s，新梯可到 2.5 m/s（P11） | 1.75 m/s | 是 |
| F-5 | 轿厢自重 | 1,000 kg 客梯的轿厢（含轿架、门、门机）约 1,000–1,500 kg（P12、P14） | 1,100 kg | 是 |
| F-6 | 对重 | 轿厢 + 额定载重的 40–50 %（P12、P14） | 1,100 + 0.45 × 1,000 = **1,550 kg** | |
| F-7 | 平衡点 | 载重 ≈ 平衡系数 × 额定载重时两边一样重（P12） | 载 450 kg（约 6 人）时平衡 | |
| F-8 | 钢丝绳 | 4–8 根，直径 8–13 mm；曳引式安全系数 ≥ 12（3 根及以上）；曳引轮直径 ≥ 40 倍绳径（EN 81-20，P13） | 6 根 × 10 mm；曳引轮 480 mm（48 倍） | 是（条款与绳的破断力） |
| F-9 | 曳引 | 绳与轮槽之间的摩擦带动钢丝绳；两边的拉力之比不能超过摩擦允许的上限，否则打滑（P13、P24） | — | 是（教科书原文） |
| F-10 | 曳引机 | 住宅梯多为无齿轮永磁同步曳引机，1,000 kg / 1.75 m/s 约 10–13 kW（P24、P25） | 13 kW 额定；SIM 满载上行 11.8 kW | 是 |
| F-11 | 制动器 | 弹簧加压、电磁松开（断电即合上）；机械部分分两组，任一组能使载额定载重的轿厢减速（EN 81-20，P13） | 双组鼓式 / 盘式（画成两只制动臂） | 是（条款） |
| F-12 | 曳引轮转速 | v ÷ (π × D)（1:1 绕绳） | SIM 1.75 ÷ (π × 0.48) × 60 ≈ **70 rpm** | |
| F-13 | 限速器动作速度 | ≥ 115 % 额定速度（P13、P15）；渐进式安全钳时上限 1.25 v + 0.25 / v（EN 81-20，P13） | 1.75 m/s → 下限 2.01、上限 2.33；DESIGN **2.1 m/s** | 是（上限公式） |
| F-14 | 安全钳类型 | 额定速度 > 1 m/s 用渐进式（progressive）安全钳（EN 81-20，P13） | 渐进式，楔块 + 弹簧 | 是 |
| F-15 | 安全钳减速度 | 渐进式安全钳载额定载重下落时平均减速度 0.2–1.0 g（EN 81-20，P13） | SIM 0.6 g：从 2.1 m/s 停住约 **0.37 m**、约 0.36 s | 是 |
| F-16 | 安全钳靠什么 | 机械：限速器卡住限速器绳 → 拉杆提起楔块 → 楔块夹住导轨；同时断开安全回路切断电动机（P13、P24） | 同 | |
| F-17 | 缓冲器 | 蓄能型（弹簧、聚氨酯）只用于 ≤ 1 m/s；耗能型（油压）各种速度可用（EN 81-20，P13） | 油压缓冲器，轿厢、对重各一只 | 是 |
| F-18 | 层门锁 | 层门锁住且电触点接通才允许运行；层门只能由停在该层的轿厢的门刀开启（或用专用三角钥匙由受过训练的人开启）（P13、P19） | 同 | 是 |
| F-19 | 安全回路 | 门锁触点、限速器开关、安全钳开关、缓冲器开关、急停等串联，任一断开电梯停（P24） | 同（第 05、06 章示意，不画电路图） | 是 |
| F-20 | 光幕 | 关门时有人穿过即重开；探测直径 ≥ 50 mm 的物体（BCA，P19）；LEP 加装（P16） | 同；画 16 束 | 是（BCA 原文） |
| F-21 | 防意外移动（UCMP） | 层门未锁、轿门未关时轿厢离开层站即检测并停住（BCA 技术要求，P18） | 细看 | 是 |
| F-22 | 上行超速保护（ACOP） | 检测上行超速并制动（P17、P18） | 细看（对重比轿厢重时空梯上行超速的风险，与 F-6 呼应） | 是 |
| F-23 | 检验 | 每月保养；每年检验与测试，独立的专业工程师在场（P21）；安全钳、限速器、缓冲器的试验属年度测试项目（**待核**：BCA 检验报告模板 P26） | 第 04 章拍 4 的语境 | 是 |
| F-24 | 运营许可证 | 运营前须有 BCA 发出的 PTO；经 LEAP 申请（P21） | 第 07 章 | |
| F-25 | 法规更替 | 2025-10-01 起 BC(FI) Regs 2025 取代 2016 年 BMSM 电梯条例（P22） | 第 07 章 | |
| F-26 | 自动救援装置（ARD） | 停电或故障时用电池把轿厢开到最近一层并开门（P16、P17） | 第 06 章 | 是（HDB / 市镇会原文） |
| F-27 | 被困时 | 按警铃 / 对讲求助，等待救援，不要自己扒门（BCA 或市镇会公众指引，P27） | 第 06 章细看 | 是 |
| F-28 | 能量回收 | EERS 平均降低电梯能耗约 20 %；2025 年 1 月底 500 多部，规划 7,400 部（P20）；香港机电署试验 17–27 %（P28） | 第 03、07 章 | |
| F-29 | LUP | 2001 年起；5,000 多座；约 99 % 每层直达（P5–P7） | 第 07 章 | |
| F-30 | LEP | 2016 年；约 18,500 部；10 年；约 90 % 由 HDB 承担；≤ 18 年的电梯（P16–P18） | 第 07 章 | 是（一手页面） |
| F-31 | 奥的斯 | 1854 演示、1857 客梯、1861 专利（P29–P31） | 第 07 章 | |
| F-32 | 电力电梯 | 1880 年西门子在曼海姆（P34） | 第 07 章细看 | 是 |
| F-33 | 老组屋隔层停 | 1990 年代中期以前建的许多组屋电梯不是每层都停（P5、P6；"每隔几层"的具体做法**待核**） | 第 07 章、插图 I-4 | 是 |

**模拟运行点（SIM，内部自洽）**

条件：g = 9.8 m/s²；轿厢 1,100 kg，对重 1,550 kg，额定载重 1,000 kg；匀速 1.75 m/s；行程 30.8 m；电动机 + 驱动的合计效率 η = 0.80（DESIGN，**待核**典型 0.75–0.85）；不计钢丝绳自重、补偿链、导轨摩擦、加减速和轿厢照明待机（细看写明"理想模型"）。

1. **不平衡重量** W = 轿厢 + 载重 − 对重（正 = 轿厢一边重）。空梯 −450 kg；载 450 kg 平衡；满载 +550 kg。
2. **谁在往下走**：上行且 W > 0、或下行且 W < 0 → 电动机在**提起**重的一边（"lifts"）；反之 → 重的一边往下走，电动机在**拉住**它（"holds back"，此时电动机像发电机，能量可以回馈）。
3. **电动机功率**（提起时，从电网取电）P = |W| × g × v ÷ η；**拉住时**机械功率 |W| × g × v，回馈电能按 × η。
4. **一趟（30.8 m）的电能** E = |W| × g × h ÷ η ÷ 3,600（Wh）；拉住时可回馈 |W| × g × h × η ÷ 3,600。
5. **结果表**（试一试 §8 的全部行；上行）：

| 载重 kg | 有对重：W kg | 谁在走 | 电动机 kW | 一趟 Wh（取 / 可回馈） | 无对重：W kg | 电动机 kW | 一趟 Wh |
|---|---|---|---|---|---|---|---|
| 0 | −450 | 拉住 | 0（机械 7.7） | 0 / 30 | 1,100 | 23.6 | 115 |
| 250 | −200 | 拉住 | 0（机械 3.4） | 0 / 13 | 1,350 | 28.9 | 141 |
| 500 | +50 | 提起 | 1.1 | 5 / 0 | 1,600 | 34.3 | 168 |
| 750 | +300 | 提起 | 6.4 | 31 / 0 | 1,850 | 39.7 | 194 |
| 1,000 | +550 | 提起 | 11.8 | 58 / 0 | 2,100 | 45.0 | 220 |

   下行时角色对调（有对重：空梯下行提起 450 kg、9.6 kW、47 Wh；满载下行拉住 550 kg、可回馈 37 Wh）。**满载上行有对重 11.8 kW 对无对重 45.0 kW，约四分之一**——这是第 03 章的主结论。
6. **曳引轮转速**：1.75 ÷ (π × 0.48) × 60 ≈ 69.6 → **70 rpm**；限速器轮（直径 300 mm，DESIGN）≈ 111 rpm。
7. **钢丝绳受力**（第 02 章细看，力的读数只在 PLATE 与细看）：满载轿厢一边 2,100 × 9.8 ≈ **20.6 kN**，6 根分担约 **3.4 kN / 根**；对重一边 1,550 × 9.8 ≈ 15.2 kN；两边拉力之比 1.35（曳引能力要大于这个比值，F-9）。10 mm 电梯钢丝绳最小破断力的典型值**待核**（P13、P25），用于核对安全系数 ≥ 12。
8. **安全钳**：从 2.1 m/s 以 0.6 g 减速：距离 2.1² ÷ (2 × 0.6 × 9.8) ≈ **0.37 m**，时间 2.1 ÷ 5.88 ≈ **0.36 s**（细看写"比急刹车的汽车还平稳一些"**不写**——没有来源；只写数字和"约半米"）。

这些数字只出现在 PLATE 块读数（带 SIM）、试一试读数和细看（写明"在这个模拟里"）；正文写取整的范围和"约四分之一"。施工时若 F-5、F-10 的典型范围核出来不同，**按比例改 S1 的轿厢自重与效率，并同步本节与 §8 全部数字**（单测从 S1 参数重算表，见 §15）。

### 1.3 课纲接口与分工、互链

**课纲（MOE 2023 Primary Science，页码沿用 docs/30、docs/31 已核的出处，施工时复核一次）**：

| 课纲 | 本主题对应 | 深度 |
|---|---|---|
| P6 Interaction of Forces（pp. 63–66）：力能让物体动起来、停下；重力；物体有重量是因为重力；摩擦力 | 第 02 章（钢丝绳向上拉、重力向下拉；曳引靠摩擦）、第 04 章（制动器、安全钳靠摩擦让轿厢停下） | 主线 |
| P6 Energy Conversion（p. 80）：电能转换成动能；举高的物体有势能；能量不会用完、只会转换；节约能源 | 第 03 章（对重、电动机补差、回馈）、第 07 章（EERS） | 主线 |
| 简单机械、机械利益、力的计算（牛顿）、焦耳 | 不进主线；kN、kW、Wh 只作读数；算式只在细看并写"中学会学到" | 课外 |

`topic.yaml` 的 `moe`：`["MOE 2023 Primary Science P6 Interaction of Forces, pp. 63–66", "MOE 2023 Primary Science P6 Energy Conversion, p. 80"]`（页码核后再写）。

**与已有主题的分工**（`<TopicLink slug ch>`，每处 EN、ZH 各一次）：

| 主题 · 章 | 那边讲了什么 | 这边怎么用 | 链接位置 |
|---|---|---|---|
| `forces` · `gravity-and-weight` | 重力、重量；细看"电梯里的力"（钢缆向上拉、重力向下拉，静止时两个力都在） | 不重讲重力；直接用"两个力"进入曳引与对重 | 第 02 章正文第 1 段 |
| `forces` · `friction-starting` / `friction-and-motion` | 摩擦力让东西动起来 / 慢下来 | 曳引靠摩擦带绳；制动器、安全钳靠摩擦停车 | 第 02 章、第 04 章 |
| `forces` · `forces-at-work` | 刹车、鞋底、电梯里的力 | 安全钳是"夹住导轨的刹车" | 第 04 章细看 |
| `energy-conversion` · `up-high-and-moving` | 举高的轿厢势能更多；细看"对重" | 这边用试一试把"补差"算给读者看 | 第 03 章正文第 1 段 |
| `energy-conversion` · `energy-from-the-sun` | 组屋屋顶太阳能板为电梯等公共设施供电 | 第 07 章细看一句，不重讲太阳能 | 第 07 章细看 |
| `energy-conversion` · `never-used-up` | 每一步都有热；节约能源 | 电动机、制动器、电阻变热；回馈让一部分电再用一次 | 第 03 章细看 |
| `container-port` · `the-crane-load-path` | 起重机的钢丝绳与载荷路径（**待核**该章是否讲绳与卷筒） | 对照：起重机卷绳、电梯是摩擦带绳 + 对重 | 第 02 章细看 |
| `magnets` · 〔电磁铁一章，**待核** id〕 | 通电的线圈变磁铁 | 制动器：电磁铁通电把制动臂拉开 | 第 04 章细看 |

反向链接（施工完成后由主会话决定是否加）：`forces/gravity-and-weight` 细看"电梯里的力"、`energy-conversion/up-high-and-moving` 细看"对重"各加一处指向本主题；**不在本轮改**。

### 1.4 口吻

按 skill `atlas-space-topic` 的 `writing-rules.md`：读者是一般读者含小学生和家长；短句、先现象后原理；每章正文 EN 200–300 词 / ZH 350–500 字、3–5 段，细看 2–4 块；数字取整 + 约，模拟值写明"在这个模拟里"。安全写法（D-12）：讲机关、讲检验、讲官方建议；不写"电梯很危险""万一断绳"，不写事故、不写"放心坐吧"这类口号；乘梯安全提示只用官方原话（P27）。

---

## 2. 分区 01–05

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色（token） |
|---|---|---|---|---|
| 01 | `shaft` | Shaft and landings / 井道与层站 | 井道墙、底坑、三道层门、层门锁、召唤按钮、楼面切片 | `token:ink-3` |
| 02 | `car` | Car and doors / 轿厢与门 | 轿架、轿厢、轿门、门机、门刀、光幕、操纵盘、安全钳、导靴、护脚板、载重方块 | `token:ink-2` |
| 03 | `machine` | Machine room / 机房 | 曳引电动机、曳引轮、制动器、导向轮、控制柜、自动救援装置、限速器、机房墙 | `token:neutral` |
| 04 | `ropes-rails` | Ropes, counterweight and rails / 绳、对重与导轨 | 轿厢侧钢丝绳、对重侧钢丝绳、对重、轿厢导轨、对重导轨、限速器绳、张紧轮、两只缓冲器 | `token:ink` |
| 05 | `energy-signals` | Energy and signals / 能量与信号 | 只有流：电能进、电能回馈、热、召唤信号 | `token:en-electrical`（图例分色） |

- 有零件的组在 PLATE 立面里按组色画；05 只在 LAYERS 和 KEY 里。
- context 零件：`floor-slabs`（三层楼板与走廊地面切片）、`omission-band`（省略带的锯齿断口）、`roof-slab`（屋面板），不属于任何分区。

---

## 3. 零件表

### 3.1 坐标与尺度

- 单位米，Y 向上，+Z 朝观者（层门一侧），+X 向右；**1 楼楼面 y = 0**。
- **画面上的楼层**（D-6）：1 楼 y 0；2 楼 y 2.8；省略带 y 4.4…5.2（代表 3–11 楼）；12 楼 y 7.2；井道顶（机房楼板底）y 11.0；机房楼板 y 11.0…11.2；机房 y 11.2…13.6；底坑底 y −1.6。
- **井道净空**：x −1.30…1.20（2.5 m）、z −0.95…0.85（1.8 m）；前墙 z 0.85…1.05，层门洞 0.9 × 2.1 m，洞中心 x 0.20。
- **轿厢**：轿厢内净 1.6 W × 1.4 D × 2.2 H（**待核**：1,000 kg 的 EN 81-20 最大面积 2.40 m²，本设计 2.24 m²）；轿厢外包络 x −0.62…1.02、z −0.75…0.75、y 0…2.45（停 1 楼时，地板顶 = 1 楼楼面）。轿架包住轿厢，上梁 y 2.55。
- **对重**：在轿厢左侧，x −1.18…−0.98（铁块厚 0.16 + 框）、z −0.50…0.50；高 1.9 m。轿厢在 1 楼时对重底 y 7.6；轿厢在 12 楼时对重底 y 0.4。
- **画面位移**：轿厢 1 楼 → 2 楼 +2.8、→ 12 楼 +7.2；对重同量反向。真实位移 2.8 / 30.8 m 只在 PLATE 和细看。
- 整体包络约 2.7 × 15.2 × 2.4 m，模型半径约 7.7 m；投影门槛 ≥ 0.28 × 7.7 ≈ 2.2 m（只有井道墙、轿厢、机房、导轨投影；导轨细长，**关投影**，见 §10）。
- primitive 写法照 `schema.ts` 与 `modelling-runbook.md` §3；`tube.path` 相对 `at`。坐标是起点，R2 按参考图调，不改量级。

### 3.2 零件（38 个 + 3 个 context）

材质族：`enamel`（井道与机房墙，tint 混凝土灰 `#c9c6bf`；层门、轿厢外板 tint 浅灰）、`stainless`（轿厢内壁、层门面板、门槛）、`steel`（轿架、导轨、曳引轮、楔块、钢丝绳）、`powder`（曳引机壳、控制柜、对重铁块深灰、缓冲器）、`casing`（门机铝件、门刀）、`rubber`（导靴衬、缓冲器头）、`plastic`（按钮、光幕条）、`glass`（光幕光束，glow）。"shell"= X-RAY 时透明；"隐"= 默认隐藏的章；"参考"= §11 编号。

| # | id 名称 | 组 | primitive（+ extra） | at（轿厢在 1 楼） | 材质 | explode dir · dist | connects | shell | 投影 | 隐 | 参考 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `shaft-walls` 井道墙 | shaft | 三块 bevelBox：后墙 [2.70, 12.6, 0.20]（z −1.05）、左墙 [0.20, 12.6, 2.10]（x −1.40）、右墙同（x 1.30）；前墙另建（03）；省略带处断开（extra 分上下两段） | (−0.05, 4.7, −0.1) | enamel 混凝土灰 | 0（不拆） | pit, machine-room | ✓ | ✓ | 02–06 章 | R1 R2 |
| 02 | `pit` 底坑 | shaft | bevelBox 底板 [2.50, 0.10, 1.80]（y −1.65）+ extra 爬梯（两根 cylinder + 6 根横档，repeat） | (−0.05, −1.65, −0.05) | enamel | 0 | car-buffer, cw-buffer, tension-pulley | | | — | R2 |
| 03 | `front-wall` 井道前墙 | shaft | 三段 bevelBox（1 楼、2 楼、12 楼各一段，每段 [2.70, 2.8, 0.20] 开门洞，用 extra 拼出洞口两侧与门楣） | 各层 | enamel | [0, 0, 1] · 0.6 | landing-doors-* | ✓ | | 02–06 章 | R3 |
| 04 | `landing-doors-1` 1 楼层门 | shaft | 两扇 bevelBox [0.45, 2.10, 0.03]（中分），extra：门槛 box（stainless）、门楣内的门锁滚轮 2 只 cylinder | (0.20, 1.05, 0.88) | stainless | [0, 0, 1] · 0.4 | landing-locks, car-doors | | | — | R3 R4 |
| 05 | `landing-doors-2` 2 楼层门 | shaft | 同 04 | (0.20, 3.85, 0.88) | stainless | 同 | landing-locks | | | — | R3 |
| 06 | `landing-doors-12` 12 楼层门 | shaft | 同 04 | (0.20, 8.25, 0.88) | stainless | 同 | landing-locks | | | — | R3 |
| 07 | `landing-locks` 层门锁 | shaft | bevelBox [0.12, 0.06, 0.04] ×3（extra，每层门楣内侧一只，含钩子 box 与触点 cylinder） | 1 楼门楣内 (0.45, 2.2, 0.84) | steel | [0, 0.3, 1] · 0.3 | landing-doors-*, controller | | | — | R4 R5 |
| 08 | `hall-buttons` 召唤按钮 | shaft | bevelBox 面板 [0.08, 0.20, 0.015] + 两只 cylinder 按钮（上 / 下，无箭头文字，用 cone 小三角凸起表示方向，★ 无字）×3 层（extra） | 1 楼门洞右侧 (0.85, 1.1, 1.06) | stainless + plastic | [0, 0, 1] · 0.3 | controller | | | — | R3 |
| 09 | `car-frame` 轿架 | car | 上梁 bevelBox [1.80, 0.18, 0.16]（y 2.55）、下梁同（y −0.12）、两根立柱 [0.10, 2.70, 0.16]（x −0.72 / 1.12）；extra 绳头组合 6 根短 cylinder（上梁中部） | (0.20, 1.22, 0) | steel tint 深灰 | [1, 0, 0] · 0.5 | car-cabin, hoist-ropes-car, safety-gear, guide-shoes | | | — | R6 |
| 10 | `car-cabin` 轿厢 | car | 薄板盒：两侧 + 后壁 + 顶 + 地板（bevelBox，厚 0.03），前面开门洞；extra：内壁扶手 tube、顶部灯带 box（glass）、地板下称重垫 4 只 cylinder（rubber） | (0.20, 1.22, 0) | stainless（内） + enamel 浅灰（外） | [0, 0, 0] · 0 | car-frame, car-doors, car-panel | ✓ | ✓ | — | R6 R7 |
| 11 | `car-doors` 轿门 | car | 两扇 bevelBox [0.45, 2.10, 0.03] | (0.20, 1.05, 0.78) | stainless | [0, 0, 1] · 0.25 | door-operator, door-vane | | | — | R4 |
| 12 | `door-operator` 门机 | car | bevelBox [1.20, 0.16, 0.20]（轿顶前沿）+ extra 小电机 cylinder、皮带 tube、两只门挂轮 cylinder | (0.20, 2.55, 0.70) | casing + powder | [0, 1, 0] · 0.3 | car-doors, controller | | | — | R4 R8 |
| 13 | `door-vane` 门刀 | car | 两块竖薄板 box [0.01, 0.40, 0.04]（轿门左扇上部外侧） | (0.00, 1.95, 0.81) | casing | 同 11 | car-doors, landing-locks | | | — | R4 R5 |
| 14 | `light-curtain` 光幕 | car | 两根竖条 bevelBox [0.025, 1.80, 0.02]（门洞两侧）+ extra 光束：16 根 cylinder r 0.002 横跨门洞（glass，bind `visible` 与 glow） | (0.20, 1.10, 0.80) | plastic 深灰 + glass | 同 11 | car-doors, controller | | | — | R9 |
| 15 | `car-panel` 轿内操纵盘 | car | bevelBox [0.20, 0.80, 0.02]（轿厢右前内壁）；extra 12 只 cylinder 按钮（repeat 2 × 6，无数字）+ 警铃 / 对讲按钮各 1（`token:hot` 小环） | (0.95, 1.20, 0.60) | stainless + plastic | [−1, 0, 0] · 0.2 | controller | | | — | R7 |
| 16 | `safety-gear` 安全钳 | car | 两只钳体 bevelBox [0.10, 0.22, 0.14]（下梁两端、骑在导轨上）；extra 每只两块楔块 box（steel）、提拉杆 tube（连到限速器绳夹） | 左 (−0.72, −0.05, 0)，右镜像 `bilateral: { axis: "x" }` 以 x 0.20 为中线 **待核**（不对称时拆 extra） | steel | [0, −1, 0] · 0.3 | car-frame, governor-rope, car-rails | | | — | R10 R11 |
| 17 | `guide-shoes` 导靴 | car | 4 只 bevelBox [0.08, 0.12, 0.12]（上下梁两端）+ rubber 衬块 extra | 上左 (−0.72, 2.55, 0) | steel + rubber | 随轿架 | car-frame, car-rails | | | — | R6 |
| 18 | `car-apron` 护脚板 | car | bevelBox [0.9, 0.75, 0.01]（轿厢门槛下方竖直向下） | (0.20, −0.40, 0.80) | steel tint 黄灰 | 0 | car-cabin | | | — | R12 |
| 19 | `load-blocks` 载重方块 | car | box [0.35, 0.35, 0.35]，repeat {count 4, axis [1,0,0], spacing 0.38}（轿厢地板上一排）；bind `count` ← 载重 ÷ 250 | (−0.37, 0.18, −0.2) | plastic tint 中灰 | 0 | car-cabin | | | 除第 03 章外 | — |
| 20 | `traction-motor` 曳引电动机 | machine | lathe 扁圆机壳（直径 0.70、厚 0.30，轴沿 Z）+ extra 底座 bevelBox、接线盒 | (−0.04, 11.75, −0.30) | powder 深灰 | [0, 1, 0] · 0.6 | traction-sheave, machine-brake, controller | | | — | R13 |
| 21 | `traction-sheave` 曳引轮 | machine | lathe 带 6 道绳槽的轮（直径 0.48、宽 0.12，轴沿 Z），segments 48 | (−0.04, 11.75, 0.0) | steel | [0, 1, 0] · 0.6 | traction-motor, hoist-ropes-car, hoist-ropes-cw | | | — | R13 R14 |
| 22 | `machine-brake` 制动器 | machine | 两只制动臂 bevelBox [0.06, 0.32, 0.10] 夹在制动盘 / 鼓（extra cylinder r 0.22）两侧 + 两只弹簧 coil + 电磁铁 box；pose `brake-open`（两臂各外张 2°，画面放大 3×，D-6 例外写进 note） | (−0.04, 11.75, −0.52) | steel + powder | [0, 1, 0] · 0.6 | traction-motor, controller | | | — | R13 R15 |
| 23 | `deflector-sheave` 导向轮 | machine | lathe 轮（直径 0.40，6 道槽），轴沿 Z | (−0.80, 11.40, 0.0) | steel | [0, 1, 0] · 0.5 | traction-sheave, hoist-ropes-cw | | | — | R14 |
| 24 | `controller` 控制柜 | machine | bevelBox [0.60, 1.80, 0.40]（机房右侧靠墙）；extra 门缝线、散热格栅 grille、线槽 tube 到曳引机 | (1.00, 12.10, −0.60) | powder tint 浅灰 | [1, 0, 0] · 0.5 | traction-motor, machine-brake, governor, ard, landing-locks, hall-buttons, car-panel, door-operator | | | — | R16 |
| 25 | `ard` 自动救援装置 | machine | bevelBox [0.40, 0.50, 0.30]（控制柜旁）+ extra 电池格 box ×2 | (1.00, 11.45, 0.10) | powder | [1, 0, 0.5] · 0.4 | controller | | | — | R16 |
| 26 | `governor` 限速器 | machine | lathe 轮（直径 0.30，轴沿 Z）+ extra 飞锤 2 只 box、棘爪 box、超速开关 box、支架；pose `governor-tripped`（棘爪落下 15°） | (0.85, 11.45, 0.45) | steel + powder | [0, 1, 0] · 0.4 | governor-rope, controller | | | — | R10 R17 |
| 27 | `machine-room` 机房 | machine | 薄板墙 ×3 + 顶（bevelBox，厚 0.15；前面开大窗洞，便于观看）；extra 通风百叶 grille、绳孔（楼板上 3 个开口，用 extrude 楼板） | (−0.05, 12.4, −0.1) | enamel 混凝土灰 | [0, 1, 0] · 0.9 | shaft-walls | ✓ | ✓ | 02–04 章 | R1 R13 |
| 28 | `hoist-ropes-car` 轿厢侧钢丝绳 | ropes-rails | 6 根 cylinder r 0.005（画粗到 r 0.008，D-6 例外），from 曳引轮右切点 y 11.75 → 轿架上梁 y 2.64；1 楼时长 8.9 m；pose 随 `stop` 缩放（§5） | (0.20, 7.20, 0) | steel | 0 | traction-sheave, car-frame | | | — | R14 |
| 29 | `hoist-ropes-cw` 对重侧钢丝绳 | ropes-rails | 6 根 cylinder r 0.008：导向轮左切点 → 对重绳头；1 楼时长 1.9 m（对重顶 y 9.5 → 11.4）；pose 随 `stop` | (−1.00, 10.45, 0) | steel | 0 | deflector-sheave, counterweight | | | — | R14 |
| 30 | `counterweight` 对重 | ropes-rails | 框：两根立柱 bevelBox [0.04, 1.90, 0.06] + 上下梁；extra 铸铁块 box [0.16, 0.10, 0.90] repeat {count 16, axis [0,1,0], spacing 0.105}；extra 4 只导靴 | (−1.08, 8.55, 0) | powder 深灰（块）+ steel（框） | [−1, 0, 0] · 0.4 | hoist-ropes-cw, cw-rails | | ✓ | — | R18 |
| 31 | `car-rails` 轿厢导轨 | ropes-rails | 两根 T 形 extrude（翼缘 0.09、腹板 0.075 × 0.016，**待核**型号尺寸 T89/B），竖向 y −1.5…10.8，省略带处断开（extra 两段） | x −0.80 / 1.20, z 0 | steel | 0 | car-frame, guide-shoes, safety-gear | | 关 | — | R11 R19 |
| 32 | `cw-rails` 对重导轨 | ropes-rails | 两根小 T 形 extrude（T70 量级），y −1.5…10.8 | x −1.20, z ±0.55 | steel | 0 | counterweight | | 关 | — | R18 R19 |
| 33 | `governor-rope` 限速器绳 | ropes-rails | 两根 cylinder r 0.004（画粗 0.006），限速器 → 张紧轮，闭环两条竖线；extra 绳夹 box（连安全钳拉杆，**随轿厢 pose 移动**，绳本身不动） | (0.85, 4.9, 0.45) | steel | 0 | governor, tension-pulley, safety-gear | | | — | R10 R17 |
| 34 | `tension-pulley` 张紧轮 | ropes-rails | lathe 轮（直径 0.30）+ extra 配重杠杆 box | (0.85, −1.30, 0.45) | steel + powder | [0, −1, 0] · 0.3 | governor-rope, pit | | | — | R17 |
| 35 | `car-buffer` 轿厢缓冲器 | ropes-rails | 油压缓冲器：cylinder 缸体（r 0.07，高 0.60）+ 柱塞 cylinder（r 0.04，高 0.35）+ 橡胶头；extra 底座 | (0.20, −1.20, 0) | powder + steel + rubber | [0, 1, 0] · 0.3 | pit, car-frame | | | — | R20 |
| 36 | `cw-buffer` 对重缓冲器 | ropes-rails | 同 35，略小 | (−1.08, −1.25, 0) | 同 | 同 | pit, counterweight | | | — | R20 |
| 37 | `travelling-cable` 随行电缆 | ropes-rails | tube r 0.012：从井道中部墙上的接线盒下垂成 U 形挂到轿底（1 楼时的形状；随 `stop` 换 3 个 pose，**删减第一位**） | (1.10, 2.5, −0.6) | rubber | 0 | car-cabin, controller | | | — | R6 |
| 38 | `shaft-lights` 井道照明 | shaft | capsule ×4（井道右墙，每段一只，glass + glow 常亮弱） | (1.18, —, −0.8) | glass | 0 | — | | | — | — |
| — | `floor-slabs` 楼板（context） | — | 三块 bevelBox [5.0, 0.20, 3.0] 带走廊地面向 +Z 伸出 1.5 m；`clip: false` | 各层 y −0.2 / 2.6 / 7.0 | enamel 浅灰 | — | — | — | — | — | — |
| — | `omission-band` 省略带（context） | — | 锯齿薄板 extrude ×2（井道外轮廓上、下断口），技术图断裂线 | y 4.4 / 5.2 | enamel | — | — | — | — | — | — |
| — | `roof-slab` 屋面（context） | — | bevelBox [5.0, 0.20, 3.0]（机房楼板向外延伸为屋面）+ 女儿墙 | y 11.1 | enamel | — | — | — | — | — | — |

- **零件数说明**：38 个。三道层门分开是为了"只有轿厢停的那一层的门能开"（第 05 章）；钢丝绳分轿厢侧 / 对重侧两件，是为了随 `stop` 分别缩放；限速器、限速器绳、张紧轮、安全钳四件分开是为了第 04 章逐步标注"量速度 → 卡住绳 → 提起楔块 → 夹住导轨"。删减顺序（如超预算）：`travelling-cable` → `shaft-lights` → `car-apron` 并入 `car-cabin` extra → `ard` 并入 `controller` extra → `hall-buttons` 只留 1 楼。
- **默认不隐藏零件**（第 01 章完整外观，层门关着）；`hide` 不累积。
- **省略带规则**：井道墙、导轨、限速器绳在 y 4.4…5.2 断开；钢丝绳**不断开**（轿厢在 12 楼时轿厢侧绳很短，在 1 楼时它要穿过省略带——画面上绳穿过断口是可接受的技术图画法，note 写明）。

### 3.3 summary / detail 要点（施工时写成 EN / ZH；summary ≤ 60 字符，第一句说它做什么）

| id | summary | detail 要点 |
|---|---|---|
| shaft-walls | 混凝土井道，轿厢和对重在里面上下走 | 3–11 楼在模型里省略（D-6）；导轨固定在墙上 |
| pit | 井道最底下的坑，放缓冲器和张紧轮 | 约 1.6 m 深（DESIGN）；维修人员从爬梯下去 |
| front-wall | 每层的井道前墙，开着层门洞 | — |
| landing-doors-* | 每层的门：平时锁住，轿厢到了才打开 | 层门自己没有电机，由轿门上的门刀带动（F-18）；有专用钥匙供受过训练的人在救援时开启 |
| landing-locks | 锁住层门；锁好了，电梯才能走 | 机械钩子 + 电触点串在安全回路里（F-18、F-19）；坏了的话电梯会停在原地不走，而不是带着开着的门走 |
| hall-buttons | 召唤电梯：告诉控制器你在哪层、想上还是下 | 信号进控制柜（流 `call-signal`） |
| car-frame | 钢框，钢丝绳挂在它的上梁上 | 轿厢放在框里、隔着减振垫；安全钳、导靴装在框上 |
| car-cabin | 乘客站的箱子 | 内净 1.6 × 1.4 × 2.2 m（DESIGN）；地板下的称重装置让控制器知道载重，超载时电梯不关门、会响铃（**待核**） |
| car-doors | 轿厢自己的门，由门机推开 | 中分双扇（0.1-6）；门边的光幕防夹 |
| door-operator | 门机：一台小电动机把轿门推开、拉上 | 关门的力和速度有限制（**待核** P13），碰到东西会重开 |
| door-vane | 门刀：轿厢平层时带开这一层的层门 | 只在轿厢正对层门时才能伸进门锁滚轮之间，所以别的层的门打不开 |
| light-curtain | 一排看不见的光束：挡住就重新开门 | 红外光，探测 ≥ 50 mm 的物体（F-20）；LEP 给老电梯加装（F-30）；模型把光束画成可见的细线 |
| car-panel | 轿内按钮：选楼层、开关门、警铃和对讲 | 被困时按警铃 / 对讲（F-27） |
| safety-gear | 安全钳：被提起时楔块夹住导轨，让轿厢停住 | 渐进式，平均减速 0.2–1.0 g（F-15）；不用电；动作后要由维修人员复位 |
| guide-shoes | 导靴：让轿厢贴着导轨走，不左右晃 | 滑动导靴或滚轮导靴 |
| car-apron | 护脚板：轿厢门槛下的挡板 | 轿厢停得比楼面高时挡住门下的空隙（LEP 项目之一，F-30） |
| load-blocks | 表示载重：每块约 250 kg，约 3 人 | 模型示意，不是真实物件 |
| traction-motor | 电动机：把电能转换成动能，转动曳引轮 | 无齿轮永磁同步机（F-10）；变频驱动控制转速；也会变热 |
| traction-sheave | 带槽的轮子：靠摩擦带动钢丝绳 | 直径 480 mm、6 道槽（DESIGN）；轮不卷绳，绳搭在槽里（F-9）；槽磨损会打滑，要定期检查 |
| machine-brake | 制动器：断电时弹簧把它压紧，电梯停住 | 运行时电磁铁通电把它松开（F-11）；两组，各自都能刹住 |
| deflector-sheave | 导向轮：把对重一侧的绳拉开到井道另一边 | 只改方向，不带动力 |
| controller | 控制柜：决定什么时候走、多快、停哪层 | 内含控制器与变频驱动；监视安全回路；能量回馈（0.1-7） |
| ard | 停电时用电池把轿厢开到最近一层并开门 | LEP 加装（F-26、F-30） |
| governor | 限速器：量轿厢的速度，太快就卡住限速器绳 | 本设计动作速度 2.1 m/s（F-13）；先断电、再卡绳；纯机械 |
| machine-room | 楼顶上的机房 | 组屋楼顶常见的小房子（0.1-1） |
| hoist-ropes-car / hoist-ropes-cw | 钢丝绳：一头挂轿厢，一头挂对重 | 6 根 × 10 mm（DESIGN）；安全系数 ≥ 12（F-8）；定期检查断丝和磨损；模型画粗 |
| counterweight | 对重：和轿厢互相平衡，电动机只需补差 | 1,550 kg = 轿厢 1,100 + 一半载重的 45 %（F-6）；一叠铸铁块，可以加减 |
| car-rails / cw-rails | 导轨：轿厢和对重各沿一对钢轨走 | T 形截面；也是安全钳夹住的地方 |
| governor-rope | 限速器绳：跟着轿厢走，带着限速器转 | 闭环；绳夹连着安全钳拉杆 |
| tension-pulley | 张紧轮：在井底把限速器绳拉紧 | 绳松了有开关断电（LEP"限速器绳松弛检测"，F-30） |
| car-buffer / cw-buffer | 缓冲器：最后一道保护，挡在井底 | 油压式（F-17）；正常运行碰不到；年度测试项目（F-23） |
| travelling-cable | 随行电缆：给轿厢送电和信号 | 一头固定在井道中部，一头挂在轿底，随轿厢上下 |
| shaft-lights | 井道照明 | 供检修用 |

---

## 4. 流

颜色语义（能量主题的四个 token 沿用 `energy-conversion`，每色一个意思）：`token:en-electrical` = 电能；`token:en-heat` = 热；`token:signal` = 召唤 / 控制信号（不是能量）。钢丝绳和对重的**运动不用粒子表示**（绳长会变，流的路径是固定的；运动由姿态与 `sequence` 动画表示）。速度是可视速度。

| id | group | 段 | 路径（按零件） | 约长 m | speed | count | size × | spread | stops | ends | clip | parts |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `power-in` | energy-signals | 电能进 | 机房墙上的进线点 → controller → 线槽 → traction-motor | 2.6 | 0.5 | 120 | 1.2 | 0.004 | 单色 en-electrical | fade | ✓ | controller, traction-motor |
| `power-back` | energy-signals | 电能回馈（bind `visible`：`role = holds-back`） | traction-motor → 线槽 → controller → 进线点（与 `power-in` 同路反向） | 2.6 | 0.5 | 120 | 1.2 | 0.004 | 单色 en-electrical | fade | ✓ | traction-motor, controller |
| `machine-heat` | energy-signals | 电动机、控制柜、制动器散热（`paths` 三条，上升） | 各件顶面 → 上方 0.6 m | 3 × 0.6 | 0.15 | 240 | 1.4 | 0.05 | 单色 en-heat | fade | ✗ | traction-motor, controller, machine-brake |
| `call-signal` | energy-signals | 召唤信号（只在第 06 章） | hall-buttons（1 楼）→ 井道墙内竖线 → controller | 12.5 | 1.2 | 120 | 0.8 | 0.003 | 单色 signal | fade | ✗ | hall-buttons, controller |

合计 4 条 → 运转时 +4 次绘制（`power-back` 与 `power-in` 互斥：bind `visible` 只让其中一条可见，所以实际 +3）。

---

## 5. 动画与姿态

全部 `whenRun: true`。转速是可读的视觉速度；真实值在 PLATE 与细看（"画面里放慢了"）。

### 5.1 轿厢位置：姿态（静止的三站）

`stop` 控件（§8）经 bind `pose` 选三个姿态之一；不写时 = `car-at-1`（静止姿态 = 1 楼，几何本身就在 1 楼，姿态为空）。

| pose | 零件 | 内容 |
|---|---|---|
| `car-at-1` | —（静止） | 轿厢在 1 楼 |
| `car-at-2` | car 组全部 + `hoist-ropes-car`、`hoist-ropes-cw`、`counterweight`、`governor-rope` 的绳夹 extra、`travelling-cable` | car 组 offset y +2.8；对重 offset y −2.8；轿厢侧绳 scale y (8.9 − 2.8) ÷ 8.9 = 0.685、offset y +1.4（上端不动）；对重侧绳 scale y (1.9 + 2.8) ÷ 1.9 = 2.474、offset y −1.4 |
| `car-at-12` | 同上 | car 组 +7.2；对重 −7.2；轿厢侧绳 scale 0.191、offset +3.6；对重侧绳 scale 4.789、offset −3.6 |

**注意**：姿态的 `scale` 绕零件中心缩放，所以配 `offset` = 位移 ÷ 2 让上端不动（施工时单测核对绳上端在曳引轮切点 ±5 mm、下端在绳头 ±5 mm）。`governor-rope` 本身不动，只有绳夹 extra 跟轿厢——若姿态不能只动 extra，就把绳夹拆成独立零件 `governor-rope-clamp`（零件数 +1）。

### 5.2 其他姿态（≤ 32，默认缓动 0.8 s）

| pose | 零件 | 内容 |
|---|---|---|
| `doors-open-1` | car-doors、landing-doors-1 | 两扇各向外平移 0.43 m（中分）；只在轿厢在 1 楼的拍用 |
| `brake-open` | machine-brake | 两臂外张（运转章的拍用；静止 = 合上） |
| `governor-tripped` | governor | 棘爪落下 |
| `safety-set` | safety-gear、governor-rope 绳夹 | 拉杆提起 0.03 m，楔块上移 0.03 m 贴住导轨；与 `governor-tripped` 同拍——一拍只能一个姿态时，把二者合成一个姿态 `safety-test`（governor + safety-gear 两个零件条目） |
| `buffer-compressed` | car-buffer | **不做**（不演示轿厢撞缓冲器；细看文字讲） |

### 5.3 动画

| id | target | kind | 参数 | 说明 |
|---|---|---|---|---|
| `trip` | car 组 + 两段绳 + 对重 | sequence | keys t 0 / 3 / 5 / 8 / 10：轿厢 offset y 0 → 7.2 → 7.2 → 0 → 0（两端停 2 s）；对重反向；绳 scale / offset 同 §5.1 的端点值；loop | **只在 `stop = 1` 的章 / 拍运转时播**（第 02、03 章的总览拍）；从 1 楼到 12 楼画面上 3 s（真实约 18 s，F-4） |
| `sheave-trip` | traction-sheave、deflector-sheave | sequence | 同一时间轴：rotation z 0 → −1,718°（7.2 m ÷ 0.24 m 弧度换角度）→ 停 → 回到 0；导向轮按 0.20 m 半径 | 与 `trip` 同步，绳不会"打滑"着看 |
| `governor-trip-spin` | governor、tension-pulley | sequence | 同步，按 0.15 m 半径 | 限速器轮跟着转 |
| `brake-hold` | machine-brake | sequence | 与 `trip` 同轴：停站时合上、走时张开（两臂 ±2°） | 制动器"走时开、停时合" |
| `doors-cycle` | car-doors、landing-doors-1 | sequence | t 0 / 1.5 / 4 / 5.5：关 → 开 → 开 → 关，loop | 第 05 章 |
| `beam-flicker` | light-curtain 光束 | — | 不做动画；用 bind glow 表示"一束被挡" | — |

一条 `sequence` 只有一个 `target`：`trip` 实际是同一时间轴的一组动画（`trip-car` 作用于 car 组每个零件各一条或先把 car 组并成少数几件、`trip-cw`、`trip-rope-car`、`trip-rope-cw`），keys 的 t 完全相同，所以始终同相。`trip` 是 `sequence` 的 offset / scale 叠在姿态之后（docs/06 变换顺序：位置 → 姿态 → offset → … → 动画）。**只有 `stop = 1` 时播**：用 `sim.bind` 的动画 `enabled` 条件 `{ control: "stop", is: { eq: "1" } }`。见 §9 E-HL1（验证项）。

---

## 6. 章节

### 6.0 总表

镜头写预设名（§7.4）；`layers` 只写与默认（全部）不同的；`hide`、`labels` 不累积。

| # | id | 标题 EN / ZH | view | run | cutaway | pose | hide | layers | part | labels | 镜头 | 拍 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `whole-lift` | A lift in an HDB block / 组屋里的一部电梯 | assembled | false | none | — | — | 01–04 | null | machine-room, car-cabin, counterweight, landing-doors-1, pit | hero | 4 |
| 02 | `ropes-and-sheave` | Ropes, sheave and motor / 钢丝绳、曳引轮和电动机 | xray | true | none | — | front-wall, shaft-walls | 02–05 | traction-sheave | traction-sheave, traction-motor, hoist-ropes-car, hoist-ropes-cw | machine | 5 |
| 03 | `the-counterweight` | Why a counterweight saves energy / 对重为什么省电 | xray | true | none | 由 sim | front-wall, shaft-walls, machine-room | 全部 | counterweight | counterweight, car-cabin, load-blocks, traction-motor | shaft | 5 |
| 04 | `stopping-safely` | Brakes, governor and safety gear / 制动器、限速器和安全钳 | xray | false | none | — | front-wall, shaft-walls, machine-room | 01–04 | safety-gear | machine-brake, governor, governor-rope, safety-gear, car-rails, car-buffer | safety | 5 |
| 05 | `doors-and-locks` | Doors, locks and sensors / 门、门锁和传感器 | assembled | true | `doorway` | — | — | 01–02 | door-vane | landing-doors-1, car-doors, door-vane, landing-locks, light-curtain | doorway | 4 |
| 06 | `calls-and-control` | Buttons, control and rescue / 按钮、控制和救援 | xray | true | none | — | front-wall, shaft-walls | 全部 | controller | hall-buttons, car-panel, controller, ard | machine | 4 |
| 07 | `otis-to-every-floor` | From 1854 to every floor / 从 1854 年到每层都停 | assembled | false | none | — | — | 01–04 | null | landing-doors-1, landing-doors-2, light-curtain, controller | hero | 4 |

合计 **7 章 31 拍**。每章 `summary` 是阅读面板头一句，也是默认字幕。

### 6.1 第 01 章 `whole-lift`

- **summary**：A lift is a car and a counterweight hung from the two ends of the same steel ropes, with a motor on the roof that moves the ropes. / 电梯就是挂在同一组钢丝绳两端的轿厢和对重，加上楼顶一台带动钢丝绳的电动机。
- **正文提纲**：① 从走廊看：层门、召唤按钮；门后是一条贯通全楼的井道（F-1）。② 井道里有什么：轿厢、对重、导轨；顶上是机房，底下是底坑（0.1-1）。③ 这一部的大小：1,000 kg、13 人、1.75 m/s、12 层（F-2–F-4，规格行第一次出现）；模型省略了 3–11 楼（D-6）。④ 新加坡几乎所有组屋都已每层有电梯停（F-29，引出第 07 章）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章（hero） | 一座 12 层组屋的电梯：井道从底坑通到楼顶机房；模型省略了 3 到 11 楼 |
| 2 | camera landing；labels landing-doors-1, hall-buttons, front-wall | 每层有一道层门和召唤按钮；层门平时锁着 |
| 3 | view xray；hide front-wall, shaft-walls；labels car-cabin, counterweight, car-rails, hoist-ropes-car | 墙透明后：轿厢和对重挂在同一组钢丝绳的两端，各沿自己的导轨走 |
| 4 | camera machine；labels machine-room, traction-motor, controller, governor | 楼顶机房里是电动机、控制柜和限速器 |

- **细看**：`How big is this lift`（F-2–F-4；13 人 = 1,000 ÷ 75 kg；同类组屋梯的典型范围，标"典型"）；`What this model leaves out`（3–11 楼、补偿链、井道通风、群控——两部以上电梯怎样分工一句）；`Machine room or no machine room`（0.1-1：无机房电梯把曳引机装进井道顶部；组屋两种都有，P8–P10）。
- **本章索引**：shaft-walls, pit, landing-doors-1, hall-buttons, car-cabin, counterweight, car-rails, machine-room, traction-motor, controller
- **名词首现**：lift-car、counterweight、lift-shaft、machine-room

### 6.2 第 02 章 `ropes-and-sheave`

- **summary**：The ropes are not wound up. They lie in the grooves of a wheel, and friction lets the turning wheel drag them along, lifting one side and lowering the other. / 钢丝绳不是被卷起来的。它们搭在轮子的槽里，靠摩擦，转动的轮子带着绳子走：一边升，一边降。
- **正文提纲**：① 两个力（链接 `forces/gravity-and-weight`）：钢丝绳向上拉轿厢，重力向下拉；停着时两个力一样大。② 曳引轮：6 道槽，绳搭在上面，靠摩擦带动（F-9；链接 `forces/friction-starting`）——所以不需要卷筒，楼再高绳也不会越卷越粗（细看）。③ 电动机：把电能转换成动能，直接转动曳引轮，没有齿轮箱（F-10）。④ 制动器：停站时弹簧压紧；走之前通电松开（F-11，详细在第 04 章）。⑤ 一趟：1 楼到 12 楼约 18 秒（30.8 m ÷ 1.75 m/s，不计加减速，SIM）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章（camera shaft，`trip` 动画播放） | 轿厢上行、对重下行：两边总是反着走 |
| 2 | camera machine；labels traction-sheave, hoist-ropes-car, hoist-ropes-cw, deflector-sheave | 钢丝绳搭在曳引轮的 6 道槽里，靠摩擦被带着走；导向轮把对重那一侧拉开 |
| 3 | labels traction-motor, machine-brake | 电动机直接转动曳引轮；在这个模拟里每分钟约 70 转 |
| 4 | camera shaft；run false；labels car-frame, hoist-ropes-car | 停着的时候，钢丝绳向上拉、重力向下拉，两个力一样大 |
| 5 | layers 05；flow power-in；labels controller, traction-motor | 电从控制柜送进电动机：电能转换成动能 |

- **细看**：`Friction, not winding`（与卷筒式起重机对照，链接 `container-port/the-crane-load-path`；绳槽形状决定抓得多紧；槽磨损会打滑，所以年检要看）；`Forces on the ropes`（§1.2 第 7 步：满载约 20.6 kN、每根约 3.4 kN；安全系数 ≥ 12 的意思——"钢丝绳能承受的远比挂着的多"，具体倍数待核后写；"牛顿"中学会学到）；`Why six ropes`（分担、互为备份；F-8）；`Ropes or belts`（0.1-4 一句）。
- **本章索引**：traction-sheave, traction-motor, machine-brake, deflector-sheave, hoist-ropes-car, hoist-ropes-cw, car-frame, counterweight, controller
- **名词首现**：traction-sheave、traction、steel-rope

### 6.3 第 03 章 `the-counterweight`

- **summary**：The counterweight weighs about as much as the car plus half a full load, so the motor only has to make up the difference between the two sides. / 对重大约等于轿厢加上一半满载的重量，所以电动机只需补上两边的差。
- **正文提纲**：① 举高轿厢就把能量储存成势能（链接 `energy-conversion/up-high-and-moving`，那边"只算轿厢、没有算对重"，这边补上）。② 对重：1,550 kg 的铸铁块（F-6）；轿厢升高多少，对重就降低多少，一边得到的势能差不多由另一边给（"补差"）。③ 试一试：满载上行，有对重时电动机约 11.8 kW，没有对重约 45 kW——约四分之一（SIM，§1.2）。④ 反过来：空梯上行时对重比轿厢重，是对重往下走，电动机在"拉住"它；这时电动机像发电机，能把一部分能量送回去（0.1-7、F-28）。⑤ 能量不会用完：电动机、控制柜、制动器都会变热（链接 `energy-conversion/never-used-up`）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章；sim.set {stop: "1", load: 0, counterweight: with, direction: up}；`trip` 播放 | 轿厢升高多少，对重就降低多少 |
| 2 | sim.set {load: 1000}；labels load-blocks, car-cabin, counterweight, traction-motor；sim.reveal | 满载 13 人上行：在这个模拟里电动机约要 11.8 千瓦 |
| 3 | sim.set {counterweight: without}；hide counterweight, hoist-ropes-cw（bind 也可） | 如果没有对重，同样一趟约要 45 千瓦：多出将近三倍 |
| 4 | sim.set {counterweight: with, load: 0}；flow power-back 可见；labels counterweight, traction-motor, controller | 空梯上行：对重更重，是它在往下走；电动机拉住它，还能把电送回去 |
| 5 | layers 05；labels traction-motor, controller, machine-brake | 电动机、控制柜和制动器都在变热：能量没有消失，只是换了形式 |

- **试一试**：见 §8。
- **细看**：`Numbers in this simulation`（§1.2 全表与算式，写明理想模型、η = 0.80；"焦耳、千瓦时的换算中学会学到"）；`Why half a load`（平衡系数 40–50 %：电梯大多数时候载重不满，平衡在中间让上下行的差都不大，F-6、F-7）；`Energy sent back`（EERS：平均约 20 %，F-28；回馈的电用于轿厢照明、通风、显示屏）；`The empty car is the heavy-side-up case`（为什么老电梯要加"上行超速保护"：空梯上行时对重在往下拉，F-22，链接第 04 章）。
- **本章索引**：counterweight, car-cabin, load-blocks, hoist-ropes-car, hoist-ropes-cw, traction-motor, controller, machine-brake
- **名词首现**：potential-energy（`see` energy-conversion）、counterweight-balance、regenerative-drive

### 6.4 第 04 章 `stopping-safely`

- **summary**：A lift has several separate ways to stop: a brake that closes whenever the power is off, a governor that checks the speed, safety gear that grips the rails, and buffers in the pit. / 电梯有几道彼此独立的停车机关：一断电就合上的制动器、量速度的限速器、夹住导轨的安全钳，还有井底的缓冲器。
- **正文提纲**：① 制动器：弹簧压紧、电磁铁通电才松开（F-11）；所以停电时电梯停住不滑（链接 `forces/friction-and-motion`）。② 限速器：限速器绳跟着轿厢走、带着限速器转；转得太快（在这个设计里超过约 2.1 m/s，额定速度的 1.2 倍），飞锤甩开，先断电，再卡住限速器绳（F-13）。③ 安全钳：绳被卡住，轿厢继续走一点点，绳就把安全钳的楔块提起，楔块夹住导轨，轿厢在约半米内平稳停下（F-14–F-16）。④ 它们都是机械的，不需要电，也不靠钢丝绳。⑤ 缓冲器：井底最后一道保护；正常运行碰不到（F-17）。⑥ 每年的检验都会测试这些机关（F-23）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | camera machine；labels machine-brake, traction-motor | 制动器：弹簧把它压紧，通电才松开；停电时电梯会停住 |
| 2 | camera safety；labels governor, governor-rope, tension-pulley | 限速器绳跟着轿厢走，带着限速器转；限速器一直在量轿厢的速度 |
| 3 | pose safety-test；labels governor, governor-rope, safety-gear, car-rails | 在年度测试里：限速器卡住绳，绳提起安全钳，楔块夹住导轨，空轿厢停住 |
| 4 | camera pit；labels car-buffer, cw-buffer, pit | 井底的缓冲器是最后一道保护，正常运行时碰不到 |
| 5 | camera hero（xray）；labels machine-brake, governor, safety-gear, car-buffer, landing-locks | 几道机关各管各的：一道不起作用，还有下一道 |

- **细看**：`How the governor knows`（飞锤离心张开——"离心"一词中学会学到，主线写"转得快，飞锤就甩得开"）；`Stopping distance`（§1.2 第 8 步：约 0.37 m，SIM；平均减速度范围 F-15）；`What if the ropes failed`（0.1-8：一句——限速器和安全钳不靠钢丝绳和电；多根钢丝绳各自就有很大余量，**待核**措辞）；`Brakes and electromagnets`（链接 magnets 电磁铁一章，**待核** id）；`Newer protections`（上行超速保护、防意外移动，F-21、F-22，LEP 给老梯加装）。
- **本章索引**：machine-brake, governor, governor-rope, tension-pulley, safety-gear, car-rails, car-buffer, cw-buffer, pit
- **名词首现**：brake、overspeed-governor、safety-gear、buffer

### 6.5 第 05 章 `doors-and-locks`

- **summary**：The landing door at each floor stays locked until the car is there, and the lift cannot move until every door is closed and locked. / 每层的层门一直锁着，直到轿厢到达这一层；所有门关好锁好之前，电梯不能走。
- **正文提纲**：① 两道门：轿门跟着轿厢走，层门留在每一层（F-18）。② 门刀：轿厢平层时，轿门上的门刀伸进层门门锁的两个滚轮之间，开门时把层门锁拨开、一起带开；所以别的层的门打不开。③ 门锁触点：锁好了，安全回路才接通，电梯才能走（F-19）。④ 光幕：门边一排看不见的红外光束，关门时有人或东西挡住任何一束，门就重新打开（F-20）；探测约 5 cm 以上的物体——所以不要用手或包去挡门，按开门按钮更安全（P27）。⑤ 护脚板：轿厢门槛下的挡板（F-30）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章（cutaway doorway，`doors-cycle` 播放） | 剖开门口：外面是层门，里面是轿门，两道门一起开、一起关 |
| 2 | part door-vane；labels door-vane, landing-locks, door-operator | 门刀伸进层门门锁，开门时把锁拨开；轿厢不在这一层，层门就打不开 |
| 3 | labels landing-locks, landing-doors-2, landing-doors-12 | 每层的门锁都串在一起：有一扇没锁好，电梯就不能走 |
| 4 | glow light-curtain 光束；labels light-curtain, car-doors, car-apron | 光幕：关门时挡住任何一束光，门就重新打开 |

- **细看**：`Why the landing door has no motor`（层门由门刀带动；专用钥匙只给受过训练的人，F-18）；`Light curtain numbers`（F-20，BCA 要求；模型把红外光画成可见的线）；`Protection against unintended movement`（门没关时轿厢不能离开层站，F-21）；`Using lift doors safely`（官方建议原文，P27；不渲染）。
- **本章索引**：landing-doors-1, landing-doors-2, landing-doors-12, car-doors, door-operator, door-vane, landing-locks, light-curtain, car-apron
- **名词首现**：landing-door、door-interlock、light-curtain

### 6.6 第 06 章 `calls-and-control`

- **summary**：Pressing a button sends a call to the controller, which decides which way to go, how fast, and where to stop, and keeps a battery ready in case the power fails. / 按下按钮，召唤信号送到控制器；控制器决定往哪走、走多快、在哪停，还备着电池，以防停电。
- **正文提纲**：① 召唤按钮与轿内按钮：信号进控制柜（流 `call-signal`）。② 控制器按方向顺路接人：上行时先停上面的召唤，再掉头（"集选控制"，**待核**术语与组屋实际，P24）。③ 变频驱动：慢慢加速、慢慢减速，停得平（平层），乘客不觉得晃。④ 称重：超载时不关门、会响铃（**待核**）。⑤ 停电：自动救援装置用电池把轿厢开到最近一层并开门（F-26）；被困时按警铃 / 对讲，等待救援（F-27）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | camera landing；flow call-signal；labels hall-buttons | 按下召唤按钮：信号沿井道送到楼顶的控制柜 |
| 2 | camera machine；labels controller, traction-motor | 控制器决定往哪走、走多快、在哪停 |
| 3 | camera car；labels car-panel, car-cabin | 轿内按钮选楼层；警铃和对讲按钮连到值班人员 |
| 4 | run false；labels ard, controller, machine-brake | 停电时，制动器合上；自动救援装置用电池把轿厢开到最近一层，打开门 |

- **细看**：`Smooth starts and stops`（变频驱动；加减速度典型值**待核**，找不到就不写数字）；`Two lifts, one call`（群控一句）；`Destination buttons`（有些办公楼在大堂输入目的层，组屋一般用上 / 下按钮——**待核**后写，找不到来源就删）；`If you are stuck`（P27 原文要点）。
- **本章索引**：hall-buttons, car-panel, controller, ard, traction-motor, machine-brake, car-cabin, travelling-cable
- **名词首现**：controller、automatic-rescue-device

### 6.7 第 07 章 `otis-to-every-floor`

- **summary**：Lifts became safe enough for people after 1854, when Elisha Otis showed a brake that gripped the rails. In Singapore, almost every HDB block now has a lift that stops at every floor. / 1854 年奥的斯展示了一种会夹住导轨的安全装置，此后电梯才安全到可以载人。在新加坡，现在几乎每座组屋都有每层都停的电梯。
- **正文提纲**：① 1854 年纽约：奥的斯站在升起的平台上，让人砍断吊绳，弹簧带动的卡爪咬住导轨两侧的齿，平台只落下一点就停住（F-31；插图 I-2）；1857 年第一部客用安全电梯；1861 年专利。今天的安全钳是同一个想法：不靠绳，靠导轨（链接第 04 章）。② 电力电梯（F-32）让高楼成为可能。③ 组屋：许多 1990 年代中期以前建的楼，电梯不是每层都停（F-33；插图 I-4）；2001 年起电梯翻新计划让 5,000 多座楼每层都停，约 99 % 的组屋已经做到（F-29）。④ 2016 年起电梯改进计划给约 18,500 部较新的电梯加光幕、防意外移动、自动救援等功能（F-30）；能量回收系统让电梯平均省电约 20 %（F-28）。⑤ 法规：电梯要有 BCA 的运营许可证、每月保养、每年检验与测试（F-23–F-25）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | camera safety（xray）；labels safety-gear, car-rails | 1854 年，奥的斯展示了一个不靠绳子、夹住导轨的安全装置；今天的安全钳是同一个想法 |
| 2 | camera hero；labels landing-doors-1, landing-doors-2, landing-doors-12 | 许多老组屋的电梯原来不是每层都停；2001 年起的翻新让几乎每座组屋都每层有站 |
| 3 | camera doorway；labels light-curtain, car-apron, ard | 2016 年起，较新的组屋电梯加装光幕、护脚板、自动救援装置等 |
| 4 | camera machine；labels controller, traction-motor, governor | 每部电梯要有运营许可证，每月保养，每年检验和测试 |

- **细看**：`The 1854 demonstration`（Britannica、Guinness、专利 US 31,128；工具是斧还是刀各来源不一，不写；"All safe"不引原话，0.1-11）；`Electric lifts`（F-32）；`Every floor`（LUP 细节：费用由业主在完工后才付等，P5；约 140 座无法加装，P7）；`Who looks after HDB lifts`（市镇会负责保养，BCA 管许可与检验；2025-10-01 新条例，F-25）；`Sunlight for lifts`（屋顶太阳能板为电梯等公共设施供电，链接 `energy-conversion/energy-from-the-sun`）。
- **本章索引**：safety-gear, car-rails, landing-doors-1, landing-doors-2, landing-doors-12, light-curtain, car-apron, ard, controller, traction-motor, governor
- **名词首现**：lift-upgrading-programme、permit-to-operate

### 6.8 名词表 `glossary.json`（候选 18 个，保留 14–16 个；正文用不到的删）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| lift-car | Lift car / 轿厢 | 乘客站的箱子，挂在钢丝绳上 | counterweight |
| lift-shaft | Lift shaft / 井道 | 轿厢和对重上下走的竖井 | — |
| counterweight | Counterweight / 对重 | 挂在钢丝绳另一端、与轿厢互相平衡的铁块 | counterweight-balance |
| counterweight-balance | Balance / 平衡系数 | 对重比轿厢多出的重量占满载的几成（约 40–50 %） | counterweight |
| traction-sheave | Traction sheave / 曳引轮 | 带槽的轮子，靠摩擦带动钢丝绳 | traction |
| traction | Traction / 曳引 | 靠绳与轮槽之间的摩擦来带动 | — |
| steel-rope | Steel wire rope / 钢丝绳 | 许多钢丝绞成的绳 | — |
| machine-room | Machine room / 机房 | 井道顶上放曳引机和控制柜的房间 | — |
| brake | Brake / 制动器 | 断电时由弹簧压紧、让曳引轮停住的装置 | — |
| overspeed-governor | Overspeed governor / 限速器 | 量轿厢速度、太快时卡住限速器绳的装置 | safety-gear |
| safety-gear | Safety gear / 安全钳 | 被提起时用楔块夹住导轨让轿厢停下 | overspeed-governor |
| buffer | Buffer / 缓冲器 | 井底吸收冲击的最后一道保护 | — |
| landing-door | Landing door / 层门 | 每层井道口的门，由轿厢的门刀带开 | door-interlock |
| door-interlock | Door interlock / 门锁 | 锁住层门、锁好才让电梯走的机关 | landing-door |
| light-curtain | Light curtain / 光幕 | 门边的一排红外光束，挡住就重开门 | — |
| regenerative-drive | Regenerative drive / 能量回馈 | 重的一边往下走时把电动机当发电机，把电送回去 | — |
| automatic-rescue-device | Automatic rescue device / 自动救援装置 | 停电时用电池把轿厢开到最近一层 | — |
| lift-upgrading-programme | Lift Upgrading Programme / 电梯翻新计划 | 2001 年起让老组屋电梯每层都停的 HDB 计划 | — |

---

## 7. HUD

### 7.1 标题块与规格行

- DOC-ID 自动：`ATL-HDBLIFT-01…07`。标题 EN "How a Lift in an HDB Block Works" / ZH "组屋电梯是怎样工作的"；副标题 "A traction lift with a counterweight, generic design study" / "带对重的曳引电梯 · 通用设计研究"。`shortTitle`：HDB lift / 组屋电梯。`illustration: hdb-lift`。
- `note`：见 D-6。
- 规格行（≤ 4，tag）：

| key EN / ZH | value | tag |
|---|---|---|
| Type / 类型 | TRACTION · MACHINE ROOM · 1:1 | design |
| Load / 载重 | 1,000 kg · 13 persons | design |
| Speed / 速度 | 1.75 m/s · 12 floors | design |
| Counterweight / 对重 | 1,550 kg · 45 % | design |

### 7.2 右上卡（零件链路）

列 = 01 SHAFT · 02 CAR · 03 MACHINE · 04 ROPES；05 无零件不出列。零件 EN 名 ≤ 14 字符：Shaft walls、Pit、Front wall、Doors L1、Doors L2、Doors L12、Door locks、Call buttons、Shaft lights；Car frame、Car、Car doors、Door operator、Door vane、Light curtain、Car panel、Safety gear、Guide shoes、Car apron、Load；Motor、Sheave、Brake、Deflector、Controller、Rescue unit、Governor、Machine room；Car ropes、CW ropes、Counterweight、Car rails、CW rails、Governor rope、Tension pulley、Car buffer、CW buffer、Travel cable。

`connects` 主链：counterweight → hoist-ropes-cw → deflector-sheave → traction-sheave → hoist-ropes-car → car-frame → car-cabin；安全链：governor → governor-rope → safety-gear → car-rails。运转时按 `trip` 的方向沿主链着色步进（引擎现有行为：按流的 `parts`；本主题流不经过绳，**步进只覆盖 controller → traction-motor**——可接受，写进已知差距）。

### 7.3 PLATE 块

- 立面：`views.section.plane = "xy"`（正立面：轿厢、对重、两段绳、曳引轮与导向轮左右排开，是井道最主要的关系）；REFERENCE 用同一立面。
- 模拟读数 `telemetry`（≤ 6，SIM；第 03 章跟随 sim 输出，`follow`、`lag: 0`）：

| key EN / ZH | unit | idle | run | lag（s） | decimals |
|---|---|---|---|---|---|
| Floor / 楼层 | — | 1 | 跟 `stop`（默认 1） | 0 | 0 |
| Speed / 速度 | m/s | 0 | 1.75 | 3 | 2 |
| Sheave / 曳引轮 | rpm | 0 | 70 | 3 | 0 |
| Motor / 电动机 | kW | 0 | 11.8（满载上行；第 03 章跟 `motor-kw`） | 2 | 1 |
| Imbalance / 不平衡 | kg | −450（空梯） | 跟 `imbalance-kg` | 0 | 0 |
| Brake / 制动器 | — | CLOSED / 合上 | OPEN / 松开 | 0.5 | — |

PLATE 读数里没有"高度 m"一行：真实高度（0 / 2.8 / 30.8 m）由试一试输出 `height-m` 给，只在第 03 章卡片上显示，避免和画面上的 7.2 m 混淆。

### 7.4 镜头预设（≤ 6；起点值，镜头轮调）

| # | id | label | position | target | fov | 用途 |
|---|---|---|---|---|---|---|
| 1 | `hero` | HERO | [9.5, 8.0, 15.0] | [0, 5.5, 0] | 30 | 3/4 前右上，整座井道 + 机房；封面构图 |
| 2 | `landing` | LANDING | [1.8, 1.6, 5.0] | [0.2, 1.2, 0.9] | 32 | 1 楼走廊看层门与按钮 |
| 3 | `shaft` | SHAFT | [7.5, 5.0, 10.0] | [−0.2, 4.6, 0] | 28 | 井道 X-RAY：轿厢、对重、两段绳 |
| 4 | `machine` | MACHINE | [3.6, 14.4, 4.2] | [0.1, 11.9, −0.1] | 32 | 机房近景：曳引机、导向轮、控制柜、限速器 |
| 5 | `safety` | SAFETY | [3.0, 0.8, 3.2] | [−0.3, 0.2, 0] | 30 | 轿底安全钳、导轨、限速器绳夹（轿厢在 1 楼） |
| 6 | `doorway` | DOORWAY | [2.4, 1.4, 2.6] | [0.2, 1.1, 0.8] | 30 | 门口剖面：门刀、门锁、光幕 |

`pit` 镜头（第 04 章拍 4）用拍内写的显式镜头，不占预设位。`views.cuts`：`doorway` = normal [−1, 0, 0]、offset 0.20（沿门洞中线竖切，看层门 / 轿门 / 门刀 / 门锁的前后关系），label "Doorway section / 门口剖面"。`views.cutaway`（C 键默认）= `doorway`。`views.cover`：hero 稍拉近、HUD 关、轿厢在 2 楼（pose `car-at-2`），1 楼层门关。

### 7.5 模式组合

| 组合 | 行为 |
|---|---|
| X-RAY + FLOW | 主要读法：井道墙、前墙、机房、轿厢外壳透明，轿厢、对重、绳、导轨、安全装置都可见 |
| CUTAWAY（doorway）+ FLOW | 只切井道前墙、层门、轿厢；`call-signal`、`machine-heat` `clip: false` |
| EXPLODED + FLOW | 引擎禁用 |
| `trip` 运转 + `stop ≠ 1` | `trip` 不播（`enabled` 条件，§5.3）；`sheave-trip` 同条件也不播，避免"轮在转、轿厢不动" |
| hide + EXPLODED | 隐藏件拆开时仍隐藏 |

---

## 8. 试一试（第 03 章，复用 `sim.kind: "table"`）

**问题**：轿厢载重不同、有没有对重，上行一趟时电动机要出多大力、用多少电？什么时候电动机反而在"拉住"重的一边？

**模型**（全部是 docs/06「试一试 · 表」的现有契约，不新增 kind）：

```jsonc
"sim": {
  "kind": "table",
  "controls": [
    { "id": "stop", "kind": "choice", "default": "1", "options": [ { "id": "1" }, { "id": "2" }, { "id": "12" } ] },          // 楼层（摆位置）
    { "id": "load", "kind": "step", "values": [0, 250, 500, 750, 1000], "default": 0, "unit": "kg" },
    { "id": "counterweight", "kind": "choice", "default": "with", "options": [ { "id": "with" }, { "id": "without" } ] },
    { "id": "direction", "kind": "choice", "default": "up", "options": [ { "id": "up" }, { "id": "down" } ] }
  ],
  "outputs": [
    { "id": "height-m", "unit": "m", "decimals": 1, "tag": "sim" },
    { "id": "imbalance-kg", "unit": "kg", "decimals": 0, "tag": "sim" },
    { "id": "motor-kw", "unit": "kW", "decimals": 1, "tag": "sim" },
    { "id": "trip-wh", "unit": "Wh", "decimals": 0, "tag": "sim" },
    { "id": "back-wh", "unit": "Wh", "decimals": 0, "tag": "sim" },
    { "id": "role", "kind": "state", "states": { "lifts": {…}, "holds-back": {…} } }    // "电动机提起重的一边" / "重的一边往下走，电动机拉住它"
  ],
  "table": { "experiments": {
    "position": { "keys": ["stop"], "rows": [ /* 3 行：height-m 0 / 2.8 / 30.8；source S1 */ ] },
    "balance":  { "keys": ["load", "counterweight", "direction"], "rows": [ /* 20 行 = §1.2 第 5 步全部，source S1 */ ] }
  } },
  "bind": [
    { "control": "stop", "part": [/* car 组、绳、对重、随行电缆 */], "pose": { "1": null, "2": "car-at-2", "12": "car-at-12" } },
    { "control": "load", "part": "load-blocks", "count": { "per": 250 } },
    { "control": "counterweight", "part": ["counterweight", "hoist-ropes-cw", "deflector-sheave"], "visible": { "eq": "with" } },
    { "output": "role", "flow": "power-back", "visible": { "eq": "holds-back" } },
    { "output": "role", "flow": "power-in", "visible": { "eq": "lifts" } },
    { "control": "stop", "animation": ["trip", "sheave-trip", "governor-trip-spin", "brake-hold"], "enabled": { "eq": "1" } }
  ]
}
```

- 表的数（全部 SIM，引 S1 设计研究）：见 §1.2 第 5 步；下行 10 行按同一算式（单测从 S1 参数重算，±1 个末位）。"拉住"时 `motor-kw` 记 0、`back-wh` 记可回馈值，卡片同时观察 `motor-kw`、`trip-wh`、`back-wh`、`role`（≤ 5，T6）。
- 卡片：`try.vary: [load, counterweight]`；`keep: [direction]`（上行）、`also: [direction]`（读者可以自己换下行）；`observe: [motor-kw, trip-wh, role]`；先猜后看：`start {load: 1000, counterweight: with}` → `change {counterweight: without}`，问"电动机要出的力会怎样"（变大）；`record: { chart: { y: "motor-kw" } }`（载重是步进 → 折线图；有 / 无对重两条线靠"条件已改变"规则分两次记——**待核**：表下小图能否同时画两组；不能就只记"有对重"一组，"无对重"放先猜后看）。
- 绑定的可视结果：载重方块数 = 载重 ÷ 250；去掉对重时对重、对重侧绳、导向轮隐藏（**不画**"没有对重时绳怎样"，字幕写"假设"）；`role = holds-back` 时回馈流可见。
- 拍里写清楚：这是理想模型（不计绳重、摩擦、加减速、待机用电）；真实电梯的数字取决于设计，结论"有对重时电动机只补差、约四分之一"是方向正确的模型结论，不是某部电梯的实测。

---

## 9. 引擎缺口（已查代码与 docs/06：`sim-schema.ts` 的 `SIM_KINDS`、`table-schema.ts`、docs/06「绑定」「变换顺序」「sequence」「poses」）

**必需：无**。本主题所需的 primitive（`lathe`、`extrude`、`tube`、`coil`、`grille`、`bevelBox`、`repeat`、`bilateral`）、`poses`（offset + scale）、`sequence`（offset / scale / rotation keys、loop）、命名剖切 `views.cuts`、flow `stops / ends / paths / clip`、sim `table` + `record.chart`、bind `pose / visible / count / glow / enabled` 都已存在。

| 编号 | 优先级 | 现状 | 最小方案 | 退路 |
|---|---|---|---|---|
| E-HL1 | 应该（验证） | `sequence` 的 offset / scale 叠在姿态之后；bind `enabled` 让动画缓停 | 施工前用夹具验证：① 姿态 `scale` 绕零件中心缩放，配 offset 后绳两端位置正确；② `enabled` 条件为假时 `trip` 停在**第一键**（轿厢回到姿态位置），不是停在半路；③ 同一零件既有 bind pose 又有 sequence 时不报冲突 | ② 不成立：`trip` 改为**只在没有试一试卡片的章**（第 02 章）播，第 03 章 RUN 只开流、不播 `trip`；③ 冲突：`trip` 拆出独立的"行程章"不用 bind pose |
| E-HL2 | 可选 | 绳是 `cylinder`，靠姿态 scale 伸缩；钢丝绳截面会随 scale y 不变（只缩 y），视觉上没问题 | 无 | — |
| E-HL3 | 可选 | 右上卡运转步进只跟流的 `parts`；绳 / 对重链不在任何流里 | 不改引擎：接受步进只覆盖 controller → motor | 加一条极淡的 `rope-path` 流（固定在曳引轮与导向轮之间的那一小段绳上，长度不变），parts 列主链；+1 次绘制 |
| E-HL4 | 可选 | 召唤按钮、操纵盘无文字（D-9）；方向用小三角凸起 | 无 | — |

施工前三条验证结论写进 §15 施工记录。

---

## 10. 性能预算（对照 `modelling-runbook.md` §7 与 docs/08 §4）

| 项 | 目标 | 本主题估计 | 说明 |
|---|---|---|---|
| 绘制调用（静止） | < 50 | 约 47 | 38 零件中双材质槽约 9 个（轿厢、门机、操纵盘、曳引机、制动器、限速器、对重、缓冲器 ×2）→ 约 47；投影只给井道墙、机房、轿厢、对重（4 次）→ **约 51，压线**；先合并同材质 extra（层门锁并入层门、导靴并入轿架） |
| 绘制调用（运转） | < 60（上限 100） | 约 54 | + 流 3（power-in / back 互斥 + heat + 偶尔 signal） |
| 三角形 | < 0.3 M（上限 1.5 M） | 约 0.10–0.15 M | 曳引轮 / 导向轮 / 限速器 lathe 48 段 + 6 道槽；导轨 extrude 两段 × 4 根；铁块 16 份 repeat；光束 16 根低段数 cylinder |
| GLB | 0 | 0 | 全程序化 |
| parts.json | ≤ 120 KB | 约 60–80 KB | 姿态 3 + 5 个、表 23 行 |
| 首屏 | 不新增依赖 | 0 | `table` 已在 space-scene chunk |

降开销顺序（runbook §7）：合并 extra → 关投影 → lathe 48 → 32 → 删 §3.2 的删减顺序件。**不**先删安全钳、限速器、门刀、门锁这些 Tier-1 件。验证：`pnpm shoot hdb-lift --perf --gpu` 记静止 / FLOW / X-RAY + FLOW 三组。

**Tier-1（一眼能认，R2 必须对）**：① 竖长井道 + 楼顶机房 + 底坑的整体比例（省略带读得出是"省略"）；② 轿厢与对重挂在同一组绳的两端、绳绕过曳引轮与导向轮；③ 曳引轮上一排平行的绳槽与绳；④ 轿厢、对重各自的一对 T 形导轨；⑤ 轿底安全钳骑在导轨上、限速器绳闭环连到它；⑥ 门口的两道门（层门 / 轿门）与门刀；⑦ 底坑里两只缓冲器。

---

## 11. 参考图需求（`scripts/geo/hdb-lift/refs/`，gitignore，不发布、不当贴图）

本轮**不下载**。施工时按下表找，逐张在 §15 记文件名、来源页、许可、看什么。只用公有领域或 CC（Commons 页抄许可原文）；**美国专利附图是公有领域**，内部结构首选。专利号施工时检索后再填，**不凭记忆预填**（例外：US 31,128 已在本轮核到）。**不用任何品牌的宣传图**；Commons 照片里有品牌标识的只看比例。文件名 `NN-<看什么>-<来源>.<ext>`。

| # | 要找什么 | 去哪里找（检索词） | 许可要求 | 看什么 |
|---|---|---|---|---|
| R1 | 组屋屋顶电梯机房外观、组屋电梯厅 | Commons "HDB flat rooftop"、"HDB lift lobby"；NLB PictureSG（**只看**，许可多为保留权利） | CC / PD；PictureSG 不下载 | 机房体量、与屋面的关系 |
| R2 | 曳引电梯整体剖面（机房、井道、底坑） | 专利 "traction elevator machine room hoistway counterweight"；Commons "Elevator diagram" | PD / CC | 各大件相对位置、底坑深度、顶层高度 |
| R3 | 层门、门洞、召唤按钮面板 | Commons "elevator landing door" | CC | 门洞比例、门槛、按钮位置 |
| R4 | 门刀与层门门锁 | 专利 "elevator door coupler vane landing door lock rollers" | PD | 门刀形状、滚轮位置、锁钩 |
| R5 | 层门锁触点 | 专利 "elevator landing door interlock contact" | PD | 钩子与触点 |
| R6 | 轿架、轿厢、导靴、随行电缆 | 专利 "elevator car sling frame guide shoe" | PD | 上下梁、立柱、绳头组合 |
| R7 | 轿内操纵盘（只看布局） | Commons "elevator car operating panel" | CC，**去掉品牌与文字** | 按钮排列 |
| R8 | 门机 | 专利 "elevator door operator belt" | PD | 门挂轮、皮带、电机位置 |
| R9 | 光幕 | Commons "elevator light curtain"；专利 "elevator door light curtain" | CC / PD | 两侧竖条、光束数量量级 |
| R10 | 限速器与安全钳系统图 | 专利 "elevator overspeed governor safety gear rope" | PD | 限速器绳闭环、绳夹与拉杆 |
| R11 | 渐进式安全钳剖面 | 专利 "progressive safety gear wedge guide rail elevator" | PD | 楔块、钳体、弹簧 |
| R12 | 轿厢护脚板 | 专利或 Commons "elevator toe guard" | PD / CC | 位置、长度 |
| R13 | 无齿轮曳引机 + 制动器 | Commons "gearless traction machine"、"elevator machine room"；专利 "gearless elevator machine brake" | CC / PD | 机壳比例、制动器位置 |
| R14 | 曳引轮绳槽与绕绳（含导向轮） | 专利 "traction sheave groove elevator deflector sheave" | PD | 槽形、绳数、导向轮距离 |
| R15 | 电梯制动器（鼓式 / 盘式） | 专利 "elevator machine brake spring electromagnet" | PD | 两组制动臂 |
| R16 | 控制柜、救援装置 | Commons "elevator controller cabinet" | CC | 体量 |
| R17 | 限速器与张紧轮 | Commons "elevator governor"；专利 "governor tension sheave pit" | CC / PD | 轮径、飞锤 |
| R18 | 对重框与铁块 | Commons "elevator counterweight" | CC | 块厚、框、导靴 |
| R19 | T 形导轨截面 | ISO 7465 截面示意（只看形状，不复制标准图）；Commons "elevator guide rail" | CC | 翼缘与腹板比例 |
| R20 | 油压缓冲器 | Commons "elevator buffer pit"；专利 "elevator oil buffer" | CC / PD | 缸体、柱塞、底座 |
| R21 | 奥的斯安全装置 | Google Patents US31128 附图（PD）；Smithsonian Open Access（CC0）相关藏品 | PD / CC0 | 卡爪、齿条导轨、弹簧（插图 I-2 的事实约束） |

覆盖要求：整体剖面、正 / 侧轮廓、每个 Tier-1 件的近景。看不到的内部结构（控制柜、门锁触点内部）写明用什么推断。

---

## 12. 插图需求（外包给 Codex；Claude 逐张验收）

**通用规则**（BRIEF2 与 docs/69 §4.2，全部适用）：fine graphite pencil 19th-century scientific / engineering plate；细交叉排线与点画；**严格中性灰**（R = G = B）；**透明 PNG**；主体居中约占画面 85 %，四周留白，不触边；**NO text, letters, numerals, floor numbers, labels, logos, brand marks, displays with digits, arrows, flags, paper texture, background, frame, ground shadow**；**NO people, figures, hands, silhouettes**；不画任何真实品牌的外形特征；不画坠落、断绳、事故。交付：`art/planned/hdb-lift/` 下原图 + `manifest.jsonl`（`{slug, kind, file, chapterIdea, subject, checks, tries}`）+ 420 px 宽预览 + cinema 反相模拟图；验收不合格最多重画 4 次。章图显示约 420 px 宽：主体 ≥ 画框 60 %，关键部件 ≥ 40 px。

| # | 文件 | 类型 / 尺寸 | 用在 | 画什么 | 事实约束（逐条验收） | 不许出现 | 方法 |
|---|---|---|---|---|---|---|---|
| I-1 | `hdb-lift.png` | 封面 1024 × 1024 | 主题卡、第 01 章 | 一部曳引电梯的竖向剖视：顶上机房里的曳引机（扁圆电动机 + 带槽轮）与导向轮，钢丝绳两端分别挂轿厢（约在画面中下部）和对重（约在中上部），轿厢与对重各有一对导轨；下方底坑两只缓冲器；中间楼层用技术图断裂线省略 | ① 恰好一个轿厢、一个对重，二者高度明显不同；② 绳从轿厢上梁向上绕过带槽轮、再经第二只轮下到对重；③ 可数的平行钢丝绳 4–6 根（写进 checks 的确切数）；④ 轿厢与对重各两根导轨；⑤ 底坑两只缓冲器分别在轿厢与对重正下方；⑥ 有断裂线、无楼层数字 | 人、文字、楼号、按钮上的字、品牌、显示屏、地面阴影、背景楼景 | AI，以 R2、R13 的公有领域图为构图依据 |
| I-2 | `hdb-lift-otis-1854.png` | 章图 1536 × 1152 | 第 07 章 | 1850 年代起重平台安全装置的工程图式描绘：一个木制平台挂在吊绳下，平台上方一根弓形的板簧，两端连着卡爪，卡爪对着两侧立柱上的竖直齿条；**画吊绳完好、平台静止**（不画断绳瞬间），一侧附一幅卡爪咬入齿条的局部放大圆 | ① 两侧立柱都有竖直齿条；② 板簧在平台顶上、两端连卡爪；③ 局部放大圆里卡爪尖嵌在齿间；④ 平台上空无一物（无人、无货）；⑤ 立柱顶有滑轮与吊绳 | 人、文字、日期、观众、展厅、旗帜、斧头、断绳 | AI，按 US 31,128 附图（R21，PD）的机构取形，不描摹 |
| I-3 | `hdb-lift-safety-gear.png` | 章图 1536 × 1152 | 第 04 章 | 渐进式安全钳与导轨的**剖面**：一段 T 形导轨竖立在中间，钳体骑在导轨两侧，两块楔块在钳体的斜面里，楔块下端连提拉杆；左半边为"未动作"（楔块在下、与导轨有间隙），右半边为"动作"（楔块上移、贴紧导轨） | ① 导轨截面为 T 形；② 楔块与钳体的接触面是斜面，上窄下宽的方向与"上提夹紧"一致；③ 未动作一侧楔块与导轨之间可见间隙，动作一侧无间隙；④ 两侧对比只差楔块位置；⑤ 剖面线 45°，与 docs/08 剖切语法一致 | 文字、箭头、数字、火花、运动线 | **代码画**（`scripts/figures/hdb-lift-safety-gear.ts`，SVG 几何 + 铅笔质感，docs/69 §4.2-1 几何断言：间隙 > 0 / = 0、楔块斜面角一致、导轨截面比例 = §3.2 #31） |
| I-4 | `hdb-lift-every-floor.png`（★ 0.1-13 可删） | 章图 1536 × 1152 | 第 07 章 | 两座同样的 12 层板楼立面示意并排：左边电梯厅只在部分楼层有门洞（按 F-33 核实后的停站做法），右边每层都有门洞；楼体只画轮廓、走廊与电梯井 | ① 两座楼层数相同（12）；② 左楼电梯门洞的楼层分布与 F-33 核实的做法一致（写进 checks）；③ 右楼每层一个门洞；④ 两楼其余部分一模一样 | 文字、楼号、人、树、车、阴影、背景 | **代码画**（`scripts/figures/hdb-lift-every-floor.ts`，几何断言：门洞计数）；F-33 核不到就删此图 |

验收标准（每张）：manifest 的 checks 3–6 条逐条放大核对；R=G=B 逐像素检查；透明边缘干净；420 px 预览可读；cinema 反相模拟下意思不颠倒；alt / caption 与图一致。图注草稿：

| 文件 | 图注 EN / ZH |
|---|---|
| I-1 | A traction lift: the car and the counterweight hang from the same steel ropes over a grooved wheel in the machine room. / 曳引电梯：轿厢和对重挂在同一组钢丝绳两端，绳绕过机房里带槽的轮子。 |
| I-2 | The idea Otis showed in 1854: if the rope goes slack, a spring pushes catches into teeth on the guide posts. / 奥的斯 1854 年展示的想法：吊绳一松，弹簧就把卡爪推进导柱上的齿里。 |
| I-3 | Safety gear on its guide rail: free (left) and gripping (right) after the wedges are pulled up. / 导轨上的安全钳：左边是松开的，右边是楔块被提起后夹紧导轨。 |
| I-4 | Before and after lift upgrading: lift stops on some floors only, and on every floor. / 电梯翻新前后：只在部分楼层停，和每层都停。 |

---

## 13. 写法与用词表

按 `writing-rules.md`；本主题的约定（EN / ZH 成对）：

| 用 EN | 用 ZH | 不用 | 理由 |
|---|---|---|---|
| lift | 电梯 | elevator（EN 主线） | 新加坡英语用 lift；elevator 只在历史段引原名时 |
| lift car / car | 轿厢 | 电梯箱、吊箱 | 行业与 BCA 用词 |
| lift shaft / shaft | 井道 | 电梯井（正文第二次以后可用） | 首现写"井道（电梯井）" |
| counterweight | 对重 | 配重、平衡锤 | 国标与行业用词；首现写"对重（配重）"一次 |
| steel ropes | 钢丝绳 | 钢缆、电缆、绳索 | `forces` 用了"钢缆"：首现写"钢丝绳（也叫钢缆）"，之后统一 |
| traction sheave | 曳引轮 | 滑轮、绞盘 | 它不是滑轮组、也不卷绳（D-3 ①、D-11） |
| deflector sheave | 导向轮 | 滑轮 | 同上 |
| motor | 电动机 | 马达 | 与 `energy-conversion` 一致 |
| brake | 制动器 | 刹车（正文可用"刹车"作比喻，一次） | 部件名用制动器 |
| overspeed governor | 限速器 | 调速器 | 它不调速，只在超速时动作 |
| safety gear | 安全钳 | 安全刹、防坠器 | 行业用词 |
| buffer | 缓冲器 | 弹簧垫 | — |
| landing door | 层门 | 厅门、外门 | 首现写"层门（每层的门）" |
| car door | 轿门 | 内门 | — |
| door vane | 门刀 | 门叉 | — |
| door interlock | 门锁 | 联锁 | 首现解释"锁住层门、锁好才能走" |
| light curtain | 光幕 | 红外线门、感应门 | — |
| the motor holds back the heavier side | 电动机拉住重的一边 | 电动机"刹车"、电梯"自己掉下去" | 精确且不吓人 |
| send energy back | 把电送回去 | "发电""免费的电" | 只是回收一部分 |
| about a quarter (in this simulation) | 约四分之一（在这个模拟里） | "省 75 %"当成事实 | SIM 纪律 |
| stops at every floor | 每层都停 | "每层直达"（MND 用语，可在引用时用） | 读者易懂 |
| Lift Upgrading Programme (LUP) | 电梯翻新计划 | 电梯提升计划 | 首现 EN 全称 + 缩写；ZH **待核**本地常用译名，候选"电梯翻新计划"，在 SOURCES 记依据 |
| Lift Enhancement Programme (LEP) | 电梯改进计划 | — | 同上，待核译名 |
| Permit to Operate | 运营许可证 | 准证 | 待核本地译名 |

- 不拟人（"电梯累了""对重帮忙"→"对重平衡轿厢"）、不喊"小朋友"、不用感叹号和问句标题；不推荐品牌、不比较产品。
- 安全：不写"不会出事""百分之百安全"；写"几道机关各管各的、每年要检验"。事故不写。被困、挡门只用官方建议。
- 历史：客观、全球视角；奥的斯之前的起重机由来已久、电力电梯来自德国——不写成某一国的发明叙事；不写"美国人发明了电梯"。
- 中文引号只用"“ ”"（`forces`、`energy-conversion` 的测试规则同样适用）；UI 不出现年级。

---

## 14. 来源计划（P# → 施工时 S#；≥ 25 条，逐条读原文）

| P# | 内容 | 候选来源 | 用于 |
|---|---|---|---|
| P1 | 本设计研究（设计值与模拟运行点） | 本 spec §1.2、§8 | 规格行、PLATE、细看、试一试 |
| P2 | 课纲 | MOE 2023 Primary Science Syllabus（P6 Forces pp. 63–66；P6 Energy Conversion p. 80） | §1.3 |
| P3 | 已有主题的已核来源 | `forces/data/sources.json`（重力、摩擦；Otis 电梯条目）、`energy-conversion/data/sources.json`（对重 F-32） | 互链处 |
| P4 | 每人 75 kg | EN 81-20:2020 表 6（付费；读二手：电梯手册或 CIBSE Guide D） | F-2、F-3 |
| P5 | LUP | HDB "Lift Upgrading Programme (LUP)" 页；HDB LUP FAQ PDF | F-29、F-33 |
| P6 | LUP 进展 | MND 书面答复（2024 年 2 月：约 99 % 每层直达；5,000 多座） | F-29 |
| P7 | 无法加装的楼 | MND 书面答复（约 150 座 → 约 140 座，2023-01） | 第 07 章细看 |
| P8 | MRL 与机房 | MND 2006 年书面答复（NAS 档案 20060303975） | 0.1-1 |
| P9 | MRL 工期与成本 | TODAY 2007-07-25 报道（转载页只作线索，**找 NLB NewspaperSG 原报**） | 0.1-1 |
| P10 | LUP 中观光梯 / MRL 数量 | MND 书面答复（创新技术提供电梯通达） | 0.1-1 |
| P11 | 组屋梯载重与速度 | 二手：电梯维基（线索）；**一手待找**：HDB / 市镇会招标规格、BCA 检验报告模板（P26） | F-1–F-4 |
| P12 | 对重平衡 40–50 % | 电梯工程教科书（Barney, *Elevator Traffic Handbook*；Strakosch, *The Vertical Transportation Handbook*）；ELEVATOR WORLD 文章 | F-5–F-7 |
| P13 | 安全规范数值 | SS 550:2020（新加坡电梯规范）与 EN 81-20/-50:2020（付费；读条款摘要或二手手册），逐条记"读的是哪一份" | F-3、F-8、F-11、F-13–F-15、F-17、F-18 |
| P14 | 能效与平衡 | ISO 25745-2 相关论文（"A study for improving the energy efficiency of lifts…"） | F-6 |
| P15 | 限速器 115 % | California Code of Regulations Title 8 §3036 | F-13 |
| P16 | LEP 内容 | HDB / MND 一手页面（施工时找）；PropertyGuru 2016-09 新闻（线索） | F-20、F-26、F-30 |
| P17 | LEP 与 BCA 建议的八项功能 | Straits Times 2016-09-17 PDF；BCA 2016 建议（施工时找 BCA 原文） | F-22、F-30 |
| P18 | UCMP / ACOP 技术要求 | BCA / CORENET "Advisory: modernization of lifts"；CORENET 2017 通函 | F-21、F-22 |
| P19 | 门保护与光幕 | BCA 2017-06-08 通函（PTO 展示与电梯技术要求） | F-18、F-20 |
| P20 | EERS | HDB 2025-02-03 新闻稿附件（已读） | F-28 |
| P21 | 固定装置法规要求 | BCA "Fixed Installations (Lifts, Escalators and MCPS) Legislations" 页 | F-23、F-24 |
| P22 | 法规生效日期 | BCA 通函（BC(FI) Regs 2025 实施；修订实施日期）；SSO S 614/2025 | F-25 |
| P23 | 2016 年旧条例 | BCA 2016-07-25 通函 | 第 07 章细看 |
| P24 | 曳引、安全回路、控制 | 电梯工程教科书（P12 同书）；CIBSE Guide D: Transportation systems in buildings | F-9、F-16、F-19、第 06 章 |
| P25 | 曳引机功率、钢丝绳破断力 | 曳引机 / 钢丝绳厂商目录的典型范围（不点名）；或 P12 教科书 | F-8、F-10 |
| P26 | 年度测试项目 | BCA "Inspection report – SS550 traction lift" 模板 PDF | F-23、P11 |
| P27 | 乘梯安全与被困建议 | BCA 乘梯安全公众指引 / 市镇会海报（施工时找原文） | 第 05、06 章细看 |
| P28 | 回馈省电试验 | 香港机电工程署 "Application of lift regenerative power" | F-28 |
| P29 | 奥的斯 | Britannica "Elisha Otis" | F-31 |
| P30 | 第一部安全电梯 | Guinness World Records "First safety elevator" | F-31 |
| P31 | 专利 | Google Patents US31128A（1861-01-15） | F-31、I-2 |
| P32 | 1857 Haughwout | NYC Landmarks Preservation Commission 指定报告（E. V. Haughwout Building） | F-31 |
| P33 | 市镇会负责保养 | Town Councils Act / MND 说明页 | 第 07 章细看 |
| P34 | 电力电梯 1880 | Siemens 历史页（"first electric elevator, Mannheim 1880"）或德国技术博物馆资料 | F-32 |
| P35 | 组屋太阳能为公共设施供电 | `energy-conversion` 已核来源（SolarNova） | 第 07 章细看 |

---

## 15. 施工顺序与验收清单

按 skill `atlas-space-topic` 的 `build-order.md`（E → D → T → B → P）：

1. **Gavin 定稿 §0.1**。
2. **E**：§9 E-HL1 三条夹具验证（用 `sample-mechanism` 或新建临时夹具，不进仓库）；结论写进本节施工记录。
3. **参考图**：§11，至少 R2、R4、R10、R11、R13、R14、R18 到位再建模。
4. **脚手架**：`pnpm tsx scripts/new-topic.ts hdb-lift --engine space-scene --subject science --title-en "How a Lift in an HDB Block Works" --title-zh "组屋电梯是怎样工作的"`。
5. **D**：R2 几何两轮并排（Tier-1 §10）+ 干涉检查（三个 `stop` 姿态各一遍、`trip` 的 0 / 3 / 8 s 三帧、拆开状态；绳端位置 ±5 mm 单测）→ R3 材质（hero-clean 当封面；混凝土与不锈钢、钢丝绳在 cinema 下要分得开）→ R4 流与动画。几何建议用生成脚本 `scripts/geo/hdb-lift/build-parts.mjs`（同 refrigerator），姿态的 scale / offset 由脚本从 §3.1 数字算出。
6. **T**：sources（逐条读原文，"待核"全部处理）→ glossary → summary / detail → 第 04 章样章先给 Gavin（安全写法最需要定调）→ 其余章。
7. **B**：31 拍；`pnpm shoot hdb-lift --beats` 0 失败、无漏标。
8. **插图**：Codex 按 §12 交付，Claude 验收入库。
9. **P**：HUD、镜头、模式组合、事实审计、代码审计。

**验收清单**（`acceptance.md` 全部 + 本主题另加）：

- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`（先 build）；`pnpm shoot hdb-lift --layout --keys --beats` 截图逐张看过（paper + cinema、1920 × 1080、1440、390 宽）。
- [ ] 7 章 31 拍；每拍字幕说"模型上显示什么"；EN 字幕 ≤ 45 词、无缩写符号（写 "kilowatts"、"metres per second"）；labels ≤ 6 且可见；每章 `index` 覆盖正文和拍里提到的全部零件。
- [ ] 必须讲对的五处（D-3）在正文、字幕、零件 detail 三处一致：摩擦带绳不卷绳；对重 = 轿厢 + 约一半载重、电动机补差、空梯上行是对重在往下走；制动器断电合上；限速器 + 安全钳是机械的；层门只能由停在本层的轿厢开、门没锁好不能走。
- [ ] §1.2 模拟运行点所有数字在 PLATE、试一试、细看、规格行之间一致；单测从 S1 参数重算 §8 表的 23 行（±1 末位）；满载上行 11.8 kW / 45.0 kW、70 rpm、0.37 m 三处一致。
- [ ] 试一试：20 + 3 行表完整（`tableIssues` 绿）；载重方块数 = 载重 ÷ 250；去对重时对重、对重侧绳、导向轮隐藏；`role` 与回馈流同步；`stop` 三个姿态下绳上端在曳引轮切点、下端在绳头（±5 mm）；`stop ≠ 1` 时 `trip` 不播。
- [ ] 所有 DESIGN 值落在有来源的 TYPICAL 内；"待核"项全部核过或删除；来源冲突并列。
- [ ] 互链 8 处都指向已存在的章（§1.3），EN、ZH 各一次；不重复 `forces` 的"电梯里的力"、`energy-conversion` 的势能讲解。
- [ ] 课纲：`moe` 页码核过；牛顿、焦耳、离心、机械利益只在细看并标"中学会学到"；主线无"滑轮"。
- [ ] 安全写法：无事故叙事、无坠落 / 断绳画面、无"绝对安全"；被困与挡门的建议是官方原文的转述并带来源；`grep` 正文与字幕无"掉下去""坠落"（细看 `What if the ropes failed` 一处除外，措辞经 Gavin 看过）。
- [ ] 无品牌、型号、楼号、按钮文字；轿厢里无人形。
- [ ] Tier-1 七项在 R2 并排图里逐项对上；干涉检查结果记入施工记录。
- [ ] 性能：静止 < 50（压线时按 §10 降），运转 < 60，三角形 < 0.3 M；FLOW 前后增幅 < 10。
- [ ] 插图 4 张（或 3 张）按 §12 验收；I-3、I-4 有几何断言脚本。
- [ ] 触控 ≥ 44 px；快捷键与按钮共用 store；无 console 噪音、无 TODO。

---

## 16. 已知风险（引擎与示意对本主题的限制）

| 风险 | 影响 | 处理 |
|---|---|---|
| 楼高压缩（省略带） | 画面行程 7.2 m ≠ 真实 30.8 m；轿厢侧绳在 1 楼时要穿过省略带 | D-6 note；PLATE 不显示高度，试一试 `height-m` 给真实值；绳穿断口是技术图惯例，细看一句 |
| 钢丝绳、限速器绳画粗 | 真实 10 mm 在 15 m 的模型里看不见 | detail 写真实值 |
| 制动器张开量放大 | 真实间隙不到 1 mm | 画面放大 3×，note 与 detail 写明 |
| 轿厢运动只有三站 + 一段循环动画 | 读者不能拖着轿厢走任意层 | 三站足够讲平衡；任意层需要新的连续控件 + 绳伸缩绑定（v2，不做） |
| `trip` 与 bind 姿态叠加 | 可能出现"停在半路" | §9 E-HL1 先验证；退路已写 |
| 无钢丝绳粒子 | 运转时绳"在走"只能靠曳引轮转动和轿厢移动来读 | 曳引轮与轿厢同步（§5.3），足够 |
| 右上卡运转步进不沿绳链 | 卡片只亮 controller → motor | E-HL3 可选 |
| 单一剖切面 | 门口剖面看不到机房 | 机房靠 X-RAY 与 `machine` 镜头 |
| 组屋电梯的一手规格未找到 | F-1–F-5 的"典型"可能偏差 | §0.1-3；找不到一手数字就把规格行改为 DESIGN 并在细看写"典型约" |
| 0.1-1 的"组屋通常"未证实 | 正文措辞风险 | 写"许多组屋"，找到一手来源再加强 |
| 安全题材的情绪 | 读者（含孩子）可能害怕 | D-12 写法、第 04 章样章先给 Gavin |

---

## 17. 施工记录

（空，施工后补：§0.1 的答复、E-HL1 验证结论、与 §3–§5 的差异、参考图表、验收数字。）
