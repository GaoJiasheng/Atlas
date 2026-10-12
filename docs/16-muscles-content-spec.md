# 16 · 健身肌肉解剖（六主题系列）· 内容施工 spec（v1 草案）

SpaceScene / Model3DStage，paper 默认、cinema 可切。**一个系列六个主题，按身体分区分开做，不做成一个整体**：胸部（模板，先做）、背部、腰腹（核心）、腿部、肩部、手臂。任务：读者看完能在**自己身上**找到每一块肌肉，说清它从哪里长到哪里、纤维朝哪个方向、收缩时把骨头往哪里拉，并能照着卡片做 3–5 个练它的动作（哑铃、杠铃、器械、绳索、自重），知道该在哪里有感觉、最常见的错误是什么。

本主题和已有 SpaceScene 主题最大的不同：**肌肉用真实解剖网格（glb），不用程序化积木**（docs/08 §0 已留口子："`mesh` 只给确实画不出来的复杂有机体（人体器官）"）。所以本文比 spec 模板多三块：网格来源与管线（§2）、第三方模型许可（§3）、跨主题共享的肌肉 / 动作数据（§4）。结构其余部分照 skill `atlas-space-topic` 的 `spec-template.md`，生物写法照 docs/14。

**正文、字幕、动作步骤、来源条目未经 Gavin 定稿不写**（CLAUDE.md）。本文所有"待核"数字和解剖细节是工作值，施工代理读原文核对后才能进数据；核不到就换或删。本文写作时（2026-10-11）做过的网络核实写在 §2.1、§3、§11 里，带日期。

## 0. 决策记录（2026-10-11 起草；第 11–15 条为 Gavin 2026-10-11 定稿，与前文冲突处以定稿为准）

| # | 决定 |
|---|---|
| 1 | 系列：六个独立主题 `muscles-chest` / `muscles-back` / `muscles-core` / `muscles-legs` / `muscles-shoulders` / `muscles-arms`，各自 5–6 章、各自一个 glb；共享一份肌肉表和动作表（§4）。胸部先做，作为后五个的模板 |
| 2 | **网格来源 = Z-Anatomy**（BodyParts3D 的完善版，CC BY-SA 4.0），BodyParts3D 4.0（CC BY 4.0）作交叉核对与 FMA 编号来源（§2）。理由：BodyParts3D 本身缺背阔肌、腹直肌、腹内斜肌、腹横肌、腰方肌、多裂肌（§2.1 核实），背部与腰腹两个主题做不成 |
| 3 | 模型：成年男性参考人体（两套开放数据都只有男性完整肌肉；§2.1）。HUD `note` 写明"男性参考解剖 · 网格 Z-Anatomy / BodyParts3D"；动作示意图用中性体型人物（§10） |
| 4 | 许可分层：glb 与由网格算出的几何数据（附着点坐标、纤维轴）= **CC BY-SA 4.0**；正文、肌肉卡、动作卡文字 = 本站 CC BY-NC-SA 4.0；本系列截图 = CC BY-SA 4.0（§3） |
| 5 | 每个主题的模型 = 本区肌肉（精细、可选、按层分组）+ 邻区肌肉（低模、淡显，次要发力时高亮）+ 动作链上的骨骼 + 全身皮肤轮廓（低模 context，用于"在身上找到它"） |
| 6 | 层 = 组：`superficial` / `intermediate` / `deep` 三组即 LAYERS 开关；"剥层"= 拆开时浅层先外移、再中层（§6.1，引擎 M4） |
| 7 | 动作模式：选一个动作 → 本区骨骼按关键帧（起始 / 中段 / 结束）摆姿态，主动肌 signal 色、协同肌 cold 色、其余淡显；读者面板出动作卡和示意图（§6.5，引擎 M5、M7、M8） |
| 8 | 训练指引写**典型范围**（组 × 次 × 组间休息），每个数字有来源（ACSM 2026、NSCA、SPAG 2022、WHO 2020）；不做个人化计划、不讲饮食补剂、不讲减脂塑形；每张动作卡有"未满 18 岁在合格教练指导下学习"一行（Lloyd 等 2014 国际共识） |
| 9 | 事实纪律同 docs/12 / 14：解剖事实（起止点、作用）以 Gray 1918 + OpenStax A&P 2e 为主；肌电（EMG）研究写"研究显示"并带样本与条件，且注明"肌电高 ≠ 一定长得更多"（Vigotsky 2018）；伤病只讲一般知识 + 免责声明一行，不做诊断 |
| 10 | 不做：品牌器械、明星 / 健美审美标准、体脂与减重、补剂、视频、配音文件、测验。左右一律指**身体自己的**左右 |
| 11 | **Gavin 2026-10-11 定稿**：网格 Z-Anatomy 一源、男性参考体（§13 第 1、2 项）；训练**只写原则不写组数次数**（第 8 条的"典型范围"作废，`dose` 字段改为原则性文字，不带数字），但**动作步骤要详细**；做伤病与体态章（06）；每张动作卡带未成年人一行；动作图用首页同款石墨两格 |
| 12 | 每块肌肉 3–5 个动作，**每个主题的动作清单必须覆盖杠铃、哑铃、徒手三类**（器械 / 绳索可选）；全系列约 57 个 |
| 13 | 动作模式允许**全身姿态**（全身蒙皮），但要克制：不花、不喧宾夺主——动作演示是配角，肌肉本身是主角；镜头、器械、姿态都用最少的元素 |
| 14 | `subject: biology`，`tags: [health, fitness, space]`（学科仍是生物，health 作标签）；中文命名用名词委标准名 + 俗名括注 |
| 15 | 先只做 `muscles-chest`，Gavin 看过再决定是否铺其余五个 |

## 1. 主题与范围

### 1.1 系列结构

| 主题 | slug | 标题 EN / ZH | 区内肌肉（选中、标注） | 邻区（淡显，次要发力） | 骨骼（context 组） | 动作数 |
|---|---|---|---|---|---|---|
| 胸部 ★模板 | `muscles-chest` | The Chest Muscles / 胸部肌肉 | 胸大肌三部、胸小肌、前锯肌、锁骨下肌、肋间外肌、肋间内肌 | 三角肌前部、肱二头肌短头、喙肱肌、肱三头肌三头、背阔肌、腹外斜肌上部、腹直肌上部 | 胸骨、肋骨与肋软骨、锁骨、肩胛骨、肱骨、尺桡骨、胸椎 | 8 |
| 背部 | `muscles-back` | The Back Muscles / 背部肌肉 | 斜方肌三部、背阔肌、菱形肌大 / 小、肩胛提肌、竖脊肌（髂肋肌、最长肌、棘肌）、大圆肌、小圆肌、冈下肌、下后锯肌 | 三角肌后部、肱三头肌长头、臀大肌上缘、腹外斜肌后缘 | 脊柱、肋骨、肩胛骨、锁骨、肱骨、骨盆 | 11 |
| 腰腹（核心） | `muscles-core` | The Core Muscles / 腰腹肌肉 | 腹直肌、腹外斜肌、腹内斜肌、腹横肌、腰方肌、竖脊肌腰段、多裂肌（腰段）、髂腰肌（腰大肌 + 髂肌）、膈肌（context 可选） | 臀大肌、阔筋膜张肌、背阔肌下部、前锯肌下齿 | 腰椎、胸廓下部、骨盆、股骨上段 | 10 |
| 腿部 | `muscles-legs` | The Leg Muscles / 腿部肌肉 | 臀大 / 中 / 小肌、股四头肌四头、腘绳肌三肌（股二头肌长 / 短头、半腱肌、半膜肌）、内收肌群（长 / 短 / 大收肌、股薄肌、耻骨肌）、缝匠肌、阔筋膜张肌与髂胫束、腓肠肌两头、比目鱼肌、胫骨前肌 | 髂腰肌、腹斜肌下缘、腓骨长肌 | 骨盆、骶骨、股骨、髌骨、胫骨、腓骨、足骨 | 13 |
| 肩部 | `muscles-shoulders` | The Shoulder Muscles / 肩部肌肉 | 三角肌三部、冈上肌、冈下肌、小圆肌、肩胛下肌、大圆肌 | 斜方肌上部、胸大肌锁骨部、前锯肌、肱二头肌长头 | 锁骨、肩胛骨、肱骨、胸廓上部、颈椎 | 8 |
| 手臂 | `muscles-arms` | The Arm Muscles / 手臂肌肉 | 肱二头肌长 / 短头、肱肌、喙肱肌、肱三头肌长 / 外侧 / 内侧头、肘肌、肱桡肌、前臂屈肌群（旋前圆肌、桡侧腕屈肌、掌长肌、尺侧腕屈肌、指浅屈肌）、伸肌群（桡侧腕长 / 短伸肌、指伸肌、尺侧腕伸肌） | 三角肌、胸大肌止点、背阔肌止点 | 肩胛骨、肱骨、桡骨、尺骨、手骨 | 11 |

动作合计约 61 个，去掉跨主题共用（硬拉、面拉、窄握卧推、双杠臂屈伸、背伸展）约 **57 个独立动作**。区内肌肉每主题 12–20 个命名零件（按侧计 24–40 个网格）。

### 1.2 读者与口吻

- 读者：想开始力量训练的一般读者（家长、中学生、成人），小学生也能看懂解剖部分。短句，先现象后原理；第一次出现的术语包 `<Term>`。每章正文 EN 200–300 词 / ZH 350–500 字 + 细看 2–4 块（同 docs/14 §1.3）。
- 写法：
  - 解剖用标准名（TA2 英文 / 拉丁，中文用全国科学技术名词审定委员会《人体解剖学名词》），健身俗名放括号（"胸大肌锁骨部（俗称上胸）"）。
  - 每块肌肉固定四件事：**它在哪里**（起止点 + 在身上怎么摸到）、**纤维朝哪里**、**它让哪个关节怎么动**、**怎么练、哪里该有感觉**。
  - 不说"雕刻""塑形""燃脂""完美胸型"；不评价体型；不说"某动作是最好的"，只说"研究显示，在 X 条件下 Y 的肌电更高"。
  - 伤病：只讲一般知识与常见原因，配一行"本页是一般性知识，不是医疗建议；疼痛或受伤请咨询医生或物理治疗师"。
  - 安全：每张动作卡固定一行"第一次做先用自重或轻重量，在合格教练指导下学动作；未满 18 岁在成人监督下练习"（P15）。
- 每个主题"必须讲对的一处"：

| 主题 | 必须讲对的一处（常见误解） |
|---|---|
| 胸部 | 胸大肌是**三部分、纤维方向不同**的一块肌肉；上斜卧推让锁骨部肌电更高，但练不出"孤立的内胸"——纤维从起点长到止点，没有只属于"内侧"的纤维（F-8）；止点腱是**扭转的两层**，下部纤维止得更高（F-2） |
| 背部 | 引体向上和高位下拉的主动肌是背阔肌，不是"手臂"；硬拉时竖脊肌主要是**等长**用力保持脊柱中立 |
| 腰腹 | "腹肌"是四层；**练腹肌不能局部减掉腹部脂肪**（P34）；核心的主要任务之一是**抵抗**躯干的弯曲、伸展和旋转 |
| 腿部 | 腘绳肌与股直肌、腓肠肌是**跨两个关节**的肌肉，所以同一块肌肉在不同动作里长度不同；深蹲时膝盖超过脚尖不必然有害（待核 P30） |
| 肩部 | 三角肌三部分别对应前举、侧举、后拉；肩袖四肌主要的任务是**把肱骨头稳在关节盂里** |
| 手臂 | 肱二头肌也让前臂**旋后**；无论正握反握，肱肌都是屈肘的主力；肱三头肌长头跨过肩关节 |

### 1.3 事实表（胸部主题；其他主题施工时照此格式补）

`TYPICAL` = 来源给出的事实或范围；`DESIGN` = 本模型取的值或做法。P# 见 §11.2。

| # | 项 | TYPICAL（来源） | DESIGN（本模型 / 正文用法） | 待核 |
|---|---|---|---|---|
| F-1 | 胸大肌三部与起点 | 锁骨部：锁骨内侧半前面；胸肋部：胸骨前面与上六肋软骨；腹部：腹外斜肌腱膜（P4、P5、P6） | 三个零件 / 侧；附着点由管线算出再与 Gray 图对照（§2.6） | 肋软骨"1–6"还是"2–6"，按 P4 原文 |
| F-2 | 胸大肌止点 | 肱骨大结节嵴（结节间沟外侧唇）；止腱分前后两层，锁骨部与上部胸肋纤维入前层、止得低，下部纤维扭转入后层、止得高（P4） | 第 02 章一拍近景 + 止点标记；细看画"扭转" | 是：读 P4 原文措辞 |
| F-3 | 胸大肌作用 | 整体：肩关节内收、内旋、水平内收；锁骨部：屈（前举）；胸肋部：从屈位伸（下拉）（P5、P10） | 第 04 章五个动画（§6.4） | 屈伸的角度条件（P10） |
| F-4 | 胸小肌 | 第 3–5 肋 → 肩胛骨喙突；拉肩胛骨向前下（前伸、下沉、下回旋）；用力吸气时提肋（P4、P5） | 中间层 | 起点肋序（3–5 或 2–5） |
| F-5 | 前锯肌 | 上 8–9 肋外面 → 肩胛骨内侧缘的肋面；肩胛骨前伸、上回旋，贴紧胸廓（P4、P5）；无力时"翼状肩胛"（P10） | 中间层；第 03 章侧视 | 肋数 8 或 9 |
| F-6 | 锁骨下肌 | 第 1 肋与肋软骨交界 → 锁骨下面；稳定锁骨（P4） | 深层 | |
| F-7 | 肋间肌 | 肋间外肌提肋（吸气），肋间内肌（骨间部）降肋（用力呼气）（P5） | 深层；呼吸脉动（§6.4） | |
| F-8 | 卧推角度与肌电 | 30 名有训练者、60 % 1RM：上部胸大肌肌电在 30° 最高；中、下部在 0° 最高；> 45° 三角肌前部肌电明显升高、胸大肌表现下降（P20） | 第 05 章细看；动作卡 `evidence` | 读全文核数字 |
| F-9 | 俯卧撑与卧推 | 负荷相当时，俯卧撑与卧推的力量增长相近（P21） | 第 05 章细看 | 是 |
| F-10 | 频率 | 每个主要肌群每周 ≥ 2 天（P12、P16、P17） | 第 05 章正文 | P12 原文措辞 |
| F-11 | 负荷与增肌 | 接近力竭时，低负荷（≤ 60 % 1RM）与高负荷的肌肉增长相近；力量增长高负荷更多（P19） | 第 05 章细看 | 读全文核效应量 |
| F-12 | 训练量 | 每周组数越多，增长越大，至少到每肌群每周 10 组以上（P18） | 动作卡 `dose` 写范围 | 是 |
| F-13 | 次数区间 | 力量 ≤ 6 次、增肌 6–12 次、耐力 ≥ 12 次（NSCA 教材的常用区间，P14） | 动作卡 `dose` | 是：P14 表号与百分比 |
| F-14 | 胸大肌断裂 | 少见，多为 20–40 岁男性，卧推是最常见的受伤动作（P36） | 第 06 章（若做） | 是 |
| F-15 | 模型来源 | BodyParts3D 基于一名成年男性的 MRI（TARO）与解剖图修正（P2）；Z-Anatomy 在其上补全与修整（P1） | 标题块 `note`、第 01 章细看 | 身高等参数 P2 原文 |

