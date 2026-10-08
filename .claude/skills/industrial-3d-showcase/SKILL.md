---
name: industrial-3d-showcase
description: Build a portfolio-grade interactive Three.js 3D showcase in the "technical plate" style — warm ivory paper background, procedurally modelled machine/product/creature, hairline engineering HUD (spec table, schematic card, three bottom panels, two-column leader labels), eased camera presets, cutaway / X-ray / exploded / flow / thermal / reference / presentation modes, Playwright screenshot QA and a 4K60 performance budget. Use this whenever the user wants an interactive 3D visualization, cutaway, exploded view, product viewer, engineering showcase, museum-style exhibit or "concept design viewer" of any machine, industrial product, vehicle, creature or megastructure — e.g. "做一个 XX 的 3D 剖视展示", "复刻这台设备的交互式 3D 模型", "像燃气轮机/沙虫那样的 3D 展示页", "Three.js showcase of a turbine / CDU / robot", or when they hand over reference photos of equipment and ask for an interactive 3D page — even if they never say "showcase" or "technical plate".
---

# Industrial 3D Showcase — Technical Plate style

This skill distills three finished projects that shared one generation logic:

| Exemplar | Subject kind | Facts | Delivery |
|---|---|---|---|
| SANDWORM MK-X | fictional mechanical creature in a dune environment | invented, internally consistent | single HTML, 1080p60 |
| MHI gas turbine | real rotating machinery, from expo photos + official cutaways | REFERENCE STUDY, no invented model specs | single HTML, 4K60 |
| Eaton/Boyd ROL4000 CDU | real enclosed product, from official product photos | strict FACT / REF / RECONSTRUCTION / SIMULATED tagging | HTML + ES modules + photo decals, 4K60 |

What they have in common is the target of this skill: **a page that looks like an engineering museum placard printed on warm paper, with a physically believable procedural model in the middle, and every control actually working.** It must never read as a Three.js demo, a game asset or a cyberpunk UI.

## Workflow

Work autonomously once the intake is settled. The packs that produced the exemplars all said "don't stop at the plan, don't ask round by round" — the quality came from many build → screenshot → compare → fix loops, not from discussion.

### 0. Intake (one question at most)

You need five things. Infer them from the request; ask once, in a single message, only for what is genuinely missing:

1. **Subject** and its working principle (what moves, what flows, what is inside).
2. **Real or fictional.** Real → read `references/fact-discipline.md` before writing any number on screen.
3. **References** — a folder of photos / video / official images, or none. User field photos outrank official images, which outrank inference.
4. **Target** — 4K60 with 1080p regression (default), or 1080p60 for heavy environment scenes.
5. **Output** — project directory and HTML file name (default: `<slug>/<slug>.html`).

### 1. Look before coding

Open every reference image. For video, extract frames (`ffmpeg -i in.mp4 -vf fps=1 frames/f_%02d.jpg`) and look at them. Note proportions, silhouette, what is visibly cut away, colours, and what cannot be confirmed. If an official-image fetch fails, keep going with what you have and record the gap.

### 2. Write the brief — `BRIEF.md` in the project root

Copy `assets/brief-template.md` and fill it for this subject. The brief is the durable spec every later round checks against: identity block, spec table (with source tags if real), reference index, archetype and mode list, camera list, label list, HUD panel content, functional colour coding, budgets. Pick the archetype from `references/archetypes.md` — it decides which modes, panels and cameras make sense. Keep it to what the build needs; it is not a report.

Then read `references/master-spec.md` — the merged master prompt of all three projects — and build to it.

### 3. Build v1 fast

Start from `assets/starter.html` (copy it, then rewrite freely). It already implements the layout contract, HUD scaling, two-column leader labels with occlusion fade, eased camera presets with FREE-camera handover, eased mode amounts, button ↔ keyboard sync, perf readout and the `window.__showcase` test API. Replace the demo subject with the real procedural model. Get a complete, running version with every control wired before polishing anything.

### 4. Refinement rounds

Run the rounds in `references/rounds.md` in order without waiting for the user. Each round has a scope fence ("only geometry", "only HUD") so that fixing one layer doesn't regress another. Every round ends the same way:

1. save; 2. `python3 <skill>/scripts/shoot.py <html>` (screenshots + console + renderer stats); 3. look at the shots next to the references; 4. list concrete differences and **fix them directly** (a gap list is not a deliverable); 5. re-shoot; 6. confirm nothing earlier regressed.

### 5. Final report — `reports/final-report.md`

Before writing it, grep the page for starter leftovers (`STARTER SKELETON`, `TP-DEMO`, `DEMO MACHINE`, `buildSubject`) and remove them. Then report: measured resolution(s), average FPS, 1% low (only if reliable), draw calls / triangles / geometries / textures per main view, GPU string (say plainly if it was SwiftShader / software), implemented features, what matches the references best, remaining gaps, optimizations applied, and — for real subjects — which parts are fact vs reconstruction vs simulated. End with the run command and the screenshot paths.

## Non-negotiables

These recur verbatim across all three projects. Details live in `references/master-spec.md`; this is the checklist.

**Visual grammar**
- Warm ivory / paper ground (`#EDE6D8`, `#E7E5DF`, `#E7E6E2` family); scene fog colour = paper colour so the model prints onto the sheet. Explicit `background` on body and scene.
- Graphite ink (`#292A28`–`#2A2824`) hairlines 0.5–1 px; small uppercase labels, wide tracking (.07–.16em), technical sans + mono numerals.
- At most two low-saturation functional accents, each with one meaning (e.g. cold steel-blue vs hot amber→oxide red; signal orange vs X-ray cyan).
- Banned: neon, cyberpunk, blue-purple glow, strong bloom, lens flare, dark full-screen backgrounds, game/hex HUD, scanlines, Three.js default grey plastic, random greebles added "for complexity".
- With the HUD hidden (`H`) the hero frame must stand alone as a product photograph.

