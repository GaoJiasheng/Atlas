# MASTER SPEC — 通用总规格

由 SANDWORM MK-X、MHI 燃气轮机、Eaton/Boyd ROL4000 三份主 prompt 合并提炼。
`{花括号}` 处按 `BRIEF.md` 填写；按原型（`archetypes.md`）取舍模式。

## 目录

A. 目标与定位 · B. 参考资料规则 · C. 视觉方向 · D. 程序化几何 · E. 材质 · F. 灯光 ·
G. 动画 · H. 模式 · I. HUD · J. 3D 标注 · K. 镜头 · L. 键盘 · M. 性能 · N. 响应式 ·
O. 代码组织 · P. 自动验证 · Q. 完成标准

---

## A. 目标与定位

做一个可交互的 Three.js 3D 展示页：

```text
{PROJECT TITLE} — {SUBTITLE}
{CHAIN · OF · MAJOR · SECTIONS}
```

目标不是网页 demo，而是：

**Industrial Engineering Visualization / Museum-grade Technical Cutaway / Portfolio-grade Product Animation**

第一眼应像「{品牌或世界观} × 精密工程 × 工业设计 × 技术文档 × 博物馆展陈」，而不是 Three.js demo、游戏模型、赛博朋克 UI、科幻飞船。

---

## B. 参考资料规则

1. 先逐张看所有参考图（视频先抽帧），再编码。
2. 优先级：用户现场照片 / 视频 > 官方产品图 / 官方剖视图 > 工程推断。两者冲突时以用户实拍的可见形态为准；官方资料用于补齐看不见的内部机械逻辑。
3. 官方参数只作为尺度和动画逻辑的参考，不把展品型号写死（例：现场燃机不宣称一定是 M701JAC）。
4. 参考图默认不作为运行时资产嵌入页面；例外：真实产品的 logo / 面板 decal 可从官方照片裁切、透视校正后使用（不得把整张照片贴到盒子上冒充几何）。
5. 真实主体请同时遵守 `fact-discipline.md`。

---

## C. 视觉方向

风格名（选一或自拟）：`SILVER FOUNDRY TECHNICAL PLATE`、`THERMAL SYSTEMS ANATOMY`、`INDUSTRIAL CONCEPT DESIGN SHEET`。

关键词：精密机械工业设计 · 高端工业产品摄影 · 工程剖视图 · 现代工程博物馆展陈 · 瑞士平面设计式技术 HUD。

**底色**：暖象牙 / 暖浅灰，`#EDE6D8`（纸感，适合环境场景）、`#E7E5DF`、`#E7E6E2`/`#EFEDE8`（中性展台）。雾色 = 底色。可选：极淡的 SVG feTurbulence 纸纹（multiply，opacity ≤ .45）+ 边缘暖色 vignette。

**墨色**：Graphite `#292A28` / `#2A2824`；次级 `#555047`；弱化 `#857D70`；hairline `rgba(42,40,36,.3)`。

**主体色**按主体真实材质：
- 银灰重工：Brushed Aluminium `#BFC1C0`、Titanium Silver `#9A9EA0`、Light Aluminium `#D5D6D2`、Gunmetal `#45494A`、Dark Steel `#292D2E`。
- 产品设备：satin black powder coat `#171A1B–#25292A`、brushed stainless `#B7B9B6`、cast aluminium、muted industrial red couplings。
- 概念生物 / 载具：风化米白陶瓷装甲，缝隙和边角脏污磨损（不要锈蚀废土）。

**功能色**（只在 FLOW / THERMAL / X-RAY 等模式里出现，每种只表达一个含义，低饱和）：
- 冷 / 一次侧：steel blue / blue-grey
- 热 / 燃烧：muted amber → burnt orange → oxide red，向下游逐渐降温到 warm grey
- 二次回路：desaturated teal / muted copper
- 强调 + X-RAY：signal orange `#CC6328` + cyan `#3A9AA0`
- 剖切面：ochre `#B8973C` 一类 + 45° 工程剖面线

