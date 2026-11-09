/** Before/after delivery measurements, no runtime assets or dependencies. */
import{readFileSync,writeFileSync}from'node:fs';import{feature}from'topojson-client';import{ShapeUtils,Vector2}from'three';import{ringIssues}from'../lib/rings';
const d=import.meta.dirname,root=`${d}/../../..`;
function measure(cp:string,tp:string){
 const cb=readFileSync(cp),tb=readFileSync(tp),c=JSON.parse(cb.toString()),t=JSON.parse(tb.toString());
 const fs:any=(feature(c,c.objects['land-sg-history'])as any).features;
 const polys=(f:any):number[][][][]=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[];
 return{coastBytes:cb.length,controlBytes:tb.length,coastArcs:c.arcs.length,controlArcs:t.topology.arcs.length,coastVertices:c.arcs.reduce((n:number,a:any[])=>n+a.length,0),controlVertices:t.topology.arcs.reduce((n:number,a:any[])=>n+a.length,0),eras:fs.filter((f:any)=>f.properties.kind==='land').length,keyframes:t.keyframes.length,coastRings:ringIssues(fs.flatMap(polys)),controlRings:ringIssues(Object.values(t.topology.objects).flatMap(o=>(feature(t.topology,o as any)as any).features.flatMap(polys))),triangles:Object.fromEntries(fs.filter((f:any)=>f.properties.kind==='land').map((f:any)=>[f.properties.id,polys(f).reduce((n,p)=>n+ShapeUtils.triangulateShape(p[0]!.map(v=>new Vector2(v[0],v[1])),p.slice(1).map(r=>r.map(v=>new Vector2(v[0],v[1])))).length,0)]))};
}
const before=measure(`${d}/work/residual-before-land-sg-history.json`,`${d}/work/residual-before-control.json`),after=measure(`${root}/public/geo/land-sg-history.json`,`${root}/src/content/topics/singapore-1819-1965/data/control.json`);
const report={date:'2026-11-09',baseline:'Accepted live topic at start of residual pass; exact bytes retained in ignored work/residual-before-*.json',triangleMethod:'CPU earcut per decoded coast era; not runtime tiled/GPU statistics',before,after};
writeFileSync(`${d}/residual-counts.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
