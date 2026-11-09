# i-b illustration send-backs · 2026-11-09

Only the five assigned compositions are changed. Original raster references are
retained here, never served by the application. Image generation used the built-in
image tool; chapter exports run `pnpm tsx scripts/illustrate.ts figure` through
`round2-io.ts`, followed by a strict 120,000-byte encoder. Covers at 800 px use a
90,000-byte ceiling. No noise filter or noise-texture fill is added.

- `steam-original.webp` → `steam-edit.png`: local graphite edits to the two fixed
  supports and the piston; the original is restored outside code masks. Additional
  code shading recesses the radius rod behind the outer link. The kinematic
  assertions concern the teaching model; the retained original is an illustrative
  projection, not a metric rendering of the model. The figure and both cover
  densities come from this one master.
- `power-original.webp` + `round2-guide.ts` → `power-edit.png`: original-style
  graphite rendering in a precise two-row, five-stage composition. Final SVG crops
  and positions exactly five groups, and draws exactly four directed arrows.
- `reclamation-original.webp` → `reclamation-edit.png`: only a code-masked region
  within the rock is replaced, making a broad horseshoe cavern with a flat floor.
  Fill, six drains, clay, sea and revetment remain from the original.
- `clock-original.webp` → `clock-underdrawing.png` → `clock-clean.png`: blank
  graphite material underdrawing, clipped into the two original exact code circles.
  The second pass removes the pocket watch from the material sample, avoiding a
  repeated watch fragment when sampling it for the small dial. All 60 ticks, twelve
  real numerals, centre pins and exact 305°/60° hands are drawn in code, at the
  original positions and sizes. The rejected two-clock material is retained only
  as a prompt reference and is not embedded in the finished artwork.

The final production prompt specifications are recorded in `prompts.json`.
They specify the countable facts above and these bans:
**NO text, NO characters, NO inscriptions, NO floating parts, NO eye-like shapes,
NO zigzag break lines, NO paper texture,
NO noise-texture fills.** Clock underdrawings additionally forbid hands, numbers,
ticks and screws, because those are supplied by code. The power render forbids
arrows, which are also supplied by code. Local-edit prompts explicitly preserved
all other original drawing, proportions, pivot centres and materials.

Reproduce the selected assets:

```sh
pnpm tsx scripts/figures/steam-engine-parallel-motion.ts
pnpm tsx scripts/figures/circuits-power-chain.ts
pnpm tsx scripts/figures/singapore-land-use-reclamation-section.ts
pnpm tsx scripts/figures/telling-time.ts
pnpm tsx scripts/figures/review-i-b-round2.ts
```

Offline previews: `/tmp/atlas-i-b-round2/previews`. The review script simulates the
actual multiply / inverse-contrast-screen CSS, verifies margins, 60% bounding-box
fill and budgets, and produces 420 px comparisons with the retained A-grade
series/parallel plate, plus native 2× paper/cinema images and detail crops. None
of these subjects uses brightness to encode physical illumination; all retain the
normal theme inversion. No browser or desktop is used.

No round-two deletions are needed. The original unused-image cleanup was already
accepted: b200-cpu-tray, b200-power, b200-gpu-tray, plant-chilli-life-cycle,
plant-leaf-cross-section, plant-stoma and water-johor-river are absent. They remain
absent; no accepted illustration, compression-only asset or other owner's image
is changed.

Final verification: `pnpm check`, `pnpm validate` and `pnpm build` passed.
The full suite passed all 275 files / 6,523 tests with
`pnpm run test --maxWorkers=4 --minWorkers=1 --testTimeout=30000`.
The default test run encountered existing geometry/climate timeouts and worker
contention; no tests or assertions were skipped or modified. The final build has
191 pages; all seven built raster hashes match their delivered source files.
Logs and the size/hash report are in `/tmp/atlas-i-b-round2`.

## Acceptance (2026-11-09)

- Accepted: steam-engine-parallel-motion (figure, cover 1× and 2×) and
  singapore-land-use-reclamation-section. At acceptance the cavern patch was
  scaled 0.8 about its floor centre so the roof sits under a thick band of rock,
  and it is laid in through a feathered horseshoe matte instead of a hard mask.
- Sent back and reverted to the previous rasters and captions:
  circuits-power-chain and the telling-time cover. Their round-2 sources
  (power-edit, clock-*) and `round2-guide.ts` were removed; see the acceptance
  commit message for the notes.
