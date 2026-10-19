# Measuring engine handoff — 2026-10-19

Completed in `/Users/gavin/work/atlas/.claude/worktrees/codex-measuring`, branch `wip/measuring-engine`, continuing WIP `c842cd9`. All requested gates pass. The fixture remains **draft**, with deliberately provisional bilingual text and captions. The formal `measuring` lesson was not authored.

Implementation commits: `5735f31` (interaction, validation, accessibility and layout), `78412c7` (ruler-endpoint magnifier), `742d460` (paired instruments use a common physical range). This report and the final acceptance record are committed separately. Every new commit has the requested Codex co-author trailer. No package.json or lockfile changes, other topics’ content changes, merge, or push.

## What exists

The inherited M1–M12 implementation is completed and verified:

- Compound quantities, exact conversion/comparison, `{u:…}` rendering and speech, and MDX `<Qty u="…" />`.
- A11 instruments: ruler, tape/metre rule/height chart/path, dial scale, graduated vessels, and two-pan balance; grouped instruments, broken/inset rulers, skipped stretches, two-unit scales, dual numbering, hidden labels, highlighted marks, counting arcs, magnifier, compound brackets and eye-level line.
- Slide, sweep, fill, tip, unroll, jump, zoom and morph transitions, with reduced-motion handling. Balance drawing is reusable for a future algebra engine feature.
- `read-scale`, `set-scale` and `count-intervals`; quantity comparison, ordering, choices and conversion inputs; solve/sample/proof/controller integration.
- `measure-reading`: 11 new misconception codes and four shared codes, with declared-feedback diagnosis and compound-concatenation precedence.
- MEASURE card, PLATE rows, straightened scale view and zero-reading background specimen. Tasks retain the existing chapter axis, reader order, redraw/skip and practice infrastructure.

Finishing work fixed the compressed tape’s pointer inverse, dial-gap snapping, missing vessel unit labels, undersized phone instruments, and a misleading jug comparison. Unit chips now inherit step limits. Bilingual instrument descriptions describe visible landmarks without calculating the reading; counting buttons avoid announcing unnumbered tick values, and balance buttons remain accessible. Validation also rejects contradictory balance targets, solutions requiring more than 12 weights, brackets starting away from zero, and grouped graduated scales with different physical ranges.

## Content-author data shapes

Author JSON uses ordinary numbers or decimal strings such as `"0.05"`. Internal millionth-unit objects are produced by parsing; do not author them directly.

Instrument example:

```json
{
  "kind": "instrument",
  "type": "jug",
  "unit": "ml",
  "sub": { "unit": "l" },
  "from": 0,
  "to": 2000,
  "major": 500,
  "minor": 50,
  "value": 1250,
  "brackets": [
    { "from": 0, "to": 1000, "label": { "en": "{u:1 l}", "zh": "{u:1 l}" } },
    { "from": 1000, "to": 1250, "tone": "signal", "label": { "en": "{u:250 ml}", "zh": "{u:250 ml}" } }
  ]
}
```

- Units: `cm`, `m`, `km`, `g`, `kg`, `l`, `ml`. Write a space between a number and its unit. `l` displays as **ℓ**; `ml` remains lowercase.
- Compounds: `"2 m 35 cm"`, `"3 kg 40 g"`, `"1 l 250 ml"`, `"4 km 50 m"`. Only these four families are accepted. Small parts must be below the conversion factor; the parser permits big parts through 99, while lesson limits normally restrict them to 9.
- With `sub`, `unit` is the **small** unit and every coordinate/value uses it. Thus a height of 132 is 132 cm, with `sub: { "unit": "m" }`. `sub.per` is optional and must equal the real factor if supplied.
- `major / minor` must be an integer from 1 to 10. Readings are on marks except an object endpoint in a step with `limits.nearest` (0.2–0.4 of a small part from the nearest mark).
- `pair` holds two instrument specifications; `set` holds three. Each needs a bilingual `label`. Graduated members must have the same range after unit conversion: 0–1000 ml and 0–1 ℓ are compatible; 0–1000 ml and 0–5 ℓ are rejected. Use matching vessel shapes/orientations for direct visual comparisons.
- Balance loads use `left: [{ "item": "papaya", "mass": 800 }]`; weights use `right: [{ "weight": 500 }]`. Masses and weights are grams. A weights task begins with the right pan empty and must have a solution using at most 12 weights.

