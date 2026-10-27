# 青蛙与鸡 · 内容施工 spec（frog-and-chicken）

SpaceScene / Model3DStage；paper 默认，cinema 可切。原型：生物标本台。**施工状态：published；按 2026-10-27 用户指令实施。** 自有母 dossier：`frog-and-chicken-research.md`、`facts.json`、`datasets.json`；没有 sibling，因此不设拆分说明。访问日期 2026-10-27。正文、字幕及中文用词按本表默认值施工，编辑复核列入 REVIEW.md。所有 F 编号均指本目录母 dossier；没有新增生物事实，因此不另建 facts-extra.json。

## 0. 决定与默认值

| 项 | 建议默认值 / 理由 | 依据 |
|---|---|---|
| 对象 | 具自由生活蝌蚪阶段的代表性池塘型青蛙；一只家鸡母鸡及雏鸡；非指定新加坡蛙种 | F04–F10,F27,F34–F35 |
| 范围 | 观察、排序、比较；受精与孵化仅说明必要条件，P5 生殖细节另链接 | F01–F03,F15–F16 |
| 大小 | 背景章 + 五章，每章五拍，共 30 拍；依用户小主题指示，无凑数拓展章 | F34–F38 DESIGN |
| 形态 | 青蛙五个观察视图；鸡三个宽分组；对照蚊子四个、植物三个宽分组 | F03,F29,F34–F36 |
| 必须讲对 | 末段表示下一代；蝌蚪不是鱼；尾巴吸收；暖和不会使卵受精；蛙没有蛹 | F05,F07,F15–F16,F22,F32 |
| 时间 | 无统一青蛙天数、无温度速率、无卵数/存活率；约 21 天只在鸡正文作 TYPICAL | F09,F14,F16,F37 |
| 引擎 | **新引擎工作：无。** 采用现成 `table` 状态表、`pose`、`visible`、`hide/ghost` 与 3D 环形摆放 | F37–F38 DESIGN；已查 docs/06 与代码 |
| 图像 | 两张新生成 + 一张复制 mosquito 对照图；分别中性灰、真 alpha、指定尺寸 | F04–F05,F27,F30–F31；art-inventory.json |
| 地图 | 无地图，Deliverable B 不适用；0 个数据集、0 bytes 预取 | F38 DESIGN |
| 测验 | 无计分题；两处先猜后看只是观察入口 | F24–F25；教学 DESIGN |
| 许可 | 原创内容及本轮派生文件 BY-NC-SA 4.0 家族；未选 BY-SA/ODbL 数据 | datasets.json D01–D12 |

### 0.1 本轮已代定的常规选择

把研究的“可能新增 ordinal life-cycle mode”降为无需实现：复查 `table-schema.ts`、`lib/sim/table.ts` 与 `bind.ts` 后，离散状态选择已经足够。保留完整的 3D 阶段环，右上使用现成零件卡；不强行套用当前必须有温度和实测历期的 mosquito `life-cycle` 卡，不塞入虚构 days。记录这是轮 2 对方案的简化，不是发现了新生物定律。[F09,F34–F38]

### 0.2 待 Gavin 的编辑选择（已有默认，不阻断施工）

- 题名默认 **Frog and Chicken Life Cycles / 青蛙与鸡的生活史**，shortTitle **Frog & chicken / 青蛙与鸡**。
- 青蛙保持通用池塘型，不将模型冒充 Cinnamon Bush Frog；本地物种仅在末章文字介绍。[F26,F28,F34]
- 中文候选默认“生活史”，首次解释可写“生命周期”；16 个未核词进入发布前用词复核，不把 HK 术语说成新加坡官方术语。
- 两张必需章节图默认选卵/蝌蚪图与蚊子水阶段对照图；鸡的变化由 3D 主模型承担，封面已有母鸡和卵。[F35–F36]

## 1. 课纲对照与范围

### 1.1 MOE 锚点

MOE 2023 cohort，updated Jan 2026，printed p.42 / PDF p.43：P3 *Cycles in Plants and Animals (Life Cycles)*，明确要求理解生物生活史的不同，并在观察比较例子中列出鸡与青蛙。[F01–F02] 逐字短引及缓存 SHA-256 已在母 dossier §a；此处不增加对同一出版物的引文。植物阶段比较停在种子、幼株、成株；P5 才展开传粉、受精、传播与萌发过程。[F03]

### 1.2 主线 / 细看 / 不展开

| 主线 | 细看 | 不展开 | 依据 |
|---|---|---|---|
| 青蛙卵、蝌蚪、后腿、幼蛙、成体；顺序及形态 | 少数蛙的直接发育；时间变异 | 激素、器官切片、统一蛙历期 | F04–F12 |
| 鸡的卵、雏鸡、成鸡 | 胚胎与卵黄不同；壳有气孔；约 21 天 | 精细胚胎日龄解剖、性成熟年龄、人工孵化步骤 | F13–F21 |
| 繁殖通向下一代 | 未必每个卵成功发育；环图的限度 | 存活概率或种群预测 | F16,F22–F23 |
| 蚊子蛹及植物种子的对照 | 现有主题链接 | 重复蚊子防治或植物运输系统 | F03,F29–F33 |

### 1.3 学到什么与常见误解

看完能按观察形态叙述所选青蛙与鸡的生活史，能分清个体成长与下一代，能解释为何不能把蚊子的蛹硬加进青蛙或鸡，也不会把同样长的环弧当同样长的时间。[F01–F03,F22,F29,F32,F37]

研究证据分级：S16 真实记录种子非生命、拟人解释；S17 研究熟悉与陌生昆虫间的概括；S15 研究图示而非学生比例。后列“蝌蚪是鱼”“尾巴掉下”“每个暖蛋孵鸡”为作者诊断题，**没有声称文献测出这些误解在新加坡的频率**。[F22–F25]

### 1.4 对照主题

| topic / status | chapter id（已读 frontmatter） | 本文链接用法 |
|---|---|---|
| mosquito / published | `round-the-cycle`、`pupa-to-adult`、`eggs-and-larvae` | 第 05 章对照，详细四阶段与防治留原题 |
| plant / published | `seed-to-plant`、`fruits-and-seeds` | 第 05 章“种子到成株”，不复制全篇 |
| grasshopper / published | `nerves-and-growing-up` | 可选细看：若虫路线 |
| flower-and-seed / published | 主题级入口（本轮未选章链接） | P5 扩展阅读，不纳入 P3 主线 |

状态依据实际 topic.yaml；最后一项为额外目录核查，不增加生物事实。[F33；S21 local inventory]

## 2. 事实与模型数值

### 2.1 事实表索引

