# 04 · 内容路线图（粗排）

按女儿年级推进：2026 P2 → 2027 P3 → 2028 P4 → 2029 P5 → 2030 P6/PSLE。先做框架和二战，其它主题随年级补。

## 主题池（按六类：science / math / history / geography / biology / computer）

| 主题 | 分类 | 形态 | 引擎/舞台 | 对齐 | 建议年份 | 状态 |
|---|---|---|---|---|---|---|
| 第二次世界大战 | history | time | TimeScene/Geo | SS P4 新加坡沦陷、日据、日据结束（2023 版课纲，docs/17 §1） | **2026 首发** | 已完成 11 章（待审） |
| 第一次世界大战 | history | time | TimeScene/Geo | 课外（未找到对应 MOE 条目）；见 docs/11 | 2026 第二个历史主题 | 已完成 10 章（待审） |
| 空调是怎么把房间变冷的 | science | space | SpaceScene/Model3D | Sci P4 热；课外 | 2026 第二个（验证 SpaceScene） | 已完成 5 章（待审） |
| 一只蝗虫的身体（黑角瓦兰蝗解剖） | biology | space | SpaceScene/Model3D | Sci P3 Diversity、Cycles；与人体系统对照；详见 docs/14 | 2026 第三个（验证生物解剖模板） | 已完成 6 章（待审） |
| 人体肌肉系列（胸 / 背 / 肩 / 臂 / 腿 / 腰腹） | biology | space | SpaceScene/Model3D | 人体系统与课外健身知识；详见 docs/16 §16 | 2026 | published ×6（2026-10-12） |
| 骨骼与关节（连接骨架、活骨、六种滑膜关节、跨关节拉力、理想杠杆、生长与修复） | biology | space + sim | SpaceScene/Model3D + 既有table及数字关节绑定 | 人体系统深化，非骨名考试；详见 docs/57 | 2026 | published（2026-10-27）：背景 + 7章、40拍；浏览器与具名解剖审查见REVIEW |
| 红树林食物网（生境剖面、适应与条件性取食关系） | science | space + sim | SpaceScene/Model3D + table + directed foodWeb card | Sci P6 环境中的相互作用；详见 docs/53 | 2026 提前 | published（2026-10-27）：背景 + 7 章、36 拍；浏览器验收待主 session |
| 新加坡 1819–1965 | history | time | TimeScene/Geo | SS P4 新加坡故事 | 2027 |
| 一株植物（盆栽辣椒：根茎叶花果种子，P3–P6 五个课题） | biology | space | SpaceScene/Model3D | Sci P3 生命周期；P4 植物部位与功能；P5 运输系统与繁殖；P6 光合作用与传播；详见 docs/26 | 2026 提前 | published（2026-10-14）：7 章 37 拍 |
| 青蛙与鸡的生活史（卵、幼体、成体与下一代） | biology | space + sim | SpaceScene/Model3D + 既有 `table`、pose、visible | Sci P3 Cycles in Plants and Animals (Life Cycles)；详见 docs/56 | 2026（提前） | published（2026-10-27）：背景 + 5 章、30 拍；浏览器验收交主会话 |
| 生物的分类（标本台：生物与非生物、四大类、开花与不开花植物、动物六类、分错了的动物、自己做流程图） | science | space + sim | SpaceScene/Model3D + 试一试（`sim`，kind sort） | Sci P3 Diversity of Living and Non-Living Things；详见 docs/38 | 2026（提前） | published（2026-10-22）：背景 + 6 章 39 拍 |
| 磁铁 | science | space + sim | SpaceScene/Model3D + 试一试（`sim`，kind magnet） | Sci P3 磁；详见 docs/22 | 2028 | spec 草案 |
| 消化系统 | biology | space | Layer2D | Sci P4 人体系统 | 2028 |
| 新加坡的水（水循环 + 四大水喉的处理链；一块示意的新加坡切片） | science | space | SpaceScene/Model3D | Sci P5 Cycles in Matter and Water（Water）；SS P3 资源；详见 docs/24 | 2026（提前） | published（2026-10-14），7 章 33 拍 |
| 新加坡的四大水喉（1867 年至今，蓄水池、厂址、柔佛河输水管） | geography | time | TimeScene/Geo（岛尺度底图，docs/17 C1） | SS P3 资源；详见 docs/24 §15 | 2026（提前） | published（2026-10-14），背景 + 5 章 23 拍 |
| 光与影（光学实验台 + 暗箱 + 户外杆影；看见、直线传播、影子的形状与大小、太阳下的影子） | science | space + sim | SpaceScene/Model3D + 试一试（`sim`，kind light） | Sci P4 Energy Forms and Uses（Light）；详见 docs/35 | 2026（提前） | published（2026-10-20）：背景 + 7 章 41 拍 |
| 眼睛与耳朵（分设解剖工位：光、成像、调焦、听骨、耳蜗与保护） | biology | space + sim | SpaceScene/Model3D + senses 试一试 | P4 Light 与感官观察接口；解剖机制为课外拓展，详见 docs/58 | 2026（提前） | published（2026-10-27）：8 章 40 拍、3 张试一试；浏览器门槛留主会话 |
| 热与温度（测温、勺柄传热、隔热、加热/冷却曲线、热胀冷缩） | science | space + sim | SpaceScene/Model3D + 试一试（`sim`，kind heat） | Sci P4 Energy Forms and Uses（Heat）；详见 docs/55 | 2026（提前） | published（2026-10-27）：背景 + 7章、37拍、34件；浏览器验收由主会话补跑 |
| 大陆漂移与板块 | geography | time | TimeScene/Geo+morph | 课外拓展（地理） | 2028–2029 |
| 地球内部与火山剖面 | geography | space + sim | SpaceScene/Model3D + 既有table试一试 | 地理拓展（非新增PSLE必考单元）；详见 docs/48 | 2026（提前） | published（2026-10-27）：背景 + 7章、36拍、91件 |
| 电路是怎么工作的（手电筒 + 电路板） | science | space + sim | SpaceScene/Model3D + 试一试（`sim`，kind circuit） | Sci P5 Electrical System；详见 docs/23 | 2026 提前（与植物并行） | published（2026-10-14）：6 章 31 拍，「试一试」扩展（`sim`）随本主题上线 |
| 呼吸与循环系统 | biology | space | Layer2D/Model3D | Sci P5 呼吸与循环（人体与植物） | 2030 |
| 力（摩擦、重力、弹力） | science | sim | Simulation | Sci P6 | 2030 |
| 气候带与季风 | geography | time | TimeScene/Geo | 课外拓展 | 随时 |
| 丝绸之路 / 郑和下西洋 | history | time | TimeScene/Geo | 课外拓展（历史） | 随时 |
| 分数（P2–P4：平均分、等值分数、同分母与相关分母加减、带分数；比例留待后续） | math | lesson | MathScene/SVG | MOE 2021 数学课纲 Fractions（P2、P3，P4 桥）；详见 docs/15 | 2026 P2 起用，P3 接着做 | 已完成 12 步 + 练习（待审） |
| 拆开一台 AI 服务器（NVIDIA DGX B200） | computer | space | SpaceScene/Model3D | 课外（MOE 小学无计算机课纲）；能量转换与热的传递接 Sci P4 热；详见 docs/18 | 2026（computer 类第一个） | published（2026-10-13） |
| 土星五号与阿波罗飞船 | science | space + sim | SpaceScene/Model3D + 既有 table 试一试 | 课外拓展（非新增 PSLE 必考单元）；详见 docs/61 | 2026（提前） | published（2026-10-27）：背景 + 6 章、35 拍、33 个零件定义；浏览器验收交主 session |
| 二进制与像素 | computer | 待定 | 待定 | 待定 | 待定 |