### 1.4 增补清单（★ = v1）

| 增补 | 做法 | v1 |
|---|---|---|
| 层与剥层 | 三组 = 三层；拆开时按层错时外移（M4） | ★ |
| X-RAY | 皮肤轮廓 `shell`；X-RAY 透出全部肌肉 | ★ |
| 单块肌肉单显 | 选中 → SOLO：其余淡显（M11） | ★ |
| 起止点标记 + 拉力线 | `sites`（M6）：起点空心圆、止点实心圆、两者之间虚线 = 拉力方向 | ★ |
| 收缩动画 | 沿纤维轴缩短 + 肌腹鼓起 + 纤维条纹移动（M7）+ 关节转动（M5） | ★ |
| 动作模式 | 动作关键帧 + 主动 / 协同高亮 + 动作卡 + 示意图（M8） | ★ |
| 在身上找到它 | 预设 `body`：全身皮肤轮廓淡显、本区实心、选中肌肉 signal 色、镜头取全身 | ★ |
| 横切 | 命名剖切面（胸：T4 水平横切，看胸大肌—胸小肌—肋间肌三层）；矢状切 | ★ |
| 镜像视图 | "照镜子时看到的样子"左右翻转开关 | v2 |
| 跨主题动作索引页 | 按器械 / 动作模式列出全部动作 | v2 |
| 女性参考模型 | 无完整开放数据（§2.1） | v2（数据出现时） |
| 运动中 STATE 读数 | 关节角度随动作显示 | v2（M14） |

## 2. 写实策略：真实网格与管线

### 2.1 来源评估（2026-10-11 核实）

| 来源 | 许可（核实到的原文） | 格式 / 获取（核实） | 肌肉覆盖 | 结论 |
|---|---|---|---|---|
| **BodyParts3D 4.0**（DBCLS，Mitsuhashi 等 2009） | 官方许可页（2025-02-27 更新）：**CC BY 4.0**，署名 "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International"。OBJ 文件内的注释仍写旧的 CC BY-SA 2.1 JP，以官方页为准 | 下载页 HTTP 200；`isa_BP3D_4.0_obj_99.zip` 142,903,898 B、`partof_BP3D_4.0_obj_99.zip` 64,888,505 B（HEAD 200，Last-Modified 2013-05-22）；每个 FMA 概念一个 OBJ，单位 mm，Z 向上；`isa_parts_list_e.txt`（2,905 行：FMA id / BP id / 英文名） | 胸、肩、臂、腿几乎全有，且分部、分左右（胸大肌三部、三角肌三部、斜方肌三部、肱三头肌三头……）。**IS-A 与 PART-OF 两表都没有：背阔肌、腹直肌、腹内斜肌、腹横肌、腰方肌、多裂肌**（grep 为 0） | 交叉核对、FMA 编号；不作主源 |
| **Z-Anatomy**（Gauthier Kervyn 等；App 由 Lluís Vinent Juanico） | GitHub `LluisV/Z-Anatomy` README 与 `Resources/Models/License.txt`：**CC BY-SA 4.0**；要求署名两行："BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan" 与 "Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0" | GitHub（HTTP 200）`Resources/Models/FBX/`：`MuscularSystem100.fbx` 37,343,180 B、`SkeletalSystem100.fbx` 41,339,660 B、`Regions of human body100.fbx` 4,433,260 B、`Joints100.fbx` 9,804,796 B；二进制 FBX 7400（文件头已读），最后提交 2023-03-18；Readme 说"可能不是最新"，最新 `.blend` 在 README 链接的 Google Drive 文件夹（HTTP 200，内有 "The .blend"、`Z-Anatomy_Template.zip`）；z-anatomy.com/atlas 现为 404 | `Collections - Muscles.csv` 列出全部所需肌肉，含上面 BP3D 缺的六块（`Latissimus dorsi muscle.l/.r`、`Rectus abdominis muscle.l`、`Internal abdominal oblique muscle.l`、`Transversus abdominis muscle.l`、`Quadratus lumborum muscle.l`、`Multifidus lumborum muscle.l`）；头 / 部分开；有筋膜（胸腰筋膜三层、胸肌筋膜、阔筋膜、髂胫束、白线）；名字后缀 `.l` / `.r` | **选用**（全部六个主题） |
| `ashemag/human-atlas`（GitHub，2026-09 创建） | 代码 MIT；数据 = BodyParts3D CC BY 4.0（其 ATTRIBUTION.md 也写明 BP3D 许可已更新） | 自定义二进制分块，2,288,268 三角形、约 33 MB；不是 glb | 同 BP3D，缺同样六块 | 只作管线先例（meshoptimizer 每结构 0.2 % 相对误差简化、法线量化） |
| HRA 3D Reference Organ Set（HuBMAP，女性 v1.5） | CC BY 4.0 | glb | human-atlas 的说明：骨骼与肌肉"partial" | 不用；说明女性完整肌肉暂无开放数据 |
| Open Anatomy Project、NIH 3D | 各图谱 / 各条目自定 | Slicer 图谱 / 用户上传 STL | 无全身肌肉系统 | 不用 |
| Sketchfab / TurboSquid "免费"模型 | 逐个模型自定，常为 CC BY 或非开放 EULA | — | 来源不明、多为艺术化 | 不用（无法核实解剖准确性与授权链） |

**结论**：Z-Anatomy 单一来源做六个主题（同一个身体、同一坐标系、同一套左右命名），glb 以 CC BY-SA 4.0 发布。M0 第一步下载 FBX 后逐项核对（§2.2），若某块肌肉网格质量差（破面、穿插），用 BodyParts3D 同一 FMA 概念的 OBJ 替换——两者同源，先验证坐标系能否直接对齐。

### 2.2 管线（`scripts/anatomy/`，不需要 Blender 也能跑）

工具（2026-10-11 核实）：本机已有 `assimp` CLI（`/opt/homebrew/bin/assimp`）和 Blender 5.1.2（可选，headless）；npm：`@gltf-transform/cli` 4.5.1（MIT）、`gltfpack` 1.3.0（MIT）、`obj2gltf` 3.2.0（Apache-2.0）、`meshoptimizer` 1.3.0（MIT）。`fbx2gltf` 包（BSD）安装时会下载二进制，不用。脚本库依赖（`@gltf-transform/core`、`@gltf-transform/functions`、`meshoptimizer`）作为 devDependencies 由主会话预装；CLI 用 `pnpm dlx` 跑，不改 package.json。

| 步 | 脚本 | 做什么 | 产物 |
|---|---|---|---|
| M0 | `fetch.ts` | 下载 Z-Anatomy 三个 FBX + BP3D 两个名表到 `scripts/anatomy/cache/`（gitignore），记录 URL、日期、sha256 | `cache/*.fbx`、`cache/SOURCES.lock.json` |
| M0 | `inventory.ts` | FBX → glb（`assimp export x.fbx x.glb`；失败则 `blender -b -P fbx2glb.py`）；列出全部节点名、三角形数、包围盒、是否封闭（边界边数）、单位与朝向 | `cache/inventory.json`；**核对报告**：§5 每个零件的节点名是否存在、封闭与否、三角形数 |
| M1 | `select.ts --topic chest` | 按 `scripts/anatomy/<topic>/manifest.json`（零件 id → 节点名 `.l/.r`、角色 region / neighbour / bone / skin、三角形预算）抽节点；单位换成米、Y 向上、身体朝 +Z、身体自己的左侧 = +X；整体平移到以本区为中心 | `cache/<topic>.raw.glb` |
| M2 | `bake.ts` | 每块肌肉：①附着区 = 离指定骨骼表面 ≤ 2 mm 的顶点，按骨骼聚类，质心 → 起点 / 止点候选；②纤维坐标 `u`（起点 0 → 止点 1，测地距离插值）与纤维方向 `_FIBRE`（∇u）；③UV（u 沿纤维、v 绕肌腹一圈，让现有 `muscle` 材质的纤维法线贴图顺着纤维走）；④拆开方向 = 肌肉质心 − 本区中心在体表法线上的投影 | 顶点属性 `_U`、`_FIBRE`、`TEXCOORD_0`；`scripts/anatomy/<topic>/attachments.json`（候选，人审） |
| M3 | `rig.ts` | 关节中心：肱骨头、股骨头球面拟合；肘、膝按两髁连线中点；腕、踝、胸锁、肩锁、脊柱节段按骨骼包围盒；生成骨架节点；蒙皮权重：单关节肌 = 近端骨 / 远端骨两块按 `u` 在附着区之间平滑过渡，跨两关节肌（股直肌、腘绳肌、肱二头肌长头、肱三头肌长头、腓肠肌）三块；骨骼刚性绑定 | glTF `skin`（JOINTS_0 / WEIGHTS_0）；`rig.json`（关节名、位置、解剖轴） |
| M4 | `optimize.ts` | 按角色简化（meshoptimizer，**绝对误差**：区内肌肉 0.5 mm、邻区 1.5 mm、骨 1 mm、皮肤 3 mm；锁边界）→ weld → `KHR_mesh_quantization`（three 原生支持）→ `EXT_meshopt_compression`；节点名 = 我们的零件 id（`pectoralis-major-clavicular.l`）；`asset.copyright` 写署名（§3.2） | `public/models/muscles-<topic>.glb`；预算报告（超预算即失败） |
| M5 | `report.ts` | 每个网格简化前后的 Hausdorff 距离、三角形、封闭性；附着点候选与 Gray 图的对照清单 | `scripts/anatomy/<topic>/report.md`（不发布） |

**预算**（每主题）：glb 目标 ≤ 4 MB、上限 8 MB（docs/02 上限 10 MB）；三角形目标 ≤ 0.35 M、上限 0.5 M（区内肌肉每个 4–8 k、邻区 1–2 k、骨 2–6 k、皮肤 15–20 k）。meshopt 解码器在 three-stdlib 2.36.1 里是内联 wasm（`libs/MeshoptDecoder.js`，21,758 B，无任何 URL，已核），**运行时不发外部请求**，可以打开；Draco 仍然关（drei 会去 gstatic 拉解码器）。

**命名与左右**：glb 节点名 = 零件 id + `.l` / `.r`。数据只写左侧零件（身体自己的左 = +X），右侧通过引擎 `bilateral` 的新字段 `mesh` 指向 `.r` 节点（M3），不镜像几何（真实身体不完全对称）。右侧是完整零件（可选、可标注），不另编号，与 docs/06 双侧规则一致。

**骨骼**：来自 Z-Anatomy `SkeletalSystem`（同一身体）；本区动作链上的骨分侧做零件（锁骨、肩胛骨、肱骨、前臂 = 尺桡骨合并、股骨、胫腓骨合并……）以便摆姿态；不动的骨（胸骨、肋骨、椎骨）按材质合并成一两个网格，省绘制。骨骼组可选（起止点讲解时要点骨头），`card` 只显示被肌肉 `connects` 到的骨。

**附着点**：管线只给候选坐标；文字（"起于锁骨内侧半前面"）以 Gray 1918 / OpenStax 为准。人审规则：候选落在文字描述的骨面上 → 采用；不在 → 在 `attachments.json` 里手改坐标并注明。宽附着（前锯肌 8–9 个齿、胸大肌胸肋部沿胸骨一线）用 2–4 个点的折线。

## 3. 许可

### 3.1 分层

| 资产 | 许可 | 理由 |
|---|---|---|
| `public/models/muscles-*.glb` | **CC BY-SA 4.0** | Z-Anatomy 改编物（选取、简化、蒙皮、加属性）必须同许可 |
| 由网格算出的几何数据（`sites` 坐标、纤维轴、关节中心 `rig.json`） | CC BY-SA 4.0 | 同上，按改编物处理（保守） |
| 正文、肌肉卡 / 动作卡文字、名词表、来源说明、字幕 | 本站 CC BY-NC-SA 4.0 | 我们自己的文字，与 glb 是"汇编"关系，不是改编 |
| 动作示意图、首页图版（Codex 生成） | 本站 CC BY-NC-SA 4.0 | 我们的作品；hero 图版若以模型渲染为参考重画，按 CC BY-SA 4.0（保守） |
| 本系列截图（`docs/screenshots/muscles-*/`） | **CC BY-SA 4.0** | 截图同时含模型与我们的标注；我们拥有标注，选 BY-SA 以免与 SA 冲突 |

`LICENSE-CONTENT` 加一段例外（上表第 1、2、5 行与 hero 图版），`THIRD-PARTY-NOTICES.md` 加一节"3D anatomy models"。由主会话改（不是子代理）。

### 3.2 署名原文

```
Muscle and bone meshes: Z-Anatomy — The open source atlas of anatomy, CC BY-SA 4.0
(https://github.com/LluisV/Z-Anatomy), derived from BodyParts3D, © The Database Center
for Life Science (CC BY-SA 2.1 Japan as stated by Z-Anatomy; BodyParts3D is now
CC BY 4.0, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html).
Changes for Atlas: structures selected per body region, simplified, re-rigged,
fibre and attachment data added. This model (muscles-<topic>.glb) is licensed
CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
```