| F id | 事实 / 选择 | 类型 | 来源 |
|---|---|---|---|
| F01 | P3 asks pupils to understand that different living things have different life cycles. | FACT；high | S01 |
| F02 | The P3 comparison list explicitly includes chicken and frog, alongside cockroach, grasshopper, beetle, butterfly and mosquito. | FACT；high | S01 |
| F03 | P3 plant comparison focuses on seed, young plant and adult plant; named reproduction processes are deferred to P5. | FACT；high | S01 |
| F04 | In the common pond-frog example, jelly-coated eggs hatch into tadpoles. | FACT；high | S02 |
| F05 | A tadpole is a frog larva; most frogs hatch in this form, rather than as miniature adults. | FACT；high | S03 |
| F06 | In the illustrated pond-frog sequence, hind legs become visible before the front legs. | FACT；high | S02 |
| F07 | The tadpole tail is gradually absorbed during metamorphosis. It is not shed as a detached tail. | FACT；high | S02 |
| F08 | Metamorphosis involves remodelling multiple tissues and a shift from tail swimming to limb-based movement. | FACT；high | S04 |
| F09 | Tadpole development time differs with species and environmental conditions; there is no universal frog day count. | FACT；high | S03 |
| F10 | Some frogs develop within the egg and emerge as froglets without a free-living tadpole stage. | FACT；high | S05 |
| F11 | A froglet may have four limbs while a shrinking tail remains; this is a transition, not a separate kind of animal. | FACT；high | S02 |
| F12 | A standard pond-type adult frog has four fingers on each forefoot and five toes on each hind foot. | FACT；medium | S20 |
| F13 | The chick embryo develops inside the egg before hatching; hatching is not the start of development. | FACT；high | S06 |
| F14 | For domestic chickens, normal incubation is approximately 21 days under suitable conditions, counted from incubation rather than purchase. | FACT；high | S08 |
| F15 | Fertilisation occurs before the shell is added and the egg is laid. | FACT；high | S06 |
| F16 | A chick can develop only from a fertilised egg, and successful development also needs suitable incubation conditions. | FACT；medium | S09 |
| F17 | The yolk supplies nourishment for the developing embryo; the yolk is not itself a miniature chick. | FACT；high | S07 |
| F18 | The shell and membranes enclose the egg contents, and an air cell forms as contents cool after laying. | FACT；high | S07 |
| F19 | Oxygen enters and carbon dioxide leaves through pores in the eggshell during development. | FACT；high | S06 |
| F20 | At hatching the chick uses its beak and temporary egg tooth to open the shell, then emerges and its down dries. | FACT；high | S06 |
| F21 | The chicken comparison can be represented as egg, chick and adult; the chick grows into an adult bird. | FACT；medium | S09 |
| F22 | A life-cycle return link from an adult to eggs denotes reproduction and a new generation, not the same adult becoming an egg. | FACT；medium | S15 |
| F23 | Life-cycle illustrations commonly omit variability, explicit sexual reproduction and death; their visual conventions need explanation. | FACT；medium | S15 |
| F24 | A school study documented children treating seeds as nonliving and giving anthropomorphic explanations of plant growth. | FACT；high | S16 |
| F25 | Research on elementary pupils examined the difficulty of generalising metamorphosis lessons from familiar ladybugs to other insects. | FACT；medium | S17 |
| F26 | Singapore conservation work moved Cinnamon Bush Frog tadpoles to suitable Botanic Gardens sites in December 2017; breeding was subsequently observed. | FACT；high | S10 |
| F27 | NParks describes roaming flocks in Singapore as a mixture of domestic fowl and Red Junglefowl. | FACT；high | S11 |
| F28 | Singapore has several frog species with different observable appearances; the Cinnamon Bush Frog is one local example. | FACT；high | S12 |
| F29 | The mosquito sequence includes egg, larva, pupa and adult. | FACT；high | S14 |
| F30 | Mosquito larvae and pupae develop in water; the pupa precedes the emerging adult. | FACT；high | S14 |
| F31 | Aedes eggs may persist through dry conditions and later hatch when conditions become favourable. | FACT；high | S13 |
| F32 | The frog metamorphosis sequence is not the insect egg–larva–pupa–adult sequence; no frog pupa is present. | FACT；high | S03 |
| F33 | Atlas mosquito, plant and grasshopper topics are published; link to their existing treatment instead of repeating it. | FACT；high | S21 |
| F34 | For this topic, five frog observation snapshots subdivide continuous development: egg, tadpole, hind-leg tadpole, froglet with tail, adult. | DESIGN | S22 |
| F35 | For this topic, chicken uses three core views: egg, chick, adult; the egg inset can reveal a schematic embryo. | DESIGN | S22 |
| F36 | The comparison tray uses mosquito four-stage and flowering-plant three-stage groupings, with independent sizes and no shared timescale. | DESIGN | S22 |
| F37 | Stage-selection controls show order only: equal arc spacing and reversible inspection do not represent equal durations or reversible biological ageing. | DESIGN | S22 |
| F38 | The model study is fully static, uses original procedural geometry and has no map component or runtime data service. | DESIGN | S22 |

### 2.2 数值纪律

- TYPICAL：约 21 天，仅指适宜条件下鸡卵的孵化参考，正文包 `<Num s="S8">`，无倒计时或确保孵出的进度条。[F14,F16]
- DESIGN：五/三/四/三种观察分组、半径 1.4、模型位置、标本比例、相机是教学参数；不是物种测量。[F34–F38]
- SIM：本轮只有状态表的确定性选择，不求解发育速度、胚胎重量、呼吸量或存活率。PLATE 可沿用已有 SIM 状态行，但卡上补一句 “Observation model, not a development forecast / 观察模型，不是发育预测”。[F37–F38]
- 没有计量时间、环境温度或真实尺寸的控件；`sim-plan.json` 无数值输出，`layout-plan.json` 中的数只用来定位。[F37–F38]

## 3. 对象、写实与零件

### 3.1 分区与比例

| 分区 / group id | 内容 | token |
|---|---|---|
| 01 `frog-cycle` | 卵团、蝌蚪、后腿蝌蚪、带尾幼蛙、成蛙 | `token:ink-2`，选中用 signal |
| 02 `chicken-cycle` | 卵、壳窗、卵白、卵黄、胚胎、雏鸡、母鸡 | `token:neutral`，选中用 signal |
| 03 `comparison` | 四个简化标本组、比较标记 | `token:cold` 仅表示所画水生背景带 |
| context | 低矮展台、静态顺序弧、文字标记锚点 | ink/hairline，不添加装饰机构 |

生物形态遵循 F04–F21；分区、颜色和尺度为 DESIGN [F34–F38]。没有粒子流：循环箭头不是体液流。相邻弧是静态程序化 `sweep` + 小锥形箭头，末段旁标“Reproduction · next generation / 繁殖 · 下一代”；不得把动物沿末段移动成卵。[F22,F37]

Y 向上，展台在 XZ 面。青蛙环中心 [-2.8,0,0]；鸡环 [2.8,0,0]；半径 1.4；比较台在 z=3.5，四个标本组 x=-3,-1,1,3。单位为**显示单位**。模型 note 必须写：

> Model study · stages independently enlarged · selected views of continuous development · spacing is not time.
> 模型研究 · 各阶段分别放大 · 选取连续发育中的视图 · 间距不代表时间。

设计与真实大小不建立米制换算，不把几何半径写成生物 TYPICAL。[F34–F38]

### 3.2 Tier-1 写实约束

- 卵团胶质围胚胎；游泳蝌蚪不画成有鱼鳞和成对鱼鳍的小鱼；本选定游泳观察阶段不加羽状外鳃。[F04–F05,F34]
- 后腿观察视图恰有两条可见后腿；幼蛙有四肢和连续缩短的尾巴；普通模型前足四指、后足五趾，不能用四根随意小棍替代全部趾。[F06–F12]
- 雏鸡与母鸡须有可识别的鸟类外形，两个翅、两足；母鸡尾羽不画成夸大的雄鸡长尾；胚胎与卵黄是两个物体。[F17,F20–F21,F35 DESIGN]
- 卵内胚胎仅为无日龄的示意轮廓，不画成占据卵黄中心的完整缩小雏鸡；未受精例子不显示胚胎。[F13,F16–F18,F35]

### 3.3 零件计划（21 个顶层 selectable parts + 3 个 context）

每个动物标本的身体、眼、足、羽毛由同一个 `primitive + extra` 聚合，不将每根脚趾变成阅读索引项目。没有外部网格。下列归类是 DESIGN [F34–F38]；解剖依据在最后一列。

| id | group / 用途 | 几何和可见性 | summary EN / ZH | 事实 |
|---|---|---|---|---|
| frog-eggs | frog-cycle | 透明球壳 repeat + 内球；partial clutch，数量仅显示选择 | Encloses developing young / 包围发育中的幼体 | F04 |
| frog-tadpole | frog-cycle | lathe 椭圆躯干 + sweep 尾 + 薄 extrude 尾膜 | Swims with its tail / 靠尾巴游动 | F05,F08 |
| frog-hind-legs | frog-cycle | 上式 + 两后腿、趾连通 | Shows the emerging hind legs / 显示逐渐显现的后腿 | F06,F12 |
| frog-froglet | frog-cycle | 四肢 + 短尾，非尾巴碎片 | Shows a shrinking attached tail / 显示仍连着身体的短尾 | F07,F11 |
| frog-adult | frog-cycle | 扁宽头、躯干、屈曲后肢、短前肢，无尾 | Shows the adult frog / 显示成蛙的形态 | F07,F12 |
| frog-marker | frog-cycle | 小墨色珠，无生物身份；pose 选择位置 | Marks the chosen observation / 标出当前选定的观察 | F37 DESIGN |
| chicken-egg | chicken-cycle | lathe 不对称卵形，主体剩余壳 | Encloses the egg contents / 包围卵内结构 | F18 |
| egg-shell-window | chicken-cycle | 独立可移开的壳片，closed 时贴合 | Opens a teaching window / 打开讲解用的示意窗 | F35 DESIGN |
| egg-yolk | chicken-cycle | 球形卵黄，不画在胚胎中间 | Supplies nourishment / 提供营养 | F17 |
| egg-white | chicken-cycle | 透明椭球；不做高反射玻璃 | Surrounds the yolk / 围着卵黄 | F18 |
| egg-embryo | chicken-cycle | 小弯曲轮廓，非日龄复制品 | Shows a schematic embryo / 显示示意胚胎 | F13,F16,F35 |
| chicken-chick | chicken-cycle | 绒羽轮廓、短喙、翅、两足 | Shows the young chicken / 显示幼小的鸡 | F20–F21 |
| chicken-adult | chicken-cycle | 母鸡整体、短尾、翅与两足 | Shows an adult hen / 显示成年母鸡 | F21,F35 |
| chicken-marker | chicken-cycle | 墨色珠，绑定选择 | Marks the chosen observation / 标出当前选定的观察 | F37 DESIGN |
| compare-frog | comparison | 五个小标本及静态弧，聚合一项 | Compares the frog forms / 对照青蛙的不同形态 | F34 |
| compare-chicken | comparison | 卵、雏鸡、成鸡，聚合一项 | Compares the chicken forms / 对照鸡的不同形态 | F35 |
| compare-mosquito | comparison | 卵、幼虫、蛹、成虫；独立比例 | Includes the mosquito pupa / 包括蚊子的蛹期 | F29–F30,F36 |
| compare-plant | comparison | 种子、幼株、成株；不画传粉步骤 | Compares a flowering plant / 对照开花植物的阶段 | F03,F36 |
| comparison-marker | comparison | 墨色珠，四个预定点 | Marks the selected comparison / 标出当前比较对象 | F36 DESIGN |
| frog-next-generation | frog-cycle | 可点静态末段弧，label=下一代 | Links adults to new offspring / 从成体连接到下一代 | F22 |
| chicken-next-generation | chicken-cycle | 可点静态末段弧，label=下一代 | Links adults to new offspring / 从成体连接到下一代 | F22 |

