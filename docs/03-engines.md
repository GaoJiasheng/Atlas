# 03 · 引擎规格

## 共同契约：Scene

每个主题页挂一个 Scene 岛。Scene = 舞台（Stage）+ 控制器（Controller）+ 章节（Chapters）+ 部件（Widgets）。

```ts
interface SceneProps {
  topic: TopicMeta
  chapters: Chapter[]          // 来自 MDX frontmatter，按 order 排序
  data: unknown                // 引擎自己的 zod 解析结果
  locale: 'en' | 'zh'
  initialState?: Partial<SceneState>   // 来自 URL
}

interface SceneState {         // 可序列化，和 URL 双向绑定
  chapter: string | null
  layers: string[]
  camera: CameraState
  theme?: 'paper' | 'cinema'
  // 引擎扩展字段：time（TimeScene）或 part/view/run（SpaceScene）
}
```

章节驱动：点章节节点 → 引擎把 `chapter.state` 做成目标状态 → 控制器用过渡动画到达（镜头 flyTo、时间插值、零件淡入淡出）→ 右侧 InfoPanel 显示本章 MDX 正文 → 章末 QuizCard（可关）。

共享部件：

| 部件 | 作用 |
|---|---|
| ChapterRail | 章节节点列表（左侧或底部），当前章高亮，支持键盘 ←→ |
| InfoPanel | 章节正文、选中对象详情，双语 |
| Legend | 图例，随 layers 变 |
| LayerToggles | 图层开关 |
| QuizCard | 二选一/四选一，答错有解释，不记分 |
| Counter | "一个图标 = N" 的数量可视化（兵力、伤亡、人口） |
| LangToggle / ThemeToggle / ParentMode | 全局开关 |

---

## A. TimeScene（时间演化）

### 控制器：Timeline

- **章节节点**：时间轴上的圆点，非等距，点一下跳章。节点之间可以有"跨越"（二战章节可以从 1941 年 12 月直接跳到 1942 年 2 月）
- **细拖条**：连续时间 `t`，拖动时舞台按关键帧插值，章节不切换
- **播放**：从当前 `t` 匀速推进，遇到章节节点暂停 1.5 秒并展示标题，可调倍速
- **时间尺度**：历史用日期；地质用 `ma`（百万年前）；同一引擎，不同刻度格式化器

### 舞台 1：GeoStage（MapLibre）

图层类型（都是 GeoJSON source + 自定义 layer 样式，样式读 token）：

| 图层 | 数据 | 渲染 |
|---|---|---|
| base | Natural Earth 陆地/海洋/河流 | fill + line |
| control | 控制区关键帧多边形 | 按阵营填色；相邻关键帧交叉淡化（opacity 插值） |
| borders | 年份国界线 | line，可选 |
| movements | 行军/航线箭头（LineString + 时间区间 + 强度） | 动画虚线流动（line-dasharray 步进），cinema 主题加发光层 |
| battles | 点 + 时间区间 + 规模 + 结果 | circle，进入时间段时脉冲一次，点击弹详情 |
| participation | 国家 + 参战日期 + 阵营 | 国家面在参战日"点亮" |
| labels | 地名 | symbol，按 zoom 显隐 |

镜头：每章一个 `camera`，用 `flyTo`。战役拉近（zoom 6–8），战区拉远（zoom 3–4），世界 zoom 1.5。

### 舞台 2：DiagramStage（SVG 关键帧）

用于山脉形成、水循环、板块剖面等没有真实地理坐标的时间演化。SVG 里的元素按 id 标记，关键帧给出每个 id 的 transform/opacity/path，引擎用 d3-interpolate 插值。板块漂移二期上 geo-morpher 走 GeoStage。

### 数据 schema（GeoStage）

```ts
// data/entities.json  参与者
{ id: 'japan', name: {en, zh}, bloc: 'axis' | 'allied' | 'neutral',
  joined: '1937-07-07', left?: '1945-08-15', color?: string }

// data/control.json  控制区关键帧
{ keyframes: [
  { t: '1939-09-01', features: FeatureCollection /* properties: { holder: 'germany' } */ },
  { t: '1940-06-22', features: ... },
  ...
]}

// data/movements.json
{ id: 'malaya-campaign', from: '1941-12-08', to: '1942-01-31',
  path: LineString, holder: 'japan', strength: 70000,
  label: {en, zh}, kind: 'land' | 'sea' | 'air' }

// data/events.json  战役/事件
{ id: 'kota-bharu-landing', t: '1941-12-08', until?: '1941-12-09',
  at: [102.24, 6.13], kind: 'battle' | 'landing' | 'surrender' | 'bombing' | 'political',
  sides: { attacker: 'japan', defender: 'uk' }, forces?: { japan: 5300, uk: 10000 },
  casualties?: { japan: 300, uk: 400 }, result: 'attacker',
  importance: 1 | 2 | 3,
  title: {en, zh}, summary: {en, zh}, sensitive?: boolean }
```

