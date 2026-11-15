/**
 * The angle rules (docs/76 §3.1–3.4), shared by `pnpm validate` and
 * `check-pool`: a drawing can be drawn as written (arcs turn forwards and at
 * most a full turn, a right-angle square really is 90°, a shape's marks fit
 * its corners, dots on the paper); a drawing not to scale is drawn at least
 * 12° off somewhere (D8); a step without degrees shows none (01–04); a size
 * measured, drawn or worked out is the one the drawing or the facts give;
 * every planned code can be diagnosed in that task; the step's limits (range,
 * distance from a right angle).
 */
import type { AngleModelSpec, AngleSpec, Beat, StepLimits, Task } from './schema';
import { angleItems, arcSpan, armsOf, between, corners, layings, onLine, onPaper, twoArmSize, type P2 } from './lib/angle';
import { angleContext, angleSpecOf, inputTolerance, measuredSize, segmentSolution } from './lib/angle-tasks';
import { ruleAnswer } from './lib/diagnose/angles';
import { inputSpecOf } from './lib/state';
import { answerValues } from './lib/forms';
import { isFracValue } from './lib/value';

/** A drawing not to scale is this far off somewhere (docs/76 D8). */
export const OFF_SCALE = 12;
/** Codes only a `choose` option can show. */
const CHOOSE_ONLY = new Set(['arm-length', 'right-angle-upright', 'vertex-not-middle']);

const kindOfSize = (v: number) => (Math.abs(v - 90) < 0.5 ? 'right' : Math.abs(v - 180) < 0.5 ? 'straight' : v < 90 ? 'acute' : v < 180 ? 'obtuse' : 'reflex');

/**
 * A drawing not to scale may draw sizes off, never out of order (docs/76, Gavin 2026-11-16): a bigger angle stays
 * drawn bigger, equal ones are drawn about equal, and each keeps its kind (acute, right, obtuse, straight, reflex).
 */
export function orderIssues(sizes: readonly { value: number; span: number; name: string }[]): string[] {
  const out: string[] = [];
  for (const a of sizes) if (kindOfSize(a.value) !== kindOfSize(a.span)) out.push(`${a.name} is ${a.value}° (${kindOfSize(a.value)}) but drawn ${Math.round(a.span)}° (${kindOfSize(a.span)})`);
  sizes.forEach((a, i) =>
    sizes.slice(i + 1).forEach((b) => {
      if (a.value === b.value) {
        if (Math.abs(a.span - b.span) > 5) out.push(`${a.name} and ${b.name} are equal but drawn ${Math.round(a.span)}° and ${Math.round(b.span)}°`);
      } else if (Math.sign(a.value - b.value) !== Math.sign(a.span - b.span)) out.push(`${a.name} (${a.value}°) and ${b.name} (${b.value}°) are drawn the other way round (${Math.round(a.span)}°, ${Math.round(b.span)}°)`);
    }),
  );
  return out;
}

const arcName = (a: { from: number; to: number; label?: string }) => `the angle ${a.label ?? ''} ${a.from}→${a.to}`.replace('  ', ' ');