数学类走 MathScene（分步课 + 练习，第三个引擎，分数已做，docs/15），比例、面积、速度随年级补；科学类的参数模拟不再单开 Simulation 引擎，走 SpaceScene 的「试一试」扩展（`sim`，docs/03 §C、docs/06）：电路已做、磁铁复用；computer 类的第一个主题是 AI 服务器（`b200-server`，SpaceScene，docs/18），之后的计算机主题按同一拆解模板做。

肌肉系列若增第七个主题：先定范围与事实 spec，补该区 manifest / glb / rig、共享肌肉与动作卡及六章节拍，再过许可、附着点人审、网格 audits、previews 与 shoot；流程见 `atlas-space-topic/references/anatomy-mesh-runbook.md`。

## 二战主题大纲（一期 10 章）

章节节点设计原则：每章回答一个孩子会问的问题；镜头从世界到局部再回世界；新加坡章是主打。

| # | 章节 | 时间 | 镜头 | 图层/动作 | 孩子的问题 |
|---|---|---|---|---|---|
| 1 | 世界在 1939 | 1939-08 | 世界 | 阵营底色、各国标签 | 谁跟谁是一伙的？ |
| 2 | 战争开始：波兰 | 1939-09-01 | 欧洲 | 德国箭头入波兰，英法点亮 | 为什么一个国家打另一个，大家都要打？ |
| 3 | 闪电战：法国沦陷 | 1940-05 → 06 | 西欧 | 控制区关键帧切换，敦刻尔克撤退箭头 | 为什么这么快？ |
| 4 | 转向东方：巴巴罗萨 | 1941-06-22 | 东欧 | 三路大箭头，兵力计数器 | 这是多少人？ |
| 5 | 太平洋：珍珠港 | 1941-12-07 | 太平洋 | 航母航线、美国点亮 | 日本为什么打美国？ |
| 6 | **新加坡沦陷** | 1941-12-08 → 1942-02-15 | 马来半岛 → 新加坡岛 | 哥打巴鲁登陆、南下路线、柔佛海峡、武吉知马、投降 | 英国的大炮为什么没用？ |
| 7 | 日据下的新加坡 | 1942–1945 | 新加坡岛 | 静态图层：昭南、香蕉钱、配给 | 那时候的小孩怎么生活？ |
| 8 | 转折：斯大林格勒与中途岛 | 1942-06 / 1943-02 | 世界双视角 | 轴心国版图顶峰 → 开始收缩 | 什么时候开始输的？ |
| 9 | 反攻：诺曼底到柏林 | 1944-06 → 1945-05 | 欧洲 | 东西两面箭头合拢 | 为什么两边一起打？ |
| 10 | 结束与回家 | 1945-08 → 09 | 太平洋 → 新加坡 | 日本投降、新加坡受降仪式（9-12），版图恢复 | 后来呢？ |

