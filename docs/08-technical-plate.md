# 08 · Technical Plate：Atlas 的视觉与交互语言

来源：项目级 skill `.claude/skills/industrial-3d-showcase/`（沙虫 / 燃气轮机 / CDU 三个项目提炼的"技术图版"方法论）。本文是它在 Atlas 上的**适配层**：skill 讲"怎么做一个单页 Three.js 展示"，本文讲"Atlas 的两个引擎、共享部件和内容数据怎么按同一套语言打磨"。冲突时以本文为准，本文没写的按 skill 的 `references/master-spec.md`。

## 0. 适配原则

| skill 的假设 | Atlas 的现实 | 适配 |
|---|---|---|
| 单文件 HTML，三方库走 CDN，字体走 Google Fonts | Astro 静态站，禁止运行时外部请求（docs/02） | 字体用 `@fontsource` 自托管；three 走 npm；一切资源本地 |
| 每个主体手写一页 | 内容是数据，引擎复用 | 视觉语言进 token 与引擎，内容作者只填数据 |
| 单一主体、4K60 | 两个引擎、小学生、Web + 未来 iPad | 目标 1080p60，4K 不出布局错误；触控优先级高于快捷键 |
| 纸底是唯一合法底色 | Gavin 要两套主题 | **paper 是标准实现**；cinema 改为"dark plate"：同一套排版语法、克制的功能色、暗部不蓝不紫、glow 降到微弱 |
| 全程序化建模，禁 glTF | SpaceScene 数据里有 `primitive` 和 `mesh` 两种 | 程序化优先；`mesh` 只给确实画不出来的复杂有机体（人体器官）；引擎提供更丰富的程序化零件（见 §4） |
| 课程无关 | 测验 | HUD 里保留章节轨、信息面板、测验卡，只是按技术图版排版 |

## 1. 视觉语法（两套主题共用）

**纸与墨**（paper）：底 `#E9E4D8`，面板 ivory ≤ .92 不透明，墨 graphite `#2A2824`，次级 `#555047`，弱化 `#857D70`，hairline `rgba(42,40,36,.3)`。雾色 = 底色，3D 舞台与地图都"印在纸上"。可选极淡纸纹（multiply，≤ .35）。

**dark plate**（cinema）：底暖深灰 `#1F2124`（不是蓝黑），墨 `#E7E5DF`，次级 `#B9B4A8`，hairline `rgba(231,229,223,.28)`。功能色与 paper 同名同义、略提亮。glow 只给箭头头部与脉冲，强度 ≤ .35。禁止霓虹、扫描线、RGB。

**功能色**（每种只表达一个含义，低饱和）：

| 含义 | paper | 用在 |
|---|---|---|
| 冷 / 一次侧 / 同盟 | steel blue `#4F7F8C` | FLOW 冷流、TimeScene 同盟阵营 |
| 热 / 燃烧 / 轴心 | burnt orange → oxide red `#B8602E` | FLOW 热流、轴心阵营 |
| 二次回路 / 中立 | muted teal `#5E8C86` / warm grey `#8A8378` | 第二条流、中立 |
| 强调 | signal orange `#CC6328` | 选中、高亮、当前章节 |
| X-RAY | cyan `#3A9AA0` | 透视态 |
| 剖切面 | ochre `#B8973C` + 45° 剖面线 | CUTAWAY 切口 |

**字体**：标题与 HUD `IBM Plex Sans Condensed`，数字 `IBM Plex Mono`，正文（信息面板里给孩子读的段落）保留衬线以示区分；中文回退 `PingFang SC / Noto Sans CJK SC`，不自托管中文字体。小号大写 + 宽字距（.08–.16em）只用于 HUD 标签，孩子读的正文不大写。**HUD 最小字号 10 px、状态行 / 键位提示 ≥ 10.5 px（1080p，k = 1）**，面向小学生的笔记本屏，不为"技术图版味"再往下压（token 见 docs/06「HUD 缩放与响应式」）。

**禁止**：三方库默认灰塑料材质、随机堆细节、大面积黑底、霓虹、lens flare、游戏式六边形 HUD、厚重卡片阴影、圆角大于 2px 的 HUD 元素（孩子读的面板允许 6px）。

**独立成立**：按 `H` 隐藏 HUD 后，舞台画面要能当作品集封面。

