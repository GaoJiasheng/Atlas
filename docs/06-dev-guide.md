# 06 · 开发指南

Phase 1 地基（站点框架、i18n、主题、内容集合、Scene 契约、共享部件）、Phase 2 两个引擎（TimeScene / SpaceScene）、Phase 3 上线准备（PWA、Cloudflare Pages、e2e）和技术图版打磨（P1–P4，docs/08）都已就位，带两个占位主题。

**术语**（全文统一）：**预设**（preset）= 相机预设，顶栏按钮组 `VIEW`，数字键 `1–9`；**模式**（mode）= 可开关的显示 / 行为，顶栏按钮组 `MODE`，字母键；**状态行** = 顶栏第二行；**插槽**（slot）= 引擎往宿主 HUD 里画内容的位置；**面板**（panel）= 底部 `panel01–03`；**卡片**（card）= 右上示意卡。SpaceScene 里的 `state.view`（assembled / xray / exploded / isolate）是"显示视图"，与 `VIEW` 按钮组（相机预设）无关。

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
pnpm shoot <topic> …     # 截图 + 键位 + 布局 QA（先 pnpm build，见下文「QA：pnpm shoot」）
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
    core/                     # Scene 契约：types, store, url-state, camera, context, SceneHost,
                              # controls（HUD 注册 + 动作）, keys（键盘）, test-api（window.__atlas）, Hud（顶栏/标题块/面板框）
    widgets/                  # ChapterRail ChapterBodies InfoPanel Legend LayerToggles QuizCard Counter
                              # LangToggle ThemeToggle ParentModeToggle GlobalToggles icons
    time-scene/               # descriptor + schema + View + stages/geo + timeline + hud（见「TimeScene」）
    space-scene/              # descriptor + schema + View + stages/model3d + hud + explorer（见「SpaceScene」）
    simulation/               # 后期占位引擎（只有 descriptor + schema + StubStage；不在一期范围）
    registry.ts               # 客户端引擎注册表（descriptor 同步，View 懒加载）
    schemas.ts                # 构建期引擎 schema 注册表（含 zod，禁止进客户端）
  i18n/                       # ui.en.json ui.zh.json + t() / tx() / 路径工具
  theme/                      # tokens.css, theme.ts（解析/应用/读 token）, map-style.ts
  lib/                        # content.ts（构建期取内容）, prefs.ts（localStorage）, time.ts, levels.ts（仅供 schema 校验可选的规划字段 `level`）
  components/                 # SiteToggles 岛、MDX 组件（Lang / Soft / Full）
  layouts/BaseLayout.astro    # <html lang>、首帧前主题脚本、hreflang
  pages/                      # index.astro（跳转）, [locale]/index.astro, [locale]/topics/[slug].astro
  styles/                     # global.css（Tailwind + token 映射）, fonts.css（自托管 Plex woff2）, scene.css（HUD 布局与部件）
