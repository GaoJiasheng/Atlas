/** G8 southern Wei enclave and adjacent Qi/Chu: directly sample published fills. */
import fs from'node:fs';import sharp from'sharp';import{readImage,fillUnknown,majority,absorbSmall}from'../lib/raster';
export async function correctSouthernBorders(){
const img=await readImage('scripts/geo/warring-states/raw/G8-original.png'),mask=await readImage('scripts/geo/warring-states/raw/G8-trace.png');
const x0=405,y0=290,w=100,h=70;const cols=[[219,157,92],[189,110,126],[125,165,142],[184,189,92],[156,129,112]];const grid=new Int16Array(w*h).fill(-1);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=((y+y0)*img.width+x+x0)*4;const[r,g,b]=Array.from(img.data.slice(p,p+3))as[number,number,number];if(r+g+b<150||(r>235&&g>210&&b>170)||g<30)continue;const rg=r/g,bg=b/g;let k=-1;if(rg>1.22&&rg<1.42&&bg>.43&&bg<.61)k=0;else if(rg>1.55&&rg<1.9&&bg>.95&&bg<1.13)k=1;else if(rg>.73&&rg<.9&&bg>.7&&bg<.88)k=2;else if(rg>.95&&rg<1.08&&bg>.43&&bg<.58)k=3;else if(rg>1.1&&rg<1.24&&bg>.76&&bg<.9)k=4;if(k>=0)grid[y*w+x]=k;}
// Han country-name plate and Zhou glyph are annotations covering the surrounding Han fill.
for(let y=307;y<335;y++)for(let x=391;x<417;x++)if(x>=x0&&x<x0+w&&y>=y0&&y<y0+h)grid[(y-y0)*w+x-x0]=3;
fillUnknown(grid,w,h);const filled=majority(grid,w,h,5);absorbSmall(filled,w,h,()=>20);let changed=0;
for(let y=0;y<mask.height;y++)for(let x=0;x<mask.width;x++){const sx=Math.floor((x+.5)*img.width/mask.width),sy=Math.floor((y+.5)*img.height/mask.height);if(sx<x0||sx>=x0+w||sy<y0||sy>=y0+h)continue;const p=(y*mask.width+x)*4;const col=cols[filled[(sy-y0)*w+sx-x0]!]!;if(col.some((v,i)=>mask.data[p+i]!==v))changed++;mask.data.set(col,p);}
await sharp(Buffer.from(mask.data),{raw:{width:mask.width,height:mask.height,channels:4}}).png().toFile('scripts/geo/warring-states/raw/G8-trace.png');
const b=Buffer.alloc(w*h*3);for(let i=0;i<filled.length;i++)b.set(cols[filled[i]!]!,i*3);await sharp(b,{raw:{width:w,height:h,channels:3}}).resize(w*8,h*8,{kernel:'nearest'}).png().toFile('scripts/geo/warring-states/check/raster-G8-southern-source-classes.png');
// G7: only near-white old antialiased trace pixels remain; classify from source at those exact pixels.
const seven=await readImage('scripts/geo/warring-states/raw/G7-trace.png'),src=await readImage('scripts/geo/warring-states/raw/G7.png');let slits=0;
for(let y=229;y<304;y++)for(let x=333;x<400;x++){const p=(y*seven.width+x)*4;const old=Array.from(seven.data.slice(p,p+3));if(Math.min(...old)<205)continue;const[r,g,b]=Array.from(src.data.slice(p,p+3))as[number,number,number];if(g<40)continue;const rg=r/g,bg=b/g;let col:number[]|null=null;if(rg>.95&&rg<1.08&&bg>.43&&bg<.58)col=[184,189,92];else if(rg>1.22&&rg<1.42&&bg>.43&&bg<.61)col=[219,157,92];else if(rg>1.035&&rg<1.12&&bg>.73&&bg<.85&&!(r>240&&g>210&&b>170))col=[148,162,134];if(col){seven.data.set(col,p);slits++;}}
await sharp(Buffer.from(seven.data),{raw:{width:seven.width,height:seven.height,channels:4}}).png().toFile('scripts/geo/warring-states/raw/G7-trace.png');
for(const id of['G7','G8']){const m=await readImage(`scripts/geo/warring-states/raw/${id}-trace.png`);const edges=Buffer.alloc(m.width*m.height*4);for(let y=1;y<m.height-1;y++)for(let x=1;x<m.width-1;x++){const p=(y*m.width+x)*4;for(const q of[p-4,p+4,p-m.width*4,p+m.width*4])if(m.data[p]!==m.data[q]||m.data[p+1]!==m.data[q+1]||m.data[p+2]!==m.data[q+2]){edges.set([0,255,255,220],p);break;}}await sharp(`scripts/geo/warring-states/raw/${id}.png`).composite([{input:edges,raw:{width:m.width,height:m.height,channels:4}}]).png().toFile(`scripts/geo/warring-states/check/raster-${id}-trace-overlay.png`);}
console.log(`G8 southern source patch: ${changed} pixels corrected; G7 near-white source-backed slit pixels: ${slits}`);
}