**禁止**：neon blue/purple、cyberpunk、RGB glow、强 bloom、lens flare、大面积黑底、游戏式 HUD、扫描线、彩虹 heatmap。

**独立成立**：关闭 HUD 后，HERO 画面必须能直接当 4K 产品广告 / 作品集封面。

**环境**：极简展台（浅灰地面 + 轻接触阴影），或主体所处的程序化环境（沙丘、机房一列机柜）。环境不抢主体；加低调的尺度参照（1.75 m 人形剪影、1 m 比例尺、机柜、前哨站建筑、无人机）。

---

## D. 程序化几何

禁止加载外部 GLTF/OBJ/FBX。全部程序化生成。

1. **按主体的真实链路分区**，每区一个编号（01–05），HUD 与爆炸图都用同一套分区：
   `{SECTION 01} → {SECTION 02} → … → {SECTION 05}`
2. **每个零件都要有视觉或机械依据**。禁止为了复杂感随机堆 greeble、管子、阀门、电子模块。管路要有源点 / 终点、一致弯曲半径、支撑、合理法兰 / 卡箍间距，不穿框架、不穿实体、不和另一回路无意义合并。
3. **逐级变化**：重复结构不能像复制的一排风扇。叶片按级改变 height / chord / twist / stagger / disk radius；装甲环每节略有不同的格栅、舱门、铆钉排布；不同功能的叶片用不同 profile（压气机 ≠ 涡轮）。
4. **体积感**：框架有真实截面和倒角；面板有厚度、凹槽；近景不能暴露「低模圆柱拼装感」。电机要有散热鳍片、风罩、底脚，不能是一根银色圆柱。
5. **剖切（cutaway）**：保留约 40–55% 外壳，形成「完整壳体 + 机械切口 + 内部暴露」。切口像 machined cut surface：稍暗、稍粗糙或 ochre 剖面色 + 剖面线。实现见 `perf-lessons.md`（clipping plane + 背面着色，无需封口几何）。
6. **真实尺度**：世界单位用米（或主体自然单位），整体包络与参考一致。
7. **重复件 InstancedMesh**；静态件按材质合并；微小件 LOD。

---

## E. 材质

彻底避免 Three.js 默认塑料灰。按部件分材质族，每族在颜色、roughness、metalness 上有可辨差异：

- 外壳：brushed aluminium（可用 MeshPhysicalMaterial anisotropy 表达环向车削纹）
- 轴 / 盘：machined steel
- 冷端叶片：light titanium-like
- 热端：heat-treated nickel alloy，允许极克制的热处理色差
- 管路：stainless，细轴向拉丝，不是镜面 chrome
- 内框架：dark gunmetal
- 黑色框架：powder coat，metalness .45–.65，roughness .48–.62，轻微橘皮 normal，边缘极轻磨损
- 软管：near-black rubber，roughness ~.78

用 1–3 张程序生成的 canvas / DataTexture 提供 roughness variation、brushed direction、subtle edge wear、slight tonal variation。不做锈蚀、指纹、废土感。

---

## F. 灯光

目标：**industrial product photography**。

- 1 盏大面积柔和 key（暖中性）
- 1 盏较弱 fill
- hemisphere / PMREM 环境（RoomEnvironment 或程序化 softbox）
- 需要时 1 盏中性 rim
- ACES Filmic tone mapping，sRGB 输出

不使用彩色灯、不使用大量动态灯。银色要有层次、不爆白；暗部不死黑。软阴影只给大结构与地面，不让数百个叶片逐个 castShadow。

---

## G. 动画

按原型选择：

