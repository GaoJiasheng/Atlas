/** Instrument titles use the bracket labels' SVG token formatting, with the
 * label's spoken quantity included in each member's accessible description. */
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { mathSceneData, model, taskSchema, type InstrumentModelSpec } from '../../src/engines/math-scene/schema';
import { InstrumentModel } from '../../src/engines/math-scene/stage/Instrument';
import { lessonIssues, taskIssues } from '../../src/engines/math-scene/validate';

const labels = [
  { en: 'Bag A · {u:900 g}', zh: 'A 袋 · {u:900 g}' },
  { en: 'Bag B · {u:1.5 l}', zh: 'B 袋 · {u:1.5 l}' },
  { en: 'Bag C · {u:1 m 5 cm}', zh: 'C 袋 · {u:1 m 5 cm}' },
];
const grouped = (kind: 'pair' | 'set', bare = false) => ({
  kind: 'instrument',
  [kind]: labels.slice(0, kind === 'pair' ? 2 : 3).map((label) => ({
    type: 'dial', unit: 'g', from: 0, to: 1000, major: 100, minor: 50, value: 900,
    label: bare ? { en: '900 g', zh: '900 g' } : label,
  })),
});
const html = (kind: 'pair' | 'set', locale: 'en' | 'zh') => renderToStaticMarkup(createElement('svg', null,
  createElement(InstrumentModel, {
    model: model.parse(grouped(kind)) as InstrumentModelSpec,
    box: { x: 0, y: 30, w: 900, h: 600 }, defs: 'labels', locale, label: 'Compare',
  }),
));
const quantityErrors = (issues: { message: string }[]) => issues.filter((i) => i.message.includes('quantity written as text')).map((i) => i.message);

describe('instrument pair/set labels', () => {
  for (const kind of ['pair', 'set'] as const) {
    for (const locale of ['en', 'zh'] as const) {
      it(`formats ${kind} labels in ${locale} and speaks the units`, () => {
        const markup = html(kind, locale);
        expect(markup).not.toContain('{u:');
        expect(markup).toMatch(/class="ms-array__title"[^>]*aria-hidden="true">[^<]*900 g<\/text>/);
        expect(markup).toContain('1.5 ℓ</text>');
        expect(markup).toMatch(locale === 'en'
          ? /class="ms-inst-member"[^>]*aria-label="Compare Bag A · nine hundred grams / : /class="ms-inst-member"[^>]*aria-label="Compare A 袋 · 九百克 /);
        if (kind === 'set') {
          expect(markup).toContain('1 m 5 cm</text>');
          expect(markup).toContain(locale === 'en' ? 'Bag C · 1 metre 5 centimetres' : 'C 袋 · 1 米 5 厘米');
        }
      });
    }

    it(`validates bare quantities in ${kind} labels on explanation beats`, () => {
      const root = new URL('../../src/content/topics/sample-lesson-measure/data/', import.meta.url);
      const data = mathSceneData.parse({ lesson: JSON.parse(readFileSync(new URL('lesson.json', root), 'utf8')) });
      data.lesson.steps[0]!.beats[0]!.model = model.parse(grouped(kind, true));
      const errors = quantityErrors(lessonIssues(data, []));
      expect(errors).toHaveLength(kind === 'pair' ? 4 : 6);
      expect(errors).toContain(`lesson.steps.0.beats.0.model.${kind}.0.label.en: "900 g" is a quantity written as text: write it {u:…}`);
      data.lesson.steps[0]!.beats[0]!.model = model.parse(grouped(kind));
      expect(quantityErrors(lessonIssues(data, []))).toEqual([]);
    });

    it(`validates bare quantities in ${kind} labels on task option models`, () => {
      const text = { en: 'Read the labels.', zh: '读标签。' };
      const task = taskSchema.parse({
        id: 'label-check', kind: 'choose', prompt: text, guide: text, hints: [text],
        model: { kind: 'instrument', type: 'dial', unit: 'g', from: 0, to: 1000, major: 100, minor: 50 },
        feedback: { correct: text, fallback: text, reveal: text, wrong: [] },
        options: [{ id: 'a', model: grouped(kind, true), correct: true }, { id: 'b', value: '1 kg', correct: false }],
      });
      const errors = quantityErrors(taskIssues(task, 'labels', { bridge: false, practice: false }));
      expect(errors).toHaveLength(kind === 'pair' ? 4 : 6);
      expect(errors).toContain(`labels: task.options.0.model.${kind}.0.label.zh: "900 g" is a quantity written as text: write it {u:900 g}`);
    });
  }
});
