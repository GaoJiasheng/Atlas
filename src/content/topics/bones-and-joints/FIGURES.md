# 插图检查 / Figure record — 2026-10-27

三张独立石墨插画采用 CC BY-NC-SA 4.0；没有将 Z-Anatomy 渲染图作为参考输入，没有嵌入 BY-SA GLB。main checkout 的准备目录保持只读。封面与长骨图逐张目检后沿用，保护图按用户纠错重绘。

| 用途 | 源 / SHA-256 | 发布文件 / 字节 |
|---|---|---|
| 髋关节封面 | main `art/planned/bones-and-joints/bones-and-joints.png`; `15a2659aea97bdc52910a3a74ee9feb1e23f3b10a2f76b9bc6b6a68547494661` | `public/illustrations/bones-and-joints.webp` 80,164；`bones-and-joints@2x.webp` 240,250 |
| 活骨截面 | main `art/planned/bones-and-joints/bones-and-joints-living-bone.png`; `31c7a066492ba43426b98067e88589dde4557381f3ee162e23f1ee040a9906de` | `public/illustrations/figures/bones-and-joints-living-bone.webp` 98,398 |
| 胸廓保护心肺 | 本worktree `art/planned/bones-and-joints/bones-and-joints-protected-organs.png`; `a7ab7c9e522426f10215f1fee96897ababaaf225671a48838cf2e3857e26a165` | `public/illustrations/figures/bones-and-joints-protected-organs.webp` 118,178 |

封面：一块髋骨、髋臼和闭孔；一根股骨近端的圆头、骨颈与大转子。教学性分离，不据此讲临床侧别。长骨：一根通用长骨开窗，致密壁、硬骨小梁网架、髓腔内容及一条进入的血管。非特定股骨，不用该图标识骨膜瓣或开放生长板。

## 重绘记录 / Redraw

Built-in `image_gen` tool，3次编辑，每次 `transparent_background: true`。初始输入只为独立心肺石墨图。第1次加入完整胸廓；第2次缩短胸骨、打开肋弓并修正浮肋；第3次移去两片无附着的残留骨片。没有用脚本改变解剖。生成工具的原图副本保存在上述worktree路径；最终发布版经 `scripts/illustrate.ts figure` 中性灰、等比例trim/pad及WebP压缩（1200×900，q82）。封面由 `process` 输出800/1600正方形，长骨由 `figure` 输出1200×900。

Initial prompt: redraw the reference as one heart and two lungs enclosed by a proportional adult ribcage; exactly twelve pairs of ribs; ribs1–7 via their own costal cartilages to sternum,8–10 indirect costal margin,11–12 free anterior tips; twelve thoracic vertebrae behind; manubrium, body and xiphoid; fine neutral-grey nineteenth-century graphite engraving with hatching/stipple; transparent background, no text, arrows, frame, paper or cast shadow; organs lighter and partly obscured by foreground ribs. No shoulder girdle, arms or pelvis. Keep organs within thoracic boundaries.

Second prompt: preserve style and organs; correct the cage to exactly twelve ribs per side with an open inverted-V costal arch;11/12 short with clearly free tips and no anterior connections;8–10 join the margin rather than sternum; sternum ends at rib7 with a short xiphoid above the arch; no extra lumbar column below chest.

Final prompt (verbatim):

> One precise cleanup edit only. Keep this entire graphite thoracic anatomy plate unchanged: 12 rib pairs, sternum, lungs, heart, posterior spine, style, framing, transparent background. REMOVE the two isolated detached leaf/triangle-shaped grey bone shards inside the lower open costal arch, one floating between lower viewer-left ribs and spine and the matching one on viewer-right. They look like pointed oblique leaves with no attachment to any rib or vertebra. Leave empty transparent space where these two isolated shards were. Do NOT remove or add ribs. Keep the two actual lowest floating ribs on EACH outer side with their free medial tips. Keep every continuous rib connected posteriorly to the spine. No other change, no labels, no text.

目检最终原图和发布WebP：两侧从第一肋向下逐一计数，均12条（24条）；前方胸骨、后方椎柱、肋弓与每侧下方两条游离尖端可见；两片孤立残片已消失。心略偏身体左侧，肺在肋后、未越出胸廓。胸骨在肋弓上方终止，没有延至下腹。灰阶和透明边距经处理保留。图为教学插画，不能据此宣称椎节、软骨厚度、每个后方关节面或肺叶裂达到临床准确；精确肋数的额外证据是模型源清单24个命名肋骨。

Visual review of the final PNG and processed WebP found twelve rib arcs per side, foreground sternum, posterior vertebral column, an open costal arch and the two lowest free tips on each side. Heart and lungs remain inside the chest. This is an educational illustration, not an independently certified anatomical plate; detailed posterior articulations, cartilage thickness and fissures are not certified. Source-mesh rib counts are audited separately.