放在：①glb 的 `asset.copyright`；②`THIRD-PARTY-NOTICES.md` 新节（表格一行 + 上面全文）；③每个主题 `data/SOURCES.md` 的来源条目（S# = Z-Anatomy、S# = BodyParts3D，`note` 写改动）；④页面：`topic.yaml` 的 `note` = "Male reference anatomy · meshes Z-Anatomy / BodyParts3D, CC BY-SA 4.0" / "男性参考解剖 · 网格 Z-Anatomy / BodyParts3D，CC BY-SA 4.0"；第 01 章细看一块"这个模型从哪里来"。

## 4. 内容模型（共享肌肉表与动作表）

### 4.1 放哪里

```
src/content/shared/fitness/
  muscles/<region>.json      # 每个区一个文件（chest / back / core / legs / shoulders / arms），肌肉 id 全局唯一
  exercises/<pattern>.json   # 按动作模式分文件：push / pull / hinge / squat-lunge / core / isolation-upper / isolation-lower
  sources.json               # 共享来源，编号 M1…（正文 `<Num s="M3">`、detail `[M3]` 都能解析）
public/illustrations/exercises/<exercise-id>.webp / @2x.webp
src/content/topics/muscles-<topic>/data/
  parts.json                 # 3D 零件（每个肌肉零件写 `muscle: <id>`）
  training.json              # 本主题的动作顺序 + 示例训练课（引用共享动作 id）
  sources.json / SOURCES.md / glossary.json
```

**共享而不是复制**：竖脊肌在背部与腰腹、三角肌后部在背部与肩部、肱三头肌在胸部（协同）与手臂都会出现；动作（硬拉、面拉、窄握卧推、双杠臂屈伸）跨主题。分文件避免并行施工时冲突（§12.2）。构建时 `data.json.ts` 只合并本主题引用到的条目；`pnpm validate` 查交叉引用。

### 4.2 `muscles/<region>.json`

```jsonc
{ "muscles": [{
  "id": "pectoralis-major-clavicular",              // 全局唯一；与 parts.json 的 `muscle` 对应
  "parent": "pectoralis-major",                     // 可选：多头 / 多部肌肉的整体（整体条目也存在，写共同部分）
  "name": { "en": "Pectoralis major, clavicular part", "zh": "胸大肌锁骨部" },
  "common": { "en": "upper chest", "zh": "上胸" },  // 可选：健身俗名
  "latin": "Pars clavicularis musculi pectoralis majoris",
  "fma": "FMA34687", "zAnatomy": "Clavicular head of pectoralis major muscle",
  "regions": ["chest"], "layer": "superficial",     // superficial | intermediate | deep
  "origin":    { "text": {en, zh}, "bones": ["clavicle"], "s": ["M4", "M5"] },
  "insertion": { "text": {en, zh}, "bones": ["humerus"], "s": ["M4"] },
  "fibres": { "arrangement": "convergent",          // parallel | fusiform | convergent | unipennate | bipennate | multipennate
              "direction": {en, zh} },              // "向外下斜行到肱骨"
  "actions": [                                      // 关节 + 动作（枚举，见下）+ 角色
    { "joint": "shoulder", "movement": "flexion", "role": "prime", "s": ["M5"] },
    { "joint": "shoulder", "movement": "horizontal-adduction", "role": "prime", "s": ["M10"] }
  ],
  "feel": {en, zh},                                 // 在身上哪里摸到、该在哪里有感觉
  "mistakes": [{en, zh}, {en, zh}],                 // 练这块肌肉最常见的 2–3 个错误
  "exercises": ["incline-dumbbell-press", "low-to-high-cable-fly", "barbell-bench-press"],   // 有序，3–5 个
  "summary": {en, zh},                              // ≤ 60 字符，也是引线标注的说明行
  "detail": {en, zh},                               // 细看段落，可 [M#]
  "injury": {en, zh}                                // 可选（第 06 章）
}]}
```

- `joint` 枚举：`scapula`（肩胛胸壁）、`shoulder`（盂肱）、`elbow`、`forearm`（桡尺）、`wrist`、`trunk`（胸腰椎）、`neck`、`hip`、`knee`、`ankle`、`ribs`。
- `movement` 枚举：flexion、extension、abduction、adduction、horizontal-abduction、horizontal-adduction、internal-rotation、external-rotation、elevation、depression、protraction、retraction、upward-rotation、downward-rotation、pronation、supination、lateral-flexion、rotation、plantarflexion、dorsiflexion、inversion、eversion、inspiration、expiration、stabilisation。每个 (joint, movement) 在 `rig` 里有一个演示关节角（M5），第 04 章的作用动画由它生成。
- `role`：prime（主动肌）/ assist（协同）/ stabilise（稳定）。

### 4.3 `exercises/<pattern>.json`

```jsonc
{ "exercises": [{
  "id": "barbell-bench-press",
  "name": { "en": "Barbell bench press", "zh": "杠铃卧推" },
  "equipment": "barbell",                 // barbell | dumbbell | machine | cable | bodyweight | band | kettlebell
  "pattern": "horizontal-push",           // horizontal-push | vertical-push | horizontal-pull | vertical-pull | hinge | squat | lunge | carry | anti-extension | anti-rotation | flexion | isolation
  "level": "beginner",                    // beginner | intermediate
  "primary": ["pectoralis-major-sternocostal", "pectoralis-major-clavicular"],
  "secondary": ["deltoid-anterior", "triceps-brachii-lateral", "triceps-brachii-medial", "triceps-brachii-long"],
  "stabilisers": ["serratus-anterior", "rotator-cuff"],
  "setup": {en, zh},
  "steps": [{en, zh}],                    // 4–6 步
  "cues": [{en, zh}],                     // 2–3 条（身体感觉 / 外部提示）
  "mistakes": [{en, zh}],                 // 2 条，各附一句"为什么"
  "dose": [                               // 典型范围，按目标；每条带来源
    { "goal": "strength",    "sets": [2, 5], "reps": [3, 6],   "restSec": [120, 300], "s": ["M14"] },
    { "goal": "hypertrophy", "sets": [2, 4], "reps": [6, 12],  "restSec": [60, 120],  "s": ["M14", "M18"] },
    { "goal": "endurance",   "sets": [2, 3], "reps": [12, 20], "restSec": [30, 60],   "s": ["M14"] }
  ],
  "cautions": [{en, zh}],                 // 什么情况先别做 / 停下（一般性）
  "evidence": [{ "text": {en, zh}, "s": ["M20"] }],   // 可选："研究显示……"（样本、条件）
  "sketch": "barbell-bench-press",        // public/illustrations/exercises/<stem>.webp
  "motion": {                             // 动作模式的关键帧（M8）；关节角按 rig 的解剖轴（度）
    "root": { "rotation": [-90, 0, 0] },  // 躯干整体朝向（卧推 = 仰卧）；可选
    "equipment": { "kind": "barbell", "grip": "pronated", "width": 0.62 },   // 引擎画器械（M8）
    "keys": [
      { "phase": "start", "joints": { "shoulder.l": { "flexion": 85, "abduction": 10 }, "elbow.l": { "flexion": 5 } } },
      { "phase": "end",   "joints": { "shoulder.l": { "horizontal-abduction": 30, "abduction": 60 }, "elbow.l": { "flexion": 95 } },
        "contract": { "pectoralis-major-sternocostal": 0.2 } }   // 0 = 伸长、1 = 最短（驱动 M7）
    ],
    "tempo": [2, 0, 1, 0]                 // 离心 – 底停 – 向心 – 顶停（秒），演示循环用
  },
  "sources": ["M14"]
}]}
```

### 4.4 `parts.json` 与 `training.json` 的连接

- 肌肉零件：`{ "id": "pectoralis-major-clavicular", "mesh": "pectoralis-major-clavicular.l", "bilateral": { "axis": "x", "mesh": "pectoralis-major-clavicular.r" }, "muscle": "pectoralis-major-clavicular", "group": "superficial", "material": { "color": "muscle", "tint": "token:muscle-1" }, "explode": { "dir": [...], "dist": 0.06, "stage": 0 }, "connects": ["clavicle", "humerus"] }`。`summary` / `detail` 不写时取肌肉卡的（M9）。
- 邻区肌肉：同样写 `muscle`（可点开看卡），组 `neighbours`（`card: false`，默认淡显）。
- `training.json`：`{ "exercises": ["barbell-bench-press", …], "session": { "title": {en, zh}, "blocks": [{ "exercise": "barbell-bench-press", "sets": 3, "reps": "6–10", "restSec": 120 }], "note": {en, zh}, "s": ["M12"] } }`——示例课是"一种常见的安排"，不是处方。
- 校验（`pnpm validate`）：零件 `muscle` 存在；每个动作的 `primary` / `secondary` 肌肉存在；本主题列出的每个动作至少一个 `primary` 在本区；`sketch` 文件存在；`motion.joints` 的关节在本主题的 `rig` 里；每个 `dose` 有来源；肌肉 `exercises` 3–5 个。

## 5. 零件表

### 5.1 坐标与尺度（全系列统一）

- 1 场景单位 = 1 m（`units: { modelUnit: "m", scale: 1 }`，比例尺显示 `10 CM`）；Y 向上，身体朝 +Z，身体左侧 = +X；双脚之间地面 y = 0（站姿全身轮廓 1.7–1.8 m，待 M0 读出）。
- 每个主题平移到本区中心附近（胸：胸骨角）；全身皮肤轮廓是 context，引擎取景与最小距离按非 context 零件算（M12）。
- 默认姿态：解剖学站姿（手掌朝前）——**例外**：健身读者更熟悉"手掌朝内、自然站立"，管线 M3 之后提供姿态 `neutral-stand`，第 01 章用它；起止点、作用描述仍按解剖学姿态写（细看说明）。

### 5.2 胸部零件（模板；区内 8 个 × 2 侧 + 邻区 7 个 × 2 侧 + 骨 + 皮肤）

Z-Anatomy 节点名取自 `Collections - Muscles.csv` / `Bones.csv`（M0 用 FBX 实际节点名核对）；FMA 取自 BodyParts3D `isa_parts_list_e.txt`（左 / 右）。

| # | id | 名称 EN / ZH | Z-Anatomy 节点（`.l` / `.r`） | FMA（概念 · L · R） | 组 | 拆开 stage | 三角形 / 侧 |
|---|---|---|---|---|---|---|---|
| 01 | `pectoralis-major-clavicular` | Pec. major, clavicular / 胸大肌锁骨部 | Clavicular head of pectoralis major muscle | 34687 · 34691 · 34690 | superficial | 0 | 6 k |
| 02 | `pectoralis-major-sternocostal` | Pec. major, sternocostal / 胸大肌胸肋部 | Sternocostal head of pectoralis major muscle | 34696 · 79980 · 79979 | superficial | 0 | 8 k |
| 03 | `pectoralis-major-abdominal` | Pec. major, abdominal / 胸大肌腹部 | (Abdominal part of pectoralis major muscle) | 34699 · 45875 · 45874 | superficial | 0 | 3 k |
| 04 | `pectoralis-minor` | Pectoralis minor / 胸小肌 | Pectoralis minor muscle | 13109 · 13376 · 13375 | intermediate | 1 | 4 k |
| 05 | `serratus-anterior` | Serratus anterior / 前锯肌 | Serratus anterior muscle | 13397 · 13399 · 13398 | intermediate | 1 | 8 k |
| 06 | `subclavius` | Subclavius / 锁骨下肌 | Subclavius muscle | 13410 · 13411 · 13412 | deep | 2 | 1.5 k |
| 07 | `external-intercostals` | External intercostals / 肋间外肌 | External intercostal muscles | 9756（不分侧）| deep | 2 | 8 k |
| 08 | `internal-intercostals` | Internal intercostals / 肋间内肌 | Internal intercostal muscles | 9757（不分侧）| deep | 2 | 8 k |
| 09 | `deltoid-anterior` | Deltoid, anterior / 三角肌前部 | Clavicular part of deltoid muscle | 34677 · 34681 · 34680 | neighbours | — | 2 k |
| 10 | `biceps-brachii-short` | Biceps, short head / 肱二头肌短头 | Short head of biceps brachii | 37682 · 37685 · 37684 | neighbours | — | 1.5 k |
| 11 | `coracobrachialis` | Coracobrachialis / 喙肱肌 | Coracobrachialis muscle | 37664 · 37666 · 37665 | neighbours | — | 1 k |
| 12 | `triceps-brachii` | Triceps brachii / 肱三头肌（三头合并） | Long / Lateral / Medial head of triceps brachii（合并） | 37692 / 37694 / 37693 | neighbours | — | 3 k |
| 13 | `latissimus-dorsi` | Latissimus dorsi / 背阔肌 | Latissimus dorsi muscle | （BP3D 无；FMA 待核） | neighbours | — | 3 k |
| 14 | `external-oblique` | External oblique / 腹外斜肌 | External abdominal oblique muscle | 13335 · 13337 · 13336 | neighbours | — | 2 k |
| 15 | `rectus-abdominis` | Rectus abdominis / 腹直肌 | Rectus abdominis muscle | （BP3D 无；FMA 待核） | neighbours | — | 2 k |
| B1 | `clavicle` | Clavicle / 锁骨 | Clavicle | 13321 · 13323 · 13322 | skeleton | — | 1.5 k |
| B2 | `scapula` | Scapula / 肩胛骨 | Scapula | 13394 · 13396 · 13395 | skeleton | — | 4 k |
| B3 | `humerus` | Humerus / 肱骨 | Humerus | 13303 · 23131 · 23130 | skeleton | — | 4 k |
| B4 | `forearm-bones` | Radius & ulna / 桡骨与尺骨 | Radius + Ulna（合并） | 23463 + 23466 | skeleton | — | 4 k |
| B5 | `thorax` | Sternum, ribs & cartilages / 胸骨、肋骨与肋软骨（合并，不分侧） | Body of sternum、Manubrium、Xiphoid、First…Twelfth rib、Costal cartilage… | 7480（rib cage）、7485 | skeleton（context） | — | 30 k |
| B6 | `thoracic-spine` | Thoracic vertebrae / 胸椎（合并） | Thoracic vertebrae T1–T12 | 9139（thoracic vertebral column） | skeleton（context） | — | 15 k |
| C1 | `skin-outline` | Body outline / 体表轮廓（全身） | Z-Anatomy `Regions of human body` 或 BP3D skin FMA7163 | 7163 | context，`shell` | — | 18 k |

