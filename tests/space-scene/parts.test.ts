import { describe, expect, it } from 'vitest';
import { Box3, BufferGeometry, Matrix4, Vector3 } from 'three';
import { partSchema, primitiveSchema } from '../../src/engines/space-scene/schema';
import { finOffsets, modelBounds, partBounds, repeatTransforms } from '../../src/engines/space-scene/lib/parts';
import { filletPath, isClosedKind, primitivePieces } from '../../src/engines/space-scene/stages/model3d/geometry';

const base = {
  name: { en: 'Part' },
  group: 'g',
  summary: { en: 'What it does.' },
  detail: { en: 'More.' },
  explode: { dir: [0, 1, 0], dist: 1 },
};

const part = (id: string, primitive: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
  partSchema.parse({ ...base, id, primitive: { at: [0, 0, 0], color: 'steel', ...primitive }, ...extra });

const ENGINEERED = {
  bevelBox: { kind: 'bevelBox', size: [0.7, 0.5, 0.6], bevel: 0.04 },
  tube: { kind: 'tube', path: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 1, -1]], radius: 0.03, bendRadius: 0.15 },
  flange: { kind: 'flange', radius: 0.1, thickness: 0.02, boltCount: 8, boltRadius: 0.075 },
  fins: { kind: 'fins', size: [0.5, 0.12, 0.01], count: 9, gap: 0.04, axis: 'x' },
  vessel: { kind: 'vessel', radius: 0.25, length: 0.5, headRatio: 0.5 },
  panelHole: { kind: 'panelHole', size: [0.78, 0.55, 0.012], hole: { r: 0.2, at: [-0.12, 0.005] } },
} as const;

/** Union of the pieces' boxes (instances applied). */
function piecesBox(pieces: { geometry: BufferGeometry; matrices: Matrix4[] | null }[]): Box3 {
  const box = new Box3();
  for (const p of pieces) {
    p.geometry.computeBoundingBox();
    const b = p.geometry.boundingBox!;
    for (const m of p.matrices ?? [new Matrix4()]) box.union(b.clone().applyMatrix4(m));
  }
  return box;
}

const closeBox = (a: Box3, b: { min: number[]; max: number[] }, eps = 0.012) => {
  [a.min.x, a.min.y, a.min.z].forEach((v, i) => expect(v).toBeGreaterThanOrEqual(b.min[i]! - eps));
  [a.max.x, a.max.y, a.max.z].forEach((v, i) => expect(v).toBeLessThanOrEqual(b.max[i]! + eps));
  // ...and fills it (no wildly loose bounds).
  [a.min.x, a.min.y, a.min.z].forEach((v, i) => expect(v).toBeLessThan(b.min[i]! + 0.06 + eps));
  [a.max.x, a.max.y, a.max.z].forEach((v, i) => expect(v).toBeGreaterThan(b.max[i]! - 0.06 - eps));
};

describe('primitive schema: engineered kinds', () => {
  it('accepts every engineered kind with sane parameters', () => {
    for (const p of Object.values(ENGINEERED)) expect(primitiveSchema.safeParse({ ...p, at: [0, 0, 0], color: 'casing' }).success).toBe(true);
  });
  it('rejects impossible sizes', () => {
    const bad = [
      { ...ENGINEERED.bevelBox, bevel: 0.3 },
      { ...ENGINEERED.tube, path: [[0, 0, 0], [0, 0, 0]] },
      { ...ENGINEERED.tube, bendRadius: 0.01 },
      { ...ENGINEERED.flange, boltRadius: 0.2 },
      { ...ENGINEERED.flange, boltCount: 2 },
      { ...ENGINEERED.fins, count: 1 },
      { ...ENGINEERED.fins, axis: 'w' },
      { ...ENGINEERED.vessel, radius: -1 },
      { ...ENGINEERED.vessel, length: 0, headRatio: 0 },
      { kind: 'box', size: [1, 1] },
      { kind: 'bevelBox', size: [1, 1], bevel: 0.1 },
    ];
    for (const p of bad) expect(primitiveSchema.safeParse({ ...p, at: [0, 0, 0], color: 'steel' }).success).toBe(false);
  });
  it('accepts material families and the old aliases, rejects unknown names', () => {
    for (const color of ['casing', 'steel', 'powder', 'stainless', 'copper', 'rubber', 'plastic', 'glass', 'metal', 'matte', 'token:hot', '#336699'])
      expect(primitiveSchema.safeParse({ kind: 'sphere', size: [1], at: [0, 0, 0], color }).success).toBe(true);
    expect(primitiveSchema.safeParse({ kind: 'sphere', size: [1], at: [0, 0, 0], color: 'chrome' }).success).toBe(false);
  });
  it('validates repeat', () => {
    expect(partSchema.safeParse({ ...base, id: 'a', primitive: { kind: 'sphere', size: [1], at: [0, 0, 0], color: 'steel' }, repeat: { count: 4, axis: [1, 0, 0], spacing: 0.5 } }).success).toBe(true);
    expect(partSchema.safeParse({ ...base, id: 'a', primitive: { kind: 'sphere', size: [1], at: [0, 0, 0], color: 'steel' }, repeat: { count: 6, axis: [0, 1, 0], radius: 0.5 } }).success).toBe(true);
    expect(partSchema.safeParse({ ...base, id: 'a', primitive: { kind: 'sphere', size: [1], at: [0, 0, 0], color: 'steel' }, repeat: { count: 1, axis: [1, 0, 0], spacing: 0.5 } }).success).toBe(false);
    expect(partSchema.safeParse({ ...base, id: 'a', primitive: { kind: 'sphere', size: [1], at: [0, 0, 0], color: 'steel' }, repeat: { count: 3, axis: [0, 0, 0], spacing: 0.5 } }).success).toBe(false);
  });
});

