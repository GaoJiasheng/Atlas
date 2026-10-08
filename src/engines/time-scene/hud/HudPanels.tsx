/**
 * TimeScene HUD content (docs/08 §2, §5), portaled into the host slots:
 *  - `card`     BandCard: participation (joined → left) and approximate
 *               controlled area per entity over time; hairline at `t`,
 *               current chapter window shaded
 *  - `panel01`  TimelinePanel: the whole span as a compact rule with chapter
 *               numbers, plus keyframe / movement / event lanes
 *  - `panel02`  QuestionPanel: the chapter's question (+ answer), else its
 *               summary (`state.summary` or the body's first paragraph)
 *  - `panel03`  StatePanel: data counts at `t` (no SIM chip: these are counts)
 *  - `perf`     PerfReadout: FEATURES · ZOOM · FPS
 * SVGs are drawn in pixels of the measured panel body; type sizes come from
 * CSS in HUD design pixels (`--u`), so nothing is stretched.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react';
import type { Chapter, Locale } from '../../core/types';
import { useT } from '../../core/context';
import { tx, type BilingualText } from '../../../i18n';
import type { Playhead } from '../lib/playhead';
import type { TimeModel } from '../lib/model';
import { clamp } from '../lib/time';
import { frameAt } from '../lib/frame';
import { ruleTicks } from '../lib/ticks';
import { areaAt, controlAreas, frameStats } from '../lib/stats';
import { planBandRows, type BandRowPlan } from '../lib/bandRows';
import { BLOC_CSS, colorKey, entityCssColor, sideCssColor, sideColorKey } from '../colors';
import { blocSpansN } from '../lib/bloc';
import { formatReadout } from '../timeline/Timeline';

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

/** Size of an element, tracked with a ResizeObserver. */
function useSize<T extends Element>(): [RefObject<T | null>, { w: number; h: number }] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver(read);
    ro.observe(el);
    read();
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

function usePlayheadT(playhead: Playhead): number {
  return useSyncExternalStore(playhead.subscribe, playhead.get, playhead.get);
}

/** HUD design pixel of the scene (`--kt`), read once per size change. */
function useUnit(ref: RefObject<Element | null>, deps: unknown): number {
  const [u, setU] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (el) setU(Number.parseFloat(getComputedStyle(el).getPropertyValue('--kt')) || 1);
  }, [ref, deps]);
  return u;
}

const upper = (s: string) => s.toLocaleUpperCase('en');

