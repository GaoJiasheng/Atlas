/**
 * The reading panel's beat line (slot `readerTop`, docs/08 §2 HUD 铁律 d): the
 * beat on show outside the presentation, right under the chapter header, as a
 * quiet line `BEAT 2/8` + the caption in the page language, with ‹ › for the
 * previous / next beat (the same path as `,` / `.`, crossing chapters). It is
 * how phones step beats (their chapter axis has numbers only). A chapter
 * without beats of its own has no line (its one beat is the header's summary).
 *
 * The reading panel scrolls back to its top when the beat, the chapter, the
 * selected part or the exercise changes, so the line and the inspector below
 * it are what the reader sees.
 */
import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { useScene, useSceneContext, useT } from '../../core/context';
import { Icon } from '../../widgets/icons';
import type { SpaceSceneExt } from '../index';

export interface BeatLineProps {
  /** Captions of the current chapter's own beats (page language); empty = no line. */
  captions: readonly string[];
  /** Beat on show, `null` = the chapter's own state. */
  beat: number | null;
  canPrev: boolean;
  canNext: boolean;
  onStep(direction: 1 | -1): void;
}

export function BeatLine({ captions, beat, canPrev, canNext, onStep }: BeatLineProps) {
  const t = useT();
  const { locale } = useSceneContext();
  const ref = useRef<HTMLDivElement>(null);
  const focus = useScene<SpaceSceneExt, string>((s) => `${s.chapter}|${s.beat}|${s.part}|${s.exercise?.id ?? ''}`);
  useLayoutEffect(() => {
    ref.current?.closest('.atlas-panel__scroll')?.scrollTo({ top: 0 });
  }, [focus]);
  const step = (dir: 1 | -1) => (e: MouseEvent<HTMLButtonElement>) => {
    onStep(dir);
    if (e.detail > 0) e.currentTarget.blur();
  };
  const n = captions.length;
  return (
    <div ref={ref} className="space-beatline" hidden={n === 0} aria-live="polite">
      {n > 0 && (
        <>
          <p className="space-beatline__text">
            <b className="space-beatline__no">
              {t('space.beat.label').toLocaleUpperCase(locale === 'zh' ? 'zh' : 'en')} {beat === null ? '–' : beat + 1}/{n}
            </b>
            {beat !== null && <span className="space-beatline__caption">{captions[beat]}</span>}
          </p>
          <span className="space-beatline__nav">
            <button type="button" className="space-beatline__btn" aria-label={t('space.beat.prev')} title={`${t('space.beat.prev')} (,)`} disabled={!canPrev} onClick={step(-1)}>
              <Icon name="chevron-left" size={16} />
            </button>
            <button type="button" className="space-beatline__btn" aria-label={t('space.beat.next')} title={`${t('space.beat.next')} (.)`} disabled={!canNext} onClick={step(1)}>
              <Icon name="chevron-right" size={16} />
            </button>
          </span>
        </>
      )}
    </div>
  );
}