describe('repeat transforms', () => {
  it('linear: centred on the part, spaced along the axis', () => {
    const t = repeatTransforms({ count: 4, axis: [2, 0, 0], spacing: 0.5 });
    expect(t.map((x) => x.offset[0])).toEqual([-0.75, -0.25, 0.25, 0.75]);
  });
  it('radial: on a circle around the axis, each turned', () => {
    const t = repeatTransforms({ count: 6, axis: [0, 1, 0], radius: 2 });
    expect(t).toHaveLength(6);
    for (const x of t) {
      expect(Math.hypot(x.offset[0], x.offset[2])).toBeCloseTo(2);
      expect(x.offset[1]).toBeCloseTo(0);
    }
    expect(t[3]!.offset[0]).toBeCloseTo(-t[0]!.offset[0]);
  });
  it('no repeat = one identity', () => {
    expect(repeatTransforms(undefined)).toEqual([{ rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1], offset: [0, 0, 0] }]);
  });
});

describe('geometry builders', () => {
  for (const [kind, p] of Object.entries(ENGINEERED)) {
    it(`${kind}: has vertices and the bounds the HUD assumes`, () => {
      const pt = part(kind.toLowerCase(), p as Record<string, unknown>);
      const pieces = primitivePieces(pt);
      expect(pieces.length).toBeGreaterThan(0);
      for (const piece of pieces) expect(piece.geometry.getAttribute('position').count).toBeGreaterThan(0);
      closeBox(piecesBox(pieces), partBounds(pt)!);
    });
  }

  it('flange = ring + one instanced bolt head per bolt', () => {
    const pieces = primitivePieces(part('f', ENGINEERED.flange));
    expect(pieces).toHaveLength(2);
    expect(pieces[0]!.matrices).toBeNull();
    expect(pieces[1]!.matrices).toHaveLength(8);
  });

  it('fins = one instanced plate per fin, evenly pitched', () => {
    const pieces = primitivePieces(part('f', ENGINEERED.fins));
    expect(pieces[0]!.matrices).toHaveLength(9);
    const fins = part('f', ENGINEERED.fins).primitive;
    if (fins?.kind !== 'fins') throw new Error('fins expected');
    const xs = finOffsets(fins).map((o) => o[0]);
    expect(xs[1]! - xs[0]!).toBeCloseTo(0.05);
    expect(xs[0]! + xs[8]!).toBeCloseTo(0);
  });

  it('repeat multiplies instances (one draw call) and rotation is baked in', () => {
    const feet = part('feet', { kind: 'box', size: [0.2, 0.1, 1] }, { repeat: { count: 4, axis: [1, 0, 0], spacing: 0.8 } });
    const pieces = primitivePieces(feet);
    expect(pieces).toHaveLength(1);
    expect(pieces[0]!.matrices).toHaveLength(4);
    closeBox(piecesBox(pieces), partBounds(feet)!);
    const flanges = part('fl', ENGINEERED.flange, { repeat: { count: 3, axis: [1, 0, 0], spacing: 0.5 } });
    expect(primitivePieces(flanges)[1]!.matrices).toHaveLength(24);
    const turned = part('t', { kind: 'cylinder', size: [0.1, 0.1, 1], rotation: [0, 0, 90] });
    const b = piecesBox(primitivePieces(turned));
    expect(b.max.x).toBeCloseTo(0.5);
    expect(b.max.y).toBeCloseTo(0.1, 2);
  });

  it('tube bends every corner with the same radius', () => {
    const pts = filletPath([[0, 0, 0], [0, 1, 0], [1, 1, 0]], 0.2);
    // The corner (0,1,0) is rounded off: no sample comes closer than ~0.2·(√2−1).
    const corner = new Vector3(0, 1, 0);
    const nearest = Math.min(...pts.map((p) => p.distanceTo(corner)));
    expect(nearest).toBeGreaterThan(0.07);
    expect(nearest).toBeLessThan(0.1);
    expect(pts[0]!.toArray()).toEqual([0, 0, 0]);
    expect(pts[pts.length - 1]!.toArray()).toEqual([1, 1, 0]);
  });

  it('marks open shapes (no cut-face fill)', () => {
    expect(isClosedKind('tube')).toBe(false);
    expect(isClosedKind('plane')).toBe(false);
    expect(isClosedKind('vessel')).toBe(true);
  });

  it('model bounds cover all primitive parts', () => {
    const b = modelBounds([part('a', { kind: 'sphere', size: [1], at: [2, 0, 0] }), part('b', ENGINEERED.vessel)])!;
    expect(b.min[1]).toBeCloseTo(-1);
    expect(b.max[0]).toBeCloseTo(3);
    expect(b.max[1]).toBeCloseTo(1);
    expect(modelBounds([part('b', ENGINEERED.vessel)])!.min[1]).toBeCloseTo(-0.375);
  });
});

