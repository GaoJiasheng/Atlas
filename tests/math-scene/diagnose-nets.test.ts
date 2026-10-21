/**
 * The `nets` misconceptions (docs/39 §2.1, §3.6, lib/diagnose/nets.ts): every
 * rule with at least two cases it holds for and one it does not, on real
 * nets folded by the engine; the priority face-size › face-count ›
 * overlap-unseen when more than one holds.
 */
import { describe, expect, it } from 'vitest';
import type { NetSpec, SolidSpec } from '../../src/engines/math-scene/schema';
import { claimShows, diagnoseFolded, foldedCodes, foldedShows, namesShow, pictureShows, tappedShows, writtenShows } from '../../src/engines/math-scene/lib/diagnose/nets';
import { foldedOf, netOfSpec } from '../../src/engines/math-scene/lib/net-tasks';
import { foldResult } from '../../src/engines/math-scene/lib/net';
import { shareEdge } from '../../src/engines/math-scene/lib/solid';

const CUBE: SolidSpec = { type: 'cuboid', size: [1, 1, 1] };
const BOX: SolidSpec = { type: 'cuboid', size: [3, 2, 1] };
const net = (solid: SolidSpec, layout?: NetSpec['layout'], extra: Partial<NetSpec> = {}) => ({ solid, layout, stagger: true, view: 'auto' as const, turn: 0, ...extra });
const cells = (c: [number, number][]) => foldedOf(net(CUBE, { cells: c }));
const ROW: [number, number][] = [[0, 1], [1, 1], [2, 1], [3, 1]];
const BLOCK = cells([[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]]);
const FIVE = cells([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [2, 1]]);
const SAME_SIDE = cells([...ROW, [0, 0], [3, 0]]);
const SHORT = foldedOf(net(BOX, { rects: [[1, 1, 3, 2], [1, 0, 3, 1], [1, 3, 3, 1], [1, 4, 3, 2], [0, 1, 1, 2], [4, 1, 1, 1]] }));
const LONG = foldedOf(net(BOX, { rects: [[1, 1, 3, 2], [1, 0, 3, 2], [1, 3, 3, 1], [1, 4, 3, 2], [0, 1, 1, 2], [4, 1, 1, 2]] }));
const FIVE_SQUARES = cells([...ROW, [1, 2]]);
const SEVEN_SQUARES = cells([...ROW, [1, 2], [1, 0], [2, 2]]);
const CROSS = foldedOf(net(CUBE, { cubeNet: '141-e' }));
const ZIGZAG = foldedOf(net(CUBE, { cubeNet: '222' }));
const TWO_THREES = foldedOf(net(CUBE, { cubeNet: '33' }));

describe('folded nets (complete-net, a net in a picture)', () => {
  it('face-size: a rectangle too short, a rectangle too long; not a net the right sizes', () => {
    expect(foldedShows('face-size', SHORT)).toBe(true);
    expect(foldedShows('face-size', LONG)).toBe(true);
    expect(foldedShows('face-size', BLOCK)).toBe(false);
  });
  it('face-count: 5 squares, 7 squares; not 6', () => {
    expect(foldedShows('face-count', FIVE_SQUARES)).toBe(true);
    expect(foldedShows('face-count', SEVEN_SQUARES)).toBe(true);
    expect(foldedShows('face-count', BLOCK)).toBe(false);
  });
  it('overlap-unseen: a 2 × 2 block, 5 in a row, two on one side of a row of 4; not a net, not 5 squares', () => {
    expect(foldedShows('overlap-unseen', BLOCK)).toBe(true);
    expect(foldedShows('overlap-unseen', FIVE)).toBe(true);
    expect(foldedShows('overlap-unseen', SAME_SIDE)).toBe(true);
    expect(foldedShows('overlap-unseen', ZIGZAG)).toBe(false);
    expect(foldedShows('overlap-unseen', FIVE_SQUARES)).toBe(false);
  });
  it('a net that closes shows nothing', () => {
    for (const code of ['face-size', 'face-count', 'overlap-unseen'] as const) expect(foldedShows(code, CROSS)).toBe(false);
  });
  it('the order when more than one holds: face-size, then face-count, then overlap-unseen', () => {
    const both = { ...BLOCK, sizeMismatch: 1 };
    expect(foldedCodes(both)).toEqual(['face-size', 'overlap-unseen']);
    expect(diagnoseFolded(['overlap-unseen', 'face-size'], both)).toBe('face-size');
    expect(diagnoseFolded(['overlap-unseen'], both)).toBe('overlap-unseen');
    expect(diagnoseFolded(['face-count', 'overlap-unseen'], { ...SEVEN_SQUARES, overlaps: 2 })).toBe('face-count');
  });
});

describe('a face tapped as the opposite one', () => {
  const n = netOfSpec(net(CUBE, { cubeNet: '141-d' }))!;
  const r = foldResult(n);
  const at = (k: string) => n.nodes.findIndex((x) => x.key === k);
  const touches = (a: number, b: number) => r.lands[a] !== r.lands[b] && r.opposite(a) !== b;
  it('adjacent-as-opposite: a square sharing an edge with the one given, either side; not the opposite one', () => {
    expect(tappedShows('adjacent-as-opposite', touches(at('1,1'), at('2,1')))).toBe(true);
    expect(tappedShows('adjacent-as-opposite', touches(at('1,1'), at('0,1')))).toBe(true);
    expect(tappedShows('adjacent-as-opposite', touches(at('1,1'), at('3,1')))).toBe(false);
    expect(shareEdge({ type: 'prism', sides: 3, edge: 2, length: 3 }, 'end-a', 'side-1')).toBe(true);
  });
});

