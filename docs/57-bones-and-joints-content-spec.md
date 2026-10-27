# 57 · 骨骼与关节 · 内容施工 spec（`bones-and-joints`，SpaceScene，v1）

2026-10-27 定稿。SpaceScene / Model3DStage；biology；EN 默认，简体 ZH；paper 默认、cinema 可切。**用户明确指定 status: published**。按 BRIEF-BUILD 三阶段实施，无 git 写入；浏览器 shoot/e2e 由主会话执行（端口 5445），本受限环境不运行。阅读优先级：§9施工记录 → 本规格 → main checkout 的准备档。

研究依据：`art/research/bones-and-joints/{bones-and-joints-research.md,facts.json,facts-extra.json,datasets.json,data/INVENTORY.md}`（main checkout，只读）。经验事实 id 逐一对照：50 条原 facts + X01–X03；所有章/拍引用均存在。D01/D02 是设计/限制，不是人体测量。§0 默认值供 Gavin 后审，不再要求施工授权。

## 0. 决定与核查

| # | 默认决定 | 依据 / 可改范围 |
|---|---|---|
| DEC-01 | slug `bones-and-joints`；标题 Bones and Joints / 骨骼与关节；`subject: biology`，`tags: [beyond-syllabus, health, space]`；`status: published`（用户明确指定） | 用户指定；C01 |
| DEC-02 | 成人男性参考解剖沿用六区 muscles 的源体型、坐标、材料和自身左右；不伪装成儿童骨架 | R01–R03 |
| DEC-03 | 背景 + 7主章，共8章40拍；无地图、无数据地图预取；不加考试式骨名背诵 | C01；本规格§2 |
| DEC-04 | 完整骨架采用34个可选语义部件；肋骨/手足/椎段按区域合并，但桡尺骨、胫腓骨和髌骨独立 | F01,F10,F11,R02；计数不等于206 |
| DEC-05 | 六型只指滑膜关节；真实小关节表面近景配既有pose/sequence；膝为修正铰链写入细看 | F12–F23 |
| DEC-06 | 肌肉仅选肱二头肌与肱三头肌及肌腱示意，解释跨关节拉力；动作训练回链六区，不复制训练内容 | F24–F26,M03 |
| DEC-07 | 理想杠杆量：W=0/10/20 N，L=0.15/0.30 m，θ=30/60/90/120°，r=0.04 m；不含前臂重量与肌肉力臂变化 | D01,F27,F28；全部SIM，不称人体测量 |
| DEC-08 | 生长、修复为独立质性标本；成人骨架不整体缩放变儿童；不预测密度、身高、愈合日或补钙效果 | F29–F37,D02 |
| DEC-09 | 新引擎仅1件：数字到rig movement的`joint`绑定；杠杆由既有table计算，离线骨架导出见§3.7/§4 | 当前代码核查：sim-schema.ts、bind.ts、schema.ts |
| DEC-10 | 沿用技术图版HUD；无评分quiz，保留原创predict-first；所有控件触控≥44px、离线、URL可重现 | docs/02、08、06 |
| DEC-11 | 髋关节封面、长骨截面沿用；重绘保护器官图，心肺置于12对肋骨、胸骨与后方胸椎里面（用户纠错） | 本规格§7，manifest.jsonl；F10 |
| DEC-12 | `parts.json`、GLB、ZA rig/sites及截图整体BY-SA；OpenStax衍生正文/教学图另为BY-NC-SA文件；原创胶水和常数明确以BY-SA提供给geometry packet | L01–L03；§3.5的文件边界不能省略 |

### 0.1 真正需要 Gavin 的

本次准备没有阻塞决定。以后可改：是否将六种滑膜关节全部放主线（默认全放）；是否让学生看到牛顿读数（默认只在PLATE与细看，主线先比大小）；是否把关节轴交给外部解剖审查者复核（保留具名人审未完成的事实，用户指定published不等于临床人审通过）。这些是后续实施审查点，本轮不发送批准请求。[F15,F27,R03]


### 0.2 施工默认与限制

- 采用现有 `table` 的24行静力表，不新增lever kind。单独mode控件仅控制可视与关节override；探索模式仍可计算表值，但只称理想模型读数，不宣称inactive/NaN。
- Blender 5.1.2在受限环境启动即139，未运行原生导出。允许主题内离线Three FBXLoader读取现有缓存，校正厘米到米并与native inventory逐件核bbox；沿用已发布arms肌肉蒙皮及rig。作为明确管线偏离，不称native验收通过。禁止assimp与伪造primitive成人骨架。
- 不依赖任何尚未合并分支。先核forces的力/力矩能力和六区muscles的19关节rig、命名pose；branch能力核查结果纳入§4。
- 六型中文是编辑工作用语，正文用功能释义辅助，不声称新加坡官方核定。

## 1. 范围、事实与教学边界

### 1.1 锚点

MOE 2023 cohort / Jan 2026 update：印刷p.53 / PDF p.54，P4 human systems overview；详细骨名与机制不要求。原文短摘只在parent dossier出现一次，避免重复扩展引文。本主题是非课纲深化，不承诺PSLE题型覆盖。[C01] 社会课纲无必要锚点，不挪用未经阅读的学习目标。

### 1.2 学到什么 / 边界

主线：骨架支持与保护；活骨的致密/网架/骨髓；关节结构与六型；肌肉跨关节拉骨；理想力矩平衡；生长板/重塑/修复；一般护理。[F01–F37]
细看：成人骨数变异、骨形状分类、膝的旋转、三维关节动作限制、模型省略。[F01,F09,F22,F23,F38,D01,D02]
不展开：解剖名词考试、病理诊断、性别鉴定、体态优劣、骨龄预测、营养补充剂处方、训练剂量；六区详细肌肉和动作回链。[C01,R01,D02]

### 1.3 误解 → 可观察反例

| 风险 | 画面 / 证据 | 处理 |
|---|---|---|
| 骨是一堆不相连“狗骨” | 01-01至01-06，连接链、形状与计数 | M02的绘图等级，不假设读者字面相信 |
| 认识名字就懂运动 | 05-01先猜跨关节，05-02/03揭示两种拉力 | M03；德国10–14岁证据，不能称本地发生率 |
| 骨松质柔软、骨内空心、骨是死的 | 02章网架、骨髓、血管 | F03–F08；编辑提出的预测，不编造研究结果 |
| 关节都能动、六型等于所有关节 | 03-01与04章 | F12,F15 |
| 桡尺骨一起扭成一根、膝是纯铰链 | 04-03+细看 | F11,F17,F22 |
| 肌肉推回骨、肌腱就是韧带 | 03-05+05-02/03 | F14,F24–F26 |
| 不长高便不再更新骨 | 06-02/03 | F29–F31 |

### 1.4 与已出版主题分工

`muscles-arms`：肘、前臂、拮抗回链；`muscles-legs`：髋膝及负重；`muscles-shoulders`：肩；`muscles-chest`：胸廓；`muscles-back`与`muscles-core`：脊柱稳定。`heart-and-lungs`：胸廓保护的器官；`digestive-system`：吸收营养；`forces`：力与力矩前置概念（力矩在本主题标深化）。全部status published已从topic.yaml核过，详情见parent §a。[F10,F24–F28,R02] 只给已发布主题添加相关的短句回链，不扩写其内容。

### 1.5 口吻

中英文独立成文，EN新加坡/英式拼写：haematoma、remodelling、metre。标题陈述式，儿童问题只用于备课；不拟人、不产品推荐、不病人图像。允许只观察模型完成活动，不按体型或运动能力分等。[C01,F32,F36,R01]


| 类别 | 关键条目 | parent ids | 使用位置 |
|---|---|---|---|
| 课纲 | P4总览，细节非要求 | C01 | 背景、topic元信息 |
| TYPICAL | 成人常规206；骨数与网格数不同 | F01,F38 | 01-06；细看不写固定新生儿计数 |
| TYPICAL | 骨结构、血供、矿物与骨髓 | F02–F09 | 02；以成人骨截面标本为示意 |
| TYPICAL | 胸廓12对肋，桡尺骨分开 | F10,F11 | 01、04 |
| TYPICAL | 三类连接、六类滑膜关节、软组织 | F12–F23 | 03、04 |
| TYPICAL | 跨关节张力，肱二头肌接桡骨 | F24–F26 | 05 |
| 原理 | τ=F×垂直力臂；静力矩平衡 | F27,F28 | 05细看与既有table静力表 |
| TYPICAL | 生长、重塑、修复与护理 | F29–F37 | 06、07 |
| DESIGN | 身体沿用源stature=1.7095352601027116 m | R01 | 不是人口均值或儿童高度 |
| DESIGN | 教学杠杆r=0.04 m，L=0.15/0.30 m，W=0/10/20 N | D01 | 原创设计研究，非解剖测量 |
| SIM | W=20,L=.30,θ=90 → d=.30,τ=6,Fm=150 | D01 | 05-05、PLATE |
| SIM | W=20,L=.30,θ=30 → d=.15,τ=3,Fm=75 | D01,F27 | 05-06；浮点容差见§4 |
| 限制 | 生长与修复没有时间轴拟合 | D02 | 06；无日期/密度预测 |

事实来源分歧继承parent §b。原理公式和原创常数不是从OpenStax表格抄出的数据；不把SIM标typical。所有已研究断言指向parent facts；第二轮追加的肩带关系、手细部source节点与当前绑定实现观察见facts-extra.json的X01–X03；没有下载新的经验数据。

## 2. 章节与40个节拍（8章，EN / ZH）

