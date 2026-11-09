import fs from 'node:fs';
import {SkinnedMesh,Vector3} from 'three';
import {fixture} from './probe';
import {makeFoot,footPoints} from '../../../src/engines/space-scene/stages/model3d/foot';
for(const [topic,id] of [['chest','barbell-bench-press'],['arms','close-grip-bench-press']] as const){
 const f=await fixture(topic),floor=JSON.parse(fs.readFileSync(`scripts/anatomy/${topic}/rig.json`,'utf8')).floorY;
 const feet=['l','r'].map(side=>makeFoot(f.node('ankle.'+side),floor)!);
 const motion=JSON.parse(fs.readFileSync(`scripts/anatomy/round2-motion/${id}-motion.json`,'utf8'));
 const p=f.pose(motion.keys[0].joints),body=f.gltf.scene.getObjectByName('skin-outline') as SkinnedMesh;
 const points=Array.from({length:body.geometry.getAttribute('position').count},(_,i)=>body.getVertexPosition(i,new Vector3()).applyMatrix4(body.matrixWorld));
 for(const [label,lo,hi] of [['occiput',.08,.36],['upper-back',-.16,.05],['butt',-.65,-.4]] as const){const pts=points.filter(q=>q.y>p.shoulder.y+lo&&q.y<p.shoulder.y+hi&&Math.abs(q.x)<.095);const min=pts.reduce((a,b)=>a.z<b.z?a:b);console.log(topic,label,min.toArray(),min.clone().applyMatrix4(f.root).toArray());}
 console.log(topic,'trunk',f.node('trunk').getWorldPosition(new Vector3()).toArray(),'hips',f.node('hip.l').getWorldPosition(new Vector3()).toArray());
 for(const foot of feet){const heel=new Vector3(),ball=new Vector3();footPoints(foot,heel,ball);console.log(topic,'foot-contract',heel.applyMatrix4(f.root).toArray(),ball.applyMatrix4(f.root).toArray());}
}