- 计数：区内 8 种（6 种分侧 + 2 种不分侧）= 14 个网格；邻区 7 种 × 2 = 14；骨 4 种 × 2 + 2 = 10；皮肤 1。合计 39 个网格，静止约 45–55 次绘制（目标 < 80，上限 100）；三角形约 0.33 M（目标 ≤ 0.35 M）。
- 肋间肌不分侧、做成一个零件（它们是 11 对薄片，分侧没有教学意义）；筋膜（胸肌筋膜、锁胸筋膜）v1 不做零件，在第 03 章细看用文字讲。
- 颜色：区内三层用 `muscle` 材质族 + 三个 tint token（`token:muscle-1/2/3`，浅层最暖、深层最暗，两套主题各一值，**不是血红**，docs/08 §4"软组织用低饱和的粉、赭"）；邻区 `muscle` + 灰调 tint；骨 `tissue` + 象牙 tint；皮肤 `membrane`。

### 5.3 其他五个主题的零件清单（施工时按 5.2 格式展开）

| 主题 | 浅层 | 中层 | 深层 | 邻区 | 骨 |
|---|---|---|---|---|---|
| 背部 | `trapezius-descending`（32557）、`trapezius-transverse`（32556）、`trapezius-ascending`（32555）、`latissimus-dorsi` | `rhomboid-major`（13379）、`rhomboid-minor`（13380）、`levator-scapulae`（32519）、`teres-major`（32549）、`infraspinatus`（32546）、`teres-minor`（32550）、`serratus-posterior-inferior`（13402） | `iliocostalis-lumborum`（22702）、`iliocostalis-thoracis`（22703）、`longissimus-thoracis`（22709）、`spinalis-thoracis`（22765）、`thoracolumbar-fascia`（Z-Anatomy 三层合一，context 可选） | `deltoid-posterior`（34679）、`triceps-brachii`、`gluteus-maximus`、`external-oblique` | 脊柱（合并）、肋、肩胛、锁骨、肱骨、骨盆 |
| 腰腹 | `rectus-abdominis`、`external-oblique`（13335）、`linea-alba`（11336，context） | `internal-oblique`、`erector-spinae-lumbar`（髂肋肌腰部 + 最长肌合并） | `transversus-abdominis`、`quadratus-lumborum`、`multifidus-lumborum`、`psoas-major`（18060）、`iliacus`（22310）、`diaphragm`（13295，可选） | `gluteus-maximus`、`tensor-fasciae-latae`、`latissimus-dorsi`、`serratus-anterior` | 腰椎、骶骨、骨盆、下位肋、股骨上段 |
| 腿部 | `gluteus-maximus`（22314）、`tensor-fasciae-latae`（22423）、`iliotibial-tract`（51048）、`sartorius`（22353）、`rectus-femoris`（22430）、`vastus-lateralis`（22431）、`vastus-medialis`（22432）、`biceps-femoris-long`（45887）、`semitendinosus`（22357）、`gastrocnemius-medial`（45956）、`gastrocnemius-lateral`（45959）、`tibialis-anterior`（22532） | `gluteus-medius`（22315）、`adductor-longus`（22441）、`gracilis`（43882）、`pectineus`（22440）、`semimembranosus`（22438）、`biceps-femoris-short`（45890）、`soleus`（22542） | `gluteus-minimus`（22317）、`vastus-intermedius`（22433）、`adductor-brevis`（22442）、`adductor-magnus`（22443） | `psoas-major`、`iliacus`、`fibularis-longus`（22539） | 骨盆、骶骨、股骨、髌骨、胫腓骨、足 |
| 肩部 | `deltoid-anterior`（34677）、`deltoid-lateral`（34678）、`deltoid-posterior`（34679） | `infraspinatus`、`teres-minor`、`teres-major` | `supraspinatus`（9629）、`subscapularis`（13413） | `trapezius-descending`、`pectoralis-major-clavicular`、`serratus-anterior`、`biceps-brachii-long`（37683） | 锁骨、肩胛骨、肱骨、胸廓上部、颈椎 |
| 手臂 | `biceps-brachii-long`、`biceps-brachii-short`、`triceps-brachii-long`（37692）、`triceps-brachii-lateral`（37694）、`brachioradialis`（38485）、`pronator-teres`（38558 肱头）、`flexor-carpi-radialis`（38459）、`palmaris-longus`（38462）、`flexor-carpi-ulnaris`（38615 / 38616）、`extensor-carpi-radialis-longus`（38494）、`extensor-digitorum`（38500）、`extensor-carpi-ulnaris`（38506） | `brachialis`（37667）、`triceps-brachii-medial`（37693）、`coracobrachialis`、`anconeus`（37704）、`extensor-carpi-radialis-brevis`（38497）、`flexor-digitorum-superficialis`（38469） | （前臂深层 v1 不做：指深屈肌、拇长屈肌等只在细看提） | `deltoid-*`、`pectoralis-major-*` 止点段、`latissimus-dorsi` 止点段 | 肩胛、肱骨、桡骨、尺骨、手骨（合并） |

括号内为 FMA 概念 id（左右 id 在 BodyParts3D 名表里，施工时按 5.2 列全）；没有括号的是 BodyParts3D 缺、只在 Z-Anatomy 有的肌肉。

## 6. 交互（每个主题相同）

### 6.1 层、剥层、X-RAY、单显

- LAYERS：`superficial` / `intermediate` / `deep` / `neighbours` / `skeleton`；关一层 = 那层整体隐藏；`⊙` 单显一层、其余淡显（已有）。
- **剥层**（M4）：EXPLODED 滑块在本系列显示为 PEEL / 剥层；`explode.stage` 0 的零件在滑块 0–0.4 外移，stage 1 在 0.3–0.7，stage 2 在 0.6–1.0；方向 = 管线算出的体表外法线（§2.2 M2），距离 4–8 cm；骨骼与邻区不动。
- X-RAY：只有皮肤轮廓是 `shell`，X-RAY 把它变透明——"透过皮肤看到肌肉"；章 / 拍 `ghost: [superficial]` = 浅层淡显、看中层。
- **单块肌肉单显**（M11）：选中肌肉后检视器里 SOLO 按钮（44 px）= 只留这块肌肉、它连接的骨骼和皮肤轮廓，其余 .12 淡显；ESC 取消。

### 6.2 剖切

`views.cuts`：`transverse-t4`（胸：水平面过 T4，法线 [0,1,0]，看胸大肌—胸小肌—肋间肌—肋骨四层）、`sagittal`（正中矢状，法线 [−1,0,0]）。前提：网格封闭（M0 检查；不封闭的件 `closed: false`，剖切不填剖面）。

### 6.3 起止点与拉力线

`sites`（M6）：选中肌肉时显示它的起点（空心圆）、止点（实心圆）与一条虚线（起点质心 → 止点质心 = 拉力方向）；章 / 拍 `sites: [<muscle id>…]` 可显式打开。点击标记 = 选中对应骨骼。

### 6.4 收缩与作用动画

- 肌肉收缩（M7）：`contract` 动画沿 `_U` 把肌腹向中段缩短（最多 20 %）并沿法线鼓起（最多 8 %，近似体积不变），叠一条沿纤维移动的淡 signal 条纹表示"正在用力"。
- 关节动作（M5）：姿态 / 序列可以写关节角，例如胸大肌水平内收 = `shoulder.l: { horizontal-adduction: 0 → 90 }`；蒙皮的肌肉跟着骨骼变形，被拉长的一侧同时 `contract` 0。
- 胸部第 04 章的六个作用：水平内收（整块）、前举（锁骨部）、从前举位下拉（胸肋部）、内旋（整块）、肩胛前伸（前锯肌 + 胸小肌）、吸气（肋间外肌，胸廓轻微外扩的 `pulse`）。

### 6.5 动作模式

- 章 / 拍 `exercise: { id, phase?: "start" | "end" | "loop" }`（M8）：根节点按 `motion.root` 转到动作体位（卧推仰卧），关节按关键帧缓动；器械（杠铃、哑铃、凳）由引擎程序化画出并挂在手关节上；`primary` 零件 signal 色 tint、`secondary` cold 色、`stabilisers` 原色、其余区内肌肉淡显；`loop` 按 `tempo` 循环（离心慢、向心快）。
- 读者面板 / 检视器出**动作卡**：示意图（两格：起始 / 结束）、器械、主动 / 协同肌芯片（点 = 选中零件）、步骤、提示、错误、典型组次、注意事项、来源。
- 只演示本区关节链（胸部：肩胛、肩、肘），躯干和下肢不动；全身动作（深蹲、硬拉）在腿部 / 背部主题里各自演示本区链，示意图给全身。这一取舍写进细看。

### 6.6 在身上找到它

预设 `body`：镜头取全身（皮肤轮廓淡显 .2），本区肌肉实心，选中肌肉 signal 色，引线标注"在这里"。检视器 FEATURES 页的 `feel` 句子说怎么摸到（例如"一手按在锁骨下方，另一手掌心相对用力推——锁骨下方变硬的就是锁骨部"）。

### 6.7 镜头预设（≤ 6）

| id | label | 用途 |
|---|---|---|
| `front` | FRONT / 正面 | 本区正面，封面构图 |
| `side` | SIDE / 侧面 | 胸：腋下与前锯肌 |
| `back` | BACK / 背面 | 胸：肩胛骨内侧缘（前锯肌止点）|
| `close` | CLOSE / 近景 | 胸：腋前襞与止点 |
| `body` | BODY / 全身 | 在身上找到它 |
| `exercise` | EXERCISE / 动作 | 动作模式的取景（按 `motion.root` 自动调整） |

## 7. 章节（每个主题 5–6 章）

### 7.0 通用章节骨架

| # | id 模式 | 标题 EN / ZH 模式 | 内容 | view / 模式 |
|---|---|---|---|---|
| 01 | `<region>-at-a-glance` | The X at a glance / 一眼看 X | 全身中的位置、三层、每块肌肉一句话、骨骼支架 | assembled，`body` → `front`；剥层一拍 |
| 02 | `superficial-muscles` | The surface layer / 浅层 | 浅层逐块：起止点、纤维、怎么摸到 | 浅层单显 + sites |
| 03 | `deep-muscles` | Underneath / 深层 | 中层与深层；横切 | ghost 浅层、剖切 |
| 04 | `how-they-move-you` | How they move you / 它们怎么让你动 | 每块肌肉的作用动画 | 姿态 + 收缩 |
| 05 | `training-the-<region>` | Training the X / 怎么练 X | 动作卡、提示、错误、示例训练课 | 动作模式 |
| 06（可选） | `injuries-and-posture` | Injuries and posture / 伤病与体态 | 常见伤、原因、一般预防；免责声明 | assembled + sites |

### 7.1 胸部各章（节拍）

**01 `chest-at-a-glance`**（5 拍）：① `body` 全身淡显、胸部实心（"胸部肌肉在这里"）② `front` 三层组标注 ③ 剥层 0.7（三层依次外移）④ 只留骨骼（胸骨、肋、锁骨、肩胛、肱骨），标 `group:skeleton` ⑤ 回到完整，8 块肌肉一句话标注（分两拍各 ≤ 6 个）。细看：模型从哪里来（§3.2）；"左右指身体自己的"。

**02 `pectoralis-major`**（5 拍）：① 胸大肌三部单显 + 组标注 ② 纤维方向（三部各一拍收缩条纹）③ `close` 止点扭转 + sites（F-2）④ `body` + feel（"掌心相对用力推"）⑤ 三部各自的作用一句话。细看：止腱两层；"内胸"误解（F-8）。

**03 `under-the-pecs`**（5 拍）：① ghost 浅层，标胸小肌 + 喙突 sites ② `side` 前锯肌八九个齿 ③ `back` 前锯肌止于肩胛骨内侧缘（肩胛骨淡显）④ 锁骨下肌 + 肋间肌 ⑤ 横切 `transverse-t4` 四层。细看：翼状肩胛（一般知识）；肋间肌与呼吸。

**04 `how-the-chest-moves-you`**（6 拍）：§6.4 的六个作用各一拍（姿态 + 收缩），字幕说"哪块肌肉缩短、骨头往哪里动"。细看：胸大肌在不同肩角度下作用方向会变（锁骨部举、胸肋部拉）。

**05 `training-the-chest`**（5 拍）：① 杠铃卧推 start → end ② 上斜哑铃卧推（锁骨部高亮）③ 俯卧撑 ④ 哑铃飞鸟（肘微屈、水平内收）⑤ 俯卧撑加（push-up plus，前锯肌）。正文：每周 ≥ 2 次（F-10）、次数区间（F-13）、示例训练课表（`training.json`）。细看：卧推角度研究（F-8）、高低负荷（F-11）、肌电 ≠ 增长（P33）。

**06 `chest-injuries-and-posture`**（可选，4 拍）：① 胸大肌止点（断裂一般知识，F-14）② 双杠臂屈伸过深时肩前部受力（一般知识）③ "圆肩"与胸小肌：证据有限，写清楚（待核 P37）④ 免责声明拍。

### 7.2 胸部动作（8 个）

