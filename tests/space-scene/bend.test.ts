/**
 * A strip bent like a ruler (docs/37 §4.5, E-MT2): the small-deflection
 * shapes, the length kept at any value, the supports and clamp unmoved, the
 * straight overhangs, the limit, the vertex rewrite into the same buffers, the
 * slabs the strip is cut into and the cost of an update.
 */
import { describe, expect, it } from 'vitest';
import { BufferAttribute, BufferGeometry } from 'three';
import {
  BEND_ATTRIBUTE,
  BEND_MAX,
  BEND_SLICES,
  bendAxisIndex,
  bendCurve,
  bendFrame,
  bendLimit,
  bendVertices,
  curveAt,
  curveLength,
  curvePoint,
  newBendCurve,
  unitShape,
  type BendShape,
} from '../../src/engines/space-scene/lib/bend';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { sliceAlong } from '../../src/engines/space-scene/stages/model3d/shaped';
import { primitiveSchema } from '../../src/engines/space-scene/schema';
import type { Vec3 } from '../../src/engines/space-scene/lib/math';

const BRIDGE: BendShape = { mode: 'bridge', length: 0.3, span: 0.2 };
const CANTILEVER: BendShape = { mode: 'cantilever', length: 0.3, clamp: -0.1, reach: 0.25 };
const at = (c: ReturnType<typeof bendCurve>, s: number) => curveAt(c, s, [0, 0, 0, 0]);

describe('small bends follow the textbook shapes', () => {
  it.each([['bridge', BRIDGE], ['cantilever', CANTILEVER]] as const)('%s: within 1 % of the analytic deflection', (_, shape) => {
    const value = 0.0005;
    const c = bendCurve(shape, value);
    let worst = 0;
    for (let s = -0.15; s <= 0.15 + 1e-9; s += 0.005) {
      const p = at(c, s);
      const analytic = value * unitShape(shape, s);
      // Compare where the strip bends noticeably (the overhangs and the clamped part are checked elsewhere).
      if (Math.abs(analytic) > value * 0.2) worst = Math.max(worst, Math.abs(p[1] - analytic) / Math.abs(analytic));
    }
    expect(worst).toBeLessThan(0.01);
  });
  it('the unit shapes: −1 at the middle / free end, 0 at the supports / clamp, straight beyond', () => {
    expect(unitShape(BRIDGE, 0)).toBeCloseTo(-1, 12);
    expect(unitShape(BRIDGE, 0.1)).toBeCloseTo(0, 12);
    expect(unitShape(BRIDGE, 0.15)).toBeCloseTo(0.75, 12);
    expect(unitShape(CANTILEVER, -0.1)).toBe(0);
    expect(unitShape(CANTILEVER, 0.15)).toBeCloseTo(-1, 12);
  });
});

describe('the drawn value and the length', () => {
  it.each([0.0001, 0.001, 0.005, 0.02, 0.06, 0.09])('bridge sag %s m: drawn exactly, the length kept', (v) => {
    const c = bendCurve(BRIDGE, v);
    expect(Math.abs(c.value - v)).toBeLessThan(1e-9);
    expect(-at(c, 0)[1]).toBeCloseTo(v, 9);
    expect(Math.abs(curveLength(c) - 0.3) / 0.3).toBeLessThan(0.001);
  });
  it.each([0.0001, 0.001, 0.02, 0.0171, 0.1, 0.2])('cantilever drop %s m: drawn exactly at the free end, the length kept', (v) => {
    const c = bendCurve(CANTILEVER, v);
    expect(Math.abs(c.value - v)).toBeLessThan(1e-9);
    expect(-at(c, 0.15)[1]).toBeCloseTo(v, 9);
    expect(Math.abs(curveLength(c) - 0.3) / 0.3).toBeLessThan(0.001);
  });
  it('the arc pulls the free end in instead of stretching the strip', () => {
    const c = bendCurve(CANTILEVER, 0.2);
    expect(at(c, 0.15)[0]).toBeLessThan(0.15 - 0.05);
    expect(Math.hypot(at(c, 0.15)[0] - -0.1, at(c, 0.15)[1])).toBeLessThan(0.25);
  });
  it('clamps at BEND_MAX of the span / reach; nothing at or below 0', () => {
    expect(bendLimit(CANTILEVER, 1)).toBeCloseTo(BEND_MAX * 0.25, 12);
    expect(bendLimit(BRIDGE, 1)).toBeCloseTo(BEND_MAX * 0.2, 12);
    expect(bendCurve(CANTILEVER, 1).value).toBeCloseTo(0.2, 9);
    const flat = bendCurve(BRIDGE, -0.01);
    expect(flat.value).toBe(0);
    for (let i = 0; i < flat.x.length; i++) {
      expect(flat.x[i]).toBeCloseTo(flat.s[i]!, 12);
      expect(flat.y[i]).toBe(0);
    }
  });
  it('a strip too short for the sag on its supports goes as far as it can, still its own length', () => {
    const c = bendCurve(BRIDGE, 0.16);
    expect(c.value).toBeGreaterThan(0.09);
    expect(c.value).toBeLessThan(0.16);
    expect(curveLength(c)).toBeCloseTo(0.3, 9);
  });
});

