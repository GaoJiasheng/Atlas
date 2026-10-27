# 图像制作与复用记录 · Saturn V

2026-10-27。封面为 image_gen.imagegen 原创新图；两张章图复用既有已审 Atlas 原创图。全部属于 Atlas CC BY-NC-SA 4.0 内容族，没有引入第三方素材。NASA PDF 只作结构参考，不作部署图。

## saturn-v.png

- 源图尺寸：[1024, 1024]；SHA-256：`6eb2e6ee763305b3e9043ce8d9a2d3d8ce0e612e67e85f353ca98c3cc48c4b02`。
- 生成工具：`image_gen.imagegen`；1 次；Routine illustration normalization: neutral equal-RGB graphite, proportional fit inside 870px box with transparent padding to exactly 1024²; deployed assets via scripts/illustrate.ts.
- 已看过最终 PNG：Three main stage outlines, narrow instrument unit and spacecraft adapter, Apollo spacecraft and skeletal escape tower. Five-engine cluster partly occluded in oblique view; no duplicate lander, boosters or flames.
- 图像审计：{"rgba": true, "alphaRange": [0, 255], "nonNeutralPixels": 0}；无文字、旗帜、标识或背景。

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
Use case scientific-educational. Atlas square 1024x1024 cover: ONE complete historically recognisable Apollo 11 Saturn V rocket launch stack, assembled, isolated in transparent space as an engineering specimen. Show full rocket straight and upright, slightly tilted diagonal bottom-left to upper-right if necessary for square composition; correct very slender overall proportions total height about 111m versus main cylinder diameter about10m, do NOT fatten it. Exactly THREE main rocket stages: long broad S-IC bottom, shorter equally broad S-II middle, taper to narrower S-IVB third stage above. Narrow instrument ring above third stage, tapering spacecraft adapter above it, cylindrical Apollo service module, squat conical command module, slender skeletal launch escape tower at very top. Four small base fins, five F-1 engines clustered at bottom one centre four around; near side bells visible with far bells partly occluded, no requirement to display all nozzles from this view. No side boosters, no airplane wings, no external shuttle tank, no deployed lunar lander outside stack, no flames or smoke, no launch gantry or ground. Retain subtle authentic monochrome panel and interstage band structure but absolutely NO letters numerals text logos insignia national flags or flag motifs. Fine delicate graphite pencil nineteenth-century scientific engineering plate, confident contours, cross-hatching, stippling. Strict neutral greyscale equal RGB, fully transparent PNG alpha, no background paper texture frame arrows ground shadow. Whole complete stack including tower and engine tips inside generous margins, about85percent canvas height, nothing clipped. Intended art/planned/saturn-v/saturn-v.png.
Generate exactly 1024x1024 with transparent background.
```

## 部署管线

`pnpm tsx scripts/illustrate.ts process art/planned/saturn-v/saturn-v.png saturn-v`

`pnpm tsx scripts/illustrate.ts figure art/planned/saturn-v/saturn-v-apollo-cutaway.png saturn-v-apollo-cutaway`

`pnpm tsx scripts/illustrate.ts figure art/planned/saturn-v/saturn-v-air-breathing-engine.png saturn-v-air-breathing-engine`

封面 WebP 为 800² 与 1600²，章图为 1200×900。透明边距与灰度由管线规范化。原图保存在本工作树 gitignored `art/planned/saturn-v/`；本记录和 public WebP 可进入版本控制。Apollo 章图用于座位/返回舱与服务设备的解释，不用于精确储箱、喷嘴计数；涡扇图只作吸气与自带氧化剂的对比。
