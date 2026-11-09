/** Match the real moving caliper stop while keeping the lever ferrule fixed.
 * Existing pose fields provide an affine bend approximation (<1% length
 * change), avoiding a detached cable without engine changes or new part ids. */
import fs from 'node:fs';
import {Vector3,Quaternion,Euler} from 'three';
const path='src/content/topics/forces/data/parts.json',data=JSON.parse(fs.readFileSync(path,'utf8'));
const A=new Vector3(.815,.52,-.075),B=new Vector3(.561,.544,-.154),pivot=new Vector3(.56,.47,-.12),v=B.clone().sub(A);
for(const id of ['brake-light','brake-firm']){
 const amount=data.poses[id]['brake-caliper'].scale[2];
 const target=B.clone();target.z=pivot.z+(B.z-pivot.z)*amount;
 const next=target.sub(A),q=new Quaternion().setFromUnitVectors(v.clone().normalize(),next.clone().normalize()),e=new Euler().setFromQuaternion(q,'XYZ'),scale=next.length()/v.length();
 data.poses[id]['brake-cable']={pivot:A.toArray(),rotation:[e.x,e.y,e.z].map(x=>x*180/Math.PI),scale:[scale,scale,scale]};
}
const binding=data.sim.bind.find((b:{control?:string,part?:unknown})=>b.control==='squeeze'&&Array.isArray(b.part)&&b.part.includes('brake-caliper'));
if(!binding.part.includes('brake-cable'))binding.part.push('brake-cable');
fs.writeFileSync(path,JSON.stringify(data,null,2)+'\n');
