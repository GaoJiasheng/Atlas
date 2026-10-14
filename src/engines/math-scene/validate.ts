/**
 * MathScene content rules beyond the schema (docs/15 §4.10, §10), run by
 * `pnpm validate` through `schemas.ts`: chapters and steps one-to-one, the
 * practice chapter, 3–5 explanation beats per step whose models can be drawn,
 * a check pool of 8–10 tasks per step, syllabus and source references,
 * denominators and sums, targets a model can show, planned feedback, prompt
 * length, practice shape and the `{a/b}` tokens in every text. Build time only.
 * `taskIssues` is shared with `scripts/math/check-pool.ts` (authoring drafts).
 */
import { FRACTION_CODES, GRID_KINDS, MEASURE_CODES, type Beat, type GridModelSpec, type Lesson, type MathChapterState, type MathSceneData, type Model, type StepLimits, type Task } from './schema';
import { add, compare, gcd, related, sub, toImproper, valueOnLine, type Frac } from './lib/fraction';
import { baseParts, inputSpecOf } from './lib/state';
import { cutPieces, gridAnswer } from './lib/check';
import { drawnSolution, solve } from './lib/solve';
import { dimEnds, extentOf, factsOf, figureOf, labels, polyIssues } from './lib/grid';
import { askOf } from './lib/diagnose/measure';
import { isAreaUnit, squared, WHOLE_MAX } from './lib/value';
import { badTokens } from '../../lib/rich-text';

export interface LessonIssue {
  level: 'error' | 'warn';
  message: string;
}

export interface ChapterInfo {
  id: string;
  order: number;
  kind?: 'chapter' | 'background';
  state: unknown;
}

const PROMPT_EN = 120;
const PROMPT_ZH = 40;

/** What `<Task id>` in a chapter body may name: a step (its check, one task drawn from the pool) or one pool task. */
export function lessonTaskIds(data: MathSceneData): string[] {
  return data.lesson.steps.flatMap((s) => [s.id, ...s.pool.map((t) => t.id)]);
}

export const BEATS_MIN = 3;
export const BEATS_MAX = 5;
export const POOL_MIN = 8;
export const POOL_MAX = 10;

/** Text length with each `{a/b}` token counted as one character. */
const textLength = (s: string) => [...s.replace(/\{[^{}]*\}/g, '#')].length;

/** Every fraction a task names (fields and models), for the denominator rule. */
function fractionsOf(task: Task): Frac[] {
  const out: Frac[] = [];
  const visit = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (typeof o.n === 'number' && typeof o.d === 'number' && Object.keys(o).every((k) => k === 'n' || k === 'd' || k === 'w')) out.push(o as unknown as Frac);
      else for (const [k, x] of Object.entries(o)) if (k !== 'feedback') visit(x);
    }
  };
  visit(task);
  return out;
}

function sumsOf(task: Task): { op: '+' | '-'; a: Frac; b: Frac }[] {
  if (task.kind === 'build-sum') return [{ op: task.op, a: task.a, b: task.b }];
  const spec = task.kind === 'input' ? task : 'then' in task ? task.then : undefined;
  return spec?.sum ? [spec.sum] : [];
}