describe('supports, clamp and overhangs', () => {
  it('a bridge strip stays on its supports (it crosses them at height 0) and stays symmetric', () => {
    for (const v of [0.005, 0.03, 0.06]) {
      const c = bendCurve(BRIDGE, v);
      let k = 0;
      while (c.x[k + 1]! < 0.1) k++;
      const t = (0.1 - c.x[k]!) / (c.x[k + 1]! - c.x[k]!);
      expect(c.y[k]! + t * (c.y[k + 1]! - c.y[k]!)).toBeCloseTo(0, 12);
      for (let i = 0; i < c.x.length; i++) {
        expect(c.x[i]).toBeCloseTo(-c.x[c.x.length - 1 - i]!, 12);
        expect(c.y[i]).toBeCloseTo(c.y[c.x.length - 1 - i]!, 12);
      }
    }
  });
  it('beyond the supports the ends run straight along the tangent, rising', () => {
    const c = bendCurve(BRIDGE, 0.03);
    const a = at(c, 0.115);
    const b = at(c, 0.14);
    expect(a[2]).toBeCloseTo(b[2], 9);
    expect(a[3]).toBeCloseTo(b[3], 9);
    expect(b[1]).toBeGreaterThan(a[1]);
    expect(at(c, 0.15)[1]).toBeGreaterThan(0);
  });
  it('a cantilever is unmoved up to its clamp', () => {
    const c = bendCurve(CANTILEVER, 0.1);
    for (let s = -0.15; s <= -0.1; s += 0.005) {
      const p = at(c, s);
      expect(p[0]).toBeCloseTo(s, 9);
      expect(p[1]).toBeCloseTo(0, 9);
    }
  });
});

