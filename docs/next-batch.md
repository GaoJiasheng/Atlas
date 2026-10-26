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

第二轮结果（2026-10-26，都已交回，主会话看过全部插图）：

| slug | 规格稿 | 预下载数据 | 插图 |
|---|---|---|---|
| sun-earth-moon | 背景 + 7 章，39 拍 | — | 复用 3（封面换成三球仪） |
| how-planes-fly | 有，章数待定稿时核 | — | 复用 3 |
| fossils-and-skeletons | 背景 + 7 章，36 拍 | — | 复用 3 |
| dinosaur-earth | 背景 + 7 章，35 拍 | 4 个数据集，23 MB（PBDB 只有有界样本；没有正好 66 Ma 的重建帧） | 新画 3 |
| inside-the-earth | 背景 + 7 章，36 拍 | — | 新封面 1 + 复用 2 |
| plates-and-hazards | 背景 + 7 章，38 拍 | 7 组，28.6 MB（NOAA 测量类型待核，有只用位置的备选） | 复用封面 + 新画 2 |
| monsoon-and-weather | 背景 + 8 章，36 拍 | 3 个数据集，0.8 MB，另复用 2 个底图 | 复用 3 |
| industrial-revolution | 背景 + 7 章，37 拍 | 7 个产品，68.9 MB（缺的线路有端点备选） | 新封面（火箭号）+ 电报键 + 复用梭子 |
| steam-engine | 有，另有 24 条新事实 | 2 份公有领域机械参考图，35 KB | 新画平行连杆 1 + 复用 2（平行连杆图定稿时再对资料核一遍） |

## 三、许可规则（Gavin 2026-10-26 定）

数据和素材可用：公有领域、CC0、CC BY、CC BY-SA、CC BY-NC-SA、ODbL、ODC-BY（Atlas 内容是 CC BY-NC-SA 4.0，非商业）。**同一份派生数据里不能同时混 CC BY-SA 和 CC BY-NC-SA**（两种 share-alike 互不兼容，ww2 现在就卡在这里）；每份派生文件写明属于哪一族，并在 LICENSE-CONTENT / THIRD-PARTY-NOTICES 加例外。"需签协议 / 受限"的来源不用。以后若加广告、收费或商用，要重新审一遍 NC 来源。

## 四、要做的引擎扩展（来自 Codex 规格稿，定稿时再压到最小）

规格稿（2026-10-26 第二轮）列出的新引擎工作如下。定稿规格时先核对现有功能：Codex 不熟悉引擎，有些项目可能已经有了，例如"章节对象索引""详情在正文上方"已是 HUD 铁律，那就删掉；能用现有 sim 或 binding 拼出来的，也不新做。

| 代号 | 引擎 | 内容（规格稿原文要点） | 给谁用 |
|---|---|---|---|
| E-N1 | TimeScene | 逐月气候图层：月份状态与拖动、风矢量 / 流线、降水栅格、图例、格点读数 | monsoon-and-weather |
| E-N2 | SpaceScene | sim `orbit-rotation`：求解器与共享时钟、天体变换与尺度映射、月相窗、日月食阴影、全年图；附 28 组验收数值（`engine-oracles.json`） | sun-earth-moon |
| E-N3 | SpaceScene | sim `airfoil`：流线随局部速度、升力—攻角曲线、示意性失速区、只在附着流里显示压力、相对气流的力箭头 | how-planes-fly |
| E-N4 | SpaceScene | sim `earth-process`：地震波传播与海水抬升（海啸成因）求解器 | inside-the-earth |
| E-N5 | SpaceScene | 蒸汽机：压力 / 调速器 / 能量账模拟；刚体连杆共相位求解（平行连杆、太阳行星齿轮）；阀门与流动同步 | steam-engine |
| E-N6 | TimeScene | 只用古地理重建的全球底图（无现代陆地）、现代化石小地图与按年代筛选、Ma 精确标签与 URL | dinosaur-earth |
| E-N7 | TimeScene | 可选的科学参考图层（板块边界、地震、火山目录）与目录查看卡；伤亡数字卡保留定义、估算与来源日期 | plates-and-hazards |
| — | TimeScene | industrial-revolution：规格稿列的"章节对象索引、详情在正文上方"应已存在，定稿时核对；低缩放下铁路是否看得清是验收项 | industrial-revolution |

fossils-and-skeletons 不需要新引擎。

## 五、Gavin 说开工后的顺序

1. **定稿规格（并行，Opus）**：每个代理读 `spec-draft.md`、调研和本页，对照现有引擎把新引擎工作压到最小，核对事实 id，补齐 §0 代定项，写成 `docs/44–52`。同时 Sonnet 做一轮事实核查，只核 ⚑ 和敏感项。定稿后提交，§0 代定项进 `docs/review-queue.md`。
2. **SpaceScene 引擎**（都改 sim 注册表，一次最多两个并行，后合并的负责合并前一个）：E-N2 与 E-N5 → E-N3 与 E-N4。
3. **TimeScene 引擎**（与 SpaceScene 并行）：E-N1 → E-N6 → E-N7。
4. **内容**：fossils-and-skeletons 不等引擎，第一波就开；其余在各自引擎合并后开。industrial-revolution 只需核对，可第一波开，按草稿。plates-and-hazards 也是草稿。同时最多 4 个重活。
5. 每个交回：审 → 合并（smoke 计数冲突手动对齐）→ 关卡 → `pnpm run deploy` → `git push` → 更新 review-queue（按 Gavin 的常规授权，不再另问）。

## 六、代理简报要点（照上一批的做法）

- 引擎代理：读对应规格 §4、docs/06 注册约定、docs/37/38/40/41 的 §9 引擎记录；做 sample-* 夹具、单测、e2e、shoot 检查、docs/06 小节、规格 §9 记录；交回前合并 main。
- 内容代理：读规格（§9 覆盖前文）、对应 skill、夹具；插图用 `art/planned/<slug>/` 已审过的图（`scripts/illustrate.ts` 处理）；REVIEW.md 写给 Gavin 的项；不改 review-queue 和 package.json；自己的 ATLAS_E2E_PORT；smoke 计数冲突由主会话对齐。
- Codex 调用：`codex exec --skip-git-repo-check --sandbox workspace-write -c sandbox_workspace_write.network_access=true -C <dir>`（`danger-full-access` 会被安全检查拦下）。
