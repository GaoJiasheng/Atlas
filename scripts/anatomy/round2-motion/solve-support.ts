import fs from 'node:fs';
import {Euler,Matrix4,SkinnedMesh,Vector3} from 'three';
import {fixture} from './probe';
import {leastSquares} from './optimize';
import {makeFoot,footPoints} from '../../../src/engines/space-scene/stages/model3d/foot';
import type {Angles} from '../../../src/engines/space-scene/lib/rig';
const result=[];
for(const [topic,id] of [['chest','barbell-bench-press'],['arms','close-grip-bench-press']] as const){
 const f=await fixture(topic),body=f.gltf.scene.getObjectByName('skin-outline') as SkinnedMesh;
 const floor=JSON.parse(fs.readFileSync(`scripts/anatomy/${topic}/rig.json`,'utf8')).floorY,feet=['l','r'].map(side=>makeFoot(f.node('ankle.'+side),floor)!);
 const base:Record<string,Angles>={'hip.l':{extension:16,abduction:18},'knee.l':{flexion:80},'ankle.l':{dorsiflexion:6},...(topic==='arms'?{'scapula.l':{retraction:6}}:{})};
 const pivot=f.node('trunk').getWorldPosition(new Vector3());
 function root(deg:number){f.root.makeTranslation(...pivot.toArray()).multiply(new Matrix4().makeRotationFromEuler(new Euler(deg*Math.PI/180,0,0))).multiply(new Matrix4().makeTranslation(...pivot.clone().negate().toArray()));}
 const count=body.geometry.getAttribute('position').count;
 const points=()=>Array.from({length:count},(_,i)=>body.getVertexPosition(i,new Vector3()).applyMatrix4(body.matrixWorld));
 let angle=-93,top=-.17;
 const vec=(x:number[])=>({...base,'hip.l':{extension:x[0]!,abduction:x[1]!},'knee.l':{flexion:x[2]!},'ankle.l':{dorsiflexion:x[3]!}});
 let lower=[16,18,80,6];
 for(let iteration=0;iteration<4;iteration++){
  const pose=f.pose(vec(lower)),skin=points(),head=skin.filter(p=>p.y>pose.shoulder.y+.08&&p.y<pose.shoulder.y+.36&&Math.abs(p.x)<.095),butt=skin.filter(p=>p.y>pose.shoulder.y-.65&&p.y<pose.shoulder.y-.4&&Math.abs(p.x)<.095);
  const min=(ps:Vector3[],deg:number)=>{root(deg);return Math.min(...ps.map(p=>p.clone().applyMatrix4(f.root).y));};
  let lo=-100,hi=-88;for(let i=0;i<35;i++){const mid=(lo+hi)/2;if(min(head,mid)>min(butt,mid))hi=mid;else lo=mid;}angle=(lo+hi)/2;top=(min(head,angle)+min(butt,angle))/2;root(angle);
  const actualFloor=top-.45,targetZ=f.node('hip.l').getWorldPosition(new Vector3()).applyMatrix4(f.root).z+.33;
  const fn=(x:number[])=>{f.pose(vec(x));const heel=new Vector3(),ball=new Vector3();footPoints(feet[0]!,heel,ball);heel.applyMatrix4(f.root);ball.applyMatrix4(f.root);return [(heel.y-actualFloor)*20,(ball.y-actualFloor)*20,((heel.x+ball.x)/2-.25)*20,((heel.z+ball.z)/2-targetZ)*20];};
  lower=leastSquares(fn,lower,60).x;
 }
 const joints=vec(lower),pose=f.pose(joints),skin=points();root(angle);
 const areas=[['occiput',.08,.36],['upper-back',-.16,.05],['butt',-.65,-.4]] as const;
 const supports=areas.map(([name,lo,hi])=>({name,minY:Math.min(...skin.filter(q=>q.y>pose.shoulder.y+lo&&q.y<pose.shoulder.y+hi&&Math.abs(q.x)<.095).map(p=>p.clone().applyMatrix4(f.root).y))}));
 const contacts=feet.map(foot=>{const heel=new Vector3(),ball=new Vector3();footPoints(foot,heel,ball);return {heel:heel.applyMatrix4(f.root).toArray(),ball:ball.applyMatrix4(f.root).toArray()};});
 const row={topic,id,rootRotation:[+angle.toFixed(4),0,0],benchAt:[0,+top.toFixed(4),.02],floor:top-.45,joints,supports,contacts};result.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync('scripts/anatomy/round2-motion/support-solutions.json',JSON.stringify(result,null,2)+'\n');
