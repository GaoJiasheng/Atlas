/**
 * Practice summary (docs/15 §3): a quiet hairline table — question, kind,
 * ✓ / ○, the steps to look at again — under one sentence ("You got 6 of 8.
 * Have another look at steps 07 and 09."). No score bar, stars or praise.
 * "Try again" clears the answers and starts with the same questions (D3).
 */
import type { CSSProperties } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import { renderRich } from '../../../lib/rich-text';
import type { Lesson } from '../schema';
import type { Controller } from '../controller';
import type { PracticeResult } from '../ui';

export function PracticeSummary({ lesson, results, numbers, ctl, locale, style }: { lesson: Lesson; results: Record<string, PracticeResult>; numbers: Map<string, number>; ctl: Controller; locale: Locale; style?: CSSProperties }) {
  const T = (k: Parameters<typeof t>[1], v?: Record<string, string | number>) => t(locale, k, v);
  const total = lesson.practice.length;
  const right = lesson.practice.filter((q) => results[q.id]?.ok).length;
  const again = [...new Set(lesson.practice.filter((q) => !results[q.id]?.ok).flatMap((q) => q.revisit))].sort((a, b) => (numbers.get(a) ?? 0) - (numbers.get(b) ?? 0));
  const no = (id: string) => String(numbers.get(id) ?? 0).padStart(2, '0');
  const list = again.map(no);
  const joined = locale === 'zh' ? list.join('、') : list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list.at(-1)}` : (list[0] ?? '');
  const sentence = right === total ? T('math.summary.all', { n: total }) : T(list.length > 1 ? 'math.summary.some' : 'math.summary.one', { k: right, n: total, steps: joined });
  return (
    <section className="ms-summary" style={style} aria-label={T('math.summary.title')}>
      <h2 className="ms-summary__title">{T('math.summary.title')}</h2>
      <p className="ms-summary__line" role="status">
        {sentence}
      </p>
      <table className="ms-summary__table">
        <thead>
          <tr>
            <th scope="col">{T('math.summary.q')}</th>
            <th scope="col">{T('math.summary.task')}</th>
            <th scope="col">{T('math.summary.result')}</th>
            <th scope="col">{T('math.summary.revisit')}</th>
          </tr>
        </thead>
        <tbody>
          {lesson.practice.map((q, i) => {
            const r = results[q.id];
            return (
              <tr key={q.id} data-ok={r?.ok || undefined}>
                <td className="ms-summary__no">{String(i + 1).padStart(2, '0')}</td>
                <td>{renderRich(tx(q.task.prompt, locale), locale)}</td>
                <td className="ms-summary__mark" aria-label={r?.ok ? T('math.summary.right') : r ? T('math.summary.notYet') : T('math.summary.skipped')}>
                  {r?.ok ? '✓' : '○'}
                </td>
                <td>
                  {!r?.ok &&
                    q.revisit.map((id) => (
                      <button key={id} type="button" className="ms-btn ms-btn--ghost ms-btn--small" onClick={() => ctl.goTo(id, 0)}>
                        {T('math.practice.revisit', { n: no(id) })}
                      </button>
                    ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button type="button" className="ms-btn" onClick={() => ctl.restartPractice()}>
        {T('math.summary.again')}
      </button>
    </section>
  );
}
