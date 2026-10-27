# 眼睛与耳朵 · 内容施工 spec（定稿，2026-10-27）

SpaceScene / Model3DStage，paper 默认，cinema 可切。对象是人的眼球与单侧耳部解剖模型，配无声的试一试。**施工合同；按本次授权完成定稿、引擎与内容，最终 status: published。** 事实来自本轮刚完成的父 dossier：`eyes-and-ears-research.md`、`facts.json`、`datasets.json`。没有 sibling，按用户指示省略拆分说明。不是已有兄弟主题的复制稿。

## 0. 决策记录（默认方案，供 Gavin 审阅）

| # | 决定与默认 | 依据 / 状态 |
|---|---|---|
| D1 | **一个主题、两座工位**：眼睛 01–03，耳朵 04–06，共用 00 输入与信号、07 保护。默认不拆成两个 slug；未来若分别增加临床/神经内容才另立题。 | 编辑决定；E04–E05、H06–H07 提供共同主线。 |
| D2 | 题名 Eyes and Ears / 眼睛与耳朵；`subject: biology`、`tags: [beyond-syllabus]`，`engine: space-scene`、`mode: space`。适合 P2 共读至 P6 延伸，年级只作规划元数据。 | C01–C02；`docs/17` §5 的课外方向。 |
| D3 | 导读章 + **7 章，40 拍**（导读为普通 SpaceScene 章，不使用 TimeScene background 状态），每章 5 拍。不是 PSLE 新增必考范围；默认无测验、无评分。 | 编辑决定；C01。 |
| D4 | 主线必须清楚：瞳孔是洞、角膜也折光、视网膜接收、神经传信号；鼓膜后恰好三骨，机械运动在耳蜗转成信号。 | E01–E08、H01–H07。 |
| D5 | 试一试 T1 孔径；T2 近远与聚焦；T3 频率与振幅。均先猜后看、可记表。只在各自章节放一张卡；静音，不请求麦克风。 | SIM01–SIM04；M01–M04；编辑交互决定。 |
| D6 | 眼睛与耳朵分组显示，不让人误会两个放大器官在身体里并排悬空。眼球剖面、耳部纵切、毛细胞放大窗分别注明示意比例。 | E08、E10、H03–H10；布局为 DESIGN。 |
| D7 | 采用原创程序化剖面示意；源网格未确认关键结构覆盖，不引入整套第三方解剖资产。 | D01–D02；已核缓存只有骨/局部耳廓，缺完整眼与耳蜗，见reference-audit。 |
| D8 | **不合并 BY-SA 与 BY-NC-SA 派生几何/图像**。新 art 是独立原创 NC-SA；若用了 Z-Anatomy，GLB、追踪的几何坐标和渲染保持 BY-SA。 | 用户许可规则；D02、D05、D15。 |
| D9 | 一个新 sim kind `senses` + 两个新 overlay；复用控制、预测、表、图、URL、姿态、可见性、动画 Hz。既有 `light` 无折射；`table` 不算连续几何。 | 实查 `lib/sim/light.ts`、`index.ts`、`bind.ts`，见 §4。 |
| D10 | 护理用当地医院/HPB现行页面；休息间隔有差异，主文写“经常休息、看远处”。不把户外活动说成治愈，不做儿童听力/视力筛查。 | P01–P09。 |
| D11 | 不需要地图、历史时间线或真实地理数据；B 项不适用，0 数据集、0 bytes。 | 编辑范围决定；`prefetch-not-required.md`。 |
| D12 | 三张全新 graphite 图版；旧 shadow/material、heart/lung 图不能表达本题结构，复用 0。图像检查与生成次数见 manifest。 | D14–D15；§7。 |

### 0.1 给 Gavin 的代定项（不阻塞本次施工）

1. **合题/拆题**：默认一个主题。若拆，保留本题总览，眼 01–03 与耳 04–06 再独立；本稿不预建两个空壳。
2. **真实网格还是示意**：默认采用清楚标示的原创程序化示意，BP3D/Z-Anatomy 没有确认本题关键结构的完整覆盖，不引入第三方 GLB。
3. **护理数字**：默认主文写经常休息、看远处、户外活动；HPB 户外时间及不同休息间隔只放有具名来源的细看。P01–P04。
4. **词汇**：5 个编辑术语未核本地/原文用法（研究词表）；默认保留标记进入后续术语核查，不宣称 MOE 正式中文词。

## 1. 课纲对照、主题与范围

### 1.1 课纲锚点

P4 Light 的看见光源/反射光（C01；S01 印 p.75/PDF p.76）与收集感官数据（C02；印 p.16/PDF p.17）是接口。逐字摘录及 19 词总额核查放在父 dossier，不重复引用。眼内成像、听小骨、耳蜗转导、护耳不是本 Science PDF 的具名核心学习结果；不贴“PSLE 必考”。2020 SS 官方文件触发验证，未读取全文，不造页码。PE路线仅为路线图线索，本稿不新增未经核实的 PE 年级声称。

### 1.2 主线 / 细看 / 边界

| 内容 | 主线 | 细看 / 限制 | 事实 |
|---|---|---|---|
| 光进入眼睛，角膜、瞳孔、晶状体、视网膜、视神经 | 01–02 | 两个折光部件合成有效薄透镜只用于示意计算 | E01–E08、SIM01 |
| 看近看远、模糊 | 03 | 睫状肌与悬韧带名字可读；不作真实儿童验光 | E06、E11–E13 |
| 视杆/视锥 | 02 细看 | 不画细胞密度分布或编总数 | E09 |
| 三听小骨与卵圆窗 | 04 | 鼓膜称耳道/中耳边界；不考不同教材分类 | H01–H04 |
| 耳蜗、毛细胞、神经 | 05 | 基底膜与纤毛放大，不造增益/毛细胞数 | H05–H08 |
| 频率、振幅、局部粒子运动 | 06 | 基底高/顶端低只定性，不算个人听阈 | H08、H11–H12 |
| 护理 | 07 | 成人 WHO 参考值不变成儿童挑战；静音可学完 | P01–P09 |
| 平衡、咽鼓管 | 对象详情 | 只定位与辨别功能，不建平衡/压力实验 | H09–H10 |

### 1.3 相邻主题链接（本次施工实现）

| 本章 | 目标 | 状态与用途 |
|---|---|---|
| 00、02 | `light-and-shadows` / `seeing-light` | published；光源→物体→眼的前半段。C01、E01；不重做影子距离课。 |
| 00 | `digestive-system` / `five-systems` | published；人体系统回顾。只作关联，不将感官塞进原五系统名单。 |
| 07 细看 | `heart-and-lungs` / `three-systems` | published；组织与系统协作。 |
| 光与影 `seeing-light` | 本题 `an-image-on-the-retina` | 增补一句反向关联，不展开旧主题内容。 |
| 06 结尾 | `sound` | **当前不存在**。文字写“声音的传播可另作专题”；无 TopicLink、无死链。 |

### 1.4 事实纪律

`TYPICAL` 仅给来源明确的常识/建议；本稿不提供人眼直径、真实焦距、听骨增益或真实耳蜗调谐数。`DESIGN` 是坐标/表现大小，`SIM` 是选定模型参数及其计算结果（SIM01–SIM04）。每拍的事实标记见 §5；引擎字段和编辑选择是设计规范，不伪装为外部事实。

| 模型项 | 设计值 | 解释 / 事实 |
|---|---|---|
| 有效薄透镜到接收面的距离 r | 4 model cm，固定 | 不是人眼生物测量；SIM03。 |
| 物距 u | far=40 / near=12 model cm | 有限点物，皆 u>f；SIM01、SIM03。 |
| 有效焦距 f | far=40/11 / near=3 model cm | 含角膜与晶状体的合成模型，非单独晶状体真实焦距；E03、SIM03。 |
| 孔直径 d | 2 / 4 mm（孔径教学值） | 只考面积相对量，不拟合真实瞳孔反射；SIM02。 |
| 示例频率 | 250 / 500 Hz，**无声** | 是设定输入值，非测量儿童能听的范围；SIM04。 |
| 显示慢放 | f/250 = 1 / 2 Hz | 固定 250 倍慢放，控制变化不改变慢放倍率；SIM04。 |
| 振幅 | 1 / 2（相对），位移上限 .035 / .07 scene unit（2026-10-27 F3 由 .0125 / .025 提高，见 §9.5） | 示意粒子位移，不换算耳膜/听骨位移或 dB；H11–H12。 |

## 2. 分区与模型数据计划

### 2.1 分区（5个零件组 + 1个仅信号流组）

| 号 | group id | EN / ZH | 内容与 token | 事实 |
|---|---|---|---|---|
| 01 | `eye-front` | Eye entrance / 眼前部 | cornea、iris、lens、ciliary-ring；`token:ink-2` | E01–E03、E13 |
| 02 | `eye-receiver` | Retina and nerve / 视网膜与神经 | sclera-shell、vitreous、retina、optic-nerve；`token:ink-2` | E04–E05、E08–E10 |
| 03 | `ear-transfer` | Eardrum and bones / 鼓膜与听骨 | pinna、canal、eardrum、malleus、incus、stapes、oval-window、eustachian-tube；`token:ink-2` | H01–H04、H09 |
| 04 | `ear-receiver` | Cochlea and nerve / 耳蜗与神经 | cochlea-shell、basilar-strip、hair-patch、auditory-nerve、balance-context；`token:ink-2` | H05–H10 |
| 05 | `study-bench` | Model studies / 示意实验 | object-top、object-bottom、retinal-screen、signal-marker、wave-reference；`token:signal` 只选中，光用 `token:en-light`，信号用 `token:en-electrical`，介质用 `token:air` | SIM01–SIM04；布局 DESIGN |

另有仅含流的 `nerve-signals` / Nerve signals / 神经信号组，不计入零件链路列；复用现有 layers 开关，让05章前3拍的机械运动与后2拍信号传递分开。`signal-marker`归入ear-receiver，仅05后2拍显示，避免打开study-bench误显纵波。颜色旁有名称；不把神经信号表示成实际金属电线里的电流。组别色与能量色只用于对应语义。眼与耳都不画血腥组织；真实剖切层次照实。

### 2.2 坐标、尺度与显示工位（全部 DESIGN）

Y向上，+Z朝观者；不声称单位米。眼工位中心 `[-2,0,0]`，包络约 `[-3.2,-.9,-.9]..[-.8,1,.9]`；耳工位中心 `[2,0,0]`，包络 `[.3,-1,-.6]..[3.8,1.2,.6]`。**只有00/07同时显示两个工位**；眼章隐藏耳，耳章隐藏眼。术语/pick targets 至少44 CSS px。

