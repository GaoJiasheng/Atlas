import { useEffect, useRef, useState } from 'react';
import type { Chapter, Level, Locale } from '../core/types';
import { t, tx } from '../../i18n';
import { isAboveLevel } from '../../lib/levels';
import { Icon } from './icons';

export interface ChapterRailProps {
  chapters: readonly Chapter[];
  currentId: string | null;
  locale: Locale;
  readerLevel: Level;
  parentMode: boolean;
  onSelect(id: string): void;
}

/** Is this chapter folded away for the reader? */
export function isChapterCollapsed(chapter: Chapter, readerLevel: Level, parentMode: boolean): boolean {
  return !parentMode && isAboveLevel(chapter.level, readerLevel);
}

/**
 * Chapter list. Vertical in the left column on wide screens, a horizontal
 * strip on narrow ones. ← / → navigation is bound by the host (window-level).
 */
export function ChapterRail({ chapters, currentId, locale, readerLevel, parentMode, onSelect }: ChapterRailProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [openHint, setOpenHint] = useState<string | null>(null);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [currentId]);

  return (
    <nav aria-label={t(locale, 'scene.chapters')} className="atlas-rail">
      <h2 className="atlas-rail__heading">{t(locale, 'scene.chapters')}</h2>
      <ol ref={listRef} className="atlas-rail__list">
        {chapters.map((chapter, index) => {
          const collapsed = isChapterCollapsed(chapter, readerLevel, parentMode);
          const current = chapter.id === currentId;
          const number = String(index + 1).padStart(2, '0');

          if (collapsed && !current) {
            const hintOpen = openHint === chapter.id;
            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  className="atlas-rail__item atlas-rail__item--collapsed"
                  aria-expanded={hintOpen}
                  onClick={() => setOpenHint(hintOpen ? null : chapter.id)}
                >
                  <span className="atlas-rail__num">{number}</span>
                  <span className="atlas-rail__text">
                    <span className="atlas-rail__title">
                      <Icon name="lock" size={16} /> {t(locale, 'chapter.tooYoung')}
                    </span>
                    {hintOpen && <span className="atlas-rail__hint">{t(locale, 'chapter.tooYoungHint')}</span>}
                  </span>
                  <span className="atlas-badge">{chapter.level}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={chapter.id}>
              <button
                type="button"
                className="atlas-rail__item"
                aria-current={current ? 'step' : undefined}
                data-active={current}
                onClick={() => onSelect(chapter.id)}
              >
                <span className="atlas-rail__num">{number}</span>
                <span className="atlas-rail__text">
                  <span className="atlas-rail__title">{tx(chapter.title, locale)}</span>
                  {chapter.sensitive && (
                    <span className="atlas-badge atlas-badge--warning">
                      <Icon name="shield" size={12} /> {t(locale, 'chapter.guarded')}
                    </span>
                  )}
                </span>
                <span className="atlas-badge">{chapter.level}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
