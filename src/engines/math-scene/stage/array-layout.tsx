/** Shared array layout and descriptions, independent of interactive model loading. */
import type { ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { ArrayLayoutSpec, ArrayModelSpec, BeatMove } from '../schema';
import { groupSizes, layoutOf, packOf, scatterPoints, splitParts, thingCount } from '../lib/array';
import type { Rect } from './layout';
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export type Tone = 'cold' | 'hot' | 'signal' | 'ink' | 'mine';

export function Brace({ x1, y1, x2, y2, text, side, covered }: { x1: number; y1: number; x2: number; y2: number; text: string; side: 'left' | 'top' | 'bottom'; covered?: boolean }) {
  const vertical = x1 === x2;
  const tick = (x: number, y: number) => (vertical ? <line x1={x - 5} x2={x + 5} y1={y} y2={y} /> : <line x1={x} x2={x} y1={y - 5} y2={y + 5} />);
  const tx = vertical ? x1 - 10 : (x1 + x2) / 2;
  const ty = vertical ? (y1 + y2) / 2 + 4 : side === 'top' ? y1 - 9 : y1 + 18;
  return (
    <g className="ms-brace" aria-hidden="true">
      <line x1={x1} x2={x2} y1={y1} y2={y2} />
      {tick(x1, y1)}
      {tick(x2, y2)}
      {covered ? (
        <g className="ms-cover">
          <rect x={vertical ? tx - 74 : tx - 70} y={ty - 15} width={vertical ? 70 : 140} height={22} />
          <text x={vertical ? tx - 39 : tx} y={ty + 1} textAnchor="middle">
            ?
          </text>
        </g>
      ) : (
        <text x={tx} y={ty} textAnchor={vertical ? 'end' : 'middle'}>
          {text}
        </text>
      )}
    </g>
  );
}

interface Placed {
  x: number;
  y: number;
  tone: Tone;
  crossed?: boolean;
}

interface Drawn {
  things: Placed[];
  containers: { cx: number; cy: number; w: number; h: number; dashed?: boolean; tone?: Tone; count: number; index: number }[];
  braces: ReactNode[];
  extras: ReactNode[];
  w: number;
  h: number;
}

const textWidth = (text: string): number => [...text].reduce((w, ch) => w + (/[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? 13 : 7.8), 0);

const toneAt = (tones: readonly string[] | undefined, i: number, fallback: Tone): Tone => (tones?.[i] as Tone | undefined) ?? fallback;

export const ARRAY_SHARE = 0.56;

function thingSize(s: ArrayLayoutSpec, box: { w: number; h: number }, mini: boolean): number {
  const layout = layoutOf(s);
  let across = 6;
  let down = 3;
  if (layout === 'rows') {
    across = (s.cols ?? 1) + (s.extra ? 1 : 0) + 2.2;
    down = (s.rows ?? 1) + 2.2;
  } else if (layout === 'groups') {
    const sizes = groupSizes(s);
    const pack = packOf(Math.max(1, ...sizes));
    const perRow = sizes.length > 6 ? Math.ceil(sizes.length / 2) : sizes.length;
    across = perRow * (pack.cols + 1.2) + (s.extra ? packOf(s.extra).cols + 1.6 : 0) + 0.8;
    down = (sizes.length > 6 ? 2 : 1) * (pack.rows + 1.6) + 1.6;
  } else if (layout === 'scatter') {
    across = Math.max(6, Math.sqrt(thingCount(s)) * 1.9);
    down = across * 0.55 + (s.containers ? 3 : 0);
  }
  const k = Math.min(box.w / (across * 1.25), box.h / (down * 1.25));
  if (mini) return clamp(k, 6, 64);
  // On a big stage the drawing takes about half the stage's height (like the fraction bars), not more.
  const tall = layout === 'rows' ? (s.rows ?? 1) * 1.25 + 0.4 : layout === 'groups' ? down * 1.25 : down * 1.25 * 1.1;
  return clamp(Math.min(k, (box.h * ARRAY_SHARE) / tall), 22, 96);
}

function place(s: ArrayLayoutSpec, size: number, locale: Locale, opts: { move?: BeatMove | null; mini?: boolean }): Drawn {
  const gap = size * 1.25;
  const things: Placed[] = [];
  const containers: Drawn['containers'] = [];
  const braces: ReactNode[] = [];
  const extras: ReactNode[] = [];
  const layout = layoutOf(s);
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
  if (layout === 'rows') {
    const rows = s.rows ?? 1;
    const cols = s.cols ?? 1;
    const split = splitParts(s);
    // Read by rows (`true`: "3 rows" left, "4 in each row" on top; `rows`: the left one only), or by columns
    // (`cols`: "4 columns" on top, "3 in each column" left). A covered count keeps its brace with a ? strip.
    const byCols = s.braces === 'cols';
    const vertical = s.braces === true || s.braces === 'rows' || byCols || !!s.cover?.rows;
    const across = s.braces === true || byCols || !!s.cover?.cols;
    const sideText = (n: number) => (byCols ? T('math.array.eachCol', { n }) : T(n === 1 ? 'math.array.row' : 'math.array.rows', { n }));
    const topText = (n: number) => (byCols ? T(n === 1 ? 'math.array.col' : 'math.array.cols', { n }) : T('math.array.each', { n }));
    // Room on the left for the longest word beside the vertical brace (13 px mono, a CJK glyph a full em).
    const longest = vertical ? Math.max(...[rows, split?.first ?? 0, split?.second ?? 0].filter((n) => n > 0).map((n) => textWidth(sideText(n)))) : 0;
    const left = vertical ? Math.max(64, Math.ceil(longest) + 34, s.cover?.rows ? 104 : 0) : 8;
    const top = across ? 30 : 8;
    const sx = (c: number) => left + c * gap + gap / 2 + (split?.axis === 'cols' && c >= split.first ? size * 0.5 : 0);
    const sy = (r: number) => top + r * gap + gap / 2 + (split?.axis === 'rows' && r >= split.first ? size * 0.5 : 0);
    for (let i = 0; i < rows * cols; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const part = split ? ((split.axis === 'rows' ? r : c) < split.first ? 0 : 1) : 0;
      const tone = split ? toneAt(s.tones, part, part === 0 ? 'cold' : 'hot') : toneAt(s.tones, 0, 'cold');
      things.push({ x: sx(c), y: sy(r), tone, crossed: !!s.crossed?.rows?.includes(r) || !!s.crossed?.cols?.includes(c) });
    }
    // Left over: down the next column, not filling it.
    for (let e = 0; e < (s.extra ?? 0); e++) things.push({ x: sx(cols), y: sy(e), tone: 'signal' });
    const w = sx(cols - 1 + (s.extra ? 1 : 0)) + gap / 2 + 8;
    const h = sy(rows - 1) + gap / 2 + 8;
    if (!opts.mini) {
      const sideBrace = (from: number, to: number, n: number, key: string, covered = false) =>
        braces.push(<Brace key={key} x1={left - 14} x2={left - 14} y1={sy(from) - gap / 2 + 3} y2={sy(to) + gap / 2 - 3} text={sideText(n)} side="left" covered={covered} />);
      if (vertical) {
        if (split?.axis === 'rows') {
          sideBrace(0, split.first - 1, split.first, 'r0');
          sideBrace(split.first, rows - 1, split.second, 'r1');
        } else sideBrace(0, rows - 1, rows, 'r', !!s.cover?.rows);
      }
      if (across) {
        const topBrace = (from: number, to: number, n: number, key: string, covered = false) =>
          braces.push(<Brace key={key} x1={sx(from) - gap / 2 + 3} x2={sx(to) + gap / 2 - 3} y1={top - 12} y2={top - 12} text={topText(n)} side="top" covered={covered} />);
        if (split?.axis === 'cols') {
          topBrace(0, split.first - 1, split.first, 'c0');
          topBrace(split.first, cols - 1, split.second, 'c1');
        } else topBrace(0, cols - 1, cols, 'c', !!s.cover?.cols);
      }
    }
    return { things, containers, braces, extras, w, h };
  }
  if (layout === 'groups') {
    const sizes = groupSizes(s);
    const cap = s.container === 'car' ? 4 : Math.max(1, ...sizes);
    const pack = s.container === 'car' ? { cols: 2, rows: 2 } : packOf(cap);
    const cw = pack.cols * gap;
    const ch = pack.rows * gap;
    const perRow = sizes.length > 6 ? Math.ceil(sizes.length / 2) : sizes.length;
    const pitch = cw + size * 1.4;
    const cell = (g: number) => ({ cx: 16 + (g % perRow) * pitch + cw / 2, cy: 16 + Math.floor(g / perRow) * (ch + size * 1.8) + ch / 2 });
    // Dealt round the containers one at a time, or filled one container at a time.
    const deal = opts.move === 'deal';
    const slots: { g: number; k: number }[] = [];
    if (deal) {
      const most = Math.max(0, ...sizes);
      for (let round = 0; round < most; round++)
        sizes.forEach((n, g) => {
          if (round < n) slots.push({ g, k: round });
        });
    } else sizes.forEach((n, g) => Array.from({ length: n }, (_, k) => slots.push({ g, k })));
    for (const { g, k } of slots) {
      const c = cell(g);
      things.push({ x: c.cx - cw / 2 + (k % pack.cols) * gap + gap / 2, y: c.cy - ch / 2 + Math.floor(k / pack.cols) * gap + gap / 2, tone: toneAt(s.tones, g, 'cold'), crossed: !!s.crossed?.groups?.includes(g) });
    }
    sizes.forEach((n, g) => containers.push({ ...cell(g), w: cw, h: ch, tone: s.tones?.[g] as Tone | undefined, count: n, index: g }));
    const rowsUsed = Math.ceil(sizes.length / perRow);
    let w = 16 + perRow * pitch;
    const extra = s.extra ?? 0;
    if (extra) {
      const ep = packOf(extra);
      const ex = w + size * 0.8;
      const ey = 16 + (ch - ep.rows * gap) / 2;
      for (let e = 0; e < extra; e++) things.push({ x: ex + (e % ep.cols) * gap + gap / 2, y: ey + Math.floor(e / ep.cols) * gap + gap / 2, tone: 'signal' });
      extras.push(<line key="base" className="ms-array__left" x1={ex} x2={ex + ep.cols * gap} y1={ey + ep.rows * gap + 6} y2={ey + ep.rows * gap + 6} />);
      if (s.another) containers.push({ cx: ex + (ep.cols * gap) / 2, cy: 16 + ch / 2, w: Math.max(ep.cols * gap, cw), h: ch, dashed: true, count: extra, index: sizes.length });
      w = ex + Math.max(ep.cols * gap, s.another ? cw : 0) + 16;
    }
    const h = 16 + rowsUsed * (ch + size * 1.8);
    if (!opts.mini && (s.braces === true || s.braces === 'rows' || s.braces === 'cols')) {
      const equal = sizes.every((n) => n === sizes[0]);
      braces.push(<Brace key="g" x1={16 - 6} x2={16 + perRow * pitch - size * 1.4 + 6} y1={h - size * 0.4} y2={h - size * 0.4} text={equal ? T('math.array.groupsOf', { n: sizes.length, k: sizes[0] ?? 0 }) : T('math.array.groups', { n: sizes.length })} side="bottom" />);
    }
    return { things, containers, braces, extras, w, h: h + (s.braces ? 26 : 0) };
  }
  // Scatter: loose on a tray, empty containers beside it.
  const n = s.count ?? 0;
  const trayW = Math.max(6, Math.sqrt(n) * 1.9) * gap;
  const trayH = trayW * 0.5;
  scatterPoints(n).forEach(([px, py]) => things.push({ x: 10 + px * trayW, y: 10 + py * trayH, tone: 'cold' }));
  extras.push(<rect key="tray" className="ms-array__tray" x={4} y={4} width={trayW + 12} height={trayH + 12} rx={8} />);
  let h = trayH + 24;
  if (s.containers) {
    const k = s.containers.count ?? Math.max(1, Math.floor(n / (s.containers.size ?? 1)));
    const cap = s.containers.size ?? Math.ceil(n / Math.max(1, k));
    const pack = packOf(Math.min(cap, 12));
    const cw = pack.cols * gap;
    const ch = pack.rows * gap;
    const pitch = cw + size * 1.4;
    const shown = Math.min(k, 8);
    for (let g = 0; g < shown; g++) containers.push({ cx: 16 + g * pitch + cw / 2, cy: h + 16 + ch / 2, w: cw, h: ch, dashed: !s.containers.count, count: 0, index: g });
    h += ch + 40;
  }
  return { things, containers, braces, extras, w: trayW + 24, h };
}

export function arrayFrame(m: ArrayModelSpec, box: Rect, locale: Locale, opts: { move?: BeatMove | null; mini?: boolean; align?: 'center' | 'top' } = {}) {
  const layouts = m.pair ?? [m];
  const sizes = layouts.map((s) => thingSize(s, { w: box.w / layouts.length - (layouts.length > 1 ? 30 : 0), h: box.h - (layouts.length > 1 ? 40 : 0) }, !!opts.mini));
  const size = Math.min(...sizes);
  const drawn = layouts.map((s) => place(s, size, locale, { move: opts.move, mini: opts.mini }));
  const labelH = layouts.length > 1 && !opts.mini ? 34 : 0;
  const totalW = drawn.reduce((a, d) => a + d.w, 0) + (layouts.length - 1) * 50;
  const maxH = Math.max(...drawn.map((d) => d.h)) + labelH;
  // A picture option fills its card (things up to 64 px); a beat's drawing only ever shrinks to fit.
  const fit = Math.min(box.w / Math.max(1, totalW), box.h / Math.max(1, maxH));
  const scale = opts.mini ? Math.min(fit, 64 / Math.max(1, size)) : Math.min(1, fit);
  const x0 = box.x + (box.w - totalW * scale) / 2;
  const y0 = opts.align === 'top' ? box.y : box.y + (box.h - maxH * scale) / 2;
  // The containers' centres on the stage (one layout): what a number line under the groups lines its jumps up with.
  const centres = layouts.length === 1 ? drawn[0]!.containers.filter((c) => !c.dashed).map((c) => ({ x: x0 + c.cx * scale, y: y0 + (c.cy + labelH) * scale })) : [];
  return { layouts, size, drawn, labelH, totalW, maxH, scale, x0, y0, w: totalW * scale, h: maxH * scale, centres };
}

export function arrayAspect(m: ArrayModelSpec): number {
  const f = arrayFrame(m, { x: 0, y: 0, w: 4000, h: 4000 }, 'en', { mini: true });
  return f.totalW / Math.max(1, f.maxH);
}

export function describeArray(m: ArrayModelSpec, locale: Locale): string {
  const one = (s: ArrayLayoutSpec): string => {
    const layout = layoutOf(s);
    if (layout === 'rows') return t(locale, 'math.array.describeRows', { r: s.rows ?? 0, c: s.cols ?? 0 }) + (s.extra ? t(locale, 'math.array.describeLeft', { n: s.extra }) : '');
    if (layout === 'groups') {
      const sizes = groupSizes(s);
      const equal = sizes.every((n) => n === sizes[0]);
      return (equal ? t(locale, 'math.array.groupsOf', { n: sizes.length, k: sizes[0] ?? 0 }) : t(locale, 'math.array.describeSizes', { list: sizes.join(locale === 'zh' ? '、' : ', ') })) + (s.extra ? t(locale, 'math.array.describeLeft', { n: s.extra }) : '');
    }
    return t(locale, 'math.array.describeLoose', { n: s.count ?? 0 });
  };
  return (m.pair ?? [m]).map(one).join(locale === 'zh' ? '；' : '; ');
}
