# 06 · 开发指南

Phase 1 地基（站点框架、i18n、主题、内容集合、Scene 契约、共享部件）、Phase 2 两个引擎（TimeScene / SpaceScene）和 Phase 3 上线准备（PWA、Cloudflare Pages、e2e）都已就位，带两个占位主题。

## 跑起来

```bash
pnpm install
pnpm dev          # http://localhost:4321/  （/ 跳转 /en/）
pnpm build        # 先跑 validate，再 astro build，输出 dist/
pnpm preview      # 预览 dist/
pnpm check        # astro check + tsc --noEmit
pnpm validate     # 内容校验（schema、双语、id、引用）
pnpm test         # vitest（数据层单测）
pnpm build && pnpm e2e   # Playwright 冒烟（chromium，针对 pnpm preview 的 dist/）
```

- 子路径部署 / Capacitor：`ATLAS_BASE=/atlas pnpm build`，所有链接和资源都带 base。代码里拼路径一律用 `localeHref()` / `withBase()`（`src/i18n/index.ts`），不要手写 `/en/...`。
- Node ≥ 22（`.node-version` = 22，Cloudflare Pages 读它），pnpm 9。依赖版本全部锁死在 `package.json`（Astro 5.18、React 19、Tailwind 4、zod 3）。

## 目录速查

```
src/
  content/
    config.ts                 # collections: topics, chapters（glob loader）
    schema/                   # common（bilingual / isoDate / geoTime / kebabId / colorRef）
                              # topic, chapter, camera, geojson —— 纯 zod，构建/校验/测试共用
    topics/<slug>/            # 一个主题一个目录
  engines/
    core/                     # Scene 契约：types, store, url-state, camera, context, SceneHost
    widgets/                  # ChapterRail InfoPanel Legend LayerToggles QuizCard Counter
                              # LangToggle ThemeToggle ParentModeToggle LevelPicker GlobalToggles
    time-scene/               # index.ts（descriptor）+ schema.ts（zod）+ View.tsx（stub）
    space-scene/              # 同上
    simulation/               # 占位
    registry.ts               # 客户端引擎注册表（descriptor 同步，View 懒加载）
    schemas.ts                # 构建期引擎 schema 注册表（含 zod，禁止进客户端）
  i18n/                       # ui.en.json ui.zh.json + t() / tx() / 路径工具
  theme/                      # tokens.css, theme.ts（解析/应用/读 token）, map-style.ts
  lib/                        # content.ts（构建期取内容）, prefs.ts（localStorage）, time.ts, levels.ts
  components/                 # SiteToggles 岛、MDX 组件（Lang / Soft / Full）
  layouts/BaseLayout.astro    # <html lang>、首帧前主题脚本、hreflang
  pages/                      # index.astro（跳转）, [locale]/index.astro, [locale]/topics/[slug].astro
  styles/                     # global.css（Tailwind + token 映射）, scene.css（布局与部件）
scripts/validate-content.ts
tests/                        # vitest
```

## 加一个主题

1. 建目录 `src/content/topics/<slug>/`，`<slug>` 就是 URL 和 `topic.yaml` 里的 `id`（kebab-case，必须一致）。
2. 写 `topic.yaml`（字段见 docs/02）。`engine` + `stage` 必须是引擎支持的组合：`time-scene: geo | diagram`，`space-scene: model3d | layer2d`。
3. 写章节 `chapters/<nn>-<id>.mdx`，frontmatter：`id, order, title, level, sensitive, state, quiz`。
   - `state` 由引擎解释，见下文「章节状态」。
   - 正文双语写在同一个文件里，**标签前后要空行**，否则里面的 Markdown 不会被解析：

     ```mdx
     <Lang en>

     English **markdown** here.

     </Lang>

     <Lang zh>

     中文 **markdown** 写这里。

     </Lang>
     ```
   - 敏感段落：`<Soft>柔化版</Soft>` 默认显示，`<Full>完整版</Full>` 只在家长模式显示（两版都进 HTML，CSS 按 `html[data-parent]` 切换）。
4. 引擎数据放 `data/*.json`，文件名（去掉 `.json`）就是数据对象的 key：
   - TimeScene/geo：`entities.json`、`control.json`、`movements.json`、`events.json`
   - SpaceScene：`parts.json`（含 parts / groups / flows / animations / views）
