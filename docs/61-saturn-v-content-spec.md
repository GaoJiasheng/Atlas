# 61 · 土星五号与阿波罗飞船 · 内容施工 spec（`saturn-v`，SpaceScene，v1）

`saturn-v` · SpaceScene / Model3DStage · 2026-10-27 定稿。paper默认、cinema可切。背景+6章、35拍。机械原型：轴向多级运载火箭+封闭式载人飞船，全部程序化几何，普通机器不导入未清理glTF。基于Apollo 11构型的教学模型，不能写“无具体型号的通用火箭”然后声称历史尺寸。

**上线状态：`published`，按本轮用户明确指定执行。** 规格定稿后进入施工；姊妹历史主题不因此发布。阅读优先级：施工后填写的 §9 → 本规格 → 准备稿。

## 0. 决定与事实复核

### 0.0 拆分说明

用户notes要求分为TimeScene `space-race` 与SpaceScene `saturn-v`，因此保留本节。parent为同目录新研究档案，共用SR事实；本题少量SV新增在`facts-extra.json`。本题讲构型与工作顺序，历史04–07承担事故、成本与两国发展路径；BG/06直接链接历史，03/04接历史05。历史题保持draft；本题本轮施工目标为published；历史题的状态独立处理。

### 0.1 代定决策

| # | 默认决定 | 依据 |
|---|---|---|
| 1 | 对象Apollo 11的Saturn V/CSM/LM，发射与飞行构型分开；外壳无旗帜文字徽标 | SR039–046 |
| 2 | 科目science、beyond-syllabus；背景+6章、35拍；默认无评分小测、配音、视频 | SR001–003；设计 |
| 3 | 五个实体零件分区+一个只有流的组；33个可选零件定义，repeat展开后的份数另记 | §3 |
| 4 | 1场景单位=1m；整体111m高；LM未抽出前在SLA内部且支腿折叠 | SR039,043,046；SV002 |
| 5 | 尺度近似由文献约束，局部镜头可放大；不把所有模型坐标当测量值 | SV001–002 |
| 6 | 现有table sim、poses、visible/offset/rotate与flow足够；无新sim kind或primitive | §4代码核对 |
| 7 | SIM是小型假想火箭的理想速度变化；不显示为真实Saturn升空速度/燃料余量 | SR048；SV003–004 |
| 8 | 新生成并审查1024²完整Saturn封面；章图复用已有Apollo剖视与已审涡扇图。涡扇只作吸气对比，不冒充F-1 | 用户IMAGE与§7 |
| 9 | 运行时不连NASA/Commons，不上传外部服务，不设置按国胜负排行榜 | 静态架构与立场 |
| 10 | `cm-probe`在homeward/return隐藏；`les-tower`在parking及之后隐藏。CM前舱盖与probe不是同一part | S25返航配置；已核simulation-table的show-probe |
| 11 | F-1外圈安装圆3.8m、喷口半径1.85m仅为可核算初值；按参考profile修正间隙，保留1+4计数和主体真实比例 | SV001–002 |
| 12 | LM优先四腿/单梯/双前窗/两级独立发动机的可识别几何；姿态只解释构型，不称实测CAD | SR043–046；SV002 |
| 13 | 未发布的关联题不输出href；译名是编辑用语，不称新加坡课本标准；所有门槛仅记录实际运行结果 | 事实纪律与BRIEF |

### 0.2 必须讲对

| fact id | 核查结论（原始 claim） | 来源 |
|---|---|---|
| SR039 | The Apollo lunar Saturn V stack was about 111 m high. It had three main propulsion stages, not five. | S24 |
| SR040 | The S-IC first stage used five F-1 engines, burning RP-1 kerosene and liquid oxygen. | S25 |
| SR041 | The S-II second stage used five J-2 engines; the S-IVB third stage used one J-2. Both burned liquid hydrogen and liquid oxygen. | S25 |
| SR042 | S-IVB first helped establish Earth parking orbit and then restarted to send Apollo toward the Moon. The instrument unit guided the launch vehicle. | S25 |
| SR043 | The Apollo spacecraft included command module, service module and a separate two-stage lunar module; the lunar module was carried inside the spacecraft adapter below the service module. | S26 |
| SR044 | The command module carried three astronauts and returned through Earth’s atmosphere; the service module supplied propulsion and support and was discarded before re-entry. | S21 |
| SR045 | The lunar module had a descent stage with four landing legs and an ascent stage that carried two astronauts back to lunar orbit. | S26 |
| SR046 | After translunar injection, the command/service modules separated, turned around, docked to the lunar module, and extracted it from the adapter. | S21 |
| SR047 | A rocket carries oxidiser and can produce thrust in vacuum; it does not need to push against atmospheric air. | S27 |
| SR048 | Expelling mass produces thrust; an ideal rocket speed change depends on effective exhaust speed and the logarithm of the initial/final mass ratio. | S40；公式补S47 |
| SR026 | Apollo 11 launched on 16 July and returned to Earth on 24 July 1969. Neil Armstrong and Buzz Aldrin landed; Michael Collins remained in lunar orbit. | S21 |
| SR027 | Eagle landed in the Sea of Tranquility at about 20:17 UTC on 20 July 1969. Armstrong first stepped onto the surface at about 02:56 UTC on 21 July. | S20 |
| SR028 | Apollo 11 brought back 21.55 kg of lunar material, commonly rounded to about 22 kg. Surface stay was about 21 hours 36 minutes, not the duration of the moonwalk. | S20 |
| SR049 | Learners can confuse greater mass with faster free fall; responses can depend on whether the example is on Earth or the Moon. | S30 |
| SR050 | Research reviews document beliefs that gravity disappears in space and that continued motion requires continued thrust. Orbit is compatible with continuous gravitational acceleration. | S31 |

SV001–006的完整claim与source在`facts-extra.json`；其中SV005（Skylab）本题不采用。SV002–004明确标design，不混入历史TYPICAL。S90是本spec的自描述设计来源，未来sources.json写`design:true`，给所有SIM表行引用；历史工程量引用S24/S25/S26/S43。


### 0.3 fact id 完整对照与审计范围

准备档为main checkout只读输入。本轮逐一核对以下 **30 个唯一fact id**，全部存在于共享facts.json或facts-extra.json；未新增历史fact id。该核查不冒充逐条重新访问全部外链。S24/S21/S44/S40另于2026-10-27重新打开；其余原始资料沿用dossier已记的来源/页码与本轮保存的NASA参考页。SR019–022、SR035–036只约束历史回链与口吻，不在本题另列事故死者总数、成本比较或制度优劣。SV002–004明确为DESIGN/SIM。无逐字引用。

