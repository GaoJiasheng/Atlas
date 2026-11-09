/** Offline source comparison of the actual final, decoded published L5 rings.
 * No browser, tiles, screenshots or handwritten geographic geometry.
 */
import {readFileSync} from 'node:fs';
import sharp from 'sharp';
import {feature} from 'topojson-client';
import {candidates,evaluate} from '../lib/fit';
import {buildModel} from './resume-register-anu1958-model';
const d=import.meta.dirname, model=buildModel();
const topo=JSON.parse(readFileSync(`${d}/../../../public/geo/land-sg-history.json`,'utf8'));
const fc=feature(topo,topo.objects['land-sg-history']) as any;
const f=fc.features.find((f:any)=>f.properties.id==='L5');
if(!f)throw Error('Missing final published L5');
function inverse([lon,lat]:number[]):number[]{
 let x=2400,y=4100;
 for(let i=0;i<8;i++){
  const a=model.toLngLat(x,y),b=model.toLngLat(x+1,y),c=model.toLngLat(x,y+1);
  const ux=b[0]-a[0],uy=b[1]-a[1],vx=c[0]-a[0],vy=c[1]-a[1],dx=lon!-a[0],dy=lat!-a[1],det=ux*vy-vx*uy;
  x+=(dx*vy-vx*dy)/det;y+=(ux*dy-dx*uy)/det;
 }
 return[x-400,y-3400];
}
const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
const path=polygons.flatMap((p:number[][][])=>p.map(r=>r.map(inverse).map(([x,y],i)=>`${i?'L':'M'}${x!.toFixed(2)},${y!.toFixed(2)}`).join(' ')+'Z')).join(' ');
const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="3100" height="1700"><path d="${path}" fill="none" stroke="#007e77" stroke-width="1.1" stroke-linejoin="round"/></svg>`);
const source=await sharp(`${d}/raw/resume-source-anu1958.jpg`,{limitInputPixels:false}).extract({left:400,top:3400,width:3100,height:1700}).png().toBuffer();
const comparison=await sharp(source).composite([{input:svg}]).png().toBuffer();
await sharp(comparison).png().toFile(`${d}/previews/G35-published-coast.png`);
for(const [name,left,top,width,height]of [['west',0,0,1450,1300],['mouth',1650,800,800,480],['pandan',2150,750,600,550]] as const){
 await sharp(comparison).extract({left,top,width,height}).resize({width:width*2}).png().toFile(`${d}/previews/G35-published-${name}.png`);
}
// Inspect the complete paired-bank head, in addition to lower-mouth checks.
await sharp(comparison).extract({left:1850,top:90,width:350,height:360}).resize({width:1400}).png().toFile(`${d}/previews/G35-published-head.png`);
console.log('Final published L5 coast over the native G35 source: previews/G35-published-*.png');
// Compare the retained western inlet with its OWN corrected chart. The
// northern source-bank splice is verified independently by round2-splice.ts.
const g15=JSON.parse(readFileSync(`${d}/georef-G15-grid.json`,'utf8'));
const m15=candidates('auto',g15.controlPoints).map(c=>evaluate(c.proj,c.kind,g15.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!.model;
function inverse15([lon,lat]:number[]):number[]{
 let x=5000,y=7500;
 for(let i=0;i<8;i++){
  const a=m15.toLngLat(x,y),b=m15.toLngLat(x+1,y),c=m15.toLngLat(x,y+1);
  const ux=b[0]-a[0],uy=b[1]-a[1],vx=c[0]-a[0],vy=c[1]-a[1],dx=lon!-a[0],dy=lat!-a[1],det=ux*vy-vx*uy;
  x+=(dx*vy-vx*dy)/det;y+=(ux*dy-dx*uy)/det;
 }
 return[x,y];
}
const box=[3600,5800,2600,3300],scale=1600/box[2]!;
const path15=polygons.flatMap((p:number[][][])=>p.map(r=>r.map(inverse15).map(([x,y],i)=>`${i?'L':'M'}${((x!-box[0]!)*scale).toFixed(2)},${((y!-box[1]!)*scale).toFixed(2)}`).join(' ')+'Z')).join(' ');
const height=Math.round(box[3]!*scale);
const overlay15=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${height}"><path d="${path15}" fill="none" stroke="#007e77" stroke-width="1.2" stroke-linejoin="round"/></svg>`);
await sharp(`${d}/raw/G15.jpg`,{limitInputPixels:false}).extract({left:box[0]!,top:box[1]!,width:box[2]!,height:box[3]!}).resize({width:1600,height}).composite([{input:overlay15}]).png().toFile(`${d}/previews/G15-published-inlet.png`);
console.log('Western source comparison (G16 northern bank + G15 mangrove tip + G35 lower coverage): previews/G15-published-inlet.png');

