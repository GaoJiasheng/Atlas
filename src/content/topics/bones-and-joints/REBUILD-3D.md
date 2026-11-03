# Bones and joints · geometry and figure rebuild

## Polish 2026-11-03

### Protected organs

Replaced the current thorax-only figure with an explicit-geometry technical
plate showing three protective structures: skull around the brain,
vertebral bodies/arches around the spinal cord, and rib cage around the heart
and lungs. The count-audited 040f192 rib construction is imported unchanged:
12 pairs; 7 true, 3 vertebrochondral false and 2 floating per side; every
posterior head remains at its own thoracic level and both floating tips remain
free. Sternum, costal cartilage, T1–T12 and the heart's anatomical leftward
position are retained. The spinal inset is a representative short segment.

Added numbered ribs and bilingual leaders, and wired the new topic-owned image
into both EN/ZH chapter-02 uses. Captions/alt text now also describe brain and
cord protection. `FIGURES.md` records the method, exact counts and file hash.
No image generation, model download or runtime network. The plate is
1200×900, 107,290 B versus 102,314 B before; the budget is 122,880 B.

References: the 040f192 construction; OpenStax A&P 2e §§7.2, 7.3 and 7.4
(cranial cavity, vertebral canal, thoracic attachments). Reference illustrations
were inspected; independently authored paths/meshes and prose are used.
Full links and licence separation are in `data/SOURCES.md`.

Acceptance (Claude, 2026-11-03): the cranial and spinal sections were redrawn
in the generator (cord now inside the vertebral canal, plus a top view; skull
with full vault section and mandible) and the thoracic spine ghosted behind the
sternum. See `FIGURES.md` § Acceptance redraw.

### Long-bone section, marrow and growth plate

The 2026-11-02 preview still showed a straight-sided, open-ended spool, a
capsule of yellow marrow, spherical red lobules and a regular rod grid. The
replacement follows a femoral silhouette: bowed shaft, oblique neck, offset
head, greater/lesser trochanters and unequal distal condyles.

`cortex-mesh.py` builds one continuous implicit outer surface, a thick shaft
wall thinning towards the epiphyses, an internal cavity, a coronal section
following the shaft's bow and an oblique nutrient foramen. Marching cubes,
Taubin smoothing and simplification produce a smooth closed cortical shell;
there are no overlapping shell seams at neck/shaft/condyle junctions. A thin
attached periosteal flap is included. The final part uses the generated mesh,
with no primitive stand-in.

The source anatomy GLB is untouched. `build-cortex.mjs` appends one original
29,664-triangle cortical/flap mesh and six repair/material meshes to a copy, preserving every source node,
mesh/accessor definition and binary byte. The copied model is 3,811,228 B,
contains 383,244 stored triangles including alternative specimens, and decodes locally
with a second GLTF implementation (51 mesh nodes, finite positions/normals).

Marrow now follows the bowed cavity with a variable contour; recessed red
marrow beds occupy the end spaces. Jittered connected open-cell trabeculae
replace the regular grid, with curved principal stress trajectories through
the neck. Four curved braces link existing lattice nodes to the cortical
wall; all eight brace roots were verified inside the generated cortical
material. Tapered vessels branch inside the cavity and enter at the cut-lip
foramen. The articular cap conforms to the head; its outward winding is
ray-tested. Distal coatings follow the condyles. The growth plate is an
oblique curved band at the head/neck boundary, replacing the flat blue disc.

The nutrient foramen is ray-tested against an adjacent intact cortex section;
the vessel centreline traverses its opening before branching in the cavity.

The cortex detail card adds one EN/ZH sentence identifying the femur shape;
no teaching number changed. All 61 selectable ids, both original context parts,
chapter/beat references, poses, rig, mechanisms, visibility and explode/cutaway
bindings are retained. Two uncounted tissue material skins add colour; the
parent stage meshes contain the same geometry for picking. All authored
hide/ghost/highlight states mirror the parent stages. References: OpenStax A&P 2e §6.3 and the existing
anatomy packet. The interior remains a qualitative enlarged teaching model,
not microscopic histology or a patient scan.

### Repair row and joint inspection

