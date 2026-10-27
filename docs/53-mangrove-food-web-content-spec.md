# 53 · 红树林食物网 · 内容施工 spec（mangrove-food-web，SpaceScene）

SpaceScene / Model3DStage；paper 默认、cinema 可切。原型：生境剖面 + 标本近景 + 试一试。目标：读者能把环境条件、适应和食物关系连起来，用证据解释移走一种生物的直接与间接影响，并说清模型的边界。[C01–C06,F29–F30]

2026-10-27 定稿，按 BUILD brief 在本 worktree 执行；status **published**。阅读优先级：§9 施工记录 → 本规格 → research 准备稿。事实 ID 已逐个对照主 checkout 的 facts.json / facts-extra.json；F30 是 DESIGN/SIM，不能当作实测。§0 为代 Gavin 作出的默认决定，无待答阻塞项。

## 0. 决策记录（2026-10-27，供 Gavin 审阅；均有默认值）

| # | 默认决定 | 理由 / 事实依据 |
|---|---|---|
| D1 | slug `mangrove-food-web`；subject science；levels P6；engine space-scene；stage model3d；status published（用户指定） | 直接对齐环境相互作用；本轮按指定状态施工。[C01–C06] |
| D2 | 命名背景是双溪布洛；泥岸为独立教学模型，不复刻路线、面积或种群数 | 无地图、无地理边界、无运行时请求。[F01,F30] |
| D3 | 背景章 + 7 主章，36 拍 | 先辨对象与条件，再解释路径与变化。[C01–C06,M01–M04] |
| D4 | Api-api Putih 与 Bakau Minyak 是两株独立模型；盐腺只归前者 | 避免把所有根型和排盐方式混成一棵树。[F04–F07] |
| D5 | 食物网只画 6 个功能节点、6 条可能取食关系；两条蟹→鱼边有 medium 证据标记 | 不是同地点、同季节完整实测网；保留文献差异。[F13–F16,F23–F25,F30] |
| D6 | 复用 `table`，构建期枚举图内食物路径，完全不算种群增长、死亡时间、能量比例 | 预测数字不足以由拓扑推出；SIM 读数是节点/连线计数；不新增 solver。[F29–F30] |
| D7 | 潮位为 low/high 两种示意姿态；不报时间、海拔、涨落周期或预报 | 水面与蟹移位复用 offset；潮位不改变生物取食能力参数。[F02,F12,F15,F30] |
| D8 | 复用 environment 三图，copy 并记录 reusedFrom；新生成 0 张 | 图像已逐张复核；正好覆盖生境、根、捕食三个重点。[F04,F06,F10,F26,F30] |
| D9 | EN 默认，简体 ZH 独立成文；不拟人、不写目的论、不默认出测验 | 用先猜后看、记录和解释支持科学推理。[C05–C06,M01–M03] |
| D10 | CC BY-NC-SA 家族：原创文本、图布局、parts 设计与复用内生 art；不导入 Commons BY-SA 几何/纹理 | BY-SA 参考照片只阅读；若以后改为衍生资产，独立文件及 carve-out。[D02,D04–D05,F30] |

### 0.1 非阻塞的选择

Gavin 可将 6 功能节点改为更窄的实测物种网；默认保留为条件性的教学关系，来源标签明确区分索引/报告，不将精确配对当本地实测。可删去这两条边并用另一份 fixture，但必须整体重算 §4、§5 的数字；不能只换 caption。[F23–F25,F30] 其他默认：标题“红树林食物网”；主线用“弹涂鱼”，详情附学名；“苍鹭”和“大弹涂鱼”仍标编辑待核译名；无地图、无现场采集、无数量动态。[L01–L03,F29–F30]

## 1. 课纲对照与范围

### 1.1 学习锚点与可见证据

| 事实锚点；MOE 印刷页 / PDF 页 | 本主题的可见证据 | 章 / 拍 |
|---|---|---|
| C01；67 / 68 | 条件、食物与其他生物分开标明 | 01.3–4、07.2 |
| C02；67 / 68 | 阳光入口、食物方向、条件不利与移动/死亡的可能性 | 04 全章、06.6 |
| C03–C04；68 / 69 | 单只、同类及混合群落；红树林生境 | 01.1–2 |
| C05；69 / 70 | 结构→作用→对应挑战；行为与结构比较；种子传播回链 | 02.3–4、03 全章 |
| C06；67、70 / 68、71 | 改变量、不变量、观察量；正负人类影响 | 06 试一试、07 全章 |
| C07；71–73 / 72–74 | Foundation 用自己的 scope/动词核对；界面不分流 | 同一画面，正文浅层解释 |

逐字短引和原始 PDF hash 见 dossier/quote-audit.json；不在此重复长引。页面号不混为 PDF 序号。[C01–C07]

### 1.2 主线、细看与交叉链接

主线：生存条件、生物尺度、潮水、结构/行为、生产者/消费者/分解者、捕食者/猎物、食物链/网、人类影响。[C01–C06] 细看：盐处理的物种差异、微生物、样本与一般食性的区别、真实生态模型需要的额外数据。[F05,F17,F23,F29] 不引入 Lotka–Volterra 方程、统一 10% 规律、毒性曲线或无限增长。[F19,F29–F30]

| 现有 topic，实际 status | 本主题分工与回链 |
|---|---|
| living-things，published | BG、01；分类与特征不重讲；其 sort 不能代替食物网因果求解。[F30] |
| plant，published | 03、04；光合作用机理与根叶运输回链，本主题只用其结果。[F04,F18] |
| flower-and-seed，published | 03.5；结构帮助种子传播，补足适应的繁殖用途。[C05] |
| energy-conversion，published | 04.5；能量形式细节回链。[F18–F19] |
| heart-and-lungs，published | 03.3；比较气体交换，不把鱼画成肺呼吸。[F08] |
| water / four-taps，published | 02 细看；降雨/水循环与潮水不同。[F02,F30] |
| singapore-land-use，draft | 07 的未来交叉链接，发布时再决定是否显示；本次不改该主题。[F22,F30] |

本轮互链：living-things 的 four-big-groups、plant 的 roots-and-water、energy-conversion 的 energy-from-the-sun 各加一句双语导航；其余只由本主题链接既有课文。未发布 singapore-land-use 不生成链接，记 REVIEW.md。

### 1.3 误解与 PSLE 推理落点

M01：直接效应之外的路径 → 06.3–4；M02–M03：看不见的分解作用、能量和物质 → 05.2–4；M04：永久平衡 → 06.5–6。箭头反读、根型混合、瞬时灭绝是编辑风险假设，不能写成新加坡调查结果。[M01–M04,F04,F19,F29]

PSLE 练习形式为原创：从图提取关系、选出改变和保持的量、依据两行记录比较、用“因为…所以…；在…条件下”解释。没有考试频率承诺、不抄现成题。[C06,F30]

## 2. 事实与模型数值

### 2.1 引用纪律

正文每一科学陈述对应父 dossier ID；由 §6 来源表转成 sources.json 的 S#，数字用 `<Num s>`，字幕/detail 的模拟数字明确写“在这个模型里”。本草案表格末列或句末的 fact ID 同时管 EN/ZH 两份文案。[F30] 参考文献未读全文处保留 medium 标签，不升级为实测事实。[F16,F23–F25]

| 类别 | 使用值或处理 | 来源 |
|---|---|---|
| FACT | 两种根型、鱼的胸鳍与鳃腔、雄蟹大螯等，见 dossier | F04–F12 |
| DESIGN | 泥块 x±0.8、z±0.5，泥面 y=0；最高树冠 y=0.95；模型单位可用 m，但不显示真实比例尺 | F30；所有坐标只是教学布局 |
| SIM | 6 节点、6 边；移走一个图中节点后的可达数和边数 | F30；§4 确定算法 |
| SIM | low 水面 y=-0.04；high y=0.10；树蟹沿 Y 上移 0 / 0.16 | F30；示意姿态，无真实潮位 datum |
| OMIT | 不报真实种群、发生速度、死亡数量、碳值或污染阈值 | F22–F23,F29–F30 |

