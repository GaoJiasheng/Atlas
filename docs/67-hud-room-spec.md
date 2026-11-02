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
