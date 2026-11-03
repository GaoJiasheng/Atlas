# 69 · 插图审查（全部栅格插图，2026-11-03）

范围：`public/illustrations/` 下全部栅格图，共 279 个文件：主题封面 63 张（看 @2x，1600 px）、章节插图 156 张（`figures/`，1200×900，章节里显示约 420 px 宽；其中 2 对是字节完全相同的复用：`saturn-v-apollo-cutaway` = `space-race-apollo-cutaway`，`saturn-v-air-breathing-engine` = `how-planes-fly-turbofan-cutaway`）、动作示意 60 张（`exercises/`，1200×800）。`sun-earth-moon-*@2x` 与 1x 同图，不单独计。

方法：全部图按 9 张一页做接触印样（合成到 paper 底色 `#E9E4D8`），逐页看完；可疑图按原尺寸打开并局部放大（数量、接线、指针、文字、解剖、机构）；对照每张图在章节里的 alt / caption 判断"图是否画了正文说它画的东西"。另外按 `global.css` 的 `.atlas-drawing` 规则（cinema 主题 `invert(1) hue-rotate(180deg) contrast(.94)` + screen）模拟了 dark plate 下的样子，因为这一步会改变明暗含义。只有 `fossils-and-skeletons` 有 illustration-manifest / image-qa，其余依据章节文字。没有改任何代码、内容或图片。

## 1. 总结

| 等级 | 含义 | 封面 | 章节图 | 动作图 | 合计 |
|---|---|---|---|---|---|
| A | 保留 | 52 | 130 | 57 | **239** |
| B | 小修（重构图 / 加标记 / 主题反相例外 / 小改一处） | 4 | 8 | 3 | **15** |
| C | 重做（粗糙、看不懂、与文字不符或不合风格） | 3 | 11 | 0 | **14** |
| D | 急需重做（事实错、误导、AI 痕迹明显、暗色主题下意思颠倒） | 4 | 7 | 0 | **11** |

总体判断：graphite 技术图版风格整体统一、完成度高，绝大多数图可以保留。问题集中在四类：**(1) 讲"关系"的图（电路接线、影子形状、数量相等）被 AI 画错关系本身**；**(2) muscles-* 封面是从 Z-Anatomy 模型渲染再"描"成铅笔画，留下了漂浮的肌片、露在体表的骨头、像脊柱的白线**；**(3) 古物上的假汉字 / 假铭文**；**(4) 全站统一的 cinema 反相规则把"亮 = 被照亮"的图（月相、地球昼夜、影子）整体翻转**。

### 最差 10 张

1. `figures/circuits-series-parallel.webp`（circuits）D：右边"并联"板接线是错的——左灯两个接线柱都接到电池同一端，右灯两根线都接到同一个接线柱，两只灯都不可能亮，却画得比串联更亮。
2. `figures/light-and-shadows-same-object-two-shadows.webp`（light-and-shadows）D：上面那组的罐子轴线顺着光线（端面对着屏），影子却画成长方形；与说明"侧放→长方形"矛盾。
3. `figures/circuits-festive-lights.webp`（circuits）D：讲"串联里坏一只全灭"，图却是一只碎灯 + 其余九只发光。
4. `figures/sun-earth-moon-four-phases.webp`（sun-earth-moon）D：cinema 反相后新月变成满月、满月变黑、上弦变成下弦的样子。
5. `figures/sun-earth-moon-parallel-axes.webp`（sun-earth-moon）D：cinema 反相后地球夜面变亮、太阳变黑，"被照亮的半球"正好反过来。
6. `muscles-chest@2x.webp`（muscles-chest 封面）D：喉咙前面露出一节颈椎，腹部正中一条分节的"脊柱"，上臂骨头贴在肌肉外面。
7. `muscles-back@2x.webp`（muscles-back 封面）D：臀大肌像两片挂在身体下面的皮瓣，髂骨和骶尾骨从肌肉中间戳出来，脖子顶端是一圈毛刺断口。
8. `figures/coral-reef-polyp.webp`（coral-reef）D：口画成竖瞳"猫眼"，像怪物；alt 说是剖面，图里没有任何剖切。
9. `fractions@2x.webp`（fractions 封面）D：分数主题的封面，饼的 8 块大小明显不等（最大一块约 65°，最小约 35°），与"等分"概念冲突。
10. `figures/warring-states-tiger-tally.webp`（warring-states）D：切面上是 AI 编造的"篆书"，不是任何字；中文读者一眼看出是假字。

（紧随其后：`muscles-shoulders@2x` 的鱼骨状脊柱、`warring-states-crossbow-trigger` 的梳齿状零件、`warring-states-zhou-war-chariot` 的现代马具。）

## 2. B / C / D 逐图

优先级：1 = 下一批必须做（错或误导，且在正文里讲的就是这个点）；2 = 下一批应做；3 = 有空再做。

### 2.1 D：急需重做

