/**
 * The `angles` misconceptions (docs/76 §2.1, §3.4): each rule a pure test on
 * the size the child wrote or drew (x) against the right one (t) and what the
 * task works from — a protractor reading, the angles known on a straight line
 * or at a point, a crossing, a drawing not to scale. A task looks only for the
 * codes it declares, in the order below. `arm-length`, `right-angle-upright`
 * and `vertex-not-middle` come from `choose` options only; `looks-parallel`
 * from options and from a line drawn on dot paper (`segmentShows`).
 *
 *   wrong-scale              read / measure / draw: x = 180 − t (±1), t ≠ 90
 *   read-end-mark            read: the first arm on k ≠ 0, x = k + t (the other arm's number)
 *   angle-sum-swap           straight: x = 360 − Σ known (− 90 per right mark); point: x = 180 − … (> 0)
 *   right-mark-missed        a right mark among the known: x = t + 90 (not taken away)
 *   opposite-adjacent        opposite: x = 180 − t; next to it: x = 180 − t (the opposite one's size)
 *   measured-not-calculated  not to scale: x = the drawn size (±3)
 */
import type { MisconceptionCode } from '../../schema';

/** What a written or drawn size is checked against. */
export interface AngleContext {
  rule: 'read' | 'count' | 'straight' | 'point' | 'opposite' | 'adjacent' | 'measure' | 'draw';
  /** The sizes known (straight, point, crossing). */
  known: number[];
  /** Right-angle marks among the angles known (each 90°, written in no number). */
  rights: number;
  /** Equal unknowns sharing what is left. */
  equal: number;
  /** A protractor drawn in place: the number the first arm lies on (0 when it is lined up). */
  offset: number | null;
  /** The drawing is not to scale: the size the unknown is drawn at. */
  drawn: number | null;
}

export const ANGLES_ORDER: readonly MisconceptionCode[] = ['measured-not-calculated', 'right-mark-missed', 'angle-sum-swap', 'opposite-adjacent', 'read-end-mark', 'wrong-scale'];

const near = (x: number, v: number, tol: number) => Math.abs(x - v) <= tol + 1e-9;
const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

/** The size an unknown on a straight line, at a point or at a crossing is (validate checks the answer against it). */
export function ruleAnswer(ctx: Pick<AngleContext, 'rule' | 'known' | 'rights' | 'equal'>): number | null {
  const left = (whole: number) => (whole - sum(ctx.known) - 90 * ctx.rights) / Math.max(1, ctx.equal);
  if (ctx.rule === 'straight') return left(180);
  if (ctx.rule === 'point') return left(360);
  if (ctx.rule === 'opposite') return ctx.known[0] ?? null;
  if (ctx.rule === 'adjacent') return ctx.known[0] === undefined ? null : 180 - ctx.known[0];
  return null;
}

/** Does x (right answer t) show `code`? */
export function angleShows(code: MisconceptionCode, x: number, t: number, ctx: AngleContext): boolean {
  const k = Math.max(1, ctx.equal);
  switch (code) {
    case 'wrong-scale':
      return (ctx.rule === 'read' || ctx.rule === 'measure' || ctx.rule === 'draw') && t !== 90 && near(x, 180 - t, 1);
    case 'read-end-mark':
      return ctx.rule === 'read' && ctx.offset !== null && ctx.offset !== 0 && near(x, ctx.offset + t, 1);
    case 'angle-sum-swap': {
      if (ctx.rule !== 'straight' && ctx.rule !== 'point') return false;
      const other = ((ctx.rule === 'straight' ? 360 : 180) - sum(ctx.known) - 90 * ctx.rights) / k;
      return other > 0 && near(x, other, 0);
    }
    case 'right-mark-missed':
      return (ctx.rule === 'straight' || ctx.rule === 'point') && ctx.rights > 0 && near(x, t + (90 * ctx.rights) / k, 0);
    case 'opposite-adjacent':
      return (ctx.rule === 'opposite' || ctx.rule === 'adjacent') && t !== 90 && near(x, 180 - t, 0);
    case 'measured-not-calculated':
      return ctx.drawn !== null && !near(t, ctx.drawn, 3) && near(x, ctx.drawn, 3);
    default:
      return false;
  }
}

/** The code a wrong size shows among the declared ones (in rule order). */
export function diagnoseAngle(codes: readonly MisconceptionCode[], x: number, t: number, ctx: AngleContext): MisconceptionCode | null {
  return ANGLES_ORDER.find((c) => codes.includes(c) && angleShows(c, x, t, ctx)) ?? null;
}

/** A line drawn on dot paper that is not parallel but changes its gap by at most one square along its length (it looks parallel). */
export function segmentShows(code: MisconceptionCode, relation: 'parallel' | 'perpendicular', gapChange: number): boolean {
  return code === 'looks-parallel' && relation === 'parallel' && gapChange > 0 && gapChange <= 1 + 1e-9;
}
