/** Candidate diagnostics only. Does not publish geometry. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { candidates, evaluate } from '../lib/fit';
const name=process.argv[2]??'G1';
const dir='scripts/geo/singapore-1819-1965';
const input=JSON.parse(readFileSync(`${dir}/georef-${name}.json`,'utf8'));
const all=candidates(input.projection,input.controlPoints).map(c=>evaluate(c.proj,c.kind,input.controlPoints));
all.sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm);
mkdirSync(`${dir}/work`,{recursive:true});
writeFileSync(`${dir}/work/georef-${name}-fit.json`,JSON.stringify(all[0]!.report,null,2)+'\n');
console.log(JSON.stringify(all.map(x=>({model:x.report.model,rmsKm:x.report.rmsKm,maxKm:x.report.maxKm,looRmsKm:x.report.looRmsKm,looMaxKm:x.report.looMaxKm})),null,2));
if(process.argv.includes('--predict-island')){
 const prior=JSON.parse(readFileSync(`${dir}/work/G16-cp-priors.json`,'utf8'));
 const model=all[0]!.model;
 const result=prior.map((cp:any)=>{let [x,y]=cp.svgPrior;for(let i=0;i<8;i++){const [lng,lat]=model.toLngLat(x,y),[lx,px]=model.toLngLat(x+1,y),[ly,py]=model.toLngLat(x,y+1);const a=lx-lng,b=ly-lng,c=px-lat,d=py-lat,dx=cp.lnglat[0]-lng,dy=cp.lnglat[1]-lat,det=a*d-b*c;x+=(dx*d-b*dy)/det;y+=(a*dy-dx*c)/det;}return {...cp,svgPrior:[Math.round(x),Math.round(y)]};});
 writeFileSync(`${dir}/work/G16-warper-predictions.json`,JSON.stringify(result,null,2));
}
if(process.argv.includes('--guide-g11')){
 const traced=JSON.parse(readFileSync(`${dir}/work/lines-traces.geojson`,'utf8'));
 const source=traced.features.filter((f:any)=>f.properties.map==='coast-g11').flatMap((f:any)=>f.geometry.coordinates);
 const model=all[0]!.model;const via:number[][]=[];let prev:number[]|undefined;
 for(const [lngTarget,latTarget] of source){let x=(lngTarget-103.3106038)/0.000047755,y=(1.6353426-latTarget)/0.00004760;for(let i=0;i<8;i++){const [lng,lat]=model.toLngLat(x,y),[lx,px]=model.toLngLat(x+1,y),[ly,py]=model.toLngLat(x,y+1);const a=lx-lng,b=ly-lng,c=px-lat,d=py-lat,dx=lngTarget-lng,dy=latTarget-lat,det=a*d-b*c;x+=(dx*d-b*dy)/det;y+=(a*dy-dx*c)/det;}if(!prev||Math.hypot(x-prev[0]!,y-prev[1]!)>=32){via.push([Math.round(x),Math.round(y)]);prev=[x,y];}}
 writeFileSync(`${dir}/work/G16-coast-via-from-G11.json`,JSON.stringify({method:'G11 printed-coast trace supplies search guides only; G16 native printed ink is retraced by unchanged shared lines.ts. Guide sourceage and independent shoreline identity review remain failed-acceptance gaps.',via},null,2));
}
