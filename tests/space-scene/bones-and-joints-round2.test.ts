import {readModel,meshGeometry} from '../../scripts/geo/bones-and-joints/read-model';
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {Mesh,MeshBasicMaterial,Raycaster,Vector3} from 'three';
import {partsFile} from '../../src/engines/space-scene/schema';
import {resolveAllPartDisplays} from '../../src/engines/space-scene/lib/visibility';
const data=JSON.parse(readFileSync('src/content/topics/bones-and-joints/data/parts.json','utf8'));
const file=partsFile.parse(data),decoded=await readModel('public'+file.model!);
function mesh(name:string){
 const node=decoded.getRoot().listNodes().find(n=>n.getName()===name)!;
 const g=meshGeometry(node,false);g.computeVertexNormals();const m=new Mesh(g,new MeshBasicMaterial());m.updateMatrixWorld();return m;
}
const rays=(m:Mesh,origin:number[],direction:number[])=>new Raycaster(new Vector3(...origin),new Vector3(...direction).normalize()).intersectObject(m);
describe('bones and joints round 2',()=>{
 it('makes a cartilage volume spanning the neck, with an outward cell-column cut face',()=>{
  const m=mesh('polished-growth-disc');m.geometry.computeBoundingBox();const b=m.geometry.boundingBox!;
  expect(b.max.z-b.min.z).toBeGreaterThan(.025);
  expect(b.max.x-b.min.x).toBeGreaterThan(.035);
  expect(b.max.y-b.min.y).toBeGreaterThan(.035);
  for(const t of [-.012,0,.012]){
   const h=rays(m,[-.040+Math.SQRT1_2*t,.202+Math.SQRT1_2*t,.05],[0,0,-1]);
   expect(h.length).toBeGreaterThan(0);expect(h[0]!.point.z).toBeGreaterThan(.0015);
   expect(h[0]!.face!.normal.z).toBeGreaterThan(.5);
  }
  // An oblique ray also meets the broad posterior disc surface.
  expect(rays(m,[-.075,.237,-.014],[1,-1,0]).length).toBeGreaterThan(0);
 });
 it('attaches the renewal region to the cortex instead of floating in the marrow window',()=>{
  const patch=mesh('polished-remodel-region'),cortex=mesh('polished-cortex');
  for(const [x,y] of [[.005,0],[.006,.025],[.008,.05]]){
   const origin=[x!,y!,.08],a=rays(patch,origin,[0,0,-1]),b=rays(cortex,origin,[0,0,-1]);
   expect(a.length).toBeGreaterThan(0);expect(b.length).toBeGreaterThan(0);
   expect(a[0]!.point.z-b[0]!.point.z).toBeGreaterThan(0);
   expect(a[0]!.point.z-b[0]!.point.z).toBeLessThan(.0015);
  }
 });
 it('raises the new bone proud of the curved outer cortex, not inside it',()=>{
  const patch=mesh('polished-remodel-region'),cortex=mesh('polished-cortex');
  for(const y of [0,.026,.05])for(const deg of [90,120,150]){
   const a=deg*Math.PI/180,origin=[Math.sin(a)*.1,y,-.008+Math.cos(a)*.1],dir=[-Math.sin(a),0,-Math.cos(a)];
   const p=rays(patch,origin,dir),c=rays(cortex,origin,dir);
   expect(p.length).toBeGreaterThan(0);
   expect(c[0]!.distance-p[0]!.distance).toBeGreaterThan(.0005);
   expect(c[0]!.distance-p[0]!.distance).toBeLessThan(.003);
  }
 });
 it('keeps every repair colour skin with its stage for each manual SOLO selection',()=>{
  for(const id of ['clot','soft','hard','remodelled']){
   const owner=`repair-stage-${id}`;
   const d=resolveAllPartDisplays(file.parts,{view:'assembled',part:owner,solo:owner,layers:['bone-section']});
   for(const skin of file.parts.filter(p=>p.displayWith))expect(d.get(skin.id)).toEqual({...d.get(skin.displayWith!),selected:false,selectable:false});
  }
 });
 it('mirrors an opted-in skin owner with bilateral parts',()=>{
  const input=structuredClone(data);
  for(const id of ['repair-stage-clot','repair-clot-skin'])input.parts.find((p:{id:string})=>p.id===id).bilateral=true;
  const paired=partsFile.parse(input),skin=paired.parts.find(p=>p.id==='repair-clot-skin-r')!;
  expect(skin.displayWith).toBe('repair-stage-clot-r');
  const d=resolveAllPartDisplays(paired.parts,{view:'assembled',part:null,layers:['bone-section'],hidden:['repair-stage-clot']});
  expect(d.get(skin.id)!.hidden).toBe(true);
 });
 it.each(['missing','repair-clot-skin'])('rejects invalid display owners %s',owner=>{
  const invalid=structuredClone(data);invalid.parts.find((p:{id:string})=>p.id==='repair-soft-skin').displayWith=owner;
  expect(partsFile.safeParse(invalid).success).toBe(false);
 });
 it('rejects displayWith on a selectable part',()=>{
  const invalid=structuredClone(data);invalid.parts.find((p:{id:string})=>p.id==='bone-cortex').displayWith='repair-stage-clot';
  expect(partsFile.safeParse(invalid).success).toBe(false);
 });
});