function specIssues(s: AngleSpec, limits?: StepLimits): string[] {
  const out: string[] = [];
  const arms = armsOf(s);
  for (const a of s.arcs ?? []) {
    const span = arcSpan(a);
    if (span <= 0 || span > 360) out.push(`arc ${a.from}→${a.to} must turn forwards, at most a full turn`);
    if (a.value !== undefined && !s.notToScale && Math.abs(a.value - span) > 0.5) out.push(`arc ${a.from}→${a.to} says ${a.value}° but is drawn ${span}° (only a drawing not to scale may differ)`);
    if (arms.length && ![a.from, a.to].every((d) => arms.some((x) => between(x, d) < 0.01))) out.push(`arc ${a.from}→${a.to} does not run between two arms`);
  }
  for (const [a, b] of s.square ?? []) {
    if (Math.abs(between(a, b) - 90) > 0.01) out.push(`the right-angle square ${a}–${b} is not 90°`);
    if (arms.length && ![a, b].every((d) => arms.some((x) => between(x, d) < 0.01))) out.push(`the right-angle square ${a}–${b} does not sit between two arms`);
  }
  if (s.notToScale) {
    out.push(...orderIssues((s.arcs ?? []).filter((a) => a.value !== undefined).map((a) => ({ value: a.value!, span: arcSpan(a), name: arcName(a) }))));
    const off = (s.arcs ?? []).some((a) => a.value !== undefined && Math.abs(a.value - arcSpan(a)) >= OFF_SCALE);
    if (!off) out.push(`a drawing not to scale must be drawn at least ${OFF_SCALE}° off somewhere (give an arc a value ${OFF_SCALE}° or more from how it is drawn)`);
  }
  if (s.polygon) {
    const cs = corners(s.polygon.points as P2[]);
    const marks = s.polygon.marks ?? [];
    if (marks.length && marks.length !== cs.length) out.push(`the shape has ${cs.length} corners but ${marks.length} marks`);
    marks.forEach((m, i) => {
      const size = cs[i]?.size ?? 0;
      if (m === 'right' && Math.abs(size - 90) > 0.5) out.push(`corner ${i + 1} is marked right but is ${size.toFixed(1)}°`);
      if (m === 'smaller' && size >= 89.5) out.push(`corner ${i + 1} is marked smaller than a right angle but is ${size.toFixed(1)}°`);
      if (m === 'greater' && size <= 90.5) out.push(`corner ${i + 1} is marked greater than a right angle but is ${size.toFixed(1)}°`);
    });
    if (cs.some((c) => c.size >= 180)) out.push('the shape has a corner of 180° or more (it must be convex)');
  }
  if (s.paper) {
    const p = s.paper;
    for (const seg of p.segments) if (!onPaper(seg.from as P2, p) || !onPaper(seg.to as P2, p)) out.push('a segment runs off the paper');
    for (const q of p.points ?? []) if (!onPaper(q.at as P2, p)) out.push(`point ${q.label} is off the paper`);
    for (const g of p.gaps ?? []) if (!onPaper(g.from as P2, p) || !onPaper(g.to as P2, p)) out.push(`the gap "${g.label}" runs off the paper`);
    for (const c of p.corners ?? []) if (c.a[0] * c.b[0] + c.a[1] * c.b[1] !== 0) out.push('a right-angle mark on the paper is not between perpendicular steps');
  }
  if (limits?.degrees === false) {
    if (s.protractor || s.ring) out.push('this step has no degrees: no protractor, no ring of degrees');
    if ((s.arcs ?? []).some((a) => a.deg)) out.push('this step has no degrees: no arc writes its size');
  }
  return out;
}

/** What is wrong with an angle model (a beat's, a task's, an option's). */
export function angleModelIssues(m: AngleModelSpec, limits?: StepLimits): string[] {
  const items = angleItems(m);
  return items.flatMap((s, i) => specIssues(s, limits).map((x) => (items.length > 1 ? `drawing ${i + 1}: ${x}` : x)));
}

/** A beat on an angle: its drawing, and no degrees where the step has none. */
export function angleBeatIssues(beat: Beat, limits?: StepLimits): string[] {
  const out: string[] = [];
  if (beat.model.kind !== 'angle') return out;
  out.push(...angleModelIssues(beat.model, limits));
  if (beat.under) out.push('an angle beat has no model under it (side by side: pair or set)');
  // The explanation is drawn to scale (exact degrees); "not drawn to scale" is for checks that look like exam figures.
  if (angleItems(beat.model).some((x) => x.notToScale)) out.push('an explanation beat is drawn to scale (no notToScale)');
  if (limits?.degrees === false) {
    const texts = [beat.caption.en, beat.caption.zh, beat.equation ?? '', beat.words?.en ?? '', beat.words?.zh ?? ''];
    if (texts.some((x) => x.includes('°'))) out.push('this step has no degrees: no ° in the caption or the number sentence');
  }
  return out;
}

