/** Form-following pencil marks, never pixel noise or material-image fills. */
import { f, line, path, random, type Point } from './graphite';

export function pencil(points: Point[], width=1, opacity=.65, ink='#393939'):string {
 return line(points,ink,width,`opacity="${f(opacity)}"`)+line(points.map(([x,y])=>[x+.24,y-.18] as Point),ink,width*.28,`opacity="${f(opacity*.35)}"`);
}

/** Interrupted parallel strokes, clipped to an exact silhouette. Tone is density. */
export function hatchShape(id:string,d:string,box:{x:number;y:number;w:number;h:number},step=3.2,opacity=.5,cross=false):string {
 const rng=random(id.split('').reduce((s,c)=>s+c.charCodeAt(0),734)),span=Math.max(box.w,box.h)*2;
 let marks='';
 for(const slope of cross?[.8,-1.15]:[.8]) {
  for(let u=-span;u<box.w+span;u+=step) {
   for(let v=-rng()*65;v<box.h;) {
    const len=47+rng()*30,x=box.x+u+slope*v,y=box.y+v;
    v+=len+1+rng()*3;
    if(Math.max(x,x+slope*len)<box.x-1||Math.min(x,x+slope*len)>box.x+box.w+1)continue;
    marks+=pencil([[x,y],[x+slope*len*.5+.2*rng(),y+len*.5],[x+slope*len,y+len]],.34+rng()*.23,opacity*(.8+rng()*.2));
   }
  }
 }
 return `<clipPath id="${id}">${path(d,'white','none')}</clipPath><g clip-path="url(#${id})">${marks}</g>`;
}

const polar=(a:number,r:number):Point=>[f(Math.cos(a)*r),f(Math.sin(a)*r)];
/** A turned bezel: curved strokes follow its concentric sections; oblique strokes
 * cross them. Every boundary and every mark is registered to the same centre. */
export function bezelHatching(outer=600,inner=527):string {
 const rng=random(703); let marks='';
 const shade=(r:number,a:number)=>{
  const light=(1+Math.cos(a-Math.PI/4))/2;
  const groove=Math.exp(-(((r-535)/7)**2))*.35+Math.exp(-(((r-573)/5)**2))*.25;
  const highlight=Math.exp(-(((r-584)/3.8)**2))*.5+Math.exp(-(((r-554)/6)**2))*.3;
  return Math.max(.13,Math.min(.94,.30+.48*light+groove-highlight));
 };
 for(let r=inner+.6;r<outer-.3;r+=1.05) {
  // One full turn per ring from a random phase: no doubled sector, no gaps.
  const a0=-.18*rng();
  for(let a=a0;a<a0+Math.PI*2-1e-9;a+=.18) {
   const end=Math.min(a0+Math.PI*2,a+.18),rr=r+(rng()-.5)*.13;
   const p=polar(a,rr),q=polar(end,rr),m=polar((a+end)/2,rr);
   marks+=path(`M${p.join(' ')}Q${m.map(v=>f(v/Math.cos((end-a)/2))).join(' ')} ${q.join(' ')}`,'none','#353535',.76+rng()*.18,`opacity="${f(shade(r,a)*(.94+rng()*.06))}"`);
  }
 }
 for(let a=0;a<Math.PI*2;a+=.012) {
  for(const [r0,r1] of [[528,548],[549,569],[570,598]]) {
   const p=polar(a,r0!),q=polar(a+.022,r1!);
   marks+=pencil([p,polar(a+.011,(r0!+r1!)/2),q],.45+rng()*.13,shade((r0!+r1!)/2,a)*.38);
  }
 }
 return marks;
}

/** Gently bowed face hatching; density builds at the lip and lower-right edge.
 * The white substrate is only paper, all visible tone comes from pencil marks. */
export function faceHatching(id:string,r=527):string {
 const rng=random(291);let marks='';
 for(let y=-r-50;y<r+50;y+=1.8) {
  for(let x=-r-20;x<r;x+=21+rng()*24) {
   const len=17+rng()*31,yy=y+.00011*x*x,rr=Math.hypot(x,yy)/r;
   const edge=Math.max(0,(rr-.62)/.38),lower=(x+yy+2*r)/(4*r);
   const opacity=.035+.13*edge*edge+.08*lower;
   marks+=path(`M${f(x)} ${f(yy)}q${f(len/2)} ${f(.00011*x*len)} ${f(len)} ${f(.00011*(2*x*len+len*len))}`,'none','#515151',.52+rng()*.43,`opacity="${f(opacity*(.7+rng()*.3))}"`);
  }
 }
 // Clip the bowed strokes to the exact recessed face boundary.
 const d=`M${-r} 0a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0`;
 return `<clipPath id="${id}">${path(d,'white','none')}</clipPath><g clip-path="url(#${id})">${marks}</g>`;
}