5. `pnpm validate`，按报错改到 0 error。缺中文是 warning，缺英文是 error。
6. `status: draft` 也会出现在索引页（带"草稿"标记）。发布前改 `published`。

### 校验规则（`pnpm validate`，`pnpm build` 前自动跑）

- topic.yaml / 章节 frontmatter / 引擎数据都按 zod schema 解析
- 双语字段：`en` 必填非空（error），`zh` 缺失或为空（warning，运行时回退英文）
- 主题内所有 id（主题、章节、实体、事件、行军、零件、组、流、动画）kebab-case 且全主题唯一
- 章节 `order` 唯一；文件名建议 `<nn>-<id>.mdx`
- 章节 `state` 按引擎的 chapter-state schema 校验；`highlight` / `part` / `layers`（space 的组）引用的 id 必须存在
- 引擎要求的数据文件必须存在；`cover` 指向的文件必须存在
- MDX 正文要有 `<Lang en>` 和 `<Lang zh>`
- `ui.en.json` 与 `ui.zh.json` key 一致

## Scene 契约（给二期引擎实现者）

### 数据怎么到引擎

```
data/*.json ──(build: import.meta.glob)──> engineSchemas(engine, stage).data.parse()  ← zod，构建期
           ──> SceneHost props.data（已解析、已校验，序列化进 HTML）
           ──> <EngineView data={...}>（客户端直接用，不再引 zod）
```

- 引擎客户端代码只能 `import type` schema 里的类型（`TimeSceneGeoData`、`SpaceSceneData` 等），**不要运行时 import `schema.ts`**，否则 zod 进包。
- 大体量资源（Natural Earth GeoJSON、glb）放 `public/geo/`、`public/models/`，用 `withBase('/geo/xxx.json')` 在客户端 fetch；不要放进 `data/`（`data/` 会内联进页面 HTML）。

### 引擎由两部分组成

1. **descriptor**（`src/engines/<id>/index.ts`，同步、极小、无 zod）：

   ```ts
   export const timeSceneEngine = defineEngine<TimeSceneExt, TimeSceneGeoData>({
     id: 'time-scene',
     defaults(topic, data) { return { t: ..., highlight: [], layers: [...] }; }, // 扩展字段默认值，可覆盖 common 默认
     fromChapterState(state) { return { t: state.time, highlight: state.highlight }; }, // 章节 state -> 扩展字段
     fromUrl(fields) { return { t: fields.t }; },          // URL 解码出的引擎字段 -> 校验后接收
     load: () => import('./View'),                          // 懒加载视图
   });
   ```

2. **View**（`src/engines/<id>/View.tsx`，`export default`）：只在客户端渲染（SceneHost 挂载后才渲染引擎，可以放心用 `window`、WebGL、MapLibre）。props：`{ topic, chapters, data, locale }`。

新引擎：写 descriptor + View，在 `registry.ts` 和 `schemas.ts` 各加一行。

### Store API（zustand，每个 Scene 一个）

```ts
import { useScene, useSceneStore, useSceneContext, useT, SceneSlot } from '../core/context';

const t = useScene<TimeSceneExt, TimePoint | null>((s) => s.t);   // 选择器订阅，shallow 比较
const store = useSceneStore<TimeSceneExt>();                       // 拿 store 调 action
store.getState().patch({ t: '1942-02-10' });                       // 用户交互（拖条、点零件）
store.getState().goToChapter('fall-of-singapore');                 // 跳章（会 bump transition）
store.getState().stepChapter(1, canEnter);                         // 上一章/下一章
store.getState().toggleLayer('battles'); setLayers([...]); setCamera(cam); setTheme('cinema');
store.getState().chapterTarget(id);                                // 某章的目标状态（纯函数）
```

- **SceneState**：`chapter, layers, camera, theme` + 引擎扩展字段（TimeScene：`t, highlight`；SpaceScene：`part, view, explode, run, cutaway`）。
- **章节目标是累积的**：第 N 章目标 = 默认值 ⊕ 第 1..N 章的 `state` 依次叠加。作者只写变化的字段；同一章永远得到同一状态，URL 可复现。
- **过渡**：`transition: { id, reason: 'init' | 'chapter' | 'url', instant }`。引擎监听 `transition.id` 变化，向当前状态做动画（flyTo、时间插值、零件淡入）；`instant: true`（首次加载、深链接）时直接跳过去。用户 `patch()` 不 bump transition，引擎直接跟随。
- **相机**：`GeoCamera { center, zoom, pitch?, bearing? }` 或 `OrbitCamera { position, target, fov? }`。地图 `moveend` 后 `setCamera()` 回写，URL 会自动同步。

