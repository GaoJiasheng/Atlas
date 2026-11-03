/** pnpm tsx scripts/figures/fractions.ts — eight exact 45° sectors, one moved out. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { pathToFileURL } from 'node:url';
import { cast, f, path, svg, writePlate, type Point } from './graphite';
import { breadTexture } from './materials';
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
 const texture=`<image x="-600" y="-600" width="1200" height="1200" href="${breadTexture()}"/>`;
 const clip=`<defs><clipPath id="pie-disc"><circle r="600"/></clipPath>${SLICES.map((s,i)=>`<clipPath id="slice-${i}">${path(sector(s.start,s.end),'white','none',0)}</clipPath>`).join('')}</defs>`;
 const bottoms=SLICES.map(s=>{const a=(s.start+s.end)/2;const d=sector(s.start,s.end),dx=f(s.offset*Math.cos(a)),dy=s.offset*Math.sin(a);return path(d,'#9f9f9f','#777777',.8,`transform="translate(${dx} ${f(dy+14)})"`)+[3,7,11].map((y,i)=>path(d,'none',i%2?'#787878':'#d4d4d4',.9,`transform="translate(${dx} ${f(dy+y)})" stroke-dasharray="11 1 5 2"`)).join('');}).join('');
 const pieces=SLICES.map((s,i)=>{
  const a=(s.start+s.end)/2,dx=s.offset*Math.cos(a),dy=s.offset*Math.sin(a),d=sector(s.start,s.end);
  const start=onCircle(s.start,597),end=onCircle(s.end,597);
  const rim=`M${f(start[0])} ${f(start[1])}A597 597 0 0 1 ${f(end[0])} ${f(end[1])}`;
  return `<g data-slice="${i}" transform="translate(${f(dx)} ${f(dy)})">`+
   path(d,'#e8e8e8','#777777',1.4)+
   `<g clip-path="url(#slice-${i})"><g clip-path="url(#pie-disc)">${texture}</g>`+
   path(d,'url(#hatch)','#777777',1,'opacity=".16"')+'</g>'+
   path(d,'none','#777777',1.2)+path(rim,'none','#a0a0a0',.7,'stroke-dasharray="7 2 3 1"')+'</g>';
 }).join('');
 return svg(`<g transform="scale(${size/1600}) translate(755 810) scale(1.1 .99)">${cast(15,35,690,620)}${bottoms}${pieces}</g>`,size,size,clip);
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