- **旋转机械**：默认可读的视觉转速（30–60 RPM 量级，不宣称真实转速）；所有同轴转子同步。`REAL SPEED` 视觉模式用半透明模糊盘减少频闪，不做高成本 motion blur。`START SEQUENCE`（20–25 s）：CRANKING → ACCELERATION → IGNITION → TURBINE ACCEL → SYNCHRONIZING → STEADY，HUD 状态同步。
- **载具 / 生物**：沿循环路径行进，运动波沿身体传播；进入 / 离开地面时有粒子与地形扰动、身后留痕迹和长投影；底部「运动周期」面板与动画同拍高亮。
- **封闭设备**：面板开合（铰链方向合理，先开后淡出，不瞬间消失）、泵运行、阀门状态。

---

## H. 模式

| 模式 | 行为 | 时长 |
|---|---|---|
| CUTAWAY | 连续 0–100% 滑块或等价控制，逐步切开外壳，切口清晰 | 连续 |
| X-RAY | 外壳不透明度降到 .10–.20，内部保持实体，整体仍是 silver/gunmetal（环境场景可用「地面以下画成半透明青色 + 菲涅尔边缘光」） | ~0.3 s |
| EXPLODED | 主要模块沿装配轴分离，可再轻微拉开子组；标签换成模块编号；再点恢复。不许每个螺栓乱飞 | ~2 s easeInOut |
| FLOW | 工程化流线，像 CFD 可视化而不是魔法粒子；颜色沿流程渐变；GPU 计算，开启后 draw calls 增幅 < 10。多回路时**绝不画成混合** | 0.6 s 淡入 |
| THERMAL | 低饱和工程热力色叠加在真实材质上（材质混合或轻量 shader），不用彩虹 | ~0.6 s |
| COMBUSTION 等原理模式 | 半透明、柔和、克制，只表达过程阶段，不做巨大火焰 / 爆炸 | — |
| REFERENCE / INSPECTION | 暂停，绝对侧视（长焦），运动件对齐 / 姿态拉直，隐藏流场，HUD 切 inspection（顶部横幅 + 轴向标尺）；再按恢复之前的镜头和状态 | ~2 s |
| SERVICE / FOCUS | 点击部件：相机靠近，其余部件降低视觉权重，标签与面板更新，ESC 返回 | 1.4–1.8 s |
| PRESENTATION | 约 70–85 s 自动展示，章节见下；HUD 淡出只留标题和章节字幕；退出时恢复 | ~75 s |
| PAUSE / PLAY | 冻结模拟时间，相机仍可操作 | — |
| HIDE HUD | 只剩模型，作为纯产品画面 | 0.35 s |

**PRESENTATION 章节模板**（按主体替换内容）：

```text
00–08s  HERO：慢速 turntable，标题淡入
08–18s  第一个关键子系统特写（开始运动 / 开启 airflow / 打开面板）
18–30s  第二个子系统（沿主轴推进 / 过程阶段依次出现）
30–42s  核心部件（可短暂 visual slow motion）
42–52s  末端 / 后侧
52–63s  CUTAWAY → X-RAY → FULL CASING（或 N+1 等概念演示）
63–70s  EXPLODED，模块分离并标注
70–75s  HERO RESTORE，HUD 淡出，只留标题 + "VISUALIZATION STUDY"
```

镜头慢、稳、机械感。禁止快速摇镜、handheld shake、whip-pan、夸张 DOF、lens flare。

**模式组合**：逐一检查组合（如 ENCLOSED+FLOW、CUTAWAY+THERMAL、REFERENCE 中按 F/SPACE）。有意义就定义清楚行为；没意义就显式禁用并在状态栏说明，不要产生奇怪画面。

---

## I. HUD / 工程排版

风格：**Swiss industrial graphic design + engineering manual + museum placard**。透明或极浅 ivory 面板（不透明度 ≤ .92），0.5–1 px graphite 线，小号 uppercase，大字距；更多直接文字、细线、刻度、section number，更少厚重卡片。字体：IBM Plex Sans Condensed / Barlow / DIN-like + IBM Plex Mono 数字 + Noto Sans SC（中文回退 PingFang SC、Microsoft YaHei）。