scripts/                      # validate-content.ts, build-geo.ts, build-icons.ts, shoot.ts（pnpm shoot）
tests/                        # vitest（数据层与纯函数）
tests-e2e/                    # Playwright：smoke.spec.ts, hud.spec.ts, hud-layout.ts（pnpm shoot --layout 共用）
```

## 加一个主题

1. 建目录 `src/content/topics/<slug>/`，`<slug>` 就是 URL 和 `topic.yaml` 里的 `id`（kebab-case，必须一致）。
2. 写 `topic.yaml`（字段见 docs/02）。`engine` + `stage` 必须是引擎支持的组合：`time-scene: geo | diagram`，`space-scene: model3d | layer2d`。
3. 写章节 `chapters/<nn>-<id>.mdx`，frontmatter：`id, order, title, sensitive, state, quiz`（`level` 可选，仅作内容规划，不渲染）。
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
   - 正文组件（免 import，和 `<Lang>` 同一机制，在 `src/pages/[locale]/topics/[slug].astro` 的 `components` 里注册；都是静态 HTML，交互由 SceneHost 委托处理）：

     | 组件 | 写法 | 效果 |
     |---|---|---|
     | `<More>` | `<More title={{ en: "The numbers", zh: "数字" }}>`（里面空行再写 Markdown）`</More>` | 细看折叠块：hairline 标题行 + 小三角，默认收起；原生 `<details>`，无 JS 也能用 |
     | `<Num>` | `<Num s="S3">about 70,000</Num>`；多个来源 `s="S3,S7"` | 数字后跟 mono 上标来源号，点开来源弹层（文本、说明、链接，不联网） |
     | `<FlyTo>` | `<FlyTo preset="singapore-island">Singapore island</FlyTo>` | 正文里的 hairline 按钮，镜头飞到 `presets.json` 里的预设（与 VIEW 按钮同一动作；手机上顺便收起阅读面板） |
4. 引擎数据放 `data/*.json`，文件名（去掉 `.json`）就是数据对象的 key：
   - TimeScene/geo：`entities.json`、`control.json`、`movements.json`、`events.json`；可选 `presets.json`（额外镜头）
   - SpaceScene：`parts.json`（含 parts / groups / flows / animations / views）
   - 两个引擎都可选 `sources.json`（编号来源，共用 schema `src/content/schema/sources.ts`）：

     ```json
     { "sources": [
       { "id": "S1", "text": { "en": "IMTFE judgment (1948): over 200,000.", "zh": "远东国际军事法庭判决书（1948）：超过 20 万。" },
         "url": "https://…", "note": { "en": "Nanjing tribunal (1947): over 300,000. Both listed.", "zh": "南京军事法庭（1947）：30 万以上。两者并列。" } }
     ] }
     ```

     `id` 是 `S` + 数字、全主题唯一；`url`（http/https）和 `note` 可选。`data/SOURCES.md` 的编号来源段由脚本生成：`pnpm tsx scripts/sources-md.ts <slug>`——只替换 `<!-- sources:begin … -->` 与 `<!-- sources:end -->` 之间的块（没有就追加到文末），SOURCES.md 里手写的地图来源、许可、配准说明保留。
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
- `sources.json`：id 形如 `S1`、不重复；事件的 `sources` 和正文 `<Num s="…">` 引用的编号必须在 `sources.json` 里（没有这个文件却引用了也报错）
- 正文 `<FlyTo preset="…">` 必须是 `presets.json` 里的预设；`<More>` 必须带 `title`；预设 id 与章节等 id 一样全主题唯一，且不能叫 `world` / `theatre`
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
store.getState().stepChapter(1);                                   // 上一章/下一章（逐章，到头返回 null）
store.getState().toggleLayer('battles'); setLayers([...]); setCamera(cam); setTheme('cinema');
store.getState().chapterTarget(id);                                // 某章的目标状态（纯函数）
```

- **SceneState**：`chapter, layers, camera, theme` + 引擎扩展字段（TimeScene：`t, highlight`；SpaceScene：`part, view, explode, run, cutaway`）。
- **章节目标是累积的**：第 N 章目标 = 默认值 ⊕ 第 1..N 章的 `state` 依次叠加。作者只写变化的字段；同一章永远得到同一状态，URL 可复现。
- **过渡**：`transition: { id, reason: 'init' | 'chapter' | 'url' | 'preset' | 'snap', instant }`（`preset` = 镜头预设、`snap` = 立即完成，见下文 HUD 控件注册）。引擎监听 `transition.id` 变化，向当前状态做动画（flyTo、时间插值、零件淡入）；`instant: true`（首次加载、深链接）时直接跳过去。用户 `patch()` 不 bump transition，引擎直接跟随。
- **相机**：`GeoCamera { center, zoom, pitch?, bearing? }` 或 `OrbitCamera { position, target, fov? }`。地图 `moveend` 后 `setCamera()` 回写，URL 会自动同步。

### URL 同步

- key：`ch, layers, cam, theme` + 引擎 `t, hl, part, view, explode, run, cut`（完整说明见文末「URL 参数」）。与当前章节目标相同的字段不写进 URL（普通章节链接就是 `?ch=<id>`）；其它 query 参数原样保留。
- 写入用 `history.replaceState`，250 ms 防抖；切语言前自动 flush。纯函数 `encodeSceneState / decodeSceneState / mergeSearch` 有单测。
- 新增可链接字段：在 `UrlEngineFields`（core/types.ts）和 `url-state.ts` 的编解码里各加一处，再在 descriptor 的 `fromUrl` 接收。

### 布局（技术图版 HUD，docs/08 §2）

舞台铺满页面，HUD 浮在上面；阅读用的 InfoPanel 在 ≥1024px 是右侧停靠列，以下是底部抽屉（收起时只有章节标题 +「阅读」按钮）。SceneHost 用 CSS grid 排布，各块贴在自己的角上，结构上不可能互相重叠：

```
顶栏  ◇ ATLAS · 学科 │ ATL-{TOPIC6}-{NN} │ VIEW [01][02]…  MODE [X][E]…  PARENT LOOK 中文
      状态行 VIEW 02 · PAUSED · X-RAY              键位提示
左列  标题块（PLATE NN · 章节名 / 主题名 / 副标题 / 规格 dl / 声明）+ ChapterRail
右列  card（右上示意卡）+ stageOverlay（图层 / 图例）
底部  perf（安静读数）→ panel01‖panel02‖panel03 → bottomBar（引擎控件）
```

### 布局插槽（引擎往哪里画）

引擎用 `<SceneSlot name=…>` portal 进插槽；空插槽什么都不渲染（没有空框）。

| 插槽 | 位置 | 说明 |
|---|---|---|
| `bottomBar` | 底部最下 | 时间轴 / Explorer 控件（44px 触控，不随 HUD 缩小，4K 时放大） |
| `stageOverlay` | 右列，示意卡下 | 图层开关、图例 |
| `inspector` | InfoPanel 内 | 选中对象详情 |
| `card` | 右列顶 | 示意 SVG 卡的**内容**；标题由 `controls.card` 注册，宿主画框和 `A NAME 中文` 表头 |
| `panel01` `panel02` `panel03` | 底部三块等高面板 | 面板**内容**；标题由 `controls.panels` 注册，宿主画框和 `01 NAME 中文` 表头；没注册标题的面板不出现 |
| `perf` | 底部右上，安静小字 | `60 FPS · 16 CALLS · 0.02M TRIS · 1520×1026` / `FEATURES 63 · ZOOM 5.5 · 60 FPS` |
| `leaders` | 覆盖舞台的 `<svg>` | 引线标注；往里 portal SVG 元素（`<path>`、`<circle>`） |

- HUD 尺寸用设计像素（1920×1080 下的 px）乘 `--u` 写：`height: calc(18 * var(--u))`。卡片、面板里的 SVG 用 viewBox + 100% 宽高。
- 交互元素 ≥ 44px：HUD 按钮视觉 18px，触屏（`pointer: coarse`）时用透明 `::after` 撑到 44px；引擎自己的控件继续用 `.atlas-control`（44px，已改成 hairline 皮肤）。
- 舞台不设全局 `touch-action`，引擎在自己的 canvas 上设。

### HUD 控件注册（`core/controls.ts`）

引擎 View 里注册一次（传 `useMemo` 过的对象，身份变了就重新注册），宿主据此画 VIEW / MODE 按钮、状态行、键位提示、规格表、卡片和面板框，并绑定键盘和 `window.__atlas`：

```ts
import { useSceneControls, useHud } from '../core/context';
import type { SceneControls } from '../core/controls';

const controls = useMemo<SceneControls>(() => ({
  presets: { items: [{ id, label: '01', title?, chapter? }], set(id, { instant }) {} },   // 数字键 1–9
  modes:   { items: [{ id: 'xray', key: 'x', label, on, disabled?, status?: 'EXPLODED 70', tone?: 'xray' | 'hot' | 'cold' | 'cut' | 'signal',
                      phone?: false }],   // phone:false = < 760 px 宽（手机）顶栏不画这个按钮（键仍可用）
             set(id, on, { instant }) {} },                                                 // 字母键
  pause:   { paused, set(paused) {} },                                                     // SPACE
  labels:  true,                     // 引擎认宿主的 LABELS 开关 → 宿主加 `labels` 模式（L）
  stats:   () => ({ calls, triangles, fps, features, zoom, gpu }),                          // 合并进 __atlas.stats()
  specRows: [{ id, label: { en, zh }, value, mono?, source?: 'fact' | 'ref' | 'reconstruction' | 'simulated' }],
  status:  ['SIMULATED'],            // 状态行追加段（大写）
  card:    { en: 'Process flow', zh: '工艺流程' },
  panels:  { panel01: { en, zh }, panel02: …, panel03: … },
  escape:  () => boolean,            // ESC：退出选中 / focus，处理了返回 true
}), [deps]);
useSceneControls(controls);
const labelsOn = useHud((s) => s.labels);   // 或 CSS：.atlas-scene[data-labels="off"] .my-label { display: none }
```

- 非 React 场合用 `registerSceneControls(hudStore, controls)`，返回注销函数。
- **镜头预设**：调用 `store.getState().applyCameraPreset(camera, { instant })`，它改 `camera` 并发一次 `transition.reason = 'preset'`（舞台照常飞过去；TimeScene 不因此停播放）。当前预设由宿主推导：显式选的 > 当前章节自己的（`preset.chapter`）；用户拖动 / 平移写回相机后变为 FREE CAMERA。
- **立即完成**：`store.getState().snap()` 发 `reason: 'snap'`、`instant: true` 的过渡，舞台跳到终态（测试、截图用）。
- 规格表：宿主先放默认行（学科 / 章节数 / 课纲锚点数），引擎行追加在后，最多 8 行。
- 接线现状：
  - **TimeScene**：预设 = 各章镜头 + `world` + `theatre`；模式 `flow`（F）/ `borders`（B）/ `graticule`（G）/ `reference`（R）/ `presentation`（P）+ 宿主 `labels`（L）；SPACE = 播放 / 暂停；ESC 依次退出演示、REFERENCE、事件详情、高亮。G / P 手机上不画按钮（`phone: false`）。
  - **SpaceScene**：预设 = 各章镜头（本章镜头 > 视图预设 > 继承）+ `ORBIT`（转台）+ `REF.`（= REFERENCE 模式的预设入口）；模式 `xray`（X）/ `exploded`（E）/ `cutaway`（C）/ `flow`（F，= run）/ `reference`（R）+ 宿主 `labels`（L）；SPACE = run；ESC 依次取消选中、退出 REFERENCE、停 ORBIT。R 手机上不画按钮（`phone: false`）。
  - SpaceScene 没有 PRESENTATION（P）；TimeScene 的 PRESENTATION 在 docs/08 §3 的"按章自动演示"之外没有别的演示模式。

### 键盘（`core/keys.ts`，宿主统一处理）

| 键 | 作用 |
|---|---|
| ← → | 上一章 / 下一章（跳过折叠章节） |
| 1–9 | 镜头预设 |
| 注册的字母 | 模式开关（L = 标注；`h`、空格、数字保留给宿主） |
| SPACE | 暂停 / 运行（没注册 `pause` 时不拦截） |
| H | 隐藏 / 显示 HUD（只进 HUD store，不进 URL；0.35 s 淡出，左下留「H 显示界面」可点） |
| ESC | HUD 隐藏时恢复；否则交给引擎 `escape` |

带 Ctrl / Cmd / Alt 的不处理；已被处理（`defaultPrevented`）的不处理；焦点在 `input / textarea / select / contenteditable / [data-keys="own"]` 里不处理；方向键还让给 `[role=slider|radiogroup|tablist]`；空格让给获得焦点的按钮类元素（鼠标点完 HUD 按钮会自动失焦）。Shift+← → 留给 TimeScene 微调时间。

### `window.__atlas`（`core/test-api.ts`，docs/08 §7）

```ts
await __atlas.ready                 // 视图已挂载且舞台 canvas 有尺寸 → true；20 s 超时 → false
__atlas.chapters(); __atlas.goToChapter(id, { instant })
__atlas.presets();  __atlas.setPreset(id, { instant })           // instant 默认 false
__atlas.modes();    __atlas.setMode(id, on, { instant })          // instant 默认 true（会 snap）
__atlas.keymap()    // [{ key, type: 'preset'|'mode'|'pause'|'hud'|'escape'|'chapter', name }]
__atlas.setPaused(on); __atlas.setHud(on); __atlas.setTheme('paper' | 'cinema')   // setTheme 写用户覆盖
__atlas.state()     // 场景快照 + { hud, paused, labels, preset, modes: {id: on}, appliedTheme }
__atlas.stats()     // { buffer, pixelRatio } 取自舞台 canvas，再合并引擎 stats()
```

按钮带 `data-preset` / `data-mode`、`aria-pressed`；HUD 块带 `data-hud-panel`。

### QA：`pnpm shoot`（`scripts/shoot.ts`）

skill 里 `shoot.py` 的 Playwright / TypeScript 版，驱动 `window.__atlas`。**先 `pnpm build`**（脚本自己在随机端口上起一个只读静态服务器服务 `dist/`，不起 dev server；`dist/` 不存在会直接报错退出）。

```bash
pnpm shoot sample-space                      # 每章 + 每个模式 + 额外预设 + hero-clean -> shots/sample-space/en-paper/*.png
pnpm shoot sample-time --locale zh --theme cinema --size 3840x2160 --suffix _4k
pnpm shoot sample-time --keys --layout       # 键位同步 + 六尺寸 HUD 布局（有这两个开关且没给截图名时不截默认图）
pnpm shoot sample-space --perf --json out.json   # 每张图后多等 2 s，打印 calls / triangles / fps / gpu；--json 写全部结果
pnpm shoot sample-time --shots mine.json hero    # 自定义截图表（{name: {chapter?, preset?, modes?, hud?, wait?, js?}}）
```

- `--locale en|zh|all`、`--theme paper|cinema|all`（也接受逗号列表），默认 `en` + `paper`；`shots/` 已 gitignore。主题用 `__atlas.setTheme()` 切换。`--gpu` 改用真 GPU（macOS 走 Metal），默认软件 GL（SwiftShader，与 e2e 相同），fps 数字只在 `--gpu` 下有意义。
- 默认截图：每章一张（镜头 = 本章预设）；首章上每个注册模式各一张（`presentation` 除外；默认开着的模式截"关"，文件名 `mode-<id>-off`）；非章节预设（`orbit` / `reference` / `world` / `theatre`）各一张；`hero-clean`（HUD 关）。每次截图前把模式、HUD、暂停恢复到加载时的状态。
- `--keys`：对 `keymap()` 逐项按键：预设（`state().preset` + `[data-preset]` 的 `aria-pressed`）、模式（状态翻转 + `[data-mode]` 的 `aria-pressed`，再按一次恢复；按钮被禁用则跳过）、SPACE、H（HUD 隐藏且"H 显示界面"可见）、ESC（HUD 隐藏后恢复）、← →；最后拖动舞台应变 FREE CAMERA（没有预设亮着），再按预设应收回。
- `--layout`：3840×2160 / 2560×1440 / 1920×1080 / 1280×720 / 900×1200 / 390×844 × 每章 × 额外预设，用 `tests-e2e/hud-layout.ts` 的 `hudLayoutIssues()`（与 `pnpm e2e` 共用同一份逻辑）查 `[data-hud-panel]` 出屏 / 重叠（1 px 容差）/ 横向溢出，并存 `layout-WxH.png`。
- 一直收集 console error / warning、pageerror、同源 4xx/5xx 和任何指向外部主机的请求（违反"无运行时外部请求"）；GPU / SwiftShader 噪音与 smoke.spec.ts 同一过滤。退出码 1 = 有 error / pageerror / 外部请求 / 键位失败 / 布局问题（warning 只打印）。
- 轨道阻尼按帧数衰减，软件 GL 下拖动后要几秒才回写相机，`--keys` 的 FREE CAMERA 检查已按此放宽。

### HUD 缩放与响应式

- `--k = clamp(min(W/1920, H/1080), .6, 1.6)`（手机 = 1），SceneHost 在 resize 时写到 `.atlas-scene`。
- 实际排版用 `--u = --kt px`，`--kt = max(--k, .8)`：HUD 文字不小于 1080p 尺寸的 80%（720p、平板的可读性下限）。
- **HUD 字号刻度**（设计像素，k = 1；`tokens.css` 的 `--hud-font-*`，面向小学生的笔记本屏）：最小 10 px（`label` 10.4 / SVG 里的 mono 刻度 10）、状态行与键位提示 ≥ 10.5（`status` 10.8）、按钮 11.1、面板标题与正文 11.3、标题块 30。写新 HUD 文字用这些 token，不要再写 < 10 的 `calc(N * var(--u))`；viewBox 里的 SVG 文字（部件链路卡）按渲染比例折算，保证渲染后 ≥ 10 px。`--kb = max(1, --k)`：触控控件和阅读正文只放大不缩小（4K 时 `bottomBar` / `stageOverlay` 用 `zoom: var(--kb)` 放大）。
- ≥1440 完整；1080 完整略小；高度 ≤ 820（720p）底部三面板折成一行标签页（点开一块）；< 1024 InfoPanel 变底部抽屉；< 760（手机）隐藏示意卡、三面板、perf、引线、规格表、键位提示和 VIEW 组，章节轨折成编号芯片条，全局开关收进齿轮菜单；标了 `phone: false` 的模式（TimeScene G / P、SpaceScene R）不画按钮，手机顶栏的 MODE 组因此留在两行以内。
- 任何尺寸不得重叠、不得横向溢出：`tests-e2e/hud-layout.ts` 的 `hudLayoutIssues()` 在 3840×2160 / 2560×1440 / 1920×1080 / 1280×720 / 900×1200 / 390×844 × 每章 × 中英检查所有可见 `[data-hud-panel]`（`tests-e2e/hud.spec.ts`，`pnpm e2e` 的一部分）。

### 主题

- token 在 `src/theme/tokens.css`（`paper` = 技术图版标准实现 / `cinema` = dark plate）。功能色每个只表达一个含义：`--cold` `--hot` `--loop` `--neutral` `--signal` `--xray` `--cut`；墨与线：`--ink` `--ink-2` `--ink-3` `--hair` `--line`；旧名（`--accent-*`、`--bg`、`--surface`、`--border`…）映射到它们上。HUD 元素圆角 `--radius-hud`（1px），阅读面板 6px。
- 字体：`IBM Plex Sans Condensed`（`--font-hud`，400/500/600，latin + latin-ext）与 `IBM Plex Mono`（`--font-mono`，400/500，latin）由 `src/styles/fonts.css` 自托管（只引 woff2，构建进 `/_astro/`）；中文回退系统字体；孩子读的正文保留 `--font-serif`。组件里只用 `var(--x)` 或 Tailwind 映射类（`bg-surface text-ink-muted border-border`），不写死颜色。
- 优先级：用户全局覆盖（localStorage `atlas:theme`）> 场景主题（URL `theme=` 或章节累积的 `state.theme`）> `topic.yaml theme` > `paper`。首帧前由 BaseLayout 内联脚本按同一规则设置 `data-theme`，无闪烁。
- 数据里的颜色写 `token:accent-1` / `#hex`；DOM/SVG 用 `resolveColorRef(ref)`（得到 `var(--accent-1)`，随主题自动变），canvas/WebGL 用 `resolveColorRef(ref, readThemeTokens())` 取实值，并在主题切换后重读。
- MapLibre：`buildMapStyle({ sources: { land, water?, rivers? } })` 从当前 token 生成底图 style（只有 GeoJSON source，无 glyphs/sprite/瓦片）。二期加 symbol 标签需要本地 glyphs，放 `public/fonts/`。主题切换时重建 style（监听 `<html data-theme>` 变化即可）。

### 家长模式

- 站点不展示年级：没有年级选择器、章节轨没有年级芯片、规格表没有年级行、索引页以固定六类（science / math / history / geography / biology / computer）为主入口并按类筛选，无主题的类别置灰标“即将推出”；所有章节始终可进入，←→ 和上下章按钮逐章走。`level` / `levels` 只是 `topic.yaml` / 章节 / 零件上可选的规划元数据（schema 接受缺省，不渲染）。
- `ParentModeToggle`（localStorage `atlas:parent`，开启需 3 秒内连点两次）：显示敏感段落的 `<Full>` 版本；`sensitive` 章节在章节轨和信息面板上仍带"需要大人陪着看"标记。
- 读写偏好走 `src/lib/prefs.ts` 的 hook（`useParentMode / useThemeOverride`），不要直接碰 localStorage；场景状态不进 localStorage，只进 URL。

## 约束清单（每次改动自查）

- 纯静态：无 SSR、无 API 路由、客户端无 Node API
- 无运行时外部请求：无 CDN、无外部 webfont（字体自托管）、无瓦片
- 客户端不引 zod（构建期解析）；JS 预算 300 KB gz（docs/02）。实测（`pnpm shoot` 打印的 page JS，gzip -9）：宿主 + HUD + 引擎 View 首屏约 105 KB；SpaceScene 页整页约 310 KB（three + R3F 舞台 chunk 207 KB 懒加载）；TimeScene 页整页约 391 KB（MapLibre 在 controller chunk 285 KB 懒加载）。**地图主题超预算，是已知遗留，待产品层决定**
- 所有文案双语；界面文案进 `ui.*.json`，内容文案用 `{ en, zh }`
- `pnpm check && pnpm validate && pnpm test && pnpm build && pnpm e2e` 全绿

## TimeScene（二期 A：GeoStage + Timeline；P3 技术图版）

代码在 `src/engines/time-scene/`：

```
index.ts              descriptor（扩展字段 t / highlight，未变）
schema.ts             zod（构建期），客户端只 import type
View.tsx              组装：GeoStage + 时间轴标尺 + HUD 内容 + 图层/图例 + 事件详情；store ↔ 播放头同步；控件注册（预设、模式、PRESENTATION）
stages/geo/GeoStage.tsx    React 壳，懒加载 controller（MapLibre 在这个 chunk 里），提供引线标签层、比例尺和宿主 leaders svg
stages/geo/controller.ts   命令式驱动 MapLibre：图层、斜线填充、流线、事件环、地名、比例尺、REFERENCE、镜头、主题
stages/geo/leaders.ts      引线标注（两列、避让、逐帧投影）
timeline/Timeline.tsx      工程标尺时间轴（渲染进 bottomBar 插槽）
timeline/usePlayback.ts    播放循环（全程约 60 s @×1，遇章节节点停 1.5 s）
hud/HudPanels.tsx          card 条带图、panel01 时间标尺、panel02 问题/概述、panel03 状态、perf 读数
EventInspector.tsx         点事件 → inspector 插槽（Counter / 双方 CounterVersus；细看折叠块；来源上标；sensitive 事件的伤亡仅家长模式）
lib/time.ts lib/format.ts lib/geo.ts lib/model.ts lib/frame.ts lib/playhead.ts lib/ticks.ts lib/stats.ts lib/bloc.ts lib/control.ts lib/bandRows.ts   纯函数，单测在 tests/time-scene/
colors.ts  time-scene.css
```

### 作者怎么写数据

四个文件放 `data/`（schema 见 docs/03 §A 与 `schema.ts`）：

| 文件 | 要点 |
|---|---|
| `entities.json` | `id, name, bloc, joined, left?, color?`。`bloc` 是 `axis/allied/neutral` 之一，或**换阵营**时按时间排的数组 `[{ "bloc": "axis", "from": "1940-06-10", "to": "1943-10-13" }, { "bloc": "allied", "from": "1943-10-13" }]`（`[from, to)`，只有最后一段可省 `to`，段不能重叠；第一段之前按第一段算，空档里按刚结束的那段算，`blocAt(entity, t)` 在 `lib/bloc.ts`）。颜色默认取 `t` 时所在阵营的 token：地图控制区、participation、地名、实体引线说明、右上卡的面积带都跟 `t` 走，卡上的参与线按段分色；行动和事件用它们开始时的阵营色；图例对换阵营的实体每个阵营列一行。`color: "token:accent-3"` 或 `#hex` 覆盖（不随阵营变）。`joined` 驱动 participation 图层"点亮"和右上卡的参与线。 |
| `control.json` | `keyframes[]`，按时间严格升序，`properties.holder` = 实体 id，同一实体可有多个面（或 MultiPolygon）。**两种写法任选**：① GeoJSON：`{ "keyframes": [{ "t", "features": FeatureCollection }] }`（小主题、手写，如 sample-time）；② TopoJSON：`{ "topology": Topology, "keyframes": [{ "t", "object": "<topology.objects 里的名字>" }] }`——所有关键帧共用一份拓扑（不变的海岸、边界只存一次，量化 + 差分编码），大主题（ww2 的 12 帧）用它。拓扑只做宽松校验（`type: "Topology"`、`arcs` 数组、`objects` 记录、`transform` 可选），解码后每个要素按普通控制区要素再校验（`holder` 存在于 entities、环闭合、经纬度范围）。引擎在建 `TimeModel` 时用 `topojson-client` 的 `feature()` 把每帧解成 FeatureCollection（`lib/control.ts` 的 `decodeControl`，顺手把环改回 RFC 7946 绕向，MapLibre 靠绕向分外环和洞），之后的帧、面积、渲染全都不知道有两种写法。ww2 的 `control.json` 由管线生成（见「WW2 geo pipeline」），不手写。面积（右上卡）在客户端按球面公式算，不用写。 |
| `movements.json` | `from/to` 时间区间 + LineString `path`（从起点画到终点）。`strength` 决定线宽（1–3 px，相对全主题最大值）。**过日界线**：schema 把经度限在 -180..180，作者照实写跳变即可（`… [179.5, 38], [-175, 33] …`）；建 `TimeModel` 时 `unwrapPathCentred`（`lib/geo.ts`，思路同 `unwrapRing`）把相邻点经度差超过 180° 的后续点整体 ±360°，让线走近路（MapLibre 会把 >180 的经度画进邻近世界副本），再把整条路径平移 ∓360° 使其中心落在 -180..180。之后切线（`sliceLine`）、箭头头部、引线锚点、剧场镜头的包围盒（`model.bounds`）全部用 `MovementN.path`（展开后的坐标），不要再读 `movement.path.coordinates`。珍珠港航线（147.7°E 44.9°N → 158°W 23°N）展开后经度 147.7 → 202，长约 5,800 km，不是绕地球一圈的 30,000 km。可选 `linger`（`timePoint`，须晚于 `to`、同一时间标尺）：默认 `to` 之后整条线立刻消失；写了 `linger`，`to` 到 `linger` 之间画完成的整条线（40% 不透明，箭头停在终点），过了 `linger` 在约 2% 时间跨度内淡出。lingering 的线不计入 panel03 的 ACTIVE MOVEMENTS。 |
| `events.json` | `t`、可选 `until`、`at`、`kind`、`importance`（**3 最重要 = 点最大**，1 最小）、`sides/forces/casualties/result`。`kind`：`battle`、`landing`（这两种必须有 `sides` + `result`）、`bombing`（必须有 `sides`）、`surrender`、`political`、`massacre`、`siege`、`evacuation`、`liberation`、`atrocity`、`site`（新增六种的 `sides`/`result` 都可选）。可选 `detail: { en, zh }`（inspector 里默认收起的"细看 / More"）与 `sources: ["S1", "S7"]`（`sources.json` 的编号，inspector 摘要后显示 mono 上标，点开来源弹层）。`sensitive: true` 的事件伤亡数字只在家长模式显示。 |
| `presets.json`（可选） | `{ "presets": [{ "id": "singapore-island", "label": { "en": "Singapore", "zh": "新加坡" }, "camera": { "center": [103.82, 1.35], "zoom": 9.2 } }] }`。注册成镜头预设，排在 `world` / `theatre` 之后（数字键接着编号，1–9 之外只有按钮）；`label` 是按钮文字（一两个词）；正文 `<FlyTo preset>` 用这些 id。 |
| `sources.json`（可选） | 见上文"加一个主题"第 4 步。 |

**`site` 事件**是静态点位（监狱、纪念碑、建筑）：`t` 照写但不参与时间——不进时间轴范围、不进 panel01 泳道和统计、不脉冲；只在 `sites` 图层打开时显示（小空心菱形 + 中心点），点击同样打开 inspector（眉题 `P-01`），高亮时出引线标注。

章节 `state`：`time`（ISO 三种精度或 `{ ma }`）、`camera`、`layers`、`highlight`（实体/行动/事件 id）、`theme`，以及 P3 新增的 `question` / `answer`（`{ en, zh }`，panel02 显示；`answer` 必须配 `question`），和可选的 `summary`（`{ en, zh }`，没有问题时 panel02 的一句话概述）。章节节点在时间轴上的位置 = 该章累积目标的 `t`。

### 图层（`layers` 里的 id）与地图语法（docs/08 §5）

| id | 渲染 | 开关 |
|---|---|---|
| `base` | 陆地纸色 `--land`、海洋 `--water`（背景）、海岸 hairline（`buildMapStyle`，`public/geo/land-50m.json`；东南亚 zoom ≥ 7 叠 `land-10m-sea.json`，见「WW2 geo pipeline」） | 永远开 |
| 经纬网 | 10° 经纬线，代码生成（不是文件），hairline，普通 .22 / 赤道与本初子午线 .4 | `graticule` 模式（G），默认开，不进 URL |
| `control` | 每个关键帧三层：阵营色淡底（.28）+ 45° 斜线 `fill-pattern`（每个实体一张 canvas 图，按 pixelRatio `addImage`，换主题 `updateImage`）+ 阵营色描边。前帧/后帧两个 source 交叉淡化：区间最后 30% 内前帧 1→0.4、后帧 0→1，三层同一个系数 | 可关 |
| `borders` | 今天的国界 hairline（ink .4，0.4–0.9 px 随缩放）+ 国名（`countries-50m.json`，第一次打开时才下载） | B 模式 / 图层开关 |
| `movements` | 工程流线：已走过的路径一条实线（.3）+ 一条步进虚线（约 12 fps 流动），宽 1–3 px；头部 12 px 小箭头（HTML marker）。有 `linger` 的行动结束后整条线连同箭头以 40% 不透明度保留到 `linger`，再淡出（帧里的 `MovementFrame.opacity` / `lingering`，数据驱动的 `line-opacity`）。paper 无发光；dark plate 只在箭头头部有 ≤ .35 的微光（`--glow`） | F 模式（`flow`）/ 图层开关 |
| `battles` | 已发生的事件：空心 hairline 圆环 + 实心点（按 importance 定大小），进入 `[t, until]` 时圆环用进攻方颜色、实线；高亮用 signal 色；进入时放一个扩散 hairline 环（~900 ms）。点击（44 px 命中框）→ 详情 + `highlight`。按 `kind`：`massacre` / `atrocity` 画空心方块（墨色 hairline，HTML marker；圆仍在 GL 层里透明地当点击目标），脉冲也是方的；`siege` 圆外加一圈虚线环；`evacuation` / `liberation` 圆用冷色 `--cold`。图例相应出"Massacre / atrocity · 屠杀 / 暴行"（方块）、"Siege · 围城"（虚线环） | 可关 |
| `participation` | 实体在当前关键帧的面：加入后描边，加入那一刻闪亮（时长 = 全程 4%） | 默认关 |
| `sites` | `site` 事件：小空心菱形 + 中心点（HTML marker），不随时间变化、不脉冲；高亮 signal 色。章节 `layers` 可含 `sites`；只有主题里有 `site` 事件时图层面板才出这个开关 | 默认关 |

- 地名（HTML marker，无 glyphs，最多 12 个）：区域名（实体，大写宽字距）和国名（borders 开时）。贪心避让：按优先级用真实屏幕矩形（4 px 间隙）检测，**先给引线标注让位**，再互相避让（`data-collided`）。
- 比例尺：舞台左下、底部面板之上（被左列挡住就挪到左列右侧），按当前缩放和中心纬度取 1/2/5×10ⁿ km 的整数长度，半实半空 hairline 条。HUD 隐藏时跟着隐藏；手机不显示。
- 底图数据跨 180° 经线的环已在构建时展开（见"底图数据"），不会再出现横贯全图的直线。

### 引线标注（`leaders.ts`，docs/08 §5 + skill master-spec J）

- 谁有标注：`highlight` 里的 id（事件 / 行动 / 实体）+ 处在 `[t, until]` 窗口里的事件，最多 8 条，高亮优先。高亮的实体不再出区域名，改出引线标注。
- 内容：EN 粗体大写 + 中文 + 一行说明（mono 日期 + 摘要，单行省略）。行动的说明是"陆路 · 12,000 人"，实体是"阵营 · 某日加入"。
- 锚点：事件 = `at`；行动 = 已画部分的中点（不压箭头）；实体 = 当前关键帧最大面的形心。`map.project` 投影。
- 布局：量出没被 `[data-hud-panel]` 占住的舞台带（左列右缘、右列左缘、底部 dock 上缘），两列分别贴在带的左右边缘（左列右对齐、右列左对齐），按锚点在带中线哪一侧分列（带 40 px 滞回，播放时不来回跳）；列内按投影 y 排序 + 最小间距避让，夹在带内；仍与任何面板相交的标签隐藏。带太窄时退成一列，再窄全隐藏。标签最大宽度 = 列宽（210 设计 px 封顶）。
- 引线：标签边 → 14 px 水平短线 → 直线到锚点，锚点是空心小圆；高亮的引线用 signal 色。线画进宿主 `leaders` svg（随 HUD 淡出）。
- 性能：只在地图 `render` 事件里重投影，只写 `transform` / `opacity` / SVG 属性；尺寸和面板矩形在 resize（ResizeObserver 盯面板）、换内容时和每秒一次量。
- 开关：宿主 LABELS（L）→ `data-labels="off"` 隐藏标注和地名；HUD 隐藏时隐藏；手机不显示。锚点出屏时标签和线淡出。
- 事件标签是按钮：点它 = 打开 inspector + `highlight`（点完自动失焦，键盘照常）。

### 时间

- `toNumber(t)`：ISO → 十进制年（取时段起点：`1942-02` = 1942 年 2 月 1 日）；`{ ma }` → 负的年数（`{ ma: 200 }` = -2e8）。`fromNumber(n, scale)` 反向，日期按日向下取整，地质时间保留 2 位小数 Ma。
- 时间轴范围 = 关键帧、事件（含 `until`）、行动起止、章节时间的最小/最大值。
- store 里的 `t` 是日精度 TimePoint（进 URL）；地图按连续的"播放头"渲染。跳章时播放头 1.6 s 缓动到新时间；拖动/播放/Shift+←→ 直接移动播放头并 `patch({ t })`。
- 读数格式 `formatTime(t, locale)`：`15 Feb 1942` / `1942年2月15日`；`200 Ma` / `2亿年前`、`6600万年前`。跨度 >12 年时读数降到月，>100 年降到年。HUD 里的 mono 读数用 `formatReadout`（英文大写：`15 FEB 1942`）。
- 刻度 `ruleTicks(min, max, scale, maxMajors, locale)`（`lib/ticks.ts`）：按跨度和宽度自适应，取主刻度数 ≤ `maxMajors` 的最细一档——几个月：主 = 月（1 月写年份）、次 = 每月 8/15/22 日；几年：主 = 年、次 = 月；更长：5/10/25/50/100… 年；地质：0.1–1000 Ma 档（如 10 Ma / 1 Ma），标尺右端写单位 `MA` / `百万年前`。

### 时间轴标尺（`bottomBar`）

- 一条工程标尺：主刻度（墨色、带 mono 标签）、次刻度（弱墨）、关键帧小空心菱形、已走过的部分加粗；章节节点是坐在标尺上的编号 hairline 圆（当前章 signal 实心，锁定章虚线圈 + 锁）；播放头是一条 signal 细线，日期写在线上方（贴边时夹在标尺内）。
- 播放 / 倍速是 18 px hairline HUD 按钮（`hud-btn`，触屏 44 px 命中）。行为不变：拖动 = 连续时间不换章；点节点 = 换章；播放全程约 60 s @×1，遇章节节点停 1.5 s 并在舞台顶部显示章节卡；Shift+← → 微调；焦点在标尺上时 ← → 换章、↑ ↓ 微调、PageUp/PageDown 大步、Home/End 到头尾；时间轴里空格 = 播放/暂停。

### HUD 控件与内容（docs/08 §2、§3）

注册（`View.tsx` 的 `useSceneControls`）：

| 项 | 内容 |
|---|---|
| 预设 | 各章镜头（`01`…）+ `world`（center [20, 10]，zoom 1.4）+ `theatre`（地图 `cameraForBounds` 套住全部数据；地图未就绪时按包围盒估算）+ `presets.json` 里的预设（按钮文字 = `label`）。数字键 1–9 |
| 模式 | `flow`（F，= movements 图层，状态 `FLOW`）· `borders`（B，= borders 图层）· `graticule`（G，引擎本地状态）· `reference`（R）· `presentation`（P）· 宿主 `labels`（L） |
| `pause` | 播放 / 暂停（SPACE） |
| `status` | `2000-03-11 · ×1`（与 `FLOW`、`REFERENCE` 等模式段一起出现在状态行） |
| `specRows` | ENTITIES / KEYFRAMES / EVENTS / MOVEMENTS 计数（mono） |
| `stats()` | `{ features, zoom, fps }`：features = 当前可见数据要素 + 经纬线 + 国界（开时）；fps = 页面 rAF 帧率 |
| `escape` | 依次：退出 PRESENTATION → 退出 REFERENCE → 关闭事件详情 → 清空 highlight（来源弹层开着时 ESC 先关弹层，由弹层自己处理） |

- **REFERENCE（R）**：版图对照用"叠加"实现（不分屏）：当前主导关键帧照常，相邻关键帧（前一帧；当前是第一帧时取后一帧）的边界以墨色虚线叠上，2 s 淡入（`instant` 时直接到位）；暂停播放，舞台顶部横幅写"实线 K2 … · 虚线 K1 …"。再按恢复，之前在播放就继续播放。少于两个关键帧时禁用；演示中禁用。
- **PRESENTATION（P）**：隐藏 HUD（宿主 `hud = false`），只在舞台上留主题标题和底部章节字幕（编号 · 章名 · 日期）；按顺序走所有未锁定章节，每章 = 镜头飞行 2.2 s + 停 1.5 s，走完自动退出并恢复 HUD。P / ESC / H / "显示界面"都会结束演示（HUD 一恢复就结束）。
- 插槽内容（`hud/HudPanels.tsx`，SVG 按面板实际像素画，字号走 `--u`）：
  - `card` PARTICIPATION AND AREA：每个实体一条带——参与线（joined → left，起点小空心圆），关键帧间线性插值的近似控制面积（球面面积，斜线 + 淡底），行首写 EN 名 / 中文 / 当前 `≈面积 KM²`；当前章节窗口淡 signal 底，`t` 一条 signal 竖线，底部自适应刻度。**行数规则**（`lib/bandRows.ts` 的 `planBandRows`，有单测）：每行至少 25 设计 px（EN 名 + 中文两行不互相压）；全部放得下就按数据顺序全画（实体再多也画）；放不下就最多画 12 行（还要给"其余"那一行留 15 px，所以小卡片只有 4–6 行），挑法是 ①有控制区面积的实体在前，按各关键帧的最大面积从大到小，②其余按 `joined` 从早到晚，同值按数据顺序；剩下的合并成一行弱色小字 `+N OTHERS / 另 N 方`（贴在时间轴上方）。画出的行保持阵营分色（参与线按段分色，面积带按 `t` 时阵营）。已验证：ww2（34 个实体）在 1920×1080 / 1280×720 / 2560×1440 下 EN 与中文标签、行与行之间没有重叠；`pnpm shoot <topic> --layout` 只查面板之间的重叠，卡片内部标签要另量（量 `.ts-card text` 的包围盒）。
  - `panel01` TIMELINE：整段时间的小标尺 + 章节编号圆 + 三条泳道：KEYFRAMES（菱形 K1…）、MOVEMENTS（起止条，重叠自动分行）、EVENTS（点 + 进行窗口），当前章节窗口与 `t` 竖线同上。
  - `panel02` QUESTION：章节编号 + 章名，`state.question`（衬线），`state.answer` 在下方。没有问题时面板标题换成 SUMMARY / 概述，显示 `state.summary`；没有 summary 就取本章正文（当前语言）第一段（跳过 `<More>` 折叠块、家长模式版 `<Full>` 和来源上标，最多三行）；正文为空时退回本章高亮事件的摘要，再没有就是主题副标题。
  - `panel03` STATE：TIME、PARTICIPANTS（已加入 / 总数）、ACTIVE BATTLES（battle/landing/bombing/siege 且在窗口内）、ACTIVE MOVEMENTS、CONTROL KEYFRAME（K1 → K2 · 37% + 小进度条）。都是数据统计，不标 SIM。
  - `perf`：`FEATURES 63 · ZOOM 5.5 · 60 FPS`（500 ms 更新）。
  - `inspector`：hairline 框，`E-01 · BATTLE · 日期` mono 眉题（`site` 为 `P-01 · SITE`，无日期），标题大写 + 另一语言小字，摘要 + 来源上标（`sources`），进攻/防守/结果的 dl（斜线色块，颜色取事件开始时的阵营），Counter 兵力；伤亡仍只在家长模式；最后是 `detail` 的"细看 / More"折叠块（默认收起）。
  - Counter：`forces` / `casualties` 恰好两方时画成一个双方并排的 `CounterVersus`（进攻方在左、图标从中线向外长，防守方在右，同一刻度，底部一行刻度说明）；其他情况每方一行。刻度 `counterPer(max)`：最大值在 100 万–500 万之间固定"1 icon = 100,000 people / 一个图标 = 10 万人"（最多 50 个图标），否则取 1/2/5×10ⁿ（`nicePer`）。
  - 来源弹层（`widgets/SourcePopover.tsx`，宿主挂一个）：场景内任何 `[data-source="S3"]`（正文 `<Num>` 的上标、inspector 的上标）点开都走它——委托监听，静态正文无需 hydration；弹层贴在上标下方（放不下就在上方），写来源号、文本、说明、链接；ESC / 点外面 / 关闭按钮关闭，焦点回到上标。数据来自主题的 `sources.json`，不联网。

### 交互约定

- ← → 换章（核心处理；焦点在标尺上时由 Timeline 自己转发）；Shift+← → 按一步微调时间。
- 地图容器 `data-keys="own"`；点地图不会抢键盘焦点（canvas 被点击聚焦后立即 blur），Tab 进入地图仍可用方向键平移。
- 用户平移/缩放 `moveend` 后 250 ms 防抖 `setCamera()`；章节切换 `flyTo`（2.2 s），首次加载/深链接 `jumpTo`；`prefers-reduced-motion` 时不飞、不脉冲、虚线不流动、REFERENCE 不渐变。
- 主题切换：观察 `<html data-theme>`，重读 token、`setPaintProperty`、重画斜线图，不重建地图。

### 底图数据

```bash
pnpm tsx scripts/build-geo.ts   # world-atlas(Natural Earth 1:50m) → public/geo/*.json，产物入库
```

陆地 3 位小数（~110 m），国界简化到 ~2 km，合计约 1.75 MB（预算 2 MB）。world-atlas 里跨 ±180° 的环（斐济、楚科奇、弗兰格尔岛、南极洲）原本在一条线段里从 180 跳到 -180，平面渲染会画出横贯全图的直线（P1 截图里的那条横线就是斐济的一个碎片）；构建时用 `unwrapRing`（`lib/geo.ts`，有单测）把环展开成经度连续（允许超出 ±180，MapLibre 自动画进相邻世界副本），绕极点的环（南极洲）沿极点闭合。来源与许可见 `public/geo/README.md`（Natural Earth，公有领域）。

### 包体

MapLibre 只在 `controller` chunk 里，View 挂载后才加载（时间轴先出来）。P4 实测（gzip -9）：TimeScene View chunk 约 15 KB gz（含 HUD 面板、标尺），controller chunk 约 286 KB gz（MapLibre 5.24 约 270 KB + 引擎地图代码约 16 KB）；加上宿主 client / SceneHost / GlobalToggles 约 84 KB，整页 JS 约 391 KB gz。**超出 docs/02 的 300 KB gz 预算**，需要产品层决定：按 brotli 计、对 geo 主题放宽到 ~400 KB gz，或换更小的地图库版本。

## SpaceScene（空间拆解引擎，Phase 2B；P2 技术图版）

`engine: space-scene`、`stage: model3d`。代码在 `src/engines/space-scene/`：

```
index.ts                 descriptor（part/view/explode/run/cutaway）
schema.ts                parts.json 的 zod（构建期）
View.tsx                 HUD 控件注册（预设 / 模式 / 规格行 / 卡片与面板标题）+ 各插槽内容 + 懒加载 Model3DStage
ui.ts                    引擎内 UI store（ORBIT、REFERENCE；不进 URL，View 与舞台共用）
bridge.ts                舞台 → HUD 的桥：每帧投影好的标注锚点、渲染计数、帧回调（View 侧不 import three）
lib/                     纯函数，有单测：explode / visibility / flow-curve / color（材质族）/ presets（材质名，无 zod）/ animation /
                         camera（球坐标插值、REFERENCE 镜头、过渡目标）/ parts（零件包围盒、repeat 变换）/
                         schematic（零件链路、立面、标注预算与列避让）/ xform / math
stages/model3d/          R3F 舞台：Model3DStage（createRoot 宿主）、SceneRoot、PartNode、geometry（程序化零件）、
                         materials（材质 + 选中边缘 / 剖面 shader 补丁）、textures（程序化贴图）、Lighting、
                         GroundShadow、CameraRig、Flows + flowMaterial、probes（标注投影 / 计数 / 阴影更新）、GltfSource
hud/                     LeaderLabels（leaders）、PartChainCard（card）、ArchitecturePanel / DetailPanel / StatePanel
                         （panel01–03）、PerfReadout（perf）
explorer/                ExplorerBar（bottomBar：只剩拆开滑块）、ExplorerOverlay（stageOverlay）、Inspector（inspector）
space-scene.css          舞台、标注、卡片与面板绘图、滑块、详情样式（只用 token，尺寸 × --u）
```

### 作者怎么写数据（`data/parts.json`）

```jsonc
{
  "model": "/models/aircon.glb",          // 可选；有 mesh 零件时必填，放 public/models/，引擎自动加 base
  "parts": [{
    "id": "compressor", "name": {en, zh}, "group": "refrigerant",
    "summary": {en, zh}, "detail": {en, zh},   // summary 也是引线标注的一行说明；detail 在详情卡「了解更多」后
    "primitive": { "kind": "cylinder", "size": [0.3, 0.3, 0.5], "at": [1, 0, 0], "rotation": [0, 0, 90], "color": "steel" },
    "repeat": { "count": 4, "axis": [1, 0, 0], "spacing": 0.76 },   // 可选：实例化重复（一次绘制）
    "mesh": "Compressor",                  // 或者：glb 里的节点名；两者都写时 glb 加载后替换积木
    "explode": { "dir": [1, 0, 0.3], "dist": 1.2 },   // dir 会归一化；位移 = dir × dist × explode
    "connects": ["condenser"],             // 详情卡芯片 + 右上零件链路的连线
    "level": "P5"                          // 可选，规划用，不渲染
  }],
  "groups": [{ "id": "refrigerant", "name": {en, zh}, "color": "token:accent-1" }],
  "flows": [{ "id": "loop", "group": "refrigerant", "path": [[x,y,z], ...], "speed": 1, "color": "token:accent-1", "whenRun": true }],
  "animations": [
    { "id": "fan-spin", "target": "fan", "kind": "rotate", "axis": [0,0,1], "rpm": 120 },
    { "id": "flap", "target": "louver", "kind": "oscillate", "axis": [1,0,0], "amplitude": 20, "hz": 0.5 },   // amplitude 单位：度
    { "id": "beat", "target": "pump", "kind": "pulse", "scale": 1.15, "hz": 1 }                                // scale 是峰值缩放
  ],
  "views": {
    "assembled": { "camera": { "position": [3,2,4], "target": [0,0,0], "fov": 34 } },
    "exploded":  { "camera": { ... } },     // 每个视图可选一个预设镜头
    "cutaway":   { "normal": [-1,0,0], "offset": 0 },   // 可选剖切面；默认切掉 x>0 一半
    "section":   { "plane": "xy" },         // 可选：ARCHITECTURE 立面与 REFERENCE 正视方向（xy 正面 / zy 侧面 / xz 俯视）
    "reference": { "camera": { ... } }      // 可选：自定 REFERENCE 镜头（默认按包围盒自动取长焦正视）
  }
}
```

- **积木**（`size`）：box `[宽,高,深]`、cylinder `[上半径,下半径,高]`、cone `[半径,高]`、sphere `[半径]`、torus `[半径,管粗]`、capsule `[半径,长度]`、plane `[宽,高]`（双面）。`rotation` 是 XYZ 欧拉角（度）。
- **工程零件**（docs/08 §4，参数各自不同，zod 校验尺寸合理性）：
  - `bevelBox {size:[w,h,d], bevel}`：每条边都是真实圆角（bevel < 最短边一半）
  - `tube {path:[[x,y,z]...], radius, bendRadius?}`：path 相对 `at`；每个拐角用同一弯曲半径（默认 3×radius，不得小于 radius），管端开口
  - `flange {radius, thickness, boltCount, boltRadius}`：XZ 平面里的圆盘（轴 Y），螺栓圆上 `boltCount` 个六角螺栓头（实例化）；boltRadius < radius
  - `fins {size:[a,b,t], count, gap, axis}`：`count` 片 a×b、厚 t 的板沿 `axis`（x | y | z）等间距排列（实例化）
  - `vessel {radius, length, headRatio}`：沿 Y 的筒体 + 两端椭圆封头（封头深 = radius × headRatio，0.5 = 2:1 封头）
- **repeat**：`{count, axis, spacing}`（沿轴、以 `at` 为中心等距）或 `{count, axis, radius}`（绕过 `at` 的轴一圈，每个实例朝外转）。轴是场景坐标。整件变成一个 InstancedMesh。
- **材质族**（`color`）：`casing`（拉丝铝，各向异性）、`steel`（机加工钢）、`powder`（缎面黑粉末涂层，轻微橘皮）、`stainless`（轴向拉丝不锈钢）、`copper`、`rubber`（近黑，roughness .78）、`plastic`（哑光暖砂色，不是默认灰）、`glass`（半透明）；旧名 `metal` = steel、`matte` = plastic。或者 `token:<name>` / `#hex`：缎面漆。程序化 canvas 贴图给拉丝方向、粗糙度变化、橘皮法线（`stages/model3d/textures.ts`，种子固定，截图可复现）。
- **流场**：`path` 首尾点相同 = 闭环。centripetal Catmull-Rom，按弧长烘焙 64 个点进 shader，每条 360 个细粒子（贴着中心线，像 CFD 流线而不是魔法粒子），`speed` 是场景单位/秒。`whenRun: false` 的流/动画一直播放（只受图层开关）。
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
  labels: [compressor, fan]    # 可选：本章引线标注哪些零件（默认：所有可见零件，大件优先，按镜头距离限量）
  camera: { position: [4, 3, 5], target: [0, 0.3, 0], fov: 34 }
```

章节目标照常累积（`labels` 不累积，只看本章）。**镜头规则**（`lib/camera.ts transitionCamera`，有单测）：切章 / 首次加载 / URL：本章自己写了 `camera`（或 URL `cam=` 与本章基线不同）就用它；否则 `views[当前 view].camera`；都没有就沿用。**预设（VIEW 按钮 / 数字键）永远落在该预设的镜头上**（P1 遗留问题：本章没有自己镜头时，基线是继承来的，曾被误判成"非显式"而飞去视图预设；已修）。模式切换（X / E / C / F）不动镜头。较窄的舞台（宽高比 < 1.6：HUD 占去两侧的桌面、平板、竖屏手机）自动把镜头往后拉，回写 URL 时换算回来，链接与设备无关。

### HUD 控件与内容（docs/08 §2、§3）

| 控件 | 行为 |
|---|---|
| VIEW `01..NN` | 各章镜头（1.6 s easeInOut，target 直线 + 相机相对 target 的球坐标插值，绕着模型转，不穿模） |
| VIEW `ORBIT` | 慢速转台：绕 target 的竖轴 1 圈 / 40 s，1 s 渐入；一拖动即停（→ FREE CAMERA） |
| VIEW `REF.` = MODE `REFERENCE`（R） | 长焦（fov 16）正视（`views.section`，默认正面），2 s；暂停运转、收起爆炸、隐藏流场；EXPLODED 与 FLOW / SPACE 显式禁用，状态行写 `EXPLODE AND FLOW LOCKED`；再按 R（或 ESC）2 s 回到进入前的镜头与状态；选别的预设 = 退出但不回镜头 |
| MODE `X-RAY`（X） | 未选中零件 .15 透明（.3 s）；只有这时材质变透明（forceSinglePass） |
| MODE `EXPLODED`（E） | 2 s easeInOut 拆开到 0.7（或章节值）；拖滑块时快速跟随 |
| MODE `CUTAWAY`（C） | 单剖切面；封闭零件的背面画成 `--cut` 赭色 + 屏幕空间 45° 墨色剖面线（像博物馆剖面模型，不是删掉一半）；管、平面不填 |
| MODE `FLOW`（F）= SPACE | run：动画与流场 .6 s 渐入 |
| `L` | 标注开关（宿主） |
| ESC | 取消选中 → 退出 REFERENCE → 停 ORBIT |

- 状态行追加：选中零件 `#06 SAMPLE DRUM`、`EXPLODE 80`、`CUTAWAY 50`、REFERENCE 时的锁定说明。规格行追加 PARTS / GROUPS / FLOWS。
- `card`：零件链路示意（组 = 列、零件 = 带编号节点、`connects` = 细线）；选中零件填 signal 色；运转时有流的组内连线变成流色并步进。
- `panel01` ARCHITECTURE：由零件包围盒直接画的立面（`views.section`，默认 XY），按组编号的分区括号 + 图例、地面线、模型单位比例尺；选中零件描 signal 色。
- `panel02` DETAIL：选中零件（编号、EN + 中文、所属组、相连零件编号、一行说明、迷你爆炸图：静止虚线框 + 拆开实线框 + 位移线）；无选中时显示本章标题与模型概要。
- `panel03` STATE：RUN / FLOW / ANIMATIONS / VIEW / EXPLODE 实时值（mono），运行时数值带 `SIM` 芯片。
- `perf`：`60 FPS · 16 CALLS · 0.02M TRIS · 1520×1026`（滚动平均；按需渲染空闲时显示 `IDLE`）。
- `bottomBar`：只有 EXPLODED 时出现拆开滑块（44 px 拇指）；其余模式都在顶栏，不重复。
- `inspector`：选中零件详情（编号 + 名称 + 中文、级别、说明、了解更多、所属组、相连芯片），hairline 皮肤。
- `__atlas.stats()` 合并 `{calls, triangles, geometries, textures, fps, gpu}`（renderer.info + 滚动 FPS + WEBGL_debug_renderer_info）。

### 引线标注（`hud/LeaderLabels.tsx`，master-spec J）

- 每条：编号 + EN 名（粗、大写）/ 中文 / 一行说明（`summary` 截断）。左列右对齐、右列左对齐并带小三角；细引线 = 标签边 → 16 px 水平短线 → 直线到投影锚点（零件包围盒中心）上的空心圆。
- 舞台每帧（`probes.tsx LabelProbe`）把锚点投影到舞台像素写进 bridge，HUD 侧只写 `transform` / `opacity` / `d` / `cx` / `cy`；字号、文字宽度与 `[data-hud-panel]` 矩形只在 resize、字体加载、标签集合变化时测量。
- 先按投影 y 排序、最小间距堆叠（`stackColumn`），再把列放在锚点外侧（引线向内，不穿过文字），列宽避开本列高度范围内的 HUD 块；镜头动时列平滑滑动。
- 锚点在背后 / 出屏 / 被剖掉 / 被遮挡（节流 raycast，每帧最多 2 个、只在镜头或零件动过之后）/ 落在 HUD 块下 → 淡出；X-RAY 时不判遮挡；选中零件永远标注、signal 色高亮、不因遮挡隐藏。
- 数量：`labelBudget(镜头距离 / 模型半径)` 3–10 条（近景少），再受可用高度限制；放不下两列时退成一列，再放不下就不标。手机（< 760）宿主隐藏 `leaders`。
- 避让模型：每个锚点带投影半径 `r`（零件包围盒的约 3/8 对角线 × 焦距 / 深度，`bridge.anchors[id].r`）；列放在锚点 ∓ `r` 之外，放不下的标签（列在空带里到不了离自己零件 0.6 `r` 以外）不画，选中的零件例外。HUD 之间的空带 < 480 px（720p 笔记本）时只标选中的零件，其余靠右上零件链路卡和点选。
- 点标签（触屏点一下）= 选中零件；标签热区高 ≥ 44 px。

### 交互（舞台）

- 点零件选中（拖动结束在零件上不算点击）；点空白处取消；拖动（OrbitControls，带阻尼）旋转，停手 400 ms 后 `setCamera()` 回写 URL（→ FREE CAMERA）。
- 悬停零件：signal 色弱边缘；触摸长按 ≥ 400 ms 选中。选中：signal 色菲涅尔边缘 + 极淡染色（paper 边缘清晰；dark plate 边缘发光 ≤ .35，不脉动）。
- 视图：`xray` 未选中零件透明 .15；`isolate` 只显示选中零件和同组零件；图层开关对所有视图生效（包括选中的零件）。可见性规则在 `lib/visibility.ts`，有单测。

### 实现约定

- R3F 用 `createRoot` 驱动，不用 `<Canvas>`：`<Canvas>` 会 `extend(THREE)` 整个命名空间，tree-shaking 失效（多 ~50 KB gz）。新用到的 three 类要在 `stages/model3d/extend.ts` 里登记，否则 JSX `<xxx>` 会报 "not part of the THREE namespace"。
- 舞台是独立 reconciler，React context 不穿透：store、ui、bridge、data、主题 look 都以 props 传入 `SceneRoot`，组件里用 `zustand` 的 `useStore(store, …)`。
- 渲染：ACES Filmic + sRGB；pixelRatio = `min(dpr, 3840 / innerWidth, 2)`；灯光 = 一盏大柔 key（唯一投影光源，阴影相机按模型包围盒收紧，PCF 软边）+ 弱 fill + 中性 rim + 半球 + RoomEnvironment（无网络、无 HDR 文件）；paper 暖 key，dark plate 冷 key + 稍强 rim；雾色 = 纸色。只有大件（≥ 模型半径 28%）投影；地面 = 径向接触阴影 + ShadowMaterial 接影面，随拆开下移。`shadowMap.autoUpdate = false`，拆开 / 淡入淡出 / 剖切 / 可见性 / 运转中的投影件变化时才 `needsUpdate`。
- 材质：每个零件一个 MeshPhysicalMaterial（同一 shader 补丁、同一 program cache key）：选中边缘（菲涅尔，`uSel`）和剖面填充（背面 + `gl_FrontFacing`，`uCut`）都在片元里，零额外 draw call。
- `frameloop: 'demand'`：只有在缓动（拆开、淡入淡出、运镜、转台、标注滑动 / 遮挡复查）、运转时才请求下一帧；标签页隐藏时不请求。每帧路径不 new 对象（模块级临时向量、预先算好的拆开向量与动画轴）。几何体、材质、贴图都由我们创建并在卸载时 dispose。
- 计数（sample-space，1920×1080）：静止 16 draw calls、~19 k 三角形、27 geometries、7 textures；FLOW +2 calls。
- 包体：舞台 chunk ~207 KB gz（three + R3F 为主；圆角盒用 `RoundedBoxGeometry`，不引 ExtrudeGeometry/Shape）。GLTF 加载器单独成 chunk（21 KB gz），只有写了 `mesh` 的主题才加载。

## PWA、部署与 e2e（Phase 3）

- **PWA**：`@vite-pwa/astro`（`astro.config.mjs`），`generateSW` + `autoUpdate`。预缓存构建出的页面、JS、CSS、图标；`/geo/*.json` 与 `/models/*.glb` **不**预缓存，走 CacheFirst 运行时缓存。scope / start_url 跟随 `ATLAS_BASE`。仅生产构建注册（BaseLayout 里 `import.meta.env.PROD`），`pnpm dev` 无 service worker。
- **图标**：`pnpm tsx scripts/build-icons.ts` 用 sharp 生成 `public/icons/*.png`（192 / 512 / maskable-512 / apple-touch-icon），产物入库。
- **部署**：见 [07-deploy.md](07-deploy.md)。`public/_headers` 管缓存与安全头。
- **e2e**：`tests-e2e/smoke.spec.ts`（冒烟）+ `tests-e2e/hud.spec.ts`（六尺寸 HUD 布局、键与按钮同步、`__atlas`），`playwright.config.ts` 用 `pnpm preview` 起 `dist/`，所以先 `pnpm build`。首次需 `pnpm exec playwright install chromium`。截图写入 `tests-e2e/__screenshots__/`（git 忽略，本地肉眼检查用）。

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

新增可链接字段：改 `core/types.ts` 的 `UrlEngineFields`、`core/url-state.ts`（`URL_KEY_ORDER`、编解码）、`SceneHost.tsx` 里解构的字段、descriptor 的 `fromUrl`，并补 `tests/url-state.test.ts`。

## WW2 geo pipeline（`scripts/geo/ww2/`）

二战主题的控制区关键帧（`src/content/topics/ww2/data/control.json`）由这条管线生成，CLAUDE.md 的"地图类内容必须用真实数据"由它落实。来源调查、每帧方法、控制点残差、许可证见 `scripts/geo/ww2/SOURCES-GEO.md`；主题内的来源表是 `data/SOURCES.md`（`[G#]`）。所有输入和步骤写在 `scripts/geo/ww2/sources.json`：数据集（url / license / ref）、OHM 关系集（按日期）、SVG 地图（类别颜色、控制点、残差预算）、关键帧配方（CShapes GW 代码 → 实体，再按顺序叠加的步骤，后者覆盖前者）。

```bash
pnpm tsx scripts/geo/ww2/fetch.ts         # 下载数据集到 raw/，装 mapshaper + osmtogeojson 到 .tools/（都 gitignore）；失败 WARN 后继续
pnpm tsx scripts/geo/ww2/ohm-export.ts    # OpenHistoricalMap Overpass → work/ohm-<set>.geojson（按日期校验关系有效期）
pnpm tsx scripts/geo/ww2/ohm-export.ts --list 1942-03-09 --levels 1-3   # 查某天有效的边界关系
pnpm tsx scripts/geo/ww2/georef-svg.ts    # Commons SVG → GeoJSON：控制点拟合（投影 + 仿射 / 二次多项式，auto 取留一法 RMS 最小），打印残差 km
pnpm tsx scripts/geo/ww2/georef-svg.ts --fills <svg>   # 列填充色（选类别）；--dots 列城市点和最近标注（选控制点）
pnpm tsx scripts/geo/ww2/georef-svg.ts --propose <svg> --region europe|asia --r 6   # 用现有拟合预测海角位置并吸附到地图陆地 / CShapes 海岸，打印候选控制点
pnpm tsx scripts/geo/ww2/georef-raster.ts  # PNG / JPG 地图 → GeoJSON：按调色板分类像素，标注/箭头/河流按最近类别填充，矢量化后同样控制点拟合
pnpm tsx scripts/geo/ww2/georef-raster.ts --colors|--preview|--circles <id>   # 颜色直方图 / 分类结果图 work/raster-<id>-classes.png / 城市圆圈中心
pnpm tsx scripts/geo/ww2/compose.ts       # CShapes 底 + OHM / SVG / Natural Earth 省份叠加 → work/K#.geojson（properties.holder）
pnpm tsx scripts/geo/ww2/simplify.ts      # 全部关键帧一个拓扑、拓扑保持简化 → control.json（TopoJSON 写法）；预算 2.0 MB × 现有帧数 / 12，自动调间隔
pnpm tsx scripts/geo/ww2/check.ts         # MapLibre（Playwright）渲染每帧，与来源地图并排 → docs/screenshots/ww2/geo-K#.png
```

- 不改 `package.json`：几何运算用 mapshaper（`.tools/`，`fetch.ts` 安装），截图用已装的 Playwright + `maplibre-gl`。
- 加一个关键帧：在 `sources.json` 的 `ohm` 加该日期的关系集（先 `--list` 查），需要的话加 SVG 来源和控制点（≥ 4 个，欧洲残差 ≤ 30 km、亚太 ≤ 60 km），在 `keyframes` 写配方和 `checks` 视图，然后依次跑上面 6 步，看 `geo-K#.png` 与来源图并排是否一致，把方法和残差写进 `SOURCES-GEO.md` 与 `data/SOURCES.md`。
- 选择器（`compose.ts`）：`cshapes`（`partsAt` 只取包含某点的岛，`at` 取另一天的国界）、`ohm`（`set` 取另一关键帧的关系集）、`admin1`（Natural Earth 省份）、`svg` / `raster`（类别，`coastFillKm` 让占领区沿底图海岸补齐）、`svgFrame` / `rasterFrame`、`parts`（保留或 `drop` 包含某点的单个多边形）、`bbox`、`union` / `intersect` / `difference`。不允许手画多边形；`bbox` 只用来选取已有几何的一部分。
- 同一底图的系列地图（San Jose 的月度二战欧洲 SVG、Gdr 的东线 SVG）在 `sources.json` 里用 `controlPointsFrom` 共用一套控制点。位图来源（`raster`）写调色板、容差、`exclude`（图例框）和 `minRegionPx`（可按类别，`_sea` 设大值把海色描边的字母吞回陆地）。
- 一条前线要"苏占区"时，用来源图里的苏方类别（带海岸补齐）作为**最后**一步绘制，而不是"苏联减去轴心区"：海岸不重合处（列宁格勒在来源图的海里）后者会把苏方城市划给轴心。
- 简化（`simplify.ts`）：`compose.ts` 仍每帧写一份 GeoJSON（`work/K#.geojson`，中间产物）；`simplify.ts` 把所有帧放进**同一个** mapshaper 数据集——相邻实体、也包括相邻关键帧之间重合的边界是同一条弧，只简化一次、只存一次——再导出一个带量化的 TopoJSON，写成 `{ topology, keyframes: [{ t, object: "K1" }] }`。按区域：焦点框（欧洲 / 中东、东亚 / 东南亚 / 西太平洋）内细、框外粗（50 km），两半沿框边拼回再按实体合并。默认方法 `dp`（Douglas–Peucker，间隔就是最大偏差；`--method weighted` 是 Visvalingam，更平滑但会把细长峡湾整条删掉）。
- **预算旋钮**：`--budget <MB>`（默认 2.0 = 12 帧的总预算，按帧数等比）。不给 `--fine` 时从 1.5 km 起每次 +0.25 km 直到放得进预算，所以"焦点区容差"是预算允许的最细档；`--fine / --coarse`（km）固定间隔，`--quant`（默认 50000 个量化格，≈ 赤道 0.8 km、北纬 60° 约 0.4 km），`--method`，`--out` 写到别处，`--no-measure` 跳过偏差统计。脚本最后打印焦点框内原始顶点到成品边界的偏差 p50 / p95 / p99 / max（km）。新增关键帧后重跑本步即可，帧多了容差会变粗；超预算时它自己警告。
- 实测（K1 + K6 两帧）：原 GeoJSON 简化（10 km、Visvalingam）259 KB → 现 TopoJSON 焦点区 3 km、336 KB（预算 341 KB）；焦点框内偏差 p95 2.3 km、p99 2.8 km。
- 实测（12 帧，2026-10-08）：焦点区 1.5 km、1371 KB（预算 2048 KB），偏差 p50 0.24 / p95 1.17 / p99 1.47 km；3 km 时 1215 KB。体积的大头是每帧约 800 个多边形的弧引用，间隔再粗也省不多（40 km 仍 916 KB）。`--islands fine,coarse` 调丢弃小岛的面积阈值（km²）。
- 页面体积：主题数据作为岛组件 props 序列化进 HTML，JSON 约翻倍，ww2 页约 3 MB，超过 Workbox 默认 2 MiB 预缓存上限，`astro.config.mjs` 已把 `maximumFileSizeToCacheInBytes` 提到 4 MiB。若要缩小页面，把 `control.json` 改成像 `public/geo/` 那样运行时 fetch 的静态文件。
- 东南亚近景底图：`scripts/build-geo.ts` 另出 `public/geo/land-10m-sea.json`（Natural Earth 1:10m 陆地，裁到 95°E–125°E、9°S–22°N，TopoJSON，约 234 KB）。GeoStage 在镜头 zoom ≥ 6.5 且视野与该框相交时才 fetch；zoom 7 起绘制、到 8 完全显现：框内先铺一层水色遮住 50m 陆地（不透明度 7→8 渐入），10m 陆地和海岸线叠在上面，颜色同为 `--land` / `--land-edge` / `--water` token。其他主题不加载它。