Every task also needs its kebab-case `id`, `model`, bilingual `prompt` and `guide`, 1–3 bilingual `hints`, and `feedback` (`correct`, `fallback`, `reveal`, optional `wrong`). Copy a complete fixture task for the surrounding structure.

| Kind | Core author fields | Wrong-answer sample notation |
|---|---|---|
| `read-scale` | `answer: { answer: "280 g", form: "measure", units: ["g", "kg"] }`, optional `tools: ["zoom", "count"]` | `"204"`, `"280 kg"`, compound `"1,25"` |
| `set-scale` | `target`, `mode: "line" / "arrow" / "load" / "fill" / "weights"`; weights mode also has `weights: [500,200,100,50]` | `"550"`, `"weights:500,200"` |
| `count-intervals` | `between: [200,300]`, `ask: "part" / "length"`, `then: { answer:20, form:"whole", unit:"g" }` | First phase `"parts:4"`; input phase `"=25"` |
| `compare` | Quantity `a` and `b`, optional `align: "unit"` | `"<"`, `">"`, `"="` |
| `order` | Quantity `items`, `direction: "asc" / "desc"` | Comma-separated quantities in the proposed order |
| `choose` | Existing options; each may contain an instrument `model`, quantity `value`, or bilingual text | Wrong option id, with its `misconception` |
| `input` | Existing forms plus quantity conversion `work` | Written number, or compound `"12,50"` |

Answer forms:

- `whole`: number with a printed `unit`.
- `measure`: number plus unit chips. Explicit task `units` wins; otherwise step `limits.units` is inherited; standalone/practice tasks fall back to the answer’s unit family.
- `compound`: two boxes, units printed after them. `answer: "1 l 250 ml"`; an empty small-unit box means zero.
- `decimal`: bridge reading/conversion, e.g. `answer: "2.6", form: "decimal", unit: "kg"`.

Conversions use `work: { "do": "convert", "from": "3 kg 40 g", "into": "g" }`, or `"into": "l-ml"` for a compound answer. Validation checks the result against `answer`.

Use `{u:2 m 35 cm}` in bilingual captions/prompts/feedback, and `<Qty u="2 m 35 cm" />` in MDX. Bare quantities are rejected in instrument lessons. Samples are intentionally exempt. Keep quantities out of raw text so display and pronunciation agree.

Step limits support `units`, `parts`, `partsPerLabel`, `maxValue`, `nearest`, `compound`, `bigMax`, `smallStep`, `weights`, and bridge `dp`. Use the spec’s per-step limits rather than broad fixture limits. `check-pool.ts <draft.json> --topic <slug> --step <id>` shares the validator and proves each task and declared wrong answer.

## Files

| Area | Main files |
|---|---|
| Schema/values/forms | `src/engines/math-scene/schema.ts`, `lib/value.ts`, `lib/forms.ts`, `lib/words.ts` |
| Instrument and task logic | `lib/instrument.ts`, `lib/measure-kind.ts`, `lib/measure-tasks.ts`, `lib/measure-working.ts`, `lib/instrument-description.ts`, `lib/diagnose/measure-reading.ts` |
| State/controller/proof integration | `controller.ts`, `lib/state.ts`, `lib/check.ts`, `lib/solve.ts`, `lib/working.ts`; existing `lib/proof.ts` consumes the new solvers |
| Drawings | `stage/Instrument.tsx`, `stage/instrument/*`, `stage/glyphs/measure.tsx`, `stage/BeatModel.tsx`, `stage/Stage.tsx`, `stage/WholeLine.tsx` |
| Controls/HUD | `tray/MeasureControls.tsx`, `tray/inputs/CompoundInput.tsx` and existing input registrations, `hud/cards/MeasureCard.tsx`, `hud/plate.ts`, `View.tsx`, `math-scene.css` |
| Content validation/text | `validate-measure.ts` and validator integration, `scripts/validate-content.ts`, `src/lib/rich-text.ts`, `src/components/mdx/Qty.astro`, MDX registration and EN/ZH UI dictionaries |
| Fixture | `src/content/topics/sample-lesson-measure/`: background plus four steps, 19 explanation beats, 32 tasks, all five instruments, overlays, moves, forms and 15 codes |
| Documentation | `docs/06-dev-guide.md` measuring section; `docs/32-measuring-content-spec.md` §9 |

Fixture routes: `/en/topics/sample-lesson-measure/` and `/zh/topics/sample-lesson-measure/`. Its draft status excludes it from the published index.

