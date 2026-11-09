import{readFileSync}from'node:fs';
import{describe,it,expect}from'vitest';
import{partsFile}from'../src/engines/space-scene/schema';
import{partPieces}from'../src/engines/space-scene/stages/model3d/geometry';
const file=partsFile.parse(JSON.parse(readFileSync('src/content/topics/aircon/data/parts.json','utf8'))),p=file.parts.find(p=>p.id==='inverter-board')!;
describe('inverter physical assembly',()=>{
 it('keeps every original part and preserves the appliance apart from the required partition port',()=>{
  const before=partsFile.parse(JSON.parse(readFileSync('scripts/geo/aircon/evidence/before-parts.json','utf8')));
  expect(file.parts.map(p=>p.id)).toEqual(before.parts.map(p=>p.id));expect(file.parts.filter(p=>!['inverter-board','partition'].includes(p.id))).toEqual(before.parts.filter(p=>!['inverter-board','partition'].includes(p.id)));
  const wall=file.parts.find(p=>p.id==='partition')!;expect(wall.primitive?.kind).toBe('extrude');if(wall.primitive?.kind!=='extrude')throw Error('Partition must remain a folded sheet');expect(wall.primitive.holes).toHaveLength(1);expect(wall.extra?.[0]?.at).toEqual([.742,.29,0]);expect(file.animations).toEqual(before.animations);
 });
 it('supports the populated board and joins the power module to the airflow heatsink',()=>{
  expect(p.primitive?.kind).toBe('extrude');if(p.primitive?.kind!=='extrude')throw Error('PCB substrate missing');expect(p.primitive.holes).toHaveLength(5);
  const base=p.extra![0]!,fins=p.extra![1]!,module=p.extra![2]!;if(base.kind!=='bevelBox'||fins.kind!=='fins'||module.kind!=='bevelBox')throw Error('Thermal path missing');
  expect(base.at[1]-base.size[1]/2).toBeCloseTo(fins.at[1]+fins.size[1]/2,6);
  expect(base.at[1]+base.size[1]/2).toBeCloseTo(module.at[1]-module.size[1]/2,6);
  expect(base.at[1]+base.size[1]/2).toBeLessThanOrEqual(p.primitive.at[1]-.0008+1e-9);
  expect(base.at[0]-base.size[0]/2+(base.bevel??0)).toBeLessThanOrEqual(fins.at[0]-(fins.count-1)*fins.gap/2-fins.size[2]/2);
  expect(fins.at[0]).toBeLessThan(.742);expect(base.at[0]+base.size[0]/2).toBeGreaterThan(.788);
 });
 it('seats cans, passive packages, headers and angled IC leads on the actual PCB surface',()=>{
  const top=p.primitive!.at[1]+.0008;
  const cans=p.extra!.filter(q=>q.kind==='lathe'&&q.color==='powder');expect(cans).toHaveLength(3);for(const can of cans)expect(can.at[1]).toBeCloseTo(top,6);
  for(const q of p.extra!){if(q.kind==='fins'&&q.count===12){const a=10*Math.PI/180,low=q.at[1]-.0035*Math.sin(a)-.0005*Math.cos(a);expect(Math.abs(low-top)).toBeLessThan(.0003);}if(q.kind==='fins'&&q.count===3)expect(q.at[1]-q.size[1]/2).toBeCloseTo(top,6);}
  const core=p.extra!.find(q=>q.kind==='extrude'&&q.holes?.length===2)!;expect(core.at[1]-.017).toBeCloseTo(top,6);
 });
 it('retains real holes, capacitor vent scores and an on-screen budget below 350k',()=>{
  expect(p.extra!.filter(q=>q.kind==='extrude'&&q.holes?.some(h=>h.length===12))).toHaveLength(3);
  expect(p.extra!.some(q=>q.kind==='extrude'&&q.holes?.length===5)).toBe(true);
  const triangles=file.parts.reduce((s,p)=>s+partPieces(p).reduce((t,q)=>t+(q.geometry.index?.count??q.geometry.getAttribute('position').count)/3*(q.matrices?.length??1),0),0);expect(triangles).toBeLessThan(350000);
 });
});
