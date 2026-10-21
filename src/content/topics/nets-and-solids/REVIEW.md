# Nets and solids: review notes (22 October 2026)

Published (`status: published`) as a maths lesson. The spec is docs/39; this file lists what Gavin may want to look at or reverse. Every answer in the checks is proved by the engine's geometry (`pnpm validate`, `scripts/math/check-pool.ts`, `tests/math-scene/nets-and-solids-lesson.test.ts`), not by hand.

## For Gavin (a page of your daughter's textbook settles most of these)

1. **Chinese terms.** 立体图形（立体）、正方体、长方体、圆柱、圆锥、球、棱柱、棱锥、三棱柱、四棱锥、三棱锥、展开图、面、平的面、曲面、扇形、棱、顶点、底（底面）、相对的面. No Chinese term list for Singapore primary maths was found (S31 in sources.json says so); the words follow mainland primary textbooks and the measuring lesson's glossary (正方体, 长方体). Hong Kong writes 立方體 / 角柱 / 角錐 (S30); the lesson never does. If the school's Chinese materials say otherwise, the change is only in `data/glossary.json`, the chapters and the ZH strings of `data/lesson.json`.
2. **Syllabus 4.1 "2D representations"** is read as "nets" (docs/39 D3): the nets of a cylinder and a cone are only recognised (step 08 has beats and choices, never drawing or tapping). If the school reads 4.1 as drawings of solids from different sides, step 01 would need one more beat and two choice questions; the engine already draws solids.
3. **Cube and cuboid are two names, never one** (D9). Step 01 says a box with two square ends "is still a cuboid" and never that "a cube is a special cuboid". If the textbook teaches the second, one sentence in step 01 beat 3 would change.
4. **Edges and vertices are not counted** (D7; the syllabus has no such line). "Edge" is only the line a face folds along. Chapter 04 explains the 2 by 2 block with "only 3 faces of a cube meet at a corner"; "vertex" appears once, for the tip of a pyramid (chapter 07). No Euler, no surface area.
5. **Curved faces** (D8): a cylinder is "2 flat faces and 1 curved face", a cone "1 flat face and 1 curved face", a sphere "only a curved face". The checks only ask how many *flat* faces a curved solid has.
6. **Recognise only** (D15): the engine has no eyebrow over a chapter head, so chapter 08 says "Recognise only: …" / "只要认得：…" in its summary and first sentence instead.
7. **Contexts**: building blocks, a pencil box, a card box cut open, card models. No brands, no prices; the milk carton shaped like a triangular pyramid (S27) is one sentence in a More box in chapter 07, without the company's name (the source link still shows it).

## Decisions taken in the build that you may want to reverse

- **Pictures**: the cover and the two chapter figures are the three drawings already in `art/planned/nets-and-solids/` (reviewed in docs/39 §6, D18), processed with `scripts/illustrate.ts`. Nothing new was drawn. If you would rather have no pencil drawings here, delete the two `<Figure>` lines in chapters 06 and 08 and the `illustration:` line in `topic.yaml`.
- **Every wrong option of a choice must name a misconception** (the engine's rule), so the name questions offer two names (cube / cuboid, prism / pyramid, cone / pyramid), and the solids in a "which of these is a cuboid / cube" question are all boxes (those two are "choose all").
- **No square prism in the checks.** docs/39 planned a four-sided prism answered "prism" with "cube" diagnosed `cube-cuboid`; a prism on a square base is a cuboid, so the question would have two right names. Step 07 uses a second triangular-prism net and a triangular pyramid instead.
- **"Which one is not a net?"** (docs/39 step 04) is asked as "Only one of these folds up into the cube. Which one?" (the engine checks a picture option by folding it: right ⇔ it folds).
- **Step 06's number question** asks for the longer side of the missing end rectangle (2 squares); 3, the box's length, is diagnosed `face-size`.
- **Step 08 beat 3** shows the "once round the circle" measure appearing (`shade`), not a fold to 0.6 and back (one fold per beat, docs/39 §9.1).
- **The two "how many flat faces" questions** (step 01) file their wrong numbers under `face-count` (the closest code; the feedback says which face was counted wrongly).
- **Step 01 has 10 checks**, one more than planned (the pool may hold 8–10).
- **Practice q6** is the box with no lid whose bottom is at the far end of the row (mirror of the step's own question).

## Engine notes for the main session (not changed here)

- A choice option written as plain text (the flat-face counts "1 / 2 / 3") is not checked by validate; `tests/math-scene/nets-and-solids-lesson.test.ts` checks those two questions against `flatAndCurved`.
- A sphere is always drawn as an outline: `tone` on its `surface` passes validate but is not painted (`stage/net/SolidSet.tsx`). Step 01 beat 4 colours the curved faces of the cylinder and the cone (hot) and leaves the sphere plain, so "a sphere has only a curved face" is said, not coloured. Either validate should refuse `tone` on a sphere or the stage should paint it.
- The candidate places of a net to complete can overlap (docs/39 §9.1); the lesson test checks that this lesson's places stay apart from each other and from the faces given.
