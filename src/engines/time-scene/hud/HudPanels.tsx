/**
 * TimeScene HUD content (docs/08 §2, §5), portaled into the host slots:
 *  - `card`  BandCard: participation (joined → left) and approximate
 *            controlled area per entity over time; hairline at `t`, current
 *            chapter's segment shaded. The x axis is the timeline's segmented
 *            mapping (lib/segmentScale.ts) on the card's own width. Collapsed it shows the rows that fit
 *            plus "+N others"; expanded (header or that row) it lists every
 *            entity and scrolls. Clicking a row selects the entity (map
 *            highlight + inspector).
 *  - `perf`  PerfReadout: FEATURES · ZOOM · FPS
 * The state counts that used to be panel 03 are the timeline's state cluster
 * (timeline/Timeline.tsx). SVGs are drawn in pixels of the measured card
 * body; type sizes come from CSS in HUD design pixels (`--u`).
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import type { Locale } from '../../core/types';
import { useT } from '../../core/context';
import type { Playhead } from '../lib/playhead';
import type { EntityN, TimeModel } from '../lib/model';
import { ruleTicks, thinTicks } from '../lib/ticks';
import { areaAt, controlAreas } from '../lib/stats';
import { planBandRows, rankBandEntities, type BandRowPlan } from '../lib/bandRows';
import { createSegmentScale, type Anchor, type SegmentSpec } from '../lib/segmentScale';
import { BLOC_CSS, colorKey, entityCssColor } from '../colors';
import { blocSpansN } from '../lib/bloc';
import { HatchDefs, upper, usePlayheadT, useSize, useUnit } from './shared';

/* ------------------------------------------------------------------ */
/* Card: participation + area band chart                               */
/* ------------------------------------------------------------------ */

/** Smallest band row (design px): EN name line + 中文 line with a gap before the next row's name. */
const BAND_MIN_ROW = 25;
/** Row height when the card is expanded to the full list. */
const BAND_EXPANDED_ROW = 30;
/** The slim "+N others" row that stands in for the entities that do not fit. */
const BAND_REST_ROW = 15;

export const fmtArea = (km2: number) =>
  km2 >= 1e6 ? `≈${(km2 / 1e6).toFixed(2)}M KM²` : km2 >= 1e3 ? `≈${Math.round(km2 / 1e3)}K KM²` : `≈${Math.round(km2)} KM²`;

export interface BandCardProps {
  model: TimeModel;
  playhead: Playhead;
  locale: Locale;
  highlight: readonly string[];
  /** The timeline's segments (one per story chapter) and where the playhead belongs. */
  segments: readonly SegmentSpec[];
  anchor: Anchor | null;
  /** Segment of the current chapter (-1: none, e.g. the background chapter). */
  current: number;
  expanded: boolean;
  /** Selected entity (inspector), if any. */
  selected: string | null;
  onSelect(id: string): void;
  onExpand(): void;
}

/** Every entity, most relevant at `t` first (at war: area, then join date), the rest by join date. */
function fullOrder(all: readonly EntityN[], t: number, areaNow: ReadonlyMap<string, number>): EntityN[] {
  const ranked = rankBandEntities(all, t, areaNow);
  const shown = new Set(ranked);
  return [...ranked, ...all.filter((e) => !shown.has(e)).sort((a, b) => a.joined - b.joined)];
}

