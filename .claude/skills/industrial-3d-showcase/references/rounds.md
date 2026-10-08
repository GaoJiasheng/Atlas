# REFINEMENT ROUNDS — 打磨轮次

v1 能完整运行后，按顺序自动执行，不等用户逐轮发送。三个原项目的轮次（MHI 02–08、Eaton 02–09、沙虫 2–7）合并为下面 8 轮。

**每轮共同规则**

- 在当前实现上继续，不推翻上一轮。
- 遵守本轮的范围边界（"只改 X"），避免修一层坏一层。
- 结束时：保存 → `shoot.py` 截图 + console → 与参考图并排看 → 列差异 → **直接修** → 再截图 → 确认此前功能不回归。
- 出现 console error 先修，不能带到下一轮。
- 页面白屏 / 报错时：自己用 Playwright 抓 console，定位并修复，不改动其他功能。

---

## R2 — 几何与比例匹配

**只改几何、比例、结构**，不改 HUD 风格。

- 整机长 / 宽 / 高 / 直径比例、各分区长度比与参考一致。
- 逐项核对原型清单（见 `archetypes.md`）里的 Tier-1 部件：位置、体量、数量。
- 重复结构是否真的逐级 / 逐节变化，交替关系（rotor/stator、装甲环/缝隙）是否成立。
- 轴系、支撑、管路是否轴向 / 拓扑连续，有无穿模。
- 剖切是否像展台切割，而不是删掉一半。
- 近景细节：倒角、螺栓头、法兰螺栓圆、鳍片、风罩、卡箍铰链、软管壁厚、真实弯头半径、板式边缘节奏、面板凹槽、格栅。
- 只依据参考添加部件，禁止随机 greeble。
- 真实产品：用 photo-match 相机 + overlay（0–100%）逐视角至少两轮「截图 → overlay → 列差异 → 修 → 截图」；可选做轮廓 IoU 配准（参考图透明背景时最有效）。写 `reports/geometry-match.md` 记录残差。

截图：HERO + 各子系统近景 + 正侧剖面。

## R3 — 材质与灯光

**只改材质、灯光、阴影、贴图**，保持几何与功能稳定。

- 每个材质族可辨：外壳 vs 轴盘 vs 叶片 vs 热端 vs 管路 vs 框架；切口与外表面可辨。
- roughness variation、拉丝方向、极克制的 edge wear、细微色温差。禁止锈迹、指纹、霓虹。
- 灯光按工业产品摄影：大柔光 key + 柔和 fill + 环境 + 轻 rim。
- 4K HERO 检查：高光不 clipping、暗部不死黑、重复件层次清楚、主体与背景分离。
- 真实产品：用照片校准颜色和 roughness（照片偏暖时先按应为中性的区域求白平衡增益再取色）；logo / 面板 decal 透视校正后使用。
- 关闭 HUD 截 `shots/hero-clean.png`，要能直接当作品集封面。

## R4 — 工作原理动画

**只改原理动画和相关轻量 shader / 粒子**，不破坏几何和 HUD。

- 观众一眼看懂主流程（`{SECTION 01} → … → {SECTION 05}`）。
- 流线 / 粒子沿真实流道走，不穿实体；在压缩段变密加速、在燃烧段收拢、在换热器两侧隔离。
- 多回路主体：两回路颜色、路径永不共享同一段；换热用相邻隔离通道 + 跨板热量动画表达。
- THERMAL：低饱和，像 CFD，可读但不喧宾夺主；FLOW/THERMAL 切换平滑。
- 运动周期 / 启动序列与 HUD 状态同拍。
- 粒子 GPU 化，记录开启前后 draw calls（增幅 < 10）。

截图：flow、thermal、原理模式（combustion / filter / redundancy / locomotion）。

## R5 — HUD 与技术排版

**只改 HTML / CSS / SVG overlay**，不动 3D 场景。

- 更少卡片，更多直接文字、细线、刻度、编号；ivory / graphite / silver，禁止科技蓝 HUD。
- 左上参数区不遮挡主体；右上 SVG 简洁精准；底部三面板等高、网格对齐。
- 标注两列对齐、引线极细、避让面板、遮挡淡出、近景减量。
- 字更小更克制，字距更大；中英双语排版统一。
- 真实主体：FACT / REF. / RECONSTRUCTION / SIMULATED 标签视觉可辨。
- `shoot.py --layout` 在 3840 / 2560 / 1920 / 1280 / 900 宽度检查重叠和溢出，全部通过。

截图：HERO、CUTAWAY 完整 HUD，1080p 与 720p 响应式。

## R6 — 镜头与交互

逐项检查并修好：

- 每个预设 1.4–1.8 s easeInOut，不瞬移、不穿模、不裁掉主要结构，4K 与 1080p 构图都合理。
- HERO 是封面：主体占宽 70–80%，3/4 角度。
- 拖拽 → FREE CAMERA；点预设平滑恢复；过渡中拖拽不打架。
- REFERENCE ~2 s 进入并可恢复；X-RAY ~0.3 s；EXPLODED ~2 s 且与 EXPLODED 镜头相互独立但协调；CUTAWAY 滑块连续。
- SERVICE / focus：点击部件聚焦，ESC 返回。
- 模式组合逐一过：有意义的定义行为，没意义的显式禁用。
- `shoot.py --keys` 全部 OK；每个镜头截图；console 无 error。

## R7 — PRESENTATION 模式（可选但推荐）

按 `master-spec.md` H 节章节模板写约 75 s 自动展示。实现 `seekPresentation(t)` 以便按时间点截图验证（如 t = 4, 14, 24, 36, 47, 57, 66, 73），实时跑一遍确认每个章节镜头都到位、结束时 HUD 恢复、ESC / P 可随时退出。

## R8 — 性能与收尾

先记录基线（目标分辨率 + 1080p）：avg FPS、1% low（可靠时）、calls、triangles、geometries、textures。然后按 `perf-lessons.md` 的优先级优化。

不要首先：删除识别度高的大部件、把管路简化成线、降低主体 silhouette 准确性。

如果 headless 是软件渲染（SwiftShader），明确写 `HEADLESS/SOFTWARE RENDERING`，只报 draw call / triangle 等架构指标，不虚报 GPU FPS。

## R9 — 最终审计与交付

- **事实审计**（真实主体）：逐条搜页面里的数字，每个都有来源或带 SIMULATED / REF. 标签。
- **视觉审计**：关 HUD 看 HERO 是否像产品广告；材质、反射、比例；无霓虹。开 CUTAWAY 看内部是否可读、标签是否可信。
- **UX 审计**：键盘、鼠标、触控板、resize、pause、presentation 退出、所有按钮选中态。
- **代码审计**：删 TODO、placeholder、dead code、unused materials/textures、console spam。
- 全量重截 `shots/`（含 `_4k`），写 `reports/final-report.md`，最后给出运行命令和截图路径。
