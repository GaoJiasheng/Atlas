# 瓦特蒸汽机：交付与审阅记录 / Steam engine review — 2026-10-27

本主题内容已施工，保持 `status: draft`。规格要求全部浏览器门槛通过后直接上线；本轮 brief 明确禁止在 sandbox 运行 `pnpm shoot`、`pnpm e2e` 或用用户浏览器/桌面绕过，因此没有把未完成的视觉验收当作通过。主会话补跑下列门槛后才改为 published；本轮没有改 smoke 的已发布主题数。

Content is implemented and remains draft. The spec permits direct publication after all gates pass. BRIEF-CONTENT explicitly reserves browser gates for the main session; none was attempted, and no browser or desktop workaround was used. Published smoke counts are unchanged.

## 请 Gavin 检查 / For Gavin

1. **中文专名优先**：汽缸、平行运动机构、太阳与行星齿轮机构、热井、滑套、叉环、纽科门；Lap 保留英文。这些采用规格的编辑用语，未取得新加坡专门中文术语来源核定。请先看背景章和第 04、06 章的中文。
2. **参考机器**：采用保存的 1788 Lap engine（SMG 1861-46），不称数字孪生或某年的原厂复原。ASME 内径 18.75 in 与档案 18 in 并列，行程 4 ft；飞轮 16 ft 明确归属 Hulse。来源外缘齿数不同，因此不画可数的取力齿圈。
3. **模型边界**：连杆、管路、支架和放大间隙为重建。主机由给定相位驱动；压力没有求加速度。两齿轮完整周期净两圈，但瞬时速度比不恒定。飞轮的平滑作用是原理说明，没有算出负载下的转速变化。
4. **冷凝与水**：生产模型画喷射式冷凝器、抽气泵、混合排水、热井、部分给水、外来冷水及溢流。旧冷凝器插图只说明冷热分开，不能证明内部喷射构造。小点仅表示路径。
5. **调速器**：60/90/120 rpm 是独立静态比较，三套刚性姿态零时长切换；没有负载响应、皮带传动比、瞬态、静差或恒速保证。示意皮带和直角取力只保留机械连接。主机连续运动拍隐藏整组调速器。节流阀片和四个配汽阀是不同对象。
6. **数字与能量**：压力、力、指示功、模型指示功率均为 SIM，绝压用 kPa abs / 千帕绝压。100 份账本的边界是传给工作流体的热量，不是全部燃料输入；10+90、20+80、30+70 不是 Lap 效率。没有温度、耗煤或轴功率断言。
7. **阅读范围与卡片**：小学高年级科学拓展，不标 PSLE 必考。背景加七章、36 拍，02/03/06/07 四卡保留先猜后看和记录。没有录音、默认测验或自动翻章。劳动、强迫劳动、殖民经济与环境史留给父主题，不在机器页压成简单结论。
8. **图版验收**：请实际看 EN/ZH × paper/cinema 的所有拍、390×844 手机抽屉、主机全景、阀口剖面、交叉不连接的杆件、泵上行、三档调速器和账本。尚无本主题浏览器截图，不能据离线几何审计认定画面合格。
9. **许可**：主题派生内容与八份 WebP 导出按 CC BY-NC-SA 4.0 family；两张开发机械参考图保留公有领域身份。SMG 描述署名及独立改写说明已登记；未复制博物馆照片、受限档案扫描或 ASME/Hulse 媒体，没有混入 BY-SA 家族。

Gavin’s priorities: Chinese terminology first; historical dimension disagreement; reconstruction and prescribed-motion limits; injection/water accounting versus the older illustration; independent static governor; SIM and working-fluid energy boundary; science-extension scope and four cards; actual bilingual/theme/phone visual inspection; and NC-SA/PD provenance. These are the signed-off defaults D1–D12, not unresolved permission requests.

## 姊妹主题链接 / Deferred sister-topic links

`industrial-revolution` 尚未出现在本 worktree。按规格只在背景章与末章保留中性双语阅读说明，不输出死的 TopicLink。以下链接在姊妹主题实际存在且 published 后生效：

- 背景章：`industrial-revolution/ir-thread-coal-power`
- 末章：`industrial-revolution/ir-work-cotton-coercion`
- 末章：`industrial-revolution/ir-growth-costs`

The three planned links go live when the sibling topic ships. Their slug and anchors are recorded here; current product prose is plain text. Bilingual backlink sentences were added only to `energy-conversion/never-used-up` and `states-of-matter/gases`, as specified. The other two science targets are linked from this topic.