context 三项 `frog-tray`、`chicken-tray`、`comparison-tray`，只作标本摆放，无生境仿真。各 context 无 index，所有正文命名实体均能从本章索引选中。将两个 next-generation id 加进背景与对应成长章的 index。[F22,F38 DESIGN]

### 3.4 遮挡、模式、动画与预算

全局默认 assembled、run=false、explode=0、cutaway=none。不制作生长循环动画；改变观察只移动 marker，小珠只是指示位置。卵壳窗用已有命名 pose 移开，其余壳保持；无需新增“透明卵” primitive。X-RAY 是辅助观察，不改变表的受精条件。爆炸视图可检查壳/卵黄等，其他生物标本 explode=0；explode 展示仍不是自然发育过程。[F13,F16–F18,F35,F37]

目标 ≤ 70 draw calls、≤ 180k triangles，硬上限沿用 docs/02/08；透明壳尽量单层，先保轮廓和附肢数量，后减 repeat 数与羽片密度。所有题内数据本地打包，不引入 GLB 或运行时服务。[F38 DESIGN]

## 4. 引擎与数据契约（复用现状，不申请新 schema）

### 4.1 现状核对与最终取舍

已直接读 `lib/sim/lifecycle.ts`、`lib/sim/cycle.ts`、`table-schema.ts`、`lib/sim/table.ts`、`lib/sim/bind.ts` 及 docs/06：原 `life-cycle` 的温度行、正数阶段天数、最后阶段不计天、固定 reproduction 回弧，都不适合缺少匹配历期的本题。**不修改这些语义。** `table` 的 choice/toggle → state 已能做离散观察。[F09,F34–F38 DESIGN]

研究提出的 E-FC1/E-FC2 是候选，如要专门右上 ordinal 卡才有必要。本稿不采用，故没有“待实现但先写数据”的隐性依赖；新 sim kind、binding、primitive、data layer 均为 **0**。选择章节拍与侧栏控件即可完整体验。

### 4.2 控件、输出与来源

完整作者数据在 `sim-plan.json`，使用现有 schema；各行 sourceId 为产品合法 `S1` 格式，母研究 `S01` 之类只在研究中使用。映射是 S01→S1、S02→S2…S09→S9，其余不变。

| control | 类型 / 值 / default | 行为 |
|---|---|---|
| frog-view | choice egg,tadpole,hind-legs,froglet,adult / egg | 对应五个观察标记姿态 |
| chicken-view | choice egg,chick,adult / egg | 对应三个观察标记姿态 |
| egg-open | toggle false | 打开讲解窗，不表示温度或自然破壳的物理过程 |
| fertilised | toggle true | 切换两个条件例子，不在运行中给一枚卵执行“受精”操作 |
| compare-view | choice frog,chicken,mosquito,plant / frog | 四个比较标记姿态 |

五个控件、六个 state 输出、四个实验、**16 行表数据**。frog/chicken 观察各 5/3 行；egg-window 为两个 toggle 的 4 个组合；comparison 4 行。所有实验同时求值，但本章卡只 observe 对应实验。[F34–F38 DESIGN；事实见各行 source]

输出 `frog-form`、`chicken-form`、`egg-view`、`embryo-view`、`egg-condition`、`comparison` 均为 `kind:state`，有完整 `{en,zh}` 标签，无 `from`、`tag` 或时间单位。`embryo-view=shown` 当且仅当 egg-open=true 且 fertilised=true；否则 hidden，**hidden 不等于胚胎死亡**，closed 时只是不可见。[F13,F16,F35]

受精开关是一组对照例子的选择；即使 true，也不表示必然存活或孵出。[F16] 窗内显示的是“正在发育的受精卵例子”，不是所有受精卵实时状态的计算。[F35 DESIGN]

### 4.3 绑定与状态合成

- frog-form → frog-marker 的五个命名 `pose`；chicken-form → chicken-marker 的三个 pose。标本不换物种、不沿再生边变回卵。[F22,F37]
- egg-view closed → shell-window 显式 null 回静止；open → egg-window-open。embryo-view → egg-embryo `visible:{eq:shown}`。不另加一个互相覆盖的 visible 绑定。[F35 DESIGN]
- comparison → comparison-marker 的四个 pose。`layout-plan.json` 提供目标中心坐标；施工转成现有 poses 对象，不直接把 planning 文件当 parts.json。[F36–F38 DESIGN]
- 章/拍使用现有 `state.sim.set`，拍只叠加章基线而不累积。未设置的控件取章默认；显式 set 应包括与字幕相关的全部状态。URL `sim` 沿用现成编码、非法值由 resolveSimValues 回退；不要注册新 query 参数。
- 单击 3D 标本只选中详情；“选择阶段”控件才移动 marker。这里不要求单击标本反写 sim，因此无需新点击 binding。正文说明两种动作。

### 4.4 表、绑定与验证合同

现有 `tableSchema` strict；每实验 keys 1–4 个、rows 1–64，when 恰覆盖 keys；每组合恰一行；set 输出集一致；一个输出仅一个实验所有；state id 有标签；source 是实际存在的 `S#`。本题不需要 number output 的 design 校验例外，产品 S22 仍标 `design:true`，解释尺度和分组。[F34–F38 DESIGN]

`parts` 引用必须存在、非错拼；pose 名在主题 poses；所绑零件均独立，marker 不受额外 rotate/offset/play 驱动。卵壳与胚胎在模态切换和 hide 下维持已有 AND 可见规则，不把一个 hidden 胚胎恢复成可见。

预期错误：删除 frog-observation 的 adult 行 → 缺一个组合；复制 egg-open=true/fertilised=false 行 → 重复；set embryo-view=dead → 未定义状态；source=S99 → 缺来源；pose=frog-at-fish → 缺姿态。

### 4.5 必须满足的数值与行为夹具

以下是内容施工必须实现的回归夹具，准备阶段的 fixture 检查不等于最终门槛。

| 输入 / 操作 | 预期 |
|---|---|
| 默认值 | frog-form=egg, chicken-form=egg, egg-view=closed, embryo-view=hidden, egg-condition=fertilised, comparison=frog |
| egg-open=false, fertilised=false | closed, hidden, unfertilised |
| egg-open=false, fertilised=true | closed, hidden, fertilised |
| egg-open=true, fertilised=false | open, hidden, unfertilised |
| egg-open=true, fertilised=true | open, shown, fertilised |
| frog-view=hind-legs | frog-form=hind-legs；frog marker [-1.977101,0.18,1.132624] |
| frog-view=adult | marker [-4.131479,0.18,-0.432624]，不会变成卵 |
| chicken-view=chick | marker [4.012436,0.18,0.7] |
| frog 第一站/第三站/末站 | 方位角 0° / 144° / 288°；站数 5；相等角度不表示相等天数 |
| chicken 三站 | 0° / 120° / 240°；站数 3 |
| compare-view=mosquito | comparison=mosquito；marker [1,0.2,3.5] |
| 任意两个独立实验控件 | 5×3×2×2×4=240 个组合，均确定求出六个输出；无 NaN、无未知状态 |
| 同一输入重复求值 | 输出完全相同；数值坐标误差 ≤ 0.000001 显示单位 |
| 从第 03 章第 4 拍进入第 5 拍 | embryo-view 从 hidden 到 shown；不会继承上一拍 fertilised=false |
| 键 ] 在 frog adult 末项 | 保持 adult，不能自动穿过繁殖边回 egg；切回 egg 是检查已知视图，不是反向生长 |
| 深链接 b 与 sim | 直接载入与手动同一拍同状态；还原壳窗与 marker；无运行时外部请求 |

