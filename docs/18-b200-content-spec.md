# 18 · 一台 8 卡 AI 服务器（DGX B200 级）· 内容施工 spec（v1 草案）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §2 封闭设备（Enclosed equipment）。本主题的任务：**读者看完能说清一台 AI 服务器是什么、里面有哪几大块、电和数据和热怎么走、为什么要 8 块 GPU 用 NVLink 连在一起、它怎样装进机柜和数据中心**。`subject: computer`（`src/content/schema/topic.ts` 的 `SUBJECTS` 第六项，UI 名 "Computing / 计算机"；本主题是这一类的第一个）。

正文、字幕、来源条目未经 Gavin 定稿不写（CLAUDE.md）。本文的事实是 2026-10-13 起草时联网读过的（§1.3 每条注明 P#，§10 有网址）；标"待核"的是只读到二手来源、只读到图、或凭推算给出的工作值，施工代理读原文核对后才能用，核不到就换值或删掉。

结构照 skill `atlas-space-topic` 的 `references/spec-template.md`，章节编号按本主题的 brief 重排（模板 → 本文）：决策 §0 → §0；主题与对象 §1.1 → §1.1–1.2；事实表 §1.2 → §1.3；口吻 §1.3 → §1.4；参考图 §9.1 → §2；分区与零件 §2–§3 → §3；流 §4 → §4；动画 §5 → §5；剖切与模式 §7.5 → §6；章节 §6 → §7；HUD §7 → §8；名词 §6.N → §9；来源 §9.2 → §10；施工、验收、引擎缺口、已知风险 §8/§10/§12 → §11；待确认 §11 → §12。

## 0. 决策记录（2026-10-13 起草，待 Gavin 定稿）

| # | 决定（提议） |
|---|---|
| 1 | **对象 = NVIDIA DGX B200**（10U、8 块 B200、2 颗 Xeon Platinum 8570），而不是"通用 HGX B200 OEM 服务器"。理由：DGX B200 是唯一一份公开文档把尺寸、重量、功率、电源、风量、风扇数、托盘布局、网络端口全部写出来的 B200 整机（P2、P3）；OEM 机型（Supermicro、ASRock Rack 等）高度 8U–10U、主板在上或在下、风扇可否热插拔都不同（P15、P33），做"通用"只能把每个数字都写成区间，而布局又必须选一种。见 §12-1 |
| 2 | 与 skill"无品牌、无型号"规则的关系：那条规则是给"通用设计研究"（空调）定的。本主题讲的是一类真实产品，NVIDIA、B200、Blackwell、NVLink、NVSwitch、ConnectX、BlueField、Intel Xeon 是**事实名词**，正文、零件名、名词表照写（不写它们就讲不清）。但：**模型上无 logo、无铭牌、无文字**；不比较厂商、不推荐购买、不写价格（没有官方公开定价，§1.3 F-40）；所有性能峰值写"NVIDIA 称 / NVIDIA claims"并注明稀疏 / 稠密口径。标题块 `note`：EN "Independent visualization study · not an NVIDIA publication · geometry reconstructed from public documents" / ZH "独立可视化研究 · 非 NVIDIA 官方资料 · 几何按公开文档重建"（fact-discipline §5）。需 Gavin 确认，§12-1 |
| 3 | 范围：讲**整机结构、电 / 数据 / 热三条路径、GPU 与 NVLink 为什么重要、机柜与数据中心的尺度和能耗**。不讲：CUDA 编程、神经网络数学（只用一句"大量乘加运算"）、软件栈（DGX OS、Mission Control 只在细看提一次）、股价与公司新闻、出口管制、价格。GPU 芯片内部（SM、Tensor Core 微结构）只讲到"两块裸片 + 8 叠 HBM"这一层（§12-3） |
| 4 | **必须讲对的两处**：① **插进去的电几乎全部变成热**：14.3 kW 的最大用电就是 14.3 kW 的发热（48,794 BTU/h，P3），所以风扇墙和数据中心的冷却与计算一样重要；② **峰值算力是厂商口径**：DGX B200 "144 PFLOPS FP4"是**稀疏**口径，稠密为一半（72 PFLOPS），且是 4 位精度；真实训练跑不到峰值。正文、规格行、字幕一律带口径 |
| 5 | 6 章：01 整台机器 / 02 打开机箱 / 03 GPU 与 NVLink / 04 主机一侧：CPU、内存、存储、网络 / 05 电与热 / 06 机柜与数据中心。docs/04 的 computer 类目前只有"二进制与像素（待定）"，定稿后在 docs/04 加本主题一行 |
| 6 | 分区：有零件的组 01 `chassis` 机箱（`card: false`）/ 02 `cooling` 风扇墙 / 03 `gpu-tray` GPU 托盘 / 04 `host` 主机托盘（主板托盘 + 前部硬盘）/ 05 `power` 电源；只有流的组 `air` 气流 / `current` 电 / `data` 数据；场景组 `scene`（context：比例人形、机柜框、同柜邻机，`card: false`）。右上卡 4 列 = cooling、gpu-tray、host、power |
| 7 | 模型布局：**按真实布局**（P3 的前视、后视、两个托盘的俯视图 + P16 的 HGX B200 实拍）：前面是 20 个风扇模块和 8 块 U.2 硬盘，后面自上而下是 GPU 托盘（约 6.6U）、主板托盘（2U）、6 个电源；两个托盘都从后部抽出、前端插在中板（midplane）上。看不到的内部（中板形状、配电走线、托盘后部封闭舱）是**重建**，标"示意"并在 detail 和已知差距里写明。第 06 章的机柜和邻机是 context 示意 |
| 8 | 事实纪律：规格行是厂商公开值（P2、P3），不是 DESIGN；PLATE 块读数是 **SIM**，由设计研究来源 S1 的模拟运行点算出、内部自洽（§1.3 末）；零件几何是 RECONSTRUCTION（按图量取，每项写来源图）。厂商峰值一律"NVIDIA 称"。来源冲突并列（F-1 宽度 482.2 / 482.3 mm；F-30 华氏温度） |
| 9 | 单位：SI（mm / m、kg、kW、°C、m³/h）；风量另注 CFM（厂商原单位），发热另注 BTU/h；带宽写 **TB/s（字节）** 与 **Gb/s（比特）** 时每次注明，正文第一次出现时解释 1 字节 = 8 比特；存储与显存用 GB / TB（十进制，厂商口径） |
| 10 | 不做：logo / 铭牌 / 屏幕文字 / 照片贴图 / 视频 / 配音文件 / 测验（默认不做） / 价格。人形比例尺只做中性剪影（§12-2） |

### 0.1 定稿（2026-10-13，主会话按 Gavin 惯例代定；§12 的问题逐条）

1. 对象 = **NVIDIA DGX B200**，型号、厂商名作为事实出现（产品类主题不适用健身卡的"无品牌"规则）；峰值算力一律写"NVIDIA 宣称"并注明稀疏 / 稠密与精度。
2. 显示 1.70 m 的人作比例（context 零件）。
3. GPU 章深度止于双裸片 + 8 个 HBM 堆，不再往下。
4. NVL72 只做文字 + 机柜配图，不做第二个模型。
5. NVIDIA 文档图只在本地 `scripts/geo/b200-server/refs/`（gitignore）对照，不进 git、不进站点；Commons 图照常署名。
6. `fact` 标签（E2）不做；规格行照现有写法。
7. 保留 GPU 温度与风扇转速读数，标 SIM；风扇用 %。
8. 新加坡能耗数字只在有 IMDA / EMA 一手来源时写，否则删。
9. Codex 的 `b200-server`、`b200-airflow`、`b200-rack` 三张按 §2.3 的修正提示重画；其余四张可用。

## 1. 主题与范围

### 1.1 读者学到什么

1. **AI 服务器是什么**：一台装在机柜里的计算机，但主要算力来自 8 块 GPU（图形处理器，现在主要用来做大量并行的乘加运算），CPU 负责调度、喂数据、管网络和存储。
2. **里面有什么**（按真实位置）：前面板与风扇墙 → 上层 GPU 托盘（8 个 GPU 模块、两颗 NVSwitch 芯片、高大的散热器）→ 下层主板托盘（2 颗 CPU、32 根内存、网卡）→ 最下层 6 个电源；前下方 8 块数据盘。
3. **电、数据、热怎么走**：交流电 → 电源 → 配电 → 中板 → GPU；数据在 GPU 之间走 NVLink、GPU 与 CPU 之间走 PCIe、出机器走 8 条 400 Gb/s 网络；空气从前往后被风扇抽过散热器，带走几乎全部电能变成的热。
4. **为什么要 8 块 GPU、为什么要 NVLink**：大模型的参数放不进一块 GPU 的显存，计算要拆到多块 GPU 上，它们每一步都要交换数据；NVLink 让每块 GPU 以约 1.8 TB/s 和其他 7 块通信，约为一条 PCIe 5.0 x16 的 14 倍（F-16）。
5. **它在机柜和数据中心里**：一个机柜放 2 台（NVIDIA 参考架构），32 台组成一个"可扩展单元"，上千台连成一个训练集群；NVL72 这类液冷整柜是另一条路线；数据中心用电在全球的分量（IEA）。

读者：好奇的孩子和成人。通俗不幼稚、客观、无营销口吻（§1.4）。

### 1.2 对象（按真实位置，P3 图）

- **前面**：可拆的装饰面板（bezel，香槟金色、粗糙的海绵状表面）；拿掉后是 **4 排 × 5 列 = 20 个风扇模块**（每个模块里前后两个风扇，P4），最下面一条是 **8 块 3.84 TB U.2 NVMe 硬盘**、2 个 USB、1 个 VGA、环境温度传感器；右上角竖排电源键 / 状态灯、UID 键、故障灯（P3）。
- **上层：GPU 托盘**（约占 6.6U，后视图量取，待核）：HGX B200 基板上 8 个 GPU 模块，**每排 4 个、前后两排**，两排之间是盖着导风罩的 **2 颗 NVSwitch**（P3 图"2 x NVSwitches with 5th generation NVlink"）；每个 GPU 模块顶着一个高塔式散热器（P16 实拍）；托盘前端是插到中板上的高密度连接器（"Midplane connectivity: Power, PCIe, sensors and signaling"，P3），后端是穿孔排风面。
- **中层：主板托盘**（2U）：后部是 PCIe 转接卡（2 块 BlueField-3、1 块 100 GbE 网卡、M.2 启动盘载板）和中间的 4 个 OSFP 网口；中部是 2 颗 CPU 各带 16 根内存；前部（靠中板）是 2 个网络模块、每个含 4 个 ConnectX-7，用 4 根线缆接到后面的 OSFP 口（P3 图）。
- **下层：电源**：后面 6 个 3.3 kW 电源并排（P3）；前面是 U.2 硬盘；中间的配电板 / 母排是**重建**（P3 没有图，待核）。
- **中板**：风扇墙和两个托盘之间的竖板，两个托盘都插在它上面（P3 两张托盘图的"Midplane connectivity"）；形状和开孔是重建，待核。

### 1.3 事实表（FACT / RECONSTRUCTION / SIM）

本主题讲的是真实产品，所以分类和空调不同：`FACT` = 厂商公开页面明确写出的值（P#）；`TYPICAL` = 第三方或行业资料给出的值；`RECON` = 按图量取的几何（写明哪张图）；`SIM` = 设计研究 S1 的模拟运行点。P# → §10，施工时变 S#。

