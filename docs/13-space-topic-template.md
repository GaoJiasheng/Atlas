# 13 · 拆解主题模板（SpaceScene · 对象解剖）

空调主题（docs/12）跑通之后，把"做一个 3D 拆解 + 工作原理主题"固化成项目级模板，跨 session、跨模型都按同一套做。机器、家电、载具适用，生物解剖（昆虫、器官、植物）也适用。

## 入口

| 东西 | 位置 | 用途 |
|---|---|---|
| skill | `.claude/skills/atlas-space-topic/` | 全流程：`SKILL.md` + `references/`（spec 模板与原型选择、建模手册、数据速查、写作规则、施工顺序与分工、验收清单） |
| 脚手架 | `pnpm tsx scripts/new-topic.ts <slug> --engine space-scene --subject science\|biology --title-en "…" --title-zh "…" [--subtitle-en … --subtitle-zh …]` | 建主题目录（`status: draft`）：`parts.json` 带每类字段的最小示例（每组一个零件、context 零件、只有流的组和一条流、一个动画、views、三个预设、规格行与遥测）、第 01 章（state + summary + 两拍）、设计研究来源 S1、`SOURCES.md`、`scripts/geo/<slug>/refs/.gitignore`；`pnpm validate` 立即为绿，最后打印下一步 |
| 参考图 | `scripts/geo/<slug>/refs/` | 照片、专利图、公有领域图解，只在本地（gitignore），spec 里逐张记来源与许可 |
| 视觉语言 | docs/08 + skill `industrial-3d-showcase`（入口 `atlas-plate`） | 技术图版、材质、灯光、镜头、模式、打磨轮次 |
| 引擎契约 | docs/06「SpaceScene」「演示系统」「QA：pnpm shoot」 | 实现细节，skill 不重复 |
| 范本 | `src/content/topics/aircon/`、docs/12（§14–§16 施工与写实记录） | 照着看 |

## 约定

- **事实纪律**：规格行写 DESIGN（落在有来源的 TYPICAL 范围内），STATE 读数是 SIM 且内部自洽；设计值和模拟运行点写成一条自描述的设计研究来源，正文数字照常 `<Num s>`。
- **写实**：参考图先行，Tier-1 一眼能认；只用程序化 primitive；示意之处在 `topic.yaml` 的 `note`、细看和已知差距里写明；无品牌、型号、贴图。
- **分区**：组按 01–05 排，只有流的组放最后（LAYERS 里开关）；context 零件（墙、地面、展台）不属于任何分区。
- **章节**：每章 `state` 写视图、运转、剖切、`hide`、`labels`、镜头；3–5 拍，字幕说"这一拍模型上显示什么"。

## 流程一句话

spec（Gavin 定稿）→ 参考图 → 脚手架 → 引擎缺口 → 几何 R2（并排参考图两轮）/ R3 / R4 → 事实与文字（样章先给 Gavin）→ 节拍 → 打磨与审计 → `pnpm shoot <slug> --keys --layout --beats` → 验收清单 → 发布。细节见 skill 的 `build-order.md`。
