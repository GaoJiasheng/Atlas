# 23 · 电路 · 内容施工 spec（v1 草案）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §2 封闭设备（手电筒）+ **"实验台"变体**（一块搭好的电路板，见 docs/22 的同类决定）。本主题的任务：**P5 学生看完能说清电路是一个电系统（电池 + 导线 + 灯泡 + 开关），只有闭合的回路才有电流，开关把回路断开；哪些材料是导体、哪些是绝缘体；电池串联的个数、灯泡串联 / 并联的个数怎样影响电流和灯的亮度；能从电路图搭电路、读电路图；知道怎样安全用电。并能读、能做"公平测试"的小实验和数据表。**

`subject: science`；对应 PSLE 2023 课纲 P5 *Electrical System*（S3 第 59 页 Standard、第 60 页 Foundation）。docs/17 §3.3 与 §6.1 的 `torch-and-circuits` brief（①手电筒拆解，②电路搭建台，要 Sim）。

本主题使用 docs/22 §4.3 定义的 **SpaceScene `sim` 扩展（E-SIM 核心 S1–S8）**，另加 `kind: 'circuit'` 模型和一张"电路图"右上卡（§4.3）。两个主题哪个先施工，哪个就带上 E-SIM 核心。正文、字幕、来源条目未经 Gavin 定稿不写（CLAUDE.md）；字幕是**草稿**。标"待核"的事实施工代理读原文核对后才能用。

结构与 docs/22 相同：§0 决策 → §1 主题与事实 → §2 写实与参考图 → §3 零件 → §4 物理与 sim → §5 章节 → §6 名词 → §7 来源 → §8 图像清单 → §9 施工 → §10 验收。

---

## 0. 决策记录（2026-10-13 起草，待 Gavin 定稿）

| # | 决定（提议） |
|---|---|
| 1 | **对象 = 两件东西**：① 一支老式**灯泡手电筒**（两节 AA 电池、尾部弹簧、侧边金属片、拨动开关、2.5 V 小灯泡、反光碗、透镜），外壳是 `shell`，X-RAY 看里面；② 一块 **400 × 300 mm 的木电路板**：三节 AA 电池盒、主开关、两个灯座（灯泡 A、B）、三个"连接开关"X / Y / Z（把两只灯泡接成单灯、串联或并联）、一对鳄鱼夹之间的"测试缺口"、带鳄鱼夹的绝缘导线；板旁有蜂鸣器、小电机（带风扇叶）、7 件测试材料、三件剖切展品（剖开的电池、剖开的灯泡、剥开的导线）。**通用设计研究**，无品牌、无文字（电池上不画 + / − 号，极性由形状——正极的凸帽——和引线标注表示）；`note`：EN "Generic design study · a school circuit board and torch · not a specific product" / ZH "通用设计研究 · 小学电路板与手电筒 · 不代表任何具体产品" |
| 2 | **引擎：SpaceScene + `sim`（`kind: 'circuit'`）**，不做 docs/03 §C 的独立 Simulation 引擎、也不做 docs/04 写的 Layer2D。理由同 docs/22 §0-2；电路的"可操作"是开关、电池个数、接法、缺口里的材料、拔掉灯泡——都是离散选择，配一个毫秒级的电路求解器（§4.2）足够 |
| 3 | **"搭电路"做到哪一步**：v1 = **搭好的板 + 可切换的槽位**（主开关、X / Y / Z、电池 1–3 节、缺口材料、A 位上放灯泡 / 蜂鸣器 / 电机、拔掉 / 装回灯泡）+ 右上角**实时电路图**；不做"从零拖元件、连线"。拖动搭建的评估见 §4.5（L，约 6–8 天，v2）。课纲的"从电路图搭电路"由"电路图 ↔ 实物"实时对应来支持：点电路图上的开关符号 = 拨实物开关 |
| 4 | **课纲边界**（S3 第 59 页原文）：电路由能源（电池）和元件（导线、灯泡、开关）组成一个电系统；闭合电路有电流；认出导体与绝缘体；从电路图搭简单电路；探究影响电流的变量——**电池个数（串联）**、**灯泡个数（串联与并联）**；价值观：节约用电、正确使用与处理电。Foundation（第 60 页）只要求灯泡串联。本主题：主线用课纲词 battery（一节 AA 就叫一个 battery）、current、closed / open circuit、series / parallel、conductor / insulator、circuit diagram；**不用 voltage / resistance / ampere 作主线概念**（细看里出现，标"中学会学"）；电子、电荷只在细看一句 |
| 5 | **必须讲对的六处**：① 灯泡要接**两根**线、电流从电池一端出发经过灯泡回到另一端（不是"一根线就够"，P12–P14 的单极模型）；② 开关在串联回路的**任何位置**都一样能断开（不是"开关要在灯前面"，顺序推理误解）；③ 串联回路里各处电流相同，电流**没有被灯泡用掉**（削弱模型误解），减少的是电池里的能量；④ 电池串联越多，电流越大、灯越亮（课纲变量）；⑤ 灯泡串联越多越暗、一个坏了全灭；并联每只与单只差不多亮、一个坏了其余照亮，但从电池取的电流加倍、电池用得更快；⑥ 金属和石墨是导体，塑料、橡胶、木、玻璃是绝缘体；**自来水能导电**（安全） |
| 6 | 章数 6（§5）：01 手电筒里面 / 02 闭合电路 / 03 导体与绝缘体 / 04 增加电池 / 05 串联与并联 / 06 安全用电。每章一个"试一试"；**不做测验** |
| 7 | **公平测试一等公民**（docs/22 §0-7 同）：第 03、04、05 章可"记一行"进数据表；每章写明改变 / 不变 / 观察的量 |
| 8 | **亮度怎么表示**：灯丝的发光强度（材质自发光）+ PLATE 读数"亮度（以'两节电池点一只灯'为 100）"，SIM。**电流读数是否用安培**：推荐 PLATE 读数写 `0.23 A`（带 SIM 芯片），主线文字只说"电流更大 / 更小"，安培在细看里解释——待 Gavin 定（§0.1-3） |
| 9 | 分区（§3.1）：01 `torch` 手电筒 / 02 `source` 电池 / 03 `board` 电路板 / 04 `loads` 用电器 / 05 `test-items` 测试材料（`card: false`）；只有流的组 `current`。右上卡在本主题是**电路图**（E-CIR C2），不是零件链路 |
| 10 | 第 06 章（安全）：**不做任何真实危险的演示**；短路只在模型里、用电池演示原理，字幕明说"不要这样做"；市电部分只用石墨插图（插座与插头剖面、发电站到家），不画触电、火灾、受伤的人 |
| 11 | 灯泡选**白炽小灯泡**（课本与 PSLE 题图仍用它；灯丝"发热发光"直观）；细看说明今天的手电筒多用 LED，回路是同一个道理 |
| 12 | 剖开的电池选**碱性 AA**（孩子手里真正用的；"内外倒置"结构：外壳是正极、中心是锌）；细看附旧式锌锰（碳性）电池的结构（课本常画的"碳棒 + 锌筒"）。待 Gavin 定（§0.1-4） |
| 13 | 单位：SI；电压 V、电流 A 只在 PLATE 读数与细看；长度 mm |

### 0.1 待 Gavin 确认

1. 同意 v1 不做"拖元件搭电路"，用槽位切换 + 实时电路图（§4.5）？
2. 同意 docs/22 §0.1-2 的试一试卡片位置（阅读面板节拍行之后）？两个主题一起定。
3. PLATE 读数写安培（`0.23 A`，SIM）还是只写相对值？推荐写安培 + 相对亮度。
4. 剖开的电池：碱性（推荐）还是课本式锌锰？
5. 第三节电池让 2.5 V 灯泡"超过额定"（亮度 220）：保留这一拍并说"真灯泡可能烧坏"（推荐，引出"灯泡坏了 = 回路断了"），还是电池最多两节？
6. 短路拍（三个连接开关全合上）：在模型里演示（推荐，字幕写"不要这样做"）还是只在细看用文字？
7. Codex 首页图版 `circuits.png` 重画（§8.1：两节电池方向画反、带 + 号文字、灯泡是家用大灯泡）。

---

### 0.1 定稿（2026-10-14，主会话按 Gavin 惯例代定）

1. 开工（与植物并行）。电路先把"试一试"扩展做进 SpaceScene（`sim` 数据段 + 控件 + 读数 + 绑定 + 公平测试表），磁以后复用；不做独立模拟引擎（docs/03 §C 作废，docs/04 同步）。
2. "试一试"卡放阅读面板节拍行之后、详情之前；docs/08 §2 规则 d 相应补一句。
3. PLATE 读数显示电流（A）和亮度（相对值 %）。
4. 剖开电池画现代碱性电池；保留第三节电池"超额定"一拍；短路在模型里演示，字幕明确"不要在家试"。
5. 自己拼电路（拖放）留 v2；v1 用可切换的插槽 + 实时电路图卡。
6. 图：首页图版与 7 张配图已入库（`public/illustrations/circuits.webp`、`figures/circuits-*.webp`）；再要图走 Codex、主会话审。

## 1. 主题、范围与事实

### 1.1 读者学到什么（P5 用词）

1. **电系统**：能源（电池）+ 元件（导线、灯泡、开关）；手电筒就是一个。
2. **闭合电路**有电流，灯才亮；任何一处断开（开关断开、夹子松开、灯泡坏了、缺口里是绝缘体）就没有电流。
3. **开关**：合上 = 闭合，断开 = 开路；串联回路里开关放在哪里都一样。
4. **导体与绝缘体**：用"测试缺口"逐一试；金属、石墨导电；塑料、橡胶、木头、玻璃不导电；导线 = 铜芯 + 塑料皮。
5. **电池个数**（串联）↑ → 电流 ↑ → 灯更亮；电池接反一节会抵消。
6. **灯泡串联**：个数 ↑ → 每只更暗；一只坏 → 全灭。**灯泡并联**：每只差不多一样亮；一只坏 → 其余还亮；电池消耗更快。
7. **电路图**：用符号画电路，从图搭电路、从电路读图（哪些开关合上哪只灯亮——PSLE 常考）。
8. **安全用电**：短路、水、破损电线、插座过载；市电 230 V 远比电池危险；节约用电（课纲价值观）。
9. 做法：公平测试与数据表。

### 1.2 对象

- **手电筒**（板左侧平放，长 160 mm、Ø 35 mm）：外壳（`shell`）里两节 AA 头尾相接；尾盖里一根锥形弹簧压住后面电池的负极；一条黄铜金属片沿侧壁从尾部通到前面的开关；拨动开关推上时，金属片碰到灯座的接触片；灯泡装在抛物面反光碗中央，前面是透镜。回路：电池正极凸帽 → 灯泡底部中心触点 → 灯丝 → 灯泡螺口 → 灯座 → 开关 → 金属片 → 弹簧 → 电池负极。
- **电路板**（400 × 300 × 12 mm 木板）：后边是三节 AA 的电池盒（每节旁一个拨片：装入 / 跨接，`cells` 1–3 节）；左前主开关；中前是测试缺口（两只鳄鱼夹，相距 30 mm）；中间两只 MES 螺口灯座（A 左、B 右），灯泡 2.5 V；A 与 B 之间、后面、前面各一个小拨动开关 X / Y / Z；带鳄鱼夹的红 / 黑绝缘导线按 §4.2 的拓扑连好。
- **用电器**：板左后一只蜂鸣器、一只带风扇叶的小电机，可以换到 A 位。
- **测试材料**（板右前小盘）：钢回形针、铜线、铝箔条、铅笔芯、塑料吸管、木冰棒棍、橡皮筋。
- **剖切展品**（板右后小支架）：剖开的碱性 AA 电池、剖开的灯泡（半个玻璃壳）、一段剥开外皮的导线。

