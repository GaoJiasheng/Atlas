/** Offline CSS-theme proofs and export audit; never opens a browser. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import sharp from 'sharp';
import {PREVIEW} from './round3-graphite.js';
const entries=JSON.parse(readFileSync('scripts/figures/round3-spec.json','utf8')) as {id:string;slug:string;chapter:string;method:string;alt:{en:string;zh:string};caption:{en:string;zh:string};checks:string[]}[];
const folder=`${PREVIEW}/final`;mkdirSync(folder,{recursive:true});
const A='circuits-series-parallel';
const backgrounds={paper:[233,228,216],cinema:[31,33,36]} as const;
async function proof(id:string,width:number,theme:'paper'|'cinema'){
 const {data,info}=await sharp(`public/illustrations/figures/${id}.webp`).resize(width).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const out=Buffer.alloc(info.width*info.height*3),bg=backgrounds[theme];
 for(let p=0,q=0;p<data.length;p+=4,q+=3){const alpha=data[p+3]!/255*(theme==='cinema'?.86:1);
  for(let c=0;c<3;c++){const ink=data[p+c]!/255,base=bg[c]!/255;
   // CSS multiply, or invert + hue-rotate(180deg) + contrast(.94), screen.
   // Assets are neutral, so hue rotation has no effect beyond codec tolerance.
   const filtered=theme==='cinema'?(1-ink-.5)*.94+.5:ink;
   const blend=theme==='cinema'?1-(1-base)*(1-filtered):base*filtered;
   out[q+c]=Math.round(255*(base*(1-alpha)+blend*alpha));
  }
 }
 return sharp(out,{raw:{width:info.width,height:info.height,channels:3}}).png().toBuffer();
}
function label(text:string,width:number,theme:'paper'|'cinema'){
 return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="30"><text x="12" y="21" font-family="sans-serif" font-size="15" fill="${theme==='paper'?'#36332d':'#e9e4d8'}">${text}</text></svg>`);
}
const sheet:{input:Buffer;left:number;top:number}[]=[],stats=[];
for(const[eindex,e]of entries.entries()){
 const file=`public/illustrations/figures/${e.id}.webp`,bytes=readFileSync(file),{data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert(bytes.length<=120000);assert.equal(info.width,1200);assert.equal(info.height,900);
 let minX=1200,minY=900,maxX=0,maxY=0,coloured=0,transparent=0;
 for(let y=0;y<900;y++)for(let x=0;x<1200;x++){const k=(y*1200+x)*4;
  if(data[k+3]===0)transparent++;
  if(data[k+3]!>24){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);if(Math.max(data[k]!,data[k+1]!,data[k+2]!)-Math.min(data[k]!,data[k+1]!,data[k+2]!)>2)coloured++;}
 }
 assert(transparent>10000);assert.equal(coloured,0);assert(minX>0&&minY>0&&maxX<1199&&maxY<899);
 const occupancy={width:(maxX-minX+1)/1200,height:(maxY-minY+1)/900};assert(occupancy.width>=.6);
 const chapter=readFileSync(`src/content/topics/${e.slug}/chapters/${e.chapter}.mdx`,'utf8');for(const t of [e.alt.en,e.alt.zh,e.caption.en,e.caption.zh])assert(chapter.includes(t),`Caption mismatch ${e.id}`);
 stats.push({id:e.id,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),width:info.width,height:info.height,occupancy,transparentPixels:transparent,colouredPixels:coloured});
 for(const theme of ['paper','cinema']as const)for(const width of[420,840]){
  const [image,reference]=await Promise.all([proof(e.id,width,theme),proof(A,width,theme)]);
  await sharp(image).toFile(`${folder}/${e.id}-${theme}-${width}.png`);
  const bg=theme==='paper'?'#e9e4d8':'#1f2124',height=width*3/4;
  await sharp({create:{width:width*2,height:height+30,channels:3,background:bg}}).composite([{input:image,left:0,top:30},{input:reference,left:width,top:30},{input:label(`${e.id} / ${theme} / ${width}px`,width,theme),left:0,top:0},{input:label('A reference: circuits-series-parallel',width,theme),left:width,top:0}]).png().toFile(`${folder}/${e.id}-${theme}-with-A-${width}.png`);
  if(width===420){const left=theme==='paper'?0:840,top=eindex*345;sheet.push({input:label(`${e.id} / ${theme}`,840,theme),left,top},{input:image,left,top:top+30},{input:reference,left:left+420,top:top+30});}
 }
}
const strip=await sharp({create:{width:840,height:1725,channels:3,background:'#1f2124'}}).png().toBuffer();
await sharp({create:{width:1680,height:1725,channels:3,background:'#e9e4d8'}}).composite([{input:strip,left:840,top:0},...sheet]).png().toFile(`${folder}/contact-sheet-420.png`);
writeFileSync(`${folder}/sizes.json`,JSON.stringify(stats,null,2)+'\n');console.log(JSON.stringify(stats,null,2));