/** Can the task's model show its target? (docs/15 §4.10 rule 6) */
function targetIssues(task: Task): string[] {
  const out: string[] = [];
  const m = task.model;
  const parts = baseParts(task);
  const wholes = m.kind === 'bar' ? (m.wholes ?? 1) : 1;
  if (task.kind === 'shade') {
    const t = toImproper(task.target);
    const count = (t.n * parts) / t.d;
    if (!Number.isInteger(count) || count > parts * wholes) out.push(`target ${t.n}/${t.d} cannot be shaded on ${parts} parts × ${wholes} whole(s)`);
    if (task.accept === 'exact' && parts !== task.target.d) out.push(`accept "exact" needs the model's parts (${parts}) to be the target's denominator (${task.target.d})`);
  }
  if (task.kind === 'place' && m.kind === 'numberline') {
    const pos = valueOnLine(task.target, m);
    if (compare(task.target, { n: m.from, d: 1 }) < 0 || compare(task.target, { n: m.to, d: 1 }) > 0) out.push('place target is off the line');
    else if (task.snap === 'ticks' && pos === null) out.push('place target is not on a tick (snap: ticks)');
  }
  if (task.kind === 'split' || task.kind === 'merge') {
    const ok = task.factors.some((k) => (task.kind === 'split' ? parts * k : parts / k) === task.target.d);
    if (!ok) out.push(`no factor turns ${parts} parts into ${task.target.d}`);
    if (task.kind === 'merge' && gcd(task.target.n, task.target.d) !== 1) out.push('merge target must be in simplest form');
  }
  if (task.kind === 'fold') {
    const ratio = task.parts / Math.max(1, parts);
    if (!Number.isInteger(Math.log2(ratio)) || ratio < 2) out.push(`folding ${parts} part(s) never makes ${task.parts}`);
  }
  if (task.kind === 'cut' && task.snap === 12 && 12 % task.parts !== 0) out.push(`${task.parts} parts do not fit the 12-mark grid (use snap: 24)`);
  if (task.kind === 'compare' && m.kind === 'wall' && ![task.a.d, task.b.d].every((d) => m.rows.includes(d))) out.push('the wall needs a row for each denominator compared');
  return out;
}

/** Planned feedback (rule 7). */
function feedbackIssues(task: Task): string[] {
  const out: string[] = [];
  const codes = task.feedback.wrong.map((w) => w.when);
  const dup = codes.find((c, i) => codes.indexOf(c) !== i);
  if (dup) out.push(`feedback.wrong has "${dup}" twice`);
  if (task.kind === 'choose') {
    if (!task.multi && task.options.filter((o) => o.correct).length !== 1) out.push('a single-choice task needs exactly one correct option');
    if (task.options.every((o) => !o.correct)) out.push('no option is correct');
    for (const o of task.options) {
      // A grid choice may offer a wrong option no catalogued misconception explains (m² for a stamp): its feedback is the fallback.
      if (!o.correct && !o.misconception && task.model.kind !== 'grid') out.push(`option "${o.id}" is wrong but names no misconception`);
      if (o.misconception && !codes.includes(o.misconception)) out.push(`option "${o.id}" shows "${o.misconception}" but feedback.wrong has no line for it`);
      if (!o.value && !o.model && !o.text) out.push(`option "${o.id}" needs a value, a model or a text`);
    }
  }
  return out;
}

/** Can the beat's model be drawn as written? (parts in range, marks on ticks, lit rows present) */
function beatIssues(beat: Beat): string[] {
  const out: string[] = [];
  const m = beat.model;
  const count = (set: number | number[] | undefined) => (set === undefined ? [] : Array.isArray(set) ? set : Array.from({ length: set }, (_, i) => i));
  if (m.kind === 'bar' || m.kind === 'circle') {
    const parts = m.kind === 'bar' ? (m.cuts ? m.cuts.length + 1 : m.diagonal ? 2 : (m.parts ?? 0)) : m.parts;
    const total = parts * (m.kind === 'bar' ? (m.wholes ?? 1) : 1);
    for (const [name, set] of [['given', m.given], ['shaded', m.shaded], ['crossed', beat.crossed]] as const) {
      const idx = count(set);
      if (idx.some((i) => i >= total)) out.push(`${name} marks a part past the ${total} parts`);
    }
    const given = count(m.given);
    if (count(beat.crossed).some((i) => !given.includes(i))) out.push('crossed parts must be given parts');
    if (m.kind === 'bar' && m.rows && beat.crossed) out.push('crossed is for a single bar');
  } else if (beat.crossed) out.push('crossed is for a bar or a circle');
  if (m.kind === 'numberline') {
    for (const f of [...(m.marks ?? []), ...(m.arrow ? [m.arrow] : [])]) {
      if (compare(f, { n: m.from, d: 1 }) < 0 || compare(f, { n: m.to, d: 1 }) > 0) out.push(`${f.n}/${f.d} is off the line`);
      else if (valueOnLine(f, m) === null) out.push(`${f.n}/${f.d} is not on a tick of a line cut in ${m.intervals}`);
    }
  }
  if (beat.highlight && m.kind !== 'grid') {
    if (m.kind === 'wall') {
      for (const f of beat.highlight) if (!m.rows.includes(toImproper(f).d)) out.push(`the wall has no row of ${toImproper(f).d}ths for ${f.n}/${f.d}`);
    } else out.push('highlight is for the fraction wall');
  }
  if (m.kind === 'grid') {
    out.push(...gridModelIssues(m));
    if (m.figures.length === 0) out.push('a grid beat needs a figure');
    if (beat.highlight || beat.overlay) out.push('highlight and overlay are for fraction models');
  }
  if (beat.overlay?.equivalent && m.kind !== 'bar' && !(m.kind === 'barmodel' && m.units)) out.push('overlay.equivalent needs a bar (or a model drawing with units)');
  if (beat.overlay?.numberline && m.kind !== 'bar') out.push('overlay.numberline needs a bar');
  return out;
}