眼参考轴前→后为局部 +X：角膜前极 x=-1，iris≈-.65，lens≈-.45，后壁≈1，optic-nerve x>1。眼壳并非空球：玻璃体单独透明填充，网格中不把膜当实体球。耳外→内局部 +X，eardrum≈-.5，malleus≈-.35，incus≈-.05，stapes≈.25，oval-window≈.42；耳蜗在内侧，咽鼓管向前下方。**这些是布局起点，不是解剖测量**；R2对照 S02、S07、S24–S26调整（E08、H03–H10）。

毛细胞放大工位 `[3.15,-1.3,.35]`（F3/F4 修订：原 `[2,-.2,1.6]` 挡在中耳前，移到耳蜗右下方，HUD 画虚线边框 `views.insets`，见 §9.5），独立边界说明“放大示意，非同一比例 / Enlarged schematic, different scale”。不写 magnification 数值，不画伪造毫米尺。光学模型另一工位局部 `origin:[-1,-2.4,1.3], cmToScene:.06, yScale:20`（F1 修订：原 origin y −1.5、无竖向放大；高度竖向放大×20 并在舞台/PLATE/详情/spec 行写明，见 §9.5），x从-u到6；与眼球剖面之间保留间距，并写“角膜与晶状体合成一个有效透镜 / Cornea and lens combined in one effective lens”。

### 2.3 零件清单（26个可选中 part；pupil 是 iris 中的洞，不另做实心零件）

| id · EN / ZH | 几何/材质计划 | 连接/动画/剖切 | 事实 |
|---|---|---|---|
| `cornea` · Cornea / 角膜 | 原创曲面或已核BP3D透明前穹顶 | iris前；透明但可选中；切面可关闭 | E01、E08 |
| `iris` · Iris / 虹膜 | 固定外径的可选中外缘，两个 context 环片分别提供小/大通孔 | 不能用黑圆盘堵洞；`iris-aperture-small/large` 两个 context 变体，复用 visible binding | E02 |
| `lens` · Lens / 晶状体 | 双凸有机形面；`lens-far/near` | iris后，睫状环内；厚度只示意变化 | E06、E08、E13 |
| `ciliary-ring` · Ciliary ring / 睫状环 | 简化环/放射悬丝（细看） | 只在03显示；不宣称悬丝数量 | E13 |
| `sclera-shell` · Sclera / 巩膜 | 外壳/真实网格优先，shell=true | xray 只降低外壳；cutaway保后壁 | E08 |
| `vitreous` · Vitreous / 玻璃体 | 透明有体积填充，低不透明 | 不当空气；不遮挡retina | E10 |
| `retina` · Retina / 视网膜 | 壳内侧薄面，避免z-fighting | 标注锚在后壁；不可显示成另一颗球 | E04、E08 |
| `optic-nerve` · Optic nerve / 视神经 | 后方束状管 | `connects: [retina]`；信号路径到图外 | E05 |
| `pinna` · Pinna / 耳廓 | 核准mesh或原创extrude/lathe组合 | 耳道入口相接；不将耳廓当耳全部 | H01 |
| `canal` · Ear canal / 外耳道 | 中空弯曲tube | 终点止于鼓膜，非穿透到耳蜗 | H01 |
| `eardrum` · Eardrum / 鼓膜 | 斜放浅凹薄膜 | `drum-vibrate`可读振幅；不自转 | H01 |
| `malleus` · Malleus / 锤骨 | 真实已核骨mesh或原创轮廓 | 柄接鼓膜，头接incus；`malleus-rock` | H02–H03 |
| `incus` · Incus / 砧骨 | 同上，长/短突形态清楚 | 长突接stapes；`incus-rock` | H02–H03 |
| `stapes` · Stapes / 镫骨 | 同上，两个脚+一个底板 | 底板对卵圆窗；`stapes-piston`，非自转 | H02–H04 |
| `oval-window` · Oval window / 卵圆窗 | 界面薄膜 | stapes底板贴界面，不能悬空 | H04 |
| `eustachian-tube` · Eustachian tube / 咽鼓管 | 向前下的context tube | 不画成听觉信号路径 | H09 |
| `cochlea-shell` · Cochlea / 耳蜗 | 核准mesh或原创卷曲腔体 | 不声明精确圈数；cutaway露fluid区域 | H05 |
| `basilar-strip` · Basilar membrane / 基底膜 | 示意展开条，不冒称在原位 | `basilar-wave`可读动画；高低区定性 | H05、H08 |
| `hair-patch` · Hair-cell patch / 毛细胞局部 | 放大的少量细胞+纤毛束 | `bundle-bend`；显示数量不当总数 | H06 |
| `auditory-nerve` · Auditory nerve / 听神经 | 束状管到图外 | 神经只显示信号，不通过空气粒子 | H07 |
| `balance-context` · Balance organs / 平衡结构 | 半规管/前庭context，若源缺则文字 | 详情说明与听觉分别；不连为声音主路线 | H10 |
| `object-top` · Object top / 物体上部 | 较大点标，光学示意 | 接入ray helper，两种物距位置 | SIM01、SIM03 |
| `object-bottom` · Object bottom / 物体下部 | 较小点标，不对称易辨 | y=-.5 model cm，top y=1；DESIGN | SIM01 |
| `retinal-screen` · Model receiver / 模型接收面 | 独立平面线框 | x=r；不同于3D薄retina材质 | SIM03 |
| `signal-marker` · Signal / 信号 | ear-receiver组，小中性珠/路径起点 | 仅转导之后可见 | E04–E05、H06–H07 |
| `wave-reference` · Particle reference / 粒子参照 | 局部静止基线及高亮粒子 | 其余粒子由overlay实例绘制，不占parts | H11、SIM04 |

另有两个不计数、不可选中 context 环片 `iris-aperture-small/large`。二者外径相同，孔径恰好2倍；用已有 visible 绑定切换，不把整片虹膜等比放大。每个part `summary` 首句说明功能；`detail`写位置→作用→省略/放大。取名≤14英文字符是HUD目标，较长的 optic/auditory nerve 可短名+完整详情；不是偷偷修改术语。每章索引见§5，未提及细节不堆标注。

### 2.4 来源与许可分文件边界

| 产物 | 内容来源 | 许可族 |
|---|---|---|
| `parts.json`、captions、sources/glossary | 原创程序化示意、独立事实转述、独立方程实现 | Atlas CC BY-NC-SA 4.0；不追踪第三方图或网格 |
| 三张 PNG 的 WebP 输出 | 已审原创 imagegen；非外部网格渲染或图像派生 | Atlas CC BY-NC-SA 4.0 |

不引入 BP3D、Z-Anatomy、OpenStax 插图、WHO 原文件或数据库派生文件，无新增 THIRD-PARTY/许可证例外。参考图仅用来核对结构关系，留 gitignored refs，不进入站点。

## 3. 流、动画、HUD与镜头

### 3.1 流与动画

- 只有 **2 条信号流**（同属仅流图层 `nerve-signals`；optic按light-in、auditory按sound-active现有visible绑定区分工位）：`optic-signal` retina→optic-nerve图外；`auditory-signal` hair-patch→auditory-nerve图外。粒子是信号的示意标记，不是物质或光。用`token:en-electrical`并总有名称；不显示光在神经中继续前进。（E04–E05、H06–H07）
- 光用新的几何ray overlay，不复用守恒的流粒子；air dots只在新纵波overlay中局部往复。耳蜗液体表示局部起伏，不画入耳后持续排出水流。（H05、H11）
- `drum-vibrate`、`malleus-rock`、`incus-rock`、`stapes-piston` 一条Hz binding读`visual-hz`，固定示意位移，互相接触不脱节；不能宣称真实幅比、时延。04默认`frequency=250`，可读1Hz。（H03–H04、SIM04）
- `basilar-wave` 与 `bundle-bend` 用独立慢示意序列，只在05开启；“次序”靠节拍展示，非算出生物时延。（H05–H06）
- EXPLODED只供静止辨认三个骨；任何explosion>0时关闭波、信号与运动，防止断开的骨仍传振。章节起始归零，hide仍有效。

### 3.2 固定HUD与预算（设计约束）

底部仅core章节轴（章段/拍刻度，不自动播放）；左列PLATE放SIM读数与运行/透视状态；阅读面板章头→节拍行→试一试→选中详情→正文→本章索引。≥44px，支持触摸、键盘及读屏；reduce-motion显示确定静止样本、不闪烁。所有显示字符串`{en,zh}`，数值单位明确。没有外链CDN/视频/字体/外部API请求。

PLATE≤6行：`relative-light` ×；`focus-state`；`image-distance` model cm；`frequency` Hz；`amplitude` relative；`visual-hz` cycles/s。按本章observe显示，不把远处另一工位读数带进来。状态读数以SIM标记，不用“健康/不健康”或“通过/失败”。

设计预算：首屏JS≤300KB gz；模型glb目标≤4MB、硬上限8MB；全部模型≤350k三角，draw calls静止<80/运行<90、硬上限100。光线≤12段，一次draw；纵波41粒子一次instancing、参考基线一次draw。检测真实iPad，不用软件GPU fps替代硬件验收。

### 3.3 镜头预设（DESIGN起点，R2按包络调整）

| id | EN / ZH | position → target | FOV | 用途 |
|---|---|---|---|---|
| `overview` | OVERVIEW / 总览 | [0,2,9] → [0,0,0] | 30 | 00、07；两工位 |
| `eye` | EYE / 眼睛 | [-2,1.2,5] → [-2,0,0] | 28 | 01–02眼剖面 |
| `focus-bench` | FOCUS / 聚焦 | [-1,1,7] → [-1,-.8,.6] | 28 | 03有效透镜实验 |
| `ear` | EAR / 耳朵 | [2,1.2,5] → [2,0,0] | 28 | 04骨链 |
| `cochlea` | COCHLEA / 耳蜗 | [2,1,4] → [2,-.1,.7] | 26 | 05放大窗 |
| `wave` | VIBRATION / 振动 | [2,1,5] → [2,-.8,.8] | 28 | 06纵波模型 |

`views.cuts`定义`eye-cut`和`ear-cut`，初始normal=[0,0,-1]、offset=0，保留z≤0半边，移去朝观者一半；二者初始共面，但允许R2按各工位微调offset；保留后壁与所需三骨接触。REFERENCE用既有截面立面；X-RAY只透明外壳，不全体透明成一团。两套theme读同名token。

