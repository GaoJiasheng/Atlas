import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { partsFile } from '../../src/engines/space-scene/schema';
import { partBounds, primitiveLocalBox, repeatTransforms } from '../../src/engines/space-scene/lib/parts';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
const raw = JSON.parse(readFileSync('src/content/topics/container-port/data/parts.json','utf8'));
const model = partsFile.parse(raw);
const part = (id: string) => model.parts.find(p => p.id === id)!;

describe('container port authored model', () => {
 it('contains thirty selectable objects and two unselectable context surfaces', () => {
  expect(model.parts.filter(p=>!p.context)).toHaveLength(30);
  expect(model.parts.filter(p=>p.context).map(p=>p.id)).toEqual(['quay-context','water-context']);
  expect(model.parts.filter(p=>p.id==='working-box')).toHaveLength(1);
  expect(JSON.stringify(raw)).not.toMatch(/Engine fixture|示例：|diagonal-rope/);
 });
 it('keeps the hull entirely at sea and all four portal feet on the quay', () => {
  expect(partBounds(part('ship-hull'))!.max[2]).toBeLessThan(0);
  const legs = [part('portal').primitive!, ...part('portal').extra!].filter(p=>p.kind==='box'&&p.size[1]!>40);
  expect(legs).toHaveLength(4);
  for(const p of legs) if(p.kind==='box') expect(p.at[2]-p.size[2]!/2).toBeGreaterThanOrEqual(0);
  expect(partBounds(part('onward-ship'))!.max[2]).toBeLessThan(partBounds(part('ship-hull'))!.min[2]);
 });
 it('uses exact common-scale container extents and counts objects separately from TEU', () => {
  for(const [id,length] of [['sample-20',6.058],['sample-40',12.192]] as const){
   const p=part(id),b=primitiveLocalBox(p.primitive!);
   // Extrusion is rotated into world Y; profile width is world Z.
   expect(b.max[0]-b.min[0]).toBeCloseTo(length,8);
   expect(b.max[1]-b.min[1]).toBeCloseTo(2.438,8);
   expect(b.max[2]-b.min[2]).toBeCloseTo(2.591,8);
   expect(p.repeat?.count).toBe(4); expect(p.extra ?? []).toEqual([]);
  }
  const sim=model.sim!, outputs=evaluateSim(sim,resolveSimValues(sim,{}),[],undefined,model.parts);
  expect([outputs.boxes,outputs.teu]).toEqual([3,4]);
  expect(outputs.mass).toBeUndefined();
 });
 it('has four corner locks rather than a roof-centre hook', () => {
  const locks=part('twistlocks'),instances=repeatTransforms(locks.repeat);
  const axes=[locks.primitive!,...locks.extra!].filter(p=>p.kind==='cylinder');
  const points=instances.flatMap(i=>axes.map(p=>p.at.map((n,k)=>n+i.offset[k]!)));
  expect(points).toHaveLength(4);
  expect(new Set(points.map(p=>`${p[0]},${p[2]}`)).size).toBe(4);
  for(const p of points){expect(Math.abs(p[0]!)).toBeCloseTo(2.9);expect(Math.abs(p[2]!+18)).toBeCloseTo(1.1);}
  const ropes=model.sim!.bind.filter(b=>'span' in b && b.span);
  expect(ropes).toHaveLength(4);
  for(const b of ropes){if(!('span' in b)||!b.span)continue;expect(b.span.from.part).toBe('trolley');expect(b.span.to.part).toBe('spreader');}
 });
 it('keeps the working-box and its upper fittings together through every snapshot and replay', () => {
  for(const [name,pose] of Object.entries(raw.poses) as [string,Record<string,unknown>][]){
   if(!pose['working-box'])continue;
   expect(pose['corner-fittings'],name).toEqual(pose['working-box']);
  }
  for(const channel of ['cargo-dy','cargo-dz']){
   const binding=raw.sim.bind.find((b:{play?:{channel?:string}})=>b.play?.channel===channel);
   expect(binding.part).toEqual(['working-box','corner-fittings']);
   expect(binding.play.when).toEqual({control:'lift-live',is:true});
  }
  for(const name of ['transfer-on-carrier','transfer-at-yard','transfer-onward'])expect(raw.poses[name]['working-box']).toBeDefined();
  expect(part('working-box').primitive!.at).toEqual([0,11.2955,-18]);
  expect(part('spreader').primitive!.at).toEqual([0,12.891,-18]);
  expect(part('trolley').primitive!.at[1]).toBe(50);
 });
});
