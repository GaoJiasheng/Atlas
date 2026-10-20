/**
 * The small graph under the try-it data table (docs/30 F5, shared with
 * docs/31; pure, unit-tested): the recorded rows as a line graph over a
 * step control's values or a bar graph over a choice's options, the y axis
 * from 0 to a round number, and the words a screen reader hears instead
 * (worked out from the data: where it starts and ends, whether it rises all
 * the way, and a steady rate and where it changes).
 */
import type { SimControl, SimOutput, SimValue } from '../../sim-schema';
import type { TableRow } from './trial';
import { numberOf } from './index';

export type ChartKind = 'line' | 'bar';

export interface ChartPoint {
  /** Line: the control value; bar: the option's index. */
  x: number;
  /** The option id or step value the row was recorded at. */
  key: SimValue;
  y: number;
  /** The row of the value on show now (drawn in the signal colour). */
  current: boolean;
}

export interface ChartSeries {
  output: SimOutput;
  points: ChartPoint[];
}

export interface ChartModel {
  kind: ChartKind;
  /** Line: the control's lowest and highest values; bar: 0 … options − 1. */
  x: [number, number];
  /** Line: the control's values (ticks); bar: the option ids in order. */
  ticks: SimValue[];
  /** 0 … a round maximum, and its tick step. */
  yMax: number;
  yStep: number;
  series: ChartSeries[];
}

/** A round axis maximum ≥ v with 2–6 steps of 1, 2, 2.5 or 5 × 10ⁿ (0 → 1). */
export function niceAxis(v: number): { max: number; step: number } {
  if (!(v > 0) || !Number.isFinite(v)) return { max: 1, step: 0.25 };
  const exp = Math.floor(Math.log10(v));
  for (const k of [exp - 1, exp]) {
    for (const m of [1, 2, 2.5, 5]) {
      const step = m * 10 ** k;
      const steps = Math.ceil(v / step - 1e-9);
      if (steps >= 2 && steps <= 6) return { max: Number((steps * step).toPrecision(12)), step };
    }
  }
  const step = 10 ** (exp + 1);
  return { max: step, step: step / 2 };
}

/**
 * The graph of a data table: `null` below two rows. A step control gives a
 * line graph (x = its values, points sorted along x), a choice a bar graph
 * (one slot per option, in the options' order); `ys` are the number outputs drawn.
 */
export function chartModel(rows: readonly TableRow[], vary: SimControl, ys: readonly SimOutput[], current: SimValue | undefined): ChartModel | null {
  if (rows.length < 2 || ys.length === 0) return null;
  const kind: ChartKind = vary.kind === 'step' ? 'line' : 'bar';
  const ticks: SimValue[] = vary.kind === 'step' ? [...vary.values].sort((a, b) => a - b) : vary.kind === 'choice' ? vary.options.map((o) => o.id) : [false, true];
  const xOf = (v: SimValue) => (kind === 'line' ? (v as number) : ticks.indexOf(v));
  const series = ys.map((output) => ({
    output,
    points: rows
      .map((r) => ({ x: xOf(r.vary), key: r.vary, y: numberOf(r.values[output.id]), current: r.vary === current }))
      .filter((p) => p.x >= (kind === 'line' ? -Infinity : 0) && Number.isFinite(p.y))
      .sort((a, b) => a.x - b.x),
  }));
  const top = Math.max(0, ...series.flatMap((s) => s.points.map((p) => p.y)));
  const { max, step } = niceAxis(top);
  const x: [number, number] = kind === 'line' ? [ticks[0] as number, ticks[ticks.length - 1] as number] : [0, ticks.length - 1];
  return { kind, x, ticks, yMax: max, yStep: step, series };
}

/** Steps between consecutive points: Δx, Δy and the rate. */
function steps(points: readonly ChartPoint[]) {
  return points.slice(1).map((p, i) => {
    const dx = p.x - points[i]!.x;
    const dy = p.y - points[i]!.y;
    return { dx, dy, rate: dx !== 0 ? dy / dx : 0 };
  });
}

/** Two rates within 3 % of the larger (or both about 0) are the same. */
const sameRate = (a: number, b: number) => Math.abs(a - b) <= 0.03 * Math.max(Math.abs(a), Math.abs(b)) + 1e-9;

export interface SummaryWords {
  locale: 'en' | 'zh';
  /** The varied control's name, and a value as words (`300 g`, `Glass`). */
  x: string;
  xText(v: SimValue): string;
  /** A time interval uses duration units, rather than a clock reading. */
  xDeltaText?(v: number): string;
  /** An output's name, and a reading with its unit (`6.0 cm`). */
  y(o: SimOutput): string;
  yText(o: SimOutput, v: number): string;
}