| fact id | 处置 | 来源 | 已核对的准备档claim（作者审计，不直接照抄为正文） |
|---|---|---|---|
| `SR001` | 采用 | S01 | Space-race history and lunar spacecraft engineering are enrichment, not named primary syllabus units. P6 forces and energy provide adjacent prerequisites. |
| `SR002` | 采用 | S01 | P6 Science includes recognising forces and gravitational force, and giving examples of forms of energy. |
| `SR003` | 采用 | S02 | Primary Social Studies includes technological change in Singapore, rather than a space-race history unit. |
| `SR019` | 采用 | S15 | On 27 January 1967, Gus Grissom, Ed White and Roger Chaffee died in the Apollo 1 ground-test cabin fire: three crew members. |
| `SR020` | 采用 | S16 | Vladimir Komarov died returning in Soyuz 1 on 24 April 1967 after parachute failure: one crew member. |
| `SR021` | 采用 | S17 | Soyuz 11 crew Georgi Dobrovolski, Vladislav Volkov and Viktor Patsayev died following cabin depressurisation on 30 June 1971: three crew members. |
| `SR022` | 采用 | S17 | Apollo 1, Soyuz 1 and Soyuz 11 together account for seven crew deaths in those three specified accidents. |
| `SR026` | 采用 | S21 | Apollo 11 launched on 16 July and returned to Earth on 24 July 1969. Neil Armstrong and Buzz Aldrin landed; Michael Collins remained in lunar orbit. |
| `SR027` | 采用 | S20 | Eagle landed in the Sea of Tranquility at about 20:17 UTC on 20 July 1969. Armstrong first stepped onto the surface at about 02:56 UTC on 21 July. |
| `SR028` | 采用 | S20 | Apollo 11 brought back 21.55 kg of lunar material, commonly rounded to about 22 kg. Surface stay was about 21 hours 36 minutes, not the duration of the moonwalk. |
| `SR035` | 采用 | S42 | NASA reported Apollo’s cost as US$25.4 billion in 1973; the scope differs from later reconstructed accounts near US$25.8 billion. |
| `SR036` | 采用 | S18 | Siddiqi reports N1-L3 costs of 3.6 billion rubles by 1 January 1973, with later rough totals of 4.0–4.5 billion rubles. |
| `SR039` | 采用 | S24 | The Apollo lunar Saturn V stack was about 111 m high. It had three main propulsion stages, not five. |
| `SR040` | 采用 | S25 | The S-IC first stage used five F-1 engines, burning RP-1 kerosene and liquid oxygen. |
| `SR041` | 采用 | S25 | The S-II second stage used five J-2 engines; the S-IVB third stage used one J-2. Both burned liquid hydrogen and liquid oxygen. |
| `SR042` | 采用 | S25 | S-IVB first helped establish Earth parking orbit and then restarted to send Apollo toward the Moon. The instrument unit guided the launch vehicle. |
| `SR043` | 采用 | S26 | The Apollo spacecraft included command module, service module and a separate two-stage lunar module; the lunar module was carried inside the spacecraft adapter below the service module. |
| `SR044` | 采用 | S21 | The command module carried three astronauts and returned through Earth’s atmosphere; the service module supplied propulsion and support and was discarded before re-entry. |
| `SR045` | 采用 | S26 | The lunar module had a descent stage with four landing legs and an ascent stage that carried two astronauts back to lunar orbit. |
| `SR046` | 采用 | S21 | After translunar injection, the command/service modules separated, turned around, docked to the lunar module, and extracted it from the adapter. |
| `SR047` | 采用 | S27 | A rocket carries oxidiser and can produce thrust in vacuum; it does not need to push against atmospheric air. |
| `SR048` | 采用 | S40 | Expelling mass produces thrust; an ideal rocket speed change depends on effective exhaust speed and the logarithm of the initial/final mass ratio. |
| `SR049` | 采用 | S30 | Learners can confuse greater mass with faster free fall; responses can depend on whether the example is on Earth or the Moon. |
| `SR050` | 采用 | S31 | Research reviews document beliefs that gravity disappears in space and that continued motion requires continued thrust. Orbit is compatible with continuous gravitational acceleration. |
| `SV001` | 采用 | S25 | Reference dimensions: S-IC 138 ft high and 33 ft diameter; S-II 81.5 ft high and 33 ft diameter; S-IVB 58.3 ft high and 21.7 ft diameter; IU 3 ft high. |
| `SV002` | 设计/推导 | S90 | The engineering study uses 1 scene unit = 1 metre; stack height 111 m, lower body diameter 10.06 m, upper body diameter 6.61 m. Layout coordinates are demonstrative design values. |
| `SV003` | 设计/推导 | S90 | Ideal teaching calculation uses effective exhaust speed 3000 m/s, dry mass 100 kg, payload choices 100, 200, 300 kg, propellant choices 200, 400, 600 kg, and optional extra inert mass 100 kg. Initial mass is calculated from these inputs. |
| `SV004` | 设计/推导 | S90 | With 100 kg dry hardware, 200 kg payload and 600 kg propellant, ideal delta-v is 3295.84 m/s; carrying another 100 kg of inert hardware with the same payload/propellant reduces it to 2748.87 m/s. |
| `SV005` | 不采用 | S42 | Skylab launched in May 1973 and continued US human orbital research after Apollo lunar missions. |
| `SV006` | 采用 | S44 | The Moon has a very thin exosphere rather than an Earth-like atmosphere; a parachute cannot provide the atmospheric braking used on Earth. |

## 1. 范围、口吻与观察边界

“火箭”是提供发射和加速的运载工具；“飞船”在不同阶段分离、对接、返回。讲零件在哪里、做什么、接到哪里。主文中文350–500字/英文200–300词；每章2–4个细看；caption短句描述当前可见对象。身高比喻不取代真实比例尺；发动机转速、流速度、展开距离是可读设计值。默认没有测验，但提供“改变/不变/观察”和先猜后看卡片。

安全与沉重史只作事实回链：Apollo1是地面测试而非本Saturn模型的一次起飞；Soyuz事故在历史题写全。不能把这里的理想模型用作火箭设计、点火或发射操作指南。[SR019–022,048]

## 2. 章节与节拍

### 2.1 状态总约定

所有拍都从本章基线显式重建：`pose`、`hide`、`labels`、`layers`、`sim.set`不累积。`phase`是下文现成table的step值（0–12）；每拍给phase，并设置命名`pose`，phase的姿态绑定与章/拍始终指向同一绝对pose，显隐绑定另负责门控。`labels`每拍最多4个；逗号列表就是本章index.parts全集。`run:false`默认；推进流只在01的发动机示范拍手动RUN时出现，其他飞行阶段是静态示意，不连续自动起飞。

| # | chapter id | EN / ZH | 首拍视角 | 首拍phase | 读法 / index |
|---|---|---|---|---|---|
| 00 | `orientation` | One rocket, several craft / 一枚火箭，几种飞行器 | hero | launch | 完整外观；本章提及全部零件列入index |
| 01 | `carried-oxidiser` | Carrying oxidiser / 自带氧化剂 | engines | launch | 局部剖视；本章提及全部零件列入index |
| 02 | `stages-and-mass` | Stages and mass / 分级与质量 | stages | launch | 局部剖视；本章提及全部零件列入index |
| 03 | `docking-and-extraction` | Turning and extracting / 转身与抽取 | apollo | translunar | 局部剖视；本章提及全部零件列入index |
| 04 | `lunar-module` | The two-stage lunar module / 两级登月舱 | lander | lunar | 局部剖视；本章提及全部零件列入index |
| 05 | `home-in-the-cone` | Home in the cone / 指令舱返回 | apollo | rendezvous | 局部剖视；本章提及全部零件列入index |
| 06 | `ideal-model` | Limits of an ideal model / 理想模型的边界 | stages | translunar | 局部剖视；本章提及全部零件列入index |

### 2.2 逐章提纲、双语字幕与索引

### 00 · `orientation` · 一枚火箭，几种飞行器

- **探究问题**：整枚火箭都会到月球吗？
- **summary EN / ZH**：One rocket, several craft: follow each part through the change of configuration. / 一枚火箭，几种飞行器：沿着构型变化辨认各部分。
- **正文提纲**：介绍111m发射构型与三个主推进级，区分火箭、飞船、地球和月球。说明外壳剖开与拆开是观察方式，不是真实飞行画面；先猜发动机关闭后会不会立即停下，再链接forces/轨道背景。 [SR039,SR043,SR044,SR050]
- **细看**：①本章构型与真实任务的对应；②显示省略/放大的地方；③关键词与跨题证据链接。
- **index.parts**：`cm-shell`, `sic-shell`, `sivb-shell`, `sii-shell`, `sm-shell`, `sla-shell`, `cm-heatshield`, `iu-ring`, `les-tower`（browser acceptance补：正文与第1拍字幕提到逃逸系统）。hidden对象仍能从index选入对应局部镜头，必须先切可见phase再选中，不产生空白详情。

| 拍 | phase / preset | labels / 选中索引 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|---|
| 1 | launch / hero | cm-shell,sic-shell,sivb-shell | The assembled stack is about 111 m tall, including the spacecraft and escape system. | 完整发射构型约高111米，包括飞船与逃逸系统。 | SR039 |
| 2 | launch / hero | sic-shell,sii-shell,sivb-shell | Saturn V has three main propulsion stages. The V does not mean five stages. | 土星五号有三个主推进级；“五”不是级数。 | SR039,SR041 |
| 3 | launch / apollo | cm-shell,sm-shell,sla-shell | The spacecraft sits above the launch vehicle; the lunar module is stowed inside the adapter. | 飞船位于运载火箭上方；登月舱收在适配器内部。 | SR043 |
| 4 | launch / hero | cm-heatshield | Only the command module returns through Earth’s atmosphere. | 只有指令舱穿过地球大气层返回。 | SR044 |
| 5 | launch / hero | iu-ring | These cutaway and exploded views explain parts; they are not photographs of a flight. | 剖视与拆解用来解释零件，不是飞行照片。 | SV002 |

### 01 · `carried-oxidiser` · 自带氧化剂

- **探究问题**：没有空气，发动机怎样工作？
- **summary EN / ZH**：Carrying oxidiser: follow each part through the change of configuration. / 自带氧化剂：沿着构型变化辨认各部分。
- **正文提纲**：聚焦S-IC的分开的煤油和液氧储箱，沿两条进料流到燃烧室再排出。下级五台F-1为一中心四外围，四外围可调整方向的细节不做可用飞控。用已有涡扇图对比吸气，明确火箭不推空气。 [SR040,SR047]
- **细看**：①本章构型与真实任务的对应；②显示省略/放大的地方；③关键词与跨题证据链接。
- **index.parts**：`sic-fuel`, `sic-oxidiser`, `f1-centre`, `f1-outer`。hidden对象仍能从index选入对应局部镜头，必须先切可见phase再选中，不产生空白详情。

