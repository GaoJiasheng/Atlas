# 15 · 分数 · 内容与第三引擎 spec（v1 草案）

第一个数学主题，也是第三个引擎 **`math-scene`**（交互式分步课 + 练习）的设计书。Gavin 的要求（2026-10-10）："以新加坡小学教材的分数为例，做一个方便易学的分数内容：1. 一步一步带下来；2. 最后一步出几个测试题。整体效果希望能够达到新加坡小学教学的标准。" 女儿现在 P2，明年 P3。

本文只做规划，不实现。结构照 docs/12、docs/14（spec 深度）；引擎契约照 docs/06「Scene 契约」；视觉与交互照 docs/08 §1–§3 和 skill `industrial-3d-showcase`。**正文、引导语、提示、反馈的终稿未经 Gavin 定稿不写**（CLAUDE.md）；本文里的英文 / 中文句子是**口吻样例**，施工时由 T 代理按 §5 写全。

## 0. 决策记录（2026-10-10 起草，待 Gavin 定稿）

| # | 决定 |
|---|---|
| 1 | **对象**：MOE 2021 小学数学课纲（2025-10 更新版）的 Fractions 子线，**以 P3 为主体**，P2 内容作为前几步的地基，P4 的带分数作为可选的最后一步"桥"（§1）。课纲原文是唯一的范围依据，教材（My Pals Are Here!、Shaping Maths 等）只作"典型顺序"参考，不照抄题目、插图、措辞 |
| 2 | **这是一节课，不是一本图谱**：与 ww1 / ww2 / aircon / grasshopper 的"不做测验、不做儿童化设计"相反，本主题按 Gavin 的明确要求**有引导步骤和章末练习**。语气仍然克制：不打分排名、不做连胜、徽章、星星、音效、卡通人物；练习末尾只给一个安静的"8 题对了 6 题 + 建议回看哪几步" |
| 3 | **新引擎 `math-scene`**（不复用 `simulation` 占位）：舞台是 SVG（无 WebGL），住在同一套技术图版 HUD 里（章节芯片、VIEW 组、阅读面板、底部条、右上卡、底部三面板、演示）。`simulation` 占位保留给科学类参数模拟 |
| 4 | **CPA 落在一个画面里**：舞台上的模型 = 具体 / 图像（Concrete → Pictorial，孩子亲手折、切、涂、放），右上卡的大号分数 + 底部 02 WORKING 面板 = 抽象（Abstract）。每一步孩子先"做"，再看到符号 |
| 5 | **每个交互都能只用点按完成**，也都能只用键盘完成；拖动永远只是快捷方式（§4.6） |
| 6 | **答案不进 URL，不进 localStorage**；进度（哪些小步做完了）只在内存里，刷新即清（§4.9，D6） |
| 7 | 不设关卡锁：所有步骤随时可进（docs/01 原则"所有章节始终可进入"）；做完与否只是底部条上的填色 |
| 8 | 数字和情境贴近新加坡生活（kaya 吐司、千层糕、prata、橘子、斑兰蛋糕、组屋楼层、MRT 站），人名多族群；分母 ≤ 12（课纲上限），P2 / P3 的加减"在一个整体之内"（课纲原文） |
| 9 | 双语：EN 默认、ZH 一键切；新加坡小学数学用英语授课，中文是给孩子和家长的对照，术语按 §5.2（D5） |
| 10 | 两套主题都要成立：paper 是标准实现，cinema 是 dark plate；孩子的笔迹 = signal 橙，两个量 = cold / hot（§4.3） |

## 1. 范围与课纲对照

### 1.1 课纲原文（S1，MOE *Mathematics Syllabus Primary One to Six*, implementation starting with 2021 Primary One Cohort, updated Oct 2025）

2025 年这份 2021 课纲适用于 P1–P5，2026 起也适用于 P6（S1 第 29 页脚注 5）。Fractions 子线逐级原文（Number and Algebra · SUB-STRAND: FRACTIONS）：

| 级 | 课纲原文（S1） | 页 |
|---|---|---|
| **P2** | 1. Fraction of a Whole — 1.1 fraction as part of a whole · 1.2 notation and representations of fractions · 1.3 comparing and ordering fractions with denominators of given fractions not exceeding 12: unit fractions, like fractions。2. Addition and Subtraction — 2.1 adding and subtracting like fractions within one whole with denominators of given fractions not exceeding 12 | 33 |
| **P3** | 1. Equivalent fractions — 1.1 equivalent fractions · 1.2 expressing a fraction in its simplest form · 1.3 comparing and ordering unlike fractions with denominators of given fractions not exceeding 12 · 1.4 writing the equivalent fraction of a fraction given the denominator or the numerator。2. Addition and Subtraction — 2.1 adding and subtracting two related fractions within one whole with denominators of given fractions not exceeding 12 | 35 |
| **P4** | 1. Mixed Numbers and Improper Fractions — 1.1 mixed numbers, improper fractions and their relationship。2. Fraction of a Set — 2.1 fraction as part of a set。3. Addition and Subtraction — 3.1 adding and subtracting fractions with denominators of given fractions not exceeding 12 and not more than two different denominators | 37 |
| P5（背景） | 1. Fraction and Division — 1.1 dividing a whole number by a whole number with quotient as a fraction · 1.2 expressing fractions as decimals。2. Four Operations — 2.1 adding and subtracting mixed numbers · 2.2 multiplying a proper/improper fraction and a whole number without calculator · 2.3 multiplying a proper fraction and a proper/improper fractions without calculator · 2.4 multiplying two improper fractions · 2.5 multiplying a mixed number and a whole number | 41 |

核对要点（纠正常见二手说法）：
- **"分数的集合"（fraction of a set）在 P4**，不在 P3。**分数乘整数在 P5**，不在 P4。
- P2 已经有**同分母分数加减**（2.1），P3 的加减限定为**两个"相关"分数**（related：一个分母是另一个的倍数，如 1/2 与 3/8）且**结果在一个整体之内**。
- **数轴**在 P2 / P3 条目里没有点名，属于 1.2 "representations of fractions"；本课把它当作贯穿的表示法，依据是 S5（IES 指南建议把数轴作为分数教学的中心表示工具）。规格表和阅读说明如实写"数轴是表示法，不是单独的课纲条目"。

课纲的框架（S1 第 12–20 页）：五个相互关联的组成部分 concepts / skills / processes / metacognition / attitudes 支撑"数学解题能力"（俗称 Pentagon 五边形框架）；学习三阶段 **Readiness → Engagement → Mastery**；教学取向是 Skemp 的"关系性理解优先于工具性理解"（"knowing the why, not just the what and how"）；大观念（big ideas）里与分数直接相关的是 **Equivalence**、**Notations**、**Diagrams**、**Proportionality**。2021 版正文没有出现 "Concrete-Pictorial-Abstract" 字样，但 CPA 是新加坡小学数学公认的中心教学法（S3 TIMSS 2015 百科：Singapore 条目；各校家长说明会资料），模型法（bar model）是它的"图像"一环（S4）。

本课的映射：
- **Readiness** = 每步开头一句"你已经知道……"（阅读面板头部 summary）+ 背景章；
- **Engagement** = 每个小步的"看一个例子 → 你来做"（演示拍 + 舞台交互）；
- **Mastery** = 第 13 章练习（Motivated Practice）+ 总结页的"回看哪几步"（Reflective Review）；
- **Metacognition** = 每个反馈都说"为什么"，练习里有一道"解释为什么"；**Attitudes** = 语气平静、可以重来、不计时、不排名。

### 1.2 级别与步数

- **主体 P3**（D1）：第 07–11 步覆盖 P3 全部五条（1.1–1.4、2.1）。
- **地基 P2**：第 01–06 步覆盖 P2 全部四条（1.1–1.3、2.1），P2 的孩子今年就能用。
- **桥 P4（可选，D2）**：第 12 步带分数与假分数（P4 1.1）。分数的集合（P4 2.1）作为备选第 13 步，默认不做。
- 共 **12 个课步 + 1 个练习章 + 1 个背景章**（背景章 `00`，讲怎么用：点、检查、提示、四种模型；不计入步数）。
- 时间预算：P3 孩子走完 01–11 ≤ 17 分钟，12 ≤ 3 分钟，练习 ≤ 5 分钟，合计 **< 25 分钟**（§6.4 验收）。

### 1.3 步骤与课纲对照表

| # | 步骤 id | EN | ZH | 课纲 | 模型 | 小步 |
|---|---|---|---|---|---|---|
| 00 | `before-you-start` | Before you start | 开始之前 | — | 全部（示意） | — |
| 01 | `equal-parts` | One whole, equal parts | 一个整体，平均分 | P2 1.1 | bar · circle | 3 |
| 02 | `unit-fractions` | One of the equal parts | 单位分数 | P2 1.1, 1.2 | circle · bar | 3 |
| 03 | `non-unit-fractions` | More than one part | 几个这样的部分 | P2 1.2 | bar · circle | 3 |
| 04 | `number-line` | Fractions on a number line | 数轴上的分数 | P2 1.2 | numberline + bar | 3 |
| 05 | `comparing-fractions` | Which is greater? | 比较大小 | P2 1.3 | wall · bar | 3 |
| 06 | `adding-like-fractions` | Adding and taking away parts | 同分母分数的加减 | P2 2.1 | bar · barmodel | 2 |
| 07 | `equivalent-fractions` | Same amount, different names | 等值分数 | P3 1.1, 1.4 | bar（折、分）· wall | 3 |
| 08 | `simplest-form` | Simplest form | 最简分数 | P3 1.2 | bar（合）· wall | 3 |
| 09 | `comparing-unlike` | Comparing and ordering unlike fractions | 异分母分数的比较与排序 | P3 1.3 | bar 叠放 · numberline | 3 |
| 10 | `adding-related` | Adding related fractions | 分母有倍数关系的分数相加 | P3 2.1 | bar · barmodel | 3 |
| 11 | `subtracting-related` | Subtracting related fractions | 分母有倍数关系的分数相减 | P3 2.1 | bar · barmodel（比较模型） | 3 |
| 12 | `mixed-numbers` | More than one whole（bridge） | 超过一个整体：带分数与假分数 | P4 1.1 | bar ×2–3 · numberline 0–3 | 3 |
| 13 | `practice` | Practice | 练习 | P2–P3 全部 | 按题 | 8 题 |
| （备选） | `fraction-of-a-set` | Fraction of a set | 一组物体的几分之几 | P4 2.1 | set | 3 |

阅读面板头部的 summary 每步一句（"You can name one equal part. Now name several." 一类），施工时写。

## 2. 课步设计

### 2.0 每个小步的统一结构（"我做 → 我们做 → 你做"）

每个课步 = 2–4 个**小步**（task）。每个小步：

