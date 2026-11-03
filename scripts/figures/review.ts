/** Offline raster QA only: pnpm tsx scripts/figures/review.ts [output directory]. */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
const out=resolve(process.argv[2]??'/tmp/atlas-fig-review/final');mkdirSync(out,{recursive:true});
const paper='#e9e4d8';
const figures=['figures/circuits-series-parallel','figures/circuits-festive-lights','figures/light-and-shadows-same-object-two-shadows','fractions@2x'];
const neighbours=['figures/circuits-tester','figures/light-and-shadows-opaque-translucent'];
for(const id of figures){
 const file=`public/illustrations/${id}.webp`,name=id.split('/').at(-1)!;
 const meta=await sharp(file).metadata();
 await sharp(file).flatten({background:paper}).png().toFile(`${out}/${name}-full.png`);
 const parts=[];
 for(const [i,item] of [id,...neighbours].entries())parts.push({input:await sharp(`public/illustrations/${item}.webp`).resize(1200,900,{fit:'contain',background:paper}).flatten({background:paper}).png().toBuffer(),left:i*1200,top:0});
 await sharp({create:{width:3600,height:900,channels:3,background:paper}}).composite(parts).png().toFile(`${out}/${name}-neighbours.png`);
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const render=async(dark:boolean)=>{
  const target=Buffer.alloc(info.width*info.height*3),bg=dark?[31,33,36]:[233,228,216];
  const preserve=id.includes('two-shadows')||id.includes('series-parallel');
  for(let i=0;i<info.width*info.height;i++){
   const a=data[i*4+3]!/255,v=data[i*4]!;
   for(let c=0;c<3;c++){
    let value:number;
    if(!dark)value=bg[c]!*(1-a+a*v/255); // CSS multiply on paper
    else if(preserve)value=.85*.95*(a*v+(1-a)*[233,228,216][c]!)+255*(1-.95)/2;
    else value=bg[c]!+(1-bg[c]!/255)*(.94*(255-v)+255*.03)*a*.86; // screen + opacity
    target[i*3+c]=Math.round(Math.max(0,Math.min(255,value)));
   }
  }
  return sharp(target,{raw:{width:info.width,height:info.height,channels:3}}).resize(420).png().toBuffer();
 };
 const pale=await render(false),dark=await render(true);
 const height=Math.round(meta.height!*420/meta.width!);
 await sharp({create:{width:840,height,channels:3,background:paper}}).composite([{input:pale,left:0,top:0},{input:dark,left:420,top:0}]).png().toFile(`${out}/${name}-420-themes.png`);
}
console.log(out);
