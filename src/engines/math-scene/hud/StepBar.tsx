/**
 * Bottom bar (docs/15 §4.5; same grammar as TimeScene's segmented timeline):
 * one equal segment per step, a small circle per sub-step (done = ink,
 * current = signal), the practice as 8 squares (answered right = ink,
 * otherwise hollow — no other colour), then the status, Back, Hint (I) and
 * Check (C). Segments and ticks are buttons; on phones only the segments.
 */
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { Lesson } from '../schema';
import type { Controller } from '../controller';
import type { MathUiState } from '../ui';

export interface StepBarProps {
  lesson: Lesson;
  ctl: Controller;
  ui: MathUiState;
  /** Step chapters and the practice chapter with their display numbers. */
  segments: { id: string; number: string; title: string; practice: boolean }[];
  chapter: string | null;
  index: number;
  canCheck: boolean;
  canHint: boolean;
  status: string;
  locale: Locale;
}

export function StepBar(p: StepBarProps) {
  const { lesson, ctl, ui, locale } = p;
  const T = (k: Parameters<typeof t>[1], v?: Record<string, string | number>) => t(locale, k, v);
  return (
    <div className="ms-bar-bottom">
      <button type="button" className="ms-btn ms-btn--ghost ms-bar-bottom__back" aria-label={T('math.bar.back')} title={`${T('math.bar.back')} (Shift ←)`} onClick={() => ctl.prev()}>
        ◁
      </button>
      <nav className="ms-steps" aria-label={T('math.bar.steps')}>
        <ol>
          {p.segments.map((seg) => {
            const current = seg.id === p.chapter;
            const items = seg.practice ? lesson.practice.map((q) => q.task) : (lesson.steps.find((s) => s.id === seg.id)?.tasks ?? []);
            return (
              <li key={seg.id} className="ms-steps__seg" data-current={current || undefined} data-practice={seg.practice || undefined}>
                <button type="button" className="ms-steps__chap" aria-current={current ? 'step' : undefined} aria-label={T('math.bar.step', { n: seg.number, title: seg.title })} title={`${seg.number} · ${seg.title}`} onClick={() => ctl.goTo(seg.id, 0)}>
                  <span className="ms-steps__no">{seg.number}</span>
                </button>
                <span className="ms-steps__ticks">
                  {items.map((task, i) => {
                    const run = ui.runs[task.id];
                    const result = seg.practice ? ui.practice[task.id] : undefined;
                    const done = seg.practice ? !!result?.ok : !!run?.done;
                    return (
                      <button
                        key={task.id}
                        type="button"
                        className="ms-steps__tick"
                        data-shape={seg.practice ? 'square' : 'dot'}
                        data-done={done || undefined}
                        data-answered={seg.practice && result ? '' : undefined}
                        aria-current={current && i === p.index ? 'step' : undefined}
                        aria-label={T(seg.practice ? 'math.bar.question' : 'math.bar.task', { n: seg.number, k: i + 1, title: tx(task.prompt, locale).replace(/[{}]/g, '') })}
                        onClick={() => ctl.goTo(seg.id, i)}
                      />
                    );
                  })}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
      <span className="ms-bar-bottom__status">{p.status}</span>
      <button type="button" className="ms-btn ms-btn--ghost" data-command="hint" disabled={!p.canHint} title={`${T('math.cmd.hint')} (I)`} onClick={() => ctl.hint()}>
        {T('math.cmd.hint')}
        <kbd>I</kbd>
      </button>
      <button type="button" className="ms-btn" data-command="check" data-ready={p.canCheck || undefined} disabled={!p.canCheck} title={p.canCheck ? `${T('math.cmd.check')} (C)` : T('math.cmd.checkWhy')} onClick={() => ctl.check()}>
        {T('math.cmd.check')}
        <kbd>C</kbd>
      </button>
    </div>
  );
}