Rebuilt the four matching repair specimens as continuous implicit meshes with bowed shafts, slanting necks,
offset heads and distinct condyles. The first three show complementary fracture
surfaces cut through the actual bone volumes and medullary cavities, with irregular clot, soft bridge, or rough hard callus; the fourth has a
continuous smoother shaft and a small residual bulge. Existing left-to-right
stage order and absence of a fixed healing timescale remain. References:
OpenStax A&P 2e §§6.3 and 6.5 (existing topic sources). Inspected both row angles
and individual fracture close-ups. The generic synovial joint's attached
cartilage/capsule arrangement remains acceptable as a schematic and unchanged.

### Counts and offline verification

Counts use the runtime geometry factory for primitives and the published GLB
index accessors for the cortex/anatomy. Ghosted visible objects are counted.
No shadow-pass multiplier or GPU FPS is asserted.

| View / packet | Before triangles | After triangles |
|---|---:|---:|
| Long-bone section | 197,284 | 123,274 |
| Section with growth plate | 197,476 | 125,194 |
| Four repair stages | 51,796 | 40,000 |
| Generic synovial joint | 10,776 | 10,776 |
| Largest of all 40 authored beats | 292,092 | 292,092 |
| Stored GLB packet (including alternative specimens after) | 313,580 | 383,244 |

The repair reduction uses simplified continuous surfaces with smooth normals.
The stored GLB includes alternative specimens, not simultaneous visible objects. Every authored view stays below 350k. Section draws remain 6 merged
pieces; repair row 7 → 6. Large organic surfaces use smooth vertex normals;
small vessels use 12–16 radial segments and fine trabeculae 7. Irregular details
are merged by material, avoiding one draw per strut. The unchanged source rig
and mesh binary are covered by a preservation test; a raycast proves the
coronal window reaches the posterior cavity wall.

Offline previews were actually inspected in front, oblique and rear views,
head/marrow close-ups, four fracture close-ups, growth and joint views, plus
the full paper/cinema protection plates, a 360 px derivative and skull/rib
close-ups. Iteration removed intersecting primitive seams, corrected the cut
plane to follow the bowed cavity, contained end tissue behind the cortex,
smoothed voxel stair-steps, corrected the head-cap winding and replaced the
repair line/plates with actual non-planar fracture cuts. The remodelled bulge
is part of the shaft surface.

Preview directory (ignored, local):
`scripts/geo/bones-and-joints/previews/polish-2026-11-03/`.
Start with `contact-sheet.png`, `bone-head-close.png`, `bone-rear.png`,
`repair-stage-*-close.png`, `protected-organs-paper.png`, and
`protected-organs-cinema.png`. `before-bone.png` / `before-repair.png` preserve
the inspected baseline. Reproduction commands are in the generator README.

The requested figure and specimen geometry are implemented. The two uncounted
repair colour skins follow all authored states; generic manual per-part
hide/SOLO overrides do not inherit to these context surfaces. Adding that
inheritance requires engine ownership, which this task explicitly excludes.
Exploded/cutaway behaviour, poses, animation and mechanism data are retained.

Browser/desktop automation, e2e/shoot
and GPU measurements were not run because this task explicitly requires offline
verification and forbids opening a browser. Runtime browser acceptance belongs
to the following main-session review. No git writes, engine/shared-kit edits,
package/lock changes or review-queue/next-batch edits were made.

### Final gates

- `pnpm check`: exit 0; 0 errors, 0 warnings (four existing hints outside this topic).
- `pnpm validate`: 94 topics, 0 errors, 0 warnings.
- `pnpm test -- --maxWorkers=2 --testTimeout=30000`: 250 files, 6,343 tests passed.
- `pnpm build`: 191 pages; both locales use the new figure. The full suite ran
  after the build, avoiding a race in the JS-budget test's reads of `dist/`.
- `git diff --check`: clean. Original skeleton binary preservation, neutral
  figure pixels/budget, 24 rib attachments, cortical window/foramen raycasts,
  outward cartilage, 40 authored visibility states and local GLTF decode pass.

Built/public model and figure hashes match. Gate logs are in
`/tmp/bones-polish/{check,validate,test,build}-final.log`; offline architecture
counts are in `/tmp/bones-polish/counts-{before,after}.json`.
