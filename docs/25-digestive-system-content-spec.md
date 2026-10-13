# 25 · 消化系统 · 内容施工 spec（v1 草案）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：`archetypes.md` §3 生物 / 有机体（按系统分区）。**真实网格**：Z-Anatomy（CC BY-SA 4.0）的消化器官，与六个肌肉主题（docs/16）**同一个男性参考身体**，走 `scripts/anatomy` 管线（新 region `digestive`，§2.3）。本主题的任务：**读者看完能说出人体五个系统各做什么；能沿着一条从口到肛门的管子，说清口、食道、胃、小肠、大肠各做什么；知道"消化"就是把食物分解成更简单、能被吸收的物质，大部分吸收发生在小肠，大肠吸收水分；肝和胰不在这条管子上，但把消化液送进小肠。**

范本：docs/16（真实网格、许可分层、manifest、四处署名、三道人审）、docs/14（生物主题：系统分区、流的 stops 表示状态变化、标本盘）、docs/18（`<Figure>` 章节插图）。结构按本次 brief：决策 §0；范围与事实 §1；写实与数据 §2（含 manifest）；零件 §3；流、动画、剖切、姿态、预设、读数、引擎缺口 §4；章节 §5；名词 §6；来源 §7；图像 §8；施工 §9；验收 §10。正文、字幕、来源条目未经 Gavin 定稿不写；§5 的字幕是草稿。

---

## 0. 决策（2026-10-13 起草，待 Gavin 定稿）

| # | 提议 | 待确认点 |
|---|---|---|
| 0-1 | **课纲级别 = P4**：MOE 2023 科学课纲 *Human System (Digestive System) (P4)*，第 53 页（S3 表 2 第 20 页也把 Human system (Digestive system) 放在 P4 一列）。两条学习结果：①认出人体系统并说出功能（消化、呼吸、循环、骨骼、肌肉；Note："不要求骨骼 / 肌肉的名称和工作方式"）；②认出消化系统的部分（**mouth, gullet, stomach, small intestine, large intestine**）并描述功能。P5 第 54 页接"消化、呼吸、循环三系统协同"和"人与植物的运输比较"（只在末章细看提一句） | 是否按 P4 定深度 |
| 0-2 | **课纲只列五个部分**：肛门、肝、胰、胆囊**课纲没写**。处理：肛门作为"管子的出口"在正文出现一次（一句话，用词克制）；肝、胰、胆囊做成 `helpers` 组，第 05 章讲"它们不在管子上，但把消化液送进小肠"，标"课外"；主线（字幕、本章索引的前几项）只用课纲五部分 | 是否接受 |
| 0-3 | 课纲词：主线写 **gullet / 食道**（课纲词），oesophagus 只在名词表 `see`；"digestive juices / 消化液""simpler substances / 更简单的物质""absorbed into the blood / 吸收进血液"。**不点名消化酶**（淀粉酶等只在第 03 章细看一句、标"课外"）；不讲化学式、不讲蛋白质 → 氨基酸等分子名 | 深度 |
| 0-4 | **一顿饭**：第 07 章用"一盘鸡饭"（docs/17 #7 的建议）做"一顿饭的旅程"演示；字幕只讲食物的去向和时间，不讲营养学评价；与 HPB 的均衡饮食只在细看里引官方建议 | 选鸡饭还是别的家常饭 |
| 0-5 | **网格来源**：Z-Anatomy `VisceralSystem100.fbx`（18.4 MB，docs/17 S12）为主；骨骼、浅层肌肉、膈、舌、咽缩肌、牙取已缓存的 `SkeletalSystem100.fbx` / `MuscularSystem100.fbx`；心与大血管取 `CardioVascular41.fbx`（64.9 MB，只取心与主动脉、上下腔静脉）；皮肤轮廓取肌肉系列的 `skin-outline` / `skin-wire` 生成方式（`Regions of human body100.fbx`）。**Visceral 里有哪些器官、小肠是不是逐圈建模、命名是什么——全部待核**（docs/17 待核 5），§2.2 的名表是预期，manifest 生成器要对 inventory 逐项核 | 同意先跑 inventory 再定零件表 |
| 0-6 | **只建一个 glb**：`public/models/digestive-system.glb`，五个系统都在里面（第 01 章"总览人"），预算 soft 4 MB / 350 k 三角形（anatomy runbook §5）；不加载肌肉主题的 glb（一个主题只有一个 `model`） | — |
| 0-7 | 不需要 rig、蒙皮、纤维、起止点（器官不做动作）；管状器官要沿中心线烘焙 `_U`（0 = 口端，1 = 肛门端），给蠕动波（E-D3）和流路径（E-D2）用 | — |
| 0-8 | 写法：解剖如实、用词克制；粪便、肛门、排便各写一次、平实；不渲染疾病，不吓人；健康建议只引 HPB / MOH 原文（喝水、膳食纤维）。不拟人（不写"胃在努力工作"） | Gavin 审第 06 章 |
| 0-9 | 标题块 `note`：EN "Male reference anatomy · meshes Z-Anatomy / BodyParts3D, CC BY-SA 4.0 · organs simplified" / ZH "男性参考解剖 · 网格 Z-Anatomy / BodyParts3D，CC BY-SA 4.0 · 器官已简化"（anatomy runbook §2 的四处署名之一） | — |
| 0-10 | 不做：照片贴图、内窥镜影像、疾病章、测验（默认不做）；每章一个"试一试"细看块 | — |

---

## 1. 范围、读者、必须讲对的事实

### 1.1 读者与范围

读者：P4（2028）学生与家长；P5 复习三系统协同时可回看第 01、05 章。讲：五个系统一句话各一个；消化道五部分（+ 出口）的位置、大小、功能；消化 = 物理（嚼、搅）+ 消化液（化学）把食物变成更简单的物质；吸收在小肠；大肠吸收水分；肝胰的帮助（课外）；时间尺度。不讲：酶的名字与机理（细看一句）、激素调节、肠道菌群的细节（一句）、疾病、手术。

### 1.2 必须讲对的（误解 → 正确说法）

1. **消化从口开始**：牙齿把食物切碎磨碎（物理），唾液开始分解淀粉（化学）（P2 OpenStax 23.3）。
2. **食道不消化食物**，只靠肌肉一波一波的收缩（蠕动）把食团推进胃里；倒立也能咽下去（P2 23.3）。
3. **胃搅拌食物并加入胃液**，胃液很酸，食物在胃里停留几小时变成糊状（P2 23.4）。
4. **大部分消化和吸收在小肠里完成**：小肠很长、内壁有无数绒毛，消化后的简单物质穿过肠壁进入血液（P2 23.5、23.7）。
5. **大肠吸收水分（和一些矿物盐）**，剩下的形成粪便，从肛门排出。课纲的说法是"大肠吸收水"；**更精确地说小肠吸收的水其实最多**，大肠吸收剩下的大部分（P2 23.7，数字 **待核**）——细看里讲，主线不与课纲冲突。
6. **肝和胰不是"食物经过的地方"**：肝造胆汁、存在胆囊里，胰造胰液，都经导管流进小肠的开头（十二指肠）（P2 23.6）。
7. 消化道是**一条从口到肛门的管子**，成人活体约 7.6 m（死后测量更长）（P2 23.1，**待核**原文数值）。
8. 五个系统**一起工作**：消化系统给出营养，循环系统运送，呼吸系统给氧（P1 第 53–54 页）。

