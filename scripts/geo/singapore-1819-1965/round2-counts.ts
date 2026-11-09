/** Compare round-2 delivery with the committed round-1 asset snapshot. */
import{readFileSync,writeFileSync}from'node:fs';import{feature}from'topojson-client';import{ShapeUtils,Vector2}from'three';import{ringIssues}from'../lib/rings';
const d=import.meta.dirname,root=`${d}/../../..`;
function measure(coastPath:string,controlPath:string){
 const bytes=readFileSync(coastPath),ct=readFileSync(controlPath),coast=JSON.parse(bytes.toString()),control=JSON.parse(ct.toString());
 const fs:any=(feature(coast,coast.objects['land-sg-history'])as any).features;
 const polygons=(f:any):number[][][][]=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[];
 const triangles=Object.fromEntries(fs.filter((f:any)=>f.properties.kind==='land').map((f:any)=>[f.properties.id,polygons(f).reduce((n,p)=>n+ShapeUtils.triangulateShape(p[0]!.map(v=>new Vector2(v[0],v[1])),p.slice(1).map(r=>r.map(v=>new Vector2(v[0],v[1])))).length,0)]));
 return {coastBytes:bytes.length,controlBytes:ct.length,coastArcs:coast.arcs.length,controlArcs:control.topology.arcs.length,coastVertices:coast.arcs.reduce((s:number,a:any[])=>s+a.length,0),coastRings:ringIssues(fs.flatMap(polygons)),controlRings:ringIssues(Object.values(control.topology.objects).flatMap(o=>(feature(control.topology,o as any)as any).features.flatMap(polygons))),keyframes:control.keyframes.length,eras:fs.filter((f:any)=>f.properties.kind==='land').length,triangles};
}
const before=measure(`${d}/work/round2-before/land-sg-history.json`,`${d}/work/round2-before/control.json`),after=measure(`${root}/public/geo/land-sg-history.json`,`${root}/src/content/topics/singapore-1819-1965/data/control.json`);
const old=JSON.parse(readFileSync(`${d}/work/round2-water-before.json`,'utf8')),water=JSON.parse(readFileSync(`${d}/resume-jurong-east-verified-full-water.json`,'utf8'));
const report={date:'2026-11-09',before,after,jurongSourceWater:{before:old.counts,after:water.counts},triangleMethod:'CPU earcut on decoded land polygons, one coast era at a time; not runtime tiled GPU counts',chapters:12,teachingFacts:'unchanged; only S376 bilingual source-method threshold wording corrected'};
writeFileSync(`${d}/round2-counts.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