| 拍 | phase / preset | labels / 选中索引 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|---|
| 1 | launch / tank | sic-fuel,sic-oxidiser | The first stage stores kerosene fuel and liquid oxygen in separate tanks. | 第一级把煤油燃料和液氧分别储存在两个储箱中。 | SR040 |
| 2 | launch / engines | f1-centre,f1-outer | Five F-1 engines form a centre-and-four pattern below the tanks. | 五台F-1发动机位于储箱下方，中央一台、外围四台。 | SR040 |
| 3 | launch / engines | f1-centre | Hot gas leaves the nozzle; the rocket gains momentum in the other direction. | 高温气体排出喷管，火箭获得相反方向的动量。 | SR047,SR048 |
| 4 | launch / tank | sic-oxidiser | Carried oxidiser lets the engine work without taking oxygen from the air. | 自带氧化剂使发动机无需从空气中吸取氧气。 | SR047 |
| 5 | launch / tank | sic-fuel | The turbofan figure shows an air intake. A rocket carries its oxidiser. | 涡扇图中的进气口提供空气；火箭自带氧化剂。 | SR047 |

**试一试**：vary `stage-choice`，observe `[engine-count,fuel-name]`；固定几何比例、同一图版；燃料切换的读数带TYPICAL来源上标S25，不给虚假的温度或燃烧百分比。

### 02 · `stages-and-mass` · 分级与质量

- **探究问题**：为什么丢掉空的结构？
- **summary EN / ZH**：Stages and mass: follow each part through the change of configuration. / 分级与质量：沿着构型变化辨认各部分。
- **正文提纲**：先保留完整五五一布局再切phase状态。用同一个ideal table比较额外惰性结构带来的变化，强调质量比教学模型不是Saturn性能。第三主级重启向月球出发，IU负责测量和指令而非新增主推进级。 [SR039,SR040,SR041,SR042,SR048]
- **细看**：①本章构型与真实任务的对应；②显示省略/放大的地方；③关键词与跨题证据链接。
- **index.parts**：`sic-shell`, `sii-shell`, `sivb-shell`, `j2-centre`, `j2-outer`, `sivb-engine`, `iu-ring`。hidden对象仍能从index选入对应局部镜头，必须先切可见phase再选中，不产生空白详情。

| 拍 | phase / preset | labels / 选中索引 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|---|
| 1 | launch / stages | sic-shell,sii-shell,sivb-shell | Five first-stage engines, five second-stage engines and one third-stage engine are not all firing together. | 一级五台、二级五台、三级一台主发动机，并非同时工作。 | SR040,SR041 |
| 2 | first-off / stages | sii-shell,j2-centre,j2-outer | After the first stage separates, the second stage continues the climb. | 第一级分离后，第二级继续加速。 | SR041 |
| 3 | parking / stages | sivb-shell,sivb-engine | The third stage helps establish a parking orbit around Earth. | 第三级帮助飞船进入环绕地球的停泊轨道。 | SR042 |
| 4 | translunar / stages | sivb-engine,iu-ring | The third-stage engine restarts to send Apollo toward the Moon. | 第三级发动机再次启动，把阿波罗送向月球。 | SR042 |
| 5 | translunar / stages | sivb-shell | In the ideal comparison, carrying an extra 100 kg lowers the speed change from 3295.84 to 2748.87 m/s. | 理想对照中，多带100千克结构，速度变化由3295.84降至2748.87米/秒。 | SV003,SV004 |

**试一试**：用现有table卡。02固定payload=200、propellant=600，仅vary `carry-inert`；06 vary `payload`、also `[propellant,carry-inert]`，observe `[initial-mass,final-mass,ideal-dv]`，record.chart.y=`ideal-dv`。先猜更多载荷使ideal-dv变大/变小，点击看答案，不能把输入当真实Saturn参数。phase改变不重算这张实验的输入。

### 03 · `docking-and-extraction` · 转身与抽取

- **探究问题**：登月舱怎样离开发射时的位置？
- **summary EN / ZH**：Turning and extracting: follow each part through the change of configuration. / 转身与抽取：沿着构型变化辨认各部分。
- **正文提纲**：发射时LM在适配器内、支腿折叠。出发后先揭示面板，再以绝对poses演示CSM离开、转身、鼻端对接、抽取LM。动作分离为读者控制静态状态，不伪造接触动力学。两种飞行器各自功能和连接点可从索引点选。 [SR043,SR044,SR046]
- **细看**：①本章构型与真实任务的对应；②显示省略/放大的地方；③关键词与跨题证据链接。
- **index.parts**：`sla-shell`, `lm-ascent`, `cm-shell`, `sm-shell`, `cm-probe`, `lm-docking-port`, `lm-descent`。hidden对象仍能从index选入对应局部镜头，必须先切可见phase再选中，不产生空白详情。

| 拍 | phase / preset | labels / 选中索引 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|---|
| 1 | translunar / apollo | sla-shell,lm-ascent | The adapter encloses the lunar module during launch. Its legs are folded. | 发射时，适配器包住登月舱，支腿收拢。 | SR043,SR046 |
| 2 | separated / apollo | cm-shell,sm-shell | The command and service modules move clear of the adapter. | 指令舱与服务舱先离开适配器。 | SR046 |
| 3 | turned / apollo | cm-probe | The spacecraft turns so the command-module nose faces the lunar module. | 飞船转身，让指令舱鼻端朝向登月舱。 | SR046 |
| 4 | docked / apollo | cm-probe,lm-docking-port | The nose connects to the lunar module’s docking port. | 鼻端与登月舱的对接口连接。 | SR046 |
| 5 | extracted / apollo | lm-ascent,lm-descent | The docked spacecraft pulls the lunar module out; it is no longer inside the adapter. | 对接后的飞船把登月舱抽出；它不再留在适配器内。 | SR046 |

### 04 · `lunar-module` · 两级登月舱

- **探究问题**：离开月球时什么留下？
- **summary EN / ZH**：The two-stage lunar module: follow each part through the change of configuration. / 两级登月舱：沿着构型变化辨认各部分。
- **正文提纲**：独立LM近景，四支腿和单前梯，下降级与上升级功能各异。两人下降、一人留在轨道。降落不靠降落伞；上升级发动机独立，下降级留月面。模型只解释结构和状态，不作着陆游戏。 [SR026,SR045,SR047]
- **细看**：①本章构型与真实任务的对应；②显示省略/放大的地方；③关键词与跨题证据链接。
- **index.parts**：`lm-legs`, `lm-ladder`, `lm-descent-engine`, `lm-ascent`, `cm-shell`, `lm-ascent-engine`, `lm-descent`, `lm-docking-port`, `cm-probe`。hidden对象仍能从index选入对应局部镜头，必须先切可见phase再选中，不产生空白详情。

| 拍 | phase / preset | labels / 选中索引 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|---|
| 1 | lunar / lander | lm-legs,lm-ladder | Four landing legs support the descent stage; one front leg carries the ladder. | 四支着陆腿支撑下降级，前方一支腿带着梯子。 | SR045 |
| 2 | lunar / lander | lm-descent-engine | The descent engine controls the approach. A parachute cannot work in a near-vacuum. | 下降发动机控制接近月面；降落伞不能在近真空中工作。 | SR045,SV006 |
| 3 | lunar / lander | lm-ascent,cm-shell | Two astronauts descend while Collins remains in lunar orbit. | 两人下降到月面，科林斯留在月球轨道。 | SR026 |
| 4 | ascent / lander | lm-ascent-engine,lm-descent | The ascent stage lifts away. The descent stage and legs remain behind. | 上升级升空，下降级与支腿留在月面。 | SR045 |
| 5 | rendezvous / apollo | lm-docking-port,cm-probe | The ascending craft meets and docks with the command and service modules. | 上升的飞行器与指令舱、服务舱交会对接。 | SR045,SR046 |

### 05 · `home-in-the-cone` · 指令舱返回

- **探究问题**：哪一部分保护三个人返回？
- **summary EN / ZH**：Home in the cone: follow each part through the change of configuration. / 指令舱返回：沿着构型变化辨认各部分。
- **正文提纲**：CM有三个座位、防热底面，SM负责返航推进与支持而后分离；LM不穿越地球大气。保持一张cutaway可理解的机械图，不模拟再入温度或向用户给飞行操作指示。事故安全回链历史，不再重复事故叙事。 [SR026,SR044]
- **细看**：①本章构型与真实任务的对应；②显示省略/放大的地方；③关键词与跨题证据链接。
- **index.parts**：`cm-couches`, `sm-engine`, `sm-tanks`, `cm-shell`, `sm-shell`, `cm-heatshield`。hidden对象仍能从index选入对应局部镜头，必须先切可见phase再选中，不产生空白详情。

