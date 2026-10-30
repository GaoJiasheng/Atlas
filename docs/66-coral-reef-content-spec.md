# 66 · 珊瑚礁 · 内容施工 spec（coral-reef，SpaceScene）

SpaceScene / Model3DStage；EN默认、简体ZH独立成文；paper默认、cinema可切。生物与生境剖面的模型研究。目标：沿着组织、食物和环境证据，解释珊瑚为何是动物、礁区如何不同、白化与保护各意味着什么。[C01–C06,F01–F36]

2026-10-29 按 BUILD brief 定稿；status **published**（用户指定）。本轮已授权完成规格与施工，无需再次审稿确认。阅读优先级：§9施工记录 → 本规格 → MAIN checkout art/research/coral-reef 准备稿。事实ID对照 facts.json / facts-extra.json；原研究目录只读。无拆分或兄弟主题。

## 0. 决策记录（2026-10-29；均给默认值）

| # | 默认决定 | 理由/事实 |
|---|---|---|
| 1 | 题名 Coral Reefs / 珊瑚礁；slug `coral-reef`；biology；P6；published（用户指定） | P6 Standard环境相互作用的应用；不宣称珊瑚是点名必考内容 [C01–C06] |
| 2 | 一个通用浅水礁剖面 + 独立珊瑚虫放大台；不重建某个真实地点 | 无现场地形测绘；不将示意模型伪装成地图 [D01] |
| 3 | 背景章 + 7章，39拍；EN/ZH按下表施工，Gavin后审 | BG4拍，7×5拍 [D08] |
| 4 | 复用 `mangrove-food-web` / docs/53的 `sim.foodWeb`、table、predict、record | 卡的实现已在main，新增工作是本题内容表，不是引擎功能 [D02,D05] |
| 5 | 食物网只画六个功能节点、四条一般关系；不将藻伙伴和礁面藻混成一个生物 | 伙伴转移食物产物，摄食边是另一种机制 [F21–F24,D02] |
| 6 | 深度/水体用离散示意光指数；不设存活阈值或“健康分” | 本地浑水礁不符合“越清越健康”的单变量结论 [F15–F18,D03,D06] |
| 7 | 白化choice比较三种证据状态；没有温度滑块、倒计时或自动复活 | 白化仍可有活组织；有死亡风险而非必死/必活 [F25–F28,D04] |
| 8 | 新加坡地点写在reader的地点段；无定位地图和TimeScene | 免去未经核验的几何；B以不适用记录交付 [D01] |
| 9 | 一封面、两章节图；三张新作；旧图确实不适配 | 复用审查见 dossier §e；图文不能把红树林物种当礁区常见动物 [D01] |
| 10 | 原创文本、参数、新生成图：Atlas CC BY-NC-SA4.0；许可来源逐文件记录 | CC BY-SA源与CC BY-NC-SA源绝不合入一个衍生文件；本版无BY-SA输入 [D01–D04] |

### 0.1 开放问题与默认处置

| 问题 | 默认处置 | 是否阻塞准备 |
|---|---|---|
| 珊瑚群体vs群落的中文 | 群体用于colony、群落用于community；编辑词保留未核标记 [F04,C03] | 否 |
| 是否给正式地图 | 当前没有；若以后要，另做真实开放几何与许可验证 [D01] | 否 |
| 珊瑚虫的物种 | 通用硬珊瑚模型，不伪称Porites物种标本；12触手为示例 [F05,D07] | 否 |
| “symbiosis”还是“mutualism”主词 | 主线共生；解释本例双方获益，不给所有共生通用定义为互利 [F06–F07] | 否 |
| 三个实验共用全局sim是否互相污染 | 五控件用四个独立表，章完整reset；378组合核隔离 [D05] | 否 |
| 是否追加新引擎 | 默认无；现有table足够，不用假借“动态生态”添solver [D02–D06] | 否 |

### 0.2 风险和研究限制

S20直接页429、MOE入口机器人验证、ACA条款入口均记录且未绕过；研究用本地已有MOE PDF和可见索引。地方照片无开放许可，只有事实参照。没有实测礁体地形、当地摄食边的现场观测或物种存活参数。数据表和新图是教学示意，需要清楚保留说明。对新加坡珊瑚损失与深度差异不取平均、不作当下统计；运行时不请求外部资源。[F15–F18,F24,F29,D01–D06]


## 1. 课纲、范围与事实纪律

### 1.1 可见的学习证据

| 课纲 | 场景证据 | 成功表现 |
|---|---|---|
| 环境因素 [C01] | 深度与相对光指数；组织证据 | 能分开描述观察与存活推论 [F15–F18,D06] |
| 食物链/网 [C02] | 有向卡、四条关系和证据说明 | 箭头食物→消费者；伙伴是食物产物转移 [F23–F24] |
| 个体/种群/群落 [C03] | 珊瑚虫、群体与多类生物 | 不把一个克隆珊瑚群体直接当作全部种群 [F01,F04] |
| 适应 [C04] | 触手、附着、口和摄食姿态 | 说结构与作用，区别行为；不写“想要/为了而进化” [F02,F08–F09] |
| 人类影响 [C05] | 开发压力、白化与监测 | 能区分全球热胁迫和本地保护措施 [F27–F34] |

MOE原文页码与逐字短引在父dossier§a；此处不重复扩大引文。coral reef是应用生境，Foundation范围另行审核。[C06]

### 1.2 链接与不重复

`mangrove-food-web`现为published：本题04章细看链接 `/en/topics/mangrove-food-web/` 和 `/zh/topics/mangrove-food-web/`，05章再链接比较同一张卡的箭头读法；不重写潮汐泥滩、红树呼吸根、招潮蟹或鹭。`plant`的光合作用、`living-things`的分类、`energy-conversion`的能量内容均published，按locale链接。`singapore-land-use`是draft，保留编辑参考，不给孩子死链接。状态快照见父dossier§a。[C01–C06,D02]

### 1.3 误解与边界

文献M01–M03支持“珊瑚是植物/石头”和自动恢复的提问设计；研究为西班牙13–14岁47人，不给本地小学生频率。白化=死亡、浑水=无珊瑚是编辑预判，不冒称已在本地测得。[M01–M03,F15,F26] 不采用“珊瑚是植物与动物的混合物”或“藻类是珊瑚器官”的说法。[F01,F06–F07]

## 2. 事实、证据与数值

| 类别 | 采用 | 不外推 | facts |
|---|---|---|---|
| 来源事实 | 硬珊瑚动物、组织/骨骼、伙伴、摄食 | 非全部珊瑚都有同一生活方式 | F01–F09 |
| 地方来源数 | >250种硬珊瑚；海洋生态园40ha | 不当成单岛种数；韩都岛不归园区 | F11,F31 |
| 历史研究数 | 2020研究crest2–3m、slope7m | 不是三个礁区的法定深度界线 | F16 |
| 条件与分歧 | 8m/约10m/<11m来源不同 | 不设统一极限；不把透光层等同所有珊瑚极限 | F15–F18 |
| 保护计划 | 100k为2024宣布的目标；年报给后续进展 | 不当成已种植100k或成活率 | F33–F34 |
| DESIGN | 3m展示剖面；放大虫体；六节点四边 | 不是种群数、生物真实尺度或礁区测绘 | D01–D07 |
| SIM | 图连线/路径数；光指数 | 不是自然界健康、生存概率、百分比能量 | D02–D06 |

不用历史“珊瑚损失60%或70%”单一数字：原始来源口径未统一。NParks release的CMS日期与明确正文日期不一致，按正文10 Dec 2024，亦由政府新闻稿支持。[F29,F33] 不采用未经复核的Coral Triangle归属断言。[F11]

## 3. 模型、零件与表现计划

### 3.1 分区、尺度与模式

