/** pnpm tsx scripts/figures/light-shadows.ts
 * A single cylinder, turned 90°. Collimated (parallel) torch rays travel along +X.
 * Orthographic projection to x=850 preserves Y/Z exactly: rectangle or circle.
 * Parallel light is explicit in the bilingual caption; a finite point source would
 * curve the side-on cylinder's silhouette and would not give an exact rectangle.
 */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { cast, line, pts, random, svg, writePlate, type Point } from './graphite';
export type Vec3=readonly[number,number,number];
export const CAN={x:475,radius:52,length:170};
export const SCREEN=850;
export const project=([,y,z]:Vec3):Vec3=>[SCREEN,y,z];
/** Same affine view for both arrangements and for their calculated shadows. */
export const view=([x,y,z]:Vec3):Point=>[x+.72*y, -z-.28*y];
function ring(axis:'x'|'y',end:number):Vec3[] {
 return Array.from({length:97},(_,i)=>{const a=i/96*2*Math.PI,c=CAN.radius*Math.cos(a),s=CAN.radius*Math.sin(a);return axis==='x'?[CAN.x+end,c,s]:[CAN.x+c,end,s];});
}
export function silhouette(axis:'x'|'y'):Vec3[] {
 return axis==='x'?ring('x',-CAN.length/2):[
 [CAN.x,-CAN.length/2,-CAN.radius],[CAN.x,CAN.length/2,-CAN.radius],
 [CAN.x,CAN.length/2,CAN.radius],[CAN.x,-CAN.length/2,CAN.radius],
 ];
}
export function shadow(axis:'x'|'y'):Vec3[] { return silhouette(axis).map(project); }
export function assertShadows():void {
 const circle=shadow('x');for(const p of circle){assert.equal(p[0],SCREEN);assert(Math.abs(Math.hypot(p[1],p[2])-CAN.radius)<1e-9);}
 const rectangle=shadow('y');assert.equal(rectangle.length,4);
 assert.equal(Math.max(...rectangle.map(p=>p[1]))-Math.min(...rectangle.map(p=>p[1])),CAN.length);
 assert.equal(Math.max(...rectangle.map(p=>p[2]))-Math.min(...rectangle.map(p=>p[2])),2*CAN.radius);
 for(const axis of ['x','y'] as const) silhouette(axis).forEach((p,i)=>{const q=shadow(axis)[i]!;assert.deepEqual(q.slice(1),p.slice(1));assert.equal(q[0],SCREEN);});
}
const poly=(points:readonly Vec3[],fill:string,stroke='#666666',width=2)=>`<polygon points="${pts(points.map(view))}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
/** Cylinder wall strips and hatch strokes lie on the same analytic surface. */
function can(axis:'x'|'y'):string {
 const r=random(732),L=CAN.length/2;
 const at=(a:number,t:number,rad=CAN.radius):Vec3=>axis==='x'?[CAN.x+t,rad*Math.cos(a),rad*Math.sin(a)]:[CAN.x+rad*Math.cos(a),t,rad*Math.sin(a)];
 const visible=(a:number)=>axis==='x'?-Math.cos(a)+.28*Math.sin(a):.72*Math.cos(a)+.28*Math.sin(a);
 const front=axis==='x'?L:-L;
 const endRing=(t:number,rad=CAN.radius)=>Array.from({length:129},(_,i)=>at(i/128*2*Math.PI,t,rad));
 let wall='';
 for(let i=0;i<256;i++){
  const a=i/256*2*Math.PI,b=(i+1)/256*2*Math.PI;if(visible((a+b)/2)<0)continue;
  const lambert=axis==='x'?-.4*Math.cos(a)+.85*Math.sin(a):-.3*Math.cos(a)+.85*Math.sin(a);
  const v=Math.round(105+116*Math.max(0,lambert)),g=`rgb(${v},${v},${v})`;
  wall+=poly([at(a,-L),at(a,L),at(b,L),at(b,-L)],g,g,.3);
 }
 for(let i=0;i<1500;i++){
  const a=r()*Math.PI*2;if(visible(a)<0)continue;
  const t=-L+r()*CAN.length,len=2+r()*15;
  wall+=line([view(at(a,t)),view(at(a+.015,Math.min(L,t+len)))],i%4?'#555555':'#ffffff',.3+r()*.3,`opacity="${.12+r()*.3}"`);
 }
 const inset=front+(front>0?-1:1)*2;
 const face=poly(endRing(front),'#c9c9c9','#565656',1.2)+poly(endRing(front),'url(#hatch)','none',0)+
 [1,.93,.87,.77,.74].map((r,i)=>poly(endRing(front,r*CAN.radius),'none',i%2?'#f1f1f1':'#797979',i%2?.8:.55)).join('');
 let rims='';for(const t of [-L+4,-L+8,L-8,L-4]){
  const ring=endRing(t).filter((_,i)=>visible(i/128*Math.PI*2)>0);
  rims+=line(ring.map(view),'#666666',.7);
 }
 return poly(endRing(-front),'#aaaaaa','#666666',1)+wall+rims+face+
 line([view(at(.8,inset,0)),view(at(.8,inset,25))],'#b1b1b1',.5);
}
function torch():string {
 const ring=(x:number,r:number):Vec3[]=>Array.from({length:129},(_,i)=>[x,r*Math.cos(i/128*2*Math.PI),r*Math.sin(i/128*2*Math.PI)]);
 const at=(x:number,r:number,a:number):Vec3=>[x,r*Math.cos(a),r*Math.sin(a)];
 const tube=(x0:number,r0:number,x1:number,r1:number)=>{
  let out='';for(let i=0;i<192;i++){
   const a=i/192*2*Math.PI,b=(i+1)/192*2*Math.PI;
   if(-Math.cos(a)+.28*Math.sin(a)<0)continue;
   const v=Math.round(70+125*Math.max(0,-.5*Math.cos(a)+.8*Math.sin(a))),ink=`rgb(${v},${v},${v})`;
   out+=poly([at(x0,r0,a),at(x1,r1,a),at(x1,r1,b),at(x0,r0,b)],ink,ink,.4);
  }
  return poly(ring(x0,r0),'#999999','#555555',1)+out;
 };
 let lines='';const r=random(974);
 for(let i=0;i<520;i++){
  const a=Math.PI*.45+r()*Math.PI*.8,x=75+r()*100;
  lines+=line([view(at(x,35,a)),view(at(x+3+r()*10,35,a+.02))],'#444444',.4,'opacity=".4"');
 }
 const foot=poly([[95,-40,-133],[205,-40,-133],[205,40,-133],[95,40,-133]],'url(#metal)')+
 poly([[95,-40,-133],[205,-40,-133],[205,-40,-142],[95,-40,-142]],'#777777')+
 poly([[130,-12,-133],[170,-12,-133],[170,-12,-30],[130,-12,-30]],'url(#metal)')+poly([[130,-12,-133],[170,-12,-133],[170,-12,-30],[130,-12,-30]],'url(#cross)','none',0);
 return foot+tube(75,35,176,35)+lines+tube(176,35,250,110)+
 [80,86,165,173,244,250].map(x=>poly(ring(x,x>200?110:36),'none','#505050',1)).join('')+
 poly(ring(251,104),'#f0f0f0','#5b5b5b',1.2)+`<g opacity=".18">${poly(ring(252,98),'url(#hatch)','none',0)}</g>`+
 poly(ring(253,94),'none','#b4b4b4',.6)+
 poly([[128,-15,34],[157,-15,34],[157,8,34],[128,8,34]],'url(#metal)','#666666',.8);
}

export function shadowsSvg():string {
 return svg((['y','x'] as const).map((axis,index)=>{
  const corners:Vec3[]=[[SCREEN,-150,-132],[SCREEN,150,-132],[SCREEN,150,132],[SCREEN,-150,132]];
  const screen=poly(corners,'#ededed','#666666',1)+`<g opacity=".16">${poly(corners,'url(#hatch)','none',0)}</g>`;
  const silhouettePts=silhouette(axis), sh=shadow(axis);
  const rays=(axis==='y'?silhouettePts: [silhouettePts[0]!,silhouettePts[24]!,silhouettePts[48]!,silhouettePts[72]!]).map(p=>{
    const q=project(p),start:Vec3=[250,p[1],p[2]];
    // Dashed segment behind the opaque object is a geometric construction, not transmitted light.
    return line([view(start),view(p)],'#999999',.85)+line([view(p),view(q)],'#999999',.8,'stroke-dasharray="7 6"');
  }).join('');
  const support=poly([[425,-50,-135],[530,-50,-135],[530,50,-135],[425,50,-135]],'url(#metal)')+poly([[425,-50,-135],[530,-50,-135],[530,-50,-144],[425,-50,-144]],'#777777')+poly([[450,-18,-135],[494,-18,-135],[494,-18,-50],[450,-18,-50]],'url(#metal)')+poly([[450,-18,-135],[494,-18,-135],[494,-18,-50],[450,-18,-50]],'url(#cross)','none',0);
  return `<g transform="translate(45 ${245+index*400})">`+
   cast(485,145,475,39)+screen+poly(sh,'#646464','none',0)+poly(sh,'url(#cross)','none',0)+
   line([view([SCREEN,-150,-132]),view([SCREEN+8,-150,-132]),view([SCREEN+8,-150,132]),view([SCREEN,-150,132])],'#777777',2)+
   rays+support+can(axis)+torch()+'</g>';
 }).join(''));
}
export const OUTPUT='public/illustrations/figures/light-and-shadows-same-object-two-shadows.webp';
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertShadows();await writePlate(OUTPUT,shadowsSvg());}
