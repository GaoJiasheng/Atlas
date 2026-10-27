# 插图加工记录 / Illustration processing

2026-10-27：逐张查看主 checkout 的 approved PNG，然后用 scripts/illustrate.ts process / figure 处理。没有新生成，没有修改原文件。两张新图为原有准备资产；蚊子图复制自 art/planned/mosquito/mosquito-water-stages.png，原图保持原位。图中对象分别放大，不是共同尺度或历期图。

原创 Atlas 插图沿用 LICENSE-CONTENT；没有外部第三方资产或 share-alike 数据，不新增 licence carve-out。

```json
[
  {
    "file": "public/illustrations/frog-and-chicken.webp",
    "width": 800,
    "height": 800,
    "bytes": 87462,
    "sha256": "ce2745c9ed7505e59deeea61895f0e16590391a6cf37a07170ac5b3e06dde43b",
    "transparentPixels": 435066,
    "chromaticPixels": 2557
  },
  {
    "file": "public/illustrations/frog-and-chicken@2x.webp",
    "width": 1600,
    "height": 1600,
    "bytes": 264934,
    "sha256": "6c64adf367f6b09efa072da5d0ed2f3e4f8957c22fe81aca2408618ba09b0c7c",
    "transparentPixels": 1740184,
    "chromaticPixels": 10041
  },
  {
    "file": "public/illustrations/figures/frog-and-chicken-eggs-and-tadpole.webp",
    "width": 1200,
    "height": 900,
    "bytes": 92822,
    "sha256": "19f25b7916c8530492bcbf87bc47f65b1ca6ff592ce62b713b3334918670e81e",
    "transparentPixels": 885738,
    "chromaticPixels": 2363
  },
  {
    "file": "public/illustrations/figures/frog-and-chicken-mosquito-water-stages.webp",
    "width": 1200,
    "height": 900,
    "bytes": 107206,
    "sha256": "61f75a5fc94a03b5c5b3222c00473bd8a6c967fe4467b521678c36b8e0348fbb",
    "transparentPixels": 566356,
    "chromaticPixels": 5806
  }
]
```

全部成品有真 alpha；输入 PNG 每个像素 R=G=B；脚本有损 WebP 解码后少数像素 RGB 最大差 1/255（见上表 chromaticPixels），视觉仍为中性灰，封面 800/1600 方形、章节图 1200×900；字节数全部在脚本预算内。这是成品对“等 RGB”字面合同的编码差异；没有改动共用脚本。下列原 manifest 保留生成次数、拒稿原因与复用链：

```jsonl
{"kind": "cover", "chapterIdea": "Frog and chicken as two animals with different life cycles", "subject": "One adult pond-type frog, one adult domestic hen and one intact chicken egg; independent display scales.", "checks": "Opened source: one frog with no tail, two forelimbs and folded hindlimbs; visible near forefoot has four fingers, hind digits partly occluded and not certified as a digit-count diagram. One hen, closed beak, two folded wings, two legs, three forward toes plus a rear toe visible on each foot. One unmarked intact egg. No claim to a named Singapore frog species. No text, frame, arrows, flags, logos, background or ground shadow. Export: exact RGBA 1024×1024; R=G=B for every pixel including transparent pixels; generated alpha preserved; fitted nonzero-alpha bounding box (77, 80, 946, 943), about 85% maximum canvas dimension; clear margins. Deterministic resize/greyscale only.", "tries": 1, "slug": "frog-and-chicken", "file": "art/planned/frog-and-chicken/frog-and-chicken.png"}
{"kind": "figure", "chapterIdea": "Jelly-coated eggs and a free-swimming tadpole", "subject": "Illustrative partial cluster of jelly-coated frog eggs and one enlarged legless tadpole, with no shared size scale.", "checks": "Opened source: each visible egg capsule surrounds one dark embryo; no hard shells. Exactly one tadpole, continuous attached tail and tail membrane, no limbs, no external feathery gills, no fish-type paired fins. Eyes in side three-quarter perspective; one clearly visible, far eye partly visible. First two four-limb-stage attempts rejected for digit-count errors; final subject redesigned to egg/tadpole stage to avoid inaccurate developmental limbs. No text, arrows, logos, frame, background or ground shadow. Export: exact RGBA 1536×1152; R=G=B for every pixel including transparent pixels; generated alpha preserved; fitted nonzero-alpha bounding box (115, 101, 1421, 1050), about 85% maximum canvas dimension; clear margins. Deterministic resize/greyscale only.", "tries": 3, "slug": "frog-and-chicken", "file": "art/planned/frog-and-chicken/frog-and-chicken-eggs-and-tadpole.png"}
{"kind": "figure", "chapterIdea": "Comparing frog development with the mosquito larva and pupa", "subject": "Magnified cutaway saucer with individually attached Aedes-type eggs above the waterline, one hanging larva and one comma-shaped pupa.", "checks": "Opened existing source and read its original manifest (original generation tries=1). Exactly one legless larva with head down and siphon at water surface, one comma-shaped pupa with two respiratory trumpets at surface. Eggs individually on wall above horizontal waterline. Figure is specifically the mosquito comparison, not frog eggs. No text, arrows, logos, frame or ground shadow. New generation calls=0; source is copied, never moved. Export: exact RGBA 1536×1152; R=G=B for every pixel including transparent pixels; generated alpha preserved; fitted nonzero-alpha bounding box (115, 86, 1420, 1065), about 85% maximum canvas dimension; clear margins. Deterministic resize/greyscale only.", "tries": 0, "slug": "frog-and-chicken", "file": "art/planned/frog-and-chicken/frog-and-chicken-mosquito-water-stages.png", "reusedFrom": "art/planned/mosquito/mosquito-water-stages.png"}
```