| 主题 | 文件 | 等级 | 问题（具体） | 正确应该是什么 | 重做方式建议 | 优先级 |
|---|---|---|---|---|---|---|
| circuits | figures/circuits-series-parallel.webp | D | 右板（并联）：电池左端引出两根线，一根到左灯左接线柱、一根到左灯右接线柱，左灯被同一极短接；电池右端两根线都落在右灯右接线柱，右灯左接线柱空着。两只灯都不可能亮，却画成发光最强。左板（串联）接线正确。 | 并联：电池 + 极分两路，各到一只灯的一端；两只灯的另一端各自回到 − 极。每只灯恰好一端接 +、一端接 −。并联灯亮度 ≥ 串联灯，亮度用同一画法表现。 | 代码画（SVG 几何 → 铅笔质感滤镜/hatch），像 040f192 骨骼图那样写断言：每只灯的两个接线柱分别连到不同极、串联图只有一条回路。不要再让 AI 画接线。 | 1 |
| light-and-shadows | figures/light-and-shadows-same-object-two-shadows.webp | D | 上下两组的罐子轴线都顺着光线方向（上组能看见朝屏一端的圆面，下组能看见朝灯一端的圆面），按几何两块屏都该是圆形影子；图上上组却是长方形。说明文字"side-on a rectangle"与图不符。 | 上组：罐子侧放，轴线与光线垂直（看见的是罐身侧面，看不到端面）→ 长方形影子，长宽比与罐子侧影一致；下组：端面正对灯 → 圆形影子。两组灯、罐、屏距离相同。 | 代码画：两组同一几何、只改罐子朝向，影子用投影计算得出。 | 1 |
| circuits | figures/circuits-festive-lights.webp | D | 讲"串联中一只坏了整串灭"，图中一只灯泡玻璃破、灯丝露出，其余 9 只都画了发光光晕。caption 只能靠"画的是坏之前亮着的样子"来圆，孩子看到的是"坏一只其余照亮"。 | 要么全串不亮（全部灯泡不画光晕，碎的那只醒目），要么并排两幅：左"坏之前全亮"、右"坏之后全灭"。 | AI 重画可接受，提示词限制："10 bulbs, NONE glowing, no light rays, one bulb with cracked glass"；或保留现图去掉光晕后作为"之后"，再配一张全亮"之前"。 | 1 |
| sun-earth-moon | figures/sun-earth-moon-four-phases.webp | D | paper 主题正确；cinema 主题被 `.atlas-drawing` 反相后：新月变成亮圆、满月变暗盘、上弦亮半边变到左边看起来像下弦。这是讲月相的图，意思整个颠倒。 | 两个主题里都应是：新月暗、上弦右半亮、满月全亮、下弦左半亮（北在上）。 | 不需要重画：给 Figure / Drawing 加 `invert={false}`（或 `data-tone="photo"`）例外，cinema 下改为降亮度不反相；或另出一张 dark plate 版本。见 §4。 | 1 |
| sun-earth-moon | figures/sun-earth-moon-parallel-axes.webp | D | 同上：cinema 反相后太阳成黑球，两颗地球的夜半球变亮、昼半球变暗——"哪半边被照亮"正是这张图要讲的。另外 paper 下太阳画成很小的灰球，不够像光源（次要）。 | 太阳是最亮的物体，地球朝太阳一侧亮、背侧暗，在两个主题都成立。 | 同上加反相例外；顺手把太阳画亮一点（可代码画两地球 + 光照半球分界线）。 | 1 |
| muscles-chest | muscles-chest@2x.webp（封面） | D | 由模型渲染描成的铅笔图：喉部正中露出一节颈椎和锁骨关节，像骨头长在脖子前面；腹直肌中线是一条分节的深色"脊柱"（实为白线 linea alba 被渲染成节段）；肱骨、尺桡骨裸露在上臂肌肉外侧；没有头颈，躯干边缘有一圈淡轮廓线。孩子会以为胸前有脊椎。 | 胸部浅层肌：胸大肌（锁骨部 / 胸肋部）、三角肌前束、前锯肌、腹直肌与白线（白线是一条平滑的浅色腱带，不分节）、腹外斜肌；骨骼要么完全不画，要么只淡淡画锁骨和胸骨。 | AI 重画（或基于模型渲染后人工修），提示词约束："superficial chest muscles, front view, torso with neck and head outline, NO visible vertebrae, NO bones outside muscles, linea alba as a smooth pale tendon line"；验收时逐项对 muscles-chest 数据里的肌肉表。 | 1 |
| muscles-back | muscles-back@2x.webp（封面） | D | 臀大肌画成两片从骨盆垂下的尖角"皮瓣"，下缘飘在身体外；髂嵴、骶骨、尾骨从肌肉中间露出；肩胛下方两个白色空洞（模型缺面）；脖子顶部是一圈毛刺状断面；前臂只有外缘一条肌肉，其余是平滑皮肤。 | 背部浅层：斜方肌、三角肌后束、背阔肌、竖脊肌（可半透明）、臀大肌（圆润、附着在髂嵴与骶骨、止于股骨上段），颈部收在发际线下，不留空洞。 | 同上：重新渲染补齐缺面，或 AI 重画，提示词禁"floating flaps / exposed pelvis / holes"。 | 1 |
| muscles-shoulders | muscles-shoulders@2x.webp（封面） | D | 后视肩部：脊柱画成浅色三角区里的鱼骨 / 羽毛状纹路（实际是被渲染漏掉的棘突），像一片蕨叶；上臂下端截断处露出骨头；颈部轮廓是没有任何结构的淡色剪影。 | 后视：肩胛骨（可见冈上、冈下窝）、三角肌、冈上 / 冈下肌、小圆肌、大圆肌、斜方肌（至少轮廓），脊柱是一排圆钝棘突。 | 同上。 | 2 |
| fractions | fractions@2x.webp（封面） | D | 圆饼（印度煎饼）切 8 块，切线不过同一角度：左上块约 65°、左侧几块约 35–45°，取出的那块比剩下的块都小。分数主题封面画"不等分"，与正文第一课"等分"冲突。 | 8 块完全相等的扇形（各 45°），一块移出并略外移，移出的那块与剩下的形状一致。 | 代码画：8 个 45° 扇形 + 饼面纹理（可用 AI 生成的纹理裁进扇形），保证几何正确。 | 1 |
| coral-reef | figures/coral-reef-polyp.webp | D | 口画成竖直的"猫眼"缝（像一只瞳孔），整个水螅体像带眼睛的海葵怪物；alt 写"cutaway … soft tissue and the supporting skeletal cup"，图里没有任何剖切，只是俯视外观。 | 斜侧视剖面：一圈触手（6 的倍数，如 12 根），中央口为小的椭圆开口，下方切开显示胃腔、组织层和石灰质杯（带隔片）。 | AI 重画，提示词："oblique cutaway, mouth is a small round/oval opening, NO eye-like slit, 12 tentacles, septa in the skeletal cup visible in section"；或代码画剖面。 | 1 |
| warring-states | figures/warring-states-tiger-tally.webp | D | 两半虎符切面上刻满 AI 编造的"篆书"，没有一个是真字；两半各是一整只完整的虎（而不是一只虎的左右两半），切面上还有凹凸榫。 | 战国 / 秦虎符：一只伏虎沿脊线纵剖为左右两半，各显一侧外形；铭文在虎身侧面，嵌金错银，文字可查（如杜虎符"兵甲之符，右在君，左在杜……"）。 | 首选：维基共享资源上杜虎符 / 新郪虎符的公有领域照片描摹（记来源）；若 AI 画：严格"NO text, NO characters"，铭文位置只留浅色带。 | 1 |