| 分区 | group | 内容 | 表现 |
|---|---|---|---|
| 01 | `reef-habitat` | 礁坪、礁脊、礁坡与三种群体形态 | 米制舞台，3m宽为DESIGN，无生物比例尺 [D01,D07] |
| 02 | `polyp-closeup` | 口、触手、组织、骨骼、藻点 | 独立放大台，未核典型尺寸不写magnification或真实scale [F01–F08,D07] |
| 03 | `web-specimens` | 六个互不共用part的节点标本 | 功能组、不同尺度；不可从图大小比较体长 [D02,D05] |
| 04 | `evidence-tools` | 悬浮颗粒示意、光标、苗圃、样方及沉积层 | 都是解释工具，非新加坡实际设备复刻 [F18,F32–F35,D07] |
| 05 | `feeding-flows` | 四条食物路径，只含流 | 示意方向；无等速能量/质量守恒含义 [F23–F24,D02] |

坐标Y向上，+X向海，+Z向观察者；礁体包络 x[-1.5,1.5], y[-.75,.25], z[-.45,.45]。礁坪x[-1.5,-.5]，礁脊[-.5,.25]，礁坡[.25,1.5]逐渐下降；地形仅表达相邻顺序，绝不绑定真实海岸坐标。polyp放大台中心[5,.4,0]，web标本台以x=10为中心，evidence台x=15；每章只显示相关台，防止大场景缩小主体。[D01,D07]

### 3.2 零件清单（26 selectable + 2 context）

下表形体用当前primitive，尺寸均DESIGN。shell只供显示剖切，不表示能凭X光观察活礁。所有selectable都有EN/ZH summary与detail；正文提到的对象加入本章index。相同标本在不同台出现时明确说模型复制，不增加图节点数。[D01,D07]

| id / group | primitive建议与位置 | 功能与准确性要求 | facts |
|---|---|---|---|
| reef-flat / reef-habitat | extrude轮廓，x=-1 | 浅平区，不作新加坡实测宽度 | F12–F13,D01 |
| reef-crest / reef-habitat | extrude，x=-.1 | 连续抬起的外缘 | F12,F14,D01 |
| reef-slope / reef-habitat | extrude，x=.9 | 连续向海下降 | F12,F15,D01 |
| colony-boulder / reef-habitat | lathe+局部corallite，[-.7,.12,0] | 低圆丘；表面组织与杯状骨骼分层 | F03–F04,F19 |
| colony-sheet / reef-habitat | 薄extrude，[-.1,.1,.15] | 片状群体，不编物种名 | F19,D01 |
| colony-encrusting / reef-habitat | 薄贴合extrude，[.6,-.2,0] | 覆盖基底表面，非一片植物叶 | F03,F19,D01 |
| polyp-tissue / polyp-closeup | lathe薄软壁，closeup台 | 组织是活体；透明效果保持可见 | F02,F04,F25 |
| polyp-mouth / polyp-closeup | 椭圆口缘sweep | 唯一口；不额外画肛门 | F02 |
| polyp-tentacles / polyp-closeup | sweep repeat12 | 12根本模型例子、六倍数、不画羽毛状 | F05,D07 |
| polyp-skeleton / polyp-closeup | lathe杯+radial septa | 位于组织外/下，硬骨骼无动物活组织 | F03–F04 |
| polyp-symbionts / polyp-closeup | 小sphere repeat示意 | 点在组织壁中，不在胃腔/表面水中 | F06–F07 |
| web-symbionts / web-specimens | 放大sphere簇 | 共生藻节点专用part | F06–F07,D02 |
| web-phytoplankton / web-specimens | 放大细胞简形 | 水中生产者，非珊瑚器官 | F21,D02 |
| web-zooplankton / web-specimens | 放大一般漂浮微动物轮廓 | 不指定无法核附肢的物种，不画巨型海虫 | F22,D02 |
| web-coral / web-specimens | 群体复制lathe | 动物消费者；伙伴提供食物不改动物身份 | F01,F24,D02 |
| web-turf-algae / web-specimens | 短sweep簇 | 礁面藻与体内伙伴分开 | F20–F21,D02 |
| web-parrotfish / web-specimens | lathe体+对称fin sweeps | 喙状颌、成对胸/腹鳍，泛称功能组，不定种 | F20,D02 |
| water-haze / evidence-tools | 稀疏小sphere静态组合 | 悬浮颗粒放大示意，不等于颗粒真实浓度 | F18,D03 |
| light-marker / evidence-tools | 小marker，y=light-index×.01 | 位置表示相对指数，无水温或生存含义 | D03,D06 |
| nursery-frame / evidence-tools | cylinder/box简单支架 | 通用修复支架，不复制JTC具体工程设计 | F32,D07 |
| nursery-fragments / evidence-tools | 小型群体形态 | 人工培育再移植，模型数量无统计意义 | F32–F34,D07 |
| monitoring-quadrat / evidence-tools | 细sweep方框 | 原创观察窗示意，非真实样方尺寸 | F35,D07 |
| sediment-deposit / evidence-tools | 薄extrude灰层 | 沉积在基底/表面的颗粒，不是悬浮云 | F18,D07 |
| colony-tissue / reef-habitat | 贴合boulder的薄层 | 与骨骼分组看活组织；不能用颜色单独判死 | F04,F25–F26 |
| larva-inset / polyp-closeup | 一般卵形平滑形体 | 游动幼体示意，非成体移居 | F09,D07 |
| refuge-cavity / reef-habitat | 可选中岩隙内壁 | 庇护空间，不制造新地理洞穴事实 | F10,D01 |
| substrate-context / reef-habitat (context) | 薄粗糙承托面 | 不可选、不进索引 | D01,D07 |
| inset-base / polyp-closeup (context) | 放大台底边 | 不可选；无背景板/品牌 | D07 |

### 3.3 流、动画、模式与预算

四条流分别与 `e-symbionts-coral / e-phyto-zoo / e-zoo-coral / e-algae-parrotfish` 同id，端点仅在web标本台；每条≤20粒子，总≤80，`ends:open`、`clip:false`。粒子只示意食物方向；伙伴边note说明转移产物。不要加水温流或矿物回流形成伪摄食循环。[F23–F24,D02,D07]

普通摄食讲解可用既有oscillate轻摆触手，`whenRun:true`，视觉速度DESIGN、不冒充真实摄食频率。RUN不改变表的值；reduced-motion保留最终几何/箭头、关闭摆动。X-RAY只用于骨骼外层与组织关系，CUTAWAY只切closeup；默认无explosion。EXPLODED+FLOW遵循已有禁用。章节保持全部台可用，以局部镜头和台间间距隔开，避免命名镜头切到空层；不用远景空地填充。[F02–F08,D01,D07]

目标：静止<50、运转<60draw calls；硬上限100；三角形<0.3M，首屏JS≤300KBgz；本地glb为0、纹理为0、运行时外部请求为0。此为施工预算，未作运行时实测。[D07]

## 4. 引擎合同与内容表（无新引擎工作）

### 4.1 现有实现核查

已读docs/06的SpaceScene sims/bindings、table-schema.ts、docs/53§4，以及现有mangrove-food-web parts的sim数据。当前支持 `kind:table`、`table.experiments`、有向 `sim.foodWeb`、choice/step、`visible/offset/intensity`、预测与记录；不添加registry项、新binding、输出种类、URL键、时钟或卡片。[D02,D05] `sim-plan.json`是准备期内容合同；最终parts文件、章节和门槛须另行完成，实际记录见§9。



#### 4.1.1 本轮引擎审查（2026-10-29）

已核 main 的 docs/06、src/engines 与 docs/53，及 `git log --oneline main..codex/<branch>` / `git show codex/<branch>:docs/06-dev-guide.md`：monsoon-engine（月气候）、sem-engine（公转自转）、airfoil-content（翼型）、dinosaur（Ma深时）、plates（参考层/目录/灾害记录）。前四分支已无main之外提交；plates仍有未合并内容，但珊瑚礁不需要这些接口。蒸汽、table/pose、sort、光、磁、电路、材料既有功能均不重复建设。

保留新引擎项 **0**；移除/拒绝新增生态solver、白化温度时钟、光学新binding、专用食物网卡和地图层。全部由 main 的 table.experiments / foodWeb / visible / offset / intensity / predict / record 组合；不依赖任何未合并代码。37行是内容数据，不是引擎。