### 1.3 事实表（TYPICAL / DESIGN / SIM）

| # | 项 | TYPICAL（来源） | DESIGN / SIM（本模型） | 待核 |
|---|---|---|---|---|
| F-1 | 电路 = 电池 + 导线、灯泡、开关，构成电系统 | P2 第 59 页 | — | |
| F-2 | 闭合电路才有电流；任何断开处都使电流为零 | P2 第 59 页；P4（20.1） | 求解器：开路 → 全部支路电流 0 | |
| F-3 | 导体：金属（铜、铝、钢）、石墨；绝缘体：塑料、橡胶、木（干）、玻璃、空气 | P4（20.2 电阻率表）；P5 | 缺口材料电阻：回形针 0.05 Ω、铜线 0.01 Ω、铝箔 0.02 Ω、铅笔芯 20 Ω、其余开路（DESIGN） | 铅笔芯 20 Ω 待核（0.5 mm HB、30 mm；P16） |
| F-4 | 电池串联，电动势相加；电流随之增大 | P4（21.2）；P2 第 59 页（变量） | 每节 1.5 V、内阻 0.15 Ω（DESIGN） | 内阻待核（P10） |
| F-5 | 电阻串联相加 → 电流变小 → 每只灯更暗；一处断全断 | P4（21.1） | 两只串联：每只亮度 26（SIM） | |
| F-6 | 电阻并联：每支路电压与单只时几乎相同 → 每只差不多亮；总电流约加倍；一支断其余不受影响 | P4（21.1） | 两只并联：每只 95、总电流 0.46 A（SIM） | |
| F-7 | 串联回路里各处电流相同；电流不被"用掉" | P4（20.1、21.1）；P12–P15 | 两只串联时 A、B 读数同为 0.12 A（SIM） | |
| F-8 | AA 电池：标称 1.5 V；Ø 14.5 × 50.5 mm；约 23 g | P8（IEC 60086 / 厂商数据表，当典型引） | 同 | |
| F-9 | 学校小灯泡：MES 螺口 2.5 V 0.2 A（另有 2.5 V 0.3 A 等） | P9（教具目录，当典型引） | 2.5 V 0.2 A → 额定 0.5 W、热态电阻 12.5 Ω（DESIGN） | 0.3 A 型号待核 |
| F-10 | 灯丝：钨丝绕成螺旋，工作时超过约 2,500 °C、白热发光；钨熔点约 3,422 °C | P11（Lamptech）；P12（IEEE） | 细看 | |
| F-11 | 导线：铜芯 + PVC 绝缘层 | P5 | `wire-cutaway` | |
| F-12 | 短路：电流绕过负载走近乎零电阻的路径，电流很大，导线与电池发热 | P4（21.2）；P10 | 两节电池短路约 8.24 A（SIM，受内阻限制） | |
| F-13 | 新加坡市电：230 V、50 Hz；G 型三脚插头（BS 1363，插头内有保险丝） | P18；P19 | 第 06 章细看 + 图 | 是 |
| F-14 | 家庭用电安全：湿手不碰电器、不用破损电线、不过载插座、请持证电工、定期测漏电断路器（RCCB） | P17（CPSO）；P20（EMA） | 第 06 章 | |
| F-15 | 新加坡约 95 % 的电由天然气发电 | P21（EMA *Singapore Energy Statistics*） | 图 `circuits-power-chain` + 细看 | 是：读最新年份 |
| F-16 | 电流方向约定：从电池正极经外电路到负极；电子实际反向 | P4（20.1） | 流从正极出发；细看一句 | |
| F-17 | 儿童电路误解：单极模型、电流相撞模型、削弱模型、顺序推理 | P13–P16 | §0-5 ①②③ | |
| F-18 | 今天的手电筒多用 LED | 待找来源（P22） | 细看一句 | 是 |
| F-19 | 碱性电池结构：钢壳（正极，二氧化锰）、隔膜、中心锌膏（负极）+ 黄铜集流针；锌锰电池：锌筒（负极）、中心碳棒（正极） | P23（电池手册 / 厂商技术手册） | `cell-cutaway` | |
| F-20 | 蜂鸣器、小电机：蜂鸣器电流约数十 mA；3 V 玩具电机运转电流约 0.2–0.5 A | P24（教具目录 / 数据表，当典型引） | 蜂鸣器 100 Ω、电机 6 Ω（DESIGN，示意） | 是 |

**模拟运行点（SIM，内部自洽；S1 的内容）**：理想电动势 1.5 V × n、每节内阻 0.15 Ω、导线总电阻 0.05 Ω、闭合开关 0.001 Ω、灯泡**恒定**电阻 12.5 Ω（热态值；真实灯丝冷态电阻约为热态的 1/10，见 §4.2 的"与真实的差别"）。亮度 = 灯泡功率 ÷ 参考功率（两节电池点一只灯 = 0.680 W）× 100。

| 情形 | 电流（从电池） | 灯 A 亮度 | 灯 B 亮度 |
|---|---|---|---|
| 1 节、单灯 | 0.118 A | 26 | — |
| **2 节、单灯（参考）** | **0.233 A** | **100** | — |
| 3 节、单灯 | 0.346 A | 220（超过额定 0.5 W 的 3 倍，状态 `OVER RATING`） | — |
| 3 节、其中一节接反 | 0.115 A | 24 | — |
| 2 节、两灯串联 | 0.118 A（A、B 各 0.118 A） | 26 | 26 |
| 1 节、两灯串联 | 0.060 A | 7 | 7 |
| 2 节、两灯并联 | 0.454 A（A、B 各 0.227 A） | 95 | 95 |
| 2 节、单灯、缺口为铅笔芯 | 0.091 A | 15 | — |
| 2 节、缺口为绝缘体 / 开关断开 / 灯泡拔掉 | 0 | 0 | 0 |
| 2 节、短路（X、Y、Z 全合） | 8.24 A（状态 `SHORT`） | 0 | 0 |
| 2 节、A 位为电机 | 0.47 A | 电机转 | — |
| 2 节、A 位为蜂鸣器 | 0.030 A | 蜂鸣器响（画面：振膜脉动） | — |

这些数字只出现在 PLATE 读数（SIM 芯片）、细看（写明"模拟"）和字幕（写"在这个模型里"）；正文写"更亮 / 更暗 / 差不多一样亮"。

### 1.4 口吻

按 `writing-rules.md`。课纲用词：electrical system、electric circuit、closed circuit、open circuit、current、battery、wire、bulb、switch、conductor、insulator、series、parallel、circuit diagram。中文：电系统、电路、闭合电路、开路（断路）、电流、电池、导线、灯泡、开关、导体、绝缘体、串联、并联、电路图。不说"电跑过去""电被灯泡吃掉"；不拟人；不渲染危险（不写"会被电死"，写"可能造成严重伤害甚至死亡"，带来源）。

### 1.5 PSLE 题型 → 本主题哪里支持

| 题型（P3 评估目标 II，S3 第 16–18 页） | 支持 |
|---|---|
| 哪些开关合上时哪只灯亮 | 第 05 章 `free` 接法：读者自己拨 X / Y / Z 与主开关，电路图实时高亮有电流的路径 |
| 电池个数 / 灯泡个数与亮度的数据表 | 第 04、05 章"记一行"；表头 = 改变的量 + 观察的量 |
| 认出公平测试里不变的量 | 试一试卡片的"不变"芯片（同一种灯泡、同样的导线、同样的接法） |
| 一只灯坏了，其余怎样 | 第 05 章拔掉灯泡（串联 / 并联各一次） |
| 用电路测试物体是否导电 | 第 03 章测试缺口 |
| 从电路图搭电路 / 从实物画电路图 | 右上卡电路图与实物的同步高亮 |
| 安全与节约用电的判断 | 第 06 章 |

---

## 2. 写实与参考图

### 2.1 Tier-1

| 对象 | 必须对的 |
|---|---|
| AA 电池 | 圆柱、正极端一个凸帽（Ø 约 5.5 mm、高约 1 mm）、负极端平；外皮缎面（无文字，用 `casing` + 暖灰 tint 与一圈色带区分正极端） |
| 电池盒 | 黑色塑料槽、两端金属簧片（负极端是弹簧）、引线一红一黑 |
| 小灯泡 | MES 螺口（Ø 约 10 mm）、球形玻璃壳 Ø 约 11 mm、两根支撑丝之间一段螺旋灯丝；装在圆形灯座里，灯座两侧各一个接线柱 |
| 鳄鱼夹导线 | 软绝缘线 + 两端带护套的鳄鱼夹（齿、弹簧铰） |
| 开关 | 小拨动开关：塑料底座、拨钮、两个接线柱（或刀闸，见 §0.1；推荐拨动开关：更接近今天的教具） |
| 手电筒 | 圆筒、前端较粗的灯头（反光碗 + 透镜）、侧面拨动开关、尾盖；里面两节电池头尾相接、尾部弹簧、侧壁金属片 |
| 剖开的灯泡 | 半个玻璃壳、灯丝、两根引线、玻璃芯柱、螺口与底部触点之间的绝缘体 |
| 剖开的电池 | 钢壳、二氧化锰层（环）、隔膜、锌膏（中心）、黄铜集流针、负极底盖 |

### 2.2 尺寸（米）

| 对象 | 尺寸 | 来源 |
|---|---|---|
| 实验台（context） | 0.90 × 0.50 | 设计 |
| 电路板 | 0.40 × 0.30 × 0.012 | 设计 |
| AA 电池 | Ø 0.0145 × 0.0505 | F-8 |
| 三节电池盒 | 0.165 × 0.025 × 0.032 | 设计（按电池推出） |
| 小灯泡 | 玻璃 Ø 0.011、全高 0.024、MES 螺口 Ø 0.010 | P9（待核） |
| 灯座 | Ø 0.030 × 0.020 | P9（Ø 30 mm 底座） |
| 鳄鱼夹 | 0.035 长 | 待核 |
| 导线 | 外径 0.0025，铜芯 Ø 0.001（示意） | 待核 |
| 拨动开关 | 0.030 × 0.012 × 0.015 | 设计 |
| 手电筒 | Ø 0.032（筒）/ 0.045（灯头）× 0.160 | 设计（两节 AA 加灯头） |
| 蜂鸣器 | Ø 0.030 × 0.015 | 设计 |
| 电机 | Ø 0.024 × 0.030，风扇叶 Ø 0.06 | 设计 |

### 2.3 参考图（`scripts/geo/circuits/refs/`，gitignore，不发布）

| # | 文件 | 来源 | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | `torch-patent.png` | 美国早期手电筒专利图（Google Patents，选一份两节电池、侧滑开关的；专利图为公有领域） | 公有领域 | 金属片、弹簧、开关触点的位置 |
| R2 | `torch-cutaway.jpg` | Commons 分类 *Flashlights*（选剖开 / 拆开的白炽手电筒照片） | 逐张核 | 反光碗、灯泡、电池排列 |
| R3 | `alkaline-cutaway.jpg` | Commons 分类 *Alkaline batteries* 里的剖面照片或示意图（施工时选定） | 逐张核 | 内外倒置结构 |
| R4 | `zinc-carbon-section.png` | Commons 分类 *Zinc–carbon batteries* 的剖面示意（施工时选定） | 逐张核 | 碳棒、锌筒（细看对照） |
| R5 | `incandescent-diagram.svg` | Commons 白炽灯结构示意（带零件编号的 svg，施工时选定） | 逐张核 | 灯丝、支撑丝、芯柱、螺口与触点 |
| R6 | `mes-bulb-holder.jpg` | Commons 或教具照片（MES 灯座） | 逐张核 | 灯座与接线柱 |
| R7 | `crocodile-clip.jpg` | Commons 分类 *Crocodile clips* | 逐张核 | 夹子的齿与护套 |
| R8 | `slide-switch.jpg` | Commons 分类 *Slide switches* | 逐张核 | 拨钮、底座 |
| R9 | `bs1363-socket.jpg`、`bs1363-plug-open.jpg` | Commons 分类 *BS 1363*（墙插座、打开的插头：保险丝、三脚） | 逐张核 | 图 `circuits-socket-plug` |
| R10 | `circuit-symbols.svg` | Commons 电路符号集（IEC 60617 风格；灯 = 圆加叉，电池 = 长短线） | 逐张核 | 电路图卡的符号（引擎画，不用图片） |