## 2. HUD 布局契约（SceneHost）

```text
┌ 顶栏：◇ ATLAS · {学科} [01][02]…[NN]   VIEW [WORLD 1][EUROPE 5]… [▶ PRESENT 演示]   LOOK ▾ EN ▾ ┐
│       左：品牌 + 章节号码芯片（BG = 背景章）　中：VIEW 组 + 橙色 PRESENT　右：只有 LOOK / 语言    │
│       状态行：ATL-WW2-07 · {VIEW} · {RUNNING|PAUSED} · {MODE 50}              快捷键提示         │
├ 左：章节轨（编号 01–NN）                                           │
│ 左上贴画布：标题 / 副标题 EN+中文 / 规格 dl（4–8 行，mono 数字，来源芯片）            │
│ 右上：一张示意 SVG 卡（引擎决定：过程链 / 时间条 / 剖面）随状态高亮，可原地展开；标题右端 › 收成舞台右缘 28 px 竖页签 │
│ 右上卡下：控制面板 LAYERS / TOOLS / KEY（模式开关都在这里；顶栏只多一个 PRESENT）     │
│ 舞台中央：地图或 3D；两列引线标注                                                     │
│ 右：阅读面板（编号 + 章名 + summary 一句、章节正文、选中对象、测验；可收成 28 px 竖条，宿主级）│
├ 底（SpaceScene）：三块等高面板 01 ARCHITECTURE / 02 DETAIL / 03 STATE；上缘左侧的小页签整组收成 28 px 横条，舞台随之变高 ─ │
├ 底（TimeScene）：一条底部条 [▾] · 时间标尺 · 状态串；泳道可展开（PRESENT 在顶栏，这里没有）  │
└ 右下安静小字：FPS · DRAW CALLS · TRIS · RES（仅 3D；地图显示 FEATURES · ZOOM）        ┘
```

- DOC-ID 规则：`ATL-{TOPIC 大写去连字符前 6}-{章节序号 2 位}`，如 `ATL-SAMPLE-02`；它在**状态行最前面**（顶栏里不再有），手机上隐藏。
- **顶栏三段**（`core/Hud.tsx TopBar`）：左 = 品牌 `◇ ATLAS · {学科}` + **章节号码芯片** `01 … NN`（背景章 `BG`；带 `data-chapter="<id>"`，当前章 `.on` 实心、`aria-current="step"`；点击 = 章节轨的同一动作 `goToChapter`，← → 不变）；中 = **VIEW 组**（地理 / 模型视角预设、ORBIT、REF.，数字键）加它右端的 **`▶ PRESENT 演示`**（signal 橙实心，整个 HUD 唯一的实心橙按钮，`data-mode="presentation"`、`aria-pressed`，开关 `presentation` 模式 = 键 P；控制面板 TOOLS 里仍保留同一行）；右 = 只有 LOOK ▾ 和语言 ▾。三段用 grid：外侧两列 `minmax(max-content, 1fr)`，放得下时左右等宽，VIEW 组落在顶栏正中；放不下时各按内容宽度，中段略偏。< 1180 px 宽或触屏中段独占第二行居中；< 760（手机）芯片和 VIEW / PRESENT 都隐藏，章节走已有的章节轨小方块行（桌面顶栏芯片是它的桌面版）。VIEW 组**只放视角**：SpaceScene 不再有章节预设（章节就是顶栏芯片），数字键 1 = ORBIT。
- **底部面板整组收起**（SpaceScene 的 panel01–03）：条**上缘左对齐**一个 hairline 小页签（`.atlas-panels__fold`，24 px 高、≥ 44 px 宽，坐在上边框上，`aria-expanded`；展开时 chevron 朝**下**，点它收起；收起后页签留在横条上缘、chevron 朝**上**）把三块一起收成一条 28 px 横条（`.atlas-panels__bar`，只显示 `01 ARCHITECTURE 结构 · 02 DETAIL 细节 · 03 STATE 状态`，点它或页签展开）；状态在 HUD store 的 `panelsOpen`，按标签页存 `sessionStorage['atlas:panels']`（默认展开，**不进 URL**，粘住：换章不会展开；`__atlas.state().panels` / `setPanels`）。**舞台随之重排**：舞台（和引线 svg）的底边 = 面板条的顶边（`BottomPanels` 量出来写到 `.atlas-scene` 的 `--stage-inset`），收起后 3D 画布变高；HUD 隐藏（H / 演示）时舞台仍占满整张。阅读面板的 28 px 把手是宿主级的，两个引擎一样。LAYERS / TOOLS 控制面板自带关闭按钮，不跟这个走。
- **右上卡可收成竖页签**（两个引擎的 `card` 槽：SpaceScene 零件链 / TimeScene 参与卡）：卡片标题行**右端**一个 chevron 朝**右**的折叠钮（`.atlas-card__fold`，`aria-expanded`，≥ 44 px 命中区；TimeScene 参与卡自己的「展开全部行」切换是另一个控件，保留）。收起后卡片 `display: none`（引擎仍挂载在里面），舞台右缘出现一条 28 px 竖页签（`.atlas-card__tab`，`data-hud-panel="card-tab"`，章名竖排、chevron 朝**左**，点它恢复）；下面的 LAYERS / TOOLS 控制面板自然上移补位；引线标注与地图标牌把页签当障碍、把收起的卡片丢掉。状态在 HUD store 的 `cardOpen`，按标签页存 `sessionStorage['atlas:card']`（默认展开，不进 URL，粘住；`__atlas.state().card` / `setCard`）；`.atlas-scene[data-card="open|collapsed"]`。< 1024 px 卡片本来就隐藏。
- 阅读面板收起后的竖条：章号在中线上方、竖排章名**垂直居中**、chevron 在章名下方，三者水平居中。
- 所有 HUD 块带 `data-hud-panel`，缩放系数 `--k = clamp(min(W/1920, H/1080), .6, 1.6)`，各角以所在角为 transform-origin。
- 响应式：≥1440 完整；1080 完整略小；720 底部三面板压缩成一行标签页；VIEW 组放不下就折行（< 1180 px 宽独占第二行）；< 1024 阅读面板是底部抽屉；< 760 宽（手机）保留舞台 + 章节轨折叠 + 底部控制，隐藏右上卡与三面板。任何尺寸不重叠、不横向溢出。
- 现有 ChapterRail / InfoPanel / QuizCard / Counter 保留职责，按上面的排版重做皮肤（hairline、编号、芯片）。

