/**
 * TimeScene's single bottom bar (docs/06 "底部条", docs/08 §5), rendered into
 * `bottomBar`. Left to right:
 *  - a chevron that opens the swimlanes (the bar has no free-running
 *    playback; the PRESENT button is in the top bar, key P)
 *  - the segmented rule, like the presentation's progress bar: one
 *    equal-width segment per story chapter, labelled with its number and its
 *    start as `YYYY-MM`; inside it a tick per presentation beat at the beat's
 *    time (lib/segmentScale.ts). The current chapter's segment is lit and its
 *    current beat's tick filled. Click a segment = that chapter (the view
 *    applies its first beat, no auto-run); click a tick = that beat's state
 *    (camera, time, layers, highlight; the chapter changes with it). Hover or
 *    focus on a tick shows its date and the start of its caption. The
 *    playhead (a 12 px dot on a hairline stem, date above) drags anywhere on
 *    the rule: a press that moves more than 3 px scrubs continuous `t`
 *    without changing the chapter; keyframe diamonds sit on the same mapping
 *  - a mono state cluster: participants · active battles · active movements ·
 *    control keyframe blend (bilingual labels in the titles)
 * Below the rule, collapsed by default, three swimlanes (keyframes /
 * movements / events) on the same x mapping. Phones: segments only, no ticks.
 *
 * Keyboard: the playhead is a slider (←/→ and ↑/↓ nudge `t` by one step,
 * PageUp/PageDown by ten, Home/End jump to the ends of the playhead's
 * segment); segments are buttons; the current segment's ticks are tab stops
 * too (the others are reached by pointer, or after picking their segment).
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import type { Chapter, Locale } from '../../core/types';
import { t as translate, tx, type BilingualText, type UiKey } from '../../../i18n';
import { useT } from '../../core/context';
import type { TimeModel } from '../lib/model';
import type { Playhead } from '../lib/playhead';
import { fromNumber, precisionFor } from '../lib/time';
import { formatTime } from '../lib/format';
import { createSegmentScale, type Anchor, type ScaleSegment, type SegmentScale, type SegmentSpec } from '../lib/segmentScale';
import { frameAt } from '../lib/frame';
import { frameStats } from '../lib/stats';
import { sideCssColor, sideColorKey } from '../colors';
import { HatchDefs } from '../hud/shared';

export interface TimelineProps {
  model: TimeModel;
  playhead: Playhead;
  locale: Locale;
  /** Story chapters, in the order of `segments`. */
  chapters: readonly Chapter[];
  segments: readonly SegmentSpec[];
  /** Caption (plain text) and date of beat `index` of chapter `id` in `locale`. */
  beatLabel(id: string, index: number): { caption: string; date: string };
  currentChapter: string | null;
  highlight: readonly string[];
  /** Where the playhead belongs (segment, and the beat when it rests on one). */
  anchor: Anchor | null;
  /** User moved the playhead to `t` (continuous) inside `segment`. */
  onScrub(t: number, segment: number): void;
  onScrubStart(): void;
  onNudge(direction: 1 | -1, big?: boolean): void;
  onChapter(id: string): void;
  onBeat(id: string, index: number): void;
}

/** Rule geometry (px inside the rail). */
const RULE_Y = 24;
const RULE_H = 52;
/** A press that moves less than this (px) is a click, not a drag. */
const CLICK_SLOP = 3;
/** A click on the playhead within this distance (px) of a tick counts as a click on that tick. */
const TICK_HIT = 22;
/** Below this segment width (px) the label is the chapter number alone. */
const DATE_LABEL_MIN = 44;
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

/** A segment's label date: `YYYY-MM` (geological time: the readout). */
export function segmentDate(t: number, model: TimeModel, locale: Locale): string {
  if (model.scale === 'ma') return formatReadout(t, model, locale);
  const p = fromNumber(t, 'date', { precision: 'month' });
  return typeof p === 'string' ? p : formatReadout(t, model, locale);
}

/** The first words of a caption for the tick tooltip. */
export function captionExcerpt(text: string, locale: Locale): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (locale === 'zh') return [...clean].length > 22 ? `${[...clean].slice(0, 22).join('')}…` : clean;
  if (clean.length <= 56) return clean;
  const cut = clean.slice(0, 56);
  const space = cut.lastIndexOf(' ');
  return `${(space > 24 ? cut.slice(0, space) : cut).replace(/[,;:.]$/, '')}…`;
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

/** The filled tick of the current segment: the anchored beat, else the last beat at or before `t` while the playhead is in it. */
function filledTick(seg: ScaleSegment | undefined, anchor: Anchor | null, t: number, headSegment: number): number | null {
  if (!seg) return null;
  if (anchor && anchor.segment === seg.index && anchor.tick !== null && anchor.tick !== undefined) return anchor.tick;
  if (headSegment !== seg.index) return null;
  let best: number | null = null;
  for (const k of seg.ticks) if (k.t <= t + 1e-9) best = k.index;
  return best;
}