### 2.0 总表 / 相机与共同state

相机使用6个preset：hero `[3.2,1.2,4.3]→[0,-.35,0]` FOV30；front `[0,.3,4.8]→[0,-.35,0]` FOV28；chest `[.8,.4,1.6]→[0,.05,0]` FOV28；elbow `[1.1,-.15,1.25]→[.3,-.15,0]` FOV28；hip `[1.0,-.6,1.8]→[0,-.6,0]` FOV30；bone-section `[3.1,.6,2]→[2,0,0]` FOV30。它们是起始DESIGN镜头值，后续R2用实际bounds校正；joint-detail作为第六preset bone-section的工位camera override，**不**另外占第七preset。04各标本用camera beat override指向x=-2工位。01表内shoulder只是chest camera override；不是一个未声明preset。

所有默认：view assembled、run false、explode0、pose null、sim.mode explore、hide其它工位、ghost皮肤、labels最多6个（标签标重点并保留全文索引）。下表内逐拍state是语义施工指令；最终作者需转成当前frontmatter合法字段，绝不能把`select`/`sequence`等说明字符串当API。章state自足，拍仅在本章上叠加，模式组合沿docs/06；04指定sequence通过显式播放开启，非自动RUN。

| 章 | id | 拍数 | 默认工位 / 相机 | 默认索引分组 |
|---|---|---:|---|---|
| 00 | `before-you-start` | 4 | hero / 本章首拍 | §2.1列出的parts |
| 01 | `connected-skeleton` | 6 | front / 本章首拍 | §2.2列出的parts |
| 02 | `living-bone` | 5 | bone-section / 本章首拍 | §2.3列出的parts |
| 03 | `joint-connections` | 5 | joint-detail / 本章首拍 | §2.4列出的parts |
| 04 | `six-synovial-types` | 6 | joint-detail / 本章首拍 | §2.5列出的parts |
| 05 | `muscles-and-levers` | 6 | elbow / 本章首拍 | §2.6列出的parts |
| 06 | `growth-and-repair` | 4 | bone-section / 本章首拍 | §2.7列出的parts |
| 07 | `bone-care` | 4 | hero / 本章首拍 | §2.8列出的parts |

### 2.1 第00章 `before-you-start` · The body’s inner frame / 身体里的支架

**summary定稿**：The body’s inner frame: observe the model before reading the explanation. / 身体里的支架：先观察本章模型，再读结构与作用的说明。

| 拍id | state / 画面指令 | Caption EN（定稿） | 字幕 ZH（定稿） | fact ids |
|---|---|---|---|---|
| `00-body-outline` | ghost skin; pose rest; hero | This adult reference skeleton sits inside the body outline. | 这副成人参考骨架位于身体轮廓里面。 | R01,R02 |
| `00-own-left` | front; highlight humerus-l; labels humerus-l | Left means the body’s own left, on your right in this front view. | 左指身体自己的左侧，在这张正面图的右边。 | R01 |
| `00-reveal-frame` | hide skin-outline; hero | The skull, trunk and limbs form one connected frame. | 颅骨、躯干和四肢连成身体的支架。 | F02,M02 |
| `00-model-limit` | hero; select femur-l | This is adult reference anatomy, not a prediction of a child’s shape. | 这里展示成人参考解剖，不预测儿童的身体比例。 | R01,D02 |

**本章索引**：`parts: [skull, ribs-l, humerus-l, femur-l]`。所有本章提及并可选的部件必须在最终索引内；组名不能替代漏掉的具体部件。

**正文与细看要点**：正文：源模型和自身左右、转动/点选方法、成人参考限制。细看：来源与许可；为何不是儿童身体。首现：骨骼、解剖参考。[R01–R03]

### 2.2 第01章 `connected-skeleton` · A connected skeleton / 连起来的骨架

**summary定稿**：A connected skeleton: observe the model before reading the explanation. / 连起来的骨架：先观察本章模型，再读结构与作用的说明。

| 拍id | state / 画面指令 | Caption EN（定稿） | 字幕 ZH（定稿） | fact ids |
|---|---|---|---|---|
| `01-head-spine` | highlight skull cervical-spine thoracic-spine lumbar-spine | The skull and vertebral column support and protect different regions. | 颅骨与脊柱在不同部位提供支持和保护。 | F02 |
| `01-rib-cage` | chest; highlight ribs-l ribs-r sternum | The usual rib cage has twelve pairs of ribs and protects the heart and lungs. | 通常的胸廓有十二对肋骨，保护心与肺。 | F10 |
| `01-shoulder-girdle` | shoulder; highlight clavicle-l scapula-l humerus-l | The clavicle and scapula connect the upper limb to the trunk. | 锁骨和肩胛骨把上肢连接到躯干。 | X01,R02 |
| `01-pelvic-connection` | hip; highlight hip-bone-l sacrum femur-l | The pelvis connects the trunk and lower limbs; the femur meets a hip socket. | 骨盆连接躯干和下肢，股骨与髋臼相接。 | F18,F23 |
| `01-bone-shapes` | isolate sternum patella-l femur-l lumbar-spine hand-l | Bones have different shapes; even a small finger bone can be a long bone. | 骨有不同形状；小小的指骨也可以属于长骨。 | F09 |
| `01-count-and-model` | front; hero | The conventional adult count is 206; one selectable model part may contain many bones. | 成人骨的常规计数是206块；模型里一个可点选部件可以包含多块骨。 | F01,R02 |

**本章索引**：`parts: [skull, mandible, cervical-spine, thoracic-spine, lumbar-spine, ribs-l, ribs-r, sternum, clavicle-l, scapula-l, hip-bone-l, sacrum, femur-l, patella-l, tibia-l, fibula-l, hand-l]`。所有本章提及并可选的部件必须在最终索引内；组名不能替代漏掉的具体部件。

**正文与细看要点**：正文：连接的骨架、骨形状与计数；206带Num来源。细看：手足与椎段为何合并；成人计数变异；不同新生儿计数只并列在来源说明，不设记忆题。首现：胸廓、脊柱、肩带、骨盆。[F01,F09–F11,F38,R02]

### 2.3 第02章 `living-bone` · Inside a living bone / 活骨的里面

**summary定稿**：Inside a living bone: observe the model before reading the explanation. / 活骨的里面：先观察本章模型，再读结构与作用的说明。

| 拍id | state / 画面指令 | Caption EN（定稿） | 字幕 ZH（定稿） | fact ids |
|---|---|---|---|---|
| `02-protected-organs` | chest; highlight ribs-l ribs-r; figure protected-organs | The heart and lungs shown here are organs protected by the rib cage. | 图中的心与肺是胸廓保护的器官。 | F02,F10 |
| `02-dense-wall` | bone-section; select bone-cortex | The shaft has a dense outer wall of compact bone. | 骨干的外壁由致密的骨密质构成。 | F05,F06 |
| `02-hard-lattice` | bone-section; select bone-lattice | Spongy bone is a hard lattice with spaces between its struts. | 骨松质是坚硬的网架，骨小梁之间留有空隙。 | F05 |
| `02-marrow-space` | bone-section; select bone-marrow | Marrow occupies internal spaces; red marrow produces blood cells. | 骨髓位于骨内空隙，红骨髓能够制造血细胞。 | F03,F06 |
| `02-living-tissue` | bone-section; select bone-vessel | Blood vessels supply the living tissues inside a bone. | 血管为骨里的活组织提供血液。 | F04,F07,F08 |

**本章索引**：`parts: [bone-cortex, bone-lattice, bone-marrow, bone-vessel, ribs-l, ribs-r]`。所有本章提及并可选的部件必须在最终索引内；组名不能替代漏掉的具体部件。

**正文与细看要点**：正文：活组织而非石头；致密壁、骨小梁、骨髓、血供。细看：红髓与黄髓及年龄差别；原创截面非特定股骨/非微观比例。首现：骨密质、骨松质、骨髓、骨膜。重绘心肺保护图显示胸廓；12对的准确计数由源骨模型与机器审计负责，插画必须逐对目检，不能仅凭提示词认定。[F02–F08,F10]

### 2.4 第03章 `joint-connections` · Connections between bones / 骨与骨的连接

**summary定稿**：Connections between bones: observe the model before reading the explanation. / 骨与骨的连接：先观察本章模型，再读结构与作用的说明。

| 拍id | state / 画面指令 | Caption EN（定稿） | 字幕 ZH（定稿） | fact ids |
|---|---|---|---|---|
| `03-not-all-move` | front; skull detail; pose rest | Some joints allow little or no movement, including many skull sutures. | 有些骨连接几乎不动，例如颅骨间的许多骨缝。 | F12 |
| `03-cartilage-cover` | joint-detail; ghost joint-capsule; select joint-cartilage-a | Smooth articular cartilage covers the facing bone surfaces. | 相对的骨面覆有关节软骨，表面光滑。 | F13 |
| `03-capsule-fluid` | joint-detail; select joint-capsule | A capsule encloses a synovial joint; fluid inside helps the surfaces move smoothly. | 关节囊围住滑膜关节，里面的滑液使相对表面顺畅活动。 | F13 |
| `03-ligament-support` | joint-detail; select joint-ligament | Ligaments support the connection between bones and limit excess movement. | 韧带支持骨之间的连接，限制过度活动。 | F14 |
| `03-tendon-difference` | elbow; select flexor-tendon | A tendon carries a muscle’s pull to bone; it is different from a ligament. | 肌腱把肌肉的拉力传给骨，与韧带不同。 | F14,F24 |

