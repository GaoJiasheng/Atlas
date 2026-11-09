/** Exact GLTFLoader/meshopt decode: world-frame volume, sole and wrist seams. */
import fs from 'node:fs';
import {PropertyBinding,SkinnedMesh,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer';
const rows=[];
for(const topic of ['arms','back','chest','core','legs','shoulders']){
 const bytes=fs.readFileSync(`public/models/muscles-${topic}.glb`),gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer,'');gltf.scene.updateMatrixWorld(true);
 const rig=JSON.parse(fs.readFileSync(`scripts/anatomy/${topic}/rig.json`,'utf8'));
 const get=(name:string)=>gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(name)) as SkinnedMesh;
 const points=(mesh:SkinnedMesh)=>Array.from({length:mesh.geometry.getAttribute('position').count},(_,i)=>mesh.getVertexPosition(i,new Vector3()).applyMatrix4(mesh.matrixWorld));
 const outline=get('skin-outline'),body=points(outline),ix=outline.geometry.index!;let signedVolume=0;
 for(let i=0;i<ix.count;i+=3)signedVolume+=body[ix.getX(i)]!.dot(body[ix.getX(i+1)]!.clone().cross(body[ix.getX(i+2)]!))/6;
 const seams=[];
 for(const side of ['l','r']){
  const joint=(name:string)=>new Vector3(...rig.joints.find((j:{name:string})=>j.name===name).position as [number,number,number]);
  const wrist=joint('hand.'+side),axis=wrist.clone().sub(joint('elbow.'+side)).normalize(),plane=wrist.clone().addScaledVector(axis,.005),hand=points(get('skin-hand.'+side));
  const cut=hand.filter(p=>Math.abs(p.clone().sub(plane).dot(axis))<.00015);let maxDistance=0;
  for(const p of cut){let best=Infinity;for(const q of body)best=Math.min(best,p.distanceToSquared(q));maxDistance=Math.max(maxDistance,Math.sqrt(best));}
  seams.push({side,cutVertices:cut.length,maxClosestBodyVertexM:maxDistance});
  if(cut.length<20||maxDistance>.0003)throw Error(`${topic} ${side}: unmatched wrist ring`);
 }
 const soleMinY=Math.min(...body.map(p=>p.y)),soleOffsetM=soleMinY-rig.floorY;
 if(Math.abs(soleOffsetM)>.005||signedVolume<.03||signedVolume>.10||bytes.length>1_500_000)throw Error(`${topic}: volume/sole/bytes gate`);
 const row={topic,bytes:bytes.length,bodySignedVolumeL:signedVolume*1000,soleMinY,rigFloorY:rig.floorY,soleOffsetM,seams};rows.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync('scripts/anatomy/rebuild-evidence/body-audit.json',JSON.stringify({date:'2026-11-09',method:'Exact shipped GLTFLoader meshopt decode and rest skeleton; scene-space vertices; signed volume includes open wrist cuts and tiny nail meshes, so is a diagnostic not a medical body measurement',rows},null,2)+'\n');
