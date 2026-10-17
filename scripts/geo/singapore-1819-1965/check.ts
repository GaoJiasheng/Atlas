/** Topic-local source/composed-map visual checks, using unchanged shared renderer.
 * The dated coast replaces Singapore in the check basemap on each frame. This
 * does not run the application build, shoot, tests or shared dist operations.
 */
import{readFileSync,writeFileSync}from'node:fs';import{resolve}from'node:path';import{spawnSync}from'node:child_process';import{feature}from'topojson-client';import{readJson,toFc,mapshaper}from'../lib/common';
const dir=resolve(import.meta.dirname), root=resolve(dir,'../../..');
const land=(name:string)=>{const d=readJson<any>(`${root}/public/geo/${name}.json`);return d.type==='Topology'?toFc(Object.values(d.objects).flatMap(o=>(feature(d,o as any)as any).features).filter((f:any)=>f.properties?.kind===undefined||f.properties.kind==='land')):d;};
// Match the engine's detailed Southeast Asian coastline at island zooms.
// A 50m-only comparison otherwise makes valid 10m Johor land appear over water.
const detailBox=toFc([{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[95,-9],[125,-9],[125,22],[95,22],[95,-9]]]}}]);
const broad=await mapshaper('-i a.json b.json combine-files -erase target=a b',{a:land('land-50m'),b:detailBox});
const detail=await mapshaper('-i a.json b.json combine-files -clip target=a b',{a:land('land-10m-sea'),b:detailBox});
const fc=toFc([...broad.features,...detail.features]);
const mask=readJson<any>(`${root}/public/geo/land-sg.json`);const masks=toFc(Object.values(mask.objects).flatMap(o=>(feature(mask,o as any)as any).features).filter((f:any)=>f.properties?.kind==='mask'));
const base=await mapshaper('-i a.json b.json combine-files -erase target=a b',{a:fc,b:masks});writeFileSync(`${dir}/work/check-land-base.geojson`,JSON.stringify(base));
let runner=readFileSync(`${root}/scripts/geo/lib/check.ts`,'utf8').replaceAll("from './","from '../../lib/");
const anchor="files.set('/kf.json', { body: JSON.stringify(data), type: MIME['.json']! });";
if(!runner.includes(anchor))throw Error('Shared check renderer contract changed');
runner=runner.replace(anchor,`const era=(kf as unknown as {era:string}).era;\n      const base=readJson<FeatureCollection>(topic.workFile('check-land-base.geojson'));\n      const coast=readJson<FeatureCollection>(topic.workFile('coast-'+era+'.geojson'));\n      files.set('/land.json',{body:JSON.stringify({type:'FeatureCollection',features:[...base.features,...coast.features]}),type:MIME['.json']!});\n      ${anchor}`);
runner=runner.replace("const fitPath = svgId ?","const fitPath = existsSync(topic.workFile('georef-'+ds.ref+'-fit.json')) ? topic.workFile('georef-'+ds.ref+'-fit.json') : svgId ?");
runner=runner.replaceAll('fit.rmsKm.toFixed(1)','fit.rmsKm.toFixed(3)').replaceAll('fit.maxKm.toFixed(1)','fit.maxKm.toFixed(3)');
const file=`${dir}/work/check-runner.ts`;writeFileSync(file,runner);
const result=spawnSync('pnpm',['tsx',file,'--topic','singapore-1819-1965',...process.argv.slice(2)],{stdio:'inherit'});process.exit(result.status??1);