1. **例子**（example，可跳过）：在**另一组数字**上，引擎自动演示一遍正确做法（幽灵指针点、折、涂，字幕一句一句出）。孩子按"Watch an example / 看一个例子"或在演示模式里自动看到。
2. **你来做**（try）：同一模型换成本题的数字，舞台下方的作答托盘写一句题目，孩子在舞台上操作（或在托盘里输入 / 选择），按 **Check / 检查**。
3. **反馈**：对 → 一句"对，因为……"+ 模型上出现符号（CPA 的 A）；错 → 按诊断出的误解给一句具体的话 + 下一步该看哪里，可以再试；**第二次不对**出现"Show me / 看答案"：模型上用墨色虚线画出正确状态，阅读面板说明为什么，孩子可以照着做一遍再继续。
4. **提示**（Hint，最多 3 级）：① 看哪里（"Count all the equal parts first."）② 用什么办法（"Fold the strip once more."）③ 几乎是答案（"The whole has 8 parts. 3 are shaded."）。

小步顺序固定，但不锁；"Next / 下一题"随时可按。

### 2.1 交互词汇（`task.kind`）

| kind | 孩子做什么（点按） | 键盘 | 拖动快捷 | 检查 |
|---|---|---|---|---|
| `shade` | 点部分切换涂色；托盘里 `−` / `+` "少涂一份 / 多涂一份"（手机上小部分的替代） | Tab 到部分，Enter / 空格切换；`+` `−` 键 | 拖过多个部分连涂 | 涂了几份 / 共几份 = 目标（`exact`）或与目标等值（`equivalent`） |
| `cut` | 在整体上点一下放一条切线（吸附到 1/12 或 1/24 网格），再点切线可删 | 光标是 `role="slider"`，←→ 移动，Enter 放线 | 拖切线 | 切成 n 份且每份相等（容差 ≤ 半格） |
| `fold` | 点 Fold / 对折：纸条对折动画，每折一次份数翻倍；Unfold 撤销 | `F` 不用（与模式冲突），托盘按钮 Tab + Enter | — | 份数 = 目标 |
| `split` | 选"每份再分成 ×2 / ×3 / ×4"芯片，原有涂色跟着细分（等值分数） | 芯片是 `role="radiogroup"`，←→ | — | 得到目标分数（如 8/12） |
| `merge` | 选"每 ÷2 / ÷3 / ÷4 份合成一份"，不能整除的芯片禁用并说明 | 同上 | — | 得到最简分数 |
| `place` | 点数轴上的位置，标记落到最近的刻度（`snap: ticks`）；托盘 `◀` `▶` 微调一格 | 标记是 `role="slider"`，←→ 一格，Home / End | 拖标记 | 位置 = 目标（刻度吸附时精确；无刻度时容差 ±1/(2d)） |
| `compare` | 点"更大的那个"，或在 `<` `=` `>` 三个钮里选一个；"Line them up / 对齐"把两个模型叠放到同一整体下 | 符号钮 `role="radiogroup"` | 拖一个模型到另一个下面（= 对齐） | 符号正确 |
| `order` | 依次点分数卡（从小到大或从大到小），已选的卡排到下方槽里，点槽里的卡退回 | Tab + Enter | 拖卡进槽 | 顺序正确 |
| `choose` | 点选项（图或分数或一句话），`multi` 时可多选 | `role="radiogroup"` / 多选用 `role="group"` + checkbox | — | 选中集合 = 正确集合 |
| `input` | 托盘里的分数输入：上下两格 + 屏上数字键盘（0–9、⌫，每键 ≥ 44 px）；带分数多一格整数位 | 物理键盘直接打数字，Tab 切格 | — | 等于（`equal`）/ 等值（`equivalent`）/ 必须最简（`simplest`）/ 带分数（`mixed`） |
| `build-sum` | 组合小步：给定量（cold）已涂好 →（相关分母先 `split`）→ 再涂加上的量（signal）或点掉减去的量（墨色斜线）→ `input` 结果 | 各子动作的键盘 | 同各子动作 | 每个子动作各自检查，最后检查结果 |

### 2.2 误解目录（反馈围绕它设计；`MisconceptionCode`）

| code | 误解 | 典型表现 | 反馈要点（样例口吻） | 来源 |
|---|---|---|---|---|
| `unequal-parts` | 只数份数，不看是否相等 | 把切得不均的三块叫三分之一 | "These parts are not the same size, so they are not thirds." | S9、S10 |
| `equal-area-not-same-shape` | 以为相等就必须形状相同 | 正方形沿对角线分的两半不认为是一半 | "Same amount of kueh, different shape. They are still halves." | S9、S10 |
| `part-part` | 分母写成没涂的份数 | 1 份涂、3 份没涂写成 1/3 | "The bottom number counts all the equal parts in the whole, shaded and not shaded." | S11 |
| `swapped` | 分子分母颠倒 | 3/8 写成 8/3 | "The top number counts the parts you have; the bottom counts the parts in the whole." | S11 |
| `bigger-denominator-bigger` | 整数偏差：分母大的分数大 | 认为 1/5 > 1/3 | "More parts in the same whole means each part is smaller." | S6、S7、S8 |
| `different-wholes` | 比较时整体不一样大 | 大蛋糕的 1/4 比小蛋糕的 1/2"多" | "We can only compare fractions of the same whole." | S7 |
| `gap-thinking` | 看"差几份到一整个"比大小 | 认为 2/3 = 3/4（都差一份） | "One missing part out of 3 is a bigger gap than one out of 4." | S13 |
| `compare-numerators-only` | 异分母只比分子 | 3/8 > 1/2 因为 3 > 1 | "The parts are different sizes. Make them the same size first." | S6 |
| `added-denominators` | 加减时分子分母一起加减 | 1/4 + 2/4 = 3/8；1/2 + 1/4 = 2/6 | "Quarters plus quarters are still quarters. Only the number of parts changes." | S6、S17 |
| `not-converted` | 相关分母没先化成同分母 | 1/2 + 1/4 写成 2/4 | "Halves and quarters are different sizes. Turn the half into quarters first." | S5 |
| `additive-equivalence` | 用加法找等值分数 | 3/4 = ?/12 写 11（分母 +8，分子也 +8） | "The parts were cut 3 times smaller, so there are 3 times as many: multiply." | S5、S6 |
| `scaled-one-part` | 只乘 / 除分子或分母之一 | 2/3 → 4/3 或 2/6 | "Cut every part the same way: top and bottom both change." | S5 |
| `not-simplest` | 化简停早了 | 4/12 → 2/6 | "Equal, yes. Can the parts be joined again?"（这是"差一步"，不算误解，单独语气） | S1 1.2 |
| `tick-counting` | 数轴上数刻度线而不是数间隔 | 从 0 开始数刻度，1/4 放到第 2 条线 | "Count the jumps between marks, not the marks." | S5、S12 |
| `whole-changed` | 超过一个整体时把几个整体当一个 | 两条 4 份的条上涂 7 份写成 7/8 | "Each bar is one whole cut into 4. The bottom number stays 4." | S5 |

诊断函数 `diagnose(task, answer)` 是纯函数，每个 code 都有单测（§4.8）。没诊断出来的错答给通用反馈（"Not yet. Look at the model again."）+ 下一级提示。

### 2.3 逐步设计

记号：`[model]` 舞台模型；`→` 孩子的动作；**查** = 检查条件；**陷阱** = 设计进去的误解与它的反馈。口吻样例 EN / ZH 只给代表性的一两句。

#### 第 01 步 `equal-parts` · 一个整体，平均分（P2 1.1）

- 概念：**一个整体**（whole）被分成**相等的部分**（equal parts）才谈得上分数。相等指一样多，不一定一样的形状。
- 1.1 `choose`（multi）：四块千层糕的俯视图：两块等分（其中一块是正方形沿对角线分两半）、两块不等分 → 点出所有"平均分"的。**查**：选中集合正确。**陷阱** `unequal-parts`、`equal-area-not-same-shape`。
  - 引导 EN "Tap every kueh that is cut into equal parts." / ZH「点出所有被平均分的千层糕。」
- 1.2 `fold`：一条纸条 `[bar 未切]` → 点 Fold 一次（2 份）→ 再一次（4 份）。每折一次右上卡写 "2 equal parts · halves 二等份"、"4 equal parts · quarters 四等份"。**查**：4 份。
- 1.3 `cut`：一片 kaya 吐司 `[bar 未切，吸附 1/12]` → 放两条切线切成 3 等份。**查**：三段长度相等（容差半格）。**陷阱**：不等 → 舞台上用尺寸线标出三段长度（"4 · 5 · 3 格"），反馈 `unequal-parts`。
- 例子（演示拍）：在另一片吐司上切 2 等份。

#### 第 02 步 `unit-fractions` · 单位分数（P2 1.1, 1.2）

- 概念：整体分成 n 等份，**其中一份是 n 分之一**（1/n）。符号上：下面（分母）数整体有几份，上面（分子）数取了几份。
- 2.1 `shade`：一张 prata `[circle 4 份]` → 涂一份。右上卡大号写 1/4，引线标"numerator 分子：1 part shaded / denominator 分母：4 equal parts"。
- 2.2 `input`：`[bar 6 份，涂 1]` → 写出分数。托盘先亮分母格（"How many equal parts in the whole?"），再亮分子格（S11 建议先找分母）。**查**：1/6。**陷阱** `part-part`（1/5）、`swapped`（6/1）。
- 2.3 `choose`：哪幅图表示 1/3？选项：正确图、三份不等的图（`unequal-parts`）、四份涂一份（`part-part`：1 份涂 3 份不涂）。
- 例子：1/2 的纸条。

#### 第 03 步 `non-unit-fractions` · 几个这样的部分（P2 1.2）

- 概念：3/8 = 3 个 1/8。n/n = 1 个整体。
- 3.1 `shade`：一排 8 格的巧克力条 `[bar 8]` → 涂 3/8。面板 02 WORKING 随涂写 `1/8 + 1/8 + 1/8 = 3/8`。
- 3.2 `input`：`[circle 6，涂 5]` → 5/6。**陷阱** `part-part`（5/1）、`swapped`。
- 3.3 `shade` + 观察：`[bar 4]` → 涂满 4 份 → 托盘问 "4/4 is the same as ___ whole" → `input` 整数 1。**查**：1。
- 例子：2/5。

#### 第 04 步 `number-line` · 数轴上的分数（P2 1.2 表示法）

- 概念：分数是一个**数**，在 0 和 1 之间有自己的位置；数轴上数的是**间隔**（跳了几步），不是刻度线。
- 舞台：上面一条与数轴等长的纸条（整体 = 0 到 1），下面数轴（工程标尺语法：主刻度 0、1 写数，分刻度只画线）。`N` 模式可在别的步骤里把数轴叠到条下。
- 4.1 `place`：`[numberline 0–1，4 格]` → 放 1/4。纸条同步涂第一份。**陷阱** `tick-counting`：放到第 2 条线（把 0 也当成"1"）→ 舞台把跳跃画成弧线并编号 1、2…
- 4.2 `place`：`[numberline 0–1，5 格]` → 放 3/5。
- 4.3 `input`：`[numberline 0–1，8 格，箭头在第 5 个间隔末]` → 5/8。**陷阱** `tick-counting`（6/9：把 0 和 1 都算进刻度）。
- 例子：在 3 格的数轴上放 2/3。
- 情境：MRT 两站之间的路程分成 8 段相等的路（v1 只在引导语里说，舞台仍是抽象数轴）。

