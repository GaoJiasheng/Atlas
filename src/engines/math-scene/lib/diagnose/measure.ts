/**
 * Diagnosis in the measurement domain (docs/21 §2.1, §3.3): area and
 * perimeter on the square grid. Every rule is a pure test of one wrong answer
 * against the figure's geometry (`lib/grid.ts`): what the child wrote, or
 * drew, matches the number a known misconception produces. As everywhere in
 * the lesson, only the codes a task declares are looked for, in the order it
 * declares them; anything else is `null` and gets the task's fallback.
 */
import type { GridFigure, GridModelSpec, InputSpec, MisconceptionCode, Task, TaskOf } from '../../schema';
import { cornerOverlap, factsOf, figureOf, labelledSum, type Facts } from '../grid';
import { isAreaUnit, type Unit } from '../value';

export type Ask = NonNullable<InputSpec['ask']>;

/** What a written number on a grid task is about. */
export interface AskContext {
  ask: Ask;
  model: GridModelSpec;
  figure: GridFigure;
  facts: Facts;
  given: InputSpec['given'];
}

/** The figure's own value for an ask (`null`: not measurable, e.g. the perimeter of a shape with half cells). */
export function measured(ctx: Pick<AskContext, 'ask' | 'facts'>): number | null {
  const f = ctx.facts;
  switch (ctx.ask) {
    case 'area':
      return f.area;
    case 'perimeter':
      return f.perimeter;
    case 'length':
    case 'side':
      return f.box.w;
    case 'breadth':
      return f.box.h;
  }
}

/** The ask of a task's written part: input `ask`, or what a grid kind asks for (count → area, trace → perimeter, cut → area). */
export function askOf(task: Task, spec: InputSpec | null): AskContext | null {
  const m = task.model;
  if (m.kind !== 'grid') return null;
  const ask: Ask | undefined =
    task.kind === 'count-squares' || task.kind === 'split-figure' ? 'area' : task.kind === 'trace-perimeter' ? 'perimeter' : (spec?.ask ?? undefined);
  if (!ask) return null;
  const id = spec?.figure ?? ('figure' in task ? task.figure : undefined);
  const figure = figureOf(m, id);
  if (!figure) return null;
  return { ask, model: m, figure, facts: factsOf(figure), given: spec?.given };
}

const int = (v: number) => Number.isInteger(v) && v > 0;

/** One rule per code: does the written number `x` show it? */
export function numberShows(code: MisconceptionCode, c: AskContext, x: number): boolean {
  const f = c.facts;
  const A = f.area;
  const P = f.perimeter;
  const { w, h } = f.box;
  const right = measured(c);
  if (x === right) return false;
  switch (code) {
    case 'half-squares':
      return c.ask === 'area' && f.halfCount > 0 && (x === f.whole + f.halfCount || x === f.whole);
    case 'area-perimeter-swap': {
      if (c.ask === 'area') return P !== null && x === P;
      if (c.ask === 'perimeter') return x === A;
      if (c.ask === 'length' || c.ask === 'breadth') {
        const known = c.ask === 'length' ? h : w;
        // The other rule's way: half the area less the known side, or the perimeter shared out like an area.
        if (c.given === 'area') return int(A / 2 - known) && x === A / 2 - known;
        if (c.given === 'perimeter' && P !== null) return int(P / known) && x === P / known;
      }
      return false;
    }
    case 'border-squares':
      return c.ask === 'perimeter' && x === f.border;
    case 'two-sides-only':
      return c.ask === 'perimeter' && x === w + h;
    case 'sides-added-for-area':
      return c.ask === 'area' && x === w + h;
    case 'missing-side': {
      if (c.ask !== 'perimeter') return false;
      const sum = labelledSum(c.model, c.figure);
      return sum > 0 && x === sum;
    }
    case 'same-area-same-perimeter':
      return (
        c.ask === 'perimeter' &&
        c.model.figures.some((g) => {
          if (g === c.figure || g.tone === 'ghost') return false;
          const o = factsOf(g);
          return o.area === A && o.perimeter === x;
        })
      );
    case 'perimeter-not-halved': {
      if ((c.ask !== 'length' && c.ask !== 'breadth') || c.given !== 'perimeter' || P === null) return false;
      return x === P - (c.ask === 'length' ? h : w);
    }
    case 'side-from-total': {
      if (c.ask === 'side') return c.given === 'perimeter' ? P !== null && x === P / 2 : c.given === 'area' ? x === A / 4 || x === A / 2 : false;
      // The area of a square from its perimeter, with the side taken as half the perimeter.
      return c.ask === 'area' && f.square && c.given === 'perimeter' && P !== null && x === (P / 2) ** 2;
    }
    case 'overlap-counted': {
      if (c.ask !== 'area' || f.rect) return false;
      const overlap = cornerOverlap(f.cells);
      const parts = f.parts.reduce((s, [, , pw, ph]) => s + pw * ph, 0);
      return x === w * h || (overlap !== null && x === A + overlap) || (f.parts.length > 1 && parts !== A && x === parts);
    }
    case 'inner-edge-counted':
      return c.ask === 'perimeter' && f.parts.length > 1 && x === f.parts.reduce((s, [, , pw, ph]) => s + 2 * (pw + ph), 0);
    default:
      return false;
  }
}