**本章索引**：`parts: [skull, joint-cartilage-a, joint-cartilage-b, joint-capsule, joint-ligament, flexor-tendon]`。所有本章提及并可选的部件必须在最终索引内；组名不能替代漏掉的具体部件。

**正文与细看要点**：正文：连接范围、滑膜关节组成、肌腱与韧带区别。细看：三类结构vs活动程度不是同一分类；关节间隙与透明度为看清而调整。首现：关节、软骨、囊、滑液、韧带、肌腱。[F12–F14]

### 2.5 第04章 `six-synovial-types` · Six shapes of synovial joint / 滑膜关节的六种形状

**summary定稿**：Six shapes of synovial joint: observe the model before reading the explanation. / 滑膜关节的六种形状：先观察本章模型，再读结构与作用的说明。

| 拍id | state / 画面指令 | Caption EN（定稿） | 字幕 ZH（定稿） | fact ids |
|---|---|---|---|---|
| `04-plane` | isolate carpal-scaphoid carpal-lunate; sequence plane-glide | These small carpal surfaces glide by a small amount. | 这两块腕骨的相对表面作小幅滑动。 | F21 |
| `04-hinge` | elbow; pose elbow-flexed; isolate humerus-l ulna-l | At this hinge example, the ulna bends and straightens relative to the humerus. | 这个铰链关节例子里，尺骨相对肱骨屈伸。 | F16 |
| `04-pivot` | elbow; pose forearm-pronated; isolate ulna-l radius-l hand-l | The radius turns relative to the ulna during forearm rotation. | 前臂旋转时，桡骨相对尺骨转动。 | F11,F17 |
| `04-condyloid` | joint-detail; isolate mcp-metacarpal mcp-phalanx; sequence mcp-two-axes | This knuckle example moves in two main directions. | 这个指根关节可沿两个主要方向活动。 | F19 |
| `04-saddle` | joint-detail; isolate thumb-trapezium thumb-metacarpal; sequence thumb-cmc | The thumb base has complementary saddle-shaped surfaces. | 拇指根部的两个关节面以鞍状的凹凸相配。 | F20 |
| `04-ball-socket` | hip; isolate hip-bone-l femur-l; sequence hip-three-axes | The rounded femoral head moves in the hip socket around several axes. | 圆形股骨头在髋臼内绕多个轴活动。 | F18,F23 |

**本章索引**：`parts: [carpal-scaphoid, carpal-lunate, ulna-l, humerus-l, radius-l, mcp-metacarpal, mcp-phalanx, thumb-trapezium, thumb-metacarpal, hip-bone-l, femur-l]`。所有本章提及并可选的部件必须在最终索引内；组名不能替代漏掉的具体部件。

**正文与细看要点**：正文：六种滑膜类型，按平面、铰链、车轴、椭圆、鞍状、球窝逐一比较。细看：膝是修正铰链、屈膝时可旋转；肩与髋活动与稳定的取舍；韧带与肌肉同样限制活动，不用手模强行示范学生ROM。术语待核项按§5标注。[F15–F23]

### 2.6 第05章 `muscles-and-levers` · Muscles pull on bone levers / 肌肉拉动骨杠杆

**summary定稿**：Muscles pull on bone levers: observe the model before reading the explanation. / 肌肉拉动骨杠杆：先观察本章模型，再读结构与作用的说明。

| 拍id | state / 画面指令 | Caption EN（定稿） | 字幕 ZH（定稿） | fact ids |
|---|---|---|---|---|
| `05-span-predict` | sim mode explore; pose rest; highlight flexor-tendon | Predict whether a pull can turn the forearm when both attachments stay on one bone. | 先猜：若两个附着点都在同一块骨上，拉力能转动前臂吗？ | M03,F24 |
| `05-flexor-pull` | sim mode explore; pose elbow-flexed; highlight biceps-l radius-l | The biceps pull reaches the radius across the elbow. | 肱二头肌的拉力跨过肘部传到桡骨。 | F24,F26 |
| `05-opposing-pull` | sim mode explore; pose elbow-extended; highlight triceps-l ulna-l | The triceps pull reaches the ulna and extends the elbow. | 肱三头肌拉尺骨，使肘伸展。 | F25,F26 |
| `05-distance-predict` | sim mode lever; load-force 20; load-distance 0.15; elbow-angle 90 | Predict what happens when the same model load moves farther from the pivot. | 先猜：把同样的模型负载移离支点，所需肌肉拉力会怎样变化？ | F27,F28,D01 |
| `05-distance-reveal` | sim mode lever; load-force 20; load-distance 0.30; elbow-angle 90 | In this ideal model, 20 newtons at 0.30 metres requires 150 newtons of muscle pull. | 在这个理想模型中，20牛顿作用在0.30米处，需要150牛顿的肌肉拉力。 | D01 |
| `05-angle-matters` | sim mode lever; load-force 20; load-distance 0.30; elbow-angle 30 | At this model angle, the perpendicular load arm is shorter and the required pull is 75 newtons. | 在这个模型角度，负载的垂直力臂较短，所需拉力是75牛顿。 | F27,D01 |

**本章索引**：`parts: [humerus-l, radius-l, ulna-l, biceps-l, triceps-l, flexor-tendon, extensor-tendon, lever-beam, lever-load]`。所有本章提及并可选的部件必须在最终索引内；组名不能替代漏掉的具体部件。

**正文与细看要点**：正文：跨关节、相反动作、力臂与负载；先比大小再在PLATE读数。细看：r恒定、前臂无自重、准静态；150N不是肌力测量；模型不含神经控制与共同收缩。原创predict定义：从L=.15变.30，observe muscle-force，expected increase；另一题θ90变30 expected decrease。[F24–F28,D01,M03]

### 2.7 第06章 `growth-and-repair` · Growth and repair / 生长与修复

**summary定稿**：Growth and repair: observe the model before reading the explanation. / 生长与修复：先观察本章模型，再读结构与作用的说明。

| 拍id | state / 画面指令 | Caption EN（定稿） | 字幕 ZH（定稿） | fact ids |
|---|---|---|---|---|
| `06-growth-region` | bone-section; hide adult sample; show growing schematic plate | A growth plate marks a region where a young long bone lengthens. | 生长板标出幼年长骨增长的区域。 | F29,F30 |
| `06-closed-plate` | bone-section; show mature schematic; hide growth-plate | When growth plates close, the bone stops lengthening there. | 生长板闭合后，骨在该处停止纵向增长。 | F29 |
| `06-ongoing-remodel` | bone-section; highlight remodel-patch; no continuous tissue simulation | Adult bone is still renewed; remodelling continues after height growth ends. | 成人骨仍会更新；身高停止增长后，重塑仍在继续。 | F30,F31 |
| `06-repair-stages` | bone-section; show four static repair-stage specimens; no time axis | A fracture can form a callus and remodel; these stages do not specify a healing deadline. | 骨折处可形成骨痂并重塑；这些阶段没有规定愈合期限。 | F32,D02 |

**本章索引**：`parts: [bone-cortex, bone-lattice, bone-marrow, growth-plate, bone-vessel, remodel-patch, repair-stage-clot, repair-stage-soft, repair-stage-hard, repair-stage-remodelled]`。所有本章提及并可选的部件必须在最终索引内；组名不能替代漏掉的具体部件。

**正文与细看要点**：正文：幼骨生长区域与成人重塑的区别；骨折可修复但需要照护。细看：不以同一个年龄代表闭合；修复阶段无固定天数，石膏不自己制造骨；不指导学生自行复位。growth-plate模型切换注明质性、非儿童身高。[F29–F32,F37,D02]

### 2.8 第07章 `bone-care` · Care through everyday choices / 日常选择与骨骼护理

**summary定稿**：Care through everyday choices: observe the model before reading the explanation. / 日常选择与骨骼护理：先观察本章模型，再读结构与作用的说明。

| 拍id | state / 画面指令 | Caption EN（定稿） | 字幕 ZH（定稿） | fact ids |
|---|---|---|---|---|
| `07-food-variety` | hero; no density/mass change | Calcium-rich foods and vitamin D support bone health; foods offer several different routes. | 富含钙的食物和维生素D有助骨骼健康，食物选择不只一种。 | F34,F35 |
| `07-activity-principle` | hero; pose comfortable-walk schematic | Singapore guidance includes muscle- and bone-strengthening activities at least three times weekly for children above six. | 新加坡建议六岁以上儿童每周至少三次进行强健肌肉与骨骼的活动。 | F33,F36 |
| `07-seek-help` | hero; select femur-l; no fracture manipulation | An injured growing bone may need prompt medical assessment; this model cannot diagnose it. | 生长中的骨受伤后可能需要及时就医，本模型不能诊断。 | F37 |
| `07-reconnect` | hero; layers all anatomy; pose rest | Bones, joints and pulling muscles work together as one moving system. | 骨、关节和拉动骨的肌肉共同组成运动系统。 | F02,F14,F24,F25 |

**本章索引**：`parts: [skull, ribs-l, humerus-l, femur-l, bone-vessel]`。所有本章提及并可选的部件必须在最终索引内；组名不能替代漏掉的具体部件。

**正文与细看要点**：正文：饮食多样、钙与维生素D、合适的活动、受伤求助。细看：新加坡建议适用年龄；食物标签与豆腐凝固剂差别；不搬成人钙/阳光处方给儿童。首现：负重运动。[F33–F37]

### 2.9 各章state补全规则

