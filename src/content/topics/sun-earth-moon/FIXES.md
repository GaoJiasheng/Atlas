# sun-earth-moon · FIXES（浏览器验收后留给 Codex 的返工项）

2026-10-27，Claude 浏览器验收。已自己改掉的小项见 docs/44 §9.4；下面是需要内容或引擎判断、不在“小修”范围的。截图在验收者本机 `shots/sun-earth-moon/<locale>-<theme>/`（不进 git），命名按 `beat-<chapter>-<n>.png`；HUD 态的截图是 `?ch=<id>&b=<n>` 链接在 1280×720 / 1024×768 / 1600×900 打开所得。

## F1 · 地轴与倾角弧从不出现标签（中）

- 现象：`pnpm shoot … --beats` 对 BG.2、01.2、01.4、01.5、02.1–02.5 共 9 拍都报 `no label: earth-axis`；章级也常报 `a-turning-earth / a-tilted-year: no label for earth-axis`，间或还有 `orbital-plane`、`observer-marker`（ch03、ch06）、`near-side-mark`（ch07），后几项随机，是镜头落定时序，不稳定。`earth-axis` 稳定缺失。
- 原因：`earth-axis` 的标注锚点是地球球心（圆柱穿过球心），与 `earth-body` 锚点相同且被球体遮住。02 章的主题是“量倾角”，轴、法线、倾角弧在 02.1–02.5 全无名字。
- 期望：给轴一个看得见的锚点（轴端或弧上）并出标签，或把 `earth-axis` 从各章/拍的 `labels` 列表去掉并在字幕里点名。镜头见 `beat-a-tilted-year-1.png`。

## F2 · 1280×720 及以下，满月拍的月球被观察卡盖住（中，引擎/镜头）

- 现象：04.3、05.3、07.3、07.5（月球在地球右侧）在 1600×900 已用镜头偏移修好（见 §9.4）；1280×720 仍然在观察卡下面，只剩半透明的影子（`en-paper-1280x720-one-moon-many-views-3`）；1024×768 地球和月球压在左栏 PLATE 文字上。
- 原因：HUD 下可用舞台宽度约 330 px（1280）而 0.75 m 的月轨道半径折算约 310 px 加地球半径放不下。数字镜头只能顾一个尺寸。
- 期望：舞台自由区感知的构图（按视口把镜头拉远或平移），或这几拍在窄屏用较大 fov。不要为单个尺寸再调数字。

## F3 · 近景辅助线过粗（低）

- 现象：BG.2、02.1–02.5、01 章地球近景里，轨道平面、法线、倾角弧、光线管约 5–6 px，压过技术图版的细线语言，近景中几根线交叉显得杂（`beat-before-you-start-2.png`、`beat-a-tilted-year-1.png`）。
- 原因：导引管半径 = 地球显示半径 × 0.012，随近景放大。
- 期望：细一半，或按屏幕像素定宽；倾角弧与法线保持可读。

## F4 · 影图条几乎是空的（低，需 Gavin 定）

- 现象：观察卡下半部“Finite Sun · one scale”的影图在真实同尺度下只剩一条线和 M、E 两个点（05.3、05.4、`en-paper-1600x900-alignment-and-eclipses-3`），本影/半影锥看不出来；食的几何其实全靠上半的视盘窗讲清。
- 期望：保持同尺度的前提下是否值得保留这个窗，或加一行说明“锥在此尺度下太细”。

## F5 · 小标注（低）

- 01.5：`09 EARTH TRACK` 的引线指向太阳中心（轨道辅助线锚点是轨道中心），读成“太阳就是地球轨道”。
- 02.5：`10 ORBITAL PLANE` 标签落在地球球体上，压住赤道环。
- 04.5：太阳盘压在左上角“SUN, EARTH AND MOON”标题上；06.5（1600×900 HUD）太阳压在左栏 PLATE 文字上。镜头可以右移一点。
- 04.5 字幕说远侧不是永远黑，但这一拍月球基本全黑（近侧标记朝镜头、太阳在后），画面没演示字幕。可换成能看到亮的远侧的方位。