插值规则：`t` 落在两关键帧之间时，前帧 opacity 从 1 降到 0.4，后帧从 0 升到 1，重叠 30% 区间。不做几何形变，形变留给二期。

### 二战之外的 TimeScene 实例

- 新加坡建国 1819–1965：GeoStage，zoom 固定在东南亚
- 大陆漂移：GeoStage + geo-morpher（二期）
- 褶皱山脉形成、水循环、种子到植物：DiagramStage

---

## B. SpaceScene（空间拆解）

### 控制器：Explorer

状态：

```ts
{ part: string | null          // 选中零件
  view: 'assembled' | 'xray' | 'exploded' | 'isolate'
  explode: 0..1                // 爆炸程度滑块
  run: boolean                 // 是否"通电运转"
  layers: string[]             // 系统/组别开关（如 refrigerant, air, electrical）
  cutaway?: 'none' | 'half'    // 剖切
}
```

交互：

- 点零件 → 高亮 + InfoPanel 详情（名称、作用、材料、"它和谁相连"）
- 悬停 → 浮标签（iPad 上改为长按）
- `xray`：未选中零件透明度 0.15，选中零件实心
- `exploded`：每个零件沿 `explodeDir` 位移 `explode * explodeDist`，带缓动
- `isolate`：只显示选中零件和它所在的组
- `run`：播放动画片段 + 启动流场粒子（空气、冷媒、电流），粒子沿数据里给的路径 LineString 流动

### 舞台 1：Model3DStage（react-three-fiber）

- 模型 glb，每个零件是命名 mesh，名字即 `partId`
- 材质由主题 token 调色（paper 主题哑光、暖光；cinema 主题金属、冷光、边缘发光）
- 相机 OrbitControls，每章一个预设位
- 流场粒子：`Points` + 自写 shader 沿路径推进，数据给路径、速度、颜色
- 模型来源：简单对象（空调、电路、火山）先用 three 基本几何在代码里"搭积木"，由 `parts.json` 里的 `primitive` 字段描述；复杂对象（人体器官）用 CC 授权 glb

### 舞台 2：Layer2DStage（SVG 分层）

很多小学内容用 2D 剖面更清楚（植物茎、消化系统、叶片）。SVG 里每层一个 `<g id=partId>`，同一套 Explorer 控制器：点选、透明、分层开关、"运转"时用 SMIL/CSS 动画沿 path 推粒子。

### 数据 schema

```ts
// data/parts.json
{ parts: [
  { id: 'compressor', name: {en, zh}, group: 'refrigerant',
    summary: {en, zh}, detail: {en, zh},
    mesh?: 'Compressor',                      // glb 里的 mesh 名
    primitive?: { kind: 'cylinder', size: [0.3, 0.3, 0.5], at: [1, 0, 0], color: 'metal' },
    explode: { dir: [1, 0, 0.3], dist: 1.2 },
    connects: ['condenser', 'evaporator'],
    level: 'P5' }
],
  groups: [{ id: 'refrigerant', name: {en, zh}, color: 'token:accent-1' }],
  flows: [
    { id: 'refrigerant-loop', group: 'refrigerant', path: [[...],[...]], speed: 1, color: 'token:accent-1', whenRun: true },
    { id: 'cool-air', group: 'air', path: [...], speed: 2, color: 'token:accent-2', whenRun: true }
  ],
  animations: [{ id: 'fan-spin', target: 'fan', kind: 'rotate', axis: [0,0,1], rpm: 120, whenRun: true }],
  views: { assembled: { camera: [...] }, exploded: { camera: [...] } }
}
```

章节在 SpaceScene 里就是"步骤"：第一章整体、第二章拆开看四大件、第三章通电看冷媒循环、第四章看空气怎么变冷。

---

## C. Simulation（参数模拟，二期）

`{ params: Slider[], model: (params) => state, view: Chart | Diagram }`。光与影（光源高度 vs 影长）、热胀冷缩、电路电流、杠杆平衡、数学里的分数/比例可视化。先留目录和 schema 占位，不实现。

---

## 一期实现顺序

1. core：Scene 契约、章节驱动、URL 状态、i18n、主题 token
2. widgets：ChapterRail、InfoPanel、Legend、LayerToggles、Counter
3. TimeScene + GeoStage + Timeline，用二战数据跑通
4. SpaceScene + Model3DStage（primitive 搭积木）+ Explorer，用空调跑通
5. QuizCard、ParentMode、PWA
6. DiagramStage、Layer2DStage 等第二批主题进来再做
