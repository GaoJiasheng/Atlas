import { saveGuide } from './round2-graphite.js';
/** Photograph-traced pump-building and roof profile; nine-bay elevation is rectified. */
import assert from 'node:assert/strict';
import {main,path,line,ellipse} from './redo-cd-utils.js';
import {face,pencilSurface,type Point} from './round2-graphite.js';
export function barrage(){
 const gates=Array.from({length:9},(_,i)=>({x:15+i*130,w:126}));
 assert.equal(gates.length,9);assert(gates.every(g=>g.w*.35>=40));
 assert.equal(gates.at(-1)!.x+gates.at(-1)!.w,1181);
 let b='';
 // Distant skyline contour: 2009 pump-building photograph + roof panorama.
 const skyline:Point[]=[[110,365],[110,275],[143,275],[143,365],[164,365],[164,235],[204,235],[204,365],[230,365],[230,180],[267,165],[301,183],[301,365],[330,365],[330,240],[368,240],[368,365],[393,365],[393,215],[424,215],[424,365],[450,365],[450,300],[490,300],[490,365],[520,365]];
 b+=path(`M${skyline.map(p=>p.join(' ')).join('L')}Z`,'#ddd','#999',1);
 b+=ellipse(268,283,106,106,'none','#aaa',1.8);
 for(let i=0;i<18;i++){const a=i*Math.PI/9;b+=line([[268,283],[268+105*Math.cos(a),283+105*Math.sin(a)]],'#bbb',.6);}
 b+=path('M40 490Q600 468 1175 490L1180 745Q680 771 20 745Z','#f0f0f0','none');
 // Sea-side building: broad bowed roof, glazed end, open columns and planted ramp.
 b+=pencilSurface('M597 331Q842 305 1095 362L1091 470L610 470Z',[597,305,498,165],(u,v)=>.2+.45*v,.2,3);
 b+=face([[611,346],[790,346],[790,461],[618,461]],.85,.9);
 for(let x=630;x<786;x+=24)b+=line([[x,348],[x,459]],'#bbb',1);
 for(let y=368;y<458;y+=24)b+=line([[619,y],[789,y]],'#aaa',1);
 for(let i=0;i<8;i++){const x=810+i*34;b+=face([[x,354+i*2],[x+9,356+i*2],[x+9,467],[x,467]],.4);}
 b+=pencilSurface('M589 314Q843 260 1115 350L1095 365Q845 312 597 331Z',[589,270,526,95],(u,v)=>.25+.3*v,.02,1);
 // Grass-covered roof/ramp, represented by short growing blades in graphite, not green colour.
 b+=pencilSurface('M810 468Q950 431 1095 431L1160 490L817 505Z',[810,431,350,74],()=>.4,.1,2);
 for(let i=0;i<32;i++){const x=825+i*10;b+=path(`M${x} ${490-i*.2}l4-10m-4 10l-4-7`,'none','#777',.8);}
 // Nine broad steel leaves below the low pedestrian deck; crest drop is shallow.
 for(const g of gates){
  b+=face([[g.x,554],[g.x+g.w,554],[g.x+g.w,599],[g.x,599]],.55,.02);
  b+=face([[g.x,599],[g.x+g.w,599],[g.x+g.w,620],[g.x,620]],.24,.1);
  b+=line([[g.x,601],[g.x+g.w,601]],'#f5f5f5',2.2);
  for(let i=0;i<12;i++){const x=g.x+6+i*10;b+=path(`M${x} 604q2 11-3 22`,'none','#aaa',.8);}
  b+=face([[g.x-2,531],[g.x+2,531],[g.x+2,624],[g.x-2,624]],.42);
 }
 b+=face([[12,511],[1184,511],[1184,547],[12,547]],.3,.02);
 b+=line([[13,486],[1182,486]],'#777',1.3);
 for(let i=0;i<10;i++)b+=line([[15+i*130,487],[15+i*130,512]],'#777',1.2);
 // Quiet water hatching and thin shallow overflow, no tall spillway.
 for(let i=0;i<45;i++){const x=30+(i%9)*128,y=663+Math.floor(i/9)*19;b+=path(`M${x} ${y}q22-5 43 0t43 0`,'none','#aaa',.7);}
 return b;
}
if(main(import.meta.url))await saveGuide('water-marina-barrage',barrage());
