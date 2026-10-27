# eyes-and-ears · 浏览器验收退回项（2026-10-27，Claude Opus 验收）

验收在合并 main 之后的 `codex/eyes` 上做（`pnpm shoot eyes-and-ears --beats --keys --layout`，1920×1080 presentation 截图在 `shots/eyes-and-ears/<locale>-<theme>/`）。引擎数学（`lib/sim/senses.ts`）、校验、shoot 的数/图一致性检查都对；问题在**画面读不出各拍声称的现象**。下面四项都要动 overlay 设计、模型常数或工位布局，超出验收小修范围，请 Codex 重做；做完重新跑 `pnpm shoot eyes-and-ears --beats --keys --layout --locale en,zh --theme paper,cinema` 和 `--size 390x844`。

## F1 · 光学台在统一比例下看不出倒像和散斑（01.5、02.3、03.1–03.4）

- 现状：`cmToScene: .06` 统一缩放。远物像高 −0.1 cm → 0.006 场景单位；偏焦散斑 7/150 cm → 0.0028；孔径 ±0.1 cm → ±0.006。整条台 2.64 单位长，六条光线在接收面上看起来汇成一个点。截图 `beat-an-image-on-the-retina-3.png`（字幕说"物体上部来的光落到接收面下方"，画面无法分辨上下）、`beat-near-far-and-focus-2.png`（字幕说"光斑散开"，看不到散开）、`beat-the-light-gate-5.png`。
- 另外上、下两个物点的光线同色，即使放大也分不出哪束去了哪里。
- 期望：
  1. paraxial-eye 增加作者声明的竖向放大（例如 `yScale`，校验 ≥1 且有限），只放大 y，PLATE 说明和该拍细看写明"竖向放大 ×N，示意"；shoot 的端点核对把 yScale 算进去。N 取到 1024×768 的 HUD 舞台里倒像上下分开、偏焦散斑肉眼可见（建议先试 8–10）。
  2. 两个物点的光线和光斑分色（上点一色、下点一色，与物点标记同色，都用 token），图例或标签说明。
  3. 02 章若仍看不清，可改用 near/near（m = −1/3，比 far 的 −1/10 明显），在 §9 记偏离 spec §5.0。

## F2 · 光学台没有专用镜头（02.3、03 全章）

- 现状：`focus-bench` 预设 target [-1.9,-0.8,0.6]，画面主体是眼球剖面，光学台挤在底边、压在字幕条上方；"接收面"标签压在光线上，"物体上部"标签被推到右侧（`beat-near-far-and-focus-2.png`）。shoot 报 chapter highlights 不在屏：near-far-and-focus（lens、retinal-screen、object-top）、an-image-on-the-retina（object-top、lens、retina）。
- 期望：一个对准光学台的镜头（台中心约 [-2.1,-1.5,1.3]，far 物点在 x=-3.4，接收面在 x=-0.76），03 章和 02.3 用它；03.5 / 02.4–02.5 回到 eye。HUD 模式 1024×768 与 390×844 都要能看到物点、透镜、接收面三者。

## F3 · 纵波看不出疏密（06 全章）

- 现状：`baseDisplacementScene .0125`、λ=1 → 疏密只有 ±8%（振幅 2 也只有 ±16%）；粒子半径 .007、间距 .05；`wave` 镜头把耳部放在画面中央，粒子行是底边一条细线，紧贴字幕条（`beat-pitch-and-strength-1.png` 到 `-5.png`）。"粒子来回、图样前进"和"振幅加倍"都读不出来。shoot 报 pitch-and-strength 的 wave-reference、eardrum、cochlea-shell 标签不在屏。
- 期望：
  1. 提高位移常数。不交叉条件 2π·A·amp/λ < 1 在最坏组合（amp 2、500 Hz、λ=.5）下要求 A0 < .0398；建议 .035（250 Hz/amp 1 时疏密 ±22%，amp 2 或 500 Hz 时 ±44%）。同步改 `senses-schema.ts` 固定值、两个 parts.json、`tests/space-scene/fixtures/senses-oracles.json`、`senses.test.ts`、docs/58 §1.4/§4.4、docs/06。
  2. 粒子放大到在 1024×768 HUD 舞台里清楚可见（约 .012–.015），参考粒子与静止刻度保持醒目。
  3. `wave` 镜头以粒子行为主体（行中心约 [2,-1.5,1.3]），耳部可以出画或在上方作背景。

## F4 · 毛细胞放大窗压在耳朵正前方（05 全章、07.3）

- 现状：放大窗在 [2,-.2,1.6]，挡住中耳和咽鼓管；细胞体和基底膜条被字幕条切掉（`beat-vibration-to-signal-2.png`、`-4.png`）；舞台上看不到 spec §2.2 要求的"放大示意，非同一比例"边界。shoot 报 vibration-to-signal 的 cochlea-shell、basilar-strip、hair-patch 标签不在屏。
- 期望：放大窗和耳部分开（例如移到耳蜗右下方，留出间距），加一个可见的边框或分隔线，说明放大、不同比例；`cochlea` 镜头同时框住耳蜗和放大窗，1024×768 HUD 模式下不被字幕条遮挡。

## F5 · 偶发空白舞台（需在负载较低时复核）

- 现状：en-paper 40 张拍图里 6 张舞台全空（标签和引线在，模型和地影都没有：`beat-the-light-gate-2`、`beat-an-image-on-the-retina-4`、`beat-before-you-start-4`、`beat-near-far-and-focus-4`、`beat-three-moving-bones-2`、`beat-care-and-protection-5`）；zh-paper 换成另 2 张（`beat-an-image-on-the-retina-3`、`beat-the-light-gate-5`）。不固定在某拍，像是负载下按需渲染没补帧。同一负载下 light-and-shadows 41 张、sample-light 25 张没有空白。
- 期望：查本题静止章节（run=false、无动画）在 HUD 显隐 / 画布尺寸变化后是否一定 invalidate 一帧（例如 SensesOverlay 或 RunClock 的 effect 依赖）；修好后在负载较低时重跑 `--beats`，空白应为 0。

## F6 · 手机竖屏总览只看到眼睛

- 现状：`layout-390x844.png`（00 章总览）只有眼球在左缘，耳朵在画外。
- 期望：00、07 的总览在 390×844 上两个工位都入画（竖屏用更远的镜头或上下排布的备用镜头，看引擎已有的竖屏取景办法）。

## 顺带

- 眼球剖面上视网膜被切开的边呈锯齿（`beat-the-light-gate-1.png` 中部那条竖边），像是薄壳切面的封口问题，顺手看一下。
- 合并 main 后 `tests-e2e/smoke.spec.ts` 的计数冲突按指示取 main 的数（36 题、72 徽章、图版 36），本题上线时主会话合并时再一起改成含本题的数。
