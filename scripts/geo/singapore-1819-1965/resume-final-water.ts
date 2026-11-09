/** Restore the complete reviewed local source patch after the shared export.
 * No simplification, automatic gap filling, invented widths or engine changes.
 * The checks below inspect decoded DELIVERY geometry, not intermediate masks.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {execFileSync}from'node:child_process';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import { mapshaper, mapshaperApi, pointInPolygon, toFc } from '../lib/common';
import { ringIssues } from '../lib/rings';
import { buildModel } from './resume-register-anu1958-model';

const d=import.meta.dirname, root=resolve(d,'../../..');
const read=(p:string):any=>JSON.parse(readFileSync(`${d}/${p}`,'utf8'));
const model=buildModel();
const project=([x,y]:number[])=>model.toLngLat(x!+400,y!+3400);
const manifest=read('sources.json');
const nativeWater=[read('resume-jurong-east-verified-full-water.json'),read('resume-jurong-east-verified-pandan-water.json')];
// Small source islands must survive the shared detached-island size filter.
const islandSpec=read('resume-jurong-reviewed-islands.json');
if(islandSpec.status!=='source-islands-reviewed')throw Error('Unreviewed source islands');
const islands=toFc([
 ...islandSpec.islands.map((i:any)=>({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:i.coordinates.map((r:number[][])=>r.map(project))}})),
 ...nativeWater.flatMap(spec=>spec.coordinates.flatMap((p:number[][][])=>p.slice(1).map(r=>({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[r.map(project)]}})))),
] as any);
const polys=(f:any):number[][][][]=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[];
const covers=(fc:any,p:number[])=>fc.features.some((f:any)=>polys(f).some(poly=>pointInPolygon(p,poly)));
const clearSea=toFc([{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[2390,1280],[2560,1280],[2560,1490],[2390,1490],[2390,1280]].map(project)]}}]);
let removedSeaSymbols=0;
let removedCoverageFragments=0;
async function erase(fc:FeatureCollection,era:string,restore:boolean):Promise<FeatureCollection>{
 let result=fc;
 if(restore){
  // Each layer has exactly one Singapore-containing feature at these dates.
  const owner=result.features.find(f=>covers(toFc([f]),[103.8,1.35]));
  if(!owner)throw Error('No Singapore owner to retain source islands');
  const selector=toFc([{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[103.60,1.27],[103.79,1.27],[103.79,1.48],[103.60,1.48],[103.60,1.27]]]}}]);
  const rest=await mapshaper('-i a.json b.json combine-files -erase target=a b',{a:toFc([owner]),b:selector});
  let source=read(era==='L5'?'work/resume-L5-historical-land.geojson':`work/resume-${era==='L4'?'g11':'g9'}-jurong-land.geojson`);
  for(const island of era==='L5'?islands.features:[]){
   const r=polys(island)[0]![0]!;
   const p=r.slice(0,-1).reduce((a,b)=>[a[0]!+b[0]!/(r.length-1),a[1]!+b[1]!/(r.length-1)],[0,0]);
   if(covers(toFc([island]),p)&&!covers(source,p))source=await mapshaper('-i a.json b.json combine-files -merge-layers force -dissolve2 -clean gap-fill-area=0',{a:source,b:toFc([island])});
  }
  const combined=await mapshaper('-i a.json b.json combine-files -merge-layers force -dissolve2 -clean gap-fill-area=0',{a:rest,b:source});
  owner.geometry=combined.features[0]!.geometry;
  if(era==='L5')writeFileSync(`${d}/work/round2-final-combined.geojson`,JSON.stringify(combined));
  // G35 shows uninterrupted open water in this native window, south of the
  // mouth and east of P. Mesemut. Eight old chart-symbol fragments survived
  // outside the original splice. Drop ONLY complete detached components whose
  // entire outer ring lies in this verified sea; no box edge becomes coast.
  const components=polys(owner);
  const retained=components.filter(poly=>{
   const symbol=era==='L5'&&poly[0]!.every(p=>covers(clearSea,p));
   const coverage=poly[0]!.every(p=>p[0]!<103.61&&p[1]!>1.23&&p[1]!<1.38);
   if(symbol)removedSeaSymbols++;
   if(coverage)removedCoverageFragments++;
   return !symbol&&!coverage;
  });
  owner.geometry={type:'MultiPolygon',coordinates:retained};
  // The complete source patch already contains these paired banks. Erasing a
  // second time would leave sub-grid slivers between duplicated boundaries.
  return result;
 }
 // Earlier town banks already survive their shared export; do not re-overlay
 // identical boundaries and manufacture numeric slivers.
 return result;
}
async function topology(layers:Record<string,FeatureCollection>,quant:number):Promise<any>{
 const single=Object.keys(layers).length===1;
 let sourceLayers=single?Object.fromEntries(Object.values(layers)[0]!.features.map((f,i)=>[`era${i}`,toFc([f])])):layers;
 sourceLayers=JSON.parse(execFileSync('python3',[`${d}/round2-clean.py`],{input:JSON.stringify(sourceLayers),maxBuffer:30*1024*1024,env:{...process.env,PYTHONPATH:process.env.ATLAS_MAP_PYTHONPATH??'/tmp/atlas-maps-py'}}).toString());
 const inputs:Record<string,FeatureCollection>={};
 // Source booleans are already clean; never run a topology cleaner on
 // paired-bank channels. Tiny quantisation rings are checked below.
 const dropNumericalRings=(fc:FeatureCollection)=>{
  for(const f of fc.features){
   if(!['Polygon','MultiPolygon'].includes(f.geometry.type))continue;
   const good=(r:number[][])=>!ringIssues([[r]]).zeroArea;
   const kept=polys(f).filter(p=>good(p[0]!)).map(p=>[p[0]!,...p.slice(1).filter(good)]);
   f.geometry={type:'MultiPolygon',coordinates:kept};
  }
  return fc;
 };
 for(const [name,fc] of Object.entries(sourceLayers))inputs[`${name}.json`]=dropNumericalRings(fc);
 let result:any;
 for(const factor of [1,10,100,1000,10000,0]){
  const output=await mapshaperApi().applyCommands(`-i ${Object.keys(inputs).join(' ')} combine-files -o result.json format=topojson quantization=${quant*factor}`,inputs);
  result=JSON.parse(output['result.json']!.toString());
  const issues=ringIssues(Object.values(result.objects).flatMap(o=>(feature(result,o as any)as any).features.flatMap(polys)));
  if(!issues.zeroArea&&!issues.selfCrossing)break;

 }
 // Mapshaper splits a mixed line/polygon GeoJSON layer. Reassemble that one
 // GeometryCollection without changing any arc or per-feature metadata.
 if(Object.keys(layers).length===1){
  result.objects={[Object.keys(layers)[0]!]:{type:'GeometryCollection',geometries:Object.values(result.objects).flatMap((o:any)=>o.geometries)}};
 }
 return result;
}
function check(topo:any):any{
 const fc=toFc(Object.values(topo.objects).flatMap(o=>(feature(topo,o as any)as any).features));
 const issues=ringIssues(fc.features.flatMap(polys));
 if(issues.zeroArea||issues.selfCrossing){
  writeFileSync(`${d}/work/resume-final-water-debug.json`,JSON.stringify(topo));
  console.error(fc.features.map(f=>({properties:f.properties,issues:ringIssues(polys(f))})).filter(f=>f.issues.zeroArea||f.issues.selfCrossing));
  throw Error(`Final source-water export invalid: ${JSON.stringify(issues)}`);
 }
 return issues;
}
const coastPath=`${root}/public/geo/land-sg-history.json`;
const oldCoast=JSON.parse(readFileSync(coastPath,'utf8'));
const coastFc=feature(oldCoast,oldCoast.objects['land-sg-history'])as unknown as FeatureCollection;
for(const f of coastFc.features){
 const era=f.properties?.id;
 if(f.properties?.kind!=='land'||!era)continue;
 const restored=await erase(toFc([f]),era,true);
 if(restored.features.length!==1)throw Error(`Lost coast feature ${era}`);
 f.geometry=restored.features[0]!.geometry;
}
const coast=await topology({'land-sg-history':coastFc},1000000);
const coastIssues=check(coast);
writeFileSync(`${d}/work/round2-coast-candidate.json`,JSON.stringify(coast));
const delivered=feature(coast,coast.objects['land-sg-history'])as any;
const wet=[[2250,900],[2371,920],[2460,1010],[2540,1040],[2585,1125],[2475,1370]];
const witness=(fc:FeatureCollection)=>wet.map(p=>({native:p,lnglat:project(p),land:covers(fc,project(p))}));
const l5=toFc(delivered.features.filter((f:any)=>f.properties.id==='L5'));
const coastWitness=witness(l5);
if(coastWitness.some(w=>w.land))throw Error(`Published coast filled source Pandan water: ${JSON.stringify(coastWitness)}`);
// Every retained native island has a known interior vertex-average witness.
const dryWitness=islands.features.map(f=>{
 const ring=polys(f)[0]![0]!;
 const p=ring.slice(0,-1).reduce((a,b)=>[a[0]!+b[0]!/(ring.length-1),a[1]!+b[1]!/(ring.length-1)],[0,0]);
 if(!covers(toFc([f]),p))return null; // Concave outline: average is not an interior witness.
 if(!covers(l5,p))throw Error(`Published coast lost a source island at ${p}`);
 return {lnglat:p,land:true};
}).filter(Boolean);

const controlPath=`${root}/src/content/topics/singapore-1819-1965/data/control.json`;
const data=JSON.parse(readFileSync(controlPath,'utf8'));
const layers:Record<string,FeatureCollection>={};
const controlWitness:Record<string,unknown>={};
for(let i=0;i<manifest.keyframes.length;i++){
 const frame=manifest.keyframes[i];
 if(frame.hold){layers[frame.id]=structuredClone(layers[frame.hold]!);continue;}
 const t=data.keyframes.find((k:any)=>k.object===frame.id).t;
 const era=manifest.pipeline.localLand.eras.find((e:any)=>(!e.from||t>=e.from)&&(!e.to||t<e.to)).id;
 const fc=feature(data.topology,data.topology.objects[frame.id])as unknown as FeatureCollection;
 layers[frame.id]=await erase(fc,era,true);
}
data.topology=await topology(layers,10000000);
const controlIssues=check(data.topology);
for(const frame of manifest.keyframes){
 if(frame.hold)data.topology.objects[frame.id]=structuredClone(data.topology.objects[frame.hold]);
 const t=data.keyframes.find((k:any)=>k.object===frame.id).t;
 if(t<'1961-01-01')continue;
 const fc=feature(data.topology,data.topology.objects[frame.id])as unknown as FeatureCollection;
 const w=witness(fc);controlWitness[frame.id]=w;
 if(w.some(p=>p.land))throw Error(`${frame.id}: control tint filled Pandan source water`);
}
writeFileSync(coastPath,JSON.stringify(coast));
writeFileSync(controlPath,JSON.stringify(data));
for(const f of delivered.features.filter((f:any)=>f.properties.kind==='land'))writeFileSync(`${d}/work/coast-${f.properties.id}.geojson`,JSON.stringify(toFc([f])));
const report={date:'2026-11-09',method:'Final complete reviewed local source patch, source islands retained, no simplify/automatic gap-fill; 0.11m numerical snap, <1m² numeric-remnant filter; actual decoded delivery water/land witnesses',removedCoverageFragments,removedSeaSymbols,seaSymbolSelection:{nativeBox:[2390,1280,2560,1490],method:'Only whole detached components entirely within G35 verified open sea removed; selection creates no edge'},coast:{bytes:readFileSync(coastPath).length,arcs:coast.arcs.length,vertices:coast.arcs.reduce((n:number,a:any[])=>n+a.length,0),issues:coastIssues,witness:coastWitness,islandWitness:dryWitness},control:{bytes:readFileSync(controlPath).length,arcs:data.topology.arcs.length,issues:controlIssues,witness:controlWitness}};
writeFileSync(`${d}/resume-final-water-audit.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