/** What the graph shows, in words (the graph's `aria-label`). */
export function chartSummary(m: ChartModel, w: SummaryWords): string {
  const zh = w.locale === 'zh';
  const parts = m.series.map((s) => {
    const name = w.y(s.output);
    const pts = s.points;
    if (pts.length === 0) return '';
    if (m.kind === 'bar') {
      const list = pts.map((p) => `${w.xText(p.key)} ${w.yText(s.output, p.y)}`).join(zh ? '，' : ', ');
      const hi = pts.reduce((a, b) => (b.y > a.y ? b : a));
      const lo = pts.reduce((a, b) => (b.y < a.y ? b : a));
      if (hi.y === lo.y) return zh ? `${name}（按${w.x}）：${list}；都一样` : `${name} for each ${w.x.toLowerCase()}: ${list}; all the same`;
      return zh
        ? `${name}（按${w.x}）：${list}；最高的是${w.xText(hi.key)}，最低的是${w.xText(lo.key)}`
        : `${name} for each ${w.x.toLowerCase()}: ${list}; highest for ${w.xText(hi.key)}, lowest for ${w.xText(lo.key)}`;
    }
    const first = pts[0]!;
    const last = pts[pts.length - 1]!;
    const st = steps(pts);
    const from = zh
      ? `${w.x} ${w.xText(first.key)} 时 ${w.yText(s.output, first.y)}，${w.xText(last.key)} 时 ${w.yText(s.output, last.y)}`
      : `${w.yText(s.output, first.y)} at ${w.xText(first.key)} to ${w.yText(s.output, last.y)} at ${w.xText(last.key)}`;
    // A steady rate over at least two steps from the start: "rises by 1.0 cm for every 50 g up to 300 g".
    let k = 0;
    while (k + 1 < st.length && sameRate(st[k + 1]!.rate, st[0]!.rate)) k++;
    const rate = st[0]!.rate;
    if (k >= 1 && Math.abs(rate) > 1e-9) {
      const dx = Math.min(...st.slice(0, k + 1).map((x) => x.dx));
      const dy = Math.abs(rate * dx);
      const upTo = pts[k + 1]!;
      const per = (w.xDeltaText?.(dx) ?? w.xText(dx)).replace(/^-/, '');
      const by = w.yText(s.output, dy);
      const rises = rate > 0;
      if (k + 1 === st.length)
        return zh ? `${w.x}每增加 ${per}，${name}${rises ? '增加' : '减少'} ${by}（${from}）` : `${name} ${rises ? 'rises' : 'falls'} by ${by} for every ${per} (${from})`;
      const later = st.slice(k + 1).every((x) => Math.abs(x.rate) > Math.abs(rate) && Math.sign(x.rate) === Math.sign(rate))
        ? 'faster'
        : st.slice(k + 1).every((x) => Math.abs(x.rate) < Math.abs(rate) && Math.sign(x.rate) === Math.sign(rate))
          ? 'slower'
          : 'other';
      const then = zh
        ? later === 'faster' ? `，之后${rises ? '增加' : '减少'}得更快` : later === 'slower' ? `，之后${rises ? '增加' : '减少'}得更慢` : '，之后不再均匀'
        : later === 'faster' ? `, then ${rises ? 'rises' : 'falls'} faster` : later === 'slower' ? `, then more slowly` : ', then unevenly';
      return zh
        ? `${w.x}每增加 ${per}，${name}${rises ? '增加' : '减少'} ${by}，直到 ${w.xText(upTo.key)}${then}（${from}）`
        : `${name} ${rises ? 'rises' : 'falls'} by ${by} for every ${per} up to ${w.xText(upTo.key)}${then} (${from})`;
    }
    const up = st.every((x) => x.dy > 1e-9);
    const down = st.every((x) => x.dy < -1e-9);
    const flat = st.every((x) => Math.abs(x.dy) <= 1e-9);
    if (zh) return `${name}：${from}，${up ? '一直上升' : down ? '一直下降' : flat ? '保持不变' : '有升有降'}`;
    return `${name} ${up ? 'rises all the way' : down ? 'falls all the way' : flat ? 'stays the same' : 'goes up and down'}, from ${from}`;
  });
  const lead = m.kind === 'line' ? (zh ? '折线图。' : 'Line graph. ') : zh ? '条形图。' : 'Bar graph. ';
  return lead + parts.filter(Boolean).join(zh ? '；' : '; ');
}
