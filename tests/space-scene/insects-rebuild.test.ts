/** Contracts of the topic-local insect relief assets, decoded from the files
 * actually shipped. These checks supplement the studio comparison sheets. */
import {readFileSync,statSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {partsFile} from '../../src/engines/space-scene/schema';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
for(const topic of ['grasshopper','mosquito'])describe(`${topic}: sculpted appendage contract`,()=>{
 const file=read(`src/content/topics/${topic}/data/parts.json`),before=read(`scripts/geo/${topic}/source-parts.json`);
 it('preserves the part namespace, teaching text, connections and all behaviours',()=>{
  expect(file.parts.map((p:{id:string})=>p.id)).toEqual(before.parts.map((p:{id:string})=>p.id));
  for(const key of ['animations','poses','flows','groups','presets','sim','spec','telemetry','views'])expect(JSON.stringify(file[key])).toEqual(JSON.stringify(before[key]));
  for(const p of file.parts){const b=before.parts.find((b:{id:string})=>b.id===p.id);for(const key of ['name','summary','detail','connects','shell','explode','group'])expect(p[key]).toEqual(b[key]);}
  expect(partsFile.safeParse(file).success).toBe(true);
 });
 it('ships all named nodes and real non-degenerate geometry in the budget',async()=>{
  await MeshoptDecoder.ready;const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public'+file.model);await doc.transform(dequantize());
  const nodes=new Map(doc.getRoot().listNodes().map(n=>[n.getName(),n]));const perf=read(`scripts/geo/${topic}/performance.json`);
  for(const p of partsFile.parse(file).parts.filter(p=>p.mesh)){
   const prim=nodes.get(p.mesh!)?.getMesh()?.listPrimitives()[0];expect(prim,p.mesh).toBeDefined();
   expect(perf.after.parts[p.id].triangles).toBe(prim!.getIndices()!.getCount()/3);
   const positions=prim!.getAttribute('POSITION')!,normals=prim!.getAttribute('NORMAL')!;
   expect(positions.getCount()).toBeGreaterThan(100);
   expect(Array.from(positions.getArray()!).every(Number.isFinite)).toBe(true);
   for(let i=0;i<normals.getCount();i+=31){const n=normals.getElement(i,[0,0,0]);expect(Math.hypot(...n)).toBeCloseTo(1,1);}
   expect(prim!.getMaterial()!.getExtras().atlasSurface).toBe(true);
  }
  expect(statSync('public'+file.model).size).toBeLessThan(1_500_000);
  expect(perf.after.maxAuthoredTriangles).toBeLessThan(350_000);
 });
});
it('grasshopper feet, tibial spines and antennae have the diagnostic counts',()=>{
 const audit=read('scripts/geo/grasshopper/mesh-audit.json').parts;
 for(const id of ['fore-legs','mid-legs','hind-tibiae']){
  const f=audit[id].features;expect(f.filter((x:{kind:string})=>x.kind==='tarsomere')).toHaveLength(3);expect(f.filter((x:{kind:string})=>x.kind==='claw')).toHaveLength(2);expect(f.filter((x:{kind:string})=>x.kind==='arolium')).toHaveLength(1);
 }
 const spines=audit['hind-tibiae'].features.filter((x:{kind:string})=>x.kind==='tibial-spine');for(const row of [0,1])expect(spines.filter((s:{row:number})=>s.row===row)).toHaveLength(10);
 expect(audit.antennae.features.filter((x:{kind:string})=>x.kind==='antennomere')).toHaveLength(27);
});
it('mosquito tarsi have five segments and paired claws; veins remain opaque',async()=>{
 const audit=read('scripts/geo/mosquito/mesh-audit.json').parts;
 for(const id of ['fore-legs','mid-legs','hind-legs']){const f=audit[id].features;expect(f.filter((x:{kind:string})=>x.kind==='tarsomere')).toHaveLength(10);expect(f.filter((x:{kind:string})=>x.kind==='claw')).toHaveLength(4);}
 await MeshoptDecoder.ready;const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public/models/mosquito.glb');await doc.transform(dequantize());
 for(const id of ['wings','wings-other','male-wings']){const p=doc.getRoot().listNodes().find(n=>n.getName()===id)!.getMesh()!.listPrimitives()[0]!;expect(p.getMaterial()!.getAlphaMode()).toBe('BLEND');const c=p.getAttribute('COLOR_0')!;expect(c.getType()).toBe('VEC4');let opaque=0,clear=0;for(let i=0;i<c.getCount();i++){const a=c.getElement(i,[0,0,0,0])[3]!;if(a>.99)opaque++;if(a<.4)clear++;}expect(opaque).toBeGreaterThan(100);expect(clear).toBeGreaterThan(100);const index=p.getIndices()!;let seenOpaque=false;for(let i=0;i<index.getCount();i+=3){const alpha=[0,1,2].map(k=>c.getElement(index.getScalar(i+k),[0,0,0,0])[3]!).reduce((a,b)=>a+b,0)/3;if(alpha>.99)seenOpaque=true;else expect(seenOpaque,`${id}: translucent faces precede opaque relief in the actual shipped draw order`).toBe(false);}}
});