### 1.3 事实表

`TYPICAL` = 教科书范围；`MESH` = 从网格量取（施工时量，写明方法）；`SIM` = §1.4。P# 见 §7。

| # | 项 | 值（来源） | 类 | 待核 |
|---|---|---|---|---|
| F-1 | 消化道全长 | 活体约 7.6 m；死后约 10.7 m（P2 23.1） | TYPICAL | 是 |
| F-2 | 牙齿数 | 乳牙 20、恒牙 32（P2 23.3） | TYPICAL | |
| F-3 | 唾液量 | 每天约 1–1.5 L（P2 23.3） | TYPICAL | 是 |
| F-4 | 食道 | 长约 25 cm（P2 23.3）；食团通过约数秒（P2 / P4） | TYPICAL | 时间待核 |
| F-5 | 食道蠕动速度 | 约 2–4 cm/s（P4） | TYPICAL | 是 |
| F-6 | 胃的容量 | 空时约 50 mL，可扩张到约 4 L（P2 23.4） | TYPICAL | 是 |
| F-7 | 胃液 | pH 约 1.5–3.5（P2 23.4）；每天约 2–3 L（P4） | TYPICAL | 是 |
| F-8 | 胃的搅拌波 | 约每分钟 3 次（P4） | TYPICAL | 是 |
| F-9 | 在胃里停留 | 约 2–4 h（P2 / P3） | TYPICAL | 是 |
| F-10 | 小肠 | 活体长约 3 m、直径约 2.5 cm；分十二指肠、空肠、回肠（P2 23.5） | TYPICAL | 是 |
| F-11 | 小肠吸收面积 | 教科书常写约 200 m²（P2）；2014 年的形态测量估计全消化道黏膜约 32 m²（P6）。**两者并列**，说明测法不同 | TYPICAL | 是 |
| F-12 | 在小肠里 | 约 3–5 h（P2 / P3） | TYPICAL | 是 |
| F-13 | 大肠 | 长约 1.5 m、直径约 6.5 cm（P2 23.5） | TYPICAL | 是 |
| F-14 | 在大肠里 | 约 12–24 h 或更长（P2 / P3）；全程常见 1–3 天（P3） | TYPICAL | 是 |
| F-15 | 每天进入消化道的液体 | 约 9 L（喝下约 2 L + 消化液约 7 L），小肠吸收大部分、大肠吸收剩下的大部分（P2 23.7） | TYPICAL | 是 |
| F-16 | 肝 | 最大的腺体，约 1.5 kg（P2 23.6）；胆汁每天约 0.5–1 L（P2） | TYPICAL | 是 |
| F-17 | 胰液 | 每天约 1.2–1.5 L（P2 23.6） | TYPICAL | 是 |
| F-18 | 五个系统 | 消化、呼吸、循环、骨骼、肌肉（P1 第 53 页） | FACT | |
| F-19 | 网格身高 | Z-Anatomy 参考身体身高（肌肉系列 `rig.json` 的 stature） | MESH | 读 rig.json |
| F-20 | 健康建议 | 喝水、膳食纤维（HPB 原文）（P8） | FACT | 是 |

### 1.4 模拟读数（SIM，PLATE 块；"在这个模拟里"）

| key EN / ZH | unit | idle | run | lag s | decimals | 依据 |
|---|---|---|---|---|---|---|
| Gullet wave / 食道蠕动 | cm/s | 0 | 3 | 2 | 0 | F-5 中值 |
| Stomach churning / 胃搅拌 | /min | 0 | 3 | 8 | 0 | F-8 |
| Gastric pH / 胃液 pH | — | 2.0 | 3.0 | 30 | 1 | F-7：空腹偏低、进食后食物缓冲使 pH 上升（**待核**；核不到就删这一行） |

画面里的蠕动与搅拌速度是**可读的视觉速度**（胃波放快约 10 倍），细看写明。规格行（≤ 4，typical）：Tube length · ≈ 7.6 m (living)；Small intestine · ≈ 3 m；Large intestine · ≈ 1.5 m；Teeth · 32 (adult)。

### 1.5 口吻

`writing-rules.md` 生物版：不拟人、不目的论（"小肠很长**是为了**吸收"→"小肠很长、绒毛很多，所以吸收面积大"）、用词克制。课纲词主线，专业词进名词表。

---

## 2. 写实与数据来源

### 2.1 为什么用真实网格

器官形状（胃的 J 形、肝的楔形、小肠的盘绕、结肠的框形与结肠袋）用 primitive 只能画成"香肠和气球"，Tier-1 认不出；docs/08 §0 与 anatomy runbook §1 允许"人体器官"用有来源的本地 glb。教学辅助物（放大的牙、胃壁、绒毛标本）仍用程序化（§3 `specimens` 组）。

### 2.2 预期网格（Z-Anatomy 名称为 FMA 英文名，**全部待核**，以 `inventory.json` 为准）

| 零件 id | 预期源节点（候选写法） | 源文件 | 角色 | 备注 |
|---|---|---|---|---|
| `teeth-upper` / `teeth-lower` | "Upper … tooth.l/.r"、"Lower … tooth.l/.r"（已在 inventory：如 `Lower first molar tooth.l`）合并 | Skeletal（已缓存） | organ | 按上 / 下颌各并一个 |
| `tongue` | "Tongue" 或 `Muscles of tongue.g` 的成员合并 | Visceral / Muscular（已缓存） | organ | |
| `salivary-glands` | "Parotid gland"、"Submandibular gland"、"Sublingual gland"（.l/.r） | Visceral | organ（bilateral，真实右侧节点） | 三对合成每侧一件 |
| `pharynx` | "Pharynx"；退路：咽缩肌（inventory 已有 `Superior/Middle/Inferior pharyngeal constrictor.l/.r`） | Visceral / Muscular | organ | |
| `oesophagus` | "Esophagus" / "Oesophagus" | Visceral | tube | `_U` |
| `stomach` | "Stomach" | Visceral | tube | `_U`；`closed: false` 剖切可见内腔 |
| `duodenum` | "Duodenum" | Visceral | tube | |
| `jejunum`、`ileum` | "Jejunum"、"Ileum"（或合成一个 "Small intestine"） | Visceral | tube | **风险**：BodyParts3D 的空回肠可能是一团整体而非逐圈的管（§4.6 E-D2 退路） |
| `caecum`、`appendix` | "Cecum"、"Vermiform appendix" | Visceral | tube | |
| `ascending-colon`、`transverse-colon`、`descending-colon`、`sigmoid-colon` | 同名 | Visceral | tube | |
| `rectum`、`anal-canal` | "Rectum"、"Anal canal" | Visceral | tube | |
| `liver`、`gallbladder`、`pancreas`、`bile-duct` | "Liver"、"Gallbladder"、"Pancreas"、"Common bile duct" | Visceral | organ | 胆管可能缺：缺就用程序化 `tube` 示意并标"示意" |
| `diaphragm` | `Diaphragm`（inventory 已有） | Muscular | context-system | |
| `lungs`、`trachea` | "Right lung"、"Left lung"、"Trachea" | Visceral（**待核**：可能在单独的呼吸系统文件） | system | |
| `heart`、`great-vessels` | "Heart"；"Aorta"、"Superior vena cava"、"Inferior vena cava" | CardioVascular41 | system | 64.9 MB 源，只取这几件 |
| `skeleton` | 胸廓、脊柱、骨盆、四肢长骨合并 | Skeletal（已缓存） | system | 低模 |
| `muscles-superficial` | 浅层主要肌肉合并（胸大肌、腹直肌、腹外斜肌、三角肌、股四头肌…） | Muscular（已缓存） | system | 低模 |
| `skin-outline` | 肌肉系列的 skin 派生（`skin-wire` 3–5 k 三角形） | Regions of human body | context | 第 01 章外默认 `ghost` |

