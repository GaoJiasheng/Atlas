# 骨骼与关节 · 内容与事实审计

日期：2026-10-27。范围：8章双语正文、40拍、20术语、34来源；几何/源节点/rig审计另见anatomy packet，插图另见FIGURES.md。状态published由用户明确指定。本文区分源事实核对、代码数据检查、浏览器验收与具名人审，不互相替代。

## 来源映射与复核

准备档S01→运行时S1，依此至S09→S9；S10–S33原号保持。S34是原创设计研究，不能当作人体测量。共享来源schema不接受前导零，因此只改变id拼写，不改变源的编号意义、次序或事实归属。

施工时独立读取原始页面：OpenStax7.1、6.2–6.5、8.2、9.1、9.4、9.6、11.1；NIAMS骨骼教育与生长板损伤；HealthHub儿童活动及钙；AAOS二头/三头肌肘部解剖；MSD简体中文关节页。只改写事实，不复制原文段落或图片。S1官方本地PDF在准备阶段核过印刷53页/PDF54页，在线验证未绕过；S23/S24沿用访问限制，不用于本地发生率判断。

| 章 / 拍 | parent事实id | 主要来源与核查 |
|---|---|---|
| 00 / 4 | R01–R03,F02,M02,D02,C01 | S1,S2,S25,S26,S30,S34；成人源体与自身左右，源不等于儿童预测。 |
| 01 / 6 | F01,F02,F09,F10,F18,F23,F38,X01,R02 | S2,S3,S8,S12,S14,S30；成人常规206、12对肋、骨形状、肩带骨盆；模型区域合并不等于人体骨数。 |
| 02 / 5 | F02–F08,F10 | S4,S8,S18；骨密质、硬骨小梁、髓与血供。红/黄髓年龄分布不写统一位置。 |
| 03 / 5 | F12–F14,F24 | S10,S11,S13；结构分类与活动分类不同，软骨/囊/液、韧带/肌腱不同。 |
| 04 / 6 | F11,F15–F23 | S9,S11,S12；六型只限滑膜关节，前臂桡骨相对尺骨转；膝屈曲时可旋转。 |
| 05 / 6 | F24–F28,D01,M03 | S13,S16,S17,S32,S33,S34；跨关节张力、相反动作、精确肌腱止点、理想静力矩平衡。 |
| 06 / 4 | F29–F32,F37,D02 | S5,S6,S19,S34；生长板、闭合、持续重塑、修复阶段；无统一年龄或愈合日。 |
| 07 / 4 | F02,F14,F24,F25,F33–F37 | S18–S21；饮食多样、维生素D促进吸收、>6岁至少3次/周，损伤求助。 |

## 数量核对

- 章拍数为4+6+5+5+6+6+4+4=40；无评分quiz。每章2–3块More，每种语言各20个Term首现标记。章00为background。
- 英文正文223–252词，中文350–383汉字，按去标签且不含More/图注计。所有正文数量用Num，字幕按定稿纯文本保留，部件详情来源由anatomy作者核对。
- 常规成人206引用S2，12对肋引用S8，6种滑膜型引用S11；成人骨架34语义部件/总61可选语义部件及context由geometry单测核对，不当作人体骨数。
- 理想杠杆S34：d=Lsinθ，τ=Wd，Fm=τ/0.04；20N、0.30m、90°→0.30m、6N·m、150N；0.15m或10N或θ30°时75N；60°与120°对称。读数不是人的肌力。24组合与舍入由主题单测独立计算。
- Try it保留一次距离预测：L0.15→0.30，观察muscle-force，expected more；角度90→30的第二个预测保留在第05章第6拍及细看，比较结果less。单卡schema只容一个predict对象，不伪造第二个卡。

## 内容更正与限制

- 所有真实解剖保持正确附着；“两点若同骨”的预测仅为文字，不在源模型上演示错误附着。S14不再承担二头/三头肌精确止点，分别改用AAOS S32/S33。
- 六型使用静态命名终点姿态，run:false；当前chapter/beat API不能在共享肘rig的多个序列循环中选择单个片段，因此未混播。比较节拍即可观察方向。没有把静态展示称为独立循环动画。
- 成人人体、手细部标本、骨截面/修复、理想梁按工位分开。软骨、囊透明度、间距、内部网架与血管为教学示意；不代表扫描内部或组织尺寸。
- 来源中文词语不等于新加坡官方核定。车轴/球窝/椭圆/平面及杠杆/力臂的编辑待核说明只留在REVIEW/AUDIT，不放进产品标签或定义；没有sg_attested:true伪造字段。
- HPB钙页面只用食物多样性、钙盐豆腐及维生素D吸收；不采用成人钙剂量、日晒时长或补充剂处方。AAOS临床页面只取解剖止点，不复用伤情图片或治疗。
- 骨折阶段没有等时、固定天数或身高/骨龄/密度预测。本文不教自行复位。受伤求助来自NIAMS，模型不能诊断。
- 源几何包采用CC BY-SA4.0；OpenStax衍生文字/教学图另为CC BY-NC-SA4.0。原创几何常数/胶水明确以BY-SA提供，不把NC衍生图描入geometry packet。

## 门槛记录

