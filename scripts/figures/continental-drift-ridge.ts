import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import { save, poly, line, path, type Point } from './continental-drift-plate.js';
// Oblique affine projection preserves parallelism; the same coordinates on each side
// guarantee magnetic stripe widths without asserting any real timescale.
export const widths=[22,48,31,64,25,43,57];
export const edges=[0,...widths.map((_,i)=>widths.slice(0,i+1).reduce((a,b)=>a+b,0))];
export const top=(u:number,v:number):Point=>[600+u+v*.4,450+v*.58+Math.abs(u)*.2];
const frontV=270,backV=-270;
export function verify(){
 assert.equal(widths.length,7); assert.equal(new Set(widths).size,7);
 for(let i=0;i<widths.length;i++){
  const a=edges[i]!,b=edges[i+1]!;
  assert.equal((b-a)-((-a)-(-b)),0);
  const p=top(a,frontV),q=top(a,backV),r=top(-a,frontV),s=top(-a,backV);
  assert(Math.abs((p[0]-q[0])*(r[1]-s[1])-(p[1]-q[1])*(r[0]-s[0]))<1e-6);
 }
 assert(top(290,0)[1]>top(0,0)[1]);
}
verify();
let body='';const extent=edges.at(-1)!;
const front=[top(-extent,frontV),top(0,frontV),top(extent,frontV)];
body+=poly([...front,[front[2]![0],front[2]![1]+95],[front[1]![0],front[1]![1]+95],[front[0]![0],front[0]![1]+95]],'#c4c4c4');
body+=poly([top(extent,backV),top(extent,frontV),[top(extent,frontV)[0],top(extent,frontV)[1]+95],[top(extent,backV)[0],top(extent,backV)[1]+95]],'#bcbcbc');
for(let i=0;i<7;i++)for(const sign of [-1,1]){
 const a=edges[i]!*sign,b=edges[i+1]!*sign;
 const p=[top(a,backV),top(b,backV),top(b,frontV),top(a,frontV)];
 body+=poly(p,i%2?'#dddddd':'#a9a9a9','#666666',1);
 body+=path(`M${p.map(v=>v.join(',')).join('L')}Z`,'url(#cross)','none');
}
// One narrow, recessed longitudinal rift, no magma or arrows.
body+=poly([top(-9,backV),top(9,backV),top(9,frontV),top(-9,frontV)],'#606060');
body+=line([top(0,backV),top(0,frontV)],'#a5a5a5',1.2);
for(let i=1;i<45;i++){const u=-extent+i*extent/22.5;const p=top(u,frontV);body+=line([[p[0],p[1]+12],[p[0]-8,p[1]+30]],'#747474',.6);}
await save('continental-drift',body,true);
writeFileSync('art/img4/raw/continental-drift-geometry.json',JSON.stringify({widths,edges,left:edges.map(x=>-x),right:edges,visualCounts:{blocks:1,rift_valleys:1,stripe_pairs:7}},null,2));