## Codex 返工记录 · 2026-10-27

- **F1 已实现，待浏览器复验**：`earth-axis` 的 `bodyTransform.labelPoint` 为局部 `[0,1.35,0]`，随真实姿态/尺度投到轴端，bounds 仍保留球心。本题启用可选 `labelAnchors: strokes`，`orbital-plane` 锚在法线端；`observer-marker` 的球面点保持原位，逐拍解析检查均在相机可见半球；`near-side-mark` 锚移到圆片外表面，并检查每个列出它的拍的透视切线可见性。两种尺度和轴向/法线端点有单测。
- **F2 已实现，待浏览器复验**：通用、默认关闭的 `views.hudFrame.parts`；本题只列三天体。实际量取 HUD 自由矩形，保持 fov 和方向，按主体包围盒各点深度求最小平移/后拉，先保留已有窄舞台宽高比调整。完全出画的太阳不拉进近景；从作者镜头重算，响应 resize、卡片折叠、抽屉、HUD/演示和快照，拖拽后自由相机接管。无单尺寸调参；其他主题未启用，1600×900 保持原相机行为。8 项纯数学/Three.js 透视投影测试包含两种窄桌面、非验收中间尺寸、手机、深度、非对称卡片及已合适镜头不变。
- **F3 已实现，待目视**：本题用可选 orbit-guides `radius: 0.006` 将管半径减半；其他主题未写时仍为 ×0.012；法线、倾角弧仍用原几何和可选对象，地轴本体保留清楚的粗细。
- **F4 已实现，留给 Gavin 决定**：保留同尺度有限太阳影图，不放大影锥；本题通过可选 `panel.shadowNote` 在卡内补“同一比例下，影锥太细，难以看清。”及英文。是否保留影图的编辑选择另记 REVIEW.md，本轮按用户要求保留。
- **F5 四项已实现，待目视**：01.5 的 Earth track 锚在靠近地球但避开球体的真实轨道采样点；02.5 的 Orbital plane 锚在法线端，不再落在赤道上；04.5 换观察方位且太阳留在画外，06.5 镜头目标向太阳侧移动以让太阳在画面内右移；04.5 保留 α90 / synchronous=false，从新方位可见受光的远侧区域，近侧标记也在可见半球，解析单测覆盖这一点。

本轮不运行 shoot、浏览器 e2e、GPU 或桌面/用户浏览器工具；没有生成视觉验收证据。静态 gates 的最终结果记录在 docs/44 §9.5；主会话需重点复验 1280×720 / 1024×768 的 04.3、05.3、07.3、07.5，以及 1600×900 及双语双主题的标签、04.5/06.5、倾角细线和新增卡内说明。

## Claude 复验 · 2026-10-27（Codex 返工后，浏览器）

| 项 | 状态 | 所见 |
|---|---|---|
| F1 轴标签 | **完成**（余一小项） | 02.1–02.5、01.2/01.4/01.5 的地轴与轨道平面标签现在都出现，引线指向轴端 / 法线端（`beat-a-tilted-year-1`、1600×900 HUD 的 02.1 / 02.5）。仍报：BG.2 与偶尔 02.4 的 `no label: earth-axis`；章级 `a-turning-earth` 缺 `earth-axis`、`observer-marker`（章镜头）。新增章级提示 `one-moon-many-views: no label for sun-body, moon-body`（章镜头里太阳在画外，月球小）。 |
| F2 窄屏满月拍 | **1280×720 完成；1024×768 仍开** | 1280：04.3 / 05.3 / 07.3 / 07.5 月球清楚地在观察卡左侧（`x-en-paper-1280x720-*`）。1024：月球和地球都在画内，但整体缩到地球约 14 px，且太阳盘（镜头被拉远后进画）压在左栏 PLATE 文字上。1024 的自由带只有约 75 px 宽，拉远到容纳 0.75 m 月轨道就看不清地球。建议 1024 对这几拍只保证地球 + 月球，太阳不进框，或给地球一个最小屏幕半径。 |
| F3 导引线 | **完成** | 半径减半后 BG.2、02 章仍清楚可读，法线与倾角弧、光线管都在。 |
| F4 影图说明 | **完成** | 卡内出现“At one scale, the shadow cones are too thin to see clearly.”（及中文）；保留影图由 Gavin 定。 |
| F5 小标注 | **完成**（04.5 部分） | 01.5 Earth track 的引线落在地球旁的轨道上；02.5 Orbital plane 标签移到法线端不再压地球；06.5 太阳进入自由区、不再压左栏文字；04.5 太阳移出画面，月球换了方位，能看到受光侧的一条亮边，但“远侧不是永远黑”仍主要靠字幕。 |


