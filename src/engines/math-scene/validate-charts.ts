/**
 * Chart rules (docs/77 §3.1, docs/78 §3, §8), run by `pnpm validate` and
 * `scripts/math/check-pool.ts` through `validate.ts`: a chart can be drawn as
 * written (its kind's fields, values on the axis, pictures whole or half, a
 * pie that makes one whole, a table that adds up, ids that exist), an axis
 * that does not start at 0 only where the lesson shows it misleading (a pair
 * side by side, or a choice about it), towers that keep their total, an
 * average line where the average is; a question's number is what its chart
 * or data say (`dataAnswer`), a table's blanks are its "?" cells and add up,
 * towers to even out level to a whole number; and the step's limits. Build
 * time only.
 */
import type { ChartModelSpec, ChartSpec, StepLimits, Task } from './schema';
import { axisOf, chartItems, gridValues, knownCats, levelMoves, meanOf, pieParts, pieSum, tableBlanks, tableSolution } from './lib/chart';
import { dataAnswer, dataContextOf, same, taskChart } from './lib/diagnose/data';
import { inputSpecOf } from './lib/state';
import { answerValues } from './lib/forms';
import { isFracValue } from './lib/value';

const ids = (c: ChartSpec): Set<string> => new Set([...(c.cats ?? []).map((x) => x.id), ...(c.pie ?? []).map((x) => x.id), ...(c.table?.rows ?? []).map((x) => x.id), ...(c.table?.cols ?? []).map((x) => x.id)]);
const isTowers = (c: ChartSpec) => (c.type === 'bar' && !!c.stack) || !!c.pooled;