设计研究来源（未来 sources.json 的 design:true）：本主题为独立生境示意，绘制数量不代表野外数量；食物网只分析选入的可能取食边。移走表示关闭一个节点的持续食物供应及相关边，未模拟残存落叶、尸体、繁殖、迁移、其他食物和微生物速率。高潮/低潮只改显示姿态，不计算水动力或种群。[F29–F30]

### 2.2 网络证据表

| 节点 ID | 显示名 EN / ZH | 食物类型 / part 引用 | 事实 |
|---|---|---|---|
| n-mangrove | Mangrove leaf supply / 红树叶片供应 | producer；bakau-tree；叶片输入，不是把死叶当活生产者 | F14,F18,F30 |
| n-algae | Surface algae / 泥面藻类 | producer；algae-patch；功能组，不假称一个物种 | F13,F18,F30 |
| n-fiddlers | Fiddler crabs / 招潮蟹 | consumer；fiddler-crabs；群组图标 | F11–F13 |
| n-tree-crabs | Climbing crabs / 攀爬蟹类 | consumer；tree-crabs；功能组，叶食/食藻关系可来自不同物种 | F14–F16 |
| n-mudskipper | Giant mudskipper / 弹涂鱼 | consumer；giant-mudskipper；P. schlosseri | F08–F10 |
| n-heron | Heron / 鹭 | consumer；heron；主线不把文献的 herons 强收窄成苍鹭独有记录 | F10,F26 |

| 边 ID；from → to（食物→消费者） | 证据范围 | label / 材料 | fact IDs |
|---|---|---|---|
| e-leaves-tree；n-mangrove → n-tree-crabs | Sungei Buloh 落叶取食 | Leaf material / 叶片；material=leaf-litter | F14 |
| e-algae-tree；n-algae → n-tree-crabs | indexed illustrated account；medium；功能组中不同蟹类的条件关系，非单一Episesarma食谱 | Algae / 藻类；material=feeding | F16 |
| e-algae-fiddlers；n-algae → n-fiddlers | 非新加坡的观察报道；medium | Algae / 藻类；feeding | F13 |
| e-fiddlers-fish；n-fiddlers → n-mudskipper | 一般指南与局地样本不同；medium | Crab prey / 蟹类食物；feeding | F10,F23,F25 |
| e-tree-fish；n-tree-crabs → n-mudskipper | 论文报告的机会取食观察；medium | Crab prey / 蟹类食物；feeding | F24 |
| e-fish-heron；n-mudskipper → n-heron | NParks 明述 herons 捕食 giant mudskipper | Fish prey / 鱼类食物；feeding | F10 |

这是“可能关系的教学节选”。树蟹吃藻的行为资料与落叶资料不保证同一潮时发生；相同线宽绝不表示相同食量。太阳是能量入口，不算食物节点；菌类、细菌和其他鱼保留在生境/细看中，不假称这 6 点包含所有生物。[F13–F19,F23–F25,F30]

## 3. 对象、写实与零件计划

### 3.1 分区、布局与参考

Y 向上，+Z 朝观者。生境为 1.6×1.0 的示意泥块；上方植物/鸟，前缘潮沟，右侧分开的根与微生物近景。不同近景均写“示意，不按比例”，没有经来源核实的实长就不启用比例尺。完整外观使用 assembled；爆炸模式只分离根剖面标本，生物与栖息泥块 explode.dist=0。[F04–F10,F30]

| 分区 | group | 内容 | token 语义 |
|---|---|---|---|
| 01 | habitat | 泥、水、洞口 | neutral / cold（水），与其他功能不冲突 |
| 02 | mangroves | 两株树、两套根与落叶 | 既有 plant 材质族 / ink |
| 03 | animals | 蟹、鱼、鹭 | 既有有机体材质，选中仅 signal |
| 04 | closeups | 藻面、菌、细菌、鳃腔示意 | ink；示意倍数文字，无假比例尺 |
| 05 | food-paths | 只有能量路径流 | en-light；连线方向另有箭头与文字 |

root/动物 Tier-1：Avicennia 铅笔根从侧根向上连接；Rhizophora 支柱根从干/枝向下入泥；鱼有两只眼、胸鳍而非四肢；蟹 4 对步足 + 1 对螯足、眼柄清楚；雄 fiddler 一大一小螯；鹭两腿、长颈与喙。蟹附肢建模前以开放 reference 再核，不能只照通用球形蟹。[F04,F06,F08–F11,F26,F30,X01]

### 3.2 零件清单（18 selectable + 2 context，设计数）

| id / 分区 | primitive 与位置起点 | summary 要点 / 功能 | 连接/显示与来源 |
|---|---|---|---|
| mud-bank / habitat | extrude，中心[0,-.15,0] | 提供泥面与水道边界 | shell；CUTAWAY 露根；F02–F03,F30 |
| tidal-water / habitat | 薄 box，中心[.2,-.04,.2] | 水平水面显示两种潮位 | offset；不称体积守恒水池；F02,F30 |
| burrow-mouth / habitat | 环/短管，[-.25,0,.3] | 洞口标示躲藏处 | 独立可点，不因蟹隐藏就消失；F12 |
| api-tree / mangroves | sweep+leaf extras，[-.45,0,-.1] | 叶与树体 | connects api-lateral；F04–F05 |
| api-lateral / mangroves | 分叉 sweep，[-.45,-.03,0] | 地下侧根连接树体 | 剖面可见；F04,F07 |
| api-pencil / mangroves | tapered cylinder repeat，不等间距 | 伸出泥面的根帮助气体交换 | 接 api-lateral；不是独立棍；F04,F07 |
| bakau-tree / mangroves | sweep+leaves，[.2,0,-.2] | 提供叶片与栖息结构 | n-mangrove 映射；F06,F14,F20 |
| bakau-prop / mangroves | arching sweeps，接干入泥 | 支撑树体 | 不和 api 根混在一株；F06 |
| fallen-leaves / mangroves | 扁 extrude，[-.1,.005,.1] | 展示叶片输入 | 移走树时仍可留残叶；诊断只关闭持续供应；F14,F30 |
| algae-patch / closeups | 扁 patch，[.05,.005,.35] | 光合食物来源之一 | n-algae；不是肉眼可见巨大单细胞；F13,F18 |
| fiddler-crabs / animals | carapace+appendages，[-.35,.02,.28] | 小螯进食；大螯展示 | 一个群组 selectable；图内 removal 全体同步；F11–F13 |
| tree-crabs / animals | 扁甲与对称螯，[.22,.02,-.18] | 取食叶/藻，高潮上移 | offset 在干前，腿接触树皮；F14–F16 |
| giant-mudskipper / animals | lathe/sweep+paired fins，[.25,.025,.32] | 捕食，也被捕食 | 不画肺或腿；F08–F10,F28 |
| heron / animals | 有机 sweeps+bill/legs，[.55,0,.08] | 以鱼等为食 | 脚与泥/水接触；只泛称鹭；F10,F26 |
| small-fish / animals | lathe+fins，[.35,-.06,.25] | 表示图外的其他鱼类 | 不连到求解网；详情明示被省略食物；F10,F26,F29 |
| bacteria-inset / closeups | 克制小细胞示意，右侧小框 | 说明微生物分解 | 不假装泥块上的巨大细菌；F17,F30 |
| fungi-inset / closeups | 分枝丝体示意，同近景框 | 说明真菌分解 | 不用一个蘑菇代表全部过程；F17,F30 |
| gill-inset / closeups | 简单 cavity 壁，右侧独立 | 说明鳃腔保水 | 示意，不做未核解剖断面；F08,F30 |
| boardwalk-edge / context | box，泥块远侧 | 提示观察边界 | 不可点、不投影、不进索引；F30 |
| specimen-base / context | 薄 box，泥块下 | 展示模型 | 无地理含义，不加装饰；F30 |

