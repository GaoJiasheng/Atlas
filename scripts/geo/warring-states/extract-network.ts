import{readFileSync}from'node:fs';import{readSvg}from'../lib/svg';import{candidates,evaluate}from'../lib/fit';import{writeJson,toFc,mapshaper}from'../lib/common';
const d='scripts/geo/warring-states';const m=JSON.parse(readFileSync(`${d}/sources.json`,'utf8'));const cps=m.svg.G3.controlPoints;
const best=candidates('auto',cps).map(c=>evaluate(c.proj,c.kind,cps)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!;
const doc=readSvg(readFileSync(`${d}/raw/G3-border-paths.svg`,'utf8'));
for(const s of doc.shapes)console.log(s.id,s.rings.map(r=>[r.length,r[0],r.at(-1)]));
const fc=toFc(doc.shapes.map(s=>({type:'Feature' as const,properties:{id:s.id},geometry:{type:'MultiLineString' as const,coordinates:s.rings.map(r=>r.map(([x,y])=>best.model.toLngLat(x,y)))}})));
writeJson(`${d}/work/G3-border-lines.geojson`,fc,true);
const landRaw=JSON.parse(readFileSync('public/geo/warring-states-region.json','utf8'));
const {feature:decode}=await import('topojson-client');
const land=landRaw.type==='Topology'?(decode(landRaw,Object.values(landRaw.objects)[0] as any) as any):landRaw;land.features=land.features.filter((f:any)=>f.properties.kind==='land');
const coast=await mapshaper('-i land.json -lines',{land});
const network=toFc([...fc.features,...coast.features]);
const polys=await mapshaper('-i in.json -proj +proj=merc -snap interval=1000 -polygons gap-tolerance=40000 -proj wgs84',{in:network});writeJson(`${d}/work/G3-network-polygons.geojson`,polys,true);console.log('polygons',polys.features.length);
const labels:Record<string,[number,number]>={qin:[149,185],jin:[225,145],yan:[336,70],qi:[339,133],lu:[334,171],zhou:[220,199],zheng:[253,213],wey:[272,166],cao:[292,190],song:[310,219],chen:[288.82,234.44],cai:[267.47,232.78],chu:[260,276],wu:[385,249]};
const {pointInPolygon}=await import('../lib/common');
const selected=[];const used=new Set<number>();
for(const [holder,p]of Object.entries(labels)){
 const pt=best.model.toLngLat(...p);const idx=polys.features.findIndex(f=>f.geometry?.type==='Polygon'?pointInPolygon(pt,(f.geometry as any).coordinates):f.geometry?.type==='MultiPolygon'&&(f.geometry as any).coordinates.some((pp:any)=>pointInPolygon(pt,pp)));
 console.log('holder',holder,idx,used.has(idx)?'SHARED':'');if(idx<0||used.has(idx))continue;used.add(idx);const f=polys.features[idx]!;selected.push({...f,properties:{class:holder}});
}
writeJson(`${d}/work/svg-G3-network.geojson`,toFc(selected),true);
