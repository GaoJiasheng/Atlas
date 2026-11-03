import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createEyeMeshes, polishEye } from '../../scripts/geo/eyes-and-ears/polish-eye';
import { partSchema } from '../../src/engines/space-scene/schema';

const original = () => JSON.parse(readFileSync(new URL('../../src/content/topics/eyes-and-ears/data/parts.json', import.meta.url), 'utf8'));

describe('eyes and ears: polished anatomical eye', () => {
  it('keeps part IDs, lens pivots and the two exact model pupil diameters', () => {
    const data = original();
    const ids = data.parts.map((p: {id:string}) => p.id);
    const poses = structuredClone(data.poses);
    polishEye(data.parts, data);
    expect(data.parts.map((p: {id:string}) => p.id)).toEqual(ids);
    expect(data.poses).toEqual(poses);
    for (const p of data.parts.filter((p: {id:string})=>['cornea','iris','lens','ciliary-ring','optic-nerve','iris-aperture-small','iris-aperture-large'].includes(p.id))) expect(()=>partSchema.parse(p)).not.toThrow();
    const meshes = createEyeMeshes();
    for (const [id, radius] of [['iris-aperture-small',.12],['iris-aperture-large',.24]] as const) {
      const position = meshes[id]!.getAttribute('position');
      let min = Infinity, max = 0;
      for (let i=0;i<position.count;i++) {
        const r = Math.hypot(position.getY(i),position.getZ(i));
        min = Math.min(min,r); max = Math.max(max,r);
      }
      expect(min).toBeCloseTo(radius,6);
      expect(max).toBeCloseTo(.5,6);
      meshes[id]!.dispose();
    }
    meshes['ciliary-ring']!.dispose();
  });

  it('has a rounded corneal dome and a visibly separate biconvex lens in both poses', () => {
    const data = original();
    polishEye(data.parts,data);
    const p = (id:string)=>data.parts.find((p:{id:string})=>p.id===id);
    const cornea = p('cornea').primitive.profile;
    expect(cornea.length).toBeGreaterThan(75);
    expect(cornea[0]).toEqual([0,-1.08]);
    expect(cornea[40]).toEqual([.56,-.73]);
    const lens = p('lens').primitive.profile;
    expect(lens.length).toBe(73);
    expect(lens[0]).toEqual([0,-.128]);
    expect(lens[36]).toEqual([.4,0]);
    expect(lens[72]).toEqual([0,.172]);
    // The anterior lens never intersects the iris in near focus (x scale 1.5).
    expect(-2.47 - .128 * 1.5).toBeGreaterThan(-2.675);
  });

  it('routes electrical markers through the off-axis nerve bundle rather than the visual axis', () => {
    const data = original();
    polishEye(data.parts,data);
    const nerve = data.parts.find((p:{id:string})=>p.id==='optic-nerve').primitive;
    const path = nerve.path.map((v:number[])=>v.map((n,i)=>n+nerve.at[i]));
    const flow = data.flows.find((f:{id:string})=>f.id==='optic-signal');
    for(let i=0;i<path.length;i++) for(let axis=0;axis<3;axis++) expect(path[i][axis]).toBeCloseTo(flow.path[i][axis],6);
    expect(Math.abs(flow.path[0][2])).toBeGreaterThan(.1);
    const meshes = createEyeMeshes();
    const total = Object.values(meshes).reduce((n,g)=>n+(g.index?.count ?? g.getAttribute('position').count)/3,0);
    expect(total).toBeLessThan(60000);
    for(const g of Object.values(meshes)) {
      const positions = g.getAttribute('position');
      expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
      g.dispose();
    }
  });
});
