# 67 · HUD 让出舞台：操作说明、全面板折叠、全尺寸自适应

Gavin 2026-10-31 / 11-01 定。所有引擎（SpaceScene、TimeScene、MathScene），paper / cinema，EN / ZH；网站和 iPad App（Capacitor）是同一份构建，鼠标、触控板、触屏、键盘都要能用。施工前读 docs/08 §2（HUD 铁律、现有折叠规则）、§3（交互契约）、docs/02（iPad / Capacitor 约束）、docs/06（引擎契约）。

## 0. 起因

- 鼠标用户不知道 3D 模型能平移（右键拖或 Shift / ⌘ / Ctrl + 左键拖；滚轮缩放；触屏双指平移 / 缩放），页面上没有任何操作说明。
- 图例、左列等面板大多不能折叠，小屏上尤其要紧。
- Gavin 在 11 寸 iPad 上觉得界面挡视线。实测 1180×820：左列（标题、元数据、章节列表、PLATE）约占宽度 20%，阅读面板约 35%，ww2 的右上参与卡 + LAYERS 面板压在地图中间。**不只是 11 寸，所有尺寸都要适配**；11 寸只是 Gavin 的体验样本。

## 1. 要覆盖的尺寸（CSS px）

| 设备 | 横屏 | 竖屏 |
|---|---|---|
| iPad mini | 1133×744 | 744×1133 |
| iPad 11" | 1180×820（Air 1194×834） | 820×1180 |
| iPad 12.9" / 13" | 1366×1024 | 1024×1366 |
| iPad 分屏 / 台前调度 | 任意宽度 | — |
| 笔记本 | 1280×800 · 1440×900 · 1512×982 | — |
| 桌面 | 1920×1080 及以上 | — |
| 手机 | — | 390×844 |

Safari 的地址栏和标签栏会吃掉 70–100 px 高度，比 App 更挤；两种都要测。

## 2. 规则（定稿）

1. **舞台保底，按实际空间而不是设备型号决定**：舞台的可用区域（左列或其页签与阅读面板或其竖条之间，顶栏以下，章节轴以上）宽 ≥ 视口宽的 50%，高 ≥ 视口高的 60%。默认布局不够时，按这个顺序自动收起，直到满足：
   1. 图例收成一行标题；
   2. 右上卡收成竖页签；
   3. 左列只留章节列表（标题块的元数据先藏起来）；
   4. 左列整列收成竖页签；
   5. 阅读面板变窄（最窄 340 px，正文字号不低于现在的下限）。
   - 横屏时阅读面板**从不自动收起**（课本正文最重要），只能读者手动收起。
2. **竖屏用底部抽屉**：只要视口是竖的（高 > 宽）且宽 < 约 1100 px，就用手机式布局（舞台在上，阅读面板是底部抽屉），包括 12.9" 竖屏 1024×1366。宽 < 1024 的现有抽屉行为不变。
3. **读者手动设置的优先**：某个面板读者手动开或关过，自动规则就不再改它（按标签页存，sessionStorage，不进 URL，换章保持）。
4. **实时重算**：旋转、分屏、台前调度拖动窗口、浏览器缩放都会触发重新计算；镜头和地图按新的可用区域平滑重新取景（扩展现有的侧栏宽度测量和 `fitExerciseCamera` 机制，不另起一套）。
5. **每个收起的面板都必须有清晰、好操作的重新打开入口**（Gavin 11-01：「自动收起只是个开关，panel 要有打开的能力，而且是清晰、易操作的打开能力」）：
   - 收起后留下一个始终可见的页签：写着面板名称（左列写主题短名，右上卡写卡名，图例写「图例 / KEY」），带朝向展开方向的 chevron；不是只剩一条发丝线、一个无字小点或一个只在 hover 时出现的东西。
   - 命中区 ≥ 44×44 px，触屏、鼠标、触控板一次点击就能打开；键盘可以 Tab 到、Enter / Space 打开，`aria-expanded` 正确。
   - 在 iPhone（底部抽屉）、iPad（触屏 + 妙控键盘 / 触控板指针）、Mac（鼠标和触控板）上都要实测：页签不被安全区、Safari 工具栏、Home 指示条或系统手势区遮挡，不和章节轴、顶栏抢位置。
   - 「只看舞台」开关：一键收起所有面板，再按一次恢复之前的状态；收起状态下每个面板的页签照样都在，可以单独打开。
6. **HUD 在触屏上不能太小**：现在的 `--k = clamp(min(W/1920, H/1080), .6, 1.6)` 在 11" 上只有约 0.61。`(pointer: coarse)` 时加一个下限，保证按钮 ≥ 44 px、HUD 文字可读。

## 3. 操作说明（右上角）

- 顶栏右组（外观、语言旁边）一个 `?` 按钮，≥ 44 px，`aria-expanded`；键 `?`（Shift + /）切换，ESC 关闭；按钮和键用同一个 store 字段。
- 打开后是右上角的一张 hairline 小卡（技术图版皮肤，只用 token，paper + cinema）：按当前引擎列出鼠标、触控板、触屏的**真实**手势（旋转、平移、缩放、选中、回到这一拍的视角 = 点拍或预设），再列这个引擎实际注册的快捷键（从引擎的键位注册表生成，不手抄）。`(pointer: coarse)` 时触屏行在前，否则鼠标 / 触控板在前；键盘行保留（iPad 也会接键盘）。TimeScene 的地图手势以舞台代码为准；不写不存在的手势。
- 每台设备第一次打开时自动弹一次（localStorage `atlas:guide-seen`，读写包 try/catch；无痕模式就不自动弹）；点关闭或在舞台上操作就收起。演示模式、`pnpm shoot` 截图和 e2e 里不自动弹。
- 文案进 src/i18n 的 ui.en.json / ui.zh.json；中文给 P4–P6 小学生读。

