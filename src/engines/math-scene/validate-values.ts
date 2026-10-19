/**
 * MathScene content rules for whole numbers and time (docs/19 §3.5, docs/20
 * §3.6), beside the fraction and grid rules in `validate.ts`: the array, the
 * whole-number line and the blocks can be drawn as written; every task's
 * answer is the right one for its fact (`op`), its span or its conversion, in
 * the form's kind of value; what each declared misconception needs to be
 * diagnosed is there (the domain's codes only); the step's number limits
 * (`factors`, `maxTotal`, `divisor`, `maxQuotient`, `maxValue`, `clock`,
 * `step`, `maxDuration`). Build time only; shared with `scripts/math/check-pool.ts`.
 */
import { ARRAY_KINDS, BLOCKS_KINDS, FRACTION_FORMS, MISCONCEPTION_DOMAINS, TIME_FORMS, TIME_KINDS, type ArrayLayoutSpec, type BlocksModelSpec, type ClockFaceSpec, type ClockModelSpec, type InputSpec, type MisconceptionCode, type MisconceptionDomain, type Model, type NumberLineSpec, type StepLimits, type Task, type TimelineSpec } from './schema';
import { inputSpecOf } from './lib/state';
import { isFractionModel } from './lib/check';
import { answerValues } from './lib/forms';
import { ARRAY_MAX_DOT_ROWS, ARRAY_MAX_ROWS, ARRAY_MAX_THINGS, factOf, groupSizes, layoutOf, layoutsOf, thingCount } from './lib/array';
import { blockCount, canTrade, counts, matOf, regrouped, standard, total } from './lib/blocks';
import { opResult } from './lib/diagnose/whole-ops';
import { isDecimalTask } from './lib/decimal-tasks';
import { isMeasureTask } from './lib/measure-kind';
import { splitArrayCut } from './lib/solve';
import { DAY, formatAnswer, formatClock, formatDuration, HOUR, isFracValue, MINUTE, WHOLE_MAX, type AnswerValue } from './lib/value';
import { clockStart, facesOf, HALF_DAY } from './lib/clock';
import { hopStart, rangeOf } from './lib/timeline';
import { durationGoal } from './lib/solve';

/** Most blocks a stage draws at once (docs/19 §3.2: trade first). */
export const BLOCKS_MAX = 120;

const ARRAY_TASKS = new Set<string>(ARRAY_KINDS);
const BLOCK_TASKS = new Set<string>(BLOCKS_KINDS);
const TIME_TASKS = new Set<string>(TIME_KINDS);
const isTimeModel = (m: Model) => m.kind === 'clock' || m.kind === 'timeline';

const modelsOf = (task: Task): Model[] => [task.model, ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.model ? [o.model] : [])) : [])];

/** The domain a task's misconceptions come from (docs/19 G5): grid → measure, instruments and quantities → measure-reading (docs/32), decimals → decimals, times → time, whole numbers → whole-ops, else fractions. */
export function domainOf(task: Task): MisconceptionDomain {
  const models = modelsOf(task);
  if (models.some((m) => m.kind === 'grid') || ['count-squares', 'trace-perimeter', 'draw-rectangle', 'split-figure'].includes(task.kind)) return 'measure';
  if (isMeasureTask(task)) return 'measure-reading';
  if (isDecimalTask(task)) return 'decimals';
  const spec = inputSpecOf(task);
  if (spec && ((TIME_FORMS as readonly string[]).includes(spec.form) || spec.convert || spec.span)) return 'time';
  if (TIME_TASKS.has(task.kind) || models.some(isTimeModel)) return 'time';
  if (ARRAY_TASKS.has(task.kind) || BLOCK_TASKS.has(task.kind)) return 'whole-ops';
  if (models.some((m) => m.kind === 'array' || m.kind === 'blocks' || (m.kind === 'numberline' && m.scale === 'whole'))) return 'whole-ops';
  if (spec && (spec.op || spec.form === 'remainder' || (spec.form === 'whole' && !isFractionModel(task.model)))) return 'whole-ops';
  return 'fractions';
}

/** The domain a code is registered in. */
export function domainOfCode(code: MisconceptionCode): MisconceptionDomain {
  return (Object.keys(MISCONCEPTION_DOMAINS) as MisconceptionDomain[]).find((d) => (MISCONCEPTION_DOMAINS[d] as readonly string[]).includes(code))!;
}

/* ------------------------------------------------------------------ */
/* Models                                                              */
/* ------------------------------------------------------------------ */