### 4.6 退路与不做

若某个标本的复杂肢形 primitive 难以表现，先保持独立清楚的阶段标本与准确四肢/趾数，降低羽毛细节，不偷换为不准确的 morph。若表集成有问题，可先用章拍 pose/hide 呈现同样的 30 拍；不能给 life-cycle 模型造数补缺。[F12,F34–F38]

## 5. 章节与字幕（30 拍）

### 5.0 状态总约定

所有章 assembled / run=false / explode=0 / cutaway=none。第 03 章显式用 egg-open 控制壳窗；不混用全局 cutaway 来代替这一状态。每章定义完整 hide 基线：00 显示两主环；01–02 显示 frog-cycle、藏鸡与 comparison；03–04 显示 chicken-cycle、藏 frog 与 comparison；05 显示 comparison、藏两个主环。context 随本组同现同隐。`state.index` 是可点对象清单，不把 ghost 标本用作唯一可见的必需标注。

`beat-plan.json` 为每拍明确列出 set、camera、labels、highlight，优先于下面的人读画面说明。说明里的“选择”“对照”表示供读者操作，不是第二个自动状态；所有拍一个静止结果。01-4 默认显示 adult，读者可拨回 tadpole。所有需连标的对象保持可见，labels≤6。

| 章 | id | EN / ZH | camera | 默认观察 |
|---|---|---|---|---|
| 00 | before-you-start | One life and the next / 一生与下一代 | overview | `{"frog-view": "adult", "chicken-view": "adult", "egg-open": false, "fertilised": true, "compare-view": "frog"}` |
| 01 | eggs-and-tadpoles | Eggs and tadpoles / 卵与蝌蚪 | frog-overview | `{"frog-view": "egg", "chicken-view": "egg", "egg-open": false, "fertilised": true, "compare-view": "frog"}` |
| 02 | the-changing-frog | The changing frog / 变化中的青蛙 | frog-overview | `{"frog-view": "tadpole", "chicken-view": "egg", "egg-open": false, "fertilised": true, "compare-view": "frog"}` |
| 03 | inside-the-egg | Inside the egg / 卵的里面 | egg-close | `{"frog-view": "egg", "chicken-view": "egg", "egg-open": false, "fertilised": true, "compare-view": "chicken"}` |
| 04 | chick-to-adult | Chick to adult / 从雏鸡到成鸡 | chicken-overview | `{"frog-view": "egg", "chicken-view": "egg", "egg-open": false, "fertilised": true, "compare-view": "chicken"}` |
| 05 | cycles-compared | Cycles compared / 比较生活史 | comparison | `{"frog-view": "adult", "chicken-view": "adult", "egg-open": false, "fertilised": true, "compare-view": "frog"}` |

### 5.1 背景章 00 `before-you-start` · 一生与下一代

**Summary**：Two animals develop differently, but both have a next generation. / 两种动物的发育过程不同，都有下一代。 [F01–F03, F22, F34–F38]

**正文提纲**：从青蛙和母鸡的整体外形入手，把“同一个体的成长”和“产生下一代”分开。先认识环图是一种排列方式；卵不是成年个体变回去的样子。结束时说明显示大小各自放大，模型不能量身长或读时间。 [F01–F03, F22, F34–F38]

| 拍 | 画面 / state | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|
| 00-1 | overview; labels frog-adult,chicken-adult；set=`{}` | The frog and hen are two adult animals. Their young will develop in different ways. | 这里是两种成体：青蛙和母鸡。它们的幼体会以不同的方式发育。 | F01,F21,F34,F35 |
| 00-2 | frog-overview; frog-view=egg; labels frog-eggs；set=`{"frog-view": "egg"}` | The eggs belong to the next generation. This adult does not turn back into an egg. | 这些卵属于下一代。这只成蛙不会变回卵。 | F22,F34 |
| 00-3 | chicken-overview; chicken-view=chick; labels chicken-chick；set=`{"chicken-view": "chick"}` | A chick is a young chicken. It grows before it can reproduce as an adult. | 雏鸡是幼小的鸡。它继续生长，成年后才可能繁殖。 | F21 |
| 00-4 | overview; labels frog-marker,chicken-marker；set=`{}` | The models are arranged for comparison. Their sizes and spaces do not measure how long development takes. | 模型按方便比较的方式摆放。大小和间距都不能用来计算发育时间。 | F36,F37 |
| 00-5 | frog-overview; frog-view=adult; labels frog-adult,frog-eggs；set=`{"frog-view": "adult"}` | Follow growth around the display, then read the last link as reproduction into a new generation. | 沿着展台观察成长；最后一段连接表示繁殖，接到新一代。 | F22,F37 |

**细看**：环图为何闭合；显示顺序与真实时间的差别。 [F01–F03, F22, F34–F38]

**本章索引**：`frog-adult, chicken-adult, frog-eggs, chicken-egg, frog-next-generation, chicken-next-generation`。**首现词**：见 §6，对应观察实体首现才加 Term；研究池未核中文词不当正式权威译名。

### 5.2 第 1 章 01 `eggs-and-tadpoles` · 卵与蝌蚪

**Summary**：In this pond-frog example, an egg hatches into a tadpole. / 在这个池塘型青蛙的例子中，卵孵出蝌蚪。 [F04–F05,F09–F10,F34,F37]

**正文提纲**：观察胶质包被和卵内的胚胎，再换到没有腿的游泳蝌蚪。说明蝌蚪的身份仍然是青蛙的幼体，不能凭外形像鱼就说它是鱼。早期阶段是否有外鳃、外形多大各有物种差异，本模型只画自由游泳阶段。不要输入统一的孵化或变态天数。 [F04–F05,F09–F10,F34,F37]

| 拍 | 画面 / state | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|
| 01-1 | frog-eggs close-up; labels frog-eggs；set=`{}` | Each visible jelly capsule surrounds an embryo in this egg model. The display shows only a small part of a clutch. | 卵模型中，每个可见的胶质包被围着一个胚胎。这里仅画一小部分卵团。 | F04,F34 |
| 01-2 | frog-view=tadpole; labels frog-tadpole；set=`{"frog-view": "tadpole"}` | In this example, the young frog hatches as a tadpole, with a tail and no visible legs. | 在这个例子里，幼体孵出时是蝌蚪：长着尾巴，还看不到腿。 | F04,F05,F34 |
| 01-3 | frog-tadpole close-up; labels frog-tadpole；set=`{"frog-view": "tadpole"}` | The tadpole swims with its tail. Its shape differs greatly from the adult frog shown elsewhere on the tray. | 蝌蚪靠尾巴游动。它的形状与展台另一处的成蛙差别很大。 | F05,F08 |
| 01-4 | frog-overview; frog-view=adult, then reader chooses tadpole; labels frog-adult,frog-tadpole；set=`{"frog-view": "adult"}` | These different forms belong to the same kind of animal. A tadpole is a young frog. | 这些不同的形态属于同一种动物。蝌蚪是青蛙的幼体。 | F05,F34 |
| 01-5 | frog-view=tadpole; labels frog-marker；set=`{"frog-view": "tadpole"}` | The control chooses an observation. It does not count days; development time varies between species and conditions. | 这个控件选择观察哪一阶段，不计算天数。不同物种和条件下，发育时间并不相同。 | F09,F37 |

**细看**：不是每种蛙都有自由生活的蝌蚪；为什么不放青蛙天数滑块。 [F04–F05,F09–F10,F34,F37]

**本章索引**：`frog-eggs, frog-tadpole, frog-marker`。**首现词**：见 §6，对应观察实体首现才加 Term；研究池未核中文词不当正式权威译名。

**试一试**：vary frog-view；observe frog-form；不写 record（省略该字段），无图表、无 replay。第 02 章先猜“尾巴会怎样”，揭晓拍 02-3，不用评分。

