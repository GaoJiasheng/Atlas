# 75 · 脑与神经 · 内容施工 spec（`brain-and-nerves`，SpaceScene + 真实网格 + 显微工位 + 试一试；v1 草稿，待 Gavin 定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §3 生物 / 有机体（按系统分区）。**真实网格**：Z-Anatomy `NervousSystem100.fbx`（脑、脊髓、周围神经）+ 已缓存的 `SkeletalSystem100.fbx`（颅骨、脊柱）、`MuscularSystem100.fbx`（右臂肱二头肌等）、`Regions of human body100.fbx`（皮肤轮廓），与 `digestive-system`、`heart-and-lungs` 同一个成年男性参考身体、同一套脐中心坐标，走 `scripts/anatomy` 的静态器官管线（新 region `brain-nerves`，§5），产出 `public/models/brain-and-nerves.glb`。神经元、突触、脊髓横切、保护层、头盔是**程序化放大工位**（§4.3），与身体不同比例、分开摆放。

本主题的任务：**读者看完能说清：神经系统分中枢（脑和脊髓）与周围神经两部分，神经像电线一样通到全身，但传的是神经细胞膜上的电信号；脑的大脑（左右两个半球、每侧四个叶）、小脑、脑干大致各管什么，以及"只用了 10 % 的脑""左脑理性右脑感性"为什么不对；一个神经元长什么样、信号怎样沿它传、到了末端怎样靠化学物质跨过一道窄缝传给下一个细胞，最快的信号有多快；手碰到烫杯子时，信号怎样走感受器 → 感觉神经 → 脊髓 → 运动神经 → 肌肉这条反射弧，手为什么在"觉得烫"之前就缩回来；眼睛、耳朵、皮肤的信号各进到脑的哪里；颅骨、脑膜、脑脊液、脊柱怎样保护脑和脊髓，为什么骑脚踏车、滑板车要戴头盔；睡眠对脑有什么用、小学生该睡多久。**

2026-11-15 起草。**只出 spec，不施工、不建目录、不下载、不提交。** 结构照 docs/40、docs/58：§0 决定与核查 → §1 课纲与范围 → §2 事实表 → §3 对象、网格与零件 → §4 流、动画、显微工位、模式 → §5 网格管线与许可分层 → §6 试一试与引擎扩展 → §7 章节与节拍 → §8 HUD → §9 名词表 → §10 插图需求 → §11 写法与用词 → §12 施工顺序与验收 → §13 来源表 → §14 已知风险。字幕与正文要点是**草稿**，用来定节拍和模型状态；施工时 EN / ZH 各自定稿。**P#** 是本文来源计划号（§13），施工时变成 `sources.json` 的 S#；"待核"= 起草时没读到原文或只读到摘要 / 搜索摘要，施工代理读原文核对后才能用，核不到按该行的退路处理。

---

## 0. 决定与事实复核

### 0.0 起草时实际核过的东西（2026-11-15）

| 项 | 怎么核的 | 结论 |
|---|---|---|
| `NervousSystem100.fbx` 存在、大小、许可 | GitHub API 列 `LluisV/Z-Anatomy` PC-Version 分支 `Resources/Models/FBX/` | **53,887,724 B**；`https://raw.githubusercontent.com/LluisV/Z-Anatomy/PC-Version/Resources/Models/FBX/NervousSystem100.fbx`；仓库 CC BY-SA 4.0；**未下载** |
| 该文件里有哪些结构 | 读仓库 `Resources/Layers/Collections - Nerves.csv`（18,384 B，Z-Anatomy 的图层名表，625 个名字）与 `Collections - Group-Nerve.csv` | 名表里有本题要的几乎全部结构（§3.4）。**这是图层名表，不是 FBX 的 inventory**：每个名字是不是实网格、多少三角形、闭合与否、坐标是否与骨骼同一身体，**全部待下载后 inventory 核**（§5.2 闸门 G1） |
| 本机缓存里有没有神经结构 | 读 `scripts/anatomy/cache/inventory.json`（5,833 个对象，来自已缓存的 6 个 FBX） | 没有脑、脊髓、神经网格（只有 `Cerebral fossa.j` 等 12 三角形的标记点）；颅骨与 33 节椎骨**有**（`Frontal bone` 7,776 三角形、`Parietal bone.l` 6,886、`Temporal bone.l` 14,094、`Occipital bone` 7,531、`Sphenoid bone` 7,308、`Ethmoid bone` 10,130、`Vertebra C3`–`L5`、`Atlas (C1)`、`Axis (C2)`、`Sacrum`、`Coccyx`），不用再下 |
| Z-Anatomy 的第三方模型 | 读缓存 `License.txt`（与仓库 `Resources/Models/License.txt` 同一份） | 除 BP3D 派生外另收了 **"Brainder" 与 "White matter"（University of Washington）**、**"Cranial Nerves and Foramina"（University of Dundee CAHID，CC BY 4.0）**、**"Anatomy of the Inner Ear"（Dundee，CC BY-NC-SA 4.0）**、"Kidney"（CC BY-NC 4.0）。前四个都可能在 Nervous 文件里 → **许可分层是本主题的头号风险**（§5.4） |
| Brainder 的许可 | 读 brainder.org/brain-for-blender | 模型作者 Anderson Winkler，**CC BY-SA 3.0 Unported**；FreeSurfer 5.2 从一个真实成人的 12 次 MPRAGE 平均像重建；有整半球与 Destrieux 等分区的逐区网格。Nerves.csv 里 `Sulcus interm_prim-Jensen`、`Lat_Fis-post` 这类名字正是 Destrieux 分区的标签 → 大脑皮层几乎可以肯定来自 Brainder |
| "White matter"（UW）的许可 | 网上搜索 | **没找到原始出处与许可**。默认不用任何白质纤维束（`… fasciculus`、`… tract`、`Cingulum`、`Fornix` 等），§5.4 |
| 课纲 | 本地 `art/codex-research/states-of-matter/sources/moe-primary-science-2023-jan2026.pdf`（`pdftotext`） | 小学科学 2023 课纲**没有**神经系统、脑、神经（全文 grep "nerv"、"brain" 无结果）；P4 列的五个人体系统是消化、呼吸、循环、骨骼、肌肉（印第 53 页）；System 的定义在印第 13、52 页；P5 "Recognise the integration of the different systems" 在印第 54 页；"Use senses" 在印第 16 页 |
| PE 2024 课纲 | MOE PE 课纲 PDF（docs/17 S4 的 URL），`pdftotext` | P3 Safety：**"Understand safety measures to stay safe as a cyclist and a pedestrian."**（印第 96 页）；睡眠：P2 "Know the importance of sleep and the different sleep practices."（95）、P3 "Apply sleep practices for healthy growth."（96）、P5 "Understand the relationship between sleep and health."（98） |
| 新加坡头盔规定 | LTA *Rules & Code of Conduct*（页面写 Last updated 26 October 2026） | 骑脚踏车与 PAB（电动助力脚踏车）**在马路上**必须戴头盔；在行人道 / 脚踏车道上法律没有要求；未满 16 岁不得在脚踏车道骑电动滑板车、不得在脚踏车道和马路上骑 PAB。2026-06-01 新规与头盔无关 |

### 0.1 代定项（需要 Gavin 拍板；默认值已写进全文，改了只动对应几处）

| # | 问题 | 默认 | 另一条路 |
|---|---|---|---|
| Q1 | **下载批准**：`NervousSystem100.fbx`（53,887,724 B，CC BY-SA 4.0 + 混合第三方，§5.1）下到 `scripts/anatomy/cache/`（gitignore） | 批准后由主会话 / Opus 代理下载，追加 `FETCHED.txt`、`SHA256SUMS.txt`，先跑 inventory 与来源核（§5.2 G1–G3），**核完再定零件表** | 不下载：脑和神经全部程序化（工作量大很多、一眼认度差；不推荐） |
| Q2 | **大脑皮层用 Brainder（CC BY-SA 3.0）的网格** | 用。BY-SA 3.0 允许按"更新版本、相同要素"的许可发布改编作品，所以并进 BY-SA 4.0 的 glb 合法；署名加一行 Brainder（§5.4）。前提：G2 能逐节点认出 Brainder 来源 | 不用：改直接取 BodyParts3D 4.0（CC BY 4.0）的脑（FMA 名表里有大脑各回，**是否有可用网格待核**）；或皮层做程序化（不推荐） |
| Q3 | **脑分区颜色**：给额、顶、颞、枕四叶 + 小脑 + 脑干各一个颜色 token（E-BN1，6 个新 token） | 加。颜色只在"脑的分区"章与 PLATE 立面开，其他章一律中性组织色；颜色旁永远有引线标注，不靠颜色单独传义 | 不加 token：全脑同一色，分区只靠拍的 `hide` / `ghost` 与引线（第 02 章的观感会弱很多） |
| Q4 | **缩手反射的手臂动作** | 静态管线：把右前臂骨 + 手骨 + 前臂段神经拆成独立节点，用 `sequence` 绕肘关节地标转 ≤ 20°；右肱二头肌烘焙 `_U` / `_FIBRE` 后用 `contract`；反射那几拍隐藏皮肤（字幕写明）。肱二头肌远端与桡骨的缝隙 ≤ 5 mm 才过（§12） | 走肌肉系列的 rig 管线（arms 的权重），皮肤也能弯；多约 1.5 天，管线要支持 rig + 静态器官混合 region（现在没有） |
| Q5 | **"关于脑的两个误会"单独成章** | 单独一章（03，4 拍）：读者最容易记住的就是这两句话 | 并进第 02 章细看（拍数 41 → 37） |
| Q6 | **试一试 T6 尺子接落**要请读者和同伴真的做 | 做：卡片上有"读你接住的位置"一个步进控件，读者在家用 30 cm 尺子做，回来查时间；不要求设备、不计时、不评分。说明"坐着做、尺子竖直下落、只用手指捏" | 只放模型值（固定几行），不请读者动手 |
| Q7 | **孩子的反应时间参考值** | 只在细看给一项研究：印度 204 名 6–12 岁学生，尺子法平均约 0.23 s（P21），写明"一项研究、一个地方的学生"，不当标准、不让读者比高低 | 不给任何参考值 |
| Q8 | **睡眠数字** | 规格行与正文用新加坡指引"7–13 岁每晚至少 9 小时"（P15）；细看并列美国 NHLBI"6–12 岁 9–12 小时"（P16） | 只写新加坡的 |
| Q9 | **头盔章的说法** | 主线："骑脚踏车、滑板车、溜冰都戴好头盔、扣好带子"；法律只说一句"在新加坡，在马路上骑脚踏车必须戴头盔"（P18）；不鼓励、不教电动滑板车（未满 16 岁不得在脚踏车道上骑，P18） | 不提法律，只讲物理与官方建议 |
| Q10 | **中文术语**（§9）最想请 Gavin 或课本确认的六处：主题名"脑与神经"；relay neuron 写"中间神经元"（不用"联络神经元"）；receptor 写"感受器"、effector 写"效应器"（主线用"肌肉"代替效应器）；myelin 写"髓鞘"；cerebrum 写"大脑"（与"脑"区分）；lobe 写"叶"（额叶、顶叶、颞叶、枕叶） | 照左 | — |
| Q11 | **主题等级标签** | `tags: [beyond-syllabus, biology, space]`、`levels: [P5, P6]`；`moe` 只写"系统的概念与 P5 系统协同是接口，神经系统本身在课纲外"，不贴 PSLE | `levels: [P4, P5, P6]` |

### 0.2 决定（默认方案）

| # | 决定 | 依据 |
|---|---|---|
| D1 | **形式 = SpaceScene 真实网格 + 三个程序化放大工位 + 三张试一试**。身体尺度看"在哪里、连到哪里"（脑、脊髓、神经通全身），放大工位看"怎么工作"（神经元、突触、脊髓横切、保护层）。不做 MathScene 小测（科学主题默认不做，docs/40 D1） | docs/17 §5"脑与神经：反射弧的流"；docs/40 D1 |
| D2 | **课纲定位：课外拓展**。MOE 2023 小学科学没有神经系统；接口只有三处：System 的定义（印第 13、52 页）、P4"人体有多个系统"（53）、P5 系统协同（54）。00 章细看说清"课纲的五个人体系统里没有神经系统，这一课是课外的"；**不写"PSLE 要考"**。PE 接口：P3 骑车安全（96）、P2 / P3 / P5 睡眠（95、96、98） | §0.0；P2、P3 |
| D3 | **章数 8 + 背景章 00，共 41 拍**（§7）：00 开始之前 / 01 神经系统一览 / 02 脑的分区 / 03 关于脑的两个误会 / 04 神经元与信号 / 05 缩手反射 / 06 从感官到动作 / 07 保护脑和脊髓 / 08 睡眠与脑 | 编辑决定 |
| D4 | **必须讲对的十处**（§1.4 误解目录逐条对应）：① 神经系统 = 中枢（脑 + 脊髓）+ 周围神经，脊髓不是骨头、是神经组织，在脊柱的管道里；② 神经是一束神经细胞的长突起（轴突），不是一根空心管，里面不流血、不流"电流"；③ 神经信号是细胞膜上一段一段传过去的电变化，不像电线里的电流，速度从每秒不到 1 米到一百多米（P7、P10）；④ 两个神经元之间有一道很窄的缝，信号靠化学物质过缝（多数突触），有约 1 毫秒的延迟（P8）；⑤ 缩手反射的"转弯处"在脊髓，不必等脑；脑也收到信号，但手已经在缩（P9，"在觉得痛之前"待核）；⑥ 大脑每侧主要管对侧身体（待核 P30）；⑦ "只用 10 % 的脑"不对（P14 待核、P12）；⑧ 没有"左脑型 / 右脑型"的人（P13），但语言在大多数人主要靠左半球的部分区域（P4）；⑨ 脑不会"一个区只做一件事"：每个叶有它主要参与的事，复杂的事要多个区一起做；⑩ 眼睛、耳朵把光和振动变成神经信号，进到脑的不是光或声音（与 `eyes-and-ears` 一致） | §1.4 |
| D5 | **网格只取 Z-Anatomy 系列**（同一身体、同一坐标、同一许可链），但 Nervous 文件里**逐节点核来源**：BP3D / Z-Anatomy 自建 → CC BY-SA 4.0；Brainder → CC BY-SA 3.0（可并入）；Dundee 颅神经 → CC BY 4.0（可并入）；**Dundee 内耳（CC BY-NC-SA）、UW 白质（许可不明）、任何认不出来源的节点 → 不进 glb**。认不出来源的结构若是必需（例如皮层），按 Q2 的退路处理，不默认当 BY-SA | §0.0、§5.4 |
| D6 | **身体尺度不夸张**：成年男性参考解剖、真实大小；放大工位各自 `scale`（组级 `{ unit, magnification }`）并在标题块 `note` 写明。显微工位的形状是**原创程序化示意**，不描任何教科书图 | docs/63 §3.1 的做法 |
| D7 | **数字纪律**：每个数带来源与条件；范围照写；模型读数写"在这个模型里"。三张试一试全部用现有 `table`（docs/40 E-HL1）：每一格挂来源或挂设计研究 P1 并带 SIM。**不写**"脑每秒处理多少信息""神经加起来多长"这类来源不可靠的数 | writing-rules.md；docs/40 D7 |
| D8 | **不展示病理**：不画中风、肿瘤、脑损伤、癫痫；不放 MRI / CT / 手术照片；头盔章只讲"降低头部重伤的机会"与物理，不描写伤情；裂脑手术、植物人、脑死亡不讲。细看可以一句"头部受伤要马上告诉大人、去看医生"（价值陈述，不当事实引来源） | 用户要求；writing-rules.md |
| D9 | **不讲**：神经递质的名字（乙酰胆碱、多巴胺）、离子通道与膜电位数值（−70 mV）、自主神经系统的交感 / 副交感细节（细看一句"有一部分神经管心跳、消化这些不用你想的事"）、激素与内分泌、记忆的分子机制、智商、"大脑开发"、脑训练游戏、学习风格、咖啡因与能量饮料、屏幕时间对脑的影响（证据复杂，P5 PE 的屏幕时间由 PE 讲） | 范围 |
| D10 | **流的颜色一色一义**：神经电信号 `token:en-electrical`（与 `eyes-and-ears` 的 `nerve-signals` 同色）；突触里的化学信号新 token `--chemical-signal`（E-BN1）；**感觉方向与运动方向不分色**，靠路线和字幕区分（避免"蓝进红出"之类的发明） | eyes-and-ears parts.json；tokens.css 一色一义 |
| D11 | **三张试一试，全部复用 `table`，新增引擎压到最小**（§6）：**T4 信号快慢**（04：有髓鞘的粗纤维 / 没有髓鞘的细纤维 → 速度、走 1 米要多久）；**T5 跟着反射走**（05：一步步点亮反射弧，同 `heart-and-lungs` T4 的写法）；**T6 尺子接落**（06：读者读出自己接住的厘米数 → 反应时间，可记表、条形图）。不做实时点击计时器（浏览器计时抖动、iPad 触摸延迟、可访问性；列入 v2） | docs/40 §4.2、docs/06 table |
| D12 | **引擎扩展编号 E-BN#**：E-BN1 七个颜色 token（必须）；E-BN2 髓鞘"跳跃"流（可选，退路是普通流）。网格管线扩展记作 P-BN#（§5），不算引擎 | §6.4 |
| D13 | **与已发布主题的分工**：感官怎样把光和振动变成信号归 `eyes-and-ears`（本题只接"信号进脑以后去哪里"）；细胞与显微镜归 `cells`（本题的神经元是"一种特别的细胞"，链 `cells-and-systems`）；肌肉怎样拉动骨头归 `muscles-arms`（本题只说"运动神经让肱二头肌收缩"）；颅骨与脊柱的骨学归 `bones-and-joints`；系统协同归 `heart-and-lungs` 05 章 | §1.5 |
| D14 | **图**：封面 + 4 张章图，**全部新做**，交 Codex 生成，严格照 §10；反射弧图是"讲关系"的图，docs/69 的教训是 AI 最容易画错关系，所以**反射弧图默认代码绘制**（几何 + 铅笔质感），其余 AI 生成。**禁止**从本主题 glb 渲染再"描"成铅笔画（docs/69 muscles 封面的教训） | docs/69 §1 |

---

## 1. 课纲对照与范围

### 1.1 课纲锚点（逐字，起草时从 PDF 读；页码是页脚印的数字，PDF 第 n + 1 页 = 印第 n 页）

**P2**：MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six*，2023 Primary Three Cohort 起实施，封面 "Updated Jan 2026"（本地副本见 §0.0）。