function layoutIssues(s: ArrayLayoutSpec, where = ''): string[] {
  const out: string[] = [];
  const at = where ? `${where}: ` : '';
  const layout = layoutOf(s);
  if (!layout) return [`${at}an array needs a layout (scatter with count, groups with groups and size or sizes, rows with rows and cols)`];
  if (layout === 'scatter' && !s.count) out.push(`${at}a scatter needs count`);
  if (layout === 'groups' && !s.sizes && !s.filled && !(s.groups && s.size !== undefined)) out.push(`${at}groups need groups and size (or sizes)`);
  if (layout === 'rows' && !(s.rows && s.cols)) out.push(`${at}rows need rows and cols`);
  if (s.filled && s.container !== 'car') out.push(`${at}filled is for cars`);
  if (s.filled && s.groups && s.filled.length !== s.groups) out.push(`${at}filled lists ${s.filled.length} cars, groups says ${s.groups}`);
  const n = thingCount(s);
  if (layout !== 'rows' && n > ARRAY_MAX_THINGS) out.push(`${at}${n} things (a scatter or groups draws ≤ ${ARRAY_MAX_THINGS}; use rows or the blocks)`);
  if (layout === 'rows') {
    const max = s.object === 'dot' ? ARRAY_MAX_DOT_ROWS : ARRAY_MAX_ROWS;
    if ((s.rows ?? 0) > max || (s.cols ?? 0) > max) out.push(`${at}${s.rows} × ${s.cols} is over ${max} × ${max} (use the blocks or the grid)`);
    if (s.split?.rows && s.split.rows[0]! >= s.rows!) out.push(`${at}the cut after row ${s.split.rows[0]} is past the last row`);
    if (s.split?.cols && s.split.cols[0]! >= s.cols!) out.push(`${at}the cut after column ${s.split.cols[0]} is past the last column`);
    if (s.split?.rows && s.split.cols) out.push(`${at}split rows or columns, not both`);
    for (const r of s.crossed?.rows ?? []) if (r >= s.rows!) out.push(`${at}crossed row ${r} is past the last row`);
    for (const c of s.crossed?.cols ?? []) if (c >= s.cols!) out.push(`${at}crossed column ${c} is past the last column`);
  } else {
    if (s.split || s.cover || s.crossed?.rows || s.crossed?.cols) out.push(`${at}split, cover and crossed rows are for rows`);
    if (layout === 'groups') for (const g of s.crossed?.groups ?? []) if (g >= groupSizes(s).length) out.push(`${at}crossed group ${g} is past the last group`);
  }
  if (s.another && !(s.extra && layout === 'groups')) out.push(`${at}another circles the left-over of groups (needs extra)`);
  if (layout === 'scatter' && s.containers && !s.containers.count && !s.containers.size) out.push(`${at}containers need a count (to deal into) or a size (to pack in)`);
  return out;
}

function lineIssues(m: NumberLineSpec): string[] {
  const out: string[] = [];
  if (m.scale === 'fraction') {
    if (m.intervals === undefined) out.push('a fraction number line needs intervals (per whole)');
    if (m.to > 3) out.push(`a fraction number line goes to 3 at most (to: ${m.to})`);
    if (m.step || m.jumps || m.counter || m.major) out.push('step, major, jumps and counter are for the whole-number line (scale: whole)');
    if (m.labels === 'tens' || m.labels === 'steps') out.push(`labels "${m.labels}" are for the whole-number line`);
    return out;
  }
  const step = m.step ?? 1;
  if (m.intervals !== undefined || m.withBar) out.push('intervals and withBar are for the fraction line');
  if (m.to <= m.from) out.push('the line must go up');
  if ((m.to - m.from) % step !== 0) out.push(`from ${m.from} to ${m.to} is not a whole number of steps of ${step}`);
  if ((m.to - m.from) / step > 100) out.push('more than 100 ticks');
  if (m.major !== undefined && m.major % step !== 0) out.push(`numbered ticks every ${m.major} are not on ticks of ${step}`);
  for (const f of [...(m.marks ?? []), ...(m.arrow ? [m.arrow] : [])]) {
    if (f.d !== 1 || f.w) out.push(`${f.n}/${f.d} is not a whole number (scale: whole)`);
    else if (f.n < m.from || f.n > m.to) out.push(`${f.n} is off the line`);
  }
  if (m.jumps) {
    const end = (m.jumps.from ?? m.from) + m.jumps.size * m.jumps.count;
    if (end > m.to) out.push(`the jumps end at ${end}, past the line's end ${m.to}`);
    if (m.jumps.size % step !== 0) out.push(`jumps of ${m.jumps.size} do not land on ticks of ${step}`);
  }
  return out;
}

