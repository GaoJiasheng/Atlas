import { useLayoutEffect, useRef, type ReactNode } from 'react';

/**
 * Shows the current chapter's body out of all pre-rendered bodies.
 *
 * Astro renders every chapter's MDX into the island's default slot as
 * `<article data-chapter-body="<id>">`. That slot is static HTML React never
 * re-renders, so toggling `hidden` on the articles is safe and keeps each body
 * in the DOM exactly once (no duplicated HTML, no client-side MDX).
 */
export function ChapterBodies({ currentId, children }: { currentId: string | null; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const articles = ref.current?.querySelectorAll<HTMLElement>('[data-chapter-body]') ?? [];
    for (const article of articles) article.hidden = article.dataset.chapterBody !== currentId;
  }, [currentId]);

  return (
    <div ref={ref} className="atlas-chapter-bodies">
      {children}
    </div>
  );
}