| # | 项 | 值（来源） | 类 | 待核 |
|---|---|---|---|---|
| F-1 | 机架高度 / 外形 | 10U；高 444 mm（17.5 in）；宽 482.3 mm max（用户指南）/ 482.2 mm（产品页）；深 897.1 mm max（P2、P3）。1U = 44.45 mm，10U = 444.5 mm（P25） | FACT | 宽度两处差 0.1 mm，并列不选 |
| F-2 | 重量 | 142.4 kg（313.9 lb）max（P3）；约等于 2.3 个 62 kg 的成人（全球成人平均体重 62 kg，P27） | FACT | P27 原文核对 |
| F-3 | GPU | 8 × NVIDIA B200（Blackwell），SXM 模块（P2、P3）；第三方称 "SXM6 180GB"（P15） | FACT / TYPICAL | "SXM6" 只见于 P15 |
| F-4 | 显存 | 系统 1,440 GB HBM3e、64 TB/s（P2）→ 每块 180 GB、8 TB/s（除法）；B200 芯片物理上 8 叠 × 24 GB = 192 GB，每叠约 1 TB/s（P8、P9）。DGX 里启用 180 GB 的原因 NVIDIA 未说明 | FACT / TYPICAL | 180 vs 192 并列，不解释原因 |
| F-5 | GPU 芯片 | 2080 亿（208 billion）晶体管；两块"达到光罩极限"的裸片，片间互连 10 TB/s，对软件表现为一块 GPU；TSMC 4NP 工艺（P6）；每块裸片 1040 亿（P8 推算口径） | FACT / TYPICAL | 每片 1040 亿出自 P8 |
| F-6 | HBM 排布 | 每块裸片 4 叠 HBM3e（P9） | TYPICAL | 封装上的排布（每片外侧一列还是上下各两叠）要对 NVIDIA GTC 2024 封装照片 |
| F-7 | 每块 GPU 最大功率 | 1,000 W（5 个以上电源工作时；3–4 个电源时 800 W，P3） | FACT | |
| F-8 | 峰值算力（NVIDIA 称） | FP4 Tensor Core：144 PFLOPS 稀疏 / 72 PFLOPS 稠密；FP8：72 PFLOPS（稀疏），稠密为一半 = 36 PFLOPS（P2 脚注）。每块 GPU 按 1/8：FP4 稠密 9 PFLOPS | FACT（厂商口径） | 正文必须带"NVIDIA 称 + 稀疏 / 稠密 + 精度" |
| F-9 | HGX B200 其他精度（NVIDIA 称） | FP16/BF16 36 PF（稀疏）、TF32 18 PF（稀疏）、FP32 600 TF、FP64 296 TF（P5） | FACT（厂商口径） | 只放细看 |
| F-10 | NVLink（第 5 代） | 每块 GPU 1,800 GB/s、18 条链路（P7）→ 每条 100 GB/s（除法）；系统合计 14.4 TB/s（P2、P5） | FACT | |
| F-11 | NVSwitch | 2 颗第 5 代 NVLink Switch，合计 14.4 TB/s（P3）；每颗 72 个端口、全双向 7.2 TB/s、约 800 mm²、TSMC 4NP（Hot Chips 2024 预告，P29） | FACT / TYPICAL | 端口数与面积只见二手来源，读 NVIDIA Hot Chips 2024 幻灯片 |
| F-12 | NVLink 拓扑 | 8 块 × 18 条 = 144 条链路 = 2 颗 × 72 端口 → 每块 GPU 给每颗 NVSwitch 9 条（算术 + P3 拓扑图） | RECON | 是（推算） |
| F-13 | 跨机 NVLink / NVL72 | 第 5 代 NVLink 可扩到 576 块 GPU；NVL72 = 72 块 GPU 一个 NVLink 域、130 TB/s（P6、P7、P18） | FACT | |
| F-14 | CPU | 2 × Intel Xeon Platinum 8570：每颗 56 核 112 线程，2.1 GHz 基频 / 4.0 GHz 睿频，300 MB 缓存，TDP 350 W，8 通道 DDR5-5600，PCIe 5.0，Intel 7 工艺，2023 Q4 发布（P11）；系统 112 核（P2） | FACT | DGX 里内存实际运行频率 |
| F-15 | 系统内存 | 2 TB = 32 × 64 GB DIMM，可换 128 GB 条到 4 TB（P3 图注） | FACT | |
| F-16 | PCIe 5.0 x16 | 每通道 32 GT/s，x16 每方向约 64 GB/s、双向约 128 GB/s（P14）→ NVLink 1.8 TB/s ÷ 0.128 TB/s ≈ 14 倍（算术） | TYPICAL | P14 原页面措辞 |
| F-17 | 存储 | 系统盘 2 × 1.92 TB NVMe M.2（RAID 1）；数据缓存 8 × 3.84 TB NVMe U.2 自加密盘（RAID 0）= 30.72 TB（P3） | FACT | |
| F-18 | 集群网络 | 4 个 OSFP 口，每口接 2 块单口 ConnectX-7 → 8 × 400 Gb/s（InfiniBand 或以太网）（P2、P3）；8 × 400 Gb/s = 3.2 Tb/s = 400 GB/s 每方向；HGX 页写"Networking bandwidth 0.8 TB/s"（P5，双向口径） | FACT | |
| F-19 | 存储与管理网络 | 2 × 双口 BlueField-3 DPU（QSFP112，最高 400 Gb/s，P2、P3）；可选双口 100 GbE（slot 3）；10 GbE RJ45；BMC 1 GbE RJ45（P3） | FACT | BF-3 的 Arm 核数（记忆中 16 × Cortex-A78）读 P13 原文 |
| F-20 | ConnectX-7 | 单口 400 Gb/s NDR InfiniBand / 400GbE，PCIe 5.0 x16（P12，以独立网卡 SKU 为例） | TYPICAL | DGX 里是网络模块上的芯片，不是独立卡 |
| F-21 | GPU 与网卡的对应 | 每块 GPU 配一个 ConnectX-7（经 PCIe 交换）；每颗 CPU 管 4 块 GPU、4 个网卡（P3 系统拓扑图） | FACT（读图） | |
| F-22 | 电源 | 6 × 3.3 kW；每个 3,300 W @ 200–240 V AC、16 A、50–60 Hz；5+1 冗余；少于 3 个电源只能开 BMC（P3） | FACT | |
| F-23 | 最大功率 | 约 14.3 kW max（P2、P3）；发热 48,794 BTU/h（P3；14.3 kW × 3,412 ≈ 48,792 ✓） | FACT | |
| F-24 | 风量 | 1,550 CFM（P3）= 2,633 m³/h（× 1.699）；前进后出 | FACT | 是否对应 100 % 风扇转速未写（DGX H100 写"1105 CFM @ 80% fan PWM"，P32） |
| F-25 | 风扇 | 20 个风扇模块（P3 前视图注）；每个模块两个风扇，编号 `_F` / `_R`，任一个坏要整模块换，换时 30 秒内完成以免过热（P4） | FACT | 风扇直径、转速、是否对转：无公开数，见 F-41 |
| F-26 | 托盘与中板 | GPU 托盘、主板托盘都有"Midplane connectivity: Power, PCIe, sensors and signaling communications"（P3 图注）；主板托盘向后抽出，端口在后（P4、P17"ports on the back of the DGX B200 CPU tray"） | FACT（读图） | GPU 托盘也从后部抽出：按 P3 图推断（一端连接器、一端提手），读服务手册核对 |
| F-27 | 托盘高度 | 后视图按 444 mm 比例量取：GPU 托盘约 297 mm（≈ 6.7U），主板托盘约 84 mm（≈ 2U），电源层约 54 mm（P3 后视图）；第三方：风冷 HGX B200 托盘 6U、H200 为 4U（P15） | RECON | 是 |
| F-28 | 风扇墙与硬盘 | 前视图量取：风扇区约 440 × 370 mm（5 × 4 个模块，每个约 88 × 92 mm）；底条约 55 mm 高，左右各 4 块 U.2（2 × 2）（P3 前视图） | RECON | 是 |
| F-29 | 工作环境 | 进风 10–35 °C；相对湿度 20–80 %（不凝露）（P3） | FACT | |
| F-30 | 华氏温度冲突 | 用户指南 50–95 °F（P3）；产品页 "10-35°C (50-90°F)"（P2，35 °C = 95 °F，产品页疑为笔误） | FACT（冲突） | 正文只写摄氏，`note` 记冲突 |
| F-31 | 前代对照 | DGX H100：8U、356 mm 高、130.45 kg、1105 CFM @ 80 % PWM、6 个电源 4+2 冗余（P32） | FACT | 只放细看 |
| F-32 | 发布 | 2024-03-18 GTC 发布 Blackwell 平台（P10） | FACT | |
| F-33 | 部件尺寸（标准） | DDR5 RDIMM 约 133.35 × 31.25 mm（P30）；U.2 2.5 英寸盘 69.85 × 100.45 × 15 mm（P31）；Xeon（LGA4677）封装约 77.5 × 56.5 mm（P11） | TYPICAL | P30、P31、封装尺寸逐条核 |
| F-34 | 机柜密度 | DGX SuperPOD（B200）：一个可扩展单元（SU）= 32 台；"单个机柜可支持每柜两台 DGX B200"；示例布局每柜功耗超过 25 kW；4 个 SU 127–128 台（测试规模），表里可到 64 个 SU、2,048 台、16,384 块 GPU；计算网络为 NDR 400 Gb/s InfiniBand、按"轨"优化（rail-optimized）的胖树（P17，RA-11334-001，2025-04-24） | FACT | |
| F-35 | NVL72 | GB200 NVL72：72 块 Blackwell GPU + 36 颗 Grace CPU，液冷，130 TB/s NVLink，13.4 TB HBM3e（P18）；18 个 1U 计算托盘 + 9 个 1U NVLink 交换托盘（P20）；整柜约 120 kW 冷却量，直接液冷（P19） | FACT | |
| F-36 | 全球数据中心用电 | 2024 年约 415 TWh，约占全球用电 1.5 %；预计 2030 年约 945 TWh；"一个典型的 AI 数据中心用电相当于 10 万户家庭"（IEA，P21） | FACT（机构） | |
| F-37 | 新加坡 | IMDA《绿色数据中心路线图》2024-05-30 发布，至少再给 300 MW 容量（P24 二手）；数据中心约占全国用电 7 %（二手报道） | TYPICAL | 7 % 与 300 MW 读 IMDA 原文，核不到就删 |
| F-38 | 训练规模示例（不是 B200） | Llama 3.1 405B：30.84 M GPU 小时，H100-80GB（TDP 700 W），约 15 万亿 token 预训练，基于所在地的排放 8,930 t CO₂e（P22）；最多用到约 16K 块 H100（P23）。算术：30.84 M ÷ 16,384 ≈ 1,882 小时 ≈ 78 天（假设全部连续运行，真实排程不同） | FACT + 算术 | P23 原文措辞 |
| F-39 | 显存与模型大小（算术） | 4050 亿参数 × 1 字节（FP8）≈ 405 GB > 一块 GPU 的 180 GB；× 2 字节（BF16）≈ 810 GB < 8 块合计 1,440 GB（只算权重，不算训练时的其他数据） | 算术 | 写明"只算权重" |
| F-40 | 价格 | NVIDIA 未公开标价；零售报价各异 | — | **不写**（§0-2） |
| F-41 | 风扇转速 | 无公开数 | — | PLATE 块改用"风扇转速 %"（§8.3），除非施工时找到 DGX B200 风扇规格 |
| F-42 | 家庭用电对照 | EMA《新加坡能源统计》各类组屋平均月用电（如四房式约 350–400 kWh/月，凭记忆） | TYPICAL | 是：读 EMA 原表，核不到就删这个对照 |

**模拟运行点（SIM，内部自洽，写进 S1）**：

- 环境：进风 25 °C（在 F-29 的 10–35 °C 内）；空气密度 1.184 kg/m³、比热 1.006 kJ/(kg·K)（P26）。
- **满负荷训练（RUN）**：GPU 8 × 0.95 kW = 7.60 kW（低于 F-7 的 1,000 W 上限）；CPU 2 × 0.30 kW = 0.60 kW（低于 F-14 的 350 W TDP）；其余（内存、NVSwitch、网卡与 DPU、硬盘、风扇、板卡损耗）**假设** 3.55 kW（无公开分项，待核，只当设计研究假设）→ 直流合计 11.75 kW；电源效率**假设** 0.94 → 交流输入 **12.5 kW**（低于 F-23 的 14.3 kW max）。
- 热：输入的电全部变成热 = 12.5 kW。风扇 **80 %** → 风量按与转速成正比（风机定律，P26 待核）= 0.8 × 1,550 CFM = 1,240 CFM = **2,107 m³/h** = 0.5852 m³/s → 质量流量 0.5852 × 1.184 = 0.6929 kg/s → 温升 = 12.5 ÷ (0.6929 × 1.006) = **17.9 K** → 出风约 **42.9 °C**。（假设 1,550 CFM 对应 100 % 转速，待核；电源自带风扇的风并进主风量里算，是简化。）
- **开机空闲（IDLE）**：GPU 8 × 0.14 kW = 1.12 kW、CPU 2 × 0.10 kW = 0.20 kW、其余 0.40 kW → 直流 1.72 kW ÷ 0.94 = **1.8 kW**（假设，待核）；风扇 30 % → 465 CFM = **790 m³/h** = 0.2195 m³/s → 0.2599 kg/s → 温升 = 1.83 ÷ (0.2599 × 1.006) = **7.0 K** → 出风约 **32.0 °C**。
- GPU 温度：空闲 34 °C、满负荷 72 °C——**纯示意值**，NVIDIA 没有公开 B200 在 DGX 里的典型工作温度；施工时查 `nvidia-smi` 给 B200 的降频 / 关机阈值，确保示意值低于它们，查不到就把这一行换成"GPU 功率"（§8.3）。
- 能量：满负荷一天 12.5 × 24 = **300 kWh**；按最大 14.3 kW 一年 14.3 × 8,760 ≈ **125 MWh**（算术，写明"如果一整年都满负荷"）。
- 这些数字只出现在 PLATE 块读数（SIM 芯片）、细看（写明"模拟运行点"）、字幕（写"在这个模拟里"）；正文写厂商的 FACT 和取整范围。

### 1.4 口吻

- 照 `writing-rules.md`：短句、具体、先看到什么再讲为什么；不拟人（"GPU 很努力""服务器在思考"都不写）、不喊"小朋友"、无感叹号、无问句标题、不写"神奇的 / 最强的 / 革命性的"。
- **无营销口吻**：不抄"AI powerhouse""breakthrough""most powerful chips ever built"（P17 原文就是这种），峰值写"NVIDIA 称……（稀疏口径，稠密为一半）"；"比上一代快 N 倍"之类的厂商对比只在细看、带脚注条件，或不写。
- 课纲对齐（MOE 小学科学）：能量形式与转换（电能 → 热能）、热的传递（热从较热处传到较冷处；金属是热的良导体，所以散热器用铝和铜）、电路（电源、导线）。计算机本身不在小学科学课纲里，`moe: []`，`tags: [computing, energy]`。
- 进名词表的专业词见 §9；FLOPS、字节 / 比特、PCIe 第一次出现当场用一句话解释。
- 伦理与社会：只讲能耗、冷却、用水（NVL72 页的"减少用水"只作厂商说法引用）这类有来源的事实；不讨论 AI 的好坏、不评论公司。

## 2. 写实策略与参考图

### 2.1 读者看得见、必须和真机对上的（Tier-1）

照 `archetypes.md` §2 的 Tier-1：外包络比例、框架轮廓、前部模块位置、底部大件、核心功能体、识别度最高的管路。本主题具体是：