/* ------------------------------------------------------------------ */
/* Square grid (docs/21 §3.4)                                          */
/* ------------------------------------------------------------------ */

/** Largest grid a child works on (docs/21 §3.1: 12 × 10 interactive, 24 × 16 shown). */
export const GRID_INTERACTIVE: [number, number] = [12, 10];
export const GRID_SHOWN: [number, number] = [24, 16];

/** Can a grid model be drawn as written? */
export function gridModelIssues(m: GridModelSpec): string[] {
  const out: string[] = [];
  const ids = m.figures.map((f) => f.id);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) out.push(`figure id "${dup}" is used twice`);
  const known = new Set(ids);
  for (const f of m.figures) {
    if (f.poly) for (const p of polyIssues(f.poly)) out.push(`figure "${f.id}": ${p}`);
    if (f.halves && f.halves.length % 2 !== 0) out.push(`figure "${f.id}": half cells come in pairs (an area of whole squares)`);
    const facts = factsOf(f);
    if (facts.whole === 0 && facts.halfCount === 0) out.push(`figure "${f.id}" covers no cells`);
    for (const h of facts.halves) if (facts.cells.has(`${h.x},${h.y}`)) out.push(`figure "${f.id}": half cell ${h.x},${h.y} is also a whole cell`);
  }
  const ext = extentOf(m);
  if (m.show !== 'none' && (ext.w > GRID_SHOWN[0] || ext.h > GRID_SHOWN[1])) out.push(`the grid is ${ext.w} × ${ext.h} cells (shown ≤ ${GRID_SHOWN[0]} × ${GRID_SHOWN[1]}; draw it with show: none)`);
  if (m.show === 'none' && !m.notToScale) out.push('show: none needs notToScale: true ("Not drawn to scale")');
  for (const key of [...Object.keys(m.tiles ?? {}), ...Object.keys(m.walk ?? {}), ...(m.border ? [m.border] : [])]) if (!known.has(key)) out.push(`"${key}" is not a figure of this grid`);
  for (const d of m.dims ?? []) {
    if (d.figure && !known.has(d.figure)) out.push(`dimension on "${d.figure}": no such figure`);
    const e = dimEnds(m, d);
    if (!e) out.push('a dimension has no figure to measure');
    else if ((e.from[0] !== e.to[0] && e.from[1] !== e.to[1]) || e.length === 0) out.push(`dimension (${e.from}) → (${e.to}) is not across or up`);
  }
  if (m.walk) for (const [id, n] of Object.entries(m.walk)) {
    const f = m.figures.find((x) => x.id === id);
    if (f && typeof n === 'number' && n > factsOf(f).walk.length) out.push(`walk on "${id}": ${n} sides, the figure has ${factsOf(f).walk.length}`);
  }
  if (m.tiles) for (const [id, t] of Object.entries(m.tiles)) {
    const f = m.figures.find((x) => x.id === id);
    if (f && typeof t === 'number' && t > factsOf(f).whole) out.push(`tiles on "${id}": ${t} squares, the figure has ${factsOf(f).whole}`);
  }
  const main = figureOf(m);
  if (m.sides && (!main || !factsOf(main).rect)) out.push('sides: pairs is for a rectangle');
  for (const c of m.cuts ?? []) {
    const at = c.x ?? c.y ?? 0;
    const f = figureOf(m);
    const b = f ? factsOf(f).box : null;
    if (b && (c.x !== undefined ? at <= b.x || at >= b.x + b.w : at <= b.y || at >= b.y + b.h)) out.push(`cut ${c.x !== undefined ? 'x' : 'y'}=${at} does not cross the figure`);
  }
  return out;
}