许可与署名：照 anatomy runbook §2 的四处（glb `asset.copyright`、`THIRD-PARTY-NOTICES.md`、主题 `data/SOURCES.md`、`topic.yaml.note` + 第 01 章来源细看）；Z-Anatomy 两行原文照抄；改动写"structures selected for the digestive region and four other systems, simplified, renamed, centreline `_U` baked"。逐件核许可（runbook："不能将整个 Z-Anatomy 库所有第三方器官都当作同一许可"）。

### 2.3 管线：`scripts/anatomy/digestive/manifest.json`（B3）

`run.py` 的 `--topic` choices 现在固定为六区（runbook §4）；本主题要**注册新 region `digestive`**，并给 `build.py` 加 `organ` / `tube` / `system` 三种角色的处理（不做 rig、蒙皮、纤维、起止点；`tube` 烘焙 `_U`）。manifest 按现有 chest 的键扩展：

```jsonc
{
  "topic": "digestive",
  "license": "CC BY-SA 4.0",
  "coordinates": { "unit": "m", "up": "+Y", "front": "+Z", "left": "+X",
                   "centre": "umbilicus level on the midline; source floor recorded in organs.json" },
  "budgets": {
    "tube":   { "maxDeviationM": 0.0015, "triangleTargetRange": [3000, 12000] },
    "organ":  { "maxDeviationM": 0.0015, "triangleTargetRange": [2000, 15000] },
    "system": { "maxDeviationM": 0.004,  "triangleTargetRange": [4000, 40000] },
    "skin":   { "maxDeviationM": 0.035,  "triangleTargetRange": [3000, 5000] },
    "total":  { "bytes": 4000000, "triangles": 350000 }
  },
  "parts": [
    { "id": "oesophagus", "objects": ["Esophagus"], "system": "digestive", "role": "tube",
      "sides": "single", "triangleBudget": 4000, "centreline": { "from": "pharynx", "to": "stomach", "seeds": [] },
      "closed": false },
    { "id": "stomach", "objects": ["Stomach"], "system": "digestive", "role": "tube",
      "triangleBudget": 12000, "centreline": { "from": "oesophagus", "to": "duodenum" }, "closed": false },
    { "id": "small-intestine", "objects": ["Jejunum", "Ileum"], "system": "digestive", "role": "tube",
      "triangleBudget": 30000, "centreline": { "from": "duodenum", "to": "caecum", "seeds": ["<施工时按网格取>"] } },
    { "id": "liver", "objects": ["Liver"], "system": "digestive", "role": "organ", "triangleBudget": 10000 },
    { "id": "salivary-glands", "objects": ["Parotid gland", "Submandibular gland", "Sublingual gland"],
      "system": "digestive", "role": "organ", "sides": "bilateral", "triangleBudget": 3000 },
    { "id": "skeleton", "objects": ["<胸廓、脊柱、骨盆、四肢长骨的节点列表>"], "system": "skeletal", "role": "system", "triangleBudget": 40000 },
    { "id": "heart", "objects": ["Heart"], "system": "circulatory", "role": "system", "source": "CardioVascular41.fbx", "triangleBudget": 8000 }
    // …其余按 §3 的零件表，一件一条；`objects` 由 manifests.py 对 inventory 逐项核实后写入
  ],
  "expectedNodes": ["oesophagus", "stomach", "duodenum", "…", "salivary-glands.l", "salivary-glands.r", "skin-wire"],
  "centrelineOrder": ["pharynx", "oesophagus", "stomach", "duodenum", "small-intestine", "caecum",
                      "ascending-colon", "transverse-colon", "descending-colon", "sigmoid-colon", "rectum", "anal-canal"],
  "skinNodes": ["skin-wire"],
  "notes": ["No rig, weights, fibres or attachment sites.", "Tube organs carry _U along the centreline (0 = mouth end).",
            "Small intestine coils: if the source is a lumped mass, centreline is schematic (flag in report.md)."]
}
```

步骤（runbook §4 的简化版）：cache（`VisceralSystem100.fbx`、`CardioVascular41.fbx` 下载 + `FETCHED.txt` / `SHA256SUMS.txt` 追加）→ inventory 刷新 → `manifests.py` 生成 `digestive/manifest.json` + `MANIFEST-READY` → `build.py`（选取、坐标转换、按容差简化、`_U` 烘焙、`closed` extras）→ `optimize.ts`（meshopt + 量化，保留署名）→ audit（surface / topology / 预算 / 命名 / `_U` 单调性；weights / fibre / outlier 项跳过）→ `preview.py`（front / back / left / exploded-by-system / skin overlay / tube-only 六张）→ `report.md` + `preview-review.md`（人审：器官相对位置、左右、胃的朝向、结肠框、小肠盘绕是否真实）。

### 2.4 参考图（`scripts/geo/digestive-system/refs/`，gitignore）

| # | 来源 | 许可 | 看什么 |
|---|---|---|---|
| R1 | Gray's Anatomy 1918（Bartleby / Commons 扫描）图 1035、1074 等腹部内脏图（图号 **待核**） | 公有领域 | 器官相对位置、结肠框、胃的形状 |
| R2 | OpenStax A&P 2e 图 23.2（消化系统总图）、23.11（胃）、23.20（绒毛） | CC BY 4.0（**待核**：docs/16 记为 CC BY-NC-SA 4.0 的是哪一版） | 课本示意的标准读法 |
| R3 | Commons `Digestive system diagram en.svg`（Mariana Ruiz，公有领域，**待核**） | PD | 儿童课本式总图 |
| R4 | Z-Anatomy 官方截图（GitHub README） | CC BY-SA 4.0 | 网格在原软件中的样子，核对导出无缺件 |

---

## 3. 零件（32 个 + 1 个 context）

### 3.1 坐标与分区

单位米，Y 向上、+Z 朝前、身体左 = +X（runbook §6）；全身落地（`−floorY`）。分区 = 系统 + 消化道分段，同时是 LAYERS：

