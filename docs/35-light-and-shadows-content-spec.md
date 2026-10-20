# 35 · 光与影 · 内容施工 spec（`light-and-shadows`，SpaceScene + 试一试；v1，§0 已定稿）

SpaceScene / Model3DStage，paper 默认、cinema 可切。原型：docs/30、docs/31 的**"实验台"**（`archetypes.md` §2 封闭设备的变体）加一块户外场地：**一张教室实验桌上的光学轨道**（左边一支装在滑座上的手电筒，中间一个物体支架，右边一块白色屏幕；支架上可以换卡片剪影、罐子、圆锥、球、四种材料片和三张有孔的卡片），桌子后角一只**开了小孔的暗箱**，另外按实物大小画一块**新加坡学校的空地**（一根竖直的 1 米杆子、指北箭头、太阳）。本主题的任务：**P4 学生看完能说清：物体自己发光或把光反射进眼睛，我们才看得见它；光沿直线传播，物体完全或部分挡住光，就形成影子；影子的形状随物体的形状和摆放方向变化；影子的大小随物体的大小、手电筒到物体的距离、物体到屏幕的距离变化——并能认出、读懂"只改一个量"的公平测试，从数据表和折线图里找出规律；还能说出太阳下的影子一天里怎样变长变短、指向哪里。**

`subject: science`；对应 2023 课纲 P4 *Energy Forms and Uses (Light)*（S2 第 75 页）、过程技能表（第 15–16 页，P4 末"认出公平测试"）、P3 *Diversity of Materials* 关于透光的 Note（第 40 页）。docs/17 §3.5 P4 Light 行（"Sim / S，变量实验"）、§3.6（公平测试是 Booklet B 的核心题型）、§7 B10 / D1。

2026-10-20 起草。**只做规划，不施工、不建目录、不提交。** 结构照 docs/30 / docs/31 / docs/33（§0 决定 → §1 课纲与范围 → §2 事实 → §3 对象与零件 → §4 引擎 → §5 章节 → §6 名词与来源 → §7 图像 → §8 施工与验收 → §9 施工记录（空））。字幕是**草稿**，用来定节拍和模型状态：EN 施工时由 Codex 起草全文、Claude 逐句核对；ZH 是 Claude 的草稿，施工时 Claude 独立定稿。事实来自 Codex 的研究（`art/codex-research/light-and-shadows/light-research.md` 与 `facts.json`，24 条，2026-10-20 完成，下文 R: 后面是 `facts.json` 的 `id`）、起草时本人读过的原文（MOE 课纲 PDF 第 15–18、22–23、40、74–75 页，`pdftotext -layout` 读；NOAA 太阳计算器的 `main.js` 与 *General Solar Position Calculations*；Pilkington 两份玻璃资料）和本人按 NOAA 计算器算法重算的太阳位置（§2.4，与 Codex 用 NOAA 原代码算出的 `solar-results.json` 逐项一致）。标"待核"的施工代理读原文核对后才能用，核不到就换值或删掉。

---

## 0. 决定（主会话按 Gavin 惯例代定；Gavin 已说"build it"，全部定稿）

| # | 决定 | 建议 | 状态 |
|---|---|---|---|
| D1 | **对象 = 两处地方，都按实物大小画**（1 场景单位 = 1 m，`units: { modelUnit: "cm", scale: 100 }`）：① **光学实验桌**（§3.2）：一张 1.8 × 0.6 m 的教室桌，桌上沿 x 一条 150 cm 的轨道（有厘米刻度，没有数字）；轨道上三只滑座：手电筒、物体支架（固定在轨道中点）、白色屏幕（60 × 45 cm）；支架上可换 7 件物体（三种卡片剪影、一张大圆卡、躺着的罐子、躺着的纸圆锥、球）、4 种材料片（透明玻璃、磨砂玻璃、描图纸、硬纸板）、三张有孔卡片；屏幕中心夹一只光传感器，短线连到屏幕滑座平台上的数据记录器（随屏幕一起移动）；桌子后角一只 30 × 18 × 20 cm 的暗箱（内壁黑色，正面一个小孔，左侧插一支小手电筒，箱里放一只球或一面小镜子）。② **户外空地**（在实验桌右边 10 m 外，自己的预设镜头里看）：一块半径 5.5 m 的平整水泥地、一根竖直的 1 m 杆子（插在重底座上）、指北箭头、示意的太阳与它这一天在天上走的弧线。两处**从不同框**（章节 `layers` 控制）。**通用设计研究**，无品牌、无型号、无文字（尺上只有刻度）。标题块 `note`：EN "Model study · a school light bench and a courtyard at 1.3° N · shadows worked out from straight lines of light · rays are drawn, not seen" / ZH "示意模型 · 学校的光学实验台与北纬 1.3° 的一块空地 · 影子按光沿直线传播算出 · 光线是画出来的，实际看不见" | 同意 | 定稿 |
| D2 | **课纲边界**（§1.1 原文）：主线 = 第 75 页两条 Core Ideas（看见物体要靠它发出或反射的光；光沿直线传播，物体完全或部分挡住光就形成影子）和 Practices（影子随物体的形状、大小、位置，光源—物体、物体—屏幕的距离变化）。Note 明说**不要求**：反射定律；transparent / translucent / opaque 三个词。所以：镜子只说"反射光、反射得很好"，**不讲、不画入射角与反射角**（模型里的反射方向是对的，字幕不提角度）；主线说"让大部分 / 一部分 / 不让光穿过"（第 40 页的说法），三个词只在细看与名词表出现（同 docs/30 D3 处理 air resistance）；本影 / 半影、相似三角形、太阳位置的算法只在细看，写明"中学会学 / 不是 P4 要求"；**太阳下的影子（第 07 章）是延伸**：课纲没有点名太阳，按"光源的位置"讲（§0.1-1）。UI 不出现年级，也不标 Foundation（P4 课题不分，同 docs/33） | 同意 | 定稿 |
| D3 | **引擎：SpaceScene + `sim`，新加一个模型 `kind: 'light'`**（§4），五个子模型都是纯函数：`bench`（点光源、物体几何 → 影子的高、宽、形状）、`sheets`（四种材料片 → 屏幕上的光 %、影子深浅）、`holes`（三张有孔卡片 → 屏幕上有没有亮点）、`seeing`（暗箱 → 有没有光从小孔出来）、`sun`（NOAA 太阳计算器的算法 → 太阳高度、方位、影长、影子方向、正午）。docs/30 D2 的原则照旧：**不做查表模型**，每个显示的数由模型从 DESIGN 尺寸和有来源的常数算出（影子大小 = 直线几何；材料 = 有来源的透光率 + 一个写明的散射模型；太阳 = NOAA 算法）。不需要新依赖 | 新 `kind: 'light'` + E-L1–E-L7（§4.7），引擎约 4 天 | 定稿 |
| D4 | **影子怎么画：模型按几何算出投影，不用 three.js 的阴影贴图**（§4.2）。新叠加 `shadow-cast`：把每个"挡光物"零件的**真实网格**从光源投影到接收面上（点光源用平面投影矩阵，太阳用平行投影），画成一块平涂的影子；屏幕上手电筒照亮的一片（光斑）也由它画；影子按屏幕矩形与光束圆锥裁剪。理由：①**确定**：同一状态逐像素一致，截图 QA 可比；②**和读数一致**：画出来的影子边界与 PLATE / 卡片上的 cm 数出自同一几何，单测和 e2e 钉死（误差 < 2 mm）；③**正确**：点光源的影子边缘是硬的、放大倍数正确、有孔的卡片影子里有亮孔、三张卡的影子取并集；阴影贴图做不到这些（1024 贴图在 2 mm 厚的卡片上有锯齿与偏移、PCF 边缘发虚、引擎只有一个固定方向的主光、零件不接收阴影、聚光灯阴影要另起一遍深度渲染、不同 GPU 结果不同）；④**省**：每个挡光物 +1 次绘制，没有额外的深度通道。docs/17 的"真阴影，three.js 本身能算"作废。本主题同时**关掉引擎主光的投影**（`views.shadows: "contact"`，只留地面的柔和接触阴影），场景里只有模型算出的影子，不会出现方向矛盾的第二个影子 | 同意 | 定稿；施工用 `views.shadows: "none"`（§9.2 决定 2） |
| D5 | **光源**：实验台的手电筒按**点光源**画（一颗小 LED，光从镜片中心出发），所以屏幕上的影子边缘是清楚的；光束半角 40°（DESIGN：宽光束 LED 手电筒），所有课上的距离组合下影子都完整落在光斑和屏幕里（单测）。大灯泡带来的模糊边缘（半影）只在第 02、06 章细看 + 文字讲，不建模（v2）。太阳按**平行光**画（方向来自 NOAA 算法）；太阳视直径约 0.5° 带来的 1–3 cm 模糊边缘只在第 07 章细看 | 同意 | 定稿 |
| D6 | **必须讲对的十处**（§1.4 误解目录逐条对应）：① 影子**不是倒影 / 复制品**：它是光照不到的地方，没有颜色和花纹，只有轮廓（有孔卡片的影子里有亮孔）；② 眼睛**不发光**：光从光源出发，直接或经物体反射**进入**眼睛，我们才看见；③ 不发光的东西（白纸、球）在完全没有光的地方**看不见**；④ **暗的、不亮的表面也反射光**，不只是镜子和亮晶晶的东西；⑤ 月亮不是光源，它反射太阳光；⑥ 光**不会在晚上走得更远**：晚上周围暗，光束和光斑才显得清楚；⑦ 影子**不总是和物体一样大**：手电筒越近、屏幕越远，影子越大；用小手电筒时影子不会比物体小；⑧ 磨砂玻璃、描图纸**让不少光穿过**，只是把光散开，所以看不清后面、影子淡（"半透明"不等于"一半的光"）；⑨ 新加坡的"正午"**不是 12 点**：这一天太阳最高在下午 12 点 50 分左右，影子也不是每天都指北；⑩ 太阳"走过天空"是因为**地球在转**，不是太阳绕着我们转（只在细看说，课纲外） | 同意 | 定稿 |
| D7 | **章数 7 + 背景章 00**（§5）：00 开始之前 / 01 看见光 / 02 光沿直线传播 / 03 让光穿过，还是挡住 / 04 影子的形状与大小 / 05 移动手电筒 / 06 移动屏幕 / 07 太阳下的影子。比"约 6 章"多一章，因为**两个距离实验各要一张试一试卡片**（引擎规定每章至多一张卡，docs/06「试一试」），分开也正好对上课纲的两个量（光源—物体、物体—屏幕）。每章一张试一试（00 没有）；**不做测验** | 同意 | 定稿 |
| D8 | **公平测试一等公民**（docs/22 §0-7、docs/30 D7 同）：每张卡写清改变 / 不变 / 观察；第 03 章（材料，选择 → **条形图**）、第 05 章（手电筒距离，步进 → **折线图**）、第 06 章（屏幕距离，折线图）、第 07 章（时间，折线图）可"记一行"并画小图，第 01、02、04 章记表不画图。P4 的要求是**认出**公平测试（第 15 页），所以字幕与细看反复问三个问题："改了什么？量了什么？哪些保持不变？"；第 06 章细看给一个**不公平的例子**（手电筒和屏幕都不动、只移动卡片：两个距离同时变了，R: shadow-geometry）。"重复三次取平均"只在细看讲：模型每次给同一个数（S1 写明） | 同意 | 定稿 |
| D9 | **材料与透光**：四种 10 × 10 cm 的材料片，透光率用**有来源的典型值**（TYPICAL）：透明浮法玻璃 4 mm 可见光透射 91 %（Pilkington，R: clear-glass-transmission）；酸蚀磨砂玻璃 4 mm 83 %（Pilkington Opal，R: frosted-glass-transmission）；描图纸约 65 %（R: tracing-paper-transmission，**暂定**，施工读全文核实，核不到见 §0.1-3）；硬纸板没有找到可引的数，模型取 0（DESIGN，S1 写明"学校的光传感器测不出"，不说"正好 0 %"）。**散射模型**（DESIGN，§2.5）：透明玻璃的光直走；磨砂玻璃和描图纸把穿过的光向各个方向均匀散开（朗伯散射面）；屏幕中心的光传感器读"和支架上什么都不放时相比的百分数"。第 03 章取手电筒 20 cm、屏幕 10 cm，模型读数：透明玻璃 91 %、磨砂玻璃 45 %、描图纸 35 %、硬纸板 0 %。必须讲清"磨砂玻璃让 83 % 的光穿过，但光被散开，所以照到正后方的少了"（D6 ⑧） | 同意 | 定稿 |
| D10 | **物体**（DESIGN，§2.2）：圆卡片 Ø 8 cm、正方形卡片 8 cm、三角形卡片（高 8 cm）、大圆卡片 Ø 12 cm（卡片厚 2 mm）；罐子 Ø 6.6 × 12 cm 横躺（轴横过轨道）；纸圆锥底 Ø 8 cm、高 10 cm 横躺；球 Ø 6.5 cm。**转向**（绕竖直轴 0° / 45° / 90°）只转物体，不移动：卡片侧对手电筒时影子变成细条，罐子和圆锥端对手电筒时影子是圆。默认：圆卡片、正对 | 同意 | 定稿 |
| D11 | **距离**：物体支架固定在轨道中点；手电筒到物体 10 / 15 / 20 / 30 / 40 / 60 cm（默认 20），物体到屏幕 10 / 20 / 30 / 40 / 50 / 60 cm（默认 30）。圆卡片 Ø 8 cm 的影子（模型，取整到 cm）：屏幕 30 cm 时，手电筒 10 → 32、15 → 24、20 → 20、30 → 16、40 → 14、60 → 12 cm（越近越大，且越近变得越快）；手电筒 20 cm 时，屏幕 10 → 12、20 → 16、30 → 20、40 → 24、50 → 28、60 → 32 cm（每远 10 cm 大 4 cm）。数字全是整数，小学生好读、好画图（§2.4） | 同意 | 定稿；施工改为手电筒 15 / 20 / 30 / 40 / 60 cm、屏幕 10 / 20 / 30 / 40 cm、屏幕 60 × 50 cm（§9.2 决定 1） |
| D12 | **太阳**（第 07 章）：模型移植 **NOAA 太阳计算器**（gml.noaa.gov/grad/solcalc 的 `main.js`，Meeus 算法，含大气折射修正；美国政府作品）到 `lib/sim/sun.ts`；地点取 1.3° N、103.8° E（Codex 与本 spec 一致，代表新加坡），时区 UTC+8；默认日期 **2026 年 10 月 20 日**（星期二，第四学期，学生能在学校重复这个观察）；时间上午 8 时到下午 6 时，每小时一档；杆子 1.00 m，地面水平。另有两个日期只在拍里设：2026 年 6 月 21 日（正午影子指**南**）、2026 年 3 月 24 日（正午太阳几乎在头顶，下午 1 时影子只有约 5 cm）。时间的显示一律走全站的 `{t:…}` 记法（新加坡写法 "8.00 am" / "上午 8.00"，`src/lib/rich-text.ts`），不另造格式 | 同意 | 定稿 |
| D13 | **"看见"怎么演示（第 01 章）**：用暗箱，不画人、不画眼睛——**读者就是那只眼睛**：光从小孔出来朝着镜头。箱里的光路是三条静态的流（手电筒 → 球 → 小孔，手电筒 → 镜子 → 小孔，球向别的方向的反射），颜色用光能的 `--en-light`；手电筒关掉时箱里的球按模型输出 `tint` 变暗（示意"箱里一片黑"，X-RAY 下读者才看得见箱里有球，字幕说明"从小孔看进去什么也看不见"）。引擎的环境光不会被箱子挡住，这是唯一的"示意照明"，S1 与细看写明 | 同意 | 定稿 |
| D14 | **背景章 00**：讲实验台上有什么、试一试卡片怎么用、细线（光线）是画出来的、影子和数字都是按光沿直线传播算出来的（SIM）、户外空地与太阳数据的来历。`note` 写模型和数字的来历 | 同意 | 定稿 |
| D15 | **不做**：品牌 / 型号 / 照片贴图 / 视频 / 配音文件 / 测验 / 人体与手（不画拿手电筒的手、不画眼睛、不画人的影子）/ 颜色与色散、折射、透镜、彩虹 / 日食月食、月相 / 反射定律与角度 / 半影的渲染（v2）/ 读者拖动手电筒或屏幕（v2：现在是步进控件）/ 真实时刻的天空颜色与昼夜光照变化 / 在影子里"量"的游戏化测验 | 同意 | 定稿 |
| D16 | **单位**：实验台 cm（读数取整）、透光 %（取整）、角度 °（取整）、户外影长 m（2 位小数，P4 已学小数）、时间 12 小时制（"8.00 am" / "上午 8.00"）、方向用八个方位（北、东北……P4 数学已学） | 同意 | 定稿 |
| D17 | **图**：首页图重画（Codex 草稿的放大倍数与画面里的距离对不上）；章节图 4 张：`light-and-shadows-opaque-translucent` 沿用（第 03 章）、`light-and-shadows-same-object-two-shadows` 新画（第 04 章）、`light-and-shadows-shadow-distance` 重画（第 05 章；草稿右边的影子比圆片还小，物理错）、`light-and-shadows-sun-day` 新画（第 07 章）（§7） | 同意 | 定稿 |
| D18 | **与其他主题的链接**：`energy-conversion`（光能、太阳是能源，第 01 章 `energy-from-the-sun`）、`telling-time`（上午 / 下午，第 07 章细看）、`plant`（植物需要光，第 01 章细看一句，可选）；P3 `materials`（docs/17 §6 #9，未做）谁后发布谁补链接 | 同意 | 定稿 |

### 0.1 真正需要 Gavin 的

无阻塞项。四处是"按惯例代定、Gavin 想改随时改"的：

1. **太阳下的影子（第 07 章）是课纲延伸**（D2）：第 75 页没有点名太阳，新加坡的 P4 教材和考题常见"一天里杆子的影子"，本 spec 按"光源位置变化"放进主线一章。只要严格的 P4 范围，就删第 07 章与 `sun` 子模型（引擎少约 1 天，内容少 6 拍）。
2. **第 07 章另两个日期**（D12）：6 月 21 日正午影子指南、3 月 24 日几乎没有影子，各一拍 + 细看。对 P4 太多就删这两拍，只留 10 月 20 日。
3. **描图纸的透光率**（D9）：唯一找到的数（约 65 %）来自一篇博士论文的检索片段，条件不全。施工读全文；核不到就换成另一种有数据的半透明材料（如"牛油纸 / 烘焙纸"，同样要来源），再不行就只留三片（透明玻璃、磨砂玻璃、硬纸板），条形图少一格。
4. **散射模型与光束角**（D5、D9）：磨砂玻璃和描图纸按"均匀散开"算，读数写"在这个模型里"。真实磨砂玻璃的散射更偏向前方，实测读数会比模型高一些——细看如实说。

---

## 1. 课纲对照与范围

### 1.1 课纲原文（逐字；2026-10-20 起草时从 PDF 抄录，页码是页脚印的数字）

**S2**：MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six, Standard / Foundation*，Implementation starting with 2023 Primary Three Cohort，封面 "Updated Jan 2026"（文件名 `Primary-Science-Syllabus-2023_May24.pdf`，Codex 下载于 `art/codex-research/light-and-shadows/sources/moe-api.pdf`；PDF 页码比印的页码多 1）。封面声明："Permission is granted to reproduce this publication in its entirety for personal or non-commercial educational use only."

**Energy Forms and Uses (Light) (P4)**（第 75 页）

> **Core Ideas**
> • Recognise that an object can be seen when it reflects light or when it is a source of light.
>
> Note:
> - The law of reflection is not required.
>
> • Recognise that light travels in straight lines and thus a shadow is formed when light is completely or partially blocked by an object.
>
> **Practices**
> • Investigate the variables that affect shadows formed.
>   - Shape, size and position of object(s)
>   - Distance between light source-object and object-screen
>
> Note:
> - The use of specific terms (transparent, translucent, opaque) is not required.
>
> **Values, Ethics and Attitudes**
> • Show objectivity by using data and information to validate observations and explanations about light.

**About Energy**（第 74 页，Essential Takeaways 第一条）

> • Energy is required for things to work.

**Table 1, Ways of thinking and doing**（第 15–16 页，"By the end of P4" 一栏，本主题用到的几行）

> Designing investigations: • Recognise a fair test (changed/unchanged variables).
>
> Conducting investigations and testing solutions: • Use senses, apparatus, and equipment to gather data. • Investigate to find out answers to questions (guided investigations). • Record and/or compare observations/ data with suggested scaffolding.
>
> Analysing and interpreting data: • Simple analysis of data and information in representations (e.g., tables, bar and line graphs, charts, and diagrams) to infer patterns and relationships or explain findings.

（P6 一栏是 "Design a fair test (changed/unchanged variables)"：P4 认出，P6 设计。）

**Diversity of Materials (P3)**（第 40 页，P3 已学的透光说法）

> - The "transparency" of a material refers to whether the material allows most/ some or no light to pass through. (The use of terms – transparent/ translucent/ opaque is not required.)

**教学说明里的影子例子**（第 22–23 页，只作背景）：课纲的学习方式一节用"设计调查来找出影子怎样形成"、"两人一组分享对影子的已有认识，再通过动手探究学习影子"作例子。

- 第 75 页没有 Foundation 的单独一页（P4 课题不分 Standard / Foundation；第 20 页表 2 的下划线规则只用于 P5–P6），不标。
- **S3**：SEAB，*PSLE Science (0009), For examination from 2026*（R: psle-question-types）：一份卷，Booklet A 30 道四选一（60 分），Booklet B 10–11 道结构题（40 分）；评估目标 II 包括用文字、图、表、曲线做预测、解读分析、评价方法、交流解释。

### 1.2 边界一览（主线 / 细看 / 不讲）

| 内容 | 处理 |
|---|---|
| 光源自己发光；不发光的物体把光反射进眼睛才被看见；镜子反射光（不讲角度） | 主线（01） |
| 光沿直线传播；完全挡住 / 部分挡住 → 影子 | 主线（02、03） |
| 影子的形状随物体形状与摆放方向；不同物体可以有同样形状的影子；同一物体可以有不同形状的影子 | 主线（04） |
| 影子的大小随物体大小、手电筒—物体距离、物体—屏幕距离 | 主线（04、05、06），两个公平测试 |
| 让大部分 / 一部分 / 不让光穿过（材料） | 主线（03）；transparent / translucent / opaque 三个词只在细看与名词表 |
| 光传感器与数据记录器读"照到屏幕的光" | 主线一拍 + 试一试（03） |
| 太阳下的影子：一天里的长短与方向 | 主线（07，延伸，§0.1-1） |
| 相似三角形的式子 H = h × (a + b) ÷ a；本影与半影；太阳视直径；太阳的位置怎么算；正午不是 12 点的原因（时区） | 细看（标"中学会学 / 课外"） |
| 地球自转让太阳看起来移动；正午影子一年里南北换向；太阳直射头顶的日子 | 细看（07） |
| 反射定律、入射角、折射、透镜、颜色、日食月食 | 不讲（课纲外或明确不要求） |

