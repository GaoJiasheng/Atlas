# Brief: draft the English chapter text of one fractions lesson step

(Brief used for the fractions topic; copy it to `scripts/math/drafts/TEXT-BRIEF.md` and change the topic details.)

The Atlas fractions topic is an explanation-first lesson for Singapore P2–P3 children (MOE 2021 syllabus).
Each chapter (a step) is told on the stage in 3–5 **beats** (`lesson.json` → `steps[].beats`: a model on the
stage + a caption + a number sentence). The reading panel shows the chapter text next to the stage. The text
must TEACH: it walks through the beats in order, explains why, names the common mistake, and ends with one
sentence that introduces the chapter's short check. The check itself is not in the text.

## Read first (do not edit any of them)
- `CLAUDE.md` (hard rules), `docs/15-fractions-content-spec.md` §1.3 (syllabus per step), §2.2 (misconceptions), §5 (writing rules, terms)
- `src/content/topics/fractions/data/lesson.json` → the step's `beats` (captions, equations, models) and `keyFacts`
- the chapter's current file `src/content/topics/fractions/chapters/<NN>-<step>.mdx` (the old text: keep its good
  explanations, its `<Term>` uses and its `<More>` box if it has one; drop every `<Task>` it has)
- `src/content/topics/fractions/data/glossary.json` (valid `<Term id>` ids)

## Write
The English body only — what goes between `<Lang en>` and `</Lang>` — to the output file you are given.
- 250–350 words of running text. An optional `<More title={{ en: "…", zh: "…" }}>` box goes BEFORE the final
  check sentence; it does not count and stays ≤ 120 words.
- Open with one or two sentences linking to what the reader already knows (the previous step).
- Then one short paragraph per beat, in beat order. In each, link the beat once:
  `<Beat n={2}>fold it in half again</Beat>` (n = the beat's 1-based number; the link text is a short phrase
  of the sentence, not "click here"). Say what to look at on the model and WHY it works.
- Name the common mistake of this step (docs/15 §2.2) and why it is a mistake, in one or two sentences.
- End with exactly one sentence introducing the check, linking the step id:
  `When you are ready, <Task id="<step-id>">try one question</Task> on …` (vary the wording; one `<Task>` only).
- Fractions are `<Frac n={3} d={4} />` (mixed: `<Frac w={1} n={3} d={4} />`); never "3/4" as plain text.
  First use of a glossary word: `<Term id="…">word</Term>`.
- Tone: calm, direct, second person; short sentences a P3 child can read; no exclamation marks; never "easy",
  "simple", "wrong" (say "not quite", "a mistake"); no praise words; British/Singapore spelling (colour, centre).
- Keep the MDX valid: blank line between paragraphs; no headings; no lists longer than 4 items.

## Check
Count your words (running text, excluding the `<More>` box and the tags) and stay within 250–350.
Edit no other file.
