# 06 · 开发指南

Phase 1 地基（站点框架、i18n、主题、内容集合、Scene 契约、共享部件）、Phase 2 两个引擎（TimeScene / SpaceScene）、Phase 3 上线准备（PWA、Cloudflare Pages、e2e）和技术图版打磨（P1–P4，docs/08）都已就位，带两个占位主题。

**术语**（全文统一）：**预设**（preset）= 相机预设，顶栏按钮组 `VIEW`，数字键 `1–9`、`0`（第 10 个；TimeScene 只放地理预设）；**模式**（mode）= 可开关的显示 / 行为，字母键，按钮在右列的**控制面板**（`widgets/ControlPanel.tsx`，LAYERS / TOOLS 两节）里，顶栏不再有 `MODE` 组；**状态行** = 顶栏第二行；**插槽**（slot）= 引擎往宿主 HUD 里画内容的位置；**面板**（panel）= 底部 `panel01–03`（目前只有 SpaceScene 用）；**卡片**（card）= 右上示意卡；**阅读面板**（reader）= 右侧停靠的 InfoPanel。SpaceScene 里的 `state.view`（assembled / xray / exploded / isolate）是"显示视图"，与 `VIEW` 按钮组（相机预设）无关。

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
                              # controls（HUD 注册 + 动作）, keys（键盘）, test-api（window.__atlas）, Hud（顶栏/标题块/面板框）,
                              # presentation/（演示系统：beats, autoplay, usePresentation, Presentation 字幕卡，见「演示系统（core）」）
    widgets/                  # ChapterRail ChapterBodies InfoPanel Legend ControlPanel QuizCard Counter
                              # LangToggle ThemeToggle（均基于 Dropdown）GlobalToggles icons
    time-scene/               # descriptor + schema + View + stages/geo + timeline + hud（见「TimeScene」）
    space-scene/              # descriptor + schema + View + stages/model3d + hud + explorer（见「SpaceScene」）
    simulation/               # 后期占位引擎（只有 descriptor + schema + StubStage；不在一期范围）
    registry.ts               # 客户端引擎注册表（descriptor 同步，View 懒加载）
    schemas.ts                # 构建期引擎 schema 注册表（含 zod，禁止进客户端）
  i18n/                       # ui.en.json ui.zh.json + t() / tx() / 路径工具
  theme/                      # tokens.css, theme.ts（解析/应用/读 token）, map-style.ts
  lib/                        # content.ts（构建期取内容）, prefs.ts（localStorage）, time.ts, levels.ts（仅供 schema 校验可选的规划字段 `level`）,
                              # speech.ts（演示语音：选声、朗读队列、voiceLog）
  components/                 # SiteToggles 岛、MDX 组件（Lang / More / Num / FlyTo / Term）
  layouts/BaseLayout.astro    # <html lang>、首帧前主题脚本、hreflang
  pages/                      # index.astro（跳转）, [locale]/index.astro, [locale]/topics/[slug].astro
  styles/                     # global.css（Tailwind + token 映射）, fonts.css（自托管 Plex woff2）, scene.css（HUD 布局与部件）
scripts/                      # validate-content.ts, build-geo.ts, build-icons.ts, shoot.ts（pnpm shoot）,
                              # new-topic.ts（主题脚手架）, sources-md.ts, geo/lib/（真实地图管线）+ geo/<slug>/（每主题清单）
tests/                        # vitest（数据层与纯函数）
tests-e2e/                    # Playwright：smoke.spec.ts, hud.spec.ts, hud-layout.ts（pnpm shoot --layout 共用）
```

## 加一个主题

历史主题（时间线 + 地图）走项目级 skill `.claude/skills/atlas-history-topic/`（docs/10），先用脚手架：

```bash
pnpm tsx scripts/new-topic.ts <slug> --engine time-scene --subject history --title-en "…" --title-zh "…" [--subtitle-en … --subtitle-zh …] [--start YYYY-MM-DD --end YYYY-MM-DD]
```

它建 `topic.yaml`（`status: draft`）、`chapters/00-background.mdx`（`kind: background` + 阅读说明）、`chapters/01-chapter-one.mdx`（完整 TimeScene frontmatter：state、summary、beats 示例）、`data/{entities,control,movements,events,presets,sources,glossary}.json`（最小合法：无实体、一个空的控制区关键帧）、`data/SOURCES.md`（带生成块标记），以及 `scripts/geo/<slug>/sources.json` + `SOURCES-GEO.md`；已存在就拒绝，最后打印下一步。`--start / --end` 缺省是 1900 年的占位日期，记得改。

空间主题（SpaceScene，stage model3d）用同一个脚手架：

```bash
pnpm tsx scripts/new-topic.ts <slug> --engine space-scene --subject science --title-en "…" --title-zh "…" [--subtitle-en … --subtitle-zh …]
```

它建 `topic.yaml`（`mode: space`、`engine: space-scene`、`stage: model3d`、`status: draft`，`note` 写在注释里）、`chapters/01-chapter-one.mdx`（完整 SpaceScene `state`：view / explode / part / run / cutaway / layers / hide / labels / camera / summary，beats 示例在注释里）、`data/parts.json`（一个积木零件 `<slug>-body`，在组 `<slug>-main` 里；`flows` / `animations` 为空；`views` 有 assembled 镜头、`cover`、`section`；id 带 slug 前缀，因为 id 全主题唯一）和空的 `data/{sources,glossary}.json`。生成后 `pnpm validate` 直接通过。手工建主题按下面的步骤：

1. 建目录 `src/content/topics/<slug>/`，`<slug>` 就是 URL 和 `topic.yaml` 里的 `id`（kebab-case，必须一致）。
2. 写 `topic.yaml`（字段见 docs/02）。`engine` + `stage` 必须是引擎支持的组合：`time-scene: geo | diagram`，`space-scene: model3d | layer2d`。
3. 写章节 `chapters/<nn>-<id>.mdx`，frontmatter：`id, order, title, sensitive, state, quiz`（`level` 可选，仅作内容规划，不渲染；`kind` 可选：`chapter` 默认 / `background` 背景章，见「背景章」）。
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
   - 正文组件（免 import，和 `<Lang>` 同一机制，在 `src/pages/[locale]/topics/[slug].astro` 的 `components` 里注册；都是静态 HTML，交互由 SceneHost 委托处理）：

     | 组件 | 写法 | 效果 |
     |---|---|---|
     | `<More>` | `<More title={{ en: "The numbers", zh: "数字" }}>`（里面空行再写 Markdown）`</More>` | 细看折叠块：hairline 标题行 + 小三角，默认收起；原生 `<details>`，无 JS 也能用 |
     | `<Num>` | `<Num s="S3">about 70,000</Num>`；多个来源 `s="S3,S7"` | 数字后跟 mono 上标来源号，点开来源弹层（文本、说明、链接，不联网） |
     | `<FlyTo>` | `<FlyTo preset="singapore-island">Singapore island</FlyTo>` | 正文里的 hairline 按钮，镜头飞到命名预设（TimeScene `presets.json`，SpaceScene `parts.json` 的 `presets`；与 VIEW 按钮同一动作；手机上顺便收起阅读面板） |
     | `<Term>` | `<Term id="blitzkrieg">闪电战</Term>` | 名词：点状下划线的 `span`（`role="button"`，Enter / 空格也能开），点开在阅读面板 inspector 区显示 `glossary.json` 里的定义和相关词（见「名词表」）；只包全主题第一次出现处 |
4. 引擎数据放 `data/*.json`，文件名（去掉 `.json`）就是数据对象的 key：
   - TimeScene/geo：`entities.json`、`control.json`、`movements.json`、`events.json`；可选 `presets.json`（额外镜头）
   - SpaceScene：`parts.json`（含 parts / groups / flows / animations / views）
   - 两个引擎都可选 `glossary.json`（名词表，共用 schema `src/content/schema/glossary.ts`，见「名词表」）和 `sources.json`（编号来源，共用 schema `src/content/schema/sources.ts`）：

     ```json
     { "sources": [
       { "id": "S1", "text": { "en": "IMTFE judgment (1948): over 200,000.", "zh": "远东国际军事法庭判决书（1948）：超过 20 万。" },
         "url": "https://…", "note": { "en": "Nanjing tribunal (1947): over 300,000. Both listed.", "zh": "南京军事法庭（1947）：30 万以上。两者并列。" } }
     ] }
     ```

     `id` 是 `S` + 数字、全主题唯一；`url`（http/https）和 `note` 可选。`data/SOURCES.md` 的编号来源段由脚本生成：`pnpm tsx scripts/sources-md.ts <slug>`——只替换 `<!-- sources:begin … -->` 与 `<!-- sources:end -->` 之间的块（没有就追加到文末），SOURCES.md 里手写的地图来源、许可、配准说明保留。
5. `pnpm validate`，按报错改到 0 error。缺中文是 warning，缺英文是 error。
6. 索引页**只列 `status: published`**；`draft` / `ready` 照常构建，输入 URL（`/en/topics/<slug>/`）可进入，但不出现在索引页，也没有草稿标记。发布前改 `published`（见「年级、索引页与偏好」）。

### 校验规则（`pnpm validate`，`pnpm build` 前自动跑）

- topic.yaml / 章节 frontmatter / 引擎数据都按 zod schema 解析
- 双语字段：`en` 必填非空（error），`zh` 缺失或为空（warning，运行时回退英文）
- 主题内所有 id（主题、章节、实体、事件、行军、零件、组、流、动画）kebab-case 且全主题唯一
- 章节 `order` 唯一；文件名建议 `<nn>-<id>.mdx`
- 章节 `state` 按引擎的 chapter-state schema 校验；`highlight` 引用的 id 必须存在。SpaceScene（含每个 `beats` 拍）：`part` / `hide` 必须是零件（`part` 不能是 context 零件），`labels` 是零件（非 context）或 `group:<组 id>`，`layers` 是组，拍的字符串 `camera` 是 `parts.json` 的命名预设
- 引擎要求的数据文件必须存在；`cover` 指向的文件必须存在
- MDX 正文要有 `<Lang en>` 和 `<Lang zh>`
- `sources.json`：id 形如 `S1`、不重复；事件的 `sources` 和正文 `<Num s="…">` 引用的编号必须在 `sources.json` 里（没有这个文件却引用了也报错）
- 正文 `<FlyTo preset="…">` 必须是本主题的命名预设（TimeScene `presets.json`，SpaceScene `parts.json` 的 `presets`）；`<More>` 必须带 `title`；预设 id 与章节等 id 一样全主题唯一，且不能叫 `world` / `theatre`（TimeScene）、`orbit` / `reference`（SpaceScene）
- `glossary.json`：名词 id 唯一，`see` 必须指向已有名词且不能指向自己；正文 `<Term id="…">` 必须在名词表里（没有这个文件却用了也报错）
- `topic.yaml` 的 `blocLabels` 只允许 `axis / allied / neutral / out` 四个键，每项都是 `{ en, zh }`
- 背景章（`kind: background`）至多一个且 `order: 0`；`state.note`（阅读说明）只能写在背景章
- `ui.en.json` 与 `ui.zh.json` key 一致

## 背景章（`kind: background`）

主题可以有一个开场的背景章（`order: 0`），讲"开始之前"。客户端判断在 `src/engines/core/chapters.ts`（`isBackground`、`storyChapters`、`chapterNumbers`）：

- **编号**：背景章是 00，其余章节从 01 起照常编号（加不加背景章，后面的章号不变）。doc id `ATL-…-00`；章节轨里它没有编号，画一个空心菱形 + "Background / 背景"（手机芯片写"BG / 背景"），title 是章名；阅读面板眉题写"Background / 背景"，收起的竖条写短名；规格表 CHAPTERS 和索引页章数只数正式章节。
- **时间**：没有时间轴节点、不进混合时间刻度（TimeScene 只把 `storyChapters` 交给 `buildTimeModel` 和 Timeline）、不自动跑（`chapterSpan` 对它返回 `null`，进入时只缓动到目标时间）；目标时间按累积规则 = 默认值（第一个控制区关键帧）或它自己的 `state.time`。下一章的自动跑起点取"上一个正式章节"，跳过背景章。
- **阅读面板**：第一次进入背景章时（每次页面加载一次）阅读面板展开，不管之前是否收起（`SceneHost` 的 `openBackground`，结果照常写回 sessionStorage）；之后照常粘住。< 1024 的底部抽屉不受影响。
- **阅读说明**：背景章的 `state.note`（`{ en, zh }`，TimeScene chapter-state schema）在阅读面板正文顶部画成细框（`.atlas-note`），标题是 UI 文案 `chapter.note`："How this topic is written / 阅读说明"。
- ← → 和 Back / Next 照常经过它（它在最前）。演示的节拍列表包含它（默认一拍 = `summary`），排在第 01 章之前；字幕卡表头写"Background"，进度条段落写"BG / 背景"；语音开场读"Background / 背景"而不是章号。

## 名词表（`data/glossary.json`）

```json
{ "terms": [
  { "id": "blitzkrieg", "term": { "en": "Blitzkrieg", "zh": "闪电战" },
    "definition": { "en": "German for “lightning war”: …", "zh": "德语，意为“闪电般的战争”：…" }, "see": ["encirclement"] }
] }
```

- schema `src/content/schema/glossary.ts`（两个引擎的数据 schema 都接受可选的 `glossary`）；客户端 `topicGlossary(data)`（`widgets/GlossaryCard.tsx`）。
- 正文 `<Term id>`（`components/mdx/Term.astro`）渲染静态 `span.atlas-term[data-term]`；SceneHost 委托 click / Enter / 空格 → `actions.setGlossary(id)`。
- 状态在 HUD store 的 `glossary`（名词 id、`GLOSSARY_ALL` = `'*'` 列表、`null` 关闭），不进 URL。打开时宿主展开阅读面板（手机打开抽屉），`GlossaryCard` 画在阅读面板的 inspector 区（`inspector` 插槽之前）并滚到可见：眉题"Glossary / 名词"、名词（另一语言小字）、定义、"See also / 参见"链接、"All terms / 全部名词"；列表视图按当前语言排序。ESC 先关名词卡（`actions.escape`），再交给引擎。
- 控制面板 `ControlPanel` 的行类型 `{ kind: 'glossary' }`（按钮 `data-glossary-toggle`，`aria-pressed` = 名词卡开着）；TimeScene 在主题有名词时把它放进 TOOLS（演示之后、隐藏界面之前），没有快捷键。

## Scene 契约（给二期引擎实现者）

### 数据怎么到引擎

```
data/*.json ──(build: import.meta.glob)──> engineSchemas(engine, stage).data.parse()  ← zod，构建期（页面和 pnpm validate 都跑）
           ──> src/pages/topics/[slug]/data.json.ts  ──> dist/topics/<slug>/data.json   （每主题一份静态文件，与语言无关）
SceneHost props: topic / chapters / locale / dataUrl（小）
           ──> 客户端 fetch(withBase('/topics/<slug>/data.json')) ──> store.rebase(engine.defaults(topic, data))
           ──> <EngineView data={...}>（已解析，不再引 zod）
```

- 数据**不**作为 island props 内联进页面 HTML（Astro 的 props 编码会把 JSON 体积翻倍：ww2 页面曾达 3 MB）。页面只在构建期跑一次 `topicEngineData()` 校验，数据本身由 `data.json` 端点输出。
- SceneHost 先按空数据建 store（`engine.defaults(topic, undefined)`，**必须容忍 `data` 为 `undefined`**），数据到了再 `store.rebase()` 并应用 URL 深链、挂载引擎视图。数据加载期间舞台显示占位（`scene.loading`），失败显示 `scene.error`；`__atlas.ready` 在数据加载并且视图挂载之后才 resolve（失败时 resolve 为 `false`）。所以引擎 View 拿到的 `data` 始终是完整的。
- 引擎客户端代码只能 `import type` schema 里的类型（`TimeSceneGeoData`、`SpaceSceneData` 等），**不要运行时 import `schema.ts`**，否则 zod 进包。
- 大体量资源（Natural Earth GeoJSON、glb）放 `public/geo/`、`public/models/`，用 `withBase('/geo/xxx.json')` 在客户端 fetch。`data/` 现在也是运行时 fetch，不再进页面 HTML，但仍是 JSON 一次性解析进内存：别把底图类大文件放进去。
- PWA：`topics/**/data.json` 不预缓存，走 CacheFirst 运行时缓存（`atlas-topic-data`）。

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
顶栏  ◇ ATLAS · 学科 │ ATL-{TOPIC6}-{NN} │ VIEW [WORLD 1][WHOLE AREA 2]…（放不下就折行）  LOOK ▾  EN ▾
      状态行 CHAPTER 07 VIEW · PAUSED · FLOW          键位提示
左列  标题块（PLATE NN · 章节名 / 主题名 / 副标题 / 规格 dl / 声明）+ ChapterRail
右列  card（右上示意卡，可展开）+ stageOverlay（控制面板：LAYERS / TOOLS / KEY）
底部  perf（安静读数）→ panel01‖panel02‖panel03（引擎注册了才有）→ bottomBar（引擎控件）
阅读面板  编号 / 章名 / summary 一句（衬线、弱墨）→ 正文 → inspector → 测验；左缘把手收起成 28 px 竖条
```