#### 第 05 步 `comparing-fractions` · 比较大小（P2 1.3：单位分数、同分母分数）

- 概念：**同一个整体**下，单位分数分母越大每份越小；同分母分数分子大的大。
- 5.1 `compare`：`[wall 行 = 1, 1/3, 1/5]`（分数墙）→ 1/3 和 1/5 点出更大的。**陷阱** `bigger-denominator-bigger`：舞台把两行的单个格子用 hairline 竖线对齐，量出宽度差。
- 5.2 `order`：1/2、1/8、1/4 从大到小。
- 5.3 `compare`：`[bar 7 ×2，涂 3 与 5]` → 3/7 ○ 5/7 选符号。
- 情境化的"不同整体"陷阱（`different-wholes`）放在练习 Q8 和第 09 步的提示里，不在这里展开（P2 不讲）。
- 例子：1/2 和 1/4 在分数墙上对齐。

#### 第 06 步 `adding-like-fractions` · 同分母分数的加减（P2 2.1）

- 概念：同样大小的份数直接加减，**分母不变**（份的大小没变）。结果在一个整体之内。
- 6.1 `build-sum`：`[bar 7，cold 已涂 2]` → 再涂 3（signal）→ `input` 5/7。**陷阱** `added-denominators`（5/14）："Sevenths plus sevenths are still sevenths."
- 6.2 `build-sum`（减）：`[bar 9，cold 涂 7]` → 点掉 4 份（墨色斜线 + 划掉）→ `input` 3/9。**陷阱** `added-denominators`（3/0）。
- 例子：1/5 + 2/5。面板 02 写 `2/7 + 3/7 = 5/7`，分母下方 hairline 标 "same size parts 同样大的份"。

#### 第 07 步 `equivalent-fractions` · 等值分数（P3 1.1, 1.4）

- 概念：同一个量可以有不同的名字；把每份再平均分（或折），份数和取的份数**同时乘**同一个数。
- 7.1 `fold` + `input`：`[bar 2，涂 1]` 纸条 → 再折一次（4 份，涂的变成 2 份）→ 写下 2/4；再折一次 → 4/8。面板 02 依次写 `1/2 = 2/4 = 4/8`。
- 7.2 `split`：`[bar 3，涂 2]` → 选每份分成几份，得到 8/12（选 ×4）。**陷阱** `scaled-one-part`（只看分母：选了 ×4 后孩子输入 2/12 → "You cut every shaded part too."）。
- 7.3 `input`（两空）：2/3 = ?/12 = 8/?（课纲 1.4：给分母求分子、给分子求分母）。**陷阱** `additive-equivalence`（?/12 填 11 或 8/? 填 9）。
- 例子：1/3 = 2/6 的折纸。
- `E` 模式（显示等值）：在任意 bar 下方用淡 hairline 画出更细的分法和名字。

#### 第 08 步 `simplest-form` · 最简分数（P3 1.2）

- 概念：把份合并到不能再平均合并为止；分子分母同时除以同一个数（公因数）。
- 8.1 `merge`：`[bar 8，涂 6]` → 选"每 2 份合成 1 份"→ 3/4。÷3、÷4 芯片禁用，悬停 / 长按 / 聚焦说明"8 parts can't be joined in threes evenly"（P3 不讲"公因数"一词，名词表里有）。**查**：3/4 且已最简。
- 8.2 `input`（`simplest`）：4/12 的最简分数 → 1/3。**陷阱** `not-simplest`（2/6："Equal, yes. Can you join the parts again?"，可再试，不计错）。
- 8.3 `choose`：哪个已经是最简分数？3/9、5/8 ✓、6/10、4/6。
- 例子：2/4 → 1/2。

#### 第 09 步 `comparing-unlike` · 异分母分数的比较与排序（P3 1.3）

- 概念：份的大小不同就先**化成同样大小的份**（同分母，用等值分数），再比；P3 的分母 ≤ 12。
- 9.1 `compare`：2/3 ○ 3/4 → 先点"Make the same size parts / 化成同样大的份"（`split` 两个条都到 12 份）→ 8/12 < 9/12 → 选 `<`。**陷阱** `gap-thinking`（选 `=`）、`compare-numerators-only`。
- 9.2 `compare`：5/6 ○ 7/12（相关：只化一个）→ `>`。
- 9.3 `order`：1/2、3/8、3/4 从小到大，配一条八等分数轴：排完后三个点落到轴上，读者看到位置。**陷阱** `compare-numerators-only`（排成 1/2、3/4、3/8 或 3/8、3/4、1/2 等，诊断看是否按分子排）。
- 例子：1/2 ○ 3/5 化到十分之几。
- 提示里提一次 `different-wholes`："Both bars are the same length — the same whole."

#### 第 10 步 `adding-related` · 分母有倍数关系的分数相加（P3 2.1）

- 概念：**相关分数**（一个分母是另一个的倍数）相加：把较大的份化成较小的份，再加；结果在一个整体之内，写成最简分数（D7）。
- 10.1 `build-sum`：1/2 + 1/4 → `[bar 2，cold 涂 1]` → 先 `split` ×2 → 再涂 1 份 → `input` 3/4。**陷阱** `added-denominators`（2/6）、`not-converted`（2/4）。
- 10.2 `build-sum`：1/3 + 5/12 → 化 1/3 = 4/12 → 9/12 → 最简 3/4（`not-simplest` 语气：先认对，再请合并）。
- 10.3 `input` + `barmodel`（部分–整体模型）：「Aisha 用了一条丝带的 3/10 打蝴蝶结，又用了 2/5 做书签。她一共用了这条丝带的几分之几？」→ 7/10。舞台画一条整体丝带的 bar model：两段（cold 3/10、signal 2/5），上方大括号"?"。孩子可点"Split into tenths / 化成十分之几"让第二段显出 4 格。
- 例子：1/2 + 3/8。

#### 第 11 步 `subtracting-related` · 分母有倍数关系的分数相减（P3 2.1）

- 11.1 `build-sum`（减）：7/8 − 1/2 → 1/2 化成 4/8 → 划掉 4 份 → 3/8。**陷阱** `added-denominators`（6/6）、`not-converted`（6/8）。
- 11.2 `input` + `barmodel`（部分–整体）：「一个斑兰蛋糕平均切成 12 块，吃掉了 5/12，还剩几分之几？」→ 7/12（1 = 12/12）。
- 11.3 `input` + `barmodel`（**比较模型**，两条等长 bar）：「两瓶一样大的水，Ravi 喝了 3/4 瓶，Wei Jie 喝了 5/8 瓶。Ravi 比 Wei Jie 多喝了几分之几瓶？」→ 1/8。舞台：两条等长 bar 上下对齐，差的那段用 hairline 双箭头标"?"。
- 例子：3/4 − 1/8。

#### 第 12 步 `mixed-numbers` · 超过一个整体（P4 1.1，桥，可选）

- 概念：超过 1 的分数有两种写法：假分数 7/4、带分数 1 3/4；**每个整体的份数不变**。
- 12.1 `shade` + `input`（`mixed`）：`[bar 4 ×2]` → 涂 7 份 → 写成带分数 1 3/4，再写成假分数 7/4。**陷阱** `whole-changed`（7/8）。
- 12.2 `place`：`[numberline 0–3，每个整体 3 格]` → 放 2 1/3。
- 12.3 `input`：11/4 写成带分数 → 2 3/4。**陷阱**：2 3/11 等（`whole-changed`）。
- 阅读面板头部写一句"This is P4 work. Try it if you like."（措辞施工时定）。

#### （备选）`fraction-of-a-set` · 一组物体的几分之几（P4 2.1，D2）

- `[set 12 个橘子]` → 平均分成 4 组（点"Make 4 equal groups"，橘子排成 4 列）→ 涂 1 组 = 1/4 = 3 个。陷阱：分母写成物体个数而不是组数（"3/12 is also right — 3 of 12 oranges. Grouping shows it is 1/4."）。只有 D2 选了才建 `set` 模型（不留死代码）。

### 2.4 小步与时间预算

| 步 | 小步 | 估时（P3 孩子） |
|---|---|---|
| 01–06（P2 地基） | 17 | 8 min（P3 孩子做得快） |
| 07–11（P3） | 15 | 9 min |
| 12（桥） | 3 | 3 min |
| 13 练习 | 8 | 5 min |
| 合计 | 43 | 25 min |

每小步：读题 ~6 s + 操作 10–20 s + 读反馈 ~4 s。例子（演示拍）默认不自动播，所以不计入；孩子主动看例子另加时间。

## 3. 练习章 `practice`

8 题混合题型，覆盖 P2 + P3（桥不进练习）。每题**一次计分**：Check 之后立刻反馈并在模型上画出正确答案（墨色虚线），不能改；"Next / 下一题"。无计时、无连胜、无星。

| # | 题型 | 题目（样例） | 正确 | 干扰项 → 诊断 | 回看 |
|---|---|---|---|---|---|
| Q1 | `shade` | 一盘 kaya 吐司切成 8 块，涂出 3/4 | 涂 6 块（`equivalent`） | 涂 3 块 → `scaled-one-part`（"You shaded 3/8. Each quarter is 2 eighths."）；涂 4 块 → `part-part` 类通用 | 07 |
| Q2 | `choose` | 哪一个等于 2/3？ 4/6 · 3/4 · 2/6 | 4/6 | 3/4 → `additive-equivalence`；2/6 → `scaled-one-part` | 07 |
| Q3 | `compare` | 3/4 ○ 5/8 | `>` | `<` → `compare-numerators-only`；`=` → `gap-thinking` | 09 |
| Q4 | `input`（`simplest`） | 把 8/12 写成最简分数 | 2/3 | 4/6 → `not-simplest`（这题计"差一步"，不算对；反馈语气照旧平静）；4/12、8/6 → `scaled-one-part`（只除了分子或分母之一） | 08 |
| Q5 | `place` | 数轴 0–1 分成 8 格，标出 3/4 | 第 6 格 | 第 3 格（3/8）→ `scaled-one-part`；第 4 格 → `tick-counting` | 04、07 |
| Q6 | `input`（`simplest`） | 5/6 − 1/3 = ? | 1/2 | 4/3 → `added-denominators`；4/6 → `not-converted`；3/6 → `not-simplest` | 11 |
| Q7 | `input` + `barmodel` | 「一个斑兰蛋糕，Aisha 吃了 1/6，她弟弟吃了 5/12。他们一共吃了几分之几？」 | 7/12 | 6/18 → `added-denominators`；6/12 → `not-converted` | 10 |
| Q8 | `choose`（解释为什么，带模型） | 「Wei Jie 说 1/5 比 1/3 大，因为 5 比 3 大。他对吗？选出能说明理由的图和话。」 | 图 A（同长两条，1/3 那格更宽）+ "No. The same whole cut into more parts gives smaller parts." | 图 B（两条长度不同，1/5 那格看起来更宽）→ `different-wholes`；"Yes, 5 is more than 3" → `bigger-denominator-bigger`；"They are equal, both are one part" → `gap-thinking` | 05 |