---

## 3. 分区与零件

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色 | 卡 |
|---|---|---|---|---|---|
| 01 | `torch` | Torch / 手电筒 | 7 件 | `token:ink-3` | 本主题右上卡 = 电路图（§4.3 C2），链路卡不用 |
| 02 | `source` | Batteries / 电池 | 电池盒、3 节电池、剖开的电池 | `token:ink-2` | |
| 03 | `board` | Circuit board / 电路板 | 底板、主开关、X / Y / Z、导线、测试缺口、剥开的导线 | `token:neutral` | |
| 04 | `loads` | Bulbs and other loads / 灯泡与用电器 | 灯泡 A、B 与灯丝、蜂鸣器、电机、风扇叶、剖开的灯泡 | `token:accent-2` | |
| 05 | `test-items` | Test materials / 测试材料 | 7 件 | `token:accent-3`，`card: false` | |
| — | `current` | Current / 电流 | 只有流 | `token:current`（新，§4.4 C4；退路 `token:accent-1`） | |

### 3.2 坐标与尺度

- 米，Y 向上，+Z 朝观者；台面 y = 0，电路板顶面 y = 0.012。`units: { "modelUnit": "cm", "scale": 100 }`。
- 包络 x −0.45…0.40、y 0…0.07、z −0.22…0.22；模型半径约 0.48；只有底板和台面投影。
- 各件中心：电池盒 (0, 0.028, −0.10)；主开关 (−0.14, 0.020, 0.09)；测试缺口 (−0.03, 0.022, 0.11)；灯 A (−0.06, 0.034, 0.00)；灯 B (0.10, 0.034, 0.00)；X (0.02, 0.020, 0.00)；Y (0.02, 0.020, −0.05)；Z (0.02, 0.020, 0.05)；蜂鸣器 (−0.26, 0.020, −0.10)；电机 (−0.26, 0.025, −0.03)；手电筒 (−0.33, 0.023, 0.10)，沿 X；剖切展品 (0.27, 0.03, −0.10 / −0.04 / 0.02)；测试材料小盘 (0.20, 0.015, 0.12)。

### 3.3 零件（35 个 + 1 个 context）

| # | id · 名称 | 组 | primitive（+ extra） | 材质 | explode | shell | sim | 参考 |
|---|---|---|---|---|---|---|---|---|
| 01 | `torch-body` 手电筒外壳 | torch | lathe（筒 + 灯头 + 尾盖，壁厚 1.5 mm，开放的内腔）沿 X | `powder` + tint 深绿灰 | [0,1,0] 0.05 | ✓ | | R1、R2 |
| 02 | `torch-cells` 手电筒里的电池 | torch | AA lathe `repeat` 2 沿 X | `casing` + 暖灰 | [0,0,1] 0.04 | | | R2 |
| 03 | `torch-spring` 尾部弹簧 | torch | **coil**（docs/22 M6）锥形：r 0.006→0.003，8 圈 | `steel` | [−1,0,0] 0.04 | | | R1 |
| 04 | `torch-strip` 金属片 | torch | extrude 细长条沿侧壁，两端折弯 | `brass` | [0,1,0] 0.03 | | | R1 |
| 05 | `torch-switch` 手电筒开关 | torch | bevelBox 拨钮 + 触点片（extra） | `plastic` 黑 / `brass` | [0,1,0] 0.04 | | `pose` ← `torch-switch` | R1 |
| 06 | `torch-bulb` 手电筒灯泡 | torch | 同 `bulb-a` 的结构缩小（玻璃 lathe + 螺口 + 灯丝 extra） | `glass` / `brass` | [1,0,0] 0.04 | | `glow` ← `bright-torch` | R2 |
| 07 | `torch-reflector` 反光碗与透镜 | torch | lathe 抛物面 + 透镜 lathe（glass，shell） | `stainless`（镜面） | [1,0,0] 0.06 | 透镜 ✓ | | R2 |
| 08 | `cell-holder` 电池盒 | source | extrude 三格槽 + 两端簧片（extra）+ 每格一个跨接拨片 | `plastic` 黑 / `steel` | [0,0,−1] 0.04 | | 跨接拨片 `pose` ← `cells` | — |
| 09 | `cell-1` 电池 1 | source | AA lathe（凸帽、负极平底、色带 extra） | `casing` + 暖灰；色带 tint | [0,1,0] 0.04 | | | — |
| 10 | `cell-2` 电池 2 | source | 同上 | 同上 | 同上 | | `pose` ← `flip-2`（翻转 180°）；`visible` ← `cells ≥ 2` | — |
| 11 | `cell-3` 电池 3 | source | 同上 | 同上 | 同上 | | `visible` ← `cells = 3` | — |
| 12 | `cell-cutaway` 剖开的电池 | source | **lathe `arc: 180`**（新，§4.4 C3）：钢壳、MnO₂ 环、隔膜、锌膏、黄铜针、底盖（extra，各自材质） | `steel`（钢壳）/ `powder` 黑（二氧化锰）/ `plastic` 白（隔膜）/ `enamel` 灰（锌膏）/ `brass`（集流针） | [0,1,0] 0.03 | | | R3 |
| 13 | `base-board` 电路板 | board | bevelBox [0.40, 0.012, 0.30] | `wood`（docs/22 M8） | [0,−1,0] 0.04 | | | — |
| 14 | `main-switch` 主开关 | board | bevelBox 底座 + 拨钮 + 两接线柱（extra） | `plastic` / `brass` | [0,1,0] 0.03 | | `pose` ← `main` | R8 |
| 15 | `switch-x` 开关 X（两灯之间） | board | 同上（小） | 同上 | 同上 | | `pose` ← `x` | R8 |
| 16 | `switch-y` 开关 Y（后） | board | 同上 | 同上 | 同上 | | `pose` ← `y` | R8 |
| 17 | `switch-z` 开关 Z（前） | board | 同上 | 同上 | 同上 | | `pose` ← `z` | R8 |
| 18 | `leads` 导线与鳄鱼夹 | board | sweep ×9（每条边一根，§4.2 拓扑；r 0.00125）+ 鳄鱼夹 extra（护套 lathe + 夹口 extrude） | `rubber` + 红 / 黑 tint；夹 `steel` | — | | 短路时 `glow` 热色（C4） | R7 |
| 19 | `gap-clips` 测试缺口 | board | 两只鳄鱼夹 + 两根短线，夹口相距 0.03 | `rubber` 红 / `steel` | [0,0,1] 0.03 | | | R7 |
| 20 | `wire-cutaway` 剥开的导线 | board | sweep 外皮（`hollow`，剥去一段）+ 铜芯 sweep（extra） | `plastic` 红 / `copper` | [0,1,0] 0.03 | | | — |
| 21 | `bulb-a` 灯泡 A 与灯座 | loads | 灯座 lathe + 接线柱 extra + 螺口 lathe + 玻璃 lathe（glass） | `plastic` 黑 / `brass` / `glass` | [0,1,0] 0.04 | | `pose` ← `bulb-a-in`（拧出放旁）、`load-a`（换走） | R5、R6 |
| 22 | `filament-a` 灯丝 A | loads | **coil** r 0.0006、6 圈 + 两根支撑丝 sweep（extra） | `steel` → 发光时 `token:lamp`（新）自发光 | 随 21 | | `glow` ← `bright-a` | R5 |
| 23 | `bulb-b` 灯泡 B 与灯座 | loads | 同 21 | 同 21 | 同 21 | | `pose` ← `bulb-b-in` | R5、R6 |
| 24 | `filament-b` 灯丝 B | loads | 同 22 | 同 22 | 随 23 | | `glow` ← `bright-b` | R5 |
| 25 | `buzzer` 蜂鸣器 | loads | lathe 圆壳 + 振膜 cylinder（extra）+ 两根引线 | `plastic` 黑 | [−1,0,0] 0.04 | | `pose` ← `load-a = buzzer`；振膜 `pulse` 动画 `enabled` ← `buzz` | — |
| 26 | `motor` 电机 | loads | lathe 外壳 + 端盖 + 轴 + 两接片 | `steel` / `plastic` | [−1,0,0] 0.04 | | `pose` ← `load-a = motor` | — |
| 27 | `motor-fan` 风扇叶 | loads | blades axial 3 片 r 0.03 | `plastic` 橙 tint | 随 26 | | `rotate` 动画 `rpm` ← `motor-speed` | — |
| 28 | `bulb-cutaway` 剖开的灯泡 | loads | **lathe `arc: 180`** 玻璃 + 芯柱 + 螺口 + 底部触点 + 绝缘体；灯丝 coil、两根引线 sweep（extra） | `glass` / `brass` / `enamel` 黑 / `steel` | [0,1,0] 0.03 | | | R5 |
| 29 | `paper-clip` 钢回形针 | test-items | 回形针 sweep | `stainless` | [0,1,0] 0.03 | | `pose` ← `gap = paper-clip`（移进缺口） | — |
| 30 | `copper-wire` 铜线 | test-items | sweep 直段 | `copper` | 同上 | | 同上 | — |
| 31 | `foil-strip` 铝箔条 | test-items | bevelBox 薄条（0.04 × 0.0002 × 0.008） | `casing` 亮 | 同上 | | 同上 | — |
| 32 | `pencil-lead` 铅笔芯 | test-items | cylinder Ø 0.0005 × 0.05（示意加粗到 Ø 0.0012，细看注明） | `powder` 石墨灰 | 同上 | | 同上 | — |
| 33 | `plastic-straw` 塑料吸管 | test-items | lathe 空心管 | `plastic` 白 / 条纹 tint | 同上 | | 同上 | — |
| 34 | `wooden-stick` 木冰棒棍 | test-items | extrude 圆头扁条 | `wood` | 同上 | | 同上 | — |
| 35 | `rubber-band` 橡皮筋 | test-items | torus 压扁（scale） | `rubber` + 米色 tint | 同上 | | 同上 | — |
| — | `bench` 实验台 | context | bevelBox | `wood` | — | | | — |

- 零件数理由：灯丝单独成件，才能单独发光；三节电池分开，才能按 `cells` 显隐、单独翻转；X / Y / Z 三个开关是串联 / 并联 / 自由接法的物理实现（§4.2）。删减顺序：`torch-reflector` 并入 `torch-body` → `rubber-band` 删去（保留 6 件测试材料）。
- 绘制预算：35 零件 × 约 1.5 材质槽 ≈ 52 → 超过静止 50：把测试材料 7 件合并材质（同族烘焙）、剖切展品各自 ≤ 2 槽，目标静止 ≤ 48；运转加 `current` 流 1、`torch-current` 1 → < 55。三角形 < 0.2 M（导线 9 根 sweep 约 40 k，coil 4 个约 20 k）。

### 3.4 summary / detail 要点

