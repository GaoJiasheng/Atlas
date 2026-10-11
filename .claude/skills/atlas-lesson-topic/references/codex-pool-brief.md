# Brief: draft check-pool tasks for one step of the Atlas fractions lesson

(Brief used for the fractions topic; copy it to `scripts/math/drafts/BRIEF.md` and change the topic details.)

You are drafting **new practice-check tasks** for one step of a Singapore primary maths lesson on fractions
(MOE 2021 syllabus, P2–P3; step 12 is a P4 bridge). The site explains first; at the end of each chapter
ONE task is drawn at random from that step's `pool` of 8–10 tasks as a short check. You draft the extra
pool tasks so every pool reaches 10. Same idea as the step, varied numbers, models, contexts and distractors.

## Read first (do not edit any of these files)
- `src/engines/math-scene/schema.ts` — the zod schema. A task = `taskSchema` (kinds shade, cut, fold,
  split, merge, place, compare, order, choose, input, build-sum). Fractions are strings: "3/4", "1 3/4", "2".
  NO `example` field exists any more.
- `src/engines/math-scene/lib/check.ts` — how answers are checked and how wrong answers are diagnosed
  into misconception codes (only codes the task declares in `feedback.wrong` / choose options are used).
- `src/engines/math-scene/lib/solve.ts` — `solve()` (the right moves) and `sampleState()` (the notation of
  `feedback.wrong[].sample`: input "5/14" or "1 3/11" or several "11/12,8/9"; shade "3" = parts marked
  from the left; place "5" = intervals from the start; compare "<" "=" ">" or "a"/"b"; order "1/2,3/4,3/8";
  cut "4,9" = grid positions; choose "b" or "a,c" (option ids); split/merge "x2"; in a multi-part task
  (shade/fold/split/merge with `then`, build-sum) a sample starting with "=" is the WRITTEN answer after
  the earlier parts were done right, e.g. "=5/14").
- `src/engines/math-scene/validate.ts` — content rules (`taskIssues`, `targetIssues`, `feedbackIssues`).
- `src/content/topics/fractions/data/lesson.json` — the step you work on: its existing `pool` tasks are
  the worked examples of the format, tone and Chinese terminology. Copy their style.
- `docs/15-fractions-content-spec.md` §2.2 (misconceptions), §2.3 (this step's design), §5 (writing rules).

## Rules
- Output: a JSON **array of NEW tasks only** (do not repeat the existing pool tasks), written to the file
  named in your instructions, pretty-printed, UTF-8. No comments, no extra keys.
- Every `id` kebab-case, starting with the prefix you are given, unique.
- Denominators 1–12. Steps 01–11: every fraction ≤ 1 whole, sums/differences within [0, 1];
  steps 10–11: the two denominators are related (one a multiple of the other), different.
- Text fields are bilingual `{ "en": ..., "zh": ... }`. Fractions inside text are tokens `{3/4}`, `{1 3/4}`.
  `prompt` EN ≤ 120 characters, ZH ≤ 40 characters (a token counts as 1). `guide` 1–3 sentences.
  `hints` 1–3 levels (where to look → which method → almost the answer).
  `feedback.correct` says "Yes." / "对。" plus WHY. `fallback` starts "Not yet." / "还没对。" and says what to look at.
  `reveal` explains the right answer. Each `feedback.wrong` entry: `when` (a misconception code from the
  schema), `say` (the specific reason + where to look), and a `sample` wrong answer that the checker
  diagnoses as exactly that code. Wrong `choose` options carry `misconception` and the task has a
  `feedback.wrong` line for that code (a `sample` = the option id).
- Tone: calm, second person, no exclamation marks, never "wrong"/"错", no "great job", no emoji.
  Singapore contexts used sparingly (kaya toast, kueh lapis, prata, pandan cake, chocolate bar, ribbon,
  bottle of water), multi-ethnic names (Mei Ling, Aisha, Ravi, Wei Jie, Siti, Arjun, Hui Min, Daniel).
  Chinese is natural Singapore/mainland primary-maths Chinese, not word-for-word; use the terms already in
  lesson.json (分子, 分母, 等值分数, 最简分数, 平均分, 数轴, 带分数, 假分数 ...).
- Vary: numbers, model kinds (bar / circle / numberline where the kind allows), objects, task kinds
  that fit the step's idea, and which misconception each task targets. Plan at least one diagnosable
  wrong answer per task where the kind allows it.

## Verify (mandatory)
Run `pnpm -s tsx scripts/math/check-pool.ts <your-file>` (add `--bridge` for step 12). It parses with the
schema, applies the content rules and proves each task (solution checks right, starts unsolved, every
sample and wrong option diagnosed as declared). Fix or replace tasks until it prints `0 error(s)`.
Warnings about prompt length must also be fixed. Do not edit any file other than your output file.
