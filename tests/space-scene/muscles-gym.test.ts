import { describe, it, expect } from 'vitest';
import { primitiveSchema } from '../../src/engines/space-scene/schema';
import { gymBarbellShape, gymDumbbellShape, gymBenchShape, gymRackShape, gymColumnShape, gymOutputPulleyShape } from '../../scripts/geo/kits/muscles-gym';
import { geometry } from '../../scripts/geo/muscles-core/build-gym';
const shapes={barbell:gymBarbellShape(),dumbbell:gymDumbbellShape(),bench:gymBenchShape(30),rack:gymRackShape(1.15),cable:gymColumnShape(1.25),pulley:gymOutputPulleyShape()};
describe('shared six-muscle gym reconstruction',()=>{
 it('uses engine-supported surfaces with bounded geometry',()=>{
  for(const shape of Object.values(shapes)){
   for(const p of [shape.primitive,...shape.extra??[]])expect(primitiveSchema.safeParse(p).success,JSON.stringify(p)).toBe(true);
   const g=geometry(shape),pos=g.getAttribute('position');expect(Array.from(pos.array).every(Number.isFinite)).toBe(true);
   expect((g.index?.count??pos.count)/3).toBeLessThan(70000);g.dispose();
  }
 });
 it('retains bar and dumbbell teaching dimensions and clear hand centres',()=>{
  const bar=geometry(shapes.barbell),bell=geometry(shapes.dumbbell);
  expect(bar.boundingBox!.max.x-bar.boundingBox!.min.x).toBeCloseTo(2.2,5);
  expect(bar.boundingBox!.max.y-bar.boundingBox!.min.y).toBeCloseTo(.3,5);
  expect(bell.boundingBox!.max.x-bell.boundingBox!.min.x).toBeCloseTo(.33,5);
  expect(bell.boundingBox!.max.y-bell.boundingBox!.min.y).toBeCloseTo(.14,5);
 });
 it('retains two rimmed plates, two open lock collars and sixteen separate stack plates',()=>{
  const bp=[shapes.barbell.primitive,...shapes.barbell.extra??[]];
  const plates=bp.filter(p=>p.kind==='lathe'&&p.profile.some(([r])=>r===.15));expect(plates).toHaveLength(2);
  const collars=bp.filter(p=>p.kind==='lathe'&&p.profile[0]![0]===.0251);expect(collars).toHaveLength(2);
  const stack=[shapes.cable.primitive,...shapes.cable.extra??[]].filter(p=>p.kind==='extrude'&&p.holes?.length===3);expect(stack).toHaveLength(16);
 });
 it('includes the complete output carriage factory in the candidate tower',()=>{
  const mounted=[shapes.pulley.primitive,...shapes.pulley.extra??[]];
  const candidate=[shapes.cable.primitive,...shapes.cable.extra??[]];
  for(const p of mounted){
   const expected={...p,at:[p.at[0],p.at[1]+1.25,p.at[2]]};
   expect(candidate.some(q=>JSON.stringify(q)===JSON.stringify(expected))).toBe(true);
  }
 });
 it('places bench shoes on the established contact floor in flat and inclined poses',()=>{
  for(const angle of [0,15,30,45,75]){const g=geometry(gymBenchShape(angle));expect(g.boundingBox!.min.y).toBeCloseTo(-.45,5);}
 });
});