| id | summary（≤ 60 字符） | detail 要点 |
|---|---|---|
| cell-1 | Pushes current round the circuit. / 推动电流在电路里流动。 | 碱性 AA，1.5 V [F-8]；凸帽是正极；里面的化学物质反应，把化学能变成电能 [F-19] |
| cell-holder | Joins the batteries end to end. / 把电池头尾相接。 | 串联：正极接下一节的负极；接反一节会抵消 [F-4] |
| main-switch | Opens or closes the circuit. / 断开或闭合电路。 | 合上时两片金属接触；串联回路里放在哪里都一样 [§0-5 ②] |
| switch-x / y / z | Link switches for series or parallel. / 把两只灯接成串联或并联。 | §4.2 拓扑；全合上 = 短路（第 06 章） |
| leads | Copper inside, plastic outside. / 里面是铜，外面是塑料。 | 导体 + 绝缘体 [F-11] |
| gap-clips | A gap to test materials. / 用来测试材料的缺口。 | 缺口里放导体，回路闭合 |
| bulb-a | Lights when current passes through. / 有电流流过就发光。 | MES 2.5 V 0.2 A [F-9]；电流从底部触点进、螺口出 |
| filament-a | Thin coiled wire that glows white-hot. / 细细的螺旋钨丝，热到发白光。 | > 2,500 °C [F-10]；断了 = 回路断开 |
| buzzer | Turns current into sound. / 把电变成声音。 | 振膜振动；电流小也能响 [F-20] |
| motor | Turns current into movement. / 把电变成转动。 | 线圈与磁铁（与 docs/22 电磁铁呼应）[F-20] |
| cell-cutaway | Inside: chemicals that push the current. / 里面是推动电流的化学物质。 | 碱性电池结构 [F-19]；电池"没电"是化学物质用完了 |
| bulb-cutaway | The path through the bulb. / 电流穿过灯泡的路径。 | 底部触点 → 引线 → 灯丝 → 引线 → 螺口 |
| pencil-lead | Graphite: conducts, but not well. / 石墨：能导电，但不太好。 | 不是铅；石墨是导体 [F-3] |

---

## 4. 引擎必须展示的物理，以及最小的"小模拟"

### 4.1 要看得见的物理

| 课纲点 | 画面 | 机制 |
|---|---|---|
| 闭合电路有电流 | 导线里的粒子从电池正极出发，沿导线、穿过灯丝、回到负极；电路图上同一条路径高亮 | `current` 多路径流，每条边一段，`intensity` ← 该边电流 |
| 开关断开 / 开路 | 拨开关：粒子在 0.3 s 内停止（全回路，不只是开关之后），灯丝 0.2 s 变暗 | 求解器；绑定 |
| 导体 / 绝缘体 | 缺口里放材料：灯亮或不亮；铅笔芯暗亮 | `gap` 控件 → 材料电阻 |
| 电池个数 | 1 / 2 / 3 节可见；亮度 26 / 100 / 220；电流读数 | `cells` |
| 串联 / 并联 | 接法切换（X / Y / Z 拨钮动）；亮度 26+26 vs 95+95；拔一只的后果 | `arrangement`、`bulb-a-in` |
| 能量转换（P6 伏笔） | 蜂鸣器振膜、电机风扇转 | `load-a` |
| 短路 | 粒子全部走 X / Y / Z 捷径、颜色变热色；灯灭；读数 8.24 A；状态 `SHORT` | 求解器的短路检测 |
| 电路图 | 右上卡实时电路图，符号可点 | C2 |

### 4.2 电路模型（S1 的内容；`lib/sim/circuit.ts`，纯函数，有单测）

- **拓扑**（节点：`bp` 电池正极、`bn` 电池负极、`s1`、`n1`、`n2`、`n3`、`n4`）：

| 边 | 从 → 到 | 元件 |
|---|---|---|
| `cells` | bn → bp | 电池组：n 节 × 1.5 V（`flip-2` 时第 2 节记 −1.5 V），内阻 n × 0.15 Ω |
| `main` | bp → s1 | 主开关 |
| `gap` | s1 → n1 | 测试缺口：`link`（两夹相夹，0.001 Ω）或材料电阻（绝缘体 = 开路） |
| `a` | n1 → n2 | A 位：灯泡 12.5 Ω / 蜂鸣器 100 Ω / 电机 6 Ω；`bulb-a-in = false` → 开路 |
| `x` | n2 → n3 | 开关 X |
| `b` | n3 → n4 | 灯泡 B 12.5 Ω；`bulb-b-in = false` → 开路 |
| `y` | n1 → n3 | 开关 Y |
| `z` | n2 → n4 | 开关 Z |
| `ret` | n4 → bn | 回线 0.05 Ω |

  接法预设：`single` = Z 合、X / Y 开（只有 A）；`series` = X 合、Y / Z 开；`parallel` = Y、Z 合、X 开；`free` = 读者自己拨。三个全合 → n1 = n2 = n3 = n4 → 短路。X、Z 合（Y 开）→ B 被短接、只有 A 亮；X、Y 合（Z 开）→ A 被短接、只有 B 亮——第 05 章"哪些开关让哪只灯亮"的谜题全部由同一个求解器给出。
- **手电筒**是同一个图里的另一个独立回路（节点 `tp`、`tn`、`ts`；2 节、开关、灯泡），输出 `bright-torch`。
- **求解**：改进节点法（MNA），≤ 16 节点，高斯消元；开路边删去；断开的子图电流为 0；闭合开关 0.001 Ω 避免奇异。输出：每条边电流（带方向）、每只灯功率 → 亮度（÷ 0.680 W × 100）、电池电流、电池端电压、状态（`OPEN`：电池电流 < 1 mA；`SHORT`：电池电流 > 3 A；`OVER RATING`：任一灯功率 > 1.5 × 0.5 W；否则 `CLOSED`）、电机转速（∝ 电机电压，3 V 时 40 rpm 的可视速度）、蜂鸣器（电流 > 10 mA 时响）。§1.3 的表是它的单测用例（数值到 3 位有效数字）。
- **与真实的差别（S1 与细看必须写）**：灯丝电阻其实随温度变化（冷态约为热态的 1/10），真实的"暗灯"比模型稍亮、"超额定"的灯电流比模型稍小；电池内阻随电量与电流变化；所以**数字是示意，亮暗的排序是对的**。

### 4.3 E-SIM 核心（见 docs/22 §4.3）+ 电路专用件 E-CIR

`sim` 段（形状同 docs/22；这里只列电路的控件、输出与绑定）：

```jsonc
"sim": {
  "kind": "circuit",
  "controls": [
    { "id": "main", "kind": "toggle", "default": true, "label": { "en": "Switch", "zh": "开关" } },
    { "id": "cells", "kind": "step", "values": [1, 2, 3], "default": 2, "label": { "en": "Batteries", "zh": "电池" } },
    { "id": "flip-2", "kind": "toggle", "default": false, "label": { "en": "Battery 2 reversed", "zh": "第 2 节接反" } },
    { "id": "arrangement", "kind": "choice", "default": "single",
      "options": ["single", "series", "parallel", "free"],          // 选项各带 {en, zh} 标签
      "sets": { "single": { "x": false, "y": false, "z": true }, "series": { "x": true, "y": false, "z": false },
                "parallel": { "x": false, "y": true, "z": true } } },  // choice 可以一次设定别的控件；读者手拨 X / Y / Z 时自动变成 free
    { "id": "x", "kind": "toggle", "default": false }, { "id": "y", "kind": "toggle", "default": false }, { "id": "z", "kind": "toggle", "default": true },
    { "id": "gap", "kind": "choice", "default": "link",
      "options": ["link", "paper-clip", "copper-wire", "foil-strip", "pencil-lead", "plastic-straw", "wooden-stick", "rubber-band", "empty"] },
    { "id": "load-a", "kind": "choice", "default": "bulb", "options": ["bulb", "buzzer", "motor"] },
    { "id": "bulb-a-in", "kind": "toggle", "default": true }, { "id": "bulb-b-in", "kind": "toggle", "default": true },
    { "id": "torch-switch", "kind": "toggle", "default": false }
  ],
  "outputs": ["i-cells", "volts", "bright-a", "bright-b", "bright-torch", "i-a", "i-b", "motor-speed", "buzz", "status", "edge-currents"],   // 各带 label / unit（A、V、亮度无单位）；status、edge-currents 是 kind: state / vector
  "bind": [
    { "output": "bright-a", "part": "filament-a", "glow": { "color": "token:lamp", "curve": "sqrt", "full": 100 } },
    { "output": "edge-currents", "flow": "current", "intensity": { "per": "edge", "full": 0.25 } },   // 每条边一段路径，粒子速度 ∝ |I|，方向随符号
    { "control": "cells", "part": "cell-3", "visible": { "gte": 3 } }, …,
    { "control": "gap", "part": "pencil-lead", "pose": { "pencil-lead": "in-gap" } }, …,
    { "output": "motor-speed", "animation": "fan-spin", "rpm": true },
    { "output": "buzz", "animation": "buzzer-pulse", "enabled": true },
    { "output": "status", "flow": "current", "stops": { "SHORT": "token:hot" } }
  ],
  "circuit": {
    "nodes": { "bp": …, "bn": …, … },                     // 3D 坐标（流路径的端点）+ 电路图 2D 坐标
    "edges": [ { "id": "cells", "from": "bn", "to": "bp", "kind": "battery", "cells": "cells", "flip": { "2": "flip-2" }, "emf": 1.5, "r": 0.15, "path": [[…]] }, … ],
    "materials": { "link": 0.001, "paper-clip": 0.05, "copper-wire": 0.01, "foil-strip": 0.02, "pencil-lead": 20 },   // 没列 = 绝缘
    "loads": { "bulb": { "r": 12.5, "rated": 0.5 }, "buzzer": { "r": 100, "on": 0.01 }, "motor": { "r": 6 } },
    "reference": { "power": 0.680 },
    "diagram": { "symbols": [ { "edge": "cells", "kind": "battery", "at": [40, 20], "dir": "h" }, { "edge": "a", "kind": "lamp", … }, … ] }
  }
}
```

| # | 件 | 现状 | 最小方案 | 退路 | 优先级 |
|---|---|---|---|---|---|
| C1 | 电路求解器 `lib/sim/circuit.ts` | 无（docs/17 D2） | §4.2；单测覆盖 §1.3 全表、短路、浮空子图、开关全组合（2³ × 主开关 × 拔灯）| — | 必须 |
| C2 | **电路图卡**（右上卡 `card: "circuit"`） | 右上卡只有零件链路（`PartChainCard`） | SVG：IEC 风格符号（电池 = 长短线组、灯 = 圆内叉、开关 = 断口 + 斜杆、蜂鸣器、电机 = 圆内 M），导线直角走线（数据里的 2D 坐标）；有电流的边用 `token:current` 加粗并画小箭头（方向 = 正极 → 负极）；开关符号可点（44 px 命中区）= 切换同一个 store 值；选中零件时对应符号描 signal；< 1024 px 时卡片收进试一试卡片（可折叠） | 只在细看放静态电路图 | 必须（课纲"从电路图搭电路"） |
| C3 | `lathe` 的 `arc`（部分旋转）+ 切面封口 | `lathe` 只能整圈 | three `LatheGeometry` 的 phiLength；两个切面按轮廓三角化封口，用 `--cut` 剖面色 + 剖面线（与 CUTAWAY 的画法一致） | 用命名剖切（会切到别的零件，不推荐） | 必须（剖开的电池、灯泡） |
| C4 | `glow` 绑定 + token `lamp`（暖白，paper / cinema 各一套）+ `current` | 材质无自发光绑定 | 灯丝零件的 emissive 强度 = f(亮度)（`sqrt` 曲线，100 = 满）、颜色从暗红到暖白随亮度插值；玻璃壳加一点同色 emissive；不加点光源、不加 bloom（性能） | 只用读数 | 必须 |
| C5 | 动画的 `rpm` 与 `enabled` 绑定 | 动画参数固定 | S4 的一部分 | 恒速 | 必须 |
| C6 | 多路径流的每路径强度（`intensity`、方向、`stops` 覆盖） | docs/22 M2 做多路径 | 每条路径一个 uniform 行（速度、方向、透明度）；静止的路径不画粒子 | 每边一条流（9 次绘制） | 必须 |
| C7 | `coil` primitive | docs/22 M6 | 共享 | sweep 分段 | 必须 |