function blocksIssues(m: BlocksModelSpec): string[] {
  const out: string[] = [];
  const mat = matOf(m);
  const per = m.copies && !m.combined && !m.left ? blockCount(standard(m.value ?? 0)) * m.copies : blockCount(mat);
  const plates = m.plates ? blockCount(counts(m.dealt)) * m.plates : 0;
  if (per + plates > BLOCKS_MAX) out.push(`${per + plates} blocks on the stage (≤ ${BLOCKS_MAX}: trade first)`);
  if (m.dealt && !m.plates) out.push('dealt needs plates');
  if (m.copies && m.plates) out.push('copies (×) and plates (÷) do not go together');
  if (m.combined && !m.copies) out.push('combined needs copies');
  if (m.left && m.value !== undefined && !m.plates && !m.copies && total(counts(m.left)) !== m.value) out.push(`the blocks left make ${total(counts(m.left))}, not ${m.value}`);
  if (m.plates && m.value !== undefined && total(mat) + m.plates * total(counts(m.dealt)) !== m.value) out.push(`the blocks on the mat and the plates make ${total(mat) + m.plates * total(counts(m.dealt))}, not ${m.value}`);
  if (m.trade && !m.left && !m.combined && m.value !== undefined && !canTrade(mat, m.trade) && !regrouped(mat)) out.push(`trade ${m.trade} is not possible here`);
  if (m.column) {
    const c = m.column;
    if (c.op === '÷' && c.b > 9) out.push('the column method divides by one digit');
    if (c.op === '×' && c.a > 999) out.push('the column method multiplies up to 3 digits');
    if (m.value !== undefined && c.a !== m.value) out.push(`the column works ${c.a}, the blocks show ${m.value}`);
  }
  if (!m.mat && !m.column) out.push('blocks without the mat need a column working');
  return out;
}

/** A clock face (docs/20 §3.1). */
function faceIssues(f: ClockFaceSpec, where = ''): string[] {
  const out: string[] = [];
  const at = where ? `${where}: ` : '';
  if (f.face === 'stopwatch') {
    if (!f.elapsed) out.push(`${at}a stopwatch needs elapsed`);
    else if (f.elapsed.t > 30 * MINUTE) out.push(`${at}a stopwatch's minute dial goes to 30 min`);
    if (f.faulty || f.arc || f.hourTrack || f.zoom || f.inner24 || f.minuteLabels || f.ampm || f.second || f.lit || f.highlightTicks) out.push(`${at}a stopwatch draws its own dial (no faulty, arc, hourTrack, zoom, inner24, minuteLabels, ampm, second, lit, highlightTicks)`);
    return out;
  }
  if (f.elapsed) out.push(`${at}elapsed is for a stopwatch`);
  if (f.arc) {
    const d = f.arc.to - f.arc.from;
    if (d <= 0) out.push(`${at}the arc must end after it starts (${formatClock(f.arc.from)} → ${formatClock(f.arc.to)})`);
    else if (d > 4 * HOUR) out.push(`${at}an arc of more than 4 h has too many rings`);
  }
  if (f.hourTrack && f.hourTrack !== true && (f.hourTrack.from > f.time || f.time - f.hourTrack.from > HALF_DAY)) out.push(`${at}hourTrack from ${formatClock(f.hourTrack.from)} is not within 12 hours before ${formatClock(f.time)}`);
  if (f.faulty && f.second) out.push(`${at}a faulty clock has no second hand`);
  return out;
}

/** A clock model: its faces, a pair's labels, the lens. */
export function clockIssues(m: ClockModelSpec): string[] {
  if (!m.pair) return faceIssues(m);
  return [...m.pair.flatMap((f, i) => faceIssues(f, `pair ${i + 1}`)), ...(m.pair.some((f) => !f.label) ? ['each face of a pair needs a label'] : []), ...(m.pair.some((f) => f.zoom) || m.zoom ? ['the lens is for one face'] : [])];
}

/** A timeline (docs/20 §3.2): its range, marks and jumps on it. */
export function timelineIssues(m: TimelineSpec): string[] {
  const out: string[] = [];
  const r = rangeOf(m);
  const fmt = (t: number) => (r.duration ? formatDuration(t) : t === DAY ? '24:00' : formatClock(t));
  if (m.scale === 'day' && (m.from !== undefined || m.to !== undefined)) out.push('a day timeline runs 00:00–24:00 (no from or to)');
  if (m.scale === 'span' && (m.from === undefined || m.to === undefined)) out.push('a span timeline needs from and to');
  if (m.scale === 'duration' && m.to === undefined) out.push('a duration timeline needs to');
  if (m.scale === 'duration' && m.from !== undefined && m.from !== 0) out.push('a duration timeline starts at 0');
  if (r.to <= r.from) out.push(`the timeline must go forwards (${fmt(r.from)} → ${fmt(r.to)})`);
  if (r.to > DAY) out.push('a timeline ends by 24:00');
  if (m.scale !== 'day' && r.to - r.from > 6 * HOUR) out.push(`a ${m.scale} timeline covers 6 h at most`);
  if (r.duration && (m.labels === 'both' || m.bands)) out.push('labels both and bands are for times of day');
  for (const k of m.marks ?? []) if (k.at < r.from || k.at > r.to) out.push(`mark ${fmt(k.at)} is off the line`);
  for (const [a, b] of m.jumps ?? []) {
    if (a === b) out.push(`a jump from ${fmt(a)} to itself`);
    if (Math.min(a, b) < r.from || Math.max(a, b) > r.to) out.push(`the jump ${fmt(a)} → ${fmt(b)} is off the line`);
  }
  return out;
}

