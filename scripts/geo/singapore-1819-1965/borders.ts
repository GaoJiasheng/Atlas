/** Published-map border traces. This is a topic recipe, using the shared fit and overlay code.
 * Run: pnpm tsx scripts/geo/singapore-1819-1965/borders.ts
 * Native-pixel vertices are documented in border-traces.json; offshore closures are selection
 * devices and are erased by intersection with Natural Earth land, never territorial edges.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { FeatureCollection, Feature, Polygon } from 'geojson';
import { candidates, evaluate, type FitReport, type Model } from '../lib/fit';
import { mapshaper, mapshaperApi, readJson, writeJson, toFc } from '../lib/common';
import type { ControlPoint } from '../lib/manifest';
import { ringIssues, type RingIssues } from '../lib/rings';

type Pt = [number, number];
interface MapSpec { file: string; georef: string; nativeToGeoref: number; source: string; license: string }
interface Trace { map: string; nativePixel: Pt[]; closeLngLat: Pt[]; note: string }
interface Spec { maps: Record<string, MapSpec>; traces: Record<string, Trace> }
interface Georef { projection: string; controlPoints: ControlPoint[] }
const dir = resolve(import.meta.dirname);
const spec = readJson<Spec>(`${dir}/border-traces.json`);
const models = new Map<string, Model>();
const fits: Record<string, FitReport> = {};
const hashes: Record<string, string> = {};
for (const [id, m] of Object.entries(spec.maps)) {
  const g = readJson<Georef>(`${dir}/${m.georef}`);
  const tried = candidates(g.projection, g.controlPoints).map(c => evaluate(c.proj, c.kind, g.controlPoints));
  tried.sort((a,b) => a.report.looRmsKm-b.report.looRmsKm);
  const best = tried[0]; if (!best) throw new Error(`${id}: no fit`);
  models.set(id, best.model); fits[id] = best.report;
  hashes[m.file] = createHash('sha256').update(readFileSync(`${dir}/${m.file}`)).digest('hex');
}
const masks: Record<string, FeatureCollection> = {};
for (const [id, trace] of Object.entries(spec.traces)) {
 const model = models.get(trace.map); const m = spec.maps[trace.map];
 if (!model || !m) throw new Error(`${id}: missing map`);
 const ring: Pt[] = trace.nativePixel.map(p=>model.toLngLat(p[0]*m.nativeToGeoref,p[1]*m.nativeToGeoref));
 ring.push(...trace.closeLngLat,ring[0]!);
 masks[id]=toFc([{ type:'Feature', properties:{source:m.source,method:trace.note,certainty:'approximate'}, geometry:{type:'Polygon',coordinates:[ring]} } satisfies Feature<Polygon>]);
 writeJson(`${dir}/work/border-mask-${id}.geojson`,masks[id]);
}
const ne = readJson<FeatureCollection>(`${dir}/raw/ne_10m_admin_1_states_provinces.geojson`);
const a1 = (names:string[])=>toFc(ne.features.filter(f=>f.properties?.admin==='Malaysia' && names.includes(String(f.properties?.name))));
const union = async (fc:FeatureCollection)=>mapshaper('-i a.json -dissolve',{a:fc});
const cut = async (a:FeatureCollection,b:FeatureCollection)=>mapshaper('-i a.json -i b.json -clip source=b target=a -dissolve target=a',{a,b});
const erase = async (a:FeatureCollection,b:FeatureCollection)=>mapshaper('-i a.json -i b.json -erase source=b target=a -dissolve target=a',{a,b});
const fmsNames=['Perak','Selangor','Kuala Lumpur','Putrajaya','Negeri Sembilan','Pahang'];
const peninsulaNames=[...fmsNames,'Pulau Pinang','Melaka','Johor','Kedah','Perlis','Kelantan','Terengganu'];
const peninsula=await union(a1(peninsulaNames));
const south=await union(a1(['Melaka','Pulau Pinang']));
const aboveJohor=await cut(peninsula,masks['johor-north-1898']!);
const johor=await erase(await erase(peninsula,aboveJohor),south);
const fms=await erase(await cut(aboveJohor,masks['fms-northern-1898']!),south);
const landFile=resolve(dir,'../../../public/geo/land-10m-sea.json');
const landResult=await mapshaperApi().applyCommands('-i land.json -filter "kind===\'land\'" -o out.json format=geojson',{'land.json':readJson<unknown>(landFile)});
const actualLand=toFc(Object.values(landResult).flatMap(output => (JSON.parse(output.toString()) as FeatureCollection).features??[]).filter(f=>f.geometry.type==='Polygon'||f.geometry.type==='MultiPolygon'));
if (!actualLand.features.length) throw new Error('No Natural Earth 10m land layer');
// G23 explicitly names the Sembilan group south of Pangkor; its small islands are
// selected as complete Natural Earth polygon components, never clipped by a box.
const islandParts: Feature<Polygon>[] = [];
for (const f of actualLand.features) {
 if (f.geometry.type!=='Polygon' && f.geometry.type!=='MultiPolygon') continue;
 for (const poly of f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates) {
  const ring=poly[0]; if (!ring?.length) continue;
  const xs=ring.map(p=>p[0]!), ys=ring.map(p=>p[1]!);
  if (Math.min(...xs)>100.45 && Math.max(...xs)<100.7 && Math.min(...ys)>3.8 && Math.max(...ys)<4.05)
   islandParts.push({type:'Feature',properties:{source:'G23 Sembilan names; Natural Earth 10m component'},geometry:{type:'Polygon',coordinates:poly}});
 }
}
const dindings=await union(toFc([...(await cut(actualLand,masks.dindings!)).features,...islandParts,...masks.pangkor!.features,...masks['pangkor-laut']!.features]));
const historicalFms=await erase(fms,dindings);
const kelantan=await cut(actualLand,masks['kelantan-1898']!);
const thai=toFc(readJson<FeatureCollection>(`${dir}/raw/ne_10m_admin_0_countries.geojson`).features.filter(f=>f.properties?.ADMIN==='Thailand'));
const outputs:Record<string,FeatureCollection>={
 dindings,
 'fms-1896': historicalFms,
 'fms-before-1935': await erase(await union(a1(fmsNames)),dindings),
 'johor-1896': johor,
 'kedah-1896': await erase(a1(['Kedah']),fms),
 'kelantan-1896': kelantan,
 'terengganu-1896':await erase(await erase(await erase(await union(a1(['Kelantan','Terengganu','Pahang'])),fms),kelantan),johor),
 'reman-1896':await erase(a1(['Perak']),fms),
 'siam-1896':await erase(await union(toFc([...thai.features,...(await erase(a1(['Perak']),fms)).features])),kelantan),
};
if (masks['lawas-before-1905']) {
 const lawas = await cut(a1(['Sarawak']),masks['lawas-before-1905']);
 outputs['lawas-before-1905']=lawas;
 outputs['sarawak-1896']=await erase(a1(['Sarawak']),lawas);
}
const areas:Record<string,number>={};
const rings:Record<string,RingIssues>={};
for (const [id, fc] of Object.entries(outputs)) {
 const measured=await mapshaper('-i a.json -each "_areaKm2=$.area/1000000"',{a:fc});
 areas[id]=measured.features.reduce((sum,f)=>sum+Number(f.properties?._areaKm2??0),0);
 rings[id]=ringIssues(fc.features.flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[]));
 writeJson(`${dir}/work/border-${id}.geojson`,fc);
}
for (const file of ['raw/ne_10m_admin_1_states_provinces.geojson','raw/ne_10m_admin_0_countries.geojson'])
 hashes[file]=createHash('sha256').update(readFileSync(`${dir}/${file}`)).digest('hex');
hashes['public/geo/land-10m-sea.json']=createHash('sha256').update(readFileSync(landFile)).digest('hex');
writeJson(`${dir}/border-audit.json`,{method:'Source-native pixel tracing and shared fit.ts projection:auto; Natural Earth land clipping. No bbox territory.',fits,hashes,areas,rings},true);
console.log(JSON.stringify({areas,fits:Object.fromEntries(Object.entries(fits).map(([id,r])=>[id,{model:r.model,rmsKm:r.rmsKm,maxKm:r.maxKm,looRmsKm:r.looRmsKm,looMaxKm:r.looMaxKm}]))},null,2));