| Tier-1 | 必须对上的地方 | 依据 |
|---|---|---|
| 外包络 | 444 × 447（机身）/ 482（含挂耳）× 897 mm；10U；接近正方形的前脸 | F-1，R1–R3 |
| 前面板 | 一整块金色面板，四角圆角，右侧竖排 3 个指示；拿掉后 4 × 5 风扇模块 + 底部硬盘条 | R1、R2 |
| 风扇墙 | 20 个模块、每个两只风扇；前后两层转子 | F-25，R2 |
| 后面三层 | 上：GPU 托盘的穿孔排风面（约占 2/3 高）；中：主板托盘的端口和转接卡；下：6 个电源并排 | R3、R4 |
| GPU 托盘 | 8 个高塔散热器 **4 × 2**，两排之间一个和塔一样高的黑色导风罩（下面是 NVSwitch）；前端一排高密度连接器 | R5、R8 |
| 主板托盘 | 2 颗 CPU 低矮散热器、各自两侧成排的竖直内存条（长边顺着气流）；靠中板的两个网络模块；后部转接卡和 OSFP | R6 |
| 机柜 | 第 06 章：19 英寸机柜里一台在下、一台在上（两台一柜，F-34） | R9 |

### 2.2 程序化建模的取舍

- 全部用引擎 primitive（docs/06），**不用 glb**（skill：真实网格只给有机体）。照片只用于对照，不当贴图（fact-discipline §6）。
- 前面板的海绵状金色表面、排风面的六角穿孔：引擎没有穿孔 / 纹理件，面板用 `powder` + 香槟金 `tint`（实色），排风面用 `grille slats`（细格条）近似；差别写进已知差距（§11.5），可选引擎缺口 E3。
- 散热器鳍片：真实片距约 1–2 mm（待核），模型用约 4 mm 的可视片距（避免摩尔纹），detail 写明。
- 芯片尺寸是真实尺度（裸片约 26 × 33 mm 量级，待核），近景镜头读得出；整机镜头下看不清是正常的。
- 内部看不到的（中板开孔、配电板与母排、托盘后部封闭舱的内容、PCIe 交换芯片位置）一律标"示意 / reconstruction"，不编造型号与数量。

### 2.3 参考图（`scripts/geo/b200-server/refs/`，gitignore，不发布）

许可：NVIDIA 文档图版权归 NVIDIA，**只在本地对照、不进 git、不进站点**；这是 skill"只用 CC / 公有领域"规则的例外，需 Gavin 同意（§12-5）。Commons 图按 CC BY-SA 4.0，本地对照无需署名，若将来引用要署名。

| # | 文件（建议名） | 来源 | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | `01-front-bezel-nvidia-ug.png` | P3 `_images/dgx-b200-with-bezel.png` | © NVIDIA，本地对照 | 面板外形、圆角、香槟金色、右侧三个指示、8 颗挂耳螺丝 |
| R2 | `02-front-fans-nvidia-ug.png` | P3 `_images/dgx-b200-front-view.png` | © NVIDIA | **20 个风扇模块 4 × 5**、底部 8 块 U.2（左右各 2 × 2）、中间 2 USB + VGA + 温度传感器 |
| R3 | `03-rear-modules-nvidia-ug.png` | P3 `_images/dgx-b200-rear-panel-modules.png` | © NVIDIA | 三层比例（GPU 托盘 / 主板托盘 / 6 个电源）、穿孔面、托盘下沿两个锁扣 |
| R4 | `04-rear-ports-nvidia-ug.png` | P3 `_images/dgx-b200-port-view.png` | © NVIDIA | 主板托盘后面板：slot 1–4、4 个 OSFP、BMC / LAN、UID / 电源键、7 段数码管、串口 |
| R5 | `05-gpu-tray-top-nvidia-ug.png` | P3 `_images/dgx-b200-gpu-tray.png` | © NVIDIA | 8 GPU 的 4 × 2 排布、中间导风罩下的 2 颗 NVSwitch、一端连接器、一端提手与封闭舱 |
| R6 | `06-mb-tray-top-nvidia-ug.png` | P3 `_images/dgx-b200-mb-tray-comp.png` | © NVIDIA | 后部转接卡与 OSFP、2 CPU + 4 组内存、2 个网络模块（各 4 个 ConnectX-7）、4 根线缆、中板连接 |
| R7 | `07-topology-nvidia-ug.png` | P3 `_images/dgx-b200-system-topology.png` | © NVIDIA | GPU ↔ NVSwitch 的连线、CPU ↔ PCIe 交换 ↔ 网卡 / NVMe / DPU，用于流的路径 |
| R8 | `08-hgx-b200-commons.jpg` | P16 Commons `File:Nvidia_DGX-B200-HGX.jpg`（Pokiiri，2025-09-07） | CC BY-SA 4.0 | **散热塔的真实比例**（高约为宽的 2.5 倍，待量）、顶部金色鳍片、黑色侧罩、中间同高导风罩、基板边缘连接器和矮散热器 |
| R9 | `09-superpod-rack-ra.pdf` 图 3.1 | P17 RA-11334-001 | © NVIDIA | 机柜布局（每柜两台） |
| R10 | `10-asrock-hgx-tray-sth.jpg` | P15 ServeTheHome 评测第 2 页 | © STH | 风冷 HGX B200 托盘 6U、散热器高度与重量（"两个人才搬得动"）；**只看 HGX 托盘，不看 ASRock 机箱** |
| R11 | `11-dgx-h100-ug` 系列 | P32 DGX H100 用户指南 | © NVIDIA | 前代同族机箱，核对托盘抽出方向 |
| G1–G7 | `genimg/b200/b200-*.png` | Codex 石墨图版（本会话 scratchpad，正在生成：`b200-server`、`-gpu-tray`、`-gpu-module`、`-cpu-tray`、`-airflow`、`-power`、`-rack`） | 自生成 | **只当风格与构图参考，不是事实依据** |

**Codex 图版的已知错误**（2026-10-13 看过 `b200-server.png`）：画成了单层、约 4U 高的机箱，CPU 托盘在 GPU 前面、从顶部掀盖安装，面板是六角网孔、电源在后部上方——都和 R1–R6 不符。真机是 10U、上下两层、两托盘从后部抽出、前面是 4 × 5 风扇墙、6 个电源在后部最下层。如果要用作首页插画，建议按下面改写 prompt 重画（施工主会话决定）：
- `b200-server`：「a 10U rack server, almost square front face; top cover removed; upper level: eight tall tower heat sinks in two rows of four with a full-height duct between the rows, sitting on a large board; lower level (2U): two CPUs under low heat sinks with rows of memory modules running front-to-back; bottom level: six power supplies side by side at the rear and eight 2.5-inch drives at the front; front: a wall of 20 fan modules in four rows of five behind a removed plain bezel」。
- `b200-airflow`：侧剖面里空气穿过三层（上层 GPU、中层 CPU、下层电源各自的通道），不是一条斜穿全机的箭头。
- `b200-rack`：一个 42U 机柜里**两台**（不是四台）、柜顶交换机。

### 2.4 写实轮次

R2 几何：为 R2、R3、R5、R6、R8 各摆一个对照镜头，并排图存 `docs/screenshots/b200-server/geo-{front,rear,gpu-tray,host-tray,hgx}.png`，至少两轮；干涉检查照 `modelling-runbook.md` §6（重点：散热塔与导风罩、内存与 CPU 散热器、托盘之间的 1–3 mm 间隙、线缆与内存）。R3 材质：金色面板、黑色风扇、浅灰钢板、深色散热塔 + 金色顶、绿色 PCB 五族在 paper / cinema 下都分得开。

## 3. 分区与零件

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色 | 卡 |
|---|---|---|---|---|---|
| 01 | `chassis` | Chassis / 机箱 | 前面板、机身、顶盖、挂耳、导轨、中板、前控制、状态灯 | `token:ink-3` | `card: false` |
| 02 | `cooling` | Fan wall / 风扇墙 | 风扇模块、风扇转子 | `token:neutral` | ✓ |
| 03 | `gpu-tray` | GPU tray / GPU 托盘 | 托盘框、排风面、基板、连接器、GPU 模块、裸片、HBM、散热器、NVSwitch、导风罩 | `token:ink-2` | ✓ |
| 04 | `host` | Host tray / 主机托盘 | 托盘框、主板、CPU、CPU 散热器、内存、PCIe 交换、网络模块、线缆、OSFP、DPU、转接卡、启动盘、U.2 数据盘、后部接口 | `token:ink-3` | ✓ |
| 05 | `power` | Power / 电源 | 5 个电源、第 6 个电源、配电、电源线 | `token:cut` | ✓ |
| — | `air` | Airflow / 气流 | 只有流（3 条） | `token:hot` | — |
| — | `current` | Electricity / 电 | 只有流（2 条） | `token:cut` | — |
| — | `data` | Data / 数据 | 只有流（3 条） | `token:loop` | — |
| — | `scene` | Scene / 场景 | context：比例人形、机柜框、同柜邻机（`card: false`） | `token:ink-3` | ✗ |

- `groups` 顺序：chassis、cooling、gpu-tray、host、power、air、current、data、scene。比模板的"01–05"多出流组和场景组（蝗虫主题也是 7 组），右上卡只有 4 列（≤ 4，验收清单要求）。
- `host` 组把前部 U.2 数据盘也归进来（它们在机箱最下层前面，但逻辑上挂在 CPU 一侧的 PCIe 交换上，R7）。

### 3.2 坐标与尺度

- 单位米，Y 向上，**+Z = 服务器前面**（朝观者），+X 向右（从前面看）；地面 y = 0（第 01–05 章服务器放在地上，第 06 章在机柜最下面）。
- 机身：x −0.2235…0.2235（447 mm，19 英寸机箱的常见机身宽，待核），挂耳到 ±0.2412（482.3 mm）；y 0…0.444；z −0.4486…+0.4486（897.1 mm）。
- 分层（RECON，F-27）：电源 / 硬盘层 y 0…0.056；主板托盘 y 0.056…0.145；GPU 托盘 y 0.145…0.440。
- 前后（RECON）：面板 z 0.4386…0.4486；风扇墙 z 0.345…0.435；中板 z 0.335…0.341；两托盘 z −0.449…+0.335（长 0.784）。GPU 前排中心 z +0.195、导风罩 z +0.04、后排中心 z −0.115、封闭舱 z −0.26…−0.449。
- 整体包络约 0.48 × 0.44 × 0.90 m，模型半径约 0.55 m，投影门槛 ≈ 0.15 m（包围半径 ≥ 0.28 × 模型半径）。第 06 章加机柜后包络约 0.6 × 2.0 × 1.2 m。
- 下表坐标是起点，R2 按 R1–R8 并排调（不改量级）。`tube.path` 施工时减去 `at`。

### 3.3 零件（38 个机器零件 + 3 个 context）

材质：powder（缎面粉末涂层，默认黑，`tint` 改色）、steel（钢板，`tint #b9bab5` 浅灰）、casing（铝）、copper、brass、plastic（`tint` 做 PCB 绿 `#34503c`）、rubber。产品本色用材质族 + hex `tint`。"shell" = X-RAY 时透明。"隐" = 在哪些章 / 拍 `hide`。