模型坐标/表观数量均为 F30，不冒充典型生物尺寸。summary 实现时 EN ≤60 chars，ZH 一句动作+功能；detail 两段解释结构和条件，第三段说明不足或变化影响，并携带对应事实来源。照明、材质与 HUD 按 docs/08，不用照片纹理。[F30]

### 3.3 流、动画、模式与预算

六条 feeding flow 路径与 §2.2 边对应，但只在低潮演示中显示：高水位/树蟹上移时关闭 3D feeding particles，二维网络卡仍能读。路径是示意关系，不表示动物实际追逐路线；端点从内容坐标生成，贴近取食部位。[F30] 太阳入口仅用卡片符号与文字，不画生物吞食太阳；分解近景另做讲解，不把 nutrient-return 放入 feeding solver。[F17–F19]

已有 offset 移水/蟹；visible 移走节点；intensity/visible 控制流；相机过渡、PRESENT 和减少动态均复用。X-RAY 只使泥壳透明；CUTAWAY 切泥显示根，动物 clip:false；EXPLODED+FLOW 遵守引擎禁用规则。无新骨骼 rig、纹理或三方库。[F30]

预算目标：静止<50、运转<60 calls，硬上限100；三角形<0.3M；六条单路径流、合计≤144粒子，FLOW 增幅<10 calls。若超预算，先简化远处叶片/菌体和标本重复，再核 Tier-1；不可删除关键附肢来达标。首屏 JS ≤300KB gz；内容与依赖全本地。以上为未来验收目标，未实测。[F30]

## 4. 引擎契约（最终：删除 solver，仅保留 directed card）

### 4.1 现有能力核查与分支隔离

已读 main 的 docs/06、sort-schema/table-schema、lib/sim/sort/table/bind、PartChainCard/KeyCard/TryIt。sort 是特征分类，不算摄食；**table 足够表示本课全部有限组合**，已有 sources、预测、记录、choice、visible、offset、flow intensity。因此删除 E-MW1 food-web sim/registry/向量输出/新 bindings。用内容构建期确定图遍历生成表，运行时只查表。原草案“硬编码不适合复用”不是新增 solver 的理由。

检查 `git log main..codex/<b>` 与 `git show` 的 docs/06：monsoon-engine 为 monthly climatology；sem-engine 为 orbit-rotation；airfoil-content 为 airfoil；dinosaur 相对 main 无独有 engine 改动；plates 为 reference layers/catalogue/impact。均不提供所需卡片，也不依赖它们。main 已有 steam mechanism、table/pose、sort、light、magnet、circuit、materials；本主题只用 main 的 table/primitive/bindings。

PartChainCard 是无方向的结构连接，KeyCard 是分类流程，EnergyCard 假设能量份额与守恒；不能借它们暗示食物链能量百分比。保留 **E-MW2 一个可选 directed card**，不增加新的求解种类、URL、时钟或键位。

### 4.2 内容 table 合同（已有 schema）

controls 沿用准备稿：remove = none + 六节点，inspect = 四消费者，tide = low/high。默认 none/n-mudskipper/low。输出全部 number/state（不使用 vector），最多32项：

- web：keys [remove]，7行，输出 present-count/supported-count/active-links、六个 `status-<node-id>` 状态、六个 `active-<edge-id>` 0/1。
- inspection：keys [remove,inspect]，28行，输出 foods、food-status。
- tide-pose：keys [remove,tide]，14行，输出 water-rise/crab-rise/show-fiddlers。

合计20输出、49行。所有行 source:[S30]，源编号 runtime 去前导零（S01→S1）。状态恰含 unchanged/fewer-foods/no-shown-food/removed，标签见草案语义；producer 无入边时视为 unchanged，移走优先。

构建脚本从 authoring/food-web.json 原图每次重算：present=非移走；supported 从未移走 producer 按拓扑向下传递；active edge=两端present且from supported；foods=有效入边数。baseFoods=原图入度；少于baseline且大于0为fewer；0为no-shown-food。不支持的动物仍可见。`directLoss`/`indirectLoss`/`released` 只作内容测试与解释，不需要新输出或人口动态。残叶不因供应节点移走而消失。

bindings 复用：remove != 节点id 控制关联part显隐；show-fiddlers 控制招潮蟹；water-rise/crab-rise 沿Y offset；六条独立流分别读 active-edge 的 number intensity，tide=low 才显示。高潮仅改变姿态/藏洞显示，不改图的支持数。六条流各≤24粒子，总≤144；FLOW增加≤6 calls。

### 4.3 E-MW2 精确数据形状

`sim.kind:"table"` 可加可选 `foodWeb`（所有对象 strict）：

```ts
foodWeb: {
  inspect: string; // 已有choice control，options恰为consumer节点id
  nodes: Array<{id:string; label:{en:string;zh:string}; role:'producer'|'consumer';
    parts:string[]; d:[number,number]; output:string; sources:string[]}>;
  edges: Array<{id:string; from:string; to:string; output:string;
    evidence:'general'|'local-observation'|'reported-observation'|'indexed-only';
    sources:string[]; note:{en:string;zh:string}}>;
  note:{en:string;zh:string};
}
```

d 使用归一化坐标，安全区 x∈[.22,.78]、y∈[.10,.90]；卡片320×380。node.output 引用上述状态；edge.output 引用0/1数输出。节点最多12、边最多48。使用原图6节点/6边。图layout固定，无force/random。来源元数据不是下载许可；facts 映射保存在 authoring/food-web.json / AUDIT.md，不强塞进 runtime schema。

validation：重复id/边、自环/未知端点/循环、producer入边、consumer无源、未知context part、共享part、坐标不有限或不在安全区、unknown inspect/control/options、node输出非state或状态标签不全、edge输出非number、来源不存在、note空白均含具体path。限制只针对本教学DAG，不声称真实食物网必然无环。来源校验接入validate-content已有source流程。

卡片置换桌面右上PartChainCard；窄屏在reader（无try-it时也有）。食物→消费者箭头、active实线/断开虚线；四状态同时用文字与边框区分。medium证据独立标记+SourceRefs+note。点击节点只选首个part；inspect与selected分别标记。键盘Tab/Enter/Space；控件/按钮≥44CSS px；不能通过点击节点删除。可见文本列表覆盖窄屏/读屏，卡片不依赖hover。使用现有token，不增加动画。

hooks `.space-food-web`、`[data-food-node][data-present][data-supported][data-inspect]`、`[data-food-edge][data-active][data-evidence]`。读数继续 `__atlas.engine.sim()`，不新增test API。

### 4.4 数值测试与fixture

| remove；inspect（默认mudskipper） | present | supported | active | foods；state |
|---|---:|---:|---:|---|
| none | 6 | 6 | 6 | 2；unchanged |
| n-fiddlers | 5 | 5 | 4 | 1；fewer-foods |
| n-tree-crabs | 5 | 5 | 3 | 1；fewer-foods |
| n-algae | 5 | 4 | 3 | 1；fewer-foods |
| n-algae；n-fiddlers | 5 | 4 | 3 | 0；no-shown-food |
| n-mangrove | 5 | 5 | 5 | 2；unchanged |
| n-mudskipper；n-heron | 5 | 4 | 3 | 0；no-shown-food |
| n-heron | 5 | 5 | 5 | 2；unchanged |
| n-mudskipper；n-mudskipper | 5 | 4 | 3 | 0；removed |