**顶部栏**：左 brand（◇ + 机构名），中 doc ID（如 `AEI-SNDWRM-MKX-001`），右控制按钮组（VIEW / MODE 分组小标签）、下方状态行 + 快捷键提示。按钮：17–20 px 高，1 px 线框，选中态墨色实底反白；X-RAY / REFERENCE 等可用对应功能色实底。

**左上**：
```text
{TITLE}            ← 28–32 px，型号部分可用强调色
{SUBTITLE}
{中文副标题}

{KEY}  {VALUE}     ← dl 两列：dt 小号灰色 + 中文 small；dd 数字用 mono
...                  真实主体在值后加 FACT / REF. / SIM 标签芯片
```
未经确认的数字不得伪造（见 `fact-discipline.md`）。可附一个迷你图（部署地图、启动序列进度条）。

**右上**：一张原理 SVG 卡片，随当前镜头 / 模式高亮：
- 过程链：`AIR → COMPRESSION → COMBUSTION → EXPANSION → EXHAUST` + 温度色带
- 回路图：FACILITY WATER ↘ HX ↗ TCS LOOP → RACKS，清楚表达不混液
- 截面图：同心环、刀片、刻度环、比例尺 + 子系统清单

**底部三面板**（等高、网格对齐、标题 `01 / NAME 中文`）：
1. 架构 / 纵剖面：由模型参数直接画出的侧视剖面 + 01–05 分区编号 + 米制比例尺，随镜头高亮当前分区
2. 典型细节：单级 rotor/stator、单节环爆炸图带零件编号、部件解剖清单
3. 实时周期 / 状态：Brayton T–s、运动周期四拍、运行状态表（模拟值标 SIMULATED），与动画同步高亮

**右下**：`60 FPS · 54 DRAW CALLS · 1.34M TRIS · 1920×1080`，mono 小字，低调。

**可选**：视图底边细坐标尺（刻度 + 数字）、侧边高程尺、REFERENCE 模式顶部横幅。

---

## J. 3D 标注（Leader Labels）

标注 `{6–12 个部件}`，每条：EN 主名（粗）+ 中文 + 一行说明（弱化灰），真实主体加来源标签芯片。

- 排成左右两列，列内对齐；左列右对齐，右列左对齐（右列标题前加小三角）。
- 细引线：标签边 → 水平短线 → 折线到投影锚点，锚点画小空心圆。
- 每帧 3D→2D 投影；只写 transform / opacity / SVG 属性，尺寸只在 resize 时测量。
- 锚点在背面 / 被遮挡 / 出屏时淡出（文字保留 ~30% 或全淡，引线全淡）。遮挡判断优先解析法（半径表、地形高度采样），其次节流的 raycast 打粗代理体。
- 列内自动避让（按投影 y 排序 + 最小间距），不得压住顶部 / 底部 / 侧边面板。
- 按镜头选择标签子集；近景减少标签数量。

---

## K. 镜头

6–8 个预设（按原型选），1.4–1.8 s easeInOut；REFERENCE 用 2 s。

- 插值：target 线性插值，相机相对 target 的偏移在球坐标下插值，避免穿过模型。
- HERO：3/4 侧面，主体占画面宽 70–80%，同时看到内构和外壳，阴影完整，项目封面质量。
- 至少一个正侧剖面、若干子系统近景（近景不穿模）、一个略高的爆炸视角、一个慢速 ORBIT turntable。
- 环境原型加：AERIAL（高处俯视看到粒子和投影）、CHASE（斜后上方跟随，主体埋入地下时跟随仍在地表的部分）、地面人眼视角。
- 真实产品加：photo-match 相机（固定 FOV，配合参考图 overlay 0–100%）。
- OrbitControls：左键 orbit、右键 pan、滚轮 zoom；拖拽开始即切 `FREE CAMERA`；点预设平滑恢复；相机过渡不与用户拖拽打架。
- 竖屏时加宽垂直 FOV，保持水平构图。

