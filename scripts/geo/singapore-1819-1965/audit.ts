/** Read-only final data/hold/copy/coast audit. No application tests or build. */
import{resolve}from'node:path';import{readFileSync}from'node:fs';import{feature}from'topojson-client';import{readJson,toFc,mapshaper,areaFeatures,writeJson}from'../lib/common';import{ringIssues}from'../lib/rings';
const dir=resolve(import.meta.dirname),root=resolve(dir,'../../..'),data=`${root}/src/content/topics/singapore-1819-1965/data`;
const control=readJson<any>(`${data}/control.json`),coast=readJson<any>(`${root}/public/geo/land-sg-history.json`),manifest=readJson<any>(`${dir}/sources.json`);
const frames=manifest.keyframes.map((k:any)=>({...k,features:(feature(control.topology,control.topology.objects[k.id])as any).features}));
const holdChecks=frames.filter((k:any)=>k.hold).map((k:any)=>({id:k.id,previous:k.hold,exact:JSON.stringify(control.topology.objects[k.id].geometries)===JSON.stringify(control.topology.objects[k.hold].geometries)}));if(holdChecks.some((k:any)=>!k.exact))throw Error('Hold geometry/labels differ');
const copies:any={};for(const file of['events','movements']){const published=readJson<any[]>(`${data}/${file}.json`),original=readJson<any[]>(`${root}/src/content/topics/ww2/data/${file}.json`);const matches=published.filter(x=>original.some(o=>o.id===x.id));const errors=matches.filter(x=>JSON.stringify(x)!==JSON.stringify(original.find(o=>o.id===x.id))).map(x=>x.id);if(errors.length)throw Error('WW2 copies changed: '+errors);copies[file]=matches.length;}
const areas=frames.flatMap((k:any)=>k.features).flatMap((f:any)=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates),rings=ringIssues(areas);if(rings.zeroArea||rings.selfCrossing)throw Error('Invalid control rings');
function km2(fc:any){const r=(p:number[][])=>{let a=0;for(let i=1;i<p.length;i++)a+=p[i-1]![0]!*p[i]![1]!-p[i]![0]!*p[i-1]![1]!;return Math.abs(a/2)*111.195**2*Math.cos(1.35*Math.PI/180);};return areaFeatures(fc).flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).reduce((a,p)=>a+r(p[0]as number[][])-p.slice(1).reduce((a,p)=>a+r(p as number[][]),0),0);}
function outwardDistance(outside:any,era:any){
 const cell=.002,grid=new Map<string,number[][]>();
 for(const f of areaFeatures(era))for(const p of f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates)for(const r of p)for(let i=1;i<r.length;i++){const a=r[i-1]!,b=r[i]!,seg=[a[0]!,a[1]!,b[0]!,b[1]!];for(let x=Math.floor(Math.min(a[0]!,b[0]!)/cell);x<=Math.floor(Math.max(a[0]!,b[0]!)/cell);x++)for(let y=Math.floor(Math.min(a[1]!,b[1]!)/cell);y<=Math.floor(Math.max(a[1]!,b[1]!)/cell);y++){const key=x+','+y;if(!grid.has(key))grid.set(key,[]);grid.get(key)!.push(seg);}}
 let max=0;const check=(px:number,py:number)=>{const cx=Math.floor(px/cell),cy=Math.floor(py/cell),kx=111195*Math.cos(py*Math.PI/180);let best=Infinity;for(let x=cx-1;x<=cx+1;x++)for(let y=cy-1;y<=cy+1;y++)for(const s of grid.get(x+','+y)??[]){const ax=(s[0]!-px)*kx,ay=(s[1]!-py)*111195,bx=(s[2]!-px)*kx,by=(s[3]!-py)*111195,dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,u=l?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/l)):0;best=Math.min(best,Math.hypot(ax+u*dx,ay+u*dy));}if(!Number.isFinite(best))throw Error('Outside geometry farther than indexed era coast');max=Math.max(max,best);};
 for(const f of areaFeatures(outside))for(const p of f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates)for(const r of p)for(let i=1;i<r.length;i++){check(r[i]![0]!,r[i]![1]!);check((r[i-1]![0]!+r[i]![0]!)/2,(r[i-1]![1]!+r[i]![1]!)/2);}return max;
}
// Geographic erase can report coincident water holes as outside land. Verify
// actual published edge samples with an independent odd-even membership test.
function inRing(p:number[],ring:number[][]){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i]!,b=ring[j]!;if((a[1]!>p[1]!)!==(b[1]!>p[1]!)&&p[0]!<(b[0]!-a[0]!)*(p[1]!-a[1]!)/(b[1]!-a[1]!)+a[0]!)inside=!inside;}return inside;}
function onLand(p:number[],fc:any){return areaFeatures(fc).some(f=>(f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).some(poly=>inRing(p,poly[0]as number[][])&&!poly.slice(1).some(r=>inRing(p,r as number[][]))));}
const clipping=[];for(const k of frames){
 const era=readJson<any>(`${dir}/work/coast-${k.era}.geojson`),local=toFc(k.features.filter((f:any)=>f.properties.src.includes('G30')||f.properties.src.includes('G1')));
 const points:number[][]=[];
 for(const f of areaFeatures(local))for(const poly of f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates)for(const ring of poly)for(let i=1;i<ring.length;i++){
  const a=ring[i-1]!,b=ring[i]!;for(const p of [b,[(a[0]!+b[0]!)/2,(a[1]!+b[1]!)/2]])if(!onLand(p,era))points.push(p);
 }
 // Reuse indexed point-to-edge distance on degenerate diagnostic segments;
 // these are not written as geographic output.
 const sampleFc=toFc(points.map(p=>({type:'Feature' as const,properties:{},geometry:{type:'Polygon' as const,coordinates:[[p,p,p,p]]}})));
 const maxOutwardM=outwardDistance(sampleFc,era);
 const outside=await mapshaper('-i a.json b.json combine-files -proj +proj=eqc +lat_ts=1.35 +lon_0=104 -erase target=a b -proj wgs84',{a:local,b:era});
 clipping.push({id:k.id,era:k.era,localFeatures:local.features.length,booleanOutsideKm2:km2(outside),outsideEdgeSamples:points.length,maxOutwardM,within5m:maxOutwardM<=5});
}
const coastFeatures=(feature(coast,coast.objects['land-sg-history'])as any).features;
const badProps=frames.flatMap((k:any)=>k.features).filter((f:any)=>!f.properties?.holder||!f.properties.label?.en||!f.properties.label?.zh||!f.properties.src?.length);if(badProps.length)throw Error('Missing feature provenance');
const counts={eras:coastFeatures.filter((f:any)=>f.properties.kind==='land').length,keyframes:frames.length,controlFeatures:frames.reduce((a:number,k:any)=>a+k.features.length,0),entities:readJson<any[]>(`${data}/entities.json`).length,events:readJson<any[]>(`${data}/events.json`).length,routes:readJson<any[]>(`${data}/movements.json`).length,sources:readJson<any>(`${data}/sources.json`).sources.length,glossaryTerms:readJson<any>(`${data}/glossary.json`).terms.length};
const result={counts,bytes:{control:Buffer.byteLength(readFileSync(`${data}/control.json`)),coast:Buffer.byteLength(readFileSync(`${root}/public/geo/land-sg-history.json`))},rings,holdChecks,unchangedWW2:copies,coastFeatureKinds:coastFeatures.map((f:any)=>f.properties.kind),singaporeClipping:clipping,clippingNote:'Independent odd-even membership and indexed edge distances on published vertices/midpoints. Boolean outside areas are diagnostic only: coincident water boundaries can produce erase artifacts. Numeric geometry is separate from rejected historical accuracy/coverage gates.'};writeJson(`${dir}/final-audit.json`,result,true);console.log(JSON.stringify(result));if(clipping.some(k=>!k.within5m))process.exitCode=1;
