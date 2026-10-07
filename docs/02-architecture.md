# 02 · 技术架构

## 技术栈

| 层 | 选型 | 为什么 |
|---|---|---|
| 站点框架 | Astro 5，`output: 'static'` | 内容型站点最合适；content collections + zod 做内容校验；只给交互部分加载 JS |
| 交互岛 | React 19 + TypeScript | 引擎用 React 写，Astro 以 `client:visible` 挂载 |
| 包管理 | pnpm（本机 9.15） | 已装 |
| 样式 | Tailwind 4 + CSS 变量 token | 主题切换靠 token，不靠类名 |
| 地图 | MapLibre GL JS | 开源，矢量渲染，样式完全可控 |
| 3D | three.js + @react-three/fiber + @react-three/drei | 空间拆解引擎 |
| 图表/几何 | d3-geo, d3-scale, d3-interpolate | 投影、插值、关键帧过渡 |
| 动画 | framer-motion（UI）、three 自带 AnimationMixer（3D） | 一期不引 GSAP |
| 状态 | zustand | 每个 Scene 一个 store，状态可序列化到 URL |
| 校验 | zod + 自写脚本 | 构建前检查双语完整、引用的 geo/model 文件存在 |
| 测试 | vitest（数据层）+ Playwright（关键交互截图） | 截图回归对动画类项目最有用 |
| 部署 | Cloudflare Pages | 静态，零成本 |

二期候选：deck.gl（大量动态箭头）、geo-morpher（GeoJSON 变形，板块漂移用）、matter.js（物理模拟）。

### 底图策略

不用外部瓦片服务。陆地、海洋、湖泊、河流用 Natural Earth 50m 的 GeoJSON/TopoJSON 自带，MapLibre 作为 GeoJSON source 渲染。好处：

- 样式随主题 token 变（纸色主题是米黄陆地、浅蓝海；电影主题是深灰陆地、黑海）
- 离线可用，iPad 封装后不依赖网络
- 没有 API key、没有配额

历史国界用 UMN Historical National Boundaries（1914/1939/1945）加手工关键帧多边形。OpenHistoricalMap 作为二期可选增强，不作为依赖。

## 目录结构

```
atlas/
  docs/                         # 本套文档
  src/
    pages/[locale]/             # /en/... /zh/...
      index.astro               # 主题索引（按学科/年级筛选）
      topics/[slug].astro       # 主题页：挂 Scene 岛 + MDX 正文
    content/
      config.ts                 # collections + zod schema
      topics/<slug>/
        topic.yaml              # 元信息（学科、年级、形态、主题色、状态）
        chapters/<nn>-<id>.mdx  # 章节正文，frontmatter 里是章节状态定义
        data/*.json             # 引擎数据（关键帧、事件、箭头、零件清单）
    engines/
      core/                     # Scene 契约、chapter 驱动、URL 状态、i18n hook
      time-scene/               # 时间演化引擎
        stages/geo/             # MapLibre 舞台
        stages/diagram/         # SVG 关键帧舞台
        timeline/               # 章节节点 + 细拖条
      space-scene/              # 空间拆解引擎
        stages/model3d/         # R3F 舞台
        stages/layer2d/         # SVG 分层舞台
        explorer/               # 选中/隔离/透视/爆炸/运转 控制
      widgets/                  # InfoPanel Legend LayerToggles QuizCard Counter
    i18n/
      ui.en.json ui.zh.json     # 界面文案
      index.ts                  # t() + locale 路由
    theme/
      tokens.css                # :root[data-theme=paper|cinema]
      map-style.ts              # 由 token 生成 MapLibre style
    lib/                        # geo 工具、时间工具、url 状态
  public/
    geo/                        # natural-earth-50m.topojson, borders-1939.geojson ...
    models/                     # *.glb
    img/
    fonts/
  scripts/
    validate-content.ts         # 双语完整性、引用存在性、schema
    build-geo.ts                # 从 Natural Earth 原始数据生成精简 TopoJSON
  tests/
  astro.config.mjs
  package.json
```

## 内容模型

### topic.yaml

```yaml
id: ww2
title: { en: "World War II", zh: "第二次世界大战" }
subtitle: { en: "How the world went to war, 1939–1945", zh: "1939–1945，世界如何走向战争" }
subject: social-studies          # social-studies | science | geography | history | biology | math | extension
levels: [P4, P5]                 # 适用年级，索引页筛选用
moe:                             # 对齐 MOE 大纲的锚点，自由文本
  - "SS P4: The End of World War II"
  - "SS P5: The Fall of Singapore; Life Under Japanese Rule"
mode: time                       # time | space | both
engine: time-scene
stage: geo
theme: cinema                    # 该主题偏好的主题，可被用户全局设置覆盖
sensitivity: guarded             # open | guarded（有家长模式内容）
status: draft                    # draft | ready | published
cover: ./cover.jpg
```