### 1.3 读者学到什么（P4 用词）

1. **光源**自己发光（太阳、灯、手电筒）。**不发光**的物体（球、书、月亮）把照到它的光**反射**出来，光进入我们的**眼睛**，我们才看见它。没有光，什么也看不见；眼睛不会发出光。
2. **光沿直线传播**。三张卡片上的小孔排成一直线，光才能穿过去；挪开一张，光就过不去。
3. 光被物体**挡住**，后面光到不了的地方就是**影子**。影子不是物体的倒影，它只有轮廓，没有颜色和花纹。没有光，就没有影子。
4. 有的材料**让大部分光穿过**（透明玻璃），有的**让一部分光穿过**（磨砂玻璃、描图纸），有的**不让光穿过**（硬纸板）。挡住的光越多，影子越深。
5. 影子的**形状**取决于物体从光源那边看过去的轮廓：转动物体，影子的形状会变。
6. 物体越大，影子越大；**手电筒离物体越近**，影子越大；**屏幕离物体越远**，影子越大。
7. **公平测试**：只改变一个量，其他会影响结果的条件保持不变；记下结果，从表和折线图里找规律。
8. 在太阳下，影子**背着太阳**：早上太阳在东边，影子指西、很长；中午前后太阳高，影子最短；下午太阳在西边，影子指东、又变长。

### 1.4 误解目录（每条至少一拍或一段正文正面讲；R: 指 Codex 研究的记录）

有两项研究可引（R: research-vision-misconceptions、research-shadows），其余是**教学上要正面讲的说法**（Codex §3 的"reasoned lesson checks"），依据是正确的物理，不写成"很多孩子以为……"。研究里的比例不在正文引用。

| # | 说法 | 正确的说法 | 哪里纠正 | 依据 |
|---|---|---|---|---|
| M-1 | 影子是物体的倒影 / 复制品，有物体的样子 | 影子是光照不到的地方，只有轮廓，没有颜色和花纹；有孔卡片的影子里有亮孔 | 02 第 3、5 拍；04 细看 | 物理；Grigorovitch & Alexandropoulou 2025 第 108–109 页（只说物体和灯、不说光被挡住） |
| M-2 | 眼睛发出光，"看"就能看见 | 光进入眼睛才看见；关掉暗箱里的手电筒就什么也看不见 | 01 第 2、5 拍 | Şahin, İpek & Ayas 2008 第 12、16 页 |
| M-3 | 白色 / 浅色的东西在完全黑暗里也看得见 | 没有光照到它，就没有光反射进眼睛 | 01 第 2 拍、T1 | Şahin et al. 2008 第 8、16 页（表 VII） |
| M-4 | 会发亮的、亮晶晶的东西都是光源；只有镜子才反射光 | 光源自己发光；暗的、不亮的表面也反射光（球、纸） | 01 第 1、4 拍、细看 | Şahin et al. 2008 第 7、12、16 页 |
| M-5 | 月亮是光源 | 月亮反射太阳光 | 01 细看 | Şahin et al. 2008（访谈"The Moon illumines at night"）+ NASA（P25，待找） |
| M-6 | 晚上光走得更远 | 光走多远和白天晚上无关；晚上周围暗，光斑和光束才显眼 | 01 细看 | 物理（F-1、F-2） |
| M-7 | 影子总是和物体一样大 | 手电筒近 → 大，屏幕远 → 大；小手电筒的影子不会比物体小；物体贴近屏幕时才接近一样大 | 05、06 主线；06 细看 | 物理（F-5）；R: shadow-geometry |
| M-8 | 影子只"在屏幕上"，物体和屏幕之间什么也没有 | 物体后面一整块地方都照不到手电筒的光；在中间放一张白卡也会是暗的 | 02 细看 | Grigorovitch & Alexandropoulou 2025 第 106、108–109 页 |
| M-9 | 半透明 = 一半的光；磨砂玻璃只让一点光过去 | 磨砂玻璃让约 83 % 的光穿过，只是把光散开，所以看不清、影子淡 | 03 第 2 拍、细看 | R: frosted-glass-transmission、blocked-light-and-materials |
| M-10 | 中午 12 点影子最短，而且总指北；正午时没有影子 | 新加坡这一天太阳最高在约 12.50 pm；正午影子有时指北、有时指南；只有每年两段日子（约 3 月 24 日、9 月 19–20 日）正午太阳几乎在头顶 | 07 第 2、5、6 拍、细看 | §2.4（NOAA 算法）；R: singapore-solar-shadows |

### 1.5 PSLE 题型 → 本主题哪里支持（R: psle-question-types，题型是按 SEAB 目标归的类，不是历年题统计）

| 题型 | 支持 |
|---|---|
| 光怎样进入眼睛：画箭头、分清光源与反光物 | 01（暗箱、流的方向）、T1 |
| 影子的位置、大小、轮廓：移动某样东西后预测 | 04、05、06 的先猜后看 |
| 读表与折线图找规律 | T5、T6、T7（折线图）、T3（条形图） |
| 选出能比较某个因素的两组装置（公平测试） | 05、06 的卡片三行；06 细看"不公平的例子" |
| 评价方法：哪里不公平、为什么要保持不变 | 05 第 4 拍、06 第 5 拍、细看 |
| 材料与传感器读数比较 | 03、T3 |
| 一天里杆子的影子：长短、方向、时间排序 | 07、T7、配图 `light-and-shadows-sun-day` |
| 同一物体的不同影子 / 不同物体的相同影子 | 04 第 4、5 拍、配图 `light-and-shadows-same-object-two-shadows` |

### 1.6 口吻

按 skill `atlas-space-topic` 的 `writing-rules.md`：通俗不幼稚，不喊"小朋友"，无感叹号与问句标题；不拟人（"光想要……"不写）；"在这个模型里 / in this model"标出模拟的数。安全一句：**不要直视太阳，也不要用手电筒照别人的眼睛**（第 00 章正文一句、第 07 章细看一句，不渲染）。户外观察写"和大人一起"。英文用新加坡 / 英式拼写（colour、centre、metre）；"torch"不写"flashlight"。中文：手电筒、光源、反射、影子、屏幕、光线、透明玻璃、磨砂玻璃、描图纸、硬纸板、光传感器、数据记录器、公平测试（§6.1）；引号只用“ ”；时间写"上午 8.00 / 下午 12.50"（全站 `{t:…}` 记法）。

### 1.7 与其他主题的分工

| 内容 | 谁负责 | 本主题怎么处理 |
|---|---|---|
| 光能是能量的一种；太阳是主要能源 | `energy-conversion`（01 `energy-from-the-sun`） | 00 细看一句 + `<TopicLink slug="energy-conversion" ch="energy-from-the-sun">` |
| 上午 / 下午、时刻的写法 | `telling-time`（04 `am-and-pm`） | 07 细看一句链过去 |
| 材料的透光（P3） | `materials`（docs/17 §6 #9，未做） | 谁后发布谁补链接；本主题 03 章自成一体 |
| 植物需要光 | `plant` | 可选：01 细看一句（施工时查章 id） |

---

## 2. 事实表（TYPICAL / DESIGN / SIM）

`TYPICAL` = 公开来源的典型值或定性事实；`DESIGN` = 本模型取的值；`SIM` = §4 的模型算出的结果。P# → §6.2（施工时变 S#；S1 是设计研究来源）。R: 是 Codex `facts.json` 的记录 id。"待核" = 起草时没读到原文或来源条件不全，施工代理读原文定。

### 2.1 光、看见、影子

| # | 项 | TYPICAL（来源） | DESIGN / SIM | 待核 |
|---|---|---|---|---|
| F-1 | 光沿直线传播 | 在均匀的介质（空气）里，光的路径可以画成直线，叫光线（P4 OpenStax §1.1，R: ray-model）；课纲第 75 页 | 画出来的光线都是直线 | |
| F-2 | 看见物体 | 物体发出的光或反射的光进入眼睛，我们才看见它（P2 第 75 页；P5 Primary Connections 第 2 课，R: seeing-light） | 暗箱的光路：手电筒 → 球 → 小孔 | |
| F-3 | 不亮的表面也反射光 | 粗糙表面把光向许多方向反射（漫反射），所以从各个方向都看得见它（P29 OpenStax §1.2） | 球的反射流向多个方向 | 是：读 OpenStax §1.2 原文；P5 第 4 课的标题有误导（"non-reflective surface"），不引标题 |
| F-4 | 影子 | 物体完全或部分挡住光，就形成影子（P2 第 75 页；P6 Primary Connections 第 4 课，R: blocked-light-and-materials）；物体后面整块区域照不到直射光，不只屏幕上那一片（R: research-shadows） | — | |
| F-5 | 影子大小的几何 | 点光源、平面物体与屏幕平行：H ÷ h = (a + b) ÷ a（a 光源—物体，b 物体—屏幕）；固定 b 移近光源 → 大；固定 a 移远屏幕 → 大（R: shadow-geometry，Codex 的推导；P8 CCNY） | §2.4 全表 | |
| F-6 | 本影与半影 | 光源有一定大小时，完全看不到光源的地方是本影，只看到一部分的是半影；边缘变模糊（P8 CCNY Hedberg 2021） | 不建模（D5）；02、06 细看 | |
| F-7 | 影子的形状 | 影子是物体沿光线方向的轮廓；转动物体会改变影子；一个轮廓不一定只对应一种物体（P7 Primary Connections 第 5 课，R: shape-and-fair-test-designs） | §2.4 形状表 | |
| F-8 | 月亮 | 月亮自己不发光，反射太阳光（P25 NASA） | 01 细看 | 是：找 NASA 原文 |
| F-9 | 眼睛不发光 | 研究记录了学生"看就能看见""眼睛起作用"的想法（Şahin et al. 2008 第 12、16 页，R: research-vision-misconceptions）；物理上眼睛只接收光 | 01 第 5 拍 | 可选：Winer et al. 2002（成人"视觉发射"信念，P28）只进 S1 note |

### 2.2 器材（DESIGN）

| # | 项 | DESIGN | 说明 |
|---|---|---|---|
| F-10 | 轨道 | 150 cm，1 cm 一格刻度（每 10 cm 长线），无数字；轨道面离桌面 2 cm | 教室常见的米尺轨道（R: singapore-school-apparatus-evidence 提到尺、支架） |
| F-11 | 手电筒 | 小型 LED，点光源在镜片中心，光束半角 40°；光轴离桌面 25 cm | D5；Codex 的器材建议是"单颗 LED 的手电筒"（R: singapore-school-apparatus-evidence） |
| F-12 | 屏幕 | 白卡纸板 60 × 45 cm（宽 × 高），中心在光轴上，面朝手电筒 | 所有课上组合下影子都在屏内（单测） |
| F-13 | 物体 | §0 D10 的七件；卡片厚 2 mm；支架是一根 4 mm 细杆 + 夹子 / 小托架，**它自己也有影子**（屏幕下方一条细线，04 细看说明） | |
| F-14 | 材料片 | 10 × 10 cm；玻璃厚 4 mm（与 F-17、F-18 的来源厚度一致）；描图纸夹在细杆的夹子上 | |
| F-15 | 有孔卡片 | 三张 10 × 10 cm 硬卡片，中心一个 Ø 1.2 cm 的孔；位置在支架前 10 cm、支架上、支架后 10 cm；中间那张可"挪开"2 cm | |
| F-16 | 光传感器与数据记录器 | 传感器夹在屏幕中心；读"和支架上什么都不放时相比"的百分数（R: transmission-measurement-method 的相对读法；学校用数据记录器 + 光传感器，R: singapore-school-apparatus-evidence，该校文件原件已 404，只作佐证） | 不给勒克斯绝对值 |

### 2.3 材料与太阳（TYPICAL）

| # | 项 | TYPICAL（来源） | DESIGN / SIM | 待核 |
|---|---|---|---|---|
| F-17 | 透明玻璃 | Pilkington Optifloat Clear 4 mm：可见光透射 91 %（另一栏"半球透射"82 %，两者不能互换）（P9 Pilkington Botanical 手册第 2 页，R: clear-glass-transmission） | 模型直透 0.91 | |
| F-18 | 磨砂玻璃 | Pilkington Optifloat Opal（酸蚀）4 mm 与 6 mm：可见光透射 83 %、反射 8 %（78 / 75 % 是太阳能直透，不是可见光）（P10 Pilkington Opal 资料第 2 页，2020 年 6 月，R: frosted-glass-transmission） | 模型散射透过 0.83 | |
| F-19 | 描图纸 | 约 65 % 可见光透射（P11 Wu 2016 博士论文第 33 页的检索片段，厚度、品牌、测法未核，R: tracing-paper-transmission） | 模型散射透过 0.65 | **是**（§0.1-3） |
| F-20 | 硬纸板 | 没有找到可引的数（P12 只有图注，R: cardboard-numeric-gap）；不写"0 %"为实测 | 模型 0（DESIGN，"学校的传感器测不出"） | 可选：找纸板不透明度（ISO 2471 opacity）的产品数据 |
| F-21 | 透光多少 ≠ 看得清不清 | 透明材料让光几乎不受扰动地穿过；磨砂类材料把穿过的光散开，所以看不清；"半透明"没有固定的百分数（P6、R: blocked-light-and-materials） | 03 第 2 拍、细看 | |
| F-22 | 新加坡的位置 | 约 1°22′ N、103°48′ E（P23，待找：CIA World Factbook 或新加坡土地管理局） | 模型取 1.3° N、103.8° E（与 Codex、NOAA 计算一致） | 是 |
| F-23 | 新加坡时间 | UTC+8（1982 年起）（P24，待找官方或 NUS 页面） | 时区 8 | 是 |
| F-24 | 太阳位置算法 | NOAA 太阳计算器：Meeus《天文算法》的方法，含折射修正；NOAA 说明计算器已不再维护，结果是近似的教育用计算（P15 NOAA calcdetails 与 `main.js`，R: singapore-solar-shadows）；NOAA 简化方程作交叉核对（P16，R: solar-equations-crosscheck） | `lib/sim/sun.ts` 移植 | |
| F-25 | 影长与方向 | 竖直杆子在水平地面上：影长 L = h ÷ tan(太阳高度角)；影子方向 = 太阳方位 + 180°（R: singapore-solar-shadows） | §2.4 | |
| F-26 | 太阳的视直径 | 约 0.5°（P26 NASA Sun fact sheet） | 影子尖端约 1–3 cm 模糊，不建模 | 是 |
| F-27 | 太阳看起来移动 | 地球自转使太阳看起来东升西落（P27 NASA Space Place） | 07 细看 | 是 |

### 2.4 模型（SIM，设计研究来源 S1 的内容，§4 的模型算出来的；单测钉死）

**实验台**（点光源在手电筒镜片中心；物体中心在光轴上；屏幕垂直于光轴；尺寸照 §2.2；卡片前表面离光源更近，所以数比 8 × (a + b) ÷ a 略大 0.5 %，取整后不变）：

| 圆卡片 Ø 8 cm，屏幕 30 cm（T5） | 手电筒 10 | 15 | 20 | 30 | 40 | 60 cm |
|---|---|---|---|---|---|---|
| 影子高（cm，取整） | 32 | 24 | 20 | 16 | 14 | 12 |

| 圆卡片 Ø 8 cm，手电筒 20 cm（T6） | 屏幕 10 | 20 | 30 | 40 | 50 | 60 cm |
|---|---|---|---|---|---|---|
| 影子高（cm，取整） | 12 | 16 | 20 | 24 | 28 | 32 |

形状与大小（手电筒 20 cm、屏幕 30 cm；高 × 宽 cm，取整；转向 = 绕竖直轴）：

| 物体 | 0°（正对） | 45° | 90°（侧对 / 端对） |
|---|---|---|---|
| 圆卡片 Ø 8 | 20 × 20 圆形 | 20 × 15 椭圆形 | 20 × 1 细条 |
| 正方形卡片 8 | 20 × 20 正方形 | 23 × 15 变窄的四边形 | 25 × 1 细条 |
| 三角形卡片 高 8 | 20 × 23 三角形 | 21 × 17 三角形 | 22 × 1 细条 |
| 大圆卡片 Ø 12 | 30 × 30 圆形 | 31 × 23 椭圆形 | 31 × 1 细条 |
| 罐子 Ø 6.6 × 12（横躺） | 17 × 36 长方形 | 21 × 33 两头圆的形状 | 24 × 24 圆形 |
| 纸圆锥 底 Ø 8、高 10（横躺） | 20 × 28 三角形 | 25 × 24 一头圆的形状 | 27 × 27 圆形 |
| 球 Ø 6.5 | 16 × 16 圆形 | 同 | 同 |

- 45° 时正方形卡片的影子**不是长方形**：离手电筒近的一边比远的一边高（透视），所以叫"变窄的四边形"；字幕只说"变窄"。侧对时细条的高比正对时大（卡片的近边更靠近手电筒）。球的影子比 8 × 2.5 的简单算法略大（16.5 cm，球的切线锥），模型按精确几何算。
- 形状名（状态 `shadow-shape`）是作者在数据里写的表（每件物体 × 每个角度一个名），**单测按投影轮廓核对**：圆形 / 正方形的宽高比 1 ± 0.03，细条宽 < 1.5 cm，椭圆形的宽 < 高 × 0.9，等等。

**材料**（手电筒 20 cm、屏幕 10 cm；材料片 10 × 10 cm，等面积圆半径 a = 5.64 cm）：屏幕中心的光 = 直透 T直 + 散射 T散 × a² ÷ (a² + b²) × ((a₀ + b) ÷ a₀)²（a₀ = 手电筒—材料片 20 cm，b = 材料片—屏幕；朗伯散射面的轴上照度 × 与"什么都不放"时的距离比）。b = 10 cm 时散射项系数 = 0.2414 × 2.25 = 0.543：

| 材料 | 直透 | 散射透过 | 屏幕上的光（%，取整） | 影子 |
|---|---|---|---|---|
| 透明玻璃 | 0.91 | 0 | 91 | 几乎看不出（≥ 85 %） |
| 磨砂玻璃 | 0 | 0.83 | 45 | 较淡（5–85 %） |
| 描图纸 | 0 | 0.65（暂定） | 35 | 较淡 |
| 硬纸板 | 0 | 0 | 0 | 很深（< 5 %） |

- 材料片离屏幕 30 cm 时（细看"Frosted glass lets most light through"）：系数 0.0342 × 6.25 = 0.2135 → 磨砂玻璃 18 %、描图纸 14 %：散开的光走得越远越稀，影子越深。贴近屏幕时（b → 0）散射项 → T散，影子几乎消失。
- 影子在画面里的深浅 = 1 − 读数 ÷ 100（模型输出 `sheet-dark`，叠加用）。

**有孔卡片**（手电筒 20 cm、屏幕 30 cm，孔 Ø 1.2 cm，卡片离光源 10 / 20 / 30 cm）：三个孔在屏幕上的投影半径 3.0 / 1.5 / 1.0 cm；排成一直线时交集是 Ø 2.0 cm 的亮点（`dot: yes`）；中间那张挪开 2 cm，它的孔投影移开 5 cm > 1.5 + 1.0，交集为空（`dot: no`）。

**暗箱**：手电筒开 + 球 → `eye: some`；开 + 镜子 → `eye: bright`；关 → `eye: none`，`box-dark` = 1（球变暗）。

**太阳**（NOAA 计算器算法；1.3° N、103.8° E、UTC+8；杆子 1.00 m；高度角含折射修正；方向 = 影子指的方向，从正北顺时针）。2026 年 10 月 20 日：

| 时间 | 太阳高度 | 太阳方位 | 影子方向 | 影长 |
|---|---|---|---|---|
| 8.00 am | 17° | 101° | 西（281°） | 3.25 m |
| 9.00 am | 32° | 103° | 西（283°） | 1.62 m |
| 10.00 am | 46° | 106° | 西（286°） | 0.96 m |
| 11.00 am | 60° | 114° | 西北（294°） | 0.57 m |
| 12.00 pm | 73° | 134° | 西北（314°） | 0.30 m |
| 1.00 pm | 78° | 192° | 北（12°） | 0.21 m |
| 2.00 pm | 69° | 236° | 东北（56°） | 0.38 m |
| 3.00 pm | 56° | 249° | 东（69°） | 0.69 m |
| 4.00 pm | 41° | 255° | 东（75°） | 1.14 m |
| 5.00 pm | 27° | 258° | 东（78°） | 1.99 m |
| 6.00 pm | 12° | 259° | 东（79°） | 4.70 m |
| **正午** 约 12.50 pm（12:49:42） | 78.4° | 180° | 北（0°） | 0.21 m（20.6 cm） |

另两个日期（只在拍和细看里）：2026 年 6 月 21 日正午约 1.06 pm，高度 67.9°，影长 0.41 m，指**南**；下午 1.00 时 0.41 m、南（184°）。2026 年 3 月 24 日正午约 1.11 pm，高度 89.9°，影长 0.00 m；下午 1.00 时 0.05 m、西（267°）。2026 年正午太阳离头顶不到 0.3° 的日子：3 月 23–24 日、9 月 19–20 日。

- 核对：上表与 Codex 用 NOAA 原代码算的 `sources/solar-results.json`（8.00 am、10.00 am、12.00 pm、正午、2.00 pm、4.00 pm、6.00 pm 七行）逐项一致到 0.01°、1 mm；与 NOAA 简化方程（P16）差 ≤ 0.6°（方位）、≤ 0.3°（高度），影长差 ≤ 1 %。单测用 `solar-results.json` 作夹具（`tests/space-scene/fixtures/noaa-singapore.json`，复制并注明来源）。
- **注意 P16 PDF 的方位公式**：写作 cos(180 − θ) = −(sin φ cos ζ − sin δ) ÷ (cos φ sin ζ)，照字面实现会把南北弄反；实现照 `main.js` 的 `calcAzEl`（下午取 360° 减），单测含 6 月 21 日正午方位 ≈ 0°（北）一条。
- 方向的八个名（状态 `shadow-points`）按 45° 一格、以正北为中心切分（337.5°–22.5° = 北……）；11.00 am 的 294° 刚过 292.5° 的界线读"西北"，3.00 pm 的 69° 刚过 67.5° 读"东"——细看不纠缠界线，字幕只说"大致向西 / 向东"。
- 这些数只出现在试一试卡片、PLATE 读数（都带 SIM / "在这个模型里"）和细看；正文写取整的说法（"早上 8 时三米多长""中午前后只有 20 多厘米"）。

### 2.5 模型的示意之处（S1 必须写明，细看"How this model works"引用）