/** Hatch patterns, one per colour (`colorKey`): each bloc, plus entities with their own colour. */
function HatchDefs({ model, prefix }: { model: TimeModel; prefix: string }) {
  const own = [...model.entities.values()].filter(({ entity }) => entity.color);
  const pattern = (key: string, color: string) => (
    <pattern key={key} id={`${prefix}-${key}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="5" stroke={color} strokeWidth="0.9" opacity="0.7" />
    </pattern>
  );
  return (
    <defs>
      {(['axis', 'allied', 'neutral'] as const).map((b) => pattern(`b-${b}`, BLOC_CSS[b]))}
      {own.map(({ entity }) => pattern(`e-${entity.id}`, entityCssColor(entity)))}
    </defs>
  );
}

/** Index of the chapter window [node i, node i+1) holding `chapter`. */
function chapterWindow(model: TimeModel, chapter: string | null): [number, number] | null {
  const nodes = [...model.chapterNodes].sort((a, b) => a.t - b.t);
  const i = nodes.findIndex((n) => n.id === chapter);
  if (i < 0) return null;
  return [nodes[i]!.t, nodes[i + 1]?.t ?? model.max];
}

/* ------------------------------------------------------------------ */
/* Card: participation + area band chart                               */
/* ------------------------------------------------------------------ */

/** Smallest band row (design px): EN name line + 中文 line with a gap before the next row's name. */
const BAND_MIN_ROW = 25;
/** The slim "+N others" row that stands in for the entities that do not fit. */
const BAND_REST_ROW = 15;

const fmtArea = (km2: number) =>
  km2 >= 1e6 ? `≈${(km2 / 1e6).toFixed(2)}M KM²` : km2 >= 1e3 ? `≈${Math.round(km2 / 1e3)}K KM²` : `≈${Math.round(km2)} KM²`;

export function BandCard({
  model,
  playhead,
  locale,
  chapter,
  highlight,
}: {
  model: TimeModel;
  playhead: Playhead;
  locale: Locale;
  chapter: string | null;
  highlight: readonly string[];
}) {
  const t = usePlayheadT(playhead);
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const u = useUnit(ref, w);
  const areas = useMemo(() => controlAreas(model), [model]);
  const maxArea = useMemo(() => Math.max(1, ...[...areas.values()].flat()), [areas]);
  const all = useMemo(() => [...model.entities.values()], [model]);

  const pad = 10 * u;
  const x0 = 104 * u;
  const x1 = w - pad;
  const axisH = 20 * u;
  const top = 6 * u;
  const bottom = h - axisH;
  // Too many entities for the card: the most relevant at `t` (largest area, then earliest), the rest folded into one muted row.
  const planRef = useRef<BandRowPlan | null>(null);
  const plan = useMemo(() => {
    const areaNow = new Map(all.map((e) => [e.entity.id, areaAt(model, areas, e.entity.id, t)]));
    const next = planBandRows({ entities: all, t, areaNow, availableHeight: bottom - top, minRowHeight: BAND_MIN_ROW * u, collapsedHeight: BAND_REST_ROW * u });
    // Keep the previous object while the same rows stay in the same order, so the band paths are not rebuilt every playhead tick.
    const prev = planRef.current;
    const same = prev && prev.hidden === next.hidden && prev.rows.length === next.rows.length && prev.rows.every((r, i) => r === next.rows[i]);
    planRef.current = same ? prev : next;
    return planRef.current;
  }, [model, all, areas, t, bottom, top, u]);
  const entities = plan.rows;
  const restH = plan.hidden > 0 ? BAND_REST_ROW * u : 0;
  const rowH = entities.length ? (bottom - top - restH) / entities.length : 0;
  const x = (n: number) => x0 + clamp((n - model.min) / model.span, 0, 1) * (x1 - x0);
  const ticks = useMemo(
    () => ruleTicks(model.min, model.max, model.scale, Math.max(2, (x1 - x0) / (64 * u)), locale),
    [model, x0, x1, u, locale],
  );
  const win = chapterWindow(model, chapter);
  const hl = new Set(highlight);

  const bands = useMemo(
    () =>
      entities.map(({ entity }, i) => {
        const base = top + (i + 1) * rowH - 3 * u;
        const height = Math.max(0, rowH - 10 * u);
        const row = areas.get(entity.id) ?? [];
        const pts = model.keyframes.map((k, j) => [x(k.t), base - ((row[j] ?? 0) / maxArea) * height] as const);
        let d = '';
        if (pts.length) {
          d = `M${pts[0]![0].toFixed(1)} ${base.toFixed(1)}`;
          for (const [px, py] of pts) d += `L${px.toFixed(1)} ${py.toFixed(1)}`;
          const last = pts[pts.length - 1]!;
          d += `L${x1.toFixed(1)} ${last[1].toFixed(1)}L${x1.toFixed(1)} ${base.toFixed(1)}Z`;
        }
        return { entity, base, d };
      }),
    // `x` is derived from these.
    [entities, areas, maxArea, model, rowH, top, u, x0, x1],
  );

  if (w === 0) return <div ref={ref} className="ts-card" />;
  return (
    <div ref={ref} className="ts-card">
      <svg width={w} height={h} className="ts-svg" aria-hidden="true">
        <HatchDefs model={model} prefix="ts-card-hatch" />
        {win && <rect className="ts-svg__window" x={x(win[0])} y={top} width={Math.max(1, x(win[1]) - x(win[0]))} height={bottom - top} />}
        {bands.map(({ entity, base, d }) => {
          const en = model.entities.get(entity.id)!;
          // Area band in the colour of the bloc at `t`; the participation line is split where the entity changes sides.
          const color = entityCssColor(entity, t);
          const left = Number.isFinite(en.left) ? en.left : model.max;
          const segments = entity.color
            ? [{ from: en.joined, to: left, color }]
            : blocSpansN(entity)
                .map((sp) => ({ from: Math.max(en.joined, sp.from), to: Math.min(left, sp.to), color: BLOC_CSS[sp.bloc] }))
                .filter((sp) => sp.to > sp.from);
          return (
            <g key={entity.id} data-hl={hl.has(entity.id) || undefined}>
              <text className="ts-svg__name" x={pad} y={base - rowH + 14 * u}>
                {upper(entity.name.en)}
              </text>
              {rowH >= BAND_MIN_ROW * u - 0.5 && (
                <text className="ts-svg__sub" x={pad} y={base - rowH + 26 * u} lang="zh-Hans">
                  {entity.name.zh}
                </text>
              )}
              {rowH > 42 * u && (
                <text className="ts-svg__mono" x={pad} y={base - rowH + 38 * u}>
                  {fmtArea(areaAt(model, areas, entity.id, t))}
                </text>
              )}
              {d && <path d={d} fill={`url(#ts-card-hatch-${colorKey(entity, t)})`} />}
              {d && <path d={d} className="ts-svg__band" style={{ fill: color, stroke: color }} />}
              {segments.map((sp) => (
                <line key={sp.from} className="ts-svg__part" x1={x(sp.from)} x2={x(sp.to)} y1={base} y2={base} style={{ stroke: sp.color }} />
              ))}
              <circle className="ts-svg__joined" cx={x(en.joined)} cy={base} r={2.4 * u} style={{ stroke: segments[0]?.color ?? color }} />
            </g>
          );
        })}
        {plan.hidden > 0 && (
          <text className="ts-svg__sub ts-svg__rest" x={pad} y={bottom - 4 * u} data-hidden-rows={plan.hidden}>
            {`+${plan.hidden} OTHERS / `}
            <tspan lang="zh-Hans">{`另 ${plan.hidden} 方`}</tspan>
          </text>
        )}
        <line className="ts-svg__axis" x1={x0} x2={x1} y1={bottom} y2={bottom} />
        {ticks.minor.map((m) => (
          <line key={m} className="ts-svg__tick" x1={x(m)} x2={x(m)} y1={bottom} y2={bottom + 2.5 * u} />
        ))}
        {ticks.major.map((m) => (
          <g key={m.t}>
            <line className="ts-svg__axis" x1={x(m.t)} x2={x(m.t)} y1={bottom} y2={bottom + 5 * u} />
            <text className="ts-svg__mono" x={x(m.t)} y={bottom + 14 * u} textAnchor="middle">
              {m.label}
            </text>
          </g>
        ))}
        <line className="ts-svg__cursor" x1={x(t)} x2={x(t)} y1={top} y2={bottom + 5 * u} />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel 01: compact rule + lanes                                      */