| 拍 | phase / preset | labels / 选中索引 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|---|
| 1 | rendezvous / apollo | cm-couches | The three astronauts and their samples gather inside the command module. | 三名宇航员与标本汇集到指令舱内。 | SR026,SR028,SR044 |
| 2 | homeward / apollo | sm-engine,sm-tanks | The service module supplies return propulsion and support. | 服务舱提供返航推进与支持。 | SR044 |
| 3 | return / apollo | cm-shell | The service module separates before atmospheric entry. | 进入大气层之前，服务舱与指令舱分离。 | SR044 |
| 4 | return / apollo | cm-heatshield | The blunt heat shield faces the airflow and protects the cabin. | 钝头防热底面朝向气流，保护乘员舱。 | SR044 |
| 5 | return / apollo | cm-shell | The command module returns. The rocket stages and lunar module do not return with it. | 指令舱返回；火箭各级与登月舱不会随它一起回到地球。 | SR044,SR045 |

### 06 · `ideal-model` · 理想模型的边界

- **探究问题**：改一个变量，读数为何改变？
- **summary EN / ZH**：Limits of an ideal model: follow each part through the change of configuration. / 理想模型的边界：沿着构型变化辨认各部分。
- **正文提纲**：只做一张可复核的理想火箭表，载荷、推进剂和额外惰性结构为设计值。表格记录与先猜后看复用现成卡片；不加入真实发射或弹道积分。收尾回到两个历史项目、成本和团队，工程知识不等于把它称为某制度胜利。 [SR048,SV003,SV004]
- **细看**：①本章构型与真实任务的对应；②显示省略/放大的地方；③关键词与跨题证据链接。
- **index.parts**：`sivb-shell`, `cm-shell`。hidden对象仍能从index选入对应局部镜头，必须先切可见phase再选中，不产生空白详情。

| 拍 | phase / preset | labels / 选中索引 | Caption EN | 字幕 ZH | facts |
|---|---|---|---|---|---|
| 1 | translunar / stages | sivb-shell | The experiment uses a small imaginary rocket, not Saturn V’s flight numbers. | 实验使用一枚小型假想火箭，不是土星五号的飞行数值。 | SV003 |
| 2 | translunar / stages | sivb-shell | Keep propellant fixed and increase payload. The ideal speed change falls. | 保持推进剂不变、增加载荷，理想速度变化会下降。 | SV003 |
| 3 | translunar / stages | sivb-shell | Keep payload fixed and add propellant. More mass can be expelled. | 保持载荷不变、增加推进剂，可排出的质量增加。 | SV003 |
| 4 | translunar / stages | sivb-shell | Removing unused structure changes the mass ratio, but this model ignores drag and gravity losses. | 去掉无用结构会改变质量比，但本模型忽略阻力与重力损失。 | SV003,SV004 |
| 5 | return / hero | cm-shell | Hardware explains how a mission worked. The history also includes other programmes, crews and costs. | 硬件解释任务怎样工作；历史还包括其他项目、乘组与投入。 | SR019,SR020,SR021,SR035,SR036 |

**试一试**：用现有table卡。02固定payload=200、propellant=600，仅vary `carry-inert`；06 vary `payload`、also `[propellant,carry-inert]`，observe `[initial-mass,final-mass,ideal-dv]`，record.chart.y=`ideal-dv`。先猜更多载荷使ideal-dv变大/变小，点击看答案，不能把输入当真实Saturn参数。phase改变不重算这张实验的输入。

### 2.3 关联题

BG/02的orbit知识接`sun-earth-moon`，01吸气/自带氧化剂接`how-planes-fly`，06及事故出处接`space-race`。施工时逐个检查目标topic.yaml与chapter id：只对main中已published的目标输出链接，不提前输出死链接。历史topic是draft时，机械published导航不暴露无权限/未公开的历史路径；正文保留S#来源及独立可读的简短背景。

## 3. 零件、几何、状态与数据计划

### 3.0 自描述设计来源S90

本spec及`simulation-table.json`为S90，`design:true`。真实参考量见SR039–046与SV001；模型坐标和视觉速度见SV002；理想计算输入与公式见SV003–004。设计坐标只是对读者可解释的结构研究，禁止把大致高度标成AS-506测绘。S25 PDF p.113给名义尺寸并注明可能变化；飞后事实另用S20。

### 3.1 五分区与坐标

Y向上，X向右，+Z向观者；S-IC底部最低处y=0。全栈轴x=z=0，最大主体半径5.03m，含fins的横向包络≤14m；总高111m。LM收拢基准中心约[0,89.5,0]，腿收起时包络需在SLA内；发射时不能在SLA外再显示第二个LM。局部表面在lander preset中用原米单位，镜头放大，不重造缩尺比。

| 分区 | group id | 内容 | 功能色 |
|---|---|---|---|
| 01 | stage-one | S-IC壳、储箱、5F-1、4尾翼 | token:holder-1 |
| 02 | upper-stages | S-II、S-IVB、其储箱与6J-2 | token:holder-2 |
| 03 | guidance-adapter | IU与SLA | token:holder-3 |
| 04 | return-craft | CM/SM、LES | token:holder-4 |
| 05 | lander | LM两级、四腿、梯、窗、接口 | token:holder-5 |
| 06 | propellant-flow | 只有燃料、氧化剂和排气示意流 | KEY写燃料/氧化剂/排气，不把任一颜色当国家 |

主体包络 DESIGN：S-IC y0–42.06；S-II y42.06–66.90；S-IVB y66.90–84.67；IU y84.67–85.59；SLA y85.59–94.00；SM94–101；CM101–104；LES104–111。前三高度来自名义reference取整，其余是为111m完整构型分配的**示意包络**，不是精确共同基准station。施工R2要对照S25整栈图核准接口、interstage归属和重叠，不能直接把这些包络生成为无间隙实心圆柱。[SV001–002]

### 3.2 Tier-1 与33零件定义

下表`at`是DESIGN中心起点；tank的length要扣除封头，不与外壳或相邻tank重叠。F-1和J-2用空心lathe截面（内外轮廓），不是实心圆锥。repeat.count是物理份数，定义仍只有1个可选id；所有重复实例点到同一零件说明，详情写总数。[SR040–045]

| # | part id | group | primitive / at (m) | repeat / connects / shell / 功能 |
|---|---|---|---|---|
| 01 | sic-shell | stage-one | curvedPanel筒壳分片 / [0,24,0] | shell；connects sic-fuel,sic-oxidiser；承力和保护 |
| 02 | sic-fuel | stage-one | vessel r4.6 straight length11 / [0,16,0] | 煤油储存；connects f1-centre,f1-outer |
| 03 | sic-oxidiser | stage-one | vessel r4.6 length13 / [0,33,0] | 液氧储存；connects engines |
| 04 | f1-centre | stage-one | lathe bell rExit1.85 h5.5 / [0,3,0] | 1台；connects sic-fuel,sic-oxidiser |
| 05 | f1-outer | stage-one | 与centre同profile / [0,3,0] | repeat4, axis[0,1,0], radius3.8；共5台 |
| 06 | sic-fins | stage-one | extrude三角翼根 / [0,5,0] | repeat4 radial5.0；不是飞机主翼 |
| 07 | sii-shell | upper-stages | curvedPanel筒壳 / [0,55,0] | shell；尾部/过渡段按reference |
| 08 | sii-fuel | upper-stages | vessel r4.5 length10 / [0,59,0] | 液氢，上储箱 |
| 09 | sii-oxidiser | upper-stages | vessel r4.5 length3 / [0,49,0] | 液氧，下储箱；共底板关系不能画双厚隔墙 |
| 10 | j2-centre | upper-stages | lathe rExit1.0 h3 / [0,44,0] | 中央1台 |
| 11 | j2-outer | upper-stages | 同j2-centre / [0,44,0] | repeat4 radial2.5；S-II共5台 |
| 12 | sivb-shell | upper-stages | curvedPanel r3.305 / [0,76,0] | shell；上段比前两级细 |
| 13 | sivb-fuel | upper-stages | vessel r2.9 length6 / [0,80,0] | 液氢，上储箱 |
| 14 | sivb-oxidiser | upper-stages | vessel r2.9 length2 / [0,72,0] | 液氧，下储箱 |
| 15 | sivb-engine | upper-stages | lathe / [0,68.8,0] | 单台J-2；重启用文字和phase，不同一时刻画两台 |
| 16 | iu-ring | guidance-adapter | tube/torus ring r3.25 / [0,85.13,0] | 指导测量与控制；非主推进级 |
| 17 | sla-shell | guidance-adapter | 四片tapered extrude/curvedPanel / [0,89.8,0] | shell；四面板；静态移除示意，不伪造铰链轨迹 |
| 18 | cm-shell | return-craft | lathe cone r1.95 h3 / [0,102.5,0] | shell；五窗位置按S25参考，不能随机网格开窗 |
| 19 | cm-heatshield | return-craft | lathe blunt disc r1.95 / [0,101.0,0] | clip:false；连续防热层，不随cutaway消失 |
| 20 | cm-couches | return-craft | bevelBox组合 / [0,102,0] | repeat3 axis[1,0,0] spacing0.65；3座，无乘员模型 |
| 21 | cm-probe | return-craft | tube+cone / [0,104.2,0] | 鼻端对接探杆 |
| 22 | sm-shell | return-craft | curvedPanel cylinder r1.95 / [0,97.5,0] | shell；不带太阳翼 |
| 23 | sm-tanks | return-craft | vessel组件 / [0,97.5,0] | 示意支持/推进储存，单独说明非完整罐数与管线CAD |
| 24 | sm-engine | return-craft | lathe nozzle / [0,93.8,0] | 单主喷管；接服务舱 |
| 25 | les-tower | return-craft | tube truss+cone / [0,107.5,0] | shell:false；先于地月转移已抛弃，不能一直随CM飞 |
| 26 | lm-descent | lander | octagonal extrude / [0,88.0,0] | 下部下降级；connects legs,descent-engine |
| 27 | lm-descent-engine | lander | lathe bell / [0,86.6,0] | 单下降发动机 |
| 28 | lm-legs | lander | tube三角支撑+footpad extra / [0,87.5,0] | repeat4 radial2.0；独立姿态收拢/展开，每腿1足垫 |
| 29 | lm-ascent | lander | 多片extrude/bevelBox faceted cabin / [0,90.8,0] | shell；非圆锥流线外壳；2人站立工作 |
| 30 | lm-ascent-engine | lander | lathe bell / [0,89.0,0] | 单上升发动机，与descent-engine分开 |
| 31 | lm-windows | lander | 2个extrude三角窗 / [0,91.0,1.0] | two forward windows；作为一个可选id |
| 32 | lm-ladder | lander | tube梯组件 / [0,87.0,2.6] | 仅一支前腿；不能四支腿都有梯 |
| 33 | lm-docking-port | lander | torus+tube / [0,92.5,0] | 顶部接口；与cm-probe连接 |

