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
| 课程无关 | MOE 年级、家长模式、测验 | HUD 里保留章节轨、信息面板、测验卡，只是按技术图版排版 |

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

**字体**：标题与 HUD `IBM Plex Sans Condensed`，数字 `IBM Plex Mono`，正文（信息面板里给孩子读的段落）保留衬线以示区分；中文回退 `PingFang SC / Noto Sans CJK SC`，不自托管中文字体。小号大写 + 宽字距（.08–.16em）只用于 HUD 标签，孩子读的正文不大写。

**禁止**：三方库默认灰塑料材质、随机堆细节、大面积黑底、霓虹、lens flare、游戏式六边形 HUD、厚重卡片阴影、圆角大于 2px 的 HUD 元素（孩子读的面板允许 6px）。

**独立成立**：按 `H` 隐藏 HUD 后，舞台画面要能当作品集封面。

## 2. HUD 布局契约（SceneHost）

```text
┌ 顶栏：◇ ATLAS · {学科}        {DOC-ID}          VIEW [1][2][3]…  MODE [X][E][C][F]…  ┐
│       状态行：{VIEW} · {RUNNING|PAUSED} · {MODE 50}        快捷键提示                 │
├ 左：章节轨（编号 01–NN、年级芯片、敏感锁）                                           │
│ 左上贴画布：标题 / 副标题 EN+中文 / 规格 dl（4–8 行，mono 数字，来源芯片）            │
│ 右上：一张示意 SVG 卡（引擎决定：过程链 / 时间条 / 剖面）随状态高亮                   │
│ 舞台中央：地图或 3D；两列引线标注                                                     │
│ 右：信息面板（章节正文、选中对象、测验）                                              │
├ 底：三块等高面板 ──────────────────────────────────────────────────────────────────  │
│   01 / ARCHITECTURE 结构（引擎画：纵剖面 / 时间轴标尺）                               │
│   02 / DETAIL 细节（当前章或选中对象）                                                │
│   03 / STATE 状态（与动画同拍：运行相、时间、参战数）                                 │
└ 右下安静小字：FPS · DRAW CALLS · TRIS · RES（仅 3D；地图显示 FEATURES · ZOOM）        ┘
```

- DOC-ID 规则：`ATL-{TOPIC 大写去连字符前 6}-{章节序号 2 位}`，如 `ATL-SAMPLE-02`。
- 所有 HUD 块带 `data-hud-panel`，缩放系数 `--k = clamp(min(W/1920, H/1080), .6, 1.6)`，各角以所在角为 transform-origin。
- 响应式：≥1440 完整；1080 完整略小；720 底部三面板压缩成一行标签页；< 760 宽（手机）保留舞台 + 章节轨折叠 + 底部控制，隐藏右上卡与三面板。任何尺寸不重叠、不横向溢出。
- 现有 ChapterRail / InfoPanel / QuizCard / Counter 保留职责，按上面的排版重做皮肤（hairline、编号、芯片）。

## 3. 交互契约

- 镜头预设：每章一个，加 `ORBIT`（慢速转台）；数字键 `1–N` 切预设，1.4–1.8 s easeInOut，球坐标插值不穿模；拖拽即 `FREE CAMERA`，点预设平滑收回。
- 模式键（按引擎）：

| 键 | SpaceScene | TimeScene |
|---|---|---|
| X | X-RAY（.3 s） | — |
| E | EXPLODED（2 s） | — |
| C | CUTAWAY 滑块（连续） | — |
| F | FLOW（= run，.6 s 淡入） | 行军箭头层 |
| R | REFERENCE（正侧 / 正前，拉直，2 s，再按恢复） | 版图对照（当前 vs 上一关键帧并排） |
| L | 标注开关 | 标签开关 |
| SPACE | 运转暂停 | 播放 / 暂停 |
| P | PRESENTATION（按章自动演示） | 同左 |
| H | 隐藏 HUD | 同左 |
| ← → | 章节 | 章节 |
| ESC | 退出 focus / presentation | 同左 |

- 按钮与键共用同一个 store 字段；按钮 `.on` 由 state 推导。输入框聚焦时不响应快捷键。无意义的组合显式禁用并在状态行说明。
- 触控：所有按钮 ≥ 44px；长按 = 悬停；双指 = 旋转/缩放。

## 4. 模型规则（SpaceScene）

- 每个零件有功能理由（数据里的 `summary` 必须说它干什么）；禁止"为了复杂"的零件。
- 引擎提供的程序化零件（在 `primitive.kind` 基础上扩展）：`bevelBox`（真实截面 + 倒角）、`tube`（沿路径、统一弯曲半径）、`flange`（带螺栓圆）、`fins`（散热鳍片阵列）、`vessel`（圆柱 + 封头）；`repeat: {count, axis, spacing | radius}` 生成 `InstancedMesh`。
- 材质族：`casing`（拉丝铝）、`steel`（机加工钢）、`powder`（粉末涂层黑框架）、`stainless`（管路，轴向拉丝）、`copper`、`rubber`、`plastic`（哑光，非默认灰）、`glass`。程序化 canvas 纹理给 roughness 变化与拉丝方向。
- 灯光：1 大柔 key（暖中性）+ 弱 fill + 半球/RoomEnvironment + 1 中性 rim，ACES Filmic。只有大件投影，地面接触阴影。
- CUTAWAY：保留 40–55% 外壳，切口 ochre + 剖面线（背面着色法，见 `perf-lessons.md` §9）。
- 性能：draw calls < 100（上限 150），三角形 ≤ 1.5 M，pixelRatio `min(dpr, 3840/W, 2)`，渲染循环零分配，`frameloop="demand"` 非运转时不渲。

## 5. 地图规则（TimeScene）

- 底图是"印在纸上的工程图"：陆地纸色、海洋极淡、国界 hairline、控制区用低饱和阵营色 + 可选 45° 斜线填充（fill-pattern，canvas 生成），不用大色块糊满。
- 箭头是工程流线：细线 + 小箭头头，流动用虚线步进，不发光（dark plate 允许微弱）。
- 标签：引线标注语法（标签 → 短横 → 折线 → 空心圆锚点），两列对齐，近景减量，遮挡/出屏淡出。
- 右上卡：参战 / 控制面积随时间的条带图（SVG），当前 `t` 一条竖线。
- 底部 01：时间轴变成标尺（主刻度年、次刻度月、章节节点），02：当前章的"孩子的问题"与一句答案，03：当前时间的状态表（参战方数、进行中战役数、活跃箭头数，标 SIMULATED 的不标，这些是数据统计）。

## 6. 事实纪律（内容进来后生效）

- 引擎数据 schema 增加 `source?: { tag: 'fact' | 'ref' | 'reconstruction' | 'simulated'; label?: Bilingual; url?: string }`，事件、零件、规格行都可带。
- HUD 芯片：`FACT` / `REF.` / `RECON.` / `SIM`，1px 框、小号大写、中文。
- 每个主题 `data/SOURCES.md`：每条数字一条来源 URL；来源冲突列出来，不偷偷选。
- 伤亡、人口等敏感数字：家长模式外只显示量级图标（Counter），不显示精确值。
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

`pnpm shoot <topic> [--size 3840x2160] [--keys] [--layout] [--theme cinema] [--locale zh]`：每章 × 每模式截图到 `shots/<topic>/`，收集 console error，`--keys` 核对键与按钮同步，`--layout` 在 3840 / 2560 / 1920 / 1280 / 900 / 390 宽度检查 `data-hud-panel` 重叠与溢出。退出码非 0 即失败。e2e 冒烟继续用 Playwright。

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