- **反馈**：对 → "Yes." + 一句为什么；错 → "Not quite." + 诊断句 + 模型上画出正确状态 + "See step 07 / 回看第 07 步"小按钮（跳到那一步的相应小步，练习进度保留在内存）。
- **总结页**（第 8 题后）：hairline 表格，每题一行（题号、题型、✓ / ○、回看的步骤按钮）；上方一句"You got 6 of 8. Have another look at steps 07 and 09." / "8 题里做对了 6 题。可以再看看第 07 步和第 09 步。"；"Try again / 再做一次"清空重来（同一组题，D3）。全对时只写"You got all 8."，不加感叹号和奖励。
- 练习里**辅助模式关闭**（F 符号、E 等值、N 数轴、L 标注禁用并在状态行写 `PRACTICE · ASSISTS OFF`）；提示仍可用但每题只有 1 级，用了提示不扣分（不记录）。
- 不存档：离开页面或刷新即清；URL 只有 `?ch=practice&task=4`，不含作答。

## 4. 引擎设计：`math-scene`

### 4.1 位置与注册

- 目录 `src/engines/math-scene/`：`index.ts`（descriptor）、`schema.ts`（zod，构建期）、`View.tsx`、`stage/`、`tray/`、`hud/`、`practice/`、`lib/`、`math-scene.css`。
- `content/schema/topic.ts`：`ENGINES` 加 `'math-scene'`，`ENGINE_STAGES['math-scene'] = ['svg']`；`mode` 枚举加 `'lesson'`；索引页 `typeKeys` 加 `type.lesson`（"Lesson / 课"），`ui.*.json` 补键。
- `registry.ts` / `schemas.ts` 各加一行；`schemas.ts` 的 `math-scene` 项：`requiredFiles: ['lesson']`、`ids`（步、小步、练习题 id）、`chapterIssues`（章与步一一对应，见 §4.10）、`presetIds: () => []`。
- `topic.yaml`：

```yaml
id: fractions
title: { en: Fractions, zh: 分数 }
subtitle: { en: Equal parts, equivalent fractions and adding related fractions, zh: 平均分、等值分数与分母有倍数关系的分数相加减 }
subject: math
levels: [P2, P3, P4]
moe: ["MOE 2021 P2 Fractions 1–2", "MOE 2021 P3 Fractions 1–2", "MOE 2021 P4 Fractions 1 (bridge)"]
mode: lesson
engine: math-scene
stage: svg
note: { en: "Interactive lesson · aligned to the MOE 2021 syllabus", zh: "交互课 · 对照 MOE 2021 课纲" }
status: draft
```

### 4.2 数据模型（`data/lesson.json`，zod 在 `schema.ts`）

分数在数据里写字符串，schema 解析成结构：`"3/4"` → `{ n: 3, d: 4 }`，`"1 3/4"` → `{ w: 1, n: 3, d: 4 }`，`"1"` → `{ n: 1, d: 1 }`。正文 / 数据文本里的 `{3/4}` 是排版记号（竖排分数，朗读成"three quarters / 四分之三"）。

```ts
type Frac = { w?: number; n: number; d: number };          // from "3/4" | "1 3/4" | "2"
type Bilingual = { en: string; zh: string };                 // 可含 {a/b} 记号

interface Lesson {
  syllabus: { id: string; level: 'P2'|'P3'|'P4'|'P5'; ref: string; text: Bilingual; source: string }[];  // ref "P3 1.3"，text = MOE 原文 + 中文
  steps: Step[];
  practice: Question[];
}

interface Step {
  id: string;                    // = 章节 id（一一对应）
  lo: string[];                  // syllabus id
  bridge?: boolean;              // P4 桥（规格表、阅读面板眉题写 BRIDGE · P4）
  views?: ModelView[];           // 本步允许的模型切换（VIEW 组），缺省 = 第一个小步模型的 kind
  tasks: Task[];                 // 2–4 个
}

type ModelView = 'bar' | 'circle' | 'numberline' | 'wall' | 'barmodel' | 'set';

type Model =
  | { kind: 'bar'; parts: number | null; shaded?: number | number[]; given?: number | number[];
      wholes?: number;            // 2–3 = 多个整体（桥）
      length?: number;            // 相对整体长度，默认 1（different-wholes 题用 0.6）
      rows?: Omit<Extract<Model, {kind:'bar'}>, 'rows'>[];  // 叠放（比较、对齐）
      object?: 'strip' | 'toast' | 'kueh' | 'chocolate' | 'ribbon' | 'bottle'; label?: Bilingual }
  | { kind: 'circle'; parts: number; shaded?: number | number[]; given?: number | number[];
      object?: 'plain' | 'prata' | 'cake'; label?: Bilingual }
  | { kind: 'numberline'; from: number; to: number; intervals: number;   // 每个整体的间隔数
      labels: 'ends' | 'wholes' | 'all' | 'none'; marks?: Frac[]; arrow?: Frac; withBar?: boolean }
  | { kind: 'wall'; rows: number[] }                          // 分母列表，如 [1, 2, 3, 4, 6, 12]
  | { kind: 'barmodel'; type: 'part-whole' | 'comparison';
      bars: { id: string; label: Bilingual; length: Frac;
              segments: { value: Frac; tone: 'cold' | 'hot' | 'signal' | 'ink'; label?: Bilingual; unknown?: boolean }[] }[];
      brace?: { bar: string; from: Frac; to: Frac; label: Bilingual } }
  | { kind: 'set'; count: number; object: 'orange' | 'kueh' | 'egg' | 'marble'; groups?: number };   // 仅 D2

type Task =
  | Base & { kind: 'shade'; target: Frac; accept: 'exact' | 'equivalent' }
  | Base & { kind: 'cut'; parts: number; snap: 12 | 24 }
  | Base & { kind: 'fold'; parts: 2 | 4 | 8; then?: InputSpec }
  | Base & { kind: 'split' | 'merge'; factors: number[]; target: Frac; then?: InputSpec }
  | Base & { kind: 'place'; target: Frac; snap: 'ticks' | 'free'; tolerance?: number }
  | Base & { kind: 'compare'; a: Frac; b: Frac; ask: 'symbol' | 'greater' | 'smaller'; align?: 'split' | 'stack' }
  | Base & { kind: 'order'; items: Frac[]; direction: 'asc' | 'desc'; line?: boolean }
  | Base & { kind: 'choose'; multi?: boolean; options: Option[] }
  | Base & { kind: 'input' } & InputSpec
  | Base & { kind: 'build-sum'; op: '+' | '-'; a: Frac; b: Frac; convert?: number; answer: InputSpec };

interface InputSpec { answer: Frac | Frac[]; form: 'equal' | 'equivalent' | 'simplest' | 'mixed' | 'whole';
                      blanks?: ('n' | 'd' | 'w')[] }          // 7.3 两空：?/12 与 8/?

interface Option { id: string; value?: Frac; model?: Model; text?: Bilingual; correct: boolean; misconception?: MisconceptionCode }

interface Base {
  id: string;                    // 全主题唯一
  model: Model;
  prompt: Bilingual;             // 托盘里的一句题（≤ 15 词 / 30 字）
  guide: Bilingual;              // 阅读面板 inspector 的"怎么想"（2–3 句）
  hints: Bilingual[];            // 1–3 级
  feedback: {
    correct: Bilingual;          // 带"为什么"
    wrong: { when: MisconceptionCode; say: Bilingual }[];
    fallback: Bilingual;         // 没诊断出时
    reveal: Bilingual;           // "看答案"时的说明
  };
  example?: { model: Model; target: unknown; say: Bilingual[] };   // 例子：另一组数字；每句 = 一拍
  minutes?: number;              // 时间预算（验收汇总用）
}

interface Question { id: string; revisit: string[];  /* 步骤 id */  task: Task /* 同 Task，但 hints ≤ 1、无 example */ }
```

- **章节 MDX = 一步**：章 id = 步 id；frontmatter `state` 只放 `summary`（阅读面板头部一句）、可选 `model`（本章默认模型视图）、练习章 `practice: true`、背景章 `note`。正文 = 本步的"讲解"（EN 80–140 词 / ZH 150–250 字），可用 `<Frac>`、`<Task>`、`<Term>`、`<More>`。
- **拍（演示）不写在 frontmatter**：由数据推出（§4.7），所以作者只维护一处。
- 不放答案在客户端之外的地方：答案就在 `data.json` 里（纯静态站，无法也无需隐藏），这一点在 D4 说明。

### 4.3 舞台（`stage/`，SVG）

- 一个 `<svg>` 铺满舞台区，viewBox 按模型自适应（横向 bar / 数轴；circle 居中；手机竖屏 bar 改成更粗更短、必要时两行）。不用 canvas、不用 WebGL；动画用 rAF 小补间（`lib/tween.ts`，零依赖），`prefers-reduced-motion` 时直接落位。
- **技术图版语法**：纸底、墨色 hairline 轮廓；整体上方一条尺寸线（两端箭头 + "1 whole / 1 个整体"）；分刻度只画短线；部分标注用引线（`L` 模式：每份写 1/n）；物件（吐司、千层糕、prata、丝带、水瓶）画成**正投影线稿**（轮廓 + 少量结构线，如千层糕的层线），不画卡通、不画表情、不上渐变。
- **颜色**（只用 token）：孩子的涂色 = `--signal`（填色 .55 + 细边）；题目给定的量 = `--cold`；比较时的第二个量 = `--hot`（与 signal 同时出现时，孩子的标记另加 45° 细斜线以区分，色弱也能读）；减掉的份 = 墨色 45° 斜线 + 删除线；"看答案"的正确状态 = 墨色虚线轮廓；对 / 错不用红绿：对 = 符号淡入 + 一次 signal 轮廓脉冲，错 = 无色，只有文字。
- **部件**（每个都有点按、键盘、可选拖动三条路径）：
  - `BarModel`：份是 `<g role="button" tabindex>`，`aria-label` "Part 3 of 8, shaded"；切线；对折动画（纸条沿中线翻折 180°，背面印淡色，折痕 hairline 留下）；split / merge 动画（份内出现 / 消失细分线，涂色跟着分）；多行叠放与"对齐"。
  - `CircleModel`：扇形份，从 12 点钟方向顺时针；同样的 role / label。
  - `NumberLine`：标尺语法；标记是 `role="slider"`（`aria-valuetext` "3 quarters"）；跳跃弧线（`tick-counting` 反馈时显示编号）；可选上方对齐的纸条。
  - `FractionWall`：等宽多行，单位分数的格；对齐竖线工具。
  - `BarModelDiagram`：部分–整体（一条 bar + 段 + 大括号 "?"）与比较模型（两条 bar 左对齐 + 差段双箭头）。数值未知的段写 "?"。
  - `SetModel`（仅 D2）：物件网格 → 分组动画。