| id | EN / ZH | 器械 | primary | secondary | 示意图 |
|---|---|---|---|---|---|
| `barbell-bench-press` | Barbell bench press / 杠铃卧推 | barbell + bench | 胸大肌胸肋部、锁骨部 | 三角肌前部、肱三头肌 | 侧视，杠在胸中下部 / 手臂伸直 |
| `incline-dumbbell-press` | Incline dumbbell press / 上斜哑铃卧推（30°） | dumbbell + bench | 胸大肌锁骨部 | 胸肋部、三角肌前部、肱三头肌 | 3/4 前视 |
| `push-up` | Push-up / 俯卧撑 | bodyweight | 胸大肌 | 三角肌前部、肱三头肌、前锯肌、腹直肌（稳定） | 侧视 |
| `dumbbell-fly` | Dumbbell fly / 哑铃飞鸟 | dumbbell + bench | 胸大肌（水平内收） | 三角肌前部、肱二头肌短头（稳定） | 正视，弧线箭头 |
| `cable-fly` | Cable fly (high-to-low / low-to-high) / 绳索夹胸 | cable | 胸大肌（低到高偏锁骨部） | 三角肌前部 | 3/4 视 |
| `chest-dip` | Chest dip / 双杠臂屈伸（前倾） | bodyweight（双杠） | 胸大肌胸肋部、腹部 | 肱三头肌、三角肌前部、胸小肌 | 侧视 |
| `machine-chest-press` | Machine chest press / 器械推胸 | machine | 胸大肌 | 三角肌前部、肱三头肌 | 侧视 |
| `push-up-plus` | Push-up plus / 俯卧撑加（顶端肩胛前伸） | bodyweight | 前锯肌 | 胸小肌、胸大肌 | 侧视，肩胛骨移动箭头 |

## 8. HUD

- 标题块：DOC-ID 自动；标题见 §1.1；`note` 见 §3.2；规格行（≤ 4，tag `design`）：`MUSCLES 8 · 16 SIDES`、`LAYERS 3`、`EXERCISES 8`、`MODEL Z-ANATOMY · MALE REF.`。
- 右上卡（零件链路）：列 = 浅 / 中 / 深 + 骨骼；`connects` = 肌肉 → 起止骨骼；邻区、皮肤 `card: false`。名称太长（"PECTORALIS MAJOR, CLAVICULAR"）→ 需要 `short` 字段（M13）："PEC MAJ · CLAV"。
- 底部三面板：ARCHITECTURE = 正面立面（`views.section: xy`）、比例尺 10 CM；DETAIL = 选中肌肉（编号、名称、层、起止骨骼、一行说明）；STATE = 无 telemetry 时的默认读数（动作模式时显示当前动作与阶段，M14 可选）。
- 检视器（M9）：选中肌肉时四页 FEATURES（位置、起止、纤维、怎么摸到）/ ACTIONS（关节 × 动作 × 角色，每行一个"演示"按钮 = 播放该作用的姿态）/ TRAINING（feel、mistakes、每周频率一句）/ EXERCISES（动作芯片，点 = 进入动作模式并打开动作卡）。

## 9. 引擎缺口（已查 `schema.ts`、`GltfSource.tsx`、`PartNode.tsx`、docs/06；未改）

优先级：必须 / 应该 / 可选。

| # | 优先级 | 缺口 | 现状 | 最小方案 | 退路 |
|---|---|---|---|---|---|
| M1 | 必须 | glb 加载加固 | `useGLTF(url, false, false)`：Draco、meshopt 都关；无加载进度，mesh-only 零件在 glb 到达前不显示；找不到节点只 `console.warn` | 打开 meshopt（three-stdlib 内联解码器，无网络）；舞台中央 hairline 进度条（drei `useProgress` 或 loader `onProgress`）+ 失败提示（双语）；`pnpm validate` 查 glb 存在、≤ 8 MB、`asset.copyright` 非空；缺节点改为构建期错误（validate 读 glb 节点表） | 不压缩 + 量化（约 2× 体积） |
| M2 | 必须 | mesh 零件的材质 | 材质来自 `primitive.color`，mesh-only 零件没地方写 | 零件级 `material?: { color, tint }`（mesh 零件必填）；glb `extras.closed` → 剖切是否填剖面 | 给 mesh 零件写一个不渲染的占位 primitive（丑） |
| M3 | 必须 | 真实左右网格 | `bilateral` 只会镜像几何 | `bilateral.mesh: "<node>.r"`：双胞胎用该节点、不镜像；其余双侧规则不变；`axis: "x"` | 左右写成两个独立零件（编号翻倍、卡片拥挤） |
| M4 | 必须 | 按层剥开 | `explode` = 方向 × 距离 × 全局值，所有零件同步 | `explode.stage?: 0–3`：分段斜坡（§6.1）；`views.explodeLabel`（PEEL / 剥层） | 只用 LAYERS 开关逐层关 |
| M5 | 必须 | 蒙皮与关节姿态 | GltfSource 只取 `geometry` 自建 `Mesh`，丢掉 skin；姿态只能刚体转零件 | GltfSource 保留 `SkinnedMesh` 与骨架（每个零件仍一个材质、一次绘制）；`parts.json` 顶层 `rig: { joints: { "shoulder.l": { node, axes: { flexion: [x,y,z], abduction: …, rotation: … } } } }`（管线写 `rig.json`，构建期合并）；姿态 / 序列的条目可以写 `joint:<name>`；`MAX_POSES` 8 → 32；引线锚点用蒙皮后包围盒（每 N 帧算一次）；X-RAY / 剖切 / 淡显 shader 补丁加 `#include <skinning_vertex>` | 姿态时肌肉淡显、只动骨骼（"关节示意"），肌肉只做收缩条纹 |
| M6 | 必须 | 起止点标记 | 无 | `sites: [{ muscle, kind: origin \| insertion, bone, points: [[x,y,z]…] }]`；选中肌肉或章 / 拍 `sites` 时画：空心 / 实心小圆（屏幕恒定大小，HUD 墨色）+ 起止质心之间的虚线；跟着蒙皮骨骼走 | 用 `labels` 标骨骼代替 |
| M7 | 必须 | 沿纤维的收缩 | `pulse` 只能整体缩放 | 动画 kind `contract { target, amount, bulge, hz }` + 姿态 / 动作关键帧的 `contract` 值；顶点着色器读 `_U`、`_FIBRE`（管线烘焙）：缩短 + 鼓起；片元叠移动条纹（signal，≤ .35） | `pulse` 向量缩放（不沿纤维，近看假） |
| M8 | 必须 | 动作模式 | 无 | 章 / 拍 `exercise: { id, phase }`；读共享 `exercises` 的 `motion`（根旋转、关节关键帧、`contract`、`tempo`）；`highlight`（primary signal、secondary cold，见 M11）；程序化器械零件（杠铃 = cylinder + lathe 杠片、哑铃、凳、绳索把手）挂在 `hand.l/.r` 关节；动作卡渲染在 reader 的 aside 和检视器；`pnpm shoot --beats` 认识这种拍 | 用 2–3 个固定 pose 拍 + 正文表格代替动作卡 |
| M9 | 必须 | 肌肉卡检视器 | 检视器只有 summary / detail / connects | 零件 `muscle` 链接 → 检视器四页（§8）；没有 `summary` / `detail` 时取肌肉卡；手机上同样四页（底部抽屉） | detail 里写长文（不可扫读） |
| M10 | 必须 | 共享数据 | 内容集合只认 `topics/<slug>/` | `src/content/shared/fitness/**` 的 zod schema、加载器、`data.json.ts` 按引用合并；来源编号 `M#` 在 `<Num s>`、`[M#]`、来源浮层、`sources-md.ts` 都能解析；validate 查交叉引用（§4.4） | 脚本把共享条目复制进每个主题（生成文件，validate 查是否最新） |
| M11 | 应该 | 单块单显与高亮集 | 单显只到组；`isolate` 显示同组 | store `solo` 可以是零件 id；章 / 拍 `highlight: { signal: [], cold: [] }`（tint 叠加，不改材质族） | 用 `ghost` 列出其余全部零件 |
| M12 | 应该 | 取景半径排除 context | 最小镜头距离 = 0.9 × 全部零件半径（docs/14 §14.4 遇到过） | 半径只算非 context 零件；`body` 预设显式给镜头 | 皮肤轮廓只在 `body` 拍 `hide` 之外出现 |
| M13 | 应该 | 零件短名 | 卡片按列宽截断（docs/14 §15 已知差距） | 零件 / 肌肉 `short: {en, zh}`，卡片与引线优先用它 | 卡片只列组标注 |
| M14 | 可选 | 动作读数、镜像、系列 | STATE 只跟 RUN | telemetry `follow: "exercise"` 显示阶段与关节角；镜像开关；`topic.yaml` `series: muscles` + 系列内互链、首页目录按系列分节；跨主题动作索引页 | v2 |

性能：每个零件一个材质一次绘制；骨骼不动的部分合并；目标静止 < 80、动作模式（加器械 2–4 个）< 90、上限 100；三角形 ≤ 0.5 M；手机（390 × 844）同一模型，`dpr` 规则不变；SkinnedMesh 的蒙皮在 GPU，30–40 个网格无压力（SwiftShader 下测）。

### 9.1 `atlas-space-topic` 模板缺什么（本系列做完后补进 skill）

1. 允许真实网格的条件与流程（`references/anatomy-mesh-runbook.md`：来源核实、管线、预算、人审附着点）；现在 SKILL.md 写的是"只用程序化几何"，需要加例外条款。
2. 第三方模型许可分层与署名位置（§3）。
3. 零件之外的内容模型：肌肉卡、动作卡、跨主题共享数据、来源命名空间。
4. 蒙皮、关节角姿态、收缩、动作模式（引擎 M5–M8）。
5. 健身 / 健康类写作规则：剂量范围带来源、肌电研究的写法、免责声明、未成年人一行。
6. 系列主题（同一模板六次）：manifest 驱动、并行文件归属。
7. 示意图（两格动作图）的生成与验收。

## 10. 图片（外包 Codex）

### 10.1 数量

| 类 | 数量 | 规格 | 生成方式 |
|---|---|---|---|
| 首页图版（每主题一张，`illustration: muscles-<region>`） | 6 | 现有 `scripts/illustrate.ts` 方形 1024，石墨、透明底 | **以我们的模型渲染为参考重画**：`pnpm shoot <topic> --layout` 的 hero-clean → `codex exec -i hero.png "redraw as graphite plate…"`，保证解剖不走样 |
| 章节卡片图（每主题正 / 背两张区域图，可选） | 6–12 | 同上 | 同上 |
| 动作示意图 | ~57（胸 8） | 1536 × 1024 原图，两格（左 START、右 END）；处理成 `public/illustrations/exercises/<id>.webp` 1200 × 800 与 `@2x` | 文字 prompt + 风格说明（10.2）；`illustrate.ts` 加 `exercise` 子命令（不进首页 manifest，预算 ≤ 80 KB / ≤ 200 KB） |

### 10.2 风格说明（所有动作图共用，写进 `illustrate.ts`）

> STYLE: fine graphite pencil drawing, 19th-century scientific plate manner, cross-hatching, clean contour lines, grey graphite only; NO colour, NO background, NO text, NO labels, NO frame; transparent background. LAYOUT: two panels side by side on a 3:2 canvas, left = START position, right = END position, same camera in both, a thin curved arrow between panels showing the movement path. FIGURE: one neutral adult athlete of average build (not bodybuilder, not slim model), short hair, plain fitted T-shirt and shorts, plain shoes, **no face detail** (simple contour), anatomically correct hands (five fingers) and joints, no muscles drawn on the skin. EQUIPMENT drawn accurately and to scale: Olympic barbell with round plates and collars / round dumbbells / flat or adjustable bench (state angle) / cable column with D-handle / parallel bars. VIEW: the view that best shows the working joint angles (named per exercise). SAFETY: neutral spine, feet planted, no unsafe positions.

每个动作的 SUBJECT 一句由 `exercises.json` 生成：体位、握法（正 / 反 / 对握）、握距、起止关节角（取自 `motion.keys`）、视角。

### 10.3 验收循环

1. 自动：透明底、灰度（`illustrate.ts` 已去色）、尺寸与体积、两格分隔（中线列 alpha 低）。
2. 主会话（Opus）看每主题的拼版（contact sheet）：器械对不对（杠片、哑铃形状、凳角度）；握法与步骤一致；起止关节角与 `motion.keys` 大致一致（卧推底部前臂接近竖直、杠在胸中下部）；手指、四肢数目；两格是同一个人；没有不安全姿势（硬拉圆背、深蹲膝内扣）；没有文字。
3. 不合格 → 改 prompt 重画，最多 3 次；仍不合格写进 spec 已知差距并换视角或单格图。
4. 图版类：把 Codex 结果与渲染叠放（50 % 透明）检查肌肉轮廓位置，偏差明显的重画。

### 10.4 外包分工

| 交给 | 做什么 |
|---|---|
| **Codex**（`codex exec`） | M0–M5 管线脚本草稿（Opus 审查后合入）；全部图片；`exercises/*.json` 英文初稿（步骤、提示、错误——Opus 逐条核对来源后定稿）；中文名对照表初稿（按名词委标准，Opus 抽查）；`attachments.json` 与 Gray 图的对照清单 |
| **Opus** | 引擎 M1–M13；`parts.json`、`rig` 关节角、`sites` 人审；全部定稿文字（肌肉卡、动作卡、正文、细看）与来源核对；视觉轮次 |
| **Sonnet** | 节拍字幕；`pnpm shoot` 截图审计、漏标、手机；来源格式（`sources-md.ts`）；收尾与代码审计 |

## 11. 参考图与来源计划

### 11.1 参考图（`scripts/geo/muscles-<topic>/refs/`，gitignore，不发布）

Gray 1918 的肌肉插图（Wikimedia Commons "Gray's Anatomy plates" 分类，公有领域，HTTP 200）：胸部用 Gray 的胸大肌、胸小肌、前锯肌、肋间肌图与腋窝图；施工时逐张列文件名、Commons 页、看什么。BodyParts3D 同一 FMA 的 OBJ 渲染作为第二参照（同源，查网格错位）。

### 11.2 来源计划（≥ 30；共享来源编号 `M#`，主题专属 `S#`）

"已核"= 2026-10-11 打开过（HTTP 200 或看到书目）；"待核"= 只看到二手或被反爬挡住，施工时用浏览器读原文。

