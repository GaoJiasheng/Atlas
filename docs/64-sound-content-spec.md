# 64 · Sound · 声音 · 内容施工 spec（v1）（`sound`，SpaceScene + 试一试）

2026-10-29 定稿。**上线状态：published**，按本次用户指令施工；浏览器验收明确留给主会话。§0 采用供 Gavin 后续审读的默认决定，不阻塞施工。本文件基于本轮先完成的 `sound-research.md`、`facts.json`、`datasets.json`，它们就是parent dossier；没有拆分兄弟主题，按本次任务要求省略§0.0。研究原有49个fact id沿用，不另造一份“父事实”；无新增拆分事实，因此无需空的facts-extra.json。

结构对齐docs/40与41：决定→课纲与范围→事实→对象与零件→引擎→逐章节拍→名词与来源→图像→验收→施工记录。EN默认，ZH独立简体写作；paper默认、cinema可切。**8章：背景00 + 正文01–07，32拍**。字幕按本次用户授权定稿，后续 Gavin 可审读。所有方程/读数标SIM或DESIGN，不伪装为实测。[R01–R03,SIM01–SIM05]

## 0. 决定与建议默认值

| ID | 决定 | 建议默认值与理由 | 状态 |
|---|---|---|---|
| D01 | 对象与原型 | 一张五工位声学实验台，Model3DStage；通用模型研究，无品牌/型号；非耳部解剖台。[F01–F03,R01] | 本轮默认 |
| D02 | 学习目标 | 能指出振动源、介质、接收处；分开音调/响度；解释回声来回路径；识别乐器振动部分；实践听力保护。[F01–F27] | 本轮默认 |
| D03 | 年级与课程 | P2可看现象，P6可接声能；标“拓展”，不称整个主题为PSLE独立必考声学单元。[C01–C03] | 本轮默认 |
| D04 | 复用 | `sim.kind:senses`、`longitudinalPositions`、`longitudinal-wave` overlay与现有try-it/记录/预测；链接eyes-and-ears。[R01–R03] | 本轮默认 |
| D05 | 声音播放 | 全课静音模型，无自动声音、听力测试、麦克风或音量权限；只靠图与字完成全部学习目标。[S1] | 本轮默认 |
| D06 | 常数 | 波条沿用250/500Hz、相对振幅1/2、250倍慢放；传播表用340/1500/5000m/s，后者为特定虚拟固体DESIGN；回声10倍慢放。[SIM01–SIM04] | 本轮默认 |
| D07 | 试一试 | 四个非评分实验卡：介质、频率、振幅、回声距离；乐器通过同一频率控制选择预设。每卡默认一次只改变一个因素。[C02,SIM01–SIM03] | 本轮默认 |
| D08 | 健康数字 | 主线只给降低音量、减少时间、远离/护耳/求助；儿童设备参考模式仅细看带出处，不做安全计时器。[F23–F28] | 本轮默认 |
| D09 | 地图与预取 | 无地图/TimeScene；B不适用，预取0/0bytes。新加坡只作有来源的生活例子。[F29–F32] | 本轮默认 |
| D10 | 许可 | 本稿、独立方程实现、原创PNG属Atlas BY-NC-SA4.0；本次没有BY-SA/ODbL输入衍生文件。将来按族分文件及carve-out。[datasets.json] | 本轮默认 |
| D11 | 图片 | 新作音叉封面、单膜鼓面、单弦实验器；检查现有eyes-and-ears素材后决定不复用，避免范围回到耳或眼。[SIM05] | 采用已备图 |

### 0.1 标题块与可见说明

- Title：**Sound / 声音**；Subtitle：**Vibrations, travelling disturbances and echoes / 振动、传播与回声**。[F01–F18]
- Note EN：“Classroom model study · silent · vibration and distance are schematic · the air-wave strip is slowed 250 times; the echo pulse 10 times · not a sound meter or hearing test.”
- Note ZH：“课堂模型研究 · 静音 · 振动与距离是示意 · 空气纵波慢放250倍，回声脉冲慢放10倍 · 不是声级计或听力测试。”[SIM01–SIM05]
- 两个慢放说明按当前工位出现，不把回声10倍与纵波250倍混成同一时钟。解释“声波”与“空气粒子”：点表示介质中的局部位置，不是声音颗粒。[F04–F06]

### 0.2 本轮复用审计与默认处理

已读取 main 当前工作树的 docs/06、src/engines、docs/58 与 eyes-and-ears；并按 brief 对 codex/monsoon-engine、codex/sem-engine、codex/airfoil-content、codex/dinosaur、codex/plates 执行只读 git log 与 git show。前四支在本工作树 main 已合入（main.. 分支无独有提交）；plates 尚有 reference layers / catalogue / impact records 提交，但均属 TimeScene，与声学无关。climate.ts、orbit-rotation.ts、how-planes-fly/data/parts.json、deep-time.ts、plates/schema.ts 均核读；没有可复用的 sound-only、nullable 声传播或 echo pulse。

| 草稿项目 | 本轮裁决 |
|---|---|
| 纵波公式、41 点实例化、250 倍慢放 | 复用 senses / longitudinalPositions / longitudinal-wave，不另造 solver 或 sim.kind |
| 眼耳解剖、光线叠图 | 不复制；链接已发布 eyes-and-ears |
| source-drive 可见性、振幅预设、短长弦桥、介质外观 | 复用 enabled / visible / pose；只新增必要的派生 state，不增绑定种类 |
| medium-view state | 删除新增 state：直接用现有 control 条件即可 |
| 记录、预测、表格图、HUD、URL、RUN / EXPLODED | 复用原机制；nullable 只作最小贯穿扩展 |
| E-SO1 | 保留 sound-only profile、共用相位、作者拍快照；现有 senses 强制眼配置，不能用假眼字段绕过 |
| E-SO2 | 保留独立纯函数、固定教学介质表、nullable 时间与实验族隔离 |
| E-SO3 | 保留单次往返 envelope overlay，与空气纵波区分时钟 |

没有未合并分支依赖。默认静音、虚拟均匀固体 DESIGN 5000 m/s、非声级计、非听力测试、不做混响/吸收系数、不复制 WHO 时长表。课程只称拓展，MOE 缓存页证不冒充本次直播取得。来源证据降级、中文术语编辑采用、不可直读来源不支撑核心结论。无第三方派生资产，无需新增许可例外。

## 1. 课纲对照与范围

### 1.1 可证课程接口

| 来源 | 页码与短引 | 本主题用法 |
|---|---|---|
| C01 / MOE2023 | 印p80 / PDF81：“Sound energy” | P6 Standard Energy Conversion的声能例子；F01–F22为课外声学深化 |
| C02 / MOE2023 | 印p15 / PDF16：“Recognise a fair” | 公平比较频率/振幅；词组短引不把多栏表错拼为长句 |
| C03 / MOE2023 | 印p16 / PDF17：“Use senses,” | 观察与设备；本课静音，视觉也能参与 |
| S25 / MOE2020 SS | 官方链接机器人验证；无可核页码 | 不作SS必修声学归属；本地例子由NEA/SSO独立支持 |

页级核验与缓存SHA见syllabus-verification.json。仅引用缓存版，不声称当日直播PDF已下载成功。[C01–C03]

### 1.2 相邻主题与链接

`eyes-and-ears`（published，docs/58）承接“接收处怎样变成听觉”，00与07 `<TopicLink>`到该主题，不重复耳廓、听小骨、耳蜗、毛细胞图解。[R01]
`states-of-matter`、`materials`（published）在02链接；`energy-conversion`（published）在00与06链接供能链；`heat`（published）在速度条件细看链接；`light-and-shadows`（published）在02细看只比较传播条件。精确章节id由施工时读对应frontmatter确认，不捏造路由。[topic-status-snapshot.json,C01,F02–F03,F13]

### 1.3 范围边界与预测

核心是“源—介质—接收处”和三组公平比较；不展开耳部结构、傅里叶谱、分贝换算、Doppler、声阻抗、房间混响求解。音色只细看解释不同乐器可有不同声音，不让“是否规则”决定音乐/噪音的价值。[F01–F22,F33,R01]

研究支持的预测：粒子会不会旅行到接收端、声音是否被当作材料、波是否一定上下摆。[M01–M04] “大声必然高音”“回声单程”是原创教学风险探查，不标成有统计证据的儿童误解。Predict-first可跳过、无分数、不限制阅读。[S1]

## 2. 事实表、设计值与验算


