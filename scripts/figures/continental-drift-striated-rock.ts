import assert from 'node:assert/strict';
import {save,poly,line,texture,random,type Point} from './continental-drift-plate.js';
export const striations=Array.from({length:30},(_,i)=>{const x=115+(i%6)*49,y=310+Math.floor(i/6)*60,l=150+(i%5)*17;return [[x,y],[x+l,y-l*.49]] as [Point,Point];});
const angles=striations.map(([a,b])=>Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI);
assert(angles.every(a=>Math.abs(a-angles[0]!)<10));
const slab='M90 370L350 150L645 267L515 610L220 660L85 530Z';
let b=texture('M85 530L220 660L515 610L645 267L636 410L525 737L215 760L89 625Z','#bdbdbd')+texture(slab,'#d8d8d8');
b+=`<defs><clipPath id="bedrock-face"><path d="${slab}"/></clipPath></defs><g clip-path="url(#bedrock-face)">`+striations.map((p,i)=>line(p,i%6===0?'#626262':'#929292',i%6===0?4:1.4)+line(p.map(([x,y])=>[x,y+3] as Point),'#eeeeee',.7)).join('')+'</g>';
const till='M705 346L903 270L1110 378L1100 673L938 757L715 664Z';
b+=texture(till,'#bfbfbf');
const r=random(77);
const clasts=[{x:811,y:408,s:59},{x:988,y:450,s:78},{x:835,y:605,s:70},{x:1003,y:643,s:38}];
for(let tries=0;clasts.length<42&&tries<2500;tries++){
 const c={x:750+r()*300,y:375+r()*310,s:4+r()*15};
 if(clasts.every(q=>Math.hypot(c.x-q.x,c.y-q.y)>c.s+q.s+9))clasts.push(c);
}
assert(clasts.length>=30);
assert(Math.max(...clasts.map(c=>c.s))/Math.min(...clasts.map(c=>c.s))>10);
for(const c of clasts){const n=5+Math.floor(r()*4),phase=r()*Math.PI*2;const p=Array.from({length:n},(_,i)=>{const a=phase+i*Math.PI*2/n;return [c.x+Math.cos(a)*c.s*(.55+r()*.45),c.y+Math.sin(a)*c.s*(.4+r()*.45)] as Point;});b+=poly(p,'#e1e1e1','#737373',1.2)+line([p[0]!,p[2]!],'#b2b2b2',.7);}
await save('continental-drift-striated-rock',b);
