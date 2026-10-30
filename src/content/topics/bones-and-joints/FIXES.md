# bones-and-joints · FIXES for Codex (browser acceptance 2026-10-27)

Browser acceptance found four items that need rework rather than a small fix. Screenshots: `pnpm shoot bones-and-joints --beats` (en-paper, 1920×1080) and deep links at 1600×900 against the build of this branch. Everything else listed under "already fixed" is on the branch.

## Rework completed for main-session browser re-verification

F2–F5 were implemented in the earlier pass below. F1 remains reopened and withdrawn; see the final section. Earlier non-browser checks are recorded in docs/57 §9.5. Browser gates were skipped as instructed; implementation completion is not a new browser acceptance claim.

### F1 · REOPENED · Protected-organs figure count and floating-rib attachment

`public/illustrations/figures/bones-and-joints-protected-organs.webp` (chapter 02, both locales). Counting the costochondral seams and free tips on each side from the top: 7 ribs reach the sternum, 4 join the costal margin and 3 end in free tips, so 14 ribs per side. FIGURES.md records "12 per side", which is wrong. The caption on 01-02 and the chapter text say twelve pairs.

Expected: exactly 12 per side (7 true ribs to the sternum, ribs 8–10 to the costal margin, 2 floating ribs 11–12 with free tips), heart and lungs inside, sternum in front, thoracic spine behind. Count the result seam by seam and mark it up before accepting. Do not rely on the prompt. Update FIGURES.md with the real count and method.


**Earlier pass, acceptance withdrawn:** Replaced the figure using three built-in image-generation calls and counted twelve ribs per side, but missed detached posterior ends on ribs 11–12. The 24-marker overlay in `scripts/geo/bones-and-joints/rib-count.svg` belongs to that withdrawn image. It does not establish correct posterior attachment. See the reopened item and current review in FIGURES.md.

### F2 · DONE · Part details are reviewer notes, not student text

`data/parts.json` → every `detail` (61 parts × EN/ZH). The bone details are the one-line summary plus pipeline boilerplate ("This selectable region contains one named source structure. The source shape is retained at adult reference scale; the model selection count is not a count of individual bones."). The specimen, muscle and tendon details read "attachment-face medical review remains pending", "no surface-accuracy approval is claimed", and similar.

Expected: 2–4 sentences per part that a P4–P6 reader learns something from, written the way heart-and-lungs and digestive-system write theirs: what it is, what it does, one notable fact, and a short model note only where the model really differs (for example "the hand bones are one selectable group here; a hand has 27 bones"). Keep the BY-SA boundary: write independently; do not copy OpenStax wording into parts.json. Pending-review status belongs in REVIEW/AUDIT, not in the reader's detail card.


**Done:** Rewrote every one of the 61 selectable EN/ZH detail cards as 2–4 plain student sentences; also rewrote the skin context card. Original wording lives in `scripts/geo/bones-and-joints/details.mjs`, imported by the existing content generator. Source references remain, with attachment sources S32/S33 added where relevant. Source grouping, adult scale, inherited rig and pending medical review notes are preserved in AUDIT.md.

### F3 · DONE · Teaching specimens are below the technical-plate bar and partly misleading

These are original primitives, so they can be rebuilt freely (they are not the Z-Anatomy packet).

- **Bone section (02-02…05, 06-01…03, station x=+2).** The cortex is a ghosted tube that is almost invisible even when it is selected. The spongy bone is about 16 loose white sticks that do not read as a lattice. The marrow is a single yellow capsule in the shaft, with no red marrow in the spongy ends, while 02-04's caption says red marrow makes blood cells. The vessel is a red bent pipe. Selecting a part does not visibly change it. Expected: a cut-open long bone with a readable thick compact wall in section, dense trabecular ends, red marrow in the spongy ends, yellow marrow in the medullary cavity, periosteum, and a nutrient artery passing through the cortex. Use the same cutaway language as the other SpaceScene specimens. The default camera leaves the specimen at about a third of the stage height, so frame it.
- **Generic synovial joint (03-02…04, station x=−2).** The articular cartilage is two flat floating discs between two capsule-ended rods, with a gap to each bone end, so the cartilage does not cover the bone surfaces as the caption says. The ligaments are two yellow sticks. Expected: two bone ends with cartilage caps that follow their curvature, a joint cavity with synovial fluid shown, a capsule enclosing it, and ligament bands crossing it outside the capsule. The camera is so tight that the bones run off the top and bottom of the frame.
- **Repair specimens (06-04).** Four capsule pills tinted brown/blue/white. No fracture line, haematoma, callus or remodelled outline can be read. Expected: four bones of the same shape side by side, with a visible break and clot, then soft callus, then hard callus, then a remodelled bone that has a slight bulge. Order them left to right, with no time scale.


**Done:** Rebuilt original specimens in `scripts/geo/bones-and-joints/specimens.mjs`, imported by `scripts/anatomy/bones-joints/content.mjs`. The section has a thick closed cut wall, hatched section faces, periosteal flap, connected end lattice, red/yellow marrow and branching nutrient artery through a cut-lip entry. The joint has attached curved cartilage caps, a cut-open capsule with lining and fluid, and external bands. Four matching long-bone specimens show break/clot, soft bridge, hard bridge and smoother remodelled outline. Reframed the section, joint and repair row; removed the redundant capsule ghost. Inspected generated geometry with offline CPU previews; runtime appearance remains for main-session review.

