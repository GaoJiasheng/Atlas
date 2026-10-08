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
  hasPrev: boolean;
  hasNext: boolean;
  onPrev(): void;
  onNext(): void;
  /** Quiz, inspector slot, engine details. */
  children?: ReactNode;
  /**
   * Bottom-sheet state on narrow layouts (< 1024px): collapsed shows the
   * header and chapter buttons only. Ignored by the docked column.
   */
  expanded?: boolean;
  onToggleExpanded?(): void;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Reading panel: chapter header (HUD grammar), child-facing body (serif),
 * quiz and selected-object details, chapter buttons. A docked column on wide
 * layouts, a bottom sheet below 1024px.
 */
export function InfoPanel({
  chapter,
  index,
  total,
  locale,
  body,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  children,
  expanded = false,
  onToggleExpanded,
}: InfoPanelProps) {
  return (
    <section
      className="atlas-panel"
      data-expanded={expanded}
      aria-labelledby="atlas-panel-title"
    >
      {chapter && (
        <header className="atlas-panel__header">
          <p className="atlas-panel__eyebrow">
            <span>
              {pad2(index + 1)} / {pad2(total)}
            </span>
            {chapter.sensitive && (
              <span className="atlas-panel__guard">
                <Icon name="lock" size={11} /> {t(locale, 'chapter.guarded')}
              </span>
            )}
          </p>
          <h2 id="atlas-panel-title" className="atlas-panel__title" aria-live="polite">
            {tx(chapter.title, locale)}
          </h2>
          {onToggleExpanded && (
            <button
              type="button"
              className="atlas-panel__toggle hud-btn"
              aria-expanded={expanded}
              aria-controls="atlas-panel-scroll"
              onClick={onToggleExpanded}
            >
              {expanded ? t(locale, 'hud.collapse') : t(locale, 'hud.read')}
            </button>
          )}
        </header>
      )}
      <div id="atlas-panel-scroll" className="atlas-panel__scroll">
        {chapter && chapter.sensitive && (
          <p className="atlas-panel__notice atlas-panel__notice--guarded">
            <Icon name="shield" size={16} />
            <span>
              <strong>{t(locale, 'chapter.guarded')}.</strong> {t(locale, 'chapter.guardedHint')}
            </span>
          </p>
        )}
        {chapter && body && <div className="atlas-prose">{body}</div>}
        {children}
      </div>
      <footer className="atlas-panel__footer">
        <button
          type="button"
          className="atlas-control atlas-panel__prev"
          aria-label={t(locale, 'chapter.prev')}
          onClick={onPrev}
          disabled={!hasPrev}
        >
          <Icon name="chevron-left" size={18} />
          <span className="atlas-control__label">{t(locale, 'chapter.prevShort')}</span>
        </button>
        <button
          type="button"
          className="atlas-control atlas-panel__next"
          data-active="true"
          aria-label={t(locale, 'chapter.next')}
          onClick={onNext}
          disabled={!hasNext}
        >
          <span className="atlas-control__label">{t(locale, 'chapter.nextShort')}</span>
          <Icon name="chevron-right" size={18} />
        </button>
      </footer>
    </section>
  );
}
