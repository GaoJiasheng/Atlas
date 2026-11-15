/**
 * Line symmetry on the square grid (src/engines/math-scene/lib/symmetry.ts, docs/79 §3.1): reflecting
 * points, the half-square slant table, folding and the area where the halves do not match, the test
 * "is this a line of symmetry", the search for every line of symmetry, shaded squares matched on their own.
 */
import { describe, expect, it } from 'vitest';
import { cellDistance, figurePieces, foldPieces, isSymmetric, keyPieces, lineMatches, lineOf, linesOfSymmetry, partnerKey, partnerPoint, reflectPoint, unflippedKey } from '../../src/engines/math-scene/lib/symmetry';
import type { GridFigure, GridModelSpec } from '../../src/engines/math-scene/schema';

const fig = (f: Partial<GridFigure> & { id: string }): GridFigure => ({ tone: 'cold', ...f }) as GridFigure;
const grid = (figures: GridFigure[], extra: Partial<GridModelSpec> = {}): GridModelSpec => ({ kind: 'grid', unit: 'unit', show: 'cells', figures, ...extra }) as GridModelSpec;

describe('reflecting', () => {
  it('reflects a point across up, across and slanted lines', () => {
    expect(reflectPoint(lineOf({ x: 6 }), [3, 2])).toEqual([9, 2]);
    expect(reflectPoint(lineOf({ y: 4 }), [1, 7])).toEqual([1, 1]);
    const p = reflectPoint(lineOf({ from: [0, 0], to: [5, 5] }), [3, 1]);
    expect(p[0]).toBeCloseTo(1);
    expect(p[1]).toBeCloseTo(3);
  });
  it('finds the partner of a square, a half square and a point', () => {
    expect(partnerKey('3,2', { axis: 'x', at: 6 })).toBe('8,2');
    expect(partnerKey('5,2', { axis: 'x', at: 5.5 })).toBe('5,2');
    expect(partnerKey('2,6', { axis: 'y', at: 4 })).toBe('2,1');
    expect(partnerPoint([3, 7], { axis: 'y', at: 4 })).toEqual([3, 1]);
  });
  it('turns a half square\'s slant over (up: east ↔ west; across: north ↔ south)', () => {
    expect(partnerKey('4,1,ne', { axis: 'x', at: 6 })).toBe('7,1,nw');
    expect(partnerKey('4,1,sw', { axis: 'x', at: 6 })).toBe('7,1,se');
    expect(partnerKey('4,5,ne', { axis: 'y', at: 4 })).toBe('4,2,se');
    expect(partnerKey('4,5,nw', { axis: 'y', at: 4 })).toBe('4,2,sw');
    expect(unflippedKey('7,1,nw', { axis: 'x', at: 6 })).toBe('7,1,ne');
  });
  it('counts squares from a square to the line', () => {
    expect(cellDistance('3,2', { axis: 'x', at: 6 })).toBe(2);
    expect(cellDistance('8,2', { axis: 'x', at: 6 })).toBe(2);
    expect(cellDistance('5,7', { axis: 'y', at: 4 })).toBe(3);
  });
});

describe('folding', () => {
  const rect = fig({ id: 'r', rect: [0, 0, 6, 4] });
  it('a rectangle matches along its middle lines, not along its diagonal', () => {
    const pieces = figurePieces(rect);
    expect(isSymmetric(pieces, lineOf({ x: 3 }))).toBe(true);
    expect(isSymmetric(pieces, lineOf({ y: 2 }))).toBe(true);
    expect(isSymmetric(pieces, lineOf({ x: 2 }))).toBe(false);
    const diag = foldPieces(pieces, lineOf({ from: [0, 0], to: [6, 4] }));
    expect(diag.mismatch).toBeGreaterThan(1);
    expect(isSymmetric(pieces, lineOf({ from: [0, 0], to: [6, 4] }))).toBe(false);
  });
  it('the mismatch of an L shape folded along x = 2 is the parts that stick out', () => {
    const l = fig({ id: 'l', cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [0, 2]] });
    // Left: (0,0)(1,0)(0,1)(0,2) turned over → (3,0)(2,0)(3,1)(3,2); right: (2,0)(3,0). XOR = (3,1)(3,2) = 2 squares.
    expect(foldPieces(figurePieces(l), lineOf({ x: 2 })).mismatch).toBeCloseTo(2);
  });
  it('a half square folded onto its partner matches; onto itself it does not', () => {
    expect(isSymmetric(keyPieces(['1,0,ne', '2,0,nw']), lineOf({ x: 2 }))).toBe(true);
    expect(isSymmetric(keyPieces(['1,0,ne', '2,0,ne']), lineOf({ x: 2 }))).toBe(false);
    expect(foldPieces(keyPieces(['1,0,ne', '2,0,ne']), lineOf({ x: 2 })).mismatch).toBeCloseTo(0.5);
  });
  it('shaded squares are matched on their own (the outline is not enough)', () => {
    const cross = fig({ id: 'c', cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] });
    const dot = fig({ id: 'd', cells: [[0, 1]], shade: true });
    const m = grid([cross, dot]);
    expect(lineMatches(grid([cross]), { x: 1.5 })).toBe(true);
    expect(lineMatches(m, { x: 1.5 })).toBe(false);
    expect(foldPieces([...figurePieces(cross), ...figurePieces(dot)], lineOf({ x: 1.5 })).mismatch).toBeCloseTo(1);
  });
  it('a kite on a slant is symmetric about its slanted line', () => {
    const kite = fig({ id: 'k', shape: [[0, 0], [3, 1], [5, 5], [1, 3]] });
    expect(lineMatches(grid([kite]), { from: [0, 0], to: [5, 5] })).toBe(true);
    expect(lineMatches(grid([kite]), { x: 2.5 })).toBe(false);
  });
  it('a line drawn beside one figure is about that figure only', () => {
    const a = fig({ id: 'a', rect: [0, 0, 4, 4] });
    const b = fig({ id: 'b', shape: [[6, 0], [9, 0], [10, 3], [7, 3]] });
    expect(lineMatches(grid([a, b]), { from: [2, -0.5], to: [2, 4.5] })).toBe(true);
    expect(lineMatches(grid([a, b]), { from: [8, -0.5], to: [8, 3.5] })).toBe(false);
  });
});

describe('every line of symmetry', () => {
  const count = (f: GridFigure) => linesOfSymmetry(figurePieces(f)).length;
  it('a square has 4, a rectangle 2, a parallelogram 0', () => {
    expect(count(fig({ id: 's', rect: [0, 0, 4, 4] }))).toBe(4);
    expect(count(fig({ id: 'r', rect: [0, 0, 6, 4] }))).toBe(2);
    expect(count(fig({ id: 'p', shape: [[0, 0], [4, 0], [5, 3], [1, 3]] }))).toBe(0);
  });
  it('an equilateral triangle has 3, an isosceles one 1, a kite 1', () => {
    const h = 2 * Math.sqrt(3);
    expect(count(fig({ id: 'e', shape: [[0, 0], [4, 0], [2, h]] }))).toBe(3);
    expect(count(fig({ id: 'i', shape: [[0, 0], [4, 0], [2, 3]] }))).toBe(1);
    expect(count(fig({ id: 'k', shape: [[2, 0], [4, 3], [2, 4], [0, 3]] }))).toBe(1);
  });
  it('a plus shape of squares has 4 (two of them diagonal)', () => {
    expect(count(fig({ id: 'x', cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] }))).toBe(4);
  });
});
