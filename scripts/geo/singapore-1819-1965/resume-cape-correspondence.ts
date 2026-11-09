/** Independent modern-coast/name-point diagnostic. Does not alter controls. */
import {readFileSync,writeFileSync} from 'node:fs';
import {feature} from 'topojson-client';
import sharp from 'sharp';
const d=import.meta.dirname;
const read=(f:string)=>JSON.parse(readFileSync(`${d}/${f}`,'utf8'));
const topo=read('../../../public/geo/land-sg.json');
const fs=(feature(topo,Object.values(topo.objects)[0] as any) as any).features;
const polygons:number[][][][]=fs.flatMap((f:any)=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[]);
const rings=polygons.flat();
const controls=read('georef-G9.json').controlPoints.slice(0,6);
const report=[];
for(const [i,c] of controls.entries()){
 const [lon,lat]=c.lnglat,span=.012,scale=600/(2*span);
 const xy=([x,y]:number[])=>[900+(x!-lon+span)*scale,80+(lat+span-y!)*scale];
 const path=polygons.map(poly=>poly.map(r=>r.map((v,j)=>{const [x,y]=xy(v);return`${j?'L':'M'}${x},${y}`}).join(' ')+'Z').join(' ')).join(' ');
 let nearest:number[]=[0,0],best=Infinity;
 for(const r of rings)for(let k=1;k<r.length;k++){
  const a=r[k-1]!,b=r[k]!,u=b[0]!-a[0]!,v=b[1]!-a[1]!;
  const t=Math.max(0,Math.min(1,((lon-a[0]!)*u+(lat-a[1]!)*v)/(u*u+v*v)));
  const q=[a[0]!+t*u,a[1]!+t*v],dist=Math.hypot((q[0]!-lon)*Math.cos(lat*Math.PI/180),q[1]!-lat)*111195;
  if(dist<best){best=dist;nearest=q}
 }
 report.push({name:c.name,OSMNamePoint:c.lnglat,nearestModernCoast:nearest,distanceM:best,qualification:'Nearest coast is a geometric diagnostic, not a corresponding historic point or replacement control.'});
 const src=await sharp(`${d}/raw/G9.jpg`).extract({left:c.svg[0]-350,top:c.svg[1]-350,width:700,height:700}).resize(800,800).png().toBuffer();
 const heading=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="880"><rect width="1600" height="880" fill="#e9e4d8"/><text x="25" y="35" font-family="sans-serif" font-size="25">${c.name} · source reading / modern URA land + OSM name point</text><defs><clipPath id="p"><rect x="900" y="80" width="600" height="600"/></clipPath></defs><g clip-path="url(#p)"><rect x="900" y="80" width="600" height="600" fill="#cfdbdc"/><path d="${path}" fill="#d6d1be" fill-rule="evenodd" stroke="#333" stroke-width="1.5"/></g><circle cx="1200" cy="380" r="6" fill="none" stroke="#bb3422" stroke-width="2"/><text x="900" y="735" font-family="sans-serif" font-size="20">Name point to nearest modern coast: ${best.toFixed(1)} m</text><text x="900" y="775" font-family="sans-serif" font-size="17">Nearest coast does not establish historic correspondence.</text></svg>`);
 const mark=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><circle cx="400" cy="400" r="8" fill="none" stroke="#bb3422" stroke-width="2"/></svg>');
 const left=await sharp(src).composite([{input:mark}]).png().toBuffer();
 await sharp(heading).composite([{input:left,left:25,top:65}]).png().toFile(`${d}/work/resume-cape-correspondence-${i}.png`);
}
writeFileSync(`${d}/resume-cape-correspondence.json`,JSON.stringify(report,null,2)+'\n');
console.log(report);