一期数据量：控制区关键帧 12 个，战役/事件 30 个，行军箭头 20 条，参与者 25 个。

沉重章（第 7 章肃清大屠杀、第 4 章和第 8 章伤亡数字）照实呈现，不做柔化。

### 二战数据来源

- 国界：UMN Historical National Boundaries 1939/1945
- 控制区关键帧：参照 Wikipedia 各年份版图图、OmniAtlas 时间线，手工描
- 事件与兵力：Wikipedia 各战役条目，取整
- 新加坡章：National Archives of Singapore、NLB Infopedia、MOE 社会课教材配套

## 空调主题大纲（已完成，5 章；详见 docs/12）

1. 整机（whole-machine）：室内机 + 室外机 + 连接管，示意布局
2. 拆开看：四大件（open-it-up）：压缩机、冷凝器、膨胀阀、蒸发器，拆开外壳、爆炸图
3. 通电：冷媒循环（switch-on）：X 光 + 冷媒流，压缩、冷凝、节流、蒸发，带模拟读数
4. 空气去哪了（where-the-air-goes）：室内冷风、室外热风、凝结水，热被"搬"到室外（对齐 Sci P5 热的传递）
5. 用得好、用得省（efficiency-and-use）：变频、滤网、设定 25 °C、能效标签、冷媒回收
