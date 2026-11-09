/** Offline paper/cinema QA. Does not use a browser or desktop. */
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp,{type OverlayOptions} from 'sharp';
import {assertPowerChain} from './circuits-power-chain';
import {assertClock} from './telling-time';
export const out='/tmp/atlas-i-b-round3/previews';mkdirSync(out,{recursive:true});
assertPowerChain();assertClock();
const ids=['figures/circuits-power-chain','telling-time','telling-time@2x'];
const reference='public/illustrations/figures/circuits-series-parallel.webp';
async function theme(file:string,dark:boolean,preserve=false):Promise<Buffer>{
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true}),pixels=Buffer.alloc(info.width*info.height*3),bg=dark?[31,33,36]:[233,228,216];
 for(let i=0;i<info.width*info.height;i++){
  const a=data[4*i+3]!/255;
  for(let c=0;c<3;c++){
   const v=data[4*i+c]!;
   pixels[i*3+c]=Math.round(dark?(preserve?.95*.85*(a*v+(1-a)*[233,228,216][c]!)+6.375:bg[c]!+(1-bg[c]!/255)*(.94*(255-v)+7.65)*a*.86):bg[c]!*(1-a+a*v/255));
  }
 }
 return sharp(pixels,{raw:{width:info.width,height:info.height,channels:3}}).png().toBuffer();
}
const refs=await Promise.all([false,true].map(d=>theme(reference,d,true))),rows:OverlayOptions[]=[],sizes=[];
for(const [index,id] of ids.entries()){
 const file=`public/illustrations/${id}.webp`,name=id.replace('figures/','figure-'),m=await sharp(file).metadata();assert(m.width&&m.height);
 assert(statSync(file).size<=(m.width===800?90000:120000));
 const {data}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});let x0=m.width,y0=m.height,x1=0,y1=0;
 for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++)if(data[(y*m.width+x)*4+3]!>32){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 assert(x0>0&&y0>0&&x1<m.width-1&&y1<m.height-1,`${id}: margin`);assert((x1-x0)/m.width>=.6&&(y1-y0)/m.height>=.6,`${id}: frame fill`);
 const tiles:OverlayOptions[]=[],details:OverlayOptions[]=[],comparisons:OverlayOptions[]=[];
 for(const [j,dark] of [false,true].entries()){
  const rendered=await theme(file,dark),t=dark?'cinema':'paper';
  await sharp(rendered).resize(m.width*2,m.height*2,{kernel:'nearest'}).png().toFile(`${out}/${name}-${t}-2x.png`);
  const small=await sharp(rendered).resize(420).png().toBuffer();await sharp(small).toFile(`${out}/${name}-${t}-420.png`);
  tiles.push({input:small,left:j*840,top:30},{input:await sharp(refs[j]!).resize(420).png().toBuffer(),left:j*840+420,top:30});
  const k=m.width/(id.startsWith('figures/')?1200:1600);
  const windows=id.startsWith('figures/')?[[445,525,300,325],[520,185,220,90]]:[[270,115,320,270],[1070,1100,320,320]];
  for(const [w,box] of windows.entries()){
   const [x,y,width,height]=box.map(v=>Math.round(v*k));
   const crop=await sharp(rendered).extract({left:x!,top:y!,width:width!,height:height!}).resize(width!*2,height!*2,{kernel:'nearest'}).png().toBuffer();
   await sharp(crop).toFile(`${out}/${name}-${t}-detail-${w}-2x.png`);
   details.push({input:await sharp(crop).resize(600,650,{fit:'contain',background:dark?'#1f2124':'#e9e4d8'}).png().toBuffer(),left:j*1200+w*600,top:35});
   if(w===0){
    const ref=await sharp(refs[j]!).extract({left:140,top:290,width:width!,height:height!}).resize(width!*2,height!*2,{kernel:'nearest'}).png().toBuffer();
    comparisons.push({input:crop,left:j*width!*4,top:30},{input:ref,left:j*width!*4+width!*2,top:30});
   }
  }
 }
 const title=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1680" height="30"><text x="8" y="21" font-family="monospace" font-size="14">${name}: paper / A circuits / cinema / A circuits (420 px each; A preserves illumination)</text></svg>`);
 const row=await sharp({create:{width:1680,height:450,channels:3,background:'#e9e4d8'}}).composite([{input:title,left:0,top:0},...tiles]).png().toBuffer();
 await sharp(row).toFile(`${out}/${name}-A-comparison-420.png`);rows.push({input:row,left:0,top:index*450});
 await sharp({create:{width:2400,height:685,channels:3,background:'#e9e4d8'}}).composite(details).png().toFile(`${out}/${name}-details.png`);
 const cropWidth=Math.round((id.startsWith('figures/')?300:320)*m.width/(id.startsWith('figures/')?1200:1600));
 const cropHeight=Math.round((id.startsWith('figures/')?325:270)*m.width/(id.startsWith('figures/')?1200:1600));
 const label2x=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cropWidth*8}" height="30"><text x="8" y="21" font-family="monospace" font-size="13">Native 2x detail: paper / A plate / cinema / A plate</text></svg>`);
 await sharp({create:{width:cropWidth*8,height:cropHeight*2+30,channels:3,background:'#e9e4d8'}}).composite([{input:label2x,left:0,top:0},...comparisons]).png().toFile(`${out}/${name}-A-comparison-2x.png`);
 sizes.push({file,bytes:statSync(file).size,width:m.width,height:m.height,bounds:[x0,y0,x1,y1],invert:true,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')});
}
await sharp({create:{width:1680,height:rows.length*450,channels:3,background:'#e9e4d8'}}).composite(rows).png().toFile(`${out}/contact-sheet-420-with-A.png`);
const compact:OverlayOptions[]=[];let top=0;
for(const id of [ids[0]!,ids[2]!]){
 const name=id.replace('figures/','figure-'),height=id.startsWith('figures/')?315:420;
 const label=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="840" height="28"><text x="8" y="20" font-family="monospace" font-size="13">${name}: paper / cinema</text></svg>`);
 compact.push({input:label,left:0,top});for(const [j,t]of ['paper','cinema'].entries())compact.push({input:readFileSync(`${out}/${name}-${t}-420.png`),left:j*420,top:top+28});top+=height+28;
}
await sharp({create:{width:840,height:top,channels:3,background:'#e9e4d8'}}).composite(compact).png().toFile(`${out}/contact-sheet-420.png`);
writeFileSync(`${out}/sizes.json`,JSON.stringify(sizes,null,2)+'\n');console.log(out);
const manifest=readFileSync('public/illustrations/b-review-manifest.jsonl','utf8').trim().split('\n').map(s=>JSON.parse(s));
for(const item of sizes){
 const row=manifest.find(r=>`public/illustrations/${r.file}`===item.file);
 assert(row&&row.checks.length>=3&&row.checks.length<=6,'required checklist');
 assert.equal(row.bytes,item.bytes);assert.equal(row.sha256,item.sha256);
}
