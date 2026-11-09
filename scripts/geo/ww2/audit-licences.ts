/** Run after simplification. An incompatible input fails closed. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { manifest, traces, references, sourceByRef } from './provenance';
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
for (const d of Object.values(manifest.datasets) as any[]) {
  assert(!/\bBY-SA\b/.test(d.license), `Incompatible active source ${d.ref}: ${d.license}`);
  assert(/Public domain|CC0|CC BY 4\.0|CC BY-NC-SA 4\.0/.test(d.license), `Unreviewed licence: ${d.ref}`);
}
// OHM carries per-feature exceptions: check every exported relation, not just the set name.
for (const set of Object.keys(manifest.ohm)) {
  const path=`scripts/geo/ww2/raw/ohm-${set}.json`;
  assert(existsSync(path), `Missing original OHM response: ${set}`);
  const data=JSON.parse(readFileSync(path,'utf8'));
  for (const e of data.elements) if (e.tags?.license) assert(/^(CC0|public.?domain)/i.test(e.tags.license), `OHM exception: ${e.id}: ${e.tags.license}`);
}
for(const [id,map]of Object.entries(traces.maps) as [string,any][]){
 const fit=JSON.parse(readFileSync(`scripts/geo/ww2/work/lines-fit.json`,'utf8'))[id];
 assert(fit.maxKm<=map.maxResidualKm, `${id}: registration exceeds budget`);
}
for(const kind of ['svg','raster'])for(const [id,map]of Object.entries(manifest[kind]) as [string,any][]){
 const fit=JSON.parse(readFileSync(`scripts/geo/ww2/work/${kind}-${id}-fit.json`,'utf8'));
 assert(fit.maxKm<=map.maxResidualKm, `${id}: registration exceeds budget`);
}
const keyframes = manifest.keyframes.map((k: any) => {
  const refs=[...new Set<string>([...(k.base ? ['G1'] : []),...(k.evidence??[]),...k.steps.flatMap((st: any) => references({from:st.from,clip:st.clip,minus:st.minus})), 'G34'])];
  for(const r of refs) assert(sourceByRef[r], `Unknown source ${r}`);
  return {id:k.id,date:k.t,file:`work/${k.id}.geojson`,license:'CC BY-NC-SA 4.0',sources:refs.sort((a,b)=>Number(a.slice(1))-Number(b.slice(1))), steps:k.steps.map((st:any)=>({holder:st.holder,sources:references({from:st.from,clip:st.clip,minus:st.minus})}))};
});
const work='scripts/geo/ww2/work';
// Stale derivatives must not silently enter a future run.
const obsolete=['svg-china-1940','svg-europe-1942','svg-eastern-front-1942','svg-eastern-front-1943b','svg-eastern-front-1944','raster-eastern-front-1945','raster-europe-1943-1945'];
for(const f of readdirSync(work)) assert(!obsolete.some(p=>f===p+'.geojson'), `Remove obsolete incompatible derivative: ${f}`);
const artifacts: any[]=[];
for(const [id,d] of Object.entries(manifest.datasets) as [string,any][]) {
 const p=`scripts/geo/ww2/raw/${d.file}`;if(existsSync(p)) artifacts.push({file:`raw/${d.file}`,source:id,license:d.license,sha256:sha(p)});
}
for(const [id,m] of Object.entries(manifest.svg) as [string,any][]) artifacts.push({file:`work/svg-${id}.geojson`,sources:[manifest.datasets[m.dataset].ref],license:'CC BY-NC-SA 4.0 (Atlas adaptation; original source '+manifest.datasets[m.dataset].license+')'});
for(const [id,m] of Object.entries(manifest.raster) as [string,any][]) artifacts.push({file:`work/raster-${id}.geojson`,sources:[manifest.datasets[m.dataset].ref],license:'CC BY-NC-SA 4.0 (Atlas adaptation; original source '+manifest.datasets[m.dataset].license+')'});
for(const set of Object.keys(manifest.ohm)) artifacts.push({file:`work/ohm-${set}.geojson`,sources:['G2'],license:'CC0 1.0'});
artifacts.push({file:'work/lines-traces.geojson',sources:[...new Set(Object.values(traces.maps).map((m:any)=>manifest.datasets[m.dataset].ref))],license:'Public-domain sources; Atlas redigitisation CC BY-NC-SA 4.0'});
artifacts.push({file:'work/svg-lines.geojson',sources:[...new Set([...Object.values(traces.maps).map((m:any)=>manifest.datasets[m.dataset].ref),'G4'])],license:'Public-domain source adaptation; Atlas contribution CC BY-NC-SA 4.0'});
const control=JSON.parse(readFileSync('src/content/topics/ww2/data/control.json','utf8'));
const activeRefs=new Set(Object.keys(sourceByRef));
for(const obj of Object.values(control.topology.objects) as any[]) for(const g of obj.geometries) for(const r of g.properties?.src??[]) assert(activeRefs.has(r),`Obsolete ref ${r} in rebuilt control.json (run compose/simplify)`);
assert.deepEqual(control.keyframes.map((k:any)=>k.t),manifest.keyframes.map((k:any)=>k.t));
artifacts.push({file:'src/content/topics/ww2/data/control.json',license:'CC BY-NC-SA 4.0',sources:[...new Set(keyframes.flatMap((k:any)=>k.sources))],sha256:sha('src/content/topics/ww2/data/control.json')});
artifacts.push({file:'src/content/topics/ww2/data/movements.json',license:'CC BY-NC-SA 4.0 (public-domain map routes; no BY-SA input)',sources:['S22','S23','S24','S47','S60','S65','S66','S75','S76','S88','S91','G36','G37','S93','S116','S119','S121','S128','S129','S130','S133','S135','S145','S150','S151','S156','S157','S161','Natural Earth land-50m (public domain)'],sha256:sha('src/content/topics/ww2/data/movements.json')});
for(const k of keyframes)artifacts.push({...k,sha256:sha('scripts/geo/ww2/'+k.file)});
const postCompose=JSON.parse(readFileSync('scripts/geo/ww2/work/source-coverage-repair.json','utf8'));
const report={postCompose,date:'2026-11-09',rule:'No derivative file combines CC BY-SA with CC BY-NC-SA',sources:sourceByRef,keyframes,artifacts};
mkdirSync('src/content/topics/ww2/provenance',{recursive:true});
writeFileSync('src/content/topics/ww2/provenance/map-provenance.json',JSON.stringify(report,null,2)+'\n');
console.log(`WW2 licence audit passed: ${keyframes.length} frames, ${artifacts.length} artifacts; control and routes NC-SA; no active BY-SA geometry.`);
