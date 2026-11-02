# 插图检查 / Figure record — 2026-10-29

## Publication state

The cover and living-bone figure are unchanged. **Protected organs remains
withdrawn.** Four built-in image_gen calls were used this session; none passed
the combined count and floating-rib attachment check. No replacement is
published; the two chapter uses and dependent e2e check remain withdrawn.

Independent Atlas graphite illustrations, CC BY-NC-SA 4.0. No Z-Anatomy render
or mesh was supplied to image generation. Processing only crops, pads,
desaturates and encodes; it cannot repair anatomy.

| Published figure | Source PNG SHA-256 | Published output |
|---|---|---|
| Hip cover (unchanged) | `15a2659aea97bdc52910a3a74ee9feb1e23f3b10a2f76b9bc6b6a68547494661` | `public/illustrations/bones-and-joints.webp` 80,164 B; `bones-and-joints@2x.webp` 240,250 B |
| Living bone (unchanged) | `31c7a066492ba43426b98067e88589dde4557381f3ee162e23f1ee040a9906de` | `public/illustrations/figures/bones-and-joints-living-bone.webp` 98,398 B |
| Protected organs | No accepted replacement | Absent |

## Earlier acceptance withdrawn

Original PNG `a7ab7c9e…` / 118,178 B WebP was incorrectly recorded as
12 pairs; browser acceptance counted 14. Replacement PNG `71abb107…` /
WebP `b7f6c69c…` counted 12 but drew ribs 11–12 loose beside the spine.
Commit `6aaf098` withdrew it. The earlier
[rib-count.svg](../../../../scripts/geo/bones-and-joints/rib-count.svg)
belongs to that withdrawn image; its 24 dots are historical, not evidence of
an accepted current image. Source-mesh counts do not establish raster anatomy.

## Four-attempt review (this session)

All four PNGs were visually inspected. Count each separate anterior shaft /
cartilage junction from the top, then trace each floating rib from its
vertebral joint to its free anterior tip. Posterior returns, shared cartilage,
vertebral processes and generated numbers are not additional ribs or evidence
by themselves. Check both sides; hidden endpoints do not establish free tips.

| Attempt | Rejection |
|---|---|
| 1 | Extra lower outer arcs plus two short inner branches; not twelve pairs. |
| 2 | Twelve outer shafts plus an extra short inner pair. Printed right-side numbers are inconsistent. |
| 3 | Twelve outer shafts can be counted, but a lower arch meets the costal margin and the lowest free tips lack unambiguous posterior continuity. |
| 4 | Ten outer arcs per side and one clearly attached short pair with free tips. A higher posterior branch disappears beneath the costal margin; both floating pairs cannot be traced to free anterior tips. |

Attempt 4 (1536×1024): clearly free short tips near (580,850) / (960,850).
Higher branches originate at the next vertebra up but disappear around
(610,760) / (925,760) beneath the foreground margin. An independent
second-agent review also rejected attempts 3 and 4. Heart/lungs inside,
sternum anterior and spine posterior read correctly; these do not waive the
floating-rib requirement.

## Local review artifacts and processing

Files below and `prompts.json` are staged in this worktree's gitignored
`art/planned/bones-and-joints/`. Main checkout art at
`/Users/gavin/work/atlas/art/planned/bones-and-joints/` is outside sandbox
writable roots and was read only.

| Local rejected file | SHA-256 |
|---|---|
| `protected-organs-attempt-1.png` | `24e5dbcf53b119080be8c7d79ef6b485bdf0fdc64a861f8216150ea12e7eb7a1` |
| `protected-organs-attempt-2.png` | `df8d46cff0b7502ed502e011036e04eb80548ee38eb7667ab15668d6b67253ac` |
| `protected-organs-attempt-3.png` | `4de872e05784f2bdb328d646795f38b13c49f350c95037e6ee35946142381e33` |
| `protected-organs-attempt-4.png` | `d13fdc166c4a9ad582740ee32ba610a4247798e2a0b72960b1cedde18748f457` |
| `protected-organs-attempt-4-processed.webp` | `3d756bc0ce0652794a36f9c92644f6a6de99557bf307b37b93754e5d510e9ad0` |

Attempt 4 was processed with `scripts/illustrate.ts figure` using the requested
`bones-and-joints-protected-organs` stem, then its output moved out of
`public/` into the local review directory. The 1200×900 alpha WebP was
visually inspected and remains rejected. At 129,548 B / minimum q58 it also
exceeds the 120 KiB target. No engine/pipeline changes were made for an
unaccepted image. The staged source uses an attempt filename deliberately.

## Prompts (verbatim)

Built-in `image_gen__imagegen`, `transparent_background=true` on all calls.
Attempts 3 and 4 use the preceding candidate as an edit reference.

### Attempt 1 — rejected