每零件summary第一句说功能，detail写连接关系、参考来源和本模型省略。所有parts有`explode.dir/dist`：stage-one沿-X 12m、upper-stages沿+X 12m、guidance向+Z 6m、returncraft向+X 16m、lander向-X16m；这些是分组拆解DESIGN，不是发动机分离矢量。每组内部储箱再各向±Z 2m，避免全组重叠。爆炸视图FLOW禁用（现有）；切回装配恢复原pose。

### 3.3 碰撞与准确性门槛

S-IC两个r4.6罐的封头headRatio默认不得让上下罐穿入；本设计采用headRatio0.35，燃料中心16、straight11，总高14.22，氧中心33、straight13总高16.22，间隔≥1.7m。S-II共底储箱需沿reference做共同边界，不能照上述示意vessel强行穿插；将两罐profile裁到同一边界y≈53.5并用单隔板，不新增零件id。S-IVB同理以y≈75m为共享边界。透视状态重叠误差必须在R2被看见和修正。[SV001–002]

下级五喷管的DESIGN默认是centre在原点、outer四台中心半径3.8m、exit半径1.85m：中心与外围最近边缘间隙3.8−2×1.85=0.10m；相邻外围间隙3.8√2−3.7≈1.67m。发动机裙部横向包络约11.3m，可超出10.06m圆筒主体但仍在含尾翼的14m包络内。这里的3.8m安装圆是可行示意值，不是测量AS-506所得；S25完整F-1曲线和安装图用于施工R2校核，不能为塞进圆筒而把所有喷管缩小。每个Y截面检查内外间隙，禁止相交。[SV001–002]

### 3.4 流与运动

只在01剖视台架讲进料，三条flow：`fuel-feed`从sic-fuel到五个F1进口，`oxidiser-feed`从sic-oxidiser到五进口，`exhaust-out`五喷管向下。每条用已有paths≤16，分别5paths；3次draw。燃料token:holder-4、氧化剂token:holder-2、排气token:hot；KEY写名称，不能仅靠颜色。speed分别0.8、0.8、1.6m/s是可读视觉速度，非真实排气速度；count各≤600，clip:false只给外部排气。FLOW只有stage-choice=first且phase=launch时可见，演示其它phase不误点燃整栈。table数值不跟动画帧跑。

没有全程飞行动画：各phase是独立绝对pose，点击拍时0.8s镜头/姿态过渡；抽取路径按reference示意，space距不是地月距。展开腿是两个命名终态，额外中间姿态仅在有测量reference后做。推进、分离、对接不是同一条无限循环动画。[SR042,045–046]

### 3.5 phase、可见与命名姿态矩阵

所有刚体的transform作用于各独立part，不只有壳移动。runtime只用现有命名pose与visible binding；完整phase表在`simulation-table.json`的phase experiment。以下L表示完整LM组、C表示CM全部parts、S表示SM全部parts、R表示所有火箭级/IU/SLA：

| phase | 可见状态 | pose终态（设计） |
|---|---|---|
| launch | 全栈；LM在SLA内；LES可见 | launch-packed；只有外壳遮挡，不存在第二份LM |
| first-off | S-IC隐藏，其余继续 | upper-stack；S-IC在index可回看，但舞台不画漂移残骸 |
| parking | S-IC/S-II/LES隐藏；S-IVB/IU/SLA/C/S/L | parking-stack；LM仍在适配器 |
| translunar | 同parking | translunar-stack；用文字说明重启，不自动积分轨道 |
| separated | 仅S-IVB/IU/SLA/C/S/L，SLA panels隐藏露出L | csm-clear：C/S整体+X15m；L原位 |
| turned | 同separated | csm-turned：C/S刚体绕局部X转180°；支持模块必须随动 |
| docked | 同turned | nose-to-lm：probe与LMport共轴，间距≤0.05m |
| extracted | R隐藏；C/S/L | csm-lm-extracted：C/S与L整体移到局部展示区，接口仍相接 |
| lunar | R隐藏；C/S旁置ghost，L四腿展开 | lm-landed：LM足垫共面y0，C/S移至[22,10,0]；不是按比例的轨道位置 |
| ascent | R隐藏；L下降级留y0，上升级+8m，C/S旁置 | lm-ascent：legs和梯留在descent，windows和port随ascent |
| rendezvous | R与LMdescent/legs/梯隐藏，L上升级+C/S | rendezvous：鼻端对LM口，乘员通道示意 |
| homeward | 仅C/S，cm-probe隐藏 | homeward-csm，LM均隐藏 |
| return | 仅C，cm-probe隐藏 | return-cm：heatshield朝局部风向；无SM/LES/LM/probe；不模拟温度 |

phase总共13项；严格枚举无“其它”兜底。命名poses由生成器将组合刚体矩阵展开到上述33个独立part，不能只给group一个不存在的transform字段。任何被visible隐藏的part不可点、不可标注；正文index选择时切到该part声明的可见phase，沿用现有动作/状态路径。若既有index不能带phase动作，使用“查看构型”现成拍链接，再选part，不要求新binding。

### 3.6 HUD、镜头与模式

`views.section.plane=xy`，`units=m`，REFERENCE正视；cutaway normal=[0,0,1]、offset=0，保留约半壳。heatshield/窗口/支腿clip:false；装配封面shadows:none。数值telemetry≤4行：stage main engines TYPICAL、initial-mass/final-mass/ideal-dv SIM，全部follow同一table输出；没有真实压力/温度曲线。标题note双语：“Apollo 11 configuration study · internal layout simplified / 阿波罗11号构型研究 · 内部布局简化”。

预设DESIGN（position/target米；fov=30）：hero [150,82,173]/[0,55,0]；engines [18,6,20]/[0,4,0]；tank [24,26,28]/[0,25,0]；stages [150,65,170]/[0,55,0]；apollo [18,105,22]/[0,99,0]；lander [14,7,16]/[0,3.5,0]。`capsule`不是第7个新preset，用apollo的状态镜头覆盖构图或替换同一预设target到return-CM；命名预设≤6（hero/engines/tank/stages/apollo/lander-view；最后一项避开实体组lander的全局命名冲突）。所有镜头按phase更新target，不锁到已经隐藏的整栈中心。

底部只有章轴；PLATE在左列；reader顺序遵守docs/08；本章全部parts进index。X-RAY只ghost shells，内部保持实；CUTAWAY不削掉heatshield；EXPLODED禁FLOW；REFERENCE与reduced-motion不自动跑。全部操作44px，tap与键共用store。科目science与轻度功能色不能把火箭排气画成国别隐喻。

### 3.7 现有table模拟的精确数据契约

此处没有新引擎实现：`sim.kind=table`，controls/outputs/table.experiments/bind严格按现有`sim-schema.ts`、`table-schema.ts`。完整数值与13相位的可审稿数据在`simulation-table.json`，其`sim`子对象可以作为后续parts.json填充的起点；带元数据的外壳不是runtime parts文件。

