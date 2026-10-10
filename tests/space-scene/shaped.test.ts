import { describe, expect, it } from 'vitest';
import { Box3, BufferGeometry, Matrix4, Vector3 } from 'three';
import { partSchema, primitiveSchema } from '../../src/engines/space-scene/schema';
import { mainBounds, partBounds, partMaterialSlots } from '../../src/engines/space-scene/lib/parts';
import { axialBladePoint, coilTubeHeights, grilleRings } from '../../src/engines/space-scene/lib/shaped';
import { isClosedPrimitive, partPieces, primitivePieces } from '../../src/engines/space-scene/stages/model3d/geometry';

const base = {
  name: { en: 'Part' },
  group: 'g',
  summary: { en: 'What it does.' },
  detail: { en: 'More.' },
  explode: { dir: [0, 1, 0], dist: 1 },
};
const part = (id: string, primitive: Record<string, unknown>, more: Record<string, unknown> = {}) =>
  partSchema.parse({ ...base, id, primitive: { at: [0, 0, 0], color: 'steel', ...primitive }, ...more });

const SHAPED = {
  lathe: { kind: 'lathe', profile: [[0, -0.15], [0.06, -0.15], [0.06, 0.1], [0.04, 0.14], [0, 0.15]], segments: 32 },
  extrude: {
    kind: 'extrude',
    shape: [[0, 0], [0.2, 0], [0.2, 0.1], [0.05, 0.12], [0, 0.08]],
    holes: [[[0.08, 0.03], [0.12, 0.03], [0.12, 0.06], [0.08, 0.06]]],
    depth: 0.3,
    bevel: 0.004,
  },
  curvedPanel: { kind: 'curvedPanel', radius: 0.3, angle: 50, height: 0.8, thickness: 0.006 },
  axial: { kind: 'blades', layout: 'axial', count: 3, radius: 0.2, hub: 0.04, chord: 0.17, twist: 12, sweep: 30, pitch: 32, thickness: 0.004 },
  barrel: { kind: 'blades', layout: 'barrel', count: 35, radius: 0.05, hub: 0.039, chord: 0.014, thickness: 0.0012, length: 0.6, discs: 9 },
  coil: { kind: 'coilBank', rows: 2, cols: 8, pitch: 0.021, tubeRadius: 0.0036, length: 0.6, finPitch: 0.005, finDepth: 0.036 },
  coilL: {
    kind: 'coilBank',
    rows: 2,
    cols: 20,
    pitch: 0.021,
    tubeRadius: 0.0036,
    length: 0.5,
    finPitch: 0.005,
    finDepth: 0.036,
    shape: 'L',
    legs: [0.5, 0.2],
    corner: 0.04,
  },
  rings: { kind: 'grille', style: 'rings', radius: 0.2, count: 9, spokes: 8, bar: 0.0018 },
  slats: { kind: 'grille', style: 'slats', size: [0.7, 0.1, 0.006], count: 40, bar: 0.004 },
} as const;

function piecesBox(pieces: { geometry: BufferGeometry; matrices: Matrix4[] | null }[]): Box3 {
  const box = new Box3();
  for (const p of pieces) {
    p.geometry.computeBoundingBox();
    for (const m of p.matrices ?? [new Matrix4()]) box.union(p.geometry.boundingBox!.clone().applyMatrix4(m));
  }
  return box;
}

/** Share of triangles whose winding agrees with their stored normals (faces point out). */
function windingAgreement(g: BufferGeometry): number {
  const pos = g.getAttribute('position');
  const nor = g.getAttribute('normal');
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const n = new Vector3();
  let ok = 0;
  let total = 0;
  const count = g.index ? g.index.count : pos.count;
  const idx = (i: number) => (g.index ? g.index.getX(i) : i);
  for (let i = 0; i + 2 < count; i += 3) {
    a.fromBufferAttribute(pos, idx(i));
    b.fromBufferAttribute(pos, idx(i + 1));
    c.fromBufferAttribute(pos, idx(i + 2));
    const face = b.sub(a).cross(c.sub(a));
    if (face.lengthSq() < 1e-18) continue;
    n.fromBufferAttribute(nor, idx(i))
      .add(new Vector3().fromBufferAttribute(nor, idx(i + 1)))
      .add(new Vector3().fromBufferAttribute(nor, idx(i + 2)));
    total++;
    if (face.dot(n) > 0) ok++;
  }
  return total ? ok / total : 1;
}