## 4. 最小新增引擎合同

### 4.0 现状核对与最小新增

已读 `sim-schema.ts`、`table-schema.ts`、`lib/sim/{index,light,bind,hz,table}.ts` 与docs/06 SpaceScene试一试段。现有kind是circuit、magnet、force、energy、life-cycle、matter、light、sort、materials、table、seeds。`light` 处理直线/阴影、透片、太阳，不含透镜折射。`table`每实验最多4 keys、64 rows，可作降级查表，不能自动提供计算ray geometry。现有`hz`频率夹在0..4，正好容纳1/2Hz。**不要再建独立Simulation引擎，也不新增音频层。**

| ID | 必须新增 | 复用 / 降级 |
|---|---|---|
| E-EE1 | `kind:'senses'`，三个小实验的纯函数数/状态输出、schema/注册/校验 | URL、预测、表、chart、数量类型、pose/visible/hz；降级可先用离线有限table，但不得声称动态折射已完成 |
| E-EE2 | `paraxial-eye` overlay，光线/接收面光斑与倒立位置标记 | existing overlay管理、token、on-demand render；降级静态两点示意并移除可调焦卡 |
| E-EE3 | `longitudinal-wave` overlay，本地粒子运动、慢放时钟、phase seek | existing clock/Hz discipline、RUN/pause/reduced-motion；降级四张静态相位，但不得用单向流代替 |


### 4.0.1 本轮复核（2026-10-27）

已检查 main 的 docs/06、sim/light.ts、table/pose、绑定与机制引擎，并 read-only 检查指定批次分支的 log 与代码：monsoon-engine（月气候层）、sem-engine（orbit-rotation）、airfoil-content（airfoil）、dinosaur（deep-time 已在 main）、plates（catalogue/reference/impact）。这些均不含近轴眼或局部纵波；不依赖任何未合并代码。light 是直线阴影与反射，不含透镜。table 可列出离散读数，却不产生同源光路端点和随相位变化的粒子，因此保留 E-EE1–3。删除拟新增的独立控制面板、音频、时间轴、pose/Hz binding、图表、source inspector、动画系统：全部复用现有实现。保留量的 from 名称以 §4.1 白名单为准。允许 phase 累计作为 overlay 局部轻量时钟，不引入 orbit 时钟依赖。两种 overlay 可选 group 直接复用现有图层开关；与 light-in / sound-active 的 when 联用，保持原7控件与128组合，不添加显示专用控制。

原始 facts.json 的44个 fact id 与本稿引用已程序核对，事实内容见父 dossier；§1–§7逐项映射。所有常数为 SIM / DESIGN，非活体测量。护理默认采用定性建议，不在主文增加分钟数或音量阈值；户外建议在有来源的细看里说明。真实网格未确认完整覆盖，采用原创程序化示意并显式标注；不宣称真实标本。

### 4.1 E-EE1 · schema与量

新数据段（以此处为拟定合同；不表示当前schema已经接受）：

```ts
// All controls are existing SimControl records, bilingual label/unit as applicable.
interface SensesData {
  eye: {
    illumination: string;      // toggle control id
    pupilMm: string;           // step [2,4]
    object: string;            // choice near/far
    focus: string;             // choice near/far
    objectsCm: Record<'near'|'far', number>; // {near:12,far:40}
    focalCm: Record<'near'|'far', number>;   // {near:3,far:40/11}
    retinaCm: number;          // 4
    referencePupilMm: number;  // 2
    objectHeightsCm: [number,number]; // [1,-0.5], asymmetric points
    sources: string[];         // production source IDs for SIM01–SIM03 design + theory
  };
  sound: {
    active: string;            // toggle
    frequencyHz: string;       // step [250,500]
    amplitude: string;         // step [1,2], dimensionless
    slowFactor: number;        // 250 fixed for every comparison
    baseFrequencyHz: number;   // 250
    baseWavelengthScene: number; // 1
    baseDisplacementScene: number; // .035（F3 修订，原 .0125）
    sources: string[];         // H11–H12 and SIM04 design
  };
}
```

控制id固定为`light-in`=true、`pupil-mm`=2、`object-range`=far、`lens-focus`=far、`sound-active`=true、`frequency-hz`=250、`amplitude`=1。控件kind如注释。新kind互斥：存在`senses`且不存在其它kind专用配置；注册`SIM_KINDS`、`evaluateSim`、`quantityKind`、`SEPARATE_EXPERIMENTS.senses=true`。增加experiment-of-quantity索引：eye-light对应relative-light/aperture-area；eye-focus对应image-distance、magnification、retinal-top-y、blur-diameter、focus-state、eye-state；sound对应visual-hz、wavelength、amplitude-level、sound-state。PLATE只看本章observe，预测不碰未观察工位。

**校验（build-time）**：

1. 所有引用的control/source/part/animation存在、ID kebab-case、显示文本双语；eye/sound控制不交叉写。pupil/frequency/amplitude是正、有限step，且本稿值集严格如上。两个choice key与map key恰好相同，默认值属于值集。
2. retinaCm、referencePupilMm、慢放/波长/位移常数正且有限。所有u,f组合满足u>f>0（避免无穷/虚像分支；本题无这分支）；focus容差固定`1e-6 model cm`，非给作者偷偷调。
3. `pupilMm/10 < .5` 仅为本实验近轴绘图约束，不说真实眼适用界限；d、u、r单元统一后才算。所有结果必须finite，非法直接validate失败，不能默默回退第一状态/0。
4. 区分`focus-state`（几何计算）与`eye-state`：light-in=false时eye-state=`dark`，focus-state仍可计算但标“几何预测”，图上不画任何光/像。light-in=true时eye-state=`lit`。不把暗处的潜在像显示成实际光。
5. quantityKind: `focus-state`/`eye-state`/`sound-state`为state，其余number；from值必须在下表白名单。sources必须非空且引用存在。

| quantity (`from`) | kind / unit | 明确定义 | 事实 |
|---|---|---|---|
| `aperture-area` | number, mm² | pi*d²/4 | SIM02 |
| `relative-light` | number, × | lightIn ? (d/d0)² : 0 | SIM02 |
| `image-distance` | number, model cm | v=uf/(u-f) | SIM01、SIM03 |
| `magnification` | number, × | -v/u，**焦平面**倍率 | SIM01 |
| `retinal-top-y` | number, model cm | -r*hTop/u，屏上的光束中心 | SIM01 |
| `blur-diameter` | number, model cm | (d/10)*abs(1-r/v)，点物几何散斑直径 | SIM01、SIM03 |
| `focus-state` | state | abs(v-r)≤1e-6 →on-retina；v<r →before-retina；v>r →behind-retina | SIM01 |
| `eye-state` | state | dark/lit，如上 | E01、SIM02 |
| `visual-hz` | number, cycles/s | active ? frequencyHz/slowFactor :0 | SIM04 |
| `wavelength-scene` | number, scene unit | baseWavelengthScene*baseFrequencyHz/frequencyHz | H11、SIM04 |
| `displacement-max` | number, scene unit | active ? baseDisplacementScene*amplitude :0 | H11–H12 |
| `amplitude-level` | number, × | active ? amplitude :0（相对位移振幅，不是强度、dB或主观响度） | H11–H12；SIM设计 |
| `sound-state` | state | active ? vibrating : still | H11、SIM04 |

主读数不出现“真实亮度”“几倍听起来更响”。图表T1 x=d(mm), y=relative-light(×)；T2 x=object-range(choice)、观察focus-state与image-distance，若state不可画折线则只表；T3分别记录频率或振幅，同值覆盖≤12行，非持久保存。

**伪代码**：`solveSenses(data,values)`只读取解析后的controls，返回上述record；`effectiveEyeRays(data,values)`用同一v/r/u结果返回绘图geometry。禁止用图上位置反推另一个独立焦点，以免数/图不一致。无random、Date、fetch、audio。运行≤0.1ms目标，在controls变化时重算，动画只改overlay phase。

### 4.2 E-EE2 · `paraxial-eye` overlay

```ts
interface ParaxialEyeOverlay {
  kind: 'paraxial-eye';
  group?: string;             // existing layer id; hidden group hides overlay
  model: 'eye';                // senses.eye, cannot point to another kind
  origin: [number,number,number];
  cmToScene: number;           // positive uniform scale, .06 here
  halfApertureSamples: 1;      // fixed: 3 launch heights (-d/20,0,+d/20 cm)
  when?: {control:string;is:string|number|boolean} | {output:string;is:string|number|boolean};
}
```

每个物点(-u,h)，样本在透镜面(0,a)，入射斜率(a-h)/u；出射斜率`(a-h)/u-a/f = -a/v-h/u`。接收面(r, `a*(1-r/v)-r*h/u`)。6条rays各由入射/出射两段构成；**止于r**，不穿到optic-nerve。接收面画每物点光束中心`-r*h/u`及宽度blur；只有on-retina时可画清晰点，不把模糊光斑换成清晰完整照片。说明文字始终可见：有效透镜包含角膜与晶状体，屏面表示视网膜；不是活眼的精确光线追迹（E03、E07、SIM01）。

纯helper回传`{u,f,v,r,diameterCm,points:[{h,centerY,spotDiameter,rays:[{object,lens,retina}]}]}`；渲染严格用helper，不私改端点。6条12段合并LineSegments，一次draw；两个点/光斑另一次instancing。孔径增大：v、中心y不变，throughput变4倍；偏焦时光斑变大，不只改“亮度”材质。lightIn=false所有rays/spot透明0且不可pick；切换仍保留控制值。EXPLODED>0隐藏整个overlay并显示双语说明。

校验 group 若写须存在；origin有限、scale正、半采样值固定1、sim.kind=senses；when必须恰好引用control或output之一，is的类型/取值须属于该控件或状态，引用必须存在。镜头、xray、剖切不会改变solver输出；eye-bench不被另一工位cutaway误切。新增QA `__atlas.engine.senses()`返回`eye`helper真实渲染端点、active/hidden原因与读数。接收面实际端点与helper投影误差≤1e-4 scene units。

### 4.3 E-EE3 · `longitudinal-wave` overlay

```ts
interface LongitudinalWaveOverlay {
  kind:'longitudinal-wave'; model:'sound';
  group?:string;              // existing layer id; no extra control
  origin:[number,number,number]; axis:[number,number,number]; // normalised, nonzero
  count:41; spacing:.05;      // rest x in [0,2], DESIGN scene units
  referenceIndex:5;           // visually mark x0=.25, show rest tick
  when?:{control:string;is:string|number|boolean}|{output:string;is:string|number|boolean};
}
```

