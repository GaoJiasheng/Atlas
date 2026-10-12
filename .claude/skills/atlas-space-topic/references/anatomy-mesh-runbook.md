# 真实解剖网格 runbook（anatomy）

适用：Atlas SpaceScene / Model3DStage 的人体肌肉与其他复杂有机体。六区肌肉系列的实际记录见 [docs/16 §16](../../../../docs/16-muscles-content-spec.md#16-系列记录2026-10-12)，脚本入口与最新参数见 [scripts/anatomy/README.md](../../../../scripts/anatomy/README.md)。早期 spec 的 `select.ts / bake.ts / rig.ts` 是施工设想；当前生产路径是 native Blender `build.py`。

## 1. 什么时候允许 real meshes

docs/08 §0 对“procedural only”留有例外：无法用 primitive 如实表达的人体肌肉、器官等复杂有机体，可以使用真实解剖网格。立项 spec 要写清为什么需要 mesh、选哪些结构、来源与许可、教学省略、预算和审查方法。普通机器仍按 `modelling-runbook.md` 用程序化几何；器械、地面等教学辅助物也继续用 primitive。

交付为本站本地 `public/models/<slug>.glb`，不作运行时外部请求、不用照片贴图。不能因模型看起来像人体就采用：必须核 source inventory、左右侧、命名、尺度与解剖覆盖，且许可可追溯。

## 2. 来源、许可与四处署名

| 来源 | 本系列的用途 | 许可与记录 |
|---|---|---|
| [Z-Anatomy](https://github.com/LluisV/Z-Anatomy) | 六区 muscle / bone / skin FBX 主源，同一男性参考身体 | CC BY-SA 4.0；保留上游 `License.txt`、抓取记录与 SHA-256 |
| [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)（DBCLS） | 上游数据、FMA 名表与交叉核对 | 官方现行 CC BY 4.0；Z-Anatomy 要求的历史署名仍写 CC-BY-SA 2.1 Japan，二者分别说明 |
| Gray 1918 / OpenStax A&P 2e | 附着文字与作用核对 | Gray 公有领域；OpenStax CC BY-NC-SA 4.0。只独立转述已核事实，图与文字复制另核许可 |

Z-Anatomy 要求保留的两行原文：

```text
BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan
Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0
```

如直接采用 BodyParts3D 4.0 数据，另保留官方署名：

```text
BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International
```

说明 Atlas 的改动：structures selected per body region, simplified, re-rigged, fibre and attachment data added。Z-Anatomy 派生 glb、`sites` / fibre / rig 几何数据、本系列截图与按模型渲染重画的 hero 图版按 CC BY-SA 4.0；本站独立正文、肌肉卡、动作卡及独立动作示意图按 CC BY-NC-SA 4.0。`LICENSE-CONTENT` 记录这些例外；选入新系统的模型时逐项核许可，不能将整个 Z-Anatomy 库所有第三方器官都当作同一许可。

| 署名位置（四处） | 写什么 |
|---|---|
| glb `asset.copyright` | 上游署名、来源 URL、许可及 Atlas 改动；优化后仍要存在 |
| `THIRD-PARTY-NOTICES.md` | 3D anatomy models 节保留完整两行、来源链接、历史 / 现行 BP3D 许可说明与改动 |
| 每主题 `data/SOURCES.md` | 模型表、完整署名与改动；共享 `M3` / `M4` 及所用新来源可追溯，手写 attachment review 留在生成块外 |
| 页面 `topic.yaml.note` + 首章来源细看 | HUD 用双语短行“Male reference anatomy · meshes Z-Anatomy / BodyParts3D, CC BY-SA 4.0” / “男性参考解剖 · 网格 Z-Anatomy / BodyParts3D，CC BY-SA 4.0”；首章说明来源与改动，并让完整署名可从来源清单读到 |

## 3. 工具环境与 Codex sandbox

当前管线**必须有 native Blender 5.1**（PATH 上的 `blender`），Python 3 与 Blender 内都要有 NumPy；Node ≥ 22、pnpm、tsx、glTF Transform、meshoptimizer 使用仓库已装依赖。Pillow 只用于可选 contact sheet。不要按早期“无需 Blender”的计划改走 assimp / fallback；那些脚本仅保留探索记录。

Codex 的受限 sandbox 可能阻止 Blender 正常初始化或运行。此管线需要在调用环境允许时以 `codex exec --sandbox danger-full-access` 运行，或在本机终端 natively 运行；这是 Blender 执行环境要求，不是网页运行要求。若当前权限不允许该模式，就交由原生终端执行，不能声称受限环境已完成 native 验收。本次文档任务不执行这些命令。

## 4. Pipeline：cache → manifest → native build → optimize → audit → report → preview review

每个 topic 使用独立 `scripts/anatomy/<topic>/`，当前 `<topic>` 为 `chest / back / shoulders / arms / legs / core`。`run.py` 的 choices 固定为这六个；新 region 需要补脚本注册与 manifest 规则，不能仅传一个新 slug。

| 步 | 做什么 | 产物 / 闸门 |
|---|---|---|
| cache | 准备获准的本地 FBX：`MuscularSystem100.fbx`、`SkeletalSystem100.fbx`、`Regions of human body100.fbx`，以及关节 / reference 所需缓存；保存 `License.txt`、`FETCHED.txt`、`SHA256SUMS.txt` | `scripts/anatomy/cache/`（gitignore）；`inventory.json` 的节点、角色、坐标与左右证据。`run.py` 不下载缺失输入 |
| manifests | `manifests.py` 对照实际 inventory 展开每区 source selections；每个 `manifest.json` 立即配一个含 checksum 的 `MANIFEST-READY` | 明确 region / neighbour / bone / skin、`referenceParts`、`jointNames`、attachment / fibre overrides、`expectedNodes`；胸部已有 manifest 保留为 baseline |
| native build | `run.py --topic <topic>` 调用 Blender `build.py`：选真实左右网格、坐标转换、按 surface tolerance 简化、烘焙 `_U` / `_FIBRE` / UV、蒙皮、stray-vertex repair | `<topic>/rig.json`、`attachments.json`、`cache/<topic>-raw.glb`、review blend 与 build stats |
| optimize | `optimize.ts --topic <topic>`：量化、meshopt 压缩、验证节点与属性 | `public/models/muscles-<topic>.glb`，bytes / triangles / SHA；保留 `EXT_meshopt_compression`、`KHR_mesh_quantization` 与署名 |
| audit | 从 published compressed GLB 独立 decode，检查 surface / topology / coordinates / rig / weights / fibre / outliers | `cache/<topic>-weights-audit.json` 等；flags 返回 exit 1，clean 才继续 |
| report | 保存本轮预算、SHA、surface 表、joint evidence、候选附着与每 mesh remaining / fixed outliers | `<topic>/report.md`；明确自动检查通过与人工待核各是什么 |
| preview review | 看 front / back / left / exploded-by-layer / skin / pose 六张 PNG，必要时 contact sheet | `cache/<topic>-preview-*.png`、`<topic>/preview-review.md`；逐图写观察，不能仅记录生成成功 |

完整入口（以下为后续施工用，不是文档更新命令）：

```sh
python3 scripts/anatomy/manifests.py
python3 scripts/anatomy/run.py --topic back
```

`manifests.py` 生成五个新区的 manifest，已有 chest 不重写；改规则时同步生成器与 manifest，不能只手改产物。`run.py` 的实际执行顺序是 build → optimize → audit → `preview.py` → `report.py` → append audit；上表的 report → preview review 表示读报告后人审图片。只复查现有六份 GLB 而不重建，可用：

```sh
python3 scripts/anatomy/audit.py --topic all --write-report
```

### Audit 必须看什么

- **Weights**：每块肌肉在 attachment bone 邻接 joints 上有权重，跨关节长肌允许父链中的中间关节；unknown / missing owner 直接失败，不准回退到 `trunk`。无关 joints share > 30% 失败；权重有限、归一、每顶点最多四个 influences。
- **Fibre**：decoded `_U` 两端朝 origin → insertion，`_FIBRE` 为单位方向，UV 与字段一致；对每个 connected component 检查，源 seam 先 weld。斜方肌降部用 medial → lateral selectors，胸髂肋 / 胸棘肌用 inferior → superior selectors；修正固化在 manifest 与 generator，`flipU` 必须连同 weights / UV 一起重烘焙。
- **Outliers**：用 welded 1–2-ring 邻域比较 dominant joint 与面积加权 vector，修离群顶点；tiny detached scraps 借主表面 fibre station 和权重，避免假 origin / insertion；近端 share 沿 `_U` 作单调约束。最终独立 decoded audit 的 remaining outliers 必须为 0，fixed 数逐 mesh 留档。
- **Surface / topology**：region 0.5 mm、neighbour 1.5 mm、bone 1 mm、skin 3 mm 的 sampled surface tolerance；保持源边界，open / nonmanifold 不填剖面。采样 Hausdorff 是估计，不是全表面误差的数学保证。

## 5. 预算

| 项 | soft target | hard limit |
|---|---|---|
| 每主题 compressed glb（含骨与全身 skin） | ≤ 4 MB（4,000,000 bytes） | 8 MB |
| 三角形总数 | ≤ 0.35 M（350,000） | 0.5 M（500,000） |
| draw calls（页面实测） | 静止 < 80、动作 < 90 | 100 |

当前 native pipeline 比文档 hard limit 更严，直接以 4,000,000 bytes / 350,000 triangles 作输出 gate；超 soft target 就会失败，不能为了过关悄悄放宽脚本。先调 context / neighbour 简化，保留识别度与附着骨面；超过 soft target 的新方案必须在 spec 写明原因。skin cap 30k、thorax 25k；neighbour external oblique 每侧 8k，chest intercostals 每种 20k。core 的 external oblique 是 region，按 0.5 mm tolerance，不套 neighbour cap。SwiftShader 只报 calls / triangles，不拿 fps 代表硬件性能。

## 6. 坐标、命名与 rig

源 FBX 的实际 frame 是**米、Z up、前方 −Y、身体自己的左侧 +X**；glTF 转换 `(x, y, z) → (x, z, −y)`，导出仍是米、Y up、前方 +Z、左 +X。每区以 source region centre 平移：chest 胸骨角，back 脊柱，shoulders 锁骨中线，arms 肱骨中线，legs 骨盆，core 腰椎。`rig.json` 留 `floorY`、stature 与 orientation evidence；居中后的地面不一定 y = 0，全身落地加 `−floorY`，不要默默改比例或翻左右。

新肌肉 part id = canonical muscle id（kebab-case）；glb node = `<part-id>.l` / `.r`，不分侧件不加后缀。`parts.json` 写左侧，`bilateral.mesh` 指向真实 `.r`，不用镜像几何；右侧 UI id 仍为 `<part-id>-r`。整体 parent / `.g` navigation card 不重复输出 mesh。胸部历史 `intercostals-external` / `intercostals-internal` 与肌肉卡 `external-intercostals` / `internal-intercostals`，以及合并 triceps 等已有 mapping 要保留并显式记录，不为统一命名破坏 baseline。

`jointNames` 是显式契约，要含 exercise keys 所需 joints，即使对应的显示骨不输出。attachment owners 自动补齐父链，未显示的骨用 `referenceParts` 量测，不随意加 display nodes。下表为当前 **native manifest / GLB** 的关节，不是页面 `parts.json.rig` 的条目数：

| topic | joints（`.l/.r` 均有） | 数 |
|---|---|---:|
| chest | `trunk` + `clavicle`、`scapula`、`shoulder`、`elbow`、legacy `wrist` | 11 |
| back | `trunk` + `clavicle`、`scapula`、`shoulder`、`elbow`、`hand`、`hip` | 13 |
| shoulders | `trunk` + `clavicle`、`scapula`、`shoulder`、`elbow`、`hand` | 11 |
| arms | `trunk` + `clavicle`、`scapula`、`shoulder`、`elbow`、`forearm`、`hand` | 13 |
| legs | `trunk` + `hip`、`knee`、`ankle` | 7 |
| core | `trunk` + `hip`、`knee`、`ankle`、`clavicle`、`scapula`、`shoulder`、`elbow`、`hand` | 17 |

上肢父链 `trunk → clavicle → scapula → shoulder → elbow → hand`；arms 在 elbow / hand 间插 `forearm`，ulna 跟 elbow，radius / hand 跟 forearm。页面 `wrist.*` 指到 `hand.*`；`motionAliases` 将旧 draft 的 elbow pronation / supination 转到 forearm 长轴。下肢父链 `trunk → hip → knee → ankle`。髋以髋臼 landmark 与股骨头 sphere fit 互核，膝以股骨两髁中点，踝以两踝中点；上肢核锁骨两端、关节盂、肱骨头、两髁与茎突。`hand` 以腕为 pivot，`handGripOffsetM` = 0.08 m。

页面只暴露它能演示的关节：back 目前 11 个，core 为 trunk + 双侧 hip / knee / ankle 共 7；GLB 的隐藏链不能当作页面已经支持完整动作的证明。Chest 的 `hand.*` 指向 legacy `joint.wrist.*`，旧 scapula demo 还有显式 mapping；native 重跑必须保持胸部 SHA-256 `4ddd10ce16131977074cb4ba0a1bbf223a7dbee928b8b84c369553e9362a6687`，不能改名破坏 byte baseline。

## 7. Attachments：文字与 named bone face 人审

`attachments.json` 的 `.o/.e` 标记、距离聚类与 proximity fallback 只产生候选；保留 raw labels、来源 nodes、named target、距离与 flags，不把自动通过写成解剖已核。逐条与 Gray / OpenStax 等实际读到的 origin / insertion 对照，再在 decoded published mesh 上确认**正确骨面**（前 / 后、内 / 外、关节面或结节），不能只满足“离这块骨很近”。

最终 `parts.json.sites` 以 **3 mm 内为目标、最多 5 mm** 贴住文字指定的骨面，记录测量方法（point-to-triangle 优先；nearest decoded vertex 是较保守的核查）。宽附着用多个代表点；左右分别核源网格后才允许页面镜像坐标。不落在正确骨面就投影 / 重取点，并重看姿态与拉力线。

缺 skull / cervical bone、腱膜 / 白线 / 韧带、独立 Achilles tendon 等结构时，不能虚构骨面或用肌腹末端冒充 tendon insertion：用真实 named connective surface（若输出）或移除标记、在文字说明；代表性 intercostal sites 只描述一个肋间隙。非骨附着与超过 muscle surface 的腱性延伸单列理由，不能隐瞒为“3 mm 骨面通过”。

每次修改在主题 `data/SOURCES.md` 生成块外记：candidate → 解剖依据 → 正确 named face → 改前 / 后坐标或移动量 → 距离 → accepted / corrected / text-only / removed。`attachments.json` 继续保留原候选；pipeline 的 `[待核]` 与页面采用点的审查结论是两层记录。改动影响 fibre / weights 时还要更新 manifest override、重烘焙并复审，不仅移动 UI marker。

## 8. 三道人审闸门

1. **Previews**：六张 PNG 逐张看，查真实左右、剪影、浅中深层与骨面、皮肤内位置、剥层穿插、pose 拉伸 / 裂缝 / stray streaks；在 `preview-review.md` 写具体观察与未解决项。必要时并排 Gray 图版与 contact sheet。Blender regional pose 通过不等于真实 exercise contact 通过。
2. **Audits + attachments**：读 `report.md` 与 machine-readable audit，核预算、SHA、0 remaining outliers、fibre 两端、rig evidence，并完成上一节 named-face 审查。关节 / 肌腹数值通过不能替代解剖文字、腱身份与动作范围核对；未解决项进 spec，不能抹去 `[待核]`。
3. **Shoot 与页面**：在完成内容 / 引擎施工后的既有构建上跑 `pnpm shoot muscles-<topic> --layout --keys --beats`，EN / ZH × paper / cinema，检查每个 loop 的 start / end、器械全幅与 HUD、触控与手机、层开关、起止点、卡片及章节索引。standing 动作看脚接触和 `footSlip`；SwiftShader 漏标要对照截图与重复采样。图与 steps 不一致（如 pullover 肘弯）、partial chin-up / overhead extension、无手臂支撑的 plank 等写进差距，不能以 audits clean 代替。

HUD 始终按 docs/08 §2：底部只有章节轴；次级读数在左列 PLATE；阅读面板为章头 → 节拍行 → 选中详情 / 动作卡 → 正文 → 本章索引。按通用 `acceptance.md` 完成发布门槛，再更新 spec 实现记录与 roadmap；文档整理本身不要求重跑 meshes 或 builds。
