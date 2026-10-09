/**
 * TimeScene's single bottom bar (docs/06 "时间轴标尺", docs/08 §5), rendered
 * into `bottomBar`. Left to right:
 *  - a chevron that opens the swimlanes and the PRESENT button (P: the
 *    user-paced presentation beats; the bar has no free-running playback)
 *  - the rule: year / month ticks at real dates, chapter nodes (numbered
 *    hairline circles; click = go), keyframe diamonds, the playhead with its
 *    date above; drag anywhere on it = continuous `t`, no chapter change
 *  - a mono state cluster: participants · active battles · active movements ·
 *    control keyframe blend (bilingual labels in the titles)
 * Below the rule, collapsed by default, three swimlanes (keyframes /
 * movements / events) on the same x mapping.
 *
 * The x mapping is the minimum-gap hybrid of lib/timeScale.ts: chapters stay
 * ≥ 56 px apart, time stays as linear as that allows. Scrubbing inverts it.
 * The fitted α is reported upwards (`onAlpha`) so the band card draws on the
 * same mapping.
 *
 * Keyboard: on the rule ←/→ change chapter,
 * Shift+←/→ and ↑/↓ nudge `t`, PageUp/PageDown take big steps, Home/End jump
 * to the ends.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import type { Chapter, Locale } from '../../core/types';
import { t as translate, tx, type BilingualText, type UiKey } from '../../../i18n';
import { useT } from '../../core/context';
import type { TimeModel } from '../lib/model';
import type { Playhead } from '../lib/playhead';
import { fromNumber, precisionFor } from '../lib/time';
import { formatTime } from '../lib/format';
import { ruleTicks } from '../lib/ticks';
import { createTimeScale, thinTicks, type TimeScale } from '../lib/timeScale';
import { frameAt } from '../lib/frame';
import { frameStats } from '../lib/stats';
import { sideCssColor, sideColorKey } from '../colors';
import { chapterWindow, HatchDefs } from '../hud/shared';

export interface TimelineProps {
  model: TimeModel;
  playhead: Playhead;
  locale: Locale;
  chapters: readonly Chapter[];
  currentChapter: string | null;
  highlight: readonly string[];
  /** The presentation is on (PRESENT button pressed). */
  presenting: boolean;
  onPresent(): void;
  /** User moved the playhead to `t` (continuous). */
  onScrub(t: number): void;
  onScrubStart(): void;
  onNudge(direction: 1 | -1, big?: boolean): void;
  onChapter(id: string): void;
  onStepChapter(direction: 1 | -1): void;
  /** The α the rule fitted to its width (band card reuses it). */
  onAlpha(alpha: number): void;
}

/** Rule geometry (px inside the bottom bar). */
const RULE_Y = 27;
const RULE_H = 50;
const MAJOR_PX = 72;
/** Smallest distance between two year / month labels on the rule. */
const LABEL_GAP = 34;
/** Swimlanes: keyframes, movements, events (px). */
const LANES = { k: [0, 12], m: [14, 34], e: [36, 48] } as const;
const LANES_H = 48;

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

const blurAfterPointer = (e: { detail: number; currentTarget: HTMLElement }) => {
  if (e.detail > 0) e.currentTarget.blur();
};