## 3. 交互契约

- 镜头预设：SpaceScene 放 `ORBIT`（慢速转台）、`REF.` 和 parts.json 的命名视角（换章走顶栏章节芯片、章节轨和 ← →，章节镜头不占预设）；TimeScene 只放地理预设（`WORLD`、`WHOLE AREA` 和主题的 `presets.json`），换章走章节轨、顶栏芯片、底部条的段和 ← →（换章落在本章第一拍，不自动跑）；数字键 `1–N` 切预设，1.4–1.8 s easeInOut，球坐标插值不穿模；拖拽即 `FREE CAMERA`，点预设平滑收回。
- 模式键（按引擎）：

| 键 | SpaceScene | TimeScene |
|---|---|---|
| X | X-RAY（.3 s） | — |
| E | EXPLODED（2 s） | — |
| C | CUTAWAY 滑块（连续） | — |
| F | FLOW（= run，.6 s 淡入） | 行军箭头层 |
| R | REFERENCE（正侧 / 正前，拉直，2 s，再按恢复） | 版图对照（当前 vs 上一关键帧并排） |
| L | 标注开关 | 标签开关 |
| SPACE | 运转暂停 | 演示中：下一拍 |
| P | PRESENTATION（同右列的节拍规则） | PRESENTATION：用户翻页的节拍（点字幕卡 / → / SPACE 下一拍，← 上一拍，点节拍点跳转，不自动前进；点舞台不翻页） |
| H | 隐藏 HUD | 同左 |
| ← → | 章节 | 章节 |
| ESC | 退出 focus / REFERENCE | 退出演示 / REFERENCE / 展开的参与卡 / 选中 |

