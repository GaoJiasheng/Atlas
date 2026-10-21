/**
 * The `nets` misconceptions (docs/39 §2.1, §3.6): each rule a pure test on
 * what the child's net folds into (R, a `foldResult`), the solid it should
 * make (T), a face tapped, a number written, or what a `choose` option is
 * or says. A task looks only for the codes it declares; when two rules hold
 * the order is face-size, then face-count, then overlap-unseen. The
 * choose-only codes (`prism-pyramid`, `cube-cuboid`, `curved-unrolled`) are
 * checked by validate against the option's geometry, never inferred from a
 * free answer.
 */
import type { MisconceptionCode, SolidClass } from '../../schema';

/** What a net folds into, as far as the rules need it. */
export interface Folded {
  closes: boolean;
  /** Pieces in the net (faces of any size). */
  pieces: number;
  /** Faces the solid should have (an open face left out). */
  faces: number;
  overlaps: number;
  sizeMismatch: number;
}

/** The order rules are tried in when more than one holds. */
export const NETS_PRIORITY: readonly MisconceptionCode[] = ['face-size', 'face-count', 'overlap-unseen'];

/** Does a net that does not close show `code`? (complete-net; a picture option's net.) */
export function foldedShows(code: MisconceptionCode, r: Folded): boolean {
  if (r.closes) return false;
  if (code === 'face-size') return r.sizeMismatch > 0;
  if (code === 'face-count') return r.pieces !== r.faces;
  if (code === 'overlap-unseen') return r.pieces === r.faces && r.overlaps > 0;
  return false;
}

/** The code a net that does not close shows, among the declared ones, by priority. */
export function diagnoseFolded(codes: readonly MisconceptionCode[], r: Folded): MisconceptionCode | null {
  return NETS_PRIORITY.find((c) => codes.includes(c) && foldedShows(c, r)) ?? null;
}

/** The rules a folded net meets (check-pool warns when a planned wrong answer meets more than one). */
export const foldedCodes = (r: Folded): MisconceptionCode[] => NETS_PRIORITY.filter((c) => foldedShows(c, r));

/** A face tapped as "the face opposite": one that shares an edge with the marked face. */
export function tappedShows(code: MisconceptionCode, sharesEdgeWithMark: boolean): boolean {
  return code === 'adjacent-as-opposite' && sharesEdgeWithMark;
}

/** A number written for a net: how many faces (only one shape counted), or a length (another edge's). */
export function writtenShows(code: MisconceptionCode, ask: 'faces' | 'length', x: number, answer: number, ctx: { shapeCounts: number[]; edgeLengths: number[] }): boolean {
  if (x === answer) return false;
  if (code === 'face-count') return ask === 'faces' && ctx.shapeCounts.includes(x);
  if (code === 'face-size') return ask === 'length' && ctx.edgeLengths.includes(x);
  return false;
}

/** Two names a child mixes up: a prism and a pyramid (or a cone and a pyramid), a cube and a cuboid. */
export function namesShow(code: MisconceptionCode, named: SolidClass, actual: SolidClass): boolean {
  if (named === actual) return false;
  const pair = new Set([named, actual]);
  if (code === 'prism-pyramid') return (pair.has('prism') && pair.has('pyramid')) || (pair.has('cone') && pair.has('pyramid'));
  if (code === 'cube-cuboid') return pair.has('cube') && pair.has('cuboid');
  if (code === 'curved-unrolled') return named === 'pyramid' && actual === 'cone';
  return false;
}

/** A yes / no about folding: "it folds" for a net with faces on faces, "it does not" for a net that is not the cross. */
export function claimShows(code: MisconceptionCode, saysFolds: boolean, net: { closes: boolean; overlaps: number; cross: boolean }): boolean {
  if (code === 'overlap-unseen') return saysFolds && !net.closes && net.overlaps > 0;
  if (code === 'prototype-only') return !saysFolds && net.closes && !net.cross;
  return false;
}

/** A picture of a net (a choose option): a curved face unrolled wrong, or a net left out though it folds (multi choice). */
export function pictureShows(code: MisconceptionCode, pic: Folded & { curvedWrong: boolean; cross: boolean }, chosenWrongly: boolean): boolean {
  if (!chosenWrongly) return code === 'prototype-only' && pic.closes && !pic.cross;
  if (code === 'curved-unrolled') return pic.curvedWrong;
  return foldedShows(code, pic);
}