内容子任务不运行浏览器、不控制桌面，不执行git写入。最终pnpm check/validate/test/build结果由主会话在全部文件齐备后统一记录。shoot（逐拍/keys/tasks/layout，en/zh×paper/cinema及390×844）与e2e（端口5445）不在本受限子任务中运行，不能标为通过。原生Blender启动139为独立未完成项；具名关节轴/附着人审仍待完成。

## 最终执行结果 / Final executed gates

- `pnpm check`：通过，773文件，0错误、0警告、3个既有unused提示。修正新几何测试的非空类型后重新执行成功。
- `pnpm validate`：59主题，0错误、0警告。图像检查记录迁至主题根`FIGURES.md`；最终build再次完成相同校验。
- 全量单测：`pnpm test -- --maxWorkers=2 --testTimeout=30000`，163文件、4,306测试通过。默认5秒下既有energy全组合枚举超时，单独运行同样超时；保持原测试/断言，降低并发并给30秒，该项约7.37秒完成，整套通过。不是修掉断言或跳过测试。
- 最后集成发现PLATE缺telemetry；补齐四行及本章观察量，并同步离线生成器。新增连线断言后，最终内容单测7/7通过；新测试总数为18引擎+5几何+7内容=30。全套记录加上最后新增用例，共4,307个不同用例具有通过记录。
- 最终`pnpm build`通过，121静态页面。直接读取构建HTML/JSON：EN/ZH目录各35卡，均有本主题链接；数据包含62件（61可选）、4条PLATE读数、24静力行、34来源、20术语；两语言props均包含四个观察量。`git diff --check`通过。
- GLB为3,024,092bytes、313,580triangles、44mesh nodes/19joints；236源结构采样误差最大0.945331684mm，压缩bbox最大0.002653061mm。源清单每侧12肋、10肋软骨，胸骨3实际结构。详见`scripts/anatomy/bones-joints/report.md`和独立audit输出。
- 已目检原图/处理图与正、背、左、肘姿态CPU源比较。CPU诊断归档在`scripts/anatomy/cache/bones-joints/previews/`（本地，不进git）；不声称查看过浏览器截图。

Browser gates were deliberately not executed, as the build brief forbids them in this sandbox. Main-session handoff uses `ATLAS_E2E_PORT=5445`, with per-beat/keys/tasks/layout screenshots in EN/ZH and paper/cinema, including390×844. Native Blender startup exited139; named anatomy approval, actual muscle deformation, labels and runtime performance remain pending. No git writes, package or lockfile changes were made.

## Acceptance rework F1–F5 — 2026-10-27

All 61 selectable detail cards (EN/ZH) now explain anatomy in 2–4 student-facing sentences. The independent card source is `scripts/geo/bones-and-joints/details.mjs`; the existing content builder regenerates parts.json from it. S30 source geometry and S34 model references are retained; S32/S33 accompany the named muscle/tendon attachments. No OpenStax wording was copied into the BY-SA packet. The 34-source registry is unchanged.

The following reviewer information was moved out of reader cards and remains applicable:

- Skeleton selections contain one or several named source structures at adult reference scale; selection counts are not individual bone counts. The seven left-hand close-ups are translated, with source scale and relative positions retained.
- The left biceps/triceps heads are grouped; original source rig, weights and fibre fields remain. Motion and tension are qualitative. Named attachment-face medical review and local joint-axis review remain pending.
- Tendon segments are enlarged original teaching geometry guided by inherited candidate sites, not isolated scanned tendons. No surface-accuracy or medical approval is claimed.
- Internal bone lattice, tissue dimensions, capsule window, joint space and repair specimens are qualitative teaching reconstructions. Red/yellow marrow distribution is illustrative and varies by age and bone. The repaired outline is not a prediction of a particular fracture or a healing deadline.
- F1 withdraws the old false figure count: the former 118,178 B WebP had 14 ribs per side according to browser review. Its replacement was independently traced to 12 per side after generation and processing; FIGURES.md and the final-image count overlay record the evidence. Source GLB rib counts remain separate evidence.
- The fixed lever hinge is a new unselectable context part; there remain 61 selectable parts, now with two context parts (skin and pivot). The source GLB, rig and 24 numerical lever rows are unchanged.

Offline previews use the runtime geometry builder and the authored cameras, then a CPU triangle painter. They caught and corrected a reversed lower-joint profile; final bone/joint/repair previews were visually inspected. They do not establish WebGL materials, transparency, label layout, browser performance, mobile acceptance or medical accuracy. Browser/desktop use and browser gates were expressly prohibited for this rework session.

The engine repair is limited to scheduling a follow-up demand frame after sampled skin-anchor measurement. The unit test uses the existing muscles-arms ulna mesh and an elbow-only pose; it verifies that the next label probe sees posed bounds without changing joint rotation. Existing six-frame sampling and anchor maths are retained.

Rework final gates: `pnpm check` exit 0 (801 files, 0 errors/warnings, four pre-existing hints); `pnpm validate` exit 0 (61 topics, no errors/warnings); `pnpm test -- --maxWorkers=2 --testTimeout=30000` exit 0 (172 files, 4,382 tests); `pnpm build` exit 0 (125 static pages). Final static audit confirms all original detail source ids are retained, every selectable card has 2–4 sentences in each language, original rig/poses/numerical simulation data are unchanged, and `git diff --check` passes. Browser gates were skipped as requested; no browser/desktop or git writes occurred.