| Fact id | Claim / constraint | Source |
|---|---|---|
| C01 | The Primary Science syllabus names sound energy in P6 Standard Energy Conversion, not a standalone sound unit. | S2 |
| C02 | Fair-test skills provide a syllabus connection for changing one variable while holding others constant. | S2 |
| C03 | Gathering observations with senses and equipment is a syllabus practice. | S2 |
| F01 | A vibrating source can produce a sound disturbance in surrounding matter. | S5 |
| F02 | Mechanical sound transmission requires matter; a vacuum does not transmit the sound wave. | S3 |
| F03 | Sound can travel through solids, liquids and gases. | S3 |
| F04 | In longitudinal sound in air, local motion is parallel to propagation. | S3 |
| F05 | Medium particles oscillate around equilibrium; the travelling pattern is not a parcel of air going from source to listener. | S3 |
| F06 | Sound in air involves alternating compression and rarefaction. | S5 |
| F07 | Frequency counts repetitions per second; hertz is the unit. | S4 |
| F08 | For simple tones, higher frequency corresponds to higher pitch. | S6 |
| F09 | Amplitude is the maximum displacement from equilibrium. | S4 |
| F10 | For comparable conditions, greater sound-wave amplitude gives greater intensity and generally greater perceived loudness. | S6 |
| F11 | Wave speed equals frequency times wavelength. | S5 |
| F12 | At fixed medium conditions, raising frequency shortens wavelength rather than making sound travel faster. | S5 |
| F13 | Sound speed depends on medium and conditions. | S5 |
| F14 | NOAA uses approximate comparison speeds of 340 m/s in air and 1500 m/s in water. | S16 |
| F15 | OpenStax gives 343 m/s for air at 20°C and 331 m/s at 0°C. | S24 |
| F16 | An active-sonar echo is reflected sound returning from an object. | S17 |
| F17 | A source and receiver at the same point can use return time and sound speed to infer reflector distance; the path is out and back. | S17 |
| F18 | A longer out-and-back path takes longer at the same sound speed. | S17 |
| F19 | Resonance is a strong response when the driving frequency matches the natural frequency. | S7 |
| F20 | Shortening the vibrating length of a string raises its pitch when other relevant conditions are held constant. | S5 |
| F21 | Wind-instrument pitch can be changed by changing the effective resonating air-column length. | S7 |
| F22 | Instrument bodies and resonating air help couple string vibration to the surrounding air. | S7 |
| F23 | A single loud impulse or sustained loud exposure can damage hearing. | S13 |
| F24 | Noise-related hearing loss can be temporary or permanent and may not be obvious immediately. | S13 |
| F25 | Reducing level, limiting exposure time, moving away and using hearing protection in noisy places are protective actions. | S10 |
| F26 | Persistent ringing or difficulty following conversations warrants professional attention. | S10 |
| F27 | The WHO–ITU personal-audio standard offers an adult reference mode of 80 dB for 40 hours per week and a child mode of 75 dB for 40 hours per week. | S11 |
| F28 | The Chinese WHO safe-listening FAQ has inconsistent 90 dB weekly durations: 12.5 hours in one paragraph and four hours in its later paragraph/table. | S12 |
| F29 | NEA construction-noise controls use levels with specified averaging intervals and affected-building categories. | S14 |
| F30 | NEA describes monitoring near noise-sensitive premises and stricter night-time limits, with specific exceptions to work restrictions. | S15 |
| F31 | The Singapore Symphony Orchestra lists strings, wind instruments, timpani and percussion. | S18 |
| F32 | A Singapore school Chinese orchestra lists instruments including dizi, sheng, suona, pipa, yangqin and erhu. | S19 |
| F33 | Chinese teaching material attests 音调、响度、音色 and 频率 as sound vocabulary. | S20 |
| F34 | Singapore Chinese usage attests 噪音 and 听力损失 in local reporting. | S21 |
| M01 | Veith’s primary-school study used 24 interviews and found several ways of experiencing sound, including substance-like interpretations. | S8 |
| M02 | Some children in that study described sound as an invisible material or fluid that could be moved around. | S8 |
| M03 | Children’s use of “wave” in that study could refer to transverse hand movements/drawings, without a mechanical-medium model. | S8 |
| M04 | The preschool study reports reasoning that sound is an entity travelling through a hose and can be trapped when it is squeezed. | S9 |
| R01 | The published eyes-and-ears topic already teaches ear anatomy and includes a longitudinal-wave overlay. | S23 |
| R02 | Before this build, the senses solver required both eye and sound configurations and seven fixed controls. | S22 |
| R03 | The current wave uses 41 particles, rest spacing0.05, frequency250/500 Hz, amplitude1/2 and slowdown250. | S22 |
| SIM01 | At250/500 Hz the reused wave displays1/2 Hz, wavelength1/0.5 scene units, and maximum displacement0.035/0.07 for amplitudes1/2. | S1 |
| SIM02 | A uniform340 m/s air model with reflector distances17,34,68 m has echo returns0.1,0.2,0.4 s. | S1 |
| SIM03 | For a34 m path, using teaching speeds340 m/s in air,1500 m/s in water and5000 m/s in a chosen solid gives one-way times0.1,0.0226666667,0.0068 s. | S1 |
| SIM04 | Particle ordering is preserved in the permitted wave domain because maximum2πA/λ is about0.879646, below1. | S1 |
| SIM05 | The static monochord and membrane art show structural specimens, not measured frequencies or a calculated membrane mode. | S1 |

### 2.1 TYPICAL / DESIGN / SIM

| 量 | 分类 | 数值与用途 | 禁止误读 |
|---|---|---|---|
| 空气/水声速 | TYPICAL约值 | NOAA比较约340/1500m/s；选入课堂常数表。[F14] | 不是当日新加坡空气/某水池实测 |
| 固体声速 | DESIGN | 虚拟均匀solid-example，5000m/s。[SIM03] | 不标“所有固体”；不作只按密度的排名 |
| 波条长度 | DESIGN | 41点，spacing0.05u，总静止长度2u。[R03] | u是场景单位，不等于米 |
| 频率 | DESIGN | 250、500Hz，独立于响度控制。[R03] | 不声称静音设备正在输出这些声音 |
| 振幅 | DESIGN | 1×、2×的相对位移；最大位移0.035/0.07u。[SIM01] | 不是dB，不是线性“听起来两倍响” |
| 实际/显示频率 | SIM | 250→1Hz；500→2Hz。[SIM01] | 慢放250倍，不是原频变低 |
| 回声距离 | DESIGN | 17、34、68m，为源/接收点到墙的单程距离。[SIM02] | 桌面缩尺，不当实际桌长 |
| 回声返回 | SIM | 0.1、0.2、0.4s；画面1、2、4s。[SIM02] | 不承诺人耳一定能区分每个延迟 |

解析验算：λscene=250/f；A=.035a；xᵢ=.05i+A sin[2π(.05i/λ−phase)]；极端2πA/λ=.879645943<1，点序保持。[SIM01,SIM04] 独立验算存 `model-oracles.json`。这些是准备稿oracle，不是已实现引擎的通过报告。

来源冲突处理：340与343来自取整/温度条件，本文统一SIM340；WHO中文FAQ的90dB时长内部不同，保留F28研究记录，主线不复制时长表。WHO儿童75dB与成人80dB设备模式分开；NEA环境Leq不当个人剂量限值。[F14–F15,F27–F30]

## 3. 对象、分组、零件与数据计划

### 3.1 五工位与尺度

场景单位u，Y向上、+Z朝观者。台面设计包络x±3.2、z±1.8、y=.65。工位沿前排左→右是source(-2,.8,.8)、wave(-.9,.8,.8)、echo(1.5,.8,.8)；后排instruments(-1.4,.8,-.8)、care(1.7,.8,-.8)。不是实测物件的数字孪生。各工位局部镜头，尽量不通过长跨台移动解释过程。[S1,SIM05]

| 区 | group id | EN / ZH | 可选中零件 | 图层规则 |
|---|---|---|---|---|
| 01 | sources | Sources / 声源 | fork, fork-marker, drum-shell, drumhead, drum-marker | 静止结构+单独示意运动点 |
| 02 | transmission | Medium / 介质 | source-driver, air-cell, water-cell, solid-bar, receiver, wave-reference | 四种介质互斥；粒子仅air |
| 03 | reflection | Echo / 回声 | pulse-emitter, reflector-near, reflector-mid, reflector-far, echo-receiver | 三面墙互斥；实距离标签由同一distance控制 |
| 04 | instruments | Instruments / 乐器 | monochord-box, monochord-string, bridge-long, bridge-short, pipe, pipe-open-end | 弦长预设对应250/500频率；pipe只示意 |
| 05 | care | Hearing care / 听力保护 | speaker-case, hearing-protector | 近/远只是预设位置，无dB读数 |

共24个可选中parts，台面/基座/两端锚点/固定桥为context，不计入分区；41点由overlay实例化，不造41个part。5 个实物工位外增加现有机制可表达的独立 `air-wave` 图层（card:false），专管纵波显示；共 6 个 group。这样照护章能显示 transmission.receiver 而关闭纵波，不新增引擎控制或重复接收件。[S1,R03]

### 3.2 几何与可见事实

| part / primitive plan | 外观与连接 | 运动/爆炸/参考 |
|---|---|---|
| fork / extrude U轮廓+圆柱柄 | 两条等长平行叉臂，连成单一U底与一个柄，无多余叉臂。[SIM05] | 主体不作刚体“振动”；fork-marker小点在一臂局部往复，标“放大位移示意” |
| drum-shell / annular extrude | 开底框鼓、单层薄膜，前部可切开看到空腔。[SIM05] | 膜保持结构参考，drum-marker指示中央局部位移，不能整片平移充作真实振型 |
| source-driver / cylinder+diaphragm | 声源驱动面与支架连续，近air-cell边界。[F01,S1] | 三种有介质时同一源；真空只断开气体传播，不关闭声源 |
| air-cell,water-cell / thin box shell | 两个互斥示意槽，water只画薄静止液面。[F03,S1] | 不画空气经水面化成水流；不复制air overlay为水分子模型 |
| solid-bar / box | 连续固体横杆，接触驱动端与receiver。[F03,S1] | 接收状态定性，不表现真实衰减或模式 |
| receiver / thin disc | 通用接收面，不画耳朵。[S1,R01] | 用state描边/详情显示transmitted/no-medium，非计时后触发的传感器实测 |
| wave-reference / rest tick | 高亮第5号点及静止刻度。[R03] | 本地往复，不从左走到右；overlay count41/spacing.05保持 |
| reflector-* / three alternate planes | 三面墙都在场景x=emit+1.0/1.4/2.2u，分别代表17/34/68m。[SIM02,S1] | 只启用一个；距离映射非统一比例尺，必须标签示意 |
| pulse-emitter,echo-receiver / paired marker discs | 共址但错开少量z防z-fighting。[S1,F17] | 计算按共址，画面错开不改变路程；pulse只是包络标记 |
| monochord-box / hollow box+one hole | 单弦、两支撑点、两端锚定；bridge-long/short互斥。[F20,F22,SIM05] | 短预设有效弦长一半是DESIGN；不拿尺的长度平方律当弦律 |
| monochord-string / tube/span | 一根连续弦，支撑两端之间有有效段，锚段保留。[SIM05] | 主体静止，振动由示意标记/同一wave显示；无假造实测张力 |
| pipe / tube + open-end ring | 一根两端开口管，空气柱为示意区。[F21] | 不用水瓶加水混淆敲瓶和吹瓶；不展示未求解的节点/腹部 |
| speaker-case,hearing-protector | 无品牌通用轮廓。[S1] | care相机选择与两预设pose，不表现音量计 |