## 实际交付与差异 / Delivered scope and differences

八章 36 拍；56 个可选零件及 4 个 context；7 组（右上链路卡 4 列）；6 条流；单一 main-engine 机构；15 行 table；3 套调速器姿态与 4 套纽科门端态；16 来源、16 名词、3 张批准插图。程序化模型从 sample-mechanism 生成器起步，保留其机构角色、完整齿廓及表格绑定，增加生产结构和逐件功能说明。`generate.mjs` 只重建 parts.json，不覆盖正文或来源。

Delivered: eight chapters, 36 beats, 56 selectable parts plus four contexts, seven groups/four chain-card columns, six flows, one mechanism, 15 table rows, three governor and four Newcomen poses, 16 sources/terms and three approved images. No engine, dependency, package/lock, review-queue or git write changes were made.

章索引补入 02 的 pump-rod 和 07 的 boiler-water，使所有 56 件均可索引；背景章与 06 章仍各 14 项。六个预设保留规格 id，linkage-view 与 02.1、05.2、07.3 镜头按离线投影校准；没有删标签来隐藏问题。阀片几何改为绕世界 Z 轴跨过 Y 轴汽路，避免沿用夹具初始朝向造成开度变化却未改变遮挡面积。以上均为内容数据调整。

Indexes add pump-rod to 02 and boiler-water to 07 while preserving the two 14-entry indexes. Camera calibration keeps all labels and preset ids. The throttle disc’s rest orientation now makes its pose angle change the obstruction across the fixed passage; a unit test checks actual geometry normals.

来源 schema 只接受 HTTP(S) URL，因此本地设计研究 S1 与本地链接/图像核查 S14 没有伪造 URL；完整算式、定位和许可在 data/SOURCES.md。三张图按规格生成 800/1600 WebP，另为现有 Figure 组件生成两张 1200×900 文件；全部来自批准的最终 PNG，没有新生成图像。

S1/S14 omit URLs to respect the existing source schema. Two additional Figure-compatible exports supplement the six specified 800/1600 exports. All eight were inspected; hashes and parent-snapshot reuse are recorded in SOURCES/AUDIT.

## 门槛 / Gates

| 检查 / Gate | 实测结果 / Actual result |
|---|---|
| pnpm check | 0 errors / 0 warnings；3 个既有 hints |
| pnpm validate | 57 topics；0 errors / 0 warnings |
| pnpm test | 159 files；4256/4256 passed；本主题 20/20 |
| pnpm build | 117 pages；通过，既有 Vite 大 chunk 提示 |
| steam-engine e2e --list | 11 cases 可解析枚举；不是浏览器通过 |
| pnpm shoot 与 pnpm e2e | 按 brief 跳过；截图 0，浏览器断言通过数 0 |

离线检查：32768 帧独立机构扫描、压力与功算式、调速器实际杆端、纽科门链段端点、节流阀片法向、15 行表、36 拍字幕与数值、16 词双语首现均有单测。CPU 几何构建无非有限顶点；各拍最多 59 个可见 geometry pieces、122900 三角形。16:9 全视口投影中 36 拍标签锚点没有越界；这不检查 HUD 避让、遮挡或手机镜头。它们都不是实际 draw calls / GPU fps；阴影、流和高亮开销未计入。

Offline checks cover the independent 32768-frame sweep, arithmetic, actual rigid/static geometry, content and captions. CPU geometry counts exclude renderer passes; no GPU timing, draw-call budget, first-screen JS total or demand-loop sleep result is claimed. Logs are `/private/tmp/atlas-steam-content-{check,validate,test,build}.log`; the temporary geometry audit is `/private/tmp/atlas-steam-content-geometry.ts`.

## 主会话续跑 / Main-session handoff

请先 build，再执行并逐张看图：

```sh
pnpm shoot steam-engine --beats --tasks --keys --layout --locale en,zh --theme paper,cinema
pnpm shoot steam-engine --beats --size 1600x900 --locale en,zh --theme paper,cinema
pnpm shoot steam-engine --shots src/content/topics/steam-engine/qa-shots.json --locale en,zh --theme paper,cinema
pnpm shoot steam-engine --perf --gpu --size 1920x1080
CI=1 ATLAS_E2E_PORT=5421 pnpm e2e
```

Main session: complete all browser gates, including phone layout and five-angle custom shots, record actual render/load budgets and screenshots, fix findings, then publish and update published smoke counts. Load-only failures should be rerun alone and reported. No browser blocker was retried or bypassed during this turn.