| 分区 | 组 id | EN / ZH | 零件 | 组色 | 卡 |
|---|---|---|---|---|---|
| 01 | `mouth` | Mouth / 口 | teeth-upper, teeth-lower, tongue, salivary-glands, pharynx | `token:muscle-3` | ✓ |
| 02 | `gullet-stomach` | Gullet and stomach / 食道与胃 | oesophagus, stomach | `token:muscle-2` | ✓ |
| 03 | `small-intestine` | Small intestine / 小肠 | duodenum, jejunum, ileum | `token:muscle-1` | ✓ |
| 04 | `large-intestine` | Large intestine / 大肠 | caecum, appendix, ascending-, transverse-, descending-, sigmoid-colon, rectum, anal-canal | `token:bone` | ✓ |
| 05 | `helpers` | Liver and pancreas / 肝与胰（课外） | liver, gallbladder, pancreas, bile-duct | `token:food` | `card: false` |
| 06 | `body-systems` | The other four systems / 另外四个系统 | skeleton, muscles-superficial, diaphragm, lungs, trachea, heart, great-vessels | `token:ink-3` | `card: false` |
| 07 | `specimens` | Close-ups / 放大标本 | tooth-section, stomach-wall, villi-block | `token:ink-2` | `card: false` |
| — | `meal` | A meal / 一顿饭 | 只有流 | `token:food` | — |
| — | `juices` | Digestive juices / 消化液 | 只有流 | `token:loop` | — |

右上卡 4 列 = 口 → 食道与胃 → 小肠 → 大肠，`connects` 正好是课纲的五部分顺序。

### 3.2 零件表

| # | id | 组 | 源 | 材质（glb 写 `material`） | explode（剥层 / 拆开） | connects | 说明（summary 要点） |
|---|---|---|---|---|---|---|---|
| 01 | `teeth-upper` | mouth | mesh | `tissue` + 象牙 tint | 上 0.04 | tongue | 切断、撕碎食物 |
| 02 | `teeth-lower` | mouth | mesh | 同上 | 下 0.04 | tongue | 与上牙一起嚼碎食物 |
| 03 | `tongue` | mouth | mesh | `muscle` + 粉 tint | 前 0.04 | pharynx | 把食物和唾液拌匀、推向喉咙 |
| 04 | `salivary-glands` | mouth | mesh，bilateral（真实右侧节点） | `tissue` 乳黄 | 外 0.04 | tongue | 分泌唾液，润湿食物、开始分解淀粉 |
| 05 | `pharynx` | mouth | mesh | `tissue` | 后 0.03 | oesophagus | 吞咽时把食团送进食道 |
| 06 | `oesophagus` | gullet-stomach | mesh（tube） | `tissue` 粉褐 | 后 0.05 | stomach | 肌肉一波波收缩把食团推进胃 |
| 07 | `stomach` | gullet-stomach | mesh（tube，`closed: false`） | `tissue` 粉 | 前左 0.08 | duodenum | 搅拌食物、加入胃液 |
| 08 | `duodenum` | small-intestine | mesh | `tissue` | 前 0.06 | jejunum | 小肠开头；胆汁和胰液从这里流进来 |
| 09 | `jejunum` | small-intestine | mesh | `tissue` | 前 0.10 | ileum | 继续消化并吸收 |
| 10 | `ileum` | small-intestine | mesh | `tissue` | 前 0.10 | caecum | 吸收剩下的营养 |
| 11 | `caecum` | large-intestine | mesh | `tissue` 灰粉 | 右前 0.08 | ascending-colon | 大肠的起点 |
| 12 | `appendix` | large-intestine | mesh | 同上 | 右下 0.06 | — | 挂在盲肠上的小管（课外） |
| 13 | `ascending-colon` | large-intestine | mesh | 同上 | 右 0.08 | transverse-colon | 向上走，开始吸收水 |
| 14 | `transverse-colon` | large-intestine | mesh | 同上 | 上 0.08 | descending-colon | 横过腹部 |
| 15 | `descending-colon` | large-intestine | mesh | 同上 | 左 0.08 | sigmoid-colon | 向下走，内容物变稠 |
| 16 | `sigmoid-colon` | large-intestine | mesh | 同上 | 左下 0.06 | rectum | S 形的一段 |
| 17 | `rectum` | large-intestine | mesh | 同上 | 后 0.05 | anal-canal | 暂存粪便 |
| 18 | `anal-canal` | large-intestine | mesh | 同上 | 下 0.04 | — | 管子的出口（肛门） |
| 19 | `liver` | helpers | mesh | `tissue` 红褐（低饱和） | 右上 0.12 | gallbladder | 造胆汁（以及很多别的工作） |
| 20 | `gallbladder` | helpers | mesh | `tissue` 灰绿 | 右 0.10 | bile-duct | 储存胆汁 |
| 21 | `pancreas` | helpers | mesh | `tissue` 乳黄 | 下 0.10 | duodenum | 造胰液送进小肠 |
| 22 | `bile-duct` | helpers | mesh 或程序化 `tube`（示意） | `tissue` | — | duodenum | 胆汁的导管 |
| 23 | `skeleton` | body-systems | mesh（合并低模） | `tissue` 骨色（`token:bone` tint） | — | — | 骨骼系统：支撑、保护 |
| 24 | `muscles-superficial` | body-systems | mesh（合并低模） | `muscle` + `token:muscle-1` | 外 0.05 | — | 肌肉系统：让身体动 |
| 25 | `diaphragm` | body-systems | mesh | `muscle` | — | — | 胸腔与腹腔的分界（呼吸肌） |
| 26 | `lungs` | body-systems | mesh，bilateral | `tissue` 淡粉 | 外 0.06 | trachea | 呼吸系统：吸进氧、呼出二氧化碳 |
| 27 | `trachea` | body-systems | mesh | `tissue` | — | lungs | 气管 |
| 28 | `heart` | body-systems | mesh | `muscle` 深红（低饱和） | 前 0.06 | great-vessels | 循环系统：泵血 |
| 29 | `great-vessels` | body-systems | mesh | `tissue` | — | heart | 主动脉与大静脉 |
| 30 | `tooth-section` | specimens | 程序化：lathe 牙冠 + 牙根，剖开（`extra`：釉质壳、牙本质、牙髓），放大 ×6，摆在身体右侧 0.5 m | `enamel`、`tissue` | — | — | 牙的剖面（课外：釉质最硬） |
| 31 | `stomach-wall` | specimens | 程序化：extrude 带褶皱的壁块（黏膜褶、三层肌肉 sweep 条纹） ×10 | `tissue`、`muscle` | — | — | 胃壁的褶与肌层 |
| 32 | `villi-block` | specimens | 程序化：box 底 + capsule 绒毛 `repeat` 6 × 8，单个剖开见毛细血管（`sweep` 细线） ×100 | `tissue`、`token:muscle-2` | — | — | 小肠内壁的绒毛 |
| — | `skin-outline` | context | mesh（`skin-wire`） | 墨色线框 / `mannequin` | — | — | 身体轮廓；第 01 章外 `ghost` |

- `specimens` 的放大倍数写在零件名与 summary（"×100"），PLATE 比例尺只对人体有效：细看说明。
- 预算（三角形）：tube 合计 ≈ 110 k（小肠 30 k）；mouth 25 k；helpers 25 k；body-systems ≈ 130 k；specimens（程序化）≈ 20 k；skin 5 k → ≈ 315 k（soft 350 k）。绘制：零件按材质 ≈ 40；运转 +9 流 + 3 动画。

---

## 4. 流、动画、剖切、姿态、预设、读数、引擎缺口

### 4.1 颜色语义

