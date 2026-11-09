/** Independent source wet/dry witnesses on actual coast and control delivery. */
import{readFileSync,writeFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{feature}from'topojson-client';
import{pointInPolygon}from'../lib/common';
import{tps}from'./round2-tps';
import{buildG16Model}from'./resume-register-G16-model';
const d=import.meta.dirname,root=`${d}/../../..`,read=(f:string)=>JSON.parse(readFileSync(f,'utf8'));
const coast=read(`${root}/public/geo/land-sg-history.json`),control=read(`${root}/src/content/topics/singapore-1819-1965/data/control.json`);
const coastFeatures:any=(feature(coast,coast.objects['land-sg-history'])as any).features;
const reports=read(`${d}/round2-registration.json`).reports;
const covers=(features:any[],p:number[])=>features.some(f=>(f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[]).some((poly:number[][][])=>pointInPolygon(p,poly)));
const delivery=[];
for(const [id,eras,from,to]of [['G9',['L0','L1','L2','L3'],'0000-01-01','1937-01-01'],['G11',['L4'],'1937-01-01','1961-01-01'],['G16',['L5'],'1961-01-01','9999-01-01']] as const){
 const spec=read(`${d}/residual-${id}-banks.json`),r=reports.find((r:any)=>r.id===id),model=id==='G16'?buildG16Model():tps(r.controlPoints,r.smoothing);
 if(id==='G11')spec.witnesses.push(...read(`${d}/residual-G11-outer.json`).witnesses);
 if(!spec.witnesses?.length)throw Error(`No independent source witnesses ${id}`);
 const layers=[...eras.map(era=>({id:era,features:coastFeatures.filter((f:any)=>f.properties.id===era)})),...control.keyframes.filter((k:any)=>k.t>=from&&k.t<to).map((k:any)=>({id:k.object,features:(feature(control.topology,control.topology.objects[k.object])as any).features}))];
 for(const layer of layers){
  const checks=spec.witnesses.map((w:any)=>{
   const p=w.native??w.pixel,land=covers(layer.features,model.toLngLat(p[0],p[1]));
   if(land!==w.land)throw Error(`${id}/${layer.id}/${w.name}: expected ${w.land?'land':'water'} at source ${p}`);
   return{...w,actualLand:land};
  });
  delivery.push({source:id,layer:layer.id,checks});
 }
}
const baseline=read(`${d}/residual-text-baseline.json`);
const hashValue=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
if(hashValue(control.keyframes)!==baseline.controlMetadata.keyframesSHA256)throw Error('Keyframe dates/metadata changed');
const props=(top:any)=>Object.fromEntries(Object.entries(top.objects).map(([k,o]:any)=>[k,o.geometries.map((g:any)=>g.properties)]));
if(hashValue(props(control.topology))!==baseline.controlMetadata.featurePropertiesSHA256)throw Error('Display labels or feature metadata changed');
const text=Object.entries(baseline.files).map(([path,hash])=>{
 const actual=createHash('sha256').update(readFileSync(`${root}/${path}`)).digest('hex');
 if(actual!==hash)throw Error(`Display/content change: ${path}`);
 return{path,sha256:actual};
});
const guard=read(`${d}/round2-guard.json`);
if(guard.status!=='passed')throw Error('Original rebuild guard failed');
const rebuilt=read(`${d}/round2-rebuild-audit.json`);
if(rebuilt.status!=='passed'||JSON.stringify(guard.publishedAssets)!==JSON.stringify(rebuilt.assets))throw Error('Original guard does not match fresh rebuild receipt');
if(!rebuilt.steps.some((s:any)=>s.name==='north-west-banks')||rebuilt.bankInputs?.length!==4)throw Error('Fresh rebuild omitted native bank tracing');
for(const a of rebuilt.bankInputs){
 const hash=createHash('sha256').update(readFileSync(`${d}/${a.file}`)).digest('hex');
 if(hash!==a.sha256)throw Error(`Native bank measurements changed since rebuild: ${a.file}`);
}
for(const a of guard.publishedAssets){
 const hash=createHash('sha256').update(readFileSync(`${root}/${a.path}`)).digest('hex');
 if(hash!==a.sha256)throw Error(`Stale rebuild guard: ${a.path}`);
}
const report={date:'2026-11-09',status:'passed',method:'Independent original-pixel water/land witnesses transformed by unchanged measured registration; actual decoded delivery tested, including every 1937–1960 and 1961–1965 frame. Exact keyframe properties and all unedited topic file hashes verified.',delivery,textUnchanged:text,originalGuard:'passed'};
writeFileSync(`${d}/residual-guard.json`,JSON.stringify(report,null,2)+'\n');
console.log(`PASS: ${delivery.length} delivery layers, ${delivery.reduce((n,l)=>n+l.checks.length,0)} source witnesses; display text/metadata unchanged; original rebuild guard passed`);