每个part summary首句说明功能，EN≤60字符、ZH短句；detail写结构→作用→示意限制+fact/source。所有被正文/拍提到的对象进本章index。禁止浮动耳骨、品牌铭牌、不可解释的装饰几何。[S1,R01]

### 3.3 流、动画与绑定

- **flows[]默认空**：不用从源走到接收端的“空气流”冒充波；连续声波只复用longitudinal-wave，回声用E-SO3包络。[F05–F06,R03]
- `source-point`、`drum-point`为oscillate局部示意，几何不整体平移；共读`visual-hz`的hz binding。控制改动后的相位与overlay保持同一个phase，不能让点和波慢慢失锁；已有hz binding存在0.5s缓动，声学profile须加snap策略，见E-SO1。[R03,SIM01]
- 频率`250/500`同时控制`bridge-long/short`的visible预设；振幅不动弦长或frequency。门控用现有visible/pose/enabled，字段按现有schema真实类型写。点的位移幅度采用两套互斥固定振幅animation，active/amplitude通过新派生state `source-drive`选择；无需新的连续位移binding，见§4。[SIM01,S1]
- EXPLODED仅用于静态辨认，任何实际runtime explode>0全部运动停、overlay隐藏。回到实际0后恢复；章/拍reset不遗留隐藏件或phase。[R03,S1]

### 3.4 预算与显示

目标可见draw calls<60，运转<70，绝对上限100；三角形目标<100k，上限300k；41点一次instancing，echo一个包络标记一次绘制。没有外部GLB/录音/视频。关HUD舞台仍能解释台架的结构，两套主题token一致；不靠颜色单独编码结果。[S1,R03]

五个镜头：hero([6,4,7]→[0,.8,0])、source([-1.5,2.2,3.4]→[-2,.9,.7])、wave([0,1.8,3.8]→[0,.9,.8])、echo([3.8,2.6,4.6]→[1.5,.9,.8])、instruments([-1.2,2.6,3]→[-1.4,1,-.8])；care复用hero的小范围crop由章节camera给出。fov35°为DESIGN起点，施工按参考截图调。labels每拍≤4、触控命中≥44px。[S1]

## 4. 引擎契约

### 4.0 已查代码与复用清单

读过 `src/engines/space-scene/senses-schema.ts`、`lib/sim/senses.ts`、`stages/model3d/SensesOverlays.tsx`、`sim-schema.ts`相关分支，及docs/06 §senses。现在eye与sound都必填，七控制固定；overlay的count41/spacing.05与domain限制已存在。不能通过填假眼睛字段来宣称“零引擎工作”。以下是本轮保留的最小实现契约。[R02–R03]

### 4.1 E-SO1 · sound-only profile与相位一致性（必须，最小兼容改动）

**字段**：`sim.senses.profile?: 'eye-and-sound' | 'sound-only'`，缺省=`eye-and-sound`。前者保持现有eye、sound及七控制要求，原eyes-and-ears/sample-senses字节无需修改。后者要求sound、禁止eye、禁止eye-only controls/outputs/paraxial-eye overlay。`sound`的固定字段、控制ID、域、默认值完全沿用：[R02–R03]

```json
{"profile":"sound-only","sound":{"active":"sound-active","frequencyHz":"frequency-hz","amplitude":"amplitude","slowFactor":250,"baseFrequencyHz":250,"baseWavelengthScene":1,"baseDisplacementScene":0.035,"sources":["S3","S5","S1"]}}
```

控制仍为sound-active toggle defaulttrue；frequency-hz step[250,500] default250；amplitude step[1,2] default1。source IDs必须跨文件存在；不收额外配置/未知字段/非有限数/错误kind。sound-only有且只计算声音输出，不访问effectiveEyeRays；eye source核验、debug、stage labels与PLATE都按profile分支。[R02,SIM01]

**新增state输出**：`source-drive = off | amplitude-one | amplitude-two`；active=false→off，否则由amplitude选状态。固定词表+双语label，与`sim.senses.sound`来源绑定。两套固定幅度marker animation用enabled eq state控制；跨输出比较不能把numeric条件写成state。active=false将marker归静止点；`run=false`则冻结当前帧，保留非零静态幅度读数，二者文字必须不同。[S1,SIM01]

**已有绑定的声学snap策略**：声学profile里，绑定`visual-hz`的marker动画与wave共用phaseCycles，而不是各自平滑积分。频率/幅度/active变化、章/拍snapKey变化都相位归0；seek同时影响wave和marker。不要改变其它sim.kind的hz缓动语义；可通过声学绑定在SensesOverlay bridge注册同源phase，或仅声学局部renderer执行，不能复制纵波公式。[R03,S1]

**新增章/拍快照字段**：SpaceScene chapter/beat state新增可选 `sensesFrame: {waveCycles?: number, echoProgress?: number}`（strict，至少一个key）。waveCycles有限且0..1；echoProgress有限且0..1。仅有senses sim可用；echoProgress要求sound-only、soundLab与sound-echo-pulse overlay均存在。未知字段、负值、NaN、>1拒绝。缺省时沿用现有snap归零语义；进入某拍先从章基线构造完整状态，再应用该拍快照，不继承上一拍的快照。用于本稿：01-04 waveCycles=.25；03-03 waveCycles=.25；05-01 echoProgress=0、05-02 echoProgress=0、05-03 echoProgress=1、05-04 echoProgress=0。所有其它拍默认0。[S1]

快照在进入章/拍、URL恢复、presentation跳拍后各应用一次：先更新controls和可见性、再重置phase、再读取sensesFrame、最后决定是否RUN推进。run=false保留该相位；run=true从该相位继续。reduced-motion不推进，显示作者快照；没有显式快照则phase0。`sensesSeek`/`sensesEchoSeek`仍只是测试API，不作为发布内容数据。URL仍只存ch/b/controls，快照由同一beat数据解析，不能靠测试API拼出深链接画面。legacy主题没有此字段，现有行为不变。[S1,R03]

**输出**：保留visual-hz,wavelength-scene,displacement-max,amplitude-level,sound-state，加入source-drive。输出名称/单位按§2；无dB与“实际响度”。sound-state是驱动启用状态，不等于RUN播放状态。QA扩展`engine.senses()`返回`profile, wave, sourceMarkers, soundLab?`；sound-only时eye明确undefined，不能留下上次主题眼信息。[R02–R03,S1]

**验收数字**：250,1,active=true→(visualHz1,λ1,A.035,drive amplitude-one)；500,2→(2,.5,.07,amplitude-two)；active=false→(0,.5,0,off)。phase0第5点rest.25：250,a1→.285；500,a2→.25；phase.25在rest0→−.07（500,a2）。最大2πA/λ=.879645943。全8组合与legacy128组合均须过；非法frequency0/1000、amplitude3、slowFactor1、count40、spacing.1、axis[2,0,0]拒绝。[SIM01,SIM04]

### 4.2 E-SO2 · 传播与回声数值模块（必须）

仍属`sim.kind:senses`，新增`sim.senses.soundLab?`，只允许profile=sound-only。没有此配置时legacy输出与行为完全不变。配置：[F02–F03,F13–F18,SIM02–SIM03]

```json
{"medium":"medium","distanceM":"distance-m","speedMps":{"air":340,"water":1500,"solid-example":5000},"sources":["S3","S16","S17","S1"]}
```

- medium必须是choice，options恰好`air,water,solid-example,vacuum`，default air；distance-m必须step[17,34,68]，default34。数值正、有限；speedMps须恰好上述三个key和固定教学值；vacuum不能给0速度，也不能给它一个很大的传播时间。
- 控制作用范围：frequency/amplitude只改变波条；medium只改传播判定与时间；distance是反射面的单程距离。三个试验互不污染。frequency/amplitude不能改speedMps。
- 新纯函数`solveSoundLab(config, values)`：读取medium、distance、sound-active。`propagation-state = no-medium | source-off | transmitted`，优先级vacuum→no-medium，其余active=false→source-off，否则transmitted。`speed-mps`在非真空返回对应常数，不依赖source-active；真空返回null。`one-way-ms=1000d/c`、`echo-ms=2000d/c`仅transmitted时返回数值，否则null。未启用源没有声波的旅行事件，不给“0毫秒”。[F02,F17,SIM03]
- **新输出的null契约必须贯穿**：只有这三个quantity允许`number|null`，schema quantity映射需显式声明nullable；其它数值输出仍finite-number。PLATE/记录表把null显示为“无传播 / No transmission”，unit不附在空值后；图表跳过null点，不插值跨no-medium/source-off；CSV（若有）为空格并保留propagation-state列。try-it观察到nullable quantity时validator强制同时observe propagation-state；predict不拿null当0评分。nullable输出禁止用于pose/hz/rpm/intensity绑定，防NaN；只可作读数。源速度null还必须observe medium。URL只存control，不能序列化null输出。缓存记录结构允许null，legacy记录解析不受影响。
- `sensesExperiment(from)`新增实验族`transmission`（speed-mps,one-way-ms,propagation-state）和`echo`（echo-ms）；transmission可vary medium、distance-m、sound-active；echo只vary distance-m，预设air+active=true。与旧sound族拆开，避免现有validate错误允许眼控制或新控制串卡。[R02,S1]
- 新state`medium-view = air | water | solid-example | vacuum`（值=medium），用于可见性；若直接control条件已经可用，无需增加该state到持久数据。receiver只显示定性传递标记，不动画为精确到达时刻；数值是解析比较，不是传感器实测。[S1]

