/**
 * Graphs and averages (docs/77 §3.4, docs/78 §3.2): what a number asked about
 * a chart or a set of data is (`dataAnswer`, also validate's check that the
 * data's answer is right) and which misconception a wrong one shows. The
 * context is the task's chart and its written part's `data` (what is asked,
 * of which categories, the numbers an average question gives). Only the
 * codes a task declares are looked for. Pure.
 *
 * Rules (right answer t, written x): key-ignored — x is the number of
 * pictures (half a picture as one or none); interval-misread — x × the
 * gridline's worth = t; between-gridlines — x is the gridline below or above
 * a top between two; value-for-difference — x is the larger value or the sum;
 * tally-misread — bundles counted as 4 or 6; total-misused — the total plus
 * the rows known, or one known row not taken away; height-for-change — the
 * highest point for the biggest rise; fraction-as-count — the fraction's
 * denominator or numerator; average-as-total — the total for the average (or
 * the average for the total); zero-ignored — a 0 not counted as an item;
 * average-as-middle — the middle or the most common number; remainder-dropped
 * — the whole part of an average that is not whole; missing-equals-average —
 * the average for the missing value; wrong-count — one item too few or too
 * many; averages-averaged — (old average + new value) ÷ 2.
 */
import type { ChartSpec, InputSpec, MisconceptionCode, Task } from '../../schema';
import { axisOf, biggestRise, chartItems, chartTotal, gridlinesAround, iconsOf, knownCats, meanOf, tableSolution, tallyOf, valueOf } from '../chart';
import { isChartModel } from '../data-kind';

export type DataAsk = NonNullable<InputSpec['data']>['ask'];

export interface DataCtx {
  ask: DataAsk;
  chart: ChartSpec | null;
  of: string[];
  /** The data (given, or the chart's categories); for `missing`, the values known. */
  values: number[];
  average?: number;
  count?: number;
  total?: number;
  value?: number;
  after?: number;
}

/** The task's own chart (the first of a pair). */
export function taskChart(task: Task): ChartSpec | null {
  return isChartModel(task.model) ? chartItems(task.model)[0]! : null;
}

/** What a task's written number is about (`null`: not a question about data). */
export function dataContextOf(task: Task, spec: InputSpec | null): DataCtx | null {
  const chart = taskChart(task);
  const d = spec?.data;
  if (task.kind === 'even-out' && chart) return { ask: 'average', chart, of: [], values: knownCats(chart).map((c) => c.value ?? 0) };
  if (!d) return null;
  const values = d.values ?? (chart ? knownCats(chart).map((c) => c.value ?? 0) : []);
  return { ask: d.ask, chart, of: d.of ?? [], values, average: d.average, count: d.count, total: d.total, value: d.value, after: d.after };
}

const sum = (v: readonly number[]) => v.reduce((a, b) => a + b, 0);
/** Numbers compared to the cent (an average may be 7.5, $4.50). */
export const same = (a: number, b: number): boolean => Math.round(a * 100) === Math.round(b * 100);

/** The values a question points at. */
function pointed(ctx: DataCtx): (number | null)[] {
  return ctx.chart ? ctx.of.map((k) => valueOf(ctx.chart!, k)) : [];
}

