/** Offline QA only. Never opens a browser or desktop. */
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp,{type OverlayOptions} from 'sharp';
const out='/tmp/atlas-i-b-round2/previews';mkdirSync(out,{recursive:true});
const ids=['figures/steam-engine-parallel-motion','steam-engine-parallel-motion','steam-engine-parallel-motion@2x','figures/singapore-land-use-reclamation-section'];
const reference='public/illustrations/figures/circuits-series-parallel.webp';
async function theme(file:string,dark:boolean):Promise<Buffer>{
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true}),pixels=Buffer.alloc(info.width*info.height*3),bg=dark?[31,33,36]:[233,228,216];
 for(let i=0;i<info.width*info.height;i++){const a=data[4*i+3]!/255,v=data[4*i]!;for(let c=0;c<3;c++)pixels[i*3+c]=Math.round(dark?bg[c]!+(1-bg[c]!/255)*(.94*(255-v)+7.65)*a*.86:bg[c]!*(1-a+a*v/255));}
 return sharp(pixels,{raw:{width:info.width,height:info.height,channels:3}}).png().toBuffer();
}
const refs=await Promise.all([false,true].map(d=>theme(reference,d))),rows:OverlayOptions[]=[],sizes=[];
for(const [index,id] of ids.entries()){
 const file=`public/illustrations/${id}.webp`,name=id.replace('figures/','figure-'),m=await sharp(file).metadata();assert(m.width&&m.height);
 assert(statSync(file).size<=(m.width===800?90000:120000));
 if(id.startsWith('figures/')){assert.equal(m.width,1200);assert.equal(m.height,900);}
 const {data}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});let x0=m.width,y0=m.height,x1=0,y1=0;
 for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++)if(data[(y*m.width+x)*4+3]!>32){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 assert(x0>0&&y0>0&&x1<m.width-1&&y1<m.height-1,`${id}: margin`);assert((x1-x0)/m.width>=.6&&((y1-y0)/m.height)>=.6,`${id}: frame fill`);
 const tiles:OverlayOptions[]=[],detail:OverlayOptions[]=[];
 for(const [j,dark]of [false,true].entries()){
  const rendered=await theme(file,dark),t=dark?'cinema':'paper';
  await sharp(rendered).resize(m.width*2,m.height*2,{kernel:'nearest'}).png().toFile(`${out}/${name}-${t}-2x.png`);
  const small=await sharp(rendered).resize(420).png().toBuffer();await sharp(small).toFile(`${out}/${name}-${t}-420.png`);
  tiles.push({input:small,left:j*840,top:30},{input:await sharp(refs[j]!).resize(420).png().toBuffer(),left:j*840+420,top:30});
  // Two critical local windows per composition, shown at exactly 2× native size.
  const windows=id.includes('steam')?[[915,405],[925,625]]:id.includes('reclamation')?[[350,525],[620,590]]:[[300/1600*m.width,380/1600*m.width],[1130/1600*m.width,1130/1600*m.width]];
  for(const [k,w]of windows.entries()){
   const native=id.startsWith('figures/')?1:m.width/1200;
   const x=id.includes('steam')?w[0]!*native:w[0]!,y=id.includes('steam')?w[1]!*native:w[1]!;
   const width=Math.min(240,m.width-Math.round(x)),height=Math.min(240,m.height-Math.round(y));
   const crop=await sharp(rendered).extract({left:Math.round(x),top:Math.round(y),width,height}).resize(width*2,height*2,{kernel:'nearest'}).png().toBuffer();
   detail.push({input:crop,left:j*960+k*480,top:35});
  }
 }
 const title=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1680" height="30"><text x="8" y="21" font-family="monospace" font-size="15">${name}: paper / A reference / cinema / A reference (420 px each)</text></svg>`);
 const row=await sharp({create:{width:1680,height:450,channels:3,background:'#e9e4d8'}}).composite([{input:title,left:0,top:0},...tiles]).png().toBuffer();
 await sharp(row).toFile(`${out}/${name}-A-comparison-420.png`);rows.push({input:row,left:0,top:index*450});
 const detailTitle=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="35"><text x="8" y="23" font-family="monospace" font-size="16">${name}: two details at 2x native; paper left, cinema right</text></svg>`);
 await sharp({create:{width:1920,height:515,channels:3,background:'#e9e4d8'}}).composite([{input:detailTitle,left:0,top:0},...detail]).png().toFile(`${out}/${name}-details-2x.png`);
 sizes.push({file,bytes:statSync(file).size,width:m.width,height:m.height,bounds:[x0,y0,x1,y1],invert:true,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')});
}
await sharp({create:{width:1680,height:rows.length*450,channels:3,background:'#e9e4d8'}}).composite(rows).png().toFile(`${out}/contact-sheet-420-with-A.png`);
writeFileSync(`${out}/sizes.json`,JSON.stringify(sizes,null,2)+'\n');console.log(out);
// Compact delivery sheet: the five assigned compositions, paper / cinema.
const compactIds=['figures/steam-engine-parallel-motion','steam-engine-parallel-motion@2x','figures/singapore-land-use-reclamation-section'];
const compact:OverlayOptions[]=[];let top=0;
for(const id of compactIds){
 const name=id.replace('figures/','figure-'),height=id.startsWith('figures/')?315:420;
 const label=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="840" height="28"><text x="8" y="20" font-family="monospace" font-size="13">${name}: paper / cinema</text></svg>`);
 compact.push({input:label,left:0,top});
 for(const [j,t]of ['paper','cinema'].entries())compact.push({input:readFileSync(`${out}/${name}-${t}-420.png`),left:j*420,top:top+28});
 top+=height+28;
}
await sharp({create:{width:840,height:top,channels:3,background:'#e9e4d8'}}).composite(compact).png().toFile(`${out}/contact-sheet-420.png`);
// Checklist hashes certify these exact final rasters, not an earlier attempt.
const checklist=readFileSync('scripts/figures/b-review-manifest.jsonl','utf8').trim().split('\n').map(s=>JSON.parse(s));
for(const item of sizes){
 const row=checklist.find(r=>`public/illustrations/${r.file}`===item.file);assert(row,`${item.file}: missing checklist`);
 assert(row.checks.length>=3&&row.checks.length<=6);assert.equal(row.sha256,item.sha256);assert.equal(row.bytes,item.bytes);
}