**绑定**：air-cell/water-cell/solid-bar分别visible eq medium；vacuum时三者隐藏、source保持可见。longitudinal-wave 归独立 `air-wave` 图层，加现有 `when:{control:'medium',is:'air'}` 且 SensesOverlay 内部仍检查 active。solid/water不画空气粒子。receiver状态切换使用propagation-state的三个固定pose或现有state outline，仅用相等条件；不把nullable时间接到动画。[F02–F06,S1]

**回归期望**：distance34：air→speed340,oneWay100ms,echo200ms；water→1500,22.666666667ms,45.333333333ms；solid-example→5000,6.8ms,13.6ms；vacuum→三个null，source-drive仍amplitude-one；air+active=false→speed340、两个时间null、source-off。输出未圆整值供求解，UI oneWay/echo decimals1或3，不让四舍五入数回流到方程。[SIM02–SIM03]

### 4.3 E-SO3 · out-and-back pulse overlay（必须）

新增overlay kind=`sound-echo-pulse`；仅sound-only+soundLab可用，模型标识`model:'echo'`；字段严格对象：`group:kebab-id`、`origin:vec3`、`axis:unit vec3`、`visualDistancesScene:{near:1,mid:1.4,far:2.2}`、`slowFactor:10`、`reference:'distance-m'`、`sources:S#[]`。引用同一distance控制和soundLab的echo-ms，不另写速度/距离；有限向量，axis长度误差≤1e-9。只支持17→near、34→mid、68→far的固定映射，未知距离拒绝。颜色用token:en-sound，图例称“脉冲位置示意”，不是空气粒子。[S1,SIM02]

输入几何只用于示意位置，数值时间由物理距离计算。elapsedVisual在RUN、当前card echo/章节05、group可见、medium=air、active=true、assembled且实际explode=0时推进；其它条件冻结或隐藏，hiddenReason必须可读。章节/拍、medium/distance/active变化归零，按snapKey重置。每次演示一个往返：Tvisual=(echo-ms/1000)×10；u=clamp(elapsedVisual/Tvisual,0,1)；s=2u（u≤.5），s=2(1−u)（u>.5）；position=origin+axis×visualDistance×s。phase=.5时在墙，1时回源并hold；再次RUN由完成态重新从0开始，不加独立播放器。暂停再RUN从原位继续；reduced-motion用当前拍的显式phase0/.5/1，数值仍全显示。[F17–F18,SIM02]

测试专用`engine.sensesEchoSeek(u)`只收有限0..1，保持到下一次RUN/输入改变；`engine.senses().soundLab.echo`返回elapsedVisual,u,pathPosition,atReturn,playing,hiddenReason,physicalEchoMs,slowFactor。echo RUN时空气连续wave隐藏，防一屏两个不同慢放误导。EXPLODED隐藏pulse且冻结phase；退出到实际0才能继续。层不可见时不requestAnimationFrame，静止/hold不继续调度。[S1]

期望：distance34，visualD1.4，Tvisual2s；elapsed0/.5/1/1.5/2s→path0/.7/1.4/.7/0u；physicalEchoMs总为200。distance68→Tvisual4s，elapsed2s在far墙2.2u。没有往返间“声音掉头的新声源”，只是反射包络的示意。[SIM02,F16]

### 4.4 卡片、HUD、数据边界

| 卡 id | vary / fixed | observe | 记录/预测 |
|---|---|---|---|
| medium-test | medium；distance34,active=true | propagation-state,speed-mps,one-way-ms | 预测solid会否传递；可跳过；记录保留medium与state |
| frequency-test | frequency-hz；amplitude1,active=true,mediumair | visual-hz,wavelength-scene,sound-state | 250/500比较，实际频率在control label，图例披露慢放 |
| amplitude-test | amplitude；frequency250,active=true,mediumair | displacement-max,amplitude-level,sound-state | 1/2对比；不生成dB |
| echo-distance-test | distance-m；mediumair,active=true | echo-ms,propagation-state | 17/34/68比较；预测距离增大返回晚 |

frequency/amplitude图在现有try-it表图里，不新开底部时轴。声速/时间在PLATE，读数最多6行且按卡过滤；numeric输出不能宣称当前RUN关闭就没有理论频率。底部只章轴，点拍不自动播，所有操作有按钮和触控。章头→节拍行→try-it→选中详情→正文→索引遵守docs/08，不重画HUD。[R03,S1]

### 4.5 无新增工作项目

无新的sim.kind、无耳部/乐器复杂网格、无真实音频、无麦克风、无地理图层或fetch。E-SO1–3 是本轮新增项；只有 §9 的实际门槛记录可表示实现验收。[S1]

## 5. 章节与逐拍字幕（EN / ZH）

### 5.0 状态规则

每章基线都完全声明：assembled、explode0、cutaway none、hide=[]、run=false、sound-active=true、frequency250、amplitude1、mediumair、distance34；只启用本章groups。每拍相对章基线重放，其表内数值**是该拍完整control覆盖**，不累积上一拍的控制。`run`由拍表明确；enter/snap复位相位，手动点拍、演示、URL深链接同态。labels≤4；具体camera用§3预设。care不启用任何sim overlay。[S1]

### 5.1 第00章 `00-before-you-start` · 从声源到接收处 / From source to receiver

**作者的儿童问题**：声音是从哪里开始的？（页面标题不用问句）。

**Summary EN / ZH**：From source to receiver through visible model comparisons. / 用可见的模型对比说明从声源到接收处。

**正文提纲与细看**：声能在课程中的位置；静音也能读完本课；眼耳分工与主题链接。 事实锚：F01, F02, R01。

**状态**：groups=`sources,transmission,air-wave`；镜头第一拍见表；隐去其他工位可选中件，context台面保留。**试一试**：frequency-test只在后续03出现；00无try-it。

| Beat id | 镜头 / run | 完整controls：f / a / medium / distance | labels | Caption EN | 字幕ZH | Fact ids |
|---|---|---|---|---|---|---|
| 00-01 | hero / false | 250 / 1 / air / 34；active=true | fork, receiver | The bench follows a vibrating source, a medium and a receiver. No sound is played. | 实验台把声源、介质和接收处连起来。本课不播放声音。 | F01,F02,SIM05 |
| 00-02 | source / true | 250 / 1 / air / 34；active=true | fork, fork-marker | The small marker moves beside one fork arm. Its exaggerated motion represents local vibration. | 叉臂旁的小点来回移动。这是放大的局部振动示意。 | F01,SIM05 |
| 00-03 | wave / true | 250 / 1 / air / 34；active=true | wave-reference, receiver | The air markers move around rest positions as the pattern travels along the strip. | 空气示意点在静止位置附近往复，疏密图样沿条带传开。 | F04,F05,F06 |
| 00-04 | hero / false | 250 / 1 / air / 34；active=true | receiver | The receiver marks the end of this model. Follow the Eyes and Ears link to explore hearing. | 接收处是本模型的终点。听觉怎样形成，可接着看《眼睛与耳朵》。 | R01,SIM05 |

**本章索引**：`parts: [fork, fork-marker, receiver, wave-reference]`。所有本章labels均在索引，身体耳部对象不进入索引。[S1,R01]

### 5.2 第01章 `01-vibrating-sources` · 看得见的振动 / Visible vibration

**作者的儿童问题**：发声的东西在动吗？（页面标题不用问句）。

**Summary EN / ZH**：Visible vibration through visible model comparisons. / 用可见的模型对比说明看得见的振动。

**正文提纲与细看**：模型的小点与真实部件不同；暂停和关闭驱动的区别；实物活动只用柔软敲击物，由成人安排。 事实锚：F01, F09, SIM05。

**状态**：groups=`sources`；镜头第一拍见表；隐去其他工位可选中件，context台面保留。**试一试**：无独立卡；source-active 开关放在 02 的传播卡；本章不新增卡，正文明确指向下一章比较，不演示真实撞击衰减。

| Beat id | 镜头 / run | 完整controls：f / a / medium / distance | labels | Caption EN | 字幕ZH | Fact ids |
|---|---|---|---|---|---|---|
| 01-01 | source / false | 250 / 1 / air / 34；active=true | fork, drumhead | Locate the two fork arms and the single drumhead before starting the motion model. | 先找到音叉的两臂和鼓的一层鼓面，再开始看运动示意。 | F01,SIM05 |
| 01-02 | source / true | 250 / 1 / air / 34；active=true | fork-marker, fork | The marker traces back-and-forth vibration. The fork shape remains a structural reference. | 小点示意来回振动。音叉本体保留静止外形，供我们辨认结构。 | F01,SIM05 |
| 01-03 | source / true | 250 / 1 / air / 34；active=true | drum-marker, drumhead | A second marker traces local motion at the drumhead centre. This is not a calculated membrane mode. | 另一个小点示意鼓面中央的局部运动。画面没有计算鼓面的真实振型。 | SIM05 |
| 01-04 | source / false | 250 / 1 / air / 34；active=true | fork-marker, drum-marker | Pause freezes the model at one instant. Switching the source off instead returns its markers to rest. | 暂停把画面停在一个瞬间。关闭声源则让示意点回到静止位置。 | SIM01,SIM05 |

**本章索引**：`parts: [fork, fork-marker, drumhead, drum-marker]`。所有本章labels均在索引，身体耳部对象不进入索引。[S1,R01]

**04拍补充**：原始暂停示例由前一RUN现场停下；深链接到本拍使用确定相位.25。关闭声源是 02 传播卡的独立 source-active 操作，将 active=false 而不是 run=false；本拍只先说明差异，正文指向下一章的实际开关。[S1,SIM01]

