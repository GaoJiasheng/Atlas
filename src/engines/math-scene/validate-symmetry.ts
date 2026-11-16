/**
 * MathScene content rules for line symmetry (docs/79 §3.1–3.3, §8): a grid
 * drawn for symmetry can be drawn as written (free shapes convex, every line
 * of symmetry drawn really is one of the figures it meets, a beat's fold
 * says whether the halves match and the geometry agrees, partners on the
 * paper); a completion has one line, up or across (D8), a given half wholly
 * on one side, partners on the paper within the step's limits; a choice's
 * claims (`symmetric`, `lines`) agree with folding; a line of symmetry to
 * draw has one up or across through grid corners and diagnoses only the two
 * codes a line can show; every code is a symmetry code. Build time only; shared with `scripts/math/check-pool.ts`.
 */
import { SYMMETRY_CODES, type GridModelSpec, type StepLimits, type Task } from './schema';
import { extentOf, parseCell, parseHalf } from './lib/grid';
import { axisOf, figurePieces, figuresOnLine, isConvex, isSymmetric, keyPieces, lineMatches, lineOf, linesOfSymmetry, partnerKey, sideOf, type Pt } from './lib/symmetry';
import { cellOpen, givenOf, planOf, pointOpen, segmentPieces, symSegmentSolution, taskLine } from './lib/symmetry-tasks';
import { gridModelIssues } from './validate';

/** Furthest a square or corner may be from the line (docs/79 §1.3: ≤ 5 squares). */
export const SYM_MAX_DISTANCE = 5;

/** Can a symmetry grid be drawn as written, and is what it shows true? */
export function symModelIssues(m: GridModelSpec, where: 'beat' | 'task' | 'completion'): string[] {
  const out: string[] = [];
  for (const f of m.figures) {
    if (f.shape && !isConvex(f.shape)) out.push(`figure "${f.id}": a free shape is convex (it is folded as one piece)`);
    if (f.path && new Set(f.path.map((p) => p.join(','))).size !== f.path.length) out.push(`figure "${f.id}": the path visits a point twice`);
  }
  const first = m.mirror?.[0];
  const ax = first ? axisOf(first) : null;
  if (m.pairs && !ax) out.push('pairs need a first mirror line up or across');
  // A line of symmetry drawn on a beat or a picture is one of the figures it meets (with the partners the beat shows).
  if (where !== 'completion')
    for (const line of m.mirror ?? []) {
      const figures = figuresOnLine(m, line);
      const pieces = figures.flatMap(figurePieces);
      if (m.pairs?.cells && ax && line === first) pieces.push(...keyPieces(m.pairs.cells.map(([x, y]) => partnerKey(`${x},${y}`, ax))));
      if (pieces.length > 0 && !isSymmetric(pieces, lineOf(line))) out.push(`mirror ${JSON.stringify(line)} is not a line of symmetry of the figures it meets`);
    }
  if (m.fold) {
    const matches = lineMatches(m, m.fold.line);
    if (where === 'beat' && m.fold.t === 1 && m.fold.match === undefined) out.push('a beat folded flat says whether the halves match (fold.match)');
    if (m.fold.match !== undefined && m.fold.match !== matches) out.push(`fold.match says ${m.fold.match}, but folding along ${JSON.stringify(m.fold.line)} the halves ${matches ? 'match' : 'do not match'}`);
  }
  if (m.pairs && ax) {
    const ext = extentOf(m);
    for (const [x, y] of m.pairs.cells ?? []) {
      const [px, py] = parseCell(partnerKey(`${x},${y}`, ax));
      if (px < 0 || py < 0 || px >= ext.w || py >= ext.h) out.push(`the partner of square ${x},${y} is off the paper`);
    }
    for (const p of m.pairs.points ?? []) {
      const q = ax.axis === 'x' ? 2 * ax.at - p[0] : 2 * ax.at - p[1];
      if (q < 0 || q > (ax.axis === 'x' ? ext.w : ext.h)) out.push(`the partner of point ${p.join(',')} is off the paper`);
    }
  }
  return out;
}

/** The truth a choice option's claim is checked against: its own picture, else the stage's figure (about the line, or any line). */
function optionTruth(task: Task, o: Extract<Task, { kind: 'choose' }>['options'][number]): { symmetric: boolean; lines: number } | null {
  const m = o.model ?? task.model;
  if (m.kind !== 'grid') return null;
  const line = m.candidates?.[0] ?? m.mirror?.[0];
  const pieces = m.figures.filter((f) => f.tone !== 'ghost').flatMap(figurePieces);
  return { symmetric: line ? lineMatches(m, line) : linesOfSymmetry(pieces).length > 0, lines: linesOfSymmetry(pieces).length };
}