### 5.3 第 2 章 02 `the-changing-frog` · 变化中的青蛙

**Summary**：Legs become visible and the attached tail gradually shrinks. / 腿逐渐显现，连在身体上的尾巴慢慢缩短。 [F06–F12,F32,F34,F37]

**正文提纲**：按外部形态依次观察：无腿蝌蚪、后腿明显的蝌蚪、四肢明显但尾巴未吸收完的幼蛙、成蛙。它们是独立标本视图，转换画面并不是一夜之间发生。正面解释尾巴被吸收，不画断尾。最后将细分视图归回卵、幼体、成体的宽分组，避免把五站当成唯一标准。 [F06–F12,F32,F34,F37]

| 拍 | 画面 / state | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|
| 02-1 | frog-view=hind-legs; labels frog-hind-legs；set=`{"frog-view": "hind-legs"}` | The hind legs are now visible beside the tail. The front legs are not yet shown at this observation. | 尾巴旁已能看见后腿。在这个观察阶段，前肢还没有显现。 | F06,F34 |
| 02-2 | frog-view=froglet; labels frog-froglet；set=`{"frog-view": "froglet"}` | This froglet has four limbs, while an attached tail remains. The body is changing through metamorphosis. | 这只幼蛙已经有四肢，尾巴仍连在身体上。身体正在经历变态发育。 | F08,F11 |
| 02-3 | frog-froglet close-up; labels frog-froglet；set=`{"frog-view": "froglet"}` | The tail becomes shorter as it is absorbed. It is not a piece that falls off behind the animal. | 尾巴被吸收，逐渐缩短，并不是一段从身体后方掉下来的东西。 | F07,F11 |
| 02-4 | frog-view=adult; labels frog-adult；set=`{"frog-view": "adult"}` | The adult specimen has the frog body form and no tadpole tail. It does not pass through a pupa. | 成体标本呈现成蛙的身体形态，没有蝌蚪的尾巴，也不经过蛹期。 | F07,F32 |
| 02-5 | frog-overview; labels frog-eggs,frog-tadpole,frog-adult；set=`{"frog-view": "adult"}` | Five selected views help us inspect continuous change. A simpler diagram may group these views into fewer stages. | 五个选定视图帮助我们观察连续变化。简化图可以把这些视图归成较少的阶段。 | F34,F37 |

**细看**：连续过程与分类；本模型不模拟器官重塑或激素。 [F06–F12,F32,F34,F37]

**本章索引**：`frog-tadpole, frog-hind-legs, frog-froglet, frog-adult, frog-marker, frog-next-generation`。**首现词**：见 §6，对应观察实体首现才加 Term；研究池未核中文词不当正式权威译名。

**试一试**：vary frog-view；observe frog-form；不写 record（省略该字段），无图表、无 replay。第 02 章先猜“尾巴会怎样”，揭晓拍 02-3，不用评分。

### 5.4 第 3 章 03 `inside-the-egg` · 卵的里面

**Summary**：Development takes place inside a fertilised egg under suitable conditions. / 受精卵在适宜条件下，内部的胚胎继续发育。 [F13–F19,F35]

**正文提纲**：先看完整蛋壳，再打开示意窗；将卵黄与胚胎明确分开。卵黄是营养来源，不是一个缩小的完整小鸡。切换到未受精例子时，示意胚胎消失，说明温暖不会完成受精。约二十一天只作正常孵化的典型资料，不提供精确日历、温度配方或照着做的孵化指南。 [F13–F19,F35]

| 拍 | 画面 / state | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|
| 03-1 | egg-close; labels chicken-egg；set=`{}` | The shell hides development inside the egg. Hatching is not the first moment of development. | 蛋壳挡住了内部的发育过程。孵出并不是发育开始的时刻。 | F13,F15 |
| 03-2 | egg-open=true; labels egg-shell-window,egg-yolk,egg-embryo；set=`{"egg-open": true}` | The model window reveals a schematic embryo beside its food supply. The window is a teaching device. | 示意窗打开，显示胚胎和营养来源。这个窗口是为讲解而设置的。 | F13,F17,F35 |
| 03-3 | egg-open=true; labels egg-yolk,egg-embryo；set=`{"egg-open": true}` | The yolk provides nourishment. The yolk and the developing chick are different structures. | 卵黄提供营养。卵黄与发育中的小鸡是不同的结构。 | F17 |
| 03-4 | egg-open=true; fertilised=false; labels egg-yolk；set=`{"egg-open": true, "fertilised": false}` | This example is unfertilised, so no developing chick is shown. Warmth does not fertilise an egg. | 这个例子没有受精，因此不显示发育中的小鸡。温暖不会使卵受精。 | F15,F16,F35 |
| 03-5 | fertilised=true; egg-open=true; labels egg-embryo；set=`{"egg-open": true, "fertilised": true}` | A fertilised chicken egg normally hatches after about twenty-one days of suitable incubation. Fertilisation alone does not guarantee hatching. | 鸡的受精卵在适宜条件下孵化，通常约二十一天孵出。仅有受精并不能保证孵出。 | F14,F16 |

**细看**：卵内气体交换作为细看；受精发生在产卵前；约二十一天从什么时候起算。 [F13–F19,F35]

**本章索引**：`chicken-egg, egg-shell-window, egg-yolk, egg-white, egg-embryo`。**首现词**：见 §6，对应观察实体首现才加 Term；研究池未核中文词不当正式权威译名。

**试一试**：vary fertilised；also egg-open；observe egg-condition,embryo-view；不写 record（省略该字段）。先猜后看：start={egg-open:true,fertilised:true}，change={fertilised:false}，observe=embryo-view，选项 shown/hidden，means 与状态 id 相同。揭晓同时解释“hidden 是没有显示，不是计算出死亡”。

### 5.5 第 4 章 04 `chick-to-adult` · 从雏鸡到成鸡

**Summary**：The chick grows into an adult; reproduction links adults with the next generation. / 雏鸡生长成为成鸡；繁殖把成体与下一代连接起来。 [F13,F20–F22,F27,F35,F37]

**正文提纲**：用不同标本而非强行变形展示卵、雏鸡、成鸡。孵出的动作只用壳片位移表达，不模拟破壳力，也不演成成人帮助开壳。雏鸡已经是鸟类的幼体，与成体外形接近，但不是只按一个尺度放大的模型。繁殖连接处固定显示“下一代”；母鸡是所画成体的例子，不暗示公鸡不是成鸡。 [F13,F20–F22,F27,F35,F37]

| 拍 | 画面 / state | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|
| 04-1 | chicken-view=egg; egg-open=true; labels egg-shell-window；set=`{"egg-open": true}` | During hatching, the chick opens the shell and emerges. The opened model shell only represents that event. | 孵出时，雏鸡打开蛋壳并离开卵。模型壳片的打开只表示这个事件。 | F20,F35 |
| 04-2 | chicken-view=chick; egg-open=false; labels chicken-chick；set=`{"chicken-view": "chick", "egg-open": false}` | The emerged chick is covered in down. It grows as a young bird rather than passing through a pupa. | 孵出的雏鸡长着绒羽。它作为幼鸟继续生长，不经过蛹期。 | F20,F21 |
| 04-3 | chicken-view=adult; labels chicken-adult,chicken-chick；set=`{"chicken-view": "adult"}` | The adult hen and chick share a bird body form. Their proportions and feathers are not identical. | 成体母鸡和雏鸡都具有鸟类的身体形态，比例和羽毛却不完全相同。 | F20,F21,F35 |
| 04-4 | chicken-overview; labels chicken-adult,chicken-egg,chicken-next-generation；set=`{"chicken-view": "adult"}` | The adult-to-egg link means reproduction. The hen remains an adult while a new generation begins. | 成体到卵的连接表示繁殖。母鸡仍然是成体，新一代由此开始。 | F21,F22 |
| 04-5 | chicken-view=adult; labels chicken-adult；set=`{"chicken-view": "adult"}` | Singapore flocks may include domestic fowl and Red Junglefowl. This model is a domestic hen, not a field identification. | 新加坡的鸡群可能包含家鸡与红原鸡。这个模型是一只家鸡母鸡，不是野外鉴定图。 | F27,F35 |

**细看**：为何不用一个简单缩放动画代表所有成长；家鸡与红原鸡的本地观察。 [F13,F20–F22,F27,F35,F37]