时间t是**显示秒**。相位cycles由现有Hz clock累计，目标`frequency/250`，令`phi=2*pi*cycles`。粒子n的静止点`x0=n*.05`，瞬时位移`dx=A*sin(2*pi*x0/lambda - phi)`，世界位置`origin + axis*(x0+dx)`。A取`displacement-max`，lambda取`wavelength-scene`。没有纵轴波浪形轨道；灰色短刻度/高亮粒子显示静止位置和往复幅度；不画源→耳的净粒子迁移（H11）。

RUN=false或sound-active=false时冻结clock；sound-active=false目标位移归零，restart从当前相位继续，重播按钮只用于有replay的卡（本稿无，不擅加G）。Hz/幅度变化可平滑≤.5s，定态截图/深链接/reduced-motion立即snap。一个250倍slow label同时读实际设定frequency与显示Hz，不能只写“慢放”不出倍率。500Hz的显示节律应为250Hz的两倍（SIM04）。

校验 group 若写须存在；最大A/lambda<1/(2*pi)，保证x映射单调不穿粒子；本配置最坏.07/.5=.14，2*pi*.14=.8796<1（F3 修订后；原 .025/.5）。count/spacing固定、referenceIndex整数在范围内；axis单位化，origin有限。粒子半径≤.008；41粒子一个InstancedMesh、基线一次draw，无每帧React setState。组件卸载释放geometry/material，pause不继续请求帧。增debug `wave:{phaseCycles,positions,rests,visualHz,lambda,A,playing,slowFactor}` 与 `sensesSeek(cycles)`（测试接口，不是新儿童控件）可确定截图。

**绑定计划（现有语法，不添新绑定kind）**：

```json
[
 {"control":"pupil-mm","part":"iris-aperture-small","visible":{"eq":2}},
 {"control":"pupil-mm","part":"iris-aperture-large","visible":{"eq":4}},
 {"control":"lens-focus","part":"lens","pose":{"far":"lens-far","near":"lens-near"}},
 {"output":"visual-hz","animation":["drum-vibrate","malleus-rock","incus-rock","stapes-piston"],"hz":{"per":1,"origin":0}},
 {"output":"sound-state","animation":["drum-vibrate","malleus-rock","incus-rock","stapes-piston"],"enabled":{"eq":"vibrating"}}
]
```

骨链只在04/05对应chapter动画开启；06 amplitude只驱动wave overlay，**不假装改变听骨真实位移**。T1/T2无音振动画。signal flows只有转导那拍/组开启，单独的章流可见性，不用frequency控制神经导速。

### 4.4 确定数值验收（SIM oracles；已独立算出，不表示引擎已实现）

| 用例 | 预期 |
|---|---|
| d2→4、lightIn=true | area pi→4pi mm²，relative-light 1→4，v与retinal-top-y完全不变。SIM02 |
| lightIn=false，其他相同 | relative-light=0，eye-state=dark；v仍有定义；rays/spot不可见。 |
| far物距40、far焦距40/11 | v=4，m=-.1，top屏位置=-.1，blur=0，on-retina。SIM03 |
| near物距12、near焦距3 | v=4，m=-1/3，top屏位置=-1/3，blur=0，on-retina。SIM03 |
| near物距12、far焦距40/11、d2 | v=120/23=5.217391304348，m=-10/23；屏中心=-1/3，blur=7/150=.046666666667 cm；behind-retina。 |
| far物距40、near焦距3、d2 | v=120/37=3.243243243243，m=-3/37；屏中心=-.1，blur=7/150 cm；before-retina。 |
| 偏焦两例d4 | blur=7/75=.093333333333 cm，其他几何量不变。 |
| 250Hz、amplitude1、active | visual-hz=1，lambda=1，A=.035，amplitude-level=1。SIM04 |
| 500Hz、amplitude1 | visual-hz=2，lambda=.5，A同前，amplitude-level仍1（设定位移振幅，不是声强）。 |
| 250Hz、amplitude2 | visual-hz仍1，lambda仍1，A=.07，amplitude-level=2；不推断声强或主观响度倍数。 |
| 参考粒子x0=.25、250Hz/A1、phase0 | x=.285；phase=.25 cycles时x=.25；phase=1时回到.285。 |
| 同粒子500Hz/A1、phase0 | x=.25；一显示秒完成2周期，静止点仍.25。 |
| active=false | visual-hz=0，A=0，amplitude-level=0，sound-state=still；粒子回静止点。 |
| 骨链Hz binding | 1→2Hz，所有四动画相位同步；0时停；数值不得超过现有4Hz夹值。 |
| 无穷/非法输入 | u=f、负d、缺控制、错state引用、无source、无穷常数、overlay给非senses：validate拒绝。 |
| URL/拍恢复 | 同一?ch=near-far-and-focus&b=4&sim… 与手动同拍，值/标签/geometry相同；跨章不累积旧试一试。 |

数值绝对容差1e-9（table显示舍入不用于计算）；图端点误差1e-4 scene unit。机器可读`model-oracles.json`含4个lens、2个aperture、3个sound、3个wave样本。全controls组合128个：eye16 × sound8，必须都finite；不能报告成只测了两张截图。后续必须补引擎单测及EN/ZH × paper/cinema × deep-link e2e，正式施工须验证实际求解器与渲染 helper，不把准备稿算术当成引擎验收。

## 5. 章节与双语节拍（8章 ×5拍 =40拍）

### 5.0 章级初始状态（不累积）

下表及逐拍state栏是可读施工指令，不是可直接导入的JSON：select→`part`、highlight→`highlight`、光路/放大窗on→组/overlay可见条件；`view`只用assembled/xray/exploded/isolate，剖切单独写`cutaway`。章级camera引用预设的camera对象，beat.camera可用预设id。

默认sets `light-in:true,pupil-mm:2,object-range:far,lens-focus:far,sound-active:true,frequency-hz:250,amplitude:1`，每章覆盖如下。hide组必须使该组不能pick；切换章还原explosion=0。每拍都明确继承本章state，未列字段不继承上一章。

| # / id | 组 / 镜头 | view / cutaway / run | 卡片与覆盖 |
|---|---|---|---|
| 00 `before-you-start` | eye+ear，overview | assembled / none / false | 无sim卡，隐藏放大窗与实验bench |
| 01 `the-light-gate` | eye，eye | assembled / eye-cut / false | T1；vary pupil-mm，keep light-in/物距/focus，observe relative-light |
| 02 `an-image-on-the-retina` | eye+optics，eye | assembled / eye-cut / false | 无卡，ray overlay on；00/01故事输入在此补齐 |
| 03 `near-far-and-focus` | eye+optics，focus-bench | assembled / eye-cut / false | T2；vary object-range，also lens-focus，keep d2/light，observe focus-state/image-distance |
| 04 `three-moving-bones` | ear-transfer，ear | assembled / ear-cut / true | 无卡；骨链1Hz，FLOW关 |
| 05 `vibration-to-signal` | ear+hair窗，cochlea | assembled / ear-cut / true | 无卡；只本章动画与分步信号 |
| 06 `pitch-and-strength` | ear+wave，wave | assembled / none / true | T3；vary frequency-hz，also amplitude，keep active；observe visual-hz/amplitude-level |
| 07 `care-and-protection` | eye+ear，overview | assembled / none / false | 无卡；所有overlay/动画关；文字活动 |

T1预测：d2→4，relative-light结果more；T2：near物距+far-focus开始，改lens-focus=near，focus-state从behind-retina→on-retina（状态选项，非数值“变大”）；T3：250→500Hz，保持amplitude=1，先猜amplitude-level，结果same，另读visual-hz倍增；不由固定粒子位移幅度推断不同频率下声强相同。M01/M02只作02的文字预测，不多塞一张卡。

### 5.1 第 00 章 `before-you-start` · 开始之前 / Before you start

- **孩子的问题（编辑导语）**：同一次拍手，眼和耳各接到什么？
- **正文提纲**：先辨光与振动，再找到接收和神经两个阶段。
- **summary**：Before you start. / 开始之前。本章用下表可见过程展开，事实不超出所列ID。

| 拍 | state 增量（叠在章级初态） | Caption EN | 字幕 ZH | 事实 / 设计标记 |
|---|---|---|---|---|
| 00.1 | `overview; both stations; run=false` | The eye and ear are shown at separate study stations. | 眼睛和耳朵分成两个工位展示。 | E08,H01; DESIGN layout |
| 00.2 | `highlight retina; labels retina,cornea` | Light enters the eye and reaches its light-sensitive retina. | 光进入眼睛，到达能感光的视网膜。 | E01,E04 |
| 00.3 | `highlight eardrum,cochlea-shell` | Sound vibration reaches the eardrum and then the inner ear. | 声音的振动传到鼓膜，再传入内耳。 | H01,H04,H05 |
| 00.4 | `show optic-nerve,auditory-nerve; flows=false` | Both routes send signals along nerves to the brain. | 两条路线都通过神经把信号传到大脑。 | E05,H07 |
| 00.5 | `overview; link card seeing-light` | Seeing begins with incoming light; hearing begins with vibration. | 看见东西从入眼的光开始，听见声音从振动开始。 | E01,H01 |

- **细看**：“光与影”回链；模型是分开摆放与示意比例；无声也可看全课。
- **本章索引**：`parts: ["cornea", "retina", "optic-nerve", "eardrum", "cochlea-shell", "auditory-nerve"]`。所有被正文/拍提到的模型对象可从索引选中；未显示的缩放窗需先开组再聚焦。
- **场景回退**：若新overlay尚未实现，用清楚标示的静态图；对应交互卡必须移除/缩减，不保留能点却不变的控件。

### 5.2 第 01 章 `the-light-gate` · 进光的开口 / The light opening

- **孩子的问题（编辑导语）**：瞳孔大了，像会移位吗？
- **正文提纲**：先找透明角膜，再认虹膜中的通孔。只改变孔径，比较进光相对量。
- **summary**：The light opening. / 进光的开口。本章用下表可见过程展开，事实不超出所列ID。