### 4.2 精确字段与输入

MAIN研究目录的`sim-plan.json`提供完整可复算的内容表；`model-plan.py`是准备期生成器，施工不得写入该只读目录。保留当前引擎字段，不增加schema。[D05]

| control | kind / allowed | default | 用途 |
|---|---|---|---|
| remove | choice：none + 六个node.id | none | 只从教学图移走，不表示生物死亡 |
| inspect | choice：n-zooplankton / n-coral / n-parrotfish | n-coral | 观察对象；与点选part分开 |
| depth-m | step：[1,3,7]，m | 3 | 离散示意深度 |
| water-case | choice：less-turbid / more-turbid | more-turbid | DESIGN衰减系数0.1/0.5 m⁻¹ |
| evidence-state | choice：partnered / bleached-alive / dead-skeleton | partnered | 独立证据比较，非时间顺序 |

node精确字段 `{id,label:{en,zh},role:producer|consumer,parts:[id],d:[x,y],output,sources}`；edge `{id,from,to,output,evidence:general,sources,note:{en,zh}}`。三个producer分别为伙伴、浮游植物、礁面藻，三个consumer为浮游动物、珊瑚、鹦嘴鱼。两个互不连接的图分量刻意保留，代表未画全的路径；不为连通而捏造一条吃鱼关系。[F20–F24,D02,D05]

节点d固定：伙伴[.25,.12]，浮游植物[.75,.12]，浮游动物[.75,.39]，珊瑚[.5,.65]，礁面藻[.25,.90]，鹦嘴鱼[.75,.90]；卡320×380。底部水平边不可盖住按钮；每节点命中≥44px。[D05]

### 4.3 确定算法、输出和源

构建时：present=全部节点−remove；supported从未移走的producer开始沿DAG传播。activeEdge=两端present且from supported。foods=观察consumer有效入边数；baseline原入度。removed优先；producer未移走为unchanged；consumer foods=0→no-shown-food，0<foods<baseline→fewer-foods，否则unchanged。不支持的consumer仍然可见。绝不能用supported-count称“存活种数”。[D02,D05]

| experiment | keys | 行数 | 输出 |
|---|---|---:|---|
| web | remove | 7 | present-count、supported-count、active-links、六个status-<node>、四个active-<edge>（13个） |
| inspection | remove,inspect | 21 | foods:number；food-status:state（2个） |
| light | depth-m,water-case | 6 | light-index:number；haze-shown:0/1（2个） |
| bleaching | evidence-state | 3 | tissue-shown:0/1；partners-shown:0/1；tissue-evidence:state（3个） |
| 总计 | 五个control | 37 | 20个output |

node/food-status的states完整且仅用unchanged / fewer-foods / no-shown-food / removed；双语标签见sim-plan，强调“本图”。tissue-evidence的states同三种evidence-state、全部双语。所有number输出tag:sim，图计数decimals0，light-index decimals1；state不写数值tag。[D05–D06]

runtime source编号沿用映射S01→S1、S02→S2…S27→S27；Z01–Z05只供编辑查词。S50为本题原创设计研究，必须 `design:true`，解释表算法、各输入和示意光系数；37行各 `source:[S50]`。边另有S6/S7/S17/S18/S19事实依据，保留general evidence，不宣称local-observation。[F20–F24,D05–D06]

### 4.4 既有绑定与卡片行为

- 六个web part各绑定 `{control:remove,part:<node.parts[0]>,visible:{ne:<node.id>}}`；移走节点不会删除closeup台的教学结构，两个台在章节中互斥。[D05]
- 四条流分别绑定 `{output:active-<edge>,flow:<edge.id>,intensity:{full:1,mode:density}}`；0条关系断开，卡中虚线保留证据。[D05]
- `haze-shown`→water-haze visible:eq1；`light-index`→light-marker offset axisY per.01 origin0。指标不是光线真实轨迹，不能绑珊瑚生长或白化。[D03,D06]
- tissue-shown→polyp-tissue/mouth/tentacles visible:eq1；partners-shown→polyp-symbionts visible:eq1；骨骼始终保留。死状态不保留会运动的触手。[F25–F26,D04]
- FoodWebCard继续按已有规则在桌面替换PartChainCard、窄屏进入reader；本题不要求只在04/05章动态挂载卡的新功能，背景章若出现卡也给完整note；无try-it不出现T/G实验键。[D02,D05]
- 点node选首part，不改变inspect/remove；预测卡用remove:none→n-symbionts、inspect:n-coral，foods2→1，means:less。record保存最多12行，复用共用表；卡文字说明剩余路径不等于补足能量。[F24,F26,D05]
- 光实验vary:depth-m，also:[water-case]，keep:同一设计系数，observe:[light-index]；选完水体后固定其值再比较深度。bleaching章vary:evidence-state，observe:[tissue-evidence]，只比较证据，不画预测温度曲线。[D03–D06]

### 4.5 校验、数值与测试用例

沿用strict schema：拒绝未知control、重复节点/边、未知端点、自环/环、producer入边、consumer无producer路径、共享/未知/context part、d越安全区、缺EN/ZH、空note/source、缺状态、edge非0/1、错误output kind。table每组allowed key组合恰好一行，所有行输出键一致、一个output只属一个experiment；不以“不连接”拒绝合法的两个DAG分量。[D05]

| remove / inspect=coral | present | supported | active | foods / state |
|---|---:|---:|---:|---|
| none | 6 | 6 | 4 | 2 / unchanged |
| n-symbionts | 5 | 5 | 3 | 1 / fewer-foods |
| n-phytoplankton | 5 | 4 | 2 | 1 / fewer-foods |
| n-zooplankton | 5 | 5 | 2 | 1 / fewer-foods |
| n-coral | 5 | 5 | 2 | 0 / removed |
| n-turf-algae | 5 | 4 | 3 | 2 / unchanged |
| n-parrotfish | 5 | 5 | 3 | 2 / unchanged |

移走浮游植物再inspect zooplankton→foods0/no-shown-food；移走礁面藻再inspect parrotfish→0/no-shown-food；移走consumer后自身输出foods0/removed。未移走但无本图食物的动物仍在模型上；不声称立刻死亡。[D02,D05]

光公式 `L=100 exp(-k z)`，完整精度存表，显示1位小数。less-turbid在1/3/7m：90.4837418 / 74.0818221 / 49.6585304；more-turbid：60.6530660 / 22.3130160 / 3.0197383。z0（不在允许控件）仅作公式参考L100，不接受URL偷加。不得将指数标成现场照度或套用F16实测k。[D06]

三证据状态：partnered→tissue1/partners1；bleached-alive→1/0；dead-skeleton→0/0。变化water/depth不改变任何web输出；变化remove不改变light或组织状态；变化evidence不改变web。共7×3×3×2×3=378个控件组合，准备期全部查表命中唯一行且通过隔离断言，见model-checks.json。当前sim schema、计划part/flow引用及foodWeb/table来源检查亦已通过（sim-schema-checks.json）；这不代替完整parts、章节或浏览器验收。[D04–D06]

内容单测核图算法、37行和全部378组合；浏览器用已有`.space-food-web`/data-food-node/edge及`__atlas.engine.sim()`核同一状态，EN/ZH、paper/cinema、44px键盘、URL重入、reduced-motion、selected≠inspect。保持已有mangrove测试回归，不改其数据。无新engine API测试需要。[D05]

## 5. 章节与逐拍字幕

### 5.0 共同状态

每章完整reset而非累积：`view:assembled,run:false,explode:0,cutaway:none`；sim.set默认none/n-coral/3/more-turbid/partnered。每拍state只写相对本章改动；字幕是该拍可见观察，生物事实附父dossier id。`web`相机只见标本台；`polyp`只见closeup；`reef`只见礁剖面；`evidence`只见当前证据台。章/拍保持全部五组启用与各台可用，局部镜头隔离主题；下表的分区表示当前取景对象，不表示禁用其他台。各章index依据下表；五控件不同时全暴露于卡。[D01–D08]

