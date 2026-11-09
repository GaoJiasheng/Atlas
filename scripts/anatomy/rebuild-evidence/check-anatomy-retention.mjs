/** Ensure later skin-only rebuilds retain the exact independently audited anatomy.
 * Decodes executing GLB skinning; never infers retention from builder settings.
 */
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {MeshoptDecoder} from 'meshoptimizer';
import {Vector3,Matrix4} from 'three';
const req=createRequire(import.meta.url),{ALL_EXTENSIONS}=await import(pathToFileURL(req.resolve('@gltf-transform/extensions',{paths:[dirname(req.resolve('@gltf-transform/functions'))]})));
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}),rows=[];
for(const topic of ['arms','back','chest','core','legs','shoulders']){
 const file=`public/models/muscles-${topic}.glb`,bytes=await fs.readFile(file),doc=await io.readBinary(bytes);
 const audited=JSON.parse(await fs.readFile(`scripts/anatomy/cache/rebuild-${topic}-audit-input.json`,'utf8')).candidate;
 let meshes=0,maxDeltaM=0;
 for(const node of doc.getRoot().listNodes()){
  if(!node.getMesh()||node.getName().startsWith('skin-'))continue;
  const before=audited[node.getName()];if(!before)throw Error('Unaudited anatomy '+node.getName());
  const p=node.getMesh().listPrimitives()[0],pa=p.getAttribute('POSITION'),wa=p.getAttribute('WEIGHTS_0'),ja=p.getAttribute('JOINTS_0'),skin=node.getSkin(),joints=skin.listJoints(),ibm=skin.getInverseBindMatrices();
  const matrices=joints.map((j,i)=>{const b=[];ibm.getElement(i,b);return new Matrix4().fromArray(j.getWorldMatrix()).multiply(new Matrix4().fromArray(b));});
  const ix=p.getIndices().getArray();if(ix.length!==before.faces.length||ix.some((x,i)=>x!==before.faces[i]))throw Error('Changed audited topology '+node.getName());
  if(pa.getCount()!==before.points.length)throw Error('Changed audited vertices '+node.getName());
  for(let i=0;i<pa.getCount();i++){
   const P=[],W=[],J=[];pa.getElement(i,P);wa.getElement(i,W);ja.getElement(i,J);const q=new Vector3();
   for(let k=0;k<4;k++)if(W[k])q.add(new Vector3().fromArray(P).applyMatrix4(matrices[J[k]]).multiplyScalar(W[k]));
   maxDeltaM=Math.max(maxDeltaM,q.distanceTo(new Vector3(...before.points[i])));
  }
  meshes++;
 }
 if(meshes!==Object.keys(audited).length||maxDeltaM>1e-10)throw Error(`${topic}: anatomy changed after independent audit (${maxDeltaM}m); rerun rebuild-audit.mjs`);
 const row={topic,assetSha256:createHash('sha256').update(bytes).digest('hex'),meshes,maxDecodedBindPositionDeltaM:maxDeltaM,topology:'exact same decoded indices'};rows.push(row);console.log(JSON.stringify(row));
}
await fs.writeFile('scripts/anatomy/rebuild-evidence/anatomy-retention.json',JSON.stringify({method:'Actual final compressed GLBs independently decoded and skinned to bind space; exact topology and vertices compared against the input meshes used by surface-audit.json.',rows},null,2)+'\n');
