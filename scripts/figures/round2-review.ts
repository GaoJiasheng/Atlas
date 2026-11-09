/** Reproduce CSS composites and A-neighbour comparisons without opening a browser. */
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp,{type OverlayOptions} from 'sharp';
import {PREVIEW} from './redo-cd-utils.js';
const entries=JSON.parse(readFileSync('scripts/figures/round2-spec.json','utf8')) as {id:string}[];
const out=`${PREVIEW}/final`;mkdirSync(out,{recursive:true});
async function composite(file:string,dark:boolean,preserve=false){
 const {data,info}=await sharp(file).toColourspace('srgb').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const b=Buffer.alloc(info.width*info.height*3),bg=dark?[31,33,36]:[233,228,216];
 for(let i=0;i<info.width*info.height;i++)for(let c=0;c<3;c++){
  const a=data[i*4+3]!/255,v=data[i*4+c]!;
  b[i*3+c]=Math.round(dark?(preserve?.85*.95*(a*v+(1-a)*[233,228,216][c]!)+255*.025:bg[c]!+(1-bg[c]!/255)*(.94*(255-v)+255*.03)*a*.86):bg[c]!*(1-a+a*v/255));
 }
 return {b,info};
}
const neighbour='public/illustrations/figures/circuits-series-parallel.webp';
const sheets:{paper:OverlayOptions[];cinema:OverlayOptions[]}={paper:[],cinema:[]};
const stats=[];
for(const [index,e]of entries.entries()){
 const file=`public/illustrations/figures/${e.id}.webp`,bytes=readFileSync(file);
 assert(bytes.length<=120000,`${e.id}: size`);
 const {data,info}=await sharp(bytes).toColourspace('srgb').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(info.width,1200);assert.equal(info.height,900);
 let x0=1200,y0=900,x1=0,y1=0,transparent=0,coloured=0;
 for(let p=0;p<1200*900;p++){
  const a=data[p*4+3]!;if(a===0)transparent++;
  if(a>20){const x=p%1200,y=Math.floor(p/1200);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  if(a&&Math.max(data[p*4]!,data[p*4+1]!,data[p*4+2]!)-Math.min(data[p*4]!,data[p*4+1]!,data[p*4+2]!)>2)coloured++;
 }
 assert(transparent>0);assert.equal(coloured,0,`${e.id}: neutral graphite`);
 const occupancy={width:(x1-x0+1)/1200,height:(y1-y0+1)/900};
 stats.push({id:e.id,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),width:1200,height:900,occupancy,transparentPixels:transparent,colouredPixels:coloured});
 for(const theme of ['paper','cinema']as const){
  const {b}=await composite(file,theme==='cinema'),ref=await composite(neighbour,theme==='cinema',true);
  const resized=async(n:number)=>sharp(b,{raw:{width:1200,height:900,channels:3}}).resize(n).png().toBuffer();
  await sharp(b,{raw:{width:1200,height:900,channels:3}}).png().toFile(`${out}/${e.id}-${theme}-full.png`);
  for(const width of [420,840]){
   const self=await resized(width);writeFileSync(`${out}/${e.id}-${theme}-${width}.png`,self);
   const a=await sharp(ref.b,{raw:{width:ref.info.width,height:ref.info.height,channels:3}}).resize(width,width*3/4,{fit:'contain',background:theme==='paper'?'#e9e4d8':'#1f2124'}).png().toBuffer();
   await sharp({create:{width:width*2,height:width*3/4,channels:3,background:'#e9e4d8'}}).composite([{input:self,left:0,top:0},{input:a,left:width,top:0}]).png().toFile(`${out}/${e.id}-${theme}-with-A-${width}.png`);
  }
  const col=index%3,row=Math.floor(index/3);
  sheets[theme].push({input:await resized(420),left:col*420,top:row*347});
  sheets[theme].push({input:Buffer.from(`<svg width="420" height="32"><text x="8" y="21" font-size="11" font-family="monospace" fill="${theme==='paper'?'#444':'#ddd'}">${e.id}</text></svg>`),left:col*420,top:row*347+315});
 }
}
for(const theme of ['paper','cinema']as const)await sharp({create:{width:1260,height:Math.ceil(entries.length/3)*347,channels:3,background:theme==='paper'?'#e9e4d8':'#1f2124'}}).composite(sheets[theme]).png().toFile(`${out}/contact-sheet-420-${theme}.png`);
writeFileSync(`${out}/sizes.json`,JSON.stringify(stats,null,2)+'\n');console.log(stats.map(s=>`${s.id}: ${s.bytes} B; bounds ${(s.occupancy.width*100).toFixed(1)}% x ${(s.occupancy.height*100).toFixed(1)}%`).join('\n'));
