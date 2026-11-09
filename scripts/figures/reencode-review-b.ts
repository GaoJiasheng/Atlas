/** Preserve native dimensions. Compare delivered 420 px rendering to the original. */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
export const ids=['fossils-and-skeletons-fossilisation','inside-the-earth-boundary-models','inside-the-earth-magma-cutaway','monsoon-and-weather-cloud-cutaway','space-race-lunokhod','flower-and-seed-bee-pollination'];
const out='/tmp/atlas-b-review';mkdirSync(out,{recursive:true});
const results=[];
async function rendered(input:Buffer,dark=false):Promise<Buffer>{
 const {data,info}=await sharp(input).resize(420).ensureAlpha().raw().toBuffer({resolveWithObject:true}),pixels=Buffer.alloc(info.width*info.height*3),bg=dark?[31,33,36]:[233,228,216];
 for(let k=0;k<info.width*info.height;k++){const a=data[k*4+3]!/255,v=data[k*4]!;for(let c=0;c<3;c++)pixels[k*3+c]=Math.round(dark?bg[c]!+(1-bg[c]!/255)*(.94*(255-v)+7.65)*a*.86:bg[c]!*(1-a+a*v/255));}return pixels;
}
const psnr=(a:Buffer,b:Buffer)=>{let mse=0;for(let i=0;i<a.length;i++)mse+=(a[i]!-b[i]!)**2;return 10*Math.log10(65025/(mse/a.length));};
for(const id of ids){
 const file=`public/illustrations/figures/${id}.webp`,before=new URL(`./materials/b-review/reencode-${id}.webp`,import.meta.url);assert(existsSync(before),`missing retained pre-encode original: ${id}`);
 const input=readFileSync(before),meta=await sharp(input).metadata();let encoded=Buffer.alloc(0),quality=0,lo=1,hi=96,representation='original RGBA';
 // Binary search avoids dozens of expensive high-effort encodes. Original
 // dimensions remain exact; no blur or resampling. Alpha uses perceptual
 // quantisation too: the source's noisy alpha otherwise exceeds the budget alone.
 while(lo<=hi){const q=Math.floor((lo+hi)/2),b=await sharp(input).webp({quality:q,effort:3,alphaQuality:80}).toBuffer();if(b.length<=120_000){encoded=b;quality=q;lo=q+1;}else hi=q-1;}
 const originalPaper=await rendered(input),originalCinema=await rendered(input,true);
 let paperPsnr=psnr(originalPaper,await rendered(encoded)),cinemaPsnr=psnr(originalCinema,await rendered(encoded,true));
 // Neutral white contributes zero ink under paper multiply and nearly zero
 // under cinema screen. Consolidate redundant RGB/alpha noise only when it
 // improves both actual theme composites, without resizing or blurring RGB.
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true}),mask=await sharp(input).extractChannel(3).blur(1).threshold(5).raw().toBuffer();
 for(let i=0;i<data.length;i+=4){const a=data[i+3]!/255,v=Math.round(255-a*(255-data[i]!));data[i]=data[i+1]=data[i+2]=v;data[i+3]=mask[i/4]!;}
 let neutral=Buffer.alloc(0),neutralQuality=0;lo=1;hi=96;
 while(lo<=hi){const q=Math.floor((lo+hi)/2),b=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).webp({quality:q,effort:3,alphaQuality:100}).toBuffer();if(b.length<=120_000){neutral=b;neutralQuality=q;lo=q+1;}else hi=q-1;}
 if(neutral.length){const pp=psnr(originalPaper,await rendered(neutral)),cp=psnr(originalCinema,await rendered(neutral,true));if(pp>paperPsnr&&cp>cinemaPsnr){encoded=neutral;quality=neutralQuality;paperPsnr=pp;cinemaPsnr=cp;representation='neutral-white opacity normalisation; original RGB detail, local alpha envelope';}}
 assert(encoded.length<=120_000,`${id}: size`);const after=await sharp(encoded).metadata();assert.equal(after.width,meta.width);assert.equal(after.height,meta.height);
 const a=await sharp(input).ensureAlpha().raw().toBuffer(),b=await sharp(encoded).ensureAlpha().raw().toBuffer();let maxAlphaError=0;for(let i=3;i<a.length;i+=4)maxAlphaError=Math.max(maxAlphaError,Math.abs(a[i]!-b[i]!));if(representation==='original RGBA')assert(maxAlphaError<=4,`${id}: alpha error ${maxAlphaError}`);
 assert(paperPsnr>36&&cinemaPsnr>36,`${id}: theme composite quality`);assert.equal(b[3],0);assert.equal(b.at(-1),0);
 writeFileSync(file,encoded);results.push({id,before:input.length,after:encoded.length,quality,paperPsnr420:paperPsnr,cinemaPsnr420:cinemaPsnr,width:meta.width,height:meta.height,representation,maxAlphaError});console.log(results.at(-1));
}
writeFileSync(`${out}/reencodes.json`,JSON.stringify(results,null,2)+'\n');
