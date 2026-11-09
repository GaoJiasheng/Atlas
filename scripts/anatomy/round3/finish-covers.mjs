/** Localized finish; keep accepted graphite pixels outside the two defect areas. */
import sharp from'sharp';import fs from'node:fs';
const dir='scripts/anatomy/round3';
const oldCore=`${dir}/before/muscles-core@2x.webp`,oldShoulders=`${dir}/before/muscles-shoulders@2x.webp`;
for(const topic of['core','shoulders']){
 const original=topic==='core'?oldCore:oldShoulders,{data,info}=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true}),W=info.width,H=info.height;
 if(topic==='core'){
  const alpha=await sharp(original).extractChannel('alpha').median(13).blur(.7).raw().toBuffer();
  const edges=[];
  for(let y=0;y<H;y++){let left=W/2,right=W/2;for(let x=0;x<W/2;x++)if(alpha[y*W+x]>210){left=x;break;}for(let x=W-1;x>W/2;x--)if(alpha[y*W+x]>210){right=x;break;}edges.push([left,right]);}
  for(let y=Math.round(H*.14);y<H*.40;y++){
   const window=edges.slice(Math.max(0,y-22),Math.min(H,y+23)),l=window.reduce((n,e)=>n+e[0],0)/window.length+2,r=window.reduce((n,e)=>n+e[1],0)/window.length-2;
   for(let x=0;x<W;x++)if(Math.abs(x-W/2)>W*.25){const band=Math.min(1,(y-H*.14)/18,(H*.40-y)/18),edge=Math.max(0,Math.min(1,(x-l)/2,(r-x)/2));data[(y*W+x)*4+3]=Math.round(alpha[y*W+x]*(1-band+band*edge));}
  }
 }else{
  const {data:edit}=await sharp(`${dir}/shoulders-edit.png`).resize(W,H).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let y=0;y<H*.315;y++)for(let x=0;x<W;x++){
   const k=(y*W+x)*4,dy=y/H,dx=Math.abs(x/W-.5);
   // New upper trapezius merges into the accepted fibres below the former crop.
   const fade=Math.min(1,Math.max(0,(.315-dy)/.045))*Math.min(1,Math.max(0,(.24-dx)/.05));
   if(fade<=0)continue;
   for(let c=0;c<4;c++)data[k+c]=Math.round(data[k+c]*(1-fade)+edit[k+c]*fade);
  }
 }
 for(let k=0;k<data.length;k+=4){const v=Math.round(.2126*data[k]+.7152*data[k+1]+.0722*data[k+2]);data[k]=data[k+1]=data[k+2]=v;}
 const raw=await sharp(data,{raw:info}).png().toBuffer();fs.writeFileSync(`${dir}/${topic}-cover-final.png`,raw);
 for(const size of[1600,800])await sharp(raw).resize(size,size).webp({quality:82,alphaQuality:90,effort:6,smartSubsample:true}).toFile(`public/illustrations/muscles-${topic}${size===1600?'@2x':''}.webp`);
 await sharp(raw).flatten({background:'#e9e4d8'}).resize(900).png().toFile(`${dir}/comparisons/look2/${topic}-cover.png`);
 const before=await sharp(original).flatten({background:'#e9e4d8'}).resize(700).png().toBuffer(),after=await sharp(raw).flatten({background:'#e9e4d8'}).resize(700).png().toBuffer();
 await sharp({create:{width:1400,height:700,channels:3,background:'#e9e4d8'}}).composite([{input:before,left:0,top:0},{input:after,left:700,top:0}]).png().toFile(`${dir}/comparisons/look2/${topic}-cover-before-after.png`);
}