### 章节 chapter（MDX frontmatter）

章节是故事节点。时间轴上的节点、3D 场景里的"步骤"都是同一个结构。

```yaml
id: fall-of-singapore
order: 6
title: { en: "The Fall of Singapore", zh: "新加坡沦陷" }
level: P4                        # 本章最低适用年级
sensitive: false
state:                           # 引擎进入本章时要达到的状态（引擎各自解释）
  time: "1942-02-15"
  camera: { center: [103.8, 1.35], zoom: 7.5, pitch: 30 }
  layers: [control, movements, battles]
  highlight: [kota-bharu, johor-crossing, bukit-timah]
  theme: cinema
quiz:
  - q: { en: "Which direction did the Japanese army come from?", zh: "日军是从哪个方向打过来的？" }
    options: [{ en: "From the sea in the south", zh: "从南边海上" }, { en: "Down the Malay Peninsula from the north", zh: "从北边沿马来半岛南下" }]
    answer: 1
```

MDX 正文用 `<Lang en>…</Lang><Lang zh>…</Lang>` 或双栏 frontmatter 字段，构建时按 locale 取。

### 引擎数据 data/*.json

每个引擎定义自己的 zod schema（见 03）。共同约束：

- 所有展示文本是 `{ en, zh }`
- 所有 id 是 kebab-case，全主题内唯一
- 日期用 ISO 字符串，支持 `1942`、`1942-02`、`1942-02-15` 三种精度；地质时间用 `{ ma: 200 }`（百万年前）

## 国际化

- 路由前缀 `/en/` `/zh/`，Astro 内置 i18n，默认 en
- 界面文案走 `ui.<locale>.json`
- 内容文案走 `{ en, zh }` 字段，`t(field)` 取当前语言，缺中文时回退英文并在构建时报警
- 语言切换保留当前 Scene 状态（URL 其它参数不变）
- 中文字体：思源宋体/黑体子集化，英文：一款衬线标题 + 一款无衬线正文

## 主题

两套主题同时支持，用 `data-theme` 切换，token 在 `theme/tokens.css`：

| token | paper（默认） | cinema |
|---|---|---|
| bg | 米黄 #F4ECD8 | 近黑 #0E1116 |
| ink | 深棕 #2B2117 | 浅灰 #E6E6E6 |
| land / water | 纸色 / 淡青 | 深灰 / 黑蓝 |
| accent-axis / allied / neutral | 砖红 / 靛蓝 / 灰褐 | 橙红 / 青蓝 / 灰 |
| glow | 无 | 有（箭头、脉冲） |

- 站点默认 paper；主题可在 `topic.yaml` 里声明偏好（二战用 cinema），用户全局开关可强制
- MapLibre style 由 token 生成，不手写两套
- 3D 舞台的环境光、背景也读 token

建议：先按"paper 为站点基调、cinema 为战争类主题偏好"做，两套都要能跑通。

## URL 状态

```
/en/topics/ww2/?ch=fall-of-singapore&t=1942-02-10&layers=control,battles&cam=103.8,1.35,7.5
/en/topics/aircon/?part=compressor&view=xray&run=1
```

Scene store 的可序列化部分双向绑定到 query string，用 `history.replaceState` 不刷新页面。

## 年龄与敏感内容

- 章节 `level` 低于当前选择年级的照常显示；高于的折叠成"再长大一点再看"
- `sensitive: true` 的段落默认显示柔化版本，家长模式（本地开关，localStorage）显示完整版本
- 伤亡数字一律用"一个图标代表 N 人"的可视化，不出现血腥图片

## iPad 封装准备（一期就遵守）

一期不做 App，但以下约束从第一天起生效，二期用 Capacitor 把 `dist/` 原样包进去即可：

1. 纯静态输出，无 SSR、无 API 路由、无 Node 运行时代码进客户端
2. `base` 可配置，资源路径相对
3. 所有交互用 Pointer Events，可点目标 ≥ 44px，关键操作不依赖 hover
4. 底图、模型、字体全部本地资源，无运行时外部请求（Wikipedia 图片等外链一期不接）
5. PWA：manifest + service worker 预缓存，离线能打开已访问主题
6. 性能预算：单主题首屏 JS ≤ 300 KB gz；地图类主题（MapLibre 本身约 275 KB gz）放宽到 ≤ 400 KB gz；GeoJSON ≤ 2 MB，glb ≤ 10 MB
7. 不用 `localStorage` 存关键状态（家长模式、语言偏好可以）

## 质量门槛

- `pnpm validate`：schema、双语、引用、id 唯一
- `pnpm test`：数据层单测（时间插值、关键帧选择、URL 编解码）
- `pnpm e2e`：每个 published 主题的每一章截图比对
- Lighthouse：性能 ≥ 90，无障碍 ≥ 90（色彩对比在 paper 主题要额外注意）
