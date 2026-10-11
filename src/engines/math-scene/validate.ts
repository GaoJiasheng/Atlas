/**
 * MathScene content rules beyond the schema (docs/15 §4.10, §10), run by
 * `pnpm validate` through `schemas.ts`: chapters and steps one-to-one, the
 * practice chapter, 3–5 explanation beats per step whose models can be drawn,
 * a check pool of 8–10 tasks per step, syllabus and source references,
 * denominators and sums, targets a model can show, planned feedback, prompt
 * length, practice shape and the `{a/b}` tokens in every text. Build time only.
 * `taskIssues` is shared with `scripts/math/check-pool.ts` (authoring drafts).
 */
import type { Beat, Lesson, MathChapterState, MathSceneData, Task } from './schema';
import { add, compare, gcd, related, sub, toImproper, valueOnLine, type Frac } from './lib/fraction';
import { baseParts } from './lib/state';
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
      if (!o.correct && !o.misconception) out.push(`option "${o.id}" is wrong but names no misconception`);
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
  if (beat.highlight) {
    if (m.kind === 'wall') {
      for (const f of beat.highlight) if (!m.rows.includes(toImproper(f).d)) out.push(`the wall has no row of ${toImproper(f).d}ths for ${f.n}/${f.d}`);
    } else out.push('highlight is for the fraction wall');
  }
  if (beat.overlay?.equivalent && m.kind !== 'bar' && !(m.kind === 'barmodel' && m.units)) out.push('overlay.equivalent needs a bar (or a model drawing with units)');
  if (beat.overlay?.numberline && m.kind !== 'bar') out.push('overlay.numberline needs a bar');
  return out;
}

/** Every rule for one task (pool task or practice question), as messages. */
export function taskIssues(task: Task, where: string, opts: { bridge: boolean; practice: boolean }): LessonIssue[] {
  const issues: LessonIssue[] = [];
  const error = (message: string) => issues.push({ level: 'error', message: `${where}: ${message}` });
  const warn = (message: string) => issues.push({ level: 'warn', message: `${where}: ${message}` });
  for (const f of fractionsOf(task)) if (toImproper(f).d > 12 || f.d < 1) error(`denominator ${f.d} is out of range (1–12)`);
  if (!opts.bridge) {
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
    });
    if (s.pool.length < POOL_MIN || s.pool.length > POOL_MAX) error(`step "${s.id}": the check pool has ${s.pool.length} tasks (${POOL_MIN}–${POOL_MAX})`);
    if (s.keyFacts && s.keyFacts.length < 2) error(`step "${s.id}": keyFacts has ${s.keyFacts.length} line (2–4)`);
  }

  /* 5–8 per task */
  const tasks: { where: string; task: Task; bridge: boolean; practice: boolean }[] = [
    ...lesson.steps.flatMap((s) => s.pool.map((task) => ({ where: `step "${s.id}" / ${task.id}`, task, bridge: !!s.bridge, practice: false }))),
    ...lesson.practice.map((q) => ({ where: `practice / ${q.id}`, task: q.task, bridge: false, practice: true })),
  ];
  const seen = new Set<string>();
  for (const { where, task, bridge, practice } of tasks) {
    if (seen.has(task.id)) error(`${where}: task id "${task.id}" is used twice`);
    seen.add(task.id);
    issues.push(...taskIssues(task, where, { bridge, practice }));
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
