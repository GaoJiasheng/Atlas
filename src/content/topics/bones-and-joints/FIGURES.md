# 插图检查 / Figure record — rework 2026-10-27

Three independent graphite illustrations, CC BY-NC-SA 4.0. No Z-Anatomy render
was supplied to image generation or incorporated into these images. The cover
and living-bone drawing are unchanged. The protected-organs drawing is replaced.

| Figure | Source PNG SHA-256 | Published output |
|---|---|---|
| Hip cover | `15a2659aea97bdc52910a3a74ee9feb1e23f3b10a2f76b9bc6b6a68547494661` (main preparation PNG) | `public/illustrations/bones-and-joints.webp` 80,164 B; `bones-and-joints@2x.webp` 240,250 B |
| Living bone | `31c7a066492ba43426b98067e88589dde4557381f3ee162e23f1ee040a9906de` (main preparation PNG) | `public/illustrations/figures/bones-and-joints-living-bone.webp` 98,398 B |
| Protected organs, replacement | `71abb107a8f1a30cd35cb8fb54a92eac1a5f95ec823abeacbbbfc295b79c87f2` | `public/illustrations/figures/bones-and-joints-protected-organs.webp` 122,018 B |

Replacement source: `art/planned/bones-and-joints/bones-and-joints-protected-organs.png`
(1312×1199, alpha; local preparation directory). Published WebP SHA-256:
`b7f6c69c456a643663672ef1471822440cceeb77e59e6d7fab2f2cea9a4c4c67`.

## Correction to the previous record

The previous PNG (`a7ab7c9e…`) / 118,178 B WebP was incorrectly recorded as
12 ribs per side. Claude's browser acceptance counted 14. That old visual count
is withdrawn. A correct source-mesh count does **not** establish an illustration's
rib count. The replacement was counted independently on the generated image
and again on the processed WebP.

## New generation and count

Built-in `image_gen`, three calls of the four permitted; transparent background
on all calls. Attempt 1 was rejected because the lower costal-margin arcs did
not provide an acceptable twelve-rib cage. Attempt 2 generated a numbered plate,
with ten long arcs and two short floating ribs on each side. The numbers were
checked against the actual continuous arcs and tips rather than accepted as
evidence by themselves. Attempt 3 removed only those numbers and short leaders.
Its anatomy was recounted after that edit; no fourth attempt was needed.

The numbered intermediate is saved locally as
`art/planned/bones-and-joints/bones-and-joints-protected-organs-counted.png`.
The **final** WebP is marked separately in
[rib-count.svg](../../../../scripts/geo/bones-and-joints/rib-count.svg).
Each of its 24 dots is on an individually traced rib, with numbers 1–12 per
side. The corresponding raster review copy is in the ignored anatomy cache:
`scripts/anatomy/cache/bones-joints/previews/rework-rib-count.png`.

| Traced level, top to bottom | Viewer-left | Viewer-right | Anterior endpoint checked |
|---|---|---|---|
| 1–7, traced separately | 7 | 7 | Seven individual cartilage junctions towards the sternum |
| 8, 9, 10, traced separately | 3 | 3 | Three indirect contributions to the open costal margin |
| 11 and 12, traced separately | 2 | 2 | Two short free tips in each lower opening |
| Total | **12** | **12** | **24 individual ribs / 12 pairs** |

Method: start at the uppermost rib, trace its continuous shaft to its anterior
cartilage seam, then move to the next separate shaft. After the seven direct
connections, trace the three lower arcs into the margin. Count the two remaining
short ribs by their separate free anterior tips. Posterior returns, the shared
cartilage margin and vertebral processes are not additional ribs. Repeat on the
other side and on the processed image. The final overlay was visually inspected
with the actual WebP beneath the markers. Heart and lungs are within the cage,
sternum anterior and spine posterior; the sternum ends above the open arch.

This is an educational count and composition check, not named clinical approval
of cartilage thickness, posterior joints, vertebral segmentation or lung fissures.

Processing (no anatomy edits by script):

```sh
pnpm tsx scripts/illustrate.ts figure art/planned/bones-and-joints/bones-and-joints-protected-organs.png bones-and-joints-protected-organs
```

Result: 1200×900, alpha, neutral graphite, q76, 122,018 B (within the figure
budget). The final PNG and final WebP were both visually inspected.

## Prompts (verbatim)

### Attempt 1 — rejected

Use case: scientific-educational. Redraw an anatomical graphite plate of the thorax, frontal view, transparent background. Fine neutral grey pencil engraving and stippled shading, matching a nineteenth-century technical plate. One sternum in front, thoracic vertebral column behind, pale lungs and heart safely inside the cage. CRITICAL EXACT COUNT: TWELVE ribs on EACH side, twelve pairs total. Build only these twelve numbered levels mentally: 1,2,3,4,5,6,7 are true ribs each joining the sternum by its own cartilage; 8,9,10 join a shared open costal arch indirectly; 11 and 12 are TWO short floating ribs with distinct free anterior tips on EACH side. Seven + three + two = twelve per side. Broad clear spaces between every rib make all twelve individually traceable. No extra arcs, no extra free tips, no detached bone shards. Sternum terminates near rib seven above an open inverted V costal arch. Anatomically proportional cage, not an elongated cage of fourteen ribs. Organs lighter than foreground bone. No clavicles, shoulders, arms, pelvis, no labels, numerals, text, arrows, frame, shadows, or paper background.

### Attempt 2 — numbered count plate

Use case: scientific-educational. NEW anatomy textbook graphite engraving of a rib cage enclosing pale heart and lungs, transparent background, frontal view, NO shoulders/clavicles/arms/pelvis. Make exactly TWELVE pairs of ribs, 24 ribs total, not fourteen pairs. The previously generated cage had extra lower ribs: avoid that. Clearly enumerate every actual rib with a tiny pencilled number 1 through 12 beside the lateral shaft on BOTH sides, one number per rib, exactly twelve numbers on each side. Top down: seven true ribs (1–7) join the front sternum individually, three false ribs (8–10) converge into one continuous open inverted-V costal margin, TWO floating ribs (11–12) are short separate branches from the posterior thoracic spine with free tips, shown below rib10 within the lower opening. There must be ONLY TEN long outer arcs on each side, with the TWO shorter floating ribs inside the lower opening. Do not put extra arcs below the tenth outer rib. Generous spacing, clearly separate ribs. Sternum is foreground, spinal column is behind, organs inside. Fine neutral-grey graphite linework, hatching/stipple, no colour, no background, no decorative elements. Twelve not fourteen.

### Attempt 3 — accepted after recount

Precise cleanup of this exact graphite anatomy plate. Preserve EVERY anatomical line and all twelve ribs on EACH side exactly, all organ shapes, sternum, spine, graphite shading, scale and transparent background. Remove ONLY the tiny pencilled numerals 1–12 and their short leader strokes on both sides. Leave transparent background where the numbers/strokes were. Do NOT redraw, add, remove, bend, extend or change any ribs. There are ten long rib arcs on each side and two short floating rib tips inside the lower opening on each side; preserve exactly this geometry. No text or numbers in the final image.