export function Timeline(props: TimelineProps) {
  const { model, playhead, locale, chapters, segments, currentChapter, anchor } = props;
  const tr = useT();
  const t = useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
  const [railRef, width] = useWidth<HTMLDivElement>();
  const [lanesOpen, setLanesOpen] = useState(false);
  const [tip, setTip] = useState<{ segment: number; tick: number } | null>(null);

  const scale = useMemo(() => createSegmentScale({ segments, max: model.max, width }), [segments, model, width]);
  const current = chapters.findIndex((c) => c.id === currentChapter);
  const headSegment = scale.locate(t, anchor?.segment ?? (current >= 0 ? current : null));
  const headAnchor: Anchor | null = anchor ?? (current >= 0 ? { segment: current } : null);
  const headX = width > 0 ? scale.x(t, headAnchor) : 0;
  const filled = filledTick(scale.segments[current], anchor, t, headSegment);
  const readout = formatReadout(t, model, locale);

  /* ---------- pointer: a press that moves scrubs; one that does not is a click ---------- */
  const drag = useRef<{ grab: number; startX: number; head: boolean; moved: boolean } | null>(null);
  /** A drag just ended: swallow the click it would otherwise produce on a segment or tick. */
  const swallowClick = useRef(false);
  const railX = (clientX: number) => clientX - (railRef.current?.getBoundingClientRect().left ?? 0);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const head = e.target instanceof Element && e.target.closest('.ts-rule__grab') !== null;
    // Grabbing the playhead keeps the pointer's offset inside it (no jump); elsewhere the playhead jumps to the pointer.
    drag.current = { grab: head ? railX(e.clientX) - headX : 0, startX: e.clientX, head, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved) {
      if (Math.abs(e.clientX - d.startX) <= CLICK_SLOP) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setTip(null);
      props.onScrubStart();
    }
    const at = scale.invert(railX(e.clientX) - d.grab);
    props.onScrub(at.t, at.segment);
  };
  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!d) return;
    if (d.moved) {
      swallowClick.current = true;
      window.setTimeout(() => (swallowClick.current = false), 0);
      return;
    }
    // A click on the playhead (it rests on a tick): the nearest tick within reach, else its segment.
    if (d.head && e.type === 'pointerup') {
      const px = railX(e.clientX);
      const seg = scale.segments[scale.segmentAt(px)];
      if (!seg) return;
      let best: { index: number; dist: number } | null = null;
      for (const k of seg.ticks) {
        const dist = Math.abs(k.x - px);
        if (dist <= TICK_HIT && (!best || dist < best.dist)) best = { index: k.index, dist };
      }
      if (best) props.onBeat(seg.id, best.index);
      else props.onChapter(seg.id);
    }
  };

  const onHeadKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const seg = scale.segments[headSegment];
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (dir) props.onNudge(dir);
    else if (e.key === 'PageUp' || e.key === 'PageDown') props.onNudge(e.key === 'PageUp' ? 1 : -1, true);
    else if (e.key === 'Home' && seg) props.onScrub(seg.start, seg.index);
    else if (e.key === 'End' && seg) props.onScrub(seg.end, seg.index);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const tipSeg = tip ? scale.segments[tip.segment] : undefined;
  const tipTick = tip && tipSeg ? tipSeg.ticks[tip.tick] : undefined;

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
        </div>

        <div className="ts-rule">
          <div
            ref={railRef}
            className="ts-rule__rail"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
          >
            {width > 0 && (
              <svg className="ts-rule__svg" width={width} height={RULE_H} aria-hidden="true">
                {scale.segments.map((seg) => {
                  const state = seg.index < current ? 'done' : seg.index === current ? 'current' : 'todo';
                  const fillTo = state === 'done' ? seg.x1 : state === 'current' ? Math.min(Math.max(headX, seg.x0), seg.x1) : seg.x0;
                  return (
                    <g key={seg.id} data-state={state}>
                      <line className="ts-seg__track" x1={seg.x0} x2={seg.x1} y1={RULE_Y} y2={RULE_Y} />
                      {fillTo > seg.x0 && <line className="ts-seg__done" x1={seg.x0} x2={fillTo} y1={RULE_Y} y2={RULE_Y} />}
                      <line className="ts-seg__edge" x1={seg.x0} x2={seg.x0} y1={RULE_Y - 4} y2={RULE_Y + 9} />
                    </g>
                  );
                })}
                {model.keyframes.map((k) => (
                  <path key={k.t} className="ts-rule__key" d={`M${scale.x(k.t)} ${RULE_Y - 3}l3 3l-3 3l-3 -3z`} />
                ))}
              </svg>
            )}
            <span className="ts-rule__head" style={{ left: `${headX}px` }} aria-hidden="true" />
            {width > 0 && (
              <ol className="ts-segs">
                {scale.segments.map((seg) => {
                  const chapter = chapters[seg.index];
                  if (!chapter) return null;
                  const n = String(seg.index + 1).padStart(2, '0');
                  const date = segmentDate(seg.start, model, locale);
                  const state = seg.index < current ? 'done' : seg.index === current ? 'current' : 'todo';
                  const label = tr('time.segment', { n: seg.index + 1, title: tx(chapter.title, locale), time: date });
                  const wide = seg.x1 - seg.x0 >= DATE_LABEL_MIN;
                  return (
                    <li key={seg.id} className="ts-seg" data-state={state} style={{ left: `${seg.x0}px`, width: `${seg.x1 - seg.x0}px` }}>
                      <button
                        type="button"
                        className="ts-seg__btn"
                        data-segment={seg.id}
                        aria-current={state === 'current' ? 'step' : undefined}
                        aria-label={label}
                        title={label}
                        onClick={(e) => {
                          if (swallowClick.current) return;
                          props.onChapter(seg.id);
                          blurAfterPointer(e);
                        }}
                      >
                        <span className="ts-seg__no">{n}</span>
                        {wide && <span className="ts-seg__date">{date}</span>}
                      </button>
                      {seg.ticks.map((k, j) => {
                        const { caption, date: time } = props.beatLabel(seg.id, k.index);
                        // The hit area reaches halfway to the neighbouring ticks (10–28 px).
                        const sorted = [...seg.ticks].sort((a, b) => a.x - b.x);
                        const at = sorted.indexOf(k);
                        const left = at > 0 ? (k.x - sorted[at - 1]!.x) / 2 : 14;
                        const right = at < sorted.length - 1 ? (sorted[at + 1]!.x - k.x) / 2 : 14;
                        const hit = Math.max(10, Math.min(28, 2 * Math.min(left, right)));
                        return (
                          <button
                            key={j}
                            type="button"
                            className="ts-seg__tick"
                            data-beat={`${seg.id}.${k.index}`}
                            data-filled={(state === 'current' && filled === k.index) || undefined}
                            tabIndex={state === 'current' ? 0 : -1}
                            aria-label={tr('time.beatTick', { n: seg.index + 1, k: k.index + 1, time, caption })}
                            style={{ left: `${k.x - seg.x0}px`, width: `${hit}px` }}
                            onClick={(e) => {
                              if (swallowClick.current) return;
                              props.onBeat(seg.id, k.index);
                              blurAfterPointer(e);
                            }}
                            onPointerEnter={() => setTip({ segment: seg.index, tick: k.index })}
                            onPointerLeave={() => setTip(null)}
                            onFocus={() => setTip({ segment: seg.index, tick: k.index })}
                            onBlur={() => setTip(null)}
                          />
                        );
                      })}
                    </li>
                  );
                })}
              </ol>
            )}
            <output className="ts-rule__date" style={{ left: `clamp(3.4em, ${headX}px, calc(100% - 3.4em))` }} aria-hidden="true">
              {readout}
            </output>
            {/* The playhead's 44 px hit area: above the ticks so it can be grabbed where it rests on one. */}
            {width > 0 && (
              <span
                className="ts-rule__grab"
                role="slider"
                tabIndex={0}
                aria-label={tr('time.time')}
                aria-orientation="horizontal"
                aria-valuemin={scale.segments[0]?.start ?? model.min}
                aria-valuemax={scale.segments.at(-1)?.end ?? model.max}
                aria-valuenow={t}
                aria-valuetext={formatNumber(t, model, locale)}
                style={{ left: `${headX}px` }}
                onKeyDown={onHeadKey}
              />
            )}
            {tipSeg && tipTick && (
              <p className="ts-tip" role="tooltip" style={{ left: `clamp(8em, ${tipTick.x}px, calc(100% - 8em))` }}>
                <b>{props.beatLabel(tipSeg.id, tipTick.index).date}</b>
                <span>{captionExcerpt(props.beatLabel(tipSeg.id, tipTick.index).caption, locale)}</span>
              </p>
            )}
          </div>
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
              {width > 0 && <Swimlanes model={model} scale={scale} width={width} headX={headX} current={current} />}
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

function Swimlanes({ model, scale, width, headX, current }: { model: TimeModel; scale: SegmentScale; width: number; headX: number; current: number }) {
  const x = (t: number) => scale.x(t);
  const win = scale.segments[current];
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
      {win && <rect className="ts-svg__window" x={win.x0} y={0} width={Math.max(1, win.x1 - win.x0)} height={LANES_H} />}
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
      <line className="ts-svg__cursor" x1={headX} x2={headX} y1={0} y2={LANES_H} />
    </svg>
  );
}