- controls：`payload` step[100,200,300]kg default200；`propellant` step[200,400,600]kg default600；`carry-inert` toggle defaultfalse（额外100kg未丢结构）；`stage-choice` choice first/second/third defaultfirst；`phase` step值0–12，对应§3.5的13项，default0（launch）；既有choice上限12，改用已有step而不扩引擎。
- ideal experiment.keys=[payload,propellant,carry-inert]，18行完整笛卡尔积。dry=100+(carry-inert?100:0)；mf=dry+payload；m0=mf+propellant；ve=3000m/s；dv=ve×ln(m0/mf)。输出initial-mass、final-mass、ideal-dv均number/tag:sim，不写from，source=[S90]。
- stage experiment.keys=[stage-choice]，3行。engine-count=5,5,1（number/tag:typical/sourceS25），fuel-name=kerosene/hydrogen/hydrogen（state，标签煤油/液氢），oxygen-name=liquid-oxygen（state）。这不是全阶段推力模拟；engine-count只读档位，几何计数来自parts。
- phase-state experiment.keys=[phase]，13行，输出show-sic/show-sii/show-upper/show-sla/show-csm/show-lm-descent/show-lm-ascent/show-les等state shown/hidden。全表从§3.5显式生成，不能依靠上一拍遗留值。source=[S90]；另输出双语configuration-name（state）保留13个语义名称，pose由章/拍同时指定并由数值phase绑定保持同步。
- bindings：每个show-* state→相应part数组的visible `{eq:'shown'}`；无新offset变体。`phase`不得只改变显隐而保留旧pose：沿现有control→pose binding将13项映射到同名绝对姿态，章/拍也显式指定该姿态。全部输出用于已存在visible、telemetry.follow、try.observe与record.chart。禁止将一个输出同置两个experiment。
- validation：现有table验证keys覆盖恰好1行、合法枚举、输出种类/状态标签、来源存在；所有SIM行含design:true S90；engine-count的TYPICAL行含非design S25。缺行、多行、NaN、负质量、非法source直接失败，生成脚本另做m0>mf>0检查。
- 输出与格式：内部dv不取整，UI decimals=2；单位m/s。rendered sim caption始终“理想模型 / Ideal model”，不使用TYPICAL。初始/最终质量独立观察，载荷200推进剂600无额外结构应m0=900,mf=300,dv=3295.836866004329m/s。

| 用例 | 预期数值/状态 |
|---|---|
| payload200 prop600 carryfalse | m0=900kg，mf=300kg，dv=3295.84m/s |
| 同上carrytrue | m0=1000kg，mf=400kg，dv=2748.87m/s |
| payload100 prop200 carryfalse | m0=400，mf=200，dv=2079.44m/s |
| payload300 prop200 carryfalse | m0=600，mf=400，dv=1216.40m/s |
| stagefirst/second/third | main-engine count5/5/1；fuel状态kerosene/hydrogen/hydrogen |
| phaseascent | descent leg4留地面；ascent cabin/engine/window/port整体上移8m；不再标注LES |
| phasereturn | C的shell/heatshield/couches显示；probe与其余推进级、SM、LM、LES均隐藏（§0默认修正） |
| 改stage-choice而不改ideal keys | ideal-dv不变；表仍同18行，不凭动画状态改数值 |
| cold link ch=ideal-model&b=2及P内相同拍 | 控件默认payload200/prop600/carryfalse、读数3295.84，几何phase一致；一次改值后URL保存 |

试一试与既有测试API：`__atlas.engine.sim()`读values和outputs，table的sources可核S90/S25；`copies('f1-outer')=4`、centre=1与J2同样核验。不用新的API；几何QA可读现有anchor/camera/visibility。解析失败要保留数据错误给构建，不替用户生成随意值。

### 3.8 文件与许可

施工生成src/content/topics/saturn-v/data/parts.json、sources.json、glossary.json、chapters/00–06.mdx及来源/审计记录。模型程序化，不新增大型外来网格。NASA参考PDF只用于核对，不作为部署图片；生成图与Atlas原创数据属于NC-SA内容家族，真实PD/CC0参考不带BY-SA派生义务。若后续选用Smithsonian/Commons网格，重新做条目许可；BY-SA绝不能与NC-SA图/derived data合并。[D04–D15]

## 4. 引擎现实核对与新增契约

**新增引擎工作为空。** 现有schema含lathe、vessel、curvedPanel、tube、extrude、radial repeat、poses；table提供有限控制组合的来源值；visible/rotate/offset可绑输出；章/拍可设置pose与sim.set。phase-driven显隐与绝对poses满足本题。没有假装现有能算轨道、火箭燃烧时序、可压缩流、再入热或刚体碰撞。

工程代理所需的精确实现输入在§3.7；只生成有来源的数值表和程序化parts，不添加sim.kind。发生schema/动作表达限制时按§3.5退路改用现成拍链接，不在prepared spec声称引擎已经支持未知字段。若后来扩大成连续起飞/着陆模拟，必须另起引擎brief，不能偷偷用这里SIM值驱动真实速度标签。

### 4.1 main 与本批未合并分支核对（2026-10-27，只读）

已运行各分支 `git log --oneline main..codex/<branch>`，并用 `git show codex/<branch>:<path>`读取契约；施工不导入未合并代码。main核对`src/engines/space-scene/schema.ts`、`sim-schema.ts`、`table-schema.ts`、`lib/beat-scene.ts`及docs/06。

| 位置 / 已有功能 | 本轮实况与处置 |
|---|---|
| main：程序化几何、radial repeat、绝对poses、table、visible/offset/rotate、flow、试一试/记录卡 | 本题组合现有能力；删除新增rocket sim、primitive、连续起飞/对接求解器的需要。主机构、sort/light/magnet/circuit/materials已在main，均无需复制 |
| codex/monsoon-engine：monthly climatology | log含e1eb305/b8b2725；show time-scene/schema.ts确认月态契约。本题不需要月气候层 |
| codex/sem-engine：orbit-rotation | log含5a0400d及后续修订；show space-scene/sim-schema.ts确认orbit-rotation。轨道知识用文本与既有发布题链接，本题不依赖其引擎 |
| codex/airfoil-content：airfoil | log含b1f97b5；show space-scene/sim-schema.ts确认airfoil。吸气/携带氧化剂对比复用已审静态图，不依赖其引擎或未发布页面 |
| codex/dinosaur：deep-time/Ma | main..分支log为空；show time-scene/schema.ts与main相同。该分支无本题需要的新增能力，地质时间单位不引入火箭构型 |
| codex/plates：reference/catalogue/impact | log含a0a2c0e/a7c9b80；show time-scene/schema.ts确认catalogueIndex/impacts/reference。此题不需要地图/灾害记录 |

**保留新增引擎项0；从需要中移除5类设想：火箭专用sim、额外primitive、轨道求解、对接碰撞、再入热求解。** 数值表、姿态矩阵与内容生成器属于主题数据工作；使用现有验证/测试API，不改shared core注册。

## 5. 名词表 EN / ZH（运行时15项）

| id | EN / ZH | 定义要点 / see |
|---|---|---|
| term-launch-vehicle | Launch vehicle / 运载火箭 | 提供发射与加速；BG |
| term-stage | Stage / 级 | 一段可分离的推进结构；02 |
| term-thrust | Thrust / 推力 | 排出推进物质带来的力；01 |
| term-propellant | Propellant / 推进剂 | 发动机排出的工作物质来源；01 |
| term-fuel | Fuel / 燃料 | 与氧化剂反应释放能量；01 |
| term-oxidiser | Oxidiser / 氧化剂 | 支持燃烧，火箭携带；01 |
| term-nozzle | Nozzle / 喷管 | 引导高速排气；01 |
| term-iu | Instrument unit / 仪器舱 | 测量引导与控制；02 |
| term-parking-orbit | Parking orbit / 停泊轨道 | 出发前的地球轨道；02 |
| term-tli | Translunar injection / 地月转移入轨 | 向月球转移的加速；02 |
| term-cm | Command module / 指令舱 | 乘员与返回；05 |
| term-sm | Service module / 服务舱 | 推进和支持；05 |
| term-lm | Lunar module / 登月舱 | 上升/下降两级往返月面；04 |
| term-heatshield | Heat shield / 防热盾 | 再入时保护舱体；05 |
| term-delta-v | Ideal speed change / 理想速度变化 | 只按质量比与排气速度的教学量；06 |

词形attestation见parent70词。部分词是暂译，不能称“新加坡课本标准用语”。

## 6. 来源（保留parent id；S01/S02显式映射）

