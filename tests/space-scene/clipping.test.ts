import { describe, expect, it } from 'vitest';
import { DoubleSide, FrontSide, Plane, Vector3 } from 'three';
import { partSchema } from '../../src/engines/space-scene/schema';
import { clippingForPart, createPartMaterial, setPartClipping } from '../../src/engines/space-scene/stages/model3d/materials';

const label = { en: 'Bench', zh: '实验台' };
const raw = { id: 'bench', name: label, summary: label, detail: label, context: true, primitive: { kind: 'box', size: [1, 1, 1], at: [0, 0, 0], color: 'steel' } };

describe('part cutaway opt-out', () => {
  it('defaults to clipping and keeps clip:false in the content contract', () => {
    expect(partSchema.parse(raw).clip).toBe(true);
    expect(partSchema.parse({ ...raw, clip: false }).clip).toBe(false);
    expect(partSchema.safeParse({ ...raw, clip: 'false' }).success).toBe(false);
  });

  it('preserves a bilingual chain-only name alongside the full name', () => {
    const chainName = { en: 'Table', zh: '台' };
    const part = partSchema.parse({ ...raw, chainName });
    expect(part.chainName).toEqual(chainName);
    expect(part.name).toEqual(label);
    expect(partSchema.safeParse({ ...raw, chainName: 'Table' }).success).toBe(false);
  });

  it('keeps opted-out benches whole without cut fill, for default and named planes', () => {
    const part = partSchema.parse({ ...raw, clip: false });
    const pm = createPartMaterial();
    for (const planes of [[new Plane(new Vector3(-1, 0, 0), 0)], [new Plane(new Vector3(0, 0, -1), 0.2)]]) {
      setPartClipping(pm, clippingForPart(part, planes), true, false);
      expect(pm.material.clippingPlanes).toBeNull();
      expect(pm.material.side).toBe(FrontSide);
      expect(pm.uniforms.uCut.value).toBe(0);
    }
    pm.material.dispose();
  });

  it('keeps ordinary closed parts hatched and open membranes unfilled', () => {
    const pm = createPartMaterial();
    const planes = [new Plane(new Vector3(-1, 0, 0), 0)];
    setPartClipping(pm, clippingForPart({}, planes), true, false);
    expect(pm.material.clippingPlanes).toBe(planes);
    expect(pm.material.side).toBe(DoubleSide);
    expect(pm.uniforms.uCut.value).toBe(1);
    setPartClipping(pm, planes, false, true);
    expect(pm.uniforms.uCut.value).toBe(0);
    setPartClipping(pm, null, true, false);
    expect(pm.uniforms.uCut.value).toBe(0);
    expect(pm.material.side).toBe(FrontSide);
    pm.material.dispose();
  });
});
