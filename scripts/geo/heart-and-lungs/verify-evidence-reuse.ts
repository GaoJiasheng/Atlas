/** Prove which unchanged decoded surfaces permit retaining earlier CPU views. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {NodeIO,type Node} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const currentFile=JSON.parse(fs.readFileSync('src/content/topics/heart-and-lungs/data/parts.json','utf8'));
const current=await io.read('public'+currentFile.model);
function signature(node:Node){
 const hash=createHash('sha256');hash.update(JSON.stringify(node.getWorldMatrix()));
 for(const p of node.getMesh()!.listPrimitives()){
  for(const a of [...p.listAttributes(),p.getIndices()!]){const data=a.getArray()!;hash.update(Buffer.from(data.buffer,data.byteOffset,data.byteLength));}
  const m=p.getMaterial()!;hash.update(JSON.stringify([m.getBaseColorFactor(),m.getRoughnessFactor(),m.getMetallicFactor(),m.getExtras()]));
 }
 return hash.digest('hex');
}
const proof=[];
for(const [id,round] of [['gills',14],['plant-specimen',13]] as const){
 const source='scripts/geo/heart-and-lungs/accepted-sculpt.glb',old=await io.read(source);
 const before=signature(old.getRoot().listNodes().find(n=>n.getName()===id)!),after=signature(current.getRoot().listNodes().find(n=>n.getName()===id)!);
 if(before!==after)throw new Error(`Reused ${id} evidence differs from the actual bound mesh`);
 proof.push({id,source,sourceRound:round,boundModel:currentFile.model,decodedSurfaceSha256:after,identical:true});
}
fs.writeFileSync('/tmp/atlas-heart-round3/accepted-surface-preservation.json',JSON.stringify(proof,null,2)+'\n');
console.log('Verified identical decoded gill/plant geometry, world transforms, vertex colours and surface materials.');