02、06的通用骨截面与四个修复标本分工位，不与成人骨架重叠；`growth-plate`仅06-01可见。01、07隐藏joint-detail、force-overlay与所有实验工位，sim.mode强制explore。03使用通用滑膜关节示意，01骨架没有虚构透明囊。04将需要的真骨转移到单工位时使用独立标本实例；不把全身内原骨从身体抽走造成空缺后仍声称完整骨架。索引的part与实际可点对象一致；用于仅context的工位梁/台面不在part chain占号。

05-01的预测图是自制示意：跨关节附着尚未揭示时仅放抽象虚线示意层；不能在真实ZA模型上把二头肌错误地绑到同一骨，再当真实解剖展示。若界面不支持这类抽象图，预测只用文字、实际模型保持正确附着。[F24,F26,M03]

## 3. 对象、数据、图层、既有能力组合

### 3.1 五个实体组、一个力层与Tier-1

| 组 | 内容 | token / 视觉规则 |
|---|---|---|
| 01 `axial` | 颅、颌、椎段、骶尾、胸骨、两侧肋骨，共10语义部件 | `token:bone` |
| 02 `appendicular` | 双侧肩带、上肢、髋骨、下肢，共24 | `token:bone`；左右有真实source |
| 03 `joint-detail` | 手小关节七骨 + 两个软骨面/囊/韧带，共11 | 软组织沿既有token；不把透明等同真实透明 |
| 04 `bone-section` | cortex/lattice/marrow/vessel/growth-plate + remodel-patch + 四个完整修复阶段标本，共10 | 切面沿既有cutaway token；材质差别+文字，灰度仍区分 |
| 05 `pull-and-lever` | 两块肌肉、两条教学肌腱、理想梁、抽象负载，共6 | 肌肉沿muscle tokens；力用既有force tokens |

另有第06组`force-overlay`，没有实体，专门承载既有force-vectors；不进入部件卡。合计61个可选语义部件 + `skin-outline`一个context；不是61块骨。完整骨架是成人参考，皮肤只作定位，context不进入编号与选择。Tier-1：头/胸廓/骨盆比例沿muscles；肋对和浮肋结构可数；桡尺、胫腓并列；髌骨在前；髋臼与股骨头相对；六型每次只展示一个关节，不能用球体积木冒充真实骨表面。[F01,F10,F11,F15–F23,R01,R02]

### 3.2 坐标、尺度与模型工位

源码读证：`scripts/anatomy/README.md` Selection, frames and rigs；`scripts/anatomy/arms/rig.json`；`cache/inventory.json`。米，+Y上、+Z前、+X自身左；源坐标变换(x,y,z)→(x,z,-y)。arms源中心 `[0,0.030789900571107864,1.2483623027801514]`，floorY `-1.2487447451567277`，stature `1.7095352601027116`。[R01] 后续统一使用arms frame作为本主题基准；同一个source只做一次中心转换，不把六份GLB各自中心混用。是否接地沿现有rig代码，不能重复加floor补偿。

主骨架工位中心是胸骨参考附近。微观骨截面独立工位x=+2.0 m；关节标本工位x=-2.0 m；理想杠杆工位x=+4.0 m；这些是排版坐标DESIGN，不是解剖位置，章/拍只开一个工位。近景骨按统一变换平移并用镜头放大，不缩放成人身体或扭曲源骨相对比例。内部骨小梁为定性放大示意，不标骨小梁厚度尺。[R01,D02]

### 3.3 34个全身骨架部件

| ids | 数 | 骨源/合并策略 | connects / 索引 |
|---|---:|---|---|
| `skull`,`mandible` | 2 | 实际颅面骨合并成skull但下颌独立；不造“一个颅骨”计数 | skull→cervical-spine；mandible→skull |
| `cervical-spine`,`thoracic-spine`,`lumbar-spine` | 3 | 各真实椎段合并，不模拟逐椎运动 | 头→颈→胸→腰→骶 |
| `sacrum`,`coccyx` | 2 | 骶尾分别保留 | sacrum→coccyx / hip-bone-* |
| `sternum`,`ribs-l`,`ribs-r` | 3 | 胸骨可合并三段；每侧真实12条肋骨及相应软骨合并，浮肋保持不接胸骨 | thoracic-spine→ribs-*→sternum（connects仅教学概览，不暗示每条肋直接接胸骨） |
| `clavicle-l/r`,`scapula-l/r` | 4 | 真实左右，不简单镜像 | sternum→clavicle→scapula→humerus |
| `humerus-l/r`,`radius-l/r`,`ulna-l/r`,`hand-l/r` | 8 | radius、ulna单独；手骨按侧合并，04细部另标本 | humerus→radius/ulna→hand |
| `hip-bone-l/r`,`femur-l/r`,`patella-l/r`,`tibia-l/r`,`fibula-l/r`,`foot-l/r` | 12 | 髋骨独立于骶骨；胫腓独立；足按侧合并 | hip→femur→tibia→foot；patella前；fibula不接股骨 |

手足合并只是总览；body part详情写“区域合并，含多块骨”，不会弹出“手骨=1块”。骨架explode默认0，只有关节/截面工位可轻度分离，避免教成脱臼或未连接的骨堆。[F01,F10,F11,R02]

### 3.4 细部与summary/detail计划

| ids / 计数 | 几何及出处 | summary / detail要点，最终EN/ZH独立写 |
|---|---|---|
| `carpal-scaphoid`,`carpal-lunate`,`carpal-capitate` (3) | inventory中 Scaphoid bone.l / Lunate bone.l / Capitate bone.l，近景转移只保留有真实接触的选对；capitate用作邻接方向参照 | 腕骨小幅滑动，不夸大间隙；不能说所有腕骨间都同样运动。[F21] |
| `mcp-metacarpal`,`mcp-phalanx` (2) | Second metacarpal bone.l / Proximal phalanx of second finger of hand.l | 两轴动；不是腕关节或指间铰链。[F19] |
| `thumb-trapezium`,`thumb-metacarpal` (2) | Trapezium bone.l / First metacarpal bone.l | 鞍状面相对；不把拇指的掌指关节当CMC。[F20] |
| `joint-cartilage-a/b`,`joint-capsule`,`joint-ligament` (4) | 先核Joints100真实结构；不适合时原创通用滑膜关节示意，标非特定关节，不捏造命名韧带 | 软骨面、囊、滑液在囊内、韧带支持；厚度夸大只为可读。[F13,F14] |
| `bone-cortex`,`bone-lattice`,`bone-marrow`,`bone-vessel`,`growth-plate` (5) | 原创建模通用长骨截面；参考NIAMS公开联邦事实与独立设计；非从OpenStax图描摹或从ZA femur切出虚构内部 | compact硬壁、硬网架、软髓、血供；growth-plate只在幼年示意状态显示；此五件不通过pose改变网格拓扑，修复用下行独立标本。[F03–F08,F29–F32,D02] |
| `remodel-patch`,`repair-stage-clot`,`repair-stage-soft`,`repair-stage-hard`,`repair-stage-remodelled` (5) | 原创固定mesh：表面更新示意斑块；四个分别完整的非血腥骨折/软骨痂/硬骨痂/重塑标本，阶段横向并排，不从时间参数长出来 | 四个修复部件各含对应阶段的完整骨外形与桥接组织；按需hide/show，caption说阶段顺序，无天数；不以sequence伪装现有pose能改变顶点拓扑。[F31,F32,D02] |
| `biceps-l`,`triceps-l`,`flexor-tendon`,`extensor-tendon` (4) | 真实左侧ZA选源；肌腱以真实source/附着点为基础，可读性放大记note；F26的精确止点必须人审 | 拉桡骨、拉鹰嘴，origin→insertion；不画肌肉由颜色变化就“变强”。[F24–F26,R03] |
| `lever-beam`,`lever-load` (2) | 自己写的无质量梁与点负载；不照抄教科书图；无品牌/器械 | 理想力臂与外力；读数不是人的力量测量。[F27,F28,D01] |

已在inventory读到的候选节点（X02）和source大小/sha见local-audit.json；本表不等于已导出GLB。仍须重新扫描所有颅骨/肋骨/关节结构，拒绝把`.g` EMPTY、label helpers当实体。`Sternum.g`已见EMPTY，必须选其实际骨source合并；不能只按名字拉一个空节点。[R02,R03]

### 3.5 文件、许可与加载边界

无需新增混合包加载器。沿当前SpaceScene的数据入口，**整个`data/parts.json`主动采用CC BY-SA 4.0**，连同本主题原创胶水、原始模拟常数、数学算法配置、61件名称/自写短summary及程序化几何一并按BY-SA提供。其可用文字只来自作者独立措辞、公开事实和NIAMS联邦文字；**不复制、改写或烘入OpenStax的受许可图、说明文字或例题编排**。names可用ZA/BP3D名表；关节详细说明、OpenStax教学内容写在独立MDX/名词表。事实本身和公式不等于图文复制。[L01–L03,D01]

