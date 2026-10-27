# Bones and joints teaching plates

`specimens.mjs` builds the original long-bone section, generic synovial joint,
four repair stages and ideal-lever markers with the existing SpaceScene primitives.
`details.mjs` contains independently written EN/ZH student cards. Both are
CC BY-SA 4.0 with the geometry packet; no OpenStax wording or artwork is copied.

The source anatomy exporter remains in `scripts/anatomy/bones-joints/`.
That existing content builder imports these modules:

```sh
node scripts/anatomy/bones-joints/content.mjs
pnpm tsx scripts/geo/bones-and-joints/preview.ts
```

This rebuilds `parts.json` without exporting or changing the real anatomy GLB.
The teaching pieces retain their existing semantic ids (61 selectable parts).
The fixed hinge adds one unselectable `lever-pivot` context part. Its visibility
uses the existing lever-mode binding; the 0.04 m dot is geometry on the beam.

The section retains 200° of the compact wall with closed, hatched cut faces.
Its nutrient-entry notch, periosteal flap, connected end lattice, red marrow
lobules and yellow shaft marrow are schematic. Caps share their inner curve
with the joint bone ends. The capsule attaches above/below those caps; its
inner lining surrounds a separate fluid volume, and the bands lie outside it.
The repair row shares one long-bone outline, ordered clot → soft callus → hard
callus → remodelled bone, with no time scale.

`preview.ts` uses the runtime geometry builder and authored cameras, but paints
triangles offline on the CPU. Diagnostics stay in the ignored anatomy cache:
`scripts/anatomy/cache/bones-joints/previews/rework-{bone,joint,repair}.png`.
They check shape and framing, **not** WebGL materials, transparency, labels,
interaction, clinical accuracy or runtime performance. Browser gates remain
for the main session, as requested.

`rib-count.svg` is a manual count overlay on the final processed figure, with
12 separately marked ribs per side. It is review evidence, not a product asset.
The generation prompts, rejected attempt and final file hashes are recorded in
`src/content/topics/bones-and-joints/FIGURES.md`.