| 拍 | state 增量（叠在章级初态） | Caption EN | 字幕 ZH | 事实 / 设计标记 |
|---|---|---|---|---|
| 01.1 | `eye; highlight cornea` | The clear cornea is the front surface through which light enters. | 光先经过眼前部透明的角膜。 | E01 |
| 01.2 | `select iris; pose iris-small` | The pupil is an opening in the iris. | 瞳孔是虹膜中间的开口。 | E02 |
| 01.3 | `sim pupil-mm=2; T1 start` | This model begins with the smaller opening. | 这个模型先用较小的开口。 | SIM02; DESIGN |
| 01.4 | `sim pupil-mm=4; T1 change` | Doubling the diameter gives four times the opening area in this model. | 在这个模型里，直径变成两倍，开口面积变成四倍。 | SIM02 |
| 01.5 | `show overlay comparison; v unchanged` | The admitted-light proxy changes; the image position stays the same here. | 进光相对量改变了，这里的成像位置不变。 | SIM01,SIM02 |

- **细看**：面积不是主观亮度；真实瞳孔反射不是手动mm开关；不照手电、不看太阳（P09）。
- **本章索引**：`parts: ["cornea", "iris", "lens", "retina"]`。所有被正文/拍提到的模型对象可从索引选中；未显示的缩放窗需先开组再聚焦。
- **场景回退**：若新overlay尚未实现，用清楚标示的静态图；对应交互卡必须移除/缩减，不保留能点却不变的控件。

### 5.3 第 02 章 `an-image-on-the-retina` · 视网膜上的像 / An image on the retina

- **孩子的问题（编辑导语）**：物体上部的光落在哪里？
- **正文提纲**：入眼光经两种折光部件，倒立成像后才转成信号。
- **summary**：An image on the retina. / 视网膜上的像。本章用下表可见过程展开，事实不超出所列ID。

| 拍 | state 增量（叠在章级初态） | Caption EN | 字幕 ZH | 事实 / 设计标记 |
|---|---|---|---|---|
| 02.1 | `optics on; select object-top; light-in=true` | Light from an illuminated object enters the eye. | 被照亮物体发出的反射光进入眼睛。 | C01,E01,M01,M02 |
| 02.2 | `highlight cornea,lens; show effective lens note` | The cornea and lens work together to focus light. | 角膜和晶状体一起把光聚焦。 | E03 |
| 02.3 | `overlay both object points; u40/far focus` | Light from the object’s top reaches the lower part of the model receiver. | 物体上部来的光落到模型接收面的下方。 | E07,SIM01,SIM03 |
| 02.4 | `select retina; dim all rays after receiver` | Cells in the retina change light into electrical signals. | 视网膜中的感光细胞把光转成电信号。 | E04 |
| 02.5 | `select optic-nerve; optic-signal on; rays stop at retina` | The optic nerve carries signals to the brain. | 视神经把信号传到大脑。 | E05 |

- **细看**：不画脑内翻相片机器；视杆/视锥只在细看（E09）；光与影seeing-light回链。
- **本章索引**：`parts: ["object-top", "object-bottom", "cornea", "lens", "retina", "optic-nerve"]`。所有被正文/拍提到的模型对象可从索引选中；未显示的缩放窗需先开组再聚焦。
- **场景回退**：若新overlay尚未实现，用清楚标示的静态图；对应交互卡必须移除/缩减，不保留能点却不变的控件。

### 5.4 第 03 章 `near-far-and-focus` · 看近与看远 / Near, far and focus

- **孩子的问题（编辑导语）**：从书看向树，眼里什么改变了？
- **正文提纲**：接收面固定，换物距与有效焦距；模拟不作验光。
- **summary**：Near, far and focus. / 看近与看远。本章用下表可见过程展开，事实不超出所列ID。

| 拍 | state 增量（叠在章级初态） | Caption EN | 字幕 ZH | 事实 / 设计标记 |
|---|---|---|---|---|
| 03.1 | `object-range=far,lens-focus=far; select lens` | The far-object setting focuses on the receiver in this model. | 这个模型的远物设置把光聚在接收面上。 | SIM03 |
| 03.2 | `object-range=near,lens-focus=far; T2 start` | Move the object nearer without changing focus: the model spot spreads. | 物体移近、聚焦设置不变时，模型光斑散开。 | SIM01,SIM03 |
| 03.3 | `lens-focus=near; pose lens-near; T2 change` | For near viewing, the lens becomes rounder. | 看近处时，晶状体变得更圆鼓。 | E06,E13 |
| 03.4 | `highlight retinal-screen; r fixed` | The receiver stays fixed while the model focus returns to it. | 接收面没有移动，模型的聚焦位置回到它上面。 | SIM03 |
| 03.5 | `select retina; close-up More note` | In myopia, distant light focuses in front of the retina; prescribed lenses can help. | 近视时，远处来的光聚在视网膜前；按处方配的眼镜可帮助看清。 | E11,E12 |

- **细看**：near/far模型焦距不是儿童眼球测量；矫正不等于治愈（P04）；不给用户处方度数。
- **本章索引**：`parts: ["lens", "ciliary-ring", "retina", "retinal-screen", "object-top", "object-bottom"]`。所有被正文/拍提到的模型对象可从索引选中；未显示的缩放窗需先开组再聚焦。
- **场景回退**：若新overlay尚未实现，用清楚标示的静态图；对应交互卡必须移除/缩减，不保留能点却不变的控件。

### 5.5 第 04 章 `three-moving-bones` · 三块相连的骨 / Three connected bones

- **孩子的问题（编辑导语）**：鼓膜后面是什么在动？
- **正文提纲**：从耳道到膜、三骨、卵圆窗，放大可读运动。
- **summary**：Three connected bones. / 三块相连的骨。本章用下表可见过程展开，事实不超出所列ID。

| 拍 | state 增量（叠在章级初态） | Caption EN | 字幕 ZH | 事实 / 设计标记 |
|---|---|---|---|---|
| 04.1 | `ear; select pinna,canal; run=false` | The ear canal leads to the eardrum. | 外耳道通到鼓膜。 | H01 |
| 04.2 | `select eardrum; run=true` | Incoming sound makes the eardrum vibrate. | 传来的声音使鼓膜振动。 | H01 |
| 04.3 | `labels malleus,incus,stapes; shared clock` | Three middle-ear bones form a connected chain. | 中耳的三块听小骨相连成链。 | H02,H03 |
| 04.4 | `select stapes; show contact oval-window` | The stapes footplate moves at the oval window. | 镫骨底板在卵圆窗处活动。 | H04 |
| 04.5 | `cochlea cutaway; select oval-window` | This motion transfers into the fluid-filled cochlea. | 这份运动传入充满液体的耳蜗。 | H04,H05 |

- **细看**：听骨名字与eardrum边界；咽鼓管调压（H09）；拆开时停止传振。
- **本章索引**：`parts: ["pinna", "canal", "eardrum", "malleus", "incus", "stapes", "oval-window", "eustachian-tube"]`。所有被正文/拍提到的模型对象可从索引选中；未显示的缩放窗需先开组再聚焦。
- **场景回退**：若新overlay尚未实现，用清楚标示的静态图；对应交互卡必须移除/缩减，不保留能点却不变的控件。

### 5.6 第 05 章 `vibration-to-signal` · 从振动到信号 / From vibration to signal

- **孩子的问题（编辑导语）**：空气会沿听神经流到脑里吗？
- **正文提纲**：分开表现液体波、膜和细胞、神经信号。
- **summary**：From vibration to signal. / 从振动到信号。本章用下表可见过程展开，事实不超出所列ID。

| 拍 | state 增量（叠在章级初态） | Caption EN | 字幕 ZH | 事实 / 设计标记 |
|---|---|---|---|---|
| 05.1 | `cochlea-shell cutaway; run=true` | Cochlear fluid motion sets a wave along the basilar membrane. | 耳蜗液体的运动在基底膜上形成行波。 | H05 |
| 05.2 | `show basilar-strip enlarged; hide balance-context` | The strip shown here is an enlarged schematic of the membrane. | 这里的条带是基底膜的放大示意。 | H05; DESIGN |
| 05.3 | `hair-patch zoom; bundle-bend on` | Tiny hair-like bundles on sensory cells bend. | 感受细胞上微小的纤毛束发生弯曲。 | H06 |
| 05.4 | `signal-marker on; auditory-signal begins` | Hair-cell activity helps start electrical signalling. | 毛细胞的活动帮助启动电信号传递。 | H06 |
| 05.5 | `select auditory-nerve; signal flow only` | Signals, rather than a stream of air, travel along the nerve. | 沿神经传递的是信号，不是一股空气。 | H07,H11 |

- **细看**：基底高/顶端低（H08）；平衡结构不等于听觉部件（H10）；不发明细胞数与导速。
- **本章索引**：`parts: ["cochlea-shell", "basilar-strip", "hair-patch", "auditory-nerve", "signal-marker", "balance-context"]`。所有被正文/拍提到的模型对象可从索引选中；未显示的缩放窗需先开组再聚焦。
- **场景回退**：若新overlay尚未实现，用清楚标示的静态图；对应交互卡必须移除/缩减，不保留能点却不变的控件。

### 5.7 第 06 章 `pitch-and-strength` · 音高与强弱 / Pitch and strength

- **孩子的问题（编辑导语）**：振动更强，音一定更高吗？
- **正文提纲**：同一慢放倍率，分别控制频率和相对振幅。
- **summary**：Pitch and strength. / 音高与强弱。本章用下表可见过程展开，事实不超出所列ID。

| 拍 | state 增量（叠在章级初态） | Caption EN | 字幕 ZH | 事实 / 设计标记 |
|---|---|---|---|---|
| 06.1 | `wave on; frequency-hz=250,amplitude=1` | The highlighted particle moves back and forth about its rest point. | 标出的粒子在静止位置附近来回运动。 | H11 |
| 06.2 | `T3 start; show f250/visual1 label` | The 250 hertz example is shown 250 times slower. | 250赫兹的例子以250倍慢放显示。 | SIM04 |
| 06.3 | `frequency-hz=500; amplitude=1; T3 change` | Doubling frequency doubles the displayed pace; amplitude is unchanged. | 频率变成两倍，显示节律也变成两倍；振幅不变。 | H12,SIM04 |
| 06.4 | `frequency-hz=250; amplitude=2` | Now amplitude doubles while frequency stays the same. | 现在振幅变成两倍，频率保持不变。 | H12,SIM04 |
| 06.5 | `reference particle and rest ticks; phase sampled` | The wave pattern travels while particles keep returning about their rest positions. | 波的形态向前传播，粒子仍在各自静止位置附近往复。 | H11,M04 |

- **细看**：音调和位移振幅分开；不计算声强或响度倍数；不提高设备音量做测试（P06）。
- **本章索引**：`parts: ["wave-reference", "eardrum", "cochlea-shell"]`。所有被正文/拍提到的模型对象可从索引选中；未显示的缩放窗需先开组再聚焦。
- **场景回退**：若新overlay尚未实现，用清楚标示的静态图；对应交互卡必须移除/缩减，不保留能点却不变的控件。