### URL 同步

- key：`ch, layers, cam, theme` + 引擎 `t, hl, part, view, explode, run, cut`（完整说明见文末「URL 参数」）。与当前章节目标相同的字段不写进 URL（普通章节链接就是 `?ch=<id>`）；其它 query 参数原样保留。
- 写入用 `history.replaceState`，250 ms 防抖；切语言前自动 flush。纯函数 `encodeSceneState / decodeSceneState / mergeSearch` 有单测。
- 新增可链接字段：在 `UrlEngineFields`（core/types.ts）和 `url-state.ts` 的编解码里各加一处，再在 descriptor 的 `fromUrl` 接收。

### 布局插槽（引擎往哪里画控件）

SceneHost 渲染公共布局：顶栏（返回、标题、全局开关）、左侧 ChapterRail、中间舞台、右侧 InfoPanel、舞台下方 bottom bar。引擎通过 portal 往插槽里渲染：

```tsx
<SceneSlot name="bottomBar">   {/* 时间轴 / Explorer 控件 */}
<SceneSlot name="stageOverlay">{/* 舞台右上浮层：SceneLayerToggles、Legend */}
<SceneSlot name="inspector">   {/* InfoPanel 里的选中对象详情，可放 Counter */}
```

- bottom bar 为空时自动隐藏。
- 键盘 ← → 由 SceneHost 全局绑定为上一章/下一章。引擎区域需要自己用方向键（地图平移）时给容器加 `data-keys="own"`；`input / select / [role=slider] / [role=radiogroup]` 内自动让出。
- 触控：所有交互用 Pointer Events，可点目标 ≥ 44px（`.atlas-control` 已满足），不依赖 hover。舞台不设全局 `touch-action`，引擎在自己的 canvas 上设。

### 主题

- token 在 `src/theme/tokens.css`（`paper` / `cinema`）。组件里只用 `var(--x)` 或 Tailwind 映射类（`bg-surface text-ink-muted border-border`），不写死颜色。
- 优先级：用户全局覆盖（localStorage `atlas:theme`）> 场景主题（URL `theme=` 或章节累积的 `state.theme`）> `topic.yaml theme` > `paper`。首帧前由 BaseLayout 内联脚本按同一规则设置 `data-theme`，无闪烁。
- 数据里的颜色写 `token:accent-1` / `#hex`；DOM/SVG 用 `resolveColorRef(ref)`（得到 `var(--accent-1)`，随主题自动变），canvas/WebGL 用 `resolveColorRef(ref, readThemeTokens())` 取实值，并在主题切换后重读。
- MapLibre：`buildMapStyle({ sources: { land, water?, rivers? } })` 从当前 token 生成底图 style（只有 GeoJSON source，无 glyphs/sprite/瓦片）。二期加 symbol 标签需要本地 glyphs，放 `public/fonts/`。主题切换时重建 style（监听 `<html data-theme>` 变化即可）。

### 年级与家长模式

- `LevelPicker`（默认 P3，localStorage `atlas:level`）：高于所选年级的章节在 ChapterRail 折叠为"再长大一点再看"，←→ 和上下章按钮会跳过它们；通过深链接进入时仍显示正文并提示。
- `ParentModeToggle`（localStorage `atlas:parent`，开启需 3 秒内连点两次）：展开所有章节，显示 `<Full>` 版本。
- 读写偏好走 `src/lib/prefs.ts` 的 hook（`useLevel / useParentMode / useThemeOverride`），不要直接碰 localStorage；场景状态不进 localStorage，只进 URL。

## 约束清单（每次改动自查）

- 纯静态：无 SSR、无 API 路由、客户端无 Node API
- 无运行时外部请求：无 CDN、无 webfont、无瓦片
- 客户端不引 zod（构建期解析）；首屏 JS ≤ 300 KB gz（当前主题页约 90 KB gz）
- 所有文案双语；界面文案进 `ui.*.json`，内容文案用 `{ en, zh }`
- `pnpm check && pnpm validate && pnpm test && pnpm build` 全绿