| 页 | 原文（≤ 25 词） | 与本主题 |
|---|---|---|
| 13、52 | "A system is a whole consisting of parts that work together to perform function(s)." | 00、01 正文：神经系统也是这样一个"系统" |
| 53 | "Identify the human systems in the body and state their functions (digestive, respiratory, circulatory, skeletal and muscular)." | 00 细看：课纲的五个系统里没有神经系统 |
| 54 | "Recognise the integration of the different systems (digestive, respiratory, circulatory) in carrying out life processes." | 01 第 5 拍、08 正文：神经系统也参与"一起工作"——**写成课外延伸**，不说课纲要求 |
| 16 | Conducting：*"Use senses, …"* | 06 正文：感官收集信息 |

**P3**：MOE SDCD，*Physical Education Syllabus — Primary, Secondary & Pre-University*，2024 版。

| 页 | 原文 | 与本主题 |
|---|---|---|
| 95（P2） | "Know the importance of sleep and the different sleep practices." | 08 |
| 96（P3） | "Understand safety measures to stay safe as a cyclist and a pedestrian." | 07 头盔 |
| 96（P3） | "Apply sleep practices for healthy growth." | 08 |
| 98（P5） | "Understand the relationship between sleep and health." | 08 |

### 1.2 边界一览（主线 / 细看 / 不讲）

| 内容 | 处理 |
|---|---|
| 中枢 / 周围神经；脑、脊髓、神经在身体里的位置 | 主线（01） |
| 12 对脑神经、31 对脊神经 | 规格行 + 01 细看（P6） |
| 大脑两半球、四个叶、小脑、脑干各自主要参与什么 | 主线（02） |
| 胼胝体连接两半球 | 主线一句（02 第 2 拍） |
| 每侧大脑主要管对侧身体 | 主线一句（02 第 2 拍），F-14 待核，核不到删 |
| 丘脑、海马、杏仁核、基底核 | 不讲（02 细看最多一句"脑的深处还有很多结构，这里没画"） |
| 两个误会：10 %、左脑 / 右脑 | 主线（03） |
| 神经元的结构：细胞体、树突、轴突、髓鞘、末梢 | 主线（04） |
| 电信号沿轴突、髓鞘让它更快、速度范围 | 主线（04、T4） |
| 突触与化学信号（不讲递质名字） | 主线（04 第 4–5 拍） |
| 反射弧五步：感受器 → 感觉神经元 → 脊髓里的中间神经元 → 运动神经元 → 肌肉 | 主线（05、T5） |
| 膝跳反射 | 05 细看一句（只有两个神经元、没有中间神经元的例子），待核 F-27 |
| 眼、耳、皮肤的信号进脑以后去哪 | 主线（06），只到"枕叶 / 颞叶 / 顶叶"，不讲视交叉的交叉规则细节（细看一句"左右眼的信号在这里交换一部分"） |
| 反应时间：看见 → 脑 → 手 | 主线（06、T6） |
| 颅骨、三层脑膜、脑脊液、脊柱 | 主线（07） |
| 头盔怎样保护、新加坡规定 | 主线（07） |
| 睡眠时长、睡眠和学习记忆 | 主线（08），数字只用两个来源 |
| 睡眠阶段（快速眼动等）、梦 | 08 细看一句，不出数 |
| 疾病、损伤、药物、手术 | 不讲（D8） |

### 1.3 读者学到什么（P5–P6 用词）

1. 神经系统由脑、脊髓和神经组成：脑和脊髓叫中枢神经系统，通到身体各处的神经叫周围神经系统。
2. 脑在颅骨里，下面连着脊髓；脊髓在脊柱的管道里往下走，比脊柱短，大约到腰部上方就结束，再往下是一束神经根（P4）。
3. 神经像一捆电线，每根"线"是一个神经细胞很长的突起；有的把消息从身体送进脊髓和脑（感觉），有的把命令从脑和脊髓送到肌肉（运动），很多神经两种都有（P6）。
4. 大脑分左右两个半球，中间由一大束神经纤维（胼胝体）连起来；每个半球有四个叶：前面的额叶参与计划、做决定和发出动作命令，顶叶接收触觉等身体感觉，颞叶参与听和记忆，后面的枕叶参与看（P4）。
5. 小脑在大脑后下方，把动作调得协调、平稳；脑干连着脊髓，管呼吸、心跳这些一直在进行、不用想的事（P4）。
6. "人只用了 10 % 的脑"不对；也没有"左脑型""右脑型"的人——两边一直在一起工作（P12、P13）。
7. 神经元有细胞体、很多短的树突和一条长的轴突；信号是沿轴突细胞膜传过去的电变化；包着髓鞘的粗轴突最快，可以超过每秒 100 米，细的、没有髓鞘的每秒不到 1 米到几米（P10、P7）。
8. 两个神经元之间有一道很窄的缝（突触），信号到了末端，会放出化学物质跨过这道缝，让下一个细胞产生信号（P8）。
9. 手碰到很烫的东西：皮肤里的感受器产生信号 → 感觉神经元把它送进脊髓 → 脊髓里的中间神经元接上 → 运动神经元把命令送到上臂的肌肉 → 肌肉收缩，手缩回来。这条路叫反射弧，不需要先"想一想"（P9）。
10. 眼、耳、皮肤把光、振动、触碰变成神经信号，信号分别进到脑里不同的区域。
11. 颅骨、三层脑膜和脑膜之间的脑脊液保护脑；脊柱保护脊髓。骑脚踏车、滑板车时戴好头盔，能大大降低头部重伤的机会（P20）。
12. 睡觉时脑仍在工作；睡够对学习和记忆有帮助（P17）；新加坡建议 7–13 岁每晚至少睡 9 小时（P15）。

### 1.4 误解目录（每条至少一拍或一段正文正面讲）

研究依据大多**不是新加坡小学生**；没有学生研究的标"假设"，正文只正面讲对的说法，不写"很多人以为"。

| # | 说法 | 正确的说法 | 哪里讲 | 依据 |
|---|---|---|---|---|
| M-1 | 人只用了 10 % 的脑 | 一天里脑的各部分都在工作；不同的事用到不同的区，但没有"闲着的 90 %" | 03 第 1–2 拍 | P14（待核）；教师中的流行度 P12（英国 48 %、荷兰 46 % 的教师同意这句话） |
| M-2 | 有人"左脑型"（理性），有人"右脑型"（感性） | 1,011 人的脑连接数据里找不到整脑偏左或偏右的人；某些功能偏一侧（如语言多在左侧），但两边一直合作 | 03 第 3–4 拍 | P13；教师流行度 P12（英国 91 %、荷兰 86 % 同意"左右脑优势能解释学生差异"） |
| M-3 | 神经是空心管，里面流着电（或流着血） | 神经是一束轴突；信号是细胞膜上的电变化，一段接一段传下去 | 01 第 3 拍、04 第 3 拍 | 假设；事实 P6、P7 |
| M-4 | 神经信号和电线里的电一样快（光速） | 最快约每秒一百多米，慢的每秒不到 1 米 | 04 第 3 拍、T4 | 假设；P10 |
| M-5 | 一个神经元直接"焊"在下一个上 | 多数是一道窄缝，靠化学物质传过去，所以有约 1 毫秒的延迟 | 04 第 4–5 拍 | 假设；P8 |
| M-6 | 缩手是脑先想"好烫"再下命令 | 转弯在脊髓；脑也收到消息，但不必等它 | 05 全章、T5 | 假设；P9 |
| M-7 | 脊髓是骨头 / 脊髓和脊柱一样长 | 脊髓是神经组织，在椎骨围成的管道里；比脊柱短 | 01 第 2 拍、07 第 3 拍 | 假设；P4 |
| M-8 | 眼睛里的"像"或声音本身沿神经进了脑 | 进脑的是神经信号 | 06 第 1–2 拍 | 与 `eyes-and-ears` D4 一致 |
| M-9 | 睡觉时脑关机了 | 睡觉时脑仍在工作，睡够帮助学习和记忆 | 08 第 1–2 拍 | 假设；P17 |
| M-10 | 脑是一整块，摸起来很硬 / 直接贴在颅骨上 | 脑软，外面三层膜，膜之间有脑脊液当"液垫" | 07 第 2 拍 | 假设；P5 |

### 1.5 与其他主题的分工

| 内容 | 谁负责 | 本主题怎么处理 |
|---|---|---|
| 人体五个系统、"系统"是什么 | `digestive-system`（`five-systems`） | 00 正文链过去 |
| 系统协同、运动时心跳呼吸变快 | `heart-and-lungs`（`three-systems`） | 01 第 5 拍正文链过去；细看一句"脑干参与调节呼吸和心跳"，不重讲 |
| 细胞、显微镜 | `cells`（`animal-cell-parts`、`cells-and-systems`） | 04 正文第一句链过去："神经元是一种动物细胞，也有细胞膜、细胞质和细胞核" |
| 眼与耳怎样把光和振动变成信号 | `eyes-and-ears`（`an-image-on-the-retina`、`vibration-to-signal`） | 06 第 1、2 拍链过去，不重讲角膜、晶状体、耳蜗 |
| 声音本身 | `sound` | 06 细看一句链过去 |
| 肱二头肌、屈肘 | `muscles-arms`（`how-they-move-you`） | 05 第 4 拍链过去 |
| 颅骨、脊柱的骨学 | `bones-and-joints`（`connected-skeleton`） | 07 第 1、3 拍链过去 |

**谁后发布谁补链接**：本主题发布时，主会话在 `eyes-and-ears` 第 `vibration-to-signal` 章、`cells` 第 `cells-and-systems` 章、`muscles-arms` 第 `how-they-move-you` 章末段各加一句回链（内容代理不碰那几个目录）。

---

## 2. 事实表

`TYPICAL` = 公开来源的典型值；`DESIGN` = 本设计研究取的值（P1）；`SIM` = 试一试与 PLATE 的模型读数；`MESH` = 施工时在网格上量的（写"在这个模型里"）。可信度：high（课纲、OpenStax、同行评审、政府页面）、medium（教科书节选、只读到摘要）、low（搜索摘要）。

### 2.1 神经系统与脑的结构

| # | 事实 | 来源 | 可信度 / 待核 |
|---|---|---|---|
| F-1 | 脑与脊髓 = 中枢神经系统；周围神经系统 = 中枢以外的神经与神经节 | P4、P6 | high |
| F-2 | 神经是周围神经系统里的一束轴突；神经节是周围的一群神经元细胞体 | P6（"Bundles of axons in the PNS are referred to as nerves."） | high |
| F-3 | 12 对脑神经；31 对脊神经（颈 8、胸 12、腰 5、骶 5、尾 1） | P6 | high |
| F-4 | 12 对脑神经中 3 对纯感觉、5 对纯运动、4 对混合 | P6 | high；只进细看 |
| F-5 | 脊髓在出生后一两年后不再明显变长，脊柱继续长；骶段脊髓在上腰椎水平，以下的神经根成"马尾" | P4 | high |
| F-6 | 中央前回 = 初级运动皮层（额叶）；中央后回 = 初级躯体感觉皮层（顶叶，触、压、痛、温、身体位置） | P4 | high |
| F-7 | 颞叶有初级听觉皮层，也参与记忆；枕叶有初级视觉皮层 | P4 | high |
| F-8 | 布罗卡区（说话）"在绝大多数人"只在左侧 | P4 | high；03 第 4 拍 |
| F-9 | 胼胝体是两半球之间主要的连接通路 | P4 | high |
| F-10 | 小脑比较来自大脑的指令和身体的感觉反馈，纠正不协调的动作；约占脑质量的 10 % | P4 | high |
| F-11 | 脑桥、延髓调节心血管与呼吸；脑干网状结构与睡眠、清醒有关 | P4 | high |
| F-12 | 成年男性脑约 861 亿（± 81 亿）个神经元；约 19 % 在大脑皮层 | P11（摘要已读） | high |
| F-13 | 小脑虽只占约 10 % 质量，却有大部分神经元（约 690 亿 / 约 80 %） | P11 正文表 | **待核**（摘要只读到 19 %）；核不到只写 F-12 |
| F-14 | 每侧大脑半球的运动区主要控制对侧身体（运动通路在延髓交叉） | P30（OpenStax A&P 2e 第 14 章运动通路一节） | **待核**；核不到删 02 第 2 拍后半句 |
| F-15 | 成人脑质量约 1.3–1.4 kg | P33 | **待核**；核不到不写质量，只用"约有两个拳头大"也不写（无来源）→ 改写"在这个模型里，脑约长 X cm"（MESH） |
| F-16 | 脑约占体重 2 %，静息时用掉身体约 20 % 的能量 | P28（Raichle & Gusnard 2002） | **待核**；核不到删 02 细看那一段 |
| F-17 | 大脑皮层展平后约 1 平方米 | P4 | high；只进细看，写"约" |

### 2.2 神经元与信号

| # | 事实 | 来源 | 可信度 / 待核 |
|---|---|---|---|
| F-20 | 神经元由细胞体、树突、轴突组成；轴突末端分支，与下一个细胞形成突触 | P4、P8 | high |
| F-21 | 髓鞘是绝缘层；有髓鞘的轴突上信号在髓鞘间隙（郎飞结）之间"跳"着传，叫跳跃式传导，比连续传导快 | P7、P8 | high |
| F-22 | 轴突越粗，传导越快 | P7、P8 | high |
| F-23 | 没有髓鞘的轴突约 0.5–10 m/s；有髓鞘的最快约 150 m/s | P10（Purves *Neuroscience*，NCBI Bookshelf） | **待核**：起草时只读到搜索摘要；施工代理读原文（NCBI 可能要人机验证，不绕过；读不到改用 P10b 另一本开放教材并在 note 写明） |
| F-24 | 突触有化学和电两种；化学突触里递质扩散过突触间隙、和对面细胞膜上的受体结合；约 1 毫秒延迟；电突触几乎瞬时 | P8 | high |
| F-25 | 控制大脚趾的运动神经元，轴突可长到约 1 米 | P4 | high；T4 的"走 1 米"即由此来 |
| F-26 | 神经信号是离子跨膜移动造成的电位变化沿膜传播 | P7 | high；正文只说"带电的微粒进出细胞膜" |

### 2.3 反射与反应

| # | 事实 | 来源 | 可信度 / 待核 |
|---|---|---|---|
| F-27 | 缩手反射：感觉输入（痛刺激）→ 脊髓里的突触（中枢处理）→ 前角运动神经元 → 肱二头肌收缩；感觉轴突的侧支同时抑制支配肱三头肌的运动神经元 | P9（OpenStax A&P 2e 第 14 章导言） | **待核**：起草时只读到搜索摘要；施工读原文 |
| F-28 | 缩手反射是多突触反射，感觉与运动神经元之间有中间神经元；膝跳（牵张）反射只有一个突触 | P9、P9b | **待核**；核不到只写"脊髓里有一个中间神经元把它们接上"并引 P9 |
| F-29 | 反射时脑也收到信号；肢体缩回开始于"觉得痛"之前 | P9 | **待核**；核不到改写"手缩回不必等脑先'想'"（不写先后） |
| F-30 | 感觉神经元的细胞体在背根神经节（脊髓外）；感觉轴突从背根（后根）进脊髓，运动轴突从腹根（前根）出 | P4、P6 | high |
| F-31 | 尺子接落：t = √(2d / g)，g ≈ 9.81 m/s² | P22（自由落体，P1 写算式） | high |
| F-32 | 204 名 6–12 岁学生（印度）尺子法平均 230.01 ms（SD 26.5），范围 162.9–321.6 ms | P21（摘要已读） | high；只进细看（Q7） |

### 2.4 保护

| # | 事实 | 来源 | 可信度 / 待核 |
|---|---|---|---|
| F-40 | 脑膜三层：硬脑膜（厚、坚韧）、蛛网膜（薄，松松地包着）、软脑膜（薄，紧贴脑表面、随沟回起伏） | P5 | high |
| F-41 | 脑脊液由四个脑室里的脉络丛从血液滤出，每天约 500 mL；它是脑和脊髓的"液垫"，也带走代谢废物 | P5 | high |
| F-42 | 脑脊液总量约 150 mL | P34（StatPearls *Physiology, Cerebral Spinal Fluid*） | **待核**；核不到不写总量 |
| F-43 | 新加坡：骑脚踏车、PAB 在马路上必须戴头盔 | P18（LTA，2026-10-26 更新） | high |
| F-44 | 头盔（自行车）系统综述：戴头盔与头部受伤几率降低约一半（OR 0.49）、重度头伤（OR 0.31）、致命头伤（OR 0.35）相关；与颈部受伤无明确关联 | P20（Olivier & Creighton 2017，摘要已读，非开放获取） | high；数字只进细看，主线写"大大降低" |
| F-45 | 头盔的泡沫内衬在撞击时被压扁、吸收能量；硬外壳把力分散开 | P32 | **待核**；核不到 07 第 4 拍只写"头盔让撞击不直接落在头上"并引 P20 的定性结论 |
| F-46 | 新加坡未满 16 岁不得在脚踏车道骑电动滑板车，不得在脚踏车道和马路上骑 PAB | P18 | high；只进细看，不鼓励电动设备 |

### 2.5 睡眠

| # | 事实 | 来源 | 可信度 / 待核 |
|---|---|---|---|
| F-50 | 新加坡（2021，Academy of Medicine Singapore 共识，KKH 发布）：7–13 岁规律睡眠至少 9 小时；14–17 岁至少 8 小时；做到与更好的注意力、学习、行为、情绪调节相关 | P15（PDF 已读） | high |
| F-51 | 美国 NHLBI：6–12 岁每天 9–12 小时；13–18 岁 8–10 小时 | P16（2022-03-24 修订） | high |
| F-52 | 睡眠帮助学习和形成长期记忆；睡不够会难以专心、想不清楚 | P17 | high |

### 2.6 网格（MESH，下载后量；施工时 `report.md` 复核）

| # | 量什么 | 用在 |
|---|---|---|
| F-60 | 脑（大脑 + 小脑 + 脑干）的长、宽、高（cm） | 02 第 1 拍、规格行备选 |
| F-61 | 脊髓长度、末端在第几腰椎水平（核 F-5） | 01 第 2 拍、07 第 3 拍 |
| F-62 | 脑网格与颅骨内表面的最小间距、有无穿插（G3） | 07；管线闸门 |
| F-63 | 指尖到颈段脊髓、颈段脊髓到肱二头肌沿神经中心线的长度 | T5 细看"在这个模型里，信号走了约 X cm" |

### 2.7 模型（设计研究来源 P1 的内容；`table` 的每一格）

**T4 信号快慢（`speed`）**：控件 `fibre`（choice）：`thick-myelin`（粗、有髓鞘）/ `thin-bare`（细、没有髓鞘）。

| fibre | 速度 m/s | 走 1 m 用时 ms | 画面慢放倍数 | 依据 |
|---|---|---|---|---|
| `thick-myelin` | 100 | 10 | ×200（画面 2 s 走完） | DESIGN：落在 F-23 的"最快约 150"之内；取整数便于心算 |
| `thin-bare` | 1 | 1,000 | ×2（画面 2 s 走完） | DESIGN：落在 F-23 的 0.5–10 之内 |

