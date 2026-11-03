import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { partSchema } from '../../src/engines/space-scene/schema';
import { createSlotMaterials } from '../../src/engines/space-scene/stages/model3d/PartNode';
import { primitiveShape } from '../../src/engines/space-scene/stages/model3d/shapes';
import { stylePartMaterial, type PartStyle } from '../../src/engines/space-scene/stages/model3d/materials';
import { resolveMaterialLook } from '../../src/engines/space-scene/lib/color';

describe('mesh geometry colours and loading envelopes', () => {
  it('enables vertex colours only for the slot with a colour attribute, including implicit slot zero', () => {
    const plain = new BufferGeometry();
    const colored = new BufferGeometry().setAttribute('color', new Float32BufferAttribute([.2, .4, .6], 3));
    for (const [pieces, expected] of [
      [[{ geometry: colored, matrices: null }, { geometry: plain, matrices: null, slot: 1 }], [true, false]],
      [[{ geometry: plain, matrices: null }, { geometry: colored, matrices: null, slot: 1 }], [false, true]],
      [[{ geometry: plain, matrices: null }], [false, false]],
    ] as const) {
      const materials = createSlotMaterials(pieces, 2);
      expect(materials.map(pm => pm.material.vertexColors)).toEqual(expected);
      materials.forEach(pm => pm.material.dispose());
    }
    plain.dispose(); colored.dispose();
  });

  it('drops the soft-tissue self-light on a vertex-coloured slot only, so its colours are not washed out', () => {
    const colored = new BufferGeometry().setAttribute('color', new Float32BufferAttribute([.2, .4, .6], 3));
    const [plain, painted] = [createSlotMaterials([{ geometry: new BufferGeometry(), matrices: null }], 1)[0]!, createSlotMaterials([{ geometry: colored, matrices: null }], 1)[0]!];
    const kit = { roughness: () => null, normal: () => null, albedo: () => null } as unknown as PartStyle['kit'];
    const style = (tint?: string): PartStyle => ({ look: resolveMaterialLook('tissue', {}, 'paper', tint), kit, signal: '#000000', cold: '#000000', cut: '#000000', ink: '#000000', rim: 0, tint: 0, hatchPx: 4 });
    stylePartMaterial(plain, style());
    stylePartMaterial(painted, style('#ffffff'));
    expect(plain.material.emissive.r).toBeGreaterThan(0);
    expect(painted.material.emissive.getHex()).toBe(0);
    [plain, painted].forEach(pm => pm.material.dispose()); colored.dispose();
  });

  it('hides a mesh part rest envelope even with each/bend, while native geometry still renders', () => {
    const text = { en: 'Specimen', zh: '标本' };
    const part = { ...partSchema.parse({ id: 'specimen', group: 'specimens', name: text, summary: text, detail: text,
      primitive: { kind: 'box', size: [1, 2, 3], at: [0, 0, 0], color: 'tissue' } }), summary: text, detail: text };
    expect(primitiveShape({ ...part, mesh: 'sculpture' })).toBeNull();
    expect(primitiveShape({ ...part, mesh: 'sculpture' }, true, 0)).toBeNull();
    const shape = primitiveShape(part)!;
    expect(shape.pieces.length).toBeGreaterThan(0);
    expect(shape.position).toEqual([0, 0, 0]);
    shape.pieces.forEach(piece => piece.geometry.dispose());
  });

  it('leaves every other shipped topic outside both changed renderer paths', () => {
    const root = 'src/content/topics';
    for (const topic of readdirSync(root).filter(name => name !== 'living-things')) {
      const path = `${root}/${topic}/data/parts.json`;
      if (!existsSync(path)) continue;
      const file = JSON.parse(readFileSync(path, 'utf8'));
      for (const part of file.parts) expect(!!part.mesh && !!part.primitive, `${topic}/${part.id}`).toBe(false);
      if (!file.model) continue;
      const bytes = readFileSync(`public${file.model}`);
      const gltf = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
      for (const mesh of gltf.meshes ?? []) for (const primitive of mesh.primitives)
        expect(primitive.attributes.COLOR_0, `${topic}/${mesh.name}`).toBeUndefined();
    }
  });
});
