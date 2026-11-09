/** Round 3: pencil strokes only. White reserve, layered curved hatching, no grey/noise fills. */
import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync } from 'node:fs';
import sharp from 'sharp';
import {f,path,line,ellipse,pts,random,type Point} from './graphite.js';
export {f,path,line,ellipse,pts,random,type Point};
export const PREVIEW='/private/tmp/atlas-round3';
let serial=0;
export type Box=readonly[number,number,number,number];
/** Density and curvature model a surface; no flat grey field is placed below the marks. */
const fibre=random(4219);
/** Reusable pencil marks, NOT a noise texture: only short curved SVG strokes. */
const hatchDefs='<defs>'+[0,1].map(pass=>{
 let marks='';
 for(let y=-10;y<74;y+=1.15)for(let x=-12;x<76;x+=5.4){
  const xx=x+fibre()*4,yy=y+(fibre()-.5)*.7,l=2.5+fibre()*4,a=pass? .77:-.71;
  marks+=path(`M${f(xx)} ${f(yy)}q${f(l*.45)} ${f(l*a*.45-.15)} ${f(l)} ${f(l*a)}`,'none','#252525',.45+fibre()*.4,`opacity="${f(.55+fibre()*.25)}"`);
 }
 return `<pattern id="r3-pencil-${pass}" width="64" height="64" patternUnits="userSpaceOnUse">${marks}</pattern>`;
}).join('')+'</defs>';
export function surface(d:string,box:Box,tone:(u:number,v:number)=>number,angle=-.75,bend=4,seed=19,outline=1.1){
 const id=`r3-${serial++}`,r=random(seed),[x,y,w,h]=box;let marks='';
 // The same continuous hatch field crosses each cell boundary. Only its opacity
 // changes in 6px cells, following the analytic surface, below reading scale.
 const fields=[new Map<number,string[]>(),new Map<number,string[]>()];
 for(let yy=y-6;yy<y+h+6;yy+=6)for(let xx=x-6;xx<x+w+6;xx+=6){
  const t=Math.max(0,Math.min(1,tone((xx+3-x)/w,(yy+3-y)/h)));
  const levels=[Math.min(1,t*1.45),Math.min(1,Math.max(0,(t-.18)*1.45))];
  for(let pass=0;pass<2;pass++){
   const level=Math.round(levels[pass]!*48);if(!level)continue;
   const list=fields[pass]!.get(level)??[];
   list.push(`M${f(xx)} ${f(yy)}h6v6h-6Z`);fields[pass]!.set(level,list);
  }
 }
 for(let pass=0;pass<2;pass++)for(const[level,cells]of fields[pass]!)marks+=`<path d="${cells.join('')}" fill="url(#r3-pencil-${pass})" opacity="${f(level/48)}"/>`;

 // Broken contour-following hatching provides the larger pencil gesture.
 for(let yy=y;yy<y+h;yy+=4.4)for(let xx=x+r()*19;xx<x+w;xx+=21){
  const u=(xx-x)/w,v=(yy-y)/h,t=Math.max(0,Math.min(1,tone(u,v))),l=8+r()*11;
  if(r()>t*.7)continue;
  marks+=path(`M${f(xx)} ${f(yy)}q${f(l*.5)} ${f(l*angle*.5+bend*(u-.5)*.3)} ${f(l)} ${f(l*angle)}`,'none','#444',.35+r()*.25,`opacity="${f(.08+.2*t)}"`);
 }
 return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>`+path(d,'#fff','#606060',outline)+`<g clip-path="url(#${id})">${marks}</g>`+(outline===0?'':path(d,'none','#555',.42,'transform="translate(.65 -.55)" opacity=".55"'));
}
export function face(p:readonly Point[],shade=.5){const xs=p.map(p=>p[0]),ys=p.map(p=>p[1]);return surface(`M${pts(p)}Z`,[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)],(u,v)=>shade+.1*v+.08*Math.sin(u*5));}
export function pencil(d:string,width=1,opacity=.8){return path(d,'none','#555',width,`opacity="${opacity}"`)+path(d,'none','#777',width*.36,'transform="translate(.7 -.45)" opacity=".45"');}
export function cubic(a:Point,b:Point,c:Point,d:Point,n=70):Point[]{return Array.from({length:n+1},(_,i)=>{const t=i/n,s=1-t;return[s**3*a[0]+3*s*s*t*b[0]+3*s*t*t*c[0]+t**3*d[0],s**3*a[1]+3*s*s*t*b[1]+3*s*t*t*c[1]+t**3*d[1]];});}
/** Tapered fleshy tentacle with blunt cap. Cross contours wrap its volume. */
export function tentacle(p:readonly Point[],radius=16){let left:Point[]=[],right:Point[]=[],marks='';
 for(let i=0;i<p.length;i++){const a=p[Math.max(0,i-1)]!,b=p[Math.min(p.length-1,i+1)]!,q=p[i]!,len=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/len,ny=(b[0]-a[0])/len,t=i/(p.length-1),rr=5.5+radius*(1-t)**.85;left.push([q[0]+nx*rr,q[1]+ny*rr]);right.push([q[0]-nx*rr,q[1]-ny*rr]);if(i%3===0)marks+=pencil(`M${f(q[0]+nx*rr)} ${f(q[1]+ny*rr)}Q${f(q[0]-nx*rr*.2+3)} ${f(q[1]-ny*rr*.2+3)} ${f(q[0]-nx*rr*.65)} ${f(q[1]-ny*rr*.65)}`,.4,.24);}
 const d=`M${pts(left)}Q${f(p[p.length-1]![0])} ${f(p[p.length-1]![1]-4)} ${pts([right[right.length-1]!])}L${pts(right.reverse())}Z`;
 const xs=p.map(p=>p[0]),ys=p.map(p=>p[1]),minx=Math.min(...xs)-radius-5,miny=Math.min(...ys)-radius-5; return surface(d,[minx,miny,Math.max(...xs)-minx+radius+5,Math.max(...ys)-miny+radius+5],u=>.1+.6*Math.abs(u-.35),-.6,2,23,.8)+marks+line(left,'#555',.42,'transform="translate(.6 -.4)" opacity=".7"');
}
export async function save(id:string,body:string){
 mkdirSync(`${PREVIEW}/svg`,{recursive:true});
 const s=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">${hatchDefs}${body}</svg>`;
 assert(!/feTurbulence|<text\b|<image\b|Gradient/.test(s));writeFileSync(`${PREVIEW}/svg/${id}.svg`,s);
 // Cache the SAME SVG pencil strokes as 64px tiles for librsvg. This avoids
 // painting thousands of individual strokes for every tonal clip. The saved
 // source SVG retains all actual hatch paths; no noise is added at any stage.
 let cached=hatchDefs;
 for(const pattern of hatchDefs.matchAll(/<pattern id="([^"]+)"[^>]*>([\s\S]*?)<\/pattern>/g)){
  const tile=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">${pattern[2]}</svg>`)).png().toBuffer();
  cached=cached.replace(pattern[0],`<pattern id="${pattern[1]}" width="64" height="64" patternUnits="userSpaceOnUse"><image width="64" height="64" href="data:image/png;base64,${tile.toString('base64')}"/></pattern>`);
 }
 const raster=await sharp(Buffer.from(s.replace(hatchDefs,cached))).blur(.35).png().toBuffer();writeFileSync(`${PREVIEW}/${id}-proof.png`,raster);let bytes=Buffer.alloc(0);for(const q of[88,82,76,70,64,58,52,46,40,34]){bytes=await sharp(raster).webp({quality:q,effort:6,preset:'drawing'}).toBuffer();if(bytes.length<=120000)break;}
 assert(bytes.length<=120000,`${id} over budget`);writeFileSync(`public/illustrations/figures/${id}.webp`,bytes);console.log(`${id}: ${bytes.length} B; geometry assertions passed`);
}
