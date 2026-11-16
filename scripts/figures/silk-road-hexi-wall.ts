import assert from 'node:assert/strict';
import {save,poly,path,line,ellipse,texture,random,type Point} from './continental-drift-plate.js';
export const courses=Array.from({length:10},(_,i)=>({material:i%2?'reed':'gravel',z:i*18}));
assert(courses.slice(1).every((c,i)=>c.material!==courses[i]!.material));
const p=(t:number,z:number):Point=>[100+t*690,660-t*225-z];
let b='';
// No continuous scenic background: sparse ground fragments belong to wall foot.
b+=path('M150 300Q240 261 310 280T475 260Q590 192 670 218T848 242Q952 242 1027 279','none','#aaaaaa',.9);
b+=poly([p(0,180),p(1,180),[840,221],[150,446]],'#cecece');
const r=random(60);
for(const c of courses){
 b+=poly([p(0,c.z),p(1,c.z),p(1,c.z+18),p(0,c.z+18)],c.material==='reed'?'#b4b4b4':'#d7d7d7','#777777',.6);
 if(c.material==='reed')for(let j=0;j<6;j++)b+=line([p(0,c.z+j*2.5+2),p(1,c.z+j*2.5+2)],'#777777',.6);
 else for(let j=0;j<130;j++){const t=r(),q=p(t,c.z+3+r()*12);b+=ellipse(...q,1+r()*2,1+r()*1.5,'#999999','none');}
}
b+=poly([p(1,0),p(1,180),[840,221],[840,401]],'#bdbdbd');
// Square rammed-earth beacon, tapering battered walls and flat top, no crenels.
b+=texture('M902 275L964 308L966 660L878 637Z','#c5c5c5');
b+=texture('M964 308L1094 283L1110 610L966 660Z','#b5b5b5');
b+=poly([[902,275],[1030,250],[1094,283],[964,308]],'#d8d8d8');
for(let t=.1;t<1;t+=.06)b+=line([[902-24*t,275+362*t],[964+2*t,308+352*t],[1094+16*t,283+327*t]],'#999999',.7);
for(const [x,y]of [[805,700],[865,726],[816,726]]){
 for(let j=0;j<9;j++)b+=line([[x!+j*.6,y!+j*1.2],[x!+97+j*.6+(j%3)*2,y!-35+j*1.2]],'#858585',.75);
 for(const t of [.3,.7])b+=line([[x!+97*t-2,y!-35*t-2],[x!+97*t+9,y!-35*t+13]],'#666666',1.5);
}
await save('silk-road-hexi-wall',b);