const northBox=[4900,5880,650,650],northScale=2;
const northPath=polygons.flatMap((p:number[][][])=>p.map(r=>r.map(inverse15).map(([x,y],i)=>`${i?'L':'M'}${((x!-northBox[0]!)*northScale).toFixed(2)},${((y!-northBox[1]!)*northScale).toFixed(2)}`).join(' ')+'Z')).join(' ');
await sharp(`${d}/raw/G15.jpg`,{limitInputPixels:false}).extract({left:northBox[0]!,top:northBox[1]!,width:northBox[2]!,height:northBox[3]!}).resize({width:1300}).composite([{input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1300" height="1300"><path d="${northPath}" fill="none" stroke="#007e77" stroke-width="1.5" stroke-linejoin="round"/></svg>`)}]).png().toFile(`${d}/previews/G15-published-north.png`);
// The complete retained northern bank is from G16, rather than the incomplete
// G15 mask. Compare it against its own chart and coordinate model.
const {buildG16Model}=await import('./resume-register-G16-model');const m16=buildG16Model();
function inverse16(p:number[]):number[]{let x=7500,y=5400;for(let i=0;i<8;i++){const a=m16.toLngLat(x,y),b=m16.toLngLat(x+1,y),c=m16.toLngLat(x,y+1),u=p[0]!-a[0],v=p[1]!-a[1],A=b[0]-a[0],B=c[0]-a[0],C=b[1]-a[1],D=c[1]-a[1],det=A*D-B*C;x+=(u*D-v*B)/det;y+=(v*A-u*C)/det;}return[x,y];}
const box16=[6900,4700,1600,1900],s16=1;
const path16=polygons.flatMap((p:number[][][])=>p.map(r=>r.map(inverse16).map(([x,y],i)=>`${i?'L':'M'}${((x!-box16[0]!)*s16).toFixed(2)},${((y!-box16[1]!)*s16).toFixed(2)}`).join(' ')+'Z')).join(' ');
await sharp(`${d}/raw/G16.jpg`,{limitInputPixels:false}).extract({left:box16[0]!,top:box16[1]!,width:box16[2]!,height:box16[3]!}).composite([{input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1900"><path d="${path16}" fill="none" stroke="#007e77" stroke-width="1.5" stroke-linejoin="round"/></svg>`)}]).png().toFile(`${d}/previews/G16-published-north.png`);

for(const [file,title,subtitle]of [
 ['G15-published-north.png','G15 original · the added mangrove tip is traced here','Surrounding northern bank uses G16 (1954) · mixed dated sources · positions approximate'],
 ['G16-published-north.png','G16 original · the complete northern bank is retained','The added western mangrove tip uses G15 · mixed dated sources · positions approximate'],
]as const){
 const p=`${d}/previews/${file}`,body=await sharp(p).png().toBuffer(),meta=await sharp(body).metadata();
 const header=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="86"><rect width="100%" height="86" fill="#e9e4d8"/><g fill="#2a2824" font-family="sans-serif"><text x="20" y="32" font-size="23">${title}</text><text x="20" y="63" font-size="17">${subtitle}</text></g></svg>`);
 await sharp({create:{width:meta.width!,height:meta.height!+86,channels:3,background:'#e9e4d8'}}).composite([{input:header,top:0,left:0},{input:body,top:86,left:0}]).png().toFile(p);
}
