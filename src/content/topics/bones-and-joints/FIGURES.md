# 插图检查 / Figure record — 2026-11-02

## Publication state

All three are published. The cover and living-bone figure are independent Atlas
graphite illustrations (CC BY-NC-SA 4.0); no Z-Anatomy render or mesh was
supplied to image generation, and processing only crops, pads, desaturates and
encodes. The protected-organs figure uses no image generation at all.

| Published figure | Source | Published output |
|---|---|---|
| Hip cover (unchanged) | PNG SHA-256 `15a2659aea97bdc52910a3a74ee9feb1e23f3b10a2f76b9bc6b6a68547494661` | `public/illustrations/bones-and-joints.webp` 80,164 B; `bones-and-joints@2x.webp` 240,250 B |
| Living bone (unchanged) | PNG SHA-256 `31c7a066492ba43426b98067e88589dde4557381f3ee162e23f1ee040a9906de` | `public/illustrations/figures/bones-and-joints-living-bone.webp` 98,398 B |
| Protected organs | `scripts/figures/bones-protected-organs.ts` (explicit geometry → SVG → sharp) | `public/illustrations/figures/bones-and-joints-protected-organs.webp` 1200×900, 102,314 B, SHA-256 `574028b749daee752bed0de5ec7064275a24d5f73aeea9b8a4392aa123ed147a` |

## Protected organs: method

Generated from explicit geometry, deterministic:
`pnpm tsx scripts/figures/bones-protected-organs.ts [--svg out.svg]`.

Anterior view of the thorax, graphite line art on a transparent ground, no
labels (the caption carries the count, like the other figures). Back to front:
thoracic vertebrae T1–T12 with transverse processes; the back half of every
rib, 1–12 alike, in a light contour from its vertebra to the lateral bend; both
lungs (fissures drawn) in a translucent hatched tone, and between them a smaller
heart outline in a light solid tone with a darker edge (superior vena cava,
aorta, pulmonary trunk), centred to the subject's left of the sternum and partly
behind it, apex down and out; the front parts of the ribs in full ink with
dashed, lighter costal cartilage, ribs 11–12 only as a short piece at the flank; the sternum (manubrium, body,
xiphoid) slightly translucent so the spine reads through it. No clavicles.

**Count: 12 ribs per side, by construction.** Each rib is built from its own
vertebra outwards, so its head lies inside the body of Tn:

| Ribs (each side) | Class | Anterior end |
|---|---|---|
| 1–7 | true | own cartilage reaches the sternum edge |
| 8–10 | false | cartilage joins the cartilage of the rib above (costal margin) |
| 11–12 | floating | short; free tapered tip at the flank, lateral to rib 8's junction and clear of every cartilage and other rib; posterior end at T11 / T12 |

`tests/space-scene/bones-and-joints-figure.test.ts` checks the geometry (12
vertebrae; 12 ribs per side classed 7/3/2; every head inside its own vertebra
and no other; true-rib cartilages end inside the sternum outline; false-rib
cartilages end on the rib above's cartilage; floating tips free; every rib's
front part starts at its lateral bend; rib 12 shorter than 11, 11 shorter than
10, their visible piece under 40 % of the rib and their tips at the flank; heart
smaller than a lung, right of the sternum on the page, partly behind it, apex
down and out), the SVG (24 rib groups, 14/6/4 by class, 24 back halves) and the shipped WebP (1200×900, every decoded pixel
R = G = B, transparent ground, within the 120 KiB figure budget, used in both
locales of chapter 02).

Visual check (2026-11-02, after review: floating ribs shortened to the flanks and given back halves like ribs 1–10; heart redrawn as a recognisable outline): rendered at 1200 px and 360 px on paper, and inverted
on the dark plate; counted 12 per side from the top, junction by junction, with
both floating pairs traced from their vertebrae to free tips.

Encoding: greyscale near-lossless WebP (quality 40), as plates-and-hazards
does, so decoded greys stay exactly neutral; lossy YUV WebP rounds chroma.

## History

The first published image (2026-10) was recorded as 12 pairs but counted 14
per side in browser acceptance. Its replacement counted 12 but drew ribs 11–12
loose beside the spine, and was withdrawn in commit `6aaf098`. Four further
image-generation attempts on 2026-10-29 were rejected: extra ribs (1, 2), an
ambiguous lower costal margin (3), and a floating pair that disappeared under
the costal margin (4). Generated raster anatomy could not be made countable, so
the figure is now drawn from geometry instead. The old review overlay
`scripts/geo/bones-and-joints/rib-count.svg` belonged to a withdrawn image and
was removed.