## TimeScene（二期 A：GeoStage + Timeline）

代码在 `src/engines/time-scene/`：

```
index.ts              descriptor（扩展字段 t / highlight，未变）
schema.ts             zod（构建期），客户端只 import type
View.tsx              组装：GeoStage + Timeline + 图层/图例 + 事件详情；store ↔ 播放头同步
stages/geo/GeoStage.tsx    React 壳，懒加载 controller（MapLibre 在这个 chunk 里）
stages/geo/controller.ts   命令式驱动 MapLibre：图层、标签、箭头、脉冲、镜头、主题
timeline/Timeline.tsx      章节节点 + 细拖条 + 播放/倍速（渲染进 bottomBar 插槽）
timeline/usePlayback.ts    播放循环（全程约 60 s @×1，遇章节节点停 1.5 s）
EventInspector.tsx         点事件 → inspector 插槽（Counter；sensitive 事件的伤亡仅家长模式）
lib/time.ts  lib/format.ts  lib/geo.ts  lib/model.ts  lib/frame.ts  lib/playhead.ts   纯函数，单测在 tests/time-scene/
colors.ts  time-scene.css
```

### 作者怎么写数据

四个文件放 `data/`（schema 见 docs/03 §A 与 `schema.ts`）：

| 文件 | 要点 |
|---|---|
| `entities.json` | `id, name, bloc(axis/allied/neutral), joined, left?, color?`。颜色默认取阵营 token，`color: "token:accent-3"` 或 `#hex` 覆盖。`joined` 驱动 participation 图层"点亮"。 |
| `control.json` | `keyframes[]`，按时间严格升序；每帧一个 FeatureCollection，`properties.holder` = 实体 id。同一实体可有多个面（或 MultiPolygon）。 |
| `movements.json` | `from/to` 时间区间 + LineString `path`（从起点画到终点）。`strength` 决定线宽（相对全主题最大值）。 |
| `events.json` | `t`、可选 `until`、`at`、`kind`、`importance`（**3 最重要 = 点最大**，1 最小）、`sides/forces/casualties/result`。`sensitive: true` 的事件伤亡数字只在家长模式显示。 |

章节 `state`：`time`（ISO 三种精度或 `{ ma }`）、`camera`、`layers`、`highlight`（实体/行动/事件 id）、`theme`。章节节点在时间轴上的位置 = 该章累积目标的 `t`。

### 图层（`layers` 里的 id）

| id | 渲染 | 开关 |
|---|---|---|
| `base` | 陆地/海洋（`public/geo/land-50m.json`） | 永远开 |
| `control` | 两个 GeoJSON source（前帧/后帧）交叉淡化：区间最后 30% 内前帧 1→0.4、后帧 0→1；落在关键帧上只显示该帧 | 可关 |
| `borders` | 今天的国界 + 国名（`countries-50m.json`，第一次打开时才下载） | 默认关 |
| `movements` | 已走过的路径 + 流动虚线（约 12 fps）+ 头部箭头（HTML marker）；cinema 主题加 glow 底线 | 可关 |
| `battles` | 已发生的事件点（按 importance 定大小，进行中的更实），进入 `[t, until]` 时脉冲一次（~900 ms）；点击（44 px 命中框）→ 详情 + `highlight` | 可关 |
| `participation` | 实体在当前关键帧的面：加入后描边，加入那一刻闪亮（时长 = 全程 4%） | 默认关 |

标签都是 HTML marker（无 glyphs），最多 12 个。每次放置后（时间变化、`moveend`、换语言）跑一遍贪心避让：按 高亮 > 事件 > 实体 > 行动 > 国名 排序，用真实屏幕矩形（4 px 间隙）检测，与已保留标签相交的低优先级标签被隐藏（`data-collided`）；`highlight` 的对象标签永远显示。

### 时间