### 5.3 第02章 `02-a-medium-to-travel` · 传播需要介质 / A medium to travel through

**作者的儿童问题**：隔着桌面或水还能传声吗？（页面标题不用问句）。

**Summary EN / ZH**：A medium to travel through through visible model comparisons. / 用可见的模型对比说明传播需要介质。

**正文提纲与细看**：固液气不等于同速；真空中残余气体/支架路径的限制；不使用未经许可的噪音地图。 事实锚：F02, F03, F13, SIM03。

**状态**：groups=`transmission,air-wave`；镜头第一拍见表；隐去其他工位可选中件，context台面保留。**试一试**：medium-test，vary medium，record true；保持frequency250/amplitude1/distance34。

| Beat id | 镜头 / run | 完整controls：f / a / medium / distance | labels | Caption EN | 字幕ZH | Fact ids |
|---|---|---|---|---|---|---|
| 02-01 | wave / false | 250 / 1 / air / 34；active=true | source-driver, receiver | Predict whether the same disturbance can pass through air, water or a solid. | 先预测：同样的扰动能否经过空气、水和固体传到接收处。 | F03,M04 |
| 02-02 | wave / true | 250 / 1 / water / 34；active=true | water-cell, receiver | The water station has a transmission path. Its time reading uses a stated teaching speed. | 水槽工位有传播路径。时间读数使用已注明的课堂声速约值。 | F03,F14,SIM03 |
| 02-03 | wave / true | 250 / 1 / solid-example / 34；active=true | solid-bar, receiver | The solid bar also provides a path. This example has one chosen material speed, not a rule for all solids. | 固体横杆也能提供传播路径。本例采用一个设计声速，不能代表所有固体。 | F03,SIM03 |
| 02-04 | wave / true | 250 / 1 / vacuum / 34；active=true | source-driver, receiver | In this ideal vacuum gap the source stays active, but there is no medium to carry its sound wave. | 在这个理想真空间隙里，声源仍启用，但没有介质传播声波。 | F02,SIM03 |

**本章索引**：`parts: [source-driver, air-cell, water-cell, solid-bar, receiver]`。所有本章labels均在索引，身体耳部对象不进入索引。[S1,R01]

**04拍补充**：理想真空不是实际抽气设备的定量结果；source-marker仍运动，receiver显示无传播，三个nullable读数不显示0。[F02,SIM03]

### 5.4 第03章 `03-pitch-and-frequency` · 音高与频率 / Pitch and frequency

**作者的儿童问题**：高音是不是振得更大？（页面标题不用问句）。

**Summary EN / ZH**：Pitch and frequency through visible model comparisons. / 用可见的模型对比说明音高与频率。

**正文提纲与细看**：一秒次数定义；250倍慢放；图上的λscene与实际米不同；质点不旅行。 事实锚：F04, F05, F07, F08, F11, F12, SIM01。

**状态**：groups=`transmission,air-wave`；镜头第一拍见表；隐去其他工位可选中件，context台面保留。**试一试**：frequency-test，vary frequency-hz，also=[]；可选预测后记录。

| Beat id | 镜头 / run | 完整controls：f / a / medium / distance | labels | Caption EN | 字幕ZH | Fact ids |
|---|---|---|---|---|---|---|
| 03-01 | wave / true | 250 / 1 / air / 34；active=true | wave-reference | At the lower frequency setting, the silent strip displays one cycle per second after slowing the motion. | 频率较低的设定下，静音条带慢放后每秒显示一次循环。 | F07,SIM01 |
| 03-02 | wave / true | 500 / 1 / air / 34；active=true | wave-reference | Changing only frequency gives two displayed cycles per second. The relative amplitude stays the same. | 只改变频率，画面每秒显示两次循环。相对振幅保持相同。 | F08,SIM01 |
| 03-03 | wave / true | 500 / 1 / air / 34；active=true | wave-reference, receiver | The highlighted marker stays near its own rest tick. It does not travel to the receiver. | 被标记的点始终在自己的刻度附近往复，没有走到接收处。 | F05,M02,M03 |
| 03-04 | wave / true | 500 / 1 / air / 34；active=true | wave-reference | The pattern has a shorter wavelength at the higher frequency. This does not make sound faster in unchanged air. | 较高频率对应较短波长。这不表示声音在相同空气条件下传播得更快。 | F11,F12,SIM01 |

**本章索引**：`parts: [wave-reference, receiver]`。所有本章labels均在索引，身体耳部对象不进入索引。[S1,R01]

**03拍补充**：camera相同，设置相位.25的静止参照特写以看清点没有走远；非reduced-motion仍可RUN。04拍打开已有wavelength-scene记录行，波段短读数与画面一致。[SIM01,S1]

### 5.5 第04章 `04-loudness-and-amplitude` · 响度与振幅 / Loudness and amplitude

**作者的儿童问题**：用力一些会改变什么？（页面标题不用问句）。

**Summary EN / ZH**：Loudness and amplitude through visible model comparisons. / 用可见的模型对比说明响度与振幅。

**正文提纲与细看**：位移最大幅度；感知响度非线性、受频率/听者影响；不从设备百分比估分贝。 事实锚：F09, F10, SIM01。

**状态**：groups=`transmission,air-wave`；镜头第一拍见表；隐去其他工位可选中件，context台面保留。**试一试**：amplitude-test，vary amplitude；固定250Hz；不同时开放frequency。

| Beat id | 镜头 / run | 完整controls：f / a / medium / distance | labels | Caption EN | 字幕ZH | Fact ids |
|---|---|---|---|---|---|---|
| 04-01 | wave / true | 250 / 1 / air / 34；active=true | wave-reference | Keep frequency fixed. Predict what changes when the relative displacement amplitude increases. | 先固定频率，再预测：相对位移振幅增大时，什么会改变。 | F09,F10 |
| 04-02 | wave / true | 250 / 2 / air / 34；active=true | wave-reference | The markers move farther from their rest ticks. The displayed cycle rate remains one per second. | 示意点离静止刻度更远，但画面仍每秒循环一次。 | F09,SIM01 |
| 04-03 | wave / true | 250 / 1 / air / 34；active=true | wave-reference | Returning to the smaller amplitude reduces displacement without changing the frequency setting. | 调回较小振幅，往复位移缩小，频率设定没有改变。 | F09,F10,SIM01 |
| 04-04 | wave / false | 250 / 2 / air / 34；active=true | wave-reference | These are relative motion settings. The model does not measure decibels or promise twice the perceived loudness. | 这些是相对位移设定。模型不测分贝，也不表示听起来恰好大声两倍。 | F10,SIM01 |

**本章索引**：`parts: [wave-reference]`。所有本章labels均在索引，身体耳部对象不进入索引。[S1,R01]

### 5.6 第05章 `05-returning-sound` · 回来的声音 / Returning sound

**作者的儿童问题**：为什么回声晚一点回来？（页面标题不用问句）。

**Summary EN / ZH**：Returning sound through visible model comparisons. / 用可见的模型对比说明回来的声音。

**正文提纲与细看**：来回路程的除以二；声呐原理仅细看；现实中反射/吸收/房间影响未计算，不宣称某时差必可听。 事实锚：F16, F17, F18, SIM02。

**状态**：groups=`reflection`；镜头第一拍见表；隐去其他工位可选中件，context台面保留。**试一试**：echo-distance-test，vary distance-m；图表横轴单程距离m，纵轴echo-ms。

| Beat id | 镜头 / run | 完整controls：f / a / medium / distance | labels | Caption EN | 字幕ZH | Fact ids |
|---|---|---|---|---|---|---|
| 05-01 | echo / false | 250 / 1 / air / 34；active=true | pulse-emitter, reflector-mid | The emitter and receiver share one position. The reflector is thirty-four metres away in the model. | 发射处和接收处共址。在这个模型中，反射面离它们三十四米。 | F16,F17,SIM02 |
| 05-02 | echo / true | 250 / 1 / air / 34；active=true | pulse-emitter, reflector-mid | A pulse marker travels to the reflector and returns. The moving marker represents the pulse position, not travelling air. | 脉冲标记先到反射面，再返回。移动的是脉冲位置示意，不是一路迁移的空气。 | F05,F16,SIM02 |
| 05-03 | echo / false | 250 / 1 / air / 34；active=true | echo-receiver, reflector-mid | The model calculates two tenths of a second for the round trip. The display takes two seconds because it is slowed. | 模型算出来回需要零点二秒。画面慢放后，这段往返显示为两秒。 | F17,SIM02 |
| 05-04 | echo / true | 250 / 1 / air / 68；active=true | reflector-far, echo-receiver | Moving the reflector farther away doubles the return time in this fixed-speed example. | 把反射面移到更远的预设位置，在这个固定声速例子里，返回时间加倍。 | F18,SIM02 |

**本章索引**：`parts: [pulse-emitter, reflector-near, reflector-mid, reflector-far, echo-receiver]`。所有本章labels均在索引，身体耳部对象不进入索引。[S1,R01]

**相位快照（sensesFrame.echoProgress）**：01 u=0；02 RUN从0；03 paused u=1显示已返回；04 RUN从0，distance68。运行过程可暂停，不能把2s显示时长标签写成物理时长。[SIM02]

### 5.7 第06章 `06-musical-instruments` · 乐器里的振动 / Vibration in instruments

**作者的儿童问题**：弦、鼓面、空气柱有什么相同？（页面标题不用问句）。

**Summary EN / ZH**：Vibration in instruments through visible model comparisons. / 用可见的模型对比说明乐器里的振动。

**正文提纲与细看**：乐器发声不只看外形；发声体/共鸣的分工；SSO与本地学校例子；不画真实仪器频谱。 事实锚：F20, F21, F22, F31, F32, SIM05。

