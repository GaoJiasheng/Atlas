/** Rebuild acceptance checks use the authored data AND engine geometry/look resolver. */
import fs from 'node:fs';
import { describe, it, expect } from 'vitest';
import { Box3, Matrix4, Vector3 } from 'three';
import { partsFile, type Part } from '../../src/engines/space-scene/schema';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { partMaterialSlots } from '../../src/engines/space-scene/lib/parts';
import { resolveMaterialLook } from '../../src/engines/space-scene/lib/color';
const data=partsFile.parse(JSON.parse(fs.readFileSync('src/content/topics/materials/data/parts.json','utf8')));
const part=(id:string)=>data.parts.find(p=>p.id===id)!;
function bounds(p:Part) {
 const b=new Box3();
 for(const g of partPieces(p)){g.geometry.computeBoundingBox();for(const m of g.matrices??[new Matrix4()])b.union(g.geometry.boundingBox!.clone().applyMatrix4(m));g.geometry.dispose();}
 return b.translate(new Vector3(...p.primitive!.at));
}
describe('materials polished fixture: contacts survive actual engine tessellation',()=>{
 it('a cast open G frame replaces the wooden clamp cube, leaving a true throat',()=>{
  const p=part('bend-clamp');expect(p.primitive!.kind).toBe('extrude');
  const prim=p.primitive as {shape:number[][];scale?:number[]};const k=prim.scale?.[0]??1;const shape=prim.shape.map(([x,y])=>[x!*k,y!*k]);
  // The two lips have separated ends; the entire outline must bend back
  // around an opening instead of tracing a rectangle or a solid wedge.
  expect(Math.min(...shape.map(v=>v[1]!))).toBeLessThan(-.06);
  expect(Math.max(...shape.map(v=>v[0]!))).toBeGreaterThan(.055);
  expect(shape.filter(v=>v[0]!<.002).some(v=>v[1]!>.001)).toBe(true);
  expect(shape.filter(v=>v[0]!<.002).some(v=>v[1]!<-.04)).toBe(true);
 });
 it('the fixed jaw contacts the 2 mm strip and the swivel pad contacts the ledge underside',()=>{
  const p=part('bend-clamp'),ps=p.extra!;
  const strip=bounds(part('bend-wood'));
  const jaw=ps.find(q=>q.kind==='bevelBox'&&q.size[0]===.020)!;
  const ledge=ps.find(q=>q.kind==='bevelBox'&&q.size[0]===.140)!;
  const pad=ps.find(q=>q.kind==='lathe'&&q.profile.some(v=>v[0]===.009&&v[1]===.006))!;
  const one=(q:typeof jaw)=>bounds({...p,primitive:q,extra:[]});
  expect(one(jaw).min.y).toBeCloseTo(strip.max.y,5);
  expect(one(pad).max.y).toBeCloseTo(one(ledge).min.y,5);
  expect(one(jaw).min.x).toBeLessThan(strip.min.x+.05);
  expect(one(jaw).max.x).toBeLessThan(strip.min.x+.05);
 });
 it('threads are real helical relief, with a continuous steel spindle',()=>{
  const p=part('bend-clamp');const helix=p.extra!.find(q=>q.kind==='coil');expect(helix).toBeDefined();
  if(helix?.kind!=='coil')throw new Error('No screw thread');
  expect(helix.length/helix.turns).toBeCloseTo(.002,5);
  expect(helix.radius).toBeGreaterThan(helix.wire);
 });
 it('the wall cabinet stays visibly wooden: it is the corner\'s wood example',()=>{
  const p=part('wall-cabinet');expect(p.primitive!.color).toBe('wood');
  for(const q of p.extra!.filter(q=>q.kind==='bevelBox'))expect(q.color).toBe('wood');
 });
 it('laminate on the base cupboard resolves to an opaque smooth finish in both themes',()=>{
  for(const id of ['counter'])for(const slot of partMaterialSlots(part(id))){
   expect(slot.color).not.toBe('wood');
   for(const theme of ['paper','cinema'] as const){const look=resolveMaterialLook(slot.color,{'drawing-paper':'#e9e4d8'},theme,slot.tint);expect(look.finish).not.toBe('wood');expect(look.opacity).toBe(1);}
  }
 });
 it('the physical cast frame stays graphite when the text theme reverses',()=>{
  const p=part('bend-clamp');
  for(const slot of partMaterialSlots(p).filter(s=>s.color==='powder'))for(const theme of ['paper','cinema'] as const){
   const look=resolveMaterialLook(slot.color,{'ink-2':theme==='paper'?'#555047':'#b9b4a8'},theme,slot.tint);
   const rgb=look.color.slice(1).match(/../g)!.map(h=>parseInt(h,16));
   expect(Math.max(...rgb)).toBeLessThan(80);
  }
 });
 it('each hinge has a connected inside linkage that clears the solid carcass side',()=>{
  const p=part('cabinet-hinges');
  const primitives=[p.primitive!,...p.extra!];
  const links=primitives.filter(q=>q.kind==='bevelBox'&&q.size[1]===.010&&q.size[2]===.010);
  expect(links).toHaveLength(6);
  const one=(q:typeof links[number])=>({...p,primitive:q,extra:[]});
  for(const y of [.63,1.02]) {
   const chain=links.filter(q=>Math.abs(q.at[1]-y)<.00001);
   const plate=primitives.find(q=>q.kind==='bevelBox'&&q.size[1]===.032&&Math.abs(q.at[1]-y)<.00001)!;
   const cup=primitives.find(q=>q.kind==='lathe'&&q.profile.some(v=>v[0]===.0175)&&Math.abs(q.at[1]-y)<.00001)!;
   expect(bounds(one(plate)).intersectsBox(bounds(one(chain[0]!)))).toBe(true);
   expect(bounds(one(chain[0]!)).intersectsBox(bounds(one(chain[1]!)))).toBe(true);
   expect(bounds(one(chain[1]!)).intersectsBox(bounds(one(chain[2]!)))).toBe(true);
   expect(bounds(one(chain[2]!)).intersectsBox(bounds(one(cup)))).toBe(true);
  }
  for(const link of links)for(const piece of partPieces(one(link))) {
   const positions=piece.geometry.getAttribute('position');
   for(let i=0;i<positions.count;i++) {
    const v=new Vector3().fromBufferAttribute(positions,i).add(new Vector3(...link.at));
    const buried=v.x> -1.416+.00001&&v.x< -1.4-.00001&&v.z< -.05-.00001&&v.z> -.35+.00001;
    expect(buried,`hinge arm vertex ${v.toArray()} inside cabinet wall`).toBe(false);
   }
   piece.geometry.dispose();
  }
 });
 it('the two hinges connect cup and carcass with real arms and retain their existing identity',()=>{
  const p=part('cabinet-hinges');expect(p.connects).toContain('wall-cabinet');
  const cups=[p.primitive!,...p.extra!].filter(q=>q.kind==='lathe'&&q.profile.some(v=>v[0]===.0175));expect(cups).toHaveLength(2);
  expect(cups.map(q=>q.at[1]).sort()).toEqual([.63,1.02]);
 });
});
