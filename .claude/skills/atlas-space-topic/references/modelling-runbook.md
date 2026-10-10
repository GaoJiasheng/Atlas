# 建模手册（参考图 → 程序化零件 → 写实轮次）

范本：`src/content/topics/aircon/data/parts.json`（36 个机器零件 + 1 个 context 墙）与 docs/12 §14、§16。参数的权威定义：`src/engines/space-scene/schema.ts`；行为：docs/06「SpaceScene · 作者怎么写数据」。方法：skill `industrial-3d-showcase` 的 `master-spec.md` B（参考资料）、D（程序化几何）、E（材质），`rounds.md` R2–R4，`perf-lessons.md`。

## 1. 参考图先行

Gavin 对空调第一版的反馈是"太抽象"：结构没对上真机。写实轮次（docs/12 §16）的方法就是：**先找参考、逐张看，再建模，再并排对照两轮**。

- **去哪里找**（只用 CC 或公有领域，许可在页面上抄原文核对）：
  - Wikimedia Commons：实拍照片（`File:` 页写作者和许可）、示意图（常为 GFDL / CC BY-SA）。
  - 专利：Google Patents / USPTO 的**美国专利附图是公有领域**，拆壳内部结构、剖面、零件编号最清楚（空调的室外机内部全靠 US 10,145,601 的图 3–5）。只用来定拓扑和位置，尺寸按本设计。
  - 博物馆与开放馆藏：Smithsonian Open Access（CC0）、Biodiversity Heritage Library（多为公有领域的老图版，生物解剖图首选）、Internet Archive 上的公有领域教科书插图、各馆 Open Access 页。
  - 生物：BHL 的昆虫学 / 解剖学图版、Commons 的显微照片和标本照片、开放获取论文的图（CC BY，逐张看许可）。
- **放哪里**：`scripts/geo/<slug>/refs/`（脚手架建好，`.gitignore` 只放行它自己）。文件名 `NN-<看什么>-<来源>.<ext>`，如 `05-indoor-section-US11073302-fig2.png`。参考图**不进 git、不进站点、不当贴图**（master-spec B4、fact-discipline §6）。
- **记在哪里**：spec §9.1 的参考图表（文件、来源、许可、看什么）；看不到的内部结构写明用什么推断。
- **至少覆盖**：整体 3/4 视角、正 / 侧轮廓、内部（拆壳 / 剖面 / 解剖）、每个 Tier-1 部件的近景。找不到实拍的部分用专利图或公有领域图解补，并在已知差距里写。

## 2. 坐标、尺度与布局

- 单位米，Y 向上，+Z 朝观者，+X 向右，地面 y = 0；真实尺寸（F-# 事实表）直接当场景尺寸。
- 小对象（昆虫、手表、耳朵）照样用米，镜头近（`fov` 不变，位置拉近）；在细看和 ARCHITECTURE 比例尺上读得出真实大小。如果 1 cm 的对象让引线和阴影难看，可整体放大 N 倍，但在 spec 决策表与 `note` 写"放大 N 倍"。
- **示意布局**（schematic layout）：真实摆放看不全时（室内机贴墙、室外机在墙外几米），可以并排、朝向观者、缩短连接件；在 `topic.yaml` 的 `note`（"示意布局 / schematic layout"）、context 零件的 `detail`、spec 已知差距三处写明。比例与零件拓扑不许示意。
- 先定大件包络和中心（spec §3.1），整体模型半径决定投影门槛（≥ 0.28 × 半径的零件自动投影）和标注预算。

## 3. primitive 速查

`at` 是零件中心（场景坐标），`rotation` 是 XYZ 欧拉角（度），`color` 是材质族或 `token:` / `#hex`，`tint` 给材质族换颜色、保留质感，`mirror: "x"|"y"|"z"` 在自身坐标里先镜像再旋转。圆形件（cylinder、vessel、flange、lathe、blades、grille rings）都绕自身 Y 轴，用 `rotation` 转向：轴沿 X 写 `[0, 0, 90]`，轴沿 Z 写 `[90, 0, 0]`。

### 积木（`size`）