/** Can one chart be drawn as written? */
function oneChartIssues(c: ChartSpec, limits: StepLimits | undefined, where: string, truncatedOk: boolean): string[] {
  const out: string[] = [];
  const at = where ? `${where}: ` : '';
  const err = (m: string) => out.push(`${at}${m}`);
  const known = ids(c);
  const cats = c.cats ?? [];
  if ((c.type === 'picture' || c.type === 'bar' || c.type === 'line' || c.type === 'strip') && cats.length === 0) err(`a ${c.type} chart needs cats`);
  if (c.type === 'picture' && !c.key) err('a picture graph needs a key');
  if ((c.type === 'bar' || c.type === 'line') && !c.axis && !isTowers(c)) err(`a ${c.type} graph needs an axis`);
  if (c.type === 'pie' && !c.pie) err('a pie chart needs pie');
  if (c.type === 'table' && !c.table) err('a table needs table');
  const dup = cats.map((x) => x.id).find((id, i, all) => all.indexOf(id) !== i);
  if (dup) err(`category "${dup}" twice`);
  /* values and the axis */
  if (c.axis) {
    const a = axisOf(c);
    if ((a.to - a.from) % a.step !== 0) err(`the axis ${a.from}–${a.to} is not a whole number of gridlines of ${a.step}`);
    if (gridValues(a).length > 21) err(`${gridValues(a).length - 1} gridlines (at most 20)`);
    if (a.from > 0 && !truncatedOk) err('an axis that does not start at 0 is only for the truncated-axis beat (a pair) or its choose');
    if (limits?.chartSteps && !isTowers(c) && !limits.chartSteps.includes(a.step)) err(`a gridline worth ${a.step} (limits.chartSteps ${limits.chartSteps.join(', ')})`);
    for (const x of cats) if (x.value !== undefined && (x.value < a.from || x.value > a.to)) err(`"${x.id}" is ${x.value}, off the axis ${a.from}–${a.to}`);
  }
  for (const x of cats) {
    if (x.value === undefined && !c.ghost?.includes(x.id)) err(`"${x.id}" has no value`);
    if (x.value !== undefined && !Number.isInteger(x.value * (isTowers(c) || c.type === 'strip' ? 2 : 1))) err(`"${x.id}" is ${x.value} (whole numbers${isTowers(c) ? ', or a half block' : ''})`);
    if (limits?.maxValue !== undefined && (x.value ?? 0) > limits.maxValue) err(`"${x.id}" is ${x.value} (limit ${limits.maxValue})`);
  }
  if (c.type === 'picture' && c.key) {
    const per = c.key.per;
    for (const x of cats) {
      const r = (x.value ?? 0) % per;
      if (r !== 0 && !(per % 2 === 0 && r === per / 2)) err(`"${x.id}" is ${x.value}: not whole pictures of ${per} (half a picture only when ${per} is even)`);
    }
  }
  if (limits?.items && !c.table && !c.pie) {
    const n = cats.length;
    if (n < limits.items[0] || n > limits.items[1]) err(`${n} items (limits.items ${limits.items[0]}–${limits.items[1]})`);
  }
  /* towers */
  if (isTowers(c)) {
    const max = limits?.maxBlocks ?? 10;
    for (const x of cats) if ((x.value ?? 0) > max) err(`"${x.id}" is a tower of ${x.value} blocks (at most ${max})`);
    if (c.was) {
      if (c.was.length !== cats.length) err('was needs a height for each tower');
      const before = c.was.reduce((s, v) => s + v, 0);
      const now = knownCats(c).reduce((s, x) => s + (x.value ?? 0), 0);
      if (!c.ghost && before !== now) err(`blocks were added or taken away: ${before} before, ${now} now (evening out keeps the total)`);
    }
  }
  if (c.mean !== undefined && !c.ghost && !c.pooled && cats.length && c.type !== 'strip') {
    const avg = meanOf(cats.map((x) => x.value ?? 0));
    if (!same(avg, c.mean)) err(`the average line is at ${c.mean}, the average is ${avg}`);
  }
  /* pie */
  if (c.pie) {
    const parts = pieParts(c);
    const sum = pieSum(c);
    if (sum && sum.n !== sum.d) err(`the pie's parts make ${sum.n}/${sum.d}, not one whole`);
    if (!sum && Math.abs((parts.at(-1)?.end ?? 0) - 360) > 0.01) err('the pie\'s parts in degrees do not make 360°');
    if (c.total) for (const s of c.pie) if (s.frac && (c.total * s.frac.n) % s.frac.d !== 0) err(`the total ${c.total} is not a multiple of ${s.frac.d} ("${s.id}")`);
    if (limits?.pieFractions) for (const s of c.pie) if (s.frac && !limits.pieFractions.some((f) => f.n === s.frac!.n && f.d === s.frac!.d)) err(`"${s.id}" is ${s.frac.n}/${s.frac.d} (limits.pieFractions)`);
    if (c.square) {
      const p = parts.find((x) => x.id === c.square);
      if (!p) err(`square: no part "${c.square}"`);
      else if (Math.abs(p.end - p.start - 90) > 0.01) err(`square on "${c.square}", which is not a right angle`);
    }
  }
  /* table */
  if (c.table) {
    const t = c.table;
    for (const r of t.rows) {
      if (r.cells.length !== t.cols.length) err(`row "${r.id}" has ${r.cells.length} cells for ${t.cols.length} columns`);
      const first = r.cells[0];
      if (r.tally !== undefined && typeof first === 'number' && first !== r.tally) err(`row "${r.id}": the tally is ${r.tally}, the number ${first}`);
    }
    const sol = tableSolution(c);
    if (tableBlanks(c).length && !sol) err('the blanks cannot all be worked out from the table');
    // A complete table adds up.
    const filled = { ...(sol ?? {}) };
    const totalRow = t.rows.find((r) => r.total);
    if (totalRow)
      t.cols.forEach((col, i) => {
        const v = (r: (typeof t.rows)[number]) => (r.cells[i] === '?' ? filled[`${r.id}.${col.id}`] : r.cells[i]) as number | undefined;
        const parts = t.rows.filter((r) => !r.total).map(v);
        const tot = v(totalRow);
        if (parts.every((x) => x !== undefined) && tot !== undefined && parts.reduce((s, x) => s! + x!, 0) !== tot) err(`column "${col.id}" does not add up to its total ${tot}`);
      });
  }
  /* ids */
  for (const g of c.guide ?? []) if (typeof g === 'string' && !known.has(g)) err(`guide: no "${g}"`);
  for (const id of [...(c.brace ?? []), ...Object.keys(c.highlight ?? {}), ...Object.keys(c.segs ?? {}), ...(c.ghost ?? [])]) if (!known.has(id) && id !== 'whole') err(`no "${id}" on this chart`);
  if ((c.segs || c.changes || c.points) && c.type !== 'line') err('segs, changes and points are for a line graph');
  if (c.unknown && c.type !== 'strip') err('unknown is for a strip');
  if (c.type === 'strip' && c.total !== undefined && c.total < cats.reduce((s, x) => s + (x.value ?? 0), 0)) err(`the strip's whole ${c.total} is less than its parts`);
  if (c.type === 'strip' && c.total !== undefined && !(c.unknown ?? []).includes('count')) err('a strip with a whole bigger than its parts asks how many parts (unknown: count)');
  return out;
}