1. 手电筒是点光源，影子边缘清楚；真实手电筒的反光杯和 LED 有大小，边缘会有一圈模糊（半影）。
2. 磨砂玻璃、描图纸按"把穿过的光均匀散开"算；真实材料更多地向前散，正后方的读数会高一些。
3. 硬纸板的透光取 0：真实纸板可能透过极少的光，学校的光传感器测不出。
4. 透光率是厂商对 4 mm 产品的声明和一篇论文的报告值，不是本实验台的实测（R: clear-glass-transmission 等的说明）。
5. 太阳按平行光、地面水平、天空无云；高度角含 NOAA 的平均大气折射修正；地点是新加坡的代表点，不是某所学校。
6. 暗箱里的"黑"是示意（模型把球染暗）；三维画面的环境光不会被箱子挡住。
7. 每次"实验"模型给同一个数；真实实验要定好量影子边缘的办法、量几次（R: shape-and-fair-test-designs、transmission-measurement-method）。

---

## 3. 对象、写实与零件

### 3.1 分区

| 分区 | 组 id | 名称 EN / ZH | 内容 | 组色（token） |
|---|---|---|---|---|
| 01 | `source` | Light source / 光源 | 手电筒、手电筒支架与滑座、轨道 | `token:ink-2` |
| 02 | `objects` | Objects / 物体 | 物体支架、七件物体 | `token:ink-3` |
| 03 | `sheets` | Sheets / 材料片 | 四种材料片 | `token:neutral` |
| 04 | `screen` | Screen / 屏幕 | 屏幕板、屏幕支架与滑座、光传感器、数据记录器 | `token:cold` |
| 05 | `hole-cards` | Cards with holes / 有孔的卡片 | 三张有孔卡片 | `token:accent-2` |
| 06 | `dark-box` | Dark box / 暗箱 | 暗箱、箱内手电筒、球、镜子 | `token:cut` |
| 07 | `outdoors` | Courtyard / 户外空地 | 杆子、指北箭头、太阳、三条太阳路径；context：水泥地 | `token:loop` |
| — | `rays` | Light rays / 光线 | 只有流与叠加：暗箱里的光路（流）、实验台与户外的光线（`shadow-cast` 的 `rays`） | `token:en-light` |

- 右上卡：零件链路卡（默认）。`connects`：手电筒 → 物体支架 → 屏幕 → 光传感器 → 数据记录器；暗箱：箱内手电筒 → 球 / 镜子 → 暗箱（小孔）。`outdoors`、`sheets`、`hole-cards` 不进链路卡（`card: false`），避免一张卡上十几个节点。不需要新卡片（docs/33 的环卡、docs/31 的能量链卡都不适用）。
- context：`bench-table`（教室桌，不属于任何组）、`courtyard`（水泥地，属于 `outdoors`，受图层控制；它是太阳影子的接收面）。

### 3.2 坐标与尺度

- 单位：1 场景单位 = 1 m（`units: { modelUnit: "cm", scale: 100 }`，比例尺写 `10 CM`）。Y 向上，地面 y = 0；+Z 朝观者；+X 向右。**户外的北 = −Z**，东 = +X（俯视时北在上）。
- **实验桌**：桌面 1.8 × 0.6 m，面高 y = 0.75，中心 (0, 0.75, 0)。轨道沿 x 在 z = 0.05，从 x = −0.75 到 +0.75（刻度 0 在左端）。**光轴** y = 1.00、z = 0.05。物体支架中心 (0, 1.00, 0.05)；手电筒镜片中心 (−d_torch, 1.00, 0.05)；屏幕前表面 x = +d_screen（屏幕 60 × 45 cm，中心在光轴上，下缘 y = 0.775）。
- **有孔卡片**：中心 x = −0.10 / 0 / +0.10（中间那张由支架夹着），孔心在光轴上；挪开 = 中间那张沿 +z 移 2 cm（姿态）。
- **暗箱**：外形 0.30 × 0.18 × 0.20 m，中心 (−0.45, 0.84, −0.18)，在轨道后面；正面（+z）小孔 Ø 1 cm 在 (−0.45, 0.86, −0.08)；左面一个插手电筒的孔，箱内手电筒镜片 (−0.585, 0.86, −0.18) 朝 +x；球 Ø 6.5 cm 心在 (−0.42, 0.7875, −0.20)；镜子 6 × 6 cm 在 (−0.36, 0.86, −0.18)，法线按"手电筒的光反射到小孔"由生成脚本算（入射 +x、出射指向小孔，法线 = 出射 − 入射归一化）。
- **户外空地**：中心 (10, 0, 0)；水泥地半径 5.5 m、厚 5 cm（上表面 y = 0.05，接收面）；杆子竖直，底在 (10, 0.05, 0)，高 1.00 m（杆顶 y = 1.05），Ø 3 cm，插在 Ø 20 cm 的重底座上（底座高 4 cm，也挡光，但它的影子很短，算进 `pole`）；指北箭头平躺在地上 (10, 0.051, −4.6)，长 0.6 m 指向 −z；太阳圆盘（示意，Ø 0.5 m）在杆底上方、沿太阳方向 7 m 处（`place` 绑定，§4.6）；三条太阳路径 = 杆底为心、半径 7 m 的球面上该日 7 am–7 pm 太阳经过的弧（生成脚本用 `sun.ts` 算出点，`sweep` 细管，Ø 1 cm）。
- 整体包络约 x −0.9 … 17.5、z −7 … 5.5；两处距离 10 m，各自的预设镜头取景。投影规则改为 `views.shadows: "contact"`（D4）：任何零件都不投引擎主光的影子。

### 3.3 Tier-1（一眼能认）与参考图

| 对象 | 一眼要认出的 |
|---|---|
| 实验台 | 一张教室桌上一条带刻度的直轨道，轨道上三只滑座：左边手电筒朝右、中间细杆上夹着卡片、右边竖着一块白板；手电筒和卡片、白板中心在同一条水平线上 |
| 手电筒 | 圆筒形机身、粗一点的头、镜片、一个按钮；装在可升降的夹座上（不画手） |
| 卡片剪影 | 硬纸板的颜色与厚度（侧面看得到 2 mm 的边），夹在细杆的夹子上 |
| 罐子、圆锥、球 | 无字无图的铁罐（罐口的卷边）、纸卷成的圆锥（一条接缝）、毛面的球；横躺在小托架上 |
| 材料片 | 透明玻璃（看得见后面的白板、边缘泛青）、磨砂玻璃（乳白、哑光）、描图纸（半透明、略皱、夹在夹子上）、硬纸板（灰褐） |
| 屏幕 | 白色卡纸板装在竖直的框上，下面是滑座；中心夹着一只小光传感器，一根短线沿立柱下来，连到滑座平台上的数据记录器（小盒子 + 小屏，屏上不写字） |
| 暗箱 | 一只鞋盒大小的盒子，盖子盖着，正面一个小孔，左面插着一支小手电筒 |
| 空地 | 平整的浅灰水泥地，一根竖直的细杆插在圆形重底座上，地上一个指北箭头；天上一个示意的太阳 |

**参考图**（`scripts/geo/light-and-shadows/refs/`，gitignore，不发布；施工第 1 步下载，逐张在 §9 记来源与许可）：

| # | 内容 | 候选来源 | 许可 | 看什么 |
|---|---|---|---|---|
| R1 | 学校光学轨道 / 光具座 | Wikimedia Commons "Optical bench" 类目；教育器材公开图（只看） | CC / 版权（只作参考） | 轨道截面、滑座、夹具的比例 |
| R2 | 小型 LED 手电筒 | Commons "Flashlights" | CC | 机身与头部比例、镜片 |
| R3 | 屏幕与支架 | 自行设计（白卡纸板 + 框） | — | — |
| R4 | 磨砂玻璃、描图纸的外观 | Commons "Frosted glass"、"Tracing paper" | CC | 乳白程度、纸的半透明与纹理 |
| R5 | 光传感器与数据记录器 | 教育器材公开图（只看，不画品牌） | 版权（只作参考） | 探头大小、线、记录器的形状 |
| R6 | 学校空地上的影子杆（gnomon）活动 | Commons "Gnomon"、"Shadow stick" | CC | 杆子与底座、地面标记 |
| R7 | 暗箱 / 窥视箱（peep box） | Primary Connections 第 2 课的图（只看）；自行设计 | 版权（只作参考） | 小孔与手电筒孔的位置 |

### 3.4 零件（32 个 + 2 个 context）

材质族见 docs/06「作者怎么写数据」；"挡光" = 是 `shadow-cast` 的挡光物；"隐 / 绑定" 写由谁控制。坐标见 §3.2。

| # | id 名称 EN / ZH | 组 | primitive（+ extra） | 材质 | 挡光 | 隐 / 绑定 | 参考 |
|---|---|---|---|---|---|---|---|
| 01 | `torch` Torch / 手电筒 | source | **主 primitive = 镜片**（扁 `cylinder`，`glow` 只点亮槽 0）；extra：机身 `lathe`、头部 `lathe`、按钮 | 镜片 `glass` + `token:lamp` 发光；机身 `powder` 深灰 | | `glow` ← 输出 `torch-lit`；`offset` ← `d-torch` | R2 |
| 02 | `torch-stand` Torch clamp / 手电筒夹座 | source | 夹子 + 立杆 + 滑座（`bevelBox`、`cylinder`） | `steel` + `powder` | | `offset` ← `d-torch` | R1 |
| 03 | `track` Track / 轨道 | source | 150 cm 铝型材（`extrude` 截面）+ 刻度 extra（150 根细条，每 10 cm 一根长的，同材质合并） | `casing` + 墨色刻度 | | — | R1 |
| 04 | `object-holder` Holder / 物体支架 | objects | 滑座 + 4 mm 细杆 + 夹子 + 小托架（放罐子、圆锥、球） | `steel` | ✓ | — | R1 |
| 05 | `card-circle` Circle card / 圆形卡片 | objects | `lathe` 薄圆盘 Ø 8 cm、厚 2 mm（64 段） | `plastic` tint 纸板灰褐 `#b39a78` | ✓ | `visible` ← `object` = card-circle；`rotate` ← `turn` | — |
| 06 | `card-square` Square card / 正方形卡片 | objects | `bevelBox` 8 × 8 × 0.2 cm | 同上 | ✓ | 同上 | — |
| 07 | `card-triangle` Triangle card / 三角形卡片 | objects | `extrude` 三角形（高 8 cm，尖朝上），厚 2 mm | 同上 | ✓ | 同上 | — |
| 08 | `card-circle-big` Big circle card / 大圆卡片 | objects | `lathe` Ø 12 cm | 同上 | ✓ | 同上 | — |
| 09 | `tin` Tin / 罐子 | objects | `lathe` 罐身（Ø 6.6、长 12 cm，两端卷边），轴沿 z（横过轨道） | `stainless` | ✓ | 同上 | — |
| 10 | `cone` Paper cone / 纸圆锥 | objects | `lathe` 圆锥（底 Ø 8、高 10 cm，薄壁、开口在底），轴沿 z，尖朝 +z；extra：接缝细条 | `plastic` 白纸 tint `#e8e2d4` | ✓ | 同上 | — |
| 11 | `ball` Ball / 球 | objects | `lathe` 球（Ø 6.5 cm，48 段；不用 `sphere`，docs/33 §9.2 差异 #14） | `fabric` tint 浅黄绿（毛面） | ✓ | 同上 | — |
| 12 | `clear-glass` Clear glass / 透明玻璃 | sheets | `bevelBox` 10 × 10 × 0.4 cm | `glass` | ✓（深浅 ← `sheet-dark`） | `visible` ← `material` | R4 |
| 13 | `frosted-glass` Frosted glass / 磨砂玻璃 | sheets | 同上 | `enamel` tint 乳白、粗糙（不透明的材质画法，乳白读得出"磨砂"）；`shell`（X-RAY 下变透明，读者看见后面） | ✓ | 同上 | R4 |
| 14 | `tracing-paper` Tracing paper / 描图纸 | sheets | 薄 `plane` 10 × 10 cm（轻微起伏的 `curvedPanel`）+ 顶端夹子 | `membrane` tint 暖白 | ✓ | 同上 | R4 |
| 15 | `cardboard-sheet` Cardboard / 硬纸板 | sheets | `bevelBox` 10 × 10 × 0.3 cm | `plastic` tint 纸板灰褐 | ✓ | 同上 | — |
| 16 | `screen-board` Screen / 屏幕 | screen | `bevelBox` 60 × 45 × 0.5 cm，面朝 −x | `enamel` 暖白 | 接收面 | `offset` ← `d-screen` | R3 |
| 17 | `screen-stand` Screen stand / 屏幕支架 | screen | 框（细 `bevelBox` 四边）+ 立柱 + 滑座 | `powder` | | `offset` ← `d-screen` | R3 |
| 18 | `light-sensor` Light sensor / 光传感器 | screen | 小圆柱探头（Ø 1.6 cm）夹在屏幕中心的背面、感光窗朝 −x 从屏幕的小孔露出；extra：线（`sweep`，沿屏幕支架立柱下到滑座平台，再到数据记录器） | `rubber` + `glass` 窗 | | `offset` ← `d-screen` | R5 |
| 19 | `datalogger` Datalogger / 数据记录器 | screen | `bevelBox` 小盒 + 一块深色小屏（无字），放在屏幕滑座的平台上 | `plastic` 深灰 | | `offset` ← `d-screen` | R5 |
| 20 | `hole-card-1` Card with a hole 1 / 有孔卡片 1 | hole-cards | `panelHole` 10 × 10 × 0.2 cm、孔 Ø 1.2 cm + 小滑座 | `plastic` 纸板灰褐 | ✓ | 章节 `hide`（只在 02 出现） | — |
| 21 | `hole-card-2` Card with a hole 2 / 有孔卡片 2 | hole-cards | 同上（夹在物体支架上） | 同上 | ✓ | `pose` ← `middle` = moved（`hole-moved`：+z 2 cm） | — |
| 22 | `hole-card-3` Card with a hole 3 / 有孔卡片 3 | hole-cards | 同 20 | 同上 | ✓ | 同 20 | — |
| 23 | `box` Dark box / 暗箱 | dark-box | 鞋盒：`panelHole` 正面（小孔 Ø 1 cm）+ 四面 + 盖（`bevelBox` 薄板，盖略大）；左面 `panelHole`（手电筒孔）；内壁黑 | `plastic` tint 牛皮纸色（外）+ `powder` 黑（内壁 extra） | | `shell: true`（X-RAY 看里面） | R7 |
| 24 | `box-torch` Small torch / 小手电筒 | dark-box | 同 01 的小一号（主 primitive = 镜片） | 同 01 | | `glow` ← 输出 `box-lit` | R2 |
| 25 | `box-ball` Ball in the box / 箱里的球 | dark-box | 同 11 | 同 11 | | `visible` ← `in-box` = ball；`tint` ← `box-dark`（`token:ink`，full 1） | — |
| 26 | `box-mirror` Mirror / 镜子 | dark-box | 6 × 6 × 0.3 cm `bevelBox` + 小支架；朝向见 §3.2 | `stainless` 抛光（`roughness` 低，`tint` 浅） | | `visible` ← `in-box` = mirror | — |
| 27 | `pole` Pole / 杆子 | outdoors | `cylinder` Ø 3 cm × 1.00 m + 底座 `lathe` Ø 20 × 4 cm | `wood` + `powder` 底座 | ✓（太阳） | `castShadow: false`（D4） | R6 |
| 28 | `north-arrow` North arrow / 指北箭头 | outdoors | 平躺的 `extrude` 箭头（长 0.6 m）+ 一个小圆盘 | `enamel` 白（像地上的漆） | | — | R6 |
| 29 | `sun` Sun (not to scale) / 太阳（不按比例） | outdoors | `lathe` 扁圆盘 Ø 0.5 m，局部 +Y 是盘面法线 | `token:en-light` 平涂 | | `place` ← `sun-at`（§4.6，`face: centre` 让盘面正对杆底） | — |
| 30 | `sun-path-oct` Sun's path, 20 Oct / 太阳路径（10 月 20 日） | outdoors | `sweep` 细管（生成脚本按 `sun.ts` 每 15 分钟一点） | `token:en-light` 40 % | | `visible` ← `date` = oct-20 | — |
| 31 | `sun-path-jun` Sun's path, 21 Jun / 太阳路径（6 月 21 日） | outdoors | 同上 | 同上 | | `visible` ← `date` = jun-21 | — |
| 32 | `sun-path-mar` Sun's path, 24 Mar / 太阳路径（3 月 24 日） | outdoors | 同上 | 同上 | | `visible` ← `date` = mar-24 | — |
| c1 | `bench-table` Classroom table / 教室桌 | — | 桌面 `bevelBox` + 四条腿 | `wood` 浅 + `powder` 腿 | | — | |
| c2 | `courtyard` Courtyard / 水泥地 | outdoors | `lathe` 扁圆台（半径 5.5 m、厚 5 cm），细接缝 extra（每 1 m 一条） | `enamel` tint 浅灰水泥 | 接收面 | — | R6 |

- 数据记录器放在屏幕滑座的平台上、和传感器的线一起随屏幕移动：线是刚体 `sweep`，不能伸缩（`stretch` 只给 `coil`），两头都跟着屏幕走就不会脱节。
- 零件数理由：每件挡光物一件（它们各自显示、各自投影）；暗箱四件（各自要标注、要切换）；太阳三条路径各一件（按日期显示）。删减顺序（超预算时）：`card-circle-big` 并进"大小"细看（第 04 章第 6 拍改用 `ball` 对比）→ `sun-path-jun`、`sun-path-mar` 删去（只留 10 月）→ `datalogger` 并进 `light-sensor`。
- **绘制预算**（§8.2 验收）：实验台静止 ≤ 45 calls（零件约 30 个材质槽 + 影子 1–5 + 光斑 1 + 光线 1）、运转 ≤ 50；户外 ≤ 20；上限 100。三角形 < 0.25 M（球、罐子、圆锥都用 `lathe` 低面数；刻度合并）。
- 默认不隐藏零件；暗箱、有孔卡片、户外各组由章节 `layers` 与 `hide` 控制（§5.0）。

### 3.5 summary / detail 要点（施工时写成 EN / ZH）

| id | summary（它做什么，≤ 60 字符） | detail 要点 |
|---|---|---|
| `torch` | A light source: it gives out its own light. / 光源：自己发出光。 | 点光源的示意（D5、F-11）；光束 ±40°；不要用它照别人的眼睛 |
| `track` | Keeps the torch, object and screen in a line. / 让手电筒、物体、屏幕排成一线。 | 150 cm、1 cm 刻度；距离从滑座读 |
| `object-holder` | Holds the object on the line of the light. / 把物体固定在光的路线上。 | 它的细杆也挡光：屏幕下方那条细影（F-13） |
| `card-circle` 等卡片 | Blocks light; its shadow has its outline. / 挡住光，影子是它的轮廓。 | 8 cm、2 mm 厚（F-13）；转过去影子变窄（§2.4） |
| `tin` | Side-on a rectangle, end-on a circle. / 侧对是长方形，端对是圆形。 | §2.4；"同一物体，不同影子" |
| `cone` | Side-on a triangle, end-on a circle. / 侧对是三角形，端对是圆形。 | 同上 |
| `ball` | Makes a round shadow whichever way it turns. / 怎么转影子都是圆的。 | 16.5 cm（§2.4，球的切线锥） |
| `clear-glass` | Lets most light through; you can see through it. / 让大部分光穿过，看得清后面。 | 91 %（F-17）；8 % 反射、少量吸收 |
| `frosted-glass` | Lets light through but scatters it. / 让光穿过，但把光散开。 | 83 %（F-18）；看不清后面；离屏幕越远影子越深（§2.4） |
| `tracing-paper` | Lets some light through and scatters it. / 让一部分光穿过，并把光散开。 | 约 65 %（F-19，暂定） |
| `cardboard-sheet` | Lets no light through. / 不让光穿过。 | 模型 0（F-20，学校的传感器测不出） |
| `screen-board` | Catches the light and the shadow. / 接住光和影子。 | 60 × 45 cm；墙、地面、白纸都能当屏幕 |
| `light-sensor` | Measures how much light reaches the screen. / 测量照到屏幕的光有多少。 | 读"和什么都不放时比"的 %（F-16）；只测它那一小块地方 |
| `datalogger` | Shows and records the sensor's readings. / 显示并记录传感器的读数。 | — |
| `hole-card-1/2/3` | Light passes only when the holes line up. / 小孔排成直线，光才穿得过。 | Ø 1.2 cm；挪 2 cm 就挡住（§2.4） |
| `box` | A closed box: no light gets in except the torch's. / 一只封闭的盒子，只有手电筒的光进得来。 | 内壁黑；小孔 Ø 1 cm |
| `box-torch` | The only light source inside the box. / 箱里唯一的光源。 | — |
| `box-ball` | Seen only when it reflects light to your eye. / 把光反射进眼睛，才被看见。 | 暗的、毛面的东西也反射光（F-3） |
| `box-mirror` | Reflects light very well. / 把光反射得很好。 | 不讲角度（D2） |
| `pole` | A 1 m pole: its shadow shows where the Sun is. / 1 米长的杆子，影子告诉你太阳在哪里。 | 影长 = 杆长 ÷ tan(高度角)（F-25，细看"中学会学"） |
| `north-arrow` | Points north. / 指向北方。 | 方向从正北顺时针量 |
| `sun` | The light source outdoors (not to scale). / 户外的光源（不按比例）。 | 不要直视太阳；视直径约 0.5°（F-26） |
| `sun-path-*` | The Sun's path across the sky on that day. / 那一天太阳在天上走过的路线。 | NOAA 算法（F-24）；太阳看起来移动是因为地球在转（F-27） |

### 3.6 流（暗箱里的光路，静态）

颜色语义：`--en-light`（光能，全站唯一）= 光；粒子从光源向外走 = 光传播的方向。流只在暗箱用：那里的光路不随控件移动，静态路径就够（实验台与户外的光线随手电筒、屏幕、太阳移动，由 `shadow-cast` 叠加计算，§4.5）。

| id | group | 路径（多路径） | speed | count | size | 绑定 |
|---|---|---|---|---|---|---|
| `box-ball-light` | rays | `in`：小手电筒镜片 → 球面；`out`：球面 → 小孔 → 小孔外 0.15 m（朝观者）；`side-1`…`side-3`：球面向上、向后、向右的三段短线（各 0.06 m，表示"向各个方向反射"） | 0.25 | 160 | 0.4 | `visible` ← `eye` = some；`whenRun: false` |
| `box-mirror-light` | rays | `in`：镜片 → 镜面；`out`：镜面 → 小孔 → 小孔外 0.15 m | 0.25 | 120 | 0.5 | `visible` ← `eye` = bright |

合计 +2 次绘制（只在暗箱可见时）。

### 3.7 动画与姿态

- **动画**：无（光线的虚线流动在 `shadow-cast` 里，随 RUN）。
- **姿态**（`poses`）：

| 名 | 零件 | 变换 | 用在 |
|---|---|---|---|
| `hole-moved` | `hole-card-2` | offset +z 0.02 | `middle` = moved（T2 绑定） |

- 暗箱不开盖：看里面靠 X-RAY（`box` 是 `shell`），字幕说"盖子盖着"。

### 3.8 HUD 数据

