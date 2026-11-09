import fs from 'node:fs';
import {Document,NodeIO,Logger} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color';
import {hardwareModels} from './hardware-model';
export async function hardwareDocument(iteration=2){
 const doc=new Document().setLogger(new Logger(Logger.Verbosity.ERROR)),buffer=doc.createBuffer(),scene=doc.createScene('forces-hardware');
 doc.getRoot().getAsset().copyright='Atlas original procedural model, MIT. Photo references are development evidence only; no third-party mesh or image textures.';
 for(const {id,geometry:g,family} of hardwareModels(iteration)){
  const look=resolveMaterialLook(family,{},'paper','#ffffff');const m=doc.createMaterial(id).setBaseColorFactor([1,1,1,1]).setMetallicFactor(look.metalness).setRoughnessFactor(id==='paper-crumpled'?.90:look.roughness).setExtras({atlasSurface:true}),p=doc.createPrimitive().setMaterial(m);
  for(const [a,s,t]of [['position','POSITION','VEC3'],['normal','NORMAL','VEC3'],['color','COLOR_0','VEC3']] as const)p.setAttribute(s,doc.createAccessor().setType(t).setArray(new Float32Array(g.getAttribute(a).array)).setBuffer(buffer));
  const count=g.getAttribute('position').count;p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(Array.from({length:count},(_,i)=>i))).setBuffer(buffer));
  scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(p)).setExtras({closed:id!=='paper-crumpled'}));g.dispose();
 }
 return doc;
}
if(import.meta.url===`file://${process.argv[1]}`){
 const iteration=Number(process.argv[2]??2),doc=await hardwareDocument(iteration);await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:15,quantizeNormal:10,quantizeColor:8}));
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});const out=process.argv[3]??'scripts/geo/forces/evidence/forces-hardware.glb';await io.write(out,doc);console.log(out,fs.statSync(out).size,'bytes');
}