describe('shaped kinds: schema', () => {
  it('accepts every shaped kind with sane parameters', () => {
    for (const p of Object.values(SHAPED)) expect(primitiveSchema.safeParse({ ...p, at: [0, 0, 0], color: 'casing' }).success).toBe(true);
  });
  it('rejects impossible parameters', () => {
    const bad = [
      { ...SHAPED.lathe, profile: [[0, 0], [0, 1]] },
      { ...SHAPED.extrude, bevel: 0.2 },
      { ...SHAPED.extrude, shape: [[0, 0], [1, 0]] },
      { ...SHAPED.curvedPanel, thickness: 0.4 },
      { ...SHAPED.axial, hub: 0.3 },
      { ...SHAPED.barrel, length: undefined },
      { ...SHAPED.coil, tubeRadius: 0.011 },
      { ...SHAPED.coilL, legs: undefined },
      { ...SHAPED.rings, radius: undefined },
      { ...SHAPED.slats, size: undefined },
      { ...SHAPED.coil, mirror: 'w' },
    ];
    for (const p of bad) expect(primitiveSchema.safeParse({ ...p, at: [0, 0, 0], color: 'steel' }).success).toBe(false);
  });
  it('`extra` needs a main primitive', () => {
    const extra = [{ kind: 'box', size: [0.1, 0.1, 0.1], at: [0, 0.2, 0], color: 'rubber' }];
    const main = { kind: 'box', size: [1, 1, 1], at: [0, 0, 0], color: 'steel' };
    expect(partSchema.safeParse({ ...base, id: 'a', primitive: main, extra }).success).toBe(true);
    expect(partSchema.safeParse({ ...base, id: 'a', mesh: 'A', extra }).success).toBe(false);
  });
});

describe('shaped kinds: geometry', () => {
  for (const [name, p] of Object.entries(SHAPED)) {
    it(`${name}: fills the bounds the HUD assumes, faces point out`, () => {
      const pt = part(name.toLowerCase(), p as Record<string, unknown>);
      const pieces = primitivePieces(pt);
      expect(pieces.length).toBeGreaterThan(0);
      const box = piecesBox(pieces);
      const b = partBounds(pt)!;
      [box.min.x, box.min.y, box.min.z].forEach((v, i) => expect(v).toBeGreaterThanOrEqual(b.min[i]! - 0.004));
      [box.max.x, box.max.y, box.max.z].forEach((v, i) => expect(v).toBeLessThanOrEqual(b.max[i]! + 0.004));
      [box.min.x, box.min.y, box.min.z].forEach((v, i) => expect(v).toBeLessThan(b.min[i]! + 0.02));
      // A rotor's bounds are the whole swept disc; three blades need not reach every side of it.
      if (name !== 'axial') [box.max.x, box.max.y, box.max.z].forEach((v, i) => expect(v).toBeGreaterThan(b.max[i]! - 0.02));
      for (const piece of pieces) expect(windingAgreement(piece.geometry)).toBeGreaterThan(0.97);
    });
  }

  it('a lathe is closed only when its profile starts and ends on the axis', () => {
    expect(isClosedPrimitive(part('a', SHAPED.lathe).primitive!)).toBe(true);
    expect(isClosedPrimitive(part('b', { ...SHAPED.lathe, profile: [[0.05, 0], [0.05, 0.1]] }).primitive!)).toBe(false);
    expect(isClosedPrimitive(part('c', SHAPED.coil).primitive!)).toBe(false);
  });

  it('mirror reflects the shape and keeps faces pointing out', () => {
    const plain = part('p', { kind: 'extrude', shape: [[0, 0], [0.2, 0], [0.2, 0.1]], depth: 0.05 });
    const flipped = part('m', { kind: 'extrude', shape: [[0, 0], [0.2, 0], [0.2, 0.1]], depth: 0.05, mirror: 'x' });
    const a = piecesBox(primitivePieces(plain));
    const b = piecesBox(primitivePieces(flipped));
    expect(b.min.x).toBeCloseTo(-a.max.x);
    expect(b.max.x).toBeCloseTo(-a.min.x);
    expect(partBounds(flipped)!.min[0]).toBeCloseTo(-0.2);
    expect(windingAgreement(primitivePieces(flipped)[0]!.geometry)).toBeGreaterThan(0.97);
  });

  it('a coil bank has copper tubes and bends and aluminium fins; `only` keeps just the bends', () => {
    const coil = part('c', { ...SHAPED.coil, color: 'casing' });
    expect(partMaterialSlots(coil)).toEqual([{ color: 'casing' }, { color: 'copper' }]);
    expect(partPieces(coil).map((p) => p.slot)).toEqual([0, 1]);
    const bends = part('h', { ...SHAPED.coil, bends: 'only', color: 'casing' });
    expect(partMaterialSlots(bends)).toEqual([{ color: 'copper' }]);
    expect(partPieces(bends)).toHaveLength(1);
    // Staggered rows: odd rows sit half a pitch from even ones.
    const p = coil.primitive!;
    if (p.kind !== 'coilBank') throw new Error('coil expected');
    expect(coilTubeHeights(p, 1)[0]! - coilTubeHeights(p, 0)[0]!).toBeCloseTo(p.pitch / 2);
  });

  it('an L bank wraps round to +Z at −X', () => {
    const b = partBounds(part('l', SHAPED.coilL))!;
    expect(b.min[0]).toBeLessThan(-0.25 - 0.04);
    expect(b.max[2]).toBeGreaterThan(0.04 + 0.2);
  });

  it('axial blades sweep forward; ring grilles space rings out to the radius', () => {
    const p = part('f', SHAPED.axial).primitive!;
    if (p.kind !== 'blades') throw new Error('blades expected');
    const root = axialBladePoint(p, 0, 0);
    const tip = axialBladePoint(p, 1, 0);
    expect(Math.atan2(tip[2], tip[0])).toBeGreaterThan(Math.atan2(root[2], root[0]) + 0.3);
    expect(Math.hypot(tip[0], tip[2])).toBeCloseTo(0.2);
    const g = part('g', SHAPED.rings).primitive!;
    if (g.kind !== 'grille') throw new Error('grille expected');
    const rings = grilleRings(g);
    expect(rings).toHaveLength(9);
    expect(rings[8]).toBeCloseTo(0.2);
  });
});