## 4. 全面板折叠

- **左列**：标题块（主题名、年代、元数据行、可视化说明）、章节列表、PLATE 块一起收成舞台左缘的竖页签（参照右上卡的 `.atlas-card__tab` 和阅读面板竖条的做法）。另有中间档：只藏元数据，留标题和章节列表。
- **每个图例 / KEY 块**（TimeScene 地图图例、dated-layer plate、`geology-plate`、`reconstruction-age`、`equation`、SpaceScene 语义色 KEY、模拟读数卡、MathScene 的 key；grep `data-hud-panel` 与 legend / key 组件找全）：标题行加折叠 chevron，收起后只剩一行标题。LAYERS / TOOLS 面板保留关闭钮，并加同样的收成标题行。
- 状态进 HUD store（每类一个字段，不按主题），sessionStorage 按标签页存，不进 URL；通过 `__atlas.state()` 和 setter 暴露给测试。
- 引线标注、地图标牌把收起后的页签当障碍，丢掉已收起的块（和现在的右上卡页签一样）。

## 5. 文档

更新 docs/08 §2（左列页签、图例折叠、只看舞台、操作说明、舞台保底和自动收起顺序、竖屏抽屉、触屏最小缩放、重新打开入口的硬要求）和 §3（`?` 键、只看舞台键）；store 字段或测试 API 变了就同步 docs/06。

## 6. 验收

- 单元测试：store 字段与持久化、自动收起顺序（给定视口算出哪几块收起）、读者手动设置优先。
- e2e：新建 `tests-e2e/hud-room.spec.ts`，用 aircon（SpaceScene）、ww2（TimeScene）、fractions 或 MathScene 样例三个主题：
  - 操作说明：按钮、键和 ESC 都能开关；列出的是这个引擎的手势；首次自动弹出，第二次不弹。
  - 左列、右上卡、图例各自能收起和打开，换章后保持；只看舞台来回切一次，状态恢复。
  - 在 §1 每个尺寸上：舞台可用区域满足 §2-1；每个收起的面板都有可见的页签，命中区 ≥ 44 px，一次点击能打开；没有重叠（用现有的重叠检查工具）。
  - 1920×1080 默认布局和现在一样；820×1180、1024×1366 竖屏是抽屉；390×844 和现在一样。
  - 不放松任何已有的重叠或计数断言。
