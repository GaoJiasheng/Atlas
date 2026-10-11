/**
 * The chapter axis (docs/08 §2 "全引擎 HUD 铁律" a, docs/06 "章节轴"): the one
 * row at the bottom of the stage, in the grammar of TimeScene's segmented
 * timeline and the presentation's progress bar. One equal-width segment per
 * chapter (number + title, `BG` for the background chapter), a tick per beat
 * inside it (a chapter without beats of its own is one tick), the current
 * chapter's segment lit and its beat on show filled. A segment is a button
 * (the chapter's first beat), a tick is a button (that beat); nothing runs by
 * itself. The right end carries a short readout (SpaceScene: `05 · 2/8`).
 *
 * The chevron at the left folds the axis into a hairline with the chapter
 * number only (the engine keeps the state; SpaceScene uses the HUD store's
 * `panelsOpen`, per tab). Phones (< 760 px): numbers only, no ticks; beats are
 * stepped from the reading panel's beat line.
 *
 * Keyboard: segments are tab stops, the current segment's ticks too (the
 * others are reached by pointer, or after picking their segment); the host's
 * ← → change chapters and the engine's `beatStep` (`,` / `.`) steps beats.
 *
 * Engines render it into their `bottomBar` slot. TimeScene's Timeline and
 * MathScene's step bar are the same family (to be unified on this component).
 */
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import type { Locale } from '../types';
import { t } from '../../../i18n';
import { segmentFill, tickPosition } from './axis';

export interface AxisChapter {
  id: string;
  /** `05`, or `BG` for the background chapter. */
  number: string;
  title: string;
  /** Plain-text caption of each beat (at least one: a chapter without beats of its own is one beat). */
  beats: readonly string[];
}

export interface ChapterAxisProps {
  chapters: readonly AxisChapter[];
  /** The chapter on show. */
  chapter: string | null;
  /** Its beat on show (filled tick), `null` = none (the chapter's own state). */
  beat: number | null;
  /** Expanded (`false`: a hairline with the chapter number only). */
  open: boolean;
  onOpen(open: boolean): void;
  /** A segment: the chapter's first beat. */
  onChapter(id: string): void;
  /** A tick: that beat. */
  onBeat(id: string, index: number): void;
  /** Right-end readout (short, mono). */
  status?: ReactNode;
  locale: Locale;
}

const blurAfterPointer = (e: MouseEvent<HTMLElement>) => {
  if (e.detail > 0) e.currentTarget.blur();
};

export function ChapterAxis({ chapters, chapter, beat, open, onOpen, onChapter, onBeat, status, locale }: ChapterAxisProps) {
  const current = chapters.findIndex((c) => c.id === chapter);
  const here = chapters[current];
  const fold = t(locale, open ? 'axis.fold' : 'axis.unfold');
  return (
    <div className="atlas-axis" role="group" aria-label={t(locale, 'axis.label')} data-folded={open ? undefined : ''}>
      <button
        type="button"
        className="atlas-axis__fold"
        aria-expanded={open}
        aria-label={fold}
        title={fold}
        onClick={(e) => {
          onOpen(!open);
          blurAfterPointer(e);
        }}
      >
        <i aria-hidden="true" />
        {!open && here && <b>{here.number}</b>}
      </button>
      {open ? (
        <ol className="atlas-axis__segs">
          {chapters.map((c, ci) => {
            const state = ci < current ? 'done' : ci === current ? 'current' : 'todo';
            const n = c.beats.length;
            const fill = state === 'done' ? 1 : state === 'current' ? segmentFill(beat, n) : 0;
            const label = t(locale, 'axis.segment', { n: c.number, title: c.title });
            return (
              <li key={c.id} className="atlas-axis__seg" data-state={state} style={{ '--n': String(Math.max(1, n)) } as CSSProperties}>
                <button
                  type="button"
                  className="atlas-axis__btn"
                  data-chapter={c.id}
                  aria-current={state === 'current' ? 'step' : undefined}
                  aria-label={label}
                  title={label}
                  onClick={(e) => {
                    onChapter(c.id);
                    blurAfterPointer(e);
                  }}
                >
                  <span className="atlas-axis__no">{c.number}</span>
                  <span className="atlas-axis__title">{c.title}</span>
                </button>
                <span className="atlas-axis__track" aria-hidden="true">
                  {fill > 0 && <i style={{ width: `${(fill * 100).toFixed(2)}%` }} />}
                </span>
                {c.beats.map((caption, k) => {
                  const tick = t(locale, 'axis.tick', { n: c.number, k: k + 1, count: n, caption });
                  return (
                    <button
                      key={k}
                      type="button"
                      className="atlas-axis__tick"
                      data-beat={`${c.id}.${k}`}
                      data-filled={(state === 'current' && beat === k) || undefined}
                      tabIndex={state === 'current' ? 0 : -1}
                      aria-label={tick}
                      title={tick}
                      style={{ left: `${(tickPosition(k, n) * 100).toFixed(2)}%` }}
                      onClick={(e) => {
                        onBeat(c.id, k);
                        blurAfterPointer(e);
                      }}
                    />
                  );
                })}
              </li>
            );
          })}
        </ol>
      ) : (
        <span className="atlas-axis__hair" aria-hidden="true" />
      )}
      {open && status !== undefined && <output className="atlas-axis__status">{status}</output>}
    </div>
  );
}
