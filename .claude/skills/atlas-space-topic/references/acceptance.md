# 验收清单（发布前全部打勾）

## 门槛
- [ ] `pnpm check`、`pnpm validate`（0 error、0 warning）、`pnpm test`、`pnpm build`、`pnpm e2e` 全绿
- [ ] `pnpm shoot <slug> --keys --layout`：键位 0 失败、六个尺寸 0 布局问题、console 干净、无外部请求
- [ ] `pnpm shoot <slug> --beats`（EN / ZH × paper / cinema 四种组合）：0 节拍失败；"unlabelled"清单为空；末尾 `chapter highlights: all on screen`（默认 1920×1080，再加 `--size 1600x900` 跑一遍）
- [ ] `pnpm shoot <slug> --perf --gpu`（1920×1080）：静止 < 50 calls、运转 < 60（上限 100）、FLOW 开启增幅 < 10；三角形 < 0.3 M（上限 1.5 M）；数字写进 spec §15。SwiftShader 下只报 calls 与三角形

## 几何与写实
- [ ] spec §16 的参考图表齐全（来源、许可、看什么），参考图在 `scripts/geo/<slug>/refs/`、未进 git
- [ ] 每个关键视角有并排图 `docs/screenshots/<slug>/geo-*.png`，差异列表已清零或写进已知差距
- [ ] Tier-1 部件（`archetypes.md`）位置、体量、数量对；不认识这个主题的人看 hero-clean 能说出它是什么
- [ ] 干涉检查：静止与全拆开都没有穿模（剩下的逐条解释）；流的粒子不穿实体
- [ ] 每个零件有功能理由（summary 说它干什么），没有随机 greeble；爆炸方向按装配逻辑
- [ ] 示意之处（布局、间距、叶片数、转速）在 `note`、细看、已知差距里写明

## 画面
- [ ] `hero-clean`（HUD 关，`views.cover`）能当作品集封面：主体完整、阴影完整、无穿模，主体占宽 65–80 %
- [ ] 两套主题（paper / cinema）各看一遍每章截图：材质族分得开，深色件在 dark plate 下不糊
- [ ] 引线标注两列对齐、不压面板、近景减量；每章 `labels` 在章节镜头下都标得出
- [ ] 右上卡（零件链路）的列宽 = (330 − 间距) ÷ 列数，名称按 `(列宽 − 22) ÷ 5.8` 个字符截断：**列数 ≤ 4** 才读得出（72 px ≈ 8 个字符）。组多时给不需要进链路的组（外壳、成长、场景）设 `card: false`，只留有 `connects` 链和流经过的系统；仍有被截断的名称要写进已知差距（引擎限制：没有短名字段）
- [ ] 模式组合逐一过：X-RAY + FLOW（shell 透明、内件实心、粒子可见）、CUTAWAY + FLOW（`clip: false` 的流不被切）、EXPLODED + FLOW（FLOW 禁用、状态行说明）、hide + EXPLODED（隐藏的仍隐藏）、REFERENCE + run（运转暂停、读数回停机值）、X-RAY + CUTAWAY
- [ ] 手机（390 × 844）：舞台 + 章节芯片 + 底部章节条可用；触控目标 ≥ 44 px；`phone-390.png` 存档
- [ ] 规范截图存进 `docs/screenshots/<slug>/`：`hero-paper`、`hero-clean`、`hero-dark`、`hero-zh`、`mode-xray`、`mode-exploded`、`phone-390`

## 内容与事实
- [ ] 每个正文数字有 `<Num s>`；零件 detail 的数字有 `[S#]`；来源冲突列了区间
- [ ] 设计研究来源自描述（设计值、模拟运行点、结果、`note` 写"不是实测"与算式出处）
- [ ] 规格行、STATE 读数、正文、细看、字幕、detail 里同一个量同一个值；模拟值都写明"模拟"
- [ ] 事实审计：页面上所有带数字的 UI 字符串（规格行、STATE、引线说明、字幕、详情）要么有来源，要么带 SIM / 写明模拟。可用：`grep -nE '[0-9]' src/content/topics/<slug>/chapters/*.mdx` 逐条看字幕；`python3 -c` 读 parts.json 列出 summary / detail / spec 里的数字
- [ ] 无品牌、型号、商标：`grep -niE '<品牌名列表>' src/content/topics/<slug> -r` 为空（品牌只能出现在 `sources.json` 的来源标题里，且只当"典型"引用）
- [ ] 两种语言都完整：中文独立成文，没有缺 `zh` 的字段
- [ ] 名词表 12–16 个，每个在 EN、ZH 正文里各包了第一次出现
- [ ] 无脚手架残留：`grep -rnE 'One sentence:|One line: what this part does|Chapter one|第一章|chapter-one|docs/NN|A closer look|What the stage shows' src/content/topics/<slug>` 为空；无 TODO、占位文字
- [ ] 口吻检查：无拟人、无"小朋友"、无感叹号、无产品推荐；生物无目的论

## 体验
- [ ] 章节芯片、← →、Back / Next 都能换章；每章镜头落定后标注齐全
- [ ] 演示（P）：从头到尾翻一遍；自动播放跑一遍；语音（Voice）中英各听两拍：先读章号、章名，再读字幕，换拍立即停
- [ ] `<FlyTo>` 飞到预设；`<Term>` 点开名词卡，相关词可跳，TOOLS"名词"列全部，ESC 关闭
- [ ] `topic.yaml` 改 `status: published`；spec 补 §15（提交、节拍、验收数据、模式组合、手机、已知差距）；docs/04 大纲同步；提交（push 等 Gavin）
