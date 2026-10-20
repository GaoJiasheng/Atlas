/** Budget adapter around unmodified shared local-land: quantise at an island-scale
 * 5k/10k grid rather than increasing DP into hundreds of metres. Every candidate
 * is cleaned after quantisation and checked for wedges before acceptance.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { feature } from 'topojson-client';
import { mapshaperApi, writeJson } from '../lib/common';
import { ringIssues } from '../lib/rings';
import { foldTopology } from '../lib/local-eras';
const dir=import.meta.dirname,config=`${dir}/sources.json`,file='public/geo/land-sg-modern.json';
const d=JSON.parse(readFileSync(config,'utf8'));const attempts:any[]=[];
for(const m of [40,50,60,70,80,90,100,120]){
 d.pipeline.localLand.simplifyM=m;writeFileSync(config,JSON.stringify(d,null,2)+'\n');
 const r=spawnSync('pnpm',['tsx','scripts/geo/lib/local-land.ts','--topic','singapore-land-use'],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);
 const source=JSON.parse(readFileSync(file,'utf8'));
 const gs=source.objects['land-sg-modern'].geometries;source.objects=Object.fromEntries(gs.map((g:any,i:number)=>[`part${i}`,{type:'GeometryCollection',geometries:[g]}]));
 for(const quant of [10000]){
  const first=await mapshaperApi().applyCommands(`-i in.json -rename-layers land-sg-modern -o q.json format=topojson quantization=${quant}`,{'in.json':source});
  const second=await mapshaperApi().applyCommands(`-i q.json -clean snap-interval=0.00001 target=* -rename-layers land-sg-modern -o out.json format=topojson quantization=${quant}`,{'q.json':JSON.parse(first['q.json']!.toString())});
  const parsed=JSON.parse(second['out.json']!.toString());const topo=foldTopology(parsed,Object.keys(parsed.objects),'land-sg-modern');
  const fc=feature(topo,topo.objects['land-sg-modern']) as any;
  if(fc.features.filter((f:any)=>f.properties.kind==='land').length!==8)throw Error('Packing lost a dated era');
  const polygons=fc.features.flatMap((f:any)=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[]);
  const rings=ringIssues(polygons);const text=JSON.stringify(topo);const bytes=Buffer.byteLength(text);attempts.push({dpM:m,quant,bytes,...rings});console.log('packed',attempts.at(-1));
  if(bytes<=250*1024&&!rings.zeroArea&&!rings.selfCrossing){
   writeFileSync(file,text);for(const f of fc.features.filter((f:any)=>f.properties.kind==='land'))writeJson(`${dir}/work/coast-${f.properties.id}.geojson`,{type:'FeatureCollection',features:[f]});
   writeJson(`${dir}/coast-packing.json`,{dpM:m,quant,gridM:topo.transform.scale.map((v:number)=>v*111195),bytes,gzip:gzipSync(text).length,rings,attempts},true);console.log('Raw budget met. Accuracy is separately assessed in SOURCES-GEO.');process.exit(0);
  }
 }
}
throw Error('No ring-safe coast file fits 250KiB.');