- **阅读面板收起**（≥1024px）：左缘一个 hairline 小把手（`.atlas-reader__handle`）把它收成 28 px 竖条（`.atlas-reader__strip`：小箭头 + 章节号 + 竖排章名，点它展开）；舞台随之占满宽度（地图的 ResizeObserver 调 `map.resize()`）。默认展开。**收起是用户的选择，粘住**：点章节轨、时间轴节点、← →、Next / Back 换章**都不会**重新展开；只有点把手或竖条才展开（`actions.setReader`）。收起时换章（章 id 变了才算）会让竖条闪一下提示有新文字：`.atlas-reader` 上 `data-flash` 约 900 ms，CSS 画两次 signal 橙 2 px 轮廓脉冲（`atlas-reader-flash`，450 ms × 2；`prefers-reduced-motion` 下改为静态轮廓）；已展开则不闪。演示进入时 HUD 整体隐藏（阅读面板随之消失），退出时恢复，不改 `reader`。状态在 HUD store 的 `reader`，按标签页存 `sessionStorage['atlas:reader']`（`lib/prefs.ts` 的 `getReaderExpanded / setReaderExpanded`），**不进 URL**。< 1024 的底部抽屉不受影响。
- 阅读面板头部：章节号、章名，下面一句 `state.summary`（没有就用 `state.question`），弱墨衬线；手机抽屉收起时不显示这一句。

### 布局插槽（引擎往哪里画）

引擎用 `<SceneSlot name=…>` portal 进插槽；空插槽什么都不渲染（没有空框）。

| 插槽 | 位置 | 说明 |
|---|---|---|
| `bottomBar` | 底部最下 | 时间轴 / Explorer 控件（44px 触控，不随 HUD 缩小，4K 时放大） |
| `stageOverlay` | 右列，示意卡下 | 控制面板 `ControlPanel`：LAYERS（图层 + 绘制类模式）、TOOLS（其余模式 + 隐藏 HUD）、KEY（图例） |
| `inspector` | InfoPanel 内 | 选中对象详情 |
| `card` | 右列顶 | 示意 SVG 卡的**内容**；标题由 `controls.card` 注册，宿主画框和 `A NAME 中文` 表头；注册了 `cardToggle` 时表头是展开按钮（`aria-expanded`），框带 `data-expanded`，展开后高 ≤ 右列 60%，内容自己滚动 |
| `panel01` `panel02` `panel03` | 底部三块等高面板 | 面板**内容**；标题由 `controls.panels` 注册，宿主画框和 `01 NAME 中文` 表头；没注册标题的面板不出现，一个都没注册时整条面板带不出现（TimeScene 就是这样） |
| `perf` | 底部右上，安静小字 | `60 FPS · 16 CALLS · 0.02M TRIS · 1520×1026` / `FEATURES 63 · ZOOM 5.5 · 60 FPS` |
| `leaders` | 覆盖舞台的 `<svg>` | 引线标注；往里 portal SVG 元素（`<path>`、`<circle>`） |

- HUD 尺寸用设计像素（1920×1080 下的 px）乘 `--u` 写：`height: calc(18 * var(--u))`。卡片、面板里的 SVG 用 viewBox + 100% 宽高。
- 交互元素 ≥ 44px：HUD 按钮视觉 18px，触屏（`pointer: coarse`）时用透明 `::after` 撑到 44px；引擎自己的控件继续用 `.atlas-control`（44px，已改成 hairline 皮肤）。
- 舞台不设全局 `touch-action`，引擎在自己的 canvas 上设。

### HUD 控件注册（`core/controls.ts`）

引擎 View 里注册一次（传 `useMemo` 过的对象，身份变了就重新注册），宿主据此画 VIEW 按钮、状态行、键位提示、规格表、卡片和面板框，并绑定键盘和 `window.__atlas`；模式按钮由引擎放进自己的控制面板（见下）：

```ts
import { useSceneControls, useHud } from '../core/context';
import type { SceneControls } from '../core/controls';

const controls = useMemo<SceneControls>(() => ({
  presets: { items: [{ id, label: '01', title?, chapter? }], set(id, { instant }) {} },   // 数字键 1–9，第 10 个是 0，再往后只有按钮（不显示数字）
  modes:   { items: [{ id: 'xray', key: 'x', label, on, disabled?, status?: 'EXPLODED 70', tone?: 'xray' | 'hot' | 'cold' | 'cut' | 'signal',
                      phone?: false }],   // phone:false = < 760 px 宽（手机）控制面板不画这一行（键仍可用）
             set(id, on, { instant }) {} },                                                 // 字母键
  pause:   { paused, set(paused) {} },                                                     // SPACE
  labels:  true,                     // 引擎认宿主的 LABELS 开关 → 宿主加 `labels` 模式（L）
  stats:   () => ({ calls, triangles, fps, features, zoom, gpu }),                          // 合并进 __atlas.stats()
  specRows: [{ id, label: { en, zh }, value, mono?, source?: 'fact' | 'ref' | 'reconstruction' | 'simulated' }],
  status:  ['SIMULATED'],            // 状态行追加段（大写）
  card:    { en: 'Process flow', zh: '工艺流程' },
  cardToggle: { expanded, set(expanded) {} },   // 可选：卡片表头变成展开按钮
  panels:  { panel01: { en, zh }, panel02: …, panel03: … },
  beats:   presentation.controls,     // 可选：演示节拍（usePresentation 给的；__atlas.beats / goToBeat / state().presentation / setAutoplay / setVoice / voiceLog），见「演示系统（core）」
  escape:  () => boolean,            // ESC：退出选中 / focus，处理了返回 true
}), [deps]);
useSceneControls(controls);
const labelsOn = useHud((s) => s.labels);   // 或 CSS：.atlas-scene[data-labels="off"] .my-label { display: none }
```

- 非 React 场合用 `registerSceneControls(hudStore, controls)`，返回注销函数。
- **控制面板**（`widgets/ControlPanel.tsx`）：引擎在 `stageOverlay` 里放 `<ControlPanel layers={[…]} tools={[…]} legend={[…]} />`，行是 `{ kind: 'layer', id, label, color? }`（切 store 的 `layers`）、`{ kind: 'mode', id, label? }`（走 `actions.setMode`，与字母键同一路径，按钮带 `data-mode` + `aria-pressed`）或 `{ kind: 'hud' }`（隐藏 HUD，H）。每行右侧写键位字母；`phone: false` 的模式在手机上不画。注册表仍是唯一状态来源，面板只是 UI；`pnpm shoot --keys` 照样按 `[data-mode]` 核对。宿主的 `HudActions`（模式、预设、HUD、阅读面板）经 `useSceneContext().actions` 拿到。
- **镜头预设**：调用 `store.getState().applyCameraPreset(camera, { instant })`，它改 `camera` 并发一次 `transition.reason = 'preset'`（舞台照常飞过去，时间不变）。当前预设由宿主推导：显式选的 > 当前章节自己的（`preset.chapter`）；用户拖动 / 平移写回相机后变为 FREE CAMERA。没有亮着的预设但镜头没动过时，状态行写 `CHAPTER 07 VIEW`（本章镜头）。
- **一次设多个字段**：`store.getState().applyState(partial, { instant })` 直接写这些字段（`chapter` 也可以，不重置成章节目标），发 `reason: 'state'` 的过渡，舞台照常飞镜头、缓动时间（TimeScene 演示节拍、演示结束时恢复原场景用它）。宿主把它当深链处理：镜头和本章基线不同就是 FREE CAMERA。
- **立即完成**：`store.getState().snap()` 发 `reason: 'snap'`、`instant: true` 的过渡，舞台跳到终态（测试、截图用）。
- 规格表：宿主先放默认行（学科 / 章节数 / 课纲锚点数），引擎行追加在后，最多 8 行。
- 接线现状：
  - **TimeScene**：预设 = `world` + `theatre`（整片区域）+ `presets.json` 的地理预设（**不再有章节预设**：换章走章节轨、时间轴节点和 ← →）；模式 `flow`（F）/ `borders`（B）/ `graticule`（G）/ `territory`（N）/ `reference`（R）/ `presentation`（P）+ 宿主 `labels`（L），全在控制面板里（`presentation` 另有底部条左端的 PRESENT 按钮）；**没有 `pause`**（没有自由播放，SPACE 只在演示里 = 下一拍）；ESC 依次退出演示、REFERENCE、收起展开的参与卡（连同选中的实体）、取消选中实体、关闭事件详情、清空高亮。G / P 手机上不画行（`phone: false`）。
  - **SpaceScene**：预设 = 各章镜头（本章镜头 > 视图预设 > 继承）+ `ORBIT`（转台）+ `REF.`（= REFERENCE 模式的预设入口）+ `parts.json` 的命名预设（数字键接着排），模型视角，不是地理预设；模式 `xray`（X）/ `exploded`（E）/ `cutaway`（C）/ `flow`（F，= run；EXPLODED 时禁用）/ `reference`（R）/ `presentation`（P）+ 宿主 `labels`（L），在 ExplorerOverlay 的控制面板 TOOLS 节里（LAYERS 节是零件组）；SPACE = run；ESC 依次退出演示、取消选中、退出 REFERENCE、停 ORBIT。R / P 手机上不画行（`phone: false`）。
  - 两个引擎的 PRESENTATION 都是 core 演示系统加各自的适配器（见「演示系统（core）」「TimeScene」「SpaceScene · 演示」）。

### 键盘（`core/keys.ts`，宿主统一处理）

| 键 | 作用 |
|---|---|
| ← → | 上一章 / 下一章（跳过折叠章节） |
| 1–9, 0 | 镜头预设（TimeScene：地理预设，按 VIEW 组顺序）；0 = 第 10 个，再往后只有按钮，按钮上也不写数字 |
| 注册的字母 | 模式开关（L = 标注；`h`、空格、数字保留给宿主） |
| SPACE | 暂停 / 运行（没注册 `pause` 时不拦截） |
| H | 隐藏 / 显示 HUD（只进 HUD store，不进 URL；0.35 s 淡出，左下留「H 显示界面」可点） |
| ESC | HUD 隐藏时恢复；否则交给引擎 `escape` |

带 Ctrl / Cmd / Alt 的不处理；已被处理（`defaultPrevented`）的不处理；焦点在 `input / textarea / select / contenteditable / [data-keys="own"]` 里不处理；方向键还让给 `[role=slider|radiogroup|tablist]`；空格让给获得焦点的按钮类元素（鼠标点完 HUD 按钮会自动失焦）。Shift+← → 留给 TimeScene 微调时间。

### `window.__atlas`（`core/test-api.ts`，docs/08 §7）

```ts
await __atlas.ready                 // 视图已挂载且舞台 canvas 有尺寸 → true；20 s 超时 → false
__atlas.chapters(); __atlas.goToChapter(id, { instant })
__atlas.runChapter(id)                           // 同点章节轨：飞镜头；TimeScene 另外自动跑本章时间（instant 为 false），同一章再调一次 = 重跑
__atlas.presets();  __atlas.setPreset(id, { instant })           // instant 默认 false
__atlas.modes();    __atlas.setMode(id, on, { instant })          // instant 默认 true（会 snap）
__atlas.keymap()    // [{ key, type: 'preset'|'mode'|'pause'|'hud'|'escape'|'chapter', name }]
__atlas.beats();    __atlas.goToBeat(i, { instant })    // 演示节拍（用 core 演示系统的引擎）：beats() = [{ chapter, index, caption }]（index = 本章内第几拍，0 起）；goToBeat 需要时先进入演示，instant 默认 false
__atlas.state().presentation                    // 正在演示的拍 { chapter, beat, autoplay, voice }（beat = 本章内位置，0 起）；没在演示 = null
__atlas.setAutoplay(on)                         // 演示自动播放开关（写 sessionStorage `atlas:autoplay`）；引擎没有演示就返回 false
__atlas.setVoice(on)                            // 演示语音朗读开关（写 sessionStorage `atlas:voice`）；引擎没有演示或设备没有可用的声音就返回 false
__atlas.voiceLog()                              // 最近 10 段朗读 { text, lang, voice, part, started, ended, reason }
__atlas.setPaused(on); __atlas.setHud(on); __atlas.setTheme('paper' | 'cinema')   // setPaused 在场景没注册 `pause` 时（TimeScene）什么都不做、返回 false；setTheme 写用户覆盖
__atlas.state()     // 场景快照 + { hud, paused, labels, reader, running, playhead, preset, modes: {id: on}, appliedTheme }；running = 章节自动跑进行中（只有 TimeScene 会 true），playhead = 引擎正在显示的连续时间（数字；没有就 null）。截图脚本在每张章节图前等 running === false
__atlas.stats()     // { buffer, pixelRatio } 取自舞台 canvas，再合并引擎 stats()；SpaceScene 另有 camera = 舞台此刻的真实镜头 { position, target, fov }（不是 store 里的目标）
```

按钮带 `data-preset` / `data-mode`、`aria-pressed`；HUD 块带 `data-hud-panel`。

### 演示系统（core，`core/presentation/`）

PRESENTATION（P）是用户翻页的节拍序列，由 core 统一实现，引擎只写一个**适配器**说"一拍在我的舞台上是什么样"。文件：`beats.ts`（节拍模型，纯函数）、`autoplay.ts`（计时与两个会话开关）、`Presentation.tsx`（字幕卡 + 两级进度条 + 勾选框 + 透明点击层）、`usePresentation.tsx`（hook）、`adapter.ts`（适配器接口 + SpaceScene 的类型桩）；语音在 `src/lib/speech.ts`；样式 `.atlas-present*` 在 `styles/scene.css`（两个引擎共用）。

