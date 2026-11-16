/**
 * The `symmetry` misconceptions worked out from a completed figure (docs/79
 * §2.1, §3.3). A completion is compared with the right partner set: the
 * squares (or the corners, in order either way) the child put down are the
 * given half slid across the line without turning over (`slid-not-flipped`),
 * the partners at the wrong distance — the right half turned over, then moved
 * along across the line (`distance-not-kept`, the same as turning it over
 * about another line parallel to the given one) — or every whole square right
 * with a half square whose slant was not turned over (`half-not-flipped`).
 * A slide that is also a turn-over moved along (a given half that is itself
 * symmetric that way) counts as the distance. The choose-only codes
 * (`equal-halves`, `upright-line-only`, `outline-only`, `line-count`) come
 * from options and are checked by validate against the geometry — except
 * that a line drawn on the grid (`draw-segment`, relation `symmetry`) that is
 * not a line of symmetry shows `upright-line-only` when it stands up and the
 * figure's lines of symmetry do not, else `equal-halves` when it still cuts
 * the figure into two halves of the same area. Pure.
 */
import type { MisconceptionCode } from '../../schema';
import { parseHalf } from '../grid';
import { area, clipHalf, isSymmetric, linesOfSymmetry, shiftKey, unflippedKey, type Line, type Piece } from '../symmetry';

export interface Completion {
  /** Up (`x`) or across (`y`) and where. */
  ax: { axis: 'x' | 'y'; at: number };
  /** `cells`: square / half-square keys (a set) · `outline`: grid points in order. */
  mode: 'cells' | 'outline';
  /** The given half (keys or points, in order). */
  given: string[];
  /** The right partners (keys; points in the order that joins them up). */
  right: string[];
  /** The child's. */
  child: string[];
}

/** The order rules are tried in. */
export const SYMMETRY_PRIORITY: readonly MisconceptionCode[] = ['half-not-flipped', 'distance-not-kept', 'slid-not-flipped'];

const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && new Set(a).size === a.length && a.every((k) => b.includes(k));
const sameSeq = (a: readonly string[], b: readonly string[]) => a.length === b.length && (a.every((k, i) => k === b[i]) || a.every((k, i) => k === b[b.length - 1 - i]));
const shiftPoint = (key: string, axis: 'x' | 'y', d: number) => {
  const [x, y] = key.split(',').map(Number) as [number, number];
  return axis === 'x' ? `${x + d},${y}` : `${x},${y + d}`;
};

/** Does the child's work equal `keys` moved along across the line by some whole number of squares (not 0)? */
function shiftedOf(c: Completion, keys: readonly string[]): boolean {
  const same = c.mode === 'cells' ? sameSet : sameSeq;
  const shift = c.mode === 'cells' ? shiftKey : shiftPoint;
  for (let d = -24; d <= 24; d++) if (d !== 0 && same(c.child, keys.map((k) => shift(k, c.ax.axis, d)))) return true;
  return false;
}

export const isRight = (c: Completion): boolean => (c.mode === 'cells' ? sameSet(c.child, c.right) : sameSeq(c.child, c.right));

/** Does the completion show `code`? */
export function completionShows(code: MisconceptionCode, c: Completion): boolean {
  if (isRight(c)) return false;
  if (code === 'distance-not-kept') return shiftedOf(c, c.right);
  if (code === 'slid-not-flipped') return !shiftedOf(c, c.right) && shiftedOf(c, c.given);
  if (code === 'half-not-flipped') {
    if (c.mode !== 'cells') return false;
    const halves = c.right.filter((k) => parseHalf(k));
    const wholes = c.right.filter((k) => !parseHalf(k));
    const childWholes = c.child.filter((k) => !parseHalf(k));
    const childHalves = c.child.filter((k) => parseHalf(k));
    if (halves.length === 0 || !sameSet(childWholes, wholes) || childHalves.length !== halves.length) return false;
    const unflipped = childHalves.filter((k) => !halves.includes(k));
    return unflipped.length > 0 && unflipped.every((k) => halves.some((h) => unflippedKey(h, c.ax) === k));
  }
  return false;
}

/** The code a wrong completion shows, among the declared ones, by priority. */
export function diagnoseCompletion(codes: readonly MisconceptionCode[], c: Completion): MisconceptionCode | null {
  return SYMMETRY_PRIORITY.find((code) => codes.includes(code) && completionShows(code, c)) ?? null;
}

/** The order a line drawn is diagnosed in. */
export const SYMMETRY_LINE_PRIORITY: readonly MisconceptionCode[] = ['upright-line-only', 'equal-halves'];

/** Does a line drawn (not a line of symmetry of `pieces`) show `code`? */
export function drawnLineShows(code: MisconceptionCode, pieces: readonly Piece[], l: Line): boolean {
  if (pieces.length === 0 || isSymmetric(pieces, l)) return false;
  if (code === 'upright-line-only') {
    const upright = Math.abs(l.a[0] - l.b[0]) < 1e-9;
    const lines = linesOfSymmetry(pieces);
    return upright && lines.length > 0 && lines.every((m) => Math.abs(m.a[0] - m.b[0]) > 1e-9);
  }
  if (code === 'equal-halves') {
    const left = pieces.reduce((s, p) => s + area(clipHalf(p.poly, l, 1)), 0);
    const right = pieces.reduce((s, p) => s + area(clipHalf(p.poly, l, -1)), 0);
    return left > 1e-6 && right > 1e-6 && Math.abs(left - right) < 1e-6;
  }
  return false;
}

/** The code a wrong line of symmetry drawn shows, among the declared ones, by priority. */
export function diagnoseDrawnLine(codes: readonly MisconceptionCode[], pieces: readonly Piece[], l: Line): MisconceptionCode | null {
  return SYMMETRY_LINE_PRIORITY.find((code) => codes.includes(code) && drawnLineShows(code, pieces, l)) ?? null;
}
