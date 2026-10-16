/** Shared simplifier carries holder/label/src; add topic-specific certainty metadata. */
import{readFileSync}from'node:fs';import{writeJson}from'../lib/common';import{ringIssues}from'../lib/rings';import{feature}from'topojson-client';
const p='src/content/topics/warring-states/data/control.json',c=JSON.parse(readFileSync(p,'utf8'));let count=0;
for(const o of Object.values(c.topology.objects)as any[])for(const g of o.geometries){g.properties.certainty='approximate';count++;}
const fc={type:'FeatureCollection',features:Object.values(c.topology.objects).flatMap((o:any)=>(feature(c.topology,o)as any).features)}as any;const polygons=fc.features.flatMap((f:any)=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[]);const issues=ringIssues(polygons);if(issues.zeroArea||issues.selfCrossing)throw new Error('Invalid published map rings');
writeJson(p,c);writeJson('scripts/geo/warring-states/geometry-audit.json',{features:count,...issues},true);console.log('Certainty:',count,'features',JSON.stringify(issues));
