/** pnpm tsx scripts/figures/light-shadows.ts
 * A single cylinder, turned 90°. Collimated (parallel) torch rays travel along +X.
 * Orthographic projection to x=850 preserves Y/Z exactly: rectangle or circle.
 * Parallel light is explicit in the bilingual caption; a finite point source would
 * curve the side-on cylinder's silhouette and would not give an exact rectangle.
 */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { line, path, pts, svg, writePlate, type Point } from './graphite';
export type Vec3=readonly[number,number,number];
export const CAN={x:475,radius:52,length:170};
export const SCREEN=850;
export const project=([,y,z]:Vec3):Vec3=>[SCREEN,y,z];
/** Same affine view for both arrangements and for their calculated shadows. */
export const view=([x,y,z]:Vec3):Point=>[x+.62*y, -z-.42*y];
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
function can(axis:'x'|'y'):string {
 const n=ring(axis,-CAN.length/2),p=ring(axis,CAN.length/2);
 // The exposed cylinder wall is the convex hull of both exact end rings.
 const points=[...n,...p].map(view).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(o:Point,a:Point,b:Point)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const half=(a:Point[])=>{const h:Point[]=[];for(const p of a){while(h.length>=2&&cross(h.at(-2)!,h.at(-1)!,p)<=0)h.pop();h.push(p);}return h;};
 const hull=[...half(points).slice(0,-1),...half([...points].reverse()).slice(0,-1)];
 let details='';
 for(const end of [-CAN.length/2+5,CAN.length/2-5])details+=poly(ring(axis,end),'none','#777777',1.3);
 for(let i=0;i<16;i++){const a=i*Math.PI/8;const c=CAN.radius*Math.cos(a),s=CAN.radius*Math.sin(a);if(axis==='x')details+=line([view([CAN.x-CAN.length/2,c,s]),view([CAN.x+CAN.length/2,c,s])],'#888888',.8,'opacity=".3"');else details+=line([view([CAN.x+c,-CAN.length/2,s]),view([CAN.x+c,CAN.length/2,s])],'#888888',.8,'opacity=".3"');}
 return `<polygon points="${pts(hull)}" fill="url(#metal)" stroke="#555555" stroke-width="2.5"/>`+
 `<polygon points="${pts(hull)}" fill="url(#hatch)" opacity=".45"/>`+details+
 poly(axis==='x'?n:p,'#c4c4c4','#555555',2.4)+poly(axis==='x'?n:p,'url(#hatch)','#777777',1)+
 poly(ring(axis,axis==='x'?-CAN.length/2+4:CAN.length/2-4),'none','#888888',1);
}
function torch():string {
 const lens=(x:number,r:number):Vec3[]=>Array.from({length:97},(_,i)=>[x,r*Math.cos(i/96*2*Math.PI),r*Math.sin(i/96*2*Math.PI)]);
 // The collimating lens aperture covers the full Y/Z extent of both tin orientations.
 return path('M100 -36H197L250 -110V110L197 36H100Z','url(#metal)')+
 path('M100 -36H197L250 -110V110L197 36H100Z','url(#hatch)','#555555',2)+
 poly(lens(100,33),'#888888')+poly(lens(250,110),'#eeeeee','#555555',2.6)+
 poly(lens(250,102),'none','#aaaaaa',1)+
 path('M150 38V128H120V141H205V128H174V38Z','#bdbdbd')+
 path('M131 -24H182V-17H131Z','#777777','#555555',1);
}

export function shadowsSvg():string {
 return svg((['y','x'] as const).map((axis,index)=>{
  const corners:Vec3[]=[[SCREEN,-150,-132],[SCREEN,150,-132],[SCREEN,150,132],[SCREEN,-150,132]];
  const screen=poly(corners,'#eeeeee','#555555',2.6);
  const silhouettePts=silhouette(axis), sh=shadow(axis);
  const rays=(axis==='y'?silhouettePts: [silhouettePts[0]!,silhouettePts[24]!,silhouettePts[48]!,silhouettePts[72]!]).map(p=>{
    const q=project(p),start:Vec3=[250,p[1],p[2]];
    // Dashed segment behind the opaque object is a geometric construction, not transmitted light.
    return line([view(start),view(p)],'#999999',1.3)+line([view(p),view(q)],'#999999',1.2,'stroke-dasharray="7 6"');
  }).join('');
  const support=path('M451 55V119H425V132H527V119H500V55Z','#c2c2c2')+line([[433,125],[519,125]],'#777777',1);
  return `<g transform="translate(45 ${245+index*400})">`+
   screen+poly(sh,'#777777','none',0)+poly(sh,'url(#cross)','none',0)+
   line([view([SCREEN,-150,-132]),view([SCREEN+8,-150,-132]),view([SCREEN+8,-150,132]),view([SCREEN,-150,132])],'#777777',3)+
   rays+support+can(axis)+torch()+'</g>';
 }).join(''));
}
export const OUTPUT='public/illustrations/figures/light-and-shadows-same-object-two-shadows.webp';
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertShadows();await writePlate(OUTPUT,shadowsSvg());}
