import type { ReactNode } from 'react';
import type { Chapter, Locale } from '../core/types';
import { t, tx, type BilingualText } from '../../i18n';
import { Icon } from './icons';

export interface InfoPanelProps {
  chapter: Chapter | null;
  /** Mono eyebrow above the title: `07 / 11`, or "Background" for the background chapter. */
  eyebrow: string;
  locale: Locale;
  /** One sentence under the title (the chapter's `summary`), muted serif. */
  summary?: BilingualText | null;
  /** The background chapter's reading note (`state.note`): a hairline box at the top of the body. */
  note?: BilingualText | null;
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

/**
 * Reading panel: chapter header (HUD grammar: number, title, the summary
 * sentence in muted serif), the background chapter's reading note, the body (serif),
 * quiz and selected-object details, chapter buttons. A docked column on wide
 * layouts, a bottom sheet below 1024px.
 */
export function InfoPanel({
  chapter,
  eyebrow,
  locale,
  summary,
  note,
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
            <span>{eyebrow}</span>
          </p>
          <h2 id="atlas-panel-title" className="atlas-panel__title" aria-live="polite">
            {tx(chapter.title, locale)}
          </h2>
          {summary && <p className="atlas-panel__summary">{tx(summary, locale)}</p>}
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
        {chapter && note && (
          <aside className="atlas-note" aria-labelledby="atlas-note-title">
            <h3 id="atlas-note-title" className="atlas-note__title">
              {t(locale, 'chapter.note')}
            </h3>
            <p className="atlas-note__text">{tx(note, locale)}</p>
          </aside>
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
