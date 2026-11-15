/**
 * The chart model A7 (docs/77 §3.1, docs/78 §3): picture graphs, bar graphs
 * (up or on their side), line graphs, pie charts, tables (with tally marks)
 * and, for averages, towers of unit blocks and a strip of equal parts — in the
 * technical-plate grammar: 1.5 px ink axes, hairline gridlines, every gridline
 * the same height (so a new scale changes how tall the chart is, never how
 * tall a gridline is), hairline bars with a faint ink fill lit cold / hot /
 * signal, single-colour picture glyphs, a pie from 12 o'clock clockwise.
 *
 * Moves: the same chart keeps its drawing between beats, so a new scale
 * eases the bars (`rescale`), new points are joined (`join`, the line draws
 * itself) and blocks keep their identity as towers change (`level`, `pool`:
 * each block slides to its new place). On a question the bars and points
 * are buttons that draw a reading hairline (a help, not checked); on an
 * even-out check the towers are buttons (tap to lift the top block, tap
 * another to put it down; ← → between towers, Enter). Reduced motion: no
 * transitions.
 */
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { BeatMove, ChartIcon, ChartModelSpec, ChartSpec, Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import type { Rect } from './layout';
import { axisOf, blockKeys, catValue, chartItems, chartTotal, gridValues, gridlinesAround, iconsOf, lineChanges, pieParts, tableBlanks, tallyOf, valueOf, type ChartAxis } from '../lib/chart';

export interface ChartModelProps {
  model: ChartModelSpec;
  box: Rect;
  locale: Locale;
  label: string;
  move?: BeatMove | null;
  /** A check on the chart (reading hairlines, a table being filled, towers being evened out). */
  task?: Task | null;
  state?: TaskState | null;
  editable?: boolean;
  act?(a: Action): void;
  /** "Show me": the answers of a table drawn dashed; the towers drawn level. */
  ghost?: TaskState | null;
  /** A small picture (a choice's card): no title, smaller type. */
  mini?: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
type Tone = 'cold' | 'hot' | 'signal' | 'ink';
const FRACS: Record<string, string> = { '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/6': '⅙', '5/6': '⅚', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞' };
export const fracGlyph = (n: number, d: number) => FRACS[`${n}/${d}`] ?? `${n}/${d}`;
const num = (v: number) => String(Math.round(v * 100) / 100);

/** Is the chart drawn as towers of blocks? */
export const isTowers = (c: ChartSpec) => (c.type === 'bar' && !!c.stack) || c.pooled === true;

export function ChartModel(p: ChartModelProps) {
  const items = chartItems(p.model);
  if (items.length === 2) {
    const gap = 28;
    const wide = p.box.w > p.box.h * 1.1;
    const a: Rect = wide ? { ...p.box, w: (p.box.w - gap) / 2 } : { ...p.box, h: (p.box.h - gap) / 2 };
    const b: Rect = wide ? { ...a, x: p.box.x + a.w + gap } : { ...a, y: p.box.y + a.h + gap };
    return (
      <g className="ms-chart ms-chart--pair" role="img" aria-label={p.label}>
        <OneChart {...p} c={items[0]!} box={a} pairIndex={0} />
        <OneChart {...p} c={items[1]!} box={b} pairIndex={1} />
      </g>
    );
  }
  return (
    <g className="ms-chart" role={p.editable ? 'group' : 'img'} aria-label={p.label}>
      <OneChart {...p} c={items[0]!} box={p.box} pairIndex={null} />
    </g>
  );
}

interface OneProps extends ChartModelProps {
  c: ChartSpec;
  pairIndex: number | null;
  /** Height kept for the title, which each drawing puts just above its own content. */
  heading?: number;
}

/** The chart's title, just above what it names (not at the top of the stage). */
function Heading({ p, x, y }: { p: OneProps; x: number; y: number }) {
  if (!p.heading || !p.c.title) return null;
  const size = clamp(p.heading * 0.6, 13, 17);
  return (
    <text className="ms-chart__title" x={x} y={Math.max(p.box.y - p.heading * 0.3, y)} textAnchor="middle" fontSize={size}>
      {tx(p.c.title, p.locale)}
    </text>
  );
}

function OneChart(p: OneProps) {
  const { c, locale, mini } = p;
  const titleH = c.title && !mini ? clamp(p.box.h * 0.06, 20, 30) : 0;
  const noteH = c.note && !mini ? 22 : 0;
  // The same side margins as the other models: the chart never runs to the edge of the free rectangle.
  const m = mini ? 0 : clamp(p.box.w * 0.04, 12, 48);
  const body: Rect = { x: p.box.x + m, y: p.box.y + titleH, w: p.box.w - 2 * m, h: p.box.h - titleH - noteH };
  const q = { ...p, box: body, heading: titleH };
  let drawing: ReactNode;
  if (c.type === 'pie') drawing = <Pie {...q} />;
  else if (c.type === 'table') drawing = <Table {...q} />;
  else if (c.type === 'strip') drawing = <Strip {...q} />;
  else drawing = <Cartesian {...q} />;
  return (
    <g className="ms-chart__one" data-type={c.type}>
      {drawing}
      {noteH > 0 && (
        <text className="ms-chart__note" x={p.box.x + p.box.w / 2} y={p.box.y + p.box.h - 6} textAnchor="middle">
          {tx(c.note!, locale)}
        </text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Picture glyphs (single-colour line art, 24 × 24)                     */
/* ------------------------------------------------------------------ */

function Glyph({ icon, x, y, s, half }: { icon: ChartIcon; x: number; y: number; s: number; half?: boolean }) {
  const k = s / 24;
  const shape: ReactNode = (() => {
    switch (icon) {
      case 'mango':
        return (
          <>
            <path d="M6 15c0-6 5-10 11-9 3 1 4 4 3 8-1 5-6 8-10 7-3-1-4-3-4-6z" />
            <path d="M15 6c1-2 3-3 5-3-1 2-3 3-5 3z" />
          </>
        );
      case 'durian':
        return (
          <>
            <ellipse cx="12" cy="13.5" rx="7.5" ry="8" />
            <path d="M12 5.5V3M7 8l-2-2M17 8l2-2M4.5 13.5H2M19.5 13.5H22M7 19l-2 2M17 19l2 2M9.5 10.5l1 1M14 10l1 1M10 15l1 1M14.5 15l1 1" />
          </>
        );
      case 'rambutan':
        return (
          <>
            <circle cx="12" cy="13" r="6.5" />
            <path d="M12 6.5V3.5M16.6 8.4l2-2M18.5 13h3M16.6 17.6l2 2M12 19.5v3M7.4 17.6l-2 2M5.5 13h-3M7.4 8.4l-2-2" />
          </>
        );
      case 'banana':
        return <path d="M4 7c1 8 7 13 16 11l1-2c-7 1-12-3-14-10L5 5z" />;
      case 'book':
        return (
          <>
            <path d="M4 5h7c1 0 1 1 1 1v14s0-1-1-1H4z" />
            <path d="M20 5h-7c-1 0-1 1-1 1v14s0-1 1-1h7z" />
          </>
        );
      case 'cup':
        return (
          <>
            <path d="M5 6h12l-1.5 14h-9z" />
            <path d="M17 9h2a2 2 0 0 1 0 5h-2.4" />
          </>
        );
      case 'sticker':
        return <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z" />;
      case 'pupil':
      default:
        return (
          <>
            <circle cx="12" cy="6" r="3" />
            <path d="M6 21v-5c0-3 3-5 6-5s6 2 6 5v5" />
          </>
        );
    }
  })();
  const id = `cg-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g className="ms-chart__glyph" transform={`translate(${x} ${y}) scale(${k})`} data-half={half || undefined}>
      {half && (
        <clipPath id={id}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      )}
      <g clipPath={half ? `url(#${id})` : undefined}>{shape}</g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Picture, bar, line, towers                                           */
/* ------------------------------------------------------------------ */

/** Keys of the blocks last drawn (per chart on the stage), so a moved block keeps its key. */
type BlockMemo = { keys: string[][] | null };

function Cartesian(p: OneProps) {
  const { c, box, locale, mini, task, state } = p;
  const memo = useRef<BlockMemo>({ keys: null });
  const towers = isTowers(c);
  const picture = c.type === 'picture';
  const line = c.type === 'line';
  const horizontal = c.type === 'bar' && c.orient === 'horizontal' && !towers;
  const cats = c.cats ?? [];
  const evenOut = task?.kind === 'even-out' && state?.towers ? state : null;
  const shownTowers = evenOut ? (p.ghost?.towers ?? evenOut.towers!) : null;
  const values = cats.map((x, i) => (shownTowers ? shownTowers[i]! : (x.value ?? 0)));
  const axis: ChartAxis = towers ? { ...axisOf(c), to: Math.max(axisOf(c).to, ...values.map(Math.ceil)) } : axisOf(c);
  const nGrid = Math.max(1, (axis.to - axis.from) / axis.step);
  const font = mini ? 11 : clamp(Math.min(box.w, box.h) / 34, 12, 15);
  const lit = (id: string): Tone | undefined => c.highlight?.[id];
  const guided = new Set([...(c.guide ?? []).filter((g): g is string => typeof g === 'string'), ...(state?.guides ?? [])]);
  const tappable = !!p.editable && !!p.act && (task?.kind === 'input' || task?.kind === 'choose');
  const pooled = !!c.pooled;
  const slots = cats.length + (pooled ? 1 : 0);

  // Frame: scale labels at the left (or the bottom on its side), category names under (or at the left).
  const labelW = horizontal ? clamp(Math.max(...cats.map((x) => tx(x.label, locale).length)) * font * 0.62 + 12, 48, box.w * 0.32) : picture ? 0 : clamp(String(axis.to).length * font * 0.7 + 16, 30, 64);
  const nameH = c.axis?.name && !mini ? font + 10 : 0;
  const acrossH = c.across && !mini ? font + 8 : 0;
  // Category names under the bars: one line if it fits the slot, else two, and if a line is still wider than the slot every other name drops a row.
  const slotGuess = Math.min((box.w - labelW - 18) / Math.max(1, slots), horizontal ? Infinity : mini ? 90 : 170);
  const textW = (s: string) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? 1 : 0.52), 0) * font;
  const catLines = cats.map((x) => {
    const name = tx(x.label, locale);
    if (horizontal || textW(name) <= slotGuess * 0.92 || !name.includes(' ')) return [name];
    const words = name.split(' ');
    let best: [string, string] = [name, ''];
    for (let k = 1; k < words.length; k++) {
      const pair: [string, string] = [words.slice(0, k).join(' '), words.slice(k).join(' ')];
      if (Math.max(textW(pair[0]), textW(pair[1])) < Math.max(textW(best[0]), textW(best[1]))) best = pair;
    }
    return best;
  });
  const lineH = font * 1.2;
  const maxLines = Math.max(1, ...catLines.map((l) => l.length));
  const stagger = !horizontal && catLines.some((l) => l.some((s) => textW(s) > slotGuess * 0.96));
  const catH = horizontal ? font + 14 : lineH * maxLines * (stagger ? 2 : 1) + font * 0.8 + 6;
  const keyH = picture && c.key ? font * 2.2 + 8 : 0;
  const plot: Rect = horizontal
    ? { x: box.x + labelW + 8, y: box.y + nameH + 4, w: box.w - labelW - 28, h: box.h - nameH - catH - 8 }
    : { x: box.x + labelW + 6, y: box.y + nameH + keyH + 6, w: box.w - labelW - 18, h: box.h - nameH - keyH - catH - acrossH - 10 };
  if (plot.w < 40 || plot.h < 40) return null;
  // Not wider than a comfortable slot per category: the chart sits in the middle of a wide stage.
  const maxSlot = horizontal ? 64 : mini ? 90 : 170;
  if (!horizontal && plot.w > slots * maxSlot) {
    const w = slots * maxSlot;
    plot.x += (plot.w - w) / 2;
    plot.w = w;
  }
  if (horizontal && plot.h > slots * maxSlot) {
    const h = slots * maxSlot;
    plot.y += (plot.h - h) / 2;
    plot.h = h;
  }
  const slot = (horizontal ? plot.h : plot.w) / Math.max(1, slots);
  // Every gridline the same height: a scale with fewer gridlines draws a shorter chart (docs/77 D5). The two charts of a pair fill the same height.
  const fill = p.pairIndex !== null;
  const room = horizontal ? plot.w : plot.h;
  let g = fill ? room / nGrid : Math.min(room / Math.max(nGrid, 10), mini ? 30 : 64);
  if (towers) g = Math.min(g, slot * 0.7);
  if (nGrid * g > room) g = room / nGrid;
  // The baseline stays put as the scale changes: a chart of ten gridlines is centred, a shorter one shrinks from the top.
  // Towers have no scale to change: they are centred by their own height.
  const block = Math.min(room, (towers ? nGrid : Math.max(nGrid, 10)) * g);
  const base = horizontal ? plot.x : fill || picture ? plot.y + plot.h : Math.min(plot.y + plot.h, plot.y + (plot.h + block) / 2);
  const pos = (v: number) => (horizontal ? base + ((v - axis.from) / axis.step) * g : base - ((v - axis.from) / axis.step) * g);
  const top = pos(axis.to);
  const centre = (i: number) => (horizontal ? plot.y + slot * (i + 0.5) : plot.x + slot * (i + 0.5));
  const bw = towers ? g : Math.min(slot * 0.56, horizontal ? 40 : 72);
  // A picture graph is as tall as its tallest column: the key and the title sit just above it.
  const picCount = picture && c.key ? Math.max(1, ...cats.map((x) => Math.ceil((x.value ?? 0) / c.key!.per))) : 0;
  const picS = picture ? Math.min(slot * 0.62, (plot.h - 4) / Math.max(1, picCount) - 4, mini ? 30 : 56) : 0;
  const picTop = picture ? Math.max(plot.y, base - picCount * (picS + 4) - 8) : plot.y;
  const gridKeep = (v: number) => Math.round((v - axis.from) / axis.step) % axis.labels === 0;

  const out: ReactNode[] = [];
  /* gridlines and the scale */
  if (!picture) {
    for (const v of gridValues(axis)) {
      const at = pos(v);
      out.push(
        horizontal ? (
          <g key={`g${v}`} className="ms-chart__grid">
            <line x1={at} x2={at} y1={plot.y} y2={plot.y + plot.h} />
            {gridKeep(v) && (
              <text x={at} y={plot.y + plot.h + font + 4} textAnchor="middle" fontSize={font}>
                {num(v)}
              </text>
            )}
          </g>
        ) : (
          <g key={`g${v}`} className="ms-chart__grid" style={{ transform: `translateY(${at}px)` }}>
            <line x1={plot.x} x2={plot.x + plot.w} y1={0} y2={0} />
            {gridKeep(v) && (
              <text x={plot.x - 6} y={font * 0.36} textAnchor="end" fontSize={font}>
                {num(v)}
              </text>
            )}
          </g>
        ),
      );
    }
    out.push(
      horizontal ? (
        <path key="axes" className="ms-chart__axis" d={`M${plot.x} ${plot.y}V${plot.y + plot.h}H${pos(axis.to) + 6}`} />
      ) : (
        <path key="axes" className="ms-chart__axis" d={`M${plot.x} ${top - 6}V${base}H${plot.x + plot.w}`} style={{ transition: 'd 700ms' }} />
      ),
    );
    if (c.axis?.name && !mini)
      out.push(
        <text key="name" className="ms-chart__axisname" x={horizontal ? plot.x + plot.w / 2 : Math.max(box.x + 2, plot.x - labelW)} y={horizontal ? box.y + font : Math.max(box.y + font, top - 16)} textAnchor={horizontal ? 'middle' : 'start'} fontSize={font * 0.9}>
          {tx(c.axis.name, locale)}
        </text>,
      );
  } else {
    out.push(<line key="base" className="ms-chart__axis" x1={plot.x} x2={plot.x + plot.w} y1={base} y2={base} />);
    if (c.key) {
      const text = `= ${c.key.per} ${tx(c.key.unit, locale)}`;
      const kw = font * (3.2 + text.length * 0.56);
      const kx = plot.x + plot.w - kw;
      const ky = picTop - keyH;
      out.push(
        <g key="key" className="ms-chart__key">
          <rect x={kx} y={ky} width={kw} height={font * 2.2} />
          <Glyph icon={c.key.icon} x={kx + font * 0.5} y={ky + font * 0.25} s={font * 1.7} />
          <text x={kx + font * 2.6} y={ky + font * 1.45} fontSize={font}>
            {text}
          </text>
        </g>,
      );
    }
  }

  /* category names */
  cats.forEach((x, i) => {
    const y0 = base + font + 6 + (stagger && i % 2 === 1 ? lineH * maxLines : 0);
    out.push(
      <text key={`c${x.id}`} className="ms-chart__cat" data-tone={lit(x.id)} x={horizontal ? plot.x - 8 : centre(i)} y={horizontal ? centre(i) + font * 0.36 : y0} textAnchor={horizontal ? 'end' : 'middle'} fontSize={font}>
        {horizontal
          ? tx(x.label, locale)
          : catLines[i]!.map((line, k) => (
              <tspan key={k} x={centre(i)} dy={k === 0 ? 0 : lineH}>
                {line}
              </tspan>
            ))}
      </text>,
    );
    if (stagger && i % 2 === 1) out.push(<line key={`cl${x.id}`} className="ms-chart__leader" x1={centre(i)} x2={centre(i)} y1={base + 4} y2={y0 - font} />);
  });
  if (pooled)
    out.push(
      <text key="c-total" className="ms-chart__cat" x={centre(cats.length)} y={base + font + 6} textAnchor="middle" fontSize={font}>
        {t(locale, 'math.chart.total')}
      </text>,
    );
  if (c.across && !mini)
    out.push(
      <text key="across" className="ms-chart__axisname" x={plot.x + plot.w / 2} y={base + catH + acrossH - 2} textAnchor="middle" fontSize={font * 0.9}>
        {tx(c.across, locale)}
      </text>,
    );

  /* the data */
  if (picture && c.key) {
    const s = picS;
    cats.forEach((x, i) => {
      const { whole, half } = iconsOf(x.value ?? 0, c.key!.per);
      const n = whole + (half ? 1 : 0);
      out.push(
        <g key={`p${x.id}`} className="ms-chart__pics" data-tone={lit(x.id)}>
          {Array.from({ length: n }, (_, k) => (
            <Glyph key={k} icon={c.key!.icon} x={centre(i) - s / 2} y={base - (k + 1) * (s + 4)} s={s} half={half && k === n - 1} />
          ))}
        </g>,
      );
    });
  } else if (towers) {
    out.push(...towersOf(p, { cats: cats.map((x) => x.id), values, centre, pos, g, base, font, pooled, memo: memo.current, evenOut, tone: lit }));
  } else if (line) {
    const pts = cats.map((x, i) => ({ id: x.id, x: centre(i), y: pos(x.value ?? 0) }));
    if (!c.points && pts.length > 1) {
      pts.slice(1).forEach((q, i) => {
        const a = pts[i]!;
        out.push(<line key={`s${q.id}`} className="ms-chart__seg" data-tone={c.segs?.[q.id]} x1={a.x} y1={a.y} x2={q.x} y2={q.y} pathLength={1} data-join={p.move === 'join' || undefined} />);
      });
      if (c.changes)
        lineChanges(c).forEach((ch, i) => {
          const a = pts[i]!;
          const q = pts[i + 1]!;
          out.push(
            <text key={`ch${ch.to}`} className="ms-chart__change" data-tone={c.segs?.[ch.to]} x={(a.x + q.x) / 2} y={(a.y + q.y) / 2 - 10} textAnchor="middle" fontSize={font * 0.95}>
              {ch.change > 0 ? `+${num(ch.change)}` : ch.change < 0 ? `−${num(-ch.change)}` : '0'}
            </text>,
          );
        });
    }
    pts.forEach((q) => {
      const button = tappable;
      out.push(
        <g
          key={`pt${q.id}`}
          className="ms-chart__point"
          data-tone={lit(q.id)}
          style={{ transform: `translate(${q.x}px, ${q.y}px)` }}
          {...(button ? buttonProps(() => p.act!({ do: 'guide', key: q.id }), t(locale, 'math.chart.readBar', { name: tx(cats.find((k) => k.id === q.id)!.label, locale) }), state?.guides.includes(q.id)) : {})}
        >
          {button && <rect className="ms-chart__hit" x={-24} y={-24} width={48} height={48} />}
          <circle r={mini ? 3.5 : 5} />
        </g>,
      );
    });
  } else {
    cats.forEach((x, i) => {
      const ghost = c.ghost?.includes(x.id);
      const v = x.value ?? 0;
      const a = pos(axis.from);
      const b = pos(Math.max(axis.from, v));
      const geo = horizontal ? { x: a, y: centre(i) - bw / 2, width: Math.max(0, b - a), height: bw } : { x: centre(i) - bw / 2, y: b, width: bw, height: Math.max(0, a - b) };
      const button = tappable && !ghost;
      out.push(
        <g
          key={`b${x.id}`}
          className="ms-chart__bar"
          data-tone={lit(x.id)}
          data-ghost={ghost || undefined}
          {...(button ? buttonProps(() => p.act!({ do: 'guide', key: x.id }), t(locale, 'math.chart.readBar', { name: tx(x.label, locale) }), state?.guides.includes(x.id)) : {})}
        >
          {button && <rect className="ms-chart__hit" x={horizontal ? a : centre(i) - Math.max(bw, 48) / 2} y={horizontal ? centre(i) - Math.max(bw, 48) / 2 : top} width={horizontal ? Math.max(48, plot.w) : Math.max(bw, 48)} height={horizontal ? Math.max(bw, 48) : base - top} />}
          <rect style={geo} {...geo} />
          {ghost && (
            <text x={horizontal ? a + 16 : centre(i)} y={horizontal ? centre(i) + font * 0.36 : base - 12} textAnchor="middle" fontSize={font * 1.2}>
              ?
            </text>
          )}
        </g>,
      );
    });
  }

  /* reading hairlines: from the top to the scale */
  for (const gd of c.guide ?? []) if (typeof gd === 'object') out.push(<line key={`gy${gd.y}`} className="ms-chart__guide" x1={plot.x} x2={plot.x + plot.w} y1={pos(gd.y)} y2={pos(gd.y)} />);
  for (const id of guided) {
    const i = cats.findIndex((x) => x.id === id);
    if (i < 0 || picture) continue;
    const v = values[i]!;
    const at = pos(v);
    const fromBeat = c.guide?.includes(id);
    const around = fromBeat ? gridlinesAround(axis, v) : null;
    out.push(
      <g key={`gd${id}`} className="ms-chart__guide-g">
        {horizontal ? (
          <line className="ms-chart__guide" x1={at} x2={at} y1={centre(i)} y2={plot.y + plot.h} />
        ) : (
          <>
            {line && <line className="ms-chart__guide" x1={centre(i)} x2={centre(i)} y1={base} y2={at} />}
            <line className="ms-chart__guide" x1={centre(i) - (line ? 0 : bw / 2)} x2={plot.x} y1={at} y2={at} />
            <circle className="ms-chart__guide-end" cx={plot.x} cy={at} r={3} />
            {around && <line className="ms-chart__mid" x1={plot.x - 10} x2={plot.x + 10} y1={at} y2={at} />}
          </>
        )}
      </g>,
    );
  }

  /* the gap between two tops */
  if (c.brace && !horizontal) {
    const [ia, ib] = c.brace.map((id) => cats.findIndex((x) => x.id === id));
    if (ia !== undefined && ib !== undefined && ia >= 0 && ib >= 0) {
      const va = values[ia]!;
      const vb = values[ib]!;
      const hi = va >= vb ? ia : ib;
      const lo = hi === ia ? ib : ia;
      const xb = centre(lo) + (line ? 14 : bw / 2 + 10);
      const y1 = pos(values[hi]!);
      const y2 = pos(values[lo]!);
      out.push(
        <g key="brace" className="ms-chart__brace">
          <line className="ms-chart__brace-level" x1={centre(hi)} x2={xb} y1={y1} y2={y1} />
          <path d={`M${xb - 5} ${y1}H${xb}V${y2}H${xb - 5}`} />
          <text x={xb + 6} y={(y1 + y2) / 2 + font * 0.36} fontSize={font}>
            {num(Math.abs(values[hi]! - values[lo]!))}
          </text>
        </g>,
      );
    }
  }

  /* the average line */
  if (c.mean !== undefined) {
    const at = pos(c.mean);
    out.push(
      <g key="mean" className="ms-chart__mean" style={{ transform: `translateY(${at}px)` }}>
        <line x1={plot.x} x2={plot.x + plot.w} y1={0} y2={0} />
        <text x={plot.x + plot.w} y={-6} textAnchor="end" fontSize={font}>
          {t(locale, 'math.chart.averageLine', { v: num(c.mean) })}
        </text>
      </g>,
    );
  }
  const headY = horizontal ? plot.y - (c.axis?.name ? font + 10 : 0) - 10 : picture ? picTop - keyH - 10 : (c.axis?.name ? Math.max(box.y + font, top - 16) - font - 8 : top - 16);
  return (
    <g className="ms-chart__plot">
      <Heading p={p} x={plot.x + plot.w / 2} y={headY} />
      {out}
    </g>
  );
}

/** Props that make an SVG group a button (tap, Enter / Space). */
function buttonProps(run: () => void, label: string, pressed?: boolean) {
  return {
    role: 'button',
    tabIndex: 0,
    'aria-label': label,
    'aria-pressed': pressed ?? false,
    onClick: run,
    onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        run();
      }
    },
  };
}

interface TowerGeo {
  cats: string[];
  values: number[];
  centre(i: number): number;
  pos(v: number): number;
  g: number;
  base: number;
  font: number;
  pooled: boolean;
  memo: BlockMemo;
  evenOut: TaskState | null;
  tone(id: string): Tone | undefined;
}

/** Towers of blocks: each block keeps its key as towers change, so it slides to its new place. */
function towersOf(p: OneProps, geo: TowerGeo): ReactNode[] {
  const { c, locale } = p;
  const { cats, values, centre, pos, g, base, font, pooled, memo, evenOut } = geo;
  const total = values.reduce((a, b) => a + b, 0);
  const heights = [...values.map((v) => (pooled ? 0 : v)), pooled ? total : 0];
  const keys = blockKeys(memo.keys, heights);
  memo.keys = keys;
  const out: ReactNode[] = [];
  const s = g - 2;
  const held = evenOut?.held ?? null;
  const towerCount = cats.length;
  const live = !!evenOut && !!p.editable && !!p.act;
  // Blocks moved out (the heights before): dashed outlines where they were.
  if (c.was && !pooled)
    c.was.forEach((w, i) => {
      for (let k = Math.floor(values[i] ?? 0); k < Math.floor(w); k++) out.push(<rect key={`was${i}-${k}`} className="ms-chart__block" data-gone="" x={centre(i) - s / 2} y={pos(k + 1) + 1} width={s} height={s} />);
    });
  keys.forEach((tower, i) => {
    tower.forEach((key, k) => {
      const lifted = held === i && k === tower.length - 1;
      const movedIn = !!c.was && !pooled && i < towerCount && k >= Math.floor(c.was[i] ?? 0);
      const ghostCat = i < towerCount && c.ghost?.includes(cats[i]!);
      const tone = ghostCat ? 'hot' : movedIn || lifted ? 'signal' : i === towerCount ? 'cold' : (geo.tone(cats[i]!) ?? 'cold');
      out.push(
        <rect
          key={key}
          className="ms-chart__block"
          data-tone={tone}
          data-ghost={ghostCat || undefined}
          x={0}
          y={0}
          width={s}
          height={s}
          style={{ transform: `translate(${centre(i) - s / 2}px, ${pos(k + 1) + 1 - (lifted ? g * 0.45 : 0)}px)` }}
        />,
      );
    });
  });
  // A half block on top (an average of 7.5).
  values.forEach((v, i) => {
    if (pooled || Number.isInteger(v)) return;
    const k = Math.floor(v);
    out.push(<rect key={`half${i}`} className="ms-chart__block" data-tone="signal" x={centre(i) - s / 2} y={pos(k + 0.5) + 1} width={s} height={s / 2 - 1} />);
  });
  // A "?" tower: a dashed frame (its trial blocks, if any, are drawn above).
  (c.ghost ?? []).forEach((id) => {
    const i = cats.indexOf(id);
    if (i < 0 || (values[i] ?? 0) > 0) return;
    const h = Math.min(base - pos(axisOf(c).to), g * 4);
    out.push(
      <g key={`gh${id}`} className="ms-chart__ghost">
        <rect x={centre(i) - s / 2} y={base - h} width={s} height={h} />
        <text x={centre(i)} y={base - h / 2 + font * 0.4} textAnchor="middle" fontSize={font * 1.3}>
          ?
        </text>
      </g>,
    );
  });
  // The towers as buttons on an even-out check.
  if (live)
    cats.forEach((id, i) => {
      const name = tx(c.cats!.find((x) => x.id === id)!.label, locale);
      const h = Math.max(g * 2, base - pos(Math.max(values[i]!, 1)) + g);
      out.push(
        <g key={`tw${id}`} className="ms-chart__tower" data-held={held === i || undefined} {...buttonProps(() => p.act!({ do: 'etap', tower: i }), t(locale, held === i ? 'math.chart.towerHeld' : 'math.chart.tower', { name, n: num(values[i]!) }), held === i)} onKeyDownCapture={(e: KeyboardEvent<SVGGElement>) => roving(e, i, cats.length)}>
          <rect className="ms-chart__hit" x={centre(i) - Math.max(g, 48) / 2} y={base - h} width={Math.max(g, 48)} height={h + 4} />
        </g>,
      );
    });
  return out;
}

/** ← → move between the towers (the next one takes focus). */
function roving(e: KeyboardEvent<SVGGElement>, i: number, n: number) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  e.preventDefault();
  const towers = (e.currentTarget.parentElement?.querySelectorAll<SVGGElement>('.ms-chart__tower') ?? []) as NodeListOf<SVGGElement>;
  const next = towers[(i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n];
  next?.focus();
}

/* ------------------------------------------------------------------ */
/* Pie                                                                  */
/* ------------------------------------------------------------------ */

function Pie(p: OneProps) {
  const { c, box, locale, mini, move } = p;
  const parts = pieParts(c);
  const font = mini ? 11 : clamp(Math.min(box.w, box.h) / 30, 12, 16);
  const R = clamp(Math.min(box.w * 0.3, box.h / 2 - font * 2.2), 30, 220);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const at = (deg: number, r = R) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)] as const;
  const out: ReactNode[] = [];
  parts.forEach((part, i) => {
    const s = c.pie![i]!;
    const [x1, y1] = at(part.start);
    const [x2, y2] = at(part.end);
    const large = part.end - part.start > 180 ? 1 : 0;
    const d = part.end - part.start >= 359.99 ? `M${cx} ${cy - R}A${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R}Z` : `M${cx} ${cy}L${x1} ${y1}A${R} ${R} 0 ${large} 1 ${x2} ${y2}Z`;
    const tone = c.highlight?.[s.id];
    const mid = (part.start + part.end) / 2;
    const wide = part.end - part.start >= 55;
    const name = tx(s.label, locale);
    const fr = c.fracs && part.frac ? fracGlyph(part.frac.n, part.frac.d) : null;
    const [lx, ly] = at(mid, wide ? R * 0.58 : R + font * 1.4);
    const anchor = wide ? 'middle' : Math.sin((mid * Math.PI) / 180) >= 0 ? 'start' : 'end';
    out.push(
      <g key={s.id} className="ms-chart__slice" data-tone={tone} data-fold={move === 'fold' && tone ? '' : undefined} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <path d={d} />
        {!wide && <line className="ms-chart__leader" x1={at(mid, R * 0.9)[0]} y1={at(mid, R * 0.9)[1]} x2={at(mid, R + font * 0.6)[0]} y2={at(mid, R + font * 0.6)[1]} />}
        <text x={lx} y={ly - (fr ? font * 0.15 : -font * 0.36)} textAnchor={anchor} fontSize={font}>
          {s.letter ? `${s.letter} · ` : ''}
          {name}
        </text>
        {fr && (
          <text x={lx} y={ly + font * 1.05} textAnchor={anchor} fontSize={font * 1.15} className="ms-chart__frac">
            {fr}
          </text>
        )}
      </g>,
    );
  });
  if (c.square) {
    const part = parts.find((x) => x.id === c.square);
    if (part) {
      const q = Math.min(R * 0.16, 18);
      const [ax, ay] = at(part.start, q);
      const [bx, by] = at(part.end, q);
      const [mx, my] = at(part.start + 45, q * Math.SQRT2);
      out.push(<path key="sq" className="ms-chart__square" d={`M${ax} ${ay}L${mx} ${my}L${bx} ${by}`} />);
    }
  }
  out.push(<circle key="rim" className="ms-chart__rim" data-tone={c.highlight?.whole} cx={cx} cy={cy} r={R} />);
  return (
    <g className="ms-chart__pie">
      <Heading p={p} x={cx} y={cy - R - font * 2.4} />
      {out}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                                */
/* ------------------------------------------------------------------ */

function Tally({ n, x, y, h }: { n: number; x: number; y: number; h: number }) {
  const { bundles, rest } = tallyOf(n);
  const gap = h * 0.28;
  const out: ReactNode[] = [];
  let at = x;
  for (let b = 0; b < bundles; b++) {
    for (let k = 0; k < 4; k++) out.push(<line key={`${b}-${k}`} x1={at + k * gap} x2={at + k * gap} y1={y} y2={y + h} />);
    out.push(<line key={`${b}-x`} x1={at - gap * 0.5} x2={at + 3.5 * gap} y1={y + h * 0.8} y2={y + h * 0.2} />);
    at += gap * 5.2;
  }
  for (let k = 0; k < rest; k++) out.push(<line key={`r${k}`} x1={at + k * gap} x2={at + k * gap} y1={y} y2={y + h} />);
  return <g className="ms-chart__tally">{out}</g>;
}

function Table(p: OneProps) {
  const { c, box, locale, mini, task, state, ghost } = p;
  const tb = c.table!;
  const font = mini ? 11 : clamp(Math.min(box.w / 42, box.h / 16), 12, 16);
  const tally = tb.rows.some((r) => r.tally !== undefined);
  const maxTally = Math.max(0, ...tb.rows.map((r) => r.tally ?? 0));
  const rowH = clamp(box.h / (tb.rows.length + 1.5), 30, 46);
  const labelW = clamp(Math.max(...tb.rows.map((r) => tx(r.label, locale).length), tb.head ? tx(tb.head, locale).length : 4) * font * 0.62 + 24, 80, box.w * 0.36);
  const tallyW = tally ? clamp((Math.ceil(maxTally / 5) + 1) * rowH * 0.62 * 1.5, 80, box.w * 0.3) : 0;
  const colW = clamp((box.w - labelW - tallyW) / tb.cols.length, 64, 150);
  const W = labelW + tallyW + colW * tb.cols.length;
  const H = rowH * (tb.rows.length + 1);
  const x0 = box.x + (box.w - W) / 2;
  const y0 = box.y + Math.max(0, (box.h - H) / 2);
  const blanks = new Set(tableBlanks(c).map((b) => b.key));
  const fill = task?.kind === 'fill-table' ? task : null;
  const out: ReactNode[] = [];
  const colX = (i: number) => x0 + labelW + tallyW + colW * i;
  // header
  out.push(
    <g key="head" className="ms-chart__thead">
      <text x={x0 + 10} y={y0 + rowH * 0.62} fontSize={font * 0.85}>
        {tb.head ? tx(tb.head, locale).toLocaleUpperCase(locale === 'zh' ? 'zh' : 'en') : ''}
      </text>
      {tally && (
        <text x={x0 + labelW + 10} y={y0 + rowH * 0.62} fontSize={font * 0.85}>
          {t(locale, 'math.chart.tally').toLocaleUpperCase('en')}
        </text>
      )}
      {tb.cols.map((col, i) => (
        <text key={col.id} x={colX(i) + colW / 2} y={y0 + rowH * 0.62} textAnchor="middle" fontSize={font * 0.85} data-tone={c.highlight?.[col.id]}>
          {tx(col.label, locale).toLocaleUpperCase(locale === 'zh' ? 'zh' : 'en')}
        </text>
      ))}
    </g>,
  );
  tb.cols.forEach((col, i) => {
    if (c.highlight?.[col.id]) out.push(<rect key={`lc${col.id}`} className="ms-chart__lit" data-tone={c.highlight[col.id]} x={colX(i)} y={y0} width={colW} height={H} />);
  });
  tb.rows.forEach((r, j) => {
    const y = y0 + rowH * (j + 1);
    if (c.highlight?.[r.id]) out.push(<rect key={`lr${r.id}`} className="ms-chart__lit" data-tone={c.highlight[r.id]} x={x0} y={y} width={W} height={rowH} />);
    out.push(<line key={`rule${r.id}`} className={r.total ? 'ms-chart__rule ms-chart__rule--total' : 'ms-chart__rule'} x1={x0} x2={x0 + W} y1={y} y2={y} />);
    out.push(
      <text key={`rl${r.id}`} className="ms-chart__rowname" data-total={r.total || undefined} x={x0 + 10} y={y + rowH * 0.64} fontSize={font}>
        {tx(r.label, locale)}
      </text>,
    );
    if (r.tally !== undefined) out.push(<Tally key={`t${r.id}`} n={r.tally} x={x0 + labelW + 14} y={y + rowH * 0.24} h={rowH * 0.52} />);
    r.cells.forEach((v, i) => {
      const key = `${r.id}.${tb.cols[i]!.id}`;
      const cx = colX(i) + colW / 2;
      const ty = y + rowH * 0.64;
      if (v !== '?' || !blanks.has(key)) {
        out.push(
          <text key={key} className="ms-chart__cell" data-total={r.total || undefined} x={cx} y={ty} textAnchor="middle" fontSize={font}>
            {String(v)}
          </text>,
        );
        return;
      }
      const written = fill && state ? state.input[key] : '';
      const shown = ghost && fill ? String(fill.cells[key] ?? '') : '';
      out.push(
        <g key={key} className="ms-chart__blank" data-written={written ? '' : undefined} data-ghost={shown ? '' : undefined}>
          <rect x={cx - colW * 0.3} y={y + rowH * 0.16} width={colW * 0.6} height={rowH * 0.68} />
          <text x={cx} y={ty} textAnchor="middle" fontSize={font}>
            {shown || written || '?'}
          </text>
        </g>,
      );
    });
  });
  out.push(<rect key="frame" className="ms-chart__frame" x={x0} y={y0} width={W} height={H} />);
  out.push(<line key="vrule" className="ms-chart__rule" x1={x0 + labelW} x2={x0 + labelW} y1={y0} y2={y0 + H} />);
  return (
    <g className="ms-chart__table">
      <Heading p={p} x={x0 + W / 2} y={y0 - 12} />
      {out}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Strip: equal parts of one whole (the bar model of an average)        */
/* ------------------------------------------------------------------ */

function Strip(p: OneProps) {
  const { c, box, locale, mini, move } = p;
  const cats = c.cats ?? [];
  // A whole bigger than the parts drawn: the rest is a dashed "?" (how many parts fit, docs/78 step 03).
  const total = Math.max(chartTotal(c), c.total ?? 0);
  const rest = total - chartTotal(c);
  const font = mini ? 11 : clamp(Math.min(box.w, box.h) / 30, 12, 16);
  const W = Math.min(box.w - 40, 760);
  const x0 = box.x + (box.w - W) / 2;
  const h = clamp(box.h * 0.18, 30, 64);
  const y0 = box.y + box.h / 2 - h / 2;
  const unknown = new Set(c.unknown ?? []);
  const fmt = (v: number) => (c.unit === 'dollar' ? `$${num(v)}` : c.unit ? `${num(v)} ${c.unit}` : num(v));
  const out: ReactNode[] = [];
  let at = x0;
  cats.forEach((x, i) => {
    const w = total > 0 ? ((x.value ?? 0) / total) * W : W / cats.length;
    out.push(
      <g key={x.id} className="ms-chart__part" data-tone={c.highlight?.[x.id]} data-ghost={c.ghost?.includes(x.id) || undefined} style={move === 'split' ? { animationDelay: `${i * Math.min(150, 600 / cats.length)}ms` } : undefined}>
        <rect x={at} y={y0} width={w} height={h} />
        <text x={at + w / 2} y={y0 + h / 2 + font * 0.36} textAnchor="middle" fontSize={font}>
          {unknown.has('each') ? '?' : fmt(x.value ?? 0)}
        </text>
      </g>,
    );
    at += w;
  });
  if (rest > 0) {
    const w = (rest / total) * W;
    out.push(
      <g key="rest" className="ms-chart__part" data-ghost="">
        <rect x={at} y={y0} width={w} height={h} />
        <text x={at + w / 2} y={y0 + h / 2 + font * 0.36} textAnchor="middle" fontSize={font}>
          …
        </text>
      </g>,
    );
  }
  // The whole above, the count below.
  const by = y0 - 14;
  out.push(
    <g key="whole" className="ms-chart__whole" data-wrong={c.wrongTotal || undefined}>
      <path d={`M${x0} ${by + 8}V${by}H${x0 + W}V${by + 8}`} />
      <text x={x0 + W / 2} y={by - 8} textAnchor="middle" fontSize={font * 1.05}>
        {c.wrongTotal ? fmt(cats[0]?.value ?? 0) : unknown.has('total') ? '?' : fmt(total)}
      </text>
      {c.wrongTotal && <line className="ms-chart__strike" x1={x0 + W / 2 - font * 2.4} x2={x0 + W / 2 + font * 2.4} y1={by - 8 - font * 0.3} y2={by - 8 - font * 0.3} />}
    </g>,
  );
  out.push(
    <text key="count" className="ms-chart__count" x={x0 + W / 2} y={y0 + h + font * 1.8} textAnchor="middle" fontSize={font}>
      {unknown.has('count') ? '? × ' + fmt(cats[0]?.value ?? 0) : `${cats.length} × ${unknown.has('each') ? '?' : fmt(cats[0]?.value ?? 0)}`}
    </text>,
  );
  return (
    <g className="ms-chart__strip">
      <Heading p={p} x={x0 + W / 2} y={by - font * 2.4} />
      {out}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Words (screen readers, choice cards)                                 */
/* ------------------------------------------------------------------ */

/** A chart in words: its type, title and scale, and (unless it is the question) its values. */
export function describeChart(m: ChartModelSpec, locale: Locale, values = true): string {
  return chartItems(m)
    .map((c) => {
      const type = t(locale, isTowers(c) ? 'math.chart.type.towers' : (`math.chart.type.${c.type}` as const));
      const title = c.title ? tx(c.title, locale) : '';
      const scale = c.type === 'picture' && c.key ? t(locale, 'math.chart.picture', { n: c.key.per }) : c.type === 'pie' ? (c.total ? t(locale, 'math.chart.whole', { n: c.total }) : '') : c.type === 'table' || c.type === 'strip' ? '' : t(locale, 'math.chart.gridline', { n: axisOf(c).step });
      const items =
        c.type === 'pie'
          ? (c.pie ?? []).map((s) => (s.frac && values ? t(locale, 'math.chart.ofWhole', { name: tx(s.label, locale), frac: fracGlyph(s.frac.n, s.frac.d) }) : tx(s.label, locale))).join(', ')
          : c.type === 'table'
            ? (c.table?.rows ?? []).map((r) => `${tx(r.label, locale)}${values ? ` ${r.cells.join(' ')}` : ''}`).join(', ')
            : (c.cats ?? []).map((x) => (values && !c.ghost?.includes(x.id) ? t(locale, 'math.chart.desc.values', { name: tx(x.label, locale), v: num(valueOf(c, x.id) ?? catValue(c, x.id) ?? 0) }) : tx(x.label, locale))).join(', ');
      return t(locale, 'math.chart.desc.bar', { type, title, scale, items }).replace(/(。|\. )\s*(。|\.)/g, '$1');
    })
    .join(' ');
}
