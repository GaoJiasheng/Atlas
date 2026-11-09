/** Prepress only: fit source drawings, canonicalize alpha endpoints, enforce 120 kB. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import sharp from 'sharp';
import {PREVIEW} from './redo-cd-utils.js';
export const ids=['coral-reef-polyp','digestive-system-swallowing','inside-the-earth-boundary-models','monsoon-and-weather-cloud-cutaway','warring-states-tiger-tally','warring-states-crossbow-trigger','warring-states-zhou-war-chariot','warring-states-qin-measure-and-slips','water-marina-barrage','coral-reef-zones','plates-and-hazards-tsunami-shoaling'];
mkdirSync(`${PREVIEW}/prepress`,{recursive:true});
for(const id of ids.filter(id=>!process.argv[2]||process.argv[2]===id)){
 const target=`public/illustrations/figures/${id}.webp`;
 const source=`${PREVIEW}/${id}-source.png`;
 const {data,info}=await sharp(source).toColourspace('srgb').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // greyscale raw is GA; expand explicitly to RGBA to preserve exact neutral graphite.
 const rgba=Buffer.alloc(info.width*info.height*4);let x0=info.width,y0=info.height,x1=0,y1=0;
 for(let i=0;i<info.width*info.height;i++){
  const p=i*info.channels,v=Math.round(.2126*data[p]!+.7152*data[p+1]!+.0722*data[p+2]!),a0=data[p+3]!;
  const a=a0>=248?255:a0<=10?0:a0;
  rgba[i*4]=rgba[i*4+1]=rgba[i*4+2]=v;rgba[i*4+3]=a;
  if(a>20){const x=i%info.width,y=Math.floor(i/info.width);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 }
 const w=x1-x0+1,h=y1-y0+1;
 const fit=Math.min((id==='warring-states-qin-measure-and-slips'?1196:1140)/w,(id==='digestive-system-swallowing'?834:800)/h),rw=Math.round(w*fit),rh=Math.round(h*fit);
 const fitted=await sharp(rgba,{raw:{width:info.width,height:info.height,channels:4}}).extract({left:x0,top:y0,width:w,height:h}).resize(rw,rh).extend({left:Math.floor((1200-rw)/2),right:Math.ceil((1200-rw)/2),top:Math.floor((900-rh)/2),bottom:Math.ceil((900-rh)/2),background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
 writeFileSync(`${PREVIEW}/prepress/${id}.png`,fitted);
 let out=Buffer.alloc(0),chosen=0;
 for(const quality of [86,80,74,68,62,56,50,44,38,32,28,24]){
  out=await sharp(fitted).webp({quality,alphaQuality:70,effort:6,preset:'drawing',smartSubsample:true}).toBuffer();chosen=quality;if(out.length<=120000)break;
 }
 assert(out.length<=120000,`${id}: over budget`);
 writeFileSync(target,out);console.log(JSON.stringify({id,bytes:out.length,quality:chosen,bounds:[rw,rh],source:source}));
}