- **标题**：EN "Light and Shadows" / ZH "光与影"；副标题 EN "How we see, why shadows form, and what changes their shape and size" / ZH "我们怎样看见东西，影子怎样形成，什么会改变影子的形状和大小"；`shortTitle` EN "Light" / ZH "光与影"；`moe`：`["MOE 2023 Science P4 Energy Forms and Uses (Light)", "MOE 2023 Science P3 Diversity of Materials (transparency)"]`；`tags: [singapore, psle, p4, light, space]`；`illustration: light-and-shadows`。
- **规格行**（≤ 4）：

| key EN / ZH | value | tag |
|---|---|---|
| Track / 轨道 | `150 CM · 1 CM MARKS` / `150 厘米 · 1 厘米刻度` | design |
| Torch / 手电筒 | `LED · BEAM ±40°` / `LED · 光束 ±40°` | design |
| Card / 卡片 | `Ø 8 CM · 2 MM THICK` / `直径 8 厘米 · 厚 2 毫米` | design |
| Sun / 太阳 | `NOAA · 1.3° N 103.8° E · UTC+8` | typical |

- **PLATE 读数**（`telemetry` ≤ 6，全部 `follow`、SIM；`scope: "observe"` = 本章卡片不观察时显示 `—`）：

| key EN / ZH | follow | unit | scope |
|---|---|---|---|
| Shadow H · W / 影子 高 · 宽 | `shadow-height`、`shadow-width` | cm | observe |
| Gaps T · S / 距离 手 · 屏 | `gap-torch`、`gap-screen` | cm | — |
| Light on screen / 屏上的光 | `light-behind` | % | observe |
| Sun height / 太阳高度 | `sun-height` | ° | observe |
| Shadow length / 影长 | `shadow-length` | m | observe |
| Time / 时间 | `time-now`（`format: time`） | — | observe |

  块尾 `SIM <本章卡片观察的状态> · <改变量的值>`（如 `SIM OVAL · 45°`、`SIM WEST · 8.00 AM`）。
- **镜头预设**（≤ 6，id 不与组同名）：

| # | id | label | 用途 |
|---|---|---|---|
| 1 | `bench-view` | BENCH | 实验台 3/4 前右上：手电筒在左、屏幕在右、屏上的影子看得见（hero 同构图，`views.assembled.camera`） |
| 2 | `side-view` | SIDE | 从 +z 正侧面平视光轴，长焦 fov 18：光线与两个"相似三角形"一目了然（05、06 的主镜头） |
| 3 | `screen-view` | SCREEN | 从手电筒后上方越过物体看屏幕：影子的形状正对读者（03、04） |
| 4 | `box-view` | BOX | 暗箱前左上方，能看见小孔和插着的手电筒（01） |
| 5 | `yard-view` | YARD | 空地 3/4，从东南方高处看（北在远处），太阳和路径都在框里（07） |
| 6 | `sky-view` | ABOVE | 空地正上方俯视（北在上），看影子方向与粉笔点（07） |

- `views.section.plane: "xy"`（PLATE 立面画侧视：光轴、手电筒、物体、屏幕的距离最清楚）；`views.cover` = `bench-view` 略拉远；`views.shadows: "contact"`（D4、§4.6）；不设剖切面。
- **模式组合**：X-RAY（暗箱 `shell` 透明看里面；磨砂玻璃 `shell` 透明）；EXPLODED（引擎禁用 FLOW；`shadow-cast` 在拆开时淡出——影子不跟着拆开，免得画出错误的影子）；REFERENCE（冻结 sim，影子照常）；hide + EXPLODED 照常。

---

## 4. 引擎

### 4.1 要看得见的东西（课纲 → 画面 → 机制）

| 课纲要的 | 画面 | 机制 |
|---|---|---|
| 看见 = 光源发光或物体反射光进眼睛 | 暗箱：手电筒开 / 关，光从球或镜子经小孔出来朝向读者 | 流 + `visible` / `glow` / `tint` 绑定（已有）；`seeing` 子模型（新） |
| 光沿直线传播 | 三张有孔卡片：排成一线时屏上一个亮点，挪开一张就没有 | `shadow-cast` 把三张卡的真实网格投影、取并集——亮点由几何自然出现（新）；`holes` 子模型给状态（新） |
| 完全挡住 / 部分挡住 → 影子 | 屏幕上光斑里的影子；材料片的影子深浅不同 | `shadow-cast`（新）+ `sheets` 子模型的 `sheet-dark` |
| 形状、大小、位置 | 换物体、转物体；影子的形状和 cm 读数 | `bench` 子模型（新）+ `rotate` / `visible` 绑定（已有） |
| 光源—物体、物体—屏幕的距离 | 手电筒、屏幕在轨道上移动，影子跟着平滑变大变小，光线跟着转 | `offset` 绑定（已有，0.5 s 缓动）+ `shadow-cast` 每帧按零件当前位置重算（新） |
| 公平测试、表与图 | 卡片三行、记一行、条形图 / 折线图、先猜后看 | 已有（docs/30 F5、F6） |
| 太阳下的影子 | 杆子的影子随时间转向、变长变短；太阳在弧上；粉笔点留下每小时影子尖端的位置 | `sun` 子模型（新）+ `place` 绑定（新）+ `shadow-cast` 的平行光与 `trail`（新） |

### 4.2 影子的画法（D4 的实现约束）

- **投影**：对每个挡光物零件（它当前的世界矩阵与全部几何，含 `extra`），在顶点着色器里乘一个平面投影矩阵：点光源 L（齐次 w = 1）、平行光（w = 0，方向 = 太阳指向地面的反方向），平面 n·x + d = 0：M = (n·L) I − L nᵀ（4 × 4）。投影后的顶点沿平面法线朝光源偏 1 mm（`polygonOffset` 再加一档），画在接收面上。
- **平涂、不透明**：影子颜色 = 接收面颜色变暗（paper：`token:ink` 按 0.55 × 深浅混入；cinema：黑按 0.6 × 深浅），用不透明的预混颜色画，所以一个物体投影后重叠的三角形**不会叠深**，三张有孔卡片的影子自然取并集。深浅：挡光物默认 1；材料片 = 模型输出 `sheet-dark`（0.09 / 0.55 / 0.65 / 1）。
- **裁剪**：屏幕矩形 = 四个世界坐标裁剪面（材质自带 `clippingPlanes`，与 CUTAWAY 的全局剖切互不影响）；手电筒光束 = 片元着色器里与光轴夹角 > 40° 的丢弃；空地 = 半径 5.5 m 的圆，片元里丢弃。
- **光斑**：接收面上光束圆锥与平面的交（圆或椭圆）画一层 `token:en-light`，不透明度 = clamp(0.35 × (0.40 m ÷ D)², 0.12, 0.45)（D = 光源到屏幕中心，DESIGN：只是看起来"越远越暗"，不进读数）；边缘 3 % 渐隐。影子画在光斑之上。手电筒关（`torch-on` = false）→ 光斑、影子、光线都淡出（0.3 s）。
- **何时重算**：零件矩阵变了（`offset` / `rotate` / `pose` 缓动中）或控件变了才写 uniform 并要帧；静止时零开销（`frameloop: 'demand'`）。
- **与读数一致**：叠加每次重算时，顺手求出每个挡光物投影在接收面局部坐标里的包围盒（cm），挂在 `__atlas.engine.shadows()`；e2e 比对它与模型输出 `shadow-height` / `shadow-width`（差 < 0.2 cm）。模型（纯函数，按解析几何采样）与叠加（按网格）两条路得到同一个数，网格分段带来的误差 < 0.2 %。
- **不做**：半影（v2：一个面光源多采样）、接收面以外的物体上的影子（例如影子落到桌面上）——本主题所有影子都只落在屏幕和空地上；物体支架的滑座在光轴下方，影子落在桌面以下，不画。

### 4.3 模型 `light`（E-L1；`lib/sim/light.ts` + `lib/sim/sun.ts`，纯函数，有单测）

```jsonc
"sim": {
  "kind": "light",
  "controls": [
    { "id": "d-torch",  "kind": "step", "values": [10, 15, 20, 30, 40, 60], "default": 20, "unit": "cm", "label": { "en": "Torch to object", "zh": "手电筒到物体" } },
    { "id": "d-screen", "kind": "step", "values": [10, 20, 30, 40, 50, 60], "default": 30, "unit": "cm", "label": { "en": "Object to screen", "zh": "物体到屏幕" } },
    { "id": "object", "kind": "choice", "default": "card-circle", "label": { "en": "Object", "zh": "物体" },
      "options": [ { "id": "none", "label": {…} },
                   { "id": "card-circle", "label": {…}, "sets": { "material": "none" } }, … ,          // 七件物体都 sets material: none
                   { "id": "ball", "label": {…}, "sets": { "material": "none" } } ] },
    { "id": "turn", "kind": "step", "values": [0, 45, 90], "default": 0, "unit": "°", "label": { "en": "Turned", "zh": "转过的角度" } },
    { "id": "material", "kind": "choice", "default": "none", "label": { "en": "Sheet in the holder", "zh": "支架上的材料片" },
      "options": [ { "id": "none", … }, { "id": "clear-glass", …, "sets": { "object": "none" } }, { "id": "frosted-glass", … }, { "id": "tracing-paper", … }, { "id": "cardboard", … } ] },
    { "id": "middle", "kind": "choice", "default": "in-line", "options": [ { "id": "in-line", "label": { "en": "In a line", "zh": "排成一直线" } }, { "id": "moved", "label": { "en": "Middle card moved", "zh": "中间那张挪开" } } ] },
    { "id": "torch-on", "kind": "toggle", "default": true, "label": { "en": "Torch on", "zh": "打开手电筒" } },
    { "id": "box-torch", "kind": "toggle", "default": true, "label": { "en": "Torch in the box on", "zh": "打开箱里的手电筒" } },
    { "id": "in-box", "kind": "choice", "default": "ball", "options": [ { "id": "ball", … }, { "id": "mirror", … } ] },
    { "id": "time", "kind": "step", "values": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], "default": 10, "unit": "h", "format": "time", "label": { "en": "Time of day", "zh": "时间" } },
    { "id": "date", "kind": "choice", "default": "oct-20", "options": [ { "id": "oct-20", "label": { "en": "20 Oct 2026", "zh": "2026 年 10 月 20 日" } }, { "id": "jun-21", … }, { "id": "mar-24", … } ] }
  ],
  "outputs": [
    { "id": "shadow-height", "from": "shadow:height", "unit": "cm", "decimals": 0 },
    { "id": "shadow-width",  "from": "shadow:width",  "unit": "cm", "decimals": 0 },
    { "id": "shadow-shape",  "kind": "state", "from": "shadow:shape", "states": { "none": {…}, "circle": {…}, "oval": {…}, "square": {…}, "four-sided": {…}, "triangle": {…}, "thin-strip": {…}, "rectangle": {…}, "round-ends": {…}, "round-end": {…} } },
    { "id": "gap-torch",  "from": "control:d-torch",  "unit": "cm", "decimals": 0 },
    { "id": "gap-screen", "from": "control:d-screen", "unit": "cm", "decimals": 0 },
    { "id": "light-behind", "from": "sheet:light", "unit": "%", "decimals": 0 },
    { "id": "shadow-kind", "kind": "state", "from": "sheet:kind", "states": { "none": {…}, "hardly": {…}, "lighter": {…}, "dark": {…} } },
    { "id": "sheet-dark", "from": "sheet:dark" },                                   // 0–1，只给叠加
    { "id": "dot", "kind": "state", "from": "holes:dot", "states": { "yes": {…}, "no": {…} } },
    { "id": "eye", "kind": "state", "from": "seeing:eye", "states": { "none": {…}, "some": {…}, "bright": {…} } },
    { "id": "box-dark", "from": "seeing:dark" },                                    // 1 = 箱里没有光
    { "id": "torch-lit", "from": "control:torch-on" },                              // 1 / 0，给 glow（控件绑定拿到的是布尔值，glow 要数）
    { "id": "box-lit", "from": "control:box-torch" },
    { "id": "sun-height", "from": "sun:height", "unit": "°", "decimals": 0 },
    { "id": "shadow-length", "from": "sun:length", "unit": "m", "decimals": 2 },
    { "id": "shadow-points", "kind": "state", "from": "sun:points", "states": { "north": {…}, "north-east": {…}, "east": {…}, "south-east": {…}, "south": {…}, "south-west": {…}, "west": {…}, "north-west": {…} } },
    { "id": "noon", "from": "sun:noon", "unit": "h", "format": "time" },            // 当天正午（太阳最高）
    { "id": "noon-length", "from": "sun:noon-length", "unit": "m", "decimals": 2 },
    { "id": "time-now", "from": "control:time", "unit": "h", "format": "time" },
    { "id": "sun-at", "kind": "vector", "from": "sun:at" }                           // { x, y, z }：从杆底指向太阳的单位向量（场景坐标，北 = −z）
  ],
  "bind": [
    { "control": "d-torch",  "part": ["torch", "torch-stand"], "offset": { "axis": [-1, 0, 0], "per": 0.01, "origin": 0 } },
    { "control": "d-screen", "part": ["screen-board", "screen-stand", "light-sensor", "datalogger"], "offset": { "axis": [1, 0, 0], "per": 0.01, "origin": 0 } },
    { "control": "object", "part": "card-circle", "visible": { "eq": "card-circle" } }, …,                       // 七件
    { "control": "turn", "part": ["card-circle", "card-square", "card-triangle", "card-circle-big", "tin", "cone", "ball"], "rotate": { "axis": [0, 1, 0], "per": 1, "pivot": [0, 1.00, 0.05] } },
    { "control": "material", "part": "clear-glass", "visible": { "eq": "clear-glass" } }, …,                     // 四片
    { "control": "middle", "part": "hole-card-2", "pose": { "moved": "hole-moved" } },
    { "output": "torch-lit", "part": "torch", "glow": { "color": "token:lamp", "full": 1, "curve": "linear" } },
    { "output": "box-lit", "part": "box-torch", "glow": { "color": "token:lamp", "full": 1, "curve": "linear" } },
    { "control": "in-box", "part": "box-ball", "visible": { "eq": "ball" } },
    { "control": "in-box", "part": "box-mirror", "visible": { "eq": "mirror" } },
    { "output": "box-dark", "part": "box-ball", "tint": { "color": "token:ink", "full": 1 } },
    { "output": "eye", "flow": "box-ball-light", "visible": { "eq": "some" } },
    { "output": "eye", "flow": "box-mirror-light", "visible": { "eq": "bright" } },
    { "output": "sun-at", "part": "sun", "place": { "centre": [10, 0.05, 0], "radius": 7, "face": "centre" } },
    { "control": "date", "part": "sun-path-oct", "visible": { "eq": "oct-20" } }, …                               // 三条
  ],
  "overlays": [ /* §4.5：两个 shadow-cast */ ],
  "light": {
    "bench": {
      "source": { "part": "torch", "point": [0, 1.00, 0.05], "axis": [1, 0, 0], "beam": 40 },   // point = d-torch 为 0 时镜片中心（随 offset 走）
      "power": "torch-on", "gaps": { "torch": "d-torch", "screen": "d-screen" },
      "holder": [0, 1.00, 0.05],
      "screen": { "part": "screen-board", "size": [60, 45] },
      "object": "object", "turn": "turn",
      "objects": {
        "card-circle":     { "part": "card-circle",     "shape": { "kind": "disc", "d": 8, "thick": 0.2 },   "names": { "0": "circle", "45": "oval", "90": "thin-strip" } },
        "card-square":     { "part": "card-square",     "shape": { "kind": "polygon", "points": [[-4,-4],[4,-4],[4,4],[-4,4]], "thick": 0.2 }, "names": { "0": "square", "45": "four-sided", "90": "thin-strip" } },
        "card-triangle":   { "part": "card-triangle",   "shape": { "kind": "polygon", "points": [[-4.619,-2.667],[4.619,-2.667],[0,5.333]], "thick": 0.2 }, "names": { "0": "triangle", "45": "triangle", "90": "thin-strip" } },
        "card-circle-big": { "part": "card-circle-big", "shape": { "kind": "disc", "d": 12, "thick": 0.2 },  "names": { "0": "circle", "45": "oval", "90": "thin-strip" } },
        "tin":             { "part": "tin",  "shape": { "kind": "cylinder", "d": 6.6, "length": 12, "axis": "z" },              "names": { "0": "rectangle", "45": "round-ends", "90": "circle" } },
        "cone":            { "part": "cone", "shape": { "kind": "cone", "d": 8, "length": 10, "axis": "z", "apex": "+" },       "names": { "0": "triangle", "45": "round-end", "90": "circle" } },
        "ball":            { "part": "ball", "shape": { "kind": "sphere", "d": 6.5 },                                          "names": { "0": "circle", "45": "circle", "90": "circle" } }
      }                                                                                                  // 尺寸 cm，中心 = holder；卡片在 yz 平面
    },
    "sheets": {
      "control": "material", "size": [10, 10], "kinds": { "hardly": 85, "dark": 5 },
      "materials": {
        "clear-glass":   { "part": "clear-glass",     "straight": 0.91, "scattered": 0 },
        "frosted-glass": { "part": "frosted-glass",   "straight": 0,    "scattered": 0.83 },
        "tracing-paper": { "part": "tracing-paper",   "straight": 0,    "scattered": 0.65 },
        "cardboard":     { "part": "cardboard-sheet", "straight": 0,    "scattered": 0 }
      }
    },
    "holes": { "control": "middle", "hole": 1.2, "cards": [ { "part": "hole-card-1", "at": -10 }, { "part": "hole-card-2", "at": 0, "moved": 2 }, { "part": "hole-card-3", "at": 10 } ] },   // at：相对支架，cm
    "seeing": { "torch": "box-torch", "target": "in-box", "reflects": { "ball": "some", "mirror": "bright" } },
    "sun": { "lat": 1.3, "lon": 103.8, "zone": 8, "time": "time", "date": "date",
             "dates": { "oct-20": "2026-10-20", "jun-21": "2026-06-21", "mar-24": "2026-03-24" },
             "pole": 1.00, "north": [0, 0, -1] }
  }
}
```

**规则**：

- **`bench`**：光源在 (−a, 0, 0)、屏幕在 x = b（相对支架，cm）。物体按 `shape` 解析地生成表面采样点（圆盘 / 多边形连厚度的前后两面；圆柱、圆锥按 180 × 60 网格；球按切线锥精确算），绕竖直轴转 `turn`，从光源投影到 x = b 的平面，取 y、z 范围 = 高、宽（cm，内部全精度，显示按 `decimals`）。`shadow:shape` = `names[turn]`；`object` = none 或 `torch-on` = false → `none`，高宽 NaN（显示 `—`）。
- **`sheets`**：`material` = none → `sheet:light` = 100、`kind` = `none`、`dark` = 0；否则 light = 100 × (straight + scattered × a² ÷ (a² + b²) × ((a₀ + b) ÷ a₀)²)，a = √(宽 × 高 ÷ π)，a₀ = `d-torch`，b = `d-screen`；上限 100；kind：≥ `hardly` → `hardly`，< `dark` → `dark`，否则 `lighter`；dark = 1 − light ÷ 100。`torch-on` = false → light 0、kind `none`（没有光就没有影子）。
- **`holes`**：每张卡离光源 dᵢ = a + atᵢ，孔在屏幕上的投影圆心 zᵢ = movedᵢ × (a + b) ÷ dᵢ（挪开的那张），半径 rᵢ = hole/2 × (a + b) ÷ dᵢ；三个圆有公共部分 → `yes`，否则 `no`（一维区间求交即可，单测含 §2.4 的数）。
- **`seeing`**：`box-torch` 关 → `eye` = none、`dark` = 1；开 → `reflects[in-box]`、`dark` = 0。
- **`sun`**：照 NOAA `main.js` 的 `getJD`、`calcTimeJulianCent`、`calcAzEl`（含 `calcRefraction`）、`calcSolNoon` 逐函数移植（文件头注明来源与"美国政府作品，公有领域"）；`time` 是当地钟点（小时，可带小数）。输出：`sun:height`（高度角，含折射）、`sun:bearing`（方位，从北顺时针）、`sun:length` = pole ÷ tan(高度)（高度 ≤ 0 → NaN，validate 保证不会出现）、`sun:points` = (方位 + 180) 的八方位、`sun:noon`（当天正午的钟点）、`sun:noon-length`、`sun:at` = (sin A cos h, sin h, −cos A cos h)（按 `north` 旋转到场景坐标）。
- **量**（输出的 `from`）：上面列出的全部 + `control:<控件>`。确定、同步、< 0.1 ms（太阳一次求值约几微秒）；`SEPARATE_EXPERIMENTS['light'] = true`（几套实验互不相干，PLATE 块尾只写本章卡片的状态，同力的模型）。

### 4.4 validate（`sim-schema.ts lightIssues`）

- 引用的控件存在且种类对：`gaps.*`、`time` 是步进；`object`、`material`、`middle`、`in-box`、`date` 是选择；`power`、`box-torch` 是开关；`turn` 是步进且每个值在每件物体的 `names` 里有名字。
- `objects` 的键 = `object` 控件除 `none` 外的全部选项；`materials` 的键 = `material` 控件除 `none` 外的选项；每个 `part` 存在、不是 context；`names` 的值都在 `shadow-shape` 的 `states` 里；`straight + scattered ≤ 1`、都 ≥ 0；`kinds.dark < kinds.hardly`。
- **几何守门**（用模型自己算，报 error）：每个 `gaps.torch` 值都大于最大物体沿轴的半深（物体不能碰到手电筒）、每个 `gaps.screen` 值同理；在**所有**控件组合下，影子高宽 ≤ 屏幕尺寸、且整个影子落在光束内（光束圆锥在屏幕上的半径 ≥ 影子包围盒外接圆半径）——这是"所有课上组合的影子都完整"的单测在数据层的版本。
- `holes.cards` 恰好三张以上、`part` 存在、`at` 互不相同、只有一张有 `moved`。
- `sun`：`dates` 的键 = `date` 控件的全部选项、值是合法的 ISO 日期；`lat` ∈ [−66, 66]、`lon` ∈ [−180, 180]、`zone` ∈ [−12, 14]；**每个日期 × 每个时间的太阳高度 ≥ 5°**（低于 5° 折射与影长都不可靠，报 error）；`north` 是水平单位向量。
- 输出的 `from` 是本模型的量、种类对得上；状态输出的每个可能值都有标签、不写永远不会出现的状态（如本数据里没有物体的形状名没用到）。
- `format: "time"` 只能用在单位为 `h` 的步进控件和数输出上，值在 0–24。

### 4.5 叠加 `shadow-cast`（E-L2；`stages/model3d/ShadowCast.tsx` + 纯数学 `lib/sim/shadow.ts`）

