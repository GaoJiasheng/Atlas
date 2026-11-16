import assert from 'node:assert/strict';
import {save,poly,path,line,ellipse,texture,type Point} from './continental-drift-plate.js';
export const mastCount=1,sails=1,nails=0;assert.equal(mastCount,1);assert.equal(nails,0);
const seam=(t:number,z:number):Point=>[110+980*t,563+80*Math.sin(t*Math.PI)+z];
let b='';
b+=texture('M100 448Q565 323 1090 437L1040 617Q626 780 164 625Z','#bdbdbd');
b+=path('M100 448Q570 521 1090 437','none','#666666',3);
// Cut-open near side ends below the cargo, one coherent wooden hull.
b+=texture('M164 577Q614 681 1047 563L1040 617Q626 780 164 625Z','#c6c6c6');
b+=line([[563,443],[555,119]],'#777777',18)+line([[563,443],[555,119]],'#bcbcbc',12);
// One square sail tightly furled to one yard; no spread triangular/junk sails.
b+=line([[418,178],[713,178]],'#6d6d6d',9);
b+=texture('M428 166Q569 150 703 167L703 192Q562 207 428 192Z','#d4d4d4');
for(let x=446;x<700;x+=37)b+=path(`M${x} 164q-7 13 0 30`,'none','#888888',1.5);
b+=line([[555,130],[199,534]],'#777777',1.5)+line([[555,130],[995,521]],'#777777',1.5);
// Plain jars with the near wall removed to show stacks INSIDE.
for(const [x,y]of [[349,477],[619,478],[859,463]]){
 b+=texture(`M${x!-61} ${y!-32}Q${x!-97} ${y!+18} ${x!-69} ${y!+103}Q${x!} ${y!+135} ${x!+69} ${y!+103}Q${x!+97} ${y!+18} ${x!+61} ${y!-32}Z`,'#c0c0c0');
 b+=ellipse(x!,y!-32,61,20,'#8f8f8f','#666666',1.6);
 for(let j=0;j<5;j++){const yy=y!+75-j*22;b+=path(`M${x!-45} ${yy}Q${x!} ${yy+29} ${x!+45} ${yy}L${x!+35} ${yy+23}Q${x!} ${yy+43} ${x!-35} ${yy+23}Z`,'#dfdfdf','#777777',1.2)+ellipse(x!,yy,45,11,'#b7b7b7','#777777',.9);}
 b+=path(`M${x!-69} ${y!+103}Q${x!} ${y!+135} ${x!+69} ${y!+103}`,'none','#777777',2);
}
// Plank joins stitched edge-to-edge, two rows of holes and crossing cord spans.
for(let j=0;j<3;j++){
 const z=j*22; const ps=Array.from({length:42},(_,i)=>seam(.07+i*.02,z));b+=line(ps,'#777777',1.2);
 for(let i=0;i<40;i++){const t=.08+i*.021,a=seam(t,z-5),c=seam(t+.013,z+5);b+=ellipse(...a,2.2,1.8,'#666666','none')+ellipse(...c,2.2,1.8,'#666666','none')+line([a,c],'#666666',1.1);}
}
await save('silk-road-sewn-ship',b);
