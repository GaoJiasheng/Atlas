# ARCHETYPES — 主体原型

选最接近的一个，必要时混用。原型决定：分区方式、模式、镜头、右上卡片、底部三面板、标注清单。

## 目录

1. Rotating machinery / process equipment（例：MHI 燃气轮机）
2. Enclosed equipment / product（例：Eaton/Boyd ROL4000 CDU）
3. Vehicle / creature / megastructure in an environment（例：SANDWORM MK-X）
4. 混合与其他主体的映射

---

## 1. Rotating machinery / process equipment

**适用**：燃气 / 蒸汽轮机、喷气发动机、压缩机、泵、风机、减速箱、电机、发电机、离心机、反应釜。

**分区**：沿介质流向的纵向链路，01–05 编号。
例：`AIR INTAKE → AXIAL COMPRESSOR → COMBUSTION SYSTEM → TURBINE → EXHAUST`

**Tier-1 必须像**：外壳与切口形态、多级 rotor/stator 交替、主轴连续、核心过程区（燃烧筒 + transition piece）、末端大截面结构、底座 / 支架 / 主管。

**模式**：CUTAWAY（楔形 clipping 绕轴旋转 0–100%）· X-RAY · EXPLODED（沿轴分离五大模块）· FLOW（冷→热→冷却）· THERMAL · 原理模式（COMBUSTION）· START SEQUENCE · REAL SPEED · REFERENCE SECTION · PRESENTATION。

**镜头**：HERO · CUTAWAY（正侧剖面）· 各子系统近景（COMPRESSOR / COMBUSTOR / TURBINE / EXHAUST）· EXPLODED（略高）· ORBIT。

**右上卡片**：THERMODYNAMIC FLOW 过程链 + 温度色带。
**底部三面板**：CORE ARCHITECTURE 纵剖面（01–05）· STAGE DETAIL（rotor/stator 叶栅 + 逐级叶高柱图）· CYCLE（Brayton T–s / Rankine 等，高亮当前过程）。
**标注**：每个分区 1–2 条 + 主轴 + 关键子部件（燃料总管、过渡段、各级涡轮、后轴承）。

**陷阱**：做成航空发动机（重型工业机组应有外置大型燃烧筒和巨大排气截面）；压气机与涡轮叶片复用同一 profile；叶片逐个 castShadow。

---

## 2. Enclosed equipment / product

**适用**：CDU、配电柜、UPS、储能柜、服务器、医疗设备、工业机器人控制柜、热泵、液冷机组。

**分区**：按功能模块而不是流向：外板 / 框架 / 电气控制 / 泵组 / 换热 / 管路 / 过滤…

**Tier-1 必须像**：外包络比例、框架 silhouette、前部电气模块位置、底部大件（电机 / 泵）、核心功能体（换热器）、识别度最高的管路、品牌 decal 位置。

**模式**：ENCLOSED / OPEN CHASSIS（面板铰链开合后淡出）· CUTAWAY（剖切核心部件，揭示内部通道）· FLOW（多回路严格隔离）· THERMAL · EXPLODED（面板、框架、电气、泵组、歧管、换热、管路分组）· SERVICE（点击部件聚焦 + ESC）· 概念演示（如 N+1 冗余：明确标 `CONCEPTUAL ... DEMONSTRATION`）· REFERENCE OVERLAY（photo-match）· LABELS · FACT MODE · PRESENTATION。

**镜头**：HERO · FRONT SERVICE · REAR（核心部件侧）· TOP（管路）· 下部大件近景 · FLOW CUTAWAY · CONTEXT（设备在机房 / 产线中的尺度）· ORBIT · 三个 photo-match 相机。

**右上卡片**：回路示意（一次侧 / 二次侧 → 换热器 → 负载），清楚表达不混液。
**底部三面板**：SYSTEM / LOOP ARCHITECTURE · COMPONENT ANATOMY（每行带 FACT / RECONSTRUCTION 标签）· OPERATING STATE（模拟值逐项标 SIM）。
**标注**：每个大件一条，标签尾部带来源芯片。

**额外**：场景尺度参照（1.75 m 人形剪影、机柜、1 m 比例尺）；上下文场景（同列机柜、facility headers）轻量且不抢主体。

**陷阱**：做成通用服务器机柜；把照片整张贴到盒子上；把行业规范（如 OCP Deschutes）的 BOM 写成该产品官方配置；虚构控制时序。

---

## 3. Vehicle / creature / megastructure in an environment

**适用**：概念载具、机甲、巨型生物机器、挖掘机、钻机、飞船着陆器、探测车、移动城市。

**分区**：沿身体纵向：尾部 / 动力 / 中段驱动 / 头部作业端。

**Tier-1 必须像**：整体剪影（节段数、粗细变化）、头部 / 作业端的标志性结构（放射刀齿、多层同心旋转环、钻芯、颚部）、节段间深暗缝隙内的结构、尾部收细与稳定器、材质的风化感。

**环境**：多层噪声地形 + 风蚀波纹 + 淡等高线，远处融进雾；尺度道具（前哨站、监测站、岩石、无人机）；主体与地面交互（破土粒子、翻浪、拖痕、长投影）。

**模式**：X-RAY（shader 逐像素按地形高度判断：地下半透明青色 + 菲涅尔边缘、可透过地面看到内部脊柱 / 液压杆，地上保持实体）· REFERENCE POSE（~2 s 拉直浮出地面供检视，再点恢复）· PAUSE · HIDE HUD。可加 EXPLODED（单节分解）。

**镜头**：FRONT · SIDE · AERIAL（高处俯视，看到粒子和影子）· CHASE（斜后上方跟随作业端）· 地面视角（从前哨站看）· ORBIT。镜头跟随移动主体，每个镜头下主体完整或大部分在画面内。

**右上卡片**：作业端 CROSS VIEW（同心环、刀片、刻度环、比例尺）+ 子系统清单，随动画旋转。
**左侧附加**：地形示意图（等高线 + 路线 + 实时位置标记）。
**底部三面板**：纵剖面侧视（尾→头，分区标注 + 米制比例尺）· SEGMENT DETAIL 单节爆炸图（零件编号）· 运动周期四拍（收缩 / 锚定 / 伸展 / 释放，与动画同拍高亮）。
**标注**：节段环、背部检修舱口、进 / 排气口、颚部、主掘进环、传感阵列。

**虚构参数**：给一个机构名 + 文档编号（`AEI-SNDWRM-MKX-001`），规格表数字与模型尺度一致（长度、直径、节段数和底部剖面图的比例尺对得上）。

**陷阱**：暗色科幻风；塑料感装甲；缝隙太浅看不到内部；标注压住面板。

---

## 4. 混合与映射

| 主体 | 原型 | 备注 |
|---|---|---|
| 风力发电机机舱 | 1 + 2 | 齿轮箱链路 + 机舱外壳开合 |
| 盾构机 / TBM | 1 + 3 | 刀盘与后配套链路 + 隧道环境 |
| 核聚变装置 / 托卡马克 | 1 | 环向分区代替轴向，CUTAWAY 用扇区 |
| 航天器 / 卫星 | 2 + 3 | 展开动画代替 EXPLODED，轨道环境 |
| 手表机芯 / 精密仪器 | 1 | 尺度极小：比例尺单位换成 mm，相机近景为主 |

混用时右上卡片与底部三面板仍各只有一套，选最能解释工作原理的那一个。