| 文件 / 资源 | 来源和 share-alike family | 边界 |
|---|---|---|
| `public/models/bones-and-joints.glb` | ZA/BP3D选源 + Atlas自制教学标本，整体CC BY-SA 4.0 | 保留asset.copyright、改动及上游两行署名；不含NC插图/贴图 |
| `data/parts.json` | 几何/rig/pose/sites与独立自写标签、SIM配置，整体CC BY-SA 4.0 | 当前schema可直接载入；不塞OpenStax衍生正文 |
| `anatomy-rig.json`,`anatomy-sites.json`及source manifest | 几何衍生CC BY-SA 4.0 | 输出到后续scripts/anatomy目录；所有坐标追溯源，不混入NC内容 |
| `chapters/*.mdx`,`glossary.json` | 独立正文及OpenStax教学转述，CC BY-NC-SA 4.0 | 引用模型id，不复制BY-SA网格/坐标表进正文资产 |
| `sources.json`,`SOURCES.md` | 作者编制出处元数据；独立措辞CC BY-NC-SA 4.0 | 仅指向BY-SA模型及其单独notice，元数据不是几何合并 |
| 从ZA模型导出的截图/hero | CC BY-SA 4.0 | LICENSE-CONTENT carve-out；不能用默认NC盖掉 |
| 三张planned PNG | 原创/原有独立imagegen插画CC BY-NC-SA 4.0 | 未用ZA渲染图作图生图，不混烘在GLB里 |

署名四处：GLB asset、THIRD-PARTY-NOTICES、data/SOURCES、topic.note+背景来源细看；LICENSE-CONTENT需清楚列上表例外。后续文字代理如果要用OpenStax写part detail，必须改为独立MDX细看，不得突破`parts.json`的许可边界。[L01,L02]

### 3.6 流、动画、模式与性能

- 无血流粒子、无骨内物质流，`flows: []`；血供用可选血管部件说明，不能把流动粒子误当“钙流”。[F04,F07]
- 关节pose/sequence：elbow-flexed、elbow-extended、forearm-pronated、plane-glide、mcp-two-axes、thumb-cmc、hip-three-axes；生长为同一通用示意骨的plate显示/隐藏，修复为四个预建静态标本，永不按天自动长骨。[F16–F23,F29–F32,D02]
- 爆炸：全身章锁默认0；细部小幅explode不超过局部骨长10%（DESIGN），切入动作时回0。X-ray只淡化壳/囊；细部采用明确开窗的预制截面，单平面cutaway不承担生成内部解剖的责任。
- group layers/hide不累积；每章离开时恢复章state；默认不自动播放，底部只有章/拍轴。RUN仅控制sequence，不改变SIM静态计算。[X03；docs/06]
- GLB软目标≤4 MB、硬≤8 MB；三角形软≤350k、硬≤500k；可见draw软<60、硬<100；首屏JS≤300KB gz；不增加包；全部本地，动态请求只走本地topic data/GLB。[docs/02,08] 精度按骨表面/关节细部独立报告，不用一个固定简化百分比掩盖薄骨损失。


### 3.7 离线骨架与验证

源缓存SHA沿local-audit.json；主题内runner显式注册bones-joints（不向固定六区runner传未知region）。FBXLoader保留userData.originalName，不选EMPTY；变换与native inventory比较，bbox误差≤1e-6 m。34总览骨语义件、7手骨细部、2真实肌肉、皮肤与原创教学件按§3.1–3.4。肋骨两侧各有First…Twelfth rib十二个实际mesh；胸骨由实际源mesh合并；胫/腓骨、桡/尺骨分开。骨刚性权重归属真实关节，桡骨随forearm而尺骨随elbow；源肌肉保留既有蒙皮。预算、节点清单、bbox、source SHA与GLB版权存report。原生预览、附着点具名人审和浏览器画面待主会话，不改写pending成accepted。
## 4. 引擎契约（仅一个真正缺口）

### 4.1 复用核对与删除项

先查 `forces` 的 `lib/sim/force.ts`、`sim-schema.ts`、`force-vectors` 与 `muscles-arms` 的 rig/poses：现有forces适合力的向量与运动，不需增加另一套力学系统；本主题只有有限静态点，使用现有table。现有rig命名pose/sequence已支持父链、蒙皮和前臂旋转。`sim.bind.pose`目前只读取pose.parts，不读取pose.joints，因此数字→rig仍为真正缺口。

- **删除 E-BJ1 lever**：`sim.kind: table`；控件 `elbow-angle` step=[30,60,90,120]°，`load-force` step=[0,10,20] N，`load-distance` step=[.15,.30] m。实验keys为这三项，共24行；mode选择explore/lever独立于实验keys。输出angle、load、load-arm、load-torque、muscle-force、residual，均numeric、sim；r=.04 m写入设计研究S34。
- 表生成公式 d=L sinθ，τ=W d，Fm=τ/.04，residual=τ−Fm×.04。每行sources=[S34]，无另一个数值求解器、无运行时公式分支。先猜后看仅更改该实验keys。
- 复用part rotate/offset/visible、force-vectors、命名poses与sequence、既有URL、PLATE、TryIt；不新增HUD、timeline、分类/光/磁/电路/材料功能。蒸汽机机构与table/pose能力已在main。
- 检查`git log --oneline main..codex/<branch>`及`git show`：monsoon-engine（月气候）、sem-engine（公转自转）、airfoil-content（翼型）、dinosaur（Ma底图）、plates（参考层/目录/撞击）；均与该数字到rig缺口无替代关系。最终提交读证摘要写§9，不引入分支依赖。

### 4.2 E-BJ2：数字 → rig joint movement 绑定

扩展sim.bind的target判别联合，新增**与part/flow/animation互斥**的joint分支：

```json
{"output":"angle","joint":"elbow.l","movement":"flexion","angle":{"per":1,"origin":0}}
```

`joint`值与`rig.joints`的对象key完全一致（带`.l/.r`，不是kebabId）；`movement`必须是该joint.axes存在的movement；`angle.per` finite nonzero默认1，`origin` finite默认0，计算`deg=(numeric-origin)*per`。只接一个numeric control或numeric output，两者互斥；不接state/vector/timeline。数输出为NaN/非有限，或when条件不成立时**不产生override**。同一joint+movement的两条sim绑定拒绝，不允许依赖数组顺序。数字绑定与已有joint sequence不能共用一个joint，schema拒绝该组合。当前rig无角度边界字段；对所有step选项或table数值检查通用[-180,180]，其它solver输出在运行时也须有限且落在此范围，实际UI是保守DESIGN幅度，不是人的活动能力标准。[R03]

`simEffects`新增`joints: Map<string, Record<string,number>>`。舞台：在现有chapter/beat pose joints与exercise姿态合成后，按movement字段覆盖；保留没有绑定的其它movement和其它joint，沿同一rig变换路径处理local axis/父链/蒙皮；**不**将part.rotation叠一遍。全身右侧不自动镜像该绑定，作者需显式另写right；沿现有mirrorSignedAxes只处理声明了的right。当前主题只控制左肘。exercise与active sim同一joint若同时出现，validation给冲突错误；本主题不启用exercise。[R01,R02]

交互：普通control变更0.5 s沿现有pose easing；URL首次载入或reduced-motion立即终值。`mode`回explore后自动恢复当前章/拍pose；换章清章sim.set，不能带着lever θ90压住04的pivot姿态。LAYERS隐藏只影响绘制，数值仍可计算；观察量不会因隐藏变成0。

测试：a) `angle=90`使elbow.l.flexion=90、其余joint不变；b)NaN保留章pose30；c)相同输入的深链末端位置等于现有命名pose90计算结果（平移和旋转误差≤1e-6）；d) duplicate、unknownjoint、unknownaxis、state值、sim/exercise冲突都报schema error；e) deep link与手动点击得到同终态；f)右侧未绑定完全不变；g)换章恢复pose而不累积；h)不得将trunk或“最近骨”作为错误target的回退。


本主题绑定：`{"output":"angle","joint":"elbow.l","movement":"flexion","angle":{"per":1,"origin":0},"when":{"control":"mode","is":{"eq":"lever"}}}`。when复用既有play.when条件语法；control/output只写一项，is为eq/ne/in/gte/lte或true。只有左肘override，不额外镜像右侧。所有sim joint keys先与章/拍pose合成，再传给既有MotionDriver；不能独立叠加part rotation。

### 4.3 既有表的expected numbers与验收

| W N | L m | θ ° | d m | τ N·m | Fm N |
|---:|---:|---:|---:|---:|---:|
|20|.30|90|.30|6|150|
|20|.15|90|.15|3|75|
|10|.30|90|.30|3|75|
|20|.30|30|.15|3|75|
|20|.30|60/120|.2598076211|5.196152423|129.9038106|
|0|.30|90|.30|0|0|

24组组合全部有限、残差≤1e-10；角60/120对称，W/L翻倍Fm翻倍。table现有校验负责完整/重复/来源/输出种类；内容单测独立重算。E-BJ2须具备unit、schema issues、draft sample-joint fixture、e2e（5445）、docs/06与§9记录，覆盖NaN/when恢复、左右隔离、父链末端与命名pose同态≤1e-6、duplicate/unknown/state/conflict拒绝。

### 4.4 绑定与读数

05第4–6拍只开左肘近景与理想梁工位，明确标题“质性解剖 / 理想静力模型”。`angle`输出通过E-BJ2驱动肘；理想梁通过现有rotate围绕固定pivot转，球形抽象负载与梁绕同一pivot旋转，不以负载朝向表示重力。负载沿梁距离由对应两套命名pose选择（L.15/.30）；角度再用rotate叠加，重力箭头保持竖直，不随梁一起旋转。力的箭头只放理想工位，使用已有force-vectors的数输出与when条件；不新增动态人体力矢量求解器。第06组force-overlay只装叠加，没有实体。负载箭头绑定lever-load，dir=[0,-1,0]、value.output=load、when.mode=lever。肌肉等效拉力箭头绑定lever-beam，在每个允许θ各写一条when.elbow-angle=θ的箭头，dir=[cosθ,sinθ,0]、value.output=muscle-force；该方向垂直于梁，不冒充二头肌的真实作用线。梁固定长.30 m、中心位于距pivot .15 m处，起点offset=[-.11 sinθ,.11 cosθ,0]，使作用点距pivot .04 m；所有向量为scene轴方向，现有overlay支持per-angle guard。per=.001 m/N、max=.20 m；箭长截顶要在细看说明。真实肌肉仅强调拉力传递，不按计算力值变粗、缩短或强迫二头肌独自承重。[F24–F28,D01]

