# 插图检查 / Figure record — 2026-11-03

## Publication state

All three are published. The cover and living-bone figure are independent Atlas
graphite illustrations (CC BY-NC-SA 4.0); no Z-Anatomy render or mesh was
supplied to image generation, and processing only crops, pads, desaturates and
encodes. The protected-organs figure uses no image generation at all.

| Published figure | Source | Published output |
|---|---|---|
| Hip cover (unchanged) | PNG SHA-256 `15a2659aea97bdc52910a3a74ee9feb1e23f3b10a2f76b9bc6b6a68547494661` | `public/illustrations/bones-and-joints.webp` 80,164 B; `bones-and-joints@2x.webp` 240,250 B |
| Living bone (unchanged) | PNG SHA-256 `31c7a066492ba43426b98067e88589dde4557381f3ee162e23f1ee040a9906de` | `public/illustrations/figures/bones-and-joints-living-bone.webp` 98,398 B |
| Protected organs | `scripts/geo/bones-and-joints/protected-organs.ts` (explicit geometry → SVG → sharp) | `public/illustrations/bones-and-joints/bones-and-joints-protected-organs.webp` 1200×900, 108,902 B, SHA-256 `9f1aaa043bfaf67644ff8dc6be1aea0f691c413f16fc487f3960714c2cb3d313` |

## Protected organs: method

Generated from explicit geometry, deterministic:
`pnpm tsx scripts/geo/bones-and-joints/protected-organs.ts`.
The thorax construction from `scripts/figures/bones-protected-organs.ts` /
040f192 is imported unchanged; the current plate adds cranial and spinal sections.

Anterior view of the thorax, graphite line art on a transparent ground, now
with numbered ribs and bilingual leaders. The shared thorax layers, back to front:
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

Historical thorax visual check (2026-11-02, after review: floating ribs shortened to the flanks and given back halves like ribs 1–10; heart redrawn as a recognisable outline): rendered at 1200 px and 360 px on paper, and inverted
on the dark plate; counted 12 per side from the top, junction by junction, with
both floating pairs traced from their vertebrae to free tips.

Encoding: greyscale near-lossless WebP (quality 35), as plates-and-hazards
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

## Polish 2026-11-03 · current published plate

The previous thorax was already restored on this branch. The replacement is
wired into both `<Figure>` uses in `02-living-bone.mdx` under the new topic-owned
asset path, retaining the image-name substring used by the browser test.

Three coordinated sections now explain protection: (01) a lateral cranial
cutaway, with the inner/outer cranial tables surrounding a folded cerebral
hemisphere, cerebellum and brainstem; (02) a short midline section of four
thoracic vertebrae plus one vertebra from above, with the cord in the vertebral
canal (redrawn at acceptance, below); and
(03) the audited anterior thorax. The spinal inset is a short segment, not a
picture of the cord extending all the way to the sacrum. EN/ZH leaders name the
skull, brain, spinal cord, vertebrae, thoracic spine, sternum, costal cartilage,
heart and lungs. Ribs 1–12 are numbered on the subject's left; the 7 / 3 / 2 key
is bilingual. No clavicles or extra rib-like strokes were added. Every rib,
including 11–12, retains a traceable posterior attachment and free floating tip.

Counts unchanged: 24 ribs, 12 thoracic vertebrae, 14 true / 6 vertebrochondral
false / 4 floating ribs. Here “false” in the three-class key denotes ribs 8–10;
floating ribs 11–12 are also classified as false ribs in the broader two-class
anatomical terminology. The existing thorax/image assertions remain, with an added
assertion for protective sections and bilingual labels. Captions/alt text in
both languages now mention brain and spinal-cord protection. No teaching
number, chapter, beat or part id changed.

References: OpenStax A&P 2e §§6.3, 7.2, 7.3, 7.4 (links and licensing boundary
in `data/SOURCES.md`); the existing 040f192 geometry, not generated raster
anatomy. Original independently drawn plate, CC BY-NC-SA 4.0.

Offline QA: inspected the full 1200×900 paper and cinema plates, the 360 px
reading-panel derivative and rib-cage/head close-ups. The protected-organs file
is neutral decoded RGB with transparency, 107,290 B (previous 102,314 B), under
the 122,880 B figure budget. Previews and source SVG:
`scripts/geo/bones-and-joints/previews/polish-2026-11-03/protected-organs-*`.
No browser or desktop was opened; runtime acceptance remains for the following
main-session review as requested.

The current leaders use 32 px EN/ZH text at native size (about 11 px at the
420 px reading-panel width); the count key is on two bilingual lines.

### Acceptance redraw (Claude, 2026-11-03)

The first polish plate was rejected on review and its two sections were redrawn
in the same generator, as explicit geometry in centimetres (adult proportions):

- **01 Cranial section** — lateral skull, Frankfort plane horizontal. The vault
  wall is cut away along the cranial floor; the cut edge shows outer table,
  diploë and inner table (about 0.65 cm, 1.0 cm with the frontal sinus at the
  glabella, 0.85 cm at the inion). Brain inside: cerebrum with meandering sulci
  (lateral and central sulci drawn heavier), cerebellum with curved folia under
  the occipital lobe, brainstem entering the foramen magnum. Face: nasal bones,
  piriform notch, orbit with its lateral rim, zygomatic bone and arch, maxilla,
  external acoustic meatus, mastoid and styloid processes, and a full mandible
  (condyle in front of the ear canal, coronoid passing under the arch, ramus,
  angle, body, chin, mental foramen) with 8 upper and 8 lower teeth on one side.
  The previous outline (hook-shaped jaw, thin vault, wavy-line brain) is gone.
- **02 Spinal section** — four thoracic vertebrae cut in the midline (anterior
  to the right) plus one vertebra seen from above. The spinal cord, inside its
  dura, runs through the vertebral canal: vertebral bodies and discs in front;
  laminae, spinous processes and ligamenta flava behind; the far-side pedicles
  ghosted at each level. The top view shows the cord (with its grey-matter
  butterfly) enclosed by the ring of body, pedicles and laminae. The previous
  drawing put the cord outside the stack.
- **03 Thorax** — geometry unchanged (12 pairs: 1–7 true to the sternum, 8–10
  false via the cartilage above, 11–12 floating; heart apex to the subject's
  left, the viewer's right). The whole thoracic spine is now ghosted
  (`opacity 0.32`) so no vertebral body reads as being in front of the
  manubrium or xiphoid. The thorax was set slightly smaller so its labels sit in
  a right-hand column, away from the spinal section's labels; leader ends are
  computed from the thorax geometry (T1, sternum, left lung, heart centroid,
  left rib 8 cartilage).

The figure test now asserts 4 midline vertebrae, the top-view vertebra and the
ghosted thoracic spine, alongside the unchanged rib, heart and pixel checks.
Previews (local, ignored): `scripts/geo/bones-and-joints/previews/polish-2026-11-03/protected-organs-{paper,cinema,360}.png`.