**工作量估计**：E-CIR C1–C6 ≈ 4–4.5 天（C1 1 天、C2 1.5–2 天、C3 0.5 天、C4 0.5 天、C5 + C6 0.5–1 天）；加上与 docs/22 共享的 E-SIM 核心（4–5 天，先做的主题承担）与 M2 / M6 / M8。

### 4.4 先猜后看与数据表（E-SIM S6 / S7 在本主题的用法）

- 第 02 章：先猜"只接一根线，灯会亮吗？"→ 揭晓 `gap: empty`（灯不亮、电流 0）。
- 第 04 章：数据表列 = 电池个数 | 电流 A | 灯 A 亮度。
- 第 05 章：数据表列 = 接法 | 电流 A | 灯 A | 灯 B。
- 揭晓文案由 `observe` 的输出变化自动生成："你猜：更亮 · 观察到：更暗 / You predicted: brighter · Observed: dimmer"（比较改变前后，±5 % 以内写"差不多一样 / about the same"）。

### 4.5 "从零搭电路"的评估（v2，不进 v1）

| 需要 | 难点 | 估计 |
|---|---|---|
| 在 3D 板上拖元件到槽位（触屏 + 鼠标） | 射线投到板面、吸附、碰撞；iPad 上与 OrbitControls 的手势冲突 | 1.5 天 |
| 导线：从一个接线柱拖到另一个 | 运行时生成 sweep（曲线避让其他件）、鳄鱼夹朝向 | 2 天 |
| 任意拓扑的求解 | C1 已支持任意图；要加"悬空端子""一个接线柱接多根" | 0.5 天 |
| 键盘与读屏的等价操作（CLAUDE.md：关键操作不依赖 hover，快捷键与按钮共用 store） | 列表式"把 X 接到 Y"的替代界面 | 1 天 |
| 撤销、URL 表示任意电路、截图测试 | 状态序列化 | 1 天 |
| 电路图卡跟随任意拓扑自动排版 | 正交布线自动布局 | 1–2 天 |

合计约 6–8 天，且对 P5 的学习目标增益有限（课纲要的变量都已由槽位覆盖）。建议 v1 不做；v2 若做，先做"在电路图卡上搭"（2D、易做无障碍），3D 板跟着变。

### 4.6 HUD 数据

- **规格行**（≤ 4）：`Batteries` AA · 1.5 V each · 1–3（design）；`Bulbs` 2.5 V · 0.2 A（typical，F-9）；`Board` 400 × 300 mm（design）；`Wire` copper core · PVC coat（typical）。
- **PLATE 读数**（`follow`，SIM）：Batteries / 电池 V（`volts`，n × 1.5 减内阻压降）；Current / 电流 A（`i-cells`）；Bulb A / 灯 A（`bright-a`）；Bulb B / 灯 B（`bright-b`）；Torch / 手电筒（`bright-torch`，只在第 01 章有值）。状态小行 `SIM CLOSED · 2 BATTERIES · SERIES` / `SIM OPEN` / `SIM SHORT`。
- **立面**：`views.section.plane = "xz"`（俯视，与电路图同向）。
- **镜头预设**（≤ 6）：`torch-view`、`board-top`（正上方，和电路图一一对应）、`bulbs-view`（两只灯 3/4 近景）、`gap-view`（测试缺口 + 材料盘）、`cutaways-view`（三件剖切展品）、`batteries-view`（电池盒）。hero = 整台 3/4 前右上，距离约 1.6 m。
- **模式组合**：X-RAY 只透明手电筒外壳与透镜（shell）；CUTAWAY 默认面不用（剖切展品自己是半个）；EXPLODED 时 sim 绑定暂停、流禁用（同 docs/22）；REFERENCE 冻结 sim。

### 4.7 流与动画

| id | 类 | 内容 | 参数 |
|---|---|---|---|
| `current` | 多路径流（`current` 组，`whenRun: true`） | 9 条边各一段路径（沿导线中心、穿过灯丝与电池），强度与方向来自求解器 | 色 `token:current`；短路时 `stops` 覆盖为 `token:hot`；速度 0.01–0.08（∝ \|I\|，夹在范围内）；size 0.45 |
| `torch-current` | 流 | 手电筒回路（电池 → 灯泡 → 开关 → 金属片 → 弹簧） | 同色；`visible` ← `torch-switch` |
| `fan-spin` | 动画 rotate（`motor-fan`） | `rpm` ← `motor-speed` | |
| `buzzer-pulse` | 动画 pulse（`buzzer` 振膜，`each` 不需要） | scale 1.03，12 Hz（画面放慢的示意振动） | `enabled` ← `buzz` |
| 姿态 | `torch-on`、`main-on`、`x-on`、`y-on`、`z-on`、`flip-2`、`bulb-a-out`、`bulb-b-out`、`load-buzzer`、`load-motor`、每件测试材料的 `in-gap` | 0.4–0.8 s | |

---

## 5. 章节

### 5.0 总表

| # | id | 标题 EN / ZH | view | run | hide | sim.set | labels | 镜头 |
|---|---|---|---|---|---|---|---|---|
| 01 | `inside-a-torch` | Inside a torch / 手电筒里面 | xray | true | — | torch-switch false | torch-body, torch-cells, torch-switch, torch-bulb | torch-view |
| 02 | `a-closed-circuit` | A complete loop / 闭合电路 | assembled | true | — | arrangement single, cells 2, main false | cell-holder, main-switch, bulb-a, leads | board-top |
| 03 | `conductors-and-insulators` | What lets current through / 导体与绝缘体 | assembled | true | — | single, gap empty | gap-clips, bulb-a, pencil-lead, wire-cutaway | gap-view |
| 04 | `more-batteries` | Adding batteries / 增加电池 | assembled | true | — | single, cells 1 | cell-1, cell-2, cell-3, filament-a | batteries-view |
| 05 | `series-and-parallel` | Series and parallel / 串联与并联 | assembled | true | — | series, cells 2 | bulb-a, bulb-b, switch-x, switch-y, switch-z | bulbs-view |
| 06 | `using-electricity-safely` | Using electricity safely / 安全用电 | assembled | true | — | single, cells 2 | leads, wire-cutaway, cell-cutaway | hero |

### 5.1 第 01 章 `inside-a-torch`

- **summary**：A torch is a small electrical system: batteries, a switch and a bulb joined in one loop of metal. / 手电筒是一个小小的电系统：电池、开关和灯泡用金属连成一个回路。
- **正文提纲**：① 电系统 = 能源 + 元件（F-1）。② 打开看：两节电池头尾相接、弹簧、金属片、开关、灯泡、反光碗（§1.2）。③ 开关推上 → 回路接通 → 灯亮；推下 → 断开（F-2）。④ 电池里的化学物质推动电流；电池"没电"（F-19）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（torch-view，assembled 先不透）；labels torch-body, torch-switch | A torch is a small electrical system. Inside the tube are batteries, a switch and a bulb, joined by metal parts. / 手电筒是一个小小的电系统。筒里有电池、开关和灯泡，用金属零件连在一起。 |
| 2 | view xray；labels torch-cells, torch-spring, torch-strip, torch-bulb, torch-reflector | Look through the case: two batteries end to end, a spring at the back, a metal strip along the side and a small bulb in a mirror. / 透过外壳看：两节电池头尾相接，尾部一根弹簧，侧面一条金属片，前面反光碗里一只小灯泡。 |
| 3 | sim torch-switch true；torch-current 流 | Slide the switch on. The metal strip now touches the bulb holder, the loop is complete and the bulb lights. / 把开关推上。金属片碰到灯座，回路接通，灯泡亮了。 |
| 4 | 同上；camera 近 torch-bulb；labels torch-bulb, torch-cells | Current flows out of one end of the batteries, through the bulb, along the strip and back through the spring to the other end. / 电流从电池的一端流出，穿过灯泡，沿金属片、经过弹簧，回到电池的另一端。 |
| 5 | sim torch-switch false | Slide it off and the loop is broken at the switch. Current stops everywhere at once, so the bulb goes dark. / 把开关推下，回路在开关处断开。整个回路的电流同时停下，灯泡熄灭。 |

- **试一试**：`vary: torch-switch`，`observe: [bright-torch]`。
- **细看**：`Most torches today use LEDs`（F-18，回路一样）；`Why a spring`（压紧电池、也是导体）；`A flat battery`（化学物质用完了，F-19）。
- **本章索引**：torch-body, torch-cells, torch-spring, torch-strip, torch-switch, torch-bulb, torch-reflector
- **名词首现**：electrical-system、battery、switch。

### 5.2 第 02 章 `a-closed-circuit`

- **summary**：Current flows only round a complete loop; a switch opens or closes that loop. / 只有完整的回路才有电流；开关把回路断开或接通。
- **正文提纲**：① 板上同样的元件摊开（§1.2）。② 闭合电路（F-2）；电路图（右上卡）与实物一一对应。③ 灯泡里的路径、电池的两极：都要接上（§0-5 ①）。④ 换成蜂鸣器、电机：同一回路，不同的用处（F-20）。⑤ 开关放在哪里都一样（§0-5 ②，细看）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（board-top）；labels cell-holder, main-switch, bulb-a, leads | The same parts, spread out on a board: batteries in a holder, wires with crocodile clips, a switch and a bulb. The diagram at the top right shows the same circuit in symbols. / 同样的元件摊在一块板上：电池盒里的电池、带鳄鱼夹的导线、一个开关和一只灯泡。右上角的电路图用符号画出同一个电路。 |
| 2 | sim main true；current 流 | Close the switch. Current leaves the positive end of the batteries, goes round through the bulb and returns to the negative end. A closed circuit. / 合上开关。电流从电池的正极流出，经过灯泡，回到负极。这是闭合电路。 |
| 3 | camera cutaways-view；labels bulb-cutaway | Inside a bulb, current goes in at the tip, up one wire, through the thin coiled filament and down the other wire to the metal side. Both must be connected. / 在灯泡里，电流从底部的尖端进去，沿一根引线上去，穿过细细的螺旋灯丝，再沿另一根引线到金属螺口。两处都要接上。 |
| 4 | 同上；labels cell-cutaway | A battery has two ends, positive and negative. Inside, chemicals push the current round the circuit, and both ends must be part of the loop. / 电池有两极：正极和负极。里面的化学物质推动电流在电路里流动，两极都必须接在回路里。 |
| 5 | camera board-top；sim load-a motor → buzzer（拍内终值 motor）；labels motor, motor-fan, buzzer | Swap the bulb for a motor or a buzzer. The loop is the same; the job is different: movement or sound instead of light. / 把灯泡换成电机或蜂鸣器。回路一样，用处不同：转动或发声，而不是发光。 |

