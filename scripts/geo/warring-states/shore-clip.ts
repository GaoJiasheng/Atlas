/** Exact clipping to the real NE shoreline, without shared buffer-gap ownership.
 * The generic coast gap-fill erases K10 Qin in this data; this topic-specific
 * post-step uses intersection only and records retention of every holder.
 */
import{readFileSync}from'node:fs';import{feature}from'topojson-client';import{mapshaper,mapshaperApi,toFc,writeJson}from'../lib/common';
const dir='scripts/geo/warring-states',path='src/content/topics/warring-states/data/control.json';
const c=JSON.parse(readFileSync(`${dir}/work/control-nocoast.json`,'utf8')),rt=JSON.parse(readFileSync('public/geo/warring-states-region.json','utf8'));
const land=toFc((feature(rt,Object.values(rt.objects)[0]as any)as any).features.filter((f:any)=>f.properties.kind==='land'));
const files:Record<string,any>={},retention=[];
for(const k of c.keyframes){const raw=(feature(c.topology,c.topology.objects[k.object])as any);for(const f of raw.features){const p=f.properties;f.properties={holder:p.holder,label_en:p.label?.en??'',label_zh:p.label?.zh??'',src:(p.src??[]).join(',')};}
 const cut=await mapshaper('-i a.json land.json combine-files -clip target=a land -clean',{a:raw,land});
 const before=[...new Set(raw.features.map((f:any)=>f.properties.holder))],after=[...new Set(cut.features.map((f:any)=>f.properties.holder))];const lost=before.filter(h=>!after.includes(h));if(lost.length)throw new Error(`${k.object}: shoreline clipping lost ${lost}`);
 retention.push({id:k.object,before,after,lost});files[`${k.object}.json`]=cut;
}
const ids=c.keyframes.map((k:any)=>k.object),out=await mapshaperApi().applyCommands(`-i ${ids.map((id:string)=>id+'.json').join(' ')} combine-files -clean target=* -o out.json format=topojson quantization=400000 target=*`,files);
const topo=JSON.parse(out['out.json']!.toString());for(const o of Object.values(topo.objects)as any[])for(const g of o.geometries){const p=g.properties;g.properties={holder:p.holder,label:{en:p.label_en,zh:p.label_zh},src:[...new Set(String(p.src??'').split(',').filter(Boolean))],certainty:'approximate'};}
writeJson(path,{topology:topo,keyframes:c.keyframes});writeJson(`${dir}/shoreline-audit.json`,{method:'Intersection with Natural Earth10m land after shared simplification; no buffer or invented gap fill',retention},true);
console.log('Shore clipping retained all holders in',ids.length,'frames');