- 两行画面都是 2 秒走完同一条 1 米的神经（工位上的"一米神经"示意），所以**画面速度相同、慢放倍数不同**，卡片和字幕写明"画面里放慢了 200 倍 / 2 倍"。读数 `speed`、`time-ms` 带 SIM；`slow` 只给 PLATE。
- 预期：100 m/s → 10 ms；1 m/s → 1,000 ms；比值 100（单测钉住）。

**T5 跟着反射走（`reflex`）**：控件 `stop`（step 0–6）。

| stop | 名称 EN / ZH | 显示的流（`visible: { in: [...] }`） | 姿态 |
|---|---|---|---|
| 0 | Whole arc / 整条反射弧 | 全部 | 手缩回的整段动画循环 |
| 1 | Receptors in the skin / 皮肤里的感受器 | `reflex-touch`（指尖一小团闪点） | 手贴着杯 |
| 2 | Sensory neuron to the spinal cord / 感觉神经元进脊髓 | `reflex-sensory` | 同上 |
| 3 | Relay neuron in the spinal cord / 脊髓里的中间神经元 | `reflex-relay` + 横切工位 `section-relay` | 同上 |
| 4 | Motor neuron to the muscle / 运动神经元到肌肉 | `reflex-motor` | 同上 |
| 5 | Muscle pulls the hand away / 肌肉收缩，手缩回 | 无 | `withdraw`：前臂转 ≤ 20°，肱二头肌 `contract` 0.6 |
| 6 | The brain gets the message too / 脑也收到了消息 | `reflex-to-brain` | 停在缩回 |

- 第 k 步显示第 k 段和前一段（同 docs/40 T4 的规则），第 0 步全开。卡片的"先猜后看"：第 3 步之前问"命令是从脑来，还是从脊髓来"（不判对错）。
- 输出 `where`（state，七个 id）、`step-name`；来源 F-27–F-30（P9、P4、P6）。行内不出数，所以没有 SIM 数。

**T6 尺子接落（`ruler`）**：控件 `catch-cm`（step 3–30，步长 1；默认 26）。

| catch-cm | 反应时间 ms（四舍五入） |
|---|---|
| 3 / 4 / 5 / 6 / 7 / 8 / 9 / 10 | 78 / 90 / 101 / 111 / 119 / 128 / 135 / 143 |
| 11 / 12 / 13 / 14 / 15 / 16 / 17 / 18 | 150 / 156 / 163 / 169 / 175 / 181 / 186 / 192 |
| 19 / 20 / 21 / 22 / 23 / 24 / 25 / 26 | 197 / 202 / 207 / 212 / 217 / 221 / 226 / 230 |
| 27 / 28 / 29 / 30 | 235 / 239 / 243 / 247 |

- 算式 t = √(2d / 9.81)（F-31），每一格挂 P1（设计研究：只是自由落体换算，不是测量）+ P22；`tag: sim`。28 行由生成脚本写出，单测钉 5 cm → 101、20 cm → 202、26 cm → 230、30 cm → 247。默认 26 cm 只为让第一次打开时尺子停在 P21 平均值附近的位置，卡片**不**说"这是平均"。
- 卡片："读你接住的位置 / Read where you caught it"；记一行、条形图（现有 records + bars）。尺子与手指是程序化零件（`ruler`、`catch-hand`），尺子的 `offset` 绑 `catch-cm`（现有 offset 绑定）。
- 3 cm 以下的接住大多是提前猜到（尺子还没放手就动了），细看一句提醒"接得太快的那次不算"（价值陈述），不引来源。

**模拟运行点（SIM，内部自洽，写进 P1 的 text）**：T4：1 m ÷ 100 m/s = 0.010 s = 10 ms；1 m ÷ 1 m/s = 1 s = 1,000 ms；画面 2 s ⇒ 慢放 2 s ÷ 0.010 s = 200、2 s ÷ 1 s = 2。T6：d = 0.20 m ⇒ t = √(0.40 / 9.81) = 0.2019 s ≈ 202 ms。

---

## 3. 对象、网格与零件

### 3.1 分区（组 = LAYERS 的行；编号顺序）

| 分区 | 组 id | EN / ZH | 零件 | 组色 | 右上卡 |
|---|---|---|---|---|---|
| 01 | `cerebrum` | Cerebrum / 大脑 | frontal-lobe、parietal-lobe、temporal-lobe、occipital-lobe（各 `bilateral`）、cerebrum-medial、insula、corpus-callosum | `token:brain-frontal` | ✓（第 1 列） |
| 02 | `hindbrain` | Cerebellum and brainstem / 小脑与脑干 | cerebellum、midbrain、pons、medulla | `token:brain-stem` | ✓（第 2 列） |
| 03 | `spinal` | Spinal cord / 脊髓 | spinal-cord、cauda-equina、spinal-roots | `token:mat-tissue` 系 | ✓（第 3 列） |
| 04 | `nerves` | Nerves / 神经 | arm-nerves、leg-nerves、trunk-nerves（各 `bilateral`）、optic-pathway、hearing-nerve、cranial-nerves | `token:en-electrical` 浅一档 tint（零件色，不是流色） | ✓（第 4 列） |
| 05 | `protection` | Skull, backbone and coverings / 颅骨、脊柱与被膜 | skull、vertebral-column、dura-folds、spinal-dura、ventricles | `token:bone` | `card: false` |
| 06 | `reflex-arm` | Right arm / 右臂 | biceps-r、triceps-r、upper-arm-bone-r、forearm-hand-r | `token:muscle-1` | `card: false` |
| 07 | `neuron-study` | Neuron, enlarged / 神经元（放大） | neuron-body、dendrites、axon、myelin、axon-terminals、synapse-sending、vesicles、synapse-receiving | `token:ink-2`；`scale: { unit: "um", magnification: … }`（§3.2） | `card: false` |
| 08 | `cord-study` | Spinal cord section, enlarged / 脊髓横切（放大） | cord-grey、cord-white、root-ganglion、sensory-neuron-study、relay-neuron-study、motor-neuron-study | `token:ink-2`；`scale: { unit: "mm", … }` | `card: false` |
| 09 | `layers-study` | Coverings, enlarged / 保护层（放大） | scalp-layer、skull-layer、dura-layer、arachnoid-layer、csf-space、pia-cortex | `token:ink-2`；`scale: { unit: "mm", … }` | `card: false` |
| 10 | `helmet` | Helmet / 头盔 | helmet-shell、helmet-liner、helmet-strap | `token:ink-2` | `card: false` |
| — | context | — | skin-outline、skin-wire、skeleton-rest、hot-mug、ruler、catch-hand、eye-markers、ear-marker、one-metre-nerve（T4 工位） | — | — |
| — | `nerve-signals` | Nerve signals / 神经信号 | 只有流 | `token:en-electrical` | — |
| — | `chemical-signals` | Chemical signals / 化学信号 | 只有流 | `token:chemical-signal`（E-BN1） | — |

右上零件链 4 列 = 大脑 → 小脑与脑干 → 脊髓 → 神经；`connects` 讲两条路：命令 frontal-lobe → midbrain → pons → medulla → spinal-cord → arm-nerves；感觉 arm-nerves → spinal-roots → spinal-cord → medulla → parietal-lobe。`chainName` ≤ 8 字符（Frontal、Parietal、Temporal、Occip.、Cerebel.、Stem、Cord、Nerves）。

### 3.2 坐标与尺度

- 单位米，Y 向上、+Z 朝前、身体左 = +X（anatomy runbook §6），**脐在原点**，与 `digestive-system.glb`、`heart-and-lungs.glb` 相同（`static_region.py` 已固定），头部镜头 `target ≈ [0, 0.62, −0.03]` 一类数字施工时按网格量。
- 身体按真实大小（`scale 1`）。**放大工位**摆在身体右侧（画面左侧）一张程序化工作台（context `study-bench`，台面高与胸齐）上，每个工位各自的组级 `scale`：

| 工位 | 中心（起点，R2 调） | 包络 | 放大倍数（DESIGN） | 说明 |
|---|---|---|---|---|
| `neuron-study` | x −0.75, y 0.20 | 0.40 × 0.16 × 0.10 m | 细胞体按 ×4,000（细胞体 ~25 µm → 0.10 m）；**轴突画短了**（真实可长到 1 m，F-25），`note` 写明 | 一个运动神经元 + 末端的一个突触，突触另在同工位右端再放大 ×10（第二个 `scale` 用子组 `synapse-study`，施工时若引擎不支持同组两种 scale 就拆成第 11 组） |
| `cord-study` | x −0.75, y 0.20, z 0.25 | 0.20 × 0.20 × 0.10 m | ×12（成人颈段脊髓横径约 1 cm 级，**待核**，只写"放大约十倍"） | 一段横切的脊髓，带一对背根 / 腹根、背根神经节、三个示意神经元 |
| `layers-study` | x −0.75, y 0.20, z −0.25 | 0.20 × 0.14 × 0.10 m | 各层厚度**示意**，不按真实比例 | 头皮 → 颅骨（两层致密骨夹一层松质）→ 硬脑膜 → 蛛网膜（细丝）→ 脑脊液空间 → 软脑膜贴着皮层的沟回 |
| `helmet` | 戴在身体头上 | 按皮肤头部外扩 15–25 mm | 1 | 外壳 + 内衬（剖切时露出两层）+ 下巴带 |
| T4 `one-metre-nerve` | 台面前沿 | 1.0 m 长 → 画成 0.5 m（×0.5，`note` 写明） | 0.5 | 一条直的"神经"示意 + 起点终点标记 |

- 标题块 `note`：EN "Male reference anatomy · meshes Z-Anatomy / BodyParts3D / Brainder, CC BY-SA · nerves and brain simplified · bench models enlarged, not to scale" / ZH "男性参考解剖 · 网格 Z-Anatomy / BodyParts3D / Brainder，CC BY-SA · 脑与神经已简化 · 工作台上的模型已放大，不按比例"。
- `views.section.plane: "zy"`（PLATE 立面画侧面：脑、脊髓、脊柱一条线最清楚）。

### 3.3 Tier-1（一眼能认）与参考图

**Tier-1**：① 大脑表面的沟回、外侧沟（把颞叶分开）、中央沟（额叶与顶叶之间）清楚；② 小脑在枕叶下方、表面是细密平行的褶（叶片），不是大脑那种回；③ 脑干在小脑前面、往下接脊髓；④ 脊髓在椎管里一路下到腰椎上段、再往下是马尾；⑤ 两臂、两腿的大神经（坐骨神经最粗）从脊髓两侧出来；⑥ 神经元：一个细胞体、多根短树突、一根长轴突、一节节髓鞘、末端分叉；⑦ 脊髓横切：中间灰质像蝴蝶 / H，后角细、前角粗，背根上鼓起一个神经节；⑧ 头盔：硬壳 + 厚泡沫内衬 + 下巴带。

**参考图**（`scripts/geo/brain-and-nerves/refs/`，gitignore，不发布；施工第 1 步下载，逐张记来源与许可）：

| # | 来源 | 许可（下载时核） | 看什么 |
|---|---|---|---|
| R1 | Gray, *Anatomy of the Human Body*（1918）：脑外侧面、脑正中矢状面、脊髓横切、脊神经根与神经节、臂丛与上肢神经（Wikimedia Commons 扫描，图号施工时核） | 公有领域 | 沟回位置、脑干与小脑关系、灰质形状、根与节 |
| R2 | OpenStax A&P 2e 第 12–14 章图（神经元、髓鞘、突触、反射弧、脑叶、脑膜） | CC BY-NC-SA 4.0，**只看不复制** | 课本读法 |
| R3 | Brainder 网站的半球渲染与 Destrieux 分区图 | CC BY-SA 3.0 | 皮层网格导入后是不是这样 |
| R4 | Z-Anatomy GitHub `CheatSheet.png` / README 截图 | CC BY-SA 4.0 | 源模型在原软件里的样子 |
| R5 | 本仓库 `heart-and-lungs`、`digestive-system` 的 `hero-clean.png` | 本站 | 同一身体的画法、ghost 程度 |
| R6 | 本仓库 `cells` 的细胞工位截图 | 本站 | 放大工位的画法 |
| R7 | 自行车头盔剖面（CPSC 或博物馆公有领域图，**待找**） | 待核 | 外壳与内衬的厚度关系 |

### 3.4 网格 manifest 计划（`scripts/anatomy/brain-nerves/manifest.json`；下表源名来自 Z-Anatomy 图层名表 `Collections - Nerves.csv`，**下载后 G1 逐项对 inventory**）

| 节点 | 源对象（Z-Anatomy 名） | 源文件 | 预期来源家族 | 三角形预算 | 备注 |
|---|---|---|---|---|---|
| `frontal-lobe.l/.r` | `whole_brain.l/.r` 的顶点按最近的 Destrieux 分区归叶（§5.3）：Superior / Middle frontal gyrus、Opercular / Triangular / Orbital part of inferior frontal gyrus、Orbital gyri（含 Frontomarginal）、Straight gyrus、Transverse frontopolar gyrus and sulcus、Precentral gyrus、Superior / Inferior frontal sulcus、Precentral sulcus（上、下）、Orbital sulci（H 形、外侧）、Olfactory sulcus、Paracentral gyrus and sulcus | Nervous | Brainder | 11,000 / 侧 | 分界沟按顶点就近分（§5.3） |
| `parietal-lobe.l/.r` | Postcentral gyrus / sulcus、Superior parietal lobule、Supramarginal gyrus、Angular gyrus、Intraparietal sulcus、Precuneus、Subparietal sulcus、Sulcus interm_prim-Jensen、Cingulate sulcus (Marginal part) | Nervous | Brainder | 8,000 / 侧 | |
| `temporal-lobe.l/.r` | Superior temporal gyrus (Lateral part)、Temporal plane、Transverse temporal gyri、Middle / Inferior temporal gyrus、Superior / Inferior temporal sulcus、Temporal pole、Lateral occipitotemporal gyrus、Medial occipitotemporal gyrus (Parahippocampal)、Occipitotemporal sulcus、Collateral sulcus | Nervous | Brainder | 8,000 / 侧 | |
| `occipital-lobe.l/.r` | Cuneus、Lingual gyrus、Superior occipital gyri、Lateral occipital gyrus、Inferior occipital gyrus and sulcus、Occipital pole、Calcarine sulcus、Lunate sulcus、Transverse / Anterior occipital sulcus、Posterior transverse collateral sulcus | Nervous | Brainder | 5,000 / 侧 | |
| `insula.l/.r` | Insula (…)、Circular sulcus of insula | Nervous | Brainder | 1,000 / 侧 | 再进一步；默认 `hide` |
| `cerebrum-medial.l/.r` | Cingulate gyrus / sulcus 各段（不归入四叶，中性色）+ 内侧壁（若 `whole_brain` 有） | Nervous | Brainder | 2,000 / 侧 | 正中剖面那拍才看得见 |
| `corpus-callosum` | Corpus callosum | Nervous | **待 G2 认** | 1,500 | 若来自 UW "White matter" → 程序化弧形板代替 |
| `cerebellum` | Cerebellum 的全部小叶与蚓部（Lingula、Central lobule、Wing of central lobule、Culmen、Declive、Folium、Tuber、Pyramis、Uvula、Nodule of vermis、Anterior / Posterior quadrangular、Superior / Inferior semilunar、Gracile、Biventral lobule、Tonsil、Flocculus .l/.r 等）合并 | Nervous | 待 G2 认 | 12,000 | 叶片细褶是 Tier-1，简化容差收紧到 0.3 mm |
| `midbrain`、`pons`、`medulla` | Midbrain.l/.r、Pons.l/.r、Medulla oblongata.l/.r（左右半合并） | Nervous | 待 G2 认 | 2,000 / 2,000 / 2,000 | |
| `ventricles` | Lateral ventricle.l/.r、Third ventricle、Aqueduct of midbrain、Fourth ventricle | Nervous | 待 G2 认 | 3,000 | 07 第 2 拍：脑脊液在哪里产生 |
| `spinal-cord` | Spinal cord（若有 White matter of spinal cord / 灰质分件，只取外形） | Nervous | 待 G2 认 | 6,000 | 中心线 `_U`（0 = 延髓端），流路线用 |
| `cauda-equina` | Cauda equina | Nervous | 待 G2 认 | 2,500 | |
| `spinal-roots` | Anterior / Posterior root of spinal nerve .l/.r、Spinal ganglion .l/.r | Nervous | 待 G2 认 | 3,000 | **是否覆盖每一节待核**；只有一节 → 只取颈段那一对 |
| `arm-nerves.l/.r` | Roots / trunks / divisions / cords of brachial plexus、Musculocutaneous、Median、Ulnar、Radial、Axillary nerve（不含指神经与皮支） | Nervous | 待 G2 认 | 5,000 / 侧 | `.r` 另拆 `arm-nerves-forearm.r`（肘以下，跟前臂转） |
| `leg-nerves.l/.r` | Sciatic、Tibial、Common fibular、Deep / Superficial fibular、Femoral、Obturator、Saphenous nerve | Nervous | 待 G2 认 | 5,000 / 侧 | 坐骨神经最粗（Tier-1） |
| `trunk-nerves.l/.r` | Intercostal nerves | Nervous | 待 G2 认 | 2,500 / 侧 | |
| `optic-pathway` | Optic nerve (II) .l/.r、Optic chiasm、Optic tract .l/.r | Nervous | Dundee CN（BY 4.0）或 BP3D | 2,000 | 06 第 1 拍 |
| `hearing-nerve` | Vestibulocochlear nerve (VIII) .l/.r（**只取神经干，不取 Cochlea / Vestibule**） | Nervous | Dundee CN | 800 | 内耳是 NC-SA，不取 |
| `cranial-nerves` | 其余 I、III–VII、IX–XII .l/.r 的主干 | Nervous | Dundee CN | 6,000 | 再进一步；默认 `hide` |
| `skull` | Frontal、Parietal .l/.r、Temporal .l/.r、Occipital、Sphenoid、Ethmoid bone + Mandible、Maxilla .l/.r、Zygomatic、Nasal 等面骨 | Skeletal（已缓存） | BP3D / Z-Anatomy | 30,000 | 07 剖开；X-RAY shell |
| `vertebral-column` | Atlas (C1)、Axis (C2)、Vertebra C3–L5、Sacrum、Coccyx | Skeletal（已缓存） | 同上 | 26,000 | X-RAY shell；07 第 3 拍剖开 |
| `dura-folds` | Falx cerebri、Tentorium cerebelli .l/.r | Nervous | 待 G2 认 | 2,000 | 07 第 2 拍 |
| `spinal-dura` | Spinal dura | Nervous | 待 G2 认 | 2,500 | X-RAY shell |
| `biceps-r`、`triceps-r` | Long / Short head of biceps brachii.r；triceps 三个头 .r | Muscular（已缓存） | BP3D / Z-Anatomy | 4,000 / 3,000 | `biceps-r` 烘焙 `_U` / `_FIBRE`，起止方向照 arms manifest |
| `upper-arm-bone-r`、`forearm-hand-r` | Humerus.r；Radius.r + Ulna.r + 腕骨 / 掌骨 / 指骨 .r | Skeletal（已缓存） | 同上 | 2,000 / 5,000 | 后者绕肘地标转（Q4） |
| `skeleton-rest` | 其余骨骼（去掉上面已取的） | Skeletal | 同上 | 22,000 | context |
| `skin-outline` / `skin-wire` | 同 `digestive` | Regions | 同上 | 18,000 / 5,000 | context |
| `eye-markers` | Sclera .l/.r（若 G2 认为 BP3D / BY）否则程序化低模球 | Nervous / 程序化 | — | 600 | 06 只作起点标记，详细在 `eyes-and-ears` |