/** The right number (`null` when the context does not determine one). */
export function dataAnswer(ctx: DataCtx): number | null {
  const [a, b] = pointed(ctx);
  const c = ctx.chart;
  const avg = ctx.average;
  const n = ctx.count;
  switch (ctx.ask) {
    case 'read':
      return a ?? null;
    case 'difference':
      return a === null || a === undefined || b === null || b === undefined ? null : Math.abs(a - b);
    case 'sum': {
      if (ctx.of.length === 0) return c ? chartTotal(c) : sum(ctx.values);
      const v = pointed(ctx);
      return v.every((x) => x !== null) ? sum(v as number[]) : null;
    }
    case 'missing-row': {
      if (!c || !ctx.of[0]) return null;
      const sol = tableSolution(c);
      const key = ctx.of[0].includes('.') ? ctx.of[0] : `${ctx.of[0]}.${c.table?.cols[0]?.id}`;
      return sol?.[key] ?? null;
    }
    case 'part':
      return a ?? null;
    case 'whole': {
      const s = c?.pie?.find((x) => x.id === ctx.of[0]);
      if (!s?.frac || ctx.value === undefined) return null;
      return (ctx.value * s.frac.d) / s.frac.n;
    }
    case 'biggest-increase':
      return c ? (biggestRise(c)?.change ?? null) : null;
    case 'average':
      return ctx.values.length ? meanOf(ctx.values) : null;
    case 'total':
      return avg !== undefined && n !== undefined ? avg * n : null;
    case 'count':
      return avg !== undefined && avg > 0 && ctx.total !== undefined ? ctx.total / avg : null;
    case 'missing':
      return avg !== undefined && n !== undefined ? avg * n - sum(ctx.values) : null;
    case 'join':
      return avg !== undefined && n !== undefined && ctx.value !== undefined ? (avg * n + ctx.value) / (n + 1) : null;
    case 'leave':
      return avg !== undefined && n !== undefined && n > 1 && ctx.value !== undefined ? (avg * n - ctx.value) / (n - 1) : null;
    case 'joined':
      return avg !== undefined && n !== undefined && ctx.after !== undefined ? ctx.after * (n + 1) - avg * n : null;
  }
}

/** The middle number (either middle one of an even count), and the most common number (if one repeats). */
function middles(values: readonly number[]): number[] {
  const s = [...values].sort((x, y) => x - y);
  const out: number[] = [];
  // The middle number, or either of the two middle ones of an even count.
  if (s.length % 2 === 1) out.push(s[(s.length - 1) / 2]!);
  else if (s.length > 1) out.push(s[s.length / 2 - 1]!, s[s.length / 2]!);
  const counts = new Map<number, number>();
  for (const v of s) counts.set(v, (counts.get(v) ?? 0) + 1);
  const most = Math.max(...counts.values());
  if (most > 1) for (const [v, k] of counts) if (k === most) out.push(v);
  return out;
}