### 2.2 C：重做

| 主题 | 文件 | 等级 | 问题（具体） | 正确应该是什么 | 重做方式建议 | 优先级 |
|---|---|---|---|---|---|---|
| muscles-core | muscles-core@2x.webp（封面） | C | 腹白线画成一条分节的梯子 / 脊柱状条带，中间一个小圆环当肚脐；两侧腹外斜肌像折起的硬纸板立在身体外；骨盆闭孔、股骨裸露。 | 腹直肌（3–4 道腱划）、白线（平滑腱带）、腹外斜肌包绕侧腹、可淡显肋弓与髂嵴。 | 重新渲染或 AI 重画，同 muscles-chest 约束。 | 2 |
| muscles-arms | muscles-arms@2x.webp（封面） | C | 胸大肌是两块漂浮的平板、下缘悬空；手部是骨架 + 肌腱，前臂却是完整肌肉，风格混杂；肩部以上只有淡色剪影。 | 双臂前视：三角肌、肱二头肌、肱肌、肱桡肌、前臂屈肌群；胸部只淡显或不画；手画完整外形。 | 同上。 | 2 |
| energy-conversion | energy-conversion@2x.webp（封面） | C | 建筑剖面用三处之字形"断裂线"把楼层切开，中间一层悬空，读起来像地震震裂的楼；太阳、太阳能板、电梯、单车发电机各自很小，看不出"能量转换"主题。 | 一个完整的组屋剖面（或一组物件），清楚可读的 2–3 个转换场景：屋顶太阳能板→电、电梯（电→动能/势能）、风扇或单车发电。 | AI 重画，禁用断裂线（"NO zigzag break lines, building intact"）。 | 3 |
| coral-reef | figures/coral-reef-zones.webp | C | 一块多孔的礁石块，没有海面线、没有水深、没有分区界限，看不出"礁坪—礁脊—礁坡"三个区。 | 侧剖面：海面线、浅而平的礁坪、略高的礁脊（浪花线）、向深处下倾的礁坡；可加深度示意但不标具体数字。 | 代码画剖面（几何 + 铅笔纹理），区段在 HUD 或 caption 里命名。 | 2 |
| inside-the-earth | figures/inside-the-earth-boundary-models.webp | C | 第三块（转换 / 侧向错动）上的深色条带横穿断层连续不断，看不出任何错动；三块都没有运动箭头。分离边界中间是一束"火焰"状线条。 | 转换边界：同一条参照带在断层两侧明显错开，两侧块各有一个相反的水平箭头；分离：裂谷 + 上涌岩浆 + 背向箭头；俯冲：大洋板片下插 + 相向箭头。 | 代码画三块体（参照 docs/08 剖切 ochre + 45° 剖面线），箭头用 token 色。 | 2 |
| plates-and-hazards | figures/plates-and-hazards-tsunami-shoaling.webp | C | 一条长块体，水面起伏几乎一样高，海底只是略升；看不出"深水低而长、近岸变高变陡"；没有海岸、没有水深对比。 | 剖面：左侧深海（海底深），波高很小、波长长；向右海底抬升，波长变短、波高明显增大，在岸边涌起；海平面基准线。 | 代码画（正弦波振幅随深度变化，按浅水波公式定性即可）。 | 2 |
| warring-states | figures/warring-states-crossbow-trigger.webp | C | 爆炸图里左边零件是一把"梳子"（四个方齿），不是弩机任何构件；"钩心"和"望山+牙"形状含混，看不出三件如何联动；郭上的云纹装饰合理。 | 战国铜弩机：郭（匣）、望山与牙（一体，牙钩住弦）、钩心（卡住牙）、悬刀（扳机）、两枚键（销）。爆炸图要能看出：悬刀→钩心→牙 的传动。 | 代码画（按出土弩机线图或维基共享资源的结构图描几何）；AI 难画对机构。 | 2 |
| warring-states | figures/warring-states-zhou-war-chariot.webp | C | 马是现代西洋马体型，戴现代马笼头和胸带 / 挽绳式挽具；车厢是带栏杆的长方形农用车，车轮在车厢尾端；看不出单辀、衡、轭。alt 说"curved pole leading to a yoke over two horses"。 | 春秋车：单根曲辀从车厢下正中伸出，前端横衡，衡上两个轭架在马颈；车厢（舆）小而近方形、低栏；轴在舆下正中，轮大、辐条多（约 18–26 根）、毂长；马体型较矮壮。 | AI 重画，提示词写清"single central curved draught pole, crossbar yoke with two yoke-saddles on the horses' necks, NO breast collar, NO traces, NO modern bridle, axle under the middle of a small square box"，以车马坑复原图为参照；或代码画结构。 | 2 |
| warring-states | figures/warring-states-qin-measure-and-slips.webp | C | 方升外壁和竹简上都是 AI 编造的伪汉字（看得出是"字形"但没有一个可读）。器形（方斗 + 中空柄）对。 | 商鞅方升外壁有可查的铭文（秦孝公十八年…及始皇二十六年诏书）；示意图可以不刻字。竹简可留空白或写真实简文。 | 去掉所有文字后重画（"NO characters, NO inscriptions"），或用公有领域照片描摹并在 SOURCES 记来源。 | 2 |
| singapore-1819-1965 | figures/singapore-1819-1965-rubber-and-tin.webp | C | 橡胶树皮上布满一朵朵小花纹（装饰性 AI 纹理，树皮不会这样）；割胶口画成一大片羽毛 / 鱼骨状斜纹，像整块树皮被剥掉，不是一条斜向割线 + 导流槽 + 胶杯。 | 橡胶树：粗糙纵裂树皮；一条约 30° 下斜的半螺旋割线，下端金属导流嘴把胶乳引入杯中；割胶刀是带弯刃的小刀（jebong）。 | AI 重画，限制"plain vertically-furrowed bark, NO flower patterns, ONE narrow half-spiral tapping cut"。 | 2 |
| digestive-system | figures/digestive-system-swallowing.webp | C | alt / caption 说"舌把食物推向后方、会厌盖住气管、食物进入食道"——图里没有食团，会厌只是一个小凸起，看不出"盖住"；颈后轮廓上有一排刺状突起（棘突画到皮肤外）；门齿突出唇外。 | 正中矢状面吞咽瞬间：舌背上一团食物被推向咽部，软腭上抬封住鼻腔，会厌翻下盖住喉口，食团进入气管后方的食道；颈后轮廓平滑。 | 代码画简化矢状剖面（只保留口、舌、软腭、会厌、气管、食道几条结构线 + 一个食团），比 AI 更可控。 | 2 |
| monsoon-and-weather | figures/monsoon-and-weather-cloud-cutaway.webp | C | 积雨云剖面里只有一片泡沫 / 珠子纹理，看不出"上部是冰晶、下部是水滴"的分层；底部雨柱像一根毛刷。 | 剖开的积雨云：砧状顶部区域画放大的六角冰晶 / 霰，中下部画圆水滴，下方雨线；可加一条 0 °C 分界的淡线。 | 代码画或 AI 重画并强制"hexagonal ice crystals in the upper third, round droplets below"。 | 3 |
| water | figures/water-marina-barrage.webp | C | 画成一座高坝：水从高处整排泄洪孔倾泻、落差很大；alt 说"long, low concrete barrage … crest gates partly lowered"。也看不出 Marina Barrage 的任何特征（绿顶的弧形屋面、钢制翻板闸）。新加坡读者会认得真实的样子。 | Marina Barrage：低矮长坝，9 扇钢制翻板式闸门（crest gates），放下时水从闸顶浅浅溢出流向海；一端是带绿顶的管理 / 泵站建筑；背后滨海湾天际线。 | 按公开照片（如维基共享资源 Marina Barrage 照片）描摹，记来源；或 AI 重画并附参考照片描述。 | 3 |
| b200-server | figures/b200-gpu-tray.webp（未被任何章节引用） | C | GPU 托盘上只有 6 个散热器；HGX / DGX B200 的 GPU 板是 8 块 GPU。若以后被引用会传达错误数量。 | 8 个 GPU 散热器（2×4）。 | 不用就删除；要用则按 8 GPU 重画（AI 可，数量写进提示词并验收）。 | 3 |