/** Can a whole-number or time model be drawn as written? */
export function valueModelIssues(m: Model): string[] {
  if (m.kind === 'clock') return clockIssues(m);
  if (m.kind === 'timeline') return timelineIssues(m);
  if (m.kind === 'numberline' && m.scale !== 'decimal') return lineIssues(m);
  if (m.kind === 'array') {
    if (m.pair) return [...layoutsOf(m).flatMap((s, i) => layoutIssues(s, `pair ${i + 1}`)), ...(m.pair.some((p) => !p.label) ? ['each side of a pair needs a label'] : [])];
    return layoutIssues(m);
  }
  if (m.kind === 'blocks') return blocksIssues(m);
  return [];
}

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

const isWholeAnswer = (a: AnswerValue) => isFracValue(a) && a.d === 1 && !a.w && a.n <= WHOLE_MAX;

/** Is the answer of the form's kind? */
function formIssues(spec: InputSpec): string[] {
  const out: string[] = [];
  const answers = answerValues(spec);
  const form = spec.form;
  const kind = (a: AnswerValue) => ('kind' in a ? a.kind : isWholeAnswer(a) ? 'whole' : 'fraction');
  for (const a of answers) {
    const k = kind(a);
    const ok =
      (FRACTION_FORMS as readonly string[]).includes(form) ? k === 'fraction' || k === 'whole' :
      form === 'whole' || form === 'measure' ? k === 'whole' :
      form === 'remainder' ? k === 'rem' || k === 'whole' :
      form === 'duration' ? k === 'dur' :
      k === 'clock';
    if (!ok) out.push(`answer ${formatAnswer(a)} does not fit form "${form}"`);
  }
  if (!['whole', 'measure', ...FRACTION_FORMS].includes(form) && answers.length > 1) out.push(`form "${form}" writes one answer`);
  if (spec.sentence && (spec.sentence.match(/\?/g) ?? []).length !== answers.length) out.push('the sentence needs one ? per answer');
  if (spec.units && form !== 'duration') out.push('units is for form duration');
  return out;
}

/** Is the answer the right one for the task's fact, span or conversion? */
function answerIssues(task: Task, spec: InputSpec): string[] {
  const out: string[] = [];
  const answers = answerValues(spec);
  const op = spec.op;
  if (op) {
    if (op.kind === '÷' && op.missing && op.missing !== 'c') out.push('a division asks for its result (missing: a or b is for ×)');
    if (op.round && op.kind !== '÷') out.push('round is for a division');
    const want = opResult(op);
    const fits = answers.some((a) => ('n' in want ? (isFracValue(a) && a.d === 1 && a.n === want.n) || ('kind' in a && a.kind === 'rem' && a.r === 0 && a.q === want.n) : 'kind' in a && a.kind === 'rem' && a.q === want.q && a.r === want.r));
    if (!fits) out.push(`no answer is ${'n' in want ? want.n : `${want.q} r ${want.r}`}, the result of ${op.a} ${op.kind} ${op.b}`);
    if (spec.form === 'remainder' && 'n' in want && !op.round) out.push(`${op.a} ÷ ${op.b} has no remainder (use form whole)`);
    if (spec.form === 'whole' && 'q' in want) out.push(`${op.a} ÷ ${op.b} leaves ${want.r}: use form remainder, or round`);
  }
  for (const a of answers) if ('kind' in a && a.kind === 'rem' && op && op.kind === '÷' && a.r >= op.b) out.push(`remainder ${a.r} is not less than ${op.b}`);
  if (spec.span) {
    const s = spec.span;
    const a = answers[0];
    const L = s.length?.t;
    const value = a && 'kind' in a && (a.kind === 'clock' || a.kind === 'dur') ? a.t : null;
    const day = 24 * HOUR;
    if (s.ask === 'end' && (s.start === undefined || L === undefined)) out.push('span: ask end needs start and length');
    if (s.ask === 'start' && (s.end === undefined || L === undefined)) out.push('span: ask start needs end and length');
    if (s.ask === 'length' && (s.start === undefined || s.end === undefined)) out.push('span: ask length needs start and end');
    if (s.ask === 'end' && s.start !== undefined && L !== undefined && value !== (s.start + L) % day) out.push('the answer is not the start plus the length');
    if (s.ask === 'start' && s.end !== undefined && L !== undefined && value !== (s.end - L + day) % day) out.push('the answer is not the end less the length');
    if (s.ask === 'length' && s.start !== undefined && s.end !== undefined && spec.form === 'duration' && value !== (s.end - s.start + day) % day) out.push('the answer is not the time from start to end');
    if (s.ask === 'length' && spec.form !== 'duration' && spec.form !== 'whole') out.push('a length is written as a duration (or a whole number of hours)');
    if (s.ask !== 'length' && !['time12', 'time24', 'face'].includes(spec.form)) out.push(`a ${s.ask} time is written as a time of day`);
  }
  if (spec.convert) {
    const a = answers[0];
    const from = spec.convert.from.t;
    if (spec.form === 'whole' && a && isFracValue(a)) {
      const to = spec.convert.to ?? 'min';
      const want = to === 'h' ? from / HOUR : to === 'min' ? from / MINUTE : from;
      if (a.n !== want) out.push(`${formatDuration(from, spec.convert.from.units)} is ${want} ${to}, not ${a.n}`);
    } else if (spec.form === 'duration' && a && 'kind' in a && a.kind === 'dur' && a.t !== from) out.push('the answer is not the same length as the duration converted');
  }
  if (task.kind === 'split-array') {
    const n = answers.map((v) => (isFracValue(v) ? v.n : -1));
    if (n.length !== 3) out.push('a split-array task writes three numbers: part, part, the whole (? × ? = ?, … or ? + ? = ?)');
    else {
      if (n[2] !== task.rows * task.cols) out.push(`the last answer is ${n[2]}, the array has ${task.rows * task.cols}`);
      const cut = splitArrayCut(task);
      const p = Number(cut.slice(1));
      const [other, whole] = cut.startsWith('r') ? [task.cols, task.rows] : [task.rows, task.cols];
      if (n[0] !== p * other || n[1] !== (whole - p) * other) out.push(`the parts are ${n[0]} and ${n[1]}; ${task.at ? 'the cut given' : 'no cut of the array'} makes them`);
    }
  }
  if (task.kind === 'share' && typeof task.value === 'number') {
    const want = opResult({ kind: '÷', a: task.value, b: task.k });
    const a = answers[0];
    const ok = a && ('n' in want ? isFracValue(a) && a.n === want.n : 'kind' in a && a.kind === 'rem' && a.q === want.q && a.r === want.r);
    if (!ok) out.push(`${task.value} ÷ ${task.k} is ${'n' in want ? want.n : `${want.q} r ${want.r}`}`);
  }
  if (task.kind === 'regroup' && task.then) {
    const a = answers[0];
    if (!a || !isFracValue(a) || a.n !== task.value) out.push(`the blocks make ${task.value}`);
  }
  return out;
}