| token | 意思 |
|---|---|
| `token:food` | 食物和它被消化成的简单物质（同一种东西，颜色不换；**离开管子进入血液**的粒子也是这一色，表示"消化后的食物被吸收了"） |
| `token:cut` | 与胃液混合后的糊状食物（食糜）——`meal` 流 stops 的中段 |
| `token:neutral` | 营养被吸走后剩下的部分 |
| `token:ink-3` | 粪便（大肠后段） |
| `token:loop` | 消化液（唾液、胃液、胆汁、胰液） |
| `token:water` | 被大肠（和小肠）吸收的水 |

### 4.2 流（9 条；路径由 E-D2 从网格中心线生成，下表写零件顺序）

| id | group | 路径 | speed（U/s） | count | size × | stops | ends | clip | parts |
|---|---|---|---|---|---|---|---|---|---|
| `swallow` | meal | 口腔 → 咽 → 食道 → 贲门 | 0.12 | 80 | 1.6（"食团"：少而大） | 0: food | open | true | teeth-upper, tongue, pharynx, oesophagus |
| `churn` | meal | 胃内闭环（胃底 → 胃体 → 幽门窦 → 回旋） | 0.05 | 160 | 1.0 | 0: food · 0.4: cut · 1: cut | 闭环 | true | stomach |
| `small-gut` | meal | 幽门 → 十二指肠 → 空肠 → 回肠（中心线） | 0.06 | 360 | 0.8 | 0: cut · 0.6: cut · 1: neutral | open | true | duodenum, jejunum, ileum |
| `large-gut` | meal | 回盲部 → 升 → 横 → 降 → 乙状结肠 → 直肠 → 肛管 | 0.03 | 240 | 0.9 | 0: neutral · 0.6: ink-3 · 1: ink-3 | fade | true | caecum, ascending-colon, transverse-colon, descending-colon, sigmoid-colon, rectum, anal-canal |
| `saliva` | juices | 两侧唾液腺 → 口腔（`bilateral: true` 镜像一条） | 0.05 | 40 | 0.5 | loop | fade | true | salivary-glands, tongue |
| `bile` | juices | 肝 → 胆囊 → 胆管 → 十二指肠 | 0.05 | 60 | 0.5 | loop | fade | true | liver, gallbladder, bile-duct, duodenum |
| `pancreatic` | juices | 胰 → 十二指肠 | 0.05 | 40 | 0.5 | loop | fade | true | pancreas, duodenum |
| `absorb-food` | meal | 小肠壁 → 向外散开（`spread` 大，示意进入血管） | 0.08 | 240 | 0.4 | 0: food · 1: food 0 % 淡出 | fade | true | jejunum, ileum |
| `absorb-water` | meal | 结肠壁 → 向外散开 | 0.08 | 160 | 0.4 | 0: water | fade | true | ascending-colon, transverse-colon, descending-colon |

- 分段流的通量按 `count / 长度 × speed` 大致相等；在胃和大肠里慢（各段自己的 speed），表达"停留几小时 / 一两天"；真实时间只写在字幕和细看。
- 运转 +9 次绘制（`saliva` bilateral +1 → 10，可接受；超预算时合并 `bile` 与 `pancreatic`）。

### 4.3 动画与姿态

| id | target | kind | 参数 | 说明 |
|---|---|---|---|---|
| `peristalsis-gullet` | oesophagus | `wave`（E-D3） | speed 0.25 U/s 沿 `_U`、width 0.04、squeeze 0.35 | 蠕动波；退路：`swallow` 流 + 无形变 |
| `peristalsis-gut` | jejunum, ileum, colon 各段 | `wave` | speed 0.08、width 0.03、squeeze 0.2 | 同上 |
| `stomach-churn` | stomach | pulse | scale [1.04, 1.02, 1.04]，hz 0.5（真实约 0.05 Hz，画面放快 10 倍，细看写明） | |
| `chew` | teeth-lower | oscillate + pivot（颞下颌关节，从骨网格量取） | amplitude 8°，hz 1.2 | 只在第 03 章运转时 |

| pose | 内容 | 用在 |
|---|---|---|
| `stomach-full` | stomach scale 1.25（pivot 贲门） | 第 04 章拍 3 |
| `lift-front` | liver offset [0, 0.06, 0.04]、transverse-colon offset [0, 0.05, 0.05]、stomach offset [0.02, 0.03, 0.04] | 第 05 章（露出胰、十二指肠、胆管） |
| `intestine-aside` | jejunum、ileum offset [0.12, 0, 0.10] | 第 06 章（露出完整的结肠框） |

### 4.4 剖切、X-RAY、剥层

- `views.cuts`：`midline`（`{ normal: [-1,0,0], offset: 0.003 }`，矢状，看口—咽—食道的通路；label "Midline / 正中"）；`stomach-open`（冠状，过胃中心，`closed: false` 的胃露出内腔与流；label "Stomach / 胃剖开"）。
- X-RAY：shell = skin-outline、muscles-superficial、skeleton（第 01 章逐系统点亮用 `ghost` + LAYERS ⊙）。
- EXPLODED（`explodeLabel` "Spread out / 摊开"）：按 §3.2 的方向把各器官拉开；流禁用（引擎）。

### 4.5 镜头预设（≤ 6）

| id | 用途 |
|---|---|
| `hero` | 正面 3/4，全身 + 腹部器官（封面，皮肤 ghost） |
| `head` | 头颈侧前方（口、唾液腺、咽、食道上段） |
| `abdomen` | 腹部正面近景 |
| `stomach` | 胃左前方近景 |
| `back-organs` | 拿开前面的器官后看胰与十二指肠（配 `lift-front`） |
| `specimens` | 三个放大标本台 |

### 4.6 引擎缺口

| # | 优先 | 缺口 | 现状 | 最小方案 | 退路 |
|---|---|---|---|---|---|
| E-D1 = B3 | 必须 | **器官网格管线**：`scripts/anatomy` 注册 `digestive`，`organ / tube / system` 角色 | `run.py` choices 固定六区；build 假设有 rig / 纤维 | manifest 角色分支：跳过 rig、weights、fibre、sites；保留选取、坐标、简化、命名、署名、audit 的 surface / 预算 / 命名项；`preview.py` 加 exploded-by-system | 无（网格主题的前提） |
| E-D2 = B4 | 必须 | **网格中心线 → 流路径**（构建期） | 流路径手写 | Blender 里沿 `centreline` 种子做切片质心追踪（tube 器官），按 `centrelineOrder` 首尾相连、每 8 mm 一点，输出 `digestive/centreline.json`；同一次烘焙 `_U` | 小肠若是整团：在团块体内按 manifest `seeds` 画示意蛇形路径，`report.md` 与已知差距写"小肠流路径示意" |
| E-D3 | 应该 | **蠕动波动画** `kind: "wave"`（docs/14 B15 设想的"沿身体传播的运动波"） | 有 `pulse`、`contract`（M7，肌肉收缩用 `_U`） | 顶点着色器：在 `_U` 上取一个沿 +u 移动的高斯环，沿法线向内收 `squeeze`、两侧略鼓；参数 speed / width / squeeze / hz；复用 `contract` 的 `_U` 读法；单测 `lib/animation` | 只有流的食团在走，管子不动；细看说明真实的蠕动 |
| E-D4 | 可选 | 流的 `stops[].speed`（某段减速） | stops 只变色 | 着色器按 u 插值速度倍数 | 分段流各自 speed（本 spec 已这样写） |
| E-D5 | 可选 | 放大标本的**局部比例尺**（`specimens` 组自己的 `units`） | `units` 全主题一个 | 组级 `units` 覆盖 PLATE 比例尺 | 零件名写"×100"，细看说明 |