**HUD layout contract** (identical in all three exemplars)
- Top bar: brand / doc-ID, camera buttons, mode buttons, a status line (`HERO VIEW · RUNNING · CUTAWAY 50`) and a key hint.
- Top-left: title, subtitle, bilingual `dl` spec table pressed directly onto the canvas (no heavy card).
- Top-right: one schematic SVG card (process chain, cross-section or loop diagram) that highlights with the current view/mode.
- Bottom: three equal-height panels — (1) longitudinal / architecture section with numbered zones, (2) typical-detail drawing, (3) live cycle/state panel synced to the animation.
- 3D leader labels in a left and a right column, thin leader to a projected anchor, re-projected every frame, faded when the anchor is occluded or behind the camera, never on top of a panel; fewer labels in close-ups.
- Bottom-right, quiet: `FPS · DRAW CALLS · TRIS · RES`.
- English + Chinese on every label (EN line, CN line beneath, museum-placard style).
- Responsive: 4K, 1440p, 1080p, 720p without overlap or overflow; narrow/phone keeps viewer + controls and drops detail panels.

**Interaction contract**
- 6–8 camera presets, 1.4–1.8 s easeInOut, never cutting through the model; dragging switches to `FREE CAMERA`, any preset reclaims control; one slow ORBIT preset.
- Modes as the archetype needs: X-RAY (~0.3 s fade), EXPLODED (~2 s, assembly-logical axes), CUTAWAY (continuous 0–100), FLOW, THERMAL (~0.6 s), REFERENCE / inspection (~2 s: pause, align, hide flow, inspection banner; press again restores), PRESENTATION (~75 s scripted, HUD fades to title), PAUSE, HIDE HUD.
- Keys: `1–N` presets, letter per mode, `SPACE` pause, `H` HUD. Buttons and keys update one state object; button `.on` classes are always derived from it. Meaningless mode combinations are disabled explicitly, not left to produce odd visuals.

**Model rules**
- Everything procedural — no GLTF/OBJ/FBX. Every part has a mechanical or functional reason to exist; no random detail.
- Repeated parts (blades, bolts, panels, rings, plates) are `InstancedMesh`; static parts merged per material; LOD for micro detail.
- Cutaway keeps 40–55% of the casing with a visibly machined cut face, not "half the model deleted".

**Performance** — draw calls ideally < 100, cap ~150; visible triangles ~0.4–1.5 M; pixel ratio clamped (`min(dpr, 3840/innerWidth, 2)`); no per-frame allocation; only big parts cast shadows; FLOW adds < 10 draw calls. Read `references/perf-lessons.md` before optimizing — it lists what actually moved the numbers.

**Test API** — expose `window.__showcase` exactly as in `assets/starter.html` (`ready`, `presets()`, `modes()`, `keymap()`, `setPreset(id,{instant})`, `setMode(id,on)`, `setPaused(on)`, `setHud(on)`, `state()`, `stats()`, `benchSync(n)`, optional `seekPresentation(t)`). Buttons carry `data-preset` / `data-mode` and toggle `.on`; HUD panels carry `data-hud-panel`; leader labels have class `co`. `scripts/shoot.py` depends on these.

**Honesty** — no invented specs presented as official; headless FPS never quoted as GPU FPS; no TODO, placeholder text, dead controls or unused code in the delivered page.

## QA script

`scripts/shoot.py` serves the project directory on localhost and drives the page through `window.__showcase`:

```bash
S=<skill-dir>/scripts/shoot.py
python3 $S proj/thing.html                       # one shot per preset + per mode → proj/shots/
python3 $S proj/thing.html --size 3840x2160 --suffix _4k
python3 $S proj/thing.html --shots shots.json    # custom shot list (see --help)
python3 $S proj/thing.html --keys                # every key/button toggles state and .on class
python3 $S proj/thing.html --layout              # HUD overlap/overflow at 3840/2560/1920/1280/900px
python3 $S proj/thing.html --perf --size 3840x2160 --json proj/reports/perf-4k.json
```

It prints console errors/warnings, draw calls, triangles and the WebGL renderer string. If the renderer is SwiftShader, report performance as architecture metrics only.

## Delivery variants

- **Single HTML** (default): Three.js via import map from `cdn.jsdelivr.net/npm/three@<ver>/`, all geometry and textures procedural (canvas/DataTexture), runs from a local static server.
- **HTML + modules + assets**: only when real photo decals/textures are wanted or the file grows past ~150 KB. Keep modules small and feature-organized (`core/`, `parts/`, `viz/`, `app/`); consider vendoring three.js for offline use.
- **Claude artifact**: if the user wants it published, the CDN allowlist applies (jsdelivr is allowed, fonts only from Google Fonts) and the page must not depend on local asset files.

## Reference files

| File | Read when |
|---|---|
| `references/master-spec.md` | before writing v1 — the full generalized spec |
| `references/archetypes.md` | while writing the brief — choose modes/panels/cameras |
| `references/rounds.md` | after v1 runs — the ordered refinement rounds |
| `references/fact-discipline.md` | subject is a real product/machine |
| `references/perf-lessons.md` | before and during the performance round |
| `assets/brief-template.md` | step 2 |
| `assets/starter.html` | step 3 |