```ts
import { usePresentation, type PresentationAdapter } from '../core/presentation';

interface PresentationAdapter<B extends BeatBase, S> {          // BeatBase = { caption: Bilingual; audio?: string }
  beatsOf(chapter: Chapter): readonly B[] | undefined;          // 本章自己的拍；没有 / 空 = 一拍默认拍
  captionOf(beat: Beat<B>, locale: Locale): string;             // 显示并朗读的字幕（纯文本）
  applyBeat(beat: Beat<B>, { instant }): Promise<void> | void;  // 把舞台摆成这一拍（镜头、时间、图层、零件…）
  saveState(): S;                                               // 进入前的场景（进入时调一次）
  restoreState(state: S): void;                                 // 退出时放回
  afterCameraSettle?: () => Promise<void>;                      // 镜头落定；没有就用 applyBeat 返回的 promise，再没有就固定 2.3 s
  onEnter?(): void;                                             // 进入时、saveState 之前：退出互斥模式、清选中
  readout?: ReactNode;                                          // 字幕卡表头章名后的一段（TimeScene：日期）；没有就不画
}
// Beat<B> = { chapter, chapterIndex, index, count, caption, audio?, spec?: B }（spec = 引擎自己的拍；默认拍没有）

const presentation = usePresentation(adapter);   // { beats, beat, presenting, isPresenting(), start(i | null, instant), stop(restoreHud), status, controls, element }
```

- **节拍模型**（`beats.ts`）：各章按顺序（背景章在最前）展开成一条列表；没写拍的章 = 一拍，字幕 = 章的 `summary`，没有就 `question`，再没有就章名（`defaultCaption`）。每拍知道自己在第几章（`chapterIndex`）、本章第几拍（`index`）、本章共几拍（`count`）。`chapterSpans`（进度条每章第一拍和拍数）、`startIndex`（进入时从当前章第一拍开始）、`stepIndex`、`current`、`presentationStatus`（`PRESENTATION 08/17`）都是纯函数，`tests/core/presentation.test.ts` 覆盖。
- **引擎要做的**：注册模式 `presentation`（P，`status: presentation.status`，`on: presenting`，`phone: false`，`set` 调 `start(null, instant)` / `stop(true)`）；`SceneControls.beats = presentation.controls`；ESC 链最前面 `if (isPresenting()) { stop(true); return true; }`；把 `presentation.element` 放在舞台上（覆盖舞台的绝对定位层）；演示中自己的舞台特例（TimeScene：只标这拍的高亮）按 `presenting` 做。`controls`、`start`、`stop`、`isPresenting` 身份稳定，可以放进 `useMemo` 依赖；适配器对象每次渲染新建也没关系（hook 读最新的那个）。
- **进入**：`onEnter` → `saveState` → 隐藏 HUD（宿主 `hud = false`，阅读面板随之收起、舞台占满）→ 预加载所有拍的 `audio` → 显示 `start` 要的拍（`goToBeat(i)`），没给就当前章第一拍。**退出**：ESC / P / H / "显示界面" / PRESENT 按钮；`restoreState` 放回进入前的场景，并恢复 HUD。
- **字幕卡**：舞台上只剩标题块（`data-hud-panel="present-title"`）和一张纸质字幕卡（`data-hud-panel="present"`，底部居中，宽 ≤ 1080 设计 px，细边框）。自上而下：**表头** `04 / 11 · 闪电战：法国沦陷 · 1940年6月 · 2 / 3`（章序 · 章名 · 适配器的 `readout` · 本章第几拍；背景章写"Background / 背景"，本章只有一拍就不写最后一段）；**字幕**（大号衬线，28 设计 px，拍开始后约 1.6 s 淡入，`instant` 时直接出现；最多约四行，更长的在卡内滚动）；**两级进度条**：每章一段（等宽，段下写 `BG 01…11`，当前章 signal 橙），当前章再按拍切小段；已读过的章填墨色，当前章填到当前这一拍。点章段 = 那一章第一拍，点小段 = 那一拍（都是带 `aria-label` 的 `<button>`）；手机宽度不画编号。舞台盖一层透明点击层（拖动 / 缩放不再作用于舞台）；点舞台 / 字幕 / → / 空格 = 下一拍，← = 上一拍（捕获阶段，先于宿主的换章键），到最后一拍停住。
- **自动播放**：进度条右边的"Auto-play / 自动播放"勾选框（默认不勾，sessionStorage `atlas:autoplay`）。拍**落定**后（适配器的 `afterCameraSettle`，或 `applyBeat` 返回的 promise，都没有就拍开始后 2.3 s；`instant` 立即）开始计时：这拍有 `audio` 且在播就等播完；Voice 在读就等最后一段真正 `end` 再停 0.6 s，`end` 丢了才用兜底 3 × 预计朗读时间（字数 ÷ 12 字/秒，至少 6 s，每多一段加 3 s）；否则停留 clamp(4 s + 60 ms × 字幕字数, 6 s, 20 s)。期间任何用户输入（点击、按键、滚轮、点进度条）让这一拍停住（勾选框文字变弱），下一拍重新计时。
- **语音**（`lib/speech.ts`，Web Speech API，不用音频文件、不联网）：自动播放旁边的"Voice / 语音"勾选框（默认不勾，sessionStorage `atlas:voice`）。拍落定后读 `captionOf` 给的字幕（`speakableText` 去掉标记和来源上标，数字照写；只读页面语言，不读表头）；这拍有 `audio` 文件则以文件为准、不朗读。**章节开场**：进入一章第一拍（或跳到与上次读过字幕的不是同一章）时，先读章号（`chapterNumberText`：en "Chapter seven"，zh「第七章」；背景章读"Background / 背景"），再读章名，再读字幕——一个队列（`speakSequence`），段间 ~350 ms（`PART_GAP_MS`，定时器，不用 SSML）；字幕开始读时才算已播报。换拍、关 Voice、退出演示一次取消整个队列。**防提前结束**（`speak`）：先 `cancel()`，下一帧（兜底 120 ms）再 `speak()`；每段带令牌，被取代 / 取消的那段的事件一律忽略；`canceled` / `interrupted` 错误不推进；快于每秒 60 字的 `end` 记为 `spurious-end`、不推进；Chrome 系每 10 s `pause()` + `resume()` 保活（Safari / iOS 不做）；回到前台 `resume()`；勾选时静音预热一次（iOS / Safari 要用户手势）。选声 `pickVoice`：en 先 en-GB 再 en-*；zh 先 zh-CN / zh-SG 再其他 zh-*，繁体和粤语最后；本地声音优先；再按偏好名字（zh：Tingting、Meijia、Lili、Xiaoxiao；en：Daniel、Samantha、Aria、Libby）；`utterance.lang` = `zh-CN` / `en-GB`，语速 0.95，音高 1。Chrome 的声音列表异步加载（`voiceschanged`）；没有可用声音时勾选框禁用，title「No voice available / 此设备没有可用的语音」，`setVoice(true)` 返回 false。调试 `__atlas.voiceLog()`（最近 10 段，`part`：`chapter` / `title` / `caption`，`reason`：`end` / `cancelled` / `spurious-end` / `error:<码>`，朗读中为 `null`）；`tests/core/speech.test.ts` 用假的 `speechSynthesis` 测队列与取消语义。
- 界面文字是 `present.*` UI 键，两个引擎共用：`present.title`（标题块小字）、`present.beats` / `present.beat` / `present.beatChapter` / `present.beatBackground`（进度条的无障碍名）、`present.autoplay(Hint)`、`present.voice(Hint|None)`、`present.mode`（模式名 / 控制面板行）、`present.tool`、`present.button` / `present.hint`（TimeScene 底部条的 PRESENT 按钮）。
- **SpaceScene**：`adapter.ts` 的 `SpacePresentationAdapter = PresentationAdapter<SpaceBeatSpec, SpaceSavedState>`，实现在 `space-scene/View.tsx`（见「SpaceScene · 演示」）。

### QA：`pnpm shoot`（`scripts/shoot.ts`）

skill 里 `shoot.py` 的 Playwright / TypeScript 版，驱动 `window.__atlas`。**先 `pnpm build`**（脚本自己在随机端口上起一个只读静态服务器服务 `dist/`，不起 dev server；`dist/` 不存在会直接报错退出）。

```bash
pnpm shoot sample-space                      # 每章 + 每个模式 + 额外预设 + hero-clean -> shots/sample-space/en-paper/*.png
pnpm shoot sample-time --locale zh --theme cinema --size 3840x2160 --suffix _4k
pnpm shoot sample-time --keys --layout       # 键位同步 + 六尺寸 HUD 布局（有 `--keys` / `--layout` / `--beats` 且没给截图名时不截默认图）
pnpm shoot ww2 --beats                       # 每一拍一张 -> shots/ww2/en-paper/beat-<章 id>-<n>.png（n = 本章内第几拍，从 1 起）；脚本核对 state().presentation 与 HUD 隐藏，没落到就失败；这拍要标的 id 里没有标注的（锚点在画面外或对应图层没开，多半是内容 / 镜头问题）逐条打印，不算失败——TimeScene 看 `highlight` 与地图标签 `.ts-co`，SpaceScene 看拍的 `labels`（`.space-leaders` 的 `data-want`）与引线标签 `.space-co[data-id]`（组标注是 `group:<id>`）；`--beats` 末尾还按同一办法列出每章自己 `state.highlight` / `state.labels` 里在章节镜头下没有标注的 id（`chapter highlights`），同样不算失败
pnpm shoot sample-space --perf --json out.json   # 每张图后多等 2 s，打印 calls / triangles / fps / gpu；--json 写全部结果
pnpm shoot sample-time --shots mine.json hero    # 自定义截图表（{name: {chapter?, preset?, modes?, hud?, wait?, js?}}）
```

- `--locale en|zh|all`、`--theme paper|cinema|all`（也接受逗号列表），默认 `en` + `paper`；`shots/` 已 gitignore。主题用 `__atlas.setTheme()` 切换。`--gpu` 改用真 GPU（macOS 走 Metal），默认软件 GL（SwiftShader，与 e2e 相同），fps 数字只在 `--gpu` 下有意义。
- 默认截图：每章一张；首章上每个注册模式各一张（`presentation` 除外；默认开着的模式截"关"，文件名 `mode-<id>-off`）；非章节预设（`orbit` / `reference` / `world` / `theatre` / `presets.json` 里的）各一张；`hero-clean`（HUD 关；SpaceScene 这时是封面镜头，等 0.8 s 的飞行做完）。截图表里 `preset` 和 `modes` 同时写也落在预设镜头上（不用 `js` 延时）。每次截图前把模式、HUD、暂停恢复到加载时的状态（阅读面板、卡片、泳道这些宿主 / 引擎 UI 状态不复位，自定截图表里的 `js` 要自己摆好）。
- `--keys`：对 `keymap()` 逐项按键：预设（`state().preset` + `[data-preset]` 的 `aria-pressed`）、模式（状态翻转 + `[data-mode]` 的 `aria-pressed`，再按一次恢复；按钮在控制面板里，面板收起也照样在 DOM 里；按钮被禁用则跳过）、SPACE、H（HUD 隐藏且"H 显示界面"可见）、ESC（HUD 隐藏后恢复）、← →；最后拖动舞台应变 FREE CAMERA（没有预设亮着），再按预设应收回。
- `--layout`：3840×2160 / 2560×1440 / 1920×1080 / 1280×720 / 900×1200 / 390×844 × 每章 × 额外预设，用 `tests-e2e/hud-layout.ts` 的 `hudLayoutIssues()`（与 `pnpm e2e` 共用同一份逻辑）查 `[data-hud-panel]` 出屏 / 重叠（1 px 容差）/ 横向溢出，并存 `layout-WxH.png`。
- 一直收集 console error / warning、pageerror、同源 4xx/5xx 和任何指向外部主机的请求（违反"无运行时外部请求"）；GPU / SwiftShader 噪音与 smoke.spec.ts 同一过滤。退出码 1 = 有 error / pageerror / 外部请求 / 键位失败 / 布局问题（warning 只打印）。
- 轨道阻尼按帧数衰减，软件 GL 下拖动后要几秒才回写相机，`--keys` 的 FREE CAMERA 检查已按此放宽。

### HUD 缩放与响应式

- `--k = clamp(min(W/1920, H/1080), .6, 1.6)`（手机 = 1），SceneHost 在 resize 时写到 `.atlas-scene`。
- 实际排版用 `--u = --kt px`，`--kt = max(--k, .8)`：HUD 文字不小于 1080p 尺寸的 80%（720p、平板的可读性下限）。
- **HUD 字号刻度**（设计像素，k = 1；`tokens.css` 的 `--hud-font-*`，面向小学生的笔记本屏）：最小 10 px（`label` 10.4 / SVG 里的 mono 刻度 10）、状态行与键位提示 ≥ 10.5（`status` 10.8）、按钮 11.1、面板标题与正文 11.3、标题块 30。写新 HUD 文字用这些 token，不要再写 < 10 的 `calc(N * var(--u))`；viewBox 里的 SVG 文字（部件链路卡）按渲染比例折算，保证渲染后 ≥ 10 px。`--kb = max(1, --k)`：触控控件和阅读正文只放大不缩小（4K 时 `bottomBar` / `stageOverlay` 用 `zoom: var(--kb)` 放大）。
- ≥1440 完整；1080 完整略小；高度 ≤ 820（720p）底部三面板折成一行标签页（点开一块）；< 1024 InfoPanel 变底部抽屉（不能收成竖条）；VIEW 组放不下就折成多行（没有下拉菜单）；< 760（手机）隐藏示意卡、三面板、perf、引线、规格表、键位提示和 VIEW 组，章节轨折成编号芯片条；标了 `phone: false` 的模式（TimeScene G / P、SpaceScene R）在控制面板里不画行。
- 任何尺寸不得重叠、不得横向溢出：`tests-e2e/hud-layout.ts` 的 `hudLayoutIssues()` 在 3840×2160 / 2560×1440 / 1920×1080 / 1280×720 / 900×1200 / 390×844 × 每章 × 中英检查所有可见 `[data-hud-panel]`（`tests-e2e/hud.spec.ts`，`pnpm e2e` 的一部分）。

### 主题

- token 在 `src/theme/tokens.css`（`paper` = 技术图版标准实现 / `cinema` = dark plate）。功能色每个只表达一个含义：`--cold` `--hot` `--loop` `--neutral` `--signal` `--xray` `--cut`；墨与线：`--ink` `--ink-2` `--ink-3` `--hair` `--line`；旧名（`--accent-*`、`--bg`、`--surface`、`--border`…）映射到它们上。HUD 元素圆角 `--radius-hud`（1px），阅读面板 6px。
- 字体：`IBM Plex Sans Condensed`（`--font-hud`，400/500/600，latin + latin-ext）与 `IBM Plex Mono`（`--font-mono`，400/500，latin）由 `src/styles/fonts.css` 自托管（只引 woff2，构建进 `/_astro/`）；中文回退系统字体；孩子读的正文保留 `--font-serif`。组件里只用 `var(--x)` 或 Tailwind 映射类（`bg-surface text-ink-muted border-border`），不写死颜色。
- 优先级：用户全局覆盖（localStorage `atlas:theme`）> 场景主题（URL `theme=` 或章节累积的 `state.theme`）> `topic.yaml theme` > `paper`。首帧前由 BaseLayout 内联脚本按同一规则设置 `data-theme`，无闪烁。
- 数据里的颜色写 `token:accent-1` / `#hex`；DOM/SVG 用 `resolveColorRef(ref)`（得到 `var(--accent-1)`，随主题自动变），canvas/WebGL 用 `resolveColorRef(ref, readThemeTokens())` 取实值，并在主题切换后重读。
- MapLibre：`buildMapStyle({ sources: { land, water?, rivers? } })` 从当前 token 生成底图 style（只有 GeoJSON source，无 glyphs/sprite/瓦片）。二期加 symbol 标签需要本地 glyphs，放 `public/fonts/`。主题切换时重建 style（监听 `<html data-theme>` 变化即可）。

### 年级、索引页与偏好