- **不取**：所有白质纤维束与传导束（`… fasciculus`、`Cingulum`、`Fornix`、`Stria …`、`… tract`、`Anterior / Posterior commissure` 等，UW 来源许可不明）；内耳全部（Cochlea、Vestibule、Tympanic membrane、Auditory tube 等，Dundee NC-SA 或与本题无关）；眼内结构（Cornea、Iris、Lens、Retina、Vitreous body…，归 `eyes-and-ears`，且来源待核）；泪器；脑神经核（`Nucleus of …`）、深部核团（丘脑、海马、杏仁核、基底核——02 细看一句"深处还有很多结构"）；交感干（细看一句）；手指、脚趾的细小神经分支（一条就上千三角形）；kidney 无关。
- **预算**：大脑 70 k、小脑 + 脑干 + 脑室 21 k、脊髓与根 12 k、周围神经 34 k、脑神经 9 k、颅骨 + 脊柱 + 被膜 63 k、右臂 14 k、其余骨骼 22 k、皮肤 23 k → **约 268 k 三角形**；按 `heart-and-lungs.glb`（213,380 三角形 = 1,952,300 B，≈ 9.15 B / 三角形）估 **≈ 2.5 MB**。soft 4 MB / 350 k（runbook §5，管线 gate），hard 8 MB / 500 k。
- **减面可行性（待 G1 实测）**：FreeSurfer 皮层（Brainder）每半球通常十几万顶点、二三十万三角形，减到每半球约 33 k 是 ~10–15 %；在 hero 距离（脑约占画面一半高）沟回仍清楚——施工时用 0.5 mm 采样容差试，若沟回糊成"面团"就把大脑预算提到 100 k、相应压骨骼（颅骨面骨只在 07 用，可再减 30 %）。小脑叶片最容易被减没，单独收紧容差。

### 3.5 零件（约 34 个网格零件 + 约 30 个程序化零件 + context）

| # | id | 组 | 源 | 材质 | summary 要点（它做什么） |
|---|---|---|---|---|---|
| 01 | `frontal-lobe` | cerebrum | mesh，`bilateral` | `tissue` + `token:brain-frontal`（02 以外章用中性组织色，§4.4） | 计划、做决定，发出动作命令（F-6） |
| 02 | `parietal-lobe` | cerebrum | mesh，`bilateral` | `tissue` + `token:brain-parietal` | 接收触、痛、冷热和身体位置的感觉（F-6） |
| 03 | `temporal-lobe` | cerebrum | mesh，`bilateral` | `tissue` + `token:brain-temporal` | 参与听，也参与记忆（F-7） |
| 04 | `occipital-lobe` | cerebrum | mesh，`bilateral` | `tissue` + `token:brain-occipital` | 处理眼睛送来的信号（F-7） |
| 05 | `insula` | cerebrum | mesh | `tissue` | 藏在外侧沟深处的一块皮层（再进一步） |
| 06 | `cerebrum-medial` | cerebrum | mesh | `tissue` 中性 | 大脑两半球相对的内侧面 |
| 07 | `corpus-callosum` | cerebrum | mesh 或程序化 | `tissue` 浅一档 | 连接左右半球的一大束神经纤维（F-9） |
| 08 | `cerebellum` | hindbrain | mesh | `tissue` + `token:brain-cerebellum` | 让动作协调、平稳（F-10） |
| 09 | `midbrain` | hindbrain | mesh | `tissue` + `token:brain-stem` | 脑干最上段，连接大脑与下面（F-11） |
| 10 | `pons` | hindbrain | mesh | 同上 | 连接小脑与脑干；参与调节呼吸（F-11） |
| 11 | `medulla` | hindbrain | mesh | 同上 | 往下接脊髓；参与调节心跳和呼吸（F-11） |
| 12 | `spinal-cord` | spinal | mesh | `tissue` | 脑和身体之间的主干道；也能自己完成反射（F-1、F-27） |
| 13 | `cauda-equina` | spinal | mesh | `tissue` | 脊髓下端以下的一束神经根（F-5） |
| 14 | `spinal-roots` | spinal | mesh | `tissue` | 感觉从后根进、命令从前根出（F-30） |
| 15 | `arm-nerves` | nerves | mesh，`bilateral` | `nerve` 材质族 | 手臂的感觉与动作都走这里 |
| 16 | `leg-nerves` | nerves | mesh，`bilateral` | `nerve` | 腿的神经；坐骨神经最粗 |
| 17 | `trunk-nerves` | nerves | mesh，`bilateral` | `nerve` | 沿肋骨走的神经 |
| 18 | `optic-pathway` | nerves | mesh | `nerve` | 把眼睛的信号送进脑（链 `eyes-and-ears`） |
| 19 | `hearing-nerve` | nerves | mesh | `nerve` | 把内耳的信号送进脑干 |
| 20 | `cranial-nerves` | nerves | mesh | `nerve` | 直接从脑出来的 12 对神经（再进一步，F-3） |
| 21 | `skull` | protection | mesh | `tissue` + `token:bone` | 把脑包在一个硬壳里 |
| 22 | `vertebral-column` | protection | mesh | 同上 | 一节节椎骨围成管道，保护脊髓 |
| 23 | `dura-folds` | protection | mesh | `membrane` | 硬脑膜伸进两半球之间与大脑、小脑之间的两片 |
| 24 | `spinal-dura` | protection | mesh | `membrane` | 包住脊髓的硬膜管 |
| 25 | `ventricles` | protection | mesh | `glass` 淡 + `token:water` tint | 脑里四个充满脑脊液的空腔（F-41） |
| 26 | `biceps-r` | reflex-arm | mesh（`_U` / `_FIBRE`） | `muscle` + `token:muscle-1` | 收缩时把前臂拉向上臂 |
| 27 | `triceps-r` | reflex-arm | mesh | `muscle` + `token:muscle-2` | 反射时被"叫停"、放松（F-27 待核） |
| 28 | `upper-arm-bone-r` | reflex-arm | mesh | `tissue` + `token:bone` | 上臂骨 |
| 29 | `forearm-hand-r` | reflex-arm | mesh | 同上 | 前臂与手；反射时绕肘转 |
| 30 | `neuron-body` | neuron-study | 程序化：变形 `sphere`（r 0.05）+ 内部 `sphere` 细胞核 | `membrane` + `tissue` | 神经元的细胞体，有细胞核 |
| 31 | `dendrites` | neuron-study | 程序化：5–7 根 `sweep` 分叉（每根 2–3 级） | `membrane` | 接收别的细胞传来的信号 |
| 32 | `axon` | neuron-study | 程序化：`sweep` 细管 0.30 m（**画短了**） | `membrane` | 把信号送到远处 |
| 33 | `myelin` | neuron-study | 程序化：`capsule` × 8 `repeat`，间隙 = 郎飞结 | `tissue` + 浅 `token:bone` tint | 包在轴突外的绝缘层，让信号更快（F-21） |
| 34 | `axon-terminals` | neuron-study | 程序化：末端 5 个分叉 + 小球 | `membrane` | 末端分支，与下一个细胞形成突触 |
| 35 | `synapse-sending` | neuron-study（子组 ×10） | 程序化：`lathe` 杯形末梢，剖开一半 | `membrane` | 发出信号的一侧 |
| 36 | `vesicles` | neuron-study（同上） | 程序化：`sphere` × 24 实例 | `membrane` + `token:chemical-signal` 浅一档 | 装着化学物质的小泡（不点名递质） |
| 37 | `synapse-receiving` | neuron-study（同上） | 程序化：`curvedPanel` + `repeat` 小凸起（受体） | `membrane` | 接收化学物质、产生新信号的一侧（F-24） |
| 38 | `cord-grey` | cord-study | 程序化：`extrude` H / 蝴蝶形（后角窄、前角宽），厚 0.03 | `tissue` 深一档 | 灰质：神经元细胞体所在 |
| 39 | `cord-white` | cord-study | 程序化：`extrude` 椭圆外形减灰质 | `tissue` 浅 | 白质：上下传信号的纤维 |
| 40 | `root-ganglion` | cord-study | 程序化：背根 `sweep` + 节 `sphere`；腹根 `sweep` | `nerve` | 后根上的神经节（感觉神经元细胞体）；前根 |
| 41 | `sensory-neuron-study` | cord-study | 程序化：`sweep` + 节内细胞体 | `membrane` | 把感受器的信号送进脊髓 |
| 42 | `relay-neuron-study` | cord-study | 程序化：灰质内一条短 `sweep` | `membrane` | 在脊髓里接上感觉与运动神经元 |
| 43 | `motor-neuron-study` | cord-study | 程序化：前角细胞体 + 出前根的 `sweep` | `membrane` | 把命令送到肌肉 |
| 44–49 | `scalp-layer`、`skull-layer`、`dura-layer`、`arachnoid-layer`、`csf-space`、`pia-cortex` | layers-study | 程序化：同心 `curvedPanel` 楔形；颅骨层 = 两层致密 + 中间 `repeat` 小孔；蛛网膜 = 薄板 + `repeat` 细丝；皮层面起伏 | 各自 `tissue` / `bone` / `membrane` / `glass` + `token:water` | 从外到里六层，厚度示意（F-40、F-41） |
| 50–52 | `helmet-shell`、`helmet-liner`、`helmet-strap` | helmet | 程序化：`lathe` 外壳（开通风孔用 `repeat` 槽）、内衬厚 20 mm、带子 `sweep` | `plastic`、`foam`（若无此材质族用 `tissue` + 浅灰 tint）、`fabric` | 外壳分散撞击；内衬吸收撞击（F-45 待核） |
| — | `hot-mug` | context | 程序化：`lathe` 杯 + 把手 | `plastic` + `token:hot` tint 很浅 | 很烫的杯子（不画蒸汽冒烟特效） |
| — | `ruler`、`catch-hand` | context | 程序化：`bevelBox` 30 cm 尺（刻度用 `repeat` 细槽，无数字）；简化手指两指 | `wood`、`tissue` | T6 |
| — | `one-metre-nerve` | context | 程序化：直 `tube` 0.5 m + 两端标记 | `nerve` | T4："一米长的神经"，画成半米 |
| — | `study-bench` | context | 程序化：`bevelBox` 台面 + 腿 | `wood` | 放大工位的台子 |
| — | `ear-marker` | context | 程序化：小 `torus` + 一段管 | `tissue` | 06 内耳的位置标记（不画耳蜗） |
| — | `skin-outline`、`skin-wire`、`skeleton-rest`、`eye-markers` | context | mesh / 程序化 | 同 `heart-and-lungs` | 身体轮廓 |

### 3.6 summary / detail 写法补充

- `detail` 第三段（"坏了会怎样"）在本主题改为**"模型和真实的差别"**，不写损伤与疾病（D8）。例：`axon` 的第三段写"真实的轴突可以长到约 1 米（F-25），这里画短了，方便放进工作台"。
- 脑叶的 detail 第二段必须有一句"这一叶不只做这一件事；复杂的事要多个区一起做"（D4 ⑨）。

---

## 4. 流、动画、显微工位、模式

### 4.1 流（14 条；身体上的路径由管线从神经中心线生成，§5.3，标 `schematic` 的段在 `routes.json` 写明）

| id | group | 路径（零件顺序） | speed | count | size × | ends | 特别 | parts |
|---|---|---|---|---|---|---|---|---|
| `overview-down` | nerve-signals | 额叶中央前回 → 脑干 → 脊髓 → 两臂、两腿神经末端；5 条 | 0.15 | 200 | 1.0 | fade | 01 用：命令下行 | frontal-lobe, medulla, spinal-cord, arm-nerves, leg-nerves |
| `overview-up` | nerve-signals | 手、脚神经末端 → 脊髓 → 脑干 → 顶叶中央后回；4 条 | 0.15 | 160 | 1.0 | fade | 01 用：感觉上行 | arm-nerves, leg-nerves, spinal-cord, parietal-lobe |
| `reflex-touch` | nerve-signals | 右手指尖皮肤下一小段（示意） | 0.04 | 20 | 1.4 | fade | T5 第 1 步 | forearm-hand-r |
| `reflex-sensory` | nerve-signals | 指尖 → 正中神经 → 臂丛 → 颈段后根 → 神经节 → 后角 | 0.12 | 120 | 1.2 | open | | arm-nerves, spinal-roots, spinal-cord |
| `reflex-relay` | nerve-signals | 后角 → 前角（脊髓内示意，几毫米） | 0.03 | 20 | 1.2 | open | 身体尺度几乎看不见 → 横切工位同时播 `section-relay` | spinal-cord |
| `reflex-motor` | nerve-signals | 前角 → 颈段前根 → 臂丛 → 肌皮神经 → 肱二头肌 | 0.12 | 120 | 1.2 | open | | spinal-roots, arm-nerves, biceps-r |
| `reflex-to-brain` | nerve-signals | 颈段脊髓 → 延髓 → 脑桥 → 中脑 → 顶叶中央后回（示意） | 0.12 | 80 | 1.0 | fade | T5 第 6 步 | spinal-cord, medulla, parietal-lobe |
| `section-sensory`、`section-relay`、`section-motor` | nerve-signals | 横切工位里三个示意神经元 | 0.03 | 30 / 15 / 30 | 1.0 | open | 与身体上的三段同步可见（`visible` 同一 `stop`） | cord-study 各件 |
| `axon-signal` | nerve-signals | 神经元工位：细胞体 → 轴突 → 末梢 | 0.08 | 1 簇 × 6（"一团信号"） | 1.6 | fade | T4 控件绑 `intensity` 不变（画面同速），E-BN2 可选"跳跃" | axon, myelin, axon-terminals |
| `chemical-cross` | chemical-signals | 突触放大：小泡 → 间隙 → 对面受体；6 条短路径 | 0.01 | 60 | 0.6 | fade | 04 第 5 拍 | vesicles, synapse-receiving |
| `sight-signal` | nerve-signals | 两眼标记 → 视神经 → 视交叉 → 视束 → 枕叶（视束后一段示意） | 0.12 | 100 | 1.0 | fade | 06 | eye-markers, optic-pathway, occipital-lobe |
| `hearing-signal` | nerve-signals | 内耳标记 → 前庭蜗神经 → 脑干 → 颞叶（脑内示意） | 0.12 | 60 | 1.0 | fade | 06 | ear-marker, hearing-nerve, pons, temporal-lobe |
| `reaction-route` | nerve-signals | 眼 → 枕叶 → 额叶 → 脑干 → 脊髓 → 臂神经 → 手指（脑内段示意） | 0.15 | 140 | 1.0 | fade | 06 T6 | 见路径 |
| `one-metre` | nerve-signals | T4 工位直神经，起点 → 终点 | 0.25 | 1 簇 × 6 | 1.6 | fade | 两种 fibre 画面同速（§2.7） | one-metre-nerve |

- **感觉 / 运动不分色**（D10）。图例只说一次（01 第 3 拍）："亮点是神经信号，在这个画面里放慢了很多"。
- 脑内段（丘脑中继、视放射、听放射）都是示意，**不经过任何没进 glb 的结构**；粒子在半透明脑内走，不穿出脑外表面（六向射线检查同 `digestive` 的 `food_route.py`）。
- 运转时同屏流 ≤ 6 条（单章 `layers` 只开需要的），合计 +6 次绘制以内。

### 4.2 动画与姿态

| id | target | kind | 参数 | 说明 |
|---|---|---|---|---|
| `withdraw` | forearm-hand-r（+ `arm-nerves-forearm.r`） | `sequence` | pivot = 肘地标（管线写 `landmarks.json`）；t 0 → 0.35 s 屈肘 20°、t 2.5 回 0；loop | T5 第 0、5 步；**真实反射很快**，画面放慢，字幕写明 |
| `biceps-pull` | biceps-r | `contract` | amount 0.6、bulge 0.06，与 `withdraw` 同相 | |
| `ruler-fall` | ruler | `sequence` | t 0 → 0.6 s 下落到 `catch-cm` 绑定的位置（offset 绑定在其上叠加） | T6；画面放慢约 3 倍，字幕写明 |
| `vesicle-release` | vesicles | `pulse` | scale 1.05，hz 0.5 | 04 第 5 拍 |

| pose | 内容 | 用在 |
|---|---|---|
| `hand-on-mug` | forearm-hand-r 0°，手指贴杯 | T5 第 1–4 步 |
| `withdrawn` | 屈肘 20°、biceps contract 0.6 | T5 第 5–6 步 |
| `hemisphere-off` | 左半球四叶 + insula + cerebrum-medial.l `hide` | 02 第 3 拍、03 |

`prefers-reduced-motion`：动画停在静止姿态，T5 姿态直接到终值，流照常（引擎现有规则）。

### 4.3 显微尺度怎么做（程序化 + 尺度切换）

- **做法照 `cells`**：每个放大工位是一组程序化零件 + 组级 `scale: { unit, magnification }`；PLATE 与引线标注自动显示"×N"；工位与身体分开摆在工作台上，镜头预设 `bench` 一次看三个工位，拍里用 `part` 聚焦单个工位。**不做**连续缩放动画（"从手钻进神经"）——引擎没有，且会让人以为两个比例连在一起；用"身体上的这一段 ↔ 工作台上的放大"成对出现来表达：
  - 05 第 3 拍：身体上 `reflex-relay` 几乎看不见 → 同拍 `section-relay` 在横切工位播，字幕"右边放大的是脊髓的一个横切"。
  - 04 第 2 拍：身体上 `arm-nerves` 选中 → 工作台神经元工位，字幕"神经里有成千上万条这样的轴突"（不给数，没有来源）。
- **神经元工位的形状纪律**：一个多极运动神经元（细胞体位于脊髓前角的那种），树突短而多分叉，轴突一根、从细胞体的一个小隆起出来，髓鞘一节节、节间有裸露的郎飞结，末端分叉。不画施万细胞的细胞核、不画轴突里的细胞器；**髓鞘节数是示意（8 节），不是真实数目**，detail 写明。
- **突触工位**：杯形末梢剖开一半露出小泡；间隙宽度示意；对面膜上一排受体凸起。化学信号粒子用 `--chemical-signal`。不画离子、不画电位曲线。
- **E-BN2 跳跃流（可选）**：`axon-signal` 在有髓鞘那段按节点"停一下、跳一下"（§6.4）；退路 = 普通流 + 字幕"在髓鞘之间一跳一跳地传"。