---

## 5. 章节（7 章）

### 5.0 总表

| # | id | 标题 EN / ZH | view | run | cutaway | layers | ghost | pose | 镜头 |
|---|---|---|---|---|---|---|---|---|---|
| 01 | `five-systems` | Five systems in one body / 一个身体里的五个系统 | xray | false | none | 全部 − specimens − 流组 | — | — | hero |
| 02 | `one-long-tube` | One long tube / 一条长长的管子 | assembled | false | none | mouth, gullet-stomach, small-intestine, large-intestine, helpers | body-systems, skin-outline | — | abdomen |
| 03 | `mouth-and-gullet` | Mouth and gullet / 口与食道 | assembled | true | midline | mouth, gullet-stomach, meal, juices | body-systems | — | head |
| 04 | `the-stomach` | The stomach / 胃 | assembled | true | stomach-open | gullet-stomach, small-intestine, meal, juices, specimens | body-systems | — | stomach |
| 05 | `small-intestine` | The small intestine / 小肠 | assembled | true | none | small-intestine, helpers, gullet-stomach, meal, juices, specimens | body-systems | lift-front | back-organs |
| 06 | `large-intestine` | The large intestine and the way out / 大肠与出口 | assembled | true | none | large-intestine, small-intestine, meal | body-systems | intestine-aside | abdomen |
| 07 | `a-meals-journey` | A meal's journey / 一顿饭的旅程 | xray | true | none | 全部 − specimens | skin-outline | — | hero |

### 5.1 各章

**01 `five-systems`**（P1 第 53 页 LO1）
- summary：The body has systems that work together; the digestive system breaks food down so the body can use it. / 身体里有几个一起工作的系统；消化系统把食物分解，让身体能用上。
- 正文提纲：五个系统各一句（F-18）；"系统 = 一起完成功能的部分"（课纲第 52 页 About Systems）；不要求骨、肌肉的名字（课纲 Note）；为什么从消化系统讲起。
- 节拍：

| 拍 | state | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | hero，全部可见 | Inside one body are several systems. Each is a group of parts that work together. / 一个身体里有好几个系统。每个系统是一组一起工作的部分。 |
| 2 | layers ⊙ body-systems: skeleton | The skeletal system holds the body up and protects the soft parts inside. / 骨骼系统撑起身体，保护里面柔软的器官。 |
| 3 | ⊙ muscles-superficial | The muscular system moves the bones. / 肌肉系统拉动骨骼，让身体动起来。 |
| 4 | ⊙ lungs, trachea, heart, great-vessels | The respiratory system takes in oxygen; the circulatory system carries it round the body in the blood. / 呼吸系统吸进氧，循环系统用血液把它送到全身。 |
| 5 | ⊙ 消化四组 | The digestive system breaks food down into simpler substances the body can take in. / 消化系统把食物分解成身体能吸收的更简单的物质。 |

- 细看：`Where the model comes from`（Z-Anatomy / BodyParts3D 署名、改动、男性参考身体）；`Systems work together`（P5 预告）。
- **试一试**：打开 LAYERS，用每行末的 ⊙ 一次只看一个系统，说出它的一个功能。
- 索引：skeleton, muscles-superficial, lungs, heart, stomach, jejunum, liver。
- 名词首现：`system`、`organ`、`digestion`。

**02 `one-long-tube`**（LO2 的五部分）
- summary：Food travels through one long tube from mouth to anus: gullet, stomach, small intestine, large intestine. / 食物走过一条从口到肛门的长管：食道、胃、小肠、大肠。
- 正文提纲：五部分的顺序与位置；长度（F-1、F-10、F-13，规格行第一次出现）；盘在腹腔里；肝胰在旁边但不在管上（误解 6 预告）。
- 节拍（5）：腹部全景 → 口与食道（labels mouth 组 + oesophagus）→ 胃 → 小肠盘绕 → 大肠框 + 出口。字幕每拍一句"它在哪里、多长"。
- 细看：`Longer when measured after death`（F-1 两个数）；`Why so long`（不写目的论：长 + 盘绕 → 面积大）。
- **试一试**：在走廊里拉一根 7.6 米长的绳子，再把它塞进一个书包，感受肠子"盘"起来的样子。
- 索引：tongue, oesophagus, stomach, duodenum, jejunum, ileum, transverse-colon, rectum, anal-canal, liver。
- 名词首现：`gullet`、`small-intestine`、`large-intestine`。

**03 `mouth-and-gullet`**
- summary：Teeth break food into small pieces, saliva starts digestion, and waves of muscle push it down the gullet. / 牙齿把食物弄碎，唾液开始消化，肌肉一波波地把食团推下食道。
- 正文提纲：切、撕、磨（F-2）；唾液（F-3）；舌把食团推向咽；吞咽时会厌盖住气管（插图 `swallowing`）；蠕动（F-4、F-5）。
- 节拍（5）：口腔近景（`chew` 动画）→ 唾液腺与唾液流（loop 色，第一次说图例："青灰是消化液，赭绿是食物"）→ 食团到咽（`midline` 剖切）→ 食道里的蠕动波 → 食团进胃。
- 细看：`Tooth close-up`（`tooth-section` 标本 + 插图）；`Swallowing upside down`；`Starch to sugar`（课外：一句话提淀粉酶）。
- **试一试**：嚼一块原味苏打饼干一分钟不吞，留意它慢慢变甜（唾液把淀粉分解成糖）。
- 索引：teeth-upper, teeth-lower, tongue, salivary-glands, pharynx, oesophagus, tooth-section。
- 名词首现：`saliva`、`peristalsis`、`digestive-juice`。

**04 `the-stomach`**
- summary：The stomach stretches, churns the food and mixes it with acidic juice for a few hours. / 胃会撑大，把食物搅拌并与很酸的胃液混合几个小时。
- 正文提纲：容量（F-6）；搅拌（F-8）；胃液酸（F-7）；停留时间（F-9）；胃壁的褶与三层肌（`stomach-wall` 标本）。
- 节拍（4）：胃的外观 → `stomach-open` 剖切看内腔和 `churn` 流（颜色由 food 变 cut）→ `stomach-full` 姿态 → 胃壁标本。
- 细看：`How acidic`（F-7 对照柠檬汁，**待核**）；`Why the stomach does not digest itself`（黏液层，P2）；`Stomach waves are slow`（画面放快 10 倍）。
- **试一试**：在密封袋里放一片面包和少许水，捏揉一分钟，看它变成糊——这就是"搅拌"。
- 索引：oesophagus, stomach, duodenum, stomach-wall。
- 名词首现：`stomach`（如未首现）、`chyme`（细看，课外）。