- 站点不展示年级：没有年级选择器、章节轨没有年级芯片、规格表没有年级行；所有章节始终可进入，←→ 和上下章按钮逐章走。`level` / `levels` 只是 `topic.yaml` / 章节 / 零件上可选的规划元数据（schema 接受缺省，不渲染）。
- 索引页**只列 `status: published` 的主题**，以固定六类（science / math / history / geography / biology / computer）为主入口并按类筛选；类别计数只数已发布主题，没有已发布主题的类别置灰标“即将推出”。卡片标签只有学科和类型（`mode`：`time` → 时间 / Time，`space` → 空间 / Space，`both` 两个都有），再加章数。
- 外观与语言是两个 hairline 下拉菜单（`widgets/Dropdown.tsx`，`hud-btn` 语法）：“LOOK ▾”（Auto / Paper / Cinema）、“EN ▾ / 中文 ▾”（English / 中文）。索引页和主题 HUD 共用；键盘可用（Enter/空格/↓ 打开，↑↓ Home End 移动，Esc 或点外面关闭），点击区 ≥ 44px。语言切换保留路径、query 和 hash。
- 读写偏好走 `src/lib/prefs.ts` 的 hook（`useThemeOverride`；语言偏好用 `setSavedLocale`；阅读面板收起用 `getReaderExpanded / setReaderExpanded`，sessionStorage），不要直接碰 storage；场景状态不进 storage，只进 URL。

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
View.tsx              组装：GeoStage + 底部条 + 参与卡 + 控制面板 + 事件 / 实体详情；store ↔ 播放头同步；控件注册（地理预设、模式、演示节拍）
stages/geo/GeoStage.tsx    React 壳，懒加载 controller（MapLibre 在这个 chunk 里），提供引线标签层、比例尺和宿主 leaders svg
stages/geo/controller.ts   命令式驱动 MapLibre：图层、斜线填充、流线、事件环、领土名称、国名、比例尺、REFERENCE、镜头、主题
stages/geo/territory.ts    领土名称（谁占着哪里，跟关键帧淡入淡出、按屏幕面积分级、避让）；纯算法在 lib/territory.ts（polylabel、分级、配对、贪心放置，有单测）
stages/geo/leaders.ts      引线标注（两列、避让、逐帧投影）
timeline/Timeline.tsx      唯一的底部条（bottomBar）：泳道开关 + PRESENT（演示）· 标尺 · 状态串，下方可展开三条泳道
hud/HudPanels.tsx          card 参与与面积条带卡（可展开、行可点）、perf 读数
hud/shared.tsx             useSize / usePlayheadT / useUnit / 斜线图案 / 章节时间窗
EventInspector.tsx         点事件 → inspector 插槽（Counter / 双方 CounterVersus；细看折叠块；来源上标；伤亡始终显示）
EntityInspector.tsx        点参与卡的一行 → inspector 插槽（名称、阵营时段、加入 / 退出、当前面积）
lib/time.ts lib/format.ts lib/geo.ts lib/model.ts lib/frame.ts lib/playhead.ts lib/ticks.ts lib/timeScale.ts lib/stats.ts lib/bloc.ts lib/control.ts lib/bandRows.ts   纯函数，单测在 tests/time-scene/
colors.ts  time-scene.css
```

### 作者怎么写数据

四个文件放 `data/`（schema 见 docs/03 §A 与 `schema.ts`）：

| 文件 | 要点 |
|---|---|
| `entities.json` | `id, name, bloc, joined, left?, color?`。`bloc` 是 `axis/allied/neutral` 之一（引擎只有这三个值，**显示名按主题改**：`topic.yaml` 可选 `blocLabels: { axis?, allied?, neutral?, out? }`，每项 `{ en, zh }`，`out` = 图例的“已退出战争”；图例、实体详情、实体引线说明都先读它，缺省回退全站 `time.bloc.*`，解析在 `lib/blocLabels.ts` 的 `blocLabel()`；一战：`allied` = 协约国、`axis` = 同盟国；实体不能随时间改名，要换名写在控制区 `label` 里），或**换阵营**时按时间排的数组 `[{ "bloc": "axis", "from": "1940-06-10", "to": "1943-10-13" }, { "bloc": "allied", "from": "1943-10-13" }]`（`[from, to)`，只有最后一段可省 `to`，段不能重叠；第一段之前按第一段算，空档里按刚结束的那段算，`sideAt(entity, t)` 在 `lib/bloc.ts`）。**`joined` 之前和 `left` 之后一律按 `neutral`（`blocAt`）**：地图填充、participation、地名、右上卡面积带、图例的“已退出战争”项（`time.bloc.out`）都用它；事件 / 行动的阵营色仍用 `sideAt`；右上卡行数多时只画 `t` 时在战的实体（有面积的在前，按 `t` 时面积；其余按 `joined`），不在战的进“+N others”。颜色默认取 `t` 时所在阵营的 token：地图控制区、participation、地名、实体引线说明、右上卡的面积带都跟 `t` 走，卡上的参与线按段分色；行动和事件用它们开始时的阵营色；图例对换阵营的实体每个阵营列一行。`color: "token:accent-3"` 或 `#hex` 覆盖（不随阵营变）。`joined` 驱动 participation 图层"点亮"和右上卡的参与线。 |
| `control.json` | `keyframes[]`，按时间严格升序，`properties.holder` = 实体 id，同一实体可有多个面（或 MultiPolygon）。**两种写法任选**：① GeoJSON：`{ "keyframes": [{ "t", "features": FeatureCollection }] }`（小主题、手写，如 sample-time）；② TopoJSON：`{ "topology": Topology, "keyframes": [{ "t", "object": "<topology.objects 里的名字>" }] }`——所有关键帧共用一份拓扑（不变的海岸、边界只存一次，量化 + 差分编码），大主题（ww2 的 12 帧）用它。拓扑只做宽松校验（`type: "Topology"`、`arcs` 数组、`objects` 记录、`transform` 可选），解码后每个要素按普通控制区要素再校验（`holder` 存在于 entities、环闭合、经纬度范围）。引擎在建 `TimeModel` 时用 `topojson-client` 的 `feature()` 把每帧解成 FeatureCollection（`lib/control.ts` 的 `decodeControl`，顺手把环改回 RFC 7946 绕向，MapLibre 靠绕向分外环和洞），之后的帧、面积、渲染全都不知道有两种写法。ww2 的 `control.json` 由管线生成（见「Geo pipeline」），不手写。面积（右上卡）在客户端按球面公式算，不用写。 |
| `movements.json` | `from/to` 时间区间 + LineString `path`（从起点画到终点）。`strength`（可选，0 或缺省 = 未知，不显示“N 人”）决定线宽（1–3 px，相对全主题最大值）。**过日界线**：schema 把经度限在 -180..180，作者照实写跳变即可（`… [179.5, 38], [-175, 33] …`）；建 `TimeModel` 时 `unwrapPathCentred`（`lib/geo.ts`，思路同 `unwrapRing`）把相邻点经度差超过 180° 的后续点整体 ±360°，让线走近路（MapLibre 会把 >180 的经度画进邻近世界副本），再把整条路径平移 ∓360° 使其中心落在 -180..180。之后切线（`sliceLine`）、箭头头部、引线锚点、剧场镜头的包围盒（`model.bounds`）全部用 `MovementN.path`（展开后的坐标），不要再读 `movement.path.coordinates`。珍珠港航线（147.7°E 44.9°N → 158°W 23°N）展开后经度 147.7 → 202，长约 5,800 km，不是绕地球一圈的 30,000 km。可选 `linger`（`timePoint`，须晚于 `to`、同一时间标尺）：默认 `to` 之后整条线立刻消失；写了 `linger`，`to` 到 `linger` 之间画完成的整条线（40% 不透明，箭头停在终点），过了 `linger` 在约 2% 时间跨度内淡出。lingering 的线不计入状态串的 MOVEMENTS。 |
| `events.json` | `t`、可选 `until`、`at`、`kind`、`importance`（**3 最重要 = 点最大**，1 最小）、`sides/forces/casualties/result`。`kind`：`battle`、`landing`（这两种必须有 `sides` + `result`）、`bombing`（必须有 `sides`）、`surrender`、`political`、`massacre`、`siege`、`evacuation`、`liberation`、`atrocity`、`disaster`（流感、饥荒、击沉客轮；不分阵营）、`site`（`bombing` 以外新增的各种 `sides`/`result` 都可选）。可选 `detail: { en, zh }`（inspector 里默认收起的"细看 / More"）与 `sources: ["S1", "S7"]`（`sources.json` 的编号，inspector 摘要后显示 mono 上标，点开来源弹层）。`sensitive` 只是可选元数据，不影响显示。 |
| `presets.json`（可选） | `{ "presets": [{ "id": "singapore-island", "label": { "en": "Singapore", "zh": "新加坡" }, "camera": { "center": [103.82, 1.35], "zoom": 9.2 } }] }`。注册成镜头预设，排在 `world` / `theatre` 之后（`world` = 1、`theatre` = 2，这些从 3 起编号，第 10 个是 0，再往后只有按钮）；`label` 是按钮文字（一两个词）；正文 `<FlyTo preset>` 用这些 id。VIEW 组只放地理预设，章节不是预设。 |
| `sources.json`（可选） | 见上文"加一个主题"第 4 步。 |
| `glossary.json`（可选） | 名词表，见「名词表」。 |

**`site` 事件**是静态点位（监狱、纪念碑、建筑）：`t` 照写但不参与时间——不进时间轴范围、不进泳道和统计、不脉冲；只在 `sites` 图层打开时显示（小空心菱形 + 中心点），点击同样打开 inspector（眉题 `P-01`），高亮时出引线标注。

章节 `state`：`time`（ISO 三种精度或 `{ ma }`）、`camera`、`layers`、`highlight`（实体/行动/事件 id）、`theme`、`note`（只在背景章：阅读说明）、`summary`（`{ en, zh }`，阅读面板标题下的一句话，也是默认演示字幕）、`question` / `answer`（`{ en, zh }`；没有 `summary` 时阅读面板头部显示 `question`；`answer` 必须配 `question`，目前不渲染），以及可选的 `beats`（演示节拍，见下）。章节节点在时间轴上的位置 = 该章累积目标的 `t`；**章节顺序必须等于时间顺序**（`tests/schemas.test.ts` 对 ww2 有检查）。

演示节拍（`state.beats`，可选，加法）：

```yaml
beats:
  - t: "1942-02-09"                                  # 可选：这一拍的时间（缓动过去）
    camera: { center: [103.74, 1.4], zoom: 9.6 }    # 可选：镜头（飞过去）
    layers: [base, control, movements, battles]     # 可选
    highlight: [johor-crossing, bukit-timah]        # 可选：id 照常校验
    caption: { en: "Night of 8 February 1942: …", zh: "1942 年 2 月 8 日夜：…" }   # 必填
    audio: /audio/ww2/ch07-3.mp3                     # 预留：public/ 下的路径，进入这一拍时播放
```

每拍 = 本章累积目标 ⊕ 拍里写的字段。没写 `beats` 的章 = 一拍（本章状态，字幕 = `summary`，没有就 `question`，再没有就章名）。ww2 的第 07 章（哥打巴鲁 → 半岛南下 → 渡柔佛海峡 → 投降）和第 11 章（广岛 → 满洲 → 东京湾 → 新加坡受降）各写了四拍。

### 图层（`layers` 里的 id）与地图语法（docs/08 §5）

| id | 渲染 | 开关 |
|---|---|---|
| `base` | 陆地纸色 `--land`、海洋 `--water`（背景）、海岸 hairline（`buildMapStyle`，`public/geo/land-50m.json`；东南亚 zoom ≥ 7 叠 `land-10m-sea.json`，见「Geo pipeline」） | 永远开 |
| 经纬网 | 10° 经纬线，代码生成（不是文件），hairline，普通 .22 / 赤道与本初子午线 .4 | `graticule` 模式（G），默认开，不进 URL |
| `control` | 每个关键帧三层：阵营色淡底（.28）+ 45° 斜线 `fill-pattern`（每个实体一张 canvas 图，按 pixelRatio `addImage`，换主题 `updateImage`）+ **边界线**。边界线只画**内陆分界**：同一关键帧里两个**不同 holder** 的要素共用的弧（TopoJSON `mesh(topology, object, (a, b) => a !== b && a.properties.holder !== b.properties.holder)`，`lib/control.ts` 的 `frontierOf`，载入时每帧算一次放进模型 `keyframe.frontier`），一条 `--line` token 色的 0.8 px hairline；海岸**不画**控制边（海岸只有 `base` 那一条 `land-edge`），同一 holder 的两个要素之间的接缝也不画。高亮的 holder 因为没有自己的描边，改成淡底加深（×1.7）。纯 GeoJSON 形态（sample-time）没有拓扑，退回给每个多边形按阵营色描边（高亮 2.8 px）。前帧/后帧两个 source 交叉淡化：区间最后 30% 内前帧 1→0.4、后帧 0→1，淡底、斜线、边界线同一个系数。两个 source 设 `tolerance: 0.05`（MapLibre 默认的瓦片简化 0.375 在 zoom 0–3 会把环切出楔形：加拿大 BC、巴西、意大利） | 可关 |
| `borders` | 今天的**内陆**国界 hairline（ink .4，0.4–0.9 px 随缩放）：`borders-50m.json` 是国家间共用弧的 TopoJSON mesh（`mesh(countries, (a, b) => a !== b)`，无海岸线），不再描国家多边形的轮廓；外加国名（`countries-50m.json`）。两个文件第一次打开时才下载。**默认关**（引擎 `defaults` 的 `layers` 不含它；章节 `state.layers` 写了 `borders` 才开） | B 模式 / 图层开关 |
| `movements` | 工程流线：已走过的路径一条实线（.3）+ 一条步进虚线（约 12 fps 流动），宽 1–3 px；头部 12 px 小箭头（HTML marker）。有 `linger` 的行动结束后整条线连同箭头以 40% 不透明度保留到 `linger`，再淡出（帧里的 `MovementFrame.opacity` / `lingering`，数据驱动的 `line-opacity`）。paper 无发光；dark plate 只在箭头头部有 ≤ .35 的微光（`--glow`） | F 模式（`flow`）/ 图层开关 |
| `battles` | 已发生的事件：空心 hairline 圆环 + 实心点（按 importance 定大小），进入 `[t, until]` 时圆环用进攻方颜色、实线；高亮用 signal 色；进入时放一个扩散 hairline 环（~900 ms）。点击（44 px 命中框）→ 详情 + `highlight`。按 `kind`：`massacre` / `atrocity` 画空心方块（墨色 hairline，HTML marker；圆仍在 GL 层里透明地当点击目标），脉冲也是方的；`disaster` 画空心三角（墨色 hairline，HTML marker 内嵌 SVG；圆同样是透明的点击目标）；`siege` 圆外加一圈虚线环；`evacuation` / `liberation` 圆用冷色 `--cold`。图例相应出"Massacre / atrocity · 屠杀 / 暴行"（方块）、"Disaster · 灾难"（三角）、"Siege · 围城"（虚线环） | 可关 |
| `participation` | 实体在当前关键帧的面：加入后描边，加入那一刻闪亮（时长 = 全程 4%） | 默认关 |
| `sites` | `site` 事件：小空心菱形 + 中心点（HTML marker），不随时间变化、不脉冲；高亮 signal 色。章节 `layers` 可含 `sites`；只有主题里有 `site` 事件时图层面板才出这个开关 | 默认关 |