| kind | size | 例 | 用途 |
|---|---|---|---|
| `box` | [宽, 高, 深] | `{ "kind": "box", "size": [0.15, 1.45, 0.42], "at": [0, 0.725, -0.06], "color": "plastic" }` | 墙、隔板、磁钢块 |
| `cylinder` | [上半径, 下半径, 高] | `{ "kind": "cylinder", "size": [0.0065, 0.0065, 0.04], "at": [1.0, 0.13, 0.07], "rotation": [0, 0, 90], "color": "brass" }` | 短管接头、轴、销 |
| `cone` / `sphere` / `torus` / `capsule` | [r, 高] / [r] / [r, 管粗] / [r, 长] | `{ "kind": "sphere", "size": [0.004], "at": [0.1, 0.2, 0], "color": "glass" }` | 复眼、关节球、O 形圈、体节近似 |
| `plane` | [宽, 高] | 双面薄片 | 翅膜、标牌底板（无贴花） |

### 工程零件

| kind | 例（要点） | 用途 |
|---|---|---|
| `bevelBox` | `{ "kind": "bevelBox", "size": [0.78, 0.012, 0.29], "bevel": 0.004, … }`；`bevel` < 最短边一半 | 外壳板、底盘、电控盒；**比 box 更像实物**（真实倒角） |
| `tube` | `{ "kind": "tube", "path": [[-0.3,0,0],[0,0,0],[0,-0.4,0]], "radius": 0.0032, "bendRadius": 0.03, "at": […] }`；`path` **相对 `at`**（≤ 64 点），每个拐角同一弯半径（默认 3 × radius，不得小于 radius），管端开口 | 管路、软管、电线束、气管、血管、肠道 |
| `flange` | `{ "kind": "flange", "radius": 0.07, "thickness": 0.004, "boltCount": 3, "boltRadius": 0.06, … }` | 法兰、底座板 + 螺栓头 |
| `fins` | `{ "kind": "fins", "size": [0.032, 0.026, 0.0016], "count": 18, "gap": 0.0336, "axis": "x", … }`；`size = [a, b, 片厚]`，沿 x 叠时板是 [片厚, b, a]（a 是深度 z）；≤ 512 片、一次绘制 | 散热片、导风叶、肋骨、鳃丝 |
| `vessel` | `{ "kind": "vessel", "radius": 0.034, "length": 0.11, "headRatio": 0.5, … }` | 罐、储液器、卵、囊 |
| `panelHole` | `{ "kind": "panelHole", "size": [0.756, 0.52, 0.01], "hole": { "r": 0.205, "at": [-0.142, 0] }, … }`；XY 平面、一个圆孔（整个在板内） | 风扇口面板、带圆孔的盖板 |

### 成形零件（写实轮次加的，`lib/shaped.ts`）

| kind | 例（要点） | 用途 |
|---|---|---|
| `lathe` | `{ "kind": "lathe", "profile": [[0,-0.135],[0.055,-0.113],[0.055,0.09],[0,0.135]], "segments": 48, … }`；轮廓 [r, y] 绕 Y 转，首尾在轴上（r = 0）= 封闭体（剖切填剖面），同一点写两次 = 硬边；`segments: 6` = 六角 | 压缩机壳（封头、焊缝）、电机、轮毂、螺母、瓶、**体节、触角节、腿节、茎** |
| `extrude` | `{ "kind": "extrude", "shape": [[x,y]…], "holes": [[[x,y]…]], "depth": 0.012, "bevel": 0.002, "rotation": [0, -90, 0], … }`；XY 轮廓（≤ 160 点、≤ 16 个孔）沿 Z 拉伸、居中；沿 X 拉伸写 `[0, -90, 0]`（轮廓 x = 场景 z），平面图沿 Y 拉伸写 `[90, 0, 0]` | 侧轮廓端盖、开槽侧板（孔 = 槽）、接水盘截面、导风板截面、**翅、叶片、甲片、骨板** |
| `curvedPanel` | `{ "kind": "curvedPanel", "radius": 0.8, "angle": 14, "height": 0.776, "thickness": 0.005, "segments": 24, "rotation": [-3, 0, 90], … }`；圆柱面一段（轴 ‖ Y），`at` = 外表面正中，法线 +Z；横放写 `[倾角, 0, 90]` | 凸面前板、圆角过渡、弧形壳、**鞘翅、外骨骼背板** |
| `blades` axial | `{ "kind": "blades", "layout": "axial", "count": 3, "radius": 0.188, "hub": 0.042, "chord": 0.2, "twist": 14, "sweep": 38, "pitch": 34, "thickness": 0.004, "rotation": [90, 0, 0], … }` | 轴流风扇、螺旋桨、涡轮级 |
| `blades` barrel | `{ "kind": "blades", "layout": "barrel", "count": 35, "radius": 0.048, "hub": 0.036, "chord": 0.016, "sweep": 28, "thickness": 0.0012, "length": 0.6, "discs": 9, "rotation": [0, 0, 90], … }` | 贯流风扇转子、鼠笼 |
| `coilBank` | `{ "kind": "coilBank", "rows": 2, "cols": 23, "pitch": 0.021, "tubeRadius": 0.0036, "length": 0.422, "finPitch": 0.0045, "finDepth": 0.036, "shape": "L", "legs": [0.422, 0.175], "corner": 0.05, "bends": "none", … }`；管沿 X，`bends: both / none / only`（`only` = 单独的回弯零件，铜色），`tubeColor` 默认 copper；一个零件两种材质 = 两次绘制 | 蒸发器、冷凝器、散热器、暖气片 |
| `grille` rings | `{ "kind": "grille", "style": "rings", "radius": 0.201, "count": 10, "spokes": 8, "bar": 0.0016, "rotation": [90, 0, 0], … }` | 风扇护网 |
| `grille` slats | `{ "kind": "grille", "style": "slats", "size": [0.756, 0.128, 0.007], "count": 64, "bar": 0.0034, … }`；`size = [w, d, h]`，格条沿 d、沿 w 排列，带边框 | 进风格栅、滤网、百叶 |