/** Codes a task can diagnose, from its kind, form and the context it gives (docs/19 G5: validate rejects the rest). */
function undiagnosable(task: Task, code: MisconceptionCode): string | null {
  const spec = inputSpecOf(task);
  if (task.kind === 'choose') return task.options.some((o) => o.misconception === code) ? null : `"${code}": no option shows it`;
  const modelCodes: Partial<Record<Task['kind'], MisconceptionCode[]>> = {
    group: ['groups-size-swapped', 'unequal-groups', 'remainder-too-big'],
    arrange: ['groups-size-swapped'],
    'skip-count': ['skip-count-slip'],
    share: ['not-traded', 'remainder-too-big'],
  };
  if (modelCodes[task.kind]?.includes(code)) return null;
  if (task.kind === 'set-clock') {
    const read: MisconceptionCode[] = ['hands-swapped', 'next-hour', 'numeral-as-minutes', 'five-count-slip', ...(task.ampm ? (['am-pm', 'noon-midnight'] as const) : [])];
    return read.includes(code) ? null : `"${code}" cannot be diagnosed by setting a clock${task.ampm ? '' : ' (am-pm and noon-midnight need ampm: true)'}`;
  }
  if (!spec) return `"${code}" cannot be diagnosed by a ${task.kind} task`;
  const op = spec.op ?? (task.kind === 'split-array' ? { kind: '×' as const } : task.kind === 'share' || task.kind === 'group' ? { kind: '÷' as const } : null);
  const clock = ['time12', 'time24', 'face'].includes(spec.form);
  const need = (ok: boolean, what: string) => (ok ? null : `"${code}" needs ${what}`);
  switch (code) {
    case 'added-not-multiplied':
    case 'split-slip':
    case 'carry-not-added':
    case 'digits-concatenated':
    case 'partial-product-missed':
      return need(op?.kind === '×', 'a multiplication (op ×)');
    case 'operation-swapped':
    case 'skip-count-slip':
      return need(!!op, 'the fact (op)');
    case 'remainder-too-big':
      return need(op?.kind === '÷' && spec.form === 'remainder', 'a division written with a remainder (op ÷, form remainder)');
    case 'remainder-dropped':
    case 'zero-in-quotient':
    case 'not-traded':
      return need(op?.kind === '÷', 'a division (op ÷)');
    case 'remainder-context':
      return need(!!spec.op?.round, 'a division word problem (op ÷ with round)');
    case 'tens-as-ones':
    case 'extra-zero':
      return need(spec.form === 'whole', 'a whole number written');
    case 'hands-swapped':
    case 'next-hour':
    case 'numeral-as-minutes':
    case 'five-count-slip':
      return need(clock, 'a time read and written (form time12, time24 or face)');
    case 'am-pm':
      return need(spec.form === 'time12', 'form time12');
    case 'noon-midnight':
    case '24h-offset':
      return need(spec.form === 'time12' || spec.form === 'time24', 'form time12 or time24');
    case 'base-100':
      return need(!!spec.convert || (!!spec.span && spec.span.ask !== undefined), 'a conversion (convert) or a span');
    case 'count-endpoints':
      return need(spec.span?.ask === 'length', 'a span asking its length');
    case 'wrong-direction':
      return need(spec.span?.ask === 'start' || spec.span?.ask === 'end', 'a span asking its start or end');
    case 'unequal-groups':
    case 'sharing-only':
    case 'divide-order':
    case 'hour-hand-on-numeral':
      return `"${code}" is diagnosed by a choose option${code === 'unequal-groups' ? ' (or the groups of a group task)' : ''}`;
    default:
      return null;
  }
}