describe('panelHole', () => {
  it('rejects a hole that leaves the panel', () => {
    const ok = { kind: 'panelHole', size: [0.6, 0.4, 0.02], hole: { r: 0.15, at: [0, 0] }, at: [0, 0, 0], color: 'enamel' };
    expect(primitiveSchema.safeParse(ok).success).toBe(true);
    expect(primitiveSchema.safeParse({ ...ok, hole: { r: 0.15, at: [0.2, 0] } }).success).toBe(false);
    expect(primitiveSchema.safeParse({ ...ok, hole: { r: 0.21, at: [0, 0] } }).success).toBe(false);
  });

  it('is a closed slab with a round opening: no faces inside the hole', () => {
    const pt = part('front', ENGINEERED.panelHole);
    const g = primitivePieces(pt)[0]!.geometry;
    const pos = g.getAttribute('position');
    const [cx, cy] = ENGINEERED.panelHole.hole.at;
    const r = ENGINEERED.panelHole.hole.r;
    // Every triangle centroid lies outside the hole (or on its wall).
    for (let i = 0; i < pos.count; i += 3) {
      const x = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
      const y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
      expect(Math.hypot(x - cx, y - cy)).toBeGreaterThan(r * 0.99);
    }
    expect(isClosedKind('panelHole')).toBe(true);
    // Front face area = rectangle − circle (polygonal circle: within 0.5 %).
    let area = 0;
    const nz = g.getAttribute('normal');
    for (let i = 0; i < pos.count; i += 3) {
      if (nz.getZ(i) < 0.99) continue;
      const ax = pos.getX(i), ay = pos.getY(i);
      area += ((pos.getX(i + 1) - ax) * (pos.getY(i + 2) - ay) - (pos.getX(i + 2) - ax) * (pos.getY(i + 1) - ay)) / 2;
    }
    const [w, h] = ENGINEERED.panelHole.size;
    expect(area / (w * h - Math.PI * r * r)).toBeCloseTo(1, 2);
  });
});

describe('part flags', () => {
  it('only context parts may leave out the group', () => {
    const raw = { ...base, id: 'wall', primitive: { kind: 'box', size: [1, 1, 0.1], at: [0, 0, 0], color: 'plastic' } };
    const { group: _drop, ...noGroup } = raw;
    expect(partSchema.safeParse(noGroup).success).toBe(false);
    expect(partSchema.safeParse({ ...noGroup, context: true }).success).toBe(true);
    expect(partSchema.parse({ ...noGroup, context: true, explode: undefined }).explode.dist).toBe(0);
  });

  it('fins go up to 512 plates', () => {
    expect(primitiveSchema.safeParse({ ...ENGINEERED.fins, count: 512, at: [0, 0, 0], color: 'casing' }).success).toBe(true);
    expect(primitiveSchema.safeParse({ ...ENGINEERED.fins, count: 513, at: [0, 0, 0], color: 'casing' }).success).toBe(false);
  });
});