| id | 来源 / locator | URL |
|---|---|---|
| S1（parent S01） | MOE Singapore · Primary Science syllabus (2023 cohort, Jan 2026 cached version) · printed pp.63–64,80; PDF pp.64–65,81 | https://www.moe.gov.sg/-/media/files/primary/syllabus/primary-science-syllabus-2023_may24.pdf |
| S2（parent S02） | MOE Singapore · 2020 Social Studies Primary syllabus, Jan 2024 update · printed p.25; PDF p.26 | https://www.moe.gov.sg/-/media/files/primary/2020-social-studies-primary.pdf |
| S19 | Boris Chertok / NASA SP-2011-4110 · Rockets and People, Vol. IV: The Moon Race · editorial cost discussion; participant memoir perspective | https://www.nasa.gov/wp-content/uploads/2023/04/sp-4110-vol4.pdf |
| S20 | Richard Orloff / NASA SP-4029 · Apollo 11 Mission Summary, Apollo by the Numbers · Lunar Surface; landing and step timestamps; sample mass; return | https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_11a_Summary.htm |
| S21 | NASA · Apollo 11 Mission Overview · launch, crew roles, docking, ascent, return | https://www.nasa.gov/missions/apollo/apollo-11-mission-overview/ |
| S24 | NASA · What Was the Saturn V? · dimensions; stage sequence; Apollo 4/8/9/10/11; 111 m | https://www.nasa.gov/learning-resources/for-kids-and-students/what-was-the-saturn-v-grades-5-8/ |
| S25 | NASA · Apollo 11 press kit (1969) · printed pp.110–115, Saturn stages and propulsion; PDF pages verified in reference audit | https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/a/Apollo_11.pdf |
| S26 | NASA spacecraft reference · Lunar Module and SLA overview · printed pp.61–68; descent/ascent and four legs | https://www.nasa.gov/wp-content/uploads/static/history/alsj/08_LM_%26_SLA_Overview_pp61-68.pdf |
| S27 | NASA Glenn · Solid Rocket Engine · oxidiser carried; thrust in vacuum | https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/solid-rocket-engine/ |
| S30 | Potvin et al., Disciplinary and Interdisciplinary Science Education Research (2023) · Falling bodies across schooling and experience · doi:10.1186/s43031-023-00075-4; context-dependent misconceptions | https://pmc.ncbi.nlm.nih.gov/articles/PMC10249391/ |
| S31 | Kavanagh & Sneider, Astronomy Education Review 5(2), 2007 · Learning about Gravity II. Trajectories and Orbits: A Guide for Teachers and Curriculum Developers · review, not a Singapore pupil survey | https://istardb.org/wp-content/uploads/tainacan-items/1018/19649/Kavanagh_Sneider_2006_Learning-about-Gravity-II-1.pdf |
| S38 | NASA · NASA images and media guidelines · US government work; third-party credits, marks and likenesses excluded | https://www.nasa.gov/nasa-brand-center/images-and-media/ |
| S39 | NASA Science · Apollo Press Kits · Apollo 11 historical drawings; as-planned not as-flown | https://science.nasa.gov/resource/apollo-press-kits/ |
| S40 | NASA Glenn · Specific Impulse · effective exhaust velocity background | https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/specific-impulse/ |
| S42 | Garber and Launius / NASA · A Brief History of NASA · Going to the Moon: costs; Skylab | https://www.nasa.gov/history/SP-4225/documentation/brief-history/history.htm |
| S43 | Paul Coffman / NASA NTRS · Rocketdyne J-2 Saturn V 2nd and 3rd Stage Engine · abstract: five plus one engines; S-IVB restart | https://ntrs.nasa.gov/citations/20100027318 |

| S15 | NASA · Apollo 1 · 27 January 1967 fire; crew; redesign | https://www.nasa.gov/mission/apollo-1/ |
| S16 | NASA StarChild · Vladimir Komarov · Soyuz 1 parachute failure | https://starchild.gsfc.nasa.gov/docs/StarChild/space_level2/komarov.html |
| S17 | NASA · Remembering Soyuz 11 · June 1971; crew names; pressure valve; Salyut 1 | https://www.nasa.gov/history/50-years-ago-remembering-the-crew-of-soyuz-11/ |
| S18 | Asif A. Siddiqi / NASA SP-2000-4408 · Challenge to Apollo, Part 2 · printed p.838 / PDF p.339: costs; N1 trials and Zond chapters | https://www.nasa.gov/wp-content/uploads/static/history/SP-4408pt2.pdf |

运行时source id要求`^S[1-9]\d*$`：parent的S01→S1、S02→S2；SR事实id不变。审计表保留parent编号以便回查，实际sources.json与Num/Source引用用合法编号；其余S19等不变。

S90：本spec §3.0–3.7、simulation-table.json，Atlas teaching model design study，2026-10-27，design:true。允许SIM数值有自描述来源，不将它伪装成NASA报告。

参考计划：R1 NASA press kit PDF p.113整栈/三主级尺寸与图；R2同PDF p.116–119推进组件；R3 S26 LM overview四支腿、两级、折叠；R4同press kit CM/SM剖视与接口。每次实际取图记D15的hash和页码，程序化机件不能随机添加“像航天器”的孔洞和零件。

| S44 | NASA Science · Moon Facts · Atmosphere/exosphere | https://science.nasa.gov/moon/facts/ |

| S46 | NASA / Apollo 204 Review Board · Apollo 204 Review Board: Findings, Determinations and Recommendations | https://www.nasa.gov/wp-content/uploads/static/history/Apollo204/find.html |
| S47 | NASA Glenn · Ideal Rocket Equation · 对数质量比公式，暂不计重量及阻力 | https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ideal-rocket-equation/ |
| S90 | Atlas · Saturn V teaching model design study · design:true | docs/61-saturn-v-content-spec.md；simulation-table.json |

## 7. 图像计划

| 文件 | 尺寸 | 用途 / EN+ZH图注 | provenance |
|---|---|---|---|
| `art/planned/saturn-v/saturn-v.png` | 1024² | The complete lunar-launch stack. / 完整登月发射构型。[SR039–043] | 新生成，完整主体、三主级外形、无字无旗 |
| `saturn-v-apollo-cutaway.png` | 1536×1152 | Three couches in the command module, service equipment beneath. / 指令舱的三个座位，下方是服务设备。[SR044] | copy parent `space-race-apollo-cutaway.png`，reusedFrom必填 |
| `saturn-v-air-breathing-engine.png` | 1536×1152 | A turbofan takes in air; a rocket carries oxidiser. / 涡扇吸入空气；火箭自带氧化剂。[SR047] | copy main planned `how-planes-fly/how-planes-fly-turbofan-cutaway.png`，reusedFrom必填；不是F-1图 |

图像不代替计数模型。Apollo图说明是解释性剖面，不作精确RCS喷嘴计数或罐数图；座位与CM/SM功能必须可读。全部按现有illustrate管线生成灰度alpha输出，manifest记录生成prompt、tries、复用来源、可验证的counts和PNG审计。

## 8. 施工与验收

顺序：spec定稿→参考与许可→S-IC发动机布局/LM几何样件→全栈与构型pose→18行理想表/3行真实stage表/13行phase表→BG/03/04样章→其余双语与拍→R2/R3/R4视觉→事实/代码审计→发布门槛。

- [ ] 35拍、7章（含BG）；各拍EN/ZH、事实id、可见对象与index路径齐全。
- [ ] 3主推进级；F-1 1+4、S-II J-2 1+4、S-IVB J-2 1，共11台主发动机；无多画发动机。[SR039–041]
- [ ] 储箱位置与推进剂正确，LOX不写成fuel；J-2重启不画成第二台发动机。[SR040–042]
- [ ] LM只有一份：收在SLA时不在旁边同时展示；收腿包络、4支腿、1梯、两个前窗及两级独立发动机核过。[SR043–046]
- [ ] CM三座、完整heatshield；只CM返回；LES与对接probe抛弃按§0明确修正，不能留到再入。[SR044；S25]
- [ ] 下级五喷管无穿插；模型高度/直径/接口对照参考图；剖视后仍有40–55%壳轮廓。
- [ ] extracted/docked/rendezvous的两对接口坐标间距≤0.05m；全部cabin/tanks/thrusters随父构型刚体变换，无悬空零件。
- [ ] 18行ideal表数量与每行来源正确；4个预期数值误差<0.005m/s；TYPICAL表5/5/1；phase13种全部可复现。
- [ ] 不新增无依据推力/温度/真实燃料余量曲线；理想模型有显著SIM标签和忽略损失说明。
- [ ] 图像新/复用manifest、原图hash、准确性限制齐；涡扇从不冒充F-1。
- [ ] paper/cinema、EN/ZH、手机/平板/桌面，无HUD重叠；44px；无hover-only。
- [ ] draw calls目标<100上限150、triangles<300k目标、上限1.5M；重复件实例化；没有无限燃烧粒子或静止时连续渲染。
- [ ] 实际执行pnpm check/validate/test/build；浏览器门槛按本轮BRIEF在sandbox跳过，交主session运行：e2e端口5449，`pnpm shoot saturn-v --keys --layout --beats`，亲看全拍、index和构型边界；不把未运行门槛记为通过。
- [ ] 最终saturn-v按用户目标published；space-race状态独立处理。

## 9. 施工记录（2026-10-27）



### 9.1 内容与数据交付（2026-10-27）

