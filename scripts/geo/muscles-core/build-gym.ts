/** Compile the shared kit through the actual engine primitive pipeline. */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Document, NodeIO, VertexLayout } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { type Part } from '../../../src/engines/space-scene/schema';
import * as old from '../../../src/engines/space-scene/lib/equipment';
import { gymBarbellShape, gymDumbbellShape, gymBenchShape, gymRackShape, gymColumnShape, gymOutputPulleyShape, type GymShape } from '../kits/muscles-gym';
export const candidates={barbell:gymBarbellShape(),dumbbell:gymDumbbellShape(),bench:gymBenchShape(30),rack:gymRackShape(1.15),cable:gymColumnShape(1.25),pulley:gymOutputPulleyShape()};
export const baselines={barbell:old.barbellShape(),dumbbell:old.dumbbellShape(),bench:old.benchShape(30),rack:old.rackShape(1.15),cable:old.columnShape(0),pulley:{primitive:{...old.columnShape(0).extra![0]!,at:[0,0,0] as [number,number,number]}}};
export function geometry(shape:GymShape):BufferGeometry {
 const pieces=partPieces({primitive:shape.primitive,extra:shape.extra} as Part).filter(p=>!p.lines);
 const gs=pieces.map(p=>{if(p.matrices?.length===1)p.geometry.applyMatrix4(p.matrices[0]!);return p.geometry;});
 const out=gs.length===1?gs[0]!:mergeGeometries(gs,false)!;
 out.translate(...shape.primitive.at);out.computeBoundingBox();
 return out;
}
export async function buildGym(){
 await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
 const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('muscles-gym-kit');
 doc.getRoot().getAsset().copyright='Atlas original procedural geometry, repository MIT license. Reference photographs are separate research evidence, not texture/mesh inputs.';
 const material=doc.createMaterial('technical-plate-neutral').setBaseColorFactor([.251,.227,.188,1]).setRoughnessFactor(.68).setMetallicFactor(0);
 const metrics:Record<string,unknown>={};
 for(const [id,shape]of Object.entries(candidates)){
  const g=geometry(shape),prim=doc.createPrimitive().setMaterial(material);
  for(const [a,s]of [['position','POSITION'],['normal','NORMAL']] as const)prim.setAttribute(s,doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.getAttribute(a).array)).setBuffer(buffer));
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(g.index?new Uint32Array(g.index.array):Uint32Array.from({length:g.getAttribute('position').count},(_,i)=>i)).setBuffer(buffer));
  const mesh=doc.createMesh(id).addPrimitive(prim),node=doc.createNode(id).setMesh(mesh).setExtras({closed:true,units:'metres',runtimeIntegration:'Engine patch required; asset currently a review artifact'});
  scene.addChild(node);
  const baseline=id in baselines?geometry(baselines[id as keyof typeof baselines]):null;
  metrics[id]={beforeTriangles:baseline?(baseline.index?.count??baseline.getAttribute('position').count)/3:0,afterTriangles:(g.index?.count??g.getAttribute('position').count)/3,beforeDraws:baseline?1:0,afterDraws:1,bounds:{min:g.boundingBox!.min.toArray(),max:g.boundingBox!.max.toArray()}};
 }
 await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:10}));
 const io=new NodeIO().setVertexLayout(VertexLayout.SEPARATE).registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
 const bytes=await io.writeBinary(doc);if(bytes.length>1500000)throw Error(`Kit over budget: ${bytes.length}`);
 fs.writeFileSync('public/models/muscles-core-gym.glb',bytes);
 const runtimeModels=Object.fromEntries(Object.entries({...candidates,cable:gymColumnShape(0)}).map(([id,shape])=>{const g=geometry(shape),before=geometry(baselines[id as keyof typeof baselines]);return [id,{beforeTriangles:(before.index?.count??before.getAttribute('position').count)/3,afterTriangles:(g.index?.count??g.getAttribute('position').count)/3,beforeDraws:1,afterDraws:1}]}));
 fs.writeFileSync('scripts/anatomy/rebuild-evidence/gym/metrics.json',JSON.stringify({beforeGLBBytes:0,afterGLBBytes:bytes.length,models:metrics,runtimeModels,scope:'Review cable mesh includes output carriage; runtime uses cable frame plus separate output carriage. Runtime equipment remains old procedural geometry until patch applied.'},null,2));
 console.log(bytes.length,metrics);
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)await buildGym();