/** A symmetry task: its models, its claims, its completion, its codes, the step's limits. */
export function symTaskIssues(task: Task, limits: StepLimits | undefined): string[] {
  const out: string[] = [];
  const completion = task.kind === 'complete-symmetric';
  const models = [task.model, ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.model ? [o.model] : [])) : [])];
  for (const m of models) {
    if (m.kind !== 'grid') continue;
    out.push(...gridModelIssues(m), ...symModelIssues(m, completion && m === task.model ? 'completion' : 'task'));
  }
  for (const c of [...task.feedback.wrong.map((w) => w.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])])
    if (!(SYMMETRY_CODES as readonly string[]).includes(c)) out.push(`"${c}" is not a symmetry code`);
  if (task.kind === 'choose') {
    for (const o of task.options) {
      if (o.symmetric === undefined && o.lines === undefined) continue;
      const truth = optionTruth(task, o);
      if (!truth) {
        out.push(`option "${o.id}" makes a claim about symmetry, but there is no grid to check it on`);
        continue;
      }
      const holds = (o.symmetric === undefined || o.symmetric === truth.symmetric) && (o.lines === undefined || o.lines === truth.lines);
      if (holds !== o.correct) out.push(`option "${o.id}" is marked ${o.correct ? 'right' : 'wrong'}, but the figure ${o.lines !== undefined ? `has ${truth.lines} line(s) of symmetry` : truth.symmetric ? 'is symmetric about the line' : 'is not symmetric about the line'}`);
    }
  }
  if (task.kind === 'draw-segment') {
    if (task.model.kind !== 'grid') return out;
    if (task.relation !== 'symmetry') out.push('a line drawn on a symmetry grid is a line of symmetry (relation "symmetry")');
    if (task.model.show === 'none') out.push('a line of symmetry is drawn between grid corners: the grid is shown');
    const sol = symSegmentSolution(task);
    if (!sol) out.push('the figures have no line of symmetry up or across through grid corners to draw');
    const pieces = segmentPieces(task);
    if (task.from) {
      const ext = extentOf(task.model);
      if (task.from[0] > ext.w || task.from[1] > ext.h) out.push('the starting corner is off the paper');
      if (!linesOfSymmetry(pieces).some((l) => Math.abs(sideOf(l, task.from as Pt)) < 1e-9)) out.push('the starting corner is on no line of symmetry');
    }
    for (const w of task.feedback.wrong) if (!(['upright-line-only', 'equal-halves'] as string[]).includes(w.when)) out.push(`a line drawn diagnoses upright-line-only or equal-halves, not "${w.when}"`);
    return out;
  }
  if (!completion) return out;
  const m = task.model;
  if (m.kind !== 'grid') return [...out, 'a complete-symmetric task needs a grid model'];
  if (m.show === 'none') out.push('a completion needs the grid shown');
  if ((m.mirror?.length ?? 0) !== 1) out.push('a completion has exactly one mirror line');
  const line = taskLine(task);
  if (line && !axisOf(line)) out.push('a completion\'s line is up or across (docs/79 D8)');
  if (m.fold) out.push('a completion is folded by the child ("Fold it"), not by the model');
  const f = givenOf(task);
  if (!f) return [...out, 'there is no given half'];
  if (task.mode === 'outline' && !f.path) out.push('an outline completion gives its half as a path');
  if (task.mode === 'cells' && (f.path || f.shape)) out.push('a cells completion gives its half as squares and half squares');
  const plan = planOf(task);
  if (!plan) return [...out, 'the completion cannot be worked out'];
  const max = limits?.gridMax ?? [12, 10];
  if (plan.cols > max[0] || plan.rows > max[1]) out.push(`the paper is ${plan.cols} × ${plan.rows} (a child works on ≤ ${max[0]} × ${max[1]})`);
  const l = lineOf(line!);
  if (plan.mode === 'outline') {
    const path = f.path!;
    const onLine = (p: Pt) => Math.abs(sideOf(l, p)) < 1e-9;
    if (!onLine(path[0]!) || !onLine(path.at(-1)!)) out.push('the given path starts and ends on the line');
    const inner = path.slice(1, -1);
    if (inner.some(onLine)) out.push('only the ends of the given path are on the line');
    if (new Set(inner.map((p) => Math.sign(sideOf(l, p)))).size > 1) out.push('the given path stays on one side of the line');
    for (const k of plan.right) {
      const [x, y] = k.split(',').map(Number) as [number, number];
      if (!pointOpen(plan, x, y)) out.push(`the partner ${k} is off the paper`);
    }
    if (plan.right.length < 3 || plan.right.length > 7) out.push(`${plan.right.length} corners to find (3–7)`);
    for (const [x, y] of inner) if (Math.abs((plan.ax.axis === 'x' ? x : y) - plan.ax.at) > SYM_MAX_DISTANCE) out.push(`corner ${x},${y} is more than ${SYM_MAX_DISTANCE} squares from the line`);
  } else {
    for (const k of plan.right) {
      const h = parseHalf(k);
      const [x, y] = h ? [h.x, h.y] : parseCell(k);
      if (!cellOpen(plan, x, y)) out.push(`the partner ${k} is off the paper or on the line`);
    }
    // The given half lies on one side (a square across the line is its own partner and stays).
    const sides = new Set(plan.given.map((k) => {
      const h = parseHalf(k);
      const [x, y] = h ? [h.x, h.y] : parseCell(k);
      const lo = plan.ax.axis === 'x' ? x : y;
      return lo + 1 <= plan.ax.at ? -1 : lo >= plan.ax.at ? 1 : 0;
    }));
    sides.delete(0);
    if (sides.size > 1) out.push('the given half lies on both sides of the line');
    const halves = plan.right.filter((k) => parseHalf(k)).length;
    if (plan.right.length < 2 || plan.right.length > 8) out.push(`${plan.right.length} squares to put down (2–8)`);
    if (halves > 4) out.push(`${halves} half squares (≤ 4)`);
    for (const k of plan.given) {
      const h = parseHalf(k);
      const [x, y] = h ? [h.x, h.y] : parseCell(k);
      const v = plan.ax.axis === 'x' ? x : y;
      const d = v + 1 <= plan.ax.at ? plan.ax.at - (v + 1) : v >= plan.ax.at ? v - plan.ax.at : 0;
      if (d > SYM_MAX_DISTANCE - 1) out.push(`square ${k} is more than ${SYM_MAX_DISTANCE} squares from the line`);
    }
  }
  return out;
}