PLATE仅4行：外加力(load)、垂直力臂(load-arm)、模型肌肉力(muscle-force)、角度(angle)。单位N/m/N/°，decimals分别0/2/0/0；原始未舍入量用于求解。下方SIM状态与当前控件，细看给力矩和省略条件；正文不把牛顿变kg。“150N”不解释为可举150N或学生应达到的训练负载。


交付数据可加入distance及tip-x/tip-y三个内部数输出，以offset将负载放到梁的对应距离；不用两套距离pose，仍只有24行。原先角度/模式的inactive约定已删除；table始终可求值，只有mode=lever时显示梁/箭头并覆盖左肘。原先新增离线region工作不计为运行引擎功能。

## 5. 名词表 EN / ZH

parent terms共55条，46条有简体来源、6条明确本地attestation；9条仍有核查标记。正文只选以下20个首现词（保留六型术语，超出模板16词属范围决定）；未核项保留工作稿标记，不冒充MOE标准。完整列表在facts.json的terms，source locators和sg_attested可追溯。[S27–S29]

| id | EN / ZH | 定义要点 / see |
|---|---|---|
| skeleton | Skeleton / 骨骼 | 身体的骨组成的框架；F01,F02 |
| joint | Joint / 关节 | 骨相接处，可不动或有不同活动程度；F12 |
| cartilage | Cartilage / 软骨 | 关节面等部位的结缔组织；不等同骨松质；F13 |
| compact-bone | Compact bone / 骨密质 | 密实骨组织，非没有细胞的石头；F05 |
| spongy-bone | Spongy bone / 骨松质 | 骨小梁网架；F05 |
| marrow | Bone marrow / 骨髓 | 骨内软组织，红髓造血；F03 |
| periosteum | Periosteum / 骨膜 | 多数骨外面的组织膜；F07 |
| ligament | Ligament / 韧带 | 支持骨之间连接；F14 |
| tendon | Tendon / 肌腱 | 传递肌肉张力到骨；F14 |
| synovial-fluid | Synovial fluid / 滑液 | 滑膜关节腔内润滑液；F13 |
| hinge | Hinge joint / 铰链关节 | 主要屈伸的例子；F16；MSD用词已核；另一专业名称的PDF抽取字形不采用 |
| pivot | Pivot joint / 车轴关节（译词待核） | 主要绕一轴旋转；F17 |
| ball-socket | Ball-and-socket joint / 球窝关节（译词待核） | 多轴活动；F18；MSD另用杵臼关节 |
| condyloid | Condyloid joint / 椭圆关节（译词待核） | 两主要轴；F19 |
| saddle | Saddle joint / 鞍状关节 | 两面凹凸互补；F20 |
| plane | Plane joint / 平面关节（译词待核） | 小幅滑动；F21 |
| lever | Lever / 杠杆（术语对应待核） | 绕支点的刚性构件；F27,F28 |
| moment-arm | Moment arm / 力臂（术语对应待核） | 支点至力作用线的垂直距离；F27 |
| growth-plate | Growth plate / 生长板 | 幼骨长度增长区域；F29 |
| remodelling | Remodelling / 重塑 | 旧骨组织去除、新骨形成；F31 |

日常中文“骨头”“膝盖”可用于正文但不代替精确选中名；详细骨名沿名词委，六型儿童叫法需最后术语核对。没有核实SG的词不填sg_attested:true。体内左右沿自身左右；不能用屏幕左右给桡尺骨定名。[R01]

## 6. 来源与事实纪律

所有表中经验性内容都通过parent facts.json或facts-extra.json，以下S#是研究阶段id；运行schema不接受前导零，sources.json采用S01→S1、S02→S2直至S09→S9的稳定数值映射，其余S10–S33不变。原创设计研究另建 `S34`（design:true），准确描述D01公式/假设和排版坐标；不能把S16大学教材当某个儿童前臂的实测数据。来源编号查表，不自动向旧muscles来源目录写入。[D01,R01]

