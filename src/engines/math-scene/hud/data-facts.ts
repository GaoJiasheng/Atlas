/**
 * What the CHART and AVERAGE cards and the PLATE rows say about a chart
 * (docs/77 §3.3, docs/78 §3.3): its type, its scale, what a beat reads off
 * it, its items, total, level and average — on a check only what the task
 * gives and what the child has done, the answer once it is done. Pure.
 */
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { ChartModelSpec, ChartSpec, Model, Task } from '../schema';
import type { TaskState } from '../lib/state';
import { inputSpecOf } from '../lib/state';
import { axisOf, chartItems, chartTotal, knownCats, valueOf } from '../lib/chart';
import { dataAnswer, dataContextOf } from '../lib/diagnose/data';
import { blocksMoved, level, numText } from '../lib/data-tasks';

const isTowers = (c: ChartSpec) => (c.type === 'bar' && !!c.stack) || !!c.pooled;

export function chartOf(m: Model | null): ChartSpec | null {
  return m?.kind === 'chart' ? chartItems(m as ChartModelSpec)[0]! : null;
}

export function typeText(c: ChartSpec, locale: Locale): string {
  return t(locale, isTowers(c) ? 'math.chart.type.towers' : (`math.chart.type.${c.type}` as const));
}

/** "1 gridline = 5", "1 picture = 2", "whole = 32", "1 block = 1" (`null`: a table, a strip). */
export function scaleText(c: ChartSpec, locale: Locale): string | null {
  if (c.type === 'picture') return c.key ? t(locale, 'math.chart.picture', { n: c.key.per }) : null;
  if (c.type === 'pie') return c.total ? t(locale, 'math.chart.whole', { n: c.total }) : null;
  if (c.type === 'table' || c.type === 'strip') return null;
  if (isTowers(c)) return t(locale, 'math.chart.block');
  return t(locale, 'math.chart.gridline', { n: axisOf(c).step });
}

/** What a beat reads off its chart: the guided values, or the gap of a brace. */
export function beatReading(c: ChartSpec, locale: Locale): string | null {
  const name = (id: string) => {
    const x = c.cats?.find((k) => k.id === id);
    return x ? tx(x.label, locale) : id;
  };
  const guided = (c.guide ?? []).map((g) => (typeof g === 'string' ? `${name(g)} ${numText(valueOf(c, g) ?? 0)}` : numText(g.y)));
  if (c.brace) {
    const [a, b] = c.brace.map((id) => valueOf(c, id) ?? 0);
    return `${numText(Math.abs(a! - b!))}`;
  }
  return guided.length ? guided.join(' · ') : null;
}

export interface AverageFacts {
  total: string;
  items: string;
  average: string;
  level: string;
  moved: string | null;
}

const dash = '—';

/** TOTAL · ITEMS · AVERAGE · LEVEL of a beat's chart, or of a check (the givens and the child's work; the answer once done). */
export function averageFacts(m: Model | null, task: Task | null, state: TaskState | null, done: boolean): AverageFacts | null {
  const c = chartOf(m);
  if (task && state) {
    if (task.kind === 'even-out' && state.towers) {
      const total = state.towers.reduce((a, b) => a + b, 0);
      return { total: numText(total), items: String(state.towers.length), average: done ? numText(total / state.towers.length) : '?', level: level(state.towers) ? numText(state.towers[0]!) : dash, moved: String(blocksMoved(task, state.towers)) };
    }
    const spec = inputSpecOf(task);
    const ctx = spec ? dataContextOf(task, spec) : null;
    if (ctx) {
      const t = dataAnswer(ctx);
      const ans = (ask: boolean, given: number | undefined) => (ask ? (done && t !== null ? numText(t) : '?') : given !== undefined ? numText(given) : dash);
      const values = ctx.values.reduce((a, b) => a + b, 0);
      switch (ctx.ask) {
        case 'average':
          return { total: done ? numText(values) : dash, items: String(ctx.values.length), average: ans(true, undefined), level: dash, moved: null };
        case 'total':
          return { total: ans(true, undefined), items: String(ctx.count ?? dash), average: ans(false, ctx.average), level: dash, moved: null };
        case 'count':
          return { total: ans(false, ctx.total), items: ans(true, undefined), average: ans(false, ctx.average), level: dash, moved: null };
        case 'missing':
          return { total: done && ctx.average !== undefined && ctx.count ? numText(ctx.average * ctx.count) : '?', items: String(ctx.count ?? dash), average: ans(false, ctx.average), level: dash, moved: null };
        default:
          return { total: dash, items: ctx.count !== undefined ? String(ctx.count) : dash, average: ctx.ask === 'join' || ctx.ask === 'leave' ? ans(true, undefined) : ans(false, ctx.average), level: dash, moved: null };
      }
    }
  }
  if (!c) return null;
  if (c.type === 'strip') {
    const unknown = new Set(c.unknown ?? []);
    const each = c.cats?.[0]?.value ?? 0;
    return { total: unknown.has('total') || c.wrongTotal ? '?' : numText(Math.max(chartTotal(c), c.total ?? 0)), items: unknown.has('count') ? '?' : String(c.cats?.length ?? 0), average: unknown.has('each') ? '?' : numText(each), level: dash, moved: null };
  }
  const ghosts = c.ghost?.length ?? 0;
  const known = knownCats(c);
  const values = known.map((x) => x.value ?? 0);
  const total = chartTotal(c);
  const items = (c.cats?.length ?? 0) + 0;
  const lvl = values.length && values.every((v) => v === values[0]) && !c.pooled ? numText(values[0]!) : dash;
  return { total: ghosts ? '?' : numText(total), items: String(items), average: c.mean !== undefined ? numText(c.mean) : dash, level: lvl, moved: null };
}