### 2.3 B：小修

| 主题 | 文件 | 等级 | 问题（具体） | 正确应该是什么 | 重做方式建议 | 优先级 |
|---|---|---|---|---|---|---|
| muscles-legs | muscles-legs@2x.webp（封面） | B | 腿部肌肉整体可用；但足部只画骨骼、腿是完整肌肉，骨盆从前方看见骶孔，风格与其他 muscles 封面一样"模型味"。 | 足部画完整外形或至少画肌腱覆盖；骨盆淡化。 | 与另外 5 张 muscles 封面一起重新渲染时顺带处理。 | 3 |
| telling-time | telling-time@2x.webp（封面） | B | 挂钟和怀表都指 10:10，但时针正指在 10 上；10:10 时时针应走过 10 约 1/6 格。这个主题第 2 课恰好讲"时针在两个数之间"。 | 10:10：时针在 10 与 11 之间、离 10 约 5°；分针指 2。 | 代码画钟面（指针角度可算），或 AI 重画后人工校角度。 | 2 |
| steam-engine-parallel-motion | steam-engine-parallel-motion@2x.webp（封面）；figures/steam-engine-parallel-motion.webp | B | 平行四边形 + 半径杆的拓扑基本对（半径杆从下内铰点伸向外侧固定铰），但半径杆从格构连杆前面穿过，需要 caption 专门解释"交叉杆没有铰接"；420 px 下看不清哪根杆是活塞杆。 | 同一机构，但半径杆与连杆分在不同前后层（加遮挡或透视），活塞杆单独加粗，固定铰用剖面线标出。 | 代码画（按 Watt 连杆的真实尺寸比例，几何可验证直线轨迹）。 | 3 |
| light-and-shadows | light-and-shadows@2x.webp（封面）；figures/light-and-shadows-shadow-distance.webp；figures/light-and-shadows-sun-day.webp | B | paper 下正确。cinema 反相后白屏变深色、影子变成比屏更亮的灰斑，"影子"读成"光斑"。 | 两个主题里影子都比被照亮的屏暗。 | 反相例外（同 §4 规则 1），不必重画。 | 2 |
| magnets | figures/magnets-filings.webp | B | 两对磁铁都是没有标记的灰条，孩子分不清哪对是"异极相对"、哪对是"同极相对"，只能靠 caption 的"左 / 右"。铁屑图样本身正确。 | 每块磁铁一半深一半浅（与 magnets-compass 图一致），或在两端标 N / S；左对 N–S、右对 N–N。 | 代码画磁铁 + 保留铁屑纹理，或在现图上合成磁极色块。 | 2 |
| mosquito | figures/mosquito-three-life-cycles.webp | B | 三个环在 420 px 下每个小图只有约 40 px，几乎看不清；蝗虫环底部是双向箭头（若虫 ↔ 成虫），生命周期方向不应可逆。 | 三个环纵向或分两行排大；全部单向箭头：卵→若虫→成虫→卵。 | 代码排版（每个阶段小图可沿用现有素材），箭头用代码画。 | 2 |
| digestive-system | figures/digestive-system-five-systems.webp | B | 五个人像在 420 px 下各约 70 px 宽，细节不可读；第五个（消化）人像舌头伸出嘴外、食道从嘴唇直接画出体外，样子怪异。 | 消化系统人像：口闭合，食道在颈内；可只展示 3–5 个更大的半身像。 | AI 局部重画第五个人像，或减少人数放大。 | 3 |
| circuits | figures/circuits-power-chain.webp | B | 内容对（燃气电厂、输电塔、变电站、地下电缆、组屋），但画面只占 4:3 画框中间一窄条（约 35% 高度），420 px 显示时元件极小。 | 同一链条重新构图填满画框，或分两行（发电→输电 / 变电→地下→住宅）。 | AI 重画时指定"fills the 4:3 frame"，或裁成两段拼版。 | 3 |
| singapore-land-use | figures/singapore-land-use-reclamation-section.webp | B | 填土、软土、塑料排水板、抛石护岸都对；但"岩洞"画成一个小圆管，读起来是隧道 / 水管，不是裕廊岩洞那种大跨度洞室。 | 岩层中一个马蹄形大断面洞室（可加竖井连通地面示意深度）。 | 局部重画洞室部分（代码画马蹄形断面即可）。 | 3 |
| muscles-*（动作图） | exercises/barbell-bench-press.webp | B | 起始格杠铃在脸 / 头的正上方（步骤要求"arms straight above your shoulders"），结束格杠铃落在锁骨 / 颈根附近，近端杠片遮住面部；对健身初学者是错误示范。 | 起始：手臂伸直、杠在肩关节正上方；结束：杠触及胸骨下半（乳头线附近），前臂近似竖直。 | AI 重画，提示词写明杠铃位置；验收看杠与肩 / 胸的相对位置。 | 2 |
| muscles-*（动作图） | exercises/heel-walk.webp | B | 两格里前脚掌只微微翘起，看起来像普通站立和普通走路；"只用脚跟着地"这个要点几乎看不出来。 | 两格都明显前脚掌离地（脚尖朝上约 20–30°），只有脚跟着地；END 格是脚跟着地的小步。 | AI 重画，加"forefoot clearly lifted off the floor, only heels touch the ground"。 | 2 |
| muscles-*（动作图） | exercises/cable-hip-adduction.webp | B | 左格的绳索立柱放在两格之间，右格的人左侧又有一根立柱，看起来像两台机器共用一人，起止关系混乱。 | 两格各自完整：同一立柱在人的同一侧、同一相对位置，只改腿的位置。 | AI 重画，强调"identical camera and equipment position in both panels"。 | 3 |

