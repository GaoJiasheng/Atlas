# 青蛙与鸡：事实核查记录 / Fact audit

2026-10-27。按 docs/56 的已定范围施工；状态按用户要求为 `published`。本记录区分事实核查、作者设计和仍须主会话完成的视觉验收，不把准备验证写成发布门槛通过。

## 证据链 / Evidence chain

母事实表为只读准备目录 `art/research/frog-and-chicken/facts.json` 的 F01–F38；章节、字幕和模型解释没有新增生物测量值。来源登记由同目录 sources.json 转为产品格式，S01–S09 → S1–S9，其余 S10–S22 不变。共 22 条，S22 为 `design: true` 的自描述设计研究，S21/S22 无伪造外部网址。完整定位和限制见 [data/SOURCES.md](data/SOURCES.md)。

主会话于 2026-10-27 重新核读 S2 NHM frogspawn、S3 AMNH Tadpoles、S6 Mississippi State Avian Embryo、S8 Illinois Q&A 全文。其余访问方式如实沿用准备登记，没有声称本轮读过未取得的全文。S9 直接访问 403，只读索引相关摘录，以 S6 交叉支持受精先于蛋壳形成；S15/S17 直接 PMC 要求机器人验证，只用索引摘录；S16 只用摘要；S19/S20 只用索引摘录。S1 与 S18 使用准备时已有 PDF 缓存，未与验证交互。

## 正文逐段 / Paragraph provenance

下表按每章每种语言共有的四段主线及两个细看编号；中文独立行文，事实范围与英文一致。正文不塞入来源标记干扰初读；读者可查来源面板，数字链接至来源，作者核查由此表逐段回溯。

| 章 | 主线第 1 段 | 第 2 段 | 第 3 段 | 第 4 段 | 细看 1 / 2 |
|---|---|---|---|---|---|
| 00 before-you-start | 成体与幼体比较 F01,F21,F34–F35 / S1,S9,S22 | 生活史与雏鸡 F21–F22,F34–F35 / S9,S15,S22 | 繁殖连接到下一代 F22–F23 / S15 | 指示珠、独立放大、间距非时间 F34–F38 / S22 | 生长与繁殖 F22–F23 / S15；观察模型 F37–F38 / S22 |
| 01 eggs-and-tadpoles | 胶质包被、胚胎、部分卵团 F04,F34 / S2,S22 | 孵出蝌蚪、尾游 F04–F05,F08,F34 / S2–S4,S22 | 蝌蚪是青蛙幼体 F05 / S3 | 不同物种与条件的时间差异 F09,F37 / S3,S22 | 直接发育 F10 / S5；无统一时钟 F09,F37 / S3,S22 |
| 02 the-changing-frog | 后腿先显现 F06,F34 / S2,S22 | 幼蛙四肢与短尾、变态发育 F08,F11 / S2,S4 | 尾巴吸收、无蛹 F07,F11,F29,F32 / S2,S3,S14 | 连续发育、分组、不可逆生长 F34,F37 / S22 | 观察视图 F11,F34,F37 / S2,S22；体内变化、繁殖连接 F08,F22,F38 / S4,S15,S22 |
| 03 inside-the-egg | 孵出前已发育，示意窗 F13,F35 / S6,S22 | 胚胎、卵黄、卵白不同 F17–F18,F35 / S7,S22 | 受精与先后条件 F15–F16 / S6,S9 | 未受精例子、适宜条件、约 21 天 F14–F16,F35 / S6,S8,S9,S22 | 蛋壳气体交换 F19 / S6；hidden 为视图状态 F35,F37–F38 / S22 |
| 04 chick-to-adult | 喙、暂时卵齿、孵出与绒羽 F13,F20,F35 / S6,S22 | 雏鸡至成鸡，无蛹 F20–F21,F35 / S6,S9,S22 | 母鸡为成年例子、非单纯缩放 F21,F35 / S9,S22 | 下一代、本地家鸡与红原鸡 F22,F27,F37 / S11,S15,S22 | 分别标本 F35 / S22；本地鸡群 F27 / S11 |
| 05 cycles-compared | 蛙、鸡幼体比较 F05,F21,F36 / S3,S9,S22 | 蚊子四阶段、水中幼虫与蛹、蛙无蛹 F29–F30,F32 / S3,S14 | 种子、幼株、成株及链接 F03,F33,F36 / S1,S21,S22 | 起点与顺序、Cinnamon Bush Frog 保育 F22,F26,F28,F37 / S10,S12,S15,S22 | 蚊图不是蛙卵 F29–F31 / S13,S14；生存差异与图示限度 F16,F22–F23 / S9,S15 |

## 字幕、数值与状态 / Captions, numbers and authored states

