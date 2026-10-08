/**
 * Timeline as an engineering rule (docs/08 §5), rendered into `bottomBar`:
 *  - major ticks (years / months / 10 Ma …) with mono labels, minor ticks
 *    (months / days / 1 Ma …), adaptive to the span and width (lib/ticks.ts)
 *  - chapter nodes: numbered hairline circles sitting on the rule; click = go
 *  - keyframes: small hollow diamonds on the rule
 *  - playhead: thin signal-orange line with the formatted date above it;
 *    drag anywhere on the rule = continuous `t`, no chapter change
 *  - play / pause and ×1 ×2 ×4 as 18px hairline HUD buttons
 * Keyboard: Space toggles play inside the timeline; Shift+←/→ nudges `t`;
 * plain ←/→ on the rule still change chapter (like everywhere else).
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import type { Chapter, Locale } from '../../core/types';
import { tx } from '../../../i18n';
import { useT } from '../../core/context';
import { Icon } from '../../widgets/icons';
import type { TimeModel } from '../lib/model';
import type { Playhead } from '../lib/playhead';
import { clamp, fromNumber, precisionFor } from '../lib/time';
import { formatTime } from '../lib/format';
import { ruleTicks } from '../lib/ticks';
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
  /** User moved the playhead to `t` (continuous). */
  onScrub(t: number): void;
  onScrubStart(): void;
  onNudge(direction: 1 | -1, big?: boolean): void;
  onChapter(id: string): void;
  onStepChapter(direction: 1 | -1): void;
}

const SPEEDS: Speed[] = [1, 2, 4];
/** Rule geometry (px inside the bottom bar). */
const RULE_Y = 27;
const RULE_H = 50;
const MAJOR_PX = 72;

export function formatNumber(t: number, model: TimeModel, locale: Locale): string {
  return formatTime(fromNumber(t, model.scale, { precision: precisionFor(model.span) }), locale);
}

/** Mono readout: upper-case in English (`15 FEB 1942`). */
export function formatReadout(t: number, model: TimeModel, locale: Locale): string {
  const s = formatNumber(t, model, locale);
  return locale === 'en' ? s.toLocaleUpperCase('en') : s;
}

/** Width of an element, tracked with a ResizeObserver. */
export function useWidth<T extends Element>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

export function Timeline(props: TimelineProps) {
  const { model, playhead, locale, chapters, currentChapter, playing, speed } = props;
  const tr = useT();
  const t = useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
  const [railRef, width] = useWidth<HTMLDivElement>();
  const dragging = useRef(false);

  const frac = (n: number) => clamp((n - model.min) / model.span, 0, 1);
  const pct = (n: number) => `${(frac(n) * 100).toFixed(3)}%`;
  const readout = formatReadout(t, model, locale);

  const ticks = useMemo(
    () => ruleTicks(model.min, model.max, model.scale, Math.max(2, width / MAJOR_PX), locale),
    [model, width, locale],
  );
  const x = (n: number) => (frac(n) * width).toFixed(1);

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

  const blurAfterPointer = (e: { detail: number; currentTarget: HTMLElement }) => {
    if (e.detail > 0) e.currentTarget.blur();
  };

  const position = new Map(chapters.map((c, i) => [c.id, i]));

  return (
    <div className="ts-timeline" onKeyDown={onRootKey} role="group" aria-label={tr('time.timeline')}>
      <div className="ts-timeline__controls">
        <button
          type="button"
          className={playing ? 'hud-btn on ts-timeline__play' : 'hud-btn ts-timeline__play'}
          aria-label={tr(playing ? 'time.pause' : 'time.play')}
          title={tr(playing ? 'time.pause' : 'time.play')}
          aria-pressed={playing}
          onClick={(e) => {
            props.onTogglePlay();
            blurAfterPointer(e);
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" fill="currentColor">
            {playing ? <path d="M2 1h2.2v8H2zM5.8 1H8v8H5.8z" /> : <path d="M2.2 1v8L9 5z" />}
          </svg>
        </button>
        <div className="ts-timeline__speed" role="radiogroup" aria-label={tr('time.speed')}>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={speed === s}
              className="hud-btn"
              onClick={(e) => {
                props.onSpeed(s);
                blurAfterPointer(e);
              }}
            >
              ×{s}
            </button>
          ))}
        </div>
      </div>

      <div className="ts-rule">
        <div
          ref={railRef}
          className="ts-rule__rail"
          role="slider"
          tabIndex={0}
          aria-label={tr('time.time')}
          aria-valuemin={0}
          aria-valuemax={1000}
          aria-valuenow={Math.round(frac(t) * 1000)}
          aria-valuetext={formatNumber(t, model, locale)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onKeyDown={onRailKey}
        >
          {width > 0 && (
            <svg className="ts-rule__svg" width={width} height={RULE_H} aria-hidden="true">
              <line className="ts-rule__base" x1={0} x2={width} y1={RULE_Y} y2={RULE_Y} />
              <line className="ts-rule__done" x1={0} x2={x(t)} y1={RULE_Y} y2={RULE_Y} />
              {ticks.minor.map((m) => (
                <line key={m} className="ts-rule__minor" x1={x(m)} x2={x(m)} y1={RULE_Y} y2={RULE_Y + 4} />
              ))}
              {ticks.major.map((m) => (
                <g key={m.t}>
                  <line className="ts-rule__major" x1={x(m.t)} x2={x(m.t)} y1={RULE_Y - 3} y2={RULE_Y + 8} />
                  <text className="ts-rule__label" x={x(m.t)} y={RULE_Y + 19} textAnchor={frac(m.t) > 0.97 ? 'end' : frac(m.t) < 0.03 ? 'start' : 'middle'}>
                    {m.label}
                  </text>
                </g>
              ))}
              {ticks.unit && (
                <text className="ts-rule__unit" x={width} y={RULE_Y - 7} textAnchor="end">
                  {ticks.unit}
                </text>
              )}
              {model.keyframes.map((k) => (
                <path key={k.t} className="ts-rule__key" d={`M${x(k.t)} ${RULE_Y - 3.5}l3.5 3.5l-3.5 3.5l-3.5 -3.5z`} />
              ))}
            </svg>
          )}
          <span className="ts-rule__head" style={{ left: pct(t) }} aria-hidden="true" />
          <output className="ts-rule__date" style={{ left: `clamp(3.4em, ${pct(t)}, calc(100% - 3.4em))` }} aria-hidden="true">
            {readout}
          </output>
        </div>
        <ol className="ts-rule__nodes">
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
                  className="ts-rule__node"
                  aria-current={node.id === currentChapter ? 'step' : undefined}
                  data-locked={locked || undefined}
                  disabled={locked && node.id !== currentChapter}
                  aria-label={label}
                  title={label}
                  onClick={(e) => {
                    props.onChapter(node.id);
                    blurAfterPointer(e);
                  }}
                >
                  <span aria-hidden="true">{locked ? <Icon name="lock" size={9} /> : String(n).padStart(2, '0')}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