7 remove × 2 tide × 4 inspect=56组合均对照prep model-checks.json。high: .14/.16/show-fiddlers=0；low:0/0/1（被移走的蟹仍0）。supported/active/foods不随tide变化。remove algae：招潮蟹directLoss、鱼indirectLoss，鹭lost=0；remove heron只少一个捕食者，不生成数量增长。

predict defaults none/n-mudskipper/low → remove n-fiddlers，foods2→1，means=less。vary remove；also inspect；keep tide/同一组选入关系；observe foods,food-status,active-links；record:true，不加timeline/replay。

draft `sample-food-web` 使用简单primitive+table，验证新卡全部视觉/证据状态；专用unit/e2e与docs/06作者说明。未知source/part/output、重复边、循环、错状态/控件等negative cases必测。真实topic另加字幕/数量/表与图一致性测试。

## 5. 章节与逐拍文案（EN + 简体 ZH；施工以核查后的表述为准）

### 5.0 章状态总约定

所有章从完整默认状态重新合成，hide/labels 不累积。默认 assembled、run:false、cutaway:none、explode:0；sim={remove:none,inspect:n-mudskipper,tide:low}。常规隐藏 bacteria-inset,fungi-inset,gill-inset；近景拍显式开关。所有章均有18件物体所在的4组+food-paths，未提到的组可在作者数据中按章裁切，但索引与拍对象必须可见。卡里的来源不因几何隐藏而删除。表中 camera 是 §7 的预设，state 差量每次叠在本章默认上，不叠在上一拍上；beat 未列出的默认隐藏仍生效。microbe-view 的两个微生物从各自初始位置的独立近景框显示。[F30]

| 章 | id | 拍数 | camera | sim 起点 |
|---|---|---:|---|---|
| BG | `before-you-start` | 3 | hero | none / low / n-mudskipper |
| 01 | `one-habitat` | 4 | habitat-view | none / low / n-mudskipper |
| 02 | `changing-tides` | 4 | tide-view | none / low / n-mudskipper |
| 03 | `structures-and-behaviour` | 5 | roots-view | none / low / n-mudskipper |
| 04 | `sunlight-and-food-chains` | 5 | web-view | none / low / n-mudskipper |
| 05 | `leaves-and-food-webs` | 5 | web-view | none / low / n-mudskipper |
| 06 | `removing-a-species` | 6 | web-view | none / low / n-mudskipper |
| 07 | `human-impact-and-evidence` | 4 | habitat-view | none / low / n-mudskipper |

### 5.1 BG · `before-you-start`

- **标题**：Before you start / 开始之前
- **探究问题**：这张图能告诉我们什么，又省略了什么？
- **summary**：Explore a mangrove model, then follow the food pathways it shows. / 先观察红树林模型，再沿着它选入的食物路径读图。 [F01,F04,F07,F10,F29,F30]
- **正文提纲**：模型与真实地点；操作选中对象、读箭头；同一生境的物理条件和生物。 [F01–F03,F30]
- **细看**：模型边界；living-things 回链；图中数量不是实测。 [F29–F30]
- **本章索引**：`mud-bank, bakau-tree, api-tree, giant-mudskipper, heron`；每个对象可点。
- **试一试**：无控件卡；通过拍与选中对象读图。需要先猜时用旁文提示，不默认加测验。[F30]

| 拍 | state（本章默认上的差量） | Caption EN | 字幕 ZH | fact IDs |
|---|---|---|---|---|
| 1 | camera hero; labels bakau-tree,giant-mudskipper; run false | This cutaway is a teaching model inspired by Singapore mangroves. It is not a surveyed map of Sungei Buloh. | 这是一块参考新加坡红树林的教学剖面，不是双溪布洛的测绘地图。 | F01,F30 |
| 2 | camera roots-view; cutaway mud; labels api-lateral,api-pencil | A root close-up reveals a connected system below and above the mud. | 根部近景把泥上和泥下相连的根系显露出来。 | F04,F07 |
| 3 | camera web-view; labels giant-mudskipper,heron; card all | The selected links show food reaching consumers. Many other links are outside this model. | 选入的线表示食物传给消费者；许多其他关系没有画进这个模型。 | F10,F29,F30 |

### 5.2 01 · `one-habitat`

- **标题**：One habitat, many populations / 同一片生境
- **探究问题**：一只、同类一群和整个群落有什么分别？
- **summary**：A habitat contains living things and physical conditions. / 生境中既有生物，也有物理条件。 [C01,C03,F06,F20,F30]
- **正文提纲**：从一只鱼到同类再到不同种类；环境条件、食物与庇护分别解释。 [C01,C03–C04,F20]
- **细看**：一个图标表示关系对象，不是全体数量；观察未见不等于不存在。 [F29–F30]
- **本章索引**：`giant-mudskipper, fiddler-crabs, api-tree, mud-bank, tidal-water, algae-patch`；每个对象可点。
- **试一试**：无控件卡；通过拍与选中对象读图。需要先猜时用旁文提示，不默认加测验。[F30]

| 拍 | state（本章默认上的差量） | Caption EN | 字幕 ZH | fact IDs |
|---|---|---|---|---|
| 1 | labels giant-mudskipper; part giant-mudskipper; focus individual | This individual mudskipper is an organism. A population is the same kind living and reproducing in a place at a time. | 这一只弹涂鱼是一个生物个体；种群是在一定地点和时间生活、繁殖的同类生物。 | C03 |
| 2 | labels group:animals,group:mangroves; card population-list | Different populations living together form a community. The mud and water are conditions around them. | 不同种群生活在一起，组成群落；泥和水是它们周围的环境条件。 | C01,C03 |
| 3 | labels mud-bank,tidal-water,api-tree; card conditions | Temperature, light and water are physical factors. Available food and other organisms also matter. | 温度、光和水是物理因素；食物供应和其他生物也影响生存。 | C01 |
| 4 | labels bakau-prop,small-fish; part bakau-prop | Roots can provide shelter as well as support a plant. A feeding diagram does not show every kind of interaction. | 根既能支撑植物，也能提供躲藏处；食物图没有显示全部相互作用。 | F06,F20,F30 |

### 5.3 02 · `changing-tides`

- **标题**：Changing tides / 潮水改变条件
- **探究问题**：水面上升后，没看见蟹就等于没有蟹吗？
- **summary**：Rising and falling water changes which parts of the mudbank are exposed. / 水位涨落会改变泥岸露出的部分。 [F02,F12,F15,F30]
- **正文提纲**：比较同一模型两种姿态；洞口保留；树蟹沿干上移；观测条件不能混同种群变化。 [F02,F12,F15,F30]
- **细看**：涨退潮与下雨不混为一个过程；上树原因是有根据的解释而非唯一目的。 [F02,F15,F30]
- **本章索引**：`tidal-water, mud-bank, burrow-mouth, fiddler-crabs, tree-crabs, bakau-tree`；每个对象可点。
- **试一试**：vary tide；keep remove；observe water-rise,crab-rise；record:true。数字名始终写“示意位移”，无实测潮高单位。高水位藏蟹但节点不删除。[F12,F15,F30]

| 拍 | state（本章默认上的差量） | Caption EN | 字幕 ZH | fact IDs |
|---|---|---|---|---|
| 1 | sim tide low; labels tidal-water,mud-bank; run false | At this low-water pose, more of the mudbank is exposed. The water heights are diagrammatic. | 在这个低水位姿态里，更多泥岸露出来；这里的水位高度只是示意。 | F02,F30 |
| 2 | sim tide high; labels tidal-water,burrow-mouth; food flow off | Water covers more mud at the high-water pose. This does not count how many animals live here. | 在高水位姿态里，水盖住更多泥面；这不能告诉我们这里有多少动物。 | F02,F30 |
| 3 | sim tide high; labels burrow-mouth; part burrow-mouth | Fiddler crabs can stay in burrows at high tide. Hidden from view does not mean removed from the food web. | 高潮时，招潮蟹会留在洞里；看不见它，不等于把它从食物网移走。 | F12,F30 |
| 4 | sim tide high; labels tree-crabs; part tree-crabs | Some mangrove crabs climb above incoming water. Avoiding aquatic predators is one possible explanation. | 有些红树林蟹会爬到涨水水面上方；减少遭遇水中捕食者是一种可能解释。 | F15 |

