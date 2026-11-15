import assert from 'node:assert/strict';
import {save,path,line,ellipse,texture,type Point} from './continental-drift-plate.js';
export const dendrites:Point[][]=[[[257,351],[225,285],[188,225],[128,198]],[[280,343],[295,258],[334,198]],[[243,398],[169,370],[101,318]],[[245,460],[161,475],[84,530]],[[274,497],[231,584],[171,640]],[[320,499],[341,600],[410,658]]];
export const myelin=[490,635,780];export const terminals=[250,350,450,550,650];
assert.equal(dendrites.length,6);assert.equal(terminals.length,5);assert(myelin.every((x,i)=>i===0||x-myelin[i-1]!>128));
let b='';
for(const [i,p] of dendrites.entries()){
 b+=line(p,'#686868',9)+line(p,'#dedede',5);
 const a=p[2]!,end=p.at(-1)!;
 b+=line([a,[a[0]+(i%2?55:-34),a[1]-35]],'#787878',3);
 b+=line([end,[end[0]-20,end[1]-38]],'#787878',2);
 b+=line([p[1]!,[p[1]![0]-42,p[1]![1]+20]],'#787878',2.6);
}
b+=texture('M247 345C267 369 285 332 315 345C335 375 349 385 382 403L434 437L455 447L433 460L383 467C350 465 352 494 320 504C294 480 278 514 263 485C265 465 234 465 246 436C234 409 239 377 247 345Z','#d2d2d2');
b+=ellipse(301,428,56,57,'#bfbfbf','#767676',1.7)+ellipse(301,428,56,57,'url(#hatch)','none');
// One uninterrupted axon, including bare initial segment; no break symbol.
b+=path('M435 447C510 447 550 452 610 451S780 449 910 450','none','#606060',14)+path('M435 447C510 447 550 452 610 451S780 449 910 450','none','#d6d6d6',9);
for(const x of myelin){b+=texture(`M${x} 407Q${x-15} 451 ${x} 495Q${x+55} 510 ${x+122} 493Q${x+137} 451 ${x+122} 408Q${x+60} 393 ${x} 407Z`,'#c3c3c3');for(let i=0;i<8;i++)b+=path(`M${x+10+i*14} 413q-11 40 0 76`,'none','#999999',.8);}
for(const [i,y]of terminals.entries()){
 b+=path(`M910 450C${948+i*6} 450 ${1002-i*9} ${y} 1080 ${y}`,'none','#737373',6)+ellipse(1088,y,17,12,'#b7b7b7','#666666',1.4);
}
await save('brain-and-nerves-neuron',b);
