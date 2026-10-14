/**
 * The reading panel's chapter index (slot `readerEnd`, docs/08 §2 HUD 铁律 d):
 * after the chapter body, the step's key facts (2–4 one-liners from
 * `lesson.json` `keyFacts`) and its SYLLABUS LINKS — the MOE 2021 lines the
 * step teaches, with their source chip (S1; no school level or reference
 * number is shown, those stay in the data) — plus a link to the check.
 */
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import { renderRich } from '../../../lib/rich-text';
import type { Lesson, Step } from '../schema';

export function ChapterIndex({ step, lesson, onCheck, locale }: { step: Step | null; lesson: Lesson; onCheck(): void; locale: Locale }) {
  if (!step) return null;
  const lines = lesson.syllabus.filter((l) => step.lo.includes(l.id));
  return (
    <section className="ms-index" aria-label={t(locale, 'math.index.label')}>
      {step.keyFacts && step.keyFacts.length > 0 && (
        <>
          <h3 className="ms-index__head">{t(locale, 'math.index.facts')}</h3>
          <ul className="ms-index__facts">
            {step.keyFacts.map((f, i) => (
              <li key={i}>{renderRich(tx(f, locale), locale)}</li>
            ))}
          </ul>
        </>
      )}
      <h3 className="ms-index__head">{t(locale, 'math.index.syllabus')}</h3>
      <p className="ms-index__lo">
        {step.bridge && <b className="atlas-chip">{t(locale, 'math.bridge')}</b>}
        {lines.map((l) => (
          <span key={l.id}>
            <b>{t(locale, 'math.syllabus')}</b> {tx(l.text, locale)}{' '}
            <button type="button" className="atlas-src" data-source={l.source}>
              {l.source}
            </button>
          </span>
        ))}
      </p>
      <button type="button" className="ms-btn ms-btn--ghost ms-index__check" onClick={onCheck}>
        {t(locale, 'math.check.open')}
      </button>
    </section>
  );
}
