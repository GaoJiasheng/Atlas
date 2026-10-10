/**
 * PRESENTATION: the only HUD left on the stage — the title block and one
 * paper caption card at the bottom (fades in once the flight is done): a
 * header line (`04 / 11 · chapter · readout · 2 / 3`), the caption (large
 * serif, scrolls inside the card when it is long) and a two-level progress
 * bar — one hairline segment per chapter, the current chapter's segment split
 * into its beats; the filled part is the progress up to the current beat. A
 * transparent layer over the stage takes clicks (= next beat) and keeps the
 * stage still. Beside the bar, the AUTO-PLAY and VOICE checkboxes. Rendered by
 * `usePresentation` (the engine places its `element` on its stage); styles
 * `.atlas-present*` in styles/scene.css.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useT } from '../context';
import { chapterNumbers, isBackground, storyChapters } from '../chapters';
import type { Chapter, Locale } from '../types';
import { tx, type BilingualText } from '../../../i18n';
import { chapterNumberText, speakSequence, speakableText, SPEECH_LANG, stopSpeech, voiceFor, type Narration, type SpeechPart } from '../../../lib/speech';
import { AFTER_SPEECH_MS, afterSettle, autoplayDwell, lostEndFallback } from './autoplay';
import { chapterSpans, type Beat } from './beats';

const pad2 = (n: number) => String(n).padStart(2, '0');

export interface PresentationProps {
  title: BilingualText;
  beats: readonly Beat[];
  index: number;
  instant: boolean;
  /** Resolves when this beat has settled (engine camera); `null` = `BEAT_SETTLE_MS` after the beat starts. */
  settled: Promise<void> | null;
  chapters: readonly Chapter[];
  locale: Locale;
  /** This beat's caption as plain text in `locale`. */
  caption: string;
  /** The beat's caption in `locale` for the progress bar's labels. */
  captionAt(index: number): string;
  /** Header segment after the chapter title (e.g. the date); omitted = none. */
  readout?: ReactNode;
  onStep(dir: 1 | -1): void;
  onGo(index: number): void;
  /** This beat's narration clip, if it has one. */
  audio: HTMLAudioElement | null;
  autoplay: boolean;
  onAutoplay(on: boolean): void;
  /** Narrate the caption (switched on and a voice exists). */
  voice: boolean;
  voiceAvailable: boolean;
  onVoice(on: boolean): void;
}