### 有机零件（生物，`lib/sweep.ts` / `lib/wing.ts`）

| kind / 字段 | 例（要点） | 用途 |
|---|---|---|
| `sweep` | `{ "kind": "sweep", "path": [[0,0,0],[0.4,0.3,0.1],[0.8,0,0.2]], "radius": [0.06,0.05,0.02], "section": { "flat": 0.5 }, "up": [0,0,1], "rings": { "every": 0.05, "depth": 0.12 }, … }`；平滑曲线（centripetal Catmull-Rom）穿过 path（相对 `at`，≤ 128 点）；radius 一个数或每点一个；`section` round / flat / u / `{flat}` / `{u, flat?}`（flat 沿 `up` 压扁，U 的开口背向 `up`）；`hollow` 壁厚（剖切看到腔）；`caps` round / flat / none；`closed` 闭环；默认 radial 16（U 20），segments 按长度与环节自动 | 足各节、触角（`rings` = 分节）、须、消化道（`hollow`）、马氏管、气管（`rings` = 螺旋丝）、神经、背血管（radius 轮廓 = 心室膨大）、前胸背板（`section: u`）、腹部（radius 轮廓 + rings） |
| `wing` | `{ "kind": "wing", "outline": [[x,y]…], "veins": [[[x,y]…]…], "thickness": 0.004, "fold": { "hinge": [0,0], "segments": 8, "lead": [1.9,0], "rest": 0 }, "rotation": [90,0,0], … }`；外形在 XY（厚度沿 Z），`rotation: [90,0,0]` 把它放平（轮廓 y → 场景 +z）；翅脉 = 墨色细线（`membrane` / `glass` 一层在中面，不透明翅两面各一层）；`fold` = 扇面折叠，`fan` 0 收拢 / 1 = 按 outline 展开；`rest` 静止时的 fan（默认 0） | 覆翅（`chitin` + tint，可不写 fold）、后翅（`membrane`、`fold`）、鳍、花瓣 |
| `scale` | 任意 primitive 上 `"scale": [sx, sy, sz]`（> 0）：沿自身轴先缩放，再 `mirror`、再 `rotation` | 椭球（复眼、脑、神经节、卵、气囊）、椭圆截面的 lathe 头壳 / 体节 |

## 4. 零件级开关

