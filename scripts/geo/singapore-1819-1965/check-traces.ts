/** Offline source-pixel QA, no app build or shoot. */
import { resolve } from 'node:path';
import sharp from 'sharp';
import { candidates,evaluate } from '../lib/fit';
import { readJson } from '../lib/common';
const dir=resolve(import.meta.dirname);
const cp=readJson<any>(resolve(dir,'georef-G1.json'));
const fit=candidates('auto',cp.controlPoints).map(c=>evaluate(c.proj,c.kind,cp.controlPoints)).filter(x=>Number.isFinite(x.report.looRmsKm)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!;
function inverse(lng:number,lat:number){let x=900,y=500;for(let i=0;i<5;i++){const a=fit.model.toLngLat(x,y),b=fit.model.toLngLat(x+1,y),c=fit.model.toLngLat(x,y+1);const d=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);const u=lng-a[0],v=lat-a[1];x+=(u*(c[1]-a[1])-v*(c[0]-a[0]))/d;y+=(v*(b[0]-a[0])-u*(b[1]-a[1]))/d;}return[x,y];}
const lines=readJson<any>(resolve(dir,'work/lines-traces.geojson'));
lines.features=lines.features.filter((f:any)=>f.properties.map==='jackson'&&!f.properties.line.startsWith('coast-')); 
const colors=['#0072b2','#d55e00','#009e73','#cc79a7','#e69f00','#56b4e9','#332288','#882255','#44aa99'];
const ids=[...new Set(lines.features.map((f:any)=>f.properties.line))];
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1846" height="1127">';
for(const f of lines.features){const color=colors[ids.indexOf(f.properties.line)];const pts=f.geometry.coordinates.map((p:number[])=>inverse(p[0]!,p[1]!).map(n=>n.toFixed(2)).join(',')).join(' ');svg+=`<polyline points="${pts}" stroke="${color}" stroke-width="3" fill="none"/>`;}
svg+='</svg>';
const over=await sharp(resolve(dir,'raw/G1.jpg')).composite([{input:Buffer.from(svg)}]).png().toBuffer();
const original=await sharp(resolve(dir,'raw/G1.jpg')).png().toBuffer();
const dest=resolve(dir,'../../../docs/screenshots/singapore-1819-1965/geo-K2-traces.png');
await sharp({create:{width:3692,height:1127,channels:3,background:'#fff'}}).composite([{input:original,left:0,top:0},{input:over,left:1846,top:0}]).png().toFile(dest);
console.log(dest);