| # | id 名称 | 组 | primitive（米）+ extra / repeat | at | 材质 | explode dir · dist | connects | shell | 隐 | 参考 |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `bezel` 前面板 | chassis | bevelBox [0.430, 0.425, 0.012] bevel 0.008 | (0, 0.222, 0.4426) | powder tint `#a39470`（香槟金） | [0,0,1] · 0.35 | front-controls | ✓ | 01 章拍 3 起、02–05 章 | R1 |
| 02 | `chassis-body` 机身 | chassis | bevelBox 底板 [0.447, 0.003, 0.897]；extra 两侧板 [0.003, 0.444, 0.897] at x ±0.222 | (0, 0.0015, 0) | steel tint `#b9bab5` | 0 | rails, midplane | ✓ | — | R3 |
| 03 | `top-cover` 顶盖 | chassis | bevelBox [0.447, 0.003, 0.784] bevel 0.0015 | (0, 0.4425, −0.057) | steel tint `#b9bab5` | [0,1,0] · 0.30 | chassis-body | ✓ | 02–05 章 | — |
| 04 | `rack-ears` 机架挂耳 | chassis | bevelBox [0.018, 0.440, 0.004]；repeat {2, [1,0,0], 0.4644} | (−0.2322, 0.222, 0.4466) | steel | 0 | rails | | — | R1 |
| 05 | `rails` 导轨 | chassis | bevelBox [0.012, 0.040, 0.800]；repeat {2, [1,0,0], 0.459} | (−0.2295, 0.200, −0.02) | stainless | 0 | rack-ears | | — | R9 |
| 06 | `midplane` 中板 | chassis | extrude：外形 0.440 × 0.384，3 个矩形风孔（上两个对 GPU 托盘、下一个对主板托盘，示意），depth 0.006，`rotation [0,0,0]`（XY 平面） | (0, 0.248, 0.338) | plastic tint `#34503c` | [0,0,1] · 0.12 | gpu-baseboard, motherboard, power-distribution, fan-modules | | — | R5、R6（推断） |
| 07 | `front-controls` 前控制面板 | chassis | bevelBox [0.010, 0.060, 0.006]（电源键、UID、故障灯竖排） | (0.2165, 0.400, 0.4365) | powder | [0,0,1] · 0.30 | status-led | | — | R1 |
| 08 | `status-led` 状态灯 | chassis | sphere [0.0025] | (0.2165, 0.418, 0.4405) | `token:success` | [0,0,1] · 0.30 | front-controls | | — | R1 |
| 09 | `fan-modules` 风扇模块（20） | cooling | bevelBox [0.084, 0.088, 0.090] bevel 0.003；extra 同尺寸 3 个 at y 0.199 / 0.292 / 0.385；repeat {5, [1,0,0], 0.088} | (−0.176, 0.106, 0.390) | powder | [0,0,1] · 0.30 | midplane, fan-rotors | | — | R2 |
| 10 | `fan-rotors` 风扇转子（40） | cooling | blades axial {count 7, radius 0.037, hub 0.013, chord 0.03, pitch 30, twist 10, thickness 0.002}，`rotation [90,0,0]`；extra：同排 3 个（y 0.199 / 0.292 / 0.385）+ 后层 4 个（z 0.362）；repeat {5, [1,0,0], 0.088} | (−0.176, 0.106, 0.418) | plastic tint `#2b2b2a` | [0,0,1] · 0.30（随模块） | fan-modules | | — | R2（叶片数待核） |
| 11 | `gpu-tray-frame` GPU 托盘框 | gpu-tray | bevelBox 底 [0.440, 0.003, 0.784]；extra 两侧壁 [0.003, 0.293, 0.784]、后部封闭舱盖 [0.440, 0.004, 0.19] at (0, 0.437, −0.354) | (0, 0.1465, −0.057) | steel | [0,0,−1] · 0.55 | midplane, gpu-baseboard | ✓ | 03 章 | R3、R5 |
| 12 | `rear-grille` 排风面 | gpu-tray | grille slats {size [0.440, 0.004, 0.290], count 64, bar 0.0035}，`rotation [90,0,0]`（立起来成 XY 平面） | (0, 0.293, −0.4466) | steel | [0,0,−1] · 0.60 | gpu-tray-frame | ✓ | — | R3（真实是六角穿孔，E3） |
| 13 | `gpu-baseboard` HGX 基板 | gpu-tray | bevelBox [0.430, 0.004, 0.620] bevel 0.001 | (0, 0.151, −0.010) | plastic tint `#34503c` | [0,0,−1] · 0.55 | baseboard-connectors, gpu-modules, nvswitch-chips | | — | R5、R8 |
| 14 | `baseboard-connectors` 高密度连接器 | gpu-tray | bevelBox [0.400, 0.030, 0.025] bevel 0.002 | (0, 0.168, 0.3125) | powder | [0,0,−1] · 0.55 | midplane, gpu-baseboard | | — | R5、R8 |
| 15 | `gpu-modules` GPU 模块（8） | gpu-tray | bevelBox [0.098, 0.006, 0.165] bevel 0.001（SXM 模块板）；extra 封装基板 bevelBox [0.075, 0.003, 0.075] at y 0.1615、后排同两件 at z −0.115；repeat {4, [1,0,0], 0.105} | (−0.1575, 0.157, 0.195) | plastic tint `#2f4a36`；基板 tint `#3b4a3f` | [0,0,−1] · 0.55 | gpu-baseboard, gpu-dies, gpu-heatsinks | | — | R5、R8；模块尺寸待核 |
| 16 | `gpu-dies` GPU 裸片（16） | gpu-tray | box [0.026, 0.0012, 0.033]；extra：同 GPU 第二片（x +0.027）、后排两片；repeat {4, [1,0,0], 0.105} | (−0.171, 0.1636, 0.195) | steel tint `#4b5160` | [0,1,0] · 0.10 | gpu-modules, hbm-stacks | | — | F-5（尺寸待核） |
| 17 | `hbm-stacks` HBM3e 显存（64） | gpu-tray | box [0.011, 0.0012, 0.011]；extra：同 GPU 其余 7 叠 + 后排 8 叠（共 16 个 primitive）；repeat {4, [1,0,0], 0.105} | 前排第一叠 (−0.198, 0.1636, 0.214) | powder tint `#5b5d60` | [0,1,0] · 0.10 | gpu-dies | | — | F-4、F-6（排布待核） |
| 18 | `gpu-heatsinks` GPU 散热器（8） | gpu-tray | fins axis x {size [0.165, 0.245, 0.0004], count 24, gap 0.0041}；extra：后排鳍片、铜底板 ×2 [0.098, 0.006, 0.165]（copper）、金色顶盖 ×2 [0.100, 0.006, 0.167]（brass）；repeat {4, [1,0,0], 0.105} | (−0.1575, 0.2925, 0.195) | casing tint `#4a4a48`；copper；brass | [0,1,0] · 0.30 | gpu-modules | ✓ | — | R8（片距放宽，真实待核） |
| 19 | `nvswitch-chips` NVSwitch 芯片（2） | gpu-tray | bevelBox [0.045, 0.003, 0.045]；extra 小鳍片 fins axis x {size [0.06, 0.03, 0.0004], count 14, gap 0.0042} at y 0.172；repeat {2, [1,0,0], 0.14} | (−0.07, 0.1545, 0.040) | steel tint `#4b5160`；casing | [0,1,0] · 0.12 | gpu-baseboard, gpu-modules | | — | R5、R7 |
| 20 | `nvswitch-duct` 导风罩 | gpu-tray | bevelBox [0.420, 0.245, 0.105] bevel 0.004 | (0, 0.2925, 0.040) | powder | [0,1,0] · 0.40 | nvswitch-chips | ✓ | 03 章拍 4 | R5、R8 |
| 21 | `host-tray-frame` 主机托盘框 | host | bevelBox 底 [0.440, 0.003, 0.784]；extra 两侧壁 [0.003, 0.087, 0.784]、托盘盖 [0.440, 0.002, 0.784] at y 0.144 | (0, 0.0575, −0.057) | steel | [0,0,−1] · 0.50 | midplane, motherboard | ✓ | 04 章 | R6 |
| 22 | `motherboard` 主板 | host | bevelBox [0.430, 0.003, 0.600] bevel 0.001 | (0, 0.0605, −0.110) | plastic tint `#34503c` | [0,0,−1] · 0.50 | cpus, dimms, network-modules, midplane | | — | R6 |
| 23 | `cpus` CPU（2） | host | bevelBox [0.0775, 0.006, 0.0565] bevel 0.001；repeat {2, [1,0,0], 0.24} | (−0.12, 0.065, −0.080) | steel tint `#9aa0a6` | [0,0,−1] · 0.50 | motherboard, dimms, pcie-switches | | — | F-14、F-33 |
| 24 | `cpu-heatsinks` CPU 散热器（2） | host | fins axis x {size [0.120, 0.060, 0.0004], count 20, gap 0.0042}；extra 铜底 [0.083, 0.006, 0.120]；repeat {2, [1,0,0], 0.24} | (−0.12, 0.101, −0.080) | casing；copper | [0,1,−1] · 0.30 | cpus | ✓ | — | R6 |
| 25 | `dimms` 内存条（32） | host | box [0.006, 0.031, 0.133]（长边沿 z）；extra 另 3 组的第一根 at x −0.0763 / +0.0237 / +0.1637；repeat {8, [1,0,0], 0.0075} | (−0.2163, 0.0785, −0.080) | casing（散热片） | [0,1,0] · 0.20 | cpus | | — | R6、F-15、F-33 |
| 26 | `pcie-switches` PCIe 交换芯片（示意） | host | bevelBox [0.030, 0.004, 0.030]；extra 小鳍片；repeat {2, [0,0,1], 0.05} | (0.0, 0.066, 0.080) | steel tint `#4b5160` | [0,1,0] · 0.15 | cpus, network-modules, u2-drives, bluefield-dpus | | — | R6、R7（位置与数量待核） |
| 27 | `network-modules` ConnectX-7 网络模块（2 × 4） | host | bevelBox [0.180, 0.012, 0.120]；extra 4 个小散热片 fins；repeat {2, [1,0,0], 0.21} | (−0.105, 0.072, 0.255) | plastic tint `#34503c`；casing | [0,1,0] · 0.20 | densilink-cables, midplane, pcie-switches | | — | R6、F-18 |
| 28 | `densilink-cables` 网络线缆（4） | host | tube r 0.004，bendRadius 0.02：网络模块后缘 (−0.05, 0.085, 0.19) → (−0.05, 0.12, 0.10) → 沿两组内存之间 (−0.0, 0.12, −0.20) → OSFP 后部 (−0.015, 0.095, −0.33)；extra 另 3 根（x 偏 0.01 / 0.02 / 0.03） | 路径中点 | rubber tint `#8aa9b4` | [0,1,0] · 0.10 | network-modules, osfp-cages | | — | R6 |
| 29 | `osfp-cages` OSFP 网口（4） | host | bevelBox [0.022, 0.014, 0.100]；extra 第二行；repeat {2, [1,0,0], 0.026} | (−0.013, 0.083, −0.399) | steel | [0,0,−1] · 0.55 | densilink-cables | | — | R4、R6 |
| 30 | `bluefield-dpus` BlueField-3 DPU（2） | host | bevelBox [0.110, 0.002, 0.168]（卡，平放在转接卡上）；repeat {2, [1,0,0], 0.30} | (−0.15, 0.073, −0.36) | plastic tint `#34503c` | [0,0,−1] · 0.55 | pcie-risers, pcie-switches | | — | R4、R6 |
| 31 | `pcie-risers` PCIe 转接卡（含 100 GbE 网卡） | host | bevelBox [0.003, 0.070, 0.150]（竖立的转接板）；extra 上层卡 [0.110, 0.002, 0.168] at y 0.115（左：100 GbE 网卡）；repeat {2, [1,0,0], 0.20} | (−0.10, 0.098, −0.36) | plastic tint `#34503c` | [0,0,−1] · 0.55 | motherboard, bluefield-dpus, boot-drives | | — | R4、R6 |
| 32 | `boot-drives` M.2 启动盘（2） | host | bevelBox 载板 [0.110, 0.002, 0.150]；extra 2 根 M.2 [0.022, 0.003, 0.110] | (0.15, 0.115, −0.36) | plastic tint `#34503c`；steel | [0,0,−1] · 0.55 | pcie-risers | | — | R4 |
| 33 | `u2-drives` U.2 数据盘（8） | host | bevelBox [0.0699, 0.015, 0.1005] bevel 0.002；extra 其余 7 块（左 2 × 2 at x −0.185 / −0.112、右 2 × 2 at x +0.112 / +0.185；y 0.012 / 0.030） | (−0.185, 0.012, 0.385) | casing | [0,0,1] · 0.25 | pcie-switches | | — | R2、F-17、F-33 |
| 34 | `rear-io` 后部管理接口 | host | bevelBox 面板 [0.300, 0.030, 0.004]；extra RJ45 ×2、USB ×2、VGA、串口、数码管（小 box） | (0, 0.072, −0.4466) | steel；powder | [0,0,−1] · 0.55 | motherboard | | — | R4 |
| 35 | `psus` 电源（5） | power | bevelBox [0.068, 0.042, 0.300] bevel 0.002；extra 把手 [0.040, 0.008, 0.015]（rubber）at z −0.455；repeat {5, [1,0,0], 0.072} | (−0.180, 0.026, −0.298) | steel tint `#c3c4c0`；rubber | [0,0,−1] · 0.30 | power-distribution, power-cords | | — | R3、F-22 |
| 36 | `psu-single` 第 6 个电源 | power | 同上，单个 | (0.180, 0.026, −0.298) | 同上 | [0,0,−1] · 0.30 | power-distribution, power-cords | | — | R3 |
| 37 | `power-distribution` 配电板与母排（示意） | power | bevelBox [0.420, 0.003, 0.280]；extra 铜排 ×2 [0.400, 0.006, 0.012] at y 0.029、竖向铜排 [0.012, 0.100, 0.006] at (±0.15, 0.10, 0.330) | (0, 0.020, −0.005) | plastic tint `#34503c`；copper | [0,−1,0] · 0.15 | psus, psu-single, midplane | | — | 无图：重建，待核 |
| 38 | `power-cords` 电源线（6） | power | tube r 0.006，bendRadius 0.03：电源后端 (−0.18, 0.026, −0.452) → (−0.18, 0.026, −0.55) → (−0.18, −0.0, −0.62)（入地示意）；repeat {6, [1,0,0], 0.072} | 路径中点 | rubber | 0 | psus, psu-single | | 06 章 | P3 锁定电源线图 |
| — | `scale-figure` 比例人形（context） | scene | capsule [0.17, 1.30]（身体）；extra sphere [0.11]（头）at y 1.59 | (−0.85, 0.82, 0.10) | `token:mannequin` | — | — | | 02–05 章 | 1.70 m 中性剪影 |
| — | `rack-frame` 机柜框（context） | scene | box 立柱 [0.04, 2.00, 0.04]；extra 另 3 根立柱、上下框（x ±0.28、z ±0.55） | (−0.28, 1.00, 0.55) | powder | — | — | | 01–05 章 | R9；42U = 1,867 mm（P25） |
| — | `rack-neighbour` 同柜第二台与柜顶交换机（context） | scene | bevelBox [0.447, 0.444, 0.897]（第二台，U11–U20）；extra 1U 交换机 ×2 at y 1.80 / 1.845 | (0, 0.667, 0) | powder tint `#6b6b68` | — | — | | 01–05 章 | F-34 |