export function Timeline(props: TimelineProps) {
  const { model, playhead, locale, chapters, currentChapter, presenting, onAlpha } = props;
  const tr = useT();
  const t = useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
  const [railRef, width] = useWidth<HTMLDivElement>();
  const dragging = useRef(false);
  const [lanesOpen, setLanesOpen] = useState(false);

  const scale = useMemo(
    () => createTimeScale({ min: model.min, max: model.max, nodes: model.chapterNodes.map((n) => n.t), width }),
    [model, width],
  );
  useEffect(() => {
    if (width > 0) onAlpha(scale.alpha);
  }, [scale, width, onAlpha]);
  const x = (n: number) => scale.x(n);
  const readout = formatReadout(t, model, locale);

  const ticks = useMemo(() => {
    const raw = ruleTicks(model.min, model.max, model.scale, Math.max(2, width / MAJOR_PX), locale);
    return { ...thinTicks(raw.major, raw.minor, scale.x, LABEL_GAP), unit: raw.unit };
  }, [model, width, locale, scale]);

  const timeAt = (clientX: number) => {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return t;
    return scale.invert(clientX - rect.left);
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

  const position = new Map(chapters.map((c, i) => [c.id, i]));
  const headX = width > 0 ? x(t) : 0;

  return (
    <div className="ts-timeline" role="group" aria-label={tr('time.timeline')} data-lanes={lanesOpen ? 'open' : 'closed'}>
      <div className="ts-timeline__grid">
        <div className="ts-timeline__controls">
          <button
            type="button"
            className="hud-btn ts-timeline__lanes"
            aria-expanded={lanesOpen}
            aria-controls="ts-lanes"
            aria-label={tr(lanesOpen ? 'time.lanes.hide' : 'time.lanes.show')}
            title={tr(lanesOpen ? 'time.lanes.hide' : 'time.lanes.show')}
            onClick={(e) => {
              setLanesOpen((v) => !v);
              blurAfterPointer(e);
            }}
          >
            <i aria-hidden="true" />
          </button>
          <button
            type="button"
            className="hud-btn ts-timeline__present"
            aria-pressed={presenting}
            title={`${tr('time.presentHint')} (P)`}
            onClick={(e) => {
              props.onPresent();
              blurAfterPointer(e);
            }}
          >
            {tr('time.present')}
          </button>
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
            aria-valuenow={width > 0 ? Math.round((headX / width) * 1000) : 0}
            aria-valuetext={formatNumber(t, model, locale)}
            data-alpha={scale.alpha.toFixed(3)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onKeyDown={onRailKey}
          >
            {width > 0 && (
              <svg className="ts-rule__svg" width={width} height={RULE_H} aria-hidden="true">
                <line className="ts-rule__base" x1={0} x2={width} y1={RULE_Y} y2={RULE_Y} />
                <line className="ts-rule__done" x1={0} x2={headX} y1={RULE_Y} y2={RULE_Y} />
                {ticks.minor.map((px) => (
                  <line key={px} className="ts-rule__minor" x1={px} x2={px} y1={RULE_Y} y2={RULE_Y + 4} />
                ))}
                {ticks.major.map((m) => (
                  <g key={m.t}>
                    <line className="ts-rule__major" x1={m.x} x2={m.x} y1={RULE_Y - 3} y2={RULE_Y + 8} />
                    {m.showLabel && (
                      <text
                        className="ts-rule__label"
                        x={m.x}
                        y={RULE_Y + 19}
                        textAnchor={m.x > width - 16 ? 'end' : m.x < 16 ? 'start' : 'middle'}
                      >
                        {m.label}
                      </text>
                    )}
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
            <span className="ts-rule__head" style={{ left: `${headX}px` }} aria-hidden="true" />
            <output className="ts-rule__date" style={{ left: `clamp(3.4em, ${headX}px, calc(100% - 3.4em))` }} aria-hidden="true">
              {readout}
            </output>
          </div>
          <ol className="ts-rule__nodes">
            {width > 0 &&
              model.chapterNodes.map((node) => {
                const chapter = chapters.find((c) => c.id === node.id);
                if (!chapter) return null;
                const n = (position.get(node.id) ?? 0) + 1;
                const label = tr('time.chapterNode', {
                  n,
                  title: tx(chapter.title, locale),
                  time: formatNumber(node.t, model, locale),
                });
                return (
                  <li key={node.id} style={{ left: `${x(node.t)}px` }}>
                    <button
                      type="button"
                      className="ts-rule__node"
                      aria-current={node.id === currentChapter ? 'step' : undefined}
                      aria-label={label}
                      title={label}
                      onClick={(e) => {
                        props.onChapter(node.id);
                        blurAfterPointer(e);
                      }}
                    >
                      <span aria-hidden="true">{String(n).padStart(2, '0')}</span>
                    </button>
                  </li>
                );
              })}
          </ol>
        </div>

        <StateCluster model={model} t={t} highlight={props.highlight} locale={locale} />

        {lanesOpen && (
          <>
            <ul className="ts-lanes__labels" aria-hidden="true">
              <li style={{ top: LANES.k[0], height: LANES.k[1] - LANES.k[0] }}>{tr('time.spec.keyframes')}</li>
              <li style={{ top: LANES.m[0], height: LANES.m[1] - LANES.m[0] }}>{tr('time.spec.movements')}</li>
              <li style={{ top: LANES.e[0], height: LANES.e[1] - LANES.e[0] }}>{tr('time.spec.events')}</li>
            </ul>
            <div id="ts-lanes" className="ts-lanes">
              {width > 0 && <Swimlanes model={model} scale={scale} width={width} t={t} chapter={currentChapter} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* State cluster (was panel 03)                                        */
/* ------------------------------------------------------------------ */

function StateCluster({ model, t, highlight, locale }: { model: TimeModel; t: number; highlight: readonly string[]; locale: Locale }) {
  const tr = useT();
  const stats = frameStats(model, frameAt(model, t, highlight));
  const pad = (n: number) => String(n).padStart(2, '0');
  const k = (i: number) => (i >= 0 ? `K${i + 1}` : '—');
  const bi = (key: UiKey): BilingualText => ({ en: translate('en', key), zh: translate('zh', key) });
  const title = (label: BilingualText, value: string) => `${label.en} / ${label.zh} — ${value}`;
  const parts: { id: string; text: string; label: BilingualText }[] = [
    { id: 'participants', text: `${pad(stats.participants)} / ${pad(stats.entities)}`, label: bi('time.state.participants') },
    { id: 'battles', text: tr(stats.activeBattles === 1 ? 'time.cluster.battle' : 'time.cluster.battles', { n: stats.activeBattles }), label: bi('time.state.battles') },
    {
      id: 'movements',
      text: tr(stats.activeMovements === 1 ? 'time.cluster.movement' : 'time.cluster.movements', { n: stats.activeMovements }),
      label: bi('time.state.movements'),
    },
    { id: 'keyframe', text: `${k(stats.prevIndex)}→${k(stats.nextIndex)} ${Math.round(stats.blend * 100)} %`, label: bi('time.state.keyframe') },
  ];
  return (
    <p className="ts-state" aria-label={parts.map((p) => `${p.label[locale] || p.label.en}: ${p.text}`).join(' · ')}>
      {parts.map((p, i) => (
        <span key={p.id} title={title(p.label, p.text)} data-stat={p.id}>
          {i > 0 && <i aria-hidden="true">·</i>}
          {p.text}
        </span>
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Swimlanes (keyframes / movements / events), same mapping as the rule */
/* ------------------------------------------------------------------ */

function Swimlanes({ model, scale, width, t, chapter }: { model: TimeModel; scale: TimeScale; width: number; t: number; chapter: string | null }) {
  const x = scale.x;
  const win = chapterWindow(model, chapter);
  // Movement bars stack into as few rows as overlap needs.
  const moveRows = useMemo(() => {
    const ends: number[] = [];
    return model.movements.map((m) => {
      let row = ends.findIndex((end) => end < m.start);
      if (row < 0) row = ends.length;
      ends[row] = m.end;
      return row;
    });
  }, [model]);
  const rowCount = Math.max(1, ...moveRows.map((r) => r + 1));
  const [m0, m1] = LANES.m;
  const rowStep = (m1 - m0 - 2) / rowCount;
  const barH = Math.max(1, Math.min(4, rowStep - 0.5));
  const ky = (LANES.k[0] + LANES.k[1]) / 2;
  const ey = (LANES.e[0] + LANES.e[1]) / 2;
  return (
    <svg className="ts-svg ts-lanes__svg" width={width} height={LANES_H} aria-hidden="true">
      <HatchDefs model={model} prefix="ts-lane-hatch" />
      {win && <rect className="ts-svg__window" x={x(win[0])} y={0} width={Math.max(1, x(win[1]) - x(win[0]))} height={LANES_H} />}
      {[LANES.k[1] + 1, LANES.m[1] + 1].map((y) => (
        <line key={y} className="ts-svg__lane" x1={0} x2={width} y1={y} y2={y} />
      ))}
      {model.keyframes.map((k) => (
        <path key={k.t} className="ts-svg__key" d={`M${x(k.t)} ${ky - 4}l4 4l-4 4l-4 -4z`} />
      ))}
      {model.movements.map((m, i) => {
        const holder = model.entities.get(m.movement.holder)?.entity;
        const color = sideCssColor(holder, m.start);
        return (
          <rect
            key={m.movement.id}
            className="ts-svg__bar"
            x={x(m.start)}
            y={m0 + 1 + moveRows[i]! * rowStep}
            width={Math.max(1, x(m.end) - x(m.start))}
            height={barH}
            style={{ fill: `url(#ts-lane-hatch-${sideColorKey(holder, m.start)})`, stroke: color }}
          />
        );
      })}
      {model.events.map((e) => {
        const holder = e.event.sides ? model.entities.get(e.event.sides.attacker)?.entity : undefined;
        const color = sideCssColor(holder, e.start);
        return (
          <g key={e.event.id}>
            <line className="ts-svg__span" x1={x(e.start)} x2={x(e.end)} y1={ey} y2={ey} style={{ stroke: color }} />
            <circle className="ts-svg__event" cx={x(e.start)} cy={ey} r={1 + e.event.importance} style={{ stroke: color }} />
          </g>
        );
      })}
      <line className="ts-svg__cursor" x1={x(t)} x2={x(t)} y1={0} y2={LANES_H} />
    </svg>
  );
}