- `src/content/topics/saturn-v/`：按指定`published`。背景orientation + carried-oxidiser、stages-and-mass、docking-and-extraction、lunar-module、home-in-the-cone、ideal-model；7章各5拍，共35拍。中英主叙述、细看、字幕、逐章对象索引完整；15个名词在两语言各首现包一次，24条来源。
- `data/parts.json`：33个可选零件定义、5实体组+1流组、3条flow各5路径、13个绝对pose、6镜头。main-engine实例为5/5/1，CM三座，LM四腿一梯双前窗及独立上下发动机。1场景单位=1m，整栈111m。程序化生成器为`scripts/geo/saturn-v/build-parts.ts`，不依赖主checkout的gitignored文件即可重新生成。
- `sim.kind=table`：5控件，17输出；ideal实验3keys/18rows，stage实验1key/3rows，phase-state实验1key/13rows。默认m0=900,mf=300,dv=3295.836866004329；carrytrue为1000/400/2748.872195622465。SIM行引design:true S90；TYPICAL发动机数引S25，标成参考级发动机而非当前燃烧数量；02章分级拍同时把参考级切到first/second/third，停泊及向月球出发读数为1。
- engine items：保留0项，删除/设计绕过5项推测性扩展（§4）；未改引擎或package文件，不依赖未合并分支。
- 图：新image_gen封面1024²，已看最终PNG；Apollo剖视与涡扇两章图按准备复用。`scripts/illustrate.ts`处理为封面800²/1600²及章图1200×900。新图透明边、灰度审计通过；prompt、SHA-256和reusedFrom在主题`ILLUSTRATIONS.md`，原图保存在工作树`art/planned/saturn-v/`。
- `tests-e2e/saturn-v.spec.ts`：9个浏览器验收用例，端口5449；smoke更新为35个published主题、70枚badge、science11、末张Plate35，姊妹topic状态不改。docs/04增加本题条目。`REVIEW.md`中文优先默认决定，`AUDIT.md`记录来源/设计量边界。

### 9.2 无引擎适配与准备稿修正

1. 既有choice最多12options，准备稿13phase choice不可解析。使用**现有step控件0–12**，按launch、first-off、parking、translunar、separated、turned、docked、extracted、lunar、ascent、rendezvous、homeward、return映射；新增数据输出configuration-name为双语state。13构型与命名poses都保留，phase绑定保证显隐与几何同步。试一试不暴露原始数字phase选择器。
2. 预设lander改为lander-view，避免与实体组全局重名；仍6镜头。整栈相机拉远，移动构型使用各自局部相机；orientation第3拍的SLA投影出框已由单测发现并修正。
3. 既有Beat组件仅支持MathScene解释拍，不用于SpaceScene。各章细看提供相对`?ch=...&b=N`原生导航，先恢复该零件可见构型再点索引；会重载页面/该拍默认值。没有新增组件或状态路径。
4. 单一重复件的四腿不能分别铰接；收拢采用XZ压缩终态、单前梯按挂点压缩的**示意包络**，不声称真实折叠路径。展开足垫共面。全部175140个LM网格顶点在收拢SLA内，最小径向间隙0.2033m。对接/抽取/交会接口间距均由独立矩阵单测核对≤0.05m。
5. 新S47直接支持理想火箭对数方程；S40只支持有效排气速度背景。LES从parking隐藏，probe在homeward/return隐藏。返航拍不标隐藏的SM。未发布关联题href省略并列入REVIEW；无新第三方许可例外。

### 9.3 几何审查与待主 session 浏览器门槛

本轮先看NASA PDF 113/116/100/101/91页，后以实际引擎几何生成离线SVG/PNG查看完整栈、LM、对接及返航轮廓；原始参考和离线预览不部署。离线网格为41个合并材质piece、157908三角形，**不是浏览器draw calls**。窗口可见性另以实际三角形射线核查，两扇前窗都在舱面前；SVG painter的一侧细缝是排序伪影。

按BRIEF，本轮未运行shoot/e2e，没有打开/控制用户浏览器或桌面。主session须运行完整shoot（35拍、tasks、keys、layout、EN/ZH×paper/cinema，含390×844手机）与`CI=1 ATLAS_E2E_PORT=5449 pnpm e2e`。runtime标签遮挡、材质、44px目标、布局、draw calls及GPU表现仍须该门槛实测，未标为通过。请Gavin检查译名、折腿示意、理想实验措辞及索引两步读法，详见REVIEW。


### 9.4 非浏览器门槛结果

- `pnpm check`：765文件，0errors、0warnings、3个既有hints（warring-states两个未用import，既有sim.test一个未用参数）；本题新增unused hint已清除；最终改动后另跑`pnpm exec tsc --noEmit`也通过。
- `pnpm validate`及构建前校验：58topics，0errors、0warnings。
- 首次默认`pnpm test`：4326通过，既有energy.test守恒遍历一例因5000ms超时失败；单独重跑energy.test为64/64通过。为消除并发负载影响，再以`pnpm exec vitest run --maxWorkers=2 --testTimeout=15000`全量复跑：**161files、4327tests全部通过**（124.27s）。其中本题50测试包含实际网格/接口、全部13相位、35拍标签和相机投影、18行理想表与参考级读数，不把浏览器未运行当通过。
- `pnpm build`：静态构建成功，119pages，PWA precache146entries；最终交付构建再次成功（127.76s），打包数据的零件说明与参考级发动机标签已与工作树逐项核对一致。未改引擎、依赖或锁文件。
- `git diff --check`：通过。全部更改留在工作树；没有git写入、提交或合并。浏览器门槛及Gavin审阅范围见§9.3与REVIEW。

### 9.5 浏览器验收（2026-10-27，Claude）

看了什么：`pnpm shoot saturn-v --beats --layout --keys` EN/ZH × paper/cinema，35拍×4套截图、8个视口含1024×768与390×844、封面PNG、章图渲染、模式截图；另用单拍复现核对每条“no label”提示。

- **引擎小修（带测试）**：渲染器远裁剪面固定200，而整栈远景相机离目标230m，运行时整枚火箭被裁掉（只剩标签）。`lib/camera.ts` 新增 `cameraFar(minDistance, radius)`（小模型仍为200，大模型取缩放上限+半径），`CameraRig` 在模型加载后设置；`tests/space-scene/camera.test.ts` 加1例。只对模型半径大于约10.5m（缩放上限+半径超过200）的主题有影响：本题，以及 steam-engine / energy-conversion 等约12m的模型，其远裁剪面由200增到约250，没有可见变化（steam-engine、energy-conversion、aircon 已跑 `--beats --keys` 回归）。
- **镜头/数据修正**：整栈镜头（hero/stages及各章引用）目标下移到y=45、拉远，使整栈落在底部字幕条上方；tank镜头拉远，两个储箱和各自标签同时在屏；docking第1拍拉远降低，使折叠支腿可见；orientation第3拍拉远，露出逃逸塔并加标签；orientation第2拍与stages第1拍改 xray（S-II 壳的标签在非 xray 下被自身储箱遮挡而淡出，且字幕谈的是各级发动机）。
- **索引补洞**：orientation正文与第1拍字幕提到逃逸系统，但`les-tower`不在本章index；已加入（同时是第1、3拍标签）。05章正文提到“逃逸塔与对接探杆已不存在”，它们在该章任何一拍都不可见，故不入索引（按设计，见REVIEW）。
- **测试修正**：`tests-e2e/saturn-v.spec.ts` 的读数断言改为匹配千分位（界面显示 `3,295.84`）；试一试是步进按钮（上一值/下一值），不是按值的按钮，改为点步进按钮；刷新后等 `ready`。
- **数字**：beats 35/35 在四套均落地、0 beat failure，35/35 beat link 落在同一场景；layout 4套×8视口 0 issue，console clean，页面JS 501.6 KB gz；keys 全部 OK；`--perf --gpu`（Apple M5 Max / ANGLE Metal）最大 41 draw calls / 157,908 三角形（预算 <100 目标、上限150；<300k），全章与全部模式 ≈60 fps（受机器负载限制，不是上限）。
- **封面**：三个主级、仪器舱环、渐缩适配器、服务舱、指令舱、骨架逃逸塔、细长比例、无字无旗均正确，但S-IC底部只画出四个F-1喷管、中央一台不可见，写入 `FIXES.md`（由 Codex 重做，未手改）。
- **LM收腿示意**：docking第1拍近看，四支腿收在下降级下方、脚垫落在IU环上，读作“收拢”，没有穿出适配器壳；仍是示意（REVIEW已声明）。
- **截图伪影（非缺陷）**：机器负载约200时，若干拍的首帧画布尚未绘出（只见标签），隔几秒后单拍复查均正常；“no label”与“chapter highlights”提示每次落在不同的拍上，单拍复现全部通过。
- **剩余**：封面重做（FIXES.md）；sibling `space-race`/`sun-earth-moon`/`how-planes-fly` 的回链仍待其发布后补；Gavin 请看译名、折腿示意、索引两步读法。
