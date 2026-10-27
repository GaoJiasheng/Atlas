# dinosaur-earth · fixes for Codex (browser acceptance, 2026-10-27)

Found in the browser acceptance (docs/47 §9.4). The small engine and layout fixes are already in place (see §9.4). The items below are the design and content rework that is left. Screenshots are local (`shots/` is not in git). To reproduce them, run `pnpm build`, then `pnpm shoot dinosaur-earth --beats --layout --locale en,zh --theme paper,cinema --gpu`, and open the named files under `shots/dinosaur-earth/<locale>-<theme>/`.

## 1. Inset labels collide and are too small to read

- **Seen:** `beat-fossil-atlas-2.png` (World view). The labels for "Collection 24178", "Chicxulub: modern locator" and "Singapore: modern reference" sit on top of one another. Inset labels are 10 SVG units, which is about 9 px on screen at 1920 × 1080 and smaller in the reader on phones.
- **Expected:**
  - Labels never overlap. Either resolve collisions, or show the reference labels only in their own regional view (or when they are highlighted).
  - Labels are at least 11 px on screen at every size.
  - `shoot --beats` still finds every highlighted id through `.ts-modern-label[data-id]`.

## 2. Inset card: two titles, and the host title is truncated

- **Seen:** at 1024 × 768 and 1920 × 1080 (any chapter):
  - The host card title "MODERN FIND LOCATIONS · TODAY 现代发现地点…" is truncated.
  - The inset then repeats its own title, "TODAY · Modern find locations", above the × button.
- **Expected:**
  - One title only.
  - Keep the × (hide inset) control, which `inset-visible` needs.
  - The host card title should fit or be shorter (for example "Modern finds · today").

## 3. Layers panel: the three inset views show as independent checkboxes

- **Seen:** at 900 × 1200 with the layers panel open, World, Southeast Asia and Mexico appear as three separate checkboxes, although they are mutually exclusive. "Across the Mesozoic" also repeats a button that is already in the inset.
- **Expected:** one view selector with radio semantics, or the views left in the inset only. The keys and the store stay shared, as now.

## 4. Source notes read as an audit log

- **Seen:** `data/sources.json`, for example S29, S64, S65, S66 and S67.
  - Every note ends with "Source-review date recorded in the spec: 27 October 2026; fixed data snapshots 26 October 2026 where stated".
  - Some notes carry pipeline jargon, such as "z>0 nearest-sample cells", "CRC/SHA", "DS01–DS03" and "nc archive contains 109 members".
  - I only fixed the run-together spacing (for example "spec:27October2026" and "about10km").
- **Expected:**
  - One or two plain sentences per source, saying what was taken from it.
  - The audit detail stays in `data/SOURCES.md` and `scripts/geo/dinosaur-earth/SOURCES-GEO.md`.
  - Readers are primary-school students.

## 5. Phones: where the evidence lives

- **Seen:** at 390 × 844 the reader now starts collapsed, as on every other TimeScene topic. Before, it opened by itself on load and on every beat, which squeezed the HUD into overlaps. The find map and the beat line show after READ. The bar's state line shows "SELECTED · MAP SAMPLE · Δ".
- **Expected:** if evidence should be visible on phones without opening the reader, design a compact on-stage evidence chip that passes `shoot --layout` at 390 × 844. The presentation already shows the evidence aside.