- `toNumber(t)`：ISO → 十进制年（取时段起点：`1942-02` = 1942 年 2 月 1 日）；`{ ma }` → 负的年数（`{ ma: 200 }` = -2e8）。`fromNumber(n, scale)` 反向，日期按日向下取整，地质时间保留 2 位小数 Ma。
- 时间轴范围 = 关键帧、事件（含 `until`）、行动起止、章节时间的最小/最大值。
- store 里的 `t` 是日精度 TimePoint（进 URL）；地图按连续的"播放头"渲染。跳章时播放头 1.6 s 缓动到新时间；拖动/播放/Shift+←→ 直接移动播放头并 `patch({ t })`。
- 读数格式 `formatTime(t, locale)`：`15 Feb 1942` / `1942年2月15日`；`200 Ma` / `2亿年前`、`6600万年前`。跨度 >12 年时读数降到月，>100 年降到年。

### 交互约定

- ← → 换章（核心处理；焦点在拖条上时由 Timeline 自己转发）；Shift+← → 按一步微调时间；焦点在时间轴里时空格 = 播放/暂停；Home/End 到头尾。
- 地图容器 `data-keys="own"`；点地图不会抢键盘焦点（canvas 被点击聚焦后立即 blur），Tab 进入地图仍可用方向键平移。
- 用户平移/缩放 `moveend` 后 250 ms 防抖 `setCamera()`；章节切换 `flyTo`（2.2 s），首次加载/深链接 `jumpTo`；`prefers-reduced-motion` 时不飞、不脉冲、虚线不流动。
- 主题切换：观察 `<html data-theme>`，重读 token、`setPaintProperty`，不重建地图。

### 底图数据

```bash
pnpm tsx scripts/build-geo.ts   # world-atlas(Natural Earth 1:50m) → public/geo/*.json，产物入库
```

陆地 3 位小数（~110 m），国界简化到 ~2 km，合计约 1.75 MB（预算 2 MB）。来源与许可见 `public/geo/README.md`（Natural Earth，公有领域）。

### 包体

MapLibre 只在 `controller` chunk 里，View 挂载后才加载（时间轴先出来）。实测 sample-time 页全部 JS：约 374 KB gz / 312 KB br，其中 MapLibre 5.24 自身约 275 KB gz（含内联 worker），本引擎自有代码约 13 KB gz（View 8 KB + controller 约 5 KB）。**超出 docs/02 的 300 KB gz 预算**，需要产品层决定：按 brotli 计、对 geo 主题放宽到 ~400 KB gz，或换更小的地图库版本。

## SpaceScene（空间拆解引擎，Phase 2B）

`engine: space-scene`、`stage: model3d`。代码在 `src/engines/space-scene/`：

```
index.ts                 descriptor（part/view/explode/run/cutaway）
schema.ts                parts.json 的 zod（构建期）
View.tsx                 挂 Model3DStage（再懒加载一层）+ Explorer 控件
lib/                     纯函数，有单测：explode / visibility / flow-curve / color / animation / camera / math
stages/model3d/          R3F 舞台：Model3DStage（createRoot 宿主）、SceneRoot、PartNode、Flows + flowMaterial（自写 shader）、
                         CameraRig（OrbitControls + 章节运镜）、Lighting（主题灯光 + RoomEnvironment）、GroundShadow、GltfSource（懒加载）
explorer/                ExplorerBar（bottomBar）、ExplorerOverlay（stageOverlay）、Inspector（inspector）
space-scene.css          舞台、标签、控件样式（只用 token）
```

### 作者怎么写数据（`data/parts.json`）