**状态**：groups=`instruments,sources`；镜头第一拍见表；隐去其他工位可选中件，context台面保留。**试一试**：不重复增加第五张卡；两种弦长由本章拍预设与同一个 frequency-hz 值绑定，正文链接 03 的 frequency-test 继续比较，不得额外独立改变弦长造成矛盾。

| Beat id | 镜头 / run | 完整controls：f / a / medium / distance | labels | Caption EN | 字幕ZH | Fact ids |
|---|---|---|---|---|---|---|
| 06-01 | instruments / false | 250 / 1 / air / 34；active=true | monochord-string, drumhead, pipe | The three specimens focus on a stretched string, a drumhead and a resonating air column. | 三件标本分别展示绷紧的弦、鼓面和产生共振的空气柱。 | F20,F21,F22,SIM05 |
| 06-02 | instruments / true | 500 / 1 / air / 34；active=true | monochord-string, bridge-short | The shorter-string preset represents a higher frequency, with other string conditions held constant. | 短弦预设表示较高频率；比较时，弦的其他条件保持相同。 | F20,SIM05 |
| 06-03 | instruments / false | 250 / 1 / air / 34；active=true | pipe, pipe-open-end | Wind instruments can change pitch by changing the effective resonating air-column length. This tube is a simple structure study. | 管乐器可以改变有效共振空气柱的长度来改变音调。这根管只作简化结构参考。 | F21 |
| 06-04 | instruments / false | 250 / 1 / air / 34；active=true | monochord-box, drumhead, pipe | Singapore ensembles use many kinds of instruments. Follow the sources to compare their vibrating parts. | 新加坡的乐团使用多种乐器。可从来源链接继续比较它们的振动部分。 | F31,F32,SIM05 |

**本章索引**：`parts: [monochord-box, monochord-string, bridge-long, bridge-short, drumhead, pipe, pipe-open-end]`。所有本章labels均在索引，身体耳部对象不进入索引。[S1,R01]

**局部状态**：01只显示bridge-long；02只显示bridge-short，show-marker且run=true；03/04回bridge-long。索引drumhead保留说明，从sources图层只显drum-shell/drumhead；隐藏fork等所有无关件。[S1,SIM05]

### 5.8 第07章 `07-noise-and-hearing-care` · 噪音与听力保护 / Noise and hearing care

**作者的儿童问题**：喜欢的声音也可能伤听力吗？（页面标题不用问句）。

**Summary EN / ZH**：Noise and hearing care through visible model comparisons. / 用可见的模型对比说明噪音与听力保护。

**正文提纲与细看**：WHO儿童/成人设备参考模式有别；NEA的Leq与个人暴露不同；中文FAQ差异仅研究记录；听力差异与静音可达性。 事实锚：F23, F24, F25, F26, F27, F29, F30。

**状态**：groups=`care,transmission`（不含 air-wave）；仅保留 care 与 receiver，hide 列表明确隐藏 transmission 的其他物件与驱动支架；镜头第一拍见表。**试一试**：无try-it风险评分、听音测试或剂量倒计时；仅普通阅读与场景选中。

| Beat id | 镜头 / run | 完整controls：f / a / medium / distance | labels | Caption EN | 字幕ZH | Fact ids |
|---|---|---|---|---|---|---|
| 07-01 | hero / false | 250 / 1 / air / 34；active=true | speaker-case | Very loud bursts and prolonged loud sound can harm hearing. Enjoying the sound does not remove that risk. | 突然的强声和持续过久的高声都可能损害听力。喜欢这种声音，也不能消除风险。 | F23,F24 |
| 07-02 | hero / false | 250 / 1 / air / 34；active=true | speaker-case | Use a lower level, limit listening time and move away from loud sources. The scene has no exposure meter. | 调低音量、限制听声时间，并远离巨大声源。画面没有暴露量计。 | F25,SIM05 |
| 07-03 | hero / false | 250 / 1 / air / 34；active=true | hearing-protector | Quiet breaks and suitable hearing protection are useful actions in noisy places. Local construction rules are a different kind of limit. | 在嘈杂场所，可到安静处休息，并使用合适的护耳用品。本地施工规则的限值属于另一类管理指标。 | F25,F29,F30 |
| 07-04 | hero / false | 250 / 1 / air / 34；active=true | receiver | If ringing persists or conversations become hard to follow, tell a trusted adult and seek professional help. The hearing topic explains the receiving system. | 若持续耳鸣或难以听清对话，应告诉可信的成人，并寻求专业帮助。听觉结构可接着看《眼睛与耳朵》。 | F26,R01 |

**本章索引**：`parts: [speaker-case, hearing-protector, receiver]`。所有本章labels均在索引，身体耳部对象不进入索引。[S1,R01]

**姿态快照**：01 speaker默认；02使用普通pose把speaker移远；03突出hearing-protector；04选receiver（通用符号）并显示TopicLink。隐藏所有波/脉冲/marker。[S1,F25,R01]


### 5.9 URL、回放与边界

每个chapter/beat有唯一kebab id（表中数字是审稿号，施工id用`source-overview`等kebab串）；32拍表明确列出全部输入。URL含ch,b与sim controls，输出由求解器重算。进入03/04强制mediumair，进入05强制mediumair/active=true；从真空卡点到03不残留vacuum。predict-first答案不改变事实或阻塞阅读；记录保留当时control副本，改当前输入不改历史行。[S1]

06的乐器短弦预设只是固定频率配套形状，不计算张力/线密度；既有frequency控制与geometry用同一值，不能出现短弦形状而读数250。鼓面不从marker位移推断实际振型；波条不沿桌架任意拐弯。[F20,SIM05]

## 6. 名词表与来源

### 6.1 正文名词表（16项）

术语库73项在facts.json；实际正文只首现包Term。补核 S31：香港教育局《中学物理科常用英汉辞汇》(2020) 的 amplitude、frequency、hertz、longitudinal wave、loudness、pitch、resonance、wavelength，采用简体编辑字形；pitch 统一沿既有 eyes-and-ears 名词表的“音高”，首现说明亦称音调。不是 MOE 官方中文词表或新加坡词形认证。PDF 的网页文本已读取；截图服务 cache miss，本地下载不完整，未伪称已目视原页，不分发原 PDF。

| id | EN / ZH | 定义与fact | 词形证据 |
|---|---|---|---|
| vibration | Vibration / 振动 | 在静止位置附近重复运动。[F01,F09] | S27简体原文；非SG用法认证 |
| source | Sound source / 声源（正文写发声的物体） | 产生扰动的振动物体。[F01] | S12 attests音源；S27声源；本地词形待核 |
| medium | Medium / 介质 | 传播机械声波的物质。[F02–F03] | S27 |
| vacuum | Vacuum / 真空 | 没有物质的理想空间；本模型无声波路径。[F02] | S27 |
| sound-wave | Sound wave / 声波 | 在介质中传播的扰动。[F01–F06] | S20 |
| longitudinal | Longitudinal wave / 纵波 | 局部运动沿传播方向。[F04] | S31 縱波；简体采用纵波 |
| frequency | Frequency / 频率 | 每秒重复的次数。[F07] | S20 |
| hertz | Hertz / 赫兹 | 每秒一次的频率单位。[F07] | S31 词形已核；简体编辑采用 |
| pitch | Pitch / 音高 | 听起来高或低；简单音与频率有关。[F08] | S20 |
| amplitude | Amplitude / 振幅 | 离静止位置最大的位移。[F09] | S28索引词形；PDF超时 |
| loudness | Loudness / 响度 | 声音大或小的听觉感受。[F10] | S20、S31；不能直接定义成声强 |
| wavelength | Wavelength / 波长 | 相邻同相位置之间的距离。[F11] | S31 词形已核；简体编辑采用 |
| echo | Echo / 回声 | 反射后返回的声音。[F16] | S30索引词形；原页超时 |
| resonance | Resonance / 共振 | 在接近固有频率的驱动下响应较强。[F19] | S31 共振；细看使用 |
| noise | Noise / 噪音 | 生活中不想听到、妨碍活动的声音；有害风险另看暴露。[F23,F29] | S21新加坡标题/索引 |
| hearing-care | Hearing care / 听力保护 | 降低音量、时间暴露，远离声源并适当护耳。[F25–F26] | S12词汇；组合为编辑用语 |

### 6.2 来源表（S#供施工映射）

下表是本地研究源id，不自动等于未来发布sources.json编号；S1保留为自描述设计研究，逐事实映射后再定最终编号。full-text、index-only、blocked分别标注，不冒称全读。