### 4.4 剖切、X-RAY、拆开、颜色

- `views.cuts`：`midline`（`normal [-1,0,0]`，offset 0.002，正中矢状面：胼胝体、脑干、小脑、脑室、脊髓与椎管同框；label "Midline / 正中剖面"）；`skull-window`（颅骨左上方开窗，07 用：露出硬脑膜 → 脑）。`views.cutaway`（C 键）= `midline`。
- X-RAY：`shell` = skin-outline、skull、vertebral-column、spinal-dura、skeleton-rest、helmet-shell。大多数章在 X-RAY 下看脑与脊髓。
- EXPLODED（`explodeLabel` "Spread out / 摊开"）：四叶各沿法向外移 0.02、小脑后下 0.03、脑干下移 0.02；骨骼不动；流禁用（引擎）。只在 02 第 4 拍用一次。
- **分区颜色只在 02、03 开**：其余章用 `layers` 关组色——实现上用两套 `parts` 材质不现实，**改为**章 state 的 `tint: neutral` 覆盖（若引擎没有"章级去组色"，则零件默认中性组织色，02、03 用拍的 `highlight` 让四叶显出组色；施工代理查 docs/06 现有 `highlight` / `ghost` 能力后选，**不新增引擎**，查不到就全主题都显组色并在 Q3 回报）。

---

## 5. 网格管线与许可分层

### 5.1 需要下载的东西（Q1；全部未下载）

| 文件 | URL | 大小 | 许可 | 用途 |
|---|---|---|---|---|
| `NervousSystem100.fbx` | `https://raw.githubusercontent.com/LluisV/Z-Anatomy/PC-Version/Resources/Models/FBX/NervousSystem100.fbx` | 53,887,724 B（≈ 53.9 MB） | 文件整体按 Z-Anatomy `License.txt`：BP3D 派生部分 CC BY-SA 2.1 JP（历史）/ Z-Anatomy CC BY-SA 4.0；**内含第三方**：Brainder（CC BY-SA 3.0）、Dundee 颅神经（CC BY 4.0）、Dundee 内耳（CC BY-NC-SA 4.0）、UW 白质（许可不明） | 脑、脊髓、神经、被膜、脑室 |
| （已缓存）`SkeletalSystem100.fbx`、`MuscularSystem100.fbx`、`Regions of human body100.fbx` | 同仓库 | 41,339,660 / 37,343,180 / 4,433,260 B | 同上（SHA 在 `SHA256SUMS.txt`） | 颅骨、脊柱、右臂肌、皮肤 |
| （可选，Q2 退路）Brainder 原始 Destrieux 皮层 OBJ | `https://brainder.org/brain-for-blender`（页面链接） | 待看 | CC BY-SA 3.0 | 只在 G2 认不出 Nervous 文件里皮层来源时，用来**比对**确认（不另外并入） |
| （可选，Q2 退路）BodyParts3D 4.0 脑部 OBJ | DBCLS BodyParts3D 档案（`https://dbarchive.biosciencedbc.jp/en/bodyparts3d/`） | 待看 | CC BY 4.0 | 皮层来源无法确认时的替代 |
| 参考图 R1–R7 | §3.3 | 小 | 各自 | 只看，不发布 |

起草时**只读了**仓库的两个图层 CSV（文本，共约 28 KB，存在会话 scratchpad，未进仓库）和 PE 课纲、KKH 指引 PDF（读文字）；没有下载任何网格。

### 5.2 闸门（下载后、建零件表前）

| 闸门 | 做什么 | 过不了怎么办 |
|---|---|---|
| G1 inventory | `inventory.py` 加 `nervous` 系统，对 Nervous 文件出 inventory（名字、三角形、闭合、包围盒、左右）；与 §3.4 逐项对 | 缺件：写进 §14 已知差距，零件表删或改程序化；**不凭名表假设有** |
| G2 来源核 | 新脚本 `provenance.py`（P-BN2）：读 FBX 的集合层级、对象自定义属性、命名习惯（Destrieux 标签 → Brainder；`(… nerve) (I–XII)` → 核 Dundee；`whole_brain` → Brainder），结合坐标与网格特征（FreeSurfer 网格的顶点密度均匀、无 UV），给每个节点一个来源家族；**输出表人审**，写进 `brain-nerves/provenance.md` | 认不出 = `unknown` → 不进 glb；若 `unknown` 落在必需结构上（皮层、小脑、脑干、脊髓）→ 停，回报 Gavin（Q2） |
| G3 配准 | 脑与颅骨、脊髓与椎管是不是同一身体：量脑外表面到颅骨内表面的距离分布（应为正、几毫米级，不穿插）、脊髓中心线到椎孔中心的距离 | Brainder 皮层若来自另一个人、和颅骨对不上：在管线里做**一次整体刚体 + 均匀缩放配准**（只许平移、旋转、等比缩放，量值写进 report），仍穿插 > 3 mm 则回报 |
| G4 质量 | 预览六张（front / left / top / midline / brain-close / exploded-lobes），看沟回、小脑叶片、左右、穿插、漏面 | 照 runbook §8 人审 |

### 5.3 管线（P-BN#；照 runbook §4 的静态路径，native Blender 5.1，本机或 `codex exec --sandbox danger-full-access`）

| 编号 | 做什么 | 文件 |
|---|---|---|
| P-BN1 | 新 region `brain-nerves`：`common.py` 加 `'nervous': 'NervousSystem100.fbx'`；`run.py` 的 choices 加 `brain-nerves`；`static_region.py` 脐中心 | `scripts/anatomy/{common,run,static_region}.py` |
| P-BN2 | 来源核 `provenance.py`（G2）；manifest 生成器拒绝 `unknown` / `nc` / `unclear` 节点 | `scripts/anatomy/brain-nerves/provenance.py` |
| P-BN3 | **分叶**：以 `whole_brain.l/.r` 为几何；每个顶点按最近的 Destrieux 分区网格（点到三角形距离）取标签，标签 → 叶查 §3.4 表；**分界沟**（Central sulcus：额 / 顶；Lat_Fis-*：额 / 颞、顶 / 颞；Parieto-occipital sulcus：顶 / 枕）上的顶点按 2 环邻域中最多的非沟回标签定；按叶切成节点，切缝沿三角形边（不补洞，相邻节点共享边界顶点、法线一致，不出亮缝）。若 `whole_brain` 不存在，直接合并各分区网格（边界先 weld） | `brain-nerves/lobes.py` |
| P-BN4 | 减面：皮层 0.5 mm、小脑 0.3 mm、神经 0.5 mm、骨 1 mm、皮肤 3 mm 采样容差（runbook §4）；三角形预算按 §3.4 | build |
| P-BN5 | 中心线与路线：脊髓、臂神经、腿神经、视路、前庭蜗神经抽中心线（`centrelines.py`）；`routes.py` 生成 §4.1 的路径，脑内与脊髓内段标 `schematic`；肘、颈段（C5–C8 区间中点）地标写 `landmarks.json` | `brain-nerves/routes.py` |
| P-BN6 | 右臂：`forearm-hand-r` 与 `arm-nerves-forearm.r` 以肘地标为界拆节点；`biceps-r` 烘焙 `_U` / `_FIBRE`（借 arms manifest 的起止选择） | build |
| P-BN7 | optimize（meshopt + 量化，保留 `asset.copyright`）→ audit（预算、命名、拓扑、`_U`、路线在器官内、不穿出、左右）→ preview → `report.md` + `preview-review.md` | 同 heart-lungs |

### 5.4 许可分层（产物 → 许可族；BY-SA 与 BY-NC-SA 不合并进同一个派生文件）

| 产物 | 内容 | 许可族 | 署名 / 边界 |
|---|---|---|---|
| `public/models/brain-and-nerves.glb` | Z-Anatomy / BP3D 选源（BY-SA 4.0）+ Brainder 皮层（BY-SA 3.0，按其"更新版本"条款以 BY-SA 4.0 发布改编）+ Dundee 颅神经（BY 4.0，可并入 BY-SA） | **CC BY-SA 4.0** | `asset.copyright`：Z-Anatomy 两行原文 + "Cerebral cortex surfaces: Anderson Winkler, brainder.org, CC BY-SA 3.0" + "Cranial Nerves and Foramina – University of Dundee, CAHID – CC BY 4.0"（**仅当 G2 确认用了**）+ 改动说明 "structures selected for the nervous system with skull, spine and right-arm context; cortex divided into lobes; simplified; centrelines and route landmarks baked" |
| 排除项 | Dundee 内耳（BY-NC-SA）、UW 白质（不明）、Kidney（BY-NC）、`unknown` | — | **不进任何 BY-SA 文件**；manifest 生成器有显式拒绝表与单测 |
| `data/parts.json` | 网格零件元数据、路线坐标（网格派生）、程序化工位、sim 配置、短 summary / detail | **CC BY-SA 4.0**（同 bones-and-joints §3.5 的做法） | detail 只用作者独立措辞，**不复制 OpenStax 文字或图** |
| `routes.json`、`landmarks.json`、`provenance.md`、manifest | 网格派生 | CC BY-SA 4.0 | 在 `scripts/anatomy/brain-nerves/` |
| `chapters/*.mdx`、`glossary.json` | 独立正文 | CC BY-NC-SA 4.0（站点默认） | 引模型 id，不贴网格坐标 |
| `sources.json`、`data/SOURCES.md` | 出处元数据 | CC BY-NC-SA 4.0 | 模型表与完整署名（runbook §2 四处之一） |
| 插图（封面 + 4 张） | 独立原创（Codex 生成 / 代码绘制），**不从 glb 渲染图生成** | CC BY-NC-SA 4.0 | manifest 记 prompt、tries、检查 |
| 本主题截图 / hero（含 glb 渲染） | glb 渲染 | CC BY-SA 4.0 | `LICENSE-CONTENT` 例外表加一行 |

**四处署名**（runbook §2）：glb `asset.copyright`；`THIRD-PARTY-NOTICES.md` 3D anatomy models 节加本 glb 与 Brainder、Dundee 两行；主题 `data/SOURCES.md`；`topic.yaml.note` + 00 章来源细看。

---

## 6. 试一试与引擎扩展

### 6.1 原则

三张卡全部 `sim.kind: "table"`（docs/06「table」，docs/40 E-HL1），控件、先猜后看、记录、条形图、`visible` / `offset` / `pose` / `intensity` 绑定都是现成的。**新增引擎只有颜色 token（必须）和一种流的跳跃模式（可选）**。

### 6.2 三张卡

| 卡 | 章 | 控件 | 输出（PLATE / 卡片） | 绑定 | 先猜后看 | 记录 |
|---|---|---|---|---|---|---|
| T4 信号快慢 | 04 | `fibre` choice | `speed`（m/s，SIM）、`time-ms`（ms，SIM）、`slow`（倍，只 PLATE） | `one-metre` 流 `visible`；`myelin` 零件 `visible` 跟 `fibre`（无髓鞘时隐藏）；`one-metre-nerve` 粗细用两个零件切换 | "粗的、有髓鞘的那条快多少倍" | 两行 + 条形图（time-ms） |
| T5 跟着反射走 | 05 | `stop` step 0–6 | `where`（state）、`step-name` | 流 `visible: { in }`；`pose` 绑 `stop`（≤ 4 → `hand-on-mug`，≥ 5 → `withdrawn`） | 第 3 步前："命令从脑来还是从脊髓来" | 不记 |
| T6 尺子接落 | 06 | `catch-cm` step 3–30 | `reaction-ms`（ms，SIM） | `ruler` offset 绑 `catch-cm`；`reaction-route` 流常开 | "你觉得自己接住要多久" | 记多行 + 条形图（读者多试几次） |

### 6.3 table 数据与单测预期（`tests/space-scene/fixtures/brain-nerves-table.ts`）

- T4：`thick-myelin` → speed 100、time-ms 10、slow 200；`thin-bare` → 1、1000、2。
- T5：七行，`where` = `whole / skin / sensory / relay / motor / muscle / brain`。
- T6：28 行（§2.7 表），抽查 5 → 101、20 → 202、26 → 230、30 → 247；全部行 `source: ["S1"]`（设计研究）+ 物理来源，`tag: sim`。
- validate：每种控件组合恰好一行（现成）。

### 6.4 引擎扩展

| 编号 | 优先级 | 现状（已查） | 最小方案 | 退路 |
|---|---|---|---|---|
| **E-BN1** 颜色 token | 必须 | `tokens.css` 没有脑分区色与化学信号色；token 一色一义 | 加 7 个：`--brain-frontal`、`--brain-parietal`、`--brain-temporal`、`--brain-occipital`、`--brain-cerebellum`、`--brain-stem`（脑分区，各一义），`--chemical-signal`（突触化学信号）；paper / cinema 各一套；要求：六个分区色两两在三种色觉缺陷模拟下 ΔE*ab ≥ 10（同 docs/39 D10 的做法）、都与 `--en-electrical` ΔE ≥ 15（信号粒子叠在脑表面上要看得见）、低饱和（技术图版，不霓虹）；`--chemical-signal` 与 `--en-electrical` ΔE ≥ 20、在 paper 上 ≥ 3:1；docs/08 §1 功能色表与 `tokens.css` 头注释各加一行；单测 `tests/theme/brain-tokens.test.ts` | 不加分区色（Q3 另一条路）；化学信号退用 `token:food` 不可（一色一义），只能加 |
| **E-BN2** 跳跃流 | 可选 | 流沿路径连续走（`Flows.tsx`）；`tidal` 是唯一的非匀速模式 | 流加 `hop: { stops: [u0, u1, …], dwell: 0.6 }`：粒子在每个 `u` 停 `dwell` 的相位比例、再快速移到下一个；纯函数 `lib/sim/hop.ts`（u → 显示位置），shader 不变（照 tidal 把位移写进相位 uniform）；validate：`stops` 递增、在 0–1、与 `tidal`、`stops` 颜色、`ends: open` 互斥；单测 | 普通流 + 字幕（§4.3） |

**不做（v2）**：实时点击反应计时器；从身体连续缩放进神经元的镜头；EEG / 脑电波；读者自己画反射弧。

---

## 7. 章节与节拍（8 章 + 00，共 41 拍）

### 7.0 总表

镜头写预设名（§8.4）；`hide` / `labels` 不累积；"X" = X-RAY。

| # | id | 标题 EN / ZH | view | run | cut | layers（与默认不同） | 卡 | 镜头 | 拍 |
|---|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start / 开始之前 | X | false | — | 全部 | — | body | 4 |
| 01 | `the-nervous-system` | Brain, spinal cord and nerves / 脑、脊髓和神经 | X | true | — | nerve-signals | — | body | 5 |
| 02 | `parts-of-the-brain` | The parts of the brain / 脑的几个部分 | assembled | false | midline（第 3 拍） | 组色开 | — | brain | 5 |
| 03 | `two-brain-myths` | Two myths about the brain / 关于脑的两个误会 | assembled | true | — | nerve-signals | — | brain | 4 |
| 04 | `neurons-and-signals` | Neurons and signals / 神经元与信号 | assembled | true | — | neuron-study、nerve-signals、chemical-signals | T4 | bench | 5 |
| 05 | `the-reflex-arc` | Pulling your hand away / 缩手反射 | X | true | — | reflex-arm、cord-study、nerve-signals | T5 | reflex | 5 |
| 06 | `from-senses-to-action` | From senses to action / 从感官到动作 | X | true | — | nerve-signals | T6 | head | 5 |
| 07 | `protecting-the-brain` | Protecting the brain and spinal cord / 保护脑和脊髓 | assembled | false | skull-window / midline | protection、layers-study、helmet | — | head | 5 |
| 08 | `sleep-and-the-brain` | Sleep and the brain / 睡眠与脑 | X | false | — | 默认 | — | head | 3 |

### 7.1 第 00 章 `before-you-start`

- **summary**：EN "What this model is, what the colours and moving dots mean, and how this lesson connects with the body systems you have met." / ZH "这个模型是什么、颜色和移动的亮点代表什么，以及这一课和你学过的人体系统有什么关系。"
- **正文要点**：① 一个成年男性的参考身体（同 `heart-and-lungs`），皮肤半透明，里面是脑、脊髓和主要的神经；工作台上是放大的模型（D6）；② "系统"是什么（P2 印第 13 页）；课纲的五个人体系统里没有神经系统，这一课是课外的，但它和五个系统都连着（链 `five-systems`）；③ 亮点 = 神经信号，画面放慢了；④ 数字的三种：有来源的范围 / 在这个模型里的读数 / 设计值。
- **节拍**：

| 拍 | state | 字幕要点 EN / ZH |
|---|---|---|
| 1 | body，X-RAY | A see-through adult body. Inside are the brain, the spinal cord and the main nerves. / 一个半透明的成年人身体，里面是脑、脊髓和主要的神经。 |
| 2 | 镜头到 bench | On the bench are enlarged models: a nerve cell, a slice of spinal cord and the layers around the brain. They are not to scale. / 工作台上是放大的模型：一个神经细胞、一片脊髓横切、包着脑的几层。它们不按比例。 |
| 3 | run，`overview-down` 一条 | Moving dots show nerve signals, slowed down a great deal so you can follow them. / 移动的亮点表示神经信号，画面放慢了很多，方便看清。 |
| 4 | hero | The syllabus lists five body systems. The nervous system is not one of them, so this lesson goes beyond it. / 课纲列了五个人体系统，神经系统不在其中，所以这一课是课外的。 |

- **细看**：`Where the model comes from`（网格来源与改动、四处署名之一）；`Not in the syllabus`（课纲原文印第 53 页一句，说明是课外）；`Model numbers and real numbers`。
- **本章索引**：frontal-lobe、cerebellum、spinal-cord、arm-nerves、neuron-body、skull。

### 7.2 第 01 章 `the-nervous-system`

- **正文要点**：① 中枢 = 脑 + 脊髓（F-1）；② 脊髓在椎管里，比脊柱短，下面是马尾（F-5、F-61）；③ 神经是一束轴突（F-2），通到全身；感觉进、命令出；④ 12 对脑神经、31 对脊神经（F-3）；⑤ 和别的系统一起工作：链 `three-systems`（脑干参与调节呼吸心跳，F-11）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | body；labels 脑、脊髓、arm-nerves、leg-nerves | The brain and spinal cord form the central nervous system. Nerves branch out from them to every part of the body. / 脑和脊髓是中枢神经系统；神经从这里分出去，通到身体各处。 |
| 2 | 镜头沿背部；hide skin；labels spinal-cord、vertebral-column、cauda-equina | The spinal cord runs down a canal inside the backbone. It ends near the lower back, and a bundle of nerve roots carries on below it. / 脊髓在脊柱里的管道中往下走，到腰部附近就结束，再往下是一束神经根。 |
| 3 | `overview-up`、`overview-down` | Signals travel in both directions. Messages from the skin go in towards the spinal cord and brain; commands come out to the muscles. / 信号两个方向都走：皮肤的消息往里送到脊髓和脑，命令往外送到肌肉。 |
| 4 | 镜头到左臂；labels arm-nerves | A nerve is a bundle of long fibres from many nerve cells, like a cable holding many wires. / 一条神经是一束很多神经细胞的长纤维，像一根电缆里装着很多电线。 |
| 5 | 镜头回 body；labels medulla | The nervous system works with the other body systems. The brainstem, for example, helps set how fast you breathe. / 神经系统和其他系统一起工作，例如脑干参与调节呼吸的快慢。 |