```jsonc
{
  "model": "/models/aircon.glb",          // 可选；有 mesh 零件时必填，放 public/models/，引擎自动加 base
  "parts": [{
    "id": "compressor", "name": {en, zh}, "group": "refrigerant",
    "summary": {en, zh}, "detail": {en, zh},   // detail 在详情卡里折叠在「了解更多」后面
    "primitive": { "kind": "cylinder", "size": [0.3, 0.3, 0.5], "at": [1, 0, 0], "rotation": [0, 0, 90], "color": "metal" },
    "mesh": "Compressor",                  // 或者：glb 里的节点名（Blender 物体名）；两者都写时 glb 加载后替换积木
    "explode": { "dir": [1, 0, 0.3], "dist": 1.2 },   // dir 会归一化；位移 = dir × dist × explode
    "connects": ["condenser"],             // 详情卡里变成可点的芯片
    "level": "P5"
  }],
  "groups": [{ "id": "refrigerant", "name": {en, zh}, "color": "token:accent-1" }],
  "flows": [{ "id": "loop", "group": "refrigerant", "path": [[x,y,z], ...], "speed": 1, "color": "token:accent-1", "whenRun": true }],
  "animations": [
    { "id": "fan-spin", "target": "fan", "kind": "rotate", "axis": [0,0,1], "rpm": 120 },
    { "id": "flap", "target": "louver", "kind": "oscillate", "axis": [1,0,0], "amplitude": 20, "hz": 0.5 },   // amplitude 单位：度
    { "id": "beat", "target": "pump", "kind": "pulse", "scale": 1.15, "hz": 1 }                                // scale 是峰值缩放
  ],
  "views": {
    "assembled": { "camera": { "position": [3,2,4], "target": [0,0,0], "fov": 40 } },
    "exploded":  { "camera": { ... } },     // 每个视图可选一个预设镜头
    "cutaway":   { "normal": [-1,0,0], "offset": 0 }   // 可选剖切面；默认切掉 x>0 一半
  }
}
```

- **积木尺寸**（`size`）：box `[宽,高,深]`、cylinder `[上半径,下半径,高]`、cone `[半径,高]`、sphere `[半径]`、torus `[半径,管粗]`、capsule `[半径,长度]`、plane `[宽,高]`（双面）。`rotation` 是 XYZ 欧拉角（度）。
- **颜色**：材质预设 `metal | plastic | copper | glass | rubber | matte`（每个主题一套色板，`lib/color.ts`），或 `token:<name>`、`#hex`。glb 零件用所在组的颜色。主题决定质感：paper 哑光（roughness 0.85 / metalness 0.05）、暖光、米色背景；cinema 金属（0.6 / 0.35）、冷光 + 轮廓光、近黑背景，选中零件发 `--glow` 色的脉动光。
- **流场**：`path` 首尾点相同 = 闭环。路径做成 centripetal Catmull-Rom，按弧长烘焙 64 个点进 shader，每条 200 粒子，`speed` 是场景单位/秒。`whenRun: false` 的流/动画一直播放（只受图层开关）。
- **glb**：不要用 Draco/meshopt 压缩（drei 默认去 CDN 拉 Draco 解码器，Atlas 不允许运行时外部请求，所以我们关掉了）。mesh 名找不到会 console.warn，该零件不显示；glb 整体加载失败时积木零件照常显示。

### 章节怎么写（`state`）

```yaml
state:
  view: exploded        # assembled | xray | exploded | isolate
  explode: 0.8          # 0..1，只在 exploded 视图生效
  part: compressor      # 选中零件；null 取消
  run: true             # 通电：播放 animations + flows（渐入渐出）
  cutaway: half         # none | half
  layers: [refrigerant, air]   # 可见的组
  camera: { position: [4, 3, 5], target: [0, 0.3, 0] }
```

章节目标照常累积。**镜头规则**：本章自己写了 `camera`（或 URL 有 `cam=`）就用它；否则用 `views[当前 view].camera`；都没有就沿用上一章。用户在底栏切视图时，如果该视图有预设镜头，也会飞过去。切章 ~800 ms 缓动，首次加载/深链接/`prefers-reduced-motion` 直接跳。窄屏（竖屏手机）自动把镜头往后拉，回写 URL 时再换算回来，链接与设备无关。

### 交互（Explorer）

- 点零件选中（高亮 + 描边，InfoPanel 出详情）；点空白处取消；拖动（OrbitControls，带阻尼）旋转，停手 400 ms 后 `setCamera()` 回写 URL。
- 鼠标悬停显示零件名标签；触摸设备没有悬停，长按 ≥ 400 ms 选中并显示标签。有选中零件时只显示它的标签。
- 视图：`xray` 未选中零件透明 0.15；`isolate` 只显示选中零件和同组零件；图层开关对所有视图生效（包括选中的零件）。可见性规则在 `lib/visibility.ts`，有单测。
- 底栏：视图分段按钮（←→ 在组内切换）、拆开程度滑块（仅 exploded，44 px 拇指）、通电开关、剖开开关。舞台浮层：图层开关 + 图例（窄屏只留图层开关）。

### 实现约定