### 5.0 BG · `before-you-start` · 读懂珊瑚模型

- **title**：Reading a reef model / 读懂珊瑚模型。
- **summary**：Observe the form, then look for tissue and feeding evidence. / 先看外形，再用组织和摄食证据判断。
- **state**：camera=hero；layers=全部五组；不跨台hide，以局部镜头取景；本章默认controls见§5.0。
- **正文提纲**：顺着下列可见证据写3–5段；EN200–300词、ZH350–500字为施工目标，不在本稿铺写最终MDX。每个事实保留本表id；独立细看解释来源条件、误解和模型限制。
- **本章索引**：[colony-boulder,polyp-skeleton,polyp-tissue]；文中谈但无selectable的地点进reader地点段，不作可点假地物。

| 拍 / id | state增量或交互 | Caption EN | 字幕ZH | 依据 |
|---|---|---|---|---|
| 1 `overview` | hero；labels colony-boulder | A reef contains many organisms and a shared physical habitat. | 一片礁包含许多生物，以及共同生活的生境。 | [F10,F12] |
| 2 `predict-first` | part colony-boulder；选择前先停拍 | A coral can look like rock. Its appearance alone does not identify it. | 珊瑚可能像石头，单看外形还不能判断它是什么。 | [F01,M01] |
| 3 `scale-note` | polyp相机；只开closeup | This enlarged polyp is a model, shown separately from the reef. | 这是单独放大的珊瑚虫模型，不是礁上真实大小。 | [D01,D07] |
| 4 `limits` | reef相机；本章index | The model shows selected structures and food pathways, not a survey of one island. | 模型只选取部分结构和食物路径，并非某座岛的调查记录。 | [D01–D02] |

**细看**：外形判断的限制；模型比例和图的省略。 事实范围同本章各拍，不添加无来源数字。

### 5.1 01 · `coral-and-partners` · 珊瑚动物与伙伴

- **title**：Coral animals and their partners / 珊瑚动物与伙伴。
- **summary**：Separate the coral animal from its algal partners. / 动物与藻伙伴分开看。
- **state**：camera=polyp；layers=全部五组；不跨台hide，以局部镜头取景；本章默认controls见§5.0。
- **正文提纲**：顺着下列可见证据写3–5段；EN200–300词、ZH350–500字为施工目标，不在本稿铺写最终MDX。每个事实保留本表id；独立细看解释来源条件、误解和模型限制。
- **本章索引**：[polyp-tissue,polyp-mouth,polyp-tentacles,polyp-skeleton,polyp-symbionts]；文中谈但无selectable的地点进reader地点段，不作可点假地物。

| 拍 / id | state增量或交互 | Caption EN | 字幕ZH | 依据 |
|---|---|---|---|---|
| 1 `soft-animal` | part polyp-tissue；骨骼降低opacity | The soft polyp is an animal. Many polyps can form one colony. | 柔软的珊瑚虫是动物，许多珊瑚虫可组成一个群体。 | [F01,F04] |
| 2 `mouth-and-tentacles` | part polyp-mouth；labels mouth,tentacles | A mouth lies inside the ring of tentacles. | 一圈触手围着中央的口。 | [F02,F05] |
| 3 `hard-support` | cutaway half；part polyp-skeleton | The hard skeleton lies around and beneath the living tissue. | 坚硬的骨骼位于活组织周围和下方。 | [F03–F04] |
| 4 `partners-in-tissue` | evidence-state partnered；part polyp-symbionts | Tiny algal partners live within the tissue and make food using light. | 微小共生藻住在组织内，利用光制造食物。 | [F06–F07] |
| 5 `two-food-paths` | run true；part polyp-tentacles | The animal also catches tiny prey. Food from algae is a second pathway. | 珊瑚动物也捕捉微小猎物；藻类提供食物是另一条路径。 | [F07–F08,F24] |

**细看**：不是所有珊瑚都群居；十二触手是模型例子。 事实范围同本章各拍，不添加无来源数字。

### 5.2 02 · `reef-zones` · 相连的三个礁区

- **title**：Three connected reef zones / 相连的三个礁区。
- **summary**：Depth and light create different conditions across a reef. / 深度和光照使礁区的生活条件不同。
- **state**：camera=reef；layers=全部五组；不跨台hide，以局部镜头取景；本章默认controls见§5.0。
- **正文提纲**：顺着下列可见证据写3–5段；EN200–300词、ZH350–500字为施工目标，不在本稿铺写最终MDX。每个事实保留本表id；独立细看解释来源条件、误解和模型限制。
- **本章索引**：[reef-flat,reef-crest,reef-slope,water-haze,light-marker]；文中谈但无selectable的地点进reader地点段，不作可点假地物。

| 拍 / id | state增量或交互 | Caption EN | 字幕ZH | 依据 |
|---|---|---|---|---|
| 1 `flat` | part reef-flat | The reef flat is the shallow zone nearest the shore. Parts may be exposed at low tide. | 礁坪靠近岸边，水较浅；部分地方会在低潮时露出水面。 | [F12–F13] |
| 2 `crest` | part reef-crest | The crest faces incoming waves and can reduce their energy. | 礁脊迎向海浪，可削弱传来的波浪能量。 | [F12,F14] |
| 3 `slope` | part reef-slope | The reef slope descends seaward, where less light is available. | 礁坡向海中下降，较深处可获得的光更少。 | [F12,F15] |
| 4 `depth-comparison` | try vary depth-m；3→7；water-case more-turbid | In this illustrative water case, the light index falls as depth increases. | 在这个示意水体中，深度增加，相对光指数下降。 | [D03,D06] |
| 5 `singapore-condition` | depth-m 3；water-case less-turbid→more-turbid | Singapore has living reefs in turbid water. This light index does not predict survival. | 新加坡浑浊海水里也有活珊瑚礁；这里的光指数不预测存活。 | [F15–F18,D03] |

**细看**：8m/10m/透光层不是同一指标；如何固定水体比较深度。 事实范围同本章各拍，不添加无来源数字。

### 5.3 03 · `structures-and-feeding` · 结构与摄食

- **title**：Structures and feeding / 结构与摄食。
- **summary**：Structures and behaviour influence survival. / 结构和行为共同影响生存。
- **state**：camera=polyp；layers=全部五组；不跨台hide，以局部镜头取景；本章默认controls见§5.0。
- **正文提纲**：顺着下列可见证据写3–5段；EN200–300词、ZH350–500字为施工目标，不在本稿铺写最终MDX。每个事实保留本表id；独立细看解释来源条件、误解和模型限制。
- **本章索引**：[polyp-tentacles,polyp-mouth,colony-boulder,colony-sheet,refuge-cavity,larva-inset]；文中谈但无selectable的地点进reader地点段，不作可点假地物。

| 拍 / id | state增量或交互 | Caption EN | 字幕ZH | 依据 |
|---|---|---|---|---|
| 1 `capture` | part polyp-tentacles；run true | Tentacles with stinging cells help capture small prey. | 带有刺细胞的触手有助捕捉微小猎物。 | [F08] |
| 2 `structure-behaviour` | run false；mouth closeup | Tentacles are structures; extending and using them to feed is behaviour. | 触手是结构；伸展触手并用它摄食，是行为。 | [C04,F02,F08] |
| 3 `colony-forms` | reef相机；labels colony-boulder,colony-sheet | Coral colonies can form boulders or sheets. They are not leaves or branches of a plant. | 珊瑚群体可呈块状或片状，并非植物的叶或枝。 | [F01,F19] |
| 4 `shelter` | part refuge-cavity | Spaces within the reef provide shelter for other organisms. | 礁体里的空隙为其他生物提供庇护。 | [F10] |
| 5 `life-stages` | polyp相机；part larva-inset | An attached colony stays in place, while larvae can disperse before settling. | 附着的群体留在原处，幼体则可在定居前扩散。 | [F09] |