- **零件数说明**：机器零件 38 个（brief 30–40）。重复件全部用 `repeat` / `extra`（风扇模块 20、转子 40、GPU 8、裸片 16、HBM 64、内存 32、电源 5 + 1……每个都只算一个零件）。`psu-single` 单列，是为了第 05 章"抽出一个电源，另外五个照常供电"（5+1）。删减顺序（如超预算）：`status-led` → `pcie-switches` → `boot-drives` → `densilink-cables` → `rack-ears`。
- **每个零件的功能理由**：§3.4 的 summary；没有"随机细节"。`pcie-switches`、`power-distribution`、`midplane` 的形状是重建，detail 第一段写"示意"。
- **绘制预算**（风险，§11.5）：38 个零件里有 9 个是两到三种材质（散热器、电源、网络模块、NVSwitch……），静止估计约 52–58 次绘制 + 投影约 6 + 地面 2，**可能超过 50 的目标**；降法：合并同材质 extra → 关小件投影 → 第 06 章才出现的 context 用 `hide`（不绘制）→ 风扇转子与模块合并成一个零件（失去单独转动）。三角形：转子 40 × 7 叶、鳍片约 250 片、内存 32 根，估计 < 0.25 M。
- 默认不隐藏（第 01 章完整外观），context 机柜和邻机在 01–05 章 `hide`。

### 3.4 summary / detail 要点（施工时写成 EN / ZH）