### 5.4 03 · `structures-and-behaviour`

- **标题**：Structures and behaviour / 结构与行为
- **探究问题**：怎样把一个结构连到它解决的困难？
- **summary**：Different structures and behaviours help organisms cope with their surroundings. / 不同结构和行为帮助生物应对周围条件。 [C05,F04,F06,F07,F08,F09,F11,F12,F15]
- **正文提纲**：每个例子用条件→结构或行为→作用解释；两株树分开；身体比较不深入未核解剖；最后回链繁殖适应。 [C05,F03–F11]
- **细看**：Avicennia 盐腺与其他盐处理方式；不写为了而演化；种子传播交 flower-and-seed。 [C05,F05]
- **本章索引**：`api-tree, api-lateral, api-pencil, bakau-tree, bakau-prop, giant-mudskipper, gill-inset, fiddler-crabs`；每个对象可点。
- **试一试**：无控件卡；通过拍与选中对象读图。需要先猜时用旁文提示，不默认加测验。[F30]

| 拍 | state（本章默认上的差量） | Caption EN | 字幕 ZH | fact IDs |
|---|---|---|---|---|
| 1 | camera roots-view; cutaway mud; labels api-pencil,api-lateral | Api-api Putih has pencil-like roots rising from shallow lateral roots. These take in oxygen above the muddy soil. | Api-api Putih 的铅笔状根从浅层侧根向上伸出，在泥面上方吸收氧气。 | F04,F07 |
| 2 | camera habitat-view; cutaway none; labels bakau-tree,bakau-prop | This separate Bakau Minyak has prop roots supporting its trunk in soft mud. The two root systems belong to different trees. | 旁边这株 Bakau Minyak 由支柱根支撑在软泥里；两套根系属于不同的树。 | F04,F06 |
| 3 | camera animal-view; labels giant-mudskipper,gill-inset; unhide gill-inset | This mudskipper is a fish. Its gill chambers and skin help it breathe out of water, and pectoral fins help it move. | 这只弹涂鱼是鱼。鳃腔和皮肤帮助它离水呼吸，胸鳍帮助它移动。 | F08,F09 |
| 4 | camera animal-view; labels fiddler-crabs; hide gill-inset | A male fiddler has one enlarged claw and a small feeding claw. Climbing or retreating into a burrow is behaviour. | 雄招潮蟹有一只大螯和一只取食小螯；爬高或躲进洞里则属于行为。 | F11,F12,F15 |
| 5 | camera hero; labels api-pencil,bakau-prop; card adaptation-summary | Describe the feature or action and how it helps survival. Dispersal structures are another example, explored in Flowers and Seeds. | 解释结构或行动怎样帮助生存；帮助种子传播的结构也是例子，可以接着看《花与种子》。 | C05 |

### 5.5 04 · `sunlight-and-food-chains`

- **标题**：From sunlight to food chains / 从太阳到食物链
- **探究问题**：箭头表示谁追谁，还是食物传给谁？
- **summary**：A food chain follows feeding energy from food to consumer. / 食物链沿取食关系追踪能量，从食物指向消费者。 [F10,F13,F18,F19,F23,F25,F28,F30]
- **正文提纲**：太阳→生产者→消费者；逐条读一条可能链；同一鱼的双重关系；最后区分模型线与当地样本。 [F10,F13,F18–F19,F23–F25,F28]
- **细看**：能量形式交 energy-conversion；图二是一般鹭吃鱼，不声称小鱼就是 giant mudskipper。 [F10,F19,F26,F30]
- **本章索引**：`algae-patch, bakau-tree, fiddler-crabs, giant-mudskipper, heron, small-fish`；每个对象可点。
- **试一试**：无控件卡；通过拍与选中对象读图。需要先猜时用旁文提示，不默认加测验。[F30]

| 拍 | state（本章默认上的差量） | Caption EN | 字幕 ZH | fact IDs |
|---|---|---|---|---|
| 1 | labels algae-patch,bakau-tree; card solar-inlet; run false | Plants and algae use sunlight to make food. They are producers in these pathways. | 植物和藻类利用阳光制造食物，是这些路径中的生产者。 | F18 |
| 2 | labels algae-patch,fiddler-crabs; card highlight e-algae-fiddlers | An arrow goes from food to the organism eating it: algae to an algae-feeding crab. | 箭头从食物指向取食者：从藻类指向吃藻的蟹。 | F13,F18,F30 |
| 3 | labels fiddler-crabs,giant-mudskipper; card highlight e-fiddlers-fish; run true | General guides include crabs as mudskipper food. These selected links are possible feeding relationships, not a measured local menu. | 一般指南把蟹列为弹涂鱼的食物；这些线表示可能的关系，不是当地实测食谱。 | F10,F23,F25,F30 |
| 4 | labels giant-mudskipper,heron; card highlight e-fish-heron | A mudskipper can be a predator of crabs and prey for a heron. Its role depends on the relationship. | 弹涂鱼可以是蟹的捕食者，也可以是鹭的猎物；角色要看它与谁发生关系。 | F10,F28 |
| 5 | run false; card energy-exit; labels algae-patch,heron | Energy passes along feeding pathways, with some dissipated as heat. This model does not assign a fixed transfer percentage. | 能量沿取食路径传递，一部分散失为热；这个模型没有给各级设定固定传递百分比。 | F19,F30 |

### 5.6 05 · `leaves-and-food-webs`

- **标题**：Leaves, decay and a food web / 落叶与食物网
- **探究问题**：少一种食物，是否一定就没有其他食物？
- **summary**：Leaf material and algae connect several feeding pathways. Decomposers also obtain energy from dead material. / 叶片和藻类连起几条食物路径；分解者也从死亡物质中获得能量。 [F14,F16,F17,F18,F19,F30,M03]
- **正文提纲**：落叶输入；蟹碎化与微生物分解；两类箭头不可混；共享节点形成网，食物种类不是食量。 [F14,F16–F19,F30]
- **细看**：微生物近景不按比例；物质循环与能量传递分开；部分配对只读到索引或报告，不升级为同地点实测。 [F17,F19,F23–F25,F30]
- **本章索引**：`fallen-leaves, tree-crabs, algae-patch, bacteria-inset, fungi-inset, giant-mudskipper`；每个对象可点。
- **试一试**：无控件卡；通过拍与选中对象读图。需要先猜时用旁文提示，不默认加测验。[F30]

| 拍 | state（本章默认上的差量） | Caption EN | 字幕 ZH | fact IDs |
|---|---|---|---|---|
| 1 | labels fallen-leaves,tree-crabs; card highlight e-leaves-tree | Some mangrove crabs eat fallen leaves. Dead leaf material still contains food energy. | 有些红树林蟹吃落叶；死去的叶片仍含有食物中的能量。 | F14,F18 |
| 2 | camera microbe-view; unhide bacteria-inset,fungi-inset; labels bacteria-inset,fungi-inset | Crabs break leaves into smaller pieces. Bacteria and fungi also break down leaf material. | 蟹把叶片弄碎；细菌和真菌也会分解叶片物质。 | F14,F17 |
| 3 | camera microbe-view; card decomposer-energy; labels fungi-inset | Decomposers obtain energy from organic material too. They are not plants making food from sunlight. | 分解者也从有机物质中获得能量；它们不是利用阳光制造食物的植物。 | F17,F18,M03 |
| 4 | camera web-view; hide bacteria-inset,fungi-inset; card separate-nutrients | Materials can return to the environment through decay. Energy does not return to the Sun in a recycling loop. | 分解使物质回到环境中；能量不会绕一圈回到太阳再循环使用。 | F17,F19,M03 |
| 5 | labels tree-crabs,algae-patch,fallen-leaves; card all | This tree-crab node has two selected food inputs. Shared nodes connect chains into a web; equal lines do not mean equal meals. | 树蟹节点接着两种选入的食物；共享节点把食物链连成网，相同的线不表示相同食量。 | F14,F16,F30 |