## F2 · 1024×768 二次返工（Codex，2026-10-29；待主会话浏览器复验）

- `views.hudFrame.primary: { part: "earth-body", minRadiusPx: 24 }` 为本题显式指定主角与最小 CSS 像素半径（直径 48 px）。通用取景用内切球和真实相机深度限制后拉；不改天体比例或逐拍镜头。
- 实际 HUD 保留矩形随布局测量，旧自由带过窄时改试卡片下方等最大空矩形，月地两体仍须入画。作者镜头完全排除的太阳仍可在画外，但它的投影也必须避开每块 HUD，含左栏文字/PLATE；保留 12 px 间隔。保持 fov / 方向，已合适构图继续原快路。
- 所有变化限制在 `hudFrame` opt-in 路径；没有启用的主题保持原行为。eyes-and-ears 已启用，因此共享保留矩形避让；未新增大小下限或改其内容。resize、卡片折叠、演示、尺度切换与自由相机交接沿用现有流程。
- 18 项通用取景单测（原 9 + 新 9）与四个真实满月拍的独立投影回算覆盖地球半径、月地入画、太阳压字回归、近眼平面与无解回退。极端无解时优先安全候选，完全无候选保持原镜头；不放大真尺度地球来伪装满足下限。
- 静态 gates：`pnpm check` 0 errors / 0 warnings（4 个既有 hints）；`pnpm validate` 85 topics、0 errors / 0 warnings；`pnpm test` 219 files / 5461 passed；`pnpm build` 173 pages 成功。验证与限制见 docs/44 §9.7。本轮不运行 shoot / e2e，也不打开或驱动浏览器/桌面；**F2 是实现与数学测试完成，浏览器状态仍待主会话确认**。主会话重点看 1024×768 的 04.3 / 05.3 / 07.3 / 07.5，同时回归 1280×720 / 1600×900、双语双主题、折叠/resize/尺度切换。

## Claude 复验 · 2026-11-02（HUD 自由区取景分支 claude/frame-space，浏览器）

Codex 的 1024 返工（上一节，`hudFrame.primary` + 最大空矩形 + 次体避让）原样并入，与默认 HUD 取景（docs/67 §9）同一套测量与 0.6 s 平滑重取景。

| 项 | 状态 | 所见 |
|---|---|---|
| F1 余项（BG.2、02.4 的 `earth-axis`） | **完成** | `pnpm shoot sun-earth-moon --beats`（1920×1080，en/paper）39/39 拍落位，**没有一拍报 no label**，BG.2 / 02.4 的地轴标签都在（BG.2 演示态锚点在轴端 1044, 108，标签不透明度 1）；39/39 拍链接与演示同场景。仍列出的只有章级提示（`a-turning-earth` 的 earth-axis / observer-marker 等，章镜头、HUD 态）：同一章单独打开等镜头停稳后三个标签都在（不透明度 0.935），是 shoot 章级检查的等待时长问题，不是锚点问题。 |
| F2 1024×768 满月拍 | **完成** | 04.3 / 05.3 / 07.3 / 07.5（en/paper，07.5 另看 zh/cinema）：地球在观察卡下方、LAYERS 左侧的空位里，直径约 35 px（上次约 14 px），明暗界线清楚；月球在地球右侧入画；太阳盘在画外，不再压左栏 PLATE（只有轨道辅助细线穿过左栏）。1180×820 同几拍地球更大，月球在观察卡左侧。观察卡收起（docs/67 阶段 1 自动收起）后自由区变大，会按 0.6 s 重新取景放大。 |


