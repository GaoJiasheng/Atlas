/** Reproject immutable source-bank measurements, before source land restore.
 * No runtime import; no source pixel or ground control is nudged to fit. */
import {readFileSync,writeFileSync}from'node:fs';
import {candidates,evaluate}from'../lib/fit';
import {tps,study}from'./round2-tps';
const d=import.meta.dirname,read=(f:string)=>JSON.parse(readFileSync(`${d}/${f}`,'utf8'));
const fixed=read('georef-fixed-buildings-candidates.json').controlPoints[0];
const reports=[];
for(const id of ['G9','G11']){
 const original=read(`georef-${id}.json`).controlPoints;
 const points=id==='G9'?[...original,{name:fixed.name,svg:fixed.svg,lnglat:fixed.lnglat}]:original;
 const old=candidates('auto',original).map(c=>evaluate(c.proj,c.kind,original)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!;
 const trials=study(points),chosen=trials[0]!;
 const model=tps(points,chosen.smoothing);
 // Warps are only adopted when independent leave-one-out RMS improves.
 const fullAffine=candidates('auto',points).map(c=>evaluate(c.proj,c.kind,points)).sort((a,b)=>a.report.looRmsKm-b.report.looRmsKm)[0]!;
 const adopted=chosen.loo.rmsM<fullAffine.report.looRmsKm*1000;
 const nativeBounds={min:[Infinity,Infinity],max:[-Infinity,-Infinity]};
 function move(p:number[]):number[]{
  let x=5000,y=4000;
  for(let n=0;n<8;n++){
   const a=old.model.toLngLat(x,y),b=old.model.toLngLat(x+1,y),c=old.model.toLngLat(x,y+1),u=p[0]!-a[0],v=p[1]!-a[1],A=b[0]-a[0],B=c[0]-a[0],C=b[1]-a[1],D=c[1]-a[1],det=A*D-B*C;
   x+=(u*D-v*B)/det;y+=(v*A-u*C)/det;
  }
  const q=old.model.toLngLat(x,y);if(Math.hypot(q[0]-p[0]!,q[1]-p[1]!)>1e-8)throw Error('Source inverse failed');
  nativeBounds.min=[Math.min(nativeBounds.min[0]!,x),Math.min(nativeBounds.min[1]!,y)];nativeBounds.max=[Math.max(nativeBounds.max[0]!,x),Math.max(nativeBounds.max[1]!,y)];
  return model.toLngLat(x,y);
 }
 function walk(a:any):any{return typeof a[0]==='number'?move(a):a.map(walk);}
 const file=`work/coast-${id.toLowerCase()}-main.geojson`,fc=read(file);
 if(adopted){for(const f of fc.features)f.geometry.coordinates=walk(f.geometry.coordinates);writeFileSync(`${d}/${file}`,JSON.stringify(fc));}
 reports.push({id,previousControls:original.length,controlPoints:points,model:model.name,adopted,previousLooRmsM:old.report.looRmsKm*1000,...chosen,nativeBounds,
  qualification:id==='G9'?'Added independently named St Andrew’s Cathedral 1861 surviving nave footprint. Native symbol centre, not a geodetic monument; 3-pixel read and map generalisation retained. Modern coordinate is a separately attributed OSM control point only.':'Existing 18 source references retained, including approximate road axes/capes; no new or discarded ground control. Western extrapolation is approximate.',trials});
}
writeFileSync(`${d}/round2-registration.json`,JSON.stringify({date:'2026-11-09',method:'Regularised thin-plate spline. Smoothing selected by independent leave-one-out RMS; fitted RMS is also reported. No strict tolerance imposed.',addedControlEvidence:'georef-fixed-buildings-candidates.json; named source footprint and cached NHB/OSM identity receipts independently inspected.',reports},null,2)+'\n');
console.log(reports.map(r=>({id:r.id,adopted:r.adopted,count:r.controlPoints.length,before:r.previousLooRmsM,after:r.loo.rmsM,smoothing:r.smoothing})));
