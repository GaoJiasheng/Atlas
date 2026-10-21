/**
 * Cylinder and cone nets rolled up (docs/39 §3.3, lib/curved.ts): flat at
 * t = 0 (everything on the ground); at t = 1 the cylinder's rectangle wraps
 * once round its circles and its two short edges meet, the cone's sector
 * closes into a cone over its base with the apex straight above the centre
 * and its two straight edges meeting; a curved face 0.7 of the length leaves
 * a gap of 0.3 × 2πr; what closes and what does not.
 */
import { describe, expect, it } from 'vitest';
import type { SolidSpec } from '../../src/engines/math-scene/schema';
import { curvedCloses, curvedGap, curvedPieces, seamEnds, STRIPS } from '../../src/engines/math-scene/lib/curved';
import { dot, norm, sub } from '../../src/engines/math-scene/lib/solid';

const CYL: SolidSpec = { type: 'cylinder', radius: 1, height: 2 };
const CONE: SolidSpec = { type: 'cone', radius: 1, height: 2 };

describe('flat', () => {
  for (const s of [CYL, CONE]) it(`${s.type}: every point on the ground at t = 0`, () => {
    for (const p of curvedPieces(s, undefined, 0)) for (const v of p.pts) expect(Math.abs(v[2])).toBeLessThan(1e-12);
  });
});

describe('a cylinder', () => {
  it('folded: the rectangle on a cylinder of radius r about the circle on the ground, the lid at the top, the edges meeting', () => {
    const pieces = curvedPieces(CYL, undefined, 1);
    expect(pieces.filter((p) => p.face === 'side')).toHaveLength(STRIPS);
    for (const p of pieces.filter((x) => x.face === 'side')) for (const v of p.pts) expect(Math.hypot(v[0], v[1])).toBeCloseTo(1, 9);
    const top = pieces.find((p) => p.face === 'top')!;
    for (const v of top.pts) {
      expect(v[2]).toBeCloseTo(2, 9);
      expect(Math.hypot(v[0], v[1])).toBeCloseTo(1, 9);
    }
    expect(dot(top.outside, [0, 0, 1])).toBeCloseTo(1, 9);
    const [a, b] = seamEnds(CYL, undefined)!;
    expect(norm(sub(a, b))).toBeLessThan(1e-9);
  });

  it('cut 0.7 of the way round: a gap of 0.3 × 2πr is left', () => {
    const c = { wrap: 0.7 };
    const [a, b] = seamEnds(CYL, c)!;
    const angle = Math.acos(dot([a[0], a[1], 0], [b[0], b[1], 0]) / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1])));
    // The short way round between the two ends is the gap (0.3 of a turn is less than half).
    expect(angle).toBeCloseTo(0.3 * 2 * Math.PI, 9);
    expect(curvedGap(CYL, c)).toBeCloseTo(0.3 * 2 * Math.PI, 12);
    expect(curvedCloses(CYL, c)).toBe(false);
  });

  it('closes with a circle on each long edge; one circle, or both on one edge, does not', () => {
    expect(curvedCloses(CYL, undefined)).toBe(true);
    expect(curvedCloses(CYL, { caps: [0.5] })).toBe(false);
    expect(curvedCloses(CYL, { caps: [{ at: 0.2, edge: 'top' }, { at: 0.8, edge: 'top' }] })).toBe(false);
  });
});

describe('a cone', () => {
  it('folded: the apex above the centre, the sector round the base, its straight edges meeting', () => {
    const pieces = curvedPieces(CONE, undefined, 1);
    const strips = pieces.filter((p) => p.face === 'side');
    expect(strips).toHaveLength(STRIPS);
    for (const p of strips) {
      expect(norm(sub(p.pts[0]!, [0, 0, 2]))).toBeLessThan(1e-9);
      for (const v of p.pts.slice(1)) {
        expect(v[2]).toBeCloseTo(0, 9);
        expect(Math.hypot(v[0], v[1])).toBeCloseTo(1, 9);
      }
    }
    const [a, b] = seamEnds(CONE, undefined)!;
    expect(norm(sub(a, b))).toBeLessThan(1e-9);
  });

  it('a triangle for the curved face, or two circles, is not a net; a sector and one circle is', () => {
    expect(curvedCloses(CONE, undefined)).toBe(true);
    expect(curvedCloses(CONE, { lateral: 'triangle' })).toBe(false);
    expect(curvedCloses(CONE, { caps: [0.5, 0.2] })).toBe(false);
    expect(curvedCloses(CONE, { wrap: 0.8 })).toBe(false);
  });
});