## Polish 2026-11-03 · topic-only review

Reviewed F1–F5 against the current implementation and the latest browser follow-ups above. Existing F1 anchors, F2 opt-in HUD framing/minimum Earth radius, F3 guide weight and F4 bilingual shadow note are retained. F5 04.5 has an additional lunar close-up, with a projected-size regression and the unchanged α=90° / synchrony=false snapshot. Earth/Moon dark fill is raised to the permitted 0.05. No shared framing or HUD code was changed.

Historical round-1 checkpoint: surfaces were prepared but not integrated. The completed round-2 integration and current exact browser acceptance checklist follow below; they supersede that ownership blocker.


## Polish 2026-11-03 — round 2 browser acceptance

**Implementation complete; browser acceptance pending.** Earth/Moon/Sun now use the local textured GLB and accepted `atlasSurface` / `_emission` mechanism. Offline CPU previews are `/tmp/atlas-sun-earth-moon/round-2/previews/`; they do not certify DOM layout, WebGL shader compilation or interaction. No browser/desktop was opened in this pass. Keep the following checks explicit; do not approve only the hero view.

1. **Load / materials / budget:** open the live topic in EN/ZH, paper/cinema, DPR 1/2. All three surfaces must load without a failure banner, console/WebGL error or external runtime request. Check the network response is the 1,420,292-byte `sun-earth-moon.glb`; frame triangles stay below 350k (CPU conservative bound 109,088). Check selection/hover and visibility fades retain texture colours and work on all three bodies.
2. **Earth, spin, Singapore and tilt:** 01.1–01.5, 02.1–02.5, 03.1–03.5. In close-up rotate a complete turn: Africa, Americas and SE Asia must be recognisable, clouds varied, no inverted poles/UV seam/polar spike/facets. At 1.3342° N the actual observer must sit over the fixed Singapore ring near the tip of the Malay Peninsula; changing latitude moves the observer along the same meridian while the fixed ring stays on Singapore. Changing spin rotates both surface and marker. Compare 02.2/02.3: geography follows the tilted Earth and inertial axes stay parallel. Toggle zero tilt in 02.5; no detachment of continents, equator or marker. The night hemisphere is neutral dark grey, never black or dark blue; the terminator remains clear.
3. **Moon, same face and far side:** 04.1–04.4 and the chapter's lunar-angle trial. Zoom near enough to identify the asymmetric near-side maria; follow a full synchronous orbit from Earth's direction: those maria stay on the Earth-facing side. Toggle synchrony off; geography rotates with the Moon and exposes a different face, independently of the orientation pin. 04.5 must show the enlarged sunlit far-side region and visible near-side pin/leader. Inspect full/quarter/near/far and night close-ups: real crater/ray pattern, no texture mirror/repetition, seam, cap spike, faceting or black night disc. Ordinary phases remain sunlight geometry; the deliberately coplanar full-Moon eclipse is unchanged.
4. **Sun:** inspect BG/hero, 04 and 06.5 in both themes and orbit the free camera. Sun stays gold and self-lit, with restrained granulation and limb darkening; no moving specular hotspot, studio shading, seam or washed-out paper-coloured disc. Scale switches and selection must not turn it into a lit matte sphere.
5. **F1 — exposed label anchors:** BG.2; 01.2 / 01.4 / 01.5; all 02.1–02.5, plus their chapter entries after cameras settle. Axis leader must point to the exposed axis end, plane leader to the normal end. Check EN/ZH and both themes; surface loading must not move these anchors back to body centres.
6. **F2 — narrow full-Moon framing:** 04.3 / 05.3 / 07.3 / 07.5 at **1024×768, 1180×820, 1280×720 and 1600×900**. Earth and Moon stay visible and readable, with Earth's schematic radius at least 24 CSS px where feasible; Sun avoids title and PLATE. Repeat after resize, card collapse/restore, reader collapse/restore, true/schematic scale switch, PRESENT exit and return from free camera. Also check 390×844 EN/ZH with the drawer. Do not accept a zoomed-out 14px Earth or a Moon hidden under the card.
7. **F3 / F4 / F5:** BG.2, all 01 and 02.1–02.5 retain fine 0.006-radius guides, readable normal/tilt arc. 05.3 / 05.4 retain the exact bilingual “too thin” note and true one-scale shadow strip; no enlarged cones. 01.5 Earth track leader lands on the actual track, 02.5 plane leader on its normal. 04.5 shows the lit far-side region and 06.5 Sun avoids title/PLATE, at tablet and desktop sizes in both themes/languages. Gavin's editorial choice about keeping the strip remains unchanged.
8. **Full teaching-state regression:** open all **39 beat direct links**, then replay pause/run, spin, inclination, synchrony, scale mode and chapter changes. Labels, observing/phase card, shadow diagram, values and restored visibility must agree with each authored beat. The new EN/ZH details for Earth, observer, Moon and pin must match the visible surfaces. X-RAY/CUTAWAY/EXPLODED remain disabled for this orbit topic.