### 5.8 第 07 章 `care-and-protection` · 爱护与保护 / Care and protection

- **孩子的问题（编辑导语）**：日常哪些改变能保护看和听？
- **正文提纲**：返回两个器官，把结构与保护行为联系起来。
- **summary**：Care and protection. / 爱护与保护。本章用下表可见过程展开，事实不超出所列ID。

| 拍 | state 增量（叠在章级初态） | Caption EN | 字幕 ZH | 事实 / 设计标记 |
|---|---|---|---|---|
| 07.1 | `overview; all overlays/run/flow off` | Outdoor time belongs alongside breaks from near work; the detailed note gives SingHealth’s advice. | 户外活动与近距离用眼时的休息同样重要；细看列出新保集团的建议。 | P01 |
| 07.2 | `highlight lens; text activity only` | Take frequent breaks from near work and look into the distance. | 近距离用眼时经常休息，看看远处。 | P02,P03 |
| 07.3 | `highlight hair-patch; care callout` | Keep listening levels down, limit noisy exposure and move farther from loud sources. | 降低聆听音量，减少噪声暴露时间，并远离很响的声源。 | P05,P06 |
| 07.4 | `highlight canal/eardrum; no object-in-ear illustration` | Do not put cotton buds or other objects into the ear canal. | 不要把棉花棒或其他物品伸进耳道。 | P08 |
| 07.5 | `overview; text no sunlight test` | Never look directly at the Sun. Ask an adult for help with vision or hearing concerns. | 不要直视太阳。看或听有困难时，请大人协助寻求专业帮助。 | P09,E12,P06,P08 |

- **细看**：HealthHub30–40与NUHS20–30分钟并列；WHO儿童75dB/40h仅供家长理解设备参考，不作安全倒计时（P07）；不治疗、不筛查。
- **本章索引**：`parts: ["iris", "lens", "retina", "canal", "eardrum", "hair-patch"]`。所有被正文/拍提到的模型对象可从索引选中；未显示的缩放窗需先开组再聚焦。
- **场景回退**：若新overlay尚未实现，用清楚标示的静态图；对应交互卡必须移除/缩减，不保留能点却不变的控件。

## 6. 名词表与来源

### 6.1 EN / 简体中文（核心表；完整56词在facts.json）

定义均为独立简明转述，不复制医学说明段落。SG佐证与未核字段继承父dossier；没有把国外术语说成MOE官方译名。

| id | EN / ZH | 定义要点 | see / facts |
|---|---|---|---|
| `cornea` | Cornea / 角膜 | 眼前透明弯曲表面，折光 | cornea / E01 |
| `pupil` | Pupil / 瞳孔 | 虹膜中的开口 | iris / E02 |
| `iris` | Iris / 虹膜 | 调节开口进光量 | iris / E02 |
| `lens` | Lens / 晶状体 | 与角膜一起聚焦，可改变形状 | lens / E03、E06 |
| `retina` | Retina / 视网膜 | 含感光细胞的眼内后部薄层 | retina / E04 |
| `optic-nerve` | Optic nerve / 视神经 | 将信号传向脑 | optic-nerve / E05 |
| `myopia` | Myopia / 近视 | 远处光聚在视网膜前；中文形式本稿编辑用词待补佐证 | retina / E11 |
| `eardrum` | Eardrum / 鼓膜 | 耳道末端能振动的薄膜 | eardrum / H01 |
| `ossicles` | Ossicles / 听小骨 | 中耳相连三块骨的合称 | malleus / H02 |
| `malleus` | Malleus / 锤骨 | 与鼓膜接触的听小骨 | malleus / H03 |
| `incus` | Incus / 砧骨 | 骨链中间一块 | incus / H03 |
| `stapes` | Stapes / 镫骨 | 在卵圆窗处传振的听小骨 | stapes / H04 |
| `cochlea` | Cochlea / 耳蜗 | 具有液体与感受细胞的内耳结构 | cochlea-shell / H05–H06 |
| `hair-cell` | Hair cell / 毛细胞 | 机械感受细胞；不是普通毛发，中文词形见S25 | hair-patch / H06 |
| `auditory-nerve` | Auditory nerve / 听神经 | 传送听觉信号的神经 | auditory-nerve / H07 |
| `frequency` | Frequency / 频率 | 每秒振动次数；词形见S25 | wave-reference / H12 |
| `amplitude` | Amplitude / 振幅 | 最大偏移；中文编辑译法待核 | wave-reference / H12 |
| `pitch` | Pitch / 音高 | 与频率相关的高低感觉；词形见S25 | wave-reference / H12 |

### 6.2 来源表（研究编号；production 去前导零）

生产内容转换成`{sources:[{id,text:{en,zh},url,note}]}`；来源登记是研究格式，不能直接送 production validator。生产 id 去前导零：S01→S1、S02→S2，依此类推；S10–S32不变。事实id保持原样。所有科学claim追到facts.json；设计值追到S31/model-oracles。访问日期均为2026-10-27。

