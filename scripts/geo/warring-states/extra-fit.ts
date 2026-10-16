/** Reproduce check-only map registration using the existing pipeline's fit.ts. */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {candidates,evaluate} from '../lib/fit';
import sharp from 'sharp';
const dir='scripts/geo/warring-states',m=JSON.parse(readFileSync(`${dir}/extra-georef-manifest.json`,'utf8'));
mkdirSync(`${dir}/check`,{recursive:true});
const all={...m.raster,...Object.fromEntries(Object.entries(m.unregistered).filter(([,x]:any)=>x.diagnosticControlPoints?.length>=4).map(([id,x]:any)=>[id,{...x,projection:'auto',controlPoints:x.diagnosticControlPoints,maxResidualKm:25}]))};
const esc=(x:string)=>x.replaceAll('&','&amp;').replaceAll('<','&lt;');
for(const[id,src]of Object.entries(all)as any){
 const results=candidates(src.projection,src.controlPoints).map(c=>evaluate(c.proj,c.kind,src.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm);
 const {report:r,model}=results[0]!;
 const report={...r,controlPointCount:src.controlPoints.length,budgetKm:src.maxResidualKm,minimumControlPoints:12,usableForTracing:src.controlPoints.length>=12&&r.maxKm<=src.maxResidualKm&&r.looMaxKm<=src.maxResidualKm,models:results.map(x=>x.report)};
 writeFileSync(`${dir}/check/extra-${id}-fit.json`,JSON.stringify(report,null,2)+'\n');
 console.log(id,src.controlPoints.length,r.model,`RMS=${r.rmsKm.toFixed(2)},max=${r.maxKm.toFixed(2)},LOO=${r.looRmsKm.toFixed(2)},LOOmax=${r.looMaxKm.toFixed(2)},eligible=${report.usableForTracing}`);
 const file=`${dir}/${src.registrationInput}`,md=await sharp(file).metadata(),w=md.width!,h=md.height!;
 const markers=`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${src.controlPoints.map((cp:any,i:number)=>`<circle cx="${cp.svg[0]}" cy="${cp.svg[1]}" r="8" fill="none" stroke="#cf227a" stroke-width="2"/><text x="${cp.svg[0]+10}" y="${cp.svg[1]-8}" font-size="14" font-family="sans-serif" fill="#cf227a">${i+1}</text>`).join('')}</svg>`;
 const annotated=await sharp(file).flatten({background:'#fff'}).composite([{input:Buffer.from(markers),top:0,left:0}]).png().toBuffer();
 await sharp(annotated).toFile(`${dir}/check/extra-${id}-control-points.png`);
 const c=src.controlPoints,ps=c.flatMap((cp:any)=>[cp.lnglat,model.toLngLat(...cp.svg)]),xs=ps.map((p:any)=>p[0]),ys=ps.map((p:any)=>p[1]);
 const box=[Math.min(...xs)-.5,Math.min(...ys)-.5,Math.max(...xs)+.5,Math.max(...ys)+.5];
 const px=(ll:number[])=>[40+(ll[0]!-box[0]!)/(box[2]!-box[0]!)*660,70+(box[3]!-ll[1]!)/(box[3]!-box[1]!)*520];
 const tags=c.map((cp:any,i:number)=>{const a=px(cp.lnglat),b=px(model.toLngLat(...cp.svg));return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#aa5522"/><circle cx="${a[0]}" cy="${a[1]}" r="4" fill="#164b7a"/><circle cx="${b[0]}" cy="${b[1]}" r="5" fill="none" stroke="#cf227a"/><text x="${b[0]+8}" y="${b[1]-4}" font-family="sans-serif" font-size="12">${i+1}</text>`}).join('');
 const coast=JSON.parse(readFileSync(`${dir}/raw/ne-land.geojson`,'utf8')).features.flatMap((f:any)=>f.geometry.type==='MultiPolygon'?f.geometry.coordinates:f.geometry.type==='Polygon'?[f.geometry.coordinates]:[]).flatMap((poly:any)=>poly.slice(0,1)).map((ring:any)=>{
  const near=ring.filter((p:any)=>p[0]>box[0]-2&&p[0]<box[2]+2&&p[1]>box[1]-2&&p[1]<box[3]+2);if(near.length<3)return'';return `<path d="${near.map((p:any,i:number)=>`${i?'L':'M'}${px(p).join(',')}`).join(' ')}" fill="none" stroke="#8a999c" stroke-width=".6"/>`;
 }).join('');
 const legend=c.map((cp:any,i:number)=>`<text x="${i<11?20:380}" y="${630+(i%11)*18}" font-family="sans-serif" font-size="13">${i+1}. ${esc(cp.name)} — ${r.points[i].residualKm.toFixed(1)} km</text>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="740" height="850"><rect width="740" height="850" fill="#fcfbf6"/><text x="20" y="25" font-family="sans-serif" font-size="18">${id}: ${r.model}</text><text x="20" y="48" font-family="sans-serif" font-size="13">Blue: Wikipedia coordinate; magenta: fitted source point; grey: Natural Earth coast.</text>${coast}${tags}<text x="20" y="610" font-family="sans-serif" font-size="13">RMS ${r.rmsKm.toFixed(2)} km / max ${r.maxKm.toFixed(2)} km; LOO RMS ${r.looRmsKm.toFixed(2)} km; n=${c.length}</text>${legend}</svg>`;
 const left=await sharp(annotated).resize({width:740,height:850,fit:'contain',background:'#fff'}).png().toBuffer();
 const right=await sharp(Buffer.from(svg)).png().toBuffer();
 await sharp({create:{width:1480,height:850,channels:3,background:'#fff'}}).composite([{input:left,left:0,top:0},{input:right,left:740,top:0}]).png().toFile(`${dir}/check/extra-${id}-registration.png`);
}