const modelsOf = (task: Task): Model[] => [task.model, ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.model ? [o.model] : [])) : [])];

/** A grid task: its model, its written part against the figure, what it may diagnose, the step's number limits. */
function gridTaskIssues(task: Task, limits: StepLimits | undefined): string[] {
  const out: string[] = [];
  for (const m of modelsOf(task)) if (m.kind === 'grid') out.push(...gridModelIssues(m));
  const m = task.model;
  if ((GRID_KINDS as readonly string[]).includes(task.kind) && m.kind !== 'grid') return [...out, `a ${task.kind} task needs a grid model`];
  if (m.kind !== 'grid') return out;
  for (const c of task.feedback.wrong.map((w) => w.when)) if (!(MEASURE_CODES as readonly string[]).includes(c)) out.push(`"${c}" is a fractions code, not one for the grid`);
  const spec = inputSpecOf(task);
  const fig = figureOf(m, 'figure' in task ? task.figure : spec?.figure);
  const ext = extentOf(m);
  if (task.kind !== 'input' && task.kind !== 'choose') {
    if (m.show === 'none') out.push(`a ${task.kind} task needs the grid shown`);
    const max = limits?.gridMax ?? GRID_INTERACTIVE;
    if (ext.w > max[0] || ext.h > max[1]) out.push(`the grid is ${ext.w} × ${ext.h} cells (a child works on ≤ ${max[0]} × ${max[1]})`);
  }
  if ((task.kind === 'count-squares' || task.kind === 'trace-perimeter' || task.kind === 'split-figure' || spec?.ask) && !fig) out.push('there is no figure to measure');
  if (task.kind === 'trace-perimeter' && fig && factsOf(fig).halfCount) out.push('a figure with half cells has no perimeter in units');
  if (task.kind === 'count-squares' && task.cover === 'row-col' && fig && !factsOf(fig).rect) out.push('cover: row-col is for a rectangle');
  if (task.kind === 'draw-rectangle') {
    if (!drawnSolution(task)) out.push(`no rectangle on the ${m.cols ?? 12} × ${m.rows ?? 10} grid meets the task`);
    if ([task.area, task.perimeter, task.length, task.breadth].every((v) => v === undefined)) out.push('a draw-rectangle task needs an area, a perimeter or a side');
  }
  if (spec) {
    const answers = Array.isArray(spec.answer) ? spec.answer : [spec.answer];
    for (const a of answers) if (a.d !== 1 || a.w || a.n > WHOLE_MAX) out.push(`answer ${a.n}/${a.d} is not a whole number (0–${WHOLE_MAX})`);
    if (spec.form !== 'whole' && spec.form !== 'measure') out.push(`form "${spec.form}" is for fractions (use whole or measure)`);
    if (spec.form === 'measure' && !spec.unit) out.push('form measure needs the answer\'s unit');
    if (spec.sentence && (spec.sentence.match(/\?/g) ?? []).length !== answers.length) out.push('the sentence needs one ? per answer');
    const ctx = askOf(task, spec);
    if (task.kind === 'split-figure') {
      if (answers.length !== 3) out.push('a split-figure task writes three numbers: piece + piece = total');
      const cut = solve(task).find((a) => a.do === 'gridcut');
      const pieces = cut && cut.do === 'gridcut' ? cutPieces(task, cut.cut) : null;
      if (!pieces) out.push('no straight cut leaves two rectangles');
      else if (answers[0]?.n !== pieces[0] || answers[1]?.n !== pieces[1] || answers[2]?.n !== pieces[0] + pieces[1]) out.push(`the answer should be ${pieces[0]}, ${pieces[1]}, ${pieces[0] + pieces[1]} (the pieces of the first cut that works, then the total)`);
    } else if (ctx) {
      const want = gridAnswer(task);
      if (want === null) out.push(`the figure's ${ctx.ask} is not measured in whole units`);
      else if (answers.length === 1 && answers[0]!.n !== want) out.push(`the answer is ${answers[0]!.n}, the figure's ${ctx.ask} is ${want}`);
      const unit = ctx.ask === 'area' ? squared(m.unit) : m.unit;
      if (spec.unit && spec.unit !== unit) out.push(`the ${ctx.ask} is in ${unit}, not ${spec.unit} (no conversion between cm² and m²)`);
      if (spec.unit && isAreaUnit(spec.unit) !== (ctx.ask === 'area')) out.push(`unit ${spec.unit} does not fit an ${ctx.ask}`);
      if (fig && (ctx.ask === 'length' || ctx.ask === 'breadth' || ctx.ask === 'side')) {
        const across = labels(m, fig, 'across');
        const up = labels(m, fig, 'up');
        if ((ctx.ask === 'length' && across) || (ctx.ask === 'breadth' && up) || (ctx.ask === 'side' && (across || up))) out.push(`the model prints the ${ctx.ask} it asks for (mark that dimension unknown)`);
        if ((ctx.ask === 'length' || ctx.ask === 'breadth') && !ctx.given) out.push(`a missing ${ctx.ask} needs given: area or perimeter`);
        if (m.show !== 'none' && ctx.given) out.push('a missing side is found from the numbers: draw it with show: none');
      }
    } else if (task.kind === 'input') out.push('an input task on a grid needs ask (area, perimeter, length, breadth or side)');
  }
  /* the step's number limits (docs/19 G11) */
  if (limits) {
    for (const mm of modelsOf(task)) {
      if (mm.kind !== 'grid') continue;
      for (const f of mm.figures) {
        if (f.tone === 'ghost') continue;
        const facts = factsOf(f);
        if (limits.maxSide !== undefined && Math.max(facts.box.w, facts.box.h) > limits.maxSide) out.push(`figure "${f.id}" has a side of ${Math.max(facts.box.w, facts.box.h)} (limit ${limits.maxSide})`);
        if (limits.maxArea !== undefined && facts.area > limits.maxArea) out.push(`figure "${f.id}" has an area of ${facts.area} (limit ${limits.maxArea})`);
        if (limits.maxPerimeter !== undefined && facts.perimeter !== null && facts.perimeter > limits.maxPerimeter) out.push(`figure "${f.id}" has a perimeter of ${facts.perimeter} (limit ${limits.maxPerimeter})`);
        if (limits.sides && f.poly && (f.poly.length < limits.sides[0] || f.poly.length > limits.sides[1])) out.push(`figure "${f.id}" has ${f.poly.length} sides (${limits.sides[0]}–${limits.sides[1]})`);
      }
    }
    if (task.kind === 'count-squares' && limits.maxCells !== undefined && fig) {
      const n = factsOf(fig).whole + factsOf(fig).halfCount;
      if (n > limits.maxCells) out.push(`${n} squares to lay (limit ${limits.maxCells})`);
    }
    if (task.kind === 'draw-rectangle') {
      if (limits.maxSide !== undefined && [task.length, task.breadth].some((v) => v !== undefined && v > limits.maxSide!)) out.push(`a side over ${limits.maxSide}`);
      if (limits.maxArea !== undefined && task.area !== undefined && task.area > limits.maxArea) out.push(`area ${task.area} (limit ${limits.maxArea})`);
      const r = drawnSolution(task);
      if (r && limits.maxSide !== undefined && Math.max(...r) > limits.maxSide) out.push(`the rectangle drawn has a side of ${Math.max(...r)} (limit ${limits.maxSide})`);
    }
    if (spec && limits.maxPerimeter !== undefined && spec.ask === 'perimeter') for (const a of Array.isArray(spec.answer) ? spec.answer : [spec.answer]) if (a.n > limits.maxPerimeter) out.push(`perimeter ${a.n} (limit ${limits.maxPerimeter})`);
  }
  return out;
}

