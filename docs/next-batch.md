# 下一批主题：准备状态与启动方案（等 Gavin trigger）

2026-10-26 定：先准备，不开工；Gavin 说开工时按本页直接拉起。数学课暂缓。

## 一、九个主题

原来六个，其中恐龙、火山、工业革命按"地图 + 3D"拆成两个，季风只做地图（雷暴云当插图）。

| # | slug | 中文名 | 引擎 | 调研来源（`art/research/`） | 姊妹主题 | 规格号 | 上线方式 |
|---|---|---|---|---|---|---|---|
| 1 | `sun-earth-moon` | 太阳、地球、月亮 | SpaceScene + 新 sim `orbit-rotation` | sun-earth-moon | — | docs/44 | 直接上线 |
| 2 | `how-planes-fly` | 飞机为什么能飞 | SpaceScene + 新 sim `airfoil` | how-planes-fly | — | docs/45 | 直接上线 |
| 3 | `fossils-and-skeletons` | 化石与恐龙骨架 | SpaceScene | dinosaurs-and-fossils | dinosaur-earth | docs/46 | 直接上线 |
| 4 | `dinosaur-earth` | 恐龙时代的地球 | TimeScene（地质年代，Ma） | dinosaurs-and-fossils | fossils-and-skeletons | docs/47 | 直接上线 |
| 5 | `inside-the-earth` | 地球内部与火山剖面 | SpaceScene | volcanoes-and-earthquakes | plates-and-hazards | docs/48 | 直接上线 |
| 6 | `plates-and-hazards` | 板块与灾害地图 | TimeScene（公历年） | volcanoes-and-earthquakes | inside-the-earth | docs/49 | 草稿（有死亡人数，Gavin 读过再上） |
| 7 | `monsoon-and-weather` | 季风与天气 | TimeScene + 新图层"逐月气候" | monsoon-and-weather | 链到 water | docs/50 | 直接上线 |
| 8 | `industrial-revolution` | 工业革命 | TimeScene（历史） | industrial-revolution | steam-engine | docs/51 | 草稿（历史主题，Gavin 读过再上） |
| 9 | `steam-engine` | 瓦特蒸汽机 | SpaceScene | industrial-revolution（+ facts-extra） | industrial-revolution | docs/52 | 直接上线 |

## 二、准备产物（都在 gitignore 的 `art/` 下，不进仓库）

- `art/research/<parent>/`：Codex 第一轮调研（`<slug>-research.md`、`facts.json`、`datasets.json`），2026-10-26。
- `art/research/<slug>/spec-draft.md`：Codex 第二轮起草的规格稿，结构照 docs/40–43；拆出来的主题另有 `facts-extra.json`。
- `art/research/<slug>/data/` 与 `INVENTORY.md`：地图主题预下载的数据（许可、大小、sha256、覆盖范围、对应关键帧）。
- `art/planned/<slug>/`：封面 + 两张章节插图 + `manifest.jsonl`（含复用来源与自检记录）。

## 三、许可规则（Gavin 2026-10-26 定）

数据和素材可用：公有领域、CC0、CC BY、CC BY-SA、CC BY-NC-SA、ODbL、ODC-BY（Atlas 内容是 CC BY-NC-SA 4.0，非商业）。**同一份派生数据里不能同时混 CC BY-SA 和 CC BY-NC-SA**（两种 share-alike 互不兼容，ww2 现在就卡在这里）；每份派生文件写明属于哪一族，并在 LICENSE-CONTENT / THIRD-PARTY-NOTICES 加例外。"需签协议 / 受限"的来源不用。以后若加广告、收费或商用，要重新审一遍 NC 来源。

## 四、要做的引擎扩展（小的在前）

| 代号 | 引擎 | 内容 | 给谁用 | 依赖 |
|---|---|---|---|---|
| E-N1 | TimeScene | 逐月气候图层：风矢量 / 流线 + 降水栅格或等值线，按月拖动，图例 | monsoon-and-weather | 无 |
| E-N2 | SpaceScene | sim `orbit-rotation`：自转、公转、地轴固定指向、月相几何、日月食对齐 | sun-earth-moon | 无 |
| E-N3 | SpaceScene | sim `airfoil`：流线随速度、升力随攻角、失速区（诚实标明模型边界） | how-planes-fly | E-N2 合并后再开（同改 sim 注册表） |

其余六个主题按现有引擎能做；规格稿若列出小改动，在施工时由内容代理按"最小改动 + 测试"处理。

## 五、Gavin 说开工后的顺序

1. **定稿规格（并行，Opus）**：每个代理读 `spec-draft.md` + 调研 + 本页，核对事实 id、补齐 §0 代定项，写成 `docs/44–52`；同时 Sonnet 做一轮事实核查（只核 ⚑ 和敏感项）。定稿后提交，§0 代定项进 `docs/review-queue.md`。
2. **第一波施工**（同时最多 4 个重活）：E-N1、E-N2 两个引擎代理；fossils-and-skeletons、inside-the-earth 两个内容代理。
3. **第二波**：E-N3；steam-engine、dinosaur-earth、plates-and-hazards 内容；E-N1 合并后接 monsoon-and-weather 内容。
4. **第三波**：E-N2 合并后接 sun-earth-moon 内容；industrial-revolution（草稿）；E-N3 合并后接 how-planes-fly。
5. 每个交回：审 → 合并（smoke 计数冲突手动对齐）→ 关卡 → `pnpm run deploy` → `git push` → 更新 review-queue（按 Gavin 的常规授权，不再另问）。

## 六、代理简报要点（照上一批的做法）

- 引擎代理：读对应规格 §4、docs/06 注册约定、docs/37/38/40/41 的 §9 引擎记录；做 sample-* 夹具、单测、e2e、shoot 检查、docs/06 小节、规格 §9 记录；交回前合并 main。
- 内容代理：读规格（§9 覆盖前文）、对应 skill、夹具；插图用 `art/planned/<slug>/` 已审过的图（`scripts/illustrate.ts` 处理）；REVIEW.md 写给 Gavin 的项；不改 review-queue 和 package.json；自己的 ATLAS_E2E_PORT；smoke 计数冲突由主会话对齐。
- Codex 调用：`codex exec --skip-git-repo-check --sandbox workspace-write -c sandbox_workspace_write.network_access=true -C <dir>`（`danger-full-access` 会被安全检查拦下）。
