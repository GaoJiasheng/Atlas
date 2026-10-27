import { describe, expect, it } from 'vitest';
import { Euler, Matrix3, Matrix4, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import rawEarth from '../../src/content/topics/inside-the-earth/data/parts.json';
import { partSchema, partsFile, type Part, type Primitive } from '../../src/engines/space-scene/schema';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { anchorHalf, anchorOffset, anchorPoint } from '../../src/engines/space-scene/stages/model3d/shapes';

const profile: [number, number][] = [[1, -0.7], [1, 1.3], [0.8, 1.3], [0.8, -0.7], [1, -0.7]];
const base = { id: 'annular-section', name: { en: 'Section', zh: '剖面' }, group: 'sections', summary: { en: 'A section.', zh: '剖面。' }, detail: { en: 'A closed annular section.', zh: '闭合环形剖面。' } };
const parsePart = (input: unknown): Part => ({ ...partSchema.parse(input), summary: base.summary, detail: base.detail });
const lathe = (extra: Partial<Extract<Primitive, { kind: 'lathe' }>> = {}): Part => parsePart({
  ...base, primitive: { kind: 'lathe', profile, segments: 48, arc: 180, at: [2, -1, 3], color: 'plastic', ...extra },
});
function surfaceHit(part: Part, point: Vector3, normal: Vector3) {
  const meshes = partPieces(part).flatMap((piece) => (piece.matrices ?? [new Matrix4()]).map((matrix) => {
    const mesh = new Mesh(piece.geometry, new MeshBasicMaterial());
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(new Matrix4().makeTranslation(...part.primitive!.at).multiply(matrix));
    mesh.updateMatrixWorld(true);
    return mesh;
  }));
  const ray = new Raycaster(point.clone().addScaledVector(normal, 0.05), normal.clone().negate(), 0, 0.1);
  const hit = ray.intersectObjects(meshes, false)[0];
  expect(hit).toBeDefined();
  expect(hit!.point.distanceTo(point)).toBeLessThan(1e-6);
  meshes.forEach((m) => { m.geometry.dispose(); (m.material as MeshBasicMaterial).dispose(); });
}

describe('annular partial-lathe labels point to material, not the central hole', () => {
  it.each([90, 180, 270])('puts a %s-degree annular leader on an actual cut face', (arc) => {
    const part = lathe({ arc });
    const phi = (180 - arc / 2) * Math.PI / 180;
    const expected = new Vector3(0.9 * Math.sin(phi), 0.3, 0.9 * Math.cos(phi));
    expect(new Vector3(...anchorPoint(part)).distanceTo(expected)).toBeLessThan(1e-12);
    surfaceHit(part, expected.add(new Vector3(...part.primitive!.at)), new Vector3(-Math.cos(phi), 0, Math.sin(phi)));
  });

  it.each(['x', 'y', 'z'] as const)('applies nonuniform scale, %s mirror and XYZ rotation in geometry order', (mirror) => {
    const scale: [number, number, number] = [2, 3, 0.5], rotation: [number, number, number] = [20, -30, 40];
    const part = lathe({ scale, rotation, mirror });
    const reflected = scale.map((s, i) => s * (i === (mirror === 'x' ? 0 : mirror === 'y' ? 1 : 2) ? -1 : 1));
    const transform = new Matrix4().makeRotationFromEuler(new Euler(...rotation.map((a) => a * Math.PI / 180) as [number, number, number]));
    transform.scale(new Vector3(...reflected));
    const expected = new Vector3(0.9, 0.3, 0).applyMatrix4(transform);
    expect(new Vector3(...anchorPoint(part)).distanceTo(expected)).toBeLessThan(1e-12);
    const normal = new Vector3(0, 0, 1).applyMatrix3(new Matrix3().getNormalMatrix(transform)).normalize();
    surfaceHit(part, expected.add(new Vector3(...part.primitive!.at)), normal);
  });

  it('places each Earth shell leader inside its own radial interval, with the core unchanged', () => {
    const file = partsFile.parse(rawEarth);
    const radii = [1, 6341 / 6371, 3485 / 6371, 1221 / 6371];
    ['earth-crust', 'earth-mantle', 'earth-outer-core'].forEach((id, i) => {
      const part = file.parts.find((p) => p.id === id)!;
      const point = new Vector3(...anchorPoint(part));
      expect(point.length()).toBeGreaterThan(radii[i + 1]!);
      expect(point.length()).toBeLessThan(radii[i]!);
      expect(point.z).toBeCloseTo(0, 12);
      surfaceHit(part, point, new Vector3(0, 0, 1));
    });
    const core = file.parts.find((p) => p.id === 'earth-inner-core')!;
    expect(anchorPoint(core)).toEqual(anchorOffset(core));
  });

  it('keeps the original bounds, while extras do not pull the main-shell leader away', () => {
    const part = lathe();
    const withExtra: Part = { ...part, extra: [{ kind: 'box', size: [1, 1, 1], at: [6, 4, 2], color: 'plastic' }] };
    expect(anchorPoint(withExtra)).toEqual(anchorPoint(part));
    expect(anchorOffset(withExtra)).not.toEqual(anchorOffset(part));
    expect(anchorHalf(part)).toEqual([1, 1, 1]);
    expect(anchorOffset(part)).toEqual([0, 0.30000000000000004, 0]);
  });

  it('leaves whole, open, solid, repeated and unrelated primitives on the existing path', () => {
    for (const part of [lathe({ arc: undefined }), lathe({ profile: [[1, -0.7], [1, 1.3], [0.8, 1.3]] }), lathe({ profile: [[0, -0.7], [1, -0.7], [1, 1.3], [0, 1.3]] }), { ...lathe(), repeat: { count: 3, axis: [1, 0, 0] as [number, number, number], spacing: 3 } }, parsePart({ ...base, primitive: { kind: 'box', size: [1, 2, 3], at: [2, -1, 3], color: 'plastic' } })])
      expect(anchorPoint(part)).toEqual(anchorOffset(part));
  });
});
