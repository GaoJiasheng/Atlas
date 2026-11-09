import fs from 'node:fs';
import sharp from 'sharp';
import {Color,Matrix3,Matrix4,Mesh,Quaternion,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer';
import {loadTopic,render,compare,tokens,type Surface} from './studio';
import {bothSides} from '../../../src/engines/space-scene/lib/rig';
import {handFrame,handPlan} from '../../../src/engines/space-scene/lib/hands';
import {fixture} from '../round2-motion/probe';
import {heelPoint,WRIST_RADIUS,wristLinkGeometry,wristCapGeometry} from '../../../src/engines/space-scene/stages/model3d/handShapes';
const folder=process.argv[2]??'look1',actual=process.argv.includes('--actual');
const directory=`scripts/anatomy/round3/comparisons/${folder}`;fs.mkdirSync(directory,{recursive:true});
const load=async(file:string)=>{const b=fs.readFileSync(file);return (await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer,'')).scene;};
const gym=await load('public/models/muscles-core-gym.glb'),hands=await load('public/models/muscles-arms-hands.glb');gym.updateMatrixWorld(true);hands.updateMatrixWorld(true);
function surface(mesh:Mesh,matrix:Matrix4,color:string):Surface{
 const g=mesh.geometry,ps=g.getAttribute('position'),ns=g.getAttribute('normal'),idx=g.index,n=idx?.count??ps.count,positions=new Float32Array(n*3),normals=new Float32Array(n*3),p=new Vector3(),normal=new Vector3(),nm=new Matrix3().getNormalMatrix(matrix);
 for(let i=0;i<n;i++){const k=idx?idx.getX(i):i;positions.set(p.fromBufferAttribute(ps,k).applyMatrix4(matrix).toArray(),i*3);normals.set(normal.fromBufferAttribute(ns,k).applyMatrix3(nm).normalize().toArray(),i*3);}
 return {id:mesh.name,positions,normals,rgb:new Color(color),roughness:.85,metalness:0,envIntensity:.35};
}
function transform(s:Surface,m:Matrix4){const n=new Matrix3().getNormalMatrix(m),p=new Vector3();for(let i=0;i<s.positions.length;i+=3){s.positions.set(p.fromArray(s.positions,i).applyMatrix4(m).toArray(),i);s.normals.set(p.fromArray(s.normals,i).applyMatrix3(n).normalize().toArray(),i);}return s;}
for(const [topic,id] of [['chest','barbell-bench-press'],['arms','close-grip-bench-press']] as const){
 const f=await fixture(topic),file=topic==='chest'?'horizontal-push':'arms',motion=actual?JSON.parse(fs.readFileSync(`src/content/shared/fitness/exercises/${file}.json`,'utf8')).exercises.find((e:any)=>e.id===id).motion:JSON.parse(fs.readFileSync(`scripts/anatomy/round2-motion/${id}-motion.json`,'utf8'));
 for(const key of motion.keys){
  f.setRoot(key.root??motion.root??{rotation:[0,0,0]});
  const pose=f.pose(key.joints),joints=bothSides(key.joints,new Set(Object.keys(f.data.rig.joints)));
  const shapes=(await loadTopic(topic,false,'paper','body',joints)).filter(s=>s.id==='skin-outline').map(s=>transform(s,f.root));
  const trunk=f.node('trunk').getWorldPosition(new Vector3()).applyMatrix4(f.root),bench=motion.equipment.find((s:any)=>s.kind==='bench'),benchMesh=gym.getObjectByName('bench-0') as Mesh;
  const benchAt=trunk.clone().add(new Vector3(...bench.at));shapes.push(surface(benchMesh,new Matrix4().makeTranslation(...benchAt.toArray()).multiply(benchMesh.matrixWorld),tokens('paper').neutral!));
  const barMesh=gym.getObjectByName('barbell') as Mesh,axis=pose.palm.clone().sub(pose.rightPalm).normalize(),barMatrix=new Matrix4().compose(pose.bar,new Quaternion().setFromUnitVectors(new Vector3(1,0,0),axis),new Vector3(1,1,1));
  shapes.push(surface(barMesh,f.root.clone().multiply(barMatrix).multiply(barMesh.matrixWorld),tokens('paper').neutral!));
  for(const side of ['l','r'] as const){
   const palm=side==='l'?pose.palm:pose.rightPalm,forearm=side==='l'?pose.axis:pose.rightAxis,other=side==='l'?pose.rightPalm:pose.palm,plan=handPlan(motion,side),frame=handFrame(side,plan,{forearm:forearm.toArray(),toOther:other.clone().sub(palm).toArray(),sceneZ:new Vector3(0,0,1).transformDirection(f.root.clone().invert()).toArray(),sceneUp:new Vector3(0,1,0).transformDirection(f.root.clone().invert()).toArray()}),hm=new Matrix4().makeBasis(new Vector3(...frame.x),new Vector3(...frame.y),new Vector3(...frame.z)).setPosition(palm);
   const wrist=side==='l'?pose.wrist:pose.rightWrist,heel=new Vector3(...heelPoint(plan.kind,plan.radius)).applyMatrix4(hm),direction=heel.clone().sub(wrist),length=direction.length();
   const cap=new Mesh(wristCapGeometry()),capMatrix=new Matrix4().compose(wrist,new Quaternion(),new Vector3(WRIST_RADIUS,WRIST_RADIUS,WRIST_RADIUS));shapes.push(surface(cap,f.root.clone().multiply(capMatrix),tokens('paper').mannequin!));cap.geometry.dispose();
   if(length>.004){const link=new Mesh(wristLinkGeometry()),linkMatrix=new Matrix4().compose(wrist,new Quaternion().setFromUnitVectors(new Vector3(0,1,0),direction.normalize()),new Vector3(WRIST_RADIUS,length,WRIST_RADIUS));shapes.push(surface(link,f.root.clone().multiply(linkMatrix),tokens('paper').mannequin!));link.geometry.dispose();}
   const hand=hands.getObjectByName('fist-15') as Mesh;hm.scale(new Vector3(1,plan.radius/.015,plan.radius/.015));shapes.push(surface(hand,f.root.clone().multiply(hm).multiply(hand.matrixWorld),tokens('paper').mannequin!));
  }
  // Fixed camera shared between phases. Head is to -Z; look from foot-side.
  const target:[number,number,number]=[0,trunk.y-.16,trunk.z+.20],camera={position:(topic==='chest'?[-2.4,1.7,2.65]:[2.4,1.7,-2.65]) as [number,number,number],target,fov:36};
  const file=`${directory}/${topic}-${key.phase}.png`;await render(shapes,file,{width:900,height:850,camera});
  const profileCamera={position:[3.2,trunk.y+.5,trunk.z+.25] as [number,number,number],target,fov:36};
  await render(shapes,`${directory}/${topic}-${key.phase}-profile.png`,{width:1100,height:700,camera:profileCamera});
  if(key.phase==='end')await render(shapes,`${directory}/${topic}-sternum-contact.png`,{width:1000,height:700,camera:{position:[.05,trunk.y+.75,trunk.z-.5],target:pose.bar.clone().applyMatrix4(f.root).toArray() as [number,number,number],fov:30}});
  const ref=`scripts/anatomy/round2-motion/refs/${topic==='chest'?'bench':'close-grip'}-${key.phase==='start'?'top':'bottom'}.png`;
  if(key.phase!=='mid')await compare(file,ref,`${directory}/${topic}-${key.phase}-comparison.png`,`${topic} ${key.phase} · actual pose / native skin / shipped gym GLB`,'Everkinetic · Wikimedia Commons · CC BY-SA 3.0');
 }
}
console.log(directory);
