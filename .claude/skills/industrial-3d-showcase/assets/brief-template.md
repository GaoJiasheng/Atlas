# BRIEF — {PROJECT TITLE}

> 本文件是后续每一轮的验收依据。只写构建需要的内容，不写报告。

## 1. Identity

| 项 | 值 |
|---|---|
| Title | {SANDWORM MK-X / MHI INDUSTRIAL GAS TURBINE / ROL4000-48U65} |
| Subtitle EN / 中文 | {…} / {…} |
| Chain line | {SECTION · SECTION · SECTION · SECTION} |
| Brand / org line (top-left of bar) | {ABRAXIS EXCAVATION INITIATIVE / TECHNICAL PLATE · REF. STUDY} |
| Doc ID (top-centre) | {AEI-SNDWRM-MKX-001} |
| Real or fictional | {real → fact-discipline.md applies / fictional} |
| Archetype | {1 rotating machinery / 2 enclosed equipment / 3 vehicle-creature-environment / mix} |
| Target | {3840×2160 @60 + 1080p regression / 1920×1080 @60} |
| Delivery | {single HTML / HTML + modules / artifact} → `{path}` |
| Style name | {SILVER FOUNDRY TECHNICAL PLATE / …} |

## 2. Spec table (top-left `dl`)

| KEY | 中文 | VALUE | Tag / source |
|---|---|---|---|
| {LENGTH} | {全长} | {1,312 m} | {FACT url / REF. / SIM / invented} |

（真实主体：每条 FACT 写来源 URL；来源冲突在这里列出，不偷偷选一个。）

## 3. References

| File | Shows | Priority | Used for |
|---|---|---|---|
| `ref/user/A.jpg` | {整体} | {highest} | {比例、切口形态} |

Cannot be confirmed from references: {list} → modelled as {RECONSTRUCTION / conservative inference}.

## 4. Sections (shared by model, HUD panel 1, exploded view)

| # | EN | 中文 | Key parts (Tier-1) | Moving? |
|---|---|---|---|---|
| 01 | {AIR INTAKE} | {进气} | {…} | {…} |

## 5. Modes (from archetype)

| Key | Mode | Behaviour for this subject | Duration |
|---|---|---|---|
| X | X-RAY | {…} | 0.3 s |

Mode combinations disabled: {…}

## 6. Cameras

| Key | Preset | Framing intent |
|---|---|---|
| 1 | HERO | {3/4, subject 70–80% width, interior + casing visible} |

## 7. Leader labels

| Side | EN | 中文 | One-line note | Anchor | Tag |
|---|---|---|---|---|---|
| L | {COMPRESSOR ROTOR} | {压气机转子} | {…} | {part + local point} | {FACT/RECON} |

## 8. HUD content

- Top-right card: {process chain / loop diagram / cross-section} — highlights {what, when}
- Panel 01: {…}
- Panel 02: {…}
- Panel 03: {cycle / state rows, synced to …}
- Status line pattern: `{VIEW} VIEW · {RUNNING|PAUSED} · {phase}`

## 9. Colour coding

| Meaning | Colour | Used in |
|---|---|---|
| Paper | {#EDE6D8} | background, fog |
| {cold air} | {steel blue #6E8796} | FLOW, THERMAL |

## 10. Animation

{rotor speed / locomotion cycle / panel opening / start sequence phases with timings}

## 11. Presentation script (~75 s)

| t | Chapter | Camera | Modes | Caption EN / 中文 |
|---|---|---|---|---|
| 0–8 | HERO | hero orbit | — | {…} |

## 12. Budgets

draw calls {<100 / cap 150} · triangles {0.4–1.5 M} · FLOW adds < 10 calls · pixel ratio clamp.