**本章索引**：`chicken-egg, chicken-chick, chicken-adult, chicken-marker, chicken-next-generation`。**首现词**：见 §6，对应观察实体首现才加 Term；研究池未核中文词不当正式权威译名。

**试一试**：vary chicken-view；observe chicken-form；不写 record（省略该字段），无 replay。

### 5.6 第 5 章 05 `cycles-compared` · 比较生活史

**Summary**：Compare what changes, without forcing every life cycle into one pattern. / 比较各自的变化，不把所有生活史套进同一种模式。 [F03,F22–F23,F26–F38]

**正文提纲**：先比较青蛙与鸡，再放入蚊子和开花植物的简化环。识别蚊子的蛹，不把它补进青蛙或鸡的生活史。植物用种子而不是卵的名称，不重新讲传粉与传播。环上的第一站可以选择，前后关系和繁殖意义不能任意交换。最后以本地蝌蚪保育案例说明，真实生活史关系到适宜的环境；不把观察活动变成自行收集或搬动物种。 [F03,F22–F23,F26–F38]

| 拍 | 画面 / state | Caption EN | 字幕 ZH | 事实 |
|---|---|---|---|---|
| 05-1 | comparison; compare-view=frog; labels compare-frog,compare-chicken；set=`{"compare-view": "frog"}` | The frog has a free-swimming tadpole in this example. The chicken hatches as a chick. | 在这个例子里，青蛙有自由游泳的蝌蚪阶段；鸡孵出的是雏鸡。 | F05,F21,F36 |
| 05-2 | compare-view=mosquito; labels compare-mosquito；set=`{"compare-view": "mosquito"}` | The mosquito has a pupa between larva and adult. A frog does not need a pupa to become an adult. | 蚊子在幼虫和成虫之间有蛹期。青蛙成为成体并不需要经过蛹期。 | F29,F30,F32 |
| 05-3 | compare-view=plant; labels compare-plant；set=`{"compare-view": "plant"}` | The flowering plant comparison uses seed, young plant and adult plant. Its detailed story is in the plant topic. | 开花植物用种子、幼株和成株来比较。更完整的过程在植物主题里。 | F03,F33,F36 |
| 05-4 | compare-view=chicken; labels compare-chicken；set=`{"compare-view": "chicken"}` | A cycle can be read from a different starting point. The order of development and the new-generation link still matter. | 生活史可以从不同起点读起。发育的顺序和通向下一代的连接仍然重要。 | F22,F37 |
| 05-5 | compare-view=frog; labels compare-frog；set=`{"compare-view": "frog"}` | Singapore conservation work moved Cinnamon Bush Frog tadpoles to suitable Botanic Gardens sites. The resulting breeding shows why habitats across a life cycle matter. | 新加坡的保育工作曾把 Cinnamon Bush Frog 的蝌蚪迁到植物园的适宜地点。后来观察到繁殖，说明生活史中适宜环境的重要。 | F26,F28 |

**细看**：新加坡植物园的肉桂灌木蛙保育案例（中文种名未核，正文优先写英文名并解释）；各阶段都可能未能存活，但不量化死亡率。 [F03,F22–F23,F26–F38]

**本章索引**：`compare-frog, compare-chicken, compare-mosquito, compare-plant, comparison-marker`。**首现词**：见 §6，对应观察实体首现才加 Term；研究池未核中文词不当正式权威译名。

**试一试**：vary compare-view；observe comparison；不写 record（省略该字段）。TopicLink 使用 §1.4 的已核 topic/chapter，链接显示 EN/ZH。

### 5.7 镜头与 HUD

| preset | position / target / FOV | 用途 |
|---|---|---|
| overview | [10,10,14] / [0,0.4,0] / 32° | 两主环全貌，不把后方比较台挤入首屏 |
| frog-overview | [0,5,6] / [-2.8,0.4,0] / 32° | 五站环与 next-generation 标签 |
| chicken-overview | [5.6,5,6] / [2.8,0.4,0] / 32° | 卵/雏鸡/成鸡 |
| egg-close | [3.8,2.3,0.5] / [2.8,0.5,-1.4] / 30° | 壳窗与卵内结构，窗口一侧朝镜头 |
| comparison-view | [0,7,10] / [0,0.3,3.5] / 32° | 四组比较标本 |

三处近看 camera 的 position/target/FOV 已逐拍列进 beat-plan.json；不是新的预设或点击机制。以上为 DESIGN 起点，施工以准确轮廓、可见引线和触控目标调整，不能当已通过截图验收。[F38] 不另建底部播放条；底部只有章节与拍刻度；无自动巡回。状态、来源与选中详情走既有 HUD；每个说明对象进入 index。右上保持现有零件链路卡，不显示不存在的水温/成体剩余天数。移动端与 reduced motion 必须能完整阅读静帧。[F37–F38]

## 6. 名词表与来源

### 6.1 产品 glossary 候选（14 项）

母研究池 56 项：40 项有传统词形或官方索引证据并明确做简化转换；16 项仍为提议；Singapore 用法均未独立核定。下表的“待核”不是要求编造佐证；发布前查不到则采用更普通解释词，保留定义。[F01–F38；terms entries]

| id | EN / ZH | 定义 | 状态 | see |
|---|---|---|---|---|
| life-cycle | Life cycle / 生活史（生命周期） | 从一个生命阶段到产生下一代的过程 | 生命周期有 S19 索引；生活史为编辑选择 | before-you-start |
| egg | Egg / 卵 | 包含发育起点的生殖结构；鸡卵外有壳 | S18 | frog-eggs, chicken-egg |
| tadpole | Tadpole / 蝌蚪 | 所选青蛙例子中自由游泳的幼体 | 中文待核 | frog-tadpole |
| froglet | Froglet / 幼蛙 | 身体已呈蛙形，尾巴可尚未吸收完 | 中文待核 | frog-froglet |
| adult | Adult / 成体 | 能进入繁殖阶段的成熟个体 | 中文待核，用成熟个体解释 | frog-adult,chicken-adult |
| chick | Chick / 雏鸡 | 鸡的幼体 | 中文待核 | chicken-chick |
| embryo | Embryo / 胚胎 | 孵出前发育中的幼体 | S18 | egg-embryo |
| yolk | Yolk / 卵黄 | 卵内的营养来源 | 中文待核 | egg-yolk |
| hatching | Hatching / 孵出 | 幼体从卵中出来 | 中文待核，区别孵化培育过程 | chicken-egg |
| fertilisation | Fertilisation / 受精 | 生殖细胞结合，是发育所需条件之一 | S18；细胞已有 S18 | egg-embryo |
| reproduction | Reproduction / 繁殖 | 产生下一代 | S18 | frog-next-generation |
| metamorphosis | Metamorphosis / 变态发育 | 幼体与成体形态有明显变化的发育过程 | 中文待核，不套昆虫完全变态术语 | frog-froglet |
| pupa | Pupa / 蛹 | 蚊子幼虫与成虫之间的阶段 | 中文待核 | compare-mosquito |
| seedling | Seedling / 幼苗 | 从种子发育出的幼小植物 | S18 | compare-plant |

### 6.2 Sources 映射

施工时 sources.json 要改为既有 `{sources:[{id,text:{en,zh},url?,note?,design?}]}`，不是直接把研究注册表喂进 schema。S22 设 design:true；S21/S22 为本地来源，不给伪造 http URL，说明写在 text/note；其余 url 原样保留。下表每条均在 `sources.json`（研究格式）有 locator 与 access。[母 dossier F 编号源映射]