| ID | Title / publisher | URL | Locator / access | Licence / use |
|---|---|---|---|---|
| S1 | Atlas sound classroom design study — Atlas | spec-draft.md#4-引擎契约 | Fixed schematic bench; equations and regression oracles; local-original | Atlas CC BY-NC-SA 4.0 |
| S2 | Science (Primary) Syllabus 2023, cached January 2026 edition — Singapore MOE | https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf | Cached PDF: printed pp.15–16,80; see syllabus-verification.json; cached-full-text; live endpoint robot verification | OFFICIAL (OPEN) classification is not a reuse licence |
| S3 | 13.1 Types of Waves — OpenStax | https://openstax.org/books/physics/pages/13-1-types-of-waves | Mechanical Waves; Longitudinal Waves; full-text | CC BY 4.0; individual image credits may differ |
| S4 | 13.2 Wave Properties — OpenStax | https://openstax.org/books/physics/pages/13-2-wave-properties-speed-amplitude-frequency-and-period | Wave Variables; full-text | CC BY 4.0; individual image credits may differ |
| S5 | 14.1 Speed of Sound, Frequency, and Wavelength — OpenStax | https://openstax.org/books/physics/pages/14-1-speed-of-sound-frequency-and-wavelength | Properties; relationship v=fλ; teacher string example; full-text | CC BY 4.0; individual image credits may differ |
| S6 | 14.2 Sound Intensity and Sound Level — OpenStax | https://openstax.org/books/physics/pages/14-2-sound-intensity-and-sound-level | Amplitude, Loudness and Energy; eqs.14.6–14.7; full-text | CC BY 4.0; individual image credits may differ |
| S7 | 14.4 Sound Interference and Resonance — OpenStax | https://openstax.org/books/physics/pages/14-4-sound-interference-and-resonance | Resonance; wind instruments; teacher support on sounding boxes; full-text | CC BY 4.0; individual image credits may differ |
| S8 | What’s the Matter with Sound? How Primary School Students Perceive the Nature of Sound — Sonja Isabel Veith / Research in Science Education | https://link.springer.com/article/10.1007/s11165-023-10108-7 | Abstract; Literature Review; Results Tables 2–3; Discussion; full-text | CC BY 4.0 (article open-access licence) |
| S9 | Preschool Children’s Reasoning about Sound from an Inferential-Representational Approach — Rico et al. / Education Sciences | https://www.mdpi.com/2227-7102/11/4/180 | Interpretation of hose experiment; search-index text only; direct fetch HTTP 429 | CC BY 4.0 |
| S10 | Deafness and hearing loss: Safe listening — WHO | https://www.who.int/news-room/questions-and-answers/item/deafness-and-hearing-loss-safe-listening | Protecting hearing; signs and listening duration; full-text | Web reference only; publication-specific WHO licences must be checked |
| S11 | Safe listening devices and systems: a WHO-ITU standard — WHO / ITU | https://www.who.int/publications/i/item/9789241515276 | Recommendations: modes 1 and 2; full-text | Reference landing page; downloadable publication licence not assumed |
| S12 | 耳聋和听力损失：听力安全 — WHO | https://www.who.int/zh/news-room/questions-and-answers/item/deafness-and-hearing-loss-safe-listening | 2026-03-06; protection paragraph; listening-time table; full-text | Reference only; Chinese terminology attestation |
| S13 | Noise-Induced Hearing Loss — NIH NIDCD | https://www.nidcd.nih.gov/health/noise-induced-hearing-loss | Causes; prevention; damage can be temporary or permanent; full-text | US federal text; check third-party media separately |
| S14 | Construction Noise Control — Singapore NEA | https://www.nea.gov.sg/our-services/pollution-control/noise-pollution/construction-noise-control | Maximum permissible levels; Leq definition; full-text | Reference only; no dataset licence established |
| S15 | Frequently Asked Questions: Construction Noise — Singapore NEA | https://www.nea.gov.sg/our-services/pollution-control/noise-pollution/construction-noise-control/frequently-asked-questions-%28faqs%29 | Questions 2–4; exceptions; full-text | Reference only; no dataset licence established |
| S16 | How far does sound travel in the ocean? — NOAA National Ocean Service | https://oceanservice.noaa.gov/facts/sound.html | Speed comparison; temperature and pressure; full-text | US federal public-domain text; third-party credits excluded |
| S17 | What is sonar? — NOAA National Ocean Service | https://oceanservice.noaa.gov/facts/sonar.html | Active Sonar; updated 2026-09-23; full-text | US federal public-domain text; third-party video excluded |
| S18 | The Orchestra — Singapore Symphony Orchestra | https://www.sso.org.sg/about/singapore-symphony-orchestra/the-orchestra | Instrument sections list; full-text | Reference only; photographs not licensed for reuse |
| S19 | Chinese Orchestra — Bedok South Secondary School, MOE | https://www.bedoksouthsec.moe.edu.sg/cca/performing-arts/chinese-orchestra/ | Instrument list; search-index text | Reference only |
| S20 | 音频编辑：声音三要素 — Guangdong education platform / course author | https://web.gdep.edu.cn/skills/portal/blob?key=10174758 | PDF page 5, headings 音调、响度、音色; full-text | Reference only; no redistribution licence established |
| S21 | 噪音可诱发听力损失 年轻人勿充耳不闻 — 联合早报 | https://www.zaobao.com.sg/lifestyle/health/story20240409-3270185?ai-allowed=1 | Title and search-index excerpt; 2024-04-09; search-index text; direct page unavailable | All rights reserved; terminology reference only |
| S22 | SpaceScene senses implementation and contract — Atlas | ../../../src/engines/space-scene/lib/sim/senses.ts | senses-schema.ts; SensesOverlays.tsx; docs/06 lines2442–2464; local-code-read | Local code licence; original content CC BY-NC-SA 4.0 |
| S23 | Eyes and Ears content spec and published topic — Atlas | ../../../docs/58-eyes-and-ears-content-spec.md | Existing longitudinal overlay; topic.yaml published; local-content-read | Atlas CC BY-NC-SA 4.0 |
| S24 | 17.2 Speed of Sound — OpenStax | https://openstax.org/books/university-physics-volume-1/pages/17-2-speed-of-sound | Table17.1; air 20°C example; search-index text | CC BY 4.0 |
| S25 | 2020 Social Studies Primary Syllabus — Singapore MOE | https://www.moe.gov.sg/-/media/files/primary/2020-social-studies-primary.pdf | Live endpoint robot verification; no syllabus page claim; blocked; no bypass | Reference only |
| S26 | Smithsonian Open Access highlights — Smithsonian Institution | https://avpreservation.si.edu/spotlight/openaccesshighlights | Item-level CC0 marking is required; search-index text; catalogue candidate only | CC0 only on marked items |
| S27 | 在宇宙中声音会传播吗？ — 中国载人航天工程办公室 | https://www.cmse.gov.cn/kpjy/tkkt/tstk/201412/t20141219_37245.html | 2014-12-19, main answer; terminology only; full-text | Reference only; no redistribution |
| S28 | 音叉受迫振动规律及计算机实时测量 — 大学物理 / 北京师范大学期刊平台 | https://dxwl.bnu.edu.cn/CN/article/downloadArticleFile.do?attachType=PDF&id=3656 | Title and section3.1 音叉振幅; terminology only; search-index text; direct PDF timeout | Reference only |
| S29 | 演奏家：乐器分部 — 新加坡华乐团 Singapore Chinese Orchestra | https://sco.com.sg/zh/about-us/musicians/ | Chinese instrument headings and biographies, not current personnel claims; full-text | All rights reserved; terminology reference only |
| S30 | 声速与传播条件：科普文章 — 中国科学院兰州文献情报中心 | https://www.llas.cas.cn/kxcb/kpwz/201508/t20150813_301115.html | Indexed paragraph with 固体、液体、气体、回声; terminology only; search-index text; direct page timeout | Reference only |

### 6.3 许可与数据产物

| 拟建产物 | 输入/派生关系 | 许可族与动作 |
|---|---|---|
| parts/captions/glossary | 原创程序化结构与独立事实转述 | Atlas BY-NC-SA4.0；S#出处不省略 |
| soundLab常数/独立方程 | 数值事实、原创建模选择与解析式 | Atlas BY-NC-SA4.0；NOAA/开放文本署名；不复制出版图 |
| 3 PNG及后续WebP | 原创imagegen，无外部参考输入 | Atlas BY-NC-SA4.0；manifest保存prompt/checks/hash |
| 外部BY-SA/ODbL/ODC-BY文件 | 本轮无 | 没有需carve-out的已选文件；如以后采用，单列derived family并改LICENSE-CONTENT |
| WHO IGO原文件 / NEA/SSO图片 | 只列来源或拒用，不打包 | 禁止因网页可访问就视为可复制资产 |

不用重复下载“父dossier”：本稿的parent就是本轮sound-research.md；无兄弟拆分也无新facts-extra。B不适用说明见prefetch-not-required.md。[datasets.json]

补核来源 S31：香港教育局，2020《中学物理科常用英汉辞汇》，https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/ref-and-resources/PhyGlossary_2020.pdf 。只作词形参考，不复制图表或分发 PDF；不是课程归属证据。

## 7. 图像计划与准确性审查

| 文件 | Kind / size | Chapter | 需要核对的结构 |
|---|---|---|---|
| sound.png | cover1024×1024 | 00 | 单一音叉、两臂、一个U底、一个柄；无声波形状冒充实体 |
| sound-drum-membrane.png | figure1536×1152 | 01/06 | 一层完整薄膜、开底木壳、前部切开、单个软头槌；空腔非实心 |
| sound-monochord.png | figure1536×1152 | 06 | 一根连续弦、两端锚定、两琴码支撑、单箱单孔；静态结构图非振动相位 |

全部为透明中性石墨图版，等RGB；无字/数/标签/箭头/背景/边框/纸纹/地影。约85%画布占用且留边。不能凭美观豁免部件数与连接核对。原始生成图与导出PNG都检查，manifest逐图记录tries/checks；image-qa.json记录尺寸、alpha、灰度、SHA。复用审查D08与reuse-audit.json：眼耳三张图都不适合；另查materials-flexible-ruler，其manifest描述的是石块压弯尺的静载结构，与本稿单弦/鼓面机制不同。全目录文件名/manifest已筛选，不为凑“复用”而重复耳部结构或改变机制。[SIM05]

## 8. 施工顺序与验收

顺序：本轮授权定稿→E-SO1兼容profile→E-SO2纯函数/nullable显示→E-SO3脉冲→引擎夹具与非浏览器门槛→几何→双语正文与全部节拍→非浏览器验收。依 BRIEF，shoot/e2e 与视觉/GPU/手机验收明确留给主会话，端口 5452；不打开用户浏览器或桌面。[S1]

### 8.1 内容验收

