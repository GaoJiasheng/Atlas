/**
 * What VOICE says for a beat (docs/06 语音), as plain text: the chapter
 * announcement (number in words, or "Background", then the chapter title) and
 * the caption. Pure, and the single source of the spoken text: the
 * presentation speaks these strings, and the caption extractor
 * (`scripts/audio/extract.ts`) writes the same strings into the manifest the
 * recorded clips are generated from, so a clip's text cannot drift from what
 * the page says.
 */
import { t, tx } from '../../../i18n';
import { chapterNumberText, speakableText, type SpeechPart } from '../../../lib/speech';
import { chapterNumbers, isBackground } from '../chapters';
import type { Chapter, Locale } from '../types';

export interface NarrationPart {
  part: SpeechPart;
  text: string;
}

/** How chapter `chapterIndex` is announced: "Chapter seven" / 第七章 (the background chapter: "Background" / 背景), and its title. */
export function chapterAnnouncement(
  chapters: readonly Pick<Chapter, 'id' | 'kind' | 'title'>[],
  chapterIndex: number,
  locale: Locale,
): { opening: string; title: string } {
  const chapter = chapters[chapterIndex];
  const number = chapterNumbers(chapters).get(chapter?.id ?? '') ?? chapterIndex + 1;
  return {
    opening: isBackground(chapter) ? t(locale, 'chapter.background') : chapterNumberText(number, locale === 'zh' ? 'zh' : 'en'),
    title: chapter ? speakableText(tx(chapter.title, locale)) : '',
  };
}

/**
 * The parts spoken for one beat, in order: the announcement when `announce`
 * (a chapter's first beat, or a jump into another chapter), then the caption.
 * `caption` is the adapter's `captionOf` text; nothing is spoken for an empty one.
 */
export function narrationParts(announcement: { opening: string; title: string }, caption: string, announce: boolean): NarrationPart[] {
  const spoken = speakableText(caption);
  if (!spoken) return [];
  const parts: NarrationPart[] = [];
  if (announce) {
    parts.push({ part: 'chapter', text: announcement.opening });
    if (announcement.title) parts.push({ part: 'title', text: announcement.title });
  }
  parts.push({ part: 'caption', text: spoken });
  return parts;
}