**细看**：结构与行为的区分；幼体分散不等于成体游走。 事实范围同本章各拍，不添加无来源数字。

### 5.4 04 · `sunlight-and-food` · 来自太阳的食物路径

- **title**：Food pathways from the Sun / 来自太阳的食物路径。
- **summary**：Follow the arrows to trace food sources. / 沿箭头观察食物的来源。
- **state**：camera=web；layers=全部五组；不跨台hide，以局部镜头取景；本章默认controls见§5.0。
- **正文提纲**：顺着下列可见证据写3–5段；EN200–300词、ZH350–500字为施工目标，不在本稿铺写最终MDX。每个事实保留本表id；独立细看解释来源条件、误解和模型限制。
- **本章索引**：[web-symbionts,web-phytoplankton,web-zooplankton,web-coral,web-turf-algae,web-parrotfish]；文中谈但无selectable的地点进reader地点段，不作可点假地物。

| 拍 / id | state增量或交互 | Caption EN | 字幕ZH | 依据 |
|---|---|---|---|---|
| 1 `producers` | remove none；labels 三producer | Phytoplankton, algal partners and reef-surface algae make food using light. | 浮游植物、共生藻和礁面藻类利用光制造食物。 | [F07,F21] |
| 2 `plankton-chain` | inspect n-zooplankton；run true | A selected zooplankton group eats phytoplankton; coral animals can eat zooplankton. | 这里选取的浮游动物吃浮游植物；珊瑚动物可吃浮游动物。 | [F22] |
| 3 `partner-edge` | inspect n-coral；展开e-symbionts-coral note | This arrow transfers food made by partners. It does not show the coral swallowing them. | 这条箭头表示伙伴制成的食物转移，不表示珊瑚吞下伙伴。 | [F24] |
| 4 `surface-grazing` | inspect n-parrotfish；part web-turf-algae | Parrotfishes graze reef-surface food with strong beak-like jaws. | 鹦嘴鱼用强壮的喙状颌在礁面摄食。 | [F20] |
| 5 `read-the-web` | inspect n-coral；全部边可见 | Arrows point from food to consumer. This selected web leaves many links unshown. | 箭头由食物指向消费者；这个选取的网省略了许多关系。 | [F23,D02] |

**细看**：伙伴边的特殊机制；链接mangrove-food-web比较同一卡片。 事实范围同本章各拍，不添加无来源数字。

### 5.5 05 · `changing-one-node` · 改变一个食物网节点

- **title**：Changing one food-web node / 改变一个食物网节点。
- **summary**：Compare shown food pathways and keep inference within the model. / 比较已画食物路径，保留推论边界。
- **state**：camera=web；layers=全部五组；不跨台hide，以局部镜头取景；本章默认controls见§5.0。
- **正文提纲**：顺着下列可见证据写3–5段；EN200–300词、ZH350–500字为施工目标，不在本稿铺写最终MDX。每个事实保留本表id；独立细看解释来源条件、误解和模型限制。
- **本章索引**：[web-symbionts,web-phytoplankton,web-zooplankton,web-coral,web-turf-algae,web-parrotfish]；文中谈但无selectable的地点进reader地点段，不作可点假地物。

| 拍 / id | state增量或交互 | Caption EN | 字幕ZH | 依据 |
|---|---|---|---|---|
| 1 `prediction` | try predict none→n-symbionts；inspect n-coral | Predict how many shown food inputs remain for the coral animal. | 先猜：珊瑚动物还剩多少条本图画出的食物输入？ | [D02,D05] |
| 2 `remove-partner` | remove n-symbionts；inspect n-coral | One of the two shown inputs is removed; one remains. | 原来画出的两条输入少了一条，还剩一条。 | [D05] |
| 3 `trace-indirect` | remove n-phytoplankton；inspect n-zooplankton | This zooplankton group now has no food pathway shown in the diagram. | 图中这组浮游动物现在没有已画的食物路径。 | [D05] |
| 4 `alternative-path` | remove n-phytoplankton；inspect n-coral | The coral retains the partner pathway. The count does not measure enough food for survival. | 珊瑚仍有伙伴这条路径；条数不能说明食物是否足以维持生存。 | [F24,F26,D05] |
| 5 `record-and-limit` | record true；remove none→n-turf-algae；inspect n-parrotfish | Record what changed in this diagram. Unshown foods and population changes remain unknown. | 记录本图改变了什么；未画食物和种群变化仍不由这个模型确定。 | [D02,D05] |

**细看**：本图断线与自然种群的差别；图外食物并不一定不存在。 事实范围同本章各拍，不添加无来源数字。

### 5.6 06 · `bleaching-and-pressures` · 白化与环境压力

- **title**：Bleaching and environmental pressures / 白化与环境压力。
- **summary**：Examine tissue evidence as well as surface colour. / 看组织证据，不只看表面颜色。
- **state**：camera=polyp；layers=全部五组；不跨台hide，以局部镜头取景；本章默认controls见§5.0。
- **正文提纲**：顺着下列可见证据写3–5段；EN200–300词、ZH350–500字为施工目标，不在本稿铺写最终MDX。每个事实保留本表id；独立细看解释来源条件、误解和模型限制。
- **本章索引**：[polyp-tissue,polyp-skeleton,polyp-symbionts,water-haze,sediment-deposit]；文中谈但无selectable的地点进reader地点段，不作可点假地物。

| 拍 / id | state增量或交互 | Caption EN | 字幕ZH | 依据 |
|---|---|---|---|---|
| 1 `partnered` | evidence-state partnered | With algal partners present, living tissue covers the skeleton. | 有共生藻时，活组织覆盖在骨骼上。 | [F04,F06] |
| 2 `bleached-alive` | evidence-state bleached-alive | In bleaching, algae or their pigments are lost. Living tissue can remain. | 白化时会失去共生藻或其色素，但仍可能保留活组织。 | [F25–F26] |
| 3 `dead-skeleton` | evidence-state dead-skeleton | A bare dead skeleton has no living polyp tissue. Whiteness alone is not enough evidence. | 裸露的死骨骼没有珊瑚虫活组织；单看白色不能判定死亡。 | [F25–F26] |
| 4 `different-stressors` | evidence相机；part sediment-deposit；haze单独开 | Suspended particles reduce light; deposited particles can cover corals. Heat stress is another pressure. | 悬浮颗粒减少透光；沉积颗粒可覆盖珊瑚；热胁迫是另一种压力。 | [F18,F27,F30] |
| 5 `conditional-recovery` | polyp相机；手选bleached-alive；不自动转partnered | Some bleached corals recover if stress eases; severe or prolonged stress can lead to death. | 一些白化珊瑚在压力缓解后可恢复；严重或持续的压力则可能导致死亡。 | [F26–F28] |

**细看**：白化、死骨骼和组织证据；本地水质与全球热胁迫的尺度。 事实范围同本章各拍，不添加无来源数字。

### 5.7 07 · `conservation-and-evidence` · 保护与证据

- **title**：Conservation and evidence / 保护与证据。
- **summary**：Distinguish goals, actions and monitored outcomes. / 把目标、行动与监测结果分开。
- **state**：camera=conservation；layers=全部五组；不跨台hide，以局部镜头取景；本章默认controls见§5.0。
- **正文提纲**：顺着下列可见证据写3–5段；EN200–300词、ZH350–500字为施工目标，不在本稿铺写最终MDX。每个事实保留本表id；独立细看解释来源条件、误解和模型限制。
- **本章索引**：[nursery-frame,nursery-fragments,monitoring-quadrat]；文中谈但无selectable的地点进reader地点段，不作可点假地物。