/** Every rule for one task (pool task or practice question), as messages. */
export function taskIssues(task: Task, where: string, opts: { bridge: boolean; practice: boolean; limits?: StepLimits }): LessonIssue[] {
  const issues: LessonIssue[] = [];
  const error = (message: string) => issues.push({ level: 'error', message: `${where}: ${message}` });
  const warn = (message: string) => issues.push({ level: 'warn', message: `${where}: ${message}` });
  const grid = task.model.kind === 'grid' || modelsOf(task).some((m) => m.kind === 'grid') || (GRID_KINDS as readonly string[]).includes(task.kind);
  if (grid) for (const m of gridTaskIssues(task, opts.limits)) error(m);
  else for (const c of task.feedback.wrong.map((w) => w.when)) if (!(FRACTION_CODES as readonly string[]).includes(c)) error(`"${c}" is a grid code, not one for fractions`);
  for (const f of grid ? [] : fractionsOf(task)) if (toImproper(f).d > 12 || f.d < 1) error(`denominator ${f.d} is out of range (1–12)`);
  if (!opts.bridge && !grid) {
    for (const f of fractionsOf(task)) {
      const x = toImproper(f);
      if (f.w || x.n > x.d) error(`${f.w ? `${f.w} ` : ''}${f.n}/${f.d} is more than one whole (mixed numbers are the P4 bridge)`);
    }
    for (const s of sumsOf(task)) {
      const r = s.op === '+' ? add(s.a, s.b) : sub(s.a, s.b);
      if (compare(r, { n: 0, d: 1 }) < 0 || compare(r, { n: 1, d: 1 }) > 0) error('the result is not within one whole');
      if (s.a.d !== s.b.d && !related(s.a, s.b)) error(`${s.a.n}/${s.a.d} and ${s.b.n}/${s.b.d} are not related fractions`);
    }
  }
  for (const m of targetIssues(task)) error(m);
  for (const m of feedbackIssues(task)) error(m);
  if (opts.practice && task.hints.length > 1) error('practice questions have at most one hint');
  if (textLength(task.prompt.en) > PROMPT_EN) warn(`prompt is ${textLength(task.prompt.en)} characters (EN ≤ ${PROMPT_EN})`);
  if (task.prompt.zh && textLength(task.prompt.zh) > PROMPT_ZH) warn(`prompt is ${textLength(task.prompt.zh)} characters (ZH ≤ ${PROMPT_ZH})`);
  for (const [path, text] of strings(task, 'task')) for (const bad of badTokens(text)) error(`${path}: "${bad}" is not a fraction token ({3/4}, {1 3/4}, {?/12})`);
  return issues;
}

