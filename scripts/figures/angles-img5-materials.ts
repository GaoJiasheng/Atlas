/** Shared img5 production helpers. No content, engine or cover-index writes. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import sharp from 'sharp';
import {defs,path,line,ellipse,f,random,pts,type Point} from './graphite.js';
import {woodTexture} from './materials.js';
export {path,line,ellipse,f,random,pts,type Point};
export type Plate={slug:string;id:string;chapter:string;subject:string;body:string;width:number;height:number;checks:string[];facts:Record<string,unknown>;alt:{en:string;zh:string};caption:{en:string;zh:string}};
export const OUTPUT='art/img5';
const extra=`<defs>
<linearGradient id="front" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#e1e1e1"/><stop offset=".35" stop-color="#cecece"/><stop offset="1" stop-color="#999999"/></linearGradient>
<linearGradient id="side"><stop stop-color="#8d8d8d"/><stop offset="1" stop-color="#555555"/></linearGradient>
<linearGradient id="top" x2="1" y2="1"><stop stop-color="#eeeeee"/><stop offset="1" stop-color="#bdbdbd"/></linearGradient>
<linearGradient id="paper"><stop stop-color="#ededed"/><stop offset=".5" stop-color="#e4e4e4"/><stop offset="1" stop-color="#c7c7c7"/></linearGradient>
<linearGradient id="crease"><stop stop-color="#888888" stop-opacity="0"/><stop offset=".42" stop-color="#777777" stop-opacity=".16"/><stop offset=".5" stop-color="#555555" stop-opacity=".5"/><stop offset=".53" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
<radialGradient id="mango" cx=".3" cy=".25" r=".8"><stop stop-color="#e9e9e9"/><stop offset=".55" stop-color="#bbbbbb"/><stop offset="1" stop-color="#686868"/></radialGradient>
<pattern id="grain" width="350" height="64" patternUnits="userSpaceOnUse"><image href="${woodTexture()}" width="350" height="64"/></pattern>
</defs>`;
export const rect=(x:number,y:number,w:number,h:number,fill:string,stroke='none',sw=1,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
let serial=0;
export function material(d:string,fill:string,kind:'wood'|'paper'|'metal'|'cake'='wood',seed=18):string{
 const id=`mat-${serial++}`,r=random(seed);let marks='';
 if(kind==='wood')for(let y=-100;y<1800;y+=5+r()*5){const x=-180+r()*50;marks+=path(`M${f(x)} ${f(y)}C300 ${f(y-9)} 800 ${f(y+11)} 1700 ${f(y-3)}`,'none',r()>.5?'#4d4d4d':'#f1f1f1',.5+r()*.5,`opacity="${f(.08+r()*.14)}"`);}
 if(kind==='cake')for(let i=0;i<2800;i++){const x=r()*1536,y=r()*1152;marks+=ellipse(x,y,.5+r()*1.6,.5+r()*1.3,r()>.5?'#666666':'#ffffff','none',0,`opacity="${f(.08+r()*.13)}"`);}
 return `<defs><clipPath id="${id}">${path(d,'white','none',0)}</clipPath></defs>`+path(d,fill,'#666666',1.5)+`<g clip-path="url(#${id})">`+(kind==='wood'?path(d,'url(#grain)','none',0,'opacity=".28"'):'')+path(d,'url(#hatch)','none',0,`opacity="${kind==='paper'?.24:.5}"`)+marks+'</g>'+path(d,'none','#555555',.5,'transform="translate(.55 -.35)" opacity=".65"');
}
export const polygon=(p:readonly Point[])=>`M${pts(p)}Z`;
/** Same physical 160-unit wooden cube for both average plates and graph cover. */
export const BLOCK={edge:160,dx:42,dy:-28,bevel:5};
export function cube(x:number,y:number,seed:number,edge=BLOCK.edge):string{
 const {dx,dy,bevel:b}=BLOCK,e=edge;
 const front=`M${x+b} ${y}H${x+e-b}L${x+e} ${y+b}V${y+e-b}L${x+e-b} ${y+e}H${x+b}L${x} ${y+e-b}V${y+b}Z`;
 const top=polygon([[x,y],[x+dx,y+dy],[x+e+dx,y+dy],[x+e,y]]);
 const side=polygon([[x+e,y],[x+e+dx,y+dy],[x+e+dx,y+e+dy],[x+e,y+e]]);
 return `<g data-cube="${seed}">`+material(side,'url(#side)','wood',seed)+material(front,'url(#front)','wood',seed)+material(top,'url(#top)','wood',seed)+
 line([[x+3,y+3],[x+e-3,y+3]],'#f4f4f4',2)+line([[x+e-2,y+5],[x+e-2,y+e-5]],'#eeeeee',1)+line([[x+6,y+e-3],[x+e-6,y+e-3]],'#555555',1.1)+
 // End-grain curved strokes run across the upper face, clipped geometrically.
 [0,1,2,3,4,5].map(i=>path(`M${x+8+i*25} ${y-4}q21 -17 42 -25`,'none','#777777',.65,'opacity=".4"')).join('')+'</g>';
}
export function towers(counts:readonly number[],xs:readonly number[],baseline:number,base=false):string{
 assert.equal(counts.length,xs.length);let b='';
 if(base){const x=xs[0]!-35,w=xs.at(-1)!+BLOCK.edge+BLOCK.dx-x+35;
 b+=material(polygon([[x,baseline],[x+45,baseline-28],[x+w,baseline-28],[x+w,baseline+18],[x,baseline+18]]),'url(#front)','wood',911);}
 counts.forEach((n,i)=>{for(let j=0;j<n;j++)b+=cube(xs[i]!,baseline-(j+1)*BLOCK.edge,100+i*13+j);});return b;
}
export const wrap=(p:Plate)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${p.width}" height="${p.height}" viewBox="0 0 ${p.width} ${p.height}">${defs}${extra}${p.body}</svg>`;
async function encode(input:Buffer,output:string,w:number,h:number,budget:number){
 let bytes=Buffer.alloc(0),quality=94;
 for(;quality>=46;quality-=4){bytes=await sharp(input).resize(w,h).webp({quality,effort:6}).toBuffer();if(bytes.length<=budget)break;}
 assert(bytes.length<=budget,`${output}: budget ${bytes.length}`);
 const exact=await exactGrey(bytes,budget);writeFileSync(output,exact.bytes);return {bytes:exact.bytes.length,quality,greyStep:exact.step};
}
/** Lossy YUV can decode a neutral input with a 1-code-value colour fringe.
 * Encode a bounded grayscale palette losslessly so delivered RGB is EXACTLY
 * neutral. The smallest palette step satisfying the image's budget is used.
 * Alpha is quantized to 4/255, never thresholded to a hard silhouette.
 */
