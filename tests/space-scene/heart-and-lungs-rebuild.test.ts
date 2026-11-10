/** Regressions for the actual runtime model binding and inherited anatomy. */
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {MeshoptDecoder} from 'meshoptimizer';
import {Mesh,PropertyBinding} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {gltfGroupShape} from '../../src/engines/space-scene/stages/model3d/gltfGroupShape';
import type {PartShape} from '../../src/engines/space-scene/stages/model3d/PartNode';
import {unpack} from '../../scripts/geo/heart-and-lungs/append-glb';
import {partsFile} from '../../src/engines/space-scene/schema';
import {partPieces} from '../../src/engines/space-scene/stages/model3d/geometry';
import {auditFishMouth} from '../../scripts/geo/heart-and-lungs/check-mouth';
import {auditClosedGills} from '../../scripts/geo/heart-and-lungs/check-closed';
import {auditFishCrown} from '../../scripts/geo/heart-and-lungs/check-seam';
const baseline=JSON.parse(readFileSync('scripts/geo/heart-and-lungs/baseline-parts.json','utf8'));
const file=partsFile.parse(JSON.parse(readFileSync('src/content/topics/heart-and-lungs/data/parts.json','utf8')));
const original=unpack(readFileSync('public/models/heart-and-lungs.glb'));
const shipped=unpack(readFileSync(`public${file.model}`));
const ids=['fish-body','gills','gill-cover','plant-specimen'];
type Glb=ReturnType<typeof unpack>;
function accessorPayload(glb:Glb,id:number){
 const {bufferView,byteOffset=0,...layout}=glb.json.accessors[id];
 const view=glb.json.bufferViews[bufferView],x=view.extensions.EXT_meshopt_compression;
 const encoded=glb.bin.subarray(x.byteOffset??0,(x.byteOffset??0)+x.byteLength),decoded=Buffer.alloc(x.count*x.byteStride);
 MeshoptDecoder.decodeGltfBuffer(decoded,x.count,x.byteStride,encoded,x.mode,x.filter);
 return {layout:{...layout,byteOffset},viewLayout:{...view,buffer:undefined,byteOffset:undefined,extensions:undefined},decoded:decoded.subarray(byteOffset,byteOffset+layout.count*x.byteStride),encoded,encoding:{...x,buffer:undefined,byteOffset:undefined}};
}
describe('heart-and-lungs museum bench',()=>{
 it('encloses every accepted gill vertex with the cover closed',async()=>{const r=await auditClosedGills();expect(r.vertices).toBe(19590);expect(r.outsideCount,JSON.stringify(r.outside)).toBe(0);expect(r.minimumClearance).toBeGreaterThan(0);});
 it('closes the displaced dorsal meridian in the decoded renderer geometry',async()=>{
  const report=await auditFishCrown();
  const node=shipped.json.nodes.find((n:any)=>n.name==='fish-body');
  const primitives=shipped.json.meshes[node.mesh].primitives;
  expect(report.meshes).toBe(primitives.length);
  expect(report.triangles).toBe(primitives.reduce((count:number,p:any)=>count+shipped.json.accessors[p.indices].count/3,0));
  expect(report.hits).toHaveLength(12);
  for(const hit of report.hits){expect(hit.y,JSON.stringify(hit)).not.toBeNull();expect(hit.y!).toBeGreaterThan(.215);}
 });
 it('preserves accepted gill/plant geometry, all compressed streams and renderer bindings while dropping retired fish geometry',async()=>{
  await MeshoptDecoder.ready;
  const accepted=unpack(readFileSync('scripts/geo/heart-and-lungs/accepted-sculpt.glb'));
  expect(shipped.json.nodes.some((n:any)=>n.name==='round1-fish-body'||n.name==='round1-gill-cover')).toBe(false);
  const prior=JSON.parse(readFileSync('scripts/geo/heart-and-lungs/accepted-parts.json','utf8'));
  for(const id of ['gills','plant-specimen']){
   expect(file.parts.find(p=>p.id===id)).toEqual(partsFile.parse(prior).parts.find(p=>p.id===id));
   const a=accepted.json.nodes.find((n:any)=>n.name===id),b=shipped.json.nodes.find((n:any)=>n.name===id);
   expect({...b,mesh:undefined}).toEqual({...a,mesh:undefined});
   const am=accepted.json.meshes[a.mesh],bm=shipped.json.meshes[b.mesh];
   expect({...bm,primitives:undefined}).toEqual({...am,primitives:undefined});expect(bm.primitives).toHaveLength(am.primitives.length);
   for(const [i,p]of am.primitives.entries()){
    const q=bm.primitives[i];
    expect({...q,attributes:undefined,indices:undefined,material:undefined}).toEqual({...p,attributes:undefined,indices:undefined,material:undefined});
    expect(shipped.json.materials[q.material]).toEqual(accepted.json.materials[p.material]);
    expect(Object.keys(q.attributes).sort()).toEqual(Object.keys(p.attributes).sort());
    for(const semantic of ['indices',...Object.keys(p.attributes)]){
     const ai=semantic==='indices'?p.indices:p.attributes[semantic],bi=semantic==='indices'?q.indices:q.attributes[semantic];
     const before=accessorPayload(accepted,ai),after=accessorPayload(shipped,bi);
     expect(after.layout).toEqual(before.layout);expect(after.decoded.equals(before.decoded),`${id} ${semantic} decoded bytes`).toBe(true);
     expect(after.viewLayout).toEqual(before.viewLayout);
     expect(after.encoding).toEqual(before.encoding);
     expect(after.encoded.equals(before.encoded),`${id} ${semantic} compressed source bytes`).toBe(true);
    }
   }
  }
 });
 it('binds the fish packet within 600 KB and gives it separate opaque and transparent surface draws',()=>{
  const packet=readFileSync('scripts/geo/heart-and-lungs/fish-packet.glb');
  expect(packet.byteLength).toBeLessThanOrEqual(600000);
  const fish=unpack(packet);
  expect(shipped.bin.subarray(shipped.bin.length-fish.bin.length).equals(fish.bin)).toBe(true);
  expect(fish.json.meshes.reduce((n:number,m:any)=>n+m.primitives.length,0)).toBe(10);
  for(const id of ['fish-body','gill-cover']){
   const node=shipped.json.nodes.find((n:any)=>n.name===id);
   for(const p of shipped.json.meshes[node.mesh].primitives){
    expect(shipped.json.accessors[p.indices].count).toBeGreaterThan(0);
    expect(shipped.json.accessors[p.indices].count%3).toBe(0);
    expect(shipped.json.accessors[p.attributes.POSITION].count).toBe(shipped.json.accessors[p.attributes.NORMAL].count);
   }
  }
 });
 it('passes every incoming baked water path and its actual particle spread through the mouth',async()=>{
  const report=await auditFishMouth(file),flow=file.flows.find(f=>f.id==='gill-water')!;
  const node=shipped.json.nodes.find((n:any)=>n.name==='fish-body'),primitives=shipped.json.meshes[node.mesh].primitives;
  expect(report.meshes).toBe(primitives.length);
  expect(report.triangles).toBe(primitives.reduce((count:number,p:any)=>count+shipped.json.accessors[p.indices].count/3,0));
  expect(report.spread).toBe(flow.spread);
  expect(report.paths.map(p=>p.id)).toEqual(['water-1','water-2','water-3','water-4']);
  for(const path of report.paths){
   expect(path.segments,path.id+' must exercise the entry interval').toBeGreaterThan(0);
   expect(path.centerlineHits,path.id+' crosses the decoded oral surface').toEqual([]);
   expect(path.collisions,path.id+' particle-spread capsule crosses the decoded oral surface').toEqual([]);
  }
 },30000);
 it('binds the replacement nodes in the model the renderer actually loads',()=>{
  expect(file.model).toBe('/models/heart-and-lungs-bench.glb');
  for(const id of ids){const part=file.parts.find(p=>p.id===id)!;expect(part.mesh).toBe(id);expect(part.primitive).toBeUndefined();expect(shipped.json.nodes.some((n:any)=>n.name===id&&n.mesh!==undefined)).toBe(true);}
 });
 it('preserves every decoded mesh through the opt-in group loader',async()=>{
  const bytes=readFileSync(`public${file.model}`);
  const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(Uint8Array.from(bytes).buffer,'');
  try{
   // The engine loader's own opt-in group helper.
   for(const part of file.parts){
    if(!part.mesh)continue;
    const root=gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(part.mesh));
    expect(root,`${part.id} renderer-bound node`).toBeDefined();
    const meshes:Mesh[]=[];root!.traverse(node=>{if(node instanceof Mesh)meshes.push(node);});
    expect(meshes).toHaveLength(part.id==='fish-body'?9:1);
    if(part.id==='fish-body'){expect(root!.userData.atlasSurfaceGroup).toBe(true);const base={pieces:[],box:{min:[0,0,0],max:[0,0,0]}} as unknown as PartShape;const shape=gltfGroupShape(root!,meshes[0]!,base);expect(shape.pieces).toHaveLength(9);expect(shape.pieces.reduce((n,p)=>n+p.geometry.index!.count/3,0)).toBe(meshes.reduce((n,m)=>n+m.geometry.index!.count/3,0));for(const p of shape.pieces)p.geometry.dispose();}
    const authored=shipped.json.nodes.find((node:any)=>node.name===part.mesh),primitives=shipped.json.meshes[authored.mesh].primitives;
    const triangles=primitives.reduce((count:number,p:any)=>count+shipped.json.accessors[p.indices].count/3,0);
    expect(meshes.reduce((n,m)=>n+m.geometry.index!.count/3,0),`${part.id} geometry reaching PartNode`).toBe(triangles);
   }
  }finally{
   gltf.scene.traverse(node=>{if(node instanceof Mesh){node.geometry.dispose();for(const material of Array.isArray(node.material)?node.material:[node.material])material.dispose();}});
  }
 });
 it('retains every accepted anatomy accessor, node and byte of binary payload',()=>{
  for(const key of ['accessors','nodes','meshes','bufferViews','materials'])expect(shipped.json[key].slice(0,original.json[key].length)).toEqual(original.json[key]);
  expect(shipped.bin.subarray(0,original.bin.length).equals(original.bin)).toBe(true);
 });
 it('preserves teaching ids, flow parameters, gill routes, flap pivot and poses while refitting the inlet',()=>{
  // The air sample was redrawn later as rows of ten (topic test 'the rows of ten'); every other id is unchanged.
  const notAir=(p:{group?:string})=>p.group!=='air-sample';
  expect(file.parts.filter(notAir).map(p=>p.id)).toEqual(partsFile.parse(baseline).parts.filter(notAir).map(p=>p.id));
  const priorFlows=partsFile.parse(baseline).flows;
  for(const flow of file.flows){
   const prior=priorFlows.find(f=>f.id===flow.id)!;
   if(flow.id!=='gill-water'){expect(flow).toEqual(prior);continue;}
   expect({...flow,paths:undefined,path:undefined}).toEqual({...prior,paths:undefined,path:undefined});
   expect(flow.paths).toHaveLength(4);
   for(const [i,path] of flow.paths!.entries()){
    const old=prior.paths![i]!;expect(path.id).toBe(old.id);expect(path.path.slice(5)).toEqual(old.path.slice(4));
    expect(path.path).toHaveLength(old.path.length+1);
    expect(path.path[3]![0]).toBe(old.path[3]![0]);expect(path.path[4]![0]).toBe(.9975);
    for(let k=0;k<3;k++){
     expect(path.path[k]![0]).toBe(old.path[k]![0]);expect(path.path[k]![2]).toBe(old.path[k]![2]);
     expect(Math.abs(path.path[k]![1]-.2)).toBeLessThanOrEqual(.004);
    }
   }
  }
  expect(file.animations).toEqual(partsFile.parse(baseline).animations);
  expect(file.poses).toEqual(partsFile.parse(baseline).poses);
 });
 it('keeps the actual all-layer renderer geometry below 350k triangles',()=>{
  let triangles=0;
  for(const part of file.parts){
   if(part.mesh){const node=shipped.json.nodes.find((n:any)=>n.name===part.mesh);for(const p of shipped.json.meshes[node.mesh].primitives)triangles+=shipped.json.accessors[p.indices].count/3;}
   else for(const piece of partPieces(part)){if(!piece.lines)triangles+=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);piece.geometry.dispose();}
  }
  expect(triangles).toBeLessThanOrEqual(350000);
  expect(shipped.bin.length-original.bin.length).toBeLessThan(1500000);
 });
 it('leaves every accepted non-rebuild part and its tessellation unchanged',()=>{
  const prior=partsFile.parse(baseline);
  for(const part of file.parts)if(![...ids,'fish-tank'].includes(part.id)&&part.group!=='air-sample')expect(part).toEqual(prior.parts.find(p=>p.id===part.id));
 });
 it('contains thin reflective surfaces with smooth normals and no photograph textures',()=>{
  for(const id of ids){const node=shipped.json.nodes.find((n:any)=>n.name===id),p=shipped.json.meshes[node.mesh].primitives[0];expect(p.attributes.NORMAL).toBeDefined();expect(p.attributes.COLOR_0).toBeDefined();const m=shipped.json.materials[p.material];expect(m.extras.atlasSurface).toBe(true);expect(m.pbrMetallicRoughness.baseColorTexture).toBeUndefined();}
 });
});
