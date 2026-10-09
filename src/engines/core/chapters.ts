/**
 * Chapter kinds on the client (docs/06 "背景章"). A topic may open with one
 * `kind: background` chapter (order 0): it has no number (doc id `00`, the
 * rail and reader say "Background"), no timeline node and no time of its own.
 * Story chapters are numbered 1..n after it, so the numbers the reader sees
 * do not shift when a background chapter is added.
 */
import type { Chapter } from './types';

export const isBackground = (chapter: Pick<Chapter, 'kind'> | null | undefined): boolean => chapter?.kind === 'background';

/** Chapters that are story nodes (everything but the background chapter), in order. */
export function storyChapters<C extends Pick<Chapter, 'kind'>>(chapters: readonly C[]): C[] {
  return chapters.filter((c) => !isBackground(c));
}

/** Display number per chapter id: 0 for the background chapter, 1..n for the story chapters. */
export function chapterNumbers(chapters: readonly Pick<Chapter, 'id' | 'kind'>[]): Map<string, number> {
  const out = new Map<string, number>();
  let n = 0;
  for (const c of chapters) out.set(c.id, isBackground(c) ? 0 : ++n);
  return out;
}
