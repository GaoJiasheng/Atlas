/** Read the delivered payload, apply the actual simulator's absolute poses. */
import fs from 'node:fs';
import {Vector3,Matrix4,Euler} from 'three';
import {readModel} from './read-model';
import {toTransform} from '../../../src/engines/space-scene/lib/pose';
const data=JSON.parse(fs.readFileSync('src/content/topics/saturn-v/data/parts.json','utf8')),meshes=await readModel(),report:Record<string,unknown>={};
for(const p of data.parts.filter((p:any)=>p.group==='lander'&&p.mesh)){
 const g=meshes.get(p.mesh)!,a=g.getAttribute('position'),t=toTransform(data.poses['launch-packed'][p.id]),rot=new Matrix4().makeRotationFromEuler(new Euler(...t.rotation.map(x=>x*Math.PI/180) as [number,number,number]));
 let worst=Infinity,point:number[]=[],minY=Infinity,maxY=-Infinity;
 for(let i=0;i<a.count;i++){const v=new Vector3().fromBufferAttribute(a,i).sub(new Vector3(...t.pivot!)).multiply(new Vector3(...t.scale)).applyMatrix4(rot).add(new Vector3(...t.pivot!)).add(new Vector3(...t.offset));const inner=3.225+(1.87-3.225)*(v.y-85.59)/(94-85.59),clear=inner-Math.hypot(v.x,v.z);if(clear<worst){worst=clear;point=v.toArray();}minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);}
 report[p.id]={minimumRadialClearance:worst,worstPoint:point,minY,maxY};
}
fs.writeFileSync('scripts/geo/saturn-v/fit-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
