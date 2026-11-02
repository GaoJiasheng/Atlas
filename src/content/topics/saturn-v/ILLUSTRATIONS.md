# 图像制作与复用记录 · Saturn V

2026-10-29 更新封面。封面为 image_gen.imagegen 原创新图；两张章图仍复用既有已审 Atlas 原创图。全部属于 Atlas CC BY-NC-SA 4.0 内容族，没有引入第三方素材。NASA PDF 只作结构参考，不作部署图。

## saturn-v.png

- 源图尺寸：[1254, 1254]；926,565 B；SHA-256：`7b85c959809a903164e8a80c73f0cbb1bea6285bf66f2c740c49368633f90c08`。
- 生成工具：`image_gen.imagegen`（built-in）；2 次。第 1 次仅四个喷口可数清，弃用；第 2 次采用更低仰视，五台 F-1 全部可见。
- 已看过最终 PNG 和两张部署 WebP：Exactly five separate nozzle mouths, four outer around one centre (two rear, centre, two front), connected beneath S-IC; three main stages, instrument ring, spacecraft adapter, Apollo service/command modules and skeletal escape tower. Complete slender stack with perspective foreshortening; no extra lander, boosters, flames, text or flags.
- 原始生成 PNG 为 RGBA，alpha [0,255]，四边最大 alpha=1（不可见生成噪点）；保留原始 RGB 和 alpha。`scripts/illustrate.ts process` 统一去色、裁边和补透明边距；部署图外缘全透明，解码可见像素 RGB 最大通道差为 1（WebP 有损压缩），视觉为中性石墨灰。
- 部署 800²：44,338 B，SHA-256 `4aac5ff5a655df1f703fde1a5e16481fce0dd1786e7e56e9e5e27f8e7a0e986e`；1600²：124,064 B，SHA-256 `6f110e22170d53198a5374eacf0513e5f7a822c907477bd9ba3a2a5310a933e4`；均 q82，在预算内。
- Sandbox 暂存：源图、两次 prompt 与新 manifest 在**本工作树** `art/planned/saturn-v/`（gitignored）。主 checkout `/Users/gavin/work/atlas/art/planned/saturn-v/` 不在可写范围内，未修改。

## saturn-v-apollo-cutaway.png

- 源图尺寸：[1536, 1152]；SHA-256：`455ee1e29f2930318f696e9cb5f889761aeb94602142a1ae021f735e282f493d`。
- reusedFrom：`art/planned/space-race/space-race-apollo-cutaway.png`（主 checkout 的原文件，逐字节复制）。
- 已看过最终 PNG：Three reclining couches visible; CM heat shield and service equipment; explanatory layout, not exact tank or thruster count.
- 图像审计：{"rgba": true, "alphaRange": [0, 255], "nonNeutralPixels": 0}；无文字、旗帜、标识或背景。

## saturn-v-air-breathing-engine.png

- 源图尺寸：[1536, 1152]；SHA-256：`0c01ce5cee4514304a304164dacf9a6a73a3e5e15b3b0114674ae86877fe64a9`。
- reusedFrom：`art/planned/how-planes-fly/how-planes-fly-turbofan-cutaway.png`（主 checkout 的原文件，逐字节复制）。
- 已看过最终 PNG：Air intake and fan/core visible; explicitly a turbofan comparison, never an F-1 engine.
- 图像审计：{"rgba": true, "alphaRange": [0, 255], "nonNeutralPixels": 0}；无文字、旗帜、标识或背景。

## 完整封面 prompt

```text
Use case: scientific-educational. Redraw the reference Saturn V graphite cover, correcting the camera viewpoint and engine count. The last attempt still looked like four engines. MANDATORY: use a substantially lower underside three-quarter camera, looking upward along the rocket at an angle of about 35 degrees to its base plane. We need to see the underside face of the S-IC and EXACTLY FIVE distinct dark circular/elliptical engine nozzle apertures: four outer F-1 engines at the corners of a square and a FIFTH central F-1 engine in the square's centre. The rear two openings must be visibly separated above the centre opening; the front two openings must be visibly separated below the centre opening. Thus the countable nozzle openings form FIVE dots of a die, a quincunx: two back, one centre, two front. All five engines fixed to one base, no detached nozzles, no sixth nozzle. Do not use a near side-on camera that hides the rear two or centre nozzle. Enlarge the engine separation visually by the lower camera, not by widening the rocket or moving engines off their mounts.
ONE full assembled Saturn V Apollo launch stack, very slender proportions height about 111m to 10m main barrel. Three main stages only: long S-IC bottom, shorter equal-width S-II middle, narrower S-IVB upper; narrow instrument unit ring; tapered spacecraft adapter; cylindrical service module; squat conical command module; skeletal launch escape tower. Four small base fins with 2–3 visible; no broad wings. Arrange full complete rocket diagonally bottom-left to top-right in square canvas with generous clear margins. Reference image supplies the graphite rendering style and rocket morphology; change the camera angle enough to fulfill the five opening requirement.
Fine nineteenth-century scientific engineering graphite plate: clean delicate contours, crosshatching and stippling, only neutral grey graphite. Genuinely transparent PNG background. No text, letters, numerals, flags, logos, arrows, frame, paper texture, background, ground shadow, flames, smoke, gantry, external booster, exposed lunar lander.
```

## 部署管线

`pnpm tsx scripts/illustrate.ts process art/planned/saturn-v/saturn-v.png saturn-v`

`pnpm tsx scripts/illustrate.ts figure art/planned/saturn-v/saturn-v-apollo-cutaway.png saturn-v-apollo-cutaway`

`pnpm tsx scripts/illustrate.ts figure art/planned/saturn-v/saturn-v-air-breathing-engine.png saturn-v-air-breathing-engine`

封面 WebP 为 800² 与 1600²，章图为 1200×900。透明边距与灰度由管线规范化。原图保存在本工作树 gitignored `art/planned/saturn-v/`；本记录和 public WebP 可进入版本控制。Apollo 章图用于座位/返回舱与服务设备的解释，不用于精确储箱、喷嘴计数；涡扇图只作吸气与自带氧化剂的对比。
