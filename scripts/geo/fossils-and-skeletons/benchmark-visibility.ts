/** Repeatable CPU cost of the actual label-occlusion rays around an evidence
 * visibility transition. No browser/GL timing is inferred from these numbers.
 * pnpm tsx scripts/geo/fossils-and-skeletons/benchmark-visibility.ts
 */
import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import { BufferAttribute,BufferGeometry,Matrix4,Mesh,MeshBasicMaterial,Raycaster,Vector3 } from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { mergeBaked,partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
const base=process.argv[2]??'/private/tmp/fossils-polish-baseline';
await MeshoptDecoder.ready;
async function scene(baseline:boolean){
 const file=partsFile.parse(JSON.parse(fs.readFileSync(baseline?`${base}/parts.json`:'src/content/topics/fossils-and-skeletons/data/parts.json','utf8')));
 const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(baseline?`${base}/model.glb`:`public${file.model}`);await doc.transform(dequantize());
 const meshes:Mesh[]=[];
 for(const part of file.parts.filter(p=>p.group==='skeleton')){
  let g:BufferGeometry;
  const node=doc.getRoot().listNodes().find(n=>n.getName()===part.mesh);
  if(node){const prim=node.getMesh()!.listPrimitives()[0]!;g=new BufferGeometry();const pos=prim.getAttribute('POSITION')!;g.setAttribute('position',new BufferAttribute(new Float32Array(pos.getArray()!),3));g.setIndex(new BufferAttribute(new Uint32Array(prim.getIndices()!.getArray()!),1));g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));}
  else{const pieces=partPieces(part);g=mergeBaked(pieces.map(p=>({geometry:p.geometry,matrices:p.matrices??[new Matrix4()]})));g.translate(...part.primitive!.at);}
  const m=new Mesh(g,new MeshBasicMaterial());m.name=part.id;m.updateMatrixWorld();g.computeBoundingSphere();meshes.push(m);
 }
 return meshes;
}
const before=await scene(true),after=await scene(false);
const camera=new Vector3(0,3,15),rays=Array.from({length:160},(_,i)=>new Vector3(-3.8+(i%20)*.4,.15+Math.floor(i/20)*.36,0));
const hidden=new Set(['sk-neck','sk-ribs','sk-arm-r','sk-tail-base','sk-tail-tip']);
function batch(meshes:Mesh[]){const ray=new Raycaster(),dir=new Vector3();let hits=0;
 for(const direct of [false,true,false]){const active=meshes.filter(m=>!direct||!hidden.has(m.name));for(const p of rays){dir.subVectors(p,camera);ray.far=dir.length()-.02;ray.set(camera,dir.normalize());hits+=ray.intersectObjects(active,false).length;}}
 return hits;
}
// Alternate A/B to reduce load/thermal bias. Warm up first.
batch(before);batch(after);const times={before:[] as number[],after:[] as number[]};
for(let i=0;i<7;i++)for(const key of i%2?['after','before']as const:['before','after']as const){const t=performance.now();batch(key==='before'?before:after);times[key].push(performance.now()-t);}
const median=(a:number[])=>a.sort((x,y)=>x-y)[Math.floor(a.length/2)]!;
const triangles=(ms:Mesh[])=>ms.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.getAttribute('position').count)/3,0);
const result={rays:480,cycles:7,triangles:{before:triangles(before),after:triangles(after)},medianMs:{before:median(times.before),after:median(times.after)},samplesMs:times};
fs.mkdirSync('/private/tmp/fossils-polish-2026-11-03',{recursive:true});fs.writeFileSync('/private/tmp/fossils-polish-2026-11-03/visibility-cpu.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