- **领土名称**（`stages/geo/territory.ts` + `lib/territory.ts`，模式 `territory`，键 N，控制面板 LAYERS 第二行"领土名称"，默认开；`control` 图层关时不画）：地图上的主文字，写**`t` 时谁占着这块**。
  - 每个控制区要素一条：文字 = `properties.label`（去掉末尾括号里的说明：`Denmark (German-occupied)` → `DENMARK`，`丹麦（德国占领）` → `丹麦`），没有就用 holder 实体的 `name`。博物馆说明牌式：EN 大写宽字距一行（600 字重），中文在下，墨色（dark plate 是浅墨，`--ink`），无框，`--land` 色的淡光晕保证压在斜线上也能读。
  - 锚点 = 要素里**在画面内的最大多边形**的不可达极点（polylabel，Mercator 坐标下算，精度 = 包围盒长边 / 150，探测上限 6000 次；面积 < 0.1 单位²的小岛用形心）。每个要素先算最大的和最多 5 个 ≥ 最大者 2% 的多边形（帝国本土在最大块出画时也有名字），按关键帧要素惰性计算并缓存（ww2 全部 12 帧约 1.4 ms / 要素）。数值存在 Float64Array 里（Chromium 153 下普通对象的 double 字段被看到串值，见 `LabelGeometry` 注释）。
  - 分级：按该多边形的**屏幕面积**分三档——≥ 140,000 px² 大（EN 14 / 中文 13 设计 px）、≥ 40,000 中（11.5）、≥ 9,000 小（10），更小不画；还要**放得下**：标签宽 ≤ 内切圆直径 × 1.6、高 ≤ 直径 × 1.1，放不下就降一档，三档都不行就不画。尺寸用一个隐藏的同款元素量一次后缓存（resize / 字体加载后清）。
  - 密度与避让：最多 24 个，按屏幕面积从大到小贪心：整块在舞台内（4 px 边距），不压引线标注牌（**引线标注优先**）、不压 HUD 面板（引线栏量出来的 `[data-hud-panel]`；演示中只有字幕卡和标题块）、彼此留 6 px，同名 260 px 内只留一个；极点那里被占了就在多边形内另找位置（½、1、1½、2、3 倍内切半径 × 8 个方向，先横向，要求那里离边界仍够标签半宽）。在 `moveend`、`t` 变化（关键帧对、交叉淡化每 5%）、高亮 / 引线牌变化、HUD 带变化（resize、H、每秒兜底）时重新放置；镜头飞行中只跟着投影移动。
  - 关键帧交叉淡化：与控制区同一个窗口（区间最后 30%），出帧的名字 1 → 0、入帧的 0 → 1；同一 holder、同一文字，锚点相距 < 40 px **或**两个锚点各在对方多边形内（同一块地改了形状），就只留一个标签、位置在两帧锚点之间按 blend 线性滑过去（`pairCrossfade`）。**同一 holder 但文字不同**（ww1 K8 “Russia” → K9 “Soviet Russia”）且锚点相距 < 120 px 的，也配成一个：同样滑过去，文字在交叉淡化的 50 % 处换（`textAtBlend`），不再同时出两条；同文字的配对优先，各标签只配一次。
  - 高亮的实体有引线标注，它没有自带 `label` 的要素就不再出领土名称。演示中领土名称照常显示（属于地图）；L 开关、HUD 隐藏都不影响它，只有 N。
- 国名（`countries-50m.json` 的 `name`，HTML marker，无 glyphs）：次要一类，只在 borders 开、zoom ≥ 5 时出，离任何领土名称中心 60 px 内的不出，最多 8 个。贪心避让：按优先级用真实屏幕矩形（4 px 间隙）检测，**先给引线标注和领土名称让位**，再互相避让（`data-collided`）。演示中不画。
- 比例尺：舞台左下、底部面板之上（被左列挡住就挪到左列右侧），按当前缩放和中心纬度取 1/2/5×10ⁿ km 的整数长度，半实半空 hairline 条。HUD 隐藏时跟着隐藏；手机不显示。
- 底图数据跨 180° 经线的环已在构建时展开（见"底图数据"），不会再出现横贯全图的直线。

### 引线标注（`leaders.ts`，docs/08 §5 + skill master-spec J）

- 谁有标注：`highlight` 里的 id（事件 / 行动 / 实体）+ 处在 `[t, until]` 窗口里的事件，最多 8 条，高亮优先。高亮的实体不再出区域名，改出引线标注。
- 内容：EN 粗体大写 + 中文 + 一行说明（mono 日期 + 摘要，单行省略）。行动的说明是"陆路 · 12,000 人"，实体是"阵营 · 某日加入"。
- 锚点：事件 = `at`；行动 = 已画部分的中点（不压箭头）；实体 = 当前关键帧**在画面内的最大面**的形心（与领土名称同一规则：殖民帝国的锚点落在宗主国本土而不是最大的殖民地；画面里一个面都没有时退回最大面，`areaLabelPoint(polys, onScreen)`）。`map.project` 投影。
- 布局：量出没被 `[data-hud-panel]` 占住的舞台带（左列右缘、右列左缘、底部 dock 上缘）。**分列**：锚点在带的左三分之一 → 左列，右三分之一 → 右列，中间三分之一 → 离得近的那一列（40 px 滞回，时间推进时不来回跳）。**列的位置**：面向地图的那条边（左列右缘 / 右列左缘）在带边缘有面板挡着时贴着带边（阅读面板 / 章节轨旁），带一直伸到舞台边（HUD 隐藏、演示）时不超过舞台宽的 22 % / 78 %，并在这个范围内再往锚点靠（离最靠外的锚点留 2 个短横的距离，不越过锚点）——引线很少超过舞台宽的 35 %。锚点压在自己那一列底下（贴着带边）时，只有对面那列的引线短于舞台宽 35 % 才换过去，否则标签放在锚点正下方。列内按投影 y 排序，尽量与锚点齐平，再做最小间距避让，夹在带内；仍与任何面板相交的标签隐藏。带太窄时退成一列，再窄全隐藏。标签最大宽度 = 列宽（210 设计 px 封顶）。
- 引线：标签边 → 14 px 水平短线 → 直线到锚点，锚点是空心小圆；高亮的引线用 signal 色。线画进宿主 `leaders` svg（随 HUD 淡出）。
- 性能：只在地图 `render` 事件里重投影，只写 `transform` / `opacity` / SVG 属性；尺寸和面板矩形在 resize（ResizeObserver 盯面板）、换内容时和每秒一次量。
- 开关：宿主 LABELS（L）→ `data-labels="off"` 隐藏标注和国名（领土名称不受影响，它走 N）；HUD 隐藏时隐藏；手机不显示。锚点出屏时标签和线淡出。
- 事件标签是按钮：点它 = 打开 inspector + `highlight`（点完自动失焦，键盘照常）。

### 时间

- `toNumber(t)`：ISO → 十进制年（取时段起点：`1942-02` = 1942 年 2 月 1 日）；`{ ma }` → 负的年数（`{ ma: 200 }` = -2e8）。`fromNumber(n, scale)` 反向，日期按日向下取整，地质时间保留 2 位小数 Ma。
- 时间轴范围 = 关键帧、事件（含 `until`）、行动起止、章节时间的最小/最大值。
- store 里的 `t` 是日精度 TimePoint（进 URL）；地图按连续的"播放头"渲染。**章节自动跑**：用户选章（章节轨、时间轴节点、← →、Next / Back；不含深链、不含演示）时，镜头照常飞，同时播放头从本章**跨度起点**用 5 s easeInOut 跑到本章 `state.time`（行动逐步推进、事件按顺序脉冲；store 的 `t` 从一开始就是章节时间，URL 不抖）。跨度起点 = 本章第一拍的 `t`，没有就取上一章的时间，再没有就取数据最小值（每个候选都要严格早于本章时间，否则取下一个；`View.tsx` 的 `chapterSpan`）。跑的时候状态行有 `RUNNING`，`__atlas.state().running === true`，结束后播放头**精确**等于章节时间（`playhead.tweenTo` 最后一帧直接落在目标值）。再点同一章 = 重跑。**随时可以拖播放头**：按下播放头（或点标尺）就取消自动跑，松手时 `t` 留在原处；Shift+←→ 等任何改 `t` 的键同样取消。非用户选章的过渡（深链、演示节拍、演示结束恢复、`instant` 跳章）仍是直接跳 / 1.6 s 缓动。拖动 / Shift+←→ 直接移动播放头并 `patch({ t })`。没有自由播放（时间只随章节自动跑、演示节拍和拖动走）。
- 读数格式 `formatTime(t, locale)`：`15 Feb 1942` / `1942年2月15日`；`200 Ma` / `2亿年前`、`6600万年前`。跨度 >12 年时读数降到月，>100 年降到年。HUD 里的 mono 读数用 `formatReadout`（英文大写：`15 FEB 1942`）。
- 刻度 `ruleTicks(min, max, scale, maxMajors, locale)`（`lib/ticks.ts`）：按跨度和宽度自适应，取主刻度数 ≤ `maxMajors` 的最细一档——几个月：主 = 月（1 月写年份）、次 = 每月 8/15/22 日；几年：主 = 年、次 = 月；更长：5/10/25/50/100… 年；地质：0.1–1000 Ma 档（如 10 Ma / 1 Ma），标尺右端写单位 `MA` / `百万年前`。

### 底部条（`bottomBar`，TimeScene 唯一的底部块）

TimeScene 不注册 `panel01–03`，宿主因此不画底部三面板带；原来三块的内容并进这一条：

```
[▾][PRESENT]  ──┼──01──┼──02─03──…──◆──07─08──…──11──┼──   32 / 34 · 3 BATTLES · 1 MOVEMENT · K8→K9 23 %
 KEYFRAMES          ◇      ◇   ◇       ◇  …                      （泳道，默认收起，点 ▾ 展开约 48 px）
 MOVEMENTS          ▭▭  ▭▭▭▭ …
 EVENTS             ○ ○○──○ …
```

- 左：泳道开关（小 chevron，`aria-expanded`）、PRESENT / 演示（18 px hairline `hud-btn`，触屏 44 px 命中；`aria-pressed` = 演示中，按下 = 模式 `presentation`，同 P 键）。原来的播放 / 暂停和 ×1 ×2 ×4 已去掉（Gavin 2026-10-09），时间轴不再自己跑。
- 中：工程标尺：主刻度（墨色、带 mono 标签）、次刻度（弱墨）、关键帧小空心菱形、已走过的部分加粗；章节节点是坐在标尺上的编号 hairline 圆（当前章 signal 实心）；播放头是 12 px 的 signal 圆点加一条 hairline 竖线（压在章节节点**下面**，停在节点上时只露出竖线），日期写在线上方（贴边时夹在标尺内）；它的 44 px 命中区（`.ts-rule__grab`，`role="slider"`，唯一的 Tab 停靠点，`cursor: ew-resize`，`touch-action: none`）压在节点**上面**，所以停在节点上也抓得住——不拖动地点它（位移 < 3 px）等于点了离指针 22 px 内最近的节点（重跑那一章）。抓住播放头拖动不会跳到指针（保持抓取偏移），点标尺其他地方则跳过去。鼠标和触屏都走 pointer events。
- 右：状态串（mono）：参战方 `已加入 / 总数` · 进行中的战斗 · 进行中的行动 · 控制区关键帧 `K8→K9 23 %`；每段的 `title` 写双语全称（Participants / 参与方 …）。都是数据统计，不标 SIM。条窄于 860 px（容器查询）时状态串换到标尺下面一行。
- 泳道（默认收起）：KEYFRAMES（菱形）、MOVEMENTS（起止条，重叠自动分行）、EVENTS（点 + 进行窗口），当前章节窗口淡 signal 底，`t` 一条 signal 竖线；横坐标与标尺完全一致。
- 行为：拖动播放头或标尺 = 连续时间不换章（并取消章节自动跑）；点节点 = 换章并自动跑（不再展开阅读面板，见「阅读面板收起」）；Shift+← → 全局微调；焦点在播放头上时 ← → ↑ ↓ 微调一格、PageUp/PageDown 十格、Home/End 跳到**当前章跨度**的两端（自动跑起点 / 章节时间）。换章只用页面级 ← →、章节轨和节点。

**横坐标：最小间距混合映射**（`lib/timeScale.ts`，单测 `tests/time-scene/timeScale.test.ts`）

```
x(t)    = α · lin(t) + (1 − α) · chap(t)
lin(t)  = (t − min) / span · W                                    线性时间
chap(t) = 过结点 {min, 各章时间…, max}（去重、排序）的分段线性，
          结点 k 在 k · W / (K − 1)                                章节等距
```

α ∈ [0, 1] 取**最大**的、能让每对相邻（不同时间的）章节节点相距 ≥ 56 px 的值。两项在相邻结点之间都是线性的，且章节项等距（Δc = W / (K − 1)），所以对线性间距 Δl 不够的那一对，约束 α·Δl + (1 − α)·Δc ≥ 56 给出 α ≤ (Δc − 56) / (Δc − Δl)，取所有这类上界的最小值（都够时 α = 1）；连等距都不到 56 px（Δc < 56，窄屏）时取 α = 0（等距，已是最好）。宽度变化（ResizeObserver）时重算。x 严格单调、结点间线性，所以反函数（指针 → 时间，拖动用）逐段精确。

- 刻度画在真实日期上、经映射落位：被压缩的年代刻度更密；主刻度标签彼此小于 34 px 的跳过标签，次刻度彼此小于 3 px 的不画（`thinTicks`）。刻度档位仍按 `W / 72` 个主刻度选（`ruleTicks`）。
- 用同一映射的：标尺刻度、章节节点、关键帧菱形、播放头、拖动（反函数）、泳道、参与卡（卡片用标尺拟合出的 α，套在自己的宽度上）。
- 标尺的 α 写在 `.ts-rule__rail[data-alpha]` 上，便于测试和量。ww2（1931-09 → 1945-09，11 章，第 07 / 08 章只差 3 天）：第 07 章、阅读面板展开时实测：1920×1080 标尺 885 px，α = 0.242（最近一对正好 56 px）；1280×720 标尺 611 px、900×1200 标尺 631 px，等距也只有 51 / 53 px，α = 0（等距）。窗口宽度不是标尺宽度：标尺还要让出阅读面板、左侧按钮和状态串；收起阅读面板标尺变宽，α 随之变大。

### HUD 控件与内容（docs/08 §2、§3）

注册（`View.tsx` 的 `useSceneControls`）：

| 项 | 内容 |
|---|---|
| 预设 | `world`（center [20, 10]，zoom 1.4）+ `theatre`（整片区域：地图 `cameraForBounds` 套住全部数据；地图未就绪时按包围盒估算）+ `presets.json` 里的预设（按钮文字 = `label`，旁边小字写数字键）。数字键 1–9，第 10 个是 0，再往后只有按钮、不写数字。没有章节预设 |
| 模式 | `flow`（F，= movements 图层，状态 `FLOW`）· `borders`（B，= borders 图层）· `graticule`（G，引擎本地状态）· `territory`（N，领土名称，引擎本地状态，默认开）· `reference`（R）· `presentation`（P，状态 `PRESENTATION 08/17`；底部条也有 PRESENT 按钮）· 宿主 `labels`（L） |
| 控制面板 | `stageOverlay` 里的「图层和图例」卡（舞台 ≥ 720 px 宽时默认展开）：**LAYERS** 控制区 / 领土名称（N）/ 国界（B）/ 经纬网（G）/ 行动路线（F）/ 事件 / 何时加入 / 地点（有 `site` 事件才出）/ 标注（L）；**TOOLS** 与上一关键帧对照（R）/ 演示（P）/ 名词（有 `glossary.json` 才出）/ 隐藏界面（H）；**KEY** 图例 |
| `time` | 章节自动跑：`running()` / `now()`，供 `__atlas.state().running / playhead`；状态行在跑时写 `RUNNING` |
| `pause` | 不注册（没有自由播放）：状态行没有 PAUSED，键位表没有 SPACE，`__atlas.setPaused` 返回 false |
| `status` | `2000-03-11`（与 `FLOW`、`REFERENCE` 等模式段一起出现在状态行） |
| `specRows` | ENTITIES / KEYFRAMES / EVENTS / MOVEMENTS 计数（mono） |
| `stats()` | `{ features, zoom, fps }`：features = 当前可见数据要素 + 经纬线 + 国界（开时）；fps = 页面 rAF 帧率 |
| `cardToggle` | 参与卡展开 / 收起 |
| `beats` | `usePresentation` 的 `controls`（节拍列表与跳转、自动播放、语音、voiceLog） |
| `escape` | 依次：退出 PRESENTATION → 退出 REFERENCE → 收起展开的参与卡（连同选中的实体）→ 取消选中实体 → 关闭事件详情 → 清空 highlight（来源弹层开着时 ESC 先关弹层，由弹层自己处理） |

