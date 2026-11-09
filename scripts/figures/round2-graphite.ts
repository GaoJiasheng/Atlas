/** Form-following pencil marks. No raster grain, noise filters or flat grey fields. */
import { path, line, f, pts, random, type Point } from './graphite.js';
export { path, line, pts, type Point };
let serial=0;
export type Bounds=readonly [number,number,number,number];
/** Two broken, slightly curved hatch families, density controlled by the surface's lighting. */
export function pencilSurface(d:string, box:Bounds, tone:(u:number,v:number)=>number, angle=-.7, bend=4, seed=17):string {
 const id=`pencil-${++serial}`,r=random(seed),[x,y,w,h]=box;
 let marks='';
 for(let pass=0;pass<2;pass++){
  const step=pass?7:4.2;
  for(let yy=y-20;yy<y+h+20;yy+=step)for(let xx=x-20;xx<x+w+20;xx+=16){
   const u=(xx-x)/w,v=(yy-y)/h,dark=Math.max(0,Math.min(1,tone(u,v)));
   if(r()>(pass?Math.max(0,(dark-.28)*.83):.40+dark*.60))continue;
   const a=pass?angle+1.45:angle,l=9+r()*15;
   const sx=xx+r()*7,sy=yy+(r()-.5)*3;
   marks+=path(`M${f(sx)} ${f(sy)}q${f(l*.5)} ${f(l*a*.5+bend*(u-.5))} ${f(l)} ${f(l*a)}`,'none','#444',.42+r()*.48,`opacity="${f(.13+dark*.48)}"`);
  }
 }
 const stops=Array.from({length:13},(_,i)=>{const t=i/12,k=Math.max(0,Math.min(1,tone(t,.55))),g=Math.round(244-145*k);return `<stop offset="${t}" stop-color="rgb(${g},${g},${g})"/>`;}).join('');
 return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath><linearGradient id="${id}-tone">${stops}</linearGradient></defs>`+path(d,`url(#${id}-tone)`,'#585858',1.2)+`<g clip-path="url(#${id})">${marks}</g>`+path(d,'none','#666',.43,'transform="translate(.55 -.4)" opacity=".65"');
}
export function face(p:readonly Point[],shade=.4,angle=-.7):string {
 const xs=p.map(a=>a[0]),ys=p.map(a=>a[1]);
 return pencilSurface(`M${pts(p)}Z`,[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)],(u,v)=>shade+.1*v+.06*Math.sin(u*9),angle,1);
}
/** A broad cylinder swept along a sampled centreline; hatching wraps the tube. */
export function tube(p:readonly Point[],radius:number,seed=2):string {
 const left:Point[]=[],right:Point[]=[],r=random(seed);let hatch='';
 for(let i=0;i<p.length;i++){
  const a=p[Math.max(0,i-1)]!,b=p[Math.min(p.length-1,i+1)]!,q=p[i]!,l=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const nx=-(b[1]-a[1])/l,ny=(b[0]-a[0])/l,t=i/(p.length-1),rr=radius*(1-t)**.65+1;
  left.push([q[0]+nx*rr,q[1]+ny*rr]);right.push([q[0]-nx*rr,q[1]-ny*rr]);
  if(i%2===0)hatch+=path(`M${f(q[0]+nx*rr*.95)} ${f(q[1]+ny*rr*.95)}Q${f(q[0]-nx*rr*.15)} ${f(q[1]-ny*rr*.15-2)} ${f(q[0]-nx*rr*.65)} ${f(q[1]-ny*rr*.65)}`,'none','#555',.45+r()*.45,`opacity="${.3+r()*.3}"`);
 }
 const d=`M${pts([...left,...right.reverse()])}Z`;
 return path(d,'#eeeeee','#555',1.1)+hatch+line(left,'#555',.45,'transform="translate(.55 -.5)" opacity=".7"');
}
export function cubic(a:Point,b:Point,c:Point,d:Point,n=100):Point[]{
 return Array.from({length:n+1},(_,i)=>{const t=i/n,s=1-t;return[s*s*s*a[0]+3*s*s*t*b[0]+3*s*t*t*c[0]+t*t*t*d[0],s*s*s*a[1]+3*s*s*t*b[1]+3*s*t*t*c[1]+t*t*t*d[1]];});
}

/** Geometry guide only: AI-rendered final plates are never overwritten by this operation. */
export async function saveGuide(id:string,body:string){
 const {mkdirSync,writeFileSync}=await import('node:fs');
 const sharp=(await import('sharp')).default;
 const {svg}=await import('./graphite.js');
 const {PREVIEW,sectionDefs}=await import('./redo-cd-utils.js');
 mkdirSync(`${PREVIEW}/svg`,{recursive:true});
 const source=svg(body,1200,900,sectionDefs);
 writeFileSync(`${PREVIEW}/svg/${id}.svg`,source);
 await sharp(Buffer.from(source)).png().toFile(`${PREVIEW}/${id}-guide.png`);
 console.log(`${id}: assertions passed, guide saved`);
}