describe('parts with extra primitives', () => {
  const compressor = part(
    'compressor',
    { ...SHAPED.lathe, color: 'powder' },
    {
      extra: [
        { kind: 'box', size: [0.05, 0.03, 0.04], at: [0, 0.17, 0], color: 'plastic' },
        { kind: 'box', size: [0.16, 0.006, 0.03], at: [0, -0.155, 0], color: 'powder' },
      ],
    },
  );

  it('merges pieces per material: one draw call per material', () => {
    const pieces = partPieces(compressor);
    expect(pieces).toHaveLength(2);
    expect(pieces.every((p) => p.matrices === null)).toBe(true);
    expect(partMaterialSlots(compressor).map((s) => s.color)).toEqual(['powder', 'plastic']);
  });

  it('bounds cover the extras; the label still targets the main primitive', () => {
    const all = partBounds(compressor)!;
    expect(all.max[1]).toBeCloseTo(0.185);
    expect(all.max[0]).toBeCloseTo(0.08);
    expect(mainBounds(compressor)!.max[1]).toBeCloseTo(0.15);
    expect(piecesBox(partPieces(compressor)).max.y).toBeCloseTo(0.185, 3);
  });

  it('a repeat repeats the extras about the part centre', () => {
    const pair = part(
      'valves',
      { kind: 'box', size: [0.02, 0.02, 0.02], at: [1, 0, 0] },
      { repeat: { count: 2, axis: [0, 1, 0], spacing: 0.1 }, extra: [{ kind: 'box', size: [0.01, 0.01, 0.01], at: [1.05, 0, 0], color: 'brass' }] },
    );
    const box = piecesBox(partPieces(pair));
    // Pieces are in the part frame: centred on the main `at`.
    expect(box.max.x).toBeCloseTo(0.055);
    expect(box.max.y).toBeCloseTo(0.06);
    expect(partBounds(pair)!.max[1]).toBeCloseTo(0.06);
  });
});