**05 `small-intestine`**
- summary：In the small intestine, juices from the liver and pancreas finish digestion, and digested food passes into the blood. / 在小肠里，肝和胰送来的消化液完成消化，消化后的食物进入血液。
- 正文提纲：十二指肠、空肠、回肠（F-10）；胆汁与胰液（F-16、F-17；肝胰"课外"）；绒毛与吸收面积（F-11 两数并列）；营养进入血液（与循环系统的连接，P5 预告）；时间（F-12）。
- 节拍（5）：`lift-front` 露出十二指肠、胰、胆管 → `bile` + `pancreatic` 流（loop）→ 小肠流（cut → neutral）→ `absorb-food`（food 色粒子离开管子："赭绿的点离开小肠，表示消化后的食物进入了血液"）→ `villi-block` 标本。
- 细看：`Helpers outside the tube`（误解 6）；`How big is the inside`（F-11 两个口径）；`Most water is absorbed here too`（F-15，误解 5 的精确版）。
- **试一试**：把一张纸巾平铺量面积，再折成许多褶塞进一个小盒子——同样大小的盒子里，褶子能放下更多面积。
- 索引：duodenum, jejunum, ileum, liver, gallbladder, pancreas, bile-duct, villi-block。
- 名词首现：`villi`、`absorption`、`bile`。

**06 `large-intestine`**
- summary：The large intestine takes in water from what is left; the rest leaves the body through the anus. / 大肠从剩下的东西里吸收水分，余下的从肛门排出体外。
- 正文提纲：结肠框与盲肠、阑尾（F-13）；吸收水和矿物盐（课纲词）；肠道细菌一句；粪便、直肠、肛门（平实一次）；时间（F-14）；喝水与膳食纤维（F-20，HPB 原文）。
- 节拍（4）：`intestine-aside` 露出完整结肠框 → `large-gut` 流（neutral → ink-3）+ `absorb-water`（water 色，第一次说"蓝点是被吸收的水"）→ 直肠与肛管 → 回到腹部全景。
- 细看：`The appendix`（课外，事实一句）；`Water and fibre`（HPB）；`Bacteria in the gut`（一句，课外）。
- **试一试**：连续两天记下每天喝了几杯水，对照 HPB 的建议。
- 索引：caecum, appendix, ascending-colon, transverse-colon, descending-colon, sigmoid-colon, rectum, anal-canal。
- 名词首现：`faeces`、`anus`。

**07 `a-meals-journey`**（演示章：一盘鸡饭）
- summary：Follow one plate of chicken rice from the first bite to the next day. / 跟着一盘鸡饭，从第一口走到第二天。
- 正文提纲：全程时间线（F-4、F-9、F-12、F-14）；每一站发生什么（课纲五部分一句一个）；三系统协同（P5 预告）。
- 节拍（6）：第一口（0 分钟，口）→ 吞下（约 10 秒，食道）→ 胃（2–4 小时）→ 小肠（再 3–5 小时，营养进血）→ 大肠（12–24 小时以上，吸水）→ 排出（约 1–3 天，全程；"每个人、每顿饭都不一样"）。所有时间写"大约"，带来源。
- 细看：`Times are typical, not exact`；`The whole system at once`。
- **试一试**：按 P 进入演示，从第一拍放到最后一拍；打开语音（中、英各听两拍）。
- 索引：teeth-lower, oesophagus, stomach, jejunum, ileum, transverse-colon, anal-canal, liver, pancreas。

---

## 6. 名词表 `glossary.json`（候选 15）

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| `system` | system / 系统 | 一起完成某项功能的一组部分 | organ |
| `organ` | organ / 器官 | 身体里有特定功能的部分 | system |
| `digestion` | digestion / 消化 | 把食物分解成更简单、能被吸收的物质 | digestive-juice |
| `digestive-juice` | digestive juice / 消化液 | 唾液、胃液、胆汁、胰液等 | saliva, bile |
| `saliva` | saliva / 唾液 | 口里的消化液 | digestion |
| `gullet` | gullet / 食道 | 口与胃之间的管（oesophagus） | peristalsis |
| `peristalsis` | peristalsis / 蠕动 | 管壁肌肉一波波收缩推动内容物 | gullet |
| `stomach` | stomach / 胃 | 搅拌并用胃液消化食物 | chyme |
| `chyme` | chyme / 食糜 | 胃里食物与胃液的糊状混合物（课外） | stomach |
| `small-intestine` | small intestine / 小肠 | 完成消化、吸收营养 | villi |
| `villi` | villi / 绒毛 | 小肠内壁指状突起，增大吸收面积 | absorption |
| `absorption` | absorption / 吸收 | 消化后的物质穿过肠壁进入血液 | villi |
| `bile` | bile / 胆汁 | 肝造、胆囊存，帮助消化脂肪（课外） | digestive-juice |
| `large-intestine` | large intestine / 大肠 | 吸收水和矿物盐，形成粪便 | faeces |
| `faeces` | faeces / 粪便 | 未被消化吸收的剩余物 | anus |
| `anus` | anus / 肛门 | 消化道的出口 | faeces |

---

## 7. 来源计划（≥ 15）

| P# | 内容 | 来源 | 用于 |
|---|---|---|---|
| P0 | 本主题模型研究（网格选取、简化、SIM 读数） | 本 spec | 规格行、PLATE |
| P1 | MOE *Science Syllabus Primary 3–6*（2023），第 20 页表 2、第 52 页 About Systems、第 53 页 Human System (Digestive System) (P4)、第 54 页 P5 | docs/17 S3（本地已核页码） | 课纲 |
| P2 | OpenStax *Anatomy and Physiology 2e*，第 23 章（23.1 Overview、23.3 Mouth/Pharynx/Esophagus、23.4 Stomach、23.5 Small and Large Intestines、23.6 Accessory Organs、23.7 Chemical Digestion and Absorption） | CC BY 4.0（许可版本 **待核**） | F-1–F-17 |
| P3 | NIDDK（美国国立卫生研究院）*Your Digestive System & How It Works* | 公有领域（美国政府） | 总览、时间 |
| P4 | 生理学教科书（Guyton & Hall *Medical Physiology* 或 Boron & Boulpaep）消化道运动章：食道蠕动速度、胃慢波 3 次 / 分 | 引用事实 | F-5、F-7、F-8 |
| P5 | OpenStax *Biology 2e* 第 34 章 Animal Nutrition and the Digestive System | CC BY 4.0 | 对照、双语术语 |
| P6 | Helander HF, Fändriks L. "Surface area of the digestive tract – revisited." *Scand J Gastroenterol* 2014;49(6):681–689 | 摘要（全文可达性 **待核**） | F-11 |
| P7 | Hounnou G et al. "Anatomical study of the length of the human intestine." *Surg Radiol Anat* 2002 | 摘要 | F-1、F-10 交叉核对 |
| P8 | HPB（新加坡保健促进局）*My Healthy Plate*、饮水与膳食纤维建议 | **待核** | F-20 |
| P9 | Z-Anatomy（GitHub `LluisV/Z-Anatomy`，`Resources/Models/FBX/`） | CC BY-SA 4.0（docs/16 §2.1 已核） | 网格 |
| P10 | BodyParts3D（DBCLS）许可页 | CC BY 4.0（现行）/ CC BY-SA 2.1 JP（历史署名） | 网格上游 |
| P11 | Gray, *Anatomy of the Human Body* (1918)，消化器官章与图 | 公有领域 | R1、位置核对 |
| P12 | FMA（Foundational Model of Anatomy）术语 | 引用 | 节点名对照 |
| P13 | MOE *PE Syllabus*（2024）Physical Health and Safety 营养部分 | docs/17 S4 | 第 06 章健康细看的课纲位置 |
| P14 | OpenStax A&P 2e 23.3 的吞咽三阶段与会厌 | 同 P2 | 第 03 章插图 |
| P15 | MedlinePlus（美国国家医学图书馆）"Digestive system" 条目 | 公有领域 | 交叉核对 |
| P16 | Science Learning Hub（新西兰）或 Khan Academy 消化系统条目（只作交叉核对） | 各自许可 | 交叉核对 |