| 拍 / id | state增量或交互 | Caption EN | 字幕ZH | 依据 |
|---|---|---|---|---|
| 1 `local-places` | reader地点段；reef远景 | Sisters’ Islands Marine Park protects local reefs. Pulau Hantu is a separate reef research site. | 姐妹岛海洋生态园保护本地珊瑚礁；韩都岛是另一个礁区研究地点。 | [F16,F31] |
| 2 `nursery` | part nursery-frame,nursery-fragments | Nurseries cultivate corals before suitable restoration work. Planting alone does not prove success. | 苗圃可培育珊瑚，供适当修复工作使用；种下去本身还不能证明成功。 | [F32–F34] |
| 3 `goal-and-progress` | reader显示明确日期与goal字样 | The 100k initiative announced a planting goal; later reports describe work already carried out. | 100k计划宣布的是种植目标；后续报告说明已经开展的工作。 | [F33–F34] |
| 4 `monitor-evidence` | part monitoring-quadrat；reader来源LKCNHM | Repeated observations and museum records help researchers compare coral communities over time. | 重复观察与博物馆记录帮助研究者比较不同时期的珊瑚群落。 | [F35] |
| 5 `care-and-inference` | reader care；index三个零件 | Observe without collecting. Protection and research help, while warming remains a wider challenge. | 观察而不采集；保护与研究有帮助，海洋升温仍是更大范围的挑战。 | [F27,F32–F36] |

**细看**：目标、移植和成活监测的区别；LKCNHM的证据用途。 事实范围同本章各拍，不添加无来源数字。

### 5.8 拍数核对与卡片

BG4 + 01–07各5 = 39。02用光比较卡，04用观察卡但不安排通用定义测验，05用先猜/移走/记录卡，06用组织证据choice卡；其余章不强制实验。背景与03的先判断只是阅读预测，没有答案打分、题库或新quiz组件。[D08]

## 6. 名词表、来源与引文

### 6.1 主线glossary（18个）

| id | EN / 简体ZH | 定义 EN / ZH | facts |
|---|---|---|---|
| polyp | Coral polyp / 珊瑚虫 | An individual coral animal / 单个珊瑚动物 | F01–F02 |
| colony | Coral colony / 珊瑚群体 | Many connected polyps / 许多连接的珊瑚虫；群体为编辑用词，区别群落 | F04 |
| skeleton | Skeleton / 骨骼 | Hard calcium-carbonate structure / 碳酸钙构成的坚硬结构 | F03 |
| symbiosis | Symbiosis / 共生 | A close relationship between different organisms / 不同生物之间紧密的共同生活关系；本例双方获益 | F06–F07 |
| algal-partner | Algal partner / 共生藻 | Photosynthetic algae within coral tissue / 珊瑚组织内能光合作用的藻类 | F06–F07 |
| reef-flat | Reef flat / 礁坪 | Shallow zone nearer shore / 靠近岸边的浅平礁区 | F12–F13 |
| reef-crest | Reef crest / 礁脊 | Seaward ridge facing incoming waves / 迎向海浪的礁区外缘 | F12,F14 |
| reef-slope | Reef slope / 礁坡 | Reef zone descending seaward / 向海中下降的礁区 | F12 |
| habitat | Habitat / 生境 | A place where organisms live / 生物生活的环境 | C03,F10 |
| community | Community / 群落 | Populations living together in a place / 在同一地方共同生活的多个种群 | C03 |
| producer | Producer / 生产者 | An organism that makes organic food / 能制造有机食物的生物；本例利用光 | C02,F21 |
| consumer | Consumer / 消费者 | An organism obtaining food from other organisms / 从其他生物取得食物的生物 | C02,F22 |
| phytoplankton | Phytoplankton / 浮游植物 | Photosynthetic plankton / 浮游的光合生物；不是珊瑚虫的器官 | F21 |
| zooplankton | Zooplankton / 浮游动物 | Drifting animal plankton / 在水中漂浮的动物类浮游生物 | F22 |
| food-web | Food web / 食物网 | Connected feeding pathways / 相互连接的食物路径；本图只选取一部分 | F23,D02 |
| adaptation | Adaptation / 适应 | A feature or behaviour that aids survival / 有助生存的结构或行为；不表示生物有目的地设计自己 | C04 |
| bleaching | Coral bleaching / 珊瑚白化 | Loss of algal partners or their pigments / 失去共生藻或其色素，可仍有活组织 | F25–F26 |
| restoration | Restoration / 生态修复 | Work to assist recovery of damaged habitat / 协助受损生境恢复的工作，并需监测结果 | F32–F35 |

术语原始58项及attestation在facts.json.terms；表内未证本地/简体者仍属编辑译名，施工前校对，不能宣称MOE中文术语表。分解者作为环境因素在正文带到并回链mangrove-food-web，不为了完整课纲把细菌/真菌接入本图DAG。[C01–C02,D02]

### 6.2 来源表

事实id直接引用父dossier，不重编号。下面source id为研究编号；runtime英文数字id去前导零，S50保留；Z不进入runtime。网页事实引用与图片/数据授权分别判断。

