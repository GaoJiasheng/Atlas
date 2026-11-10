/** Shared export only: no photo masks, tonal quantisation, noise or geometry generation.
 * Original graphite drawings and PD geometry refs: previews/space-race-r3/.
 * Prompts, source identities and visual acceptance: space-race-prompts.jsonl / manifests.
 */
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
export const PRE = 'previews/space-race-r3';
export const OUT = 'public/illustrations/figures';
export const BUDGET = 120_000;
export async function specimen(file: string): Promise<Buffer> {
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=info.width,y0=info.height,x1=-1,y1=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]!>10){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 assert(x1>x0&&y1>y0,`${file}: empty alpha`);
 return sharp(file).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).modulate({saturation:0}).png().toBuffer();
}
export async function save(id:string,input:Buffer):Promise<void>{
 const meta=await sharp(input).metadata();assert.equal(meta.width,1200);assert.equal(meta.height,900);
 let result=Buffer.alloc(0),quality=94,alphaQuality=100;
 // Retain the visually checked alpha/colour setting for this dense pipework plate.
 const dense=id==='space-race-background-mittelwerk';
 search: for(const alpha of dense?[80]:[100,80]){alphaQuality=alpha;for(quality=dense?68:94;quality>=58;quality-=2){result=await sharp(input).webp({quality,alphaQuality,effort:6}).toBuffer();if(result.length<=BUDGET)break search;}}
 assert(result.length<=BUDGET,`${id}: budget`);
 writeFileSync(`${OUT}/${id}.webp`,result);console.log(`${id}: ${result.length} B, quality ${quality}, alpha ${alphaQuality}, 1200×900`);
}
export async function plate(input:string,id:string):Promise<void>{
 const body=await specimen(input);
 const fit=await sharp(body).resize(1056,774,{fit:'inside'}).png().toBuffer();const m=await sharp(fit).metadata();
 assert((m.width!>=720||m.height!>=540),'subject must span 60% of frame');
 const canvas=await sharp({create:{width:1200,height:900,channels:4,background:'#00000000'}}).composite([{input:fit,left:Math.round((1200-m.width!)/2),top:Math.round((900-m.height!)/2)}]).png().toBuffer();
 await save(id,canvas);
}
