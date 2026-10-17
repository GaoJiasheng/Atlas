/**
 * MathScene content rules for decimals (docs/29 §3.10), beside the fraction,
 * grid, whole-number and time rules: the hundred grid, the place-value
 * chart, the decimal line and money can be drawn as written; each task's
 * numbers fit its model and its answer is the right one (its work, its
 * rounding, its share, the digits moved); what each declared misconception
 * needs to be diagnosed is there; the step's number limits (`dp`,
 * `resultDp`, `maxValue`, `factor`, `denominators`, `roundTo`, `by`,
 * `multiples`, `units`, `money`, `zoomDepth`). Build time only; shared with
 * `scripts/math/check-pool.ts` through `validate.ts`.
 */
import type { DecimalWork, InputSpec, MisconceptionCode, Model, StepLimits, Task } from './schema';
import { inputSpecOf } from './lib/state';
import { add, cmp, divWhole, eq, formatDecimal, fromFraction, minPlaces, round, sub, thousandths, toFraction, wholePart, type Decimal } from './lib/decimal';
import { equivalent, formatFrac, type Frac } from './lib/fraction';
import { answerValues } from './lib/forms';
import { decimalOf, isFracValue, type DecValue } from './lib/value';
import { gridsOf, levelPlaces, partialCells, runsOf, shadedTh, zoomCell, type GridLevel } from './lib/dgrid';
import { baseLevel, levelsOf, LINE_MAX_STEPS, pathTo, roundingEnds, tickOf } from './lib/dline';
import { chartCounts, dcounts, discCount, dregrouped, dtotal, fitsChart } from './lib/placevalue';
import { centsOf, moneyText, piecesOf, totalCents } from './lib/money';
import { alignStart, decOf, decimalAnswers, isDec, onChart, shiftTarget, workOf } from './lib/decimal-tasks';
import { conversionOf, workResult } from './lib/diagnose/decimals';

/** Most discs a chart draws at once (docs/29 §3.3: trade first). */
export const DISCS_MAX = 120;

const modelsOf = (task: Task): Model[] => [task.model, ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.model ? [o.model] : [])) : [])];
const D = (d: Decimal) => formatDecimal(d);
const places = (d: Decimal) => minPlaces(d);

/* ------------------------------------------------------------------ */
/* Models                                                              */
/* ------------------------------------------------------------------ */

