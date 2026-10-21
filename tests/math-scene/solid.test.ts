/**
 * The solids catalogue (docs/39 §3.1, lib/solid.ts): every polyhedron is a
 * closed convex surface (V − E + F = 2, a geometric self-check only; the
 * lesson never counts edges or vertices), faces face outwards, the angles
 * between faces are right (a cuboid's all 90°, a triangular prism's sides
 * 60° apart, the regular tetrahedron arccos 1/3), a cube is a cube and a
 * cuboid a cuboid, and the face counts the SOLID card reads.
 */
import { describe, expect, it } from 'vitest';
import type { SolidSpec } from '../../src/engines/math-scene/schema';
import { centroid, dot, edgeLengths, eulerCounts, faceCounts, flatAndCurved, oppositeFace, polyNormal, sameSolid, shareEdge, solid, solidClass, sub } from '../../src/engines/math-scene/lib/solid';

const SOLIDS: SolidSpec[] = [
  { type: 'cuboid', size: [1, 1, 1] },
  { type: 'cuboid', size: [3, 2, 1] },
  ...([3, 4, 5, 6] as const).map((sides) => ({ type: 'prism' as const, sides, edge: 2, length: 3 })),
  ...([3, 4, 5, 6] as const).map((sides) => ({ type: 'pyramid' as const, sides, edge: 2, height: 1.6 })),
  { type: 'pyramid', sides: 3, edge: 2, regular: true },
];
const deg = (r: number) => (r * 180) / Math.PI;

describe('polyhedra', () => {
  for (const s of SOLIDS) {
    it(`${JSON.stringify(s)}: V − E + F = 2, faces outward, every edge shared by two faces`, () => {
      const p = solid(s)!;
      const { v, e, f } = eulerCounts(p);
      expect(v - e + f).toBe(2);
      const mid = centroid(p.vertices);
      for (const face of p.faces) {
        const pts = face.poly.map((i) => p.vertices[i]!);
        expect(dot(polyNormal(pts), sub(centroid(pts), mid))).toBeGreaterThan(0);
      }
      const shared = [...p.adjacency.values()].reduce((n, a) => n + a.length, 0);
      expect(shared).toBe(2 * e);
    });
  }

  it('a cuboid: every angle between faces 90°', () => {
    for (const a of solid({ type: 'cuboid', size: [3, 2, 1] })!.adjacency.values()) for (const x of a) expect(deg(x.dihedral)).toBeCloseTo(90, 9);
  });

  it('a triangular prism: the sides 60° apart (folded through 120°), the ends 90° to the sides', () => {
    const p = solid({ type: 'prism', sides: 3, edge: 2, length: 3 })!;
    const sides = p.adjacency.get('side-1')!;
    expect(deg(sides.find((x) => x.face === 'side-2')!.dihedral)).toBeCloseTo(60, 9);
    expect(deg(sides.find((x) => x.face === 'end-a')!.dihedral)).toBeCloseTo(90, 9);
  });

  it('the regular tetrahedron: every angle arccos 1/3', () => {
    for (const a of solid({ type: 'pyramid', sides: 3, edge: 2, regular: true })!.adjacency.values()) for (const x of a) expect(x.dihedral).toBeCloseTo(Math.acos(1 / 3), 9);
  });

  it('opposite faces and faces that meet', () => {
    const box: SolidSpec = { type: 'cuboid', size: [3, 2, 1] };
    expect(oppositeFace(box, 'top')).toBe('bottom');
    expect(oppositeFace(box, 'left')).toBe('right');
    expect(shareEdge(box, 'top', 'front')).toBe(true);
    expect(shareEdge(box, 'top', 'bottom')).toBe(false);
    expect(oppositeFace({ type: 'prism', sides: 3, edge: 2, length: 3 }, 'end-a')).toBe('end-b');
    expect(oppositeFace({ type: 'prism', sides: 3, edge: 2, length: 3 }, 'side-1')).toBeNull();
    expect(edgeLengths(box)).toEqual([1, 2, 3]);
  });
});

describe('names and faces', () => {
  it('a cube is a cube, a cuboid with square ends a cuboid', () => {
    expect(solidClass({ type: 'cuboid', size: [2, 2, 2] })).toBe('cube');
    expect(solidClass({ type: 'cuboid', size: [2, 2, 3] })).toBe('cuboid');
    expect(solidClass({ type: 'cone', radius: 1, height: 2 })).toBe('cone');
  });

  it('face counts: squares, rectangles, triangles; flat and curved faces', () => {
    expect(faceCounts({ type: 'cuboid', size: [1, 1, 1] })).toEqual([{ shape: 'square', n: 6 }]);
    expect(faceCounts({ type: 'cuboid', size: [2, 2, 3] })).toEqual([{ shape: 'square', n: 2 }, { shape: 'rectangle', n: 4 }]);
    expect(faceCounts({ type: 'prism', sides: 3, edge: 2, length: 3 })).toEqual([{ shape: 'triangle', n: 2 }, { shape: 'rectangle', n: 3 }]);
    expect(faceCounts({ type: 'pyramid', sides: 4, edge: 2, height: 1.6 })).toEqual([{ shape: 'square', n: 1 }, { shape: 'triangle', n: 4 }]);
    expect(flatAndCurved({ type: 'cylinder', radius: 1, height: 2 })).toEqual({ flat: 2, curved: 1 });
    expect(flatAndCurved({ type: 'cone', radius: 1, height: 2 })).toEqual({ flat: 1, curved: 1 });
    expect(flatAndCurved({ type: 'sphere', radius: 1 })).toEqual({ flat: 0, curved: 1 });
  });

  it('the same solid turned round is the same solid', () => {
    expect(sameSolid({ type: 'cuboid', size: [3, 2, 1] }, { type: 'cuboid', size: [1, 3, 2] })).toBe(true);
    expect(sameSolid({ type: 'cuboid', size: [3, 2, 1] }, { type: 'cuboid', size: [3, 2, 2] })).toBe(false);
    expect(sameSolid({ type: 'pyramid', sides: 3, edge: 2, regular: true }, { type: 'pyramid', sides: 3, edge: 2, height: 2 * Math.sqrt(2 / 3) })).toBe(true);
  });
});