```jsonc
"overlays": [
  { "kind": "shadow-cast",
    "source": { "part": "torch", "point": [0, 1.00, 0.05], "axis": [1, 0, 0], "beam": 40, "when": { "control": "torch-on" } },
    "receiver": { "part": "screen-board", "normal": [-1, 0, 0], "size": [0.60, 0.45] },   // 面朝光源的那一面；矩形裁剪
    "casters": [
      { "part": "object-holder" },
      { "part": "card-circle" }, { "part": "card-square" }, { "part": "card-triangle" }, { "part": "card-circle-big" },
      { "part": "tin" }, { "part": "cone" }, { "part": "ball" },
      { "part": "clear-glass", "dark": { "output": "sheet-dark" } }, { "part": "frosted-glass", "dark": { "output": "sheet-dark" } },
      { "part": "tracing-paper", "dark": { "output": "sheet-dark" } }, { "part": "cardboard-sheet", "dark": { "output": "sheet-dark" } },
      { "part": "hole-card-1" }, { "part": "hole-card-2" }, { "part": "hole-card-3" }
    ],
    "spot": { "color": "token:en-light" },
    "rays": { "group": "rays", "edges": "vertical", "through": "dark", "extra": [[0, 0]] } },    // 光线：见下
  { "kind": "shadow-cast",
    "source": { "direction": { "output": "sun-at" } },
    "receiver": { "part": "courtyard", "normal": [0, 1, 0], "radius": 5.5 },
    "casters": [ { "part": "pole" } ],
    "trail": { "control": "time" },
    "rays": { "group": "rays", "edges": "tip", "parallel": [-0.4, 0.4] } }
]
```

- **挡光物**：零件不在场（`visible` 假、章节 `hide`、图层关）就不画它的影子；每个挡光物一次绘制（零件的全部几何合成一份投影网格，载入时建，运行时只改 uniform）。
- **光源**：`point`（d-torch 为 0 时的世界坐标，叠加按零件的 `offset` / `pose` 当前位移跟着走）+ `axis` + `beam`（半角，°）；或 `direction`（向量输出，指向光源）= 平行光。`when` 同力的箭头的写法。
- **接收面**：零件 + 面的法线（零件局部）+ 矩形 `size` 或圆 `radius`；平面随零件的 `offset` 走（屏幕移动时影子跟着走）。
- **`trail`**（只给平行光）：在接收面上、对 `control` 的每个步进值 ≤ 当前值，画一个小圆点（Ø 4 cm，`token:ink` 60 %）在那一刻的影子尖端（= 杆顶的投影），像每小时用粉笔做的记号；当前值的那一点空心。日期变了就按新日期重算。一次绘制（实例化）。
- **`rays`**（光线，属于 `group`，LAYERS 一行 "Light rays (drawn) / 光线（示意）"）：hairline（1.25 px）直线，颜色 `token:en-light`，RUN 时虚线从光源向外流动（减少动态时静止）；全部光线一次绘制。
  - `edges: "vertical"`：对每个在场的挡光物，从光源到它的投影包围盒在接收面上的**最高点与最低点**各一条——它们必然擦过物体的上下边缘（这正是"相似三角形"的两条边）；`"tip"`：平行光擦过杆顶到影子尖端。
  - `extra`：接收面局部坐标（cm）里的目标点，从光源射向它；途中按挡光物的网格做射线求交（three `Raycaster`，只在状态变时算），**碰到不透光的挡光物就停在那里**（第 02 章：轴上那条光线在三孔对齐时到达屏幕，中间卡挪开时停在它上面）；`through: "dark"` = 碰到深浅 < 1 的挡光物（材料片）时继续，不透明度 × (1 − 深浅)。
  - `parallel`：平行光再画两条与 `tip` 平行、在杆两侧（垂直于阳光的水平方向偏 ±0.4 m）落到地面的光线，表示"太阳光几乎是平行的"。
- EXPLODED 时整层淡出；REFERENCE 照常；`__atlas.engine.shadows()` → `{ [叠加序号]: { casters: { [part]: { min: [u, v], max: [u, v] } }, spot: { radius }, trail: [[u, v], …], rays: number } }`（接收面局部坐标，cm）。
- **绘制**：实验台最多 1（支架）+ 1（物体或材料片）或 3（有孔卡）+ 1（光斑）+ 1（光线）= 6 次；空地 1（杆子）+ 1（粉笔点）+ 1（光线）= 3 次。

### 4.6 其余小件

| 件 | 内容 |
|---|---|
| `place` 绑定（E-L3） | `{ "output": "<向量输出>", "part": "<零件>", "place": { "centre": [x, y, z], "radius": r, "face"?: "centre" } }`：把零件移到 centre + r × 单位向量；`face: "centre"` 时同时转到让零件局部 +Y 朝向 centre（太阳圆盘正对空地）；0.5 s 缓动（沿球面插值）；深链接直接终值。`lib/sim/bind.ts`。validate：输出是有 x、y、z 三键的向量 |
| 步进控件与数输出的 `format: "time"`（E-L4） | 值 = 当地钟点（小时，可带小数）；显示走 `src/lib/rich-text.ts` 的 `{t:HH:MM}`（EN "8.00 am"，ZH "上午 8.00"，读屏 "eight a.m." /「上午八点」）；卡片 ‹ 值 ›、数据表、折线图 x 轴刻度（整点短写 "8 am" / "上午 8"）、PLATE 读数、块尾 SIM 行都用它；URL 里仍是数（`sim=time.13`）。`lib/sim/text.ts`、`lib/sim/chart.ts`、`explorer/TryIt.tsx`、`hud/PlateBlock.tsx` |
| `views.shadows`（E-L5） | `"auto"`（默认，现状）/ `"contact"`（主光不投影、`GroundShadow` 只留柔和的接触斑）/ `"none"`（两样都关）。`schema.ts`、`stages/model3d/Lighting.tsx`、`GroundShadow.tsx`、`SceneRoot.tsx`。本主题 `contact` |
| 选择控件的互设（已有） | `object` 与 `material` 互相 `sets` 对方为 `none`（docs/06「试一试」的 `sets` 与 free 规则：两者的 `none` 都是不带 `sets` 的选项）；单测：选磨砂玻璃 → 物体变 none；再选罐子 → 材料回到 none |

### 4.7 引擎件清单与文件归属（一个 Opus 引擎代理约 4 天；或 Codex 实现 + Opus 复核，同 docs/33 §9.1；不改 `package.json`、不加依赖）

| 件 | 优先级 | 文件 | 要点 |
|---|---|---|---|
| E-L1 模型 | 必须 | `src/engines/space-scene/lib/sim/light.ts`（新）、`lib/sim/sun.ts`（新，NOAA 移植）、`sim-schema.ts`（`lightSchema`、`lightIssues`、`SIM_KINDS` 加 `light`、`quantityKind` 一支、`SEPARATE_EXPERIMENTS`）、`lib/sim/index.ts`（注册） | §4.3–§4.4；约 1.5 天 |
| E-L2 `shadow-cast` 叠加 | 必须 | `lib/sim/shadow.ts`（新：投影矩阵、平面与裁剪、光束椭圆、粉笔点、光线端点与求交的纯数学）、`stages/model3d/ShadowCast.tsx`（新）、`stages/model3d/SimOverlays.tsx`（挂载）、`sim-schema.ts`（叠加 schema 与校验）、`core/test-api` 经 `View.tsx` 暴露 `shadows()` | §4.2、§4.5；约 1.5 天 |
| E-L3 `place` 绑定 | 必须 | `lib/sim/bind.ts`、`stages/model3d/PartNode.tsx`、`sim-schema.ts` | §4.6 |
| E-L4 `format: "time"` | 必须 | `sim-schema.ts`、`lib/sim/text.ts`、`lib/sim/chart.ts`、`explorer/TryIt.tsx`、`explorer/TryChart.tsx`、`hud/PlateBlock.tsx`（复用 `src/lib/rich-text.ts`，不改它） | §4.6 |
| E-L5 `views.shadows` | 必须 | `schema.ts`、`stages/model3d/{Lighting,GroundShadow,SceneRoot}.tsx` | §4.6 |
| E-L6 夹具主题 | 必须 | `src/content/topics/sample-light/`（新，`status: draft`，占位文字，只用程序化积木：一条轨道、手电筒、一张卡片 + 一只球 + 一片磨砂玻璃 + 三张有孔卡、屏幕、一根杆子 + 地面；五章：背景章 + 距离卡（折线图、先猜后看）+ 形状卡 + 材料卡（条形图）+ 太阳卡（`time` 格式、粉笔点、`place`）） | 不碰 `light-and-shadows/` 目录 |
| E-L7 测试与文档 | 必须 | `tests/space-scene/light.test.ts`、`sun.test.ts`、`shadow.test.ts`；样板 `tests/space-scene/fixtures/light-bench.ts`（§4.3 的完整 `light` 数据 = 本主题作者模板）、`tests/space-scene/fixtures/noaa-singapore.json`（Codex `solar-results.json` 的拷贝 + 来源）；`tests-e2e/sample-light.spec.ts`；docs/06 新节「SpaceScene · 试一试 · 光（light）」「影子投射（`shadow-cast`）」，改「试一试（sim）」的模型种类、绑定（`place`）、控件（`format`）三处，「作者怎么写数据」的 `views.shadows` | §4.8 |

主会话不预装依赖（本主题不需要新依赖）。并行时 E-L2 与 E-L1 可分两个代理：A = E-L1 + E-L3 + E-L4 + E-L5（`lib/sim/` 除 `shadow.ts`、`sim-schema.ts`、`schema.ts`、HUD 文本），B = E-L2（`lib/sim/shadow.ts`、`ShadowCast.tsx`、`SimOverlays.tsx`）；`sim-schema.ts` 归 A，B 要的叠加 schema 由 A 先加。

### 4.8 引擎验收

- [ ] 单测 `light.test.ts`：§2.4 的 T5、T6 两表（取整后逐格相等，内部值与 8 × (a + b) ÷ a 相差 < 1 %）、形状表 7 × 3 格（高宽取整相等、`names` 按轮廓核对的规则）、材料表四行（91 / 45 / 35 / 0）与 b = 30 cm 的两行（18 / 14）、有孔卡 `yes` / `no` 与 Ø 2.0 cm、暗箱三态；不变量：影子随 a 单调减、随 b 单调增且线性（等差 4 cm）、侧对的卡片宽 < 1.5 cm、球三个角度相等、`torch-on` 关 → 全部 none；`object` / `material` 互设；确定性；URL `sim=d-torch.10~d-screen.30` 往返。
- [ ] `sun.test.ts`：对 `noaa-singapore.json` 七行（高度、方位差 < 0.01°）、正午钟点差 < 2 s；§2.4 的 11 行影长（2 位小数）与方向名；6 月 21 日正午方位 ≈ 0°、12 月 21 日 ≈ 180°；3 月 24 日正午影长 < 0.01 m；高度 ≥ 5° 的 validate。
- [ ] `shadow.test.ts`：投影矩阵把物体网格顶点投到的包围盒 = `light.ts` 的高宽（< 0.2 cm）；三张有孔卡投影的并集在对齐时留下 Ø 2.0 ± 0.1 cm 的孔、挪开时没有；光束裁剪、矩形裁剪、圆裁剪；光线端点擦过物体边缘（端点到物体的最近距离 < 1 mm）；粉笔点 = 杆顶投影（与 `sun:length`、方向一致）。
- [ ] validate 报错用例：物体缺形状名、材料键与选项不符、透光 > 1、手电筒距离小于物体半深、某组合影子出屏或出光束、日期非法、某时刻太阳高度 < 5°、`place` 的输出不是三维向量、`format: time` 用在非 `h` 控件、叠加的零件不存在或是 context。
- [ ] e2e（`sample-light`）：深链接 `?ch=…&sim=d-torch.10` 的 `shadows()` 包围盒 = `outputs.shadow-height`；`]` 移动手电筒后影子平滑变化、终值相符；换材料后条形图；太阳章 `time` 卡片显示 "8.00 am"、中文 "上午 8.00"、折线图 x 轴是时刻；粉笔点数 = 已走过的整点数；`views.shadows: contact` 下画面里只有模型的影子（`stats()` 里主光阴影贴图未更新）；< 1024 px、手机 390 × 844 卡片可用、44 px；中文页。
- [ ] 已发布的 SpaceScene 主题（`forces`、`energy-conversion`、`mosquito`、`magnets`、`circuits`、`grasshopper`、`aircon`）`pnpm shoot <slug> --beats --keys` 不回归（`views.shadows` 默认 `auto`，行为不变）。
- [ ] 性能：模型一次求值 < 0.1 ms；`shadow-cast` 静止时零帧开销；实验台全景 ≤ 45 calls。
- [ ] 门槛全绿（`pnpm check`、`validate`、`test`、`build`、`e2e`）。

### 4.9 不做（v2）

读者在舞台上拖手电筒、屏幕（现在是步进 ‹ ›，要改成连续拖动得重写卡片与表的取值规则）；半影的渲染（面光源多采样）；两个光源的两个影子（Grigorovitch 2025 的"多光源"困难，细看里文字讲）；影子落在任意物体上（例如落在桌面、落在另一个物体上）；按真实时刻改变天空亮度。

---

## 5. 章节

### 5.0 总表

`layers` 写"台" = `source, objects, sheets, screen, rays`；`run` 指本章默认（RUN 时光线虚线流动）；镜头写预设名或"拍内"。

| # | id | 标题 EN / ZH | view | run | layers | sim.set | labels（章） | 镜头 |
|---|---|---|---|---|---|---|---|---|
| 00 | `before-you-start`（background） | Before you start / 开始之前 | assembled | true | 台 | 默认 | — | `bench-view` |
| 01 | `seeing-light` | Seeing light / 看见光 | xray | true | `dark-box, rays` | box-torch true, in-box ball | box, box-torch, box-ball | `box-view` |
| 02 | `straight-lines` | Light travels in straight lines / 光沿直线传播 | assembled | true | 台 + `hole-cards` | object none, middle in-line, d-torch 20, d-screen 30 | hole-card-1, hole-card-2, hole-card-3 | `bench-view` |
| 03 | `through-or-blocked` | Through, partly, or not at all / 光能不能穿过 | assembled | true | 台 | object none, material clear-glass, d-torch 20, d-screen 10 | clear-glass, light-sensor | `screen-view` |
| 04 | `shape-and-size` | Shape and size / 影子的形状与大小 | assembled | true | 台 | object card-circle, turn 0, d-torch 20, d-screen 30 | card-circle, screen-board | `screen-view` |
| 05 | `torch-distance` | Moving the torch / 移动手电筒 | assembled | true | 台 | object card-circle, turn 0, d-torch 20, d-screen 30 | torch, card-circle, screen-board | `side-view` |
| 06 | `screen-distance` | Moving the screen / 移动屏幕 | assembled | true | 台 | object card-circle, turn 0, d-torch 20, d-screen 30 | screen-board, card-circle, torch | `side-view` |
| 07 | `sun-shadows` | Shadows in the sun / 太阳下的影子 | assembled | true | `outdoors, rays` | date oct-20, time 10 | pole, sun, north-arrow | `yard-view` |

- 暗箱、有孔卡片、户外各组只在本章的 `layers` 里出现；实验台各章不含 `dark-box`、`outdoors`（两处从不同框，D1）。第 02 章拍 3 起 `hide: [hole-card-1, hole-card-2, hole-card-3]`（拍的 `hide` 不累积，拍 3–5 各写）。
- 每章本章索引写在各节；`index` 只能是非 context 零件。

### 5.1 背景章 00 `before-you-start`

- `kind: background`，`order: 0`；`note` 草稿：EN "This is a model. The shadows on the screen and on the ground are worked out from straight lines of light, and every size in centimetres is calculated by the model for the objects drawn here (marked SIM). The torch is drawn as a tiny point of light, so shadow edges are sharp; a real torch gives slightly blurred edges. How much light passes through each sheet comes from published figures for similar materials, not from this bench. The Sun's position comes from NOAA's solar calculator for Singapore (1.3° N, 103.8° E) on the dates shown, with a clear sky and level ground. The thin lines are drawn to show the paths of light; in a real room you cannot see them from the side." / ZH "这是一个模型。屏幕上和地上的影子，都是按光沿直线传播算出来的；每个以厘米为单位的大小，都是模型对这里画的物体算出的（标 SIM）。手电筒画成一个很小的光点，所以影子的边缘是清楚的；真实的手电筒会让边缘有点模糊。每种材料片让多少光穿过，来自同类材料公开发表的数据，不是在这张实验台上量的。太阳的位置来自 NOAA 的太阳计算器，地点是新加坡（北纬 1.3°、东经 103.8°），日期见各拍，假设天空无云、地面水平。细线是画出来表示光的路径的；在真实的房间里，从旁边是看不见光线的。"
- **summary**：Light comes from light sources, travels in straight lines, and makes shadows where something blocks it. This topic tests what changes a shadow, one thing at a time. / 光从光源发出，沿直线传播，被东西挡住的地方就有影子。本主题一次只改一个量，看看什么会改变影子。
- **正文提纲**：① 课纲：看见物体要靠光；光沿直线传播，挡住就有影子；影子随形状、大小、位置和两个距离变化（S2 第 75 页）。② 实验台上有什么（手电筒、轨道、支架、屏幕、光传感器、暗箱）；户外空地。③ 怎么读：细线 = 光的路径（画出来的）；屏幕上的亮片 = 手电筒照到的地方；SIM。④ 试一试卡片：改变 / 不变 / 观察、记一行、看图、先猜后看；"只改一个量"就是公平测试（第 15 页）。⑤ 安全：不要直视太阳，不要用手电筒照别人的眼睛。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（bench-view，run）；labels torch, card-circle, screen-board | On this bench, a torch shines along a track towards a white screen. A card in between blocks some of the light. / 这张实验台上，手电筒沿着轨道照向一块白色屏幕。中间的卡片挡住了一部分光。 |
| 2 | camera side-view；labels torch, card-circle | The thin lines show the paths the light takes. They are drawn in; in a real room you see only where the light lands. / 细线表示光走的路径，是画上去的；在真实的房间里，只看得到光照到的地方。 |
| 3 | camera box-view；layers dark-box, rays；view xray；labels box, box-torch | A closed box with a small hole is for testing what we need in order to see. / 一只开了小孔的封闭盒子，用来测试我们要看见东西需要什么。 |
| 4 | camera yard-view；layers outdoors, rays；sim time 10；labels pole, sun | Outdoors, the light source is the Sun. The last chapter follows the shadow of a 1 m pole through one day in Singapore. / 到了户外，光源是太阳。最后一章跟着一根 1 米长的杆子的影子，看它在新加坡的一天里怎样变化。 |

- **试一试**：无。
- **细看**：`How this model works`（§2.5 全部）；`One thing at a time`（公平测试；第 15 页"认出公平测试"）；`Light is energy`（课纲把光放在"能量"主题下；链 `<TopicLink slug="energy-conversion" ch="energy-from-the-sun">`）；`Safety`（太阳、手电筒）。
- **本章索引**：torch, track, object-holder, card-circle, screen-board, light-sensor, box, pole
- **名词首现**：light-source、shadow、light-ray、screen。

### 5.2 第 01 章 `seeing-light`

- **summary**：We see a light source because its light enters our eyes. We see other things only when light falls on them and they reflect some of it into our eyes. / 我们看见光源，是因为它的光进入了眼睛。别的东西，要有光照到它、它把一部分光反射进我们的眼睛，我们才看得见。
- **正文提纲**：① 光源自己发光：太阳、灯、手电筒（F-2）。② 球、书、月亮不发光，它们把光反射出来（F-2、F-3、F-8）；暗的、毛面的东西也反射光（M-4）。③ 暗箱：关着手电筒什么也看不见（M-3）；打开，光从手电筒到球、再从球经小孔进入眼睛（F-2）。④ 镜子反射光，反射得很好（不讲角度，D2）。⑤ 眼睛不发光（M-2）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（box-view，X-RAY，手电筒开、球）；labels box-torch, box-ball | The torch is a light source: it gives out its own light. The ball is not. We see the ball only because it reflects some of the torch's light. / 手电筒是光源，自己会发光；球不是。我们看得见球，只是因为它把手电筒的一部分光反射了出来。 |
| 2 | sim box-torch false；labels box, box-ball | With the torch off and the lid closed, no light reaches the ball. No light comes out through the hole, so looking in, you would see nothing at all. / 手电筒关着、盖子盖着，没有光照到球上，也没有光从小孔出来；从小孔看进去，什么也看不见。 |
| 3 | sim box-torch true；labels box-torch, box-ball, box | Switch the torch on. Light travels to the ball, and some of the light reflected from the ball comes out through the hole, into your eye. Now you can see the ball. / 打开手电筒。光照到球上，球反射的光有一部分从小孔出来，进入你的眼睛，你就看见球了。 |
| 4 | sim in-box mirror；labels box-mirror | A mirror reflects light too, and very well. Through the hole you would see a bright patch of the torch's light. / 镜子也反射光，而且反射得很好。从小孔看进去，会看到手电筒明亮的一片光。 |
| 5 | sim box-torch false, in-box ball；labels box-ball | Our eyes do not send out light; they only take it in. If they sent out light, you could see the ball in the dark box. / 眼睛不会发出光，只会接收光。要是眼睛会发光，在暗箱里也能看见球了。 |

- **试一试 T1**：`vary: box-torch`，`also: [in-box]`，`keep: [{ en: "Same closed box", zh: "同一只盖好的盒子" }, { en: "Same small hole", zh: "同一个小孔" }]`，`observe: [eye]`，`record: true`；`predict`：prompt "The torch in the box is switched off. Will any light come out through the hole?" / "关掉箱里的手电筒，还会有光从小孔出来吗？"，`start: { box-torch: true, in-box: ball }`，`change: { box-torch: false }`，`observe: eye`，options 会，有一些 `means: some` / 不会 `means: none`。
- **细看**：`Light sources and things that reflect`（太阳、灯、手电筒、发光的屏幕 vs 球、书、月亮；月亮反射太阳光，F-8，M-5）；`Dull things reflect light too`（F-3，M-4：所以从各个方向都看得见一张纸）；`Your eyes take light in`（M-2，F-9）；`Does light go farther at night?`（M-6：不会；晚上周围暗，光束和光斑更显眼）。
- **本章索引**：box, box-torch, box-ball, box-mirror
- **名词首现**：reflect。

### 5.3 第 02 章 `straight-lines`