## 3. A：已检查、保留

逐张看过，未发现事实错误或明显 AI 痕迹（少数有可接受的小瑕疵，记在括号里）。标"未引用"的 7 张目前没有任何章节使用（`b200-cpu-tray`、`b200-power`、`plant-chilli-life-cycle`、`plant-leaf-cross-section`、`plant-stoma`、`water-johor-river`，另有已列入 C 的 `b200-gpu-tray`），内容可用，但应决定是接入章节还是删掉。

- **aircon**：aircon@2x.webp (封面)
- **ancient-civilisations**：ancient-civilisations-greek-pottery.webp、ancient-civilisations-indus-bath.webp、ancient-civilisations-roman-aqueduct.webp、ancient-civilisations@2x.webp (封面)
- **area-perimeter**：area-perimeter-garden-fence.webp、area-perimeter-hdb-floor-plan.webp、area-perimeter@2x.webp (封面)
- **b200-server**：b200-cpu-tray.webp（未引用）、b200-power.webp（未引用）、b200-airflow.webp、b200-gpu-module.webp、b200-rack.webp、b200-server@2x.webp (封面)
- **bones-and-joints**：bones-and-joints-living-bone.webp、bones-and-joints-protected-organs.webp、bones-and-joints@2x.webp (封面)
- **cells**：cells-microscope.webp、cells-systems-link.webp、cells@2x.webp (封面)
- **circuits**：circuits-safety-home.webp、circuits-socket-plug.webp、circuits-tester.webp、circuits-torch.webp、circuits@2x.webp (封面)
- **container-port**：container-port-spreader-corners.webp、container-port-teu-comparison.webp、container-port@2x.webp (封面)
- **coral-reef**：coral-reef@2x.webp (封面)
- **decimals**：decimals-coin-tray.webp、decimals-four-cups.webp、decimals-ruler-lens.webp、decimals@2x.webp (封面)
- **digestive-system**：digestive-system-chicken-rice.webp、digestive-system-liver-pancreas.webp、digestive-system-stomach-wall.webp、digestive-system-tooth-section.webp、digestive-system-villus.webp、digestive-system@2x.webp (封面)
- **dinosaur-earth**：dinosaur-earth-impactor.webp、dinosaur-earth-reading-strata.webp、dinosaur-earth@2x.webp (封面)
- **energy-conversion**：energy-conversion-bounce.webp、energy-conversion-power-station.webp、energy-conversion-sun-sources.webp、energy-conversion-tengeh.webp
- **eyes-and-ears**：eyes-and-ears-lens-shapes.webp、eyes-and-ears-middle-ear-chain.webp、eyes-and-ears@2x.webp (封面)
- **flower-and-seed**：flower-and-seed-bee-pollination.webp、flower-and-seed-seed-germination.webp、flower-and-seed@2x.webp (封面)
- **forces**：forces-bicycle-brake.webp、forces-lift.webp、forces-playground-slide.webp、forces-shoe-soles.webp、forces@2x.webp (封面)
- **fossils-and-skeletons**：fossils-and-skeletons-fossilisation.webp、fossils-and-skeletons-rebuilding-a-skeleton.webp、fossils-and-skeletons@2x.webp (封面)
- **four-taps**：four-taps@2x.webp (封面)
- **frog-and-chicken**：frog-and-chicken-eggs-and-tadpole.webp、frog-and-chicken-mosquito-water-stages.webp、frog-and-chicken@2x.webp (封面)
- **grasshopper**：grasshopper@2x.webp (封面)
- **heart-and-lungs**：heart-and-lungs-airway-tree.webp、heart-and-lungs-heart-vessels.webp、heart-and-lungs@2x.webp (封面)
- **heat**：heat-expansion.webp、heat-spoons.webp、heat@2x.webp (封面)
- **how-planes-fly**：how-planes-fly-turbofan-cutaway.webp、how-planes-fly-wing-cutaway.webp、how-planes-fly@2x.webp (封面)
- **industrial-revolution**：industrial-revolution-rocket.webp、industrial-revolution-telegraph-key.webp、industrial-revolution-weaving-shuttle.webp、industrial-revolution@2x.webp (封面)
- **inside-the-earth**：inside-the-earth-magma-cutaway.webp、inside-the-earth@2x.webp (封面)
- **light-and-shadows**：light-and-shadows-opaque-translucent.webp
- **living-things**：living-things-animal-groups.webp、living-things-plant-fungus.webp、living-things@2x.webp (封面)
- **magnets**：magnets-compass.webp、magnets-door-latch.webp、magnets-electric-bell.webp、magnets-fridge-seal.webp、magnets-maglev.webp、magnets-scrap-crane.webp、magnets@2x.webp (封面)
- **mangrove-food-web**：mangrove-food-web-breathing-roots.webp、mangrove-food-web-predator-prey.webp、mangrove-food-web@2x.webp (封面)
- **materials**：materials-flexible-ruler.webp、materials-waterproof-test.webp、materials@2x.webp (封面)
- **measuring**：measuring-ball-and-stone.webp、measuring-height-board.webp、measuring-sugarcane.webp、measuring@2x.webp (封面)
- **monsoon-and-weather**：monsoon-and-weather-storm-life.webp、monsoon-and-weather@2x.webp (封面)
- **mosquito**：mosquito-empty-saucer.webp、mosquito-larva.webp、mosquito-water-stages.webp、mosquito@2x.webp (封面)
- **multiplication-division**：multiplication-division-curry-puff-boxes.webp、multiplication-division-hawker-trays.webp、multiplication-division-hdb-windows.webp、multiplication-division@2x.webp (封面)
- **nets-and-solids**：nets-and-solids-cylinder-faces.webp、nets-and-solids-open-carton.webp、nets-and-solids@2x.webp (封面)
- **plant**：plant-bee-on-flower.webp、plant-chilli-life-cycle.webp（未引用）、plant-germinating-bean.webp、plant-leaf-cross-section.webp（未引用）、plant-light-fair-test.webp、plant-seed-dispersal.webp、plant-stem-dye.webp、plant-stoma.webp（未引用）、plant@2x.webp (封面)
- **plates-and-hazards**：plates-and-hazards-fault-offset.webp、plates-and-hazards@2x.webp (封面)
- **saturn-v**：saturn-v-air-breathing-engine.webp、saturn-v-apollo-cutaway.webp、saturn-v@2x.webp (封面)
- **singapore-1819-1965**：singapore-1819-1965-ballot-box.webp、singapore-1819-1965-ocean-junk.webp、singapore-1819-1965-places-of-worship.webp、singapore-1819-1965-shophouse-cutaway.webp、singapore-1819-1965-temasek-finds.webp、singapore-1819-1965@2x.webp (封面)
- **singapore-after-1965**：singapore-after-1965-factory-work.webp、singapore-after-1965-national-service.webp、singapore-after-1965@2x.webp (封面)
- **singapore-land-use**：singapore-land-use-housing-change.webp、singapore-land-use-hydroponic-farm.webp、singapore-land-use-kampong-farm.webp、singapore-land-use@2x.webp (封面)
- **solar-system**：solar-system-comet-tails.webp、solar-system-milky-way.webp、solar-system@2x.webp (封面)
- **sound**：sound-drum-membrane.webp、sound-monochord.webp、sound@2x.webp (封面)
- **southeast-asia**：southeast-asia-mangrove-roots.webp、southeast-asia-rice-terraces.webp、southeast-asia@2x.webp (封面)
- **space-race**：space-race-apollo-cutaway.webp、space-race-lunokhod.webp、space-race@2x.webp (封面)
- **states-of-matter**：states-of-matter-air-takes-space.webp、states-of-matter-look-closer.webp、states-of-matter-sand-grains.webp、states-of-matter-sponge.webp、states-of-matter@2x.webp (封面)
- **steam-engine**：steam-engine-separate-condenser.webp、steam-engine@2x.webp (封面)
- **steam-engine-separate-condenser**：steam-engine-separate-condenser@2x.webp (封面)
- **sun-earth-moon**：sun-earth-moon@2x.webp (封面)
- **telling-time**：telling-time-bus-interchange.webp、telling-time-clock-gears.webp、telling-time-clock-tower.webp、telling-time-day-arc.webp
- **warring-states**：warring-states-dujiangyan.webp、warring-states-rammed-earth-wall.webp、warring-states-zeng-bells.webp、warring-states@2x.webp (封面)
- **water**：water-cycle.webp、water-johor-river.webp（未引用）、water-newater-membranes.webp、water-ro-membrane.webp、water-three-states.webp、water-treatment.webp、water@2x.webp (封面)
- **ww1**：ww1@2x.webp (封面)
- **ww2**：ww2@2x.webp (封面)
- **zheng-he**：zheng-he-giraffe.webp、zheng-he-trade-goods.webp、zheng-he@2x.webp (封面)
- **exercises（共享健身动作，muscles-* 主题使用）**：back-extension、band-ankle-dorsiflexion、barbell-back-squat、barbell-curl、barbell-deadlift、barbell-overhead-press、barbell-reverse-curl、barbell-romanian-deadlift、barbell-row、bird-dog、bodyweight-reverse-lunge、cable-external-rotation、cable-fly、cable-hip-abduction、cable-internal-rotation、cable-pallof-press、cable-triceps-pushdown、chest-dip、chest-supported-dumbbell-row、chin-up、close-grip-bench-press、curl-up、dead-bug、dumbbell-fly、dumbbell-goblet-squat、dumbbell-hammer-curl、dumbbell-lateral-lunge、dumbbell-lateral-raise、dumbbell-pullover、dumbbell-shrug、dumbbell-standing-calf-raise、dumbbell-suitcase-carry、dumbbell-supinating-curl、dumbbell-wrist-curl、dumbbell-wrist-extension、face-pull、forearm-plank、hanging-knee-raise、incline-dumbbell-press、inverted-row、lat-pulldown、machine-chest-press、overhead-dumbbell-triceps-extension、pike-push-up、prone-y-raise、pull-up、push-up、push-up-plus、seated-dumbbell-calf-raise、seated-leg-curl、self-resisted-pronation、side-lying-dumbbell-external-rotation、side-plank、single-arm-dumbbell-row、standing-knee-raise、straight-arm-cable-pulldown、wall-tibialis-raise
几条 A 里的小保留意见（不必进下一批）：`telling-time-clock-tower` 的时针、分针几乎重叠，4:20 读数正确但不够醒目；`mangrove-food-web-predator-prey` 的鹭还没真正叼住鱼（alt 写 "catches"）；`heart-and-lungs-airway-tree` 顶部头部剖面是一块孤立碎片；`grasshopper@2x` 触角偏长（接近螽斯），仍在蝗虫可接受范围；`zheng-he@2x` 宝船三桅只是示意（史料桅数不确定）。

