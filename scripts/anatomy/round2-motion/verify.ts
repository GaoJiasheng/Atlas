/** Browser-free relationship gate on actual decoded assets and the supplied motion.
 * Default reads a clearly labelled candidate. --actual reads executing shared JSON.
 * Both paths use the motion's own root, both arms, interpolated frames and native skin. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Vector3,SkinnedMesh} from 'three';
import {lerpAngles} from '../../../src/engines/space-scene/lib/rig';
import {makeFoot,footPoints} from '../../../src/engines/space-scene/stages/model3d/foot';
import {fixture} from './probe';
const rows=[],actual=process.argv.includes('--actual');
const angle=(a:Vector3,b:Vector3)=>Math.acos(Math.max(-1,Math.min(1,a.normalize().dot(b.normalize()))))*180/Math.PI;
for(const [topic,id] of [['chest','barbell-bench-press'],['arms','close-grip-bench-press']] as const){
 const f=await fixture(topic),file=topic==='chest'?'horizontal-push':'arms';
 const floorY=JSON.parse(fs.readFileSync(`scripts/anatomy/${topic}/rig.json`,'utf8')).floorY,footFrames=['l','r'].map(side=>({side,foot:makeFoot(f.node('ankle.'+side),floorY)!}));
 const motion=actual?JSON.parse(fs.readFileSync(`src/content/shared/fitness/exercises/${file}.json`,'utf8')).exercises.find((e:any)=>e.id===id).motion:JSON.parse(fs.readFileSync(`scripts/anatomy/round2-motion/${id}-motion.json`,'utf8'));
 const body=f.gltf.scene.getObjectByName('skin-outline') as SkinnedMesh,idx=body.geometry.index!;
 const pose=(key:any)=>{f.setRoot(key.root??motion.root??{rotation:[0,0,0]});return f.pose(key.joints);};
 const start=pose(motion.keys[0]),end=pose(motion.keys[1]);
 const v=(p:any,key:string)=>new Vector3(...p.scene[key] as [number,number,number]);
 const shoulderZ=(v(start,'shoulder').z+v(start,'rightShoulder').z)/2;
 const headwardMaxMm=Math.max(...Array.from({length:101},(_,i)=>{const k=i/100,a=motion.keys[0],b=motion.keys[1],joints=Object.fromEntries([...new Set([...Object.keys(a.joints),...Object.keys(b.joints)])].map(name=>[name,lerpAngles(a.joints[name]??{},b.joints[name]??{},k)]));const ar=a.root??motion.root,br=b.root??motion.root;return (shoulderZ-v(pose({joints,root:{rotation:ar.rotation.map((n:number,j:number)=>n+(br.rotation[j]-n)*k),offset:(ar.offset??[0,0,0]).map((n:number,j:number)=>n+((br.offset??[0,0,0])[j]-n)*k)}}),'bar').z)*1000;}));
 pose(motion.keys[1]);
 const points=Array.from({length:body.geometry.getAttribute('position').count},(_,i)=>body.getVertexPosition(i,new Vector3()).applyMatrix4(body.matrixWorld).applyMatrix4(f.root));
 const bar=v(end,'bar');let skinY=-Infinity;
 for(let i=0;i<idx.count;i+=3){const a=points[idx.getX(i)]!,b=points[idx.getX(i+1)]!,c=points[idx.getX(i+2)]!,d=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(d)<1e-12)continue;const u=((b.z-c.z)*(bar.x-c.x)+(c.x-b.x)*(bar.z-c.z))/d,w=((c.z-a.z)*(bar.x-c.x)+(a.x-c.x)*(bar.z-c.z))/d,t=1-u-w;if(Math.min(u,w,t)>=-1e-8)skinY=Math.max(skinY,u*a.y+w*b.y+t*c.y);}
 const startErrorMm=Math.abs(v(start,'bar').z-shoulderZ)*1000,bottomClearanceMm=(bar.y-.014-skinY)*1000;
 const bodyward=new Vector3(0,-1,0).transformDirection(f.root),bottomCaudalMm=v(end,'bar').clone().sub(v(end,'shoulder').add(v(end,'rightShoulder')).multiplyScalar(.5)).dot(bodyward)*1000;
 const arms=['','right'].map(prefix=>{const key=(k:string)=>prefix?prefix+k[0]!.toUpperCase()+k.slice(1):k;return {side:prefix?'r':'l',startElbowDeg:angle(v(start,key('elbow')).sub(v(start,key('shoulder'))),v(start,key('wrist')).sub(v(start,key('elbow')))),bottomForearmDeg:angle(v(end,key('wrist')).sub(v(end,key('elbow'))),new Vector3(0,1,0)),startShoulderSagittalErrorMm:Math.abs(v(start,key('palm')).z-v(start,key('shoulder')).z)*1000};});
 const gripWidthDeltaMm=Math.abs(v(start,'palm').distanceTo(v(start,'rightPalm'))-v(end,'palm').distanceTo(v(end,'rightPalm')))*1000;
 assert(startErrorMm<3,`${id} start bar above shoulders: ${startErrorMm}mm`);assert(headwardMaxMm<3,`${id} bar crosses face/neck: ${headwardMaxMm}mm`);assert(Math.abs(bottomClearanceMm)<4,`${id} lower sternum contact: ${bottomClearanceMm}mm`);assert(bottomCaudalMm>155&&bottomCaudalMm<195,`${id} lower sternum location: ${bottomCaudalMm}mm`);assert(gripWidthDeltaMm<5,`${id} constant grip width: ${gripWidthDeltaMm}mm`);
 for(const arm of arms){assert(arm.startElbowDeg<3,`${id} ${arm.side} straight arm: ${arm.startElbowDeg}deg`);assert(arm.bottomForearmDeg<.2,`${id} ${arm.side} vertical forearm: ${arm.bottomForearmDeg}deg`);assert(arm.startShoulderSagittalErrorMm<3,`${id} ${arm.side} sagittal bar location: ${arm.startShoulderSagittalErrorMm}mm`);}
 // Contact checks include the actual authored bench position and source foot frames.
 const supportPose=pose(motion.keys[0]),trunk=f.node('trunk').getWorldPosition(new Vector3()).applyMatrix4(f.root),bench=motion.equipment.find((s:any)=>s.kind==='bench'),benchTop=trunk.y+bench.at[1],floor=benchTop-.45;
 const supportPoints=Array.from({length:body.geometry.getAttribute('position').count},(_,i)=>body.getVertexPosition(i,new Vector3()).applyMatrix4(body.matrixWorld));
 const supports=[['occiput',.08,.36],['upper-back',-.16,.05],['butt',-.65,-.4]].map(([name,lo,hi])=>({name,gapMm:(Math.min(...supportPoints.filter(p=>p.y>supportPose.shoulder.y+(lo as number)&&p.y<supportPose.shoulder.y+(hi as number)&&Math.abs(p.x)<.095).map(p=>p.clone().applyMatrix4(f.root).y))-benchTop)*1000}));
 const feet=footFrames.map(({side,foot})=>{const heel=new Vector3(),ball=new Vector3();footPoints(foot,heel,ball);return {side,heelGapMm:(heel.applyMatrix4(f.root).y-floor)*1000,ballGapMm:(ball.applyMatrix4(f.root).y-floor)*1000};});
 for(const s of supports)assert(Math.abs(s.gapMm)<13,`${id} ${s.name} support ${s.gapMm}mm`);for(const foot of feet)assert(Math.max(Math.abs(foot.heelGapMm),Math.abs(foot.ballGapMm))<2,`${id} foot ${foot.side} floor contact`);
 const row={topic,id,root:motion.root,startErrorMm,bottomClearanceMm,bottomCaudalMm,arms,gripWidthDeltaMm,headwardMaxMm,supports,feet,start:start.scene,end:end.scene,glbSha256:createHash('sha256').update(fs.readFileSync(`public/models/muscles-${topic}.glb`)).digest('hex')};rows.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync(`scripts/anatomy/round2-motion/${actual?'executing-metrics':'candidate-metrics'}.json`,JSON.stringify({date:'2026-11-09',inputMode:actual?'Executing shared fitness JSON':'CANDIDATE PATCH ONLY — not executing runtime',method:'Actual decoded native GLB; topic rig axes/signs/palm offsets; motion root transforms; both native asymmetric arms; 101 interpolated samples; world-vertical forearms; bar underside/native posed skin contact; head/butt/upper-back and both foot supports. Offline relationship gate, not GPU acceptance.',rows},null,2)+'\n');
