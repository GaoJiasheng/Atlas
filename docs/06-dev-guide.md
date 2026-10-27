# 06 · 开发指南

Phase 1 地基（站点框架、i18n、主题、内容集合、Scene 契约、共享部件）、Phase 2 两个引擎（TimeScene / SpaceScene）、Phase 3 上线准备（PWA、Cloudflare Pages、e2e）和技术图版打磨（P1–P4，docs/08）都已就位，带两个占位主题。

**术语**（全文统一）：**预设**（preset）= 相机预设，顶栏中段按钮组 `VIEW`，数字键 `1–9`、`0`（第 10 个；TimeScene 放地理预设，SpaceScene 放 ORBIT / REF. / 命名视角，章节不占预设）；**章节芯片** = 顶栏左侧的 `01 … NN`（背景章 `BG`），章节快速导航；**模式**（mode）= 可开关的显示 / 行为，字母键，按钮在右列的**控制面板**（`widgets/ControlPanel.tsx`，LAYERS / TOOLS 两节）里，顶栏没有 `MODE` 组，只有 VIEW 组右端的 `▶ PRESENT` 一个（同一个 `presentation` 模式）；**状态行** = 顶栏第二行；**插槽**（slot）= 引擎往宿主 HUD 里画内容的位置；**面板**（panel）= 底部 `panel01–03`（目前只有 SpaceScene 用）；**卡片**（card）= 右上示意卡；**阅读面板**（reader）= 右侧停靠的 InfoPanel。SpaceScene 里的 `state.view`（assembled / xray / exploded / isolate）是"显示视图"，与 `VIEW` 按钮组（相机预设）无关。

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
    math-scene/               # descriptor + schema + View + stage（SVG）+ tray + hud + practice + lib（见「MathScene」）
    simulation/               # 后期占位引擎（只有 descriptor + schema + StubStage；不在一期范围）
    registry.ts               # 客户端引擎注册表（descriptor 同步，View 懒加载）
    schemas.ts                # 构建期引擎 schema 注册表（含 zod，禁止进客户端）
  i18n/                       # ui.en.json ui.zh.json + t() / tx() / 路径工具
  theme/                      # tokens.css, theme.ts（解析/应用/读 token）, map-style.ts
  lib/                        # content.ts（构建期取内容）, prefs.ts（localStorage）, time.ts, levels.ts（仅供 schema 校验可选的规划字段 `level`）,
                              # home.ts（首页：统计行、精选、扉页构图、目录分节）+ illustrations.json（插图清单，illustrate.ts 写）, drawing-fallback.ts,
                              # speech.ts（演示语音：选声、朗读队列、voiceLog）
  components/                 # SiteToggles 岛、MDX 组件（Lang / More / Num / FlyTo / Term / TopicLink / Frac / Task / Beat / Figure / Time / Dur）、home/（首页：Frontispiece / PlateCard / SubjectIcon / Drawing / ExLibris）
  layouts/BaseLayout.astro    # <html lang>、首帧前主题脚本、hreflang
  pages/                      # index.astro（跳转）, [locale]/index.astro, [locale]/topics/[slug].astro
  styles/                     # global.css（Tailwind + token 映射）, fonts.css（自托管 Plex woff2）, scene.css（HUD 布局与部件）
scripts/                      # validate-content.ts, build-geo.ts, build-icons.ts, illustrate.ts（首页插图）, shoot.ts（pnpm shoot）,
                              # new-topic.ts（主题脚手架）, sources-md.ts, geo/lib/（真实地图管线）+ geo/<slug>/（每主题清单）
tests/                        # vitest（数据层与纯函数）
tests-e2e/                    # Playwright：smoke.spec.ts, hud.spec.ts, hud-layout.ts（pnpm shoot --layout 共用）
```

## 加一个主题

历史主题（时间线 + 地图）走项目级 skill `.claude/skills/atlas-history-topic/`（docs/10），先用脚手架：

```bash
pnpm tsx scripts/new-topic.ts <slug> --engine time-scene --subject history --title-en "…" --title-zh "…" [--subtitle-en … --subtitle-zh …] [--start YYYY-MM-DD --end YYYY-MM-DD]
```

它建 `topic.yaml`（`status: draft`）、`chapters/00-background.mdx`（`kind: background` + 阅读说明）、`chapters/01-chapter-one.mdx`（完整 TimeScene frontmatter：state、summary、beats 示例）、`data/{entities,control,movements,events,presets,sources,glossary}.json`（最小合法：无实体、一个空的控制区关键帧）、`data/SOURCES.md`（带生成块标记），以及 `scripts/geo/<slug>/sources.json` + `SOURCES-GEO.md`；已存在就拒绝，最后打印下一步。`--start / --end` 缺省是 1900 年的占位日期，记得改。公元前写 `--start -0770 --end -0221`（或 `--start=-0770-01-01`；按日期比较，不按字符串），两端都只写年时 topic.yaml 加 `datePrecision: year`，缺省副标题写 "770–221 BCE" / "公元前770–前221年"。

拆解主题（SpaceScene，stage model3d）走项目级 skill `.claude/skills/atlas-space-topic/`（docs/13），用同一个脚手架：

```bash
pnpm tsx scripts/new-topic.ts <slug> --engine space-scene --subject science|biology --title-en "…" --title-zh "…" [--subtitle-en … --subtitle-zh …]
```

它建 `topic.yaml`（`mode: space`、`engine: space-scene`、`stage: model3d`、`status: draft`，机器与生物两种 `note` 写在注释里）、`chapters/01-chapter-one.mdx`（完整 SpaceScene `state`：view / explode / part / run / cutaway / layers / hide / labels（含一个组标注）/ camera / summary，两拍 beats（一拍用命名预设的镜头），正文示范 `<Num>` / `<FlyTo>` / `<More>`）、`data/parts.json`（每组一个零件：`shell` 外壳带 `extra` 垫脚、`lathe` 核心，再加一个 context 展台；只有流的组和一条流（`stops` / `spread` / `clip` / `parts`）、一个转动动画、`views`（assembled / exploded 镜头、`cutaway`、`section`、`cover`）、三个命名预设、两行 `spec`、两行 `telemetry`）、`data/sources.json`（S1 = 自描述的设计研究来源）、空的 `glossary.json`、`data/SOURCES.md`（带生成块）和 `scripts/geo/<slug>/refs/.gitignore`（参考图只在本地）。示例 id（`casing`、`core`、`hero`…）不带 slug 前缀；slug 与它们重名时脚手架拒绝。生成后 `pnpm validate` 直接通过，最后按 skill 的施工顺序打印下一步。手工建主题按下面的步骤：

1. 建目录 `src/content/topics/<slug>/`，`<slug>` 就是 URL 和 `topic.yaml` 里的 `id`（kebab-case，必须一致）。
2. 写 `topic.yaml`（字段见 docs/02）。`engine` + `stage` 必须是引擎支持的组合：`time-scene: geo | diagram`，`space-scene: model3d | layer2d`（schema 接受；SpaceScene 目前只实现了 `model3d`，`layer2d` 写了也会画成 3D 舞台，不要用）。
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
     | `<Figure>` | `<Figure src="figures/b200-rack" alt={{ en: "…", zh: "…" }} caption={{ en: "…", zh: "…" }} />` | 章节里的一张石墨插图（`public/illustrations/<src>.webp` + `@2x`，4:3，`scripts/illustrate.ts figure`）：paper 下正片叠底，dark plate 反相成粉笔（同首页插图 `.atlas-drawing`）；占位宽高预留；validate 检查文件存在、alt 与 caption 都写了 |
     | `<Num>` | `<Num s="S3">about 70,000</Num>`；多个来源 `s="S3,S7"` | 数字后跟 mono 上标来源号，点开来源弹层（文本、说明、链接，不联网） |
     | `<FlyTo>` | `<FlyTo preset="singapore-island">Singapore island</FlyTo>` | 正文里的 hairline 按钮，镜头飞到命名预设（TimeScene `presets.json`，SpaceScene `parts.json` 的 `presets`；与 VIEW 按钮同一动作；手机上顺便收起阅读面板） |
     | `<TopicLink>` | `<TopicLink slug="four-taps">Singapore's Four Taps</TopicLink>`；链到某一章：`<TopicLink slug="ww2" ch="fall-of-singapore">…</TopicLink>` | 正文里链到另一个主题的页面：按读者语言和站点 base 生成地址（`localeHref`），不要手写 `/en/topics/…`；可选 `ch` 加 `?ch=<章 id>`（见「URL 参数」）；`pnpm validate` 检查主题存在、`ch` 是那个主题的章节 id（读目标主题各章 frontmatter 的 `id`） |
     | `<Term>` | `<Term id="blitzkrieg">闪电战</Term>` | 名词：点状下划线的 `span`（`role="button"`，Enter / 空格也能开），点开在阅读面板 inspector 区显示 `glossary.json` 里的定义和相关词（见「名词表」）；只包全主题第一次出现处 |
     | `<Frac>` | `<Frac n={3} d={4} />`、`<Frac w={1} n={3} d={4} />` | 静态竖排分数（与数据文本里的 `{3/4}` 同一套标记），读屏读文字（"three quarters" /「四分之三」）；校验 n、d 是整数、d ≥ 1 |
     | `<Time>` / `<Dur>` | `<Time t="09:40" />`、`<Time t="19:20" as="24" />`、`<Time t="7:20" as="face" />`、`<Time t="19:20" as="ampm" />`；`<Dur d="1h35m" />` | MathScene 正文里的时刻 / 时长，与数据文本的 `{t:…}` / `{d:…}` 同一套写法和读法（`src/lib/rich-text.ts`）：按这个主题 `lesson.json` 的 `notation`（构建时读，`components/mdx/notation.ts`），12 时制在中文正文写"上午 9.40"、`ampm` 中文也写字母；不拆行的 `atlas-value`，读屏读文字；`t` 一律 24 时制。校验值能解析、`as` 是 `24` / `face` / `ampm` |
     | `<Task>` | `<Task id="equivalent-fractions">try one question</Task>` | MathScene：hairline 按钮，打开本章小测（步 id：从题库抽一道；也可写题库题 id）（SceneHost 委托 `data-task` → `SceneControls.goToTask`）；校验 id 是 `lesson.json` 的步或题库题 |
     | `<Beat>` | `<Beat n={2}>fold it in half again</Beat>` | MathScene：句中的 hairline 链接，舞台跳到本章第 n 个讲解拍（`data-task="beat-2"`，同上委托）；当前拍的链接高亮；校验 n 在本章拍数内 |
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
- 正文 `<TopicLink slug ch>`：主题目录存在，`ch` 是它的一章
- TimeScene `basemap.local` 文件（`localLandIssues`）：TopoJSON、有同名对象、有 `kind: land`；`kind` 只能是 `mask` / `land` / `coast-today`，`coast-today` 是线；带日期的岛岸（见「Geo pipeline」的「岛尺度底图 · 按年代的海岸」）要么每个 `land` 都带 `from` / `to`、要么都不带，日期合法、`to` 晚于 `from`，各段不重叠、无空档、只有第一段可省 `from`、最后一段可省 `to`
- `sources.json`：id 形如 `S1`、不重复；事件的 `sources` 和正文 `<Num s="…">` 引用的编号必须在 `sources.json` 里（没有这个文件却引用了也报错）；可选 `design: true` 标出主题自己的设计研究；SpaceScene `table` 模型的行：每个 `S#` 都在、设定 SIM 数输出的行引设计研究、设定 TYPICAL 数输出的行引别的来源（`table-schema.ts tableSourceIssues`）
- 正文 `<FlyTo preset="…">` 必须是本主题的命名预设（TimeScene `presets.json`，SpaceScene `parts.json` 的 `presets`）；`<More>` 必须带 `title`；预设 id 与章节等 id 一样全主题唯一，且不能叫 `world` / `theatre`（TimeScene）、`orbit` / `reference`（SpaceScene）
- `glossary.json`：名词 id 唯一，`see` 必须指向已有名词且不能指向自己；正文 `<Term id="…">` 必须在名词表里（没有这个文件却用了也报错）
- `topic.yaml` 的 `blocLabels` 只允许 `axis / allied / neutral / out` 四个键，每项都是 `{ en, zh }`
- 背景章（`kind: background`）至多一个且 `order: 0`；`state.note`（阅读说明）只能写在背景章
- `ui.en.json` 与 `ui.zh.json` key 一致
- 共享数据（`src/content/shared/fitness/`，docs/16 §4）：肌肉卡 / 动作卡 / 共享来源各按 schema 解析；肌肉 id、动作 id 跨文件唯一；`parent`、肌肉的 `exercises`、动作的 `primary` / `secondary` / `stabilisers` / `motion.keys[].contract` 必须指向已有条目；`s` / `[M#]` 只能引用共享来源 `M#` 且必须存在；`sketch` 的 `public/illustrations/exercises/<stem>.webp` 与 `@2x.webp` 必须存在。warning：叶肌肉的动作不是 3–5 个、`summary` 超 60 字符、`dose` 里有数字（决定 11：只写原则）
- 用到共享数据的主题：零件 `muscle` 必须是已有肌肉；`training.json` 的每个动作必须存在、至少一个 `primary` 是本主题的零件、`motion` 里的关节都在本主题 `rig` 里；章 / 拍 `exercise` 必须在 `training.json` 里，`sites` 必须是写了 `sites` 的零件，`highlight` 是组或零件；正文 `<Num s="M3">` 与 `[M3]` 查共享来源
- glb 模型（`parts.json` 的 `model`，`scripts/lib/glb-check.ts`）：`public/` 下存在、≤ 8 MB、`asset.copyright` 非空；零件 `mesh`（含 `bilateral.mesh` 双胞胎）与 `rig` 关节的 `node` 都要在 glb 节点表里——缺节点是 **error**；两个节点名被 three 的 GLTFLoader 去掉 `.` `:` `/` `[` `]` 后撞名也是 error
- MathScene（docs/15 §4.10、§10，`math-scene/validate.ts`，经 `schemas.ts` 的 `topicIssues` / `taskIds`）：章 ↔ 步一一对应、练习章 `practice: true` 唯一且在最后；每步 3–5 个讲解拍且拍的模型画得出（份数、数轴刻度、分数墙的行）、题库 8–10 道、题 id 全主题唯一、`<Beat n>` 在本章拍数内；`lo` 与课纲来源存在；P2 / P3 步分母 ≤ 12、加减结果在 0–1、异分母要相关；目标能在模型上表示（涂得出、在刻度上、因子可达、对折可达、`accept: exact` 的份数 = 分母）；`choose` 的错选项都有误解且在 `feedback.wrong` 里有一句；单选恰有一个对；练习 6–10 题、至少 5 种题型、`revisit` 是步；题干 EN ≤ 120 / ZH ≤ 40 字（warning，`{a/b}` 记号算一字）；所有文本里的 `{a/b}` 记号合法

## 背景章（`kind: background`）

主题可以有一个开场的背景章（`order: 0`），讲"开始之前"。客户端判断在 `src/engines/core/chapters.ts`（`isBackground`、`storyChapters`、`chapterNumbers`）：

- **编号**：背景章是 00，其余章节从 01 起照常编号（加不加背景章，后面的章号不变）。doc id `ATL-…-00`；章节轨里它没有编号，画一个空心菱形 + "Background / 背景"（手机芯片写"BG / 背景"），title 是章名；阅读面板眉题写"Background / 背景"，收起的竖条写短名；规格表 CHAPTERS 和索引页章数只数正式章节。
- **时间**：在底部条上没有段（TimeScene 只把 `storyChapters` 交给 `buildTimeModel` 和底部条的分段映射）；进入时只缓动到目标时间；目标时间按累积规则 = 默认值（第一个控制区关键帧）或它自己的 `state.time`。
- **阅读面板**：第一次进入背景章时（每次页面加载一次）阅读面板展开，不管之前是否收起（`SceneHost` 的 `openBackground`，结果照常写回 sessionStorage）；之后照常粘住。< 1024 的底部抽屉不受影响。
- **阅读说明**：背景章的 `state.note`（`{ en, zh }`，TimeScene chapter-state schema）在阅读面板正文顶部画成细框（`.atlas-note`），标题是 UI 文案 `chapter.note`："How this topic is written / 阅读说明"。
- ← → 和 Back / Next 照常经过它（它在最前）。演示的节拍列表包含它（默认一拍 = `summary`），排在第 01 章之前；字幕卡表头写"Background"，进度条段落写"BG / 背景"；语音开场读"Background / 背景"而不是章号。
- **SpaceScene**（docs/30 F0，示例 `sample-forces` 的第 00 章）：章 state 照常写（镜头、标注、拍、`sim.set`、本章索引），可写 `note`；顶栏芯片与章节轨写 `BG` / 空心菱形，阅读面板眉题"Background"；章节轴（引擎的底部条）与 MathScene 一样给它一段 `BG`（每拍一个刻度：背景章也有拍），右端读数 `BG · 1/2`；没有试一试卡片时不注册 `[ ] T G`。

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
- **过渡**：`transition: { id, reason: 'init' | 'chapter' | 'url' | 'preset' | 'snap' | 'state', instant, fields? }`（`preset` = 镜头预设、`snap` = 立即完成，见下文 HUD 控件注册；`fields` 只在 `url` 上：链接自己写了的 store 字段，其余来自章节目标，引擎补全链接时只补其余的）。引擎监听 `transition.id` 变化，向当前状态做动画（flyTo、时间插值、零件淡入）；`instant: true`（首次加载、深链接）时直接跳过去。用户 `patch()` 不 bump transition，引擎直接跟随。
- **相机**：`GeoCamera { center, zoom, pitch?, bearing? }` 或 `OrbitCamera { position, target, fov? }`。地图 `moveend` 后 `setCamera()` 回写，URL 会自动同步。

### URL 同步

- key：`ch, layers, cam, theme` + 引擎 `b, t, hl, part, view, explode, run, cut`（完整说明见文末「URL 参数」）。与当前章节目标相同的字段不写进 URL（普通章节链接就是 `?ch=<id>`）；其它 query 参数原样保留。
- 写入用 `history.replaceState`，250 ms 防抖；切语言前自动 flush。纯函数 `encodeSceneState / decodeSceneState / mergeSearch` 有单测。
- 新增可链接字段：在 `UrlEngineFields`（core/types.ts）和 `url-state.ts` 的编解码里各加一处，再在 descriptor 的 `fromUrl` 接收。

### 布局（技术图版 HUD，docs/08 §2）

舞台铺满页面，HUD 浮在上面；阅读用的 InfoPanel 在 ≥1024px 是右侧停靠列，以下是底部抽屉（收起时只有章节标题 +「阅读」按钮）。SceneHost 用 CSS grid 排布，各块贴在自己的角上，结构上不可能互相重叠：

```
顶栏  ◇ ATLAS · 学科 [01][02]…[NN] │ VIEW [WORLD 1][WHOLE AREA 2]… [▶ PRESENT 演示] │ LOOK ▾  EN ▾   （左 / 中 / 右三段；< 1180 px 中段独占第二行；手机只剩品牌 + LOOK / 语言）
      状态行 ATL-{TOPIC6}-{NN} · CHAPTER 07 VIEW · PAUSED · FLOW          键位提示
左列  标题块（PLATE NN · 章节名 / 主题名 / 副标题 / 规格 dl / 声明）+ ChapterRail + plate（左列底部的 PLATE 图版块，引擎填）
右列  card（右上示意卡，可展开）+ stageOverlay（控制面板：LAYERS / TOOLS / KEY）
底部  perf（安静读数，TimeScene）→ panel01‖panel02‖panel03（现在没有引擎注册；整组可收成 28 px 横条）→ bottomBar（章节轴 / 时间轴）
阅读面板  编号 / 章名 / summary 一句（衬线、弱墨）→ readerTop（节拍行、选中对象）→ 正文 → readerEnd（本章索引）→ inspector → 测验；左缘把手收起成 28 px 竖条（宿主级，各引擎一样）
```

- **顶栏三段**（`core/Hud.tsx TopBar`）：左 = 品牌 + **章节芯片**（`<nav class="atlas-chips">`，每个 `.hud-btn.atlas-chip-btn[data-chapter=<id>]`，当前章 `.on` + `aria-current="step"`，点击 = `store.goToChapter(id)`，与章节轨同一路径，点完自动失焦让 ← → 继续生效；背景章 `BG`；手机隐藏，用章节轨的方块行）；中 = VIEW 组 + `.hud-btn--present`（`data-mode="presentation"`、`aria-pressed`、signal 橙实心；只在引擎注册了 `presentation` 模式时出现，走 `actions.setMode`，与 P 键、TOOLS 行同一状态）；右 = `GlobalToggles`（LOOK / 语言）。外侧两列 `minmax(max-content, 1fr)`。**doc id 在状态行最前**（`.atlas-docid`，手机隐藏）。
- **全引擎 HUD 铁律**（docs/08 §2：a 底部是章节轴、b 没有别的底部条、c 选中详情在章头正下方、d 阅读面板顺序、e 章节提到的对象都能从索引点到）：新引擎、新主题照做，不必在主题 spec 里重复。
- **章节轴**（`core/axis/ChapterAxis.tsx` + `core/axis/axis.ts` 纯函数，样式 `.atlas-axis*` 在 `styles/scene.css`；引擎放进 `bottomBar`）：

  ```ts
  <ChapterAxis
    chapters={[{ id, number: '05' | 'BG', title, beats: [caption…] }]}  // 每章至少一拍（没写拍 = 一拍）
    chapter={store.chapter} beat={当前拍 | null}                          // null = 本章自身状态，不填刻度
    open={hud.panelsOpen} onOpen={actions.setPanels}                      // ⌄ 收成发丝线（只留章号），按标签页记住
    onChapter={(id) => store.goToChapter(id)} onBeat={(id, k) => …}       // 点段 = 那一章第一拍；点刻度 = 那一拍
    status="05 · 2/8" locale={locale} />                                  // 右端短读数（axisCounter）
  ```

  每章一段（等宽，`flex: 1 1 0`），段左界写章号 + 章名（段宽 < 72 px 只剩章号），段里每拍一个空心小圆（均匀排，命中区 = 本段宽 / 拍数，最多 28 px），已过的章墨色、当前章 signal 填到当前拍、当前拍实心（`data-filled`）。段是 44 px 高的按钮（`data-chapter`、`aria-current`），刻度是按钮（`data-beat="<章>.<k>"`，只有当前段的刻度进 Tab 顺序）。手机（< 760）只剩章号、没有刻度。引擎注册 `SceneControls.beatStep(dir)` 后宿主绑定 `,` / `.`（`BEAT_KEYS`，keymap 类型 `beat`），键位提示多一段 `, . 节拍`。纯函数 `tickPosition / segmentFill / flatIndex / stepBeat / axisCounter` 在 `tests/core/axis.test.ts`。**同一族**：TimeScene 的 `timeline/Timeline.tsx`（分段时间轴，多了按时间排的刻度、播放头和泳道）MathScene 已改用这个组件（小测与练习题的刻度是方块，引擎加 `data-shape="square"`）。
- **底部面板整组收起**（≥ 1 个 `panelNN` 注册时；现在没有引擎注册）：条**上缘左对齐**的 hairline 页签 `.atlas-panels__fold`（24 px 高、≥ 44 px 宽、`aria-expanded`，展开时 chevron 朝下、收起后朝上，两种状态都在）→ 28 px 横条 `.atlas-panels__bar`（`data-hud-panel="panels-bar"`，三个标题，点它展开）。状态 `HudState.panelsOpen`（默认 `true`），动作 `actions.setPanels(expanded)`，按标签页存 `sessionStorage['atlas:panels']`（`lib/prefs.ts` 的 `getPanelsExpanded / setPanelsExpanded`；`'collapsed'` / `'open'`），不进 URL，换章不改；`.atlas-scene[data-panels="open|collapsed"]`；`__atlas.state().panels` / `__atlas.setPanels(on)`。**舞台重排**：`BottomPanels` 用 ResizeObserver 量出面板条顶边到舞台区底边的距离，写成 `.atlas-scene` 的 `--stage-inset`，`.atlas-stage` 和 `.atlas-leaders` 的 `bottom` 都用它（所以舞台画布和引线层同尺寸，收起后变高；没有面板的引擎 = 0；HUD 隐藏时恒为 0）。引擎不用管，只管照常 portal 进 `panel01–03`（收起时内容仍挂载、`display: none`）。LAYERS / TOOLS 控制面板自带关闭按钮，不在这个组里。

- **右上卡折叠**（`controls.card` 注册时）：卡片标题行右端 `.atlas-card__fold`（chevron 朝右，≥ 44 px 命中区；与 `cardToggle` 的「展开全部行」是两个控件）→ 卡片 `display: none`（槽仍挂载），舞台右缘 28 px 竖页签 `.atlas-card__tab`（`data-hud-panel="card-tab"`，竖排标题、chevron 朝左，点它恢复）；`.atlas-stage__overlay`（LAYERS / TOOLS）上移补位。状态 `HudState.cardOpen`（默认 `true`），动作 `actions.setCard(expanded)`，按标签页存 `sessionStorage['atlas:card']`（`getCardExpanded / setCardExpanded`），不进 URL，换章不改；`.atlas-scene[data-card="open|collapsed"]`；`__atlas.state().card` / `__atlas.setCard(on)`。引擎做引线或标牌避让时读 `[data-hud-panel]` 矩形即可，折叠后 `card` 面积为 0、`card-tab` 出现；SpaceScene 的 `LeaderLabels` 另订阅 `cardOpen` 立即重量。
- **阅读面板收起**（≥1024px）：左缘一个 hairline 小把手（`.atlas-reader__handle`）把它收成 28 px 竖条（`.atlas-reader__strip`：三行网格，章节号在中线上方、竖排章名垂直居中、小箭头在章名下方，点它展开）；舞台随之占满宽度（地图的 ResizeObserver 调 `map.resize()`）。默认展开。**收起是用户的选择，粘住**：点章节轨、底部条的段或拍刻度、← →、Next / Back 换章**都不会**重新展开；只有点把手或竖条才展开（`actions.setReader`）。收起时换章（章 id 变了才算）会让竖条闪一下提示有新文字：`.atlas-reader` 上 `data-flash` 约 900 ms，CSS 画两次 signal 橙 2 px 轮廓脉冲（`atlas-reader-flash`，450 ms × 2；`prefers-reduced-motion` 下改为静态轮廓）；已展开则不闪。演示进入时 HUD 整体隐藏（阅读面板随之消失），退出时恢复，不改 `reader`。状态在 HUD store 的 `reader`，按标签页存 `sessionStorage['atlas:reader']`（`lib/prefs.ts` 的 `getReaderExpanded / setReaderExpanded`），**不进 URL**。< 1024 的底部抽屉不受影响。
- 阅读面板头部：章节号、章名，下面一句 `state.summary`（没有就用 `state.question`），弱墨衬线；手机抽屉收起时不显示这一句。

### 布局插槽（引擎往哪里画）

引擎用 `<SceneSlot name=…>` portal 进插槽；空插槽什么都不渲染（没有空框）。

| 插槽 | 位置 | 说明 |
|---|---|---|
| `bottomBar` | 底部最下 | 时间轴 / Explorer 控件（44px 触控，不随 HUD 缩小，4K 时放大） |
| `stageOverlay` | 右列，示意卡下 | 控制面板 `ControlPanel`：LAYERS（图层 + 绘制类模式）、TOOLS（其余模式 + 隐藏 HUD）、KEY（图例） |
| `inspector` | InfoPanel 内，正文之后 | 选中对象详情（TimeScene） |
| `readerTop` | InfoPanel 滚动区最上，章头正下方、正文之前 | SpaceScene：节拍行 + 选中零件 / 当前动作卡（docs/08 §2 铁律 c、d）；MathScene：节拍行 + 小测托盘 |
| `readerEnd` | InfoPanel 内，正文之后 | SpaceScene：本章索引（`state.index`）；MathScene：要点 + 课纲对照 |
| `plate` | 左列底部，章节轨之下 | 次级读数的紧凑块（SpaceScene：PLATE 图版块；MathScene：模型 · 份数 · 标记 · 分数）；手机隐藏 |
| `card` | 右列顶 | 示意 SVG 卡的**内容**；标题由 `controls.card` 注册，宿主画框和 `A NAME 中文` 表头；注册了 `cardToggle` 时表头是展开按钮（`aria-expanded`），框带 `data-expanded`，展开后高 ≤ 右列 60%，内容自己滚动 |
| `panel01` `panel02` `panel03` | 底部三块等高面板 | 面板**内容**；标题由 `controls.panels` 注册，宿主画框和 `01 NAME 中文` 表头；没注册标题的面板不出现，一个都没注册时整条面板带不出现（现在三个引擎都不注册） |
| `perf` | 底部右上，安静小字 | `FEATURES 63 · ZOOM 5.5 · 60 FPS`（TimeScene；SpaceScene 的 perf 在 PLATE 块末行） |
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
  presets: { items: [{ id, label: '01', title?, chapter? }], set(id, { instant }) {},   // 数字键 1–9，第 10 个是 0，再往后只有按钮（不显示数字）
             current?: 'bar', status?: 'MODEL BAR' },   // 可选：引擎自己决定亮哪个（给了就以它为准，宿主不跟踪 FREE CAMERA，VIEW 组带 data-presets="engine"），status = 状态行那一段
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
  panels:  { panel01: { en, zh }, panel02: …, panel03: … },   // 可选；现在没有引擎用
  beatStep: (dir) => {},             // 可选：演示之外的上一拍 / 下一拍（, .），章节轴的引擎注册
  beats:   presentation.controls,     // 可选：演示节拍（usePresentation 给的；__atlas.beats / goToBeat / state().presentation / setAutoplay / setVoice / voiceLog），见「演示系统（core）」
  commands: [{ id: 'check', key: 'c', label, disabled?, run() {} }],   // 可选：一次性命令（不是开关）；键、带 data-command 的按钮、__atlas.runCommand 同一路径；keymap 类型 'command'
  test:    { task: () => …, solve: () => … },   // 可选：引擎专属测试钩子，挂成 __atlas.engine.*
  goToTask: (id) => boolean,         // 可选：正文 <Task id> 被点（SceneHost 委托 data-task）
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
  - **TimeScene**：预设 = `world` + `theatre`（整片区域）+ `presets.json` 的地理预设（**不再有章节预设**：换章走章节轨、顶栏章节号、底部条的段和 ← →）；模式 `flow`（F）/ `borders`（B）/ `graticule`（G）/ `territory`（N）/ `reference`（R）/ `presentation`（P）+ 宿主 `labels`（L），全在控制面板里（`presentation` 另有顶栏 VIEW 组右端的 PRESENT 按钮；底部条没有）；**没有 `pause`**（没有自由播放，SPACE 只在演示里 = 下一拍）；ESC 依次退出演示、REFERENCE、收起展开的参与卡（连同选中的实体）、取消选中实体、关闭事件详情、清空高亮。G / P 手机上不画行（`phone: false`）。
  - **SpaceScene**：预设 = `ORBIT`（转台）+ `REF.`（= REFERENCE 模式的预设入口）+ `parts.json` 的命名预设（数字键接着排：1 = ORBIT），模型视角，不是地理预设；**没有章节预设**（章节镜头由换章带出，换章走顶栏章节芯片、章节轨和 ← →，状态行未亮预设时写 `CHAPTER 07 VIEW`）；模式 `xray`（X）/ `exploded`（E）/ `cutaway`（C）/ `flow`（F，= run；EXPLODED 时禁用）/ `reference`（R）/ `presentation`（P）+ 宿主 `labels`（L），在 ExplorerOverlay 的控制面板 TOOLS 节里（LAYERS 节是零件组）；SPACE = run；ESC 依次退出演示、取消选中、退出 REFERENCE、停 ORBIT。R / P 手机上不画行（`phone: false`）。
  - 两个引擎的 PRESENTATION 都是 core 演示系统加各自的适配器（见「演示系统（core）」「TimeScene」「SpaceScene · 演示」）。

### 键盘（`core/keys.ts`，宿主统一处理）

| 键 | 作用 |
|---|---|
| ← → | 上一章 / 下一章（跳过折叠章节） |
| , . | 上一拍 / 下一拍，跨章（引擎注册了 `beatStep` 时；SpaceScene 的章节轴） |
| 1–9, 0 | 镜头预设（TimeScene：地理预设，按 VIEW 组顺序）；0 = 第 10 个，再往后只有按钮，按钮上也不写数字 |
| 注册的字母 | 模式开关（L = 标注；`h`、空格、数字保留给宿主） |
| SPACE | 暂停 / 运行（没注册 `pause` 时不拦截） |
| H | 隐藏 / 显示 HUD（只进 HUD store，不进 URL；0.35 s 淡出，左下留「H 显示界面」可点） |
| ESC | HUD 隐藏时恢复；否则交给引擎 `escape` |

带 Ctrl / Cmd / Alt 的不处理；已被处理（`defaultPrevented`）的不处理；焦点在 `input / textarea / select / contenteditable / [data-keys="own"]` 里不处理；方向键还让给 `[role=slider|radiogroup|tablist]` 和 `[data-keys="arrows"]`（模型内部用方向键，其它宿主键照常）；注册的命令字母（`commands`）在模式字母之后处理；空格让给获得焦点的按钮类元素（鼠标点完 HUD 按钮会自动失焦）。Shift+← → 留给 TimeScene 微调时间。

### `window.__atlas`（`core/test-api.ts`，docs/08 §7）

```ts
await __atlas.ready                 // 视图已挂载且舞台 canvas 有尺寸 → true；20 s 超时 → false
__atlas.chapters(); __atlas.goToChapter(id, { instant })
__atlas.presets();  __atlas.setPreset(id, { instant })           // instant 默认 false
__atlas.modes();    __atlas.setMode(id, on, { instant })          // instant 默认 true（会 snap）
__atlas.keymap()    // [{ key, type: 'preset'|'mode'|'command'|'pause'|'hud'|'escape'|'chapter', name }]
__atlas.commands(); __atlas.runCommand(id)         // 一次性命令 [{ id, key?, disabled }]；runCommand 同键与按钮，禁用时返回 false
__atlas.engine      // 引擎专属测试钩子（SceneControls.test；MathScene 见「MathScene」），没有就是 {}
__atlas.beats();    __atlas.goToBeat(i, { instant })    // 演示节拍（用 core 演示系统的引擎）：beats() = [{ chapter, index, caption }]（index = 本章内第几拍，0 起）；goToBeat 需要时先进入演示，instant 默认 false
__atlas.state().presentation                    // 正在演示的拍 { chapter, beat, autoplay, voice }（beat = 本章内位置，0 起）；没在演示 = null
__atlas.setAutoplay(on)                         // 演示自动播放开关（写 sessionStorage `atlas:autoplay`）；引擎没有演示就返回 false
__atlas.setVoice(on)                            // 演示语音朗读开关（写 sessionStorage `atlas:voice`）；引擎没有演示或设备没有可用的声音就返回 false
__atlas.voiceLog()                              // 最近 10 段朗读 { text, lang, voice, part, started, ended, reason }
__atlas.setPaused(on); __atlas.setHud(on); __atlas.setPanels(on); __atlas.setCard(on); __atlas.setTheme('paper' | 'cinema')   // setPaused 在场景没注册 `pause` 时（TimeScene）什么都不做、返回 false；setTheme 写用户覆盖
__atlas.state()     // 场景快照 + { hud, paused, labels, reader, panels, playhead, preset, modes: {id: on}, appliedTheme }；playhead = 引擎正在显示的连续时间（数字；没有就 null）。goToChapter 非 instant 时在 TimeScene 里同用户换章（落在本章第一拍）；instant（截图、测试）= 本章自己的状态
__atlas.stats()     // { buffer, pixelRatio } 取自舞台 canvas，再合并引擎 stats()；SpaceScene 另有 camera = 舞台此刻的真实镜头 { position, target, fov }（不是 store 里的目标）
```

按钮带 `data-preset` / `data-mode`、`aria-pressed`；HUD 块带 `data-hud-panel`。

### 演示系统（core，`core/presentation/`）

PRESENTATION（P）是用户翻页的节拍序列，由 core 统一实现，引擎只写一个**适配器**说"一拍在我的舞台上是什么样"。文件：`beats.ts`（节拍模型，纯函数）、`autoplay.ts`（计时与两个会话开关）、`Presentation.tsx`（字幕卡 + 两级进度条 + 勾选框 + 收起按钮 + 飞行中的输入层）、`usePresentation.tsx`（hook）、`adapter.ts`（适配器接口 + SpaceScene 的类型桩）；语音在 `src/lib/speech.ts`；样式 `.atlas-present*` 在 `styles/scene.css`（两个引擎共用）。

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
  cardActions?: ReactNode;                                      // 可选：字幕卡里字幕下方的控件区（MathScene：作答托盘），点那里不翻页
  renderCaption?(beat, locale): ReactNode;                      // 可选：显示用的字幕（如竖排分数）；captionOf 仍是朗读的纯文本
  gate?(beat): Promise<void> | null;                            // 可选：要读者动手的拍，自动播放在它 resolve 后才计时，之前的输入不算停住
}
// Beat<B> = { chapter, chapterIndex, index, count, caption, audio?, spec?: B }（spec = 引擎自己的拍；默认拍没有）

const presentation = usePresentation(adapter);   // { beats, beat, presenting, isPresenting(), start(i | null, instant), stop(restoreHud), status, controls, element }
```

- **节拍模型**（`beats.ts`）：各章按顺序（背景章在最前）展开成一条列表；没写拍的章 = 一拍，字幕 = 章的 `summary`，没有就 `question`，再没有就章名（`defaultCaption`）。每拍知道自己在第几章（`chapterIndex`）、本章第几拍（`index`）、本章共几拍（`count`）。`chapterSpans`（进度条每章第一拍和拍数）、`startIndex`（进入时从当前章第一拍开始）、`stepIndex`、`current`、`presentationStatus`（`PRESENTATION 08/17`）都是纯函数，`tests/core/presentation.test.ts` 覆盖。
- **引擎要做的**：注册模式 `presentation`（P，`status: presentation.status`，`on: presenting`，`phone: false`，`set` 调 `start(null, instant)` / `stop(true)`）；`SceneControls.beats = presentation.controls`；ESC 链最前面 `if (isPresenting()) { stop(true); return true; }`；把 `presentation.element` 放在舞台上（覆盖舞台的绝对定位层）；演示中自己的舞台特例（TimeScene：只标这拍的高亮）按 `presenting` 做。`controls`、`start`、`stop`、`isPresenting` 身份稳定，可以放进 `useMemo` 依赖；适配器对象每次渲染新建也没关系（hook 读最新的那个）。
- **进入**：`onEnter` → `saveState` → 隐藏 HUD（宿主 `hud = false`，阅读面板随之收起、舞台占满）→ 预加载所有拍的 `audio` → 显示 `start` 要的拍（`goToBeat(i)`），没给就当前章第一拍。**退出**：ESC / P / H / "显示界面" / PRESENT 按钮；`restoreState` 放回进入前的场景，并恢复 HUD。
- **字幕卡**：舞台上只剩标题块（`data-hud-panel="present-title"`）和一张纸质字幕卡（`data-hud-panel="present"`，底部居中，宽 ≤ 1080 设计 px，细边框）。自上而下：**表头** `04 / 11 · 闪电战：法国沦陷 · 1940年6月 · 2 / 3`（章序 · 章名 · 适配器的 `readout` · 本章第几拍；背景章写"Background / 背景"，本章只有一拍就不写最后一段）；**字幕**（大号衬线，28 设计 px，拍开始后约 1.6 s 淡入，`instant` 时直接出现；最多约四行，更长的在卡内滚动）；**两级进度条**：每章一段（等宽，段下写 `BG 01…11`，当前章 signal 橙），当前章再按拍切小段；已读过的章填墨色，当前章填到当前这一拍。点章段 = 那一章第一拍，点小段 = 那一拍（都是带 `aria-label` 的 `<button>`）；手机宽度不画编号。卡片右上角一个小 ⌄（`.atlas-present__tuck`，`aria-expanded`，44 px 命中区）把卡片收成 24 设计 px 的一条（只留表头），下一拍自动展开。
- **翻页与自由查看**（Gavin 2026-10-10："切换时系统主动切走，停下后允许用户放大缩小拖动；进入下一环节再接管"）：一拍开始时系统拿走镜头——舞台上盖一层输入层（`.atlas-present__hit`），飞行中拖动 / 缩放 / 点击都不作用于舞台、也不翻页。这拍**落定**（`afterSettle`：引擎的镜头落定，且字幕淡入完 `CAPTION_IN_MS` = 2.2 s；`instant` 立即）后输入层撤掉（`.atlas-present[data-free]`），读者可以拖动、缩放地图（TimeScene）或旋转、缩放模型（SpaceScene）；点地图 / 模型**不翻页**，也不改选中（TimeScene 不选事件，SpaceScene 改回这拍的 `part`）。下一拍（或任何跳转）重新接管：从读者留下的镜头飞到下一拍；读者拖动后还没写回的镜头在过渡时丢弃。翻页只有：在字幕卡上**原地点一下**（按下到松开位移 ≤ 6 px，不在卡上的按钮 / 勾选框 / 进度条上）、→ / 空格（下一拍）、←（上一拍；捕获阶段，先于宿主的换章键）、进度条；到最后一拍停住。整层 `.atlas-present` 是 `pointer-events: none`，只有字幕卡自己的区域接收输入，标题块不接收。ESC / 退出照旧恢复进入前的场景。
- **自动播放**：进度条右边的"Auto-play / 自动播放"勾选框（默认不勾，sessionStorage `atlas:autoplay`）。拍**落定**后（适配器的 `afterCameraSettle`，或 `applyBeat` 返回的 promise，都没有就拍开始后 2.3 s；`instant` 立即）开始计时：这拍有 `audio` 且在播就等播完；Voice 在读就等最后一段真正 `end` 再停 0.6 s，`end` 丢了才用兜底 3 × 预计朗读时间（字数 ÷ 12 字/秒，至少 6 s，每多一段加 3 s）；否则停留 clamp(4 s + 60 ms × 字幕字数, 6 s, 20 s)。期间任何用户输入（点击、拖动地图 / 模型、按键、滚轮、点进度条）让这一拍停住（勾选框文字变弱），下一拍重新计时。
- **语音**（`lib/speech.ts`，Web Speech API，不用音频文件、不联网）：自动播放旁边的"Voice / 语音"勾选框（默认不勾，sessionStorage `atlas:voice`）。拍落定后读 `captionOf` 给的字幕（`speakableText` 去掉标记和来源上标，数字照写；只读页面语言，不读表头）；这拍有 `audio` 文件则以文件为准、不朗读。**章节开场**：进入一章第一拍（或跳到与上次读过字幕的不是同一章）时，先读章号（`chapterNumberText`：en "Chapter seven"，zh「第七章」；背景章读"Background / 背景"），再读章名，再读字幕——一个队列（`speakSequence`），段间 ~350 ms（`PART_GAP_MS`，定时器，不用 SSML）；字幕开始读时才算已播报。换拍、关 Voice、退出演示一次取消整个队列。**防提前结束**（`speak`）：先 `cancel()`，下一帧（兜底 120 ms）再 `speak()`；每段带令牌，被取代 / 取消的那段的事件一律忽略；`canceled` / `interrupted` 错误不推进；快于每秒 60 字的 `end` 记为 `spurious-end`、不推进；Chrome 系每 10 s `pause()` + `resume()` 保活（Safari / iOS 不做）；回到前台 `resume()`；勾选时静音预热一次（iOS / Safari 要用户手势）。选声 `pickVoice`：en 先 en-GB 再 en-*；zh 先 zh-CN / zh-SG 再其他 zh-*，繁体和粤语最后；本地声音优先；再按偏好名字（zh：Tingting、Meijia、Lili、Xiaoxiao；en：Daniel、Samantha、Aria、Libby）；`utterance.lang` = `zh-CN` / `en-GB`，语速 0.95，音高 1。Chrome 的声音列表异步加载（`voiceschanged`）；没有可用声音时勾选框禁用，title「No voice available / 此设备没有可用的语音」，`setVoice(true)` 返回 false。调试 `__atlas.voiceLog()`（最近 10 段，`part`：`chapter` / `title` / `caption`，`reason`：`end` / `cancelled` / `spurious-end` / `error:<码>`，朗读中为 `null`）；`tests/core/speech.test.ts` 用假的 `speechSynthesis` 测队列与取消语义。
- 界面文字是 `present.*` UI 键，两个引擎共用：`present.title`（标题块小字）、`present.beats` / `present.beat` / `present.beatChapter` / `present.beatBackground`（进度条的无障碍名）、`present.autoplay(Hint)`、`present.voice(Hint|None)`、`present.mode`（模式名 / 控制面板行）、`present.tool`、`present.button` / `present.hint`（TimeScene 底部条的 PRESENT 按钮）。
- **SpaceScene**：`adapter.ts` 的 `SpacePresentationAdapter = PresentationAdapter<SpaceBeatSpec, SpaceSavedState>`，实现在 `space-scene/View.tsx`（见「SpaceScene · 演示」）。

### QA：`pnpm shoot`（`scripts/shoot.ts`）

skill 里 `shoot.py` 的 Playwright / TypeScript 版，驱动 `window.__atlas`。**先 `pnpm build`**（脚本自己在随机端口上起一个只读静态服务器服务 `dist/`，不起 dev server；`dist/` 不存在会直接报错退出）。

```bash
pnpm shoot sample-space                      # 每章 + 每个模式 + 额外预设 + hero-clean -> shots/sample-space/en-paper/*.png
pnpm shoot sample-time --locale zh --theme cinema --size 3840x2160 --suffix _4k
pnpm shoot sample-time --keys --layout       # 键位同步 + 八尺寸 HUD 布局（有 `--keys` / `--layout` / `--beats` 且没给截图名时不截默认图）
pnpm shoot ww2 --beats                       # 每一拍一张 -> shots/ww2/en-paper/beat-<章 id>-<n>.png（n = 本章内第几拍，从 1 起）；脚本核对 state().presentation 与 HUD 隐藏，没落到就失败；这拍要标的 id 里没有标注的（锚点在画面外或对应图层没开，多半是内容 / 镜头问题）逐条打印，不算失败——TimeScene 看 `highlight` 与地图标签 `.ts-co`，SpaceScene 看拍的 `labels`（`.space-leaders` 的 `data-want`）与引线标签 `.space-co[data-id]`（组标注是 `group:<id>`）；SpaceScene 再逐拍全页加载 `?ch=<章>&b=<n>`，场景与演示里的不同（试一试值、视图、图层、镜头、hide …）或时间线不在终态就失败（`beat links: N of N`）；`--beats` 末尾还按同一办法列出每章自己 `state.highlight` / `state.labels` 里在章节镜头下没有标注的 id（`chapter highlights`），同样不算失败
pnpm shoot sample-space --perf --json out.json   # 每张图后多等 2 s，打印 calls / triangles / fps / gpu；--json 写全部结果
pnpm shoot sample-time --shots mine.json hero    # 自定义截图表（{name: {chapter?, preset?, modes?, hud?, wait?, js?}}）
```

- `--locale en|zh|all`、`--theme paper|cinema|all`（也接受逗号列表），默认 `en` + `paper`；`shots/` 已 gitignore。主题用 `__atlas.setTheme()` 切换。`--gpu` 改用真 GPU（macOS 走 Metal），默认软件 GL（SwiftShader，与 e2e 相同），fps 数字只在 `--gpu` 下有意义。
- GPU 工作站可用 `ATLAS_E2E_GPU=1 CI=1 pnpm e2e` 跑同一套浏览器测试（macOS 使用 Metal）；没有该变量时仍用默认 SwiftShader。此开关不减少用例或放宽断言。
- 默认截图：每章一张；首章上每个注册模式各一张（`presentation` 除外；默认开着的模式截"关"，文件名 `mode-<id>-off`）；非章节预设（`orbit` / `reference` / `world` / `theatre` / `presets.json` 里的）各一张；`hero-clean`（HUD 关；SpaceScene 这时是封面镜头，等 0.8 s 的飞行做完）。截图表里 `preset` 和 `modes` 同时写也落在预设镜头上（不用 `js` 延时）。每次截图前把模式、HUD、暂停恢复到加载时的状态（阅读面板、卡片、泳道这些宿主 / 引擎 UI 状态不复位，自定截图表里的 `js` 要自己摆好）。
- `--keys`：对 `keymap()` 逐项按键：预设（`state().preset` + `[data-preset]` 的 `aria-pressed`）、模式（状态翻转 + `[data-mode]` 的 `aria-pressed`，再按一次恢复；按钮在控制面板里，面板收起也照样在 DOM 里；按钮被禁用则跳过）、SPACE、H（HUD 隐藏且"H 显示界面"可见）、ESC（HUD 隐藏后恢复）、← →、`,` / `.`（注册了 `beatStep` 的引擎：当前拍在拍表里前后移一格、不进演示、对应刻度 `data-filled`）；最后拖动舞台应变 FREE CAMERA（没有预设亮着），再按预设应收回。
- `--layout`：3840×2160 / 2560×1440 / 1920×1080 / 1600×900 / 1280×720 / **1024×768** / 900×1200 / 390×844 × 每章 × 额外预设，用 `tests-e2e/hud-layout.ts` 的 `hudLayoutIssues()`（与 `pnpm e2e` 共用同一份逻辑）查 `[data-hud-panel]` 出屏 / 重叠（1 px 容差）/ 横向溢出 / 内容比面板宽，并存 `layout-WxH.png`；舞台带 `data-stage-free="w h"`（MathScene：模型的空间）时另查"舞台被挤"（宽 < 200 px（手机 150）或高 < 100 px）。每个尺寸再全页加载，**从链接打开**每一章（`?ch=<章>&b=2&theme=…`：分享出去的节拍链接，HUD 和阅读面板在加载时排版，不是换章后），同样查一遍，存 `layout-WxH-linked.png`（没有节拍的引擎忽略 `b`）。
- 一直收集 console error / warning、pageerror、同源 4xx/5xx 和任何指向外部主机的请求（违反"无运行时外部请求"）；GPU / SwiftShader 噪音与 smoke.spec.ts 同一过滤。退出码 1 = 有 error / pageerror / 外部请求 / 键位失败 / 布局问题（warning 只打印）。
- 轨道阻尼按帧数衰减，软件 GL 下拖动后要几秒才回写相机，`--keys` 的 FREE CAMERA 检查已按此放宽。
- 拍链接与排版链接都在本会话的同一个标签页里整页加载（`Session.load`）：每次是新的 document 和 store，前一个 WebGL 场景随之释放——不再开第二个标签页，否则留在后面的演示场景（一直开着的流在暂停时也照画）会和要检查的场景抢软件 GL；舞台 60 s 内没有 ready 就让这次运行失败。查完再按会话打开时的样子重新加载主题（`Session.reopen`：主题页 + 当前主题色），后面的检查照旧从加载状态开始。

### HUD 缩放与响应式

- `--k = clamp(min(W/1920, H/1080), .6, 1.6)`（手机 = 1），SceneHost 在 resize 时写到 `.atlas-scene`。
- 实际排版用 `--u = --kt px`，`--kt = max(--k, .8)`：HUD 文字不小于 1080p 尺寸的 80%（720p、平板的可读性下限）。
- **HUD 字号刻度**（设计像素，k = 1；`tokens.css` 的 `--hud-font-*`，面向小学生的笔记本屏）：最小 10 px（`label` 10.4 / SVG 里的 mono 刻度 10）、状态行与键位提示 ≥ 10.5（`status` 10.8）、按钮 11.1、面板标题与正文 11.3、标题块 30。写新 HUD 文字用这些 token，不要再写 < 10 的 `calc(N * var(--u))`；viewBox 里的 SVG 文字（部件链路卡）按渲染比例折算，保证渲染后 ≥ 10 px。`--kb = max(1, --k)`：触控控件和阅读正文只放大不缩小（4K 时 `bottomBar` / `stageOverlay` 用 `zoom: var(--kb)` 放大）。
- ≥1440 完整；1080 完整略小；高度 ≤ 820（720p）MathScene 的底部三面板折成一行标签页（点开一块），高度 ≤ 760 SpaceScene 的 PLATE 块去掉立面缩略图；< 1024 InfoPanel 变底部抽屉（不能收成竖条）；< 1180 宽或触屏顶栏中段（VIEW + PRESENT）独占第二行居中，VIEW 组放不下再折成多行（没有下拉菜单）；< 760（手机）隐藏示意卡、三面板、perf、引线、规格表、键位提示、顶栏章节芯片、VIEW 组和 PRESENT，章节轨折成编号芯片条；标了 `phone: false` 的模式（TimeScene G / P、SpaceScene R）在控制面板里不画行。
- 任何尺寸不得重叠、不得横向溢出：`tests-e2e/hud-layout.ts` 的 `hudLayoutIssues()` 在 3840×2160 / 2560×1440 / 1920×1080 / 1280×720 / 900×1200 / 390×844 × 每章 × 中英检查所有可见 `[data-hud-panel]`（`tests-e2e/hud.spec.ts`，`pnpm e2e` 的一部分）。

### 主题

- token 在 `src/theme/tokens.css`（`paper` = 技术图版标准实现 / `cinema` = dark plate）。功能色每个只表达一个含义：`--cold` `--hot` `--loop` `--neutral` `--signal` `--xray` `--cut`；墨与线：`--ink` `--ink-2` `--ink-3` `--hair` `--line`；旧名（`--accent-*`、`--bg`、`--surface`、`--border`…）映射到它们上。HUD 元素圆角 `--radius-hud`（1px），阅读面板 6px。
- 字体：`IBM Plex Sans Condensed`（`--font-hud`，400/500/600，latin + latin-ext）与 `IBM Plex Mono`（`--font-mono`，400/500，latin）由 `src/styles/fonts.css` 自托管（只引 woff2，构建进 `/_astro/`）；中文回退系统字体；孩子读的正文保留 `--font-serif`。组件里只用 `var(--x)` 或 Tailwind 映射类（`bg-surface text-ink-muted border-border`），不写死颜色。
- 优先级：用户全局覆盖（localStorage `atlas:theme`）> 场景主题（URL `theme=` 或章节累积的 `state.theme`）> `topic.yaml theme` > `paper`。首帧前由 BaseLayout 内联脚本按同一规则设置 `data-theme`，无闪烁。
- 数据里的颜色写 `token:accent-1` / `#hex`；DOM/SVG 用 `resolveColorRef(ref)`（得到 `var(--accent-1)`，随主题自动变），canvas/WebGL 用 `resolveColorRef(ref, readThemeTokens())` 取实值，并在主题切换后重读。
- MapLibre：`buildMapStyle({ sources: { land, water?, rivers? } })` 从当前 token 生成底图 style（只有 GeoJSON source，无 glyphs/sprite/瓦片）。二期加 symbol 标签需要本地 glyphs，放 `public/fonts/`。主题切换时重建 style（监听 `<html data-theme>` 变化即可）。

### 年级、索引页与偏好

- 站点不展示年级：没有年级选择器、章节轨没有年级芯片、规格表没有年级行；所有章节始终可进入，←→ 和上下章按钮逐章走。`level` / `levels` 只是 `topic.yaml` / 章节 / 零件上可选的规划元数据（schema 接受缺省，不渲染）。
- 索引页（首页，视觉语法见 docs/08 §9）**只列 `status: published` 的主题**，自上而下：扉页（标题 + 最多五幅精选插图的构图）→ 六类学科行（固定 science / math / history / geography / biology / computer，每格一个 hairline 图标 + 计数，兼作筛选；没有已发布主题的类别用点线框画“即将推出”并禁用；手机上横向滚动、吸附）→ 图版目录（每个主题一张“图版”卡）→ 页脚声明 + 藏书票。卡片标签只有学科和类型（`mode`：`time` → 时间 / Time，`space` → 空间 / Space，`both` 两个都有，`lesson` → 课 / Lesson）；`PLATE NN` 按目录顺序编号；统计行由数据算出（`src/lib/home.ts topicStats`，不需要新字段）：TimeScene = 章 · 事件 · 地图（`control.json` 关键帧数），SpaceScene = 章 · 部件，MathScene = 步 · 小题 · 练习题。主题超过 9 个（`SECTION_THRESHOLD`）时目录自动按学科分节（`catalogueLayout`），学科格同时是筛选和锚点（点了滚到那一节）；单栅格里主题数为奇数时末尾补一张点线的“更多图版正在绘制”卡（列出即将推出的学科，筛选时隐藏）。
- `topic.yaml` 的首页字段（都可选）：`illustration: <stem>`（`public/illustrations/<stem>.webp` + `@2x`，见下条；还没做出来时卡片画点线占位框 + 学科图标，扉页跳过它；运行时图片加载失败也退回占位框，`src/lib/drawing-fallback.ts`）、`shortTitle: { en, zh }`（扉页引线标签用的短名，缺省用标题）、`featured: true | <名次>`（上扉页；`1` 占最大位，然后 2、3…，`true` 排在有名次的后面、按目录顺序；最多五幅，只取有插图的；一个都没标就取目录里前五个有插图的）。
- **首页插图**（`scripts/illustrate.ts`，只用 sharp）：透明底石墨铅笔素描，科学图版风格，无彩色。
  - `pnpm tsx scripts/illustrate.ts process <src.png> <stem>`：按 alpha 裁掉透明边、补成正方形（四周留 6 %）、去色，导出 `public/illustrations/<stem>.webp`（800 px，目标 ≤ 90 KB）和 `<stem>@2x.webp`（1600 px，≤ 260 KB），质量从 82 起每次降 6 直到进预算；同时把 16×16 的覆盖掩码写进 `src/lib/illustrations.json`（扉页用它把引线锚点吸到有墨的地方；清单里有这个 stem = 插图存在）。
  - `pnpm tsx scripts/illustrate.ts gen <stem> "<subject>"`：在临时目录里跑 `codex exec --skip-git-repo-check -C <tmpdir> "<共用风格 brief + subject>" < /dev/null`，再对结果跑 `process`。brief（`STYLE_BRIEF`）：精细石墨铅笔科学图版、排线与点描、只用石墨灰，无彩色 / 纸纹 / 背景 / 边框 / 文字 / 投影，透明 PNG，主体约占 1024 方形的 85 %。生成的图先看一遍再用（历史主题的插图不带任何一方的国徽、机徽或旗帜）。
  - 换图：重跑 `process`，`src/lib/illustrations.json` 和两个 webp 一起提交；`tests/home.test.ts` 检查每个已发布主题的插图都在、在预算内。首页截图：`docs/screenshots/index/{en,zh,dark,phone-390}.png`（1600×900，手机 390×844）。
- 外观与语言是两个 hairline 下拉菜单（`widgets/Dropdown.tsx`，`hud-btn` 语法）：“LOOK ▾”（Auto / Paper / Cinema）、“EN ▾ / 中文 ▾”（English / 中文）。索引页和主题 HUD 共用；键盘可用（Enter/空格/↓ 打开，↑↓ Home End 移动，Esc 或点外面关闭），点击区 ≥ 44px。语言切换保留路径、query 和 hash。
- 读写偏好走 `src/lib/prefs.ts` 的 hook（`useThemeOverride`；语言偏好用 `setSavedLocale`；阅读面板收起用 `getReaderExpanded / setReaderExpanded`、底部面板收起用 `getPanelsExpanded / setPanelsExpanded`、右上卡折叠用 `getCardExpanded / setCardExpanded`，sessionStorage），不要直接碰 storage；场景状态不进 storage，只进 URL。

## 约束清单（每次改动自查）

- 纯静态：无 SSR、无 API 路由、客户端无 Node API
- 无运行时外部请求：无 CDN、无外部 webfont（字体自托管）、无瓦片
- 客户端不引 zod（构建期解析）；JS 预算 300 KB gz（docs/02）。实测（`pnpm shoot` 打印的 page JS，gzip -9）：宿主 + HUD + 引擎 View 首屏约 105 KB；SpaceScene 页整页约 340 KB（three + R3F 舞台 chunk 225 KB 懒加载）；TimeScene 页整页约 391 KB（MapLibre 在 controller chunk 285 KB 懒加载）。**地图主题超预算，是已知遗留，待产品层决定**
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
stages/geo/style.ts        MapLibre 样式（纯函数，有单测）：底图、1:10m 东南亚、岛尺度陆地、区域图版（陆地 / 河流 / 纸边）、数据图层
stages/geo/rivers.ts       区域图版的河名（HTML marker，沿河倾斜，跟 N 开关）
stages/geo/territory.ts    领土名称（谁占着哪里，跟关键帧淡入淡出、按屏幕面积分级、避让）；纯算法在 lib/territory.ts（polylabel、分级、配对、贪心放置，有单测）
stages/geo/leaders.ts      引线标注（两列、避让、逐帧投影）
timeline/Timeline.tsx      唯一的底部条（bottomBar）：泳道开关 · 标尺 · 状态串，下方可展开三条泳道（PRESENT 在顶栏）
hud/HudPanels.tsx          card 参与与面积条带卡（可展开、行可点）、perf 读数
hud/shared.tsx             useSize / usePlayheadT / useUnit / 斜线图案 / 章节时间窗
EventInspector.tsx         点事件 → inspector 插槽（Counter / 双方 CounterVersus；细看折叠块；来源上标；伤亡始终显示）
EntityInspector.tsx        点参与卡的一行 → inspector 插槽（名称、阵营时段、加入 / 退出、当前面积）
lib/time.ts lib/format.ts lib/geo.ts lib/model.ts lib/frame.ts lib/playhead.ts lib/ticks.ts lib/segmentScale.ts lib/stats.ts lib/bloc.ts lib/control.ts lib/bandRows.ts
lib/region.ts lib/rivers.ts lib/holders.ts lib/dated.ts lib/localLand.ts   纯函数，单测在 tests/time-scene/
colors.ts  time-scene.css
```

### 作者怎么写数据

四个文件放 `data/`（schema 见 docs/03 §A 与 `schema.ts`）：

| 文件 | 要点 |
|---|---|
| `entities.json` | `id, name, bloc, joined, left?, color?`。`bloc` 是 `axis/allied/neutral` 之一（引擎只有这三个值，**显示名按主题改**：`topic.yaml` 可选 `blocLabels: { axis?, allied?, neutral?, out? }`，每项 `{ en, zh }`，`out` = 图例的“已退出战争”；图例、实体详情、实体引线说明都先读它，缺省回退全站 `time.bloc.*`，解析在 `lib/blocLabels.ts` 的 `blocLabel()`；一战：`allied` = 协约国、`axis` = 同盟国；实体不能随时间改名，要换名写在控制区 `label` 里），或**换阵营**时按时间排的数组 `[{ "bloc": "axis", "from": "1940-06-10", "to": "1943-10-13" }, { "bloc": "allied", "from": "1943-10-13" }]`（`[from, to)`，只有最后一段可省 `to`，段不能重叠；第一段之前按第一段算，空档里按刚结束的那段算，`sideAt(entity, t)` 在 `lib/bloc.ts`）。**`joined` 之前和 `left` 之后一律按 `neutral`（`blocAt`）**：地图填充、participation、地名、右上卡面积带、图例的“已退出战争”项（`time.bloc.out`）都用它；事件 / 行动的阵营色仍用 `sideAt`；右上卡行数多时只画 `t` 时在战的实体（有面积的在前，按 `t` 时面积；其余按 `joined`），不在战的进“+N others”。颜色默认取 `t` 时所在阵营的 token：地图控制区、participation、地名、实体引线说明、右上卡的面积带都跟 `t` 走，卡上的参与线按段分色；行动和事件用它们开始时的阵营色；图例对换阵营的实体每个阵营列一行。`color: "token:accent-3"` 或 `#hex` 覆盖（不随阵营变）；列国地图用 `token:holder-N`（见「按国配色」）。`joined` 驱动 participation 图层"点亮"和右上卡的参与线。 |
| `control.json` | `keyframes[]`，按时间严格升序，`properties.holder` = 实体 id，同一实体可有多个面（或 MultiPolygon）。**两种写法任选**：① GeoJSON：`{ "keyframes": [{ "t", "features": FeatureCollection }] }`（小主题、手写，如 sample-time）；② TopoJSON：`{ "topology": Topology, "keyframes": [{ "t", "object": "<topology.objects 里的名字>" }] }`——所有关键帧共用一份拓扑（不变的海岸、边界只存一次，量化 + 差分编码），大主题（ww2 的 12 帧）用它。拓扑只做宽松校验（`type: "Topology"`、`arcs` 数组、`objects` 记录、`transform` 可选），解码后每个要素按普通控制区要素再校验（`holder` 存在于 entities、环闭合、经纬度范围）。引擎在建 `TimeModel` 时用 `topojson-client` 的 `feature()` 把每帧解成 FeatureCollection（`lib/control.ts` 的 `decodeControl`，顺手把环改回 RFC 7946 绕向，MapLibre 靠绕向分外环和洞），之后的帧、面积、渲染全都不知道有两种写法。ww2 的 `control.json` 由管线生成（见「Geo pipeline」），不手写。面积（右上卡）在客户端按球面公式算，不用写。 |
| `movements.json` | `from/to` 时间区间 + LineString `path`（从起点画到终点）。`strength`（可选，0 或缺省 = 未知，不显示“N 人”）决定线宽（1–3 px，相对全主题最大值）。**过日界线**：schema 把经度限在 -180..180，作者照实写跳变即可（`… [179.5, 38], [-175, 33] …`）；建 `TimeModel` 时 `unwrapPathCentred`（`lib/geo.ts`，思路同 `unwrapRing`）把相邻点经度差超过 180° 的后续点整体 ±360°，让线走近路（MapLibre 会把 >180 的经度画进邻近世界副本），再把整条路径平移 ∓360° 使其中心落在 -180..180。之后切线（`sliceLine`）、箭头头部、引线锚点、剧场镜头的包围盒（`model.bounds`）全部用 `MovementN.path`（展开后的坐标），不要再读 `movement.path.coordinates`。珍珠港航线（147.7°E 44.9°N → 158°W 23°N）展开后经度 147.7 → 202，长约 5,800 km，不是绕地球一圈的 30,000 km。可选 `linger`（`timePoint`，须晚于 `to`、同一时间标尺）：默认 `to` 之后整条线立刻消失；写了 `linger`，`to` 到 `linger` 之间画完成的整条线（40% 不透明，箭头停在终点），过了 `linger` 在约 2% 时间跨度内淡出。lingering 的线不计入状态串的 MOVEMENTS。可选 `persist: true`（docs/24 C2-lite：输水管、铁路这类**建成后一直在**的线，不能与 `linger` 同用）：`from`→`to` 照常画出，`to` 之后整条线以 `PERSIST_OPACITY`（90%），实线底与虚线同样清晰、线宽在 zoom 10→13 从原宽增至 2.5 倍（普通行动与 `linger` 不变），一直保留到时间轴末尾、不画箭头头部（`MovementFrame.persisting`）；`from` 可等于 `to`（建成那天整条出现）。同样不计入 MOVEMENTS。 |
| `events.json` | `t`、可选 `until`、`at`、`kind`、`importance`（**3 最重要 = 点最大**，1 最小）、`sides/forces/casualties/result`。`kind`：`battle`、`landing`（这两种必须有 `sides` + `result`）、`bombing`（必须有 `sides`）、`surrender`、`political`、`massacre`、`siege`、`evacuation`、`liberation`、`atrocity`、`disaster`（流感、饥荒、击沉客轮；不分阵营）、`site`（`bombing` 以外新增的各种 `sides`/`result` 都可选）。可选 `detail: { en, zh }`（inspector 里默认收起的"细看 / More"）与 `sources: ["S1", "S7"]`（`sources.json` 的编号，inspector 摘要后显示 mono 上标，点开来源弹层）。`sensitive` 只是可选元数据，不影响显示。 |
| `presets.json`（可选） | `{ "presets": [{ "id": "singapore-island", "label": { "en": "Singapore", "zh": "新加坡" }, "camera": { "center": [103.82, 1.35], "zoom": 9.2 } }] }`。注册成镜头预设，排在 `world` / `theatre` 之后（`world` = 1、`theatre` = 2，这些从 3 起编号，第 10 个是 0，再往后只有按钮）；`label` 是按钮文字（一两个词）；正文 `<FlyTo preset>` 用这些 id。VIEW 组只放地理预设，章节不是预设。 |
| `sources.json`（可选） | 见上文"加一个主题"第 4 步。 |
| `glossary.json`（可选） | 名词表，见「名词表」。 |

**`site` 事件**是静态点位（监狱、纪念碑、建筑）：`t` 照写但不参与时间——不进时间轴范围、不进泳道和统计、不脉冲；只在 `sites` 图层打开时显示（小空心菱形 + 中心点），点击同样打开 inspector（眉题 `P-01`），高亮时出引线标注。

章节 `state`：`time`（ISO 三种精度或 `{ ma }`）、`camera`、`layers`、`highlight`（实体/行动/事件 id）、`theme`、`note`（只在背景章：阅读说明）、`summary`（`{ en, zh }`，阅读面板标题下的一句话，也是默认演示字幕）、`question` / `answer`（`{ en, zh }`；没有 `summary` 时阅读面板头部显示 `question`；`answer` 必须配 `question`，目前不渲染），以及可选的 `beats`（演示节拍，见下）。底部条上每章一段，段从本章 `time`（第一拍更早就取第一拍的 `t`）开始，段里每拍一个刻度——**拍就是时间轴的结构**；**章节顺序必须等于时间顺序**（`tests/schemas.test.ts` 对 ww2 有检查）。

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

### 按年份出现的图层（`datedLayers`，docs/34 §4 E1）

静态点、线、面不必写成事件或重复控制区。`topic.yaml` 配置：

```yaml
datedLayers:
  - id: housing-blocks
    file: sg-housing-blocks       # public/geo/sg-housing-blocks.json
    kind: point                  # point | line | area
    holder: housing              # entities.json 的 id；与控制区走同一配色路径
    label: { en: HDB blocks, zh: 组屋 }
    count: true                  # 左列 PLATE 中显示当前可见数
    countLabel: { en: HDB blocks, zh: 组屋 }   # 可选：PLATE 行的短名（缺省用 label；只配 count: true）
  - id: dated-rail
    file: sg-dated-rail
    kind: line
    color: token:holder-6        # holder 或 color 至少一个；只接受已定义的颜色 token
    label: { en: Railway, zh: 铁路线 }
```

- 文件必须是 **TopoJSON，且只有一个与 `file` 同名的对象**。`point` 对应 Point / MultiPoint，`line` 对应 LineString / MultiLineString，`area` 对应 Polygon / MultiPolygon。可以量化（带 `transform`，管线 `quantization=100000` 的输出照用）。每个几何的 `properties` 至少 `{ f: 1960 }`；可选 `u: 1980`、`certainty: approximate`（缺省 `certain`）、`h: 12`（楼层元数据，本轮不按高度改点大小）。`f` / `u` 是**有限的十进制年数字**，预先转换 ISO 日期；`f < u`，无 `u` 表示一直保留。语义复用 `lib/dated.ts` 的 `[from, to)`：开始年出现、结束年消失。数组宜按 `f` 排序；引擎载入时只把日期索引排序一次，几何顺序不影响结果。
- 章节及拍的 `layers` 直接写图层 `id`，比如 `[base, control, housing-blocks, dated-rail, battles]`；没列出即关闭。图层文件的年份不另行扩展时间轴范围，章节日期或控制区关键帧（不是拍的日期）应覆盖要展示的年代。控制面板 LAYERS 每层一行，开关和章节共用 store（URL 状态同其它图层）。KEY 每个开启图层一行；点图层另有“过去一年新增”图例。
- 每层一个 GeoJSON source，载入后只 `setData` 一次。MapLibre GPU 过滤数字属性：`f <= T && (u ?? +∞) > T`；点半径随缩放为 1.2–3 px。过去一年新增点（`T-1 < f <= T`，且尚未消失）大一号、signal 色描边。线宽从 zoom 10 的 1 px 线性增至 zoom 13 的 2.5 px，不透明度 .9；面淡底 .35、同色 .6 px 边，近似面淡底再 ×.7、边虚线。放在控制区之上、事件之下；颜色随 paper / cinema token 更新。
- `lib/datedLayers.ts` 对开始、结束和新增窗口的结束边界各建有序索引，二分求当前计数。只在**可见集合变化**时重设过滤器（不是只比较计数：同年拆一栋又建一栋也要更新）；播放头在两次边界之间缓动不会逐帧 `setFilter`。新增窗口同样单独缓存。
- `count: true` 的当前可见要素数出现在左列可收起的 PLATE 块，关闭图层读数为 0，尚未载入为 `—`；手机随 PLATE 隐藏。MultiPoint 按一个要素计数，要按楼栋计数请每栋写一个 Point。`stats().datedLayers[id]` 给出 `total / visible / recent / filterUpdates`，用于性能与边界回归检查；关闭时 `visible` 为 0。
- `pnpm validate` 检查文件、对象、几何、日期区间、holder、token、双语以及章节 / 拍的图层引用；图层 id 与其它主题对象共用唯一命名空间，不能占用内置图层名。
- 控制区允许空帧：GeoJSON `features: []`，或 TopoJSON 空 `GeometryCollection`。交叉淡化可淡入 / 淡出空帧，空帧无控制区名称、颜色图例与 REFERENCE 轮廓，关键帧状态串继续显示正常序号。
- 中性事件 `kind: milestone`（Milestone / 里程碑）不要求 sides / result；墨色点加环，与 political 的中性画法相同，KEY 有独立一行，详情眉题显示里程碑。
- 开发示例 `sample-dated-layers`（draft）：仅 fixture 使用新加坡形状范围内的合成建筑点及合成线面，峰值同时可见 10,000 个点；占位数据不能当作实际土地用途资料。生成方式、计数边界及来源说明在 fixture 的 `data/SOURCES.md`。

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
- store 里的 `t` 是日精度 TimePoint（进 URL）；地图按连续的"播放头"渲染。**换章 = 第一拍**（Gavin 2026-10-10："点第二段不要自动播放全部"）：用户选章（底部条的段、章节轨、顶栏章节号、← →、Next / Back；不含深链、不含演示、不含 `instant`）时，章节过渡（reason `chapter`）照常发出（阅读面板收起时的条照样闪），紧接着（微任务）把本章**第一拍**的状态（`t`、`camera`、`layers`、`highlight`）用 `applyState` 套上：镜头飞（2.2 s），播放头 1.6 s 缓动到第一拍的 `t`。没有自动跑、没有 `RUNNING`。没写 `beats` 的章，章本身就是它唯一的一拍。点底部条上的拍刻度 = 那一拍的状态（同一个 `applyBeatState`；拍属于别的章就连章一起换；不进演示，HUD 和阅读面板保持原样）。深链和 `goToChapter(id, { instant: true })` 仍是本章自己的状态（截图的章节图、`--beats` 的章节高亮核对不变）。**随时可以拖播放头**：拖动 / Shift+←→ 直接移动播放头并 `patch({ t })`，不换章。没有自由播放（时间只随换章、拍、演示和拖动走）。
- 读数格式 `formatTime(t, locale, precision?)`：`15 Feb 1942` / `1942年2月15日`；`200 Ma` / `2亿年前`、`6600万年前`；公元前 `221 BCE` / `公元前221年`。跨度 >12 年时读数降到月，>100 年降到年。HUD 里的 mono 读数用 `formatReadout`（英文大写：`15 FEB 1942`）。
- **公元前**（docs/27 G1–G3）：ISO 年份前加 `-`、四位数字（`"-0770"`），YAML 里**一律加引号**（不加引号是数字）；比较一律 `compareTime`（字符串比较会把 `-0300` 排在 `-0400` 前面）。`toNumber('-0221')` = -221（JS 的天文纪年：只要全站一致，排序和显示都对；跨公元前 1 年 → 公元 1 年时算出的时长多一年，见 docs/27 G12）。URL `t=-0350`、`t=-0221-12-31` 原样往返。状态行遇到公元前写读数（`350 BCE`），不写 `-0350`。
- **`datePrecision`**（topic.yaml，`day | month | year`）：显示到哪一级为止。`year`：读数、段标签、拍的小卡、事件 / 实体详情、引线日期、REFERENCE 横幅只写年（`'-0260-05'` 读作 `260 BCE`），拖动写回 store / URL 的 `t` 也只到年（`t=-0350`）。模型上是 `model.datePrecision`（`buildTimeModel(data, chapters, { datePrecision })`），格式化时取它与跨度精度中较粗的一个（`coarser`）。
- **跨公元前后的主题**（docs/43 E1）：时间跨度从公元前进入公元（`min < 0 < max`）时模型记 `mixedEra: true`，公元 1–999 年写成 `150 CE` / `公元150年`（读数、状态行、段标签、参与卡刻度、事件 / 实体 / 引线的日期，`formatTime` / `formatTimeRange` / `yearLabel` / `ruleTicks` 的 `ce` 参数），免得紧挨着 `260 BCE` 的 `150` 被看成别的东西；公元 1000 年以后、公元前，以及只在一边的主题，输出逐字不变（`tests/time-scene/mixed-era.test.ts`）。
- 刻度 `ruleTicks(min, max, scale, maxMajors, locale)`（`lib/ticks.ts`）：按跨度和宽度自适应，取主刻度数 ≤ `maxMajors` 的最细一档——几个月：主 = 月（1 月写年份）、次 = 每月 8/15/22 日；几年：主 = 年、次 = 月；更长：5/10/25/50/100… 年；地质：0.1–1000 Ma 档（如 10 Ma / 1 Ma），标尺右端写单位 `MA` / `百万年前`。

### 底部条（`bottomBar`，TimeScene 唯一的底部块）

TimeScene 不注册 `panel01–03`，宿主因此不画底部三面板带；原来三块的内容并进这一条：

```
[▾]  ○──○○○○──│○○─○──○│○─○─○│ … │○──○─◉─○│ …    32 / 34 · 3 BATTLES · 1 MOVEMENT · K8→K9 23 %
     01         02      03        07
     1931-09    1938-01 1939-09   1941-12
 KEYFRAMES          ◇      ◇   ◇       ◇  …                      （泳道，默认收起，点 ▾ 展开约 48 px）
 MOVEMENTS          ▭▭  ▭▭▭▭ …
 EVENTS             ○ ○○──○ …
```

- 左：泳道开关（小 chevron，`aria-expanded`）。PRESENT / 演示按钮已移到顶栏 VIEW 组右端（两个引擎共用，docs/08 §2；这里不再放第二个）。原来的播放 / 暂停和 ×1 ×2 ×4 已去掉（Gavin 2026-10-09），时间轴不再自己跑。
- 中：**分段标尺**（Gavin 2026-10-10："外面的大时间轴做成跟演示模式类似，分几段，只标年月"）：每个正式章节一段，等宽（段间 6 px），段左界下方两行 mono 标签：章号 `07`、起始年月 `1941-12`（段宽 < 44 px 只写章号；地质时间写读数；公元前、跨度超过 100 年或 `datePrecision: year` 时只写年：`770 BCE` / `前770年`，`segmentDate` 用 `yearLabel`）。每段一条 2 px hairline 轨：已过的章墨色，当前章 signal 色、填到播放头。段里每个演示拍一个刻度（7 px 空心圆，坐在轨上），位置按拍的 `t` 在本段跨度里线性排、再推开到彼此 ≥ 10 px（段太窄时均分）；当前章的当前拍刻度实心 signal（刚套用的那拍；拖动后 = 播放头之前最近的一拍）。没写 `beats` 的章一个刻度（章节时间）。关键帧小空心菱形坐在轨上（同一映射）；没有年 / 月刻度。**点段**（`.ts-seg__btn`，44 px 高，`aria-label`「第 2 章：开战前的世界，自 1938-01」）= 换到那一章并落在第一拍（见「时间」）；**点刻度**（`.ts-seg__tick`，`data-beat="<章>.<拍>"`，命中区伸到与相邻刻度的中点，10–28 px 宽、24 px 高，压在段按钮上面——段在标签那一行点）= 套用那一拍；悬停 / 聚焦刻度出一张 hairline 小卡（`.ts-tip`）：拍的日期（mono signal）+ 字幕开头几个词（en 约 56 字符断在词边界，zh 22 字）。当前段的刻度是 Tab 停靠点，其余段的刻度只给指针（选了那段就能 Tab 进去）。手机宽度（条 < 560 px，容器查询）只画段、不画刻度。播放头：12 px 空心 signal 圆点（中间透出当前拍的实心刻度）加 hairline 竖线，日期写在线上方；44 px 命中区（`.ts-rule__grab`，`role="slider"`，`touch-action: none`）压在刻度上面——不拖动地点它 = 点了 22 px 内最近的刻度，没有就点了所在的段。**拖动**：在标尺上任何地方按下并移动 > 3 px 就开始拖（指针捕获），松手不再算点击；抓住播放头保持抓取偏移，从别处起拖则播放头跳到指针。鼠标和触屏都走 pointer events。
- 右：状态串（mono）：参战方 `已加入 / 总数` · 进行中的战斗 · 进行中的行动 · 控制区关键帧 `K8→K9 23 %`；每段的 `title` 写双语全称（Participants / 参与方 …）。都是数据统计，不标 SIM。条窄于 860 px（容器查询）时状态串换到标尺下面一行。
- 泳道（默认收起）：KEYFRAMES（菱形）、MOVEMENTS（起止条，重叠自动分行）、EVENTS（点 + 进行窗口），当前章那一段淡 signal 底，播放头一条 signal 竖线；横坐标与标尺完全一致。
- 行为：拖动 = 连续时间不换章；点段 = 换章并落在第一拍（不展开阅读面板，见「阅读面板收起」）；点刻度 = 那一拍；Shift+← → 全局微调；焦点在播放头上时 ← → ↑ ↓ 微调一格、PageUp/PageDown 十格、Home/End 跳到播放头所在段的两端。

**横坐标：分段映射**（`lib/segmentScale.ts`，单测 `tests/time-scene/segmentScale.test.ts`）

```
段 i 的时间跨度 [start_i, end_i]
start_i = min(本章 time, 第一拍 t)，且不早于 start_{i-1}
end_i   = start_{i+1}；本章最后一拍更晚就取最后一拍（最后一段：最后一拍与数据最大值取大）
段内 x ↔ t 过结点 (start_i, x0) · 各拍刻度 (t, x)（按时间） · (end_i, x1) 分段线性
```

- 段等宽，每段把自己的整个跨度映到自己的宽度上，逐段可逆（拖动用反函数 `invert(px) → { t, segment }`）。刻度被推开的地方时间会"挤"在刻度上（那一小段 x 不变），其余处处精确往返。宽度变化（ResizeObserver）时重算。
- **章节在时间上会重叠**（某章后几拍晚于下一章的开始，如 ww2 第 08 章的拍到 1943-10，第 09 章从 1942-06 开始），同一时间可能在两段里。播放头带一个**锚**（`Anchor { segment, tick? }`，`View.tsx` 维护）：换章 / 套用拍时 = 那一章的段（和那一拍），拖动时 = 指针所在的段；`x(t, anchor)` 优先画在锚的段里（时间恰好是锚定拍的时间就画在那个刻度上），锚的段不含这个时间才退回默认。默认（关键帧菱形、泳道、参与卡的条带）= 第一个跨度含 `t` 的段；默认映射对时间单调。
- 用同一映射的：段、刻度、关键帧菱形、播放头、拖动（反函数）、泳道、参与卡（同一组段套在卡片自己的宽度上，当前章那段淡 signal 底）。参与卡的时间轴刻度仍是真实日期（`ruleTicks` + `thinTicks`，`lib/ticks.ts`），经映射落位。

可选 `views.hudFrame: { "parts": ["earth-body", "moon-body", "sun-body"] }` 启用实际 HUD 自由区取景（默认关闭，既有主题镜头保持原行为）。仅列需要保住的真实可选主体；作者镜头完全排除的对象不被重新拉入近景。舞台测量当前标题、PLATE、观察卡、抽屉/章节轴等可见 `data-hud-panel`，右侧 overlay 按实际卡片测量；在已有宽高比后拉之上，保持视线方向与 fov，按各对象深度求最小后拉及横/纵平移，使包围盒落入留有 12 px 间隔的自由矩形。尺寸、卡片折叠、HUD/演示切换会重算，始终从作者镜头出发；拖拽后交还自由相机。适用边界：自由矩形必须非空，故意出画的对象不强行收入。纯函数及透视投影回算见 `tests/space-scene/hud-framing.test.ts`，浏览器验收仍需单独执行。

### HUD 控件与内容（docs/08 §2、§3）

注册（`View.tsx` 的 `useSceneControls`）：

| 项 | 内容 |
|---|---|
| 预设 | `world`（center [20, 10]，zoom 1.4）+ `theatre`（整片区域：地图 `cameraForBounds` 套住全部数据；地图未就绪时按包围盒估算）+ `presets.json` 里的预设（按钮文字 = `label`，旁边小字写数字键）。数字键 1–9，第 10 个是 0，再往后只有按钮、不写数字。没有章节预设 |
| 模式 | `flow`（F，= movements 图层，状态 `FLOW`）· `borders`（B，= borders 图层）· `graticule`（G，引擎本地状态）· `territory`（N，领土名称，引擎本地状态，默认开）· `reference`（R）· `presentation`（P，状态 `PRESENTATION 08/17`；底部条也有 PRESENT 按钮）· 宿主 `labels`（L） |
| 控制面板 | `stageOverlay` 里的「图层和图例」卡（舞台 ≥ 720 px 宽时默认展开）：**LAYERS** 控制区 / 领土名称（N）/ 国界（B）/ 经纬网（G）/ 行动路线（F）/ 事件 / 何时加入 / 地点（有 `site` 事件才出）/ 标注（L）；**TOOLS** 与上一关键帧对照（R）/ 演示（P）/ 名词（有 `glossary.json` 才出）/ 隐藏界面（H）；**KEY** 图例 |
| `time` | `now()`：播放头，供 `__atlas.state().playhead` |
| `pause` | 不注册（没有自由播放）：状态行没有 PAUSED，键位表没有 SPACE，`__atlas.setPaused` 返回 false |
| `status` | `2000-03-11`（与 `FLOW`、`REFERENCE` 等模式段一起出现在状态行） |
| `specRows` | ENTITIES / KEYFRAMES / EVENTS / MOVEMENTS 计数（mono） |
| `stats()` | `{ features, zoom, fps }`：features = 当前可见数据要素 + 经纬线 + 国界（开时）；fps = 页面 rAF 帧率 |
| `cardToggle` | 参与卡展开 / 收起 |
| `beats` | `usePresentation` 的 `controls`（节拍列表与跳转、自动播放、语音、voiceLog） |
| `escape` | 依次：退出 PRESENTATION → 退出 REFERENCE → 收起展开的参与卡（连同选中的实体）→ 取消选中实体 → 关闭事件详情 → 清空 highlight（来源弹层开着时 ESC 先关弹层，由弹层自己处理） |

- **REFERENCE（R）**：版图对照用"叠加"实现（不分屏）：当前主导关键帧照常，相邻关键帧（前一帧；当前是第一帧时取后一帧）的边界以墨色虚线叠上，2 s 淡入（`instant` 时直接到位）；舞台顶部横幅写"实线 K2 … · 虚线 K1 …"。再按恢复。少于两个关键帧时禁用；演示中禁用。
- **PRESENTATION（P）**：core 演示系统（见「演示系统（core）」），TimeScene 的适配器在 `View.tsx`：`beatsOf` = 章的 `state.beats`；一拍 = 本章累积目标 ⊕ 拍里的 `t` / `camera` / `layers` / `highlight`，用 `applyState` 飞镜头（2.2 s）、缓动 `t`（1.6 s）——底部条点刻度、换章落第一拍用的是同一个函数（`applyBeatState`）；`saveState` / `restoreState` = store 快照 / `applyState` 恢复（章节、镜头、`t`、图层、高亮）；`onEnter` 退出 REFERENCE、清选中的事件 / 实体、收起参与卡；字幕卡表头的 `readout` = 播放头日期（同时间轴读数）；没有 `afterCameraSettle`（固定 2.3 s，等于镜头飞行加字幕淡入）。演示中 REFERENCE 禁用；顶栏 PRESENT 按钮 = P。拍落定后地图可拖动 / 缩放（见「翻页与自由查看」），演示中点地图上的事件不选中；用户平移 / 缩放（含滚轮）250 ms 后写回 `camera`，过渡开始时丢弃还没写回的那次。**引线标注**：HUD 隐藏时地图上仍画这拍 `highlight`（没写就是本章的）里的事件 / 行动 / 实体的引线标注（上限 6 个，字号比平时大 20%，遵守 L 开关；要对应图层开着），**只有这些**——别的事件标注、地名、实体名在演示里都不画（控制器 `setPresentation(true)`，样式挂在 `.ts-stage[data-presenting]`）；领土名称照常显示。字幕卡和标题块算引线栏的障碍，标注让开它们；演示中引线栏**只**把这两块当障碍（HUD 面板淡出时 `visibility` 还留着，不能算），并且进入演示、换拍（字幕卡出现 / 变高，`refreshLabels`）和镜头落定（`moveend`）时立刻重新量一次，不等 1 s 的兜底定时器。
- 插槽内容（`hud/HudPanels.tsx`，SVG 按卡片实际像素画，字号走 `--u`）：
  - `card` PARTICIPATION AND AREA（横坐标用标尺的映射；`geo.entities` 为空的主题——只讲一个国家的，如 singapore-after-1965——不注册卡片，右上不画空框）：每个实体一条带——参与线（joined → left，起点小空心圆），关键帧间线性插值的近似控制面积（球面面积，斜线 + 淡底），行首写 EN 名 / 中文 / 当前 `≈面积 KM²`；当前章节窗口淡 signal 底，`t` 一条 signal 竖线，底部自适应刻度。**行数规则**（`lib/bandRows.ts` 的 `planBandRows`，有单测）：每行至少 25 设计 px（EN 名 + 中文两行不互相压）；全部放得下就按数据顺序全画（实体再多也画）；放不下就最多画 12 行（还要给"其余"那一行留 15 px，所以小卡片只有 4–6 行），挑法是 ①有控制区面积的实体在前，按各关键帧的最大面积从大到小，②其余按 `joined` 从早到晚，同值按数据顺序；剩下的合并成一行弱色小字 `+N OTHERS / 另 N 方 ▾`（贴在时间轴上方）。**展开**：点卡片表头（宿主按 `cardToggle` 画成按钮）或「另 N 方」那一行，卡片原地变长（≤ 右列 60%），列出全部实体（在战的按面积 / 加入时间排在前，其余按加入时间），行高 30 设计 px，卡片内滚动、时间轴吸底；再点表头或 ESC 收起。**点一行**（展开与否都可以，键盘 Enter / 空格）= 选中这个实体：`highlight = [id]`（地图上它的控制区淡底加深）+ inspector 插槽出实体详情（`EntityInspector`：EN / 中文名、阵营时段、加入 / 退出日期、当前近似面积）；再点同一行取消，恢复本章高亮。画出的行保持阵营分色（参与线按段分色，面积带按 `t` 时阵营）。已验证：ww2（34 个实体）在 1920×1080 / 1280×720 / 2560×1440 下 EN 与中文标签、行与行之间没有重叠；`pnpm shoot <topic> --layout` 只查面板之间的重叠，卡片内部标签要另量（量 `.ts-card text` 的包围盒）。
  - 原 `panel01`（时间标尺 + 泳道）、`panel03`（状态）并进底部条；原 `panel02`（问题 / 概述）由阅读面板头部的 `summary` 一句代替。
  - `perf`：`FEATURES 63 · ZOOM 5.5 · 60 FPS`（500 ms 更新）。
  - `inspector`（实体）：`N-03 · PARTICIPANT` 眉题，阵营色块 + 名称、另一语言小字，SIDE（每段阵营 + 起止日期）/ JOINED / LEFT / AREA NOW。
  - `inspector`（事件）：hairline 框，`E-01 · BATTLE · 日期` mono 眉题（`site` 为 `P-01 · SITE`，无日期），标题大写 + 另一语言小字，摘要 + 来源上标（`sources`），进攻/防守/结果的 dl（斜线色块，颜色取事件开始时的阵营），Counter 兵力与伤亡；最后是 `detail` 的"细看 / More"折叠块（默认收起）。
  - Counter：`forces` / `casualties` 恰好两方时画成一个双方并排的 `CounterVersus`（进攻方在左、图标从中线向外长，防守方在右，同一刻度，底部一行刻度说明）；其他情况每方一行。刻度 `counterPer(max)`：最大值在 100 万–500 万之间固定"1 icon = 100,000 people / 一个图标 = 10 万人"（最多 50 个图标），否则取 1/2/5×10ⁿ（`nicePer`）。
  - 来源弹层（`widgets/SourcePopover.tsx`，宿主挂一个）：场景内任何 `[data-source="S3"]`（正文 `<Num>` 的上标、inspector 的上标）点开都走它——委托监听，静态正文无需 hydration；弹层贴在上标下方（放不下就在上方），写来源号、文本、说明、链接；ESC / 点外面 / 关闭按钮关闭，焦点回到上标。数据来自主题的 `sources.json`，不联网。

### 交互约定

- ← → 换章（核心处理；焦点在标尺上时由 Timeline 自己转发）；Shift+← → 按一步微调时间。
- 地图容器 `data-keys="own"`；点地图不会抢键盘焦点（canvas 被点击聚焦后立即 blur），Tab 进入地图仍可用方向键平移。
- 引线和锚点不接收指针；拖动从标注开始或在标注上松手仍平移地图，原地点按事件标注才选中（键盘 Enter / 空格照常）。标注的日期区间两端显示相同时只写一次。
- 用户平移/缩放 `moveend` 后 250 ms 防抖 `setCamera()`；章节切换 `flyTo`（2.2 s），首次加载/深链接 `jumpTo`；`prefers-reduced-motion` 时不飞、不脉冲、虚线不流动、REFERENCE 不渐变。
- 主题切换：观察 `<html data-theme>`，重读 token、`setPaintProperty`、重画斜线图，不重建地图。

### 底图数据

```bash
pnpm tsx scripts/build-geo.ts   # world-atlas(Natural Earth 1:50m) → public/geo/*.json，产物入库
```

陆地 3 位小数（~110 m），国界简化到 ~2 km，合计约 1.75 MB（预算 2 MB）。world-atlas 里跨 ±180° 的环（斐济、楚科奇、弗兰格尔岛、南极洲）原本在一条线段里从 180 跳到 -180，平面渲染会画出横贯全图的直线（P1 截图里的那条横线就是斐济的一个碎片）；构建时用 `unwrapRing`（`lib/geo.ts`，有单测）把环展开成经度连续（允许超出 ±180，MapLibre 自动画进相邻世界副本），绕极点的环（南极洲）沿极点闭合。来源与许可见 `public/geo/README.md`（Natural Earth，公有领域）。

### 区域底图（`basemap.region`，docs/27 G4 / G6）

一个地区的长时段主题（春秋战国）只画那个地区：舞台是一张"区域图版"，不是世界地图上的一个窗口。

```yaml
basemap:
  region:
    bounds: [100, 20, 125, 44]        # 图版：陆地画到这里，外面是纸
    maxBounds: [98, 18, 127, 45.5]    # 镜头界，可省（= bounds 外扩 8 %）
    land: china-plate                 # public/geo/china-plate.json（scripts/geo/lib/region-land.ts）
    rivers: china-plate-rivers        # 可选：public/geo/china-plate-rivers.json
  maxZoom: 9                          # 可省（默认 10；schema 6–16）
```

- schema：`basemapOptions` 要么 `local` 要么 `region`（`regionBasemap`：`bounds` 西 < 东、南 < 北，`maxBounds` 必须包住 `bounds`）。
- **陆地**：`base` 的 `land` source 开始是空的，load 后 fetch `public/geo/<land>.json`（TopoJSON，对象 `<land>`：`kind: land` 填 `--land`、`kind: coast` 描海岸；裁切的直边不描）。**不加载** `land-50m.json`、`land-10m-sea.json`（那一层整个不进样式），没有 `borders` 图层、国名，B 键和图层面板里的"国界"都不出现。
- **纸边**：图版以外整个世界铺一层纸色（`--paper`，`kind: frame`，挖掉 `bounds`），图版边上一条 0.8 px `--line` 图廓线（`kind: edge`），两层在所有 GL 图层之上（`lib/region.ts` `regionFrame`）。海仍是 `--water`，只在图版内。
- **镜头**：`maxBounds` 按舞台宽高比放宽（`aspectBounds`，Mercator 下只放不收，resize 时重设），所以缩到最小 = 整张图版刚好装下、四周是纸，再怎么拖、缩都到不了世界别处。第一个预设（键 1，id 仍是 `world`）变成"全图 / Whole plate"（`plateCamera()` = `cameraForBounds(bounds)`）；`theatre` 照旧套住全部数据。章节镜头 zoom 比最小值还小时被夹到最小值。`data/presets.json` **不要再写“全图”预设**（否则出两个“全图”按钮，`pnpm validate` 报错）。舞台带 `data-region-plate`：全图视角在最小缩放 + 边界锁里拖不动是正确行为，`pnpm shoot --keys` 的拖动检查遇到它就改从下一个预设拖。
- **经纬网**：只画在图版内，5°（图版跨度 ≤ 60°）或 10° 一条（`regionGraticule`）。
- **河流**（`rivers`）：`public/geo/<rivers>.json`，GeoJSON 或 TopoJSON（取第一个对象）的 LineString / MultiLineString，`properties: { id, name: { en, zh }, from?, to?, reconstructed?, label?: [lng, lat] }`（schema `riversFile`：id 唯一、`to` 晚于 `from`）。`[from, to)` = 这条河道存在的年代（`lib/rivers.ts` `riversAt`，区间判断在 `lib/dated.ts`，与按年代的岛岸共用）：改道写成两条（前 602 年以前的黄河 `to: "-0602"`），消失的河写 `to`（济水），今天的下游写 `from: "1855"`（先秦主题里永远不出现）。陆地之上、数据之下两层 hairline（`--rivers`，0.6–1.3 px 随缩放）：实线 / `reconstructed: true` 虚线 [4, 2.5]；按播放头时间过滤，只在可见集合变化时 `setFilter`。**河名**（`stages/geo/rivers.ts`）：每条可见河道一个斜体小字（`--ink-3`，`--land` 光晕），钉在 `label` 或最长一段的中点、沿河倾斜（Mercator 保角，角度每条算一次，保持正立），给引线标注和领土名称让位、彼此避让；跟领土名称一起由 **N** 开关（不受 L 影响）。图例出"河流（虚线：复原河道）"。
- 其他主题不受影响：样式（`stages/geo/style.ts` `buildGeoStyle`）在没有 `region` 时和以前一样（`tests/time-scene/geo-style.test.ts`）。
- `pnpm validate`：`land` / `rivers` 文件存在、陆地对象名和 `kind: land`、河流过 `riversFile`（`timeSceneTopicIssues`）。
- 占位示例：`sample-region`（伊比利亚半岛一张图版，四个占位国、三帧 BCE 关键帧（两帧近似边界）、四条占位河道（含一条复原故道和一条 1855 年后才出现、永远不显示的"今道"）、`colorBy: entity`、`datePrecision: year`、`strings`）。`pnpm shoot sample-region --beats` 看全部效果；它的区域、河流、控制区都是占位，不是历史。

### 按国配色（`colorBy: entity`，docs/27 G5 / G11）

列国地图（几十个国家，都不分阵营）用不了三个阵营色。`topic.yaml` 写 `colorBy: entity`：

- 每个实体 `color: "token:holder-N"`（N = 1…8）：`tokens.css` 的 `--holder-1 … --holder-8`，paper / cinema 各一套，低饱和、按 Paul Tol 的色盲安全 "muted" 色板（靛、沙、玫、青、橄榄、天蓝、酒红、绿；前四个差别最大，着色算法最常用它们）。只有一个含义："多国地图上区分相邻的国家，国名写在图上"。
- 分配：`pnpm tsx scripts/geo/lib/colour-holders.ts --topic <slug> [--keep] [--write]`（`lib/holders.ts`：`holderAdjacency` 统计所有关键帧里共用边界的 holder 对——TopoJSON 按弧、GeoJSON 按线段，只碰到一个角不算相邻；`assignHolderColours` 用 DSatur，空闲色里取用得最少的；`--keep` 保留已写且不冲突的）。需要 8 色以上时报冲突、退出码 1。没写 `color` 的实体按在 entities.json 里的顺序补一个 holder 色（`withEntityColours`，不保证相邻不同色）；`pnpm validate` 对缺色、相邻同色给 warning。
- 地图淡底、斜线、领土名称、引线、参与卡都用实体自己的颜色（与 `color` 覆盖同一条路径）。`bloc` 一律写 `neutral`，`blocLabels.neutral` 写这一类的名字。
- **图例**：不再按 6 个实体一刀切合成"诸国"一行：列出**当前主导关键帧**里的每个 holder（面积大的在前，播放头换帧时更新），各自的色块；手机宽度（< 640 px）排成两列（`.ts-overlay[data-legend="entities"]`）。不出"已退出战争"那一行（被兼并的国家，土地已经换了 holder）。

### 不确定的边界（`certainty: approximate`，docs/27 G8）

控制区要素可写 `properties.certainty: "approximate"`（缺省 `certain`）：来源只够"示意级"的帧（先秦列国）。

- TopoJSON：`decodeControl` 把分界拆成两份——两边都确定的 `frontier`（实线 0.8 px）和碰到近似要素的 `frontierApprox`（同色同宽，`line-dasharray` [3, 2]，图层 `ts-control-{prev,next}-dash`）；没有近似要素的关键帧和以前完全一样。GeoJSON 形态：近似要素的轮廓画成虚线。
- 近似要素的淡底 ×0.7、斜线不透明度 ×0.55（`tint` / `ho`），一眼看得出"这块不确定"。REFERENCE 的虚线叠加两份分界都画。
- 图例加一行"边界为近似 / Approximate border"（虚线框）。

### 用词覆盖（`strings`，docs/27 G7）

实体卡和实体引线说明里的"加入 / 退出 / 尚未参战"是全站字串（`time.entity.joined`、`time.entity.left`、`time.joinedOn`、`time.bloc.notYet`），对战争以外的主题不对。`topic.yaml` 可选：

```yaml
strings:
  joined: { en: "appears", zh: "出现" }
  left: { en: "ends", zh: "灭亡" }
  notYet: { en: "Not yet recorded", zh: "尚未见于记载" }
```

实体卡的两个标题直接用这个词；引线说明写 "appears 770 BCE" / "公元前770年出现"（`lib/blocLabels.ts` `entityWord` / `entityDated`；英文词在前、中文日期在前），`left` 之后写 "ends 221 BCE"（没设 `left` 时仍是 `blocLabels.out` + 日期）。缺省回退全站字串。

### 包体

MapLibre 只在 `controller` chunk 里，View 挂载后才加载（时间轴先出来）。P4 实测（gzip -9）：TimeScene View chunk 约 15 KB gz（含 HUD 面板、标尺），controller chunk 约 286 KB gz（MapLibre 5.24 约 270 KB + 引擎地图代码约 16 KB）；加上宿主 client / SceneHost / GlobalToggles 约 84 KB，整页 JS 约 391 KB gz。**超出 docs/02 的 300 KB gz 预算**，需要产品层决定：按 brotli 计、对 geo 主题放宽到 ~400 KB gz，或换更小的地图库版本。

## SpaceScene（空间拆解引擎，Phase 2B；P2 技术图版）

`engine: space-scene`、`stage: model3d`。代码在 `src/engines/space-scene/`：

```
index.ts                 descriptor（part/view/explode/run/cutaway/pose/beat；不进 URL 的 hidden/ghosted/solo/exercise/tints/sites/demo）
schema.ts                parts.json 的 zod（构建期）
View.tsx                 HUD 控件注册（预设 / 模式 / 规格行 / 卡片标题 / beatStep）+ 各插槽内容 + 演示之外的拍（章节轴、, .、节拍行、URL b）+ 懒加载 Model3DStage
ui.ts                    引擎内 UI store（ORBIT、REFERENCE、演示中、封面镜头；不进 URL，View 与舞台共用）
bridge.ts                舞台 → HUD 的桥：每帧投影好的标注锚点与屏幕框（零件 + `group:<id>` 组锚点）、HUD 可能标注的 id（遮挡只查这些）、渲染计数、帧回调、镜头落定（`settledTransition` / `cameraSettled`）（View 侧不 import three）
lib/                     纯函数，有单测：explode / visibility（图层、isolate、hide、shell、context）/ flow-curve / flow-stops（沿路径变色）/
                         color（材质族、tint）/ presets（材质名，无 zod）/ animation / telemetry（一阶滞后读数）/ detail（段落 + [S#]）/
                         camera（球坐标插值、REFERENCE 镜头、过渡目标）/ parts（零件包围盒、repeat 变换）/
                         schematic（零件链路、流经连线、立面、标注预算）/ labels（组标注 id、演示时用哪张标注表、组包围盒）/
                         leader-layout（引线标注摆放：两列、避让 HUD 与被标零件、代价搜索）/ shaped（成形零件的版式数学：盘管管位、回弯、叶片）/ xform / math /
                         sweep（扫掠站点、标架、半径轮廓、环节沟）/ wing（扇形折叠）/ bilateral（双侧镜像）/ pose（姿态、关键帧）/ units（实长）/
                         rig（关节角、解剖轴、收缩、动作节拍、肌肉 ↔ 零件）/ sites（起止点）/ equipment（动作器械的基本体）/
                         sim/（试一试：controls 值与 URL、index 模型注册表、circuit 节点分析、magnet 磁荷与场态、field 场线与铁屑、force 力的六个子模型、timeline 时间线与回放规则、
                         settle 阻尼摆动、bind 绑定、trial 数据表与先猜后看、chart 小图与读屏文字、arrows 力的箭头、replay 卡片影响哪些时间线 / 状态、text 值与读数的文字、diagram 电路图排版）/
                         stretch（弹簧伸缩：每个顶点在线圈上的位置）
sim-schema.ts            parts.json `sim` 与章 / 拍 `sim` 的 zod 和交叉校验（见「试一试」）
stages/model3d/          R3F 舞台：Model3DStage（createRoot 宿主）、SceneRoot、TimelineClock（试一试时间线的时钟）、PartNode、geometry（程序化零件）、shaped（成形零件构建）、organic（sweep / wing 构建、FanDeform）、
                         materials（材质 + 选中边缘 / 剖面 shader 补丁）、textures（程序化贴图）、Lighting、
                         GroundShadow、CameraRig、Flows + flowMaterial、probes（标注投影 / 起止点投影 / 计数 / 阴影更新）、GltfSource（glb、蒙皮、骨架）、
                         MotionDriver（关节、收缩、动作体位）、Equipment（动作器械）
hud/                     LeaderLabels + SitesOverlay（leaders）、PartChainCard 或 CircuitCard（card：零件链路 / 电路图）、sim.ts（HUD 读写试一试）、PlateBlock（plate：立面缩略图、状态小行、模拟读数、当前选中、
                         PerfReadout）、spec（标题块规格行）
explorer/                ExplorerOverlay（stageOverlay，EXPLODED 时带 ExplorerBar 拆开滑块）、BeatLine + TryIt（+ TryChart 数据表下的小图）+ Inspector（readerTop：节拍行；试一试卡片；零件详情、
                         MuscleSheet 四页、ExerciseCard）、ChapterIndex（readerEnd：本章索引）；章节轴是 core 的 ChapterAxis（bottomBar）
space-scene.css          舞台、标注、卡片与面板绘图、滑块、详情样式（只用 token，尺寸 × --u）
```

### 作者怎么写数据（`data/parts.json`）

```jsonc
{
  "model": "/models/aircon.glb",          // 可选；有 mesh 零件时必填，放 public/models/，引擎自动加 base
  "parts": [{
    "id": "compressor", "name": {en, zh}, "group": "refrigerant",
    "chainName": {en, zh},                // 可选：只用于右上零件链的短名；引线 / 索引 / 详情仍用 short / name
    "summary": {en, zh}, "detail": {en, zh},   // summary 也是引线标注的一行说明；detail 在详情卡「了解更多」后
    "primitive": { "kind": "cylinder", "size": [0.3, 0.3, 0.5], "at": [1, 0, 0], "rotation": [0, 0, 90], "color": "steel" },
    "repeat": { "count": 4, "axis": [1, 0, 0], "spacing": 0.76 },   // 可选：实例化重复（一次绘制）
    "mesh": "Compressor",                  // 或者：glb 里的节点名；两者都写时 glb 加载后替换积木
    "explode": { "dir": [1, 0, 0.3], "dist": 1.2 },   // dir 会归一化；位移 = dir × dist × explode
    "connects": ["condenser"],             // 详情卡芯片 + 右上零件链路的连线
    "shell": true,                         // 可选：外壳。主题里有 shell 零件时，X-RAY 只把 shell 变透明，其余保持实心
    "castShadow": false,                   // 可选：覆盖自动投影判断（默认 ≥ 模型半径 28% 的零件投影）
    "clip": false,                         // 可选：默认 true；false 不受默认或命名剖切影响，也不填剖面
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
    { "id": "beat", "target": "pump", "kind": "pulse", "scale": 1.15, "hz": 1 },                               // scale 是峰值缩放
    { "id": "fan-spin", "target": "fan-rotors", "kind": "rotate", "axis": [0,0,1], "rpm": 40, "each": true }   // each：每个副本绕自己的中心动（见下）
  ],
  "views": {
    "assembled": { "camera": { "position": [3,2,4], "target": [0,0,0], "fov": 34 } },
    "exploded":  { "camera": { ... } },     // 每个视图可选一个预设镜头
    "cutaway":   { "normal": [-1,0,0], "offset": 0 },   // 可选剖切面；默认切掉 x>0 一半
    "cover":     { "position": [2.6,1.6,3.4], "target": [0,0.3,0], "fov": 30 },   // 可选封面镜头（直接是镜头，不套 camera）：演示以外隐藏 HUD（H、hero-clean 截图）时用
    "shadows": "auto",                       // auto（默认）：主光投影 + 地面；contact：只留柔和接触斑；none：都关
    "section":   { "plane": "xy" },         // 可选：PLATE 块立面与 REFERENCE 正视方向（xy 正面 / zy 侧面 / xz 俯视）
    "reference": { "camera": { ... } }      // 可选：自定 REFERENCE 镜头（默认按包围盒自动取长焦正视）
  },
  "spec": [                                // 可选，≤ 4 行：标题块规格行（宿主 3 行 + PARTS + 这些，总共 ≤ 8）；有它时 GROUPS / FLOWS 行不画
    { "key": {en, zh}, "value": "R32 · 0.60 kg", "tag": "design" },   // value：字符串（mono）或 {en, zh}；tag：typical | design | sim（sim 带 SIM 芯片，其余不出芯片）
  ],
  "telemetry": [                           // 可选，≤ 6 行：PLATE 块在 RUN / FLOW / ANIM / VIEW / EXPLODE 之后接这些模拟读数（一枚 SIM 芯片，`标签 值 单位` 连排）；`{ key, unit, follow: "<sim 输出>" }` = 跟随试一试的输出（见「试一试」）
    { "key": {en, zh}, "unit": "MPa abs", "idle": 1.93, "run": 3.0, "lag": 10, "decimals": 2 }   // 一阶滞后 τ = lag 秒；decimals 默认取 idle / run 写出的位数
  ],
  "presets": [                             // 可选，≤ 6 个命名镜头预设（docs/12 §7.4 G7）：VIEW 按钮排在 ORBIT、REF. 之后（数字键接着排：1–9，第 10 个是 0，再往后只有按钮）
    { "id": "outdoor", "label": {en, zh}, "camera": { "position": [1.5, 0.75, 1.5], "target": [0.62, 0.3, 0], "fov": 30 },
      "view": "xray" }                     // view 可选：按预设时同时切视图（exploded 时拆开到 0.7 或当前值）；id 全主题唯一，不能叫 orbit / reference
  ],
  "poses": { "wings-open": { "hindwings": { "pivot": [-0.38, 0.84, 0.1], "rotation": [-15, 0, 0], "fan": 1 }, "duration": 0.8 } },  // 可选，见「生物与有机形体」
  "units": { "modelUnit": "mm", "scale": 25 }   // 可选：1 场景单位 = 25 mm（比例尺与 PLATE 块立面读数用实长）
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
- **成形零件**（写实轮次，`lib/shaped.ts` 版式数学 + `stages/model3d/shaped.ts` 构建；圆形件都绕自身 Y 轴，用 `rotation` 转向）：
  - `lathe {profile:[[r,y]...], segments, arc?}`：轮廓绕 Y 旋转（r ≥ 0）；首尾点在轴上（r = 0）才是封闭体（剖切填剖面），首点 = 末点（不在轴上）是一圈环形截面，也封闭；同一点写两次 = 硬边。压缩机外壳（上下封头、焊缝）、储液器、电机、轮毂、六角螺母（`segments: 6`）都用它。`arc`（< 360）只转这么多度、保留 −Z 一侧（180 = 剖开的半个，剖面朝观者）：封闭轮廓在两个切口上封平面（轮廓三角化，顶点带 `atlasSection` = 1），按零件自己的材质画、再叠一层与 CUTAWAY 相同的 45° 剖面线，所以剖开电池的钢壳、二氧化锰、隔膜、锌膏各是各的颜色；开放轮廓（半个玻璃泡）不封口、双面画。剖开的电池、灯泡展品用它（docs/23 C3），一层一个 `extra`，用环形截面避免共面
  - `coil {radius | [r0, r1], wire, turns, length, segments?, radial?}`：沿自身 Y 的螺旋线圆截面导线（`TubeGeometry` 走解析螺旋线），居中；`radius` 写两个数 = 锥形（手电筒尾簧、电池盒负极簧），灯丝（r 0.45 mm、丝 0.08 mm）也用它。`wire` 必须小于半径，`turns` 圈在 `length` 里不能重叠（validate 报）；包围盒按最大半径 + 丝径
  - `extrude {shape:[[x,y]...], holes?, depth, bevel?}`：XY 平面里的轮廓（可带孔）沿 Z 拉伸、居中；`depth` 是总厚度，`bevel` 在厚度之内倒圆。沿 X 拉伸写 `rotation: [0, -90, 0]`（轮廓 x = 场景 z）；平面图沿 Y 拉伸写 `[90, 0, 0]`（轮廓 y = 场景 z）。室内机端盖侧轮廓、底壳风道、接水盘、导风板截面、隔板、开槽侧板
  - `curvedPanel {radius, angle, height, thickness, segments}`：圆柱面的一段（轴 ‖ Y），绕 +Z 对称张开 `angle`°；`at` 是外表面正中点，法线朝 +Z。横放（轴 ‖ X）写 `rotation: [倾角, 0, 90]`。室内机前面板、圆角
  - `blades {layout, count, radius, hub, chord, twist, sweep, pitch, thickness, length?, discs}`：`axial`（默认）= XZ 平面里 `count` 片带弧度的宽叶片，叶根角 `pitch`°、到叶尖减 `twist`°、叶尖前掠 `sweep`°、弦长从根部 55 % 长到叶尖 `chord`，加穹顶轮毂；`barrel` = 贯流风扇转子，`count` 片前弯叶片（`hub` 到 `radius`，弦 `chord`，前倾 `sweep`°，默认 25°）沿 Y 长 `length`，`discs` 片隔盘（两端实心）。全部合成一个几何体
  - `coilBank {rows, cols, pitch, tubeRadius, length, finPitch, finDepth, bends, shape, legs?, corner?, tubeColor}`：翅片管换热器。管沿 X，`cols` 根沿 Y 间距 `pitch`，`rows` 排沿 Z（行距 0.866 pitch，错排）；铝翅片每 `finPitch` 一片、深 `finDepth`；U 形回弯在两端（`both`）、不要（`none`）或只要回弯（`only`：给单独的"回弯"零件）。回弯规律：+X 端偶数排空出最下一根、奇数排空出最上一根（`coilBendStart`），接管从这里进出。`shape: "L"`：第 0 段沿 X 长 `legs[0]`，在 −X 端绕 Y 转 90°（转角半径 `corner`），第 1 段沿 +Z 长 `legs[1]`（室外机后面 + 左侧的 L 形冷凝器）。铜管、回弯用 `tubeColor`（默认 copper），翅片用 `color`：一个零件两种材质、两次绘制
  - `grille {style, radius | size, count, spokes, bar}`：`rings` = XZ 平面里 `count` 圈钢丝圈（从 0.2 radius 到 radius）+ `spokes` 根辐条 + 中心圆片（室外机风扇护网）；`slats` = `size:[w,d,h]` 框里 `count` 根宽 `bar` 的格条，沿 d 方向（室内机顶部进风格栅、滤网）
  - `filings {size: [w, d], count?, needle?, saturate?, exponent?}`：铁屑卡片（磁铁 sim 专用，一个 InstancedMesh）；`state` 绑定按场态排布，见「SpaceScene · 试一试 · 磁铁」
  - 所有 primitive 可选 `mirror: "x" | "y" | "z"`：在自身坐标里沿该轴镜像（先镜像、再 `rotation`），绕序自动翻转
- **一个零件多个 primitive**（`extra: [primitive…]`，≤ 32）：`at` 同样是场景坐标；随零件一起移动、淡出、拆开、repeat（绕主 `at` 重复）和转动；引线指向主 `primitive`。每个 primitive 可以有自己的 `color` / `tint`：零件按材质分槽（`partMaterialSlots`：主材质在前，再按出现顺序），**同材质的所有块烘焙合并成一个几何体，一个材质一次绘制**（顶点超过 40 万才保留实例化）。压缩机 = 外壳 + 接线盒 + 底板，阀门 = 阀体 + 阀帽 + 接口，等等
- **逐个副本的动画**（`each: true`，rotate / oscillate / pulse；b200-server 的 40 只风扇转子）：默认动画让整个零件绕零件中心（或 `pivot`）动，`repeat` 的各列和 `extra` 会一起公转。写 `each: true` 后，零件的每个**副本**——主 primitive 和每个 `extra`、乘以每个 `repeat` 实例（`lib/parts.ts partCopies`）——各自绕自己的 `at`（随 repeat 移过去）转 / 摆 / 缩放，轴仍是场景坐标。这样的零件不再烘焙合并：形状相同的 primitive（`primitiveShapeKey`：除 `at`、`rotation` 外参数与材质全同）共用一个 InstancedMesh，每个副本一个实例（`stages/model3d/geometry.ts eachPieces`，片的 `pivots` = 各实例的转心），舞台每帧写 `T(c) · 动作 · T(−c) · 静止矩阵`；所以 5 列 × 8 只转子 = 1 次绘制。限制：不能和 `pivot` 一起写；零件要有 `repeat` 或 `extra`；不能是 glb 零件；翅脉线、折叠翅在这种零件里是静止的。同一零件里不带 `each` 的动画照旧作用于整个零件，二者叠加。
- **repeat**：`{count, axis, spacing}`（沿轴、以 `at` 为中心等距）或 `{count, axis, radius}`（绕过 `at` 的轴一圈，每个实例朝外转）。轴是场景坐标。重复的是整个零件（含 `extra`）；同材质的副本烘焙合并成一个几何体（一次绘制），顶点很多时才用 InstancedMesh。
- **材质族**（`color`）：`casing`（拉丝铝，各向异性）、`steel`（机加工钢）、`powder`（缎面黑粉末涂层，轻微橘皮）、`stainless`（轴向拉丝不锈钢）、`copper`、`brass`（黄铜：阀门、喇叭口螺母）、`rubber`（近黑，roughness .78）、`plastic`（哑光暖砂色，不是默认灰）、`enamel`（暖白烤漆，比纸色深一档，低粗糙度 + 细颗粒粗糙度贴图 = 缎面光泽，家电外壳）、`glass`（半透明）、`wood`（哑光松木 / 胶合板：程序化木纹灰度颜色贴图 × 族色或 `tint`，电路板、实验台、冰棒棍）、`fabric`（短绒地毯：全哑光，`pile` 绒簇法线 + 灰度颜色贴图，docs/30 F7）、`abrasive`（砂纸 / 沙：`sand` 颗粒法线 + 颜色贴图；浅 `tint` = 沙）；旧名 `metal` = steel、`matte` = plastic。或者 `token:<name>` / `#hex`：缎面漆。`primitive.tint`（token 或 #hex）给材质族换颜色、保留它的金属度 / 粗糙度 / 贴图，例如浅灰 `powder` 外壳：`"color": "powder", "tint": "#c4c6c2"`。程序化 canvas 贴图给拉丝方向、粗糙度变化、橘皮法线（`stages/model3d/textures.ts`，种子固定，截图可复现）。
- **流场**：`path` 首尾点相同 = 闭环。centripetal Catmull-Rom，按弧长烘焙进 shader：每 8 mm（0.008 场景单位）一个点，64–512 个，存成一行浮点纹理（`texelFetch` 取样，不占 uniform 数组），粒子在弯头处贴着曲线走、不抄近路（4 m 的冷媒段约 500 个点，弯头偏差从 64 点时的 15–20 mm 降到 3 mm 以内；盘管仍只能画 2–3 程，不能逐根追 U 形弯头），默认每条 360 个细粒子（贴着中心线，像 CFD 流线而不是魔法粒子），`speed` 是场景单位/秒。`stops` 在顶点着色器里按粒子位置插值（线性 RGB）；分段流（冷媒四段）用 `ends: "open"`，并让各段 `count / 长度 × speed` 大致相等（粒子通量连续）。`whenRun: false` 的流/动画一直播放（只受图层开关）。每条流一次绘制。
- **已知限制**：同一时刻只有一个剖切面（`views.cutaway` 或一个命名 `views.cuts`，同时切所有零件；两个平面一起切暂不做）；`coilBank` 只做平直和 L 形（弧形蒸发器用两三段倾斜的平直盘管拼）；流不随拆开移动；`extrude` / 贯流叶片用 three 的 `ExtrudeGeometry`（`panelHole` 仍是手工三角化）。
- **glb**：可以用 meshopt 压缩 + 量化（解码器内联，见「真实网格与人体肌肉」）；不要用 Draco（解码器在 CDN，Atlas 不允许运行时外部请求）。mesh 名找不到是 `pnpm validate` 的 error（运行时不再 console.warn）；glb 整体加载失败时舞台中央出双语说明，积木零件照常显示。glb 零件写 `material`。

### 生物与有机形体（docs/14 §8 B1–B12）

生物主题（蚱蜢等）用到的数据，全部可选、向后兼容（不写 = 原来的行为）。形状对照 `sample-space` 第 04 章（一只占位"小虫"：躯干 sweep、双侧的眼 / 腿 / 翅、姿态、命名剖切、淡显）。

```jsonc
// primitive 的新字段与新 kind（lib/sweep.ts、lib/wing.ts、stages/model3d/organic.ts）
{ "kind": "sphere", "size": [0.07], "scale": [1, 1.35, 0.95], "at": [...], "color": "eye" }   // scale：沿自身轴先缩放，再 mirror、再 rotation（球 → 椭球）
{ "kind": "sweep",
  "path": [[0,0,0], [0.4,0.3,0.1], [0.8,0,0.2]],   // 相对 at；centripetal Catmull-Rom 平滑通过各点（≤ 128 点）
  "radius": [0.06, 0.05, 0.02],                    // 一个数，或每个路径点一个（平滑插值）
  "section": { "flat": 0.42 },                     // round（默认）| flat（= 0.5）| u | {flat: 高/宽} | {u: 开口°, flat?}
  "up": [0, 0, 1],                                 // 截面的"上"（默认 +Y）：flat 沿它压扁，U 的开口背向它
  "hollow": 0.008,                                 // 可选：壁厚 → 空心管（剖切看到腔）；U 截面默认壁厚 0.14 r
  "rings": { "every": 0.06, "depth": 0.12 },        // 可选：每 every 一道环节沟，深 depth × r（触角分节、腹节、气管螺旋丝）
  "caps": "round",                                 // round（默认，半球帽）| flat | none（开口，不填剖面）
  "closed": false, "radial": 16, "segments": 64 }  // closed = 闭环；radial / segments 默认按半径、长度、环节自动
{ "kind": "wing",
  "outline": [[0,0], [1,0], [0.9,0.4], [0.5,0.6], [0.1,0.3]],   // XY 平面里的外形（相对 at），厚度沿 Z
  "veins": [[[0,0], [0.9,0.2]], [[0,0], [0.5,0.5]]],            // 翅脉：折线，画成墨色细线（透明膜一层，在中面；不透明翅两面各一层）
  "thickness": 0.004,
  "fold": { "hinge": [0,0], "segments": 6, "lead": [1,0], "rest": 0, "foldedWidth": 0.12 } }
  // fold：以 hinge 为轴的扇面。fan 1 = 按 outline 画的展开样，0 = 收拢：所有点绕 hinge 转向前缘（到 lead 的射线，默认第一个外形点），
  // 整扇收成展开角的 foldedWidth，并折成 segments 道手风琴褶。rest = 静止时的 fan（默认 0，收拢）。姿态 / sequence 的 `fan` 驱动它。

// part
"bilateral": true                          // 或 { "axis": "z", "side": "left", "labelBoth": false }
// 只写一侧；引擎在构建期（parts.json → data.json）镜像出 `<id>-r`（side: right 时 `<id>-l`），关于过原点、法线 axis（默认 z）的平面：
// 几何、材质、explode.dir、指向它的动画、姿态条目、connects 里的其它双侧零件都镜像。双胞胎是完整零件（可选、可标注、可 hide / ghost、
// 流和章节都能写 `<id>-r`），但不另编号、不进零件链路卡、PARTS 不重复计数；选中时状态行写 `#05 HIND FEMUR · L`，详情卡有"左 / 右"芯片。
// 引线标注默认只标数据这一侧；labelBoth 时列出 `<id>` = 两侧各一个标签。`hide` / `ghost` 写 `<id>` 同时作用于两侧，写 `<id>-r` 只作用于镜像那侧。
// 代价：镜像件单独绘制（每个材质槽 +1 draw call）。

// group
{ "id": "growth", "name": {en, zh}, "color": "token:food", "card": false }   // card:false：这一组不进右上零件链路卡（照常编号、可选、可标注）
{ "id": "leaf-section", "name": {en, zh}, "color": "token:accent-2", "scale": { "unit": "mm", "magnification": 20 } }
// scale：这一组是焦点时（选中了组里的零件、单显这一组、或当前拍 / 本章的 labels 里有 `group:<id>`），组的屏幕框下方画一条发丝比例尺：
// 约 100 px 的整数长度（1 / 2 / 5 × 10ⁿ），标签按 unit 写，放大画的子模型带倍数（`5 MM · ×20`）；实长按 parts.json `units`（没写 = 1 场景单位 1 m）÷ magnification
// unit 可写 um（显微镜下的细胞）：小于 0.1 mm（um 下小于 1 mm）写 µm，保留小写（`10 µm · ×5000`，不写成 µM；docs/38 E-LT5）
// （`hud/GroupScaleBars.tsx`、`lib/units.ts groupScaleBar`，有单测）
// context 零件可以写 group：受图层开关、ghost、solo 控制（仍不标注、不可选）

// flow
"bilateral": true                          // 另跑一条镜像流 `<id>-r`：path 镜像，parts 换成各自的双胞胎（一次绘制 +1）

// animations：rotate / oscillate / pulse 都可加 pivot（场景坐标，关节点）；pulse.scale 可以是 [sx, sy, sz]
{ "id": "chew", "target": "mandibles", "kind": "oscillate", "axis": [0, 1, 0.2], "amplitude": 14, "hz": 1.5, "pivot": [-1.18, 0.44, 0.07] }
{ "id": "pump", "target": "abdomen-sternites", "kind": "pulse", "scale": [1, 1.1, 1.04], "hz": 0.33, "pivot": [0.5, 0.5, 0], "whenRun": false }
{ "id": "kick", "target": "hind-tibiae", "kind": "sequence", "pivot": [1.02, 0.86, 0.32], "loop": true,
  "keys": [ { "t": 0, "rotation": [0, 0, 0] }, { "t": 1.4, "rotation": [0, 0, 25] }, { "t": 1.9, "rotation": [0, 0, 25] }, { "t": 2.0, "rotation": [0, 0, -120] }, { "t": 2.4, "rotation": [0, 0, 0] } ] }
// sequence：keys 的 t（秒）递增，rotation（XYZ 欧拉，度，绕 pivot）/ offset / scale / fan，键与键之间 smoothstep；loop:false = 每次运转从头播一次、停在最后一键

// poses（≤ 32）：{ "<姿态名>": { "<零件 id>": { pivot?, rotation?, offset?, scale?, fan? }, …, "duration"?: 秒 } }（关节角与收缩见下节）
// 变换顺序：绕 pivot（场景坐标，默认零件中心）先 scale 再 rotation，然后 offset。duration 默认 0.8 s（"duration" 是保留键）。
// 双侧零件的条目自动镜像给双胞胎（除非该姿态也写了 `<id>-r`）。fan 只给带 fold 的 wing。

// views.cuts（≤ 4）：命名剖切面，语义同 views.cutaway；章 / 拍 `cutaway: "<名字>"`
"cuts": { "sagittal": { "normal": [0, 0, -1], "offset": 0, "label": { "en": "Sagittal", "zh": "矢状" } } }

// units：1 场景单位 = scale 个 modelUnit（mm | cm | m）
"units": { "modelUnit": "mm", "scale": 25 }
```

- **材质族（生物）**：`chitin`（半光泽角质，用 `tint` 给物种本色，带极淡橘皮法线）、`membrane`（半透明 .55、双面、不写深度、不填剖面；后翅、鼓膜、气囊）、`tissue`（哑光软组织，自身颜色的微弱自发光模拟透光）、`muscle`（纵向纤维法线）、`trachea`（白、螺旋环纹法线）、`nerve`（淡黄）、`eye`（深色高光 + 六边形小眼法线）、`scales`（半光泽 roughness .45：一排排互相错开的半圆鳞，每片中间高、边缘一道暗缝，法线 + 灰度颜色贴图；绕 sweep 截面一圈 14 片，鳞的大小随零件粗细走；`tint` 给物种本色，docs/38 E-LT4）、`feathers`（哑光 roughness .8：沿 u 一排排细长叶形羽片，上下重叠、中间一道羽轴，法线贴图；`tint`）。法线贴图按需生成（机器主题不生成）。sweep 的 UV：u = 弧长 / 平均周长，v = 绕截面一圈，所以纤维 / 环纹密度跟管径走。
- **token**：`token:food`（赭绿，食物）、`token:haemolymph`（灰青，血淋巴），两套主题都有。
- **姿态与动画的叠加**：零件变换 = 位置（静止中心 + 拆开 / 移开）→ 姿态（缓动矩阵）→ 动画（绕各自 pivot）→ 形状。姿态跟拆开、X-RAY、剖切都兼容；引线锚点跟着姿态走（不跟动画走）。REFERENCE 不重置姿态。
- **淡显**：章 / 拍 `ghost: [组或零件]`（不累积）与控制面板 LAYERS 每行末尾的 `⊙`（单显这一组、其余淡显；再点或 ESC 取消；存 store 的 `solo`，换章清掉，不进 URL）。淡显 = .12 透明、不写深度、不可点、不标注、不遮挡标注；选中的零件不淡显；被单显的组即使图层关着也显示。
- **剖切面名**：状态行写 `CUTAWAY <label>`（默认面仍是 `CUTAWAY 50`）；C 键仍切默认面（开着命名剖切时 C = 关）。
- **PLATE 立面实长**：有 `units` 时比例尺写 `10 MM` / `5 CM`（1 / 2 / 5 × 10ⁿ 的实长），标签行加模型在立面上的跨度（`XY · 47 PARTS · 64 MM`）；没有时照旧 `U`。分区括号最多三行（放得下就并排），组多于 5 个时图例行距收紧。

### 真实网格与人体肌肉（docs/16 §9 M1–M13）

肌肉主题（docs/16）用 glb 真实网格，不用程序化积木；下面的字段全部可选、向后兼容。形状对照 `sample-space` 第 05 章（一段占位"肢体"：`public/models/sample-space.glb`，由 `pnpm tsx scripts/make-sample-glb.ts` 生成，两根骨、一块带纤维数据的蒙皮"肌肉"、两侧真实节点、肘部动作、起止点、哑铃）。

**glb 加载（M1）**：three 自带的 GLTFLoader + meshopt 解码器（`three/examples/jsm/libs/meshopt_decoder.module.js`，内联 wasm，不发任何请求；构建产物里无外部 URL）+ 原生 `KHR_mesh_quantization`；Draco 仍关（解码器在 CDN）。加载时舞台中央一条 hairline 进度条（按字节），失败时舞台中央一行双语说明（程序化零件照常画）。three 读 glb 时会去掉节点名里的 `.` `:` `/` `[` `]`（`pec.l` → `pecl`），引擎按同样规则查名，数据里照写原名。场景被克隆（SkeletonUtils），网格取出交给 PartNode（每个零件一个材质、一次绘制），剩下的骨架挂在舞台上。PWA 运行时缓存 `/models/*.glb`（不预缓存）。

```jsonc
// parts.json 顶层
"model": "/models/muscles-chest.glb",          // asset.copyright 写署名与许可（validate 查非空）
"rig": {
  "joints": {                                   // 关节名：kebab-case + 可选 .l / .r（身体自己的左 = +X）
    "shoulder.l": { "node": "shoulder.l",       // glb 骨骼节点名
                    "axes": { "flexion": [-1, 0, 0], "abduction": [0, 0, 1], "internal-rotation": [0, 1, 0] } },
    "elbow.l":    { "node": "elbow.l", "axes": { "flexion": [-1, 0, 0] } },
    "hand.l":     { "node": "hand.l", "axes": { "flexion": [-1, 0, 0] }, "offset": 0.08 },   // 握点 = hand.l / hand.r 骨原点 + offset：数字 = 沿前臂（父骨→本骨）到掌心的米数（约 8 cm），或静止时场景坐标的向量 `[x, y, z]`；两种都随手关节转（屈腕时掌心跟着走）
    "trunk":      { "node": "joint.trunk", "axes": { "flexion": [-1, 0, 0] } }    // 可选：动作模式整体转体的支点（没有时用非 context 零件的中心）
  },
  "demo": { "elbow": { "flexion": 110 } }       // 肌肉卡 ACTIONS 页"演示"摆到的角度（按动作关节 × 动作；默认 60°）
},
"sites": [                                       // 起止点（M6）：muscle = 肌肉零件 id，bone = 骨零件 id，points = 1–8 个场景坐标点（宽附着写 2–4 个点的折线）
  { "muscle": "pectoralis-major-clavicular", "kind": "origin",    "bone": "clavicle", "points": [[0.04, 0.21, 0.07], [0.09, 0.22, 0.06]] },
  { "muscle": "pectoralis-major-clavicular", "kind": "insertion", "bone": "humerus",  "points": [[0.17, 0.12, 0.05]] }
],
"views": { "explodeLabel": { "en": "Peel", "zh": "剥层" } }   // EXPLODED 模式与滑块在本主题的名字（M4）

// part
{ "id": "pectoralis-major-clavicular",
  "mesh": "pectoralis-major-clavicular.l",                       // glb 节点名 = 零件 id + .l / .r
  "bilateral": { "axis": "x", "mesh": "pectoralis-major-clavicular.r" },   // M3：双胞胎画 glb 里真实的右侧节点，不镜像几何（真实身体不完全对称）
  "material": { "color": "muscle", "tint": "token:muscle-1" },   // M2：glb 零件的材质（没有 primitive 时必填）
  "muscle": "pectoralis-major-clavicular",                       // M9：共享肌肉卡；summary / detail / short 不写时取肌肉卡的
  "short": { "en": "Pec maj · clav", "zh": "胸大肌锁骨部" },       // M13：卡片、引线、本章索引、PLATE 选中行优先用短名
  "explode": { "dir": [0.2, 0, 1], "dist": 0.06, "stage": 0 },   // M4：剥层，stage 0 先走
  "group": "superficial", "connects": ["clavicle", "humerus"] }
// glb 节点 extras.closed: false → 剖切不填剖面（默认填）

// poses：零件条目之外可以写关节角与收缩
"poses": { "bench-bottom": {
  "joint:shoulder.l": { "horizontal-abduction": 30, "abduction": 60 },   // 关节角（度）沿 rig 的解剖轴
  "joint:elbow.l": { "flexion": 95 },
  "contract": { "pectoralis-major-sternocostal": 0.2 },   // 零件 id → 0..1（0 = 伸长 / 静止，1 = 最短）
  "duration": 1.2 } }

// animations：sequence 可以驱动关节；新 kind contract（M7）
{ "id": "wave", "target": "joint:shoulder.l", "kind": "sequence", "keys": [ { "t": 0, "angles": { "abduction": 0 } }, { "t": 1.5, "angles": { "abduction": 20 } } ] }
{ "id": "work", "target": "pectoralis-minor", "kind": "contract", "amount": 0.7, "bulge": 0.08, "hz": 0.5 }   // 0 → amount → 0；零件 sequence 的键也可以写 "contract": 0..1
```

- **关节角（M5）**：`axes` 给每个动作的旋转轴（场景坐标，静止姿态下；正角 = 这一侧身体做这个动作），反向动作用同一根轴取负（extension 20 = flexion −20；一对反向动作只写一根轴）。角按 `axes` 的书写顺序作用在骨骼自身原点上、相对父骨（肘的轴跟着上臂走）。左关节（`.l`）的角自动驱动右关节（`.r`，rig 有它且姿态 / 动作 / 片段没单独写它时）——因为轴是解剖轴，同样的数字就是镜像动作。`joint:<名>` 的 sequence 片段同理自动生成 `-r` 副本。
- **蒙皮（M5）**：glb 里蒙皮的网格画成 SkinnedMesh（detached bind mode：拆开、移开、刚体姿态照常叠加在骨骼之上）；不做视锥裁剪；X-RAY / 剖切 / 淡显 / 选中边缘的 shader 补丁不替换顶点块，three 自带的蒙皮块照常生效。引线锚点按蒙皮后的包围盒每 6 帧重算一次（采样 ≤ 256 个顶点，只在骨骼动时）。取景、立面、地面阴影用静止时蒙皮后的包围盒。
- **收缩（M7）**：管线给肌肉烘焙 `_U`（起点 0 → 止点 1）与 `_FIBRE`（单位纤维方向）两个顶点属性。收缩值 c（姿态 `contract`、动作关键帧、`contract` 动画、肌肉卡演示，取最大）在顶点着色器里**向起点**缩短：位移 ∝ `_U` × c × 20 % × 纤维长（`_U` ≈ 0 的起点端不动、贴在骨上），方向 = 全网格主纤维方向与本顶点 `_FIBRE` 各半（纤维数据有噪声也不会出尖刺），单顶点位移软封顶在纤维长的 12 %；垂直纤维方向鼓起 `bulge` × 肌腹厚度，鼓起轮廓 sin²(π`_U`)、在 `_U` .5 处最大（都加在蒙皮之前）；片元叠一条沿 `_U` 移动的 signal 色细纹（≤ .35）。内容里的收缩值按 0..1 的本义写（不要再为着色器打折）。没有这两个属性的零件退回整体缩放（沿最长轴缩短、横向鼓起）。
- **纤维纹理**：有 `_FIBRE` 的 glb 肌肉不用 UV 法线贴图（管线的 UV v 绕肌腹一圈，在扇形肌上画出同心环），改由着色器按 `_FIBRE` 画细纹：位置在局部纤维方向上的垂直分量取值噪声（沿直纤维不变，扇形肌上随纤维汇聚），屏幕导数做凹凸，像素太密时淡出。
- **剥层（M4）**：有 `explode.stage` 的零件按层错时外移：n 层时第 s 层在滑块 [s × 0.6/(n−1), +0.4] 里缓动走完（三层 = 0–0.4、0.3–0.7、0.6–1.0）；没写 stage 的零件照旧随滑块线性移动。`views.explodeLabel` 给模式按钮、状态行、滑块改名。
- **起止点（M6）**：选中的肌肉零件、章 / 拍 `sites` 列出的肌肉零件显示：起点空心圆、止点实心圆（屏幕恒定大小、HUD 墨色）、多点附着连一条细线、起止质心之间一条虚线 = 拉力方向；点跟着骨走（蒙皮骨：按骨零件上最近顶点的蒙皮权重混合；刚体骨：跟零件变换）。点标记（44 px 命中区）= 选中那块骨。双侧肌肉的 sites 自动镜像给双胞胎（除非数据写了双胞胎自己的）。
- **单显与高亮（M11）**：store 的 `solo` 可以是组 id（控制面板 ⊙）或零件 id（肌肉卡的 SOLO 按钮）：零件单显 = 这个零件、它 `connects` 的零件、shell 与 context 零件实心，其余 .12 淡显；ESC 依次取消选中、单显、演示、动作。章 / 拍 `highlight: { signal: [...], cold: [...] }`（组或零件）把底色往 signal / cold 色混 55 %，不换材质族（store 字段叫 `tints`：`highlight` 是 TimeScene 的 URL 字段）。
- **取景（M12）**：最小镜头距离与封面镜头只按非 context 零件取景（全身皮肤轮廓不把镜头推远）；灯光、阴影、标注预算仍按全部零件。

**共享肌肉 / 动作数据（M10）**：`src/content/shared/fitness/muscles/<区>.json`（`{ muscles: [...] }`）、`exercises/<模式>.json`（`{ exercises: [...] }`）、`sources.json`（`{ sources: [{ id: "M1", … }] }`），schema 在 `src/content/schema/fitness.ts`（字段见 docs/16 §4.2 / §4.3；`dose` 按决定 11 改为 `[{ text: {en, zh}, s: ["M#"] }]` 只写原则）。主题写 `data/training.json`：`{ "exercises": [动作 id…], "note"?: {en, zh}（肌肉卡 TRAINING 页的一句原则）, "session"?: { title, blocks: [{ exercise, note? }], note?, s? } }`。构建（`src/lib/content.ts`）与 `pnpm validate`（`scripts/lib/shared-data.ts`）都用 `withSharedFitness` 把主题用到的条目合并进 data.json 的 `fitness`：零件 `muscle` 链到的肌肉（及其 parent），training 与这些肌肉列出的动作，这些动作提到的肌肉，加全部共享来源。共享来源编号 `M#`：正文 `<Num s="M3">`、详情 `[M3]`、来源浮层都认；`pnpm tsx scripts/sources-md.ts --shared fitness` 写 `shared/fitness/SOURCES.md`，有 training.json 的主题跑 `sources-md.ts <slug>` 时 SOURCES.md 多一块共享来源。许可字段：glb 的 `asset.copyright`（validate 查非空）、主题 `SOURCES.md` 的 S# 条目、`topic.yaml` 的 `note`（docs/16 §3.2）。

**动作模式（M8）**：章 / 拍 `exercise: { id, phase: start | end | loop, bones?: true }`（默认 loop；必须在 training.json 里）或肌肉卡 EXERCISES 页的芯片进入。引擎读共享动作的 `motion`（写法见下面的**动作模式数据手册**）：整体转到动作体位（`root`）、按关键帧摆关节（`keys`、`tempo`）、画器械（`equipment`）、用**接触求解**让手 / 脚停在器械或地面上而身体去动（`contacts`，`lib/contact.ts`）、**由关节角算出收缩**（`lib/contraction.ts`）、用**动作镜头**取景（`lib/camera.ts`）。

- **身体样式（`views.exerciseBody`：`wire` | `mannequin` | `ghost`）**：主题有蒙皮的 `context` 皮肤零件时，动作播放期间身体换成示意人形，淡入淡出 0.4 s。默认：glb 有 `skin-wire` 节点 → `wire`，否则 `mannequin`。
  - `wire`（`stages/model3d/WireBody.tsx`）：管线的 `skin-wire` 低模（~3.4 k 三角形，全身蒙皮）画成技术图版式线框——只画**特征边**（相邻面折角 > 20° 的棱与开口边，`lib/hands.ts` `featureEdges`，GPU 蒙皮的线段），`token:ink` 55 %，底下一层 8 % 墨色平涂剪影；三次绘制都用**往后推的深度**（`pushDepth.ts`）：先只写深度（不透明、在肌肉之前），剪影只有最前一层通过（均匀一层，不叠色），边线比深度层近 8 mm，所以被背面挡住（消隐线，不是一团网）、在皮下肌肉后面。不投影。glb 没有 `skin-wire` 时，写了 `wire` 的主题在加载时把皮肤轮廓边折叠减面到 ~4 k 三角形代用（`bodyGeometry.ts` `decimateSkinned`，较慢较糙，`pnpm validate` 警告）。
  - `mannequin`（`Mannequin.tsx`）：皮肤画成实心哑光模特（`token:mannequin`：paper 暖浅灰，cinema 中灰；roughness .85、环境光很轻，投主光阴影）。模特只写**往后推 6 cm 的深度**（颜色和轮廓不动）：皮下 6 cm 以内的肌肉（近侧）通过深度测试画在模特上面，远侧肌肉、身体后面的东西（背下的凳、地面、远处的立柱）被挡住；在身体前面的杠会挡住身体。
  - 两种样式都：骨骼（既不是肌肉也不是 context 的零件）隐藏（拍写 `exercise.bones: true` 时保留）；器械实心（地面 50 %），`wire` 下钢索细到 3 mm；**手是程序化的**（见下）——皮肤自己的手（管线的 `skin-hand.l/.r`，以及皮肤 / 线框里腕关节以远、由手臂骨带动的三角形）不画，脚用皮肤自己的。`ghost` = 旧的淡显轮廓（器械半透明、皮肤的手原样）。
  - **手（`lib/hands.ts` 选型与朝向，`handShapes.ts` 几何，`Hands.tsx` 摆放）**：每只手按动作的器械选一种——`fist` 握拳：手里有杠铃 / 高位下拉杆 / 绳索直杆 / 单杠（掌到掌的杠）、哑铃 / 壶铃 / 绳索 D 形把手 / 绳把 / 弹力带（这只手拿的那件，`hand` 决定哪只手）、双杠和立杆顶横杆（沿场景 Z）、拉踝套时扶的绳索立柱（沿场景竖直，`scene-y`），四指成短管绕握持轴一圈、掌在轴后、拇指反向扣在四指上，半径 = 握的东西（≥ 12 mm）；`palm` 张掌：没拿东西，且掌是接触点（`contacts` 含 `hands` 或这一侧的 `hand.*`、器械里有地面 / 凳 / 台阶 / 座椅），或掌离地面 / 凳面在 2 cm 以内（每帧判断）——掌面平贴在那个面上、掌根在腕关节下、手指顺前臂方向（前臂立着时朝头，如俯卧撑；平放时顺前臂，如肘撑平板）；否则 `relaxed` 微屈。拳的坐标系：y = 前臂方向（肘 → 腕），拇指按 `grip`：`pronated` 指向另一只手（卧推、引体），`supinated` 背向另一只手（弯举、反握引体），`neutral` 沿把手朝前（锤式弯举、双杠；前臂朝前时朝头，如仰卧飞鸟顶端）；左手是右手的镜像。拳心在握点（rig `hand.*` + `offset`，器械也在这），掌在腕下的地面上，放松的手在腕关节；腕关节一个球 + 一段腕连接到掌根。`mannequin` 下实心（模特色、投影），`wire` 下是**描边形**：不透明的 8 % 墨平涂 + 背面外扩 3 mm 的 70 % 墨轮廓。QA：`__atlas.engine.exerciseBody('wire' | 'mannequin' | 'ghost' | null)` 临时换样式（不进 URL）。
- **着色**：`primary` signal、`secondary` cold、`stabilisers` 原色、其余链接了肌肉的零件淡显（.12）；动作中着色强度随收缩变：放松时 45 %，最短时 100 %（`PartNode` `tintLive`）。
- **收缩 = 关节角算出来的**：对动作 `primary` / `secondary` / `stabilisers` 列出的每块肌肉（显示它或它的头的零件），读它肌肉卡 `actions` 里每条（关节、动作、角色）：`along = 角(动作) − 角(反向动作)`（该侧关节、当前帧），`c = 权重 × clamp01((along − lo) / (hi − lo))`，lo / hi = 这个动作所有关键帧里 along 的最小 / 最大值（关节往肌肉动作方向走得最远处肌肉最短，与 start / end 谁在前无关）；权重 prime 1、assist 0.5、stabilise 0.2，一块肌肉取各动作最大值（同一关节上一对相反动作都列了时只算一个：角色强的那个，同级时取关节活动范围偏向的那一侧——卧推范围在屈的一侧，胸大肌只按"屈"算，不会两端都显示收缩）；所有动作都不动（关键帧间 < 5°）的列出肌肉 = 等长，整段 0.3。关节：零件 `-r` = 右侧，取 `<关节>.l/.r`，否则无侧的 `trunk`；`wrist` 退到 `hand`，`forearm` 的旋前 / 旋后退到 `elbow`（`lib/rig.ts` `jointCandidates`，肌肉卡 ACTIONS 演示按钮、MotionDriver 演示、validate 共用）；无侧关节上右侧肌肉的侧屈取反、旋转取绝对值。关键帧手写的 `contract` 只作**覆盖**（该肌肉用手写值，其余照算）。
- **接触求解**：`contacts` 第一项精确满足——`hands`：两掌中点停在第一键的位置，身体平移（引体向上屈肘时身体上升、双杠下沉、悬垂举腿吊着）；`hand.l` / `hand.r`：只钉这一只掌（单臂划船撑凳的手）；手（双手或单手）在前、`feet` 或 `knees` 在后且手撑地面 / 凳：身体绕脚（有踝关节时用前脚掌，否则模型脚尖）或绕双膝中点转，让掌心保持高度（俯卧撑；鸟狗式 `['hand.l', 'knees']`）；`knees`：双膝中点停住（跪姿）；`feet`：站姿脚掌钉地（`lib/stance.ts`；器械有 `step` 时钉前脚掌、脚跟可以落到台阶下）；`seat`：不修正。关键帧可以写自己的 `root`（同 `motion.root` 写法，卷腹抬起躯干）：身体在键之间转，接触点与器械按第一键的转向固定。不写时按器械推：引体杠 / 双杠 → `[hands]`，地面且 root 绕 X ≥ 30°（俯身）→ `[hands, feet]`（rig 没有手时整对丢弃），凳 / 座椅 → `[seat]`，站立 → `[feet]`，其它不修正。数据写了但 rig 做不到的接触往后顺延。
- **动作镜头**：出现新动作时（没有自己 `camera` 的拍、章节、深链、动作芯片），MotionDriver 下一帧把模特在各关键帧（及两键中点）的蒙皮顶点、握点和手里哑铃 / 壶铃的伸出范围算一遍（`bridge.exerciseFrame`；杠铃两端、立柱顶、单杠立柱不算，允许出画），CameraRig 以这些点在画面上的范围中心对准、沿体位方向退到它们占画高 72 %（`fill`）或两侧 HUD 之间宽度 56 %（窄屏 90 %），fov 24°；人物中心比画面中心高 8 % 半高（底部 HUD）。演示时字幕卡盖住底部：人物居中放在字幕卡上沿（留 8 % 半高）到画面顶 90 % 之间的带里，带不够高时 `fill` 缩到带高，但带至少 1.2 个半高（`lib/camera.ts` `exerciseFraming`；以前把上抬量从 `fill` 里减掉，演示时人物只占画高 ~40 %）：仰卧 = 侧上方（方位 55°、仰角 36°，从脚的一侧看，杠不正对镜头）、俯身 = 侧面稍高（82° / 16°）、侧卧 = 正前（12° / 22°）、髋铰链（root 绕 X ≥ 25° 或躯干屈 + root ≥ 30°）= 侧面（88° / 10°）、站 / 坐 / 悬垂 = 前 3/4（35° / 12°）。方位从身体正前（+Z，随 root 的 Y 转）往身体左侧量。`motion.camera` 改方向，拍自己的 `camera`（轨道相机或预设名）优先。同一动作换 start / end、选零件时镜头不动；拖动后自由镜头不被拉回。
- 器械统一中性哑光灰（倒角处有柔和高光），线框 / 模特样式下实心（地面 50 %），淡显样式下立式器械 60 %、地面 25 %；不投影；每件一次绘制，不可点、不标注。
- 阅读面板的检视器先出**动作卡**：示意图（`sketch`，两格石墨图；cinema 下反相）、器械与级别、START / END / LOOP（能播放时）、主动 / 协同 / 稳定肌芯片（点 = 选中显示该肌肉的零件）、准备、步骤、提示、错误、练多少（带来源）、注意事项、研究显示、固定的安全行（UI 文案）。`pnpm shoot --beats` 对 loop 的动作拍再各拍一张起始键与结束键（`beat-<章>-<n>-start.png` / `-end.png`，测试钩子 `__atlas.engine.exercisePhase(phase)`；两张同一个镜头）。

**肌肉卡（M9）**：零件链接了 `muscle` 时，检视器（手机上是同一个底部抽屉）出 SOLO 按钮与四页：FEATURES（层、起点 / 止点文字 + 骨芯片、纤维排列与走向、在自己身上找到它、"Tell me more" = detail）、ACTIONS（关节 · 动作 · 角色，每行"演示"按钮：该侧关节按 `rig.demo` 角来回摆、这块肌肉同步收缩；rig 没有那根轴时不出按钮）、TRAINING（常见错误、training.json 的 `note`、伤病）、EXERCISES（动作芯片 → 动作模式 + 动作卡）。标签页是 WAI-ARIA tablist（← → 切换，44 px）。

**token**：`token:muscle-1` / `muscle-2` / `muscle-3`（浅层最暖 → 深层最暗，低饱和，不是血红）、`token:bone`（象牙）、`token:mannequin`（动作模式的模特；线框人形用 `token:ink`），两套主题都有。

#### 动作模式数据手册

一个动作的 `motion` 依次回答五个问题。全部字段在 `src/content/schema/fitness.ts`，`pnpm validate` 检查：器械种类与字段（每种器械只收自己的字段）、`cable` / `band` 必须给 `at`、杠铃 `on: back` 必须给 `at`、关键帧关节和器械要的关节（手持 → `hand.l/.r`，背杠 → `trunk`，弹力带拉脚 → `ankle.l/.r`）都在主题 rig 里、`contacts: [hands]` 要有双手；卡片 `equipment`（barbell / dumbbell / cable …）而动作没画对应器械时给警告。

1. **体位 `root`**：`rotation` = 整个身体绕 trunk 关节的 XYZ 度（站 [0,0,0]；仰卧 [-90,0,0]，头朝 −Z、脸朝上；俯卧 [70–90,0,0]；侧卧 [0,0,±75]；转向 [0,yaw,0]），`offset` 米。中立站姿下所有关节角 0。
2. **器械 `equipment`**（一个或 ≤ 4 个；`at` 都是相对 trunk 关节、root 转完后的场景米数，`turn` 绕 Y 度）：
   | kind | 手 / 脚 | 字段 | 放在哪 |
   |---|---|---|---|
   | `barbell` | 杠 / 地 | `grip` `width` `on: hands \| back` `at` | 两掌之间；`on: back` 骑在 trunk 关节上，`at` 是 trunk 静止坐标系里的米数 |
   | `dumbbell` `kettlebell` `cable-handle` | 把手 / 地 | `grip` `hand: left \| right \| both`，哑铃 / 壶铃 `hold: across \| along \| vertical \| both` | 每只持握的手一个（`neutral` = 前后向）；`hold: along` 顺前臂，`vertical` 竖立（`hand: both` 时一只竖在两掌之间：高脚杯深蹲），`both` 一只在两掌之间、顺两前臂（仰卧上拉、高脚杯）；两手托一只时手张开 |
   | `lat-bar` | 杠 / 地 | `grip` `width` `at` | 1.2 m 直杠在两掌之间，钢索到 `at`（缺省：第一键杠的上方 0.85 m） |
   | `cable` | 把手、杠、绳把或踝套 / 地 | `hand` `handle: d-handle \| bar \| rope` `grip` `at` `turn` `to: ankle.l \| ankle.r` | 2.2 m 立柱立在 `at` 的 x / z、地面上，滑轮在 `at`，钢索到每只持握手的 D 形把手（`bar` = 两掌之间 0.5 m 直杠）；两侧绳索夹胸写两个 `cable`，各 `hand` 一侧 |
   | `band` | 把手 / 地 | `hand` `to: hands \| feet` `at` | 从锚点 `at` 到手（或前脚掌） |
   | `bench` / `incline-bench` | — / 地 | `at` `turn`，`incline` / `angle`（默认 30°） | 凳面顶在 `at`，长轴 Z、头端 −Z |
   | `machine-seat` | — / 地 | `at` `turn` `angle`（靠背后仰，默认 10°）`height`（0.45）`thighPad` | 座面顶在 `at`，靠背在 −Z |
   | `pull-up-bar` | 杠 / 悬空 | `grip` `width` `turn` `height`（2.3） | 杠在第一键两掌处、沿掌到掌方向，立柱落到杠下 `height` 的地面 |
   | `dip-bars` | 把手 / 悬空 | `at` `height`（1.45） | 两根杠各在一只掌下 |
   | `step` | — / 台阶 | `at` `turn` `height`（0.2） | 前脚掌下方（+ `at`），台面 = 模型地面，地面降一个台阶 |
   | `floor` | — / 地 | `at` `turn` | 掌撑地时顶面 = 掌高，否则 trunk + `at` |
   | `wall` | — / 地 | `at` `turn` `height`（2） | 1.2 m 宽墙板立在 trunk + `at` 的 x / z、地面上，正面朝 +Z（靠背、靠脚跟） |
   | `post` | — / 地 | `at` `height`（1.1）`hand` | 40 mm 立杆立在 trunk + `at` 的 x / z、地面上；写了 `hand` 就立在那只手第一键的掌下，顶上一根沿 Z 的短横杆，手握在上面（站姿抬膝） |
   | `back-extension` | — / 地 | `at`（必填）`turn` | 45° 山羊挺身凳：髋垫顶面在 trunk + `at`（大腿前侧、髋下），脚踏板在第一键前脚掌下、踝滚轴在脚跟后，角度由垫到脚的腿线决定；横梁和两条腿落到脚踏板下 0.3 m 的地面 |
   | `rack` | — / 地 | — | 布景：两根立柱 + J 钩，钩在第一键杠铃的高度（卧推、窄握卧推、背蹲：杠"从钩上开始"，只是视觉，不改动作），立柱在杠后 7.5 cm、朝头（躺）或朝前（站）；必须同时有 `barbell`。半透明，不挡肌肉 |
   | `machine-frame` | — / 地 | `at` `turn` `height`（2.2） | 布景：器械外框立在 trunk + `at` 的 x / z、地面上——左右两柱相距 1.5 m、顶梁、后方（−Z）导杆上的配重片；半透明。坐姿器械（高位下拉、坐姿推胸、坐姿腿弯举）和 `machine-seat` 一起用，`at` 放在靠背后面，侧面镜头下柱子不挡身体 |

   `cable` 的 `handle: rope`：每只手一段短绳把（末端一个结），两股绳从钢索末端（两掌中点往滑轮方向 0.2 m）分到两掌（面拉）。`cable` 拉踝套（`to: ankle.*`）时写 `hand: left | right`：那只手握拳扶在立柱上（拇指朝上），立柱 `at` 放在那只手第一键的握点。`machine-seat` 的 `thighPad` 压在第一键膝盖后 13 cm 的大腿上。
3. **接触 `contacts`**：见上，按优先级写；`feet: left | right | free` 选哪只脚钉地（`free` = 悬空）。
4. **关键帧 `keys`**：start、可选 mid、end；`joints` 用解剖角（左关节自动驱动右关节；肩 / 髋的水平内收 / 外展最后转——先由屈 / 外展把肢体抬起，再绕躯干竖轴扫，所以低位手臂加水平内收是手往前、往内走，不是原地扭）；可选 `root`（这一键的整体转向）。先写 start 姿势（手在杠上、脚在地上），再写 end；身体位移交给接触求解，**不要**用关节角去"抬身体"。`contract` 只在算出来的不对时写。
5. **节奏 `tempo`** [start→end 秒, 停, end→start 秒, 停]（默认 [2, 0, 1, 0]）；`camera: { azimuth, elevation, fill? }` 只在默认方向看不清时写。

```jsonc
// 站姿 + 杠铃（背蹲）：杠在背上，脚钉地，镜头前 3/4
{ "root": { "rotation": [0, 0, 0] },
  "equipment": [{ "kind": "barbell", "on": "back", "at": [0, 0.55, -0.12] }],
  "contacts": ["feet"],
  "keys": [ { "phase": "start", "joints": { "hip.l": { "abduction": 8 }, "knee.l": { "flexion": 3 } } },
            { "phase": "end", "joints": { "trunk": { "flexion": 25 }, "hip.l": { "flexion": 75, "abduction": 8 }, "knee.l": { "flexion": 80 }, "ankle.l": { "dorsiflexion": 22 } } } ],
  "tempo": [2, 0.3, 1.5, 0.5] }
// 仰卧 + 凳（卧推）：坐在凳上不修正，镜头侧上方
{ "root": { "rotation": [-90, 0, 0] },
  "equipment": [{ "kind": "barbell", "grip": "pronated", "width": 0.8 }, { "kind": "bench", "at": [0, -0.205, 0.2] }],
  "keys": [ { "phase": "start", "joints": { "shoulder.l": { "flexion": 80, "abduction": 10 }, "elbow.l": { "flexion": 5 } } },
            { "phase": "end", "joints": { "shoulder.l": { "extension": 25, "abduction": 45, "horizontal-abduction": 15 }, "elbow.l": { "flexion": 110 } } } ] }
// 悬垂 + 单杠（反握引体）：手钉在杠上，屈肘时身体上升，脚悬空
{ "equipment": [{ "kind": "pull-up-bar", "grip": "supinated" }], "contacts": ["hands"], "feet": "free",
  "keys": [ { "phase": "start", "joints": { "shoulder.l": { "flexion": 165, "abduction": 10 }, "elbow.l": { "flexion": 5 } } },
            { "phase": "end", "joints": { "shoulder.l": { "flexion": 45, "abduction": 10 }, "elbow.l": { "flexion": 125 } } } ] }
// 绳索（高位夹胸）：两侧立柱，每只手一根钢索，脚钉地
{ "equipment": [ { "kind": "cable", "hand": "left", "grip": "neutral", "at": [0.85, 0.55, -0.35] },
                 { "kind": "cable", "hand": "right", "grip": "neutral", "at": [-0.85, 0.55, -0.35] } ],
  "contacts": ["feet"],
  "keys": [ { "phase": "start", "joints": { "shoulder.l": { "abduction": 85, "horizontal-abduction": 10 }, "elbow.l": { "flexion": 15 } } },
            { "phase": "end", "joints": { "shoulder.l": { "flexion": 35, "abduction": -12 }, "elbow.l": { "flexion": 15 } } } ] }
// 地面（俯卧撑）：掌和脚都在地上，身体绕脚转让掌心保持高度，镜头侧面
{ "root": { "rotation": [70, 0, 0] },
  "equipment": [{ "kind": "floor", "at": [0, 0, -0.45] }], "contacts": ["hands", "feet"],
  "keys": [ { "phase": "start", "joints": { "shoulder.l": { "flexion": 70, "abduction": 12 }, "elbow.l": { "flexion": 5 } } },
            { "phase": "end", "joints": { "shoulder.l": { "extension": 20, "abduction": 55, "horizontal-abduction": 15 }, "elbow.l": { "flexion": 105 } } } ] }
```

**模型前提**：模特只能按 glb 骨架动。主题 glb 的骨架缺哪条链，模特那部分就跟着躯干僵着（腿主题没有手臂骨、胸部主题没有腿骨、手臂 / 肩 / 背主题没有膝踝）；rig 里没写的骨（腰腹主题 glb 有手臂骨，但 rig 没映射）也不会动。要全身动作，先在管线 manifest 的 `jointNames` 补全全身关节重跑（`scripts/anatomy/README.md`），再在 parts.json 的 `rig.joints` 映射。

### SpaceScene · 试一试（sim）

绑定的补充规则：`pose` 没有列出当前值时保留章 / 拍姿态，只有显式 `null` 强制回静止；几条绑定动同一零件时非静止的那条胜出。`tint.max`（0–1）指定实际混色上限，默认 0.55 保持既有外观，`max: 1` 可以完全染成目标深色；它仍只染零件自己的材质槽 0。

docs/22 §4.3（E-SIM 核心，磁铁与电路共用）+ docs/23 §4（电路模型与电路图卡）。一个 SpaceScene 主题可以在 `parts.json` 里加一段 `sim`：读者能改的几个量（控件）、一个纯函数模型、模型给出的量（输出），以及控件 / 输出到零件、流、动画的绑定。没有独立的 Simulation 引擎（docs/03 §C）。代码：`sim-schema.ts`（zod 与交叉校验）、`lib/sim/`（`controls.ts` 值的合成与 URL、`index.ts` 模型注册表、`circuit.ts`、`magnet.ts`、`force.ts`、`energy.ts`、`lifecycle.ts`、`matter.ts`、`light.ts`、`sun.ts`、`shadow.ts`、`bind.ts`、`trial.ts`、`diagram.ts`、`sort.ts`、`shift.ts`、`keycard.ts`、`table.ts`、`hz.ts`、`tidal.ts`、`seeds.ts`，全部纯函数、有单测 `tests/space-scene/sim.test.ts` 等）、`explorer/TryIt.tsx`（试一试卡片）、`hud/CircuitCard.tsx`（电路图卡）、`hud/KeyCard.tsx`（分类流程图卡）、`hud/sim.ts`（HUD 读写的入口）。

```jsonc
"sim": {
  "kind": "circuit",                                   // circuit | magnet | force | energy | life-cycle | matter | light | sort | materials | table | seeds：lib/sim/<kind>.ts（life-cycle → lifecycle.ts）
  "controls": [                                        // ≤ 16，id 全主题的 sim 里唯一
    { "id": "main", "kind": "toggle", "default": true, "label": {en, zh} },
    { "id": "cells", "kind": "step", "values": [1, 2, 3], "default": 2, "label": {en, zh}, "unit"?: "cm" },
    { "id": "arrangement", "kind": "choice", "default": "single", "label": {en, zh},
      "options": [ { "id": "single", "label": {en, zh} }, …, { "id": "free", "label": {en, zh} } ],
      "sets": { "single": { "x": false, "y": false, "z": true }, "series": { … }, "parallel": { … } } }
  ],
  "outputs": [                                         // ≤ 32
    { "id": "i-cells", "label": {en, zh}, "from": "current:cells", "unit": "A", "decimals": 3 },   // from 默认 = id
    { "id": "status", "label": {en, zh}, "kind": "state", "from": "status:cells", "states": { "open": {en, zh}, "closed": … } },
    { "id": "edge-currents", "label": {en, zh}, "kind": "vector", "from": "edges" }
  ],
  "bind": [                                            // ≤ 64；每条只写 control 或 output 之一
    { "output": "bright-a", "part": "filament-a", "glow": { "color": "token:lamp", "full": 100, "curve": "sqrt" } },
    { "control": "cells", "part": "cell-3", "visible": { "gte": 3 } },
    { "control": "flip-2", "part": "cell-2", "pose": { "true": "cell-2-turned" } },
    { "control": "gap", "part": "pencil-lead", "pose": { "pencil-lead": "pencil-lead-in-gap" } },
    { "output": "edge-currents", "flow": "current-flow", "intensity": { "full": 0.25 } },
    { "output": "status", "flow": "current-flow", "stops": { "short": "token:hot" } },
    { "output": "motor-speed", "animation": "fan-spin", "rpm": {} },
    { "output": "buzz", "animation": "buzzer-pulse", "enabled": true }
  ],
  "circuit": { "nodes": {…}, "edges": [ … ], "materials": {…}, "loads": {…}, "reference": { "power": 0.68 }, "diagram": { "size": [290, 305], "labels": [ … ] } }
}
```

- **时间格式**：单位为 `h` 的步进控件与数输出可写 `format: "time"`，值是当地小时（可带小数，0–24）。所有卡片、表、PLATE 与状态行复用 `rich-text.ts` 的 `{t:HH:MM}`：`8.00 am` / `上午 8.00`，读屏读时刻；图轴整点短写 `8 am` / `上午 8`，间隔仍读小时。URL 保留数值。
- **控件**：`toggle`（开关）、`step`（有序的数，升序或降序，按写的顺序步进：间隙 6 → 3 → 1.5）、`choice`（选项 `{ id, label }`，id 不能是 `on` / `off` / 数字）。`choice.sets`：选这个选项同时设定别的控件（接法 → X / Y / Z）；读者手拨了被覆盖的控件时，选择移到 `sets` 正好成立的选项，否则移到第一个不带 `sets` 的选项（`free`，必须有一个），被覆盖的控件停在原处；`free` 本身一直是 `free`（`lib/sim/controls.ts setSimControl`，有单测）。默认值必须与默认选项的 `sets` 一致（validate 报）。
- **值从哪里来**：store 字段 `sim` 只存"设过的值"（不累积：章 `state.sim.set`，拍 `sim.set` 叠在本章的上面，读者在卡片 / 键 / 电路图上改的）；显示的值 = 默认 ⊕ 各选择的 `sets` ⊕ 设过的值，无效值忽略（`resolveSimValues`）。换章回到那一章的 `set`；ESC 不清；URL `sim`（见「URL 参数」）；演示的保存 / 恢复带着它；拍的深链接 `b` 照常。
- **模型**（`lib/sim/index.ts evaluateSim`，同步、< 1 ms，只在值变化时算）：`circuit` = 节点分析（docs/23 §4.2）：电池是诺顿等效（每节 `emf` 默认 1.5 V、`r` 每节内阻，`flip` 指定某节由开关翻转成 −EMF；`cells` 是数或步进控件），`switch`（合上 `closed` 默认 0.001 Ω，断开去掉），`wire`（`r`），`gap`（选择控件 → `materials` 的欧姆数，没列 = 绝缘、断开），`load`（固定 `load` 或选择控件；`present` 开关 = 装没装上；`loads` 的 `lamp`（`rated` W）/ `buzzer`（`on` A 以上响）/ `motor`（`at` V 时 `rpm` 的可视转速，∝ 电压））；每个连通块接地一个节点，高斯消元（部分主元），没有电池的块电流为 0。量名（输出的 `from`）：`current:<边>`、`volts:<边>`（电池 = 端电压）、`power:<边>`、`brightness:<边>`（灯功率 ÷ `reference.power` × 100）、`speed:<边>`、`sound:<边>`（`on` / `off`）、`status:<电池边>`（`open` < 1 mA、`short` > `short` A（默认 3）、`over-rating`：同一回路里有灯超过额定 × `over`（默认 1.5）、否则 `closed`）、`edges`（每条边的带号电流，from → to）。`magnet` = Gilbert 磁荷模型、场态、场线、铁屑、指南针、力箭头，见下面「SpaceScene · 试一试 · 磁铁」。validate 核对输出的 `from` 是这个模型的量、种类（数 / 状态 / 向量）对得上。
- **输出种类**：`number`、`state`、`vector`、`timeline`（一段"跑一遍"的过程：见「时间线与回放」；只能被 `play`、带 `channel` 的 `stretch` 和力的箭头读，不进卡片的观察量、读数、glow 等）。
- **绑定**（`lib/sim/bind.ts simEffects`，舞台叠在章节状态上）：零件 `visible`（条件：`true` = 真值 / 非零 / 不是第一个状态；或 `{ eq | ne | in | gte | lte }`）、`pose`（值 → `poses` 里的姿态，只动这些零件，压在章 / 拍的姿态之上；几条绑定动同一零件时非静止的那条胜出）、`glow`（值 ÷ `full`，`sqrt` 或 `linear`，0–2：从暗红渐到 `color`，过 1 更白；只点亮零件自己的材质，即槽 0：灯丝不带支撑丝和铜座）、`tint`（值 ÷ `full`，0–1，`linear` 或 `sqrt`：向 `color` 混色，上限由 `max` 指定（默认 0.55，范围 0–1）；铁芯通电变磁铁；同 `glow` 只染零件自己的材质，即槽 0，其余槽照常跟章 / 拍的 `highlight`，`lib/sim/bind.ts slotTint`）、`count`（`repeat` 零件只显示前 k 份：`true` = k 取值本身，或 `{ per, minus }` = (值 − minus) ÷ per 取整、≥ 0：50 g 挂钩上的 50 g 槽码写 `{ per: 50, minus: 50 }`，两只 200 g 砝码写 `{ per: 200 }`（docs/30 F8；`per` 原先是乘数，没有主题用过）；该零件不能有 `extra`）、`offset` / `rotate`（(值 − origin) × per（rotate 的 per 默认 1），在姿态之后沿场景轴移 / 绕（姿态后的）零件中心或 `pivot` 场景点转，0.5 s 缓动；`settle: { period, damping }` = 阻尼摆动（rotate：转角走近路；offset：挂在弹簧下的挂钩跟着弹簧回弹几下停住，docs/30 F4）、`place`（三维向量输出 `{ x, y, z }` → `centre + radius × 单位向量`；`{ centre: [x,y,z], radius, face?: "centre" }`，沿球面 0.5 s 缓动、深链接直接终值；`face: "centre"` 使局部 +Y 朝向 centre）、`stretch`（弹簧伸缩）、`play`（播放时间线通道）——这两项见下面「弹簧伸缩」「时间线与回放」、`at`（命名位置环）、`state`（铁屑排哪个场态）——后三者见磁铁一节；零件 `fill`（按模型体积画液面，见「液面」）、`bend`（把一根条像尺子一样弯下，见「弯曲」）；零件 `shift`（按向量输出把零件挪到模型算出的位置，拱形、错开，见「移位」）；流 `visible`（可加 `paths: [id]` 只控制这些路径，独立于整条流与强度）、`state`（场线流）、`intensity`（向量输出按 `paths` 的 id：每条路径的粒子速度 ∝ |值| ÷ `full`（夹在 ±2），负值反向，< 1 % 的路径 0.3 s 淡出；相位逐帧积分，变速不跳；`mode: "density"` = 速度不变、**可见粒子的比例** = |值| ÷ `full`（≤ 1，0.3 s 缓动；粒子按路径上均匀散开的次序出现，不扎堆），能量主题用它表示"这一份多 / 少"；向量的键写成 `<流 id>:<路径 id>` 时，每条流只取以自己 id 开头的那些；**数输出**：整条流的每条路径同一倍数，见「动画频率与整条流的强度」）、`stops`（状态 → 粒子色，如短路 `token:hot`）；动画 `rpm`（rotate 的转速 = 值 × per，角度积分）、`hz`（数输出 → 频率，相位逐帧积分，见「动画频率与整条流的强度」）、`enabled`（条件不成立时 0.15 s 缓停）；`animation` 与 `flow` 都可写数组（一条绑定管几条）。运转（RUN / FLOW）只管"动起来"：灯亮不亮、零件在哪儿不受它影响。
- **多路径流**（`flows[].paths: [{ id, path }]`，≤ 16 条，代替 `path`）：一条流、一次绘制；粒子按路径长度分配（每条 ≥ 4），每条路径一行浮点纹理，shader 里每条路径一个相位 / 透明度 / 闭合标志（`flowMaterial.ts`）。电路主题每条边一条路径（与导线 sweep 同源，生成脚本写出两者）。不能 `bilateral`。
- **读数**：`telemetry` 行写 `follow: "<数输出>"`（不写 `idle` / `run`）：跟随输出值、0.3 s 一阶滞后（`lag` 可改）、小数位取输出的；`follow` 写 2–3 个同单位的数输出 = 一行两值（`FALL TIME · L · R 0.45 · 0.45 s`）；`scope: "observe"` = 只显示本章卡片观察的那几个，本章一个都不观察时显示 `—`（一行"重量"在落体章读 `weight`、弹簧章读 `load-weight`，docs/30 F6）；本章 `try.observe` 里的输出在 PLATE 块加粗；块尾一行 `SIM <状态> · <本章试一试控件的值>`：状态 = 本章卡片观察的状态输出，否则先猜后看观察的，否则第一个会随卡片控件或本章 `set` 的控件变的；都没有时电路、磁铁照旧写模型的第一个状态，力的模型（几套互不相干的实验，`SEPARATE_EXPERIMENTS`）不写状态；短路 / 超额定用 hot 色。
- **章节**：

```yaml
state:
  sim:
    set: { arrangement: series, cells: 2 }     # 本章从这些值开始（不累积）
    try:                                       # 本章的试一试卡片（每章至多一个，不做测验）
      vary: arrangement                        # 改变的量（signal 芯片；[ ] 键）
      also: [bulb-a-in]                        # 卡片上再给的控件（≤ 4）
      keep: [cells, { en: "Same bulbs", zh: "同样的灯泡" }]   # 不变的量：控件（显示当前值）或一句话
      observe: [i-cells, bright-a, bright-b]   # 观察的输出（≤ 5；大号读数，PLATE 块加粗）
      record: true                             # 「记一行」+ 数据表；或 { judge: { output, gt, label } } 加一列是 / 否；{ chart: true | { y } } 表下画小图（见「数据表下的小图」）
      replay: true                             # 「再跑一次」按钮与键 G（见「时间线与回放」）；或时间线输出 id 的列表
      predict:                                 # 先猜后看（可选，不判对错）
        prompt: { en, zh }
        start: { main: true }                  # 先设成这样再读"之前"（可选）
        change: { gap: empty }
        observe: bright-a
        options: [ { id, label, means: same | zero | less | more | positive | negative } ]   # observe 是状态输出时 means 写它的状态 id，揭晓写状态的标签
  beats:
    - sim: { set: { bulb-a-in: false } }       # 这一拍的值（叠在本章 set 上）
      caption: { en, zh }
```

  validate 核对 `set` / `start` / `change` 的控件与值、`vary` / `also` / `keep` 是控件、`observe` 是输出。
- **试一试卡片**（`readerTop`，节拍行之后、详情之前；docs/08 §2 铁律 d）：标题 TRY IT / 试一试 + 键位提示；三行芯片（改变 signal 实心、不变 cold 描边、观察墨色描边）；控件：开关钮（`role="switch"`）、‹ 值 ›（`role="group"`，两端禁用）、选项钮（`role="radiogroup"` / `radio`），全部 ≥ 44 px，`data-sim-control` / `data-sim-value`；观察量大号读数 + SIM 芯片"在这个模型里"；先猜后看：选项 → 应用 `start`、读"之前"、应用 `change` → "你猜：… · 观察到：…"（观察 = `lib/sim/trial.ts outcomeOf`：变为零 / 变号 / ±5 % 内差不多一样 / 变大 / 变小，用 `means` 相同的选项的话说），「回到改变前」恢复改变前的值；换章、拍、深链接时清掉。数据表：「记一行」按改变量的值一行（同值覆盖，≤ 12 行，只在内存：刷新即清），列 = 改变量 + 观察量（+ 是 / 否）。手机在底部抽屉里同样可用。
- **键**：`[` `]` = 本章 `vary` 的上一值 / 下一值（开关 = 关 / 开，选择 = 上 / 下一个选项），`T` = 本章卡片里第一个开关（`vary` 或 `also`），`G` = 再跑一次（卡片有 `replay` 时）；注册为命令 `sim-prev` / `sim-next` / `sim-toggle` / `sim-replay`（`SIM_KEYS`），和按钮、电路图、测试 API 写同一个 store 值（`G` 与「再跑一次」按钮写引擎 UI store 的同一个计数 `simReplay`）；状态行键位提示写 `[ ] T TRY IT`（有 `G` 时 `[ ] T G TRY IT`）。没有卡片的章不注册。
- **电路图卡**（有 `circuit.diagram` 时代替右上零件链路卡，标题 CIRCUIT DIAGRAM / 电路图；< 1024 px 收进试一试卡片里可折叠的一节）：节点的 `d` 是图上坐标，边的 `via` 是直角拐点，符号放在最长的一段直线上（`at`，默认中点）：电池 = 每节一对长（+）短（−）线、翻转的那节反过来，灯 = 圆内叉（按亮度填 `--lamp`，拔掉时虚线），开关 = 两个接线点 + 刀片（断开时抬起），缺口 = 两个接线点 + 材料（导体实线、铅笔芯虚线、绝缘体空着），蜂鸣器、电机（M）；有电流的边用 `--current` 加粗并带方向箭头（从正极出发），短路时整张图 `--hot`；开关符号 = 拨真开关（`role="button"`、`aria-pressed`、44 px 命中区，Enter / Space），其他符号 = 选中边的 `part`，选中的零件对应符号描 signal；`diagram.labels` 是图上的小字（"手电筒"）。没有 `d` 的节点不画。
- **测试与 QA**：`__atlas.engine.sim()` → `{ values, set, outputs, try, table, timeline, replays }`（`timeline`：每条时间线输出在舞台上的 `{ t, duration, playing, slow }`，模型秒；`replays`：再跑一次的计数），`__atlas.engine.setSim({ id: value })`（逐个走 `setSimControl`，有非法值返回 false），`__atlas.engine.simSeek(id, t)`（把时间线停在模型时刻 `t`，截过程中的一帧），`__atlas.engine.anchor(id)`（零件标注锚点此刻在舞台上的 `{ x, y, shown, onScreen }`，CSS px，跟着姿态、试一试 offset 和时间线走）；`__atlas.state().sim` = 设过的值。`pnpm shoot <slug> --keys` 测 `[` `]` `T` `G`（在第一个有卡片的章：`]` 前进一值、`[` 回来、URL 带 `sim`；`T` 翻转一个开关再翻回；`G`：计数加一、有时间线从头开始播放）；`--beats` 每拍照常截图（拍的 `sim.set` 随 `beatScene` 应用；时间线直接是终态），之后逐拍全页加载 `?ch=<章>&b=<n>`：场景字段（试一试值、视图、图层、镜头、hide …）与演示里的不同、或有时间线不在终态，记为拍失败。
- **token**：`--lamp`（灯丝发光，暖白）、`--current`（电流粒子，暗金；短路用 `--hot`）、`--f-gravity` / `--f-friction` / `--f-elastic` / `--f-push`（力的箭头，见「力的箭头」）、`--en-light` / `--en-electrical` / `--en-kinetic` / `--en-sound` / `--en-heat` / `--en-potential`（能量形式，见「能量」）、`--blood-rich` / `--blood-poor`（含氧多 / 少的血：都是红，明度差 L* ≥ 20，灰度可分）、`--oxygen`、`--carbon-dioxide`、`--air`（docs/40 E-HL4；`tests/theme/blood-gas-tokens.test.ts` 核两套主题的色差与对比度）、`--seedling` / `--seedling-pale`（有光 / 暗处长出的幼苗：叶绿 / 淡黄，明度差 L* ≥ 20；docs/41 E-S1，`tests/theme/seedling-token.test.ts`）。
- **已知限制**：读者不能自己拖元件、连线、拖磁铁和指南针、推小车（docs/23 §4.5、docs/22 §4.5、docs/30 §4.6，v2：场线 / 时间线要在运行时重算）。

### SpaceScene · 试一试 · 磁铁（magnet）

docs/22 §4.2–4.4（E-MAG）。`sim.kind: "magnet"`：磁铁是 Gilbert 磁荷对，场线和铁屑按"场态"在载入时算一次并缓存（不进 parts.json、不手写），指南针读场的方向并阻尼摆动，两根磁铁之间画力箭头。代码：`lib/sim/magnet.ts`（磁荷、力、场、方位、场态选择）、`lib/sim/field.ts`（2-D 场线求解、铁屑排布、缓存）、`lib/sim/settle.ts`（阻尼摆动）、`lib/sim/carrier.ts` + `frame.ts`（磁铁跟着零件走）、`stages/model3d/SimOverlays.tsx`（力箭头）、`Flows.tsx`（场线流）、`PartNode.tsx`（铁屑、摆动、`pivot`、`tint`）；单测 `tests/space-scene/magnet-field.test.ts`、`magnet-carrier.test.ts`（样板台 `tests/space-scene/fixtures/magnet-bench.ts` 是 docs/22 §3 的尺度：可当作者模板），示例 `sample-space` 第 06 章。

```jsonc
"sim": {
  "kind": "magnet",
  "controls": [
    { "id": "setup", "kind": "choice", "default": "pair", "label": {en, zh},          // 可选的"台上摆什么"：不进试一试卡片，章 / 拍 sim.set 用它选场态
      "options": [ { "id": "pair", … }, { "id": "alone", … }, { "id": "horseshoe", … }, { "id": "electromagnet", … } ] },
    { "id": "gap", "kind": "step", "values": [6, 3, 1.5], "default": 6, "unit": "cm", "label": {en, zh} },
    { "id": "facing", "kind": "choice", "options": [ns, nn, ss], "default": "ns", … },
    { "id": "compass-at", "kind": "step", "values": [1, 2, 3, 4, 5, 6, 7, 8], "default": 1, … },
    { "id": "cards" | "strokes" | "em-cells", "kind": "step", … }, { "id": "em-switch", "kind": "toggle", … }
  ],
  "outputs": [
    { "id": "force", "unit": "%", "decimals": 0, … },             // 吸 +、斥 −，reference 处的吸力 = 100 %（模型算出 6 / 3 / 1.5 cm：12 / 41 / 100 %）
    { "id": "needle-bearing", "unit": "°", "decimals": 0, … },    // 0–360，从模型北（−Z）顺时针（俯视）
    { "id": "clips-cards" }, { "id": "clips-stroke" }, { "id": "clips-em" },   // 10 5 3 2 1 1 0；0 2 4 6；3 × 节数 / 断电 1
    { "id": "clips", … },                                         // PLATE 别名：本章卡片观察的那个回形针数，别处显示 —
    { "id": "field-state", "kind": "state", "states": { "ns-6": {en, zh}, …, "single": {en, zh} } }   // 每个场态都要有标签（状态 id 可带点：ns-1.5）
  ],
  "bind": [
    { "control": "gap", "part": "bar-magnet-b", "offset": { "axis": [1,0,0], "per": 0.01, "origin": 6 } },
    { "control": "facing", "part": "bar-magnet-b", "pose": { "ns": null, "nn": "b-flipped", "ss": "b-flipped" } },   // 姿态绕 B 的中心转（姿态写 pivot）
    { "control": "compass-at", "part": ["compass-case", "compass-card", "compass-needle", "compass-glass"], "at": "compass-ring" },
    { "output": "needle-bearing", "part": "compass-needle", "rotate": { "axis": [0,-1,0], "settle": { "period": 1.2, "damping": 0.3 } } },
    { "output": "field-state", "part": "iron-filings", "state": true },
    { "output": "field-state", "flow": "field-lines", "state": true },
    { "output": "clips-cards", "part": "clip-chain", "count": true },
    { "control": "em-switch", "part": "em-nail", "tint": { "color": "token:signal", "full": 1 } },
    { "control": "hang", "part": ["bar-magnet-n", "bar-magnet-s"], "pose": { "true": "suspended" } },
    { "control": "hang", "part": ["bar-magnet-n", "bar-magnet-s"], "rotate": { "axis": [0,1,0], "per": 90, "pivot": [0.04, 0.005, -0.18], "settle": { "period": 1.6, "damping": 0.25 } } }
  ],
  "overlays": [ { "kind": "force-arrows", "between": ["bar-magnet-n", "bar-magnet-b"], "output": "force", "length"?: 0.04, "lift"?: 0.02, "when"?: { "control": "arrows" } } ],
  "magnet": {
    "magnets": [
      { "id": "a", "north": [-0.118, 0.005, 0], "south": [-0.202, 0.005, 0], "moment"?: 1, "part"?: "bar-magnet-n" },   // part：磁铁跟着这个零件走
      { "id": "b", "north": [0.042, 0.005, 0], "south": [-0.042, 0.005, 0],
        "move": { "control": "gap", "axis": [1,0,0], "per": 0.01, "origin": 6 }, "flip": { "control": "facing", "when": ["nn", "ss"] } },
      { "id": "em", "north": [0.29, 0.03, -0.05], "south": [0.29, 0.11, -0.05], "moment": 0.15,
        "power": { "switch": "em-switch", "cells": "em-cells", "residual"?: 0.15 } }
    ],
    "reference": 1.5,
    "clips": { "cards": "cards", "strokes": "strokes", "switch": "em-switch", "cells": "em-cells" },
    "earth": { "uT": 40, "north": [0, 0, -1] },
    "rings": { "compass-ring": { "center": [-0.16, 0.017, 0], "radius": 0.085, "count": 8, "start"?: 180 } },
    "compass"?: { "at": [x, y, z] } | { "ring": "compass-ring", "control": "compass-at" },
    "plane": { "center": [-0.11, 0.012, 0], "size": [0.36, 0.21], "normal"?: [0, 1, 0] },
    "lines"?: 8,
    "fields": {
      "ns-6":   { "magnets": ["a", "b"], "when": { "setup": "pair", "facing": "ns", "gap": 6 } },
      …,
      "em-on-2": { "magnets": ["em"], "when": { "setup": "electromagnet", "em-switch": true, "em-cells": 2 }, "lines": 40,
                   "plane": { "center": [0.29, 0.07, -0.05], "size": [0.16, 0.16], "normal": [0, 0, 1] } },
      "single": { "magnets": ["a"] }                               // 没有 when：兜底，放最后
    }
  }
}
```

零件与流：

```jsonc
{ "id": "iron-filings", …, "primitive": { "kind": "filings", "size": [0.297, 0.21], "count"?: 2400, "needle"?: [0.002, 0.0003],
    "saturate"?: 0.002, "exponent"?: 0.5, "at": [-0.16, 0.0108, 0], "color": "powder", "tint": "token:ink-2" },
  "extra": [ { "kind": "bevelBox", "size": [0.297, 0.0004, 0.21], "bevel": 0.00005, "at": [-0.16, 0.0106, 0], "color": "enamel" } ] }   // 纸放 extra
{ "id": "field-lines", "group": "field", "speed": 0.02, "color": "token:accent-3", "count": 640, "size": 0.5, "spread": 0, "clip": false, "whenRun": false }   // 没有 path / paths
```

- **磁铁与场**（`magnet.ts`）：每根磁铁两极各一个点磁荷，磁极强度 q = `moment`（A·m²，默认 1：学校条形磁铁）÷ 两极距离；B = μ0/4π · Σ q r̂ / r²（特斯拉）。`move` / `flip` 同最小版；`power`：电磁铁通电时 moment × 节数（`cells` 步进控件，没写 = 1），断电 × `residual`（默认 0.15：钢芯留磁）。`force` 只看前两根（相对值），`reference` = 第一根磁铁 `move` 控件取这个值、未调头时 = 100 %。
- **磁铁跟着零件走**（`part`，`lib/sim/carrier.ts` + `frame.ts`）：磁铁写了 `part`（一个有 `primitive` 的零件），两极就跟着这个零件当前的目标位置走：章 / 拍的 `pose`（零件有 `pose` 绑定时用绑定给的姿态，同舞台），再 `rotate` 绑定（绕 `pivot` 或姿态后的中心），再 `offset` / `at` 绑定——与 PartNode 同一个变换顺序（不含拆开、移开、动画）。磁铁自己 `move` / `flip` 的控件驱动的绑定不算（模型自己挪、自己调头，免得算两遍），只算控件驱动的绑定。力、指南针、场线、铁屑都按这个位置算（`reference` 仍是静止台面上的值）；HUD 读数、试一试卡片、舞台用同一个入口 `evaluateSimOnStage`。算的是终点位置、不是缓动中间态：控件值或姿态变了才算一次，阻尼摆动期间不重算。不写 `part` 的磁铁停在数据写的位置。磁铁被搬走（悬挂、放进测试盘）时不必再用 `setup` 把它移出场态。
- **场态**（`fields`，docs/22 §4.2 第 4 条）：`field-state` = 第一个 `when`（控件值，全部相等才成立）成立的场态；没有 `when` 的永远成立，只能放最后。一个场态的场线 / 铁屑按"控件默认值 ⊕ 它的 `when`"、它的 `magnets`（默认全部）算一次并按载入的数据和磁铁位置缓存（`lib/sim/field.ts`，每套几毫秒，最多留 96 套），所以 `when` 要钉住影响位置的控件（`gap`、`facing`）；带 `part` 的磁铁再按零件当前位置挪（见上）。场态的磁铁都挪了同样的位移（一根磁铁挂起来转了 90°）时，场线平面跟着挪、跟着转；各挪各的时平面不动。台上摆什么（只有 A、两根、马蹄形、电磁铁）用一个不进卡片的选择控件（上例 `setup`）由章 / 拍 `sim.set` 设定。指南针读数用当前场态的磁铁、当前控件值。
- **场线**（流的 `state` 绑定，docs/22 §4.4 M1 / M2）：在场态的 `plane`（默认 `magnet.plane`）这个矩形里做 2-D 求解：磁极投影到平面上，按 1/r² 在面内积分（RK4，步长 = 短边 ÷ 400）。每根磁铁北极出发 `lines` × moment 条（`lines` = 每 A·m² 的条数，默认 8，场态可另给；每根磁铁至少 1 条，一个场态最多 16 条，超了按比例减），种子在北极周围小圆上、关于磁铁轴对称；到南极、出矩形边或零点停；每条 ≤ 120 点，画在平面上（平面中心的高度：放在纸面之上）。流：没有 `path` / `paths`，粒子沿当前场态的线走，线下面另画一层流色细线（不透明度 0.45，多一次绘制），换场态时淡入；`whenRun: false` 让它不开 RUN 也显示；图层开关照常。竖直的电磁铁用竖直平面（`normal: [0, 0, 1]`）。
- **铁屑**（`filings` primitive + 零件的 `state` 绑定，M3）：卡片 `size` [宽, 深] 在零件的 XZ 平面（可 `rotation`，不能 `scale` / `mirror` / `repeat`，只能是主 `primitive`，纸放 `extra`）。一个 InstancedMesh，`count` 根针（默认 2400）；候选针在抖动网格上（2 × count，固定种子：换场态时同一根针原地转），按 (|B| ÷ `saturate`)^`exponent`（默认 2 mT、0.5）的概率保留——两极处全留、离开越远越稀——再均匀抽到 ≤ count；针沿 B 在卡片面内的方向，B 竖着的地方（极面上方）画短；场态 = 3-D 场在卡片高度处的值（磁铁在纸下）。没有场态时随机撒着。
- **指南针**：`needle-bearing` 在 `magnet.compass`（固定点，或位置环 + 步进控件）读；没写时用第一条 `at` 绑定的环和控件。场 = 当前场态的磁铁（在零件当前的位置）+ 地磁（`earth.uT` 水平指 `earth.north`）；方位 = 场的水平分量从模型北顺时针（俯视）的度数 0–360。针零件按 `rotate` + `settle` 绑定转：**轴写 `[0, -1, 0]`**（顺时针；写 `[0, 1, 0]` 要 `per: -1`，validate 报错提示），针在静止时北半指 −Z。`settle`：二阶阻尼振子（ω = 2π ÷ period，damping = 阻尼比），走近路（350° → 10° 转 +20°），约 3–4 s 停稳，停稳后不再要帧；深链接、截图、瞬切直接到终值。
- **位置环**（`rings` + 绑定 `at`）：`count` 个位置在水平圆上，位置 1 在方位 `start`（默认 180 = 朝读者），其余顺时针（俯视）。`at` 绑定的控件是 1 … count 的步进控件；零件按"当前位置 − 控件默认值的位置"平移——零件画在默认位置上。
- **力箭头**（`overlays: force-arrows`，M5）：`between` 两个零件各一支，抬到中心上方 `lift`（默认 0.02），沿两者连线；吸（值 > 0）朝对方、`pull` 色（默认 `token:signal`），斥朝外、`push` 色（默认 `token:cold`）；长度 = `length`（默认 0.04）× √(|值| ÷ 100)（≤ 1.6 倍；读数是真实相对值），缓动；两支一个网格一次绘制，平涂不受光。任一零件不在场（隐藏、章 `hide`、绑定隐藏）、拆开、|值| < 0.5、`when` 不成立时淡出。`when: { control | output, is?: 条件 }`（默认真值）：比如一个 `arrows` 开关控件，章 `sim.set` 打开。
- **悬挂磁铁**（docs/22 §4.7 `suspended`）：一个开关控件（`hang`），两条绑定：`pose` 把两半磁铁移到吊线下（姿态只做平移 + 起始朝向），`rotate`（`per: 90` 之类、`pivot` = 吊点的场景坐标、`settle`）让它摆几下停在南北向。姿态之后才转，所以 `pivot` 写姿态后的位置。
- **电磁铁**：`power` 让场态 / 指南针 / 场线随开关和节数变；`tint` 绑定把钉子染色（通电 = 磁铁；只染钉子的主材质，同一零件里别的材质的 extra 不染）；回形针 `count: true` 绑 `clips-em`；电流流 `visible` 绑开关（同电路）。
- **读数**：`telemetry` `follow: "force"`（Pull %）、`"needle-bearing"`（Needle °）、`"clips"`（Clips held：本章卡片观察的回形针数，加粗；别章显示 `—`，`clips` 不能绑定）。块尾 `SIM <场态标签> · <本章控件值>`。
- **validate**（`sim-schema.ts magnetIssues` 等）：磁铁 id、两极不重合、`move` / `flip` / `power` 的控件种类、`part` 存在且有 `primitive`；`compass` 环与控件；`needle-bearing` 有读数位置；场态的磁铁、`when` 值、无 `when` 的放最后、每个场态有标签、有平面、平面里真能起线；`at` 的环存在、控件是 1 … count；`state` 绑定的输出是场态、零件有 `filings`、流没有自己的 `path`；每个铁屑零件和每条无路径的流都有 `state` 绑定；指南针方位的转轴方向；`clips` 不绑定；力箭头的零件、数输出、`when`。铁屑 / 场线写了 `states`（手写的生成数据）直接报错：引擎会算。

### SpaceScene · 试一试 · 力（force）

docs/30 §4（E-FORCE，F0–F8）。`sim.kind: "force"`：一张实验台上的六套小实验，每套一个确定性的小模型（纯函数、同步、< 0.1 ms，落体积分在内）。数据里写了哪套就算哪套，没写的子模型不提供它的量（输出引用了会报"needs the force model's `fall` data"）。模型内部全精度，读数按输出的 `decimals` 四舍五入后才进卡片、PLATE、表、图。代码：`lib/sim/force.ts`（模型）、`lib/sim/timeline.ts`（时间线）、`lib/sim/arrows.ts`（箭头）、`lib/sim/chart.ts`（小图）、`lib/stretch.ts`（弹簧伸缩）、`stages/model3d/TimelineClock.tsx`、`SimOverlays.tsx`（`force-vectors`）、`PartNode.tsx`（`play` / `stretch` / 回弹的 `offset`）、`explorer/TryChart.tsx`；单测 `tests/space-scene/{force,timeline,chart,stretch}.test.ts`，样板台 `tests/space-scene/fixtures/forces-bench.ts`（docs/30 §4.3 的全部数字，可当作者模板）；示例主题 `sample-forces`（draft，七章：背景章 + 六个子模型各一张卡）。

```jsonc
"sim": {
  "kind": "force",
  "controls": [ … ],                         // 同核心；选项 id 不能是 off / on（URL），刹车的"不捏"写 none
  "outputs": [                               // ≤ 32；from 默认 = id，量名见下表
    { "id": "t-left", "label": {…}, "unit": "s", "decimals": 2 },
    { "id": "landing", "kind": "state", "states": { "together": {…}, "left-first": {…}, "right-first": {…} } },   // 每个状态都要有标签（validate）
    { "id": "drop-run", "kind": "timeline", "label": {…} }
  ],
  "force": {
    "g": 9.8,                                // N/kg
    "push":   { "choice": "push", "start": "car-start", "speed": 0.6, "at": 0.25, "runway": 1.25, "surface": "glass",   // 或 "rolling": 0.06
                "dv": { "behind": [0.3, 0, 0], "front": [-0.3, 0, 0], "front-firm": [-0.6, 0, 0], "side": [0, 0, 0.3] },
                "approach"?: 0.25, "wheel"?: 0.011, "arrow"?: 3 },
    "magnet": { "toggle": "magnet-push", "dv": [0.4, 0, 0] },
    "fall":   { "height": "drop-height", "pair": "pair", "slow": 4, "air"?: 1.21, "sample"?: 0.01,
                "objects": { "small-ball": { "part": "ball-small", "m": 0.0282, "cd": 0.45, "area": 2.835e-4 }, …,
                             "flat": { "part": "paper-sheet", "m": 0.005, "cd": 1.12, "area": 6.237e-2, "sway"?: 8 } },
                "pairs": { "balls": ["small-ball", "large-ball"], … },        // 每个 pair 选项：左、右两个物体
                "weigh"?: { "control": "weigh", "map": { "small-ball": "small-ball", "paper": "flat" } } },
    "slide":  { "block": 0.2, "load": "block-load", "lane": "lane", "rise": 1.2, "speed": 0.15, "travel": 0.25,
                "surfaces": { "glass": [0.25, 0.20], "wood": [0.50, 0.30], "sandpaper": [0.90, 0.70] } },   // [μ 开始滑动, μ 保持滑动]
    "roll":   { "height": "ramp-height", "surface": "runway", "loss": 0.2, "wheel": 0.011, "runway": 1.25, "ramp": { "angle": 14 },
                "rolling": { "glass": 0.06, "wood": 0.09, "carpet": 0.25 } },
    "spring": { "load": "spring-load", "unload": "unload", "per50": 1.0, "length": 8.0, "limit": 300, "beyond": [1.0, 0.3], "set": { "350": 0.4, "400": 1.2 } },
    "brake":  { "squeeze": "squeeze", "rps": 2, "inertia": 0.032, "radius": 0.18, "mu": 0.6, "hub": 0.005, "force": { "none": 0, "light": 1, "firm": 3 } }
  }
}
```

| 子模型 | 读的控件 | 量（`from`） | 时间线通道 |
|---|---|---|---|
| `push` | `choice`（推的方向，选项 = `dv` 的键）、`start`（`rest` / `moving` 的选择，或开关：开 = 在动；默认在动） | `effect`（状态 `none` / `starts` / `speeds-up` / `slows-down` / `stops` / `turns`：从静止到 ≥ 0.01 m/s = starts，反之 stops，转向 > 10° = turns，±5 % 外 = 加快 / 减慢）、`speed-before`、`speed-after`（m/s）、`push-run` | `x`、`z`（m，沿 / 横过跑道，以推点为 0）、`heading`（°，从 +X 转向 +Z：绑 `turn: [0, -1, 0]`）、`spin`（车轮转过的 °）、`push`（推的 0.15 s 里 = \|Δv\| × `arrow`，箭头用） |
| `magnet` | `toggle` | `magnet-run`（开着时车被磁铁推 `dv`、`push-run` 静止；关着时反过来） | 同 push |
| `fall` | `height`（m 的步进）、`pair`、`weigh` | `t-left`、`t-right`（s）、`landing`（\|Δt\| < 0.03 s = together）、`drop-run`、`weight`（N = m g，所称的物体）、`weigh-note`（`none` / `reads` / `too-light`：< 0.05 N 学校弹簧秤读不出） | 每个物体一个通道 = 已下落的 m（只有本对的两个），有 `sway` 的物体另有 `<id>-sway`（°，示意的摆动） |
| `slide` | `load`（g 的步进）、`lane` | `f-start` = μs m g、`f-move` = μk m g（N），m = `block` + 载荷 | `x`（木块滑过的 m）、`pull`（N：0–`rise` s 线性升到 f-start，0.1 s 降到 f-move）、`friction`（N：拉住时 = 拉力，滑动时 = f-move） |
| `roll` | `height`（cm 的步进）、`surface` | `distance`（cm）= (1 − loss) h ÷ c，`run-time`（s）= v₀ ÷ c g，`run-end`（`stops` / `off-end`：到了 `runway` 端挡板，distance 写到挡板为止） | `dx`、`dy`（m，以坡底为 0：起点在斜面上）、`pitch`（°，斜面上车头朝下：绑 `turn: [0, 0, -1]`）、`spin` |
| `spring` | `load`（g 的步进）、`unload`（开关） | `extension`（cm：`limit` 内每 50 g `per50`，过了限度再加 n · a + n² · b，n = 超过的 50 g 份数；取下后 = `set`）、`spring-length`、`load-weight`（N，取下时 0）、`returns`（`loaded` / `returns` / `stays-longer`） | — |
| `brake` | `squeeze` | `stop-time`（s）= I ω ÷ (hub + 2 μ N r)、`turns`（圈） | `spin`（°，匀减速到停）、`brake`（N，两块刹车块的摩擦力） |

- **validate**（`sim-schema.ts forceIssues`）：每个子模型读的控件存在且种类对（步进 / 选择 / 开关）、选择的每个选项都在表里（`dv`、`pairs`、`surfaces`、`rolling`、`force`）且表里没有多余的键；μ 开始滑动 ≥ μ 保持滑动；落体高度 > 0、`pairs` 的物体存在、物体的 `part` 有 primitive；默认值下小车停在跑道上；弹性限度是 `load` 的一个值、限度以上的每个载荷都有 `set` 且 `set` 小于挂着时的伸长；`magnet` 需要 `push`；状态输出给每个状态写标签。
- **与真实的差别**（S1 与细看必须写，docs/30 §4.2 第 7 条）：滚动系数、刹车数字为"装得进实验台、看得清"取的示意值，排序对、数字不是实测；每次给同一个数（确定性）。

### SpaceScene · 时间线与回放（timeline / play，docs/30 F2，docs/31 共用）

模型除了数、状态、向量，还能给一段"跑一遍"的过程：**时间线输出**（`kind: "timeline"`，`lib/sim/timeline.ts`）。值的形状（能量主题的落球、秋千、发条车用同一形状）：

```ts
interface Timeline {
  kind: 'timeline';
  key: string;        // 这一跑由什么决定（模型的输入）；key 变了才从头再跑
  duration: number;   // 模型秒；终态 = t = duration 时的状态
  slow: number;       // 画面放慢的倍数（1 = 实时）
  channels: Record<string,
    | { segments: { t0, t1, x0, v0, a }[] }   // 分段匀加速：x = x0 + v0 (t − t0) + ½ a (t − t0)²；段前取首段起点，段后与段间保持
    | { samples: [t, x][] }>;                  // 采样（≤ 256，时间升序，线性插值，两端保持）
}
```

- **播放规则**（`TimelineClock`，纯规则在 `timeline.ts` 的 `startPlayback / updatePlayback / replayPlayback / stepPlayback`，有单测）：页面第一次看到一条时间线 = 终态；值变了而 key 变了 = 先显示起点、**0.4 s 后从 0 播放**，以 1 ÷ `slow` 的速度，到 `duration` 停住；key 没变（改的是别的实验的量）= 原地不动。深链接、截图、拍的瞬切（instant 过渡）、EXPLODED、REFERENCE、`prefers-reduced-motion` = 直接终态。播放中只由时钟要帧，零件、箭头在同一帧读时刻（时钟挂在零件之前）；播完停帧。
- **再跑一次**：卡片 `try.replay: true` = 这张卡的控件（`vary`、`also`）会改变的时间线（看 key 变不变，`lib/sim/replay.ts cardTimelines`），或写时间线 id 的列表；卡片上一个 44 px 的「再跑一次 / Run again」按钮，键 `G`（命令 `sim-replay`），两者写同一个计数；这几条时间线里有 `slow` > 1 的，按钮旁一枚芯片「放慢 4 倍 / Slowed down 4 times」。
- **`play` 绑定**（零件，输出必须是时间线）：`{ "output": "car-run", "part": ["toy-car", "car-wheels"], "play": { "channel": "dx", "axis": [1, 0, 0], "per"?: 1 } }` = 沿 `axis` 移 通道值 × per（场景单位）；`{ "play": { "channel": "pitch", "turn": [0, 0, -1], "pivot"?: [x, y, z] } }` = 绕轴转 通道值 × per 度（绕 `pivot`，没写 = 零件此刻的中心）；`"each": true` = `repeat` / `extra` 的每一份绕自己的中心转（车轮；零件自动按 `each` 的方式实例化）；`"when": { "control" | "output", "is"? }` = 只在条件成立时播放（一辆车第一章被推、第四章从斜面滚下：各跑各的）。叠加顺序：姿态 → 试一试 offset / rotate → `play`（几条 `play` 相加，转在移之前）→ 动画。`pivot` 写**姿态之后**的位置（车先由姿态挪到推点，车轮跟车头一起转时 pivot 写挪过去的车中心）。validate：通道是这个模型的这条时间线有的、`axis` 与 `turn` 二选一、`each` 要 `turn` 且零件有多份、时间线不能绑 `visible` / `glow` 等、不能绑流和动画。
- **QA**：`sim().timeline`、`simSeek(id, t)`；`pnpm shoot --beats` 截终态，`--keys` 测 `G`。

### SpaceScene · 力的箭头（`overlays: force-vectors`，docs/30 F3）

```jsonc
"overlays": [ { "kind": "force-vectors", "group": "forces", "per": 0.03, "max": 0.25, "arrows": [
  { "part": "wooden-block", "force": "push", "dir": [1, 0, 0], "value": { "output": "pull-run", "channel": "pull" } },
  { "part": "mass-hanger", "force": "gravity", "dir": [0, -1, 0], "value": { "output": "load-weight" }, "at": "bottom" },
  { "part": "ball-large", "force": "gravity", "dir": [0, -1, 0], "value": 2.2, "when": { "control": "pair", "is": { "eq": "balls" } } },
  { "part": "toy-car", "force": "push", "dir": [-1, 0, 0], "value": { "output": "push-run", "channel": "push" }, "offset": [0.06, 0, 0],
    "when": { "control": "push", "is": { "in": ["front", "front-firm"] } } }
] } ]
```

- `force` ∈ `gravity` / `friction` / `elastic` / `push` / `magnetic` → token `--f-gravity` / `--f-friction` / `--f-elastic` / `--f-push` / `--pole-n`（docs/08 §1）；KEY 名称"Gravitational force / 重力""Frictional force / 摩擦力""Elastic spring force / 弹簧的弹力""Push or pull / 推力或拉力""Magnetic force / 磁力"（`lib/sim/arrows.ts`）。
- `value`：一个数、一个数输出（缓动）、或时间线输出的 `channel`（跟着播放走）；负值反向。长度 = `per`（默认 0.03 m / N）× 牛顿，≤ `max`（默认 0.25）；粗细与箭头按 `per` 缩放；< 0.05 N 淡出。起点 = 零件包围盒的中心 / 顶 / 底（`at`）+ `offset`，跟着零件的姿态、offset、`play` 走（读标注锚点）。方向随选项变时写几支带 `when` 的箭头（推的方向）。
- 一个叠加的全部箭头 = 一个网格（顶点色带透明度），**一次绘制**；零件不在场、`when` 不成立、`group` 的图层关着、EXPLODED 时淡出。`group`：一个没有零件的组（LAYERS 一行"Forces / 力"，章 / 拍的 `layers` 照常控制它）。
- **KEY**：控制面板的图例自动加上此刻画着的力（箭头的零件在场、`when` 成立、图层开着、时间线在整段里有一处 ≥ 0.05 N 或数 ≥ 0.05 N；`forcesOnShow`）。
- validate：零件存在、方向非零、数输出 / 时间线通道存在、`when` 的控件或输出存在、`group` 存在；**被 `play` 转动的零件（车轮）不能画摩擦力箭头**（课纲 Note：滚动物体的摩擦方向不要求，docs/30 D3）。

### SpaceScene · 弹簧伸缩（`stretch`）与回弹（docs/30 F4）

- `{ "output": "extension", "part": "test-spring", "stretch": { "per": 0.01, "settle"?: { "period": 0.7, "damping": 0.15 }, "anchor"?: "top" } }`：零件里唯一的 `coil`（主 primitive 或 `extra`）沿自己的轴伸长 值 × per 场景单位：**每一圈刚性平移、圈距变大、钢丝截面不变**（`coil` 几何带每个顶点的螺旋参数 t，`lib/stretch.ts`）；`anchor` 端不动（`top` = 线圈自己的 +Y 端，`bottom`、`centre`）；同一零件的其他块（上下钩环）按它们的中心在线圈上的位置跟着近的一端走。值 = 数输出或步进控件；写 `channel` = 时间线通道（水平弹簧秤里的弹簧跟拉力走），这时不能 `settle`。
- 回弹：`stretch.settle` 与 `offset.settle` 是同一个二阶阻尼振子（`lib/sim/settle.ts`，长度用 2e-5 m 的停稳阈值）；**挂在弹簧下的挂钩、槽码写同样的 `settle`、同样的值 × per，回弹中也不脱节**（单测）。深链接、截图直接终值。
- validate：零件恰有一个 `coil`、不 `repeat`。

### SpaceScene · 数据表下的小图（`record.chart`，docs/30 F5，docs/31 共用）

- `record: { chart: true }` 或 `{ chart: { y: "<输出>" | ["<输出>", …] } }`（≤ 3 个同单位的数输出；默认 = 卡片观察的第一个数）；可与 `judge` 同写。表有 ≥ 2 行才画（`explorer/TryChart.tsx`，模型在 `lib/sim/chart.ts`）。
- 改变量是步进 → **折线图**：x 轴按控件的值（升序，全部值作刻度，与记了哪几行无关），点按 x 排序连线；是选择 → **条形图**：每个选项一格（选项顺序），记了的才有条，条上写数。y 从 0 到一个整齐的上限（1 / 2 / 2.5 / 5 × 10ⁿ，2–6 格）。hairline 坐标轴、mono 数字、轴标题 = 标签 + 单位；墨色，**当前值那一行 signal 色**；多个 y：折线换虚线与点形，条形第二组浅一档，图题后一行小图例。
- 读屏：`<svg role="img" aria-label>`，文字由数据自动拼（`chartSummary`，中英）：折线 = 起止值 + "一直上升 / 下降 / 有升有降"，或从头开始每一步一样时"每增加 50 g，伸长增加 1.0 cm，直到 300 g，之后增加得更快"；条形 = 每个选项的值 + 最高、最低。表仍是读屏的主体。手机抽屉里与表同宽。

### SpaceScene · 试一试 · 能量（energy）

docs/31 §4（E-EN1–EN8）。`sim.kind: "energy"`：同一个场景里跟着能量走。两半：**能量链**（能量链卡、五条能量流、读数）和几个**子模型**（太阳能板、落球、秋千、发条玩具、自行车发电机；数据里写了哪个就算哪个）。全部纯函数、同步、确定性（< 1 ms，秋千的采样在内）。代码：`lib/sim/energy.ts`（模型）、`lib/sim/sankey.ts`（卡片排版）、`lib/sim/bars.ts`（能量条读数）、`hud/EnergyCard.tsx`（右上卡）、`stages/model3d/SimOverlays.tsx`（`energy-bars`）、`hud/EnergyBarLabels.tsx`（能量条的标签）；单测 `tests/space-scene/{energy,sankey,energy-bars,energy-colors}.test.ts`，样板 `tests/space-scene/fixtures/energy-block.ts`（docs/31 §2.4 的全部链与数，按事实审计改过；可当作者模板）；示例主题 `sample-energy`（draft，七章：背景章 + 六张卡）；e2e `tests-e2e/sample-energy.spec.ts`。

```jsonc
"sim": {
  "kind": "energy",
  "controls": [ { "id": "chain", "kind": "choice", "default": "whole", "options": [ … 每条链一个选项 … ] }, … ],
  "outputs": [
    { "id": "chain-state", "kind": "state", "states": { "whole": {…}, "solar": {…}, … } },   // 每条链都要有标签
    { "id": "useful", "unit": "%" }, { "id": "heat", "unit": "%" }, { "id": "sound", "unit": "%" },
    { "id": "lamp-glow", "from": "out:lamp:light" },       // 当前链里某个节点出来的某种形式（%）
    { "id": "water-warm", "from": "in:kettle" },           // 进当前链里某个节点的能量（%）
    { "id": "same-light", "from": "start", "unit": "%" },  // 当前链起点的值
    { "id": "bounce-run", "kind": "timeline" }, { "id": "paths", "kind": "vector" }, { "id": "links", "kind": "vector" }
  ],
  "bind": [
    { "output": "paths", "flow": "heat-energy", "intensity": { "full": 0.6, "mode": "density" } },   // 五条流各一条
    { "output": "swing-run", "part": "swing-seat", "play": { "channel": "angle", "turn": [0, 0, 1], "pivot": [8.0, 2.4, 0] } }
  ],
  "overlays": [ { "kind": "energy-bars", "timeline": "bounce-run", "near": "drop-pole", "offset": [0.25, 0, 0], "height": 0.6 } ],
  "energy": {
    "g": 9.8,
    "chain": "chain",                                      // 选链的选择控件（不进试一试卡片：章 / 拍的 sim.set 选）
    "solar":  { "sky": "sky", "modules": 12, "area": 1.953, "efficiency": 0.21,
                "irradiance": { "clear": 900, "average": 640, "overcast": 150, "night": 0 }, "glow": { "clear": 1, … }, "chains"?: ["solar", "whole"] },
    "bounce": { "drop": "drop", "surface": "surface", "ratio": { "tile": 0.55, … }, "slow": 2, "heat"?: 0.9, "chains"?: ["bounce"] },
    "swing":  { "length": 2.0, "amplitude": 35, "loss": 0.03, "swings": 8, "sample"?: 0.08, "heat"?: 0.9 },
    "windup": { "winds": "winds", "secondsPerTurn": 1.5, "speed": 0.08, "wheel": 0.009, "kinetic"?: 8, "spinUp"?: 0.2, "chains"?: ["windup"] },
    "dynamo": { "speed": "speed", "on"?: "dynamo-on", "imax": 0.5, "v0": 6, "lampOhms": 12, "rated": 3, "wheel": 2.07, "crankRatio": 0.37, "chains"?: ["dynamo"] },
    "shares": { "panel": { "electrical": 21, "heat": 75, "light": 4 }, "fan": { "kinetic": 60, "heat": 38, "sound": 2 }, … },   // 每张表加起来 = 100
    "chains": {
      "dynamo": {
        "when": [ { "control": "speed", "is": { "ne": 0 } } ],          // 都成立才有能量（夜里、不踩、没上发条 = 整链 0）
        "reading": { "node": "dyn", "through": ["lamp"] },               // 读数说的是哪台"机器"
        "start"?: 100,                                                   // 或 { "control": "lamp-type", "values": { "led": 25, "filament": 100 } }
        "nodes": [ { "id": "rider", "part": "rear-wheel" }, { "id": "dyn", "part": "bicycle-dynamo" }, { "id": "lamp", "part": "headlamp" },
                   { "id": "air", "label": { "en": "The air around", "zh": "周围的空气" }, "sink": true } ],
        "links": [
          { "id": "d-in", "from": "rider", "to": "dyn", "form": "kinetic", "share": "in", "paths": ["kinetic-energy:pedal-wheel"], "when"?: { "control": "dynamo-on", "is": { "eq": true } } },
          { "id": "d-el", "from": "dyn", "to": "lamp", "form": "electrical", "share": "dynamo.electrical", "paths": ["electrical-energy:dynamo-lamp"] },
          { "id": "l-light", "from": "lamp", "to": "air", "form": "light", "share": "filament.light", "paths": ["light-energy:headlamp-beam"], "useful": true },
          …
        ],
        "mix"?: { "chains": ["solar", "home"], "scale": 0.6 },          // 也点亮别的链（默认值下）的路径 × scale（全景）
        "note"?: { "en": "…", "zh": "…" }                                // 卡片底下一行（如"只算轿厢，不算对重"）
      }, …
    }
  }
}
```

- **能量链**：`chain` 控件的每个选项一条链。链的第一批节点（没有带进来的）各得 `start`（默认 100）；每条带 = 一种形式（`light` / `electrical` / `kinetic` / `sound` / `heat` / `potential`），值 = 进 `from` 节点的能量 × `share`（`in` = 全部，`<表>.<键>` = `shares` 里的百分数；`bounce`、`swing` 两张表由模型算：落球留下 r、热和声 1 − r，按 `heat` 分成热与声；秋千摆完剩下 (1 − loss)^swings）。带的 `when` 不成立 = 0（选哪件电器、电梯在不在顶层、LED 还是白炽灯）。**守恒**：显示值逐节点取整到 1 %，取整误差加到这个节点的热带上（没有热带就加到最大的那条），所以**每个节点取整后进 = 出**；validate 对每条链读到的控件的**每一种组合**算一遍，任何节点进 ≠ 出都报（"`db` takes in 100 % and gives out 0 % (appliance = kettle)"）。
- **量**（输出的 `from`）：`chain-state`（状态 = 当前链）、`links`（向量：带 id → %）、`paths`（向量：`<流>:<路径>` → 这条路径的份额 0–1 = 带的 % ÷ 100，几条带共用一条路径取最大；`mix` 另加别的链默认值下的 × `scale`）、`start`、`useful` / `heat` / `sound`（`reading` 的"机器" = `node` + `through`：从机器出去的带里，标 `useful` 的、其余的热、其余的声，各占进 `node` 的能量的 %；没有 `reading` 或没有能量进来 = NaN，显示 `—`）、`in:<节点>`、`out:<节点>:<形式>`（当前链里；别的链 = 0）。子模型：`panel-power`（kW = 块数 × 面积 × 辐照 × 效率 ÷ 1000）、`sun-glow`（天空的 `glow`）；`impact-speed` = √(2 g h)、`bounce-height` = r h（cm）、`kept`、`lost`、`bounce-run`；`swing-run`；`run-time` = `secondsPerTurn` × 圈数、`toy-run`；`lamp-power` = I² R，I = imax · x ÷ √(1 + x²)，x = 速度 ÷ v0，`brightness` = 功率 ÷ `rated` × 100，`wheel-rpm` = 速度 ÷ 3.6 ÷ 周长 × 60，`crank-rpm` = 后轮 × `crankRatio`。子模型写了 `chains` 时，不在这些链里它的数读 `—`；时间线总是算。
- **时间线**（共用「时间线与回放」）：`bounce-run`：`y`（m，**球底**离地面的高度，ITF 的量法；零件画成落在地面上，`play` 沿 +Y 移）、`pe`、`ke`、`lost`（%，分段匀加速，精确：落下历时 √(2h ÷ g)、弹回到 r h 的最高点，空中不损失）；`swing-run`：`angle`（°，绕挂点 `pivot` 转）、`pe`、`ke`、`lost`（采样 ≤ 256；每半摆损失剩下的 `loss`，摆幅按 1 − cos θ ∝ 剩下的能量变小，每半摆的时长 = 那个摆幅下精确周期的一半（AGM 公式：35°、2 m = 2.906 s，比小角公式长 2.4 %）；条：势能 = 100 (1 − cos θ) ÷ (1 − cos θ₀)、动能 = 剩下的 − 势能、热和声 = 100 − 剩下的；终态停在最后一个转折点，**只是暂停**：字幕写"停在这一瞬，它还会越摆越低"）；`toy-run`：`x`（m，车走过的）、`spin`（°，车轮）、`key`（°，钥匙往回转）、`pe`、`ke`、`lost`（发条在 T 秒里匀速放出能量：热和声 = 100 t ÷ T；车在 `spinUp` 秒里加速到 `speed`，再匀减速到 T 停下；动能 = `kinetic` % × (速度 ÷ 最高速)²，从发条里来，所以势能一直在降、三者之和恒为 100；0 圈 = 空时间线）。
- **validate**（`sim-schema.ts energyIssues`）：`chain` 是选择控件、每个选项一条链；子模型读的控件存在且种类对、表覆盖选择的每个选项；落下高度 > 0、圈数为非负整数、速度 ≥ 0；**发电机的上限 imax² R 不能超过灯的额定功率**（"稳定在约 3 W"要真的稳定在 3 W，事实审计 SIM-G-limit）；**发条的 `kinetic` ≤ 50 (T − spinUp) ÷ T**（最短的一跑也要让势能一直降）；`shares` 每张表加起来 = 100、不能用 `bounce` / `swing` 这两个模型算的表名；节点有 `part`（存在）或 `label`、sink 没有出去的带；带的两端是节点、`share` 的表和键存在、`potential` 不列 `paths`、`paths` 的流和路径存在、`when` 的控件和值存在；链无环；`start` 的表覆盖控件的选项；`reading`、`mix` 的节点和链存在；守恒（上面）。输出：`in:` / `out:` 的节点要在某条链里，`chain-state` 给每条链写标签。
- **能量链卡**（`hud/EnergyCard.tsx`，有 `sim.energy` 时代替右上的零件链路卡；标题 ENERGY CHAIN / 能量链；< 1024 px 收进试一试卡片里可折叠的一节，同电路图卡）：当前链的 Sankey 图（`lib/sim/sankey.ts`，纯函数、确定性）。只画此刻有能量的带和它们连着的节点；节点按"从第一批节点数过来最长的带数"分列，sink 在最后一列；节点条高 = max(进, 出) × k，**全卡一个 k**，带宽 = % × k（最细 1.5 px），带按目标的高低依次从源节点出、按源的高低依次进目标节点；颜色 = `--en-<形式>`，≥ 8 % 的带上写百分数；只存着势能的节点（升到顶层的轿厢、弹到最高点的球）画成势能色的宽实心块。名字都写在节点上方、从节点起向右，一列的名字在下一列之前截断，最后一列的名字用右侧留出的 84 px；点节点 = 选中它的零件（44 px 命中区，Enter / Space），选中的描 signal。底下一行 `SIM` + "In this model / 在这个模型里"（+ 链的 `note`）。换链 0.4 s 淡入（减少动态时不淡）。读屏：`aria-label` 是整条链的文字（"Tennis ball → Test floor: kinetic energy 100 %; …"）；没有能量时写"这里现在没有能量在转换"。
- **五条能量流**（数据，不是引擎件）：每种**流动的**形式一条多路径流（`light-energy`、`electrical-energy`、`kinetic-energy`、`sound-energy`、`heat-energy`；颜色 `token:en-*`；组 = 只有流的组 `light` / `electrical` / `kinetic` / `sound` / `heat`，LAYERS 里可以单开一种），每条 ≤ 16 条路径、一次绘制；`{ "output": "paths", "flow": <流>, "intensity": { "full": …, "mode": "density" } }` 让每条路径上的粒子数 ∝ 那条带的份额（`full` = 粒子全满时的份额；份额相对链的起点，越往下游越稀）。不用 `stops` 沿路径变色。势能不画流：KEY 由引擎追加一行"Potential energy (stored) / 势能（储存的能量）"。
- **能量条**（`overlays: energy-bars`）：`{ "kind": "energy-bars", "timeline": <时间线输出>, "near": <零件>, "offset"?: [x, y, z], "height"?: 0.6, "width"?: 0.04, "gap"?: 0.02, "bars"?: { "potential": "pe", "kinetic": "ke", "lost": "lost" }, "lostSplit"?: { "heat": 0.9, "sound": 0.1 }, "when"?: { "control" | "output", "is" } }`：在零件包围盒中心 + `offset` 处立三根竖条（绕竖直轴转向镜头，平涂不受光）：势能、动能、热（底段）+ 声（顶段，按 `lostSplit`，示意）；`height` 处一条 100 % 发丝线，底部一条底线；**数值直接读时间线通道**（跟着回放走，终态 = 终值；`lib/sim/bars.ts` 把三者各夹到 ≥ 0 再归一到 100）。全部能量条 = 一个网格、**一次绘制**；零件不在场、`when` 不成立、时间线为空、EXPLODED 时淡出。标签在 HUD 层（`hud/EnergyBarLabels.tsx`，经 bridge 投影到条下）：三行"色块 + 名称 + 百分数"（Potential / Kinetic / Heat + sound；势能 / 动能 / 热和声），名称与颜色总在一起。validate：时间线输出存在且有这些通道、零件存在、`lostSplit` 两项之和为 1。
- **token**（docs/08 §1）：`--en-light` 芥黄（纸底上最亮的一档）、`--en-electrical` 蓝、`--en-kinetic` 青绿、`--en-sound` 紫、`--en-heat` 橙红、`--en-potential` 橄榄褐；paper / cinema 各一套。单测 `energy-colors.test.ts` 从 `tokens.css` 读出来校验：每色对底色 ≥ 3:1；正常视觉与红色盲、绿色盲、蓝色盲模拟（Machado 2009，严重度 1，线性 RGB）下两两 ΔE*ab ≥ 10。
- **测试与 QA**：`__atlas.engine.energyBars()` → `{ <时间线 id>: { potential, kinetic, lost, shown } }`（此刻画着的值）；`pnpm shoot --beats` 每拍检查画着的能量条加起来 = 100 ± 0.5（不等记为拍失败）；其余同「时间线与回放」（`simSeek`、`G`）。
- **数字纪律**（docs/31 §0-10 与 2026-10-18 事实审计 `art/codex-forces-energy/energy-facts.md`）：链上的百分数、示意的子模型参数都是 SIM / 示意，卡片与试一试卡都写"在这个模型里"。审计改过的几处已体现在样板里：发电机上限取 imax = √(3 W ÷ 12 Ω) = 0.5 A（SIM-G-limit：原来的 0.55 A 会趋向 3.63 W）；同样亮的 LED 链从 25 % 起（`start`，SIM-H-same-light）；秋千的势能条按原始能量归一（SIM-D-bars）；发条的动能从发条里来、停下时为 0（SIM-E-bars）；落球高度量球底（ENG-MODEL-02）。

### SpaceScene · 试一试 · 光（light）

docs/35 §4，`sim.kind: "light"`。纯函数 `lib/sim/light.ts`（几何、散射、孔卡、暗箱）与 `sun.ts`（NOAA / Meeus，含折射）；注册走 `SIM_KINDS` → `simQuantities` → `quantityKind`，不提供 timeline 通道，`SEPARATE_EXPERIMENTS.light = true`。它描述静态控制值下的光路；移动用已有的 `offset` / `rotate` 和新的 `place` 缓动，记录、图、预测、拍、背景章、深链接照共用 sim 契约。完整作者模板：`tests/space-scene/fixtures/light-bench.ts`；草稿夹具 `sample-light`（背景章 + 距离、形状、材料、太阳四张卡）。

`light` 的五个可选子模型（只引用写了的子模型的量）：

| 子模型 | 数据 | 输出量 `from` |
|---|---|---|
| `bench` | `source: { part, point, axis, beam }`、`power` 开关、`gaps: { torch, screen }` cm 步进、`holder` 场景点、`screen: { part, size: [宽,高] }` cm、`object` 选择、`turn` 角度步进、`objects` 映射 | `shadow:height` / `width`（cm）、`shadow:shape`（状态）；`control:<控件>`（数或开关 1/0） |
| `sheets` | 需要 bench；`control` 选择、`size` cm、`kinds: { hardly, dark }` 百分数阈值、`materials: { id: { part, straight, scattered } }` | `sheet:light`（%）、`sheet:dark`（0–1）、`sheet:kind`（none / hardly / lighter / dark） |
| `holes` | 需要 bench；`control`（in-line / moved）、`hole` 直径 cm、至少三张 `cards: [{ part, at, moved? }]`（at / moved 为 cm，恰一张可移动） | `holes:dot`（yes / no） |
| `seeing` | `torch` 开关、`target` 选择、`reflects: { 选项: 状态 }` | `seeing:eye`（none 或 reflects 的状态）、`seeing:dark`（关灯 1） |
| `sun` | `lat`、`lon`、`zone`、`time` 小时步进、`date` 选择、`dates: { 选项: ISO日期 }`、`pole` m、`north` 水平单位向量 | `sun:height` / `bearing`（°）、`length`（m）、`points`（八方位状态）、`noon`（h）、`noon-length`（m）、`at`（xyz 单位向量） |

`objects` 的每件是 `{ part, shape, names: { 角度: 状态名 } }`，中心 = holder：`disc { d, thick }`、`polygon { points: [[横,高],…], thick }` 在 yz 平面；`cylinder / cone { d, length, axis: "z", apex?: "+" | "-" }`；`sphere { d }`，尺寸全部 cm。模型按解析表面投影采样（圆盘 / 多边形取前后两面，圆柱取两端圆周、圆锥取底圆周 + 顶点：透视投影保持凸包，所以包围盒是精确的），球按切线锥；厚卡近表面会比零厚相似三角形略大。无物体或关灯时高宽 NaN（`—`），形状 none。材料光量 = `100 × (straight + scattered × r²/(r²+b²) × ((a+b)/a)²)`，`r² = 宽×高/π`，上限 100；这是明确标为 SIM 的朗伯散射模型。材质自身的 glass / enamel 画法与这个读数分开。

校验严格覆盖控件种类、选择键、零件引用（模型物体不得 context）、状态标签、透光率与阈值、形状名、日期、north、全部日期×时间高度 ≥ 5°、全部物体×角度×距离不碰光源/屏幕且投影完全落在屏幕与光束内。**docs/35 原始全距离范围与 60×45 cm 屏幕不兼容**：12 cm 卡在 10/60 cm 时影高约 84 cm，数据会被拒绝。夹具采用安全距离子集；内容作者应缩窄控件范围、拆实验或扩大实际屏幕，同时保持模型和网格尺寸一致。

### SpaceScene · 影子投射（shadow-cast）

`sim.overlays` 的一支（`SimOverlays.tsx` → `ShadowCast.tsx`，纯数学 `lib/sim/shadow.ts`），从挡光物的**实际网格，含 extra** 投到接收面；不用阴影贴图。光学主题关掉主光的投影，避免主光再投一条不同方向的影子：单处实验写 `views.shadows: "contact"`；两处相隔很远（实验台 + 户外空地）写 `"none"`，因为接触斑按整个模型的包围球放在原点，会在两处之间落下一块没有挡光物的灰斑。

```jsonc
{ "kind": "shadow-cast",
  "source": { "part": "torch", "point": [0,1,0.05], "axis": [1,0,0], "beam": 40,
              "when": { "control": "torch-on" } },
  "receiver": { "part": "screen-board", "normal": [-1,0,0], "size": [0.60,0.45] },
  "casters": [{ "part": "card-circle" }, { "part": "frosted-glass", "dark": { "output": "sheet-dark" } }],
  "spot": { "color": "token:en-light" },
  "rays": { "group": "rays", "edges": "vertical", "through": "dark", "extra": [[0,0]] } }
// 平行光：source = { direction: { output: "sun-at" } }；receiver = { part: "courtyard", normal: [0,1,0], radius: 5.5 }；
// trail = { control: "time" }；rays = { group: "rays", edges: "tip", parallel: [-0.4,0.4] }
```

`source.point` 是零偏移时的世界坐标，跟零件当前矩阵走；receiver 的 normal 是局部法线，size / radius 是场景单位。投影矩阵 `M = (n·L)I − L nᵀ`（点光 w=1、平行光 w=0），影子平涂成接收面混 ink 的不透明颜色，三角形重叠和孔卡多张叠加不会重复加深。矩形 / 圆接收面与光束裁剪独立于 CUTAWAY。零件隐藏、图层关时不投；关灯 0.3 s 淡出，拆开整层淡出，REFERENCE 保留。光线归 rays.group，RUN 流动、减少动态静止；extra 的接收面坐标是 cm，对挡光物的世界三角形求交（`lib/sim/shadow.ts segmentMesh`：包围盒先筛，再 Möller–Trumbore，不分配内存），遇不透光网格即停（`edges: vertical` 的边缘光线同理：光源与被擦过的边之间有另一个不透光挡光物——近 1 mm 以上——就不画），through dark 允许透光片后继续。trail 按时间步进值留下 Ø4 cm 粉笔点，当前点空心，换日期重算。

QA：`__atlas.engine.shadows()` 返回 `{ [叠加序号]: { casters: { [part]: { min: [u,v], max: [u,v], dark } }, spot?: { radius }, trail: [[u,v],…], rays } }`（`dark`：这一挡光物此刻的深浅，1 = 不透光），接收面坐标与半径为 cm。用 max−min 对模型 `shadow-height / width`，误差必须 <0.2 cm；太阳 trail 与杆顶平行投影相同。状态不变时不更新几何或要求帧。每挡光物一次绘制，光斑、全部光线、全部粉笔点各一次；台面 ≤45 calls，户外 ≤20，<0.25 M 三角形。测试 `light.test.ts`、`sun.test.ts`、`shadow.test.ts`、`light-display.test.ts` 与 `tests-e2e/sample-light.spec.ts`。

两个实验相距很远时，可写 `views.reference: { fit: "layers" }`：REFERENCE 仍是 section 平面的长焦正视图，但只按当前图层中未隐藏、非 context 的零件取景，避免隐藏的空地把实验台缩成一点。显式 `reference.camera` 优先；不写 fit 时保持全模型取景。这只改变镜头，不切图层或实验状态。夹具的暗箱流用 `whenRun: true`，对应拍开启 RUN；always-on 流会让已有 RunClock 在流图层隐藏时仍持续要帧。

### SpaceScene · 试一试 · 生活史（life-cycle）

docs/33 §4（E-M1 模型、E-M2 生活史环卡）。`sim.kind: "life-cycle"`：一种动物的生活史。数据里是**有来源的实测历期**（每个温度一行：每个阶段的平均天数 + 论文自己的孵化到成虫总数），模型只做推导：第 d 天在哪一阶段、到成虫还有几天、各段与各组的天数、多久倒一次水会不会有成虫飞走、环流转多快——这些都是 SIM（docs/30 D2：不做通用查表模型，表是测量，显示的数由模型算出）。纯函数、同步、确定性（< 0.1 ms）。代码：`lib/sim/lifecycle.ts`（模型）、`lib/sim/cycle.ts`（环卡的版式与读屏文字）、`hud/CycleCard.tsx`（右上卡）、`explorer/TryIt.tsx`（< 1024 px 收进试一试卡）、`sim-schema.ts`（`lifeCycleSchema`、`lifeCycleIssues`、`quantityKind` 的 `life-cycle` 一支、状态标签）、`scripts/validate-content.ts`（第二个环的 `link`）；单测 `tests/space-scene/{lifecycle,cycle-card}.test.ts`，样板 `tests/space-scene/fixtures/aedes-cycle.ts`（docs/33 §4.2 的完整数据：埃及伊蚊 S16 表 2 四个温度，可当作者模板）；示例主题 `sample-life-cycle`（draft，五章：背景章 + 天数卡 + 水温卡（表、小图、先猜后看）+ 倒水卡 + 两个环）；e2e `tests-e2e/sample-life-cycle.spec.ts`。

```jsonc
"sim": {
  "kind": "life-cycle",
  "controls": [
    { "id": "temp", "kind": "step", "values": [20, 25, 28, 32], "default": 28, "unit": "°C", "label": {…} },
    { "id": "day", "kind": "step", "values": [0, 1, 2, 3, 4, 5, 6, 7, 8], "default": 0, "unit": "d", "label": {…} },
    { "id": "every", "kind": "step", "values": [2, 4, 6, 8, 10, 14], "default": 14, "unit": "d", "label": {…} },
    { "id": "wipe", "kind": "toggle", "default": false, "label": {…} },
    { "id": "compare", "kind": "toggle", "default": false, "label": {…} }      // 只给环卡（章 / 拍 sim.set 或卡上的开关），不进试一试卡
  ],
  "outputs": [
    { "id": "stage", "kind": "state", "states": { "egg": {…}, "l1": {…}, …, "adult": {…} } },   // 从 start 到最后一个阶段都要有标签（egg 可写可不写）
    { "id": "to-adult", "unit": "d", "decimals": 1 },
    { "id": "larva-days", "from": "days:larva", "unit": "d", "decimals": 1 },
    { "id": "pupa-days", "from": "days:pupa", "unit": "d", "decimals": 1 },
    { "id": "days-left", "unit": "d", "decimals": 1 },
    { "id": "temp-now", "from": "control:temp", "unit": "°C", "decimals": 0 },
    { "id": "on-pupa", "from": "on:pupa" },                                   // 1 / 0，给 tint 绑定
    { "id": "head", "from": "size:head", "unit": "mm", "decimals": 2 },       // 只在 size 有来源时写
    { "id": "adults", "kind": "state", "from": "emptying:adults", "states": { "none": {…}, "some": {…} } },
    { "id": "eggs-left", "kind": "state", "from": "emptying:eggs", "states": { "yes": {…}, "none": {…} } },
    { "id": "rate", "kind": "vector" }
  ],
  "bind": [
    { "output": "stage", "part": "follow-marker", "pose": { "l1": "marker-l1", …, "adult": "marker-adult" } },
    { "output": "eggs-left", "part": "eggs", "visible": { "eq": "yes" } },
    { "output": "adults", "part": "escaped-adults", "visible": { "eq": "some" } },
    { "output": "rate", "flow": "life-cycle", "intensity": { "full": 1 } }
  ],
  "lifeCycle": {
    "temp": "temp", "day": "day",                     // 两个步进控件
    "start": "l1",                                    // 第 0 天 = 孵化；之前的阶段（卵）不计天
    "stages": [                                       // 环上的顺序，最后一个 = 成虫（不计天）；in: water | wall | air | land
      { "id": "egg", "in": "wall", "part": "eggs", "label": {…}, "note": { "en": "waits for water", "zh": "等水来" } },
      { "id": "l1", "in": "water", "part": "larva-l1", "label": {…} }, …,
      { "id": "adult", "in": "air", "part": "thorax", "label": {…} }
    ],
    "groups": { "larva": { "stages": ["l1", "l2", "l3", "l4"], "label": { "en": "Larva", "zh": "幼虫（孑孓）" } } },   // 或只写数组（环卡不写括号名）
    "days": {                                         // 键 = temp 的每个值；各段 + 可选 total（论文的孵化到成虫）
      "28": { "l1": 1.88, "l2": 0.68, "l3": 1.00, "l4": 1.82, "pupa": 1.86, "total": 7.23 }, …
    },
    "size"?: { "head": { "unit": "mm", "values": { "l1": …, "l4": … } } },
    "emptying"?: { "every": "every", "wipe"?: "wipe" },
    "rate"?: { "flow": "life-cycle", "paths": ["ring", "out", "lay"], "reference": 28 },
    "card"?: { "compare": { "control": "compare", "label": {…}, "stages": [ { "id": "egg", "label": {…} }, { "id": "nymph", … }, { "id": "adult", … } ],
                            "link"?: { "topic": "grasshopper", "chapter": "nerves-and-growing-up", "label": { "en": "See the grasshopper", "zh": "看蝗虫" } } } }
  }
}
```

- **模型**（`lib/sim/lifecycle.ts`）：取 `temp` 当前值那一行；计天的阶段 = 从 `start` 到最后一个阶段之前；写了 `total` 时各段 × total ÷ Σ（论文的总数是全体个体的平均、各段样本数不同，所以 Σ 与总数差一点），不写 = Σ；最后一个边界就是总数本身（不因缩放漂移）。`stage` = 第 `day` 天落在哪一段（左闭右开：边界那天属于下一段；≥ 总数 = 最后一个阶段；永远不会是 `start` 之前的阶段——卵由环卡上的 `note` 和字幕讲）。
- **量**（输出的 `from`）：`stage`（状态）、`to-adult`（总数）、`days-left` = max(0, 总数 − day)、`days:<阶段>`（缩放后的段长）、`days:<组>`（组内各段之和）、`on:<阶段>`（1 / 0）、`size:<量>`（当前阶段的值，没有 = NaN 显示 `—`）、`control:<控件>`（步进的值、开关 1 / 0：PLATE 的水温回显）、`emptying:adults`（`every` > 总数 → `some`，否则 `none`：按平均历期画的界线，个体有快有慢，内容要写明）、`emptying:eggs`（`wipe` 开 → `none`，否则 `yes`：卵在水线以上、耐干）、`rate`（向量 `<rate.flow>:<路径>` → 参考温度的总数 ÷ 当前总数，绑流的 `intensity`（速度模式），`paths` 要列全这条流的路径，没列的路径会停）。`SEPARATE_EXPERIMENTS['life-cycle'] = false`：PLATE 块尾照常写状态（本章卡片观察的状态，否则卡片控件或本章 `set` 会改的第一个状态，否则 `stage`）。
- **validate**（`sim-schema.ts lifeCycleIssues`）：`temp`、`day`、`every` 是步进控件（`day` ≥ 0、`every` > 0），`wipe`、`compare.control` 是开关；`temp` 的每个值都有一行、没有多余的行；温度键写成规范的数（`28`，不是 `28.0`）；每行恰好覆盖计天的阶段（各 > 0、有限），写给卵或成虫的天数报"不计天"，`|total − Σ| ≤ 5 % Σ`（抄错；含边界）；阶段 id 唯一、不能叫 `total`，有 `adult` 时它必须是最后一个，`start` 存在且不是最后一个；`part` 存在且不是 context 零件；组的成员是相邻、按顺序的计天阶段，组名不与阶段重名；`size` 的键是阶段；`rate.flow` 是有 `paths` 的流、`paths` 是它的全部路径（不重复）、`reference` 是 `temp` 的一个值；输出的 `from` 是本模型的量（`days:egg`、`size:` 没有 `size` 数据、`emptying:` 没有 `emptying` 数据都报）、种类对、`stage` / `emptying:*` 的每个可能状态有标签、不写永远不会出现的状态。`pnpm validate` 另查 `card.compare.link` 的主题与章存在（同 `<TopicLink>`）。
- **生活史环卡**（`hud/CycleCard.tsx`，有 `sim.lifeCycle` 时代替右上的零件链路卡；标题 LIFE CYCLE / 生活史；< 1024 px 收进试一试卡片里可折叠的一节，同电路图卡、能量链卡；没有试一试卡的章（如对照章）在阅读面板里单独放这一节，开关和链接照样在；手机同其他右上卡隐藏，试一试卡里照常有）：版式在 `lib/sim/cycle.ts ringLayout`（纯函数、确定）：阶段等距排在圆上，**第一个在 12 点、顺时针**；相邻两站之间一段带箭头的弧（hairline 墨线，箭头在弧中点）；名字在圈外、弧的字在圈外两站之间：计天的阶段写当前水温下的段长（`1.9 d` / `1.9 天`，1 位小数，= 模型的 `days:<阶段>`），`start` 之前的阶段写它的 `note`（"waits for water / 等水来"），最后一个阶段回到第一个的弧写"lays eggs / 产卵"；`in: water` 的连续几站后面一条 `--cold` 15 % 的宽弧带（圈内），带上沿弧写 IN WATER / 在水里；`wall` 的站旁一小段竖线（壁）；组的阶段小一号、圈内一个括号 + 组名。圆心 `≈ 7.2 d` + 水温。当前 `stage` 的站实心 signal，其余描边；天数与圆心读数在值变时 0.3 s 淡入（减少动态时不淡）。站是按钮（44 px 命中区，Enter / Space，`aria-current="step"` 标当前阶段）：点 = 选中该阶段的 `part`，选中的描 signal。有 `card.compare` 时卡下一个开关（`role="switch"`，字 = 那个控件的 `label`，写同一个 `compare` 控件），开时圈下面再画第二个小环（只有站、箭头和名字，不写天数；右上卡只有 260–280 px 宽，并排放不下圈外的字）和链接（字 = `link.label`，如"See the grasshopper / 看蝗虫"；`link` → `/<语言>/topics/<主题>/?ch=<章>`）。命中方块是 viewBox 的 54 单位：卡片画到 ≥ 82 %（1280 px 宽的右列）时 ≥ 44 CSS px；圈上的字最小 10 px。底下一行 `SIM` + "In this model / 在这个模型里"。读屏：`aria-label` = `cycleSummary`（"Life cycle in this model at 28 °C: Egg, waits for water; Larva 1, 1.9 days; …; Adult, lays eggs." / "这个模型里水温 28 °C 时的生活史：卵，等水来；一龄，1.9 天；…；成虫，产卵。"）。i18n：`space.card.cycle`、`space.try.cycle`、`space.cycle.*`。
- **测试与 QA**：`__atlas.engine.sim()` 的 `outputs.stage`、`outputs.rate`；环卡 `.space-cy[data-stage]`、`[data-node][data-on]`、`[data-arc]`、`[data-second]`、`[data-cycle-compare]`；`pnpm shoot <slug> --beats --keys` 照常（`]` 走一天）。
- **数字纪律**（docs/33 D5、§2.4）：天数是一项实验室研究的雄蚊平均值，卡片、PLATE、试一试都带 SIM / "在这个模型里"；正文写取整的"约 7 天"。同一个模型以后给课纲点名的其他动物（蝴蝶、青蛙、鸡、甲虫、蟑螂）和植物复用：换 `stages`、`days`、`in`。

### SpaceScene · 试一试 · 物质（matter）

docs/36 §4 E-MA1。`kind: "matter"` 注册于 `SIM_KINDS`、`simQuantities`、`quantityKind`；没有时间线，`simTimelineChannels` 返回 null。`SEPARATE_EXPERIMENTS.matter = true`：PLATE 块尾只跟本章实验。纯函数 `lib/sim/matter.ts`，严格数据与交叉校验 `matter-schema.ts`。全部使用模型常数计算，输出内部保留精度，UI 继续按 `decimals` 显示。默认常数 `g: 9.8`、`p0: 101.325` kPa、`air: 1.18` g/ℓ、`water: { density: 0.997, squash: 4.5e-7 }`（g/ml、每 kPa）。

七个子模型可独立省略；缺少的子模型不提供任何量。完整可复制数据见 `tests/space-scene/fixtures/matter-bench.ts` 与 draft `sample-matter/data/parts.json`；这些是模型设计值，不是真实器材的实测值。

| 子模型数据 | 计算 / `from` |
|---|---|
| `objects: { id: { volume, density, floats? } }`，`weigh: { object: <choice>, step: 0.1 }` | ml × g/ml → `weigh:mass`，按 step 取整 |
| `displace: { object: <choice>, water: 100, liquid: <part> }` | `displace:reading` = 水 + 固体体积（全精度，读到几位由输出的 `decimals` 定），`displace:volume` = 固体体积；`nothing` = 0；浮物不能选 |
| `pour: { container: <choice>, volume: 200, liquids: { option: <part> } }` | `pour:volume` 不变，所选容器有水、其余为零；`pour:level` 是 cm，由实际液体 primitive 的同一 `levelForVolume` 求出 |
| `pump: { pumps: <step>, ball: 600, stroke: 0.2, inside: 7, firm: [51.7,58.6] }` | `pump:mass`、`pump:air`（g）；`pump:firmness` = flat / soft / firm / too-hard |
| `cup: { place: <choice above/pushed>, hole: <toggle>, basin: {radius,depth}, cup: {radius,height,glass,rim,top}, liquids: {basin,around,inside} }` | 尺寸 cm、玻璃体积 ml；联立水量守恒与等温气体压缩；`cup:basin-level` cm、`basin-rise` / `cup-rise` mm、`wet` 0/1、`tissue` dry/wet、`bubbles` none/rising |
| `squeeze: { load: <step kg>, volume: 20, bore: 2, fillings: { air: "gas", water: "liquid", sand: "grains" } }` | bore 内径 cm；`squeeze:<key>` ml，分别按等温压缩、液体压缩率、颗粒顶住计算 |
| `pores: { water: <step ml>, sand: 100, porosity: 0.35, liquids: {above,jug}, jug: 100 }` | `pores:reading`、`air` ml、`wet` 0–1、`vs-sum` equal/less（预测另可选 more）、`bubbles` none/rising；先填孔，再升液面 |

所有液体由 `volume:<part-id>` 提供 ml。`evaluateSim` / `simQuantities` 的可选第五参数是零件几何；舞台 / HUD / 先猜后看通过 `evaluateSimOnStage` 自动传入，避免复制容器尺寸。状态输出必须给每种状态写 `{ en, zh }` 标签。校验检查控件种类、选项覆盖、液体几何、容积、杯子完全浸没、孔隙与供水范围；未使用的 objects 是 warning。原有试一试卡片、URL、record/chart/predict、pose/offset/settle/count/tint 都直接复用；无 timeline 的 matter 卡片不写 replay。

### SpaceScene · 液面（`fill`）

剖切的材质约定：`fill` 绑定的封闭液体保留自身颜色的剖面填充，不加金色剖面线。静态 `membrane` 液体目前只裁表面、不补剖面：该材质也用于真实开放的翅膜 / 气囊，不能安全地按材质把背面都当封闭液体的切面；静态液体要有可靠剖面应改用有封闭填充几何的 `fill` 绑定。`states-of-matter` 的盆水 / 杯水已有 `fill` 绑定与水色剖面；静态的针筒水柱、水碟与罐中饮料保留透明表面的现有读法，未为了加剖面而改变体积模型。零件 `clip: false` 始终完整显示，不参与默认或命名剖切，也不填剖面，适用于实验台 / 边桌等背景。

docs/36 §4 E-MA2。数输出或步进控件可绑定：

```jsonc
{ "output": "v-flask", "part": "flask-water", "fill": { "per": 1e-6, "below": 0, "meniscus": 0.0015, "ease": 1.2 } }
```

`per` 把源值变成立方场景单位（ml → m³ 为 `1e-6`），`below` 与源值同单位（沙上的水写 100），`meniscus` 为场景长度，`ease` 秒默认 0.6。液体 primitive 是容器内腔的最大区域：完整旋转的封闭 `lathe` 轮廓，或 `box`。首尾在轴上或首尾同点；可沿轴连接空腔轮廓，不能自交。每件只有一条 fill，无 context/repeat/extra。轮廓坐标与液面 hook 使用 primitive 的局部 Y；容器直立（不接受 primitive X/Z 倾斜或部分旋转的 arc），姿态可整件平移。支持 Y 缩放 / 镜像、圆形轮廓的等比 X/Z 缩放与 box 的 Y 轴旋转。

`lib/fill.ts` 提供 `volumeBelow`（水平裁剪后的帕普斯体积）、`capacity`、40 次二分的 `levelForVolume`、`fillSlice`、`easeFillVolume`。`below` 到 `below + volume` 之间才画液体；顶面平整、可带装饰弯月面，弯月面不改变读数。低于容积 0.1% 时不画，满溢夹到容积；validate 对已知最大值超容积报错。舞台 `fillGeometry.ts` 复用顶点缓冲与材质，仅在体积变化时更新，48 个径向分段；不逐帧创建 geometry/material。几件同时改变的液体按体积三次缓动，流出与流入总量守恒。瞬切、深链接、截图、减少动态效果与 REFERENCE 直接到终值。液体照常剖切，X-RAY 不淡化非 shell 的液体。

流的 `visible` 可加 `paths: ["cup-hole"]`；多条绑定可独立控制同一条流的不同路径，和强度、密度、整条流的开关相乘，不增加绘制次数。路径必须属于该流；不写 paths 保持原行为。

QA：`__atlas.engine.fill(partId)` → `{ volume, level, shown }`（当前绘出的 m³、primitive 局部液面 Y、是否可见）；`__atlas.engine.flow(flowId)` → `{ paths: { id: { visible } } }`（当前路径透明度）；`fillBenchmark(partId)` 给出暖机后 100 次几何重建的 CPU 毫秒数（五组中位数，并恢复原几何）。`pnpm shoot --beats` 在每拍及拍链接检查每件液体的模型体积、液面及 pour 的 cm 读数，容差 0.5 mm。单测见 `matter.test.ts`、`fill.test.ts`，交互 / 双语 / 手机见 `sample-matter.spec.ts`。

### SpaceScene · 试一试 · 材料（materials）

docs/37 §4.2–§4.4（E-MT1）。`sim.kind: "materials"`：一张实验台上五个公平测试共用同一套样品——强度（条架在两块木块上，中点加槽码）、柔韧性（条夹住一端，推杆压下末端）、浮沉（一缸清水）、防水（滴一滴水）、透光（手电筒、样片、白屏）——加 `profile`（一种材料的五个结果一起读）。注册走 `SIM_KINDS` → `simQuantities` / `evaluateSim` → `quantityKind`（状态表 `materialsStates`：按这个测试读的控件穷举出会出现的状态）；没有时间线（`simTimelineChannels` 为 null），`SEPARATE_EXPERIMENTS.materials = true`（PLATE 块尾只写本章卡片的状态）。纯函数 `lib/sim/materials.ts`（`bridgeSolve` / `cantileverSolve` / `tankSolve` / `solveMaterials`，同步、确定，一次求值约 0.01 ms），严格数据与交叉校验 `materials-schema.ts`（`materialsSchema`、`materialsIssues`）。完整作者模板 `tests/space-scene/fixtures/materials-bench.ts`（docs/37 §2.2 的七种样品，常数按事实核查第二轮改过）；草稿夹具 `sample-materials`（背景章 + 五个测试各一张卡 + 五个一起，三种材料：木、玻璃、塑料）。

**数字纪律（docs/37 D9，validate 守）**：常数全部在主题数据里（S1 写来源），引擎不写任何材料的数。模型的数输出（`bridge:sag`、`cantilever:tip`、`tank:rise`、`light:dark`）**只给绑定**；`kind: materials` 的卡片 `observe` / `predict.observe` 只能是状态输出或 `control:` 读数（器材的量），`telemetry.follow` 只能是 `control:` 读数——写了模型自己的数，`pnpm validate` 报错。

```jsonc
"materials": {
  "g": 9.8,                                                   // N/kg
  "samples": {                                                // 键 = 材料 id = strip / square / pick 的选项（多了、少了都报）
    "wood":    { "E": 10.7, "limit": 100.7, "fails": "snaps", "density": 650,  "absorbs": true,  "light": "none" },
    "metal":   { "E": 200,  "limit": 250,   "fails": "bends", "density": 7820, "absorbs": false, "light": "none" },
    "glass":   { "E": 70,   "limit": 36,    "fails": "snaps", "density": 2500, "absorbs": false, "light": "most" },
    "plastic": { "E": 1.2,  "limit": 25,    "fails": "bends", "density": 955,  "absorbs": false, "light": "some" },
    "rubber":  { "E": 0.005,                "fails": "never", "density": 920,  "absorbs": false, "light": "none" },
    "fabric":  { "limp": true,              "fails": "never", "density": 1540, "absorbs": true,  "light": "some" }
  },                                                          // E GPa；limit MPa（snaps = 断的应力，bends = 屈服，never 不写）；density kg/m³
  "strip":      { "width": 0.03, "thick": 0.002 },            // m
  "bridge":     { "strip": "strip", "masses": "masses", "mass": 0.5, "span": 0.20, "clearance": 0.06, "bend": { "little": 0.005, "lot": 0.03 } },
  "cantilever": { "strip": "strip", "push": "push", "reach": 0.25, "droop": 0.01, "hang": 0.8 },
  "tank":       { "block": "block", "water": 18, "density": 1000, "height": 25,             // cm，kg/m³
                  "blocks": { "wood": { "sample": "wood", "height": 3 }, "bottle": { "density": 40, "height": 6.5 }, … } },
  "drops":      { "square": "square" },
  "light":      { "square": "square", "dark": { "most": 0.10, "some": 0.60, "none": 1 } },
  "profile":    { "pick": "pick", "masses": 5, "push": 2, "block": "same", "square": "same" }   // same：选项 id = 材料 id
}
```

| 子模型 | 读的控件 | 量（`from`） | 规则 |
|---|---|---|---|
| `bridge` | `strip` 选择、`masses` 步进（个数） | `bridge:result`（`holds` / `on-bench` / `snapped`）、`bridge:bend`（`hardly` / `a-little` / `a-lot` / `none`）、`bridge:view`（材料 id，或 `<id>-snapped`）、`bridge:sag`（m，只给绑定）、`control:masses-kg` | P = 个数 × mass × g；δ = PL³ ÷ 48EI + 5wL⁴ ÷ 384EI，σ = (PL ÷ 4 + wL² ÷ 8) ÷ Z（I = bh³ ÷ 12，Z = bh² ÷ 6，w = 密度 × g × b × h）。δ ≥ clearance = 弯到台面上，台面托住其余的重量（应力停在碰到台面那一刻）；`snaps` 且 σ > limit = 断（sag 0、bend none、view `<id>-snapped`）；`limp` = 一开始就垂在台面上 |
| `cantilever` | `strip` 选择、`push` 步进（cm） | `cantilever:result`（`not-pushed` / `bends` / `droops` / `snapped`）、`cantilever:view`、`cantilever:tip`（m） | δ₀ = wL⁴ ÷ 8EI（`limp` = ∞）；tip = min(max(压下, δ₀), hang × reach)；σ = 3Eh × 压下 ÷ 2L²；`snaps` 且 σ > limit = 断（tip 0）；否则 δ₀ ≥ droop = 自己垂下；压下 0 = 还没压；否则弯而不断 |
| `tank` | `block` 选择 | `tank:result`（`floats` / `sinks`）、`tank:rise`（cm：底面离缸底） | 密度 < 水的密度 = 浮，浸入 = 密度 ÷ 水 × 高，rise = 水深 − 浸入；否则沉到底（0） |
| `drops` | `square` 选择 | `drops:result`（`stays-on-top` / `soaks-in`） | 样品的 `absorbs` |
| `light` | `square` 选择 | `light:result`（`most` / `some` / `none`）、`light:dark`（0–1，给 `shadow-cast` 的 `dark`） | 样品的 `light`；dark = `light.dark[结果]` |
| `profile` | `pick` 选择 | `profile:strength` / `flex` / `float` / `water` / `light` | 上面五个，砝码取 `profile.masses`、压下取 `profile.push`、放进水里的 = 同 id 的方块、样片 = 同 id |

- 另有 `control:<步进或开关>`（PLATE 回显器材的量：压下的 cm）与 `control:masses-kg`（条上的 kg）。
- **validate**（`materials-schema.ts materialsIssues` + `sim-schema.ts`）：控件存在且种类对（strip / block / square / pick 选择，masses 整数步进 ≥ 0，push 步进 ≥ 0）；strip / square / pick 的选项 = `samples` 的键；`block` 的每个选项在 `tank.blocks`、没有多余的、`sample` 存在、`sample` 与 `density` 二选一；样品：`limp` 与 `E` 二选一、`limp` 只能 `fails: never`、`snaps` 要 `limit`、`never` 不写 `limit`；`light.dark` 的 most < some < none；`bridge.bend.little` < `lot`、`droop` < hang × reach；**设计守门**：`fails: bends` 的材料在每个 `masses` / `push` 取值下 σ < limit（"永久弯"不画，所以不许发生）；浮着的东西不碰缸底（浸入 ≤ 水深）、水深 < `tank.height`；`profile` 要五个测试都在、`masses` / `push` 是控件的值、每种材料都有同 id 的方块；输出 `from` 是本模型的量、种类对、每个会出现的状态都有标签、**不写永远不会出现的状态**（木不会断，就不能写 `wood-snapped`）。
- 读者看到的只有状态与器材的量。玻璃、陶瓷在第几个砝码断由常数决定（事实核查第二轮后两者都在第 3 个、都在压下 1.5 cm 时断），字幕不说第几个、不比谁先断。
- 卡片 `observe` 至多 5 个（T6 一次读五个结果，记一行就是表的一行）。

### SpaceScene · 弯曲（`bend`）

docs/37 §4.5（E-MT2）。把一根条像尺子一样往下弯（−Y），**保持条的长度**：

```jsonc
{ "output": "bridge-sag", "part": ["bridge-wood", "bridge-glass"], "bend": { "mode": "bridge", "axis": [1, 0, 0], "span": 0.20, "per": 1, "ease"?: 0.5 } }
{ "output": "flex-tip",   "part": ["bend-wood", "bend-glass"],     "bend": { "mode": "cantilever", "axis": [1, 0, 0], "clamp": -0.10, "reach": 0.25, "per": 1 } }
```

- **零件**：主 primitive 是 `box` 或 `bevelBox`（三个尺寸），沿零件的 `axis`（±X 或 ±Z）放、中心在零件中心（`at`），不转、不缩放、不 `repeat`；`extra` 可以有，只弯主 primitive（extra 留在原处）。`bridge`：两个支点在中心两侧 ±span ÷ 2（条的中心放在两块木块的正中）；`cantilever`：`clamp`（沿 axis，离中心）以内夹住不动，之外 `reach` 伸出，`clamp + reach` ≤ 条的末端。引擎把主 primitive 沿 axis 切成 64 段（box 由构建器直接分段并保留索引；bevelBox 由 `shaped.ts sliceAlong` 把跨段的三角形裁开），顶点带 `atlasBend` = 1。
- **值**：数输出或步进控件 × `per` = 弯的大小（场景单位）：`bridge` = 中点下垂、`cantilever` = 末端下垂；≤ 0 直；至多 0.8 × span / reach（布、橡胶的垂挂）；条太短、架在支点上下垂不到那么多时，弯到它能到的地方。
- **形状**（`lib/bend.ts bendCurve`，纯函数）：小挠度的教科书形状只取斜率——简支梁中点集中力 f(a) = a(3L² − 4a²) ÷ L³（a 从支点量起），支点外的悬挑段沿支点处的切线直出（两端翘起）；悬臂端部集中力 g(x) = x²(3L − x) ÷ 2L³——每一段按斜率转一个角，沿弧长首尾相接（大挠度不会把条"拉长"），再解形状的大小（从上一帧的解出发的割线法，退路是 Illinois 夹逼），使画出的中点 / 末端下垂正好等于值（误差 < 1e-9 m）。桥：条始终搭在两个支点上（弯得越多，条从两边滑进来）；悬臂：夹口以内不动。截面跟着转（法线一起转）。
- **画**：载入时存每个顶点在中轴线上的位置与离中轴线的高度，运行时只改写位置与法线缓冲（不新建几何、不新建材质；缓动停下时重算一次包围球，缓动中不做视锥剔除）；值变化时三次缓入缓出、`ease` 秒（默认 0.5）；深链接、截图、拍的瞬切、`prefers-reduced-motion`、REFERENCE = 直接终值。零件的标注锚点跟着中轴线走。一根 30 cm 的 box 条 528 个顶点，一次更新（中轴线 + 顶点）约 0.01 ms（单测：100 次 < 2 ms）。
- **一起走的零件**：中点上的砝码托、槽码用同一个输出的 `offset`（`axis: [0, -1, 0]`、`per` 同 bend）；推杆用压下的步进控件的 `offset`（`per: 0.01`），压下大于自垂时推杆脚正好落在条末端的上表面。断开的条另做一件（两段），用 `visible` 换。
- **validate**：零件存在、主 primitive 是 box / bevelBox（三个尺寸）、不 repeat、不转、不缩放；`axis` 是 ±X / ±Z；`bridge` 写 `span`（不写 clamp / reach）且 `span` < 条长；`cantilever` 写 `clamp` 与 `reach`（不写 span），夹口在条上、`clamp + reach` ≤ 条的末端；源是数输出或步进控件；同一零件只有一条 `bend`，不能既 `bend` 又 `stretch`。
- **QA**：`__atlas.engine.bend(partId)` → `{ value, mid: [x,y,z], tip: [x,y,z], length, shown }`（此刻画出的下垂 m；条中心与末端的模型坐标——悬臂的末端是 `clamp + reach`，桥是 +axis 端；中轴线长度；是否可见）。`pnpm shoot --beats` 每拍与每个拍链接核对：可见的条 `value` = 模型输出 × per（同样夹到 0.8）± 0.5 mm、`length` = 原长 ± 0.5 %。单测 `tests/space-scene/bend.test.ts`，交互 `tests-e2e/sample-materials.spec.ts`。

### SpaceScene · 试一试 · 分类（sort）

docs/38 §4.2 E-LT1。`sim.kind: "sort"`：一盒标本、几只托盘、一个"是 / 不是"的分类键，模型算出每件标本落进哪一组、组里的哪一格。注册走 `SIM_KINDS` → `simQuantities`（`lib/sim/sort.ts solveSort`）→ `quantityKind`（`sortQuantity`），没有时间线（`simTimelineChannels` 返回 null），`SEPARATE_EXPERIMENTS.sort = true`（每章一只托盘，PLATE 块尾只跟本章）。纯函数、同步、确定（32 件 × 6 问 < 0.2 ms，有单测）。数据与交叉校验在 `sort-schema.ts`（`sortSchema`、`sortIssues`，同 `matter-schema.ts` 的做法）。完整作者模板：`tests/space-scene/fixtures/specimen-tray.ts`（docs/38 §4.2 的全部 `sort` 数据与 §3.4 特征表、三种布局与 §3.2 坐标、七只托盘）；草稿夹具 `sample-sort`（背景章 + 一个问题、两个问题、一个个问、同学的分类盘四章）；单测 `tests/space-scene/{sort,keycard,shift,surfaces-units}.test.ts`；e2e `tests-e2e/sample-sort.spec.ts`。

```jsonc
"sim": {
  "kind": "sort",
  "controls": [
    { "id": "tray", "kind": "choice", "default": "all", "options": [ "all", "alive", … ] },      // 选托盘（选项 = sort.trays 的键）
    { "id": "q-alive", "kind": "choice", "default": "none", "options": [ "none", "moves", … ] },  // ask：选项 = questions 的键（+ none）
    { "id": "asked-animal", "kind": "step", "values": [0, 1, 2, 3, 4, 5, 6], "default": 0 },      // chain：问了几个
    { "id": "fix", "kind": "toggle", "default": false }, { "id": "suspect", "kind": "choice", … }   // arrangement
  ],
  "outputs": [
    { "id": "slots", "kind": "vector", "from": "slots" },                                  // 给 shift 绑定
    { "id": "layout", "kind": "state", "from": "layout", "states": { "none": {…}, "two": {…}, … } },
    { "id": "count-a", "from": "count:a" }, { "id": "count-u", "from": "count:u" }, { "id": "on-tray", "from": "count:tray" },
    { "id": "kinds-a", "from": "kinds:a" }, { "id": "wrong", "from": "wrong" },
    { "id": "verdict", "kind": "state", "states": { "right": {…}, "wrong": {…} } }, { "id": "belongs", "kind": "state", "states": { "mammal": {…}, … } },
    { "id": "where-dolphin", "kind": "state", "from": "where:dolphin", "states": { "u": {…}, "a": {…}, …, "off": {…} }, "predictOnly"?: ["…"] }
  ],
  "bind": [
    { "output": "slots", "part": [ /* 全部标本 */ ], "shift": { "ease": 0.8, "stagger": 0.03, "lift": 0.04 } },
    { "output": "layout", "part": ["pad-2a", "pad-2b"], "visible": { "eq": "two" } }
  ],
  "sort": {
    "tray"?: "tray",                                        // 选托盘的控件（默认 tray）
    "groups": { "mammal": { "label": {…}, "big"?: "animal" }, …, "none": { "label": {…} } },          // 真实类群
    "questions": { "six-legs": { "label": { "en": "Six legs, three body parts", "zh": "六条腿、身体分三部分" } }, … },
    "specimens": { "toy-car": { "group": "non-living", "traits": { "moves": true, "responds": true, "grows": false, … } }, … },  // 键 = 零件 id，顺序 = 组内顺序
    "layouts": { "two": { "a": { "at": [-0.32, 0.011, 0.23], "cols": 7, "rows": 6, "pitch": 0.08, "pad": "pad-2a" }, "b": … }, … },
    "trays": {
      "all":       { "specimens": "*" },                                                        // 全部在盒里，layout none，卡片一行字
      "alive":     { "specimens": [ … ], "layout": "two", "key": { "ask": "q-alive" } },
      "own-key":   { "specimens": [ … ], "layout": "three", "key": { "ask": "first", "no": { "ask": "second" } } },
      "animals":   { "specimens": [ … ], "layout": "six", "key": { "chain": ["six-legs", …, "moist-skin"], "else": "x", "asked": "asked-animal", "elseHeading"?: "none" } },
      "classmate": { "specimens": [ … ], "layout": "six", "key": { "arrangement": { "a": { "heading": "insect", "members": [ … ] }, …, "x": { "heading": "none", "members": [] } }, "fix": "fix", "suspect"?: "suspect" } }
    }
  }
}
```

- **组**：每个布局的键是一个小写字母（A–F、X……；`u` 留给标本盒），值是这一组的格子：`at`（格子中心：x、z 在盘上，y = 垫面，标本底面落在这里）、`cols` × `rows`、`pitch`（格距）、`pad`（垫子零件：流程图卡的叶子选中它）。
- **键**（只读特征，不读真实类群；`arrangement` 的 fix 除外）：`ask` 控件是 `none` → 全部留在盒里（`u`）；特征真 → A，假 → B。`ask` + `no.ask`：第一问真 → A；否则第二问真 → B；否则 C（第二问 `none` → 其余留在盒里）。`chain` + `asked`（步进 k）：依次问前 k 个，第 i 个第一次为真 → 第 i 个字母；k 个都假：k < n → `u`，k = n → `else`；`elseHeading`：`else` 叶子在流程图卡上按这个真实类群起名（不写 = "Neither / 都不是"）。`arrangement` + `fix`：关 = 数据写的组；开 = 组名（`heading`）等于它真实类群的那一组，没有这样的组 → `heading: "none"` 的组。
- **格子**：组内按 `specimens` 的顺序（标本盒的顺序，不是托盘列表的顺序），第 k 件在列 k mod cols、行 ⌊k ÷ cols⌋（行从后往前），格心 = `at` + ((列 − (cols − 1)/2) × pitch, 0, (行 − (rows − 1)/2) × pitch)。偏移 = 格心 − 家；家 = 零件主 primitive 的 `at` 的 x、z 与零件静止包围盒的底（y），所以标本站在垫子上。模型从 `evaluateSimOnStage` 的零件表读家（`lib/sim/carrier.ts` 对 sort 传零件原表，结果按零件表缓存）。
- **量**（输出的 `from`）：`slots`（向量 `<零件>:x|y|z|shown`：偏移，场景单位；`shown` 0 = 不在这只托盘上）、`layout`（`none` / 布局名）、`count:<组 | u | tray>`、`kinds:<组>`（组里混了几个真实类群）、`wrong`（只对 `arrangement`：所在组的组名 ≠ 真实类群的件数；其他键 NaN，显示 `—`）、`verdict`（`right` / `wrong`：`suspect` 那件在同学的盘上此刻放得对不对；fix 开 = right）、`belongs`（suspect 的真实类群）、`where:<零件>`（`u` / 组字母 / `off`）。`verdict`、`belongs` 只在某只托盘写了 `suspect` 时有，`wrong` 只在有 `arrangement` 时有。
- **先猜后看的"到不了"的状态**：状态输出可写 `"predictOnly": [<状态>]`：这些状态有标签、可作 `predict.options[].means`，模型不会给（"蘑菇进植物组"）；只限 sort 模型。
- **validate**（`sortIssues`）：`trays` 的键 = 托盘控件的选项；`specimens` 的键是带 primitive、不是 context 的零件，`group` 是 `groups` 的键，`traits` 的键是问题；托盘的标本是标本、不重复；**键会问到的特征，托盘上每件都要写**（列出标本与特征）；`ask` / `no.ask` 是选择控件、选项 = 问题（+ `none`），布局有 A、B（两层还有 C）；`chain` 的问题存在、不重复、第 i 个字母在布局里，`else` 在布局里且不是问题的字母，`asked` 是 0 … n 的步进；`arrangement` 的组在布局里、`heading` 是真实类群、成员恰好覆盖托盘各一次，有人的真实类群没有组时要有 `heading: "none"` 的组，`fix` 是开关，`suspect` 是选择、选项都在这只托盘上；有键就要有布局，有布局就要有键，`"*"` 不写布局和键；**容量**：对每只托盘把键读的控件的所有值组合枚举一遍，任何一组件数 > cols × rows 报错（列出组合）；布局：`pad` 是零件、格子不出自己的垫子（垫子的包围盒）、同一布局的组的格子不重叠；状态输出（`layout`、`verdict`、`belongs`、`where:*`）的标签恰好覆盖模型在所有托盘、所有键控件值下能给的状态，`predictOnly` 的状态要有标签、模型确实给不出。
- **示例**：`sample-sort` 的 `parts.json` 由八个积木"标本"（球、珠子、圆环、方块、砖块、瓷片、圆锥、尖刺；虚构特征 round / tall / shiny / flat）、两种布局的毡垫和一个放大的细胞组成；方块用 `scales`、砖块用 `feathers` 表面，细胞组 `scale: { unit: "um", magnification: 5000 }`。

### SpaceScene · 移位（`shift`）

docs/38 §4.3 E-LT2。零件绑定：

```jsonc
{ "output": "slots", "part": ["toy-car", …], "shift": { "ease"?: 0.8, "stagger"?: 0.03, "lift"?: 0.04 } }
```

- **值**：向量输出，键 `<零件>:x`、`<零件>:y`、`<零件>:z`（偏移，场景单位）与 `<零件>:shown`（0 = 隐藏）。`part` 列出的零件里向量没写的 → 不动、照常显示；`shown` 0 → 隐藏，与 `visible` 绑定同一套（不画、不投影、不可点、不标注、本章索引不算"可见"），原地淡出 0.3 s（不沿 explode 方向移出）。sort 模型的 `slots` 就是这种向量，别的模型以后要"把零件挪到模型算出的位置"也照这个形状给（`lib/sim/bind.ts shiftEntry` / `shiftOrder`）。
- **变换顺序**：位置 → 姿态 → `offset` / `rotate` → `play` → **`shift`**（加在最后，与 `offset` 叠加）→ 动画。引线锚点、`__atlas.engine.anchor` 跟着走（同 `offset`；PLATE 立面同 `offset` 一样画静止位置）。
- **过渡**（`lib/sim/shift.ts`，纯函数、有单测）：偏移变化时从此刻的位置出发，`ease` 秒三次缓入缓出，路径是一条拱：y 额外 + `lift` × sin(π × 缓动后的 t)（中点比直线高 `lift`：拿起来、放下）；同一次变化里要动的零件按它们在向量里的顺序依次晚 `stagger` 秒开始（`shiftDelays`；隐藏的、刚从隐藏里出来的不占位次）。隐藏的零件留在原地淡出；再出现时（已经淡没了）直接到新位置淡入。深链接、拍的瞬切、截图、`prefers-reduced-motion`、REFERENCE = 直接终值。
- **测试 API**：`__atlas.engine.shift(partId)` → `{ offset: [x, y, z], target: [x, y, z], shown, delay }`（此刻画出的偏移、目标、是否画着、这一次移动等了几秒；0.1 mm 取整；没有 shift 的零件 null）。`pnpm shoot --beats` 每拍及每个拍链接核对：每件有 shift 的零件此刻的偏移 = 模型向量的值（± 1 mm），模型隐藏的不画，模型显示的（图层开着、没被 hide）画着；不符记为拍失败。
- **validate**：输出是向量（不能是控件）；不是 context 零件；同一零件只有一条 `shift`；不能与 `place` 用在同一零件；时间线不能绑 `shift`。

### SpaceScene · 分类流程图卡

docs/38 §4.4 E-LT3。`sim.kind = "sort"`（有 `sim.sort`）时代替右上的零件链路卡（`hud/KeyCard.tsx`；版式、文字、读屏在 `lib/sim/keycard.ts`：`keyModel`、`keyLayout`、`keySummary`，纯函数、有单测）；标题 FLOWCHART / 分类流程图；< 1024 px 收进试一试卡片里可折叠的一节（同电路图卡、能量链卡、生活史环卡），没有试一试卡的章（背景章）在阅读面板里单独放这一节；手机同其他右上卡隐藏，试一试卡里照常有。

- **版式**（viewBox 宽 280）：一个问题、两个问题、`chain` 画法相同：问题框沿左边竖排（圆角发丝框，字 = 问题的 `label` + "？"），每个框右边一条 YES / 是 线到它的叶子（A、B……），框与框之间一条 NO / 不是 线向下，最后一个 NO 向下到最后一个叶子（一个问题 = B、两个 = C、`chain` = `else`）。还没问到的（`chain` 的序号 > `asked`、选择控件在 `none`："No question asked yet / 还没有问问题"）框和线画虚线、字用 `ink-faint`，叶子照画（件数 0）；`else` 叶子在问完之前也是虚线。`arrangement`：没有问题框，每组一行（字母、组名 = `heading` 的类群标签、件数），有放错件的组下一行 hot 色"✗ 1 wrong / 1 件放错"（**不只靠颜色**），`fix` 开后消失。`tray` 是 `"*"`（没有键）：一行字"32 specimens in the case. Pick a chapter to sort them. / 标本盒里有 32 件标本。选一章来分一分。"有问题的键底部右侧写"IN THE CASE · n / 标本盒里 · n"。
- **叶子**：字母 + 名字 + 件数（`count:<组>`，与 PLATE 同数）。名字：一个问题 A = "Yes: <问题>"、B = "No"；两个问题 A、B = "Yes: <问题>"、C = "Neither"；`chain` 第 i 个 = 第 i 个问题的 `label`，`else` = `elseHeading` 的类群标签（不写 = "Neither"）——新加坡讲义"给组起标题"那一步。
- **选中的标本**（store `part` 是这只托盘上的标本）：它走过的问题框和走过的线描 signal、答案（YES / NO）加粗，落到的叶子实心 signal（`aria-current="true"`）；`arrangement` 下它所在的叶子实心，放错时叶子里另一行"Belongs in: <类群> / 本该在：<类群>"。
- **交互**：叶子是按钮（命中方块 ≥ 54 viewBox 单位 = 卡片画到 82 % 时 44 CSS px；Enter / Space）：点 = 选中这一组的垫子零件（`pad`）。卡片不改控件（问题在试一试卡片里改，免得两处入口）。
- **读屏**：`aria-label` = `keySummary`："Flowchart in this model: Six legs, three body parts? Yes: group A, 2. No: Has feathers? … No: group X, 0." / "这个模型里的分类流程图：六条腿、身体分三部分？是：A 组，2 件。不是：……"；`arrangement` = "group A, 3, Insects, 1 wrong; …"。件数与 ✗ 变化时 0.3 s 淡入（减少动态时不淡）。底下一行 `SIM` + "In this model / 在这个模型里"。
- **i18n**：`space.card.key`、`space.try.key`、`space.key.*`。**测试**：`.space-key[data-kind]`（`ask` / `two` / `chain` / `arrangement` / `none`）、`[data-node][data-pending][data-on]`、`[data-line="yes-0"]`、`[data-leaf][data-count][data-on][data-pending][data-wrong]`、`.space-key__target`。

### SpaceScene · 试一试 · 表（table）

docs/40 §4.2 E-HL1。`sim.kind: "table"`：模型不算，只**按控件查有来源的值**——几个实验，每个实验读几个控件（`keys`），对这些控件的每一种取值组合恰好有一行，行里写它设定的输出和来源。注册走 `SIM_KINDS` → `simQuantities`（`lib/sim/table.ts solveTable`）→ `quantityKind`（`tableQuantity`：格子是状态 id 的输出是状态，否则是数），没有时间线，`SEPARATE_EXPERIMENTS.table = true`（PLATE 块尾只跟本章卡片观察的实验）。纯函数、同步、确定（< 0.05 ms，只在控件变化时算，有单测）。数据与交叉校验在 `table-schema.ts`（`tableSchema`、`tableIssues`、`tableSourceIssues`、`tablePredictIssues`）。完整作者模板：`tests/space-scene/fixtures/heart-lungs-table.ts`（docs/40 §4.2 的整段 `sim` 与 §2.9 全表）；草稿夹具 `sample-heart`（真实 glb；背景章 + 空气、运动、一圈三章）；单测 `tests/space-scene/{table,hz-binding,tidal}.test.ts`、`tests/theme/blood-gas-tokens.test.ts`；e2e `tests-e2e/sample-heart.spec.ts`。

```jsonc
"sim": {
  "kind": "table",
  "controls": [ { "id": "sample", "kind": "choice", "default": "in", "options": [ { "id": "in", … }, { "id": "out", … } ] }, { "id": "activity", … }, { "id": "stop", "kind": "step", "values": [0, 1, 2, 3, 4, 5, 6], "default": 0 } ],
  "outputs": [
    { "id": "o2", "label": {…}, "unit": "%", "decimals": 0, "tag": "typical" },      // tag：typical = 有来源的测量值；sim（默认）= 设计研究的值
    { "id": "beats", "label": {…}, "unit": "/min", "tag": "sim" },
    { "id": "where", "label": {…}, "kind": "state", "states": { "whole": {…}, "in-lungs": {…}, … } }   // 不写 from：表按输出 id 给值
  ],
  "table": {
    "experiments": {
      "air": { "keys": ["sample"], "rows": [
        { "when": { "sample": "in" },  "set": { "n2": 78, "o2": 21, "co2": { "value": 0.04, "decimals": 2 }, "h2o": 1 }, "source": ["S3", "S4"] },
        { "when": { "sample": "out" }, "set": { "n2": 78, "o2": 16, "co2": 4, "h2o": 6 }, "source": ["S5", "S6", "S8"] } ] },
      "effort": { "keys": ["activity"], "rows": [ { "when": { "activity": "rest" }, "set": { "breaths": 20, "beats": 90, … }, "source": ["S37", "S9"] }, … ] }
    }
  }
}
```

- **求值**：每个实验按 `keys` 取当前控件值找到唯一一行，`set` 里的值进对应输出；所有实验同时求值（没有卡片的章，心跳照样按 `activity` 的默认值跳）。没有任何实验设定的数输出 = NaN（显示 `—`）；状态输出必须有实验设定。
- **格子**：数、状态 id，或 `{ "value", "decimals" }`——只覆盖这一格的显示小数位（吸入 CO₂ `0.04`、呼出 `4`，不写 `4.00`）；表、卡片、PLATE、条形图同用（解析时写进输出的 `decimalsAt`，作者不写；`lib/sim/index.ts outputDecimals(o, value)`）。
- **芯片**：数输出 `tag: typical` 在卡片上带一行 TYPICAL / 典型值 + "Typical values, from the sources / 典型值，出自来源" + 本行 `source` 的上标（`SourceRefs`，点开来源弹层，同 detail 的 `[S#]`）；`tag: sim`（默认）照旧一行 SIM / 在这个模型里；卡片同时观察两种时两行都有，每个读数的名字后再带一枚小芯片。PLATE：跟随 typical 输出的读数后面跟 TYPICAL 芯片与上标；本章卡片只观察 typical 输出时块尾写 `TYPICAL · <控件值>`，否则照旧 `SIM …`（`lib/sim/table.ts outputTag`、`statusTag`）。状态输出不分 SIM / TYPICAL（`tag` 只给数输出）。
- **validate**（`tableIssues`，parts 文件解析时）：`keys` 是控件、不重复；行的 `when` 恰好写全 `keys`、值合法；每个实验对 `keys` 的全部值组合**恰好一行**（列出缺的、重的）；`set` 的键是输出、种类对得上（数 / `{ value, decimals }` 给数输出，带标签的状态 id 给状态输出）；同一实验每行设定同一组输出；一个输出只属于一个实验；输出不写 `from`、只能是数或状态；`count` 绑定的零件 `repeat.count` ≥ 该输出在表里的最大份数（按 `count` 的取整），否则报"not enough balls"；先猜后看的 `change` 只改 `observe` 所在实验的 `keys`（`tablePredictIssues`，章节校验）。**来源**（`tableSourceIssues`，`pnpm validate` 对照 `data/sources.json`）：每个 `S#` 都在；设定 `sim` 数输出的行至少引一条 `design: true` 的来源（`sources.json` 新的可选字段：主题自己的设计研究；`SOURCES.md` 标注 design study），设定 `typical` 数输出的行至少引一条不是设计研究的来源；只设定状态的行引什么都行。
- **测试 API**：`__atlas.engine.sim()` 照旧，表模型多一个 `sources`：`{ <typical 输出>: [S#…] }`（此刻那一行的来源）；`copies(partId)`：`count` 绑定此刻画出的份数。

### SpaceScene · 平面横梁机构（`mechanisms`，beam-steam）

docs/52 §4 E-ST1/E-ST2；完整可运行作者例子在 `src/content/topics/sample-mechanism/data/parts.json`，生成器 `src/content/topics/sample-mechanism/generate.mjs`（`node` 直接运行；包括齿廓采样检查）。这是可选的根字段 `mechanisms`（缺省 `[]`，最多一项），**不增加 sim 种类**：压力、三档静态调速器和归一化能量账仍用 `sim.kind: "table"`。不增加 URL 字段、HUD、键位、齿轮 primitive 或通用物理引擎。

机构对象、clock、geometry、parts 的 role 与 ports 均拒收未知键。以下是根条目开头（`parts` / `ports` 按后面的必需角色补全）：

```json
{
  "id": "main-engine", "kind": "beam-steam", "origin": [0, 5.6, 0],
  "clock": {
    "phaseControl": "phase-deg", "rateControl": "cycle-rate",
    "modeControl": "motion-mode", "experimentControl": "experiment"
  },
  "geometry": {
    "beamPivot": [0, 0], "shaftCentre": [2.5, -3], "radiusPivot": [-2.5, -0.8],
    "beamHalfM": 2.5, "connectingRodM": 3, "orbitM": 0.6092838281609874,
    "shortLinkM": 0.8, "radiusRodM": 1.25, "innerFraction": 0.5,
    "beamBranch": 1, "parallelBranch": 1, "pistonRodM": 2.4,
    "cylinderX": -2.5, "radialDisplayClearanceM": 0.003,
    "nominalStrokeM": 1.2192,
    "pump": { "beamFraction": -0.4, "sliderX": -1, "rodM": 4.5 }
  }
}
```

- **控件**：phase 是 `step` `[0,90,180,270,360]`；rate 是 `step` `[8,10,12]`；mode 是 `choice` `manual/auto`；experiment 是 `choice` `pressure/mechanism/governor/energy`。控件 id 可改，但须由 clock 引用；标签与选项仍须双语。不把非整步 QA 角写入控件。
- **必需的 parts 角色**：`beam, innerLink, outerLink, bottomLink, radiusRod, driveRod, centreLink, piston, pistonRod, planet, sun, shaft, flywheel, pumpRod, pumpPiston`，每个恰好一次，目标 part 不重复。杆角色（beam、四根平行机构杆、driveRod、centreLink、pistonRod、pumpRod）写 `{ "part": "…", "restEndpoints": [[x0,y0],[x1,y1]] }`；端点须是 θ=0 的本地 XY 解。其余只写 `{ "part": "…" }`。几何按 θ=0 装配，world XY = 本地 XY + origin；part 自己的 `at` / `rotation` 保留静态深度和形状方向。
- **独占驱动**：机构与阀芯目标须是独立 primitive（可带 extra）；不与 repeat/bilateral、mesh/rig、独立动画、命名 pose（含章/拍/sim）或 offset/rotate/play/shift/stretch/bend/fill 绑定共用。刚杆用平移和绕 Z 旋转，不缩放。固定汽缸、支架与阀体不登记动态角色。
- **四端口**：`ports` 恰有 `upperIn/lowerIn/upperOut/lowerOut`。每项如 `{ "part": "valve-upper-in", "openOffset": [0,0.015,0], "flow": { "id": "port-steam", "path": "upper" } }`。`openOffset` 是世界轴向抬阀向量；一个固定 flow/path 只给一个 gate，不同时受 sim visible/intensity/state/tidal 控制，不加移动端点。
- **求解与校验**：`lib/mechanism.ts` 纯函数 `solveMechanism(thetaRad, geometry, out)` 复用 `createMechanismFrame()` 缓存；圆交点固定 branch，D 的横移保留，太阳与行星相位满足 δs+δp=2θ。死点用实际 dDy/dθ 判断（不是写死 90°/270°），下行只开 upperIn/lowerOut，上行只开 lowerIn/upperOut，切换四口关。`mechanism-schema.ts mechanismIssues` 由 SpaceScene schema 接入 validate：引用/互斥/控件域、4096 帧可达与刚杆残差、32768 帧行程与余隙；错误含 JSON path 和目标 id。
- **每帧顺序**：共享时钟 → 一次求解 → 零件/阀芯刚体变换 → 既有拆开展示偏移 → 标注、点击代理、流和测试读数。四阀与四 gate 取同一 frame；关 gate 当帧路径 opacity 为零，原有路径显隐与 gate 取 AND。运行求解失败则冻结并关四路，显示双语配置错误。
- **运行与恢复**：auto + experiment pressure/mechanism + RUN 才推进；pause、REFERENCE、开始 EXPLODED、isolate、solo、隐藏标签页、reduced motion 都冻结。rate 只改后续斜率；cold/work/governor 不重置相位。manual 或 phase 更改立即 seek；新章/拍从 base⊕beat 的 phase 起步。R/E/isolate/solo 退出从原相位继续；P 额外保存/恢复 `{thetaRad,qaHold}`。无机构主题继续走原路径。
- **链接**：沿用 `ch,b,sim,run,view,pose`；`sim` 整组覆盖拍基线。手动五档可精确静帧分享；auto 链接从声明相位开始，不编码累计运行圈数。无 timeline/replay 就不注册空的 G。

测试 API `__atlas.engine.mechanism(id)`：无机构/未知 id 返回 null；否则返回 `{thetaRad,phaseDeg,cycles,pistonDirection,points,planetAngleRad,sunAngleRad,shaftTurns,ports,linkResidualM,clearanceMarginM,parts,gates}`。`points` 为 A/O/F/P/K/C/B/E/D/S/Q/W 的**未拆开世界米坐标**；`parts[partId].matrix` 是 16 个数的实际绘制矩阵，杆的 `endpoints` 含展示拆开；`gates` 用 `"<flow>:<path>"` 键。`phaseDeg` 在 [0,360)，cycles 和 shaftTurns 保留累计圈数。

`__atlas.engine.seekMechanism("main-engine",45.5)` 仅 QA 瞬态，合法范围为有限 0≤deg≤360，成功返回 true 并保持；360 对应 cycles=1、shaftTurns=2、phaseDeg=0。未知 id、NaN、越界返回 false 且不改状态。用户改 phase/mode 或换章/拍清除 QA hold；读取不改状态。`pnpm shoot sample-mechanism --beats --keys --layout` 复用既有检查，每拍与拍链接另查实际绘制杆长/方向、物理残差、齿相位、阀/门控一致和关路无粒子；用 `--shots` 的 `js` 调 seek 保存齿轮/阀门静帧。全周期、阀芯位移与恢复由 `tests-e2e/sample-mechanism.spec.ts` 读绘制矩阵与流状态验收，不以截图或纯函数结果替代。

### SpaceScene · 动画频率（`hz`）与整条流的强度

docs/40 §4.3 E-HL2。两条新绑定，任何模型都能用：

```jsonc
{ "output": "breaths", "animation": ["breathe", "breathe-left", "diaphragm-breathe", "ribs-breathe"], "hz": { "per": 0.0166667 } },   // 次 / 分 → Hz
{ "output": "beats", "animation": "heartbeat", "hz": { "per": 0.0166667, "origin": 0 } },
{ "output": "blood-pace", "flow": ["heart-right", "to-lungs", "from-lungs"], "intensity": { "full": 1 } },                        // 数输出 → 整条流
{ "output": "muscle-need", "flow": ["oxygen-muscle", "co2-muscle"], "intensity": { "full": 1, "mode": "density" } }
```

- **`animation` / `flow` 可写数组**：一条绑定管几条动画 / 流（`enabled`、`rpm`、`hz`、`visible`、`stops`、数输出的 `intensity` 都可以）；`paths`、场线 `state`、向量 `intensity` 仍只写一条流。
- **`hz`**：频率 = (值 − `origin`) × `per` Hz，夹在 0–4（`lib/sim/bind.ts animationHz`）。`pulse` / `oscillate` / `contract` 按这个频率播；`sequence`（要 `loop`）按"每秒几个循环"缩放时间轴，循环长度 = 最后一个 key 的 `t`。不能绑 `rotate`（用 `rpm`）、rig 关节的动画、控件或非数输出。**时钟**（`lib/sim/hz.ts`，`stages/model3d/AnimClocks.tsx`）：每条动画一个时钟，每帧在零件和流之前推进：被 `hz` 绑定的动画按缓动后的频率（约 0.5 s 到位）**逐帧积分相位**，换值不跳；舞台把相位换回动画自己的时间（`clockTime`），原有的采样（脉动、摆动、收缩、关键帧）照常；同一条绑定的几条动画步长相同，始终同相。没有 `hz` 绑定的动画照旧读共享的运转时钟（逐位不变）。深链接、拍的瞬切、截图、`prefers-reduced-motion` 直接到绑定的频率；`enabled` 绑定照旧缓停（时钟同时记它的 `on`，潮汐流跟着停）。
- **数输出的 `intensity`**：这条流的每条路径同一倍数——`speed`：粒子速度 × 值 ÷ `full`（夹在 ±2，负值反向）；`density`：可见粒子比例 = 值 ÷ `full`（≤ 1）；< 1 % 淡出；相位逐帧积分、变速不跳（同向量强度，`lib/sim/bind.ts` `SimFlowEffect.uniform`）。一条流只能有数强度或向量强度之一（validate）。
- **测试 API**：`__atlas.engine.animation(id)` → `{ hz, phase, on }`（此刻的频率、循环相位 0–1、开着的程度）；`flow(id)` 多一个 `pace`（数强度给这条流的倍数）。`pnpm shoot --beats` 每拍及每个拍链接核对：每条有 `hz` 绑定的动画此刻的 `hz` = 绑定值（± 1 %），不符记为拍失败。

### SpaceScene · 潮汐流（tidal）

docs/40 §4.4 E-HL3。流的可选字段：

```jsonc
{ "id": "air-right", "paths": [ … ], "speed": 0.12, "color": "token:air", "tidal": { "sync": "breathe" } }   // 或 "tidal": { "hz": 0.33 }
```

- 粒子不绕圈，一进一出：沿路径的速度 = `speed` × 强度 × sin(2π φ)，φ = 被同步的动画（`sync`）的循环相位（`sequence` 的 t ÷ 循环长度；被 `hz` 绑定时就是它积分的相位），或流自己的 `hz`。前半周期向路径终点（肺在胀），后半周期回来；一次呼吸的往返距离 = `speed` × 强度 ÷ (π × hz)（心肺：空气强度 = 呼吸 ÷ 20、频率 = 呼吸 ÷ 60，所以每种活动走的距离一样）。`lib/sim/tidal.ts` 纯函数；`Flows.tsx` 把位移积分进每条路径已有的相位 uniform，shader 不变。
- 两端一律淡入淡出（`ends: fade`）；被同步的动画停了（RUN 关、`enabled` 绑定缓停）粒子跟着停；`prefers-reduced-motion`：粒子不动。可以和数 / 向量 `intensity`、`visible` 同用。
- **validate**：`sync` 是存在的动画；不能有颜色 `stops`、不能 `ends: open`。**测试**：`tidal.test.ts`（相位 → 速度符号、一周期净位移 0、换频率不跳、随动画停、两端淡出）。
- **`flat: true`**（任何流的可选字段，与 E-HL4 的两种红配套）：dark plate 上也不发光——普通混合、没有白芯，粒子保持自己的颜色（默认的 cinema 流是叠加混合 + 白芯，深酒红会被洗成粉白、和鲜红分不开）；paper 不变。心肺的血流都写 `flat: true`（`flowMaterial.ts styleFlowMaterial`）。

### SpaceScene · 试一试 · 太阳、地球与月球（orbit-rotation）

`docs/44 §4` 的 E-SEM1–3。完整可解析模板是 `src/content/topics/sample-orbit/data/parts.json`（draft，13 controls、23 outputs、13 selectable parts、2 overlays）；8 章 / 39 拍覆盖三种观察窗、真尺度、离交点、偏食、环食、全月食。正式发布内容见 `src/content/topics/sun-earth-moon/`；实际相机使用 lab 坐标系的显式数字，跨实验不要把同名预设误当成自动跟随天体的坐标变换。

注册：`SIM_KINDS` → `simSchema.orbitRotation`（`orbit-rotation-schema.ts`）→ `simQuantities` / `evaluateSim`（`lib/sim/orbit-rotation.ts`）→ `quantityKind` / `ORBIT_STATES`（`orbit-constants.ts`）→ `SEPARATE_EXPERIMENTS['orbit-rotation']=true`。没有 timeline channels；`evaluateSim(sim, values, observe, frames, parts, {timeSeconds})` 在原五参数末尾增加可选 context，旧模型不读它。未知输出和种类不符都报错，不依赖缺量回退。

配置严格使用 `version:1, model:"idealised-circular", units:"km-s-deg", frame:"atlas-ecliptic-y-up"`；`controls` 的键是 `lab, elapsed, year-angle, lunar-angle, spin-angle, obliquity, lunar-tilt, node-angle, observer-lat, moon-range, synchronous, scale-mode, day-index`，值是一一对应的 control id。值集见完整模板 / docs/44 §4.2。只有 `solarYear.control` 可以超出旧 24 项上限，必须是完整有序的 1..365；其他 kind / 控件仍最多24项。全年的验证只遍历日期，避免与无关实验输入作笛卡尔积。

```json
{
  "solarYear": {
    "file": "singapore-sun-2026.json", "control": "day-index", "year": 2026,
    "lat": 1.3342, "lon": 103.7357, "zoneHours": 8, "thresholdDeg": -0.833, "source": "S33"
  },
  "panel": {
    "byLab": { "moon": "phase", "eclipse": "apparent-discs", "local-year": "solar-year" },
    "north": "earth-axis"
  },
  "sources": ["S8", "S9", "S10", "S33", "S36"]
}
```

这是 `orbitRotation` 中的三个字段，不是另一个 sim。年表放主题 `data/`，从研究原文件复制所有365行，只编辑说明元数据；构建时 `linkOrbitTable` 消耗配置的本地文件，校验后装入 `solarYear.table`，浏览器只读已打包数据，不另发请求。作者不手写 `table`。文件名不能含路径、协议、查询串；完整日期、时刻顺序、坐标、阈值和时区都校验。不能用已取整日落减日出替换 `daylight_minutes`。S33 是计算来源，S36 是 `design:true` 的公式/假设来源；不把年表标 TYPICAL。现有 source-id 规则不允许前导零，所以本题来源 S08 / S09 在作者数据中写 S8 / S9。

```json
[
  { "output": "body-frame", "part": "earth-body", "bodyTransform": { "body": "earth", "attachment": "centre" } },
  { "output": "body-frame", "part": "near-side-mark", "bodyTransform": { "body": "moon", "attachment": "surface", "localDirection": [1,0,0], "surfaceFactor": 1.006, "scaleWithRadius": true } },
  { "output": "solar-directions", "part": "moon-body", "solarIllumination": { "body": "moon", "darkFill": 0.035 } }
]
```

这些是 `sim.bind` 项。`bodyTransform.labelPoint` 可选，指定附件局部几何内的标注点；跟随同一四元数与几何缩放，不移动模型或 bounds。例如地轴 `[0,1.35,0]` 指向轴端。天体、轴、赤道与标记都使用父体半径为1的局部几何。`surface` 要非零 direction、正 factor≤1.1；`centre` 不写 direction / factor；observer 只能 centre，用地球显示半径安放。绝对位置已包含 parent。`body-frame` 是32个固定点键 `earth.xKm`、`earth.qw`、`earth.radiusKm` 等；`solar-directions` 是6个 `earth.x/y/z`、`moon.x/y/z` 键。向量由求解器产生，不是作者输入。非单位四元数 / 缺键检查见 `validateBodyFrame`。

`bodyTransform` 与 guide writer 的零件禁止重复写变换、pose、动画、explode、offset、rotate、shift、place 或 play；普通显隐和 selection 保持原行为。`OrbitDriver` 更新既有可选 mesh，guide primitive 在首帧由同一节点的动态几何替换，不画第二份锚点。可选 orbit-guides `radius` 为地球显示半径的管半径比例（未写保留 0.012），`labelAnchors: "strokes"` 将平面/地球轨道标注锚在法线端/轨道采样点（未写保留 bounds 中心）。`orbitRotation.panel.shadowNote` 可选双语卡内说明，均默认不影响已有主题。轨道128段；零倾角不画交线，并写“平面重合”。Earth / Moon 的解析太阳明暗覆盖棚灯输出，暗侧填光≤0.05；太阳自发光，不投假点光源影子。所有颜色取已有双主题 token。

```json
[
  { "kind":"orbit-guides", "group":"orbital-guides", "parts":{"earthTrack":"earth-track","lunarTrack":"lunar-track","plane":"orbital-plane","nodes":"node-line","rays":"light-ray-guide","ruler":"scale-ruler"}, "axes":true,"tracks":true,"nodes":true,"incidence":true,"terminators":true },
  { "kind":"orbit-eclipse-shadow", "group":"orbital-guides", "bodies":{"source":"sun","planet":"earth","satellite":"moon"}, "localFrame":"earth-moon", "labs":["moon","eclipse"] }
]
```

两种 overlay 沿用 ≤4 上限、when 和 group 引用。phase 是地心北朝上球面射线视图，主相机不旋转它；食遮暗与几何亮部读数分列。apparent-discs 是模型地表点的同角度尺视盘；地平下仍可算几何食型，但写“地平下的排列”。shadow 用物理半径、距离与有限太阳切线在独立同尺度图内画本影、半影和伪本影；不和示意放大球接线。全年图只读365行，固定720–735 min，标“纵轴放大区间”，指针与44px前后日按钮都调用既有 `setSim`。

`orbit-session.ts` 每个 scene 一个会话，会话里的钟 `{seedSeconds,elapsedSeconds,running}` 跟 store 的 `run` / `orbitTime` 同步。stage 在 parts 前推进同一个 t / snapshot，HUD 读同一 outputs。单帧Δ≤0.05s，后台恢复清基准、无补跑，maxSeconds夹住停；暂停按需绘制。除 scale 外改控件停并回 elapsed seed；scale 只映射 display，保持物理 snapshot 实例。coupled/year 用太阳显示原点，其余实验用地球原点；真尺度保持统一 m/km。近景与总览相机在尺度变化时重映射；初始章/拍链接直接使用作者给出的目标镜头。eclipse/local-year 的运行命令禁用。

URL `orb-t=21600.123456`：有限十进制、≤6小数、范围0..31557600；加载暂停，非法回seed。章→拍→URL sim→orb-t，换章/拍清时间；REFERENCE 暂停并保持t，演示退出恢复 controls / t / run。URL只在状态变更 / 暂停同步，不逐帧写。新 kind 不接 timeline 的“终态重播”。

测试 API：`engine.orbit()` 给 snapshotId / t / running / lab / scale、physical km与四元数、display m与倍率、实际 world matrix / uniform 反读的 rendered，以及 panel / shadowFrame；NaN 在此 hook 为 null，附不适用说明。`engine.orbitSeek(seconds)` 验范围、暂停并请求首帧直达；等 `rendered.snapshotId === snapshotId` 再比图。`engine.sim()` 仍保留原字段，outputs 读共享动态 snapshot。`pnpm shoot --beats` 收录 orbit / outputs，与每个 ch+b 直链比较，另比实际矩阵、太阳 uniform、真尺度、北朝上和影窗同尺度。

测试：`tests/space-scene/orbit-rotation.test.ts`（T01–T28、365日期异常、旧24项上限、39拍、clock/context/URL/restoration），独立CC0 `fixtures/orbit-oracles.json`；`tests-e2e/sample-orbit.spec.ts`（9项）。浏览器与性能验收状态以 docs/44 §9 为准，不能把纯函数通过当渲染通过。

### SpaceScene · 试一试 · 种子（seeds）

docs/41 §4.2–§4.3 E-S1。`sim.kind: "seeds"`：开花植物的种子三件事，三个子模型各自可选（数据里没写的不提供它的量）——`dispersal`（选一个果实 → 它靠什么传播、哪个结构帮了忙）、`timing`（实验室的一个温度 → 一半发芽的中位天数；第 d 天到了没有）、`cups`（萌发测试：几杯种子各在什么条件下 → 查看那天发没发芽、幼苗什么颜色、两杯之间改了几样）。模型只把**有来源的事实按规则组合**（docs/41 D8–D9：哪些条件下发芽、实测的中位天数、NParks 写的传播方式），不编数字。注册走 `SIM_KINDS` → `simQuantities`（`lib/sim/seeds.ts solveSeeds`）→ `quantityKind`（`seedsQuantity`；状态表 `seedsStates`：按子模型读的控件穷举出会出现的状态），没有时间线（`simTimelineChannels` 为 null），`SEPARATE_EXPERIMENTS.seeds = true`（三套互不相干：PLATE 块尾只写本章卡片观察的状态）。纯函数、同步、确定（一次求值 < 0.05 ms，有单测）。严格数据与交叉校验 `seeds-schema.ts`（`seedsSchema`、`seedsIssues`）。完整作者模板：`tests/space-scene/fixtures/seeds-bench.ts`（docs/41 §4.2 的整段 `sim`，按 §0.3 改成四杯 A、B、D、E；另有 §2.6 初稿的五杯 `FIVE_CUPS`）；草稿夹具 `sample-seeds`（背景章 + 传播、温度与天数、四只杯三章）；单测 `tests/space-scene/seeds.test.ts`、`tests/theme/seedling-token.test.ts`；e2e `tests-e2e/sample-seeds.spec.ts`。

```jsonc
"sim": {
  "kind": "seeds",
  "controls": [
    { "id": "fruit", "kind": "choice", "default": "angsana", "options": [ { "id": "angsana", … }, … ] },   // = dispersal.fruits 的键
    { "id": "temp", "kind": "step", "values": [14, 17, 20], "default": 20, "unit": "°C" },          // = timing.medians 的键
    { "id": "count-day", "kind": "step", "values": [0, 1, …, 12], "default": 0, "unit": "d" },
    { "id": "cup", "kind": "choice", "default": "a", "options": [ "a", "b", "d", "e" ] },           // = cups.set 的键
    { "id": "against", "kind": "choice", "default": "a", "options": [ "a", "b", "d", "e" ] },       // 同上，另一个控件
    { "id": "day", "kind": "step", "values": [0, 7], "default": 0, "unit": "d" }                    // 含 cups.after
  ],
  "outputs": [
    { "id": "method", "kind": "state", "from": "dispersal:method", "states": { "wind": {…}, "water": {…}, "animals": {…}, "splitting": {…} } },
    { "id": "half-day", "from": "timing:median", "unit": "d", "decimals": 1 },
    { "id": "changed", "kind": "state", "from": "cups:changed", "states": { "same-cup": {…}, "water": {…}, "warmth": {…}, "light": {…}, "more-than-one": {…} } },
    { "id": "grown-d", "from": "cup:d:grown" }, { "id": "pale-d", "from": "cup:d:pale" }, …
  ],
  "bind": [
    { "output": "grown-d", "part": "seeds-d", "visible": { "eq": 0 } },
    { "output": "grown-d", "part": "seedlings-d", "visible": true },
    { "output": "pale-d", "part": "seedlings-d", "tint": { "color": "token:seedling-pale", "full": 1, "max": 0.85 } },
    { "output": "method", "flow": "seed-burst", "visible": { "eq": "splitting" } },
    { "control": "fruit", "part": ["rubber-capsule", "rubber-seeds"], "pose": { "rubber": "capsule-burst" } },
    { "output": "half-day", "part": "half-flag", "offset": { "axis": [1, 0, 0], "per": 0.01, "origin": 0 } }
  ],
  "seeds": {
    "dispersal": { "fruit": "fruit", "fruits": { "angsana": { "method": "wind", "feature": "wing" }, … } },
    "timing": { "temp": "temp", "day": "count-day", "medians": { "14": 9.4, "17": 6.5, "20": 4.3 } },
    "cups": { "cup": "cup", "against": "against", "day": "day", "after": 7,
              "places": { "windowsill": { "warm": true, "light": true }, "cupboard": { "warm": true, "light": false }, "fridge": { "warm": false, "light": false } },
              "set": { "a": { "water": true, "air": true, "place": "windowsill" }, "b": { "water": false, … }, "d": { …, "place": "cupboard" }, "e": { …, "place": "fridge" } } }
  }
}
```

| 子模型 | 读的控件 | 量（`from`） | 规则 |
|---|---|---|---|
| `dispersal` | `fruit` 选择 | `dispersal:method`（`wind` / `water` / `animals` / `splitting`）、`dispersal:feature`（`wing` / `floats` / `eaten` / `bursts`） | 所选果实那一行（两个取值集是固定的：课纲 P5 的四种传播方式、P6 的结构适应） |
| `timing` | `temp`、`day` 步进 | `timing:median`（天）、`timing:half`（`fewer` / `half-or-more`） | m = `medians[temp]`；half = day ≥ m（中位数那天本身算到了）。Silwal 的中位数是"最终发芽的种子里有一半"的天数（docs/41 §0.3-3），标签照这个写 |
| `cups` | `cup`、`against` 选择，`day` 步进 | `cups:result`（`waiting` / `germinated` / `not-germinated`）、`cups:against-result`、`cups:seedlings`（`none` / `green` / `pale`）、`cups:changed`（`same-cup` / `water` / `air` / `warmth` / `light` / `more-than-one`）、`cup:<杯>:grown`、`cup:<杯>:pale`（1 / 0） | 一杯发芽 = 有水 ∧ 有空气 ∧ 所在处温暖（**光不在规则里**）；day < `after` 一律 `waiting`；发芽的杯在有光处 `green`、否则 `pale`；`changed` 比较所选杯与 `against` 杯的水、空气、温度、光：都同 → `same-cup`，恰一样不同 → 那一样，≥ 2 样 → `more-than-one`（不是公平测试） |

- 另有 `control:<步进或开关>`（PLATE 回显：`day-now`、`temp-now`），telemetry 写 `scope: "observe"` 时只在观察它的那一章有数。
- **validate**（`seedsIssues` + `sim-schema.ts`）：至少写一个子模型；控件存在且种类对（`fruit` / `cup` / `against` 选择，`temp` / `day` 步进，`cup` ≠ `against`）；`fruit` 的选项 = `fruits` 的键、`cup` 和 `against` 的选项 = `set` 的键（多、少都报）；`method` / `feature` 只能是上表的值；`medians` 的键 = `temp` 的每个值（写成控件的数：`14`，不是 `14.0`），值 > 0；天数步进的值 ≥ 0；`after` 是 `day` 的一个值；每杯的 `place` 在 `places` 里；**两杯条件完全相同报错**（拿它们比什么也没改，`changed` 会把两只杯说成"同一杯"）；输出 `from` 是本模型的量（没写的子模型、不存在的杯都报）、种类对；状态输出给每个**会出现**的状态写标签，**不写永远不会出现的状态**（四杯里没有哪两杯只差空气，写了 `air` 报错）。
- **绑定**全部复用：`visible`（数与状态的 `eq`）、`tint`（`max`）、`offset`（`origin`）、`pose`（只映射自己的选项）、流的 `visible`。一个零件一次只取一个姿态（几条 `pose` 绑定动同一零件时后写的那条胜出）：橡胶树果的 `capsule-burst`、凤仙果荚的 `pod-split` 要把"移到台前"也写进去，不要再给同一零件另写 `rubber-front`。`tint` 只染零件自己的材质（槽 0）：幼苗的茎和子叶用同一种材质，才会一起变淡黄。
- **测试 API**：`__atlas.engine.tint(partId)` → `{ color, level }`（试一试 `tint` 绑定此刻画出的目标色 sRGB hex 与混色程度 0–1，三位小数；没有 tint 绑定 null）。`pnpm shoot --beats` 每拍及每个拍链接核对：每件有 `tint` 绑定的零件此刻画出的程度 = 绑定值（± 0.01），不符记为拍失败。

### 章节怎么写（`state`）

```yaml
state:
  view: exploded        # assembled | xray | exploded | isolate
  explode: 0.8          # 0..1，只在 exploded 视图生效
  part: compressor      # 选中零件；null 取消
  run: true             # 通电：播放 animations + flows（渐入渐出）
  cutaway: half         # none | half | views.cuts 里的名字
  pose: wings-open      # 可选：parts.json poses 里的姿态（不累积：不写 = 静止）；null = 静止
  ghost: [exoskeleton]  # 可选：淡显的组或零件（不累积）
  layers: [refrigerant, air]   # 可见的组
  labels: [compressor, "group:outdoor"]   # 可选：本章引线标注哪些零件（默认：所有可见零件，大件优先，按镜头距离限量）；`group:<组 id>` = 整组一个标注（组锚点）
  hide: [front-panel]          # 可选：本章移开的零件（沿自己的 explode 方向移出 0.25 × dist，后半段淡出，共 .6 s；回来反向）。不累积、不进 URL（store 字段 `hidden`）；被移开的零件不投影、不可点、不标注，PLATE 块立面画虚线框
  camera: { position: [4, 3, 5], target: [0, 0.3, 0], fov: 34 }
  summary: { en: "…", zh: "…" }   # 可选：阅读面板章名下的一句概述，也是没写 beats 时的默认字幕
  question: { en: "…", zh: "…" }  # 可选：孩子会问的问题（没有 summary 时作阅读面板头句 / 默认字幕）
  beats:                          # 可选：演示节拍（P），见「SpaceScene · 演示」；不写 = 一拍（本章 state，字幕 = summary）
    - camera: outdoor             # 命名预设 id（只取它的镜头），或 { position, target, fov }
      part: compressor
      cutaway: half
      pose: jump-flex                     # 这一拍的姿态（不写 = 本章的；null = 静止）
      ghost: [legs-wings]                 # 这一拍淡显的组（不写 = 本章的）
      labels: [compressor, accumulator]   # 这一拍的引线标注（≤ 6，不累积；不写 = 本章的 labels）
      hide: [outdoor-front]               # 这一拍移开的零件（不累积；不写 = 本章的 hide）
      exercise: { id: barbell-bench-press, phase: loop }   # 动作模式（肌肉主题；null = 无；不写 = 本章的）
      highlight: { signal: [pectoralis-major-clavicular], cold: [deltoid-anterior] }   # 高亮（组或零件；不写 = 本章的）；`custom: { <零件或组>: token:<名> | "#hex" }` = 任意颜色的染色（碘液、红墨水实验）
      sites: [pectoralis-minor]           # 显示起止点的肌肉零件（不写 = 本章的）
      caption: { en: "…", zh: "…" }
      audio: /audio/aircon/ch03-1.mp3     # 可选：进拍时播放的旁白文件（站内路径）
  index:                          # 可选（docs/08 §2 铁律 e：章节提到的对象都要能从阅读面板点到）：正文之后的本章索引
    parts: [compressor, condenser-coil]          # 零件（非 context）：编号、短名、一行说明；点 = 选中，详情出现在章头下
    exercises: [barbell-bench-press, push-up]    # 或动作（training.json 的 exercises）：按器械分组（杠铃、哑铃、徒手、绳索、器械）、
                                                 # 草图缩略图、名称、器械、主动肌短名；点 = 动作模式，动作卡出现在章头下；之后接 training.session
```

`pnpm validate` 核对 `index.parts` 是零件（不是 context）、`index.exercises` 在 `training.json` 里。

章节目标照常累积（`labels`、`hide`、`pose`、`ghost`、`exercise`、`highlight`、`sites` 不累积，只看本章；这三项肌肉主题字段在章 state 与拍里写法相同）。**镜头规则**（`lib/camera.ts transitionCamera`，有单测；CameraRig 订阅 store，transition 一发出就按顺序处理，所以同一 tick 里先 `setPreset` 再 `setMode`（snap）也落在预设镜头上，截图脚本不需要延时）：切章 / 首次加载 / URL：本章自己写了 `camera`（或 URL `cam=` 与本章基线不同）就用它；否则 `views[当前 view].camera`；都没有就沿用。**预设（VIEW 按钮 / 数字键）永远落在该预设的镜头上**（P1 遗留问题：本章没有自己镜头时，基线是继承来的，曾被误判成"非显式"而飞去视图预设；已修）。模式切换（X / E / C / F）不动镜头。较窄的舞台（宽高比 < 1.6：HUD 占去两侧的桌面、平板、竖屏手机）自动把镜头往后拉（手机竖屏、宽高比 < 0.8 时 HUD 叠在上面，模型独占整宽，拉回量渐减到一半），回写 URL 时换算回来，链接与设备无关。**封面镜头**：演示以外隐藏 HUD（H、`pnpm shoot` 的 `hero-clean`）时 0.8 s 飞到 `views.cover`；没写就沿当前视线方向重新取景，让模型包围球占舞台宽 75 %（宽屏上最多超出高度 30 %，`fitSphereCamera`），舞台尺寸变了再重算；显示 HUD 时 0.8 s 飞回离开时的镜头——中间换过章、按过预设或拖过镜头就不飞回。章节镜头按带 HUD 的舞台取景：模型放在 HUD 块之间的空带里（1600×900 约 590 × 680 px），给引线标注留位置；封面镜头按满屏取景（模型约占宽 70 %）。

可选 `views.hudFrame: { "parts": ["earth-body", "moon-body", "sun-body"] }` 启用实际 HUD 自由区取景（默认关闭，既有主题镜头保持原行为）。仅列需要保住的真实可选主体；作者镜头完全排除的对象不被重新拉入近景。舞台测量当前标题、PLATE、观察卡、抽屉/章节轴等可见 `data-hud-panel`，右侧 overlay 按实际卡片测量；在已有宽高比后拉之上，保持视线方向与 fov，按各对象深度求最小后拉及横/纵平移，使包围盒落入留有 12 px 间隔的自由矩形。尺寸、卡片折叠、HUD/演示切换会重算，始终从作者镜头出发；拖拽后交还自由相机。适用边界：自由矩形必须非空，故意出画的对象不强行收入。纯函数及透视投影回算见 `tests/space-scene/hud-framing.test.ts`，浏览器验收仍需单独执行。

### HUD 控件与内容（docs/08 §2、§3）

| 控件 | 行为 |
|---|---|
| 顶栏章节芯片 `01..NN` | 换章，镜头飞到本章镜头（1.6 s easeInOut，target 直线 + 相机相对 target 的球坐标插值，绕着模型转，不穿模）；章节不再是 VIEW 预设 |
| VIEW `ORBIT` | 慢速转台：绕 target 的竖轴 1 圈 / 40 s，1 s 渐入；一拖动即停（→ FREE CAMERA） |
| VIEW 命名预设 | `parts.json` 的 `presets`，排在 `REF.` 之后：飞到预设镜头（1.6 s），有 `view` 时同时切视图；正文 `<FlyTo preset>` 同一动作 |
| VIEW `REF.` = MODE `REFERENCE`（R） | 长焦（fov 16）正视（`views.section`，默认正面），2 s；暂停运转、收起爆炸、隐藏流场；EXPLODED 与 FLOW / SPACE 显式禁用，状态行写 `EXPLODE AND FLOW LOCKED`；再按 R（或 ESC）2 s 回到进入前的镜头与状态；选别的预设 = 退出但不回镜头 |
| MODE `X-RAY`（X） | 有 `shell` 零件的主题：只有 shell 变 .15 透明，其余保持实心（管里的粒子、机内的零件可见）；没有 shell 的主题：未选中零件全部 .15 透明（.3 s）。选中零件永远实心；只有这时材质变透明（forceSinglePass） |
| MODE `EXPLODED`（E） | 2 s easeInOut 拆开到 0.7（或章节值）；拖滑块时快速跟随 |
| MODE `CUTAWAY`（C） | 单剖切面（默认面；章 / 拍可换成命名剖切面 `views.cuts`）；封闭零件的背面画成 `--cut` 赭色 + 屏幕空间 45° 墨色剖面线（像博物馆剖面模型，不是删掉一半）；管、平面、膜不填 |
| MODE `FLOW`（F）= SPACE | run：动画与流场 .6 s 渐入。EXPLODED 时 F 禁用、舞台不画粒子（流路径不随零件拆开，docs/12 §7.5 G16），状态行写 `FLOW OFF WHILE EXPLODED` |
| MODE `PRESENTATION`（P） | core 演示系统，见「SpaceScene · 演示」 |
| `L` | 标注开关（宿主） |
| ESC | 退出演示 → 取消选中 → 取消单显（solo）→ 退出 REFERENCE → 停 ORBIT |

- 状态行追加：选中零件 `#06 SAMPLE DRUM`、`EXPLODE 80`、`CUTAWAY 50`、REFERENCE 时的锁定说明。规格行追加 PARTS / GROUPS / FLOWS（`hud/spec.ts`）；有 `spec` 时是 PARTS + 主题行。标题块声明行 = `topic.yaml` 的 `note`（没有时用全站文案）。
- `card`：零件链路示意（有零件的组 = 列，列号 = 组的分区号；零件 = 带编号节点，context 零件不进；`connects` = 细线）；最长一列 > 10 行时行距从 23 降到 16（字号 10）；选中零件填 signal 色；运转时：有 `parts` 的流把它流经的相邻零件之间的连线染成 `stops` 在该处的颜色（`color-mix`）并步进，没有 `parts` 的流照旧染本组内的连线。
- 原来的三块底部面板（ARCHITECTURE / DETAIL / STATE）已去掉（Gavin 2026-10-11：占地方、DETAIL 常常是空框）：结构和状态并进左列的 PLATE 块，零件详情只在阅读面板里。
- `bottomBar` = **章节轴**（core `ChapterAxis`，见「布局」）：每章一段、每拍一个刻度，右端 `05 · 2/8`（章号 · 当前拍 / 本章拍数，本章自身状态写 `–`）。点段 = `goToChapter`，读者换章（段、芯片、章节轨、← →，非 instant）后在 microtask 里应用本章第一拍；点刻度、`,` / `.`、节拍行 ‹ › = 在**演示之外**应用那一拍：与演示的 `applyBeat` 同一个 `beatScene()`（镜头 1.4 s、图层、ghost、高亮、标注、姿态、剖切、动作、起止点、运转），先退出 REFERENCE、停 ORBIT，不进演示、不藏 HUD、没有字幕卡；拍的镜头算作者镜头（不是 FREE CAMERA；拍写的是命名预设就亮那个预设）。落定后照常可以转、缩；选零件不改拍。store 字段 `beat`（本章第几拍，0 起；`null` = 本章自身状态：instant 换章、没带 `b` 的深链接），URL `b`（从 1 起）；带 `b` 的深链接打开的就是章节轴上的这一拍：`beatScene()`（`lib/beat-scene.ts`）的全部字段——试一试值（拍的 `sim.set` 叠在本章上，读数、PLATE、`play.when` 跟着）、视图、图层、镜头（命名预设就亮那个预设）、hide / ghost / exercise / tints / sites——瞬切，时间线直接是终态；链接自己写了的字段（`transition.fields`：`sim=`、`cam=`、`view=` …）优先，`sim=` 整组替换拍的值。在某一拍时 URL 的基线是这一拍的场景（`SceneControls.urlBaseline`，`b` 本身照写），所以停在拍上的链接就是 `?ch=<章>&b=<n>`，读者改回本章值的字段也会写进 URL，打开后还原成同一个场景（单测 `tests/space-scene/beat-link.test.ts`，e2e `tests-e2e/beat-links.spec.ts`）。P 从当前拍开始演示，退出时放回原来的 `beat`。⌄ 把轴收成发丝线（`panelsOpen`）。引线标注：有当前拍时用这一拍的 `labels`（演示之外不限 6 个）。
- `plate`（左列底部 PLATE / 图版块，`hud/PlateBlock.tsx`，表头可收起，`sessionStorage['atlas:plate']`，手机隐藏）：左 = 立面缩略图（零件包围盒在 `views.section` 上的投影，默认 XY；glb 零件用加载后量到的静止包围盒；组色填充、选中描 signal、被 `hide` 的画虚线框、context 斜线；地面线 + 比例尺，有 `units` 用实长）；右 = 小号 标签–值 行 RUN / FLOW（有流时）/ ANIM / VIEW（REFERENCE、亮着的预设、FREE CAMERA 或 `CH 05`）/ EXPLODE（或主题的 `explodeLabel`）；下 = 一行组色图例（名字截短）；有 `telemetry` 时一枚 `SIM` 芯片 + `标签 值 单位` 连排（x(t) = target + (x₀ − target)·e^(−t/lag)，target = run ? `run` : `idle`，4 Hz 刷新、不加抖动；瞬时过渡直接跳到终值）；再下 = 当前选中一行（`#28 COMPRESSOR`，点它展开阅读面板并滚到详情）；末行 perf（`60 FPS · 16 CALLS · 0.02M TRIS · 1520×1026`，按需渲染空闲时 `IDLE`）。高度 ≤ 760 时不画缩略图、图例和 perf。
- `stageOverlay`：控制面板（`explorer/ExplorerOverlay.tsx`）：LAYERS = 零件组（有零件的组行末带 `⊙` 单显开关，`data-solo`），TOOLS = X-RAY / EXPLODED / CUTAWAY / FLOW / REFERENCE / PRESENTATION / LABELS /（有 `glossary.json` 时）名词表 / 隐藏界面，EXPLODED 时其下出现拆开滑块（44 px 拇指），KEY = 组与流的图例。章节正文里的 `<Term>` 与 TimeScene 相同。
- `readerTop`（阅读面板章头正下方，docs/08 §2 铁律 c、d）：**节拍行**（`explorer/BeatLine.tsx`：`BEAT 2/8` + 这一拍的字幕（页面语言）+ ‹ ›，44 px 命中区；本章没写拍就不画；拍、章、选中零件或动作一变，阅读面板滚回顶部），然后**选中对象**：动作模式时的动作卡（ExerciseCard），选中零件的详情（编号 + 名称 + 另一种语言、说明、了解更多 / 肌肉零件的四页肌肉卡与 SOLO、左右、所属组、相连芯片），hairline 皮肤；什么都没选就什么都不画（不再有提示框，也不再有迷你爆炸图）。
- `readerEnd`（正文之后）：**本章索引**（`explorer/ChapterIndex.tsx`，来自 `state.index`）：`parts` = 编号、短名、一行说明，点 = 选中；`exercises` = 按器械分组（杠铃、哑铃、徒手、绳索、器械，组内按列表顺序）的行：草图缩略图（`/illustrations/exercises/<sketch>.webp`，dark plate 反相）、名称 + 另一种语言、器械 · 主动肌短名，点 = 动作模式（同肌肉卡的动作芯片），动作卡出现在章头下；之后接 `training.json` 的 `session`（标题、每一块的动作（可点）与说明、说明 + 来源）。行 ≥ 44 px，当前的 `aria-pressed`。`detail` 里空行分段；`[S3]`、`[S3, S7]` 渲染成与 `<Num s>` 相同的来源上标（点开宿主的来源浮层；schema 校验编号在 `data/sources.json` 里）。
- `__atlas.stats()` 合并 `{calls, triangles, geometries, textures, fps, gpu}`（renderer.info + 滚动 FPS + WEBGL_debug_renderer_info）。

### 引线标注（`hud/LeaderLabels.tsx` + `lib/leader-layout.ts`，master-spec J）

- 每条：编号 + EN 名（粗、大写）/ 中文 / 一行说明（`summary` 截断）。锚点左边的标签右对齐，右边的左对齐并带小三角；细引线 = 标签边 → 16 px 水平短线 → 直线到投影锚点上的空心圆。锚点 = 零件包围盒中心；单根 `tube`（管路）的包围盒中心常在半空，改用路径一半长度处的点（`shapes.ts anchorPoint`）。
- 舞台每帧（`probes.tsx LabelProbe`）把锚点和零件包围盒的屏幕框（8 个角的投影，`x0 y0 x1 y1`）写进 bridge，HUD 侧只写 `transform` / `opacity` / `d` / `cx` / `cy`；字号、文字宽度与 `[data-hud-panel]` 矩形只在 resize、字体加载、标签集合变化时测量。
- **摆放**（`layoutLeaders`，纯函数，有单测；规则同 TimeScene 的地图引线）：两列对齐。列在 HUD 空带的边上，没有 HUD 块挡着时不超出舞台 22 % / 78 %，并朝本侧锚点（零件屏幕框）收拢。每个标签放在锚点那一侧（空带左右三分之一各归一侧，中间三分之一归近的一列，40 px 迟滞），尽量与锚点齐平。硬约束：在空带内、离 HUD 块 ≥ 8 px、不压别的标签、不压任何被标零件的锚点、锚点在标签的引线一侧、引线 ≤ 舞台宽 35 %。软约束（代价）：与锚点的竖直距离、不压被标零件的屏幕框（别的零件重罚、自己的轻罚）、引线不交叉、不穿过别的标签、上一帧的位置（迟滞，镜头动时不跳）。列里放不下时可以离开列、贴在自己零件旁边（代价更高）。先按优先级贪心放一遍（选中的零件、组、大件），再在其余都放好后把每个标签重放，最多两遍。**允许压在模型上**：没有被标零件的地方可以放；这时文字底下垫一块纸色底板（`.space-co__plate`，0.8 不透明，只在标签框压到某个显示中的零件时出现）。
- 锚点在背后 / 出屏 / 被剖掉 / 被遮挡 / 落在 HUD 块下 → 淡出。遮挡：节流 raycast，每帧最多 2 个，**只查 HUD 可能标注的零件**（`bridge.labelled`），镜头、零件位置、拆开、移开 / 淡入淡出变了才重查；每个零件最多 5 条射线（锚点，再是包围盒中心到四个角的一半、朝镜头那面），有一条到达就算看得见。X-RAY 时不判遮挡；选中零件永远标注、signal 色高亮、不因遮挡隐藏。
- 数量：`labelBudget(镜头距离 / 模型半径)` 3–10 条（近景少），放不下的不画。HUD 之间的空带 < 480 px（720p 笔记本）时只标选中的零件，其余靠右上零件链路卡和点选。手机（< 760）宿主隐藏 `leaders`。
- 点标签（触屏点一下）= 选中零件；标签热区高 ≥ 44 px。
- **组标注**（docs/12 §8 G12）：`labels` 里写 `group:<组 id>` = 整组一个标签：EN 组名（大写）/ 中文组名，不带编号和说明，不可点。锚点 = 组内**可见**零件（含拆开、移开后的实际位置）包围盒的中心（`LabelProbe` 每帧算，不判遮挡），屏幕框 = 这个包围盒的投影，别的标签不压整组。排在零件标签前面。
- **演示之外的当前拍**（章节轴、`,` / `.`、节拍行）：标这一拍的 `labels`（没写就是本章的），不限 6 个、照常按镜头距离限量。
- **演示中**：只标这一拍的 `labels`（没写就是本章的，再没写就是默认的全部可见零件），至多 6 个、不按镜头距离限量，字号 +20 %，不可点（点 = 下一拍）；HUD 隐藏时 `leaders` 照常显示（`.atlas-leaders[data-present]`），**只**把字幕卡和标题块（`data-hud-panel="present*"`）当障碍（HUD 面板淡出时 `visibility` 还留着，不能算），进入演示时立刻重新测量。
- 章节的 `labels` 写 3–6 个在本章镜头下**看得见**的零件（被外壳挡住的会因遮挡淡出；要标里面的零件，本章 `hide` 掉外壳、用 X-RAY，或者用组标注）。`pnpm shoot <topic> --beats` 的 `chapter highlights` 在 1600×900 和 1920×1080 都应是 `all on screen`。
- 测试钩子：每个标签 `data-id`（零件 id 或 `group:<id>`）；有明确列表时 `.space-leaders` 带 `data-want`（`pnpm shoot --beats` 的漏标核对）。

### 演示（PRESENTATION，P；docs/12 §8 G1）

core 演示系统（字幕卡、两级进度条、自动播放、语音、拍键、保存 / 恢复都在 core，见「演示系统（core）」）+ `View.tsx` 里的适配器：

- **节拍**：章节 `state.beats`（schema `spaceBeat`）；没写的章 = 一拍（本章 state，字幕 `summary` > `question` > 章名）。一拍 = 本章目标（`chapterTarget`）叠上拍里写的字段：`view` / `part` / `explode` / `run` / `cutaway` / `layers` / `pose` 覆盖；`hide`、`ghost`、`labels` 只看这一拍（不写 = 本章的）；拍的落定还要等姿态的 `duration`；`camera` = 拍的镜头，或命名预设的镜头（只取镜头，不取它的 `view`），都没有就是本章进入时的镜头（本章镜头 > 视图预设 > 继承）。
- **applyBeat**：`applyState`（reason `state`）一次写入，镜头 1.4 s（`ui.nextTweenMs`），拆开 2 s、移开 .6 s 照舞台原样过渡；返回的 promise 在舞台报告镜头落定（`bridge.settledTransition`，CameraRig 在缓动结束 / 被拖断 / 无需移动时写）且拆开或移开的过渡做完后 resolve，4 s 兜底（舞台还没加载完）。自动播放和语音从这时开始计（core）。`instant`（`goToBeat(i, { instant: true })`、截图）直接跳到终态。
- **进入**（`onEnter`）：从当前拍开始（章节轴上亮着的那一拍；本章自身状态时从本章第一拍）。先记下进入前的场景（`SpaceSavedState`：章、当前拍 `beat`、视图、选中、拆开、运转、剖切、`hidden`、图层、镜头（活镜头，换算回与舞台宽高比无关的值）、ORBIT、亮着的预设与 FREE CAMERA；在 REFERENCE 里进入则记 REFERENCE 进入前的那份），再退出 REFERENCE（不飞回）、停 ORBIT、取消选中。**退出**（ESC / P / H / 显示界面）：`applyState` 放回这些，ORBIT 与 VIEW 预设高亮也放回。
- 演示中 REFERENCE（R）禁用；拍飞行中 core 的输入层挡住舞台，落定后可以旋转、缩放（OrbitControls；停手 400 ms 写回 `camera`，下一拍从那里飞走，过渡时丢弃未写回的那次）；点零件 / 空白处不改这拍的 `part`（`View.tsx` 订阅 store，演示中非过渡的 `part` 变化立即改回），也不翻页；引线标注见上一节。
- 语音、自动播放、音频文件、`__atlas.beats / goToBeat / setAutoplay / setVoice / voiceLog / state().presentation` 都来自 core，不需要引擎代码（e2e：`sample-space PRESENTATION …` 两条，含假 `speechSynthesis`：拍落定后才读、读完才进下一拍）。

### 交互（舞台）

- 点零件选中（拖动结束在零件上不算点击）；点空白处取消；拖动（OrbitControls，带阻尼）旋转，停手 400 ms 后 `setCamera()` 回写 URL（→ FREE CAMERA）。
- 零件引线标注的 ≥44 px 文字热区原地点按选中，拖动仍交给舞台旋转；引线、锚点和整组标注不接收指针，从它们上面拖动或松手不会挡住镜头。
- 缩放下限默认是模型半径（非 context 零件）的 0.9 倍；章、拍、预设或封面镜头比它更近时，下限降到那个镜头距离的 70 %（`CameraRig` `relax`），放大的子模型、小展品的近景不会被推远；下一个更远的作者镜头恢复默认。上限仍是默认下限的 20 倍。
- 悬停零件：signal 色弱边缘；触摸长按 ≥ 400 ms 选中。选中：signal 色菲涅尔边缘 + 极淡染色（paper 边缘清晰；dark plate 边缘发光 ≤ .35，不脉动）。
- 视图：`xray` 未选中零件透明 .15；`isolate` 只显示选中零件和同组零件；图层开关对所有视图生效（包括选中的零件）。可见性规则在 `lib/visibility.ts`，有单测。

### 实现约定

- R3F 用 `createRoot` 驱动，不用 `<Canvas>`：`<Canvas>` 会 `extend(THREE)` 整个命名空间，tree-shaking 失效（多 ~50 KB gz）。新用到的 three 类要在 `stages/model3d/extend.ts` 里登记，否则 JSX `<xxx>` 会报 "not part of the THREE namespace"。
- 舞台是独立 reconciler，React context 不穿透：store、ui、bridge、data、主题 look 都以 props 传入 `SceneRoot`，组件里用 `zustand` 的 `useStore(store, …)`。
- 渲染：ACES Filmic + sRGB；pixelRatio = `min(dpr, 3840 / innerWidth, 2)`；灯光 = 一盏大柔 key（唯一投影光源，阴影相机按模型包围盒收紧，PCF 软边）+ 弱 fill + 中性 rim + 半球 + RoomEnvironment（无网络、无 HDR 文件）；paper 暖 key，dark plate 冷 key + 稍强 rim；雾色 = 纸色。只有大件（≥ 模型半径 28%）投影；地面 = 径向接触阴影 + ShadowMaterial 接影面，随拆开下移。`shadowMap.autoUpdate = false`，拆开 / 淡入淡出 / 剖切 / 可见性 / 运转中的投影件变化时才 `needsUpdate`。
- 材质：每个零件一个 MeshPhysicalMaterial（同一 shader 补丁、同一 program cache key）：选中边缘（菲涅尔，`uSel`）和剖面填充（背面 + `gl_FrontFacing`，`uCut`）都在片元里，零额外 draw call。
- `frameloop: 'demand'`：只有在缓动（拆开、淡入淡出、运镜、转台、标注滑动 / 遮挡复查）、运转时才请求下一帧；标签页隐藏时不请求。每帧路径不 new 对象（模块级临时向量、预先算好的拆开向量与动画轴）。几何体、材质、贴图都由我们创建并在卸载时 dispose。
- 示例（sample-space）：第 03 章两拍（一拍 `hide` + 三个零件标注，一拍命名预设 `sample-left` 的镜头 + 两个组标注），两个命名预设，正文一个 `<FlyTo>`；第 04 章 = 生物特性（sweep 躯干带 U 领片与空心管、双侧的眼 / 腿 / 翅、腿绕髋关节摆动、姿态 `sample-open`、命名剖切 `sample-cross`、淡显机器，三拍），`units` 25 cm / 单位。
- 计数（sample-space，1920×1080；18 个零件（3 对双侧）+ 1 个 context 墙）：静止 25–27 draw calls、~45 k 三角形；FLOW +2 calls。
- 包体：舞台 chunk ~225 KB gz（three + R3F 为主；圆角盒用 `RoundedBoxGeometry`；写实轮次的 `extrude` / 贯流叶片引入 `ExtrudeGeometry` / `Shape` 一族，+10 KB，`panelHole` 仍手工三角化）。GLTF 加载器单独成 chunk（21 KB gz），只有写了 `mesh` 的主题才加载。

## MathScene（讲解优先的课，docs/15 §10）

`engine: math-scene`、`stage: svg`、`mode: lesson`（索引页徽章"Lesson / 课"；卡片统计 = 步数 · 讲解节拍数 · 练习题数）。2026-10-11 起的形态：每章（一步）= 3–5 个**讲解节拍** + 1 个**章末小测**（从这一步的题库 8–10 道里随机抽一道）；最后是 8 道固定题的练习章。代码在 `src/engines/math-scene/`：

```
index.ts            descriptor：扩展字段 beat（0 起；URL b，1 起）、model（小测时 VIEW 组的模型，null = 题目自己的）；每章从第一拍开始；fromUrl 收 b / model，从不收作答和抽到的题
schema.ts           lesson.json 的 zod（构建期）：分数、整数、余数、时刻、时长、小数的字符串；模型（分数五种、方格 grid、阵列 array、数位块 blocks、整数数轴、钟面 clock、时间线 timeline、百格 decimal-grid、位值表 place-value、小数数轴、钱 money、器具 instrument、展开图 net）；讲解节拍（beatSchema）；33 种任务；步（beats、pool、keyFacts、limits）；练习题；课纲条目；notation；章节 state；误解按域登记
validate.ts         docs/15 §4.10 / §10 的主题级规则：章 ↔ 步、3–5 拍且模型画得出、题库 8–10 道、每道题的规则（taskIssues，与 check-pool 共用）；validate-values.ts 是整数与时间的规则（模型画得出、答案与 op / span / convert 一致、诊断得出、limits），validate-decimals.ts 是小数的，validate-measure.ts 是量读数的，validate-nets.ts 是展开图的
View.tsx            HUD 注册、舞台（节拍 / 小测）、算式行、章节轴、阅读面板（节拍行、小测托盘、本章索引）、右上卡、PLATE 块、控制面板、演示适配器
controller.ts       换拍、抽题（visit / another / skip / force）、孩子的动作、检查、提示、看答案、撤销、练习流程；也是 __atlas.engine 的实现
ui.ts               引擎自己的内存 store：每道题的作答（模型状态、尝试、提示级、反馈、看答案、完成、"你的尝试"）、每步抽到的题、练习结果、模式
lib/                纯函数（有单测）：fraction、value（整数、余数、时刻、时长、量、小数 + notation）、forms（分数以外的作答格）、grid（方格几何）、array（阵列的数与排法）、blocks（数位块、换、分、竖式每一位）、
                    clock（针角、拖针、点数字、拨钟的检查）、timeline（标尺的范围与刻度、孩子的跳段、解法的跳法）、
                    decimal（精确小数）、dgrid（百格涂色）、placevalue（小数位值表）、dline（小数数轴与放大）、money（钱）、decimal-tasks（小数题的状态、动作、检查、解法、错例）、decimal-views、decimal-working（小数算式行）、
                    diagnose/{measure,whole-ops,time,decimals}（四个域的诊断）、state、check（检查 + 误解诊断）、solve（正确解法、错例 sample → 状态）、proof（任务自证）、
                    pool（按页面种子抽题，避开上一道）、beats（演示拍）、lesson（定位、拍的槽位、VIEW 可切换的模型）、working（算式）、words（读法）、
                    instrument（A11 的刻度、位置、读数、天平）、measure-kind（哪些题归量读数域）、measure-tasks（量读数题的状态、动作、检查、解法、错例）、measure-working（量读数的算式与卡片的话）、diagnose/measure-reading、
                    solid（A8 的立体目录）、net（展开图几何、折叠、折叠结果、正方体 11 种）、project（正投影、画家顺序）、curved（圆柱圆锥卷起）、net-view（姿态、比例、轮廓）、net-tasks（展开图题）、net-description（读屏、卡片的话、算式行）、diagnose/nets
stage/              SVG：Stage（小测的模型）、BeatModel（讲解节拍 + 叠加 + 过渡）、BarModel、CircleModel、NumberLine、Rows、BarModelDiagram、GridModel（方格）、ArrayModel（阵列）、WholeLine（整数数轴）、
                    BlocksModel（数位块）、ColumnWorking（竖式）、ClockModel（钟面、秒表、放大镜、可拖的针）、Timeline（时间线）、DecimalGrid（百格 / 千格）、PlaceValueChart（小数位值表）、DecimalColumn（小数竖式）、
                    DecimalLine（小数数轴）、MoneyModel（钱）、DecimalTask、Instrument + instrument/（尺、卷尺、秤、量杯、天平、放大镜、尺寸线、把手、轨道几何）、glyphs/measure（物体轮廓）、NetModel + net/（展开图与立体：面、候选与面按钮、引线与尺寸、一排小图）、CutBar、OptionGrid、svg、layout
tray/Tray.tsx       小测托盘（< = >、选项、排序、×k / ÷k、对折、−/+；你的尝试；提示 / 检查 / 看答案 / 再来一道 / 跳过 / 下一章）；tray/inputs/（作答格：FractionInput、WholeInput（整数 / 算式 / 量）、
                    ValueInputs（余数、time12 / face / time24、时长）、DecimalInput（小数框 + 点键）、boxes（共用的格子 + 数字键 + 芯片））；tray/GridControls（方格：按行铺、走一圈、长宽步进、切线移动）；tray/WholeControls（阵列与数位块的按钮）；
                    tray/TimeControls（拨钟的时 / 分步进与 am / pm、时间线的跳段芯片）；tray/DecimalControls（百格步进、数轴放大、两端、对齐、移位、位值表的分与换）；tray/MeasureControls（读数工具、设器具的步进、砝码芯片、数格子）；tray/NetControls（FOLD 滑块与 ↺ ↻、补全展开图的撤销 / 清空 / 计数）；tray/inputs/CompoundInput（复合单位两框）
hud/                cards/（右上卡注册表：FRACTION、AREA、PRODUCT、PLACE VALUE、TIME、DECIMAL、MEASURE、SOLID，按模型种类选）、plate.ts（PLATE 行：阵列 / 整数数轴 / 数位块 / 钟面 / 时间线 / 百格 / 位值表 / 小数数轴 / 钱 / 器具 / 展开图）、BeatLine（节拍行）、ChapterIndex（要点 + 课纲对照）、PlateBlock（左列 PLATE 块）、Overlay（控制面板）
practice/Summary    练习总结
math-scene.css      全部样式（token、× --u、触控 ≥ 44 px；节拍过渡；1024 px 以下停在舞台上的托盘）
scripts/math/check-pool.ts   题库草稿自证：pnpm tsx scripts/math/check-pool.ts <draft.json> [--bridge] [--topic <slug> --step <id>] [--limits <json>]
```

### 数据（`data/lesson.json`）

```json
{ "syllabus": [{ "id": "p3-equivalent", "level": "P3", "ref": "P3 1.1", "page": 35, "source": "S1", "text": { "en": "equivalent fractions", "zh": "等值分数" } }],
  "steps": [{ "id": "equivalent-fractions", "lo": ["p3-equivalent"], "views": ["bar", "circle"],
    "beats": [
      { "model": { "kind": "bar", "parts": 2, "given": 1, "object": "strip" }, "equation": "{1/2}", "caption": { "en": "…", "zh": "…" } },
      { "model": { "kind": "bar", "parts": 4, "given": 2, "object": "strip" }, "move": "fold", "equation": "{1/2} = {2/4}", "caption": { … } },
      { "model": { "kind": "wall", "rows": [1, 2, 4, 8] }, "highlight": ["1/2", "2/4", "4/8"], "move": "morph", "caption": { … } }],
    "keyFacts": [{ "en": "Equivalent fractions name the same amount.", "zh": "等值分数表示同样多。" }],
    "pool": [{ "id": "split-thirds-into-twelfths", "kind": "split", "factors": [2, 3, 4], "target": "8/12",
      "then": { "answer": "8/12", "form": "equal", "from": "2/3" },
      "model": { "kind": "bar", "parts": 3, "given": 2, "object": "strip" },
      "prompt": { … }, "guide": { … }, "hints": [{ … }],
      "feedback": { "correct": { … }, "fallback": { … }, "reveal": { … },
                    "wrong": [{ "when": "scaled-one-part", "say": { … }, "sample": "=2/12" }] } }] }],
  "practice": [{ "id": "q4-…", "revisit": ["simplest-form"], "task": { "id": "q4-…", "kind": "input", … } }] }
```

- 一章一步：章 id = 步 id；练习章 `state.practice: true`（最后一章）；背景章照常。章节 `state` 只有 `summary`、`practice`、`note`、`theme`。
- **讲解节拍**（`beats`，3–5）：`model`（与任务同一套模型；`given` 冷色 = 给定的量，`shaded` 信号橙 = 新加上的）、`crossed`（拿走的份）、`highlight`（分数墙上点亮的分数）、`overlay`（`labels` / `equivalent` / `numberline` / `symbol`）、`equation`（模型下方一行算式，`{a/b}` 记号）、`move`（从上一拍过来的方式：`cut` `fold` `split` `convert` 扫过，`merge` 合拢，`morph` 换模型，`shade` `cross` `place` 逐份过渡）、`caption`（节拍行与演示字幕，也是朗读文本）。
- **题库**（`pool`，8–10）：任务格式见下（没有 `example`）；进入一章时抽一道（与上一次不同），种子每次打开页面生成，从不进 URL 和存储。
- **要点**（`keyFacts`，2–4 条一句话）：阅读面板正文后的本章索引。
- 任务：`shade`、`cut`、`fold`、`split` / `merge`、`place`、`compare`、`order`、`choose`、`input`、`build-sum`（字段同前：`target`、`accept`、`then`、`parts`、`snap`、`factors`、`ask`、`align`、`items`、`direction`、`line`、`options`、`answer`、`form`、`blanks`、`from`、`sum`、`op`、`a`、`b`、`convert`）。**`feedback.wrong[].sample`** 是这个误解的一个错答（写法同前：input `"5/14"`，shade `"3"`，place `"5"`，compare `"<"` / `"a"`，order `"1/2,3/4,3/8"`，cut `"4,9"`，choose 选项 id，split / merge `"x2"`，多段任务以 `=` 开头）。`lib/proof.ts proveTask` 证明每道题：解法通过、起点不通过、每个 sample 与错选项诊断成声明的误解；`tests/math-scene/lesson.test.ts` 对全部题库题与练习题跑一遍。
- 正文组件：`<Beat n={2}>短语</Beat>`（跳到本章第 n 拍；当前拍的链接高亮；validate 检查 n 在拍数内）、`<Task id="<step-id>">`（打开本章小测；也可写题库题 id）、`<Frac>`、`<Term>`、`<Num>`、`<More>`。`{3/4}` 记号与 `.atlas-nowrap` 同前（`src/lib/rich-text.ts`、`src/lib/frac-glue.ts`）。

### 方格（A4 `grid`，docs/21 §3；面积与周长）

- **模型** `{ "kind": "grid", "unit": "unit" | "cm" | "m", "show": "cells" | "dots" | "none", "figures": [...] }`：格点坐标 **y 向上**，格 (x, y) = [x, x+1] × [y, y+1]。图形 `rect: [x, y, w, h]` | `rects`（2–4 个长方形拼成，接缝画虚线）| `cells` | `poly`（直线图形的顶点，边只能横或竖）+ `halves: [[x, y, "sw"]]`（半格三角形，直角在那个角，成对）；`tone` = `cold`（给定）| `hot`（比较的第二个）| `ghost`（虚线外框）。坐标就是真长度（不按比例时也一样），面积、周长、外圈、边上的格子、切开的两块都由 `lib/grid.ts` 从几何算出，数据里不写数。讲解用的层：`tiles`（铺上的单位正方形：个数 / `all` / `{rows}` / `{count, size}` 大方块）、`walk`（从左上角沿边走几段：路径画出、小圆点跑、计数 1、2、3…）、`border`（边上的格子画虚线，角格的两段标出）、`sides: "pairs"`（对边成对：长 cold、宽 hot）、`dims`（尺寸线：`side` 或 `from` / `to`，标签按几何算，`unknown` 写 ?，`tone` 点亮那条边）、`cuts` + `apart`、`crossed`（墨色斜线的缺角）、`note`（图下一行已知条件）、`legend`（1 cm² 图例）、`notToScale`（`show: none` 必须带，右下角 "Not drawn to scale / 未按比例画"）。多个图形时图上标 A、B。
- **题型**：`count-squares`（`cover: all | row-col`；点格 / 点半格 / 行首按钮铺一行，托盘 −/+ 行与"清空"，方向键 + Enter；再写面积）、`trace-perimeter`（点格边，里面的边也能点；边游标沿格线移动 + Enter；托盘"走一圈"按走的顺序给已描的边编号；再写周长）、`draw-rectangle`（`area`、`perimeter`、`length`、`breadth`、`square`、`accept: any | exact`；左下角固定，点格点 / 拖角柄 / 角柄 `role=slider` 的 ←→↑↓ / 托盘长、宽步进器；尺寸线实时显示长、宽，不显示面积、周长）、`split-figure`（点格线切一刀，切线游标 ←→ 竖切、↑↓ 横切 + Enter，托盘竖切 / 横切 −/+；两块分开并各标尺寸；再填 `? + ? = ?`，按孩子自己的切法判）。`input` 加 `ask`（`area` | `perimeter` | `length` | `breadth` | `side`）、`figure`、`given`（`area` | `perimeter`，求边时）、`unit`、`form: "measure"`（数字框 + 单位芯片 cm、cm²、m、m²；`unit` 方格为"单位 / 平方单位"）、`sentence`（`? + ? = ?`）；`whole` 框 1–5 位，单位印在框后。答案必须等于图形自己的量（validate）。
- **误解（量度域，`lib/diagnose/measure.ts`）**：`unequal-units`（只用于 choose）、`half-squares`、`unit-not-squared`、`area-perimeter-swap`、`border-squares`、`two-sides-only`、`sides-added-for-area`、`missing-side`、`same-area-same-perimeter`、`perimeter-not-halved`、`side-from-total`、`overlap-counted`、`inner-edge-counted`；`schema.ts` 按域登记（`FRACTION_CODES`、`MEASURE_CODES`，zod 仍是一个 enum），validate 拒绝跨域的 code。**sample 写法**：数 `"14"`、量 `"12 cm"`；多段 `"=10"`、`"=9 cm2"`、`"=35,36,71"`；`count-squares` `"tiles:6"`；`trace-perimeter` `"edges:12"` / `"edges:14+2"`（外圈 14 段 + 里面 2 段）；`draw-rectangle` `"3x4"`（横 × 竖）；`split-figure` `"x:5"`。
- **每步数字上限** `steps[].limits`：`maxSide`、`maxArea`、`maxPerimeter`、`maxCells`、`gridMax: [列, 行]`（交互题默认 ≤ 12 × 10，显示 ≤ 24 × 16）、`sides: [最少, 最多]`；`pnpm validate` 与 `pnpm tsx scripts/math/check-pool.ts <draft> --topic <slug> --step <id>`（或 `--limits '{…}'`）都按它查。
- **讲解拍**：新过渡 `tile`（新铺的方块按行淡入）、`walk`（路径画出 + 圆点跑 + 计数）、`arrange`（同样的方块换一种排法，整幅重挂载）；`cut`、`cross`、`shade`、`morph` 复用；`prefers-reduced-motion` 时都换成淡入。带文字的算式写 `words: { en, zh }`（如 `area = length × breadth / 面积 = 长 × 宽`），与 `equation` 二选一。
- **HUD**：方格课的右上卡是 AREA · PERIMETER（尺寸 · 面积 · 周长；讲解拍只显示这一拍量过的：铺了才有面积、走了才有周长，不按比例的图按尺寸线；有 ? 时不算；小测只显示已知的边和孩子做的：铺了几块、描了几段、画了几 × 几、切成的两块，做完才给面积和周长）；PLATE 块 MODEL GRID · UNIT · SQUARES · SIDES；规格表多一行 UNITS（cm · m · cm² · m²），没有年级；方格课没有 S / E / N / L 辅助。步 `bridge: true` 在阅读面板节拍行上方显示 "Going further / 再往前一步"；**界面任何地方都不显示年级**（课纲对照只写 "MOE syllabus / 课纲" + 原文 + 来源芯片，`level`、`ref` 只留在数据里）。

### 整数与时间（docs/19 §3.0–3.5、docs/20 §3.0–3.5 的共用部分；乘与除、时间两课；钟面与时间线见下一节）

- **值**（`lib/value.ts`，纯函数：解析、比较、显示）：整数 0–99 999（`56` 或 `"56"`）、余数（`"3 r 2"`）、时刻（**一律 24 时制**：`"09:40"`、`"15:05:30"`，内部是午夜起的秒数）、时长（`"1h35m"`、`"95m"`、`"75s"`，记住写的单位）、量（`"28 cm2"`）。`answer` 按写法自动识别种类；分数照旧。以后的小数（docs/17）在 `AnswerValue` 里再加一种。
- **写法设置**：`lesson.json` 顶层 `notation: { "clock12": "h.mm am" | "h.mm a.m." | "h:mm am", "clock24": "HH:MM" | "HHMM" | "HH MM" }`（缺省 `h.mm am` + `HH:MM`），所有显示都走这一处（`NotationContext`）。
- **文本记号**（字幕、题目、算式、正文、名词表）：`{t:09:40}` 12 时制（EN `9.40 am`；ZH 正文 `上午 9.40`，算式行仍是 `9.40 am`）、`{t:7:20|face}` 钟面读法（不分上下午）、`{t:19:20|24}` 24 时制、`{t:19:20|ampm}` 12 时制但中文也写字母 am / pm（问上午还是下午的选项）、`{d:95m}` 时长（按写的单位显示：`95 min`、`1 h 35 min` / `1 小时 35 分钟`）、`{u:28 cm2}` 量（`28 cm²`）；整数照写；`3 r 2` 朗读为 "3 remainder 2" /「3 余 2」。`speakable` 把记号读成词（`lib/words.ts`：整数到 99 999 "three hundred and five" /「三百零五」、位值、时刻 "seven twenty p.m." /「晚上七点二十分」/「十九时二十分」、"twenty past seven"、时长）；`plainText` 写成显示文字（aria）；validate 拒绝写坏的记号。章节正文写 `<Time>` / `<Dur>`（同一套显示和读法）。中文里记号显示的开头或结尾是汉字（上午、晚上、小时、分钟）时，它和旁边汉字之间的空格自动去掉（"是 {t:19:10}。" 显示"是晚上 7.10。"），挨着数字、字母的空格照留。
- **模型**
  - **阵列** `{ "kind": "array", "object": "dot" | "kueh" | "curry-puff" | "egg" | "chopsticks" | "seat" | "orange" | "pencil" | "sticker", "layout": "scatter" | "groups" | "rows", … }`：`scatter` + `count`（+ `containers: { kind, count }` 旁边的空盘 / `{ kind, size }` 空盒）；`groups` + `groups` × `size` 或 `sizes: [2, 5, 5]`、`extra`（剩下的，虚线托着）、`another`（剩下的圈进虚线容器）、`container: ring | plate | box | bag | car`、`filled`（车）；`rows` + `rows` × `cols`、`extra`（最后一列不满）。`braces`（尺寸线语法的计数）：按行读 `true`（左 "3 rows / 3 行" + 上 "4 in each row / 每行 4 个"）、`"rows"`（只有左边的），按列读 `"cols"`（上 "4 columns / 4 列" + 左 "3 in each column / 每列 3 个"，PRODUCT 卡写 `4 × 3`、"4 columns of 3"）；左边留够竖括号文字的宽；`split: { "rows": [5] }` / `{ "cols": [5] }`（两部分分开画，`tones` 定颜色，缺省 cold、hot）、`cover: { "rows": true }`（纸条盖住那个数，写 ?）、`crossed: { rows | cols | groups: [i] }`（墨色斜线，0 起）、`pair: [layout, layout]`（并排两种，各带 `label`）。规模：散放 / 组 ≤ 60 个，行 ≤ 12 × 12（`dot` ≤ 14 × 14）。每个东西 22–96 px，整幅约占模型框高度的一半（小测的层同样按框高放大）；选择题选项卡里的阵列放大到填满卡（东西至多 64 px）。
  - **整数数轴** `{ "kind": "numberline", "scale": "whole", "from": 0, "to": 50, "step": 5, "labels": "ends" | "tens" | "steps" | "all" | "none", "jumps": { "size": 5, "count": 7, "from": 0 }, "counter": true, "major": 10 }`（`to` ≤ 10 000、≤ 100 个刻度，`step` 任意正整数，`major` 定长刻度与标数的间隔（缺省每 10），docs/32 放宽；弧顶写 +5，落点小圆；`counter` 在弧里编号 1、2、3）。分数数轴不变（`scale` 缺省 `fraction`，`intervals` 必填，`to` ≤ 3）。
  - **数位块** `{ "kind": "blocks", "value": 26, "copies": 3, "combined": true, "left": { "T": 6, "O": 18 }, "plates": 3, "dealt": { "T": 2 }, "trade": "O>T" | "T>H" | "T>O" | "H>T", "focus": "T", "column": { "op": "×" | "÷", "a": 26, "b": 3, "show": "none" | "ones" | "carry" | "tens" | "hundreds" | "all" }, "mat": true }`：百 = 10 × 10 方板、十 = 1 × 10 长条、一 = 小方块，垫子三列 H · T · O（列下写块数）；`copies` 画成几行一样的（×1、×2…），`combined` / `left` 推到一起；`plates` 在垫下画盘，`dealt` 是每盘的；`trade` 在这一拍点亮要换的 10 个（配 `move: trade` 时画换完的样子，换的过程有动画）；竖式在垫子右边（窄屏在下面），× 从个位写起（`carry` 时换上去的小数字写在上一位上方），÷ 用长除号（除数、括号、横线，商写在上面，从最高位写起，0 照写；`carry` = 剩下的换下来、带下一位），亮的那一位与垫上亮的列一致（`focus`，缺省按 `show`）。`mat: false` 只画竖式。值 ≤ 999、同屏 ≤ 120 块。**大小跟舞台走**：单位块取整像素（最大 32 px，`copies` 的几行最大 40 px，边线清楚），垫子连盘至多占模型框高度的 62 %（1920 × 1080 约为舞台高的 40–55 %），单个垫子每行至少留一根十的高（换的时候垫子不变大小），`copies` 的每行只有自己的块高（一行个位就是一个小方块高），这几行没有的位和换不出百位的百位列只留列头的宽；盘一排可以比垫子宽（每盘按商的块排开，不为盘把块缩小）；竖式的格随舞台、不跟块（14–56 px，字号跟格；宽舞台在右边、至多约框高的 55 %；窄舞台在垫子下面，垫子和竖式按"格 ≈ 6 个单位块、格至少 18 px"分框高）。
  - 节拍可以带 `under`：第二个模型画在第一个下面（例：每对筷子下面的跳数数轴）。阵列 + 整数数轴时两者当一幅图竖向居中、数轴紧贴在阵列下面；一行组、组数 = 跳数时数轴按组距排开，第 i 跳正好在第 i 组下面（放不下就照常居中）。
  - `choose` 的选项全是阵列、数位块或整数数轴时，卡片按图的形状排（数轴、一排组这种宽图一列竖排），整组卡至多占大框高度的 60 %（小框全用），图在卡里放大填满；其它选项（分数、钟面、钱、方格）照旧。
- **讲解拍过渡**（`move`，都 ≤ 900 ms，`prefers-reduced-motion` 时淡入或直接到位）：`group`（散 → 组，每个东西从原处走到组里）、`deal`（一轮一个，按顺序发到各容器）、`arrange`（组 → 行）、`rotate`（整幅转 90° 进来）、`cover`（纸条滑进来）、`jump`（数轴上的弧一个接一个出现）、`combine`（× 的几行推成一列列）、`trade`（10 个滑进下一列，新块出现）、`sweep`（钟针扫，钟面自己做；其它模型淡入）；`cut`、`cross`、`shade`、`morph` 照旧。阵列和数位块在同样的东西之间换拍时**不重挂载**（每个东西 / 块保留自己的 key，CSS transform 过渡），换了数或转 90° 才重挂载。
- **题型**（括号里是 `sample` 写法）
  - `group` `{ total, by: "share" | "pack", k, then? }`：share 有 k 个盘（托盘可加减盘），**每盘发一个**一轮一轮发；pack 每次**装满一盒**（k 个）或点新盒逐个放；点容器放一个、点容器里的东西拿出一个，容器是按钮（Enter 放、Delete 拿）。检查：组数、每组个数、剩下的都对（`"4x3"`、`"4x3+2"`、不等的 `"4,4,3"`）。
  - `arrange` `{ rows, cols, accept: "exact" | "product" }`：从左上角拉出阵列（点格点、拖角柄、角柄 `role=slider` ←→ 列 ↑↓ 行、托盘行 / 每行步进）（`"3x5"`）。从 0 × 0 起，步进器（和角柄的方向键）各管一个数：第一次"多一行"是 1 行 0 列（左边括号写 1 row，还没有东西），再"每行多一个"才出现 1 × 1；行或列为 0 时检查 = 还没做。
  - `skip-count` `{ size, count, to? }`：整数数轴上依次落跳（点刻度；游标 ←→ 一格 + Enter；再点一次收回；托盘"收回最后一跳"）（`"5,10,15,20"`）。
  - `split-array` `{ rows, cols, at?: { rows: [k] } | { cols: [k] }, then }`：在两行（列）之间切一刀（点缝、游标 ↑↓ 行 ←→ 列 + Enter、托盘步进），两块分开各标 `5 × 7`；再填算式（`at` 给定时按题目答案；没给时 `? + ? = ?` 按孩子自己的切法判，两部分可换序）（`"r5"`、`"c3"`；`"=35,7,42"`）。
  - `regroup` `{ value, start: { H, T, O }, then? }`：某列 ≥ 10 时点那一列或托盘 **10 个一换 1 个十**，直到每列 < 10（`"T>H"`、`"O>T,T>H"`）。
  - `share` `{ value, k, then }`：从最高位起**分**一列（尽量平均发给 k 盘），分不了的**换开**到下一列（一次把这一列剩下的全部换开：托盘按钮写 "Trade 3 tens for 30 ones / 3 个十换 30 个一"，点垫上的列同样），到个位分完（`"T,T>O,O"`：字母 = 分那一列，`X>Y` = 换）；`regroup` 仍是一次 10 个换 1 个；垫上还停着十或百就检查 → `not-traded`。
  - `input` 加写法：`form: "whole"`（1–5 位；`sentence` 印好的句子按顺序填 `?`；没有句子时按 `op` 印 `4 × 7 = ?` / `? × 6 = 42` / `35 ÷ 5 = ?`）、`"remainder"`（商 r 余数，余数格空 = 0）、`"time12"`（时 . 分 + am / pm 切换）、`"face"`（钟面读数，不分上下午）、`"time24"`（时 : 分，各两位）、`"duration"`（`h` + `min`，答案带秒时 `min` + `s`；`units` 可改）；格子满了自动跳到下一格，Tab 切格，Enter 检查。诊断上下文：`op: { kind: "×" | "÷", a, b, missing?: "a" | "b" | "c", round?: "up" | "down", split? }`、`convert: { from: "2h15m", to: "min" | "s" | "h" }`、`span: { start?, end?, length?, ask: "start" | "end" | "length" }`。sample：`"56"`、`"35,7,42"`、`"3 r 2"`、`"3"`、`"7:20 pm"`、`"7:20"`、`"19:20"`、`"10:95 am"`、`"1h75m"`（照孩子写的样子写，不成立的时刻也照写）。
- **误解**：`whole-ops` 域 18 条（`lib/diagnose/whole-ops.ts`：`unequal-groups`、`added-not-multiplied`、`groups-size-swapped`、`skip-count-slip`、`split-slip`、`sharing-only`、`divide-order`、`operation-swapped`、`remainder-too-big`、`remainder-dropped`、`remainder-context`、`tens-as-ones`、`extra-zero`、`carry-not-added`、`digits-concatenated`、`partial-product-missed`、`zero-in-quotient`、`not-traded`；`carry-not-added` = 逐位乘、每位只留个位、**最高位照写整个积**（47 × 3 → 121），`partial-product-missed` 另认乘两位数时整行漏掉（32 × 13 → 96 或 320）），`time` 域 11 条（`lib/diagnose/time.ts`：`hands-swapped`、`next-hour`、`hour-hand-on-numeral`、`numeral-as-minutes`、`five-count-slip`、`am-pm`、`noon-midnight`、`base-100`、`count-endpoints`、`wrong-direction`、`24h-offset`）。`divide-order`、`sharing-only`、`hour-hand-on-numeral`（以及 `unequal-groups`，`group` 也能判）只由 `choose` 选项诊断。一道题只用它那个域的 code（validate：方格 → measure；时间写法 / `span` / `convert` → time；阵列 / 数位块 / 整数数轴 / `op` / 余数 → whole-ops；其余 fractions），而且 validate 拒绝"这道题诊断不出"的 code（如没有 `op ×` 却写 `carry-not-added`、不是 `time12` 却写 `am-pm`）。钟面（`set-clock`）把拨好的时刻当成孩子写的时刻，造自己的 `TimeContext` 调 `diagnoseTime`。
- **每步上限** `limits`：`factors: [lo, hi]`（乘法两个因数、组数和每组、行和列都在范围内）、`maxTotal`、`divisor: [lo, hi]`、`maxQuotient`、`maxValue`（题里出现的任何整数）、`clock: "12h" | "24h"`（12h 时不许 `time24`）、`step`（时刻和时长都是这么多分钟的整数倍）、`maxDuration`（如 `"180m"`）、`sameDay`（每段都在一天之内，不跨午夜）；validate 与 `check-pool --topic --step` 都查。
- **右上卡**按模型种类换（`hud/cards/index.tsx` 的注册表）：PRODUCT（阵列、整数数轴：`4 × 3 = 12`、"4 groups of 3 / 3 rows of 4 / 6 jumps of 2"、总数的读法；小测时是孩子做的和带 ? 的算式）、PLACE VALUE（百 · 十 · 一三格 + 名称 + 这个数和读法；小测时格子是孩子的块，数等检查完才给）、TIME（时刻按 notation 显示、"twenty past seven / 七点二十分"、另一种计时法；时长和读法；小测时只给 span 的已知时刻和孩子写的）；分数、方格不变。答案写成时刻或时长的小测一律用 TIME 卡。**PLATE 行**（`hud/plate.ts`）：阵列 MODEL ARRAY · GROUPS · EACH · TOTAL；整数数轴 MODEL LINE · JUMPS · SIZE · LANDS；数位块 MODEL BLOCKS · H · T · O · TRADES。都不先说答案。
- **VIEW**：`MODEL_VIEWS` 加 `array`、`blocks`、`clock`、`timeline`；这些模型只画自己（没有可切换的别的模型）。整数 / 时间课没有 S / E / N / L 辅助；背景章画第一个模型种类的标本（阵列 3 × 4；时间课是 7:20 的钟面）；规格表多一行 NUMBERS（各步 `maxValue` / `maxTotal` 的最大值）。
- **示例主题** `sample-lesson-whole`（`status: draft`，首页不列）：五步、每步 8–10 道（第 05 步是钟面与时间线），把上面每个模型、过渡、题型、写法各用一次，`tests/math-scene/sample-lesson-whole.test.ts` 全部自证；截图 `pnpm shoot sample-lesson-whole --beats --tasks --keys --layout`。

### 钟面与时间线（A3，docs/20 §3.1–3.6；时间课）

- **钟面** `{ "kind": "clock", "time": "07:20", … }`（时刻一律 24 时制，钟面只画 12 时位置；缺省 12:00）：1.5 px 墨线外圈 + 发丝内圈、60 个分钟刻度（每第 5 个加长；`ticks: "minutes" | "fives" | "none"`）、1–12 数字（衬线体，随舞台缩放，最小 13 px）。针按真钟：时针 = 30h + 0.5m + s/120，分针 = 6m + 0.1s，秒针 = 6s（`second: true`，hot 色带配重）。可选层：`minuteLabels`（外圈外 `05 … 55`）、`inner24`（数字内侧 `13 … 24`）、`highlightTicks: [26, 27, 28]`（这几格 signal）、`hourTrack: true | { from }`（时针扫过的扇形斜线）、`arc: { from, to }`（外圈内侧的时长环带，每满一小时多一圈，起止端 cold / hot 小三角）、`zoom: "hour"`（钟旁一个放大镜：时针尖到数字之间放大，两条发丝线连到钟面上的小圈）、`ampm: "show" | "ask"`（钟心下的小牌 am / pm 或 ?）、`lit: "hour" | "minute" | "both"`（针变 signal 并用引线标 "Hour hand / 时针"，`both` 先时针后分针）、`face: "stopwatch"` + `elapsed: "75s"`（秒表：上方按钮、60 秒刻度标 5…60、小表盘记分钟，30 分一圈）、`faulty: "hour-on-numeral" | "hands-swapped"`（故意画错的钟：**只用于讲解拍和 `choose` 的选项**，validate 拒绝出现在题目自己的模型上）、`pair: [face, face]`（两个钟面并排，各带 `label`）。钟面太小时（半径 < 100 / 80 px）省掉内圈 24 时和外圈 5 分标签。
- **时间线** `{ "kind": "timeline", "scale": "day" | "span" | "duration", "from", "to", "minor", "labels", "bands", "marks", "jumps", "clock" }`：工程标尺语法，整点长刻度并标注，`minor`（1、5、10、15、30 分）只画线（缺省：一天 1 小时，≤ 3 h 的段 10 分，否则 30 分）；`day` = 00:00–24:00（不写 from / to），`span` = `from`–`to`（≤ 6 h），`duration` = `0m`–`to`（标 0、1 h、2 h，点写成时长 `"95m"`）。`labels: "12h"`（钟点数在上、小号 am / pm 在下，按 notation）、`"24h"`（按 notation）、`"both"`（线上 24 时、线下 12 时；24 时标签放不下时每 2–3 小时一个）；`bands: "ampm"`（上午、下午两段极淡底色，段名 "AM · morning / 上午"，中午、午夜两条竖发丝线）；`marks: [{ at, tone, label? }]`（线上小三角，时刻与标签在弧的上方，一条虚发丝线连下来）；`jumps: [[from, to], …]`（弧：向右在线上、向左在线下，弧顶 "+ 20 min" / "− 1 h"，`move: jump` 时逐段画出）；`clock: true`（线左边一个钟面，指着这一拍最后一跳落下的地方，没有跳时指最后一个标记；小测时跟着孩子跳到的地方走；舞台窄于 560 px 时省掉）。整幅（上方的标签、下方的钟点）在框里竖向居中，小框里弧压低。
- **讲解拍**：同样的钟面 / 同样的标尺之间换拍**不重挂载**——`sweep` 让针从上一拍的时刻按时间顺序扫到这一拍（角度不取模，所以 3:40 → 2:45 是逆时针退回去；≤ 900 ms，长的按比例压缩，时针同步）；`jump` 只画新加的弧。`under` 把钟面和时间线配在一拍里：宽舞台并排（钟面在左），窄的上下叠。`prefers-reduced-motion` 时整幅淡入、针直接到位。
- **题型**（括号里是 `sample` 写法）
  - `read-clock` `{ model: clock | timeline + clock, answer: "07:20", form: "time12" | "time24" | "face" | "duration", units? }`：舞台只读，托盘是现成的 time12 / face / time24 / duration 写法格（秒表读成时长）；validate 查答案就是钟面的时刻（`face` 只比 12 时位置），`face` 不配 `ampm: "ask"`（`"7:04"`、`"7:40 am"`、`"1m15s"`）。am / pm 小牌写在模型上（`ampm: "show" | "ask"`），不在题上。
  - `set-clock` `{ model: clock, target: "14:50", snap: 1 | 5, ampm? }`：拖分针（时针按比例跟着走，越过 12 小时数进 / 退一；`ampm` 时越过中午 / 午夜翻 am / pm）、拖时针（整小时，分钟不变）、点数字（分针跳到那个数；每个点按区 ≥ 44 px）、两根针都是 `role="slider"`（分针 ←→ 一格 snap、Shift × 5、PgUp / PgDn 一小时、Home 12 点；时针 ←→ 一小时；`aria-valuetext` 是读法）、托盘时 −/+、分 −/+（`snap: 1` 另有 ±5 min）、`ampm` 的 am / pm 芯片；在用的针变 signal，"看答案"画虚线针。检查：12 时位置（`ampm` 时连上下午）；诊断把拨的时刻当作写的时刻（`hands-swapped`、`next-hour`、`numeral-as-minutes`、`five-count-slip`，`ampm` 时加 `am-pm`、`noon-midnight`）（`"10:15"`、`"2:50 am"`）。
  - `duration` `{ model: timeline, ask: "length" | "end" | "start", start?, end?, length?, answer: inputSpec }`：从已知时刻出发（求开始时从结束往回），托盘芯片 **+1 h / +10 min / +5 min / +1 min**（求开始时是 −）在线上跳，连着按的分钟芯片并成一道弧直到落在整点，"收回最后一跳"（芯片上按 Backspace 同样）；跳段是脚手架、不判对错，只检查写下的答案（`span` 由 ask / start / end / length 自动补进写法，诊断 `base-100`、`count-endpoints`、`wrong-direction`、`24h-offset` 等）。解法的跳法：先到整点、再整小时、再剩下的分钟。validate 查时间线是时刻标尺、盖得住已知时刻和答案（`"1h75m"`、`"=10:95 am"`、`"=15:45"`）。
  - `choose` 的选项可以是钟面（含 `faulty`；替代文字描述针指在哪，不读出时刻），`input` 可以配钟面或时间线（如读时长环带）。
- **HUD**：TIME 卡——讲解拍是这一拍钟面的时刻（钟面有 am / pm 牌按 12 时制、有内圈按 24 时制、否则钟面读法 "twenty past seven / 七点二十分"；秒表、时长标尺是时长；时间线是最后一个标记），背景章是标本 7:20；`set-clock` 小测是"拨到"（题目里已有）+"钟面上"（孩子拨的，signal）+ 读法；`read-clock` / `duration` 只有已知的和孩子写的。PLATE 行：钟面 MODEL CLOCK · TIME · HAND · NOTATION（时刻按钟面的读法，要读的钟答完前写 ?；HAND = 点亮的针或 H · M（· S）；NOTATION = 这一处的写法 `H.MM`、`H.MM AM`、`HH:MM`、`MIN · S`），时间线 MODEL TIMELINE · FROM · TO · JUMPED（讲解拍：第一跳 / 第一个标记、最后一跳 / 最后一个标记、跳了多久；小测：已知时刻、孩子跳到哪、孩子跳了多久）。`View` 把 `beatTime(beat)` 交给 `Card` 的 `time`。
- **校验**（`validate-values.ts` 的 `clockIssues` / `timelineIssues` / `timeTaskIssues`）：秒表要 `elapsed`（≤ 30 min）且不带钟面的层；`arc` 往后走、≤ 4 h；`hourTrack.from` 在 12 小时之内；成对的钟面各带 `label`；时间线范围合法（span / duration ≤ 6 h，到 24:00 为止）、标记和弧都在线上；`faulty` 不在题目自己的模型上；`read-clock` 的答案是钟面的时刻；`set-clock` 的目标在 snap 上、开始时不已经对；`duration` 的标尺盖得住；`limits.clock: "12h"` 时不许 24 时写法、`inner24`、24 时标尺；`limits.sameDay` 不许跨午夜。单测 `tests/math-scene/{clock,timeline}.test.ts`。

### 小数（docs/29 §3，X1–X11 与模型 A6）

- **值**（`lib/decimal.ts`，纯函数，**不用浮点**）：`Decimal = { units, dp }`，`units` 是百万分之一的整数，`dp` 是写出的小数位数（`0.5` 与 `0.50` 值相等、写法不同：`eq` / `same`）。逐位解析 `parseDecimal`（`".35"` 读作 0.35；`"1.2.3"`、`"-1"`、6 位整数都拒绝），`add` / `sub` / `mulWhole` / `divWhole`（长除法，`exact` 或截到 6 位）/ `round`（满 5 进一，写够位数：2.96 → 3.0）/ `truncate` / `scale`（× 10ⁿ：数字移位）/ `digitAt` / `toFraction` / `fromFraction`（分母只含 2、5）。数据里**小数一律写字符串**（`"0.50"`）；整数可写 JSON 数，带点的 JSON 数报 "write decimals as strings"。`answer` 带点即识别为小数（`{ kind: 'dec' }`）；`compare` 的 `a` / `b`、`order` 的 `items`、`place` 的 `target`、`choose` 选项的 `value` 收分数或小数；`share` / `regroup` 的 `value` 收整数或小数。
- **量**（X2）：`Measure.value` 是 `Decimal`（方格课照旧是整数），单位加 `km` `g` `kg` `l`（显示 ℓ）`ml`；`{u:1.5 l}` 显示 `1.5 ℓ`，读 "one point five litres" /「一点五升」。
- **文本里的小数与钱**（X8，`src/lib/rich-text.ts`）：正文、字幕、题目里**裸写**的小数（`0.235`、`0.666…`）和钱（`$2.35`、`$7`）是一个不拆行的值，与相邻运算符同行；朗读：小数点后逐位 "zero point two three five" /「零点二三五」，`…` 加 ", and so on" /「，一直下去」，钱 "2 dollars 35 cents" /「2 元 35 分」，`≈` 读 "is about" /「约等于」（`lib/words.ts` 的 `decimalWords`、`moneyWords`）。validate 拦裸写的时刻（`9.40 am` 会被读成小数，要写 `{t:09:40}`；`sample` 字段不查）。
- **模型**
  - **百格 / 千格** `{ "kind": "decimal-grid", "level": 10 | 100 | 1000, "wholes": 1–3, "given": "0.35", "runs": [{ "value": "0.3", "tone": "cold" }, { "value": "0.05", "tone": "signal" }], "crossed": "0.12", "zoom": { "at": "0.23" }, "quarters": true, "labels": "tenths" | "hundredths", "trade": "t>O" | "h>t" | "th>h", "tone": "ghost" | "hot", "pair": [grid, grid] }`：一个整体是正方形，十分之一是竖条，百分之一是条里的小格（每 5 格一条略重的线）；涂色顺序固定（整体 → 条从左到右 → 格从上到下，`lib/dgrid.ts`）。千分之一画在放大镜里：圆圈 + 两条引线 + 放大的那一格切成 10 细条 + "×10"（宽舞台在右边，窄舞台在下面）；validate 要求有千分位时 `zoom.at` 正是"涂到一半的那一格"。节拍 `under` 是从 0 起、不放大的小数数轴时，两者当一幅图竖向居中、**对齐**（`BeatModel gridOverLine`）：几个整体并排不留缝（接缝画粗线），数轴的 0…1 正好是第一个整体的宽，每个十分之一的竖条正在数轴那一格上方。
  - **位值表** `{ "kind": "place-value", "columns": ["T","O","t","h","th"], "value": "34.506", "show": "digits" | "discs" | "both", "fill": [...], "highlight": [...], "rows": ["3.4","1.25"], "align": "point" | "right", "pad": true | "1.500", "copies": 3, "combined": true, "plates": 4, "dealt": { "O": 1, "t": 4 }, "left": {...}, "trade": "h>t", "shift": { "by": 2, "dir": "right" }, "money": true, "column": { "op": "+" | "−" | "×" | "÷", "a": "2.35", "b": "3", "show": "none" | "all" } }`（位 `Th H T O t h th`，`lib/placevalue.ts`）：列头英文小号大写 + 中文，个位与十分位之间一个大墨点（小数点，`slide` 时数字动、点不动），圆片墨线圆印 `1 / 0.1 / 0.01 / 0.001`（钱版 `$1 / 10¢ / 1¢`），不按位着色；`align: "right"` 只画"对错了"（没对上的点用灰色虚线框标出）；`pad` 的 0 淡显；`plates` + `dealt` 不写 `left` 时表上画剩下的。竖式 `stage/DecimalColumn.tsx`：+ − 逐位，进位 / 退位的小数字在上方（signal），× ÷ 用整数竖式（`ColumnWorking`）再把小数点放回去，积、商、被除数的小数点在同一竖线上，商没有个位时写 0。宽舞台（≥ 720 px）竖式在右边——**有盘时也是**（表在上、盘在下，竖式在它们右边居中），窄舞台在下面；盘可以排一到三行，每盘里每一位的圆片一行 2–5 个，挑圆片最大的排法（宽、高都放得下）；表上还有圆片时盘里的圆片和表上一样大，表空了时至多 40 px；太挤时表和竖式一起缩（竖式的格至少 14 px）。1920 × 1080 上小数课所有带盘的拍盘里圆片 ≥ 37 px（7 ÷ 4 带竖式的那拍以前约 20 px）。`label` 写在表上方。≤ 120 个圆片，值 ≤ 9999、≤ 三位小数。
  - **小数数轴** `{ "kind": "numberline", "scale": "decimal", "from": "0", "to": "1", "step": "0.1", "labels": "ends" | "wholes" | "all" | "none", "marks": [...], "arrow": "0.23", "zoom": [{ "from": "0.2", "to": "0.3" }, { "from": "0.23", "to": "0.24" }], "halfway": true, "nearest": "3.0", "unit": "km", "dual": { "unit": "m", "factor": 1000 } }`（`lib/dline.ts`）：≤ 20 段；每层放大是上一层的恰好一段切成 10 段（最多 2 层），被放大的那段加粗、下方方括号、两条引线连到下一层两端、"×10"；端点按写法显示（`3.0` 保留 0），中间刻度按 step 的位数；`nearest` 时较近一端加粗、signal 箭头从标记指过去；`dual` 在线下印小单位（标记也印；标记落在有字的刻度上或挨着时，刻度那个读数让给标记的，只画一次）。标记的数挨着前一个标记的数时抬高一行、用发丝引线连回圆点（0.9 和 1.0）；中点（`halfway`）的数挨着标记的数时（3.447 与 3.45）改写在线下、虚线延长，那个刻度线下已经有数就不再写；`labels: "all"` 的刻度数放不下时隔一个（或五个）写一个，两端总写。
  - **钱** `{ "kind": "money", "amount": "2.35", "pieces": ["1","0.1",…], "layout": "tray" | "by-place", "trade": "t>O", "note": true, "pair": [{ "amount": "2.05" }, { "amount": "2.50" }] }`（`lib/money.ts`）：硬币 5¢ 10¢ 20¢ 50¢ $1、纸币 $2 $5 $10 $50，**素面**（圆 + 面额字，$1 内多一圈），没有 1 分；缺省按位拆（几张 $10、几枚 $1、几枚 10¢、一枚 5¢）；`by-place` 三列 DOLLARS · TEN CENTS · CENTS（元 · 10 分 · 分），列下写这一列有几个这一位的单位（10 枚 10¢ 写 10）；`trade` 点亮 10 枚 10¢，元列画一枚虚线 $1。金额必须是 5 分的倍数（validate）。`pair[].label`（和单个的 `label`）写在各自那组上方（`ms-array__title`，同成对的钟面、阵列），成对的两组框一样高（按较高的那组）。
- **讲解拍过渡**（X7）：`zoom`（放大镜 / 下一层数轴从上一段展开）、`slide`（位值表数字从原来的列滑过去，原处留虚线影子，点不动）、`align`（第二行从右对齐滑到小数点对齐，补的 0 淡入）、`round`（箭头画出，较近一端加粗）；都 ≤ 900 ms，`prefers-reduced-motion` 时淡入。位值表每拍整幅重挂载（过渡在挂载时播），百格同尺寸时只换涂色。
- **题型**（括号里是 `sample` 写法）
  - `shade-decimal` `{ target, level, wholes?, start?, accept: "value" }`：点小格（level 10 点条）涂 / 撤，条下 44 px 条按钮一次涂满 / 清空一条，level 1000 放大镜跟着"下一格"、点细条涂千分之一；托盘 ±0.1、±0.01（±0.001）步进与"重来"；键盘方向键（← → 一条，↑ ↓ 一格）+ Enter，`+` / `−` 一个百分之一（Shift 十分之一）。只查总量（`"0.6"`）。
  - `place` 在小数数轴上 `{ target, zoom: 0 | 1 | 2 }`：上面的层点一段 = 放大（`zoom`），最深一层点刻度 = 放标记；每层是 `role="slider"`（← → 段 / 刻度，Enter 放大 / 放，Esc 收起最深一层），托盘 ◀ ▶、"放大这一段"、"缩小"（`"0.234"`）。
  - `compare` / `order` 扩到小数（`"<"`、`"0.5,0.45,0.54,0.405"`）；`compare.align: "point"` 的按钮把两个数按小数点竖排补 0；`order.line: true` 做完后把各数画成标记。
  - `round-on-line` `{ value, to: 0 | 1 | 2, labels: "ends" | "hidden", then }`：先点较近的一端（舞台上两个 44 px 端点按钮，托盘一组 radio），再写四舍五入的结果（`then.places = to`）。模型照写成两端的数轴（validate 查两端 = 相邻两个保留位）（`"end:2.9"`、`"=3.0"`）。
  - `align-add` `{ op: "+" | "−", a, b, start: "right" | "left", then }`：用 ◀ ▶（或第二行的 slider ← →）把第二行移到小数点对齐（对上时点变 signal），"补 0" 淡显空位；再写和 / 差（`"align:right"`、`"align:point"`、`"=4.65"`）。两数位数相同或起点已对齐 validate 报错。
  - `shift-digits` `{ value, op: "×" | "÷", by: 10 | 100 | 1000 }`：**往左一位 / 往右一位**按钮（或 slider ← →）整体移数字，空位出现淡显的 0（`"30.7"`：结果值）。
  - `share` / `regroup` 扩到位值表（模型 `place-value`）：分一列、剩下的换到右边一列（≤ 三位小数），`regroup` 每列 < 10，或写 `goal` 时换到那个样子（减法前"拿 1 个十分之一换 10 个百分之一"）（动作序列 `"O,O>t,t"`、`"h>t"`；多段 `"=1.4"`）。
  - `input` 的 **`decimal` 写法**：一个框 + 数字键 + `.` 键（`places`：必须正好写几位，钱 `unit: "dollar"` 缺省 2 位；`unit` 为 `dollar` 时框前印 `$`，量的单位印在框后；`work` 的换算印目标单位）；物理键盘直接打，`,` 忽略，`.35` 写成 0.35。值对位数不够 → `places-short`（"差一步"，同 `not-simplest` 不算尝试）。没有 `sentence` 时按 `work` 印算式（`0.45 + 0.38 = ?`）。sample `"0.43"`（照孩子写的，`"0.10"` 保留）、多框 `"3,5"`。
  - `work`（只给诊断，validate 查它算出来 = `answer`）：`{ "do": "add" | "subtract" | "multiply" | "divide" | "round" | "convert" | "scale" | "to-fraction" | "to-decimal" | "compose" | "read", "a", "b", "to", "from", "into", "op", "by", "of", "parts", "line", "tick" }`；小数化分数用分数格（`form: "simplest"` + `work: { do: "to-fraction", of: "0.35" }`）。
- **误解**：`decimals` 域 25 条（`lib/diagnose/decimals.ts`，§2.1 的码，每条 ≥ 2 正例 1 反例，`tests/math-scene/diagnose-decimals.test.ts`）。**一码多域**：`MISCONCEPTION_DOMAINS.decimals` 除自己的 25 条还列 `tick-counting`、`carry-not-added`、`zero-in-quotient`、`not-simplest`；码只在自己的老家域登记一次（`MISCONCEPTIONS` 无重复），一个码的规则是列出它的各域规则之并，**一道题按它自己的域诊断**（小数题走 `decimals.ts` 的规则）。小数的 `carry-not-added` 与整数的同一写法：逐位加 / 乘、每位只留个位，**最高位（至少是个位）照写整个和 / 积**（`carryDroppedSum` / `carryDroppedProduct`：4.7 × 3 → 12.1，4.7 + 8.5 → 12.2；0.47 × 3 的最高位是个位 0，仍得 0.21）。一道题是小数题（`lib/decimal-tasks.ts isDecimalTask`：小数题型、A6 模型、小数的值、`decimal` 写法或 `work`）就归 `decimals` 域，validate 拒绝别的域的码和"这道题诊断不出"的码（如没有 `work: multiply` 却写 `point-misplaced`）。
- **每步上限**（X9，`limits`）：`dp: [少, 多]`（题目给的小数的位数）、`resultDp`、`maxValue`、`factor: [2, 9]`（× ÷ 一位数）、`denominators`（分数化小数允许的分母）、`roundTo: [0, 2]`、`by: [10, 100, 1000]` + `multiples: true`（20…900）、`units: ["km-m","m-cm","kg-g","l-ml"]`、`money: true`（5 分的倍数）、`zoomDepth`；validate 与 `check-pool --topic --step` 都查。答案框整数部分最多 5 位（99 999）：换算题别出 `750000` 这样的错例。
- **右上卡 DECIMAL**（X4）：讲解拍 = 大号数字、每位下面英文 + 中文位名、小数点画大，一行分数名 `{235/1000}`（展开后加最简分数与 `0.2 + 0.03 + 0.005`），下面一行读法；钱：`$2.35` · 分数 `235` · "2 dollars 35 cents"；四舍五入拍：`2.96 ≈ 3.0` · "to 1 decimal place"；双刻度：`1.5 ℓ = 1500 ml`。小测只显示给定的数（算式带 `?`）和它的读法，做完才给答案。**PLATE 行**（X5）：百格 MODEL HUNDRED GRID · WHOLES · TENTHS · HUNDREDTHS · THOUSANDTHS · SHADED；位值表 MODEL PLACE VALUE · NUMBER · TRADES · SHIFT；小数数轴 MODEL NUMBER LINE · RANGE · STEP · ZOOM · MARK；钱 MODEL MONEY · COINS · TOTAL。小测里是孩子做的（涂了多少、放在哪、移了几位），"看图写数"的题不先说值。
- **VIEW**（X10）：`MODEL_VIEWS` 加 `decimal-grid`、`place-value`、`money`（小数数轴沿用 `numberline`）。比较两个小数的题可以在并排百格（≤ 两位小数、≤ 3 个整体）/ 位值表对齐 / 一条数轴之间切换（`lib/decimal-views.ts`，画不出的视图不出现），其余小数题只画自己的模型。小数课（有 A6 模型的课）的背景章画涂了 0.35 的百格；规格表多一行 DECIMAL PLACES ≤ 3；没有 S / E / N / L 辅助。
- **示例主题** `sample-lesson-decimal`（`status: draft`）：四步（百格与钱 · 数轴与四舍五入 · 位值表与竖式 · 移位与单位，最后一步 `bridge`），37 道题，把上面每个模型、过渡、题型、写法各用一次，`tests/math-scene/sample-lesson-decimal.test.ts` 全部自证；截图 `pnpm shoot sample-lesson-decimal --beats --tasks --keys --layout`。

### 量的读数（docs/32 §3，M1–M12 与模型 A11）

- **量**（M1，`lib/value.ts`，纯函数）：一个量是一个单位（`MeasValue`：`"900 g"`、`"1.4 kg"`）或两个单位（`CmpValue` / `Compound`：`"2 m 35 cm"`，内部存小单位的整数 235 cm + 写法）。数据里**单位前一定有空格**（`"50m"` 仍是时长、`"50 m"` 是量）。复合单位只认 km–m、m–cm、kg–g、ℓ–ml 四对（`COMPOUND_PAIRS`），小单位部分 < 进率、大单位 ≤ 99；`"2 m 135 cm"`、`"2 kg 35 cm"` 拒绝。`parseQuantity` / `parseCompound` / `fromSmall` / `toSmall` / `qtyIn`（换成同族的另一个单位，不整除时 `null`）/ `compareQty`（一律换成同族最小单位 cm、g、ml 比）/ `printedNumber`（印出来的第一个数：只比数的孩子比的是它）。`answer`、`compare` 的 `a` / `b`、`order` 的 `items`、`choose` 选项的 `value` 都收量。文本记号 `{u:2 m 35 cm}`、`{u:1 l 250 ml}`（显示 `1 ℓ 250 ml`，两种语言都写符号；读 "2 metres 35 centimetres" /「2 米 35 厘米」）；单一单位照旧（"three hundred and fifty grams" /「三百五十克」）。章节正文写 `<Qty u="9 cm" />`（同一套显示与读法，validate 查 `u`）。
- **模型 A11 `instrument`**（`schema.ts instrumentSpec`；几何与读数在 `lib/instrument.ts`，画法在 `stage/Instrument.tsx` + `stage/instrument/*`，物体轮廓在 `stage/glyphs/measure.tsx`）：

  ```json
  { "kind": "instrument", "type": "ruler" | "tape" | "dial" | "jug" | "balance",
    "unit": "cm",                       // 值都写这个单位（有 sub 时是小单位）；缺省 ruler / tape cm、dial g、jug ℓ
    "from": 0, "to": 15, "major": 1, "minor": 1,   // 印出的范围、每 major 标一个数、每 minor 一条刻度（小数写字符串 "0.1"）
    "labels": "major" | "ends" | "none" | { "hide": [10] },
    "sub": { "unit": "m" },             // 两种单位的刻度：整大单位处印 "1 m"，其余标数印小单位的余数（per 可写，须 = 进率）
    "dual": true,                       // 另一侧再印一遍小单位的总数（需要 sub）
    "skip": { "from": 0, "to": 100 },   // tape：这一段画成两格长 + 两条断开线
    "orient": "vertical", "look": "ruler" | "metre-rule" | "tape" | "height-chart" | "path",
    "inset": "0.6", "broken": true,     // ruler：0 刻度离左端多远；左端断口
    "object": { "kind": "pencil", "from": 0, "to": "6.7", "tone": "cold" },   // 放在尺上的东西（to 可以不在刻度上：limits.nearest）
    "line": { "from": 0, "to": 5 }, "arrow": 35, "head": 128,                // 画出的线、卷尺的箭头、身高尺的头顶板
    "value": 280, "load": "prawns",     // dial 的指针 / jug 的液面；秤盘上的东西
    "liquid": "water", "shape": "beaker" | "cup" | "jug" | "pail" | "bottle" | "bowl" | "bottle-jug", "scale": false,
    "sweep": 330,                       // dial：满量程的角度（0 在正上方顺时针，满量程与 0 之间留缺口）
    "left": [{ "item": "pineapple", "mass": 1000, "size": "big" }], "right": [{ "weight": 500 }],
    "tilt": "auto" | "left" | "right" | "level", "hideMass": true,
    "count": { "from": 30, "to": 40 }, "zoom": { "from": 200, "to": 300 },
    "brackets": [{ "from": 0, "to": 100, "label": { "en": "{u:1 m}", "zh": "{u:1 m}" } }, { "from": 100, "to": 132, "label": { … }, "tone": "signal" }],
    "eye": true, "highlight": [3, 8], "straight": true, "tone": "hot", "label": { … },
    "pair": [ … ], "set": [ … ] }        // 两个 / 三个同类器具并排（各带 label、同一比例；长条的尺上下叠）
  ```

  每一条刻度都由"轨道"（`stage/instrument/geometry.ts`：直的或圆的，给出某个值在页面上的位置和刻度朝向）放，所以**每一小格一样大**是构造出来的（`instrument.test.ts` 查尺、跳段的卷尺、秤盘、量杯）。刻度语法同数轴：小格发丝线、标数长刻度 1.5 px、十格时第 5 格中长；数字衬线体、≥ 13 px、带纸色描边（指针压过也读得清）；`highlight` 的刻度加粗；`hide` 的数位置画小空框。**画面**：尺子（浅色长条，0 刻度按 `inset`，断口锯齿）；卷尺（带钩的条）、米尺（木色条 + 端头）、身高尺（竖贴墙的长条 + 头顶板 + 一个人的轮廓，无脸）、路（路面 + 每格一根桩，箭头在路下）；指针秤（秤盘 + 圆盘 + 大号单位 + 指针，`straight` 时变成同样刻度的数轴）；量杯（按 `shape` 的轮廓，刻度在右侧，液面是一条水平线、没有弯月面，`eye` 时液面高度一条虚线 + 一个眼睛记号；`scale: false` 的瓶和碗画满水）；天平（底座、立柱、绕支点转的横梁，重的一边低 8°，两个托盘始终水平）。`stage/instrument/Balance.tsx` 的 `BalanceDrawing` 不认识克：托盘里的东西自己画自己（`PanItem`），以后代数课（docs/17 A9）的天平直接用它放 x 和 1。**叠加**：`count` 每一小格一条编号的弧（signal，在刻度线的另一侧；竖尺在尺条右侧，避开左侧人形，点格子的命中区也在同侧）；`zoom` 放大镜（器具上一个圈、两条引线、旁边（窄舞台在下面）一个大框，把那一段拉直放大，只在两端印数，读数的位置画一个三角；框内只画实际数过且落在放大范围内的格子，不补满整个标数间隔；圆盘不画圈，而是沿表圈框出这一段的一条环带（从刻度线内端到表圈外，两条引线从环带两端出发），不随标数间隔的弦长膨胀，避开表盘中心、指针和单位）；`brackets` 刻度外侧的尺寸线（复合单位的两段）。**规模**：1920 × 1080 下 15 cm 尺约占模型框宽 88 %；秤、量杯、身高尺在大屏上都约为舞台高的一半（秤直径约 50 %、量杯高约 50 %、身高尺约 58 %，`geometry.ts` 的框高上限随框变大而收紧），小框（手机托盘打开）里仍占框高的大部分（秤直径 ≥ 180 px、量杯高 ≥ 200 px，e2e 查）。秤带数格子的弧时圆盘给弧留出位置；身高尺的长条比两端刻度各长出一点，端头的数不压在边线上；只有从 0 起的身高尺画地面；从非 0 开始时保留完整头部，必要时让身体延伸到最低刻度以下再以断口收尾，框内为它预留空间。成对 / 三件器具的 `label` 与括号标签共用 SVG 富文本路径（`plainText` 显示单位记号、`speakable` 提供朗读），量也必须写 `{u:…}`，裸量校验同样覆盖这些标签。
- **过渡**（M4，都 ≤ 900 ms，减少动态时直接到位）：同一种器具、同样的刻度之间换拍**不重挂载**（`BeatModel beatShape` 只认类型、单位、范围、刻度、外形）。`slide` 物体沿刻度滑到新位置（同一种物体）；`sweep` 指针按值的顺序转过去；`fill` 液面升降；`tip` 天平横梁转到新的倾角（新挂载时先按右盘空着画，再转到位）；`unroll` 指针秤 / 量杯的每条刻度沿自己的路径插值到直线上的同一位置（`straight` 从 false 到 true，或反过来卷回；`lib/instrument.ts unrollPoint` 两端精确）；`jump` 弧一条接一条；`zoom` 放大镜展开；`morph` 换器具。
- **题型**（M5，`lib/measure-tasks.ts`，括号里是 `sample` 写法）
  - `read-scale` `{ model, answer: inputSpec, tools?: ["zoom", "count"] }`：舞台只读；托盘有两个工具按钮（**放大这一段**：读数所在的那一段标数间隔进放大镜；**数格子**：点格子出现编号的弧，是草稿、不检查），然后写读数。写法 `whole`（框后印单位：`unit`，缺省器具的单位）、`measure`（数 + 单位芯片）、`compound`、`decimal`（桥）。validate 查答案 = 器具读数（物体是末端 − 起点，不在刻度上时取最近的刻度；指针、液面、箭头、头顶板；天平是右盘砝码之和）（`"13"`、`"350 kg"`、`"1,23"`、`"2.06"`）。
  - `set-scale` `{ model, target, mode: "line" | "arrow" | "load" | "fill" | "weights", weights? }`：`target` 写器具单位的数或量（`160`、`"160 g"`、`"1 l 250 ml"`）。`line`（尺 / 卷尺：从起点拖出一条线，线端是 44 px 的把手）、`arrow`（卷尺的箭头）、`load`（指针秤：拖指针，或托盘"加一点 / 拿走一点 / 多加一些 / 多拿走一些"）、`fill`（量杯：拖液面，或"倒一点 / 倒出一点……"）都是 `role="slider"`（← → ↑ ↓ 一小格，Shift 或 PgUp / PgDn 一个标数间隔，Home 回到起点，End 到头；`aria-valuetext` 是孩子自己设的读数），值吸附到刻度；`weights`（天平：点托盘里的砝码芯片放到右盘，点盘里的砝码拿下来；"看答案"把最少个数的一组画成虚线）（`"6"`、`"550"`、`"weights:500,200"`）。
  - `count-intervals` `{ model, between: [200, 300], ask: "part" | "length", then }`：`between` 两条刻度加粗；先点两者之间的每一格（格子是按钮，← → 移、Enter 点；托盘"再数一格 / 撤销最后一格"，窄于手指的格子也能做），全部点完才进入写数（`ask: part` 写每一小格表示多少，`length` 写长度）（第一段 `"parts:4"`，第二段 `"=25"`）。
  - `compare` / `order` 扩到量（`align: "unit"` 的按钮把两个量写成同族最小单位：算式行多一行 `{u:900 g} ○ {u:1000 g}`）（`"<"`、`"1 kg,1 kg 200 g,850 g"`）；`choose` 的选项可以是器具图（`model`）、量卡（`value`）或带 `{u:…}` 的句子。
  - `input` 的量：`form: "measure"`（芯片按题的 `units`，缺省继承本步 `limits.units`；独立题与练习没有步上限时取答案那一族：cm / m / km、g / kg、ml / ℓ）；`form: "compound"`（`tray/inputs/CompoundInput.tsx`：两个框、单位印在框后，满了跳下一框，小单位框空 = 0；`"1,250"`）；换算 `work: { "do": "convert", "from": "3 kg 40 g", "into": "g" }` 或 `"into": "l-ml"`（化成复合单位），validate 查它算出来 = 答案，托盘印 `{u:3 kg 40 g} =`。
- **误解**（M7）：`measure-reading` 域 11 条（`read-end-mark`、`not-nearest`、`wrong-unit`、`unreasonable-estimate`、`ignored-unit`、`size-is-mass`、`taller-holds-more`、`balance-misread`、`compound-concatenated`、`compound-place`、`compound-split-wrong`）+ 一码多域复用 4 条（`tick-counting`、`interval-misread`、`unit-factor-wrong`、`decimal-as-subunit`），规则在 `lib/diagnose/measure-reading.ts`（读数记作 L、U、M、i、n、k、a、b，docs/32 §3.6 的写法；每条 ≥ 2 正例 1 反例，`diagnose-measure-reading.test.ts`）。一道题有器具模型、是三种新题型、比 / 排 / 选量、写复合单位或量、或 `work.convert` 带量，就归这个域（`lib/measure-kind.ts isMeasureTask`；小数课第 15 步的换算仍归小数域）。**并排写法优先于 × 100**：`3 kg 40 g → 340` 只算 `compound-concatenated`，`unit-factor-wrong` 排除这个值。`size-is-mass`、`taller-holds-more`、`balance-misread`、`unreasonable-estimate` 只由 `choose` 选项诊断。validate 拒绝别的域的码和"这道题诊断不出"的码（如不是从非 0 开始的物体却写 `read-end-mark`）。
- **校验**（M8 / M11，`validate-measure.ts`，与 `check-pool` 共用 `taskIssues`）：器具画得出（字段配器具类型、`(to − from)` 是 `minor` 的整数倍、`major` 是 `minor` 的 1–10 倍、`from` 在刻度上、可见格子 ≤ 60（或配 `zoom`）、指针 / 液面 / 箭头 / 头顶板 / 物体两端在刻度上（`limits.nearest` 时物体末端离最近刻度 0.2–0.4 格）、`sub` 是同族一对、`dual` 要 `sub`、`brackets` 首尾相接且合起来 = 读数、天平写的 `tilt` 与质量一致、成对的各带 label 且同类、换算后刻度范围相同（避免相同杯身把不同容量画成一样大））；答案 = 读数 / 换算结果；`set-scale` 的 `mode` 配器具、目标在刻度上且起点不已经等于它、砝码凑得出；`count-intervals` 的 `between` 在刻度上（`ask: part` 时是相邻两个标数刻度）。**裸写的量**：有器具的课里，字幕、算式、题目、反馈、名词表和章节正文里"数 + 单位"必须写成 `{u:…}` / `<Qty>`（`bareQuantities`；`sample` 与课纲原文不查）。
- **每步上限**（M9，`limits` 新键）：`units`（题里能用的单位，与小数课的换算对 `km-m` 等共用一个键）、`parts`（每一小格允许的值）、`partsPerLabel: [少, 多]`、`maxValue`（小单位的数）、`nearest`、`compound`（允许的复合单位对；没有就不许两种单位的刻度和复合量）、`bigMax`、`smallStep`（g / ml / m 的小单位部分是它的倍数）、`weights`（天平砝码）、`dp`（有小数的步：刻度和量的位数）。`check-pool --topic <slug> --step <id>` 同样查。
- **HUD**（M10）：右上卡 **MEASURE**（`hud/cards/MeasureCard.tsx`）——讲解拍是器具的读数（大号；复合单位带 `dual` 或 `brackets` 时加一行 `= 132 cm`）、读法、"Each small part stands for 50 g / 每一小格表示 50 g"；天平写"平：一样重 / 左边重 / 右边重"。小测只给题目给的（"每 100 g 标一个数"）和 `?`；`set-scale` 给"设到"和孩子设的读数；`count-intervals` 的每一小格答完前是 `?`、旁边是孩子数了几格。**PLATE 行**（`hud/plate.ts measurePlateRows`）：MODEL RULER / TAPE / HEIGHT CHART / METRE RULER / PATH / SCALE / MEASURING CUP · UNIT · NUMBERS EVERY · SMALL PART · START · END（NEEDLE / LEVEL / ARROW）；BALANCE · LEFT · RIGHT · BEAM。小测里要读的那一行是 `?`，`count-intervals` 的 SMALL PART 答完前是 `—`，`set-scale` 是孩子设的值。**VIEW**：`MODEL_VIEWS` 加 `instrument` 和 `straight`；读 / 设指针秤或量杯的题自动多一个"拉直的刻度"（同一个器具画成数轴，读数是一个三角，`set-scale` 的游标照样能拖、能用键盘）。整数数轴（`scale: "whole"`）放宽到 `to ≤ 10 000`、`step` 任意正整数，`major` 定每隔多少画长刻度、标数。**背景章**：有器具的课画 0–1000 g、指针指着 0 的指针秤（状态行 `SPECIMEN 0 G`），规格表多一行 UNITS（课里用到的单位，按 cm · m · km · g · kg · ℓ · ml）。
- **算式行**（`lib/measure-working.ts`）：`read-scale` 是 `? g` → 孩子写的 `{u:204 g}` → 做完是读数；`set-scale` 是孩子设的读数；`count-intervals` 是 `{u:300 g} − {u:200 g} = {u:100 g} · {u:100 g} ÷ 5 = ?`；比较、排序、换算同理。都不先说答案。
- **示例主题** `sample-lesson-measure`（`status: draft`）：四步 32 道，五种器具（含断尺、卷尺、米尺、身高尺、路）、两种单位的刻度、每个叠加与过渡、三种新题型（`set-scale` 五种 mode、`count-intervals` 两种 ask）、四种写法、15 个码各至少一次；`tests/math-scene/sample-lesson-measure.test.ts` 全部自证；截图 `pnpm shoot sample-lesson-measure --beats --tasks --keys --layout`。单测另有 `compound`、`instrument`、`diagnose-measure-reading`、`measure-tasks`。

- **无障碍与指针映射**：`lib/instrument-description.ts` 描述可见范围、相邻标数与指示位置（“从二百克往后数 4 小格”），不替孩子算出读数；物体末端不在刻度上时描述相邻刻度，不替孩子四舍五入。格子按钮只报“某标数之后第几小格”，不报未标数刻度的量；天平的砝码按钮保持可被读屏访问。压短的 `skip` 卷尺拖动采用压短后的反映射；圆盘缺口吸附到较近的端点。量杯在器具上印单位，给复合括号留位置而不把杯身挤成缩略图。手机读数题的量已在作答框里，舞台不再重复这行量，把高度留给器具。砝码盘最多 12 个，validate 拒绝最少解超过 12 个的题。
- **浏览器验收**：`tests-e2e/sample-lesson-measure.spec.ts` 覆盖轴上换拍与 `unroll`、读数工具、单位误解 → 看答案 → 再来一道 / 跳过、四种滑块的纯键盘路径、拖线、按钮倒水、加减砝码、格子的 roving keys 与第二阶段输入、复合两框、拉直视图、全部 32 题的浏览器解法，以及中文 cinema 手机（390 × 844、器具大小与 44 px 控件）。正式课的练习总结仍由各课自己的 e2e 覆盖。

### 展开图与立体（docs/39 §3，N1–N10 与模型 A8）

- **立体**（N1，`lib/solid.ts`，纯函数）：`{ "type": "cuboid", "size": [3, 2, 1] }`（长 × 宽 × 高，格；三个相等 = 正方体）· `{ "type": "prism", "sides": 3–6, "edge": 2, "length": 3 }`（正多边形的底）· `{ "type": "pyramid", "sides": 3–6, "edge": 2, "height": 1.6 }`（`"regular": true` 只配 3 边 = 正四面体）· `cylinder` / `cone`（`radius`、`height`）· `sphere`（`radius`）。多面体给出顶点、面（id + 外法向逆时针的多边形）、共棱与面间角；面 id：长方体 `bottom top front back left right`，棱柱 `end-a end-b side-1…n`，棱锥 `base side-1…n`；曲面体面 id 是圆柱 `bottom top side`、圆锥 `base side`、球 `surface`。`solidClass`（cube … sphere）、`faceCounts`（底的形状在前：`2 triangles · 3 rectangles`）、`sameSolid`（转、翻后全等）。
- **模型 A8 `net`**（`schema.ts netModel`）：

  ```jsonc
  { "kind": "net", "solid": { … },
    "layout": { "cubeNet": "231-b" } | { "cells": [[0,1],[1,1], …] } | { "rects": [[1,1,3,2], …] } | { "tree": [["side-2", null], ["side-1", "side-2"], …] },
    "curved": { "caps": [0.5, 0.5] | [{ "at": 0.25, "edge": "top" }, …], "wrap": 1, "lateral": "sector" | "triangle" },
    "base": [1, 1] | 2 | "side-2", "open": "top",
    "fold": 0.5 | { "[1,1]": 1, "3": 0.5 }, "stagger": true, "view": "auto" | "top" | "iso", "turn": 0–3,
    "pairs": true, "tone": { "[1,1]": "cold", "side": "hot" }, "mark": "[1,1]", "letters": true, "numbers": true,
    "footprint": true, "grid": true, "dims": true, "labels": { "bottom": { "en": "bottom", "zh": "底" } }, "label": { … },
    "set": [ { "solid": …, "layout": …, "fold": 0, "label": { … } }, … ] }
  ```

  `cells` 只配 1 × 1 × 1、`rects` 只配 `cuboid`，y 向上同 A4；`tree` 每项 = [面, 挂在哪个面]（根 `null`；同一个面出现两次 = 多出来的一块，用来做错选项）。不写 `layout` = 标准展开图（正方体十字 `141-e`、长方体十字、三棱柱侧面一排两端挂三角形、四棱柱及以上站在底上、棱锥星形）。节点键（`tone`、`mark`、`fold`、`base`、`sample`）：格子 `"[1,1]"` / `"1,1"`、序号 `"2"`、面 id（方格布局时按折起来落在哪个面：`bottom` 是放在地上的那块）。`fold` 缺省：有 `layout` 或 `curved` 是 0，否则 1。`open` 的面折完空着、不算"空面"。正方体 11 种名字 `lib/net.ts CUBE_NETS`（`141-a…f`、`231-a…c`、`33`、`222`，表见 docs/39 §3.2）。
- **几何**（N2，`lib/net.ts`）：方格布局从 `base`（缺省邻居最多的）广度优先成铰链树，铰链 = 共用的那段边；`tree` 按"面挂面"摊平（沿共棱翻到父面另一侧）。折角 = `fold` × (180° − 面间角)，朝 +z；`stagger`（缺省）按层：第 d 层在 [(d−1)/(D+1), (d+1)/(D+1)] 里折，相邻层重叠一半（底 → 四周 → 顶）。`foldResult` → `closes`、`lands`（每块落在哪个面）、`exact`、`overlaps`、`missing`、`sizeMismatch`、`opposite(i)`；方格布局的目标盒子由放在地上的那块定（长方体缺的那条棱取剩下的长度）。`flatOverlap`（validate 拒绝摊平就重叠）、`looseNodes`、`cubeNetName`、`cubeNetPlacements`。**单测复现调研**：35 种六连方 → 11 能折 / 24 不能（8 含 2 × 2、4 一排 ≥ 5、12 只因重叠）、11 个名字一一对应、长方体 384 种生成树全不重叠且去重后 1 × 1 × 1 → 11、1 × 1 × 2 → 29、2 × 3 × 4 → 54、正四面体 16 → 2（`tests/math-scene/net.test.ts`）。
- **投影与遮挡**（N3，`lib/project.ts`）：正投影；`top` 俯视（展开图照画法读：x 右 y 上），`iso` 真等轴测（偏航 45°、俯角 35.264°），`auto` 在 fold 0–0.25 间 smoothstep（带 `open` 的开口盒只倾到 `OPEN_TILT = 0.55`、约 60° 俯角，否则正方体盒子的底正好被前面两面挡住）；`turn` 每格 90°（可以是小数，转的过渡）。画家顺序 = 两两平面测试（投影重叠时 A 整个在 B 平面之后、或 B 整个在 A 平面之前 → A 先画）+ 拓扑排序，环时最远的先画；`project.test.ts` 用 64 × 64 点对照光线投射（11 种正方体、3 种长方体、三棱柱、四棱锥、正四面体两种 × fold 0.25 / 0.5 / 0.75 / 1 × turn 0–3）。视角绕展开图的中心转（`Pose.origin`），所以从俯视到等轴测展开图的中心不动。
- **曲面**（N4，`lib/curved.ts`）：地上的圆不动；圆柱的长方形绕接点的切线竖起 90° × t，同时卷到半径 r / t 的圆柱上（48 条），另一个圆绕它挂的边再转 90° × t；圆锥的扇形绕接点切线转 t ×（180° − 母线与地面夹角），铺到展开角 2π − t(2π − θ) 的圆锥上。缝在背面。`wrap ≠ 1` 合不拢（缝 = (1 − wrap) × 2πr，单测）；`lateral: "triangle"`、两个圆在同一条长边、圆锥两个圆只能 `fold: 0`（validate）。
- **舞台**（N5，`stage/NetModel.tsx` + `stage/net/{Faces,Candidates,Labels,SolidSet}.tsx`）：面 = 纸色填充 + 1 px 墨线；卡纸里侧填充 60 %；配对色 25 % + 记号 ● ▲ ■（`--face-1/2/3`，长方体三对、棱柱两个底）；`tone` / 给定 cold、孩子的 signal、看答案墨色虚线；曲面的条带不透明、同色描边（不见接缝），只画自己的边和轮廓线（两条相邻条带一正一背处）；`grid` 方格纸（ink 18 %，折起来时淡出）、`footprint` 地上的摊平轮廓（虚线）、`dims`（铰链加粗、两侧各写那条边的格数；曲面写"绕圆一圈"）。折到 1 不合拢：叠在一起的块沿法线外移 4 % 成双线 + "2 faces here / 这里有两个面"，空面虚线 + "nothing here / 这里空着"，尺寸不配的面虚线 + "a gap here / 这里有缝"（虚线按隐藏线画法盖在图上）。球 = 圆 + 赤道（远半边虚线）。`set` 2–7 张小图一排（放不下两排），**共用一个比例**（大小保持真实），下面印 `label`。选项小图同一组件、同一比例（短了的长方形看得出短）；`choose` 的舞台模型是一个 net 时画在选项旁边（宽屏左边、窄屏上面）。**大小**：至多约舞台高的一半（`View` 传 `maxH` = 0.5 × 舞台高；1920 × 1080 约 540 px），小框里尽量大。
- **过渡**（≤ 900 ms，减少动态时直接到位）：同一个立体、同一个布局之间换拍不重挂载（`BeatModel beatShape`），`fold` 各块按层从上一拍插值到这一拍，`rotate` 转，`shade` 颜色出现；换立体 / 布局 / `set` 是 `morph` 淡入；重挂载时 `move: "fold"` 从另一端（平的或折好的）折到这一拍。比例：过渡的前 30 % 缓到"起止两态 + 中间 8 态"的并集，过渡中保持（不抖），结束后 360 ms 再缓到这一拍自己的大小（docs/39 §3.3 的偏差，见 §9）。
- **题型**（N7，`lib/net-tasks.ts`，括号里是 `sample` 写法）
  - `complete-net` `{ model: net（缺几块）, add: 1–5, candidates: "free" | "adjacent" | [[x,y] | [x,y,w,h] | [面, 挂在哪个面]], box?: [列, 行] }`：`free` = 方格纸（`box` 必填，≤ 12 × 10）上任何空格，`adjacent` = 与现有面共边的空格，列表 = 候选（键是序号）。候选是虚线框 + "+" 的按钮（≥ 44 px，`aria-pressed`），点放、再点拿走，至多 `add` 个；方向键在候选之间按方向走、Enter 放。托盘"撤销"、"清空"、`Placed 3 / 5`。**检查 = 把孩子的图折一遍**：舞台折上去（`data-settling` 期间）、停 1.5 s、合拢就停在折好的样子，否则展开回去；诊断按折叠结果（`face-size` > `overlap-unseen`）。答案不唯一：任何一组合拢都对（validate 提醒 `feedback.correct` 说"任何一个"）。（`"cells:3,1"`、`"cells:3,1;4,2"`、`"rects:2"`、`"faces:1"`、`"pick:0,2"`；列表候选从 0 数；列表是格子时 `cells:x,y` 指那个格子的候选）
  - `tap-face` `{ model: net（`mark` 给定的面）, ask: "opposite" | "bottom" }`：每个面是按钮（方向键在面之间走、Enter 选；给定的面点不了）。`opposite` = 与 `mark` 相对的面；`bottom` = 开口盒（`open`）的底（与空着那面平行的面；validate 要求按 `base` 折起来正好空在 `open`）。对了舞台折起来、这一对亮配对色 ●（底：signal）。（`"face:2,1"`、`"face:end-a"`、`"face:3"`）
  - `choose` 的展开图选项：选项 `model` 可以是 net（小图）；新字段 `solid`（选项说的立体名，没有 `text` 时自动用名字）、`folds`（"能 / 不能折成"，文字 "Yes, it folds up into the solid / 能折成"、"No, it does not / 不能折成"）；舞台展开图有 `letters` 时选项文字 `A`–`F` 按字母对应的面核对。
  - `input` 关于展开图的数：`ask: "faces"`（几个面，答案 = 舞台展开图的块数或立体的面数）、`ask: "length"`（某条棱几格，答案是立体的一个棱长），`form: "whole"`。
  - **"折一折"工具**（`tray/NetControls.tsx NetTools`，舞台右下角，模型框下面留 56 px）：FOLD 滑块（`role="slider"`，← → / ↑ ↓ / PgUp PgDn 一次 10 %，Home 摊平，End 折好；`aria-valuetext` "flat / 摊平"、"folded half way / 折了一半"、"folded up / 折好了"）+ ↺ ↻；拖动时比例按全程（0–1）固定、以展开图中心为准，画面每帧追着滑块走（不每次重新缓入）。讲解拍一直可用，换拍复原（不进 URL、不进存储）；小测里锁着，第一次检查或第二级提示后打开；练习里一直锁；`complete-net` 没有滑块（检查时折）；↺ ↻ 一直可用。窄舞台（< 400 px）只留滑块和两个按钮。
  - **算式行**：`complete-net` `6 faces?` → `5 + 1 = 6` → 做完 `5 + 1 = 6 · closes`（或 `2 on one face` / `1 face open` / `a gap`）；`tap-face` `? opposite ●` → `● opposite ●`、`? = bottom` → `found: the bottom`。网的算式固定在模型框底（图在折、在转，句子不动）。
- **误解**（N8，`nets` 域 8 条，`lib/diagnose/nets.ts`）：`prototype-only`（"不能"说给不是十字的展开图；多选漏了不是十字的对项）、`overlap-unseen`（面数对、折起来有叠面；"能"说给有叠面的）、`adjacent-as-opposite`（点了与给定面共棱的面；字母选项共棱）、`face-size`（有尺寸不配的块；写了别的棱长）、`face-count`（块数 ≠ 面数；只数了一种形状）、`prism-pyramid` / `cube-cuboid` / `curved-unrolled`（只由 `choose` 选项声明，validate 用几何核对：名字两两配对、`wrap ≠ 1` 或三角形侧面、把圆锥叫棱锥）。优先级 `face-size` > `face-count` > `overlap-unseen`（`complete-net` 的 sample 同时命中两条时 validate 报 WARN）。`diagnose-nets.test.ts` 每条 ≥ 2 正例 1 反例。
- **校验**（N6，`validate-nets.ts`，与 `check-pool` 共用 `taskIssues`）：立体范围（长方体每边 1–4 整格、`regular` 只配三棱锥、四棱柱 `edge = length` 要写成 cuboid）；布局配立体、连通、摊平不重叠、≤ 24 × 16；`tree` 每对共棱、一个根；`base` / `open` / `fold` / `tone` / `mark` / `labels` 指得到面；曲面体只能 `curved`，球只能折好、三角形侧面只能平；`pairs` 只配长方体和棱柱；`letters` / `numbers` ≤ 6 块；`complete-net` 给定 + `add` = 面数、至少一组候选合拢、`free` / `adjacent` 只配正方体格子、纸 ≤ 12 × 10；`tap-face` 答案唯一（opposite：给定的面有对面、展开图合拢；bottom：`open` 正好空着）；**曲面体不能 `complete-net` / `tap-face`**（docs/39 D3）；`choose` 的选项按几何核对（展开图小图 `correct` ⇔ 合拢且与舞台立体全等，立体小图 ⇔ 同类，`solid` ⇔ 名字对，`folds` ⇔ 说法对），错选项的码按 §3.6 核对；`limits.solids` 管每步出现的立体类（讲解拍也查）。练习"至少 5 种题型"对展开图题按问法数（`netWay`：complete-net free / adjacent / list、tap-face opposite / bottom、choose name / folds / multi / picture）。
- **HUD**（N9）：右上卡 **SOLID / 立体**（`hud/cards/SolidCard.tsx`）——讲解拍：立体名（大）、面（`6 faces · 6 squares`；展开图按块数写，开口盒 `5 faces · 5 squares`；曲面体 `2 flat faces · 1 curved face`）、FOLD 百分比，折到 1 时一行 "closes / 合拢" 或 "2 faces on one · 1 open / 两个叠在一起 · 1 个空着"；`set` 一行立体名。小测：问名字的题 SOLID 写 `?`，`complete-net` 只有 PLACED，检查对了才给面和"合拢"，`input` 的面数做完才给。**PLATE**（`hud/plate.ts netPlateRows`）：MODEL NET · SOLID · FACES · FOLD · VIEW（`TOP`、`ISO`、`ISO ↻90`…）+ `complete-net` 的 PLACED。VIEW 组只有 `net`。**背景章**：标本 = `141-e` 折到 0.5、等轴测（状态行 `SPECIMEN CUBE NET · FOLD 50 %`），规格表一行 SOLIDS（课里出现的立体类，按 cube · cuboid · prism · pyramid · cylinder · cone · sphere）。**读屏**（`lib/net-description.ts`）：平的展开图读形状、不说能不能折（"6 squares: a row of 4; one square above the 2nd; one below the 2nd." /「6 个正方形：一排 4 个；第 2 个上面一个；第 2 个下面一个。」，没有 3 个以上一排时一排一排读；长方形写尺寸，别的面写"接在 … 的上边"；曲面"a rectangle 6.3 squares long; a circle on its top edge …"），立体读名字和面（问名字时只说 "A solid"），折到 1 不合拢时读出那几句引线文字；候选与面按钮读位置（"column 2, row 1"）。**token** `--face-1/2/3`（paper 靛蓝、深绿、紫红；cinema 提亮），彼此及与 `--signal` / `--cold` / `--hot` 在正常视觉与三种色觉缺陷下 ΔE*ab ≥ 10、对底色 ≥ 3:1（`tests/theme/face-colors.test.ts`）。
- **`__atlas.engine`**：`net()` → `{ fold, view, iso, turn, result: { closes, overlaps, missing } }`（舞台上那个网此刻的样子）、`setFold(t)`（截过程中的一帧；锁着时无效）。`pnpm shoot --tasks` 截"错"和"解"之前等 `[data-settling]`（检查时折上去的那段）结束。
- **示例主题** `sample-lesson-net`（`status: draft`，占位数据）：两步 17 道 + 练习 6 道——第 1 步正方体与六连方（五拍：折好、`shade` 配对、`rotate`、`fold` 折一半 + 轮廓、`set`；题：`complete-net` free / adjacent / 格子列表、`tap-face` opposite / bottom、`choose` 的 `folds`、`multi` 小图、字母）；第 2 步长方体（方格 + `dims` + `pairs`）、三棱柱（`tree`，重挂载后折起）、四棱锥（`footprint`、`tone`）、圆柱（`curved` + "绕圆一圈"）、圆锥（卷起）各一拍；题：`complete-net` 长方形 / 面挂面、`choose` 名字（棱柱、长方体、圆锥）、圆柱和圆锥的小图选项（`wrap`、三角形、圆的个数）、`input` 面数和棱长；8 个码都在。`tests/math-scene/sample-lesson-net.test.ts` 全部自证；`tests-e2e/sample-lesson-net.spec.ts`（FOLD 纯键盘、↺ ↻、换拍复原、点候选 → 检查折起来 → 叠面诊断 → 再放 → 合拢停住、看答案折起来、再来一道 / 跳过、方向键点面、第二级提示解锁、练习不解锁、全部题浏览器里解完、中文 cinema 手机 44 px）；截图 `pnpm shoot sample-lesson-net --beats --tasks --keys --layout`。

### 舞台、阅读面板、HUD（docs/08 §2 全引擎 HUD 铁律）

- **舞台**：讲解拍由 `BeatModel` 画（只读）；结构变了（模型种类、份数）整幅重挂载并按 `move` 播放过渡，只有标记变了时逐份过渡。模型的空间（`stage/layout.ts freeRect`，纯函数有单测）取几块里最大的（按面积、宽至多算 2.2 × 高）：两列之间整高、两列之下整宽、**短的一列之下、长的一列旁边**（1024 × 768 阅读面板开着时：右列只有卡片，模型在卡片下、左列旁边）；舞台宽 < 860 px（阅读面板开在旁边的 1024–1279 px 屏）时控制面板像手机一样折成 "TOOLS AND KEY" 按钮，右列变短，模型约 334 × 360 px（以前夹在两列之间只有 48 px 宽，每拍的算式都溢出）。模型下方一行算式（`.ms-equation`，贴在模型包围盒下方）：讲解拍 = `equation`，小测 = `workingLines` 的最后一行（不先说答案），练习不显示；**算式框不再等于模型宽**：至少模型宽，要更宽时取那一高度上 HUD 面板之间的空当（`spanAt`，尽量以模型为中心），还放不下才把字缩小（至多到 72 %），再放不下才折行，从不溢出、不被裁（`.ms-equation-measure` 是量字宽用的隐形副本）。
- **底部 = 章节轴**（core `ChapterAxis`）：每章一段，讲解拍是圆点，小测和练习题是小方块（引擎给刻度加 `data-shape="square"`）；点段 = 第一拍，点刻度 = 那一拍 / 小测；不自动跑；右端 `07 · 3/6`（小测时加 `· CHECK`；手机不显示）；⌄ 收起（HUD store `panelsOpen`）。
- **阅读面板**：章头 → 节拍行（`BEAT 2/5` + 字幕，‹ › 同 `,` / `.`，跨章）→ 小测托盘（在方块上时）→ 正文 → 本章索引（要点、课纲对照 + 来源芯片、"做一做本章的小测"）。**1024 px 以下**阅读面板是抽屉，小测托盘停在舞台底部、章节轴上方：引擎把托盘高度写到 `.atlas-scene` 的 `--task-h`，`math-scene.css` 给 HUD 网格加一行带，左右两列在带上方结束（布局检查覆盖托盘）。
- **右上卡** FRACTION：讲解拍 = 这一拍的分数（没有时写"舞台上还没有分数"），小测 = 孩子写的 / 标的值；比较题 `a ○ b`，加减题写算式；展开 = 等值的名字与最简分数。**左列 PLATE 块**：MODEL · PARTS · MARKED · VALUE（练习：QUESTION · ANSWERED · ASSISTS OFF），可收起（sessionStorage `atlas:plate`），手机隐藏。没有底部三面板。
- **视图**：VIEW 组只在小测时出现 = 这道题能画的模型（`lib/lesson.ts canShow`），`presets.current` 由引擎决定。**模式**：S / E / N / 宿主 L / P，练习里 S / E / N 禁用、L 不注册。**命令**：C 检查、I 提示、U 撤销（core `commands`）；`,` / `.` 翻拍（core `beatStep`）；← → 换章。
- **小测**：反馈同前（对 → `correct` + 脉冲；错 → 诊断句或 `fallback`；`not-simplest` 不算尝试；两次不对后"看答案"）；"你的尝试"列出每次检查（✓ / ○ + 当时的答案）；"再来一道"从题库再抽；"跳过"去下一章。练习每题只检查一次，第 8 题后总结。

### 演示、URL、测试 API、截图

- **演示**（core `usePresentation`）：`lib/beats.ts` 从数据推拍：每步 = 讲解拍 + 小测拍（字幕"轮到你了"，托盘在字幕卡里、带题目句）；练习每题一拍 + 总结一拍；背景章一拍。`gate`：小测拍在答对、看答案或"跳过"之前，自动播放不前进。
- **URL**：`ch`、`b`（≠ 1 才写）、`model`（≠ 题目默认才写）；作答、抽到的题、进度、练习结果从不进 URL、不进 storage。
- **`__atlas.engine`**：`task()`（`{ step, beat, slot, index（题库第几道）, id, kind, phase, answered, done, tries, hints, revealed, attempts, feedback, practice }`）、`tasks()`（每道题库题 / 练习题 `{ step, index, id, kind, practice, wrong }`）、`goToTask(step, i, { instant })`（第 i 道题库题作为这一章的小测；练习章 = 第 i 题）、`goToBeat(chapter, i)`、`another()`、`skip()`、`solve()`、`answer(code | 'correct')`、`act(action)`、`practice()`。
- **`pnpm shoot <topic> --tasks`**：每道题库题三张 `task-<step>-<n>`、`-wrong`、`-solved`（所有题型同一条路：`goToTask` → `answer(code)` → 检查 → `solve()` 逐段做完）；练习每题 `practice-q<n>` + `practice-summary`。`--beats` 每拍一张（小测拍带字幕卡里的托盘）。`--keys` 核对 C / I / U 与 `,` / `.`。
- e2e：`tests-e2e/area-perimeter.spec.ts`（点刻度换拍、方格题点按与纯键盘作答、量的单位芯片、练习、zh、390×844）；`tests-e2e/fractions.spec.ts`（点刻度换拍、节拍行与 `<Beat>`、方块打开小测、点按 / 纯键盘作答、错 → 诊断 → 看答案、再来一道、跳过、练习与总结、URL、演示停在小测、zh、390×844、七尺寸布局 en / zh）。

## PWA、部署与 e2e（Phase 3）

- **PWA**：`@vite-pwa/astro`（`astro.config.mjs`），`generateSW` + `autoUpdate`。预缓存构建出的页面、JS、CSS、图标；`/geo/*.json`、`/models/*.glb` 与 `/topics/*/data.json`（引擎数据）**不**预缓存，走 CacheFirst 运行时缓存（没有 `maximumFileSizeToCacheInBytes` 例外：预缓存里不该有大文件）。scope / start_url 跟随 `ATLAS_BASE`。仅生产构建注册（BaseLayout 里 `import.meta.env.PROD`），`pnpm dev` 无 service worker。
- **图标**：`pnpm tsx scripts/build-icons.ts` 用 sharp 生成 `public/icons/*.png`（192 / 512 / maskable-512 / apple-touch-icon），产物入库。
- **部署**：见 [07-deploy.md](07-deploy.md)。`public/_headers` 管缓存与安全头。
- **e2e**：`tests-e2e/smoke.spec.ts`（冒烟）+ `tests-e2e/hud.spec.ts`（六尺寸 HUD 布局、键与按钮同步、`__atlas`），`playwright.config.ts` 用 `pnpm preview` 起 `dist/`，所以先 `pnpm build`。**每个 checkout 测自己的 build**：端口由 checkout 的路径算出（4400–5399，主 checkout 是 4937），几个 git worktree 同时跑 `pnpm e2e` 互不相干；`ATLAS_E2E_PORT` 指定端口；端口上已有的服务只在 `ATLAS_E2E_REUSE=1` 时复用（自己在这个 checkout 里起的 `pnpm preview --port <端口>`），否则端口被占就报错，不会去测别人的 build。首次需 `pnpm exec playwright install chromium`。截图写入 `tests-e2e/__screenshots__/`（git 忽略，本地肉眼检查用）。

## URL 参数

页面 URL 就是场景状态。与「当前章节目标」相同的值不会写进 URL，所以普通章节链接只有 `?ch=<id>`（SpaceScene 停在某一拍时基线是这一拍的场景，链接只有 `?ch=<id>&b=<n>`）；其它 query（如 `utm_*`）原样保留。非法值被丢弃，不报错。

| key | 含义 | 取值 | 引擎 | 例 |
|---|---|---|---|---|
| `ch` | 当前章节 | 章节 id | 通用 | `ch=power-on` |
| `b` | 本章的当前拍（章节轴） | 1 起的整数；不写 = 本章自身状态（SpaceScene：打开 = 章节轴上的这一拍，含拍的 `sim.set` 与镜头，URL 里写了的字段优先；MathScene：= 1 时不写；讲解拍之后的一拍是小测，练习章第 k 拍是第 k 题） | SpaceScene、MathScene | `ch=training-the-chest&b=2` |
| `layers` | 打开的图层 / 组 | 逗号分隔 id；空值 = 全关 | 通用 | `layers=control,battles` |
| `cam` | 镜头 | 地图 `lng,lat,zoom[,pitch[,bearing]]`；3D `px,py,pz,tx,ty,tz`；空值 = 无 | 通用 | `cam=103.8,1.35,7.5` |
| `theme` | 场景主题 | `paper` \| `cinema` | 通用 | `theme=cinema` |
| `t` | 当前时间 | `YYYY` / `YYYY-MM` / `YYYY-MM-DD` / `<n>ma`（地质时间，如 `200ma`）；空值 = 无 | TimeScene | `t=1942-02-10` |
| `hl` | 高亮对象 | 逗号分隔的实体 / 行动 / 事件 id；空值 = 取消高亮 | TimeScene | `hl=battle-of-singapore` |
| `part` | 选中零件 | 零件 id；空值 = 不选 | SpaceScene | `part=compressor` |
| `view` | 视图 | `assembled` \| `xray` \| `exploded` \| `isolate` | SpaceScene | `view=xray` |
| `explode` | 拆开程度 | 0 到 1 | SpaceScene | `explode=0.35` |
| `run` | 通电运转 | `1` \| `0` | SpaceScene | `run=1` |
| `cut` | 剖切 | `none` \| `half` \| 命名剖切面（`views.cuts`，数据里没有就不切） | SpaceScene | `cut=sagittal` |
| `pose` | 姿态 | `parts.json` `poses` 里的名字；空值 = 静止 | SpaceScene | `pose=wings-open` |
| `sim` | 试一试的控件值（本章 `sim.set` 之外、读者或拍改过的） | `控件.值` 用 `~` 连，键排序；开关 `on` / `off`，步进写数，选择写选项 id；与基线（本章，或带 `b` 时这一拍）相同时不写；写了就整组替换基线的值 | SpaceScene | `sim=cells.3~flip-2.on` |
| `model` | 小测的模型视图 | `bar` \| `circle` \| `numberline` \| `wall` \| `barmodel`；= 题目默认时不写 | MathScene | `model=circle` |

新增可链接字段：改 `core/types.ts` 的 `UrlEngineFields`、`core/url-state.ts`（`URL_KEY_ORDER`、编解码）、`SceneHost.tsx` 里解构的字段、descriptor 的 `fromUrl`，并补 `tests/url-state.test.ts`。

## Geo pipeline（`scripts/geo/lib/`，每个主题 `scripts/geo/<slug>/`）

真实地图主题的控制区关键帧（`src/content/topics/<slug>/data/control.json`）由这条管线生成，CLAUDE.md 的"地图类内容必须用真实数据"由它落实。代码在 `scripts/geo/lib/`：`common.ts`（路径、工具、mapshaper、几何）、`manifest.ts`（清单类型、`PIPELINE_DEFAULTS`、`pipelineConfig()`）、`topic.ts`（按 `--topic` 定位主题目录与清单），库模块 `fit.ts svg.ts raster.ts capes.ts`，以及七个可运行步骤。每个主题一个目录 `scripts/geo/<slug>/`：清单 `sources.json`、来源记录 `SOURCES-GEO.md`、可选 `check-colors.json`，以及 gitignore 的 `raw/`（下载）和 `work/`（中间 GeoJSON）。工具（mapshaper、osmtogeojson）装在共享的 `scripts/geo/.tools/`（gitignore）。ww2 的来源调查、每帧方法、控制点残差、许可证见 `scripts/geo/ww2/SOURCES-GEO.md`；主题内的来源表是 `data/SOURCES.md`（`[G#]`）。操作手册：skill `atlas-history-topic` 的 `references/geo-runbook.md`。

清单 `sources.json`：数据集（`ref` / url / license；`cshapes` 是底图，底图要素标它的 `ref`；`ne-admin1` 供省份选择器）、OHM 关系集（按日期）、SVG / 位图地图（类别颜色、控制点、残差预算）、关键帧配方（CShapes GW 代码 → 实体，再按顺序叠加的步骤，后者覆盖前者），以及可选的 `pipeline` 块：焦点框、预算、量化、简化与海岸规则，缺省值 = ww2 的取值（`PIPELINE_DEFAULTS`）——`plannedKeyframes` 12、`budgetMB` 2.0、`focus`（欧洲 / 中东、东亚 / 西太平洋两个框）、`fineStartKm` 1.5、`fineStepKm` 0.25、`coarseKm` 50、`method` dp、`quantization` 400000、`islandsKm2 { focus 20, coarse 300 }`、`coast { enabled true, land public/geo/land-50m.json, detailLand public/geo/land-10m-sea.json, detailBox [95,-9,125,22], excludeBox null, worldBox [-180,-60,180,86], gapKm 6, islandKm2 2, outsideKm 2, skipKm 15 }`、`checkColors`、`shots`（默认 `docs/screenshots/<slug>`）。`detailLand` / `detailBox` 要么都给、要么都 `null`（没有细海岸区）。命令行参数覆盖清单。

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
- 选择器（`compose.ts`）：`cshapes`（`partsAt` 只取包含某点的岛，`at` 取另一天的国界）、`ohm`（`set` 取另一关键帧的关系集）、`admin1`（Natural Earth 省份）、`svg` / `raster`（类别，`coastFillKm` 让占领区沿底图海岸补齐）、`svgFrame` / `rasterFrame`、`parts`（保留或 `drop` 包含某点的单个多边形）、`bbox`、`union` / `intersect` / `difference`，以及（`four-taps` 起）`geojson`（raw/ 里一份 GeoJSON 数据集按属性筛要素：`where` 等于某值或其中之一，`match` 正则、不分大小写，如 `{ "geojson": "ura-landuse", "where": { "LU_DESC": "WATERBODY" } }`）和 `overlap`（`{ "overlap": A, "within": B, "minShare": 0.5 }`：A 的单个多边形里面积至少 `minShare` 落在 B 之内的那些——用一个数据集的轮廓挑另一个数据集的地块，边界不混用，如"OSM 名为 MacRitchie Reservoir 的面里的 URA 水体地块"）。没有 `cshapes` 数据集、关键帧不写 `base` 的主题（岛尺度）只由步骤组成；关键帧的 `ohm` 可省。不允许手画多边形；`bbox` 只用来选取已有几何的一部分。
- 数据集下载（`fetch.ts`）：除 `url` 外，`datagov: "d_…"`（data.gov.sg 数据集 id，经 API `poll-download` 取当时的签名链接）和 `overpass: "<Overpass QL>"`（OpenStreetMap，构建期查询，原始响应存 `<file>.osm.json`，osmtogeojson 转成 `file`；依次试 overpass-api.de、private.coffee、kumi 三个实例）。每次下载在 `raw/fetch-log.json` 记大小、SHA-256、时间与来源，抄进 SOURCES-GEO.md。
- 岛尺度的清单旋钮（缺省 = ww2 的值，ww1 / ww2 的 `control.json` 逐字节不变）：`pipeline.compose { lightM 300, sliverKm2 5 }`（compose 的预简化间隔与最后的碎片过滤）、`pipeline.clean { snapDeg 0.005, sliverKm2 1 }`（simplify 量化后的顶点合并与最小环）。`four-taps` 取 5 m / 0.005 km² 和 0.00005° / 0.005 km²，`coast.enabled: false`（蓄水池是内陆水面，不沿海岸裁；海岸补齐会把全岛涂成一个 holder），`coast.land` = `public/geo/land-sg.json`（check.ts 也读 TopoJSON 陆地）。`check.ts` 的 `checks[].source` 若是 `.geojson` 数据集，右边画成第二张同视角地图（轮廓 + 名称），作为独立数据集的并排核对。
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
- **区域图版陆地**（docs/27，`basemap.region`）：`pnpm tsx scripts/geo/lib/region-land.ts --topic <slug> [--simplify <km>] [--budget <KB>]` 读 topic.yaml 的 `basemap.region`（`bounds`、`land`），把 Natural Earth 1:10m 陆地（`world-atlas` 的 `land-10m.json`，公有领域，node_modules 里已有）裁到图版外扩 `padDeg`（0.25°，纸边盖住，图版边上不留缝）、逐环 DP（`simplifyKm` 1）、丢 < `minIslandKm2`（4）的岛和湖，写 `public/geo/<land>.json`：TopoJSON 一个对象，`kind: land` MultiPolygon + `kind: coast` MultiLineString（只含真海岸弧，裁切直边不进 coast；与 `land-10m-sea.json` 同一做法，纯函数在 `scripts/geo/lib/region.ts`，单测 `tests/geo-region.test.ts`）。超预算（`budgetKB` 200）时 DP 每次 ×1.5 重来。旋钮在清单 `pipeline.regionLand`（可没有清单）。打印体积、多边形 / 顶点 / 海岸弧数、实际 DP 和 `rings: N, zero-area 0, self-crossing 0`。实测：中国东部 [100, 20, 125, 44] 约 35 KB；`sample-region` 10 KB。跨一个大洲的图版（ancient-civilisations 的 [-12, -12, 135, 58]）逐环 DP 会在长海岸、窄水道（恒河三角洲、不列颠）留下自交环：清单写 `regionLand.mapshaper: true`（可选，缺省关，别的图版不变）先用 mapshaper 裁到外扩框、`-simplify dp interval=<simplifyKm> keep-shapes` 再 `-clean`，然后切图版时不再二次简化；还要把 `quantization` 提高到 1,000,000（20 万格时三角洲的近邻顶点吸附后又交叉）。实测 261 KB、784 个多边形、0 / 0。
- **按国配色**：`pnpm tsx scripts/geo/lib/colour-holders.ts --topic <slug> [--keep] [--write]`，见「按国配色」。改了关键帧就重跑。
- **岛尺度底图**（docs/17 C1，`four-taps` 起）：`topic.yaml` 的 `basemap: { local: land-sg, maxZoom: 13 }`（schema `basemapOptions`）。`local` 是 `public/geo/<local>.json`（TopoJSON，一个对象 `<local>`，几何带 `kind: mask` 与 `kind: land`），由 `scripts/geo/lib/local-land.ts --topic <slug>` 按清单 `pipeline.localLand` 生成：`land-sg` = URA 2019 总体规划规划区边界（No Sea，data.gov.sg，SODL v1.0）并成一个面、DP 5 m、丢掉 < 0.02 km² 的小岛，再挖掉内陆水面（`water`：URA `WATERBODY` ≥ 0.02 km²——河、运河、海湾、河口蓄水池；只有淹没山谷而成的蓄水池（`keepMatch`：麦里芝、贝雅士上下段、实里达上段、勿洛、德光岛、裕廊湖）保持陆地色，因为关键帧按年份给它们上色，建成前它们是陆地；河口蓄水池建坝前本来就是河口水面），约 84 KB（预算 150 KB），原始边界顶点到成品海岸的偏差 p50 0.9 m、p95 4.8 m；`mask` = 它取代的 10m 新加坡多边形外扩 400 m、减去柔佛与廖内的 10m 陆地（水色铺上去盖住旧海岸，不盖邻国）。GeoStage 只对设了 `basemap.local` 的主题在地图 load 后 fetch 它，zoom 9.4 起绘制、9.6 完全显现（渐变区间短：两条半透明的海岸会叠成重影；章节镜头取 ≤ 9.3 或 ≥ 9.6）（mask 水色 → 陆地 `--land` → 轮廓 `--land-edge` 1.2 px，叠在 10m 层之上、控制区之下）；`maxZoom`（默认 10，可到 16）放开地图缩放上限。其他主题不加载、不受影响。
- **岛尺度底图 · 按年代的海岸**（docs/28 §4 E1 / E2 / P1，`singapore-1819-1965` 起）：
  - **数据**：`basemap.local` 文件里的 `kind: land` 可带 `from` / `to`（`[from, to)`，与河流同一语义，`lib/dated.ts`）——每个是**一整块完整的岛岸**（一个时代一块，不是增量）；可选 `kind: coast-today`（LineString / MultiLineString）= 今天的海岸线。其余属性（`id`、`src`、`certainty`…）引擎不读。`pnpm validate` 见「校验规则」（每段都带日期、不重叠、无空档、首段可无 `from`、末段可无 `to`）。
  - **引擎**：载入后 `lib/localLand.ts` `parseLocalLand` 给每个带日期的陆地打 `era` 下标；controller 按播放头取**唯一一个**时代（`localEraAt`：落在某段里就是它；在所有段之前取最早的，之后取最后开始的），只在时代变化时对 `ts-land-local-fill` / `ts-land-local-edge` `setFilter`（`localLandFilter(era)`，不逐帧），数据到达之前就先设好滤镜，所以任何时候屏幕上只有一条海岸：时代切换是瞬时的，没有两条半透明海岸的叠影（缩放 9.4–9.6 的 10m → 岛岸渐变不变）。**没有日期的文件（four-taps 的 `land-sg`）**：集合原样 `setData`、滤镜保持 `['==', ['get', 'kind'], 'land']`、不打 `era`，样式与行为不变（`tests/time-scene/local-land.test.ts`；four-taps 截图逐像素比对过）。
  - **今天的海岸线**（图层 `ts-land-local-today`）：墨色 `--ink` × 0.35、0.8 px、`line-dasharray` [2, 2]，zoom ≥ 9.4（与岛岸同一渐变），在岛岸之上、数据图层之下；跟 **N**（名称）开关显隐。文件里有 `coast-today` 时（controller 的 `onLocalLand` 回调告诉 View），图例加一行 "Today's coastline / 今天的海岸线"（`line-dashed` 样式），N 关时不列。没有 `coast-today` 的文件这一层是空的。
  - **管线**：清单 `pipeline.localLand.eras: [{ id, from?, to?, outline?, minus?: [...], plus?: [...], src?: [G#…] }]` 与 `coastToday: true`（纯函数 `scripts/geo/lib/local-eras.ts`，步骤 `local-land.ts`）。每段从**今天的陆地（未简化、已挖掉内陆水面）**出发：裁到 `outline`（一张老测图描出的整岛海岸），擦掉每个 `minus`（那时还是海、后来填出来的块），加上每个 `plus`（那时有、今天没了的小岛 / 沙洲）；输入是来源图描出的面（`lines.ts` / `georef-*.ts` 的产物，GeoJSON 或 TopoJSON），`work/` 或 `raw/` 开头的路径相对主题目录，其余相对仓库。然后 mask、各段、今天的海岸线（今天陆地的外环）**放进同一个 mapshaper 数据集**一起 DP 简化（各段共用的海岸是同一条弧，只存一次），量化后再以约一格（0.00001°）`-clean` 一次（量化会把 DP 顶点折回成几米长的尖刺，`rings` 检查报 self-crossing），写成一个对象 `<id>`，每段属性 `{ kind: land, id, from?, to?, src? }`。先校验 `eras`（id 唯一、区间铺满时间一次），再打印每段面积与今天陆地之差（km²）、体积 / 预算、`rings: N, zero-area 0, self-crossing 0`、今天海岸线的偏差；每段解码回 `work/coast-<id>.geojson`（就是发布出去的那块，给 compose 的 `geojson` / `intersect` 裁新加坡要素）。没有 `eras` 时走原来的单段路径（`land-sg` 重跑逐字节不变；`coastToday` 也可用于单段）。单测 `tests/geo-local-land.test.ts`。
- **按年代裁过的要素不再沿底图海岸**（docs/28 P2，`simplify.ts`）：`pipeline.coast.excludeBox: [w, s, e, n]`（缺省 `null`）：这个框里不做海岸一步。底图陆地和水都挖掉这个框，于是框里的要素不被擦水、框外的 holder 也不会补缝长进来；框里的要素保持 compose 给它的海岸（新加坡要素已按时代 `intersect` 到 `work/coast-L#.geojson`）；柔佛、廖内等框里的邻国要素也就不再裁到 10m 海岸，需要的话在 compose 里 `intersect` 到 10m 陆地。偏差统计在框里不跳过"海里"的点。
- **分框细度**（docs/28 P3，`simplify.ts`）：`pipeline.focus` 的一项可以写成 `{ "box": [w, s, e, n], "fineKm": 0.005 }`，这个框用自己的固定间隔（岛尺度要几米，区域框照旧 1 km 上下）：先从普通焦点框里挖出来，单独简化，用自己那份陆地沿海岸（与 inside / outside 两半同一做法）；排在前面的框在重叠处优先。自动预算搜索只调普通焦点框的间隔。没有这种项、没有 `excludeBox` 时产物与以前逐字节相同（ww1、ww2、warring-states、four-taps 的 simplify 改前改后各跑一次比对过）。
- 东南亚近景底图：`scripts/build-geo.ts` 另出 `public/geo/land-10m-sea.json`（Natural Earth 1:10m 陆地，裁到 95°E–125°E、9°S–22°N，TopoJSON，约 234 KB）。GeoStage 在镜头 zoom ≥ 6.5 且视野与该框相交时才 fetch；zoom 7 起绘制、到 8 完全显现：框内先铺一层水色遮住 50m 陆地（不透明度 7→8 渐入），10m 陆地和海岸线叠在上面，颜色同为 `--land` / `--land-edge` / `--water` token。其他主题不加载它。

#### orbit-rotation 内容补记（2026-10-27）

正式 `sun-earth-moon` 复用夹具的13控件/23输出/9绑定/2 overlays，加入正文、出处与逐拍验收。`orbital-plane` 的既有 guide 几何补上法线及地轴倾角弧（`orbitalTiltGuide`），弧与法线从同一物理 axis 生成，零倾角时弧退化到法线；不另建可选对象。无普通 orbit 输出显隐绑定，因此保留 §9.2 运行中普通绑定的已知边界。浏览器验收由主会话执行，见主题 REVIEW.md。
