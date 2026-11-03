/** Deterministic, offline engraving primitives. Geometry is separate from surface marks. */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
export type Point = readonly [number, number];
export const BUDGET = 120_000;
export const f = (x: number) => Number(x.toFixed(3));
export const pts = (p: readonly Point[]) => p.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
export const line = (p: readonly Point[], ink = '#555555', width = .9, extra = '') => `<polyline points="${pts(p)}" fill="none" stroke="${ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const path = (d: string, fill = 'none', stroke = '#555555', width = .9, extra = '') => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
export const ellipse = (x: number, y: number, rx: number, ry: number, fill = 'none', stroke = '#555555', width = .9, extra='') => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
/** Seeded detail affects material only, never electrical or projection geometry. */
export function random(seed: number): () => number {
 return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
}
const rng=random(9128);
const pencil=Array.from({length:1300},(_,i)=>{
 const x=rng()*120,y=rng()*120,l=1+rng()*5;
 return path(`M${f(x)} ${f(y)}q${f(l*.45)} ${f(-l*.35+rng()*.4)} ${f(l)} ${f(-l*.7)}`,'none','#484848',.25+rng()*.22,`opacity="${.08+rng()*.22}"`)+
 (i%4===0?path(`M${f(x)} ${f(y)}l${f(l*.6)} ${f(l*.8)}`,'none','#626262',.35,'opacity=".15"'):'');
}).join('');
export const defs = `<defs>
 <pattern id="hatch" width="120" height="120" patternUnits="userSpaceOnUse">${pencil}</pattern>
 <pattern id="cross" width="120" height="120" patternUnits="userSpaceOnUse">${pencil}${pencil.replaceAll('opacity="','transform="rotate(87 60 60)" opacity="')}</pattern>
 <linearGradient id="metal"><stop stop-color="#545454"/><stop offset=".19" stop-color="#c7c7c7"/><stop offset=".33" stop-color="#eeeeee"/><stop offset=".47" stop-color="#dddddd"/><stop offset=".78" stop-color="#999999"/><stop offset="1" stop-color="#424242"/></linearGradient>
 <linearGradient id="wood" x2=".25" y2="1"><stop stop-color="#dfdfdf"/><stop offset=".5" stop-color="#d3d3d3"/><stop offset="1" stop-color="#b6b6b6"/></linearGradient>
 <linearGradient id="dark"><stop stop-color="#5c5c5c"/><stop offset=".34" stop-color="#929292"/><stop offset=".6" stop-color="#555555"/><stop offset="1" stop-color="#373737"/></linearGradient>
 <radialGradient id="glass" cx=".34" cy=".26" r=".74"><stop stop-color="#f7f7f7"/><stop offset=".48" stop-color="#e5e5e5"/><stop offset=".77" stop-color="#cccccc"/><stop offset=".91" stop-color="#a5a5a5"/><stop offset="1" stop-color="#808080"/></radialGradient>
 <radialGradient id="cast"><stop stop-color="#333333" stop-opacity=".28"/><stop offset=".55" stop-color="#555555" stop-opacity=".12"/><stop offset="1" stop-color="#777777" stop-opacity="0"/></radialGradient>
 <radialGradient id="glow"><stop stop-color="#ffffff" stop-opacity=".96"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".65"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
 </defs>`;
export const svg = (body: string, width = 1200, height = 900, extraDefs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}${extraDefs}${body}</svg>`;
export const screw = (x: number, y: number, r = 5) => ellipse(x+.7,y+1,r+1,r*.85,'#777777','none')+ellipse(x,y,r,r*.78,'url(#metal)','#494949',.8)+line([[x-r*.6,y+r*.4],[x+r*.6,y-r*.4]],'#414141',1.4)+line([[x-r*.55,y+r*.4-1],[x+r*.55,y-r*.4-1]],'#ededed',.5);
export const cast = (x:number,y:number,rx:number,ry:number) => ellipse(x,y,rx,ry,'url(#cast)','none');
/** Fine broken contour echo, used on material boundaries rather than diagram-like heavy strokes. */
export function etched(d:string,fill:string,ink='#555555',width=1):string {
 return path(d,fill,ink,width)+path(d,'url(#hatch)','none',0)+path(d,'none',ink,.35,'transform="translate(.6 -.45)" opacity=".55"');
}
export async function writePlate(output: string, text: string): Promise<void> {
 // Quantized monochrome + sparse fibre variation breaks flat digital fills without
 // moving a contour. All geometry is rasterized at its native delivery resolution.
 const {data,info}=await sharp(Buffer.from(text)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const r=random(347);
 for(let i=0;i<data.length;i+=4){
  if(!data[i+3]){data[i]=data[i+1]=data[i+2]=0;continue;}
  const v=data[i]!, grain=(r()-.5)*(12+34*(1-v/255));
  const g=Math.max(0,Math.min(255,Math.round((v+grain)/4)*4));
  data[i]=data[i+1]=data[i+2]=g;
 }
 let bytes=Buffer.alloc(0);
 for(const quality of [88,82,75,65,55,45,35]){
  bytes=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).webp({quality,effort:6}).toBuffer();
  if(bytes.length<=BUDGET)break;
 }
 if(bytes.length > BUDGET) throw new Error(`${output}: ${bytes.length} exceeds ${BUDGET} B`);
 writeFileSync(output,bytes);console.log(`${output}: ${bytes.length} B`);
}