export function Presentation({
  title,
  beats,
  index,
  instant,
  settled,
  chapters,
  locale,
  caption: captionText,
  captionAt,
  readout,
  onStep,
  onGo,
  audio,
  autoplay,
  onAutoplay,
  voice,
  voiceAvailable,
  onVoice,
}: PresentationProps) {
  const tr = useT();
  const b = beats[index]!;
  const chapter = chapters[b.chapterIndex];
  /** Display numbers: the background chapter is 00 ("Background"), story chapters 01..n. */
  const numbers = useMemo(() => chapterNumbers(chapters), [chapters]);
  const storyTotal = useMemo(() => storyChapters(chapters).length, [chapters]);
  const numberOf = (ci: number) => numbers.get(chapters[ci]?.id ?? '') ?? ci + 1;
  /** Short mark of a chapter in the progress bar and tooltips: `07`, or `BG` / 背景. */
  const markOf = (ci: number) => (isBackground(chapters[ci]) ? tr('chapter.backgroundShort') : pad2(numberOf(ci)));
  /** Accessible name of a chapter segment. */
  const chapterLabel = (ci: number) => {
    const c = chapters[ci];
    const name = c ? tx(c.title, locale) : '';
    return isBackground(c) ? tr('time.beatBackground', { title: name }) : tr('time.beatChapter', { n: numberOf(ci), title: name });
  };
  /** First beat and beat count of every chapter. */
  const spans = useMemo(() => chapterSpans(chapters.length, beats), [chapters, beats]);
  const caption = useRef<HTMLParagraphElement>(null);
  // A new beat starts at the top of its caption.
  useEffect(() => {
    caption.current?.scrollTo({ top: 0 });
  }, [index]);
  const go = (i: number) => (e: { detail: number; currentTarget: HTMLElement }) => {
    onGo(i);
    if (e.detail > 0) e.currentTarget.blur();
  };

  /*
   * AUTO-PLAY: once the beat has settled (camera, caption fade-in), wait for
   * the narration to end (if the beat has one and it plays), else a dwell by
   * caption length, then go on. Any input (click, key, wheel) holds it for
   * this beat; the next beat (however it comes) runs it again. Stops at the end.
   */
  const [held, setHeld] = useState(false);
  useEffect(() => setHeld(false), [index]);
  const last = index >= beats.length - 1;

  /*
   * VOICE: once the beat has settled, speak the caption (a beat's `audio` clip takes priority).
   * A chapter's first beat (or any beat of a chapter other than the one spoken last, after a
   * jump) first announces the chapter: its number, its title, the caption, three utterances
   * ~350 ms apart as one narration. A new beat, turning Voice off and leaving the presentation
   * cancel all of them. `speech` tells the auto-play below whether an utterance is on its way,
   * so it can wait for the end of the last one.
   */
  const speech = useRef<{ state: 'idle' | 'pending' | 'speaking' | 'ended'; listeners: Set<() => void>; chars: number; parts: number; chapter: number }>({
    state: 'idle',
    listeners: new Set(),
    chars: 0,
    parts: 1,
    chapter: -1,
  });
  const spoken = speakableText(captionText);
  const voiceOn = voice && !audio && spoken !== '';
  const chapterTitle = chapter ? speakableText(tx(chapter.title, locale)) : '';
  const chapterIndex = b.chapterIndex;
  /** The announcement's first part: the chapter number in words, or "Background". */
  const chapterOpening = isBackground(chapter) ? tr('chapter.background') : chapterNumberText(numberOf(chapterIndex), locale === 'zh' ? 'zh' : 'en');
  const firstOfChapter = b.index === 0;
  useEffect(() => {
    const sp = speech.current;
    const voiceChoice = voiceOn ? voiceFor(locale) : null;
    if (!voiceChoice) {
      sp.state = 'idle';
      sp.chapter = -1;
      return;
    }
    sp.state = 'pending';
    let narration: Narration | null = null;
    const lang = locale === 'zh' ? 'zh' : 'en';
    const cancelWait = afterSettle(instant, settled, () => {
      sp.state = 'speaking';
      const parts: { part: SpeechPart; text: string }[] = [];
      if (firstOfChapter || sp.chapter !== chapterIndex) {
        parts.push({ part: 'chapter', text: chapterOpening });
        if (chapterTitle) parts.push({ part: 'title', text: chapterTitle });
      }
      parts.push({ part: 'caption', text: spoken });
      sp.chars = parts.reduce((n, p) => n + [...p.text].length, 0);
      sp.parts = parts.length;
      narration = speakSequence(
        parts,
        SPEECH_LANG[lang],
        voiceChoice,
        () => {
          sp.state = 'ended';
          for (const l of [...sp.listeners]) l();
        },
        (part) => {
          // The chapter counts as announced once its caption starts (a jump during the announcement repeats it).
          if (part === 'caption') sp.chapter = chapterIndex;
        },
      );
    });
    return () => {
      cancelWait();
      narration?.cancel();
      stopSpeech();
      sp.state = 'idle';
    };
  }, [voiceOn, index, instant, settled, locale, spoken, chapterIndex, chapterTitle, chapterOpening, firstOfChapter]);

  useEffect(() => {
    if (!autoplay || held || last) return;
    let dwell = 0;
    let stopWaiting = () => {};
    const advance = () => onStep(1);
    const cancelWait = afterSettle(instant, settled, () => {
      if (audio?.ended) advance();
      else if (audio && !audio.paused) audio.addEventListener('ended', advance, { once: true });
      else if (voiceOn && speech.current.state !== 'idle') {
        // Wait for the utterance to genuinely end (a short breath after it); a lost `end` falls back to `lostEndFallback`.
        const sp = speech.current;
        const afterEnd = () => {
          window.clearTimeout(dwell);
          dwell = window.setTimeout(advance, AFTER_SPEECH_MS);
        };
        if (sp.state === 'ended') afterEnd();
        else {
          sp.listeners.add(afterEnd);
          stopWaiting = () => sp.listeners.delete(afterEnd);
          dwell = window.setTimeout(advance, lostEndFallback(sp.chars, sp.parts));
        }
      } else dwell = window.setTimeout(advance, autoplayDwell([...captionText].length));
    });
    const hold = (e: Event) => {
      if (e.target instanceof Element && e.target.closest('.atlas-present__auto')) return;
      setHeld(true);
    };
    window.addEventListener('pointerdown', hold, true);
    window.addEventListener('keydown', hold, true);
    window.addEventListener('wheel', hold, true);
    return () => {
      cancelWait();
      window.clearTimeout(dwell);
      stopWaiting();
      audio?.removeEventListener('ended', advance);
      window.removeEventListener('pointerdown', hold, true);
      window.removeEventListener('keydown', hold, true);
      window.removeEventListener('wheel', hold, true);
    };
  }, [autoplay, held, last, index, instant, settled, audio, captionText, spoken, onStep, voiceOn]);
  return (
    <div className="atlas-present" data-instant={instant || undefined}>
      <div className="atlas-present__hit" onClick={() => onStep(1)} aria-hidden="true" />
      <p className="atlas-present__title" data-hud-panel="present-title">
        <small>{tr('time.presentation').toLocaleUpperCase('en')}</small>
        <span lang="en">{title.en}</span>
        {title.zh && <span lang="zh-Hans">{title.zh}</span>}
      </p>
      <div className="atlas-present__foot" data-hud-panel="present">
        <p className="atlas-present__chapter">
          <i>{isBackground(chapter) ? tr('chapter.background') : `${pad2(numberOf(b.chapterIndex))} / ${pad2(storyTotal)}`}</i>
          {chapter && <span>{tx(chapter.title, locale)}</span>}
          {readout !== undefined && <b>{readout}</b>}
          {b.count > 1 && (
            <em>
              {b.index + 1} / {b.count}
            </em>
          )}
        </p>
        <p className="atlas-present__caption" key={index} ref={caption} aria-live="polite" onClick={() => onStep(1)}>
          {captionText}
        </p>
        <div className="atlas-present__row">
          <nav className="atlas-present__bar" aria-label={tr('time.beats')}>
            <ol>
              {chapters.map((c, ci) => {
                const { first, count } = spans[ci]!;
                const state = ci < b.chapterIndex ? 'done' : ci === b.chapterIndex ? 'current' : 'todo';
                const label = <span className="atlas-present__no">{markOf(ci)}</span>;
                return (
                  <li key={c.id} className="atlas-present__seg" data-state={state}>
                    {state === 'current' && count > 1 ? (
                      <>
                        <div className="atlas-present__ticks">
                          {Array.from({ length: count }, (_, k) => (
                            <button
                              key={k}
                              type="button"
                              className="atlas-present__tick"
                              data-state={k <= b.index ? 'done' : 'todo'}
                              aria-current={k === b.index ? 'step' : undefined}
                              aria-label={
                                isBackground(c)
                                  ? `${chapterLabel(ci)} · ${k + 1}: ${captionAt(first + k)}`
                                  : tr('time.beat', { n: numberOf(ci), k: k + 1, caption: captionAt(first + k) })
                              }
                              title={`${markOf(ci)}.${k + 1} · ${tx(c.title, locale)}`}
                              onClick={go(first + k)}
                            />
                          ))}
                        </div>
                        {label}
                      </>
                    ) : (
                      <button
                        type="button"
                        className="atlas-present__chap"
                        aria-current={state === 'current' ? 'step' : undefined}
                        aria-label={chapterLabel(ci)}
                        title={`${markOf(ci)} · ${tx(c.title, locale)}`}
                        onClick={go(first)}
                      >
                        <i className="atlas-present__line" />
                        {label}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
          <div className="atlas-present__opts">
            <label className="atlas-present__auto" title={tr('time.autoplayHint')} data-held={(autoplay && held) || undefined}>
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => onAutoplay(e.currentTarget.checked)}
                onClick={(e) => {
                  if (e.detail > 0) e.currentTarget.blur();
                }}
              />
              <span>{tr('time.autoplay')}</span>
            </label>
            <label
              className="atlas-present__auto atlas-present__voice"
              title={voiceAvailable ? tr('time.voiceHint') : tr('time.voiceNone')}
              data-disabled={!voiceAvailable || undefined}
            >
              <input
                type="checkbox"
                checked={voice}
                disabled={!voiceAvailable}
                onChange={(e) => onVoice(e.currentTarget.checked)}
                onClick={(e) => {
                  if (e.detail > 0) e.currentTarget.blur();
                }}
              />
              <span>{tr('time.voice')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