---

## L. 键盘

```text
1–N        镜头预设
SPACE      PLAY / PAUSE
X          X-RAY            C   CUTAWAY
E          EXPLODED         F   FLOW
T          THERMAL          R   REFERENCE
P          PRESENTATION     H   HIDE HUD
L          LABELS           S   START SEQUENCE / SERVICE（按原型）
ESC        退出 focus / presentation
```

按钮与快捷键共享同一个 state；按钮选中态由 state 推导，双向同步。输入框聚焦时不响应快捷键。

---

## M. 性能架构

硬目标：`{3840×2160 | 1920×1080}` / 60 FPS（报告中写明测试硬件与 headless 限制）。

- 重复件 InstancedMesh；动叶实例挂在旋转组下，旋转不更新实例矩阵
- 静态大件按材质合并；LOD0/LOD1，远景隐藏螺栓 / 微管路
- FLOW 粒子单 / 少量 draw call，GPU 计算
- pixelRatio = `min(devicePixelRatio, 3840/innerWidth, 2)`，4K 不用 2×
- 禁止实时重型 SSAO / SSR / raymarch volumetrics / 大量动态灯
- 只有主要大件 castShadow
- 渲染循环不 new geometry / material / Vector3
- DOM label 更新避免 layout thrashing

预算：draw calls 理想 < 100，上限 ~150；可见三角形约 0.4–1.5 M，以画质为准调整。

---

## N. 响应式

- 4K：完整 HUD；1440p：完整但缩小；1080p：可读；720p：底部面板压缩、次要中文值可隐藏
- HUD 用一个缩放系数 `--k = clamp(min(W/1920, H/1080), .5, 1.8)`，各块以所在角为 transform-origin 缩放
- 宽度 < 760 px（手机）：保留视图和控制，收起细节面板与标注
- 任何尺寸禁止 HUD overlap / 横向 overflow

---

## O. 代码组织

单文件时也按模块组织（命名空间对象或 class）：

```text
SceneManager · MaterialLibrary · ModelFactory（按分区拆：{Section}Factory）
FlowSystem · AnimationController · CameraController · HUDController
LabelSystem · PerformanceMonitor · Presentation · App(state)
```

多文件时按功能分目录：`core/`（renderer、materials、geom helpers）、`parts/`（各部件）、`viz/`（flow、thermal）、`app/`（state、cameras、hud、labels）。

交付物中无 TODO、placeholder、unused code、dead function、dead control、console spam。

页面加载失败（CDN 不通、无 WebGL2）时显示一行双语错误提示，而不是空白页。

---

## P. 自动验证

每轮修改后用 Playwright / Chromium（`scripts/shoot.py`）：

- 收集 console.error / warn / pageerror / WebGL 错误
- 每个镜头 + 每个模式截图到 `shots/`，必要时 4K 版本加 `_4k` 后缀
- 读取 renderer.info：calls、triangles、geometries、textures
- `--keys` 检查所有快捷键与按钮状态同步，`--layout` 检查多分辨率下 HUD 重叠 / 溢出
- 截图与参考图逐张对比，列出差异并**直接修掉**，不要只写差距报告

---

## Q. 完成标准

- 真实 silhouette / 比例与参考接近（虚构主体：与参考概念图明显接近）
- 工作原理能一眼看懂（流程、回路、运动周期）
- 所有按钮、快捷键、镜头、模式可用且状态同步；console 无 error
- 1080p 与目标分辨率无布局错误
- 无 Three.js 默认材质感，无霓虹
- 真实主体：事实 / 参考 / 重建 / 模拟在 HUD 中可区分
- `reports/final-report.md` 写清真实性能数据与剩余差距
