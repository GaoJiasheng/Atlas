/** Detect broad new holes, independently of holder/label checks. No geometry is copied. */
import {readFileSync,writeFileSync} from 'node:fs';
import {feature} from 'topojson-client';
import {pointInPolygon} from '../lib/common';
import type {FeatureCollection,Polygon,MultiPolygon,Position} from 'geojson';
const before=JSON.parse(readFileSync('/tmp/ww2-control-before.json','utf8'));
const after=JSON.parse(readFileSync('src/content/topics/ww2/data/control.json','utf8'));
const work=process.argv.includes('--work');
function prepare(fc:FeatureCollection){return fc.features.flatMap(f=>{const g=f.geometry as Polygon|MultiPolygon;return (g.type==='Polygon'?[g.coordinates]:g.coordinates).map(p=>({p,b:p[0]!.reduce((b,v)=>[Math.min(b[0]!,v[0]!),Math.min(b[1]!,v[1]!),Math.max(b[2]!,v[0]!),Math.max(b[3]!,v[1]!)],[180,90,-180,-90])}));});}
function contains(p:Position,shapes:ReturnType<typeof prepare>){return shapes.some(s=>p[0]!>=s.b[0]!&&p[0]!<=s.b[2]!&&p[1]!>=s.b[1]!&&p[1]!<=s.b[3]!&&pointInPolygon(p,s.p));}
const boxes=[[0,35,44,65],[100,20,140,50],[95,-8,130,22]];
const report=[];
for(const k of before.keyframes){const old=prepare(feature(before.topology,before.topology.objects[k.object]) as unknown as FeatureCollection);const current=prepare(work?JSON.parse(readFileSync(`scripts/geo/ww2/work/${k.object}.geojson`,'utf8')):feature(after.topology,after.topology.objects[k.object]) as unknown as FeatureCollection);const missing:number[][]=[];
 for(const [w,s,e,n]of boxes)for(let x=w!;x<=e!;x++)for(let y=s!;y<=n!;y++){
 const probes=[[x,y],[x-.2,y],[x+.2,y],[x,y-.2],[x,y+.2]];
 if(probes.every(p=>contains(p,old)&&!contains(p,current)))missing.push([x,y]);
 }
 report.push({frame:k.object,missingInteriorSamples:missing});
}
writeFileSync(`scripts/geo/ww2/work/coverage-${work?'work':'final'}.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.filter(r=>r.missingInteriorSamples.length),null,2));
if(!work&&report.some(r=>r.missingInteriorSamples.length))process.exitCode=1;