- **VIEW 组 = 模型切换**（不是镜头）：`BAR 1` · `CIRCLE 2` · `LINE 3`（必要时 `WALL 4`）；只列本步 `views` 允许的；切换后同一个分数换一种表示（涂色同步）。练习中不可切。需要 core 支持"引擎自己决定哪个预设亮着"（§4.11 C2）。
- **模式**（控制面板 TOOLS，字母键；状态行显示）：

| 键 | 模式 id | 作用 | 何时禁用 |
|---|---|---|---|
| S | `symbol` | 在模型旁写出当前分数（大号竖排） | 练习 |
| E | `equivalent` | 在模型下方淡显更细分法与名字（2/4、3/6…） | 练习；circle 以外的模型照常 |
| N | `numberline` | 在 bar 下方叠一条对齐的数轴 | 练习；模型已是数轴 |
| L | 宿主 `labels` | 每份标 1/n | 练习 |
| P | `presentation` | 演示（§4.7） | — |

- **命令**（一次性动作，不是开关；需要 core 的命令注册 §4.11 C3）：`C` 检查、`I` 提示（idea）、`U` 撤销上一步标记、`W` 看例子、`Enter`（焦点在托盘内时）= 检查。`H` 仍是隐藏 HUD。

### 4.4 作答托盘（`tray/`）

舞台底部居中一块 hairline 纸卡（`data-hud-panel="task"`，宽 ≤ 760 设计 px，手机全宽），属于舞台而不是 HUD（`H` 隐藏 HUD 时仍在，演示时也在）：

```
┌ 07 · 2 / 3   Cut every part into the same number of pieces to get 8/12.        [Watch an example] ┐
│  [×2] [×3] [×4]          或   ┌─┐                                                          │
│                               │8│   ◀ 数字键盘 0–9 ⌫ ▶                                           │
│                               ├─┤                                                          │
│                               │?│                                                          │
│  Not yet. You cut the shaded parts, so cut every part the same way.                 [Show me] │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

- 第一行：步号 · 小步序号 · 题目一句（`prompt`）· "看例子"。
- 中间：本小步需要的作答控件（分数输入 + 屏上键盘 / 符号三钮 / 选项格 / 排序槽 / 芯片 / `−` `+`）。
- 末行：反馈一句（`aria-live="polite"`）+ "Show me / 看答案"（第二次不对后出现）+ "Next / 下一题"（对了以后实心 signal，否则 hairline）。
- 托盘区域 `data-keys="own"`：在里面打数字、Enter 都归托盘；方向键在芯片 / 符号组里由 radiogroup 处理。
- 手机：托盘全宽贴在底部条上方，题目一句 + 控件，反馈一句；右上卡与三面板在手机上隐藏，所以托盘第一行右侧多一个小读数（当前分数，如 `3/8`）。

### 4.5 HUD 插槽

| 插槽 | 内容 |
|---|---|
| 顶栏 | 章节芯片 `BG 01 … 12 13`（13 = 练习，芯片写 `PR`？——见 D8，默认照常写 13）；VIEW 组 = 模型切换；`▶ PRESENT 演示` |
| 状态行 | `ATL-FRACTI-07 · MODEL BAR · TASK 2/3 · SHADED 4/12 · EQUIVALENT`；练习 `ATL-FRACTI-13 · PRACTICE 4/8 · ASSISTS OFF` |
| 标题块规格行 | STEPS 12 · TASKS 35 · PRACTICE 8 · SYLLABUS MOE 2021 · LEVELS P2–P3 (+P4) · DENOMINATORS ≤ 12（`source: 'ref'`，来源芯片指 S1） |
| `card`（右上卡 "FRACTION 分数"） | **大号竖排分数**（mono，分子 / 分数线 / 分母），左右引线标 "NUMERATOR 分子 · parts taken 取的份数" / "DENOMINATOR 分母 · equal parts in the whole 整体平均分的份数"；下面一行"in words"：three eighths / 八分之三；比较小步变成 `a ○ b` 两个分数并排；加减小步写成竖式 `1/2 + 1/4 = 2/4 + 1/4 = ?`。`cardToggle` 展开后多一行：等值的名字（2/4 = 3/6 = 6/12）与最简分数 |
| `panel01` "HISTORY 做过的" | 本步每个动作的缩略图（最多 6 个，最新在右）：折一次、涂一份、化成 12 份……每个缩略图是同一模型的迷你 SVG + 一行 mono 说明（`FOLD → 4`、`SHADE 3/8`）；点缩略图 = 回放到那一状态（只看，不改答案） |
| `panel02` "WORKING 算式" | 抽象一栏：随操作写出的算式（`1/8 + 1/8 + 1/8 = 3/8`、`2/3 = 8/12`、`8/12 ÷ … = 2/3`），按 CPA 的 A；检查对了以后最后一行加墨色下划线 |
| `panel03` "STATE 状态" | 读数表：PARTS 12 · SHADED 8 · VALUE 8/12 · SIMPLEST 2/3，外加一条 0–1 小位置条（不写小数，P3 不讲）；比较时两列；练习时只有 QUESTION 4/8 · ANSWERED 3 |
| `bottomBar` | 见下 |
| `inspector`（阅读面板里） | 本小步的 `guide`（怎么想）、已展开的提示列表、最近一次反馈的完整说明（含误解解释）、"看答案"后的 `reveal` |
| `stageOverlay` | 控制面板：TOOLS（S / E / N / L / P / 隐藏界面 / 名词）、KEY（颜色图例：你涂的 · 给定的 · 第二个量 · 拿走的 · 正确答案） |
| `perf` | `SVG · 48 NODES · 60 FPS`（安静读数） |

**底部条**（与 TimeScene 分段时间轴同一语法，docs/08 §5）：

```
[◁ Back]  ○○○│○○○│○○○│○○○│○○○│○○│●◉○│○○○│…│○○○│ ▪▪▪▪▪▪▪▪   STEP 07 · TASK 2/3    [Hint 提示 I] [Check 检查 C]
          01   02  03  04  05  06  07  08      12   13
```

- 每个课步一段（等宽），段下写步号；段里每个小步一个 7 px 空心圆刻度；做完的小步填墨色，当前小步 signal 实心，当前段 signal 轨。练习段的刻度是 8 个小方块（对 = 墨、未对 = 空心描边，**不用颜色区分对错以外的意思**）。
- 点段 = 进那一步第一小步；点刻度 = 那一小步（`aria-label`「第 7 步第 2 题：把每份再分」）。手机只画段。
- 右侧：状态串 + **Hint**（hairline，`I`）+ **Check**（作答后变实心 signal，`C`；没作答时禁用并在 title 说明）。这两个按钮与托盘里的 Enter、演示字幕卡上的按钮是同一组命令。
- 手机：底部条保留（段 + 两个按钮），状态串隐藏。

### 4.6 交互、键盘与无障碍

- **全部可点完成**：每种 `task.kind` 都有纯点按路径（§2.1 表）；拖动只是快捷方式。没有悬停才出现的必要信息（禁用芯片的说明也在聚焦 / 长按时出现，并写进托盘反馈）。
- **键盘**：Tab 走"模型的份 → 托盘控件 → Hint → Check"；份与标记用 roving tabindex，方向键在模型内部移动（模型 `<g>` 带 `data-keys="arrows"`，宿主把 ← → 让给它，§4.11 C6；不在模型里时 ← → 照常换步）；Shift + ← → = 上 / 下一小步（引擎自己监听，与 TimeScene 的 Shift 微调不冲突，因为引擎不同）；Enter / 空格切换涂色；数字键在托盘内输入，托盘外数字键仍是 VIEW 预设。
- **触控**：所有可点目标 ≥ 44 px。bar 份宽 < 44 px（手机上 d ≥ 9）时：份仍可点（命中区高 ≥ 44 px、宽为实际宽，相邻份不重叠），**同时**托盘显示 `−` / `+`（"少涂一份 / 多涂一份"，从左往右涂）作为合规路径；数轴标记有 `◀` `▶`；切线有"Add a cut / 加一刀"按钮在当前光标处放线。
- **读屏**：舞台 `<svg role="group" aria-label="Bar, 8 equal parts, 3 shaded">`；每次状态变化在托盘的 live 区读一句（"3 of 8 parts shaded"）；分数读成文字（`lib/words.ts`：en "three eighths"，zh「八分之三」；带分数 "one and three quarters / 一又四分之三"）。
- 不依赖颜色：涂色 + 斜线 / 描边区分三类标记；对错只用文字和 ✓ / ○ 符号。

### 4.7 演示（PRESENTATION，core `usePresentation(adapter)`）

演示 = 有人带着走一遍（"guided walk-through"），拍由数据推出：

- 每个小步展开成：**例子拍** × k（`example.say` 每句一拍：引擎在例子模型上自动执行解法的一段，如"折一次""涂三份"，字幕同时淡入）+ **你来做拍** × 1（舞台换成本题模型，字幕 = `prompt`，落定后输入层撤掉，孩子在舞台上作答）。没有 `example` 的小步只有"你来做拍"。
- 一章的拍 = 各小步的拍顺序拼接；字幕卡表头 `07 / 12 · Equivalent fractions · TASK 2/3 · 3 / 7`（`readout` = 小步序号）。
- 适配器：`beatsOf(chapter)` 从 `lesson.json` 生成；`captionOf` 返回**朗读用**纯文本（分数记号转成文字）；`applyBeat` 例子拍 = 重置例子模型并播放解法动作序列（`lib/solve.ts` 生成，与 `__atlas.engine.solve()` 同一函数），你来做拍 = 摆好本题模型、清空作答；`afterCameraSettle` = 动作播放完；`saveState / restoreState` = 章、小步、模型视图、模式（作答不保存）。
- 你来做拍需要 core 两处扩展（§4.11 C4）：字幕卡里放 **Check / Hint / Show me** 按钮（演示时 HUD 隐藏，底部条看不到）；自动播放在你来做拍**等孩子做对（或按了看答案）**才开始计时。点舞台不翻页（core 已如此），所以孩子在舞台上涂、点不会误翻。
- 语音：读字幕；分数读成"three quarters / 四分之三"。
- 练习章在演示里每题一拍（只有你来做拍），总结页一拍。

### 4.8 检查是纯函数（`lib/fraction.ts`、`lib/checks.ts`、`lib/diagnose.ts`、`lib/solve.ts`）

```ts
// fraction.ts —— 全部整数运算，不用浮点比较
gcd(a, b); lcm(a, b);
simplify(f): Frac; isSimplest(f): boolean;
equal(a, b): boolean;          // 同分子同分母（写法也相同）
equivalent(a, b): boolean;     // a.n * b.d === b.n * a.d（带分数先化假分数）
compare(a, b): -1 | 0 | 1;
add(a, b), sub(a, b): Frac;    // 结果按最简
related(a, b): boolean;        // 一个分母是另一个的倍数
toMixed(f), toImproper(f);
valueOnLine(f, line): number;  // 数轴上的位置（单位：间隔）