| P# | 内容 | 来源 | 状态 | 用于 |
|---|---|---|---|---|
| P1 | 网格 | Z-Anatomy, github.com/LluisV/Z-Anatomy（CC BY-SA 4.0；`Resources/Models/License.txt`） | 已核 | 模型、§3 |
| P2 | 网格交叉核对、FMA 名表 | Mitsuhashi N. 等 2009, BodyParts3D, *Nucleic Acids Res.* 37: D782–D785, doi:10.1093/nar/gkn613；dbarchive.biosciencedbc.jp/en/bodyparts3d（CC BY 4.0） | 已核（数据页）；论文页 403 待核 | 模型、F-15 |
| P3 | 解剖概念 id | Foundational Model of Anatomy（Rosse & Mejino 2003, *J. Biomed. Inform.* 36: 478）| 待核 | `fma` 字段 |
| P4 | 起止点、止腱结构 | Gray H. 1918, *Anatomy of the Human Body*, 20th ed., Lewis（Bartleby 在线版，公有领域） | 首页已核；章节页反爬待核 | F-1、F-2、F-4–F-6，全部肌肉卡 |
| P5 | 起止点、作用、作用表 | Betts J.G. 等, OpenStax *Anatomy and Physiology 2e*, ch. 11（**CC BY-NC-SA 4.0**，页面已核） | 已核 | 全部肌肉卡 |
| P6 | 名称（英 / 拉丁） | FIPAT 2019, *Terminologia Anatomica* 2nd ed. | 站点未连通，待核 | `latin` |
| P7 | 中文名 | 全国科学技术名词审定委员会《人体解剖学名词》（术语在线 termonline.cn，已连通） | 待核逐词 | `name.zh` |
| P8 | 中文解剖教材 | 丁文龙、刘学政主编《系统解剖学》第 9 版，人民卫生出版社 2018 | 待核 | 中文表述交叉核对 |
| P9 | 临床解剖（开发对照，不引原文） | Moore K.L. 等, *Clinically Oriented Anatomy* | 待核 | 附着点人审 |
| P10 | 运动学（作用随关节角变化） | Neumann D.A., *Kinesiology of the Musculoskeletal System*, 3rd ed. | 待核 | F-3、F-5、第 04 章 |
| P11 | 网上参考（只作索引，不引） | TeachMeAnatomy（已连通）、Kenhub、Physiopedia（许可按页而定，反爬待核） | 索引 | — |
| P12 | 训练总原则 2026 | ACSM Position Stand: Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews, *MSSE* 2026（Phillips 主持；卷期页待核） | 待核 | F-10、`dose` |
| P13 | 训练总原则 2009 | ACSM 2009, Progression models in resistance training for healthy adults, *MSSE* 41(3): 687–708 | 待核 | 对照 P12 |
| P14 | 技术与次数区间 | Haff G.G. & Triplett N.T. 编, *Essentials of Strength Training and Conditioning*, 4th ed., NSCA / Human Kinetics 2016 | 待核 | F-13、步骤与提示 |
| P15 | 未成年人 | Lloyd R.S. 等 2014, Position statement on youth resistance training: the 2014 International Consensus, *BJSM* 48(7): 498–505, doi:10.1136/bjsports-2013-092952 | 书目已核 | 安全行 |
| P16 | WHO | WHO 2020, *Guidelines on physical activity and sedentary behaviour*（页面已核） | 已核 | F-10 |
| P17 | 新加坡 | HPB & SportSG 2022, Singapore Physical Activity Guidelines (SPAG)（HPB 新闻页已核） | 待核原文 | F-10、本地视角 |
| P18 | 训练量 | Schoenfeld B.J., Ogborn D. & Krieger J.W. 2017, Dose-response relationship between weekly resistance training volume and increases in muscle mass, *J. Sports Sci.* 35(11): 1073–1082 | 待核 | F-12 |
| P19 | 负荷 | Schoenfeld B.J. 等 2017, Strength and hypertrophy adaptations between low- vs. high-load resistance training, *JSCR* 31(12): 3508–3523（PubMed 28834797） | 待核全文 | F-11 |
| P20 | 卧推角度 | Rodríguez-Ridao D. 等 2020, Effect of five bench inclinations on the EMG activity of the pectoralis major, anterior deltoid, and triceps brachii, *IJERPH* 17(19): 7339（PMC7579505，已连通） | 已核摘要 | F-8 |
| P21 | 俯卧撑 vs 卧推 | Calatayud J. 等 2015, Bench press and push-up at comparable levels of muscle activity results in similar strength gains, *JSCR* 29(1): 246–253 | 待核 | F-9 |
| P22 | 引体向上 | Youdas J.W. 等 2010, Surface EMG activation patterns and elbow joint motion during a pull-up, chin-up, or Perfect-Pullup, *JSCR* 24(12): 3404–3414 | 待核 | 背部 |
| P23 | 高位下拉握法 | Lusk S.J. 等 2010, Muscle activation during the lat pull-down with different grip widths and positions, *JSCR* 24(7): 1895–1900 | 待核 | 背部 |
| P24 | 腹肌动作 | Escamilla R.F. 等 2006, EMG analysis of traditional and nontraditional abdominal exercises, *Phys. Ther.* 86(5): 656–671 | 书目已核 | 腰腹 |
| P25 | 核心 | Escamilla R.F. 等 2010, Core muscle activation during Swiss ball and traditional abdominal exercises, *JOSPT* 40(5): 265–276 | 书目已核 | 腰腹 |
| P26 | 腰背 | McGill S.M. 2010, Core training: evidence translating to better performance and injury prevention, *Strength Cond. J.* 32(3): 33–46 | 待核 | 腰腹 |
| P27 | 臀推 vs 深蹲 | Contreras B. 等 2015, A comparison of gluteus maximus, biceps femoris, and vastus lateralis electromyographic activity in the back squat and barbell hip thrust exercises, *J. Appl. Biomech.* 31(6): 452–458（PubMed 26214739；13 名有训练女性，10RM） | 摘要已核 | 腿部 |
| P28 | 臀推 vs 深蹲（增长） | Plotkin D.L. 等 2023, Hip thrust and back squat training elicit similar gluteus muscle hypertrophy…, *Front. Physiol.* 14: 1279170 | 待核 | 腿部 |
| P29 | 推举体位 | Saeterbakken A.H. & Fimland M.S. 2013, Effects of body position and loading modality on muscle activity and strength in shoulder presses, *JSCR* 27(7): 1824–1831 | 书目已核 | 肩部 |
| P30 | 深蹲膝前移 | Fry A.C. 等 2003, Effect of knee position on hip and knee torques during the barbell squat, *JSCR* 17(4): 629–633 | 待核 | 腿部"必须讲对" |
| P31 | 肩袖动作 | Reinold M.M. 等 2004, EMG analysis of the rotator cuff and deltoid musculature during common shoulder external rotation exercises, *JOSPT* 34(7): 385–394 | 待核 | 肩部 |
| P32 | 肱三头肌各头 | Kholinne E. 等 2018, The different role of each head of the triceps brachii muscle in elbow extension, *Acta Orthop. Traumatol. Turc.* 52(3): 201–205 | 待核 | 手臂 |
| P33 | 肌电的解读 | Vigotsky A.D. 等 2018, Interpreting signal amplitudes in surface electromyography studies in sport and rehabilitation sciences, *Front. Physiol.* 8: 985 | 待核 | 所有 `evidence` 的限定语 |
| P34 | 局部减脂 | Vispute S.S. 等 2011, The effect of abdominal exercise on abdominal fat, *JSCR* 25(9): 2559–2564 | 待核 | 腰腹"必须讲对" |
| P35 | 增肌机制 | Schoenfeld B.J. 2010, The mechanisms of muscle hypertrophy and their application to resistance training, *JSCR* 24(10): 2857–2872 | 待核 | 第 05 章细看 |
| P36 | 胸大肌断裂 | ElMaraghy A.W. & Devereaux M.W. 2012, A systematic review and comprehensive classification of pectoralis major tears, *J. Shoulder Elbow Surg.* 21(3): 412–422 | 待核 | F-14 |
| P37 | 体态与胸小肌 | 施工时找系统综述（胸小肌长度与肩胛运动的证据）；找不到可靠综述就不写"圆肩"一拍 | 待找 | 第 06 章 |
| P38 | 力量训练与伤害预防 | Lauersen J.B. 等 2014, The effectiveness of exercise interventions to prevent sports injuries, *BJSM* 48(11): 871–877 | 待核 | 第 06 章 |
| P39 | 举重类运动伤害流行病学 | Keogh J.W.L. & Winwood P.W. 2017, The epidemiology of injuries across the weight-training sports, *Sports Med.* 47(3): 479–501 | 待核 | 第 06 章 |
| P40 | 动作目录（只作索引） | ExRx.net Exercise Directory、ACE Exercise Library（已连通） | 索引 | 动作清单查漏 |

## 12. 施工顺序、分工与验收

### 12.1 胸部模板（先做，串行关键路径）

| 步 | 内容 | 谁 | 文件归属 | 完成标准 |
|---|---|---|---|---|
| 0 | Gavin 定稿本 spec（§13）；主会话预装 devDependencies（`@gltf-transform/core`、`@gltf-transform/functions`、`meshoptimizer`），`.gitignore` 加 `scripts/anatomy/cache/` | 主会话 | `package.json`、`.gitignore` | — |
| M | M0 下载与盘点（**先看网格质量再继续**）→ M1–M5 胸部 glb | Codex 写脚本，Opus 审查 + 跑 | `scripts/anatomy/**`、`public/models/muscles-chest.glb` | 盘点报告：§5.2 每个节点存在、封闭性、三角形；glb ≤ 4 MB、≤ 0.35 M 三角形；附着点候选清单 |
| E | M1–M4、M6、M9、M10 先（数据形状），再 M5、M7、M8、M11–M13；单测；docs/06 SpaceScene 节加"真实网格与人体肌肉" | Opus（引擎），与 M、I 并行 | `src/engines/space-scene/**`、`src/content/schema/**`、`src/content/config.ts`、`scripts/validate*`、`src/pages/topics/[slug]/data.json.ts`、docs/06 | aircon / grasshopper / sample-space 截图不回归；sample-space 加一个 mesh + 蒙皮小例 |
| I | 胸部 8 张动作图 + 1 张图版（图版在 D 之后，以渲染为参考） | Codex，主会话验收 | `public/illustrations/exercises/*`、`scripts/illustrate.ts`（exercise 子命令） | §10.3 |
| D | 脚手架 `muscles-chest`；`parts.json`（§5.2）、`rig`、`sites` 人审、姿态、剖切、预设；`training.json`；章节 state 存根 | Opus | `src/content/topics/muscles-chest/**`、`src/content/shared/fitness/muscles/chest.json`（结构） | `pnpm validate` 绿；R2 与 Gray 图并排 |
| T | 共享来源 `M#`；肌肉卡与动作卡定稿（Codex 英文初稿 → Opus 核来源、写中文）；六章正文与细看（先给 Gavin 第 02 章样章） | Opus | `shared/fitness/**`、`muscles-chest/chapters/*.mdx`、`data/sources.json`、`glossary.json` | 每个数字有来源；"待核"清零或删 |
| B | 节拍字幕 | Sonnet | `chapters/*.mdx` 的 `beats` | `pnpm shoot muscles-chest --beats` 0 失败、无漏标 |
| P | HUD → 镜头与模式组合 → 事实与代码审计；`LICENSE-CONTENT`、`THIRD-PARTY-NOTICES.md` 由主会话改 | Opus + Sonnet | 视需要 | §12.3 全勾 |

### 12.2 其余五个（胸部发布后，两组并行）

- 组 A：`muscles-back` + `muscles-shoulders`（共用肩胛—肱骨关节链与斜方肌 / 三角肌）；组 B：`muscles-legs` + `muscles-arms`（四肢链，互不相干）；`muscles-core` 在 A、B 任一组完成后做（与背部共享竖脊肌、与腿部共享髂腰肌）。
- 每组：一个 Opus 代理（D + T）+ 一个 Sonnet 代理（B + QA）；Codex 批量出图与 glb（M、I 不冲突：按主题分目录）。
- **文件归属**：各组只写自己的 `src/content/topics/muscles-<topic>/**`、`shared/fitness/muscles/<region>.json`、自己 pattern 的 `exercises/<pattern>.json`（推 / 拉分给 A、下肢给 B、核心给 core）；跨组共用的肌肉（竖脊肌、三角肌后部、肱三头肌、髂腰肌）由**最先做的那组**写，后来者只引用、改动经主会话；引擎改动只由主会话派 Opus 引擎代理做；`LICENSE-CONTENT`、`THIRD-PARTY-NOTICES.md`、`package.json` 只有主会话改。

### 12.3 验收（每个主题；另加 skill `acceptance.md` 的通用项）

- [ ] `pnpm check`、`validate`、`test`、`build`、`e2e` 全绿；`pnpm shoot muscles-<topic> --layout --keys --beats` 0 失败。
- [ ] **每块区内肌肉可选、可标注、有肌肉卡四页**；左右两侧都可选，状态行写 `· L` / `· R`。
- [ ] 剥层顺序正确：浅 → 中 → 深依次外移，无穿插；X-RAY 只透皮肤；单显一块肌肉时它的起止骨骼可见。
- [ ] 起止点：每块肌肉的 `sites` 落在 Gray / OpenStax 描述的骨面上（并排截图存 `docs/screenshots/muscles-<topic>/geo-*.png`）。
- [ ] 收缩与作用动画：第 04 章每个作用一拍，蒙皮无撕裂、无穿模（肩外展 90°、肘屈 120° 时检查腋窝与肘窝）。
- [ ] 每个动作：有示意图（§10.3 通过）、4–6 步、2–3 条提示、2 条错误、`dose` 有来源、注意事项、未成年人一行；动作模式起止姿态与示意图一致。
- [ ] 两种语言、两套主题（paper / cinema）每章截图；三层 tint 在 dark plate 下分得开。
- [ ] 手机 390 × 844：舞台 + 章节芯片 + 检视器四页可滚动；触控目标 ≥ 44 px。
- [ ] 预算：glb ≤ 4 MB（上限 8）、三角形 ≤ 0.35 M（上限 0.5）、静止 draw calls < 80、动作模式 < 90；加载进度可见、离线（PWA 缓存）后再开可用。
- [ ] 许可：glb `asset.copyright`、`SOURCES.md`、`THIRD-PARTY-NOTICES.md`、`note` 四处署名齐全；`LICENSE-CONTENT` 例外已写。
- [ ] 免责声明与安全行在第 05、06 章和每张动作卡上；没有"最好的动作""燃脂""塑形"一类说法（grep 审计）。