| 研究 id → 产品 id | 来源 | 用途 / 访问限制 |
|---|---|---|
| S01 → S1 | [Primary Science Teaching & Learning Syllabus: 2023 cohort, updated Jan 2026](https://www.moe.gov.sg/-/media/files/primary/syllabus/primary-science-syllabus-2023_may24.pdf) | Printed p.42 / PDF p.43; P3 Life Cycles; printed p.38 classification；existing local PDF |
| S02 → S2 | [How to find frogspawn, tadpoles and froglets](https://www.nhm.ac.uk/discover/frogspawn-tadpoles-and-froglets.html) | From tadpole to frog; Feasting froglets；full text |
| S03 → S3 | [Tadpoles](https://www.amnh.org/exhibitions/frogs-a-chorus-of-colors/reproduction/tadpoles) | Introductory paragraph and American Bullfrog Tadpoles account；full text |
| S04 → S4 | [Metamorphosis From Tadpole to Frog](https://tadpoles.wp.st-andrews.ac.uk/from-tadpole-to-frog/) | From tail swimming to limb-based locomotion; tissue remodelling；full text |
| S05 → S5 | [Tadpoles have an eye on the future as their vision develops](https://www.nhm.ac.uk/discover/news/2022/november/tadpoles-have-eye-on-future-as-vision-develops.html) | Paragraph describing direct development within eggs；full text |
| S06 → S6 | [The Avian Embryo, publication P1150](https://extension.msstate.edu/publications/the-avian-embryo) | Formation and Parts of the Egg; Life in 21 Days; Table 2; hatching paragraph；full text |
| S07 → S7 | [Eggs Structure](https://extension.illinois.edu/eggs-structure) | Yolk, albumen, membranes, air cell and chalazae；full text |
| S08 → S8 | [Incubation and Embryology Q & A](https://extension.illinois.edu/incubation-and-embryology-q) | Questions 25–26, 46 and 61；full text |
| S09 → S9 | [Hen Reproduction](https://extension.psu.edu/hen-reproduction) | Paragraph: only fertilized eggs develop into chicks; shell added in oviduct；search-index full excerpt; direct open 403 |
| S10 → S10 | [Cinnamon Bush Frogs in Singapore](https://www.sg101.gov.sg/resources/archives/nature-cinnamon-bush-frog-in-singapore/) | Conservation translocation account, December 2017；full text |
| S11 → S11 | [What Is That Red Bird](https://www.nparks.gov.sg/publications-resources/articles/what-is-that-red-bird) | Red Junglefowl section；full text |
| S12 → S12 | [What’s the Frog?](https://www.nparks.gov.sg/publications-resources/articles/what-s-the-frog) | Local frog examples and Cinnamon Bush Frog account；full text |
| S13 → S13 | [Aedes Mosquito](https://www.nea.gov.sg/dengue-zika/prevent-aedes-mosquito-breeding/aedes-mosquito) | Life-cycle paragraph; dry-egg survival；full text |
| S14 → S14 | [Mosquito Life Cycle](https://www.epa.gov/mosquitocontrol/mosquito-life-cycle) | Egg / larva / pupa / adult bullet list；full text |
| S15 → S15 | [Representing Variability: The Case of Life Cycle Diagrams (2020), DOI 10.1187/cbe.19-11-0251](https://pmc.ncbi.nlm.nih.gov/articles/PMC8711823/) | Methods; spatial arrangement; variability coding; discussion；substantial indexed full-text excerpt; direct PMC robot check / publisher 403 |
| S16 → S16 | [Diagnosing and remediating elementary students’ misconceptions about the Growth of Plants (2024), 17:2–12](https://www.jstage.jst.go.jp/article/ajbe/17/0/17_2/_article/-char/en) | Abstract；full abstract |
| S17 → S17 | [Detailed bugs or bugging details? The influence of perceptual richness across elementary school years](https://pmc.ncbi.nlm.nih.gov/articles/PMC8463490/) | Pretest endorsements; generalization to non-ladybug insects；indexed full-text excerpt; direct PMC robot check |
| S18 → S18 | [English-Chinese Glossary of Science, S1–3 (2017)](https://www.edb.gov.hk/en/curriculum-development/kla/science-edu/ref-and-resources/glossary.html) | Existing cached edb-science-glossary-2017.pdf; entry pages in terms；existing local PDF + live index |
| S19 → S19 | [Science (P1–P6) Curriculum Guide (2025)](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/science-edu/pri-sci/PSCG%282025%29.pdf) | 3LC1–3LC5；indexed excerpt; full PDF too large for web tool |
| S20 → S20 | [Amphibia: morphology, Fauna of Australia 2A](https://www.dcceew.gov.au/sites/default/files/env/pages/dc11235d-8b3b-43f7-b991-8429f477a1d4/files/04-fauna-2a-amphibia-morphology.pdf) | Statement near figures 2.4–2.6: four fingers, five toes；indexed excerpt |
| S21 → S21 | [Atlas published topic inventory and life-cycle implementation](src/content/topics/) | mosquito, plant, grasshopper topic.yaml and chapters; docs/06 life-cycle; lifecycle.ts；local files |
| S22 → S22 | [Atlas frog-and-chicken model study](art/research/frog-and-chicken/frog-and-chicken-research.md) | Sections e–f; DESIGN record；original design |

## 7. 图像与数据清单

### 7.1 已选图

| 文件（art/planned/frog-and-chicken/） | 规格 / 来源 | 放置 / 边界 | 事实 |
|---|---|---|---|
| frog-and-chicken.png | 1024×1024，new，1 次 | 封面：一蛙、一母鸡、一卵；非趾数学习图，非同一比例尺 | F12,F27,F34–F35 |
| frog-and-chicken-eggs-and-tadpole.png | 1536×1152，new，3 次（前两次腿/趾图不采用） | 01 章卵团与一只游泳蝌蚪；不画断尾、不作为完整生命周期 | F04–F05 |
| frog-and-chicken-mosquito-water-stages.png | 1536×1152，reuse，0 次新生成 | 05 章对照蚊子的幼虫/蛹，明确不是蛙卵；reusedFrom 指向原文件 | F29–F31 |

`manifest.jsonl` 逐图记录 subject/checks/tries/reusedFrom；`art-inventory.json` 有原图和成品字节数与 SHA-256。所有图做等 RGB、保留 alpha、85% 边界框 fit、精确尺寸；画面内不放文字、箭头、号码、纸纹、背景、边框、标志或落地阴影。图外 EN/ZH 图注在正文写“独立放大”。

**图注**：

- 01: “Jelly-coated eggs and one free-swimming tadpole, enlarged separately. / 胶质包被的卵与一只自由游泳的蝌蚪，各自放大。” [F04–F05,F34]
- 05: “Mosquito comparison: eggs on the wall above water, a larva and a pupa at the surface. These are not frog eggs. / 蚊子的对照图：水线上方壁面的卵、水面的幼虫与蛹。这不是蛙卵。” [F29–F31]

### 7.2 数据与许可分文件

Deliverable B 不适用。无 map keyframes、layers、extent 或地理下载；`data/INVENTORY.md` 明确 0 个、0 bytes。`sim-plan.json`、`layout-plan.json`、`beat-plan.json` 是原创准备数据，不是外部测量数据。[F38]

| 派生目标 / 家族 | 输入 | 许可处理 |
|---|---|---|
| 原创 parts/poses、state 表和文字：BY-NC-SA | 原创模型选择 + 引用公开事实 | 不复制受限照片或原图；无 BY-SA 混入 |
| 本轮三张 PNG：BY-NC-SA | 两张生成图、Atlas 既有蚊图 | 本地复用来源和变更记录齐全 |
| CDC/PhyloPic 参考：PD/CC0 | 仅候选未下载 | 如未来选用具体资产，记录 item-level 作者/URL/字节/sha |
| 未选 BY-SA/ODbL/ODC-BY | 无 | 若后续变更，单列文件家族和 carve-out，绝不把 BY-SA 与 BY-NC-SA 合成一个派生文件 |

## 8. 施工顺序与验收

### 8.1 施工顺序

定稿范围和中文 → 已清许可参考逐项确认 → 用原生 primitive 做准确剪影 → 集成既有 table 与 poses → 一章双语样章 → 全部 30 拍 → 模式与移动端截图 → 事实审计 → 正常发布门槛。没有新包、新引擎项目、外部瓦片、定时 live fetch 或 anatomy pipeline。实施状态和未执行的浏览器门槛如实记录在 §9。[F34–F38 DESIGN]

### 8.2 验收清单

- [ ] MOE printed p.42/PDF p.43 与缓存证据一致；所有事实引用能回 facts.json；产品来源合法 S#，中英完整。
- [ ] 所选青蛙的五视图顺序正确，后腿先出现、幼蛙四肢、尾巴连续吸收；前足四指/后足五趾，非手画随意数量。[F04–F12]
- [ ] 鸡卵、雏鸡、成鸡顺序；胚胎与卵黄分离，未受精例子无发育胚胎；约 21 天从孵化培育算起，非承诺。[F13–F21]
- [ ] 青蛙没有蛹；蚊子有蛹；植物不标作卵；各自尺度、时间不混用。[F03,F29–F32,F36]
- [ ] adult→egg 弧标“繁殖/下一代”，无个体逆生长循环、无所有卵都成活的表现。[F16,F22–F23]
- [ ] 表 16 行、240 控件组合均合法；egg-window 真值表四格准确；marker 坐标与 §4.5 一致。
- [ ] 30 拍每拍可见变化或明确镜头重构；≤6 labels；章头→拍→详情→正文→索引；所有命名对象可从索引点到。
- [ ] 章/拍基线独立；URL sim/b、前后切换、壳窗、选择、hide/ghost 无状态残留；`]` 在最后选项不越界。
- [ ] paper/cinema、390×844 触控、≥44px、键盘、读屏与 reduced motion；不会因少动画少一段知识。
- [ ] 图像 1 cover+2 figures，尺寸、透明边界和等 RGB 全检；art manifest 与 SHA-256 对上；原蚊图未改。
- [ ] 原创与未来第三方派生许可边界明确；无 BY-SA/BY-NC-SA 混合文件；无 tracked licence 改动发生于准备。
- [ ] 发布前正常跑 check / validate / test / build / e2e 与 shoot --layout --keys --beats。准备夹具不代替最终门槛；最终验收结果在 §9。

### 8.3 研究边界与复核项

- 没有特定新加坡蛙种的定量发育序列；默认通用池塘型、纯顺序，不以现有蛙图形冒充 Cinnamon Bush Frog。[F09,F26,F28]
- S09/S15/S17 部分依赖索引摘录，具体 access 在 sources.json；未绕验证或登录。发布级文字若需要更细主张，先换为已读的 S02/S06 或补官方可读证据。
- 中文术语及 Singapore attestation 为部分完成，已逐词标记；16 项未核词不作为正式术语背诵。研究池足以供后续编辑，不假称已获 MOE 中文官方对照。
- 第一、二版蛙腿图因趾数未通过，最后采用卵/无腿蝌蚪图；未通过版本没有放进交付目录。准确四肢和趾数仍为 3D 建模的硬验收。
- 截图与运行时性能由主会话验收；施工与 CPU 检查结果在 §9 单独记录。

准备验证结果见主 checkout `verification.json` 与 `verification.md`。


### 8.4 施工前引擎复核（2026-10-27）

已读 main 的 table-schema.ts、lib/sim/table.ts、lib/sim/bind.ts、schema 的 poses 与 docs/06。五个 choice/toggle 控件、六个 state 输出、四张完备状态表、pose 与 visible 已有实现。删除候选 E-FC1/E-FC2；保留新引擎项 0 个。

已用只读 git log main..codex/<branch> 及 git show 核对 monsoon-engine（月气候层）、sem-engine（orbit-rotation）、airfoil-content（airfoil）、dinosaur（当前与 main 无差异）、plates（reference/catalogue/impact）。这些能力与本题无依赖；不读取其未合并实现来构建。steam/table/pose/sort/light/magnet/circuit/materials 均复用 main 或不使用。全部 F01–F38 与 facts.json 存在且一致。状态 published，e2e 端口 5444；按主 brief 跳过浏览器门槛并由主会话验收，不执行 git 写入。

## 9. 施工记录

### 9.1 引擎取舍与实现

2026-10-27：新增引擎项 **0**；E-FC1/E-FC2 均删除。没有改引擎、schema、注册表、docs/06 或 package/lockfile，没有依赖未合并分支。现有 `table` 数据包含 5 个 choice/toggle 控件、6 个 state 输出、4 个实验共 16 行，240 个输入组合；5 条绑定仅使用 pose/visible。13 个命名姿态中 12 个定位观察指针，1 个打开卵壳窗。没有数值发育模型、时间线、温度或新 URL 参数。

### 9.2 内容、几何与图像

已建 `frog-and-chicken`，状态按用户指定为 published。背景 + 5 章、30 拍；三组共 21 个 selectable parts、3 个 context trays；22 条 sources（S22 为 design）、14 个 glossary terms；一个封面与两张章节图。正文主线每章 EN 239–260 words、ZH 358–372 汉字。两条繁殖连接可从 index 选择，全部拍标签均在本章 index，章/拍显式重置五个控件与场景基线。没有反向链接要求，未修改其他主题正文。

程序化模型生成器：`pnpm tsx scripts/geo/frog-and-chicken/build-parts.ts`。主青蛙前足各 4 指、后足各 5 趾；幼蛙尾巴相连，后腿蝌蚪只画两后腿；雏鸡采用不同于母鸡的头、颈、喙、腿和身体比例。卵壳用互补的空心 210°/150° lathe sectors，模型窗移开后真实露出内部，胚胎与卵黄分开。薄透明卵白仅为示意，未画精细日龄。

CPU 构建检查：24 个 part 的 `partPieces` 共 **54 个材质批次、126,348 个三角形、0 个非有限顶点**；分组为 frog 19/55,112、chicken 19/28,248、comparison 16/42,988（批次/三角形）。该数不是 WebGL draw-call 测量；contact shadows、材质 pass 与主题实际性能仍须 shoot 验收。查看过 flat CPU triangle preview，只用于轮廓核查，不替代材质/主题/手机截图。

批准的三张 PNG 全部经 `scripts/illustrate.ts` 加工并查看：封面 800/1600，章节图各 1200×900。字节分别 87,462、264,934、92,822、107,206，均低于脚本预算，有真 alpha。蚊图复用原 mosquito 水阶段图，原文件未动，无新生成调用。逐文件 SHA 与原 manifest 在主题根 `ILLUSTRATIONS.md`。外部数据 0 个/0 bytes；原创内容沿用 LICENSE-CONTENT，无须第三方许可例外。

### 9.3 与准备稿的差异及 Gavin 复核

- `comparison` 与分组 id 冲突，预设改为 `comparison-view`，拍内直接 camera 不变。
- marker 的 pose 原点保留计划坐标；可见小珠与引线锚点移到环前沿，避开动物身体遮挡。它仍是观察指针，不沿繁殖边自动回卵。
- 小型 comparison 标本省略指趾，主展台保留准确数量；不以微型轮廓作为数趾图。
- 索引扩大到包括全部拍标签与正文模型对象；普通章不能放 state.note，观察免责声明保留在 topic/background note 与正文细看。
- 输入 PNG 严格 R=G=B；标准有损 WebP 解码少数像素通道最多差 1/255，保持预算内标准管线。不是新彩色图或背景变化。
- Gavin 清单：题名与“生活史/生命周期”、通用蛙与母鸡范围、未核定的中文词形、受精/孵出边界与约 21 天起点、环图下一代、marker 读法、比较标本简化、各段双语可读性、S9/S15/S17/S19/S20 等访问限制，以及全套主会话浏览器验收。逐段索引见 REVIEW.md，事实链见 AUDIT.md。

### 9.4 门槛与明确未执行项（2026-10-27）

| 检查 | 结果 |
|---|---|
| `pnpm check` | PASS：765 files，0 errors，0 warnings，3 个既有 unused hints；tsc --noEmit 通过 |
| `pnpm validate` | PASS：58 topics，0 errors，0 warnings |
| 主题单测 | PASS：265/265，含 240 组合、12 组姿态坐标、主青蛙指趾数、30 拍的静态 camera/frustum、标签可见集合与独立基线 |
| `pnpm test` | 未全绿：161 files 中 160 pass；4,542 tests 中 4,541 pass，唯一失败是原有 `tests/space-scene/energy.test.ts:312` 守恒穷举超过原定 5,000 ms。初次另有 worker RPC timeout |
| `pnpm run test --maxWorkers=2` | 同样 4,541 pass / 1 timeout；没有 worker RPC error，未改测试或配置 |
| energy 单独诊断 | 默认 5 s 仍 timeout；`pnpm exec vitest run tests/space-scene/energy.test.ts --testTimeout=20000`：64/64 pass，守恒穷举 6,187 ms。仅此诊断给更长时间，不把它记为默认门槛全绿 |
| `pnpm build` | PASS：119 static pages，PWA 146 entries；保留仓库既有 >500 kB chunk 提示 |
| 静态 HTML 检查 | EN/ZH 索引均 35 个 published cards，均含本主题 cover；EN/ZH 主题页均含正确的两张 Figure |
| `git diff --check` | PASS；没有 git 写入操作 |
| shoot / e2e | 按用户 brief **未执行**，没有尝试个人浏览器或桌面。14 个 topic e2e cases 已编写，smoke 为 35 topics、13 biology、70 badges、35 plates/drawings |

主会话浏览器命令：`pnpm shoot frog-and-chicken --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`；`CI=1 ATLAS_E2E_PORT=5444 pnpm e2e`。需实看 390×844、两种主题与语言、各章引线、全部拍、键盘/触控、URL sim/b、壳窗与胚胎可见性、下一代标记及运行时性能。CPU 投影通过不代表引线遮挡或版面截图通过。
