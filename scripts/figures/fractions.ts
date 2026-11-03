/** pnpm tsx scripts/figures/fractions.ts — eight exact 45° sectors, one moved out. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { pathToFileURL } from 'node:url';
import { f, path, random, svg, writePlate, type Point } from './graphite';
export const RADIUS=600;
export const SLICES=Array.from({length:8},(_,i)=>({start:(i-1)*Math.PI/4,end:i*Math.PI/4,offset:i===0?95:0}));
export const onCircle=(a:number,r=RADIUS):Point=>[r*Math.cos(a),r*Math.sin(a)];
export function sector(start:number,end:number,r=RADIUS):string {
 const a=onCircle(start,r), b=onCircle(end,r);
 return `M0 0L${f(a[0])} ${f(a[1])}A${r} ${r} 0 0 1 ${f(b[0])} ${f(b[1])}Z`;
}
export function assertFractions():void {
 assert.equal(SLICES.length,8);let area=0;
 for(const s of SLICES){assert(Math.abs(s.end-s.start-Math.PI/4)<1e-12);area+=(s.end-s.start)*RADIUS**2/2;}
 assert(Math.abs(area-Math.PI*RADIUS**2)<1e-8);
}
export function fractionsSvg(size=1600):string {
 const r=random(39017);let texture='';
 // Flattened roti blisters: irregular rings of graphite, with fine curved hatching.
 for(let i=0;i<220;i++) {
  const a=r()*Math.PI*2,rad=Math.sqrt(r())*588;const [x,y]=onCircle(a,rad);const rx=5+r()*24,ry=3+r()*9;
  const d=`M${f(x-rx)} ${f(y)}q${f(rx*.4)} ${f(-ry*1.7)} ${f(rx*1.3)} ${f(-ry)}q${f(rx*1.15)} ${f(ry*.35)} ${f(rx*.6)} ${f(ry*1.5)}q${f(-rx*.7)} ${f(ry)} ${f(-rx*1.9)} ${f(-ry*.5)}Z`;
  texture+=path(d,i%4===0?'#aaaaaa':'#cecece','#999999',.9,`opacity="${f(.25+r()*.4)}"`);
  if(i%2===0)texture+=path(`M${f(x-rx*.5)} ${f(y)}q${f(rx*.55)} ${f(-ry*.6)} ${f(rx)} 0`,'none','#777777',1.1,'opacity=".42"');
 }
 // Irregular lamination lines retain the original roti's flaky, hand-drawn surface.
 for(let i=0;i<90;i++){
  const a=r()*Math.PI*2,rad=100+r()*450,span=.05+r()*.13;
  const p=onCircle(a,rad),q=onCircle(a+span,rad),m=onCircle(a+span*.45,rad+6+r()*8);
  texture+=path(`M${f(p[0])} ${f(p[1])}Q${f(m[0])} ${f(m[1])} ${f(q[0])} ${f(q[1])}`,'none','#888888',1.6,'opacity=".6"');
 }
 const clip=`<defs><clipPath id="pie-disc"><circle r="600"/></clipPath>${SLICES.map((s,i)=>`<clipPath id="slice-${i}">${path(sector(s.start,s.end),'white','none',0)}</clipPath>`).join('')}</defs>`;
 const pieces=SLICES.map((s,i)=>{
  const a=(s.start+s.end)/2,dx=s.offset*Math.cos(a),dy=s.offset*Math.sin(a),d=sector(s.start,s.end);
  const start=onCircle(s.start,585),end=onCircle(s.end,585);
  const rim=`M${f(start[0])} ${f(start[1])}A585 585 0 0 1 ${f(end[0])} ${f(end[1])}`;
  return `<g data-slice="${i}" transform="translate(${f(dx)} ${f(dy)})">`+
   path(d,'#b0b0b0','#777777',2,'transform="translate(0 14)"')+
   path(d,'#e4e4e4','#666666',3)+
   `<g clip-path="url(#slice-${i})"><g clip-path="url(#pie-disc)">${texture}</g>`+
   path(rim,'none','#8a8a8a',8,'opacity=".3"')+path(d,'url(#hatch)','#777777',1,'opacity=".16"')+'</g>'+
   path(d,'none','#666666',2.5)+path(rim,'none','#aaaaaa',1.5)+'</g>';
 }).join('');
 return svg(`<g transform="scale(${size/1600}) translate(755 810) scale(1.1 .99)">${pieces}</g>`,size,size,clip);
}
export const OUTPUTS=['public/illustrations/fractions.webp','public/illustrations/fractions@2x.webp'] as const;
/** Keep the home frontispiece leader mask in sync with the new cover silhouette. */
async function updateCoverMask():Promise<void> {
 const small=await sharp(OUTPUTS[1]).resize(16,16,{kernel:'cubic',fit:'fill'}).ensureAlpha().raw().toBuffer();
 const mask=Array.from({length:16},(_,row)=>Array.from({length:16},(_,col)=>Math.round(small[(row*16+col)*4+3]!/255*15).toString(16)).join(''));
 const file='src/lib/illustrations.json';
 const manifest=JSON.parse(readFileSync(file,'utf8')) as Record<string,{mask:string[]}>;
 manifest.fractions={mask};writeFileSync(file,`${JSON.stringify(manifest,null,2)}\n`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 assertFractions();await writePlate(OUTPUTS[0],fractionsSvg(800));await writePlate(OUTPUTS[1],fractionsSvg());await updateCoverMask();
}