| source | 标题 / 发布者 | 位置与使用 | URL |
|---|---|---|---|
| S01 | Science Teaching & Learning Syllabus, Primary Three to Six, 2023; updated Jan 2026 / MOE CPDD | printed pp.67–70; PDF pp.68–71 | [S01](https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf) |
| S02 | Coastal and marine ecosystems / NParks | Coral reefs section; dated 6 Aug 2026 | [S02](https://www.nparks.gov.sg/nature/ecosystems/coastal-marine) |
| S03 | Hard Coral / NParks BiodiversitySG | About Hard Corals; updated 31 May 2026 | [S03](https://biodiversitysg.nparks.gov.sg/our-biodiversity/marine-invertebrates/corals-sea-anemones/hard-coral/) |
| S04 | Coral Reefs of Singapore / NUS Reef Ecology Lab | What is a coral reef; History; Blueprint | [S04](https://coralreef.nus.edu.sg/singapore.html) |
| S05 | Coral Basics / NOAA Flower Garden Banks National Marine Sanctuary | Coral polyps; Coral Skeletons | [S05](https://flowergarden.noaa.gov/education/coralbasics.html) |
| S06 | Polyps up close / NOAA National Ocean Service | body, mouth, calyx and coenosarc; figure credit NOAA | [S06](https://oceanservice.noaa.gov/education/tutorial_corals/media/supp_coral01a.html) |
| S07 | What is Zooxanthellae? / NOAA National Ocean Service | mutualistic relationship and bleaching | [S07](https://oceanservice.noaa.gov/education/tutorial_corals/coral02_zooxanthellae.html) |
| S08 | What is coral bleaching? / NOAA National Ocean Service | survival and infographic transcript | [S08](https://oceanservice.noaa.gov/facts/coral_bleach.html) |
| S09 | Threats / NUS Reef Ecology Lab | sedimentation, bleaching, oil | [S09](https://coralreef.nus.edu.sg/information/threats.html) |
| S10 | Light Limitation and Depth-Variable Sedimentation Drives Vertical Reef Compression on Turbid Coral Reefs / Morgan, Moynihan, Sanwlani & Switzer; Frontiers in Marine Science (2020) | Abstract; Introduction; copyright | [S10](https://doi.org/10.3389/fmars.2020.571256) |
| S11 | Resilience of Singapore corals / NUS News | 1 July 2019; paragraphs on two study reefs | [S11](https://news.nus.edu.sg/resilience-of-singapore-corals/) |
| S12 | Sisters’ Islands Marine Park / NParks | Location; Park size; Dos and don’ts; Coral reefs | [S12](https://www.nparks.gov.sg/visit/parks/park-detail/sisters-islands-marine-park/) |
| S13 | Coral nursery at Small Sister’s Island / NParks | nursery purpose and reef substrate | [S13](https://www.nparks.gov.sg/visit/parks/sisters-islands-marine-park/special-features/coral-nursery) |
| S14 | 100k Corals Initiative launch / NParks | release body dated 10 December 2024 | [S14](https://www.nparks.gov.sg/news/news-detail/nparks-launches-singapore-s-most-extensive-coral-restoration-effort--tapping-on-technology-and-research-to-plant-100-000-corals-in-singapore-s-waters) |
| S15 | Transforming Singapore into a City in Nature; Annual and Sustainability Report 2025/2026 / NParks | Stepping Up Efforts in Species Recovery | [S15](https://www.nparks.gov.sg/portals/annualreport/chapters/transforming-singapore-into-a-city-in-nature/) |
| S16 | Cnidaria / NUS Lee Kong Chian Natural History Museum | collection and conservation inventory | [S16](https://lkcnhm.nus.edu.sg/our-research/cnidaria/) |
| S17 | Recognising Eight Marine Creatures / NParks | Peckish Parrots; 3 February 2025 | [S17](https://www.nparks.gov.sg/publications-resources/articles/recognising-eight-marine-creatures) |
| S18 | Coral Reef Ecosystem Organisms table / NOAA Office of National Marine Sanctuaries | PDF pp.1–2; phytoplankton, zooplankton, coral and zooxanthellae rows | [S18](https://sanctuaries.noaa.gov/media/docs/20231129-coral-reef-organisms-table.pdf) |
| S19 | Modeling Coral Reef Ecosystems: Rainforests of the Sea / NOAA Office of National Marine Sanctuaries | PDF pp.2–3; food webs and producers | [S19](https://sanctuaries.noaa.gov/media/docs/20231129-coral-reef-lesson-plan.pdf) |
| S20 | Socio-Ecological Controversies in the News as Trigger of a Model-Based Inquiry Instructional Sequence about the Effect of Global Warming on the Great Barrier Reef / Sustainability (2020), 12(11), 4676 | §4.1 participants; §5.1 students’ conceptions | [S20](https://www.mdpi.com/2071-1050/12/11/4676) |
| S21 | Hard Corals gallery / NUS Reef Ecology Lab | boulder, sheet and young staghorn photographs | [S21](https://coralreef.nus.edu.sg/gallery/hardcorals.html) |
| S22 | Can I use your image or graphic? / NOAA National Ocean Service | public domain and third-party exceptions | [S22](https://oceanservice.noaa.gov/about/faq.html) |
| S23 | CRW Disclaimer and Recommendations for Citing Data and Products / NOAA Coral Reef Watch | public domain; recommended credit | [S23](https://coralreefwatch.noaa.gov/satellite/docs/recommendations_crw_citation.php) |
| S24 | Allen Coral Atlas resources and FAQ / Allen Coral Atlas Partnership / Arizona State University | General citation; Satellite Imagery; Other Data | [S24](https://allencoralatlas.org/resources/) |
| S25 | Allen Coral Atlas Data Download Directions / Allen Coral Atlas | steps 8–9: agreement and emailed package | [S25](https://cdn.cosmicjs.com/a9ffec90-721a-11eb-87a2-9be5e90cdf74-Atlas-Data-Download-Directions.pdf) |
| Z01 | 前线追踪：姐妹岛将开放潜水 本地海底世界原来这么丰富 / Mediacorp 8world | 19 June 2026; article and tags | [Z01](https://www.8world.com/in-depth/frontline/sisters-island-diving-3187196) |
| Z02 | 以艺术创作为海洋环保发声（报道汇编） / 联合早报; NUS news clipping | 3 September 2023; Between Shades section | [Z02](https://nus.edu.sg/newshub/news/2023/2023-09/2023-09-03/Conservation-zb-3sep-p2-4.pdf) |
| Z03 | 科学家揭示珊瑚的高温驯化适应机制 / 中国科学院 | 17 January 2023 | [Z03](https://www.cas.cn/cm/202301/t20230117_4872472.shtml) |
| Z04 | 海洋酸化常见问题及解答 / IAEA / international ocean-acidification researchers | Chinese FAQ on symbionts and calcification | [Z04](https://www.iaea.org/sites/default/files/18/06/oa-faqs-ch.pdf) |
| Z05 | 三亚造礁石珊瑚虫黄藻光合作用效率的日周期及其调控因素 / 热带海洋学报 | Chinese abstract; 2014 | [Z05](https://www.jto.ac.cn/CN/10.11978/j.issn.1009-5470.2014.01.011) |
| S50 | Original coral-reef model study / Atlas preparation | §0, §3–§4; original schematic values | [S50](art/research/coral-reef/spec-draft.md) |
| S26 | What is a Coral? / US National Park Service / Caroline Rogers | colonies; larvae; feeding and bleaching | [S26](https://www.nps.gov/articles/000/what-is-a-coral.htm) |
| S27 | Why do corals bleach? / Woods Hole Oceanographic Institution | loss of zooxanthellae and/or coloration | [S27](https://www.whoi.edu/ocean-learning-hub/ocean-facts/why-do-corals-bleach/) |

## 7. HUD、镜头与配图

### 7.1 HUD及双语

沿用docs/08固定的章头→拍行→试一试→详情→正文→索引。底部仅章节轴；PLATE最多4行，foods/active-links/light-index按本章observe显示，全部标SIM；无“真实生物存活数量”。scene note：**Model study · schematic habitat and enlarged specimens / 模型研究·生境示意及放大标本**。相机不创造新按钮；所有可见文字EN/ZH，英式colour/behaviour。[D01–D08]

### 7.2 六个预设（位置/target均DESIGN）

| id | position | target | 用途 |
|---|---|---|---|
| hero | [3,2.3,4] | [0,-.1,0] | 礁体3/4封面 |
| reef | [2,1.4,3.7] | [0,-.1,0] | 三礁区 |
| polyp | [5.9,1.4,1.8] | [5,.4,0] | 珊瑚虫 |
| web | [10,1.8,3.4] | [10,.3,0] | web标本台 |
| evidence | [16,1.6,2.8] | [15,.3,0] | 沉积/光标 |
| conservation | [15.5,1.3,2.5] | [15,.2,0] | 苗圃/监测 |

fov30；reference看XY；cutaway仅closeup的z平面，活组织/藻点关系必须看得见。preset只切camera/view，既有接口不改layers/hide；各章启用全部台，由局部镜头和台间间距隔开，不按全scene包络取景。[D07]

### 7.3 图片计划与实际QA

| 文件 | 尺寸 | 放置 | 说明/核对 |
|---|---|---|---|
| coral-reef.png | 1024² | 封面 | 圆丘状硬珊瑚骨骼/珊瑚杯研究；不能单凭封面称组织存活；杯体、放射隔片、连续形态 [F03–F04,F19] |
| coral-reef-polyp.png | 1536×1152 | 01章 | 一口、十二根光滑不分羽的触手、外下方骨骼；十二为模型例子 [F02–F05] |
| coral-reef-zones.png | 1536×1152 | 02章 | 示意礁坪—礁脊—礁坡；无测绘/地理比例含义 [F12–F16,D01] |

全部细石墨铅笔、交叉排线/点描、等RGB灰阶、真alpha、无背景纸纹/框/文字/箭头/投影，主体约85%、有边距。prompt、原图路径、try次数、sha256、像素与人工QA在art/planned/coral-reef。没有合适旧图；三张新生成，未复制旧图。若后续改用旧图，必须copy并加reusedFrom，不移动原件。[D01,D07]

### 7.4 数据预取与许可家族

无地图部分，无地理keyframe或图层；`data/INVENTORY.md`记录0个数据集、0bytes。不要为了交付B下载无用全球文件。NOAA CRW、ACA、OSM只作候选，见datasets.json；ACA同意条款流程不执行。无public外链/CDN/瓦片/实时海温。[D01,D03]

本题sim-plan.json、model-checks.json、原创3D参数、新图和双语正文属于**BY-NC-SA4.0家族**；没有BY-SA源、没有受限照片输入。将来如用BY-SA或ODbL则另文件、独立LICENSE-CONTENT例外、归属与修改说明；BY-SA与BY-NC-SA源不进入同一衍生文件。官方事实可引用不等于官方照片可复制。[D01–D04]

## 8. 施工顺序与验收清单

施工顺序：本规格定稿 → 核参考/术语 → 既有接口内容表 → 程序化模型 → 双语正文/39拍 → 单元门槛与构建。状态固定published，不做git写入，不改package/lock/review-queue/next-batch。浏览器门槛按BUILD brief跳过，主session运行；不得以桌面控制绕过。[D01–D08]

- [x] 课纲引用印刷67–70 / PDF68–71正确；没有把珊瑚列为课纲点名生境。[C01–C06]
- [x] 动物/藻伙伴/骨骼/活组织可分辨；12触手和一个口准确；藻点在组织内。[F01–F08]
- [x] 个体、群体、种群、群落术语不混；58项术语未核标记不静默移除。[C03,F04]
- [x] 卡复用docs/53；6节点4边，partner edge说明非吞食；来源general不冒local。[F20–F24,D05]
- [x] 37行、20输出、378组合及数值与model-checks一致；最终parts/schema/source全验证。[D05–D06]
- [x] “无已画食物”不称死；另一条路径不称有足够食物；白化不自动恢复。[F26,D02,D04]
- [x] 光指数只标SIM；不读取论文实测k、不展示珊瑚温度阈值或种群预测。[D03,D06]
- [x] 三礁区连续；不画手工地理地图；韩都岛不写成海洋生态园组成。[F12,F31,D01]
- [x] 100k为目标、日期明确；年报进展不化成存活率；LKCNHM标本不化成海中数量。[F33–F35]
- [x] BG+7章/39拍、全部EN/ZH、索引能选到正文对象、草稿链接只给published主题。[D08]
- [ ] paper/cinema、1024/768/390px、44px触控、键盘、reduced-motion、URL返回和离线验收。[D07]
- [x] pnpm check / validate / test / build必须执行；浏览器shoot与e2e按brief跳过交主session：`pnpm shoot coral-reef --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`、`CI=1 ATLAS_E2E_PORT=5454 pnpm e2e`。[D07]
- [x] 图manifest、alpha/灰阶/尺寸/计数人工检查与版权家族一致；没有受限资产下载。[D01,D07]

准备期检查见MAIN研究目录validation-report.json；本轮实际验收与未执行的浏览器门槛见§9，不把准备期结果当作主题验收。

## 9. 施工记录

### 9.1 引擎与内容交付（2026-10-29）

新引擎项 0；没有修改 src/engines、schema、注册表或 docs/06。现有 table.experiments、sim.foodWeb、visible／offset／intensity、predict／record 已满足全部范围，不依赖未合并分支。原计划的新生态 solver、温度／白化时钟、专用卡与地图层均移除或拒绝新增。

主题 status 按用户指定为 **published**。`src/content/topics/coral-reef/` 已交付 topic.yaml、背景章 + 7 章、39 拍、EN/ZH 正文、每章两个细看、索引、四章试一试（光、读网、预测记录、组织证据）、18 术语与 28 编号来源。数据为 26 selectable + 2 context、5 组、4 流（64 粒子）、1 触手摆动动画、6 预设。五控件、四独立实验、37 行、20 输出、378 组合与准备合同一致；所有数输出为 SIM。

已处理批准的原创封面和两幅章节图，共 4 个透明 WebP 输出；尺寸／SHA256／bytes／方法在 authoring/art-provenance.json。封面 800／1600，图 1200×900。小封面再编码至 57,538 bytes；两图 126,140／127,842 bytes，保留标准质量底线，超过软预算已记 REVIEW。可见像素 RGB 最大通道差 1，源图为等 RGB 灰阶；三幅形态人工核对通过。不新生成、不复制官方照片，不加入许可例外。

地方事实以 NParks、NUS、LKCNHM 为主，普遍生物关系另用 NOAA／NPS／WHOI。保留来源条件与准备期访问限制；修正不足 11 m 的英文方向歧义、补充论文每日／地点变动；Pulau Tekukor 不再误写为“鬼岛”，小姐妹岛用字统一。100k 保留为目标，馆藏不作海中数量。AUDIT.md 给出逐章事实／来源覆盖与删改，data/SOURCES.md、authoring/INVENTORY.md 给出来源方法与无地图记录。

04、05 章回链已发布 mangrove-food-web；另链 plant、living-things、energy-conversion。没有重复红树林内容、没有 draft 链接、没有规格要求以外的入站 back-link。路线表已加本主题；smoke 默认数更新为主题 49、biology 16、badges 98、目录图版／图数 49、ww2 图版号 49，待主会话合并时统一核对。

### 9.2 几何与内容核验

实际引擎 tessellation 的 CPU 预览两轮（r2→r3）核对：**299,124 三角形、39 个合并后 piece**，坐标／法线有限。13 对保守 AABB 相交是礁面接触、组织嵌套、苗圃承托，详见 authoring/geometry-review.json 与 AUDIT.md；藻点整球位于组织壁内另有截面单测。十二根不分枝触手、一个口及口盘唯一匹配开孔有几何断言。爆炸位移均为零。

初轮相邻台入镜已修正：珊瑚虫、食物网、证据台中心由 x=2.5／5／8 改为 **5／10／15**，相关 part、flow、动画 pivot、镜头与章初态同步平移，主体形态不改。最终六预设无邻台可见三角形；仅近景不可选底座边缘可超框。HUD framing 列全 26 selectable，由现有 fitter 排除作者镜头外的对象；实际 HUD／GPU 构图仍待浏览器。CPU PNG 在 gitignored docs/screenshots/coral-reef/；数值记录在主题 authoring 中，不冒充 shoot 截图。

全局 ID 校验发现并修正两组撞名：组用 `reef-habitat`／`evidence-tools`，保留 `reef-zones` 章和 `evidence` 预设。context 承托面／底缘分别属于礁体组／珊瑚虫组，不可选、不进索引。章 reset、所有 selectable 的索引覆盖、命名镜头目标组可见、39 拍字幕与表值一致均有单测。

### 9.3 非浏览器门槛

| 门槛 | 本轮结果 |
|---|---|
| pnpm check | 通过；964 files，0 errors、0 warnings、4 既有 hints；tsc 通过 |
| pnpm validate | 通过；86 topics，0 errors、0 warnings |
| pnpm test | 通过；220 files、5,853 tests；其中 coral-reef 405 tests，含全部 378 组合的独立图／公式 oracle |
| pnpm build | 通过；175 静态 pages，EN/ZH 主题页及 data.json 均生成；Vite 既有大 chunk 提示保留 |
| git diff --check | 通过；无 git 写入、无 package／lock／review-queue／next-batch 修改 |

`tests-e2e/coral-reef.spec.ts` 已写 15 项浏览器规约：四 locale/theme、箭头／伙伴边来源、selection≠inspect、预测记录、间接断路、章 reset、命名镜头、光／组织隔离、URL／返回、温缓存离线及 EN/ZH 手机键盘／44px／reduced-motion。记录表选择器限定 `.space-try__record`，不把预测条件表计入记录。

### 9.4 主会话待验收与 Gavin 后审

BUILD / CONTENT brief 明确禁止本沙箱运行浏览器门槛；**未运行 shoot / e2e、未打开或控制用户浏览器／桌面**。不是通过或失败，也不以 CPU 图代替。主会话在最新 build 后运行：

```sh
pnpm shoot coral-reef --beats --tasks --keys --layout --locale en,zh --theme paper,cinema
CI=1 ATLAS_E2E_PORT=5454 pnpm e2e
```

仍待 paper/cinema 全章全拍、1920／1600／1024／768／390 宽布局、标签、剖切／透视／流／爆炸／参考模式组合、手机触控、键盘、URL、离线、语音、运行时外部请求与 GPU calls 性能验收。CPU piece 数不等于 draw calls；本轮不宣称达成 FPS 或首屏 JS 预算。静止 <50、运转 <60 calls、FLOW 增幅 <10、0.3 M tris 与首屏 300 KB gz 仍作为目标交主会话实测。

给 Gavin 的八项后审：P6 Standard 应用定位与章序；18 主线中文词／地点词；不同放大比例与 12 触手示例；六节点四边的伙伴转移与推论边界；光指数与深度口径；三独立白化证据状态；地方保护的目标／行动／结果区别；真实浏览器视觉和性能。每项的默认处置、对应段落与偏差详列 `src/content/topics/coral-reef/REVIEW.md`。