// checks.ts —— 每种 task.kind 一个，统一返回
type Result = { ok: boolean; code: MisconceptionCode | null; near?: 'not-simplest' };
checkShade(state: { parts: number; shaded: number[]; wholes?: number }, task): Result;
checkCut(cuts: number[] /* 网格位置 */, task): Result;       // 段长相等（整数格，容差 = 0 格；snap 24 时 ≤ 1 格）
checkFold(parts: number, task): Result;
checkSplitMerge(state, task): Result;
checkPlace(pos: number /* 间隔数 */, task): Result;          // ticks: 精确；free: |pos − target| ≤ tolerance
checkCompare(symbol: '<' | '=' | '>' | 'a' | 'b', task): Result;
checkOrder(ids: string[], task): Result;
checkChoose(selected: Set<string>, task): Result;
checkInput(value: Partial<Frac>, task): Result;              // form: equal / equivalent / simplest / mixed / whole
checkBuildSum(stage: 'convert' | 'mark' | 'input', state, task): Result;

// diagnose.ts —— 由错答推出误解（checks 内部调用，也单独导出供测试）
diagnose(task, answer): MisconceptionCode | null;

// solve.ts —— 正确解法的动作序列（演示的例子拍、__atlas.engine.solve()、单测共用）
solve(task): Action[];         // [{ do: 'fold' }, { do: 'shade', part: 2 }, { do: 'input', value: '3/4' }, …]
apply(model, actions): ModelState;
```

单测（`tests/math-scene/`）：
- `fraction.test.ts`：运算、等值、比较、最简、相关、带分数互化（含边界：n = 0、n = d、d = 12）。
- `checks.test.ts`：每个 check 的对 / 错 / 近对（not-simplest）。
- `diagnose.test.ts`：§2.2 每个 code 至少两例正例、一例反例。
- `lesson.test.ts`（读真实 `lesson.json`）：**每个小步与练习题**：`check(apply(model, solve(task)))` 为对；每个 `choose` 干扰项与每条 `feedback.wrong[].when` 都能构造出对应错答并被 `diagnose` 诊断成那个 code、且 check 为错；P2 / P3 步骤分母 ≤ 12、加减结果 ∈ [0, 1]；`related` 小步的两个分母确实相关。这是"练习对每个干扰项的反馈都正确"的自动化证明。
- `words.test.ts`：分数读法 en / zh（1/2 one half 二分之一、1/4 one quarter 四分之一、3/4 three quarters、5/12 five twelfths、1 3/4 one and three quarters 一又四分之三）。

### 4.9 状态：URL、内存、不保存的东西

| 状态 | 位置 | 说明 |
|---|---|---|
| 当前步 | URL `ch` | 通用 |
| 当前小步 | URL `task`（1 起；= 1 时不写） | 新 key（`UrlEngineFields.task`），descriptor `fromUrl` 校验范围 |
| 模型视图 | URL `model`（`bar` / `circle` / `numberline` / `wall`；= 小步默认时不写） | 新 key |
| 模式 | 宿主模式状态（不进 URL，与其它引擎一致） | — |
| 作答、涂色、尝试次数、提示级、反馈 | 引擎内存（zustand，引擎自己的 store） | 进入小步时清空；已做完的小步回去时显示做对的状态 |
| 哪些小步做完、练习每题对错 | 引擎内存 | 底部条填色、练习总结用；刷新即清（D6） |
| 主题、语言、阅读面板收起等 | 宿主既有规则 | — |

**孩子的作答永远不进 URL、不进 localStorage / sessionStorage。**

### 4.10 校验规则（`pnpm validate`，`schemas.ts` 的 `math-scene` 项 + `chapterIssues`）

1. `lesson.json` 按 schema 解析；分数字符串合法（分母 1–12，桥步分母 ≤ 12、整体数 ≤ 3）。
2. 章 ↔ 步一一对应：每个非背景、非练习章的 id 都是一个 `step.id`，每个步都有章；练习章 `state.practice: true` 有且只有一个、`order` 最大。
3. 所有 id（步、小步、选项、练习题）kebab-case、全主题唯一（与章节 id 不冲突时可同名：步 id = 章 id 是约定，豁免）。
4. 每步 `lo` 引用的 `syllabus.id` 存在；`syllabus` 每条有 `source`（S 编号，在 `sources.json` 里）。
5. P2 / P3 步骤（`bridge` 以外）：所有分母 ≤ 12；加减小步结果在 [0, 1]；`adding-related` / `subtracting-related` 的两个加数分母相关。
6. 每个小步：`target` 落在模型里能表示的范围（`shade` 的 n ≤ parts × wholes；`place` 的目标在 [from, to] 且在刻度上（`snap: ticks`）；`split` 的 target 能由 `factors` 之一得到；`merge` 的 target 是最简）。
7. `feedback.wrong[].when` 是已知 code；同一小步不重复；`choose` 的每个错选项都有 `misconception`，且该 code 在 `feedback.wrong` 里有一句。
8. `hints` 1–3 条（练习题 ≤ 1）；`prompt` 长度 EN ≤ 120 字符、ZH ≤ 40 字（超了 warning）。
9. 练习：6–10 题，`revisit` 引用存在的步；题型至少 5 种不同 `kind`。
10. 双语：所有 `Bilingual` en 必填（error）、zh 缺 warning；文本里的 `{a/b}` 记号合法。
11. 正文 `<Task id>` 引用存在的小步；`<Frac>` 的 n、d 是正整数。
12. `sources.json` / `glossary.json` 规则沿用通用校验。

### 4.11 core 缺口与新增（施工前先做；都是小改，两个旧引擎不受影响）

| # | 缺口 | 改动 | 文件 |
|---|---|---|---|
| C1 | 引擎 id、stage、主题形态 | `ENGINES` 加 `math-scene`，`ENGINE_STAGES` 加 `svg`，`mode` 加 `lesson`，索引页类型徽章 `type.lesson` | `content/schema/topic.ts`、`registry.ts`、`schemas.ts`、`pages/[locale]/index.astro`、`i18n/ui.*.json` |
| C2 | VIEW 组由引擎决定哪个亮（模型切换不是镜头） | `presets.current?: string \| null`：给了就以它为准，宿主不跟踪 `cameraFree`、不调 `applyCameraPreset`；状态行写 `MODEL BAR` | `core/controls.ts`（`activePreset`）、`Hud.tsx` |
| C3 | 一次性命令（检查、提示、撤销、看例子）要有键位和按钮共用 | `SceneControls.commands?: { id, key?, label, disabled?, run() }[]`；`keys.ts` 处理；`keymap()` 类型加 `'command'`；`__atlas.commands()` / `runCommand(id)`；按钮带 `data-command` | `core/controls.ts`、`keys.ts`、`test-api.ts` |
| C4 | 演示里作答 | 适配器可选 `cardActions?: ReactNode`（字幕卡右下的按钮区，按钮点击不算"原地点一下翻页"）、`renderCaption?(beat, locale): ReactNode`（排版用；`captionOf` 仍给朗读）、`gate?(beat): Promise<void> \| null`（自动播放在它 resolve 后才开始计时） | `core/presentation/adapter.ts`、`Presentation.tsx`、`usePresentation.tsx`、`autoplay.ts` |
| C5 | URL 新字段 | `UrlEngineFields.task?: number`、`model?: string`；`url-state.ts` 编解码 + `URL_KEY_ORDER`；`SceneHost.tsx` 解构；`tests/url-state.test.ts` | `core/types.ts`、`url-state.ts`、`SceneHost.tsx` |
| C6 | 模型内部用方向键 | `OWN_ARROW_KEYS` 加 `[data-keys="arrows"]`（只让出方向键，其它宿主键照常） | `core/keys.ts` |
| C7 | 引擎专属测试 API | `SceneControls.test?: Record<string, (...a: unknown[]) => unknown>`，挂到 `__atlas.engine.*`：`task()`（{ step, index, kind, answered, done, tries }）、`tasks()`、`goToTask(step, i, { instant })`、`solve()`、`answer(code \| 'correct')`、`practice()`（{ index, score, results }） | `core/test-api.ts` |
| C8 | `pnpm shoot` 认识课步 | `--tasks`：每个小步三张（`task-<step>-<n>`、`-solved`、`-wrong`（用第一个 `feedback.wrong` 的 code 构造））；练习每题一张 + `practice-summary`；`--keys` 增加命令（C / I / U / W）核对 `__atlas.engine.task()` 的变化；`--layout` 把 `[data-hud-panel="task"]` 纳入重叠检查 | `scripts/shoot.ts`、`tests-e2e/hud-layout.ts` |
| C9 | 正文组件 | `<Frac n d [w]>`（静态竖排分数，`aria-label` 读文字）、`<Task id>`（hairline 按钮，跳到那一小步；SceneHost 委托点击，同 `<FlyTo>`）；校验见 §4.10-11 | `components/mdx/`、`pages/[locale]/topics/[slug].astro`、`SceneHost.tsx`、`scripts/validate-content.ts` |
| C10 | 数据文本里的 `{a/b}` | 共享 `renderRich(text)`（阅读面板 inspector、托盘、卡片、名词卡）与 `speakable(text, locale)`（演示朗读）；名词卡（`GlossaryCard`）定义文本也走 `renderRich` | `src/lib/rich-text.ts`（新）、`widgets/GlossaryCard.tsx` |

新部件（引擎内）：`stage/`（BarModel、CircleModel、NumberLine、FractionWall、BarModelDiagram、FoldStrip、Ghost（看答案虚线）、SetModel〔D2〕）、`tray/`（TaskTray、FractionInput、Keypad、SymbolPicker、ChoiceGrid、OrderSlots、FactorChips、Stepper）、`hud/`（StepBar 底部条、FractionCard、HistoryPanel、WorkingPanel、StatePanel、TaskInspector）、`practice/`（PracticeRunner、Summary）、`lib/`（fraction、checks、diagnose、solve、words、lesson〔拍与小步展开〕、tween、layout）。

预算：引擎 View chunk ≤ 40 KB gz，无新依赖；SVG 节点 ≤ 400；首屏同其它引擎（宿主 + HUD 约 105 KB）。

### 4.12 文档要改的地方（施工 E 时一起）

docs/01（第三类不再只是"参数模拟"：数学走 `math-scene` 交互课）、docs/03（加 §D MathScene，§C Simulation 保留给科学模拟）、docs/04（分数行：math · lesson · MathScene · P2–P3（+P4）· 2026）、docs/06（MathScene 一节：数据、托盘、命令、演示、`__atlas.engine`、URL `task` / `model`）、docs/08（§2 加托盘块与底部条的 Check / Hint；§3 加 C / I / U / W / S / E / N 键）、docs/README。

## 5. 写作规则（数学版）

### 5.1 口吻

- 平静、直接、第二人称："Shade 3 of the 8 parts." / 「涂出 8 份中的 3 份。」不用感叹号，不说"Great job!""太棒了！"，不说"easy / 简单"，不说"wrong / 错了"——说"Not yet. / 还没对。"或"Not quite. / 差一点。"，后面紧跟**具体原因**和**下一步看哪里**。
- 对的反馈也讲为什么："Yes. The whole has 8 equal parts and 3 are shaded, so it is 3/8."
- 一句一个意思；EN 题目 ≤ 15 词、引导 ≤ 3 句；ZH 题目 ≤ 30 字。
- 先具体后符号：先说"8 equal parts"，再说"denominator"；术语第一次出现用 `<Term>`。
- 不拟人（分数不"开心"、不"害怕"），不讲故事情节，不出现卡通角色或吉祥物。
- 双语各自地道：中文不是英文的逐词翻译（"Shade 3/8 of the toast" →「把这片吐司涂出 3/8」），句子长度不必一致。

### 5.2 术语（MOE 英文 + 中文对照）

新加坡主流小学数学用英语授课；中文用于对照阅读。中文术语以中国大陆人教版小学数学为底，等值分数用新加坡 / 港台华文材料常用的"等值分数"（D5）。

| MOE 英文 | 中文 | 备注 |
|---|---|---|
| whole | 整体、一个整体 | 大陆课本也说"单位 1"，P2–P3 不用 |
| equal parts | 平均分、相等的部分 | "把吐司平均分成 4 份" |
| fraction | 分数 | |
| numerator | 分子 | |
| denominator | 分母 | |
| fraction bar / line | 分数线 | |
| unit fraction | 单位分数（分子是 1 的分数） | 大陆"分数单位"指 1/n 本身，两者都在名词表说明 |
| like fractions | 同分母分数 | |
| unlike fractions | 异分母分数 | |
| equivalent fractions | 等值分数 | 大陆课本说"大小相等的分数 / 分数的基本性质"，名词表注明 |
| simplest form | 最简分数、最简形式 | 动作"约分"可在名词表里出现，正文用"化成最简分数" |
| related fractions | 分母有倍数关系的分数 | 不造"相关分数"一词（D5） |
| number line | 数轴 | |
| greater than / smaller than | 大于 / 小于 | 符号 `>` `<` |
| mixed number | 带分数 | 读作"一又四分之三" |
| improper fraction | 假分数 | |
| proper fraction | 真分数 | 只在名词表 |
| half / halves, quarter / quarters | 二分之一、四分之一 | EN 用 quarter（新加坡课本习惯），不用 fourth |
| bar model / model drawing | 线段图、条形模型 | ZH 用"条形图示"还是"线段图"：D5 |

### 5.3 数字与情境

- 分母 ≤ 12；P2 / P3 的加减结果 ≤ 1；数字要让模型画得清楚（一个整体最多 12 份，手机上最多 12 份也要可点）。
- 情境（每个只出现一两次，不堆砌）：kaya 吐司、千层糕（kueh lapis）、prata、斑兰蛋糕、巧克力条、丝带、一瓶水、新年的橘子（D2 的集合）、组屋楼层与 MRT 站（只作数轴的比喻）。
- 人名多族群、男女各半：Mei Ling、Aisha、Ravi、Wei Jie、Siti、Arjun、Hui Min、Daniel。
- 不出现品牌、价格（P2–P3 分数不涉及钱）、比赛排名。

## 6. 名词表、来源、施工顺序、验收

### 6.1 名词表 `glossary.json`（14 个，保留 12–14 个）

`fraction` 分数 · `whole` 整体 · `equal-parts` 平均分 · `numerator` 分子 · `denominator` 分母 · `unit-fraction` 单位分数 · `like-fractions` 同分母分数 · `unlike-fractions` 异分母分数 · `equivalent-fractions` 等值分数（see: simplest-form）· `simplest-form` 最简分数（see: common-factor）· `common-factor` 公因数（P4 才正式学，只在名词表）· `related-fractions` 分母有倍数关系的分数 · `number-line` 数轴 · `mixed-number` 带分数（see: improper-fraction）· `improper-fraction` 假分数。定义 1–2 句，带一个 `{a/b}` 例子。

### 6.2 来源计划（施工时进 `sources.json`，S#）

| # | 来源 | 用途 |
|---|---|---|
| S1 | MOE CPDD, *Mathematics Syllabus Primary One to Six* (2021 P1 cohort; updated Oct 2025). https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf | 学习目标原文（第 33、35、37、41 页）、框架、学习三阶段、大观念 |
| S2 | MOE 课纲入口页 https://www.moe.gov.sg/primary/curriculum/syllabus ；批准教材目录 https://www.moe.gov.sg/education-in-sg/approved-textbook-list | 版本核对、教材系列 |
| S3 | TIMSS 2015 Encyclopedia · Singapore: The Mathematics Curriculum in Primary and Lower Secondary Grades. https://timssandpirls.bc.edu/timss2015/encyclopedia/countries/singapore/the-mathematics-curriculum-in-primary-and-lower-secondary-grades/ | CPA 是中心教学法 |
| S4 | Ng, S. F. & Lee, K. (2009). The model method: Singapore children's tool for representing and solving algebraic word problems. *JRME* 40(3), 282–313；MOE (2009) *The Singapore Model Method for Learning Mathematics*（EPB Pan Pacific，待从 NLB 借阅核对） | 条形模型：部分–整体、比较 |
| S5 | Siegler, R. et al. (2010). *Developing Effective Fractions Instruction for Kindergarten Through 8th Grade* (NCEE 2010-4039). IES WWC. https://ies.ed.gov/ncee/wwc/PracticeGuide/15 | 数轴作中心表示；分数是数；讲清算法为什么成立 |
| S6 | Ni, Y. & Zhou, Y.-D. (2005). Teaching and learning fraction and rational numbers: The origins and implications of whole number bias. *Educational Psychologist* 40(1), 27–52 | 整数偏差（分母大就大、分子分母一起加） |
| S7 | Centre for Neuroscience in Education, Cambridge: "What makes learning fractions so hard? (Part 2)". https://www.cne.psychol.cam.ac.uk/what-makes-learning-fractions-so-hard-part-2 | 1/4 > 1/3 类错误、整体与部分 |
| S8 | OISE Robertson Program: "Whole number bias and 3 misconceptions about fractions in junior math" (2022). https://www.oise.utoronto.ca/robertson/blog/whole-number-bias-and-3-misconceptions-about-fractions-junior-math-2022-05-26 | 误解描述（教师向） |
| S9 | AAMT Top Drawer · Fractions · Misunderstandings · Number of parts only. https://makeitcount.aamt.edu.au/Topdrawer/Fractions/Misunderstandings/Number-of-parts-only/Teaching-equal-parts | 不等分、要让孩子自己切 |
| S10 | NCETM Curriculum Prioritisation Y3 Unit 9 Non-unit fractions https://ncetm.org.uk/classroom-resources/cp-year-3-unit-9-non-unit-fractions/ ；PSKA question 6 https://www.ncetm.org.uk/media/wzomk3ni/pska-frac-q6.pdf | 等分不一定全等、非单位分数 |
| S11 | Oak National Academy, "Identify non-unit fractions" https://thenational.academy/teachers/programmes/maths-primary-ks2/units/non-unit-fractions/lessons/identify-non-unit-fractions （页面可能已下线，施工时存档或换源） | 部分–部分误解；先数分母 |
| S12 | ExploreLearning Frax, "Fractions number line challenges" https://frax.explorelearning.com/resources/insights/fractions-number-line-challenges （商业，低权重，能换同行评议源就换） | 数刻度线 vs 数间隔 |
| S13 | Pearn, C. & Stephens, M. (2004). Why you have to probe to discover what Year 8 students really think about fractions. MERGA 27（**待核原文**） | 差距思维 gap thinking |
| S14 | Skemp, R. R. (1976). Relational understanding and instrumental understanding. *Mathematics Teaching* 77, 20–26（S1 引用） | "知其所以然"取向 |
| S15 | Frontiers in Education (2020) 10.3389/feduc.2020.00029 （自然数偏差综述，**待核标题作者**） | 1/4 + 1/3 = 2/7 类错误 |
| S16 | 教材系列（典型顺序，不照抄）：Marshall Cavendish *My Pals Are Here! Maths*、*Shaping Maths*（S2 目录 + 各校书单，如 Keming Primary 2024 书单） | 课步顺序参考 |
| S17 | MOE SLS / iwant2study 分数交互资源（如 "Compare fractions"）https://iwant2study.moe.edu.sg/ （典型交互参考） | 交互形式参考 |

事实纪律：课纲原文逐字引用并注页码；误解来源写在 `sources.json` 的 `note` 里（"本题的干扰项依据 S6"）；练习题干不需要来源。数学主题没有 SIM / FACT 芯片问题，规格行全部是 `ref`（来自 S1）。

### 6.3 施工顺序与分工

依赖由主会话预装（本主题**不需要新依赖**）；子代理不改 `package.json`；文件归属如下，互不交叉。

| 阶段 | 代理 | 做什么 | 文件归属 | 前置 |
|---|---|---|---|---|
| 0 | 主会话 | Gavin 定 §7；`pnpm tsx scripts/new-topic.ts fractions --engine math-scene …`（脚手架要先由 E 加 math-scene 分支，或主会话手建目录） | `src/content/topics/fractions/topic.yaml` | — |
| 1 | **L**（Opus）数据契约 + 检查 | `math-scene/schema.ts`、`lib/fraction.ts` `checks.ts` `diagnose.ts` `solve.ts` `words.ts`、单测、校验规则；`lesson.json` 的**结构与数字**（模型、目标、干扰项、code），文本先放 EN 占位句（只在分支上，交付前由 T 换掉） | `src/engines/math-scene/{schema.ts,lib/}`、`tests/math-scene/`、`src/content/topics/fractions/data/lesson.json`（结构）、`scripts/validate-content.ts` 的 math 规则 | 0 |
| 1 | **E**（Opus）core + 引擎 | §4.11 C1–C10；`index.ts`、`View.tsx`、`stage/`、`tray/`、`hud/`、`practice/`、`math-scene.css`；用 L 的 fixture（每种 task.kind 一个）先跑通 | `src/engines/core/**`、`src/engines/math-scene/{index.ts,View.tsx,stage,tray,hud,practice,*.css}`、`src/components/mdx/`、`src/lib/rich-text.ts`、`scripts/shoot.ts`、`tests-e2e/hud-layout.ts`、docs/03/06/08 | L 的 schema 类型先合（半天） |
| 2 | **T**（Opus 写 ZH / 审 EN，Sonnet 可起 EN 初稿）文本 | 13 章 MDX 正文 + summary、背景章与阅读说明、每个小步的 prompt / guide / hints / feedback / reveal / example.say、练习题干与解释、名词表、`sources.json`、`SOURCES.md` | `src/content/topics/fractions/chapters/`、`data/lesson.json` 的文本字段、`data/glossary.json`、`data/sources.json`、`data/SOURCES.md` | Gavin 定稿 §2–§3；L 的结构合入 |
| 3 | **P**（Sonnet）收尾与 QA | 手机 / 平板 / 4K 布局、两套主题、键盘走查、读屏走查、`pnpm shoot fractions --tasks --keys --layout --beats`、e2e（`tests-e2e/fractions.spec.ts`：一条点按路径、一条纯键盘路径、练习全流程、zh、390×844）、docs/04 / README、索引页 math 类首个主题 | `tests-e2e/fractions.spec.ts`、`shots/`、小的 CSS 修正（经主会话同意） | 1、2 |

主会话：写 brief、验收每阶段、`git commit`（文档定稿、阶段验收通过），push 等 Gavin。

### 6.4 验收

- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`；`pnpm shoot fractions --layout --keys --tasks --beats` 无 error，截图逐张看过（en / zh × paper / cinema）。
- [ ] **每个小步都能只用点按完成，也能只用键盘完成**（e2e 两条路径各走完 01–13；手机 390×844 再走一遍点按路径）。
- [ ] 所有可点目标 ≥ 44 px（`hud-layout.ts` 加托盘与舞台份的尺寸检查；份宽不足时 `−` / `+` 存在）。
- [ ] 检查函数单测覆盖每种 `task.kind` 与 §2.2 每个误解 code；`lesson.test.ts` 证明每个小步的标准解法通过、每个干扰项被诊断为声明的 code（练习 8 题全部干扰项）。
- [ ] 时间：一个 P3 孩子（或按 §2.4 的每小步预算模拟：读题 6 s + 操作 15 s + 反馈 4 s）走完 01–12 + 练习 < 25 分钟；Gavin 与女儿实测一次记录在本文 §8。
- [ ] 两种语言：所有文本 en / zh 齐全；分数读法 en / zh 正确；术语符合 §5.2。
- [ ] URL：`?ch=equivalent-fractions&task=2&model=circle` 能复现；任何时刻 URL 里没有作答；刷新后进度清空。
- [ ] 演示：每章拍数 = 例子句数 + 小步数；你来做拍里孩子能在舞台上作答、字幕卡上能检查；自动播放在你来做拍等待；语音读分数成文字。
- [ ] 两套主题对比度可读；不依赖颜色（灰度截图能分辨你涂的 / 给定的 / 拿走的）。
- [ ] 无 console 噪音、无外部请求、无 TODO / placeholder / 死代码（D2 不选就不建 `set`）。
- [ ] 语气抽查：没有感叹号、没有"wrong / 错"、每条错误反馈都说原因和下一步。

## 7. 待 Gavin 决定

| # | 问题 | 选项 | 建议 |
|---|---|---|---|
| D1 | 级别重心 | (a) P3 为主、P2 为地基（12 步）；(b) 先只做 P2（01–06），明年再补 P3 | **(a)**：P2 的孩子今年先做 01–06，明年接着做 07–11，一个主题用两年 |
| D2 | P4 桥 | (a) 只做带分数（第 12 步）；(b) 再加"分数的集合"第 13 步（多一个 `set` 模型）；(c) 不做桥 | **(a)**；集合留到 P4 那年连同 P4 加减一起做 |
| D3 | 练习长度与重做 | (a) 固定 8 题，重做同一组；(b) 10–12 题；(c) 每次重做换数字（题目生成器，检查与诊断已是纯函数，可行但要多一套"变式"数据与校验） | **(a)** 先上线，(c) 作为 v2 |
| D4 | "老师模式"（直接显示答案） | (a) 不做：人人都有"第二次不对后看答案"和练习后的正确模型；(b) URL `?answers=1` 显示所有答案 | **(a)**，符合 docs/01 原则 7"没有家长模式"；答案本来就在静态数据里，家长要核对可以看"看答案" |
| D5 | 中文术语 | 等值分数 vs 大小相等的分数；related fractions 译法；bar model 译"线段图"还是"条形图示" | 等值分数；"分母有倍数关系的分数"；"条形图示（线段图）"首次并列，之后用"条形图示" |
| D6 | 进度保存 | (a) 只在内存，刷新清空；(b) sessionStorage 记"哪些小步做完"（不记作答） | **(a)**；(b) 也不违反"答案不保存"，看使用习惯 |
| D7 | 加减结果是否必须最简 | (a) 题目写明 "simplest form" 时必须最简，否则等值即对；(b) 一律要求最简 | **(a)**，与新加坡试卷习惯一致（题目会写 "Give your answer in the simplest form"） |
| D8 | 练习章在芯片上的写法 | `13` 照常 / `PR` 专用标记 | 照常 `13`，阅读面板眉题写 "Practice / 练习" |
| D9 | 引擎命名与形态 | `math-scene` + `mode: lesson` + `stage: svg`；`simulation` 占位保留 | 同意即施工 |
| D10 | 正文篇幅 | 每步阅读面板正文 EN 80–140 词 / ZH 150–250 字（比历史主题短：孩子主要在舞台上学） | 同意 |

## 8. 施工记录

见 §9。

## 8. §7 的决定（2026-10-10，主会话按既定原则代拍板）

D1 P3 为核心、P2 打底：是。D2 桥接只做带分数与假分数，整体的几分之几留 P4 主题：是。D3 练习固定 8 题：是。D4 不做教师模式：是。D5 中文术语：分子、分母、等值分数、最简分数、"分母有倍数关系的分数"写作"相关分数（分母成倍数）"，bar model 叫"模型图"（新加坡华文数学通用说法）。D6 进度只在内存：是。D7 只有题目要求时才要求最简分数：是。D8 练习章显示为芯片 13：是。D9 `math-scene`、mode `lesson`、stage `svg`：是。D10 每步讲述面板 EN 120–200 词 / ZH 200–320 字。

## 9. 实现记录与已知差距

### 9.1 提交

| 提交 | 内容 |
|---|---|
| `18bd923` | §7 的决定（D1–D10）与 §8 写入本文 |
| `364547c` | 第三个引擎 `math-scene`：SVG 模型（条、圆、数轴、分数墙、模型图）、11 种小步（纯检查）、15 个误解诊断、作答托盘、练习与总结、由课程数据推出的演示拍；分数课程数据（12 步、35 个小步、8 道练习题） |
| `0650c54` | 14 章正文（EN / ZH）、名词表与来源核对、课程措辞一轮 |
| 本轮（收口；未提交时见 `git status`） | 控制面板在舞台高度内滚动、短舞台压紧行高；阅读面板里分数放大、"分数 = 分数"不被换行拆开；手机上控制面板收成一个按钮、拆成并排的分数框；图片选项有文字描述；给定的份被锁定时的 Tab 序修正；左列标题块在托盘带里收缩；1600×900 进入布局检查；演示闸门、键盘游标、手机、首页（5 个主题、数学类可选）e2e；`status: published`；文档与 README |

### 9.2 本轮验收摘要

- **控制面板**（核心，所有主题）：`.atlas-stage__overlay` 在舞台高度内滚动，滚动条是常显的发丝滚动条（原先 macOS 的覆盖式滚动条不出现，KEY 末行与 Hide HUD 看起来被切掉）；≤ 940 px 高且是鼠标输入时行高 30 → 26 px，1600×900 下分数主题的面板刚好放下，空调等行数多的主题滚动。手机（< 760 px）上分数主题的面板收在一个 44 px 的「工具和图例」按钮后面，模型图不再被它挤没。
- **分数的排版**：数据文本与 `<Frac>` 的分数周围，运算符与相邻的数一起包进 `white-space: nowrap`（`src/lib/frac-glue.ts`；原因：行内分数是原子行内元素，浏览器可以在它前后断行，中文里 "=" 会被丢到下一行开头）；阅读面板内分数数字 ≈ 1.05em，其余位置 0.8em。
- **键盘与读屏走查**：脚本（未提交）对全部 43 个小步（35 + 8）在 EN 和 ZH 下逐个用真实按键完成——Tab 到份、方向键移动、Enter / 空格涂色、数轴与切线光标用方向键、芯片 / 符号用方向键、选项 Enter / 空格、排序卡 Enter、数字直接打在框里、C 检查；多段小步逐段完成；每个控件有无障碍名字、可点目标 ≥ 40 px，全部通过。发现并修了两处：份被锁定（加法题里先给的份）时整行没有一个可 Tab 的份（roving tabindex 落在锁定的份上），方向键现在跳过锁定的份；图片选项只叫 "Picture A"，现在带图的文字描述（"a kueh cut into 3 parts of different sizes"）。
- **深色版**：孩子的标记（signal）在 cinema 下提亮到 74%，与给定量（cold）一眼可分；其余沿用。
- **模式叠加**：S + E + N 同时开，检查 8 个小步在 1600×900、1280×720、390×844 下无重叠、无溢出、无 console 错误。
- **手机 390×844**：托盘与屏上数字键（≥ 44 px）可用；分数框并排（与 ≤ 820 px 高的屏相同）省出模型的空间；底部步骤条放得下；模型图的 "?" 括号不再顶出可用区。
- **演示闸门**：自动播放停在"你来做"拍，直到检查通过或用了"看答案"才开始计时（e2e `presentation auto-play never passes …`）。
- **布局检查加了 1600×900**（`LAYOUT_SIZES`，所有主题共用）：立刻查出练习第 8 题托盘与标题块重叠 2 px（标题块是 `flex: none`），已让标题块在数学主题的左列里可收缩。
- **门槛**：`pnpm check` / `validate` / `test`（616）/ `build` / `e2e`（63，含分数 13 条）全绿；`pnpm shoot fractions --keys --layout --tasks --beats --locale en,zh --theme paper,cinema`、`pnpm shoot ww2 --keys --layout`、`pnpm shoot aircon --keys --layout` 均 0 失败。
- **审计**：无 TODO / placeholder；URL 只有 `ch`、`task`、`model`；名词表 12 个词都在正文用到；全站没有用红 / 绿表示对错（反馈用一句话 + ✓ / i / ○ 符号，色只用 token）。

### 9.3 已知差距

| # | 差距 | 说明 |
|---|---|---|
| G1 | 练习第 3 题（比较）没有"差距思维"（gap-thinking）干扰项 | 该误解出现在第 09 步第 1 小步和练习 Q8，Q3 的干扰项只覆盖整数偏差和只比分子 |
| G2 | 练习 Q5 的"数刻度线"示例错答（`sample: "5"`）是手工写在数据里的 | 不是从题目推出；改了刻度数要同步改 `feedback.wrong[].sample` |
| G3 | 第 11 步第 3 个小步（`water-bottles`）没有预设误解 | 错答走通用反馈 + 下一级提示 |
| G4 | 底部 PERF 读数槽未使用 | SVG 舞台没有渲染预算要报 |
| G5 | 标注（L）默认关闭 | 模型上的每份分数标注要孩子自己打开；背景章讲了 L |
| G6 | 没有补间库 | 对折、切线、芯片的过渡是 CSS transition，不是物理动画；不引入新依赖 |
| G7 | 来源 S4 / S6 没有读到原文 | S4 的配套书未借阅核对，S6 的出版方页面拒绝自动访问；引用只到摘要与二手综述为止，见 `data/SOURCES.md` |
| G8 | 窄于 820 px 时规格表的行被隐藏 | 给托盘的带让路；信息在阅读面板与第 00 章里也有 |
| G9 | 没有遥测，也不打算有 | 无法知道孩子在哪一步卡住；时间预算（< 25 分钟）只做了按小步估算，Gavin 与女儿实测一次后记在这里 |