- 按钮与键共用同一个 store 字段；按钮 `.on` 由 state 推导。模式按钮在控制面板里（LAYERS / TOOLS，每行右侧写键位字母），注册表是唯一状态来源。输入框聚焦时不响应快捷键。无意义的组合显式禁用并在状态行说明。
- 触控：所有按钮 ≥ 44px；长按 = 悬停；双指 = 旋转/缩放。
- 演示里的镜头（两个引擎）：换拍时系统接管镜头飞过去，飞行中舞台不接受输入；拍落定（镜头到位、字幕淡入）后读者可以拖动 / 缩放地图、旋转 / 缩放模型，点舞台不翻页也不改选中；下一拍从读者留下的位置再飞。字幕卡只在自己的区域接收输入，右上角 ⌄ 把它收成 24 px 一条，下一拍自动展开。

## 4. 模型规则（SpaceScene）

- 每个零件有功能理由（数据里的 `summary` 必须说它干什么）；禁止"为了复杂"的零件。
- 引擎提供的程序化零件（在 `primitive.kind` 基础上扩展）：`bevelBox`（真实截面 + 倒角）、`tube`（沿路径、统一弯曲半径）、`flange`（带螺栓圆）、`fins`（散热鳍片阵列）、`vessel`（圆柱 + 封头）；`repeat: {count, axis, spacing | radius}` 生成 `InstancedMesh`。
- 材质族：`casing`（拉丝铝）、`steel`（机加工钢）、`powder`（粉末涂层黑框架）、`stainless`（管路，轴向拉丝）、`copper`、`rubber`、`plastic`（哑光，非默认灰）、`glass`。程序化 canvas 纹理给 roughness 变化与拉丝方向。
- 生物 / 有机形体（docs/06「生物与有机形体」，docs/14 §8）：`sweep`（沿平滑路径放样的变径管：圆 / 扁 / U 截面、壁厚、环节沟、圆帽）、`wing`（薄膜 + 两面墨色翅脉细线，可扇形折叠）、任意 primitive 的 `scale`（椭球、扁壳）、`bilateral` 零件（只建一侧，引擎镜像另一侧；镜像件可选、可标注，不另编号）、动画 `pivot`（绕关节转）与 `sequence` 关键帧、`poses`（章 / 拍缓动到姿态，默认 0.8 s）。生物材质族：`chitin`（半光泽、按物种 tint）、`membrane`（半透明双面、不写深度、不填剖面）、`tissue`（哑光、微弱自发光仿透光）、`muscle`（纤维法线）、`trachea`（白、环纹法线）、`nerve`（淡黄）、`eye`（深色高光 + 六边形小眼法线）。软组织用低饱和的粉、赭、乳黄，不用"血腥红"；两套主题都要读得出。
- 系统分层的读法：章 / 拍 `ghost`（组以 .12 淡显、不可点、不标注）与 LAYERS 行末 `⊙` 单显，让一个系统在身体轮廓里被看见；命名剖切面 `views.cuts`（矢状 / 横切）在状态行写名字。比例尺与 ARCHITECTURE 读数按 `units` 用实长（放大 40 倍的昆虫写 `10 MM`，不写 `U`）。
- 灯光：1 大柔 key（暖中性）+ 弱 fill + 半球/RoomEnvironment + 1 中性 rim，ACES Filmic。只有大件投影，地面接触阴影。
- CUTAWAY：保留 40–55% 外壳，切口 ochre + 剖面线（背面着色法，见 `perf-lessons.md` §9）。
- 性能：draw calls < 100（上限 150），三角形 ≤ 1.5 M，pixelRatio `min(dpr, 3840/W, 2)`，渲染循环零分配，`frameloop="demand"` 非运转时不渲。

## 5. 地图规则（TimeScene）

- **数据真实性（硬规则）**：控制区、国界、前线、行军路线必须来自真实地理数据：优先公开数据集（CShapes 2.0、Natural Earth、OpenHistoricalMap 导出、UMN Historical National Boundaries），其次把真实出版地图或维基共享资源的矢量 / 位图地图配准（控制点 + 投影换算）后描摹。每个关键帧在主题的 `data/SOURCES.md` 记录来源 URL、许可、方法和残差。禁止用几何图形或随手画的多边形代替版图。示例主题的方块多边形只允许存在于 `sample-*`。