| id | 来源、用途 | 对应事实 / 限制 |
|---|---|---|
| S01 | [Science Teaching & Learning Syllabus, Primary Three to Six, updated Jan 2026](https://www.moe.gov.sg/-/media/files/primary/syllabus/2023-primary-science.ashx) · MOE CPDD | C01, C02；Printed pp.16, 53–55, 75; PDF pp.17, 54–56, 76. Locally cached official PDF inspected, not downloaded this job. |
| S02 | [How the Eyes Work](https://www.nei.nih.gov/eye-health-information/healthy-vision/how-eyes-work) · NIH National Eye Institute | E01, E02, E03, E04, E05；Main explanation, cornea through brain |
| S03 | [The Formation of Images on the Retina, Neuroscience 2nd ed.](https://www.ncbi.nlm.nih.gov/books/NBK11079/) · Purves et al.; NCBI Bookshelf / Sinauer | E06, E13；Text on accommodation and Figure 11.2 |
| S04 | [Visual Processing: Eye and Retina](https://nba.uth.tmc.edu/neuroscience/s2/chapter14.html) · UTHealth Houston, Neuroscience Online | E07；Figures 14.6–14.7 and accommodation section |
| S05 | [Nearsightedness (Myopia)](https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/nearsightedness-myopia) · NIH National Eye Institute | E11；What is nearsightedness?; causes; diagnosis |
| S06 | [Refractive Errors](https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/refractive-errors) · NIH National Eye Institute | E12；What are refractive errors?; treatment |
| S07 | [How Do We Hear?](https://www.nidcd.nih.gov/health/how-do-we-hear) · NIH NIDCD | H01, H02, H05, H06, H07, H08；Numbered steps 1–6 |
| S08 | [14.1 Sensory Perception](https://openstax.org/books/anatomy-and-physiology-2e/pages/14-1-sensory-perception) · OpenStax, Anatomy and Physiology 2e | H03, H04, H09, H10；Audition; Figures 14.5–14.8; Equilibrium; Vision; current footer licence |
| S09 | [14.1 Speed of Sound, Frequency, and Wavelength](https://openstax.org/books/physics/pages/14-1-speed-of-sound-frequency-and-wavelength) · OpenStax Physics | H11；Sound wave and longitudinal motion explanation |
| S10 | [14.2 Sound Intensity and Sound Level](https://openstax.org/books/physics/pages/14-2-sound-intensity-and-sound-level) · OpenStax Physics | H12；Amplitude, Loudness and Energy of a Sound Wave |
| S11 | [2.4 Thin Lenses](https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses) · OpenStax University Physics Volume 3 | SIM01；Thin-Lens Equation, Eq.2.19; magnification |
| S12 | [Childhood Myopia](https://www.singhealth.com.sg/symptoms-treatments/childhood-myopia) · SingHealth | P01；Good eye care habits; HPB recommendation at least 2 hours outdoors |
| S13 | [Good Eye Care Habits](https://www.healthhub.sg/well-being-and-lifestyle/personal-care/good_eye_care_habits) · HealthHub / Health Promotion Board | P02；Encourage Outdoor Play; Reduce Time Spent on Near Work |
| S14 | [Myopia in Children](https://www.nuhs.edu.sg/patient-care/find-a-condition/myopia-in-children) · National University Health System | P03, P04；Treatment options and good eye care habits |
| S15 | [Noise-Induced Hearing Loss](https://www.nidcd.nih.gov/health/noise-induced-hearing-loss) · NIH NIDCD | P05；What causes NIHL?; How can noise damage our hearing?; prevention |
| S16 | [Deafness and hearing loss: Safe listening](https://www.who.int/news-room/questions-and-answers/item/deafness-and-hearing-loss-safe-listening) · World Health Organization | P06；How can I protect my hearing? |
| S17 | [Safe listening devices and systems: a WHO-ITU standard](https://www.who.int/publications/i/item/9789241515276) · World Health Organization / ITU | P07；Mode 1 and Mode 2 summary; full report printed p.16 for uncertainty |
| S18 | [Project Silver Screen Chinese guidebook](https://ch-api.healthhub.sg/api/public/content/0c94794c37b6411d981cab140070dcb7?v=67d3f4d0) · MOH / Temasek Foundation; hosted by HealthHub | P08；Printed pp.10–12; PDF pages 4–6; adult screening context, vocabulary and general ear protection only |
| S19 | [The Human Eye](https://hesperia.gsfc.nasa.gov/hessi/eye.htm) · NASA Goddard HESSI educational pages | P09；Retinal image; direct-Sun warning |
| S20 | [The persistence of a misconception about vision after educational interventions](https://pubmed.ncbi.nlm.nih.gov/11700915/) · Gregg et al., Psychonomic Bulletin & Review 8(3), 622–626 (2001); PubMed | M01；Abstract; DOI 10.3758/BF03196199 |
| S21 | [Children’s Conceptions of Light and Color: Understanding the Role of Unseen Rays](https://eric.ed.gov/?id=ED270318) · Anderson & Smith (1986), original report abstract at ERIC | M02；Abstract: fifth-grade diagnostic tests and interviews |
| S22 | [Making Sense of Sound](https://eric.ed.gov/?id=EJ1123030) · Menon & Lankford, Science and Children 54(4),41–47 (2016); ERIC | M03；Author article abstract; elementary misconceptions |
| S23 | [Multimedia Library](https://www.nidcd.nih.gov/news/multimedia-library) · NIH NIDCD | 许可/术语/访问证据（非额外科学断言）；Opening reuse statement |
| S24 | [结构和功能](https://www.msdmanuals.cn/home/eye-disorders/biology-of-the-eyes/structure-and-function-of-the-eyes) · MSD诊疗手册大众版; Brady, reviewed Garg | E08, E09, E10；Simplified Chinese; reviewed October 2025; eye structure, rods/cones, fluids |
| S25 | [听觉如何工作](https://ears.ucsf.edu/zh/understanding/how-hearing-works) · UCSF EARS Program | 许可/术语/访问证据（非额外科学断言）；Simplified Chinese; steps 1–4 and conduction headings |
| S26 | [我们是怎样听到声音的？](https://wjw.beijing.gov.cn/bmfw_20143/jkzs/jksh/202403/t20240314_3589620.html) · Beijing Municipal Health Commission / Beijing Tsinghua Changgung Hospital | 许可/术语/访问证据（非额外科学断言）；Chinese anatomy terminology; middle and inner ear |
| S27 | [Sound Stuff? Naïve materialism in middle-school students’ conceptions of sound](https://www.tandfonline.com/doi/abs/10.1080/09500690500277938) · Eshach & Schwartz, International Journal of Science Education 28(7),733–764 (2006) | M04；Publisher abstract only; full text gated. Online date 2007, volume year 2006 |
| S28 | [BodyParts3D licence](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html) · DBCLS / NBDC | 许可/术语/访问证据（非额外科学断言）；Licence updated 2025-02-27; CC Attribution 4.0 |
| S29 | [Z-Anatomy source project](https://github.com/LluisV/Z-Anatomy) · LluisV / Z-Anatomy contributors | 许可/术语/访问证据（非额外科学断言）；Repository readme; anatomy mesh runbook in Atlas corroborates provenance |
| S30 | [2020 Social Studies Primary syllabus](https://www.moe.gov.sg/-/media/files/primary/2020-social-studies-primary.pdf) · MOE CPDD | 许可/术语/访问证据（非额外科学断言）；Search-discovered; direct open returned robot verification, skipped |
| S31 | [Atlas model study for eyes-and-ears](local:eyes-and-ears/model-oracles.json) · Atlas editorial design calculation | SIM02, SIM03, SIM04；Original equations, chosen dimensionless classroom parameters; not a measured human eye |
| S32 | [Childhood Myopia English brochure](https://www.snec.com.sg/patient-care/conditionstreatments/eye-conditions-brochures/Documents/EN_Childhood%20Myopia.pdf) · Singapore National Eye Centre | 许可/术语/访问证据（非额外科学断言）；PDF page 9: outdoor schedule 1–2 hours; compared with live SingHealth advice, no PDF downloaded |

## 7. 图版计划（Deliverable C）

| 文件 | kind / 目标尺寸 | 章节与题材 | 必核 |
|---|---|---|---|
| `eyes-and-ears.png` | cover / 1024×1024 | 一个眼球剖面 + 一个外耳，分开摆放 | lens在iris后，pupil为开口，后壁retina/optic nerve；一只耳，无额外器官，非真实比例（E01–E08、H01） |
| `eyes-and-ears-lens-shapes.png` | figure / 1536×1152 | 03；同一晶状体示意：远视物较扁、近视物较厚 | 恰好两视图、都双凸、同观察方向、厚度差可见，近焦图赤道直径略小，整体体积变化不作定量；不是远视眼/近视眼两个病种（E06） |
| `eyes-and-ears-middle-ear-chain.png` | figure / 1536×1152 | 04；鼓膜和完整听骨链 | 恰好锤/砧/镫三骨，锤骨柄接鼓膜，砧骨长突接镫骨，镫骨两脚+一底板（H02–H04） |

风格：fine graphite 19th-century scientific plate，cross-hatching/stippling，严格R=G=B；无纸纹/底色/框/字/箭头/地影，PNG真alpha，标本约85%画面且四边留白。图是说明图、不能充当后续临床解剖网格的源图。生成prompt、视觉检查、tries与原始路径在art目录的manifest/prompts/image-qa；精确尺寸与灰度/alpha另以脚本验证。仅用户明确要求的确定灰度/alpha/尺寸后处理允许脚本，不以程序绘图替代imagegen。

复用评估：已检索现有art/planned影子、材料、心肺图；不匹配以上题材，0复用，无`reusedFrom`虚假记录。新图与新dossier同一parent，无需复制自己文件。

## 8. 施工顺序与验收

依序完成 §4 引擎（draft sample-senses、纯函数/非法域/128组合单测、e2e、docs/06）→ published 内容（8章40拍、三张已审图、双语文字、来源、词汇、REVIEW/AUDIT、语义单测、e2e、smoke计数）。pnpm check / validate / test / build 必须执行。浏览器门槛按本次 BRIEF 明令在 sandbox 跳过：shoot 与 e2e 由主会话在端口5446执行；不打开用户浏览器或桌面。截图、真实GPU/手机布局未核验不得写成通过。

图像只处理已审 approved PNG，不重新生成。没有地图或外部运行时请求。无 git 写入、无 package/lockfile/review-queue/next-batch 修改。

## 9. 施工记录

### 9.1 引擎施工记录（2026-10-27）

E-EE1–3 已实现：`senses-schema.ts`、`lib/sim/senses.ts`、`SensesOverlays.tsx`，注册 SIM_KINDS / simQuantities / quantityKind / SEPARATE_EXPERIMENTS；无新 timeline、binding、音频、控制面板。schema 校验固定控件、合法状态/来源、有限域、u>f、单位轴和不交叉粒子。`sensesExperiment` 将 PLATE 状态限定在本卡观察的工位。

眼光路六条、十二段，一次 LineSegments；两个光斑一次 instancing；debug 输出读取实际 Float32 BufferGeometry 端点。纵波41粒子一次 instancing，基线与静止刻度一次绘制；逐帧复用缓冲，无数组/矩阵/颜色分配；RUN、active、group、reduced-motion 管理时钟，`sensesSeek` 可定位相位。语义颜色复用 en-light / air / ink-2，资源分别释放。PLATE 复用原插槽显示有效透镜、慢放、暗处几何预测与拆开说明，不新增 HUD 块。

最小合同澄清：两 overlay 可选 group 直接复用 layers；频率/振幅设置立即 snap（合同允许≤.5s缓动）。课堂常数严格固定到独立 oracle，较 §4 原正数域描述更严格，排除未支持课堂域与数值溢出；不是通用临床光学。虹膜改用固定外缘+两个 context 环片 visible 绑定，避免整体缩放造成外径改变。

夹具 `sample-senses` 为 draft，3章9拍。`tests/space-scene/senses.test.ts` 首轮30例通过，包含所有128组合、oracle和非法域；source validate58主题0 error/0 warning。EN/ZH × paper/cinema 深链、暗处、拆开、phase/pause/reduced-motion e2e 与 shoot 数图核对已编写，按 BRIEF 不执行浏览器门槛。全仓 check/test/build 最终结果待 §9.3；真实 GPU、手机布局与截图不宣称通过。

### 9.2 内容与几何施工记录

`eyes-and-ears` 保持单主题、published。8章40拍，3张先猜后看/记录卡；26个可选中零件 + 2个不可选中虹膜环片，5个结构/实验组 + 1个仅流的 nerve-signals 图层；2条神经信号流、6个动画、6个预设、4个姿态。18词条逐语言首次包 Term，33条来源（研究S01→生产S1等；新增S33 HealthHub HTML再次佐证P08，不新增科学fact id）。封面与2章图均由已审PNG经illustrate.ts处理，保留透明；输入/输出hash及尺寸见provenance/illustrations.json。没有新增第三方派生资产或许可证例外。

最小数据组合调整：信号使用额外的仅流图层，05前3拍保留机械运动、后2拍才显示神经信号；signal-marker归耳接收组，05不打开纵波实验层。虹膜外缘固定，两个内孔变体用既有visible绑定切换。基底膜放大条只展示局部起伏，不计算沿耳蜗传播的波；细胞体留在基底条上，只有纤毛束示意共同倾斜；这两项限制已入正文细看/详情/S31。05最后一拍显示平衡结构以便与听觉区别并可从章索引查看。

程序化构建全部28件（包括互斥的两个孔径环片）得到34个合并几何piece、97,586个三角形，0非有限顶点分量；这不是运行时draw calls。128组控制、孔径互斥、两路流开关、物点姿态与光路起点对齐已核。镫骨底板/卵圆窗X向示意接触以361个相位采样，最小轴向重合0.0058场景单位；不是完整动态碰撞或组织物理验收。参考来源和缓存网格覆盖见scripts/geo/eyes-and-ears/reference-audit.md。没有声称完成R2截图、实际GPU、裁切/标注或手机布局验收。

另修复施工中发现的阻塞问题：senses在拆开/任意explode>0时立即冻结共享RUN时钟，骨链与局部放大窗停止；其他sim沿用原阻尼行为。增加纯函数回归用例，避免分离的听骨仍传振。模型不引入音频/麦克风、临床验光或听力筛查。

### 9.3 最终门槛与主会话接手

| 门槛 | 结果 |
|---|---|
| pnpm check | 通过；774文件，0 error / 0 warning，3个既有unused提示；最终TypeScript独立复核亦通过。 |
| pnpm validate | 59主题，0 error / 0 warning。 |
| pnpm run test --testTimeout=20000 | 163测试文件、4,328测试全通过，38.47s。原默认5秒在并发负载下曾使既有energy守恒用例超时；提高单次执行上限重跑，无测试/算法放宽。新增51例分布于senses32、run-clock5、topic14，含128组合与返回组装态回归。 |
| pnpm build | 通过，121页；PWA148项。Vite仍报告全站已有的大chunk提示；首屏JS与实际GPU预算没有在浏览器量测，不宣称达到目标。 |
| 静态首页复核 | EN/ZH均35个published主题、13个biology、70徽章、35张图，ww2为图版35；smoke对应计数已更新。 |
| git diff --check | 通过；package.json/lockfile/review-queue/next-batch未改，无git写命令。 |
| pnpm shoot / pnpm e2e | 按BRIEF明确跳过sandbox浏览器门槛。编写17个新e2e用例（sample7、正式主题10），未执行，不冒称通过。 |

给 Gavin：审原创示意的结构辨识、听骨接触与切面、不同工位/放大窗比例、有效薄透镜的课堂化边界、护理定性正文及具名来源的不同休息建议、中文编辑译词。全部在主题REVIEW.md列出；索引只开详情，不会自动取消某一拍的hide，需要相应拍可见时查看。

主会话在端口5446运行（本工作树未运行）：

```sh
pnpm shoot sample-senses --beats --keys --layout --locale en,zh --theme paper,cinema
pnpm shoot eyes-and-ears --beats --tasks --keys --layout --locale en,zh --theme paper,cinema
pnpm shoot eyes-and-ears --beats --keys --locale en,zh --theme paper,cinema --size 390x844
pnpm shoot light-and-shadows --beats --keys
pnpm shoot heart-and-lungs --beats --keys
CI=1 ATLAS_E2E_PORT=5446 pnpm e2e
```

实际draw calls/首屏JS、EN/ZH标签是否遮挡或出屏、两套theme、触控目标、手机抽屉、动态减少、深链与E返回组装态仍待浏览器确认。只测得静态几何97,586三角形，不能用它推断GPU帧率。没有部署、提交或推送。

### 9.4 浏览器验收（2026-10-27，Claude Opus，合并 main 至 4773f2b 之后）

- 看过的截图：`--beats` en/zh × paper/cinema 共 160 张（presentation 1920×1080）、en-paper `--layout` 8 个尺寸（含 1024×768、390×844，布局问题 0）、`--keys` en-paper 与 zh-cinema（按键失败 0）、`--perf --gpu`（Metal）。beat links 4 组都是 40/40。zh-cinema 的 `--layout` 在机器负载约 180–260 时截图超时，未完成。
- 读得通的：眼球剖面（角膜在前、虹膜中间是孔、晶状体在后、视网膜内衬、视神经出后方）；01 章 2 → 4 mm 内孔变化肉眼可见；耳部链路从左到右是外耳道 → 鼓膜 → 锤骨 → 砧骨 → 镫骨 → 卵圆窗 → 耳蜗，听骨三块相连；05 章信号点从毛细胞区走向听神经；两套主题都正常着色。正文的光路、调节、听骨、毛细胞、频率/振幅和照护措辞核对无误，照护部分具体、不吓人（补了一句：光线强时瞳孔变小、暗时变大，S2/S24）。
- 读不通的（退回 Codex，见主题 `FIXES.md`）：光学台在统一 `cmToScene` 下倒像（远物像高 0.006 场景单位）和偏焦散斑（0.0028）都看不见，两物点光线同色；没有对准光学台的镜头；纵波疏密只有 ±8%，粒子行在画面底边；毛细胞放大窗挡在耳部前面，没有可见的比例边界；6/40（en）与 2/40（zh）张拍图舞台偶发空白，拍次每轮不同；手机竖屏总览只看到眼。
- 性能（Metal，负载很高时）：各章 draw calls 10–24、三角 4.4k–67k、45–64 fps；预算 <80 calls、≤350k 三角，均在内。page JS 516 KB gz 是全站 SpaceScene 共有的，不是本题新增。
- 回归：light-and-shadows、sample-light `--beats --keys` 拍与键全过；`sun-shadows` 等章节标签不在屏的提示在 main 基线上同样出现（负载造成），不是本分支引入。sample-senses `--beats --keys` 全过。
- 门槛：check 0 error；validate 70 题 0 error；test 4,952 例中 1 例 CPU 时间预算（fill.test）在负载下超时，单跑通过；build 143 页。smoke 的计数冲突按指示取 main 的数，未把本题算进去。
- e2e（端口 5446，eyes-and-ears、sample-senses、smoke、light-and-shadows、sample-light，workers=2）：47 例中 33 过、14 败；单独重跑后只剩 smoke 的 4 例首页计数（取 main 的数，实际多 1 题），其余为负载超时或下面两处测试写错。修了两处没跑过的测试：手机拍步进——章节打开时停在拍前（BEAT –/5），按一次"下一拍"进入 b=1 而不是 b=2；sample-senses 的 seek 定位先等相位读数变成 .25 再比较。

### 9.5 F1–F6 返工（2026-10-27，Claude Opus，worktree `codex/eyes`，合并 main 至 6708b62）

主题 `FIXES.md` 六项与两项顺带全部完成；引擎改动都是可选字段或通用补丁，light-and-shadows / sample-light 的数据与渲染路径不变。

- **F1 光学台**：`paraxial-eye` 新增可选 `yScale`（有限，1–40，默认 1）与 `pointColors: [token, token]`（只收 `token:`）。本题 `yScale: 20`、`origin [-1,-2.4,1.3]`（台整体移到眼下方，不与眼包络重叠）；只放大高度，距离仍按 `cmToScene .06`，`solveSenses` / `effectiveEyeRays` 与全部读数不变（单测证明）。上点 `token:ray-top`（琥珀）、下点 `token:ray-bottom`（青），两套主题都定义（`tests/theme/ray-point-tokens.test.ts`：ΔE ≥ 40、离 signal ≥ 15、对底色 ≥ 3:1），光线逐顶点着色仍一次绘制，物点标记零件用同一 token，且大小不同（不靠颜色也能分）。接收面光斑改为与几何模糊同宽的圆斑（×yScale），聚焦时为可见小点；接收面加高到 ±.45、透镜画成可见的薄片。披露：舞台在接收面上方写「VERTICAL ×20 · SCHEMATIC / 竖向放大 ×20 · 示意」和两色图例（`hud/SensesStageLabel.tsx`），PLATE 加一行，物点上/下与接收面三条详情和 spec 行写明。02 章保持 far/far：放大后倒像上下分开、颜色分得清，不需要改用 near/near（不偏离 §5.0）。
- **F2 镜头**：`focus-bench` 重新对准光学台（眼在上、台在下，整台在作者镜头内；hudFrame 只拟合作者镜头里看得到的主体），02 章与 03.1–03.4、01.5 用它；02.2、02.4–02.5、03.5 用 eye。开启 `views.hudFrame`（巩膜、物点上下、接收面、耳廓、耳蜗、基底膜条、毛细胞、信号点、粒子参照）。
- **F3 纵波**：`baseDisplacementScene` .0125 → .035（schema 固定值、两份 parts.json、oracles、单测、e2e、本稿 §1.4/§4.1/§4.3/§4.4、docs/06 同步）；250 Hz/振幅1 疏密约 ±22%，最坏 2πA/λ = .88 < 1 仍不交叉。粒子半径 .013（`WAVE_PARTICLE_RADIUS`，偏离 §4.3「≤ .008」，为可读性），刻度与基线移到粒子下方、参考刻度加粗，粒子参照零件两端加端桩（框住整行）。`wave` 镜头以粒子行为主体、耳在上方；06 章隐藏咽鼓管与平衡结构。
- **F4 放大窗**：窗移到耳蜗右下方 `[3.15,-1.3,.35]`，信号点移到条带右端，信号路径改走窗右侧上到听神经。新增通用 `views.insets`（≤4；HUD 发丝虚线框 + 标签，跟随所列零件的屏幕框，不写放大倍数；`lib/insets.ts` + `hud/InsetFrames.tsx`，单测），本题标「放大示意·非同一比例」。`cochlea` 镜头同时框住耳蜗与放大窗；07.3 不再隐藏基底膜条，细胞体可见。
- **F5 空白舞台**：查明是 shoot 时序，不是 senses 驱动竞态。每拍 shoot 先回 HUD（舞台 1520×1023）再进演示（1920×1080），画布改尺寸清空 WebGL 缓冲；软件 GL 重负载下一帧可要数秒，1.5 s 固定等待后的截图落在清空与重绘之间。用 8× CPU 节流复现（`before-you-start-1`：画布 1520×1023、标签在、无模型）。修复：`SceneStats.lastFrame`（SpaceScene 最后一帧时刻）；shoot 用 MutationObserver 记下画布尺寸改写，截图前等到改尺寸后的新帧（超时记拍失败）；e2e 断言演示改尺寸后一定有新帧。另修 hudFrame 拟合读 R3F 实时尺寸（改尺寸后紧跟的一帧早于 CameraRig 重渲染）。
- **F6 竖屏总览**：`freeStageRect` 在叠放竖屏（宽高比 < 0.8）只让横跨中线的上下面板收窄自由区，左上角标题块不再把模型挤进右侧窄列（单测）；390×844 的 00/07 总览两个工位都入画（e2e）。
- **顺带**：视网膜改为等厚平滑球冠衬层，巩膜剖面平滑，切面不再呈折线；视网膜、角膜 arc 改为 178°，切面在保留侧，标签不再被剖切藏掉（原 01/02/03 的 retina、cornea「无标签」提示）。耳廓改为平滑外缘 + 卷起的耳轮 + 对耳轮（不再是八边形厚片）。

- **补**：睫状环 arc 210 → 178（03.3 的 ciliary-ring 标签同样被剖切藏掉）；hudFrame 再列 cornea、auditory-nerve，竖屏总览眼前缘与听神经不切边。

浏览器验收（软件 GL，机器负载约 50–100；`--gpu` 为 Metal）：
- `pnpm shoot eyes-and-ears --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`：4 组各 40/40 拍、beat links 40/40、chapter highlights 全在屏、key / layout / beat 失败 0、console clean；160 张拍图空白 0（自检脚本按舞台区像素方差判断）。逐张看过光学台（01.5、02.1、02.3、03.1–03.4）、纵波（06 全章）、耳与放大窗（04.5、05 全章、07.3）：倒像上下分开、两色可辨、偏焦为圆斑而聚焦为小点、接收面上方有竖向放大说明；疏密清楚；放大窗在耳蜗右下方，有虚线边框与「放大示意·非同一比例」，不挡中耳。唯一的拍提示为 03.3 的 ciliary-ring（已按上条修，探针确认锚点在屏）。
- `--size 390x844 --beats`（en-paper）：40/40，演示模式竖屏不画引线标注（引擎既有行为，各题一致）；光学台、纵波行、放大窗都在字幕卡上方；00/07 总览两个工位都入画（HUD 模式下图层卡默认展开会盖住耳部，收起即见）。
- 回归：sample-senses、light-and-shadows（41）、sample-light（25）`--beats --keys` 拍与键失败 0，beat links 全过。
- `--perf --gpu`：各章 draw calls 10–23、三角 1.2 万–7.0 万、40–60 fps（负载下）；page JS 532 KB gz 为全站 SpaceScene 共有。
- e2e（端口 5446，workers=2）：eyes-and-ears 16（新增 F1/F2/F5、F3/F4、F6 三例）、sample-senses 7、sun-earth-moon 10（hudFrame 改动回归）全过；light-and-shadows 全过；smoke 4 例首页计数按指示取 main 的数（实际多本题 1 个），由主会话合并时改。