---

## 8. 图像清单（给 Codex）

同 docs/24 §8 的风格与流程（`STYLE_BRIEF`、`illustrate.ts figure`、`<Figure>`）。

### 8.1 首页图版 `genimg/roadmap/digestive-system.png`：**保留**

已看：食道、肝（含胆囊）、胃、胰、十二指肠弯、空回肠盘绕、结肠框与结肠袋、盲肠与阑尾、直肠，躯干与骨盆淡线，位置关系正确，与模型同一读法。小问题：直肠末端画成开口的管口（不是闭合的肛门）；边缘有几处黄色噪点（`process` 会去色）。可以直接用；若 Gavin 介意末端，按原 prompt 加一句 "the rectum ending in a closed anal canal" 重画。

### 8.2 章节图（7 张）

| id | 章 | 用途 | SUBJECT |
|---|---|---|---|
| `five-systems` | 01 | 五系统一览 | five small anatomical figures of the same standing human body side by side, each showing only one system: the skeleton, the main muscles, the lungs and windpipe, the heart with the main blood vessels, and the digestive tract from mouth to anus; neutral pose, faint body outline in each, scientific plate, no text |
| `tooth-section` | 03 | 牙的剖面 | a single human molar tooth cut in half lengthwise, showing the hard outer enamel on the crown, the dentine beneath, the soft pulp cavity with a fine blood vessel and nerve entering through the root tips, and the gum and jawbone around the roots, anatomical plate |
| `swallowing` | 03 | 吞咽 | a side cutaway of the human head and neck at the moment of swallowing: the tongue pushing a round lump of food back into the throat, the soft palate raised, the epiglottis folded down over the opening of the windpipe, and the food entering the gullet behind it, anatomical plate, no labels |
| `stomach-wall` | 04 | 胃壁 | the human stomach cut open from the front, showing the thick folds of its inner lining, with a small wedge of the wall lifted out beside it showing three layers of muscle running in different directions, anatomical plate |
| `villus` | 05 | 绒毛 | a magnified cutaway of the inner wall of the small intestine: a field of finger-like villi standing up from the lining, one villus cut open to show the fine network of blood capillaries and a central lymph vessel inside it, scientific plate |
| `liver-pancreas` | 05 | 肝胰与十二指肠 | the liver lifted upwards to reveal the gallbladder beneath it, the bile duct running down to join the duct from the pancreas, both opening into the C-shaped first part of the small intestine that curves around the head of the pancreas, the stomach drawn faintly to one side, anatomical plate |
| `chicken-rice` | 07 | 一顿饭 | a plate of Hainanese chicken rice on a plain table: sliced poached chicken, a mound of rice, a few slices of cucumber, a small dish of chilli sauce and a small bowl of clear soup, drawn as a still life plate, no text |

图数：首页 1（保留）+ 章节 7 = 7 张新图。

---

## 9. 施工顺序、分工、工作量

| 步 | 内容 | 谁 | 完成标准 |
|---|---|---|---|
| 0 | spec 定稿 | Gavin | §0 回填 |
| 1 | 下 `VisceralSystem100.fbx`、`CardioVascular41.fbx` 到 `scripts/anatomy/cache/`，追加 `FETCHED.txt`、`SHA256SUMS.txt`；刷新 inventory；**按 inventory 定零件表**（§2.2 的待核清零，差异回填本 spec） | 主会话 / Opus | inventory 里能找到 §2.2 的每个节点或写明替代 |
| E1 | B3：`digestive` region 注册、角色分支、manifest 生成器 | Opus（管线），native Blender 5.1（runbook §3：Codex sandbox 需 `danger-full-access` 或本机终端） | `report.md` 预算内、0 命名缺失；`preview-review.md` 逐图写观察 |
| E2 | B4：中心线与 `_U` 烘焙；E-D3 `wave` 动画（schema + 着色器 + 单测 + docs/06） | Opus（管线 + 引擎） | `centreline.json` 叠在网格上的 preview；`sample-space` 第 05 章不回归 |
| 2 | 脚手架 `pnpm tsx scripts/new-topic.ts digestive-system --engine space-scene --subject biology --title-en "The digestive system" --title-zh "消化系统"` | 主会话 | validate 绿 |
| D | `parts.json`（32 + 1）、组、流 9、动画 4、姿态 3、剖切 2、预设 6、读数 3；specimens 程序化建模 | Opus（几何） | `pnpm shoot digestive-system` 自证；calls 静止 < 80、运转 < 90（网格主题预算） |
| T | `sources.json`、`glossary.json`、零件 summary / detail、7 章正文；样章 = 第 05 章 | Opus（事实与文字）；Codex 可起草 detail 英文初稿 | F 表待核清零；`<Num>` 齐 |
| I | §8 七张图 | Codex | 主会话逐张看 |
| B | 7 章节拍 | Sonnet | `--beats` 0 失败、无漏标 |
| P | 四处署名、HUD、模式组合、审计 | Sonnet（QA） | acceptance 全勾 |

工作量：**M**（docs/17）——网格就绪度高，但 B3 / B4 / E-D3 三项管线与引擎工作加起来接近 L 的下限；E1 若 Visceral 网格质量差（小肠是团块），加 0.5–1 日处理示意路径。docs/04 的"消化系统 · Layer2D"行在定稿后改为本 spec（Model3D + 网格）。

文件归属：管线代理只碰 `scripts/anatomy/**` 与 `public/models/digestive-system.glb`；引擎代理只碰 `src/engines/space-scene/**`、`src/content/schema/**`、docs/06；几何 / 文字代理按 build-order 表；不改 `package.json`。

---

## 10. 验收

`atlas-space-topic/references/acceptance.md` + `anatomy-mesh-runbook.md` 三道人审全部通过，门槛全绿（`pnpm check`、`validate`、`test`、`build`、`e2e`、`pnpm shoot digestive-system --layout --keys --beats`，EN / ZH × paper / cinema）。本主题另加：

- [ ] glb ≤ 4 MB、≤ 350 k 三角形；`asset.copyright` 署名在优化后仍在；四处署名齐全。
- [ ] 主线（字幕、本章索引前几项）只用课纲五部分的词；肝、胰、胆囊处处标"课外"；肛门、粪便各平实出现，无多余描写。
- [ ] 每个流一色一义（§4.1）；第 03、05、06 章各在第一次用到时说图例。
- [ ] 小肠吸收面积两种口径并列（F-11）；"大肠吸收水"与"小肠吸收的水更多"的关系在细看里讲清，不与课纲冲突。
- [ ] 中心线流不穿出管壁（`--beats` 截图 + 剖切近景人看）；若小肠路径是示意，已知差距写明。
- [ ] 蠕动、搅拌的画面速度在细看里写明"放快 / 放慢"。
- [ ] 无拟人、无目的论、无疾病恐吓；健康建议只引 HPB / MOH 原文。