| 字段 | 写法 | 何时用 |
|---|---|---|
| `extra` | `"extra": [primitive, …]`（≤ 16，`at` 也是场景坐标） | 一个功能件由几块组成（压缩机 = 壳 + 接线盒 + 底板；阀 = 阀体 + 阀帽 + 接口）。随零件移动、淡出、拆开、repeat、转动；引线指向主 `primitive`。同材质的块烘焙合并成一次绘制 |
| `repeat` 线性 | `{ "count": 2, "axis": [0, 1, 0], "spacing": 0.08 }` | 成排的同件（两只阀、两颗螺母、端盖、腿的左右对、体节） |
| `repeat` 环形 | `{ "count": 6, "axis": [0, 1, 0], "radius": 0.026 }`（每个实例朝外转） | 磁钢、叶片、花瓣、螺栓圆 |
| `mirror` | primitive 上 `"mirror": "x"` | 左右对称的轮廓（左端盖、左侧腿、左翅），配一个不镜像的右件 |
| `shell` | `"shell": true` | **X-RAY 时变透明的件**：外壳、面板、鳍片 / 盘管、管子、保温层、皮肤 / 外骨骼。主题里有任何 shell 时，非 shell 件在 X-RAY 下保持实心（机器本体、器官）；空调把盘管和铜管也设 shell，管里的冷媒粒子才看得见 |
| `context` | `"context": true`，可不写 `group` / `explode`，放在 `parts` 末尾 | 场景件（墙、地面、展台、花茎、水面）：画出来，但不标注、不可选、不编号、不进链路卡、不拆开、默认不投影 |
| `castShadow` | `true / false` | 覆盖自动判断：长细管、贴墙的件、悬空的室内机设 `false`（投在地面上读作悬空）；context 墙要影子设 `true` |
| `explode` | `{ "dir": [0, 0, 1], "dist": 0.3 }` | 按**装配逻辑**拆：外壳向外、面板向前、内件沿可拆方向；不许每个螺栓乱飞。`hide` 也沿这个方向移出 0.25 × dist |
| `connects` | 零件 id 列表 | 右上零件链路卡的连线与详情卡芯片：按真实连接（管路、电线、关节）写 |
| `bilateral` | `true`，或 `{ "axis": "z", "side": "left", "labelBoth": false }` | 成对的结构（复眼、触角、足、翅、上颚、气门、卵巢）：只建 +Z 一侧，引擎镜像出 `<id>-r`（几何、材质、拆开方向、动画、姿态、`connects` 都镜像）；镜像件不另编号、不进链路卡，每材质槽 +1 draw call |

## 5. 材质族

`casing`（拉丝铝：鳍片、铝件）、`steel`（机加工钢：轴、转子、挂板）、`powder`（缎面粉末涂层，默认黑；`tint` 改浅灰外壳）、`stainless`（轴向拉丝不锈钢管）、`copper`、`brass`（阀门、螺母）、`rubber`（近黑：保温、软管、垫脚）、`plastic`（哑光暖砂色）、`enamel`（暖白烤漆：家电外壳）、`glass`（半透明）。旧名 `metal` = steel、`matte` = plastic。

- 每个材质族要在截图里**可辨**（master-spec E）：外壳 vs 内件 vs 管路 vs 框架。dark plate（cinema）下再看一遍：深色件不能糊成一片。
- 产品本色用材质族 + `tint`（`"color": "powder", "tint": "#b3b6b1"`），不要直接写 `#hex` 当 `color`（会丢掉粗糙度贴图）；token 颜色会随主题翻转，产品本色用 hex。
- **生物**：`chitin`（半光泽角质：外骨骼、足、覆翅；`tint` 给物种本色）、`membrane`（半透明 .55、双面、不写深度、不填剖面：后翅、鼓膜、气囊）、`tissue`（哑光软组织 + 微弱自发光仿透光：消化道、腺体、卵巢、卵；按器官 `tint` 低饱和粉 / 赭 / 乳黄）、`muscle`（纤维法线：伸肌、屈肌、飞行肌）、`trachea`（白、环纹法线）、`nerve`（淡黄：脑、神经节、神经索）、`eye`（深色高光 + 六边形小眼法线）。sweep 的 UV 沿管长按周长归一，纤维 / 环纹密度跟管径走。不用"血腥红"；dark plate 下每族都要读得出。绒毛、湿润高光仍是缺口。

## 6. 写实轮次（D：R2 → R3 → R4）

每轮只改本轮范围（`rounds.md`），结束时 `pnpm build && pnpm shoot <slug> [--perf --gpu]` → 看截图 → 列差异 → 直接修 → 再截图。

### R2 几何与比例（至少两轮并排）

