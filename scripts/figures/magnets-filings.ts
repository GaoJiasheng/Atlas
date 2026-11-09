/** Pole identity is explicit. Filings follow the summed point-pole field. */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { etched, line, path, random, svg, writePlate, type Point } from './graphite';
type Pole={x:number;y:number;q:number};
export const poles=(like:boolean):Pole[]=>[{x:150,y:0,q:-1},{x:390,y:0,q:1},{x:810,y:0,q:like?1:-1},{x:1050,y:0,q:like?-1:1}];
export function field(x:number,y:number,like:boolean):Point {let vx=0,vy=0;for(const p of poles(like)){const dx=x-p.x,dy=y-p.y,rr=(dx*dx+dy*dy+225)**1.5;vx+=p.q*dx/rr;vy+=p.q*dy/rr;}return [vx,vy];}
export function assertFilings():void {for(const like of [false,true]){const p=poles(like);assert.equal(p.length,4);assert.equal(p[0]!.q,-p[1]!.q);assert.equal(p[2]!.q,-p[3]!.q);assert.equal(p[1]!.q===p[2]!.q,like);}assert(field(600,0,false)[0]>0);assert(Math.hypot(...field(600,0,true))<1e-18);assert(field(600,100,true)[1]>0);}
function panel(y:number,like:boolean):string {
 const r=random(like?725:931);let filings='';
 // Real filings gather where the field is strong and line up along it: accept a
 // candidate with a probability that grows with |B|, inside a soft oval sheet.
 const ref=Math.hypot(...field(600,0,false));
 for(let j=0;j<9000;j++){const x=30+r()*1140,yy=-200+r()*400;if((x>112&&x<428||x>772&&x<1088)&&Math.abs(yy)<84)continue;
  const v=field(x,yy,like),norm=Math.hypot(...v);if(norm<1e-12)continue;
  const sheet=Math.exp(-(((x-600)/585)**6)-((yy/205)**4));if(r()>sheet*Math.min(1,(norm/ref)**.55*.19))continue;
  const l=5+r()*9,dx=v[0]/norm*l/2,dy=v[1]/norm*l/2;filings+=line([[x-dx,yy-dy],[x+dx,yy+dy]],'#474747',.8+r()*.7,`opacity="${.5+r()*.45}"`);}
 const bar=(x:number,northOnRight:boolean)=>{
  const left=northOnRight?'#dedede':'#696969',right=northOnRight?'#696969':'#dedede';
  return etched(`M${x} -72h300v144h-300Z`,'url(#metal)')+etched(`M${x+3} -69h147v138h-147Z`,left)+etched(`M${x+150} -69h147v138h-147Z`,right)+line([[x+3,-67],[x+297,-67]],'#eeeeee',2)+path(`M${x} 72l10 11h300V-60l-10 -12v144Z`,'url(#dark)','#555555',1)+[0,1].map(i=>`<text x="${x+75+i*150}" y="36" text-anchor="middle" font-family="Georgia, serif" font-size="102" fill="${(i===1)===northOnRight?'#eeeeee':'#444444'}">${(i===1)===northOnRight?'N':'S'}</text>`).join('');
 };
 return `<g transform="translate(0 ${y})">${filings}${bar(120,true)}${bar(780,!like)}</g>`;
}
export const filingsSvg=()=>svg(panel(230,false)+panel(670,true));
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertFilings();await writePlate('public/illustrations/figures/magnets-filings.webp',filingsSvg());}