- 六章各五拍，共三十拍，字幕与逐拍镜头采用准备 `beat-plan.json`，其 F 编号与母 facts.json 对照；英文各拍不超过 45 词。未把 UK 时令或发育周数用于新加坡。
- 唯一生物时长为正文及鸡卵字幕的约 21 天；正文两种语言均用 `<Num s="S8">`，从适宜孵化开始，不从购买开始。不是成功保证、温度配方或模拟倒计时。
- 五／三／四／三是作者选择的观察分组，不是每种生命都必须遵守的唯一阶段数。位置、标本大小、环间距与相机是 DESIGN；没有物种定量尺寸、温度、存活率或统一青蛙天数。
- 每章以及每拍都给出完整五控件 `sim.set`；每拍由章基线独立构造，不积累上一拍。视图为 assembled，run=false，explode=0，cutaway=none，pose=null，hide/ghost/layers 独立重置。所有拍 label 均纳入本章 index；两个下一代连接可选。
- 03 章的先猜后看使用 `start={egg-open:true,fertilised:true}`、`change={fertilised:false}`、`observe=embryo-view`，shown/hidden 的 means 与状态 id 一致。关窗导致“看不到”与未受精例子的“不显示”在细看中分开；hidden 从不解释为死亡计算。试一试不设 record、replay 或图表。
- 02 章尾巴问题在正文提出，第三拍近景揭示“逐渐吸收”，不加评分或虚构模型输出。

## 术语与图像 / Terms and art

14 个名词，EN/ZH 各一处 Term 包裹，see 只引用存在的其他术语 id。词形按准备中的香港传统词形证据简化；生活史是编辑选择，初见解释为生命周期。蝌蚪、幼蛙、成体、雏鸡、卵黄、孵出、变态发育、蛹等仍属中文编辑复核项，未声称为新加坡教育部官方译名。Cinnamon Bush Frog 保留英文种名，不把通用模型冒充该物种。

两张章节图使用规定 Figure 路径，EN/ZH caption 与 alt 齐全；蛙图为卵团与无腿游泳蝌蚪，避开准备阶段未通过的趾数版本；蚊图复用既有 mosquito 图，图注明确不是蛙卵。两图均注明各自放大。封面及两图的尺寸、字节、SHA-256、真 alpha 与复用来源见 [ILLUSTRATIONS.md](ILLUSTRATIONS.md)。标准 illustrate.ts 有损 WebP 解码后少量像素的 RGB 通道最多相差 1/255；批准 PNG 原图严格等 RGB。这是极小的字面规格偏差，未改用超过预算的无损编码。

## 未采用 / Excluded claims

不借用特定新加坡蛙种发育天数、不加蛙蛹、不画断尾；不把卵黄写成完整雏鸡；不把温暖写成受精。未引用研究来声称这些误解在新加坡发生的比例。S16/S17 只用于教学背景，正文没有加入其样本或效果量。没有引用未选的第三方图片、BY-SA 或 ODbL 数据。原创文字、模型与派生插图按现有 BY-NC-SA 家族，不为一般事实引文另加许可例外。

## 验收边界 / Verification boundary

本子任务已写可供主会话核查的实际文件。浏览器门槛依 BRIEF-BUILD/CONTENT 明确跳过，须由主会话执行 `shoot --beats --tasks --keys --layout --locale en,zh --theme paper,cinema` 及端口 5444 的 e2e；手机 390×844、paper/cinema、遮挡标注、趾数、轮廓、性能与 reduced motion 均不能据本记录假称通过。完整 check/validate/test/build 结果由主会话记录至 spec §9。

## 模型施工补记 / Model implementation notes

主模型青蛙前足四指、后足五趾；微小比较台标本为保轮廓与预算省略独立脚趾，不供趾数学习。雏鸡调整为较大头、短颈、短足与短喙的幼鸟比例。指示珠的绑定原点保留计划坐标，可见珠与引线锚点经同一零件的几何延伸放到展台前缘，以免被标本遮住。以上为显示设计，没有生物测量含义。CPU 几何核查为 24 个零件、54 个材质批次、126348 个三角形、零非有限坐标；运行时 draw calls 与截图性能仍待主会话核实。


## 施工门槛实录（主施工会话）

2026-10-27：check 765 files／0 errors／0 warnings／3 个既有 hints，tsc --noEmit 通过；validate 58 topics／0 errors／0 warnings；本主题单测 265/265；build 119 pages 通过。全套默认单测与 maxWorkers=2 重跑均为 4541/4542，通过之外的一项是原有 energy.test.ts:312 守恒穷举超过 5000 ms；单独默认重跑仍超时，诊断给 20000 ms 后 64/64 通过（守恒项 6187 ms）。没有修改该测试或全局配置，不能把默认门槛写成全绿。初次全套另有 worker RPC timeout，低并行重跑没有该错误。

按 brief 未运行 shoot/e2e，亦未打开个人浏览器／桌面。已编写 14 个 e2e cases，主会话用端口 5444 验收。完整命令与结果见 docs/56 §9.4；没有提交或改动 package/lockfile。
