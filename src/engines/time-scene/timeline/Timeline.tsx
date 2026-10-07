/**
 * Timeline (docs/03 §A controller), rendered into the `bottomBar` slot:
 *  - chapter nodes at each chapter's resolved time (non-uniform); click = go
 *  - fine scrubber over the data span; drag = continuous `t`, no chapter change
 *  - play / pause and ×1 ×2 ×4
 * Keyboard: Space toggles play inside the timeline; Shift+←/→ nudges `t`;
 * plain ←/→ on the scrubber still change chapter (like everywhere else).
 */
import { useRef, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from 'react';
import type { Chapter, Locale } from '../../core/types';
import { tx } from '../../../i18n';
import { useT } from '../../core/context';
import { Icon } from '../../widgets/icons';
import type { TimeModel } from '../lib/model';
import type { Playhead } from '../lib/playhead';
import { clamp, fromNumber, precisionFor } from '../lib/time';
import { formatTime } from '../lib/format';
import type { Speed } from './usePlayback';

export interface TimelineProps {
  model: TimeModel;
  playhead: Playhead;
  locale: Locale;
  chapters: readonly Chapter[];
  currentChapter: string | null;
  isLocked(chapter: Chapter): boolean;
  playing: boolean;
  speed: Speed;
  onTogglePlay(): void;
  onSpeed(speed: Speed): void;
  /** User moved the scrubber to `t` (continuous). */
  onScrub(t: number): void;
  onScrubStart(): void;
  onNudge(direction: 1 | -1, big?: boolean): void;
  onChapter(id: string): void;
  onStepChapter(direction: 1 | -1): void;
}

const SPEEDS: Speed[] = [1, 2, 4];

export function formatNumber(t: number, model: TimeModel, locale: Locale): string {
  return formatTime(fromNumber(t, model.scale, { precision: precisionFor(model.span) }), locale);
}

export function Timeline(props: TimelineProps) {
  const { model, playhead, locale, chapters, currentChapter, playing, speed } = props;
  const tr = useT();
  const t = useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
  const railRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pct = (n: number) => `${(clamp((n - model.min) / model.span, 0, 1) * 100).toFixed(3)}%`;
  const readout = formatNumber(t, model, locale);

  const timeAt = (clientX: number) => {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return t;
    return model.min + clamp((clientX - rect.left) / rect.width, 0, 1) * model.span;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    props.onScrubStart();
    props.onScrub(timeAt(e.clientX));
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) props.onScrub(timeAt(e.clientX));
  };
  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onRailKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (dir && e.shiftKey) props.onNudge(dir);
    else if (dir && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) props.onStepChapter(dir);
    else if (dir) props.onNudge(dir);
    else if (e.key === 'PageUp' || e.key === 'PageDown') props.onNudge(e.key === 'PageUp' ? 1 : -1, true);
    else if (e.key === 'Home') props.onScrub(model.min);
    else if (e.key === 'End') props.onScrub(model.max);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const onRootKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== ' ' || e.altKey || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    props.onTogglePlay();
  };

  const position = new Map(chapters.map((c, i) => [c.id, i]));

  return (
    <div className="ts-timeline" onKeyDown={onRootKey} role="group" aria-label={tr('time.timeline')}>
      <div className="ts-timeline__controls">
        <button
          type="button"
          className="atlas-control atlas-control--icon ts-timeline__play"
          aria-label={tr(playing ? 'time.pause' : 'time.play')}
          title={tr(playing ? 'time.pause' : 'time.play')}
          aria-pressed={playing}
          onClick={props.onTogglePlay}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
          </svg>
        </button>
        <div className="atlas-segmented ts-timeline__speed" role="radiogroup" aria-label={tr('time.speed')}>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={speed === s}
              className="atlas-control"
              onClick={() => props.onSpeed(s)}
            >
              ×{s}
            </button>
          ))}
        </div>
        <output className="atlas-bottombar__readout ts-timeline__readout" aria-live="off">
          {readout}
        </output>
      </div>

      <div className="ts-timeline__track">
        <ol className="ts-timeline__nodes">
          {model.chapterNodes.map((node) => {
            const chapter = chapters.find((c) => c.id === node.id);
            if (!chapter) return null;
            const n = (position.get(node.id) ?? 0) + 1;
            const locked = props.isLocked(chapter);
            const label = locked
              ? tr('time.lockedNode', { n })
              : tr('time.chapterNode', {
                  n,
                  title: tx(chapter.title, locale),
                  time: formatNumber(node.t, model, locale),
                });
            return (
              <li key={node.id} style={{ left: pct(node.t) }}>
                <button
                  type="button"
                  className="ts-timeline__node"
                  aria-current={node.id === currentChapter ? 'step' : undefined}
                  data-locked={locked || undefined}
                  disabled={locked && node.id !== currentChapter}
                  aria-label={label}
                  title={label}
                  onClick={() => props.onChapter(node.id)}
                >
                  <span aria-hidden="true">{locked ? <Icon name="lock" size={12} /> : n}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div
          ref={railRef}
          className="ts-timeline__rail"
          role="slider"
          tabIndex={0}
          aria-label={tr('time.time')}
          aria-valuemin={0}
          aria-valuemax={1000}
          aria-valuenow={Math.round(clamp((t - model.min) / model.span, 0, 1) * 1000)}
          aria-valuetext={readout}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onKeyDown={onRailKey}
        >
          <span className="ts-timeline__line" aria-hidden="true">
            <span className="ts-timeline__fill" style={{ width: pct(t) }} />
          </span>
          {model.keyframes.map((k) => (
            <span key={k.t} className="ts-timeline__tick" style={{ left: pct(k.t) }} aria-hidden="true" />
          ))}
          {model.events.map((e) => (
            <span
              key={e.event.id}
              className="ts-timeline__tick ts-timeline__tick--event"
              data-importance={e.event.importance}
              style={{ left: pct(e.start) }}
              aria-hidden="true"
            />
          ))}
          <span className="ts-timeline__thumb" style={{ left: pct(t) }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