## 4. 共性问题与给 Codex 的重做规则

### 4.1 共性问题

1. **"关系"类图 AI 最容易错，而且错得很自信。** 本轮 D 级里 4 张是关系错：接线（series-parallel）、明暗状态（festive-lights）、投影几何（two-shadows）、等分（fractions 封面）。外观逼真反而让错误更难被发现。凡是图的教学点是"连接、数量、角度、相等、方向"的，应改为代码画（SVG 几何 + 铅笔质感），并像 `scripts/figures/bones-protected-organs.ts`（040f192）那样写几何断言。
2. **muscles-* 六张封面都来自模型渲染再"描"成铅笔画**（f1cffce、02bdf28）。Z-Anatomy 选取的子集有缺面和不该露出的骨骼，描图把这些缺陷原样保留：漂浮肌片、露出体表的骨、被渲染成节段的白线 / 棘突。这一类应在渲染阶段先修几何（补肌群、隐藏不该见的骨、补颈部和头部轮廓），再出图，不要指望描图步骤修正。
3. **假文字。** 古物上的铭文、竹简文字（tiger-tally、qin-measure）全是 AI 伪字。STYLE_BRIEF 里虽写了 NO text，但对"带铭文的文物"AI 会默认加字。中文读者对假汉字特别敏感。
4. **cinema 反相规则不适合所有图。** `.atlas-drawing` 在 dark plate 一律 `invert(1)`。对线描很好（铅笔变粉笔），但对用明暗表达物理含义的图会颠倒意思：月相、地球昼夜半球、太阳、影子与屏。受影响（已确认）：`sun-earth-moon-four-phases`、`sun-earth-moon-parallel-axes`、`light-and-shadows-shadow-distance`、`light-and-shadows-same-object-two-shadows`（本身已是 D）、`light-and-shadows-sun-day`、`light-and-shadows@2x`；同类风险还有 `solar-system@2x`、`sun-earth-moon@2x`（灯泡太阳变暗）、`plant-light-fair-test`（暗箱变亮）。
5. **alt / caption 与图不符时，caption 在替图打补丁。** 例如 festive-lights（"画的是坏之前"）、parallel-motion（"交叉杆不相连"）、coral-polyp（alt 写剖面，图不是剖面）、marina-barrage（alt 写低坝，图是高坝）。caption 需要解释图为什么"看起来不对"时，就该重画。
6. **示意尺寸。** 章节图显示约 420 px 宽。生命周期环、五系统人像、电力链条这类"一张图放很多小东西"的构图在这个尺寸下不可读。
7. **AI 写实图在"真实可辨认的新加坡地标"上不可靠**（Marina Barrage）。地标、地图、文物应从公开照片 / 地图描摹并在 SOURCES 记来源，这与 CLAUDE.md 对地图用真实数据的要求一致。

