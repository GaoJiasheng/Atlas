/** Offline CSS-composite QA at 420px and 2×. No browser or desktop automation. */
import { mkdirSync, writeFileSync, statSync, existsSync } from 'node:fs';
import sharp, { type OverlayOptions } from 'sharp';
import { PREVIEW } from './redo-cd-utils.js';
export const ids=[
 'figures/warring-states-tiger-tally','figures/warring-states-crossbow-trigger',
 'figures/warring-states-zhou-war-chariot','figures/warring-states-qin-measure-and-slips',
 'figures/coral-reef-polyp','figures/coral-reef-zones','figures/inside-the-earth-boundary-models',
 'figures/plates-and-hazards-tsunami-shoaling','figures/singapore-1819-1965-rubber-and-tin',
 'figures/digestive-system-swallowing','figures/monsoon-and-weather-cloud-cutaway',
 'figures/water-marina-barrage','energy-conversion@2x',
 'figures/fossils-and-skeletons-fossilisation','figures/inside-the-earth-magma-cutaway',
 'figures/space-race-lunokhod','figures/flower-and-seed-bee-pollination',
];
mkdirSync(`${PREVIEW}/final`,{recursive:true});
const stats=[];
const sheets:{paper:OverlayOptions[];cinema:OverlayOptions[]}={paper:[],cinema:[]};
for(const [index,id] of ids.entries()){
 const file=`public/illustrations/${id}.webp`,name=id.split('/').at(-1)!;
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=info.width,y0=info.height,x1=0,y1=0;
 for(let p=0;p<info.width*info.height;p++)if(data[p*4+3]!>20){const x=p%info.width,y=Math.floor(p/info.width);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 const occupancy={width:(x1-x0+1)/info.width,height:(y1-y0+1)/info.height};
 const size=statSync(file).size;
 if(id.startsWith('figures/')&&size>120000)throw new Error(`${id}: ${size} >120000`);
 if(occupancy.width<.6||occupancy.height<.6)throw new Error(`${id}: occupancy ${JSON.stringify(occupancy)}`);
 stats.push({id,bytes:size,width:info.width,height:info.height,occupancy});
 for(const theme of ['paper','cinema'] as const){
  const bg=theme==='paper'?[233,228,216]:[31,33,36];
  const out=Buffer.alloc(info.width*info.height*3);
  for(let i=0;i<info.width*info.height;i++){
   const a=data[i*4+3]!/255,v=data[i*4]!;
   for(let c=0;c<3;c++)out[i*3+c]=Math.round(theme==='paper'?bg[c]!*(1-a+a*v/255):bg[c]!+(1-bg[c]!/255)*(.94*(255-v)+255*.03)*a*.86);
  }
  const raw=()=>sharp(out,{raw:{width:info.width,height:info.height,channels:3}});
  await raw().png().toFile(`${PREVIEW}/final/${name}-${theme}-full.png`);
  await raw().resize(840).png().toFile(`${PREVIEW}/final/${name}-${theme}-840.png`);
  const small=await raw().resize(420,315,{fit:'contain',background:theme==='paper'?'#e9e4d8':'#1f2124'}).png().toBuffer();
  await raw().resize(420).png().toFile(`${PREVIEW}/final/${name}-${theme}-420.png`);
  const col=index%3,row=Math.floor(index/3);
  sheets[theme].push({input:small,left:col*420,top:row*347});
  const label=`<svg width="420" height="32"><text x="10" y="21" font-family="monospace" font-size="11" fill="${theme==='paper'?'#444':'#ddd'}">${name}</text></svg>`;
  sheets[theme].push({input:Buffer.from(label),left:col*420,top:row*347+315});
 }
 const pair=await Promise.all(['paper','cinema'].map(theme=>sharp(`${PREVIEW}/final/${name}-${theme}-840.png`).png().toBuffer()));
 const h=Math.round(info.height*840/info.width);
 await sharp({create:{width:1680,height:h,channels:3,background:'#e9e4d8'}}).composite(pair.map((input,i)=>({input,left:i*840,top:0}))).png().toFile(`${PREVIEW}/final/${name}-themes-840.png`);
}
for(const theme of ['paper','cinema'] as const)await sharp({create:{width:1260,height:Math.ceil(ids.length/3)*347,channels:3,background:theme==='paper'?'#e9e4d8':'#1f2124'}}).composite(sheets[theme]).png().toFile(`${PREVIEW}/final/contact-sheet-420-${theme}.png`);
writeFileSync(`${PREVIEW}/final/sizes.json`,JSON.stringify(stats,null,2)+'\n');
for(const name of ['fossils-and-skeletons-fossilisation','inside-the-earth-magma-cutaway','space-race-lunokhod','flower-and-seed-bee-pollination']){
 const original=`${PREVIEW}/before/${name}.webp`;
 if(!existsSync(original))continue;
 for(const width of [420,840]){
  const pairs=[];
  for(const [i,file]of [original,`public/illustrations/figures/${name}.webp`].entries()){
   const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   const rgb=Buffer.alloc(info.width*info.height*3);
   for(let p=0;p<info.width*info.height;p++){
    const a=data[p*4+3]!/255;
    for(let c=0;c<3;c++)rgb[p*3+c]=Math.round([233,228,216][c]!*(1-a+a*data[p*4+c]!/255));
   }
   pairs.push({input:await sharp(rgb,{raw:{width:info.width,height:info.height,channels:3}}).resize(width).png().toBuffer(),left:width*i,top:0});
  }
  await sharp({create:{width:width*2,height:width*3/4,channels:3,background:'#e9e4d8'}}).composite(pairs).png().toFile(`${PREVIEW}/final/${name}-before-after-${width}.png`);
 }
}
console.log(JSON.stringify(stats.map(x=>({id:x.id,bytes:x.bytes,occupancy:x.occupancy}))));