- **试一试**：`predict`：prompt "Unclip one wire from the battery. Will the bulb stay lit?" / "把一根导线从电池上松开，灯泡还会亮吗？"，change `gap: empty`（模型里用缺口代表"松开的夹子"），options stays lit / goes out / dims（还亮 / 熄灭 / 变暗），observe `bright-a`；之后 `vary: main`。
- **细看**：`One wire is not enough`（单极模型误解，P13–P15）；`Where should the switch go?`（任何位置都一样，求解器演示：主开关在正极一侧，换到 Z 的位置也一样断开）；`Current is not used up`（F-7）；`Reading circuit symbols`（R10，电路图卡的符号表）。
- **本章索引**：cell-holder, cell-1, main-switch, leads, bulb-a, filament-a, bulb-cutaway, cell-cutaway, buzzer, motor
- **名词首现**：electric-circuit、closed-circuit、open-circuit、electric-current、circuit-diagram、terminal。

### 5.3 第 03 章 `conductors-and-insulators`

- **summary**：Metals and graphite let current through; plastic, rubber, wood and glass do not. / 金属和石墨能让电流通过；塑料、橡胶、木头和玻璃不能。
- **正文提纲**：① 测试缺口：回路里留一个空。② 逐一放进 7 件材料（F-3）；公平测试：同一块板、同样的电池和灯泡，只换材料。③ 铅笔芯：石墨导电但较差（F-3）。④ 导线同时用到导体和绝缘体（F-11）；电线外皮破了危险（第 06 章伏笔）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（gap-view）；sim gap empty；labels gap-clips, bulb-a | Leave a gap in the loop between two crocodile clips. The bulb stays dark: air does not let current through. / 在回路里两只鳄鱼夹之间留一个缺口。灯泡不亮：空气不让电流通过。 |
| 2 | sim gap paper-clip（拍内依次 copper-wire、foil-strip，终值 foil-strip）；labels paper-clip, copper-wire, foil-strip | Bridge the gap with a steel paper clip, copper wire or aluminium foil and the bulb lights. These metals are electrical conductors. / 用钢回形针、铜线或铝箔把缺口接上，灯泡就亮了。这些金属是导体。 |
| 3 | sim gap plastic-straw → wooden-stick → rubber-band（终值 rubber-band）；labels plastic-straw, wooden-stick, rubber-band | A plastic straw, a wooden stick or a rubber band leaves the bulb dark. These are electrical insulators. / 塑料吸管、木冰棒棍或橡皮筋放进去，灯泡还是不亮。它们是绝缘体。 |
| 4 | sim gap pencil-lead；labels pencil-lead, filament-a | Pencil lead is graphite, not metal, yet the bulb glows dimly. Graphite conducts, but not as well as metal. / 铅笔芯是石墨，不是金属，灯泡却微微发亮。石墨能导电，只是不如金属好。 |
| 5 | camera cutaways-view；labels wire-cutaway, leads | A wire uses both kinds: a copper core to carry the current and a plastic coat to keep it from touching anything else. / 一根导线同时用到两种材料：铜芯传导电流，塑料外皮把它和别的东西隔开。 |

- **试一试**：`vary: gap`，`keep: [cells, bulb]`，`observe: [bright-a]`，`record: true`（表：材料 | 灯 A 亮度 | 导体？——"导体？"一列由亮度 > 0 自动写"是 / 否"）。
- **细看**：`Why "pencil lead" is not lead`；`Is water a conductor?`（自来水里溶有物质，能导电，所以湿手危险——第 06 章；纯水导电很差，P17）；`Your body conducts too`（安全，带来源）。
- **本章索引**：gap-clips, paper-clip, copper-wire, foil-strip, pencil-lead, plastic-straw, wooden-stick, rubber-band, wire-cutaway
- **名词首现**：conductor、insulator、fair-test。

### 5.4 第 04 章 `more-batteries`

- **summary**：More batteries joined end to end push more current, and the bulb glows brighter. / 头尾相接的电池越多，推动的电流越大，灯越亮。
- **正文提纲**：① 1 → 2 → 3 节（F-4），亮度与电流（SIM 表）。② 接法：正极接下一节的负极（串联）。③ 超额定：灯泡会烧坏，坏了 = 回路断开。④ 接反一节会抵消。⑤ 公平测试与数据表。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（batteries-view）；sim cells 1；labels cell-1, filament-a | One battery, one bulb. The bulb glows, but dimly. / 一节电池、一只灯泡。灯亮了，但很暗。 |
| 2 | sim cells 2；labels cell-1, cell-2 | Add a second battery, the positive end of one touching the negative end of the next. In this model the current doubles and the bulb is about four times as bright. / 加第二节电池，一节的正极接下一节的负极。在这个模型里，电流翻倍，灯大约亮了四倍。 |
| 3 | sim cells 3；状态 OVER RATING；labels cell-3, filament-a | A third battery makes it brighter still, but the bulb is now pushed far past what it is made for. A real bulb used like this may burn out, and a broken filament breaks the circuit. / 第三节电池让它更亮，但灯泡已经远远超过它的设计用量。真灯泡这样用可能会烧坏，灯丝一断，电路就断了。 |
| 4 | sim cells 3, flip-2 true；labels cell-2 | Turn one battery the wrong way round and it pushes against the others. Three batteries with one reversed light the bulb about as dimly as one. / 把一节电池装反，它就和其他电池对着推。三节里装反一节，灯只和一节电池时差不多暗。 |
| 5 | sim cells 2, flip-2 false；数据表展开 | Only the number of batteries was changed; the bulb, the wires and the switch stayed the same. That is a fair test, and the table shows the pattern. / 只改了电池的个数，灯泡、导线和开关都不变。这就是公平测试，表格里能看出规律。 |

- **试一试**：`vary: cells`，`keep: [bulb, wires, arrangement]`，`observe: [i-cells, bright-a]`，`record: true`；`flip-2` 作为卡片里的第二个开关。
- **细看**：`Volts`（每节 1.5 V，串联相加；中学会学电压，F-4、F-8）；`Why brightness more than doubles`（功率与电流的平方，模型数字；示意）；`Model versus real bulbs`（§4.2 与真实的差别）。
- **本章索引**：cell-holder, cell-1, cell-2, cell-3, bulb-a, filament-a
- **名词首现**：series（电池串联先出现于此）。

### 5.5 第 05 章 `series-and-parallel`

- **summary**：Bulbs in series share one path and glow dimmer; bulbs in parallel each have their own path and stay bright. / 串联的灯泡共用一条路径，更暗；并联的灯泡各有自己的路径，一样亮。
- **正文提纲**：① 串联：一条路径（F-5），各处电流相同（F-7）。② 拔掉一只：全灭。③ 并联：各自的路径（F-6），每只差不多和单只一样亮。④ 拔掉一只：另一只照亮。⑤ 代价：从电池取的电流约加倍。⑥ 开关谜题：X / Y / Z 的组合。⑦ 生活：彩灯串、家里的电灯是并联（细看）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（bulbs-view）；sim series；labels bulb-a, bulb-b, switch-x | Two bulbs in series: one path, through one bulb and then the other. Both glow, each much dimmer than a single bulb. / 两只灯泡串联：只有一条路径，先经过一只，再经过另一只。两只都亮，但都比单独一只暗得多。 |
| 2 | sim bulb-a-in false；labels bulb-a, bulb-b | Unscrew one bulb and the only path is broken. Both go dark. / 拧下一只灯泡，唯一的路径断了，两只都熄灭。 |
| 3 | sim parallel, bulb-a-in true；labels switch-y, switch-z, bulb-a, bulb-b | Two bulbs in parallel: each has its own path to the batteries. Each glows about as brightly as a single bulb. / 两只灯泡并联：每只都有一条通向电池的路径。每只都和单独一只时差不多亮。 |
| 4 | sim bulb-a-in false | Unscrew one bulb now and the other stays lit, because its own path is still complete. / 这时拧下一只，另一只照样亮，因为它自己的路径还是完整的。 |
| 5 | sim bulb-a-in true；labels cell-holder | The cost: in this model the parallel circuit draws about twice the current of a single bulb, so its batteries run down sooner. / 代价是：在这个模型里，并联电路从电池取的电流约是单只灯时的两倍，电池用得更快。 |
| 6 | sim free, x true, z true, y false；labels switch-x, switch-z, bulb-a, bulb-b | Switches in different places control different paths. With these two closed, current skips bulb B, so only bulb A lights. / 不同位置的开关控制不同的路径。合上这两个开关，电流绕过了灯泡 B，只有灯泡 A 亮。 |

- **试一试**：`vary: arrangement`（single / series / parallel / free），`keep: [cells]`，`observe: [i-cells, bright-a, bright-b]`，`record: true`；`free` 时 X / Y / Z 可拨（卡片里与电路图卡上都能拨）。
- **细看**：`Same current everywhere in series`（A、B 读数相同，F-7）；`Festive lights`（图 `circuits-festive-lights`：旧式彩灯串一只坏全灭）；`Home wiring is parallel`（家里每盏灯、每个插座各有路径，P5）；`The switch puzzle`（2³ 种组合，谁亮——PSLE 题型）。
- **本章索引**：bulb-a, bulb-b, filament-a, filament-b, switch-x, switch-y, switch-z, cell-holder
- **名词首现**：parallel。

### 5.6 第 06 章 `using-electricity-safely`

- **summary**：Batteries are safe for experiments; mains electricity is far more powerful, so circuits are kept insulated, dry and not overloaded. / 电池做实验是安全的；市电强大得多，所以电路要绝缘、保持干燥、不能过载。
- **正文提纲**：① 短路（F-12）：模型里演示，字幕说不要做。② 市电 230 V（F-13），插座与插头（图）；保险丝与漏电断路器。③ 破损电线、水、湿手、过载（F-14）。④ 电从哪里来：发电站到家（F-15，图）；节约用电（课纲价值观）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 |
|---|---|---|
| 1 | 本章（hero）；sim free, x y z 全 true；status SHORT；current 流热色；labels switch-x, switch-y, switch-z, leads | Close all three link switches and the batteries are joined almost straight to themselves. Nearly all the current takes this easy path: the bulbs go out and the wires and batteries heat up. This is a short circuit. Do not try it. / 三个连接开关全合上，电池的两极几乎直接连在一起。几乎所有电流都走这条捷径：灯灭了，导线和电池发热。这叫短路。不要这样做。 |
| 2 | sim single；camera cutaways-view；labels wire-cutaway | Insulation keeps current on its path. A cable with its plastic coat worn through, copper showing, must not be used. / 绝缘层让电流沿着该走的路走。外皮磨破、露出铜芯的电线不能再用。 |
| 3 | camera hero 拉远；hide test-items | The sockets at home supply 230 volts, about one hundred and fifty times the push of one battery. That is enough to cause serious injury or death. / 家里的插座提供 230 伏电压，约是一节电池的一百五十倍。足以造成严重伤害甚至死亡。 |
| 4 | 同上；labels leads | Tap water conducts electricity. Keep drinks away from sockets and never touch switches or plugs with wet hands. / 自来水能导电。饮料不要放在插座旁，不要用湿手碰开关和插头。 |
| 5 | 同上 | Too many appliances on one socket can overheat it. Wiring at home is done by licensed electricians, and a circuit breaker cuts the power when something goes wrong. / 一个插座接太多电器会过热。家里的电线要由持证电工安装，出了问题时漏电断路器会切断电源。 |

- **试一试**：`predict`：prompt "What happens if all three link switches are closed?" / "三个连接开关都合上，会怎样？"，options both bulbs brighter / both go out / nothing changes（两只都更亮 / 两只都灭 / 没变化），change `{arrangement: free, x: true, y: true, z: true}`，observe `bright-a`（并在卡片上显示 `status`）。
- **细看**：`Inside a plug and socket`（`<Figure src="figures/circuits-socket-plug">`，F-13：三脚、保险丝）；`From power station to home`（`<Figure src="figures/circuits-power-chain">`，F-15）；`Saving electricity`（关灯、关电器，课纲价值观；新加坡家庭用电建议带 EMA 来源）；`Short circuits and fuses`（保险丝在电流过大时熔断，断开电路）。
- **本章索引**：switch-x, switch-y, switch-z, leads, wire-cutaway, cell-cutaway
- **名词首现**：short-circuit。