/** The numbers a task works with, for the step's limits. */
function numbersOf(task: Task): { factors: [number, number][]; totals: number[]; divisions: { a: number; b: number }[]; values: number[]; times: number[]; durations: number[] } {
  const out = { factors: [] as [number, number][], totals: [] as number[], divisions: [] as { a: number; b: number }[], values: [] as number[], times: [] as number[], durations: [] as number[] };
  const fromModel = (m: Model) => {
    if (m.kind === 'array')
      for (const s of layoutsOf(m)) {
        const f = factOf(s);
        if (f) {
          out.factors.push([f.groups, f.each]);
          out.totals.push(f.total);
        } else out.totals.push(thingCount(s));
      }
    if (m.kind === 'blocks') {
      if (m.value !== undefined) out.values.push(m.value);
      if (m.copies && m.value !== undefined) out.factors.push([m.value, m.copies]);
      if (m.plates && m.value !== undefined) out.divisions.push({ a: m.value, b: m.plates });
      if (m.column) {
        out.values.push(m.column.a, m.column.op === '×' ? m.column.a * m.column.b : m.column.a);
        if (m.column.op === '÷') out.divisions.push({ a: m.column.a, b: m.column.b });
      }
    }
    if (m.kind === 'numberline' && m.scale === 'whole') {
      out.values.push(m.to);
      if (m.jumps) out.factors.push([m.jumps.count, m.jumps.size]);
    }
    if (m.kind === 'clock')
      for (const f of facesOf(m)) {
        if (f.face === 'stopwatch') {
          if (f.elapsed) out.durations.push(f.elapsed.t);
        } else out.times.push(f.time);
        if (f.arc) out.times.push(f.arc.from, f.arc.to);
      }
    if (m.kind === 'timeline') {
      const r = rangeOf(m);
      const points = [...(m.marks ?? []).map((k) => k.at), ...(m.jumps ?? []).flat()];
      if (r.duration) out.durations.push(...points);
      else out.times.push(...points.filter((t) => t < DAY));
    }
  };
  modelsOf(task).forEach(fromModel);
  switch (task.kind) {
    case 'group':
      out.totals.push(task.total);
      out.divisions.push({ a: task.total, b: task.k });
      break;
    case 'arrange':
    case 'split-array':
      out.factors.push([task.rows, task.cols]);
      out.totals.push(task.rows * task.cols);
      break;
    case 'skip-count':
      out.factors.push([task.count, task.size]);
      out.totals.push(task.count * task.size);
      break;
    case 'regroup':
      if (typeof task.value === 'number') out.values.push(task.value);
      break;
    case 'share':
      if (typeof task.value !== 'number') break;
      out.values.push(task.value);
      out.divisions.push({ a: task.value, b: task.k });
      break;
    case 'set-clock':
      out.times.push(task.target);
      break;
    default:
      break;
  }
  const spec = inputSpecOf(task);
  if (spec) {
    if (spec.op) {
      if (spec.op.kind === '×') {
        out.factors.push([spec.op.a, spec.op.b]);
        out.totals.push(spec.op.a * spec.op.b);
      } else out.divisions.push({ a: spec.op.a, b: spec.op.b });
      out.values.push(spec.op.a, spec.op.b);
    }
    for (const a of answerValues(spec)) {
      if (isFracValue(a) && a.d === 1) out.values.push(a.n);
      else if ('kind' in a && a.kind === 'rem') out.values.push(a.q, a.r);
      else if ('kind' in a && a.kind === 'clock') out.times.push(a.t);
      else if ('kind' in a && a.kind === 'dur') out.durations.push(a.t);
    }
    if (spec.span) {
      if (spec.span.start !== undefined) out.times.push(spec.span.start);
      if (spec.span.end !== undefined) out.times.push(spec.span.end);
      if (spec.span.length) out.durations.push(spec.span.length.t);
    }
    if (spec.convert) out.durations.push(spec.convert.from.t);
  }
  return out;
}