/** The letter the written sentence asks for (`∠a = ?°` asks for a). */
const sentenceNames = (sentence: string | undefined, letter: string) => !!sentence && new RegExp(`∠${letter}\\b`).test(sentence);

const within = (v: number, r?: [number, number]) => !r || (v >= r[0] && v <= r[1]);

/** Every angle rule for one task. */
export function angleTaskIssues(task: Task, limits?: StepLimits): string[] {
  const out: string[] = [];
  const spec = angleSpecOf(task);
  for (const m of [task.model, ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.model ? [o.model] : [])) : [])]) if (m.kind === 'angle') out.push(...angleModelIssues(m, limits));
  const codes = new Set([...task.feedback.wrong.map((w) => w.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])]);
  if (task.kind !== 'choose') for (const c of codes) if (CHOOSE_ONLY.has(c)) out.push(`"${c}" is diagnosed by choose options only`);
  const away = (v: number) => limits?.awayFromRight !== undefined && Math.abs(v - 90) < limits.awayFromRight;

  if (task.kind === 'measure-angle') {
    const size = measuredSize(task);
    if ((spec?.rays?.length ?? 0) !== 2) out.push('measure-angle draws exactly two rays');
    else if (size === null || Math.abs(size - task.answer) > 0.5) out.push(`the answer ${task.answer}° is not the angle drawn (${size?.toFixed(1)}°)`);
    if (!task.place && !spec?.protractor) out.push('a protractor already in place must be drawn (model.protractor)');
    if (task.place && spec?.protractor) out.push('the child lays the protractor: the model draws none');
    if (!within(task.answer, limits?.range)) out.push(`${task.answer}° is outside the step's range`);
    if (away(task.answer)) out.push(`${task.answer}° is too near a right angle (at least ${limits?.awayFromRight}° away)`);
  }
  if (task.kind === 'draw-angle') {
    if ((spec?.rays?.length ?? 0) !== 1) out.push('draw-angle draws exactly one ray (the first arm)');
    if (spec?.protractor) out.push('draw-angle lays its own protractor (task.protractor), the model draws none');
    if (!within(task.target, limits?.range)) out.push(`${task.target}° is outside the step's range`);
    if (away(task.target)) out.push(`${task.target}° is too near a right angle (at least ${limits?.awayFromRight}° away)`);
  }
  if (task.kind === 'draw-segment') {
    const paper = spec?.paper;
    const given = paper?.segments[task.to];
    if (!paper || !given) out.push('draw-segment needs dot paper with the segment it names');
    else {
      if (task.from && !onPaper(task.from as P2, paper)) out.push('the starting dot is off the paper');
      if (task.from && task.relation === 'parallel' && onLine(task.from as P2, given.from as P2, given.to as P2)) out.push('the starting dot lies on the given line');
      if (!segmentSolution(task)) out.push('no line on this paper answers it');
    }
  }
  const input = task.kind === 'input' ? inputSpecOf(task) : null;
  if (input) {
    const a = answerValues(input)[0];
    const t = a && isFracValue(a) && a.d === 1 ? a.n : null;
    if (input.form !== 'whole') out.push('a size of an angle is written as a whole number (form: whole)');
    const rule = input.angle?.rule;
    if (!rule) out.push('an input on an angle says how the size is found (angle.rule)');
    if (t !== null && rule && rule !== 'count' && rule !== 'read') {
      const r = ruleAnswer({ rule, known: input.angle?.known ?? [], rights: input.angle?.rights ?? 0, equal: input.angle?.equal ?? 1 });
      if (r === null || Math.abs(r - t) > 1e-9) out.push(`the answer ${t}° does not follow from the angles known (${r ?? '—'}°)`);
    }
    if (t !== null && rule === 'read') {
      const size = spec ? twoArmSize(spec) : null;
      if (!spec?.protractor) out.push('a reading needs a protractor drawn');
      if (size === null || Math.abs(size - t) > 0.5) out.push(`the answer ${t}° is not the angle drawn (${size?.toFixed(1)}°)`);
    }
    if (t !== null && spec?.notToScale) {
      // The unknown, at its true size, keeps the order and the kinds of the drawing too.
      const unknown = (spec.arcs ?? []).find((a) => a.label === '?') ?? (spec.arcs ?? []).find((a) => a.label && /^[a-z]$/.test(a.label) && sentenceNames(input.sentence, a.label));
      const sizes = (spec.arcs ?? []).flatMap((a) => (a.value !== undefined ? [{ value: a.value, span: arcSpan(a), name: arcName(a) }] : a === unknown ? [{ value: t, span: arcSpan(a), name: arcName(a) }] : []));
      if (unknown && unknown.value === undefined) out.push(...orderIssues(sizes));
      const ctx = angleContext(task, input);
      if (ctx.drawn !== null && Math.abs(ctx.drawn - t) < OFF_SCALE) out.push(`the unknown is drawn at ${ctx.drawn}°, too near its size ${t}° (at least ${OFF_SCALE}° off)`);
    }
    if (t !== null && rule !== 'count') {
      if (!within(t, limits?.range)) out.push(`${t}° is outside the step's range`);
      for (const k of input.angle?.known ?? []) if (!within(k, limits?.range)) out.push(`the known ${k}° is outside the step's range`);
    }
    const ctx = angleContext(task, input);
    for (const c of codes) {
      if (c === 'measured-not-calculated' && ctx.drawn === null) out.push('measured-not-calculated needs a drawing not to scale with the unknown marked');
      if (c === 'read-end-mark' && !(ctx.rule === 'read' && ctx.offset)) out.push('read-end-mark needs a reading with the first arm off 0');
      if (c === 'angle-sum-swap' && rule !== 'straight' && rule !== 'point') out.push('angle-sum-swap is for angles on a straight line or at a point');
      if (c === 'right-mark-missed' && !ctx.rights) out.push('right-mark-missed needs a right-angle mark among the angles known (angle.rights)');
      if (c === 'opposite-adjacent' && rule !== 'opposite' && rule !== 'adjacent') out.push('opposite-adjacent is for angles at a crossing');
      if (c === 'wrong-scale' && rule !== 'read') out.push('wrong-scale is for a protractor reading');
      if (c === 'looks-parallel') out.push('looks-parallel is for a choice or a line drawn on dot paper');
    }
    if (t !== null && inputTolerance(task, input) > 0 && t + 1 > 180) out.push('a reading is under 180°');
  }
  if (task.kind === 'measure-angle' || task.kind === 'draw-angle') for (const c of codes) if (c !== 'wrong-scale') out.push(`${task.kind} diagnoses wrong-scale only (not ${c})`);
  if (task.kind === 'draw-segment') for (const c of codes) if (c !== 'looks-parallel' || task.relation !== 'parallel') out.push(`a line drawn ${task.relation} diagnoses ${task.relation === 'parallel' ? 'looks-parallel only' : 'nothing (its feedback is the fallback)'}`);
  if (limits?.degrees === false && JSON.stringify([task.prompt, task.guide, task.hints, task.feedback, task.kind === 'choose' ? task.options.map((o) => o.text ?? null) : []]).includes('°')) out.push('this step has no degrees: no ° in the task');
  if (task.kind === 'measure-angle' && spec?.rays?.length === 2 && !layings(spec.rays[0]!.dir, spec.rays[1]!.dir).length) out.push('the protractor cannot be laid on this angle');
  return out;
}