describe('the vertices', () => {
  const strip = primitiveSchema.parse({ kind: 'box', size: [0.3, 0.002, 0.03], at: [0, 0.061, 0], color: 'wood' });
  const tab = primitiveSchema.parse({ kind: 'box', size: [0.01, 0.01, 0.01], at: [0.2, 0.061, 0], color: 'wood' });
  it('the main primitive is cut into BEND_SLICES slabs and marked; an extra is not', () => {
    const [piece] = partPieces({ primitive: strip, extra: [tab] }, 0);
    const g = piece!.geometry;
    const P = g.getAttribute('position');
    const B = g.getAttribute(BEND_ATTRIBUTE);
    expect(B).toBeDefined();
    const xs = new Set<number>();
    let marked = 0;
    for (let i = 0; i < P.count; i++) {
      if (B.getX(i) === 1) {
        marked++;
        xs.add(Math.round(P.getX(i) * 1e6));
      } else expect(P.getX(i)).toBeGreaterThan(0.19);
    }
    expect(marked).toBeGreaterThan(0);
    expect(xs.size).toBe(BEND_SLICES + 1);
    // Without a bend the strip is the plain box.
    expect(partPieces({ primitive: strip })[0]!.geometry.getAttribute(BEND_ATTRIBUTE)).toBeUndefined();
  });
  it('slicing keeps the surface: the same area, every triangle within one slab, unit normals', () => {
    const bevel = primitiveSchema.parse({ kind: 'bevelBox', size: [0.03, 0.004, 0.3], bevel: 0.001, at: [0, 0, 0], color: 'wood' });
    const [piece] = partPieces({ primitive: bevel }, 2);
    const area = (g: BufferGeometry) => {
      const p = g.getAttribute('position');
      let sum = 0;
      for (let i = 0; i < p.count; i += 3) {
        const ax = p.getX(i + 1) - p.getX(i), ay = p.getY(i + 1) - p.getY(i), az = p.getZ(i + 1) - p.getZ(i);
        const bx = p.getX(i + 2) - p.getX(i), by = p.getY(i + 2) - p.getY(i), bz = p.getZ(i + 2) - p.getZ(i);
        sum += Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx) / 2;
      }
      return sum;
    };
    const [plain] = partPieces({ primitive: bevel });
    expect(area(piece!.geometry)).toBeCloseTo(area(plain!.geometry), 9);
    const P = piece!.geometry.getAttribute('position');
    const N = piece!.geometry.getAttribute('normal');
    const slab = 0.3 / BEND_SLICES;
    for (let i = 0; i < P.count; i += 3) {
      const z = [P.getZ(i), P.getZ(i + 1), P.getZ(i + 2)];
      expect(Math.max(...z) - Math.min(...z)).toBeLessThanOrEqual(slab + 1e-6);
    }
    for (let i = 0; i < N.count; i++) expect(Math.hypot(N.getX(i), N.getY(i), N.getZ(i))).toBeCloseTo(1, 5);
  });
  it('sliceAlong keeps the winding of every triangle', () => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array([-1, 0, 0, 1, 0, 0, 1, 0, -1]), 3));
    g.setAttribute('normal', new BufferAttribute(new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0]), 3));
    const out = sliceAlong(g, 0, -1, 1, 4);
    const p = out.getAttribute('position');
    for (let i = 0; i < p.count; i += 3) {
      const ax = p.getX(i + 1) - p.getX(i), az = p.getZ(i + 1) - p.getZ(i);
      const bx = p.getX(i + 2) - p.getX(i), bz = p.getZ(i + 2) - p.getZ(i);
      // y of (a × b): the source triangle's sign (−1 × … : here negative, the original winding).
      expect(az * bx - ax * bz).toBeGreaterThan(0);
    }
  });
  it('rewrites positions and normals into the same buffers: the middle drops by the value, the thickness turns with the strip', () => {
    const [piece] = partPieces({ primitive: strip }, 0);
    const g = piece!.geometry;
    const pos = g.getAttribute('position').array as Float32Array;
    const nor = g.getAttribute('normal').array as Float32Array;
    const base = Float32Array.from(pos);
    const baseNormal = Float32Array.from(nor);
    const axis = bendAxisIndex([1, 0, 0])!;
    const frame = bendFrame(base, axis, 0.3);
    const mask = g.getAttribute(BEND_ATTRIBUTE).array as Float32Array;
    const c = bendCurve(BRIDGE, 0.03, newBendCurve());
    bendVertices(c, axis, frame, mask, base, baseNormal, pos, nor);
    expect(g.getAttribute('position').array).toBe(pos);
    let top = -Infinity;
    for (let i = 0; i < pos.length / 3; i++) {
      if (Math.abs(base[i * 3]!) < 1e-9 && base[i * 3 + 1]! > 0) top = Math.max(top, pos[i * 3 + 1]!);
      const n = Math.hypot(nor[i * 3]!, nor[i * 3 + 1]!, nor[i * 3 + 2]!);
      expect(n).toBeCloseTo(1, 5);
    }
    expect(top).toBeCloseTo(0.001 - 0.03, 6);
    // At a support the top face turns with the strip: its normal leans toward the middle.
    const p: Vec3 = [0, 0, 0];
    curvePoint(c, axis, 0, p);
    expect(p[1]).toBeCloseTo(-0.03, 9);
    for (let i = 0; i < pos.length / 3; i++)
      if (Math.abs(base[i * 3]! - 0.1) < 0.002 && baseNormal[i * 3 + 1]! > 0.99) expect(nor[i * 3]!).toBeLessThan(-0.1);
  });
  it('mirrors along a negative axis', () => {
    const c = bendCurve(CANTILEVER, 0.05);
    const p: Vec3 = [0, 0, 0];
    curvePoint(c, bendAxisIndex([0, 0, -1])!, 0.15, p);
    expect(p[2]).toBeLessThan(-0.1);
    expect(p[1]).toBeCloseTo(-0.05, 9);
  });
  it('100 updates (centre line + vertices) take under 2 ms', () => {
    const [piece] = partPieces({ primitive: strip }, 0);
    const g = piece!.geometry;
    const pos = g.getAttribute('position').array as Float32Array;
    const nor = g.getAttribute('normal').array as Float32Array;
    const base = Float32Array.from(pos);
    const baseNormal = Float32Array.from(nor);
    const axis = bendAxisIndex([1, 0, 0])!;
    const frame = bendFrame(base, axis, 0.3);
    const c = newBendCurve();
    const update = (i: number) => {
      bendCurve(CANTILEVER, (0.2 * (i % 100)) / 100, c);
      bendVertices(c, axis, frame, null, base, baseNormal, pos, nor);
    };
    for (let i = 0; i < 300; i++) update(i);
    // The fastest of seven runs: the cost of the work, not of whatever else the machine runs alongside.
    const runs = Array.from({ length: 7 }, () => {
      const t0 = performance.now();
      for (let i = 0; i < 100; i++) update(i);
      return performance.now() - t0;
    }).sort((a, b) => a - b);
    expect(runs[0]).toBeLessThan(2);
  });
});

describe('axes', () => {
  it('±X and ±Z only', () => {
    expect(bendAxisIndex([1, 0, 0])).toEqual({ index: 0, sign: 1 });
    expect(bendAxisIndex([0, 0, -1])).toEqual({ index: 2, sign: -1 });
    expect(bendAxisIndex([0, 1, 0])).toBeNull();
    expect(bendAxisIndex([0.7, 0, 0.7])).toBeNull();
  });
});