### 4.2 给 Codex 重做 brief 的规则

1. **先选方法再动手：** 教学点是几何 / 连接 / 数量 / 角度 / 剖面分层 → 代码画（SVG 几何，铅笔质感用 hatch pattern + 轻微抖动线，输出 1200×900 透明 webp），并在 `scripts/figures/<id>.ts` 写断言（例：每只并联灯两端连到不同极；8 个扇形各 45°；时针角度 = 30°×h + 0.5°×m；影子轮廓由投影计算）。外观 / 质感 / 场景 → 可以 AI 画。真实地标、文物、地图 → 公有领域照片或地图描摹 + `data/SOURCES.md` 记录。
2. **AI 提示词必须写出"可数的事实"和"禁止项"：** 数量（灯 10 只、GPU 8 块、触手 12 根、扇形 8 等分）、朝向（罐轴垂直于光线）、状态（NONE glowing）、位置（杠铃在肩关节正上方）；禁止项一律写全：`NO text, NO characters, NO inscriptions, NO zigzag break lines, NO floating parts, NO exposed bones outside muscles, NO eye-like shapes`。
3. **逐项验收清单随图交付：** 每张图附一份 3–6 条的 checks（照 `fossils-and-skeletons/illustration-manifest.jsonl` 的格式），Claude 验收时逐条放大核对，不合格不入库。
4. **两个主题都要看：** 交付时同时给 paper 合成图和 cinema 反相模拟图。明暗有物理含义的图，在 Figure / Drawing 上声明不反相（建议加 `tone="photo"` 或 `invert={false}`，cinema 下改为 `filter: brightness(.85) contrast(.95)`），这一条由 Claude 在组件里加，Codex 只在交付清单里标出需要例外的图。
5. **在 420 px 下检查可读性：** 交付时附一张缩到 420 px 宽的预览；主体至少占画框 60%，单个关键部件不小于 40 px。
6. **alt / caption 与图一致：** 重画后同步更新 alt 和 caption，删掉替图辩解的句子（"画的是坏之前"、"交叉杆不相连"）。
7. **muscles 封面：** 先修渲染几何（补齐浅层肌、隐藏内层骨、补头颈轮廓、白线不分节），再走 illustrate.ts 描图；六张一起做，保证同一套姿势、比例与线重。
8. **风格不变：** 继续用 STYLE_BRIEF 的 graphite 技术图版（细交叉排线、中灰到深灰、透明底、无边框），代码画的图也要用同一线重和灰阶，与现有 A 图放在一起不突兀。
9. **未引用的 7 张图：** 下一批决定接入或删除；不要留在 public 里占包体。