### 5.7 06 · `removing-a-species`

- **标题**：Removing a species / 移走一种生物
- **探究问题**：直接损失和间接影响怎样区分？
- **summary**：Change one removal control and inspect which food pathways remain. / 只改变一次移走操作，再检查哪些食物路径还留着。 [F10,F14,F24,F26,F29,F30,M01]
- **正文提纲**：先猜后看2→1；另一种蟹替代食物；藻消失后的直接与间接诊断；捕食者移走的可能释放；真实外部食物与时间边界。 [F29–F30,M01,M04]
- **细看**：功能组和单一物种不同；这不是野外实验；图内无路径不等于灭绝；不显示死亡曲线。 [F29–F30]
- **本章索引**：`fiddler-crabs, tree-crabs, giant-mudskipper, heron, algae-patch, bakau-tree, small-fish`；每个对象可点。
- **试一试**：按 §4.4；07 从 none 再移走 fiddlers 记两行，observed foods 2→1。题意为模型比较，不把生态系统说成可控的真实公平实验。[F29–F30]

| 拍 | state（本章默认上的差量） | Caption EN | 字幕 ZH | fact IDs |
|---|---|---|---|---|
| 1 | sim remove none,inspect n-mudskipper,tide low; labels fiddler-crabs,tree-crabs,giant-mudskipper | Before the change, this model gives the mudskipper two shown food inputs. Predict what remains if the fiddlers are removed. | 改变前，这个模型给弹涂鱼画了两种食物输入；先猜移走招潮蟹后还剩什么。 | F30 |
| 2 | sim remove n-fiddlers,inspect n-mudskipper; labels tree-crabs,giant-mudskipper | In this model, the shown food count falls from two to one. The tree-crab pathway remains. | 在这个模型里，图中食物种类从两种减为一种；树蟹路径仍然留着。 | F24,F30 |
| 3 | sim remove n-algae,inspect n-fiddlers; labels fiddler-crabs,algae-patch; run false | Removing algae leaves no food pathway shown for the fiddlers. The animal symbol stays: this is not a prediction of immediate death. | 移走藻类后，图内没有给招潮蟹留下食物路径；动物图标仍在，这不表示预测它立刻死亡。 | F29,F30 |
| 4 | sim remove n-algae,inspect n-mudskipper; labels fallen-leaves,tree-crabs,giant-mudskipper | The mudskipper loses one input indirectly, but the leaf-to-tree-crab route still reaches it. Trace the whole path. | 弹涂鱼间接少了一种食物，但叶片到树蟹的路径仍能通向它；要沿整条路径解释。 | F14,F24,F30,M01 |
| 5 | sim remove n-heron,inspect n-mudskipper; labels giant-mudskipper; card released | Removing the heron removes one shown predator of the mudskipper. Fewer predators may matter, but this model does not calculate a population increase. | 移走鹭，就少了一个图中弹涂鱼的捕食者；捕食压力可能改变，但模型不计算种群增加多少。 | F10,F29,F30 |
| 6 | sim remove n-mudskipper,inspect n-heron; labels heron,small-fish; card boundary | No food path remains for the heron inside this excerpt. Other prey, movement and time could change a real outcome. | 在这个节选里，鹭没有剩余食物路径；真实结果还可能受其他猎物、迁移和时间影响。 | F26,F29,F30 |

### 5.8 07 · `human-impact-and-evidence`

- **标题**：Human impact and evidence / 人的影响与证据
- **探究问题**：怎样用证据解释环境变化？
- **summary**：Explain a change by identifying the condition, the pathway and the limits of the evidence. / 解释变化时，要指出条件、关系路径和证据的限度。 [C02,C06,F14,F20,F21,F27,F29,F30]
- **正文提纲**：树被清除的多种途径；污染改变条件；保育与修复；回到同图比较记录，给有条件结论。 [C06,F14,F20–F22,F27,F29]
- **细看**：开发有多种社会用途，生态作用只按证据写；不许污染滑块编死亡数；真实观察留在路径，不取走动物。 [F22,F29–F30]
- **本章索引**：`bakau-tree, bakau-prop, fallen-leaves, tidal-water, small-fish, tree-crabs`；每个对象可点。
- **试一试**：按 §4.4；07 从 none 再移走 fiddlers 记两行，observed foods 2→1。题意为模型比较，不把生态系统说成可控的真实公平实验。[F29–F30]

| 拍 | state（本章默认上的差量） | Caption EN | 字幕 ZH | fact IDs |
|---|---|---|---|---|
| 1 | sim remove n-mangrove,inspect n-tree-crabs; labels bakau-prop,small-fish,fallen-leaves | Clearing trees can change leaf supply and shelter. This food-path model shows only part of that effect; old leaves do not vanish at once. | 清除树木可能同时改变叶片供应和躲藏处；食物路径模型只显示部分影响，旧落叶不会立刻消失。 | F14,F20,F29,F30 |
| 2 | sim remove none; labels tidal-water,mud-bank; card changed-conditions | If conditions become unfavourable, organisms may survive with suitable adaptations, move elsewhere or die. A particular pollution effect needs evidence. | 当条件变得不利，生物可能凭适合的适应特征生存、迁到别处或死亡；某种污染物的具体影响还需要证据。 | C02,C06,F29 |
| 3 | sim remove none; labels bakau-tree,bakau-prop; card positive-actions | Conservation and reforestation are positive human impacts in the syllabus. Mangrove roots also contribute to shelter and coastal protection. | 保育和重新造林是课纲中的正面人类影响；红树根也能提供庇护，并帮助保护海岸。 | F20,F21,F27 |
| 4 | sim remove n-fiddlers,inspect n-mudskipper,tide low; record compare none/n-fiddlers | Compare two rows with the same tide pose and selected links. Explain what changed, cite the remaining pathway, and state what the model cannot tell you. | 比较同一潮位姿态、同一组关系下的两行记录：说明改变了什么、指出剩余路径，并说清模型不能回答什么。 | C06,F29,F30 |

### 5.9 拍数核对

BG 3 + 01 4 + 02 4 + 03 5 + 04 5 + 05 5 + 06 6 + 07 4 = **36 拍**。`beats.json` 是审计镜像，不是最终 chapter schema；由 `audit-preparation.py` 核对计数和 fact ID，再按既有模板转成 MDX。[F30]

## 6. 名词表与来源

### 6.1 主线 glossary 候选（18 个）

完整研究词库62条在 facts.json 与 dossier §h；其中 HK EDB 转简体不等于新加坡 MOE 认可。首次出现用 Term，中文独立解释。下表证据引 L01–L03 或 EDB 的逐条 locator；编辑译名仍保留待核状态。[L01–L03,F30]