- **summary**：Light travels in straight lines. When something blocks it, the light cannot bend round, and there is a shadow behind. / 光沿直线传播。光被东西挡住时，不会拐弯绕过去，后面就形成影子。
- **正文提纲**：① 三张有孔卡片：孔排成一直线才有亮点（F-1、§2.4）。② 挪开一张就没有：光不会拐弯（F-1）。③ 换上实心卡片：照到它的光被挡住，没照到的光直走到屏幕；光到不了的地方 = 影子（F-4）。④ 擦过边缘的光线定出影子的边缘（F-5，引到 05、06）。⑤ 关掉手电筒，影子也没了：影子是"没有光"，不是一样东西，也不是倒影（M-1）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（bench-view；三孔对齐）；labels hole-card-1, hole-card-2, hole-card-3 | Three cards with small holes stand in a line between the torch and the screen. Light passes through all three holes and makes a bright dot on the screen. / 三张开了小孔的卡片排成一直线，立在手电筒和屏幕之间。光穿过三个小孔，在屏幕上照出一个亮点。 |
| 2 | sim middle moved；labels hole-card-2 | Move the middle card a little to one side, and the dot is gone. The light cannot bend round to reach the hole. Light travels in straight lines. / 把中间那张卡片往旁边挪一点，亮点就不见了：光不会拐弯去找那个小孔。光沿直线传播。 |
| 3 | sim middle in-line, object card-circle；hide hole-card-1–3；labels card-circle, screen-board | Now a solid card stands in the way. The light that hits it is blocked; the light that misses it goes straight on to the screen. Where no light arrives, there is a shadow. / 现在挡在中间的是一张实心卡片。照到它的光被挡住，没照到它的光直走到屏幕上。光到不了的地方，就是影子。 |
| 4 | camera side-view；hide 同上；labels card-circle, torch | The lines that just miss the top and bottom of the card meet the screen at the edges of the shadow. / 刚好擦过卡片上下边缘的光线，落在屏幕上，正是影子的边缘。 |
| 5 | sim torch-on false；hide 同上；labels torch, screen-board | Switch the torch off, and the shadow goes with the light. A shadow is not a copy of the card; it is the place the light cannot reach. / 关掉手电筒，影子就跟着光一起不见了。影子不是卡片的复制品，而是光照不到的地方。 |

- **试一试 T2**：`vary: middle`，`keep: [d-torch, d-screen, { en: "Same three cards", zh: "同样的三张卡片" }]`，`observe: [dot]`，`record: true`；`predict`：prompt "If the middle card is moved 2 cm to one side, will there still be a bright dot on the screen?" / "如果把中间那张卡片挪开 2 厘米，屏幕上还会有亮点吗？"，`start: { middle: in-line }`，`change: { middle: moved }`，`observe: dot`，options 有 `yes` / 没有 `no`。（这一章的 `[ ]` 在两个选项间切换；`T` 不注册——卡上没有开关。）
- **细看**：`Holes of light in a shadow`（三张有孔卡的影子里只有对齐时有亮点；有孔卡片的影子本身带着亮孔——影子只记得轮廓和洞，M-1）；`A shadow is not a reflection`（倒影有颜色和细节，影子没有，M-1）；`The space behind the card`（在卡片和屏幕之间放一张白纸，那里也是暗的：照不到的是一整块空间，M-8，Grigorovitch 2025）；`Why real shadows can look blurry`（大一点的灯有一定大小，边缘一圈只被挡住一部分的光——半影，中学会学，F-6）。
- **本章索引**：hole-card-1, hole-card-2, hole-card-3, card-circle, torch, screen-board
- **名词首现**：（light-ray 在 00 已首现）。

### 5.4 第 03 章 `through-or-blocked`

- **summary**：Some materials let most light through, some let some light through, and some let none through. The less light a material lets through to the screen, the darker its shadow. / 有的材料让大部分光穿过，有的让一部分光穿过，有的完全不让光穿过。让越少的光照到屏幕上，影子就越深。
- **正文提纲**：① 透明玻璃：大部分光直穿过去（91 %，F-17），影子几乎看不出、看得清后面。② 磨砂玻璃、描图纸：光能穿过（83 %、约 65 %，F-18、F-19），但被向各个方向散开，正后方的光少了，影子较淡；隔着看不清（F-21，M-9）。③ 硬纸板：不让光穿过，影子深（F-20）。④ 光传感器读"和什么都不放时比"的 %（F-16）；在这个模型里 91 / 45 / 35 / 0。⑤ 公平测试：同样的距离、同样大小的材料片、同样的房间光线。配图 `light-and-shadows-opaque-translucent`（② 段后）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（screen-view；透明玻璃）；labels clear-glass | Clear glass lets most light through. Its shadow is so faint you can hardly see it, and you can see clearly through the glass. / 透明玻璃让大部分光穿过。它的影子淡得几乎看不出来，隔着玻璃也看得清清楚楚。 |
| 2 | sim material frosted-glass；labels frosted-glass | Frosted glass also lets a lot of light through, but it scatters the light in all directions. Less of it reaches the screen straight behind, so the shadow is lighter, not dark. You cannot see clearly through it. / 磨砂玻璃也让很多光穿过，但它把光向四面八方散开，照到正后方屏幕上的光就少了，所以影子是淡的，不是黑的。隔着它看不清楚。 |
| 3 | sim material tracing-paper；labels tracing-paper | Tracing paper lets some light through and scatters it too. Its shadow is lighter than the shadow of cardboard. / 描图纸让一部分光穿过，也把光散开。它的影子比硬纸板的淡。 |
| 4 | sim material cardboard；labels cardboard-sheet | Cardboard lets no light through. All the light that hits it is blocked, so its shadow is dark. / 硬纸板不让光穿过。照到它的光全被挡住，所以影子很深。 |
| 5 | camera bench-view；labels light-sensor, datalogger | A light sensor on the screen measures the light reaching it, compared with an empty holder. In this model: clear glass 91 %, frosted glass 45 %, tracing paper 35 %, cardboard 0 %. / 屏幕上的光传感器测量照到它的光，和支架上什么都不放时比较。在这个模型里：透明玻璃 91%，磨砂玻璃 45%，描图纸 35%，硬纸板 0%。 |

- **试一试 T3**：`vary: material`，`keep: [d-torch, d-screen, { en: "Same size of sheet", zh: "同样大小的材料片" }, { en: "Same room lighting", zh: "同样的室内光线" }]`，`observe: [light-behind, shadow-kind]`，`record: { chart: { y: light-behind } }`（条形图）；`predict`：prompt "Change the clear glass for frosted glass. Will more or less light reach the screen behind it?" / "把透明玻璃换成磨砂玻璃，照到后面屏幕上的光会更多还是更少？"，`start: { material: clear-glass }`，`change: { material: frosted-glass }`，`observe: light-behind`，options 更多 `more` / 更少 `less` / 差不多 `same`。
- **细看**：`Most, some or none`（P3 第 40 页的说法；transparent / translucent / opaque 三个词**不要求**，第 75 页 Note；名词表里有）；`Frosted glass lets most light through`（83 %；把它从屏幕移远到 30 cm，模型读数降到 18 %——散开的光走得越远越稀；贴着屏幕时影子几乎没有，M-9）；`Letting light through is not the same as seeing through`（F-21）；`About these numbers`（透光率来自 4 mm 玻璃产品的声明和一篇论文；硬纸板在模型里取 0；真实测量要先测"什么都不放"，R: transmission-measurement-method；§2.5 第 2–4 条）。
- **本章索引**：clear-glass, frosted-glass, tracing-paper, cardboard-sheet, light-sensor, datalogger, screen-board
- **名词首现**：fair-test、light-sensor、datalogger、transparent、translucent、opaque（后三个只在细看里首现）。

### 5.5 第 04 章 `shape-and-size`

- **summary**：A shadow has the outline of the object as seen from the light. Turning an object can change its shadow's shape; a bigger object makes a bigger shadow. / 影子是从光源那边看过去物体的轮廓。转动物体，影子的形状可能改变；物体越大，影子越大。
- **正文提纲**：① 圆卡 → 圆形，三角形卡 → 三角形，正方形卡 → 正方形（F-7）。② 转动同一张卡片：影子变窄，侧对时只剩细条（§2.4）。③ 同一物体，不同影子：罐子侧对长方形、端对圆形；圆锥侧对三角形、端对圆形。④ 不同物体，同样的影子：球、圆卡、端对的罐子都是圆形。⑤ 大小：Ø 12 cm 的卡片在同一个位置，影子 30 cm，Ø 8 cm 的 20 cm。⑥ 屏幕下方那条细影是支架的。配图 `light-and-shadows-same-object-two-shadows`（③ 段后）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（screen-view；圆卡）；labels card-circle | A round card makes a round shadow. The shadow has the card's outline as seen from the torch. / 圆形卡片的影子是圆形的。影子就是从手电筒那边看过去卡片的轮廓。 |
| 2 | sim object card-triangle；labels card-triangle | A triangle of card makes a triangle-shaped shadow. / 三角形卡片的影子是三角形的。 |
| 3 | sim object card-circle, turn 90；labels card-circle | Turn the same round card edge-on to the torch, and its shadow becomes a thin strip. / 把同一张圆卡片转到侧对手电筒，它的影子就变成一条细条。 |
| 4 | sim object tin, turn 0；labels tin | A tin lying on its side makes a rectangle-shaped shadow. / 横躺的罐子，影子是长方形的。 |
| 5 | sim object tin, turn 90；labels tin | Turn the tin end-on, and the same tin makes a round shadow. One object can make shadows of different shapes. / 把罐子转到端对手电筒，同一个罐子的影子变成圆形。同一个物体，可以有不同形状的影子。 |
| 6 | sim object card-circle-big, turn 0；labels card-circle-big | A bigger card in the same place makes a bigger shadow: 30 cm across instead of 20 cm, in this model. / 大一些的卡片放在同一个位置，影子也大一些：在这个模型里，直径是 30 厘米，不是 20 厘米。 |

- **试一试 T4**：`vary: turn`，`also: [object]`，`keep: [d-torch, d-screen, { en: "Same place on the holder", zh: "放在支架的同一个位置" }]`，`observe: [shadow-shape, shadow-height, shadow-width]`，`record: true`（表，不画图）；`predict`：prompt "The tin lies on its side. Turn it to face the torch end-on. What shape will its shadow be?" / "罐子横躺着。把它转到一头对着手电筒，影子会是什么形状？"，`start: { object: tin, turn: 0 }`，`change: { turn: 90 }`，`observe: shadow-shape`，options 圆形 `means: circle` / 长方形 `means: rectangle` / 三角形 `means: triangle`。
- **细看**：`Different objects, same shadow`（球、圆卡、端对的罐子和圆锥都给圆形：只看影子，不一定猜得出是什么物体，F-7）；`The thin line below`（支架细杆的影子，F-13；真实实验也会有）；`No colour, no pattern`（影子只有轮廓，M-1）；`Why the turned square is not a rectangle`（45° 时近边离手电筒更近、影子更高：所以是"变窄的四边形"；太阳光下就是长方形——引到第 07 章的平行光）。
- **本章索引**：card-circle, card-square, card-triangle, card-circle-big, tin, cone, ball, object-holder
- **名词首现**：无新词。

### 5.6 第 05 章 `torch-distance`

- **summary**：The nearer the torch is to an object, the bigger the object's shadow, as long as the object and the screen stay where they are. / 只要物体和屏幕不动，手电筒离物体越近，物体的影子越大。
- **正文提纲**：① 设定：卡片 Ø 8 cm，屏幕在卡片后 30 cm 不动，只移动手电筒（公平测试，D8）。② 20 cm → 20 cm 的影子；10 cm → 32；60 cm → 12（§2.4，SIM）。③ 为什么：擦过卡片边缘的两条光线张开的角度——手电筒越近，角越大，到屏幕时分得越开（F-5，只用"张开"说，不写式子）。④ 规律：越近越大，而且越近每一步变得越多（折线图是弯的）。⑤ 用小手电筒时影子总比物体大（M-7）。配图 `light-and-shadows-shadow-distance`（③ 段后）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章（side-view）；labels torch, card-circle, screen-board | The card is 8 cm across, and the screen stays 30 cm behind it. With the torch 20 cm in front of the card, the shadow is 20 cm across. / 卡片直径 8 厘米，屏幕一直在它后面 30 厘米。手电筒在卡片前 20 厘米时，影子直径 20 厘米。 |
| 2 | sim d-torch 10；labels torch, card-circle | Move the torch closer, to 10 cm. The lines past the edges of the card spread out more steeply, and the shadow grows to 32 cm. / 把手电筒移近到 10 厘米。擦过卡片边缘的光线张得更开，影子变成 32 厘米。 |
| 3 | sim d-torch 60；labels torch, card-circle | Move it back to 60 cm. The shadow shrinks to 12 cm, but it is still bigger than the card. / 把它移远到 60 厘米，影子缩小到 12 厘米，但仍然比卡片大。 |
| 4 | sim d-torch 30；camera screen-view；labels card-circle, screen-board | Only the torch moved. The card, the screen and the gap between them stayed the same, so this is a fair test of one thing: how far the torch is. / 只有手电筒在动。卡片、屏幕和它们之间的距离都没变，所以这是一个公平测试，只测一个因素：手电筒有多远。 |
| 5 | sim d-torch 15；camera side-view；labels torch | The nearer the torch, the bigger the shadow, and each step closer makes a bigger difference than the one before. / 手电筒越近，影子越大；而且越靠近，每近一步，影子变大得越多。 |

- **试一试 T5**：`vary: d-torch`，`keep: [d-screen, object, turn, { en: "Same torch", zh: "同一支手电筒" }]`，`observe: [shadow-height]`，`record: { chart: true }`（折线图）；`predict`：prompt "Move the torch from 20 cm to 40 cm away from the card. Will the shadow get bigger or smaller?" / "把手电筒从离卡片 20 厘米移到 40 厘米，影子会变大还是变小？"，`start: { d-torch: 20 }`，`change: { d-torch: 40 }`，`observe: shadow-height`，options 变大 `more` / 变小 `less` / 不变 `same`。
- **细看**：`Two triangles`（给好奇的人：影子高 ÷ 卡片高 = 手电筒到屏幕 ÷ 手电筒到卡片；20 ÷ 8 = 50 ÷ 20；中学的"相似三角形"，F-5）；`Never smaller than the card`（M-7：用小手电筒时如此；物体贴着屏幕时影子才接近一样大）；`Measuring a real shadow`（先定好量到影子边缘的哪里；量三次、看是否接近——好做法，不是课纲要求，R: shape-and-fair-test-designs）。
- **本章索引**：torch, torch-stand, track, card-circle, screen-board
- **名词首现**：variable。

### 5.7 第 06 章 `screen-distance`

- **summary**：The farther the screen is from an object, the bigger the object's shadow, as long as the torch and the object stay where they are. / 只要手电筒和物体不动，屏幕离物体越远，物体的影子越大。
- **正文提纲**：① 设定：手电筒在卡片前 20 cm 不动，只移动屏幕（另一个公平测试）。② 10 → 12 cm、30 → 20 cm、60 → 32 cm（§2.4）。③ 规律：每远 10 cm，影子大 4 cm（在这个模型里，等步）；折线图是直的——与第 05 章的弯线对照。④ 两个测试分开做：一次只改一个。⑤ 不公平的例子：手电筒和屏幕都不动、只移动卡片，两个距离同时变（R: shadow-geometry）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章 + sim d-screen 10（side-view）；labels screen-board, card-circle | Now the torch stays 20 cm from the card, and the screen moves instead. With the screen 10 cm behind the card, the shadow is 12 cm across. / 现在手电筒一直在卡片前 20 厘米，改为移动屏幕。屏幕在卡片后 10 厘米时，影子直径 12 厘米。 |
| 2 | sim d-screen 30；labels screen-board | With the screen 30 cm behind, the shadow is 20 cm across. / 屏幕在后面 30 厘米时，影子直径 20 厘米。 |
| 3 | sim d-screen 60；labels screen-board, screen-stand | At 60 cm it is 32 cm. The farther the screen, the bigger the shadow. / 到了 60 厘米，影子是 32 厘米。屏幕越远，影子越大。 |
| 4 | sim d-screen 40；camera screen-view；labels card-circle | In this model, the shadow grows by the same amount, 4 cm, for every 10 cm the screen moves back. / 在这个模型里，屏幕每往后移 10 厘米，影子就大 4 厘米，每次一样多。 |
| 5 | sim d-screen 30；camera bench-view；labels torch, screen-board | Moving the torch and moving the screen both change the shadow, but they are two separate fair tests. Change one, and keep the other the same. / 移动手电筒和移动屏幕都会改变影子，但这是两个分开的公平测试：改变一个，另一个保持不变。 |

- **试一试 T6**：`vary: d-screen`，`keep: [d-torch, object, turn, { en: "Same torch", zh: "同一支手电筒" }]`，`observe: [shadow-height]`，`record: { chart: true }`（折线图）；`predict`：prompt "Move the screen from 30 cm to 50 cm behind the card. Will the shadow get bigger or smaller?" / "把屏幕从卡片后 30 厘米移到 50 厘米，影子会变大还是变小？"，`start: { d-screen: 30 }`，`change: { d-screen: 50 }`，`observe: shadow-height`，options 同 T5。
- **细看**：`A straight line and a curve`（两张折线图对比：屏幕距离等步，手电筒距离越近变得越快）；`An unfair test`（手电筒和屏幕都不动，只把卡片往前移：手电筒到卡片、卡片到屏幕两个距离一起变了，影子变大说明不了是哪一个造成的，R: shadow-geometry）；`Close to the screen`（屏幕贴近卡片时，影子几乎和卡片一样大，M-7）；`Blurry edges grow too`（灯有一定大小时，屏幕越远，模糊的一圈越宽——半影，F-6，课外）。
- **本章索引**：screen-board, screen-stand, card-circle, torch, track
- **名词首现**：无新词。

### 5.8 第 07 章 `sun-shadows`

- **summary**：Outdoors, a shadow points away from the Sun. In Singapore it is long in the morning, short around the middle of the day and long again in the afternoon, and it swings from west to east. / 在户外，影子背着太阳。在新加坡，影子早上长、中午前后短、下午又变长，方向从西转到东。
- **正文提纲**：① 空地、1 m 杆子、指北箭头；太阳是光源（F-2）。② 早上太阳低、在东边 → 影子长、指西（§2.4：8.00 am 3.25 m）。③ 中午前后太阳高 → 影子短；这一天太阳最高在约 12.50 pm（`<Time t="12:50" />`），不是 12 点（M-10；细看讲时区）。④ 下午太阳在西边 → 影子指东、又变长（5.00 pm 1.99 m）。⑤ 粉笔点：每小时影子尖端的位置，连起来是一条弧。⑥ 其他日子：6 月 21 日正午影子指南；3 月 24 日前后正午太阳几乎在头顶（M-10）。⑦ 公平测试：同一根杆子、竖直、同样的地面，只改时间。配图 `light-and-shadows-sun-day`（④ 段后）。
- **节拍**：

| 拍 | 模型状态 | 字幕草稿 EN / ZH |
|---|---|---|
| 1 | 本章 + sim time 8（yard-view）；labels pole, sun, north-arrow | On 20 October 2026, at 8.00 am, the Sun is low in the east. The 1 m pole's shadow is long, 3.25 m, and points west, away from the Sun. / 2026 年 10 月 20 日上午 8.00，太阳低低地挂在东边。1 米长的杆子影子很长，有 3.25 米，指向西边，背着太阳。 |
| 2 | sim time 13；labels pole, sun | Around the middle of the day the Sun is high, and the shadow is short: 0.21 m at 1.00 pm. On this day the Sun is highest at about 12.50 pm, not at 12 o'clock. / 中午前后太阳很高，影子很短：下午 1.00 只有 0.21 米。这一天太阳最高是在中午 12.50 左右，不是 12 点整。 |
| 3 | sim time 17；labels pole, sun | In the afternoon the Sun is in the west, so the shadow points east and grows long again: 1.99 m at 5.00 pm. / 下午太阳在西边，所以影子指向东边，又变长了：下午 5.00 有 1.99 米。 |
| 4 | sim time 18；camera sky-view；labels pole, north-arrow | The chalk marks show where the tip of the shadow was each hour. From above you can see it swing from west, through north, to east. / 粉笔点记下了每个整点影子尖端的位置。从上往下看，影子从西边经过北边转到东边。 |
| 5 | sim date jun-21, time 13；camera yard-view；labels pole, sun-path-jun | On 21 June the Sun passes a little to the north of overhead, so the shadow at 1.00 pm points south instead: 0.41 m. / 6 月 21 日，太阳从头顶稍偏北的地方经过，所以下午 1.00 的影子反而指向南边，长 0.41 米。 |
| 6 | sim date mar-24, time 13；labels pole, sun-path-mar | Around 24 March the Sun at midday is almost straight overhead. At 1.00 pm the pole's shadow is only about 5 cm long. / 3 月 24 日前后，中午的太阳几乎就在头顶上。下午 1.00，杆子的影子只有 5 厘米左右。 |

- 拍里的 `sim.set` 不累积：第 5、6 拍写 `date`，第 1–4 拍不写 `date`（本章 `set` 是 `oct-20`）。
- **试一试 T7**：`vary: time`，`keep: [date, { en: "Same 1 m pole, standing straight", zh: "同一根 1 米长的杆子，竖直立着" }, { en: "Same flat ground", zh: "同样平的地面" }]`，`observe: [sun-height, shadow-length, shadow-points]`，`record: { chart: { y: shadow-length } }`（折线图：两头高、中间低）；`predict`：prompt "From 1.00 pm to 4.00 pm, will the pole's shadow get longer or shorter?" / "从下午 1.00 到下午 4.00，杆子的影子会变长还是变短？"，`start: { time: 13 }`，`change: { time: 16 }`，`observe: shadow-length`，options 变长 `more` / 变短 `less` / 不变 `same`。
- **细看**：`Why the Sun seems to move`（地球在转，太阳看起来东升西落，F-27，M-10 ⑩）；`Sunlight comes in almost parallel lines`（太阳非常远，照到空地上的光几乎平行：影子的宽度和杆子一样粗，不像手电筒那样放大；第 04 章的"变窄的四边形"在阳光下是长方形）；`Noon is not 12 o'clock here`（新加坡用 UTC+8，钟比按经度算的太阳时快约一小时（103.8° E 对应 UTC+6.9），一年里太阳最高大约在 12.50 pm 到 1.20 pm 之间（均时差 ±15 分钟），F-22、F-23；上午 / 下午的写法链 `<TopicLink slug="telling-time" ch="am-and-pm">`）；`The noon shadow through the year`（大约 3 月 24 日到 9 月 20 日之间正午影子指南，其余时候指北；2026 年 3 月 23–24 日、9 月 19–20 日正午太阳几乎在头顶，§2.4）；`How these numbers were worked out`（NOAA 太阳计算器的方法、近似、晴天、平地；影长 = 杆长 ÷ tan(高度角)，中学会学，F-24、F-25；太阳边缘让影子尖端有 1–3 cm 的模糊，F-26）；`Safety`（不要直视太阳）。
- **本章索引**：pole, sun, north-arrow, sun-path-oct, sun-path-jun, sun-path-mar
- **名词首现**：（无新词；"正午"在正文解释，不进名词表）。

### 5.9 拍数与配图

- 拍数：00 四、01 五、02 五、03 五、04 六、05 五、06 五、07 六 = **41 拍**。
- 配图位置：`light-and-shadows-opaque-translucent` 第 03 章 ② 段后；`light-and-shadows-same-object-two-shadows` 第 04 章 ③ 段后；`light-and-shadows-shadow-distance` 第 05 章 ③ 段后；`light-and-shadows-sun-day` 第 07 章 ④ 段后。