## 13. 待 Gavin 确认

1. **网格来源**：Z-Anatomy 一源做六个（推荐；glb 为 CC BY-SA 4.0）——还是胸 / 肩 / 臂 / 腿用 BodyParts3D（CC BY 4.0，无 SA）、背 / 腰腹用 Z-Anatomy（混合，两套许可、需验证对齐）。
2. **男性参考人体**：唯一有完整肌肉的开放数据是男性；女性等数据出现再补。动作示意图用中性体型人物——或男女交替。
3. **训练指引的明确程度**：写典型范围（组 × 次 × 休息，带来源）+ 一份"示例训练课"——还是只写原则不写数字。
4. **伤病与体态章（06）**：做（客观、带来源、免责声明）还是不做；"圆肩"一拍取决于能否找到可靠综述（P37）。
5. **读者与未成年人**：本站读者含小学生；本系列定位"给家长和青少年的课外拓展"，每张动作卡带未成年人一行——可否；`levels` 元数据怎么写。
6. **图像风格**：动作图用与首页一致的石墨图版风格、两格（起始 / 结束）——可否；首页六张图版以模型渲染为参考重画。
7. **每块肌肉 3–5 个动作**，全系列约 57 个独立动作（胸 8、背 11、腰腹 10、腿 13、肩 8、臂 11）——多还是少。
8. **动作模式的深度**：只动本区关节链（胸部只动肩胛 / 肩 / 肘，躯干按体位整体转）——还是做全身姿态（要全身蒙皮，体积和工期都翻倍）。
9. **学科与系列**：`subject: biology` + `tags: [fitness, beyond-syllabus]`，还是新增学科 `health`；首页目录是否按"系列"分组（M14）。
10. **中文命名**：解剖名用名词委标准、俗名括注（"胸大肌锁骨部（上胸）"）——可否。

## 14. 已知风险

- **网格质量未亲见**：本文只核实了文件存在、大小、格式、名表与许可；Z-Anatomy FBX 的封闭性、穿插、法线与细节要 M0 下载后才知道。M0 是第一道闸门：不合格的肌肉换 BodyParts3D 同概念 OBJ，再不行写进已知差距。
- **FBX 可能不是最新**：README 说最新版在 Google Drive 的 `.blend`；若 FBX 缺件，用 Blender headless 从 `.blend` 导出（本机有 Blender 5.1.2），流程写进 runbook。
- **蒙皮质量**：自动权重在腋窝、肘窝、腹股沟最容易撕裂或塌陷；动作模式的关节角限制在常见范围（肩外展 ≤ 150°、肘屈 ≤ 140°），超出的姿态只动骨骼、肌肉淡显（M5 退路）。
- **剖切填充依赖封闭网格**：简化时锁边界；不封闭的件不填剖面，横切拍可能露出"空心"肌肉。
- **标注拥挤**：每主题 30–40 个可选网格；靠组标注、短名（M13）、分拍限量（≤ 6）。
- **SA 义务**：glb、几何派生数据、截图必须 BY-SA；以后若有人用这些截图做商业用途是允许的（BY-SA 不禁商用）——与本站其余内容的 NC 不同，§3 已明确分层。
- **证据的边界**：肌电研究多为小样本、有训练者、特定负荷；写"研究显示"并给条件，不推出"最好"；增肌证据以系统综述为主（P12、P18、P19）。
- **读者年龄**：站点主读者是小学生；动作内容对其只作知识，训练安全行与免责声明必须在每张卡上（§1.2）。
- **工期**：引擎 M5（蒙皮 + 关节角）与 M8（动作模式）是关键路径；若延期，胸部先以"骨骼姿态 + 肌肉淡显 + 收缩条纹"发布，动作模式改为固定姿态拍 + 示意图。

## 15. 实现记录与已知差距（2026-10-11，胸部发布）

**实现记录（提交）**：9712530 spec 草案；f344c05 Gavin 的决定与 8 张动作图；134ef93 引擎（真实网格、蒙皮与关节、拉力线、纤维收缩、动作模式、四页肌肉卡、共享健身数据）；21f439f 网格管线与胸部 glb；8865f6d 许可；c089043 内容草稿；e1261ee 引擎第二轮（器械真实尺寸、绕躯干关节转体位、锁骨 / 肩胛关节链）；本轮 QA 与发布。

**做出来的东西**

| 项 | 数 |
|---|---|
| glb | `public/models/muscles-chest.glb` 3.68 MB（上限 8 MB），约 232 k 三角形（上限 0.5 M），39 个网格节点、9 个关节（`trunk`、`scapula.l/.r`、`shoulder`、`elbow`、`hand` 各侧）；meshopt 压缩 |
| 零件 | `parts.json` 22 个（区内肌肉 8 个：浅层 3、中层 2、深层 3；邻近肌肉 7；骨骼 6：锁骨、肩胛骨、肱骨、前臂、胸廓、胸椎；体表轮廓 1），6 组；双侧用真实左右网格（`.l` / `.r`） |
| 站点 | 16 条 `sites`（8 个肌肉部分 × 起点 / 止点，写左侧，右侧镜像）；审查表见 data/SOURCES.md「Attachment review」，其中 4 处被人工改正或替换（三部分止点按网格接触拆成三段、胸肋部重复的锁骨起点去掉、腹部起点投到腹外斜肌腱膜、肋间肌改成有代表性的单个肋间隙） |
| 姿态 / 剖切 / 预设 | 10 个姿态、2 个命名剖切面（矢状、T4 横切）、6 个命名预设、8 个收缩动画 |
| 肌肉卡 | 共享表 `shared/fitness/muscles/chest.json` 9 张（胸大肌整体与三部、胸小肌、前锯肌、锁骨下肌、肋间外 / 内肌），另有 `shoulders.json`（三角肌前部）、`arms.json`（肱三头肌）各 1 张 |
| 动作卡 | 8 张（杠铃卧推、上斜哑铃卧推、俯卧撑、器械推胸、俯卧撑加、哑铃飞鸟、绳索夹胸、双杠臂屈伸），每张 5–6 步、`dose` 只写原则、带安全行与免责声明；杠铃、哑铃、徒手三类齐全 |
| 来源 | 共享 `M1`–`M32`（32 条，本主题用到 31 条，`M19` 留给后面的主题）；解剖以 Gray 1918 与 OpenStax 为主，研究写"研究显示" |
| 章节与节拍 | 6 章；节拍 6 / 5 / 5 / 7 / 5 / 5 = 33 拍；名词表 12 个，每个 EN、ZH 各包一次 |
| 性能（SwiftShader，1920×1080） | 静止 41 calls（第 02 章 33）、0.23 M 三角形（第 02 章 0.145 M）；动作模式 42–44 calls、0.232–0.234 M 三角形；均低于静止 < 80、动作 < 90 的目标 |
| 其他 | 主页插图 `muscles-chest.webp`；`status: published`；`featured` 没有设：首页 5 个精选位已被 aircon、fractions、grasshopper、ww1、ww2 占满（`MAX_FEATURED = 5`） |

**QA 与发布轮改动**

- **动作模式克制**：杠片改为 300 mm × 25 mm（标准 10 kg 铁片，原 450 × 30），哑铃头 170 mm（原 200）；第 05 章的动作镜头后退并统一 fov 22（卧推 / 上斜 / 飞鸟约 4.2 m，从脚端偏侧上方看；俯卧撑约 3.8 m，从侧前上方看），整根杠铃与两侧手臂都在画面内。镜头方向也是为标注选的：从侧上方斜看时，杠铃和哑铃会在循环中挡住三角肌、前锯肌的锚点（标注靠射线遮挡检测，被挡就淡出），改成从脚端 / 侧前上方后，第 05 章章节标注与各拍标注都标得出；第 06 章卧推最低点镜头后退（fov 22、目标下移让胸口不被字幕卡盖住），整根杠铃不要求入画（近看止腱）。器械仍是中性灰、无投影。
- **标注**：第 05 章各拍补标所有高亮零件（卧推加锁骨部；上斜加胸肋部和肱三头肌；俯卧撑加三角肌前部；飞鸟加三角肌前部）；俯卧撑加一拍把浅层淡显，让被胸大肌盖住的胸小肌露出来、有引线。预设与引线的交叉检查（chapter × preset × 拍，1920×1080 与 1280×720，EN）：只剩两组组合的一条引线擦过左侧章节轨（第 01 章 + ARMPIT、第 06 章 + BACK），1280×720 不画引线。
- **第 04 章**：`reach` 姿态加入 `joint:scapula.l` 前伸 12°（与 `rig.demo` 一致）；字幕和细看改写（EN、ZH）：肩胛骨现在会动，但是挂在简化的关节上，动作幅度小。
- **文字**：删掉"哪个动作最好 / Which is best"的标题式问法；第 05 章凳子角度的样本数与角度个数、第 06 章"约三分之一"补 `<Num>`。其余逐章通读 EN / ZH：没有"最好 / 塑形 / 燃脂 / 雕刻"，没有感叹号，原则里没有组数次数（8 张卡的 `dose` 全无数字），名词各包一次，`<Term>` 与 `[M#]` 全部能解析（`pnpm validate` 0 error 0 warning），每张卡有"不是医疗建议"一行，安全行 `space.exercise.safety` 在检视器的动作卡里 EN、ZH 都显示（手机与平板截图确认）。
- **cinema**：深色底下三层肌肉 tint 原本都被打光冲成同一种浅粉，分不开。`tokens.css` 的 cinema 肌肉 token 改为 `--muscle-1/2/3: #c9715b / #9d5b53 / #70443f`（paper 不变）；邻近肌肉组改用 `token:ink-3`，与骨骼（象牙白）分得开。
- **topic.yaml**：`status: published`、`illustration: muscles-chest`。
- **来源**：`sources-md.ts --shared fitness` 与 `muscles-chest` 重新生成无差异；topic SOURCES.md 的 3D 模型表补上 Z-Anatomy 要求的两行署名；glb `asset.copyright`、标题块 `note` 已有。
- **e2e**：`tests-e2e/smoke.spec.ts` 的首页用例改为 6 个已发布主题（muscles-chest 排在 ww2 前，ww2 变 Plate 06；生物学筛选 2 个）。

**规范截图**（`docs/screenshots/muscles-chest/`，1920×1080，EN）：`ch01`–`ch06` 六章（paper）、`hero-clean`、`close-pec`、`exercise-bench-start` / `-end`、`phone-390`（390×844）、`cinema-ch05`、`cinema-close-pec`。

**门槛（本轮最后一次，1920×1080 SwiftShader）**：`pnpm check` 0 error / 0 warning；`pnpm validate` 8 个主题 0 error 0 warning；`pnpm test` 46 文件 666 项通过；`pnpm build` 通过；`pnpm e2e` 68 项通过；`pnpm shoot muscles-chest --layout --keys --beats`：键位 0 失败（22 项）、七个尺寸 0 布局问题、console 干净、节拍 0 失败、`chapter highlights: all on screen`。EN / ZH × paper / cinema 四种组合的 `--beats` 在镜头调整前各跑过一轮，都是 0 失败；调整后重跑了 EN paper。

**手机 / 平板**（390 × 844、900 × 1200，EN paper，ZH 抽查）：章节芯片、阅读抽屉、肌肉卡四页（手机上第四页换行）、动作卡（含安全行）、名词表都能用；主要控件（标签页、芯片、Back / Next、动作按钮）≥ 44 px。引擎层已知问题，与本主题内容无关：顶栏 LOOK / 语言、READ / HIDE TEXT 按钮高 36 px；行内的 `<Term>`、`<FlyTo>`、来源角标（15 × 11）低于 44 px；900 px 宽时 `--k` 压到 0.6，顶栏芯片只有 14 px 高。

**已知差距**

- **姿态幅度**：关节角上限约 80–100°（肩外展 / 屈、肘屈），超过后腋窝蒙皮开始撕裂，所以动作的最低点（卧推、双杠臂屈伸、飞鸟的最大张开）取不到真实的深度。
- **没有髋、膝关节**：下肢随 `trunk` 整体转，是一个刚体，不会弯曲（俯卧撑里腿保持伸直，卧推里腿不画弯曲）。
- **俯卧撑手掌约滑动 5 cm**：闭链把掌心停在第一键的位置、身体绕脚尖转，没有髋、膝关节，肩的位置随姿态变化，所以掌心在地板上有约 5 cm 的滑动。
- **肋间肌附着**：肋间外 / 内肌是肋骨之间的薄片，没有单一的起止点；`sites` 只画有代表性的一个肋间隙（外肌第 5 间隙侧面、内肌第 4 间隙前面），不画每一个。
- **腋窝蒙皮**：手臂举过约 100° 后，腋窝附近的蒙皮有拉伸，姿态截图里肉眼可见；关节角因此限制在 100° 以内。
- **左右角度镜像**：动作关键帧只写左侧关节角，右侧取镜像值；在上斜凳的斜视角下左右两臂看起来不完全对称（内容轮次已知项，未处理）。
- **肩胛骨**：只通过锁骨关节转一点（前伸 12° / 抬高 10°），没有真的在肋骨上滑动；`hand.*` 指向腕关节，器械悬在腕处，比真实握点短约一掌。
- **标注**：锚点是包围盒中心，被别的件挡住或在剖面外时没有引线；`--beats` 的"无标注"清单在 SwiftShader 下偶尔有一项（动作循环里手臂遮住锚点，间隔采样都标得出），不算失败。`h` 键检查偶发失败，单独重跑通过。
- **预设 × 章节**：第 01 章 + ARMPIT、第 06 章 + BACK 的一条引线擦过章节轨边角（引擎布局，预设没有自己的 `labels`）。
- **第 06 章卧推最低点**：杠铃左端出画（近看止腱的拍），整根杠只在第 05 章要求入画。
- **来源**：肌电、增肌研究多数只读到摘要（`note` 写明）；`M19` 本主题没有用到。

**后五个主题怎么铺**