- [ ] 8章32拍，EN/ZH全部有字幕，每条正文事实能回指本dossier事实id与原始来源；所有数字按TYPICAL/DESIGN/SIM分类。
- [ ] 00/07的eyes-and-ears链接有效，耳部解剖未重复；adjacent状态在施工时重新读topic.yaml。[R01]
- [ ] 同频不同幅、同幅不同频两组比较均可见，图中粒子不走向接收端。[F05,F08,F10]
- [ ] 理想真空保留声源，传播值显示无传播；水/固体无误用空气波条。[F02–F06]
- [ ] 回声显示完整来回路程，物理200ms与显示2s不混写。[SIM02]
- [ ] 音乐可同样有损伤风险；不把NEA法规限值当儿童安全线、不显示声级计或听力测试。[F23–F30]
- [ ] 未核中文词在发布前用权威词源确认或改通俗解释；index-only来源不得升级为全文已读。
- [ ] 所有许可边界/署名齐全，无BY-SA与BY-NC-SA同文件派生混合。[datasets.json]

### 8.2 引擎验收（施工时）

- [ ] E-SO1 legacy128组合输出不变；sound-only8组合含三项非法域拒绝；不存在眼工位/眼输出残留。[R02–R03]
- [ ] wave公式/静止刻度/marker共享phase，输入snap与URL点拍一致；极端组合不交叉。[SIM01,SIM04]
- [ ] E-SO2 medium×distance×active24组合按方程自证；null无0ms、无NaN、无跨断点折线，记录含state。[SIM02–SIM03]
- [ ] E-SO3所有距离的源/墙/返回端点准确，pause/resume、completed RUN、seek、换拍、拆开、实际重新组装到0、图层隐藏、reduced-motion全部测。
- [ ] `pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`按repo门槛执行；shoot/e2e 按 BRIEF 跳过并记录，更新docs/06属于本次已授权引擎施工。
- [ ] `pnpm shoot sound --keys --layout --beats`后逐图审查32拍、paper/cinema、桌面/iPad/手机，labels均可见、无边界裁切或空WebGL画布。
- [ ] 离线打包、无runtime外部请求、触控44px、读数与纸/暗主题对比、纯视觉可完成全部卡片。

### 8.3 本轮准备验收

由verify-preparation.py检查JSON结构、fact引用、章拍计数、图像尺寸/灰度/透明/边距、SHA与oracle。输出validation.json。它只验证准备交付物，不能替代§8.2的应用运行测试。

## 9. 施工记录

### 9.1 引擎施工（2026-10-29）

已实现 E-SO1–3：sound-only 兼容 profile、source-drive、固定 soundLab 与三种 nullable 读数、transmission/echo 实验族、作者 sensesFrame、共享声学相位与单次回声包络。复用既有 longitudinalPositions / longitudinal-wave，不新增 sim.kind、绑定种类、眼部结构或音频子系统。registration 保持单行/短分支；legacy eyes-and-ears 与 sample-senses 数据无需修改。

数据：`sim.senses = {profile:"sound-only",sound:{active:"sound-active",frequencyHz:"frequency-hz",amplitude:"amplitude",slowFactor:250,baseFrequencyHz:250,baseWavelengthScene:1,baseDisplacementScene:.035,sources:["S1"]},soundLab:{medium:"medium",distanceM:"distance-m",speedMps:{air:340,water:1500,"solid-example":5000},sources:["S1"]}}`。`speed-mps/one-way-ms/echo-ms` 输出显式 `nullable:true`，真空与停源时间为 null；记录保存 controls 副本，表/PLATE 不附空值单位，图不跨空值连线，预测不把 null 当 0，nullable 禁止绑定。没有既有 CSV 或磁盘缓存导出机制，故不新增此系统；JSON 往返测试保留 null 与旧记录兼容。

作者章/拍 `sensesFrame:{waveCycles?:0..1,echoProgress?:0..1}` 从章基线独立重建，URL 仅存输入与章拍。`engine.senses()` 的 sourceMarkers 按动画 id 返回相位/显示 Hz/on；soundLab.echo.pathPosition 为沿 axis 的标量场景距离（实际位置 = origin + axis × pathPosition）。`sensesEchoSeek` 有限 0..1。legacy seek 保留原行为。

与 §4 的实现澄清：既有 oscillate 是角摆，不是位移字段；小点以离轴 pivot 作局部示意，不把角度当 .035/.07u（这两个位移只属于纵波 solver）。频率/振幅只复位波相位，介质/距离只复位传播时钟，source-active 影响两者；章/拍复位两时钟。不存在额外 medium-view state。echo 工位由当前章 try.observe 包含 echo-ms 识别，没有另造持久控制或播放器。

新增草稿夹具 `sample-sound`：4 张卡涵盖四介质、nullable 记录、波/回声快照与源标记。新增 8 个浏览器用例，未运行。纯测试涵盖 legacy128、sound8、传播24组合，以及非法域、空值图表、共享快照和回声路径端点。

阶段门槛：`pnpm validate` 86 主题，0 错误/0 警告；`pnpm check` 967 文件，0 错误/0 警告、4 个既有提示；`pnpm test` 222 文件/5510 测试通过（随后新增一项时钟隔离测试于最终门槛重计）；`pnpm build` 175 页成功。Vite 既有大 chunk 提示保留。浏览器 shoot/e2e 按 BRIEF 跳过，不冒称 GPU、手机、标注遮挡或布局通过。没有 git 写入或部署。

### 9.2 内容组合的澄清

1. 五个实物工位加一个仅含叠图的 `air-wave` group（card:false），共六图层、24 可选件不变。既有 overlay 只跟 group 与单一 when；单把 wave 与 receiver 放在 transmission 会令照护章显示接收处时也显示波条。独立图层复用既有机制，避免新增“当前章节”控制或复制 receiver；00/02/03/04 开波层，01/05/06/07 关闭。
2. 01 没有 try-it 卡，既有 UI 不提供独立的全局 source-active 按钮；停源开关放在 02 介质卡，01 正文指向下一章操作，暂停快照仍为 .25。02 默认只改变介质，停源作为另一次比较，保留同样的 held controls。
3. 06 不重复第五张卡；两种有效弦长的拍预设共读 frequency-hz，正文链接 03 的频率实验。保留 §0 的四卡决定。
4. 健康字幕明确“突然强声或持续高声”，避免把单纯长时间的安静声也说成会伤听力；动作建议仍为定性，数字设备参考仅在细看。

### 9.3 内容与最终门槛

已交付 `sound` published：8 章、32 拍、4 卡（02–05）、5 实物工位 + air-wave = 6 图层、24 可选件 + 9 context、6 镜头、6 动画、21 绑定、6 遥测行；flows 为空。正文每章 EN 242–276 词、ZH 362–443 字，每种语言每章 2 块细看；16 词在每种语言首现各标记一次。生产来源保留 19 条（研究 S 编号不重排），未用的学校索引、论文误解发生率、温度声速表与 WHO 中文冲突时长不进入核心结论。

已处理并直接查看全部 3 张批准 PNG 及 WebP 成品：封面 800/1600 方图 37,374/101,696 bytes，鼓面与单弦 1200×900 图 112,986/87,064 bytes；原图与成品 SHA/尺寸/alpha 记录在 provenance/illustrations.json。参考与许可审查见 scripts/geo/sound/reference-audit.md；没有第三方素材派生文件，故不新增 LICENSE-CONTENT / THIRD-PARTY-NOTICES 例外。

两轮静态结构对照完成：第一轮核 U 形音叉两臂一柄、开底薄环鼓框单膜、单弦两端锚定与双桥单孔；第二轮修正鼓框/台面与鼓面接触、共鸣箱壁与顶板连接、介质支脚归属（真空不残留介质支脚）、护耳用品展示支撑。Node 实建几何为 46 pieces / 64,356 structural triangles，0 非有限属性；33 件静止包络 x ±3.2、z ±1.8、y .03..1.97，0 可选件超出台面投影。另用 16:9 解析投影核 54 个逐拍 label anchor：无视锥越界，|NDC x|≤.400、|NDC y|≤.401。以上是静态几何与投影检查，不是 GPU draw calls、遮挡、HUD/手机或截图验收。

正文链接已验证的 eyes-and-ears、states-of-matter、materials、energy-conversion、heat、light-and-shadows；eyes-and-ears 第 06 章仅替换两句互链，无耳部内容复制。其旧单测禁止不存在 sound 链接的断言已改成实际验证 published 目标与具体传播章节，14 项既有内容测试保持通过。源报告 AUDIT.md 与逐章/默认审读清单 REVIEW.md 齐全。

最终非浏览器门槛：

| 门槛 | 结果 |
|---|---|
| pnpm check | 969 文件，0 errors / 0 warnings，4 个既有 hints |
| pnpm validate | 87 topics，0 errors / 0 warnings |
| pnpm test | 223 文件，5,530 测试通过 |
| pnpm build | 177 页成功；Vite 既有大 chunk 提示保留 |
| 静态首页 EN / ZH | 各 49 主题、18 science、98 徽章、49 张图；smoke 计数已同步 |
| 浏览器门槛 | 按 BRIEF 未运行 shoot / e2e；未打开用户浏览器或桌面 |

新增浏览器用例 22 项（sample-sound 8 + sound 14），已写未跑。主会话须执行 `pnpm shoot sound --beats --tasks --keys --layout --locale en,zh --theme paper,cinema`、sample-sound 与 eyes-and-ears 回归，再以 `CI=1 ATLAS_E2E_PORT=5452 pnpm e2e` 验证。需目视 32 拍、标签/剖面/模式、两主题、iPad 与 390×844 手机、44px 命中目标、无外部请求及 GPU 预算。没有 git 写入、依赖修改、部署或未合并分支依赖。

给 Gavin：审读静音与各工位尺度声明、虚拟固体的设计速度、中文“音高/振幅/响度”与局部运动示意、四卡/六图层组合及定性护耳建议；浏览器验收尚待主会话。具体逐段列表见 REVIEW.md。