- 底图是"印在纸上的工程图"：陆地纸色、海洋极淡、国界 hairline、控制区用低饱和阵营色 + 可选 45° 斜线填充（fill-pattern，canvas 生成），不用大色块糊满。
- 箭头是工程流线：细线 + 小箭头头，流动用虚线步进，不发光（dark plate 允许微弱）。
- 标签：引线标注语法（标签 → 短横 → 折线 → 空心圆锚点），两列对齐，近景减量，遮挡/出屏淡出。
- 右上卡：参战 / 控制面积随时间的条带图（SVG），当前 `t` 一条竖线。
- 底部只有一条：泳道开关 + **分段时间轴**（和演示进度条同一语法：每章等宽一段，段左界写章号和起始年月 `1941-12`，不画年 / 月刻度；段里每个演示拍一个空心小圆刻度，按拍的时间排、彼此至少 10 px，当前章的段 signal、当前拍实心；关键帧小菱形坐在轨上；点段 = 那一章的第一拍，点刻度 = 那一拍，悬停刻度出日期和字幕开头；播放头可拖，连续时间不换章；手机只画段）+ 状态串（参战方数、进行中战斗数、活跃箭头数、控制区关键帧过渡；数据统计，不标 SIM）；三条泳道（关键帧 / 行动 / 事件）默认收起，横坐标与分段时间轴一致。本章一句话概述在阅读面板头部。
- 右上卡可以原地展开成全部实体的列表，点一行 = 在地图上加粗这个实体的控制区边线 + 在阅读面板里出详情。
- PRESENTATION 是用户翻页的节拍：每章 `state.beats`（缺省一章一拍），每拍飞镜头、缓动时间、再淡入大号衬线字幕；落定后地图可以拖动、缩放（见 §3）；HUD 只留标题块、章节行、字幕和节拍点；ESC / P 回到进入前的场景。拍同时是底部时间轴的结构（每拍一个刻度），所以写拍就是写这一章在时间轴上的几个停靠点。

## 6. 事实纪律（内容进来后生效）

- 引擎数据 schema 增加 `source?: { tag: 'fact' | 'ref' | 'reconstruction' | 'simulated'; label?: Bilingual; url?: string }`，事件、零件、规格行都可带。
- HUD 芯片：`FACT` / `REF.` / `RECON.` / `SIM`，1px 框、小号大写、中文。
- 每个主题 `data/SOURCES.md`：每条数字一条来源 URL；来源冲突列出来，不偷偷选。
- 伤亡、人口等数字：用 Counter（一个图标代表 N 人）可视化，同时给出带来源的精确值，不做隐藏。
- 页脚一行双语声明：`Independent educational visualization · not an official publication / 独立教学可视化 · 非官方发布`。

## 7. 测试 API 与 QA

核心暴露 `window.__atlas`（镜像 skill 的 `__showcase` 契约，供 `scripts/shoot.ts` 驱动）：

```ts
{ ready: Promise<boolean>,
  chapters(): string[], goToChapter(id, {instant}),
  presets(): string[], setPreset(id, {instant}),
  modes(): string[], setMode(id, on, {instant}), keymap(): {key,type,name}[],
  setPaused(on), setHud(on), setTheme('paper'|'cinema'), setLocale?: never /* 换 URL */,
  state(): SceneSnapshot & {hud, paused}, stats(): {calls?, triangles?, fps?, buffer, pixelRatio, gpu?} }
```

`pnpm shoot <topic> [--locale en|zh|all] [--theme paper|cinema|all] [--size 3840x2160] [--suffix _4k] [--shots file.json] [--keys] [--layout] [--perf] [--json out.json] [names…]`：每章 + 每模式 + 额外预设 + `hero-clean` 截图到 `shots/<topic>/<locale>-<theme>/`，收集 console error / 外部请求，`--keys` 核对键与按钮同步，`--layout` 在 3840 / 2560 / 1920 / 1280 / 900 / 390 宽度检查 `data-hud-panel` 重叠与溢出（与 e2e 共用 `tests-e2e/hud-layout.ts`），`--perf` 打印渲染计数。退出码非 0 即失败。用法细节见 docs/06 「QA：pnpm shoot」；e2e 冒烟继续用 Playwright。

## 8. 打磨轮次（Atlas 版）

按顺序执行，每轮有范围栅栏，每轮末尾：截图 → 和 skill 示例的视觉标准并排看 → 列差异 → 直接修 → 再截图 → 确认不回归 → 提交。