- **REFERENCE（R）**：版图对照用"叠加"实现（不分屏）：当前主导关键帧照常，相邻关键帧（前一帧；当前是第一帧时取后一帧）的边界以墨色虚线叠上，2 s 淡入（`instant` 时直接到位）；舞台顶部横幅写"实线 K2 … · 虚线 K1 …"。再按恢复。少于两个关键帧时禁用；演示中禁用。
- **PRESENTATION（P）**：core 演示系统（见「演示系统（core）」），TimeScene 的适配器在 `View.tsx`：`beatsOf` = 章的 `state.beats`；一拍 = 本章累积目标 ⊕ 拍里的 `t` / `camera` / `layers` / `highlight`，用 `applyState` 飞镜头（2.2 s）、缓动 `t`（1.6 s；不触发章节自动跑）；`saveState` / `restoreState` = store 快照 / `applyState` 恢复（章节、镜头、`t`、图层、高亮）；`onEnter` 退出 REFERENCE、清选中的事件 / 实体、收起参与卡；字幕卡表头的 `readout` = 播放头日期（同时间轴读数）；没有 `afterCameraSettle`（固定 2.3 s，等于镜头飞行加字幕淡入）。演示中 REFERENCE 禁用；底部条 PRESENT 按钮 = P。**引线标注**：HUD 隐藏时地图上仍画这拍 `highlight`（没写就是本章的）里的事件 / 行动 / 实体的引线标注（上限 6 个，字号比平时大 20%，遵守 L 开关；要对应图层开着），**只有这些**——别的事件标注、地名、实体名在演示里都不画（控制器 `setPresentation(true)`，样式挂在 `.ts-stage[data-presenting]`）；领土名称照常显示。字幕卡和标题块算引线栏的障碍，标注让开它们；演示中引线栏**只**把这两块当障碍（HUD 面板淡出时 `visibility` 还留着，不能算），并且进入演示、换拍（字幕卡出现 / 变高，`refreshLabels`）和镜头落定（`moveend`）时立刻重新量一次，不等 1 s 的兜底定时器。
- 插槽内容（`hud/HudPanels.tsx`，SVG 按卡片实际像素画，字号走 `--u`）：
  - `card` PARTICIPATION AND AREA（横坐标用标尺的映射）：每个实体一条带——参与线（joined → left，起点小空心圆），关键帧间线性插值的近似控制面积（球面面积，斜线 + 淡底），行首写 EN 名 / 中文 / 当前 `≈面积 KM²`；当前章节窗口淡 signal 底，`t` 一条 signal 竖线，底部自适应刻度。**行数规则**（`lib/bandRows.ts` 的 `planBandRows`，有单测）：每行至少 25 设计 px（EN 名 + 中文两行不互相压）；全部放得下就按数据顺序全画（实体再多也画）；放不下就最多画 12 行（还要给"其余"那一行留 15 px，所以小卡片只有 4–6 行），挑法是 ①有控制区面积的实体在前，按各关键帧的最大面积从大到小，②其余按 `joined` 从早到晚，同值按数据顺序；剩下的合并成一行弱色小字 `+N OTHERS / 另 N 方 ▾`（贴在时间轴上方）。**展开**：点卡片表头（宿主按 `cardToggle` 画成按钮）或「另 N 方」那一行，卡片原地变长（≤ 右列 60%），列出全部实体（在战的按面积 / 加入时间排在前，其余按加入时间），行高 30 设计 px，卡片内滚动、时间轴吸底；再点表头或 ESC 收起。**点一行**（展开与否都可以，键盘 Enter / 空格）= 选中这个实体：`highlight = [id]`（地图上它的控制区淡底加深）+ inspector 插槽出实体详情（`EntityInspector`：EN / 中文名、阵营时段、加入 / 退出日期、当前近似面积）；再点同一行取消，恢复本章高亮。画出的行保持阵营分色（参与线按段分色，面积带按 `t` 时阵营）。已验证：ww2（34 个实体）在 1920×1080 / 1280×720 / 2560×1440 下 EN 与中文标签、行与行之间没有重叠；`pnpm shoot <topic> --layout` 只查面板之间的重叠，卡片内部标签要另量（量 `.ts-card text` 的包围盒）。
  - 原 `panel01`（时间标尺 + 泳道）、`panel03`（状态）并进底部条；原 `panel02`（问题 / 概述）由阅读面板头部的 `summary` 一句代替。
  - `perf`：`FEATURES 63 · ZOOM 5.5 · 60 FPS`（500 ms 更新）。
  - `inspector`（实体）：`N-03 · PARTICIPANT` 眉题，阵营色块 + 名称、另一语言小字，SIDE（每段阵营 + 起止日期）/ JOINED / LEFT / AREA NOW。
  - `inspector`（事件）：hairline 框，`E-01 · BATTLE · 日期` mono 眉题（`site` 为 `P-01 · SITE`，无日期），标题大写 + 另一语言小字，摘要 + 来源上标（`sources`），进攻/防守/结果的 dl（斜线色块，颜色取事件开始时的阵营），Counter 兵力与伤亡；最后是 `detail` 的"细看 / More"折叠块（默认收起）。
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
ui.ts                    引擎内 UI store（ORBIT、REFERENCE、演示中 + 这一拍的标注、封面镜头；不进 URL，View 与舞台共用）
bridge.ts                舞台 → HUD 的桥：每帧投影好的标注锚点与屏幕框（零件 + `group:<id>` 组锚点）、HUD 可能标注的 id（遮挡只查这些）、渲染计数、帧回调、镜头落定（`settledTransition` / `cameraSettled`）（View 侧不 import three）
lib/                     纯函数，有单测：explode / visibility（图层、isolate、hide、shell、context）/ flow-curve / flow-stops（沿路径变色）/
                         color（材质族、tint）/ presets（材质名，无 zod）/ animation / telemetry（一阶滞后读数）/ detail（段落 + [S#]）/
                         camera（球坐标插值、REFERENCE 镜头、过渡目标）/ parts（零件包围盒、repeat 变换）/
                         schematic（零件链路、流经连线、立面、标注预算）/ labels（组标注 id、演示时用哪张标注表、组包围盒）/
                         leader-layout（引线标注摆放：两列、避让 HUD 与被标零件、代价搜索）/ xform / math
stages/model3d/          R3F 舞台：Model3DStage（createRoot 宿主）、SceneRoot、PartNode、geometry（程序化零件）、
                         materials（材质 + 选中边缘 / 剖面 shader 补丁）、textures（程序化贴图）、Lighting、
                         GroundShadow、CameraRig、Flows + flowMaterial、probes（标注投影 / 计数 / 阴影更新）、GltfSource
hud/                     LeaderLabels（leaders）、PartChainCard（card）、ArchitecturePanel / DetailPanel / StatePanel
                         （panel01–03）、PerfReadout（perf）、spec（标题块规格行）
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
    "shell": true,                         // 可选：外壳。主题里有 shell 零件时，X-RAY 只把 shell 变透明，其余保持实心
    "castShadow": false,                   // 可选：覆盖自动投影判断（默认 ≥ 模型半径 28% 的零件投影）
    "level": "P5"                          // 可选，规划用，不渲染
  }, {
    "id": "wall-section", "name": {en, zh}, "summary": {en, zh}, "detail": {en, zh},
    "context": true,                       // 场景零件（如一段墙）：画出来，但不标注、不可选、不编号、不计数、不进零件链路、不拆开、默认不投影；
    "primitive": { "kind": "box", ... }    // 可以不写 group（不受图层开关）、不写 explode；放在 parts 末尾，编号就与状态行一致
  }],
  "groups": [{ "id": "refrigerant", "name": {en, zh}, "color": "token:accent-1" }],
  "flows": [{
    "id": "loop", "group": "refrigerant", "path": [[x,y,z], ...], "speed": 1, "color": "token:accent-1", "whenRun": true,
    "stops": [{ "at": 0, "color": "token:hot" }, { "at": 1, "color": "token:cold" }],  // 可选：沿路径变色（2–6 个，at 升序；color 仍是图例色）
    "ends": "open",                        // 可选：fade（默认，开放路径两端淡入淡出）| open（不淡，首尾相接的分段流无空档）
    "count": 720, "size": 0.45,            // 可选：粒子数（默认 360，≤ 1024）、粒径倍数（默认 1）
    "spread": [0.3, 0.01, 0.01],           // 可选：抖动，数 = 球半径，[x,y,z] = 场景轴向的盒半宽（默认 0.012）
    "clip": false,                         // 可选：false = 不被剖切面切掉（机外的空气）
    "parts": ["compressor", "condenser"]   // 可选：流经的零件（按顺序）；运转时零件链路卡把相邻两件之间的连线染成该处的 stops 色并步进
  }],
  "animations": [
    { "id": "fan-spin", "target": "fan", "kind": "rotate", "axis": [0,0,1], "rpm": 120 },
    { "id": "flap", "target": "louver", "kind": "oscillate", "axis": [1,0,0], "amplitude": 20, "hz": 0.5 },   // amplitude 单位：度
    { "id": "beat", "target": "pump", "kind": "pulse", "scale": 1.15, "hz": 1 }                                // scale 是峰值缩放
  ],
  "views": {
    "assembled": { "camera": { "position": [3,2,4], "target": [0,0,0], "fov": 34 } },
    "exploded":  { "camera": { ... } },     // 每个视图可选一个预设镜头
    "cutaway":   { "normal": [-1,0,0], "offset": 0 },   // 可选剖切面；默认切掉 x>0 一半
    "cover":     { "position": [2.6,1.6,3.4], "target": [0,0.3,0], "fov": 30 },   // 可选封面镜头（直接是镜头，不套 camera）：演示以外隐藏 HUD（H、hero-clean 截图）时用
    "section":   { "plane": "xy" },         // 可选：ARCHITECTURE 立面与 REFERENCE 正视方向（xy 正面 / zy 侧面 / xz 俯视）
    "reference": { "camera": { ... } }      // 可选：自定 REFERENCE 镜头（默认按包围盒自动取长焦正视）
  },
  "spec": [                                // 可选，≤ 4 行：标题块规格行（宿主 3 行 + PARTS + 这些，总共 ≤ 8）；有它时 GROUPS / FLOWS 行不画
    { "key": {en, zh}, "value": "R32 · 0.60 kg", "tag": "design" },   // value：字符串（mono）或 {en, zh}；tag：typical | design | sim（sim 带 SIM 芯片，其余不出芯片）
  ],
  "telemetry": [                           // 可选，≤ 6 行：STATE 面板 = RUN + 这些模拟读数（带 SIM 芯片），替代默认的 FLOW / ANIMATIONS / VIEW / EXPLODE
    { "key": {en, zh}, "unit": "MPa abs", "idle": 1.93, "run": 3.0, "lag": 10, "decimals": 2 }   // 一阶滞后 τ = lag 秒；decimals 默认取 idle / run 写出的位数
  ],
  "presets": [                             // 可选，≤ 6 个命名镜头预设（docs/12 §7.4 G7）：VIEW 按钮排在各章镜头、ORBIT、REF. 之后（数字键接着排：1–9，第 10 个是 0，再往后只有按钮）
    { "id": "outdoor", "label": {en, zh}, "camera": { "position": [1.5, 0.75, 1.5], "target": [0.62, 0.3, 0], "fov": 30 },
      "view": "xray" }                     // view 可选：按预设时同时切视图（exploded 时拆开到 0.7 或当前值）；id 全主题唯一，不能叫 orbit / reference
  ]
}
```

`topic.yaml` 可选 `note: {en, zh}`：标题块的声明行（两个引擎通用），替代全站的 "EDUCATIONAL VISUALIZATION"，例如"通用设计研究 · 不代表任何品牌或型号"。

- **积木**（`size`）：box `[宽,高,深]`、cylinder `[上半径,下半径,高]`、cone `[半径,高]`、sphere `[半径]`、torus `[半径,管粗]`、capsule `[半径,长度]`、plane `[宽,高]`（双面）。`rotation` 是 XYZ 欧拉角（度）。
- **工程零件**（docs/08 §4，参数各自不同，zod 校验尺寸合理性）：
  - `bevelBox {size:[w,h,d], bevel}`：每条边都是真实圆角（bevel < 最短边一半）
  - `tube {path:[[x,y,z]...], radius, bendRadius?}`：path 相对 `at`；每个拐角用同一弯曲半径（默认 3×radius，不得小于 radius），管端开口
  - `flange {radius, thickness, boltCount, boltRadius}`：XZ 平面里的圆盘（轴 Y），螺栓圆上 `boltCount` 个六角螺栓头（实例化）；boltRadius < radius
  - `fins {size:[a,b,t], count, gap, axis}`：`count` 片 a×b、厚 t 的板沿 `axis`（x | y | z）等间距排列（实例化）
  - `vessel {radius, length, headRatio}`：沿 Y 的筒体 + 两端椭圆封头（封头深 = radius × headRatio，0.5 = 2:1 封头）
  - `panelHole {size:[w,h,t], hole:{r, at:[x,y]}}`：XY 平面里 w×h 的板（厚 t 沿 Z），一个圆形通孔（半径 r，圆心相对板中心 (x,y)，必须整个在板内），孔壁、外边都有；手工三角化（不引 Shape / ExtrudeGeometry），封闭体，剖切时填剖面。用 `rotation` 转到需要的朝向（室外机前面板的风扇口、室内机出风口）
  - `fins` 上限 512 片（一个 InstancedMesh，一次绘制）
- **repeat**：`{count, axis, spacing}`（沿轴、以 `at` 为中心等距）或 `{count, axis, radius}`（绕过 `at` 的轴一圈，每个实例朝外转）。轴是场景坐标。整件变成一个 InstancedMesh。
- **材质族**（`color`）：`casing`（拉丝铝，各向异性）、`steel`（机加工钢）、`powder`（缎面黑粉末涂层，轻微橘皮）、`stainless`（轴向拉丝不锈钢）、`copper`、`brass`（黄铜：阀门、喇叭口螺母）、`rubber`（近黑，roughness .78）、`plastic`（哑光暖砂色，不是默认灰）、`enamel`（暖白烤漆，比纸色深一档，低粗糙度 + 细颗粒粗糙度贴图 = 缎面光泽，家电外壳）、`glass`（半透明）；旧名 `metal` = steel、`matte` = plastic。或者 `token:<name>` / `#hex`：缎面漆。`primitive.tint`（token 或 #hex）给材质族换颜色、保留它的金属度 / 粗糙度 / 贴图，例如浅灰 `powder` 外壳：`"color": "powder", "tint": "#c4c6c2"`。程序化 canvas 贴图给拉丝方向、粗糙度变化、橘皮法线（`stages/model3d/textures.ts`，种子固定，截图可复现）。
- **流场**：`path` 首尾点相同 = 闭环。centripetal Catmull-Rom，按弧长烘焙进 shader：每 8 mm（0.008 场景单位）一个点，64–512 个，存成一行浮点纹理（`texelFetch` 取样，不占 uniform 数组），粒子在弯头处贴着曲线走、不抄近路（4 m 的冷媒段约 500 个点，弯头偏差从 64 点时的 15–20 mm 降到 3 mm 以内；盘管仍只能画 2–3 程，不能逐根追 U 形弯头），默认每条 360 个细粒子（贴着中心线，像 CFD 流线而不是魔法粒子），`speed` 是场景单位/秒。`stops` 在顶点着色器里按粒子位置插值（线性 RGB）；分段流（冷媒四段）用 `ends: "open"`，并让各段 `count / 长度 × speed` 大致相等（粒子通量连续）。`whenRun: false` 的流/动画一直播放（只受图层开关）。每条流一次绘制。
- **已知限制**：只有一个剖切面（`views.cutaway` 一个平面同时切所有零件；两个平面暂不做）；没有弯曲的盘管（弧形蒸发器用两三片倾斜的 `fins` 近似，L 形冷凝器用两片）；流不随拆开移动。
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
  labels: [compressor, "group:outdoor"]   # 可选：本章引线标注哪些零件（默认：所有可见零件，大件优先，按镜头距离限量）；`group:<组 id>` = 整组一个标注（组锚点）
  hide: [front-panel]          # 可选：本章移开的零件（沿自己的 explode 方向移出 0.25 × dist，后半段淡出，共 .6 s；回来反向）。不累积、不进 URL（store 字段 `hidden`）；被移开的零件不投影、不可点、不标注，ARCHITECTURE 画虚线框
  camera: { position: [4, 3, 5], target: [0, 0.3, 0], fov: 34 }
  summary: { en: "…", zh: "…" }   # 可选：阅读面板章名下的一句概述，也是没写 beats 时的默认字幕
  question: { en: "…", zh: "…" }  # 可选：孩子会问的问题（没有 summary 时作阅读面板头句 / 默认字幕）
  beats:                          # 可选：演示节拍（P），见「SpaceScene · 演示」；不写 = 一拍（本章 state，字幕 = summary）
    - camera: outdoor             # 命名预设 id（只取它的镜头），或 { position, target, fov }
      part: compressor
      cutaway: half
      labels: [compressor, accumulator]   # 这一拍的引线标注（≤ 6，不累积；不写 = 本章的 labels）
      hide: [outdoor-front]               # 这一拍移开的零件（不累积；不写 = 本章的 hide）
      caption: { en: "…", zh: "…" }
      audio: /audio/aircon/ch03-1.mp3     # 可选：进拍时播放的旁白文件（站内路径）
