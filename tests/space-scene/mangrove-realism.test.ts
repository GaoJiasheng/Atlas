import { describe, expect, it } from 'vitest';
import { branchingTree, pencilRootSystem, propRootSystem } from '../../scripts/geo/kits/tree';
import { buildParts } from '../../scripts/geo/mangrove-food-web/build-parts';
import { partsFileBase, partSchema } from '../../src/engines/space-scene/schema';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { partBounds, partPrimitives } from '../../src/engines/space-scene/lib/parts';
import { sweepCurve } from '../../src/engines/space-scene/lib/sweep';
import { Vector3 } from 'three';
const data=partsFileBase.parse(buildParts());
const by=(id:string)=>data.parts.find(p=>p.id===id)!;

describe('mangrove realism and geometry budget',()=>{
 it('keeps a single tree part with dense opposite leaves and smooth tapered branches',()=>{
  for(const id of ['api-tree','bakau-tree']) {
   const p=by(id),primitives=partPrimitives(p);
   const leaves=primitives.filter(q=>q.color==='tissue');
   expect(leaves.length*p.repeat!.count).toBe(336);
   expect(primitives.filter(q=>q.kind==='sweep'&&q.color==='wood')).toHaveLength(7);
   for(const q of primitives) {
    if(q.kind==='sweep') expect(q.radial).toBeGreaterThanOrEqual(q.color==='tissue'?6:8);
    if(q.kind==='lathe') expect(q.segments).toBeGreaterThanOrEqual(48);
   }
  }
 });
 it('has 72 slender pneumatophores attached to their shallow cable roots',()=>{
  const pencils=by('api-pencil'),cable=by('api-lateral').primitive!;
  expect(partPrimitives(pencils).length*pencils.repeat!.count).toBe(72);
  if(cable.kind!=='sweep')throw new Error('Expected shallow cable loft');
  const samples=sweepCurve(cable).getPoints(512);
  for(const root of partPrimitives(pencils)) {
   if(root.kind!=='sweep')throw new Error('Expected pencil loft');
   const foot=new Vector3(...root.path[0]!);
   expect(Math.min(...samples.map(p=>p.distanceTo(foot)))).toBeLessThan(.004);
   const radii=root.radius as number[];
   expect(Math.max(...radii)).toBeLessThanOrEqual(.003);
   const height=root.path.at(-1)![1]-root.path[0]![1];
   expect(height/(Math.max(...radii)*2)).toBeGreaterThan(18);
  }
 });
 it('curves prop roots outward before descending and attaches their forks',()=>{
  const p=by('bakau-prop'),roots=partPrimitives(p).filter(q=>q.kind==='sweep');
  expect(p.repeat!.count).toBe(6);
  expect(roots).toHaveLength(3);
  for(const root of roots) {
   if(root.kind!=='sweep')throw new Error('Expected prop-root loft');
   expect(root.path[1]![0]).toBeGreaterThan(root.path[0]![0]);
   expect(root.path.at(-1)![1]).toBeLessThan(0);
  }
 });
 it('retains four long toes on each heron foot and distinct walking-leg segments on both crabs',()=>{
  const heron=by('heron');
  const toes=heron.extra!.filter(p=>p.kind==='sweep'&&p.path.every(q=>p.at[1]+q[1]<.010));
  expect(toes).toHaveLength(8);
  for(const id of ['fiddler-crabs','tree-crabs']) {
   const crab=by(id);
   expect(crab.extra!.slice(0,8).every(p=>p.kind==='sweep'&&p.path.length===11)).toBe(true);
   expect(partPrimitives(crab).filter(p=>p.color==='eye')).toHaveLength(2);
  }
 });
 it('stays within the full-scene triangle and draw-piece budgets, with finite geometry',()=>{
  let triangles=0,calls=0;
  for(const part of data.parts) {
   const bounds=partBounds(part)!;
   expect([...bounds.min,...bounds.max].every(Number.isFinite)).toBe(true);
   for(const piece of partPieces(part)) {
    const g=piece.geometry;
    if(!piece.lines)triangles+=(g.index?.count??g.getAttribute('position').count)/3*(piece.matrices?.length??1);
    calls++;
    expect(Array.from(g.getAttribute('position').array).every(Number.isFinite)).toBe(true);
    g.dispose();
   }
  }
  expect(triangles).toBeLessThanOrEqual(350_000);
  expect(calls).toBeLessThan(100);
 });
 it('supports reuse at another location and size without adding runtime kinds',()=>{
  const models=[branchingTree([1,0,2],{height:1.8,spread:.6}),pencilRootSystem([1,0,2],{sectors:8,reach:.5}).pencils,propRootSystem([1,0,2],{spread:.5})];
  for(const geometry of models) expect(partSchema.safeParse({id:'tree-study',name:{en:'Tree',zh:'树'},summary:{en:'Tree study',zh:'树木模型'},detail:{en:'Procedural tree study.',zh:'程序化树木模型。'},group:'trees',...geometry}).success).toBe(true);
 });
});