---

## 6. 名词表与来源

### 6.1 名词表 `glossary.json`（14 个候选，正文用不到的删）

中文照 Codex §5 的建议（R: glossary-*）：光源、反射、透明、半透明有新加坡本地用法佐证（MBS / 艺术科学博物馆中文页），其余以香港课程发展议会的科学词汇表（繁转简）为据；它们**不是** MOE 指定的中文课纲词。transparent / translucent / opaque 三条注明"课纲不要求这三个词"。

| id | EN / ZH | 定义要点 | see |
|---|---|---|---|
| `light-source` | light source / 光源 | 自己发出光的东西，如太阳、灯、手电筒 | reflect |
| `reflect` | reflect / 反射 | 光照到物体上又被弹回来；暗的、毛面的东西也反射光 | light-source |
| `light-ray` | light ray / 光线 | 画来表示光走的路径的直线，带箭头 | — |
| `shadow` | shadow / 影子 | 物体挡住光后，光照不到的地方 | light-ray |
| `screen` | screen / 屏幕 | 用来接住光和影子的面，白卡纸、墙、地面都可以 | shadow |
| `transparent` | transparent / 透明 | 让大部分光穿过、能看清后面的东西（课纲不要求这个词） | translucent |
| `translucent` | translucent / 半透明 | 让一部分光穿过、看不清后面的东西；不是"正好一半"（课纲不要求这个词） | opaque |
| `opaque` | opaque / 不透明 | 不让光穿过（课纲不要求这个词） | transparent |
| `light-sensor` | light sensor / 光传感器 | 测量照到它的光有多少的探头 | datalogger |
| `datalogger` | datalogger / 数据记录器 | 显示并记下传感器读数的仪器 | light-sensor |
| `fair-test` | fair test / 公平测试 | 只改变要研究的一个因素，其他会影响结果的条件保持相同（Codex 建议的说法，R: glossary-fair-test-usage） | variable |
| `variable` | variable / 变量 | 实验里可以改变、会影响结果的量，如手电筒到物体的距离 | fair-test |
| `penumbra` | penumbra / 半影 | 影子边缘只被挡住一部分光的模糊地带（课外，中学会学） | shadow |
| `compass-direction` | compass direction / 方位 | 北、东北、东……八个方向，从正北顺时针 | — |

（"正午 / solar noon"不单列：第 07 章正文与细看各解释一次。`variable` 的中文"变量"待核新加坡小学科学的中文用法；核不到就改写成"改变的量 / 不变的量"两条短语并删去本条。）

### 6.2 来源（施工时进 `sources.json`；访问日期一律 2026-10-20）

| P# | 来源 | 用于 |
|---|---|---|
| P1 | **本设计研究**（S1，自描述）：DESIGN 尺寸（§2.2）、§2.4 的模型规则与全表、§2.5 的示意之处、暗箱的示意照明、光束角、散射模型、硬纸板取 0 | 规格行、PLATE、卡片、细看 "How this model works" |
| P2 | MOE CPDD，*Science Teaching & Learning Syllabus, Primary Three to Six*（2023，Updated Jan 2026），第 15–18、22–23、40、74–75 页（moe.gov.sg …/Primary-Science-Syllabus-2023_May24.pdf） | §1.1、00、03、05 |
| P3 | SEAB，*PSLE Science (0009), For examination from 2026*（isomer-user-content.by.gov.sg …/0009_y26_sy.pdf），第 1–2 页（无印刷页码） | §1.5 |
| P4 | OpenStax，*University Physics Volume 3*，§1.1 The Propagation of Light | F-1 |
| P5 | Australian Academy of Science，*Primary Connections: Light imitates art*，Lesson 2 *How does light help us see?* | F-2 |
| P6 | 同上，Lesson 4（材料与影子；标题里"non-reflective surface"的说法不引） | F-4、F-21 |
| P7 | 同上，Lesson 5 *How can I make a shadow shorter or taller?* | F-7、05、06 细看 |
| P8 | James Hedberg，*How to see an umbra with an extended source*，CCNY Planetarium，2021-07-02 | F-5、F-6 |
| P9 | Pilkington / NSG，*Pilkington Botanical: Product range brochure*，第 2、4 页 | F-17 |
| P10 | Pilkington / NSG，*Pilkington Optifloat Opal: Acid etched glass*（2020 年 6 月）第 2 页 | F-18 |
| P11 | Jingda Wu，*Flexible Colloidal Quantum Dot Photodetection with Cellulose Structures*，博士论文，University of Washington，2016，第 33 页（**待核全文**） | F-19 |
| P12 | Guzman-Puyol, Benítez & Heredia-Guerrero (2022)，*Transparency of polymeric food packaging materials*，Food Research International 161:111792（只作"没有可引的纸板数"的说明，不进正文） | F-20（S1 note） |
| P13 | Institute of Physics，IOPSpark *Transmitting light* | F-16、03 细看 |
| P14 | Woodlands Ring Primary School，*P6 Science revision learning outcomes*（检索片段，原件 404；只作"新加坡学校用光传感器与数据记录器"的佐证，写清不可达） | F-16 |
| P15 | NOAA Global Monitoring Laboratory，*NOAA Solar Calculator* 与 *Solar Calculation Details*（gml.noaa.gov/grad/solcalc/，`main.js`） | F-24、§2.4、`sun.ts` |
| P16 | NOAA Global Monitoring Division，*General Solar Position Calculations*（solareqns.PDF） | F-24 交叉核对 |
| P17 | Şahin, İpek & Ayas (2008)，*Students' understanding of light concepts primary school: A cross-age study*，Asia-Pacific Forum on Science Learning and Teaching 9(1) Article 7，第 7–8、12、16 页 | M-2–M-5 |
| P18 | Grigorovitch & Alexandropoulou (2025)，*Alternative ideas of students 6–10 years old for the formation of shadows in the context of geometric optics*，European Journal of Education Studies 12(10):103–116，DOI 10.46827/ejes.v12i10.6212（CC BY 4.0），第 106、108–110 页 | M-1、M-8 |
| P19 | 香港课程发展议会，*An English-Chinese Glossary of Terms Commonly Used in the Teaching of Science (S.1–3)*（2001），第 21、33、42、50、59 页 | §6.1 中文 |
| P20 | Marina Bay Sands / ArtScience Museum 中文页（光源、反射、透明、半透明的本地用法） | §6.1 |
| P21 | Collins、Cambridge 英汉词典条目（影子、屏幕） | §6.1 |
| P22 | 郑美红、蔡庆麟 (2004)，《情境讨论与科学探究——纸手巾大测试》，亚太科学教育论坛 5(3) Article 5，第 10 页 | `fair-test` |
| P23 | 新加坡的经纬度（**待找**：CIA World Factbook 或新加坡土地管理局） | F-22 |
| P24 | 新加坡标准时间 UTC+8（1982 年起）（**待找**：官方或 NUS 页面） | F-23、07 细看 |
| P25 | NASA，月球（月光是反射的太阳光）（**待找**） | F-8 |
| P26 | NASA，*Sun Fact Sheet*（视直径）（**待找**） | F-26 |
| P27 | NASA Space Place，地球自转与昼夜 / 太阳看起来移动（**待找**） | F-27 |
| P28 | Winer, Cottrell, Gregg, Fournier & Bica (2002)，*Fundamentally misunderstanding visual perception*，American Psychologist 57(6–7):417–424（可选，**待核**；只进 S1 note） | F-9 |
| P29 | OpenStax，*University Physics Volume 3*，§1.2 The Law of Reflection（漫反射一段；只引"粗糙表面向许多方向反射"，不引定律） | F-3 |

- 只读到摘要的、挡爬虫的（P11、P14），照 `writing-rules.md`「来源可达性」写 `note`。参考图不进来源（§3.3、§9）。Codex 的 `facts.json` 每条有 ≤ 25 词的原文摘录，施工代理据此逐条回原文核对。

---

## 7. 图像清单（石墨图版风格，给 Codex）

风格固定用 `scripts/illustrate.ts` 的 `STYLE_BRIEF`（19 世纪科学图版的石墨铅笔画、无色、无文字、透明底）；首页图版 1:1，章节图 4:3。**图只当插画，不当事实依据**；主会话入库前逐张核对物理（本主题的图**物理必须对**：光源、物体、影子三者共线；点光源的影子按距离放大、不会比物体小；影子背着太阳；太阳越低影子越长）。共同要求：无文字、无数字、无人物与手、无品牌、无"光束 / 光锥 / 烟雾"（除非 SUBJECT 明写的细虚线）。

### 7.1 Codex 草稿审查（`art/planned/light-and-shadows/`，2026-10-18 生成）

| 草稿 | 看到的 | 决定 |
|---|---|---|
| `light-and-shadows.png`（封面，1024²） | 侧面的手电筒（像舞台灯）、圆片、斜放的屏幕，屏上一个圆影；无文字、灰度。问题：圆片离手电筒约是到屏幕距离的 1/4，按直线几何影子应是圆片的 4 倍多，画里只有约 1.9 倍；屏幕斜放，看不清影子与光轴的关系；影子边缘发虚（大光源）而手电筒头很小 | **重画**（SUBJECT 见下：圆片正好在中点 → 影子正好 2 倍；屏幕垂直于光轴、正侧面看） |
| `light-and-shadows-shadow-distance.png`（1536 × 1152） | 两套手电筒—圆片—屏幕：左套圆片靠近手电筒、影子大（对）；右套圆片贴着屏幕，**影子画得比圆片还小**（错：小光源的影子不会比物体小）；左套影子约 2.3 倍而按画面距离应约 5 倍；两套透视不同、手电筒—屏幕距离看不出相等 | **重画**（正侧面、上下两套、同样的手电筒—屏幕距离；上套 4 倍、下套 4/3 倍） |
| `light-and-shadows-opaque-translucent.png`（1536 × 1152） | 木托架上三块方片：透明玻璃（看得清后面托架的边）、磨砂玻璃（同一条边模糊）、胶合板（完全挡住）；旁边躺着一支手电筒（关着）；无光线、无文字 | **沿用**（第 03 章）。物理对："看得清 / 看不清 / 看不见"正是 F-21；第三块是木板不是硬纸板，图注写"不透光的木板"即可，反而说明"不只是硬纸板" |

### 7.2 终版清单

| 文件 | 用途 | SUBJECT（原样英文） |
|---|---|---|
| `genimg/roadmap/light-and-shadows.png` → `public/illustrations/light-and-shadows.webp` | 首页图版（重画） | an exact side view of a school light experiment on a long wooden track, as a natural-history plate: at the left a small plain hand torch held in a clamp on a short stand, its lens facing right; at the right an upright flat white board standing square to the track; exactly halfway between the torch lens and the board, a flat opaque cardboard disc on a thin rod, facing the torch; the centre of the torch lens, the centre of the disc and the centre of a dark round shadow on the board all lie on one straight horizontal line; the shadow on the board is exactly twice the diameter of the disc, with a crisp edge, inside a faint lighter round patch where the torch lights the board; no beam, no rays, no smoke, no hands, no text, no numbers, no logos, generous empty margins |
| `public/illustrations/figures/light-and-shadows-opaque-translucent.webp` | 第 03 章：看得清、看不清、看不见（沿用草稿） | （草稿已生成，见 `art/planned/manifest.jsonl` 第 64 行） |
| `public/illustrations/figures/light-and-shadows-same-object-two-shadows.webp` | 第 04 章：同一个罐子的两个影子（新） | two identical small experiments drawn one above the other on one natural-history plate, each seen from slightly above and in front: a small plain torch at the left shining right towards an upright white board at the right, and between them one plain unlabelled metal tin lying on its side on a small cradle, at the same place in both; in the upper experiment the tin lies across the line of the light, side-on to the torch, and its shadow on the board is a wide rectangle, wider than it is tall; in the lower experiment the same tin has been turned so that its round end faces the torch, and its shadow on the board is a circle; each shadow sits on the straight line from the torch through the tin; no beams, no rays, no hands, no labels or printing on the tin, no text, no numbers |
| `public/illustrations/figures/light-and-shadows-shadow-distance.webp` | 第 05 章：手电筒越近影子越大（重画） | two identical school light experiments drawn one above the other on one natural-history plate, each in exact side view on its own straight wooden track of the same length: a small plain torch at the left end, an upright white board at the right end square to the track, the same distance apart in both; between them the same flat opaque cardboard disc on a thin rod; in the upper experiment the disc stands one quarter of the way from the torch to the board and its dark round shadow on the board is four times the disc's diameter; in the lower experiment the disc stands three quarters of the way and its shadow is only a little bigger than the disc, never smaller; in each, the torch lens centre, disc centre and shadow centre lie on one straight horizontal line; fine straight dotted lines from the torch lens just touching the top and bottom edges of each disc continue to the top and bottom edges of its shadow; no beam cone, no hands, no text, no numbers |
| `public/illustrations/figures/light-and-shadows-sun-day.webp` | 第 07 章：一天里杆子的影子（新） | a natural-history plate of one thin vertical pole standing on flat paved ground in an open school courtyard, drawn from the south and a little above, with tropical trees far in the background; three shadows drawn from the same foot of the pole, like a record of one day: a long thin shadow stretching to the left, a very short shadow pointing away from the viewer, and a long thin shadow stretching to the right, each ending in a small chalk mark; three small sun discs in the sky: a low one on the right, opposite the long left-hand shadow; a high one almost overhead, belonging to the very short shadow; a low one on the left, opposite the long right-hand shadow; each sun stands exactly opposite its own shadow, and a fine straight dotted line runs from each sun past the top of the pole to the tip of that sun's shadow; the lower the sun, the longer its shadow; no people, no text, no numbers, no compass letters |

- 封面、距离图的核对点：圆片位置（中点 / 1/4 / 3/4）与影子倍数（2 / 4 / 4/3）、三心共线、影子不小于圆片、屏幕垂直于轨道。罐子图：上长方形宽大于高、下圆形，两次罐子同一位置。太阳图：每个太阳在它影子的反方向、越低影子越长、虚线擦过杆顶落到影子尖端；早上 / 下午的左右不要求与第 07 章的东西对应（图没有方位），但三条影子必须从同一个杆脚出发。
- 生成后主会话逐张看：不对的重画（docs/33 的经验：生成器难以把放大倍数画准，SUBJECT 里给了"正侧面、正好一半 / 四分之一"的硬约束，仍可能要 2–3 次）；首页图 `webp` 守 92 KB 预算（docs/33 §9.2）。

---

## 8. 施工顺序、分工、验收

### 8.1 施工顺序与文件归属（照 skill `atlas-space-topic` 的 `build-order.md`；本主题**不需要新依赖**；子代理不改 `package.json`、不提交；主会话验收后提交，push 等 Gavin）

| 步 | 内容 | 谁 | 文件 | 完成标准 | 估计 |
|---|---|---|---|---|---|
| 0 | 本 spec 定稿（§0 已代定）；docs/17 P4 Light 行与 §7 B10 / D1 的状态同步（B10 由步进控件 + `offset` 做到；D1 的光影部分由 E-L1 + E-L2 代替，"three.js 真阴影"一句改掉）；docs/README 加一行 | 主会话 | docs/35、docs/17、docs/README | — | 0.1 天 |
| 1 | 脚手架 `pnpm tsx scripts/new-topic.ts light-and-shadows --engine space-scene --subject science --title-en "Light and Shadows" --title-zh "光与影"`；参考图 R1–R7 下到 `scripts/geo/light-and-shadows/refs/`，逐张核许可 | 主会话（参考图可交 Opus 内容代理） | 主题目录、refs | validate 绿 | 0.3 天 |
| E | E-L1–E-L7（§4.7）：模型、太阳、`shadow-cast`、`place`、`format: time`、`views.shadows`、夹具 `sample-light`、测试、docs/06 | Opus 引擎（一个代理，或 A / B 两个，§4.7）；或 Codex 实现 + Opus 复核（同 docs/33 §9.1） | §4.7 的文件；**不碰** `src/content/topics/light-and-shadows/` | §4.8 全勾 | 4 天 |
| D1 | 数据骨架：32 零件 + 2 context、7 组 + 只有流的 `rays`、两条流、姿态、预设、views、spec、telemetry；章节 frontmatter（state、拍、index；`sim` 与叠加等 E 合并后加）；生成脚本 `scripts/geo/light-and-shadows/build-parts.ts`（刻度、镜子朝向、暗箱流路径、三条太阳路径——太阳路径 import `lib/sim/sun.ts`，与模型同一份代码） | Opus 内容（几何 + 数据），**与 E 并行** | `src/content/topics/light-and-shadows/data/parts.json`、`chapters/*.mdx` frontmatter、`scripts/geo/light-and-shadows/` | validate 0 error；与 spec 的差异写进汇报 | 1.5 天 |
| D2 | R2 几何两轮（器材比例对照 R1–R7）→ R3 材质（纸板、玻璃、磨砂、描图纸、白屏在 paper / cinema 下都读得出；光斑与影子的对比）→ R4 叠加接入（E 合并后）：影子、光线、粉笔点、太阳 `place` | Opus 内容（视觉） | 同上 + `docs/screenshots/light-and-shadows/` | 每轮 `pnpm shoot light-and-shadows` 截图自证；calls / 三角形在 §3.4 预算内；**截图里每个影子的大小与 PLATE 读数一致**（`shadows()` 比对） | 2 天 |
| T1 | 来源逐条读、待核落定（F-3、F-8、F-19、F-20、F-22、F-23、F-26、F-27、P11、P23–P29、`variable` 的中文）；S1 设计研究来源（§2.4 全表 + §2.5 全文）；英文草稿：零件 summary / detail、正文、细看、名词定义、`sources.json` 英文 | Codex 起草 → Opus 内容复核事实 | `sources.json`、`glossary.json`、parts.json 文本字段、`chapters/*.mdx` 正文 EN、`SOURCES.md` | 事实表与来源一一对应；`sources-md.ts light-and-shadows` | 1.5 天 |
| T2 | 中文：零件、正文、细看、名词、来源 `zh`、字幕 ZH（§1.6、§6.1；中文独立成文，不译英文） | Claude（Opus） | 同上 ZH 字段 | 用词与名词表一致 | 1 天 |
| I | 图：重画封面与 `shadow-distance`，新画 `same-object-two-shadows`、`sun-day`；入库四张 + 封面 | Codex 出图 → 主会话逐张审 | `genimg/`、`public/illustrations/` | §7.2 的核对点 | 0.5 天 |
| B | 41 拍定稿：镜头、标注、`sim.set`、`hide`、字幕 EN / ZH | Sonnet | `state.beats` | `--beats` 0 失败、无漏标、四种组合 | 1 天 |
| P | HUD 排版、模式组合、手机、事实与代码审计；`energy-conversion` 第 01 章、`telling-time` 第 04 章细看补回链（主会话改，内容代理不碰别的主题目录） | Sonnet QA；视觉问题回 Opus | — | §8.2 全勾 | 1 天 |

- 合计：引擎约 4 天（与 D1 并行）；内容约 8 天。
- 同一时间只有一个代理写 `parts.json`（D1 → D2 → T1 文本字段 → B 拍）；Codex 的草稿交给 Opus 内容代理合并，不直接写主题目录。
- **样章**：第 05 章（移动手电筒 + T5）先做完给 Gavin 看——最能检验影子与读数的一致、侧视镜头的"相似三角形"读法和折线图。

### 8.2 验收（`acceptance.md` 全部 + 本主题另加）

- [ ] **课纲对齐**：第 75 页两条 Core Ideas 在 01–03 章的正文或拍里；Practices 的五个量（形状、大小、位置、光源—物体、物体—屏幕）在 04–06 章各有一张卡或一拍；第 15 页"认出公平测试"在 05、06 章的卡片三行与第 4 / 5 拍；第 16 页"读表与条形 / 折线图"在 T3、T5、T6、T7。
- [ ] **边界**：主线（字幕、正文非细看段）`grep` 无 transparent / translucent / opaque、透明的 / 半透明 / 不透明 的术语用法（"透明玻璃"作材料名除外）；全文无"入射角 / angle of incidence / law of reflection"；第 07 章与半影、相似三角形的细看都标"课外 / 中学会学"；UI 无年级、无 Foundation。单测 `tests/space-scene/light-topic.test.ts` 守住。
- [ ] **必须讲对的十处**（§0 D6）各有一拍或一段正文；误解目录 M-1–M-10 每条在指定章出现并给出正确说法；无"影子是倒影""眼睛发出光"的肯定说法。
- [ ] **数字一致**：卡片、PLATE、字幕、正文、细看、S1 里同一个量同值（20 / 32 / 12 cm；12 / 16 / 20 / 24 / 28 / 32 cm；91 / 45 / 35 / 0 %；18 / 14 %；Ø 2.0 cm 的亮点；3.25 / 0.21 / 1.99 / 4.70 m；12.50 pm；0.41 m 南；约 5 cm；83 % / 91 % / 约 65 %）；模拟的写"在这个模型里 / in this model"。单测：字幕里的模拟数 = 该拍设置下模型的输出；正文里每个 S1 数字 = 模型输出或设计值；`sun` 的表 = NOAA 夹具。
- [ ] **画面 = 读数**：每拍截图时 `__atlas.engine.shadows()` 的包围盒与当时的 `shadow-height` / `shadow-width` 差 < 0.2 cm；有孔卡对齐时屏上有亮点、挪开时没有；粉笔点与影子尖端重合；场景里没有引擎主光投出的第二个影子（`views.shadows: contact`）。
- [ ] **试一试**：01–07 七章可用；鼠标、触屏、键盘 `[` `]` `T` 都能操作；URL `sim=` 往返；换章重置；T3 条形图、T5 / T6 / T7 折线图（T7 x 轴是时刻）；先猜后看中英文都对、不判对错；`object` / `material` 互设不出现"物体和材料片同时在支架上"。
- [ ] **写实**：Tier-1 清单（§3.3）逐项对；hero-clean 不认识这个主题的人能说出"手电筒、卡片、屏幕上的影子"；磨砂玻璃与描图纸在两套主题下都读得出不同；暗箱的小孔和插着的手电筒看得见。
- [ ] **两处不同框**：`outdoors` 只在第 00 章第 4 拍与第 07 章出现，那几拍 `layers` 不含实验台各组；单测守住。
- [ ] **安全句**：第 00 章正文、第 07 章细看各一句，不渲染。
- [ ] **链接**：`<TopicLink>` 到 `energy-conversion`（`energy-from-the-sun`）、`telling-time`（`am-and-pm`）通过 validate；两边细看补回链（主会话）。
- [ ] **性能**：实验台静止 ≤ 45 calls / 运转 ≤ 50 / 上限 100；三角形 < 0.25 M；模型一次求值 < 0.1 ms；`shadow-cast` 静止时不要帧。超过目标时在 §9 写明。
- [ ] **手机 390 × 844**：试一试卡片在抽屉里可用，按钮 ≥ 44 px；侧视镜头里卡片和影子都看得清；空地俯视的粉笔点看得清。
- [ ] 首页图 + 4 张配图逐张核对 §7.2。
- [ ] 门槛全绿：`pnpm check`、`pnpm validate`、`pnpm test`、`pnpm build`、`pnpm e2e`；`pnpm shoot light-and-shadows --layout --keys --beats` EN / ZH × paper / cinema 0 失败，console 干净、无外部请求；首页 / smoke 的已发布主题计数更新。