- **细看**：`Twelve and thirty-one`（F-3、F-4）；`Why the spinal cord is shorter than the backbone`（F-5）；`Nerves you can feel`（不写，删——没有来源）。
- **索引**：spinal-cord、cauda-equina、vertebral-column、arm-nerves、leg-nerves、trunk-nerves、cranial-nerves、medulla。

### 7.3 第 02 章 `parts-of-the-brain`

- **正文要点**：① 大脑两半球、胼胝体（F-9）；② 四个叶与主要参与的事（F-6、F-7）；③ 小脑（F-10）；④ 脑干（F-11）；⑤ 每个区不只做一件事，复杂的事多区合作（D4 ⑨）；⑥ 每侧主要管对侧（F-14 待核）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | brain（左侧面），组色开；labels 四叶、cerebellum、pons | The largest part is the cerebrum. Its wrinkled surface is divided into four lobes on each side. / 最大的部分是大脑，表面有很多褶皱，每一侧分成四个叶。 |
| 2 | 俯视；labels corpus-callosum（ghost 半球）、frontal-lobe.l、frontal-lobe-r | The cerebrum has a left and a right half, joined by a thick band of nerve fibres. Each half mainly works with the opposite side of the body. / 大脑分左右两半，中间由一大束神经纤维连起来；每一半主要和身体的另一侧打交道。 |
| 3 | `midline` 剖切 + `hemisphere-off`；labels cerebellum、midbrain、pons、medulla | Behind and below sits the cerebellum, which keeps movements smooth. The brainstem joins the brain to the spinal cord and keeps breathing and the heartbeat going. / 后下方是小脑，让动作平稳协调；脑干把脑和脊髓连起来，让呼吸和心跳一直进行。 |
| 4 | EXPLODED（摊开）；labels 四叶 | The front lobe helps plan and start movements, the top lobe receives touch, the side lobe helps with hearing and memory, the back lobe handles what the eyes send. / 额叶参与计划和发出动作，顶叶接收触觉，颞叶参与听和记忆，枕叶处理眼睛送来的信号。 |
| 5 | 合拢，run，`reaction-route` 一条 | Most tasks use several areas at once. Catching a ball needs seeing, planning, moving and balance together. / 大多数事要好几个区一起做：接一个球，要看、要计划、要动，还要保持平衡。 |

- **细看**：`Folded to fit`（F-17）；`Most of the neurons are in the small part`（F-12、F-13 待核）；`Hungry for energy`（F-16 待核）；`Deeper parts not shown`。
- **索引**：frontal-lobe、parietal-lobe、temporal-lobe、occipital-lobe、corpus-callosum、cerebellum、midbrain、pons、medulla。

### 7.4 第 03 章 `two-brain-myths`

- **正文要点**：① "只用了 10 %"：脑一天里各部分都在工作，没有闲置的 90 %（P14 待核）；② 这句话流传很广，连很多老师也信（P12，写"在英国和荷兰的一项调查里"）；③ "左脑型 / 右脑型"：研究了 1,011 人的脑，没有找到整脑偏左或偏右的人（P13）；④ 但有些功能确实偏一侧，例如说话的一块区域在大多数人只在左侧（F-8）——偏一侧的是**某些功能**，不是**某种人**。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | brain，run，`overview-down` + `sight-signal` + `hearing-signal` 同时 | A common saying claims we use only ten per cent of our brain. Brain scans show activity in every part over a day. / 有句流行的话说人只用了百分之十的脑。脑成像显示，一天里每个部分都有活动。 |
| 2 | 依次 highlight 四叶、小脑、脑干（拍内两次切换不行 → 一拍只 highlight 全部组色） | Each area has jobs, and the jobs change from moment to moment. There is no idle ninety per cent. / 每个区都有它的工作，时刻在变；并没有闲着的百分之九十。 |
| 3 | 俯视，左右半球同亮；labels corpus-callosum | Another saying sorts people into logical left-brained and creative right-brained types. A study of more than a thousand brains found no such types. / 另一种说法把人分成理性的左脑型和感性的右脑型。一项研究看了一千多人的脑，没有找到这样的人。 |
| 4 | 左侧面，labels frontal-lobe（左） | Some abilities do rely more on one side; in most people, an area for speaking is on the left. The two halves still work together all the time. / 有些能力确实更多靠一侧，例如大多数人说话用的一块区域在左边；但左右两半一直在一起工作。 |

- **细看**：`Where the ten per cent idea came from`（只写"来源说不清"，P14 核到再写）；`How common the myths are`（P12 的两个百分比，写清"是教师、不是学生"）；`One side for some things`（F-8）。
- **索引**：frontal-lobe、temporal-lobe、corpus-callosum、cerebellum、medulla。

### 7.5 第 04 章 `neurons-and-signals`（T4）

- **正文要点**：① 神经元是一种细胞（链 `cells`）；② 结构（F-20）；③ 电信号是带电微粒进出细胞膜造成的变化一段段传过去（F-26），不像电线里的电；④ 髓鞘与速度（F-21–F-23、F-25），T4；⑤ 突触与化学信号、约 1 毫秒（F-24）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | body，labels arm-nerves → 镜头 bench | A nerve in the arm holds many long fibres. On the bench is one nerve cell, enlarged thousands of times. / 手臂里的一条神经装着很多长纤维；工作台上是放大了几千倍的一个神经细胞。 |
| 2 | part neuron-body；labels neuron-body、dendrites、axon、axon-terminals | Short branches called dendrites pick up signals. The cell body holds the nucleus. One long axon carries the signal away. Here it is drawn short; a real one can reach about a metre. / 短的分支叫树突，接收信号；细胞体里有细胞核；一条长的轴突把信号送出去。这里画短了，真实的可以长到约一米。 |
| 3 | run，`axon-signal`；labels myelin | The signal is a change that moves along the cell's thin outer layer as charged particles pass in and out. Fatty wrapping called myelin lets it jump from gap to gap, which is faster. / 信号是带电的微粒进出细胞外层膜造成的变化，一段段往前传。叫髓鞘的脂质外套让它在缝隙之间一跳一跳地走，所以更快。 |
| 4 | T4 卡打开，镜头 `one-metre-nerve`；fibre 默认 thick-myelin | In this model, a thick wrapped fibre carries a signal at 100 metres per second: one metre in a hundredth of a second. A thin bare fibre at 1 metre per second takes a whole second. Both are slowed down here. / 在这个模型里，粗的、有髓鞘的纤维每秒 100 米，一米只要百分之一秒；细的、没有髓鞘的每秒 1 米，要整整一秒。画面里两种都放慢了。 |
| 5 | 突触放大，`chemical-cross`、`vesicle-release` | At the end there is a tiny gap. The signal makes small sacs release a chemical, which crosses the gap and starts a new signal in the next cell, taking about a thousandth of a second. / 末端有一道很窄的缝。信号让小泡放出化学物质，跨过缝，让下一个细胞产生新的信号，大约要千分之一秒。 |

- **细看**：`Not like electricity in a wire`（F-26、M-3）；`How fast, really`（F-23 的两端都写，P10 的两个范围并列）；`Two kinds of synapse`（F-24 电突触一句）。
- **索引**：neuron-body、dendrites、axon、myelin、axon-terminals、synapse-sending、vesicles、synapse-receiving、arm-nerves。

### 7.6 第 05 章 `the-reflex-arc`（T5）

- **正文要点**：五步（F-27、F-30）；转弯在脊髓（F-28）；脑也收到消息、"在觉得烫之前"（F-29 待核）；为什么有用（一句：伤害少一点，不写目的论——写"所以手离开得更早"）；链 `muscles-arms`（肱二头肌屈肘）；膝跳反射一句（F-28 待核）。
- **节拍**（与 T5 的 stop 一一对应；卡片和拍共用 `stop`）：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | reflex 镜头，stop 0，run；hide skin | Touch something very hot and your hand pulls away before you think about it. The whole path is called a reflex arc. Here it is slowed down. / 手碰到很烫的东西，你还没想就缩回来了。整条路叫反射弧；这里放慢了。 |
| 2 | stop 1–2；labels forearm-hand-r、arm-nerves-r、spinal-roots | Receptors in the skin start a signal. A sensory neuron carries it up the arm and into the spinal cord at the neck. / 皮肤里的感受器产生信号；感觉神经元沿手臂把它送进颈部的脊髓。 |
| 3 | stop 3；分屏同拍：横切工位 `section-relay`；labels relay-neuron-study、cord-grey | Inside the spinal cord, a relay neuron passes the signal straight on. The turn happens here, not in the brain. On the right is an enlarged slice of the cord. / 在脊髓里，中间神经元直接把信号接过去；转弯在这里，不在脑里。右边是放大的脊髓横切。 |
| 4 | stop 4–5；labels biceps-r、triceps-r；链 `muscles-arms` | A motor neuron carries the command back to the upper arm. The biceps contracts and bends the elbow, and the hand leaves the cup. / 运动神经元把命令送回上臂；肱二头肌收缩、弯起手肘，手就离开了杯子。 |
| 5 | stop 6；labels parietal-lobe | The signal also travels up to the brain, and only then do you feel that it was hot. The pull had already started. / 信号也一路上到脑里，这时你才觉得"好烫"；手早已开始缩回。（F-29 核不到则改为：The brain gets the message too, but the pull does not wait for it. / 脑也收到了消息，但缩手不用等它。） |

- **细看**：`Two neurons or three`（膝跳反射，F-28 待核）；`In this model`（F-63：信号在模型里走了约 X cm，用 T4 的 100 m/s 算约 Y ms，写"在这个模型里、按设计值"）；`Not a reflex: catching a ball`（引出 06）。
- **索引**：forearm-hand-r、arm-nerves、spinal-roots、spinal-cord、relay-neuron-study、biceps-r、triceps-r、parietal-lobe。

### 7.7 第 06 章 `from-senses-to-action`（T6）

- **正文要点**：① 眼 → 视神经 → 枕叶（链 `an-image-on-the-retina`）；② 耳 → 前庭蜗神经 → 脑干 → 颞叶（链 `vibration-to-signal`）；③ 皮肤 → 脊髓 → 顶叶；④ 看见 → 决定 → 动手 = 反应，要经过脑，所以比反射慢（只定性）；⑤ T6 尺子接落（F-31），细看 P21。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | head（从下前方看视路）；`sight-signal`；labels optic-pathway、occipital-lobe | Signals from the eyes travel along the optic nerves to the back of the brain. What travels is a nerve signal, not the picture or the light. / 眼睛的信号沿视神经传到脑的后部；传过去的是神经信号，不是画面，也不是光。 |
| 2 | `hearing-signal`；labels hearing-nerve、pons、temporal-lobe | Signals from the inner ear go into the brainstem and on to the side of the brain. / 内耳的信号进到脑干，再到脑的侧面。 |
| 3 | `overview-up` 只开手那条；labels parietal-lobe | Touch, warmth and pain from the skin reach a strip across the top of the brain. / 皮肤上的触、冷热和痛，送到脑顶上横着的一条区域。 |
| 4 | `reaction-route`；labels occipital-lobe、frontal-lobe、spinal-cord | Catching a falling ruler is not a reflex. You see it, the brain decides, and a command goes down to the fingers, so it takes longer. / 接住下落的尺子不是反射：眼睛看见、脑做决定、命令送到手指，所以要更久。 |
| 5 | T6 卡，`ruler-fall`；catch-cm 默认 | In this model, a ruler caught after falling 20 centimetres means about 0.2 seconds. Try it with a partner and read where you caught it. / 在这个模型里，尺子落了 20 厘米才接住，约是 0.2 秒。可以和同伴试试，读出你接住的位置。 |

- **细看**：`How the ruler turns into a stopwatch`（F-31 算式）；`One study of children`（F-32，Q7）；`Left and right eyes share`（视交叉一句，不展开）；`Sound itself`（链 `sound`）。
- **索引**：eye-markers、optic-pathway、occipital-lobe、hearing-nerve、temporal-lobe、parietal-lobe、frontal-lobe、spinal-cord、arm-nerves。

### 7.8 第 07 章 `protecting-the-brain`

- **正文要点**：① 颅骨（链 `connected-skeleton`）；② 三层脑膜、脑脊液、脑室（F-40–F-42）；③ 脊柱护脊髓（F-5）；④ 头盔两层、为什么有用（F-44、F-45 待核）；⑤ 新加坡在马路上骑车必须戴（F-43）；骑脚踏车、滑板车、溜冰都戴好、扣好（价值陈述，不引来源）；头撞到了要告诉大人（价值陈述）。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | head，`skull-window` 剖切；labels skull、frontal-lobe | The brain sits inside the skull, a case of joined bones. / 脑在颅骨里，颅骨是几块连在一起的骨头围成的硬壳。 |
| 2 | 镜头到 `layers-study`；labels 六层 | Between bone and brain are three thin coverings and a layer of clear fluid that cushions the brain. These layers are drawn thicker than they really are. / 骨头和脑之间有三层薄膜，膜之间有一层透明的液体，给脑当软垫。这里各层画得比真实厚。 |
| 3 | midline；labels ventricles、vertebral-column、spinal-dura | The fluid is made inside four spaces in the brain, about half a litre a day. Lower down, the backbone's ring-shaped bones surround the spinal cord. / 这种液体在脑里四个空腔中产生，每天约半升。往下，脊柱一节节环形的骨头围住脊髓。 |
| 4 | helmet 显示，cutaway；labels helmet-shell、helmet-liner、helmet-strap | A helmet adds another layer outside the head: a hard shell and a thick foam lining. In crashes, riders wearing helmets have far fewer serious head injuries. / 头盔在头外再加一层：硬外壳和厚泡沫内衬。研究发现，发生碰撞时戴头盔的人头部重伤少得多。 |
| 5 | hero 头部 + 头盔 | In Singapore, cyclists must wear a helmet on the road. Wear one, strap fastened, whenever you ride a bicycle or scooter or skate. / 在新加坡，在马路上骑脚踏车必须戴头盔。骑脚踏车、滑板车或溜冰时，都要戴好头盔、扣好带子。 |

- **细看**：`What the numbers say`（F-44 三个 OR，写清是"相关"与"自行车"）；`The rules`（F-43、F-46）；`If you hit your head`（价值陈述一句）；`Why the fluid matters`（F-41 带走废物）。
- **索引**：skull、dura-folds、ventricles、vertebral-column、spinal-dura、helmet-shell、helmet-liner、csf-space。

### 7.9 第 08 章 `sleep-and-the-brain`

- **正文要点**：① 睡觉时脑仍在工作（脑干网状结构与睡醒有关，F-11）；② 睡眠帮学习和记忆、睡不够难专心（F-52）；③ 新加坡建议 7–13 岁每晚至少 9 小时（F-50）；美国建议 6–12 岁 9–12 小时（F-51）；④ 与 PE 的睡眠习惯一致（P3）。不出"睡眠阶段"的数。
- **节拍**：

| 拍 | state | 字幕要点 |
|---|---|---|
| 1 | head，X，run 很慢的 `overview-up` | During sleep the brain does not switch off. Parts of the brainstem help control when we sleep and wake. / 睡着时脑没有关机；脑干的一部分参与控制什么时候睡、什么时候醒。 |
| 2 | labels temporal-lobe、frontal-lobe | Sleep helps the brain learn and keep long-term memories. Too little sleep makes it harder to focus and think clearly. / 睡眠帮助脑学习、留住长期的记忆；睡得太少，就难专心、想不清楚。 |
| 3 | hero | Singapore's guidelines say children aged 7 to 13 should sleep at least 9 hours, regularly. / 新加坡的指引建议，7 到 13 岁的孩子要规律地睡够至少 9 小时。 |

- **细看**：`Two guidelines`（F-50、F-51 并列，说明一个写"至少"、一个写"范围"）；`Sleep habits`（PE 课纲的几句方向，价值陈述，不出具体做法来源就不写具体时间）。
- **索引**：medulla、pons、frontal-lobe、temporal-lobe。

**拍数**：4 + 5 + 5 + 4 + 5 + 5 + 5 + 5 + 3 = **41**。每拍 `labels` ≤ 6、全部在画面里（`pnpm shoot --beats` 0 漏标）。

---

## 8. HUD

### 8.1 标题与元数据

- 标题 EN "Brain and Nerves" / ZH "脑与神经"；副标题 EN "How signals travel from the senses to the brain and out to the muscles" / ZH "信号怎样从感官传到脑、再传到肌肉"；`shortTitle` EN "Brain & nerves" / ZH "脑与神经"。
- `subject: biology`；`tags: [beyond-syllabus, biology, space]`；`levels: [P5, P6]`（Q11）；`moe`：`["Enrichment beyond MOE 2023 Science: the nervous system is not in the primary syllabus; links to 'systems' (P3–P6) and P5 integration of systems", "MOE PE 2024: P3 cycling safety; P2, P3, P5 sleep"]`；`illustration: brain-and-nerves`；`note` 见 §3.2。

### 8.2 规格行（≤ 4）

| key EN / ZH | value | tag |
|---|---|---|
| Neurons in an adult brain / 成人脑里的神经元 | EN `≈ 86 billion` / ZH `约 860 亿个` | typical（F-12） |
| Fastest nerve signals / 最快的神经信号 | EN `up to ≈ 150 m/s` / ZH `最快约每秒 150 米` | typical（F-23，待核；核不到改 "100+ m/s"，同步正文） |
| Nerve pairs / 神经对数 | EN `12 cranial · 31 spinal` / ZH `脑神经 12 对 · 脊神经 31 对` | typical（F-3） |
| Sleep, age 7–13 / 7–13 岁睡眠 | EN `≥ 9 h a night` / ZH `每晚至少 9 小时` | typical（F-50） |

### 8.3 telemetry（≤ 6，全部 `follow`）

| key EN / ZH | follow | unit | scope |
|---|---|---|---|
| Signal speed / 信号速度 | `speed` | m/s | observe |
| Time over 1 m / 走 1 米用时 | `time-ms` | ms | observe |
| Reflex step / 反射步骤 | `step-name` | — | observe |
| Caught at / 接住位置 | `catch-cm` | cm | observe |
| Reaction time / 反应时间 | `reaction-ms` | ms | observe |