| id | source / locator | 用途 / fact ids |
|---|---|---|
| S01 | [Science Teaching & Learning Syllabus, Primary Three to Six (2023 cohort; updated Jan 2026)](https://www.moe.gov.sg/-/media/files/primary/syllabus/2023-primary-science.ashx) · Printed p.53; PDF page 54. Existing local PDF independently extracted with pdftotext. Live endpoint shows robot verification. | C01 |
| S02 | [Anatomy and Physiology 2e: 7.1 Divisions of the Skeletal System](https://openstax.org/books/anatomy-and-physiology-2e/pages/7-1-divisions-of-the-skeletal-system) · 7.1 Divisions of the Skeletal System | F01, F02 |
| S03 | [Anatomy and Physiology 2e: 6.2 Bone Classification](https://openstax.org/books/anatomy-and-physiology-2e/pages/6-2-bone-classification) · 6.2 Bone Classification | F09, F38 |
| S04 | [Anatomy and Physiology 2e: 6.3 Bone Structure](https://openstax.org/books/anatomy-and-physiology-2e/pages/6-3-bone-structure) · 6.3 Bone Structure | F03, F05, F06, F07, F08 |
| S05 | [Anatomy and Physiology 2e: 6.4 Bone Formation and Development](https://openstax.org/books/anatomy-and-physiology-2e/pages/6-4-bone-formation-and-development) · 6.4 Bone Formation and Development | F30, F31 |
| S06 | [Anatomy and Physiology 2e: 6.5 Fractures: Bone Repair](https://openstax.org/books/anatomy-and-physiology-2e/pages/6-5-fractures-bone-repair) · 6.5 Fractures: Bone Repair | F32 |
| S07 | [Anatomy and Physiology 2e: 6.6 Exercise, Nutrition, Hormones, and Bone Tissue](https://openstax.org/books/anatomy-and-physiology-2e/pages/6-6-exercise-nutrition-hormones-and-bone-tissue) · 6.6 Exercise, Nutrition, Hormones, and Bone Tissue | F33 |
| S08 | [Anatomy and Physiology 2e: 7.4 The Thoracic Cage](https://openstax.org/books/anatomy-and-physiology-2e/pages/7-4-the-thoracic-cage) · 7.4 The Thoracic Cage | F10 |
| S09 | [Anatomy and Physiology 2e: 8.2 Bones of the Upper Limb](https://openstax.org/books/anatomy-and-physiology-2e/pages/8-2-bones-of-the-upper-limb) · 8.2 Bones of the Upper Limb | F11 |
| S10 | [Anatomy and Physiology 2e: 9.1 Classification of Joints](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-1-classification-of-joints) · 9.1 Classification of Joints | F12 |
| S11 | [Anatomy and Physiology 2e: 9.4 Synovial Joints](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-4-synovial-joints) · 9.4 Synovial Joints | F13, F14, F15, F16, F17, F18, F19, F20, F21 |
| S12 | [Anatomy and Physiology 2e: 9.6 Anatomy of Selected Synovial Joints](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints) · 9.6 Anatomy of Selected Synovial Joints | F22, F23 |
| S13 | [Anatomy and Physiology 2e: 11.1 Skeletal Muscle Interactions and Lever Systems](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-1-interactions-of-skeletal-muscles-their-fascicle-arrangement-and-their-lever-systems) · 11.1 Skeletal Muscle Interactions and Lever Systems | F24, F25 |
| S14 | [Anatomy and Physiology 2e: 11.5 Muscles of the Pectoral Girdle and Upper Limbs](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs) · 11.5 Muscles of the Pectoral Girdle and Upper Limbs | X01；F26止点改用S32/S33 |
| S15 | [Anatomy and Physiology 2e: Preface: current content licence](https://openstax.org/books/anatomy-and-physiology-2e/pages/preface) · Preface: current content licence | L02 |
| S16 | [College Physics 2e, 9.2 The Second Condition for Equilibrium](https://openstax.org/books/college-physics-2e/pages/9-2-the-second-condition-for-equilibrium) · Torque; perpendicular lever arm | F27, D01 |
| S17 | [College Physics 2e, 9.6 Forces and Torques in Muscles and Joints](https://openstax.org/books/college-physics-2e/pages/9-6-forces-and-torques-in-muscles-and-joints) · Forearm equilibrium; mechanical disadvantage | F28 |
| S18 | [Health Lesson: Learning About Bones](https://www.niams.nih.gov/health-topics/educational-resources/health-lesson-learning-about-bones) · For Students: What are bones?; food and activity sections | F04 |
| S19 | [Growth Plate Injuries](https://www.niams.nih.gov/health-topics/growth-plate-injuries) · Overview; symptoms and treatment links | F29, F37, D02 |
| S20 | [Getting Fit Through Fun for kids](https://www.healthhub.sg/well-being-and-lifestyle/exercise-and-fitness/fitnessfunforkids) · Children above six; activities to strengthen muscles and bones | F36 |
| S21 | [Daily Calcium Intake — For Greater Bone Strength](https://www.healthhub.sg/well-being-and-lifestyle/food-diet-and-nutrition/calcium-for-greater-bone-strength) · Calcium foods; Vitamin D and Calcium Absorption | F34, F35 |
| S22 | [Children’s understanding of their internal body parts (1996)](https://pubmed.ncbi.nlm.nih.gov/8788391/) · Abstract; ages 4.5–8.5; DOI 10.12968/bjon.1996.5.7.423 | M01 |
| S23 | [Children’s ideas about the human body: A Nordic case study (2011)](https://www.ucviden.dk/files/124240391/Children_human_body_NorDina7_2_2011.pdf) · Table 1, printed p.182: skeletal drawing scale; results/discussion | M02 |
| S24 | [MUSCLS: structural-functional correlations of the locomotor system](https://www.tandfonline.com/doi/abs/10.1080/00219266.2024.2351380) · Theoretical background; operationalisation; samples (10–14 years); DOI 10.1080/00219266.2024.2351380 | M03 |
| S25 | [Z-Anatomy source and content-specific licence](https://github.com/LluisV/Z-Anatomy) · Repository plus existing scripts/anatomy/cache/License.txt; content licence is distinct from application code | L01 |
| S26 | [BodyParts3D Licence](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html) · License, updated 2025-02-27 | L03 |
| S27 | [骨骼；关节；小知识：骨骼](https://www.msdmanuals.cn/home/bone-joint-and-muscle-disorders/biology-of-the-musculoskeletal-system/bones) · 骨骼 (Jan 2025); joints sibling page (Jan 2025); quick-facts bones (Feb 2026) | 术语 / 许可 / 参考 |
| S28 | [人体解剖学名词（第二版，2013）](https://xtjp.fudan.edu.cn/Upload/Files/201804100314393640155.pdf) · Chapter 02; 02.0015–0024; 02.0576; 02.0606; 02.0624; 02.0769; 02.1028; 02.1031; English/Chinese indexes | 术语 / 许可 / 参考 |
| S29 | [骨质疏松症 (2025 Chinese brochure)](https://www.ntfgh.com.sg/docs/ntfghlibraries/brochures-document/osteoporosis-chinese_2025.pdf?sfvrsn=75cef9c4_1) · PDF pp.3–6: bone health and vocabulary; adults, not paediatric dosage | 术语 / 许可 / 参考 |
| S30 | [Atlas six-region anatomy pipeline and published topic data](scripts/anatomy/README.md) · Selection, frames and rigs; arms/rig.json; cache/inventory.json; muscles-*/topic.yaml | R01, R02, R03 |
| S31 | [Physiology, Bone](https://www.ncbi.nlm.nih.gov/sites/books/NBK441968/) · Introduction; last update 2024-09-10 | 术语 / 许可 / 参考 |

| S32 | [Biceps Tendon Tear at the Elbow](https://www.orthoinfo.org/diseases--conditions/biceps-tendon-tear-at-the-elbow) · Anatomy of the Elbow: distal biceps tendon attaches to radial tuberosity | F26，精确止点核对；无临床治疗内容 |
| S33 | [Triceps Tendon Tear at the Elbow](https://www.orthoinfo.org/diseases--conditions/triceps-tendon-tear-at-the-elbow/) · Anatomy: triceps tendon attaches to olecranon of ulna | F26，精确止点核对；无临床治疗内容 |

X01–X03定位见facts-extra.json，继承S14/S30来源元信息。F26最终改用S32/S33，S14不再声称其可见文本已包含止点表。

来源日期2026-10-27；S01在线验证受阻、S23/S24直接读取有局限，按parent限制继承。所有quotes≤25词/来源，短引文只在parent出现，规格稿不重抄。S28只用术语名，不复制词典定义。中文与医院资料是参考，不是获准重用的插图。每个Num数值、肌腱止点与模型来源都要在data/SOURCES索引能查到。

## 7. 插图与重绘校验

| file | kind / 用途 | subject / factual checks | 许可 |
|---|---|---|---|
| `bones-and-joints.png` | 1024² cover；04髋球窝主视觉 | 单块成人髋骨+单个股骨近端、一个髋臼/闭孔、圆头与骨颈/大转子；示范拆开少许以看清，非完整骨盆 | 独立imagegen原创，BY-NC-SA |
| `bones-and-joints-living-bone.png` | 1536×1152 figure；02活骨内部 | 一根通用成人长骨，纵向开窗、密实壁、硬网架、填髓腔、血管；无开放生长板，无微观比例或特定股骨断言 | 独立imagegen原创，BY-NC-SA |
| `bones-and-joints-protected-organs.png` | 1536×1152 figure；02保护对象 | 用户要求重绘：一心两肺位于12对肋骨与胸骨内、胸椎在后；比例正常、11/12浮肋；生成后逐对检查并记录局限 | 独立imagegen重绘，BY-NC-SA；保留参考及prompt与检查记录 |

风格完全遵循BRIEF2：细石墨、19世纪科学图版、交叉排线/点描、严格中性灰、无纸/底/框/文字/箭头/地影，透明PNG。检查清单、实际tries、复用路径、sha256、尺寸和灰度/alpha数值在manifest.jsonl与art QA文件。生成不是解剖临床认证；能确证的宏观结构逐项记，未表现的细节不写成验证通过。无关恐龙骨架和尺子不复用。[F05–F08,F18,R01]


原始planned目录只读。重绘结果存本worktree `art/planned/bones-and-joints/`，记录生成原图路径、prompt、tries、目检与hash，再走`scripts/illustrate.ts figure`输出。封面与长骨图直接由main只读原图process。不得把生成成功当作肋数准确的证据。
## 8. 施工与验收


topic.note定稿：EN “Adult male reference anatomy · Z-Anatomy / BodyParts3D meshes, CC BY-SA 4.0 · Teaching sections and lever model are schematic.” ZH “成人男性参考解剖 · Z-Anatomy / BodyParts3D网格，CC BY-SA 4.0 · 教学截面与杠杆为示意。”[R01,L01]
规格行≤4：MODEL adult reference / 成人参考，DESIGN；BONES conventional adult206 / 成人常规206，TYPICAL；JOINT TYPES6 synovial / 六种滑膜型，TYPICAL；LEVER ideal static / 理想静力，SIM。[F01,F15,D01] 不在全局规格行写身高作为目标身体。

全局底部只有章/拍轴，点击直接跳拍、不自动播；`,`/`.`与触控等价。左PLATE放状态/结构/本章SIM读数；选中详情在右阅读章头下；阅读顺序章头→节拍行→详情→正文→索引。独立关节近景不改变读者自己的身体活动建议。paper与cinema同语义token，力箭头必须配名称，不能只靠颜色。[docs/08]

| 组合 | 本主题行为 |
|---|---|
| X-RAY+关节近景 | 囊半透明，骨/软骨可选，文字说明透明是教学观察方式 |
| CUTAWAY+活骨 | 只显示预制截面里真实定义的内部，不凭切面自动制造骨髓 |
| EXPLODED+动作 | 动作时回0；全身不裂开跑动 |
| hide+index | 本章可讲的隐藏part仍可从索引打开解释；不能点不存在的id |
| reduced-motion | 所有pose/sequence可立即到指定结果；无闪烁或必须跟踪运动 |
| URL | ch、b、part、view、layers、pose和sim遵现有编码；decode非法值走既有默认，不注入任意角度 |


### 8.1 门槛与交付

按BRIEF-BUILD顺序：先定稿本spec；仅E-BJ2引擎；再内容。交付8章40拍、61可选语义件+皮肤context、20terms、3图（封面+2figures）、sources/SOURCES、REVIEW/AUDIT、内容单测与e2e。published按用户指定；smoke counts相应增加，回链只指向main已存在主题。

pnpm check、validate、test、build必须运行并记录结果。浏览器shoot/e2e明确禁止在此sandbox运行，主会话用ATLAS_E2E_PORT=5445执行；原生Blender启动崩溃的未完成验收独立列明。不得把这些未跑项标绿。无git写入，无package/lock/review-queue/next-batch改动。

### 8.2 Gavin后审默认

六型及20术语、牛顿读数放PLATE/细看、成人源比例与自身左右、保守DESIGN动作幅度、关节轴/肌腱止点具名人审、重绘胸廓肋数与比例、手机/双主题视觉和性能均列REVIEW。生长/修复不预测日期；姿态不作为学生的活动范围或力量目标。

## 9. 施工记录（实施后填写）

### 9.1 E-BJ2 引擎与复用记录（2026-10-27）

- main的forces先核：`lib/sim/force.ts`仅push/fall/slide/roll/spring/brake；制动的τ=hub+2μNr不构成通用肘杠杆解。复用force-vectors、rotate、TryIt；lever改现有table，24行由内容离线生成，无新sim kind。`muscles-arms`的`elbow-flexed/elbow-extended/palm-up/palm-down`和19关节父链支持rig动作；旧sim pose仍仅控制parts，因此新增一个joint target。
- 已执行规定的五条`git log --oneline main..codex/<branch>`，并以`git show`读证相关schema/实现：monsoon-engine气候、sem-engine公转/自转、airfoil-content翼型、plates地理参考层均无可替代的数字关节绑定；dinosaur的main..branch为空。sem/airfoil/dinosaur的bind.ts仍仅有part/flow/animation目标；未引入分支依赖。
- schema采用§4的`when:{control:"mode",is:{eq:"lever"}}`；`rig.joints`是对象，直接查axes，不加rig角度边界字段。数字override在MotionDriver进入既有骨架变换前按movement合成；左右不自动复制，NaN/无穷/越界或guard关闭恢复章pose，普通变化0.5秒、初载/instant/reduced-motion跳到终态。保留既有part pose行为。
- `sample-joint`为draft引擎夹具：复用已存在的muscles-arms GLB和rig，四类手臂骨双侧，baseline左肘30°/右肘25°/左旋前20°，24行table标SIM与原创S1设计研究；`named-ninety`用于同态对照。夹具parts/rig为BY-SA，未新增或改写源GLB。docs/06已给可运行绑定例与QA `joint(name)`；MotionDriver在rig替换/卸载的layout cleanup清空joint读数，避免旧骨架残留。
- 独立门槛：`pnpm test -- tests/space-scene/joint-binding.test.ts` 18/18通过（含后补fixture索引与joint clip冲突）；相关回归`joint-binding + muscles + table + hz-binding + steam-bindings`初次共148/148通过。覆盖24组数值、NaN/guard/恢复、左右隔离、保留其它movement、父链末端与命名pose误差≤1e-6、duplicate/unknownjoint/unknownaxis/state/range/guard/exercise冲突拒绝。完整check/validate/test/build由主代理统一执行。
- `tests-e2e/sample-joint.spec.ts`已声明deep-link/手动同态、真实hand末端、换章恢复、reduced-motion与中文门槛；本sandbox按brief禁止运行浏览器，未运行e2e或shoot、未声称浏览器验收通过。主会话端口5445。

### 9.2 内容、数据、插图与离线几何（2026-10-27）

- `bones-and-joints`按用户指定`status: published`；背景+7章、40拍，EN正文223–252词/ZH350–383汉字，每语言每章2–3块细看；20名词、34来源、2张章节图+1张双密度封面。S01–S09只移除前导零，运行编号S1–S34保留数值映射。六型中文核查边界留REVIEW/AUDIT，产品词条采用已选的编辑名称与功能释义。
- 61可选语义件+1皮肤context；34全身骨区域、7真实左手细部骨、2真实肌肉、18原创教学件。6组（骨截面/力层不进链路卡，4列）、6镜头预设、8命名姿态；没有流、没有循环clips。04改为逐拍命名终点姿态，避免共享rig片段同时驱动同一关节。教学肌腱不冒充独立扫描结构；精确止点事实与模型候选骨面人审区分。
- 保留既有table：24行、9数输出（6力学量及distance/tip-x/tip-y布局量）；四个PLATE跟随量为load/load-arm/muscle-force/angle，并由本章observe限定。最后集成复核补齐了最初遗漏的telemetry；新增内容单测检查读数连线，离线生成器同步。角度绑定只覆盖elbow.l；探索/其它章无覆盖。梁在x=4，与成人手臂分工位；正文提供ELBOW镜头链接作数值角度对照。
- GLB：3,024,092 bytes、313,580 triangles、44 mesh nodes、49材质primitive、19关节；SHA `4ddb706ff0664f772e294d6210294258556775a3037cf7c3a3ed51fead6f362e`。骨架源236项双向采样误差最大0.945331684 mm；压缩后bbox最大附加差0.002653061 mm；未放宽1 mm/4MB/350k门槛。失败的两侧顶骨及第四肋软骨恢复源几何；保留每侧First–Twelfth十二肋+十块软骨。源肌肉的逐mesh量化先解码到bind world再合并，避免共用错误inverse bind矩阵；蒙皮/纤维/关节链沿用源数据。
- Blender启动139，改走主题内Three FBXLoader+独立二进制FBX控制点审计与glTF压缩输出检查。不是原生Blender验收。正/背/左/肘姿态CPU source/reduced对比均已目检并归档`scripts/anatomy/cache/bones-joints/previews/`（本地，不进git），详见report/preview-review；不把骨刚性投影当真实肌肉形变或浏览器画面检查。所有附着/局部关节轴仍为pending人审。
- 保护器官图用built-in image_gen经3次编辑重绘：12对肋骨、胸骨、后方脊柱、心肺位于胸廓内；第二次修正下方肋弓/浮肋，第三次清除两片孤立残片。最终原图与WebP逐对目检；临床准确性未获具名认证。prompt、hash、检查局限见主题`FIGURES.md`。两张既有approved图逐张检查后沿用。输出封面80,164/240,250 bytes，活骨图98,398 bytes，保护图118,178 bytes，均在illustrate预算内。
- LICENSE-CONTENT/THIRD-PARTY-NOTICES明确整个parts/GLB/源派生rig/sites/预览/截图为BY-SA；独立图与OpenStax教学正文/名词表为NC-SA，互不烘入同一派生文件。另登记sample-joint的BY-SA parts。9个已出版相邻主题只增加双语回链句；smoke预期35主题、13biology、70badges、末版35。

### 9.3 最终非浏览器门槛与交接

| 门槛 | 实际结果 |
|---|---|
| `pnpm check` | exit0；773文件，0errors/0warnings/3既有unused提示；修正新geometry单测的station索引非空类型后重跑通过。 |
| `pnpm validate` | 59topics，0errors/0warnings；插画记录移到主题根`FIGURES.md`，不放data目录。最终build再次校验同结果。 |
| `pnpm test -- --maxWorkers=2 --testTimeout=30000` | 163files、4306tests全过。默认并发/5秒门槛下既有energy全组合枚举超时，单独同门槛仍超时；不改源测试或断言，限制workers并给30秒后该项约7.37秒完成，完整套件通过。 |
| 最后telemetry集成的focused单测 | `pnpm test -- tests/space-scene/bones-and-joints-topic.test.ts` 7/7；全套通过后新增一条PLATE连线断言并补数据，覆盖最终状态。新增测试共18engine+5geometry+7content=30，去重复共有4307个不同测试断言用例获通过记录。 |
| `pnpm build` | 最终exit0；121静态页面。静态输出复核两语言目录各35卡，均链接本主题；data输出62parts/4telemetry/24leverrows/34sources/20terms；两语言island props均观察load/load-arm/muscle-force/angle。 |
| `git diff --check` | 通过；无git写入、无package/lockfile/review-queue/next-batch改动。 |
| shoot / e2e | 按brief禁止在sandbox运行，全部未跑；没有控制用户浏览器/桌面。 |
| native / human anatomy / runtime perf | Blender启动139；原生、人审与实际浏览器材质/变形/标签/手机/性能均未标通过。CPU源比较、离线mesh预算与数值审计不替代这些门槛。 |

主会话：先`pnpm build`，再`pnpm shoot bones-and-joints --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`，并检查390×844、每章标签、模式组合及runtimecalls。引擎fixture用`pnpm shoot sample-joint --beats --keys --layout`，回归forces/muscles-arms；最后`CI=1 ATLAS_E2E_PORT=5445 pnpm e2e`。两个新增e2e文件及smoke预期已落地。Gavin后审清单见主题REVIEW：六型/中文名称、牛顿读数位置、成人左右/比例、肌腱止点和轴的人审、重绘图逐对肋数/比例、双主题与手机视觉及性能。

### 9.4 浏览器验收（Claude，2026-10-27）

- **看了什么**：`--beats --keys`（en-paper 1920×1080，40拍全部逐张看，40/40拍链接与演示一致，键位全OK）；章节+模式镜头四组合（en/zh × paper/cinema，--gpu）；`--layout` en/zh 八个尺寸含1024×768、390×844，0 layout issues；另用深链在1600×900逐章核对标签、读数与关节。全负载机器上非GPU的`--layout`/逐拍zh、cinema两次截图超时，改用--gpu重跑；zh/cinema逐拍未跑，以章节镜头代替。
- **性能**（`--perf --gpu`，Apple M5 Max / ANGLE Metal，缓冲1520×1023）：全身视图37 calls、288,055 tris；各章5–37 calls、3k–288k tris；稳定后59–63 fps（前三章预热期18–46 fps，机器负载≈200）。GLB 3,024,092 B / 313,580 tris，低于软目标4 MB / 350k；只由本主题页按需加载，不进PWA预缓存。首屏JS 521.8 KB gz / 12文件，为共享引擎包（steam-engine合并时记500.3 KB），非本主题新增。无需减面或拆分加载。
- **解剖/数值**：源清单两侧各12条命名肋+肋软骨，胸骨三段，桡尺、胫腓、髌骨独立，颅骨27件、手27件、足26骨+籽骨；杠杆字幕与表一致（L=.30、θ=90 → 150 N；θ=30 → 垂直力臂.15 m → 75 N），θ为前臂自竖直向下转角，与左肘flexion同值；04六型每拍单一示例关节、姿态与字幕相符；二头肌→桡骨、三头肌→尺骨鹰嘴。
- **本轮修正**：力箭头因`per`=0.001被缩成发丝（引擎新增可选`width`，主题用0.06，负载箭头改`at: bottom`）；首次载入/深链时标签不出现（PartNode可见性翻转时多请求一帧）；01-05、04-01/03/04/05镜头按实际标本包围盒重取景；CPU预览PNG移出git。
- **未通过、交回Codex**（`src/content/topics/bones-and-joints/FIXES.md`）：F1 保护器官图实为每侧14条肋（7真肋+4假肋+3浮肋），须重绘为12对；F2 61件零件详情是审查口吻，需改写为学生文字；F3 骨截面、通用滑膜关节、四个修复标本的原创几何不达技术图版标准，关节软骨画成悬空圆片、红骨髓缺失；F4 杠杆工位无支点与0.04 m附着标记。
- **另记**：深链上仅肘屈的姿态时，蒙皮零件标签锚点停在静息位（04-02、05-02/03的尺骨），main上muscles-arms同样存在，属引擎既有问题。
