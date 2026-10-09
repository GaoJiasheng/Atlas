import { useEffect, useRef } from 'react';
import type { Chapter, Locale } from '../core/types';
import { t, tx } from '../../i18n';

export interface ChapterRailProps {
  chapters: readonly Chapter[];
  currentId: string | null;
  locale: Locale;
  onSelect(id: string): void;
}

/**
 * Chapter rail in the plate grammar: numbered hairline rows `01  Title`,
 * the current row marked with a signal-orange rule. Vertical in the HUD's left column; on phones a strip of number
 * chips. ← / → navigation is bound by the host (window-level).
 */
export function ChapterRail({ chapters, currentId, locale, onSelect }: ChapterRailProps) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [currentId]);

  return (
    <nav aria-label={t(locale, 'scene.chapters')} className="atlas-rail" data-hud-panel="rail">
      <h2 className="atlas-rail__heading">
        <span>{t(locale, 'hud.chapters')}</span>
        <span className="atlas-rail__count">{String(chapters.length).padStart(2, '0')}</span>
      </h2>
      <ol ref={listRef} className="atlas-rail__list">
        {chapters.map((chapter, index) => {
          const current = chapter.id === currentId;
          const number = String(index + 1).padStart(2, '0');

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
                  <span className="atlas-rail__title">
                    {tx(chapter.title, locale)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