- R3F 用 `createRoot` 驱动，不用 `<Canvas>`：`<Canvas>` 会 `extend(THREE)` 整个命名空间，tree-shaking 失效（多 ~50 KB gz）。新用到的 three 类要在 `stages/model3d/extend.ts` 里登记，否则 JSX `<xxx>` 会报 "not part of the THREE namespace"。
- 舞台是独立 reconciler，React context 不穿透：store、data、主题 look 都以 props 传入 `SceneRoot`，组件里用 `zustand` 的 `useStore(store, …)`。
- `frameloop: 'demand'`：只有在缓动（拆开、淡入淡出、运镜）、运转、cinema 选中发光时才请求下一帧；标签页隐藏时不请求，回到前台再 invalidate。几何体/材质都由我们自己创建和 dispose（`dispose={null}` 交给组件卸载时清理）。
- 包体：sample-space 页实测加载 JS 共 287 KB gz（站点公共 ~83 KB + 舞台 chunk 202 KB，其中 three + R3F 占绝大部分）。GLTF 加载器单独成 chunk（21 KB gz），只有写了 `mesh` 的主题才加载。

## PWA、部署与 e2e（Phase 3）

- **PWA**：`@vite-pwa/astro`（`astro.config.mjs`），`generateSW` + `autoUpdate`。预缓存构建出的页面、JS、CSS、图标；`/geo/*.json` 与 `/models/*.glb` **不**预缓存，走 CacheFirst 运行时缓存。scope / start_url 跟随 `ATLAS_BASE`。仅生产构建注册（BaseLayout 里 `import.meta.env.PROD`），`pnpm dev` 无 service worker。
- **图标**：`pnpm tsx scripts/build-icons.ts` 用 sharp 生成 `public/icons/*.png`（192 / 512 / maskable-512 / apple-touch-icon），产物入库。
- **部署**：见 [07-deploy.md](07-deploy.md)。`public/_headers` 管缓存与安全头。
- **e2e**：`tests-e2e/smoke.spec.ts`，`playwright.config.ts` 用 `pnpm preview` 起 `dist/`，所以先 `pnpm build`。首次需 `pnpm exec playwright install chromium`。截图写入 `tests-e2e/__screenshots__/`（git 忽略，本地肉眼检查用）。

## URL 参数

页面 URL 就是场景状态。与「当前章节目标」相同的值不会写进 URL，所以普通章节链接只有 `?ch=<id>`；其它 query（如 `utm_*`）原样保留。非法值被丢弃，不报错。

| key | 含义 | 取值 | 引擎 | 例 |
|---|---|---|---|---|
| `ch` | 当前章节 | 章节 id | 通用 | `ch=power-on` |
| `layers` | 打开的图层 / 组 | 逗号分隔 id；空值 = 全关 | 通用 | `layers=control,battles` |
| `cam` | 镜头 | 地图 `lng,lat,zoom[,pitch[,bearing]]`；3D `px,py,pz,tx,ty,tz`；空值 = 无 | 通用 | `cam=103.8,1.35,7.5` |
| `theme` | 场景主题 | `paper` \| `cinema` | 通用 | `theme=cinema` |
| `t` | 当前时间 | `YYYY` / `YYYY-MM` / `YYYY-MM-DD` / `<n>ma`（地质时间，如 `200ma`）；空值 = 无 | TimeScene | `t=1942-02-10` |
| `hl` | 高亮对象 | 逗号分隔的实体 / 行动 / 事件 id；空值 = 取消高亮 | TimeScene | `hl=battle-of-singapore` |
| `part` | 选中零件 | 零件 id；空值 = 不选 | SpaceScene | `part=compressor` |
| `view` | 视图 | `assembled` \| `xray` \| `exploded` \| `isolate` | SpaceScene | `view=xray` |
| `explode` | 拆开程度 | 0 到 1 | SpaceScene | `explode=0.35` |
| `run` | 通电运转 | `1` \| `0` | SpaceScene | `run=1` |
| `cut` | 剖切 | `none` \| `half` | SpaceScene | `cut=half` |

新增可链接字段：改 `core/types.ts` 的 `UrlEngineFields`、`core/url-state.ts`（`ENGINE_URL_KEYS`、`URL_KEY_ORDER`、编解码）、`SceneHost.tsx` 里解构的字段、descriptor 的 `fromUrl`，并补 `tests/url-state.test.ts`。
