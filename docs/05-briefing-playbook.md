# 05 · 施工 brief 模板

网上没有现成的"做交互式历史地图"的 prompt 可以直接抄。Claude Academy 的交互图解用例总结的结构最有用，照它来：

1. **描述体验**：学什么、怎么交互、数据来源、审美标准
2. **技术约束**：栈、渲染方式、id 保留、性能预算
3. **设计标准**：配色、字体、克制程度，明确说"参考级，不是 AI 通用风"
4. **内容深度**：要"真的能学到东西"的量
5. **一次做到旗舰质量**，不要"先做个最小版再改"

交给 Codex/Claude 做一个新主题时，brief 固定五段。下面两个是一期要用的。

## Brief A：TimeScene 引擎 + 二战主题

```
背景
Atlas 是给新加坡小学生（P3–P6）用的双语可视化课本。仓库已有 docs/01–04，先读完。
本任务：实现 TimeScene 引擎（GeoStage + Timeline）并用二战主题跑通一期 10 章。

体验
- 全屏暗色世界地图（cinema 主题），左侧章节轨，底部时间轴（章节节点 + 细拖条 + 播放）
- 点节点：镜头 flyTo，控制区关键帧交叉淡化，行军箭头流动，战役点脉冲，右侧面板显示本章双语正文
- 拖细拖条：时间连续变化，版图按关键帧插值
- 点战役：弹详情（双方、兵力、结果），兵力用 Counter（一个图标 = 1 万人）
- 一个 8 岁孩子看一眼要知道"谁打谁、往哪打、谁赢了"

技术约束
- Astro 静态 + React 岛，MapLibre GeoJSON source，无外部瓦片
- 数据严格按 docs/03 的 schema，放 src/content/topics/ww2/data/
- 状态可序列化到 URL（ch, t, layers, cam）
- 首屏 JS ≤ 400 KB gz（MapLibre 占 275 KB），GeoJSON ≤ 2 MB
- 遵守 docs/02 的 iPad 封装约束

设计标准
- 两套主题 token 都要能跑，二战默认 cinema
- 阵营色：轴心橙红、同盟青蓝、中立灰；发光只给箭头和脉冲
- 字体：衬线标题 + 无衬线正文，中文思源
- 克制：地图上同一时刻可见标签 ≤ 12 个

内容深度
- 10 章按 docs/04 大纲，每章英文 120–180 词 + 中文对应，每章 1 道 quiz
- 12 个控制区关键帧、30 个事件、20 条箭头，数据来源写在 data/SOURCES.md
- 第 7 章敏感内容做柔化版 + 家长模式版

交付
- pnpm validate / test / e2e 通过
- 每章一张截图放 docs/screenshots/ww2/
```

## Brief B：SpaceScene 引擎 + 空调主题

```
背景
同上，先读 docs/01–04。本任务：实现 SpaceScene 引擎（Model3DStage + Explorer）并用"空调"主题跑通 5 章。

体验
- 3D 空调（室内机 + 室外机），零件用 three 基本几何按 parts.json 的 primitive 搭
- 点零件高亮 + 详情；X 光模式其它零件透明；爆炸滑块拉开所有零件；"通电"后冷媒粒子沿管路流动、风扇转、冷空气粒子从出风口出来
- 章节即步骤，每章一个相机预设和一组默认开关

技术约束
- react-three-fiber + drei，材质色读主题 token
- 粒子用 Points + shader 沿 flows[].path 推进，不用第三方粒子库
- parts/flows/animations 严格按 docs/03 schema
- 状态可序列化到 URL（part, view, explode, run, layers）
- glb 一期不用；但 mesh 字段预留，引擎要能加载 glb 命名 mesh

设计标准
- paper 主题为默认：哑光材质、暖环境光、米黄背景；cinema 主题金属材质、冷光、边缘发光
- 标签始终可读，不与零件重叠；iPad 上悬停改长按

内容深度
- 5 章按 docs/04 大纲，零件 ≥ 10 个，流 2 条（冷媒、空气），动画 2 个（风扇、压缩机）
- 对齐 Sci P5 "热的传递" 用词

交付
- 同 Brief A
```

## 新主题 brief 的最小信息

以后每个新主题，作者只需提供：

1. `topic.yaml`（学科、年级、形态、偏好主题）
2. 章节表（标题、时间/状态、镜头、孩子的问题）
3. 数据来源清单
4. 敏感内容标记

其余由引擎和 brief 模板补齐。