/** Can a chart model be drawn as written? `truncatedOk`: an axis from above 0 is allowed here. */
export function chartModelIssues(m: ChartModelSpec, limits?: StepLimits, truncatedOk = false): string[] {
  const items = chartItems(m);
  return items.flatMap((c, i) => oneChartIssues(c, limits, items.length > 1 ? `pair ${i + 1}` : '', truncatedOk || items.length > 1));
}

/** A check on a chart (or about data): the model, the answer against the chart or the data, the limits. */
export function dataTaskIssues(task: Task, limits: StepLimits | undefined): string[] {
  const out: string[] = [];
  const truncated = task.kind === 'choose' && task.options.some((o) => o.misconception === 'truncated-axis');
  if (task.model.kind === 'chart') {
    out.push(...chartModelIssues(task.model, limits, truncated));
    if (task.model.pair && task.kind !== 'choose') out.push('a pair of charts is for a beat or a choose');
    const c = taskChart(task)!;
    if ((c.guide || c.brace) && task.kind !== 'choose') out.push('a check draws no reading line or gap of its own (the child taps for one)');
  } else out.push(`a ${task.kind} task about data needs a chart model`);
  for (const o of task.kind === 'choose' ? task.options : []) if (o.model?.kind === 'chart') out.push(...chartModelIssues(o.model, limits, truncated).map((m) => `option "${o.id}": ${m}`));
  const spec = inputSpecOf(task);
  if (task.kind === 'fill-table') {
    const c = taskChart(task);
    const blanks = c ? tableBlanks(c) : [];
    if (!c?.table) out.push('fill-table needs a table');
    if (blanks.length === 0) out.push('fill-table needs "?" cells');
    const keys = Object.keys(task.cells);
    for (const b of blanks) if (!(b.key in task.cells)) out.push(`cells has no answer for "${b.key}"`);
    for (const k of keys) if (!blanks.some((b) => b.key === k)) out.push(`cells: "${k}" is not a "?" of the table`);
    const sol = c ? tableSolution(c) : null;
    if (sol) for (const [k, v] of Object.entries(sol)) if (task.cells[k] !== undefined && task.cells[k] !== v) out.push(`cells: "${k}" is ${task.cells[k]}, the table says ${v}`);
  }
  if (task.kind === 'even-out') {
    const c = taskChart(task);
    if (!c || !isTowers(c)) out.push('even-out needs towers (a bar chart with stack)');
    else {
      const towers = (c.cats ?? []).map((x) => x.value ?? 0);
      if (!levelMoves(towers)) out.push('these towers cannot be levelled in whole blocks (an average of .5 is for beats and input)');
      if (towers.every((v) => v === towers[0])) out.push('the towers start level');
    }
  }
  if (spec && (task.kind === 'input' || task.kind === 'even-out')) {
    const ctx = dataContextOf(task, spec);
    if (!ctx) out.push('a number about a chart needs data (what is asked: read, difference, sum, average …)');
    else {
      const t = dataAnswer(ctx);
      const a = answerValues(spec)[0];
      const x = a ? (isFracValue(a) ? a.n / a.d : 'kind' in a && a.kind === 'dec' ? a.units / 1_000_000 : null) : null;
      if (t === null) out.push(`data (${ctx.ask}) does not determine a number (check of, values, average, count …)`);
      else if (x === null || !same(x, t)) out.push(`the answer is ${x}, the ${ctx.ask} from the data is ${t}`);
      if (t !== null && !Number.isInteger(t * 100)) out.push(`${t} does not divide exactly (no recurring decimals, docs/78 D8)`);
      if (t !== null && !Number.isInteger(t) && spec.form !== 'decimal') out.push(`the answer ${t} is not whole: write it with form decimal`);
      for (const k of ctx.of) if (ctx.chart && !ids(ctx.chart).has(k.split('.')[0]!)) out.push(`data.of: no "${k}" on the chart`);
      if (limits?.items && ctx.values.length && !ctx.chart && (ctx.values.length < limits.items[0] || ctx.values.length > limits.items[1])) out.push(`${ctx.values.length} values (limits.items)`);
    }
  }
  return out;
}