/** Does `x` show `code` (and not the right answer)? */
export function dataShows(code: MisconceptionCode, ctx: DataCtx, x: number): boolean {
  const t = dataAnswer(ctx);
  if (t === null || same(x, t)) return false;
  const c = ctx.chart;
  const [a, b] = pointed(ctx);
  const avg = ctx.average;
  const n = ctx.count;
  switch (code) {
    case 'key-ignored': {
      if (!c || c.type !== 'picture' || !c.key || c.key.per === 1) return false;
      const per = c.key.per;
      // Pictures counted instead of what they stand for: one value read, or all of them added.
      const counts = (v: number) => [iconsOf(v, per).whole, iconsOf(v, per).whole + (iconsOf(v, per).half ? 1 : 0)];
      if (ctx.ask === 'read' && a !== null && a !== undefined) return counts(a).includes(x);
      if (ctx.ask === 'sum') {
        const vs = ctx.of.length ? (pointed(ctx) as number[]) : (c.cats ?? []).map((k) => k.value ?? 0);
        return x === vs.reduce((s, v) => s + counts(v)[1]!, 0) || x === vs.reduce((s, v) => s + counts(v)[0]!, 0);
      }
      return false;
    }
    case 'interval-misread': {
      if (!c || c.type === 'picture' || c.type === 'pie' || c.type === 'table') return false;
      const step = axisOf(c).step;
      return step !== 1 && same(x * step, t);
    }
    case 'between-gridlines': {
      if (!c || ctx.ask !== 'read' || c.type === 'pie' || c.type === 'table' || c.type === 'picture') return false;
      const around = gridlinesAround(axisOf(c), t);
      return !!around && (x === around[0] || x === around[1]);
    }
    case 'value-for-difference':
      return ctx.ask === 'difference' && a !== null && a !== undefined && b !== null && b !== undefined && (x === Math.max(a, b) || x === a + b);
    case 'tally-misread': {
      if (!c?.table || ctx.ask !== 'read') return false;
      const row = c.table.rows.find((r) => r.id === ctx.of[0]?.split('.')[0]);
      if (row?.tally === undefined) return false;
      const { bundles, rest } = tallyOf(row.tally);
      return x === bundles * 4 + rest || x === bundles * 6 + rest;
    }
    case 'total-misused':
      return ctx.ask === 'missing-row' && !!c && missingRowShows(c, ctx.of[0] ?? '', t, x);
    case 'height-for-change':
      return ctx.ask === 'biggest-increase' && !!c && x === Math.max(...(c.cats ?? []).map((k) => k.value ?? 0));
    case 'fraction-as-count': {
      const s = c?.pie?.find((k) => k.id === ctx.of[0]);
      return ctx.ask === 'part' && !!s?.frac && (x === s.frac.d || x === s.frac.n);
    }
    case 'average-as-total':
      if (ctx.ask === 'average') return same(x, sum(ctx.values));
      if (ctx.ask === 'join' && avg !== undefined && n !== undefined && ctx.value !== undefined) return same(x, avg * n + ctx.value);
      if (ctx.ask === 'leave' && avg !== undefined && n !== undefined && ctx.value !== undefined) return same(x, avg * n - ctx.value);
      return ctx.ask === 'total' && avg !== undefined && same(x, avg);
    case 'zero-ignored': {
      const zeros = ctx.values.filter((v) => v === 0).length;
      return ctx.ask === 'average' && zeros > 0 && zeros < ctx.values.length && same(x, sum(ctx.values) / (ctx.values.length - zeros));
    }
    case 'average-as-middle':
      return ctx.ask === 'average' && middles(ctx.values).some((m) => same(x, m));
    case 'remainder-dropped':
      return (ctx.ask === 'average' || ctx.ask === 'join' || ctx.ask === 'leave') && !Number.isInteger(t) && x === Math.floor(t);
    case 'missing-equals-average':
      return ctx.ask === 'missing' && avg !== undefined && same(x, avg);
    case 'wrong-count':
      if (avg === undefined || n === undefined) return false;
      if (ctx.ask === 'missing') return same(x, (n - 1) * avg - sum(ctx.values)) || same(x, (n + 1) * avg - sum(ctx.values));
      if (ctx.ask === 'total') return same(x, (n - 1) * avg) || same(x, (n + 1) * avg);
      if (ctx.ask === 'join' && ctx.value !== undefined) return same(x, (avg * n + ctx.value) / n);
      if (ctx.ask === 'leave' && ctx.value !== undefined) return same(x, (avg * n - ctx.value) / n);
      return false;
    case 'averages-averaged':
      return (ctx.ask === 'join' || ctx.ask === 'leave') && avg !== undefined && ctx.value !== undefined && same(x, (avg + ctx.value) / 2);
    default:
      return false;
  }
}

/** A missing row worked out wrong: the total added to the rows known, or one known row left in. */
function missingRowShows(c: ChartSpec, key: string, t: number, x: number): boolean {
  const table = c.table;
  if (!table) return false;
  const [row, colId] = key.includes('.') ? key.split('.') : [key, table.cols[0]!.id];
  const col = table.cols.findIndex((k) => k.id === colId);
  const total = table.rows.find((r) => r.total)?.cells[col];
  if (typeof total !== 'number') return false;
  const known = table.rows.filter((r) => !r.total && r.id !== row).map((r) => r.cells[col]).filter((v): v is number => typeof v === 'number');
  return x === total + sum(known) || known.some((k) => x === t + k);
}

/** The first declared misconception a written number shows. */
export function diagnoseData(codes: readonly MisconceptionCode[], ctx: DataCtx, x: number): MisconceptionCode | null {
  return codes.find((c) => dataShows(c, ctx, x)) ?? null;
}

/** A table cell filled wrong (fill-table): a tally miscounted, a total misused. */
export function cellShows(code: MisconceptionCode, c: ChartSpec, key: string, x: number): boolean {
  const sol = tableSolution(c);
  const t = sol?.[key];
  if (t === undefined || x === t || !c.table) return false;
  const [row] = key.split('.');
  const r = c.table.rows.find((k) => k.id === row);
  if (code === 'tally-misread' && r?.tally !== undefined) {
    const { bundles, rest } = tallyOf(r.tally);
    return x === bundles * 4 + rest || x === bundles * 6 + rest;
  }
  if (code === 'total-misused' && r && !r.total) return missingRowShows(c, key, t, x);
  return false;
}
