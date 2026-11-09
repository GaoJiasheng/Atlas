/** Offline CPU map QA. No browser, desktop, WebGL, or runtime network. */
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {feature} from 'topojson-client';
import {ShapeUtils, Vector2} from 'three';
import type {FeatureCollection, Polygon, MultiPolygon, Position} from 'geojson';
import sharp from 'sharp';
const dir='scripts/geo/ww2/work/previews';mkdirSync(dir,{recursive:true});
const args=process.argv.slice(2);const before=args[0]??'/tmp/ww2-control-before.json';
const old=JSON.parse(readFileSync(before,'utf8'));const current=JSON.parse(readFileSync('src/content/topics/ww2/data/control.json','utf8'));
const land=JSON.parse(readFileSync('public/geo/land-50m.json','utf8'));
const decodedLand=land.type==='Topology'?feature(land,land.objects[Object.keys(land.objects)[0]!]):land;
const baselineLand=decodedLand.type==='Feature'?{type:'FeatureCollection',features:[decodedLand]}:decodedLand;
const colours=JSON.parse(readFileSync('scripts/geo/ww2/check-colors.json','utf8'));
const fallback:Record<string,string>={germany:'#bc733e',japan:'#c7834e',italy:'#c39a6c',ussr:'#7599a2',usa:'#4f7f8c',uk:'#5e8c86',china:'#899f84','free-france':'#60949b','vichy-france':'#d1b48b',poland:'#8ca29e',finland:'#abaaa1',romania:'#b59a80',manchukuo:'#cfaa7e'};
const regions: [string,[number,number,number,number]][]=[['Europe',[-12,34,48,66]],['East Asia',[95,15,145,53]],['Southeast Asia',[95,-10,132,24]]];
function xy(p:Position,b:number[],x:number,y:number,w:number,h:number):[number,number]{
 const my=(l:number)=>Math.log(Math.tan(Math.PI/4+Math.max(-85,Math.min(85,l))*Math.PI/360));
 const spanX=(b[2]!-b[0]!)*Math.PI/180,spanY=my(b[3]!)-my(b[1]!);const scale=Math.min(w/spanX,h/spanY);
 return [x+(w-spanX*scale)/2+(p[0]!-b[0]!)*Math.PI/180*scale,y+(h-spanY*scale)/2+(my(b[3]!)-my(p[1]!))*scale];
}
function paths(fc:FeatureCollection,b:number[],x:number,y:number,w:number,h:number,kind:'land'|'control'){
 let svg='';for(const f of fc.features){const g=f.geometry as Polygon|MultiPolygon;if(!g||!['Polygon','MultiPolygon'].includes(g.type))continue;const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;let d='';for(const poly of polys)for(const ring of poly){if(!ring.length)continue;d+=ring.map((p,i)=>{const [u,v]=xy(p,b,x,y,w,h);return `${i?'L':'M'}${u.toFixed(2)},${v.toFixed(2)}`}).join('')+'Z'} const holder=String(f.properties?.holder);svg+=`<path d="${d}" fill="${kind==='land'?'#d5d0c4':colours[holder]??fallback[holder]??'#a5a395'}" fill-rule="evenodd" stroke="${kind==='land'?'#817e76':'#5a554e'}" stroke-width="${kind==='land'?'.45':'.7'}"/>`; }return svg;
}
function fc(data:any,k:any):FeatureCollection{return feature(data.topology,data.topology.objects[k.object]) as unknown as FeatureCollection}
function metrics(data:any){let max=0;const frames=data.keyframes.map((k:any)=>{const f=fc(data,k);let triangles=0,vertices=0,polygons=0;for(const v of f.features){const g=v.geometry as Polygon|MultiPolygon;for(const p of g.type==='Polygon'?[g.coordinates]:g.coordinates){polygons++;vertices+=p.reduce((s,r)=>s+r.length,0);const rings=p.map(r=>r.map(c=>new Vector2(c[0],c[1])));triangles+=ShapeUtils.triangulateShape(rings[0]!,rings.slice(1)).length;}}max=Math.max(max,triangles);return {date:k.t,features:f.features.length,polygons,vertices,triangles};});return {maxTriangles:max,arcs:data.topology.arcs.length,arcVertices:data.topology.arcs.reduce((s:number,a:any[])=>s+a.length,0),frames};}
const m={method:'CPU earcut of decoded full keyframe polygons; excludes tile subdivision, strokes, basemap and UI; not a live GPU measurement',before:{bytes:readFileSync(before).length,...metrics(old)},after:{bytes:readFileSync('src/content/topics/ww2/data/control.json').length,...metrics(current)}};
writeFileSync('scripts/geo/ww2/polish-metrics.json',JSON.stringify(m,null,2)+'\n');
let contact='';
for(let i=0;i<current.keyframes.length;i++){
 const k=current.keyframes[i];const name='K'+(i+1);
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="760"><rect width="1800" height="760" fill="#e9e4d8"/><style>text{font-family:Helvetica,Arial,sans-serif;fill:#2a2824}.title{font-size:24px;font-weight:600}.small{font-size:16px}</style><text x="24" y="35" class="title">${name} · ${k.t} · rebuilt map geometry · Mercator, equal scale on both axes</text>`;
 regions.forEach(([label,b],j)=>{const x=24+j*600,y=95;const clip=`${name}-${j}`;svg+=`<text x="${x}" y="${y-12}" class="title">${label}</text><defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="552" height="610"/></clipPath></defs><rect x="${x}" y="${y}" width="552" height="610" fill="#dce7e6" stroke="#8c867b"/><g clip-path="url(#${clip})">${paths(baselineLand,b,x,y,552,610,'land')}${paths(fc(current,k),b,x,y,552,610,'control')}</g>`;});
 svg+=`<text x="24" y="739" class="small">OFFLINE CPU RASTER · holder colours · NC-SA compatible sources · actual decoded TopoJSON</text></svg>`;
 await sharp(Buffer.from(svg)).png().toFile(`${dir}/${name}.png`);
 const thumb=await sharp(Buffer.from(svg)).resize(450,190).png().toBuffer();contact+=`<image x="${(i%4)*450}" y="${Math.floor(i/4)*190}" width="450" height="190" href="data:image/png;base64,${thumb.toString('base64')}"/>`;
}
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="570">${contact}</svg>`)).png().toFile(`${dir}/all-keyframes.png`);
const closeups:[number,string,number[]][]=[[5,'greece',[19,34,30,42]],[7,'east-front',[22,43,42,62]],[8,'east-front',[22,43,42,62]],[9,'europe',[8,43,36,60]],[10,'central-europe',[6,44,25,56]],[1,'china',[105,22,124,42]],[9,'china',[105,22,124,42]]];
for(const [i,label,b]of closeups){const k=current.keyframes[i];const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1000"><rect width="1200" height="1000" fill="#dce7e6"/>${paths(baselineLand,b,0,40,1200,960,'land')}${paths(fc(current,k),b,0,40,1200,960,'control')}<rect width="1200" height="40" fill="#e9e4d8"/><text x="15" y="28" font-family="Helvetica" font-size="24">K${i+1} · ${k.t} · ${label} · actual output, Mercator</text></svg>`;await sharp(Buffer.from(svg)).png().toFile(`${dir}/K${i+1}-${label}-detail.png`);}
console.log(JSON.stringify(m,null,2));
