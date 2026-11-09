/** Round-two exports preserve drawn graphite strokes; never add pixel noise. */
import assert from 'node:assert/strict';
import {writeFileSync,mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
export const asset=(name:string)=>new URL(`./sources/i-b-round2/${name}`,import.meta.url).pathname;
export async function encode(output:string,input:Buffer,budget=120000,normaliseWhite=true):Promise<void>{
 // Neutral-white opacity normalisation removes white matte fragments while
 // preserving the exact paper multiply result: a*(1-v/255) is invariant.
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<data.length;i+=4){
  const v=Math.round((data[i]!+data[i+1]!+data[i+2]!)/3);
  data[i]=data[i+1]=data[i+2]=normaliseWhite?Math.min(v,220):v;
  if(normaliseWhite&&v>220)data[i+3]=Math.round(data[i+3]!*(255-v)/35);
 }
 input=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toBuffer();
 let bytes=Buffer.alloc(0),chosen='';
 for(const alphaQuality of [95,85,70,55]){
  let lo=35,hi=92;
  while(lo<=hi){
   const quality=Math.floor((lo+hi)/2);
   const trial=await sharp(input).webp({quality,alphaQuality,effort:6,smartSubsample:true}).toBuffer();
   if(trial.length<=budget){bytes=trial;chosen=`q${quality}, alpha${alphaQuality}`;lo=quality+1;}else hi=quality-1;
  }
  if(bytes.length)break;
 }
 assert(bytes.length>0&&bytes.length<=budget,`${output}: ${budget} byte budget`);
 writeFileSync(output,bytes);console.log(`${output}: ${bytes.length} bytes (${chosen})`);
}
/** Clear original material inside the edit mask, then replace only that region. */
export async function localEdit(original:string,edit:string,mask:string):Promise<Buffer>{
 const {width,height}=await sharp(original).metadata();assert(width&&height);
 const replacement=await sharp(edit).resize(width,height,{fit:'fill'}).modulate({saturation:0}).png().toBuffer();
 const matte=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${mask}</svg>`);
 const patch=await sharp(replacement).composite([{input:matte,blend:'dest-in'}]).png().toBuffer();
 return sharp(original).composite([{input:matte,blend:'dest-out'},{input:patch}]).png().toBuffer();
}
/** Run the project's figure processor, then enforce the stricter 120,000 B gate. */
export async function figure(output:string,input:Buffer):Promise<void>{
 const source=join(mkdtempSync(join(tmpdir(),'atlas-i-b-figure-')),'plate.png');
 writeFileSync(source,input);
 const run=spawnSync('pnpm',['tsx','scripts/illustrate.ts','figure',source,basename(output,'.webp')],{stdio:'inherit'});
 assert.equal(run.status,0,'illustrate.ts figure');
 await encode(output,readFileSync(output));
}