No requested implementation item remains unfinished. The checks above require the downstream browser acceptance explicitly reserved by the task; GPU performance remains unmeasured. See [REBUILD-3D.md](REBUILD-3D.md#polish-2026-11-03--round-2-completed-integration) for reproduction, sources, counts and gate logs.

## F4 · Polish 2026-11-03 — editorial decision and ownership fallback

Gavin's delegated decision is settled: retain the true-one-scale fact as a short note, and replace the near-empty strip with **“示意，未按比例 / Schematic, not to scale”** eclipse geometry. This supersedes the historical F4 retain-the-strip decisions and round-2 checklist item 7 above.

**Prepared, not installed:** the only data hook today is `panel.shadowNote`. `OrbitCard.Shadow` owns the drawing, and the strict orbit schema rejects an additional drawing option. Topic data cannot replace that SVG. Per this task's explicit shared-panel fallback, [shadow-strip-schematic.patch](shadow-strip-schematic.patch) supplies the complete implementation without modifying a shared engine file in this worktree. Apply from the repository root in the engine owner's branch; `git apply --check src/content/topics/sun-earth-moon/shadow-strip-schematic.patch` passes. The live strip remains unchanged until that patch is applied.

The patch adds a default-preserving `panel.shadowDiagram` choice and opts in only sun-earth-moon. Two finite-source drawings show Sun–Moon–Earth and Sun–Earth–Moon. Total/partial solar observer points share one Earth; total/partial lunar discs are explicitly **alternative positions of one Moon**. Exact common tangents of the depicted circles generate converging umbrae and diverging penumbrae. The lunar umbra tip is just inside the Earth's near surface in the solar drawing. Beat 05.3 displays the lunar comparison; 05.4 displays the solar comparison. Only the relevant diagram is shown, keeping the strip compact. The card states that current computed observations are above; it does not pretend the comparison cases are simultaneous snapshots. Physical controls, eclipse classifications and the apparent-disc/phase observations are unchanged. Chapter 05's two affected explanatory sentences are minimally corrected in **EN and ZH inside the patch**, because those sentences currently claim the drawing uses true scale.

Review the token-only SVGs in paper/cinema and EN/ZH at `/tmp/atlas-group-b/sun-earth-moon/contact-sheet.png`, with native-card and 3× close-ups alongside. These are exact React SVG CPU rasters, not browser screenshots or a claim that the patch is live. Analytic tests cover tangency, cone convergence/divergence, solar umbra reach, whole/partial lunar intersection, both language labels and patch applicability. Browser layout acceptance follows patch installation; no browser or desktop was opened.
