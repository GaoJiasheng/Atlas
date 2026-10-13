import { describe, expect, it } from 'vitest';
import { Matrix4, Vector3 } from 'three';
import { partSchema, partsFile } from '../../src/engines/space-scene/schema';
import { partCopies, primitiveShapeKey } from '../../src/engines/space-scene/lib/parts';
import { eachPieces, partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';

const rotor = { kind: 'blades', count: 7, radius: 0.037, hub: 0.013, chord: 0.03, pitch: 30, twist: 10, thickness: 0.002, rotation: [90, 0, 0], color: 'plastic' };
const base = { name: { en: 'Rotors' }, group: 'g', summary: { en: 's' }, detail: { en: 'd' } };
/** A 2 × 2 fan wall: the main rotor + one `extra` row, repeated twice along X. */
const wall = partSchema.parse({
  ...base,
  id: 'rotors',
  primitive: { ...rotor, at: [-0.1, 0.1, 0.4] },
  extra: [{ ...rotor, at: [-0.1, 0.2, 0.4] }],
  repeat: { count: 2, axis: [1, 0, 0], spacing: 0.1 },
});

describe('each copies (E1)', () => {
  it('lists every primitive in every repeat instance with its own centre', () => {
    const copies = partCopies(wall);
    expect(copies).toHaveLength(4);
    expect(copies.map((c) => [c.primitive, c.repeat])).toEqual([[0, 0], [0, 1], [1, 0], [1, 1]]);
    // Relative to the main `at`: repeat ±0.05 along X, the extra 0.1 higher.
    expect(copies[0]!.centre[0]).toBeCloseTo(-0.05);
    expect(copies[1]!.centre[0]).toBeCloseTo(0.05);
    expect(copies[3]!.centre[1]).toBeCloseTo(0.1);
  });

  it('carries a ring repeat round', () => {
    const ring = partSchema.parse({ ...base, id: 'r', primitive: { kind: 'box', size: [0.01, 0.01, 0.01], at: [0, 0, 0], color: 'steel' }, extra: [{ kind: 'box', size: [0.01, 0.01, 0.01], at: [0.2, 0, 0], color: 'steel' }], repeat: { count: 4, axis: [0, 1, 0], radius: 0.5 } });
    const copies = partCopies(ring);
    expect(copies).toHaveLength(8);
    for (const c of copies.filter((q) => q.primitive === 0)) expect(Math.hypot(c.centre[0], c.centre[2])).toBeCloseTo(0.5);
  });

  it('the shape key ignores position and turn, not size or material', () => {
    expect(primitiveShapeKey(wall.primitive!)).toBe(primitiveShapeKey(wall.extra![0]!));
    expect(primitiveShapeKey({ ...wall.primitive!, rotation: [0, 0, 0] } as never)).toBe(primitiveShapeKey(wall.primitive!));
    expect(primitiveShapeKey({ ...wall.primitive!, radius: 0.04 } as never)).not.toBe(primitiveShapeKey(wall.primitive!));
    expect(primitiveShapeKey({ ...wall.primitive!, color: 'steel' } as never)).not.toBe(primitiveShapeKey(wall.primitive!));
  });

  it('draws identical copies as one instanced piece, pivots on the copy centres', () => {
    const pieces = eachPieces(wall);
    expect(pieces).toHaveLength(1);
    const p = pieces[0]!;
    expect(p.matrices).toHaveLength(4);
    expect(p.pivots).toHaveLength(4);
    // Each rest instance sits on its pivot (the rotor is centred on its `at`).
    p.matrices!.forEach((m, i) => {
      const at = new Vector3().setFromMatrixPosition(m);
      expect(at.toArray().map((v, k) => v - p.pivots![i]![k]!).every((d) => Math.abs(d) < 1e-9)).toBe(true);
    });
    // Without `each` the same part bakes into one merged mesh.
    expect(partPieces(wall).every((q) => q.matrices === null)).toBe(true);
  });

  it('turning a copy about its pivot keeps it in place', () => {
    const p = eachPieces(wall)[0]!;
    const c = p.pivots![2]!;
    const spin = new Matrix4().makeRotationZ(1.2);
    const m = new Matrix4().makeTranslation(c[0], c[1], c[2]).multiply(spin).multiply(new Matrix4().makeTranslation(-c[0], -c[1], -c[2])).multiply(p.matrices![2]!);
    expect(new Vector3().setFromMatrixPosition(m).distanceTo(new Vector3(...c))).toBeLessThan(1e-9);
  });

  it('schema: each needs copies and no pivot', () => {
    const spin = { id: 'spin', target: 'rotors', kind: 'rotate', axis: [0, 0, 1], rpm: 40, each: true };
    const file = (anim: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
      partsFile.safeParse({
        parts: [{ ...base, id: 'rotors', primitive: { ...rotor, at: [0, 0, 0] }, ...extra }],
        groups: [{ id: 'g', name: { en: 'G' }, color: 'token:ink-2' }],
        animations: [anim],
      }).success;
    const repeat = { repeat: { count: 5, axis: [1, 0, 0], spacing: 0.09 } };
    expect(file(spin, repeat)).toBe(true);
    expect(file(spin)).toBe(false);
    expect(file({ ...spin, pivot: [0, 0, 0] }, repeat)).toBe(false);
    expect(file({ id: 'blink', target: 'rotors', kind: 'pulse', scale: 1.3, hz: 0.5, each: true }, repeat)).toBe(true);
  });
});