/** The step's number limits (docs/19 G11, docs/20 §3.6). */
function limitIssues(task: Task, limits: StepLimits): string[] {
  const out: string[] = [];
  const n = numbersOf(task);
  const spec = inputSpecOf(task);
  if (limits.factors) {
    const [lo, hi] = limits.factors;
    for (const [a, b] of n.factors) if (a < lo || a > hi || b < lo || b > hi) out.push(`${a} × ${b}: factors ${lo}–${hi}`);
  }
  if (limits.maxTotal !== undefined) for (const t of n.totals) if (t > limits.maxTotal) out.push(`a total of ${t} (limit ${limits.maxTotal})`);
  if (limits.divisor) {
    const [lo, hi] = limits.divisor;
    for (const d of n.divisions) if (d.b < lo || d.b > hi) out.push(`÷ ${d.b}: divisors ${lo}–${hi}`);
  }
  if (limits.maxQuotient !== undefined) for (const d of n.divisions) if (Math.floor(d.a / d.b) > limits.maxQuotient) out.push(`${d.a} ÷ ${d.b} = ${Math.floor(d.a / d.b)} (quotients ≤ ${limits.maxQuotient})`);
  if (limits.maxValue !== undefined) for (const v of n.values) if (v > limits.maxValue) out.push(`${v} (numbers ≤ ${limits.maxValue})`);
  if (limits.clock === '12h' && (spec?.form === 'time24' || modelsOf(task).some((m) => m.kind === 'clock' && facesOf(m).some((f) => f.inner24)) || (task.model.kind === 'timeline' && task.model.labels !== '12h'))) out.push('this step reads 12-hour time only');
  if (limits.sameDay && spec?.span) {
    const sp = spec.span;
    const L = sp.length?.t;
    if (sp.ask === 'end' && sp.start !== undefined && L !== undefined && sp.start + L >= DAY) out.push('the span runs past midnight (sameDay)');
    if (sp.ask === 'start' && sp.end !== undefined && L !== undefined && sp.end - L < 0) out.push('the span starts before midnight the day before (sameDay)');
    if (sp.start !== undefined && sp.end !== undefined && sp.end < sp.start) out.push('the span runs past midnight (sameDay)');
  }
  if (limits.step !== undefined) {
    const s = limits.step * MINUTE;
    for (const t of n.times) if (t % s !== 0) out.push(`${formatClock(t)} is not a whole number of ${limits.step} min`);
    for (const t of n.durations) if (t % s !== 0) out.push(`${formatDuration(t)} is not a whole number of ${limits.step} min`);
  }
  if (limits.maxDuration) for (const d of n.durations) if (d > limits.maxDuration.t) out.push(`a duration of ${Math.round(d / MINUTE)} min (limit ${Math.round(limits.maxDuration.t / MINUTE)} min)`);
  // The same number may come from the model and the fact: say it once.
  return [...new Set(out)];
}

/** Every whole-number and time rule for one task. */
export function valueTaskIssues(task: Task, limits: StepLimits | undefined): string[] {
  const out: string[] = [];
  const domain = domainOf(task);
  for (const m of modelsOf(task)) if (m.kind === 'array' || m.kind === 'blocks' || isTimeModel(m) || (m.kind === 'numberline' && m.scale === 'whole')) out.push(...valueModelIssues(m));
  const m = task.model;
  if (ARRAY_TASKS.has(task.kind) && task.kind !== 'skip-count' && m.kind !== 'array') out.push(`a ${task.kind} task needs an array model`);
  if (task.kind === 'skip-count' && !(m.kind === 'numberline' && m.scale === 'whole')) out.push('a skip-count task needs a whole-number line');
  if (BLOCK_TASKS.has(task.kind) && m.kind !== 'blocks') out.push(`a ${task.kind} task needs a blocks model`);
  if (task.kind === 'group') {
    if (task.by === 'share' && task.k > 12) out.push('at most 12 containers');
    if (task.by === 'pack' && Math.floor(task.total / task.k) > 12) out.push(`${Math.floor(task.total / task.k)} boxes (at most 12)`);
  }
  if (task.kind === 'skip-count' && m.kind === 'numberline' && m.scale !== 'decimal') {
    const to = task.to ?? m.to;
    if (task.to !== undefined && task.to !== m.to) out.push(`to ${task.to} is not the line's end ${m.to}`);
    if (task.size * task.count > to) out.push(`${task.count} jumps of ${task.size} go past ${to}`);
    if (task.size % (m.step ?? 1) !== 0) out.push(`jumps of ${task.size} do not land on ticks of ${m.step ?? 1}`);
    if (m.jumps) out.push('the line of a skip-count task draws no jumps (the child makes them)');
  }
  if (task.kind === 'split-array' && m.kind === 'array') {
    if (layoutOf(m) !== 'rows' || m.rows !== task.rows || m.cols !== task.cols) out.push(`the model must be the ${task.rows} × ${task.cols} array in rows`);
    if (m.split) out.push('the model of a split-array task is not split (the child cuts it)');
    if (task.at?.rows && task.at.rows[0]! >= task.rows) out.push('the cut is past the last row');
    if (task.at?.cols && task.at.cols[0]! >= task.cols) out.push('the cut is past the last column');
  }
  if (task.kind === 'regroup') {
    const start = counts(task.start);
    if (total(start) !== task.value) out.push(`the blocks at the start make ${total(start)}, not ${task.value}`);
    if (regrouped(start)) out.push('the blocks start with every place under 10: nothing to trade');
  }
  if (task.kind === 'share' && m.kind === 'blocks' && (m.plates ?? task.k) !== task.k) out.push(`the model has ${m.plates} plates, the task shares into ${task.k}`);
  out.push(...timeTaskIssues(task));
  const spec = inputSpecOf(task);
  if (spec && domain !== 'fractions' && domain !== 'measure') {
    out.push(...formIssues(spec));
    out.push(...answerIssues(task, spec));
  }
  if (domain === 'whole-ops' || domain === 'time') {
    const codes = [...task.feedback.wrong.map((w) => w.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])];
    for (const c of new Set(codes)) {
      const why = undiagnosable(task, c);
      if (why) out.push(why);
    }
  }
  if (limits) out.push(...limitIssues(task, limits));
  return out;
}

