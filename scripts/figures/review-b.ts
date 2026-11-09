/** Offline QA, no browser: pnpm tsx scripts/figures/review-b.ts [preview-directory]. */
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import sharp, { type OverlayOptions } from 'sharp';
const out=resolve(process.argv[2]??'/tmp/atlas-b-review/final');mkdirSync(out,{recursive:true});
export const images=['telling-time@2x','steam-engine-parallel-motion@2x','figures/steam-engine-parallel-motion','figures/magnets-filings','figures/mosquito-three-life-cycles','figures/digestive-system-five-systems','figures/circuits-power-chain','figures/singapore-land-use-reclamation-section','figures/fossils-and-skeletons-fossilisation','figures/inside-the-earth-boundary-models','figures/inside-the-earth-magma-cutaway','figures/monsoon-and-weather-cloud-cutaway','figures/space-race-lunokhod','figures/flower-and-seed-bee-pollination'];
const paper=[233,228,216],cinema=[31,33,36],previews:(OverlayOptions&{height:number})[]=[],sizes=[];
for(const [index,id] of images.entries()){
 const file=`public/illustrations/${id}.webp`,name=id.split('/').at(-1)!,preserve=false;
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert(statSync(file).size<=120000,`${id}: budget`);if(id.startsWith('figures/')){assert.equal(info.width,1200);assert.equal(info.height,900);}
 let minx=info.width,miny=info.height,maxx=0,maxy=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){if(data[(y*info.width+x)*4+3]!>32){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);}}
 assert(minx>0&&miny>0&&maxx<info.width-1&&maxy<info.height-1,`${id}: edge contact`);
 // Bounding-box fill measures the complete teaching composition, including directional arrows.
 if(index<8){assert((maxx-minx)/info.width>=.6);assert((maxy-miny)/info.height>=.6);}
 const renders:Buffer[]=[];
 for(const dark of [false,true]){
  const target=Buffer.alloc(info.width*info.height*3),bg=dark?cinema:paper;
  for(let i=0;i<info.width*info.height;i++){const a=data[i*4+3]!/255,v=data[i*4]!;for(let c=0;c<3;c++){
   const value=!dark?bg[c]!*(1-a+a*v/255):preserve?.85*.95*(a*v+(1-a)*paper[c]!)+255*.025:bg[c]!+(1-bg[c]!/255)*(.94*(255-v)+255*.03)*a*.86;
   target[i*3+c]=Math.round(Math.max(0,Math.min(255,value)));
  }}
  const base=sharp(target,{raw:{width:info.width,height:info.height,channels:3}}),theme=dark?'cinema':'paper';
  await base.clone().resize(info.width*2,info.height*2,{kernel:'nearest'}).png().toFile(`${out}/${name}-${theme}-2x.png`);
  const small=await base.resize(420).png().toBuffer();renders.push(small);await sharp(small).toFile(`${out}/${name}-${theme}-420.png`);
 }
 const height=Math.round(info.height/info.width*420);
 const title=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="840" height="30"><text x="12" y="21" font-family="monospace" font-size="15" fill="#333">${name} · paper / cinema${preserve?' · no invert':''}</text></svg>`);
 const row=await sharp({create:{width:840,height:height+30,channels:3,background:'#e9e4d8'}}).composite([{input:title,left:0,top:0},{input:renders[0]!,left:0,top:30},{input:renders[1]!,left:420,top:30}]).png().toBuffer();
 previews.push({input:row,left:0,top:previews.reduce((n,p)=>n+p.height,0),height:height+30});
 sizes.push({file,bytes:statSync(file).size,sha256:createHash('sha256').update(readFileSync(file)).digest('hex'),width:info.width,height:info.height,bounds:[minx,miny,maxx,maxy],invert:!preserve});
 if(index>=8){
  // Original and delivered artwork at 2× lesson display size, plus a 2×
  // native-resolution detail crop. This is an offline visual comparison.
  const before=new URL(`./materials/b-review/reencode-${name}.webp`,import.meta.url);
  const parts:OverlayOptions[]=[];
  for(const [i,input] of [before.pathname,file].entries()){
   const full=await sharp(input).flatten({background:'#e9e4d8'}).resize(840).png().toBuffer();
   const detail=await sharp(input).extract({left:400,top:350,width:400,height:300}).flatten({background:'#e9e4d8'}).resize(800,600,{kernel:'nearest'}).png().toBuffer();
   parts.push({input:full,left:i*840,top:30},{input:detail,left:i*840+20,top:690});
  }
  const label=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1680" height="30"><text x="10" y="21" font-family="monospace" font-size="18">Original (left) / delivered (right); 2× lesson size, then 2× native detail</text></svg>');
  await sharp({create:{width:1680,height:1300,channels:3,background:'#e9e4d8'}}).composite([{input:label,left:0,top:0},...parts]).png().toFile(`${out}/${name}-comparison-2x.png`);
 }
}
// OverlayOptions has no height field at runtime; remove our layout bookkeeping before composition.
const total=previews.reduce((n,p)=>n+p.height,0);
await sharp({create:{width:840,height:total,channels:3,background:'#e9e4d8'}}).composite(previews.map(p=>{const {height:_,...item}=p;return item;})).png().toFile(`${out}/contact-sheet-420.png`);
for(const theme of ['paper','cinema']){
 const tiles:OverlayOptions[]=[];
 for(const [i,id]of images.entries()){
  const name=id.split('/').at(-1)!,input=await sharp(`${out}/${name}-${theme}-420.png`).resize(420,420,{fit:'contain',background:theme==='paper'?'#e9e4d8':'#1f2124'}).png().toBuffer();
  const label=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="30"><text x="8" y="20" font-family="monospace" font-size="12" fill="${theme==='paper'?'#333':'#ddd'}">${name}</text></svg>`);
  tiles.push({input,left:i%4*420,top:Math.floor(i/4)*450+30},{input:label,left:i%4*420,top:Math.floor(i/4)*450});
 }
 await sharp({create:{width:1680,height:Math.ceil(images.length/4)*450,channels:3,background:theme==='paper'?'#e9e4d8':'#1f2124'}}).composite(tiles).png().toFile(`${out}/contact-sheet-420-${theme}.png`);
}
writeFileSync(`${out}/sizes.json`,JSON.stringify(sizes,null,2)+'\n');
// A stale checklist cannot certify a later asset revision.
for(const row of readFileSync('scripts/figures/b-review-manifest.jsonl','utf8').trim().split('\n').map(s=>JSON.parse(s))){
 const file=`public/illustrations/${row.file}`;
 assert(row.checks.length>=3&&row.checks.length<=6,`${row.file}: checklist length`);
 assert.equal(row.bytes,statSync(file).size,`${row.file}: stale size`);
 assert.equal(row.sha256,createHash('sha256').update(readFileSync(file)).digest('hex'),`${row.file}: stale checklist hash`);
}
// Keep a compact contact sheet for all eight redrawn compositions, at precisely 420 px per image.
console.log(out);