| 轮 | 范围 | 完成标准 |
|---|---|---|
| P1 设计语言 | tokens、字体、SceneHost 布局、widgets 皮肤、`__atlas` API、H / 数字键 / 状态行 | 两套主题下示例主题的 HUD 像技术图版；`--layout` 六个尺寸通过 |
| P2 SpaceScene | 材质族、灯光、剖切面、引线标注、模式键、ORBIT / REFERENCE、程序化零件扩展、perf 读数、右上卡与底部三面板 | 关 HUD 的 HERO 能当封面；draw calls < 100；`--keys` 通过 |
| P3 TimeScene | 纸面底图、斜线填充、工程流线、引线标注、标尺时间轴、右上条带卡、三面板 | 同上；两主题 |
| P4 QA 与审计 | `shoot.ts`、e2e 更新、文档与截图刷新、删 TODO / 死代码、Lighthouse | 全部门槛绿；docs/06 与 08 对齐实现 |
| P5 内容期（每个主题） | skill `rounds.md` 的 R2（几何比例）→ R4（原理动画）→ R9（事实审计）按主题跑 | 主题 `status: published` 前必须过 |

## 9. 给施工方的一句话

做任何视觉或引擎改动前，先读本文件和 `.claude/skills/industrial-3d-showcase/references/master-spec.md`，再读 `docs/06-dev-guide.md`。做完用 `pnpm shoot` 截图自证，不要只交报告。

## 10. 实现状态（P4 收口）

| 轮 | 提交 | 做了什么 | 没做 / 遗留 |
|---|---|---|---|
| 准备 | `e6c8fcb` `f882209` | 自托管 IBM Plex Sans Condensed / Mono；安装 skill、本适配文档、CLAUDE.md | — |
| P1 设计语言 | `6ef934a` | 技术图版 token（paper / dark plate）、自托管字体、SceneHost HUD 布局契约、`controls` 注册表、`window.__atlas`、H / 数字键 / 状态行、六尺寸 HUD e2e | — |
| P2 SpaceScene | `e8c3a44` | 材质族与程序化贴图、产品灯光、剖面线剖切面、引线标注、ORBIT / REFERENCE、程序化零件（bevelBox / tube / flange / fins / vessel、实例化）、零件链路卡与三面板、perf 读数 | 无 FXAA（靠 pixelRatio 与分辨率调节）；无 THERMAL 模式；无 SpaceScene PRESENTATION；X-RAY 没有"外壳 / 内核"标记（所有零件同为 .15 透明，不能只透外壳）；dark plate 下 `powder` 粉末涂层读起来偏中灰 |
| P3 TimeScene | `19797d1` | 纸面底图、斜线填充、经纬网、工程流线、引线标注、标尺时间轴、参与 / 面积条带卡、三面板、REFERENCE、PRESENTATION、跨 180° 经线环修复 | REFERENCE 用叠加（虚线边界）而非分屏对照；地图主题整页 JS 约 391 KB gz，超过 docs/02 的 300 KB 预算（MapLibre 本体 ~270 KB），待产品层决定 |
| P4 QA 与审计 | `c6134d1` | `pnpm shoot`（`scripts/shoot.ts`）；HUD 字号刻度上调（最小 10 px / 状态行 ≥ 10.5 px）；手机顶栏 `SceneMode.phone`；SpaceScene 引线标注避让模型、窄带只标选中；删未用 i18n 键与死导出；docs/06 对齐代码；截图收拢到 `docs/screenshots/<topic>/` | 未跑 Lighthouse（不新增依赖）；`simulation` 仍是后期占位引擎；软件 GL 下 fps 数字不代表真机，4K60 未在真 GPU 上验证 |
| P5 内容期 | — | — | 未开始（等 Gavin 定稿内容） |
| 版面轮（主题页） | 未提交 | 顶栏 VIEW 只放地理预设并折行、去掉 MODE 组；模式进控制面板（LAYERS / TOOLS）；阅读面板可收成 28 px 竖条（sessionStorage）、头部带 summary；TimeScene 底部合成一条（播放 · 标尺 · 状态串 · 可展开泳道），时间轴最小间距混合映射；参与卡可展开、行可点（地图加粗 + 实体详情）；PRESENTATION 改成用户翻页的节拍（ww2 第 07、11 章各四拍） | SpaceScene 保留章节镜头预设和三面板；节拍 `audio` 只预留，没有音频文件 |
