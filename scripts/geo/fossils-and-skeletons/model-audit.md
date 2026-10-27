# 化石研究几何核验 / Fossil geometry audit

本模型为原创程序化教学示意，不是标本扫描或测量复原。六套原始坐标分别只做一次正比例仿射变换，采用现行引擎 `partBounds` 求 AABB，统一中心 `[0,2,0]` 与半包络 `[4,2,1.4]`。生成器同时变换局部路径、形状、孔洞、尺寸、厚度、半径、环节间隔、爆炸距离和镜头；方位与 FOV 保持不变。具体原始包络、中心、比例与最终镜头见 `model-layout.json`。每次从原始作者几何重建，保留既有配置并读取 `sim.json`，不会反复归一化成品。

Original procedural teaching studies, without scanned or measured specimen geometry. Six original studies receive one uniform positive affine transform, using the existing engine's actual AABB implementation. Geometry and camera transformations are recorded in `model-layout.json`. Every rebuild starts from author coordinates and retains the native simulation configuration.

静态手机取景复核发现骨架尾端标签在 390×844 的 NDC x=1.0063，略超画面。`skeleton-side` 取景距离沿原方位增加 8%，原作者坐标相机由 `[1,3,13]` 改为 `[1.08,3.128,14.04]`，目标、FOV 与几何不变；同步更新 05 章基线及三个内联同镜头对象。此为必要取景偏差，不宣称通过真实浏览器的 HUD 避让检查。

Static phone projection found the tail-tip anchor slightly outside the viewport. The skeleton camera distance is increased by 8% along its existing direction, keeping target and FOV fixed. Chapter 05's matching inline cameras are updated. This validates anchor projection, without establishing browser HUD clearance.

## 事实参考与原创范围 / Reference scope

2026-10-27 阅读父 dossier 的研究说明和以下机构原文。只核对事实、拓扑及教学边界；未下载、复制、描摹或发布任何网页照片、插画、扫描或网格。没有把本项目生成插图用作测量依据。