export async function exactGrey(input:Buffer,budget:number){
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(const step of [1,2,3,4,6,8,10,12,16,20]){
  const b=Buffer.from(data);
  for(let i=0;i<b.length;i+=4){const g=b[i+3]?Math.min(255,Math.round((b[i]!+b[i+1]!+b[i+2]!)/3/step)*step):0;b[i]=b[i+1]=b[i+2]=g;b[i+3]=Math.min(255,Math.round(b[i+3]!/4)*4);}
  const bytes=await sharp(b,{raw:info}).webp({lossless:true,effort:6}).toBuffer();
  if(bytes.length<=budget)return {bytes,step};
 }
 throw new Error('Exact-gray raster exceeds byte budget');
}
export async function render(p:Plate){
 mkdirSync(`${OUTPUT}/raw`,{recursive:true});mkdirSync(`${OUTPUT}/svg`,{recursive:true});mkdirSync('public/illustrations/figures',{recursive:true});
 const name=p.id=== 'cover'?p.slug:`${p.slug}-${p.id}`,source=wrap(p);assert(!/<text\b/.test(source));writeFileSync(`${OUTPUT}/svg/${name}.svg`,source);
 // Cache graphite.ts vector hatch tiles, keeping editable original source.
 let s=source;
 for(const m of source.matchAll(/<pattern id="(hatch|cross)"[^>]*>([\s\S]*?)<\/pattern>/g)){
 const tile=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">${m[2]}</svg>`)).png().toBuffer();
 s=s.replace(m[0],`<pattern id="${m[1]}" width="120" height="120" patternUnits="userSpaceOnUse"><image href="data:image/png;base64,${tile.toString('base64')}" width="120" height="120"/></pattern>`);
 }
 const png=await sharp(Buffer.from(s)).png().toBuffer();writeFileSync(`${OUTPUT}/raw/${name}.png`,png);
 // A real 2x raster, before downsampling, for visual inspection of every edge.
 await sharp(Buffer.from(s)).resize(p.width*2,p.height*2).png().toFile(`${OUTPUT}/review/${name}-2x.png`);
 let files:Record<string,unknown>;
 if(p.id==='cover')files={normal:await encode(png,`public/illustrations/${name}.webp`,800,800,90000),retina:await encode(await sharp(Buffer.from(s)).resize(1600,1600).png().toBuffer(),`public/illustrations/${name}@2x.webp`,1600,1600,260000)};
 else files={normal:await encode(png,`public/illustrations/figures/${name}.webp`,1200,900,120000)};
 console.log(name,JSON.stringify(files));return files;
}