describe('a number written about a net', () => {
  const prism = { shapeCounts: [2, 3], edgeLengths: [2, 3] };
  const box = { shapeCounts: [6], edgeLengths: [1, 2, 3] };
  it('face-count: only the triangles, only the rectangles; not 4', () => {
    expect(writtenShows('face-count', 'faces', 2, 5, prism)).toBe(true);
    expect(writtenShows('face-count', 'faces', 3, 5, prism)).toBe(true);
    expect(writtenShows('face-count', 'faces', 4, 5, prism)).toBe(false);
  });
  it('face-size: another edge\'s length (1 or 2 for 3); not a length the solid does not have', () => {
    expect(writtenShows('face-size', 'length', 2, 3, box)).toBe(true);
    expect(writtenShows('face-size', 'length', 1, 3, box)).toBe(true);
    expect(writtenShows('face-size', 'length', 5, 3, box)).toBe(false);
    expect(writtenShows('face-size', 'faces', 2, 3, box)).toBe(false);
  });
});

describe('names (choose options only)', () => {
  it('prism-pyramid: a prism called a pyramid and the other way, a cone called a pyramid; not cube and cuboid', () => {
    expect(namesShow('prism-pyramid', 'pyramid', 'prism')).toBe(true);
    expect(namesShow('prism-pyramid', 'prism', 'pyramid')).toBe(true);
    expect(namesShow('prism-pyramid', 'pyramid', 'cone')).toBe(true);
    expect(namesShow('prism-pyramid', 'cube', 'cuboid')).toBe(false);
  });
  it('cube-cuboid: either way round; not prism and pyramid', () => {
    expect(namesShow('cube-cuboid', 'cube', 'cuboid')).toBe(true);
    expect(namesShow('cube-cuboid', 'cuboid', 'cube')).toBe(true);
    expect(namesShow('cube-cuboid', 'prism', 'pyramid')).toBe(false);
  });
  it('curved-unrolled by name: a cone called a pyramid; not a cylinder called a prism, not the right name', () => {
    expect(namesShow('curved-unrolled', 'pyramid', 'cone')).toBe(true);
    expect(namesShow('curved-unrolled', 'prism', 'cylinder')).toBe(false);
    expect(namesShow('curved-unrolled', 'cone', 'cone')).toBe(false);
  });
});

describe('pictures and claims (choose options)', () => {
  const cyl: SolidSpec = { type: 'cylinder', radius: 1, height: 2 };
  const cone: SolidSpec = { type: 'cone', radius: 1, height: 2 };
  it('curved-unrolled: a rectangle too short, a triangle for a cone; not the right net', () => {
    expect(pictureShows('curved-unrolled', foldedOf(net(cyl, undefined, { curved: { wrap: 0.7 } })), true)).toBe(true);
    expect(pictureShows('curved-unrolled', foldedOf(net(cone, undefined, { curved: { lateral: 'triangle' } })), true)).toBe(true);
    expect(pictureShows('curved-unrolled', foldedOf(net(cyl, undefined, { curved: { caps: [0.5, 0.5] } })), true)).toBe(false);
  });
  it('a curved net with a circle missing or doubled: face-count; both on one edge: overlap-unseen', () => {
    expect(pictureShows('face-count', foldedOf(net(cyl, undefined, { curved: { caps: [0.5] } })), true)).toBe(true);
    expect(pictureShows('face-count', foldedOf(net(cone, undefined, { curved: { caps: [0.5, 0.2] } })), true)).toBe(true);
    expect(pictureShows('overlap-unseen', foldedOf(net(cyl, undefined, { curved: { caps: [{ at: 0.2, edge: 'top' }, { at: 0.8, edge: 'top' }] } })), true)).toBe(true);
    expect(pictureShows('face-count', foldedOf(net(cone, undefined, { curved: { caps: [0.5] } })), true)).toBe(false);
  });
  it('prototype-only: a net left out that is not the cross (multi choice); not the cross itself', () => {
    expect(pictureShows('prototype-only', ZIGZAG, false)).toBe(true);
    expect(pictureShows('prototype-only', TWO_THREES, false)).toBe(true);
    expect(pictureShows('prototype-only', CROSS, false)).toBe(false);
  });
  it('prototype-only: "it does not fold" said of a net that is not the cross; not of the cross, not of a non-net', () => {
    expect(claimShows('prototype-only', false, ZIGZAG)).toBe(true);
    expect(claimShows('prototype-only', false, TWO_THREES)).toBe(true);
    expect(claimShows('prototype-only', false, CROSS)).toBe(false);
    expect(claimShows('prototype-only', false, BLOCK)).toBe(false);
  });
  it('overlap-unseen: "it folds" said of a 2 × 2 block, of 5 in a row; not of a real net', () => {
    expect(claimShows('overlap-unseen', true, BLOCK)).toBe(true);
    expect(claimShows('overlap-unseen', true, FIVE)).toBe(true);
    expect(claimShows('overlap-unseen', true, ZIGZAG)).toBe(false);
  });
});