块尾：`SIM THICK, WRAPPED FIBRE`、`SIM CAUGHT AT 20 CM` 之类（SIM 芯片）。

### 8.4 镜头预设（≤ 6）

| # | id | label | 用途 |
|---|---|---|---|
| 1 | `body` | BODY | 全身正面 3/4，X-RAY，脑到脚的神经都在画面 |
| 2 | `brain` | BRAIN | 脑左侧面略俯，四叶、小脑、脑干同框（hero = 这个） |
| 3 | `head` | HEAD | 头颈 3/4 前右，视路、颅骨开窗、头盔 |
| 4 | `reflex` | REFLEX | 右臂 + 颈段脊髓同框，手与杯在画面下沿；横切工位在画面左缘可见（若做不到，拍 3 切 `bench`） |
| 5 | `bench` | BENCH | 工作台三个工位 3/4 前上方 |
| 6 | `spine` | SPINE | 背面略侧，脊髓与马尾、腰椎 |

`views.cover` = `brain` 去 HUD；`views.assembled.camera` = `brain`。

### 8.5 模式组合

| 组合 | 行为 |
|---|---|
| X-RAY + FLOW | 主读法：皮肤、骨透明，神经与信号清楚 |
| CUTAWAY（midline）+ FLOW | 脑内示意路线 `clip: false`（否则被切掉一半）；身体上的神经 `clip: true` |
| EXPLODED + FLOW | 引擎禁用 |
| hide + EXPLODED | 隐藏件拆开时仍隐藏 |

---

## 9. 名词表 `glossary.json`（候选 18 个，正文用不到的删到 14–16）

| id | EN / ZH | 定义要点 | 首现章 |
|---|---|---|---|
| `nervous-system` | nervous system / 神经系统 | 脑、脊髓和神经组成的系统 | 00 |
| `central-nervous-system` | central nervous system / 中枢神经系统 | 脑和脊髓 | 01 |
| `nerve` | nerve / 神经 | 一束神经细胞的长纤维，在脑和脊髓以外 | 01 |
| `spinal-cord` | spinal cord / 脊髓 | 脊柱管道里连着脑的神经组织 | 01 |
| `cerebrum` | cerebrum / 大脑 | 脑最大的部分，分左右两半球 | 02 |
| `lobe` | lobe / 叶 | 大脑每侧分成的四个区之一 | 02 |
| `cerebellum` | cerebellum / 小脑 | 大脑后下方，让动作协调 | 02 |
| `brainstem` | brainstem / 脑干 | 连接脑和脊髓，管呼吸、心跳等 | 02 |
| `corpus-callosum` | corpus callosum / 胼胝体 | 连接两半球的纤维束（再进一步） | 02 |
| `neuron` | neuron / 神经元（神经细胞） | 传递信号的细胞 | 04 |
| `axon` | axon / 轴突 | 把信号送出去的长突起 | 04 |
| `dendrite` | dendrite / 树突 | 接收信号的短分支 | 04 |
| `myelin` | myelin / 髓鞘 | 包着轴突的脂质绝缘层 | 04 |
| `synapse` | synapse / 突触 | 两个细胞之间传信号的接头，常有一道窄缝 | 04 |
| `receptor` | receptor / 感受器 | 感受刺激、产生信号的结构（皮肤里） | 05 |
| `reflex-arc` | reflex arc / 反射弧 | 反射时信号走的路 | 05 |
| `relay-neuron` | relay neuron / 中间神经元 | 在脊髓里接上感觉与运动神经元 | 05 |
| `cerebrospinal-fluid` | cerebrospinal fluid / 脑脊液 | 脑和脊髓周围、脑室里的透明液体 | 07 |
| `meninges` | meninges / 脑膜 | 包着脑和脊髓的三层膜 | 07 |

- 中文术语来源：施工时查**术语在线（全国科学技术名词审定委员会）**与香港教育局英汉科学词汇（P35），记在 `note`；**没有找到 MOE 中文科学词表**（同 docs/40 D19），不声称是新加坡课本用词（Q10）。
- "感觉神经元 / 运动神经元"是否进名词表：主线用到就进，否则正文当场解释。

---

## 10. 插图需求清单（交 Codex；风格与验收照 BRIEF2 + docs/69 教训，严格）

**共同风格**：fine graphite pencil，19th-century scientific plate，cross-hatching 与 stippling；**严格中性灰（R = G = B）**；**无**纸纹、底色、边框、文字、数字、标签、箭头、logo、地面阴影；PNG 真透明；标本约占画面 85 %，四边留白。生成后逐项核对下列事实，最多 4 次；manifest 记 `{slug, kind, file, chapterIdea, subject, checks, tries}` + prompt + 每次的目检记录。**禁止**：从本主题 glb（或任何 Z-Anatomy 渲染）出图再描（docs/69 §1 muscles 封面的教训）；发光、电火花、闪电、霓虹、"科技蓝"脑；血、伤口、手术切口、病变；人脸表情；卡通化。cinema 主题会反相（`.atlas-drawing`），这几张都不靠"亮 = 被照亮"表意，可以反相。

| # | 文件 | 尺寸 | 章 | 画什么 | 解剖事实约束（逐项验收） | 不许出现 |
|---|---|---|---|---|---|---|
| I-1 | `brain-and-nerves.png`（封面） | 1024² | 封面 | 成人脑**左侧面**（前在左），带小脑、脑干，脑干下接一小段颈段脊髓，脊髓两侧出两三对短的神经根 | ① 外侧沟清楚，把颞叶与上方额、顶叶分开，颞叶前端在下前方；② 中央沟从顶缘连续向下，止于外侧沟上方附近，不与外侧沟相连；③ 回与沟弯曲连续、宽窄自然，**不是肠子一样的管**、不是对称花纹；④ 小脑在枕叶下方、颞叶后方，表面是**细密平行的横褶**，与大脑的回明显不同；⑤ 脑干在小脑**前方**，脑桥前面有圆隆，往下逐渐变细接脊髓；⑥ 比例：小脑长度约大脑的三分之一到二分之一之间，脑干不比小脑粗；⑦ 神经根左右成对、从脊髓侧面出 | 颅骨、眼球、脸、血管、颜色分区、标签、光效、切面、多余的第二个脑干 |
| I-2 | `brain-and-nerves-neuron.png` | 1536×1152 | 04 | 一个多极运动神经元，横向摆放：左边细胞体 + 树突，右边长轴突（中段可用一个"省略"的断开表示画短了，**断开处画两条平行斜线不算文字**——若违反"无标记"规则，改为不断开、直接画短） | ① 细胞体一个、内有一个圆形细胞核；② 树突 5–8 根，短、多次分叉、从细胞体多方向伸出；③ **轴突只有一根**，从细胞体一个锥形隆起（轴丘）出来，粗细均匀；④ 髓鞘一节节包着轴突，节间有短的裸露间隙，起始段（靠近细胞体）没有髓鞘；⑤ 末端分出 4–6 个小分支，各带一个小膨大；⑥ 树突比轴突短得多 | 两根轴突、髓鞘包住细胞体、髓鞘连续无间隙、树突上有髓鞘、神经元像星形卡通、背景里有别的细胞 |
| I-3 | `brain-and-nerves-synapse.png` | 1536×1152 | 04 | 一个突触的放大剖面：上方发出信号的末梢（剖开），下方接收细胞的一段膜 | ① 末梢内有多个圆形小泡，集中在靠近缝的一侧，其中一两个正贴在膜上开口；② 两膜之间是一道**清楚的窄缝**，两边不接触；③ 缝里有少量细小的点（化学物质），只在缝里和贴着下方膜；④ 下方膜上一排小凸起（受体）；⑤ 末梢里可有几个线粒体（椭圆、内有褶），可省略 | 文字、离子符号、箭头、电火花、两膜相连、小泡在接收侧 |
| I-4 | `brain-and-nerves-reflex-arc.png` | 1536×1152 | 05 | **默认代码绘制**（几何 + 铅笔质感滤镜），理由 docs/69：讲关系的图 AI 最常错。内容：左边一只手（手指）贴着一只杯，中间一段手臂神经示意，右边一个脊髓横切；感觉神经元细胞体在背根神经节，轴突进后角；灰质里一个中间神经元；前角运动神经元细胞体，轴突出前根到上臂肌肉（肱二头肌轮廓）。若改 AI 生成，同样的约束逐项验 | ① 脊髓横切：灰质 H / 蝴蝶形，**后角窄而长、朝背侧**，**前角宽而钝、朝腹侧**，中央管一个点；白质包在外；② 背根上有一个鼓起的神经节，神经节在脊髓**外**；③ 感觉神经元的细胞体在神经节里（不在脊髓里）；④ 中间神经元完全在灰质里；⑤ 运动神经元细胞体在前角，轴突从前根出；⑥ 感觉进后根、运动出前根，不能反过来；⑦ 杯不画蒸汽特效，手不画伤 | 箭头、文字、脑、感觉神经元细胞体画在脊髓里、前后根接反、灰质形状倒置 |
| I-5 | `brain-and-nerves-protection-layers.png` | 1536×1152 | 07 | 头顶一块楔形剖面（像切下一块蛋糕），从外到里：头皮（带发根）→ 颅骨 → 硬脑膜 → 蛛网膜 → 蛛网膜下的液体空间（有细丝横跨）→ 软脑膜紧贴 → 皮层（回与沟）→ 下方白质 | ① 颅骨是**两层致密骨夹一层松质骨**；② 硬脑膜厚而贴着颅骨内面；③ 蛛网膜薄，与下方之间有空隙和蛛网状细丝；④ 软脑膜**跟着沟回起伏、伸进沟里**，蛛网膜**不伸进沟里**（跨过沟）；⑤ 皮层灰（深）在外、白质（浅）在内；⑥ 层的顺序不可错 | 血、伤、脑膜画成一层、软脑膜跨过沟、颅骨实心一块、颜色 |

**验收**：每张逐条打勾写进 `art/planned/brain-and-nerves/image-qa.json`；灰度 / alpha / 尺寸用脚本验（R = G = B，alpha 有 0 值，尺寸精确）；cinema 反相后再看一遍；`scripts/illustrate.ts` 出 webp 后在章节里核 alt / caption 与图一致。**生成成功不等于事实正确**：未逐项核过的图不进 `public/`。

---

## 11. 写法与用词

照 skill `atlas-space-topic` 的 `writing-rules.md`；本主题另加：

| 写 | 不写 | 为什么 |
|---|---|---|
| 神经信号、电信号（"带电的微粒进出细胞膜造成的变化"） | "电流"、"通电"、"像电线一样导电" | M-3、M-4；比喻"像电缆里很多电线"只用于**结构**（一束纤维），不用于信号本身 |
| 额叶**参与**计划和发出动作命令 | 额叶**负责**智力 / 性格；"XX 区控制 XX" 一对一 | D4 ⑨；一个区不只做一件事 |
| 每一半主要和身体另一侧打交道 | 左脑理性、右脑感性；"开发右脑" | M-2 |
| 脑一天里每部分都有活动 | "只用了 10 %"（除非在破除它的句子里） | M-1 |
| 中间神经元 | 联络神经元、中继神经元（Q10 默认） | 统一 |
| 感受器（皮肤里） | 受体（突触上） | 两个英文都是 receptor，中文分开：皮肤的叫感受器，突触膜上的叫受体（正文里第一次各解释一次） |
| 化学物质 | 神经递质名字 | D9 |
| "降低头部重伤的机会" | 伤情描写、"脑震荡""颅内出血" | D8 |
| "在这个模型里""画面放慢了 N 倍" | 不说明的模拟数字 | writing-rules |
| 脑、大脑、小脑分清："脑"= 整体，"大脑"= cerebrum | 用"大脑"指整个脑 | 中文常混，正文首现处说一次 |

- 不拟人（"脑在思考""神经很忙"不写）、不目的论（"反射是为了保护你"→"所以手离开得更早"）、无感叹号、无问句标题、不喊"小朋友"。
- 英文新加坡 / 英式拼写（centre、metre、per cent、colour）；中文引号只用"“ ”"；数字与汉字之间留空格。
- 字幕会被朗读：不写 m/s、ms、cm 缩写（写 metres per second / 每秒 X 米）。

---

## 12. 施工顺序与验收

### 12.1 顺序（照 `build-order.md` 与 anatomy runbook；子代理不改 `package.json`、不提交）

1. Gavin 定稿 §0.1（Q1 必须先批）。
2. 下载 Nervous FBX → G1 inventory → G2 来源核（人审）→ G3 配准 → 回填 §3.4、§14（主会话 / Opus，本机 Blender）。
3. 参考图 R1–R7。
4. E-BN1 token（Opus 引擎代理，小）；E-BN2 视 Q 决定。
5. 管线 P-BN1–P-BN7 → glb + report + preview 人审（G4）。
6. 脚手架 `pnpm tsx scripts/new-topic.ts brain-and-nerves --engine space-scene --subject biology --title-en "Brain and Nerves" --title-zh "脑与神经"`。
7. 程序化工位 R2（并排参考两轮）→ R3 → R4（流、动画）。
8. 事实核（§2 待核清零）→ `sources.json` → 样章（建议 05 反射弧）给 Gavin → 其余章。
9. 节拍 → `pnpm shoot brain-and-nerves --layout --keys --beats`（EN / ZH × paper / cinema）。
10. 插图（Codex，§10）并行于 7–9。
11. 验收 → 回链（§1.5）→ `status: published`。

### 12.2 验收清单（`acceptance.md` + runbook 三道人审 + 本主题另加）

- [ ] glb ≤ 4,000,000 B、≤ 350,000 三角形；静止绘制 < 80、运转 < 90（上限 100）；`asset.copyright` 含全部署名。
- [ ] `provenance.md` 每个节点有来源家族；glb 里**没有** NC、unknown、白质纤维束、内耳；manifest 拒绝表有单测。
- [ ] 脑与颅骨无穿插（G3 数值写进 report）；脊髓在椎管内。
- [ ] 四叶分界在中央沟、外侧沟、顶枕沟处合理（preview 并排 R1 人审）；分界无亮缝。
- [ ] 小脑叶片在 `brain` 镜头下可辨。
- [ ] T4 / T5 / T6 单测数值（§6.3）；卡片、PLATE、字幕、正文同一量同一值（10 ms、1,000 ms、202 ms 等）。
- [ ] 反射拍：肱二头肌远端与前臂骨缝 ≤ 5 mm（Q4）；手离杯可见。
- [ ] 每拍 `labels` 全在画面、0 漏标；字幕无缩写。
- [ ] 两套主题下 `--en-electrical` 粒子在脑表面分区色上可辨；`--chemical-signal` 与电信号可辨；灰度打印仍分得开（分区靠标注）。
- [ ] 全文 grep：无"10 %"肯定句、无"左脑型 / 右脑型"肯定句、无"电流"、无病名。
- [ ] 插图 §10 逐项打勾；反射弧图几何断言通过。
- [ ] 门槛：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`、`pnpm shoot … --layout --keys --beats`。

---

## 13. 来源表（P# → 施工时的 S#；访问日期 2026-11-15，"读法"写起草时实际读到的程度）

| P# | 来源 | 许可 / 性质 | 读法 | 用于 |
|---|---|---|---|---|
| P1 | 本主题 Atlas 设计研究（T4 / T6 的设计值与算式、放大倍数、画面慢放倍数） | 本站 | — | §2.7、规格行、PLATE |
| P2 | MOE CPDD, *Science Teaching & Learning Syllabus, Primary Three to Six*（2023 cohort，Updated Jan 2026） | 政府 | PDF 全文 grep + 逐页读 13、16、52–54 | §1.1、D2 |
| P3 | MOE SDCD, *Physical Education Syllabus — Primary, Secondary & Pre-University*（2024）`https://www.moe.gov.sg/media/files/secondary/syllabuses-nt/pe/5ebed2f3-0779-481a-a7a9-fc76259c1226.pdf` | 政府 | PDF 第 95–98 页读过 | §1.1、07、08 |
| P4 | OpenStax *Anatomy and Physiology 2e*, 13.2 The Central Nervous System | CC BY-NC-SA 4.0（anatomy runbook §2 的记录；施工时在书页复核；**只转述事实，不复制图文**，所以不进 BY-SA 文件也没有冲突） | 页面读过（经抓取摘要） | F-1、F-5–F-11、F-17、F-20、F-25、F-30 |
| P5 | OpenStax A&P 2e, 13.3 Circulation and the Central Nervous System | 同上 | 读过 | F-40、F-41 |
| P6 | OpenStax A&P 2e, 13.4 The Peripheral Nervous System | 同上 | 读过 | F-1–F-4、F-30 |
| P7 | OpenStax A&P 2e, 12.4 The Action Potential | 同上 | 读过（无 m/s 数字） | F-21、F-22、F-26 |
| P8 | OpenStax *Biology 2e*, 35.2 How Neurons Communicate | 页面写 CC BY-NC-SA（施工时复核 Biology 2e 实际许可） | 读过 | F-20–F-22、F-24 |
| P9 | OpenStax A&P 2e, 第 14 章导言（缩手反射）与 14.x 反射一节 | 同 P4 | **只读到搜索摘要**，待核 | F-27–F-29 |
| P9b | 一本开放教材的反射一节（多突触 / 单突触），施工时选（如 University of Iowa *Introduction to Neuroscience* pressbooks） | 待核 | 待核 | F-28 |
| P10 | Purves et al., *Neuroscience* 2nd ed., NCBI Bookshelf NBK10921（传导速度） | 版权书（NCBI 免费读） | **只读到搜索摘要**，待核；NCBI 若要人机验证不绕过 | F-23 |
| P11 | Azevedo FAC et al. (2009) *J Comp Neurol* 513:532–541, "Equal numbers of neuronal and nonneuronal cells make the human brain an isometrically scaled-up primate brain"，PMID 19226510 | 期刊 | 摘要读过（Europe PMC） | F-12、F-13（待核） |
| P12 | Dekker S et al. (2012) *Front Psychol* 3:429, "Neuromyths in Education"，PMC3475349 | CC BY | 表 1 读过 | M-1、M-2 |
| P13 | Nielsen JA et al. (2013) *PLoS ONE* 8(8):e71275，"An evaluation of the left-brain vs. right-brain hypothesis…"，PMC3743825 | CC BY | 摘要读过 | M-2、03 |
| P14 | "10 % 的脑"破除的可靠来源（候选：Scientific American, Boyd R. 2008 "Do People Only Use 10 Percent of Their Brains?"；或神经科学学会 BrainFacts.org 的条目） | 待核 | **未读**，待核 | M-1、03 第 1–2 拍；核不到改用 P11 + P4 的结构事实，只说"没有证据支持" |
| P15 | Academy of Medicine Singapore / KKH, *Summary — The Singapore Integrated 24-Hour Activity Guidelines for Children and Adolescents*（2021）`https://www.kkh.com.sg/patient-care/areas-of-care/childrens-services/Documents/Summary-the-Singapore-Integrated-24-Hour-Activity-Guidelines-for-Children-and-Adolescents.pdf` | 政府医院 | PDF 第 7 条读过 | F-50 |
| P16 | NHLBI, *How Much Sleep Is Enough?*（rev. 2022-03-24） | 美国政府 | 读过 | F-51 |
| P17 | NHLBI, *Why Is Sleep Important?*（2022-03-24） | 美国政府 | 读过 | F-52 |
| P18 | LTA, *Rules & Code of Conduct*（walk-cycle-ride；Last updated 26 October 2026） | 政府 | 读过 | F-43、F-46 |
| P19 | LTA e-scooter / PAB 手册（2021-06-14 PDF） | 政府 | 未读，待核 | 07 细看（若用"路径上也建议戴"） |
| P20 | Olivier J, Creighton P (2017) *Int J Epidemiol* 46(1):278–292, "Bicycle injuries and helmet use: a systematic review and meta-analysis"，PMID 27450862 | 期刊（非开放） | 摘要读过 | F-44 |
| P21 | Aranha VP et al. (2017) *J Neurosci Rural Pract* 8(1):79–83，尺子法，204 名 6–12 岁学生 | CC BY-NC-SA | 摘要读过 | F-32 |
| P22 | 自由落体 d = ½ g t²；标准重力 9.80665 m/s²（BIPM SI 手册，仓库已有 `art/codex-research/measuring/sources/bipm-si-en.pdf`） | — | 已知物理 | F-31 |
| P23 | Z-Anatomy, GitHub `LluisV/Z-Anatomy` PC-Version，`Resources/Models/License.txt`、`Resources/Layers/Collections - Nerves.csv` | CC BY-SA 4.0（+ 第三方例外） | 读过 | §0.0、§3.4、§5 |
| P24 | Winkler AM, *Brain for Blender*, brainder.org | CC BY-SA 3.0 | 读过 | §5.4 |
| P25 | Destrieux C et al. (2010) *NeuroImage* 53:1–15（皮层分区命名） | 期刊 | 未读；只用于分叶表的命名对照 | §3.4、P-BN3 |
| P26 | DBCLS BodyParts3D 许可页 | CC BY 4.0 | runbook 已核 | §5.4 |
| P27 | University of Dundee CAHID, *Cranial Nerves and Foramina*（原始发布页） | CC BY 4.0（据 Z-Anatomy `License.txt`） | **未找到原页**，待核 | §5.4 |
| P28 | Raichle ME, Gusnard DA (2002) *PNAS* 99:10237–10239, "Appraising the brain's energy budget" | 期刊 | 未读，待核 | F-16 |
| P29 | Gray H (1918) *Anatomy of the Human Body* | 公有领域 | 参考图 | R1 |
| P30 | OpenStax A&P 2e 第 14 章运动通路（锥体交叉） | 同 P4 | 未读，待核 | F-14 |
| P31 | 本站 `eyes-and-ears`、`cells`、`muscles-arms`、`heart-and-lungs`、`digestive-system`、`bones-and-joints`、`sound` | 本站 | — | §1.5 |
| P32 | 头盔构造（外壳 + EPS 内衬吸能）：候选 CPSC 头盔指南或 NHTSA 自行车头盔页 | 政府 | 未读，待核 | F-45 |
| P33 | 成人脑质量：候选 OpenStax A&P 2e 或 P11 正文 | — | 待核 | F-15 |
| P34 | StatPearls, *Physiology, Cerebral Spinal Fluid*（NCBI Bookshelf） | 版权 | 未读，待核 | F-42 |
| P35 | 术语在线（termonline.cn）；香港教育局英汉科学词汇 | — | 未读，待核 | §9 中文术语 |

