import assert from 'node:assert/strict';
import {save,poly,path,line,random,type Point} from './continental-drift-plate.js';
// Deck removed: 12 solid transverse walls divide a single broad V hull into 13 holds.
export const boundaries=Array.from({length:14},(_,i)=>i/13);
export const bulkheads=boundaries.slice(1,-1);
export const beam=(t:number)=>96*t+248*Math.sin(Math.PI*t)**.72;
export const p=(t:number,cross:number,height=0):Point=>[110+930*t+cross*.34,630-365*t+cross*.70+height*.60];
export const depth=170;
assert.equal(boundaries.length-1,13);assert.equal(bulkheads.length,12);
assert(boundaries.every((v,i)=>!i||v>boundaries[i-1]!));
assert.equal(beam(0),0);assert(Math.abs(beam(1)-96)<1e-6);
const ts=Array.from({length:121},(_,i)=>i/120);
const far=ts.map(t=>p(t,-beam(t))),near=ts.map(t=>p(t,beam(t)));
const outline=[...far,...near.toReversed()];
let b='';
b+=poly([...near,...ts.toReversed().map(t=>p(t,0,220))],'url(#wood)','#575757',2);
// Exterior strakes follow the curved shell, not a flat cutout.
for(let j=1;j<=8;j++)b+=line(ts.map(t=>p(t,beam(t)*(1-j/9),220*j/9)),'#737373',1.25);
b+=poly(outline,'#aaaaaa','#505050',2);
for(let i=12;i>=0;i--){
 const a=boundaries[i]!,c=boundaries[i+1]!;
 const seg=Array.from({length:12},(_,k)=>a+(c-a)*k/11);
 b+=poly([...seg.map(t=>p(t,-beam(t))),...seg.toReversed().map(t=>p(t,0,depth))],'#8d8d8d','#686868',.7);
 b+=poly([...seg.map(t=>p(t,0,depth)),...seg.toReversed().map(t=>p(t,beam(t)))],'url(#wood)','#737373',.7);
 for(const s of [-1,1])for(let j=1;j<7;j++)b+=line(seg.map(t=>p(t,s*beam(t)*j/7,depth*(1-j/7))),'#777777',.75);
 if(i){const t=a,B=beam(t),face=[p(t,-B),p(t,B),p(t,0,depth)];
 b+=poly(face,'#c2c2c2','#575757',1.5)+poly(face,'url(#hatch)','none',0);
 for(let j=1;j<7;j++){const z=j/7;b+=line([p(t,-B*(1-z),depth*z),p(t,B*(1-z),depth*z)],'#7e7e7e',.9);}
 b+=poly([p(t,-B),p(t,B),[p(t,B)[0]+7,p(t,B)[1]-3],[p(t,-B)[0]+7,p(t,-B)[1]-3]],'#e2e2e2','#696969',.8);
 }
}
export const bulkheadFaces=bulkheads.map(t=>[p(t,-beam(t)),p(t,beam(t)),p(t,0,depth)]);
assert(bulkheadFaces.every(f=>f[2]![1]>(f[0]![1]+f[1]![1])/2));
assert(bulkheadFaces.every(f=>Math.abs(f[2]![0]-(f[0]![0]+f[1]![0])/2)<1e-6));
// Attached outer keel, pointed stem and three laminated rim edges.
b+=line(ts.map(t=>p(t,0,223)),'#535353',8)+line(ts.map(t=>p(t,0,220)),'#b8b8b8',3);
for(const s of [-1,1])for(let j=0;j<3;j++)b+=line(ts.map(t=>p(t,s*(beam(t)+j*3),-j*4)),j===0?'#555555':'#a0a0a0',2);
b+=line([p(0,0,218),p(0,0,-38)],'#676767',10)+line([p(0,0,210),p(0,0,-38)],'#c0c0c0',4);
// Tiny attached wooden mast step inside one compartment, not a deck.
const t=.49; b+=poly([p(t,-24,155),p(t+.027,-24,155),p(t+.027,24,155),p(t,24,155)],'#777777');
const r=random(93);
for(let i=0;i<950;i++){const t=r(),s=r();const q=p(t,beam(t)*s,depth*(1-s));b+=path(`M${q[0]} ${q[1]}l${4+r()*10} ${-2-r()*3}`,'none','#656565',.32,'opacity=".3"');}
if(!process.argv.includes('--check')) await save('silk-road-quanzhou-ship',b);