### 5.7 拍数

5 + 5 + 5 + 5 + 6 + 5 = 31 拍。

### 5.8 章节配图

第 01 章 `circuits-torch`；第 03 章 `circuits-tester`；第 05 章 `circuits-series-parallel`、`circuits-festive-lights`；第 06 章 `circuits-socket-plug`、`circuits-power-chain`、`circuits-safety-home`。

---

## 6. 名词表 `glossary.json`（15 个候选）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| electrical-system | Electrical system / 电系统 | 能源（电池）和元件（导线、灯泡、开关）一起完成一件事 | electric-circuit |
| electric-circuit | Electric circuit / 电路 | 电流能流过的一整圈路径 | closed-circuit |
| closed-circuit | Closed circuit / 闭合电路 | 没有断开的回路，有电流 | open-circuit |
| open-circuit | Open circuit / 开路（断路） | 某处断开的回路，没有电流 | closed-circuit |
| electric-current | Electric current / 电流 | 在闭合电路里流动的电；电池推动它 | battery |
| battery | Battery / 电池 | 电路的能源；有正极和负极（科学家把一节叫"电池单体"） | terminal |
| terminal | Terminal / 电极、接线端 | 电池或元件上接导线的地方 | battery |
| switch | Switch / 开关 | 把电路接通或断开的元件 | open-circuit |
| filament | Filament / 灯丝 | 灯泡里细细的螺旋金属丝，电流通过时热到发光 | — |
| circuit-diagram | Circuit diagram / 电路图 | 用标准符号画出的电路 | electric-circuit |
| series | Series / 串联 | 元件排在同一条路径上，一个接一个 | parallel |
| parallel | Parallel / 并联 | 元件各在自己的路径上，并排接到电池两端 | series |
| conductor | Electrical conductor / 导体 | 能让电流通过的材料：金属、石墨 | insulator |
| insulator | Electrical insulator / 绝缘体 | 不让电流通过的材料：塑料、橡胶、木、玻璃 | conductor |
| short-circuit | Short circuit / 短路 | 电流绕过用电器、走一条几乎没有阻碍的路径，电流很大、发热 | — |

（`fair-test` 若 docs/22 已有同名词，二者各自主题内各一份，定义一致。）

---

## 7. 来源计划（25 条；P# → 施工时的 S#）

| P# | 来源（候选） | 用于 |
|---|---|---|
| P1 | 本设计研究（设计值、§4.2 模型、§1.3 模拟表；不是实测） | 规格行、PLATE、细看 |
| P2 | MOE CPDD，*Science Teaching & Learning Syllabus Primary Three to Six*（2023），第 16 页（表 1 公平测试）、第 18 页（模型与表示）、第 20 页、**第 59 页**（Electrical System P5 Standard）、**第 60 页**（Foundation）。URL 同 docs/22 P2（页码按 2022-10 版文本核对，新版待比对） | 课纲边界、用词 |
| P3 | SEAB，*PSLE Science (Syllabus 0009), 2026*（docs/17 S6） | 题型、评估目标 |
| P4 | OpenStax，*College Physics 2e*：20.1 Current、20.2 Ohm's Law、21.1 Resistors in Series and Parallel、21.2 Electromotive Force: Terminal Voltage https://openstax.org/books/college-physics-2e | F-2–F-7、F-12、F-16 |
| P5 | OpenStax，*College Physics 2e* 20.3（电阻率表：铜、铝、碳 / 石墨、玻璃、橡胶） | F-3、F-11 |
| P6 | HyperPhysics（Georgia State）"Series and parallel circuits"、"Resistivity" | 交叉核对 |
| P7 | IOP Spark，"Some students have differing ideas about what is happening in the wires of an electric circuit when it is working" https://spark.iop.org/some-students-have-differing-ideas-about-what-happening-wires-electric-circuit-when-it-working | 误解 |
| P8 | AA / LR6 数据表（IEC 60086-2 尺寸；厂商数据表只当典型引，不点名），例：Farnell 数据表 https://www.farnell.com/datasheets/3743833.pdf | F-8 |
| P9 | 学校教具目录：MES 灯泡 2.5 V 0.2 A、Ø 30 mm 灯座（Hope Education / Findel 产品页，当典型引） | F-9、§2.2 |
| P10 | 碱性电池内阻、短路电流：厂商技术手册（如 Energizer "Alkaline Handbook"） | F-4 内阻、F-12（待核） |
| P11 | Lamptech，"Incandescent lamps in operation" https://lamptech.co.uk/Documents/IN%20Operation.htm | F-10（> 2,500 °C） |
| P12 | IEEE TechNav "Filament lamps"（钨熔点 3,422 °C、绕丝减少散热） | F-10 |
| P13 | D. M. Shipstone, "A study of children's understanding of electricity in simple DC circuits", *European Journal of Science Education* 6(2), 1984, 185–198 | F-17（摘要） |
| P14 | R. Osborne, "Towards modifying children's ideas about electric current", *Research in Science & Technological Education* 1(1), 1983, 73–82 | F-17（单极、相撞、削弱模型；摘要） |
| P15 | L. C. McDermott & P. S. Shaffer, "Research as a guide for curriculum development: An example from introductory electricity. Part I", *American Journal of Physics* 60(11), 1992, 994–1003 | F-17（顺序推理、电流被用掉） |
| P16 | 铅笔芯电阻的测量（物理教育期刊文章或大学实验讲义） | F-3 铅笔芯 20 Ω（待核） |
| P17 | 新加坡消费品安全局（CPSO），"Tips to Keep your Home Safe from Electrical Hazards" https://www.consumerproductsafety.gov.sg/consumers/product-safety-tips/home-appliances-furniture-and-indoor-product-safety/tips-to-keep-your-home-safe-from-electrical-hazards/ | F-14 |
| P18 | IEC，World Plugs：Singapore（230 V、50 Hz、G 型）https://www.iec.ch/world-plugs | F-13（待核） |
| P19 | BS 1363 插头与保险丝：Commons *BS 1363* 分类说明或英国标准简介 | F-13（待核） |
| P20 | EMA，电气安全专题文章（2025 "Five common electrical safety questions"、2026 "An electrical safety inspector's view"）https://ema.gov.sg/news-events/news/feature-stories | F-14 |
| P21 | EMA，*Singapore Energy Statistics*（发电燃料构成） | F-15（待核最新年份） |
| P22 | LED 手电筒普及的来源（美国能源部照明资料或行业报告） | F-18（待核） |
| P23 | 电池结构：D. Linden & T. Reddy, *Handbook of Batteries*（碱性锌锰、锌碳章节）或厂商技术手册 | F-19 |
| P24 | 蜂鸣器、3 V 玩具电机的典型电流（教具目录 / 元件数据表，当典型引） | F-20（待核） |
| P25 | R. Driver et al., *Making Sense of Secondary Science* (Routledge, 1994) 电学一节 | F-17 补充（待核） |

---

## 8. 图像清单（给 Codex，石墨图版风格）

风格同 docs/22 §8（`STYLE_BRIEF`；首页 1:1、章节图 4:3；只写 SUBJECT）。

### 8.1 首页图版 `genimg/roadmap/circuits.png`：**替换**

已看过：一块木板上电池盒、刀闸开关、灯座、鳄鱼夹导线连成一圈，构图好；但 ① 两节电池上画了 "+" 号（违反 NO text），而且两个 "+" 分别在两节的外侧——即两节**正极对正极**，按图接法会互相抵消；② 灯泡是家用大灯泡（E27 那种），不是课用的小灯泡；③ 刀闸开关的状态（开还是合）看不出。电池方向画反是教学性错误，必须重画。SUBJECT：

> a simple electric circuit laid out on a small wooden board as a plate: a black plastic holder with two AA size cells lying end to end and both pointing the same way, the raised button end of the first cell pressed against the flat end of the second; red and black insulated wires with crocodile clips running from the holder to a small slide switch shown in the closed position and on to a miniature torch bulb, no bigger than a fingertip, screwed into a small round bulb holder, glowing softly; beside the board a cutaway of the same miniature bulb showing the tiny coiled filament held between two support wires; no symbols, no plus or minus signs, no letters

### 8.2 章节配图（7 张，4:3）

| 文件 | 章 | 用途 | SUBJECT |
|---|---|---|---|
| `circuits-torch` | 01 | 手电筒剖面 | a cutaway drawing of an old-fashioned metal torch with a filament bulb, cut lengthwise: two cylindrical cells end to end inside the tube, a conical spring in the tail cap pressing on the last cell, a thin metal strip running along the inside wall from the tail to a sliding switch on the side, the small bulb at the centre of a polished parabolic reflector behind a clear front lens; the switch shown pushed forward in the on position |
| `circuits-tester` | 03 | 用电路测试物体 | a simple circuit tester on a table: a cell holder with two cells, a small bulb in a holder and two wires ending in crocodile clips, the clips gripping the two ends of a short pencil lead, the bulb glowing faintly; laid out next to it a row of everyday objects waiting to be tested: a steel paper clip, a strip of aluminium foil, a short length of copper wire, a plastic drinking straw, a wooden ice cream stick, a rubber band and a glass marble |
| `circuits-series-parallel` | 05 | 串联与并联对照 | two small circuit boards side by side drawn at the same scale and from the same angle: on the left board one cell holder with two cells and two miniature bulbs joined one after the other in a single loop of wire, both bulbs glowing faintly; on the right board the same cells and two identical bulbs each wired on its own separate branch back to the cells, both bulbs glowing brightly, the glow suggested by fine radiating hatch lines; no symbols, no letters |
| `circuits-festive-lights` | 05 | 生活中的串联与并联 | a string of small festive lights draped in loose loops, with one tiny bulb removed from its socket and lying beside the string, the bulbs on one part of the string unlit and the rest lit, suggesting how bulbs joined in a chain all depend on each other; gentle decorative composition, no text |
| `circuits-socket-plug` | 06 | 插座与插头剖面 | a modern three-pin wall socket with a rocker switch mounted on a wall, and in front of it a matching three-pin plug with rectangular pins drawn partly cut open to show the cartridge fuse inside the plug and the three insulated wires inside the cable gripped by a cord clamp; calm, clean technical plate, no hands, no sparks, no text |
| `circuits-power-chain` | 06 | 电从哪里来 | a simplified chain from left to right across the picture: a gas-fired power station with a chimney and a cooling structure on a coastline, tall transmission towers carrying cables, a fenced electrical substation, and a row of tall residential apartment blocks with lit windows; the cables continuous from the power station to the buildings; wide landscape composition, no text |
| `circuits-safety-home` | 06 | 安全习惯（无恐吓） | a tidy home corner drawn as a calm still life: a wall socket with only one plug in it, a drinking glass placed well away on a separate table, a neatly coiled appliance cable with intact insulation, and a household circuit breaker box on the wall with its door open showing a row of breaker switches; no people, no sparks, no damage, no text |

---

## 9. 施工顺序、分工与工作量