---

## 9. 施工记录 / 已知差距

### 9.1 引擎（Codex，2026-10-20，`codex/space-light`）

**实现**：§4 E-L1–E-L7。`light.ts` 五个子模型（bench / sheets / holes / seeing / sun），`sun.ts` 逐函数移植 NOAA `main.js` 的 Meeus 算法、折射与两次迭代正午；`SIM_KINDS`、`simQuantities`、`quantityKind`、状态域与 `SEPARATE_EXPERIMENTS.light` 已注册；没有 timeline 量，`simTimelineChannels` 返回 null，既有力、能量、生活史的回放契约不变。

| 件 | 代码 / 作者入口 |
|---|---|
| 模型与验证 | `lib/sim/{light,sun}.ts`、`sim-schema.ts` 的 `lightSchema / lightIssues`；完整模板 `tests/space-scene/fixtures/light-bench.ts` |
| 几何投影 | `lib/sim/shadow.ts`、`stages/model3d/ShadowCast.tsx`、`SimOverlays.tsx` 的独立分支；真实网格含 extra 与实例，点光 / 平行光、矩形 / 光锥 / 圆裁剪、不透明影子并集、光斑、光线与粉笔点 |
| 舞台绑定 | `lib/sim/bind.ts` 的 `place`，`PartNode.tsx` 沿球面 0.5 s 插值、+Y 朝 centre，深链接直接终值；复用既有 offset / rotate / pose / visible / tint / glow |
| 时间显示 | `lib/sim/text.ts`、`chart.ts`、`TryIt.tsx`、`TryChart.tsx`、`PlateBlock.tsx`，全部走全站 `{t:HH:MM}`；整点轴短写，读屏读时刻，间隔读小时，URL 仍是数 |
| 阴影模式与 QA | `views.shadows: auto / contact / none`；contact 不更新主光阴影贴图，只留接触斑；`__atlas.engine.shadows()` 返回接收面 cm 包围盒 / 光斑 / trail / rays；`stats().shadowMapUpdates` 为主光阴影更新请求计数 |
| 夹具 | `sample-light`，draft，34 个 primitive 零件、5 章 / 25 拍：背景章含暗箱与孔卡，距离卡（记录、折线图、预测）、7 件物体×转向、4 种材料（条形图）、太阳（3 日期、时刻、轨迹、粉笔点） |

**作者要注意的差异与决定**：

1. **原稿的距离范围几何上不相容**：12 cm 大圆卡在 a=10、b=60 cm 时影高约 84 cm，不能完整落在 60×45 cm 屏幕；a=10 cm 还会让第一张孔卡与光源重合。没有放宽守门：模板与夹具用 torch `[20,30,40,60]`、screen `[10,20,30,40]`。T5 / T6 的完整原稿表仍由单测单独核对；原始全范围有明确拒绝用例。内容作者须缩窄范围、拆实验或同步扩大真实屏幕。
2. 选择互设保留既有 `control.sets: { option: { other: value } }` 语法；原稿选项里的 `sets` 不是既有数据形状。现在允许把有 sets 的另一个选择重设到它**不带 sets 的 free 选项**，仍拒绝递归链；选材料清物体、选罐子清材料、URL 往返都已测试。
3. 五个子模型可各自省略，便于小夹具；sheets / holes 必须有 bench。实际数据尺寸与模型尺寸要一致，卡片厚度不能省略；光源 point 是零偏移时的世界坐标。
4. 裁剪由叠加自己 shader 的矩形 / 光锥 / 圆测试完成，不借全局 CUTAWAY。效果与平面裁剪相同，互不干扰。影子与光斑不透明、`depthWrite:false`，保留 depthTest；这消除了共面前后面投影竞争造成的白色放射缝，且多张孔卡自然取并集。
5. 超出接收面 / 光束的边缘光线不画（支架底座的投影落在桌面以下）；extra 轴线对网格求交、透明片后按透光量继续。关灯有限 0.3 s 淡出；拆开时冻结实验投影并淡出，避免把拆开位移当实验。
6. 夹具的 courtyard 是可选普通零件，符合 overlay 不接收 context 的校验；暗箱的静态流归 `dark-box` 组，避免户外的 rays 图层把实验桌外的静态光路也带出来。太阳章 id 为 `sun-shadows`，避免与零件 `sun` 撞全局 id。夹具标题与字幕是用户明确授权的占位内容；没有新建正式 `light-and-shadows` 内容目录。
7. NOAA 的独立参考值从主工作树 `art/codex-research/light-and-shadows/sources/solar-results.json` 复制进 `noaa-singapore.json`，含来源；不是拿新实现的输出自造参考表。描图纸 0.65 在夹具只是 spec 的 SIM 系数，正式内容仍须按 §0.1-3 核实来源。
8. 夹具只保留内建 ORBIT / REF.：命名预设只换镜头、不换章节图层，从暗箱切到空地预设会对着隐藏的装置。五章与各拍负责两个地点的取景，避免把这种空镜头当作作者模板。右侧 chain 只列 source / objects / screen 三组，其他组仍在 LAYERS 和章节索引中；杆子改用现有 powder 材质 token，纸色地面上也看得清。
9. 暗箱两条流用 `whenRun: true`，对应三拍开启 RUN；不能把它们写成 always-on，否则已有 RunClock 会在流图层隐藏时也持续要帧，令静止实验台无法 IDLE。
10. T5 的 a=10 cm 还有一个精度边界：2 mm 厚卡的近面在 a−0.1 cm，真实影高比零厚公式大 `1/99 ≈ 1.0101%`，略超 §4.8 写的 <1%。保留真实厚度与网格一致；单测明确钉死这项差值，其余表格距离均 <1%，取整仍逐格相等。没有用舍入后的数字冒充内部误差合格。
11. 视觉 QA 发现默认 REFERENCE 会把相距 10 m 的两套实验一起取景，隐藏的空地把实验台缩成一点。增加可选 `views.reference: { fit: "layers" }`，只按当前图层中未隐藏、非 context 的零件取景；显式 camera 优先，既有主题缺省行为不变。夹具启用，两地点的 e2e 都核对 REFERENCE 的目标中心。

**测试**：新增 88 个单测（四个文件 `light.test.ts`、`sun.test.ts`、`shadow.test.ts`、`light-display.test.ts`），钉死 T5 / T6、7×3 轮廓、材料 91/45/35/0 与 18/14、孔 Ø2 cm、暗箱三态、选择互设 / URL、非法数据；实际几何顶点投影与模型相差 <0.2 cm，边缘光线误差 <1 mm，孔卡并集 / 裁剪 / 每小时杆顶投影。NOAA 七行高度 / 方位误差 <1e-8°，正午钟点一致；11 行整点表、夏冬方向与三月近天顶。6 个 fixture e2e 包括 21 种真实物体 / 角度组合 <2 mm、深链接与缓动、材料图、时刻与中文手机 44 px、主光阴影计数 0。已有主题内容、`package.json` 与依赖均未改。

**性能实测**：Metal（Apple M5 Max），1600×900 的暂停距离章 19 calls / 3,268 triangles，太阳章 9 / 8,236，均进入 IDLE、主光阴影更新 0；六个 fixture e2e 另钉死两个地点的暂停 IDLE。完整五子模型 `evaluateSim` 固定默认值重复 100,000 次平均 0.00505 ms；首次冷求值（建采样缓存与 JIT）6.20 ms，**冷启动不满足 <0.1 ms**，不能把稳态均值说成冷启动也合格。共享 SpaceScene 页面 JS 从基线 467.6 KB gz 到 476.0 KB（+8.4 KB）；300 KB 页级旧预算在基线已超，本次没有解决这个既有体积缺口。

**基线与门槛**：基线为施工前 `2fb289e` 的独立静态构建。用户指定五主题的 Metal hero 前后图已逐张看：forces 逐像素相同，energy-conversion / mosquito / magnets / circuits 的 >8 RGB 差像素分别约 0.2685% / 0.2885% / 0.0014% / 0.0115%，来自流动粒子，几何、光照与影子相同。五主题加 grasshopper / aircon 的 beats / keys 均通过，控制台干净。check（594 文件，0 error / warning，3 个已有 hint）、validate（38 主题，0 error / warning）、test（113 文件 / 3,046 tests，限制 Vitest worker 至 2）、build（79 页）已通过。完整 CI 首跑 175/177：能量章镜头稳定性比较失败一次，独立重跑通过；另一项是主会话并行 Playwright 运行清理同一输出目录造成的 trace 文件冲突。最终 `CI=1 pnpm e2e` 完整单次运行 **177/177 通过（29.0 分钟）**，没有并行浏览器 QA 干扰。`pnpm shoot sample-light --beats --keys --layout`：25/25 拍链接、0 key 失败、8 尺寸 / 0 layout 问题、控制台干净；最终 61 张 PNG（EN paper 的拍与布局、EN cinema、ZH 两主题）全部逐张打开核对。完整日志、61 图 SHA-256 清单、前后基线与差值保存在工作树外 `../codex-light-engine-QA/` 及报告中。

**复核（Claude，2026-10-20）**：

- 每个显示的数都由模型算出；T5 / T6、形状表 7 × 3、材料 91 / 45 / 35 / 0 % 与 18 / 14 %、孔 Ø 2 cm、暗箱三态、NOAA 七行与 11 行整点表单测钉死；新增三个日期的正午（12.50 pm 78.4° 0.21 m 北 / 1.06 pm 67.9° 0.41 m 南 / 1.11 pm 89.9° 0.00 m）、下午 1.00 时两行、"正午离头顶 < 0.3° 只有 3 月 23–24 日与 9 月 19–20 日"的全年扫描。**§2.4 的 3 月 24 日下午 1.00 时影子方向原写 268°，模型是 267.49°，已改为 267°**（方向名仍是西）。
- 圆柱 / 圆锥的轮廓采样从 180 × 61 网格改为两端圆周（圆锥：底圆周 + 顶点），各 720 段：透视投影保持凸包，包围盒精确，表格读数不变；换物体 / 角度的首次求值从约 2.6 ms 降到约 0.2 ms（tsx 实测，第一次调用含 JIT 约 1 ms）。
- 光线求交改用纯函数 `shadow.ts segmentMesh`（包围盒先筛 + 不分配内存的 Möller–Trumbore），去掉组件里的 three `Raycaster` 与每个挡光物的代理网格；`segmentTriangle` 原先只有单测在用，现在单测与舞台走同一条路。
- `edges: "vertical"` 的边缘光线：光源与被擦过的那条边之间若有**另一个不透光挡光物**（比那条边近光源 1 mm 以上；贴着的支架细杆不算）就不画——大圆卡后面的细杆顶端、第一张孔卡后面的第二三张孔卡。原先这些线穿过卡片画到影子里，看上去像光到了影子中。
- 夹具 `views.shadows` 改为 `"none"`：`contact` 留下的接触斑按整个模型的包围球放在原点，两处相距 10 m 时在空地旁边落下一大块没有挡光物的灰斑（截图可见），与 D4"场景里只有模型算出的影子"相违。**正式主题同理建议 `none`**（D4 写的是 `contact`，请主会话定）。
- 夹具屏幕去掉 `tint: token:paper`：接收面的底色取它自己的材质色，cinema 里 paper token 是深色底板，屏幕变黑；白屏在两套主题里都应是浅色（`enamel`）。
- PLATE 读数与 SIM 状态行的时刻改为与其他读数一致的英文大写（`8.00 AM`），读屏 aria-label 仍按当前语言读时刻。
- 新代码统一为仓库的单引号写法；着色器不再用字符串替换拼接。
- **给内容作者 / 主会话**：① §0 D11 的距离全范围与 60 × 45 cm 屏幕仍不相容（见上第 1 条；连 Ø 8 cm 圆卡在手电筒 10 cm、屏幕 60 cm 时影高也有 56 cm），要么缩窄距离、要么把罐子 / 大圆卡与极端距离分到不同章并在数据里分成不能同时出现的组合（引擎目前按全部组合守门）；② 太阳圆盘按 D1 / §3.4 是 `face: centre` 的扁圆盘，正午前后从侧面镜头看是一条细线，正式主题可改成球或调镜头；③ 暗箱关灯时球的 `tint` 走引擎通用的 55 % 混色，加上环境光后只暗了约 10 %，"箱里一片黑"的示意偏弱。

### 9.2 内容施工（Claude，2026-10-20，worktree `worktree-agent-a1075584bcf4434ed`）

**交付**：`src/content/topics/light-and-shadows/`（topic.yaml、8 章 = 背景章 00 + 01–07、41 拍、7 张试一试卡片、名词 14、来源 18、SOURCES.md）；几何与 sim 由生成脚本 `scripts/geo/light-and-shadows/build-parts.ts`（几何、sim、镜子角度、暗箱光路、三条太阳路径——太阳路径 import 引擎的 `lib/sim/sun.ts`）+ `text.ts`（零件名 / summary / detail）写出 `data/parts.json`；35 个零件（34 个编号 + 教室桌 context）。测试 `tests/space-scene/light-and-shadows-topic.test.ts`（66 项）、`tests-e2e/light-and-shadows.spec.ts`（9 项）；`tests-e2e/smoke.spec.ts` 计数 26 → 27。没有改引擎代码、`package.json` 与依赖。

**引擎复核留下的四个决定**（§9.1 末条）：

1. **距离范围与屏幕**：屏幕改为 **60 × 50 cm**，光轴随之升到桌面上方 **30 cm**（y = 1.05，原 25 cm；50 cm 的板在 25 cm 光轴下会压到轨道）；手电筒到物体 **15 / 20 / 30 / 40 / 60 cm**（去掉 10 cm：它让第一张孔卡贴在镜片上），物体到屏幕 **10 / 20 / 30 / 40 cm**（去掉 50、60）。在这套范围里，7 件物体 × 3 个角度 × 5 × 4 个距离全部通过 validate 的屏幕与光束守门（最大影高 48.0 cm = 大圆卡侧对、15 / 40；最大影宽 56.4 cm = 罐子侧对、15 / 40），单测另钉一遍。两张表仍是整数：T5（屏幕 30 cm）15 → 24、20 → 20、30 → 16、40 → 14、60 → 12 cm（弯线：20 → 15 大 4 cm，30 → 40 只小 2 cm）；T6（手电筒 20 cm）10 → 12、20 → 16、30 → 20、40 → 24 cm（每 10 cm 大 4 cm，直线）。字幕跟着改：第 05 章第 2 拍改为 15 cm → 24 cm，第 5 拍用"20 → 15 大 4、30 → 40 小 2"讲"越近变得越多"；第 06 章改为 10 / 20 / 40 / 30 cm 四拍；T6 的先猜后看改为 20 → 40 cm。
2. **`views.shadows: "none"`**，并写 `views.reference: { fit: "layers" }`。
3. **太阳画成球**（lathe 半圆轮廓，Ø 0.5 m，`place` 不再写 `face`）；太阳与三条路径的半径由 7 m 改为 **5.5 m**（= 空地半径，路径像罩在空地上的穹顶），这样早晚的太阳和杆子能同在一个镜头里。第 07 章镜头分三种：近景（低太阳的 8 时、5 时）、东侧（下午 1 时：南北方向横在画面里，6 月 21 日的影子"指南"看得出）、南侧高处（3 月 24 日，太阳近天顶）；章节的 HUD 镜头单独拉远，太阳在 HUD 之间。
4. **暗箱"关灯"**：三处一起做——① 球的 `tint` 目标由 `token:ink` 改为近黑 **`#0d0d0c`**（`token:ink` 在 cinema 主题里是浅色，原写法在暗色主题会把球染亮）；② 新增一个零件 **`box-inside`（箱里的黑暗，示意）**：箱内一块 `membrane` 近黑半透明体，绑定 `{ output: box-dark, visible: true }`，关灯时盖在箱内，球和箱底明显变暗（截图核对：开 / 关的对比清楚）；它的 summary / detail 写明"不是实物，是示意"；③ 反射光流原本就按 `eye` 隐藏。**给引擎的建议**（未改引擎）：`tint` 的强度上限是全站的 55 %，又只改漫反射色、不压环境光，所以"把一件东西画暗"做不到；可以考虑给 `tint` 一个 `max`（或一个 `dim` 绑定：同时压低环境与高光），暗箱就不需要示意零件。

**与 §3 / §4 / §5 的其他差异**：

| 项 | spec | 施工 | 原因 |
|---|---|---|---|
| 三角形卡片 | 按形心居中（底边在 −2.667 cm） | 等边三角形高 8 cm、**按包围盒居中**（底边 −4 cm） | 让底边夹进支架的夹子；形状表随之变为 0° 20 × 23、45° 22 × 17、90° 23 × 1（模型算） |
| 支架夹子 | 细杆 + 夹子 | 夹子立在卡片平面**后面**（x 0.5–8.5 mm），顶 1.018 m | 卡片挡住夹子顶，夹子不挡卡片下缘那条擦边光线（否则侧视图里只剩上面一条，"两个三角形"读不出）；罐子和球正好搁在夹子上；纸圆锥侧放时离夹子约 1.2 cm（示意） |
| 罐子轮廓 | Ø 6.6 cm | 卷边外径正好 3.3 cm | 网格投影与模型的差 < 2 mm（e2e 21 组钉死）；纸圆锥去掉接缝细条，同理 |
| 杆子 | Ø 3 cm | **Ø 5 cm** | 户外镜头里 3 cm 的影子只有几像素；影长只看杆高，不受影响 |
| `courtyard` | context | 普通零件（outdoors 组，编号 #34） | 叠加的接收面不能是 context（§9.1 第 6 条） |
| 镜头预设 | 6 个 | **不设命名预设** | 预设只换镜头不换图层，从实验台按 YARD 会对着隐藏的空地（§9.1 第 8 条）；各章、各拍写镜头对象 |
| 第 07 章 `sim.set` | time 10，第 1 拍 time 8 | 章就是 time 8 | 第一拍 = 读者点进本章看到的样子 |
| 第 06 章 `sim.set` | d-screen 30，第 1 拍 10 | 章就是 d-screen 10 | 同上 |
| 第 03 章第 5 拍 | 实验台镜头 | 从屏幕背后看传感器、线和记录器 | 传感器和记录器都在屏幕后面 |
| 暗箱镜头 | 正对小孔（光朝镜头） | 从箱子右前方看 | 正对时出射光线缩成一点、读不出；侧看时能看到光从球经小孔射出箱外 |
| 空地地面 | `enamel` 浅灰 | `plastic` 浅灰 | enamel 有大块高光；plastic 是哑光 |
| 光流粒子 | size 0.4–0.5 | 0.22 / 0.26 | 暗箱尺度小，粒子太粗 |
| 数据记录器 | 放在屏幕滑座平台 | 屏幕后面一块小托板 | 同 |

**事实（Codex 第一遍事实核查 `art/codex-drafts/light-and-shadows/facts-pass1.*` 逐条采用）**：描图纸来源由 Wu 2016 的检索片段换成 **Clauzon 2024（KTH 学位论文）图 16**（本人打开原图核对：每平方米 70 克的描图纸总透射约 65 %、雾度近 100 %；30–60 克约 70–78 %），模型系数 0.65 不变，正文写"一种较厚的描图纸实测约 65 %，薄的透过更多"（S10）；硬纸板取 0 写成"模型的取值"，删去"学校的传感器测不出"；透明玻璃的"8 % 反射"删去（来源只给透射）；太阳视直径写"略大于 0.5°"（NASA，S17），删去"影子尖端 1–3 cm 模糊"（Codex 算出早晚可到 10–20 cm）；正午全年范围写模型算出的 **12.48 pm – 1.19 pm**（单测按 `solarNoon` 扫 2026 全年钉死），不写 12.50 – 1.20；3 月 24 日下午 1 时方向 267°（西），正午 0.00 m 只在 S1 里写"约 0.002 m 取整"；新加坡坐标用新加坡统计局的范围（S13），UTC+8 用 NUS（S14）、1982 年改时区用国家档案馆（S15）；月光是反射的太阳光（NASA，S16）；地球每天自转一圈（NASA Space Place，S18）；球的影子比较对象改为 6.5 × 2.5 = 16.25 cm（不写进正文）；"在这个模型里"的散射读数写明是简化的示意。`变量 / variable` 的新加坡用法（NIE 转载的 8world 访谈）成立，名词表保留。

**Codex 的使用**：英文正文以 Codex 的 8 章草稿为底逐段改写（删去大量"rather than"式限定语、按拍重排段落、补公平测试三问），字幕以 `captions.json` 为底改成可朗读的写法（数字写成词）；中文全部本人独立写（新加坡用法、只用“ ”）。Codex 的研究（`art/codex-research/light-and-shadows/`）用于来源条目与课纲页码。

**验收截图**：`pnpm shoot light-and-shadows --beats --keys --layout --locale en,zh --theme paper,cinema`（见下"门槛"）；EN paper 41 拍逐张看过，ZH / cinema 抽查。

**已知差距**：① 右上零件链路卡 4 列，名称截断（"SMALL T…"、"DARKNES…"），引擎没有短名字段；② 光束半角 40°，光斑在大多数距离下比屏幕大，屏幕整块被照亮（米黄），"亮的一片"读作"整块屏幕被照亮"；③ 侧视镜头里个别引线穿过手电筒；④ 纸圆锥侧放时悬在夹子上方约 1.2 cm；⑤ 暗箱的"黑"是示意零件，不是光照；⑥ 背景章、第 01 章的透视图里小孔本身看不清（箱壁在 X-RAY 下透明），靠出射光线表示"从小孔出来"。

**门槛（2026-10-21，合并 main `f3624a9` 之后）**：`pnpm check`（631 文件，0 error / 0 warning）、`pnpm validate`（42 主题，0 / 0）、`pnpm test`（124 文件 / 3,271 项）、`pnpm build` 通过；`CI=1 pnpm e2e` 全量 207 / 208，唯一失败是刚合并的 `singapore-land-use.spec.ts`"farmland, reserves and reservoirs"（全量负载下水库计数 13 ≠ 3），单独重跑 3 / 3 通过，与本主题无关；本主题 9 项全过。`pnpm shoot light-and-shadows --beats --keys --layout --locale en,zh --theme paper,cinema`：四种组合各 41 拍 0 失败、拍链接 41 / 41、chapter highlights 全在屏、键位 0 失败、8 个尺寸 0 布局问题、console 干净。施工中 `[ ]` 键检查曾在第 01 章失败（开关默认开、`]` 回到章节值，URL 不带 `sim`）：第 01 章改为从"关灯"开始（第 1 拍关、第 2 拍开灯），T1 的先猜后看不变。