```

章节目标照常累积（`labels`、`hide` 不累积，只看本章）。**镜头规则**（`lib/camera.ts transitionCamera`，有单测；CameraRig 订阅 store，transition 一发出就按顺序处理，所以同一 tick 里先 `setPreset` 再 `setMode`（snap）也落在预设镜头上，截图脚本不需要延时）：切章 / 首次加载 / URL：本章自己写了 `camera`（或 URL `cam=` 与本章基线不同）就用它；否则 `views[当前 view].camera`；都没有就沿用。**预设（VIEW 按钮 / 数字键）永远落在该预设的镜头上**（P1 遗留问题：本章没有自己镜头时，基线是继承来的，曾被误判成"非显式"而飞去视图预设；已修）。模式切换（X / E / C / F）不动镜头。较窄的舞台（宽高比 < 1.6：HUD 占去两侧的桌面、平板、竖屏手机）自动把镜头往后拉（手机竖屏、宽高比 < 0.8 时 HUD 叠在上面，模型独占整宽，拉回量渐减到一半），回写 URL 时换算回来，链接与设备无关。**封面镜头**：演示以外隐藏 HUD（H、`pnpm shoot` 的 `hero-clean`）时 0.8 s 飞到 `views.cover`；没写就沿当前视线方向重新取景，让模型包围球占舞台宽 75 %（宽屏上最多超出高度 30 %，`fitSphereCamera`），舞台尺寸变了再重算；显示 HUD 时 0.8 s 飞回离开时的镜头——中间换过章、按过预设或拖过镜头就不飞回。章节镜头按带 HUD 的舞台取景：模型放在 HUD 块之间的空带里（1600×900 约 590 × 680 px），给引线标注留位置；封面镜头按满屏取景（模型约占宽 70 %）。

### HUD 控件与内容（docs/08 §2、§3）

| 控件 | 行为 |
|---|---|
| VIEW `01..NN` | 各章镜头（1.6 s easeInOut，target 直线 + 相机相对 target 的球坐标插值，绕着模型转，不穿模） |
| VIEW `ORBIT` | 慢速转台：绕 target 的竖轴 1 圈 / 40 s，1 s 渐入；一拖动即停（→ FREE CAMERA） |
| VIEW 命名预设 | `parts.json` 的 `presets`，排在 `REF.` 之后：飞到预设镜头（1.6 s），有 `view` 时同时切视图；正文 `<FlyTo preset>` 同一动作 |
| VIEW `REF.` = MODE `REFERENCE`（R） | 长焦（fov 16）正视（`views.section`，默认正面），2 s；暂停运转、收起爆炸、隐藏流场；EXPLODED 与 FLOW / SPACE 显式禁用，状态行写 `EXPLODE AND FLOW LOCKED`；再按 R（或 ESC）2 s 回到进入前的镜头与状态；选别的预设 = 退出但不回镜头 |
| MODE `X-RAY`（X） | 有 `shell` 零件的主题：只有 shell 变 .15 透明，其余保持实心（管里的粒子、机内的零件可见）；没有 shell 的主题：未选中零件全部 .15 透明（.3 s）。选中零件永远实心；只有这时材质变透明（forceSinglePass） |
| MODE `EXPLODED`（E） | 2 s easeInOut 拆开到 0.7（或章节值）；拖滑块时快速跟随 |
| MODE `CUTAWAY`（C） | 单剖切面；封闭零件的背面画成 `--cut` 赭色 + 屏幕空间 45° 墨色剖面线（像博物馆剖面模型，不是删掉一半）；管、平面不填 |
| MODE `FLOW`（F）= SPACE | run：动画与流场 .6 s 渐入。EXPLODED 时 F 禁用、舞台不画粒子（流路径不随零件拆开，docs/12 §7.5 G16），状态行写 `FLOW OFF WHILE EXPLODED` |
| MODE `PRESENTATION`（P） | core 演示系统，见「SpaceScene · 演示」 |
| `L` | 标注开关（宿主） |
| ESC | 退出演示 → 取消选中 → 退出 REFERENCE → 停 ORBIT |

- 状态行追加：选中零件 `#06 SAMPLE DRUM`、`EXPLODE 80`、`CUTAWAY 50`、REFERENCE 时的锁定说明。规格行追加 PARTS / GROUPS / FLOWS（`hud/spec.ts`）；有 `spec` 时是 PARTS + 主题行。标题块声明行 = `topic.yaml` 的 `note`（没有时用全站文案）。
- `card`：零件链路示意（有零件的组 = 列，列号 = 组的分区号；零件 = 带编号节点，context 零件不进；`connects` = 细线）；最长一列 > 10 行时行距从 23 降到 16（字号 10）；选中零件填 signal 色；运转时：有 `parts` 的流把它流经的相邻零件之间的连线染成 `stops` 在该处的颜色（`color-mix`）并步进，没有 `parts` 的流照旧染本组内的连线。
- `panel01` ARCHITECTURE：由零件包围盒直接画的立面（`views.section`，默认 XY），按组编号的分区括号 + 图例、地面线、模型单位比例尺；选中零件描 signal 色；被 `hide` 的零件画虚线框；context 零件画斜线填充，不属于任何分区。
- `panel02` DETAIL：选中零件（编号、EN + 中文、所属组、相连零件编号、一行说明、迷你爆炸图：静止虚线框 + 拆开实线框 + 位移线）；无选中时显示本章标题与模型概要。
- `panel03` STATE：RUN / FLOW / ANIMATIONS / VIEW / EXPLODE 实时值（mono），运行时数值带 `SIM` 芯片。有 `telemetry` 时 = RUN + 主题读数：x(t) = target + (x₀ − target)·e^(−t/lag)，target = run ? `run` : `idle`，4 Hz 刷新、不加抖动；瞬时过渡（深链接、测试 / 截图的 snap）直接跳到终值。
- `perf`：`60 FPS · 16 CALLS · 0.02M TRIS · 1520×1026`（滚动平均；按需渲染空闲时显示 `IDLE`）。
- `bottomBar`：只有 EXPLODED 时出现拆开滑块（44 px 拇指）；模式开关都在控制面板，不重复。
- `stageOverlay`：控制面板（`explorer/ExplorerOverlay.tsx`）：LAYERS = 零件组，TOOLS = X-RAY / EXPLODED / CUTAWAY / FLOW / REFERENCE / PRESENTATION / LABELS /（有 `glossary.json` 时）名词表 / 隐藏界面，KEY = 组与流的图例。章节正文里的 `<Term>` 与 TimeScene 相同。
- `inspector`：选中零件详情（编号 + 名称 + 中文、级别、说明、了解更多、所属组、相连芯片），hairline 皮肤。`detail` 里空行分段；`[S3]`、`[S3, S7]` 渲染成与 `<Num s>` 相同的来源上标（点开宿主的来源浮层；schema 校验编号在 `data/sources.json` 里）。
- `__atlas.stats()` 合并 `{calls, triangles, geometries, textures, fps, gpu}`（renderer.info + 滚动 FPS + WEBGL_debug_renderer_info）。

### 引线标注（`hud/LeaderLabels.tsx` + `lib/leader-layout.ts`，master-spec J）

- 每条：编号 + EN 名（粗、大写）/ 中文 / 一行说明（`summary` 截断）。锚点左边的标签右对齐，右边的左对齐并带小三角；细引线 = 标签边 → 16 px 水平短线 → 直线到投影锚点上的空心圆。锚点 = 零件包围盒中心；单根 `tube`（管路）的包围盒中心常在半空，改用路径一半长度处的点（`shapes.ts anchorPoint`）。
- 舞台每帧（`probes.tsx LabelProbe`）把锚点和零件包围盒的屏幕框（8 个角的投影，`x0 y0 x1 y1`）写进 bridge，HUD 侧只写 `transform` / `opacity` / `d` / `cx` / `cy`；字号、文字宽度与 `[data-hud-panel]` 矩形只在 resize、字体加载、标签集合变化时测量。
- **摆放**（`layoutLeaders`，纯函数，有单测；规则同 TimeScene 的地图引线）：两列对齐。列在 HUD 空带的边上，没有 HUD 块挡着时不超出舞台 22 % / 78 %，并朝本侧锚点（零件屏幕框）收拢。每个标签放在锚点那一侧（空带左右三分之一各归一侧，中间三分之一归近的一列，40 px 迟滞），尽量与锚点齐平。硬约束：在空带内、离 HUD 块 ≥ 8 px、不压别的标签、不压任何被标零件的锚点、锚点在标签的引线一侧、引线 ≤ 舞台宽 35 %。软约束（代价）：与锚点的竖直距离、不压被标零件的屏幕框（别的零件重罚、自己的轻罚）、引线不交叉、不穿过别的标签、上一帧的位置（迟滞，镜头动时不跳）。列里放不下时可以离开列、贴在自己零件旁边（代价更高）。先按优先级贪心放一遍（选中的零件、组、大件），再在其余都放好后把每个标签重放，最多两遍。**允许压在模型上**：没有被标零件的地方可以放；这时文字底下垫一块纸色底板（`.space-co__plate`，0.8 不透明，只在标签框压到某个显示中的零件时出现）。
- 锚点在背后 / 出屏 / 被剖掉 / 被遮挡 / 落在 HUD 块下 → 淡出。遮挡：节流 raycast，每帧最多 2 个，**只查 HUD 可能标注的零件**（`bridge.labelled`），镜头、零件位置、拆开、移开 / 淡入淡出变了才重查；每个零件最多 5 条射线（锚点，再是包围盒中心到四个角的一半、朝镜头那面），有一条到达就算看得见。X-RAY 时不判遮挡；选中零件永远标注、signal 色高亮、不因遮挡隐藏。
- 数量：`labelBudget(镜头距离 / 模型半径)` 3–10 条（近景少），放不下的不画。HUD 之间的空带 < 480 px（720p 笔记本）时只标选中的零件，其余靠右上零件链路卡和点选。手机（< 760）宿主隐藏 `leaders`。
- 点标签（触屏点一下）= 选中零件；标签热区高 ≥ 44 px。
- **组标注**（docs/12 §8 G12）：`labels` 里写 `group:<组 id>` = 整组一个标签：EN 组名（大写）/ 中文组名，不带编号和说明，不可点。锚点 = 组内**可见**零件（含拆开、移开后的实际位置）包围盒的中心（`LabelProbe` 每帧算，不判遮挡），屏幕框 = 这个包围盒的投影，别的标签不压整组。排在零件标签前面。
- **演示中**：只标这一拍的 `labels`（没写就是本章的，再没写就是默认的全部可见零件），至多 6 个、不按镜头距离限量，字号 +20 %，不可点（点 = 下一拍）；HUD 隐藏时 `leaders` 照常显示（`.atlas-leaders[data-present]`），**只**把字幕卡和标题块（`data-hud-panel="present*"`）当障碍（HUD 面板淡出时 `visibility` 还留着，不能算），进入演示时立刻重新测量。
- 章节的 `labels` 写 3–6 个在本章镜头下**看得见**的零件（被外壳挡住的会因遮挡淡出；要标里面的零件，本章 `hide` 掉外壳、用 X-RAY，或者用组标注）。`pnpm shoot <topic> --beats` 的 `chapter highlights` 在 1600×900 和 1920×1080 都应是 `all on screen`。
- 测试钩子：每个标签 `data-id`（零件 id 或 `group:<id>`）；有明确列表时 `.space-leaders` 带 `data-want`（`pnpm shoot --beats` 的漏标核对）。

### 演示（PRESENTATION，P；docs/12 §8 G1）

core 演示系统（字幕卡、两级进度条、自动播放、语音、拍键、保存 / 恢复都在 core，见「演示系统（core）」）+ `View.tsx` 里的适配器：

- **节拍**：章节 `state.beats`（schema `spaceBeat`）；没写的章 = 一拍（本章 state，字幕 `summary` > `question` > 章名）。一拍 = 本章目标（`chapterTarget`）叠上拍里写的字段：`view` / `part` / `explode` / `run` / `cutaway` / `layers` 覆盖；`hide`、`labels` 只看这一拍（不写 = 本章的）；`camera` = 拍的镜头，或命名预设的镜头（只取镜头，不取它的 `view`），都没有就是本章进入时的镜头（本章镜头 > 视图预设 > 继承）。
- **applyBeat**：`applyState`（reason `state`）一次写入，镜头 1.4 s（`ui.nextTweenMs`），拆开 2 s、移开 .6 s 照舞台原样过渡；返回的 promise 在舞台报告镜头落定（`bridge.settledTransition`，CameraRig 在缓动结束 / 被拖断 / 无需移动时写）且拆开或移开的过渡做完后 resolve，4 s 兜底（舞台还没加载完）。自动播放和语音从这时开始计（core）。`instant`（`goToBeat(i, { instant: true })`、截图）直接跳到终态。
- **进入**（`onEnter`）：先记下进入前的场景（`SpaceSavedState`：章、视图、选中、拆开、运转、剖切、`hidden`、图层、标注、镜头（活镜头，换算回与舞台宽高比无关的值）、ORBIT、亮着的预设与 FREE CAMERA；在 REFERENCE 里进入则记 REFERENCE 进入前的那份），再退出 REFERENCE（不飞回）、停 ORBIT、取消选中。**退出**（ESC / P / H / 显示界面）：`applyState` 放回这些，ORBIT 与 VIEW 预设高亮也放回。
- 演示中 REFERENCE（R）禁用；舞台盖 core 的透明点击层（拖动不转模型，点 = 下一拍）；引线标注见上一节。
- 语音、自动播放、音频文件、`__atlas.beats / goToBeat / setAutoplay / setVoice / voiceLog / state().presentation` 都来自 core，不需要引擎代码（e2e：`sample-space PRESENTATION …` 两条，含假 `speechSynthesis`：拍落定后才读、读完才进下一拍）。

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
- 示例（sample-space）：第 03 章两拍（一拍 `hide` + 三个零件标注，一拍命名预设 `sample-left` 的镜头 + 两个组标注），一个命名预设，正文一个 `<FlyTo>`。
- 计数（sample-space，1920×1080；14 个零件 + 1 个 context 墙）：静止 18 draw calls、~19 k 三角形；FLOW +2 calls。
- 包体：舞台 chunk ~207 KB gz（three + R3F 为主；圆角盒用 `RoundedBoxGeometry`，不引 ExtrudeGeometry/Shape）。GLTF 加载器单独成 chunk（21 KB gz），只有写了 `mesh` 的主题才加载。