- 门槛：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`；`pnpm shoot <topic> --layout --keys` 在 §1 的尺寸各看一遍截图（两套主题，两种语言）。
- 上线后重新打 iPad TestFlight 包。

## 7. 代码地图（2026-11-01 摸底，行号是当时的 main）

- **布局宿主** `src/engines/core/SceneHost.tsx`（JSX 约 485–600）：`.atlas-scene`（带 `data-reader / data-panels / data-card / data-hud`）→ `.atlas-hud__left`（`TitleBlock` Hud.tsx:292 `title`、`ChapterRail` widgets/ChapterRail.tsx:31 `rail`、引擎 `plate` 槽）、`.atlas-hud__right`（`CardFrame` Hud.tsx:377 `card` / `card-tab`、`stageOverlay` 槽）、`.atlas-hud__dock`（perf、`BottomPanels`、`bottomBar` = ChapterAxis）、`aside.atlas-reader`（`.atlas-reader__handle` / `__strip`）。顶栏 `TopBar` Hud.tsx:108，右组是 `GlobalToggles`（widgets/GlobalToggles.tsx）。
- **缩放与断点**：`hudScale()` SceneHost.tsx:97（≤ 759 为 1，否则 clamp(min(W/1920,H/1080), .6, 1.6)，还没有 coarse 下限），`scaleStyle` 约 360 行（`--k`、`--kt` 下限 .8、`--kb`）；SceneHost.tsx:444 `matchMedia('(min-width: 1024px)')`。CSS 全在 `src/styles/scene.css`：1024 断点 :38 / :1269 / :1388，手机 :1428 等，VIEW 折行 :501，HUD 网格 :582（300u / 1fr / max(330u,240px)），卡片页签 :785–895。
- **HUD store** `src/engines/core/controls.ts:229–280`（`reader / panelsOpen / cardOpen / hud / labels`），setter 约 393–448；持久化 `src/lib/prefs.ts:89–165`（sessionStorage 'open' / 'collapsed'），SceneHost.tsx:299–330 读入并回写；测试 API `src/engines/core/test-api.ts:187–205`（`state()` 有 reader / panels / card；setter 有 setHud / setPanels / setCard，没有 setReader）。PLATE 块现在用局部 `useState` + `setPlateExpanded` 折叠，不在 store 里：统一进 store。
- **键位**：唯一监听 `src/engines/core/keys.ts`；l.38 `if (e.shiftKey) return;`，所以 `?` 要在这行之前处理。注册表 `buildKeymap` controls.ts:353–376（只有 key/type/name，标签从 `controls.modes.items[].label`、`controls.commands[].label`、`presets.items` 取），`RESERVED_KEYS` 约 300 行，`__atlas.keymap()`。三个引擎都空着的键：`?`、`/`、`\`、`V`、`Z`。**只看舞台用 `Z`**。
- **图例 / KEY / 读数块**：`overlay` = `ControlPanel`（widgets/ControlPanel.tsx:113，内含 `Legend` widgets/Legend.tsx，无折叠、无 data-hud-panel）。TimeScene：View.tsx:909、GeographyView.tsx:658、ClimatologyView.tsx:442 是原生 `<details>`（`overlayOpen` 局部状态）；`plate` DatedLayerPlate.tsx:34；`geology-plate` ModernInset.tsx:226；`reconstruction-age` ModernInset.tsx:200（无折叠）；`modern-inset` ModernInset.tsx:88。SpaceScene：`plate` hud/PlateBlock.tsx:318；`stageOverlay` = explorer/ExplorerOverlay.tsx:60–90（ControlPanel + 分组 / 流 / 力 / 能量色 legend，无折叠）；模拟读数卡（KeyCard、OrbitCard、MicroscopeCard、FoodWebCard、CycleCard、CircuitCard、EnergyCard）在 `card` 槽，已随 CardFrame 折叠。MathScene：`equation` View.tsx:573；`plate` hud/PlateBlock.tsx:39；overlay hud/Overlay.tsx:38（只有 compact 时有 `ms-overlay__toggle`）；`task` tray/Tray.tsx:86；`net-tools` tray/NetControls.tsx:55。
- **取景**：SpaceScene `Model3DStage.tsx:117–154` 量所有可见 `[data-hud-panel]` 写 `bridge.freeStage`（`lib/hud-framing.ts:10 freeStageRect`；侧栏只在舞台宽高比 ≥ 0.8 时计入），但 `CameraRig.tsx:149–160 fitHud` 只在数据里有 `views.hudFrame` 时才用；`fitExerciseCamera`（lib/camera.ts:339）不看侧栏。**按侧栏取景是新功能**：把 `freeStage` 变成所有主题的默认，并接进章节 / 拍 / 预设镜头；读者拖过（`user.current.active`）就不再自动重取景。TimeScene `stages/geo/controller.ts fitCamera()` l.1387 用 min(w,h) 的 18% 均匀留白、初始 padding 48（l.220），不看面板：改成按面板的不对称 padding（MapLibre `padding` 选项）。MathScene `stage/layout.ts:50–110` 已按 `.atlas-hud__left/right [data-hud-panel]` 与 `card-tab` 让位：新的左列页签要放进 `.atlas-hud__left` 或被这个选择器匹配到。
- **引线 / 标牌**：`time-scene/stages/geo/leaders.ts:274` 与 space `hud/LeaderLabels.tsx:236` 都会自动避开可见的 `[data-hud-panel]`；新页签带 `data-hud-panel` 即可，收起的内容要 `display:none`；LeaderLabels 的依赖（l.259）要加新 store 字段。
- **真实手势（写进操作说明）**：SpaceScene OrbitControls（CameraRig.tsx:513–545，pan 默认开）：左键拖旋转；右键拖或 Shift / ⌘ / Ctrl + 左键拖平移；滚轮 / 触控板双指缩放；触屏单指旋转、双指缩放 + 平移。TimeScene MapLibre（controller.ts:210–234，禁了旋转和俯仰）：左键 / 单指拖平移；滚轮 / 捏合缩放；双击放大；Shift + 拖框选放大；方向键和 +/− 只在地图获得焦点时有效（现在点完会 blur，所以不要写进说明）。MathScene 是 SVG，无镜头；NumberLine / DecimalLine 有自己的缩放，写之前先读 `stage/NumberLine.tsx`。
- **首次弹出的抑制**：代码里还没有任何首次弹出的 UI，也没有测试模式标志。shoot 在 `scripts/shoot.ts:215` 的 `context.addInitScript` 里种 `localStorage['atlas:guide-seen']`；e2e 用共享 fixture 或 `page.addInitScript` 种同一个键（专门测首次弹出的用例除外）。
- **shoot**：`--size WxH` 支持任意尺寸（shoot.ts:141–145），但没有 `hasTouch` / `isMobile`，模拟不出 `(pointer: coarse)`：加一个 `--touch` 参数。
- **e2e**：`tests-e2e/hud-layout.ts` 的 `LAYOUT_SIZES`（3840×2160 … 390×844）和 `hudLayoutIssues`（在屏内、不重叠、不横向溢出；**没有**舞台占比和命中区检查：要加）。会受新默认值影响的断言：`hud.spec.ts:128–183`（阅读面板竖条）、:1302（panels）、:1359–1442（1440×900 / 1600×1000 时卡片默认展开）、:1148（顶栏单行顺序，`?` 不能把它挤乱）、约 40–46 行（overlay 必须保留所有模式按钮）、约 55 行（keymap 驱动的键测试）；Playwright 默认视口 1280×800，`how-planes-fly.spec.ts:199` 与 `sample-airfoil.spec.ts:70` 用 1024×768。只改因新默认值而必须改的断言，并在提交说明里逐条列出。

## 8. 施工安排（周一 Gavin trigger 后，Claude 子代理；Codex 额度要到 11-04）

- **阶段 1（Opus，一个代理，core）**：store 字段 + prefs + test API（含 PLATE 统一进 store、`setReader`）；自动收起求解器（纯函数：视口 + 各块测得尺寸 + 读者手动设置 → 哪些收起，单元测试覆盖 §1 全部尺寸）；左列页签与元数据中间档；页签的统一外观和 44 px 命中区；`?` 操作说明（键位从注册表生成，手势按 §7）；只看舞台（`Z`）；coarse 下的 `--k` 下限；竖屏抽屉断点；shoot `--touch`；e2e 种子 fixture；`hudLayoutIssues` 加舞台占比和命中区检查；docs/08 §2 §3、docs/06。文件归属：`src/engines/core/**`、`src/engines/widgets/**`、`src/lib/prefs.ts`、`src/styles/scene.css`、`src/i18n/ui.*.json`、`scripts/shoot.ts`、`tests-e2e/hud-layout.ts`、新的 `tests-e2e/hud-room.spec.ts`。
- **阶段 2（并行两个 Opus 代理，阶段 1 合进分支后）**：A = TimeScene（三个 overlay `<details>` 并进 store 折叠、DatedLayerPlate / ModernInset 各块、地图按面板的不对称 padding 重取景），归属 `src/engines/time-scene/**`；B = SpaceScene + MathScene（ExplorerOverlay 与 legend 折叠、`freeStage` 取景对所有主题默认开、MathScene overlay / equation / task 折叠），归属 `src/engines/space-scene/**`、`src/engines/math-scene/**`。两边都不碰 core；需要 core 改动就报给主会话。
- **阶段 3（Sonnet，验收）**：`pnpm shoot aircon,ww2,fractions --layout --keys` 在 §1 每个尺寸（加 `--touch` 版的 iPad 尺寸）× paper / cinema × en / zh，省 token 规则照旧（缩图、限张数）；全量 e2e（机器空闲时）；结论写进本文 §9。
- 主会话：brief、合并、`pnpm run deploy`、push、打 TestFlight 归档（Gavin 在 Organizer 上传）。

## 9. 施工与验收记录

- 2026-11-02 · Codex / TimeScene phase 2（仅折叠）：三个 View 的 `overlay`、`plate`（DatedLayerPlate）、`geography-plate`、`climatology-plate`、`geology-plate`、`reconstruction-age`、`modern-inset`、`present-evidence` 接宿主 `legendsOpen` / `plateOpen` 和 `FoldHeader`；保留关闭钮，收起正文 `display:none`，读者内嵌现代小图仍是正文。新增 11 个接线单测及键盘 / 持久化 / stage-only e2e 用例，旧内容测试显式打开所测控件。CSS 仅在 TimeScene 自有文件；未改 core 或地图取景。`pnpm check`、`pnpm validate`、`pnpm test`（236 files / 6,139 tests）、`pnpm build` 全绿；按 brief 不运行浏览器验收。core 后续需将私有图例 / context 控件的完整正文高度纳入 `useHudRoom` 的 legends 测量（当前只量共享 rows / ul）。
- 2026-11-02 · Codex · SpaceScene + MathScene，phase 2 仅折叠：`space-overlay`（LAYERS / TOOLS、分组 / 流 / 力 / 储能 KEY、拆开滑块）、`math-overlay`（含窄屏入口）、两引擎 `plate`、Math `equation` / `task` / `net-tools` 接共享 store 与 FoldHeader；收起只留具名 ≥44px 标题，正文 `hidden`，不再占标注避让空间。模拟读数继续由 `card` / `card-tab` 的 CardFrame 接求解器；补 Space 引线与 Math 排版的折叠状态依赖。演示里的题目与算式保留原有可用行为。CSS 只改各引擎自己的文件，未改取景或 core。
  - 新增 24 个 EN / ZH 单测，覆盖实际力 / 能量 KEY、PLATE、窄屏 tools、算式 / 题目 / 展开图工具、手动展开优先与只看舞台恢复、CardFrame；新增 engine folds e2e，更新旧 PLATE / 窄屏入口断言。原数学行为测试显式展开图例；默认布局测试仍走自动状态，没有放松重叠 / 计数断言。
  - 门槛：`pnpm check` 通过（0 errors / 0 warnings，4 个既有 hints）；`pnpm validate` 通过（94 topics，0 errors / 0 warnings）；`pnpm test` 通过（236 files / 6152 tests）；`pnpm build` 通过（191 pages）。本任务依 brief 不跑浏览器 / 截图门槛，由主会话验收。现有 core API 足够，无新增接口请求；TimeScene 完成迁移后可统一清理 PLATE 兼容适配器。
- 2026-11-02 · Claude（Opus）· phase 2 引擎折叠验收（claude/hud-int，浏览器无头实测）：ww2、dinosaur-earth、monsoon-and-weather、aircon、solar-system、fractions 在 1180×820（触屏）、1920×1080、390×844 逐块点收起 / 点开、换章保持、`Z` 只看舞台收起并原样恢复，全部通过；ww2、aircon、fractions 另跑 cinema / zh。收起后每块都是带名称、≥ 44 px、chevron 朝向对的一行标题；引线和地图标牌不再被收起的块推开；两套主题都清楚。`pnpm shoot --layout --keys`：ww2（en/paper、zh/cinema）与 aircon（en/paper）除 390×844 外 19 个尺寸 0 issue（390×844 的舞台占比是 core，见下）。
  - 修正：① TimeScene 图层卡：外层「图层与图例」是唯一的折叠（收起时一个页签，保留 ×）；卡里共享 ControlPanel 的 LAYERS / TOOLS / KEY 折叠钮改成纯小标题（无 chevron、不接指针），不再有四个按钮做同一件事；MathScene 窄屏「工具与图例」同样处理。hud-room.spec 的 KEY 步骤改为点图层卡里可见的折叠控件（TimeScene 收起后只剩外层页签）。② SpaceScene `.space-overlay` 与 MathScene 图层卡去掉自己的 `data-hud-panel`：它们在宿主 `overlay` 槽里滚动，自身矩形越出视口（aircon 1920×1080 等每尺寸 36 个 layout issue），Math 的第二个块还被排版当成右侧障碍，把手机上的模型挤没；遮挡、求解器、引线仍按 `overlay` 槽。③ Math 小测托盘（task）恢复为不折叠：它是课的内容，phase 2 让求解器在 1280×800、iPad 横屏把题目默认收成「YOUR TASK」标题。④ Math 算式收起后是居中短标签，不再是横贯舞台的整条；算式块按句子整体淡入（与 phase 1 相同）。⑤ dinosaur-earth 现代小图收起时，卡片去掉 190u 最小高度，不再留空框。
  - 测试改动（只改因上面修正或 phase 2 默认折叠而必须改的）：hud-engine-folds（`.space-overlay` 选择器；小测托盘改为「不折叠」用例）、hud-engine-folds 单测（同上，另加 solver / 只看舞台都不收起小测）、hud-room（KEY 步骤点可见折叠控件）、measuring / nets-and-solids 手机用例与 telling-time 拖针用例（`open()` 为算式测试展开了图例，这三例改回该尺寸的默认收起，否则窄屏「工具与图例」面板盖住舞台）、plates-and-hazards / sample-deep-time（点图层行之前先打开被求解器收起的图层卡）。没有放松任何重叠或计数断言。
  - 门槛：`pnpm check` 0 errors / 0 warnings（4 个既有 hints）；`pnpm validate` 94 topics 0 / 0；`pnpm test` 237 files / 6,165 tests；`pnpm build` 191 pages。e2e（机器 load ≈ 140，CI=1、2 workers，预种 `atlas:guide-seen`）：phase 2 相关 spec 与 fractions、nets、measuring、telling-time、area-perimeter、decimals、multiplication-division、sample-lesson-*、time-scene-folds、hud-engine-folds、hud-room、dated-layers、sample-climate、dinosaur-earth、monsoon、plates-and-hazards、how-planes-fly、solar-system、hud、smoke 跑完；剩下的失败都在 phase 1 基线（`git archive 352b25e` 单独构建）上同样失败或是负载超时（dinosaur 全 beat、how-planes-fly 载入），清单见下。
  - 留给 core（phase 1）：e2e 里大多数 spec 不种 `atlas:guide-seen`，操作说明首次自动弹出挡住点击（本轮用 storageState 预种验收）；390×844 的舞台占比在 TimeScene / SpaceScene 不达 60%（ww2、dinosaur、aircon，hud-room「ww2 default room at 390×844」同样失败）；hud-room「aircon manual folds」里卡片页签被阅读面板竖条挡住点击；1920×1080 下 aircon / monsoon 左列内容压到章节轴下、aircon 图层卡需要滚动（求解器量的是被裁过的列高）；fractions 1133×744 / 1024×768 / 1280×720 最高的题在阅读面板里越出视口，测量类 / 展开图手机上模型只剩几十 px（measuring、sample-lesson-measure / -net 手机用例，基线同样失败）；hud-room 三个「guide button」用例、hud.spec「collapsed reader strip」「sample-time chapter chips」「sample-space camera」、sample-climate「failed resource」、dinosaur「66/70」（来源按钮互相遮挡）、how-planes-fly「actual-topic curve」在基线上同样失败。
### 9.1 阶段 1 浏览器验收（Claude，2026-11-02，分支 codex/hud-p1）

Codex 的阶段 1（352b25e）没有跑过任何浏览器门槛。这一轮在无头 Chromium（软件 GL）里实测，机器负载 50–200（多个工作树并行），所以时间敏感的失败都单独重跑过。

**看了什么**
- `pnpm shoot aircon|ww2|fractions --layout`：paper / EN 在 1280×800、1440×900、1920×1080、390×844（`--keys` 同跑），`--touch` 在 1133×744、1180×820、1180×740（Safari 工具栏）、1366×1024、1024×1366、820×1180；cinema / ZH `--touch` 在 1180×820、390×844。另用脚本在同样尺寸量了 `room.steps`、舞台主带、每个页签的位置与命中（`elementFromPoint`），并截了操作说明（三个引擎、两套主题）。
- 交互（1180×820 触屏，三个主题，51 项全过）：左列页签点开 / 「收起」收回；右上卡收起 / 页签点开；阅读栏收成竖条、窗口改到 1366×1024 和换章后仍收着、竖条点开；Z 收起全部（各页签仍在）再按 Z 恢复；1180×820 ↔ 820×1180 来回旋转，抽屉与求解结果都重算。

**数字（修完后）**
- 1180×820 触屏：顺序 legends → card → metadata → left，舞台主带 688×643（要 ≥ 590×492），阅读栏 400 px 不动；1133×744、1366×1024、1280×800 同一顺序。1440×900、1920×1080：不收任何块，和原来一样。
- 竖屏 820×1180、1024×1366：抽屉；收图例和右上卡，左列保留（主带 428 / 632 px 宽，要 ≥ 410 / 512）。手机 390×844：只收卡和图例（卡现在留页签），标题 + 章节方块行照旧。
- 触屏 `--k` = 1；所有页签 ≥ 44×44，带名称和朝展开方向的 chevron；顶栏 1920 高 57 px（修前 79）、触屏两行 107 px。
- 重拍出过问题的尺寸后，`shoot --layout` 全部 OK（0 个重叠 / 越界 / 舞台占比问题）；`--keys` 0 失败（aircon 一次 H 的恢复芯片超时是负载，重跑通过）。

**修了什么**
- 共享 `.atlas-fold` 的基础样式降到零特异度（`:where`）：原来它盖掉了阅读栏竖条的 `display:none`，阅读栏展开时左缘一直多出一条 44 px 竖条（所有尺寸、手机抽屉里也有），右上卡页签和竖条的排版也被它改坏（hud.spec 的竖条居中、卡页签贴边两条失败即此）。
- 顶栏 Z / ? 改成与 LOOK / 语言同高的按钮，命中区仍 44×44（`::after`），按下时实心；顶栏不再被撑高。
- 左列收起控件从无字的「⋯」「‹」方块改成「资料 ⌃ / ‹ 收起」（DETAILS / FOLD）。
- `?` 也认 Shift 按住时报 `/` 的事件（Playwright 与部分键盘布局），原来 Shift+/ 三个用例全失败。
- 求解器：抽屉布局里右上卡 + 图例是舞台右界（原来竖屏 820×1180 什么都不收，ww2 的卡和 LAYERS 盖住地图中间，实测空矩形只有 134 px 宽）；抽屉布局的高度占比按抽屉以上的页面算；手机不自动收左列（它是标题 + 章节方块行，不是侧栏；原来手机上被收成页签，hud.spec 的手机章节方块行用例失败），手机仍不显示 PLATE。
- 求解器的尺寸改为量两列里所有可见的最外层 `[data-hud-panel]`（引擎私有图例 / 读数 / overlay 也算，按自然高度），阶段 2 的引擎块接上折叠后自动进入保底计算。
- 自动化浏览器（`navigator.webdriver`）里操作说明不自动弹，只有预种 `atlas:guide-first-run-test` 的首次弹出用例例外；e2e 与 shoot 的 seed 保留。
- 右上卡页签改为淡入（原来从右侧滑入，滑动中压在阅读栏上、被量成 26 px 宽）；测量除下一帧外加 100 ms 兜底（慢帧的 WebGL 舞台下也及时重算）；`room.viewport` 记求解时的视口，`shoot --layout` 等它对上再检查；新增 `shoot --layout-sizes`。
- hud.spec 的布局用例尺寸从 7 个变成 19 个，超时按尺寸数放宽（没有放松任何断言）。

**门槛**：`pnpm check` 0 错误 0 警告；`pnpm validate` 94 个主题 0 错误；`pnpm test` 235 个文件 / 6131 条全过；`pnpm build` 通过；`shoot aircon --keys` 0 失败。e2e（hud-room + hud + smoke，80 条，2 workers，负载约 100）：75 过 / 5 失败；5 条单独重跑：3 条通过（时间轴播放头、章节芯片、阅读栏竖条——竖条那条是真问题，网格轨道没居中，已修），另 2 条（hud.spec「sample-space organisms」点侧别芯片、「sample-space camera」按 H 后的封面镜头）在 main（b4a1e2e）同一负载下也在同一行失败，是负载敏感的旧问题，不是本阶段回归。hud-room.spec 全过。修前基线是 67 过 / 13 失败。

**留给阶段 2 / Gavin 的**
- 阶段 2-A（TimeScene）：参与卡下面的 overlay `<details>` 展开时，右上角 × 压在 LAYERS 折叠标题的 chevron 上（ww2 所有尺寸）；三个 `<details>` 并进 `legendsOpen` 时一起处理。地图还没按面板重新取景。
- 阶段 2-B：fractions 的 TOOLS AND KEY 还是 MathScene 自己的开关；SpaceScene 取景还没用 `freeStage`。
- 设计取舍（请 Gavin 定）：①图例 / LAYERS / TOOLS / KEY 共用一个 `legendsOpen`，点任意一个标题会一起开合；②横屏的保底只算左列和阅读栏，1440×900 笔记本上 ww2 的参与卡 + LAYERS 仍盖住地图右侧约三分之一（和改动前一样）；③1280×800 笔记本现在默认收起左列和右上卡（按 §2-1 算出来的，舞台 592 px < 640 px）；④手机上右上卡现在是一个可点开的竖页签（以前手机上完全隐藏）。
- 其他主题的 e2e 还没全量跑：默认视口 1280×800 现在会自动收起图例和卡，点 LAYERS 行或读卡片内容的旧用例可能需要先展开（阶段 3 全量跑时处理）。

### 9.2 TimeScene 取景（claude/frame-ts，2026-11-02）

- **改了什么**：Codex 10-29 的 opt-in 草稿（只移中心、只开 sample-time）移植后改成所有 TimeScene 地图默认按自由舞台矩形取景（`time-scene/lib/hud-framing.ts`，细则 docs/06「HUD 自由区取景（TimeScene）」）：MapLibre 不对称 padding 把作者中心放到自由区中心；自由区小于 1920×1080 默认布局的 810×919 时 zoom 减 `log2(自由区/810×919)`（最多 −1.5，只缩不放）；WHOLE AREA / 全图按自由区拟合（8% 边距），不再是画布 18% 均匀留白。store / URL 里的 zoom 仍是作者单位。
- **怎么触发重新取景**：舞台 ResizeObserver、每个 `data-hud-panel` 的 ResizeObserver、HUD 块增删（MutationObserver）、`.atlas-scene` 属性、`transitionend`、字体就绪、`moveend`，120 ms 合并后量一次；没动过地图就 0.6 s `easeTo` 到新自由区（飞行中改目标），读者拖 / 滚过就画面不动只换 padding，直到下一章 / 拍 / 预设。
- **实测**（ww2，今天的默认布局）：1920×1080 自由区 340..1150 × 12..931，zoom 不变，主体比原来上移约 40 px、左移约 15 px（底部章节轴比顶边高）；ww1 自由区矮一点（873 高），zoom −0.07。1180×820 自由区只有 274..482（**208 px 宽**：右侧参与卡 + LAYERS 面板占 264 px），1133×744 只有 161 px，1366×1024 394 px，三者都碰到 −1.5 的上限或接近（1366：−1.04）。1180×820 收起阅读面板后自由区 274..854，zoom −0.53，0.6 s 重新取景到位；读者拖过地图再收起，画面原地不动。区域图版（sample-region）的 `maxBounds` 仍把 zoom 夹在整张图版铺满舞台（5.0），不缩小。
- **留给第二期**：iPad 横屏的自由区太窄是布局问题（§2.1 自动收起图例 / 右上卡后自由区才会 ≥ 50%），取景已按实时测量响应，Codex 的收起逻辑落地后无需再改；届时可以复看 −1.5 上限是否还需要。SpaceScene 的 `water` 不是 TimeScene 主题，不在本项回归里。

### 9.3 SpaceScene 舞台按 HUD 自由区取景（Claude，2026-11-02，分支 claude/frame-space）

先于阶段 1 做的取景部分（§2-4、§7「取景」），只动 `src/engines/space-scene/**`，不碰 core；阶段 1 的面板开合、自动收起落地后，这里按实测的可见块自动跟随。

- **做法**：作者镜头本来就是按 1920×1080 带 HUD 的舞台构图的（舞台 1520×1023，自由区 340–1150 × 12–951 px，34 个 SpaceScene 主题实测一致，`DESIGN_FREE`）。现在所有主题默认把这块「设计自由区」映射进当前 HUD 块之间**最大的空矩形**（`lib/hud-framing.ts stageFraming`，用 `freeRects` 枚举，卡片下方等空位也算；差 6 % 以内取平移最小的，面板高度变几个像素不会跳位）：先沿视线后拉（不比原来只按宽高比后拉的镜头更近），再用投影 view offset 平移，所以轨道中心仍在主体上，ORBIT 和拖拽绕自由区中间转。章、拍、预设、REFERENCE、动作模式镜头都走这里；演示、封面、HUD 叠放（视口宽 < 1024 或竖屏）不变。`views.hudFrame` 主题（cells、eyes-and-ears、sun-earth-moon、sound、coral-reef）仍按点名主体取景，不叠加；它对这几个主题并不多余（点名主体比整块设计自由区更准），对其余主题不需要。
- **重取景**：Model3DStage 量所有可见 `data-hud-panel`（ResizeObserver、MutationObserver、`transitionend`、字体、演示/封面；变化后 120 ms 节流再量，不放在下一帧里量，免得在回应交互的那一帧里强制排版；只有块真的变了才递增 `bridge.hudLayout`），CameraRig 见到块或舞台尺寸变化就 0.6 s easeInOut 重取景；读者拖过镜头后不动，直到下一章 / 拍 / 预设；ORBIT 中只改平移。写回 URL 与 REFERENCE / 演示保存的镜头先撤掉取景后拉（顺带修了 REFERENCE 退出时窄舞台上再后拉一次的旧问题）。侧栏不再按舞台宽高比 0.8 判断叠放，改看视口。
- **数字**：1920×1080 默认布局是恒等变换（8 个回归主题实测 scale 1.000、shift 0，单测）。1180×820（舞台 780×774，左列到 262、右列从 494）：设计自由区缩到 0.34–0.50，heart-and-lungs 放在左列与右列之间 208 px 宽的竖带，aircon / steam-engine / how-planes-fly / bones-and-joints / solar-system 放在观察卡下方、LAYERS 左侧的空位；1133×744 0.30–0.46；1366×1024 0.55–0.62。收起阅读面板（aircon 1180）scale 0.48 → 0.94。
- **看过的截图**（≤ 40 张，缩到 800 px）：8 个回归主题 1180×820 与 1920×1080（en/paper）、aircon / heart / steam 在 1133×744 与 1366×1024、aircon 1180 与 steam 1920 的 zh/cinema、aircon 1180 收起阅读面板与观察卡前后。主体都在自由区中间，1920 无变化；steam-engine 的飞轮、heart 的小腿在 1920 本来就伸到右列 / 章节轴后，窄屏上同样伸出（相对构图不变，没有新的裁切）。
- **sun-earth-moon**：Codex 的 1024 返工（`hudFrame.primary` 最小半径、最大空矩形、次体避让）原样并入并在浏览器复验：1024×768 满月四拍地球约 35 px、月球入画、太阳不压左栏；收起观察卡后地球约 66 px。F1 / F2 记录见该主题 FIXES.md。
- **为了测试稳定顺带改的**：SpaceScene 的 `controls.ready` 等 `bridge.hudSettled`（HUD 量完且镜头已按它放好；忙的首次加载里卡片、顶栏要几秒才定，之前镜头会在 `__atlas.ready` 之后再动），在此之前的重取景直接到位；HUD 改为变化后 120 ms 节流再量（在下一帧里量会在回应交互的那一帧里强制排版，拖慢按帧计时的用例）。两条 e2e 的独立透视回算（steam-engine、sample-mechanism 调速器）加上 `framing().shift`；新增 `tests-e2e/space-framing.spec.ts`（1920 恒等、1180 自由矩形与收起阅读面板重取景、拖过后不重取景直到下一章）。
- **门槛**（机器同时跑另两个代理和 Codex，负载 80–190）：`pnpm check` 0 错 0 警告；`pnpm validate` 94 题 0 / 0；`pnpm test` 234 文件 6110 通过（取景单测 27 项，含 Three.js 投影回算）；`pnpm build` 通过。e2e（18 个 spec，workers=3）最后一轮 197 例 189 过，失败的单独重跑后剩下的都与本分支无关：how-planes-fly:87 ×4、sample-airfoil:96 ×4（改 flow-view 会清记录表，`lib/sim/session.ts` 把显示值也算进表格上下文，基线 b4a1e2e 同样失败）、heart-and-lungs:80 与 beat-links 的 forces / energy-conversion（基线同样失败）；按帧计时的 sample-mechanism:169 / steam-engine:171（基线 3 次败 2 次）、space-label-drag:156 与 sun-earth-moon:158（39 个链接 10 分钟超时；shoot 39/39 链接同场景）是负载造成的。`pnpm shoot`：sun-earth-moon `--beats` 1920 en/paper 39/39 拍、39/39 链接、console clean；aircon `--beats --layout --size 1180x820` 24/24、24/24、layout 0 问题；heart-and-lungs `--beats` 1920 zh/cinema 33/33、33/33。1180 的章级「无标签」提示是既有行为（LeaderLabels 在 HUD 竖带窄于 480 px 时只给选中零件标签），与镜头无关。
- **留给阶段 1 / 2**：窄屏上主体仍偏小（1180 的 HUD 只给舞台留约 27–37 % 宽），要靠阶段 1 的自动收起腾出空间，取景已会跟着放大；按主体实际包围盒（而不是整块设计自由区）取景能让高瘦主体（骨架、人体）在竖带里更大，但要处理爆炸 / 动画中包围盒变化，这次没做；竖屏抽屉布局仍用原镜头，等阶段 1 定了抽屉高度再接。


### 9.4 集成（Claude，2026-11-02，claude/hud-int）

**合并**
- `main`（map-polish、可读性轮）：TimeScene 三个「图层与图例」卡保留 hud-int 的 `HudFold` 一行标题 + ×（不恢复 `.ts-overlay__summary` 绝对定位，那会让 × 压住标题）；main 的 `MapOverlay`（≤1024 默认收起的 `<details>`）删去，默认开合交给求解器（1024×768 monsoon 实测先收图例，左列也收成页签）。现代小图保留 main 的单一标题、编号引线、视图按钮：放在右上卡里（`hosted`）时卡片标题就是唯一标题、卡片页签就是它的折叠，标题行只有视图按钮和 ×；阅读面板版自带标题；演示版是同名 `HudFold`。
- `claude/frame-ts`、`claude/frame-space`、`codex/space-js`：自由矩形只有一个来源 —— `core/useHudRoom` 的一次测量写进 HUD store：`freeStage`（最大空矩形）和 `hudObstacles`（量它时的可见块，`.atlas-stage` 坐标，overlay 槽按卡片并按槽裁剪，H / 演示时 `.hud-fade` 里的块立即不算）。TimeScene `lib/hud-framing.ts` 订阅 `freeStage`（`GeoControllerOptions.hud`），不再自己量 DOM，删去 `lib/free-rect.ts`；SpaceScene `Model3DStage` 用 `hudObstacles` 做 `stageFraming`，横屏的 `bridge.freeStage` 用宿主的 `freeStage`，叠放时仍是文档里的全宽横带；宿主量完第一次之前不算放好。space-js 的测试钩子挪进懒加载的 `test-hooks.ts`（带上 frame-space 的 `framing()`），`ready` = 舞台内容画完（`stageReady`）且镜头按 HUD 放好（`hudSettled`）。
- JS 预算棘轮上调一次：space-scene 530 → 539 KB（sample-space 538.63），time-scene 480 → 481 KB（480.16），见 docs/02。

**修的 core 项**
- 左列装不下自己的内容（标题 + 元数据 + PLATE，章节轨按 3 行算）时，求解器在任何尺寸先藏元数据（`HudMeasurements.left.overflow`，按标题块展开时的高度回算，留 12 px 回滞，不来回翻）；TimeScene 左列的各 PLATE 被挤时在列内滚动，不再压到章节轴下。1920×1080：monsoon 与 aircon 因此默认是 compact（其余面板都开着）；hud-room 的 1920 断言改为「左列不收成页签、卡和图例都开」。
- 章节轴段日期按段宽取全称、取前一半（`250 Ma`）或不显示，不再被裁（深时 zh 1024）。
- 顶栏 Z / ? 改成 STAGE·只看舞台 / HELP·帮助 加淡色键位提示（手机上不显示键位）；sample-time / sample-space 1280×720 中英文顶栏仍是一行。阅读面板说明标题改为 About this topic / 关于这个主题。
- 抽屉布局里为选中对象打开的抽屉不再写成「阅读面板手动展开」（`atlas:reader` 保持收起，industrial-revolution 手机 4 例）；求解器在抽屉布局不写 `reader`。
- MathScene 排版：收起的卡片竖页签是窄障碍，模型可以放在页签旁边（手机上 measuring 的量杯从 171 回到 ≥ 200 px）。
- 并排的来源芯片命中区在间隙处分开，不再互相覆盖（dinosaur 66/70）。
- 复核后不再出现：aircon 卡片页签被阅读竖条挡住、三个 guide-button 用例、390×844 舞台占比（抽屉布局按抽屉以上的页面算，phase 1 已改）。fractions 1133×744 / 1024×768 / 1280×720 的 `shoot --layout` 0 问题。

**测试改动**（只改因新默认而必须改的）：sample-missions / sample-life-cycle 先 `setCard(true)` 再读卡；singapore-land-use 先 `setLegends(true)` 再点图层行；sample-lesson-measure / -net 手机用例回到该尺寸的默认收起（同 measuring.spec）；hud-room 两处（见上）；time-scene-folds 的现代小图改测卡片折叠。

**看过的截图**：`pnpm shoot <topic> --layout --keys --layout-sizes 1280x800,1920x1080` 与 `--touch --layout-sizes 1180x820,820x1180,390x844`，ww2、dinosaur-earth、monsoon-and-weather、aircon、solar-system、fractions、measuring 共 14 轮，0 个 layout 问题、0 个键位失败；缩图看了约 15 张。1180×820 的 SpaceScene 求解器收起后自由带约 506 px 宽，引线标签照常显示（> 480 px 门槛）。

**门槛**：`pnpm check` 0 错 0 警告（4 个既有 hints）；`pnpm validate` 94 题 0 / 0；`pnpm test` 245 文件 / 6,309 条；`pnpm build` 通过。全量 e2e（716 条，CI=1，3 workers，机器负载 100–210）：合入 space-js 后第一轮 545 过 / 171 败（几乎都是 `__atlas.ready` 超时一类的负载失败）；`--last-failed`（2 workers）157 过 / 14 败；剩下 14 条单独再跑 11 过。仍失败：inside-the-earth:81（固定镜头下读数卡变宽触发 0.6 s 重新取景，P 标记纵向移了 4 px；main 没有 HUD 取景，所以不失败）、sample-lesson-measure:170（手机量杯 198.6 px，要 ≥ 199.5）、sample-lesson-net:157（手机展开图候选块 43.1 px，要 ≥ 43.5）—— 后两条是 phase 1 让手机右上卡留竖页签后模型少了约 1 %。steam-engine:171、sample-mechanism:169、space-label-drag、heart-and-lungs:80、ancient-civilisations 两条在 main 同负载下也失败，单独跑通过。how-planes-fly:87、sample-airfoil:96、sound:72、container-port:128、fossils-and-skeletons:167 在本分支都通过（单独或重跑）。

**留下的**：ww2 英文 1280×720 顶栏三行（VIEW 预设多，Z / ? 加了标签后中段更窄；main 是两行）；SpaceScene 竖屏叠放（820×1180）仍用原镜头，模型会落到左列章节轨后面；dinosaur-earth 1280×800 重建图在小自由区下缩到 zoom 0.8 附近，构图待看。