Unit coverage: `compound.test.ts`, `instrument.test.ts`, `diagnose-measure-reading.test.ts`, `measure-tasks.test.ts`, `sample-lesson-measure.test.ts`, and new `instrument-description.test.ts`, under `tests/math-scene/`.

Browser coverage: `tests-e2e/sample-lesson-measure.spec.ts` has 12 tests covering beat navigation/unroll, scratch tools, diagnosis/reveal/redraw/skip, all four keyboard slider modes, pointer dragging, pouring controls, adding/removing weights, roving interval selection, compound inputs, straightened view, equal-scale quantity comparison, every fixture task phase, and Chinese cinema phone sizing/targets.

## Gate results

| Gate | Final result |
|---|---|
| `pnpm install --frozen-lockfile` | Pass |
| `pnpm check` | Pass: 570 files, 0 errors, 0 warnings; four pre-existing unused-symbol hints outside this engine change |
| `pnpm validate` | Pass: 34 topics, 0 errors, 0 warnings |
| `pnpm test` | Pass: 105 files, **2734 tests** |
| `pnpm build` | Pass: **71 static pages** |
| `pnpm shoot sample-lesson-measure --beats --tasks --keys --layout` | Pass: 24 beats, all 32 task flows, 95 task-state PNGs, no keyboard/layout/task failures |
| Final exact required `pnpm shoot sample-lesson-measure --beats --keys --layout` | Pass: 24 beats, eight viewport sizes and 16 layout PNGs, no console errors, keyboard failures or layout issues |
| Five-topic regression shoots | Pass: **76/76 PNGs byte-identical** to pre-WIP `9b66ac6` |
| `CI=1 pnpm e2e` | Pass: **144 tests**, 23.0 minutes, one worker, no retries |

Regression counts: fractions 15, multiplication/division 15, telling-time 14, area/perimeter 14, decimals 18. Eight frames initially differed only in fading HUD pixels; both builds were recaptured with CSS animation/transition disabled for those frames, producing exact matches.

I opened all 24 beat PNGs, reviewed the revised comparison and task states, and inspected paper desktop/tablet/phone and Chinese cinema phone screenshots. This exposed and fixed the small vessels/dials and inconsistent jug capacity range. The phone e2e checks an unzoomed jug at least 200 px high, an unzoomed dial at least 180 px across, and tray controls at least 44 px. Fixture page JavaScript measures **283.5 KB gzip in 10 files**.

Artifacts remain locally in the ignored `shots/` tree:

- `shots/sample-lesson-measure/en-paper/`: beats, task states and responsive layouts.
- `shots/sample-lesson-measure/zh-cinema/`: phone controls, instruments and magnifier states.
- `shots/measuring-regression/before/`, `comparison.json`, `config/`, `gates/`: pre-WIP reference PNGs, comparison results, repeatable capture settings and gate logs.

Earlier concurrent QA runs hit the existing geography test’s 5-second timeout and a SpaceScene anchor-settling mismatch. The final unit run and full serial CI pass. No unrelated test tolerances or product code were changed to obtain that result.

## Deviations and remaining scope

The detailed differences are also recorded in spec §9.2:

- Straightened VIEW retains the same instrument and its interaction state instead of replacing it with a number-line model. Standalone whole-number lines nevertheless support the requested 10,000 range, arbitrary integer step and `major`; their existing 100-tick validator ceiling remains, while instruments require at most 60 visible parts or a magnifier.
- No automatic phone range cropping was added. Labels thin when necessary; authors should provide an appropriate range/skip/zoom for dense scales. Opening the magnifier intentionally makes the overview smaller beside the enlarged scale.
- Phone `read-scale` omits the duplicate stage answer line, because the quantity is already shown in the tray; this preserves instrument size. Other task kinds and explanation equations retain their stage lines.
- Dial sweep is top-level `sweep`, rather than the draft JSON’s `dial.sweep`. Decimal scale values are strings. `sub.per` is inferred when omitted. Ruler and tape share `Ruler.tsx` rather than duplicating a `Tape.tsx` implementation.
- Interval diagnosis additionally recognizes 0.1/0.01 mistaken part sizes for the decimal bridge. A balance pan is bounded to 12 weights and validates that the minimum solution fits.
- The draft fixture has no practice chapter, matching the existing decimal fixture. Existing practice behavior is exercised by the full suite; formal measuring practice/content and its own `measuring.spec.ts` belong to the later lesson-authoring phase.

No requested gate remains unrun or failing. The formal course, finalized teaching prose, sources and illustrations remain outside this engine-only handoff.