## PWA、部署与 e2e（Phase 3）

- **PWA**：`@vite-pwa/astro`（`astro.config.mjs`），`generateSW` + `autoUpdate`。预缓存构建出的页面、JS、CSS、图标；`/geo/*.json`、`/models/*.glb` 与 `/topics/*/data.json`（引擎数据）**不**预缓存，走 CacheFirst 运行时缓存（没有 `maximumFileSizeToCacheInBytes` 例外：预缓存里不该有大文件）。scope / start_url 跟随 `ATLAS_BASE`。仅生产构建注册（BaseLayout 里 `import.meta.env.PROD`），`pnpm dev` 无 service worker。
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

## Geo pipeline（`scripts/geo/lib/`，每个主题 `scripts/geo/<slug>/`）

真实地图主题的控制区关键帧（`src/content/topics/<slug>/data/control.json`）由这条管线生成，CLAUDE.md 的"地图类内容必须用真实数据"由它落实。代码在 `scripts/geo/lib/`：`common.ts`（路径、工具、mapshaper、几何）、`manifest.ts`（清单类型、`PIPELINE_DEFAULTS`、`pipelineConfig()`）、`topic.ts`（按 `--topic` 定位主题目录与清单），库模块 `fit.ts svg.ts raster.ts capes.ts`，以及七个可运行步骤。每个主题一个目录 `scripts/geo/<slug>/`：清单 `sources.json`、来源记录 `SOURCES-GEO.md`、可选 `check-colors.json`，以及 gitignore 的 `raw/`（下载）和 `work/`（中间 GeoJSON）。工具（mapshaper、osmtogeojson）装在共享的 `scripts/geo/.tools/`（gitignore）。ww2 的来源调查、每帧方法、控制点残差、许可证见 `scripts/geo/ww2/SOURCES-GEO.md`；主题内的来源表是 `data/SOURCES.md`（`[G#]`）。操作手册：skill `atlas-history-topic` 的 `references/geo-runbook.md`。

清单 `sources.json`：数据集（`ref` / url / license；`cshapes` 是底图，底图要素标它的 `ref`；`ne-admin1` 供省份选择器）、OHM 关系集（按日期）、SVG / 位图地图（类别颜色、控制点、残差预算）、关键帧配方（CShapes GW 代码 → 实体，再按顺序叠加的步骤，后者覆盖前者），以及可选的 `pipeline` 块：焦点框、预算、量化、简化与海岸规则，缺省值 = ww2 的取值（`PIPELINE_DEFAULTS`）——`plannedKeyframes` 12、`budgetMB` 2.0、`focus`（欧洲 / 中东、东亚 / 西太平洋两个框）、`fineStartKm` 1.5、`fineStepKm` 0.25、`coarseKm` 50、`method` dp、`quantization` 400000、`islandsKm2 { focus 20, coarse 300 }`、`coast { enabled true, land public/geo/land-50m.json, detailLand public/geo/land-10m-sea.json, detailBox [95,-9,125,22], worldBox [-180,-60,180,86], gapKm 6, islandKm2 2, outsideKm 2, skipKm 15 }`、`checkColors`、`shots`（默认 `docs/screenshots/<slug>`）。`detailLand` / `detailBox` 要么都给、要么都 `null`（没有细海岸区）。命令行参数覆盖清单。

```bash
pnpm tsx scripts/geo/lib/fetch.ts --topic ww2         # 下载数据集到 raw/，装 mapshaper + osmtogeojson 到 scripts/geo/.tools/；失败 WARN 后继续
pnpm tsx scripts/geo/lib/ohm-export.ts --topic ww2    # OpenHistoricalMap Overpass → work/ohm-<set>.geojson（按日期校验关系有效期）
pnpm tsx scripts/geo/lib/ohm-export.ts --topic ww2 --list 1942-03-09 --levels 1-3   # 查某天有效的边界关系
pnpm tsx scripts/geo/lib/georef-svg.ts --topic ww2    # Commons SVG → GeoJSON：控制点拟合（投影 + 仿射 / 二次多项式，auto 取留一法 RMS 最小），打印残差 km
pnpm tsx scripts/geo/lib/georef-svg.ts --topic ww2 --fills <svg>   # 列填充色（选类别）；--dots 列城市点和最近标注（选控制点）
pnpm tsx scripts/geo/lib/georef-svg.ts --topic ww2 --propose <svg> --region europe|asia --r 6   # 用现有拟合预测海角位置并吸附到地图陆地 / CShapes 海岸，打印候选控制点
pnpm tsx scripts/geo/lib/georef-raster.ts --topic ww2  # PNG / JPG 地图 → GeoJSON：按调色板分类像素，标注/箭头/河流按最近类别填充，矢量化后同样控制点拟合
pnpm tsx scripts/geo/lib/georef-raster.ts --topic ww2 --colors|--preview|--circles <id>   # 颜色直方图 / 分类结果图 work/raster-<id>-classes.png / 城市圆圈中心
pnpm tsx scripts/geo/lib/compose.ts --topic ww2       # CShapes 底 + OHM / SVG / Natural Earth 省份叠加 → work/K#.geojson（properties.holder）
pnpm tsx scripts/geo/lib/simplify.ts --topic ww2      # 全部关键帧一个拓扑、拓扑保持简化 → control.json（TopoJSON 写法）；预算 budgetMB × 现有帧数 / plannedKeyframes，自动调间隔
pnpm tsx scripts/geo/lib/check.ts --topic ww2         # MapLibre（Playwright）渲染每帧，与来源地图并排 → docs/screenshots/ww2/geo-K#.png（--work 看未简化的 work/K#.geojson）
```

- 缺 `--topic` 或主题不存在：打印可用主题（`scripts/geo/` 下有 `sources.json` 的目录），退出码 2。
- 2026-10-09 从 `scripts/geo/ww2/*.ts` 迁移到 `lib/`：旧代码和新代码对同一份 `work/` 跑 simplify，产物逐字节相同（默认参数：2.5 km、2120 KB、15000 弧；`--fine 1.5`：2120 KB、15550 弧）；compose K1、ohm-export 也逐字节相同。**注意**：仓库里的 `control.json` 与 `--fine 1.5` 的产物逐字节相同（2120 KB，比 2 MB 预算多约 70 KB），而下面"实测"写的 2.5 km / 2120 KB 是默认跑法；下次重生成前先定用哪个。
- 不改 `package.json`：几何运算用 mapshaper（`.tools/`，`fetch.ts` 安装），截图用已装的 Playwright + `maplibre-gl`。
- 加一个关键帧：在 `sources.json` 的 `ohm` 加该日期的关系集（先 `--list` 查），需要的话加 SVG 来源和控制点（≥ 4 个，欧洲残差 ≤ 30 km、亚太 ≤ 60 km），在 `keyframes` 写配方和 `checks` 视图，然后依次跑上面的步骤，看 `geo-K#.png` 与来源图并排是否一致，把方法和残差写进 `SOURCES-GEO.md` 与 `data/SOURCES.md`。
- 选择器（`compose.ts`）：`cshapes`（`partsAt` 只取包含某点的岛，`at` 取另一天的国界）、`ohm`（`set` 取另一关键帧的关系集）、`admin1`（Natural Earth 省份）、`svg` / `raster`（类别，`coastFillKm` 让占领区沿底图海岸补齐）、`svgFrame` / `rasterFrame`、`parts`（保留或 `drop` 包含某点的单个多边形）、`bbox`、`union` / `intersect` / `difference`。不允许手画多边形；`bbox` 只用来选取已有几何的一部分。
- 同一底图的系列地图（San Jose 的月度二战欧洲 SVG、Gdr 的东线 SVG）在 `sources.json` 里用 `controlPointsFrom` 共用一套控制点。位图来源（`raster`）写调色板、容差、`exclude`（图例框）和 `minRegionPx`（可按类别，`_sea` 设大值把海色描边的字母吞回陆地）。
- 一条前线要"苏占区"时，用来源图里的苏方类别（带海岸补齐）作为**最后**一步绘制，而不是"苏联减去轴心区"：海岸不重合处（列宁格勒在来源图的海里）后者会把苏方城市划给轴心。
- 简化（`simplify.ts`）：`compose.ts` 仍每帧写一份 GeoJSON（`work/K#.geojson`，中间产物）；`simplify.ts` 把所有帧放进**同一个** mapshaper 数据集——相邻实体、也包括相邻关键帧之间重合的边界是同一条弧，只简化一次、只存一次——再导出一个带量化的 TopoJSON，写成 `{ topology, keyframes: [{ t, object: "K1" }] }`。按区域：焦点框（欧洲 / 中东、东亚 / 东南亚 / 西太平洋）内细、框外粗（50 km），两半沿框边拼回再按实体合并；最后每帧**沿底图海岸裁剪**（`followCoast`，见下）。默认方法 `dp`（Douglas–Peucker，间隔就是最大偏差；`--method weighted` 是 Visvalingam，更平滑但会把细长峡湾整条删掉）。
- **预算旋钮**：`--budget <MB>`（默认 2.0 = 12 帧的总预算，按帧数等比）。不给 `--fine` 时从 1.5 km 起每次 +0.25 km 直到放得进预算，所以"焦点区容差"是预算允许的最细档；`--fine / --coarse`（km）固定间隔，`--quant`（默认 400000 个量化格，≈ 赤道 0.1 km；`followCoast` 把海岸交给底图陆地，格子要细过 10m 顶点间距），`--no-coast` 跳过这一步，`--method`，`--out` 写到别处，`--no-measure` 跳过偏差统计。脚本最后打印焦点框内原始顶点到成品边界的偏差 p50 / p95 / p99 / max（km）。新增关键帧后重跑本步即可，帧多了容差会变粗；超预算时它自己警告。
- **预算按主题、世界海岸是固定成本**：`budgetMB × 现有帧数 / plannedKeyframes` 随帧数增长，但全球海岸裁剪（约 600 KB）不随帧数变，所以只有头几帧时按比例的预算可能比海岸本身还小，自动搜索会一路加粗到失效。**帧没做全时用 `--fine <km>` 固定间隔（如 `--fine 1.5`），帧齐了再用自动搜索**，最后把实际 KB 与预算的差写进 `SOURCES-GEO.md`。
- **CShapes 在条约签署日改边界**：“新地图”帧要查**签署日之后**的日期（`cshapes` 选择器的 `at`），当天的 CShapes 往往还是条约前的法理状态；OHM 与 CShapes 的边界不会逐点重合，混用会留下细长缝隙（sliver），处理：以其中一个为准，用 `difference` / `union` 或 `coastFillKm` 把缝并给相邻 holder，不要手画补丁，在 `check.ts` 并排图里逐处核对。
- **OHM 许可**：OpenHistoricalMap 版权页：数据“dedicated to the public domain under a Creative Commons CC0 dedication”，个别要素带 `license=*` 标签的按各自许可（CC BY / CC BY-SA 等）；页面不提 ODbL。用到的关系先查有没有 `license=*`（`raw/ohm-<set>.json` 的 `tags.license`）。
- 实测（K1 + K6 两帧）：原 GeoJSON 简化（10 km、Visvalingam）259 KB → 现 TopoJSON 焦点区 3 km、336 KB（预算 341 KB）；焦点框内偏差 p95 2.3 km、p99 2.8 km。
- **沿底图海岸裁剪**（`simplify.ts` `followCoast`，2026-10-09）：控制区的边缘不能自带一条跟底图不重合的海岸。每帧简化后，对**整个世界**用底图陆地裁：`land-50m.json`，东南亚 10m 框（95–125°E，9°S–22°N）内用 `land-10m-sea.json`；先擦掉水，再把简化多边形漏掉的陆地给最近的 holder——焦点框内 6 km，框外在**未简化的原始多边形**周围 6 km 内（粗简化 50 km 会让海岸漂移，但不能让它把没有 holder 的邻国陆地吞进来）；孤立的小片 < 2 km² 丢弃，焦点框外还丢 < 300 km² 的岛、框内丢 < 20 km² 的岛（东南亚框保留到 2 km²）。框外的底图海岸先用 2 km 的 DP 疏化再裁（`COAST_OUT_KM`，缩放 ≤ 5 时 ≤ 1 px），为了留在预算里。陆地里没有湖（NE `land` 把湖算作陆），所以控制区会盖住原始多边形里被挖掉的湖和海湾（梅拉伦湖、拉多加湖）。偏差统计不算离海岸 < 15 km 的点和在海里的点（水是故意擦掉的）。实测：焦点区 2.5 km、2120 KB（预算 2048 KB；1.5 km 时 2148 KB，全球海岸占约 600 KB），偏差 p50 0.32 / p95 6.3 km（p95 主要是上面说的湖和海湾）。
- 旧实测（12 帧，2026-10-08，还没有全球海岸裁剪）：焦点区 1.5 km、1371 KB（预算 2048 KB），偏差 p50 0.24 / p95 1.17 / p99 1.47 km；3 km 时 1215 KB。体积的大头是每帧约 800 个多边形的弧引用，间隔再粗也省不多（40 km 仍 916 KB）。`--islands fine,coarse` 调丢弃小岛的面积阈值（km²）。
- 页面体积：主题数据作为岛组件 props 序列化进 HTML，JSON 约翻倍，ww2 页约 3 MB，超过 Workbox 默认 2 MiB 预缓存上限，`astro.config.mjs` 已把 `maximumFileSizeToCacheInBytes` 提到 4 MiB。若要缩小页面，把 `control.json` 改成像 `public/geo/` 那样运行时 fetch 的静态文件。
- 内陆国界：`scripts/build-geo.ts` 出 `public/geo/borders-50m.json`（world-atlas 国家拓扑的 `mesh(countries, (a, b) => a !== b)`，只含国与国共用的弧，无海岸；DP 2 km，量化 0.01°，TopoJSON，约 69 KB）。`borders` 图层画它，不再描国家多边形。
- 东南亚近景底图：`scripts/build-geo.ts` 另出 `public/geo/land-10m-sea.json`（Natural Earth 1:10m 陆地，裁到 95°E–125°E、9°S–22°N，TopoJSON，约 234 KB）。GeoStage 在镜头 zoom ≥ 6.5 且视野与该框相交时才 fetch；zoom 7 起绘制、到 8 完全显现：框内先铺一层水色遮住 50m 陆地（不透明度 7→8 渐入），10m 陆地和海岸线叠在上面，颜色同为 `--land` / `--land-edge` / `--water` token。其他主题不加载它。