---

## 14. 已知风险与不确定处

| # | 风险 | 影响 | 处理 |
|---|---|---|---|
| K1 | **Nervous 文件里每个节点的真实来源认不出**（Z-Anatomy 不一定写逐节点署名） | 许可不清的节点不能发布；若皮层认不出，主视觉就没了 | G2 人审；Q2 退路（BP3D 4.0 脑或用 Brainder 原 OBJ 比对确认后采用） |
| K2 | **Brainder 皮层来自另一个人**，与 BP3D 颅骨不一定吻合 | 脑穿出颅骨或悬空 | G3 配准，只做刚体 + 等比缩放；量值进 report 与 detail（"脑与颅骨来自不同的扫描，已对齐"） |
| K3 | 皮层减面后沟回变糊、小脑叶片消失 | Tier-1 失败 | 分结构容差；大脑预算可升到 100 k |
| K4 | `whole_brain` 与 Destrieux 分区的覆盖情况未知（名表里缺部分 Destrieux 标签，内侧壁可能是洞） | 分叶有缺口、正中剖面露洞 | P-BN3 以 `whole_brain` 为几何；内侧壁若有洞，`midline` 拍用 `cerebrum-medial` 的程序化补片（标示意）或改为只看一侧外侧面 + 胼胝体 |
| K5 | 胼胝体、脑室、小脑、脑干的来源可能是 UW 白质或其他 | 这些结构可能要换程序化 | 程序化退路逐件写在 §3.4 |
| K6 | 脊神经根是否逐节建模未知 | 反射路线进脊髓的位置可能只能示意 | 只用颈段一对；`routes.json` 标 `schematic` |
| K7 | 静态管线下前臂转动，肌肉与皮肤不跟随 | 反射拍里可能看到缝 | 隐藏皮肤、角度 ≤ 20°、验收 ≤ 5 mm；不行走 Q4 的 rig 路 |
| K8 | F-23 速度、F-27–F-29 反射细节、F-14 对侧控制、P14 只读到摘要 / 没读 | 规格行与几句字幕可能要改 | 每条写了退路；施工第 8 步清零 |
| K9 | 脑分区新增 6 个颜色 token 与已有 token 的色觉区分 | 色盲读者分不开 | E-BN1 的 ΔE 约束 + 标注不靠颜色 |
| K10 | 显微工位是示意，可能被读成真实比例 | 误解大小 | `note`、组级 `scale` 的"×N"、detail 第三段、00 第 2 拍字幕 |
| K11 | 头盔与骑车章被读成"鼓励骑电动滑板车" | 与 LTA 年龄规定冲突 | 只写脚踏车、（踢的）滑板车、溜冰；电动设备只在细看说年龄规定 |
| K12 | 反射图是 AI 最容易画错的关系图 | 前后根接反等 | 默认代码绘制 + 几何断言 |

---

## 15. 施工记录（2026-11-15，Claude，分支 `claude/brain-and-nerves`）

### 15.1 来源闸门（G2）与 Gavin 的决定

第一轮来源核（`scripts/anatomy/brain-nerves/provenance.py`，细节 `INVENTORY.md`、`provenance.md`）：

| 结构 | 结论 | 依据（相似变换配准后的采样距离） |
|---|---|---|
| 大脑皮层（每侧 63 个 Destrieux 分区） | **Brainder，确认** | 左侧 12 个大分区各自与 Brainder `lh.pial` 同名分区吻合（平均 0.97–1.78 mm，p95 2.7–5.3 mm），与镜像过来的 `rh` 同名分区明显更差（平均 2.2–4.8 mm，p95 7–21 mm）；右半球是左半球的镜像 |
| 脑桥、延髓、中脑 | **BodyParts3D，确认** | 平均 0.21–0.28 mm |
| Z-Anatomy 小脑（31 个小叶） | **认不出** | 与 BP3D 小脑平均 2.79 mm、p95 8.12 mm；与 Brainder 皮层下结构（Gavin 批准加下）的小脑放到皮层的位置后平均 5.3 mm，重新拟合也不比镜像对照好（2.22 对 2.19 mm） |
| Z-Anatomy 脊髓外形 | **认不出** | BP3D 4.0 只有 35 mm 的颈延交界短段 |
| 颅神经 | Dundee CN（CC BY 4.0）/ Z-Anatomy | 可并入，署名 |
| 内耳、白质纤维束、胼胝体 | 排除 | NC-SA / 许可不明 |

Gavin（2026-11-15）：先下载 Brainder 皮层下结构比对小脑（方案 4），不成就用 **BodyParts3D 4.0 小脑**（一整块、没有小叶细褶）并把**脊髓做成程序化**（方案 2）；任何情况下不用认不出来源的 Z-Anatomy 小脑和脊髓外形。照此施工：小脑 = BP3D FMA67944，用脑桥 + 延髓拟合出的 BP3D 变换摆放；脊髓 = `parts.json` 里沿硬脊膜中心线的 `sweep`（`cord.json`），末端在第一腰椎椎体中部（S5）。

### 15.2 网格与预算

- `public/models/brain-and-nerves.glb`：**2,613,080 B**、**293,328 三角形**、40 个节点（`optimize.ts --topic brain-nerves` 静态路径，meshopt + 量化）；页面绘制见 15.6。
- 皮层不减面（来源每半球约 55 k 三角形，FreeSurfer 表面本已很轻；沟回保持 Brainder 原样）；按叶切开，分界沟按最近的回分面，各叶边界顶点共用、法线按整个半球算（无亮缝）。
- G3 颅骨配准：大脑整体按其中心均匀缩放 **0.985**（只有这一个参数，记在 `organs.json`），穿进骨 1–8 mm 的顶点从 569 降到 188（56,712 个中的 0.33%），其余多为薄骨处最近点判定的伪影（`fit.json`）。没有做非均匀变形。
- 右前臂与手、右前臂神经以肘地标（肱骨远端 30 mm 内最内、最外两点的中点）为界拆开；`withdrawn` 姿态绕该点转 20°（欧拉角近似，肘轴与 x 轴差约 8°）。肱二头肌带直线 `_U` / `_FIBRE`（起点：长头 `.or` 标记，止点：`Biceps brachii muscle.er`）；`optimize_static.ts` 为此放行 `role: muscle` 的 `_FIBRE`，并加了可选 `staticNote`（署名句不再写“无纤维”）。
- 路线：神经段沿网格（3 mm 体素图上的最短路），脑内、脊髓内、神经与脊髓之间是示意曲线，`routes.json` 逐段标 `schematic`。臂丛没有外侧束、内侧束对象，路线在缺口处桥接（≤ 60 mm，按 3 倍代价）。

### 15.3 与 spec 的差别（施工时的决定）

- 尺子接落的档位：引擎的 step 控件最多 24 档，改为 3–20 cm 每 1 cm、22–30 cm 每 2 cm（23 档）；单测钉 5 → 101、20 → 202、26 → 230、30 → 247 ms。
- 反射动作不用循环动画，改为 T5 的 `stop` 绑定姿态（≥ 5 → `withdrawn`，0.35 s 过渡），避免第 0 步时流和手臂错位。
- 不做 E-BN2 跳跃流（可选），用普通流 + 字幕。
- 分区颜色：引擎已有章 / 拍的 `highlight.custom`，第 02 章与第 03 章第 2 拍按零件打开，其余章中性组织色；**未改引擎**。
- 眼标记、内耳标记为程序化小球 / 小环（眼和内耳的网格不用）；胼胝体为程序化弧。
- 封面与 4 张章图从 Codex 提交 `96d9a621` 取来（webp、生成脚本、`illustration-manifest.jsonl`），`topic.yaml` 写 `illustration: brain-and-nerves`、`status: published`；章图在第 04、05、07 章，alt 与图注照 `brain-and-nerves-captions.json`，反射弧与保护层两张 `invert={false}`。生成脚本依赖 `scripts/figures/continental-drift-plate.ts`（从 main 取同一文件）。

### 15.4 事实（读原文；OpenStax 全部不用）

Gavin 指示不引用 OpenStax（其页面禁止生成式 AI 摄取）。原 P4–P9、P30 的事实全部改用其他来源或删去：

| 事实 | 现在的来源 | 处理 |
|---|---|---|
| 中枢 / 周围、神经 = 纤维束、12 / 31 对、背根神经节 | SEER（S4）、QBI（S7） | 保留 |
| 脊髓到第一腰椎、马尾、三层脑膜、蛛网膜下腔有脑脊液 | SEER（S5）；Chudler 说到最后一节胸椎（S27），并列 | 保留，正文写两说 |
| “出生后一两年脊髓不再明显变长” | 没有读到可读的来源 | **删** |
| 中央前回 = 运动、中央后回 = 躯体感觉 | Neuroscience Online（S11） | 保留 |
| 各叶参与的事 | QBI（S8） | “做决定”改“推理和解决问题” |
| 语言偏左（约 96%）、布罗卡区 | Neuroscience Online（S14） | 保留 |
| 胼胝体 | QBI（S10） | 保留 |
| 小脑协调、平衡、约 10% 体积 | QBI（S9）、Neuroscience Online（S13） | “比较指令与反馈”**删**（来源只作推测） |
| 脑桥 / 延髓管呼吸心跳、网状结构与睡醒 | 延髓：S12；脑干整体：S9；网状结构：Faraguna 2019（S38） | “脑桥参与调节呼吸”**删**（只读到延髓） |
| 对侧控制 | S12（皮质脊髓纤维越中线） | 保留，不写“在延髓” |
| 皮层展平约 1 m² | Chudler：约 2,500 cm²（S28） | **改为 2,500 cm²** |
| 神经元结构、郎飞结 | SEER（S6）、QBI（S23） | 保留 |
| 跳跃式传导、越粗越快 | BrainFacts（S21） | 保留 |
| 传导速度 | Whitmer LibreTexts 实验（S20，CC BY-SA 4.0，非 OpenStax）：有髓鞘最快约 150 m/s，无髓鞘很少达 10 m/s | 下限 0.5 m/s **删** |
| 化学突触、约 0.5–1 ms 延迟、间隙 20–40 nm | Neuroscience Online（S22）、QBI（S23） | 改为“约 0.5 到 1 毫秒” |
| 轴突约 1 m | BioNumbers（S24） | 写“从脊柱下端到大脚趾”，不写“运动神经元” |
| 缩手反射：脊髓中间神经元、比上到脑快、信号也上到脑；“消息到脑之前手已缩回”；膝跳单突触 | Neuroscience Online（S25，例子是腿）、Chudler（S26） | 保留；肱二头肌 / 肱三头肌的例子只作模型演示，不当来源事实（“肱三头肌被抑制”**删**） |
| 视神经、听神经入脑桥、听觉皮层在颞横回 | NEI（S30）、S12 | 保留 |
| 脑脊液：脉络丛、每天约 500 mL、总量 125–160 mL | S12、Chudler（S28）、Johanson 2008（S29） | 保留 |
| 头盔：泡沫压扁吸能；未证明防脑震荡 | CPSC（S36） | “硬壳分散撞击”**删** |
| 成人脑质量 1.3–1.4 kg | 无可靠来源 | **删** |

其余来源同 §13：S2、S3 课纲；S15 Azevedo；S16 Raichle；S17 Boyd；S18 Dekker（写“相信 / 答错”）；S19 Nielsen；S31 KKH；S32–S33 NHLBI；S34 LTA（新 URL）；S35 Olivier；S37 Aranha（CC BY-NC-SA 3.0）；S39–S42 模型；S43 BIPM。中文术语照 §0.1 Q10 默认（Gavin 已定）。

### 15.5 下载（全部在 gitignore 的 `scripts/anatomy/cache/`）

| 文件 | 字节 | sha256 |
|---|---:|---|
| `NervousSystem100.fbx` | 53,887,724 | `3ea1aad6…f2b1` |
| `bp3d/partof_BP3D_4.0_obj_99.zip`（+ 三个名表） | 64,888,505 | `9fbc713f…1c97` |
| `brainder/pial_Destrieux_obj.tar.bz2` | 8,952,441 | `b8297630…f55b` |
| `brainder/subcortical_obj.tar.bz2` | 3,382,528 | `a489f40e…b2b2` |

主仓库缓存里没有这些（本 worktree 用自己的缓存，其余 FBX 软链接到主仓库）；合并后要拷过去或重下。

### 15.6 门槛与截图

- `pnpm check`、`pnpm validate`、`pnpm test`（6,958 通过）、`pnpm build` 全绿；`pnpm e2e tests-e2e/brain-and-nerves.spec.ts tests-e2e/smoke.spec.ts --workers=2` 18 通过。
- JS 预算：本主题页 459.48 KB gz（space-scene 上限 477 KB）。
- 绘制（SwiftShader 截图里的 PLATE 读数）：第 05 章 34–39 次、全身视角 50–56 次（静止与运转都 < 80）；三角形约 0.20–0.31 M（含程序化件）。
- `pnpm shoot brain-and-nerves --beats`（en-paper）：41 拍 0 失败；`--layout --keys`：0 个排版问题、按键全过；`--beats --locale zh --theme cinema` 另跑并看过。截图在 `shots/brain-and-nerves/`（gitignore）。
- **仍是 `status: draft`**：发布后 `tests/home.test.ts` 要求每个已发布主题有封面图；封面在 Codex 分支 `codex/img4`，合并时接上 `illustration: brain-and-nerves` 后再改 `published`，并把 `tests-e2e/smoke.spec.ts` 的计数加一（生物 17 → 18、总数 61 → 62、徽章 122 → 124、图版 62；绘图数随封面一起变）。

### 15.7 第一轮审阅修改（2026-11-15）

- 全身拍：`cerebrum` + `hindbrain` 合成一个 `brain-parts` 组，标注“脑”而不是“额叶”；眼球小球调暗（`#bdb3a6`），只在感觉章打开（`sense-markers` 组）；神经改深金色（`#c08a1c`），全身流加粗加密，两套主题都一眼看到网络。
- 脑区：新的饱和区色 token（顶叶改深琥珀 `#b98623` / cinema `#dca43a`，与中性组织区分开）（`tokens.css`、`theme.ts`、docs/08 表、`tests/theme/brain-tokens.test.ts`），脑区拍隐藏颅神经、岛叶和感觉标记（去掉紫色杂块），每区只标一次；第 02 章第 2 拍与第 03 章第 2 拍用章的侧视镜头（原俯后视会把左叶的标注点投到右叶上），整脑离开 HUD。
- 枕叶标注：`labelPoint` 原先在量化前的坐标系，`optimize_static.ts` 量化后换成节点局部坐标，侧视引线落在枕叶上。
- 反射弧重做：手和杯子放在一张小木桌上；放大的脊髓横切面直立浮在臂旁（`cord-inset-leader` 引线 + 环指到第 6 颈椎处真实位置）；感觉 → 中间 → 运动的流从指尖经背根进、腹根出到肱二头肌，连续一条；镜头侧前方，手、桌、臂、插图同屏；插图里的三条流归 `cord-study` 组，插图隐藏时一起隐藏。
- 门槛：`pnpm check`、`validate`、`test`（满载下 7 个其他主题的文件超时，单独重跑 165 个全过）、`build` 全绿；e2e（本主题 + smoke，`--workers=2`）18 通过，smoke 里二战图版号改为 61；JS 459.48 KB gz；`--beats` en-paper 与 zh-cinema 各 41 拍 0 失败，`--layout --keys` 0 问题。