| 步 | 内容 | 谁 | 文件 | 完成标准 | 估计 |
|---|---|---|---|---|---|
| 0 | spec 定稿（§0.1）；docs/03 §C、docs/04 改写 | 主会话 + Gavin | docs/23、03、04 | 答复 | — |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts circuits --engine space-scene --subject science --title-en "How Electric Circuits Work" --title-zh "电路是怎么工作的"`；参考图 R1–R10 | 主会话 | 主题目录、refs | validate 绿 | 0.5 天 |
| E1 | E-SIM 核心（若磁铁未先做；见 docs/22 §4.3） | Opus 引擎 | `src/engines/space-scene/lib/sim/`、`explorer/TryIt.tsx`、schema、validate、shoot、docs/06、docs/08 §2 | 单测；已发布主题不回归 | 4–5 天 |
| E2 | E-CIR C1–C6（+ 共享 M2 多路径流、M6 coil、M8 wood，若未做） | Opus 引擎（C1 求解器与 C2 电路图卡可分两个代理：`lib/sim/circuit.ts` ‖ `hud/CircuitCard.tsx`） | 同上（不同文件） | §1.3 全表单测通过；电路图卡截图 | 4–4.5 天 |
| D1 | 数据骨架：35 零件、拓扑路径（导线 sweep 与流路径同源，由 `circuit.edges[].path` 生成）、sim 段、姿态、presets、spec、telemetry；章节 state | Opus 几何 | parts.json 几何与 sim 字段、chapters frontmatter | validate 0 error | 1 天 |
| D2 | R2 几何两轮（手电筒、灯泡、电池、鳄鱼夹对照 R1–R8）→ R3 材质（灯丝发光、玻璃、铜）→ R4 流与绑定 | Opus 视觉 | 同上 + `docs/screenshots/circuits/` | 每轮截图自证 | 2–2.5 天 |
| T | 来源、S1、名词、零件文字、正文与细看（样章：第 05 章） | Opus 事实与文字 | sources.json、glossary.json、文本字段、正文 | sources-md；事实表对应 | 2 天 |
| B | 31 拍定稿 | Sonnet | `state.beats` | `--beats` 0 失败 | 1 天 |
| P | 打磨与审计；Codex 重画首页图 + 7 张章节图 | Sonnet QA；Codex | — | §10 全勾 | 1 天 |

合计：引擎 4–4.5 天（电路专用）+ 共享核心 4–5 天（若先做）；内容 6.5–7 天。

---

## 10. 验收（`acceptance.md` 全部 + 本主题另加）

- [ ] 课纲对齐：第 59 页每条学习结果在正文或拍里出现（电系统、闭合电路、导体绝缘体、从电路图搭电路、电池串联个数、灯泡串联 / 并联个数）；价值观（节约、正确使用）在第 06 章。
- [ ] 必须讲对的六处（§0-5）各有一拍或一段正文；字幕与正文无"电被用掉""一根线就够"的说法。
- [ ] 求解器：§1.3 全表单测通过（3 位有效数字）；X / Y / Z × 主开关 × 拔灯的 32 种组合与手算一致；短路、开路、浮空子图状态正确。
- [ ] 电路图卡：与实物一一对应（每个符号对应一个零件，选中同步）；点开关符号 = 拨实物开关（同一个 store 值，URL 同步）；有电流的路径高亮且方向从正极到负极；手机上在试一试卡片里可用。
- [ ] 亮度：灯丝发光强度单调随亮度读数；0 时完全不发光；两套主题下都看得出 26 / 95 / 100 / 220 的差别。
- [ ] 读数一致：PLATE、字幕、细看、S1 的同一个量同值（0.118 / 0.233 / 0.346 / 0.454 A；26 / 100 / 220 / 95 / 24 / 15 / 7），都写明"在这个模型里 / SIM"。
- [ ] 三种操作方式（触屏、鼠标、键盘 `[` `]` `T`）都能完成每章的试一试；数据表"记一行"；先猜后看不判对错。
- [ ] 安全：第 06 章无吓人画面；短路只在模型里、字幕写"不要这样做"；市电数字带来源。
- [ ] 无文字：电池无 + / − 号、无品牌；极性靠形状与引线标注。
- [ ] 性能：静止 ≤ 50 calls、运转 < 60；`current` 一次绘制；控件切换时求解 < 1 ms、不掉帧。
- [ ] 首页图与 7 张章节图逐张核对（电池同向、小灯泡、无文字、无恐吓画面）。


---

## 11. 实现记录与已知差距（2026-10-14，发布）

**实现记录（提交）**：fc6a559 决定记录；3adfe29 E-SIM 核心 + E-CIR（求解器 98 条单测、线圈原语、电路图卡、试一试卡片、`sim=` URL 状态）+ 电路主题（35 个零件加一张 context 实验台、六章、30 条来源）；6e1b231 四张重画的配图；本轮（QA / 发布）：四张重画的图放回章节、章节与试一试文字修订、`topic.yaml` → `published`、首页 e2e 计数（15 个已发布，科学一栏 2 个：空调、电路）、本节。

**数量**：6 章 31 拍（5 + 5 + 5 + 5 + 6 + 5）；36 个零件（35 + 1 个 context 实验台）、6 组（`current` 组只有流）、1 条流（`current-flow`，多路径）、2 个动画（风扇转动、蜂鸣器振膜）、17 个姿态、6 个预设；12 个试一试控件；16 个名词；30 条来源；7 张章节配图 + 首页图；`pnpm validate` 0 error / 0 warning。

**配图位置**：01 `circuits-torch`；03 `circuits-tester`；05 `circuits-series-parallel`（串联段之后、并联代价段之前）、`circuits-festive-lights`（"开关的组合"之后、细看之前，正文新增两句引出）；06 `circuits-socket-plug`（保护与市电之后）、`circuits-safety-home`（过载与持证电工之后）、`circuits-power-chain`（节约用电之后）。`circuits-festive-lights` 画的是破灯泡之前亮着的整串灯（图说照实写明），没有画"整串熄灭"；`circuits-safety-home` 画的是插座、断路器箱、电热水壶和毛巾，图说只写画面里有的东西，不借图宣讲"毛巾离插座远"。

**求解器的值（取代 §1.3 初稿的三处）**：3 节单灯亮度 **220**（初稿 221）；两灯并联总电流 **0.454 A**（初稿 0.455 A；每只 0.227 A）；短路 **8.24 A**（初稿 8.3 A）。§1.3、§4.1、§10 已按求解器改过；正文、细看、零件 detail、PLATE 读数都用这三个值。

**验收数据**（1920×1080，`--perf`，SwiftShader）：hero 静止 **71 calls** / 0.202 M 三角形；第 01 章 27–28、第 02 章 70、第 03 章 50、第 04 章 35、第 05 章 32、第 06 章 71、剖切展品预设 18 calls；FLOW 开 / 关没有差别（流一次绘制；第 01 章 27–28 calls）。三角形远低于 0.3 M，calls 在上限 100 以内但**高于静止 < 50 的目标**：35 个零件共 70 个材质槽（每件一个或多个，如电池 = 钢壳 + 铜帽，开关 = 黄铜 + 塑料），引擎对每个零件单独建材质，同材质的不同零件不合并，要合并就得把零件并成一件、失去单独选中与标注；没有这样做。见已知差距。
**节拍**：EN / ZH × paper / cinema 四种组合 `pnpm shoot circuits --beats` 0 失败，chapter highlights 全部在屏；`--keys`（含 `[` `]` `T`）0 失败，七个尺寸 `--layout` 0 问题，console 干净、无外部请求。
**试一试**（无头浏览器逐个手动走过，EN）：第 02 章先猜后看（选"熄灭" → 显示 "You predicted: Goes out / Observed: Goes out"，"再试一次"回到起点，URL 带 `main.on~gap.empty`）；第 04 章电池节数步进 1 → 2 → 3（0.118 / 0.233 / 0.346 A，亮度 26 / 100 / 220）、"记一行"写进表格、装反第二节 → 0.115 A、亮度 24，URL `cells.3~flip-2.on`；第 05 章接法选择（单灯 / 串联 / 并联 / 自由 = 100 / 26 / 95 / 95），点电路图上的开关符号会拨动真实开关（`aria-pressed` 与 URL `x.on` 同步，三个都合上显示 8.24 A、`SHORT`），刷新页面后状态还原；第 06 章先猜后看（短路，亮度趋近 0）。手机竖屏（zh）抽屉里的试一试卡片和电路图开关触控目标都是 44 × 44 px。
**手机（390 × 844）**：与其他 SpaceScene 主题一样，LAYERS / TOOLS 叠层盖住舞台右半；阅读抽屉里有节拍行 ‹ ›，试一试卡片整张可用。截图 `docs/screenshots/circuits/phone-390.png`（zh、试一试卡片）、`phone-390-stage.png`。
**规范截图**（`docs/screenshots/circuits/`，本地不进 git）：`ch01…ch06-*-paper`、`hero-clean`、`hero-dark-zh`、`cutaways`、`short-circuit`、`mode-xray`、`mode-exploded`、`try-ch04-paper`、`try-ch05-cinema`、`ch02-zh-paper`、`phone-390`。

**施工中的决定**
- **刀闸**：板上的主开关与 X / Y / Z 做成刀闸（§2.1 写的备选，不用推荐的拨动开关）：断开时刀片翘起、合上时压进夹子，一眼看出开合；手电筒里仍是推拉开关。
- **灯泡发光的绑定**：板上灯泡把灯丝（`filament-a/b`）和玻璃（`bulb-a/b`）分成两个零件，各绑同一个亮度输出，玻璃用线性曲线、`full: 1400`，灯丝用平方根曲线、`full: 100`。手电筒灯泡是一个零件，灯丝与玻璃共用一个发光值。
- **试一试先猜后看的对照量**：`predict` 用 `bright-a`；短路时灯 A 的亮度是接近 0 的小正数（旁路电阻不是 0），所以第 06 章"两只都灭"的选项标 `means: "less"`（引擎只在读数精确为 0 时才判"归零"）。第 02 章提示里写明"开关合上、灯泡亮着"，因为预测从 `main: true` 开始，而本章第一拍还没合开关。
- **配图**：四张重画的图（并联接法、彩灯、安全习惯、电从哪里来）按 §5.8 放回；彩灯图和安全图的图说按画面如实写，不替图补充画面里没有的内容。

**已知差距**
- **静止 71 calls**（目标 < 50，上限 100，见上）：70 个材质槽，同材质的零件不合并。可以再省的只有把一些剖切展品（电池剖面 6 槽、灯泡剖面 4 槽）简化，代价是写实度；暂不做。
- **cinema 下木头偏亮**：木头材质族的 cinema 色（`presets` / `lib/color.ts` 里的 `wood.color.cinema`）是引擎里的值，不是数据；暗色背景上整块实验台与电路板偏亮，左列标题块与 PLATE 块的小字压在木头上不好读。要改需要把该族的 cinema 色调暗，或让 `tint` 支持逐主题的值。
- **图例里"Current / 电流"出现两次**：右侧 KEY 里组（填色块）和流（箭头）各列一项，名字都来自 `current` 组；空调的制冷剂回路与空气路径同理。`ExplorerOverlay` 的 legend 只要跳过没有零件的组即可，是引擎改动。
- **手电筒灯泡的发光偏小**：灯泡本身只有 12 mm，发光绑在整个零件的自发光上，玻璃近乎透明，所以 `torch-view` 距离上只看到灯丝和一小圈亮。把 `full` 从 100 调到 12（等级上限 2）几乎看不出变化；要明显，需要引擎给灯泡加光晕（sprite）。
- 封面（HUD 关）里电路板只占宽约 55 %，实验台占了画面其余部分；低于 65–80 % 的目标。
- 求解器的灯泡电阻恒定（§4.2 与真实的差别）；短路时导线发热用 `leads` 的热色发光和热色粒子表示，不是温度模拟。
- 彩灯图画的是破灯泡之前整串亮着的样子（见上）。