Use case: scientific-educational. Asset: Atlas chapter figure, isolated human thorax in fine neutral-grey graphite pencil engraving, delicate crosshatching and stippling, crisp contours, nineteenth-century scientific plate. Fully transparent background. Landscape 4:3 canvas. Draw heart and both lungs INSIDE one anatomically proportional rib cage, sternum in the FRONT, thoracic vertebrae BEHIND the organs. Near-frontal view with slight three-quarter rotation so posterior rib attachments can be read; organs very pale translucent graphite, bones darker. CRITICAL: exactly TWELVE PAIRS of ribs, 12 individual ribs per side, 24 total. Seven true ribs 1–7 each connect by their own cartilage to the sternum; three false ribs 8–10 merge into the costal margin; two shorter floating ribs 11–12 on EACH SIDE, whose POSTERIOR ENDS ARE PHYSICALLY JOINED TO THE ELEVENTH AND TWELFTH THORACIC VERTEBRAE. Floating means only their ANTERIOR tips are free. Draw each lower floating rib as one unbroken curved bony shaft emerging directly from the side of its corresponding vertebra and sweeping laterally then anteriorly to a free tip. No transparent gap at any posterior joint; no detached slivers anywhere. Expose lower thoracic spine below the pale lungs to make all FOUR posterior joints of ribs 11 and 12 unmistakable. Give each of the 12 ribs generous separation so shafts can be traced and counted, particularly the two short lower ribs attached to each side of the spine. Only ten long outer arcs per side; two shorter attached lower ribs per side. Sternum ends above open costal arch. No clavicles, scapulae, arms, pelvis, lumbar spine, extra bones or inset diagrams. No text, numerals, labels, arrows, watermark, frame, ground shadow, paper texture or background. Entire thorax fits with transparent margins. Original illustration, no existing anatomy mesh as input.

### Attempt 2 — rejected

Use case scientific-educational. Draw a NEW anatomical graphite plate, fully transparent background, centered isolated adult thorax with pale heart and lungs inside a darker rib cage. Sternum at front, thoracic spine behind. Fine clean graphite pencil contours and sparse cross-hatching/stipple, greys only, no paper or shadow. Near frontal view. This is a COUNTED REVIEW DRAFT: write a small number 1 through 12 beside the lateral shaft of each rib on BOTH sides, one number per shaft. The finished anatomy must have exactly TWELVE rib pairs, exactly 24 ribs. Build the cage with ONLY TEN long outer arcs on the left and ONLY TEN long outer arcs on the right: numbers 1,2,3,4,5,6,7 to individual sternum cartilage; 8,9,10 to shared costal arch. After the tenth long outer arc STOP drawing long arcs. Below rib10, draw ONLY TWO shorter ribs on each side, numbers11 and12. These are the floating ribs: EACH is visibly CONNECTED AT ITS MEDIAL POSTERIOR END directly to the side of the corresponding lower thoracic vertebra. Their lateral/anterior tips are free, but their origins MUST touch the vertebrae. All FOUR lower short ribs grow out of the spine as connected branches with no gaps. Do not add any additional free tips at the outer edges of the cage: total per side TEN long arcs plus TWO short attached lower branches = TWELVE. Leave clear generous gaps between ribs so they are individually countable. Thoracic spine exposed in lower opening, no lumbar spine or extra branches. Heart and lungs pale enough to see cage, sternum foreground. Anatomically plausible proportions. No clavicles, scapulae, pelvis, arms, loose bone fragments, extra insets, leaders, arrows, headings or text except the small rib numbers 1–12. Each numeral is next to exactly one real rib. Draw the entire thorax within clear transparent margins; landscape canvas.

### Attempt 3 — rejected

Precise-object-edit of this exact graphite thorax plate. Preserve the ten long outer rib arcs on each side (seven individually meeting sternum plus three joining costal margin), preserve sternum, heart and lungs, their proportions and graphite medium. Correct ONLY the lower two rib pairs and remove numbers/background. There must be TWELVE ribs per side TOTAL. Current plate has an erroneous extra short inner pair beside the low spine: REMOVE that extra pair of small downward-curving inner tusks (the left ends near x560 y910 and the right near x965 y910 on a 1536x1024 image). Keep ONLY the outer numbered11 and12 on each side as floating ribs. Ensure each of those four ribs has a continuous full shaft that traces all the way FROM its BACK joint at one of the last TWO thoracic vertebrae, curving outward to the side and around to its free FRONT tip. Show both posterior attachments per side clearly and without a gap. No isolated pieces, no extra short inner branches, no extra rib after rib12, no lumbar spine. Each side must contain only10 long arcs and2 shorter floating arcs, ALL twelve attached at their posterior ends to the thoracic spine. Remove every tiny numeral/letter from all ribs and leave clean pencil shading underneath. Remove the grey haze/gradient completely: genuinely fully transparent background between and around the specimen, no shadow, no paper. The full specimen fits within generous margins. No labels, arrows or added marks. Original scientific pencil engraving, neutral greys only, all anatomical lines sharply readable.

### Attempt 4 — rejected

Edit this anatomical plate with ONE precise correction: redraw ONLY ribs 11 and 12 on each side. Keep the TOP TEN long rib arcs on each side exactly unchanged, keep sternum, pale lungs and heart, spine and graphite shading. At the bottom, REMOVE the two lowermost outer sweeping rib arcs on each side: the ones with free tips at approximately (450,890) and (465,950) left, and (1080,890) and (1075,950) right in this 1536x1024 image. Their whole outer return arcs must disappear; the outer silhouette stops at rib10 and the open costal margin, above those tips. INSTEAD draw the two floating ribs per side as SIMPLE SHORT SINGLE CONNECTED BRANCHES from the bottom TWO thoracic vertebrae in the exposed central opening. Left branches go from the LEFT side of the last two vertebrae outward and slightly down to two separated free tips inside the opening; right branches mirror them. Each is one continuous narrow curved bone growing straight out of its vertebral joint, NO gap at spine. They are short enough to end well INSIDE the lower opening, not at the outer border. Do not draw any second arc or long loop for these four short branches. Exactly TEN long arcs plus TWO short vertebra-attached branches per side =12. No other ribs, no loose pieces, no lines below the twelfth pair, no lumbar spine. Maintain same heart/lung/cage composition and fine neutral graphite pencil engraving. Transparent background with alpha, no paper, no shadow, no grey backdrop. No numbers, labels, arrows, or text. Make the four short branches and their spine connections clearly traceable.
