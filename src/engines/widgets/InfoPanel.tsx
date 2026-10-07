import type { ReactNode } from 'react';
import type { Chapter, Locale } from '../core/types';
import { t, tx } from '../../i18n';
import { Icon } from './icons';

export interface InfoPanelProps {
  chapter: Chapter | null;
  /** 0-based position of the chapter and total count. */
  index: number;
  total: number;
  locale: Locale;
  /** Rendered MDX body of the chapter (already in the active locale). */
  body?: ReactNode;
  /** The reader's level is below this chapter (reached via a link). */
  tooYoung?: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev(): void;
  onNext(): void;
  /** Quiz, inspector slot, engine details. */
  children?: ReactNode;
}

/** Right-hand panel: chapter title, body, quiz, selected-object details. */
export function InfoPanel({
  chapter,
  index,
  total,
  locale,
  body,
  tooYoung,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  children,
}: InfoPanelProps) {
  return (
    <section className="atlas-panel" aria-labelledby="atlas-panel-title" aria-live="polite">
      <div className="atlas-panel__scroll">
        {chapter ? (
          <>
            <header className="atlas-panel__header">
              <p className="atlas-panel__eyebrow">
                {t(locale, 'chapter.position', { n: index + 1, total })}
                <span className="atlas-badge">{t(locale, 'chapter.level', { level: chapter.level })}</span>
              </p>
              <h2 id="atlas-panel-title" className="atlas-panel__title">
                {tx(chapter.title, locale)}
              </h2>
              {chapter.sensitive && (
                <p className="atlas-panel__notice atlas-panel__notice--guarded">
                  <Icon name="shield" size={16} />
                  <span>
                    <strong>{t(locale, 'chapter.guarded')}.</strong> {t(locale, 'chapter.guardedHint')}
                  </span>
                </p>
              )}
              {tooYoung && (
                <p className="atlas-panel__notice">
                  <Icon name="lock" size={16} />
                  <span>{t(locale, 'chapter.tooYoungHint')}</span>
                </p>
              )}
            </header>
            {body && <div className="atlas-prose">{body}</div>}
          </>
        ) : null}
        {children}
      </div>
      <footer className="atlas-panel__footer">
        <button
          type="button"
          className="atlas-control"
          aria-label={t(locale, 'chapter.prev')}
          onClick={onPrev}
          disabled={!hasPrev}
        >
          <Icon name="chevron-left" />
          <span>{t(locale, 'chapter.prevShort')}</span>
        </button>
        <button
          type="button"
          className="atlas-control"
          data-active="true"
          aria-label={t(locale, 'chapter.next')}
          onClick={onNext}
          disabled={!hasNext}
        >
          <span>{t(locale, 'chapter.nextShort')}</span>
          <Icon name="chevron-right" />
        </button>
      </footer>
    </section>
  );
}
