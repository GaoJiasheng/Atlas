import fs from 'node:fs';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer';
import {Euler,Matrix4,PropertyBinding,Quaternion,Vector3,Object3D} from 'three';
import {anglesQuat,bothSides,foldAngles,midlineNormal,mirrorSignedAxes,type Angles} from '../../../src/engines/space-scene/lib/rig';
import {makeGrip,gripPoint} from '../../../src/engines/space-scene/stages/model3d/grip';
export async function fixture(topic='chest') {
 const bytes=fs.readFileSync(`public/models/muscles-${topic}.glb`),gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer,'');gltf.scene.updateMatrixWorld(true);
 const data=JSON.parse(fs.readFileSync(`src/content/topics/muscles-${topic}/data/parts.json`,'utf8'));
 const node=(name:string)=>gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(data.rig.joints[name].node))!;
 const plans=Object.entries(data.rig.joints).map(([name,spec]:[string,any])=>{
  const bone=node(name),left=name.endsWith('.r')?data.rig.joints[name.replace(/\.r$/,'.l')]:null;
  const sceneAxes=left?mirrorSignedAxes(left.axes,spec.axes,midlineNormal(node(name.replace(/\.r$/,'.l')).getWorldPosition(new Vector3()).toArray(),bone.getWorldPosition(new Vector3()).toArray())):spec.axes;
  const parentRest=bone.parent!.getWorldQuaternion(new Quaternion()).invert();
  const axes=Object.fromEntries(Object.entries(sceneAxes).map(([m,a])=>[m,new Vector3(...a as [number,number,number]).normalize().applyQuaternion(parentRest).toArray()]));
  return {name,bone,rest:bone.quaternion.clone(),axes,sceneAxes};
 });
 const grips={l:makeGrip(node('hand.l'),data.rig.joints['hand.l'].offset)!,r:makeGrip(node('hand.r'),data.rig.joints['hand.r'].offset)!};
 const pivot=node('trunk').getWorldPosition(new Vector3());
 const root=new Matrix4();
 function setRoot(spec:{rotation:number[];offset?:number[]}){const r=spec.rotation,o=spec.offset??[0,0,0];root.makeTranslation(pivot.x+o[0]!,pivot.y+o[1]!,pivot.z+o[2]!).multiply(new Matrix4().makeRotationFromEuler(new Euler(...r.map(v=>v*Math.PI/180) as [number,number,number]))).multiply(new Matrix4().makeTranslation(...pivot.clone().negate().toArray()));}
 setRoot({rotation:[-90,0,0]});
 const pos=(name:string)=>node(name).getWorldPosition(new Vector3());
 function pose(joints:Record<string,Angles>){
  const full=bothSides(joints,new Set(Object.keys(data.rig.joints)));
  for(const p of plans){const q=anglesQuat(p.axes,foldAngles(p.sceneAxes,full[p.name]??{}));p.bone.quaternion.copy(new Quaternion(...q).multiply(p.rest));}
  gltf.scene.updateMatrixWorld(true);
  const palm=new Vector3(),axis=new Vector3();gripPoint(grips.l,palm,axis);
  const shoulder=pos('shoulder.l'),elbow=pos('elbow.l'),wrist=pos('hand.l');
  const rightPalm=new Vector3(),rightAxis=new Vector3();gripPoint(grips.r,rightPalm,rightAxis);const bar=palm.clone().add(rightPalm).multiplyScalar(.5),rightShoulder=pos('shoulder.r'),rightElbow=pos('elbow.r'),rightWrist=pos('hand.r');
  const scene=Object.fromEntries(Object.entries({shoulder,elbow,wrist,palm,rightShoulder,rightElbow,rightWrist,rightPalm,bar}).map(([key,v])=>[key,v.clone().applyMatrix4(root).toArray()]));
  return {shoulder,elbow,wrist,palm,axis,rightShoulder,rightElbow,rightWrist,rightPalm,rightAxis,bar,scene};
 }
 return {gltf,data,node,pose,root,setRoot};
}
if(process.argv[1]?.endsWith('/probe.ts')){
 for(const [topic,file,id] of [['chest','horizontal-push','barbell-bench-press'],['arms','arms','close-grip-bench-press']] as const){
  const f=await fixture(topic);const e=JSON.parse(fs.readFileSync(`src/content/shared/fitness/exercises/${file}.json`,'utf8')).exercises.find((e:any)=>e.id===id);
  for(const key of e.motion.keys)console.log(topic,key.phase,JSON.stringify(f.pose(key.joints)));
 }
}