| id | EN / ZH | 简短定义与跳转 | fact IDs / 术语证据 |
|---|---|---|---|
| organism | Organism / 生物 | 一个活的个体；01 | C03；S14 PDF110 |
| population | Population / 种群 | 一定时间地点生活、繁殖的同类；01 | C03；S14 PDF120 |
| community | Community / 群落 | 一起生活的不同种群；01 | C03；S14 PDF38 |
| habitat | Habitat / 生境 | 生物生活的地方；01 | C04；S14 PDF70 |
| mangrove-forest | Mangrove forest / 红树林 | 潮间带树木及相关生境；02 | F01–F03,L01 |
| producer | Producer / 生产者 | 这张图里用阳光制造食物的树和藻；04 | F18；S14 PDF123 |
| consumer | Consumer / 消费者 | 从其他生物或其物质获得食物；04 | F10,F14,F18；S14 PDF39 |
| decomposer | Decomposer / 分解者 | 分解死亡有机物的生物；05 | F17；S14 PDF44 |
| predator | Predator / 捕食者 | 在这一关系中捕食动物的一方；04 | F10,F28；S14 PDF121 |
| prey | Prey / 猎物 | 在这一关系中被捕食的动物；04 | F10,F28；S14 PDF122 |
| food-chain | Food chain / 食物链 | 一条食物到消费者的路径；04 | F18–F19；S14 PDF60 |
| food-web | Food web / 食物网 | 共享节点的多条食物路径；05 | F18,F30；S14 PDF61 |
| adaptation | Adaptation / 适应 | 有助于应对条件、取食、避敌或繁殖的结构/行为；03 | C05；S14 PDF8 |
| breathing-root | Breathing root / 呼吸根 | Api-api 伸出泥面吸氧的根；03 | F04,F07,L02 |
| prop-root | Prop root / 支柱根 | 支撑 Bakau 的根；03 | F06,L02 |
| intertidal | Intertidal zone / 潮间带 | 潮水涨退改变覆盖的岸带；02 | F02,L01 |
| detritus | Detritus / 碎屑 | 死亡有机物碎片，不同于人为垃圾；05 | F14,F17；S14 PDF47 |
| fiddler-crab | Fiddler crab / 招潮蟹 | 雄体有一大一小螯的蟹类群；03 | F11,L01；并列学名只在核实后填 |

### 6.2 来源映射

下表以研究 S# 稳定引用；未来内容 sources.json 保留同一编号数值，runtime 去前导零（S01→S1）。每个 source 的完整 accessed、access/licence 在 sources.json。S30 是 design:true；S13/S31 不能写成全文已读；S07 也只见索引文字。SOURCE表沿用research/sources.json，并落盘为data/sources.json与SOURCES.md。[F23–F25,F30]

## 7. HUD、镜头与配图

### 7.1 标题块与 PLATE

note EN: “Habitat teaching model · selected possible feeding links · schematic tide poses · no population forecast.” / ZH“生境教学模型 · 选入部分可能的取食关系 · 潮位姿态示意 · 不预测种群数量”。规格行最多4：Model / 模型=Habitat study；Web / 食物网=6 nodes · 6 links（DESIGN）；Tide / 潮位=Diagrammatic；Sources / 来源=Selected observations。不能把节点数当生物物种总数。[F29–F30]

PLATE telemetry ≤6：Present nodes / 未移走节点、Nodes with paths / 有食物路径节点、Active links / 有效连线、Shown foods / 图内食物种类；小数均0、tag SIM。潮位章改读 water-rise/crab-rise，明确场景位移，不叫实测潮高。右上 FoodWebCard 取代通用链路卡；底部只有章节轴。Reader=章头→拍→试一试→选中详情→正文→本章索引。界面图例不依赖 hover 或仅靠颜色。[F30]

### 7.2 相机（6个预设，坐标均 DESIGN）

| id | position | target | fov | 用途 |
|---|---|---|---:|---|
| hero | [2.2,1.7,2.6] | [0,.35,0] | 32 | 完整树、泥、水、动物 |
| habitat-view | [1.8,1.1,2.2] | [0,.2,0] | 32 | 同一生境与庇护 |
| roots-view | [-1.1,.45,1.2] | [-.35,.02,0] | 30 | 剖泥后侧根/呼吸根 |
| tide-view | [1.6,.5,1.6] | [.1,.05,.1] | 32 | 水面与洞口 |
| animal-view | [1.2,.45,1.3] | [.2,.08,.2] | 28 | 鱼、螯、鳃腔近景 |
| web-view | [1.9,1.4,2.1] | [.05,.25,.05] | 32 | 关系与节点仍看得清 |

microbe-view 为 05.2–3 的拍内 camera，position [1.4,.8,.9] target [1.05,.2,0] fov28，不占第7预设键；回到下一拍明确恢复。近景标本放 x≈1.05 的独立透明框，hero 不误作巨大野生微生物。实际镜头要经18件包围盒与手机验收。[F17,F30]

### 7.3 配图与 art provenance

| kind / 最终文件 | 章 | subject 与已核要点 | 来源与处理 |
|---|---|---|---|
| cover / mangrove-food-web.png | 目录/BG | 支柱根连续入泥、一个两眼弹涂鱼、水平潮沟；不标具体地点或尺寸 | copy environment/environment.png；F06,F08,F30 |
| figure / mangrove-food-web-breathing-roots.png | 03 | 呼吸根连地下侧根及幼树，不混支柱根；示意间距 | copy environment/environment-breathing-roots.png；F04,F07,F30 |
| figure / mangrove-food-web-predator-prey.png | 04 | 一只鹭、两条腿、一个水下小鱼、一株红树幼苗；不把小鱼鉴定为 giant mudskipper | copy environment/environment-predator-prey.png；F10,F26,F30 |

路径均在 `art/planned/mangrove-food-web/`。3张复用、0张新生成；不用 imagegen 重画已合适图。原始 subject prompt 与 source tries 留在 prompts.json/manifest.jsonl，tries=0 指本轮生成次数；sourceTries 保留历史。SHA-256、字节数与透明边距见 image-qa.json；副本和原图完全相同，原图不动。[F30]

风格逐张人工核：19世纪石墨技术图版、细轮廓/交叉排线/点描、严格中性灰、透明底，无纸纹、边框、文字、数字、箭头、标志、外部地面投影。机器核：cover 1024²；figures1536×1152；RGBA，R=G=B，alpha范围0–255，四边透明。原图均已满足，不作额外重采样或去底。[F30]

### 7.4 数据/许可落盘计划

未来 `parts.json`、`glossary.json`、原创章节/卡片布局/模拟常量：CC BY-NC-SA 4.0 家族；引用科学事实不复制其图片或图解。`food-web-fixture.json（仅研究输入，runtime改为table）` 是原创 NC-SA；微生物/根几何独立程序化，不照描 BY-SA 照片。内生 art 三图计划按 Atlas NC-SA 采用。此次未创建或修改 LICENSE-CONTENT。[F30,D04–D05]

若以后用 Commons Luth 照片推导网格/纹理，整个衍生文件必须 BY-SA，单独目录、归属及 carve-out，不能与本 NC-SA parts 派生数据混在同一文件。OSM 的 ODbL 派生数据库也独立保留义务。PROSEA 文本 licence 不涵盖插图；受限/by-agreement 资料不下载。当前没有任何此类混合衍生文件。[D02,D04–D05]

Deliverable B 在 `data/INVENTORY.md`：无地图、0数据集、0 bytes；无地图 keyframe/layer。备选地图来源只列清单；任何以后地图都须实际数据，不可手画边界。[D01–D03,F30]

## 8. 施工顺序与验收

Phase0 本规格；Phase1 仅E-MW2 card/schema/fixture/unit/docs/e2e；Phase2 内容/几何/双语/图像/审计/测试。用户授权本轮直接施工，无需另等定稿。无git写入、不改包/lock、不改review-queue/next-batch。新源/旧源只使用已读内容，不以索引升级全文证据；科学数字来自fact表或S30设计研究。

必跑 pnpm check/validate/test/build；Browser gates **按brief跳过**，由主session运行 `pnpm shoot mangrove-food-web --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`、sample-food-web、living-things、heart-and-lungs与 `CI=1 ATLAS_E2E_PORT=5441 pnpm e2e`。不得打开用户浏览器/桌面。视觉/手机/性能验收未执行时必须标待验，不写成通过。