### F4 · DONE · Lever station: pivot not marked

05-04…06 (x=+4). After this pass the equivalent-pull and load arrows are visible (see below), but the pivot has no marker, and the muscle attachment point 0.04 m from it is not shown. Expected: a small fixed pivot (a hinge or a triangle), a tick or dot at r = 0.04 m, and optionally a dimension line for the load arm. These should be static parts, not a new engine feature.


**Done:** Added a fixed hinge pin and triangular stand as unselectable `lever-pivot` context geometry, plus a signal dot and transverse tick on the beam at r = 0.04 m. Existing lever-mode visibility includes the pivot; the dot follows the existing beam rotation. No new engine feature or selectable part was added.

## Already fixed on the branch (acceptance commit)

- Force arrows were hairlines: the overlay's thickness scaled with `per` = 0.001 m/N, giving a 0.06 mm shaft. Added an optional `width` field to `force-vectors` (engine, additive, tested). The bones overlay now uses `width: 0.06`, and the load arrow is drawn from the cube's bottom (`at: "bottom"`) instead of from inside the cube.
- Labels never appeared on a fresh load or deep link in the normal HUD (anchors stayed `shown: false` until the first hover). PartNode now requests one more frame when a part's visibility flips, so the label probe sees the change.
- Cameras: 01-05 (bone shapes) was framed for the whole body; 04-01 (plane), 04-03 (pivot), 04-04 (MCP) and 04-05 (thumb CMC) left 2–5 cm bones as specks or off-centre. All are reframed on the actual specimen bounds.
- CPU preview PNGs (730 KB) moved to the ignored `scripts/anatomy/cache/bones-joints/previews/`, matching the six-region pipeline. The doc references were updated.
- 05 "Arrows and attachments": double full stop.

## F5 · DONE · Existing engine issue: skinned label stays at rest on elbow-only deep link

Original reproduction: bones 04-02 and 05-02/03, and muscles-arms ch04 b1 (`ulna`) on main.

**Done:** Kept the existing sampled skinned-bounds calculation and six-frame cadence. After a successful measurement, request one more demand frame so the label probe (which runs before PartNode) reads the final anchor. Extracted that calculation into `skinAnchor.ts` for a focused unit test using the real `muscles-arms.glb` ulna and an elbow-only snapped pose; it verifies the next-frame anchor, bounds and unchanged joint rotation. No pose, camera, picking or other engine behaviour was changed. Main session rechecks the browser deep link.

## Final non-browser gates

`pnpm check`, `pnpm validate`, `pnpm test -- --maxWorkers=2 --testTimeout=30000` (4,382/4,382), and `pnpm build` all pass. Full results and remaining main-session browser checks are in docs/57 §9.5. No git writes, package/lockfile edits or review-queue edits.

## F1 reopened (2026-10-27, main session)

The redrawn protected-organs figure counts 12 ribs per side, but ribs 11–12 are drawn as loose pieces beside the spine, not joined to the vertebrae. Floating ribs are free at the front only; at the back they join the thoracic vertebrae. The figure is withdrawn from chapter 02 (both locales) and its webp removed until it is redrawn with ribs 11–12 attached to the spine. Redraw is queued for Codex.

### Redraw outcome (2026-10-29) — still open after four attempts

Used all four permitted built-in `image_gen` calls in graphite-plate style. Rejected attempts 1–2 for extra ribs; rejected attempt 3 for the lower costal-margin/attachment geometry. Attempt 4 has ten long outer arcs per side and one clearly spine-attached pair with free anterior tips; the higher posterior branch disappears under the costal margin, so both floating pairs cannot be traced to free front tips. Independent second-agent inspection agrees that neither attempt 3 nor 4 passes. Heart/lungs, sternum and posterior spine alone are insufficient for acceptance.

The last candidate was processed with `scripts/illustrate.ts figure`, inspected, and moved out of `public/` into the local review directory. Its 129,548 B / 1200×900 WebP also exceeds the existing 120 KiB target at q58. No accepted image exists, so the two `<Figure>` uses and dependent e2e image assertion remain withdrawn. No fifth generation call or anatomy edits by script were made.

All four source PNGs, exact prompts and a processed review WebP are staged under this worktree's gitignored `art/planned/bones-and-joints/`; the main-checkout art directory is outside writable roots and was not overwritten. Counts, failure locations, hashes and verbatim prompts are in FIGURES.md. A further redraw remains necessary before restoring the chapter and e2e check.

Current non-browser gates: `pnpm check` (0 errors/warnings), `pnpm validate` (85 topics, 0 errors/warnings), `pnpm test` (219 files; 5,448 tests passed) and `pnpm build` (173 pages) pass. `pnpm shoot` and `pnpm e2e` were skipped as requested; no browser/desktop was opened. No engine, package/lockfile or git writes.