- [AMNH · Ask a Scientist About T. rex](https://www.amnh.org/explore/ology/paleontology/ask-a-scientist-about-t-rex)：S9 的两功能指约束。左右手分别有明确的双指 sweep，未使用自动增加编号的 bilateral。
- [AMNH · Beyond T. rex](https://www.amnh.org/explore/ology/paleontology/beyond-t-rex)：S48 的三个主要承重趾。左右后肢分别有三个前伸承重趾及较短、抬起的后向小趾。
- [NPS · Permineralization and Replacement](https://www.nps.gov/articles/000/permineralization-and-replacement.htm)：S4 区分原有孔隙内充填与置换。放大件的六个不等孔洞保留骨壁，四处矿物小块置于孔内；孔的数量为设计，不是骨组织计数。
- [NPS · Impressions and Compressions](https://www.nps.gov/articles/000/impressions-and-compressions.htm)：S54 的浅印痕不保留有机物。足迹与叶片是上层 extrude 孔洞和下方停止面，未放置实体脚或碳膜。
- [Field Museum · Which Dinosaur Bones Are “Real”?](https://www.fieldmuseum.org/blog/which-dinosaur-bones-are-real) 与 [Smithsonian · FossiLab](https://naturalhistory.si.edu/exhibits/david-h-koch-hall-fossils-deep-time/fossilab)：S55–S56 的原件、翻模与补塑边界。颜色表示形状依据；直接依据的头骨虽然代表复制材料，仍保持 direct。
- [LKCNHM · Biodiversity Gallery](https://lkcnhm.nus.edu.sg/exhibition/biodiversity-gallery/)：S17 的梁龙科蜥脚类范围。三件示意均是小头、长颈、四足、长尾的独立通用模型；不赋予个体大小、种名、性别、姿态或逐骨真实性。
- [NParks AVS · Javan Mynas in Singapore](https://avs.nparks.gov.sg/wildlife/encountering-wildlife/house-crows-pigeons-javan-mynas/javan-mynas/)：S23 的本地出现。鸟为原创大部位示意，羽毛另作放大比较件，未宣称精细八哥骨学或统一比例。

Institutional text was consulted for the listed constraints. All shapes are original schematic constructions; the reference pages' media are neither redistributed nor used as mesh input. Ribs, vertebral grooves, teeth and pore counts are deliberately unlabelled design repetition, without exact anatomical count claims.

## 两轮结构检查 / Two offline structural rounds

浏览器视觉门槛受环境阻塞：Playwright 的 Chromium 在创建页前因 macOS `MachPortRendezvousServer` / `bootstrap_check_in` 权限错误退出；CUA 无已连接浏览器，读取 Chrome 也返回未获准。没有绕过权限或修改引擎。下述检查是实际引擎 `partPieces` 网格的离线 CPU 投影，**不是浏览器截图，也不是 GPU 材质、HUD 或运行时性能验收**。

Browser launch is blocked by macOS sandbox permissions before a page can be created. The fallback projects the actual engine-tessellated geometry on the CPU. It is clearly labelled offline, and cannot verify browser layout, GPU shading, shadows, runtime clipping, clicking or draw calls.

| 轮次 / round | 观察与修正 / observation and correction | 留存 / evidence |
|---|---|---|
| R2.1 | 核对中空头骨、下颌、连续颈躯轴、骨盆、双短前肢、后肢与抬尾；对机构事实清单核对手趾计数。足迹右趾的局部孔边接近板外缘，扩大板宽使孔洞完全包在板内。发现右后肢的小深度位移与左侧同号，改成显式镜像；由此骨架原始 AABB 的 z 中心变为零，并同步通知章节镜头作者。 / Checked the open skull, axial connections and limb counts; widened the footprint slab to contain its hole, and corrected signed depth offsets on the right hindlimb. | `/private/tmp/fossils-model-qa/r2-1-{skeleton,specimens,pores,museum,bird}-{side,oblique}.png` |
| R2.2 | 复查左右脚、孔隙、负形板、三具长颈四足与羽毛。收拢上部羽枝，使其端点留在羽片轮廓内；保留羽轴下端。投影器加入背面剔除以减少离线遮挡伪影，此项不是引擎修改。剖切面按最终场景的孔隙中面附近 z=1.07 设置，保留后半及骨壁、矿物标签锚点。所有轮廓仍为教学示意，未据此声称精确骨学比例。 / Rechecked both limbs, negative relief and generic sauropods; shortened feather barbs to the vane envelope. Back-face culling improves the offline preview only. | `/private/tmp/fossils-model-qa/r2-2-{skeleton,specimens,pores,museum,bird}-{side,oblique}.png` |

静止及最大爆炸位移均执行两两 AABB 粗筛，原始报告为每轮 `*-metrics.json`。主要交集是头骨与下颌、颈与轴的邻接、肋部包围的空腔与肢体、骨盆与后肢、尾基与尾端、矿物与孔隙外包络、鸟身与翼腿。AABB 不理解孔洞与弧形，不把这些交集伪称为穿模，也不把粗筛当三角形级无干涉证明。骨架与其他工位交叠是共用展示体积的设计，只有对应章节图层才具有解释意义。

Assembled and fully exploded AABB pair checks record expected joint contacts and broad boxes containing open cavities. These are coarse structural checks, not triangle-intersection certification. Cross-station overlap is the intentional shared-volume layout.

## 静态网格预算 / Static tessellation budget

以下数值直接来自当前引擎 `partPieces` 的完整网格，包含背面；不是 CPU 投影中剔除后的三角形数，也不是浏览器 `renderer.info`。同材质 extra 被原生合并。context 单列。没有逐骨独立绘制、GLB、新依赖、动画、流或运行时求解器。

| 工位 / study | 网格 pieces | 三角形 / triangles |
|---|---:|---:|
| 标本 / specimens | 5 | 3,268 |
| 埋藏 / burial | 6 | 8,274 |
| 年龄剖面 / age section | 5 | 5,136 |
| 骨架 / skeleton | 12 | 90,768 |
| 鸟 / bird | 9 | 89,624 |
| 馆藏示意 / museum | 3 | 103,920 |
| context 底台 | 1 | 588 |

单工位最高完整网格低于 0.3M 目标。实际 draw calls、R3 两主题材质灯光、所有浏览器模式及手机布局仍须在可启动浏览器的环境复核，不以静态 pieces 数替代。

The largest individual study is below the 0.3M triangle target. Actual draw calls, paper/cinema materials, shadow quality and responsive UI remain unverified until browser testing is available.

47 项主题单元测试已通过，包含手指、承重趾、33 可选件、真实负形孔洞、模块分类与原生 SIM 配置。无 git 写操作、外部网格或图片下载。

The 47 topic unit tests pass, including explicit digit geometry, negative openings, part inventory, evidence classes and native simulation data. No git write, external mesh or image download was performed.