发布值固定published。目录smoke counts随之+1 topic/+2 badges/+1 science，保留现有筛选计数；无地图、无外部请求。3图由scripts/illustrate.ts处理；原创内容不加第三方版权例外。所有18 selectable都在至少一个索引，可点；context不入索引。稿件无TODO/placeholder。

## 9. 施工记录

### 9.1 引擎记录（E-MW2）

新增可选 `sim.foodWeb` strict schema、table输出读取器、directed FoodWebCard、来源交叉校验与局部token CSS；桌面置换结构链路卡，窄屏在readerTop，即使背景章没有try-it也可读。没有新增solver、sim kind、binding、URL、clock、测试API或依赖。原草案E-MW1删除，状态由已有table查出。

最终shape同§4.3：节点id/label/role/parts/d/output/sources，边id/from/to/output/evidence/sources/note，加inspect/note。d归一化安全区x[.22,.78]/y[.10,.90]，图框320×380；native节点和来源按钮至少44px。四状态使用文字和边框，选中和inspect各自标记；箭头预留换行状态文字和选择行的空间，不引入随机布局。数据来源按已有SourceRefs展示。draft `sample-food-web`有背景与实验章、六节点六边、20输出49行；新单测37项与6条浏览器规约已写。docs/06新增作者说明。

### 9.2 内容与事实记录

真实主题 `mangrove-food-web`为published，science/P6，背景+7主章、36拍，18selectable+2context、5组、6条单路径流、144粒子、6预设、32来源、18术语、1封面+2正文图。每个术语EN/ZH各首现一次；索引并集覆盖18件。02有潮位卡，06/07有prediction与record；默认foods2→1比较；7个已发布主题的外链与3处双语回链完成。未发布的singapore-land-use链接省略。

作者图在 `authoring/food-web.json`，生成器 `scripts/geo/mangrove-food-web/build-topic.ts`由原图重新生成7+28+14行table，20输出。额外审计JSON放authoring，不能混入运行时data目录。全部56组合与准备期独立oracle一致；生产者移走后残叶仍显示，无路径动物不被当作死亡隐藏。高低潮仅改姿态和粒子显隐。

F16修订：攀爬蟹类合并不同种类；藻食/叶食关系不再声称为某一Episesarma物种同时发生的食谱。S7保留indexed-only，S13保留报告/个人交流的范围，S31换现行NParks指南URL但仍只读索引。科学事实/段落/字幕映射与访问限制见AUDIT.md，来源S1明确是准备阶段已有MOE PDF，没有绕过机器人验证。

### 9.3 模型与配图修订

模型为原创程序化生境；两种根型分开并连接，蟹保留四对步足及螯足/眼柄，鱼有双眼/胸鳍，鹭有两腿。CPU生成39,860三角形，31材质槽（默认隐藏3近景时27），六流另加6基础绘制；这些不是实测GPU draw calls。保守AABB相交保留47静态/42拆开候选，根入泥、步足贴树、水与根相交及合并包围盒的空域均需视觉复核，未假称零干涉。

数字镜头检查修正03.3鱼+鳃腔：inline [1.9,.9,2.2]→[.65,.15,.18] fov32。05.2/3均显微生物近景，下一拍恢复隐藏。06.3去除已移走algae-patch标注，07.1去除已移走bakau-prop标注；对象仍可从索引阅读。全部36拍解析后的可见标签与相机锚点通过CPU检查，遮挡与HUD排版待截图。

三张批准图先经scripts/illustrate.ts；800px封面因目录硬门槛，再经本主题process-art.ts以q40/alpha50编码至56,752字节，尺寸/构图保留、alpha量化，成图已复看。1600px封面约258KiB；两张1200px正文图约181–182KiB，超过120KiB软目标，保留标准脚本质量下限。`authoring/art-provenance.json`记输入/输出哈希与复用来源，未调用imagegen，不分发外部资产，不新增第三方许可例外。

### 9.4 验收记录

- `pnpm check`通过：773 files、0 errors、0 warnings；当次4 hints中1项为本轮build-parts未用循环变量，已移除；其余3项在既有文件。后续tsc阶段退出0。
- `pnpm validate`通过：59 topics、0 errors、0 warnings。初次作者审计JSON误放data，已移至authoring；命名cutaway mud已补齐。
- `pnpm test -- --maxWorkers=2 --testTimeout=20000`通过：162 files、4,376 tests。新增food-web37项+topic62项=99项。首次全量默认并发发现封面硬预算（已修）与既有energy守恒用例5s timeout；独立复跑仍遇机器负载，最终限制2workers/20s，energy约7.3s通过；没有改动既有测试实现或全局配置。
- `pnpm build`通过：121静态页面，130.34s；两种语言主题和draft fixture路由均生成。保留Vite既有大chunk提示；不以该提示冒充已通过首屏JS/运行时性能预算。PWA precache148项约12,331KiB，为全站构建输出，不是本主题独立包预算。
- `git diff --check`通过。插图已查看，CPU几何/锚点审计完成；浏览器门槛按BUILD brief明确跳过，不属于通过。

主session待跑：`pnpm shoot mangrove-food-web --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`，sample-food-web、living-things、heart-and-lungs回归截图，以及 `CI=1 ATLAS_E2E_PORT=5441 pnpm e2e`。13条新e2e规约已写（真实主题7+fixture6），本轮没有浏览器、截图、GPU或桌面控制。中文优先的代作决定/事实范围/配图软目标/待验项完整列于REVIEW.md。


### 9.5 Browser acceptance (Claude, 2026-10-27)

Looked at: all 36 beats in en/zh × paper/cinema at 1920×1080 (presentation shots), the FoodWebCard at chapter 06 for none / fiddlers / algae / mudskipper removed and at high tide, `--layout` at eight sizes incl. 1024×768 and 390×844 (en and zh, both themes), `--keys` (all keys, both locales and themes).

- **Food-web card.** Arrows run food to eater (header reads "Food → consumer"). Removing algae gives climbing crabs "fewer shown foods", fiddlers "no food path shown", mudskipper "fewer shown foods", heron unchanged; removing the mudskipper leaves the heron with no path. Matches §4.4 and the beat captions. Hiding a species in the card hides the matching 3D part; high tide hides the fiddlers but the node stays.
- **Habitat.** Low and high tide poses read correctly (water covers the bank and the lower prop roots at high; burrow opening stays; climbing crab rises). Api-api has pencil roots joined to lateral roots in the cutaway; Bakau has prop roots; the two systems are on separate trees.
- **Animals.** Crabs: eight walking legs, two chelipeds, eye stalks; fiddler has one big and one small claw. Fish: two eyes, pectoral fins, no legs. Heron: two legs.
- **Syllabus.** Checked against the 2023 MOE P6 "Interactions within the Environment" pages (printed 67–70): survival factors, population definition, "mangrove swamp", "structural or behavioural", unfavourable-environment outcomes ("adapt and survive; move to other places or die") and the positive impacts "Conservation, Reforestation" are all as the beats say.
- **Fix.** The fiddler crab sat on a pencil root (the root went through its body). Moved the crab and its flow anchor from [-.35,0,.04] to [-.10,0,.13]; parts.json and geometry-audit.json regenerated from `build-topic.ts` / `audit-geometry.ts`.
- **Perf** (`--perf --gpu`, Apple M5 Max under heavy machine load): 28 draw calls static, 34 with FLOW, 35,910 triangles, about 60 fps (load-limited). Inside the spec budget (<50/<60 calls, <0.3M tris). Page JS 503 KB gz is the shared engine chunk (identical for aircon and the fixture), not topic-specific.
- **Left for Gavin.** 06 and 07 hide the mangrove tree when "Mangrove leaf supply" is removed, so the climbing-crab symbol floats where the trunk was (07.1). The fiddler big claw is a faceted prism and the gill-chamber schematic is an abstract shell; both are legible but crude. 04.3 and similar beats name a food link while presentation mode shows only particles, not the card.