/* ------------------------------------------------------------------ */

export function TimelinePanel({
  model,
  playhead,
  locale,
  chapters,
  chapter,
}: {
  model: TimeModel;
  playhead: Playhead;
  locale: Locale;
  chapters: readonly Chapter[];
  chapter: string | null;
}) {
  const tr = useT();
  const t = usePlayheadT(playhead);
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const u = useUnit(ref, w);
  const gutter = 92 * u;
  const pad = 12 * u;
  const x0 = gutter;
  const x1 = w - pad;
  const x = (n: number) => x0 + clamp((n - model.min) / model.span, 0, 1) * (x1 - x0);
  const ticks = useMemo(
    () => ruleTicks(model.min, model.max, model.scale, Math.max(2, (x1 - x0) / (60 * u)), locale),
    [model, x0, x1, u, locale],
  );
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
  const moveRowCount = Math.max(1, ...moveRows.map((r) => r + 1));

  if (w === 0) return <div ref={ref} className="ts-p01" />;
  const ruleY = 18 * u;
  const lane = (i: number) => ruleY + 30 * u + i * 20 * u;
  const lanes: { key: string; label: BilingualText; y: number; h: number }[] = [
    { key: 'k', label: { en: tr('time.spec.keyframes'), zh: '' }, y: lane(0), h: 14 * u },
    { key: 'm', label: { en: tr('time.spec.movements'), zh: '' }, y: lane(1), h: Math.max(14 * u, moveRowCount * 6 * u + 4 * u) },
    { key: 'e', label: { en: tr('time.spec.events'), zh: '' }, y: lane(1) + Math.max(20 * u, moveRowCount * 6 * u + 10 * u), h: 14 * u },
  ];
  const lastLane = lanes[lanes.length - 1]!;
  const bottom = Math.min(h - 4 * u, lastLane.y + lastLane.h);
  const position = new Map(chapters.map((c, i) => [c.id, i + 1]));

  return (
    <div ref={ref} className="ts-p01">
      <svg width={w} height={h} className="ts-svg" aria-hidden="true">
        <HatchDefs model={model} prefix="ts-p01-hatch" />
        {win && <rect className="ts-svg__window" x={x(win[0])} y={ruleY - 10 * u} width={Math.max(1, x(win[1]) - x(win[0]))} height={bottom - ruleY + 10 * u} />}
        <line className="ts-svg__axis" x1={x0} x2={x1} y1={ruleY} y2={ruleY} />
        {ticks.minor.map((m) => (
          <line key={m} className="ts-svg__tick" x1={x(m)} x2={x(m)} y1={ruleY} y2={ruleY + 3 * u} />
        ))}
        {ticks.major.map((m) => (
          <g key={m.t}>
            <line className="ts-svg__axis" x1={x(m.t)} x2={x(m.t)} y1={ruleY} y2={ruleY + 6 * u} />
            <text className="ts-svg__mono" x={x(m.t)} y={ruleY + 15 * u} textAnchor="middle">
              {m.label}
            </text>
          </g>
        ))}
        {model.chapterNodes.map((node) => (
          <g key={node.id} className="ts-svg__node" data-current={node.id === chapter || undefined}>
            <circle cx={x(node.t)} cy={ruleY} r={6.5 * u} />
            <text x={x(node.t)} y={ruleY + 2.6 * u} textAnchor="middle">
              {String(position.get(node.id) ?? 0).padStart(2, '0')}
            </text>
          </g>
        ))}

        {lanes.map((l) => (
          <g key={l.key}>
            <line className="ts-svg__lane" x1={pad} x2={x1} y1={l.y + l.h} y2={l.y + l.h} />
            <text className="ts-svg__name" x={pad} y={l.y + 10.5 * u}>
              {upper(l.label.en)}
            </text>
          </g>
        ))}
        {model.keyframes.map((k, i) => (
          <g key={k.t}>
            <path className="ts-svg__key" d={`M${x(k.t)} ${lanes[0]!.y + 1 * u}l${4 * u} ${4 * u}l${-4 * u} ${4 * u}l${-4 * u} ${-4 * u}z`} />
            <text
              className="ts-svg__mono"
              x={x(k.t) + (x(k.t) > x1 - 24 * u ? -6 : 6) * u}
              y={lanes[0]!.y + 10.5 * u}
              textAnchor={x(k.t) > x1 - 24 * u ? 'end' : 'start'}
            >
              K{i + 1}
            </text>
          </g>
        ))}
        {model.movements.map((m, i) => {
          const holder = model.entities.get(m.movement.holder)?.entity;
          const y = lanes[1]!.y + 3 * u + moveRows[i]! * 6 * u;
          const color = sideCssColor(holder, m.start);
          return (
            <rect
              key={m.movement.id}
              className="ts-svg__bar"
              x={x(m.start)}
              y={y}
              width={Math.max(1, x(m.end) - x(m.start))}
              height={4 * u}
              style={{ fill: `url(#ts-p01-hatch-${sideColorKey(holder, m.start)})`, stroke: color }}
            />
          );
        })}
        {model.events.map((e) => {
          const holder = e.event.sides ? model.entities.get(e.event.sides.attacker)?.entity : undefined;
          const cy = lastLane.y + 7 * u;
          const color = sideCssColor(holder, e.start);
          return (
            <g key={e.event.id}>
              <line className="ts-svg__span" x1={x(e.start)} x2={x(e.end)} y1={cy} y2={cy} style={{ stroke: color }} />
              <circle className="ts-svg__event" cx={x(e.start)} cy={cy} r={(1.5 + e.event.importance) * u} style={{ stroke: color }} />
            </g>
          );
        })}
        <line className="ts-svg__cursor" x1={x(t)} x2={x(t)} y1={ruleY - 10 * u} y2={bottom} />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel 02: question                                                  */
/* ------------------------------------------------------------------ */

export function QuestionPanel({
  chapter,
  number,
  locale,
  fallback,
}: {
  chapter: Chapter | null;
  number: number;
  locale: Locale;
  /** Shown when the chapter has no question: its summary (bilingual) or first paragraph (already localised). */
  fallback: BilingualText | string | null;
}) {
  const tr = useT();
  const state = (chapter?.state ?? {}) as { question?: BilingualText; answer?: BilingualText };
  const question = state.question ?? null;
  const body = question ?? fallback;
  return (
    <div className="ts-p02">
      {chapter && (
        <p className="ts-p02__kick">
          <i>{String(number).padStart(2, '0')}</i> {upper(tx(chapter.title, locale))}
        </p>
      )}
      {body && <p className={question ? 'ts-p02__q' : 'ts-p02__summary'}>{tx(body, locale)}</p>}
      {question && state.answer && (
        <p className="ts-p02__a">
          <b>{upper(tr('time.answer'))}</b> {tx(state.answer, locale)}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel 03: state                                                     */
/* ------------------------------------------------------------------ */

function Row({ label, children }: { label: BilingualText; children: ReactNode }) {
  return (
    <div className="ts-p03__row">
      <dt>
        {upper(label.en)}
        {label.zh && <small lang="zh-Hans">{label.zh}</small>}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

export function StatePanel({
  model,
  playhead,
  locale,
  highlight,
  labels,
}: {
  model: TimeModel;
  playhead: Playhead;
  locale: Locale;
  highlight: readonly string[];
  /** Bilingual row labels (`time.state.*`). */
  labels: Record<'time' | 'participants' | 'battles' | 'movements' | 'keyframe', BilingualText>;
}) {
  const t = usePlayheadT(playhead);
  const stats = frameStats(model, frameAt(model, t, highlight));
  const pad = (n: number) => String(n).padStart(2, '0');
  const k = (i: number) => (i >= 0 ? `K${i + 1}` : '—');
  return (
    <dl className="ts-p03">
      <Row label={labels.time}>{formatReadout(t, model, locale)}</Row>
      <Row label={labels.participants}>
        {pad(stats.participants)} / {pad(stats.entities)}
      </Row>
      <Row label={labels.battles}>{pad(stats.activeBattles)}</Row>
      <Row label={labels.movements}>{pad(stats.activeMovements)}</Row>
      <Row label={labels.keyframe}>
        {k(stats.prevIndex)} → {k(stats.nextIndex)} · {Math.round(stats.blend * 100)}%
        <span className="ts-p03__meter" aria-hidden="true">
          <span style={{ width: `${Math.round(stats.blend * 100)}%` }} />
        </span>
      </Row>
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Perf readout                                                        */
/* ------------------------------------------------------------------ */

/** Frames per second of the page, sampled with rAF over 500 ms windows. */
export function useFps(): RefObject<number> {
  const fps = useRef(0);
  useEffect(() => {
    let raf = 0;
    let n = 0;
    let since = performance.now();
    const tick = (now: number) => {
      n++;
      if (now - since >= 500) {
        fps.current = Math.round((n * 1000) / (now - since));
        n = 0;
        since = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return fps;
}

export function PerfReadout({ read }: { read(): { features: number; zoom: number; fps: number } | null }) {
  const [text, setText] = useState('');
  useEffect(() => {
    const update = () => {
      const s = read();
      if (s) setText(`FEATURES ${s.features.toLocaleString('en')} · ZOOM ${s.zoom.toFixed(1)} · ${s.fps} FPS`);
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [read]);
  return text ? <span className="ts-perf">{text}</span> : null;
}
