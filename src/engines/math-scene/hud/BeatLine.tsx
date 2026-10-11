/**
 * The reading panel's beat line (slot `readerTop`, docs/08 §2 HUD 铁律 d):
 * the beat on show, right under the chapter header — `BEAT 2/5` and the
 * beat's caption in the page language, `CHECK 5/5` on the check, `QUESTION
 * 3/8` in the practice — with ‹ › for the previous / next beat (the same path
 * as `,` / `.`, crossing chapters). Phones step beats here (their chapter axis
 * has numbers only). The reading panel scrolls back to its top when the beat
 * or the chapter changes, so the line and the check below it are in view.
 */
import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import { renderRich } from '../../../lib/rich-text';

export interface BeatLineProps {
  /** `BEAT`, `CHECK` or `QUESTION`. */
  kind: 'explain' | 'check' | 'question';
  /** Beat on show (0-based) and the chapter's beats. */
  beat: number;
  count: number;
  /** The caption (rich text, page language); none on the check (the tray says the task). */
  caption: string | null;
  canPrev: boolean;
  canNext: boolean;
  onStep(direction: 1 | -1): void;
  /** Scroll the reader back to the top when this changes. */
  focus: string;
  locale: Locale;
}

const LABEL = { explain: 'math.beat.label', check: 'math.check.title', question: 'math.status.question' } as const;

export function BeatLine({ kind, beat, count, caption, canPrev, canNext, onStep, focus, locale }: BeatLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current?.closest('.atlas-panel__scroll')?.scrollTo({ top: 0 });
  }, [focus]);
  const step = (dir: 1 | -1) => (e: MouseEvent<HTMLButtonElement>) => {
    onStep(dir);
    if (e.detail > 0) e.currentTarget.blur();
  };
  const no = `${beat + 1}/${count}`;
  return (
    <div ref={ref} className="ms-beatline" data-kind={kind} aria-live="polite">
      <p className="ms-beatline__text">
        <b className="ms-beatline__no">
          {t(locale, LABEL[kind]).toLocaleUpperCase(locale === 'zh' ? 'zh' : 'en')}
          {kind !== 'check' && ` ${no}`}
        </b>
        {caption && <span className="ms-beatline__caption">{renderRich(caption, locale)}</span>}
      </p>
      <span className="ms-beatline__nav">
        <button type="button" className="ms-beatline__btn" aria-label={t(locale, 'math.beat.prev')} title={`${t(locale, 'math.beat.prev')} (,)`} disabled={!canPrev} onClick={step(-1)}>
          ‹
        </button>
        <button type="button" className="ms-beatline__btn" aria-label={t(locale, 'math.beat.next')} title={`${t(locale, 'math.beat.next')} (.)`} disabled={!canNext} onClick={step(1)}>
          ›
        </button>
      </span>
    </div>
  );
}