/** The clock and timeline tasks (docs/20 §3.4, §3.6): their models, the answer the clock shows, the start of a set clock, the span on the line. */
function timeTaskIssues(task: Task): string[] {
  const out: string[] = [];
  const m = task.model;
  // A clock drawn wrong is for the explanation and for a choice's wrong pictures only.
  if (m.kind === 'clock' && facesOf(m).some((f) => f.faulty)) out.push('faulty clocks are for beats and choose options, not a task\'s own model');
  if (task.kind === 'read-clock') {
    const face = m.kind === 'clock' && !m.pair ? m : null;
    if (!face && !(m.kind === 'timeline' && m.clock)) return [...out, 'a read-clock task needs one clock face (or a timeline with its clock)'];
    const a = task.answer;
    const shown = face ? (face.face === 'stopwatch' ? (face.elapsed?.t ?? 0) : face.time) : m.kind === 'timeline' ? (m.marks?.at(-1)?.at ?? null) : null;
    if (task.form === 'duration') {
      if (face?.face !== 'stopwatch') out.push('a duration is read from a stopwatch');
      else if (!('kind' in a) || a.kind !== 'dur' || a.t !== shown) out.push(`the stopwatch shows ${formatDuration(shown ?? 0)}, the answer is ${formatAnswer(a)}`);
    } else {
      if (face?.face === 'stopwatch') out.push('a stopwatch is read as a duration (form duration)');
      if (!('kind' in a) || a.kind !== 'clock') out.push(`answer ${formatAnswer(a)} is not a time of day`);
      else if (shown === null) out.push('the timeline needs a mark for its clock to show');
      else if (task.form === 'face' ? a.t % HALF_DAY !== shown % HALF_DAY : a.t !== shown) out.push(`the clock shows ${formatClock(shown)}, the answer is ${formatClock(a.t)}`);
      if (task.form === 'face' && face?.ampm === 'ask') out.push('a clock face reading (form face) does not ask am or pm (ampm: ask)');
    }
  }
  if (task.kind === 'set-clock') {
    if (m.kind !== 'clock' || m.pair || m.face === 'stopwatch') return [...out, 'a set-clock task needs one clock face'];
    if (task.target % (task.snap * MINUTE) !== 0) out.push(`${formatClock(task.target)} is not on a ${task.snap}-minute step`);
    const start = clockStart(task);
    if (task.ampm ? start === task.target : start % HALF_DAY === task.target % HALF_DAY) out.push('the clock starts at the time to set');
  }
  if (task.kind === 'duration') {
    if (m.kind !== 'timeline') return [...out, 'a duration task needs a timeline'];
    const r = rangeOf(m);
    if (r.duration) out.push('a duration task jumps between times of day (scale day or span)');
    const s = hopStart(task);
    const goal = durationGoal(task);
    if (!s) out.push(`ask ${task.ask} needs ${task.ask === 'start' ? 'end' : 'start'}`);
    for (const [name, t] of [
      ['the time known', s?.at],
      ['where the jumps end', goal],
    ] as const)
      if (t !== undefined && t !== null && (t < r.from || t > r.to)) out.push(`${name} (${formatClock(t)}) is off the timeline`);
  }
  return out;
}