export function BandCard({ model, playhead, locale, highlight, segments, anchor, current, expanded, selected, onSelect, onExpand }: BandCardProps) {
  const tr = useT();
  const t = usePlayheadT(playhead);
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const u = useUnit(ref, w);
  const areas = useMemo(() => controlAreas(model), [model]);
  const maxArea = useMemo(() => Math.max(1, ...[...areas.values()].flat()), [areas]);
  const all = useMemo(() => [...model.entities.values()], [model]);

  const pad = 10 * u;
  const x0 = 104 * u;
  const x1 = Math.max(x0 + 1, w - pad);
  const axisH = 20 * u;
  const top = 6 * u;
  const areaNow = useMemo(() => new Map(all.map((e) => [e.entity.id, areaAt(model, areas, e.entity.id, t)])), [all, model, areas, t]);

  // Collapsed: the most relevant at `t` (largest area, then earliest) that fit, the rest folded into one muted row.
  const planRef = useRef<BandRowPlan | null>(null);
  const plan = useMemo(() => {
    const next: BandRowPlan = expanded
      ? { rows: fullOrder(all, t, areaNow), hidden: 0 }
      : planBandRows({ entities: all, t, areaNow, availableHeight: h - axisH - top, minRowHeight: BAND_MIN_ROW * u, collapsedHeight: BAND_REST_ROW * u });
    // Keep the previous object while the same rows stay in the same order, so the band paths are not rebuilt every playhead tick.
    const prev = planRef.current;
    const same = prev && prev.hidden === next.hidden && prev.rows.length === next.rows.length && prev.rows.every((r, i) => r === next.rows[i]);
    planRef.current = same ? prev : next;
    return planRef.current;
  }, [expanded, all, t, areaNow, h, axisH, top, u]);
  const entities = plan.rows;
  const restH = plan.hidden > 0 ? BAND_REST_ROW * u : 0;
  const rowH = expanded ? BAND_EXPANDED_ROW * u : entities.length ? (h - axisH - top - restH) / entities.length : 0;
  const rowsBottom = top + entities.length * rowH + restH;

  const scale = useMemo(
    () => createSegmentScale({ segments, max: model.max, width: x1 - x0 }),
    [segments, model, x0, x1],
  );
  const x = (n: number) => x0 + scale.x(n);
  const ticks = useMemo(() => {
    const raw = ruleTicks(model.min, model.max, model.scale, Math.max(2, (x1 - x0) / (64 * u)), locale);
    return thinTicks(raw.major, raw.minor, (n) => x0 + scale.x(n), 34 * u);
  }, [model, x0, x1, u, locale, scale]);
  const win = scale.segments[current];
  const headX = x0 + scale.x(t, anchor);
  const hl = new Set(highlight);

  const bands = useMemo(
    () =>
      entities.map(({ entity }, i) => {
        const base = top + (i + 1) * rowH - 3 * u;
        const height = Math.max(0, rowH - 10 * u);
        const row = areas.get(entity.id) ?? [];
        const pts = model.keyframes.map((k, j) => [x0 + scale.x(k.t), base - ((row[j] ?? 0) / maxArea) * height] as const);
        let d = '';
        if (pts.length) {
          d = `M${pts[0]![0].toFixed(1)} ${base.toFixed(1)}`;
          for (const [px, py] of pts) d += `L${px.toFixed(1)} ${py.toFixed(1)}`;
          const last = pts[pts.length - 1]!;
          d += `L${x1.toFixed(1)} ${last[1].toFixed(1)}L${x1.toFixed(1)} ${base.toFixed(1)}Z`;
        }
        return { entity, base, d };
      }),
    [entities, areas, maxArea, model, rowH, top, u, x0, x1, scale],
  );

  const activate = (e: KeyboardEvent<SVGGElement>, fn: () => void) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    fn();
  };
  const blurAfterPointer = (e: { detail: number; currentTarget: Element }) => {
    if (e.detail > 0 && e.currentTarget instanceof SVGElement) e.currentTarget.blur();
  };

  if (w === 0) return <div ref={ref} className="ts-card" data-expanded={expanded || undefined} />;
  const rowsH = expanded ? rowsBottom + 4 * u : h - axisH;
  return (
    <div ref={ref as RefObject<HTMLDivElement>} className="ts-card" data-expanded={expanded || undefined}>
      <svg width={w} height={rowsH} className="ts-svg ts-card__rows">
        <HatchDefs model={model} prefix="ts-card-hatch" />
        {win && <rect className="ts-svg__window" x={x0 + win.x0} y={top} width={Math.max(1, win.x1 - win.x0)} height={rowsH - top} />}
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
          const isSelected = selected === entity.id;
          return (
            <g
              key={entity.id}
              className="ts-card__row"
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={tr('time.entity.select', { name: entity.name[locale] || entity.name.en })}
              data-hl={hl.has(entity.id) || undefined}
              data-entity={entity.id}
              onClick={(e) => {
                onSelect(entity.id);
                blurAfterPointer(e);
              }}
              onKeyDown={(e) => activate(e, () => onSelect(entity.id))}
            >
              <rect className="ts-card__hit" x={0} y={base - rowH + 3 * u} width={w} height={rowH} />
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
          <g
            className="ts-card__row ts-card__rest"
            role="button"
            tabIndex={0}
            aria-label={tr('time.card.showAll', { n: plan.hidden })}
            onClick={(e) => {
              onExpand();
              blurAfterPointer(e);
            }}
            onKeyDown={(e) => activate(e, onExpand)}
          >
            <rect className="ts-card__hit" x={0} y={rowsBottom - restH} width={w} height={restH} />
            <text className="ts-svg__sub ts-svg__rest" x={pad} y={rowsBottom - 4 * u} data-hidden-rows={plan.hidden}>
              {`+${plan.hidden} OTHERS / `}
              <tspan lang="zh-Hans">{`另 ${plan.hidden} 方`}</tspan>
              <tspan className="ts-card__more" dx={6 * u}>
                ▾
              </tspan>
            </text>
          </g>
        )}
        <line className="ts-svg__cursor" x1={headX} x2={headX} y1={top} y2={rowsH} />
      </svg>
      <svg width={w} height={axisH} className="ts-svg ts-card__axis" aria-hidden="true">
        <line className="ts-svg__axis" x1={x0} x2={x1} y1={0.5} y2={0.5} />
        {ticks.minor.map((px) => (
          <line key={px} className="ts-svg__tick" x1={px} x2={px} y1={0.5} y2={3 * u} />
        ))}
        {ticks.major.map((m) => (
          <g key={m.t}>
            <line className="ts-svg__axis" x1={m.x} x2={m.x} y1={0.5} y2={5.5 * u} />
            {m.showLabel && (
              <text className="ts-svg__mono" x={m.x} y={14.5 * u} textAnchor="middle">
                {m.label}
              </text>
            )}
          </g>
        ))}
        <line className="ts-svg__cursor" x1={headX} x2={headX} y1={0} y2={5.5 * u} />
      </svg>
    </div>
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
