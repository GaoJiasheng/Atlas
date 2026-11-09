/** Solve the shipped asymmetrical rig in the scene frame, including support turn. */
import {leastSquares} from './optimize';
import type {Angles} from '../../../src/engines/space-scene/lib/rig';
import fs from 'node:fs';
import {Vector3,SkinnedMesh} from 'three';
import {fixture} from './probe';
const results=[];
const supports=JSON.parse(fs.readFileSync('scripts/anatomy/round2-motion/support-solutions.json','utf8'));
const previous=JSON.parse(fs.readFileSync('scripts/anatomy/round2-motion/solve-seeds.json','utf8'));
for(const topic of ['chest','arms']){
 const f=await fixture(topic),support=supports.find((s:any)=>s.topic===topic);f.setRoot({rotation:support.rootRotation});
 const base:Record<string,Angles>=support.joints,rest=f.pose(base),shoulder=rest.shoulder.clone().add(rest.rightShoulder).multiplyScalar(.5);
 const body=f.gltf.scene.getObjectByName('skin-outline') as SkinnedMesh,idx=body.geometry.index!;
 const points=Array.from({length:body.geometry.getAttribute('position').count},(_,i)=>body.getVertexPosition(i,new Vector3()).applyMatrix4(body.matrixWorld));
 function surfaceAt(ps:Vector3[],x:number,t:number,a:'y'|'z',b:'y'|'z') {let height=-Infinity;for(let i=0;i<idx.count;i+=3){const A=ps[idx.getX(i)]!,B=ps[idx.getX(i+1)]!,C=ps[idx.getX(i+2)]!,d=(B[a]-C[a])*(A.x-C.x)+(C.x-B.x)*(A[a]-C[a]);if(Math.abs(d)<1e-12)continue;const u=((B[a]-C[a])*(x-C.x)+(C.x-B.x)*(t-C[a]))/d,v=((C[a]-A[a])*(x-C.x)+(A.x-C.x)*(t-C[a]))/d,w=1-u-v;if(Math.min(u,v,w)>=-1e-9)height=Math.max(height,u*A[b]+v*B[b]+w*C[b]);}if(!Number.isFinite(height))throw Error('No sternum surface');return height;}
 const targetY=shoulder.y-(topic==='arms'?.190:.160),chestZ=surfaceAt(points,0,targetY,'y','z'),contact=new Vector3(0,targetY,chestZ).applyMatrix4(f.root),worldPoints=points.map(p=>p.clone().applyMatrix4(f.root));
 const target=new Vector3(0,surfaceAt(worldPoints,0,contact.z,'z','y')+.014,contact.z),gripHalf=topic==='chest'?.35:.28;
 const vec=(x:number[],side:'l'|'r')=>({...base,[`shoulder.${side}`]:{flexion:x[0]!,abduction:x[1]!,'horizontal-adduction':x[2]!,'internal-rotation':x[3]!},[`elbow.${side}`]:{flexion:x[4]!},[`forearm.${side}`]:{pronation:x[5]!}});
 const seed=(phase:'start'|'end')=>{const p=previous.find((r:any)=>r.topic===topic)[phase].angles;return [p['shoulder.l'].flexion,p['shoulder.l'].abduction,p['shoulder.l']['horizontal-adduction'],p['shoulder.l']['internal-rotation'],p['elbow.l'].flexion,p['forearm.l'].pronation];};
 const solved:{start:Record<string,Angles>;end:Record<string,Angles>}={start:{...base},end:{...base}};
 for(const side of ['l','r'] as const){
  const point=(p:ReturnType<typeof f.pose>,name:'shoulder'|'elbow'|'wrist'|'palm')=>(side==='l'?p[name]:p[`right${name[0]!.toUpperCase()+name.slice(1)}` as 'rightPalm']).clone().applyMatrix4(f.root);
  const endFn=(x:number[])=>{const p=f.pose(vec(x,side)),palm=point(p,'palm'),axis=point(p,'wrist').sub(point(p,'elbow')).normalize();return [(palm.x-(side==='l'?gripHalf:-gripHalf))*(topic==='arms'?.01:20),(palm.y-target.y)*20,(palm.z-target.z)*20,axis.x*10,axis.z*10,x[3]!*.000001,x[5]!*.000001];};
  const end=leastSquares(endFn,seed('end'),100);
  const endPose=f.pose(vec(end.x,side)),endGrip=point(endPose,'palm').x;
  const startFn=(x:number[])=>{const p=f.pose(vec(x,side)),palm=point(p,'palm'),axis=point(p,'wrist').sub(point(p,'elbow')).normalize(),upper=point(p,'elbow').sub(point(p,'shoulder')).normalize(),s=point(p,'shoulder');return [(palm.x-endGrip)*20,(palm.z-s.z)*20,(axis.x-upper.x)*20,(axis.y-upper.y)*20,(axis.z-upper.z)*20,(x[3]!-end.x[3]!)*.001,(x[5]!-end.x[5]!)*.001];};
  const start=leastSquares(startFn,seed('start'),120);
  for(const [phase,solution] of [['start',start],['end',end]] as const)for(const [name,angles]of Object.entries(vec(solution.x,side)))if(name.endsWith(`.${side}`)&&['shoulder','elbow','forearm'].includes(name.split('.')[0]!))solved[phase][name]=angles;
  console.log(topic,side,'scores',start.best,end.best);
 }
 results.push({topic,targetY,chestZ,target:target.toArray(),support,start:{angles:solved.start,points:f.pose(solved.start)},end:{angles:solved.end,points:f.pose(solved.end)}});
}
fs.writeFileSync('scripts/anatomy/round2-motion/solutions.json',JSON.stringify(results,null,2)+'\n');