/** Can a decimal model be drawn as written? (`[]` for the other models) */
export function decimalModelIssues(m: Model): string[] {
  const out: string[] = [];
  if (m.kind === 'decimal-grid') {
    for (const [i, g] of gridsOf(m).entries()) {
      const at = m.pair ? `grid ${i + 1}: ` : '';
      const level = g.level as GridLevel;
      const values = [...(g.given ? [g.given] : []), ...(g.runs ?? []).map((r) => r.value), ...(g.crossed ? [g.crossed] : [])];
      for (const v of values) if (places(v) > levelPlaces(level)) out.push(`${at}${D(v)} has more places than a level-${level} grid shows`);
      const total = shadedTh(g);
      const wholes = g.wholes ?? 1;
      if (total > wholes * 1000 && g.wholes) out.push(`${at}${D({ units: total * 1000, dp: 0 })} is more than ${wholes} whole(s)`);
      if (total > 3000) out.push(`${at}more than 3 wholes shaded`);
      if (g.crossed && (thousandths(g.crossed) ?? 0) > total) out.push(`${at}more crossed out than is shaded`);
      if (g.zoom && level !== 1000) out.push(`${at}the magnifier is for level 1000`);
      if (g.zoom && (thousandths(g.zoom.at) ?? 1) % 10 !== 0) out.push(`${at}the magnifier opens a square: at must be a whole number of hundredths`);
      const partial = partialCells(level, runsOf(g));
      if (level === 1000 && partial.length && partial[0] !== zoomCell(g)) out.push(`${at}the thousandths are in square ${partial[0]! + 1}: the magnifier must open that square (zoom.at ${D({ units: partial[0]! * 10_000, dp: 2 })})`);
      if (g.quarters && level === 10) out.push(`${at}quarters are drawn on the hundred grid`);
      if (g.trade === 'th>h' && level !== 1000) out.push(`${at}trade th>h needs the magnifier (level 1000)`);
    }
    if (m.pair && m.given) out.push('a pair draws its own grids (no given at the top)');
  }
  if (m.kind === 'place-value') {
    const values = [...(m.value ? [m.value] : []), ...(m.rows ?? [])];
    for (const v of values) if (!fitsChart(v)) out.push(`${D(v)} does not fit the chart (≤ 9999, ≤ 3 places)`);
    const discs = m.show === 'digits' ? 0 : discCount(chartCounts(m)) * (m.copies && !m.combined ? m.copies : 1) + (m.plates ? discCount(dcounts(m.dealt)) * m.plates : 0);
    if (discs > DISCS_MAX) out.push(`${discs} discs on the chart (≤ ${DISCS_MAX}: trade first)`);
    if (m.combined && !m.copies) out.push('combined needs copies');
    if ((m.copies || m.plates || m.shift) && !m.value) out.push('copies, plates and shift need the value');
    if (m.copies && m.plates) out.push('copies (×) and plates (÷) do not go together');
    if (m.dealt && !m.plates) out.push('dealt needs plates');
    if (m.plates && m.value) {
      const onChart = m.left ? dtotal(dcounts(m.left)) : 0;
      const shared = dtotal(dcounts(m.dealt)) * m.plates;
      if ((m.left || m.dealt) && onChart + shared !== thousandths(m.value)) out.push(`the discs on the chart and the plates make ${D({ units: (onChart + shared) * 1000, dp: 0 })}, not ${D(m.value)}`);
    }
    if (m.left && m.value && !m.plates && !m.copies && dtotal(dcounts(m.left)) !== thousandths(m.value)) out.push(`the discs left make ${D({ units: dtotal(dcounts(m.left)) * 1000, dp: 0 })}, not ${D(m.value)}`);
    if (typeof m.pad === 'object' && m.value && !eq(m.pad, m.value)) out.push(`pad ${D(m.pad)} is not ${D(m.value)} written longer`);
    if (m.rows && m.value) out.push('write rows or a value, not both');
    if (m.column) {
      const c = m.column;
      if ((c.op === '×' || c.op === '÷') && (places(c.b) > 0 || wholePart(c.b) < 2 || wholePart(c.b) > 9)) out.push('the column method multiplies and divides by a one-digit whole number (2–9)');
      if (c.op === '÷' && !divWhole(c.a, wholePart(c.b), 3).exact) out.push(`${D(c.a)} ÷ ${D(c.b)} does not end within three places`);
      if (c.op === '−' && cmp(c.a, c.b) < 0) out.push('the column subtracts a larger number');
      const own = m.value ?? m.rows?.[0];
      if (own && !eq(own, c.a)) out.push(`the column works ${D(c.a)}, the chart shows ${D(own)}`);
    }
  }
  if (m.kind === 'numberline' && m.scale === 'decimal') {
    const base = baseLevel(m);
    if (!base) out.push(`from ${D(m.from)} to ${D(m.to)} is not a whole number of steps of ${D(m.step)}`);
    else if (base.steps > LINE_MAX_STEPS) out.push(`${base.steps} steps (≤ ${LINE_MAX_STEPS})`);
    const levels = levelsOf(m);
    levels.slice(1).forEach((l, i) => {
      if (!l) out.push(`zoom ${i + 1} is not one step of the line above`);
    });
    const deepest = levels.at(-1);
    for (const mk of m.marks ?? []) if (deepest && (cmp(mk, deepest.from) < 0 || cmp(mk, deepest.to) > 0) && (!base || cmp(mk, base.from) < 0 || cmp(mk, base.to) > 0)) out.push(`mark ${D(mk)} is off the line`);
    if (m.arrow && !levels.some((l) => l && tickOf(l, m.arrow!) !== null)) out.push(`the arrow at ${D(m.arrow)} is not on a tick`);
    if (m.nearest && deepest && !eq(m.nearest, deepest.from) && !eq(m.nearest, deepest.to)) out.push('nearest is one end of the (deepest) line');
    if (m.halfway && deepest && deepest.steps !== 10) out.push('the halfway mark is for a line of ten steps between two neighbours');
    if (m.dual && !m.unit) out.push('dual needs the line\'s unit');
  }
  if (m.kind === 'money') {
    const amounts = [...(m.amount ? [m.amount] : []), ...(m.pair ?? []).map((g) => g.amount)];
    for (const a of amounts) {
      const c = centsOf(a);
      if (c === null || c % 5 !== 0) out.push(`${D(a)}: money is a whole number of 5 cents (no 1-cent coin)`);
    }
    if (m.pieces && m.amount && centsOf(m.amount) !== totalCents(m.pieces)) out.push(`the pieces make ${moneyText(totalCents(m.pieces))}, not $${D(m.amount)}`);
    if (!m.amount && !m.pieces && !m.pair) out.push('money needs an amount, pieces or a pair');
    if (piecesOf(m).length > 30) out.push('more than 30 coins and notes');
    if (m.trade && piecesOf(m).filter((p) => p === '0.1').length < 10) out.push('trade t>O needs ten 10¢ coins');
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

/** Codes a decimal task can diagnose (docs/29 §3.8: validate rejects the rest). */
function undiagnosable(task: Task, code: MisconceptionCode): string | null {
  if (task.kind === 'choose') return task.options.some((o) => o.misconception === code) ? null : `"${code}": no option shows it`;
  const spec = inputSpecOf(task);
  const w = spec ? workOf(task, spec) : null;
  const does = (...d: DecimalWork['do'][]) => !!w && d.includes(w.do);
  const need = (ok: boolean, what: string) => (ok ? null : `"${code}" needs ${what}`);
  const kind = task.kind;
  const decimalInput = spec?.form === 'decimal';
  switch (code) {
    case 'longer-is-larger':
    case 'shorter-is-larger':
      return need(kind === 'compare' || kind === 'order', 'a compare or order task');
    case 'trailing-zero-changes':
      return need(kind === 'compare', 'a compare task');
    case 'point-separator':
      return need(decimalInput && does('add', 'subtract', 'multiply'), 'work add, subtract or multiply');
    case 'zero-placeholder':
      return need(kind === 'shade-decimal' || kind === 'place' || (decimalInput && (!w || does('compose', 'read', 'to-decimal') || (does('convert') && !!w?.from && !!w.into && !!conversionOf(w.from, w.into)?.down))), 'a decimal written, shaded or placed (work compose, read, to-decimal, convert to the smaller unit, or none)');
    case 'place-order':
      return need(kind === 'place' || (decimalInput && does('compose')), 'a place task or work compose');
    case 'fraction-as-digits':
    case 'place-denominator':
      return need(does('to-decimal', 'to-fraction'), 'work to-decimal or to-fraction');
    case 'interval-misread':
      return need(decimalInput && does('read'), 'work read');
    case 'tick-counting':
      return need(kind === 'place' || (decimalInput && does('read')), 'a place task or work read');
    case 'round-truncated':
    case 'round-wrong-place':
      return need(decimalInput && (does('round') || (does('divide') && spec?.places !== undefined)), 'work round, or divide with places');
    case 'round-carry-slip':
    case 'round-chain':
    case 'round-half-down':
      return need(decimalInput && does('round'), 'work round (or a round-on-line task)');
    case 'places-short':
      return need(decimalInput && (spec?.places !== undefined || spec?.unit === 'dollar'), 'places (or money)');
    case 'aligned-right':
      return need(kind === 'align-add' || (decimalInput && does('add', 'subtract')), 'an align-add task or work add / subtract');
    case 'carry-not-added':
      return need(decimalInput && does('add', 'multiply'), 'work add or multiply');
    case 'smaller-from-larger':
      return need(decimalInput && does('subtract'), 'work subtract (or an align-add −)');
    case 'empty-place-brought-down':
      return need(decimalInput && does('subtract') && !!w?.a && !!w.b && w.a.dp < w.b.dp, 'work subtract from a number with fewer places');
    case 'point-misplaced':
      return need(decimalInput && does('multiply', 'divide'), 'work multiply or divide');
    case 'zero-in-quotient':
      return need(decimalInput && does('divide'), 'work divide');
    case 'remainder-as-decimal':
      return need(decimalInput && does('divide') && !!w?.a && places(w.a) === 0, 'work divide of a whole number');
    case 'shift-wrong-way':
      return need(kind === 'shift-digits' || (decimalInput && does('scale', 'convert')), 'a shift-digits task or work scale / convert');
    case 'shift-count-wrong':
      return need(kind === 'shift-digits' || (decimalInput && does('scale')), 'a shift-digits task or work scale');
    case 'zero-appended':
      return need(decimalInput && does('scale') && w?.op === '×', 'work scale ×');
    case 'decimal-as-subunit':
    case 'unit-factor-wrong':
      return need(decimalInput && does('convert'), 'work convert');
    case 'not-simplest':
      return need(spec?.form === 'simplest', 'form simplest');
    default:
      return `"${code}" is not one for decimals`;
  }
}

/** The answer a decimal written part should hold, from the task (`null`: nothing to check it against). */
function wantOf(task: Task, spec: InputSpec): Decimal | null {
  if (task.kind === 'round-on-line') return round(task.value, task.to);
  if (task.kind === 'align-add') return task.op === '+' ? add(task.a, task.b) : sub(task.a, task.b);
  if (task.kind === 'share' && typeof task.value !== 'number') {
    const q = divWhole(task.value, task.k, 3);
    return q.exact ? q.q : null;
  }
  if (task.kind === 'regroup' && typeof task.value !== 'number') return task.value;
  const w = spec.work;
  if (!w) return null;
  if (w.do === 'divide' && w.a && w.b && spec.places !== undefined) return round(divWhole(w.a, wholePart(w.b), 6).q, spec.places);
  if (w.do === 'to-decimal' && w.of && !isDec(w.of)) return fromFraction(w.of, 3);
  return workResult(w);
}

/** The decimals a task gives (not its answer), for the limits. */
function givenDecimals(task: Task): Decimal[] {
  const out: Decimal[] = [];
  const num = (v: Frac | DecValue) => {
    if (isDec(v)) out.push(v);
  };
  switch (task.kind) {
    case 'compare':
      num(task.a);
      num(task.b);
      break;
    case 'order':
      task.items.forEach(num);
      break;
    case 'place':
      num(task.target);
      break;
    case 'shade-decimal':
      out.push(task.target);
      break;
    case 'round-on-line':
    case 'shift-digits':
      out.push(task.value);
      break;
    case 'align-add':
      out.push(task.a, task.b);
      break;
    case 'share':
    case 'regroup':
      if (typeof task.value !== 'number') out.push(task.value);
      break;
    default:
      break;
  }
  const spec = inputSpecOf(task);
  const w = spec?.work;
  if (w?.a) out.push(w.a);
  if (w?.b && w.do !== 'multiply' && w.do !== 'divide') out.push(w.b);
  if (w?.of && isDec(w.of)) out.push(w.of);
  return out;
}

/** Every decimal rule for one task. */
export function decimalTaskIssues(task: Task, limits: StepLimits | undefined): string[] {
  const out: string[] = [];
  for (const m of modelsOf(task)) out.push(...decimalModelIssues(m));
  const m = task.model;
  const spec = inputSpecOf(task);
  /* the kinds */
  if (task.kind === 'shade-decimal') {
    if (m.kind !== 'decimal-grid' || m.pair) out.push('a shade-decimal task needs one decimal grid');
    else if (m.level !== task.level) out.push(`the grid is level ${m.level}, the task level ${task.level}`);
    if (places(task.target) > levelPlaces(task.level as GridLevel)) out.push(`${D(task.target)} cannot be shaded on a level-${task.level} grid`);
    if (task.start && cmp(task.start, task.target) >= 0) out.push('start is the given part: less than the target');
    if (task.start && ((thousandths(task.start) ?? 1) % (task.level === 10 ? 100 : 10)) !== 0) out.push('start is whole strips or squares');
    if (m.kind === 'decimal-grid' && (m.given || m.runs)) out.push('the grid of a shade-decimal task is blank (start is the given part)');
    if ((thousandths(task.target) ?? 0) > 3 * 1000) out.push('at most 3 wholes');
    if (task.wholes && (thousandths(task.target) ?? 0) > task.wholes * 1000) out.push(`${D(task.target)} is more than ${task.wholes} whole(s)`);
  }
  if (task.kind === 'place' && m.kind === 'numberline' && m.scale === 'decimal') {
    const t = decOf(task.target);
    if (!t) out.push('place target is not a decimal');
    else if (!pathTo(m, t, task.zoom ?? 0)) out.push(`${D(t)} is not on a tick after ${task.zoom ?? 0} zoom(s) of the line`);
    if (m.zoom || m.marks || m.arrow) out.push('the line of a place task draws no zoom, marks or arrow (the child zooms and places)');
  }
  if (task.kind === 'round-on-line') {
    const e = roundingEnds(task.value, task.to);
    if (places(task.value) <= task.to) out.push(`${D(task.value)} has no more than ${task.to} places: nothing to round`);
    if (!(m.kind === 'numberline' && m.scale === 'decimal' && eq(m.from, e.lo) && eq(m.to, e.hi))) out.push(`the line is the two neighbours: from ${D(e.lo)} to ${D(e.hi)}`);
    if (task.then.form !== 'decimal') out.push('the written part of a round-on-line is form decimal');
    if (task.then.places !== task.to) out.push(`then.places is ${task.to} (the rounded number is written with its places)`);
  }
  if (task.kind === 'align-add') {
    if (task.a.dp === task.b.dp) out.push('the two numbers have as many places: they start lined up');
    else if (alignStart(task.a, task.b, task.start) === 0) out.push(`starting ${task.start}, the rows are already on the point`);
    if (m.kind !== 'place-value') out.push('an align-add task needs the place-value chart');
    if (task.op === '−' && cmp(task.a, task.b) < 0) out.push('the difference is below zero');
    if (task.then.form !== 'decimal') out.push('the written part of an align-add is form decimal');
  }
  if (task.kind === 'shift-digits') {
    const r = shiftTarget(task);
    if (!fitsChart(r)) out.push(`${D(task.value)} ${task.op} ${task.by} does not fit the chart (≤ 9999, ≤ 3 places)`);
    if (m.kind !== 'place-value' || m.show !== 'digits') out.push('a shift-digits task needs the chart with digits');
  }
  if (onChart(task) && (task.kind === 'share' || task.kind === 'regroup')) {
    if (typeof task.value === 'number') out.push(`a ${task.kind} on the chart shares or regroups a decimal ("2.35")`);
    if (task.kind === 'share' && typeof task.value !== 'number') {
      if (!divWhole(task.value, task.k, 3).exact) out.push(`${D(task.value)} ÷ ${task.k} does not end within three places`);
      if (m.kind === 'place-value' && (m.plates ?? task.k) !== task.k) out.push(`the chart has ${m.plates} plates, the task shares into ${task.k}`);
    }
    if (task.kind === 'regroup' && typeof task.value !== 'number') {
      if (dtotal(dcounts(task.start)) !== thousandths(task.value)) out.push(`the discs at the start make ${D({ units: dtotal(dcounts(task.start)) * 1000, dp: 0 })}, not ${D(task.value)}`);
      if (task.goal && dtotal(dcounts(task.goal)) !== thousandths(task.value)) out.push('the goal discs make another number');
      if (!task.goal && dregrouped(dcounts(task.start))) out.push('the discs start with every place under 10: nothing to trade');
    }
  }
  if ((task.kind === 'share' || task.kind === 'regroup') && typeof task.value !== 'number' && m.kind !== 'place-value') out.push(`a decimal ${task.kind} needs the place-value chart`);
  /* the written part */
  if (spec) {
    const answers = answerValues(spec);
    if (spec.form === 'decimal') {
      for (const a of answers) if (!decimalOf(a)) out.push(`answer ${isFracValue(a) ? formatFrac(a) : 'kind' in a ? a.kind : ''} is not a decimal or a whole number`);
      const ds = decimalAnswers(spec);
      if (spec.places !== undefined) for (const a of ds) if (places(a) > spec.places) out.push(`the answer ${D(a)} has more places than places: ${spec.places}`);
      if (spec.sentence && (spec.sentence.match(/\?/g) ?? []).length !== ds.length) out.push('the sentence needs one ? per answer');
      const want = ds.length === 1 ? wantOf(task, spec) : null;
      if (want && !eq(want, ds[0]!)) out.push(`the answer is ${D(ds[0]!)}, the work comes to ${D(want)}`);
      if (spec.unit === 'dollar') for (const a of ds) if (((thousandths(a) ?? 1) / 10) % 5 !== 0) out.push(`$${D(a)}: money is a whole number of 5 cents`);
      if (spec.work?.do === 'divide' && spec.work.a && spec.work.b && spec.places === undefined && !divWhole(spec.work.a, wholePart(spec.work.b), 3).exact) out.push('a division that does not end needs places (rounded)');
    } else if (spec.work) {
      if (spec.work.do !== 'to-fraction') out.push(`work ${spec.work.do} is for form decimal`);
      else if (spec.work.of && isDec(spec.work.of)) {
        const f = toFraction(spec.work.of);
        for (const a of answers) if (!isFracValue(a) || !equivalent(a, f)) out.push(`${D(spec.work.of)} is ${formatFrac(f)}`);
      }
    }
  }
  /* what it may diagnose */
  const codes = [...task.feedback.wrong.map((x) => x.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])];
  for (const c of new Set(codes)) {
    const why = undiagnosable(task, c);
    if (why) out.push(why);
  }
  if (limits) out.push(...limitIssues(task, limits));
  return [...new Set(out)];
}

/** The step's number limits (docs/29 X9). */
function limitIssues(task: Task, L: StepLimits): string[] {
  const out: string[] = [];
  const given = givenDecimals(task);
  const spec = inputSpecOf(task);
  const w = spec ? workOf(task, spec) : null;
  if (L.dp) for (const d of given) if (places(d) < L.dp[0] || places(d) > L.dp[1]) out.push(`${D(d)} has ${places(d)} place(s) (${L.dp[0]}–${L.dp[1]})`);
  if (L.resultDp !== undefined && spec?.form === 'decimal') for (const a of decimalAnswers(spec)) if (places(a) > L.resultDp) out.push(`the answer ${D(a)} has ${places(a)} places (≤ ${L.resultDp})`);
  if (L.maxValue !== undefined) for (const d of [...given, ...(spec?.form === 'decimal' ? decimalAnswers(spec) : [])]) if (cmp(d, { units: L.maxValue * 1_000_000, dp: 0 }) > 0) out.push(`${D(d)} (numbers ≤ ${L.maxValue})`);
  if (L.factor) {
    const k = w && (w.do === 'multiply' || w.do === 'divide') && w.b ? wholePart(w.b) : task.kind === 'share' ? task.k : null;
    if (k !== null && (k < L.factor[0] || k > L.factor[1])) out.push(`× ÷ ${k} (${L.factor[0]}–${L.factor[1]})`);
  }
  if (L.denominators && w?.do === 'to-decimal' && w.of && !isDec(w.of) && !L.denominators.includes(w.of.d)) out.push(`denominator ${w.of.d} (${L.denominators.join(', ')})`);
  if (L.roundTo) {
    const to = task.kind === 'round-on-line' ? task.to : w?.do === 'round' ? w.to : spec?.places !== undefined && w?.do === 'divide' ? spec.places : undefined;
    if (to !== undefined && (to < L.roundTo[0] || to > L.roundTo[1])) out.push(`rounded to ${to} places (${L.roundTo[0]}–${L.roundTo[1]})`);
  }
  if (L.by) {
    const by = task.kind === 'shift-digits' ? task.by : w?.do === 'scale' ? w.by : undefined;
    const base = by === undefined ? null : L.by.find((b) => by === b || (L.multiples && by % b === 0 && by / b >= 2 && by / b <= 9));
    if (by !== undefined && !base) out.push(`× ÷ ${by} (${L.by.join(', ')}${L.multiples ? ' and their multiples' : ''})`);
  }
  if (L.units && w?.do === 'convert' && w.from && w.into && !['dollar', 'cent'].includes(w.from)) {
    const pair = conversionOf(w.from, w.into)?.down ? `${w.from}-${w.into}` : `${w.into}-${w.from}`;
    if (!(L.units as string[]).includes(pair === 'm-km' ? 'km-m' : pair)) out.push(`${w.from} ↔ ${w.into} (${L.units.join(', ')})`);
  }
  if (L.money) {
    const amounts = [...modelsOf(task).flatMap((mm) => (mm.kind === 'money' ? [...(mm.amount ? [mm.amount] : []), ...(mm.pair ?? []).map((g) => g.amount)] : [])), ...(spec?.unit === 'dollar' ? [...decimalAnswers(spec), ...given] : [])];
    for (const a of amounts) if ((centsOf(a) ?? 1) % 5 !== 0) out.push(`$${D(a)} is not a whole number of 5 cents`);
  }
  if (L.zoomDepth !== undefined && task.kind === 'place' && (task.zoom ?? 0) > L.zoomDepth) out.push(`${task.zoom} zooms (≤ ${L.zoomDepth})`);
  return out;
}

