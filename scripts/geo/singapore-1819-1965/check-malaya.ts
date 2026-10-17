/** G23 independent town-anchor fit and modern-state boundary comparison. */
import{resolve}from'node:path';import sharp from'sharp';import{readJson}from'../lib/common';import{candidates,evaluate}from'../lib/fit';
const dir=resolve(import.meta.dirname),cp=readJson<any>(`${dir}/georef-G23.json`);const fit=candidates('auto',cp.controlPoints).map(c=>evaluate(c.proj,c.kind,cp.controlPoints)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!;
function inverse(lng:number,lat:number){let x=2000,y=2800;for(let i=0;i<8;i++){const a=fit.model.toLngLat(x,y),b=fit.model.toLngLat(x+1,y),c=fit.model.toLngLat(x,y+1),d=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]),u=lng-a[0],v=lat-a[1];x+=(u*(c[1]-a[1])-v*(c[0]-a[0]))/d;y+=(v*(b[0]-a[0])-u*(b[1]-a[1]))/d;}return[x,y];}
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="3904" height="5148">';
const ne=readJson<any>(`${dir}/raw/ne_10m_admin_1_states_provinces.geojson`);
for(const f of ne.features.filter((f:any)=>f.properties.admin==='Malaysia'&&!['Sabah','Sarawak','Labuan','Kuala Lumpur','Putrajaya'].includes(f.properties.name))){const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const p of polys)for(const ring of p){const pts=ring.map((p:number[])=>inverse(p[0]!,p[1]!).map(n=>n.toFixed(2)).join(',')).join(' ');svg+=`<polyline points="${pts}" stroke="#009e73" stroke-width="3" fill="none"/>`;}}
for(const p of cp.controlPoints)svg+=`<circle cx="${p.svg[0]}" cy="${p.svg[1]}" r="6" fill="#d55e00"/>`;
svg+='</svg>';
const over=await sharp(`${dir}/work/G23-quarter.jpg`).composite([{input:Buffer.from(svg)}]).png().toBuffer();
await sharp(over).resize({width:1600}).png().toFile(`${dir}/../../../docs/screenshots/singapore-1819-1965/geo-G23-state-audit.png`);
