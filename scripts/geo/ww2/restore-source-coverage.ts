/** Restore only missing interiors from dated registered maps after multipart overlays.
 * No old output geometry, neighbour extrapolation, boxes or drawn borders are used.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {mapshaper,toFc} from '../lib/common';
import type {FeatureCollection} from 'geojson';
const manifest=JSON.parse(readFileSync('scripts/geo/ww2/sources.json','utf8'));
const states=JSON.parse(readFileSync('scripts/geo/ww2/raw/cshapes-2.0.geojson','utf8')) as FeatureCollection;
const log:any[]=[];
// The original partial rebuild omitted Sitia and shifted the Italian zone west.
// G38's period report independently locates Italian troops in Sitia/Palaiokastro.
const municipalities=JSON.parse(readFileSync('scripts/geo/ww2/raw/grc-adm3.geojson','utf8')) as FeatureCollection;
const sitia=toFc(municipalities.features.filter(f=>f.properties?.shapeName==='Sitia'));
if(sitia.features.length!==1)throw new Error('Expected one sourced Sitia municipal unit');
for(const id of ['K5','K6','K7','K8']){
 const k=manifest.keyframes.find((k:any)=>k.id===id);const day=Number(k.t.replaceAll('-',''));
 const greek=toFc(states.features.filter(f=>{const p=f.properties!;return p.gwcode===350&&p.gwsyear*10000+p.gwsmonth*100+p.gwsday<=day&&day<p.gweyear*10000+p.gwemonth*100+p.gweday;}));
 const area=await mapshaper('-i sitia.json greek.json combine-files -clip target=sitia greek',{sitia,greek});
 const path=`scripts/geo/ww2/work/${id}.geojson`;const current=JSON.parse(readFileSync(path,'utf8')) as FeatureCollection;
 const rest=await mapshaper('-i current.json area.json combine-files -erase target=current area',{current,area});
 current.features=[...rest.features,...area.features.map(f=>({...f,properties:{holder:'italy',label_en:'',label_zh:'',src:['G1','G35','G38'],note:'Sitia municipality; eastern-Crete occupation approximation, period location evidence OSS A-12634'}}))];
 writeFileSync(path,JSON.stringify(current)+'\n');log.push({frame:id,source:'G35/G38',newFeatures:area.features.length,method:'Sitia municipal unit clipped to dated CShapes Greece; period OSS location evidence. Explicit administrative approximation, not an invented wartime boundary.'});
}

for(const [id,map,ref] of [['K5','europe-1941-11','G12'],['K7','europe-1942-10','G13']]){
 const k=manifest.keyframes.find((k:any)=>k.id===id);const day=Number(k.t.replaceAll('-',''));
 const europe=toFc(states.features.filter(f=>{const p=f.properties!;const start=p.gwsyear*10000+p.gwsmonth*100+p.gwsday,end=p.gweyear*10000+p.gwemonth*100+p.gweday;return [290,345,365].includes(p.gwcode)&&start<=day&&day<end;}));
 const bounds=await mapshaper('-i europe.json -dissolve2',{europe});
 const source=JSON.parse(readFileSync(`scripts/geo/ww2/work/svg-${map}.geojson`,'utf8')) as FeatureCollection;
 const path=`scripts/geo/ww2/work/${id}.geojson`;const current=JSON.parse(readFileSync(path,'utf8')) as FeatureCollection;
 const refs=[...new Set(['G1',ref,...current.features.flatMap(f=>f.properties?.src??[])])];
 let count=0;
 for(const [classes,holder]of [[['axis','axis-occupied'],'germany'],[['allied'],'ussr']] as [string[],string][]){
  // Union the existing coverage first: the repair cannot overwrite any dated holder.
  const coverage=await mapshaper('-i current.json -dissolve2',{current});
  const paint=await mapshaper('-i selected.json -dissolve2',{selected:toFc(source.features.filter(f=>classes.includes(f.properties?.class)))});
  const bounded=await mapshaper('-i paint.json bounds.json combine-files -clip target=paint bounds',{paint,bounds});
  const missing=await mapshaper('-i bounded.json coverage.json combine-files -erase target=bounded coverage',{bounded,coverage});
  const parts=missing.features.filter(f=>f.geometry).map(f=>({...f,properties:{holder,label_en:'',label_zh:'',src:refs,note:`${ref} dated registered source coverage, restricted to previously unpainted interiors`}}));
  count+=parts.length;current.features.push(...parts);
 }
 const repaired=await mapshaper("-i current.json -dissolve2 holder,label_en,label_zh calc='src=collect(src)' -filter-slivers min-area=5km2",{current});
 for(const f of repaired.features){const raw=f.properties?.src;const flattened=(Array.isArray(raw)?raw:[raw]).flat(3);f.properties!.src=[...new Set(flattened.flatMap((v:any)=>String(v??'').split(',')).filter(Boolean))].sort((a,b)=>Number(a.slice(1))-Number(b.slice(1)));}
 writeFileSync(path,JSON.stringify(repaired)+'\n');log.push({frame:id,source:ref,newFeatures:count,method:'Registered monthly-map class intersect dated CShapes Poland/Yugoslavia/USSR, minus all existing composed coverage. Existing holders never overwritten.'});
}
writeFileSync('scripts/geo/ww2/work/source-coverage-repair.json',JSON.stringify(log,null,2)+'\n');console.log(JSON.stringify(log));