1. 一个主题 = 一份 glb（`scripts/anatomy/<topic>/manifest.json` → `select → bake → rig → optimize`，预算 ≤ 4 MB）+ `parts.json`（零件、组、站点、姿态、预设）+ 共享肌肉表 / 动作表一份 + 5–6 章；`new-topic.ts <slug> --engine space-scene` 起脚手架，不要复制胸部的 parts.json（部件 id、姿态都不通用），只复制组与预设结构。
2. 先跑 `inventory.ts` 看网格质量，再定零件清单；背阔肌、腹直肌、腹内斜肌、腹横肌、腰方肌、多裂肌只有 Z-Anatomy 有。
3. rig 先列要动的关节（肩背：肩胛 / 肩；腿：髋、膝——胸部没有，**腿部需要引擎先加髋膝关节与下肢蒙皮**；腰腹要躯干屈伸 / 旋转轴）。关节角限制在 ≤ 90° 或先改蒙皮。
4. 动作清单每块肌肉 3–5 个、覆盖杠铃 / 哑铃 / 徒手；每张卡 `dose` 只写原则；动作镜头一律 fov 22、距离 ≥ 3.5 m（全身姿态时 ≥ 4 m），先量器械的真实尺寸再摆镜头。
5. 引线：章级 `labels` ≤ 3（近景）；拍里列出每个高亮零件（主动 + 协同），被盖住的用 `ghost` 逐件淡显；用 `pnpm shoot --beats` 看"无标注"清单。
6. cinema：新主题的肌肉 token 已拉开，只需确认邻近肌肉与骨骼分得开；新增颜色一律走 token。
7. 共享来源 `M#` 追加在 `shared/fitness/sources.json` 末尾，不改已有编号；各主题只在自己的 `training.json` 引用。

## 16. 系列记录（2026-10-12）

六个 SpaceScene / Model3DStage 主题均已建成，`topic.yaml` 均为 `status: published`，各 6 章，paper 默认、cinema 可切。§15 保留胸部首次发布的快照；本节按 2026-10-12 工作区的内容数据、anatomy reports 与现有 `public/models/muscles-*.glb` 记录系列状态，不把旧施工计划当作实际流程。

### 16.1 各主题计数

`parts` = `parts.json` 条目数（包括邻区、骨骼、context，双侧不重复计）；区内肌肉 = `superficial` / `intermediate` / `deep` 中链接肌肉卡的零件条目，按部 / 头计，腿部含 `iliotibial-tract` 这块结缔组织教学零件。`sites` = 站点记录数，不是坐标点数；beats 从六章 `state.beats` 实数，按章序列出；glossary 从 `glossary.json` 计。动作数以本主题 `training.json.exercises` 为准。

共享来源 used = 章节、`parts.json`、`training.json`，以及零件直接链接的肌肉卡（含父级卡、邻区卡）与训练清单动作卡所引用的去重 `M#`；不把 `SOURCES.md` 自动附带的完整共享目录或肌肉卡另链的动作卡算成已使用。共享目录现有 `M1`–`M110`；core 另有主题来源 `S1`、`S2`，不计进 shared used。MB 用十进制（1 MB = 1,000,000 bytes），SHA 为 SHA-256 前 12 位；三角形含骨与皮肤。

**胸部 `muscles-chest`**

| 项 | 当前值 |
|---|---|
| parts / 区内肌肉 / sites | 22 / 8 / 16 |
| exercises / beats / glossary terms | 8 / 36（6 / 5 / 5 / 7 / 8 / 5）/ 12 |
| shared sources used | 35：`M1`–`M18`、`M20`–`M32`、`M48`、`M63`、`M86`–`M87` |
| glb MB / triangles / SHA prefix | 3.685024 / 231,986 / `4ddd10ce1613` |

**背部 `muscles-back`**

| 项 | 当前值 |
|---|---|
| parts / 区内肌肉 / sites | 32 / 15 / 42 |
| exercises / beats / glossary terms | 11 / 39（6 / 6 / 6 / 8 / 8 / 5）/ 14 |
| shared sources used | 41：`M1`–`M6`、`M8`–`M11`、`M20`–`M26`、`M29`、`M31`–`M32`、`M47`–`M63`、`M86`–`M87`、`M91`、`M109` |
| glb MB / triangles / SHA prefix | 3.837476 / 267,885 / `c5cde813fce4` |

**肩部 `muscles-shoulders`**

| 项 | 当前值 |
|---|---|
| parts / 区内肌肉 / sites | 24 / 8 / 16 |
| exercises / beats / glossary terms | 8 / 37（6 / 5 / 5 / 8 / 8 / 5）/ 14 |
| shared sources used | 37：`M1`–`M11`、`M14`–`M15`、`M20`–`M26`、`M29`、`M31`–`M32`、`M48`、`M51`、`M53`、`M63`、`M78`–`M87` |
| glb MB / triangles / SHA prefix | 2.113460 / 150,985 / `af72a83504d4` |

**手臂 `muscles-arms`**

| 项 | 当前值 |
|---|---|
| parts / 区内肌肉 / sites | 31 / 18 / 41 |
| exercises / beats / glossary terms | 11 / 37（6 / 5 / 5 / 8 / 8 / 5）/ 13 |
| shared sources used | 37：`M1`–`M9`、`M14`–`M15`、`M22`–`M23`、`M25`–`M26`、`M31`–`M32`、`M48`、`M51`、`M63`–`M74`、`M86`–`M91` |
| glb MB / triangles / SHA prefix | 3.079348 / 193,602 / `f00c57237c2e` |

**腿部 `muscles-legs`**

| 项 | 当前值 |
|---|---|
| parts / 区内肌肉 / sites | 33 / 23 / 51 |
| exercises / beats / glossary terms | 13 / 41（6 / 7 / 7 / 8 / 8 / 5）/ 14 |
| shared sources used | 30：`M1`–`M4`、`M9`、`M22`–`M26`、`M33`–`M46`、`M59`、`M75`–`M77`、`M92`、`M109` |
| glb MB / triangles / SHA prefix | 3.983116 / 244,638 / `243af0ad87d0` |

**腰腹 `muscles-core`**

| 项 | 当前值 |
|---|---|
| parts / 区内肌肉 / sites | 19 / 9 / 54 |
| exercises / beats / glossary terms | 10 / 40（6 / 5 / 8 / 8 / 8 / 5）/ 13 |
| shared sources used | 37：`M1`–`M4`、`M6`、`M10`–`M11`、`M23`–`M25`、`M29`、`M39`、`M47`–`M48`、`M51`、`M55`、`M57`–`M59`、`M92`–`M109` |
| glb MB / triangles / SHA prefix | 3.711480 / 274,634 / `8be266415b4a` |

合计 36 章、230 拍；六份训练清单共 61 次动作引用、60 个独立动作（`barbell-romanian-deadlift` 在 legs / core 共用）。胸部第 05 章已从首次发布的 5 拍补成全部 8 个动作，与 `state.index.exercises` 对齐；因此本节胸部拍数不同于 §15。

### 16.2 实际施工流程

1. **Codex drafts → Codex topic build → Opus review**：先准备五区肌肉 / 动作初稿与石墨两格动作图，再做五个主题的 `parts`、rig、sites、共享卡片、六章正文 / beats、glossary 和来源。内容施工见 `de1e231`；审查按 back / shoulders、arms / legs 两对进行，core 单独收口（`224e0b4`、`a20035b`）。审查核 Gray / OpenStax 与动作来源、移除未支持说法、独立重写中文、把 sites 投到正确骨面，并修镜头与标注。
2. **Pipeline rounds 4–7**：`scripts/anatomy/` 从胸部扩为 `--topic`，各主题独立 `manifest.json`，使用已缓存 FBX、native Blender、meshoptimizer 与 meshopt。Round 4 六主题 decoded surface / topology / 坐标 / 预算 gates 通过，30 张新增 previews 人工看过，胸部作为 byte baseline；候选附着仍需单独人审。Round 5 增加 published GLB 的 weights / fibre audit，修正 radius 附着误回退 `trunk`、back 的 biceps / brachioradialis / gluteus 与 core 的 latissimus / serratus 所属关节，并持久化斜方肌与竖脊肌 fibre selectors。Round 6 用 welded 邻域与面积权重修 stray vertices、微小 detached scraps 的 `_U` / fibre，并约束近端权重沿纤维单调；五个新 GLB 共修 70 个顶点，六主题 remaining outliers = 0（`420e636`）。Round 7 显式声明每主题 `jointNames` 与父链，保留未输出显示骨骼所需的 exercise joints，core 的 hip / knee / ankle 及上肢链由 native pipeline 原生生成，取消事后扩 rig。Rounds 5 / 7 合入 `1e86484`；仓库有 `ROUND-4/5/6-REPORT.md`，没有独立 `ROUND-7-REPORT.md`，Round 7 依据 README、manifest / rig 和该提交记录。
3. **Engine 收口**：standing exercise 加 `planted-feet` stance solver，以第一关键帧的 heel / ball 为参照平移身体，支撑脚留在地面；`motion.feet` 指定弓步支撑侧，提踵与抬前脚掌按接触滚动，统计暴露 `footSlip`。`shoot --keys` 等状态 / 按钮落定，`H` 的恢复芯片与拖拽后的 Orbit damping 用轮询等候，减少 SwiftShader 时序误判。动作取景加入 equipment-aware framing：`exerciseSpan` / `fitSpan` 按 standing barbell 的跨度与 yaw 后退镜头，为两端与 HUD 留空；读者主动选 preset 时保留该视角。这里记录现有引擎实现，不据此宣称全部动作接触或取景已验收。

当前六份 `report.md` 与上表 GLB 的体积、三角形和 SHA 一致；胸部 SHA 全程保持 `4ddd10ce…`。自动网格 audit clean 不等于完整动作或解剖审查完成：pipeline 候选仍保留 `[待核]`，页面采用的修正 sites 与审查依据记录在各主题 `data/SOURCES.md`。本次文档整理没有重跑 builds、pipeline 或 shoot。

### 16.3 铺开时落定的取舍

- **动作按 region 分文件**：新主题用 `exercises/back.json`、`shoulders.json`、`arms.json`、`legs.json`、`core.json`，没有按早期计划拆成 pull / hinge / squat-lunge。胸部保留 `horizontal-push.json`、`isolation-upper.json`、`vertical-push.json`；id 全局唯一，跨主题复用同一张卡，core 引用 legs 的 RDL。
- **来源只追加，不重编号**：共享表扩到 `M110`。`M109` 是 Gray 的髂区 / 下肢章（pp. 466–496），`M110` 是整个上肢章（pp. 434–466）；区分于胸部 `M1`、肩带 `M48`、上臂 / 前臂 `M87` 的较窄页码。腿部解剖引用改用 `M109`，`M110` 保留在共享目录，不把目录收录当作每主题都已引用。
- **腹外斜肌只写一张共享卡**：canonical `external-oblique` 在 `muscles/back.json`，back 邻区与 core 区内都引用它，core 不再复制；胸部邻区也复用。共享文件里的条目数不是主题的区内肌肉数。
- **back 不增加 skull / cervical display nodes**：一次手加颅骨、颈椎的 GLB 不在 manifest 内且缺 normals；`b27f28e` 重新走 pipeline 移除。未输出的颈骨仍可作 attachment / joint reference，页面不画那些颈部起点标记，文字保留解剖说明。
- **rig 以 manifest 为准**：mesh rig 与页面暴露的动作关节区分；例如 back GLB 有 13 个 joints、页面用 11，core GLB 有 17、页面当前用 trunk + 双侧 hip / knee / ankle 共 7。arms 的 `forearm.*` 负责旋前 / 旋后，`wrist.*` 是页面指向 `hand.*` 的 alias；胸部保留 legacy `wrist.*` 节点以守住 byte baseline。
- **HUD 按 docs/08 §2 铁律**：底部只有章节轴，次级读数进左列 PLATE；阅读面板依次为章头 → 节拍行 → 选中详情 / 当前动作卡 → 正文 → 本章索引。肌肉卡和动作卡沿用此契约，早期 §8 的底部三面板设想不再是当前布局。

### 16.4 已知差距

- **Pose caps 约 80–100°**：肩 / 肘演示受腋窝蒙皮拉伸限制，不能表现真实 overhead 与深下放的全幅度；解剖轴和动作角是教学示意，非个人活动度测量。
- **没有 hand / foot intrinsic muscles**：手、足骨按侧合并，前臂深屈肌及手足内在肌不在 v1 范围；不能据握持示意推断完整手指动作。
- **`chin-up` / `overhead-dumbbell-triceps-extension` 只演一部分**：反握引体只演缩短的肩肘动作，不解算悬垂身体与固定单杠握点；过顶伸肘为保护网格降低上臂抬举角，不画完整的头顶哑铃接触。完整设置与幅度看 sketch / steps。
- **Overhead bar extent**：standing barbell 已有横向跨度取景修正，但高举后的竖向器械包络、字幕 / HUD 避让仍需逐拍检查；尚无全关键帧动态 equipment bounds 的保证。
- **Pullover sketch 肘弯过多**：`dumbbell-pullover` 下放格的屈肘幅度大于卡片“保持微屈”的技术要求，动作图待修；模型仍是每手一只 dumbbell，而非双手共持一只。
- **SwiftShader label-list 偶发波动**：动作循环遮挡、锚点刷新时机可让 shoot 的无标注清单变化；需看 start / end 与重复采样，不能把偶发漏标清单当成已经消除的视觉问题。
- **Plank 缺手臂支撑而身体悬浮**：core 页面尚不暴露肩肘手链，`forearm-plank` / `side-plank` 没有支撑手臂的完整网格；即使有 floor slab，身体也会读成浮在地面上。GLB 保留上肢 joints 并未自动补齐页面的显示与闭链动作。
- **Achilles 没有独立 tendon mesh**：legs 用腓肠肌 / 比目鱼肌与跟骨止点说明跟腱，不画单独的跟腱网格；原始 muscle candidate 离跟骨很远时，不能拿肌腹末端替代真实止点。投影和取舍见 legs `SOURCES.md`。

可复用流程已收进 [anatomy-mesh-runbook.md](../.claude/skills/atlas-space-topic/references/anatomy-mesh-runbook.md)；后续主题沿用 native pipeline、明确 rig 和三道人审闸门。