/** A length written with a square unit, or an area with a length unit. */
export function unitShows(c: AskContext, unit: Unit | null, want: Unit | undefined): boolean {
  if (!unit || !want || unit === want) return false;
  return isAreaUnit(unit) !== isAreaUnit(want) && (c.ask === 'area') === isAreaUnit(want);
}

/** The first declared code a written number (and unit) shows. */
export function diagnoseNumber(codes: readonly MisconceptionCode[], c: AskContext, x: number): MisconceptionCode | null {
  return codes.find((code) => numberShows(code, c, x)) ?? null;
}

/* ------------------------------------------------------------------ */
/* Drawn rectangles                                                    */
/* ------------------------------------------------------------------ */

/** Does a `w × h` rectangle meet the task? */
export function drawnRight(task: TaskOf<'draw-rectangle'>, w: number, h: number): boolean {
  if (task.area !== undefined && w * h !== task.area) return false;
  if (task.perimeter !== undefined && 2 * (w + h) !== task.perimeter) return false;
  if (task.square && w !== h) return false;
  if (task.accept === 'exact') {
    if (task.length !== undefined && w !== task.length) return false;
    if (task.breadth !== undefined && h !== task.breadth) return false;
  } else {
    if (task.length !== undefined && w !== task.length && h !== task.length) return false;
    if (task.breadth !== undefined && w !== task.breadth && h !== task.breadth) return false;
  }
  return true;
}

/** What a wrong rectangle shows. */
export function drawnShows(code: MisconceptionCode, task: TaskOf<'draw-rectangle'>, w: number, h: number): boolean {
  if (drawnRight(task, w, h)) return false;
  const A = task.area;
  const P = task.perimeter;
  switch (code) {
    case 'same-area-same-perimeter':
      return A !== undefined && P !== undefined && w * h === A && 2 * (w + h) !== P;
    case 'area-perimeter-swap':
      return (A !== undefined && 2 * (w + h) === A) || (A === undefined && P !== undefined && w * h === P);
    case 'sides-added-for-area':
      return A !== undefined && w + h === A;
    case 'side-from-total':
      return !!task.square && w === h && ((A !== undefined && (w === A / 4 || w === A / 2)) || (P !== undefined && w === P / 2));
    case 'perimeter-not-halved': {
      if (P === undefined) return false;
      const known = task.length ?? task.breadth;
      if (known === undefined) return false;
      return (w === known && h === P - known) || (h === known && w === P - known);
    }
    default:
      return false;
  }
}
