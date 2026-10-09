import { useEffect, useRef } from 'react';
import type { Chapter, Locale } from '../core/types';
import { chapterNumbers, isBackground, storyChapters } from '../core/chapters';
import { t, tx } from '../../i18n';

export interface ChapterRailProps {
  chapters: readonly Chapter[];
  currentId: string | null;
  locale: Locale;
  onSelect(id: string): void;
}

/**
 * Chapter rail in the plate grammar: numbered hairline rows `01  Title`,
 * the current row marked with a signal-orange rule. A background chapter
 * (`kind: background`) has no number: its row reads "Background / 背景" with
 * a hollow diamond, the chapter title in its tooltip. Vertical in the HUD's
 * left column; on phones a strip of number chips. ← / → navigation is bound
 * by the host (window-level).
 */
export function ChapterRail({ chapters, currentId, locale, onSelect }: ChapterRailProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const numbers = chapterNumbers(chapters);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [currentId]);

  return (
    <nav aria-label={t(locale, 'scene.chapters')} className="atlas-rail" data-hud-panel="rail">
      <h2 className="atlas-rail__heading">
        <span>{t(locale, 'hud.chapters')}</span>
        <span className="atlas-rail__count">{String(storyChapters(chapters).length).padStart(2, '0')}</span>
      </h2>
      <ol ref={listRef} className="atlas-rail__list">
        {chapters.map((chapter) => {
          const current = chapter.id === currentId;
          const background = isBackground(chapter);
          const title = tx(chapter.title, locale);

          return (
            <li key={chapter.id}>
              <button
                type="button"
                className="atlas-rail__item"
                aria-current={current ? 'step' : undefined}
                data-active={current}
                data-kind={background ? 'background' : undefined}
                title={background ? title : undefined}
                aria-label={background ? `${t(locale, 'chapter.background')}: ${title}` : undefined}
                onClick={() => onSelect(chapter.id)}
              >
                {background ? (
                  <span className="atlas-rail__num" aria-hidden="true">
                    <i className="atlas-rail__mark" />
                    <span className="atlas-rail__short">{t(locale, 'chapter.backgroundShort')}</span>
                  </span>
                ) : (
                  <span className="atlas-rail__num">{String(numbers.get(chapter.id) ?? 0).padStart(2, '0')}</span>
                )}
                <span className="atlas-rail__text">
                  <span className="atlas-rail__title">{background ? t(locale, 'chapter.background') : title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