/** Every string in a value, with its path. */
function strings(v: unknown, path: string, out: [string, string][] = []): [string, string][] {
  if (typeof v === 'string') out.push([path, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}.${i}`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) strings(x, path ? `${path}.${k}` : k, out);
  return out;
}

export function lessonIssues(data: MathSceneData, chapters: readonly ChapterInfo[]): LessonIssue[] {
  const issues: LessonIssue[] = [];
  const error = (message: string) => issues.push({ level: 'error', message });
  const warn = (message: string) => issues.push({ level: 'warn', message });
  const lesson: Lesson = data.lesson;
  const sources = new Set((data.sources?.sources ?? []).map((s) => s.id));
  const syllabus = new Set(lesson.syllabus.map((l) => l.id));
  const stepIds = new Set(lesson.steps.map((s) => s.id));

  /* 2. chapters ↔ steps */
  const practiceChapters = chapters.filter((c) => (c.state as MathChapterState | undefined)?.practice === true);
  for (const c of chapters) {
    if (c.kind === 'background' || practiceChapters.includes(c)) continue;
    if (!stepIds.has(c.id)) error(`chapter "${c.id}" has no step in lesson.json (chapter ids are step ids)`);
  }
  for (const s of lesson.steps) if (!chapters.some((c) => c.id === s.id)) error(`step "${s.id}" has no chapter (add chapters/<nn>-${s.id}.mdx)`);
  if (lesson.practice.length > 0) {
    if (practiceChapters.length !== 1) error(`the practice needs exactly one chapter with state.practice: true (found ${practiceChapters.length})`);
    else if (practiceChapters[0]!.order !== Math.max(...chapters.map((c) => c.order))) error('the practice chapter must come last');
  } else if (practiceChapters.length > 0) error('a chapter says practice: true but lesson.json has no practice questions');

  /* 4. syllabus and sources */
  for (const line of lesson.syllabus) if (!sources.has(line.source)) error(`syllabus "${line.id}": source ${line.source} is not in sources.json`);
  for (const s of lesson.steps) for (const lo of s.lo) if (!syllabus.has(lo)) error(`step "${s.id}": unknown syllabus line "${lo}"`);

  /* beats, pool, key facts */
  for (const s of lesson.steps) {
    if (s.beats.length < BEATS_MIN || s.beats.length > BEATS_MAX) error(`step "${s.id}": ${s.beats.length} beats (${BEATS_MIN}–${BEATS_MAX})`);
    s.beats.forEach((b, i) => {
      for (const m of beatIssues(b)) error(`step "${s.id}" / beat ${i + 1}: ${m}`);
      if (i === 0 && b.move) warn(`step "${s.id}" / beat 1: the first beat has no previous one to move from`);
      if (b.equation && b.words) error(`step "${s.id}" / beat ${i + 1}: write equation or words, not both`);
    });
    if (s.pool.length < POOL_MIN || s.pool.length > POOL_MAX) error(`step "${s.id}": the check pool has ${s.pool.length} tasks (${POOL_MIN}–${POOL_MAX})`);
    if (s.keyFacts && s.keyFacts.length < 2) error(`step "${s.id}": keyFacts has ${s.keyFacts.length} line (2–4)`);
  }

  /* 5–8 per task */
  const limitsOf = (id: string) => lesson.steps.find((s) => s.id === id)?.limits;
  const tasks: { where: string; task: Task; bridge: boolean; practice: boolean; limits?: StepLimits }[] = [
    ...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: `step "${s.id}" / ${task.id}`, task, bridge: !!s.bridge, practice: false, limits: s.limits }))),
    // A practice question keeps to the limits of every step it sends the child back to.
    ...lesson.practice.map((q) => ({ where: `practice / ${q.id}`, task: q.task, bridge: q.revisit.some((r) => !!lesson.steps.find((s) => s.id === r)?.bridge), practice: true, limits: limitsOf(q.revisit[0]!) })),
  ];
  const seen = new Set<string>();
  for (const { where, task, bridge, practice, limits } of tasks) {
    if (seen.has(task.id)) error(`${where}: task id "${task.id}" is used twice`);
    seen.add(task.id);
    issues.push(...taskIssues(task, where, { bridge, practice, limits }));
  }

  /* 9. practice */
  if (lesson.practice.length > 0) {
    if (lesson.practice.length < 6 || lesson.practice.length > 10) error(`practice has ${lesson.practice.length} questions (6–10)`);
    const kinds = new Set(lesson.practice.map((q) => q.task.kind));
    if (kinds.size < 5) error(`practice uses ${kinds.size} kinds of task (at least 5)`);
    for (const q of lesson.practice) {
      if (q.task.id !== q.id) error(`practice "${q.id}": task.id must equal the question id`);
      for (const r of q.revisit) if (!stepIds.has(r)) error(`practice "${q.id}": revisit "${r}" is not a step`);
    }
  }

  /* 10. tokens (tasks are covered above) */
  const untasked = { syllabus: lesson.syllabus, steps: lesson.steps.map((s) => ({ ...s, pool: [] })) };
  for (const [path, text] of strings(untasked, 'lesson')) for (const bad of badTokens(text)) error(`${path}: "${bad}" is not a fraction token ({3/4}, {1 3/4}, {?/12})`);
  for (const [path, text] of strings(data.glossary ?? {}, 'glossary')) for (const bad of badTokens(text)) error(`${path}: "${bad}" is not a fraction token`);
  return issues;
}