summary ≤ 60 字符、动词开头说它干什么；detail：怎样做到 · 数字（带 [S#]，模拟写明）· 坏了 / 拿掉会怎样。

| id | summary 要点 | detail 要点 |
|---|---|---|
| bezel | 挡住风扇墙，让空气从整面进来 | 可拆的装饰面罩，透气的粗糙表面；拿掉后才能换风扇和硬盘（P4）；模型是实色，真机是海绵状金属表面 |
| chassis-body | 承托所有托盘和电源的钢制外壳 | 10U、444 mm 高、897 mm 深（F-1）；满载 142.4 kg（F-2） |
| top-cover | 封住顶部，让风只能前进后出 | 去掉顶盖开机会让风短路、芯片过热（原理；无厂商条文就只写原理） |
| rack-ears | 把机器用螺丝固定在机柜立柱上 | 前面板两侧共 8 颗螺丝（R1） |
| rails | 让 142 kg 的机器沿机柜滑进滑出 | 安装要多人或升降机（P3 安全章节，待核措辞） |
| midplane | 前后两个托盘都插在这块竖板上，取电、通信 | "电源、PCIe、传感器和信号"都经它（F-26）；形状和风孔是示意 |
| front-controls | 开关机、点亮识别灯、显示故障 | UID 灯让机房里的人找到这一台（P3） |
| status-led | 绿灯亮表示通电运行 | 动画是示意的呼吸闪烁 |
| fan-modules | 20 个模块把机房的冷空气从前面抽进来 | 每个模块两只风扇，坏一只整模块换，要 30 秒内换好（F-25）；全机 1,550 CFM（F-24） |
| fan-rotors | 两层叶轮串联，推动空气穿过整台机器 | 叶片数是示意；转动在画面里放慢；真实转速没有公开（F-41） |
| gpu-tray-frame | 托着 8 块 GPU，从机器后面整体抽出 | 约 6U 高（F-27）；风冷 HGX B200 托盘重到要两个人抬（P15） |
| rear-grille | 让热空气从 GPU 托盘后面排出 | 真实是密集的六角孔，模型用细格条近似 |
| gpu-baseboard | 承载 8 个 GPU 并用铜线把它们连到交换芯片 | NVLink 走的是板里的走线，看不见（F-12） |
| baseboard-connectors | 把基板的电和信号插到中板上 | 高密度连接器（R8） |
| gpu-modules | 每块是一颗 B200 GPU 和它的供电电路 | SXM 模块，最大 1,000 W（F-7）；8 块合计 1,440 GB 显存（F-4） |
| gpu-dies | 两块硅片并成一颗 GPU，负责计算 | 2080 亿晶体管、两片间 10 TB/s（NVIDIA 称，F-5）；Tensor Core 做矩阵乘加 |
| hbm-stacks | 紧挨着芯片的堆叠显存，喂数据给计算单元 | 每块 GPU 8 叠，DGX 里启用 180 GB、8 TB/s（F-4）；紧挨着放是为了短距离、宽总线 |
| gpu-heatsinks | 把芯片的热导到高高的鳍片上让风带走 | 铜底吸热、铝鳍片散热（热的良导体，§1.4）；模型片距放宽 |
| nvswitch-chips | 让每块 GPU 都能同时和其他 7 块高速通信 | 2 颗，每块 GPU 给每颗 9 条链路（F-11、F-12，待核） |
| nvswitch-duct | 把风导过交换芯片，不让它从旁边溜走 | 和散热塔一样高（R8） |
| host-tray-frame | 托着 CPU、内存和网卡，从后面抽出 | 2U（F-27）；换内存要整盘抽出（P4） |
| motherboard | 连接 CPU、内存、网卡和中板 | — |
| cpus | 运行操作系统，调度任务、搬数据给 GPU | 每颗 56 核、350 W TDP（F-14） |
| cpu-heatsinks | 带走 CPU 的热 | 2U 高度限制了它比 GPU 散热器矮得多 |
| dimms | CPU 用的 2 TB 内存 | 32 根 64 GB（F-15）；长边顺着气流（R6） |
| pcie-switches | 把 CPU 连到网卡、硬盘和 GPU（示意） | R7 拓扑图里的 PCIe 交换；位置和数量是示意 |
| network-modules | 8 个 400 Gb/s 网卡，每块 GPU 一个 | 两个模块各 4 个 ConnectX-7（F-18、F-21） |
| densilink-cables | 把网卡的信号送到后面的网口 | 4 根（R6 图注） |
| osfp-cages | 机器连到集群网络的 4 个口 | 每口两路 400 Gb/s（F-18） |
| bluefield-dpus | 连接存储和管理网络，并分担 CPU 的网络工作 | 2 块双口，最高 400 Gb/s（F-19） |
| pcie-risers | 把横放的扩展卡接到主板上 | 2U 高度放不下竖插的卡，所以用转接卡 |
| boot-drives | 存操作系统的两块盘，互为备份 | 2 × 1.92 TB，RAID 1（F-17） |
| u2-drives | 训练时缓存数据的 8 块高速盘 | 8 × 3.84 TB，RAID 0（F-17）；从前面板后面热插拔（P4） |
| rear-io | 管理员远程管理这台机器的接口 | BMC 口即使主机关着也能用（F-22） |
| psus | 把 200–240 V 交流电变成机器用的直流电 | 每个 3.3 kW（F-22） |
| psu-single | 第六个电源：坏一个，其余五个照样够用 | 5+1 冗余；少于 3 个只能开管理系统（F-22）；六个平时一起分担负载，没有固定的"备用" |
| power-distribution | 把电源的电分送到两个托盘（示意） | 走线方式无公开图，示意 |
| power-cords | 从机柜配电单元接进交流电 | 电源端是带锁扣的插头（P3） |

## 4. 流

颜色语义（每色一个意思）：**`neutral → hot` = 空气由室温变热**；**`token:cut`（赭金）= 电**；**`token:loop`（青灰）= 数据**。不用 `cold`（避免读成"冷"）。数据流的**粒子疏密表示带宽**（密 = 带宽高，示意、不按比例），第 03 章第 5 拍说一次图例。

| id | group | 路径（按零件） | 约长 m | speed | count | size × | spread | stops（u: 色） | ends | clip | parts |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `air-gpu-left` | air | 面板前 (−0.105, 0.29, 0.60) → 风扇（上三排）→ 中板 → 前排散热塔 (z 0.28→0.11) → 导风罩 → 后排散热塔 (−0.03→−0.20) → 封闭舱下 → 排风面 (−0.449) → (−0.105, 0.29, −0.70) | 1.30 | 0.45 | 360 | 0.9 | [0.10, 0.11, 0.01] | 0: neutral · 0.30: neutral · 0.55: hot 60 % · 1: hot | fade | false | fan-modules, midplane, gpu-heatsinks, nvswitch-duct, rear-grille |
| `air-gpu-right` | air | 同上，x +0.105 | 1.30 | 0.45 | 360 | 0.9 | 同上 | 同上 | fade | false | 同上 |
| `air-host` | air | (0, 0.10, 0.60) → 风扇最下排 → 中板 → 网络模块 → CPU 散热器与内存 → 后部转接卡 → (0, 0.10, −0.70) | 1.30 | 0.40 | 300 | 0.8 | [0.20, 0.03, 0.01] | 0: neutral · 0.35: neutral · 0.65: hot 50 % · 1: hot 70 % | fade | false | fan-modules, network-modules, cpu-heatsinks, rear-io |
| `power-in` | current | 电源线 (−0.18, 0.02, −0.60) → 电源 → 配电板 (z −0.15→0.30) → 竖向铜排 → 中板 (0.15, 0.15, 0.335) | 1.10 | 0.35 | 220 | 0.6 | 0.006 | 0: cut · 1: cut | open | true | power-cords, psus, power-distribution, midplane |
| `power-gpu` | current | 中板 (0.15, 0.15, 0.335) → 基板 → 前排 4 块 GPU → 后排 4 块 GPU（蛇形） | 1.20 | 0.35 | 240 | 0.6 | 0.006 | 0: cut · 1: cut | open | true | midplane, gpu-baseboard, gpu-modules |
| `nvlink-mesh` | data | 闭环：在基板上方 y 0.158，依次 GPU0 → NVSwitch A → GPU4 → NVSwitch B → GPU1 → … → 回到 GPU0，访问 8 块 GPU、两颗交换芯片各 8 次 | 2.6 | 0.70 | 900 | 0.45 | 0.004 | 0: loop · 1: loop | （闭环） | true | gpu-modules, nvswitch-chips |
| `pcie-host` | data | CPU0 (−0.12, 0.07, −0.08) → PCIe 交换 → 网络模块 → 中板 → 基板 → 前排 GPU0 | 0.75 | 0.35 | 60 | 0.45 | 0.003 | 0: loop · 1: loop | fade | true | cpus, pcie-switches, network-modules, midplane, gpu-modules |
| `network-out` | data | GPU0 → 中板 → 网络模块 → 线缆 → OSFP → 机外 (−0.013, 0.083, −0.75) | 1.15 | 0.50 | 220 | 0.45 | 0.003 | 0: loop · 1: loop | fade | false | gpu-modules, midplane, network-modules, densilink-cables, osfp-cages |

- 合计 8 条 = 运转时 +8 次绘制（< 10）。
- 疏密的含义：`nvlink-mesh` 每米约 350 粒、`pcie-host` 约 80 粒、`network-out` 约 190 粒——**只表示"NVLink 远比 PCIe 宽"，不是比例**（真实比例约 14 : 1，F-16），细看写明。
- 电的两段首尾相接（`ends: open`，`count / 长度 × speed` ≈ 70 / 秒）。电源把交流变直流这一步不换色（只有一种"电"色），在 detail 和第 05 章正文讲。
- 空气流 `clip: false`：侧剖（`side`）时整股气流仍可见；数据和电的流随剖切裁掉。
- 第 05 章细看写"粒子速度是可视速度，不是真实风速"。

## 5. 动画

全部 `whenRun: true`；转速是可读的视觉速度。

| id | target | kind | 参数 | 说明 |
|---|---|---|---|---|
| `fan-spin` | fan-rotors | rotate | axis [0,0,1]，rpm 40，**需要 E1（每个重复件 / extra 绕自己的中心转）** | 40 只转子；7 叶时 60 fps 每帧 4°，小于半个叶片间距 25.7°，不倒转。退路见 E1 |
| `status-led-pulse` | status-led | pulse | scale 1.4，hz 0.5 | 示意"在运行"；真机是常亮（detail 写明） |

**托盘抽出（姿态，不是循环动画）**：用 `poses`，章 / 拍 `pose` 切换，缓动 1.6 s：

| pose | 零件 → 变换 | 用在 |
|---|---|---|
| `gpu-tray-out` | gpu-tray 组全部 10 个零件 offset [0, 0, −0.55]；`top-cover` 已 hide | 第 02 章拍 5 |
| `host-tray-out` | host 组除 `u2-drives` 外 13 个零件 offset [0, 0, −0.50] | 第 04 章拍 1（可选） |
| `psu-out` | psu-single offset [0, 0, −0.25] | 第 05 章拍 2 |

真机抽出方向是向后（F-26，GPU 托盘一项待核）；姿态用 offset 而不是 explode，是为了能在某一拍停在"抽出一半"，和爆炸图分开。

## 6. 剖切、X-RAY、爆炸、剥层

- `views.cutaway`：`{ normal: [-1, 0, 0], offset: 0 }`（切掉 x > 0 的右半，看左半的三层侧剖）。
- `views.cuts`（≤ 4）：
  - `side`：同上，label "Side / 侧剖"（第 05 章）。
  - `chips`：`{ normal: [0, -1, 0], offset: 0.17 }`，切掉 y > 0.17：散热塔和导风罩被齐根切掉，俯视看到 8 个封装、16 片裸片、64 叠 HBM、2 颗 NVSwitch，label "Chips / 芯片层"（第 03 章）。
  - `host-level`：`{ normal: [0, -1, 0], offset: 0.145 }`，切掉整个 GPU 托盘层，俯视主板托盘，label "Host level / 主机层"（第 04 章）。
- **X-RAY**（shell 透明，其余实心）：shell = bezel、chassis-body、top-cover、gpu-tray-frame、rear-grille、gpu-heatsinks、nvswitch-duct、host-tray-frame、cpu-heatsinks。效果：外壳和散热器变透明，GPU 模块、芯片、内存、电源、风扇实心，流可见。第 03 章拍 2–3 用。
- **EXPLODED**：按装配逻辑——面板向前、顶盖向上、两个托盘及其零件向后（GPU 托盘 0.55、主机托盘 0.50）、散热器在托盘内再向上、电源向后、风扇模块向前；`views.exploded.camera` = (1.25, 1.05, 2.4) → (0, 0.22, −0.15)。
- **剥层（peel）**：本主题不需要（那是肌肉主题的 `explode.stage`）；"一层层打开"由第 02 章的拍序（去面板 → 去顶盖 → `chips` → `host-level`）完成。
- 组合：

| 组合 | 行为 |
|---|---|
| X-RAY + FLOW | 主要读法（03、05 章）：外壳与散热器透明，数据 / 气流粒子可见 |
| CUTAWAY（side）+ FLOW | 空气流 `clip: false` 不被切，三层气道一目了然；电和数据被切 |
| `chips` / `host-level` + FLOW | 数据流在切面以下照常；空气流穿过被切掉的空间（可接受，§11.5） |
| EXPLODED + FLOW | 引擎禁用 FLOW（流不随拆开移动） |
| pose + EXPLODED | 姿态 offset 与爆炸位移叠加；拍里不同时用 |
| hide + EXPLODED | 隐藏的仍隐藏 |
| REFERENCE | 停运转、收爆炸、隐藏流；立面 `zy` |

## 7. 章节

### 7.0 总表

`layers` 不写 = 全部组（scene 组的机柜和邻机靠 `hide` 关掉）。镜头写预设名（§8.4）或"自定"。节拍表里"hide + X"= 本章的 `hide` 再加 X（`hide` 不累积，拍里要写全）；"layers + X"同理。

| # | id | 标题 EN / ZH | view | run | cutaway | hide | layers | pose | labels | 镜头 |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `the-machine` | The whole machine / 整台机器 | assembled | false | none | rack-frame, rack-neighbour | 全部 − air − current − data | — | bezel, rack-ears, top-cover | hero |
| 02 | `open-the-lid` | Open it up: two floors / 打开机箱：上下两层 | assembled | false | none | bezel, top-cover, scale-figure, rack-frame, rack-neighbour | 同 01 | — | group:gpu-tray, group:host, group:cooling, midplane | gpu-bay |
| 03 | `gpus-and-nvlink` | Eight GPUs and NVLink / 八块 GPU 与 NVLink | xray | true | chips | 同 02 | chassis, cooling, gpu-tray, host, power, data | — | gpu-modules, gpu-dies, hbm-stacks, nvswitch-chips | 自定（俯视 3/4） |
| 04 | `host-side` | The host: CPUs, memory, storage, network / 主机一侧：CPU、内存、存储、网络 | assembled | true | host-level | 同 02 | chassis, cooling, gpu-tray, host, power, data | — | cpus, dimms, network-modules, osfp-cages | host-bay |
| 05 | `power-and-cooling` | Power in, heat out / 电进来，热出去 | xray | true | side | 同 02 | chassis, cooling, gpu-tray, host, power, air, current | — | psus, fan-modules, gpu-heatsinks, rear-grille | 自定（左侧剖） |
| 06 | `rack-and-data-centre` | In the rack, in the data centre / 在机柜里，在数据中心里 | assembled | true | none | scale-figure | 全部 − current − data | — | rack-ears, rails, osfp-cages | in-rack |

### 7.1 第 01 章 `the-machine`

- **summary**：An AI server is a computer the size of a small fridge on its side, built around eight GPUs. / AI 服务器是一台围绕 8 块 GPU 搭起来的计算机，横放着差不多有一台小冰箱那么大。（"小冰箱"类比待 Gavin 定，或改成"一个大行李箱"）
- **正文提纲**：① 它是什么：装在机柜里的计算机，主要的计算交给 8 块 GPU（F-3）。② 多大多重：10U、444 mm 高、897 mm 深、142 kg（F-1、F-2），约等于两个成年人的重量（F-2）。③ 前面吸气、后面排气；前面是风扇和硬盘，后面是三层：GPU 托盘、主机托盘、电源（R2、R3）。④ 本主题看的是哪一台：NVIDIA DGX B200，2024 年发布（F-32）；其他厂商用同一块 HGX B200 基板做的机器布局不同（细看）。
- **节拍**：

| 拍 | state（叠加在本章上） | 字幕要点 |
|---|---|---|
| 1 | 本章（hero，人形在旁） | 一台 8 GPU 的 AI 服务器，旁边是一个 1.7 米的人 |
| 2 | camera front-view；labels bezel, front-controls | 前面一整块金色面板，右边是电源键和指示灯 |
| 3 | hide + bezel；labels fan-modules, u2-drives, front-controls | 拿掉面板：20 个风扇模块，下面一排 8 块硬盘 |
| 4 | camera rear-view；labels rear-grille, rear-io, psus | 后面分三层：GPU 托盘的排风口、主机托盘的接口、6 个电源 |
| 5 | camera hero（拉远）；labels chassis-body | 444 毫米高、近 900 毫米深，最重 142 公斤 |

- **细看**：`Same board, different boxes`（HGX B200 基板 vs DGX 整机；OEM 8U–10U，P15、P33）；`What "10U" means`（1U = 44.45 mm，F-1、P25）；`Where it lives`（数据中心机房，进风 10–35 °C，F-29）。
- **本章索引** `state.index.parts`：bezel, front-controls, fan-modules, u2-drives, rear-grille, rear-io, psus, chassis-body, rack-ears
- **名词首现**：gpu、ai-server（或并入 gpu）、rack-unit。

### 7.2 第 02 章 `open-the-lid`

- **summary**：Inside are two floors: eight GPUs on top, the CPUs and network cards below, with power at the very bottom. / 里面分上下两层：上层是 8 块 GPU，下层是 CPU 和网卡，最底下是电源。
- **正文提纲**：① 顶盖下面不是一块大主板，而是两个能整体抽出的托盘，前端都插在一块中板上（F-26）。② 上层 GPU 托盘约占三分之二高度，因为散热塔很高（F-27、R8）。③ 下层主机托盘只有 2U（F-27）。④ 为什么这样分层：维修时整盘抽出；GPU 的热量最大，独占最大的风道（原理；P33 的"主板在下"观点作细看）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章（gpu-bay；面板、顶盖已移开） | 打开顶盖：上下两层托盘，前面是风扇墙 |
| 2 | labels gpu-heatsinks, nvswitch-duct, gpu-tray-frame | 上层：8 个高高的散热塔，两排之间是导风罩 |
| 3 | cutaway host-level；camera host-bay；labels cpu-heatsinks, dimms, network-modules | 下层：两颗 CPU、32 根内存、网卡模块 |
| 4 | view xray；camera 自定（左前上看中板）；labels midplane, fan-modules, baseboard-connectors | 两层托盘的前端都插在中板上，中板前面是风扇 |
| 5 | pose gpu-tray-out；camera rear-view；labels gpu-tray-frame, gpu-baseboard | GPU 托盘从机器后面整盘抽出来 |

- **细看**：`Why two floors`（散热塔高度、维修；P15、P33）；`The midplane`（F-26；形状是示意）；`Try it`（E 键爆炸图，装配方向）。
- **本章索引**：gpu-tray-frame, gpu-heatsinks, nvswitch-duct, gpu-baseboard, host-tray-frame, cpu-heatsinks, dimms, network-modules, midplane, fan-modules
- **名词首现**：cpu、midplane（可不进名词表，正文当场解释）。

### 7.3 第 03 章 `gpus-and-nvlink`

- **summary**：Each GPU is two silicon dies with stacked memory beside them; NVLink lets all eight share work as if they were one. / 每块 GPU 是两块硅片加上旁边堆叠的显存；NVLink 让 8 块 GPU 像一块那样分工合作。
- **正文提纲**：① GPU 擅长同时做大量简单的乘加；训练一个模型就是反复做这种运算（只一句，不讲数学）。② 一块 B200：两块裸片、2080 亿晶体管、片间 10 TB/s（NVIDIA 称，F-5）；旁边 8 叠 HBM3e，DGX 里每块 180 GB、8 TB/s（F-4）。③ 为什么要 8 块：大模型的参数一块放不下（F-39 算术），计算拆开后每一步都要交换结果。④ NVLink：每块 GPU 18 条链路、1.8 TB/s，经 2 颗 NVSwitch 和其他 7 块同时通信（F-10、F-11）；约为 PCIe 5.0 x16 的 14 倍（F-16）。⑤ 峰值：NVIDIA 称整机 FP4 稠密 72 PFLOPS（稀疏 144），FP8 稀疏 72 PFLOPS；4 位精度、稀疏口径、真实训练达不到峰值（F-8）。
- **节拍**（第 5 拍说图例：青灰色点是数据，越密带宽越高）：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章（cutaway chips；俯视 3/4） | 齐根切掉散热塔：8 个 GPU 模块，前后两排各 4 个 |
| 2 | camera 自定（一块 GPU 近景）；labels gpu-dies, hbm-stacks, gpu-modules | 一块 GPU：中间两块硅片，旁边 8 叠显存 |
| 3 | 同上；labels hbm-stacks | 每块 GPU 180 GB 显存，每秒 8 太字节 |
| 4 | camera 自定（俯视两排之间）；hide + nvswitch-duct；labels nvswitch-chips | 两排之间的两颗 NVSwitch：每块 GPU 都连到它们 |
| 5 | run；layers data；labels gpu-modules, nvswitch-chips, gpu-baseboard | 运转：GPU 之间的数据（密）比 GPU 到 CPU 的（疏，从基板下面上来）宽得多，约 14 倍 |

- **细看**：`Two dies, one GPU`（F-5、F-6，光罩极限是什么）；`How big a model fits`（F-39 算术，写明只算权重）；`Reading a peak number`（稀疏 / 稠密 / FP4 / FP8，F-8、F-9，"NVIDIA 称"）；`NVLink by the numbers`（F-10–F-12，拓扑推算标"推算"）。
- **本章索引**：gpu-modules, gpu-dies, hbm-stacks, gpu-heatsinks, nvswitch-chips, nvswitch-duct, gpu-baseboard
- **名词首现**：hbm、nvlink、nvswitch、flops、precision、pcie。

### 7.4 第 04 章 `host-side`

- **summary**：Below the GPUs, two CPUs run the machine, feed it data from fast drives and connect it to the rest of the cluster. / GPU 下面的两颗 CPU 管着整台机器：从高速硬盘取数据、接到集群的其他机器上。
- **正文提纲**：① CPU：2 × 56 核（F-14），跑操作系统、调度、准备数据。② 内存 2 TB（F-15）。③ 存储：8 块 U.2 数据盘做缓存、2 块 M.2 装系统（F-17）。④ 网络：每块 GPU 配一个 400 Gb/s 网卡（F-18、F-21），4 个 OSFP 口出机器；2 块 BlueField-3 接存储和管理（F-19）。⑤ 字节和比特：400 Gb/s ≈ 50 GB/s，对比 NVLink 1.8 TB/s（算术）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章（host-level 切面，host-bay） | 切掉上层：这是主机托盘 |
| 2 | labels cpus, cpu-heatsinks, dimms | 两颗 CPU，每颗 56 核，两边各 16 根内存，共 2 太字节 |
| 3 | camera front-view（低）；cutaway none；labels u2-drives | 前面下方 8 块数据盘，每块 3.84 太字节 |
| 4 | layers data；labels network-modules, densilink-cables, osfp-cages | 8 个网卡、每块 GPU 一个，每个每秒 400 吉比特 |
| 5 | camera rear-view；labels osfp-cages, bluefield-dpus, rear-io, boot-drives | 后面：4 个集群网口、2 块 DPU、管理口 |

- **细看**：`One network card per GPU`（R7 拓扑，F-21）；`Bits and bytes`（换算）；`Why the drives are at the front`（热插拔、前面板维修，P4）。
- **本章索引**：cpus, cpu-heatsinks, dimms, pcie-switches, u2-drives, boot-drives, network-modules, densilink-cables, osfp-cages, bluefield-dpus
- **名词首现**：network-card（含 DPU）、infiniband（可选）。

### 7.5 第 05 章 `power-and-cooling`

- **summary**：Up to about 14 kilowatts goes in as electricity and comes out as heat, carried away by a wall of fans. / 最多约 14 千瓦的电进来，几乎全部变成热，由一整面风扇墙带走。
- **正文提纲**：① 电：6 个 3.3 kW 电源、200–240 V（F-22），5+1 冗余；整机最大约 14.3 kW（F-23），每块 GPU 最多 1,000 W（F-7）。② 能量守恒：电做完计算后变成热，14.3 kW 的电 = 14.3 kW 的热 = 48,794 BTU/h（F-23）。③ 风：20 个风扇模块把空气从前往后抽，最大 1,550 CFM（F-24、F-25）；空气流过铜底铝鳍片时带走热（热的良导体）。④ 模拟运行点：进风 25 °C、出风约 43 °C（S1，写明模拟）。⑤ 进风要在 10–35 °C（F-29），所以机房要先把空气冷却——这就是数据中心的冷却用电（引出第 06 章）。
- **节拍**（第 1 拍说图例：赭金色点是电；灰色变橙色是空气由室温变热）：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章（side 剖切；layers 只开 current）；labels power-cords, psus, power-distribution | 电从后面进来，6 个电源各 3.3 千瓦 |
| 2 | pose psu-out；labels psu-single, psus | 抽出一个电源，另外 5 个照样供电 |
| 3 | layers 同拍 1；camera 自定（GPU 层侧剖）；labels gpu-modules, gpu-baseboard | 电一路送到 8 块 GPU，每块最多 1,000 瓦 |
| 4 | layers air（关 current）；labels fan-modules, gpu-heatsinks, rear-grille | 风扇墙从前往后抽风，经过散热塔，从后面排出 |
| 5 | camera rear-view；labels rear-grille, cpu-heatsinks | 在这个模拟里，25 度的空气进去，约 43 度出来 |

- **细看**：`Every watt becomes heat`（能量守恒；F-23 换算）；`Numbers at this simulated operating point`（§1.3 SIM 全部算式）；`Five plus one`（F-22）；`Why not liquid`（DGX B200 是风冷，NVL72 是液冷，F-35；引出第 06 章）。
- **本章索引**：power-cords, psus, psu-single, power-distribution, gpu-modules, fan-modules, fan-rotors, gpu-heatsinks, rear-grille, bezel
- **名词首现**：redundancy、airflow（CFM 当场解释，可不进名词表）。

### 7.6 第 06 章 `rack-and-data-centre`

- **summary**：One server is one building block: two fit in a rack, thousands are wired together to train a single large model. / 一台服务器只是一块积木：一个机柜放两台，上千台连在一起才训练一个大模型。
- **正文提纲**：① 机柜：NVIDIA 参考架构每柜两台，每柜功耗超过 25 kW（F-34）；柜顶交换机。② 集群：32 台为一个单元（256 块 GPU），网络按"轨"连接（每块 GPU 的网卡接同一号交换机）；参考架构表里最大 2,048 台、16,384 块 GPU（F-34）。③ 训练一个模型是什么规模（不是 B200 的例子，写明）：Llama 3.1 405B 用了约 3,084 万 H100 GPU 小时（F-38）。④ 另一条路线：NVL72 把 72 块 GPU 放进一个液冷机柜、用 NVLink 连成一个域，整柜约 120 kW（F-35）。⑤ 能耗：全球数据中心 2024 年约 415 TWh、约 1.5 %，2030 年可能翻倍（F-36）；新加坡的绿色数据中心路线图（F-37，核后才写）；一台机器满负荷一天约 300 kWh（SIM）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | 本章（in-rack）；labels rack-ears, rails | 装进机柜：这一台在下面，同一柜里还有一台 |
| 2 | camera 自定（机柜背面）；layers + data；labels osfp-cages | 每台后面引出 8 条网线，接到同一套交换机 |
| 3 | camera in-rack 拉远 | 32 台为一组，共 256 块 GPU；大的集群有上千台 |
| 4 | camera in-rack | 另一种做法：72 块 GPU 装进一个液冷机柜，整柜约 120 千瓦 |
| 5 | camera hero | 全世界的数据中心 2024 年用了约 415 太瓦时电，约占全球用电的 1.5% |

- **细看**：`What "training" means at this scale`（F-38、F-39，算术与假设写明）；`NVL72 in numbers`（F-35，作为文字插图；是否做第二个模型见 §12-4）；`Energy and Singapore`（F-36、F-37、F-42，核后才写）；`Cooling the room`（PUE 定义；新加坡路线图 PUE 目标待核）。
- **本章索引**：rack-ears, rails, osfp-cages, network-modules, psus, chassis-body
- **名词首现**：data-centre、pue、training、inference。

### 7.7 拍数

5 + 5 + 5 + 5 + 5 + 5 = 30 拍。每拍 `labels` ≤ 6、都在画面里（`--beats` 验收）；章 `labels` 近景章只写 3 个。

## 8. HUD

docs/08 §2「全引擎 HUD 铁律」a–e 自动生效：底部章节轴（6 段、每段 5 个刻度）、左列 PLATE 块、阅读面板 = 章头 → 节拍行 → 选中详情 → 正文 → 本章索引（每章 `state.index` 见 §7）。这里只填数据。

### 8.1 标题块与规格行

- DOC-ID：`ATL-B200SE-01…06`（引擎按 slug 前 6 个字符取）。
- 标题 EN "Inside an AI Server" / ZH "拆开一台 AI 服务器"；副标题 EN "An 8-GPU NVIDIA DGX B200, taken apart" / ZH "一台 8 GPU 的 NVIDIA DGX B200"。
- `note`：§0-2。
- 规格行（≤ 4；厂商 FACT，`tag` 见 E2）：

| key EN / ZH | value | tag |
|---|---|---|
| GPUs / GPU | 8 × B200 · 1,440 GB HBM3e | typical（E2 后改 fact） |
| NVLink / NVLink | 1.8 TB/s per GPU · 2 NVSwitch | typical |
| Power / 功率 | ~14.3 kW max · 6 × 3.3 kW | typical |
| Size / 尺寸 | 10U · 897 mm deep · 142 kg | typical |

### 8.2 右上卡（零件链路）

列 = cooling · gpu-tray · host · power（chassis、scene `card: false`）。最长列 host 14 行（紧凑行高）。EN 名 ≤ 14 字符：Fan modules / Fan rotors；GPU tray / Rear grille / Baseboard / Connectors / GPU modules / GPU dies / HBM3e / GPU heatsinks / NVSwitch / Switch duct；Host tray / Motherboard / CPUs / CPU heatsinks / Memory / PCIe switches / Network cards / NIC cables / OSFP ports / DPUs / Riser cards / Boot drives / Data drives / Rear I/O；PSUs / PSU 6 / Power dist. / Power cords。运转时按流的 `parts` 染色步进（§4）。

### 8.3 PLATE 块

- 立面 `views.section.plane = "zy"`（左侧立面：三层 + 前后，最能说明布局）；REFERENCE 同一立面。
- 模拟读数（`telemetry` ≤ 6，全部 SIM，值 = §1.3 模拟运行点）：

| key EN / ZH | unit | idle | run | lag（s） | decimals |
|---|---|---|---|---|---|
| Power in / 输入功率 | kW | 1.8 | 12.5 | 4 | 1 |
| GPU power / 每块 GPU | W | 140 | 950 | 3 | 0 |
| GPU temp / GPU 温度 | °C | 34 | 72 | 25 | 0 |
| Fans / 风扇 | % | 30 | 80 | 6 | 0 |
| Airflow / 风量 | m³/h | 790 | 2,107 | 6 | 0 |
| Exhaust / 出风 | °C | 32.0 | 42.9 | 20 | 1 |

GPU 温度一行若施工时找不到可对照的阈值，删掉或换成"Inlet / 进风 25 °C"（常数行意义不大，优先删）。风扇转速若找到 DGX B200 风扇规格，可把 % 换成 rpm（F-41）。

### 8.4 镜头预设（`presets` ≤ 6；不能与组同名）

| # | id | label | position | target | fov | view | 用途 |
|---|---|---|---|---|---|---|---|
| 1 | `hero` | HERO | (0.95, 0.85, 1.75) | (0, 0.20, 0) | 30 | — | 3/4 前右上 |
| 2 | `front-view` | FRONT | (0, 0.26, 1.55) | (0, 0.22, 0.40) | 30 | — | 正前（面板 / 风扇墙 / 硬盘） |
| 3 | `rear-view` | REAR | (−0.60, 0.45, −1.50) | (0, 0.22, −0.40) | 30 | — | 3/4 后左上（三层后面板） |
| 4 | `gpu-bay` | GPU TRAY | (0.55, 1.15, 0.75) | (0, 0.25, −0.02) | 30 | — | 俯视 3/4（顶盖移开后） |
| 5 | `host-bay` | HOST TRAY | (0.60, 0.70, 0.85) | (0, 0.09, −0.08) | 30 | — | 配 `host-level` 剖切 |
| 6 | `in-rack` | RACK | (1.90, 1.60, 3.60) | (0, 0.95, 0) | 30 | — | 第 06 章全柜 |

`views.cover` = (0.80, 0.70, 1.45) → (0, 0.20, 0)；`views.exploded.camera` 见 §6。

## 9. 名词表 `glossary.json`（15 个候选，正文用不到的删）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| gpu | GPU / 图形处理器 | 有成千上万个简单计算单元、能同时做大量乘加运算的芯片；最早用来画图，现在大量用于 AI | hbm, flops |
| cpu | CPU / 中央处理器 | 计算机的通用处理器，运行操作系统、调度任务；核数少、每个核更灵活 | gpu |
| hbm | HBM（high-bandwidth memory）/ 高带宽显存 | 把多层存储芯片叠起来、紧挨着 GPU 放的内存，总线很宽 | gpu |
| nvlink | NVLink | NVIDIA 用来直接连接 GPU 的高速链路，比 PCIe 宽得多 | nvswitch, pcie |
| nvswitch | NVSwitch / NVLink 交换芯片 | 把多块 GPU 的 NVLink 汇到一起、让任意两块都能直接高速通信的芯片 | nvlink |
| pcie | PCIe / PCI Express | 计算机里连接 CPU 和各种扩展设备的标准总线 | nvlink |
| flops | FLOPS / 每秒浮点运算次数 | 衡量计算速度的单位；P（peta）= 10¹⁵ | precision |
| precision | Precision (FP4, FP8) / 数值精度 | 每个数用多少位来存；位数越少算得越快、越省内存，但越不精确 | flops |
| network-card | Network card (NIC, DPU) / 网卡（含 DPU） | 让计算机接入网络的部件；DPU 还带自己的处理器，分担网络和存储工作 | infiniband |
| infiniband | InfiniBand | 超级计算机和 AI 集群常用的低延迟高速网络 | network-card |
| rack-unit | Rack unit (U) / 机架单位 | 机柜里设备高度的单位，1U = 44.45 mm | data-centre |
| redundancy | Redundancy (N+1) / 冗余 | 多准备一份部件，坏一个也能继续运行 | — |
| data-centre | Data centre / 数据中心 | 集中放置大量服务器、供电、冷却和网络的建筑 | pue |
| pue | PUE / 电能使用效率 | 数据中心总用电 ÷ 计算设备用电；越接近 1 越省电 | data-centre |
| training | Training / 训练 | 让模型反复看数据、调整参数的过程；用到的计算远多于使用（推理） | inference |
| inference | Inference / 推理 | 用训练好的模型回答问题、生成内容 | training |

（16 个，最终保留 12–15。）

## 10. 来源计划（33 条；P# → 施工时的 S#）

全部 2026-10-13 访问。厂商页面是一手来源但口径是厂商的（"NVIDIA 称"）；只读到摘要或二手报道的标 *。

| P# | 内容 | 来源 | 用于 |
|---|---|---|---|
| P1 | 本设计研究（模拟运行点、假设、重建几何的依据） | 本 spec §1.3、§3 | PLATE 块、细看、字幕 |
| P2 | DGX B200 产品页规格（GPU、显存、算力与脚注、NVSwitch、NVLink、功率、CPU、内存、网络、存储、10 RU、尺寸、10–35 °C） | https://www.nvidia.com/en-us/data-center/dgx-b200/ | F-1、F-3、F-4、F-8、F-10、F-14、F-17–F-19、F-23、F-30 |
| P3 | DGX B200 用户指南·系统介绍（组件表、机械规格 142.4 kg、电源 6 × 3.3 kW 5+1、每 GPU 1,000 / 800 W、1,550 CFM、48,794 BTU/h、20 个风扇模块、前后视图、两托盘图、拓扑图、端口图） | https://docs.nvidia.com/dgx/dgxb200-user-guide/introduction-to-dgxb200.html | F-1、F-2、F-7、F-15、F-17–F-29，R1–R7 |
| P4 | DGX B200 服务手册（风扇模块两风扇、30 秒；U.2 在面板后；主板托盘拆装） | https://docs.nvidia.com/dgx/dgxb200-service-manual/front-fan-replacement.html 、…/u2-nvme-cache-replacement.html 、…/motherboard-tray-removal-install.html | F-25、F-26 |
| P5 | HGX 平台页（HGX B200 列：各精度算力与脚注、14.4 TB/s、网络 0.8 TB/s） | https://www.nvidia.com/en-us/data-center/hgx/ | F-8、F-9、F-18 |
| P6 | Blackwell 架构页（2080 亿晶体管、两片光罩极限裸片、10 TB/s、TSMC 4NP、NVL72、576 GPU） | https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/ | F-5、F-13 |
| P7 | NVLink 页（第 5 代每 GPU 1,800 GB/s、18 条链路、NVL72 130 TB/s） | https://www.nvidia.com/en-us/data-center/nvlink/ | F-10、F-13 |
| P8 | AnandTech：Blackwell 与 B200 发布解读（192 GB = 每叠 24 GB、8 TB/s、每片 1040 亿） | https://www.anandtech.com/show/21310 | F-4、F-5 |
| P9 | Tom's Hardware：B200 发布（每片 4 叠 HBM3e、每叠 1 TB/s） | https://www.tomshardware.com/pc-components/gpus/nvidias-next-gen-ai-gpu-revealed-blackwell-b200-gpu-delivers-up-to-20-petaflops-of-compute-and-massive-improvements-over-hopper-h100 | F-6 |
| P10 | NVIDIA 新闻稿 2024-03-18 "NVIDIA Blackwell Platform Arrives…" | https://investor.nvidia.com/news/press-release-details/2024/NVIDIA-Blackwell-Platform-Arrives-to-Power-a-New-Era-of-Computing/ | F-32 |
| P11 | Intel ARK：Xeon Platinum 8570（56 核、2.1 / 4.0 GHz、300 MB、350 W、DDR5-5600 8 通道、PCIe 5.0、Intel 7、2023 Q4） | https://www.intel.com/content/www/us/en/products/sku/237264/intel-xeon-platinum-8570-processor-300m-cache-2-10-ghz/specifications.html | F-14、F-33 |
| P12 | ConnectX-7 网卡用户手册（400 Gb/s NDR / 400GbE、PCIe 5.0 x16） | https://networking-docs.nvidia.com/connectx7hw | F-20 |
| P13* | BlueField-3 DPU 页与数据手册（400 Gb/s；Arm 核数待核） | https://www.nvidia.com/en-us/networking/products/data-processing-unit/ | F-19 |
| P14* | PCI-SIG：PCIe 5.0（32 GT/s，x16 约 128 GB/s 双向） | https://pcisig.com/specifications（施工时定位具体页面） | F-16 |
| P15 | ServeTheHome：ASRock Rack 8U8X-GNR2 SYN B200 评测（HGX B200 托盘 6U、H200 为 4U、"SXM6 180GB"、需两人搬运） | https://www.servethehome.com/asrock-rack-8u8x-gnr2-syn-b200-review-nvidia-hgx-b200-8-gpu-server-intel-xeon/2/ | F-3、F-27，R10 |
| P16 | Wikimedia Commons：`File:Nvidia_DGX-B200-HGX.jpg`（Pokiiri，2025-09-07，CC BY-SA 4.0） | https://commons.wikimedia.org/wiki/File:Nvidia_DGX-B200-HGX.jpg | R8 |
| P17 | DGX SuperPOD（B200）参考架构 RA-11334-001（2025-04-24）：SU 32 台、每柜两台、每柜 > 25 kW、2,048 台 / 16,384 GPU、NDR 400 轨道优化胖树 | https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-b200/latest/dgx-superpod-architecture.html （及同目录 PDF） | F-34、F-26 |
| P18 | GB200 NVL72 产品页（72 GPU + 36 CPU、液冷、130 TB/s、13.4 TB） | https://www.nvidia.com/en-us/data-center/gb200-nvl72/ | F-35 |
| P19 | NVIDIA 技术博客：向 OCP 贡献 GB200 NVL72 设计（约 120 kW、直接液冷） | https://developer.nvidia.com/blog/nvidia-contributes-nvidia-gb200-nvl72-designs-to-open-compute-project | F-35 |
| P20 | DGX GB200 用户指南·硬件（18 个 1U 计算托盘、9 个 1U NVLink 交换托盘） | https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html | F-35 |
| P21 | IEA《Energy and AI》执行摘要（415 TWh、1.5 %、945 TWh、10 万户） | https://www.iea.org/reports/energy-and-ai/executive-summary | F-36 |
| P22 | Meta Llama 3.1 模型卡（30.84 M GPU 小时、H100 700 W、约 15 万亿 token、8,930 t CO₂e） | https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md | F-38 |
| P23* | Llama Team, "The Llama 3 Herd of Models"（arXiv 2407.21783，最多约 16K H100） | https://arxiv.org/abs/2407.21783 | F-38 |
| P24* | IMDA 绿色数据中心路线图（2024-05-30）；二手：Mayer Brown 2024-08 解读 | IMDA 官网（施工时定位）；https://www.mayerbrown.com/ja/insights/publications/2024/08/singapores-green-data-centre-roadmap-representing-a-necessary-intersection-between-digital-infrastructure-and-sustainability | F-37 |
| P25* | EIA-310 机柜标准（1U = 1.75 in = 44.45 mm、19 in 面板） | 施工时找可读的标准摘要页 | F-1、§3.2 |
| P26* | 空气物性（25 °C 密度 1.184 kg/m³、比热 1.006 kJ/(kg·K)）与风机定律 | ASHRAE Handbook—Fundamentals 或教材附表（施工时定） | SIM |
| P27* | Walpole 等（2012）"The weight of nations"，BMC Public Health 12:439（全球成人平均体重约 62 kg） | https://doi.org/10.1186/1471-2458-12-439 | F-2 |
| P28* | EMA《Singapore Energy Statistics》家庭用电（按房型的月平均用电） | https://www.ema.gov.sg（施工时定位表格） | F-42 |
| P29* | Converge Digest：Hot Chips 2024 Blackwell 预告（NVLink Switch 72 口、7.2 TB/s、800 mm²、4NP） | https://convergedigest.com/think-of-nvidia-blackwell-as-a-platform/ | F-11 |
| P30* | JEDEC DDR5 RDIMM 机械尺寸 | JEDEC MO-329（或内存厂商规格书） | F-33 |
| P31* | SNIA SFF-8201（2.5 英寸盘外形尺寸） | https://www.snia.org/technology-communities/sff/specifications | F-33 |
| P32 | DGX H100 / H200 用户指南·系统介绍（8U、356 mm、130.45 kg、1105 CFM @ 80 % PWM、6 电源 4+2） | https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html | F-24、F-31，R11 |
| P33 | ServeTheHome：Lambda / Cologix 的 Supermicro HGX B200 集群（主板放在 8-GPU 基板下面的理由） | https://www.servethehome.com/exploring-the-nvidia-hgx-b200-lambda-ai-cluster-at-cologix-with-supermicro/2/ | 第 02 章细看 |

## 11. 施工顺序、分工、引擎缺口与验收

### 11.1 顺序（照 `build-order.md`：E → D → T → B → P）

| 步 | 内容 | 谁 | 文件归属 | 完成标准 |
|---|---|---|---|---|
| 0 | 本 spec 定稿（§12）；docs/04 加一行 | 主会话 + Gavin | `docs/18-…`、`docs/04-…` | 决策表答复写进 §13 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts b200-server --engine space-scene --subject computer --title-en "Inside an AI Server" --title-zh "拆开一台 AI 服务器"`；R1–R11 下到 `scripts/geo/b200-server/refs/` | 主会话 | 主题目录 | `pnpm validate` 绿；参考图逐张看过 |
| E | E1（必须）；E2–E4（可选，Gavin 定） | Opus（引擎） | `src/engines/space-scene/**`、`schema.ts`、docs/06 | 单测；aircon / grasshopper / sample-space 不回归 |
| D1 | `topic.yaml`、`parts.json`（38 + 3 零件、9 组、8 流、2 动画、3 姿态、views + cuts、6 预设、规格行、遥测）、6 章 state + summary + index | Opus（几何 + 数据） | `src/content/topics/b200-server/**` | `pnpm validate` 0 error；与 spec 的差异写进 §14 |
| D2 | R2 几何两轮并排（R2、R3、R5、R6、R8）+ 干涉 → R3 材质（hero-clean）→ R4 流与动画 | Opus（视觉） | 同上的几何字段、`docs/screenshots/b200-server/` | 每轮 `pnpm shoot b200-server`，差异清零；calls / 三角形记数 |
| T | `sources.json`（P1–P33 逐条读原文，"待核"落定或删）、`glossary.json`、零件 summary / detail（EN / ZH）、六章正文与细看；**先写第 03 章样章给 Gavin** | Opus（事实与文字） | `data/sources.json`、`glossary.json`、`parts.json` 文本字段、`chapters/*.mdx` 正文 | `pnpm tsx scripts/sources-md.ts b200-server`；字数、`<Num>`、`<Term>` |
| B | 30 拍字幕与拍的镜头 / labels / hide / pose / cut | Sonnet | `chapters/*.mdx` 的 `state.beats` | `pnpm shoot b200-server --beats` 四组合 0 失败、无漏标 |
| P | R5 HUD → R6 镜头与模式组合 → R9 事实与代码审计 | Sonnet（QA），视觉问题回 Opus | 视需要 | `acceptance.md` 全勾 |
| 图 | Codex 石墨图版（已在跑）：按 §2.3 的更正决定是否重画；进首页插画管线由主会话处理 | Codex | scratchpad `genimg/b200/` | 不进主题事实 |
| 发布 | `status: published`；spec 补 §15 / §16；首页 computer 类出现第一个主题 → 索引页 e2e 的主题计数与分区 | 主会话 | | 门槛全绿；push 等 Gavin |

子代理不提交、不改 `package.json`；同一时间只一个代理写 `parts.json`。

### 11.2 引擎缺口（已查代码：`PartNode.tsx` 的动画作用在整个零件对象上，repeat / extra 不单独转）

- **E1（必须）每个重复件绕自己的中心转。** 现状：`rotate` / `pulse` 绕零件 `at`（或 `pivot`）转整个零件，`repeat` 的 5 列和 `extra` 的 8 个转子会绕风扇墙中心一起公转。最小方案：动画加 `each: true`——对 `repeat` 的每个实例、以及每个 `extra` primitive，绕各自的 `at` 和动画轴转（实例矩阵每帧更新，或按实例生成子 Object3D）；单测 + docs/06。退路：① 转子拆成 4 个零件（每排 `repeat 5`，仍绕排中心公转——不可用）；② 只做 1 个独立的 `demo-fan-rotor` 零件转动，其余静止（+1 零件）；③ 不做风扇动画，只靠气流表达。推荐做 E1，蚱蜢、肌肉主题以后也用得上（成排的足、毛）。
- **E2（可选）规格行 `tag: fact`。** 现状：`typical | design | sim`，只有 sim 出芯片；本主题的规格行是厂商事实。最小方案：加 `fact`（不出芯片或出 FACT 芯片，Gavin 定）。退路：用 `typical`。
- **E3（可选）穿孔板。** 现状：`panelHole` 只有一个圆孔，`grille` 只有格条和圆环。最小方案：`grille` 加 `style: "hex"`（六角孔阵，单一几何）。退路：格条近似，写进已知差距。
- **E4（可选）发光材质。** 现状：没有自发光；状态灯只能靠颜色 + pulse 缩放。最小方案：材质族 `led`（emissive，token 色）。退路：`token:success` 小球。

### 11.3 验收（`acceptance.md` 全部 + 本主题另加）

- [ ] Tier-1（§2.1）逐条和 R1–R8 并排对上；不认识这个主题的人看 hero-clean 能说出"一台机架服务器"，打开后能指出 8 块 GPU。
- [ ] 风扇模块 20、转子 40、GPU 8、裸片 16、HBM 64、NVSwitch 2、内存 32、U.2 8、电源 6、OSFP 4、ConnectX-7 8（2 个模块）、DPU 2：数量和 F 表一致。
- [ ] 每个厂商峰值数字（正文、细看、字幕、规格行）带"NVIDIA 称 / NVIDIA claims"和稀疏 / 稠密 / 精度口径：`grep -nE 'PFLOPS|petaflop|千万亿次' chapters/*.mdx` 逐条看。
- [ ] SIM 一致：PLATE 块六行 = S1 = 细看算式 = 字幕（"约 43 度"）；12.5 kW 进 = 12.5 kW 热。
- [ ] 模型上无 logo、无文字；`grep -rniE 'nvidia' src/content/topics/b200-server/data/parts.json` 只出现在 summary / detail 的事实句里，不出现在几何字段。
- [ ] 无价格、无"最强 / 革命性"等营销词：`grep -rniE 'most powerful|breakthrough|revolution|最强|革命' src/content/topics/b200-server` 为空。
- [ ] 第 06 章的训练例子写明是 H100 的数据、不是 B200；能耗数字带年份。
- [ ] `pnpm shoot b200-server --perf --gpu`：静止 calls、运转 calls、三角形写进 §15；超 50 时按 §3.3 的降法处理并记录。

### 11.4 Gavin 审

第 03 章样章（GPU、NVLink、峰值口径的写法）；第 05 章能量守恒段；第 06 章能耗与训练规模段（客观、不渲染、不评价）。

### 11.5 已知风险（引擎对本主题的限制）

- **风扇转动**：没有 E1 就转不起来或转错（§11.2）。
- **绘制次数**：多材质零件多，静止可能 > 50（§3.3）。
- **单一剖切面**：`chips` / `host-level` 切面同时切所有零件，气流粒子会出现在被切掉的空间里；第 03、04 章关掉 `air` 层即可。
- **穿孔与表面**：金色海绵状面板、六角穿孔排风面、PCB 走线、芯片上的文字都做不出来（无贴花）；芯片和 HBM 是光滑方块。
- **鳍片片距放宽**：散热塔约 4 mm 可视片距，真实更密（待核），detail 写明。
- **姿态是整零件平移**：托盘抽出时托盘内所有零件逐个写进 pose；漏写一个就会"留在机箱里"，验收时看拍 5。
- **流不随拆开移动**：EXPLODED 时 FLOW 禁用；托盘抽出的姿态下流也不跟着走——第 02 章拍 5 不运转。
- **重建部分**：中板、配电、PCIe 交换、托盘后部封闭舱、GPU 托盘抽出方向，都没有一手图或文字；用"示意"标出，T 步读服务手册能核多少核多少。

## 12. 待 Gavin 确认

1. **对象**：DGX B200（推荐，§0-1）还是"通用 HGX B200 8-GPU 服务器"（数字写区间、布局任选一家）。连带：是否接受正文与零件名里出现 NVIDIA / Intel 等事实性名称（§0-2），以及标题块声明的措辞。
2. **人形比例尺**：第 01 章是否放 1.70 m 中性剪影（context，`token:mannequin`）；还是只用比例尺和"两个成人的重量"文字。
3. **GPU 芯片章的深度**：推荐到"两块裸片 + 8 叠 HBM + 晶体管数"为止（§0-3）；是否要再下一层（Tensor Core、SM 数量、FP4 的意思展开成一节）。
4. **NVL72**：推荐只在第 06 章正文与细看里作为文字（加可选的石墨插图，Codex 已在画 `b200-rack`，可加一张 NVL72），**不做第二个 3D 模型**；另一选项是之后单开一个 `nvl72-rack` 主题。
5. **参考图许可**：是否同意用 NVIDIA 文档图（© NVIDIA）作本地对照（不进 git、不发布）——没有它们，风扇墙、托盘布局无法按真机做（§2.3）。
6. **规格行标签**：是否做 E2（`fact` 标签）；不做就用 `typical`。
7. **示意值**：PLATE 块的"GPU 温度"在没有官方阈值时是删掉还是保留为纯示意（§8.3）；风扇读数用 % 还是 rpm（F-41）。
8. **新加坡能耗段**：IMDA 路线图与"数据中心约占全国用电 7 %"核到原文才写；核不到是删还是只写 IEA 全球数字。
9. **Codex 图版**：按 §2.3 的更正重画后再进首页插画，还是先不进首页。