1. 为每张关键参考图摆一个相近的镜头：自定截图表（`pnpm shoot <slug> --shots mine.json <name>`，表项 `{ "chapter", "preset", "modes", "hud": false, "js": "…" }`），或临时预设；用 `__atlas.stats().camera` 读回当前真实镜头。
2. 把截图和参考图左右拼成一张（`sharp` 已在依赖里；拼图脚本放 scratchpad，不进仓库），存 `docs/screenshots/<slug>/geo-<视角>.png`。
3. 逐块对照：外包络比例、开口位置、Tier-1 部件的位置 / 体量 / 数量、重复件的节奏、管路走向与接口、对称性。差异写进 spec §16 的表（图 / 参考 / 差异 → 修正）。
4. 修几何（不改 HUD），再拍，再对，直到 Tier-1 全对。

**干涉检查**（每轮）：临时脚本读 `parts.json`，用 `src/engines/space-scene/lib/parts.ts` 的 `partBounds` / `primitiveLocalBox` 取每个零件的包围盒，两两求交，静止和全拆开（位移 = dir × dist）各一遍；管子按路径点 + 半径做球体扫掠检查。圆柱、旋转件按盒近似会有假阳性，逐条看。空气 / 液体流的路径点也对实体查一遍（粒子不穿实体）。结果写进施工记录（空调：只剩同一盘管的 0.8 mm 相接和假阳性）。

### R3 材质与灯光
材质族分得开；`hero-clean`（HUD 关、封面镜头 `views.cover`）能直接当作品集封面：主体完整、阴影完整、无穿模、主体占宽 65–80 %。两套主题各看一遍。

### R4 流与动画
- 流沿真实通道走（管内、风道内、血管内），不穿实体；分段流首尾坐标完全相同、`ends: "open"`；粒子通量连续（`count / 长度 × speed` 各段相近）；液体段密而慢、气体段疏而快。
- 路径按弧长每 8 mm 烘焙一个点（64–512 点），弯头偏差 ≤ 3 mm；盘管里只画 2–3 程，不逐根追回弯。
- 转速是**可读的视觉速度**（叶片 60 fps 时每帧转角 < 半个叶片间距，否则看着倒转）；真实值只写在 STATE 与细看。
- 记录 FLOW 开前后的 draw calls（增幅 < 10）。

## 7. 预算与实例化

- 每个零件每个材质槽一次绘制（`extra` 同材质合并、`repeat` 同材质合并或实例化、`fins` 一个 InstancedMesh）；投影件另有阴影绘制；每条流一次；地面 2 次。
- 目标（1920×1080）：静止 < 50 calls、运转 < 60（上限 100）；三角形 < 0.3 M（上限 1.5 M）。空调：静止 50 / 0.136 M，FLOW 57。
- 降开销的顺序：合并同材质的 `extra` → 关掉小件和长管的投影 → 降 `segments`（lathe 48 → 32、六角件 6）→ 减流的 `count`。**不要**先删识别度高的大件或把管子简化成线（`rounds.md` R8）。
- `pnpm shoot <slug> --perf --gpu` 读 calls / triangles / fps；SwiftShader 下只报 calls 和三角形，不报 fps。

## 8. 已知限制（写进 spec §12，决定绕过还是补引擎）

- **同一时刻一个剖切面**：`views.cutaway` 或一个命名 `views.cuts`（章 / 拍切换，如矢状 / 胸部横切）同时切所有零件，不能每个部件选最佳剖切位置；剖面填充在鳍片块上读作实心色块。
- **盘管只有平直和 L 形**：弧形盘管用两三段倾斜的平直 `coilBank` 拼。
- **鳍片片距**：真实 1.2–1.8 mm 会出摩尔纹，模型用约 4.5 mm，detail 里写真实值。
- **没有贴花与文字**：铭牌、标签、屏幕、斑纹、纹理图案都不能上模型。
- **动画**：rotate / oscillate / pulse（可绕 `pivot`，pulse 可分轴）+ `sequence` 关键帧 + `poses`（章 / 拍缓动）覆盖了铰链开合、关节屈伸、扇形展翅；仍没有沿身体传播的波（蠕动、心跳波：B15）、没有骨骼蒙皮。
- **流不随拆开移动**：EXPLODED 时 FLOW 禁用。
- **软体有限**：`sweep` / `wing` / `scale` 给出有机外形，但没有软体变形、蒙皮、毛发；翅膜没有沿翅变色（`tintStops` 未做，用 `tint` 单色）；`variants`（同一模型逐龄长大）未做。
